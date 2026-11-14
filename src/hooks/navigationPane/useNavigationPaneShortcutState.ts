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

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import type { MutableRefObject } from 'react';
import { TFile, type App } from 'obsidian';
import type { NotebookNavigatorSettings } from '../../settings/types';
import type { NavigationSelectionState, SelectionState } from '../../context/SelectionContext';
import { ItemType, STORAGE_KEYS } from '../../types';
import { localStorage } from '../../utils/localStorage';
import type { ShortcutEntry } from '../../types/shortcuts';
import { ShortcutType } from '../../types/shortcuts';
import { resolvePropertyShortcutNodeId } from '../../utils/propertyTree';
import type { SelectedShortcut } from './navigationPaneShortcutTypes';

interface HydratedShortcutStateItem {
    key: string;
    note: TFile | null;
    isMissing: boolean;
}

interface UseNavigationPaneShortcutStateProps {
    app: App;
    settings: NotebookNavigatorSettings;
    hydratedShortcuts: HydratedShortcutStateItem[];
    shortcutMap: Map<string, ShortcutEntry>;
    selectionState: NavigationSelectionState;
    selectionStateRef: MutableRefObject<SelectionState>;
    subscribeSelectionState: (listener: (state: SelectionState) => void) => () => void;
}

export function useNavigationPaneShortcutState({
    app,
    settings,
    hydratedShortcuts,
    shortcutMap,
    selectionState,
    selectionStateRef,
    subscribeSelectionState
}: UseNavigationPaneShortcutStateProps) {
    const effectiveShortcutBadgeDisplay = settings.shortcutBadgeDisplay;
    const shouldShowShortcutCounts = effectiveShortcutBadgeDisplay === 'count';
    const shortcutNumberBadgesByKey = useMemo(() => {
        if (effectiveShortcutBadgeDisplay !== 'index') {
            return new Map<string, string>();
        }

        const badgeMap = new Map<string, string>();
        hydratedShortcuts.slice(0, 9).forEach((shortcut, index) => {
            badgeMap.set(shortcut.key, String(index + 1));
        });
        return badgeMap;
    }, [effectiveShortcutBadgeDisplay, hydratedShortcuts]);

    const [activeShortcutKey, setActiveShortcut] = useState<string | null>(null);
    const clearActiveShortcut = useCallback(() => {
        setActiveShortcut(null);
    }, []);

    const [isShortcutContextMenuOpen, setIsShortcutContextMenuOpen] = useState(false);
    const [shortcutsExpanded, setShortcutsExpanded] = useState<boolean>(() => {
        const stored = localStorage.get<string>(STORAGE_KEYS.shortcutsExpandedKey);
        return stored !== '0';
    });
    const [recentNotesExpanded, setRecentNotesExpanded] = useState<boolean>(() => {
        const stored = localStorage.get<string>(STORAGE_KEYS.recentNotesExpandedKey);
        if (stored === '1') {
            return true;
        }
        if (stored === '0') {
            return false;
        }
        return false;
    });

    const [, forceMetadataRefresh] = useReducer((value: number) => value + 1, 0);

    useEffect(() => {
        if (!settings.useFrontmatterMetadata) {
            return;
        }

        const metadataCache = app.metadataCache;
        const relevantNotePaths = new Set(hydratedShortcuts.map(entry => entry.note?.path).filter((path): path is string => Boolean(path)));

        if (relevantNotePaths.size === 0) {
            return;
        }

        const handleResolved = () => {
            forceMetadataRefresh();
        };

        const handleChanged = (file: TFile) => {
            if (relevantNotePaths.has(file.path)) {
                forceMetadataRefresh();
            }
        };

        const resolvedRef = metadataCache.on('resolved', handleResolved);
        const changedRef = metadataCache.on('changed', file => {
            if (file instanceof TFile) {
                handleChanged(file);
            }
        });

        return () => {
            metadataCache.offref(resolvedRef);
            metadataCache.offref(changedRef);
        };
    }, [app.metadataCache, hydratedShortcuts, settings.useFrontmatterMetadata]);

    useEffect(() => {
        if (!activeShortcutKey) {
            return;
        }

        const shortcut = shortcutMap.get(activeShortcutKey);
        if (!shortcut) {
            setActiveShortcut(null);
            return;
        }

        if (shortcut.type === ShortcutType.FOLDER) {
            const selectedPath = selectionState.selectedFolder?.path;
            if (!selectedPath || selectedPath !== shortcut.path) {
                setActiveShortcut(null);
            }
            return;
        }

        if (shortcut.type === ShortcutType.NOTE) {
            const selectedPath = selectionStateRef.current.selectedFile?.path;
            if (!selectedPath || selectedPath !== shortcut.path) {
                setActiveShortcut(null);
            }
            return;
        }

        if (shortcut.type === ShortcutType.TAG) {
            const selectedTag = selectionState.selectedTag;
            if (!selectedTag || selectedTag !== shortcut.tagPath) {
                setActiveShortcut(null);
            }
            return;
        }

        if (shortcut.type === ShortcutType.PROPERTY) {
            const selectedProperty = selectionState.selectedProperty;
            const resolvedNodeId = resolvePropertyShortcutNodeId(null, shortcut.nodeId);
            if (!selectedProperty || !resolvedNodeId || selectedProperty !== resolvedNodeId) {
                setActiveShortcut(null);
            }
        }
    }, [
        activeShortcutKey,
        selectionState.selectedFolder,
        selectionState.selectedProperty,
        selectionState.selectedTag,
        selectionStateRef,
        shortcutMap
    ]);

    useEffect(() => {
        if (!activeShortcutKey) {
            return;
        }

        const shortcut = shortcutMap.get(activeShortcutKey);
        if (!shortcut || shortcut.type !== ShortcutType.NOTE) {
            return;
        }

        return subscribeSelectionState(state => {
            const selectedPath = state.selectedFile?.path;
            if (!selectedPath || selectedPath !== shortcut.path) {
                setActiveShortcut(null);
            }
        });
    }, [activeShortcutKey, shortcutMap, subscribeSelectionState]);

    // The shortcut activated last. Its row shows as selected until its target is no longer the selection, so only one
    // shortcut shows as selected at a time, and selecting a target from the tree or the list never highlights its
    // shortcut. Kept apart from activeShortcutKey, which suppresses scrolling for two frames after a shortcut click.
    const [selectedShortcut, setSelectedShortcut] = useState<SelectedShortcut | null>(null);

    // Clears the marker when its shortcut is removed, or when the navigation selection moves off its folder, tag or
    // property.
    useEffect(() => {
        if (!selectedShortcut) {
            return;
        }

        if (!shortcutMap.has(selectedShortcut.key)) {
            setSelectedShortcut(null);
            return;
        }

        const { target } = selectedShortcut;
        const isTargetSelected =
            target.type === 'folder'
                ? selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder?.path === target.folder.path
                : target.type === 'tag'
                  ? selectionState.selectionType === ItemType.TAG && selectionState.selectedTag === target.tagPath
                  : target.type === 'property'
                    ? selectionState.selectionType === ItemType.PROPERTY && selectionState.selectedProperty === target.nodeId
                    : true;
        if (!isTargetSelected) {
            setSelectedShortcut(null);
        }
    }, [selectedShortcut, selectionState, shortcutMap]);

    // Clears a note shortcut's marker when another file is selected. Reads the file selection through the subscription
    // rather than the file selection context, so list selection changes do not re-render the navigation pane.
    useEffect(() => {
        const target = selectedShortcut?.target;
        if (target?.type !== 'note') {
            return;
        }

        const clearIfNoteDeselected = (state: SelectionState) => {
            if (state.selectedFile?.path !== target.note.path) {
                setSelectedShortcut(null);
            }
        };

        clearIfNoteDeselected(selectionStateRef.current);
        return subscribeSelectionState(clearIfNoteDeselected);
    }, [selectedShortcut, selectionStateRef, subscribeSelectionState]);

    return {
        activeShortcutKey,
        setActiveShortcut,
        clearActiveShortcut,
        isShortcutContextMenuOpen,
        setIsShortcutContextMenuOpen,
        shortcutsExpanded,
        setShortcutsExpanded,
        recentNotesExpanded,
        setRecentNotesExpanded,
        shortcutNumberBadgesByKey,
        shouldShowShortcutCounts,
        selectedShortcutKey: selectedShortcut?.key ?? null,
        setSelectedShortcut
    };
}
