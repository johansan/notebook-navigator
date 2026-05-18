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

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { PROPERTIES_ROOT_VIRTUAL_FOLDER_ID, STORAGE_KEYS, TAGS_ROOT_VIRTUAL_FOLDER_ID } from '../types';
import { localStorage } from '../utils/localStorage';
import { normalizeStoredCollapsedListGroupKeys } from '../utils/listGroupCollapse';

// State interface
interface ExpansionState {
    expandedFolders: Set<string>;
    expandedTags: Set<string>;
    expandedProperties: Set<string>;
    expandedVirtualFolders: Set<string>;
    collapsedListGroups: Set<string>;
}

// Action types
export type ExpansionAction =
    | { type: 'SET_EXPANDED_FOLDERS'; folders: Set<string> }
    | { type: 'SET_EXPANDED_TAGS'; tags: Set<string> }
    | { type: 'SET_EXPANDED_PROPERTIES'; properties: Set<string> }
    | { type: 'SET_EXPANDED_VIRTUAL_FOLDERS'; folders: Set<string> }
    | { type: 'TOGGLE_FOLDER_EXPANDED'; folderPath: string }
    | { type: 'TOGGLE_TAG_EXPANDED'; tagPath: string }
    | { type: 'TOGGLE_PROPERTY_EXPANDED'; propertyNodeId: string }
    | { type: 'TOGGLE_VIRTUAL_FOLDER_EXPANDED'; folderId: string }
    | { type: 'TOGGLE_LIST_GROUP_COLLAPSED'; collapseKey: string }
    | { type: 'EXPAND_FOLDERS'; folderPaths: string[] }
    | { type: 'EXPAND_TAGS'; tagPaths: string[] }
    | { type: 'EXPAND_PROPERTIES'; propertyNodeIds: string[] }
    | { type: 'TOGGLE_DESCENDANT_FOLDERS'; descendantPaths: string[]; expand: boolean }
    | { type: 'TOGGLE_DESCENDANT_TAGS'; descendantPaths: string[]; expand: boolean }
    | { type: 'TOGGLE_DESCENDANT_PROPERTIES'; descendantNodeIds: string[]; expand: boolean }
    | { type: 'CLEANUP_DELETED_FOLDERS'; existingPaths: Set<string> }
    | { type: 'CLEANUP_DELETED_TAGS'; existingTags: Set<string> }
    | { type: 'CLEANUP_DELETED_PROPERTIES'; existingPropertyNodeIds: Set<string> };

// Create contexts
const ExpansionContext = createContext<ExpansionState | null>(null);
const ExpansionDispatchContext = createContext<React.Dispatch<ExpansionAction> | null>(null);

function filterExpandedSet(currentValues: Set<string>, validValues: Set<string>): Set<string> | null {
    let changed = false;
    currentValues.forEach(value => {
        if (!validValues.has(value)) {
            changed = true;
        }
    });

    if (!changed) {
        return null;
    }

    const filteredValues = new Set<string>();
    currentValues.forEach(value => {
        if (validValues.has(value)) {
            filteredValues.add(value);
        }
    });

    return filteredValues;
}

// Reducer
function expansionReducer(state: ExpansionState, action: ExpansionAction): ExpansionState {
    switch (action.type) {
        case 'SET_EXPANDED_FOLDERS':
            return { ...state, expandedFolders: action.folders };

        case 'SET_EXPANDED_TAGS':
            return { ...state, expandedTags: action.tags };

        case 'SET_EXPANDED_PROPERTIES':
            return { ...state, expandedProperties: action.properties };

        case 'SET_EXPANDED_VIRTUAL_FOLDERS':
            return { ...state, expandedVirtualFolders: action.folders };

        case 'TOGGLE_FOLDER_EXPANDED': {
            const newExpanded = new Set(state.expandedFolders);
            if (newExpanded.has(action.folderPath)) {
                newExpanded.delete(action.folderPath);
            } else {
                newExpanded.add(action.folderPath);
            }
            return { ...state, expandedFolders: newExpanded };
        }

        case 'TOGGLE_TAG_EXPANDED': {
            const newExpanded = new Set(state.expandedTags);
            if (newExpanded.has(action.tagPath)) {
                newExpanded.delete(action.tagPath);
            } else {
                newExpanded.add(action.tagPath);
            }
            return { ...state, expandedTags: newExpanded };
        }

        case 'TOGGLE_PROPERTY_EXPANDED': {
            const newExpanded = new Set(state.expandedProperties);
            if (newExpanded.has(action.propertyNodeId)) {
                newExpanded.delete(action.propertyNodeId);
            } else {
                newExpanded.add(action.propertyNodeId);
            }
            return { ...state, expandedProperties: newExpanded };
        }

        case 'TOGGLE_VIRTUAL_FOLDER_EXPANDED': {
            const newExpanded = new Set(state.expandedVirtualFolders);
            if (newExpanded.has(action.folderId)) {
                newExpanded.delete(action.folderId);
            } else {
                newExpanded.add(action.folderId);
            }
            return { ...state, expandedVirtualFolders: newExpanded };
        }

        case 'TOGGLE_LIST_GROUP_COLLAPSED': {
            const newCollapsed = new Set(state.collapsedListGroups);
            if (newCollapsed.has(action.collapseKey)) {
                newCollapsed.delete(action.collapseKey);
            } else {
                newCollapsed.add(action.collapseKey);
            }
            return { ...state, collapsedListGroups: newCollapsed };
        }

        case 'EXPAND_FOLDERS': {
            const newExpanded = new Set(state.expandedFolders);
            action.folderPaths.forEach(path => newExpanded.add(path));
            return { ...state, expandedFolders: newExpanded };
        }

        case 'EXPAND_TAGS': {
            const newExpanded = new Set(state.expandedTags);
            action.tagPaths.forEach(path => newExpanded.add(path));
            return { ...state, expandedTags: newExpanded };
        }

        case 'EXPAND_PROPERTIES': {
            const newExpanded = new Set(state.expandedProperties);
            action.propertyNodeIds.forEach(nodeId => newExpanded.add(nodeId));
            return { ...state, expandedProperties: newExpanded };
        }

        case 'TOGGLE_DESCENDANT_FOLDERS': {
            const newExpanded = new Set(state.expandedFolders);
            action.descendantPaths.forEach(path => {
                if (action.expand) {
                    newExpanded.add(path);
                } else {
                    newExpanded.delete(path);
                }
            });
            return { ...state, expandedFolders: newExpanded };
        }

        case 'TOGGLE_DESCENDANT_TAGS': {
            const newExpanded = new Set(state.expandedTags);
            action.descendantPaths.forEach(path => {
                if (action.expand) {
                    newExpanded.add(path);
                } else {
                    newExpanded.delete(path);
                }
            });
            return { ...state, expandedTags: newExpanded };
        }

        case 'TOGGLE_DESCENDANT_PROPERTIES': {
            const newExpanded = new Set(state.expandedProperties);
            action.descendantNodeIds.forEach(nodeId => {
                if (action.expand) {
                    newExpanded.add(nodeId);
                } else {
                    newExpanded.delete(nodeId);
                }
            });
            return { ...state, expandedProperties: newExpanded };
        }

        case 'CLEANUP_DELETED_FOLDERS': {
            const cleaned = filterExpandedSet(state.expandedFolders, action.existingPaths);
            if (!cleaned) {
                return state;
            }
            return { ...state, expandedFolders: cleaned };
        }

        case 'CLEANUP_DELETED_TAGS': {
            const cleaned = filterExpandedSet(state.expandedTags, action.existingTags);
            if (!cleaned) {
                return state;
            }
            return { ...state, expandedTags: cleaned };
        }

        case 'CLEANUP_DELETED_PROPERTIES': {
            const cleaned = filterExpandedSet(state.expandedProperties, action.existingPropertyNodeIds);
            if (!cleaned) {
                return state;
            }
            return { ...state, expandedProperties: cleaned };
        }

        default:
            return state;
    }
}

