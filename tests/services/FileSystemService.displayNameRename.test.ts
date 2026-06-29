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

import { describe, expect, it, vi } from 'vitest';
import { App, TFolder, type TFile } from 'obsidian';
import { FileSystemOperations } from '../../src/services/FileSystemService';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import { createTestTFile } from '../utils/createTestTFile';

vi.mock('../../src/modals/ConfirmModal', () => ({
    ConfirmModal: class ConfirmModal {
        open(): void {}
    }
}));

vi.mock('../../src/modals/FolderSuggestModal', () => ({
    FolderSuggestModal: class FolderSuggestModal {}
}));

vi.mock('../../src/modals/InputModal', () => ({
    InputModal: class InputModal {
        open(): void {}
    }
}));

type FrontmatterFile = TFile & { frontmatter: Record<string, unknown> };
type TestFolder = TFolder & {
    children: TFile[];
    name: string;
    parent: TFolder | null;
    vault: App['vault'];
};

function createSettingsProvider(settings: NotebookNavigatorSettings): ISettingsProvider {
    return {
        settings,
        saveSettingsAndUpdate: vi.fn().mockResolvedValue(undefined),
        notifySettingsUpdate: vi.fn(),
        getRecentNotes: () => [],
        setRecentNotes: vi.fn(),
        getRecentIcons: () => ({}),
        setRecentIcons: vi.fn(),
        getRecentColors: () => [],
        setRecentColors: vi.fn()
    };
}

function createSettings(overrides: Partial<NotebookNavigatorSettings>): NotebookNavigatorSettings {
    return { ...DEFAULT_SETTINGS, ...overrides };
}

function createOperations(app: App, settings: NotebookNavigatorSettings): FileSystemOperations {
    return new FileSystemOperations(
        app,
        () => null,
        () => null,
        () => null,
        () => null,
        () => ({ includeDescendantNotes: false, showHiddenItems: false }),
        createSettingsProvider(settings)
    );
}

function createFile(path: string, frontmatter: Record<string, unknown>): FrontmatterFile {
    return Object.assign(createTestTFile(path), { frontmatter });
}

function installFrontmatterMocks(app: App): ReturnType<typeof vi.fn> {
    app.metadataCache.getFileCache = (file: TFile) => ({
        frontmatter: (file as Partial<FrontmatterFile>).frontmatter
    });
    const processFrontMatter = vi.fn(async (file: TFile, callback: (frontmatter: Record<string, unknown>) => void) => {
        callback((file as FrontmatterFile).frontmatter);
    });
    app.fileManager.processFrontMatter = processFrontMatter;
    return processFrontMatter;
}

function createFolderWithFolderNote(app: App, folderPath: string): { folder: TestFolder; folderNote: FrontmatterFile } {
    const folder = new TFolder(folderPath) as TestFolder;
    folder.name = folderPath.split('/').pop() ?? folderPath;
    folder.parent = app.vault.getRoot();
    folder.vault = app.vault;
    folder.children = [];

    const folderNote = createFile(`${folderPath}/${folder.name}.md`, {});
    (folderNote as TFile & { parent: TFolder }).parent = folder;
    folder.children.push(folderNote);

    const vault = app.vault as App['vault'] & {
        registerFolder: (target: TFolder) => void;
        registerFile: (target: TFile) => void;
    };
    vault.registerFolder(folder);
    vault.registerFile(folderNote);

    return { folder, folderNote };
}

describe('FileSystemOperations display-name rename', () => {
    it('prefills missing file frontmatter names with the file name and skips unchanged writes', async () => {
        const app = new App();
        const processFrontMatter = installFrontmatterMocks(app);
        const file = createFile('Note.md', {});
        const operations = createOperations(
            app,
            createSettings({
                useFrontmatterMetadata: true,
                frontmatterNameField: 'title, name'
            })
        );

        expect(operations.getFileDisplayNameRenameInput(file).initialValue).toBe('Note');
        await expect(operations.renameFileDisplayName(file, 'Note')).resolves.toBe(true);

        expect(file.frontmatter).toEqual({});
        expect(processFrontMatter).not.toHaveBeenCalled();
    });

    it('edits missing file frontmatter name when the value changes', async () => {
        const app = new App();
        const processFrontMatter = installFrontmatterMocks(app);
        const file = createFile('Note.md', {});
        const operations = createOperations(
            app,
            createSettings({
                useFrontmatterMetadata: true,
                frontmatterNameField: 'title, name'
            })
        );

        await expect(operations.renameFileDisplayName(file, 'Display title')).resolves.toBe(true);

        expect(file.frontmatter).toEqual({ title: 'Display title' });
        expect(processFrontMatter).toHaveBeenCalledWith(file, expect.any(Function));
    });

    it('renames the file path when frontmatter display names are not active', async () => {
        const app = new App();
        const file = createFile('Note.md', {});
        (file as TFile & { parent: TFolder }).parent = app.vault.getRoot();
        const renameFile = vi.fn().mockResolvedValue(undefined);
        app.fileManager.renameFile = renameFile;
        const operations = createOperations(
            app,
            createSettings({
                useFrontmatterMetadata: false,
                frontmatterNameField: 'title'
            })
        );

        expect(operations.getFileDisplayNameRenameInput(file).initialValue).toBe('Note');
        await expect(operations.renameFileDisplayName(file, 'Renamed')).resolves.toBe(true);

        expect(renameFile).toHaveBeenCalledWith(file, 'Renamed.md');
    });

    it('edits folder-note frontmatter name and starts with the folder name when no value exists', async () => {
        const app = new App();
        const processFrontMatter = installFrontmatterMocks(app);
        const { folder, folderNote } = createFolderWithFolderNote(app, 'Projects');
        const operations = createOperations(
            app,
            createSettings({
                enableFolderNotes: true,
                useFrontmatterMetadata: true,
                frontmatterNameField: 'title'
            })
        );

        expect(operations.getFolderDisplayNameRenameInput(folder).initialValue).toBe('Projects');
        await expect(operations.renameFolderDisplayName(folder, 'Project display')).resolves.toBe(true);

        expect(folderNote.frontmatter).toEqual({ title: 'Project display' });
        expect(processFrontMatter).toHaveBeenCalledWith(folderNote, expect.any(Function));
    });
});
