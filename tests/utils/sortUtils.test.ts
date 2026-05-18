import { describe, expect, it } from 'vitest';
import {
    appendPropertySortKey,
    areListSortOverridesEqual,
    compareByAlphaSortOrder,
    getEffectiveListSort,
    getEffectiveSortOption,
    getListSortToolbarIconId,
    getMatchingPropertySortKey,
    getPropertySortValueFromRecord,
    getSortIcon,
    parsePropertySortKeys,
    pruneUnavailablePropertySortOverrides,
    replacePropertySortKey,
    resolveFolderChildSortOrder,
    sortFiles,
    shouldRefreshOnFileModifyForSort,
    shouldRefreshOnMetadataChangeForSort
} from '../../src/utils/sortUtils';
import type { AlphaSortOrder } from '../../src/settings';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { ItemType, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID } from '../../src/types';
import { buildPropertyKeyNodeId, buildPropertyValueNodeId } from '../../src/utils/propertyTree';
import { createTestTFile } from './createTestTFile';

function createFolderSortSettings(folderSortOrder: AlphaSortOrder, overrides: Record<string, AlphaSortOrder> = {}) {
    return {
        folderSortOrder,
        folderTreeSortOverrides: overrides
    };
}

describe('sortFiles', () => {
    it('sorts by file name (A on top / Z on top)', () => {
        const files = [
            createTestTFile('z/file10.md'),
            createTestTFile('z/file2.md'),
            createTestTFile('z/file1.md'),
            createTestTFile('z/file001.md')
        ];

        sortFiles(
            files,
            'filename-asc',
            () => 0,
            () => 0
        );
        expect(files.map(file => file.basename)).toEqual(['file1', 'file001', 'file2', 'file10']);

        sortFiles(
            files,
            'filename-desc',
            () => 0,
            () => 0
        );
        expect(files.map(file => file.basename)).toEqual(['file10', 'file2', 'file1', 'file001']);
    });

    it('uses path as a deterministic tie-breaker', () => {
        const files = [createTestTFile('b/dup.md'), createTestTFile('a/dup.md')];

        sortFiles(
            files,
            'filename-asc',
            () => 0,
            () => 0
        );

        expect(files.map(file => file.path)).toEqual(['a/dup.md', 'b/dup.md']);
    });

    it('sorts by property then title (A on top)', () => {
        const propertyValueByPath = new Map<string, string | null>([
            ['z/with-b.md', 'b'],
            ['z/with-a.md', 'a'],
            ['z/with-a2.md', 'a'],
            ['z/missing-z.md', null],
            ['z/missing-m.md', null]
        ]);

        const files = [
            createTestTFile('z/missing-z.md'),
            createTestTFile('z/with-b.md'),
            createTestTFile('z/missing-m.md'),
            createTestTFile('z/with-a2.md'),
            createTestTFile('z/with-a.md')
        ];

        sortFiles(
            files,
            'property-asc',
            () => 0,
            () => 0,
            file => file.basename,
            file => propertyValueByPath.get(file.path) ?? null
        );

        expect(files.map(file => file.basename)).toEqual(['with-a', 'with-a2', 'with-b', 'missing-m', 'missing-z']);
    });

    it('sorts property values using natural comparison', () => {
        const propertyValueByPath = new Map<string, string | null>([
            ['z/with-10.md', '10'],
            ['z/with-2.md', '2'],
            ['z/with-1.md', '1']
        ]);

        const files = [createTestTFile('z/with-10.md'), createTestTFile('z/with-2.md'), createTestTFile('z/with-1.md')];

        sortFiles(
            files,
            'property-asc',
            () => 0,
            () => 0,
            file => file.basename,
            file => propertyValueByPath.get(file.path) ?? null
        );
        expect(files.map(file => file.basename)).toEqual(['with-1', 'with-2', 'with-10']);

        sortFiles(
            files,
            'property-desc',
            () => 0,
            () => 0,
            file => file.basename,
            file => propertyValueByPath.get(file.path) ?? null
        );
        expect(files.map(file => file.basename)).toEqual(['with-10', 'with-2', 'with-1']);
    });

    it('sorts by property then title (Z on top)', () => {
        const propertyValueByPath = new Map<string, string | null>([
            ['z/with-b.md', 'b'],
            ['z/with-a.md', 'a'],
            ['z/missing-a.md', null],
            ['z/missing-z.md', null]
        ]);

        const files = [
            createTestTFile('z/missing-a.md'),
            createTestTFile('z/with-a.md'),
            createTestTFile('z/missing-z.md'),
            createTestTFile('z/with-b.md')
        ];

        sortFiles(
            files,
            'property-desc',
            () => 0,
            () => 0,
            file => file.basename,
            file => propertyValueByPath.get(file.path) ?? null
        );

        expect(files.map(file => file.basename)).toEqual(['with-b', 'with-a', 'missing-z', 'missing-a']);
    });

    it('sorts by property then created date when configured', () => {
        const propertyValueByPath = new Map<string, string | null>([
            ['z/one.md', 'a'],
            ['z/two.md', 'a'],
            ['z/three.md', 'a']
        ]);
        const createdTimeByPath = new Map<string, number>([
            ['z/one.md', 10],
            ['z/two.md', 30],
            ['z/three.md', 20]
        ]);

        const files = [createTestTFile('z/two.md'), createTestTFile('z/three.md'), createTestTFile('z/one.md')];

        sortFiles(
            files,
            'property-asc',
            file => createdTimeByPath.get(file.path) ?? 0,
            () => 0,
            file => file.basename,
            file => propertyValueByPath.get(file.path) ?? null,
            'created'
        );

        expect(files.map(file => file.basename)).toEqual(['one', 'three', 'two']);

        sortFiles(
            files,
            'property-desc',
            file => createdTimeByPath.get(file.path) ?? 0,
            () => 0,
            file => file.basename,
            file => propertyValueByPath.get(file.path) ?? null,
            'created'
        );

        expect(files.map(file => file.basename)).toEqual(['two', 'three', 'one']);
    });

    it('sorts by property then file name when configured', () => {
        const propertyValueByPath = new Map<string, string | null>([
            ['z/a.md', 'a'],
            ['z/b.md', 'a']
        ]);
        const displayNameByPath = new Map<string, string>([
            ['z/a.md', 'zebra'],
            ['z/b.md', 'alpha']
        ]);

        const files = [createTestTFile('z/b.md'), createTestTFile('z/a.md')];

        sortFiles(
            files,
            'property-asc',
            () => 0,
            () => 0,
            file => displayNameByPath.get(file.path) ?? file.basename,
            file => propertyValueByPath.get(file.path) ?? null,
            'filename'
        );

        expect(files.map(file => file.basename)).toEqual(['a', 'b']);
    });
});

