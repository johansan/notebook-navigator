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
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { getPropertyFrontmatterFields } from '../../src/utils/propertyUtils';

describe('propertyUtils', () => {
    it('omits the word count target property when nothing consumes it', () => {
        const fields = getPropertyFrontmatterFields({
            ...DEFAULT_SETTINGS,
            textCountDisplay: 'none',
            noteGrouping: 'date',
            wordCountTargetProperty: 'word-goal'
        });

        expect(fields).toEqual([]);
    });

    it('includes the word count target property when word count display is enabled', () => {
        const fields = getPropertyFrontmatterFields({
            ...DEFAULT_SETTINGS,
            textCountDisplay: 'words',
            wordCountTargetProperty: 'word-goal'
        });

        expect(fields).toEqual(['word-goal']);
    });

    it('includes the word count target property when custom group headers are configured', () => {
        const fields = getPropertyFrontmatterFields({
            ...DEFAULT_SETTINGS,
            textCountDisplay: 'none',
            noteGrouping: 'custom',
            wordCountTargetProperty: 'word-goal'
        });

        expect(fields).toEqual(['word-goal']);
    });

    it('includes the word count target property when sorting activates custom group headers', () => {
        const fields = getPropertyFrontmatterFields({
            ...DEFAULT_SETTINGS,
            textCountDisplay: 'none',
            noteGrouping: 'date',
            defaultFolderSort: 'title-asc',
            wordCountTargetProperty: 'word-goal'
        });

        expect(fields).toEqual(['word-goal']);
    });

    it('does not duplicate a configured visible property used as the word count target', () => {
        const defaultProfile = DEFAULT_SETTINGS.vaultProfiles[0];
        if (!defaultProfile) {
            throw new Error('Default vault profile missing.');
        }

        const fields = getPropertyFrontmatterFields({
            ...DEFAULT_SETTINGS,
            textCountDisplay: 'words',
            wordCountTargetProperty: 'word-goal',
            vaultProfiles: [
                {
                    ...defaultProfile,
                    propertyKeys: [
                        { key: 'status', showInNavigation: true, showInList: true, showInFileMenu: false },
                        { key: 'Word-Goal', showInNavigation: true, showInList: true, showInFileMenu: false }
                    ]
                }
            ]
        });

        expect(fields).toEqual(['status', 'Word-Goal']);
    });
});
