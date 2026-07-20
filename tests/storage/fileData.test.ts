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
import {
    applyFileMetadataPatch,
    getChangedPropertyKeys,
    hasMetadataDecorationChanged,
    hasMetadataHiddenChanged,
    hasMetadataNameChanged
} from '../../src/storage/indexeddb/fileData';

describe('getChangedPropertyKeys', () => {
    it('reports only property keys whose tree membership changed', () => {
        expect(
            getChangedPropertyKeys(
                [
                    { fieldKey: 'Status', value: 'Open', valueKind: 'string' },
                    { fieldKey: 'Mood', value: 'Calm', valueKind: 'string' }
                ],
                [
                    { fieldKey: 'status', value: 'Open', valueKind: 'string' },
                    { fieldKey: 'Mood', value: 'Focused', valueKind: 'string' }
                ]
            )
        ).toEqual(['mood']);
    });

    it('ignores value ordering and duplicate membership', () => {
        expect(
            getChangedPropertyKeys(
                [
                    { fieldKey: 'Status', value: 'Open' },
                    { fieldKey: 'Status', value: 'Closed' }
                ],
                [
                    { fieldKey: 'status', value: 'Closed', valueKind: 'string' },
                    { fieldKey: 'status', value: 'Open', valueKind: 'string' },
                    { fieldKey: 'status', value: 'Open', valueKind: 'string' }
                ]
            )
        ).toEqual([]);
    });
});

describe('hasMetadataNameChanged', () => {
    it('treats trimmed-equivalent names as unchanged', () => {
        expect(hasMetadataNameChanged({ name: 'Folder' }, { name: '  Folder  ' })).toBe(false);
    });

    it('treats blank and missing names as unchanged', () => {
        expect(hasMetadataNameChanged({ name: '   ' }, {})).toBe(false);
        expect(hasMetadataNameChanged({ name: '' }, null)).toBe(false);
    });

    it('detects meaningful metadata name changes', () => {
        expect(hasMetadataNameChanged({ name: 'Alpha' }, { name: 'Beta' })).toBe(true);
        expect(hasMetadataNameChanged(null, { name: 'Alpha' })).toBe(true);
    });
});

describe('hasMetadataHiddenChanged', () => {
    it('treats missing and false hidden flags as unchanged', () => {
        expect(hasMetadataHiddenChanged({}, { hidden: false })).toBe(false);
        expect(hasMetadataHiddenChanged(null, {})).toBe(false);
    });

    it('detects frontmatter visibility changes', () => {
        expect(hasMetadataHiddenChanged({ hidden: false }, { hidden: true })).toBe(true);
        expect(hasMetadataHiddenChanged({ hidden: true }, null)).toBe(true);
    });
});

describe('hasMetadataDecorationChanged', () => {
    it('ignores date-only metadata changes', () => {
        expect(hasMetadataDecorationChanged({ created: 1, modified: 2 }, { created: 3, modified: 4 })).toBe(false);
    });

    it('detects navigation decoration changes', () => {
        expect(hasMetadataDecorationChanged({ icon: 'lucide-star' }, { icon: 'lucide-folder' })).toBe(true);
        expect(hasMetadataDecorationChanged({ color: '#ff0000' }, { color: '#00ff00' })).toBe(true);
        expect(hasMetadataDecorationChanged({ background: '#ff0000' }, { background: '#00ff00' })).toBe(true);
    });

    it('detects display-name changes', () => {
        expect(hasMetadataDecorationChanged({ name: 'Alpha' }, { name: 'Beta' })).toBe(true);
    });
});

describe('applyFileMetadataPatch', () => {
    it('reports unchanged patches without recreating metadata events', () => {
        const result = applyFileMetadataPatch({ icon: 'lucide-star', color: 'red' }, { icon: 'lucide-star' });

        expect(result.changed).toBe(false);
        expect(result.metadata).toEqual({ icon: 'lucide-star', color: 'red' });
    });

    it('treats missing undefined fields as unchanged', () => {
        const result = applyFileMetadataPatch({}, { icon: undefined });

        expect(result.changed).toBe(false);
        expect(result.metadata).toEqual({});
    });

    it('removes fields when a patch value is undefined', () => {
        const result = applyFileMetadataPatch({ icon: 'lucide-star', color: 'red' }, { icon: undefined });

        expect(result.changed).toBe(true);
        expect(result.metadata).toEqual({ color: 'red' });
    });

    it('applies string, number, and boolean metadata fields', () => {
        const result = applyFileMetadataPatch(null, {
            name: 'Display name',
            created: 123,
            modified: 456,
            hidden: true
        });

        expect(result.changed).toBe(true);
        expect(result.metadata).toEqual({
            name: 'Display name',
            created: 123,
            modified: 456,
            hidden: true
        });
    });
});
