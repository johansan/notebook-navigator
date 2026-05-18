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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App, TFile } from 'obsidian';
import { FileMetadataService } from '../../src/services/metadata/FileMetadataService';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import { extractMetadataFromCache } from '../../src/utils/metadataExtractor';
import { ShortcutType } from '../../src/types/shortcuts';

const updateFileMetadata = vi.fn();

vi.mock('../../src/storage/fileOperations', () => ({
    getDBInstance: () => ({
        updateFileMetadata
    })
}));

class TestSettingsProvider implements ISettingsProvider {
    constructor(public settings: NotebookNavigatorSettings) {}

    saveSettingsAndUpdate = vi.fn().mockResolvedValue(undefined);

    notifySettingsUpdate(): void {}

    getRecentNotes(): string[] {
        return [];
    }

    setRecentNotes(): void {}

    getRecentIcons(): Record<string, string[]> {
        return {};
    }

    setRecentIcons(): void {}

    getRecentColors(): string[] {
        return [];
    }

    setRecentColors(): void {}
}

function createSettings(): NotebookNavigatorSettings {
    return {
        ...DEFAULT_SETTINGS,
        useFrontmatterMetadata: true,
        frontmatterIconField: 'icon',
        fileIcons: {},
        fileColors: {}
    };
}

describe('FileMetadataService frontmatter integration', () => {
    let app: App;
    let service: FileMetadataService;
    let settingsProvider: TestSettingsProvider;
    let file: TFile;
    let frontmatter: Record<string, unknown>;
    const processFrontMatter = vi.fn();
    const getAbstractFileByPath = vi.fn();

    beforeEach(() => {
        updateFileMetadata.mockReset();
        updateFileMetadata.mockResolvedValue(undefined);
        processFrontMatter.mockReset();
        getAbstractFileByPath.mockReset();

        const settings = createSettings();
        settingsProvider = new TestSettingsProvider(settings);

        file = new TFile();
        file.path = 'Vault/Note.md';
        file.extension = 'md';
        frontmatter = {};

        processFrontMatter.mockImplementation((_tfile: TFile, callback: (fm: Record<string, unknown>) => void) => {
            callback(frontmatter);
            return Promise.resolve();
        });
        getAbstractFileByPath.mockImplementation((path: string) => (path === file.path ? file : null));

        app = new App();
        app.vault.getAbstractFileByPath = getAbstractFileByPath;
        app.fileManager.processFrontMatter = processFrontMatter;

        service = new FileMetadataService(app, settingsProvider);
    });

    it('saves phosphor icons in the short slug format and extracts canonical metadata', async () => {
        await service.setFileIcon(file.path, 'phosphor:ph-apple-logo');

        expect(processFrontMatter).toHaveBeenCalledTimes(1);
        expect(frontmatter.icon).toBe('ph-apple-logo');
        expect(updateFileMetadata).toHaveBeenCalledWith(file.path, { icon: 'phosphor:apple-logo' });

        const metadata = extractMetadataFromCache({ frontmatter: { icon: frontmatter.icon } }, settingsProvider.settings);
        expect(metadata.icon).toBe('phosphor:apple-logo');
    });

    it('pins notes in a single settings update', async () => {
        settingsProvider.settings.pinnedNotes = {};

        const pinnedCount = await service.pinNotes(['Vault/One.md', 'Vault/Two.md'], 'folder');

        expect(pinnedCount).toBe(2);
        expect(settingsProvider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
        expect(settingsProvider.settings.pinnedNotes?.['Vault/One.md']).toEqual({ folder: true, tag: false, property: false });
        expect(settingsProvider.settings.pinnedNotes?.['Vault/Two.md']).toEqual({ folder: true, tag: false, property: false });
    });

    it('renames note shortcuts that uniquely match the old path with different casing', async () => {
        settingsProvider.settings.vaultProfiles = [
            {
                ...DEFAULT_SETTINGS.vaultProfiles[0],
                shortcuts: [{ type: ShortcutType.NOTE, path: 'appLab/SKILLS-WORKFLOWS/mmgi/Note.md' }]
            }
        ];
        getAbstractFileByPath.mockReturnValue(null);
        app.vault.getAllLoadedFiles = vi.fn(() => [new TFile('applab/skills-workflows/mmgi/Renamed.md')]);

        await service.handleFileRename('applab/skills-workflows/mmgi/Note.md', 'applab/skills-workflows/mmgi/Renamed.md');

        expect(settingsProvider.settings.vaultProfiles[0].shortcuts).toEqual([
            { type: ShortcutType.NOTE, path: 'applab/skills-workflows/mmgi/Renamed.md' }
        ]);
    });

    it('does not rename ambiguous casefolded note shortcuts', async () => {
        settingsProvider.settings.vaultProfiles = [
            {
                ...DEFAULT_SETTINGS.vaultProfiles[0],
                shortcuts: [{ type: ShortcutType.NOTE, path: 'appLab/SKILLS-WORKFLOWS/mmgi/Note.md' }]
            }
        ];
        getAbstractFileByPath.mockReturnValue(null);
        app.vault.getAllLoadedFiles = vi.fn(() => [new TFile('applab/skills-workflows/mmgi/note.md')]);

        await service.handleFileRename('applab/skills-workflows/mmgi/Note.md', 'applab/skills-workflows/mmgi/Renamed.md');

        expect(settingsProvider.settings.vaultProfiles[0].shortcuts).toEqual([
            { type: ShortcutType.NOTE, path: 'appLab/SKILLS-WORKFLOWS/mmgi/Note.md' }
        ]);
    });

    it('counts only newly pinned notes in folder context', async () => {
        settingsProvider.settings.pinnedNotes = {
            'Vault/One.md': { folder: true, tag: false, property: false }
        };

        const pinnedCount = await service.pinNotes(['Vault/One.md', 'Vault/Two.md'], 'folder');

        expect(pinnedCount).toBe(1);
        expect(settingsProvider.settings.pinnedNotes?.['Vault/One.md']).toEqual({ folder: true, tag: false, property: false });
        expect(settingsProvider.settings.pinnedNotes?.['Vault/Two.md']).toEqual({ folder: true, tag: false, property: false });
    });

    it('pins notes in property context', async () => {
        settingsProvider.settings.pinnedNotes = {};

        const pinnedCount = await service.pinNotes(['Vault/One.md'], 'property');

        expect(pinnedCount).toBe(1);
        expect(settingsProvider.settings.pinnedNotes?.['Vault/One.md']).toEqual({ folder: false, tag: false, property: true });
    });

    it('unpins legacy folder+tag pins from property context on toggle', async () => {
        settingsProvider.settings.pinnedNotes = {
            'Vault/Legacy.md': { folder: true, tag: true }
        } as unknown as NotebookNavigatorSettings['pinnedNotes'];

        await service.togglePinnedNote('Vault/Legacy.md', 'property');

        expect(settingsProvider.settings.pinnedNotes?.['Vault/Legacy.md']).toEqual({ folder: true, tag: true, property: false });
    });

    it('does not count legacy folder+tag pins as newly pinned in property context', async () => {
        settingsProvider.settings.pinnedNotes = {
            'Vault/Legacy.md': { folder: true, tag: true }
        } as unknown as NotebookNavigatorSettings['pinnedNotes'];

        const pinnedCount = await service.pinNotes(['Vault/Legacy.md'], 'property');

        expect(pinnedCount).toBe(0);
    });
});
