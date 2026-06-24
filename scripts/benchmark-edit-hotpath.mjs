#!/usr/bin/env node

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

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import esbuild from 'esbuild';

const sampleCountArg = Number(process.argv.find(arg => arg.startsWith('--samples='))?.split('=')[1]);
const sampleCount = Number.isFinite(sampleCountArg) && sampleCountArg > 0 ? Math.trunc(sampleCountArg) : 50;

function createRunnerSource(samples) {
    const markdownPipelinePath = path.resolve(process.cwd(), 'src/services/content/MarkdownPipelineContentProvider.ts');
    const defaultSettingsPath = path.resolve(process.cwd(), 'src/settings/defaultSettings.ts');
    const sortUtilsPath = path.resolve(process.cwd(), 'src/utils/sortUtils.ts');
    const listItemsPath = path.resolve(process.cwd(), 'src/hooks/listPaneData/listItems.ts');
    const fileTypeUtilsPath = path.resolve(process.cwd(), 'src/utils/fileTypeUtils.ts');
    const typesPath = path.resolve(process.cwd(), 'src/types.ts');
    const listRefreshPath = path.resolve(process.cwd(), 'src/hooks/listPaneData/useListPaneRefresh.ts');
    const markdownTaskCountsPath = path.resolve(process.cwd(), 'src/utils/markdownTaskCounts.ts');

    return `
import { performance } from 'node:perf_hooks';
import { App, TFile } from 'obsidian';
import { MarkdownPipelineContentProvider } from ${JSON.stringify(markdownPipelinePath)};
import { DEFAULT_SETTINGS } from ${JSON.stringify(defaultSettingsPath)};
import { sortFiles } from ${JSON.stringify(sortUtilsPath)};
import { buildFileIndexMap, buildFilePathToIndexMap, buildListItems, buildOrderedFiles } from ${JSON.stringify(listItemsPath)};
import { FILE_VISIBILITY } from ${JSON.stringify(fileTypeUtilsPath)};
import { ItemType } from ${JSON.stringify(typesPath)};
import { getModifiedSortBoundaryRefreshKey, shouldSkipModifiedSortBoundaryRefresh } from ${JSON.stringify(listRefreshPath)};
import { areMarkdownTaskCountsEqual, countMarkdownTasksFromMetadata } from ${JSON.stringify(markdownTaskCountsPath)};

const sampleCount = ${JSON.stringify(samples)};

class BenchmarkMarkdownPipelineContentProvider extends MarkdownPipelineContentProvider {
    shouldProcess(fileData, file, settings) {
        return this.needsProcessing(fileData, file, settings);
    }

    async runProcessFile(file, fileData, settings) {
        return await this.processFile({ file, path: file.path }, fileData, settings);
    }
}

function percentile(sortedValues, percentileValue) {
    if (sortedValues.length === 0) {
        return 0;
    }
    const index = Math.min(sortedValues.length - 1, Math.max(0, Math.ceil((percentileValue / 100) * sortedValues.length) - 1));
    return sortedValues[index];
}

function summarize(samples) {
    const sorted = [...samples].sort((left, right) => left - right);
    const sum = sorted.reduce((total, value) => total + value, 0);
    return {
        min: sorted[0] ?? 0,
        median: percentile(sorted, 50),
        p95: percentile(sorted, 95),
        max: sorted[sorted.length - 1] ?? 0,
        mean: sorted.length ? sum / sorted.length : 0
    };
}

function formatMs(value) {
    return Math.round(value * 1000) / 1000;
}

function formatSummary(summary) {
    return 'median=' + formatMs(summary.median) + 'ms p95=' + formatMs(summary.p95) + 'ms mean=' + formatMs(summary.mean) + 'ms min=' + formatMs(summary.min) + 'ms max=' + formatMs(summary.max) + 'ms';
}

function createMarkdownContent(targetLength) {
    const paragraph = 'The quick brown fox writes a notebook paragraph with enough plain text to exercise markdown processing. ';
    let content = '# Hot path benchmark\\n\\n';
    while (content.length < targetLength) {
        content += paragraph;
    }
    return content.slice(0, targetLength);
}

function createFile(path, index = 0) {
    const file = new TFile(path);
    file.stat.ctime = 1_700_000_000_000 + index;
    file.stat.mtime = 1_700_010_000_000 + index;
    file.stat.size = 10000;
    return file;
}

function createFileData(file, overrides = {}) {
    return {
        mtime: file.stat.mtime,
        markdownPipelineMtime: file.stat.mtime - 1,
        tagsMtime: file.stat.mtime,
        metadataMtime: file.stat.mtime,
        fileThumbnailsMtime: file.stat.mtime,
        tags: [],
        wordCount: 1500,
        characterCountWithSpaces: 10000,
        characterCountWithoutSpaces: 8500,
        taskTotal: 0,
        taskUnfinished: 0,
        properties: [],
        previewStatus: 'none',
        featureImage: null,
        featureImageStatus: 'none',
        featureImageKey: '',
        metadata: null,
        ...overrides
    };
}

function createSettings(overrides = {}) {
    const settings = structuredClone(DEFAULT_SETTINGS);
    settings.showFilePreview = false;
    settings.showFeatureImage = false;
    settings.useFrontmatterMetadata = false;
    settings.showTags = false;
    settings.showProperties = false;
    settings.showFileTags = true;
    settings.showTooltips = false;
    settings.showTooltipWordCount = false;
    settings.textCountDisplay = 'none';
    settings.showFileIconUnfinishedTask = false;
    settings.showFileBackgroundUnfinishedTask = false;
    settings.calendarEnabled = true;
    settings.calendarShowFeatureImage = false;
    settings.defaultFolderSort = 'modified-desc';
    settings.noteGrouping = 'date';
    settings.propertySortSecondary = 'title';
    Object.assign(settings, overrides);
    return settings;
}

async function measureMarkdownPipelineScenario(name, settings) {
    const app = new App();
    const provider = new BenchmarkMarkdownPipelineContentProvider(app);
    const file = createFile('notes/current.md');
    const content = createMarkdownContent(10000);
    const metadata = {
        headings: [{ heading: 'Hot path benchmark', level: 1, position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 20, offset: 20 } } }],
        listItems: []
    };
    let readCount = 0;
    app.vault.registerFile(file);
    app.vault.cachedRead = async target => {
        if (target.path === file.path) {
            readCount += 1;
            return content;
        }
        return '';
    };
    app.metadataCache.getFileCache = target => (target.path === file.path ? metadata : null);

    const fileData = createFileData(file);
    const samples = [];
    const warmups = Math.min(10, sampleCount);
    for (let index = 0; index < sampleCount + warmups; index += 1) {
        const started = performance.now();
        if (provider.shouldProcess(fileData, file, settings)) {
            await provider.runProcessFile(file, fileData, settings);
        }
        const elapsed = performance.now() - started;
        if (index >= warmups) {
            samples.push(elapsed);
        }
    }

    return { name, summary: summarize(samples), readCount };
}

function createListBenchmarkFiles(count) {
    const files = [];
    for (let index = 0; index < count; index += 1) {
        const file = createFile('notes/note-' + String(index).padStart(4, '0') + '.md', index);
        files.push(file);
    }
    return files;
}

function measureListRebuildScenario() {
    const app = new App();
    const files = createListBenchmarkFiles(2000);
    const hiddenFileState = new Map(files.map(file => [file.path, false]));
    const db = {
        getFile: () => null
    };
    const samples = [];
    const warmups = Math.min(10, sampleCount);
    for (let index = 0; index < sampleCount + warmups; index += 1) {
        const currentFiles = [...files];
        currentFiles[0].stat.mtime += 1;
        const started = performance.now();
        sortFiles(
            currentFiles,
            'modified-desc',
            file => file.stat.ctime,
            file => file.stat.mtime,
            file => file.basename,
            undefined,
            'title'
        );
        const items = buildListItems({
            app,
            dayKey: '2026-06-23',
            fileVisibility: FILE_VISIBILITY.SHOW,
            files: currentFiles,
            getDB: () => db,
            getFileTimestamps: file => ({ created: file.stat.ctime, modified: file.stat.mtime }),
            hiddenFileState,
            hiddenTags: [],
            listConfig: {
                filterPinnedByFolder: false,
                folderGroupSortOrder: 'asc',
                groupBy: 'date',
                pinnedGroupExpanded: true,
                pinnedNotes: {},
                showCurrentFolderFilesAtBottom: false,
                showFolderGroupPaths: false,
                showFileTags: false,
                showTags: false
            },
            searchMetaMap: new Map(),
            selectedFolder: null,
            selectionType: ItemType.FOLDER,
            showHiddenItems: false,
            sortOption: 'modified-desc',
            propertySortKey: '',
            isManualSortActive: false,
            manualSortGroupHeaderPropertyKey: null,
            wordCountTargetProperty: ''
        });
        buildFilePathToIndexMap(items);
        buildFileIndexMap(currentFiles);
        buildOrderedFiles(items);
        const elapsed = performance.now() - started;
        if (index >= warmups) {
            samples.push(elapsed);
        }
    }
    return { name: 'list rebuild, 2000 files, modified-desc', summary: summarize(samples), readCount: 0 };
}

function measureModifiedSortRefreshDecisions() {
    const files = createListBenchmarkFiles(2000);
    const currentFile = files[files.length - 1];
    currentFile.stat.mtime = Math.max(...files.map(file => file.stat.mtime)) + 1;
    sortFiles(
        files,
        'modified-desc',
        file => file.stat.ctime,
        file => file.stat.mtime,
        file => file.basename,
        undefined,
        'title'
    );

    const seenKeys = new Map();
    const hasDateSearchFilters = false;
    const showFileDate = false;
    const showTooltips = false;
    const initialKey = getModifiedSortBoundaryRefreshKey({
        dayKey: '2026-06-23',
        file: currentFile,
        files,
        groupBy: 'date',
        sortOption: 'modified-desc'
    });
    if (initialKey !== null) {
        seenKeys.set(currentFile.path, initialKey);
    }
    let refreshes = 0;
    let skipped = 0;
    const samples = [];
    const warmups = 0;
    for (let index = 0; index < sampleCount + warmups; index += 1) {
        currentFile.stat.mtime += 1;
        const started = performance.now();
        const key = getModifiedSortBoundaryRefreshKey({
            dayKey: '2026-06-23',
            file: currentFile,
            files,
            groupBy: 'date',
            sortOption: 'modified-desc'
        });
        if (
            shouldSkipModifiedSortBoundaryRefresh({
                previousBoundaryRefreshKey: seenKeys.get(currentFile.path),
                boundaryRefreshKey: key,
                hasDateSearchFilters,
                showFileDate,
                showTooltips
            })
        ) {
            skipped += 1;
        } else {
            refreshes += 1;
            if (key !== null) {
                seenKeys.set(currentFile.path, key);
            }
        }
        const elapsed = performance.now() - started;
        if (index >= warmups) {
            samples.push(elapsed);
        }
    }

    return {
        name: 'modified-desc autosave refresh decisions, hidden dates/tooltips, no date filters, 2000 files',
        summary: summarize(samples),
        readCount: 0,
        refreshes,
        skipped
    };
}

function measureTagPropertyMetadataRefreshDecisions() {
    const files = createListBenchmarkFiles(2000);
    const currentFile = files[files.length - 1];
    currentFile.stat.mtime = Math.max(...files.map(file => file.stat.mtime)) + 1;
    const basePathSet = new Set(files.map(file => file.path));
    const shouldRefreshOnMetadataChange = false;
    let refreshes = 0;
    let skipped = 0;
    const samples = [];
    const warmups = 0;

    for (let index = 0; index < sampleCount + warmups; index += 1) {
        const started = performance.now();
        if (currentFile.extension === 'md' && shouldRefreshOnMetadataChange && basePathSet.has(currentFile.path)) {
            refreshes += 1;
        } else {
            skipped += 1;
        }
        const elapsed = performance.now() - started;
        if (index >= warmups) {
            samples.push(elapsed);
        }
    }

    return {
        name: 'tag/property metadata-change refresh decisions, modified-desc',
        summary: summarize(samples),
        readCount: 0,
        refreshes,
        skipped
    };
}

function measureCalendarFrontmatterTitleRefreshDecisions() {
    const file = createFile('calendar/2026-06-23.md');
    const visibleFrontmatterNotePaths = new Set([file.path]);
    const frontmatterTitlesByPath = new Map([[file.path, 'Daily note']]);
    const frontmatterNameField = 'title';
    const nextTitle = 'Daily note';
    let refreshes = 0;
    let skipped = 0;
    const samples = [];
    const warmups = 0;

    for (let index = 0; index < sampleCount + warmups; index += 1) {
        const started = performance.now();
        if (
            frontmatterNameField.length > 0 &&
            visibleFrontmatterNotePaths.has(file.path) &&
            (frontmatterTitlesByPath.get(file.path) ?? '') !== nextTitle
        ) {
            refreshes += 1;
        } else {
            skipped += 1;
        }
        const elapsed = performance.now() - started;
        if (index >= warmups) {
            samples.push(elapsed);
        }
    }

    return {
        name: 'calendar frontmatter-title refresh decisions, unchanged title',
        summary: summarize(samples),
        readCount: 0,
        refreshes,
        skipped
    };
}

function createTaskMetadata(taskMarkers) {
    return {
        listItems: taskMarkers.map((task, index) => ({
            parent: -index,
            position: {
                start: { line: index, col: 0, offset: index },
                end: { line: index, col: 10, offset: index + 10 }
            },
            task
        }))
    };
}

function measureTaskOnlyQueueDecisions(name, record, metadata) {
    const samples = [];
    const warmups = 0;
    let queued = 0;
    let skipped = 0;

    for (let index = 0; index < sampleCount + warmups; index += 1) {
        const started = performance.now();
        const taskCountsFromMetadata = countMarkdownTasksFromMetadata(metadata);
        const shouldQueue = taskCountsFromMetadata === null || !areMarkdownTaskCountsEqual(record, taskCountsFromMetadata);
        if (shouldQueue) {
            queued += 1;
        } else {
            skipped += 1;
        }
        const elapsed = performance.now() - started;
        if (index >= warmups) {
            samples.push(elapsed);
        }
    }

    return {
        name,
        summary: summarize(samples),
        readCount: 0,
        queued,
        skipped
    };
}

const results = [];
results.push(await measureMarkdownPipelineScenario('issue settings, calendar tasks only', createSettings()));
results.push(await measureMarkdownPipelineScenario('task cache only, no visible consumers', createSettings({ calendarEnabled: false })));
results.push(await measureMarkdownPipelineScenario('visible word + character counts', createSettings({ textCountDisplay: 'both' })));
results.push(measureTaskOnlyQueueDecisions('task-only stale no-task metadata queue decisions', { taskTotal: 0, taskUnfinished: 0 }, { listItems: [] }));
results.push(
    measureTaskOnlyQueueDecisions(
        'task-only stale task-bearing metadata queue decisions',
        { taskTotal: 2, taskUnfinished: 1 },
        createTaskMetadata([' ', 'x'])
    )
);
results.push(measureListRebuildScenario());
results.push(measureModifiedSortRefreshDecisions());
results.push(measureTagPropertyMetadataRefreshDecisions());
results.push(measureCalendarFrontmatterTitleRefreshDecisions());

console.log('Edit hot-path benchmark');
console.log('Samples: ' + sampleCount + ', markdown size: 10000 chars');
for (const result of results) {
    const decisionText =
        result.refreshes === undefined ? '' : ', refreshes=' + result.refreshes + ', skipped=' + result.skipped;
    const queueText = result.queued === undefined ? '' : ', queued=' + result.queued + ', skipped=' + result.skipped;
    console.log('- ' + result.name + ': ' + formatSummary(result.summary) + ', reads=' + result.readCount + decisionText + queueText);
}
`;
}

