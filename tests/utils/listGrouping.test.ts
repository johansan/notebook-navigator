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
import {
    createPropertyGroupingOption,
    getPropertyGroupingOrder,
    getPropertyGroupingKey,
    normalizeListNoteGroupingOption
} from '../../src/settings/types';
import { ItemType } from '../../src/types';
import { buildPropertyKeyNodeId } from '../../src/utils/propertyTree';
import {
    areListGroupingOptionsEqual,
    areListGroupingOptionsSameKind,
    hasEffectiveCustomListGroupingForSelection,
    pruneUnavailablePropertyGroupingOverrides,
    reconcileDefaultNoteGrouping,
    resolveEffectiveListGroupingForSort,
    resolveListGrouping,
    resolveListGroupingOverrideForDefault,
    resolvePropertyGroupingDirection,
    updateDefaultNoteGroupingKey,
    updatePropertyGroupKeySetting,
    updatePropertyGroupingOverrideKeys
} from '../../src/utils/listGrouping';

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
    it('uses no grouping when property sort would otherwise use date grouping', () => {
        expect(
            resolveEffectiveListGroupingForSort({
                groupBy: 'date',
                sortOption: 'property-asc',
                selectionType: ItemType.FOLDER
            })
        ).toBe('none');
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

    it('uses no grouping for property-sorted tag and property views', () => {
        expect(
            resolveEffectiveListGroupingForSort({
                groupBy: 'date',
                sortOption: 'property-asc',
                selectionType: ItemType.TAG
            })
        ).toBe('none');
        expect(
            resolveEffectiveListGroupingForSort({
                groupBy: 'date',
                sortOption: 'property-asc',
                selectionType: ItemType.PROPERTY
            })
        ).toBe('none');
    });

    it('keeps custom grouping with property sort', () => {
        expect(
            resolveEffectiveListGroupingForSort({
                groupBy: 'custom',
                sortOption: 'property-asc',
                selectionType: ItemType.TAG
            })
        ).toBe('custom');
    });

    it('uses no grouping when date grouping is paired with a non-date sort', () => {
        expect(
            resolveEffectiveListGroupingForSort({
                groupBy: 'date',
                sortOption: 'title-asc',
                selectionType: ItemType.FOLDER
            })
        ).toBe('none');
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

    it('keeps property grouping under every sort and selection type', () => {
        const groupBy = createPropertyGroupingOption('status', 'asc');
        (['modified-desc', 'title-asc', 'property-asc'] as const).forEach(sortOption => {
            expect(
                resolveEffectiveListGroupingForSort({
                    groupBy,
                    sortOption,
                    selectionType: ItemType.FOLDER
                })
            ).toBe(groupBy);
        });
        expect(
            resolveEffectiveListGroupingForSort({
                groupBy,
                sortOption: 'property-asc',
                selectionType: ItemType.TAG
            })
        ).toBe(groupBy);
    });

    it('locks manual sort to custom groups even with property grouping', () => {
        expect(
            resolveEffectiveListGroupingForSort({
                groupBy: createPropertyGroupingOption('status', 'asc'),
                sortOption: 'property-asc',
                selectionType: ItemType.FOLDER,
                isManualSortActive: true
            })
        ).toBe('custom');
    });
});

describe('property grouping option encoding', () => {
    it('extracts trimmed property keys from encoded options', () => {
        expect(getPropertyGroupingKey('property:status')).toBe('status');
        expect(getPropertyGroupingKey('property: status ')).toBe('status');
        expect(getPropertyGroupingKey('property-desc:status')).toBe('status');
        expect(getPropertyGroupingKey('property:')).toBeNull();
        expect(getPropertyGroupingKey('folder')).toBeNull();
    });

    it('extracts the group order direction from the prefix', () => {
        expect(getPropertyGroupingOrder('property:status')).toBe('asc');
        expect(getPropertyGroupingOrder('property-desc:status')).toBe('desc');
        expect(getPropertyGroupingOrder('property-follow:status')).toBe('follow');
        expect(getPropertyGroupingOrder('folder')).toBeNull();
        expect(createPropertyGroupingOption('status', 'desc')).toBe('property-desc:status');
        expect(createPropertyGroupingOption('status', 'asc')).toBe('property:status');
        expect(createPropertyGroupingOption('status', 'follow')).toBe('property-follow:status');
    });

    it('keeps keys containing separator characters intact under both prefixes', () => {
        expect(getPropertyGroupingKey('property:-desc:odd')).toBe('-desc:odd');
        expect(getPropertyGroupingOrder('property:-desc:odd')).toBe('asc');
    });

    it('normalizes property grouping options to trimmed canonical form', () => {
        expect(normalizeListNoteGroupingOption('property: status ')).toBe('property:status');
        expect(normalizeListNoteGroupingOption('property-desc: status ')).toBe('property-desc:status');
        expect(normalizeListNoteGroupingOption('property:')).toBeNull();
        expect(normalizeListNoteGroupingOption('property-desc:')).toBeNull();
        expect(normalizeListNoteGroupingOption('none')).toBe('none');
        expect(normalizeListNoteGroupingOption('date')).toBe('date');
    });

    it('accepts property encodings for the vault-wide default grouping', () => {
        expect(normalizeListNoteGroupingOption('property:status')).toBe('property:status');
        expect(normalizeListNoteGroupingOption('property-desc:status')).toBe('property-desc:status');
        expect(normalizeListNoteGroupingOption('none')).toBe('none');
        expect(normalizeListNoteGroupingOption('folder')).toBe('folder');
        expect(normalizeListNoteGroupingOption('date')).toBe('date');
    });

    it('compares property grouping options case-insensitively including direction', () => {
        expect(areListGroupingOptionsEqual('property:Status', 'property:status')).toBe(true);
        expect(areListGroupingOptionsEqual('property:status', 'property-desc:status')).toBe(false);
        expect(areListGroupingOptionsEqual('property:status', 'property:genre')).toBe(false);
        expect(areListGroupingOptionsEqual('property:status', 'folder')).toBe(false);
        expect(areListGroupingOptionsEqual('date', 'date')).toBe(true);
    });

    it('matches grouping options of the same kind regardless of direction', () => {
        expect(areListGroupingOptionsSameKind('property:status', 'property-desc:Status')).toBe(true);
        expect(areListGroupingOptionsSameKind('property:status', 'property:genre')).toBe(false);
        expect(areListGroupingOptionsSameKind('date', 'date')).toBe(true);
        expect(areListGroupingOptionsSameKind('property:status', 'custom')).toBe(false);
    });

    it('retains a grouping override when only one component matches the default', () => {
        expect(resolveListGroupingOverrideForDefault('property:genre', 'property:status')).toBe('property:genre');
        expect(resolveListGroupingOverrideForDefault('property-desc:status', 'property:status')).toBe('property-desc:status');
    });

    it('removes a grouping override when the complete selection matches the default', () => {
        expect(resolveListGroupingOverrideForDefault('property:Status', 'property:status')).toBeUndefined();
        expect(resolveListGroupingOverrideForDefault('date', 'date')).toBeUndefined();
    });
});

describe('pruneUnavailablePropertyGroupingOverrides', () => {
    it('removes overrides for unregistered keys and keeps the rest', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertyGroupKey = 'status, genre';
        settings.folderAppearances.Projects = { groupBy: 'property:status' };
        settings.folderAppearances.Archive = { groupBy: 'property:removed' };
        settings.folderAppearances.Mixed = { groupBy: 'property:removed', mode: 'compact' };
        settings.tagAppearances.reading = { groupBy: 'date' };

        expect(pruneUnavailablePropertyGroupingOverrides(settings)).toBe(true);
        expect(settings.folderAppearances.Projects.groupBy).toBe('property:status');
        // Grouping-only records are dropped entirely; records with other fields keep those fields.
        expect(settings.folderAppearances.Archive).toBeUndefined();
        expect(settings.folderAppearances.Mixed).toEqual({ mode: 'compact' });
        expect(settings.tagAppearances.reading.groupBy).toBe('date');
    });

    it('removes overrides referencing the manual sort key', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertyGroupKey = `status, ${settings.manualSortPropertyKey}`;
        settings.folderAppearances.Projects = { groupBy: createPropertyGroupingOption(settings.manualSortPropertyKey, 'asc') };

        expect(pruneUnavailablePropertyGroupingOverrides(settings)).toBe(true);
        expect(settings.folderAppearances.Projects).toBeUndefined();
    });

    it('reports no change when every override is available', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertyGroupKey = 'status';
        settings.folderAppearances.Projects = { groupBy: 'property:Status' };

        expect(pruneUnavailablePropertyGroupingOverrides(settings)).toBe(false);
        expect(settings.folderAppearances.Projects.groupBy).toBe('property:Status');
    });
});

