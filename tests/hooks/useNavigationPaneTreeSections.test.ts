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
import { DEFAULT_SETTINGS, NAV_RAINBOW_DEFAULTS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import { useSettingsState } from '../../src/context/SettingsContext';
import type { MetadataService } from '../../src/services/MetadataService';
import type { PropertyItem } from '../../src/storage/IndexedDBStorage';
import { ItemType, NavigationPaneItemType, NavigationSectionId } from '../../src/types';
import type { TagTreeNode, PropertyTreeNode } from '../../src/types/storage';
import { createHiddenTagVisibility } from '../../src/utils/tagPrefixMatcher';
import { buildPropertyKeyNodeId, buildPropertyValueNodeId } from '../../src/utils/propertyTree';
import type { NavigationPaneSourceState } from '../../src/hooks/navigationPane/data/useNavigationPaneSourceState';
import {
    useNavigationPaneTreeSections,
    type NavigationPaneTreeSectionsResult
} from '../../src/hooks/navigationPane/data/useNavigationPaneTreeSections';
import { useNavigationPaneItemPipeline } from '../../src/hooks/navigationPane/data/useNavigationPaneItemPipeline';
import { useFileItemPillDecorationState } from '../../src/hooks/useFileItemPillDecorationState';
import type { NavigationRainbowState } from '../../src/hooks/useNavigationRainbowState';
import {
    resolveFileItemPropertyDecorationColors,
    resolveFileItemTagDecorationColors,
    type FileItemPillDecorationModel
} from '../../src/utils/fileItemPillDecoration';
import { createTestTFile } from '../utils/createTestTFile';

const dbFileDataByPath = new Map<string, { tags: string[] | null; properties: PropertyItem[] | null }>();

vi.mock('../../src/context/SettingsContext', () => ({
    useSettingsState: vi.fn()
}));

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
    it.each(['root', 'all', 'child'] as const)(
        'keeps navigation and pill colors stable across folder selections with %s rainbow scope',
        scope => {
            dbFileDataByPath.clear();

            const otherFile = createTestTFile('notes/other/other.md');
            const selectedFile = createTestTFile('notes/project/selected.md');
            dbFileDataByPath.set(otherFile.path, {
                tags: ['#alpha', '#beta/one'],
                properties: [
                    { fieldKey: 'Priority', value: 'High', valueKind: 'string' },
                    { fieldKey: 'Status', value: 'Closed', valueKind: 'string' }
                ]
            });
            dbFileDataByPath.set(selectedFile.path, {
                tags: ['#beta/two'],
                properties: [{ fieldKey: 'Status', value: 'Open', valueKind: 'string' }]
            });
            const otherFolder = createFolder('notes/other', [otherFile]);
            const selectedFolder = createFolder('notes/project', [selectedFile]);
            const emptyFolder = createFolder('notes/empty');
            const allFolder = createFolder('notes', [otherFolder, selectedFolder, emptyFolder]);
            Reflect.set(otherFile, 'parent', otherFolder);
            Reflect.set(selectedFile, 'parent', selectedFolder);

            const alphaNode = createTagNode('alpha', 'alpha');
            const betaNode = createTagNode('beta', 'beta');
            betaNode.children.set('one', createTagNode('beta/one', 'beta/one'));
            betaNode.children.set('two', createTagNode('beta/two', 'beta/two'));
            const closedNode = createPropertyValueNode('status', 'closed', 'Closed', [otherFile.path]);
            const openNode = createPropertyValueNode('status', 'open', 'Open', [selectedFile.path]);
            const statusNode = createPropertyKeyNode('status', 'Status', [otherFile.path, selectedFile.path], [closedNode, openNode]);
            const priorityNode = createPropertyKeyNode(
                'priority',
                'Priority',
                [otherFile.path],
                [createPropertyValueNode('priority', 'high', 'High', [otherFile.path])]
            );
            const sourceState = createSourceState({
                visibleTagTree: new Map([
                    ['alpha', alphaNode],
                    ['beta', betaNode]
                ]),
                propertyTree: new Map([
                    ['priority', priorityNode],
                    ['status', statusNode]
                ]),
                visiblePropertyNavigationKeySet: new Set(['priority', 'status'])
            });
            const settings = createSettings({
                showProperties: true,
                showAllPropertiesFolder: false,
                scopePropertiesToCurrentContext: true,
                inheritTagColors: true,
                inheritPropertyColors: true
            });
            vi.mocked(useSettingsState).mockReturnValue(settings);
            const palette = ['#112233', '#445566'];
            const navRainbowState: NavigationRainbowState = {
                navRainbow: {
                    ...NAV_RAINBOW_DEFAULTS,
                    mode: 'foreground',
                    tags: { ...NAV_RAINBOW_DEFAULTS.tags, enabled: true, scope },
                    properties: { ...NAV_RAINBOW_DEFAULTS.properties, enabled: true, scope }
                },
                navRainbowPalettes: { folder: null, tag: palette, property: palette, shortcut: null, recent: null }
            };
            const metadataService = {
                getNavigationSeparatorsVersion: () => 0,
                getTagColorData: () => ({}),
                getPropertyColorData: () => ({}),
                getTagIcon: () => undefined,
                getPropertyIcon: () => undefined
            } as unknown as MetadataService;
            const app = new App();

            function renderSelection(folder: TFolder) {
                const snapshots: {
                    tagColors: Map<string, string | undefined>;
                    propertyColors: Map<string, string | undefined>;
                    model: FileItemPillDecorationModel;
                }[] = [];

                function Harness() {
                    const treeSections = useNavigationPaneTreeSections({
                        app,
                        settings,
                        expansionState: {
                            expandedFolders: new Set(),
                            expandedTags: new Set(['beta']),
                            expandedProperties: new Set([statusNode.id, priorityNode.id]),
                            expandedVirtualFolders: new Set()
                        },
                        showHiddenItems: false,
                        includeDescendantNotes: true,
                        sourceState,
                        selectionScope: { selectionType: ItemType.FOLDER, selectedFolder: folder },
                        tagTreeService: null,
                        propertyTreeService: null
                    });
                    const model = useFileItemPillDecorationState({
                        sourceState,
                        treeSections,
                        includeDescendantNotes: true,
                        navRainbowState
                    });
                    const pipeline = useNavigationPaneItemPipeline({
                        app,
                        settings,
                        metadataService,
                        fileNameIconNeedles: [],
                        getFileDisplayName: file => file.basename,
                        folderDecorationModel: {
                            isExcludedPath: () => false,
                            folderRainbowColors: { colorsByPath: new Map(), rootColor: undefined, getInheritedColor: () => undefined },
                            navRainbowMode: 'none',
                            folderRainbowScope: 'root',
                            showRootFolder: false
                        },
                        navRainbowState,
                        tagRainbowColors: model.tagRainbowColors,
                        propertyRainbowColors: model.propertyRainbowColors,
                        sectionOrder: [NavigationSectionId.TAGS, NavigationSectionId.PROPERTIES],
                        showHiddenItems: false,
                        pinShortcuts: false,
                        shouldPinRecentNotes: false,
                        propertiesSectionActive: treeSections.propertiesSectionActive,
                        folderItems: [],
                        tagItems: treeSections.tagItems,
                        propertyItems: treeSections.propertyItems,
                        shortcutItems: [],
                        recentNotesItems: [],
                        parsedExcludedFolders: [],
                        metadataDecorationVersion: 0
                    });
                    const tagColors = new Map<string, string | undefined>();
                    const propertyColors = new Map<string, string | undefined>();
                    for (const item of pipeline.items) {
                        if (item.type === NavigationPaneItemType.TAG) {
                            tagColors.set(item.data.path, item.color);
                        } else if (
                            item.type === NavigationPaneItemType.PROPERTY_KEY ||
                            item.type === NavigationPaneItemType.PROPERTY_VALUE
                        ) {
                            propertyColors.set(item.data.id, item.color);
                        }
                    }
                    snapshots.push({ tagColors, propertyColors, model });
                    return null;
                }

                renderToStaticMarkup(React.createElement(Harness));
                const snapshot = snapshots[0];
                if (!snapshot) {
                    throw new Error('Expected rainbow selection snapshot');
                }
                return snapshot;
            }

            const all = renderSelection(allFolder);
            const selected = renderSelection(selectedFolder);
            const empty = renderSelection(emptyFolder);
            const restored = renderSelection(allFolder);

            expect([...all.tagColors.keys()]).toEqual(['alpha', 'beta', 'beta/one', 'beta/two']);
            expect([...selected.tagColors.keys()]).toEqual(['beta', 'beta/two']);
            expect([...selected.propertyColors.keys()]).toEqual([statusNode.id, openNode.id]);
            expect(empty.tagColors.size).toBe(0);
            expect(empty.propertyColors.size).toBe(0);
            // Both selected children lose an earlier sibling, so rebuilding colors from scoped rows would change their color.
            expect(all.tagColors.get('beta/two')).toBe(palette[1]);
            expect(all.propertyColors.get(openNode.id)).toBe(palette[1]);
            for (const snapshot of [selected, empty, restored]) {
                expect(snapshot.model.tagRainbowColors.colorsByPath).toEqual(all.model.tagRainbowColors.colorsByPath);
                expect(snapshot.model.propertyRainbowColors.colorsByNodeId).toEqual(all.model.propertyRainbowColors.colorsByNodeId);
                for (const [path, color] of snapshot.tagColors) {
                    expect(color).toBe(all.tagColors.get(path));
                    expect(
                        resolveFileItemTagDecorationColors({
                            model: snapshot.model,
                            tagPath: path,
                            color: undefined,
                            backgroundColor: undefined
                        }).color
                    ).toBe(color);
                }
                for (const [nodeId, color] of snapshot.propertyColors) {
                    expect(color).toBe(all.propertyColors.get(nodeId));
                    expect(
                        resolveFileItemPropertyDecorationColors({
                            model: snapshot.model,
                            nodeId,
                            color: undefined,
                            backgroundColor: undefined
                        }).color
                    ).toBe(color);
                }
            }
        }
    );

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
        expect(result.unscopedRootTagKeys).toEqual(['alpha', 'beta']);
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
