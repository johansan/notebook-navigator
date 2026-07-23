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

import { describe, expect, it, vi } from 'vitest';
import { strings } from '../../src/i18n';
import { addFolderStyleChangeActions } from '../../src/utils/contextMenu/styleMenuBuilder';

interface MenuItemStub {
    title: string;
    setTitle(title: string): MenuItemStub;
    setIcon(icon: string): MenuItemStub;
    onClick(handler: () => void): MenuItemStub;
}

function createMenu(): { menu: { addItem(callback: (item: MenuItemStub) => void): void }; titles: string[] } {
    const titles: string[] = [];
    return {
        menu: {
            addItem(callback): void {
                const item: MenuItemStub = {
                    title: '',
                    setTitle(title): MenuItemStub {
                        this.title = title;
                        return this;
                    },
                    setIcon(): MenuItemStub {
                        return this;
                    },
                    onClick(): MenuItemStub {
                        return this;
                    }
                };
                callback(item);
                titles.push(item.title);
            }
        },
        titles
    };
}

function addActions(folderPath: string, showFolderIcons: boolean): string[] {
    const { menu, titles } = createMenu();
    addFolderStyleChangeActions({
        menu: menu as never,
        app: {} as never,
        metadataService: {
            getFolderIcon: vi.fn(() => undefined),
            getFolderDisplayData: vi.fn(() => ({ displayName: 'Folder' })),
            getSettingsProvider: vi.fn(() => ({ settings: { interfaceIcons: {} } }))
        } as never,
        folderPath,
        showFolderIcons
    });
    return titles;
}

describe('addFolderStyleChangeActions', () => {
    it('keeps the vault root icon action when folder icons are disabled', () => {
        expect(addActions('/', false)).toContain(strings.contextMenu.folder.changeIcon);
    });

    it('hides the icon action for regular folders when folder icons are disabled', () => {
        expect(addActions('Projects', false)).not.toContain(strings.contextMenu.folder.changeIcon);
    });
});
