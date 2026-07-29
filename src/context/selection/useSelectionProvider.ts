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

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { App, TFile, TFolder } from 'obsidian';
import { getFilesForFolder, getFilesForProperty, getFilesForTag } from '../../utils/fileFinder';
import { localStorage } from '../../utils/localStorage';
import { INTERNAL_NOTEBOOK_NAVIGATOR_API, type NotebookNavigatorAPI } from '../../api/NotebookNavigatorAPI';
import type { NotebookNavigatorSettings } from '../../settings/types';
import { PROPERTIES_ROOT_VIRTUAL_FOLDER_ID, STORAGE_KEYS, TAGGED_TAG_ID, UNTAGGED_TAG_ID } from '../../types';
import type { IPropertyTreeProvider } from '../../interfaces/IPropertyTreeProvider';
import type { ITagTreeProvider } from '../../interfaces/ITagTreeProvider';
import type { PropertyKeyDeleteEventPayload, PropertyKeyRenameEventPayload } from '../../services/PropertyOperations';
import type { TagDeleteEventPayload, TagRenameEventPayload } from '../../services/TagOperations';
import {
    buildPropertyKeyNodeId,
    buildPropertyValueNodeId,
    canRestorePropertySelectionNodeId,
    isPropertySelectionNodeIdVisibleInNavigation,
    normalizePropertyNodeId,
    parsePropertyNodeId,
    parseStoredPropertySelectionNodeId,
    type PropertySelectionNodeId
} from '../../utils/propertyTree';
import { supportsKeyboardInteractions } from '../../utils/paneLayout';
import { normalizeTagPath } from '../../utils/tagUtils';
import { getActivePropertyKeySet } from '../../utils/vaultProfiles';
import { getFirstSelectedFile } from './state';
import { createSelectionHistoryEntry } from './state';
import type { SelectionAction, SelectionDispatch, SelectionState } from './types';

interface LoadInitialSelectionStateArgs {
    app: App;
    settings: NotebookNavigatorSettings;
}

interface UseSelectionEnhancedDispatchArgs {
    app: App;
    dispatch: SelectionDispatch;
    includeDescendantNotes: boolean;
    propertyTreeService: IPropertyTreeProvider | null;
    settings: NotebookNavigatorSettings;
    showHiddenItems: boolean;
    tagTreeService: ITagTreeProvider | null;
}

interface UseSelectionPersistenceArgs {
    api: NotebookNavigatorAPI | null;
    app: App;
    state: SelectionState;
}

interface UseSelectionReconciliationArgs {
    app: App;
    dispatch: SelectionDispatch;
    enhancedDispatch: SelectionDispatch;
    onFileRename?: (listenerId: string, callback: (oldPath: string, newPath: string) => void) => void;
    onFileRenameUnsubscribe?: (listenerId: string) => void;
    pluginSettings: NotebookNavigatorSettings;
    propertyFeatureEnabled: boolean;
    propertyOperations: {
        addPropertyKeyRenameListener(listener: (payload: PropertyKeyRenameEventPayload) => void): () => void;
        addPropertyKeyDeleteListener(listener: (payload: PropertyKeyDeleteEventPayload) => void): () => void;
    } | null;
    propertyTreeService: IPropertyTreeProvider | null;
    state: SelectionState;
    stateRef: MutableRefObject<SelectionState>;
    tagOperations: {
        addTagRenameListener(listener: (payload: TagRenameEventPayload) => void): () => void;
        addTagDeleteListener(listener: (payload: TagDeleteEventPayload) => void): () => void;
    } | null;
    tagTreeService: ITagTreeProvider | null;
}

function loadStoredValue<T>(key: string, fallback: T, errorMessage: string): T {
    try {
        return localStorage.get<T>(key) ?? fallback;
    } catch (error) {
        console.error(errorMessage, error);
        return fallback;
    }
}

function loadStoredStringArray(key: string, errorMessage: string): string[] {
    try {
        const storedValue = localStorage.get<unknown>(key);
        if (!Array.isArray(storedValue)) {
            return [];
        }

        return storedValue.filter((entry): entry is string => typeof entry === 'string');
    } catch (error) {
        console.error(errorMessage, error);
        return [];
    }
}

function persistStoredValue(key: string, value: unknown, errorMessage: string): void {
    try {
        if (value === null) {
            localStorage.remove(key);
            return;
        }

        if (Array.isArray(value) && value.length === 0) {
            localStorage.remove(key);
            return;
        }

        localStorage.set(key, value);
    } catch (error) {
        console.error(errorMessage, error);
    }
}

