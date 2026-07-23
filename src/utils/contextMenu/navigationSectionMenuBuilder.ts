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

import React from 'react';
import { App, Menu } from 'obsidian';
import type NotebookNavigatorPlugin from '../../main';
import { ConfirmModal } from '../../modals/ConfirmModal';
import type { NotebookNavigatorSettings } from '../../settings/types';
import { MetadataService } from '../../services/MetadataService';
import {
    NavigationSectionId,
    PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
    RECENT_NOTES_VIRTUAL_FOLDER_ID,
    SHORTCUTS_VIRTUAL_FOLDER_ID,
    TAGGED_TAG_ID,
    TAGS_ROOT_VIRTUAL_FOLDER_ID
} from '../../types';
import { executeCommand } from '../../utils/typeGuards';
import { ensureRecord, isStringRecordValue, sanitizeRecord } from '../../utils/recordUtils';
import { resolveUXIcon, resolveUXIconForMenu, type UXIconId } from '../../utils/uxIcons';
import { addStyleMenu } from './styleMenuBuilder';
import { strings } from '../../i18n';
import { normalizeCanonicalIconId, serializeIconForFrontmatter } from '../../utils/iconizeFormat';
import { runAsyncAction } from '../../utils/async';

interface NavigationSectionShortcutActions {
    shortcutsCount: number;
    tagShortcutKeysByPath: Map<string, string>;
    propertyShortcutKeysByNodeId: Map<string, string>;
    addTagShortcut: (tagPath: string) => Promise<boolean>;
    addPropertyShortcut: (nodeId: string) => Promise<boolean>;
    removeShortcut: (key: string) => Promise<boolean>;
    clearShortcuts: () => Promise<boolean>;
}

interface ShowNavigationSectionContextMenuParams {
    app: App;
    event: React.MouseEvent<HTMLDivElement>;
    sectionId: NavigationSectionId;
    allowSeparator?: boolean;
    metadataService: MetadataService;
    settings: NotebookNavigatorSettings;
    plugin: NotebookNavigatorPlugin;
    pinToggleLabel: string;
    isShortcutsPinned: boolean;
    onToggleShortcutsPin: () => void;
    onConfigurePropertyKeys: () => void;
    shortcutActions: NavigationSectionShortcutActions;
}

interface VirtualRootMenuConfig {
    uxIconId: UXIconId;
    title: string;
}

type VirtualFolderStyleKey = 'virtualFolderColors' | 'virtualFolderBackgroundColors';

function getVirtualRootMenuConfig(sectionId: NavigationSectionId): VirtualRootMenuConfig | null {
    if (sectionId === NavigationSectionId.SHORTCUTS) {
        return {
            uxIconId: 'nav-shortcuts',
            title: strings.navigationPane.shortcutsHeader
        };
    }

    if (sectionId === NavigationSectionId.RECENT) {
        return {
            uxIconId: 'nav-recent-files',
            title: strings.navigationPane.recentFilesHeader
        };
    }

    if (sectionId === NavigationSectionId.TAGS) {
        return {
            uxIconId: 'nav-tags',
            title: strings.tagList.tags
        };
    }

    if (sectionId === NavigationSectionId.PROPERTIES) {
        return {
            uxIconId: 'nav-properties',
            title: strings.navigationPane.properties
        };
    }

    return null;
}

function getVirtualFolderId(sectionId: NavigationSectionId): string | null {
    if (sectionId === NavigationSectionId.SHORTCUTS) {
        return SHORTCUTS_VIRTUAL_FOLDER_ID;
    }

    if (sectionId === NavigationSectionId.RECENT) {
        return RECENT_NOTES_VIRTUAL_FOLDER_ID;
    }

    if (sectionId === NavigationSectionId.TAGS) {
        return TAGS_ROOT_VIRTUAL_FOLDER_ID;
    }

    if (sectionId === NavigationSectionId.PROPERTIES) {
        return PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
    }

    return null;
}

