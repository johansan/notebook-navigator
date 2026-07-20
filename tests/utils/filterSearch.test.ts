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
import { describe, it, expect } from 'vitest';
import {
    buildSearchNavFilterState,
    parseFilterSearchTokens,
    fileMatchesDateFilterTokens,
    fileMatchesFilterTokens,
    findFilterSearchNameMatch,
    getFileFilterSearchMatch,
    updateFilterQueryWithTag
} from '../../src/utils/filterSearch';
import { buildPropertyValueNodeId } from '../../src/utils/propertyTree';
import { foldSearchText } from '../../src/utils/recordUtils';

const sortTokens = (values: string[]) => [...values].sort();

const createLocalDate = (year: number, monthIndex: number, day: number): Date => {
    const date = new Date(0);
    date.setFullYear(year, monthIndex, day);
    date.setHours(0, 0, 0, 0);
    return date;
};

describe('parseFilterSearchTokens', () => {
    it('returns neutral tokens for blank queries', () => {
        const tokens = parseFilterSearchTokens('');
        expect(tokens.mode).toBe('filter');
        expect(tokens.expression).toHaveLength(0);
        expect(tokens.hasInclusions).toBe(false);
        expect(tokens.requiresTags).toBe(false);
        expect(tokens.allRequireTags).toBe(false);
        expect(tokens.requireUnfinishedTasks).toBe(false);
        expect(tokens.excludeUnfinishedTasks).toBe(false);
        expect(tokens.includedTagTokens).toEqual([]);
        expect(tokens.nameTokens).toEqual([]);
        expect(tokens.tagTokens).toEqual([]);
        expect(tokens.dateRanges).toEqual([]);
        expect(tokens.requireTagged).toBe(false);
        expect(tokens.includeUntagged).toBe(false);
        expect(tokens.excludeNameTokens).toEqual([]);
        expect(tokens.excludeTagTokens).toEqual([]);
        expect(tokens.folderTokens).toEqual([]);
        expect(tokens.excludeFolderTokens).toEqual([]);
        expect(tokens.extensionTokens).toEqual([]);
        expect(tokens.excludeExtensionTokens).toEqual([]);
        expect(tokens.excludeDateRanges).toEqual([]);
        expect(tokens.excludeTagged).toBe(false);
    });

    it('parses name tokens without tags', () => {
        const tokens = parseFilterSearchTokens('Platform note');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(true);
        expect(tokens.requiresTags).toBe(false);
        expect(tokens.allRequireTags).toBe(false);
        expect(tokens.includedTagTokens).toEqual([]);
        expect(tokens.nameTokens).toEqual(['platform', 'note']);
        expect(tokens.tagTokens).toEqual([]);
        expect(tokens.requireTagged).toBe(false);
        expect(tokens.includeUntagged).toBe(false);
    });

    it('folds diacritics in search token parsing', () => {
        const tokens = parseFilterSearchTokens('canción #Música folder:/Notas/Rápidas ext:ḾD .Estadó=acción');
        expect(tokens.mode).toBe('filter');
        expect(tokens.nameTokens).toEqual(['cancion']);
        expect(tokens.tagTokens).toEqual(['musica']);
        expect(tokens.folderTokens).toEqual([{ mode: 'exact', value: 'notas/rapidas' }]);
        expect(tokens.extensionTokens).toEqual(['md']);
        expect(tokens.propertyTokens).toEqual([{ key: 'estado', value: 'accion' }]);
    });

    it('treats diacritic-folded connector words as literal tokens', () => {
        const tokens = parseFilterSearchTokens('#alpha ånd #beta');
        expect(tokens.mode).toBe('filter');
        expect(tokens.tagTokens).toEqual(['alpha', 'beta']);
        expect(tokens.nameTokens).toEqual(['and']);
    });

    it('treats diacritic-folded OR tokens as literal tokens', () => {
        const tokens = parseFilterSearchTokens('#alpha ör #beta');
        expect(tokens.mode).toBe('filter');
        expect(tokens.tagTokens).toEqual(['alpha', 'beta']);
        expect(tokens.nameTokens).toEqual(['or']);
    });

    it('parses tag tokens combined with name tokens', () => {
        const tokens = parseFilterSearchTokens('#yta plat');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(true);
        expect(tokens.requiresTags).toBe(true);
        expect(tokens.allRequireTags).toBe(true);
        expect(tokens.includedTagTokens).toEqual(['yta']);
        expect(tokens.tagTokens).toEqual(['yta']);
        expect(tokens.nameTokens).toEqual(['plat']);
        expect(tokens.requireTagged).toBe(true);
        expect(tokens.includeUntagged).toBe(false);
    });

    it('keeps explicit AND as literal token outside tag mode', () => {
        const tokens = parseFilterSearchTokens('#yta and plat');
        expect(tokens.mode).toBe('filter');
        expect(tokens.requiresTags).toBe(true);
        expect(tokens.allRequireTags).toBe(true);
        expect(tokens.includedTagTokens).toEqual(['yta']);
        expect(sortTokens(tokens.nameTokens)).toEqual(['and', 'plat']);
        expect(tokens.includeUntagged).toBe(false);
    });

    it('collects tag tokens when OR connectors appear between tokens', () => {
        const tokens = parseFilterSearchTokens('#alpha OR #beta');
        expect(tokens.mode).toBe('tag');
        expect(tokens.expression.length).toBeGreaterThan(0);
        expect(tokens.requiresTags).toBe(true);
        expect(tokens.allRequireTags).toBe(true);
        expect(sortTokens(tokens.includedTagTokens)).toEqual(['alpha', 'beta']);
        expect(sortTokens(tokens.tagTokens)).toEqual(['alpha', 'beta']);
        expect(tokens.nameTokens).toEqual([]);
        expect(tokens.requireTagged).toBe(false);
        expect(tokens.includeUntagged).toBe(false);
    });

    it('treats standalone OR as a literal token', () => {
        const tokens = parseFilterSearchTokens('OR');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(true);
        expect(tokens.requiresTags).toBe(false);
        expect(tokens.includedTagTokens).toEqual([]);
        expect(tokens.nameTokens).toEqual(['or']);
        expect(tokens.includeUntagged).toBe(false);
    });

    it('keeps connector words when they are the only tokens', () => {
        const tokens = parseFilterSearchTokens('AND');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(true);
        expect(tokens.requiresTags).toBe(false);
        expect(tokens.includedTagTokens).toEqual([]);
        expect(tokens.nameTokens).toEqual(['and']);
        expect(tokens.includeUntagged).toBe(false);
    });

    it('treats trailing connector as literal with name tokens', () => {
        const tokens = parseFilterSearchTokens('openai and');
        expect(tokens.mode).toBe('filter');
        expect(tokens.requiresTags).toBe(false);
        expect(tokens.tagTokens).toEqual([]);
        expect(sortTokens(tokens.nameTokens)).toEqual(['and', 'openai']);
    });

    it('treats leading connector as literal with name tokens', () => {
        const tokens = parseFilterSearchTokens('or openai');
        expect(tokens.mode).toBe('filter');
        expect(tokens.requiresTags).toBe(false);
        expect(tokens.tagTokens).toEqual([]);
        expect(sortTokens(tokens.nameTokens)).toEqual(['openai', 'or']);
    });

    it('sets requireTagged when query is only hash', () => {
        const tokens = parseFilterSearchTokens('#');
        expect(tokens.mode).toBe('tag');
        expect(tokens.requiresTags).toBe(true);
        expect(tokens.allRequireTags).toBe(true);
        expect(tokens.includedTagTokens).toEqual([]);
        expect(tokens.requireTagged).toBe(true);
        expect(tokens.includeUntagged).toBe(false);
    });

    it('falls back to filter mode when a non-tag operand exists beside tags', () => {
        const tokens = parseFilterSearchTokens('plan OR #alpha');
        expect(tokens.mode).toBe('filter');
        expect(tokens.requiresTags).toBe(true);
        expect(tokens.allRequireTags).toBe(true);
        expect(sortTokens(tokens.includedTagTokens)).toEqual(['alpha']);
        expect(sortTokens(tokens.nameTokens)).toEqual(['or', 'plan']);
        expect(tokens.includeUntagged).toBe(false);
    });

    it('applies tag mode precedence when only tags and connectors are present', () => {
        const tokens = parseFilterSearchTokens('#tag1 OR #tag2 AND #tag3');
        expect(tokens.mode).toBe('tag');
        expect(tokens.requiresTags).toBe(true);
        expect(tokens.allRequireTags).toBe(true);
        expect(sortTokens(tokens.includedTagTokens)).toEqual(['tag1', 'tag2', 'tag3']);
        expect(tokens.includeUntagged).toBe(false);
    });

    it('marks untagged inclusion when -# appears in tag expressions', () => {
        const tokens = parseFilterSearchTokens('#alpha OR -#');
        expect(tokens.mode).toBe('tag');
        expect(tokens.includeUntagged).toBe(true);
        expect(tokens.excludeTagged).toBe(false);
        expect(tokens.includedTagTokens).toEqual(['alpha']);
    });

    it('drops dangling connectors before exclusion tokens', () => {
        const tokens = parseFilterSearchTokens('#alpha OR -#beta');
        expect(tokens.mode).toBe('tag');
        expect(tokens.requiresTags).toBe(true);
        expect(tokens.excludeTagTokens).toEqual(['beta']);
        expect(tokens.excludeTagged).toBe(false);
        expect(tokens.includedTagTokens).toEqual(['alpha']);
        expect(tokens.includeUntagged).toBe(false);
    });

    it('drops dangling connectors before the first inclusion token', () => {
        const tokens = parseFilterSearchTokens('-#beta OR #alpha');
        expect(tokens.mode).toBe('tag');
        expect(tokens.requiresTags).toBe(true);
        expect(sortTokens(tokens.includedTagTokens)).toEqual(['alpha']);
        expect(tokens.includeUntagged).toBe(false);
    });

    it('keeps tag mode for negated tag-only expressions', () => {
        const tokens = parseFilterSearchTokens('-#alpha OR -#beta');
        expect(tokens.mode).toBe('tag');
        expect(tokens.requiresTags).toBe(true);
        expect(tokens.includedTagTokens).toEqual([]);
        expect(tokens.excludeTagTokens).toEqual(['alpha', 'beta']);
        expect(tokens.excludeTagged).toBe(false);
        expect(tokens.includeUntagged).toBe(false);
    });

    it('parses dash-prefixed negated name tokens', () => {
        const tokens = parseFilterSearchTokens('-draft');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(false);
        expect(tokens.excludeNameTokens).toEqual(['draft']);
    });

    it('parses dash-prefixed negated tag tokens', () => {
        const tokens = parseFilterSearchTokens('-#yta');
        expect(tokens.mode).toBe('tag');
        expect(tokens.excludeTagTokens).toEqual(['yta']);
        expect(tokens.excludeTagged).toBe(false);
    });

    it('treats bang-prefixed name tokens as literal text', () => {
        const tokens = parseFilterSearchTokens('!draft');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(true);
        expect(tokens.nameTokens).toEqual(['!draft']);
        expect(tokens.excludeNameTokens).toEqual([]);
    });

    it('treats bang-prefixed tag tokens as literal text', () => {
        const tokens = parseFilterSearchTokens('!#yta');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(true);
        expect(tokens.nameTokens).toEqual(['!#yta']);
        expect(tokens.excludeTagTokens).toEqual([]);
    });

    it('marks untagged inclusion when -# appears with name tokens', () => {
        const tokens = parseFilterSearchTokens('plat -#');
        expect(tokens.mode).toBe('filter');
        expect(tokens.includeUntagged).toBe(true);
        expect(tokens.excludeTagged).toBe(true);
    });

    it('parses negated tagged requirement', () => {
        const tokens = parseFilterSearchTokens('-#');
        expect(tokens.mode).toBe('tag');
        expect(tokens.excludeTagged).toBe(false);
        expect(tokens.includeUntagged).toBe(true);
    });

    it('parses ISO date tokens with @ prefix', () => {
        const tokens = parseFilterSearchTokens('@2026-02-04');
        expect(tokens.mode).toBe('filter');
        expect(tokens.dateRanges).toHaveLength(1);
        expect(tokens.excludeDateRanges).toEqual([]);

        const range = tokens.dateRanges[0];
        expect(range.field).toBe('default');
        expect(range.startMs).toBe(new Date(2026, 1, 4).getTime());
        expect(range.endMs).toBe(new Date(2026, 1, 5).getTime());
    });

    it('parses year date tokens with @ prefix', () => {
        const tokens = parseFilterSearchTokens('@2026');
        expect(tokens.mode).toBe('filter');
        expect(tokens.dateRanges).toHaveLength(1);
        expect(tokens.excludeDateRanges).toEqual([]);

        const range = tokens.dateRanges[0];
        expect(range.field).toBe('default');
        expect(range.startMs).toBe(new Date(2026, 0, 1).getTime());
        expect(range.endMs).toBe(new Date(2027, 0, 1).getTime());
    });

    it('parses three-digit year date tokens with @ prefix', () => {
        const tokens = parseFilterSearchTokens('@999');
        expect(tokens.mode).toBe('filter');
        expect(tokens.dateRanges).toHaveLength(1);
        expect(tokens.excludeDateRanges).toEqual([]);

        const range = tokens.dateRanges[0];
        expect(range.field).toBe('default');
        expect(range.startMs).toBe(createLocalDate(999, 0, 1).getTime());
        expect(range.endMs).toBe(createLocalDate(1000, 0, 1).getTime());
    });

    it('parses zero-padded pre-1000 year date tokens with @ prefix', () => {
        const tokens = parseFilterSearchTokens('@0999');
        expect(tokens.mode).toBe('filter');
        expect(tokens.dateRanges).toHaveLength(1);

        const range = tokens.dateRanges[0];
        expect(range.startMs).toBe(createLocalDate(999, 0, 1).getTime());
        expect(range.endMs).toBe(createLocalDate(1000, 0, 1).getTime());
    });

    it('parses year/month date tokens with @ prefix', () => {
        const tokens = parseFilterSearchTokens('@2026-02');
        expect(tokens.mode).toBe('filter');
        expect(tokens.dateRanges).toHaveLength(1);
        expect(tokens.excludeDateRanges).toEqual([]);

        const range = tokens.dateRanges[0];
        expect(range.field).toBe('default');
        expect(range.startMs).toBe(new Date(2026, 1, 1).getTime());
        expect(range.endMs).toBe(new Date(2026, 2, 1).getTime());
    });

    it('parses pre-1000 year/month date tokens with @ prefix', () => {
        const tokens = parseFilterSearchTokens('@999-02');
        expect(tokens.mode).toBe('filter');
        expect(tokens.dateRanges).toHaveLength(1);
        expect(tokens.excludeDateRanges).toEqual([]);

        const range = tokens.dateRanges[0];
        expect(range.startMs).toBe(createLocalDate(999, 1, 1).getTime());
        expect(range.endMs).toBe(createLocalDate(999, 2, 1).getTime());
    });

    it('parses year/week date tokens with @ prefix', () => {
        const tokens = parseFilterSearchTokens('@2026-W05');
        expect(tokens.mode).toBe('filter');
        expect(tokens.dateRanges).toHaveLength(1);
        expect(tokens.excludeDateRanges).toEqual([]);

        const range = tokens.dateRanges[0];
        expect(range.field).toBe('default');
        expect(range.startMs).toBe(new Date(2026, 0, 26).getTime());
        expect(range.endMs).toBe(new Date(2026, 1, 2).getTime());
    });

    it('parses year/quarter date tokens with @ prefix', () => {
        const tokens = parseFilterSearchTokens('@2026-Q2');
        expect(tokens.mode).toBe('filter');
        expect(tokens.dateRanges).toHaveLength(1);
        expect(tokens.excludeDateRanges).toEqual([]);

        const range = tokens.dateRanges[0];
        expect(range.field).toBe('default');
        expect(range.startMs).toBe(new Date(2026, 3, 1).getTime());
        expect(range.endMs).toBe(new Date(2026, 6, 1).getTime());
    });

    it('parses compact date tokens with @ prefix', () => {
        const tokens = parseFilterSearchTokens('@20260204');
        expect(tokens.mode).toBe('filter');
        expect(tokens.dateRanges).toHaveLength(1);
        expect(tokens.excludeDateRanges).toEqual([]);

        const range = tokens.dateRanges[0];
        expect(range.field).toBe('default');
        expect(range.startMs).toBe(new Date(2026, 1, 4).getTime());
        expect(range.endMs).toBe(new Date(2026, 1, 5).getTime());
    });

    it('parses day/month/year date tokens with @ prefix', () => {
        const tokens = parseFilterSearchTokens('@13/02/2026');
        expect(tokens.mode).toBe('filter');
        expect(tokens.dateRanges).toHaveLength(1);
        expect(tokens.excludeDateRanges).toEqual([]);

        const range = tokens.dateRanges[0];
        expect(range.field).toBe('default');
        expect(range.startMs).toBe(new Date(2026, 1, 13).getTime());
        expect(range.endMs).toBe(new Date(2026, 1, 14).getTime());
    });

    it('parses pre-1000 day date tokens with separators', () => {
        const tokens = parseFilterSearchTokens('@999-02-13');
        expect(tokens.mode).toBe('filter');
        expect(tokens.dateRanges).toHaveLength(1);
        expect(tokens.excludeDateRanges).toEqual([]);

        const range = tokens.dateRanges[0];
        expect(range.startMs).toBe(createLocalDate(999, 1, 13).getTime());
        expect(range.endMs).toBe(createLocalDate(999, 1, 14).getTime());
    });

    it('parses date ranges using .. with open ends', () => {
        const upperBound = parseFilterSearchTokens('@..2026-02-04');
        expect(upperBound.mode).toBe('filter');
        expect(upperBound.dateRanges).toHaveLength(1);
        expect(upperBound.dateRanges[0].startMs).toBeNull();
        expect(upperBound.dateRanges[0].endMs).toBe(new Date(2026, 1, 5).getTime());

        const lowerBound = parseFilterSearchTokens('@2026-02-01..');
        expect(lowerBound.mode).toBe('filter');
        expect(lowerBound.dateRanges).toHaveLength(1);
        expect(lowerBound.dateRanges[0].startMs).toBe(new Date(2026, 1, 1).getTime());
        expect(lowerBound.dateRanges[0].endMs).toBeNull();
    });

    it('parses dash-prefixed negated date filters', () => {
        const tokens = parseFilterSearchTokens('-@2026-02-04');
        expect(tokens.mode).toBe('filter');
        expect(tokens.dateRanges).toEqual([]);
        expect(tokens.excludeDateRanges).toHaveLength(1);
        expect(tokens.excludeDateRanges[0].endMs).toBe(new Date(2026, 1, 5).getTime());
    });

    it('treats bang-prefixed date tokens as literal text', () => {
        const tokens = parseFilterSearchTokens('!@2026-02-04');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(true);
        expect(tokens.nameTokens).toEqual(['!@2026-02-04']);
        expect(tokens.dateRanges).toEqual([]);
        expect(tokens.excludeDateRanges).toEqual([]);
    });

    it('parses unfinished task filter tokens', () => {
        const tokens = parseFilterSearchTokens('has:task');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(true);
        expect(tokens.requireUnfinishedTasks).toBe(true);
        expect(tokens.excludeUnfinishedTasks).toBe(false);
    });

    it('parses folder filter tokens', () => {
        const tokens = parseFilterSearchTokens('has:task folder:meetings');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(true);
        expect(tokens.requireUnfinishedTasks).toBe(true);
        expect(tokens.folderTokens).toEqual([{ mode: 'segment', value: 'meetings' }]);
        expect(tokens.excludeFolderTokens).toEqual([]);
    });

    it('parses exact folder filter tokens with leading slash', () => {
        const tokens = parseFilterSearchTokens('folder:/archive/2025');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(true);
        expect(tokens.folderTokens).toEqual([{ mode: 'exact', value: 'archive/2025' }]);
        expect(tokens.excludeFolderTokens).toEqual([]);
    });

    it('parses negated exact folder filter tokens', () => {
        const tokens = parseFilterSearchTokens('-folder:/archive/2025');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(false);
        expect(tokens.folderTokens).toEqual([]);
        expect(tokens.excludeFolderTokens).toEqual([{ mode: 'exact', value: 'archive/2025' }]);
    });

    it('normalizes slash variants in exact folder filter tokens', () => {
        const tokens = parseFilterSearchTokens('folder:/work\\meetings/');
        expect(tokens.mode).toBe('filter');
        expect(tokens.folderTokens).toEqual([{ mode: 'exact', value: 'work/meetings' }]);
    });

    it('parses root folder filter tokens', () => {
        const tokens = parseFilterSearchTokens('folder:/');
        expect(tokens.mode).toBe('filter');
        expect(tokens.folderTokens).toEqual([{ mode: 'exact', value: '' }]);
    });

    it('ignores segment folder filters containing slashes', () => {
        const tokens = parseFilterSearchTokens('folder:team/meetings');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(false);
        expect(tokens.folderTokens).toEqual([]);
    });

    it('treats connectors as literal text when folder filters are mixed with tags', () => {
        const tokens = parseFilterSearchTokens('#alpha OR folder:meetings');
        expect(tokens.mode).toBe('filter');
        expect(tokens.nameTokens).toEqual(['or']);
        expect(tokens.includedTagTokens).toEqual(['alpha']);
        expect(tokens.folderTokens).toEqual([{ mode: 'segment', value: 'meetings' }]);
    });

    it('parses extension filter tokens', () => {
        const tokens = parseFilterSearchTokens('ext:.md');
        expect(tokens.mode).toBe('filter');
        expect(tokens.extensionTokens).toEqual(['md']);
        expect(tokens.excludeExtensionTokens).toEqual([]);
    });

    it('normalizes extension filter tokens with multiple dots', () => {
        const tokens = parseFilterSearchTokens('ext:tar.gz');
        expect(tokens.mode).toBe('filter');
        expect(tokens.extensionTokens).toEqual(['gz']);
        expect(tokens.excludeExtensionTokens).toEqual([]);
    });

    it('parses negated extension filter tokens', () => {
        const tokens = parseFilterSearchTokens('-ext:pdf');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(false);
        expect(tokens.extensionTokens).toEqual([]);
        expect(tokens.excludeExtensionTokens).toEqual(['pdf']);
    });

    it('ignores partial extension filter tokens', () => {
        const tokens = parseFilterSearchTokens('ext:');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(false);
        expect(tokens.extensionTokens).toEqual([]);
        expect(tokens.excludeExtensionTokens).toEqual([]);
    });

    it('parses negated unfinished task filter tokens', () => {
        const tokens = parseFilterSearchTokens('-has:task');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(false);
        expect(tokens.requireUnfinishedTasks).toBe(false);
        expect(tokens.excludeUnfinishedTasks).toBe(true);
    });

    it('treats bang-prefixed unfinished task tokens as literal text', () => {
        const tokens = parseFilterSearchTokens('!has:task');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(true);
        expect(tokens.nameTokens).toEqual(['!has:task']);
        expect(tokens.requireUnfinishedTasks).toBe(false);
        expect(tokens.excludeUnfinishedTasks).toBe(false);
    });

    it('treats connectors as literal text when task filters are mixed with tags', () => {
        const tokens = parseFilterSearchTokens('#alpha OR #beta has:task');
        expect(tokens.mode).toBe('filter');
        expect(tokens.nameTokens).toEqual(['or']);
        expect(sortTokens(tokens.includedTagTokens)).toEqual(['alpha', 'beta']);
        expect(tokens.requireUnfinishedTasks).toBe(true);
    });

    it('treats AND as literal text when task filters are mixed with tags', () => {
        const tokens = parseFilterSearchTokens('#alpha AND has:task');
        expect(tokens.mode).toBe('filter');
        expect(tokens.nameTokens).toEqual(['and']);
        expect(tokens.includedTagTokens).toEqual(['alpha']);
        expect(tokens.requireUnfinishedTasks).toBe(true);
    });

    it('treats connectors as literal text when date filters are mixed with tags', () => {
        const tokens = parseFilterSearchTokens('#alpha OR #beta @2026-02-04');
        expect(tokens.mode).toBe('filter');
        expect(tokens.nameTokens).toEqual(['or']);
        expect(sortTokens(tokens.includedTagTokens)).toEqual(['alpha', 'beta']);
        expect(tokens.dateRanges).toHaveLength(1);
    });

    it('treats non-date @ tokens as literal name tokens', () => {
        const tokens = parseFilterSearchTokens('@john');
        expect(tokens.mode).toBe('filter');
        expect(tokens.nameTokens).toEqual(['@john']);
        expect(tokens.dateRanges).toEqual([]);
    });

    it('ignores partial @ tokens that look like date filters', () => {
        const tokens = parseFilterSearchTokens('@to');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(false);
        expect(tokens.nameTokens).toEqual([]);
        expect(tokens.dateRanges).toEqual([]);
    });

    it('ignores partial folder filter tokens', () => {
        const tokens = parseFilterSearchTokens('folder:');
        expect(tokens.mode).toBe('filter');
        expect(tokens.hasInclusions).toBe(false);
        expect(tokens.folderTokens).toEqual([]);
        expect(tokens.excludeFolderTokens).toEqual([]);
    });
});