export function loadInitialSelectionState({ app, settings }: LoadInitialSelectionStateArgs): SelectionState {
    const vault = app.vault;
    const savedFolderPath = loadStoredValue<string | null>(
        STORAGE_KEYS.selectedFolderKey,
        null,
        'Failed to load selected folder from localStorage:'
    );
    const savedTag = loadStoredValue<string | null>(STORAGE_KEYS.selectedTagKey, null, 'Failed to load selected tag from localStorage:');
    const savedFilePath = loadStoredValue<string | null>(
        STORAGE_KEYS.selectedFileKey,
        null,
        'Failed to load selected file from localStorage:'
    );
    const savedFilePaths = loadStoredStringArray(STORAGE_KEYS.selectedFilesKey, 'Failed to load selected files from localStorage:');

    let selectedFolder: TFolder | null = null;
    if (savedFolderPath) {
        selectedFolder = vault.getFolderByPath(savedFolderPath);
    }

    let selectedProperty: PropertySelectionNodeId | null = null;
    if (settings.showProperties) {
        selectedProperty = parseStoredPropertySelectionNodeId(
            loadStoredValue<unknown>(STORAGE_KEYS.selectedPropertyKey, null, 'Failed to load selected property from localStorage:')
        );
    }

    if (selectedProperty && !canRestorePropertySelectionNodeId(settings, selectedProperty)) {
        selectedProperty = null;
        try {
            localStorage.remove(STORAGE_KEYS.selectedPropertyKey);
        } catch (error) {
            console.error('Failed to clear invalid property selection from localStorage:', error);
        }
    }

    let selectedFile: TFile | null = null;
    const selectedFiles = new Set<string>();
    savedFilePaths.forEach(path => {
        const file = vault.getFileByPath(path);
        if (!file) {
            return;
        }

        selectedFiles.add(file.path);
        if (!selectedFile) {
            selectedFile = file;
        }
    });

    if (selectedFiles.size === 0 && savedFilePath) {
        const file = vault.getFileByPath(savedFilePath);
        if (file) {
            selectedFile = file;
            selectedFiles.add(file.path);
        }
    }

    const normalizedTag = normalizeTagPath(savedTag);
    let selectionType: SelectionState['selectionType'] = 'folder';
    if (selectedProperty) {
        selectionType = 'property';
        selectedFolder = null;
    } else if (normalizedTag) {
        selectionType = 'tag';
        selectedFolder = null;
    } else if (!selectedFolder) {
        selectedFolder = vault.getRoot();
    }

    const currentHistoryEntry = createSelectionHistoryEntry({
        selectionType,
        selectedFolder,
        selectedTag: selectedProperty ? null : normalizedTag,
        selectedProperty
    });
    const navigationHistory = currentHistoryEntry ? [currentHistoryEntry] : [];
    const navigationHistoryIndex = currentHistoryEntry ? 0 : 0;

    return {
        selectionType,
        selectedFolder,
        selectedTag: selectedProperty ? null : normalizedTag,
        selectedProperty,
        selectedFiles,
        selectedFile,
        anchorIndex: null,
        lastMovementDirection: null,
        isRevealOperation: false,
        isFolderChangeWithAutoSelect: false,
        isKeyboardNavigation: false,
        isFolderNavigation: false,
        revealSource: null,
        navigationHistory,
        navigationHistoryIndex
    };
}

export function useSelectionStateRef(state: SelectionState): MutableRefObject<SelectionState> {
    const stateRef = useRef(state);
    stateRef.current = state;

    return stateRef;
}

