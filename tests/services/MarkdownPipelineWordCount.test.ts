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
import { describe, expect, it, vi } from 'vitest';
import { App, TFile, type CachedMetadata, type EventRef } from 'obsidian';
import { LIMITS } from '../../src/constants/limits';
import { MarkdownPipelineContentProvider } from '../../src/services/content/MarkdownPipelineContentProvider';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import type { FileData } from '../../src/storage/IndexedDBStorage';
import { deriveFileMetadata } from '../utils/pathMetadata';
import { setActivePropertyFields } from '../../src/utils/vaultProfiles';
import {
    getMarkdownTextCountDependencies,
    hasCachedMarkdownWordCountConsumer,
    hasMarkdownWordCountConsumer,
    haveMarkdownCountConsumersChanged,
    refreshMarkdownWordCountConsumerForFile,
    refreshMarkdownWordCountConsumerSettings,
    removeMarkdownWordCountConsumersInFolder,
    renameMarkdownWordCountConsumersInFolder,
    rescanMarkdownWordCountConsumers,
    subscribeInitialMarkdownWordCountConsumerResolution,
    subscribeMarkdownWordCountConsumerChanges
} from '../../src/utils/markdownPipelineContentTypes';
import { ItemType, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID, TAGGED_TAG_ID } from '../../src/types';
import { buildPropertyKeyNodeId } from '../../src/utils/propertyTree';
import { rescanManualSortGroupHeaderWordCountConsumers } from '../../src/utils/manualSort';

class TestMarkdownPipelineContentProvider extends MarkdownPipelineContentProvider {
    async runWordCount(file: TFile, settings: NotebookNavigatorSettings): Promise<number | null> {
        const result = await this.processFile({ file, path: file.path }, null, settings);
        return result.update?.wordCount ?? null;
    }

    async runProcessFile(file: TFile, fileData: FileData | null, settings: NotebookNavigatorSettings) {
        return await this.processFile({ file, path: file.path }, fileData, settings);
    }
}

function createSettings(overrides?: Partial<NotebookNavigatorSettings> & { propertyFields?: string }): NotebookNavigatorSettings {
    const { propertyFields, ...settingsOverrides } = overrides ?? {};
    const settings = structuredClone(DEFAULT_SETTINGS);
    settings.showFilePreview = false;
    settings.showFeatureImage = false;
    settings.textCountDisplay = 'both';
    settings.wordCountTargetProperty = '';
    Object.assign(settings, settingsOverrides);

    if (typeof propertyFields === 'string') {
        setActivePropertyFields(settings, propertyFields);
    }

    return settings;
}

function createApp() {
    const app = new App();
    const cachedMetadataByPath = new Map<string, CachedMetadata>();
    const markdownFiles: TFile[] = [];

    app.metadataCache.getFileCache = (file: TFile) => cachedMetadataByPath.get(file.path) ?? null;
    app.vault.getMarkdownFiles = () => markdownFiles;
    app.vault.getFileByPath = path => markdownFiles.find(file => file.path === path) ?? null;
    app.vault.cachedRead = async (_file: TFile) => '';

    return { app, cachedMetadataByPath, markdownFiles };
}

function createFile(path: string): TFile {
    const file = new TFile();
    const metadata = deriveFileMetadata(path);
    file.path = path;
    file.name = metadata.name;
    file.basename = metadata.basename;
    file.extension = metadata.extension;
    return file;
}

