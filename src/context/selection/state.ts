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

import type { App, TFile, TFolder } from 'obsidian';
import { PROPERTIES_ROOT_VIRTUAL_FOLDER_ID } from '../../types';
import { normalizePropertyNodeId } from '../../utils/propertyTree';
import { normalizeTagPath } from '../../utils/tagUtils';
import type { SelectionAction, SelectionHistoryBehavior, SelectionHistoryEntry, SelectionRevealSource, SelectionState } from './types';

const MAX_NAVIGATION_HISTORY_ENTRIES = 100;

function createSelectedFilesSet(file?: TFile | null): Set<string> {
    const selectedFiles = new Set<string>();
    if (file) {
        selectedFiles.add(file.path);
    }
    return selectedFiles;
}

function normalizeSelectedPropertyNodeId(nodeId: SelectionState['selectedProperty']): SelectionState['selectedProperty'] {
    if (!nodeId || nodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
        return nodeId;
    }

    return normalizePropertyNodeId(nodeId) ?? nodeId;
}

function clampHistoryIndex(index: number, length: number): number {
    if (length <= 0) {
        return 0;
    }

    if (index < 0) {
        return 0;
    }

    if (index >= length) {
        return length - 1;
    }

    return index;
}

function areSelectionHistoryEntriesEqual(
    left: SelectionHistoryEntry | null | undefined,
    right: SelectionHistoryEntry | null | undefined
): boolean {
    if (!left || !right) {
        return false;
    }

    return left.type === right.type && left.value === right.value;
}

export function createSelectionHistoryEntry(params: {
    selectionType: SelectionState['selectionType'];
    selectedFolder: TFolder | null;
    selectedTag: string | null;
    selectedProperty: SelectionState['selectedProperty'];
}): SelectionHistoryEntry | null {
    if (params.selectionType === 'folder' && params.selectedFolder) {
        return {
            type: 'folder',
            value: params.selectedFolder.path
        };
    }

    if (params.selectionType === 'tag' && params.selectedTag) {
        const normalizedTag = normalizeTagPath(params.selectedTag);
        if (!normalizedTag) {
            return null;
        }

        return {
            type: 'tag',
            value: normalizedTag
        };
    }

    if (params.selectionType === 'property' && params.selectedProperty) {
        const normalizedProperty = normalizeSelectedPropertyNodeId(params.selectedProperty);
        if (!normalizedProperty) {
            return null;
        }

        return {
            type: 'property',
            value: normalizedProperty
        };
    }

    return null;
}

function dedupeAdjacentHistoryEntries(
    entries: SelectionHistoryEntry[],
    currentIndex: number
): { navigationHistory: SelectionHistoryEntry[]; navigationHistoryIndex: number } {
    const nextEntries = entries.slice();
    let nextIndex = clampHistoryIndex(currentIndex, nextEntries.length);

    if (nextEntries.length === 0) {
        return {
            navigationHistory: nextEntries,
            navigationHistoryIndex: 0
        };
    }

    if (nextIndex > 0 && areSelectionHistoryEntriesEqual(nextEntries[nextIndex], nextEntries[nextIndex - 1])) {
        nextEntries.splice(nextIndex, 1);
        nextIndex -= 1;
    }

    if (nextIndex < nextEntries.length - 1 && areSelectionHistoryEntriesEqual(nextEntries[nextIndex], nextEntries[nextIndex + 1])) {
        nextEntries.splice(nextIndex + 1, 1);
    }

    return limitSelectionHistoryEntries(nextEntries, nextIndex);
}

