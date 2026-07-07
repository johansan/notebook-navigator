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
import { describe, it, expect } from 'vitest';
import {
    buildTagTreeFromDatabase,
    buildTagTreeFromFilePaths,
    clearNoteCountCache,
    findTagNode,
    collectTagFilePaths,
    collectAllTagPaths,
    getTotalNoteCount,
    excludeFromTagTree
} from '../../src/utils/tagTree';
import { createHiddenTagMatcher, normalizeTagPathValue } from '../../src/utils/tagPrefixMatcher';
import type { IndexedDBStorage, FileData } from '../../src/storage/IndexedDBStorage';
import type { TagTreeNode } from '../../src/types/storage';

interface MockFile {
    path: string;
    tags: string[] | null;
}

function createMockDb(files: MockFile[]): IndexedDBStorage {
    const payload = files.map(({ path, tags }) => ({
        path,
        data: createFileData(tags)
    }));

    return {
        getAllFiles: () => payload,
        forEachFile: (callback: (path: string, data: FileData) => void) => {
            payload.forEach(({ path, data }) => callback(path, data));
        }
    } as unknown as IndexedDBStorage;
}

function createFileData(tags: string[] | null): FileData {
    return {
        mtime: 0,
        markdownPipelineMtime: 0,
        tagsMtime: 0,
        metadataMtime: 0,
        fileThumbnailsMtime: 0,
        tags,
        wordCount: null,
        taskTotal: 0,
        taskUnfinished: 0,
        properties: null,
        previewStatus: 'unprocessed',
        featureImage: null,
        featureImageStatus: 'unprocessed',
        featureImageKey: null,
        metadata: null
    };
}

function createPathLookupDb(files: MockFile[]): IndexedDBStorage {
    const byPath = new Map(files.map(({ path, tags }) => [path, createFileData(tags)]));

    return {
        getFile: (path: string) => byPath.get(path) ?? null,
        forEachFile: () => {
            throw new Error('full database scan should not run when included paths are provided');
        }
    } as unknown as IndexedDBStorage;
}

function validateTreeHasNoSelfCycles(tree: Map<string, TagTreeNode>): void {
    const visited = new Set<TagTreeNode>();

    const visit = (node: TagTreeNode) => {
        expect(node.children.get(node.path)).toBeUndefined();
        for (const child of node.children.values()) {
            expect(child).not.toBe(node);
            if (!visited.has(child)) {
                visited.add(child);
                visit(child);
            }
        }
    };

    for (const root of tree.values()) {
        if (visited.has(root)) {
            continue;
        }
        visited.add(root);
        visit(root);
    }
}