const tempDir = mkdtempSync(path.join(tmpdir(), 'nn-edit-hotpath-benchmark-'));

try {
    const runnerEntryPath = path.join(tempDir, 'runner-entry.mjs');
    const bundlePath = path.join(tempDir, 'runner.mjs');
    const obsidianShimPath = path.join(tempDir, 'obsidian-shim.ts');
    writeFileSync(runnerEntryPath, createRunnerSource(sampleCount));
    writeFileSync(
        obsidianShimPath,
        `export * from ${JSON.stringify(path.resolve(process.cwd(), 'tests/stubs/obsidian.ts'))};
export const debounce = (callback) => {
    const debounced = (...args) => callback(...args);
    debounced.cancel = () => {};
    return debounced;
};
export const loadPdfJs = async () => ({
    getDocument: () => ({ promise: Promise.reject(new Error('PDF rendering is unavailable in the edit hot-path benchmark.')) })
});
`
    );

    await esbuild.build({
        absWorkingDir: process.cwd(),
        bundle: true,
        entryPoints: [runnerEntryPath],
        format: 'esm',
        logLevel: 'silent',
        outfile: bundlePath,
        platform: 'node',
        plugins: [
            {
                name: 'obsidian-test-stub',
                setup(build) {
                    build.onResolve({ filter: /^obsidian$/ }, () => ({
                        path: obsidianShimPath
                    }));
                }
            }
        ],
        target: 'es2022'
    });

    const output = execFileSync(process.execPath, [bundlePath], {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'inherit']
    });
    process.stdout.write(output);
} finally {
    rmSync(tempDir, { force: true, recursive: true });
}
