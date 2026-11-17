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

import { describe, expect, it } from 'vitest';
import { TFolder } from 'obsidian';
import { NavigationPaneItemType } from '../../src/types';
import type { CombinedNavigationItem } from '../../src/types/virtualization';
import type { PropertyTreeNode, TagTreeNode } from '../../src/types/storage';
import { NAV_RAINBOW_DEFAULT_THEME_ID, findNavRainbowTheme } from '../../src/settings/navRainbowThemes';
import type { NavRainbowTheme } from '../../src/settings/types';
import { buildRainbowPalette, parseCssColor, type RGBA } from '../../src/utils/colorUtils';
import {
    applyRainbowOverlay,
    buildFolderRainbowColorsFromSiblingPaths,
    buildNavigationRainbowPalettes,
    buildNavRainbowThemePalette,
    buildFolderRainbowColors,
    buildPropertyRainbowColors,
    buildTagRainbowColors,
    resolveFolderRainbowColor,
    resolveFolderRainbowDecorationColors,
    type NavigationRainbowSectionThemes
} from '../../src/utils/navigationRainbow';

function createBlackToWhitePalette(): string[] {
    return buildRainbowPalette({
        steps: 1024,
        stops: [
            { color: { r: 0, g: 0, b: 0, a: 1 }, position: 0 },
            { color: { r: 255, g: 255, b: 255, a: 1 }, position: 1 }
        ],
        style: 'rgb'
    });
}

function createTestTFolder(path: string): TFolder {
    const folder = new TFolder();
    folder.path = path;
    folder.name = path === '/' ? '/' : (path.split('/').pop() ?? path);
    return folder;
}

function createTagNode(path: string): TagTreeNode {
    const name = path.split('/').pop() ?? path;
    return {
        name,
        path,
        displayPath: path,
        children: new Map(),
        notesWithTag: new Set()
    };
}

function createTagItem(path: string, level: number): CombinedNavigationItem {
    return {
        type: NavigationPaneItemType.TAG,
        data: createTagNode(path),
        level,
        key: path
    };
}

function createFolderItem(path: string, level: number): CombinedNavigationItem {
    return {
        type: NavigationPaneItemType.FOLDER,
        data: createTestTFolder(path),
        level,
        path,
        key: path,
        isExcluded: false
    };
}

function createPropertyNode(params: {
    id: `key:${string}` | `key:${string}=${string}`;
    kind: 'key' | 'value';
    key: string;
    valuePath: string | null;
    name: string;
}): PropertyTreeNode {
    return {
        id: params.id,
        kind: params.kind,
        key: params.key,
        valuePath: params.valuePath,
        name: params.name,
        displayPath: params.name,
        children: new Map(),
        notesWithValue: new Set()
    };
}

function createPropertyKeyItem(id: `key:${string}`, key: string, level: number): CombinedNavigationItem {
    return {
        type: NavigationPaneItemType.PROPERTY_KEY,
        data: createPropertyNode({
            id,
            kind: 'key',
            key,
            valuePath: null,
            name: key
        }),
        level,
        key: id
    };
}

function createPropertyValueItem(id: `key:${string}=${string}`, key: string, valuePath: string, level: number): CombinedNavigationItem {
    return {
        type: NavigationPaneItemType.PROPERTY_VALUE,
        data: createPropertyNode({
            id,
            kind: 'value',
            key,
            valuePath,
            name: valuePath
        }),
        level,
        key: id
    };
}

