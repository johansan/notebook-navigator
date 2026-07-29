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

import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { App } from 'obsidian';
import type { MutableRefObject, ReactNode } from 'react';
import { useSettingsState } from './SettingsContext';
import { useUXPreferences } from './UXPreferencesContext';
import type { NotebookNavigatorAPI } from '../api/NotebookNavigatorAPI';
import type { IPropertyTreeProvider } from '../interfaces/IPropertyTreeProvider';
import type { ITagTreeProvider } from '../interfaces/ITagTreeProvider';
import { useServices } from './ServicesContext';
import { isPropertyFeatureEnabled } from '../utils/propertyTree';
import {
    loadInitialSelectionState,
    useSelectionEnhancedDispatch,
    useSelectionPersistence,
    useSelectionReconciliation,
    useSelectionStateRef as useSelectionStateRefInternal
} from './selection/useSelectionProvider';
import { selectionReducer } from './selection/state';
import type { SelectionAction, SelectionState } from './selection/types';

export type { SelectionAction, SelectionDispatch, SelectionRevealSource, SelectionState } from './selection/types';
export { resolvePrimarySelectedFile } from './selection/state';

export type NavigationSelectionState = Pick<SelectionState, 'selectionType' | 'selectedFolder' | 'selectedTag' | 'selectedProperty'>;
export type FileSelectionState = Pick<SelectionState, 'selectedFiles' | 'selectedFile' | 'anchorIndex' | 'lastMovementDirection'>;
export type SelectionFlagsState = Pick<
    SelectionState,
    'isRevealOperation' | 'isFolderChangeWithAutoSelect' | 'isKeyboardNavigation' | 'isFolderNavigation' | 'revealSource'
>;
export type SelectionRevealState = Pick<SelectionState, 'isRevealOperation' | 'revealSource'>;
export type SelectionHistoryState = Pick<SelectionState, 'navigationHistory' | 'navigationHistoryIndex'>;
type SelectionStateListener = (state: SelectionState) => void;
interface SelectionStateSubscription {
    subscribe: (listener: SelectionStateListener) => () => void;
}

const NavigationSelectionContext = createContext<NavigationSelectionState | null>(null);
const FileSelectionContext = createContext<FileSelectionState | null>(null);
const SelectionFlagsContext = createContext<SelectionFlagsState | null>(null);
const SelectionRevealContext = createContext<SelectionRevealState | null>(null);
const SelectionHistoryContext = createContext<SelectionHistoryState | null>(null);
const SelectionStateRefContext = createContext<MutableRefObject<SelectionState> | null>(null);
const SelectionStateSubscriptionContext = createContext<SelectionStateSubscription | null>(null);
const SelectionDispatchContext = createContext<React.Dispatch<SelectionAction> | null>(null);

// Provider component
interface SelectionProviderProps {
    children: ReactNode;
    app: App; // Obsidian App instance
    api: NotebookNavigatorAPI | null; // API for triggering events
    tagTreeService: ITagTreeProvider | null; // Tag tree service for tag operations
    propertyTreeService: IPropertyTreeProvider | null; // Property tree service for property operations
    onFileRename?: (listenerId: string, callback: (oldPath: string, newPath: string) => void) => void;
    onFileRenameUnsubscribe?: (listenerId: string) => void;
}

