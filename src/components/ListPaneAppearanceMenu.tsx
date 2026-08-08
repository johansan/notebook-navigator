/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Menu, Platform, TFolder, type MenuItem } from 'obsidian';
import {
    getDefaultListMode,
    getStoredListPaneAppearanceFields,
    hasStoredListPaneAppearanceOverride,
    mergeListPaneAppearanceAndGrouping,
    resolveListPaneAppearance,
    type ListPaneAppearance,
    type ListPaneToggleKey
} from '../settings/listPaneAppearance';
import { strings } from '../i18n';
import type { ListDisplayMode, NotebookNavigatorSettings, TextCountDisplay } from '../settings/types';
import { ItemType } from '../types';
import { runAsyncAction } from '../utils/async';
import { tryCreateSubmenu } from '../utils/contextMenu/menuAsyncHelpers';
import { ensureRecord, sanitizeRecord } from '../utils/recordUtils';
import { resolveUXIconForMenu } from '../utils/uxIcons';
import type { PropertySelectionNodeId } from '../utils/propertyTree';

interface AppearanceMenuProps {
    event: MouseEvent;
    settings: NotebookNavigatorSettings;
    selectedFolder: TFolder | null;
    selectedTag?: string | null;
    selectedProperty?: PropertySelectionNodeId | null;
    selectionType: ItemType;
    updateSettings: (updater: (settings: NotebookNavigatorSettings) => void) => Promise<void>;
    descendantAction?: {
        menuTitle: string;
        onApply: () => void;
        disabled?: boolean;
    };
    defaultSettingsAction?: {
        menuTitle: string;
        onOpen: () => void;
        disabled?: boolean;
    };
}

interface AppearanceRecordAccessor {
    key: string;
    getRecord: (settings: NotebookNavigatorSettings) => Record<string, ListPaneAppearance> | undefined;
    setRecord: (settings: NotebookNavigatorSettings, next: Record<string, ListPaneAppearance>) => void;
}

interface ChoiceOption<T> {
    value: T;
    title: string;
    checked: boolean;
}

interface ContentToggle {
    key: ListPaneToggleKey;
    title: string;
    icon: string;
    globalDefault: boolean;
    /** Toggles are hidden when the current mode or a master setting cannot render the content. */
    available: boolean;
}