describe('navigationRainbow', () => {
    it('colors the root folder when folder scope is all', () => {
        const palette = createBlackToWhitePalette();

        const items: CombinedNavigationItem[] = [
            {
                type: NavigationPaneItemType.FOLDER,
                data: createTestTFolder('/'),
                level: 0,
                path: '/',
                key: '/',
                isExcluded: false
            },
            {
                type: NavigationPaneItemType.FOLDER,
                data: createTestTFolder('A'),
                level: 1,
                path: 'A',
                key: 'A',
                isExcluded: false
            },
            {
                type: NavigationPaneItemType.FOLDER,
                data: createTestTFolder('B'),
                level: 1,
                path: 'B',
                key: 'B',
                isExcluded: false
            }
        ];

        const folderRainbow = buildFolderRainbowColors({
            items,
            palette,
            scope: 'all',
            showRootFolder: true,
            rootLevel: 1,
            inheritColors: false
        });

        expect(folderRainbow.rootColor).toBe(palette[0]);
        expect(folderRainbow.colorsByPath.get('A')).toBe(palette[0]);
        expect(folderRainbow.colorsByPath.get('B')).toBe(palette[palette.length - 1]);

        const applied = applyRainbowOverlay({
            mode: 'foreground',
            rainbowColor: folderRainbow.rootColor,
            color: undefined,
            backgroundColor: undefined
        });

        expect(applied.color).toBe(palette[0]);
    });

    it('does not overwrite existing colors', () => {
        const applied = applyRainbowOverlay({
            mode: 'foreground',
            rainbowColor: 'rgba(1, 2, 3, 1)',
            color: 'rgb(10, 10, 10)',
            backgroundColor: undefined
        });

        expect(applied.color).toBe('rgb(10, 10, 10)');
        expect(applied.backgroundColor).toBeUndefined();
    });

    it('keeps tag root colors aligned between root and all scopes when virtual root is shown', () => {
        const palette = createBlackToWhitePalette();

        const items: CombinedNavigationItem[] = [createTagItem('alpha', 1), createTagItem('beta', 1), createTagItem('alpha/child', 2)];

        const rootScope = buildTagRainbowColors({
            items,
            palette,
            scope: 'root',
            rootLevel: 1,
            showAllTagsFolder: true,
            inheritColors: false
        });
        const allScope = buildTagRainbowColors({
            items,
            palette,
            scope: 'all',
            rootLevel: 1,
            showAllTagsFolder: true,
            inheritColors: false
        });

        expect(rootScope.rootColor).toBe(palette[0]);
        expect(allScope.rootColor).toBe(palette[0]);
        expect(rootScope.colorsByPath.get('alpha')).toBe(allScope.colorsByPath.get('alpha'));
        expect(rootScope.colorsByPath.get('beta')).toBe(allScope.colorsByPath.get('beta'));
    });

    it('keeps property root colors aligned between root and all scopes when virtual root is shown', () => {
        const palette = createBlackToWhitePalette();

        const items: CombinedNavigationItem[] = [
            createPropertyKeyItem('key:status', 'status', 1),
            createPropertyKeyItem('key:type', 'type', 1),
            createPropertyValueItem('key:status=todo', 'status', 'todo', 2)
        ];

        const rootScope = buildPropertyRainbowColors({
            items,
            palette,
            scope: 'root',
            showAllPropertiesFolder: true
        });
        const allScope = buildPropertyRainbowColors({
            items,
            palette,
            scope: 'all',
            showAllPropertiesFolder: true
        });

        expect(rootScope.rootColor).toBe(palette[0]);
        expect(allScope.rootColor).toBe(palette[0]);
        expect(rootScope.colorsByNodeId.get('key:status')).toBe(allScope.colorsByNodeId.get('key:status'));
        expect(rootScope.colorsByNodeId.get('key:type')).toBe(allScope.colorsByNodeId.get('key:type'));
    });

    it('inherits folder rainbow color from nearest root-scoped ancestor', () => {
        const palette = createBlackToWhitePalette();

        const items: CombinedNavigationItem[] = [
            createFolderItem('/', 0),
            createFolderItem('A', 1),
            createFolderItem('B', 1),
            createFolderItem('A/child', 2),
            createFolderItem('A/child/grandchild', 3)
        ];

        const folderRainbow = buildFolderRainbowColors({
            items,
            palette,
            scope: 'root',
            showRootFolder: true,
            rootLevel: 1,
            inheritColors: true
        });

        const parentColor = folderRainbow.colorsByPath.get('A');
        expect(parentColor).toBeDefined();
        expect(folderRainbow.getInheritedColor('A/child')).toBe(parentColor);
        expect(folderRainbow.getInheritedColor('A/child/grandchild')).toBe(parentColor);
    });

    it('builds precomputed folder rainbow colors from sibling paths', () => {
        const palette = createBlackToWhitePalette();

        const folderRainbow = buildFolderRainbowColorsFromSiblingPaths({
            siblingPathsByParent: new Map<string, readonly string[]>([
                ['/', ['A', 'B']],
                ['A', ['A/child']]
            ]),
            palette,
            scope: 'root',
            showRootFolder: true,
            inheritColors: true
        });

        expect(resolveFolderRainbowColor({ folderPath: 'A', scope: 'root', showRootFolder: true, colors: folderRainbow })).toBeDefined();
        expect(resolveFolderRainbowColor({ folderPath: 'A/child', scope: 'root', showRootFolder: true, colors: folderRainbow })).toBe(
            resolveFolderRainbowColor({ folderPath: 'A', scope: 'root', showRootFolder: true, colors: folderRainbow })
        );
    });

    it('keeps direct folder colors when rainbow foreground mode is active', () => {
        const palette = createBlackToWhitePalette();
        const folderRainbow = buildFolderRainbowColorsFromSiblingPaths({
            siblingPathsByParent: new Map<string, readonly string[]>([['/', ['A', 'B']]]),
            palette,
            scope: 'root',
            showRootFolder: true,
            inheritColors: false
        });

        const resolved = resolveFolderRainbowDecorationColors({
            mode: 'foreground',
            folderPath: 'A',
            color: 'rgb(12, 34, 56)',
            backgroundColor: undefined,
            scope: 'root',
            showRootFolder: true,
            colors: folderRainbow
        });

        expect(resolved.color).toBe('rgb(12, 34, 56)');
    });

    it('applies folder rainbow background when background mode is active', () => {
        const palette = createBlackToWhitePalette();

        const folderRainbow = buildFolderRainbowColorsFromSiblingPaths({
            siblingPathsByParent: new Map<string, readonly string[]>([['/', ['A', 'B']]]),
            palette,
            scope: 'root',
            showRootFolder: true,
            inheritColors: false
        });

        const resolved = resolveFolderRainbowDecorationColors({
            mode: 'background',
            folderPath: 'A',
            color: undefined,
            backgroundColor: undefined,
            scope: 'root',
            showRootFolder: true,
            colors: folderRainbow
        });

        expect(resolved.color).toBeUndefined();
        expect(resolved.backgroundColor).toBeDefined();
    });

    it('inherits tag rainbow color from nearest root-scoped ancestor', () => {
        const palette = createBlackToWhitePalette();

        const items: CombinedNavigationItem[] = [
            createTagItem('alpha', 1),
            createTagItem('beta', 1),
            createTagItem('alpha/child', 2),
            createTagItem('alpha/child/grandchild', 3)
        ];

        const tagRainbow = buildTagRainbowColors({
            items,
            palette,
            scope: 'root',
            rootLevel: 1,
            showAllTagsFolder: true,
            inheritColors: true
        });

        const parentColor = tagRainbow.colorsByPath.get('alpha');
        expect(parentColor).toBeDefined();
        expect(tagRainbow.getInheritedColor('alpha/child')).toBe(parentColor);
        expect(tagRainbow.getInheritedColor('alpha/child/grandchild')).toBe(parentColor);
    });

    it('does not assign key colors when property scope is child', () => {
        const palette = createBlackToWhitePalette();

        const items: CombinedNavigationItem[] = [
            createPropertyKeyItem('key:status', 'status', 1),
            createPropertyValueItem('key:status=todo', 'status', 'todo', 2),
            createPropertyValueItem('key:status=done', 'status', 'done', 2)
        ];

        const propertyRainbow = buildPropertyRainbowColors({
            items,
            palette,
            scope: 'child',
            showAllPropertiesFolder: true
        });

        expect(propertyRainbow.colorsByNodeId.has('key:status')).toBe(false);
        expect(propertyRainbow.colorsByNodeId.has('key:status=todo')).toBe(true);
        expect(propertyRainbow.colorsByNodeId.has('key:status=done')).toBe(true);
    });
});