describe('sort icons', () => {
    it('uses the sort option direction', () => {
        expect(getSortIcon('modified-desc')).toBe('lucide-sort-desc');
        expect(getSortIcon('modified-asc')).toBe('lucide-sort-asc');
        expect(getSortIcon('created-desc')).toBe('lucide-sort-desc');
        expect(getSortIcon('created-asc')).toBe('lucide-sort-asc');
        expect(getSortIcon('title-asc')).toBe('lucide-sort-asc');
        expect(getSortIcon('title-desc')).toBe('lucide-sort-desc');
        expect(getSortIcon('property-asc')).toBe('lucide-sort-asc');
        expect(getSortIcon('property-desc')).toBe('lucide-sort-desc');
    });

    it('uses direction icons for default and direction-only overrides', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.defaultFolderSort = 'modified-desc';

        expect(getListSortToolbarIconId(settings)).toBe('list-sort-descending');
        expect(getListSortToolbarIconId(settings, 'modified-asc')).toBe('list-sort-ascending');
    });

    it('uses field icons when an override matches the default sort', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.defaultFolderSort = 'modified-desc';

        expect(getListSortToolbarIconId(settings, 'modified-desc')).toBe('list-sort-modified');

        settings.defaultFolderSort = 'created-asc';
        expect(getListSortToolbarIconId(settings, 'created-asc')).toBe('list-sort-created');
    });

    it('uses field icons when the override changes the sort field', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.defaultFolderSort = 'modified-desc';

        expect(getListSortToolbarIconId(settings, 'created-desc')).toBe('list-sort-created');
        expect(getListSortToolbarIconId(settings, 'title-asc')).toBe('list-sort-title');
        expect(getListSortToolbarIconId(settings, 'filename-asc')).toBe('list-sort-filename');
        expect(getListSortToolbarIconId(settings, 'property-asc')).toBe('list-sort-property');

        settings.defaultFolderSort = 'created-desc';
        expect(getListSortToolbarIconId(settings, 'modified-desc')).toBe('list-sort-modified');
    });

    it('uses property icons when the property sort key changes', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.defaultFolderSort = 'property-asc';
        settings.propertySortKey = 'status, priority';

        expect(getListSortToolbarIconId(settings)).toBe('list-sort-ascending');
        expect(getListSortToolbarIconId(settings, { option: 'property-desc', propertyKey: 'status' })).toBe('list-sort-descending');
        expect(getListSortToolbarIconId(settings, { option: 'property-asc', propertyKey: 'status' })).toBe('list-sort-property');
        expect(getListSortToolbarIconId(settings, { option: 'property-desc', propertyKey: 'priority' })).toBe('list-sort-property');
    });
});

