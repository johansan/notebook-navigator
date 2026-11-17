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

import { NavigationPaneItemType } from '../types';
import type { CombinedNavigationItem } from '../types/virtualization';
import type { NavRainbowColorMode, NavRainbowScope, NavRainbowTheme } from '../settings/types';
import {
    assignRainbowColorsFromPalette,
    buildRainbowColorMapFromPalette,
    buildRainbowPalette,
    formatCssHex,
    parseCssColor,
    type RainbowGradientStop
} from './colorUtils';
import { getParentFolderPath } from './pathUtils';

const FOLDER_VIRTUAL_ROOT_RAINBOW_KEY = '__nn-folder-virtual-root__';
const SHORTCUT_VIRTUAL_ROOT_RAINBOW_KEY = '__nn-shortcuts-virtual-root__';
const RECENT_VIRTUAL_ROOT_RAINBOW_KEY = '__nn-recent-virtual-root__';

const NAV_RAINBOW_PALETTE_SIZE = 1024;

export interface NavigationRainbowPalettes {
    folder: readonly string[] | null;
    tag: readonly string[] | null;
    property: readonly string[] | null;
    shortcut: readonly string[] | null;
    recent: readonly string[] | null;
}

/** The theme each navigation section uses; null when the section has no theme. */
export interface NavigationRainbowSectionThemes {
    folder: NavRainbowTheme | null;
    tag: NavRainbowTheme | null;
    property: NavRainbowTheme | null;
    shortcut: NavRainbowTheme | null;
    recent: NavRainbowTheme | null;
}

/** Builds the palette a theme renders in the given appearance: a sampled gradient through its stops. */
export function buildNavRainbowThemePalette(theme: NavRainbowTheme, isDarkTheme: boolean): string[] {
    // Theme normalization keeps only stops with parseable colors, and the editor stores color picker output
    const gradientStops: RainbowGradientStop[] = [];
    for (const stop of theme.separateDarkStops && isDarkTheme ? theme.darkStops : theme.stops) {
        const color = parseCssColor(stop.color);
        if (color) {
            gradientStops.push({ color, position: stop.position / 100 });
        }
    }

    return buildRainbowPalette({
        steps: NAV_RAINBOW_PALETTE_SIZE,
        stops: gradientStops,
        style: theme.transitionStyle,
        balanceHueLuminance: theme.consistentBrightness
    });
}

const SWATCH_SAMPLE_COUNT = 32;

/** CSS background drawing a palette left to right from evenly spaced samples. */
export function buildNavRainbowPaletteBackground(palette: readonly string[]): string {
    const lastIndex = palette.length - 1;
    const samples = Array.from({ length: SWATCH_SAMPLE_COUNT }, (_, index) => {
        const t = index / (SWATCH_SAMPLE_COUNT - 1);
        return `${palette[Math.round(t * lastIndex)]} ${(t * 100).toFixed(2)}%`;
    });
    return `linear-gradient(to right, ${samples.join(', ')})`;
}

/**
 * CSS background showing a theme's colors left to right in the given appearance. Gradients are sampled from the
 * palette the navigation pane uses, because a CSS gradient between the stops would not match hue transitions.
 */
export function buildNavRainbowThemeSwatchBackground(theme: NavRainbowTheme, isDarkTheme: boolean): string {
    return buildNavRainbowPaletteBackground(buildNavRainbowThemePalette(theme, isDarkTheme));
}

/**
 * Applies the rainbow color intensity (1-99): background colors get their opacity scaled, and text colors are mixed
 * with the navigation item name color in CSS. Text colors are only ever set as styles, never parsed, so a
 * `color-mix()` value is safe there.
 */
function applyRainbowIntensity(palette: string[], mode: 'foreground' | 'background', intensity: number): string[] {
    if (mode === 'foreground') {
        return palette.map(color => `color-mix(in srgb, ${color} ${intensity}%, var(--nn-theme-navitem-name-color))`);
    }

    // Backgrounds stay rgba so the list pane can composite them into solid file row backgrounds
    return palette.map(color => {
        const parsed = parseCssColor(color);
        return parsed ? formatCssHex({ ...parsed, a: (parsed.a * intensity) / 100 }) : color;
    });
}

/**
 * Builds each section's palette. Sections get null, which leaves items with their own colors and styling, when the
 * mode is off, the section has no theme, or the intensity is 0; a 0% mix would still mark items as custom colored.
 */