function limitSelectionHistoryEntries(
    entries: SelectionHistoryEntry[],
    currentIndex: number
): { navigationHistory: SelectionHistoryEntry[]; navigationHistoryIndex: number } {
    if (entries.length === 0) {
        return {
            navigationHistory: entries,
            navigationHistoryIndex: 0
        };
    }

    if (entries.length <= MAX_NAVIGATION_HISTORY_ENTRIES) {
        return {
            navigationHistory: entries,
            navigationHistoryIndex: clampHistoryIndex(currentIndex, entries.length)
        };
    }

    const overflowCount = entries.length - MAX_NAVIGATION_HISTORY_ENTRIES;
    const trimmedEntries = entries.slice(overflowCount);
    return {
        navigationHistory: trimmedEntries,
        navigationHistoryIndex: clampHistoryIndex(currentIndex - overflowCount, trimmedEntries.length)
    };
}

function updateSelectionHistory(
    state: SelectionState,
    nextEntry: SelectionHistoryEntry | null,
    historyBehavior?: SelectionHistoryBehavior,
    historyIndex?: number
): { navigationHistory: SelectionHistoryEntry[]; navigationHistoryIndex: number } {
    if (!nextEntry) {
        return {
            navigationHistory: state.navigationHistory,
            navigationHistoryIndex: state.navigationHistoryIndex
        };
    }

    const currentHistory = state.navigationHistory.length > 0 ? state.navigationHistory.slice() : [nextEntry];
    const currentIndex = clampHistoryIndex(state.navigationHistoryIndex, currentHistory.length);

    if (typeof historyIndex === 'number') {
        const targetIndex = clampHistoryIndex(historyIndex, currentHistory.length);
        currentHistory[targetIndex] = nextEntry;
        return dedupeAdjacentHistoryEntries(currentHistory, targetIndex);
    }

    const resolvedBehavior = historyBehavior ?? 'record';
    if (resolvedBehavior === 'skip') {
        return limitSelectionHistoryEntries(currentHistory, currentIndex);
    }

    if (resolvedBehavior === 'replace') {
        currentHistory[currentIndex] = nextEntry;
        return dedupeAdjacentHistoryEntries(currentHistory, currentIndex);
    }

    const currentEntry = currentHistory[currentIndex];
    if (areSelectionHistoryEntriesEqual(currentEntry, nextEntry)) {
        return limitSelectionHistoryEntries(currentHistory, currentIndex);
    }

    const nextHistory = currentHistory.slice(0, currentIndex + 1);
    nextHistory.push(nextEntry);
    return limitSelectionHistoryEntries(nextHistory, nextHistory.length - 1);
}

function withSingleSelection(
    state: SelectionState,
    params: {
        selectionType: SelectionState['selectionType'];
        selectedFolder: TFolder | null;
        selectedTag: string | null;
        selectedProperty: SelectionState['selectedProperty'];
        selectedFile: TFile | null;
        isRevealOperation: boolean;
        isFolderChangeWithAutoSelect: boolean;
        isKeyboardNavigation: boolean;
        isFolderNavigation: boolean;
        revealSource: SelectionRevealSource | null;
        historyBehavior?: SelectionHistoryBehavior;
        historyIndex?: number;
    }
): SelectionState {
    const nextHistoryEntry = createSelectionHistoryEntry({
        selectionType: params.selectionType,
        selectedFolder: params.selectedFolder,
        selectedTag: params.selectedTag,
        selectedProperty: params.selectedProperty
    });
    const { navigationHistory, navigationHistoryIndex } = updateSelectionHistory(
        state,
        nextHistoryEntry,
        params.historyBehavior,
        params.historyIndex
    );

    return {
        ...state,
        selectionType: params.selectionType,
        selectedFolder: params.selectedFolder,
        selectedTag: params.selectedTag,
        selectedProperty: params.selectedProperty,
        selectedFiles: createSelectedFilesSet(params.selectedFile),
        selectedFile: params.selectedFile,
        anchorIndex: null,
        lastMovementDirection: null,
        isRevealOperation: params.isRevealOperation,
        isFolderChangeWithAutoSelect: params.isFolderChangeWithAutoSelect,
        isKeyboardNavigation: params.isKeyboardNavigation,
        isFolderNavigation: params.isFolderNavigation,
        revealSource: params.revealSource,
        navigationHistory,
        navigationHistoryIndex
    };
}

