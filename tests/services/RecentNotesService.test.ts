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

import { App, TFile } from 'obsidian';
import { describe, expect, it, vi } from 'vitest';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import { RecentNotesService } from '../../src/services/RecentNotesService';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import { ShortcutType, type ShortcutEntry } from '../../src/types/shortcuts';

interface TestVaultRegistration {
    registerFile(file: TFile): void;
}

function createSettings(shortcuts: ShortcutEntry[], overrides: Partial<NotebookNavigatorSettings> = {}): NotebookNavigatorSettings {
    const profile = DEFAULT_SETTINGS.vaultProfiles[0];
    return {
        ...DEFAULT_SETTINGS,
        ...overrides,
        vaultProfile: profile.id,
        vaultProfiles: [{ ...profile, shortcuts }]
    };
}

function createService(settings: NotebookNavigatorSettings, files: TFile[]) {
    const app = new App();
    const vault = app.vault as unknown as TestVaultRegistration;
    files.forEach(file => vault.registerFile(file));

    let recentNotes: string[] = [];
    const provider: ISettingsProvider = {
        settings,
        saveSettingsAndUpdate: vi.fn().mockResolvedValue(undefined),
        notifySettingsUpdate: vi.fn(),
        getRecentNotes: () => recentNotes,
        setRecentNotes: (next: string[]) => {
            recentNotes = next;
        },
        getRecentIcons: () => ({}),
        setRecentIcons: vi.fn(),
        getCollapsedPinnedContexts: () => ({}),
        updateCollapsedPinnedContexts: () => false,
        getRecentColors: () => [],
        setRecentColors: vi.fn()
    };

    return { service: new RecentNotesService(app, provider), getRecentNotes: () => recentNotes };
}

describe('RecentNotesService', () => {
    it('does not record notes that are shortcuts', () => {
        const shortcutNote = new TFile('Projects/Board.base');
        const otherNote = new TFile('Projects/Plan.md');
        const { service, getRecentNotes } = createService(createSettings([{ type: ShortcutType.NOTE, path: shortcutNote.path }]), [
            shortcutNote,
            otherNote
        ]);

        expect(service.recordFileOpen(shortcutNote)).toBe(false);
        expect(service.recordFileOpen(otherNote)).toBe(true);
        expect(getRecentNotes()).toEqual(['Projects/Plan.md']);
    });

    it('does not record a note whose shortcut path differs only in case', () => {
        const shortcutNote = new TFile('projects/board.md');
        const { service, getRecentNotes } = createService(createSettings([{ type: ShortcutType.NOTE, path: 'Projects/Board.md' }]), [
            shortcutNote
        ]);

        expect(service.recordFileOpen(shortcutNote)).toBe(false);
        expect(getRecentNotes()).toEqual([]);
    });

    it('records notes that are shortcuts when the shortcuts section is hidden', () => {
        const shortcutNote = new TFile('Projects/Board.md');
        const { service, getRecentNotes } = createService(
            createSettings([{ type: ShortcutType.NOTE, path: shortcutNote.path }], { showShortcuts: false }),
            [shortcutNote]
        );

        expect(service.recordFileOpen(shortcutNote)).toBe(true);
        expect(getRecentNotes()).toEqual(['Projects/Board.md']);
    });

    it('records notes whose folder is a shortcut', () => {
        const note = new TFile('Projects/Plan.md');
        const { service, getRecentNotes } = createService(createSettings([{ type: ShortcutType.FOLDER, path: 'Projects' }]), [note]);

        expect(service.recordFileOpen(note)).toBe(true);
        expect(getRecentNotes()).toEqual(['Projects/Plan.md']);
    });
});
