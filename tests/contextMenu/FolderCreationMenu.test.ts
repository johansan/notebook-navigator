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
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { buildFolderCreationMenu } from '../../src/utils/contextMenu/folderMenuBuilder';

interface MenuItemStub {
    title: string;
    setTitle(title: string): MenuItemStub;
    setIcon(icon: string): MenuItemStub;
    onClick(handler: () => void): MenuItemStub;
}

function getCreationMenuTitles(canvasEnabled: boolean, basesEnabled: boolean): string[] {
    const titles: string[] = [];
    const menu = {
        addItem(callback: (item: MenuItemStub) => void): void {
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
        },
        addSeparator(): void {}
    };
    const internalPluginStates = new Map([
        ['canvas', { enabled: canvasEnabled }],
        ['bases', { enabled: basesEnabled }]
    ]);

    buildFolderCreationMenu(
        {
            folder: { path: 'Projects', name: 'Projects' } as never,
            menu: menu as never,
            settings: structuredClone(DEFAULT_SETTINGS),
            state: {
                selectionState: {
                    selectionType: 'none',
                    selectedFolder: null,
                    selectedFile: null
                },
                expandedFolders: new Set<string>(),
                expandedTags: new Set<string>(),
                expandedProperties: new Set<string>()
            } as never,
            dispatchers: {
                selectionDispatch: vi.fn(),
                expansionDispatch: vi.fn(),
                uiDispatch: vi.fn()
            },
            services: {
                app: {
                    internalPlugins: {
                        getPluginById: (pluginId: string) => internalPluginStates.get(pluginId)
                    }
                } as never,
                plugin: {} as never,
                isMobile: false,
                fileSystemOps: {} as never,
                metadataService: {} as never,
                tagOperations: {} as never,
                propertyOperations: {} as never,
                tagTreeService: null,
                propertyTreeService: null,
                commandQueue: null,
                shortcuts: null,
                visibility: { includeDescendantNotes: false, showHiddenItems: false }
            }
        },
        'Projects'
    );

    return titles;
}

describe('buildFolderCreationMenu', () => {
    it.each([
        { canvasEnabled: true, basesEnabled: true, showsCanvas: true, showsBase: true },
        { canvasEnabled: false, basesEnabled: true, showsCanvas: false, showsBase: true },
        { canvasEnabled: true, basesEnabled: false, showsCanvas: true, showsBase: false },
        { canvasEnabled: false, basesEnabled: false, showsCanvas: false, showsBase: false }
    ])('shows creation items for enabled core plugins', ({ canvasEnabled, basesEnabled, showsCanvas, showsBase }) => {
        const titles = getCreationMenuTitles(canvasEnabled, basesEnabled);

        expect(titles.includes(strings.contextMenu.folder.newCanvas)).toBe(showsCanvas);
        expect(titles.includes(strings.contextMenu.folder.newBase)).toBe(showsBase);
    });
});
