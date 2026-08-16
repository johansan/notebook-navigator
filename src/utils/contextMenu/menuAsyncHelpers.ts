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

import { Menu, MenuItem } from 'obsidian';
import { strings } from '../../i18n';
import { showNotice } from '../noticeUtils';
import { runAsyncAction } from '../async';

export function setAsyncOnClick(item: MenuItem, handler: () => void | Promise<void>): MenuItem {
    return item.onClick(() => {
        runAsyncAction(handler);
    });
}

export function setSubmenuOnClick(rootMenu: Menu, item: MenuItem, handler: () => void | Promise<void>): MenuItem {
    return item.onClick(() => {
        // Obsidian's phone submenu navigation does not close the root menu after a child action,
        // so close it explicitly before the action updates state behind the still-visible menu.
        rootMenu.hide();
        runAsyncAction(handler);
    });
}

export function tryCreateSubmenu(item: MenuItem): Menu | null {
    if (typeof item.setSubmenu !== 'function') {
        return null;
    }

    if (item.setSubmenu.length > 0) {
        const submenu = new Menu();
        try {
            item.setSubmenu(submenu);
            return submenu;
        } catch {
            // ignore and try getter style
        }
    }

    try {
        const maybeMenu = item.setSubmenu();
        if (maybeMenu instanceof Menu) {
            return maybeMenu;
        }
    } catch {
        // ignore
    }

    try {
        const submenu = new Menu();
        item.setSubmenu(submenu);
        return submenu;
    } catch {
        return null;
    }
}

interface CopySubmenuLinkItemsConfig {
    /** Returns the wikilink target text without brackets */
    getLinkText: () => string;
    /** Selects note or file wording for the link item labels */
    isMarkdownFile: boolean;
}

interface CopySubmenuConfig {
    menu: Menu;
    getVaultPath: () => string;
    getObsidianUrl?: () => string;
    getSystemPath?: () => string;
    /** When provided, adds wikilink, footnote link, and embed items above the path items */
    linkItems?: CopySubmenuLinkItemsConfig;
}

export function addCopySubmenu(config: CopySubmenuConfig): boolean {
    if (typeof MenuItem.prototype.setSubmenu !== 'function') {
        return false;
    }

    let addedSubmenu = false;

    config.menu.addItem(item => {
        const submenu = tryCreateSubmenu(item);
        if (!submenu) {
            item.setTitle(strings.contextMenu.copy.title).setIcon('lucide-copy').setDisabled(true);
            return;
        }

        item.setTitle(strings.contextMenu.copy.title).setIcon('lucide-copy');
        addedSubmenu = true;

        const linkItems = config.linkItems;
        if (linkItems) {
            submenu.addItem(subItem => {
                setSubmenuOnClick(
                    config.menu,
                    subItem
                        .setTitle(linkItems.isMarkdownFile ? strings.contextMenu.copy.noteLink : strings.contextMenu.copy.fileLink)
                        .setIcon('lucide-brackets'),
                    async () => {
                        if (await copyToClipboard(`[[${linkItems.getLinkText()}]]`)) {
                            showNotice(strings.fileSystem.notifications.linkCopied, { variant: 'success' });
                        }
                    }
                );
            });

            submenu.addItem(subItem => {
                setSubmenuOnClick(
                    config.menu,
                    subItem
                        .setTitle(
                            linkItems.isMarkdownFile
                                ? strings.contextMenu.copy.noteLinkAsFootnote
                                : strings.contextMenu.copy.fileLinkAsFootnote
                        )
                        .setIcon('lucide-superscript'),
                    async () => {
                        if (await copyToClipboard(`^[[[${linkItems.getLinkText()}]]]`)) {
                            showNotice(strings.fileSystem.notifications.footnoteLinkCopied, { variant: 'success' });
                        }
                    }
                );
            });

            submenu.addItem(subItem => {
                setSubmenuOnClick(
                    config.menu,
                    subItem
                        .setTitle(linkItems.isMarkdownFile ? strings.contextMenu.copy.noteEmbed : strings.contextMenu.copy.fileEmbed)
                        .setIcon('lucide-picture-in-picture-2'),
                    async () => {
                        if (await copyToClipboard(`![[${linkItems.getLinkText()}]]`)) {
                            showNotice(strings.fileSystem.notifications.embedLinkCopied, { variant: 'success' });
                        }
                    }
                );
            });

            submenu.addSeparator();
        }

        if (config.getObsidianUrl) {
            submenu.addItem(subItem => {
                setSubmenuOnClick(config.menu, subItem.setTitle(strings.contextMenu.copy.obsidianUrl).setIcon('lucide-link'), async () => {
                    const deepLink = config.getObsidianUrl?.();
                    if (!deepLink) {
                        return;
                    }

                    if (await copyToClipboard(deepLink)) {
                        showNotice(strings.fileSystem.notifications.deepLinkCopied, { variant: 'success' });
                    }
                });
            });
        }

        submenu.addItem(subItem => {
            setSubmenuOnClick(config.menu, subItem.setTitle(strings.contextMenu.copy.pathFromVaultFolder).setIcon('vault'), async () => {
                const vaultPath = config.getVaultPath();
                if (await copyToClipboard(vaultPath)) {
                    showNotice(strings.fileSystem.notifications.relativePathCopied, { variant: 'success' });
                }
            });
        });

        if (config.getSystemPath) {
            submenu.addItem(subItem => {
                setSubmenuOnClick(
                    config.menu,
                    subItem.setTitle(strings.contextMenu.copy.pathFromSystemRoot).setIcon('lucide-hard-drive'),
                    async () => {
                        const systemPath = config.getSystemPath?.();
                        if (!systemPath) {
                            return;
                        }

                        if (await copyToClipboard(systemPath)) {
                            showNotice(strings.fileSystem.notifications.pathCopied, { variant: 'success' });
                        }
                    }
                );
            });
        }
    });

    return addedSubmenu;
}

async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        showNotice(strings.common.clipboardWriteError, { variant: 'warning' });
        return false;
    }
}