export function useSelectionEnhancedDispatch({
    app,
    dispatch,
    includeDescendantNotes,
    propertyTreeService,
    settings,
    showHiddenItems,
    tagTreeService
}: UseSelectionEnhancedDispatchArgs): SelectionDispatch {
    const resolveAutoSelectedFile = useCallback(
        (filesInScope: TFile[]): TFile | null => {
            if (supportsKeyboardInteractions() && settings.autoSelectFirstFileOnFocusChange && filesInScope.length > 0) {
                return filesInScope[0];
            }

            const activeFile = app.workspace.getActiveFile();
            if (activeFile && filesInScope.some(file => file.path === activeFile.path)) {
                return activeFile;
            }

            return null;
        },
        [app.workspace, settings.autoSelectFirstFileOnFocusChange]
    );

    return useCallback(
        (action: SelectionAction) => {
            const visibility = { includeDescendantNotes, showHiddenItems };

            if (action.type === 'SET_SELECTED_FOLDER' && action.autoSelectedFile === undefined) {
                if (action.folder) {
                    const filesInFolder = getFilesForFolder(action.folder, settings, visibility, app);
                    dispatch({ ...action, autoSelectedFile: resolveAutoSelectedFile(filesInFolder) });
                } else {
                    dispatch({ ...action, autoSelectedFile: null });
                }
                return;
            }

            if (action.type === 'SET_SELECTED_TAG' && action.autoSelectedFile === undefined) {
                if (action.tag) {
                    const filesForTag = getFilesForTag(action.tag, settings, visibility, app, tagTreeService);
                    dispatch({ ...action, autoSelectedFile: resolveAutoSelectedFile(filesForTag) });
                } else {
                    dispatch({ ...action, autoSelectedFile: null });
                }
                return;
            }

            if (action.type === 'SET_SELECTED_PROPERTY' && action.autoSelectedFile === undefined) {
                const filesForProperty = getFilesForProperty(action.nodeId, settings, visibility, app, propertyTreeService);
                dispatch({ ...action, autoSelectedFile: resolveAutoSelectedFile(filesForProperty) });
                return;
            }

            // Phones clear the next-file selection after a delete; desktop and tablets
            // keep it so keyboard flows stay anchored on the adjacent file.
            if (action.type === 'CLEANUP_DELETED_FILE' && !supportsKeyboardInteractions()) {
                dispatch({ ...action, nextFileToSelect: null });
                return;
            }

            dispatch(action);
        },
        [app, dispatch, includeDescendantNotes, propertyTreeService, resolveAutoSelectedFile, settings, showHiddenItems, tagTreeService]
    );
}

