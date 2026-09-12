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

import { useCallback, useMemo } from 'react';
import type { TFile } from 'obsidian';
import {
    useCommandQueue,
    useFileSystemOps,
    useMetadataService,
    usePropertyOperations,
    useServices,
    useTagOperations
} from '../../context/ServicesContext';
import { useExpansionDispatch, useExpansionState } from '../../context/ExpansionContext';
import {
    useNavigationSelection,
    useSelectionDispatch,
    useSelectionStateRefValue,
    useSelectionStateSubscription
} from '../../context/SelectionContext';
import { useSettingsState, useActiveProfile } from '../../context/SettingsContext';
import { useShortcuts } from '../../context/ShortcutsContext';
import { useFileCache } from '../../context/StorageContext';
import { useUIState, useUIDispatch } from '../../context/UIStateContext';
import { useUXPreferences } from '../../context/UXPreferencesContext';
import { createFrontmatterPropertyExclusionMatcher, createHiddenFileNameMatcherForVisibility } from '../../utils/fileFilters';
import { getEffectiveFrontmatterExclusions } from '../../utils/exclusionUtils';
import { createHiddenTagVisibility } from '../../utils/tagPrefixMatcher';
import { getDBInstanceOrNull } from '../../storage/fileOperations';
import type { NoteCountInfo } from '../../types/noteCounts';
import type { SearchShortcut } from '../../types/shortcuts';
import type { NavigateToFolderOptions, RevealPropertyOptions, RevealTagOptions } from '../useNavigatorReveal';
import { useNavigationPaneShortcutActions } from './useNavigationPaneShortcutActions';
import { useNavigationPaneShortcutDisplay } from './useNavigationPaneShortcutDisplay';
import { useNavigationPaneShortcutDnD } from './useNavigationPaneShortcutDnD';
import { useNavigationPaneShortcutMenus } from './useNavigationPaneShortcutMenus';
import { useNavigationPaneShortcutState } from './useNavigationPaneShortcutState';
export type {
    NavigationPaneShortcutRenderState,
    NavigationPaneShortcutsResult,
    ShortcutContextMenuTarget
} from './navigationPaneShortcutTypes';
import type { NavigationPaneShortcutsResult } from './navigationPaneShortcutTypes';

interface UseNavigationPaneShortcutsProps {
    rootContainerRef: React.RefObject<HTMLDivElement | null>;
    isRootReorderMode: boolean;
    onExecuteSearchShortcut?: (shortcutKey: string, searchShortcut: SearchShortcut) => Promise<void> | void;
    onNavigateToFolder: (folderPath: string, options?: NavigateToFolderOptions) => void;
    onRevealTag: (tagPath: string, options?: RevealTagOptions) => void;
    onRevealProperty: (propertyNodeId: string, options?: RevealPropertyOptions) => boolean;
    onRevealFile: (file: TFile) => void;
    onRevealShortcutFile?: (file: TFile) => void;
    getFolderCounts: () => Map<string, NoteCountInfo>;
    getTagCounts: () => Map<string, NoteCountInfo>;
    getPropertyCounts: () => Map<string, NoteCountInfo>;
    onConfigurePropertyKeys: () => void;
}

