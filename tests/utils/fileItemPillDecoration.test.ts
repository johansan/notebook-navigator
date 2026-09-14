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

import { UNTAGGED_TAG_ID } from '../../src/types';
import type { PropertyTreeNode, TagTreeNode } from '../../src/types/storage';
import { buildRainbowPalette, parseCssColor } from '../../src/utils/colorUtils';
import {
    buildFileItemPropertyRainbowColors,
    buildFileItemTagRainbowColors,
    resolveFileItemTagDecorationColors
} from '../../src/utils/fileItemPillDecoration';

function createPalette(): string[] {
    const start = parseCssColor('#000000') ?? { r: 0, g: 0, b: 0, a: 1 };
    const end = parseCssColor('#ffffff') ?? { r: 255, g: 255, b: 255, a: 1 };
    return buildRainbowPalette({ steps: 1024, start, end, style: 'rgb' });
}

function createTagNode(path: string, children: TagTreeNode[] = []): TagTreeNode {
    const node: TagTreeNode = {
        name: path.split('/').pop() ?? path,
        path,
        displayPath: path,
        children: new Map(),
        notesWithTag: new Set()
    };
    children.forEach(child => {
        node.children.set(child.name.toLowerCase(), child);
    });
    return node;
}

function createPropertyNode(params: {
    id: `key:${string}` | `key:${string}=${string}`;
    kind: 'key' | 'value';
    key: string;
    valuePath: string | null;
    name: string;
    children?: PropertyTreeNode[];
}): PropertyTreeNode {
    const node: PropertyTreeNode = {
        id: params.id,
        kind: params.kind,
        key: params.key,
        valuePath: params.valuePath,
        name: params.name,
        displayPath: params.name,
        children: new Map(),
        notesWithValue: new Set()
    };
    params.children?.forEach(child => {
        node.children.set(child.valuePath ?? child.key, child);
    });
    return node;
}

