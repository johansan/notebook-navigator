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

import { getLanguageCode } from '../../i18n';
import { LANGUAGE_METADATA } from '../../i18n/localeMetadata';
import { isRecord } from '../../utils/typeGuards';
import {
    NAV_RAINBOW_COLOR_CYCLE_THEME_ID,
    NAV_RAINBOW_DEFAULT_THEME_ID,
    createNavRainbowThemeId,
    normalizeNavRainbowThemes
} from '../navRainbowThemes';
import {
    NAV_RAINBOW_NO_THEME,
    isNavRainbowTransitionStyle,
    type NavRainbowSectionId,
    type NavRainbowTheme,
    type NavRainbowTransitionStyle
} from '../types';

// Colors every section used before rainbow themes; the Rainbow and Color cycle built-ins keep them
const LEGACY_FIRST_COLOR = '#ef4444';
const LEGACY_LAST_COLOR = '#8b5cf6';
const LEGACY_DARK_FIRST_COLOR = '#fb7185';
const LEGACY_DARK_LAST_COLOR = '#c084fc';

const LEGACY_SECTION_DEFAULTS: Record<NavRainbowSectionId, { enabled: boolean; transitionStyle: NavRainbowTransitionStyle }> = {
    shortcuts: { enabled: false, transitionStyle: 'rgb' },
    recent: { enabled: false, transitionStyle: 'rgb' },
    folders: { enabled: true, transitionStyle: 'hue' },
    tags: { enabled: false, transitionStyle: 'hue' },
    properties: { enabled: false, transitionStyle: 'hue' }
};

const SECTION_IDS: readonly NavRainbowSectionId[] = ['shortcuts', 'recent', 'folders', 'tags', 'properties'];
const LEGACY_SECTION_KEYS = ['enabled', 'firstColor', 'lastColor', 'darkFirstColor', 'darkLastColor', 'transitionStyle'];

interface LegacyPalette {
    firstColor: string;
    lastColor: string;
    darkFirstColor: string;
    darkLastColor: string;
    transitionStyle: NavRainbowTransitionStyle;
    balanceHueLuminance: boolean;
    separateThemeColors: boolean;
}

function resolveLegacyColor(value: unknown, fallback: string): string {
    const color = typeof value === 'string' ? value.trim() : '';
    return color || fallback;
}

/**
 * Identifies palettes that render the same. Dark colors count only with separate light and dark colors on, and
 * consistent brightness only for hue transitions. Values that never rendered are ignored because older versions
 * saved defaults there, such as dark shortcut colors equal to the light ones, that would otherwise become custom
 * themes nobody chose.
 */
function getLegacyPaletteKey(palette: LegacyPalette): string {
    return JSON.stringify([
        palette.firstColor.toLowerCase(),
        palette.lastColor.toLowerCase(),
        palette.separateThemeColors ? [palette.darkFirstColor.toLowerCase(), palette.darkLastColor.toLowerCase()] : null,
        palette.transitionStyle,
        palette.transitionStyle === 'hue' ? palette.balanceHueLuminance : null
    ]);
}

function getBuiltInPaletteKey(transitionStyle: NavRainbowTransitionStyle): string {
    return getLegacyPaletteKey({
        firstColor: LEGACY_FIRST_COLOR,
        lastColor: LEGACY_LAST_COLOR,
        darkFirstColor: LEGACY_DARK_FIRST_COLOR,
        darkLastColor: LEGACY_DARK_LAST_COLOR,
        transitionStyle,
        balanceHueLuminance: true,
        separateThemeColors: false
    });
}

/**
 * Converts vault profile rainbow sections saved before rainbow themes, which stored their own first and last colors,
 * into theme assignments. A section whose palette renders like the old default gets the matching built-in theme
 * (Rainbow for hue, Color cycle for RGB); any other palette becomes a custom theme, shared by sections whose palettes
 * render the same, named "Custom theme", or "Custom theme 1", "Custom theme 2"... when several are created. The theme
 * keeps the section's saved dark colors even when they did not render. Enabled sections are assigned their theme.
 * Disabled sections get no theme; their palette joins the library only when its light colors or transition style were
 * customized, so untouched defaults do not add themes nobody uses.
 *
 * Operates on a raw settings record so it can run on load before profile normalization drops the legacy fields,
 * and on settings imports before the import merge keeps only current keys.
 *
 * @returns true when any profile was converted; the record's `vaultProfiles` and `navRainbowThemes` are then updated
 * in place. Returns false and leaves the record untouched when no profile holds legacy rainbow fields.
 */
