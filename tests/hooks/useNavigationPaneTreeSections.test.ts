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

import React from 'react';
import { App, TFolder, type TAbstractFile } from 'obsidian';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import type { PropertyItem } from '../../src/storage/IndexedDBStorage';
import { ItemType, NavigationPaneItemType } from '../../src/types';
import type { TagTreeNode, PropertyTreeNode } from '../../src/types/storage';
import { createHiddenTagVisibility } from '../../src/utils/tagPrefixMatcher';
import { buildPropertyKeyNodeId, buildPropertyValueNodeId } from '../../src/utils/propertyTree';
import type { NavigationPaneSourceState } from '../../src/hooks/navigationPane/data/useNavigationPaneSourceState';
import {
    useNavigationPaneTreeSections,
    type NavigationPaneTreeSectionsResult
} from '../../src/hooks/navigationPane/data/useNavigationPaneTreeSections';
import { createTestTFile } from '../utils/createTestTFile';

const dbFileDataByPath = new Map<string, { tags: string[] | null; properties: PropertyItem[] | null }>();

vi.mock('../../src/storage/fileOperations', () => ({
    getDBInstanceOrNull: () => ({
        getFile: (path: string) => {
            const entry = dbFileDataByPath.get(path);
            if (!entry) {
                return null;
            }
            return {
                mtime: 0,
                markdownPipelineMtime: 0,
                tagsMtime: 0,
                metadataMtime: 0,
                fileThumbnailsMtime: 0,
                tags: entry.tags,
                wordCount: null,
                taskTotal: 0,
                taskUnfinished: 0,
                properties: entry.properties,
                previewStatus: 'unprocessed',
                featureImage: null,
                featureImageStatus: 'unprocessed',
                featureImageKey: null,
                metadata: null
            };
        },
        forEachFile: () => {
            throw new Error('full database scan should not run for scoped tag rendering');
        }
    })
}));

