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

import { App, Menu, MenuItem } from 'obsidian';
import { strings } from '../../i18n';
import { MetadataService } from '../../services/MetadataService';
import { resolveFolderDisplayName } from '../folderDisplayName';
import { resolveNavigationFolderIcon } from '../uxIcons';
import { setAsyncOnClick, tryCreateSubmenu } from './menuAsyncHelpers';
import { copyStyleToClipboard, getStyleClipboard, hasStyleData, type StyleClipboardData } from './styleClipboard';

/**
 * Configuration for the style submenu
 */
export interface StyleMenuConfig {
    menu: Menu;
    styleData: StyleClipboardData;
    hasIcon?: boolean;
    hasColor?: boolean;
    hasBackground?: boolean;
    showIndividualRemovers?: boolean;
    showClearAction?: boolean;
    applyStyle?: (data: StyleClipboardData) => Promise<void>;
    removeIcon?: () => Promise<void>;
    removeColor?: () => Promise<void>;
    removeBackground?: () => Promise<void>;
    clearStyle?: () => Promise<void>;
}

interface AddFolderStyleMenuParams {
    menu: Menu;
    metadataService: MetadataService;
    folderPath: string;
    inheritFolderColors: boolean;
    showFolderIcons: boolean;
}

interface AddFolderStyleChangeActionsParams {
    menu: Menu;
    app: App;
    metadataService: MetadataService;
    folderPath: string;
    showFolderIcons: boolean;
    defaultIcon?: string;
}

interface FolderStyleMenuData {
    styleData: StyleClipboardData;
    hasRemovableIcon: boolean;
    hasRemovableColor: boolean;
    hasRemovableBackground: boolean;
    hasRemovableStyle: boolean;
    showClearAction: boolean;
}

/**
 * Adds folder icon/color/background actions to a context menu.
 */
export function addFolderStyleChangeActions(params: AddFolderStyleChangeActionsParams): void {
    const { menu, app, metadataService, folderPath, showFolderIcons, defaultIcon } = params;
    const currentFolderIcon = metadataService.getFolderIcon(folderPath) ?? null;
    const resolvedDefaultIcon =
        defaultIcon ??
        resolveNavigationFolderIcon({
            interfaceIcons: metadataService.getSettingsProvider().settings.interfaceIcons,
            isRoot: folderPath === '/',
            hasChildren: false,
            isExpanded: false
        });
    // The root icon remains visible when folder icons are disabled, so its current metadata icon must remain in the preview.
    const previewDefaultIcon = showFolderIcons || folderPath !== '/' ? resolvedDefaultIcon : (currentFolderIcon ?? resolvedDefaultIcon);
    const folderLabel = resolveFolderDisplayName({
        app,
        metadataService,
        settings: metadataService.getSettingsProvider().settings,
        folderPath,
        fallbackName: folderPath.split('/').pop() || folderPath
    });
    const openAppearanceModal = async (initialTab: 'icon' | 'color' | 'background'): Promise<void> => {
        const { AppearanceModal } = await import('../../modals/AppearanceModal');
        const modal = new AppearanceModal(app, {
            title: folderLabel,
            metadataService,
            initialTab,
            defaultIcon: showFolderIcons || folderPath === '/' ? previewDefaultIcon : null,
            icon: showFolderIcons
                ? {
                      initial: currentFolderIcon,
                      apply: async iconId => {
                          if (iconId === null) {
                              await metadataService.removeFolderIcon(folderPath);
                              return;
                          }

                          await metadataService.setFolderIcon(folderPath, iconId);
                      }
                  }
                : undefined,
            color: {
                initial: metadataService.getFolderColor(folderPath) ?? null,
                apply: async color => {
                    if (color === null) {
                        await metadataService.removeFolderColor(folderPath);
                        return;
                    }

                    await metadataService.setFolderColor(folderPath, color);
                }
            },
            background: {
                initial: metadataService.getFolderBackgroundColor(folderPath) ?? null,
                apply: async color => {
                    if (color === null) {
                        await metadataService.removeFolderBackgroundColor(folderPath);
                        return;
                    }

                    await metadataService.setFolderBackgroundColor(folderPath, color);
                }
            }
        });
        modal.open();
    };

    if (showFolderIcons) {
        menu.addItem((item: MenuItem) => {
            setAsyncOnClick(item.setTitle(strings.contextMenu.folder.changeIcon).setIcon('lucide-image'), () => {
                return openAppearanceModal('icon');
            });
        });
    }

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(item.setTitle(strings.contextMenu.folder.changeColor).setIcon('lucide-palette'), () => {
            return openAppearanceModal('color');
        });
    });

    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(item.setTitle(strings.contextMenu.folder.changeBackground).setIcon('lucide-paint-bucket'), () => {
            return openAppearanceModal('background');
        });
    });
}