export function migrateLegacyNavRainbowColors(settingsRecord: Record<string, unknown>): boolean {
    const profiles = settingsRecord['vaultProfiles'];
    if (!Array.isArray(profiles)) {
        return false;
    }

    let themes: NavRainbowTheme[] | null = null;
    const createdThemes: NavRainbowTheme[] = [];
    const themeIdsByPaletteKey = new Map<string, string>([
        [getBuiltInPaletteKey('hue'), NAV_RAINBOW_DEFAULT_THEME_ID],
        [getBuiltInPaletteKey('rgb'), NAV_RAINBOW_COLOR_CYCLE_THEME_ID]
    ]);

    for (const profile of profiles) {
        const navRainbow = isRecord(profile) ? profile['navRainbow'] : null;
        if (!isRecord(navRainbow)) {
            continue;
        }

        const hasLegacyFields =
            'balanceHueLuminance' in navRainbow ||
            'separateThemeColors' in navRainbow ||
            SECTION_IDS.some(sectionId => {
                const section = navRainbow[sectionId];
                return isRecord(section) && !('theme' in section);
            });
        if (!hasLegacyFields) {
            continue;
        }

        themes ??= normalizeNavRainbowThemes(settingsRecord['navRainbowThemes']);

        const balanceHueLuminance = typeof navRainbow['balanceHueLuminance'] === 'boolean' ? navRainbow['balanceHueLuminance'] : true;
        const separateThemeColors = typeof navRainbow['separateThemeColors'] === 'boolean' ? navRainbow['separateThemeColors'] : false;

        for (const sectionId of SECTION_IDS) {
            const section = navRainbow[sectionId];
            if (!isRecord(section) || 'theme' in section) {
                continue;
            }

            const defaults = LEGACY_SECTION_DEFAULTS[sectionId];
            const palette: LegacyPalette = {
                firstColor: resolveLegacyColor(section['firstColor'], LEGACY_FIRST_COLOR),
                lastColor: resolveLegacyColor(section['lastColor'], LEGACY_LAST_COLOR),
                darkFirstColor: resolveLegacyColor(section['darkFirstColor'], LEGACY_DARK_FIRST_COLOR),
                darkLastColor: resolveLegacyColor(section['darkLastColor'], LEGACY_DARK_LAST_COLOR),
                transitionStyle: isNavRainbowTransitionStyle(section['transitionStyle'])
                    ? section['transitionStyle']
                    : defaults.transitionStyle,
                balanceHueLuminance,
                separateThemeColors
            };

            const enabled = typeof section['enabled'] === 'boolean' ? section['enabled'] : defaults.enabled;
            const hasCustomColors =
                palette.firstColor.toLowerCase() !== LEGACY_FIRST_COLOR ||
                palette.lastColor.toLowerCase() !== LEGACY_LAST_COLOR ||
                palette.transitionStyle !== defaults.transitionStyle;
            LEGACY_SECTION_KEYS.forEach(key => {
                delete section[key];
            });
            if (!enabled && !hasCustomColors) {
                section['theme'] = NAV_RAINBOW_NO_THEME;
                continue;
            }

            const paletteKey = getLegacyPaletteKey(palette);
            let themeId = themeIdsByPaletteKey.get(paletteKey);
            if (!themeId) {
                themeId = createNavRainbowThemeId();
                const theme: NavRainbowTheme = {
                    id: themeId,
                    name: '',
                    stops: [
                        { color: palette.firstColor, position: 0 },
                        { color: palette.lastColor, position: 100 }
                    ],
                    darkStops: [
                        { color: palette.darkFirstColor, position: 0 },
                        { color: palette.darkLastColor, position: 100 }
                    ],
                    separateDarkStops: palette.separateThemeColors,
                    transitionStyle: palette.transitionStyle,
                    consistentBrightness: palette.balanceHueLuminance
                };
                themes.push(theme);
                createdThemes.push(theme);
                themeIdsByPaletteKey.set(paletteKey, themeId);
            }

            section['theme'] = enabled ? themeId : NAV_RAINBOW_NO_THEME;
        }

        delete navRainbow['balanceHueLuminance'];
        delete navRainbow['separateThemeColors'];
    }

    if (!themes) {
        return false;
    }

    // Uses the translation bundled with the plugin, because migration runs before a newly downloaded language is applied
    const baseName = LANGUAGE_METADATA[getLanguageCode()].defaultRainbowThemeName;
    createdThemes.forEach((theme, index) => {
        theme.name = createdThemes.length === 1 ? baseName : `${baseName} ${index + 1}`;
    });
    settingsRecord['navRainbowThemes'] = themes;
    return true;
}
