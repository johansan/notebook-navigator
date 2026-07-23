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

import { MenuItem, TFile } from 'obsidian';
import type { PropertyMenuBuilderParams } from './menuTypes';
import { strings } from '../../i18n';
import { ItemType, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID } from '../../types';
import { setAsyncOnClick, tryCreateSubmenu } from './menuAsyncHelpers';
import { addShortcutRenameMenuItem } from './shortcutRenameMenuItem';
import { addStyleMenu } from './styleMenuBuilder';
import { resolveUXIcon, resolveUXIconForMenu } from '../uxIcons';
import { normalizePropertyNodeId, parsePropertyNodeId } from '../propertyTree';
import { INTERNAL_NOTEBOOK_NAVIGATOR_API } from '../../api/NotebookNavigatorAPI';

function resolvePropertyMenuLabel(params: { propertyNodeId: string; propertyNodeName?: string; keyNodeName?: string }): string {
    const { propertyNodeId, propertyNodeName, keyNodeName } = params;
    const parsed = parsePropertyNodeId(propertyNodeId);
    if (!parsed) {
        return propertyNodeName ?? propertyNodeId;
    }

    if (!parsed.valuePath) {
        return propertyNodeName ?? parsed.key;
    }

    const keyLabel = keyNodeName ?? parsed.key;
    const valueLabel = propertyNodeName ?? parsed.valuePath;
    return `${keyLabel} = ${valueLabel}`;
}

function addPropertyShortcutMenuItems(params: {
    app: PropertyMenuBuilderParams['services']['app'];
    menu: PropertyMenuBuilderParams['menu'];
    settings: PropertyMenuBuilderParams['settings'];
    shortcuts: NonNullable<PropertyMenuBuilderParams['services']['shortcuts']>;
    nodeId: string;
    label: string;
}): void {
    const { app, menu, settings, shortcuts, nodeId, label } = params;
    const { addPropertyShortcut, propertyShortcutKeysByNodeId, removeShortcut, renameShortcut, shortcutMap } = shortcuts;
    const existingShortcutKey = propertyShortcutKeysByNodeId.get(nodeId);

    if (existingShortcutKey) {
        const existingShortcut = shortcutMap.get(existingShortcutKey);
        addShortcutRenameMenuItem({
            app,
            menu,
            shortcutKey: existingShortcutKey,
            defaultLabel: label,
            existingShortcut,
            title: strings.shortcuts.rename,
            placeholder: strings.searchInput.shortcutNamePlaceholder,
            renameShortcut
        });
    }

    menu.addItem((item: MenuItem) => {
        if (existingShortcutKey) {
            setAsyncOnClick(
                item
                    .setTitle(strings.shortcuts.remove)
                    .setIcon(resolveUXIconForMenu(settings.interfaceIcons, 'nav-shortcuts', 'lucide-star-off')),
                async () => {
                    await removeShortcut(existingShortcutKey);
                }
            );
            return;
        }

        setAsyncOnClick(
            item.setTitle(strings.shortcuts.add).setIcon(resolveUXIconForMenu(settings.interfaceIcons, 'nav-shortcuts', 'lucide-star')),
            async () => {
                await addPropertyShortcut(nodeId);
            }
        );
    });
}

/**
 * Builds the context menu for a property key/value node.
 */
