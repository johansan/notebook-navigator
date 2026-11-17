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
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { migrateLegacyNavRainbowColors } from '../../src/settings/migrations/navRainbowColors';
import { normalizeNavRainbowThemes } from '../../src/settings/navRainbowThemes';
import { applyModifiedSettingsTransfer } from '../../src/settings/transfer';
import type { NavRainbowTheme, NotebookNavigatorSettings } from '../../src/settings/types';
import { createValidatedVaultProfileFromTemplate, ensureVaultProfiles } from '../../src/utils/vaultProfiles';

function createLegacySection(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        enabled: false,
        firstColor: '#ef4444',
        lastColor: '#8b5cf6',
        darkFirstColor: '#fb7185',
        darkLastColor: '#c084fc',
        transitionStyle: 'hue',
        ...overrides
    };
}

function createLegacyNavRainbow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        mode: 'background',
        balanceHueLuminance: true,
        separateThemeColors: false,
        shortcuts: createLegacySection({ transitionStyle: 'rgb' }),
        recent: createLegacySection({ transitionStyle: 'rgb' }),
        folders: { ...createLegacySection({ enabled: true }), scope: 'root' },
        tags: { ...createLegacySection(), scope: 'all' },
        properties: { ...createLegacySection(), scope: 'child' },
        ...overrides
    };
}

function createLegacyRecord(...navRainbows: Record<string, unknown>[]): Record<string, unknown> {
    return {
        vaultProfiles: navRainbows.map((navRainbow, index) => ({ id: index === 0 ? 'default' : `profile-${index}`, navRainbow }))
    };
}

function getNavRainbow(record: Record<string, unknown>, profileIndex = 0): Record<string, Record<string, unknown>> {
    const profiles = record['vaultProfiles'] as { navRainbow: Record<string, Record<string, unknown>> }[];
    return profiles[profileIndex].navRainbow;
}

function getThemes(record: Record<string, unknown>): NavRainbowTheme[] {
    return record['navRainbowThemes'] as NavRainbowTheme[];
}

function createTheme(id: string, overrides: Partial<NavRainbowTheme> = {}): NavRainbowTheme {
    return {
        id,
        name: id,
        stops: [
            { color: '#111111', position: 0 },
            { color: '#222222', position: 100 }
        ],
        darkStops: [
            { color: '#333333', position: 0 },
            { color: '#444444', position: 100 }
        ],
        separateDarkStops: false,
        transitionStyle: 'rgb',
        consistentBrightness: true,
        ...overrides
    };
}

function createSettings(): NotebookNavigatorSettings {
    return structuredClone(DEFAULT_SETTINGS);
}