describe('Markdown pipeline appearance relevance', () => {
    it('excludes raw appearance-map references from relevant settings', () => {
        const context = createApp();
        const provider = new TestMarkdownPipelineContentProvider(context.app);

        expect(provider.getRelevantSettings()).not.toContain('folderAppearances');
        expect(provider.getRelevantSettings()).not.toContain('tagAppearances');
        expect(provider.getRelevantSettings()).not.toContain('propertyAppearances');
    });

    it('reports only appearance changes that alter effective count consumers', () => {
        const disabled = createSettings({
            textCountDisplay: 'none',
            showTooltips: false,
            showTooltipWordCount: false,
            folderAppearances: { Writing: { mode: 'standard' } }
        });
        const visualChange = createSettings({
            textCountDisplay: 'none',
            showTooltips: false,
            showTooltipWordCount: false,
            folderAppearances: { Writing: { mode: 'compact', showTags: true } }
        });
        const countsEnabled = createSettings({
            textCountDisplay: 'none',
            showTooltips: false,
            showTooltipWordCount: false,
            folderAppearances: { Writing: { mode: 'compact', textCount: 'words' } }
        });
        const charactersEnabled = createSettings({
            textCountDisplay: 'none',
            showTooltips: false,
            showTooltipWordCount: false,
            folderAppearances: { Writing: { mode: 'compact', textCount: 'characters' } }
        });

        expect(haveMarkdownCountConsumersChanged(disabled, visualChange)).toBe(false);
        expect(haveMarkdownCountConsumersChanged(visualChange, countsEnabled)).toBe(true);
        expect(haveMarkdownCountConsumersChanged(countsEnabled, charactersEnabled)).toBe(true);
        expect(haveMarkdownCountConsumersChanged(countsEnabled, visualChange)).toBe(true);
    });

    it('lists only appearances and actual group headers that request word counts', () => {
        const { app, cachedMetadataByPath, markdownFiles } = createApp();
        const headerFile = createFile('Projects/Draft.md');
        markdownFiles.push(headerFile);
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Draft', show_word_count: true }
            }
        });
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'date',
            defaultFolderSort: 'modified-desc',
            folderAppearances: { Writing: { textCount: 'words' }, Projects: { groupBy: 'custom' } },
            folderSortOverrides: { Projects: 'title-asc' },
            manualSortGroupHeaderProperty: 'group_header'
        });

        expect(getMarkdownTextCountDependencies(app, settings)).toEqual([
            { reason: 'appearance', selectionType: ItemType.FOLDER, key: 'Writing' },
            { reason: 'group-header', path: 'Projects/Draft.md' }
        ]);
        expect(hasMarkdownWordCountConsumer(settings, app)).toBe(true);
    });

    it('lists only dependencies for count kinds the global display omits', () => {
        const { app } = createApp();
        const characterOverride = createSettings({
            textCountDisplay: 'none',
            folderAppearances: { Writing: { textCount: 'characters' } }
        });
        expect(getMarkdownTextCountDependencies(app, characterOverride)).toEqual([
            { reason: 'appearance', selectionType: ItemType.FOLDER, key: 'Writing' }
        ]);

        const wordsShownGlobally = createSettings({
            textCountDisplay: 'words',
            folderAppearances: { Writing: { textCount: 'characters' } }
        });
        expect(getMarkdownTextCountDependencies(app, wordsShownGlobally)).toEqual([
            { reason: 'appearance', selectionType: ItemType.FOLDER, key: 'Writing' }
        ]);

        const charactersShownGlobally = createSettings({
            textCountDisplay: 'characters',
            folderAppearances: { Writing: { textCount: 'characters' } }
        });
        expect(getMarkdownTextCountDependencies(app, charactersShownGlobally)).toEqual([]);

        const bothShownGlobally = createSettings({
            textCountDisplay: 'both',
            folderAppearances: { Writing: { textCount: 'words' } }
        });
        expect(getMarkdownTextCountDependencies(app, bothShownGlobally)).toEqual([]);
    });

    it('uses the initialized group-header cache without scanning the vault from render checks', () => {
        const { app, cachedMetadataByPath, markdownFiles } = createApp();
        const headerFile = createFile('Projects/Header.md');
        markdownFiles.push(headerFile);
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Projects', show_word_count: true }
            }
        });
        const getMarkdownFiles = vi.fn(() => markdownFiles);
        const getFileByPath = vi.fn((path: string) => markdownFiles.find(file => file.path === path) ?? null);
        app.vault.getMarkdownFiles = getMarkdownFiles;
        app.vault.getFileByPath = getFileByPath;
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'custom',
            defaultFolderSort: 'title-asc',
            manualSortGroupHeaderProperty: 'group_header'
        });

        expect(hasCachedMarkdownWordCountConsumer(settings, app)).toBe(false);
        expect(getMarkdownFiles).not.toHaveBeenCalled();
        expect(getFileByPath).not.toHaveBeenCalled();

        rescanManualSortGroupHeaderWordCountConsumers(app, settings);
        expect(hasCachedMarkdownWordCountConsumer(settings, app)).toBe(false);
        expect(getFileByPath).not.toHaveBeenCalled();
        hasMarkdownWordCountConsumer(settings, app);

        expect(getMarkdownFiles).toHaveBeenCalledTimes(1);
        getFileByPath.mockClear();
        const publishedSnapshot = { ...settings };
        expect(hasCachedMarkdownWordCountConsumer(publishedSnapshot, app)).toBe(true);
        expect(getMarkdownFiles).toHaveBeenCalledTimes(1);
        expect(getFileByPath).not.toHaveBeenCalled();
    });

    it('invalidates group-header dependencies after settings mutate in place', () => {
        const { app, cachedMetadataByPath, markdownFiles } = createApp();
        const headerFile = createFile('Projects/Header.md');
        markdownFiles.push(headerFile);
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Projects', show_word_count: true }
            }
        });
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'date',
            defaultFolderSort: 'modified-desc',
            manualSortGroupHeaderProperty: 'group_header'
        });

        expect(getMarkdownTextCountDependencies(app, settings)).toEqual([]);

        settings.folderAppearances.Projects = { groupBy: 'custom' };
        refreshMarkdownWordCountConsumerSettings(app, settings);

        expect(getMarkdownTextCountDependencies(app, settings)).toEqual([{ reason: 'group-header', path: headerFile.path }]);
    });

    it('does not enable word counting for a custom sort order without a consuming header', () => {
        const { app } = createApp();
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'custom',
            defaultFolderSort: 'title-asc',
            manualSortGroupHeaderProperty: 'group_header'
        });

        expect(getMarkdownTextCountDependencies(app, settings)).toEqual([]);
        expect(hasMarkdownWordCountConsumer(settings, app)).toBe(false);
    });

    it('reports activation when a resolved metadata scan discovers the first consuming header', () => {
        const { app, cachedMetadataByPath, markdownFiles } = createApp();
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'custom',
            defaultFolderSort: 'title-asc',
            manualSortGroupHeaderProperty: 'group_header'
        });

        expect(hasMarkdownWordCountConsumer(settings, app)).toBe(false);

        const headerFile = createFile('Notes/Header.md');
        markdownFiles.push(headerFile);
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Header', show_word_count: true }
            }
        });

        expect(rescanMarkdownWordCountConsumers(app, settings)).toEqual({ becameActive: true, dependenciesChanged: true });
        expect(rescanMarkdownWordCountConsumers(app, settings)).toEqual({ becameActive: false, dependenciesChanged: false });
    });

    it('removes the startup resolution listener before later metadata resolutions', () => {
        const { app } = createApp();
        const listeners = new Map<EventRef, () => void>();
        app.metadataCache.on = vi.fn((_name: 'resolved', callback: () => void) => {
            const eventRef = {} as EventRef;
            listeners.set(eventRef, callback);
            return eventRef;
        });
        const offref = vi.fn((eventRef: EventRef) => {
            listeners.delete(eventRef);
        });
        app.metadataCache.offref = offref;
        const listener = vi.fn();
        const unsubscribe = subscribeInitialMarkdownWordCountConsumerResolution(app, listener);
        const triggerResolved = () => Array.from(listeners.values()).forEach(callback => callback());

        triggerResolved();
        triggerResolved();

        expect(listener).toHaveBeenCalledOnce();
        expect(offref).toHaveBeenCalledOnce();
        unsubscribe();
        expect(offref).toHaveBeenCalledOnce();
    });

    it('publishes activation and deactivation when one header changes', () => {
        const { app, cachedMetadataByPath, markdownFiles } = createApp();
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'custom',
            defaultFolderSort: 'title-asc',
            manualSortGroupHeaderProperty: 'group_header'
        });
        expect(hasMarkdownWordCountConsumer(settings, app)).toBe(false);

        const headerFile = createFile('Notes/Header.md');
        markdownFiles.push(headerFile);
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Header', show_word_count: true }
            }
        });
        const listener = vi.fn();
        const unsubscribe = subscribeMarkdownWordCountConsumerChanges(app, listener);

        expect(refreshMarkdownWordCountConsumerForFile(app, headerFile, settings)).toEqual({
            becameActive: true,
            dependenciesChanged: true
        });
        expect(hasCachedMarkdownWordCountConsumer(settings, app)).toBe(true);
        expect(listener).toHaveBeenCalledTimes(1);

        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Header', show_word_count: false }
            }
        });
        expect(refreshMarkdownWordCountConsumerForFile(app, headerFile, settings)).toEqual({
            becameActive: false,
            dependenciesChanged: true
        });
        expect(hasCachedMarkdownWordCountConsumer(settings, app)).toBe(false);
        expect(listener).toHaveBeenCalledTimes(2);

        unsubscribe();
    });

    it('publishes when an unchanged header leaves its active tag context', () => {
        const { app, cachedMetadataByPath, markdownFiles } = createApp();
        const headerFile = createFile('Notes/Header.md');
        markdownFiles.push(headerFile);
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Header', show_word_count: true },
                tags: ['work']
            }
        });
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'date',
            defaultFolderSort: 'modified-desc',
            tagAppearances: { work: { groupBy: 'custom' } },
            tagSortOverrides: { work: 'title-asc' },
            manualSortGroupHeaderProperty: 'group_header',
            showTags: true
        });
        expect(hasMarkdownWordCountConsumer(settings, app)).toBe(true);
        const listener = vi.fn();
        const unsubscribe = subscribeMarkdownWordCountConsumerChanges(app, listener);

        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Header', show_word_count: true },
                tags: ['personal']
            }
        });
        expect(refreshMarkdownWordCountConsumerForFile(app, headerFile, settings)).toEqual({
            becameActive: false,
            dependenciesChanged: true
        });
        expect(hasCachedMarkdownWordCountConsumer(settings, app)).toBe(false);
        expect(listener).toHaveBeenCalledOnce();

        unsubscribe();
    });

    it('publishes folder path changes without rescanning markdown files', () => {
        const { app, cachedMetadataByPath, markdownFiles } = createApp();
        const headerFile = createFile('Projects/Header.md');
        markdownFiles.push(headerFile);
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Header', show_word_count: true }
            }
        });
        const getMarkdownFiles = vi.fn(() => markdownFiles);
        app.vault.getMarkdownFiles = getMarkdownFiles;
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'custom',
            defaultFolderSort: 'title-asc',
            manualSortGroupHeaderProperty: 'group_header'
        });
        expect(hasMarkdownWordCountConsumer(settings, app)).toBe(true);
        expect(getMarkdownFiles).toHaveBeenCalledOnce();

        cachedMetadataByPath.delete(headerFile.path);
        headerFile.path = 'Archive/Header.md';
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Header', show_word_count: true }
            }
        });
        expect(renameMarkdownWordCountConsumersInFolder(app, 'Projects', 'Archive', settings)).toEqual({
            becameActive: false,
            dependenciesChanged: true
        });
        expect(getMarkdownFiles).toHaveBeenCalledOnce();

        markdownFiles.splice(0, 1);
        expect(removeMarkdownWordCountConsumersInFolder(app, 'Archive', settings)).toEqual({
            becameActive: false,
            dependenciesChanged: true
        });
        expect(getMarkdownFiles).toHaveBeenCalledOnce();
    });

    it('does not enable word counting when a consuming header is outside every custom list context', () => {
        const { app, cachedMetadataByPath, markdownFiles } = createApp();
        const headerFile = createFile('Tech Insights/Header.md');
        markdownFiles.push(headerFile);
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Work', show_word_count: true }
            }
        });
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'date',
            defaultFolderSort: 'modified-desc',
            folderAppearances: { Projects: { groupBy: 'custom' } },
            folderSortOverrides: { Projects: 'title-asc' },
            manualSortGroupHeaderProperty: 'group_header'
        });

        expect(getMarkdownTextCountDependencies(app, settings)).toEqual([]);
        expect(hasMarkdownWordCountConsumer(settings, app)).toBe(false);
    });

    it('counts ancestor folder contexts only when descendant notes are included', () => {
        const { app, cachedMetadataByPath, markdownFiles } = createApp();
        const headerFile = createFile('Projects/Current/Header.md');
        markdownFiles.push(headerFile);
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Current', show_word_count: true }
            }
        });
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'date',
            defaultFolderSort: 'modified-desc',
            folderAppearances: { Projects: { groupBy: 'custom' } },
            folderSortOverrides: { Projects: 'title-asc' },
            manualSortGroupHeaderProperty: 'group_header',
            includeDescendantNotes: false
        });

        expect(hasMarkdownWordCountConsumer(settings, app)).toBe(false);

        const descendantSettings = { ...settings, includeDescendantNotes: true };
        expect(hasMarkdownWordCountConsumer(descendantSettings, app)).toBe(true);
    });

    it('recognizes a consuming header in the tagged root list', () => {
        const { app, cachedMetadataByPath, markdownFiles } = createApp();
        const headerFile = createFile('Notes/Header.md');
        markdownFiles.push(headerFile);
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Tagged', show_word_count: true },
                tags: ['work/project']
            }
        });
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'date',
            defaultFolderSort: 'modified-desc',
            tagAppearances: { [TAGGED_TAG_ID]: { groupBy: 'custom' } },
            tagSortOverrides: { [TAGGED_TAG_ID]: 'title-asc' },
            manualSortGroupHeaderProperty: 'group_header',
            includeDescendantNotes: true,
            showTags: true
        });

        expect(hasMarkdownWordCountConsumer(settings, app)).toBe(true);
    });

    it('matches tag-specific custom lists case-insensitively', () => {
        const { app, cachedMetadataByPath, markdownFiles } = createApp();
        const headerFile = createFile('Notes/Header.md');
        markdownFiles.push(headerFile);
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Project', show_word_count: true },
                tags: ['Work/Project']
            }
        });
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'date',
            defaultFolderSort: 'modified-desc',
            tagAppearances: { 'work/project': { groupBy: 'custom' } },
            tagSortOverrides: { 'work/project': 'title-asc' },
            manualSortGroupHeaderProperty: 'group_header',
            includeDescendantNotes: false,
            showTags: true
        });

        expect(hasMarkdownWordCountConsumer(settings, app)).toBe(true);
    });

    it('keeps word counting active for a selected tag when the Tags section is hidden', () => {
        const { app, cachedMetadataByPath, markdownFiles } = createApp();
        const headerFile = createFile('Notes/Header.md');
        markdownFiles.push(headerFile);
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Work', show_word_count: true },
                tags: ['work']
            }
        });
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'date',
            defaultFolderSort: 'modified-desc',
            tagAppearances: { work: { groupBy: 'custom' } },
            tagSortOverrides: { work: 'title-asc' },
            manualSortGroupHeaderProperty: 'group_header',
            showTags: false
        });

        expect(hasMarkdownWordCountConsumer(settings, app)).toBe(true);
    });

    it('recognizes a consuming header in the properties root list', () => {
        const { app, cachedMetadataByPath, markdownFiles } = createApp();
        const headerFile = createFile('Notes/Header.md');
        markdownFiles.push(headerFile);
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Properties', show_word_count: true },
                status: 'draft'
            }
        });
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'date',
            defaultFolderSort: 'modified-desc',
            propertyAppearances: { [PROPERTIES_ROOT_VIRTUAL_FOLDER_ID]: { groupBy: 'custom' } },
            propertySortOverrides: { [PROPERTIES_ROOT_VIRTUAL_FOLDER_ID]: 'title-asc' },
            manualSortGroupHeaderProperty: 'group_header',
            includeDescendantNotes: true,
            showProperties: true,
            propertyFields: 'status'
        });

        expect(hasMarkdownWordCountConsumer(settings, app)).toBe(true);
    });

    it('does not treat empty strings as indexed property-list membership', () => {
        const { app, cachedMetadataByPath, markdownFiles } = createApp();
        const headerFile = createFile('Notes/Header.md');
        markdownFiles.push(headerFile);
        cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Empty status', show_word_count: true },
                status: '   '
            }
        });
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'date',
            defaultFolderSort: 'modified-desc',
            propertyAppearances: { [buildPropertyKeyNodeId('status')]: { groupBy: 'custom' } },
            propertySortOverrides: { [buildPropertyKeyNodeId('status')]: 'title-asc' },
            manualSortGroupHeaderProperty: 'group_header',
            includeDescendantNotes: false,
            showProperties: true,
            propertyFields: 'status'
        });

        expect(hasMarkdownWordCountConsumer(settings, app)).toBe(false);
    });
});

