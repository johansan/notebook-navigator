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
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { buildFileTooltipDateLines, buildFileTooltipWordCountLine } from '../../src/utils/navigationTooltipUtils';
import { formatTextCount } from '../../src/utils/wordCountUtils';
import { createTestTFile } from './createTestTFile';

function buildSettings(overrides: Partial<NotebookNavigatorSettings>): NotebookNavigatorSettings {
    return {
        ...structuredClone(DEFAULT_SETTINGS),
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '',
        showTooltipPath: false,
        ...overrides
    };
}

const getFileTimestamps = () => ({
    created: Date.UTC(2026, 0, 1, 12),
    modified: Date.UTC(2026, 0, 2, 12)
});

describe('navigationTooltipUtils', () => {
    it('builds the word count line for markdown notes when enabled', () => {
        const line = buildFileTooltipWordCountLine({
            file: createTestTFile('Notes/Counted.md'),
            settings: buildSettings({ showTooltipWordCount: true }),
            wordCount: 1234
        });

        expect(line).toBe(`Word count: ${formatTextCount(1234)}`);
    });

    it('omits the word count line for non-markdown files and missing counts', () => {
        const settings = buildSettings({ showTooltipWordCount: true });

        expect(buildFileTooltipWordCountLine({ file: createTestTFile('Notes/Image.png'), settings, wordCount: 1234 })).toBeNull();
        expect(buildFileTooltipWordCountLine({ file: createTestTFile('Notes/Counted.md'), settings, wordCount: null })).toBeNull();
    });

    it('orders date lines by the active sort option', () => {
        const options = {
            file: createTestTFile('Notes/Dated.md'),
            settings: buildSettings({}),
            getFileTimestamps
        };

        const modifiedFirst = buildFileTooltipDateLines(options);
        expect(modifiedFirst[0]).toContain('Last modified at');
        expect(modifiedFirst[1]).toContain('Created at');

        const createdFirst = buildFileTooltipDateLines({ ...options, sortOption: 'created-desc' });
        expect(createdFirst[0]).toContain('Created at');
        expect(createdFirst[1]).toContain('Last modified at');
    });

    it('omits the word count line when the tooltip subsetting is off', () => {
        const line = buildFileTooltipWordCountLine({
            file: createTestTFile('Notes/Counted.md'),
            settings: buildSettings({ showTooltipWordCount: false }),
            wordCount: 1234
        });

        expect(line).toBeNull();
    });
});
