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

import { App } from 'obsidian';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import { resetMomentApiCacheForTests } from '../../src/utils/moment';
import { getNoteDisplayName } from '../../src/utils/noteNameFormat';
import { createTestTFile } from './createTestTFile';

// Obsidian provides window.moment at runtime; the real package renders date tokens in these tests.
const moment = (await vi.importActual<{ default: unknown }>('moment')).default;

function createSettings(overrides: Partial<NotebookNavigatorSettings> = {}): NotebookNavigatorSettings {
    const settings: NotebookNavigatorSettings = {
        ...structuredClone(DEFAULT_SETTINGS),
        calendarIntegrationMode: 'notebook-navigator',
        calendarCustomFilePattern: 'YYYY/YYYYMMDD',
        calendarLocale: 'en',
        dateFormat: 'YYYY-MM-DD',
        ...overrides
    };
    settings.vaultProfiles[0].periodicNotesFolder = 'Journal';
    return settings;
}

function createAppWithDailyNotes(options: { folder: string; format: string }): App {
    return {
        internalPlugins: {
            getPluginById: (pluginId: string) =>
                pluginId === 'daily-notes' ? { enabled: true, instance: { options: { ...options, template: '' } } } : undefined
        }
    } as unknown as App;
}

describe('getNoteDisplayName', () => {
    const app = new App();
    const dailyNote = createTestTFile('Journal/2026/20260110.md');
    const otherNote = createTestTFile('Projects/Plan.md');

    beforeAll(() => {
        Object.defineProperty(window, 'moment', { value: moment, configurable: true, writable: true });
        resetMomentApiCacheForTests();
    });

    afterAll(() => {
        Reflect.deleteProperty(window, 'moment');
        resetMomentApiCacheForTests();
    });

    it('shows the file name without extension when the note has no frontmatter name', () => {
        const settings = createSettings({ frontmatterNameFormat: '{{date:D MMM}} {{name}}' });

        expect(getNoteDisplayName(app, settings, dailyNote, undefined)).toBe('20260110');
        expect(getNoteDisplayName(app, settings, createTestTFile('Drawing.excalidraw.md'), undefined)).toBe('Drawing');
    });

    it.each(['{{name}}', '', '   '])('shows the frontmatter name unchanged with the format %j', format => {
        expect(getNoteDisplayName(app, createSettings({ frontmatterNameFormat: format }), dailyNote, 'Ski trip')).toBe('Ski trip');
    });

    it('inserts the file name and the frontmatter name', () => {
        const settings = createSettings({ frontmatterNameFormat: '{{filename}} | {{name}}' });

        expect(getNoteDisplayName(app, settings, dailyNote, 'Ski trip')).toBe('20260110 | Ski trip');
        expect(getNoteDisplayName(app, settings, otherNote, 'Q3 plan')).toBe('Plan | Q3 plan');
    });

    it('inserts the daily note date read from the path, not the created date', () => {
        const settings = createSettings({ frontmatterNameFormat: '{{date:D MMM}} {{name}}' });

        expect(getNoteDisplayName(app, settings, dailyNote, 'Ski trip')).toBe('10 Jan Ski trip');
    });

    it('formats {{date}} with the list date format', () => {
        const settings = createSettings({ frontmatterNameFormat: '{{date}}: {{name}}', dateFormat: 'MMMM D, YYYY' });

        expect(getNoteDisplayName(app, settings, dailyNote, 'Ski trip')).toBe('January 10, 2026: Ski trip');
    });

    it('shows only the frontmatter name for notes that are not daily notes when the format uses {{date}}', () => {
        const settings = createSettings({ frontmatterNameFormat: '{{date:D MMM}} | {{name}}' });

        expect(getNoteDisplayName(app, settings, otherNote, 'Q3 plan')).toBe('Q3 plan');
        // Inside the periodic notes folder but not matching the daily note pattern
        expect(getNoteDisplayName(app, settings, createTestTFile('Journal/2026/Ideas.md'), 'Ideas')).toBe('Ideas');
    });

    it('keeps unknown tokens as text', () => {
        const settings = createSettings({ frontmatterNameFormat: '{{title}} {{name}} {{date:}}' });

        expect(getNoteDisplayName(app, settings, otherNote, 'Q3 plan')).toBe('{{title}} Q3 plan {{date:}}');
    });

    it('reads daily note dates with the current calendar settings', () => {
        const format = '{{date:D MMM}} {{name}}';
        const settings = createSettings({ frontmatterNameFormat: format });
        expect(getNoteDisplayName(app, settings, dailyNote, 'Ski trip')).toBe('10 Jan Ski trip');

        const changedPattern = createSettings({ frontmatterNameFormat: format, calendarCustomFilePattern: 'YYYY/YYYYDDMM' });
        expect(getNoteDisplayName(app, changedPattern, dailyNote, 'Ski trip')).toBe('1 Oct Ski trip');

        const changedFolder = createSettings({ frontmatterNameFormat: format });
        changedFolder.vaultProfiles[0].periodicNotesFolder = 'Diary';
        expect(getNoteDisplayName(app, changedFolder, dailyNote, 'Ski trip')).toBe('Ski trip');
    });

    it('keeps the daily note date when the time zone changes', () => {
        const settings = createSettings({ frontmatterNameFormat: '{{date:YYYY-MM-DD}} {{name}}' });
        const previousTimeZone = process.env.TZ;
        try {
            process.env.TZ = 'Europe/Stockholm';
            expect(getNoteDisplayName(app, settings, dailyNote, 'Ski trip')).toBe('2026-01-10 Ski trip');
            process.env.TZ = 'America/New_York';
            expect(getNoteDisplayName(app, settings, dailyNote, 'Ski trip')).toBe('2026-01-10 Ski trip');
        } finally {
            if (previousTimeZone === undefined) {
                delete process.env.TZ;
            } else {
                process.env.TZ = previousTimeZone;
            }
        }
    });

    it('reads daily note dates from the Daily Notes core plugin settings in Daily Notes mode', () => {
        const settings = createSettings({ calendarIntegrationMode: 'daily-notes', frontmatterNameFormat: '{{date:D MMM}} {{name}}' });
        const note = createTestTFile('Daily/2026-01-10.md');

        expect(getNoteDisplayName(createAppWithDailyNotes({ folder: 'Daily', format: 'YYYY-MM-DD' }), settings, note, 'Ski trip')).toBe(
            '10 Jan Ski trip'
        );
        expect(getNoteDisplayName(createAppWithDailyNotes({ folder: 'Daily', format: 'YYYY-DD-MM' }), settings, note, 'Ski trip')).toBe(
            '1 Oct Ski trip'
        );
        expect(getNoteDisplayName(app, settings, note, 'Ski trip')).toBe('Ski trip');
    });
});