describe('updatePropertyGroupingOverrideKeys', () => {
    it('rewrites overrides after a property rename', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.folderAppearances.Projects = { groupBy: 'property:Status' };
        settings.tagAppearances.reading = { groupBy: 'date' };

        expect(updatePropertyGroupingOverrideKeys(settings, 'status', 'State')).toBe(true);
        expect(settings.folderAppearances.Projects.groupBy).toBe('property:State');
        expect(settings.tagAppearances.reading.groupBy).toBe('date');
    });

    it('preserves the group order direction across a rename', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.folderAppearances.Projects = { groupBy: 'property-desc:Status' };

        expect(updatePropertyGroupingOverrideKeys(settings, 'status', 'State')).toBe(true);
        expect(settings.folderAppearances.Projects.groupBy).toBe('property-desc:State');
    });

    it('removes overrides when the property is deleted', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.folderAppearances.Projects = { groupBy: 'property:status' };
        settings.folderAppearances.Mixed = { groupBy: 'property:status', mode: 'compact' };

        expect(updatePropertyGroupingOverrideKeys(settings, 'status', null)).toBe(true);
        // Grouping-only records are dropped entirely; records with other fields keep those fields.
        expect(settings.folderAppearances.Projects).toBeUndefined();
        expect(settings.folderAppearances.Mixed).toEqual({ mode: 'compact' });
    });
});

