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
import { buildFileTooltip } from '../../src/utils/navigationTooltipUtils';
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
    it('adds word count for markdown note tooltips when enabled', () => {
        const tooltip = buildFileTooltip({
            file: createTestTFile('Notes/Counted.md'),
            displayName: 'Counted',
            extensionSuffix: '',
            settings: buildSettings({ showTooltipWordCount: true }),
            getFileTimestamps,
            wordCount: 1234
        });

        expect(tooltip.split('\n')).toContain(`Word count: ${formatTextCount(1234)}`);
    });

    it('omits word count when the tooltip subsetting is off', () => {
        const tooltip = buildFileTooltip({
            file: createTestTFile('Notes/Counted.md'),
            displayName: 'Counted',
            extensionSuffix: '',
            settings: buildSettings({ showTooltipWordCount: false }),
            getFileTimestamps,
            wordCount: 1234
        });

        expect(tooltip).not.toContain('Word count');
    });
});