describe('migrateLegacyNavRainbowColors', () => {
    it('assigns the matching built-in theme to sections with the old default colors', () => {
        const record = createLegacyRecord(
            createLegacyNavRainbow({ shortcuts: createLegacySection({ enabled: true, transitionStyle: 'rgb' }) })
        );

        expect(migrateLegacyNavRainbowColors(record)).toBe(true);

        expect(getNavRainbow(record)).toEqual({
            mode: 'background',
            shortcuts: { theme: 'color-cycle' },
            recent: { theme: 'none' },
            folders: { theme: 'rainbow', scope: 'root' },
            tags: { theme: 'none', scope: 'all' },
            properties: { theme: 'none', scope: 'child' }
        });
        expect(getThemes(record)).toEqual([]);
    });

    it('turns custom colors into one theme shared by sections with the same colors', () => {
        const custom = { firstColor: '#ebb5b5', lastColor: '#bfb5e8' };
        const record = createLegacyRecord(
            createLegacyNavRainbow({
                folders: { ...createLegacySection({ ...custom, enabled: true }), scope: 'root' },
                tags: { ...createLegacySection({ ...custom, enabled: true }), scope: 'root' }
            })
        );

        migrateLegacyNavRainbowColors(record);

        const themes = getThemes(record);
        expect(themes).toHaveLength(1);
        expect(themes[0]).toMatchObject({
            name: 'Custom theme',
            stops: [
                { color: '#ebb5b5', position: 0 },
                { color: '#bfb5e8', position: 100 }
            ],
            darkStops: [
                { color: '#fb7185', position: 0 },
                { color: '#c084fc', position: 100 }
            ],
            separateDarkStops: false,
            transitionStyle: 'hue',
            consistentBrightness: true
        });
        expect(getNavRainbow(record).folders.theme).toBe(themes[0].id);
        expect(getNavRainbow(record).tags.theme).toBe(themes[0].id);
    });

    it('keeps the custom colors of disabled sections in the library without assigning them', () => {
        const record = createLegacyRecord(
            createLegacyNavRainbow({ properties: { ...createLegacySection({ firstColor: '#000000' }), scope: 'root' } })
        );

        migrateLegacyNavRainbowColors(record);

        expect(getThemes(record)).toHaveLength(1);
        expect(getThemes(record)[0].stops[0].color).toBe('#000000');
        expect(getNavRainbow(record).properties.theme).toBe('none');
    });

    it('keeps vault-wide toggles that differ from the old defaults in a custom theme', () => {
        const record = createLegacyRecord(createLegacyNavRainbow({ separateThemeColors: true }));

        migrateLegacyNavRainbowColors(record);

        // Only the enabled folders section gets a theme; disabled sections with default colors add none
        const themes = getThemes(record);
        expect(themes).toHaveLength(1);
        expect(themes[0]).toMatchObject({ name: 'Custom theme', separateDarkStops: true });
        expect(getNavRainbow(record).folders.theme).toBe(themes[0].id);
        expect(getNavRainbow(record).shortcuts.theme).toBe('none');
    });

    it('numbers the names when several custom themes are created', () => {
        const record = createLegacyRecord(
            createLegacyNavRainbow({
                folders: { ...createLegacySection({ enabled: true, firstColor: '#000000' }), scope: 'root' },
                tags: { ...createLegacySection({ enabled: true, firstColor: '#ffffff' }), scope: 'root' }
            })
        );

        migrateLegacyNavRainbowColors(record);

        expect(getThemes(record).map(theme => theme.name)).toEqual(['Custom theme 1', 'Custom theme 2']);
    });

    it('ignores dark colors and brightness settings that did not render', () => {
        // Earlier versions saved the light colors as dark shortcut and recent item colors
        const historicalDark = { darkFirstColor: '#ef4444', darkLastColor: '#8b5cf6' };
        const record = createLegacyRecord(
            createLegacyNavRainbow({
                balanceHueLuminance: false,
                shortcuts: createLegacySection({ ...historicalDark, enabled: true, transitionStyle: 'rgb' }),
                recent: createLegacySection({ ...historicalDark, transitionStyle: 'rgb' })
            })
        );

        migrateLegacyNavRainbowColors(record);

        expect(getNavRainbow(record).shortcuts.theme).toBe('color-cycle');
        // Brightness balancing changes hue gradients, so the hue sections get a custom theme
        const themes = getThemes(record);
        expect(themes).toHaveLength(1);
        expect(themes[0]).toMatchObject({ transitionStyle: 'hue', consistentBrightness: false });
        expect(getNavRainbow(record).folders.theme).toBe(themes[0].id);
    });

    it('keeps sections with different rendered dark colors in separate themes', () => {
        const record = createLegacyRecord(
            createLegacyNavRainbow({
                separateThemeColors: true,
                folders: { ...createLegacySection({ enabled: true, darkFirstColor: '#000000' }), scope: 'root' },
                tags: { ...createLegacySection({ enabled: true, darkFirstColor: '#ffffff' }), scope: 'root' }
            })
        );

        migrateLegacyNavRainbowColors(record);

        const navRainbow = getNavRainbow(record);
        expect(navRainbow.folders.theme).not.toBe(navRainbow.tags.theme);
        expect(getThemes(record).find(theme => theme.id === navRainbow.tags.theme)?.darkStops[0].color).toBe('#ffffff');
    });

    it('leaves converted profiles alone on later runs', () => {
        const custom = { ...createLegacySection({ firstColor: '#123456', enabled: true }), scope: 'root' };
        const record = createLegacyRecord(createLegacyNavRainbow({ folders: custom }));
        migrateLegacyNavRainbowColors(record);
        const converted = structuredClone(record);

        expect(migrateLegacyNavRainbowColors(record)).toBe(false);
        expect(record).toEqual(converted);
    });

    it('converts legacy colors in settings imports', () => {
        const navRainbow = createLegacyNavRainbow({
            folders: { ...createLegacySection({ firstColor: '#ebb5b5', enabled: true }), scope: 'all' }
        });
        const profile = { ...structuredClone(DEFAULT_SETTINGS.vaultProfiles[0]), navRainbow };

        const imported = applyModifiedSettingsTransfer(createSettings(), {
            plugin: 'notebook-navigator',
            pluginVersion: '3.5.1',
            settings: { vaultProfiles: [profile] }
        });

        const themes = imported['navRainbowThemes'] as NavRainbowTheme[];
        expect(themes).toHaveLength(1);
        expect(themes[0].stops[0].color).toBe('#ebb5b5');
        expect(getNavRainbow(imported).folders).toEqual({ theme: themes[0].id, scope: 'all' });
    });
});

