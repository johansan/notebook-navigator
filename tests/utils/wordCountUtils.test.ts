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
    countCharactersForNoteProperty,
    formatTextCount,
    getCachedWordCountTargetFromFrontmatter,
    getObsidianTextCountStartIndex,
    getWordCountDisplayText,
    getWordCountTargetFromProperties
} from '../../src/utils/wordCountUtils';
import { createTestTFile } from './createTestTFile';

describe('wordCountUtils', () => {
    it('counts characters with and without whitespace after frontmatter', () => {
        const content = '---\ntitle: Draft\n---\nHi there\n🙂';
        const bodyStartIndex = content.indexOf('Hi');

        expect(countCharactersForNoteProperty(content, bodyStartIndex)).toEqual({
            withSpaces: 11,
            withoutSpaces: 9
        });
    });

    it('uses Obsidian frontmatter slicing for text counts', () => {
        const content = '---\ntitle: Draft\n---\n\nBody';
        const startIndex = getObsidianTextCountStartIndex(content);

        expect(content.slice(startIndex)).toBe('\nBody');
        expect(countCharactersForNoteProperty(content, startIndex)).toEqual({
            withSpaces: 5,
            withoutSpaces: 4
        });
    });

    it('keeps the blank line after frontmatter in character counts', () => {
        const content = '---\ntitle: Draft\n---\n\nA B';
        const startIndex = getObsidianTextCountStartIndex(content);

        expect(content.slice(startIndex)).toBe('\nA B');
        expect(countCharactersForNoteProperty(content, startIndex)).toEqual({
            withSpaces: 4,
            withoutSpaces: 2
        });
    });

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

    it('formats text counts with the runtime locale', () => {
        expect(formatTextCount(1234.9)).toBe(Math.trunc(1234.9).toLocaleString());
    });

    it('formats word count targets without percentages', () => {
        const formattedWordCount = formatTextCount(1250);
        const formattedTarget = formatTextCount(5000);

        expect(
            getWordCountDisplayText({
                wordCount: 1250,
                properties: [{ fieldKey: 'word-goal', value: '5000', valueKind: 'number' }],
                targetProperty: 'word-goal',
                showTargetPercentage: false
            })
        ).toBe(`${formattedWordCount} / ${formattedTarget}`);
    });
});
