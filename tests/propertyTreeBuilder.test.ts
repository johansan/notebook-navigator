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
import type { PropertyItem, FileData } from '../src/storage/IndexedDBStorage';
import { PROPERTIES_ROOT_VIRTUAL_FOLDER_ID } from '../src/types';
import { DEFAULT_SETTINGS } from '../src/settings/defaultSettings';
import {
    canRestorePropertySelectionNodeId,
    determinePropertyToReveal,
    type PropertyTreeDatabaseLike,
    buildPropertyKeyNodeId,
    buildPropertyTreeFromFilePaths,
    buildPropertyTreeFromDatabase,
    buildPropertyValueNodeId,
    collectPropertyKeyFilePaths,
    collectPropertyValueFilePaths,
    getDirectPropertyKeyNoteCount,
    getPropertyKeyNodeIdFromNodeId,
    resolvePropertySelectionNodeId,
    getTotalPropertyNoteCount,
    normalizePropertyTreeValuePath,
    parsePropertyNodeId
} from '../src/utils/propertyTree';
import { setActivePropertyFields } from '../src/utils/vaultProfiles';

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
        forEachFile: (callback: (path: string, data: FileData) => void) => {
            payload.forEach(entry => callback(entry.path, entry.data));
        }
    };
}

function createLookupDb(files: MockFile[]) {
    const payload = new Map<string, FileData>();
    files.forEach(file => {
        payload.set(file.path, createFileData(file.properties));
    });

    return {
        getFile: (path: string) => payload.get(path) ?? null,
        forEachFile: () => {
            throw new Error('full database scan should not run for scoped property builds');
        }
    };
}