function createFolder(path: string, children: TAbstractFile[] = []): TFolder {
    const folder = new TFolder();
    Reflect.set(folder, 'path', path);
    Reflect.set(folder, 'name', path.split('/').pop() ?? path);
    Reflect.set(folder, 'children', children);
    return folder;
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

function createPropertyKeyNode(key: string, name: string, notes: string[], values: PropertyTreeNode[] = []): PropertyTreeNode {
    const node: PropertyTreeNode = {
        id: buildPropertyKeyNodeId(key),
        kind: 'key',
        key,
        valuePath: null,
        name,
        displayPath: name,
        children: new Map(),
        notesWithValue: new Set(notes)
    };

    values.forEach(valueNode => {
        node.children.set(valueNode.id, valueNode);
    });

    return node;
}

function createPropertyValueNode(key: string, valuePath: string, name: string, notes: string[]): PropertyTreeNode {
    return {
        id: buildPropertyValueNodeId(key, valuePath),
        kind: 'value',
        key,
        valuePath,
        name,
        displayPath: name,
        children: new Map(),
        notesWithValue: new Set(notes)
    };
}

function createSettings(overrides: Partial<NotebookNavigatorSettings> = {}): NotebookNavigatorSettings {
    return {
        ...DEFAULT_SETTINGS,
        showTags: true,
        showAllTagsFolder: false,
        showUntagged: false,
        showProperties: false,
        scopeTagsToCurrentContext: true,
        ...overrides
    };
}

function createSourceState(params?: {
    visibleTagTree?: Map<string, TagTreeNode>;
    propertyTree?: Map<string, PropertyTreeNode>;
    rootPropertyOrderMap?: Map<string, number>;
    visiblePropertyNavigationKeySet?: Set<string>;
    hasRootPropertyShortcut?: boolean;
}): NavigationPaneSourceState {
    const hiddenTagVisibility = createHiddenTagVisibility([], false);
    const visibleTagTree = params?.visibleTagTree ?? new Map<string, TagTreeNode>();
    const propertyTree = params?.propertyTree ?? new Map<string, PropertyTreeNode>();

    return {
        effectiveFrontmatterExclusions: [],
        hiddenFolders: [],
        descendantExcludedFolders: [],
        hiddenTags: [],
        hiddenFileProperties: [],
        hiddenFileNames: [],
        hiddenFileTags: [],
        fileVisibility: DEFAULT_SETTINGS.vaultProfiles[0].fileVisibility,
        navigationBannerPath: null,
        folderCountFileNameMatcher: null,
        hiddenFilePropertyMatcher: { hasCriteria: false, matches: () => false },
        rootFolders: [],
        rootLevelFolders: [],
        rootFolderOrderMap: new Map(),
        missingRootFolderPaths: [],
        tagTree: visibleTagTree,
        propertyTree,
        untaggedCount: 0,
        visibleTaggedCount: 2,
        hiddenTagMatcher: hiddenTagVisibility.matcher,
        hiddenMatcherHasRules: false,
        visibleTagTree,
        hasRootPropertyShortcut: params?.hasRootPropertyShortcut ?? false,
        tagComparator: undefined,
        hiddenRootTagNodes: new Map(),
        tagTreeForOrdering: visibleTagTree,
        rootTagOrderMap: new Map(),
        missingRootTagPaths: [],
        propertyKeyComparator: (a, b) => a.name.localeCompare(b.name),
        rootPropertyOrderMap: params?.rootPropertyOrderMap ?? new Map<string, number>(),
        missingRootPropertyKeys: [],
        visiblePropertyNavigationKeySet: params?.visiblePropertyNavigationKeySet ?? new Set<string>(),
        metadataDecorationVersion: 0,
        metadataVisibilityVersion: 0,
        tagDataVersion: 0,
        propertyDataVersion: 0,
        getFolderSortName: folder => folder.name,
        folderExclusionByFolderNote: undefined,
        recentNotesHiddenFileMatcher: () => false,
        fileChangeVersion: 0,
        folderChangeVersion: 0
    };
}

describe('useNavigationPaneTreeSections', () => {
    it('keeps global root tag ordering available while scoped rendering shows only current-context tags', () => {
        dbFileDataByPath.clear();

        const alphaFile = createTestTFile('notes/project/alpha.md');
        dbFileDataByPath.set(alphaFile.path, { tags: ['#alpha'], properties: null });

        const folder = createFolder('notes/project', [alphaFile]);
        Reflect.set(alphaFile, 'parent', folder);

        const alphaNode = createTagNode('alpha', 'Alpha');
        const betaNode = createTagNode('beta', 'Beta');
        const visibleTagTree = new Map<string, TagTreeNode>([
            [alphaNode.path, alphaNode],
            [betaNode.path, betaNode]
        ]);

        const app = new App();
        let captured: NavigationPaneTreeSectionsResult | null = null;

        function Harness() {
            captured = useNavigationPaneTreeSections({
                app,
                settings: createSettings(),
                expansionState: {
                    expandedFolders: new Set(),
                    expandedTags: new Set(),
                    expandedProperties: new Set(),
                    expandedVirtualFolders: new Set()
                },
                showHiddenItems: false,
                includeDescendantNotes: true,
                sourceState: createSourceState({ visibleTagTree }),
                selectionScope: {
                    selectionType: ItemType.FOLDER,
                    selectedFolder: folder
                },
                tagTreeService: null,
                propertyTreeService: null
            });
            return null;
        }

        renderToStaticMarkup(React.createElement(Harness));

        expect(captured).not.toBeNull();
        if (!captured) {
            throw new Error('Expected hook result');
        }
        const result = captured as NavigationPaneTreeSectionsResult;

        const renderTagTreeKeys = Array.from(result.renderTagTree.keys());
        const rootOrderingTagTreeKeys = Array.from(result.rootOrderingTagTree.keys());
        const renderedItemTypes = result.tagItems.map(item => item.type);
        const renderedItemKeys = result.tagItems.map(item => item.key);

        expect(renderTagTreeKeys).toEqual(['alpha']);
        expect(rootOrderingTagTreeKeys).toEqual(['alpha', 'beta']);
        expect(result.resolvedRootTagKeys).toEqual(['alpha', 'beta']);
        expect(renderedItemTypes).toEqual([NavigationPaneItemType.TAG]);
        expect(renderedItemKeys).toEqual(['alpha']);
        const firstRenderedTagItem = result.tagItems[0];
        expect(firstRenderedTagItem && 'noteCount' in firstRenderedTagItem ? firstRenderedTagItem.noteCount : undefined).toBeUndefined();
    });

    it('keeps global root property ordering available while scoped rendering shows only current-context properties', () => {
        dbFileDataByPath.clear();

        const statusFile = createTestTFile('notes/project/status.md');
        dbFileDataByPath.set(statusFile.path, {
            tags: null,
            properties: [{ fieldKey: 'Status', value: 'Open', valueKind: 'string' }]
        });

        const folder = createFolder('notes/project', [statusFile]);
        Reflect.set(statusFile, 'parent', folder);

        const statusValueNode = createPropertyValueNode('status', 'open', 'Open', ['notes/project/status.md']);
        const statusKeyNode = createPropertyKeyNode('status', 'Status', ['notes/project/status.md'], [statusValueNode]);
        const priorityKeyNode = createPropertyKeyNode('priority', 'Priority', ['notes/priority.md']);
        const propertyTree = new Map<string, PropertyTreeNode>([
            [statusKeyNode.key, statusKeyNode],
            [priorityKeyNode.key, priorityKeyNode]
        ]);

        const app = new App();
        let captured: NavigationPaneTreeSectionsResult | null = null;

        function Harness() {
            captured = useNavigationPaneTreeSections({
                app,
                settings: createSettings({
                    showTags: false,
                    showProperties: true,
                    showAllPropertiesFolder: false,
                    scopeTagsToCurrentContext: false,
                    scopePropertiesToCurrentContext: true
                }),
                expansionState: {
                    expandedFolders: new Set(),
                    expandedTags: new Set(),
                    expandedProperties: new Set([buildPropertyKeyNodeId('status')]),
                    expandedVirtualFolders: new Set()
                },
                showHiddenItems: false,
                includeDescendantNotes: true,
                sourceState: createSourceState({
                    propertyTree,
                    rootPropertyOrderMap: new Map<string, number>([
                        ['priority', 0],
                        ['status', 1]
                    ]),
                    visiblePropertyNavigationKeySet: new Set(['status', 'priority']),
                    hasRootPropertyShortcut: true
                }),
                selectionScope: {
                    selectionType: ItemType.FOLDER,
                    selectedFolder: folder
                },
                tagTreeService: null,
                propertyTreeService: null
            });
            return null;
        }

        renderToStaticMarkup(React.createElement(Harness));

        expect(captured).not.toBeNull();
        if (!captured) {
            throw new Error('Expected hook result');
        }
        const result = captured as NavigationPaneTreeSectionsResult;

        expect(Array.from(result.renderPropertyTree.keys())).toEqual(['status']);
        expect(Array.from(result.rootOrderingPropertyTree.keys())).toEqual(['priority', 'status']);
        expect(result.resolvedRootPropertyKeys).toEqual(['priority', 'status']);
        expect(result.propertyItems.map(item => item.type)).toEqual([
            NavigationPaneItemType.PROPERTY_KEY,
            NavigationPaneItemType.PROPERTY_VALUE
        ]);
        expect(result.propertyItems.map(item => item.key)).toEqual([buildPropertyKeyNodeId('status'), statusValueNode.id]);
        expect(result.propertyCollectionCount).toEqual({ current: 1, descendants: 0, total: 1 });
    });

    it('keeps scoped property rendering empty when no navigation property keys are enabled', () => {
        dbFileDataByPath.clear();

        const statusFile = createTestTFile('notes/project/status.md');
        dbFileDataByPath.set(statusFile.path, {
            tags: null,
            properties: [{ fieldKey: 'Status', value: 'Open', valueKind: 'string' }]
        });

        const folder = createFolder('notes/project', [statusFile]);
        Reflect.set(statusFile, 'parent', folder);

        const app = new App();
        let captured: NavigationPaneTreeSectionsResult | null = null;

        function Harness() {
            captured = useNavigationPaneTreeSections({
                app,
                settings: createSettings({
                    showTags: false,
                    showProperties: true,
                    showAllPropertiesFolder: false,
                    scopeTagsToCurrentContext: false,
                    scopePropertiesToCurrentContext: true
                }),
                expansionState: {
                    expandedFolders: new Set(),
                    expandedTags: new Set(),
                    expandedProperties: new Set(),
                    expandedVirtualFolders: new Set()
                },
                showHiddenItems: false,
                includeDescendantNotes: true,
                sourceState: createSourceState({
                    visiblePropertyNavigationKeySet: new Set<string>()
                }),
                selectionScope: {
                    selectionType: ItemType.FOLDER,
                    selectedFolder: folder
                },
                tagTreeService: null,
                propertyTreeService: null
            });
            return null;
        }

        renderToStaticMarkup(React.createElement(Harness));

        expect(captured).not.toBeNull();
        if (!captured) {
            throw new Error('Expected hook result');
        }
        const result = captured as NavigationPaneTreeSectionsResult;

        expect(Array.from(result.renderPropertyTree.keys())).toEqual([]);
        expect(result.propertyItems).toEqual([]);
    });
});
