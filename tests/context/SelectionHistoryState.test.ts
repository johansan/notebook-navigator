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
import { App, TFile, TFolder } from 'obsidian';
import { selectionReducer } from '../../src/context/selection/state';
import type { SelectionState } from '../../src/context/selection/types';
import { buildPropertyValueNodeId } from '../../src/utils/propertyTree';

function createFolder(path: string, parent: TFolder | null = null): TFolder {
    const folder = new TFolder();
    folder.path = path;
    folder.name = path === '/' ? '/' : (path.split('/').pop() ?? path);
    folder.parent = parent;
    folder.children = [];
    return folder;
}

function createFile(path: string, parent: TFolder): TFile {
    const file = new TFile();
    const fileName = path.split('/').pop() ?? path;
    const extensionIndex = fileName.lastIndexOf('.');
    file.path = path;
    file.name = fileName;
    file.basename = extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);
    file.extension = extensionIndex === -1 ? '' : fileName.slice(extensionIndex + 1);
    file.parent = parent;
    file.stat = { ctime: 0, mtime: 0, size: 0 };
    return file;
}

function createSelectionState(rootFolder: TFolder): SelectionState {
    return {
        selectionType: 'folder',
        selectedFolder: rootFolder,
        selectedTag: null,
        selectedProperty: null,
        selectedFiles: new Set<string>(),
        anchorIndex: null,
        lastMovementDirection: null,
        isRevealOperation: false,
        isFolderChangeWithAutoSelect: false,
        isKeyboardNavigation: false,
        isFolderNavigation: false,
        selectedFile: null,
        revealSource: null,
        navigationHistory: [
            {
                type: 'folder',
                value: rootFolder.path
            }
        ],
        navigationHistoryIndex: 0
    };
}