export function buildNavigationRainbowPalettes(params: {
    mode: NavRainbowColorMode;
    intensity: number;
    themes: NavigationRainbowSectionThemes;
    isDarkTheme: boolean;
}): NavigationRainbowPalettes {
    const { mode, intensity, themes, isDarkTheme } = params;
    const build = (theme: NavRainbowTheme | null): readonly string[] | null => {
        if (mode === 'none' || !theme || intensity <= 0) {
            return null;
        }
        const palette = buildNavRainbowThemePalette(theme, isDarkTheme);
        return intensity >= 100 ? palette : applyRainbowIntensity(palette, mode, intensity);
    };

    return {
        folder: build(themes.folder),
        tag: build(themes.tag),
        property: build(themes.property),
        shortcut: build(themes.shortcut),
        recent: build(themes.recent)
    };
}

interface CollectUniqueKeysOptions {
    excludeKey?: (key: string) => boolean;
}

function collectUniqueKeys<T>(params: {
    items: readonly T[];
    includeItem: (item: T) => boolean;
    getKey: (item: T) => string | undefined;
    options?: CollectUniqueKeysOptions;
}): string[] {
    const { items, includeItem, getKey, options } = params;
    const keys: string[] = [];
    const seen = new Set<string>();

    for (const item of items) {
        if (!includeItem(item)) {
            continue;
        }

        const key = getKey(item);
        if (!key || seen.has(key) || options?.excludeKey?.(key)) {
            continue;
        }

        seen.add(key);
        keys.push(key);
    }

    return keys;
}

function collectSiblingKeysByParent<T>(params: {
    items: readonly T[];
    includeItem: (item: T) => boolean;
    getKey: (item: T) => string | undefined;
    getParentKey: (item: T, key: string) => string;
}): Map<string, string[]> {
    const { items, includeItem, getKey, getParentKey } = params;
    const groupedKeys = new Map<string, string[]>();
    const seenChildrenByParent = new Map<string, Set<string>>();

    for (const item of items) {
        if (!includeItem(item)) {
            continue;
        }

        const key = getKey(item);
        if (!key) {
            continue;
        }

        const parentKey = getParentKey(item, key);
        let seen = seenChildrenByParent.get(parentKey);
        if (!seen) {
            seen = new Set<string>();
            seenChildrenByParent.set(parentKey, seen);
        }
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);

        const siblings = groupedKeys.get(parentKey);
        if (siblings) {
            siblings.push(key);
        } else {
            groupedKeys.set(parentKey, [key]);
        }
    }

    return groupedKeys;
}

function assignColorsBySiblingGroups(params: {
    groupedKeys: ReadonlyMap<string, readonly string[]>;
    palette: readonly string[];
    target: Map<string, string>;
}): void {
    const { groupedKeys, palette, target } = params;
    for (const keys of groupedKeys.values()) {
        assignRainbowColorsFromPalette({ keys, palette, target });
    }
}

function assignColorsWithVirtualRootOffset(params: {
    keys: readonly string[];
    palette: readonly string[];
    virtualRootKey: string;
}): Map<string, string> {
    return buildRainbowColorMapFromPalette({
        keys: [params.virtualRootKey, ...params.keys],
        palette: params.palette
    });
}

function createInheritedColorResolver(params: {
    scope: NavRainbowScope;
    inheritColors: boolean;
    colorsByPath: ReadonlyMap<string, string>;
    getParentPath: (path: string) => string;
    isTerminalPath: (path: string) => boolean;
}): (path: string) => string | undefined {
    const { scope, inheritColors, colorsByPath, getParentPath, isTerminalPath } = params;
    const inheritedCache = new Map<string, string | null>();

    return (path: string): string | undefined => {
        if (scope !== 'root' || !inheritColors) {
            return undefined;
        }

        if (inheritedCache.has(path)) {
            return inheritedCache.get(path) ?? undefined;
        }

        let ancestorPath = getParentPath(path);
        while (!isTerminalPath(ancestorPath)) {
            const ancestorRainbowColor = colorsByPath.get(ancestorPath);
            if (ancestorRainbowColor) {
                inheritedCache.set(path, ancestorRainbowColor);
                return ancestorRainbowColor;
            }

            ancestorPath = getParentPath(ancestorPath);
        }

        inheritedCache.set(path, null);
        return undefined;
    };
}

function isNonEmptyCssColor(value: string | null | undefined): boolean {
    return typeof value === 'string' && value.trim().length > 0;
}

