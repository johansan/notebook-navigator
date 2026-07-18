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
import type { NotebookNavigatorSettings } from '../../src/settings';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { ItemType } from '../../src/types';
import { buildPropertyKeyNodeId } from '../../src/utils/propertyTree';
import { hasEffectiveCustomListGrouping, resolveEffectiveListGroupingForSort, resolveListGrouping } from '../../src/utils/listGrouping';

type GroupingSettings = Pick<NotebookNavigatorSettings, 'noteGrouping' | 'folderAppearances' | 'tagAppearances' | 'propertyAppearances'>;

function createGroupingSettings(noteGrouping: GroupingSettings['noteGrouping']): GroupingSettings {
    return {
        noteGrouping,
        folderAppearances: {},
        tagAppearances: {},
        propertyAppearances: {}
    };
}

describe('resolveListGrouping property selections', () => {
    it('uses custom property grouping overrides when present', () => {
        const propertyNodeId = buildPropertyKeyNodeId('status');
        const settings = createGroupingSettings('custom');
        settings.propertyAppearances = {
            [propertyNodeId]: { groupBy: 'date' }
        };

        const result = resolveListGrouping({
            settings,
            selectionType: ItemType.PROPERTY,
            propertyNodeId
        });

        expect(result.defaultGrouping).toBe('custom');
        expect(result.effectiveGrouping).toBe('date');
        expect(result.normalizedOverride).toBe('date');
        expect(result.hasCustomOverride).toBe(true);
    });

    it('normalizes invalid folder grouping overrides for properties', () => {
        const propertyNodeId = buildPropertyKeyNodeId('status');
        const settings = createGroupingSettings('folder');
        settings.propertyAppearances = {
            [propertyNodeId]: { groupBy: 'folder' }
        };

        const result = resolveListGrouping({
            settings,
            selectionType: ItemType.PROPERTY,
            propertyNodeId
        });

        expect(result.defaultGrouping).toBe('date');
        expect(result.effectiveGrouping).toBe('date');
        expect(result.normalizedOverride).toBeUndefined();
        expect(result.hasCustomOverride).toBe(false);
    });

    it('falls back to normalized default grouping when no property override exists', () => {
        const settings = createGroupingSettings('folder');

        const result = resolveListGrouping({
            settings,
            selectionType: ItemType.PROPERTY,
            propertyNodeId: buildPropertyKeyNodeId('status')
        });

        expect(result.defaultGrouping).toBe('date');
        expect(result.effectiveGrouping).toBe('date');
        expect(result.normalizedOverride).toBeUndefined();
        expect(result.hasCustomOverride).toBe(false);
    });
});

describe('resolveEffectiveListGroupingForSort', () => {
    it('uses custom groups when property sort would otherwise use date grouping', () => {
        expect(
            resolveEffectiveListGroupingForSort({
                groupBy: 'date',
                sortOption: 'property-asc',
                selectionType: ItemType.FOLDER
            })
        ).toBe('custom');
    });

    it('keeps folder grouping for property-sorted folder views', () => {
        expect(
            resolveEffectiveListGroupingForSort({
                groupBy: 'folder',
                sortOption: 'property-asc',
                selectionType: ItemType.FOLDER
            })
        ).toBe('folder');
    });

    it('uses custom groups for property-sorted tag and property views', () => {
        expect(
            resolveEffectiveListGroupingForSort({
                groupBy: 'date',
                sortOption: 'property-asc',
                selectionType: ItemType.TAG
            })
        ).toBe('custom');
        expect(
            resolveEffectiveListGroupingForSort({
                groupBy: 'date',
                sortOption: 'property-asc',
                selectionType: ItemType.PROPERTY
            })
        ).toBe('custom');
    });

    it('uses custom groups when date grouping is paired with a non-date sort', () => {
        expect(
            resolveEffectiveListGroupingForSort({
                groupBy: 'date',
                sortOption: 'title-asc',
                selectionType: ItemType.FOLDER
            })
        ).toBe('custom');
    });

    it('keeps date grouping with date sorts', () => {
        expect(
            resolveEffectiveListGroupingForSort({
                groupBy: 'date',
                sortOption: 'modified-desc',
                selectionType: ItemType.FOLDER
            })
        ).toBe('date');
    });

    it('locks manual sort to custom groups', () => {
        expect(
            resolveEffectiveListGroupingForSort({
                groupBy: 'folder',
                sortOption: 'property-asc',
                selectionType: ItemType.FOLDER,
                isManualSortActive: true
            })
        ).toBe('custom');
    });
});

describe('hasEffectiveCustomListGrouping', () => {
    it('detects custom grouping forced by the default sort', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'date';
        settings.defaultFolderSort = 'title-asc';

        expect(hasEffectiveCustomListGrouping(settings)).toBe(true);
    });

    it('detects custom grouping forced by a selection sort override', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'date';
        settings.defaultFolderSort = 'modified-desc';
        settings.folderSortOverrides.Projects = 'title-asc';

        expect(hasEffectiveCustomListGrouping(settings)).toBe(true);
    });

    it('combines a tag appearance with its sort override', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'folder';
        settings.defaultFolderSort = 'modified-desc';
        settings.tagAppearances.reading = { groupBy: 'date' };
        settings.tagSortOverrides.reading = 'title-asc';

        expect(hasEffectiveCustomListGrouping(settings)).toBe(true);
    });

    it('detects custom grouping forced by a property sort override', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'folder';
        settings.defaultFolderSort = 'modified-desc';
        settings.propertySortOverrides['property:status:active'] = 'property-asc';

        expect(hasEffectiveCustomListGrouping(settings)).toBe(true);
    });

    it('detects custom grouping forced by manual sorting', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'folder';
        settings.defaultFolderSort = 'property-asc';
        settings.propertySortKey = settings.manualSortPropertyKey;

        expect(hasEffectiveCustomListGrouping(settings)).toBe(true);
    });

    it('detects manual sorting in an object override', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'folder';
        settings.defaultFolderSort = 'modified-desc';
        settings.folderSortOverrides.Projects = {
            option: 'property-desc',
            propertyKey: settings.manualSortPropertyKey
        };

        expect(hasEffectiveCustomListGrouping(settings)).toBe(true);
    });

    it('does not treat alphabetical folder grouping as custom', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'folder';
        settings.defaultFolderSort = 'modified-desc';
        settings.folderSortOverrides.Projects = 'title-asc';

        expect(hasEffectiveCustomListGrouping(settings)).toBe(false);
    });
});
