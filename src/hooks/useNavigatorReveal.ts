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

import { useEffect, useRef, useCallback, RefObject, useState } from 'react';
import { TFile, TFolder, App, FileView, WorkspaceLeaf } from 'obsidian';
import { getLeafSplitLocation } from '../utils/workspaceSplit';
import { isLeafInNavigatorWindow, shouldSkipNavigatorAutoReveal } from '../utils/autoRevealUtils';
import type { NavigationPaneHandle } from '../components/NavigationPane';
import { useExpansionState, useExpansionDispatch } from '../context/ExpansionContext';
import { useSelectionState, useSelectionDispatch } from '../context/SelectionContext';
import type { SelectionRevealSource } from '../context/SelectionContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import { useUIState, useUIDispatch, type ContentPane } from '../context/UIStateContext';
import { useFileCache } from '../context/StorageContext';
import { useCommandQueue } from '../context/ServicesContext';
import { determineTagToReveal, findNearestVisibleTagAncestor, normalizeTagPath } from '../utils/tagUtils';
import {
    ItemType,
    NOTEBOOK_NAVIGATOR_VIEW,
    PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
    TAGGED_TAG_ID,
    TAGS_ROOT_VIRTUAL_FOLDER_ID,
    UNTAGGED_TAG_ID
} from '../types';
import { TIMEOUTS } from '../types/obsidian-extended';
import { doesFolderContainPath } from '../utils/pathUtils';
import type { Align } from '../types/scroll';
import { navigateToTag as navigateToTagInternal, type NavigateToTagOptions } from '../utils/tagNavigation';
import { navigateToProperty as navigateToPropertyInternal, type NavigateToPropertyOptions } from '../utils/propertyNavigation';
import { isFileHiddenBySettings } from '../utils/exclusionUtils';
import { strings } from '../i18n';
import { showNotice } from '../utils/noticeUtils';
import { registerActiveFileWorkspaceListeners } from '../utils/workspaceActiveFileEvents';
import {
    determinePropertyToReveal,
    getPropertyKeyNodeIdFromNodeId,
    isPropertyTreeNodeId,
    type PropertySelectionNodeId
} from '../utils/propertyTree';
import { expandNavigationTreeItems } from '../utils/navigationExpansion';

interface UseNavigatorRevealOptions {
    app: App;
    navigationPaneRef: RefObject<NavigationPaneHandle | null>;
    focusNavigationPane: () => void;
    focusFilesPane: () => void;
}

export interface RevealFileOptions {
    // Indicates the source of the reveal action
    source?: SelectionRevealSource;
    // True if this reveal happens during plugin startup
    isStartupReveal?: boolean;
    // Prevents switching focus away from the navigation pane
    preserveNavigationFocus?: boolean;
    // Shows a warning notice when a hidden file falls back to selection-only behavior
    showHiddenFileNotice?: boolean;
}

export interface NavigateToFolderOptions {
    // Skip navigation pane scroll request when navigating to a folder
    skipScroll?: boolean;
    // Marks how this navigation was triggered
    source?: SelectionRevealSource;
    // When true, keep the navigation pane focused in single pane mode
    preserveNavigationFocus?: boolean;
    // When true, prevents automatic first-file selection for the target folder
    suppressAutoSelect?: boolean;
    // When true, keeps the current focus state unchanged
    skipFocus?: boolean;
    // Moves the current history pointer to a previous or next selection entry
    historyIndex?: number;
}

export interface RevealTagOptions {
    // Skip switching to files pane in single pane mode
    skipSinglePaneSwitch?: boolean;
    // Skip navigation pane scroll request when revealing a tag
    skipScroll?: boolean;
    // Marks how this reveal was triggered
    source?: SelectionRevealSource;
}

export interface RevealPropertyOptions {
    // Skip switching to files pane in single pane mode
    skipSinglePaneSwitch?: boolean;
    // Skip navigation pane scroll request when revealing a property
    skipScroll?: boolean;
    // Marks how this reveal was triggered
    source?: SelectionRevealSource;
}

/**
 * Custom hook that handles revealing items (files, folders, tags) in the Navigator, including:
 * - Manual reveal (via commands, context menus, or direct navigation)
 * - Auto-reveal (on file open/startup when enabled in settings)
 * - Parent expansion behavior (expanding ancestor folders/tags to make items visible)
 * - View switching (between navigation and file list in single-pane mode)
 *
 * This hook encapsulates the complex reveal logic that was previously
 * in the NotebookNavigatorComponent, making it reusable and testable.
 */