/**
 * Resolves folder style data and removable actions for Style submenu construction.
 */
function resolveFolderStyleMenuData(
    params: Pick<AddFolderStyleMenuParams, 'metadataService' | 'folderPath' | 'inheritFolderColors'>
): FolderStyleMenuData {
    const { metadataService, folderPath, inheritFolderColors } = params;
    const directFolderDisplayData = metadataService.getFolderDisplayData(folderPath, {
        includeDisplayName: false,
        includeColor: true,
        includeBackgroundColor: true,
        includeIcon: true,
        includeInheritedColors: false
    });
    const shouldResolveInheritedColor = inheritFolderColors && !directFolderDisplayData.color;
    const shouldResolveInheritedBackground = inheritFolderColors && !directFolderDisplayData.backgroundColor;
    const inheritedFolderDisplayData =
        shouldResolveInheritedColor || shouldResolveInheritedBackground
            ? metadataService.getFolderDisplayData(folderPath, {
                  includeDisplayName: false,
                  includeColor: shouldResolveInheritedColor,
                  includeBackgroundColor: shouldResolveInheritedBackground,
                  includeIcon: false,
                  includeInheritedColors: true
              })
            : null;

    const hasRemovableIcon = Boolean(directFolderDisplayData.icon);
    const hasRemovableColor = Boolean(directFolderDisplayData.color);
    const hasRemovableBackground = Boolean(directFolderDisplayData.backgroundColor);
    const removableStyleCount = Number(hasRemovableIcon) + Number(hasRemovableColor) + Number(hasRemovableBackground);

    return {
        styleData: {
            icon: directFolderDisplayData.icon,
            color: directFolderDisplayData.color ?? inheritedFolderDisplayData?.color,
            background: directFolderDisplayData.backgroundColor ?? inheritedFolderDisplayData?.backgroundColor
        },
        hasRemovableIcon,
        hasRemovableColor,
        hasRemovableBackground,
        hasRemovableStyle: hasRemovableIcon || hasRemovableColor || hasRemovableBackground,
        showClearAction: removableStyleCount >= 2
    };
}

/**
 * Adds folder style copy/paste and removal actions to a context menu.
 */
export function addFolderStyleMenu(params: AddFolderStyleMenuParams): void {
    const { menu, metadataService, folderPath, inheritFolderColors, showFolderIcons } = params;
    const folderStyleData = resolveFolderStyleMenuData({
        metadataService,
        folderPath,
        inheritFolderColors
    });

    addStyleMenu({
        menu,
        styleData: folderStyleData.styleData,
        hasIcon: showFolderIcons,
        hasColor: true,
        hasBackground: true,
        showClearAction: folderStyleData.showClearAction,
        applyStyle: async clipboard => {
            const { icon, color, background } = clipboard;
            await metadataService.setFolderStyle(folderPath, {
                icon: icon ?? undefined,
                color: color ?? undefined,
                backgroundColor: background ?? undefined
            });
        },
        removeIcon: folderStyleData.hasRemovableIcon ? async () => metadataService.removeFolderIcon(folderPath) : undefined,
        removeColor: folderStyleData.hasRemovableColor ? async () => metadataService.removeFolderColor(folderPath) : undefined,
        removeBackground: folderStyleData.hasRemovableBackground
            ? async () => metadataService.removeFolderBackgroundColor(folderPath)
            : undefined,
        clearStyle: folderStyleData.hasRemovableStyle
            ? async () =>
                  metadataService.setFolderStyle(folderPath, {
                      icon: null,
                      color: null,
                      backgroundColor: null
                  })
            : undefined
    });
}

/**
 * Adds a Style submenu to a context menu with copy/paste and removal options
 */