function createFrontmatterPosition(bodyStartIndex: number): CachedMetadata['frontmatterPosition'] {
    return {
        start: { line: 0, col: 0, offset: 0 },
        end: { line: 0, col: 0, offset: bodyStartIndex }
    };
}

function extractFrontmatterBodyStartIndex(content: string): number | null {
    const firstLineEnd = content.indexOf('\n');
    const firstLine = firstLineEnd === -1 ? content : content.slice(0, firstLineEnd);
    const normalizedFirstLine = firstLine.charCodeAt(0) === 0xfeff ? firstLine.slice(1) : firstLine;

    if (normalizedFirstLine.trim() !== '---' || firstLineEnd === -1) {
        return null;
    }

    const yamlStart = firstLineEnd + 1;
    let lineStart = yamlStart;
    while (lineStart <= content.length) {
        const nextLineEnd = content.indexOf('\n', lineStart);
        const lineEnd = nextLineEnd === -1 ? content.length : nextLineEnd;
        const line = content.slice(lineStart, lineEnd);
        const trimmed = line.trim();

        if (trimmed === '---' || trimmed === '...') {
            return nextLineEnd === -1 ? content.length : lineEnd + 1;
        }

        if (nextLineEnd === -1) {
            break;
        }

        lineStart = lineEnd + 1;
    }

    return null;
}