export function useSelectionReconciliation({
    app,
    dispatch,
    enhancedDispatch,
    onFileRename,
    onFileRenameUnsubscribe,
    pluginSettings,
    propertyFeatureEnabled,
    propertyOperations,
    propertyTreeService,
    state,
    stateRef,
    tagOperations,
    tagTreeService
}: UseSelectionReconciliationArgs): void {
    const pendingPropertyRenameSelectionRef = useRef<PropertySelectionNodeId | null>(null);

    const reconcilePropertySelection = useCallback(
        (selectionType: SelectionState['selectionType'], selectedProperty: PropertySelectionNodeId | null) => {
            if (!propertyFeatureEnabled || selectionType !== 'property' || !selectedProperty) {
                pendingPropertyRenameSelectionRef.current = null;
                return;
            }

            if (pendingPropertyRenameSelectionRef.current !== null && pendingPropertyRenameSelectionRef.current !== selectedProperty) {
                pendingPropertyRenameSelectionRef.current = null;
            }

            if (!isPropertySelectionNodeIdVisibleInNavigation(pluginSettings, selectedProperty)) {
                pendingPropertyRenameSelectionRef.current = null;
                if (pluginSettings.showProperties) {
                    dispatch({
                        type: 'SET_SELECTED_PROPERTY',
                        nodeId: PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
                        historyBehavior: 'replace'
                    });
                } else {
                    dispatch({ type: 'SET_SELECTED_FOLDER', folder: app.vault.getRoot(), historyBehavior: 'replace' });
                }
                return;
            }

            if (selectedProperty === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID || !propertyTreeService) {
                pendingPropertyRenameSelectionRef.current = null;
                return;
            }

            if (!propertyTreeService.hasNodes()) {
                return;
            }

            const resolvedSelectionNodeId = propertyTreeService.resolveSelectionNodeId(selectedProperty);
            if (resolvedSelectionNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
                if (pendingPropertyRenameSelectionRef.current === selectedProperty) {
                    return;
                }

                pendingPropertyRenameSelectionRef.current = null;
                if (pluginSettings.showProperties) {
                    dispatch({
                        type: 'SET_SELECTED_PROPERTY',
                        nodeId: PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
                        historyBehavior: 'replace'
                    });
                } else {
                    dispatch({ type: 'SET_SELECTED_FOLDER', folder: app.vault.getRoot(), historyBehavior: 'replace' });
                }
                return;
            }

            if (pendingPropertyRenameSelectionRef.current === selectedProperty) {
                pendingPropertyRenameSelectionRef.current = null;
            }

            if (resolvedSelectionNodeId !== selectedProperty) {
                dispatch({ type: 'SET_SELECTED_PROPERTY', nodeId: resolvedSelectionNodeId, historyBehavior: 'replace' });
            }
        },
        [app.vault, dispatch, pluginSettings, propertyFeatureEnabled, propertyTreeService]
    );

    useEffect(() => {
        if (!propertyTreeService) {
            return;
        }

        return propertyTreeService.addTreeUpdateListener(() => {
            const currentState = stateRef.current;
            reconcilePropertySelection(currentState.selectionType, currentState.selectedProperty);
        });
    }, [propertyTreeService, reconcilePropertySelection, stateRef]);

    useEffect(() => {
        if (!tagTreeService) {
            return;
        }

        return tagTreeService.addTreeUpdateListener(() => {
            const currentState = stateRef.current;
            const selectedTag = currentState.selectedTag;
            if (currentState.selectionType !== 'tag' || !selectedTag) {
                return;
            }

            if (selectedTag === TAGGED_TAG_ID || selectedTag === UNTAGGED_TAG_ID) {
                return;
            }

            if (!tagTreeService.hasNodes()) {
                return;
            }

            const resolvedTagPath = tagTreeService.resolveSelectionTagPath(selectedTag);
            if (!resolvedTagPath) {
                enhancedDispatch({ type: 'SET_SELECTED_FOLDER', folder: app.vault.getRoot(), historyBehavior: 'replace' });
                return;
            }

            if (resolvedTagPath !== selectedTag) {
                enhancedDispatch({ type: 'SET_SELECTED_TAG', tag: resolvedTagPath, historyBehavior: 'replace' });
            }
        });
    }, [app.vault, enhancedDispatch, stateRef, tagTreeService]);

    useEffect(() => {
        if (!tagOperations) {
            return;
        }

        const handleTagRename = (payload: TagRenameEventPayload) => {
            const currentTag = stateRef.current.selectedTag;
            if (!currentTag || !payload.oldCanonicalPath || !payload.newCanonicalPath) {
                return;
            }

            if (currentTag === payload.oldCanonicalPath || currentTag.startsWith(`${payload.oldCanonicalPath}/`)) {
                const suffix = currentTag.slice(payload.oldCanonicalPath.length);
                const nextTag = suffix ? `${payload.newCanonicalPath}${suffix}` : payload.newCanonicalPath;
                enhancedDispatch({ type: 'SET_SELECTED_TAG', tag: nextTag, historyBehavior: 'replace' });
            }
        };

        const handleTagDelete = (payload: TagDeleteEventPayload) => {
            const currentTag = stateRef.current.selectedTag;
            if (!currentTag || !payload.canonicalPath) {
                return;
            }

            if (currentTag === payload.canonicalPath || currentTag.startsWith(`${payload.canonicalPath}/`)) {
                const parent = payload.canonicalPath.includes('/')
                    ? payload.canonicalPath.slice(0, payload.canonicalPath.lastIndexOf('/'))
                    : '';
                if (parent) {
                    enhancedDispatch({ type: 'SET_SELECTED_TAG', tag: parent, historyBehavior: 'replace' });
                } else {
                    enhancedDispatch({ type: 'CLEAR_SELECTION' });
                }
            }
        };

        const removeRenameListener = tagOperations.addTagRenameListener(handleTagRename);
        const removeDeleteListener = tagOperations.addTagDeleteListener(handleTagDelete);
        return () => {
            removeRenameListener();
            removeDeleteListener();
        };
    }, [enhancedDispatch, stateRef, tagOperations]);

    useEffect(() => {
        if (!propertyOperations) {
            return;
        }

        const handlePropertyKeyRename = (payload: PropertyKeyRenameEventPayload) => {
            const current = stateRef.current;
            const currentNodeId = current.selectedProperty;
            if (!currentNodeId || current.selectionType !== 'property' || currentNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
                return;
            }

            const normalizedNodeId = normalizePropertyNodeId(currentNodeId);
            if (!normalizedNodeId) {
                return;
            }

            const parsed = parsePropertyNodeId(normalizedNodeId);
            if (!parsed || parsed.key !== payload.oldKey) {
                return;
            }

            const nextNodeId = parsed.valuePath
                ? buildPropertyValueNodeId(payload.newKey, parsed.valuePath)
                : buildPropertyKeyNodeId(payload.newKey);
            pendingPropertyRenameSelectionRef.current = nextNodeId;
            enhancedDispatch({ type: 'SET_SELECTED_PROPERTY', nodeId: nextNodeId, historyBehavior: 'replace' });
        };

        const handlePropertyKeyDelete = (payload: PropertyKeyDeleteEventPayload) => {
            const current = stateRef.current;
            const currentNodeId = current.selectedProperty;
            if (!currentNodeId || current.selectionType !== 'property' || currentNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
                return;
            }

            const normalizedNodeId = normalizePropertyNodeId(currentNodeId);
            if (!normalizedNodeId) {
                return;
            }

            const parsed = parsePropertyNodeId(normalizedNodeId);
            if (!parsed || parsed.key !== payload.key) {
                return;
            }

            pendingPropertyRenameSelectionRef.current = null;
            if (pluginSettings.showProperties) {
                enhancedDispatch({
                    type: 'SET_SELECTED_PROPERTY',
                    nodeId: PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
                    historyBehavior: 'replace'
                });
            } else {
                enhancedDispatch({ type: 'SET_SELECTED_FOLDER', folder: app.vault.getRoot(), historyBehavior: 'replace' });
            }
        };

        const removeRenameListener = propertyOperations.addPropertyKeyRenameListener(handlePropertyKeyRename);
        const removeDeleteListener = propertyOperations.addPropertyKeyDeleteListener(handlePropertyKeyDelete);
        return () => {
            removeRenameListener();
            removeDeleteListener();
        };
    }, [app.vault, enhancedDispatch, pluginSettings.showProperties, propertyOperations, stateRef]);

    useEffect(() => {
        const keepPropertiesRootSelection =
            pluginSettings.showProperties &&
            state.selectionType === 'property' &&
            state.selectedProperty === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;

        if (!propertyFeatureEnabled && state.selectionType === 'property' && !keepPropertiesRootSelection) {
            if (pluginSettings.showProperties) {
                dispatch({
                    type: 'SET_SELECTED_PROPERTY',
                    nodeId: PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
                    historyBehavior: 'replace'
                });
            } else {
                dispatch({ type: 'SET_SELECTED_FOLDER', folder: app.vault.getRoot(), historyBehavior: 'replace' });
            }
        }
    }, [app.vault, dispatch, pluginSettings.showProperties, propertyFeatureEnabled, state.selectedProperty, state.selectionType]);

    const activeNavigationPropertyKeySignature = useMemo(() => {
        const keys = Array.from(getActivePropertyKeySet(pluginSettings, 'navigation'));
        if (keys.length === 0) {
            return '';
        }

        keys.sort();
        return keys.join('\u0001');
    }, [pluginSettings]);

    useEffect(() => {
        reconcilePropertySelection(state.selectionType, state.selectedProperty);
    }, [
        activeNavigationPropertyKeySignature,
        reconcilePropertySelection,
        pluginSettings.showProperties,
        state.selectedProperty,
        state.selectionType
    ]);

    useEffect(() => {
        const listenerId = `selection-context-${Math.random().toString(36).substring(2, 11)}`;
        const handleFileRename = (oldPath: string, newPath: string) => {
            dispatch({ type: 'UPDATE_FILE_PATH', oldPath, newPath });
        };

        onFileRename?.(listenerId, handleFileRename);
        return () => {
            onFileRenameUnsubscribe?.(listenerId);
        };
    }, [dispatch, onFileRename, onFileRenameUnsubscribe]);
}

