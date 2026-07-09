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
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings, VaultProfile } from '../../src/settings/types';
import type { VisibilityPreferences } from '../../src/types';
import type { ITagTreeProvider } from '../../src/interfaces/ITagTreeProvider';
import type { TagTreeNode } from '../../src/types/storage';
import type { FileData, PropertyItem } from '../../src/storage/IndexedDBStorage';
import { FILE_VISIBILITY } from '../../src/utils/fileTypeUtils';
import { getFilesForFolder, getFilesForProperty, getFilesForTag } from '../../src/utils/fileFinder';
import { markFrontmatterMetadataCacheCurrent } from '../../src/utils/frontmatterMetadataCache';
import { buildPropertyKeyNodeId } from '../../src/utils/propertyTree';
import { setActivePropertyFields } from '../../src/utils/vaultProfiles';
import { createTestTFile } from './createTestTFile';

type TestFileData = Partial<FileData> & Pick<FileData, 'tags' | 'properties'>;

const fileDataByPath = new Map<string, TestFileData>();

const db = {
    getFile(path: string): TestFileData | null {
        return fileDataByPath.get(path) ?? null;
    }
};

vi.mock('../../src/storage/fileOperations', () => ({
    getDBInstanceOrNull: () => db
}));

function createSettings(profileOverrides: Partial<VaultProfile> = {}): NotebookNavigatorSettings {
    const profile = DEFAULT_SETTINGS.vaultProfiles[0];
    return {
        ...DEFAULT_SETTINGS,
        vaultProfile: profile.id,
        vaultProfiles: [
            {
                ...profile,
                fileVisibility: FILE_VISIBILITY.ALL,
                hiddenFolders: [],
                hiddenTags: [],
                hiddenFileNames: [],
                hiddenFileTags: [],
                hiddenFileProperties: [],
                ...profileOverrides
            }
        ]
    };
}

function createAppWithFiles(files: TFile[]): App {
    const app = new App();
    const filesByPath = new Map<string, TFile>();
    files.forEach(file => {
        filesByPath.set(file.path, file);
    });

    const allFiles = (): TFile[] => Array.from(filesByPath.values());

    Reflect.set(app.vault, 'getFileByPath', (path: string) => filesByPath.get(path) ?? null);
    Reflect.set(app.vault, 'getAbstractFileByPath', (path: string) => filesByPath.get(path) ?? null);
    Reflect.set(app.vault, 'getFiles', () => allFiles());
    Reflect.set(app.vault, 'getMarkdownFiles', () => allFiles().filter(file => file.extension === 'md'));

    app.metadataCache.getFileCache = () => null;
    return app;
}

function createTagTreeService(overrides: Partial<ITagTreeProvider>): ITagTreeProvider {
    return {
        addTreeUpdateListener: () => () => {},
        hasNodes: () => false,
        findTagNode: () => null,
        resolveSelectionTagPath: () => null,
        getAllTagPaths: () => [],
        collectDescendantTagPaths: () => new Set<string>(),
        collectTagFilePaths: () => [],
        ...overrides
    };
}

function createTagNode(path: string, displayPath: string): TagTreeNode {
    return {
        name: displayPath.split('/').pop() ?? displayPath,
        path,
        displayPath,
        children: new Map(),
        notesWithTag: new Set()
    };
}

function setFileTags(file: TFile, tags: readonly string[]): void {
    const existing = fileDataByPath.get(file.path);
    fileDataByPath.set(file.path, {
        tags: [...tags],
        properties: existing?.properties ?? null,
        metadataMtime: existing?.metadataMtime,
        metadata: existing?.metadata
    });
}

function setFileProperties(file: TFile, properties: PropertyItem[]): void {
    const existing = fileDataByPath.get(file.path);
    fileDataByPath.set(file.path, {
        tags: existing?.tags ?? null,
        properties: [...properties],
        metadataMtime: existing?.metadataMtime,
        metadata: existing?.metadata
    });
}

function setFileMetadata(file: TFile, metadata: NonNullable<FileData['metadata']>): void {
    const existing = fileDataByPath.get(file.path);
    fileDataByPath.set(file.path, {
        tags: existing?.tags ?? null,
        properties: existing?.properties ?? null,
        metadataMtime: file.stat.mtime,
        metadata
    });
}

function createFolder(path: string, children: Array<TFile | TFolder>): TFolder {
    const folder = new TFolder() as TFolder & { children: Array<TFile | TFolder> };
    folder.path = path;
    folder.name = path.split('/').pop() ?? path;
    folder.children = children;
    children.forEach(child => {
        Reflect.set(child, 'parent', folder);
    });
    return folder;
}