describe('tag tree hardening', () => {
    it('normalizes repeated slashes from inline/frontmatter mixes without creating self-children', () => {
        const db = createMockDb([
            {
                path: 'inline.md',
                tags: ['#enemies//dragons', '#enemies/dragons//fire', '#enemies////dragons////fire']
            },
            {
                path: 'frontmatter.md',
                tags: ['enemies///dragons///ice', '#enemies/dragons//ice']
            }
        ]);

        const { tagTree } = buildTagTreeFromDatabase(db);
        validateTreeHasNoSelfCycles(tagTree);

        const enemiesPath = normalizeTagPathValue('#enemies');
        const dragonsPath = normalizeTagPathValue('#enemies//dragons');
        const firePath = normalizeTagPathValue('#enemies/dragons//fire');
        const icePath = normalizeTagPathValue('enemies///dragons///ice');

        expect(findTagNode(tagTree, enemiesPath)).not.toBeNull();
        expect(findTagNode(tagTree, dragonsPath)).not.toBeNull();
        expect(findTagNode(tagTree, firePath)).not.toBeNull();
        expect(findTagNode(tagTree, icePath)).not.toBeNull();
    });

    it('handles duplicate tag names like #tag/#tag without cycles', () => {
        const db = createMockDb([
            {
                path: 'dup.md',
                tags: ['#projects/projects', '#projects//projects//ideas', '#Projects/Projects///ideas///drafts']
            }
        ]);

        const { tagTree } = buildTagTreeFromDatabase(db);
        validateTreeHasNoSelfCycles(tagTree);

        const repeatedPath = normalizeTagPathValue('#projects//projects');
        const rootPath = normalizeTagPathValue('#projects');

        expect(findTagNode(tagTree, rootPath)).not.toBeNull();
        expect(findTagNode(tagTree, repeatedPath)).not.toBeNull();
    });

    it('ignores blank tag fragments and deduplicates casing collisions', () => {
        const db = createMockDb([
            {
                path: 'invalid.md',
                tags: ['', '#', '#/', '##', '#///', '#//', '////', '#Mixed//Case']
            },
            {
                path: 'valid.md',
                tags: ['#focus', 'focus//areas', '#Focus///Areas///deep']
            }
        ]);

        const { tagTree } = buildTagTreeFromDatabase(db);
        validateTreeHasNoSelfCycles(tagTree);
        expect(Array.from(tagTree.keys()).sort()).toEqual(['focus', 'mixed']);

        const focusPath = normalizeTagPathValue('#focus');
        const focusAreasPath = normalizeTagPathValue('focus//areas');
        const deepPath = normalizeTagPathValue('#Focus///Areas///deep');

        expect(findTagNode(tagTree, focusPath)).not.toBeNull();
        expect(findTagNode(tagTree, focusAreasPath)).not.toBeNull();
        expect(findTagNode(tagTree, deepPath)).not.toBeNull();
    });

    it('prevents runaway recursion in findTagNode even if a malformed cycle exists', () => {
        const root: TagTreeNode = {
            name: 'root',
            path: 'root',
            displayPath: 'root',
            children: new Map(),
            notesWithTag: new Set()
        };
        const child: TagTreeNode = {
            name: 'child',
            path: 'root/child',
            displayPath: 'root/child',
            children: new Map(),
            notesWithTag: new Set()
        };

        // Intentionally create a cycle to simulate corrupted caches
        root.children.set(child.path, child);
        child.children.set(root.path, root);

        const tree = new Map<string, TagTreeNode>([['root', root]]);
        expect(findTagNode(tree, 'root')).toBe(root);
        expect(findTagNode(tree, 'missing')).toBeNull();
    });

    it('guards traversal helpers against malformed cycles introduced by invalid tags', () => {
        const root: TagTreeNode = {
            name: 'root',
            path: 'root',
            displayPath: 'root',
            children: new Map(),
            notesWithTag: new Set(['root.md'])
        };
        const child: TagTreeNode = {
            name: 'child',
            path: 'root//child',
            displayPath: 'root//child',
            children: new Map(),
            notesWithTag: new Set(['child.md'])
        };

        // Simulate a corrupted structure where the child references the parent.
        root.children.set(child.path, child);
        child.children.set(root.path, root);

        const files = collectTagFilePaths(root);
        expect(files).toEqual(new Set(['root.md', 'child.md']));

        const paths = Array.from(collectAllTagPaths(root)).sort();
        expect(paths).toEqual(['root', 'root//child']);

        expect(getTotalNoteCount(root)).toBe(2);
    });
});

describe('tagged count visibility', () => {
    it('excludes files with only hidden tags when hidden tags are filtered', () => {
        const db = createMockDb([
            { path: 'visible.md', tags: ['projects/work'] },
            { path: 'hidden.md', tags: ['archive/secret'] }
        ]);

        const filtered = buildTagTreeFromDatabase(db, undefined, undefined, ['archive'], false);
        expect(filtered.tagged).toBe(1);

        const unfiltered = buildTagTreeFromDatabase(db, undefined, undefined, ['archive'], true);
        expect(unfiltered.tagged).toBe(2);
    });
});