describe('selectionReducer navigation history', () => {
    it('drops forward history when a new folder is selected after moving back', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const beta = createFolder('Beta', root);
        const gamma = createFolder('Gamma', root);

        const initialState = createSelectionState(root);
        const alphaState = selectionReducer(initialState, { type: 'SET_SELECTED_FOLDER', folder: alpha });
        const betaState = selectionReducer(alphaState, { type: 'SET_SELECTED_FOLDER', folder: beta });
        const backState = selectionReducer(betaState, {
            type: 'SET_SELECTED_FOLDER',
            folder: alpha,
            historyIndex: 1
        });
        const gammaState = selectionReducer(backState, { type: 'SET_SELECTED_FOLDER', folder: gamma });

        expect(backState.navigationHistory.map(entry => entry.value)).toEqual(['/', 'Alpha', 'Beta']);
        expect(backState.navigationHistoryIndex).toBe(1);
        expect(gammaState.navigationHistory.map(entry => entry.value)).toEqual(['/', 'Alpha', 'Gamma']);
        expect(gammaState.navigationHistoryIndex).toBe(2);
    });

    it('records auto reveals in navigation history', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const beta = createFolder('Beta', root);
        const file = createFile('Beta/note.md', beta);

        const initialState = createSelectionState(root);
        const alphaState = selectionReducer(initialState, { type: 'SET_SELECTED_FOLDER', folder: alpha });
        const revealedState = selectionReducer(alphaState, {
            type: 'REVEAL_FILE',
            file,
            targetFolder: beta,
            source: 'auto'
        });

        expect(revealedState.selectedFolder?.path).toBe('Beta');
        expect(revealedState.navigationHistory.map(entry => entry.value)).toEqual(['/', 'Alpha', 'Beta']);
        expect(revealedState.navigationHistoryIndex).toBe(2);
    });

    it('replaces the current history entry for startup reveals', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const beta = createFolder('Beta', root);
        const file = createFile('Beta/note.md', beta);

        const initialState = createSelectionState(root);
        const alphaState = selectionReducer(initialState, { type: 'SET_SELECTED_FOLDER', folder: alpha });
        const revealedState = selectionReducer(alphaState, {
            type: 'REVEAL_FILE',
            file,
            targetFolder: beta,
            source: 'startup'
        });

        expect(revealedState.selectedFolder?.path).toBe('Beta');
        expect(revealedState.navigationHistory.map(entry => entry.value)).toEqual(['/', 'Beta']);
        expect(revealedState.navigationHistoryIndex).toBe(1);
    });

    it('caps history by dropping the oldest entries', () => {
        const root = createFolder('/');
        let state = createSelectionState(root);

        for (let index = 1; index <= 105; index += 1) {
            state = selectionReducer(state, {
                type: 'SET_SELECTED_FOLDER',
                folder: createFolder(`Folder-${index}`, root)
            });
        }

        expect(state.navigationHistory).toHaveLength(100);
        expect(state.navigationHistory[0]?.value).toBe('Folder-6');
        expect(state.navigationHistory[99]?.value).toBe('Folder-105');
        expect(state.navigationHistoryIndex).toBe(99);
    });

    it('keeps the current folder context when only the selected file changes', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const file = createFile('Alpha/note.md', alpha);

        const initialState = createSelectionState(root);
        const folderState = selectionReducer(initialState, { type: 'SET_SELECTED_FOLDER', folder: alpha });
        const selectedFileState = selectionReducer(folderState, { type: 'SET_SELECTED_FILE', file });

        expect(selectedFileState.selectionType).toBe('folder');
        expect(selectedFileState.selectedFolder?.path).toBe('Alpha');
        expect(selectedFileState.selectedTag).toBeNull();
        expect(selectedFileState.selectedProperty).toBeNull();
        expect(selectedFileState.selectedFile?.path).toBe('Alpha/note.md');
    });

    it('keeps the current tag context when only the selected file changes', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const file = createFile('Alpha/note.md', alpha);

        const initialState = createSelectionState(root);
        const tagState = selectionReducer(initialState, { type: 'SET_SELECTED_TAG', tag: 'work/projects' });
        const selectedFileState = selectionReducer(tagState, { type: 'SET_SELECTED_FILE', file });

        expect(selectedFileState.selectionType).toBe('tag');
        expect(selectedFileState.selectedFolder).toBeNull();
        expect(selectedFileState.selectedTag).toBe('work/projects');
        expect(selectedFileState.selectedProperty).toBeNull();
        expect(selectedFileState.selectedFile?.path).toBe('Alpha/note.md');
    });

    it('keeps the current property context when only the selected file changes', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const file = createFile('Alpha/note.md', alpha);
        const propertyNodeId = buildPropertyValueNodeId('status', 'done');

        const initialState = createSelectionState(root);
        const propertyState = selectionReducer(initialState, {
            type: 'SET_SELECTED_PROPERTY',
            nodeId: propertyNodeId
        });
        const selectedFileState = selectionReducer(propertyState, { type: 'SET_SELECTED_FILE', file });

        expect(selectedFileState.selectionType).toBe('property');
        expect(selectedFileState.selectedFolder).toBeNull();
        expect(selectedFileState.selectedTag).toBeNull();
        expect(selectedFileState.selectedProperty).toBe(propertyNodeId);
        expect(selectedFileState.selectedFile?.path).toBe('Alpha/note.md');
    });

    it('sets the selected file set without changing the current navigation context', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const firstFile = createFile('Alpha/first.md', alpha);
        const secondFile = createFile('Alpha/second.md', alpha);

        const initialState = createSelectionState(root);
        const folderState = selectionReducer(initialState, { type: 'SET_SELECTED_FOLDER', folder: alpha });
        const selectedState = selectionReducer(
            {
                ...folderState,
                anchorIndex: 3,
                lastMovementDirection: 'down'
            },
            {
                type: 'SET_FILE_SELECTION',
                files: [firstFile, secondFile],
                selectedFile: secondFile
            }
        );

        expect(selectedState.selectionType).toBe('folder');
        expect(selectedState.selectedFolder?.path).toBe('Alpha');
        expect(Array.from(selectedState.selectedFiles)).toEqual(['Alpha/first.md', 'Alpha/second.md']);
        expect(selectedState.selectedFile?.path).toBe('Alpha/second.md');
        expect(selectedState.anchorIndex).toBeNull();
        expect(selectedState.lastMovementDirection).toBeNull();
    });

    it('applies a computed file selection without changing the current navigation context', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const firstFile = createFile('Alpha/first.md', alpha);
        const secondFile = createFile('Alpha/second.md', alpha);
        const selectedFiles = new Set([firstFile.path, secondFile.path]);

        const initialState = createSelectionState(root);
        const folderState = selectionReducer(initialState, { type: 'SET_SELECTED_FOLDER', folder: alpha });
        const selectedState = selectionReducer(
            {
                ...folderState,
                anchorIndex: 3,
                lastMovementDirection: 'down'
            },
            {
                type: 'APPLY_FILE_SELECTION',
                selectedFiles,
                selectedFile: secondFile
            }
        );

        selectedFiles.clear();

        expect(selectedState.selectionType).toBe('folder');
        expect(selectedState.selectedFolder?.path).toBe('Alpha');
        expect(Array.from(selectedState.selectedFiles)).toEqual(['Alpha/first.md', 'Alpha/second.md']);
        expect(selectedState.selectedFile?.path).toBe('Alpha/second.md');
        expect(selectedState.anchorIndex).toBe(3);
        expect(selectedState.lastMovementDirection).toBeNull();
    });

    it('applies a computed file selection with movement state', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const firstFile = createFile('Alpha/first.md', alpha);
        const secondFile = createFile('Alpha/second.md', alpha);

        const initialState = createSelectionState(root);
        const selectedState = selectionReducer(
            {
                ...initialState,
                selectedFiles: new Set([firstFile.path]),
                selectedFile: firstFile,
                anchorIndex: 3
            },
            {
                type: 'APPLY_FILE_SELECTION',
                selectedFiles: new Set([secondFile.path]),
                selectedFile: secondFile,
                anchorIndex: null,
                lastMovementDirection: 'up'
            }
        );

        expect(Array.from(selectedState.selectedFiles)).toEqual(['Alpha/second.md']);
        expect(selectedState.selectedFile?.path).toBe('Alpha/second.md');
        expect(selectedState.anchorIndex).toBeNull();
        expect(selectedState.lastMovementDirection).toBe('up');
    });

    it('clears the reveal flag without changing the revealed selection', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const file = createFile('Alpha/note.md', alpha);

        const initialState = createSelectionState(root);
        const revealedState = selectionReducer(initialState, {
            type: 'REVEAL_FILE',
            file,
            targetFolder: alpha,
            source: 'manual'
        });
        const clearedState = selectionReducer(revealedState, { type: 'CLEAR_REVEAL_OPERATION' });

        expect(revealedState.isRevealOperation).toBe(true);
        expect(clearedState.isRevealOperation).toBe(false);
        expect(clearedState.selectedFolder?.path).toBe('Alpha');
        expect(clearedState.selectedFile?.path).toBe('Alpha/note.md');
        expect(clearedState.revealSource).toBe('manual');
        expect(clearedState.navigationHistory).toEqual(revealedState.navigationHistory);
        expect(clearedState.navigationHistoryIndex).toBe(revealedState.navigationHistoryIndex);
    });

    it('ignores deleted-file cleanup when the deleted file is not selected', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const selectedFile = createFile('Alpha/selected.md', alpha);

        const initialState = createSelectionState(root);
        const selectedState = selectionReducer(initialState, { type: 'SET_SELECTED_FILE', file: selectedFile });
        const cleanupState = selectionReducer(selectedState, {
            type: 'CLEANUP_DELETED_FILE',
            deletedPath: 'Alpha/deleted.md',
            nextFileToSelect: null
        });

        expect(cleanupState).toBe(selectedState);
    });
});