function toSortedPaths(files: TFile[]): string[] {
    return files.map(file => file.path).sort();
}

describe('fileFinder getFilesForFolder', () => {
    beforeEach(() => {
        fileDataByPath.clear();
    });

    it('honors the Excalidraw rendered preview image hiding setting', () => {
        const drawing = createTestTFile('Drawings/Sketch.excalidraw.md');
        const companionImage = createTestTFile('Drawings/Sketch.excalidraw.png');
        const normalImage = createTestTFile('Drawings/Cover.png');
        const folder = createFolder('Drawings', [drawing, companionImage, normalImage]);
        const app = createAppWithFiles([drawing, companionImage, normalImage]);
        const visibility: VisibilityPreferences = { includeDescendantNotes: false, showHiddenItems: false };

        expect(toSortedPaths(getFilesForFolder(folder, createSettings(), visibility, app))).toEqual([
            'Drawings/Cover.png',
            'Drawings/Sketch.excalidraw.md'
        ]);

        expect(toSortedPaths(getFilesForFolder(folder, { ...createSettings(), hideDrawingPreviewImages: false }, visibility, app))).toEqual(
            ['Drawings/Cover.png', 'Drawings/Sketch.excalidraw.md', 'Drawings/Sketch.excalidraw.png']
        );
    });

    it('excludes configured folders only from ancestor descendant results', () => {
        const rootNote = createTestTFile('Root.md');
        const dailyNote = createTestTFile('Daily/today.md');
        const dailyYearNote = createTestTFile('Daily/2026/day.md');
        const workNote = createTestTFile('Work/work.md');
        const resourceNote = createTestTFile('Work/resources/asset.md');

        const dailyYearFolder = createFolder('Daily/2026', [dailyYearNote]);
        const dailyFolder = createFolder('Daily', [dailyNote, dailyYearFolder]);
        const resourcesFolder = createFolder('Work/resources', [resourceNote]);
        const workFolder = createFolder('Work', [workNote, resourcesFolder]);
        const rootFolder = createFolder('', [rootNote, dailyFolder, workFolder]);

        const app = createAppWithFiles([rootNote, dailyNote, dailyYearNote, workNote, resourceNote]);
        const settings = createSettings({ descendantExcludedFolders: ['/Daily', 'resources'] });
        const visibility: VisibilityPreferences = { includeDescendantNotes: true, showHiddenItems: false };

        expect(toSortedPaths(getFilesForFolder(rootFolder, settings, visibility, app))).toEqual(['Root.md', 'Work/work.md']);
        expect(toSortedPaths(getFilesForFolder(dailyFolder, settings, visibility, app))).toEqual(['Daily/2026/day.md', 'Daily/today.md']);
    });

    it('uses fresh mirrored frontmatter metadata when sorting folder results', () => {
        const first = createTestTFile('Notes/first.md');
        first.stat.mtime = 10;
        first.stat.ctime = 200;
        const second = createTestTFile('Notes/second.md');
        second.stat.mtime = 20;
        second.stat.ctime = 100;
        const folder = createFolder('Notes', [first, second]);
        const app = createAppWithFiles([first, second]);
        const settings = {
            ...createSettings(),
            useFrontmatterMetadata: true,
            frontmatterCreatedField: 'created',
            defaultFolderSort: 'created-asc' as const
        };
        setFileMetadata(first, { created: 1000 });
        setFileMetadata(second, { created: 500 });
        markFrontmatterMetadataCacheCurrent(settings);
        const getFileCache = vi.fn(() => {
            throw new Error('live metadata should not be read when mirrored metadata is fresh');
        });
        app.metadataCache.getFileCache = getFileCache;

        const files = getFilesForFolder(folder, settings, { includeDescendantNotes: false, showHiddenItems: false }, app);

        expect(files.map(file => file.path)).toEqual([second.path, first.path]);
        expect(getFileCache).not.toHaveBeenCalled();
    });
});

