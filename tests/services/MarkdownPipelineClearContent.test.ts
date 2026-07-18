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

import { App } from 'obsidian';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownPipelineContentProvider } from '../../src/services/content/MarkdownPipelineContentProvider';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import { setActivePropertyFields } from '../../src/utils/vaultProfiles';

const batchClearAllFileContentMock = vi.fn();
const batchClearFeatureImageContentMock = vi.fn();

// Replaces storage access with spies so tests can assert clearContent DB calls directly.
vi.mock('../../src/storage/fileOperations', () => ({
    getDBInstance: () => ({
        batchClearAllFileContent: batchClearAllFileContentMock,
        batchClearFeatureImageContent: batchClearFeatureImageContentMock
    })
}));

// Builds a stable baseline with markdown preview/feature-image extraction disabled unless overridden by each test.
function createSettings(overrides: Partial<NotebookNavigatorSettings> & { propertyFields?: string }): NotebookNavigatorSettings {
    const { propertyFields: rawPropertyFields, ...restOverrides } = overrides;
    const settings = structuredClone(DEFAULT_SETTINGS);
    settings.showFilePreview = false;
    settings.showFeatureImage = false;
    Object.assign(settings, restOverrides);

    if (typeof rawPropertyFields === 'string') {
        setActivePropertyFields(settings, rawPropertyFields);
    }

    return settings;
}

describe('MarkdownPipelineContentProvider clearContent', () => {
    beforeEach(() => {
        batchClearAllFileContentMock.mockReset();
        batchClearFeatureImageContentMock.mockReset();
    });

    it('declares every list sort setting used by word count consumers', () => {
        const provider = new MarkdownPipelineContentProvider(new App());

        expect(provider.getRelevantSettings()).toEqual(
            expect.arrayContaining([
                'defaultFolderSort',
                'propertySortKey',
                'folderSortOverrides',
                'tagSortOverrides',
                'propertySortOverrides'
            ])
        );
    });

    it('clears persisted properties when property fields are disabled', async () => {
        const provider = new MarkdownPipelineContentProvider(new App());
        const oldSettings = createSettings({ propertyFields: 'status' });
        const newSettings = createSettings({ propertyFields: '' });

        await provider.clearContent({ oldSettings, newSettings });

        expect(batchClearAllFileContentMock).toHaveBeenCalledTimes(1);
        expect(batchClearAllFileContentMock).toHaveBeenCalledWith('properties');
    });

    it('clears previews when preview is enabled', async () => {
        const provider = new MarkdownPipelineContentProvider(new App());
        const oldSettings = createSettings({ showFilePreview: false });
        const newSettings = createSettings({ showFilePreview: true });

        await provider.clearContent({ oldSettings, newSettings });

        expect(batchClearAllFileContentMock).toHaveBeenCalledTimes(1);
        expect(batchClearAllFileContentMock).toHaveBeenCalledWith('preview');
    });

    it('clears previews when preview is disabled', async () => {
        const provider = new MarkdownPipelineContentProvider(new App());
        const oldSettings = createSettings({ showFilePreview: true });
        const newSettings = createSettings({ showFilePreview: false });

        await provider.clearContent({ oldSettings, newSettings });

        expect(batchClearAllFileContentMock).toHaveBeenCalledTimes(1);
        expect(batchClearAllFileContentMock).toHaveBeenCalledWith('preview');
    });

    it('clears persisted properties when property fields change while remaining enabled', async () => {
        const provider = new MarkdownPipelineContentProvider(new App());
        const oldSettings = createSettings({ propertyFields: 'status' });
        const newSettings = createSettings({ propertyFields: 'status, type' });

        await provider.clearContent({ oldSettings, newSettings });

        expect(batchClearAllFileContentMock).toHaveBeenCalledTimes(1);
        expect(batchClearAllFileContentMock).toHaveBeenCalledWith('properties');
    });

    it('clears character counts when character count display is enabled', async () => {
        const provider = new MarkdownPipelineContentProvider(new App());
        const oldSettings = createSettings({ textCountDisplay: 'none' });
        const newSettings = createSettings({ textCountDisplay: 'characters' });

        await provider.clearContent({ oldSettings, newSettings });

        expect(provider.shouldRegenerate(oldSettings, newSettings)).toBe(true);
        expect(batchClearAllFileContentMock).toHaveBeenCalledTimes(1);
        expect(batchClearAllFileContentMock).toHaveBeenCalledWith('characterCount');
        expect(batchClearFeatureImageContentMock).not.toHaveBeenCalled();
    });

    it('clears word counts when tooltip word count is enabled', async () => {
        const provider = new MarkdownPipelineContentProvider(new App());
        const oldSettings = createSettings({ showTooltips: false, showTooltipWordCount: false });
        const newSettings = createSettings({ showTooltips: true, showTooltipWordCount: true });

        await provider.clearContent({ oldSettings, newSettings });

        expect(provider.shouldRegenerate(oldSettings, newSettings)).toBe(true);
        expect(batchClearAllFileContentMock).toHaveBeenCalledTimes(1);
        expect(batchClearAllFileContentMock).toHaveBeenCalledWith('wordCount');
        expect(batchClearFeatureImageContentMock).not.toHaveBeenCalled();
    });

    it('clears word counts when sorting activates custom group headers', async () => {
        const provider = new MarkdownPipelineContentProvider(new App());
        const oldSettings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'date',
            defaultFolderSort: 'modified-desc'
        });
        const newSettings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'date',
            defaultFolderSort: 'title-asc'
        });

        await provider.clearContent({ oldSettings, newSettings });

        expect(provider.shouldRegenerate(oldSettings, newSettings)).toBe(true);
        expect(batchClearAllFileContentMock).toHaveBeenCalledWith('wordCount');
        expect(batchClearFeatureImageContentMock).not.toHaveBeenCalled();
    });
});