export function applyRainbowOverlay(params: {
    mode: NavRainbowColorMode;
    rainbowColor: string | undefined;
    color: string | null | undefined;
    backgroundColor: string | null | undefined;
}): { color?: string; backgroundColor?: string } {
    const baseColor = params.color ?? undefined;
    const baseBackgroundColor = params.backgroundColor ?? undefined;
    const rainbowColor = params.rainbowColor;

    if (params.mode === 'none' || !isNonEmptyCssColor(rainbowColor)) {
        return { color: baseColor, backgroundColor: baseBackgroundColor };
    }

    if (params.mode === 'foreground') {
        if (!isNonEmptyCssColor(baseColor)) {
            return { color: rainbowColor, backgroundColor: baseBackgroundColor };
        }
        return { color: baseColor, backgroundColor: baseBackgroundColor };
    }

    if (!isNonEmptyCssColor(baseBackgroundColor)) {
        return { color: baseColor, backgroundColor: rainbowColor };
    }

    return { color: baseColor, backgroundColor: baseBackgroundColor };
}

export interface FolderRainbowColors {
    colorsByPath: Map<string, string>;
    rootColor: string | undefined;
    getInheritedColor: (folderPath: string) => string | undefined;
}

export function resolveFolderRainbowColor(params: {
    folderPath: string;
    scope: NavRainbowScope;
    showRootFolder: boolean;
    colors: FolderRainbowColors;
}): string | undefined {
    const { folderPath, scope, showRootFolder, colors } = params;
    if (folderPath === '/') {
        return showRootFolder && scope !== 'child' ? colors.rootColor : undefined;
    }

    return colors.colorsByPath.get(folderPath) ?? colors.getInheritedColor(folderPath);
}

export function resolveFolderRainbowDecorationColors(params: {
    mode: NavRainbowColorMode;
    folderPath: string;
    scope: NavRainbowScope;
    showRootFolder: boolean;
    colors: FolderRainbowColors;
    color: string | null | undefined;
    backgroundColor: string | null | undefined;
}): { color?: string; backgroundColor?: string } {
    return applyRainbowOverlay({
        mode: params.mode,
        rainbowColor: resolveFolderRainbowColor({
            folderPath: params.folderPath,
            scope: params.scope,
            showRootFolder: params.showRootFolder,
            colors: params.colors
        }),
        color: params.color,
        backgroundColor: params.backgroundColor
    });
}

export function buildFolderRainbowColorsFromSiblingPaths(params: {
    siblingPathsByParent: ReadonlyMap<string, readonly string[]>;
    palette: readonly string[] | null | undefined;
    scope: NavRainbowScope;
    showRootFolder: boolean;
    inheritColors: boolean;
}): FolderRainbowColors {
    const { siblingPathsByParent, palette, scope, showRootFolder, inheritColors } = params;
    const colorsByPath = new Map<string, string>();
    if (!palette || palette.length === 0) {
        return {
            colorsByPath,
            rootColor: undefined,
            getInheritedColor: (_folderPath: string) => undefined
        };
    }

    let rootColor: string | undefined;
    if (scope === 'root') {
        const rootPaths = siblingPathsByParent.get('/') ?? [];
        rootColor = palette[0];

        if (showRootFolder) {
            const rootScopedColors = assignColorsWithVirtualRootOffset({
                keys: rootPaths,
                palette,
                virtualRootKey: FOLDER_VIRTUAL_ROOT_RAINBOW_KEY
            });

            rootPaths.forEach(path => {
                const color = rootScopedColors.get(path);
                if (color) {
                    colorsByPath.set(path, color);
                }
            });
        } else {
            assignRainbowColorsFromPalette({ keys: rootPaths, palette, target: colorsByPath });
        }
    } else {
        if (showRootFolder && scope === 'all') {
            rootColor = palette[0];
        }

        siblingPathsByParent.forEach((childPaths, parentPath) => {
            if (parentPath === '' || (scope === 'child' && parentPath === '/')) {
                return;
            }

            assignRainbowColorsFromPalette({ keys: childPaths, palette, target: colorsByPath });
        });
    }

    const getInheritedColor = createInheritedColorResolver({
        scope,
        inheritColors,
        colorsByPath,
        getParentPath: getParentFolderPath,
        isTerminalPath: path => path === '/' || path === ''
    });

    return { colorsByPath, rootColor, getInheritedColor };
}