describe('fileFinder getFilesForTag', () => {
    beforeEach(() => {
        fileDataByPath.clear();
    });

    it('uses tag tree candidate paths without scanning all vault files', () => {
        const projectsFile = createTestTFile('notes/projects.md');
        projectsFile.stat.mtime = 10;
        projectsFile.stat.ctime = 10;
        setFileTags(projectsFile, ['projects']);

        const app = createAppWithFiles([projectsFile]);
        Reflect.set(app.vault, 'getFiles', () => {
            throw new Error('vault scan should not run for fast path candidates');
        });

        const projectsNode = createTagNode('projects', 'Projects');
        const collectCalls: string[] = [];
        const tagTreeService = createTagTreeService({
            hasNodes: () => true,
            findTagNode: () => projectsNode,
            collectTagFilePaths: path => {
                collectCalls.push(path);
                return path === 'projects' ? [projectsFile.path] : [];
            }
        });

        const files = getFilesForTag(
            'projects',
            createSettings(),
            { includeDescendantNotes: true, showHiddenItems: false },
            app,
            tagTreeService
        );

        expect(toSortedPaths(files)).toEqual([projectsFile.path]);
        expect(collectCalls).toEqual(['projects']);
    });

    it('falls back to markdown scan when selected tag node is missing', () => {
        const file = createTestTFile('notes/client.md');
        file.stat.mtime = 5;
        file.stat.ctime = 5;
        setFileTags(file, ['projects/client']);

        const app = createAppWithFiles([file]);
        let getFilesCalls = 0;
        Reflect.set(app.vault, 'getFiles', () => {
            getFilesCalls += 1;
            return [file];
        });

        const collectCalls: string[] = [];
        const tagTreeService = createTagTreeService({
            hasNodes: () => true,
            findTagNode: () => null,
            collectTagFilePaths: path => {
                collectCalls.push(path);
                return [];
            }
        });

        const files = getFilesForTag(
            '#Projects',
            createSettings(),
            { includeDescendantNotes: true, showHiddenItems: false },
            app,
            tagTreeService
        );

        expect(toSortedPaths(files)).toEqual([file.path]);
        expect(collectCalls).toEqual(['projects']);
        expect(getFilesCalls).toBe(1);
    });

    it('keeps hidden file tag filtering when fallback scan is used', () => {
        const visibleFile = createTestTFile('notes/visible.md');
        visibleFile.stat.mtime = 20;
        visibleFile.stat.ctime = 20;
        setFileTags(visibleFile, ['projects/client']);

        const hiddenFile = createTestTFile('notes/hidden.md');
        hiddenFile.stat.mtime = 10;
        hiddenFile.stat.ctime = 10;
        setFileTags(hiddenFile, ['projects', 'secret/private']);

        const app = createAppWithFiles([visibleFile, hiddenFile]);
        const tagTreeService = createTagTreeService({
            hasNodes: () => true,
            findTagNode: () => null,
            collectTagFilePaths: () => []
        });

        const files = getFilesForTag(
            'projects',
            createSettings({ hiddenFileTags: ['secret'] }),
            { includeDescendantNotes: true, showHiddenItems: false },
            app,
            tagTreeService
        );

        expect(toSortedPaths(files)).toEqual([visibleFile.path]);
    });

    it('applies includeDescendantNotes filtering after fast-path candidate resolution', () => {
        const rootTagFile = createTestTFile('notes/root.md');
        rootTagFile.stat.mtime = 10;
        rootTagFile.stat.ctime = 10;
        setFileTags(rootTagFile, ['projects']);

        const childTagFile = createTestTFile('notes/child.md');
        childTagFile.stat.mtime = 9;
        childTagFile.stat.ctime = 9;
        setFileTags(childTagFile, ['projects/client']);

        const app = createAppWithFiles([rootTagFile, childTagFile]);
        const projectsNode = createTagNode('projects', 'Projects');
        const tagTreeService = createTagTreeService({
            hasNodes: () => true,
            findTagNode: () => projectsNode,
            collectTagFilePaths: () => [rootTagFile.path, childTagFile.path]
        });

        const visibility: VisibilityPreferences = { includeDescendantNotes: false, showHiddenItems: false };
        const files = getFilesForTag('projects', createSettings(), visibility, app, tagTreeService);

        expect(toSortedPaths(files)).toEqual([rootTagFile.path]);
    });

    it('keeps tag pins visible in tag views when folder pin scoping is enabled', () => {
        const rootTagFile = createTestTFile('notes/root.md');
        rootTagFile.stat.mtime = 20;
        rootTagFile.stat.ctime = 20;
        setFileTags(rootTagFile, ['projects']);

        const childTagFile = createTestTFile('notes/child.md');
        childTagFile.stat.mtime = 10;
        childTagFile.stat.ctime = 10;
        setFileTags(childTagFile, ['projects/client']);

        const settings = createSettings();
        settings.filterPinnedByFolder = true;
        settings.pinnedNotes = {
            [childTagFile.path]: { folder: false, tag: true, property: false }
        };

        const app = createAppWithFiles([rootTagFile, childTagFile]);
        const projectsNode = createTagNode('projects', 'Projects');
        const tagTreeService = createTagTreeService({
            hasNodes: () => true,
            findTagNode: () => projectsNode,
            collectTagFilePaths: () => [rootTagFile.path, childTagFile.path]
        });

        const files = getFilesForTag('projects', settings, { includeDescendantNotes: true, showHiddenItems: false }, app, tagTreeService);

        expect(files.map(file => file.path)).toEqual([childTagFile.path, rootTagFile.path]);
    });

    it('skips tag ordering work when orderResults is disabled', () => {
        const rootTagFile = createTestTFile('notes/root.md');
        rootTagFile.stat.mtime = 20;
        rootTagFile.stat.ctime = 20;
        setFileTags(rootTagFile, ['projects']);

        const childTagFile = createTestTFile('notes/child.md');
        childTagFile.stat.mtime = 10;
        childTagFile.stat.ctime = 10;
        setFileTags(childTagFile, ['projects/client']);

        const settings = createSettings();
        settings.filterPinnedByFolder = true;
        settings.pinnedNotes = {
            [childTagFile.path]: { folder: false, tag: true, property: false }
        };

        const app = createAppWithFiles([rootTagFile, childTagFile]);
        const projectsNode = createTagNode('projects', 'Projects');
        const tagTreeService = createTagTreeService({
            hasNodes: () => true,
            findTagNode: () => projectsNode,
            collectTagFilePaths: () => [rootTagFile.path, childTagFile.path]
        });

        const files = getFilesForTag('projects', settings, { includeDescendantNotes: true, showHiddenItems: false }, app, tagTreeService, {
            orderResults: false
        });

        expect(files.map(file => file.path)).toEqual([rootTagFile.path, childTagFile.path]);
    });
});