describe('buildSearchNavFilterState', () => {
    it('tracks implicit and explicit operators for included tags', () => {
        const state = buildSearchNavFilterState('#alpha #beta OR #gamma');

        expect(state.tags.include).toEqual(['alpha', 'beta', 'gamma']);
        expect(state.tags.includeOperators).toEqual({
            beta: 'AND',
            gamma: 'OR'
        });
        expect(state.properties.includeOperators).toEqual({});
    });

    it('tracks operators for included properties in expression mode', () => {
        const state = buildSearchNavFilterState('#alpha AND .status=started OR .status=finished');

        expect(state.tags.includeOperators).toEqual({});
        expect(state.properties.includeOperators).toEqual({
            [buildPropertyValueNodeId('status', 'started')]: 'AND',
            [buildPropertyValueNodeId('status', 'finished')]: 'OR'
        });
    });
});

describe('updateFilterQueryWithTag', () => {
    it('adds a tag to an empty query', () => {
        const result = updateFilterQueryWithTag('', 'project/alpha', 'AND');
        expect(result.query).toBe('#project/alpha');
        expect(result.action).toBe('added');
        expect(result.changed).toBe(true);
    });

    it('removes an existing tag and cleans connectors', () => {
        const result = updateFilterQueryWithTag('#project/alpha AND #status/green', 'status/green', 'AND');
        expect(result.query).toBe('#project/alpha');
        expect(result.action).toBe('removed');
        expect(result.changed).toBe(true);
    });

    it('switches connector when toggling the same tag twice', () => {
        const first = updateFilterQueryWithTag('#project/alpha', 'status/green', 'OR');
        expect(first.query).toBe('#project/alpha OR #status/green');
        expect(first.action).toBe('added');
        expect(first.changed).toBe(true);

        const second = updateFilterQueryWithTag(first.query, 'status/green', 'OR');
        expect(second.query).toBe('#project/alpha');
        expect(second.action).toBe('removed');
        expect(second.changed).toBe(true);
    });

    it('normalizes duplicate connectors when removing a middle tag', () => {
        const result = updateFilterQueryWithTag('#alpha OR #beta OR #gamma', 'beta', 'OR');
        expect(result.query).toBe('#alpha OR #gamma');
        expect(result.action).toBe('removed');
        expect(result.changed).toBe(true);
    });

    it('matches tags case-insensitively', () => {
        const result = updateFilterQueryWithTag('#Alpha and #beta', 'alpha', 'AND');
        expect(result.query).toBe('#beta');
        expect(result.action).toBe('removed');
        expect(result.changed).toBe(true);
    });

    it('matches tags with folded diacritics when toggling', () => {
        const result = updateFilterQueryWithTag('#Canción and #beta', 'cancion', 'AND');
        expect(result.query).toBe('#beta');
        expect(result.action).toBe('removed');
        expect(result.changed).toBe(true);
    });

    it('appends tags without connector operators in mixed queries', () => {
        const result = updateFilterQueryWithTag('#project/alpha @2026-02-04', 'status/green', 'OR');
        expect(result.query).toBe('#project/alpha @2026-02-04 #status/green');
        expect(result.action).toBe('added');
        expect(result.changed).toBe(true);
    });

    it('removes tags in mixed queries without pruning literal connector words', () => {
        const result = updateFilterQueryWithTag('meeting and #project/alpha @today', 'project/alpha', 'AND');
        expect(result.query).toBe('meeting and @today');
        expect(result.action).toBe('removed');
        expect(result.changed).toBe(true);
    });
});

