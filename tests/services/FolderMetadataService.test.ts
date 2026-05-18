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
import { App, TFile, TFolder } from 'obsidian';
import { FolderMetadataService } from '../../src/services/metadata/FolderMetadataService';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import { ShortcutType } from '../../src/types/shortcuts';

type MetadataChangeEvent = {
    path: string;
    changes: {
        metadata?: Record<string, unknown>;
        preview?: string | null;
    };
    metadataNameChanged?: boolean;
};

function isMetadataChangeListener(value: unknown): value is (changes: MetadataChangeEvent[]) => void {
    return typeof value === 'function';
}

const {
    getFileMock,
    updateFileMetadataMock,
    getFolderNoteMock,
    getFolderNoteDetectionSettingsMock,
    onContentChangeMock,
    getDBInstanceOrNullMock
} = vi.hoisted(() => ({
    getFileMock: vi.fn(),
    updateFileMetadataMock: vi.fn(),
    getFolderNoteMock: vi.fn(),
    onContentChangeMock: vi.fn<(listener: (changes: MetadataChangeEvent[]) => void) => () => void>().mockImplementation(() => () => {}),
    getDBInstanceOrNullMock: vi.fn(),
    getFolderNoteDetectionSettingsMock: vi.fn((settings: NotebookNavigatorSettings) => ({
        enableFolderNotes: settings.enableFolderNotes,
        folderNoteName: settings.folderNoteName,
        folderNoteNamePattern: settings.folderNoteNamePattern
    }))
}));

vi.mock('../../src/storage/fileOperations', () => ({
    getDBInstance: () => ({
        getFile: getFileMock,
        updateFileMetadata: updateFileMetadataMock,
        onContentChange: onContentChangeMock
    }),
    getDBInstanceOrNull: getDBInstanceOrNullMock
}));

vi.mock('../../src/utils/folderNotes', () => ({
    getFolderNote: getFolderNoteMock,
    getFolderNoteDetectionSettings: getFolderNoteDetectionSettingsMock
}));

class TestSettingsProvider implements ISettingsProvider {
    private readonly settingsUpdateListeners = new Map<string, () => void>();

    constructor(public settings: NotebookNavigatorSettings) {}

    saveSettingsAndUpdate = vi.fn().mockResolvedValue(undefined);

    notifySettingsUpdate(): void {
        this.settingsUpdateListeners.forEach(listener => {
            listener();
        });
    }

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

    registerSettingsUpdateListener(id: string, callback: () => void): void {
        this.settingsUpdateListeners.set(id, callback);
    }

    unregisterSettingsUpdateListener(id: string): void {
        this.settingsUpdateListeners.delete(id);
    }
}

function createSettings(): NotebookNavigatorSettings {
    return {
        ...DEFAULT_SETTINGS,
        useFrontmatterMetadata: true,
        enableFolderNotes: true,
        frontmatterIconField: 'icon',
        frontmatterColorField: 'color',
        frontmatterBackgroundField: 'background',
        folderIcons: {},
        folderColors: {},
        folderBackgroundColors: {}
    };
}