export function SelectionProvider({
    children,
    app,
    api,
    tagTreeService,
    propertyTreeService,
    onFileRename,
    onFileRenameUnsubscribe
}: SelectionProviderProps) {
    const settings = useSettingsState();
    const uxPreferences = useUXPreferences();
    const propertyFeatureEnabled = isPropertyFeatureEnabled(settings);
    const { tagOperations, propertyOperations } = useServices();
    const [state, dispatch] = useReducer(
        (state: SelectionState, action: SelectionAction) => selectionReducer(state, action, app),
        undefined,
        () => loadInitialSelectionState({ app, settings })
    );
    const stateRef = useSelectionStateRefInternal(state);
    const stateListenersRef = useRef(new Set<SelectionStateListener>());
    const stateSubscription = useMemo<SelectionStateSubscription>(
        () => ({
            subscribe: listener => {
                stateListenersRef.current.add(listener);
                return () => {
                    stateListenersRef.current.delete(listener);
                };
            }
        }),
        []
    );
    const enhancedDispatch = useSelectionEnhancedDispatch({
        app,
        dispatch,
        includeDescendantNotes: uxPreferences.includeDescendantNotes,
        propertyTreeService,
        settings,
        showHiddenItems: uxPreferences.showHiddenItems,
        tagTreeService
    });

    useSelectionReconciliation({
        app,
        dispatch,
        enhancedDispatch,
        onFileRename,
        onFileRenameUnsubscribe,
        pluginSettings: settings,
        propertyFeatureEnabled,
        propertyOperations,
        propertyTreeService,
        state,
        stateRef,
        tagOperations,
        tagTreeService
    });
    useSelectionPersistence({ api, app, state });

    useEffect(() => {
        stateListenersRef.current.forEach(listener => {
            listener(state);
        });
    }, [state]);

    const navigationSelection = useMemo<NavigationSelectionState>(
        () => ({
            selectionType: state.selectionType,
            selectedFolder: state.selectedFolder,
            selectedTag: state.selectedTag,
            selectedProperty: state.selectedProperty
        }),
        [state.selectedFolder, state.selectedProperty, state.selectedTag, state.selectionType]
    );
    const fileSelection = useMemo<FileSelectionState>(
        () => ({
            selectedFiles: state.selectedFiles,
            selectedFile: state.selectedFile,
            anchorIndex: state.anchorIndex,
            lastMovementDirection: state.lastMovementDirection
        }),
        [state.anchorIndex, state.lastMovementDirection, state.selectedFile, state.selectedFiles]
    );
    const selectionFlags = useMemo<SelectionFlagsState>(
        () => ({
            isRevealOperation: state.isRevealOperation,
            isFolderChangeWithAutoSelect: state.isFolderChangeWithAutoSelect,
            isKeyboardNavigation: state.isKeyboardNavigation,
            isFolderNavigation: state.isFolderNavigation,
            revealSource: state.revealSource
        }),
        [
            state.isFolderChangeWithAutoSelect,
            state.isFolderNavigation,
            state.isKeyboardNavigation,
            state.isRevealOperation,
            state.revealSource
        ]
    );
    const selectionReveal = useMemo<SelectionRevealState>(
        () => ({
            isRevealOperation: state.isRevealOperation,
            revealSource: state.revealSource
        }),
        [state.isRevealOperation, state.revealSource]
    );
    const selectionHistory = useMemo<SelectionHistoryState>(
        () => ({
            navigationHistory: state.navigationHistory,
            navigationHistoryIndex: state.navigationHistoryIndex
        }),
        [state.navigationHistory, state.navigationHistoryIndex]
    );

    return (
        <NavigationSelectionContext.Provider value={navigationSelection}>
            <FileSelectionContext.Provider value={fileSelection}>
                <SelectionFlagsContext.Provider value={selectionFlags}>
                    <SelectionRevealContext.Provider value={selectionReveal}>
                        <SelectionHistoryContext.Provider value={selectionHistory}>
                            <SelectionStateRefContext.Provider value={stateRef}>
                                <SelectionStateSubscriptionContext.Provider value={stateSubscription}>
                                    <SelectionDispatchContext.Provider value={enhancedDispatch}>
                                        {children}
                                    </SelectionDispatchContext.Provider>
                                </SelectionStateSubscriptionContext.Provider>
                            </SelectionStateRefContext.Provider>
                        </SelectionHistoryContext.Provider>
                    </SelectionRevealContext.Provider>
                </SelectionFlagsContext.Provider>
            </FileSelectionContext.Provider>
        </NavigationSelectionContext.Provider>
    );
}

// Custom hooks
export function useNavigationSelection(): NavigationSelectionState {
    const context = useContext(NavigationSelectionContext);
    if (!context) {
        throw new Error('useNavigationSelection must be used within SelectionProvider');
    }
    return context;
}

export function useFileSelection(): FileSelectionState {
    const context = useContext(FileSelectionContext);
    if (!context) {
        throw new Error('useFileSelection must be used within SelectionProvider');
    }
    return context;
}

function useSelectionFlags(): SelectionFlagsState {
    const context = useContext(SelectionFlagsContext);
    if (!context) {
        throw new Error('useSelectionFlags must be used within SelectionProvider');
    }
    return context;
}

export function useSelectionReveal(): SelectionRevealState {
    const context = useContext(SelectionRevealContext);
    if (!context) {
        throw new Error('useSelectionReveal must be used within SelectionProvider');
    }
    return context;
}

export function useSelectionStateRefValue(): MutableRefObject<SelectionState> {
    const context = useContext(SelectionStateRefContext);
    if (!context) {
        throw new Error('useSelectionStateRefValue must be used within SelectionProvider');
    }
    return context;
}

export function useSelectionStateSubscription(): SelectionStateSubscription {
    const context = useContext(SelectionStateSubscriptionContext);
    if (!context) {
        throw new Error('useSelectionStateSubscription must be used within SelectionProvider');
    }
    return context;
}

function useSelectionHistory(): SelectionHistoryState {
    const context = useContext(SelectionHistoryContext);
    if (!context) {
        throw new Error('useSelectionHistory must be used within SelectionProvider');
    }
    return context;
}

export function useSelectionState(): SelectionState {
    const navigationSelection = useNavigationSelection();
    const fileSelection = useFileSelection();
    const selectionFlags = useSelectionFlags();
    const selectionHistory = useSelectionHistory();

    return useMemo(
        () => ({
            ...navigationSelection,
            ...fileSelection,
            ...selectionFlags,
            ...selectionHistory
        }),
        [fileSelection, navigationSelection, selectionFlags, selectionHistory]
    );
}

export function useSelectionDispatch() {
    const context = useContext(SelectionDispatchContext);
    if (!context) {
        throw new Error('useSelectionDispatch must be used within SelectionProvider');
    }
    return context;
}
