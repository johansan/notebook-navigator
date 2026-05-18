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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App, TFile } from 'obsidian';
import { PropertyOperations } from '../../src/services/PropertyOperations';
import type { NotebookNavigatorSettings } from '../../src/settings';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { createTestTFile } from '../utils/createTestTFile';
import { getActivePropertyFields, setActivePropertyFields } from '../../src/utils/vaultProfiles';
import { buildPropertyKeyNodeId, buildPropertyValueNodeId } from '../../src/utils/propertyTree';

class TestPropertyOperations extends PropertyOperations {
    public renameSettings(oldKeyNormalized: string, newKeyDisplay: string): Promise<void> {
        return this.updateSettingsAfterRename(oldKeyNormalized, newKeyDisplay);
    }

    public deleteSettings(normalizedKey: string): Promise<void> {
        return this.updateSettingsAfterDelete(normalizedKey);
    }

    public runRenameWorkflow(params: {
        oldKeyNormalized: string;
        oldKeyDisplay: string;
        newKeyDisplay: string;
        affectedPaths: Set<string>;
    }): Promise<boolean> {
        return this.runPropertyKeyRename(params);
    }

    public runDeleteWorkflow(params: { keyNodeName: string; normalizedKey: string; affectedPaths: Set<string> }): Promise<boolean> {
        return this.runPropertyKeyDelete(params);
    }

    public collectRenameConflicts(oldKeyNormalized: string, newKeyNormalized: string, affectedPaths: Set<string>): Set<string> {
        return this.collectRenameConflictPaths(oldKeyNormalized, newKeyNormalized, affectedPaths);
    }
}