describe('selectionReducer CLEANUP_MOVED_FILES', () => {
    function createApp(files: TFile[]): App {
        const app = new App();
        const filesByPath = new Map(files.map(file => [file.path, file]));
        Object.assign(app.vault, {
            getFileByPath(path: string): TFile | null {
                return filesByPath.get(path) ?? null;
            }
        });
        return app;
    }

    it('removes moved-out files whether the selection holds their old or new path and keeps the rest', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const beta = createFolder('Beta', root);
        const primary = createFile('Alpha/primary.md', alpha);
        const kept = createFile('Alpha/kept.md', alpha);
        const rewritten = createFile('Alpha/rewritten.md', alpha);

        const initialState = createSelectionState(root);
        const selectedState = selectionReducer(initialState, {
            type: 'SET_FILE_SELECTION',
            files: [primary, kept, rewritten],
            selectedFile: primary
        });
        // The rename listener already rewrote one path; the other still holds the pre-move path.
        const pathUpdatedState = selectionReducer(selectedState, {
            type: 'UPDATE_FILE_PATH',
            oldPath: 'Alpha/rewritten.md',
            newPath: 'Beta/rewritten.md'
        });
        // Obsidian rewrites TFile.path in place during a rename.
        primary.path = 'Beta/primary.md';
        primary.parent = beta;
        rewritten.path = 'Beta/rewritten.md';
        rewritten.parent = beta;
        const app = createApp([primary, kept, rewritten]);

        const cleanedState = selectionReducer(
            pathUpdatedState,
            {
                type: 'CLEANUP_MOVED_FILES',
                movedFiles: [
                    { file: primary, originalPath: 'Alpha/primary.md', inCurrentList: false },
                    { file: rewritten, originalPath: 'Alpha/rewritten.md', inCurrentList: false }
                ]
            },
            app
        );

        expect(Array.from(cleanedState.selectedFiles)).toEqual(['Alpha/kept.md']);
        expect(cleanedState.selectedFile).toBe(kept);
    });

    it('re-keys retained moved files before choosing the new primary', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const archive = createFolder('Alpha/Archive', alpha);
        const primary = createFile('Alpha/primary.md', alpha);
        const retained = createFile('Alpha/retained.md', alpha);

        const initialState = createSelectionState(root);
        const selectedState = selectionReducer(initialState, {
            type: 'SET_FILE_SELECTION',
            files: [primary, retained],
            selectedFile: primary
        });
        // No rename notification has arrived yet: the selection still holds both pre-move paths, and the
        // vault only knows the files under their new paths.
        primary.path = 'Alpha/Archive/primary.md';
        primary.parent = archive;
        retained.path = 'Alpha/Archive/retained.md';
        retained.parent = archive;
        const app = createApp([primary, retained]);

        const cleanedState = selectionReducer(
            selectedState,
            {
                type: 'CLEANUP_MOVED_FILES',
                movedFiles: [
                    { file: primary, originalPath: 'Alpha/primary.md', inCurrentList: false },
                    { file: retained, originalPath: 'Alpha/retained.md', inCurrentList: true }
                ]
            },
            app
        );

        expect(Array.from(cleanedState.selectedFiles)).toEqual(['Alpha/Archive/retained.md']);
        expect(cleanedState.selectedFile).toBe(retained);

        // A late rename notification for the retained file is then a no-op.
        const lateRenameState = selectionReducer(cleanedState, {
            type: 'UPDATE_FILE_PATH',
            oldPath: 'Alpha/retained.md',
            newPath: 'Alpha/Archive/retained.md'
        });
        expect(Array.from(lateRenameState.selectedFiles)).toEqual(['Alpha/Archive/retained.md']);
        expect(lateRenameState.selectedFile).toBe(retained);
    });

    it('clears the primary file and anchor when every selected file left the list', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const moved = createFile('Alpha/moved.md', alpha);
        const alsoMoved = createFile('Alpha/also-moved.md', alpha);
        const app = createApp([moved, alsoMoved]);

        const initialState = createSelectionState(root);
        const primaryState = selectionReducer(initialState, { type: 'SET_SELECTED_FILE', file: moved });
        const selectedState = selectionReducer(primaryState, { type: 'TOGGLE_FILE_SELECTION', file: alsoMoved, anchorIndex: 3 });
        expect(selectedState.anchorIndex).toBe(3);
        expect(selectedState.selectedFile).toBe(moved);

        const cleanedState = selectionReducer(
            selectedState,
            {
                type: 'CLEANUP_MOVED_FILES',
                movedFiles: [
                    { file: moved, originalPath: 'Alpha/moved.md', inCurrentList: false },
                    { file: alsoMoved, originalPath: 'Alpha/also-moved.md', inCurrentList: false }
                ]
            },
            app
        );

        expect(cleanedState.selectedFiles.size).toBe(0);
        expect(cleanedState.selectedFile).toBeNull();
        expect(cleanedState.anchorIndex).toBeNull();
    });

    it('returns the same state when no selected file was moved', () => {
        const root = createFolder('/');
        const alpha = createFolder('Alpha', root);
        const kept = createFile('Alpha/kept.md', alpha);
        const other = createFile('Alpha/other.md', alpha);
        const app = createApp([kept, other]);

        const initialState = createSelectionState(root);
        const selectedState = selectionReducer(initialState, { type: 'SET_SELECTED_FILE', file: kept });
        const cleanedState = selectionReducer(
            selectedState,
            {
                type: 'CLEANUP_MOVED_FILES',
                movedFiles: [{ file: other, originalPath: 'Alpha/other.md', inCurrentList: false }]
            },
            app
        );

        expect(cleanedState).toBe(selectedState);
    });
});
