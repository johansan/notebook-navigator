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
import { App, type TFile } from 'obsidian';
import { FileSystemOperations } from '../../src/services/FileSystemService';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import type { FileData, PropertyItem } from '../../src/storage/IndexedDBStorage';
import { PropertyTreeService } from '../../src/services/PropertyTreeService';
import {
    buildPropertyKeyNodeId,
    buildPropertyTreeFromDatabase,
    buildPropertyValueNodeId,
    normalizePropertyTreeValuePath
} from '../../src/utils/propertyTree';
import type { PropertyTreeDatabaseLike } from '../../src/utils/propertyTree';
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

interface MockFile {
    path: string;
    properties: PropertyItem[] | null;
}

function createFileData(properties: PropertyItem[] | null): FileData {
    return {
        mtime: 0,
        markdownPipelineMtime: 0,
        tagsMtime: 0,
        metadataMtime: 0,
        fileThumbnailsMtime: 0,
        tags: null,
        wordCount: null,
        taskTotal: 0,
        taskUnfinished: 0,
        properties,
        previewStatus: 'unprocessed',
        featureImage: null,
        featureImageStatus: 'unprocessed',
        featureImageKey: null,
        metadata: null
    };
}

function createMockDb(files: MockFile[]): PropertyTreeDatabaseLike {
    const payload = files.map(file => ({
        path: file.path,
        data: createFileData(file.properties)
    }));

    return {
        forEachFile(callback) {
            payload.forEach(file => callback(file.path, file.data));
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

function createFile(path: string, frontmatter: Record<string, unknown>): TFile & { frontmatter: Record<string, unknown> } {
    return Object.assign(createTestTFile(path), { frontmatter });
}

function createOperations(app: App, propertyTreeService: PropertyTreeService): FileSystemOperations {
    return new FileSystemOperations(
        app,
        () => null,
        () => propertyTreeService,
        () => null,
        () => null,
        () => ({ includeDescendantNotes: false, showHiddenItems: false }),
        createSettingsProvider({ ...DEFAULT_SETTINGS })
    );
}

describe('FileSystemOperations property assignment', () => {
    it('writes an empty value when applying a property key node', async () => {
        const app = new App();
        const target = createFile('Target.md', {});
        const propertyTreeService = new PropertyTreeService();
        propertyTreeService.updatePropertyTree(
            buildPropertyTreeFromDatabase(
                createMockDb([
                    {
                        path: 'Source.md',
                        properties: [{ fieldKey: 'Categories', value: 'Reference', valueKind: 'string' }]
                    }
                ])
            )
        );

        app.fileManager.processFrontMatter = vi.fn((file: TFile, callback: (frontmatter: Record<string, unknown>) => void) => {
            callback((file as TFile & { frontmatter: Record<string, unknown> }).frontmatter);
            return Promise.resolve();
        });

        const operations = createOperations(app, propertyTreeService);

        await expect(operations.applyPropertyNodeToFiles(buildPropertyKeyNodeId('categories'), [target])).resolves.toEqual({
            updated: 1,
            skipped: 0
        });
        expect(target.frontmatter).toEqual({ Categories: null });
    });

    it('creates a note with an empty value when invoked from a property key node', async () => {
        const app = new App();
        const createdFile = createFile('Untitled.md', {});
        const openFile = vi.fn().mockResolvedValue(undefined);
        const propertyTreeService = new PropertyTreeService();
        propertyTreeService.updatePropertyTree(
            buildPropertyTreeFromDatabase(
                createMockDb([
                    {
                        path: 'Source.md',
                        properties: [{ fieldKey: 'Categories', value: 'Reference', valueKind: 'string' }]
                    }
                ])
            )
        );

        app.fileManager.getNewFileParent = vi.fn(() => app.vault.getRoot());
        app.fileManager.createNewMarkdownFile = vi.fn().mockResolvedValue(createdFile);
        app.fileManager.processFrontMatter = vi.fn((file: TFile, callback: (frontmatter: Record<string, unknown>) => void) => {
            callback((file as TFile & { frontmatter: Record<string, unknown> }).frontmatter);
            return Promise.resolve();
        });
        app.workspace = {
            getActiveFile: vi.fn(() => null),
            getLeaf: vi.fn(() => ({ openFile }))
        } as unknown as App['workspace'];

        const operations = createOperations(app, propertyTreeService);

        await expect(operations.createNewFileForProperty(buildPropertyKeyNodeId('categories'))).resolves.toBe(createdFile);
        expect(createdFile.frontmatter).toEqual({ Categories: null });
        expect(openFile).toHaveBeenCalledWith(createdFile, { state: { mode: 'source' }, active: true });
    });

    it('writes the original wiki-link value when applying a property value node', async () => {
        const rawValue = '[[Mini-Tasks]]';
        const app = new App();
        const target = createFile('Target.md', {});
        const plainTarget = createFile('Plain.md', { Project: 'Mini-Tasks' });
        const propertyTreeService = new PropertyTreeService();
        propertyTreeService.updatePropertyTree(
            buildPropertyTreeFromDatabase(
                createMockDb([
                    {
                        path: 'Source.md',
                        properties: [{ fieldKey: 'Project', value: rawValue, valueKind: 'string' }]
                    }
                ])
            )
        );

        app.fileManager.processFrontMatter = vi.fn((file: TFile, callback: (frontmatter: Record<string, unknown>) => void) => {
            callback((file as TFile & { frontmatter: Record<string, unknown> }).frontmatter);
            return Promise.resolve();
        });

        const operations = createOperations(app, propertyTreeService);
        const nodeId = buildPropertyValueNodeId('project', normalizePropertyTreeValuePath(rawValue));

        await expect(operations.applyPropertyNodeToFiles(nodeId, [target, plainTarget])).resolves.toEqual({ updated: 2, skipped: 0 });
        expect(target.frontmatter).toEqual({ Project: rawValue });
        expect(plainTarget.frontmatter).toEqual({ Project: rawValue });
    });
});