export function showNavigationSectionContextMenu({
    app,
    event,
    sectionId,
    allowSeparator = true,
    metadataService,
    settings,
    plugin,
    pinToggleLabel,
    isShortcutsPinned,
    onToggleShortcutsPin,
    onConfigurePropertyKeys,
    shortcutActions
}: ShowNavigationSectionContextMenuParams): void {
    const isShortcutsSection = sectionId === NavigationSectionId.SHORTCUTS;
    const isTagSection = sectionId === NavigationSectionId.TAGS;
    const isPropertySection = sectionId === NavigationSectionId.PROPERTIES;
    const target: { type: 'section'; id: NavigationSectionId } = { type: 'section', id: sectionId };
    const hasSeparator = allowSeparator ? metadataService.hasNavigationSeparator(target) : false;
    const menu = new Menu();
    let hasActions = false;

    const tagRootShortcutKey = isTagSection ? shortcutActions.tagShortcutKeysByPath.get(TAGGED_TAG_ID) : undefined;
    const propertyRootShortcutKey = isPropertySection
        ? shortcutActions.propertyShortcutKeysByNodeId.get(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID)
        : undefined;
    const rootShortcutKey = tagRootShortcutKey ?? propertyRootShortcutKey;

    if (isPropertySection) {
        menu.addItem(item => {
            item.setTitle(strings.contextMenu.property.addKey)
                .setIcon('lucide-settings-2')
                .onClick(() => {
                    onConfigurePropertyKeys();
                });
        });
        hasActions = true;
        menu.addSeparator();
    }

    const virtualFolderId = getVirtualFolderId(sectionId);
    if (virtualFolderId) {
        const settingsProvider = metadataService.getSettingsProvider();
        const virtualRootMenuConfig = getVirtualRootMenuConfig(sectionId);
        const virtualFolderColor = settingsProvider.settings.virtualFolderColors?.[virtualFolderId];
        const virtualFolderBackgroundColor = settingsProvider.settings.virtualFolderBackgroundColors?.[virtualFolderId];
        const titleOverride = virtualRootMenuConfig?.title ?? '';

        const updateVirtualFolderStyleRecord = (key: VirtualFolderStyleKey, path: string, nextValue: string | null): boolean => {
            const currentRecord = settingsProvider.settings[key];
            const record = ensureRecord(currentRecord, isStringRecordValue);
            if (nextValue === null) {
                if (!Object.prototype.hasOwnProperty.call(record, path)) {
                    return false;
                }

                delete record[path];
                settingsProvider.settings[key] = record;
                return true;
            }

            if (Object.prototype.hasOwnProperty.call(record, path) && record[path] === nextValue) {
                return false;
            }

            record[path] = nextValue;
            settingsProvider.settings[key] = record;
            return true;
        };

        const setVirtualFolderStyle = async (
            path: string,
            updates: { color?: string | null; background?: string | null }
        ): Promise<void> => {
            let didChange = false;

            if (updates.color !== undefined) {
                didChange = updateVirtualFolderStyleRecord('virtualFolderColors', path, updates.color) || didChange;
            }

            if (updates.background !== undefined) {
                didChange = updateVirtualFolderStyleRecord('virtualFolderBackgroundColors', path, updates.background) || didChange;
            }

            if (!didChange) {
                return;
            }

            await settingsProvider.saveSettingsAndUpdate();
        };

        const setVirtualRootIcon = async (uxIconId: UXIconId, iconId: string | null): Promise<void> => {
            const interfaceIcons = sanitizeRecord(settingsProvider.settings.interfaceIcons, isStringRecordValue);
            const defaultIconId = normalizeCanonicalIconId(resolveUXIcon(undefined, uxIconId));
            let didChange = false;

            if (!iconId) {
                if (Object.prototype.hasOwnProperty.call(interfaceIcons, uxIconId)) {
                    delete interfaceIcons[uxIconId];
                    didChange = true;
                }
            } else {
                const canonicalIconId = normalizeCanonicalIconId(iconId);
                const serializedIconId = serializeIconForFrontmatter(canonicalIconId);

                if (!serializedIconId || canonicalIconId === defaultIconId) {
                    if (Object.prototype.hasOwnProperty.call(interfaceIcons, uxIconId)) {
                        delete interfaceIcons[uxIconId];
                        didChange = true;
                    }
                } else if (interfaceIcons[uxIconId] !== serializedIconId) {
                    interfaceIcons[uxIconId] = serializedIconId;
                    didChange = true;
                }
            }

            if (!didChange) {
                return;
            }

            settingsProvider.settings.interfaceIcons = interfaceIcons;
            await settingsProvider.saveSettingsAndUpdate();
        };

        const openAppearanceModal = async (initialTab: 'icon' | 'color' | 'background'): Promise<void> => {
            const { AppearanceModal } = await import('../../modals/AppearanceModal');
            const modal = new AppearanceModal(app, {
                title: titleOverride,
                metadataService,
                initialTab,
                defaultIcon: virtualRootMenuConfig ? resolveUXIcon(undefined, virtualRootMenuConfig.uxIconId) : null,
                icon: virtualRootMenuConfig
                    ? {
                          initial: resolveUXIcon(settingsProvider.settings.interfaceIcons, virtualRootMenuConfig.uxIconId),
                          apply: async iconId => {
                              await setVirtualRootIcon(virtualRootMenuConfig.uxIconId, iconId);
                          }
                      }
                    : undefined,
                color: {
                    initial: virtualFolderColor ?? null,
                    apply: async color => {
                        await setVirtualFolderStyle(virtualFolderId, { color });
                    }
                },
                background: {
                    initial: virtualFolderBackgroundColor ?? null,
                    apply: async color => {
                        await setVirtualFolderStyle(virtualFolderId, { background: color });
                    }
                }
            });
            modal.open();
        };

        if (virtualRootMenuConfig) {
            menu.addItem(item => {
                item.setTitle(strings.contextMenu.folder.changeIcon)
                    .setIcon('lucide-image')
                    .onClick(() => {
                        runAsyncAction(() => openAppearanceModal('icon'));
                    });
            });
        }

        menu.addItem(item => {
            item.setTitle(strings.contextMenu.folder.changeColor)
                .setIcon('lucide-palette')
                .onClick(() => {
                    runAsyncAction(() => openAppearanceModal('color'));
                });
        });

        menu.addItem(item => {
            item.setTitle(strings.contextMenu.folder.changeBackground)
                .setIcon('lucide-paint-bucket')
                .onClick(() => {
                    runAsyncAction(() => openAppearanceModal('background'));
                });
        });

        const hasRemovableVirtualFolderColor = Boolean(virtualFolderColor);
        const hasRemovableVirtualFolderBackground = Boolean(virtualFolderBackgroundColor);

        addStyleMenu({
            menu,
            styleData: {
                color: virtualFolderColor,
                background: virtualFolderBackgroundColor
            },
            hasColor: true,
            hasBackground: true,
            applyStyle: async clipboard => {
                await setVirtualFolderStyle(virtualFolderId, {
                    color: clipboard.color ?? undefined,
                    background: clipboard.background ?? undefined
                });
            },
            removeColor: hasRemovableVirtualFolderColor ? async () => setVirtualFolderStyle(virtualFolderId, { color: null }) : undefined,
            removeBackground: hasRemovableVirtualFolderBackground
                ? async () => setVirtualFolderStyle(virtualFolderId, { background: null })
                : undefined,
            clearStyle:
                hasRemovableVirtualFolderColor && hasRemovableVirtualFolderBackground
                    ? async () => setVirtualFolderStyle(virtualFolderId, { color: null, background: null })
                    : undefined
        });

        hasActions = true;
        menu.addSeparator();
    }

    if (isTagSection || isPropertySection) {
        menu.addItem(item => {
            if (rootShortcutKey) {
                item.setTitle(strings.shortcuts.remove)
                    .setIcon(resolveUXIconForMenu(settings.interfaceIcons, 'nav-shortcuts', 'lucide-star-off'))
                    .onClick(() => {
                        runAsyncAction(() => shortcutActions.removeShortcut(rootShortcutKey));
                    });
                return;
            }

            item.setTitle(strings.shortcuts.add)
                .setIcon(resolveUXIconForMenu(settings.interfaceIcons, 'nav-shortcuts', 'lucide-star'))
                .onClick(() => {
                    runAsyncAction(async () => {
                        if (isTagSection) {
                            await shortcutActions.addTagShortcut(TAGGED_TAG_ID);
                            return;
                        }

                        await shortcutActions.addPropertyShortcut(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID);
                    });
                });
        });
        hasActions = true;
    }

    if (isShortcutsSection) {
        menu.addItem(item => {
            item.setTitle(pinToggleLabel)
                .setIcon(isShortcutsPinned ? 'lucide-pin-off' : 'lucide-pin')
                .onClick(() => {
                    onToggleShortcutsPin();
                });
        });
        hasActions = true;

        const shouldShowSeparatorAction = allowSeparator && !isShortcutsPinned;
        const shouldShowRemoveAll = shortcutActions.shortcutsCount > 0;
        const shouldRenderSecondarySection = shouldShowSeparatorAction || shouldShowRemoveAll;

        if (shouldRenderSecondarySection) {
            menu.addSeparator();
        }

        if (shouldShowSeparatorAction) {
            menu.addItem(item => {
                item.setTitle(hasSeparator ? strings.contextMenu.navigation.removeSeparator : strings.contextMenu.navigation.addSeparator)
                    .setIcon('lucide-separator-horizontal')
                    .onClick(() => {
                        runAsyncAction(async () => {
                            if (hasSeparator) {
                                await metadataService.removeNavigationSeparator(target);
                                return;
                            }

                            await metadataService.addNavigationSeparator(target);
                        });
                    });
            });
            hasActions = true;
        }

        if (shouldShowRemoveAll) {
            if (shouldShowSeparatorAction) {
                menu.addSeparator();
            }

            menu.addItem(item => {
                item.setTitle(strings.shortcuts.removeAll)
                    .setIcon('lucide-trash-2')
                    .setWarning(true)
                    .onClick(() => {
                        const confirmModal = new ConfirmModal(
                            app,
                            strings.shortcuts.removeAll,
                            strings.shortcuts.removeAllConfirm,
                            () => shortcutActions.clearShortcuts(),
                            strings.common.remove
                        );
                        confirmModal.open();
                    });
            });

            hasActions = true;
        }
    } else if (allowSeparator) {
        menu.addItem(item => {
            item.setTitle(hasSeparator ? strings.contextMenu.navigation.removeSeparator : strings.contextMenu.navigation.addSeparator)
                .setIcon('lucide-separator-horizontal')
                .onClick(() => {
                    runAsyncAction(async () => {
                        if (hasSeparator) {
                            await metadataService.removeNavigationSeparator(target);
                            return;
                        }

                        await metadataService.addNavigationSeparator(target);
                    });
                });
        });
        hasActions = true;
    }

    if (isTagSection || isPropertySection) {
        if (hasActions) {
            menu.addSeparator();
        }

        menu.addItem(item => {
            const title = isTagSection
                ? strings.settings.items.scopeTagsToCurrentContext.name
                : strings.settings.items.scopePropertiesToCurrentContext.name;
            const checked = isTagSection ? plugin.settings.scopeTagsToCurrentContext : plugin.settings.scopePropertiesToCurrentContext;

            item.setTitle(title)
                .setIcon('lucide-filter')
                .setChecked(checked)
                .onClick(() => {
                    runAsyncAction(async () => {
                        if (isTagSection) {
                            plugin.settings.scopeTagsToCurrentContext = !plugin.settings.scopeTagsToCurrentContext;
                        } else {
                            plugin.settings.scopePropertiesToCurrentContext = !plugin.settings.scopePropertiesToCurrentContext;
                        }
                        await plugin.saveSettingsAndUpdate();
                    });
                });
        });
        hasActions = true;
    }

    if (isTagSection || isPropertySection) {
        if (hasActions) {
            menu.addSeparator();
        }

        const commandId = isTagSection ? 'navigate-to-tag' : 'navigate-to-property';
        const commandTitle = isTagSection ? strings.commands.navigateToTag : strings.commands.navigateToProperty;
        const commandIcon = isTagSection
            ? resolveUXIconForMenu(settings.interfaceIcons, 'nav-tag', 'lucide-hash')
            : resolveUXIconForMenu(settings.interfaceIcons, 'nav-property', 'lucide-list-filter');
        menu.addItem(item => {
            item.setTitle(commandTitle)
                .setIcon(commandIcon)
                .onClick(() => {
                    executeCommand(app, `${plugin.manifest.id}:${commandId}`);
                });
        });
        hasActions = true;
    }

    if (!hasActions) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    menu.showAtMouseEvent(event.nativeEvent);
}