describe('fileFinder getFilesForProperty', () => {
    beforeEach(() => {
        fileDataByPath.clear();
    });

    it('keeps property pins visible in property views when folder pin scoping is enabled', () => {
        const keyOnlyFile = createTestTFile('notes/key-only.md');
        keyOnlyFile.stat.mtime = 20;
        keyOnlyFile.stat.ctime = 20;
        setFileProperties(keyOnlyFile, [{ fieldKey: 'status', value: '', valueKind: 'string' }]);

        const valueFile = createTestTFile('notes/value.md');
        valueFile.stat.mtime = 10;
        valueFile.stat.ctime = 10;
        setFileProperties(valueFile, [{ fieldKey: 'status', value: 'work/anthropic', valueKind: 'string' }]);

        const settings = createSettings();
        setActivePropertyFields(settings, 'status');
        settings.filterPinnedByFolder = true;
        settings.pinnedNotes = {
            [valueFile.path]: { folder: false, tag: false, property: true }
        };

        const app = createAppWithFiles([keyOnlyFile, valueFile]);
        const files = getFilesForProperty(
            buildPropertyKeyNodeId('status'),
            settings,
            { includeDescendantNotes: true, showHiddenItems: false },
            app,
            null
        );

        expect(files.map(file => file.path)).toEqual([valueFile.path, keyOnlyFile.path]);
    });

    it('skips property ordering work when orderResults is disabled', () => {
        const keyOnlyFile = createTestTFile('notes/key-only.md');
        keyOnlyFile.stat.mtime = 20;
        keyOnlyFile.stat.ctime = 20;
        setFileProperties(keyOnlyFile, [{ fieldKey: 'status', value: '', valueKind: 'string' }]);

        const valueFile = createTestTFile('notes/value.md');
        valueFile.stat.mtime = 10;
        valueFile.stat.ctime = 10;
        setFileProperties(valueFile, [{ fieldKey: 'status', value: 'work/anthropic', valueKind: 'string' }]);

        const settings = createSettings();
        setActivePropertyFields(settings, 'status');
        settings.filterPinnedByFolder = true;
        settings.pinnedNotes = {
            [valueFile.path]: { folder: false, tag: false, property: true }
        };

        const app = createAppWithFiles([keyOnlyFile, valueFile]);
        const files = getFilesForProperty(
            buildPropertyKeyNodeId('status'),
            settings,
            { includeDescendantNotes: true, showHiddenItems: false },
            app,
            null,
            { orderResults: false }
        );

        expect(files.map(file => file.path)).toEqual([keyOnlyFile.path, valueFile.path]);
    });
});
