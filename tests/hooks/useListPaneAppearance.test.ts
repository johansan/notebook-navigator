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
import {
    areStoredListPaneAppearanceFieldsEqual,
    getStoredListPaneAppearanceFields,
    hasStoredListPaneAppearanceOverride,
    mergeListPaneAppearanceAndGrouping,
    resolveListPaneAppearance,
    snapshotListPaneAppearanceMap,
    type FolderAppearance
} from '../../src/settings/listPaneAppearance';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import { ItemType } from '../../src/types';

function createSettings(overrides: Partial<NotebookNavigatorSettings> = {}): NotebookNavigatorSettings {
    return { ...structuredClone(DEFAULT_SETTINGS), ...overrides };
}

describe('resolveListPaneAppearance', () => {
    it('lets a selection hide globally shown content', () => {
        const settings = createSettings({
            showTags: true,
            showFileTags: true,
            showFileProperties: true,
            showFileTaskProgress: true,
            textCountDisplay: 'both'
        });
        const result = resolveListPaneAppearance({
            settings,
            appearance: {
                showFileTags: false,
                showFileProperties: false,
                showFileTaskProgress: false,
                showTextCount: false
            },
            selectionType: ItemType.FOLDER
        });

        expect(result).toMatchObject({
            showTags: false,
            showProperties: false,
            showTaskProgress: false,
            textCountDisplay: 'none'
        });
    });

    it('lets a selection enable content that global settings turn off', () => {
        const settings = createSettings({
            showTags: true,
            showFileTags: false,
            showFileProperties: false,
            showFileTaskProgress: false,
            textCountDisplay: 'none'
        });
        const result = resolveListPaneAppearance({
            settings,
            appearance: {
                showFileTags: true,
                showFileProperties: true,
                showFileTaskProgress: true,
                showTextCount: true
            },
            selectionType: ItemType.FOLDER
        });

        expect(result).toMatchObject({
            showTags: true,
            showProperties: true,
            showTaskProgress: true,
            textCountDisplay: 'words'
        });
    });

    it('shows the global count type when a selection enables counts', () => {
        const enabled = resolveListPaneAppearance({
            settings: createSettings({ textCountDisplay: 'characters' }),
            appearance: { showTextCount: true },
            selectionType: ItemType.FOLDER
        });
        const disabled = resolveListPaneAppearance({
            settings: createSettings({ textCountDisplay: 'characters' }),
            appearance: { showTextCount: false },
            selectionType: ItemType.FOLDER
        });

        expect(enabled.textCountDisplay).toBe('characters');
        expect(disabled.textCountDisplay).toBe('none');
    });

    it('keeps the master tag setting as a gate because tag content is not extracted without it', () => {
        const result = resolveListPaneAppearance({
            settings: createSettings({ showTags: false, showFileTags: false }),
            appearance: { showFileTags: true },
            selectionType: ItemType.TAG
        });

        expect(result.showTags).toBe(false);
    });

    it('applies compact mode gates without deleting stored Standard-mode preferences', () => {
        const result = resolveListPaneAppearance({
            settings: createSettings({
                defaultListMode: 'standard',
                showFilePreview: true,
                showFeatureImage: true,
                showFileDate: true,
                showFileTaskProgress: true
            }),
            appearance: { mode: 'compact', previewRows: 4, showFileTaskProgress: true },
            selectionType: ItemType.PROPERTY
        });

        expect(result).toMatchObject({
            mode: 'compact',
            previewRows: 4,
            showPreview: false,
            showImage: false,
            showDate: false,
            showTaskProgress: false
        });
    });

    it('keeps compact tag and property visibility as global style choices', () => {
        const result = resolveListPaneAppearance({
            settings: createSettings({
                defaultListMode: 'compact',
                showTags: true,
                showFileTags: false,
                showFileTagsInCompactMode: false,
                showFileProperties: false,
                showFilePropertiesInCompactMode: true
            }),
            appearance: { showFileTags: true, showFileProperties: true },
            selectionType: ItemType.FOLDER
        });

        expect(result.showTags).toBe(false);
        expect(result.showProperties).toBe(true);
    });

    it('gates property-placed counts when compact mode hides property pills', () => {
        const result = resolveListPaneAppearance({
            settings: createSettings({
                defaultListMode: 'compact',
                textCountDisplay: 'both',
                textCountPlacement: 'property',
                showFilePropertiesInCompactMode: false
            }),
            appearance: { showTextCount: true },
            selectionType: ItemType.FOLDER
        });

        expect(result.textCountDisplay).toBe('none');
    });
});

describe('stored list appearance intent', () => {
    it('retains both enabling and hiding toggles and drops invalid or unknown fields', () => {
        const stored = getStoredListPaneAppearanceFields({
            mode: 'standard',
            titleRows: 2,
            previewRows: 9,
            showFileTags: true,
            showTextCount: false,
            showFilePreview: false,
            textCountDisplay: 'both'
        } as FolderAppearance);

        expect(stored).toEqual({
            mode: 'standard',
            titleRows: 2,
            showFileTags: true,
            showTextCount: false
        });
        expect(hasStoredListPaneAppearanceOverride(stored ?? undefined)).toBe(true);
    });

    it('treats toggles stored with different values as different overrides', () => {
        expect(areStoredListPaneAppearanceFieldsEqual({ showFileTags: true }, { showFileTags: false })).toBe(false);
        expect(areStoredListPaneAppearanceFieldsEqual({ showFileTags: true }, { showFileTags: true })).toBe(true);
        expect(areStoredListPaneAppearanceFieldsEqual(undefined, { showFileTags: undefined })).toBe(true);
    });

    it('preserves grouping while resetting appearance fields', () => {
        expect(mergeListPaneAppearanceAndGrouping(null, 'folder')).toEqual({ groupBy: 'folder' });
        expect(mergeListPaneAppearanceAndGrouping(null, undefined)).toBeNull();
    });
});

describe('appearance map snapshots', () => {
    it('preserves map identity when an unrelated settings update leaves appearances unchanged', () => {
        const current = {
            Writing: { mode: 'standard', showTextCount: true }
        } satisfies Record<string, FolderAppearance>;
        const initialSnapshot = snapshotListPaneAppearanceMap(current);
        const nextSnapshot = snapshotListPaneAppearanceMap(current, initialSnapshot);

        expect(nextSnapshot).toBe(initialSnapshot);
        expect(nextSnapshot).not.toBe(current);
        expect(nextSnapshot.Writing).not.toBe(current.Writing);
    });

    it('publishes a new immutable snapshot after an in-place appearance mutation', () => {
        const current = {
            Writing: { mode: 'standard', showTextCount: true }
        } satisfies Record<string, FolderAppearance>;
        const initialSnapshot = snapshotListPaneAppearanceMap(current);

        current.Writing.showTextCount = false;
        const nextSnapshot = snapshotListPaneAppearanceMap(current, initialSnapshot);

        expect(nextSnapshot).not.toBe(initialSnapshot);
        expect(nextSnapshot.Writing.showTextCount).toBe(false);
        expect(initialSnapshot.Writing.showTextCount).toBe(true);
    });
});