describe('normalizeNavRainbowThemes', () => {
    it('drops invalid themes, ids that clash with built-in themes, and repeated ids', () => {
        const valid = createTheme('custom-a');
        const themes = normalizeNavRainbowThemes([
            valid,
            null,
            { ...valid, id: '' },
            { ...valid, id: 'rainbow' },
            { ...valid, id: 'none' },
            { ...valid, name: 'Second' },
            createTheme('custom-b', { stops: [{ color: '#111111', position: 0 }] }),
            createTheme('custom-c', {
                stops: [
                    { color: 'not a color', position: 0 },
                    { color: '#111111', position: 100 }
                ]
            })
        ]);

        expect(themes).toEqual([valid]);
    });

    it('sorts and clamps stops and fills in missing values', () => {
        const [theme] = normalizeNavRainbowThemes([
            {
                id: 'custom-a',
                stops: [
                    { color: ' #222222 ', position: 150 },
                    { color: '#111111', position: -5 },
                    { color: '#333333', position: 50 }
                ]
            }
        ]);

        expect(theme).toEqual({
            id: 'custom-a',
            name: '',
            stops: [
                { color: '#111111', position: 0 },
                { color: '#333333', position: 50 },
                { color: '#222222', position: 100 }
            ],
            darkStops: [
                { color: '#111111', position: 0 },
                { color: '#333333', position: 50 },
                { color: '#222222', position: 100 }
            ],
            separateDarkStops: false,
            transitionStyle: 'hue',
            consistentBrightness: true
        });
    });
});

describe('rainbow theme assignments', () => {
    it('sets section themes missing from the library to no theme', () => {
        const settings = createSettings();
        settings.navRainbowThemes = [createTheme('custom-a')];
        const navRainbow = settings.vaultProfiles[0].navRainbow;
        settings.vaultProfiles[0].navRainbow = {
            ...navRainbow,
            folders: { ...navRainbow.folders, theme: 'custom-a' },
            tags: { ...navRainbow.tags, theme: 'custom-missing' },
            shortcuts: { theme: 'fire' }
        };

        ensureVaultProfiles(settings);

        const result = settings.vaultProfiles[0].navRainbow;
        expect(result.folders.theme).toBe('custom-a');
        expect(result.tags.theme).toBe('none');
        expect(result.shortcuts.theme).toBe('fire');
    });

    it('keeps the rainbow color intensity within 0 to 100', () => {
        const settings = createSettings();
        const base = settings.vaultProfiles[0];
        settings.vaultProfiles = [150, 33.4, Number.NaN].map((intensity, index) => ({
            ...base,
            id: index === 0 ? 'default' : `profile-${index}`,
            navRainbow: { ...base.navRainbow, intensity }
        }));

        ensureVaultProfiles(settings);

        expect(settings.vaultProfiles.map(profile => profile.navRainbow.intensity)).toEqual([100, 33, 100]);
    });

    it('keeps custom theme assignments when a profile is duplicated', () => {
        const settings = createSettings();
        settings.navRainbowThemes = [createTheme('custom-a')];
        const source = settings.vaultProfiles[0];
        source.navRainbow = { ...source.navRainbow, recent: { theme: 'custom-a' } };

        const result = createValidatedVaultProfileFromTemplate(settings.vaultProfiles, 'Copy', { sourceProfile: source });

        expect('profile' in result && result.profile.navRainbow.recent.theme).toBe('custom-a');
    });
});