describe('buildPropertyTreeFromDatabase', () => {
    it('builds flat key/value nodes and preserves first-seen display casing', () => {
        const db = createMockDb([
            {
                path: 'notes/a.md',
                properties: [{ fieldKey: 'Status', value: 'Work/Finished' }]
            },
            {
                path: 'notes/b.md',
                properties: [{ fieldKey: 'status', value: 'work/Started' }]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['status'])
        });

        expect(Array.from(tree.keys())).toEqual(['status']);
        const keyNode = tree.get('status');
        expect(keyNode?.name).toBe('Status');
        expect(keyNode?.notesWithValue).toEqual(new Set(['notes/a.md', 'notes/b.md']));

        const finishedNodeId = buildPropertyValueNodeId('status', 'work/finished');
        const finishedNode = keyNode?.children.get(finishedNodeId);
        expect(finishedNode?.name).toBe('Work/Finished');
        expect(finishedNode?.notesWithValue).toEqual(new Set(['notes/a.md']));

        const startedNodeId = buildPropertyValueNodeId('status', 'work/started');
        const startedNode = keyNode?.children.get(startedNodeId);
        expect(startedNode?.name).toBe('work/Started');
        expect(startedNode?.notesWithValue).toEqual(new Set(['notes/b.md']));
    });

    it('uses wiki-link display text for value node labels', () => {
        const rawValue = '[[Tech Insights/2026/Tech Insights 2026 Week 7|Tech Insights 2026 Week 7]]';
        const db = createMockDb([
            {
                path: 'notes/a.md',
                properties: [{ fieldKey: 'Status', value: rawValue }]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['status'])
        });
        const keyNode = tree.get('status');
        const valueNode = keyNode?.children.get(buildPropertyValueNodeId('status', normalizePropertyTreeValuePath(rawValue)));

        expect(valueNode?.name).toBe('Tech Insights 2026 Week 7');
        expect(valueNode?.displayPath).toBe('Tech Insights 2026 Week 7');
        expect(valueNode?.assignmentValue).toBe(rawValue);
    });

    it('uses markdown-link display text for external value node labels', () => {
        const rawValue = '[GitHub issue](https://github.com/johansan/notebook-navigator/issues/935)';
        const db = createMockDb([
            {
                path: 'notes/a.md',
                properties: [{ fieldKey: 'Status', value: rawValue }]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['status'])
        });
        const keyNode = tree.get('status');
        const valueNode = keyNode?.children.get(buildPropertyValueNodeId('status', normalizePropertyTreeValuePath(rawValue)));

        expect(valueNode?.name).toBe('GitHub issue');
        expect(valueNode?.displayPath).toBe('GitHub issue');
    });

    it('treats plain text and strict wiki-link aliases as the same canonical value', () => {
        const plainValue = 'Tech Insights 2026 Week 7';
        const wikiLinkValue = '[[Tech Insights/2026/Tech Insights 2026 Week 7|Tech Insights 2026 Week 7]]';
        const db = createMockDb([
            {
                path: 'notes/plain.md',
                properties: [{ fieldKey: 'Status', value: plainValue }]
            },
            {
                path: 'notes/wikilink.md',
                properties: [{ fieldKey: 'Status', value: wikiLinkValue }]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['status'])
        });
        const keyNode = tree.get('status');
        const canonicalValueNodeId = buildPropertyValueNodeId('status', normalizePropertyTreeValuePath(plainValue));
        const canonicalValueNode = keyNode?.children.get(canonicalValueNodeId);

        expect(normalizePropertyTreeValuePath(plainValue)).toBe(normalizePropertyTreeValuePath(wikiLinkValue));
        expect(keyNode?.children.size).toBe(1);
        expect(canonicalValueNode?.notesWithValue).toEqual(new Set(['notes/plain.md', 'notes/wikilink.md']));
        expect(canonicalValueNode?.assignmentValue).toBe(wikiLinkValue);
    });

    it('respects included paths, excluded folders, and included property keys', () => {
        const db = createMockDb([
            {
                path: 'notes/keep.md',
                properties: [{ fieldKey: 'Status', value: '  Work // Done / ' }]
            },
            {
                path: 'notes/skip-key.md',
                properties: [{ fieldKey: 'Priority', value: 'High' }]
            },
            {
                path: 'archive/hidden.md',
                properties: [{ fieldKey: 'Status', value: 'Hidden/Value' }]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPaths: new Set(['notes/keep.md', 'archive/hidden.md', 'notes/skip-key.md']),
            excludedFolderPatterns: ['archive'],
            includedPropertyKeys: new Set(['status'])
        });

        expect(Array.from(tree.keys())).toEqual(['status']);

        const keyNode = tree.get('status');
        expect(keyNode?.notesWithValue).toEqual(new Set(['notes/keep.md']));

        const normalizedValuePath = normalizePropertyTreeValuePath('  Work // Done / ');
        const valueNodeId = buildPropertyValueNodeId('status', normalizedValuePath);
        const valueNode = keyNode?.children.get(valueNodeId);

        expect(valueNode?.notesWithValue).toEqual(new Set(['notes/keep.md']));
        expect(valueNode?.displayPath).toBe('Work // Done /');
        expect(tree.has('priority')).toBe(false);
    });

    it('normalizes full value strings and keeps first-seen display casing', () => {
        const db = createMockDb([
            {
                path: 'notes/first.md',
                properties: [{ fieldKey: 'Status', value: '  Work // Done / ' }]
            },
            {
                path: 'notes/second.md',
                properties: [{ fieldKey: 'status', value: 'work // done /' }]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['status'])
        });
        const keyNode = tree.get('status');
        const valueNode = keyNode?.children.get(buildPropertyValueNodeId('status', normalizePropertyTreeValuePath('work // done /')));

        expect(valueNode?.name).toBe('Work // Done /');
        expect(valueNode?.displayPath).toBe('Work // Done /');
        expect(valueNode?.notesWithValue).toEqual(new Set(['notes/first.md', 'notes/second.md']));
    });

    it('normalizes included property keys before filtering', () => {
        const db = createMockDb([
            {
                path: 'notes/status.md',
                properties: [{ fieldKey: 'Status', value: 'Open' }]
            },
            {
                path: 'notes/priority.md',
                properties: [{ fieldKey: 'Priority', value: 'High' }]
            },
            {
                path: 'notes/mood.md',
                properties: [{ fieldKey: 'Mood', value: 'Calm' }]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set([' status ', 'PRIORITY'])
        });

        expect(Array.from(tree.keys())).toEqual(['priority', 'status']);
        expect(tree.has('mood')).toBe(false);
    });

    it('returns an empty tree when all included property keys normalize to empty values', () => {
        const db = createMockDb([
            {
                path: 'notes/status.md',
                properties: [{ fieldKey: 'Status', value: 'Open' }]
            },
            {
                path: 'notes/priority.md',
                properties: [{ fieldKey: 'Priority', value: 'High' }]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['   '])
        });

        expect(tree.size).toBe(0);
    });

    it('filters by normalized included property keys when some entries normalize to empty values', () => {
        const db = createMockDb([
            {
                path: 'notes/status.md',
                properties: [{ fieldKey: 'Status', value: 'Open' }]
            },
            {
                path: 'notes/priority.md',
                properties: [{ fieldKey: 'Priority', value: 'High' }]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['   ', ' Status '])
        });

        expect(Array.from(tree.keys())).toEqual(['status']);
        expect(tree.has('priority')).toBe(false);
    });

    it('orders key nodes and value nodes deterministically', () => {
        const db = createMockDb([
            {
                path: 'notes/status-zeta.md',
                properties: [{ fieldKey: 'Status', value: 'Work/Zeta' }]
            },
            {
                path: 'notes/zeta.md',
                properties: [{ fieldKey: 'Zeta', value: 'One' }]
            },
            {
                path: 'notes/alpha.md',
                properties: [{ fieldKey: 'Alpha', value: 'Two' }]
            },
            {
                path: 'notes/status-alpha.md',
                properties: [{ fieldKey: 'status', value: 'Work/Alpha' }]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['STATUS', 'zeta', 'alpha'])
        });

        expect(Array.from(tree.keys())).toEqual(['alpha', 'status', 'zeta']);

        const statusNode = tree.get('status');
        expect(statusNode).toBeDefined();
        if (!statusNode) {
            return;
        }

        expect(Array.from(statusNode.children.keys())).toEqual([
            buildPropertyValueNodeId('status', normalizePropertyTreeValuePath('Work/Alpha')),
            buildPropertyValueNodeId('status', normalizePropertyTreeValuePath('Work/Zeta'))
        ]);
    });

    it('builds a scoped property tree from selected file paths without scanning the full database', () => {
        const db = createLookupDb([
            {
                path: 'notes/status.md',
                properties: [{ fieldKey: 'Status', value: 'Open' }]
            },
            {
                path: 'notes/priority.md',
                properties: [{ fieldKey: 'Priority', value: 'High' }]
            },
            {
                path: 'notes/ignored.md',
                properties: [{ fieldKey: 'Mood', value: 'Calm' }]
            }
        ]);

        const tree = buildPropertyTreeFromFilePaths(db, ['notes/status.md', 'notes/priority.md'], {
            includedPropertyKeys: new Set(['status', 'priority'])
        });

        expect(Array.from(tree.keys())).toEqual(['priority', 'status']);
        expect(tree.get('status')?.notesWithValue).toEqual(new Set(['notes/status.md']));
        expect(tree.get('priority')?.notesWithValue).toEqual(new Set(['notes/priority.md']));
        expect(tree.has('mood')).toBe(false);
    });

    it('keeps key nodes for empty values without creating value nodes', () => {
        const db = createMockDb([
            {
                path: 'notes/empty.md',
                properties: [{ fieldKey: 'Status', value: '   ' }]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['status'])
        });

        const keyNodeId = buildPropertyKeyNodeId('status');
        const keyNode = tree.get('status');

        expect(keyNode?.id).toBe(keyNodeId);
        expect(keyNode?.notesWithValue).toEqual(new Set(['notes/empty.md']));
        expect(keyNode?.children.size).toBe(0);
    });

    it('creates value nodes for boolean values', () => {
        const db = createMockDb([
            {
                path: 'notes/true.md',
                properties: [{ fieldKey: 'Status', value: 'true', valueKind: 'boolean' }]
            },
            {
                path: 'notes/false.md',
                properties: [{ fieldKey: 'Status', value: 'false', valueKind: 'boolean' }]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['status'])
        });

        const keyNode = tree.get('status');
        expect(keyNode?.notesWithValue).toEqual(new Set(['notes/true.md', 'notes/false.md']));

        const trueNode = keyNode?.children.get(buildPropertyValueNodeId('status', normalizePropertyTreeValuePath('true')));
        expect(trueNode?.notesWithValue).toEqual(new Set(['notes/true.md']));

        const falseNode = keyNode?.children.get(buildPropertyValueNodeId('status', normalizePropertyTreeValuePath('false')));
        expect(falseNode?.notesWithValue).toEqual(new Set(['notes/false.md']));
    });

    it('keeps string literals "true" and "false" as value nodes', () => {
        const db = createMockDb([
            {
                path: 'notes/true-string.md',
                properties: [{ fieldKey: 'Status', value: 'true', valueKind: 'string' }]
            },
            {
                path: 'notes/false-string.md',
                properties: [{ fieldKey: 'Status', value: 'false', valueKind: 'string' }]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['status'])
        });

        const keyNode = tree.get('status');
        expect(keyNode?.notesWithValue).toEqual(new Set(['notes/true-string.md', 'notes/false-string.md']));

        const trueNode = keyNode?.children.get(buildPropertyValueNodeId('status', normalizePropertyTreeValuePath('true')));
        expect(trueNode?.notesWithValue).toEqual(new Set(['notes/true-string.md']));

        const falseNode = keyNode?.children.get(buildPropertyValueNodeId('status', normalizePropertyTreeValuePath('false')));
        expect(falseNode?.notesWithValue).toEqual(new Set(['notes/false-string.md']));
    });
});

describe('property value matching', () => {
    it('counts exact value totals and collects matching file paths', () => {
        const db = createMockDb([
            {
                path: 'notes/a.md',
                properties: [{ fieldKey: 'Status', value: 'Work/Done' }]
            },
            {
                path: 'notes/b.md',
                properties: [{ fieldKey: 'Status', value: 'Work/Blocked' }]
            },
            {
                path: 'notes/c.md',
                properties: [{ fieldKey: 'Status', value: 'Work' }]
            },
            {
                path: 'notes/d.md',
                properties: [{ fieldKey: 'Status', value: 'Personal/Home' }]
            },
            {
                path: 'notes/e.md',
                properties: [{ fieldKey: 'Status', value: '   ' }]
            },
            {
                path: 'notes/f.md',
                properties: [
                    { fieldKey: 'Status', value: 'true', valueKind: 'boolean' },
                    { fieldKey: 'Status', value: 'Work/Done' }
                ]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['status'])
        });
        const keyNode = tree.get('status');
        expect(keyNode).toBeDefined();
        if (!keyNode) {
            return;
        }

        expect(getTotalPropertyNoteCount(keyNode, normalizePropertyTreeValuePath('Work'))).toBe(1);
        expect(getTotalPropertyNoteCount(keyNode, normalizePropertyTreeValuePath('Work/Done'))).toBe(2);
        expect(getTotalPropertyNoteCount(keyNode, normalizePropertyTreeValuePath('true'))).toBe(1);

        const directPaths = collectPropertyValueFilePaths(keyNode, normalizePropertyTreeValuePath('Work'));
        expect(directPaths).toEqual(new Set(['notes/c.md']));

        const withDescendants = collectPropertyValueFilePaths(keyNode, normalizePropertyTreeValuePath('Work'));
        expect(withDescendants).toEqual(new Set(['notes/c.md']));

        const directKeyPaths = collectPropertyKeyFilePaths(keyNode, false);
        expect(directKeyPaths).toEqual(new Set(['notes/e.md']));
        expect(getDirectPropertyKeyNoteCount(keyNode)).toBe(1);

        const allKeyPaths = collectPropertyKeyFilePaths(keyNode, true);
        expect(allKeyPaths).toEqual(new Set(['notes/a.md', 'notes/b.md', 'notes/c.md', 'notes/d.md', 'notes/e.md', 'notes/f.md']));
    });

    it('keeps value totals exact after value-node mutations', () => {
        const db = createMockDb([
            {
                path: 'notes/a.md',
                properties: [{ fieldKey: 'Status', value: 'Work/Done' }]
            },
            {
                path: 'notes/b.md',
                properties: [{ fieldKey: 'Status', value: 'Work/Blocked' }]
            }
        ]);

        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['status'])
        });
        const keyNode = tree.get('status');
        expect(keyNode).toBeDefined();
        if (!keyNode) {
            return;
        }

        const workPath = normalizePropertyTreeValuePath('Work');
        expect(getTotalPropertyNoteCount(keyNode, workPath)).toBe(0);

        const startedNodeId = buildPropertyValueNodeId('status', normalizePropertyTreeValuePath('Work/Started'));
        keyNode.children.set(startedNodeId, {
            id: startedNodeId,
            kind: 'value',
            key: 'status',
            valuePath: normalizePropertyTreeValuePath('Work/Started'),
            name: 'Work/Started',
            displayPath: 'Work/Started',
            children: new Map(),
            notesWithValue: new Set(['notes/c.md'])
        });

        expect(getTotalPropertyNoteCount(keyNode, workPath)).toBe(0);
    });
});

