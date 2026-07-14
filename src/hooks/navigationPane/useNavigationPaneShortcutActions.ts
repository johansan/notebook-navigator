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

import React, { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { App, TFile, TFolder, WorkspaceLeaf } from 'obsidian';
import type { CommandQueueService } from '../../services/CommandQueueService';
import type { NavigationSelectionState, SelectionAction } from '../../context/SelectionContext';
import type { UIAction } from '../../context/UIStateContext';
import type { NotebookNavigatorSettings } from '../../settings/types';
import type { SearchShortcut, ShortcutEntry } from '../../types/shortcuts';
import { isFolderShortcut, isNoteShortcut, isPropertyShortcut, isSearchShortcut, isTagShortcut } from '../../types/shortcuts';
import { resolvePropertyShortcutNodeId } from '../../utils/propertyTree';
import { resolveCanonicalTagPath } from '../../utils/tagUtils';
import { runAsyncAction } from '../../utils/async';
import { openFileInContext } from '../../utils/openFileInContext';
import { getFolderNote, openFolderNoteFile, type FolderNoteOpenContext } from '../../utils/folderNotes';
import { resolveFolderNoteClickOpenContext, shouldOpenNoteClickInNewTab } from '../../utils/keyboardOpenContext';
import { ItemType } from '../../types';
import type { NavigateToFolderOptions, RevealPropertyOptions, RevealTagOptions } from '../useNavigatorReveal';

interface HydratedShortcutActionItem {
    key: string;
    shortcut: ShortcutEntry;
    folder: TFolder | null;
    note: TFile | null;
    search: SearchShortcut | null;
    tagPath: string | null;
    propertyNodeId: string | null;
    isMissing: boolean;
}

interface UIStateLike {
    singlePane: boolean;
    currentSinglePaneView: 'navigation' | 'files';
}

interface UseNavigationPaneShortcutActionsProps {
    app: App;
    commandQueue: CommandQueueService | null;
    isMobile: boolean;
    rootContainerRef: React.RefObject<HTMLDivElement | null>;
    settings: NotebookNavigatorSettings;
    uiState: UIStateLike;
    uiDispatch: Dispatch<UIAction>;
    selectionType: NavigationSelectionState['selectionType'];
    selectedFolder: NavigationSelectionState['selectedFolder'];
    selectionDispatch: Dispatch<SelectionAction>;
    setActiveShortcut: Dispatch<SetStateAction<string | null>>;
    onExecuteSearchShortcut?: (shortcutKey: string, searchShortcut: SearchShortcut) => Promise<void> | void;
    onNavigateToFolder: (folderPath: string, options?: NavigateToFolderOptions) => void;
    onRevealTag: (tagPath: string, options?: RevealTagOptions) => void;
    onRevealProperty: (propertyNodeId: string, options?: RevealPropertyOptions) => boolean;
    onRevealFile: (file: TFile) => void;
    onRevealShortcutFile?: (file: TFile) => void;
    openFolderNoteInRightSidebar: (folderNote: TFile) => Promise<void>;
    tagTree: Map<string, import('../../types/storage').TagTreeNode>;
    hydratedShortcuts: HydratedShortcutActionItem[];
}

export function useNavigationPaneShortcutActions({
    app,
    commandQueue,
    isMobile,
    rootContainerRef,
    settings,
    uiState,
    uiDispatch,
    selectionType,
    selectedFolder,
    selectionDispatch,
    setActiveShortcut,
    onExecuteSearchShortcut,
    onNavigateToFolder,
    onRevealTag,
    onRevealProperty,
    onRevealFile,
    onRevealShortcutFile,
    openFolderNoteInRightSidebar,
    tagTree,
    hydratedShortcuts
}: UseNavigationPaneShortcutActionsProps) {
    const focusListPaneAfterRightSidebarFolderNoteSelection = useCallback(
        (openContext: FolderNoteOpenContext) => {
            if (!uiState.singlePane || openContext !== 'right-sidebar') {
                return;
            }

            uiDispatch({ type: 'ACTIVATE_PANE', target: 'files' });
        },
        [uiDispatch, uiState.singlePane]
    );

    const scheduleShortcutRelease = useCallback(() => {
        const release = () => setActiveShortcut(null);

        if (typeof requestAnimationFrame !== 'undefined') {
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(release);
            });
            return;
        }

        window.setTimeout(release, 0);
    }, [setActiveShortcut]);

    const openNotePreview = useCallback(
        (note: TFile) => {
            const getLeaf = () => app.workspace.getLeaf(false);

            const openFile = async (leaf: WorkspaceLeaf | null) => {
                if (!leaf) {
                    return;
                }

                await leaf.openFile(note, { active: false });
            };

            if (commandQueue) {
                runAsyncAction(() => commandQueue.executeOpenActiveFile(note, openFile, { active: false, getLeaf }));
                return;
            }

            runAsyncAction(() => openFile(getLeaf()));
        },
        [app.workspace, commandQueue]
    );

    const handleShortcutFolderActivate = useCallback(
        (folder: TFolder, shortcutKey: string) => {
            setActiveShortcut(shortcutKey);
            onNavigateToFolder(folder.path, { skipScroll: settings.skipAutoScroll, source: 'shortcut' });
            scheduleShortcutRelease();
            const container = rootContainerRef.current;
            if (container && !uiState.singlePane) {
                container.focus();
            }
        },
        [onNavigateToFolder, rootContainerRef, scheduleShortcutRelease, setActiveShortcut, settings.skipAutoScroll, uiState.singlePane]
    );

    const handleShortcutFolderNoteClick = useCallback(
        (folder: TFolder, shortcutKey: string, event: React.MouseEvent<HTMLSpanElement>) => {
            setActiveShortcut(shortcutKey);
            if (!settings.enableFolderNotes || !settings.enableFolderNoteLinks) {
                handleShortcutFolderActivate(folder, shortcutKey);
                return;
            }

            const folderNote = getFolderNote(folder, settings);
            if (!folderNote) {
                handleShortcutFolderActivate(folder, shortcutKey);
                return;
            }

            const wasSelectedFolder = selectionType === ItemType.FOLDER && selectedFolder?.path === folder.path;
            selectionDispatch({ type: 'SET_SELECTED_FOLDER', folder, autoSelectedFile: null });
            const openContext = resolveFolderNoteClickOpenContext(
                event,
                settings.folderNoteOpenLocation,
                settings.multiSelectModifier,
                isMobile
            );
            focusListPaneAfterRightSidebarFolderNoteSelection(openContext);
            if (openContext === 'right-sidebar' && settings.showNearestFolderNoteInSidebar && !wasSelectedFolder) {
                scheduleShortcutRelease();
                return;
            }

            runAsyncAction(() =>
                openFolderNoteFile({
                    app,
                    commandQueue,
                    folder,
                    folderNote,
                    context: openContext,
                    openInRightSidebar: openFolderNoteInRightSidebar
                })
            );
            scheduleShortcutRelease();
        },
        [
            app,
            commandQueue,
            focusListPaneAfterRightSidebarFolderNoteSelection,
            handleShortcutFolderActivate,
            isMobile,
            openFolderNoteInRightSidebar,
            scheduleShortcutRelease,
            selectedFolder,
            selectionDispatch,
            setActiveShortcut,
            selectionType,
            settings
        ]
    );

    const handleShortcutFolderNoteMouseDown = useCallback(
        (folder: TFolder, event: React.MouseEvent<HTMLSpanElement>) => {
            if (event.button !== 1 || !settings.enableFolderNotes || !settings.enableFolderNoteLinks) {
                return;
            }

            const folderNote = getFolderNote(folder, settings);
            if (!folderNote) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            selectionDispatch({ type: 'SET_SELECTED_FOLDER', folder, autoSelectedFile: null });
            runAsyncAction(() => openFolderNoteFile({ app, commandQueue, folder, folderNote, context: 'tab' }));
        },
        [app, commandQueue, selectionDispatch, settings]
    );

    const handleShortcutNoteActivate = useCallback(
        (note: TFile, shortcutKey: string, event?: React.MouseEvent<HTMLDivElement>) => {
            if (event && shouldOpenNoteClickInNewTab(event, settings.multiSelectModifier, isMobile)) {
                runAsyncAction(() => openFileInContext({ app, commandQueue, file: note, context: 'tab' }));
                return;
            }

            setActiveShortcut(shortcutKey);
            if (selectionType === ItemType.TAG && onRevealShortcutFile) {
                onRevealShortcutFile(note);
            } else {
                onRevealFile(note);
            }

            openNotePreview(note);
            if (isMobile && app.workspace.leftSplit) {
                app.workspace.leftSplit.collapse();
            }

            const focusPane = uiState.singlePane ? uiState.currentSinglePaneView : 'files';
            uiDispatch({ type: 'ACTIVATE_PANE', target: focusPane });
            scheduleShortcutRelease();
        },
        [
            app,
            commandQueue,
            isMobile,
            onRevealFile,
            onRevealShortcutFile,
            openNotePreview,
            scheduleShortcutRelease,
            selectionType,
            setActiveShortcut,
            settings.multiSelectModifier,
            uiDispatch,
            uiState.currentSinglePaneView,
            uiState.singlePane
        ]
    );

    const handleShortcutNoteMouseDown = useCallback(
        (event: React.MouseEvent<HTMLDivElement>, note: TFile) => {
            if (event.button !== 1) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            runAsyncAction(() => openFileInContext({ app, commandQueue, file: note, context: 'tab' }));
        },
        [app, commandQueue]
    );

    const handleRecentNoteActivate = useCallback(
        (note: TFile, event?: React.MouseEvent<HTMLDivElement>) => {
            if (event && shouldOpenNoteClickInNewTab(event, settings.multiSelectModifier, isMobile)) {
                runAsyncAction(() => openFileInContext({ app, commandQueue, file: note, context: 'tab' }));
                return;
            }

            if (selectionType === ItemType.TAG && onRevealShortcutFile) {
                onRevealShortcutFile(note);
            } else {
                onRevealFile(note);
            }

            openNotePreview(note);
            if (isMobile && app.workspace.leftSplit) {
                app.workspace.leftSplit.collapse();
            }

            const focusPane = uiState.singlePane ? uiState.currentSinglePaneView : 'files';
            uiDispatch({ type: 'ACTIVATE_PANE', target: focusPane });
        },
        [
            app,
            commandQueue,
            isMobile,
            onRevealFile,
            onRevealShortcutFile,
            openNotePreview,
            selectionType,
            settings.multiSelectModifier,
            uiDispatch,
            uiState.currentSinglePaneView,
            uiState.singlePane
        ]
    );

    const handleShortcutSearchActivate = useCallback(
        (shortcutKey: string, searchShortcut: SearchShortcut) => {
            setActiveShortcut(shortcutKey);
            if (onExecuteSearchShortcut) {
                runAsyncAction(() => onExecuteSearchShortcut(shortcutKey, searchShortcut));
            }
            scheduleShortcutRelease();
        },
        [onExecuteSearchShortcut, scheduleShortcutRelease, setActiveShortcut]
    );

    const handleShortcutTagActivate = useCallback(
        (tagPath: string, shortcutKey: string) => {
            setActiveShortcut(shortcutKey);
            const canonicalPath = resolveCanonicalTagPath(tagPath, tagTree);
            if (!canonicalPath) {
                scheduleShortcutRelease();
                return;
            }
            onRevealTag(canonicalPath, { skipScroll: settings.skipAutoScroll, source: 'shortcut' });

            if (!uiState.singlePane) {
                uiDispatch({ type: 'ACTIVATE_PANE', target: 'navigation' });
                const container = rootContainerRef.current;
                if (container) {
                    container.focus();
                }
            }

            selectionDispatch({ type: 'SET_KEYBOARD_NAVIGATION', isKeyboardNavigation: true });
            scheduleShortcutRelease();
        },
        [
            onRevealTag,
            rootContainerRef,
            scheduleShortcutRelease,
            selectionDispatch,
            setActiveShortcut,
            settings.skipAutoScroll,
            tagTree,
            uiDispatch,
            uiState.singlePane
        ]
    );

    const handleShortcutPropertyActivate = useCallback(
        (propertyNodeId: string, shortcutKey: string) => {
            setActiveShortcut(shortcutKey);
            const didReveal = onRevealProperty(propertyNodeId, { skipScroll: settings.skipAutoScroll, source: 'shortcut' });
            if (!didReveal) {
                scheduleShortcutRelease();
                return false;
            }

            if (!uiState.singlePane) {
                uiDispatch({ type: 'ACTIVATE_PANE', target: 'navigation' });
                const container = rootContainerRef.current;
                if (container) {
                    container.focus();
                }
            }

            selectionDispatch({ type: 'SET_KEYBOARD_NAVIGATION', isKeyboardNavigation: true });
            scheduleShortcutRelease();
            return true;
        },
        [
            onRevealProperty,
            rootContainerRef,
            scheduleShortcutRelease,
            selectionDispatch,
            setActiveShortcut,
            settings.skipAutoScroll,
            uiDispatch,
            uiState.singlePane
        ]
    );

    const openShortcutByNumber = useCallback(
        async (shortcutNumber: number) => {
            if (!Number.isInteger(shortcutNumber) || shortcutNumber < 1) {
                return false;
            }

            const entry = hydratedShortcuts[shortcutNumber - 1];
            if (!entry || entry.isMissing) {
                return false;
            }

            const { key, shortcut, folder, note, search, tagPath, propertyNodeId } = entry;

            if (isFolderShortcut(shortcut) && folder) {
                handleShortcutFolderActivate(folder, key);
                return true;
            }

            if (isNoteShortcut(shortcut) && note) {
                handleShortcutNoteActivate(note, key);
                return true;
            }

            if (isSearchShortcut(shortcut)) {
                handleShortcutSearchActivate(key, search ?? shortcut);
                return true;
            }

            if (isTagShortcut(shortcut)) {
                const resolvedTagPath = tagPath ?? shortcut.tagPath;
                if (!resolvedTagPath) {
                    return false;
                }
                handleShortcutTagActivate(resolvedTagPath, key);
                return true;
            }

            if (isPropertyShortcut(shortcut)) {
                const resolvedNodeId = resolvePropertyShortcutNodeId(propertyNodeId, shortcut.nodeId);
                if (!resolvedNodeId) {
                    return false;
                }
                return handleShortcutPropertyActivate(resolvedNodeId, key);
            }

            return false;
        },
        [
            handleShortcutFolderActivate,
            handleShortcutNoteActivate,
            handleShortcutPropertyActivate,
            handleShortcutSearchActivate,
            handleShortcutTagActivate,
            hydratedShortcuts
        ]
    );

    return {
        handleShortcutFolderActivate,
        handleShortcutFolderNoteClick,
        handleShortcutFolderNoteMouseDown,
        handleShortcutNoteActivate,
        handleShortcutNoteMouseDown,
        handleRecentNoteActivate,
        handleShortcutSearchActivate,
        handleShortcutTagActivate,
        handleShortcutPropertyActivate,
        openShortcutByNumber
    };
}