export function buildPropertyMenu(params: PropertyMenuBuilderParams): void {
    const { propertyNodeId, menu, services, settings, state, dispatchers, options } = params;
    const { app, metadataService, propertyOperations, propertyTreeService, fileSystemOps, isMobile } = services;
    const { selectionState } = state;
    const { selectionDispatch, uiDispatch } = dispatchers;

    if (propertyNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
        const label = strings.navigationPane.properties;

        if (isMobile) {
            menu.addItem((item: MenuItem) => {
                item.setTitle(label).setIsLabel(true);
            });
            menu.addSeparator();
        }

        const addedMenuExtensions =
            services.plugin.api?.[INTERNAL_NOTEBOOK_NAVIGATOR_API].menus.applyPropertyMenuExtensions({
                menu,
                nodeId: PROPERTIES_ROOT_VIRTUAL_FOLDER_ID
            }) ?? 0;
        if (addedMenuExtensions > 0 && services.shortcuts) {
            menu.addSeparator();
        }

        if (services.shortcuts) {
            addPropertyShortcutMenuItems({
                app,
                menu,
                settings,
                shortcuts: services.shortcuts,
                nodeId: PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
                label
            });
        }

        return;
    }

    const normalizedNodeId = normalizePropertyNodeId(propertyNodeId);
    if (!normalizedNodeId) {
        return;
    }

    const propertyNode = propertyTreeService?.findNode(normalizedNodeId);
    const propertyKey = propertyNode?.kind === 'key' ? propertyNode.key : null;
    const keyNode = propertyNode?.kind === 'key' ? propertyNode : propertyNode ? propertyTreeService?.getKeyNode(propertyNode.key) : null;
    const label = resolvePropertyMenuLabel({
        propertyNodeId: normalizedNodeId,
        propertyNodeName: propertyNode?.name,
        keyNodeName: keyNode?.name
    });

    if (isMobile) {
        menu.addItem((item: MenuItem) => {
            item.setTitle(label).setIsLabel(true);
        });
        menu.addSeparator();
    }

    const ensurePropertySelected = (): boolean => {
        if (selectionState.selectionType === ItemType.PROPERTY && selectionState.selectedProperty === normalizedNodeId) {
            return false;
        }

        selectionDispatch({ type: 'SET_SELECTED_PROPERTY', nodeId: normalizedNodeId });
        return true;
    };

    const handleFileCreation = (file: TFile | null | undefined) => {
        if (!file) {
            return;
        }

        selectionDispatch({ type: 'SET_SELECTED_FILE', file });
        uiDispatch({ type: 'ACTIVATE_PANE', target: 'files' });
    };

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(item.setTitle(strings.contextMenu.folder.newNote).setIcon('lucide-pen-box'), async () => {
            const selectionChanged = ensurePropertySelected();
            const sourcePath = selectionState.selectedFile?.path ?? app.workspace.getActiveFile()?.path ?? '';
            const manualSortContext = await fileSystemOps.getManualSortNewFileContextForTarget('property', normalizedNodeId, {
                waitForSelectionUpdate: selectionChanged
            });
            const createdFile = await fileSystemOps.createNewFileForProperty(
                normalizedNodeId,
                sourcePath,
                settings.createNewNotesInNewTab,
                manualSortContext
            );
            handleFileCreation(createdFile);
        });
    });
    menu.addSeparator();

    const openAppearanceModal = async (initialTab: 'icon' | 'color' | 'background'): Promise<void> => {
        const { AppearanceModal } = await import('../../modals/AppearanceModal');
        const modal = new AppearanceModal(app, {
            title: label,
            metadataService,
            initialTab,
            defaultIcon: settings.showPropertyIcons
                ? resolveUXIcon(
                      settings.interfaceIcons,
                      parsePropertyNodeId(normalizedNodeId)?.valuePath ? 'nav-property-value' : 'nav-property'
                  )
                : null,
            icon: settings.showPropertyIcons
                ? {
                      initial: metadataService.getPropertyIcon(normalizedNodeId) ?? null,
                      apply: async iconId => {
                          if (iconId === null) {
                              await metadataService.removePropertyIcon(normalizedNodeId);
                              return;
                          }

                          await metadataService.setPropertyIcon(normalizedNodeId, iconId);
                      }
                  }
                : undefined,
            color: {
                initial: metadataService.getPropertyColor(normalizedNodeId) ?? null,
                apply: async color => {
                    if (color === null) {
                        await metadataService.removePropertyColor(normalizedNodeId);
                        return;
                    }

                    await metadataService.setPropertyColor(normalizedNodeId, color);
                }
            },
            background: {
                initial: metadataService.getPropertyBackgroundColor(normalizedNodeId) ?? null,
                apply: async color => {
                    if (color === null) {
                        await metadataService.removePropertyBackgroundColor(normalizedNodeId);
                        return;
                    }

                    await metadataService.setPropertyBackgroundColor(normalizedNodeId, color);
                }
            }
        });
        modal.open();
    };

    if (settings.showPropertyIcons) {
        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(item.setTitle(strings.contextMenu.tag.changeIcon).setIcon('lucide-image'), () => {
                return openAppearanceModal('icon');
            });
        });
    }

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(item.setTitle(strings.contextMenu.tag.changeColor).setIcon('lucide-palette'), () => {
            return openAppearanceModal('color');
        });
    });

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(item.setTitle(strings.contextMenu.tag.changeBackground).setIcon('lucide-paint-bucket'), () => {
            return openAppearanceModal('background');
        });
    });

    const propertyIcon = metadataService.getPropertyIcon(normalizedNodeId);
    const propertyColorData = metadataService.getPropertyColorData(normalizedNodeId);
    const propertyColor = propertyColorData.color;
    const propertyBackgroundColor = propertyColorData.background;
    const directPropertyIcon = settings.propertyIcons?.[normalizedNodeId];
    const directPropertyColor = settings.propertyColors?.[normalizedNodeId];
    const directPropertyBackground = settings.propertyBackgroundColors?.[normalizedNodeId];

    addStyleMenu({
        menu,
        styleData: {
            icon: propertyIcon,
            color: propertyColor,
            background: propertyBackgroundColor
        },
        hasIcon: settings.showPropertyIcons,
        hasColor: true,
        hasBackground: true,
        applyStyle: async clipboard => {
            const { icon, color, background } = clipboard;
            const actions: Promise<void>[] = [];

            if (icon) {
                actions.push(metadataService.setPropertyIcon(normalizedNodeId, icon));
            }
            if (color) {
                actions.push(metadataService.setPropertyColor(normalizedNodeId, color));
            }
            if (background) {
                actions.push(metadataService.setPropertyBackgroundColor(normalizedNodeId, background));
            }

            await Promise.all(actions);
        },
        removeIcon: directPropertyIcon ? async () => metadataService.removePropertyIcon(normalizedNodeId) : undefined,
        removeColor: directPropertyColor ? async () => metadataService.removePropertyColor(normalizedNodeId) : undefined,
        removeBackground: directPropertyBackground ? async () => metadataService.removePropertyBackgroundColor(normalizedNodeId) : undefined
    });

    if (typeof MenuItem.prototype.setSubmenu === 'function') {
        menu.addSeparator();

        menu.addItem((item: MenuItem) => {
            const currentOverride = metadataService.getPropertyChildSortOrderOverride(normalizedNodeId);
            const effectiveOrder = currentOverride ?? settings.propertySortOrder;
            const sortIcon = currentOverride
                ? effectiveOrder.endsWith('-desc')
                    ? 'lucide-sort-desc'
                    : 'lucide-sort-asc'
                : 'lucide-sliders-horizontal';

            const sortOrderSubmenu = tryCreateSubmenu(item);
            if (!sortOrderSubmenu) {
                item.setTitle(strings.paneHeader.changeChildSortOrder).setIcon(sortIcon).setDisabled(true);
                return;
            }

            const globalDefaultLabel = (() => {
                switch (settings.propertySortOrder) {
                    case 'alpha-desc':
                        return strings.settings.items.propertySortOrder.options.alphaDesc;
                    case 'frequency-asc':
                        return strings.settings.items.propertySortOrder.options.lowToHigh;
                    case 'frequency-desc':
                        return strings.settings.items.propertySortOrder.options.highToLow;
                    case 'alpha-asc':
                    default:
                        return strings.settings.items.propertySortOrder.options.alphaAsc;
                }
            })();

            item.setTitle(strings.paneHeader.changeChildSortOrder).setIcon(sortIcon);

            sortOrderSubmenu.addItem(subItem => {
                subItem.setTitle(`${strings.folderAppearance.defaultLabel} (${globalDefaultLabel})`).setChecked(!currentOverride);
                setAsyncOnClick(subItem, async () => {
                    await metadataService.removePropertyChildSortOrderOverride(normalizedNodeId);
                    app.workspace.requestSaveLayout();
                });
            });

            sortOrderSubmenu.addSeparator();

            sortOrderSubmenu.addItem(subItem => {
                subItem.setTitle(strings.settings.items.propertySortOrder.options.alphaAsc).setChecked(currentOverride === 'alpha-asc');
                setAsyncOnClick(subItem, async () => {
                    await metadataService.setPropertyChildSortOrderOverride(normalizedNodeId, 'alpha-asc');
                    app.workspace.requestSaveLayout();
                });
            });

            sortOrderSubmenu.addItem(subItem => {
                subItem.setTitle(strings.settings.items.propertySortOrder.options.alphaDesc).setChecked(currentOverride === 'alpha-desc');
                setAsyncOnClick(subItem, async () => {
                    await metadataService.setPropertyChildSortOrderOverride(normalizedNodeId, 'alpha-desc');
                    app.workspace.requestSaveLayout();
                });
            });
        });
    }

    const disableNavigationSeparatorActions = Boolean(options?.disableNavigationSeparatorActions);
    const shouldAddShortcutSectionSeparator = Boolean(services.shortcuts) || !disableNavigationSeparatorActions;
    if (shouldAddShortcutSectionSeparator) {
        menu.addSeparator();
    }

    if (services.shortcuts) {
        addPropertyShortcutMenuItems({
            app,
            menu,
            settings,
            shortcuts: services.shortcuts,
            nodeId: normalizedNodeId,
            label
        });
    }

    if (!disableNavigationSeparatorActions) {
        const propertySeparatorTarget = { type: 'property', nodeId: normalizedNodeId } as const;
        const hasSeparator = metadataService.hasNavigationSeparator(propertySeparatorTarget);

        menu.addItem((item: MenuItem) => {
            const title = hasSeparator ? strings.contextMenu.navigation.removeSeparator : strings.contextMenu.navigation.addSeparator;
            setAsyncOnClick(item.setTitle(title).setIcon('lucide-separator-horizontal'), async () => {
                if (hasSeparator) {
                    await metadataService.removeNavigationSeparator(propertySeparatorTarget);
                    return;
                }
                await metadataService.addNavigationSeparator(propertySeparatorTarget);
            });
        });
    }

    const canManagePropertyKey = propertyNode?.kind === 'key' && propertyNode.notesWithValue.size > 0;
    const addedMenuExtensions =
        services.plugin.api?.[INTERNAL_NOTEBOOK_NAVIGATOR_API].menus.applyPropertyMenuExtensions({ menu, nodeId: normalizedNodeId }) ?? 0;
    if (addedMenuExtensions > 0 && canManagePropertyKey) {
        menu.addSeparator();
    }

    if (propertyKey && canManagePropertyKey) {
        if (addedMenuExtensions === 0) {
            menu.addSeparator();
        }

        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(item.setTitle(strings.contextMenu.property.renameKey).setIcon('lucide-pencil'), async () => {
                await propertyOperations.promptRenamePropertyKey(propertyKey);
            });
        });

        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(item.setTitle(strings.contextMenu.property.deleteKey).setIcon('lucide-trash').setWarning(true), async () => {
                await propertyOperations.promptDeletePropertyKey(propertyKey);
            });
        });
    }
}