function collectFolderSiblingPathsFromItems(params: {
    items: readonly CombinedNavigationItem[];
    scope: NavRainbowScope;
    rootLevel: number;
}): Map<string, string[]> {
    const { items, scope, rootLevel } = params;

    if (scope === 'root') {
        const rootPaths = collectUniqueKeys({
            items,
            includeItem: item => item.type === NavigationPaneItemType.FOLDER && !item.isExcluded && item.level === rootLevel,
            getKey: item => (item.type === NavigationPaneItemType.FOLDER ? item.data.path : undefined),
            options: { excludeKey: key => key === '/' }
        });
        return new Map<string, string[]>([['/', rootPaths]]);
    }

    return collectSiblingKeysByParent({
        items,
        includeItem: item =>
            item.type === NavigationPaneItemType.FOLDER && !item.isExcluded && (scope !== 'child' || item.level > rootLevel),
        getKey: item => {
            if (item.type !== NavigationPaneItemType.FOLDER) {
                return undefined;
            }

            const path = item.data.path;
            if (!path || path === '/') {
                return undefined;
            }
            return path;
        },
        getParentKey: (_item, path) => getParentFolderPath(path)
    });
}

export function buildFolderRainbowColors(params: {
    items: readonly CombinedNavigationItem[];
    palette: readonly string[];
    scope: NavRainbowScope;
    showRootFolder: boolean;
    rootLevel: number;
    inheritColors: boolean;
}): FolderRainbowColors {
    const { items, palette, scope, showRootFolder, rootLevel, inheritColors } = params;
    return buildFolderRainbowColorsFromSiblingPaths({
        siblingPathsByParent: collectFolderSiblingPathsFromItems({
            items,
            scope,
            rootLevel
        }),
        palette,
        scope,
        showRootFolder,
        inheritColors
    });
}

export interface TagRainbowColors {
    colorsByPath: Map<string, string>;
    rootColor: string | undefined;
    getInheritedColor: (tagPath: string) => string | undefined;
}

function getParentTagPath(path: string): string {
    const separatorIndex = path.lastIndexOf('/');
    if (separatorIndex === -1) {
        return '';
    }
    return path.slice(0, separatorIndex);
}

export function buildTagRainbowColors(params: {
    items: readonly CombinedNavigationItem[];
    palette: readonly string[];
    scope: NavRainbowScope;
    rootLevel: number;
    showAllTagsFolder: boolean;
    inheritColors: boolean;
}): TagRainbowColors {
    const { items, palette, scope, rootLevel, showAllTagsFolder, inheritColors } = params;

    const colorsByPath = new Map<string, string>();
    let rootColor: string | undefined;

    if (scope === 'root') {
        const keys = collectUniqueKeys({
            items,
            includeItem: item =>
                (item.type === NavigationPaneItemType.TAG || item.type === NavigationPaneItemType.UNTAGGED) && item.level === rootLevel,
            getKey: item =>
                item.type === NavigationPaneItemType.TAG || item.type === NavigationPaneItemType.UNTAGGED ? item.data.path : undefined
        });

        rootColor = palette[0];
        assignRainbowColorsFromPalette({ keys, palette, target: colorsByPath });
    } else {
        const childPathsByParent = collectSiblingKeysByParent({
            items,
            includeItem: item =>
                (item.type === NavigationPaneItemType.TAG || item.type === NavigationPaneItemType.UNTAGGED) &&
                (scope !== 'child' || item.level > rootLevel),
            getKey: item =>
                item.type === NavigationPaneItemType.TAG || item.type === NavigationPaneItemType.UNTAGGED ? item.data.path : undefined,
            getParentKey: (_item, path) => getParentTagPath(path)
        });

        assignColorsBySiblingGroups({ groupedKeys: childPathsByParent, palette, target: colorsByPath });

        if (showAllTagsFolder && scope === 'all') {
            rootColor = palette[0];
        }
    }

    const getInheritedColor = createInheritedColorResolver({
        scope,
        inheritColors,
        colorsByPath,
        getParentPath: getParentTagPath,
        isTerminalPath: path => path === ''
    });

    return { colorsByPath, rootColor, getInheritedColor };
}

export interface PropertyRainbowColors {
    colorsByNodeId: Map<string, string>;
    rootColor: string | undefined;
    rootColorsByKey: Map<string, string>;
}

