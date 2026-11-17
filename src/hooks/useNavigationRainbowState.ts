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

import { useMemo, useRef } from 'react';

import { findNavRainbowTheme } from '../settings/navRainbowThemes';
import type { NotebookNavigatorSettings } from '../settings/types';
import { buildNavigationRainbowPalettes, type NavigationRainbowPalettes } from '../utils/navigationRainbow';
import { areNavRainbowSettingsEqual, getActiveNavRainbowSettings } from '../utils/vaultProfiles';

export interface NavigationRainbowState {
    navRainbow: ReturnType<typeof getActiveNavRainbowSettings>;
    navRainbowPalettes: NavigationRainbowPalettes;
}

export function useNavigationRainbowState(settings: NotebookNavigatorSettings, isDarkTheme: boolean): NavigationRainbowState {
    const previousNavRainbowRef = useRef<ReturnType<typeof getActiveNavRainbowSettings> | null>(null);

    const navRainbow = useMemo(() => {
        const nextNavRainbow = getActiveNavRainbowSettings(settings);
        const previousNavRainbow = previousNavRainbowRef.current;
        if (previousNavRainbow && areNavRainbowSettingsEqual(previousNavRainbow, nextNavRainbow)) {
            return previousNavRainbow;
        }

        previousNavRainbowRef.current = nextNavRainbow;
        return nextNavRainbow;
    }, [settings]);

    // Theme edits replace the theme object in the library, so the resolved references change exactly when a section's colors do
    const customThemes = settings.navRainbowThemes;
    const folder = findNavRainbowTheme(customThemes, navRainbow.folders.theme);
    const tag = findNavRainbowTheme(customThemes, navRainbow.tags.theme);
    const property = findNavRainbowTheme(customThemes, navRainbow.properties.theme);
    const shortcut = findNavRainbowTheme(customThemes, navRainbow.shortcuts.theme);
    const recent = findNavRainbowTheme(customThemes, navRainbow.recent.theme);
    const { mode, intensity } = navRainbow;
    const navRainbowPalettes = useMemo(
        () =>
            buildNavigationRainbowPalettes({
                mode,
                intensity,
                themes: { folder, tag, property, shortcut, recent },
                isDarkTheme
            }),
        [mode, intensity, folder, tag, property, shortcut, recent, isDarkTheme]
    );

    return useMemo(
        () => ({
            navRainbow,
            navRainbowPalettes
        }),
        [navRainbow, navRainbowPalettes]
    );
}
