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

import React from 'react';
import { App, TFile } from 'obsidian';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ShortcutsContextValue } from '../../src/context/ShortcutsContext';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import { NavigationPaneItemType } from '../../src/types';
import { ShortcutType } from '../../src/types/shortcuts';
import type { NavigationPaneSourceState } from '../../src/hooks/navigationPane/data/useNavigationPaneSourceState';
import {
    useNavigationPaneListSections,
    type NavigationPaneListSectionsResult
} from '../../src/hooks/navigationPane/data/useNavigationPaneListSections';
import { createHiddenTagVisibility } from '../../src/utils/tagPrefixMatcher';

interface TestVaultRegistration {
    registerFile(file: TFile): void;
}

type HydratedShortcuts = ShortcutsContextValue['hydratedShortcuts'];

function createSourceState(): NavigationPaneSourceState {
    const hiddenTagVisibility = createHiddenTagVisibility([], false);

    return {
        effectiveFrontmatterExclusions: [],
        hiddenFolders: [],
        descendantExcludedFolders: [],
        hiddenTags: [],
        hiddenFileProperties: [],
        hiddenFileNames: [],
        hiddenFileTags: [],
        fileVisibility: DEFAULT_SETTINGS.vaultProfiles[0].fileVisibility,
        navigationBannerPath: null,
        folderCountFileNameMatcher: null,
        hiddenFilePropertyMatcher: { hasCriteria: false, matches: () => false },
        rootFolders: [],
        tagTree: new Map(),
        propertyTree: new Map(),
        untaggedCount: 0,
        visibleTaggedCount: 0,
        hiddenTagMatcher: hiddenTagVisibility.matcher,
        hiddenMatcherHasRules: false,
        visibleTagTree: new Map(),
        hasRootPropertyShortcut: false,
        tagComparator: undefined,
        hiddenRootTagNodes: new Map(),
        tagTreeForOrdering: new Map(),
        rootTagOrderMap: new Map(),
        missingRootTagPaths: [],
        propertyKeyComparator: (a, b) => a.name.localeCompare(b.name),
        rootPropertyOrderMap: new Map(),
        missingRootPropertyKeys: [],
        visiblePropertyNavigationKeySet: new Set(),
        metadataDecorationVersion: 0,
        metadataVisibilityVersion: 0,
        tagDataVersion: 0,
        propertyDataVersion: 0,
        getFolderSortName: folder => folder.name,
        folderExclusionByFolderNote: undefined,
        recentNotesHiddenFileMatcher: () => false,
        fileChangeVersion: 0,
        folderChangeVersion: 0
    };
}

function createNoteShortcut(note: TFile): HydratedShortcuts[number] {
    return {
        key: `note:${note.path}`,
        shortcut: { type: ShortcutType.NOTE, path: note.path },
        folder: null,
        note,
        search: null,
        tagPath: null,
        propertyNodeId: null,
        isMissing: false
    };
}

function renderListSections(params: {
    files: TFile[];
    recentNotes: string[];
    hydratedShortcuts: HydratedShortcuts;
    recentNotesExpanded?: boolean;
    settings?: Partial<NotebookNavigatorSettings>;
}): NavigationPaneListSectionsResult {
    const app = new App();
    const vault = app.vault as unknown as TestVaultRegistration;
    params.files.forEach(file => vault.registerFile(file));

    let result: NavigationPaneListSectionsResult | null = null;
    function Harness() {
        result = useNavigationPaneListSections({
            app,
            settings: { ...DEFAULT_SETTINGS, showShortcuts: true, showRecentNotes: true, ...params.settings },
            sourceState: createSourceState(),
            hydratedShortcuts: params.hydratedShortcuts,
            recentNotes: params.recentNotes,
            shortcutsExpanded: false,
            recentNotesExpanded: params.recentNotesExpanded ?? true,
            pinShortcuts: false,
            propertiesSectionActive: false
        });
        return null;
    }

    renderToStaticMarkup(React.createElement(Harness));
    if (!result) {
        throw new Error('Expected list sections result');
    }
    return result;
}

function getRecentNotePaths(result: NavigationPaneListSectionsResult): string[] {
    return result.recentNotesItems.flatMap(item => (item.type === NavigationPaneItemType.RECENT_NOTE ? [item.note.path] : []));
}

describe('useNavigationPaneListSections recent files', () => {
    const board = new TFile('Projects/Board.base');
    const plan = new TFile('Projects/Plan.md');
    const files = [board, plan];
    const recentNotes = [board.path, plan.path];

    it('leaves notes that are shortcuts out of recent files while shortcuts are collapsed', () => {
        const result = renderListSections({ files, recentNotes, hydratedShortcuts: [createNoteShortcut(board)] });

        expect(getRecentNotePaths(result)).toEqual(['Projects/Plan.md']);
    });

    it('shows a stored recent note again once it has no shortcut', () => {
        const result = renderListSections({ files, recentNotes, hydratedShortcuts: [] });

        expect(getRecentNotePaths(result)).toEqual(['Projects/Board.base', 'Projects/Plan.md']);
    });

    it('keeps notes that are shortcuts in recent files when the shortcuts section is hidden', () => {
        const result = renderListSections({
            files,
            recentNotes,
            hydratedShortcuts: [createNoteShortcut(board)],
            settings: { showShortcuts: false }
        });

        expect(getRecentNotePaths(result)).toEqual(['Projects/Board.base', 'Projects/Plan.md']);
    });

    it('marks a collapsed recent files header as empty when every recent note is a shortcut', () => {
        const result = renderListSections({
            files,
            recentNotes: [board.path],
            hydratedShortcuts: [createNoteShortcut(board)],
            recentNotesExpanded: false
        });

        expect(result.recentNotesItems).toHaveLength(1);
        expect(result.recentNotesItems[0]).toMatchObject({ type: NavigationPaneItemType.VIRTUAL_FOLDER, hasChildren: false });
    });
});
