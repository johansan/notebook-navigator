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
import { buildPropertyKeyNodeId, buildPropertyValueNodeId, buildPropertyValueNodeIdFromKeyNodeId } from '../../src/utils/propertyTree';

describe('buildPropertyValueNodeIdFromKeyNodeId', () => {
    it('builds the same id as buildPropertyValueNodeId, including encoded values', () => {
        // Manual value orders store raw value paths; cleanup and counts must find the encoded node ids
        ['done', '50%', 'a=b', 'https://example.com/?x=1&y=%20'].forEach(valuePath => {
            expect(buildPropertyValueNodeIdFromKeyNodeId(buildPropertyKeyNodeId('progress'), valuePath)).toBe(
                buildPropertyValueNodeId('progress', valuePath)
            );
        });
    });
});