describe('sort refresh triggers', () => {
    it('detects when file modify events should refresh sorted results', () => {
        expect(shouldRefreshOnFileModifyForSort('modified-desc', 'title')).toBe(true);
        expect(shouldRefreshOnFileModifyForSort('property-asc', 'modified')).toBe(true);
        expect(shouldRefreshOnFileModifyForSort('property-desc', 'title')).toBe(false);
        expect(shouldRefreshOnFileModifyForSort('title-asc', 'modified')).toBe(false);
    });

    it('detects when metadata change events should refresh sorted results', () => {
        expect(
            shouldRefreshOnMetadataChangeForSort({
                sortOption: 'title-asc',
                propertySortKey: '',
                propertySortSecondary: 'created',
                useFrontmatterMetadata: true,
                frontmatterNameField: '',
                frontmatterCreatedField: '',
                frontmatterModifiedField: ''
            })
        ).toBe(false);

        expect(
            shouldRefreshOnMetadataChangeForSort({
                sortOption: 'title-asc',
                propertySortKey: '',
                propertySortSecondary: 'created',
                useFrontmatterMetadata: true,
                frontmatterNameField: 'title',
                frontmatterCreatedField: '',
                frontmatterModifiedField: ''
            })
        ).toBe(true);

        expect(
            shouldRefreshOnMetadataChangeForSort({
                sortOption: 'created-desc',
                propertySortKey: '',
                propertySortSecondary: 'created',
                useFrontmatterMetadata: true,
                frontmatterNameField: '',
                frontmatterCreatedField: 'created',
                frontmatterModifiedField: ''
            })
        ).toBe(true);

        expect(
            shouldRefreshOnMetadataChangeForSort({
                sortOption: 'created-desc',
                propertySortKey: '',
                propertySortSecondary: 'created',
                useFrontmatterMetadata: false,
                frontmatterNameField: '',
                frontmatterCreatedField: 'created',
                frontmatterModifiedField: ''
            })
        ).toBe(false);

        expect(
            shouldRefreshOnMetadataChangeForSort({
                sortOption: 'modified-asc',
                propertySortKey: '',
                propertySortSecondary: 'created',
                useFrontmatterMetadata: true,
                frontmatterNameField: '',
                frontmatterCreatedField: '',
                frontmatterModifiedField: 'modified'
            })
        ).toBe(true);

        expect(
            shouldRefreshOnMetadataChangeForSort({
                sortOption: 'property-asc',
                propertySortKey: 'order',
                propertySortSecondary: 'title',
                useFrontmatterMetadata: false,
                frontmatterNameField: '',
                frontmatterCreatedField: '',
                frontmatterModifiedField: ''
            })
        ).toBe(true);

        expect(
            shouldRefreshOnMetadataChangeForSort({
                sortOption: 'property-asc',
                propertySortKey: '',
                propertySortSecondary: 'created',
                useFrontmatterMetadata: true,
                frontmatterNameField: '',
                frontmatterCreatedField: '',
                frontmatterModifiedField: ''
            })
        ).toBe(false);

        expect(
            shouldRefreshOnMetadataChangeForSort({
                sortOption: 'property-asc',
                propertySortKey: '',
                propertySortSecondary: 'created',
                useFrontmatterMetadata: true,
                frontmatterNameField: '',
                frontmatterCreatedField: 'created',
                frontmatterModifiedField: ''
            })
        ).toBe(true);

        expect(
            shouldRefreshOnMetadataChangeForSort({
                sortOption: 'property-asc',
                propertySortKey: '',
                propertySortSecondary: 'modified',
                useFrontmatterMetadata: true,
                frontmatterNameField: '',
                frontmatterCreatedField: '',
                frontmatterModifiedField: ''
            })
        ).toBe(false);

        expect(
            shouldRefreshOnMetadataChangeForSort({
                sortOption: 'property-asc',
                propertySortKey: '',
                propertySortSecondary: 'modified',
                useFrontmatterMetadata: true,
                frontmatterNameField: '',
                frontmatterCreatedField: '',
                frontmatterModifiedField: 'modified'
            })
        ).toBe(true);

        expect(
            shouldRefreshOnMetadataChangeForSort({
                sortOption: 'property-asc',
                propertySortKey: '',
                propertySortSecondary: 'modified',
                useFrontmatterMetadata: false,
                frontmatterNameField: '',
                frontmatterCreatedField: 'created',
                frontmatterModifiedField: 'modified'
            })
        ).toBe(false);

        expect(
            shouldRefreshOnMetadataChangeForSort({
                sortOption: 'property-asc',
                propertySortKey: '',
                propertySortSecondary: 'title',
                useFrontmatterMetadata: true,
                frontmatterNameField: '',
                frontmatterCreatedField: '',
                frontmatterModifiedField: ''
            })
        ).toBe(false);

        expect(
            shouldRefreshOnMetadataChangeForSort({
                sortOption: 'property-asc',
                propertySortKey: '',
                propertySortSecondary: 'title',
                useFrontmatterMetadata: true,
                frontmatterNameField: 'title',
                frontmatterCreatedField: '',
                frontmatterModifiedField: ''
            })
        ).toBe(true);

        expect(
            shouldRefreshOnMetadataChangeForSort({
                sortOption: 'property-asc',
                propertySortKey: '',
                propertySortSecondary: 'title',
                useFrontmatterMetadata: false,
                frontmatterNameField: 'title',
                frontmatterCreatedField: '',
                frontmatterModifiedField: ''
            })
        ).toBe(false);
    });
});

