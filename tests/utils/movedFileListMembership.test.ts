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
import { App, TFile, TFolder } from 'obsidian';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings, VaultProfile } from '../../src/settings/types';
import { ItemType, type VisibilityPreferences } from '../../src/types';
import { FILE_VISIBILITY } from '../../src/utils/fileTypeUtils';
import { createMovedFileListMembershipCheck } from '../../src/utils/selectionUtils';
import { createTestTFile } from './createTestTFile';

vi.mock('../../src/storage/fileOperations', () => ({
    getDBInstanceOrNull: () => null
}));

function createSettings(profileOverrides: Partial<VaultProfile> = {}): NotebookNavigatorSettings {
    const profile = DEFAULT_SETTINGS.vaultProfiles[0];
    return {
        ...DEFAULT_SETTINGS,
        vaultProfile: profile.id,
        vaultProfiles: [
            {
                ...profile,
                fileVisibility: FILE_VISIBILITY.ALL,
                hiddenFolders: [],
                hiddenTags: [],
                hiddenFileNames: [],
                hiddenFileTags: [],
                hiddenFileProperties: [],
                ...profileOverrides
            }
        ]
    };
}

function createApp(files: TFile[]): App {
    const app = new App();
    const filesByPath = new Map(files.map(file => [file.path, file]));
    Reflect.set(app.vault, 'getFileByPath', (path: string) => filesByPath.get(path) ?? null);
    Reflect.set(app.vault, 'getAbstractFileByPath', (path: string) => filesByPath.get(path) ?? null);
    app.metadataCache.getFileCache = () => null;
    return app;
}

function createFolder(path: string, children: Array<TFile | TFolder>): TFolder {
    const folder = new TFolder() as TFolder & { children: Array<TFile | TFolder> };
    folder.path = path;
    folder.name = path.split('/').pop() ?? path;
    folder.children = children;
    children.forEach(child => {
        Reflect.set(child, 'parent', folder);
    });
    return folder;
}

const visibleOnly: VisibilityPreferences = { includeDescendantNotes: true, showHiddenItems: false };

describe('createMovedFileListMembershipCheck', () => {
    it('keeps a file moved within a folder scope and drops one moved into a hidden subfolder', () => {
        // Post-move vault layout: both notes already sit in their destination folders.
        const kept = createTestTFile('Inbox/Later/kept.md');
        const hidden = createTestTFile('Inbox/Archive/hidden.md');
        const later = createFolder('Inbox/Later', [kept]);
        const archive = createFolder('Inbox/Archive', [hidden]);
        const inbox = createFolder('Inbox', [later, archive]);
        const app = createApp([kept, hidden]);
        const settings = createSettings({ hiddenFolders: ['Archive'] });

        const isInList = createMovedFileListMembershipCheck(
            { selectionType: ItemType.FOLDER, selectedFolder: inbox },
            settings,
            visibleOnly,
            false,
            app
        );

        expect(isInList(kept)).toBe(true);
        expect(isInList(hidden)).toBe(false);
    });

    it('applies hidden file path and name rules in a tag scope', () => {
        const archived = createTestTFile('Archive/note.md');
        const renamed = createTestTFile('Work/note 1.md');
        const plain = createTestTFile('Work/note.md');
        const app = createApp([archived, renamed, plain]);
        const settings = createSettings({ hiddenFileNames: ['Archive/*', '* 1.md'] });

        const isInList = createMovedFileListMembershipCheck(
            { selectionType: ItemType.TAG, selectedTag: 'project' },
            settings,
            visibleOnly,
            false,
            app
        );

        expect(isInList(archived)).toBe(false);
        expect(isInList(renamed)).toBe(false);
        expect(isInList(plain)).toBe(true);
    });

    it('drops every moved file while a search is active', () => {
        const note = createTestTFile('Inbox/note.md');
        const inbox = createFolder('Inbox', [note]);
        const app = createApp([note]);

        const isInList = createMovedFileListMembershipCheck(
            { selectionType: ItemType.FOLDER, selectedFolder: inbox },
            createSettings(),
            visibleOnly,
            true,
            app
        );

        expect(isInList(note)).toBe(false);
    });
});
