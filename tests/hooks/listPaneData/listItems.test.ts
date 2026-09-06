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
import { App, TFile, TFolder } from 'obsidian';
import { DEFAULT_SETTINGS } from '../../../src/settings/defaultSettings';
import type { PropertyItem } from '../../../src/storage/IndexedDBStorage';
import type { IndexedDBStorage } from '../../../src/storage/IndexedDBStorage';
import {
    buildListGroupItemCountData,
    buildListItems,
    findCollapsedListGroupRevealTarget,
    resolveListGroupExpansionToggleState,
    type ListPaneConfig
} from '../../../src/hooks/listPaneData/listItems';
import { FILE_VISIBILITY } from '../../../src/utils/fileTypeUtils';
import { createTestTFile } from '../../utils/createTestTFile';
import { ItemType, ListPaneItemType, PINNED_SECTION_HEADER_KEY } from '../../../src/types';
import { buildListGroupCollapseKey, buildListGroupCollapseKeyPrefix } from '../../../src/utils/listGroupCollapse';
import { formatTextCount } from '../../../src/utils/wordCountUtils';
import type { ListPaneItem } from '../../../src/types/virtualization';

interface FileMetadataRecord {
    properties: PropertyItem[] | null;
    tags: readonly string[] | null;
    wordCount?: number | null;
}

function createApp(): App {
    const app = new App();
    app.metadataCache.getFileCache = () => null;
    return app;
}

function createDb(records: Record<string, FileMetadataRecord>): IndexedDBStorage {
    return {
        getFile(path: string): FileMetadataRecord | null {
            return records[path] ?? null;
        }
    } as IndexedDBStorage;
}

function createListConfig(pinnedNotes: ListPaneConfig['pinnedNotes']): ListPaneConfig {
    return {
        filterPinnedByFolder: true,
        folderGroupSortOrder: DEFAULT_SETTINGS.folderSortOrder,
        groupBy: DEFAULT_SETTINGS.noteGrouping,
        pinnedGroupExpanded: true,
        pinnedNotes,
        showCurrentFolderFilesAtBottom: DEFAULT_SETTINGS.showCurrentFolderFilesAtBottom,
        showFolderGroupPaths: DEFAULT_SETTINGS.showFolderGroupPaths,
        showFileTags: false
    };
}

function createFolder(path: string): TFolder {
    const folder = new TFolder();
    folder.path = path;
    folder.name = path === '/' ? '' : (path.split('/').pop() ?? path);
    return folder;
}

function assignParent(file: TFile, folderPath: string): TFile {
    file.parent = createFolder(folderPath);
    return file;
}

function createCollapseKey(groupingMode: ListPaneConfig['groupBy'], groupId: string): string {
    return buildListGroupCollapseKey({
        selectionType: ItemType.FOLDER,
        selectedFolderPath: '/',
        selectedTag: null,
        selectedProperty: null,
        groupingMode,
        groupId
    });
}

function getFileItems(items: ReturnType<typeof buildListItems>): { path: string; isPinned: boolean }[] {
    const fileItems: { path: string; isPinned: boolean }[] = [];

    items.forEach(item => {
        if (item.type !== ListPaneItemType.FILE) {
            return;
        }

        const fileData = item.data;
        if (!(fileData instanceof TFile)) {
            return;
        }

        fileItems.push({
            path: fileData.path,
            isPinned: item.isPinned === true
        });
    });

    return fileItems;
}

function getHeaderItems(items: ReturnType<typeof buildListItems>): { data: string; kind: string | undefined }[] {
    return items
        .filter(item => item.type === ListPaneItemType.HEADER && typeof item.data === 'string')
        .map(item => ({
            data: item.data as string,
            kind: item.headerKind
        }));
}

function getFolderHeaderItems(
    items: ReturnType<typeof buildListItems>
): { data: string; folderPath: string | null; collapseKey: string | null; groupFilePaths: string[] }[] {
    return items
        .filter(item => item.type === ListPaneItemType.HEADER && item.headerKind === 'folder' && typeof item.data === 'string')
        .map(item => ({
            data: item.data as string,
            folderPath: item.headerFolderPath ?? null,
            collapseKey: item.collapseKey ?? null,
            groupFilePaths: item.groupFilePaths ?? []
        }));
}

function getFolderHeaderSegmentItems(
    items: ReturnType<typeof buildListItems>
): { data: string; segments: { label: string; path: string }[] }[] {
    return items
        .filter(item => item.type === ListPaneItemType.HEADER && item.headerKind === 'folder' && typeof item.data === 'string')
        .map(item => ({
            data: item.data as string,
            segments: item.headerFolderSegments ?? []
        }));
}

describe('resolveListGroupExpansionToggleState', () => {
    const collapseKeyPrefix = buildListGroupCollapseKeyPrefix({
        selectionType: ItemType.FOLDER,
        selectedFolderPath: '/',
        selectedTag: null,
        selectedProperty: null,
        groupingMode: 'custom'
    });
    const pinnedHeader: ListPaneItem = {
        type: ListPaneItemType.HEADER,
        data: 'Pinned',
        key: PINNED_SECTION_HEADER_KEY
    };
    const expandedHeader: ListPaneItem = {
        type: ListPaneItemType.HEADER,
        data: 'Expanded',
        key: 'expanded',
        collapseKey: 'group:expanded',
        isCollapsed: false
    };
    const collapsedHeader: ListPaneItem = {
        type: ListPaneItemType.HEADER,
        data: 'Collapsed',
        key: 'collapsed',
        collapseKey: 'group:collapsed',
        isCollapsed: true
    };

    it('expands all when zero rendered groups are expanded', () => {
        expect(resolveListGroupExpansionToggleState([pinnedHeader, collapsedHeader], false, new Set(), collapseKeyPrefix)).toEqual({
            collapseKeys: ['group:collapsed'],
            hasPinnedGroup: true,
            canToggle: true,
            shouldCollapse: false
        });
    });

    it('collapses all when some rendered groups are expanded', () => {
        expect(
            resolveListGroupExpansionToggleState([expandedHeader, collapsedHeader], false, new Set(), collapseKeyPrefix).shouldCollapse
        ).toBe(true);
    });

    it('collapses all when every rendered group is expanded', () => {
        expect(
            resolveListGroupExpansionToggleState([pinnedHeader, expandedHeader], true, new Set(), collapseKeyPrefix).shouldCollapse
        ).toBe(true);
    });

    it('expands persisted descendant groups that are hidden behind a collapsed parent', () => {
        const folderPrefix = buildListGroupCollapseKeyPrefix({
            selectionType: ItemType.FOLDER,
            selectedFolderPath: '/',
            selectedTag: null,
            selectedProperty: null,
            groupingMode: 'folder'
        });
        const parentCollapseKey = createCollapseKey('folder', 'folder:/Alpha');
        const hiddenDescendantCollapseKey = createCollapseKey('folder', 'manual-sort-custom:Alpha/Header.md');
        const otherGroupingCollapseKey = createCollapseKey('custom', 'manual-sort-custom:Alpha/Header.md');
        const parentHeader: ListPaneItem = {
            type: ListPaneItemType.HEADER,
            data: 'Alpha',
            key: 'header-folder:/Alpha',
            collapseKey: parentCollapseKey,
            isCollapsed: true
        };

        expect(
            resolveListGroupExpansionToggleState(
                [parentHeader],
                false,
                new Set([parentCollapseKey, hiddenDescendantCollapseKey, otherGroupingCollapseKey]),
                folderPrefix
            )
        ).toEqual({
            collapseKeys: [parentCollapseKey, hiddenDescendantCollapseKey],
            hasPinnedGroup: false,
            canToggle: true,
            shouldCollapse: false
        });
    });

    it('disables the toggle when the list has no collapsible group headers', () => {
        expect(resolveListGroupExpansionToggleState([], false, new Set(), collapseKeyPrefix)).toEqual({
            collapseKeys: [],
            hasPinnedGroup: false,
            canToggle: false,
            shouldCollapse: false
        });
    });
});