describe('folder child sort order', () => {
    it('compares names using natural order and configured direction', () => {
        expect(compareByAlphaSortOrder('folder2', 'folder10', 'alpha-asc')).toBeLessThan(0);
        expect(compareByAlphaSortOrder('folder2', 'folder10', 'alpha-desc')).toBeGreaterThan(0);
    });

    it('resolves child order from global folder sort setting', () => {
        const settings = createFolderSortSettings('alpha-desc');
        expect(resolveFolderChildSortOrder(settings, 'projects')).toBe('alpha-desc');
    });

    it('resolves child order from folder override when present', () => {
        const settings = createFolderSortSettings('alpha-asc', {
            projects: 'alpha-desc'
        });
        expect(resolveFolderChildSortOrder(settings, 'projects')).toBe('alpha-desc');
    });

    it('resolves root child order from root override when present', () => {
        const settings = createFolderSortSettings('alpha-asc', {
            '/': 'alpha-desc'
        });
        expect(resolveFolderChildSortOrder(settings, '/')).toBe('alpha-desc');
    });
});

describe('getEffectiveSortOption', () => {
    it('returns a property-specific sort override for selected property nodes', () => {
        const propertyNodeId = buildPropertyKeyNodeId('status');
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.defaultFolderSort = 'modified-desc';
        settings.propertySortOverrides = {
            [propertyNodeId]: 'title-asc'
        };

        const effective = getEffectiveSortOption(settings, ItemType.PROPERTY, null, null, propertyNodeId);
        expect(effective).toBe('title-asc');
    });

    it('returns default sort when property selection has no override', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.defaultFolderSort = 'created-asc';
        settings.propertySortOverrides = {};

        const effective = getEffectiveSortOption(settings, ItemType.PROPERTY, null, null, buildPropertyKeyNodeId('status'));
        expect(effective).toBe('created-asc');
    });

    it('supports a custom sort override on the properties root selection', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.defaultFolderSort = 'modified-desc';
        settings.propertySortOverrides = {
            [PROPERTIES_ROOT_VIRTUAL_FOLDER_ID]: 'filename-asc'
        };

        const effective = getEffectiveSortOption(settings, ItemType.PROPERTY, null, null, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID);
        expect(effective).toBe('filename-asc');
    });
});