export function useNavigationPaneShortcuts({
    rootContainerRef,
    isRootReorderMode,
    onExecuteSearchShortcut,
    onNavigateToFolder,
    onRevealTag,
    onRevealProperty,
    onRevealFile,
    onRevealShortcutFile,
    getFolderCounts,
    getTagCounts,
    getPropertyCounts,
    onConfigurePropertyKeys
}: UseNavigationPaneShortcutsProps): NavigationPaneShortcutsResult {
    const { app, isMobile, plugin, tagTreeService, propertyTreeService } = useServices();
    const commandQueue = useCommandQueue();
    const fileSystemOps = useFileSystemOps();
    const metadataService = useMetadataService();
    const tagOperations = useTagOperations();
    const propertyOperations = usePropertyOperations();
    const expansionState = useExpansionState();
    const expansionDispatch = useExpansionDispatch();
    const selectionState = useNavigationSelection();
    const selectionStateRef = useSelectionStateRefValue();
    const selectionStateSubscription = useSelectionStateSubscription();
    const selectionDispatch = useSelectionDispatch();
    const settings = useSettingsState();
    const activeProfile = useActiveProfile();
    const uxPreferences = useUXPreferences();
    const uiState = useUIState();
    const uiDispatch = useUIDispatch();
    const { fileData } = useFileCache();
    const shortcuts = useShortcuts();
    const {
        shortcuts: shortcutsList,
        shortcutMap,
        tagShortcutKeysByPath,
        propertyShortcutKeysByNodeId,
        hydratedShortcuts,
        reorderShortcuts,
        addTagShortcut,
        addPropertyShortcut,
        addShortcutsBatch,
        clearShortcuts,
        removeShortcut,
        renameShortcut,
        hasFolderShortcut,
        hasNoteShortcut
    } = shortcuts;

    const includeDescendantNotes = uxPreferences.includeDescendantNotes;
    const showHiddenItems = uxPreferences.showHiddenItems;
    const searchActive = uxPreferences.searchActive;
    const { hiddenFolders, descendantExcludedFolders, hiddenFileNames, hiddenFileTags, fileVisibility } = activeProfile;
    const effectiveFrontmatterExclusions = getEffectiveFrontmatterExclusions(settings, showHiddenItems);
    const effectiveFrontmatterExclusionMatcher = useMemo(() => {
        return createFrontmatterPropertyExclusionMatcher(effectiveFrontmatterExclusions);
    }, [effectiveFrontmatterExclusions]);
    const folderCountFileNameMatcher = useMemo(() => {
        return createHiddenFileNameMatcherForVisibility(hiddenFileNames, showHiddenItems);
    }, [hiddenFileNames, showHiddenItems]);
    const hiddenFileTagVisibility = useMemo(() => {
        if (showHiddenItems) {
            return null;
        }
        return createHiddenTagVisibility(hiddenFileTags, false);
    }, [hiddenFileTags, showHiddenItems]);
    const noteCountDB = useMemo(() => {
        if (showHiddenItems || !hiddenFileTagVisibility || !hiddenFileTagVisibility.hasHiddenRules) {
            return null;
        }
        return getDBInstanceOrNull();
    }, [hiddenFileTagVisibility, showHiddenItems]);

    const menuServices = useMemo(
        () => ({
            app,
            plugin,
            isMobile,
            fileSystemOps,
            metadataService,
            tagOperations,
            propertyOperations,
            tagTreeService,
            propertyTreeService,
            commandQueue,
            shortcuts,
            visibility: { includeDescendantNotes, showHiddenItems },
            searchActive
        }),
        [
            app,
            commandQueue,
            fileSystemOps,
            includeDescendantNotes,
            isMobile,
            metadataService,
            plugin,
            propertyOperations,
            propertyTreeService,
            searchActive,
            shortcuts,
            showHiddenItems,
            tagOperations,
            tagTreeService
        ]
    );

    const shortcutState = useNavigationPaneShortcutState({
        app,
        settings,
        hydratedShortcuts,
        shortcutMap,
        selectionState,
        selectionStateRef,
        subscribeSelectionState: selectionStateSubscription.subscribe
    });

    const shortcutDnD = useNavigationPaneShortcutDnD({
        app,
        isMobile,
        isRootReorderMode,
        isShortcutContextMenuOpen: shortcutState.isShortcutContextMenuOpen,
        shortcutsExpanded: shortcutState.shortcutsExpanded,
        showShortcuts: settings.showShortcuts,
        hydratedShortcuts,
        hasFolderShortcut,
        hasNoteShortcut,
        reorderShortcuts,
        addTagShortcut,
        addPropertyShortcut,
        addShortcutsBatch
    });

    const handleShortcutSplitToggle = useCallback(() => {
        uiDispatch({ type: 'SET_PIN_SHORTCUTS', value: !uiState.pinShortcuts });
    }, [uiDispatch, uiState.pinShortcuts]);

    const shortcutActions = useNavigationPaneShortcutActions({
        app,
        commandQueue,
        isMobile,
        rootContainerRef,
        settings,
        uiState,
        uiDispatch,
        selectionType: selectionState.selectionType,
        selectedFolder: selectionState.selectedFolder,
        selectionDispatch,
        setActiveShortcut: shortcutState.setActiveShortcut,
        onExecuteSearchShortcut,
        onNavigateToFolder,
        onRevealTag,
        onRevealProperty,
        onRevealFile,
        onRevealShortcutFile,
        openFolderNoteInRightSidebar: folderNote => plugin.openFolderNoteInRightSidebar(folderNote),
        tagTree: fileData.tagTree,
        hydratedShortcuts
    });

    const shortcutDisplay = useNavigationPaneShortcutDisplay({
        app,
        settings,
        includeDescendantNotes,
        showHiddenItems,
        fileVisibility,
        noteCountDB,
        hiddenFolders,
        descendantExcludedFolders,
        effectiveFrontmatterExclusions,
        effectiveFrontmatterExclusionMatcher,
        folderCountFileNameMatcher,
        hiddenFileTagVisibility,
        getFolderCounts,
        getTagCounts,
        getPropertyCounts,
        tagTree: fileData.tagTree,
        propertyTree: fileData.propertyTree,
        propertyTreeService,
        onToggleShortcutsPin: handleShortcutSplitToggle,
        isShortcutsPinned: uiState.pinShortcuts,
        onConfigurePropertyKeys
    });

    const shortcutMenus = useNavigationPaneShortcutMenus({
        settings,
        menuServices,
        selectionStateRef,
        expansionState,
        selectionDispatch,
        expansionDispatch,
        uiDispatch,
        removeShortcut,
        renameShortcut,
        setIsShortcutContextMenuOpen: shortcutState.setIsShortcutContextMenuOpen
    });

    return useMemo(
        () => ({
            shortcutsExpanded: shortcutState.shortcutsExpanded,
            setShortcutsExpanded: shortcutState.setShortcutsExpanded,
            recentNotesExpanded: shortcutState.recentNotesExpanded,
            setRecentNotesExpanded: shortcutState.setRecentNotesExpanded,
            activeShortcutKey: shortcutState.activeShortcutKey,
            clearActiveShortcut: shortcutState.clearActiveShortcut,
            pinToggleLabel: shortcutDisplay.pinToggleLabel,
            handleShortcutSplitToggle,
            isShortcutSorting: shortcutDnD.isShortcutSorting,
            shortcutIds: shortcutDnD.shortcutIds,
            shortcutSensors: shortcutDnD.shortcutSensors,
            handleShortcutDragStart: shortcutDnD.handleShortcutDragStart,
            handleShortcutDragEnd: shortcutDnD.handleShortcutDragEnd,
            handleShortcutDragCancel: shortcutDnD.handleShortcutDragCancel,
            shortcutsCount: shortcutsList.length,
            tagShortcutKeysByPath,
            propertyShortcutKeysByNodeId,
            clearShortcuts,
            addTagShortcut,
            addPropertyShortcut,
            openShortcutByNumber: shortcutActions.openShortcutByNumber,
            activeShortcutId: shortcutDnD.activeShortcutId,
            shouldUseShortcutDnd: shortcutDnD.shouldUseShortcutDnd,
            allowEmptyShortcutDrop: shortcutDnD.allowEmptyShortcutDrop,
            shortcutDragHandleConfig: shortcutDnD.shortcutDragHandleConfig,
            shortcutHeaderTrailingAction: shortcutDisplay.shortcutHeaderTrailingAction,
            propertiesHeaderTrailingAction: shortcutDisplay.propertiesHeaderTrailingAction,
            shortcutNumberBadgesByKey: shortcutState.shortcutNumberBadgesByKey,
            shouldShowShortcutCounts: shortcutState.shouldShowShortcutCounts,
            removeShortcut,
            handleShortcutFolderActivate: shortcutActions.handleShortcutFolderActivate,
            handleShortcutFolderNoteClick: shortcutActions.handleShortcutFolderNoteClick,
            handleShortcutFolderNoteMouseDown: shortcutActions.handleShortcutFolderNoteMouseDown,
            handleShortcutNoteActivate: shortcutActions.handleShortcutNoteActivate,
            handleShortcutNoteMouseDown: shortcutActions.handleShortcutNoteMouseDown,
            handleRecentNoteActivate: shortcutActions.handleRecentNoteActivate,
            handleShortcutSearchActivate: shortcutActions.handleShortcutSearchActivate,
            handleShortcutTagActivate: shortcutActions.handleShortcutTagActivate,
            handleShortcutPropertyActivate: shortcutActions.handleShortcutPropertyActivate,
            handleShortcutContextMenu: shortcutMenus.handleShortcutContextMenu,
            handleRecentFileContextMenu: shortcutMenus.handleRecentFileContextMenu,
            handleShortcutRootDragOver: shortcutDnD.handleShortcutRootDragOver,
            handleShortcutRootDrop: shortcutDnD.handleShortcutRootDrop,
            buildShortcutExternalHandlers: shortcutDnD.buildShortcutExternalHandlers,
            getFolderShortcutCount: shortcutDisplay.getFolderShortcutCount,
            getTagShortcutCount: shortcutDisplay.getTagShortcutCount,
            getPropertyShortcutCount: shortcutDisplay.getPropertyShortcutCount,
            getMissingNoteLabel: shortcutDisplay.getMissingNoteLabel
        }),
        [
            addPropertyShortcut,
            addTagShortcut,
            clearShortcuts,
            handleShortcutSplitToggle,
            propertyShortcutKeysByNodeId,
            removeShortcut,
            shortcutActions.handleRecentNoteActivate,
            shortcutActions.handleShortcutFolderActivate,
            shortcutActions.handleShortcutFolderNoteClick,
            shortcutActions.handleShortcutFolderNoteMouseDown,
            shortcutActions.handleShortcutNoteActivate,
            shortcutActions.handleShortcutNoteMouseDown,
            shortcutActions.handleShortcutPropertyActivate,
            shortcutActions.handleShortcutSearchActivate,
            shortcutActions.handleShortcutTagActivate,
            shortcutActions.openShortcutByNumber,
            shortcutDisplay.getFolderShortcutCount,
            shortcutDisplay.getMissingNoteLabel,
            shortcutDisplay.getPropertyShortcutCount,
            shortcutDisplay.getTagShortcutCount,
            shortcutDisplay.pinToggleLabel,
            shortcutDisplay.propertiesHeaderTrailingAction,
            shortcutDisplay.shortcutHeaderTrailingAction,
            shortcutDnD.activeShortcutId,
            shortcutDnD.allowEmptyShortcutDrop,
            shortcutDnD.buildShortcutExternalHandlers,
            shortcutDnD.handleShortcutDragCancel,
            shortcutDnD.handleShortcutDragEnd,
            shortcutDnD.handleShortcutDragStart,
            shortcutDnD.handleShortcutRootDragOver,
            shortcutDnD.handleShortcutRootDrop,
            shortcutDnD.isShortcutSorting,
            shortcutDnD.shortcutDragHandleConfig,
            shortcutDnD.shortcutIds,
            shortcutDnD.shortcutSensors,
            shortcutDnD.shouldUseShortcutDnd,
            shortcutMenus.handleRecentFileContextMenu,
            shortcutMenus.handleShortcutContextMenu,
            shortcutState.activeShortcutKey,
            shortcutState.clearActiveShortcut,
            shortcutState.recentNotesExpanded,
            shortcutState.setRecentNotesExpanded,
            shortcutState.setShortcutsExpanded,
            shortcutState.shortcutNumberBadgesByKey,
            shortcutState.shortcutsExpanded,
            shortcutState.shouldShowShortcutCounts,
            shortcutsList.length,
            tagShortcutKeysByPath
        ]
    );
}