describe('hasEffectiveCustomListGroupingForSelection', () => {
    it('does not treat a non-date fallback as custom grouping', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'date';
        settings.defaultFolderSort = 'title-asc';

        expect(hasEffectiveCustomListGroupingForSelection(settings, ItemType.FOLDER, null)).toBe(false);
    });

    it('does not treat a selection sort fallback as custom grouping', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'date';
        settings.defaultFolderSort = 'modified-desc';
        settings.folderSortOverrides.Projects = 'title-asc';

        expect(hasEffectiveCustomListGroupingForSelection(settings, ItemType.FOLDER, 'Projects')).toBe(false);
        expect(hasEffectiveCustomListGroupingForSelection(settings, ItemType.FOLDER, 'Writing')).toBe(false);
    });

    it('keeps a tag sort fallback separate from custom grouping', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'folder';
        settings.defaultFolderSort = 'modified-desc';
        settings.tagAppearances.reading = { groupBy: 'date' };
        settings.tagSortOverrides.reading = 'title-asc';

        expect(hasEffectiveCustomListGroupingForSelection(settings, ItemType.TAG, 'reading')).toBe(false);
    });

    it('keeps a property sort fallback separate from custom grouping', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'folder';
        settings.defaultFolderSort = 'modified-desc';
        settings.propertySortOverrides['property:status:active'] = 'property-asc';

        expect(hasEffectiveCustomListGroupingForSelection(settings, ItemType.PROPERTY, 'property:status:active')).toBe(false);
    });

    it('detects an explicit custom grouping override', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'none';
        settings.defaultFolderSort = 'title-asc';
        settings.folderAppearances.Projects = { groupBy: 'custom' };

        expect(hasEffectiveCustomListGroupingForSelection(settings, ItemType.FOLDER, 'Projects')).toBe(true);
    });

    it('detects custom grouping forced by manual sorting', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'folder';
        settings.defaultFolderSort = 'property-asc';
        settings.propertySortKey = settings.manualSortPropertyKey;

        expect(hasEffectiveCustomListGroupingForSelection(settings, ItemType.FOLDER, null)).toBe(true);
    });

    it('detects manual sorting in an object override', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'folder';
        settings.defaultFolderSort = 'modified-desc';
        settings.folderSortOverrides.Projects = {
            option: 'property-desc',
            propertyKey: settings.manualSortPropertyKey
        };

        expect(hasEffectiveCustomListGroupingForSelection(settings, ItemType.FOLDER, 'Projects')).toBe(true);
    });

    it('does not treat alphabetical folder grouping as custom', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'folder';
        settings.defaultFolderSort = 'modified-desc';
        settings.folderSortOverrides.Projects = 'title-asc';

        expect(hasEffectiveCustomListGroupingForSelection(settings, ItemType.FOLDER, 'Projects')).toBe(false);
    });
});