export function useNavigatorReveal({ app, navigationPaneRef, focusNavigationPane, focusFilesPane }: UseNavigatorRevealOptions) {
    const settings = useSettingsState();
    const uxPreferences = useUXPreferences();
    const includeDescendantNotes = uxPreferences.includeDescendantNotes;
    const expansionState = useExpansionState();
    const expansionDispatch = useExpansionDispatch();
    const selectionState = useSelectionState();
    const selectionDispatch = useSelectionDispatch();
    const uiState = useUIState();
    const uiDispatch = useUIDispatch();
    const { getDB, getPropertyTree, findTagInTree } = useFileCache();
    const commandQueue = useCommandQueue();
    const activatePane = useCallback(
        (target: ContentPane) => {
            if (target === 'navigation') {
                focusNavigationPane();
            } else {
                focusFilesPane();
            }
        },
        [focusFilesPane, focusNavigationPane]
    );

    // Auto-reveal state
    const [fileToReveal, setFileToReveal] = useState<TFile | null>(null);
    const [isStartupReveal, setIsStartupReveal] = useState<boolean>(false);
    const activeFileRef = useRef<string | null>(null);
    const hasInitializedRef = useRef<boolean>(false);
    const selectedFilePathRef = useRef<string | null>(null);

    useEffect(() => {
        // Track the latest selected file path for workspace event handlers without re-registering listeners.
        selectedFilePathRef.current = selectionState.selectedFile?.path ?? null;
    }, [selectionState.selectedFile]);

    const shouldIgnoreOtherWindowAutoReveal = useCallback(
        (activeLeaf: WorkspaceLeaf | null) => {
            if (!settings.autoRevealIgnoreOtherWindows || !activeLeaf) {
                return false;
            }

            const navigatorLeaves = app.workspace.getLeavesOfType(NOTEBOOK_NAVIGATOR_VIEW);
            if (navigatorLeaves.length === 0) {
                return false;
            }

            return !isLeafInNavigatorWindow(activeLeaf, navigatorLeaves);
        },
        [app, settings.autoRevealIgnoreOtherWindows]
    );

    const handleHiddenFileReveal = useCallback(
        (file: TFile, options?: RevealFileOptions): boolean => {
            if (!isFileHiddenBySettings(file, settings, app, uxPreferences.showHiddenItems)) {
                return false;
            }

            // Hidden files are not revealable while hidden items are off.
            // Keep the current folder/tag/property context and update selected file only.
            selectionDispatch({ type: 'SET_SELECTED_FILE', file });
            if (options?.showHiddenFileNotice) {
                showNotice(strings.fileSystem.notifications.hiddenFileReveal, { variant: 'warning' });
            }
            return true;
        },
        [selectionDispatch, settings, app, uxPreferences.showHiddenItems]
    );

    const getRevealTargetFolder = useCallback(
        (folder: TFolder | null): { target: TFolder | null; expandAncestors: boolean } => {
            if (!folder) {
                return { target: null, expandAncestors: false };
            }

            if (!includeDescendantNotes) {
                return { target: folder, expandAncestors: true };
            }

            const root = app.vault.getRoot();
            const rootPath = root?.path ?? '/';

            const isFolderVisible = (candidate: TFolder): boolean => {
                if (!settings.showRootFolder && root && candidate === root) {
                    return false;
                }

                let current: TFolder | null = candidate;
                while (current) {
                    const parent: TFolder | null = current.parent;
                    if (!parent) {
                        break;
                    }
                    const parentIsRoot = root && parent.path === rootPath;

                    if (parentIsRoot && !settings.showRootFolder) {
                        current = parent;
                        continue;
                    }

                    if (!expansionState.expandedFolders.has(parent.path)) {
                        return false;
                    }

                    current = parent;
                }

                return true;
            };

            let current: TFolder | null = folder;
            while (current && !isFolderVisible(current)) {
                current = current.parent;
            }

            if (!current) {
                const fallback = settings.showRootFolder ? (root ?? folder) : folder;
                return { target: fallback, expandAncestors: false };
            }

            if (!settings.showRootFolder && root && current === root) {
                return { target: folder, expandAncestors: false };
            }

            return { target: current, expandAncestors: false };
        },
        [includeDescendantNotes, settings.showRootFolder, expansionState.expandedFolders, app]
    );

    const expandFolderPaths = useCallback(
        (folderPaths: string[]) => {
            expandNavigationTreeItems({
                type: 'folder',
                ids: folderPaths,
                collapseOtherBranches: settings.collapseOtherBranchesOnExpand,
                dispatch: expansionDispatch
            });
        },
        [expansionDispatch, settings.collapseOtherBranchesOnExpand]
    );

    const expandTagPaths = useCallback(
        (tagPaths: string[]) => {
            expandNavigationTreeItems({
                type: 'tag',
                ids: tagPaths,
                collapseOtherBranches: settings.collapseOtherBranchesOnExpand,
                dispatch: expansionDispatch
            });
        },
        [expansionDispatch, settings.collapseOtherBranchesOnExpand]
    );

    const expandPropertyNodeIds = useCallback(
        (propertyNodeIds: string[]) => {
            expandNavigationTreeItems({
                type: 'property',
                ids: propertyNodeIds,
                collapseOtherBranches: settings.collapseOtherBranchesOnExpand,
                dispatch: expansionDispatch
            });
        },
        [expansionDispatch, settings.collapseOtherBranchesOnExpand]
    );

    /**
     * Handles manual file reveals triggered from commands or context menus.
     * Selects the file, switches the view to its parent folder (always the real parent when descendant notes are shown),
     * expands any collapsed ancestor folders, focuses the list pane, and requests navigation pane scroll to the target folder.
     * Returns false when the file cannot be revealed in navigator context, including
     * hidden files while hidden items are off. Hidden files still update selected file
     * as a fallback and may show a notice when requested by the caller.
     *
     * @param file - File to surface in the navigator
     */
    const revealFileInActualFolder = useCallback(
        (file: TFile, options?: RevealFileOptions) => {
            if (!file?.parent) {
                return false;
            }

            if (handleHiddenFileReveal(file, options)) {
                return false;
            }

            const parentFolder = file.parent;
            // Determine which folder the navigator should display after reveal
            const { target, expandAncestors } = getRevealTargetFolder(parentFolder);

            // Always resolve to the actual parent folder for manual reveals
            const resolvedFolder = includeDescendantNotes ? parentFolder : (target ?? parentFolder);

            const foldersToExpand: string[] = [];
            let ancestor: TFolder | null = parentFolder.parent;

            // Collect ancestor folders so manual reveal can expand collapsed levels
            while (ancestor) {
                foldersToExpand.unshift(ancestor.path);
                if (ancestor.path === '/') break;
                ancestor = ancestor.parent;
            }

            const shouldExpandFolders =
                foldersToExpand.length > 0 && (expandAncestors || foldersToExpand.some(path => !expansionState.expandedFolders.has(path)));

            if (shouldExpandFolders) {
                // Expand collapsed ancestors to ensure the folder becomes visible in navigation pane
                expandFolderPaths(foldersToExpand);
            }

            // Switch selection to the file and its resolved folder so the list pane updates immediately
            // `REVEAL_FILE` marks this update as a reveal operation. Scroll orchestration for reveals uses explicit
            // `requestScroll(...)` calls (below) instead of selection-change auto-scroll.
            selectionDispatch({
                type: 'REVEAL_FILE',
                file,
                preserveFolder: false,
                isManualReveal: true,
                targetFolder: resolvedFolder ?? undefined,
                source: options?.source
            });

            uiDispatch({ type: 'ACTIVATE_PANE', target: 'files' });

            if (navigationPaneRef.current && resolvedFolder) {
                // Scroll navigation pane so the resolved folder stays in view for manual reveals
                navigationPaneRef.current.requestScroll(resolvedFolder.path, { align: 'auto', itemType: ItemType.FOLDER });
            }

            return true;
        },
        [
            expansionState.expandedFolders,
            expandFolderPaths,
            selectionDispatch,
            uiDispatch,
            navigationPaneRef,
            getRevealTargetFolder,
            includeDescendantNotes,
            handleHiddenFileReveal
        ]
    );

    /**
     * Reveals a tag in the navigation pane by expanding parent tags if needed.
     *
     * @param tagPath - The tag path to reveal (without # prefix)
     */
    const revealTag = useCallback(
        (tagPath: string, options?: RevealTagOptions) => {
            const preserveNavigationFocus = Boolean(options?.skipSinglePaneSwitch);
            const canonicalPath = navigateToTagInternal(
                {
                    showTags: settings.showTags,
                    showAllTagsFolder: settings.showAllTagsFolder,
                    expandedTags: expansionState.expandedTags,
                    expandedVirtualFolders: expansionState.expandedVirtualFolders,
                    collapseOtherBranchesOnExpand: settings.collapseOtherBranchesOnExpand,
                    expansionDispatch,
                    selectionDispatch,
                    activatePane,
                    findTagInTree,
                    requestScroll: (path, scrollOptions) => {
                        navigationPaneRef.current?.requestScroll(path, scrollOptions);
                    }
                },
                tagPath,
                {
                    preserveNavigationFocus,
                    skipScroll: options?.skipScroll,
                    source: options?.source
                }
            );
            if (!canonicalPath) {
                return;
            }

            // If we have a selected file, trigger a reveal to ensure proper item visibility
            // This makes tag reveal follow the same flow as folder reveal
            if (selectionState.selectedFile) {
                selectionDispatch({
                    type: 'REVEAL_FILE',
                    file: selectionState.selectedFile,
                    preserveFolder: true, // We're in tag view, preserve it
                    isManualReveal: false, // This is part of auto-reveal
                    targetTag: canonicalPath,
                    source: options?.source
                });
            }
        },
        [
            expansionState.expandedTags,
            expansionState.expandedVirtualFolders,
            expansionDispatch,
            selectionDispatch,
            activatePane,
            findTagInTree,
            selectionState.selectedFile,
            navigationPaneRef,
            settings.showAllTagsFolder,
            settings.collapseOtherBranchesOnExpand,
            settings.showTags
        ]
    );

    /**
     * Reveals a property in the navigation pane by expanding root and parent key nodes if needed.
     *
     * @param propertyNodeId - Property node id to reveal (key or key=value)
     */
    const revealProperty = useCallback(
        (propertyNodeId: string, options?: RevealPropertyOptions): boolean => {
            const preserveNavigationFocus = Boolean(options?.skipSinglePaneSwitch);
            const resolvedNodeId = navigateToPropertyInternal(
                {
                    showProperties: settings.showProperties,
                    showAllPropertiesFolder: settings.showAllPropertiesFolder,
                    propertyTree: getPropertyTree(),
                    expandedProperties: expansionState.expandedProperties,
                    expandedVirtualFolders: expansionState.expandedVirtualFolders,
                    collapseOtherBranchesOnExpand: settings.collapseOtherBranchesOnExpand,
                    expansionDispatch,
                    selectionDispatch,
                    activatePane,
                    requestScroll: (nodeId, scrollOptions) => {
                        navigationPaneRef.current?.requestScroll(nodeId, scrollOptions);
                    }
                },
                propertyNodeId,
                {
                    preserveNavigationFocus,
                    skipScroll: options?.skipScroll,
                    source: options?.source
                }
            );
            if (!resolvedNodeId) {
                return false;
            }

            // If we have a selected file, trigger a reveal to ensure proper item visibility
            // This makes property reveal follow the same flow as tag/folder reveal
            if (selectionState.selectedFile) {
                selectionDispatch({
                    type: 'REVEAL_FILE',
                    file: selectionState.selectedFile,
                    preserveFolder: true, // We're in property view, preserve it
                    isManualReveal: false, // This is part of auto-reveal
                    targetProperty: resolvedNodeId,
                    source: options?.source
                });
            }

            return true;
        },
        [
            expansionState.expandedProperties,
            expansionState.expandedVirtualFolders,
            expansionDispatch,
            selectionDispatch,
            activatePane,
            selectionState.selectedFile,
            navigationPaneRef,
            settings.showAllPropertiesFolder,
            settings.collapseOtherBranchesOnExpand,
            settings.showProperties,
            getPropertyTree
        ]
    );

    /**
     * Handles implicit file reveals (auto-reveal, shortcuts, recent notes).
     * Keeps the current visible context when possible by targeting the first ancestor that is currently expanded,
     * switches tag views when needed, and only falls back to the real parent when no ancestor is visible.
     *
     * @param file - File to surface while preserving the visible navigation context
     */
    const revealFileInNearestFolder = useCallback(
        (file: TFile, options?: RevealFileOptions) => {
            if (!file?.parent) return;

            if (handleHiddenFileReveal(file, options)) {
                return;
            }

            // Check if we're in tag view and should switch tags
            let targetTag: string | null | undefined = undefined;
            let targetProperty: PropertySelectionNodeId | null | undefined = undefined;
            let targetFolderOverride: TFolder | null = null;
            let preserveFolder = false;
            const revealSource: SelectionRevealSource | undefined = options?.isStartupReveal ? 'startup' : options?.source;
            const isAutoOrStartupReveal = revealSource === 'auto' || revealSource === 'startup';
            const useShortestPath = !isAutoOrStartupReveal || settings.autoRevealShortestPath;
            const shouldCenterNavigation = Boolean(options?.isStartupReveal && settings.startView === 'navigation');
            const navigationAlign: Align = shouldCenterNavigation ? 'center' : 'auto';
            if (selectionState.selectionType === 'tag') {
                const resolvedTag = determineTagToReveal(
                    file,
                    selectionState.selectedTag,
                    settings,
                    getDB(),
                    includeDescendantNotes,
                    useShortestPath
                );
                targetTag = resolvedTag;

                if (resolvedTag) {
                    const normalizedResolvedTag = normalizeTagPath(resolvedTag);
                    if (normalizedResolvedTag) {
                        if (includeDescendantNotes && useShortestPath) {
                            const isTagsRootCollapsed =
                                settings.showTags &&
                                settings.showAllTagsFolder &&
                                !expansionState.expandedVirtualFolders.has(TAGS_ROOT_VIRTUAL_FOLDER_ID);

                            if (isTagsRootCollapsed) {
                                if (normalizedResolvedTag === UNTAGGED_TAG_ID) {
                                    const nextExpandedVirtualFolders = new Set(expansionState.expandedVirtualFolders);
                                    nextExpandedVirtualFolders.add(TAGS_ROOT_VIRTUAL_FOLDER_ID);
                                    expansionDispatch({ type: 'SET_EXPANDED_VIRTUAL_FOLDERS', folders: nextExpandedVirtualFolders });
                                    targetTag = UNTAGGED_TAG_ID;
                                } else {
                                    targetTag = TAGGED_TAG_ID;
                                }
                            } else {
                                targetTag = findNearestVisibleTagAncestor(normalizedResolvedTag, expansionState.expandedTags);
                            }
                        } else {
                            if (
                                settings.showTags &&
                                settings.showAllTagsFolder &&
                                !expansionState.expandedVirtualFolders.has(TAGS_ROOT_VIRTUAL_FOLDER_ID)
                            ) {
                                const nextExpandedVirtualFolders = new Set(expansionState.expandedVirtualFolders);
                                nextExpandedVirtualFolders.add(TAGS_ROOT_VIRTUAL_FOLDER_ID);
                                expansionDispatch({ type: 'SET_EXPANDED_VIRTUAL_FOLDERS', folders: nextExpandedVirtualFolders });
                            }

                            if (normalizedResolvedTag.includes('/')) {
                                const segments = normalizedResolvedTag.split('/');
                                const tagsToExpand: string[] = [];
                                for (let i = 1; i < segments.length; i += 1) {
                                    tagsToExpand.push(segments.slice(0, i).join('/'));
                                }

                                if (tagsToExpand.some(path => !expansionState.expandedTags.has(path))) {
                                    expandTagPaths(tagsToExpand);
                                }
                            }

                            targetTag = normalizedResolvedTag;
                        }
                    }
                }
            }

            if (selectionState.selectionType === 'property') {
                const fileData = getDB().getFile(file.path);
                const resolvedProperty = settings.showProperties
                    ? determinePropertyToReveal(
                          fileData?.properties ?? null,
                          selectionState.selectedProperty,
                          settings,
                          includeDescendantNotes
                      )
                    : null;
                targetProperty = resolvedProperty;

                if (resolvedProperty) {
                    const isPropertiesRootCollapsed =
                        settings.showProperties &&
                        settings.showAllPropertiesFolder &&
                        !expansionState.expandedVirtualFolders.has(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID);

                    if (includeDescendantNotes && isPropertiesRootCollapsed) {
                        targetProperty = PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
                    } else {
                        const propertyNodeId = resolvedProperty;
                        const rawKeyNodeId =
                            propertyNodeId !== PROPERTIES_ROOT_VIRTUAL_FOLDER_ID ? getPropertyKeyNodeIdFromNodeId(propertyNodeId) : null;
                        const keyNodeId = rawKeyNodeId && isPropertyTreeNodeId(rawKeyNodeId) ? rawKeyNodeId : null;
                        const keyCollapsed = Boolean(
                            keyNodeId && keyNodeId !== propertyNodeId && !expansionState.expandedProperties.has(keyNodeId)
                        );

                        if (includeDescendantNotes && keyCollapsed) {
                            targetProperty = keyNodeId;
                        } else {
                            if (
                                !includeDescendantNotes &&
                                settings.showProperties &&
                                settings.showAllPropertiesFolder &&
                                !expansionState.expandedVirtualFolders.has(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID)
                            ) {
                                const nextExpandedVirtualFolders = new Set(expansionState.expandedVirtualFolders);
                                nextExpandedVirtualFolders.add(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID);
                                expansionDispatch({ type: 'SET_EXPANDED_VIRTUAL_FOLDERS', folders: nextExpandedVirtualFolders });
                            }

                            if (!includeDescendantNotes && keyCollapsed && keyNodeId) {
                                expandPropertyNodeIds([keyNodeId]);
                            }
                        }
                    }
                }
            }

            let resolvedFolder: TFolder | null = null;

            if (
                (targetTag === null || targetTag === undefined) &&
                (targetProperty === null || targetProperty === undefined) &&
                file.parent
            ) {
                if (useShortestPath) {
                    const { target, expandAncestors } = getRevealTargetFolder(file.parent);
                    resolvedFolder = target;

                    const selectedFolder = selectionState.selectedFolder;
                    // Check if selected folder contains file when including descendants
                    const shouldPreserveSelectedFolder =
                        includeDescendantNotes &&
                        selectionState.selectionType === 'folder' &&
                        selectedFolder !== null &&
                        doesFolderContainPath(selectedFolder.path, file.parent.path);

                    if (target) {
                        const isCurrentFolderSelected = selectedFolder && selectedFolder.path === target.path;
                        if (isCurrentFolderSelected || shouldPreserveSelectedFolder) {
                            preserveFolder = true;
                        } else {
                            targetFolderOverride = target;
                        }
                    } else if (shouldPreserveSelectedFolder) {
                        // No reveal target but selected folder contains the file
                        preserveFolder = true;
                    }

                    if (expandAncestors) {
                        const foldersToExpand: string[] = [];
                        let currentFolder: TFolder | null = file.parent;

                        if (currentFolder && currentFolder.parent) {
                            currentFolder = currentFolder.parent;
                            while (currentFolder) {
                                foldersToExpand.unshift(currentFolder.path);
                                if (currentFolder.path === '/') break;
                                currentFolder = currentFolder.parent;
                            }
                        }

                        if (foldersToExpand.some(path => !expansionState.expandedFolders.has(path))) {
                            expandFolderPaths(foldersToExpand);
                        }
                    }
                } else {
                    resolvedFolder = file.parent;
                    targetFolderOverride = file.parent;

                    const foldersToExpand: string[] = [];
                    let currentFolder: TFolder | null = file.parent.parent;
                    while (currentFolder) {
                        foldersToExpand.unshift(currentFolder.path);
                        if (currentFolder.path === '/') break;
                        currentFolder = currentFolder.parent;
                    }

                    if (foldersToExpand.some(path => !expansionState.expandedFolders.has(path))) {
                        expandFolderPaths(foldersToExpand);
                    }
                }
            }

            // Trigger the reveal - this is an auto-reveal, not manual
            // `REVEAL_FILE` marks this update as a reveal operation. NavigationPane selection auto-scroll is suppressed
            // while the reveal flag is set; reveals request navigation scrolling explicitly via `requestScroll(...)`.
            selectionDispatch({
                type: 'REVEAL_FILE',
                file,
                preserveFolder,
                isManualReveal: false,
                targetTag,
                targetProperty,
                targetFolder: targetFolderOverride ?? undefined,
                source: revealSource
            });

            // Implicit file reveals (auto-reveal, shortcuts, recent notes) update selection/expansion only.
            // Keep the current single-pane view (no navigation → files switch) during external file opens.
            // If implicit reveals should switch panes in the future, activate the files pane here.

            const shouldSkipShortcutScroll = Boolean(settings.skipAutoScroll && revealSource === 'shortcut');
            if (!shouldSkipShortcutScroll) {
                if (targetTag && navigationPaneRef.current) {
                    navigationPaneRef.current.requestScroll(targetTag, { align: navigationAlign, itemType: ItemType.TAG });
                } else if (!targetTag && targetProperty && navigationPaneRef.current) {
                    navigationPaneRef.current.requestScroll(targetProperty, { align: navigationAlign, itemType: ItemType.PROPERTY });
                } else if (!targetTag && !targetProperty && navigationPaneRef.current) {
                    const scrollFolder =
                        targetFolderOverride ??
                        (preserveFolder && selectionState.selectedFolder ? selectionState.selectedFolder : (resolvedFolder ?? file.parent));
                    if (scrollFolder) {
                        navigationPaneRef.current.requestScroll(scrollFolder.path, { align: navigationAlign, itemType: ItemType.FOLDER });
                    }
                }
            }
        },
        [
            settings,
            includeDescendantNotes,
            selectionState.selectedFolder,
            selectionState.selectionType,
            selectionState.selectedTag,
            selectionState.selectedProperty,
            expansionState.expandedFolders,
            expansionState.expandedTags,
            expansionState.expandedProperties,
            expansionState.expandedVirtualFolders,
            expansionDispatch,
            expandFolderPaths,
            expandPropertyNodeIds,
            expandTagPaths,
            selectionDispatch,
            getDB,
            getRevealTargetFolder,
            navigationPaneRef,
            handleHiddenFileReveal
        ]
    );

    /**
     * Navigates to a folder by path, expanding ancestors and selecting it.
     * Used by the "Navigate to folder" command.
     *
     * @param folderOrPath - Folder instance or its path
     */
    const navigateToFolder = useCallback(
        (folderOrPath: TFolder | string, options?: NavigateToFolderOptions) => {
            const folder = typeof folderOrPath === 'string' ? app.vault.getFolderByPath(folderOrPath) : folderOrPath;
            if (!folder) {
                return false;
            }

            // Expand all ancestors to make the folder visible
            const foldersToExpand: string[] = [];
            let currentFolder: TFolder | null = folder.parent;

            while (currentFolder) {
                foldersToExpand.unshift(currentFolder.path);
                if (currentFolder.path === '/') break;
                currentFolder = currentFolder.parent;
            }

            // Expand folders if needed
            const needsExpansion = foldersToExpand.some(path => !expansionState.expandedFolders.has(path));
            if (needsExpansion) {
                expandFolderPaths(foldersToExpand);
            }

            const suppressAutoSelect = Boolean(options?.suppressAutoSelect);
            // Select the folder
            selectionDispatch({
                type: 'SET_SELECTED_FOLDER',
                folder,
                source: options?.source,
                autoSelectedFile: suppressAutoSelect ? null : undefined,
                historyIndex: options?.historyIndex
            });

            if (!options?.skipFocus) {
                if (uiState.singlePane) {
                    if (options?.preserveNavigationFocus) {
                        focusNavigationPane();
                    } else {
                        focusFilesPane();
                    }
                } else {
                    focusNavigationPane();
                }
            }

            const shouldSkipScroll = Boolean(options?.skipScroll);
            if (!shouldSkipScroll && navigationPaneRef.current) {
                navigationPaneRef.current.requestScroll(folder.path, { align: 'auto', itemType: ItemType.FOLDER });
            }

            return true;
        },
        [
            app,
            expansionState.expandedFolders,
            expandFolderPaths,
            selectionDispatch,
            uiState,
            navigationPaneRef,
            focusNavigationPane,
            focusFilesPane
        ]
    );

    /**
     * Navigates to a tag by selecting it in the navigation pane.
     */
    const navigateToTag = useCallback(
        (tagPath: string, options?: NavigateToTagOptions) => {
            return navigateToTagInternal(
                {
                    showTags: settings.showTags,
                    showAllTagsFolder: settings.showAllTagsFolder,
                    expandedTags: expansionState.expandedTags,
                    expandedVirtualFolders: expansionState.expandedVirtualFolders,
                    collapseOtherBranchesOnExpand: settings.collapseOtherBranchesOnExpand,
                    expansionDispatch,
                    selectionDispatch,
                    activatePane,
                    findTagInTree,
                    requestScroll: (path, scrollOptions) => {
                        navigationPaneRef.current?.requestScroll(path, scrollOptions);
                    }
                },
                tagPath,
                options
            );
        },
        [
            expansionDispatch,
            expansionState.expandedTags,
            expansionState.expandedVirtualFolders,
            findTagInTree,
            activatePane,
            navigationPaneRef,
            selectionDispatch,
            settings.showAllTagsFolder,
            settings.collapseOtherBranchesOnExpand,
            settings.showTags
        ]
    );

    /**
     * Navigates to a property by selecting it in the navigation pane.
     */
    const navigateToProperty = useCallback(
        (propertyNodeId: string, options?: NavigateToPropertyOptions) => {
            return navigateToPropertyInternal(
                {
                    showProperties: settings.showProperties,
                    showAllPropertiesFolder: settings.showAllPropertiesFolder,
                    propertyTree: getPropertyTree(),
                    expandedProperties: expansionState.expandedProperties,
                    expandedVirtualFolders: expansionState.expandedVirtualFolders,
                    collapseOtherBranchesOnExpand: settings.collapseOtherBranchesOnExpand,
                    expansionDispatch,
                    selectionDispatch,
                    activatePane,
                    requestScroll: (nodeId, scrollOptions) => {
                        navigationPaneRef.current?.requestScroll(nodeId, scrollOptions);
                    }
                },
                propertyNodeId,
                options
            );
        },
        [
            expansionDispatch,
            expansionState.expandedProperties,
            expansionState.expandedVirtualFolders,
            activatePane,
            navigationPaneRef,
            selectionDispatch,
            settings.showAllPropertiesFolder,
            settings.collapseOtherBranchesOnExpand,
            settings.showProperties,
            getPropertyTree
        ]
    );

    // Auto-reveal effect: Reset fileToReveal after it's been consumed
    useEffect(() => {
        if (fileToReveal) {
            // Clear after a short delay to ensure the consumer has processed it
            const timer = window.setTimeout(() => {
                setFileToReveal(null);
                setIsStartupReveal(false);
            }, TIMEOUTS.DEBOUNCE_KEYBOARD);
            return () => window.clearTimeout(timer);
        }
    }, [fileToReveal]);

    // Auto-reveal effect: Detect which file needs revealing
    useEffect(() => {
        if (!settings.autoRevealActiveFile) return;

        /**
         * Detects if the active file has changed and triggers reveal if needed.
         * This is the single entry point for both file-open and active-leaf-change events.
         */
        const detectActiveFileChange = (candidateFile?: TFile | null, options?: { activeLeaf?: WorkspaceLeaf | null }) => {
            // Get the currently active file view
            const view = app.workspace.getActiveViewOfType(FileView);
            const activeViewFile = view?.file instanceof TFile ? view.file : null;
            const activeLeaf = options?.activeLeaf ?? view?.leaf ?? null;
            // Prefer the file from the event payload (file-open), falling back to the active view file.
            // The shared workspace listener suppresses background opens before this handler runs.
            // This handles cases where the active view is not updated yet when events fire.
            const file = candidateFile instanceof TFile ? candidateFile : activeViewFile;
            if (!file) {
                return;
            }

            // Check if the file was just created; always reveal newly created files
            const isRecentlyCreated = file.stat.ctime === file.stat.mtime && Date.now() - file.stat.ctime < TIMEOUTS.FILE_OPERATION_DELAY;

            if (!isRecentlyCreated) {
                if (settings.autoRevealIgnoreRightSidebar) {
                    const split = getLeafSplitLocation(app, activeLeaf);
                    if (split === 'right-sidebar') {
                        return;
                    }
                }

                if (shouldIgnoreOtherWindowAutoReveal(activeLeaf)) {
                    return;
                }
            }

            // Check if this is actually a different file
            if (activeFileRef.current === file.path) {
                return; // Same file, no change
            }

            // Update the active file reference
            activeFileRef.current = file.path;

            // Always reveal newly created files
            if (isRecentlyCreated) {
                setFileToReveal(file);
                return;
            }

            // Check if we're opening version history or in a new context
            const isOpeningVersionHistory = commandQueue && commandQueue.isOpeningVersionHistory();
            const isOpeningInNewContext = commandQueue && commandQueue.isOpeningInNewContext();

            // Skip auto-reveal when the navigator is focused and it opened the currently selected file.
            // This prevents auto-reveal from re-dispatching selection changes for navigator-initiated opens.
            const navigatorEl = activeDocument.querySelector('.nn-split-container');
            const hasNavigatorFocus = Boolean(navigatorEl && navigatorEl.contains(activeDocument.activeElement));

            const selectedFilePath = selectedFilePathRef.current;
            const isNavigatorOpeningSelectedFile = selectedFilePath !== null && selectedFilePath === file.path;

            const shouldSkipNavigatorAutoRevealForFile = shouldSkipNavigatorAutoReveal({
                hasNavigatorFocus,
                isOpeningVersionHistory,
                isOpeningInNewContext,
                isNavigatorOpeningSelectedFile
            });

            if (shouldSkipNavigatorAutoRevealForFile) {
                return;
            }

            // Don't reveal if we're opening a folder note
            const isOpeningFolderNote = commandQueue && commandQueue.isOpeningFolderNote();

            if (isOpeningFolderNote) {
                return;
            }

            // Reveal the file
            setFileToReveal(file);
        };

        const cleanup = registerActiveFileWorkspaceListeners({
            workspace: app.workspace,
            commandQueue,
            onChange: ({ candidateFile, activeLeaf }) => {
                detectActiveFileChange(candidateFile, { activeLeaf });
            }
        });

        // Check for currently active file on mount
        if (!hasInitializedRef.current) {
            const activeFile = app.workspace.getActiveFile();
            if (activeFile) {
                // Skip startup auto-reveal if the active leaf is in right sidebar
                const activeLeaf = app.workspace.getActiveViewOfType(FileView)?.leaf ?? null;
                const split = getLeafSplitLocation(app, activeLeaf);
                const isIgnoredRightSidebarLeaf = settings.autoRevealIgnoreRightSidebar && split === 'right-sidebar';
                if (!isIgnoredRightSidebarLeaf && !shouldIgnoreOtherWindowAutoReveal(activeLeaf)) {
                    activeFileRef.current = activeFile.path;
                    setIsStartupReveal(true);
                    setFileToReveal(activeFile);
                }
            }
            hasInitializedRef.current = true;
        }

        return () => {
            cleanup();
        };
    }, [
        app,
        app.workspace,
        settings.autoRevealActiveFile,
        settings.autoRevealIgnoreOtherWindows,
        settings.autoRevealIgnoreRightSidebar,
        settings.startView,
        commandQueue,
        shouldIgnoreOtherWindowAutoReveal
    ]);

    // Handle revealing the file when detected
    useEffect(() => {
        if (fileToReveal) {
            if (isStartupReveal) {
                // On startup, if we're already in tag view with the correct file selected, skip reveal but expand tags
                if (
                    settings.autoRevealShortestPath &&
                    selectionState.selectionType === ItemType.TAG &&
                    selectionState.selectedTag &&
                    selectionState.selectedFile?.path === fileToReveal.path
                ) {
                    const skipSinglePaneSwitch = uiState.singlePane && settings.startView === 'navigation';
                    revealTag(selectionState.selectedTag, { skipSinglePaneSwitch });
                    return;
                }
                // On startup, if we're already in property view with the correct file selected, skip reveal but expand properties
                if (
                    selectionState.selectionType === ItemType.PROPERTY &&
                    selectionState.selectedProperty &&
                    selectionState.selectedFile?.path === fileToReveal.path
                ) {
                    const skipSinglePaneSwitch = uiState.singlePane && settings.startView === 'navigation';
                    const didRevealProperty = revealProperty(selectionState.selectedProperty, { skipSinglePaneSwitch });
                    if (didRevealProperty) {
                        return;
                    }
                }
                // Use configured auto-reveal path behavior for startup reveals.
                revealFileInNearestFolder(fileToReveal, { source: 'auto', isStartupReveal: true });
            } else {
                revealFileInNearestFolder(fileToReveal, { source: 'auto' });
            }
        }
    }, [
        fileToReveal,
        isStartupReveal,
        revealFileInActualFolder,
        revealFileInNearestFolder,
        selectionState.selectionType,
        selectionState.selectedTag,
        selectionState.selectedProperty,
        selectionState.selectedFile,
        revealTag,
        revealProperty,
        settings.autoRevealShortestPath,
        settings.startView,
        uiState.singlePane
    ]);

    return {
        revealFileInActualFolder,
        revealFileInNearestFolder,
        navigateToFolder,
        navigateToTag,
        navigateToProperty,
        revealTag,
        revealProperty
    };
}