export function getFirstSelectedFile(selectedFiles: ReadonlySet<string>, app: App): TFile | null {
    const iterator = selectedFiles.values().next();
    if (iterator.done) {
        return null;
    }

    const firstPath = iterator.value;
    if (!firstPath) {
        return null;
    }

    return app.vault.getFileByPath(firstPath) ?? null;
}

export function resolvePrimarySelectedFile(app: App, selectionState: Pick<SelectionState, 'selectedFile' | 'selectedFiles'>): TFile | null {
    if (selectionState.selectedFile) {
        return selectionState.selectedFile;
    }

    return getFirstSelectedFile(selectionState.selectedFiles, app);
}

export function selectionReducer(state: SelectionState, action: SelectionAction, app?: App): SelectionState {
    switch (action.type) {
        case 'SET_SELECTED_FOLDER':
            return withSingleSelection(state, {
                selectionType: 'folder',
                selectedFolder: action.folder,
                selectedTag: null,
                selectedProperty: null,
                selectedFile: action.autoSelectedFile ?? null,
                isRevealOperation: false,
                isFolderChangeWithAutoSelect: action.autoSelectedFile !== undefined && action.autoSelectedFile !== null,
                isKeyboardNavigation: false,
                isFolderNavigation: true,
                revealSource: action.source ?? null,
                historyBehavior: action.historyBehavior,
                historyIndex: action.historyIndex
            });

        case 'SET_SELECTED_TAG':
            return withSingleSelection(state, {
                selectionType: 'tag',
                selectedFolder: null,
                selectedTag: normalizeTagPath(action.tag),
                selectedProperty: null,
                selectedFile: action.autoSelectedFile ?? null,
                isRevealOperation: false,
                isFolderChangeWithAutoSelect: action.autoSelectedFile !== undefined && action.autoSelectedFile !== null,
                isKeyboardNavigation: false,
                isFolderNavigation: true,
                revealSource: action.source ?? null,
                historyBehavior: action.historyBehavior,
                historyIndex: action.historyIndex
            });

        case 'SET_SELECTED_PROPERTY':
            return withSingleSelection(state, {
                selectionType: 'property',
                selectedFolder: null,
                selectedTag: null,
                selectedProperty: normalizeSelectedPropertyNodeId(action.nodeId),
                selectedFile: action.autoSelectedFile ?? null,
                isRevealOperation: false,
                isFolderChangeWithAutoSelect: action.autoSelectedFile !== undefined && action.autoSelectedFile !== null,
                isKeyboardNavigation: false,
                isFolderNavigation: true,
                revealSource: action.source ?? null,
                historyBehavior: action.historyBehavior,
                historyIndex: action.historyIndex
            });

        case 'SET_SELECTED_FILE':
            return {
                ...state,
                selectedFiles: createSelectedFilesSet(action.file),
                selectedFile: action.file,
                anchorIndex: null,
                lastMovementDirection: null,
                isRevealOperation: false,
                isFolderChangeWithAutoSelect: false,
                isKeyboardNavigation: false,
                isFolderNavigation: false,
                revealSource: null
            };

        case 'SET_SELECTION_TYPE':
            return {
                ...state,
                selectionType: action.selectionType,
                isRevealOperation: false,
                isFolderChangeWithAutoSelect: false,
                isKeyboardNavigation: false,
                revealSource: null
            };

        case 'CLEAR_SELECTION':
            return {
                ...state,
                selectedFolder: null,
                selectedTag: null,
                selectedProperty: null,
                selectedFiles: new Set<string>(),
                selectedFile: null,
                anchorIndex: null,
                lastMovementDirection: null,
                isRevealOperation: false,
                isFolderChangeWithAutoSelect: false,
                isKeyboardNavigation: false,
                revealSource: null
            };

        case 'REVEAL_FILE': {
            if (!action.file.parent) {
                return state;
            }

            const normalizedTargetTag = action.targetTag === undefined ? undefined : normalizeTagPath(action.targetTag);
            const revealSource: SelectionRevealSource = action.source ?? (action.isManualReveal ? 'manual' : 'auto');
            const historyBehavior = action.historyBehavior ?? (revealSource === 'startup' ? 'replace' : 'record');
            const targetFolder = action.targetFolder ?? null;

            if (action.isManualReveal) {
                return withSingleSelection(state, {
                    selectionType: 'folder',
                    selectedFolder: targetFolder ?? action.file.parent,
                    selectedTag: null,
                    selectedProperty: null,
                    selectedFile: action.file,
                    isRevealOperation: true,
                    isFolderChangeWithAutoSelect: false,
                    isKeyboardNavigation: false,
                    isFolderNavigation: state.isFolderNavigation,
                    revealSource,
                    historyBehavior,
                    historyIndex: action.historyIndex
                });
            }

            if (normalizedTargetTag !== undefined) {
                if (normalizedTargetTag) {
                    return withSingleSelection(state, {
                        selectionType: 'tag',
                        selectedFolder: null,
                        selectedTag: normalizedTargetTag,
                        selectedProperty: null,
                        selectedFile: action.file,
                        isRevealOperation: true,
                        isFolderChangeWithAutoSelect: false,
                        isKeyboardNavigation: false,
                        isFolderNavigation: state.isFolderNavigation,
                        revealSource,
                        historyBehavior,
                        historyIndex: action.historyIndex
                    });
                }

                return withSingleSelection(state, {
                    selectionType: 'folder',
                    selectedFolder:
                        targetFolder ?? (action.preserveFolder && state.selectedFolder ? state.selectedFolder : action.file.parent),
                    selectedTag: null,
                    selectedProperty: null,
                    selectedFile: action.file,
                    isRevealOperation: true,
                    isFolderChangeWithAutoSelect: false,
                    isKeyboardNavigation: false,
                    isFolderNavigation: state.isFolderNavigation,
                    revealSource,
                    historyBehavior,
                    historyIndex: action.historyIndex
                });
            }

            if (action.targetProperty !== undefined) {
                if (action.targetProperty) {
                    return withSingleSelection(state, {
                        selectionType: 'property',
                        selectedFolder: null,
                        selectedTag: null,
                        selectedProperty: normalizeSelectedPropertyNodeId(action.targetProperty),
                        selectedFile: action.file,
                        isRevealOperation: true,
                        isFolderChangeWithAutoSelect: false,
                        isKeyboardNavigation: false,
                        isFolderNavigation: state.isFolderNavigation,
                        revealSource,
                        historyBehavior,
                        historyIndex: action.historyIndex
                    });
                }

                return withSingleSelection(state, {
                    selectionType: 'folder',
                    selectedFolder:
                        targetFolder ?? (action.preserveFolder && state.selectedFolder ? state.selectedFolder : action.file.parent),
                    selectedTag: null,
                    selectedProperty: null,
                    selectedFile: action.file,
                    isRevealOperation: true,
                    isFolderChangeWithAutoSelect: false,
                    isKeyboardNavigation: false,
                    isFolderNavigation: state.isFolderNavigation,
                    revealSource,
                    historyBehavior,
                    historyIndex: action.historyIndex
                });
            }

            if (state.selectionType === 'tag' && state.selectedTag) {
                return withSingleSelection(state, {
                    selectionType: 'tag',
                    selectedFolder: null,
                    selectedTag: state.selectedTag,
                    selectedProperty: null,
                    selectedFile: action.file,
                    isRevealOperation: true,
                    isFolderChangeWithAutoSelect: false,
                    isKeyboardNavigation: false,
                    isFolderNavigation: state.isFolderNavigation,
                    revealSource,
                    historyBehavior,
                    historyIndex: action.historyIndex
                });
            }

            if (state.selectionType === 'property' && state.selectedProperty) {
                return withSingleSelection(state, {
                    selectionType: 'property',
                    selectedFolder: null,
                    selectedTag: null,
                    selectedProperty: state.selectedProperty,
                    selectedFile: action.file,
                    isRevealOperation: true,
                    isFolderChangeWithAutoSelect: false,
                    isKeyboardNavigation: false,
                    isFolderNavigation: state.isFolderNavigation,
                    revealSource,
                    historyBehavior,
                    historyIndex: action.historyIndex
                });
            }

            return withSingleSelection(state, {
                selectionType: 'folder',
                selectedFolder: targetFolder ?? (action.preserveFolder && state.selectedFolder ? state.selectedFolder : action.file.parent),
                selectedTag: null,
                selectedProperty: null,
                selectedFile: action.file,
                isRevealOperation: true,
                isFolderChangeWithAutoSelect: false,
                isKeyboardNavigation: false,
                isFolderNavigation: state.isFolderNavigation,
                revealSource,
                historyBehavior,
                historyIndex: action.historyIndex
            });
        }

        case 'CLEAR_REVEAL_OPERATION':
            if (!state.isRevealOperation) {
                return state;
            }

            return {
                ...state,
                isRevealOperation: false
            };

        case 'CLEANUP_DELETED_FOLDER':
            if (!state.selectedFolder || state.selectedFolder.path !== action.deletedPath) {
                return state;
            }

            return {
                ...state,
                selectedFolder: null,
                selectedFiles: new Set<string>(),
                selectedFile: null,
                anchorIndex: null,
                lastMovementDirection: null,
                isFolderChangeWithAutoSelect: false,
                isKeyboardNavigation: false,
                revealSource: null
            };

        case 'CLEANUP_DELETED_FILE': {
            const deletedFileWasSelected = state.selectedFiles.has(action.deletedPath) || state.selectedFile?.path === action.deletedPath;
            if (!deletedFileWasSelected && !action.nextFileToSelect) {
                return state;
            }

            const selectedFiles = new Set(state.selectedFiles);
            selectedFiles.delete(action.deletedPath);

            let anchorIndex = state.anchorIndex;
            if (state.anchorIndex !== null && selectedFiles.size === 0) {
                anchorIndex = null;
            }

            if (action.nextFileToSelect) {
                selectedFiles.add(action.nextFileToSelect.path);
            }

            return {
                ...state,
                selectedFiles,
                selectedFile: action.nextFileToSelect ?? (app ? getFirstSelectedFile(selectedFiles, app) : null),
                anchorIndex,
                isFolderChangeWithAutoSelect: false,
                isKeyboardNavigation: false,
                revealSource: null
            };
        }

        case 'CLEANUP_MOVED_FILES': {
            const selectedFiles = new Set(state.selectedFiles);
            let changed = false;
            let primaryRemoved = false;
            for (const { file, originalPath, inCurrentList } of action.movedFiles) {
                if (inCurrentList) {
                    // Retained files are re-keyed here instead of waiting for the rename listener, which runs
                    // after an awaited settings save. Without this, choosing a new primary below could resolve a
                    // stale path to no file and leave the selection set without a primary.
                    if (selectedFiles.delete(originalPath)) {
                        selectedFiles.add(file.path);
                        changed = true;
                    }
                    continue;
                }

                // Both path forms are removed because the rename listener may already have rewritten this entry.
                if (selectedFiles.delete(originalPath)) {
                    changed = true;
                }
                if (selectedFiles.delete(file.path)) {
                    changed = true;
                }
                if (state.selectedFile === file || state.selectedFile?.path === originalPath) {
                    primaryRemoved = true;
                    changed = true;
                }
            }

            if (!changed) {
                return state;
            }

            return {
                ...state,
                selectedFiles,
                selectedFile: primaryRemoved ? (app ? getFirstSelectedFile(selectedFiles, app) : null) : state.selectedFile,
                anchorIndex: selectedFiles.size === 0 ? null : state.anchorIndex,
                isFolderChangeWithAutoSelect: false,
                isKeyboardNavigation: false,
                revealSource: null
            };
        }

        case 'TOGGLE_FILE_SELECTION': {
            const selectedFiles = new Set(state.selectedFiles);
            if (selectedFiles.has(action.file.path)) {
                selectedFiles.delete(action.file.path);
            } else {
                selectedFiles.add(action.file.path);
            }

            return {
                ...state,
                selectedFiles,
                selectedFile: state.selectedFile,
                anchorIndex: action.anchorIndex !== undefined ? action.anchorIndex : state.anchorIndex,
                lastMovementDirection: null
            };
        }

        case 'EXTEND_SELECTION': {
            const { toIndex, allFiles } = action;
            if (state.anchorIndex === null) {
                return state;
            }

            const minIndex = Math.min(state.anchorIndex, toIndex);
            const maxIndex = Math.max(state.anchorIndex, toIndex);
            const selectedFiles = new Set<string>();
            for (let index = minIndex; index <= maxIndex && index < allFiles.length; index += 1) {
                if (allFiles[index]) {
                    selectedFiles.add(allFiles[index].path);
                }
            }

            return {
                ...state,
                selectedFiles,
                selectedFile: allFiles[toIndex] ?? null,
                lastMovementDirection: null
            };
        }

        case 'CLEAR_FILE_SELECTION':
            return {
                ...state,
                selectedFiles: new Set<string>(),
                selectedFile: null,
                anchorIndex: null,
                lastMovementDirection: null
            };

        case 'SET_FILE_SELECTION': {
            const selectedFiles = new Set<string>();
            action.files.forEach(file => {
                selectedFiles.add(file.path);
            });

            return {
                ...state,
                selectedFiles,
                selectedFile: action.selectedFile,
                anchorIndex: null,
                lastMovementDirection: null
            };
        }

        case 'APPLY_FILE_SELECTION':
            return {
                ...state,
                selectedFiles: new Set(action.selectedFiles),
                selectedFile: action.selectedFile,
                anchorIndex: action.anchorIndex !== undefined ? action.anchorIndex : state.anchorIndex,
                lastMovementDirection: action.lastMovementDirection !== undefined ? action.lastMovementDirection : null
            };

        case 'SET_ANCHOR_INDEX':
            return {
                ...state,
                anchorIndex: action.index
            };

        case 'SET_MOVEMENT_DIRECTION':
            return {
                ...state,
                lastMovementDirection: action.direction
            };

        case 'UPDATE_CURRENT_FILE':
            return {
                ...state,
                selectedFile: action.file
            };

        case 'TOGGLE_WITH_CURSOR': {
            const selectedFiles = new Set(state.selectedFiles);
            if (selectedFiles.has(action.file.path)) {
                selectedFiles.delete(action.file.path);
            } else {
                selectedFiles.add(action.file.path);
            }

            return {
                ...state,
                selectedFiles,
                selectedFile: action.file,
                anchorIndex: action.anchorIndex !== undefined ? action.anchorIndex : state.anchorIndex,
                lastMovementDirection: null
            };
        }

        case 'SET_KEYBOARD_NAVIGATION':
            return {
                ...state,
                isKeyboardNavigation: action.isKeyboardNavigation
            };

        case 'SET_FOLDER_CHANGE_WITH_AUTO_SELECT':
            return {
                ...state,
                isFolderChangeWithAutoSelect: action.isFolderChangeWithAutoSelect
            };

        case 'SET_FOLDER_NAVIGATION':
            return {
                ...state,
                isFolderNavigation: action.isFolderNavigation
            };

        case 'UPDATE_FILE_PATH': {
            const selectedFiles = new Set(state.selectedFiles);
            if (selectedFiles.has(action.oldPath)) {
                selectedFiles.delete(action.oldPath);
                selectedFiles.add(action.newPath);
            }

            let selectedFile = state.selectedFile;
            if (state.selectedFile && state.selectedFile.path === action.oldPath && app) {
                selectedFile = app.vault.getFileByPath(action.newPath) ?? selectedFile;
            }

            return {
                ...state,
                selectedFiles,
                selectedFile
            };
        }

        default:
            return state;
    }
}