export function addStyleMenu(config: StyleMenuConfig): void {
    if (typeof MenuItem.prototype.setSubmenu !== 'function') {
        return;
    }

    const hasIconSupport = Boolean(config.hasIcon);
    const hasColorSupport = Boolean(config.hasColor);
    const hasBackgroundSupport = Boolean(config.hasBackground);

    const clipboard = getStyleClipboard();
    const clipboardData = clipboard?.data;

    const hasSupportedClipboardData = Boolean(
        (hasIconSupport && clipboardData?.icon) ||
        (hasColorSupport && clipboardData?.color) ||
        (hasBackgroundSupport && clipboardData?.background)
    );

    const hasRemovableIcon = Boolean(config.removeIcon && hasIconSupport);
    const hasRemovableColor = Boolean(config.removeColor && hasColorSupport);
    const hasRemovableBackground = Boolean(config.removeBackground && hasBackgroundSupport);
    const removalCount = Number(hasRemovableIcon) + Number(hasRemovableColor) + Number(hasRemovableBackground);
    const hasClearAction = Boolean(config.clearStyle) || removalCount > 0;
    const hasCopyableStyle = hasStyleData(config.styleData);
    const hasPasteableStyle = Boolean(config.applyStyle && hasSupportedClipboardData);
    const hasRemoveActions = removalCount > 0;
    const showIndividualRemovers = (config.showIndividualRemovers ?? true) && hasRemoveActions;
    const showClearAction = config.showClearAction ?? (Boolean(config.clearStyle) || removalCount >= 2);

    if (!hasCopyableStyle && !hasPasteableStyle && !hasClearAction) {
        return;
    }

    config.menu.addItem((item: MenuItem) => {
        const styleSubmenu = tryCreateSubmenu(item);
        if (!styleSubmenu) {
            item.setTitle(strings.contextMenu.style.title).setIcon('lucide-brush').setDisabled(true);
            return;
        }

        item.setTitle(strings.contextMenu.style.title).setIcon('lucide-brush');

        if (hasCopyableStyle) {
            styleSubmenu.addItem(subItem => {
                setAsyncOnClick(subItem.setTitle(strings.contextMenu.style.copy).setIcon('lucide-copy'), async () => {
                    copyStyleToClipboard(config.styleData);
                });
            });
        }

        if (hasPasteableStyle) {
            styleSubmenu.addItem(subItem => {
                setAsyncOnClick(subItem.setTitle(strings.contextMenu.style.paste).setIcon('lucide-clipboard-check'), async () => {
                    const clipboard = getStyleClipboard();
                    if (!clipboard || !hasStyleData(clipboard.data) || !config.applyStyle) {
                        return;
                    }

                    const supportedClipboardData: StyleClipboardData = {
                        icon: hasIconSupport ? clipboard.data.icon : undefined,
                        color: hasColorSupport ? clipboard.data.color : undefined,
                        background: hasBackgroundSupport ? clipboard.data.background : undefined
                    };

                    if (!hasStyleData(supportedClipboardData)) {
                        return;
                    }

                    await config.applyStyle(supportedClipboardData);
                });
            });
        }

        if (showIndividualRemovers && hasRemovableIcon) {
            styleSubmenu.addItem(subItem => {
                setAsyncOnClick(subItem.setTitle(strings.contextMenu.style.removeIcon).setIcon('lucide-image-off'), async () => {
                    await config.removeIcon?.();
                });
            });
        }

        if (showIndividualRemovers && hasRemovableColor) {
            styleSubmenu.addItem(subItem => {
                setAsyncOnClick(subItem.setTitle(strings.contextMenu.style.removeColor).setIcon('lucide-palette'), async () => {
                    await config.removeColor?.();
                });
            });
        }

        if (showIndividualRemovers && hasRemovableBackground) {
            styleSubmenu.addItem(subItem => {
                setAsyncOnClick(subItem.setTitle(strings.contextMenu.style.removeBackground).setIcon('lucide-paint-bucket'), async () => {
                    await config.removeBackground?.();
                });
            });
        }

        if (showClearAction && hasClearAction) {
            styleSubmenu.addItem(subItem => {
                setAsyncOnClick(subItem.setTitle(strings.contextMenu.style.clear).setIcon('lucide-eraser'), async () => {
                    if (config.clearStyle) {
                        // Single clear action path for item types that support unified metadata updates.
                        await config.clearStyle();
                        return;
                    }

                    const actions: Promise<void>[] = [];

                    if (hasRemovableIcon && config.removeIcon) {
                        actions.push(config.removeIcon());
                    }
                    if (hasRemovableColor && config.removeColor) {
                        actions.push(config.removeColor());
                    }
                    if (hasRemovableBackground && config.removeBackground) {
                        actions.push(config.removeBackground());
                    }

                    await Promise.all(actions);
                });
            });
        }
    });
}
