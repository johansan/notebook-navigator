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

import { Menu, TFolder } from 'obsidian';
import { strings } from '../i18n';
import { FolderAppearance, getDefaultListMode, resolveListMode } from '../hooks/useListPaneAppearance';
import type { ListDisplayMode } from '../settings/types';
import { NotebookNavigatorSettings } from '../settings';
import { ItemType } from '../types';
import { runAsyncAction } from '../utils/async';
import { ensureRecord, sanitizeRecord } from '../utils/recordUtils';
import type { PropertySelectionNodeId } from '../utils/propertyTree';

interface AppearanceMenuProps {
    event: MouseEvent;
    settings: NotebookNavigatorSettings;
    selectedFolder: TFolder | null;
    selectedTag?: string | null;
    selectedProperty?: PropertySelectionNodeId | null;
    selectionType?: ItemType;
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
    getRecord: (settings: NotebookNavigatorSettings) => Record<string, FolderAppearance> | undefined;
    setRecord: (settings: NotebookNavigatorSettings, next: Record<string, FolderAppearance>) => void;
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

    const updateAppearance = (updates: Partial<FolderAppearance>) => {
        const normalizeAppearance = (appearance: FolderAppearance) => {
            const normalized = { ...appearance };
            (Object.keys(normalized) as (keyof FolderAppearance)[]).forEach(key => {
                if (normalized[key] === undefined) {
                    delete normalized[key];
                }
            });
            if (normalized.mode === defaultMode) {
                delete normalized.mode;
            }
            return normalized;
        };

        if (!appearanceAccessor) {
            return;
        }

        runAsyncAction(() =>
            updateSettings(s => {
                const next = sanitizeRecord(ensureRecord(appearanceAccessor.getRecord(s)));
                const currentAppearance = next[appearanceAccessor.key] || {};
                const normalizedAppearance = normalizeAppearance({ ...currentAppearance, ...updates });
                if (Object.keys(normalizedAppearance).length === 0) {
                    delete next[appearanceAccessor.key];
                } else {
                    next[appearanceAccessor.key] = normalizedAppearance;
                }

                appearanceAccessor.setRecord(s, next);
            })
        );
    };

    const menu = new Menu();

    // Get custom appearance settings for the selected folder/tag
    // Will be undefined if no custom appearance has been set
    const appearance = appearanceAccessor ? appearanceAccessor.getRecord(settings)?.[appearanceAccessor.key] : undefined;
    const effectiveMode = resolveListMode({ appearance, defaultMode });

    const isStandard = effectiveMode === 'standard';
    const isCompact = effectiveMode === 'compact';

    menu.addItem(item => {
        item.setTitle(strings.folderAppearance.appearance).setIcon('lucide-palette').setDisabled(true);
    });

    // Standard preset
    menu.addItem(item => {
        const label =
            defaultMode === 'standard'
                ? `${strings.folderAppearance.standardPreset} ${strings.folderAppearance.defaultSuffix}`
                : strings.folderAppearance.standardPreset;
        item.setTitle(label)
            .setIcon('lucide-list')
            .setChecked(isStandard)
            .onClick(() => {
                updateAppearance({ mode: 'standard' });
            });
    });

    // Compact preset
    menu.addItem(item => {
        const label =
            defaultMode === 'compact'
                ? `${strings.folderAppearance.compactPreset} ${strings.folderAppearance.defaultSuffix}`
                : strings.folderAppearance.compactPreset;
        item.setTitle(label)
            .setIcon('lucide-align-left')
            .setChecked(isCompact)
            .onClick(() => {
                updateAppearance({ mode: 'compact', previewRows: undefined });
            });
    });

    menu.addSeparator();

    // Title rows header
    menu.addItem(item => {
        item.setTitle(strings.folderAppearance.titleRows).setIcon('lucide-text').setDisabled(true);
    });

    // Default title rows option
    menu.addItem(item => {
        const hasCustomTitleRows = appearance?.titleRows !== undefined;
        const isDefaultTitle = !hasCustomTitleRows;
        item.setTitle(`    ${strings.folderAppearance.defaultTitleOption(settings.fileNameRows)}`)
            .setIcon('lucide-text')
            .setChecked(isDefaultTitle)
            .onClick(() => {
                updateAppearance({ titleRows: undefined });
            });
    });

    // Title row options
    [1, 2, 3].forEach(rows => {
        menu.addItem(item => {
            const isChecked = appearance?.titleRows === rows;
            item.setTitle(`    ${strings.folderAppearance.titleRowOption(rows)}`)
                .setIcon('lucide-text')
                .setChecked(isChecked)
                .onClick(() => {
                    updateAppearance({ titleRows: rows });
                });
        });
    });

    if (settings.showFilePreview && !isCompact) {
        menu.addSeparator();

        // Preview rows header
        menu.addItem(item => {
            item.setTitle(strings.folderAppearance.previewRows).setIcon('lucide-file-text').setDisabled(true);
        });

        // Default preview rows option
        menu.addItem(item => {
            const hasCustomPreviewRows = appearance?.previewRows !== undefined;
            const isDefaultPreview = !hasCustomPreviewRows;
            item.setTitle(`    ${strings.folderAppearance.defaultPreviewOption(settings.previewRows)}`)
                .setIcon('lucide-file-text')
                .setChecked(isDefaultPreview)
                .onClick(() => {
                    updateAppearance({ previewRows: undefined });
                });
        });

        // Preview row options
        [1, 2, 3, 4, 5].forEach(rows => {
            menu.addItem(item => {
                const hasCustomPreviewRows = appearance?.previewRows !== undefined;
                const isChecked = hasCustomPreviewRows && appearance?.previewRows === rows;
                item.setTitle(`    ${strings.folderAppearance.previewRowOption(rows)}`)
                    .setIcon('lucide-file-text')
                    .setChecked(isChecked)
                    .onClick(() => {
                        updateAppearance({ previewRows: rows });
                    });
            });
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