describe('property sort keys', () => {
    it('parses comma-separated property sort keys', () => {
        expect(parsePropertySortKeys('published, downloaded, Published, , clipped')).toEqual(['published', 'downloaded', 'clipped']);
    });

    it('appends property sort keys without duplicating configured keys', () => {
        expect(appendPropertySortKey('published, downloaded', 'index')).toBe('published, downloaded, index');
        expect(appendPropertySortKey('published, downloaded', ' Downloaded ')).toBe('published, downloaded');
        expect(appendPropertySortKey('a, b , c', 'B')).toBe('a, b, c');
    });

    it('matches configured property sort keys case-insensitively', () => {
        expect(getMatchingPropertySortKey('published, downloaded', 'Downloaded')).toBe('downloaded');
        expect(getMatchingPropertySortKey('published, downloaded', 'index')).toBe('');
    });

    it('extracts property sort values from nested scalar arrays', () => {
        expect(getPropertySortValueFromRecord({ order: ['one', [2, true], null] }, 'order')).toBe('one 2 true');
        expect(getPropertySortValueFromRecord({ order: [] }, 'order')).toBe(null);
    });

    it('ignores invalid property sort key values', () => {
        expect(parsePropertySortKeys(['published'])).toEqual([]);
    });

    it('replaces and removes property sort keys with the same list normalization', () => {
        expect(replacePropertySortKey('published, STATUS, downloaded, State', 'status', 'State')).toBe('published, State, downloaded');
        expect(replacePropertySortKey('published, STATUS, downloaded', 'status', null)).toBe('published, downloaded');
    });

    it('uses the selected override property key when sorting by property', () => {
        const propertyNodeId = buildPropertyKeyNodeId('status');
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertySortKey = 'published, downloaded';
        settings.propertySortOverrides = {
            [propertyNodeId]: { option: 'property-desc', propertyKey: 'downloaded' }
        };

        const effective = getEffectiveListSort(settings, ItemType.PROPERTY, null, null, propertyNodeId);

        expect(effective).toEqual({
            option: 'property-desc',
            propertyKey: 'downloaded',
            propertySortSecondary: settings.propertySortSecondary
        });
    });

    it('matches override property keys to configured keys case-insensitively', () => {
        const propertyNodeId = buildPropertyKeyNodeId('status');
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertySortKey = 'published, downloaded';
        settings.propertySortOverrides = {
            [propertyNodeId]: { option: 'property-desc', propertyKey: 'Downloaded' }
        };

        const effective = getEffectiveListSort(settings, ItemType.PROPERTY, null, null, propertyNodeId);

        expect(effective.propertyKey).toBe('downloaded');
    });

    it('falls back to the first configured key when the saved override key is no longer configured', () => {
        const propertyNodeId = buildPropertyKeyNodeId('status');
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertySortKey = 'published';
        settings.propertySortOverrides = {
            [propertyNodeId]: { option: 'property-desc', propertyKey: 'downloaded' }
        };

        const effective = getEffectiveListSort(settings, ItemType.PROPERTY, null, null, propertyNodeId);

        expect(effective.propertyKey).toBe('published');
    });

    it('uses the first configured property key for legacy property sort overrides', () => {
        const propertyNodeId = buildPropertyKeyNodeId('status');
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertySortKey = 'published, downloaded';
        settings.propertySortOverrides = {
            [propertyNodeId]: 'property-asc'
        };

        const effective = getEffectiveListSort(settings, ItemType.PROPERTY, null, null, propertyNodeId);

        expect(effective.propertyKey).toBe('published');
    });

    it('uses the manual sort property even when it is not a property sort key', () => {
        const propertyNodeId = buildPropertyKeyNodeId('status');
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertySortKey = 'published, downloaded';
        settings.manualSortPropertyKey = 'sort_index';
        settings.propertySortOverrides = {
            [propertyNodeId]: { option: 'property-asc', propertyKey: 'Sort_Index' }
        };

        const effective = getEffectiveListSort(settings, ItemType.PROPERTY, null, null, propertyNodeId);

        expect(effective.propertyKey).toBe('sort_index');
        expect(effective.option).toBe('property-asc');
    });

    it('compares saved override property keys case-insensitively', () => {
        expect(
            areListSortOverridesEqual({ option: 'property-asc', propertyKey: 'Status' }, { option: 'property-asc', propertyKey: 'status' })
        ).toBe(true);
    });

    it('removes sort overrides that target unavailable property sort keys', () => {
        const statusNodeId = buildPropertyKeyNodeId('status');
        const statusValueNodeId = buildPropertyValueNodeId('status', 'todo');
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertySortKey = 'status, downloaded';
        settings.folderSortOverrides = {
            Books: { option: 'property-asc', propertyKey: 'Published' },
            Notes: { option: 'property-desc', propertyKey: 'Status' },
            Archive: 'title-asc'
        };
        settings.tagSortOverrides = {
            clips: { option: 'property-desc', propertyKey: 'downloaded' }
        };
        settings.propertySortOverrides = {
            [statusNodeId]: { option: 'property-asc', propertyKey: 'published' },
            [statusValueNodeId]: { option: 'property-desc', propertyKey: 'Status' }
        };

        const changed = pruneUnavailablePropertySortOverrides(settings);

        expect(changed).toBe(true);
        expect(settings.folderSortOverrides.Books).toBeUndefined();
        expect(settings.folderSortOverrides.Notes).toEqual({ option: 'property-desc', propertyKey: 'Status' });
        expect(settings.folderSortOverrides.Archive).toBe('title-asc');
        expect(settings.tagSortOverrides.clips).toEqual({ option: 'property-desc', propertyKey: 'downloaded' });
        expect(settings.propertySortOverrides[statusNodeId]).toBeUndefined();
        expect(settings.propertySortOverrides[statusValueNodeId]).toEqual({ option: 'property-desc', propertyKey: 'Status' });
    });

    it('removes legacy property sort overrides only when no property sort keys remain', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertySortKey = '';
        settings.folderSortOverrides = {
            Books: 'property-asc',
            Archive: 'title-asc'
        };

        const changed = pruneUnavailablePropertySortOverrides(settings);

        expect(changed).toBe(true);
        expect(settings.folderSortOverrides.Books).toBeUndefined();
        expect(settings.folderSortOverrides.Archive).toBe('title-asc');
    });

    it('keeps manual sort overrides when the manual property is not configured for property sort', () => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.propertySortKey = '';
        settings.manualSortPropertyKey = 'sort_index';
        settings.folderSortOverrides = {
            Books: 'property-asc',
            Manual: { option: 'property-asc', propertyKey: 'Sort_Index' }
        };

        const changed = pruneUnavailablePropertySortOverrides(settings);

        expect(changed).toBe(true);
        expect(settings.folderSortOverrides.Books).toBeUndefined();
        expect(settings.folderSortOverrides.Manual).toEqual({ option: 'property-asc', propertyKey: 'Sort_Index' });
    });
});
