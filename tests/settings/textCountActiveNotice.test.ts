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
import { formatTextCountDependencyScope } from '../../src/settings/tabs/NotesTab';
import { ItemType, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID, TAGGED_TAG_ID, UNTAGGED_TAG_ID } from '../../src/types';

describe('formatTextCountDependencyScope', () => {
    it('uses localized labels for virtual tag collections', () => {
        expect(formatTextCountDependencyScope({ reason: 'appearance', selectionType: ItemType.TAG, key: TAGGED_TAG_ID })).toBe('Tags');
        expect(formatTextCountDependencyScope({ reason: 'appearance', selectionType: ItemType.TAG, key: UNTAGGED_TAG_ID })).toBe(
            'Untagged'
        );
    });

    it('uses the localized label for the properties root', () => {
        expect(
            formatTextCountDependencyScope({
                reason: 'appearance',
                selectionType: ItemType.PROPERTY,
                key: PROPERTIES_ROOT_VIRTUAL_FOLDER_ID
            })
        ).toBe('Properties');
    });
});