describe('buildListItems pinned display scope', () => {
    it('records tag rows when tags are enabled by the active list appearance', () => {
        const app = createApp();
        const file = createTestTFile('Notes/Tagged.md');
        const db = createDb({
            [file.path]: { tags: ['writing'], properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [file],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), showFileTags: true },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'alphabetical-asc'
        });

        const fileItem = items.find(item => item.type === ListPaneItemType.FILE);
        expect(fileItem?.hasTags).toBe(true);
    });

    it('attaches internal search evidence to its file row', () => {
        const app = createApp();
        const file = createTestTFile('Notes/Notebook Navigator.md');
        const db = createDb({
            [file.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [file],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: createListConfig({}),
            matchedAliases: new Map([
                [
                    file.path,
                    [
                        {
                            value: 'NN',
                            foldedTerms: ['nn']
                        }
                    ]
                ]
            ]),
            matchedProperties: new Map([
                [
                    file.path,
                    [
                        {
                            clause: { key: 'workflow', value: 'waiting' }
                        }
                    ]
                ]
            ]),
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'alphabetical-asc'
        });

        const fileItem = items.find(item => item.type === ListPaneItemType.FILE);
        expect(fileItem?.matchedAliases).toEqual([
            {
                value: 'NN',
                foldedTerms: ['nn']
            }
        ]);
        expect(fileItem?.matchedProperties).toEqual([
            {
                clause: { key: 'workflow', value: 'waiting' }
            }
        ]);
    });

    it('adds spacer rows before subsequent fixed-height group headers', () => {
        const app = createApp();
        const todayFile = createTestTFile('notes/today.md');
        const olderFile = createTestTFile('notes/older.md');
        const db = createDb({
            [todayFile.path]: { tags: null, properties: null },
            [olderFile.path]: { tags: null, properties: null }
        });
        const timestamps = new Map([
            [todayFile.path, new Date(2026, 2, 7).getTime()],
            [olderFile.path, new Date(2026, 1, 20).getTime()]
        ]);

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [todayFile, olderFile],
            getDB: () => db,
            getFileTimestamps: file => {
                const timestamp = timestamps.get(file.path) ?? 0;
                return { created: timestamp, modified: timestamp };
            },
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: createListConfig({}),
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'modified-desc'
        });

        expect(items.map(item => item.type)).toEqual([
            ListPaneItemType.TOP_SPACER,
            ListPaneItemType.HEADER,
            ListPaneItemType.FILE,
            ListPaneItemType.HEADER_SPACER,
            ListPaneItemType.HEADER,
            ListPaneItemType.FILE,
            ListPaneItemType.BOTTOM_SPACER
        ]);
        expect(items[3].key).toMatch(/-spacer-before$/);
    });

    it('tracks group file paths when a group is collapsed', () => {
        const app = createApp();
        const first = assignParent(createTestTFile('Projects/First.md'), 'Projects');
        const second = assignParent(createTestTFile('Projects/Second.md'), 'Projects');
        const db = createDb({
            [first.path]: { tags: null, properties: null },
            [second.path]: { tags: null, properties: null }
        });
        const listConfig = {
            ...createListConfig({}),
            groupBy: 'folder' as const
        };

        const collapseKey = createCollapseKey('folder', 'folder:/Projects');
        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [first, second],
            getDB: () => db,
            getFileTimestamps: file => ({ created: file.stat.ctime, modified: file.stat.mtime }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig,
            collapsedListGroups: new Set([collapseKey]),
            searchMetaMap: new Map(),
            selectedFolder: createFolder('/'),
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'alphabetical-asc'
        });

        const header = items.find(item => item.type === ListPaneItemType.HEADER && item.headerKind === 'folder');

        expect(header?.groupFilePaths).toEqual([first.path, second.path]);
        expect(items.some(item => item.type === ListPaneItemType.FILE)).toBe(false);
        expect(findCollapsedListGroupRevealTarget(items, second.path, true)).toEqual({ type: 'list-group', collapseKey });
        expect(findCollapsedListGroupRevealTarget(items, 'Projects/Missing.md', true)).toBeNull();
    });

    it('shows selected folder files without a folder header when there are no pinned files', () => {
        const app = createApp();
        const directFile = assignParent(createTestTFile('Projects/Direct.md'), 'Projects');
        const childFile = assignParent(createTestTFile('Projects/Child/File.md'), 'Projects/Child');
        const db = createDb({
            [directFile.path]: { tags: null, properties: null },
            [childFile.path]: { tags: null, properties: null }
        });
        const currentFolderCollapseKey = buildListGroupCollapseKey({
            selectionType: ItemType.FOLDER,
            selectedFolderPath: 'Projects',
            selectedTag: null,
            selectedProperty: null,
            groupingMode: 'folder',
            groupId: 'folder:Projects'
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [directFile, childFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'folder' },
            collapsedListGroups: new Set([currentFolderCollapseKey]),
            searchMetaMap: new Map(),
            selectedFolder: createFolder('Projects'),
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'alphabetical-asc'
        });

        expect(getFolderHeaderItems(items)).toEqual([
            {
                data: 'Child',
                folderPath: 'Projects/Child',
                collapseKey: buildListGroupCollapseKey({
                    selectionType: ItemType.FOLDER,
                    selectedFolderPath: 'Projects',
                    selectedTag: null,
                    selectedProperty: null,
                    groupingMode: 'folder',
                    groupId: 'folder:Projects/Child'
                }),
                groupFilePaths: [childFile.path]
            }
        ]);
        expect(items.find(item => item.type === ListPaneItemType.HEADER && item.data === 'Projects')).toBeUndefined();
        expect(items.find(item => item.collapseKey === currentFolderCollapseKey)).toBeUndefined();
        expect(getFileItems(items)).toEqual([
            { path: directFile.path, isPinned: false },
            { path: childFile.path, isPinned: false }
        ]);
    });

    it('uses a files section boundary at top when pinned files are present', () => {
        const app = createApp();
        const pinnedFile = assignParent(createTestTFile('Projects/Pinned.md'), 'Projects');
        const directFile = assignParent(createTestTFile('Projects/Direct.md'), 'Projects');
        const childFile = assignParent(createTestTFile('Projects/Child/File.md'), 'Projects/Child');
        const db = createDb({
            [pinnedFile.path]: { tags: null, properties: null },
            [directFile.path]: { tags: null, properties: null },
            [childFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [pinnedFile, directFile, childFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: {
                ...createListConfig({
                    [pinnedFile.path]: { folder: true, tag: false, property: false }
                }),
                groupBy: 'folder'
            },
            searchMetaMap: new Map(),
            selectedFolder: createFolder('Projects'),
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'alphabetical-asc'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Pinned', kind: 'pinned' },
            { data: 'Files', kind: 'section' },
            { data: 'Child', kind: 'folder' }
        ]);
        expect(getFolderHeaderItems(items)).toEqual([
            {
                data: 'Child',
                folderPath: 'Projects/Child',
                collapseKey: buildListGroupCollapseKey({
                    selectionType: ItemType.FOLDER,
                    selectedFolderPath: 'Projects',
                    selectedTag: null,
                    selectedProperty: null,
                    groupingMode: 'folder',
                    groupId: 'folder:Projects/Child'
                }),
                groupFilePaths: [childFile.path]
            }
        ]);
        const currentFolderBoundary = items.find(item => item.type === ListPaneItemType.HEADER && item.data === 'Files');
        expect(currentFolderBoundary?.collapseKey).toBeUndefined();
        expect(currentFolderBoundary?.groupFilePaths).toEqual([directFile.path]);
        expect(getFileItems(items)).toEqual([
            { path: pinnedFile.path, isPinned: true },
            { path: directFile.path, isPinned: false },
            { path: childFile.path, isPinned: false }
        ]);
    });

    it('moves selected folder files below child folder groups when configured', () => {
        const app = createApp();
        const directFile = assignParent(createTestTFile('Projects/Direct.md'), 'Projects');
        const childFile = assignParent(createTestTFile('Projects/Child/File.md'), 'Projects/Child');
        const db = createDb({
            [directFile.path]: { tags: null, properties: null },
            [childFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [directFile, childFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'folder', showCurrentFolderFilesAtBottom: true },
            searchMetaMap: new Map(),
            selectedFolder: createFolder('Projects'),
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'alphabetical-asc'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Child', kind: 'folder' },
            { data: 'Files', kind: 'section' }
        ]);
        expect(getFolderHeaderItems(items)).toEqual([
            {
                data: 'Child',
                folderPath: 'Projects/Child',
                collapseKey: buildListGroupCollapseKey({
                    selectionType: ItemType.FOLDER,
                    selectedFolderPath: 'Projects',
                    selectedTag: null,
                    selectedProperty: null,
                    groupingMode: 'folder',
                    groupId: 'folder:Projects/Child'
                }),
                groupFilePaths: [childFile.path]
            }
        ]);
        const currentFolderBoundary = items.find(item => item.type === ListPaneItemType.HEADER && item.data === 'Files');
        expect(currentFolderBoundary?.collapseKey).toBeUndefined();
        expect(currentFolderBoundary?.groupFilePaths).toEqual([directFile.path]);
        expect(getFileItems(items)).toEqual([
            { path: childFile.path, isPinned: false },
            { path: directFile.path, isPinned: false }
        ]);
    });

    it('keeps bottom selected folder files visible when the child folder group is collapsed', () => {
        const app = createApp();
        const directFile = assignParent(createTestTFile('Projects/Direct.md'), 'Projects');
        const childFile = assignParent(createTestTFile('Projects/Child/File.md'), 'Projects/Child');
        const childCollapseKey = buildListGroupCollapseKey({
            selectionType: ItemType.FOLDER,
            selectedFolderPath: 'Projects',
            selectedTag: null,
            selectedProperty: null,
            groupingMode: 'folder',
            groupId: 'folder:Projects/Child'
        });
        const db = createDb({
            [directFile.path]: { tags: null, properties: null },
            [childFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [directFile, childFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'folder', showCurrentFolderFilesAtBottom: true },
            collapsedListGroups: new Set([childCollapseKey]),
            searchMetaMap: new Map(),
            selectedFolder: createFolder('Projects'),
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'alphabetical-asc'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Child', kind: 'folder' },
            { data: 'Files', kind: 'section' }
        ]);
        expect(getFileItems(items)).toEqual([{ path: directFile.path, isPinned: false }]);
    });

    it('uses a files section boundary at bottom even when pinned files are present', () => {
        const app = createApp();
        const pinnedFile = assignParent(createTestTFile('Projects/Pinned.md'), 'Projects');
        const directFile = assignParent(createTestTFile('Projects/Direct.md'), 'Projects');
        const childFile = assignParent(createTestTFile('Projects/Child/File.md'), 'Projects/Child');
        const db = createDb({
            [pinnedFile.path]: { tags: null, properties: null },
            [directFile.path]: { tags: null, properties: null },
            [childFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [pinnedFile, directFile, childFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: {
                ...createListConfig({
                    [pinnedFile.path]: { folder: true, tag: false, property: false }
                }),
                groupBy: 'folder',
                showCurrentFolderFilesAtBottom: true
            },
            searchMetaMap: new Map(),
            selectedFolder: createFolder('Projects'),
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'alphabetical-asc'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Pinned', kind: 'pinned' },
            { data: 'Child', kind: 'folder' },
            { data: 'Files', kind: 'section' }
        ]);
        expect(getFolderHeaderItems(items)).toEqual([
            {
                data: 'Child',
                folderPath: 'Projects/Child',
                collapseKey: buildListGroupCollapseKey({
                    selectionType: ItemType.FOLDER,
                    selectedFolderPath: 'Projects',
                    selectedTag: null,
                    selectedProperty: null,
                    groupingMode: 'folder',
                    groupId: 'folder:Projects/Child'
                }),
                groupFilePaths: [childFile.path]
            }
        ]);
        expect(getFileItems(items)).toEqual([
            { path: pinnedFile.path, isPinned: true },
            { path: childFile.path, isPinned: false },
            { path: directFile.path, isPinned: false }
        ]);
    });

    it('does not add a selected folder header for direct files only', () => {
        const app = createApp();
        const directFile = assignParent(createTestTFile('Projects/Direct.md'), 'Projects');
        const db = createDb({
            [directFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [directFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'folder', showCurrentFolderFilesAtBottom: true },
            searchMetaMap: new Map(),
            selectedFolder: createFolder('Projects'),
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'alphabetical-asc'
        });

        expect(getFolderHeaderItems(items)).toEqual([]);
        expect(getFileItems(items)).toEqual([{ path: directFile.path, isPinned: false }]);
    });

    it('groups descendant files by their actual parent folder under the selected folder', () => {
        const app = createApp();
        const directFile = assignParent(createTestTFile('Folder 1/file 1.md'), 'Folder 1');
        const childFile = assignParent(createTestTFile('Folder 1/Child Folder/file 3.md'), 'Folder 1/Child Folder');
        const grandchildFile = assignParent(
            createTestTFile('Folder 1/Child Folder/Grandchild Folder/file 8.md'),
            'Folder 1/Child Folder/Grandchild Folder'
        );
        const db = createDb({
            [directFile.path]: { tags: null, properties: null },
            [childFile.path]: { tags: null, properties: null },
            [grandchildFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [directFile, childFile, grandchildFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'folder' },
            searchMetaMap: new Map(),
            selectedFolder: createFolder('Folder 1'),
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'alphabetical-asc'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Child Folder', kind: 'folder' },
            { data: 'Child Folder/Grandchild Folder', kind: 'folder' }
        ]);
        expect(getFolderHeaderItems(items)).toEqual([
            {
                data: 'Child Folder',
                folderPath: 'Folder 1/Child Folder',
                collapseKey: buildListGroupCollapseKey({
                    selectionType: ItemType.FOLDER,
                    selectedFolderPath: 'Folder 1',
                    selectedTag: null,
                    selectedProperty: null,
                    groupingMode: 'folder',
                    groupId: 'folder:Folder 1/Child Folder'
                }),
                groupFilePaths: [childFile.path]
            },
            {
                data: 'Child Folder/Grandchild Folder',
                folderPath: 'Folder 1/Child Folder/Grandchild Folder',
                collapseKey: buildListGroupCollapseKey({
                    selectionType: ItemType.FOLDER,
                    selectedFolderPath: 'Folder 1',
                    selectedTag: null,
                    selectedProperty: null,
                    groupingMode: 'folder',
                    groupId: 'folder:Folder 1/Child Folder/Grandchild Folder'
                }),
                groupFilePaths: [grandchildFile.path]
            }
        ]);
        expect(getFileItems(items)).toEqual([
            { path: directFile.path, isPinned: false },
            { path: childFile.path, isPinned: false },
            { path: grandchildFile.path, isPinned: false }
        ]);
        expect(getFolderHeaderSegmentItems(items)).toEqual([
            {
                data: 'Child Folder',
                segments: [{ label: 'Child Folder', path: 'Folder 1/Child Folder' }]
            },
            {
                data: 'Child Folder/Grandchild Folder',
                segments: [
                    { label: 'Child Folder', path: 'Folder 1/Child Folder' },
                    { label: 'Grandchild Folder', path: 'Folder 1/Child Folder/Grandchild Folder' }
                ]
            }
        ]);
    });

    it('uses full relative folder labels when the selected folder is the vault root', () => {
        const app = createApp();
        const childFile = assignParent(createTestTFile('Alpha/one.md'), 'Alpha');
        const grandchildFile = assignParent(createTestTFile('Alpha/Beta/two.md'), 'Alpha/Beta');
        const db = createDb({
            [childFile.path]: { tags: null, properties: null },
            [grandchildFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [childFile, grandchildFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'folder' },
            searchMetaMap: new Map(),
            selectedFolder: createFolder('/'),
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'alphabetical-asc'
        });

        expect(getFolderHeaderItems(items)).toEqual([
            {
                data: 'Alpha',
                folderPath: 'Alpha',
                collapseKey: createCollapseKey('folder', 'folder:/Alpha'),
                groupFilePaths: [childFile.path]
            },
            {
                data: 'Alpha/Beta',
                folderPath: 'Alpha/Beta',
                collapseKey: createCollapseKey('folder', 'folder:/Alpha/Beta'),
                groupFilePaths: [grandchildFile.path]
            }
        ]);
        expect(getFolderHeaderSegmentItems(items)).toEqual([
            {
                data: 'Alpha',
                segments: [{ label: 'Alpha', path: 'Alpha' }]
            },
            {
                data: 'Alpha/Beta',
                segments: [
                    { label: 'Alpha', path: 'Alpha' },
                    { label: 'Beta', path: 'Alpha/Beta' }
                ]
            }
        ]);
    });

    it('uses folder name labels when folder group paths are disabled', () => {
        const app = createApp();
        const childFile = assignParent(createTestTFile('Alpha/one.md'), 'Alpha');
        const grandchildFile = assignParent(createTestTFile('Alpha/Beta/two.md'), 'Alpha/Beta');
        const db = createDb({
            [childFile.path]: { tags: null, properties: null },
            [grandchildFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [childFile, grandchildFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'folder', showFolderGroupPaths: false },
            searchMetaMap: new Map(),
            selectedFolder: createFolder('/'),
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'alphabetical-asc'
        });

        expect(getFolderHeaderItems(items)).toEqual([
            {
                data: 'Alpha',
                folderPath: 'Alpha',
                collapseKey: createCollapseKey('folder', 'folder:/Alpha'),
                groupFilePaths: [childFile.path]
            },
            {
                data: 'Beta',
                folderPath: 'Alpha/Beta',
                collapseKey: createCollapseKey('folder', 'folder:/Alpha/Beta'),
                groupFilePaths: [grandchildFile.path]
            }
        ]);
        expect(getFolderHeaderSegmentItems(items)).toEqual([
            { data: 'Alpha', segments: [] },
            { data: 'Beta', segments: [] }
        ]);
    });

    it('keeps folder group ordering based on paths when folder group paths are disabled', () => {
        const app = createApp();
        const zetaFile = assignParent(createTestTFile('A/Zeta/one.md'), 'A/Zeta');
        const alphaFile = assignParent(createTestTFile('B/Alpha/two.md'), 'B/Alpha');
        const db = createDb({
            [zetaFile.path]: { tags: null, properties: null },
            [alphaFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [zetaFile, alphaFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'folder', showFolderGroupPaths: false },
            searchMetaMap: new Map(),
            selectedFolder: createFolder('/'),
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'alphabetical-asc'
        });

        expect(getFolderHeaderItems(items)).toEqual([
            {
                data: 'Zeta',
                folderPath: 'A/Zeta',
                collapseKey: createCollapseKey('folder', 'folder:/A/Zeta'),
                groupFilePaths: [zetaFile.path]
            },
            {
                data: 'Alpha',
                folderPath: 'B/Alpha',
                collapseKey: createCollapseKey('folder', 'folder:/B/Alpha'),
                groupFilePaths: [alphaFile.path]
            }
        ]);
    });

    it('adds an Unsorted section for manual sort files missing a valid rank', () => {
        const app = createApp();
        const rankedFile = createTestTFile('notes/ranked.md');
        const invalidRankFile = createTestTFile('notes/invalid-rank.md');
        const unsortedFile = createTestTFile('notes/unsorted.md');
        app.metadataCache.getFileCache = (file: TFile) => ({
            frontmatter: file.path === rankedFile.path ? { index: 1 } : file.path === invalidRankFile.path ? { index: 'custom' } : {}
        });
        const db = createDb({
            [rankedFile.path]: { tags: null, properties: null },
            [invalidRankFile.path]: { tags: null, properties: null },
            [unsortedFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [rankedFile, invalidRankFile, unsortedFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'custom' },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'property-asc',
            propertySortKey: 'index',
            isManualSortActive: true
        });

        expect(items.map(item => item.type)).toEqual([
            ListPaneItemType.TOP_SPACER,
            ListPaneItemType.FILE,
            ListPaneItemType.HEADER_SPACER,
            ListPaneItemType.HEADER,
            ListPaneItemType.FILE,
            ListPaneItemType.FILE,
            ListPaneItemType.BOTTOM_SPACER
        ]);
        expect(items[3].data).toBe('Unsorted');
        expect(items[3].headerKind).toBe('section');
        expect(getFileItems(items)).toEqual([
            { path: rankedFile.path, isPinned: false },
            { path: invalidRankFile.path, isPinned: false },
            { path: unsortedFile.path, isPinned: false }
        ]);
    });

    it('adds manual sort custom headers in pinned, ranked, and Unsorted sections', () => {
        const app = createApp();
        const pinnedFile = createTestTFile('notes/pinned.md');
        const rankedHeaderFile = createTestTFile('notes/ranked-header.md');
        const rankedPlainFile = createTestTFile('notes/ranked-plain.md');
        const unsortedHeaderFile = createTestTFile('notes/unsorted-header.md');
        app.metadataCache.getFileCache = (file: TFile) => ({
            frontmatter:
                file.path === pinnedFile.path
                    ? { index: 1000, Group_Header: 'Pinned header' }
                    : file.path === rankedHeaderFile.path
                      ? { index: 2000, group_header: 'Ranked header' }
                      : file.path === rankedPlainFile.path
                        ? { index: 3000 }
                        : file.path === unsortedHeaderFile.path
                          ? { group_header: 'Unsorted header' }
                          : {}
        });
        const db = createDb({
            [pinnedFile.path]: { tags: null, properties: null },
            [rankedHeaderFile.path]: { tags: null, properties: null },
            [rankedPlainFile.path]: { tags: null, properties: null },
            [unsortedHeaderFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [pinnedFile, rankedHeaderFile, rankedPlainFile, unsortedHeaderFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: {
                ...createListConfig({
                    [pinnedFile.path]: { folder: true, tag: false, property: false }
                }),
                groupBy: 'custom'
            },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'property-asc',
            propertySortKey: 'index',
            isManualSortActive: true,
            manualSortGroupHeaderPropertyKey: 'group_header'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Pinned', kind: 'pinned' },
            { data: 'Pinned header', kind: 'manual-sort-custom' },
            { data: 'Ranked header', kind: 'manual-sort-custom' },
            { data: 'Unsorted', kind: 'section' },
            { data: 'Unsorted header', kind: 'manual-sort-custom' }
        ]);
        expect(getFileItems(items)).toEqual([
            { path: pinnedFile.path, isPinned: true },
            { path: rankedHeaderFile.path, isPinned: false },
            { path: rankedPlainFile.path, isPinned: false },
            { path: unsortedHeaderFile.path, isPinned: false }
        ]);
        expect(items.find(item => item.key === PINNED_SECTION_HEADER_KEY)?.groupFilePaths).toEqual([pinnedFile.path]);
        expect(items.find(item => item.key === 'header-unsorted')?.groupFilePaths).toEqual([unsortedHeaderFile.path]);
    });

    it('keeps the list flat when grouping is none', () => {
        const app = createApp();
        const headerFile = createTestTFile('notes/header.md');
        const plainFile = createTestTFile('notes/plain.md');
        app.metadataCache.getFileCache = (file: TFile) => ({
            frontmatter: file.path === headerFile.path ? { group_header: 'Hidden header' } : {}
        });
        const db = createDb({
            [headerFile.path]: { tags: null, properties: null },
            [plainFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [headerFile, plainFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'none' },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.TAG,
            showHiddenItems: false,
            sortOption: 'title-asc',
            manualSortGroupHeaderPropertyKey: 'group_header'
        });

        expect(getHeaderItems(items)).toEqual([]);
        expect(getFileItems(items)).toEqual([
            { path: headerFile.path, isPinned: false },
            { path: plainFile.path, isPinned: false }
        ]);
    });

    it('adds manual sort custom header word counts and targets', () => {
        const app = createApp();
        const firstFile = createTestTFile('notes/first.md');
        const secondFile = createTestTFile('notes/second.md');
        const targetFile = createTestTFile('notes/target.md');
        const hiddenTargetFile = createTestTFile('notes/hidden-target.md');
        app.metadataCache.getFileCache = (file: TFile) => ({
            frontmatter:
                file.path === firstFile.path
                    ? { index: 1000, group_header: { title: 'Part 1', show_word_count: true } }
                    : file.path === secondFile.path
                      ? { index: 2000, 'word-goal': 2000 }
                      : file.path === targetFile.path
                        ? {
                              index: 3000,
                              'word-goal': 9999,
                              group_header: { title: 'Part 2', show_word_count: true, target_word_count: 10000 }
                          }
                        : file.path === hiddenTargetFile.path
                          ? { index: 4000, group_header: { title: 'Part 3', show_word_count: false, target_word_count: 5000 } }
                          : {}
        });
        const db = createDb({
            [firstFile.path]: {
                tags: null,
                properties: [{ fieldKey: 'word-goal', value: '1,000', valueKind: 'string' }],
                wordCount: 1000
            },
            [secondFile.path]: {
                tags: null,
                properties: null,
                wordCount: 234
            },
            [targetFile.path]: {
                tags: null,
                properties: null,
                wordCount: 4123
            },
            [hiddenTargetFile.path]: {
                tags: null,
                properties: [{ fieldKey: 'word-goal', value: 5000, valueKind: 'number' }],
                wordCount: 99
            }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [firstFile, secondFile, targetFile, hiddenTargetFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'custom' },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'property-asc',
            propertySortKey: 'index',
            isManualSortActive: true,
            manualSortGroupHeaderPropertyKey: 'group_header',
            wordCountTargetProperty: 'word-goal'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: `Part 1 (${formatTextCount(1234)} / ${formatTextCount(3000)})`, kind: 'manual-sort-custom' },
            { data: `Part 2 (${formatTextCount(4123)} / ${formatTextCount(10000)})`, kind: 'manual-sort-custom' },
            { data: 'Part 3', kind: 'manual-sort-custom' }
        ]);
        const manualSortHeaders = items.filter(item => item.type === ListPaneItemType.HEADER && item.headerKind === 'manual-sort-custom');
        expect(manualSortHeaders.map(item => item.manualSortHeaderFilePath)).toEqual([
            firstFile.path,
            targetFile.path,
            hiddenTargetFile.path
        ]);
        expect(manualSortHeaders.map(item => item.manualSortHeaderShowsWordCount)).toEqual([true, true, false]);
        expect(manualSortHeaders.map(item => item.manualSortHeaderTargetWordCount)).toEqual([3000, 10000, 5000]);
    });

    it('does not add manual sort custom headers when the group header key is disabled', () => {
        const app = createApp();
        const rankedFile = createTestTFile('notes/ranked.md');
        app.metadataCache.getFileCache = () => ({
            frontmatter: { index: 1000, group_header: 'Ranked header' }
        });
        const db = createDb({
            [rankedFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [rankedFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'custom' },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'property-asc',
            propertySortKey: 'index',
            isManualSortActive: true,
            manualSortGroupHeaderPropertyKey: null
        });

        expect(getHeaderItems(items)).toEqual([]);
    });

    it('does not split missing values into Unsorted for normal property sort', () => {
        const app = createApp();
        const rankedFile = createTestTFile('notes/ranked.md');
        const missingFile = createTestTFile('notes/missing.md');
        app.metadataCache.getFileCache = (file: TFile) => ({
            frontmatter: file.path === rankedFile.path ? { author: 'Ada' } : {}
        });
        const db = createDb({
            [rankedFile.path]: { tags: null, properties: null },
            [missingFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [rankedFile, missingFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'custom' },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'property-asc',
            propertySortKey: 'author',
            isManualSortActive: false
        });

        expect(items.map(item => item.type)).toEqual([
            ListPaneItemType.TOP_SPACER,
            ListPaneItemType.FILE,
            ListPaneItemType.FILE,
            ListPaneItemType.BOTTOM_SPACER
        ]);
    });

    it('marks date headers with date header kind', () => {
        const app = createApp();
        const todayFile = createTestTFile('notes/today.md');
        const olderFile = createTestTFile('notes/older.md');
        const db = createDb({
            [todayFile.path]: { tags: null, properties: null },
            [olderFile.path]: { tags: null, properties: null }
        });
        const timestamps = new Map([
            [todayFile.path, new Date(2026, 2, 7).getTime()],
            [olderFile.path, new Date(2026, 1, 20).getTime()]
        ]);

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [todayFile, olderFile],
            getDB: () => db,
            getFileTimestamps: file => {
                const timestamp = timestamps.get(file.path) ?? 0;
                return { created: timestamp, modified: timestamp };
            },
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: createListConfig({}),
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'modified-desc'
        });

        expect(getHeaderItems(items).map(item => item.kind)).toEqual(['date', 'date']);
    });

    it('attaches unfiltered group totals to searched date groups', () => {
        const app = createApp();
        const todayMatch = createTestTFile('notes/today-match.md');
        const todayFilteredOut = createTestTFile('notes/today-filtered-out.md');
        const olderMatch = createTestTFile('notes/older-match.md');
        const db = createDb({
            [todayMatch.path]: { tags: null, properties: null },
            [todayFilteredOut.path]: { tags: null, properties: null },
            [olderMatch.path]: { tags: null, properties: null }
        });
        const timestamps = new Map([
            [todayMatch.path, new Date(2026, 2, 7).getTime()],
            [todayFilteredOut.path, new Date(2026, 2, 7).getTime()],
            [olderMatch.path, new Date(2026, 1, 20).getTime()]
        ]);
        const getFileTimestamps = (file: TFile) => {
            const timestamp = timestamps.get(file.path) ?? 0;
            return { created: timestamp, modified: timestamp };
        };
        const listConfig = { ...createListConfig({}), groupBy: 'date' as const };
        const commonArgs = {
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            getDB: () => db,
            getFileTimestamps,
            hiddenFileState: new Map<string, boolean>(),
            hiddenTags: [],
            listConfig,
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'modified-desc' as const
        };
        const groupItemCountData = buildListGroupItemCountData({
            ...commonArgs,
            files: [todayMatch, todayFilteredOut, olderMatch]
        });

        const items = buildListItems({
            ...commonArgs,
            files: [todayMatch, olderMatch],
            groupItemCountData
        });
        const dateHeaders = items.filter(item => item.type === ListPaneItemType.HEADER && item.headerKind === 'date');

        expect(
            dateHeaders.map(item => ({
                visible: item.groupFilePaths?.length,
                total: item.groupTotalItemCount
            }))
        ).toEqual([
            { visible: 1, total: 2 },
            { visible: 1, total: 1 }
        ]);
    });

    it('retains custom group boundaries when search excludes a header-owning file', () => {
        const app = createApp();
        const firstHeaderFile = createTestTFile('notes/first-match.md');
        const filteredOutHeaderFile = createTestTFile('notes/filtered-out-header.md');
        const secondGroupMatch = createTestTFile('notes/second-match.md');
        app.metadataCache.getFileCache = file => ({
            frontmatter:
                file.path === firstHeaderFile.path
                    ? { index: 1000, group_header: 'First group' }
                    : file.path === filteredOutHeaderFile.path
                      ? { index: 2000, group_header: 'Second group' }
                      : { index: 3000 }
        });
        const db = createDb({
            [firstHeaderFile.path]: { tags: null, properties: null },
            [filteredOutHeaderFile.path]: { tags: null, properties: null },
            [secondGroupMatch.path]: { tags: null, properties: null }
        });
        const commonArgs = {
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map<string, boolean>(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'custom' as const },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'property-asc' as const,
            propertySortKey: 'index',
            isManualSortActive: true,
            manualSortGroupHeaderPropertyKey: 'group_header'
        };
        const groupItemCountData = buildListGroupItemCountData({
            ...commonArgs,
            files: [firstHeaderFile, filteredOutHeaderFile, secondGroupMatch]
        });

        const items = buildListItems({
            ...commonArgs,
            files: [firstHeaderFile, secondGroupMatch],
            groupItemCountData
        });
        const customHeaders = items.filter(item => item.type === ListPaneItemType.HEADER && item.headerKind === 'manual-sort-custom');

        expect(
            customHeaders.map(item => ({
                label: item.data,
                visiblePaths: item.groupFilePaths,
                total: item.groupTotalItemCount
            }))
        ).toEqual([
            { label: 'First group', visiblePaths: [firstHeaderFile.path], total: 1 },
            { label: 'Second group', visiblePaths: [secondGroupMatch.path], total: 2 }
        ]);
    });

    it('keeps collapsed date headers visible and hides their files', () => {
        const app = createApp();
        const todayFile = createTestTFile('notes/today.md');
        const olderFile = createTestTFile('notes/older.md');
        const db = createDb({
            [todayFile.path]: { tags: null, properties: null },
            [olderFile.path]: { tags: null, properties: null }
        });
        const timestamps = new Map([
            [todayFile.path, new Date(2026, 2, 7).getTime()],
            [olderFile.path, new Date(2026, 1, 20).getTime()]
        ]);

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [todayFile, olderFile],
            getDB: () => db,
            getFileTimestamps: file => {
                const timestamp = timestamps.get(file.path) ?? 0;
                return { created: timestamp, modified: timestamp };
            },
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'date' },
            collapsedListGroups: new Set([createCollapseKey('date', 'date:mtime:relative:today')]),
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'modified-desc'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Today', kind: 'date' },
            { data: 'Previous 30 days', kind: 'date' }
        ]);
        expect(getFileItems(items)).toEqual([{ path: olderFile.path, isPinned: false }]);
        expect(items.find(item => item.type === ListPaneItemType.HEADER && item.data === 'Today')?.isCollapsed).toBe(true);
    });

    it('keeps collapsed folder headers visible and hides their files', () => {
        const app = createApp();
        const alphaFile = assignParent(createTestTFile('Alpha/one.md'), 'Alpha');
        const betaFile = assignParent(createTestTFile('Beta/two.md'), 'Beta');
        const db = createDb({
            [alphaFile.path]: { tags: null, properties: null },
            [betaFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [alphaFile, betaFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'folder' },
            collapsedListGroups: new Set([createCollapseKey('folder', 'folder:/Alpha')]),
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'modified-desc'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Alpha', kind: 'folder' },
            { data: 'Beta', kind: 'folder' }
        ]);
        expect(getFileItems(items)).toEqual([{ path: betaFile.path, isPinned: false }]);
    });

    it('keeps the pinned divider section non-collapsible', () => {
        const app = createApp();
        const pinnedFile = createTestTFile('notes/pinned.md');
        const regularFile = createTestTFile('notes/regular.md');
        const db = createDb({
            [pinnedFile.path]: { tags: null, properties: null },
            [regularFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [pinnedFile, regularFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: {
                ...createListConfig({
                    [pinnedFile.path]: { folder: true, tag: false, property: false }
                }),
                groupBy: 'custom'
            },
            collapsedListGroups: new Set([createCollapseKey('custom', 'section:notes')]),
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'modified-desc'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Pinned', kind: 'pinned' },
            { data: 'Notes', kind: 'section' }
        ]);
        expect(getFileItems(items)).toEqual([
            { path: pinnedFile.path, isPinned: true },
            { path: regularFile.path, isPinned: false }
        ]);
        const notesHeader = items.find(item => item.type === ListPaneItemType.HEADER && item.data === 'Notes');
        expect(notesHeader?.collapseKey).toBeUndefined();
        expect(notesHeader?.isCollapsed).toBe(false);
    });

    it('keeps collapsed unsorted section headers visible and hides their files', () => {
        const app = createApp();
        const sortedFile = createTestTFile('notes/sorted.md');
        const unsortedFile = createTestTFile('notes/unsorted.md');
        app.metadataCache.getFileCache = file => ({
            frontmatter: file.path === sortedFile.path ? { index: 1000 } : {}
        });
        const db = createDb({
            [sortedFile.path]: { tags: null, properties: null },
            [unsortedFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [sortedFile, unsortedFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'custom' },
            collapsedListGroups: new Set([createCollapseKey('custom', 'section:unsorted')]),
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'property-asc',
            propertySortKey: 'index',
            isManualSortActive: true
        });

        expect(getHeaderItems(items)).toEqual([{ data: 'Unsorted', kind: 'section' }]);
        expect(getFileItems(items)).toEqual([{ path: sortedFile.path, isPinned: false }]);
    });

    it('omits the pinned divider section when manual sort custom headers appear below pinned files', () => {
        const app = createApp();
        const pinnedFile = createTestTFile('notes/pinned.md');
        const groupedFile = createTestTFile('notes/grouped.md');
        const regularFile = createTestTFile('notes/regular.md');
        app.metadataCache.getFileCache = file => ({
            frontmatter: {
                index: file.path === pinnedFile.path ? 1000 : file.path === groupedFile.path ? 2000 : 3000,
                ...(file.path === groupedFile.path ? { group_header: 'Group A' } : {})
            }
        });
        const db = createDb({
            [pinnedFile.path]: { tags: null, properties: null },
            [groupedFile.path]: { tags: null, properties: null },
            [regularFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.SUPPORTED,
            files: [pinnedFile, groupedFile, regularFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: {
                ...createListConfig({
                    [pinnedFile.path]: { folder: true, tag: false, property: false }
                }),
                groupBy: 'custom'
            },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'property-asc',
            propertySortKey: 'index',
            isManualSortActive: true,
            manualSortGroupHeaderPropertyKey: 'group_header'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Pinned', kind: 'pinned' },
            { data: 'Group A', kind: 'manual-sort-custom' }
        ]);
        expect(getFileItems(items)).toEqual([
            { path: pinnedFile.path, isPinned: true },
            { path: groupedFile.path, isPinned: false },
            { path: regularFile.path, isPinned: false }
        ]);
    });

    it('keeps the pinned divider section when the first unpinned manual sort file has no custom header', () => {
        const app = createApp();
        const pinnedFile = createTestTFile('notes/pinned.md');
        const regularFile = createTestTFile('notes/regular.md');
        const groupedFile = createTestTFile('notes/grouped.md');
        app.metadataCache.getFileCache = file => ({
            frontmatter: {
                index: file.path === pinnedFile.path ? 1000 : file.path === regularFile.path ? 2000 : 3000,
                ...(file.path === groupedFile.path ? { group_header: 'Group A' } : {})
            }
        });
        const db = createDb({
            [pinnedFile.path]: { tags: null, properties: null },
            [regularFile.path]: { tags: null, properties: null },
            [groupedFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.SUPPORTED,
            files: [pinnedFile, regularFile, groupedFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: {
                ...createListConfig({
                    [pinnedFile.path]: { folder: true, tag: false, property: false }
                }),
                groupBy: 'custom'
            },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'property-asc',
            propertySortKey: 'index',
            isManualSortActive: true,
            manualSortGroupHeaderPropertyKey: 'group_header'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Pinned', kind: 'pinned' },
            { data: 'Files', kind: 'section' },
            { data: 'Group A', kind: 'manual-sort-custom' }
        ]);
        expect(getFileItems(items)).toEqual([
            { path: pinnedFile.path, isPinned: true },
            { path: regularFile.path, isPinned: false },
            { path: groupedFile.path, isPinned: false }
        ]);
        expect(items.find(item => item.key === 'header-Files')?.groupFilePaths).toEqual([regularFile.path, groupedFile.path]);
    });

    it('does not render manual sort custom headers inside collapsed folder groups', () => {
        const app = createApp();
        const groupedFile = assignParent(createTestTFile('Alpha/grouped.md'), 'Alpha');
        const betaFile = assignParent(createTestTFile('Beta/two.md'), 'Beta');
        app.metadataCache.getFileCache = file => ({
            frontmatter: file.path === groupedFile.path ? { index: 1000, group_header: 'Group A' } : { index: 2000 }
        });
        const db = createDb({
            [groupedFile.path]: { tags: null, properties: null },
            [betaFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [groupedFile, betaFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'folder' },
            collapsedListGroups: new Set([createCollapseKey('folder', 'folder:/Alpha')]),
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'property-asc',
            propertySortKey: 'index',
            isManualSortActive: true,
            manualSortGroupHeaderPropertyKey: 'group_header'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Alpha', kind: 'folder' },
            { data: 'Beta', kind: 'folder' }
        ]);
        expect(getFileItems(items)).toEqual([{ path: betaFile.path, isPinned: false }]);
    });

    it('keeps collapsed manual sort custom headers visible and hides their files', () => {
        const app = createApp();
        const groupedFile = createTestTFile('notes/grouped.md');
        app.metadataCache.getFileCache = () => ({
            frontmatter: { index: 1000, group_header: 'Ranked header' }
        });
        const db = createDb({
            [groupedFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [groupedFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: { ...createListConfig({}), groupBy: 'custom' },
            collapsedListGroups: new Set([createCollapseKey('custom', `manual-sort-custom:${groupedFile.path}`)]),
            searchMetaMap: new Map(),
            selectedFolder: createFolder('/'),
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'property-asc',
            propertySortKey: 'index',
            isManualSortActive: true,
            manualSortGroupHeaderPropertyKey: 'group_header'
        });

        expect(getHeaderItems(items)).toEqual([{ data: 'Ranked header', kind: 'manual-sort-custom' }]);
        expect(getFileItems(items)).toEqual([]);
    });

    it('keeps tag pins in the pinned section when folder pin scoping is enabled', () => {
        const app = createApp();
        const rootFile = createTestTFile('notes/root.md');
        const childFile = createTestTFile('notes/child.md');
        const db = createDb({
            [rootFile.path]: { tags: ['work'], properties: null },
            [childFile.path]: { tags: ['work/anthropic'], properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [rootFile, childFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: createListConfig({
                [childFile.path]: { folder: false, tag: true, property: false }
            }),
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectedTag: 'work',
            selectionType: ItemType.TAG,
            showHiddenItems: false,
            sortOption: 'modified-desc'
        });

        expect(items.some(item => item.key === PINNED_SECTION_HEADER_KEY)).toBe(true);
        expect(getFileItems(items)).toEqual([
            { path: childFile.path, isPinned: true },
            { path: rootFile.path, isPinned: false }
        ]);
    });

    it('keeps direct tag pins in the pinned section for the matching tag selection', () => {
        const app = createApp();
        const childFile = createTestTFile('notes/child.md');
        const siblingFile = createTestTFile('notes/sibling.md');
        const db = createDb({
            [childFile.path]: { tags: ['work/anthropic'], properties: null },
            [siblingFile.path]: { tags: ['work/anthropic'], properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [childFile, siblingFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: createListConfig({
                [childFile.path]: { folder: false, tag: true, property: false }
            }),
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectedTag: 'work/anthropic',
            selectionType: ItemType.TAG,
            showHiddenItems: false,
            sortOption: 'modified-desc'
        });

        expect(items.some(item => item.key === PINNED_SECTION_HEADER_KEY)).toBe(true);
        expect(getFileItems(items)).toEqual([
            { path: childFile.path, isPinned: true },
            { path: siblingFile.path, isPinned: false }
        ]);
    });

    it('keeps property pins in the pinned section when folder pin scoping is enabled', () => {
        const app = createApp();
        const keyOnlyFile = createTestTFile('notes/key-only.md');
        const valueFile = createTestTFile('notes/value.md');
        const db = createDb({
            [keyOnlyFile.path]: {
                tags: null,
                properties: [{ fieldKey: 'status', value: '', valueKind: 'string' }]
            },
            [valueFile.path]: {
                tags: null,
                properties: [{ fieldKey: 'status', value: 'work/anthropic', valueKind: 'string' }]
            }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [keyOnlyFile, valueFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: createListConfig({
                [valueFile.path]: { folder: false, tag: false, property: true }
            }),
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectedTag: null,
            selectionType: ItemType.PROPERTY,
            showHiddenItems: false,
            sortOption: 'modified-desc'
        });

        expect(items.some(item => item.key === PINNED_SECTION_HEADER_KEY)).toBe(true);
        expect(getFileItems(items)).toEqual([
            { path: valueFile.path, isPinned: true },
            { path: keyOnlyFile.path, isPinned: false }
        ]);
    });

    it('keeps direct property value pins in the pinned section for the matching value selection', () => {
        const app = createApp();
        const valueFile = createTestTFile('notes/value.md');
        const siblingFile = createTestTFile('notes/sibling.md');
        const db = createDb({
            [valueFile.path]: {
                tags: null,
                properties: [{ fieldKey: 'status', value: 'work/anthropic', valueKind: 'string' }]
            },
            [siblingFile.path]: {
                tags: null,
                properties: [{ fieldKey: 'status', value: 'work/anthropic', valueKind: 'string' }]
            }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [valueFile, siblingFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: createListConfig({
                [valueFile.path]: { folder: false, tag: false, property: true }
            }),
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectedTag: null,
            selectionType: ItemType.PROPERTY,
            showHiddenItems: false,
            sortOption: 'modified-desc'
        });

        expect(items.some(item => item.key === PINNED_SECTION_HEADER_KEY)).toBe(true);
        expect(getFileItems(items)).toEqual([
            { path: valueFile.path, isPinned: true },
            { path: siblingFile.path, isPinned: false }
        ]);
    });

    it('keeps the pinned header and hides pinned file rows when the pinned group is collapsed', () => {
        const app = createApp();
        const pinnedFile = createTestTFile('notes/pinned.md');
        const regularFile = createTestTFile('notes/regular.md');
        const db = createDb({
            [pinnedFile.path]: { tags: null, properties: null },
            [regularFile.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [pinnedFile, regularFile],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: {
                ...createListConfig({
                    [pinnedFile.path]: { folder: true, tag: false, property: false }
                }),
                groupBy: 'custom',
                pinnedGroupExpanded: false
            },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'modified-desc'
        });

        expect(items.some(item => item.key === PINNED_SECTION_HEADER_KEY)).toBe(true);
        expect(getFileItems(items)).toEqual([{ path: regularFile.path, isPinned: false }]);
        expect(findCollapsedListGroupRevealTarget(items, pinnedFile.path, false)).toEqual({ type: 'pinned' });
        expect(findCollapsedListGroupRevealTarget(items, regularFile.path, false)).toBeNull();
    });
});

describe('buildListItems property grouping', () => {
    function createFrontmatterApp(frontmatterByPath: Record<string, Record<string, unknown>>): App {
        const app = createApp();
        app.metadataCache.getFileCache = file => {
            const frontmatter = frontmatterByPath[file.path];
            return frontmatter ? { frontmatter } : null;
        };
        return app;
    }

    it('collects files sharing a property value under one header with the None group last', () => {
        const done = createTestTFile('notes/Alpha.md');
        const active = createTestTFile('notes/Beta.md');
        const doneAgain = createTestTFile('notes/Gamma.md');
        const missing = createTestTFile('notes/Delta.md');
        const app = createFrontmatterApp({
            [done.path]: { status: 'Done' },
            [active.path]: { status: 'Active' },
            [doneAgain.path]: { status: 'Done' },
            [missing.path]: {}
        });
        const db = createDb({
            [done.path]: { tags: null, properties: null },
            [active.path]: { tags: null, properties: null },
            [doneAgain.path]: { tags: null, properties: null },
            [missing.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [done, active, doneAgain, missing],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: {
                ...createListConfig({}),
                groupBy: 'property:status'
            },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'title-asc'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Active', kind: 'property' },
            { data: 'Done', kind: 'property' },
            { data: 'None', kind: 'property' }
        ]);
        expect(getFileItems(items).map(item => item.path)).toEqual([active.path, done.path, doneAgain.path, missing.path]);

        const doneHeader = items.find(item => item.type === ListPaneItemType.HEADER && item.data === 'Done');
        expect(doneHeader?.groupFilePaths).toEqual([done.path, doneAgain.path]);
        expect(doneHeader?.collapseKey).toBe(createCollapseKey('property:status', 'property-value:Done'));
    });

    it('orders groups descending while keeping the None group last and collapse keys direction-independent', () => {
        const done = createTestTFile('notes/Alpha.md');
        const active = createTestTFile('notes/Beta.md');
        const missing = createTestTFile('notes/Delta.md');
        const app = createFrontmatterApp({
            [done.path]: { status: 'Done' },
            [active.path]: { status: 'Active' },
            [missing.path]: {}
        });
        const db = createDb({
            [done.path]: { tags: null, properties: null },
            [active.path]: { tags: null, properties: null },
            [missing.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [done, active, missing],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: {
                ...createListConfig({}),
                groupBy: 'property-desc:status'
            },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'title-asc'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Done', kind: 'property' },
            { data: 'Active', kind: 'property' },
            { data: 'None', kind: 'property' }
        ]);

        const doneHeader = items.find(item => item.type === ListPaneItemType.HEADER && item.data === 'Done');
        expect(doneHeader?.collapseKey).toBe(createCollapseKey('property:status', 'property-value:Done'));
        expect(createCollapseKey('property-desc:status', 'property-value:Done')).toBe(
            createCollapseKey('property:status', 'property-value:Done')
        );
    });

    it('groups list values under their joined string and skips property rows for collapsed groups', () => {
        const listValued = createTestTFile('notes/List.md');
        const scalar = createTestTFile('notes/Scalar.md');
        const app = createFrontmatterApp({
            [listValued.path]: { status: ['Active', 'Waiting'] },
            [scalar.path]: { status: 'Active' }
        });
        const db = createDb({
            [listValued.path]: { tags: null, properties: null },
            [scalar.path]: { tags: null, properties: null }
        });
        const collapseKey = createCollapseKey('property:status', 'property-value:Active');

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [listValued, scalar],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: {
                ...createListConfig({}),
                groupBy: 'property:status'
            },
            collapsedListGroups: new Set([collapseKey]),
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'title-asc'
        });

        expect(getHeaderItems(items)).toEqual([
            { data: 'Active', kind: 'property' },
            { data: 'Active, Waiting', kind: 'property' }
        ]);
        expect(getFileItems(items).map(item => item.path)).toEqual([listValued.path]);
        expect(findCollapsedListGroupRevealTarget(items, scalar.path, true)).toEqual({ type: 'list-group', collapseKey });
    });

    it('labels link-valued groups with the link display text while keying groups by the raw value', () => {
        const wikiLink = createTestTFile('notes/WikiLink.md');
        const aliasLink = createTestTFile('notes/AliasLink.md');
        const plain = createTestTFile('notes/Plain.md');
        const listValued = createTestTFile('notes/List.md');
        const app = createFrontmatterApp({
            [wikiLink.path]: { related: '[[Project Note]]' },
            [aliasLink.path]: { related: '[[Project Note|Alias]]' },
            [plain.path]: { related: 'Project Note' },
            [listValued.path]: { related: ['[[Zeta]]', '[Docs](https://example.com)'] }
        });
        const db = createDb({
            [wikiLink.path]: { tags: null, properties: null },
            [aliasLink.path]: { tags: null, properties: null },
            [plain.path]: { tags: null, properties: null },
            [listValued.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [wikiLink, aliasLink, plain, listValued],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: {
                ...createListConfig({}),
                groupBy: 'property:related'
            },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'title-asc'
        });

        // Groups sort by their display label, and the raw value "Project Note" stays a separate
        // group from the wiki link "[[Project Note]]" even though both render the same label.
        expect(getHeaderItems(items)).toEqual([
            { data: 'Alias', kind: 'property' },
            { data: 'Project Note', kind: 'property' },
            { data: 'Project Note', kind: 'property' },
            { data: 'Zeta, Docs', kind: 'property' }
        ]);

        const projectNoteHeaders = items.filter(
            item => item.type === ListPaneItemType.HEADER && item.headerKind === 'property' && item.data === 'Project Note'
        );
        expect(projectNoteHeaders.map(item => item.collapseKey)).toEqual([
            createCollapseKey('property:related', 'property-value:Project Note'),
            createCollapseKey('property:related', 'property-value:[[Project Note]]')
        ]);
        expect(projectNoteHeaders.map(item => item.groupFilePaths)).toEqual([[plain.path], [wikiLink.path]]);
    });

    it('orders number-valued groups numerically, including negatives, with strings in natural order', () => {
        const minusTen = createTestTFile('notes/MinusTen.md');
        const minusTwo = createTestTFile('notes/MinusTwo.md');
        const five = createTestTFile('notes/Five.md');
        const text = createTestTFile('notes/Text.md');
        const app = createFrontmatterApp({
            [minusTen.path]: { score: -10 },
            [minusTwo.path]: { score: -2 },
            [five.path]: { score: 5 },
            [text.path]: { score: '12 points' }
        });
        const db = createDb({
            [minusTen.path]: { tags: null, properties: null },
            [minusTwo.path]: { tags: null, properties: null },
            [five.path]: { tags: null, properties: null },
            [text.path]: { tags: null, properties: null }
        });

        const buildWithGrouping = (groupBy: 'property:score' | 'property-desc:score') =>
            buildListItems({
                app,
                dayKey: '2026-03-07',
                fileVisibility: FILE_VISIBILITY.DOCUMENTS,
                files: [minusTen, minusTwo, five, text],
                getDB: () => db,
                getFileTimestamps: () => ({ created: 0, modified: 0 }),
                hiddenFileState: new Map(),
                hiddenTags: [],
                listConfig: {
                    ...createListConfig({}),
                    groupBy
                },
                searchMetaMap: new Map(),
                selectedFolder: null,
                selectedTag: null,
                selectionType: ItemType.FOLDER,
                showHiddenItems: false,
                sortOption: 'title-asc'
            });

        // A pure string collator would order '-2' after '-10'; numeric group keys compare numerically.
        expect(getHeaderItems(buildWithGrouping('property:score')).map(header => header.data)).toEqual(['-10', '-2', '5', '12 points']);
        expect(getHeaderItems(buildWithGrouping('property-desc:score')).map(header => header.data)).toEqual([
            '12 points',
            '5',
            '-2',
            '-10'
        ]);
    });

    it('keeps mixed numeric and text group order identical across all file encounter orders', () => {
        // Numeric order says -10 < -2 while the collator places '-2' before '-3 points' before '-10',
        // so a comparator that compares mixed pairs by label is intransitive and its output would
        // depend on the file order. Every permutation must produce the same group order.
        const minusTen = createTestTFile('notes/MinusTen.md');
        const minusTwo = createTestTFile('notes/MinusTwo.md');
        const text = createTestTFile('notes/Text.md');
        const app = createFrontmatterApp({
            [minusTen.path]: { score: -10 },
            [minusTwo.path]: { score: -2 },
            [text.path]: { score: '-3 points' }
        });
        const db = createDb({
            [minusTen.path]: { tags: null, properties: null },
            [minusTwo.path]: { tags: null, properties: null },
            [text.path]: { tags: null, properties: null }
        });

        const buildWithFiles = (files: TFile[], groupBy: 'property:score' | 'property-desc:score') =>
            buildListItems({
                app,
                dayKey: '2026-03-07',
                fileVisibility: FILE_VISIBILITY.DOCUMENTS,
                files,
                getDB: () => db,
                getFileTimestamps: () => ({ created: 0, modified: 0 }),
                hiddenFileState: new Map(),
                hiddenTags: [],
                listConfig: {
                    ...createListConfig({}),
                    groupBy
                },
                searchMetaMap: new Map(),
                selectedFolder: null,
                selectedTag: null,
                selectionType: ItemType.FOLDER,
                showHiddenItems: false,
                sortOption: 'title-asc'
            });

        const permutations: TFile[][] = [
            [minusTen, minusTwo, text],
            [minusTen, text, minusTwo],
            [minusTwo, minusTen, text],
            [minusTwo, text, minusTen],
            [text, minusTen, minusTwo],
            [text, minusTwo, minusTen]
        ];
        for (const files of permutations) {
            expect(getHeaderItems(buildWithFiles(files, 'property:score')).map(header => header.data)).toEqual(['-10', '-2', '-3 points']);
            expect(getHeaderItems(buildWithFiles(files, 'property-desc:score')).map(header => header.data)).toEqual([
                '-3 points',
                '-2',
                '-10'
            ]);
        }
    });

    it('orders case-variant group labels by bucket key instead of file encounter order', () => {
        // The collator compares labels at base sensitivity, so 'Apple' and 'apple' form distinct
        // buckets whose labels compare equal; the bucket-key tie-break must produce the same order
        // regardless of which file is encountered first.
        const upper = createTestTFile('notes/Upper.md');
        const lower = createTestTFile('notes/Lower.md');
        const app = createFrontmatterApp({
            [upper.path]: { status: 'Apple' },
            [lower.path]: { status: 'apple' }
        });
        const db = createDb({
            [upper.path]: { tags: null, properties: null },
            [lower.path]: { tags: null, properties: null }
        });

        const buildWithFiles = (files: TFile[], groupBy: 'property:status' | 'property-desc:status') =>
            buildListItems({
                app,
                dayKey: '2026-03-07',
                fileVisibility: FILE_VISIBILITY.DOCUMENTS,
                files,
                getDB: () => db,
                getFileTimestamps: () => ({ created: 0, modified: 0 }),
                hiddenFileState: new Map(),
                hiddenTags: [],
                listConfig: {
                    ...createListConfig({}),
                    groupBy
                },
                searchMetaMap: new Map(),
                selectedFolder: null,
                selectedTag: null,
                selectionType: ItemType.FOLDER,
                showHiddenItems: false,
                sortOption: 'title-asc'
            });

        for (const files of [
            [upper, lower],
            [lower, upper]
        ]) {
            expect(getHeaderItems(buildWithFiles(files, 'property:status')).map(header => header.data)).toEqual(['Apple', 'apple']);
            expect(getHeaderItems(buildWithFiles(files, 'property-desc:status')).map(header => header.data)).toEqual(['apple', 'Apple']);
        }
    });

    it('keeps lists with different element boundaries in separate groups and merges single-element lists with scalars', () => {
        const splitEarly = createTestTFile('notes/SplitEarly.md');
        const splitLate = createTestTFile('notes/SplitLate.md');
        const singleList = createTestTFile('notes/SingleList.md');
        const scalar = createTestTFile('notes/Scalar.md');
        const app = createFrontmatterApp({
            [splitEarly.path]: { status: ['a b', 'c'] },
            [splitLate.path]: { status: ['a', 'b c'] },
            [singleList.path]: { status: ['Solo'] },
            [scalar.path]: { status: 'Solo' }
        });
        const db = createDb({
            [splitEarly.path]: { tags: null, properties: null },
            [splitLate.path]: { tags: null, properties: null },
            [singleList.path]: { tags: null, properties: null },
            [scalar.path]: { tags: null, properties: null }
        });

        const items = buildListItems({
            app,
            dayKey: '2026-03-07',
            fileVisibility: FILE_VISIBILITY.DOCUMENTS,
            files: [splitEarly, splitLate, singleList, scalar],
            getDB: () => db,
            getFileTimestamps: () => ({ created: 0, modified: 0 }),
            hiddenFileState: new Map(),
            hiddenTags: [],
            listConfig: {
                ...createListConfig({}),
                groupBy: 'property:status'
            },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectedTag: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'title-asc'
        });

        // Whether the two split-boundary labels tie depends on the environment locale: collators
        // that ignore punctuation (such as Thai) make them equal, which hands their order to the
        // bucket-key tie-break, while others compare the comma directly. Sorting by code units
        // keeps the assertion independent of the environment locale.
        const headers = getHeaderItems(items);
        expect([...headers].sort((left, right) => (left.data < right.data ? -1 : 1))).toEqual([
            { data: 'Solo', kind: 'property' },
            { data: 'a b, c', kind: 'property' },
            { data: 'a, b c', kind: 'property' }
        ]);

        const soloHeader = items.find(item => item.type === ListPaneItemType.HEADER && item.data === 'Solo');
        expect(soloHeader?.groupFilePaths).toEqual([singleList.path, scalar.path]);
    });
});
