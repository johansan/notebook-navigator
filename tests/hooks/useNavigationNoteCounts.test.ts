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
import { App } from 'obsidian';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { NavigationPaneItemType } from '../../src/types';
import type { PropertyTreeNode } from '../../src/types/storage';
import type { NavigationNoteCounts } from '../../src/hooks/navigationPane/data/useNavigationNoteCounts';
import { useNavigationNoteCounts } from '../../src/hooks/navigationPane/data/useNavigationNoteCounts';
import { buildPropertyKeyNodeId, buildPropertyValueNodeId } from '../../src/utils/propertyTree';

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

describe('useNavigationNoteCounts', () => {
    it('uses the rendered property tree when computing scoped property totals', () => {
        const globalValueNode = createPropertyValueNode('status', 'open', 'Open', ['notes/a.md', 'notes/b.md']);
        const globalKeyNode = createPropertyKeyNode('status', 'Status', ['notes/a.md', 'notes/b.md'], [globalValueNode]);
        const scopedValueNode = createPropertyValueNode('status', 'open', 'Open', ['notes/a.md']);
        const scopedKeyNode = createPropertyKeyNode('status', 'Status', ['notes/a.md'], [scopedValueNode]);

        const app = new App();
        let captured: NavigationNoteCounts | null = null;

        function Harness() {
            captured = useNavigationNoteCounts({
                app,
                isVisible: true,
                settings: {
                    ...DEFAULT_SETTINGS,
                    showNoteCount: true
                },
                propertiesSectionActive: true,
                itemsWithMetadata: [
                    {
                        type: NavigationPaneItemType.PROPERTY_VALUE,
                        data: scopedValueNode,
                        level: 1,
                        key: scopedValueNode.id
                    }
                ],
                includeDescendantNotes: true,
                visibleTaggedCount: 0,
                untaggedCount: 0,
                renderPropertyTree: new Map([[scopedKeyNode.key, scopedKeyNode]]),
                propertyCollectionCount: undefined,
                effectiveFrontmatterExclusions: [],
                hiddenFolders: [],
                descendantExcludedFolders: [],
                hiddenFileTags: [],
                showHiddenItems: false,
                folderCountFileNameMatcher: null,
                fileVisibility: DEFAULT_SETTINGS.vaultProfiles[0].fileVisibility,
                folderChangeVersion: 0,
                vaultChangeVersion: 0,
                metadataVisibilityVersion: 0,
                tagDataVersion: 0
            });
            return null;
        }

        renderToStaticMarkup(React.createElement(Harness));

        expect(captured).not.toBeNull();
        if (!captured) {
            throw new Error('Expected hook result');
        }
        const result = captured as NavigationNoteCounts;

        expect(globalKeyNode.notesWithValue.size).toBe(2);
        expect(result.propertyCounts.get(scopedValueNode.id)).toEqual({ current: 1, descendants: 0, total: 1 });
    });
});