describe('property node id encoding', () => {
    it('preserves keys and values that contain "=" when building and parsing ids', () => {
        const keyId = buildPropertyKeyNodeId('status=phase');
        const valuePath = normalizePropertyTreeValuePath('work=done/blocked');
        const valueId = buildPropertyValueNodeId('status=phase', valuePath);

        expect(parsePropertyNodeId(keyId)).toEqual({ key: 'status=phase', valuePath: null });
        expect(parsePropertyNodeId(valueId)).toEqual({ key: 'status=phase', valuePath });
        expect(getPropertyKeyNodeIdFromNodeId(valueId)).toBe(keyId);
    });
});

describe('property selection resolution', () => {
    it('keeps selected boolean value nodes when the tree contains them', () => {
        const db = createMockDb([
            {
                path: 'notes/a.md',
                properties: [{ fieldKey: 'Status', value: 'true', valueKind: 'boolean' }]
            }
        ]);
        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['status'])
        });

        const valueSelection = buildPropertyValueNodeId('status', normalizePropertyTreeValuePath('true'));
        const resolved = resolvePropertySelectionNodeId(tree, valueSelection);
        expect(resolved).toBe(valueSelection);
    });

    it('falls back to properties root when selected key does not exist', () => {
        const tree = buildPropertyTreeFromDatabase(createMockDb([]), {
            includedPropertyKeys: new Set(['status'])
        });

        const keySelection = buildPropertyKeyNodeId('status');
        const resolved = resolvePropertySelectionNodeId(tree, keySelection);
        expect(resolved).toBe(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID);
    });

    it('keeps selected value node when a string literal value node exists', () => {
        const db = createMockDb([
            {
                path: 'notes/a.md',
                properties: [{ fieldKey: 'Status', value: 'true', valueKind: 'string' }]
            }
        ]);
        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['status'])
        });

        const valueSelection = buildPropertyValueNodeId('status', normalizePropertyTreeValuePath('true'));
        const resolved = resolvePropertySelectionNodeId(tree, valueSelection);
        expect(resolved).toBe(valueSelection);
    });

    it('resolves legacy wiki-link value selections to the canonical value node', () => {
        const rawValue = '[[Tech Insights/2026/Tech Insights 2026 Week 7|Tech Insights 2026 Week 7]]';
        const db = createMockDb([
            {
                path: 'notes/a.md',
                properties: [{ fieldKey: 'Status', value: rawValue }]
            }
        ]);
        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['status'])
        });

        const legacySelection = buildPropertyValueNodeId('status', rawValue.toLowerCase());
        const canonicalSelection = buildPropertyValueNodeId('status', normalizePropertyTreeValuePath(rawValue));
        const resolved = resolvePropertySelectionNodeId(tree, legacySelection);
        expect(resolved).toBe(canonicalSelection);
    });

    it('resolves NFC and NFD-equivalent property node ids to the canonical node', () => {
        const rawValue = 'Planifié';
        const db = createMockDb([
            {
                path: 'notes/a.md',
                properties: [{ fieldKey: 'Réunion', value: rawValue }]
            }
        ]);
        const tree = buildPropertyTreeFromDatabase(db, {
            includedPropertyKeys: new Set(['réunion'])
        });

        const legacySelection = 'key:Re\u0301union=Planifie\u0301';
        const canonicalSelection = buildPropertyValueNodeId('réunion', normalizePropertyTreeValuePath(rawValue));
        const resolved = resolvePropertySelectionNodeId(tree, legacySelection);
        expect(resolved).toBe(canonicalSelection);
    });
});

