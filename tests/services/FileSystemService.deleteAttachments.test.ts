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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App, type CachedMetadata, type LinkCache, type TFile } from 'obsidian';
import { FileSystemOperations } from '../../src/services/FileSystemService';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import { createTestTFile } from '../utils/createTestTFile';
import { promptDeleteFileAttachments } from '../../src/modals/DeleteFileAttachmentsModal';

vi.mock('../../src/modals/DeleteFileAttachmentsModal', () => ({
    promptDeleteFileAttachments: vi.fn()
}));

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

function createLinkCache(link: string): LinkCache {
    return {
        link,
        original: `[[${link}]]`,
        position: {
            start: { line: 0, col: 0, offset: 0 },
            end: { line: 0, col: 0, offset: 0 }
        }
    };
}

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

function createContext(setting: NotebookNavigatorSettings['deleteAttachments']) {
    const app = new App();
    const settings: NotebookNavigatorSettings = {
        ...DEFAULT_SETTINGS,
        deleteAttachments: setting
    };

    const metadataByPath = new Map<string, CachedMetadata>();
    const filesByPath = new Map<string, TFile>();
    const trashFile = vi.fn<(file: TFile) => Promise<void>>(async () => undefined);

    app.metadataCache.getFileCache = (file: TFile) => metadataByPath.get(file.path) ?? null;
    app.metadataCache.getFirstLinkpathDest = (path: string) => filesByPath.get(path) ?? null;
    app.metadataCache.resolvedLinks = {};
    app.vault.getFileByPath = (path: string) => filesByPath.get(path) ?? null;
    app.fileManager.trashFile = trashFile;

    const operations = new FileSystemOperations(
        app,
        () => null,
        () => null,
        () => null,
        () => null,
        () => ({ includeDescendantNotes: false, showHiddenItems: false }),
        createSettingsProvider(settings)
    );

    return { app, metadataByPath, filesByPath, trashFile, operations };
}

