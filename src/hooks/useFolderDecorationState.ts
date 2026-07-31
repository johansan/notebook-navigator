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

import { useMemo } from 'react';

import { useMetadataService, useServices } from '../context/ServicesContext';
import { useActiveProfile, useSettingsState } from '../context/SettingsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import type { NotebookNavigatorSettings } from '../settings/types';
import { useFolderNavigationSourceState, type FolderNavigationSourceState } from './useFolderNavigationSourceState';
import { buildFolderRainbowColorsFromSiblingPaths } from '../utils/navigationRainbow';
import { buildVisibleFolderTraversalState } from '../utils/treeFlattener';
import { useNavigationRainbowState, type NavigationRainbowState } from './useNavigationRainbowState';
import { type FolderDecorationModel } from '../utils/folderDecoration';
import { useThemeMode } from './useThemeMode';

interface FolderDecorationState {
    folderNavigationSource: FolderNavigationSourceState;
    folderDecorationModel: FolderDecorationModel;
    navRainbowState: NavigationRainbowState;
}

interface UseFolderDecorationResolverParams {
    settings: NotebookNavigatorSettings;
    navRainbowState: NavigationRainbowState;
    source: FolderNavigationSourceState;
}

function useFolderDecorationModel({ settings, navRainbowState, source }: UseFolderDecorationResolverParams): FolderDecorationModel {
    const { navRainbow, navRainbowPalettes } = navRainbowState;
    const isFolderExcluded = source.isFolderExcluded;
    const folderDisplayVersion = source.folderDisplayVersion;
    const shouldBuildFolderTraversalState = navRainbowPalettes.folder !== null;
    const shouldIncludeDescendantSiblingGroups = navRainbow.folders.scope !== 'root';
    const visibleFolderTraversalState = useMemo(() => {
        if (!shouldBuildFolderTraversalState) {
            return {
                siblingPathsByParent: new Map<string, readonly string[]>()
            };
        }

        return buildVisibleFolderTraversalState({
            rootFolders: source.rootFolders,
            excludePatterns: source.hiddenFolders,
            rootOrderMap: source.rootFolderOrderMap,
            defaultSortOrder: settings.folderSortOrder,
            childSortOrderOverrides: settings.folderTreeSortOverrides,
            getFolderSortName: source.getFolderSortName,
            isFolderExcluded: source.folderExclusionByFolderNote,
            includeDescendantSiblingGroups: shouldIncludeDescendantSiblingGroups
        });
    }, [
        settings.folderSortOrder,
        settings.folderTreeSortOverrides,
        source.folderExclusionByFolderNote,
        source.getFolderSortName,
        source.hiddenFolders,
        source.rootFolderOrderMap,
        source.rootFolders,
        shouldBuildFolderTraversalState,
        shouldIncludeDescendantSiblingGroups
    ]);
    const isExcludedPath = useMemo(() => {
        const exclusionCache = new Map<string, boolean>();
        return (folderPath: string): boolean => {
            const cached = exclusionCache.get(folderPath);
            if (cached !== undefined) {
                return cached;
            }

            const isExcluded = isFolderExcluded(folderPath);
            exclusionCache.set(folderPath, isExcluded);
            return isExcluded;
        };
    }, [isFolderExcluded]);

    return useMemo(() => {
        void folderDisplayVersion;
        const folderRainbowColors =
            navRainbowPalettes.folder !== null
                ? buildFolderRainbowColorsFromSiblingPaths({
                      siblingPathsByParent: visibleFolderTraversalState.siblingPathsByParent,
                      palette: navRainbowPalettes.folder,
                      scope: navRainbow.folders.scope,
                      showRootFolder: settings.showRootFolder,
                      inheritColors: settings.inheritFolderColors
                  })
                : {
                      colorsByPath: new Map<string, string>(),
                      rootColor: undefined,
                      getInheritedColor: (_folderPath: string) => undefined
                  };
        return {
            isExcludedPath,
            folderRainbowColors,
            navRainbowMode: navRainbow.mode,
            folderRainbowScope: navRainbow.folders.scope,
            showRootFolder: settings.showRootFolder
        };
    }, [
        navRainbow.folders.scope,
        navRainbow.mode,
        navRainbowPalettes.folder,
        isExcludedPath,
        settings.inheritFolderColors,
        settings.showRootFolder,
        folderDisplayVersion,
        visibleFolderTraversalState
    ]);
}

export function useFolderDecorationState(): FolderDecorationState {
    const { app } = useServices();
    const metadataService = useMetadataService();
    const settings = useSettingsState();
    const activeProfile = useActiveProfile();
    const uxPreferences = useUXPreferences();
    const source = useFolderNavigationSourceState({
        app,
        settings,
        activeProfile,
        metadataService,
        showHiddenItems: uxPreferences.showHiddenItems
    });
    const isDarkTheme = useThemeMode(app) === 'dark';
    const navRainbowState = useNavigationRainbowState(settings, isDarkTheme);
    const folderDecorationModel = useFolderDecorationModel({
        settings,
        navRainbowState,
        source
    });

    return useMemo(
        () => ({
            folderNavigationSource: source,
            folderDecorationModel,
            navRainbowState
        }),
        [folderDecorationModel, navRainbowState, source]
    );
}