// Provider component
interface ExpansionProviderProps {
    children: ReactNode;
}

export function ExpansionProvider({ children }: ExpansionProviderProps) {
    // Load initial state from localStorage
    const loadInitialState = (): ExpansionState => {
        const savedExpandedFolders = localStorage.get<string[]>(STORAGE_KEYS.expandedFoldersKey);
        const savedExpandedTags = localStorage.get<string[]>(STORAGE_KEYS.expandedTagsKey);
        const savedExpandedProperties = localStorage.get<string[]>(STORAGE_KEYS.expandedPropertiesKey);
        const savedExpandedVirtualFolders = localStorage.get<string[]>(STORAGE_KEYS.expandedVirtualFoldersKey);
        const savedCollapsedListGroups = localStorage.get<unknown>(STORAGE_KEYS.collapsedListGroupsKey);

        const expandedFolders = new Set<string>(savedExpandedFolders || []);
        const expandedTags = new Set<string>(savedExpandedTags || []);
        const expandedProperties = new Set<string>(savedExpandedProperties || []);
        const expandedVirtualFolders = new Set<string>(
            savedExpandedVirtualFolders || [TAGS_ROOT_VIRTUAL_FOLDER_ID, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID]
        ); // Default expand tag/property roots
        const collapsedListGroups = new Set<string>(normalizeStoredCollapsedListGroupKeys(savedCollapsedListGroups));

        return { expandedFolders, expandedTags, expandedProperties, expandedVirtualFolders, collapsedListGroups };
    };

    const [state, dispatch] = useReducer(expansionReducer, undefined, loadInitialState);

    // Persist to localStorage
    useEffect(() => {
        localStorage.set(STORAGE_KEYS.expandedFoldersKey, Array.from(state.expandedFolders));
    }, [state.expandedFolders]);

    useEffect(() => {
        localStorage.set(STORAGE_KEYS.expandedTagsKey, Array.from(state.expandedTags));
    }, [state.expandedTags]);

    useEffect(() => {
        localStorage.set(STORAGE_KEYS.expandedPropertiesKey, Array.from(state.expandedProperties));
    }, [state.expandedProperties]);

    useEffect(() => {
        localStorage.set(STORAGE_KEYS.expandedVirtualFoldersKey, Array.from(state.expandedVirtualFolders));
    }, [state.expandedVirtualFolders]);

    useEffect(() => {
        localStorage.set(STORAGE_KEYS.collapsedListGroupsKey, Array.from(state.collapsedListGroups));
    }, [state.collapsedListGroups]);

    return (
        <ExpansionContext.Provider value={state}>
            <ExpansionDispatchContext.Provider value={dispatch}>{children}</ExpansionDispatchContext.Provider>
        </ExpansionContext.Provider>
    );
}

// Custom hooks
export function useExpansionState() {
    const context = useContext(ExpansionContext);
    if (!context) {
        throw new Error('useExpansionState must be used within ExpansionProvider');
    }
    return context;
}

export function useExpansionDispatch() {
    const context = useContext(ExpansionDispatchContext);
    if (!context) {
        throw new Error('useExpansionDispatch must be used within ExpansionProvider');
    }
    return context;
}