describe('FileSystemOperations attachment deletion', () => {
    const promptDeleteFileAttachmentsMock = vi.mocked(promptDeleteFileAttachments);

    beforeEach(() => {
        promptDeleteFileAttachmentsMock.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('keeps single-file delete successful when attachment prompt fails', async () => {
        const { app, metadataByPath, filesByPath, trashFile, operations } = createContext('ask');
        const source = createTestTFile('notes/source.md');
        const attachment = createTestTFile('assets/photo.png');

        metadataByPath.set(source.path, {
            links: [createLinkCache(attachment.path)]
        });
        filesByPath.set(attachment.path, attachment);
        app.metadataCache.resolvedLinks = {
            [source.path]: {
                [attachment.path]: 1
            }
        };

        promptDeleteFileAttachmentsMock.mockRejectedValueOnce(new Error('modal failed'));

        await expect(operations.deleteFile(source, false)).resolves.toBeUndefined();
        expect(trashFile).toHaveBeenCalledTimes(1);
        expect(trashFile).toHaveBeenCalledWith(source);
    });

    it('keeps linked attachments when still referenced by another file', async () => {
        const { app, metadataByPath, filesByPath, trashFile, operations } = createContext('ask');
        const source = createTestTFile('notes/source.md');
        const otherSource = createTestTFile('notes/other.md');
        const attachment = createTestTFile('assets/shared.png');

        metadataByPath.set(source.path, {
            links: [createLinkCache(attachment.path)]
        });
        filesByPath.set(attachment.path, attachment);
        app.metadataCache.resolvedLinks = {
            [source.path]: {
                [attachment.path]: 1
            },
            [otherSource.path]: {
                [attachment.path]: 1
            }
        };

        await expect(operations.deleteFile(source, false)).resolves.toBeUndefined();

        expect(promptDeleteFileAttachmentsMock).not.toHaveBeenCalled();
        expect(trashFile).toHaveBeenCalledTimes(1);
        expect(trashFile).toHaveBeenCalledWith(source);
    });

    it('deletes orphan attachments without prompting when setting is always', async () => {
        const { app, metadataByPath, filesByPath, trashFile, operations } = createContext('always');
        const source = createTestTFile('notes/source.md');
        const attachment = createTestTFile('assets/photo.png');

        metadataByPath.set(source.path, {
            links: [createLinkCache(attachment.path)]
        });
        filesByPath.set(attachment.path, attachment);
        app.metadataCache.resolvedLinks = {
            [source.path]: {
                [attachment.path]: 1
            }
        };

        await expect(operations.deleteFile(source, false)).resolves.toBeUndefined();

        expect(promptDeleteFileAttachmentsMock).not.toHaveBeenCalled();
        const trashedPaths = trashFile.mock.calls
            .map(call => call[0])
            .filter((value): value is TFile => {
                return value !== null && typeof value === 'object' && 'path' in value && typeof value.path === 'string';
            })
            .map(file => file.path)
            .sort((a, b) => a.localeCompare(b));
        expect(trashedPaths).toEqual([attachment.path, source.path].sort((a, b) => a.localeCompare(b)));
    });

    it('skips attachment cleanup when setting is never', async () => {
        const { app, metadataByPath, filesByPath, trashFile, operations } = createContext('never');
        const source = createTestTFile('notes/source.md');
        const attachment = createTestTFile('assets/photo.png');

        metadataByPath.set(source.path, {
            links: [createLinkCache(attachment.path)]
        });
        filesByPath.set(attachment.path, attachment);
        app.metadataCache.resolvedLinks = {
            [source.path]: {
                [attachment.path]: 1
            }
        };

        await expect(operations.deleteFile(source, false)).resolves.toBeUndefined();

        expect(promptDeleteFileAttachmentsMock).not.toHaveBeenCalled();
        expect(trashFile).toHaveBeenCalledTimes(1);
        expect(trashFile).toHaveBeenCalledWith(source);
    });

    it('prompts for Excalidraw companion previews when deleting the source file', async () => {
        const { filesByPath, trashFile, operations } = createContext('ask');
        const source = createTestTFile('Drawings/Sketch.excalidraw.md');
        const plainPreview = createTestTFile('Drawings/Sketch.excalidraw.png');
        const darkPreview = createTestTFile('Drawings/Sketch.excalidraw.dark.png');
        const lightPreview = createTestTFile('Drawings/Sketch.excalidraw.light.png');

        [plainPreview, darkPreview, lightPreview].forEach(file => {
            filesByPath.set(file.path, file);
        });
        promptDeleteFileAttachmentsMock.mockImplementationOnce(async (_app, files) => files);

        await expect(operations.deleteFile(source, false)).resolves.toBeUndefined();

        expect(promptDeleteFileAttachmentsMock).toHaveBeenCalledTimes(1);
        const promptCall = promptDeleteFileAttachmentsMock.mock.calls[0];
        if (!promptCall) {
            throw new Error('Attachment prompt call not found');
        }
        expect(promptCall[1].map(file => file.path).sort((a, b) => a.localeCompare(b))).toEqual(
            [darkPreview.path, lightPreview.path, plainPreview.path].sort((a, b) => a.localeCompare(b))
        );

        const trashedPaths = trashFile.mock.calls
            .map(call => call[0])
            .filter((value): value is TFile => {
                return value !== null && typeof value === 'object' && 'path' in value && typeof value.path === 'string';
            })
            .map(file => file.path)
            .sort((a, b) => a.localeCompare(b));
        expect(trashedPaths).toEqual(
            [darkPreview.path, lightPreview.path, plainPreview.path, source.path].sort((a, b) => a.localeCompare(b))
        );
    });

    it('deduplicates shared attachment candidates in multi-delete', async () => {
        const { app, metadataByPath, filesByPath, trashFile, operations } = createContext('ask');
        const sourceOne = createTestTFile('notes/source-one.md');
        const sourceTwo = createTestTFile('notes/source-two.md');
        const sharedAttachment = createTestTFile('assets/shared.png');

        metadataByPath.set(sourceOne.path, {
            links: [createLinkCache(sharedAttachment.path)]
        });
        metadataByPath.set(sourceTwo.path, {
            links: [createLinkCache(sharedAttachment.path)]
        });
        filesByPath.set(sharedAttachment.path, sharedAttachment);
        app.metadataCache.resolvedLinks = {
            [sourceOne.path]: {
                [sharedAttachment.path]: 1
            },
            [sourceTwo.path]: {
                [sharedAttachment.path]: 1
            }
        };

        promptDeleteFileAttachmentsMock.mockImplementationOnce(async (_app, files) => files);

        await expect(operations.deleteMultipleFiles([sourceOne, sourceTwo], false)).resolves.toBeUndefined();

        expect(promptDeleteFileAttachmentsMock).toHaveBeenCalledTimes(1);
        const promptCall = promptDeleteFileAttachmentsMock.mock.calls[0];
        if (!promptCall) {
            throw new Error('Attachment prompt call not found');
        }
        const promptedPaths = promptCall[1].map(file => file.path);
        expect(promptedPaths).toEqual([sharedAttachment.path]);

        const trashedPaths = trashFile.mock.calls
            .map(call => call[0])
            .filter((value): value is TFile => {
                return value !== null && typeof value === 'object' && 'path' in value && typeof value.path === 'string';
            })
            .map(file => file.path)
            .sort((a, b) => a.localeCompare(b));
        expect(trashedPaths).toEqual([sharedAttachment.path, sourceOne.path, sourceTwo.path].sort((a, b) => a.localeCompare(b)));
    });

    it('keeps multi-delete successful when attachment prompt fails', async () => {
        const { app, metadataByPath, filesByPath, trashFile, operations } = createContext('ask');
        const source = createTestTFile('notes/source.md');
        const attachment = createTestTFile('assets/archive.zip');

        metadataByPath.set(source.path, {
            links: [createLinkCache(attachment.path)]
        });
        filesByPath.set(attachment.path, attachment);
        app.metadataCache.resolvedLinks = {
            [source.path]: {
                [attachment.path]: 1
            }
        };

        promptDeleteFileAttachmentsMock.mockRejectedValueOnce(new Error('modal failed'));

        await expect(operations.deleteMultipleFiles([source], false)).resolves.toBeUndefined();
        expect(trashFile).toHaveBeenCalledTimes(1);
        expect(trashFile).toHaveBeenCalledWith(source);
    });
});