function setMarkdownContent(context: ReturnType<typeof createApp>, file: TFile, content: string): void {
    context.app.vault.cachedRead = async (target: TFile) => {
        return target.path === file.path ? content : '';
    };

    const metadata: CachedMetadata = {};
    const bodyStartIndex = extractFrontmatterBodyStartIndex(content);
    if (typeof bodyStartIndex === 'number' && bodyStartIndex > 0) {
        metadata.frontmatterPosition = createFrontmatterPosition(bodyStartIndex);
    }

    context.cachedMetadataByPath.set(file.path, metadata);
}

function createFileData(overrides: Partial<FileData>): FileData {
    return {
        mtime: 0,
        markdownPipelineMtime: 0,
        tagsMtime: 0,
        metadataMtime: 0,
        fileThumbnailsMtime: 0,
        tags: null,
        wordCount: null,
        characterCountWithSpaces: null,
        characterCountWithoutSpaces: null,
        taskTotal: 0,
        taskUnfinished: 0,
        properties: [],
        previewStatus: 'unprocessed',
        featureImage: null,
        featureImageStatus: 'unprocessed',
        featureImageKey: null,
        metadata: null,
        ...overrides
    };
}

describe('MarkdownPipelineContentProvider word count', () => {
    it('counts basic words', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, 'Hello world');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(2);
    });

    it('clears stale preview and word count when file is too large to read', async () => {
        const context = createApp();
        const settings = createSettings({
            showFilePreview: true,
            showFeatureImage: false,
            propertyFields: ''
        });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 200;
        file.stat.size = LIMITS.markdown.maxReadBytes.desktop + 1;

        setMarkdownContent(context, file, '');

        const fileData = createFileData({
            mtime: file.stat.mtime,
            markdownPipelineMtime: 100,
            wordCount: 123,
            previewStatus: 'has',
            featureImageStatus: 'none',
            featureImageKey: ''
        });

        const result = await provider.runProcessFile(file, fileData, settings);

        expect(result.processed).toBe(true);
        expect(result.update).toEqual({
            path: file.path,
            wordCount: 0,
            characterCountWithSpaces: 0,
            characterCountWithoutSpaces: 0,
            preview: ''
        });
    });

    it('falls back to safe defaults after repeated read failures', async () => {
        const context = createApp();
        const settings = createSettings({
            showFilePreview: true,
            showFeatureImage: false,
            propertyFields: ''
        });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        file.stat.mtime = 200;
        file.stat.size = 1;

        context.cachedMetadataByPath.set(file.path, {});
        context.app.vault.cachedRead = async () => {
            throw new Error('read failed');
        };

        const fileData = createFileData({
            mtime: file.stat.mtime,
            markdownPipelineMtime: 100,
            wordCount: 123,
            characterCountWithSpaces: 456,
            characterCountWithoutSpaces: 400,
            previewStatus: 'has',
            featureImageStatus: 'none',
            featureImageKey: ''
        });

        for (let attempt = 0; attempt < LIMITS.contentProvider.retry.maxAttempts - 1; attempt += 1) {
            const result = await provider.runProcessFile(file, fileData, settings);
            expect(result.processed).toBe(false);
            expect(result.update).toBeNull();
        }

        const result = await provider.runProcessFile(file, fileData, settings);
        expect(result.processed).toBe(true);
        expect(result.update).toEqual({
            path: file.path,
            wordCount: 0,
            characterCountWithSpaces: 0,
            characterCountWithoutSpaces: 0,
            preview: ''
        });
    });

    it('counts hyphens and apostrophes as part of a word', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, "don't mother-in-law");
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(2);
    });

    it('groups numbers with separators and adjacent letters', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, 'GPT-5.2 is 1,000x');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(3);
    });

    it('counts CJK characters individually inside mixed runs', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, 'HunyuanOCR开源模型');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(5);
    });

    it('counts punctuation between CJK characters as a word token', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, '汉-汉');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(3);
    });

    it('counts Hangul as word-forming content', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, '한글 테스트');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(2);
    });

    it('does not count left single quote as part of a word', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, 'don\u2018t');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(2);
    });

    it('counts BMP words next to Math Alphanumeric Symbols', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, 'A\u{1D400}');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(1);
    });

    it('skips frontmatter by using the body start index', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, '---\nwords: should not count\n---\nHello world');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(2);
    });

    it('skips character counts when character counts are hidden', async () => {
        const context = createApp();
        const settings = createSettings({ textCountDisplay: 'none' });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, '---\ntitle: Draft\n---\n\nBody');
        const result = await provider.runProcessFile(file, null, settings);

        expect(result.update?.characterCountWithSpaces).toBeUndefined();
        expect(result.update?.characterCountWithoutSpaces).toBeUndefined();
    });

    it('counts words when a list appearance enables counts while the global setting is off', async () => {
        const context = createApp();
        const settings = createSettings({
            textCountDisplay: 'none',
            folderAppearances: { Writing: { textCount: 'words' } }
        });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('Writing/Draft.md');

        setMarkdownContent(context, file, 'Three draft words');
        const result = await provider.runProcessFile(file, null, settings);

        expect(result.update?.wordCount).toBe(3);
        expect(result.update?.characterCountWithSpaces).toBeUndefined();
        expect(result.update?.characterCountWithoutSpaces).toBeUndefined();
    });

    it('counts characters when a list appearance selects them while the global setting is off', async () => {
        const context = createApp();
        const settings = createSettings({
            textCountDisplay: 'none',
            folderAppearances: { Writing: { textCount: 'characters' } }
        });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('Writing/Draft.md');

        setMarkdownContent(context, file, 'Three draft words');
        const result = await provider.runProcessFile(file, null, settings);

        expect(result.update?.wordCount).toBeUndefined();
        expect(result.update?.characterCountWithSpaces).toBe(17);
        expect(result.update?.characterCountWithoutSpaces).toBe(15);
    });

    it('does not count words for a custom sort order without a consuming group header', async () => {
        const context = createApp();
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'custom',
            defaultFolderSort: 'title-asc'
        });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, 'Hello group header');
        const result = await provider.runProcessFile(file, null, settings);

        expect(result.update?.wordCount).toBeUndefined();
    });

    it('counts words when an actual group header requests them', async () => {
        const context = createApp();
        const settings = createSettings({
            textCountDisplay: 'none',
            noteGrouping: 'custom',
            defaultFolderSort: 'title-asc'
        });
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');
        const headerFile = createFile('notes/header.md');

        setMarkdownContent(context, file, 'Hello group header');
        context.markdownFiles.push(headerFile);
        context.cachedMetadataByPath.set(headerFile.path, {
            frontmatter: {
                group_header: { title: 'Header', show_word_count: true }
            }
        });
        const result = await provider.runProcessFile(file, null, settings);

        expect(result.update?.wordCount).toBe(3);
    });

    it('counts isolated punctuation when Math Alphanumeric Symbols are present', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, '\u{1D400}-\u{1D401}');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(1);
    });

    it('does not count Math Alphanumeric Symbols without isolated punctuation', async () => {
        const context = createApp();
        const settings = createSettings();
        const provider = new TestMarkdownPipelineContentProvider(context.app);
        const file = createFile('notes/note.md');

        setMarkdownContent(context, file, '\u{1D400}\u{1D401}');
        const result = await provider.runWordCount(file, settings);

        expect(result).toBe(0);
    });
});