describe('property selection restore', () => {
    it('allows restoring properties root when properties section is shown and no fields are configured', () => {
        const settings = {
            ...DEFAULT_SETTINGS,
            showProperties: true
        };
        setActivePropertyFields(settings, '');

        expect(canRestorePropertySelectionNodeId(settings, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID)).toBe(true);
    });

    it('rejects restoring properties root when properties section is hidden', () => {
        const settings = {
            ...DEFAULT_SETTINGS,
            showProperties: false
        };
        setActivePropertyFields(settings, 'status');

        expect(canRestorePropertySelectionNodeId(settings, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID)).toBe(false);
    });

    it('allows restoring NFC and NFD-equivalent property node ids for configured keys', () => {
        const settings = {
            ...DEFAULT_SETTINGS,
            showProperties: true
        };
        setActivePropertyFields(settings, 'Réunion');

        expect(canRestorePropertySelectionNodeId(settings, 'key:Re\u0301union')).toBe(true);
    });
});

describe('property reveal selection', () => {
    it('keeps current property selection while file properties are not indexed yet', () => {
        const settings = {
            ...DEFAULT_SETTINGS,
            showProperties: true
        };
        setActivePropertyFields(settings, 'hideFeature');

        const selection = buildPropertyKeyNodeId('hidefeature');
        const resolved = determinePropertyToReveal(null, selection, settings, false);
        expect(resolved).toBe(selection);
    });

    it('falls back when file has no properties', () => {
        const settings = {
            ...DEFAULT_SETTINGS,
            showProperties: true
        };
        setActivePropertyFields(settings, 'hideFeature');

        const selection = buildPropertyKeyNodeId('hidefeature');
        const resolved = determinePropertyToReveal([], selection, settings, false);
        expect(resolved).toBeNull();
    });

    it('reveals boolean value nodes instead of collapsing them to the key node', () => {
        const settings = {
            ...DEFAULT_SETTINGS,
            showProperties: true
        };
        setActivePropertyFields(settings, 'finished');

        const resolved = determinePropertyToReveal(
            [{ fieldKey: 'finished', value: 'false', valueKind: 'boolean' }],
            buildPropertyKeyNodeId('finished'),
            settings,
            false
        );

        expect(resolved).toBe(buildPropertyValueNodeId('finished', normalizePropertyTreeValuePath('false')));
    });
});