export function buildPropertyRainbowColors(params: {
    items: readonly CombinedNavigationItem[];
    palette: readonly string[];
    scope: NavRainbowScope;
    showAllPropertiesFolder: boolean;
}): PropertyRainbowColors {
    const { items, palette, scope, showAllPropertiesFolder } = params;

    const colorsByNodeId = new Map<string, string>();
    const rootColorsByKey = new Map<string, string>();
    let rootColor: string | undefined;

    if (scope === 'root') {
        const keys = collectUniqueKeys({
            items,
            includeItem: item => item.type === NavigationPaneItemType.PROPERTY_KEY,
            getKey: item => (item.type === NavigationPaneItemType.PROPERTY_KEY ? item.data.id : undefined)
        });

        rootColor = palette[0];
        assignRainbowColorsFromPalette({ keys, palette, target: colorsByNodeId });

        for (const item of items) {
            if (item.type !== NavigationPaneItemType.PROPERTY_KEY) {
                continue;
            }
            const color = colorsByNodeId.get(item.data.id);
            if (!color) {
                continue;
            }
            rootColorsByKey.set(item.data.key, color);
        }
    } else {
        const childIdsByParent = collectSiblingKeysByParent({
            items,
            includeItem: item =>
                (item.type === NavigationPaneItemType.PROPERTY_KEY || item.type === NavigationPaneItemType.PROPERTY_VALUE) &&
                (scope !== 'child' || item.type !== NavigationPaneItemType.PROPERTY_KEY),
            getKey: item =>
                item.type === NavigationPaneItemType.PROPERTY_KEY || item.type === NavigationPaneItemType.PROPERTY_VALUE
                    ? item.data.id
                    : undefined,
            getParentKey: (item, _nodeId) => {
                if (item.type === NavigationPaneItemType.PROPERTY_KEY) {
                    return '__root__';
                }

                if (item.type === NavigationPaneItemType.PROPERTY_VALUE) {
                    return `key:${item.data.key}`;
                }

                return '__root__';
            }
        });

        assignColorsBySiblingGroups({ groupedKeys: childIdsByParent, palette, target: colorsByNodeId });

        if (showAllPropertiesFolder && scope === 'all') {
            rootColor = palette[0];
        }
    }

    return { colorsByNodeId, rootColor, rootColorsByKey };
}

export interface ShortcutRainbowColors {
    colorsByKey: Map<string, string>;
    rootColor: string | undefined;
}

export function buildShortcutRainbowColors(params: {
    items: readonly CombinedNavigationItem[];
    palette: readonly string[];
}): ShortcutRainbowColors {
    const { items, palette } = params;

    const keys = collectUniqueKeys({
        items,
        includeItem: item =>
            item.type === NavigationPaneItemType.SHORTCUT_FOLDER ||
            item.type === NavigationPaneItemType.SHORTCUT_NOTE ||
            item.type === NavigationPaneItemType.SHORTCUT_SEARCH ||
            item.type === NavigationPaneItemType.SHORTCUT_TAG ||
            item.type === NavigationPaneItemType.SHORTCUT_PROPERTY,
        getKey: item => item.key
    });

    const rootScopedColors = assignColorsWithVirtualRootOffset({
        keys,
        palette,
        virtualRootKey: SHORTCUT_VIRTUAL_ROOT_RAINBOW_KEY
    });

    const rootColor = rootScopedColors.get(SHORTCUT_VIRTUAL_ROOT_RAINBOW_KEY) ?? palette[0];
    const colorsByKey = new Map<string, string>();
    for (const key of keys) {
        const color = rootScopedColors.get(key);
        if (color) {
            colorsByKey.set(key, color);
        }
    }

    return { colorsByKey, rootColor };
}

export interface RecentRainbowColors {
    colorsByKey: Map<string, string>;
    rootColor: string | undefined;
}

export function buildRecentRainbowColors(params: {
    items: readonly CombinedNavigationItem[];
    palette: readonly string[];
}): RecentRainbowColors {
    const { items, palette } = params;

    const keys = collectUniqueKeys({
        items,
        includeItem: item => item.type === NavigationPaneItemType.RECENT_NOTE,
        getKey: item => item.key
    });

    const rootScopedColors = assignColorsWithVirtualRootOffset({
        keys,
        palette,
        virtualRootKey: RECENT_VIRTUAL_ROOT_RAINBOW_KEY
    });

    const rootColor = rootScopedColors.get(RECENT_VIRTUAL_ROOT_RAINBOW_KEY) ?? palette[0];
    const colorsByKey = new Map<string, string>();
    for (const key of keys) {
        const color = rootScopedColors.get(key);
        if (color) {
            colorsByKey.set(key, color);
        }
    }

    return { colorsByKey, rootColor };
}