describe('fileItemPillDecoration', () => {
    it.each(['root', 'all', 'child'] as const)('keeps empty tag sections aligned with the %s rainbow scope', scope => {
        const palette = ['#112233', '#445566'];
        const expectedColor = scope === 'child' ? undefined : palette[0];

        for (const rootTagKeys of [[], [UNTAGGED_TAG_ID]]) {
            const colors = buildFileItemTagRainbowColors({
                visibleTagTree: new Map(),
                rootTagKeys,
                rootTagOrderMap: new Map(),
                palette,
                scope,
                showAllTagsFolder: true,
                inheritColors: false
            });

            expect(colors.rootColor).toBe(expectedColor);
            expect(colors.colorsByPath.get(UNTAGGED_TAG_ID)).toBe(rootTagKeys.length > 0 ? expectedColor : undefined);
            expect(colors.colorsByPath.size).toBe(rootTagKeys.length > 0 && expectedColor ? 1 : 0);
        }
    });

    it.each(['root', 'all', 'child'] as const)('keeps empty property sections aligned with the %s rainbow scope', scope => {
        const palette = ['#112233', '#445566'];
        const keyNode = createPropertyNode({ id: 'key:status', kind: 'key', key: 'status', valuePath: null, name: 'status' });
        const propertyTree = new Map([['status', keyNode]]);

        for (const source of [
            { propertyTree: new Map<string, PropertyTreeNode>(), visiblePropertyNavigationKeySet: new Set(['status']) },
            { propertyTree, visiblePropertyNavigationKeySet: new Set<string>() },
            { propertyTree, visiblePropertyNavigationKeySet: new Set(['missing']) }
        ]) {
            const colors = buildFileItemPropertyRainbowColors({
                ...source,
                rootPropertyOrderMap: new Map(),
                propertyKeyComparator: (a, b) => a.key.localeCompare(b.key),
                palette,
                scope,
                showAllPropertiesFolder: true,
                propertySortOrder: 'alpha-asc',
                includeDescendantNotes: false
            });

            expect(colors.rootColor).toBe(scope === 'child' ? undefined : palette[0]);
            expect(colors.colorsByNodeId.size).toBe(0);
            expect(colors.rootColorsByKey.size).toBe(0);
        }
    });

    it('builds tag colors for descendant tags without depending on expanded nav rows', () => {
        const palette = createPalette();
        const childNode = createTagNode('alpha/child');
        const rootNode = createTagNode('alpha', [childNode]);
        const colors = buildFileItemTagRainbowColors({
            visibleTagTree: new Map([['alpha', rootNode]]),
            rootTagOrderMap: new Map(),
            tagComparator: undefined,
            palette,
            scope: 'child',
            showAllTagsFolder: false,
            inheritColors: false
        });

        expect(colors.colorsByPath.has('alpha')).toBe(false);
        expect(colors.colorsByPath.get('alpha/child')).toBe(palette[0]);
    });

    it('resolves file tag rainbow colors with normalized tag paths', () => {
        const direct = resolveFileItemTagDecorationColors({
            model: {
                navRainbowMode: 'foreground',
                tagRainbowColors: {
                    colorsByPath: new Map([['alpha', '#112233']]),
                    rootColor: undefined,
                    getInheritedColor: () => undefined
                },
                propertyRainbowColors: {
                    colorsByNodeId: new Map(),
                    rootColor: undefined,
                    rootColorsByKey: new Map()
                },
                inheritPropertyColors: false
            },
            tagPath: 'Alpha',
            color: undefined,
            backgroundColor: undefined
        });

        const inherited = resolveFileItemTagDecorationColors({
            model: {
                navRainbowMode: 'foreground',
                tagRainbowColors: {
                    colorsByPath: new Map(),
                    rootColor: undefined,
                    getInheritedColor: path => (path === 'alpha/child' ? '#445566' : undefined)
                },
                propertyRainbowColors: {
                    colorsByNodeId: new Map(),
                    rootColor: undefined,
                    rootColorsByKey: new Map()
                },
                inheritPropertyColors: false
            },
            tagPath: 'Alpha/Child',
            color: undefined,
            backgroundColor: undefined
        });

        expect(direct.color).toBe('#112233');
        expect(inherited.color).toBe('#445566');
    });

    it('keeps file tag rainbow positions aligned with untagged in root order', () => {
        const alphaNode = createTagNode('alpha');
        const betaNode = createTagNode('beta');
        const colors = buildFileItemTagRainbowColors({
            visibleTagTree: new Map([
                ['alpha', alphaNode],
                ['beta', betaNode]
            ]),
            rootTagKeys: ['alpha', 'beta', UNTAGGED_TAG_ID],
            rootTagOrderMap: new Map(),
            tagComparator: undefined,
            palette: ['#111111', '#222222', '#333333'],
            scope: 'root',
            showAllTagsFolder: false,
            inheritColors: false
        });

        expect(colors.colorsByPath.get('alpha')).toBe('#111111');
        expect(colors.colorsByPath.get('beta')).toBe('#222222');
        expect(colors.colorsByPath.get(UNTAGGED_TAG_ID)).toBe('#333333');
    });

    it('builds property value colors without depending on expanded navigation keys', () => {
        const palette = createPalette();
        const doneNode = createPropertyNode({
            id: 'key:status=done',
            kind: 'value',
            key: 'status',
            valuePath: 'done',
            name: 'done'
        });
        const todoNode = createPropertyNode({
            id: 'key:status=todo',
            kind: 'value',
            key: 'status',
            valuePath: 'todo',
            name: 'todo'
        });
        const keyNode = createPropertyNode({
            id: 'key:status',
            kind: 'key',
            key: 'status',
            valuePath: null,
            name: 'status',
            children: [doneNode, todoNode]
        });
        const colors = buildFileItemPropertyRainbowColors({
            propertyTree: new Map([['status', keyNode]]),
            visiblePropertyNavigationKeySet: new Set(['status']),
            rootPropertyOrderMap: new Map(),
            propertyKeyComparator: (a, b) => a.key.localeCompare(b.key),
            palette,
            scope: 'child',
            showAllPropertiesFolder: false,
            propertySortOrder: 'alpha-asc',
            includeDescendantNotes: false
        });

        expect(colors.colorsByNodeId.has('key:status')).toBe(false);
        expect(colors.colorsByNodeId.get('key:status=done')).toBe(palette[0]);
        expect(colors.colorsByNodeId.get('key:status=todo')).toBe(palette[palette.length - 1]);
    });
});