export function showListPaneAppearanceMenu({
    event,
    settings,
    selectedFolder,
    selectedTag,
    selectedProperty,
    selectionType,
    updateSettings,
    descendantAction,
    defaultSettingsAction
}: AppearanceMenuProps) {
    const defaultMode: ListDisplayMode = getDefaultListMode(settings);
    const resolveAppearanceAccessor = (): AppearanceRecordAccessor | null => {
        if (selectionType === ItemType.TAG && selectedTag) {
            return {
                key: selectedTag,
                getRecord: targetSettings => targetSettings.tagAppearances,
                setRecord: (targetSettings, next) => {
                    targetSettings.tagAppearances = next;
                }
            };
        }
        if (selectionType === ItemType.FOLDER && selectedFolder) {
            return {
                key: selectedFolder.path,
                getRecord: targetSettings => targetSettings.folderAppearances,
                setRecord: (targetSettings, next) => {
                    targetSettings.folderAppearances = next;
                }
            };
        }
        if (selectionType === ItemType.PROPERTY && selectedProperty) {
            return {
                key: selectedProperty,
                getRecord: targetSettings => targetSettings.propertyAppearances,
                setRecord: (targetSettings, next) => {
                    targetSettings.propertyAppearances = next;
                }
            };
        }
        return null;
    };
    const appearanceAccessor = resolveAppearanceAccessor();

    const updateAppearance = (updates: Partial<ListPaneAppearance>): void => {
        if (!appearanceAccessor) {
            return;
        }

        runAsyncAction(() =>
            updateSettings(currentSettings => {
                const next = sanitizeRecord(ensureRecord(appearanceAccessor.getRecord(currentSettings)));
                const currentAppearance = next[appearanceAccessor.key] ?? {};
                const candidate: ListPaneAppearance = { ...currentAppearance, ...updates };
                const normalizedAppearance = mergeListPaneAppearanceAndGrouping(
                    getStoredListPaneAppearanceFields(candidate),
                    candidate.groupBy
                );
                if (normalizedAppearance) {
                    next[appearanceAccessor.key] = normalizedAppearance;
                } else {
                    delete next[appearanceAccessor.key];
                }
                appearanceAccessor.setRecord(currentSettings, next);
            })
        );
    };

    const menu = new Menu();
    const appearance = appearanceAccessor ? appearanceAccessor.getRecord(settings)?.[appearanceAccessor.key] : undefined;
    const storedFields = getStoredListPaneAppearanceFields(appearance);
    const resolved = resolveListPaneAppearance({ settings, appearance, selectionType });
    const effectiveMode = resolved.mode;
    const isCompact = effectiveMode === 'compact';
    const hasAppearanceOverride = hasStoredListPaneAppearanceOverride(appearance);
    const withSuffix = (label: string, suffix: string | null): string => (suffix ? `${label} ${suffix}` : label);
    // Entries with a per-selection custom value are marked in bold instead of a text suffix.
    // Native menus render fragment titles as plain text without the bold marker; the active state
    // of the appearance toolbar button still shows that the selection is customized.
    const setItemTitle = (item: MenuItem, title: string, isCustom: boolean): void => {
        if (!isCustom) {
            item.setTitle(title);
            return;
        }
        const fragment = createFragment();
        fragment.append(createSpan({ cls: 'nn-menu-title-custom', text: title }));
        item.setTitle(fragment);
    };
    const textCountLabel = (value: TextCountDisplay): string => strings.folderAppearance.textCount.options[value];
    const rowCounts = [1, 2, 3, 4, 5] as const;

    /**
     * Desktop menus use Obsidian's optional submenu API. Mobile and older Obsidian versions receive
     * the same choices as flat indented sections so primary appearance controls are never dropped.
     */
    const addChoiceSection = <T,>({
        title,
        isCustom,
        icon,
        options,
        onSelect
    }: {
        title: string;
        isCustom: boolean;
        icon: string;
        options: readonly ChoiceOption<T>[];
        onSelect: (value: T) => void;
    }): void => {
        let choiceMenu: Menu | null = null;
        menu.addItem(item => {
            setItemTitle(item, title, isCustom);
            item.setIcon(icon);
            if (!Platform.isMobile) {
                choiceMenu = tryCreateSubmenu(item);
            }
            if (!choiceMenu) {
                item.setDisabled(true);
            }
        });

        const destination = choiceMenu ?? menu;
        const indent = choiceMenu ? '' : '    ';
        options.forEach(option => {
            destination.addItem(item => {
                item.setTitle(`${indent}${option.title}`)
                    .setIcon(icon)
                    .setChecked(option.checked)
                    .onClick(() => {
                        onSelect(option.value);
                    });
            });
        });
    };

    menu.addItem(item => {
        item.setTitle(strings.folderAppearance.appearance)
            .setIcon(resolveUXIconForMenu(settings.interfaceIcons, 'list-appearance'))
            .setDisabled(true);
    });

    menu.addItem(item => {
        const label = withSuffix(
            strings.folderAppearance.standardPreset,
            defaultMode === 'standard' ? strings.folderAppearance.defaultSuffix : null
        );
        setItemTitle(item, label, appearance?.mode === 'standard');
        item.setIcon('lucide-list')
            .setChecked(effectiveMode === 'standard')
            .onClick(() => {
                updateAppearance({ mode: defaultMode === 'standard' ? undefined : 'standard' });
            });
    });

    menu.addItem(item => {
        const label = withSuffix(
            strings.folderAppearance.compactPreset,
            defaultMode === 'compact' ? strings.folderAppearance.defaultSuffix : null
        );
        setItemTitle(item, label, appearance?.mode === 'compact');
        item.setIcon('lucide-align-left')
            .setChecked(effectiveMode === 'compact')
            .onClick(() => {
                // Preview and content preferences remain stored because they become active again in Standard mode.
                updateAppearance({ mode: defaultMode === 'compact' ? undefined : 'compact' });
            });
    });

    menu.addSeparator();

    const storedTitleRows = storedFields?.titleRows;
    const effectiveTitleRows = storedTitleRows ?? settings.fileNameRows;
    addChoiceSection<number>({
        title: `${strings.folderAppearance.titleRows.label}: ${resolved.titleRows}`,
        isCustom: storedTitleRows !== undefined,
        icon: 'lucide-text',
        options: rowCounts.slice(0, 3).map(rows => ({
            value: rows,
            title: withSuffix(
                strings.folderAppearance.titleRows.option(rows),
                rows === settings.fileNameRows ? strings.folderAppearance.defaultSuffix : null
            ),
            checked: effectiveTitleRows === rows
        })),
        onSelect: titleRows => updateAppearance({ titleRows: titleRows === settings.fileNameRows ? undefined : titleRows })
    });

    if (settings.showFilePreview && !isCompact) {
        const storedPreviewRows = storedFields?.previewRows;
        const effectivePreviewRows = storedPreviewRows ?? settings.previewRows;
        addChoiceSection<number>({
            title: `${strings.folderAppearance.previewRows.label}: ${
                effectivePreviewRows === 0 ? strings.folderAppearance.previewRows.none : effectivePreviewRows
            }`,
            isCustom: storedPreviewRows !== undefined,
            icon: 'lucide-file-text',
            options: [
                {
                    value: 0,
                    title: strings.folderAppearance.previewRows.none,
                    checked: effectivePreviewRows === 0
                },
                ...rowCounts.map(rows => ({
                    value: rows,
                    title: withSuffix(
                        strings.folderAppearance.previewRows.option(rows),
                        rows === settings.previewRows ? strings.folderAppearance.defaultSuffix : null
                    ),
                    checked: effectivePreviewRows === rows
                }))
            ],
            onSelect: previewRows => updateAppearance({ previewRows: previewRows === settings.previewRows ? undefined : previewRows })
        });
    }

    const contentToggles: ContentToggle[] = [
        {
            key: 'showTags',
            title: strings.folderAppearance.tags,
            icon: resolveUXIconForMenu(settings.interfaceIcons, 'nav-tags'),
            globalDefault: settings.showFileTags,
            // Tag content is only extracted while the master tag setting is on.
            available: settings.showTags && (!isCompact || settings.showFileTagsInCompactMode)
        },
        {
            key: 'showProperties',
            title: strings.folderAppearance.properties,
            icon: resolveUXIconForMenu(settings.interfaceIcons, 'nav-properties'),
            globalDefault: settings.showFileProperties,
            available: !isCompact || settings.showFilePropertiesInCompactMode
        },
        {
            key: 'showTaskProgress',
            title: strings.folderAppearance.tasks,
            icon: resolveUXIconForMenu(settings.interfaceIcons, 'file-unfinished-task'),
            globalDefault: settings.showFileTaskProgress,
            available: !isCompact
        }
    ];
    const visibleToggles = contentToggles.filter(toggle => toggle.available);
    // Property-placed counts render as pills, so the choice is hidden when compact mode hides pills.
    const textCountAvailable = !isCompact || settings.textCountPlacement !== 'property' || settings.showFilePropertiesInCompactMode;
    if (visibleToggles.length > 0 || textCountAvailable) {
        menu.addSeparator();
    }
    visibleToggles.forEach(toggle => {
        const stored = storedFields?.[toggle.key];
        const effective = stored ?? toggle.globalDefault;
        menu.addItem(item => {
            setItemTitle(item, toggle.title, stored !== undefined);
            item.setIcon(toggle.icon)
                .setChecked(effective)
                .onClick(() => {
                    // A toggle matching the global setting is stored as inherited, so it follows future global changes.
                    const next = !effective;
                    const updates: Partial<ListPaneAppearance> = {};
                    updates[toggle.key] = next === toggle.globalDefault ? undefined : next;
                    updateAppearance(updates);
                });
        });
    });
    if (textCountAvailable) {
        const storedTextCount = storedFields?.textCount;
        const effectiveTextCount = resolved.textCountDisplay;
        const countIcon = resolveUXIconForMenu(
            settings.interfaceIcons,
            effectiveTextCount === 'characters' ? 'file-character-count' : 'file-word-count'
        );
        const countOptions = ['none', 'words', 'characters', 'both'] as const;
        addChoiceSection<TextCountDisplay>({
            title: `${strings.folderAppearance.textCount.label}: ${textCountLabel(effectiveTextCount)}`,
            isCustom: storedTextCount !== undefined,
            icon: countIcon,
            options: countOptions.map(textCount => ({
                value: textCount,
                title: withSuffix(
                    textCountLabel(textCount),
                    textCount === settings.textCountDisplay ? strings.folderAppearance.defaultSuffix : null
                ),
                checked: effectiveTextCount === textCount
            })),
            onSelect: textCount => updateAppearance({ textCount: textCount === settings.textCountDisplay ? undefined : textCount })
        });
    }

    if (descendantAction) {
        menu.addSeparator();
        menu.addItem(item => {
            item.setTitle(descendantAction.menuTitle)
                .setIcon('lucide-squares-unite')
                .setDisabled(Boolean(descendantAction.disabled))
                .onClick(() => {
                    descendantAction.onApply();
                });
        });
    }

    if (defaultSettingsAction) {
        menu.addSeparator();
        menu.addItem(item => {
            item.setTitle(strings.folderAppearance.resetAppearance)
                .setIcon('lucide-rotate-ccw')
                .setDisabled(!hasAppearanceOverride)
                .onClick(() => {
                    if (!hasAppearanceOverride) {
                        return;
                    }
                    const updates: Partial<ListPaneAppearance> = {};
                    if (storedFields) {
                        Object.keys(storedFields).forEach(key => {
                            updates[key as keyof typeof storedFields] = undefined;
                        });
                    }
                    updateAppearance(updates);
                });
        });
        menu.addSeparator();
        menu.addItem(item => {
            item.setTitle(defaultSettingsAction.menuTitle)
                .setIcon('lucide-settings')
                .setDisabled(Boolean(defaultSettingsAction.disabled))
                .onClick(() => {
                    defaultSettingsAction.onOpen();
                });
        });
    }

    menu.showAtMouseEvent(event);
}
