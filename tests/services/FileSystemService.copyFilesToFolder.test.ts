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

import { App, TFile, TFolder } from 'obsidian';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { strings } from '../../src/i18n';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import { FileSystemOperations } from '../../src/services/FileSystemService';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { showNotice } from '../../src/utils/noticeUtils';
import { sanitizeRecord } from '../../src/utils/recordUtils';
import { createTestTFile } from '../utils/createTestTFile';

vi.mock('../../src/utils/noticeUtils', () => ({ showNotice: vi.fn() }));

interface TestVaultMethods {
    registerFile(file: TFile): void;
    registerFolder(folder: TFolder): void;
}

function createContext(existingTargetNames: string[] = [], failingSourcePaths: string[] = []) {
    const app = new App();
    const vault = app.vault as App['vault'] & TestVaultMethods;
    const target = new TFolder('Projects');
    target.name = 'Projects';
    target.children = existingTargetNames.map(name => createTestTFile(`Projects/${name}`));
    vault.registerFolder(target);
    target.children.forEach(file => {
        if (file instanceof TFile) {
            vault.registerFile(file);
        }
    });

    const copy = vi.fn(async (source: TFile, path: string) => {
        if (failingSourcePaths.includes(source.path)) {
            throw new Error('Disk full');
        }
        // Model the filesystem refusing an occupied destination instead of accepting a path that would overwrite.
        if (vault.getAbstractFileByPath(path)) {
            throw new Error('Destination file already exists!');
        }
        const file = createTestTFile(path);
        vault.registerFile(file);
        target.children.push(file);
        return file;
    });
    Object.assign(app.vault, { copy });
    const openFile = vi.fn(async () => undefined);
    app.workspace = { getActiveFile: () => null, getLeaf: () => ({ openFile }) } as unknown as App['workspace'];

    const provider: ISettingsProvider = {
        settings: structuredClone(DEFAULT_SETTINGS),
        saveSettingsAndUpdate: vi.fn(async () => undefined),
        notifySettingsUpdate: vi.fn(),
        getRecentNotes: () => [],
        setRecentNotes: vi.fn(),
        getRecentIcons: () => sanitizeRecord<string[]>(undefined),
        setRecentIcons: vi.fn(),
        getCollapsedPinnedContexts: () => sanitizeRecord<boolean>(undefined),
        updateCollapsedPinnedContexts: () => false,
        getRecentColors: () => [],
        setRecentColors: vi.fn()
    };
    const operations = new FileSystemOperations(
        app,
        () => null,
        () => null,
        () => null,
        () => null,
        () => ({ includeDescendantNotes: false, showHiddenItems: false }),
        provider
    );
    return { target, operations, copy, openFile };
}

describe('copyFilesToFolder', () => {
    afterEach(() => {
        vi.mocked(showNotice).mockReset();
    });

    it('keeps the name in the target folder and does not open the copy', async () => {
        const context = createContext(['Other.md']);
        const source = createTestTFile('Notes/Plan.md');

        await context.operations.copyFilesToFolder([source], context.target);

        expect(context.copy).toHaveBeenCalledWith(source, 'Projects/Plan.md');
        expect(context.openFile).not.toHaveBeenCalled();
        expect(showNotice).toHaveBeenCalledWith(strings.dragDrop.notifications.fileCopied, { variant: 'success' });
    });

    it('gives the copy the next free numbered name instead of overwriting an existing file', async () => {
        const context = createContext(['Plan.md', 'Plan 1.md']);
        const source = createTestTFile('Notes/Plan.md');

        await context.operations.copyFilesToFolder([source], context.target);

        expect(context.copy).toHaveBeenCalledWith(source, 'Projects/Plan 2.md');
    });

    it('numbers an Excalidraw drawing before its .excalidraw suffix', async () => {
        const context = createContext(['Drawing.excalidraw.md']);
        const source = createTestTFile('Notes/Drawing.excalidraw.md');

        await context.operations.copyFilesToFolder([source], context.target);

        expect(context.copy).toHaveBeenCalledWith(source, 'Projects/Drawing 1.excalidraw.md');
    });

    it('gives same-named sources from different folders separate names', async () => {
        const context = createContext();
        const first = createTestTFile('Notes/Plan.md');
        const second = createTestTFile('Archive/Plan.md');

        await context.operations.copyFilesToFolder([first, second], context.target);

        expect(context.copy).toHaveBeenNthCalledWith(1, first, 'Projects/Plan.md');
        expect(context.copy).toHaveBeenNthCalledWith(2, second, 'Projects/Plan 1.md');
        expect(showNotice).toHaveBeenCalledWith(strings.dragDrop.notifications.filesCopied.replace('{count}', '2'), {
            variant: 'success'
        });
    });

    it('keeps copying after a failure and reports the copies and the failed file', async () => {
        const context = createContext([], ['Notes/A.md']);
        const failing = createTestTFile('Notes/A.md');
        const copied = createTestTFile('Notes/B.md');
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await context.operations.copyFilesToFolder([failing, copied], context.target);

        expect(context.copy).toHaveBeenLastCalledWith(copied, 'Projects/B.md');
        expect(showNotice).toHaveBeenCalledWith(strings.dragDrop.notifications.fileCopied, { variant: 'success' });
        expect(showNotice).toHaveBeenCalledWith(
            strings.dragDrop.errors.failedToCopy.replace('{name}', 'A.md').replace('{error}', 'Disk full'),
            { variant: 'warning' }
        );
        consoleError.mockRestore();
    });
});