describe('fileMatchesFilterTokens', () => {
    it('matches when no tokens are provided', () => {
        const tokens = parseFilterSearchTokens('');
        expect(fileMatchesFilterTokens('platform', [], tokens)).toBe(true);
    });

    it('matches name tokens using substring comparison', () => {
        const tokens = parseFilterSearchTokens('plat form');
        expect(fileMatchesFilterTokens('platform notes', [], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('note list', [], tokens)).toBe(false);
    });

    it('matches name tokens against aliases', () => {
        const tokens = parseFilterSearchTokens('nn');

        expect(
            fileMatchesFilterTokens('notebook navigator', [], tokens, {
                hasUnfinishedTasks: false,
                foldedAliases: ['nn']
            })
        ).toBe(true);
    });

    it('returns alias coverage from the file acceptance pass', () => {
        const tokens = parseFilterSearchTokens('notebook navigator');

        expect(
            getFileFilterSearchMatch('notebook', [], tokens, {
                hasUnfinishedTasks: false,
                foldedAliases: ['navigator']
            })
        ).toEqual({ matches: true, nameMatch: { aliasIndexes: [0] } });
    });

    it('requires every name token to match across the display name and aliases', () => {
        const tokens = parseFilterSearchTokens('notebook navigator');

        expect(
            fileMatchesFilterTokens('project note', [], tokens, {
                hasUnfinishedTasks: false,
                foldedAliases: ['notebook navigator']
            })
        ).toBe(true);
        expect(
            fileMatchesFilterTokens('project note', [], tokens, {
                hasUnfinishedTasks: false,
                foldedAliases: ['notebook', 'navigator']
            })
        ).toBe(true);
        expect(
            fileMatchesFilterTokens('notebook', [], tokens, {
                hasUnfinishedTasks: false,
                foldedAliases: ['navigator']
            })
        ).toBe(true);
    });

    it('reports only the aliases needed to cover tokens missing from the display name', () => {
        expect(findFilterSearchNameMatch('notebook navigator', ['nn'], ['notebook'])).toEqual({ aliasIndexes: [] });
        expect(findFilterSearchNameMatch('project note', ['nn', 'notebook navigator'], ['notebook'])).toEqual({
            aliasIndexes: [1]
        });
        expect(findFilterSearchNameMatch('project note', ['notebook', 'navigator'], ['notebook', 'navigator'])).toEqual({
            aliasIndexes: [0, 1]
        });
        expect(findFilterSearchNameMatch('notebook', ['navigator'], ['notebook', 'navigator'])).toEqual({
            aliasIndexes: [0]
        });
        expect(findFilterSearchNameMatch('project note', ['notebook', 'notebook navigator'], ['notebook', 'navigator'])).toEqual({
            aliasIndexes: [1]
        });
        expect(findFilterSearchNameMatch('project note', ['notebook'], ['notebook', 'navigator'])).toBeNull();
    });

    it('removes aliases made redundant by later coverage choices', () => {
        expect(
            findFilterSearchNameMatch(
                '',
                ['alpha beta gamma delta', 'alpha beta gamma epsilon', 'delta zeta'],
                ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta']
            )
        ).toEqual({ aliasIndexes: [1, 2] });
    });

    it('applies name exclusions to aliases', () => {
        const tokens = parseFilterSearchTokens('notebook -nn');

        expect(
            fileMatchesFilterTokens('notebook navigator', [], tokens, {
                hasUnfinishedTasks: false,
                foldedAliases: ['nn']
            })
        ).toBe(false);
    });

    it('matches folded name, tag, and folder values', () => {
        const tokens = parseFilterSearchTokens('cancion #muzyka folder:/notatki/swiat');
        expect(
            fileMatchesFilterTokens(foldSearchText('Canción plan'), [foldSearchText('Múzyka')], tokens, {
                hasUnfinishedTasks: false,
                foldedFolderPath: foldSearchText('Notatki/Świat')
            })
        ).toBe(true);
    });

    it('keeps non-Latin combining marks distinct in name matching', () => {
        const markedName = foldSearchText('مُدَرِّس');
        const unmarkedName = foldSearchText('مدرس');

        const markedTokens = parseFilterSearchTokens(markedName);
        const unmarkedTokens = parseFilterSearchTokens(unmarkedName);

        expect(fileMatchesFilterTokens(markedName, [], markedTokens)).toBe(true);
        expect(fileMatchesFilterTokens(markedName, [], unmarkedTokens)).toBe(false);
    });

    it('keeps compatibility-equivalent forms distinct in name matching', () => {
        const eszettName = foldSearchText('Straße');
        const ligatureName = foldSearchText('ﬁle note');
        const fullWidthName = foldSearchText('ＡＢＣ plan');

        expect(fileMatchesFilterTokens(eszettName, [], parseFilterSearchTokens('strasse'))).toBe(false);
        expect(fileMatchesFilterTokens(ligatureName, [], parseFilterSearchTokens('file'))).toBe(false);
        expect(fileMatchesFilterTokens(fullWidthName, [], parseFilterSearchTokens('abc'))).toBe(false);
    });

    it('matches tag tokens using prefix comparison', () => {
        const tokens = parseFilterSearchTokens('#yta');
        expect(fileMatchesFilterTokens('platform', ['yta'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('platform', ['yta-helper'], tokens)).toBe(false);
        expect(fileMatchesFilterTokens('platform', ['yta/roadmap'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('platform', ['inbox'], tokens)).toBe(false);
    });

    it('requires both name and tag tokens when both are present', () => {
        const tokens = parseFilterSearchTokens('#yta plat');
        expect(fileMatchesFilterTokens('platform plan', ['yta'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('roadmap plan', ['projects/mytag'], tokens)).toBe(false);
        expect(fileMatchesFilterTokens('platform plan', ['archive'], tokens)).toBe(false);
    });

    it('requires every literal token when connectors appear with plain text', () => {
        const tokens = parseFilterSearchTokens('alpha OR beta');
        expect(tokens.mode).toBe('filter');
        expect(fileMatchesFilterTokens('alpha or beta notes', [], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('alpha beta notes', [], tokens)).toBe(false);
        expect(fileMatchesFilterTokens('alpha notes', [], tokens)).toBe(false);
        expect(fileMatchesFilterTokens('beta summary', [], tokens)).toBe(false);
    });

    it('supports OR semantics when only tag operands are present', () => {
        const tokens = parseFilterSearchTokens('#alpha OR #beta');
        expect(tokens.mode).toBe('tag');
        expect(fileMatchesFilterTokens('note', ['alpha'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('note', ['beta'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('note', ['alpha/project'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('note', ['gamma'], tokens)).toBe(false);
    });

    it('matches descendant tags in tag mode', () => {
        const tokens = parseFilterSearchTokens('#ai');
        expect(tokens.mode).toBe('tag');
        expect(fileMatchesFilterTokens('note', ['ai'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('note', ['ai/help'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('note', ['ai-helper'], tokens)).toBe(false);
    });

    it('requires matching both name and tag in mixed filter mode queries', () => {
        const tokens = parseFilterSearchTokens('#alpha OR plan');
        expect(tokens.mode).toBe('filter');
        expect(fileMatchesFilterTokens('project or plan', ['alpha'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('project or plan', [], tokens)).toBe(false);
        expect(fileMatchesFilterTokens('roadmap', ['projects/alpha'], tokens)).toBe(false);
    });

    it('matches untagged notes when using -# operand in tag mode', () => {
        const tokens = parseFilterSearchTokens('#alpha OR -#');
        expect(tokens.mode).toBe('tag');
        expect(fileMatchesFilterTokens('note', ['alpha'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('note', [], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('note', ['beta'], tokens)).toBe(false);
    });

    it('evaluates AND before OR for complex tag expressions', () => {
        const tokens = parseFilterSearchTokens('#tag1 OR #tag2 AND #tag3 OR #tag4 AND #tag5 AND #tag6');

        expect(fileMatchesFilterTokens('note', ['tag1'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('note', ['tag2', 'tag3'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('note', ['tag4', 'tag5', 'tag6'], tokens)).toBe(true);

        expect(fileMatchesFilterTokens('note', ['tag2'], tokens)).toBe(false);
        expect(fileMatchesFilterTokens('note', ['tag4', 'tag5'], tokens)).toBe(false);
    });

    it('supports OR tag queries combined with exclusion clauses', () => {
        const tokens = parseFilterSearchTokens('#alpha OR -#beta');
        expect(tokens.mode).toBe('tag');
        expect(fileMatchesFilterTokens('note', ['alpha'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('note', ['beta'], tokens)).toBe(false);
        expect(fileMatchesFilterTokens('note', [], tokens)).toBe(true);
    });

    it('matches when exclusions precede an OR branch', () => {
        const tokens = parseFilterSearchTokens('-#beta OR #alpha');
        expect(tokens.mode).toBe('tag');
        expect(fileMatchesFilterTokens('note', ['alpha'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('note', ['beta'], tokens)).toBe(false);
        expect(fileMatchesFilterTokens('note', [], tokens)).toBe(true);
    });

    it('evaluates OR logic for negated tag-only expressions', () => {
        const tokens = parseFilterSearchTokens('-#alpha OR -#beta');
        expect(tokens.mode).toBe('tag');
        expect(fileMatchesFilterTokens('note', ['alpha'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('note', ['beta'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('note', ['alpha', 'beta'], tokens)).toBe(false);
        expect(fileMatchesFilterTokens('note', [], tokens)).toBe(true);
    });

    it('requires tags when query is only hash', () => {
        const tokens = parseFilterSearchTokens('#');
        expect(fileMatchesFilterTokens('platform plan', ['projects/mytag'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('platform plan', [], tokens)).toBe(false);
    });

    it('excludes files with matching name tokens', () => {
        const tokens = parseFilterSearchTokens('plat -draft');
        expect(fileMatchesFilterTokens('platform plan', [], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('platform draft', [], tokens)).toBe(false);
    });

    it('excludes tagged files when -# is used', () => {
        const tokens = parseFilterSearchTokens('-#');
        expect(fileMatchesFilterTokens('platform plan', [], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('platform plan', ['projects/mytag'], tokens)).toBe(false);
    });

    it('excludes files with specific tags when -#tag is used', () => {
        const tokens = parseFilterSearchTokens('-#yta');
        expect(fileMatchesFilterTokens('platform plan', [], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('platform plan', ['mytag'], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('platform plan', ['yta'], tokens)).toBe(false);
        expect(fileMatchesFilterTokens('platform plan', ['yta/roadmap'], tokens)).toBe(false);
    });

    it('handles mixed include and exclude tokens', () => {
        const tokens = parseFilterSearchTokens('plat -draft -#yta');
        expect(fileMatchesFilterTokens('platform plan', [], tokens)).toBe(true);
        expect(fileMatchesFilterTokens('platform draft', [], tokens)).toBe(false);
        expect(fileMatchesFilterTokens('platform plan', ['yta'], tokens)).toBe(false);
    });

    it('filters notes with unfinished tasks', () => {
        const tokens = parseFilterSearchTokens('has:task');
        expect(fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: true })).toBe(true);
        expect(fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: false })).toBe(false);
    });

    it('filters notes without unfinished tasks using dash negation', () => {
        const tokens = parseFilterSearchTokens('-has:task');
        expect(fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: false })).toBe(true);
        expect(fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: true })).toBe(false);
    });

    it('filters notes by included folder tokens', () => {
        const tokens = parseFilterSearchTokens('folder:meetings');
        expect(fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: false, foldedFolderPath: 'work/meetings' })).toBe(
            true
        );
        expect(fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: false, foldedFolderPath: 'work/projects' })).toBe(
            false
        );
        expect(
            fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: false, foldedFolderPath: 'notes/team-meetings' })
        ).toBe(true);
    });

    it('filters notes by excluded folder tokens', () => {
        const tokens = parseFilterSearchTokens('-folder:archive');
        expect(fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: false, foldedFolderPath: 'notes/archive' })).toBe(
            false
        );
        expect(fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: false, foldedFolderPath: 'notes/current' })).toBe(
            true
        );
    });

    it('filters notes by exact folder path tokens', () => {
        const tokens = parseFilterSearchTokens('folder:/work/meetings');
        expect(
            fileMatchesFilterTokens('platform plan', [], tokens, {
                hasUnfinishedTasks: false,
                foldedFolderPath: 'work/meetings'
            })
        ).toBe(true);
        expect(
            fileMatchesFilterTokens('platform plan', [], tokens, {
                hasUnfinishedTasks: false,
                foldedFolderPath: 'work/meetings/weekly'
            })
        ).toBe(false);
        expect(
            fileMatchesFilterTokens('platform plan', [], tokens, {
                hasUnfinishedTasks: false,
                foldedFolderPath: 'notes/work/meetings'
            })
        ).toBe(false);
    });

    it('filters root notes with folder:/', () => {
        const tokens = parseFilterSearchTokens('folder:/');
        expect(fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: false, foldedFolderPath: '' })).toBe(true);
        expect(fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: false, foldedFolderPath: 'work/meetings' })).toBe(
            false
        );
    });

    it('filters notes by included extension tokens', () => {
        const tokens = parseFilterSearchTokens('ext:md');
        expect(fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: false, foldedExtension: 'md' })).toBe(true);
        expect(fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: false, foldedExtension: 'pdf' })).toBe(false);
    });

    it('filters notes by excluded extension tokens', () => {
        const tokens = parseFilterSearchTokens('-ext:pdf');
        expect(fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: false, foldedExtension: 'md' })).toBe(true);
        expect(fileMatchesFilterTokens('platform plan', [], tokens, { hasUnfinishedTasks: false, foldedExtension: 'pdf' })).toBe(false);
    });

    it('treats OR as a literal word when unfinished task filters are mixed with tags', () => {
        const tokens = parseFilterSearchTokens('#alpha OR #beta has:task');
        expect(tokens.mode).toBe('filter');
        expect(fileMatchesFilterTokens('note or entry', ['alpha', 'beta'], tokens, { hasUnfinishedTasks: true })).toBe(true);
        expect(fileMatchesFilterTokens('note entry', ['alpha', 'beta'], tokens, { hasUnfinishedTasks: true })).toBe(false);
        expect(fileMatchesFilterTokens('note or entry', ['alpha'], tokens, { hasUnfinishedTasks: true })).toBe(false);
        expect(fileMatchesFilterTokens('note or entry', ['alpha', 'beta'], tokens, { hasUnfinishedTasks: false })).toBe(false);
    });
});

describe('fileMatchesDateFilterTokens', () => {
    it('matches timestamps inside @YYYY-MM-DD day filters using the default date field', () => {
        const tokens = parseFilterSearchTokens('@2026-02-04');
        const timestamp = new Date(2026, 1, 4, 12, 0, 0).getTime();

        expect(fileMatchesDateFilterTokens({ created: 0, modified: timestamp, defaultField: 'modified' }, tokens)).toBe(true);
        expect(
            fileMatchesDateFilterTokens(
                { created: 0, modified: new Date(2026, 1, 5, 12, 0, 0).getTime(), defaultField: 'modified' },
                tokens
            )
        ).toBe(false);
    });

    it('matches timestamps inside three-digit year filters', () => {
        const tokens = parseFilterSearchTokens('@999');
        const timestamp = createLocalDate(999, 6, 1).getTime();

        expect(fileMatchesDateFilterTokens({ created: 0, modified: timestamp, defaultField: 'modified' }, tokens)).toBe(true);
        expect(
            fileMatchesDateFilterTokens({ created: 0, modified: createLocalDate(1000, 0, 1).getTime(), defaultField: 'modified' }, tokens)
        ).toBe(false);
    });

    it('matches @c: filters against created timestamps', () => {
        const tokens = parseFilterSearchTokens('@c:2026-02-04');
        const createdTimestamp = new Date(2026, 1, 4, 9, 0, 0).getTime();
        const modifiedTimestamp = new Date(2026, 1, 6, 9, 0, 0).getTime();

        expect(
            fileMatchesDateFilterTokens({ created: createdTimestamp, modified: modifiedTimestamp, defaultField: 'modified' }, tokens)
        ).toBe(true);
    });

    it('excludes timestamps that match -@ ranges', () => {
        const tokens = parseFilterSearchTokens('-@2026-02-04');
        const timestamp = new Date(2026, 1, 4, 12, 0, 0).getTime();

        expect(fileMatchesDateFilterTokens({ created: 0, modified: timestamp, defaultField: 'modified' }, tokens)).toBe(false);
        expect(
            fileMatchesDateFilterTokens(
                { created: 0, modified: new Date(2026, 1, 5, 12, 0, 0).getTime(), defaultField: 'modified' },
                tokens
            )
        ).toBe(true);
    });
});
