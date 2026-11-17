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

import { strings } from '../i18n';
import { parseCssColor } from '../utils/colorUtils';
import { isRecord } from '../utils/typeGuards';
import {
    NAV_RAINBOW_NO_THEME,
    isNavRainbowTransitionStyle,
    type NavRainbowColorStop,
    type NavRainbowTheme,
    type NavRainbowTransitionStyle
} from './types';

/** Theme every section uses on a fresh install, and the theme legacy hue-transition sections migrate to. */
export const NAV_RAINBOW_DEFAULT_THEME_ID = 'rainbow';
/** Theme legacy RGB-transition sections (the old shortcut and recent item default) migrate to. */
export const NAV_RAINBOW_COLOR_CYCLE_THEME_ID = 'color-cycle';

/** Built-in theme ids, which are also the keys of their translated names. */
type BuiltInThemeId = keyof typeof strings.modals.navRainbowThemes.builtInNames;

function stops(...entries: [string, number][]): NavRainbowColorStop[] {
    return entries.map(([color, position]) => ({ color, position }));
}

function defineBuiltInTheme(
    id: BuiltInThemeId,
    options: {
        stops: NavRainbowColorStop[];
        darkStops: NavRainbowColorStop[];
        separateDarkStops: boolean;
        transitionStyle: NavRainbowTransitionStyle;
    }
): NavRainbowTheme {
    // Built-in names are resolved at display time through getNavRainbowThemeName, because language data loads after startup
    return { id, name: '', consistentBrightness: true, ...options };
}

// The first two themes reproduce the legacy default colors exactly, so migrated default sections render unchanged.
// New custom themes start as a copy of the first one, Rainbow.
export const NAV_RAINBOW_BUILT_IN_THEMES: readonly NavRainbowTheme[] = [
    defineBuiltInTheme(NAV_RAINBOW_DEFAULT_THEME_ID, {
        stops: stops(['#ef4444', 0], ['#8b5cf6', 100]),
        darkStops: stops(['#fb7185', 0], ['#c084fc', 100]),
        separateDarkStops: false,
        transitionStyle: 'hue'
    }),
    defineBuiltInTheme(NAV_RAINBOW_COLOR_CYCLE_THEME_ID, {
        stops: stops(['#ef4444', 0], ['#8b5cf6', 100]),
        darkStops: stops(['#fb7185', 0], ['#c084fc', 100]),
        separateDarkStops: false,
        transitionStyle: 'rgb'
    }),
    defineBuiltInTheme('pastel', {
        stops: stops(['#ebb5b5', 0], ['#bfb5e8', 100]),
        darkStops: stops(['#ebb5b5', 0], ['#bfb5e8', 100]),
        separateDarkStops: false,
        transitionStyle: 'hue'
    }),
    defineBuiltInTheme('fire', {
        stops: stops(['#dc2626', 0], ['#f97316', 50], ['#f59e0b', 100]),
        darkStops: stops(['#f87171', 0], ['#fb923c', 50], ['#fcd34d', 100]),
        separateDarkStops: true,
        transitionStyle: 'rgb'
    }),
    defineBuiltInTheme('ice', {
        stops: stops(['#1d4ed8', 0], ['#0284c7', 50], ['#0891b2', 100]),
        darkStops: stops(['#93c5fd', 0], ['#7dd3fc', 50], ['#a5f3fc', 100]),
        separateDarkStops: true,
        transitionStyle: 'rgb'
    }),
    defineBuiltInTheme('ocean', {
        stops: stops(['#0f766e', 0], ['#0369a1', 50], ['#4338ca', 100]),
        darkStops: stops(['#2dd4bf', 0], ['#38bdf8', 50], ['#818cf8', 100]),
        separateDarkStops: true,
        transitionStyle: 'rgb'
    }),
    defineBuiltInTheme('forest', {
        stops: stops(['#15803d', 0], ['#65a30d', 60], ['#ca8a04', 100]),
        darkStops: stops(['#4ade80', 0], ['#a3e635', 60], ['#fbbf24', 100]),
        separateDarkStops: true,
        transitionStyle: 'rgb'
    }),
    defineBuiltInTheme('sunset', {
        stops: stops(['#7c3aed', 0], ['#db2777', 35], ['#ea580c', 70], ['#d97706', 100]),
        darkStops: stops(['#a78bfa', 0], ['#f472b6', 35], ['#fb923c', 70], ['#fcd34d', 100]),
        separateDarkStops: true,
        transitionStyle: 'rgb'
    }),
    defineBuiltInTheme('70s', {
        stops: stops(['#8b4513', 0], ['#c2571a', 33], ['#d4a017', 67], ['#6b8e23', 100]),
        darkStops: stops(['#c98a5a', 0], ['#e2843a', 33], ['#f0c04a', 67], ['#a4c45a', 100]),
        separateDarkStops: true,
        transitionStyle: 'rgb'
    }),
    defineBuiltInTheme('80s', {
        stops: stops(['#e0115f', 0], ['#b5179e', 33], ['#7209b7', 67], ['#0896a8', 100]),
        darkStops: stops(['#ff6b9d', 0], ['#e85dff', 33], ['#a77bff', 67], ['#3ee8f5', 100]),
        separateDarkStops: true,
        transitionStyle: 'rgb'
    })
];