describe('FolderMetadataService folder note frontmatter integration', () => {
    let app: App;
    let service: FolderMetadataService;
    let settingsProvider: TestSettingsProvider;
    let folderNoteFile: TFile;
    let frontmatter: Record<string, unknown>;
    const processFrontMatter = vi.fn();
    const getFolderByPath = vi.fn();

    beforeEach(() => {
        getFileMock.mockReset();
        updateFileMetadataMock.mockReset();
        onContentChangeMock.mockReset();
        onContentChangeMock.mockImplementation(() => () => {});
        getDBInstanceOrNullMock.mockReset();
        getDBInstanceOrNullMock.mockImplementation(() => ({
            getFile: getFileMock,
            updateFileMetadata: updateFileMetadataMock,
            onContentChange: onContentChangeMock
        }));
        getFolderNoteMock.mockReset();
        getFolderNoteDetectionSettingsMock.mockClear();
        processFrontMatter.mockReset();
        getFolderByPath.mockReset();

        updateFileMetadataMock.mockResolvedValue(undefined);

        settingsProvider = new TestSettingsProvider(createSettings());
        folderNoteFile = new TFile();
        folderNoteFile.path = 'Projects/Projects.md';
        folderNoteFile.extension = 'md';
        frontmatter = {};

        processFrontMatter.mockImplementation((_file: TFile, callback: (fm: Record<string, unknown>) => void) => {
            callback(frontmatter);
            return Promise.resolve();
        });

        getFolderByPath.mockImplementation((path: string) => {
            if (path !== 'Projects') {
                return null;
            }
            return {
                path: 'Projects',
                name: 'Projects'
            };
        });

        getFolderNoteMock.mockReturnValue(folderNoteFile);
        getFileMock.mockImplementation((path: string) => {
            if (path !== folderNoteFile.path) {
                return null;
            }
            return { metadata: {} };
        });

        const vaultListeners = new Map<string, Set<(...data: unknown[]) => unknown>>();
        app = new App();
        app.vault.getFolderByPath = getFolderByPath;
        Object.defineProperty(app.vault, 'on', {
            configurable: true,
            value: (name: string, callback: (...data: unknown[]) => unknown) => {
                const listeners = vaultListeners.get(name);
                if (listeners) {
                    listeners.add(callback);
                } else {
                    vaultListeners.set(name, new Set([callback]));
                }
                return {};
            }
        });
        Object.defineProperty(app.vault, 'offref', {
            configurable: true,
            value: vi.fn()
        });
        Object.defineProperty(app.vault, 'trigger', {
            configurable: true,
            value: (name: string, ...data: unknown[]) => {
                const listeners = vaultListeners.get(name);
                if (!listeners) {
                    return;
                }
                listeners.forEach(listener => {
                    listener(...data);
                });
            }
        });
        app.fileManager.processFrontMatter = processFrontMatter;

        service = new FolderMetadataService(app, settingsProvider);
    });

    it('writes icon, color, and background in one processFrontMatter call when setting folder style', async () => {
        await service.setFolderStyle('Projects', {
            icon: 'phosphor:ph-apple-logo',
            color: '#112233',
            backgroundColor: '#223344'
        });

        expect(processFrontMatter).toHaveBeenCalledTimes(1);
        expect(frontmatter.icon).toBe('ph-apple-logo');
        expect(frontmatter.color).toBe('#112233');
        expect(frontmatter.background).toBe('#223344');
        expect(updateFileMetadataMock).toHaveBeenCalledWith(folderNoteFile.path, {
            icon: 'phosphor:apple-logo',
            color: '#112233',
            background: '#223344'
        });
    });

    it('writes current folder icon and background together with updated color in one processFrontMatter call', async () => {
        settingsProvider.settings.folderIcons['Projects'] = 'phosphor:ph-apple-logo';
        settingsProvider.settings.folderBackgroundColors['Projects'] = '#223344';

        await service.setFolderColor('Projects', '#112233');

        expect(processFrontMatter).toHaveBeenCalledTimes(1);
        expect(frontmatter.icon).toBe('ph-apple-logo');
        expect(frontmatter.color).toBe('#112233');
        expect(frontmatter.background).toBe('#223344');
        expect(updateFileMetadataMock).toHaveBeenCalledWith(folderNoteFile.path, {
            icon: 'phosphor:apple-logo',
            color: '#112233',
            background: '#223344'
        });
    });

    it('renames folder shortcuts that uniquely match the old path with different casing', async () => {
        settingsProvider.settings.vaultProfiles = [
            {
                ...DEFAULT_SETTINGS.vaultProfiles[0],
                shortcuts: [{ type: ShortcutType.FOLDER, path: 'appLab/SKILLS-WORKFLOWS/mmgi' }]
            }
        ];
        app.vault.getAllLoadedFiles = vi.fn(() => [new TFolder('applab/skills-workflows/mmgi-renamed')]);

        await service.handleFolderRename('applab/skills-workflows/mmgi', 'applab/skills-workflows/mmgi-renamed');

        expect(settingsProvider.settings.vaultProfiles[0].shortcuts).toEqual([
            { type: ShortcutType.FOLDER, path: 'applab/skills-workflows/mmgi-renamed' }
        ]);
    });

    it('removes folder shortcuts that uniquely match the deleted path with different casing', async () => {
        settingsProvider.settings.vaultProfiles = [
            {
                ...DEFAULT_SETTINGS.vaultProfiles[0],
                shortcuts: [{ type: ShortcutType.FOLDER, path: 'appLab/SKILLS-WORKFLOWS/mmgi' }]
            }
        ];
        app.vault.getAllLoadedFiles = vi.fn(() => []);

        await service.handleFolderDelete('applab/skills-workflows/mmgi');

        expect(settingsProvider.settings.vaultProfiles[0].shortcuts).toEqual([]);
    });

    it('does not remove ambiguous casefolded folder shortcuts', async () => {
        settingsProvider.settings.vaultProfiles = [
            {
                ...DEFAULT_SETTINGS.vaultProfiles[0],
                shortcuts: [{ type: ShortcutType.FOLDER, path: 'appLab/SKILLS-WORKFLOWS/mmgi' }]
            }
        ];
        app.vault.getAllLoadedFiles = vi.fn(() => [new TFolder('applab/skills-workflows/MMGI')]);

        await service.handleFolderDelete('applab/skills-workflows/mmgi');

        expect(settingsProvider.settings.vaultProfiles[0].shortcuts).toEqual([
            { type: ShortcutType.FOLDER, path: 'appLab/SKILLS-WORKFLOWS/mmgi' }
        ]);
    });

    it('prefers folder note icon/color/background when frontmatter metadata is enabled', () => {
        settingsProvider.settings.folderIcons['Projects'] = 'lucide-folder';
        settingsProvider.settings.folderColors['Projects'] = '#aaaaaa';
        settingsProvider.settings.folderBackgroundColors['Projects'] = '#bbbbbb';
        getFileMock.mockReturnValue({
            metadata: {
                icon: 'phosphor:apple-logo',
                color: '#112233',
                background: '#223344'
            }
        });

        const result = service.getFolderDisplayData('Projects');

        expect(result.icon).toBe('phosphor:apple-logo');
        expect(result.color).toBe('#112233');
        expect(result.backgroundColor).toBe('#223344');
    });

    it('ignores invalid style color updates while applying valid icon updates', async () => {
        await service.setFolderStyle('Projects', {
            icon: 'phosphor:ph-apple-logo',
            color: 'not-a-color'
        });

        expect(processFrontMatter).toHaveBeenCalledTimes(1);
        expect(frontmatter.icon).toBe('ph-apple-logo');
        expect(Reflect.has(frontmatter, 'color')).toBe(false);
        expect(updateFileMetadataMock).toHaveBeenCalledWith(folderNoteFile.path, {
            icon: 'phosphor:apple-logo'
        });
    });

    it('updates only requested frontmatter fields when cached metadata is stale', async () => {
        frontmatter = {
            icon: 'PhCurrentIcon',
            color: '#445566',
            background: '#778899'
        };
        getFileMock.mockReturnValue({
            metadata: {
                icon: 'phosphor:archive-box',
                color: '#000000',
                background: '#111111'
            }
        });

        await service.setFolderStyle('Projects', {
            color: '#112233'
        });

        expect(processFrontMatter).toHaveBeenCalledTimes(1);
        expect(frontmatter.icon).toBe('PhCurrentIcon');
        expect(frontmatter.color).toBe('#112233');
        expect(frontmatter.background).toBe('#778899');
        expect(updateFileMetadataMock).toHaveBeenCalledWith(folderNoteFile.path, {
            color: '#112233'
        });
    });

    it('can exclude inherited folder colors when resolving display data', () => {
        settingsProvider.settings.inheritFolderColors = true;
        settingsProvider.settings.folderColors['Projects'] = '#112233';

        const directOnly = service.getFolderDisplayData('Projects/Child', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false,
            includeInheritedColors: false
        });
        expect(directOnly.color).toBeUndefined();

        const withInheritance = service.getFolderDisplayData('Projects/Child', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false,
            includeInheritedColors: true
        });
        expect(withInheritance.color).toBe('#112233');
    });

    it('inherits parent frontmatter folder styles for child folders', () => {
        settingsProvider.settings.inheritFolderColors = true;
        const projectsFolderNote = new TFile();
        projectsFolderNote.path = 'Projects/Projects.md';
        projectsFolderNote.extension = 'md';

        getFolderByPath.mockImplementation((path: string) => {
            if (path === 'Projects') {
                return {
                    path,
                    name: 'Projects'
                };
            }
            if (path === 'Projects/Child') {
                return {
                    path,
                    name: 'Child'
                };
            }
            return null;
        });
        getFolderNoteMock.mockImplementation((folder: { path: string }) => {
            if (folder.path === 'Projects') {
                return projectsFolderNote;
            }
            return null;
        });
        getFileMock.mockImplementation((path: string) => {
            if (path === projectsFolderNote.path) {
                return {
                    metadata: {
                        color: '#112233',
                        background: '#223344'
                    }
                };
            }
            return null;
        });

        const withInheritance = service.getFolderDisplayData('Projects/Child', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: true,
            includeIcon: false,
            includeInheritedColors: true
        });

        expect(withInheritance.color).toBe('#112233');
        expect(withInheritance.backgroundColor).toBe('#223344');
    });

    it('invalidates cached descendant folder styles when parent folder note metadata changes', () => {
        settingsProvider.settings.inheritFolderColors = true;
        const projectsFolderNote = new TFile();
        projectsFolderNote.path = 'Projects/Projects.md';
        projectsFolderNote.extension = 'md';
        let parentColor = '#112233';

        getFolderByPath.mockImplementation((path: string) => {
            if (path === 'Projects') {
                return {
                    path,
                    name: 'Projects'
                };
            }
            if (path === 'Projects/Child') {
                return {
                    path,
                    name: 'Child'
                };
            }
            return null;
        });
        getFolderNoteMock.mockImplementation((folder: { path: string }) => {
            if (folder.path === 'Projects') {
                return projectsFolderNote;
            }
            return null;
        });
        getFileMock.mockImplementation((path: string) => {
            if (path === projectsFolderNote.path) {
                return {
                    metadata: {
                        color: parentColor
                    }
                };
            }
            return null;
        });

        const displayOptions = {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false,
            includeInheritedColors: true
        };

        const first = service.getFolderDisplayData('Projects/Child', displayOptions);
        const cached = service.getFolderDisplayData('Projects/Child', displayOptions);
        expect(first.color).toBe('#112233');
        expect(cached.color).toBe('#112233');
        const initialReadCount = getFileMock.mock.calls.length;
        expect(initialReadCount).toBeGreaterThan(0);

        const listenerCandidate = onContentChangeMock.mock.calls[0]?.[0];
        if (!isMetadataChangeListener(listenerCandidate)) {
            throw new Error('Expected content change listener');
        }

        parentColor = '#445566';
        listenerCandidate([
            {
                path: projectsFolderNote.path,
                changes: { metadata: { color: '#445566' } }
            }
        ]);

        const refreshed = service.getFolderDisplayData('Projects/Child', displayOptions);
        expect(refreshed.color).toBe('#445566');
        expect(getFileMock.mock.calls.length).toBeGreaterThan(initialReadCount);
    });

    it('keeps unrelated folder display cache entries when updating folder icon', async () => {
        const projectsFolderNote = new TFile();
        projectsFolderNote.path = 'Projects/Projects.md';
        projectsFolderNote.extension = 'md';
        const notesFolderNote = new TFile();
        notesFolderNote.path = 'Notes/Notes.md';
        notesFolderNote.extension = 'md';

        getFolderByPath.mockImplementation((path: string) => {
            if (path === 'Projects' || path === 'Notes') {
                return {
                    path,
                    name: path
                };
            }
            return null;
        });
        getFolderNoteMock.mockImplementation((folder: { path: string }) => {
            if (folder.path === 'Projects') {
                return projectsFolderNote;
            }
            if (folder.path === 'Notes') {
                return notesFolderNote;
            }
            return null;
        });
        getFileMock.mockImplementation((path: string) => {
            if (path === projectsFolderNote.path) {
                return {
                    metadata: {
                        color: '#112233'
                    }
                };
            }
            if (path === notesFolderNote.path) {
                return {
                    metadata: {
                        color: '#445566'
                    }
                };
            }
            return null;
        });

        const displayOptions = {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        };
        service.getFolderDisplayData('Projects', displayOptions);
        service.getFolderDisplayData('Notes', displayOptions);
        expect(getFileMock).toHaveBeenCalledTimes(2);

        await service.setFolderStyle('Projects', {
            icon: 'phosphor:ph-apple-logo'
        });

        service.getFolderDisplayData('Notes', displayOptions);
        expect(getFileMock).toHaveBeenCalledTimes(2);
    });

    it('invalidates cached descendant folder colors when parent color changes', async () => {
        settingsProvider.settings.useFrontmatterMetadata = false;
        settingsProvider.settings.inheritFolderColors = true;
        settingsProvider.settings.folderColors['Projects'] = '#112233';

        const displayOptions = {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false,
            includeInheritedColors: true
        };

        const first = service.getFolderDisplayData('Projects/Child', displayOptions);
        const cached = service.getFolderDisplayData('Projects/Child', displayOptions);
        expect(first.color).toBe('#112233');
        expect(cached.color).toBe('#112233');

        await service.setFolderStyle('Projects', {
            color: '#445566'
        });

        const refreshed = service.getFolderDisplayData('Projects/Child', displayOptions);
        expect(refreshed.color).toBe('#445566');
    });

    it('evicts only the oldest folder display cache entry when capacity is exceeded', () => {
        const displayOptions = {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        };

        getFolderByPath.mockImplementation((path: string) => ({
            path,
            name: path
        }));
        getFolderNoteMock.mockImplementation((folder: { path: string }) => {
            const file = new TFile();
            file.path = `${folder.path}/_folder-note.md`;
            file.extension = 'md';
            return file;
        });
        getFileMock.mockImplementation((path: string) => ({
            metadata: {
                color: path
            }
        }));

        for (let index = 0; index < 1000; index += 1) {
            service.getFolderDisplayData(`Projects/${index}`, displayOptions);
        }
        service.getFolderDisplayData('Projects/1000', displayOptions);
        const callCountAfterFill = getFileMock.mock.calls.length;
        expect(callCountAfterFill).toBe(1001);

        service.getFolderDisplayData('Projects/1', displayOptions);
        expect(getFileMock).toHaveBeenCalledTimes(callCountAfterFill);

        service.getFolderDisplayData('Projects/0', displayOptions);
        expect(getFileMock).toHaveBeenCalledTimes(callCountAfterFill + 1);
    });

    it('invalidates folder display cache when frontmatter settings change', () => {
        getFileMock.mockReturnValue({
            metadata: {
                color: '#112233'
            }
        });

        const first = service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });
        const second = service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        expect(first.color).toBe('#112233');
        expect(second.color).toBe('#112233');
        expect(getFileMock).toHaveBeenCalledTimes(1);

        settingsProvider.settings.frontmatterColorField = '';

        const third = service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        expect(third.color).toBeUndefined();
        expect(getFileMock).toHaveBeenCalledTimes(1);
    });

    it('invalidates folder display cache when synced folder style settings change', () => {
        settingsProvider.settings.useFrontmatterMetadata = false;
        settingsProvider.settings.folderColors['Projects'] = '#112233';

        const first = service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });
        const second = service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        expect(first.color).toBe('#112233');
        expect(second.color).toBe('#112233');

        settingsProvider.settings.folderColors['Projects'] = '#445566';
        settingsProvider.notifySettingsUpdate();

        const updated = service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        expect(updated.color).toBe('#445566');
    });

    it('does not invalidate folder display cache for non-folder-note markdown vault changes', () => {
        getFileMock.mockReturnValue({
            metadata: {
                color: '#112233'
            }
        });

        service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });
        service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        expect(getFileMock).toHaveBeenCalledTimes(1);

        const otherFile = new TFile();
        otherFile.path = 'Projects/Meeting Notes.md';
        otherFile.extension = 'md';
        app.vault.trigger('create', otherFile);

        service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        expect(getFileMock).toHaveBeenCalledTimes(1);
    });

    it('skips folder style record diff checks when folder display cache is empty', () => {
        settingsProvider.settings.useFrontmatterMetadata = false;

        const compareSpy = vi.spyOn(
            service as unknown as { hasFolderStyleRecordSnapshotChanged: () => boolean },
            'hasFolderStyleRecordSnapshotChanged'
        );

        settingsProvider.notifySettingsUpdate();
        expect(compareSpy).toHaveBeenCalledTimes(0);

        service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        settingsProvider.notifySettingsUpdate();
        expect(compareSpy).toHaveBeenCalledTimes(1);
    });

    it('keeps cached folder display data on no-op settings updates when folder style records are empty', () => {
        getFileMock.mockReturnValue({
            metadata: {
                color: '#112233'
            }
        });

        service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });
        service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        expect(getFileMock).toHaveBeenCalledTimes(1);

        settingsProvider.notifySettingsUpdate();

        service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        expect(getFileMock).toHaveBeenCalledTimes(1);
    });

    it('invalidates folder display cache only for tracked folder note metadata changes', () => {
        getFileMock.mockReturnValue({
            metadata: {
                color: '#112233'
            }
        });

        service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });
        service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        expect(getFileMock).toHaveBeenCalledTimes(1);
        const listenerCandidate = onContentChangeMock.mock.calls[0]?.[0];
        if (!isMetadataChangeListener(listenerCandidate)) {
            throw new Error('Expected content change listener');
        }

        listenerCandidate([
            {
                path: 'Notes/Note.md',
                changes: { metadata: { color: '#ffffff' } }
            }
        ]);
        service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });
        expect(getFileMock).toHaveBeenCalledTimes(1);

        listenerCandidate([
            {
                path: 'Projects/Projects.md',
                changes: { metadata: { color: '#000000' } }
            }
        ]);
        service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });
        expect(getFileMock).toHaveBeenCalledTimes(2);
    });

    it('invalidates folder display cache when tracked folder note receives non-metadata changes', () => {
        getFileMock
            .mockReturnValueOnce({
                metadata: {
                    color: '#112233'
                }
            })
            .mockReturnValueOnce({
                metadata: {
                    color: '#445566'
                }
            });

        service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });
        service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        expect(getFileMock).toHaveBeenCalledTimes(1);
        const listenerCandidate = onContentChangeMock.mock.calls[0]?.[0];
        if (!isMetadataChangeListener(listenerCandidate)) {
            throw new Error('Expected content change listener');
        }

        listenerCandidate([
            {
                path: 'Projects/Projects.md',
                changes: { preview: 'updated' }
            }
        ]);

        const refreshed = service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        expect(refreshed.color).toBe('#445566');
        expect(getFileMock).toHaveBeenCalledTimes(2);
    });

    it('refreshes cached folder display data when a folder note rename invalidates cached entries', () => {
        getFileMock.mockImplementation((path: string) => {
            if (path === 'Projects/Projects.md') {
                return {
                    metadata: {
                        color: '#112233'
                    }
                };
            }
            if (path === 'Projects/index.md') {
                return {
                    metadata: {
                        color: '#445566'
                    }
                };
            }
            return null;
        });

        const first = service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });
        const cached = service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        expect(first.color).toBe('#112233');
        expect(cached.color).toBe('#112233');
        expect(getFileMock).toHaveBeenCalledTimes(1);

        folderNoteFile.path = 'Projects/index.md';
        app.vault.trigger('rename', folderNoteFile, 'Projects/Projects.md');

        const refreshed = service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        expect(refreshed.color).toBe('#445566');
        expect(getFileMock).toHaveBeenCalledTimes(2);
    });

    it('applies fallback folder style updates in one settings save when frontmatter metadata is disabled', async () => {
        settingsProvider.settings.useFrontmatterMetadata = false;

        await service.setFolderStyle('Projects', {
            icon: 'phosphor:ph-apple-logo',
            color: '#112233',
            backgroundColor: '#223344'
        });

        expect(settingsProvider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
        expect(settingsProvider.settings.folderIcons['Projects']).toBe('phosphor:apple-logo');
        expect(settingsProvider.settings.folderColors['Projects']).toBe('#112233');
        expect(settingsProvider.settings.folderBackgroundColors['Projects']).toBe('#223344');
    });

    it('does not sanitize folder style records for no-op fallback updates', async () => {
        settingsProvider.settings.useFrontmatterMetadata = false;
        settingsProvider.settings.folderIcons = {
            Projects: 'phosphor:apple-logo'
        };
        settingsProvider.settings.folderColors = {
            Projects: '#112233'
        };
        settingsProvider.settings.folderBackgroundColors = {
            Projects: '#223344'
        };

        const folderIconsRef = settingsProvider.settings.folderIcons;
        const folderColorsRef = settingsProvider.settings.folderColors;
        const folderBackgroundColorsRef = settingsProvider.settings.folderBackgroundColors;
        expect(Object.getPrototypeOf(folderIconsRef)).toBe(Object.prototype);
        expect(Object.getPrototypeOf(folderColorsRef)).toBe(Object.prototype);
        expect(Object.getPrototypeOf(folderBackgroundColorsRef)).toBe(Object.prototype);

        await service.setFolderStyle('Projects', {
            icon: 'phosphor:ph-apple-logo',
            color: '#112233',
            backgroundColor: '#223344'
        });

        expect(settingsProvider.saveSettingsAndUpdate).not.toHaveBeenCalled();
        expect(settingsProvider.settings.folderIcons).toBe(folderIconsRef);
        expect(settingsProvider.settings.folderColors).toBe(folderColorsRef);
        expect(settingsProvider.settings.folderBackgroundColors).toBe(folderBackgroundColorsRef);
        expect(Object.getPrototypeOf(settingsProvider.settings.folderIcons)).toBe(Object.prototype);
        expect(Object.getPrototypeOf(settingsProvider.settings.folderColors)).toBe(Object.prototype);
        expect(Object.getPrototypeOf(settingsProvider.settings.folderBackgroundColors)).toBe(Object.prototype);
    });

    it('notifies folder style listener when frontmatter-only style updates change direct metadata', async () => {
        const folderNoteMetadata: { icon?: string; color?: string; background?: string } = {};
        getFileMock.mockImplementation((path: string) => {
            if (path !== folderNoteFile.path) {
                return null;
            }
            return { metadata: { ...folderNoteMetadata } };
        });
        updateFileMetadataMock.mockImplementation(
            async (_path: string, metadata: { icon?: string; color?: string; background?: string }) => {
                if (Reflect.has(metadata, 'icon')) {
                    if (metadata.icon === undefined) {
                        delete folderNoteMetadata.icon;
                    } else {
                        folderNoteMetadata.icon = metadata.icon;
                    }
                }
                if (Reflect.has(metadata, 'color')) {
                    if (metadata.color === undefined) {
                        delete folderNoteMetadata.color;
                    } else {
                        folderNoteMetadata.color = metadata.color;
                    }
                }
                if (Reflect.has(metadata, 'background')) {
                    if (metadata.background === undefined) {
                        delete folderNoteMetadata.background;
                    } else {
                        folderNoteMetadata.background = metadata.background;
                    }
                }
            }
        );
        const folderStyleListener = vi.fn();
        service.setFolderStyleChangeListener(folderStyleListener);

        await service.setFolderStyle('Projects', {
            color: '#112233'
        });

        expect(settingsProvider.saveSettingsAndUpdate).not.toHaveBeenCalled();
        expect(folderStyleListener).toHaveBeenCalledTimes(1);
        expect(folderStyleListener).toHaveBeenCalledWith('Projects');
    });

    it('does not notify folder style listener when frontmatter-only style updates keep direct metadata unchanged', async () => {
        const folderNoteMetadata: { icon?: string; color?: string; background?: string } = {
            color: '#112233'
        };
        getFileMock.mockImplementation((path: string) => {
            if (path !== folderNoteFile.path) {
                return null;
            }
            return { metadata: { ...folderNoteMetadata } };
        });
        updateFileMetadataMock.mockImplementation(
            async (_path: string, metadata: { icon?: string; color?: string; background?: string }) => {
                if (Reflect.has(metadata, 'icon')) {
                    if (metadata.icon === undefined) {
                        delete folderNoteMetadata.icon;
                    } else {
                        folderNoteMetadata.icon = metadata.icon;
                    }
                }
                if (Reflect.has(metadata, 'color')) {
                    if (metadata.color === undefined) {
                        delete folderNoteMetadata.color;
                    } else {
                        folderNoteMetadata.color = metadata.color;
                    }
                }
                if (Reflect.has(metadata, 'background')) {
                    if (metadata.background === undefined) {
                        delete folderNoteMetadata.background;
                    } else {
                        folderNoteMetadata.background = metadata.background;
                    }
                }
            }
        );
        const folderStyleListener = vi.fn();
        service.setFolderStyleChangeListener(folderStyleListener);

        await service.setFolderStyle('Projects', {
            color: '#112233'
        });

        expect(settingsProvider.saveSettingsAndUpdate).not.toHaveBeenCalled();
        expect(folderStyleListener).not.toHaveBeenCalled();
    });

    it('disposes the folder display cache listener', () => {
        const unsubscribe = vi.fn();
        onContentChangeMock.mockReset();
        onContentChangeMock.mockImplementation((_listener: (changes: MetadataChangeEvent[]) => void) => unsubscribe);
        service = new FolderMetadataService(app, settingsProvider);

        service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false
        });

        service.dispose();
        service.dispose();

        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('returns null folder note metadata when database instance is unavailable', () => {
        getDBInstanceOrNullMock.mockReturnValue(null);

        const result = service.getFolderDisplayData('Projects', {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: true,
            includeIcon: true
        });

        expect(result.color).toBeUndefined();
        expect(result.backgroundColor).toBeUndefined();
        expect(result.icon).toBeUndefined();
        expect(getFileMock).not.toHaveBeenCalled();
    });

    it('detects folder display-name metadata changes for folder-note paths', () => {
        const unrelatedChanges: MetadataChangeEvent[] = [
            {
                path: 'Notes/General.md',
                changes: { metadata: { name: 'General' } },
                metadataNameChanged: true
            }
        ];
        expect(service.hasFolderDisplayNameMetadataChanges(unrelatedChanges)).toBe(false);

        const folderNoteChanges: MetadataChangeEvent[] = [
            {
                path: 'Projects/Projects.md',
                changes: { metadata: { name: 'Work' } },
                metadataNameChanged: true
            }
        ];
        expect(service.hasFolderDisplayNameMetadataChanges(folderNoteChanges)).toBe(true);
    });

    it('detects folder display-name metadata changes without folder lookups for matching candidate paths', () => {
        const folderNoteChanges: MetadataChangeEvent[] = [
            {
                path: 'Projects/Projects.md',
                changes: { metadata: { name: 'Work' } },
                metadataNameChanged: true
            }
        ];

        expect(service.hasFolderDisplayNameMetadataChanges(folderNoteChanges)).toBe(true);
        expect(getFolderByPath).not.toHaveBeenCalled();
    });

    it('detects root folder display-name metadata changes using the root folder name', () => {
        Object.defineProperty(app.vault, 'getRoot', {
            configurable: true,
            value: () => ({ name: 'VaultRoot' })
        });
        settingsProvider.settings.folderNoteName = '';
        settingsProvider.settings.folderNoteNamePattern = '';

        const rootFolderNoteChanges: MetadataChangeEvent[] = [
            {
                path: 'VaultRoot.md',
                changes: { metadata: { name: 'Vault home' } },
                metadataNameChanged: true
            }
        ];

        expect(service.hasFolderDisplayNameMetadataChanges(rootFolderNoteChanges)).toBe(true);
    });

    it('detects folder display-name metadata changes when another file in the same folder changed first', () => {
        const batchedChanges: MetadataChangeEvent[] = [
            {
                path: 'Projects/Unrelated.md',
                changes: { metadata: { name: 'Unrelated' } },
                metadataNameChanged: true
            },
            {
                path: 'Projects/Projects.md',
                changes: { metadata: { name: 'Work' } },
                metadataNameChanged: true
            }
        ];

        expect(service.hasFolderDisplayNameMetadataChanges(batchedChanges)).toBe(true);
    });

    it('ignores folder display-name metadata changes when metadata name was not changed', () => {
        const folderMetadataChanges: MetadataChangeEvent[] = [
            {
                path: 'Projects/Projects.md',
                changes: { metadata: { color: '#112233' } },
                metadataNameChanged: false
            }
        ];
        expect(service.hasFolderDisplayNameMetadataChanges(folderMetadataChanges)).toBe(false);
    });

    it('ignores folder display-name metadata changes when frontmatter metadata is disabled', () => {
        settingsProvider.settings.useFrontmatterMetadata = false;

        const folderNoteChanges: MetadataChangeEvent[] = [
            {
                path: 'Projects/Projects.md',
                changes: { metadata: { name: 'Work' } },
                metadataNameChanged: true
            }
        ];
        expect(service.hasFolderDisplayNameMetadataChanges(folderNoteChanges)).toBe(false);
    });

    it('notifies folder display-name listeners for metadata name updates', () => {
        service.getFolderDisplayData('Projects', {
            includeDisplayName: true,
            includeColor: false,
            includeBackgroundColor: false,
            includeIcon: false
        });

        const initialVersion = service.getFolderDisplayNameVersion();
        const listener = vi.fn();
        const unsubscribe = service.subscribeToFolderDisplayNameChanges(listener);

        const listenerCandidate = onContentChangeMock.mock.calls[0]?.[0];
        if (!isMetadataChangeListener(listenerCandidate)) {
            throw new Error('Expected content change listener');
        }

        listenerCandidate([
            {
                path: 'Projects/Projects.md',
                changes: { metadata: { name: 'Work' } },
                metadataNameChanged: true
            }
        ]);

        expect(service.getFolderDisplayNameVersion()).toBe(initialVersion + 1);
        expect(listener).toHaveBeenCalledWith(initialVersion + 1);

        listenerCandidate([
            {
                path: 'Projects/Projects.md',
                changes: { metadata: { color: '#112233' } },
                metadataNameChanged: false
            }
        ]);

        expect(service.getFolderDisplayNameVersion()).toBe(initialVersion + 1);
        unsubscribe();
    });

    it('notifies folder display-name listeners when display-name settings change', () => {
        service.getFolderDisplayData('Projects', {
            includeDisplayName: true,
            includeColor: false,
            includeBackgroundColor: false,
            includeIcon: false
        });

        const initialVersion = service.getFolderDisplayNameVersion();
        const listener = vi.fn();
        const unsubscribe = service.subscribeToFolderDisplayNameChanges(listener);

        settingsProvider.settings.folderNoteName = 'index';
        settingsProvider.notifySettingsUpdate();

        expect(service.getFolderDisplayNameVersion()).toBe(initialVersion + 1);
        expect(listener).toHaveBeenCalledWith(initialVersion + 1);

        unsubscribe();
    });

    it('does not notify folder display-name listeners when non-display-name settings change', () => {
        service.getFolderDisplayData('Projects', {
            includeDisplayName: true,
            includeColor: false,
            includeBackgroundColor: false,
            includeIcon: false
        });

        const initialVersion = service.getFolderDisplayNameVersion();
        const listener = vi.fn();
        const unsubscribe = service.subscribeToFolderDisplayNameChanges(listener);

        settingsProvider.settings.frontmatterColorField = 'folderColor';
        settingsProvider.notifySettingsUpdate();

        expect(service.getFolderDisplayNameVersion()).toBe(initialVersion);
        expect(listener).not.toHaveBeenCalled();

        unsubscribe();
    });

    it('notifies folder display-name listeners for folder-note vault file events', () => {
        service.getFolderDisplayData('Projects', {
            includeDisplayName: true,
            includeColor: false,
            includeBackgroundColor: false,
            includeIcon: false
        });

        const initialVersion = service.getFolderDisplayNameVersion();
        const listener = vi.fn();
        const unsubscribe = service.subscribeToFolderDisplayNameChanges(listener);

        const createdFolderNote = new TFile();
        createdFolderNote.path = 'Projects/Projects.md';
        createdFolderNote.extension = 'md';
        app.vault.trigger('create', createdFolderNote);

        const renamedFolderNote = new TFile();
        renamedFolderNote.path = 'Projects/Projects.canvas';
        renamedFolderNote.extension = 'canvas';
        app.vault.trigger('rename', renamedFolderNote, 'Projects/Projects.md');

        const deletedFolderNote = new TFile();
        deletedFolderNote.path = 'Projects/Projects.canvas';
        deletedFolderNote.extension = 'canvas';
        app.vault.trigger('delete', deletedFolderNote);

        expect(service.getFolderDisplayNameVersion()).toBe(initialVersion + 3);
        expect(listener).toHaveBeenNthCalledWith(1, initialVersion + 1);
        expect(listener).toHaveBeenNthCalledWith(2, initialVersion + 2);
        expect(listener).toHaveBeenNthCalledWith(3, initialVersion + 3);

        unsubscribe();
    });
});

