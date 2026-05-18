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
import { App, TFile } from 'obsidian';
import {
    getCachedWordCountTargetFromFrontmatter,
    getWordCountDisplayText,
    getWordCountTargetFromProperties
} from '../../src/utils/wordCountUtils';
import { createTestTFile } from './createTestTFile';

describe('wordCountUtils', () => {
    it('reads the configured target property case-insensitively', () => {
        const target = getWordCountTargetFromProperties(
            [
                { fieldKey: 'status', value: 'draft' },
                { fieldKey: 'Word-Goal', value: '5,000', valueKind: 'string' }
            ],
            'word-goal'
        );

        expect(target).toBe(5000);
    });

    it('reads cached frontmatter target properties case-insensitively', () => {
        const app = new App();
        const file = createTestTFile('notes/draft.md');
        app.metadataCache.getFileCache = (target: TFile) => ({
            frontmatter: target.path === file.path ? { 'Word-Goal': '5,000' } : {}
        });

        expect(getCachedWordCountTargetFromFrontmatter(app, file, 'word-goal')).toBe(5000);
    });

    it('formats target percentage display as percentage only', () => {
        expect(
            getWordCountDisplayText({
                wordCount: 1250,
                properties: [{ fieldKey: 'word-goal', value: '5000', valueKind: 'number' }],
                targetProperty: 'word-goal',
                showTargetPercentage: true
            })
        ).toBe('25%');
    });

    it('formats word count targets without percentages', () => {
        expect(
            getWordCountDisplayText({
                wordCount: 1250,
                properties: [{ fieldKey: 'word-goal', value: '5000', valueKind: 'number' }],
                targetProperty: 'word-goal',
                showTargetPercentage: false
            })
        ).toBe('1,250 / 5,000');
    });
});