const BUILT_IN_THEME_IDS = new Set<string>(NAV_RAINBOW_BUILT_IN_THEMES.map(theme => theme.id));

function isBuiltInNavRainbowThemeId(id: string): id is BuiltInThemeId {
    return BUILT_IN_THEME_IDS.has(id);
}

/**
 * Display name: the translated name for built-in themes, the stored name for custom themes, and a translated
 * placeholder for custom themes saved without a name.
 */
export function getNavRainbowThemeName(theme: NavRainbowTheme): string {
    if (isBuiltInNavRainbowThemeId(theme.id)) {
        return strings.modals.navRainbowThemes.builtInNames[theme.id];
    }
    return theme.name || strings.modals.navRainbowThemes.defaultName;
}

/** Returns the built-in or custom theme with the id, or null for `NAV_RAINBOW_NO_THEME` and unknown ids. */
export function findNavRainbowTheme(customThemes: readonly NavRainbowTheme[], id: string): NavRainbowTheme | null {
    return NAV_RAINBOW_BUILT_IN_THEMES.find(theme => theme.id === id) ?? customThemes.find(theme => theme.id === id) ?? null;
}

export function createNavRainbowThemeId(): string {
    return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function cloneNavRainbowTheme(theme: NavRainbowTheme): NavRainbowTheme {
    return {
        ...theme,
        stops: theme.stops.map(stop => ({ ...stop })),
        darkStops: theme.darkStops.map(stop => ({ ...stop }))
    };
}

/** Returns `baseName`, or `baseName 2`, `baseName 3`... when a built-in or custom theme already uses the name. */
export function createUniqueNavRainbowThemeName(baseName: string, customThemes: readonly NavRainbowTheme[]): string {
    const usedNames = new Set([...NAV_RAINBOW_BUILT_IN_THEMES, ...customThemes].map(theme => getNavRainbowThemeName(theme)));
    if (!usedNames.has(baseName)) {
        return baseName;
    }

    let suffix = 2;
    while (usedNames.has(`${baseName} ${suffix}`)) {
        suffix += 1;
    }
    return `${baseName} ${suffix}`;
}

/** Keeps stops with a parseable color and a finite position, clamped to 0-100 and sorted; null when fewer than two remain. */
function normalizeStops(value: unknown): NavRainbowColorStop[] | null {
    if (!Array.isArray(value)) {
        return null;
    }

    const result: NavRainbowColorStop[] = [];
    for (const entry of value) {
        if (!isRecord(entry)) {
            continue;
        }
        const color = typeof entry.color === 'string' ? entry.color.trim() : '';
        const position = entry.position;
        if (!parseCssColor(color) || typeof position !== 'number' || !Number.isFinite(position)) {
            continue;
        }
        result.push({ color, position: Math.min(100, Math.max(0, position)) });
    }

    // Array sort is stable, so stops sharing a position keep their stored order and the hard edge between them
    result.sort((left, right) => left.position - right.position);
    return result.length >= 2 ? result : null;
}

function normalizeCustomTheme(value: unknown): NavRainbowTheme | null {
    if (!isRecord(value)) {
        return null;
    }

    const id = typeof value.id === 'string' ? value.id.trim() : '';
    // Section settings store ids, so a custom id equal to a built-in id or the "none" value would be ambiguous
    if (!id || id === NAV_RAINBOW_NO_THEME || isBuiltInNavRainbowThemeId(id)) {
        return null;
    }

    const lightStops = normalizeStops(value.stops);
    if (!lightStops) {
        return null;
    }

    return {
        id,
        name: typeof value.name === 'string' ? value.name.trim() : '',
        stops: lightStops,
        darkStops: normalizeStops(value.darkStops) ?? lightStops.map(stop => ({ ...stop })),
        separateDarkStops: value.separateDarkStops === true,
        transitionStyle: isNavRainbowTransitionStyle(value.transitionStyle) ? value.transitionStyle : 'hue',
        consistentBrightness: value.consistentBrightness !== false
    };
}

/** Normalizes the stored custom theme library, dropping invalid entries and later duplicates of an id. */
export function normalizeNavRainbowThemes(value: unknown): NavRainbowTheme[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const themes: NavRainbowTheme[] = [];
    const seenIds = new Set<string>();
    for (const entry of value) {
        const theme = normalizeCustomTheme(entry);
        if (!theme || seenIds.has(theme.id)) {
            continue;
        }
        seenIds.add(theme.id);
        themes.push(theme);
    }
    return themes;
}