describe('FolderMetadataService folder color inheritance', () => {
    let app: App;
    let service: FolderMetadataService;
    let settingsProvider: TestSettingsProvider;

    beforeEach(() => {
        getFileMock.mockReset();
        updateFileMetadataMock.mockReset();
        onContentChangeMock.mockReset();
        onContentChangeMock.mockImplementation(() => () => {});
        getDBInstanceOrNullMock.mockReset();
        getDBInstanceOrNullMock.mockImplementation(() => ({
            getFile: getFileMock,
            updateFileMetadata: updateFileMetadataMock,
            onContentChange: onContentChangeMock
        }));

        settingsProvider = new TestSettingsProvider({
            ...createSettings(),
            useFrontmatterMetadata: false,
            enableFolderNotes: false
        });

        const vaultListeners = new Map<string, Set<(...data: unknown[]) => unknown>>();
        app = new App();
        Object.defineProperty(app.vault, 'on', {
            configurable: true,
            value: (name: string, callback: (...data: unknown[]) => unknown) => {
                const listeners = vaultListeners.get(name);
                if (listeners) {
                    listeners.add(callback);
                } else {
                    vaultListeners.set(name, new Set([callback]));
                }
                return {};
            }
        });
        Object.defineProperty(app.vault, 'offref', {
            configurable: true,
            value: vi.fn()
        });

        service = new FolderMetadataService(app, settingsProvider);
    });

    it('inherits root folder color when inheritance is enabled', () => {
        settingsProvider.settings.inheritFolderColors = true;
        settingsProvider.settings.folderColors = { '/': '#ff0000' };

        expect(service.getFolderColor('Projects')).toBe('#ff0000');
        expect(service.getFolderColor('Projects/Client')).toBe('#ff0000');
    });

    it('does not inherit root folder color when inheritance is disabled', () => {
        settingsProvider.settings.inheritFolderColors = false;
        settingsProvider.settings.folderColors = { '/': '#ff0000' };

        expect(service.getFolderColor('Projects')).toBeUndefined();
    });

    it('prefers nearest ancestor color over root folder color', () => {
        settingsProvider.settings.inheritFolderColors = true;
        settingsProvider.settings.folderColors = { '/': '#ff0000', Projects: '#00ff00' };

        expect(service.getFolderColor('Projects/Client')).toBe('#00ff00');
    });

    it('inherits root folder background color when inheritance is enabled', () => {
        settingsProvider.settings.inheritFolderColors = true;
        settingsProvider.settings.folderBackgroundColors = { '/': '#0000ff' };

        expect(
            service.getFolderDisplayData('Projects', {
                includeDisplayName: false,
                includeColor: false,
                includeBackgroundColor: true,
                includeIcon: false,
                includeInheritedColors: true
            }).backgroundColor
        ).toBe('#0000ff');
    });
});
