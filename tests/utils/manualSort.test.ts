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
import type { App, TFile } from 'obsidian';
import {
    applyManualSortMarkdownOrder,
    areManualSortAssignmentsCached,
    buildManualSortInsertionRankPlan,
    buildManualSortOrderAssignments,
    buildManualSortRankPlan,
    formatManualSortGroupHeaderLabel,
    getCachedManualSortGroupHeader,
    getCachedManualSortGroupHeaderValue,
    getCachedManualSortRank,
    getManualSortGroupHeaderPropertyKey,
    isManualSortValueEqual,
    isValidManualSortPropertyKey,
    MANUAL_SORT_RANK_STEP,
    moveManualSortMarkdownFiles,
    moveManualSortSelectionByDirection,
    orderManualSortFiles,
    partitionManualSortFiles,
    parseManualSortGroupHeaderTargetWordCount,
    parseManualSortRank,
    removeManualSortProperty,
    shouldShowManualSortGroupHeaderProgress,
    writeManualSortGroupHeader,
    writeManualSortAssignments,
    writeManualSortOrder
} from '../../src/utils/manualSort';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { createTestTFile } from './createTestTFile';

function createFile(path: string, frontmatter: Record<string, unknown>): TFile & { frontmatter: Record<string, unknown> } {
    return Object.assign(createTestTFile(path), { frontmatter });
}

function createApp(files: readonly (TFile & { frontmatter: Record<string, unknown> })[], processFrontMatter: ReturnType<typeof vi.fn>) {
    const frontmatterByPath = new Map(files.map(file => [file.path, file.frontmatter]));
    return {
        metadataCache: {
            getFileCache: (file: TFile) => ({ frontmatter: frontmatterByPath.get(file.path) })
        },
        fileManager: { processFrontMatter }
    } as unknown as App;
}