describe('reconcileDefaultNoteGrouping', () => {
    it('keeps property groupings whose key is configured, matching case-insensitively', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertyGroupKey = 'Status, genre';
        settings.noteGrouping = 'property:status';

        expect(reconcileDefaultNoteGrouping(settings)).toEqual({ changed: false, reset: false });
        expect(settings.noteGrouping).toBe('property:status');
    });

    it('resets property groupings whose key is not configured', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertyGroupKey = 'genre';
        settings.noteGrouping = 'property-desc:status';

        expect(reconcileDefaultNoteGrouping(settings)).toEqual({ changed: true, reset: true });
        expect(settings.noteGrouping).toBe(DEFAULT_SETTINGS.noteGrouping);
    });

    it('resets property groupings referencing the manual sort key', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertyGroupKey = settings.manualSortPropertyKey;
        settings.noteGrouping = createPropertyGroupingOption(settings.manualSortPropertyKey, 'asc');

        expect(reconcileDefaultNoteGrouping(settings)).toEqual({ changed: true, reset: true });
        expect(settings.noteGrouping).toBe(DEFAULT_SETTINGS.noteGrouping);
    });

    it('leaves base grouping modes untouched', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'folder';

        expect(reconcileDefaultNoteGrouping(settings)).toEqual({ changed: false, reset: false });
        expect(settings.noteGrouping).toBe('folder');
    });
});

describe('updateDefaultNoteGroupingKey', () => {
    it('rewrites the default grouping key on rename and keeps the direction', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'property-desc:status';

        expect(updateDefaultNoteGroupingKey(settings, 'status', 'Stage')).toBe(true);
        expect(settings.noteGrouping).toBe('property-desc:Stage');
    });

    it('resets the default grouping when the key is deleted', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'property:status';

        expect(updateDefaultNoteGroupingKey(settings, 'status', null)).toBe(true);
        expect(settings.noteGrouping).toBe(DEFAULT_SETTINGS.noteGrouping);
    });

    it('ignores renames of other keys and base grouping modes', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.noteGrouping = 'property:status';

        expect(updateDefaultNoteGroupingKey(settings, 'genre', 'Stage')).toBe(false);
        expect(settings.noteGrouping).toBe('property:status');

        settings.noteGrouping = 'date';
        expect(updateDefaultNoteGroupingKey(settings, 'status', 'Stage')).toBe(false);
        expect(settings.noteGrouping).toBe('date');
    });
});

describe('resolvePropertyGroupingDirection', () => {
    it('borrows the sort direction for follow-sort group orders', () => {
        expect(resolvePropertyGroupingDirection('property-follow:status', 'modified-desc')).toBe('desc');
        expect(resolvePropertyGroupingDirection('property-follow:status', 'title-asc')).toBe('asc');
        expect(resolvePropertyGroupingDirection('property-follow:status', 'property-desc')).toBe('desc');
    });

    it('returns fixed group orders unchanged regardless of the sort direction', () => {
        expect(resolvePropertyGroupingDirection('property:status', 'modified-desc')).toBe('asc');
        expect(resolvePropertyGroupingDirection('property-desc:status', 'title-asc')).toBe('desc');
    });
});

describe('updatePropertyGroupKeySetting', () => {
    it('rewrites the configured grouping list on rename and removes the key on delete', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertyGroupKey = 'status, genre';

        expect(updatePropertyGroupKeySetting(settings, 'status', 'Stage')).toBe(true);
        expect(settings.propertyGroupKey).toBe('Stage, genre');

        expect(updatePropertyGroupKeySetting(settings, 'genre', null)).toBe(true);
        expect(settings.propertyGroupKey).toBe('Stage');
    });

    it('reports no change for unknown keys and empty lists', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertyGroupKey = 'status';

        expect(updatePropertyGroupKeySetting(settings, 'genre', 'Stage')).toBe(false);
        expect(settings.propertyGroupKey).toBe('status');

        settings.propertyGroupKey = '';
        expect(updatePropertyGroupKeySetting(settings, 'status', 'Stage')).toBe(false);
    });
});