describe('PropertyOperations settings updates', () => {
    let app: App;
    let settings: NotebookNavigatorSettings;
    let saveSettingsAndUpdate: ReturnType<typeof vi.fn>;
    let operations: TestPropertyOperations;

    beforeEach(() => {
        app = new App();
        settings = structuredClone(DEFAULT_SETTINGS);
        saveSettingsAndUpdate = vi.fn().mockResolvedValue(undefined);
        operations = new TestPropertyOperations(
            app,
            () => settings,
            async () => {
                await saveSettingsAndUpdate();
            },
            () => null
        );
    });

    it('renames propertyFields and propertySortKey on rename', async () => {
        setActivePropertyFields(settings, 'Status, priority');
        settings.propertySortKey = 'STATUS';
        settings.manualSortPropertyKey = 'STATUS';
        settings.manualSortGroupHeaderProperty = 'STATUS';

        await operations.renameSettings('status', 'State');

        expect(saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
        expect(getActivePropertyFields(settings)).toBe('State, priority');
        expect(settings.propertySortKey).toBe('State');
        expect(settings.manualSortPropertyKey).toBe('State');
        expect(settings.manualSortGroupHeaderProperty).toBe('State');
    });

    it('renames comma-separated propertySortKey entries and sort override property keys', async () => {
        setActivePropertyFields(settings, 'Status, priority');
        settings.propertySortKey = 'published, STATUS, downloaded';
        settings.folderSortOverrides = {
            Books: { option: 'property-asc', propertyKey: 'STATUS' }
        };
        settings.tagSortOverrides = {
            clips: { option: 'property-desc', propertyKey: 'downloaded' },
            reading: { option: 'property-desc', propertyKey: 'Status' }
        };

        await operations.renameSettings('status', 'State');

        expect(saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
        expect(settings.propertySortKey).toBe('published, State, downloaded');
        expect(settings.folderSortOverrides.Books).toEqual({ option: 'property-asc', propertyKey: 'State' });
        expect(settings.tagSortOverrides.clips).toEqual({ option: 'property-desc', propertyKey: 'downloaded' });
        expect(settings.tagSortOverrides.reading).toEqual({ option: 'property-desc', propertyKey: 'State' });
    });

    it('clears propertySortKey and removes propertyFields entries on delete', async () => {
        setActivePropertyFields(settings, 'State, priority');
        settings.propertySortKey = 'State';
        settings.manualSortPropertyKey = 'State';
        settings.manualSortGroupHeaderProperty = 'State';

        await operations.deleteSettings('state');

        expect(saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
        expect(getActivePropertyFields(settings)).toBe('priority');
        expect(settings.propertySortKey).toBe('');
        expect(settings.manualSortPropertyKey).toBe('');
        expect(settings.manualSortGroupHeaderProperty).toBe('');
    });

    it('removes deleted propertySortKey entries and matching sort overrides', async () => {
        setActivePropertyFields(settings, 'State, priority');
        settings.propertySortKey = 'published, State, downloaded';
        settings.folderSortOverrides = {
            Books: { option: 'property-asc', propertyKey: 'State' }
        };
        settings.tagSortOverrides = {
            clips: { option: 'property-desc', propertyKey: 'downloaded' }
        };

        await operations.deleteSettings('state');

        expect(saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
        expect(settings.propertySortKey).toBe('published, downloaded');
        expect(settings.folderSortOverrides.Books).toBeUndefined();
        expect(settings.tagSortOverrides.clips).toEqual({ option: 'property-desc', propertyKey: 'downloaded' });
    });

    it('does not save when rename makes no changes', async () => {
        setActivePropertyFields(settings, 'State, priority');
        settings.propertySortKey = 'State';

        await operations.renameSettings('status', 'State');

        expect(saveSettingsAndUpdate).toHaveBeenCalledTimes(0);
    });

    it('migrates property metadata records on key rename', async () => {
        const oldKeyNodeId = buildPropertyKeyNodeId('status');
        const oldValueNodeId = buildPropertyValueNodeId('status', 'todo');
        const newKeyNodeId = buildPropertyKeyNodeId('state');
        const newValueNodeId = buildPropertyValueNodeId('state', 'todo');

        settings.propertyColors = {
            [oldKeyNodeId]: '#111111',
            [newKeyNodeId]: '#999999'
        };
        settings.propertyBackgroundColors = {
            [oldValueNodeId]: '#222222'
        };
        settings.propertyIcons = {
            [oldValueNodeId]: 'lucide-check'
        };
        settings.propertySortOverrides = {
            [oldKeyNodeId]: 'title-asc'
        };
        settings.propertyAppearances = {
            [oldKeyNodeId]: { groupBy: 'date' }
        };
        settings.propertyTreeSortOverrides = {
            [oldKeyNodeId]: 'alpha-desc'
        };

        await operations.renameSettings('status', 'State');

        expect(saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
        expect(settings.propertyColors).toEqual({
            [newKeyNodeId]: '#111111'
        });
        expect(settings.propertyBackgroundColors).toEqual({
            [newValueNodeId]: '#222222'
        });
        expect(settings.propertyIcons).toEqual({
            [newValueNodeId]: 'lucide-check'
        });
        expect(settings.propertySortOverrides).toEqual({
            [newKeyNodeId]: 'title-asc'
        });
        expect(settings.propertyAppearances).toEqual({
            [newKeyNodeId]: { groupBy: 'date' }
        });
        expect(settings.propertyTreeSortOverrides).toEqual({
            [newKeyNodeId]: 'alpha-desc'
        });
    });

    it('removes property metadata records on key delete', async () => {
        const deletedKeyNodeId = buildPropertyKeyNodeId('status');
        const deletedValueNodeId = buildPropertyValueNodeId('status', 'todo');
        const keptKeyNodeId = buildPropertyKeyNodeId('priority');
        const keptValueNodeId = buildPropertyValueNodeId('priority', 'high');

        settings.propertyColors = {
            [deletedKeyNodeId]: '#111111',
            [keptKeyNodeId]: '#333333'
        };
        settings.propertyBackgroundColors = {
            [deletedValueNodeId]: '#222222',
            [keptValueNodeId]: '#444444'
        };
        settings.propertyIcons = {
            [deletedValueNodeId]: 'lucide-check',
            [keptValueNodeId]: 'lucide-flag'
        };
        settings.propertySortOverrides = {
            [deletedKeyNodeId]: 'title-asc',
            [keptKeyNodeId]: 'title-desc'
        };
        settings.propertyAppearances = {
            [deletedKeyNodeId]: { groupBy: 'date' },
            [keptKeyNodeId]: { groupBy: 'custom' }
        };
        settings.propertyTreeSortOverrides = {
            [deletedKeyNodeId]: 'alpha-desc',
            [keptKeyNodeId]: 'alpha-asc'
        };

        await operations.deleteSettings('status');

        expect(saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
        expect(settings.propertyColors).toEqual({
            [keptKeyNodeId]: '#333333'
        });
        expect(settings.propertyBackgroundColors).toEqual({
            [keptValueNodeId]: '#444444'
        });
        expect(settings.propertyIcons).toEqual({
            [keptValueNodeId]: 'lucide-flag'
        });
        expect(settings.propertySortOverrides).toEqual({
            [keptKeyNodeId]: 'title-desc'
        });
        expect(settings.propertyAppearances).toEqual({
            [keptKeyNodeId]: { groupBy: 'custom' }
        });
        expect(settings.propertyTreeSortOverrides).toEqual({
            [keptKeyNodeId]: 'alpha-asc'
        });
    });

    it('does not finalize rename when no markdown files are processed', async () => {
        setActivePropertyFields(settings, 'Status, priority');
        settings.propertySortKey = 'Status';

        const listener = vi.fn();
        const removeListener = operations.addPropertyKeyRenameListener(listener);

        const result = await operations.runRenameWorkflow({
            oldKeyNormalized: 'status',
            oldKeyDisplay: 'Status',
            newKeyDisplay: 'State',
            affectedPaths: new Set(['Missing.md'])
        });

        expect(result).toBe(true);
        expect(saveSettingsAndUpdate).toHaveBeenCalledTimes(0);
        expect(getActivePropertyFields(settings)).toBe('Status, priority');
        expect(settings.propertySortKey).toBe('Status');
        expect(listener).not.toHaveBeenCalled();

        removeListener();
    });

    it('does not finalize delete when no markdown files are processed', async () => {
        setActivePropertyFields(settings, 'State, priority');
        settings.propertySortKey = 'State';

        const listener = vi.fn();
        const removeListener = operations.addPropertyKeyDeleteListener(listener);

        const result = await operations.runDeleteWorkflow({
            keyNodeName: 'State',
            normalizedKey: 'state',
            affectedPaths: new Set(['Missing.md'])
        });

        expect(result).toBe(true);
        expect(saveSettingsAndUpdate).toHaveBeenCalledTimes(0);
        expect(getActivePropertyFields(settings)).toBe('State, priority');
        expect(settings.propertySortKey).toBe('State');
        expect(listener).not.toHaveBeenCalled();

        removeListener();
    });
});

describe('PropertyOperations rename conflict detection', () => {
    let app: App;
    let settings: NotebookNavigatorSettings;
    let saveSettingsAndUpdate: ReturnType<typeof vi.fn>;
    let operations: TestPropertyOperations;

    beforeEach(() => {
        app = new App();
        settings = structuredClone(DEFAULT_SETTINGS);
        saveSettingsAndUpdate = vi.fn().mockResolvedValue(undefined);
        operations = new TestPropertyOperations(
            app,
            () => settings,
            async () => {
                await saveSettingsAndUpdate();
            },
            () => null
        );
    });

    it('collects files that contain both source and destination keys', () => {
        const fileOne = createTestTFile('One.md');
        const fileTwo = createTestTFile('Two.md');
        const fileThree = createTestTFile('Three.md');

        const filesByPath = new Map<string, TFile>([
            [fileOne.path, fileOne],
            [fileTwo.path, fileTwo],
            [fileThree.path, fileThree]
        ]);
        app.vault.getAbstractFileByPath = (path: string) => filesByPath.get(path) ?? null;

        const frontmatterByPath = new Map<string, Record<string, unknown>>([
            [fileOne.path, { Status: 'todo' }],
            [fileTwo.path, { Status: 'todo', State: 'done' }],
            [fileThree.path, { status: 'todo' }]
        ]);

        app.metadataCache.getFileCache = (file: TFile) => {
            const frontmatter = frontmatterByPath.get(file.path);
            return frontmatter ? { frontmatter } : null;
        };

        const conflicts = operations.collectRenameConflicts('status', 'state', new Set([fileOne.path, fileTwo.path, fileThree.path]));

        expect(conflicts).toEqual(new Set(['Two.md']));
    });

    it('returns no conflicts for same normalized key rename', () => {
        const conflicts = operations.collectRenameConflicts('status', 'STATUS', new Set(['One.md', 'Two.md']));

        expect(conflicts).toEqual(new Set());
    });
});