describe('tag tree ordering', () => {
    it('uses lexical tie-breakers when natural sorting considers paths equal', () => {
        const db = createMockDb([
            {
                path: 'notes/a.md',
                tags: ['#group/tag1', '#group/tag01']
            }
        ]);

        const { tagTree } = buildTagTreeFromDatabase(db);
        const groupNode = findTagNode(tagTree, 'group');
        const childKeys = Array.from(groupNode?.children.keys() ?? []);

        expect(childKeys).toEqual(['group/tag01', 'group/tag1']);
    });

    it('preserves existing note count cache when cache reset is disabled', () => {
        clearNoteCountCache();

        const cachedNode: TagTreeNode = {
            name: 'cached',
            path: 'cached',
            displayPath: 'cached',
            children: new Map(),
            notesWithTag: new Set(['one.md'])
        };

        expect(getTotalNoteCount(cachedNode)).toBe(1);
        cachedNode.notesWithTag.add('two.md');

        const db = createMockDb([{ path: 'notes/example.md', tags: ['#example'] }]);
        buildTagTreeFromDatabase(db, undefined, undefined, [], false, false);

        expect(getTotalNoteCount(cachedNode)).toBe(1);

        clearNoteCountCache();
        expect(getTotalNoteCount(cachedNode)).toBe(2);
    });

    it('builds a scoped tree from selected file paths without scanning the full database', () => {
        const db = {
            getFile: (path: string) => {
                if (path === 'notes/alpha.md') {
                    return createFileData(['#alpha']);
                }
                if (path === 'notes/untagged.md') {
                    return createFileData([]);
                }
                if (path === 'notes/hidden.md') {
                    return createFileData(['#hidden/private']);
                }
                return null;
            },
            forEachFile: () => {
                throw new Error('full database scan should not run for scoped builds');
            }
        } as unknown as IndexedDBStorage;

        const result = buildTagTreeFromFilePaths(db, ['notes/alpha.md', 'notes/untagged.md', 'notes/hidden.md'], ['hidden'], false, false);

        expect(Array.from(result.tagTree.keys())).toEqual(['alpha', 'hidden']);
        expect(result.tagged).toBe(1);
        expect(result.untagged).toBe(1);
        expect(result.hiddenRootTags.size).toBe(0);
    });
});

describe('included paths iteration', () => {
    it('builds the tree from included paths without a full database scan', () => {
        const db = createPathLookupDb([
            { path: 'notes/alpha.md', tags: ['#alpha'] },
            { path: 'notes/untagged.md', tags: [] },
            { path: 'notes/other.md', tags: ['#other'] }
        ]);

        const includedPaths = new Set(['notes/alpha.md', 'notes/untagged.md', 'notes/missing.md']);
        const result = buildTagTreeFromDatabase(db, undefined, includedPaths);

        expect(Array.from(result.tagTree.keys())).toEqual(['alpha']);
        expect(result.tagged).toBe(1);
        expect(result.untagged).toBe(1);
        expect(result.hiddenRootTags.size).toBe(0);
    });

    it('records hidden root tags for excluded-folder paths in the included set', () => {
        const db = createPathLookupDb([
            { path: 'notes/visible.md', tags: ['#projects', '#shared'] },
            { path: 'archive/old.md', tags: ['#legacy/reports', '#shared/sub'] }
        ]);

        const includedPaths = new Set(['notes/visible.md', 'archive/old.md']);
        const result = buildTagTreeFromDatabase(db, ['archive'], includedPaths);

        expect(Array.from(result.tagTree.keys()).sort()).toEqual(['projects', 'shared']);
        expect(result.tagged).toBe(1);
        expect(result.untagged).toBe(0);
        // Hidden roots that also exist in the visible tree are dropped ('shared'), others remain.
        expect(Array.from(result.hiddenRootTags.keys())).toEqual(['legacy']);
    });
});

describe('excludeFromTagTree', () => {
    it('filters trailing wildcard tag patterns', () => {
        const child: TagTreeNode = {
            name: 'client',
            path: 'projects/client',
            displayPath: 'projects/client',
            children: new Map(),
            notesWithTag: new Set(['child.md'])
        };
        const root: TagTreeNode = {
            name: 'projects',
            path: 'projects',
            displayPath: 'projects',
            children: new Map([[child.path, child]]),
            notesWithTag: new Set(['root.md'])
        };

        const tree = new Map<string, TagTreeNode>([[root.path, root]]);
        const matcher = createHiddenTagMatcher(['projects/*']);
        const filtered = excludeFromTagTree(tree, matcher);

        expect(filtered.has(root.path)).toBe(true);
        const filteredRoot = filtered.get(root.path);
        expect(filteredRoot?.children.size).toBe(0);
    });
});