describe('rainbow theme palettes', () => {
    function createTheme(overrides: Partial<NavRainbowTheme> = {}): NavRainbowTheme {
        return {
            id: 'custom-test',
            name: 'Test',
            stops: [
                { color: '#111111', position: 0 },
                { color: '#222222', position: 100 }
            ],
            darkStops: [
                { color: '#aaaaaa', position: 0 },
                { color: '#bbbbbb', position: 100 }
            ],
            separateDarkStops: false,
            transitionStyle: 'rgb',
            consistentBrightness: true,
            ...overrides
        };
    }

    function shortcutThemes(theme: NavRainbowTheme | null): NavigationRainbowSectionThemes {
        return { folder: null, tag: null, property: null, shortcut: theme, recent: null };
    }

    function parse(color: string): RGBA {
        const parsed = parseCssColor(color);
        if (!parsed) {
            throw new Error(`Invalid test color ${color}`);
        }
        return parsed;
    }

    it('keeps the legacy default gradient for the Rainbow theme', () => {
        const rainbow = findNavRainbowTheme([], NAV_RAINBOW_DEFAULT_THEME_ID);
        if (!rainbow) {
            throw new Error('Missing Rainbow theme');
        }

        const palette = buildNavRainbowThemePalette(rainbow, false);

        // Values produced by the single-gradient palette builder that two-stop themes replace
        expect([0, 341, 512, 1023].map(index => palette[index])).toEqual([
            'rgba(239, 68, 68, 1)',
            'rgba(126, 135, 0, 1)',
            'rgba(0, 146, 93, 1)',
            'rgba(139, 92, 246, 1)'
        ]);
    });

    it('reuses light colors in dark mode when separate theme colors are off', () => {
        const themes = shortcutThemes(createTheme());
        const dark = buildNavigationRainbowPalettes({ mode: 'foreground', intensity: 100, themes, isDarkTheme: true });
        const light = buildNavigationRainbowPalettes({ mode: 'foreground', intensity: 100, themes, isDarkTheme: false });

        expect(dark.shortcut?.[0]).toBe('rgba(17, 17, 17, 1)');
        expect(light.shortcut?.[0]).toBe('rgba(17, 17, 17, 1)');
    });

    it('uses dark colors in dark mode when separate theme colors are on', () => {
        const themes = shortcutThemes(createTheme({ separateDarkStops: true }));
        const dark = buildNavigationRainbowPalettes({ mode: 'foreground', intensity: 100, themes, isDarkTheme: true });
        const light = buildNavigationRainbowPalettes({ mode: 'foreground', intensity: 100, themes, isDarkTheme: false });

        expect(dark.shortcut?.[0]).toBe('rgba(170, 170, 170, 1)');
        expect(light.shortcut?.[0]).toBe('rgba(17, 17, 17, 1)');
    });

    it('changes hue palettes when luminance balancing is off', () => {
        const stops = [
            { color: '#ff0000', position: 0 },
            { color: '#0000ff', position: 100 }
        ];
        const balanced = buildNavRainbowThemePalette(createTheme({ stops, transitionStyle: 'hue', consistentBrightness: true }), false);
        const simple = buildNavRainbowThemePalette(createTheme({ stops, transitionStyle: 'hue', consistentBrightness: false }), false);

        expect(balanced[512]).not.toBe(simple[512]);
    });

    it('applies the rainbow color intensity to background and text colors', () => {
        const themes = shortcutThemes(createTheme());
        const build = (mode: 'foreground' | 'background', intensity: number) =>
            buildNavigationRainbowPalettes({ mode, intensity, themes, isDarkTheme: false }).shortcut;

        expect(build('background', 100)?.[0]).toBe('rgba(17, 17, 17, 1)');
        expect(build('background', 50)?.[0]).toBe('#11111180');
        expect(build('foreground', 50)?.[0]).toBe('color-mix(in srgb, rgba(17, 17, 17, 1) 50%, var(--nn-theme-navitem-name-color))');
        // No palette at 0, so items keep their own colors and styling instead of a 0% rainbow color
        expect(build('background', 0)).toBeNull();
        expect(build('foreground', 0)).toBeNull();
    });

    it('builds no palettes when the mode is off or a section has no theme', () => {
        const off = buildNavigationRainbowPalettes({
            mode: 'none',
            intensity: 100,
            themes: shortcutThemes(createTheme()),
            isDarkTheme: false
        });
        const noTheme = buildNavigationRainbowPalettes({
            mode: 'foreground',
            intensity: 100,
            themes: shortcutThemes(null),
            isDarkTheme: false
        });

        expect(off.shortcut).toBeNull();
        expect(noTheme.shortcut).toBeNull();
    });

    it('extends the end colors past the first and last stops', () => {
        const palette = buildRainbowPalette({
            steps: 101,
            stops: [
                { color: parse('#ff0000'), position: 0.25 },
                { color: parse('#0000ff'), position: 0.75 }
            ],
            style: 'rgb'
        });

        expect(palette[0]).toBe('rgba(255, 0, 0, 1)');
        expect(palette[25]).toBe('rgba(255, 0, 0, 1)');
        expect(palette[50]).toBe('rgba(128, 0, 128, 1)');
        expect(palette[75]).toBe('rgba(0, 0, 255, 1)');
        expect(palette[100]).toBe('rgba(0, 0, 255, 1)');
    });

    it('draws a hard edge where two stops share a position', () => {
        const palette = buildRainbowPalette({
            steps: 101,
            stops: [
                { color: parse('#ff0000'), position: 0 },
                { color: parse('#ff0000'), position: 0.5 },
                { color: parse('#0000ff'), position: 0.5 },
                { color: parse('#0000ff'), position: 1 }
            ],
            style: 'rgb'
        });

        expect(palette[49]).toBe('rgba(255, 0, 0, 1)');
        expect(palette[50]).toBe('rgba(0, 0, 255, 1)');
    });

    it('starts with the later color when the first two stops share a position', () => {
        const palette = buildRainbowPalette({
            steps: 101,
            stops: [
                { color: parse('#ff0000'), position: 0 },
                { color: parse('#0000ff'), position: 0 },
                { color: parse('#00ff00'), position: 1 }
            ],
            style: 'rgb'
        });

        expect(palette[0]).toBe('rgba(0, 0, 255, 1)');
    });
});