describe('manual sort helpers', () => {
    it('builds numeric assignments for markdown files only', () => {
        const files = [
            { path: 'notes/one.md', extension: 'md' },
            { path: 'assets/file.pdf', extension: 'pdf' },
            { path: 'notes/two.md', extension: 'md' }
        ];

        expect(buildManualSortOrderAssignments(files)).toEqual([
            { path: 'notes/one.md', value: MANUAL_SORT_RANK_STEP },
            { path: 'notes/two.md', value: MANUAL_SORT_RANK_STEP * 2 }
        ]);
    });

    it('partitions manual sort files with markdown files first', () => {
        const files = [
            { path: 'notes/one.md', extension: 'md' },
            { path: 'assets/file.pdf', extension: 'pdf' },
            { path: 'notes/two.md', extension: 'md' }
        ];

        expect(partitionManualSortFiles(files)).toEqual({
            markdown: [files[0], files[2]],
            nonMarkdown: [files[1]]
        });
        expect(orderManualSortFiles(files)).toEqual([files[0], files[2], files[1]]);
        expect(applyManualSortMarkdownOrder(files, ['notes/two.md', 'notes/one.md'])).toEqual([files[2], files[0], files[1]]);
    });

    it('moves a selected markdown block while preserving relative order', () => {
        const files = [
            { path: 'notes/one.md', extension: 'md' },
            { path: 'notes/two.md', extension: 'md' },
            { path: 'notes/three.md', extension: 'md' },
            { path: 'assets/file.pdf', extension: 'pdf' },
            { path: 'notes/four.md', extension: 'md' }
        ];

        const result = moveManualSortMarkdownFiles(
            files,
            'notes/two.md',
            'notes/four.md',
            new Set(['notes/two.md', 'notes/three.md', 'assets/file.pdf'])
        );

        expect(result?.map(file => file.path)).toEqual([
            'notes/one.md',
            'notes/four.md',
            'notes/two.md',
            'notes/three.md',
            'assets/file.pdf'
        ]);
    });

    it('moves a selected markdown block upward', () => {
        const files = [
            { path: 'notes/one.md', extension: 'md' },
            { path: 'notes/two.md', extension: 'md' },
            { path: 'notes/three.md', extension: 'md' },
            { path: 'notes/four.md', extension: 'md' },
            { path: 'notes/five.md', extension: 'md' }
        ];

        const result = moveManualSortMarkdownFiles(files, 'notes/three.md', 'notes/one.md', new Set(['notes/three.md', 'notes/four.md']));

        expect(result?.map(file => file.path)).toEqual([
            'notes/three.md',
            'notes/four.md',
            'notes/one.md',
            'notes/two.md',
            'notes/five.md'
        ]);
    });

    it('moves non-contiguous selected markdown files as a block in markdown order', () => {
        const files = [
            { path: 'notes/one.md', extension: 'md' },
            { path: 'notes/two.md', extension: 'md' },
            { path: 'notes/three.md', extension: 'md' },
            { path: 'notes/four.md', extension: 'md' },
            { path: 'notes/five.md', extension: 'md' }
        ];

        const result = moveManualSortMarkdownFiles(files, 'notes/two.md', 'notes/five.md', new Set(['notes/two.md', 'notes/four.md']));

        expect(result?.map(file => file.path)).toEqual([
            'notes/one.md',
            'notes/three.md',
            'notes/five.md',
            'notes/two.md',
            'notes/four.md'
        ]);
    });

    it('uses the existing single-file behavior when the dragged markdown file is not selected', () => {
        const files = [
            { path: 'notes/one.md', extension: 'md' },
            { path: 'notes/two.md', extension: 'md' },
            { path: 'notes/three.md', extension: 'md' }
        ];

        const result = moveManualSortMarkdownFiles(files, 'notes/one.md', 'notes/three.md', new Set(['notes/two.md']));

        expect(result?.map(file => file.path)).toEqual(['notes/two.md', 'notes/three.md', 'notes/one.md']);
    });

    it('does not move a selected markdown block onto itself', () => {
        const files = [
            { path: 'notes/one.md', extension: 'md' },
            { path: 'notes/two.md', extension: 'md' },
            { path: 'notes/three.md', extension: 'md' }
        ];

        const result = moveManualSortMarkdownFiles(files, 'notes/one.md', 'notes/two.md', new Set(['notes/one.md', 'notes/two.md']));

        expect(result).toBeNull();
    });

    it('moves a selected markdown block down by one row for keyboard sorting', () => {
        const files = [
            { path: 'notes/one.md', extension: 'md' },
            { path: 'notes/two.md', extension: 'md' },
            { path: 'notes/three.md', extension: 'md' },
            { path: 'notes/four.md', extension: 'md' },
            { path: 'assets/file.pdf', extension: 'pdf' }
        ];

        const result = moveManualSortSelectionByDirection(files, 'notes/two.md', new Set(['notes/two.md', 'notes/three.md']), 'down');

        expect(result?.files.map(file => file.path)).toEqual([
            'notes/one.md',
            'notes/four.md',
            'notes/two.md',
            'notes/three.md',
            'assets/file.pdf'
        ]);
        expect(result?.scrollPath).toBe('notes/three.md');
    });

    it('moves non-contiguous selected markdown files as a keyboard block', () => {
        const files = [
            { path: 'notes/one.md', extension: 'md' },
            { path: 'notes/two.md', extension: 'md' },
            { path: 'notes/three.md', extension: 'md' },
            { path: 'notes/four.md', extension: 'md' },
            { path: 'notes/five.md', extension: 'md' }
        ];

        const result = moveManualSortSelectionByDirection(files, 'notes/four.md', new Set(['notes/two.md', 'notes/four.md']), 'up');

        expect(result?.files.map(file => file.path)).toEqual([
            'notes/two.md',
            'notes/four.md',
            'notes/one.md',
            'notes/three.md',
            'notes/five.md'
        ]);
        expect(result?.scrollPath).toBe('notes/two.md');
    });

    it('moves only the active markdown file when it is not selected', () => {
        const files = [
            { path: 'notes/one.md', extension: 'md' },
            { path: 'notes/two.md', extension: 'md' },
            { path: 'notes/three.md', extension: 'md' }
        ];

        const result = moveManualSortSelectionByDirection(files, 'notes/one.md', new Set(['notes/two.md']), 'down');

        expect(result?.files.map(file => file.path)).toEqual(['notes/two.md', 'notes/one.md', 'notes/three.md']);
    });

    it('does not keyboard-move markdown selections past list boundaries', () => {
        const files = [
            { path: 'notes/one.md', extension: 'md' },
            { path: 'notes/two.md', extension: 'md' },
            { path: 'notes/three.md', extension: 'md' }
        ];

        expect(moveManualSortSelectionByDirection(files, 'notes/one.md', new Set(['notes/one.md']), 'up')).toBeNull();
        expect(moveManualSortSelectionByDirection(files, 'notes/two.md', new Set(files.map(file => file.path)), 'down')).toBeNull();
    });

    it('validates property keys used for manual sort', () => {
        expect(isValidManualSortPropertyKey('index')).toBe(true);
        expect(isValidManualSortPropertyKey('  index  ')).toBe(true);
        expect(isValidManualSortPropertyKey('')).toBe(false);
        expect(isValidManualSortPropertyKey('a,b')).toBe(false);
    });

    it('resolves the manual sort group header property key when it is valid', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.manualSortPropertyKey = 'sort_index';
        settings.manualSortGroupHeaderProperty = ' group_header ';

        expect(getManualSortGroupHeaderPropertyKey(settings)).toBe('group_header');

        settings.manualSortGroupHeaderProperty = '';
        expect(getManualSortGroupHeaderPropertyKey(settings)).toBeNull();

        settings.manualSortGroupHeaderProperty = 'group,header';
        expect(getManualSortGroupHeaderPropertyKey(settings)).toBeNull();

        settings.manualSortGroupHeaderProperty = 'SORT_INDEX';
        expect(getManualSortGroupHeaderPropertyKey(settings)).toBeNull();
    });

    it('treats integer strings and numbers as the same manual rank value', () => {
        expect(isManualSortValueEqual(3, 3)).toBe(true);
        expect(isManualSortValueEqual(' 3 ', 3)).toBe(true);
        expect(parseManualSortRank('3.5')).toBe(null);
        expect(parseManualSortRank(0)).toBe(null);
        expect(isManualSortValueEqual('three', 3)).toBe(false);
    });

    it('parses manual sort group header target word counts', () => {
        expect(parseManualSortGroupHeaderTargetWordCount(10000)).toBe(10000);
        expect(parseManualSortGroupHeaderTargetWordCount('10,000')).toBe(10000);
        expect(parseManualSortGroupHeaderTargetWordCount(' 2500 ')).toBe(2500);
        expect(parseManualSortGroupHeaderTargetWordCount(0)).toBeNull();
        expect(parseManualSortGroupHeaderTargetWordCount('10.5')).toBeNull();
        expect(parseManualSortGroupHeaderTargetWordCount('ten')).toBeNull();
    });

    it('detects manual sort group header progress', () => {
        expect(
            shouldShowManualSortGroupHeaderProgress({
                title: 'Draft',
                showWordCount: false,
                targetWordCount: 10000,
                iconId: null,
                color: null
            })
        ).toBe(false);
        expect(
            shouldShowManualSortGroupHeaderProgress({
                title: 'Draft',
                showWordCount: true,
                targetWordCount: null,
                iconId: null,
                color: null
            })
        ).toBe(false);
        expect(
            shouldShowManualSortGroupHeaderProgress({
                title: 'Draft',
                showWordCount: true,
                targetWordCount: 10000,
                iconId: null,
                color: null
            })
        ).toBe(true);
    });

    it('reads cached manual sort ranks while ignoring nonnumeric property values', () => {
        const first = createFile('notes/first.md', { Index: '1000' });
        const second = createFile('notes/second.md', { index: 2000 });
        const third = createFile('notes/third.md', { index: 'custom' });
        const nonMarkdown = createFile('assets/file.pdf', {});
        const app = createApp([first, second, third, nonMarkdown], vi.fn());

        expect(getCachedManualSortRank(app, first, 'index')).toBe(1000);
        expect(getCachedManualSortRank(app, second, 'index')).toBe(2000);
        expect(getCachedManualSortRank(app, third, 'index')).toBe(null);
        expect(getCachedManualSortRank(app, nonMarkdown, 'index')).toBe(null);
    });

    it('reads cached manual sort group header values from string and object frontmatter', () => {
        const stringFile = createFile('notes/string.md', { Group: '  Overview  ' });
        const objectFile = createFile('notes/object.md', {
            group: {
                title: ' Chapter 1 ',
                show_word_count: true,
                target_word_count: '10,000'
            }
        });
        const numberFile = createFile('notes/number.md', { group: 3 });
        const booleanFile = createFile('notes/boolean.md', { group: false });
        const emptyStringFile = createFile('notes/empty.md', { group: '  ' });
        const arrayFile = createFile('notes/array.md', { group: ['Overview'] });
        const nonMarkdown = createFile('assets/file.pdf', { group: 'Overview' });
        const app = createApp([stringFile, objectFile, numberFile, booleanFile, emptyStringFile, arrayFile, nonMarkdown], vi.fn());

        expect(getCachedManualSortGroupHeaderValue(app, stringFile, 'group')).toBe('Overview');
        expect(getCachedManualSortGroupHeader(app, objectFile, 'group')).toEqual({
            title: 'Chapter 1',
            showWordCount: true,
            targetWordCount: 10000,
            iconId: null,
            color: null
        });
        expect(getCachedManualSortGroupHeaderValue(app, objectFile, 'group')).toBe('Chapter 1');
        expect(getCachedManualSortGroupHeaderValue(app, numberFile, 'group')).toBeNull();
        expect(getCachedManualSortGroupHeaderValue(app, booleanFile, 'group')).toBeNull();
        expect(getCachedManualSortGroupHeaderValue(app, emptyStringFile, 'group')).toBeNull();
        expect(getCachedManualSortGroupHeaderValue(app, arrayFile, 'group')).toBeNull();
        expect(getCachedManualSortGroupHeaderValue(app, nonMarkdown, 'group')).toBeNull();
    });

    it('formats manual sort group headers with word count progress', () => {
        expect(
            formatManualSortGroupHeaderLabel(
                { title: 'Draft', showWordCount: false, targetWordCount: null, iconId: null, color: null },
                1234
            )
        ).toBe('Draft');
        expect(
            formatManualSortGroupHeaderLabel(
                { title: 'Draft', showWordCount: true, targetWordCount: null, iconId: null, color: null },
                1234
            )
        ).toBe('Draft (1,234)');
        expect(
            formatManualSortGroupHeaderLabel(
                { title: 'Draft', showWordCount: false, targetWordCount: 10000, iconId: null, color: null },
                4123
            )
        ).toBe('Draft');
        expect(
            formatManualSortGroupHeaderLabel(
                { title: 'Draft', showWordCount: true, targetWordCount: 10000, iconId: null, color: null },
                4123
            )
        ).toBe('Draft (4,123 / 10,000)');
        expect(
            formatManualSortGroupHeaderLabel(
                { title: 'Draft', showWordCount: true, targetWordCount: null, iconId: null, color: null },
                4123,
                8000
            )
        ).toBe('Draft (4,123 / 8,000)');
        expect(
            formatManualSortGroupHeaderLabel(
                { title: 'Draft', showWordCount: true, targetWordCount: 10000, iconId: null, color: null },
                4123,
                8000
            )
        ).toBe('Draft (4,123 / 10,000)');
    });

    it('plans a sparse moved-file rank between ranked neighbors', () => {
        const first = { path: 'notes/first.md', extension: 'md' };
        const moved = { path: 'notes/moved.md', extension: 'md' };
        const third = { path: 'notes/third.md', extension: 'md' };

        const plan = buildManualSortRankPlan(
            [first, moved, third],
            new Set([moved.path]),
            new Map([
                [first.path, 1000],
                [third.path, 2000]
            ])
        );

        expect(plan.requiresCompaction).toBe(false);
        expect(plan.assignments).toEqual([{ path: moved.path, value: 1500 }]);
    });

    it('does not rewrite displaced neighbors when a ranked file moves into a gap', () => {
        const first = { path: 'notes/first.md', extension: 'md' };
        const moved = { path: 'notes/moved.md', extension: 'md' };
        const second = { path: 'notes/second.md', extension: 'md' };
        const third = { path: 'notes/third.md', extension: 'md' };

        const plan = buildManualSortRankPlan(
            [first, moved, second, third],
            new Set([moved.path]),
            new Map([
                [first.path, 1000],
                [second.path, 2000],
                [third.path, 3000],
                [moved.path, 4000]
            ])
        );

        expect(plan.requiresCompaction).toBe(false);
        expect(plan.assignments).toEqual([{ path: moved.path, value: 1500 }]);
    });

    it('ranks the needed prefix when the first move starts from an unranked list', () => {
        const first = { path: 'notes/first.md', extension: 'md' };
        const second = { path: 'notes/second.md', extension: 'md' };
        const third = { path: 'notes/third.md', extension: 'md' };
        const moved = { path: 'notes/moved.md', extension: 'md' };

        const plan = buildManualSortRankPlan([first, second, third, moved], new Set([moved.path]), new Map());

        expect(plan.requiresCompaction).toBe(false);
        expect(plan.assignments).toEqual([
            { path: first.path, value: 1000 },
            { path: second.path, value: 2000 },
            { path: third.path, value: 3000 },
            { path: moved.path, value: 4000 }
        ]);
    });

    it('writes only the moved file when an unranked note moves to the top', () => {
        const moved = { path: 'notes/moved.md', extension: 'md' };
        const first = { path: 'notes/first.md', extension: 'md' };
        const second = { path: 'notes/second.md', extension: 'md' };

        const plan = buildManualSortRankPlan([moved, first, second], new Set([moved.path]), new Map());

        expect(plan.requiresCompaction).toBe(false);
        expect(plan.assignments).toEqual([{ path: moved.path, value: 1000 }]);
    });

    it('uses all available integer slots for a moved block before compacting', () => {
        const first = { path: 'notes/first.md', extension: 'md' };
        const movedOne = { path: 'notes/moved-one.md', extension: 'md' };
        const movedTwo = { path: 'notes/moved-two.md', extension: 'md' };
        const last = { path: 'notes/last.md', extension: 'md' };

        const plan = buildManualSortRankPlan(
            [first, movedOne, movedTwo, last],
            new Set([movedOne.path, movedTwo.path]),
            new Map([
                [first.path, 1000],
                [last.path, 1003]
            ])
        );

        expect(plan.requiresCompaction).toBe(false);
        expect(plan.assignments).toEqual([
            { path: movedOne.path, value: 1001 },
            { path: movedTwo.path, value: 1002 }
        ]);
    });

    it('plans local compaction when a moved block has no integer gap', () => {
        const first = { path: 'notes/first.md', extension: 'md' };
        const moved = { path: 'notes/moved.md', extension: 'md' };
        const last = { path: 'notes/last.md', extension: 'md' };

        const plan = buildManualSortRankPlan(
            [first, moved, last],
            new Set([moved.path]),
            new Map([
                [first.path, 1],
                [last.path, 2]
            ])
        );

        expect(plan.requiresCompaction).toBe(true);
        expect(plan.assignments).toEqual([
            { path: first.path, value: 1000 },
            { path: moved.path, value: 2000 },
            { path: last.path, value: 3000 }
        ]);
    });

    it('assigns a new note between the selected ranked note and next ranked note', () => {
        const first = { path: 'notes/first.md', extension: 'md' };
        const second = { path: 'notes/second.md', extension: 'md' };
        const inserted = { path: 'notes/new.md', extension: 'md' };

        const plan = buildManualSortInsertionRankPlan({
            files: [first, second],
            insertedFile: inserted,
            placement: 'below-selected-note',
            selectedPath: first.path,
            rankByPath: new Map([
                [first.path, 1000],
                [second.path, 3000]
            ])
        });

        expect(plan).not.toBeNull();
        expect(plan?.files).toEqual([inserted]);
        expect(plan?.assignments).toEqual([{ path: inserted.path, value: 2000 }]);
        expect(plan?.requiresCompaction).toBe(false);
    });

    it('compacts ranks when a new note is inserted below a selected note without a gap', () => {
        const first = { path: 'notes/first.md', extension: 'md' };
        const second = { path: 'notes/second.md', extension: 'md' };
        const inserted = { path: 'notes/new.md', extension: 'md' };

        const plan = buildManualSortInsertionRankPlan({
            files: [first, second],
            insertedFile: inserted,
            placement: 'below-selected-note',
            selectedPath: first.path,
            rankByPath: new Map([
                [first.path, 1000],
                [second.path, 1001]
            ])
        });

        expect(plan?.requiresCompaction).toBe(true);
        expect(plan?.assignments).toEqual([
            { path: inserted.path, value: MANUAL_SORT_RANK_STEP * 2 },
            { path: second.path, value: MANUAL_SORT_RANK_STEP * 3 }
        ]);
    });

    it('places a new note at the bottom of sorted notes when below selected has no selected ranked note', () => {
        const unranked = { path: 'notes/unranked.md', extension: 'md' };
        const inserted = { path: 'notes/new.md', extension: 'md' };

        const noSelectionPlan = buildManualSortInsertionRankPlan({
            files: [unranked],
            insertedFile: inserted,
            placement: 'below-selected-note',
            selectedPath: null,
            rankByPath: new Map()
        });
        const unrankedSelectionPlan = buildManualSortInsertionRankPlan({
            files: [unranked],
            insertedFile: inserted,
            placement: 'below-selected-note',
            selectedPath: unranked.path,
            rankByPath: new Map()
        });

        expect(noSelectionPlan?.assignments).toEqual([{ path: inserted.path, value: MANUAL_SORT_RANK_STEP }]);
        expect(unrankedSelectionPlan?.assignments).toEqual([{ path: inserted.path, value: MANUAL_SORT_RANK_STEP }]);
    });

    it('assigns a new note after the last ranked note when bottom has no selected anchor', () => {
        const ranked = { path: 'notes/ranked.md', extension: 'md' };
        const unranked = { path: 'notes/unranked.md', extension: 'md' };
        const inserted = { path: 'notes/new.md', extension: 'md' };

        const plan = buildManualSortInsertionRankPlan({
            files: [ranked, unranked],
            insertedFile: inserted,
            placement: 'below-selected-note',
            selectedPath: unranked.path,
            rankByPath: new Map([[ranked.path, MANUAL_SORT_RANK_STEP]])
        });

        expect(plan?.files).toEqual([inserted]);
        expect(plan?.assignments).toEqual([{ path: inserted.path, value: MANUAL_SORT_RANK_STEP * 2 }]);
        expect(plan?.requiresCompaction).toBe(false);
    });

    it('assigns a new note when bottom has no ranked notes yet', () => {
        const unranked = { path: 'notes/unranked.md', extension: 'md' };
        const inserted = { path: 'notes/new.md', extension: 'md' };

        const plan = buildManualSortInsertionRankPlan({
            files: [unranked],
            insertedFile: inserted,
            placement: 'bottom',
            selectedPath: null,
            rankByPath: new Map()
        });

        expect(plan?.files).toEqual([inserted]);
        expect(plan?.assignments).toEqual([{ path: inserted.path, value: MANUAL_SORT_RANK_STEP }]);
        expect(plan?.requiresCompaction).toBe(false);
    });

    it('leaves a new note unsorted when placement is unsorted', () => {
        const ranked = { path: 'notes/ranked.md', extension: 'md' };
        const inserted = { path: 'notes/new.md', extension: 'md' };

        expect(
            buildManualSortInsertionRankPlan({
                files: [ranked],
                insertedFile: inserted,
                placement: 'unsorted',
                selectedPath: ranked.path,
                rankByPath: new Map([[ranked.path, MANUAL_SORT_RANK_STEP]])
            })
        ).toBeNull();
    });

    it('checks whether planned assignments are visible in the metadata cache', () => {
        const first = createFile('notes/first.md', { index: 1000 });
        const second = createFile('notes/second.md', { index: 2000 });
        const app = createApp([first, second], vi.fn());

        expect(
            areManualSortAssignmentsCached(app, [first, second], 'index', [
                { path: first.path, value: 1000 },
                { path: second.path, value: 2000 }
            ])
        ).toBe(true);
        expect(areManualSortAssignmentsCached(app, [first, second], 'index', [{ path: second.path, value: 3000 }])).toBe(false);
    });

    it('writes order values while preserving existing property key casing', async () => {
        const first = createFile('notes/first.md', { Index: 'old' });
        const second = createFile('notes/second.md', { index: 2000 });
        const nonMarkdown = createFile('assets/file.pdf', {});
        const processFrontMatter = vi.fn(async (file: TFile, callback: (frontmatter: Record<string, unknown>) => void) => {
            callback((file as TFile & { frontmatter: Record<string, unknown> }).frontmatter);
        });
        const app = createApp([first, second, nonMarkdown], processFrontMatter);

        const result = await writeManualSortOrder(app, [first, nonMarkdown, second], 'index');

        expect(result).toEqual({ updated: 1, skipped: 1, failed: 0, failures: [] });
        expect(processFrontMatter).toHaveBeenCalledTimes(1);
        expect(first.frontmatter).toEqual({ Index: 1000 });
        expect(second.frontmatter).toEqual({ index: 2000 });
        expect(nonMarkdown.frontmatter).toEqual({});
    });

    it('normalizes existing and missing manual sort properties into sparse order', async () => {
        const first = createFile('notes/first.md', { index: 10 });
        const second = createFile('notes/second.md', {});
        const third = createFile('notes/third.md', { Index: 'custom' });
        const processFrontMatter = vi.fn(async (file: TFile, callback: (frontmatter: Record<string, unknown>) => void) => {
            callback((file as TFile & { frontmatter: Record<string, unknown> }).frontmatter);
        });
        const app = createApp([first, second, third], processFrontMatter);

        const result = await writeManualSortOrder(app, [first, second, third], 'index');

        expect(result).toEqual({ updated: 3, skipped: 0, failed: 0, failures: [] });
        expect(processFrontMatter).toHaveBeenCalledTimes(3);
        expect(first.frontmatter).toEqual({ index: 1000 });
        expect(second.frontmatter).toEqual({ index: 2000 });
        expect(third.frontmatter).toEqual({ Index: 3000 });
    });

    it('writes only explicit manual sort assignments', async () => {
        const first = createFile('notes/first.md', { index: 'old' });
        const second = createFile('notes/second.md', { index: 'old' });
        const processFrontMatter = vi.fn(async (file: TFile, callback: (frontmatter: Record<string, unknown>) => void) => {
            callback((file as TFile & { frontmatter: Record<string, unknown> }).frontmatter);
        });
        const app = createApp([first, second], processFrontMatter);

        const result = await writeManualSortAssignments(app, [first, second], 'index', [{ path: second.path, value: 1500 }]);

        expect(result).toEqual({ updated: 1, skipped: 0, failed: 0, failures: [] });
        expect(processFrontMatter).toHaveBeenCalledTimes(1);
        expect(first.frontmatter).toEqual({ index: 'old' });
        expect(second.frontmatter).toEqual({ index: 1500 });
    });

    it('removes manual sort properties while preserving unrelated frontmatter', async () => {
        const first = createFile('notes/first.md', { Index: 1000, title: 'First' });
        const second = createFile('notes/second.md', { index: 2000 });
        const third = createFile('notes/third.md', { status: 'todo' });
        const nonMarkdown = createFile('assets/file.pdf', { index: 3000 });
        const processFrontMatter = vi.fn(async (file: TFile, callback: (frontmatter: Record<string, unknown>) => void) => {
            callback((file as TFile & { frontmatter: Record<string, unknown> }).frontmatter);
        });
        const app = createApp([first, second, third, nonMarkdown], processFrontMatter);

        const result = await removeManualSortProperty(app, [first, second, third, nonMarkdown], 'index');

        expect(result).toEqual({ updated: 2, skipped: 1, failed: 0, failures: [] });
        expect(processFrontMatter).toHaveBeenCalledTimes(2);
        expect(first.frontmatter).toEqual({ title: 'First' });
        expect(second.frontmatter).toEqual({});
        expect(third.frontmatter).toEqual({ status: 'todo' });
        expect(nonMarkdown.frontmatter).toEqual({ index: 3000 });
    });

    it('records manual sort property removal failures and continues', async () => {
        const first = createFile('notes/first.md', { index: 1000 });
        const second = createFile('notes/second.md', { index: 2000 });
        const processFrontMatter = vi.fn(async (file: TFile, callback: (frontmatter: Record<string, unknown>) => void) => {
            if (file.path === first.path) {
                throw new Error('YAML parse failed');
            }
            callback((file as TFile & { frontmatter: Record<string, unknown> }).frontmatter);
        });
        const app = createApp([first, second], processFrontMatter);

        const result = await removeManualSortProperty(app, [first, second], 'index');

        expect(result).toEqual({
            updated: 1,
            skipped: 0,
            failed: 1,
            failures: [{ path: 'notes/first.md', message: 'YAML parse failed' }]
        });
        expect(processFrontMatter).toHaveBeenCalledTimes(2);
        expect(first.frontmatter).toEqual({ index: 1000 });
        expect(second.frontmatter).toEqual({});
    });

    it('writes and clears manual sort group headers as strings', async () => {
        const first = createFile('notes/first.md', { Group: 3 });
        const second = createFile('notes/second.md', {});
        const processFrontMatter = vi.fn(async (file: TFile, callback: (frontmatter: Record<string, unknown>) => void) => {
            callback((file as TFile & { frontmatter: Record<string, unknown> }).frontmatter);
        });
        const app = createApp([first, second], processFrontMatter);

        await writeManualSortGroupHeader(app, first, 'group', '  Overview  ');
        await writeManualSortGroupHeader(app, second, 'group', 'Next');
        await writeManualSortGroupHeader(app, first, 'group', '   ');

        expect(processFrontMatter).toHaveBeenCalledTimes(3);
        expect(first.frontmatter).toEqual({});
        expect(second.frontmatter).toEqual({ group: 'Next' });
    });

    it('writes manual sort group header word count options as an object', async () => {
        const file = createFile('notes/first.md', {});
        const processFrontMatter = vi.fn(async (targetFile: TFile, callback: (frontmatter: Record<string, unknown>) => void) => {
            callback((targetFile as TFile & { frontmatter: Record<string, unknown> }).frontmatter);
        });
        const app = createApp([file], processFrontMatter);

        await writeManualSortGroupHeader(app, file, 'group', {
            title: '  Draft  ',
            showWordCount: true,
            targetWordCount: '10,000',
            iconId: 'lucide:book-open',
            color: '#3b82f6'
        });

        expect(processFrontMatter).toHaveBeenCalledTimes(1);
        expect(file.frontmatter).toEqual({
            group: {
                title: 'Draft',
                show_word_count: true,
                target_word_count: 10000,
                icon: 'book-open',
                color: '#3b82f6'
            }
        });
    });

    it('records failures and continues writing remaining files', async () => {
        const first = createFile('notes/first.md', { index: 'old' });
        const second = createFile('notes/second.md', { index: 'old' });
        const third = createFile('notes/third.md', { index: 'old' });
        const processFrontMatter = vi.fn(async (file: TFile, callback: (frontmatter: Record<string, unknown>) => void) => {
            if (file.path === second.path) {
                throw new Error('YAML parse failed');
            }
            callback((file as TFile & { frontmatter: Record<string, unknown> }).frontmatter);
        });
        const app = createApp([first, second, third], processFrontMatter);

        const result = await writeManualSortOrder(app, [first, second, third], 'index');

        expect(result).toEqual({
            updated: 2,
            skipped: 0,
            failed: 1,
            failures: [{ path: 'notes/second.md', message: 'YAML parse failed' }]
        });
        expect(processFrontMatter).toHaveBeenCalledTimes(3);
        expect(first.frontmatter).toEqual({ index: 1000 });
        expect(second.frontmatter).toEqual({ index: 'old' });
        expect(third.frontmatter).toEqual({ index: 3000 });
    });
});