export function useSelectionPersistence({ api, app, state }: UseSelectionPersistenceArgs): void {
    useEffect(() => {
        persistStoredValue(
            STORAGE_KEYS.selectedFolderKey,
            state.selectedFolder ? state.selectedFolder.path : null,
            'Failed to save selected folder to localStorage:'
        );
    }, [state.selectedFolder]);

    useEffect(() => {
        persistStoredValue(STORAGE_KEYS.selectedTagKey, state.selectedTag, 'Failed to save selected tag to localStorage:');
    }, [state.selectedTag]);

    useEffect(() => {
        persistStoredValue(STORAGE_KEYS.selectedPropertyKey, state.selectedProperty, 'Failed to save selected property to localStorage:');
    }, [state.selectedProperty]);

    useEffect(() => {
        const firstFile = state.selectedFile ?? getFirstSelectedFile(state.selectedFiles, app);
        persistStoredValue(
            STORAGE_KEYS.selectedFileKey,
            firstFile ? firstFile.path : null,
            'Failed to save selected file to localStorage:'
        );
    }, [app, state.selectedFile, state.selectedFiles]);

    useEffect(() => {
        persistStoredValue(
            STORAGE_KEYS.selectedFilesKey,
            state.selectedFiles.size > 0 ? Array.from(state.selectedFiles) : null,
            'Failed to save selected files to localStorage:'
        );

        api?.[INTERNAL_NOTEBOOK_NAVIGATOR_API].selection.updateFileState(state.selectedFiles, state.selectedFile);
    }, [api, state.selectedFile, state.selectedFiles]);

    useEffect(() => {
        api?.[INTERNAL_NOTEBOOK_NAVIGATOR_API].selection.updateNavigationState(
            state.selectedFolder,
            state.selectedTag,
            state.selectedProperty
        );
    }, [api, state.selectedFolder, state.selectedProperty, state.selectedTag]);
}
