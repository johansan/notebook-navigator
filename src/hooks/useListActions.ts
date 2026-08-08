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

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu, TFolder, type App, type TFile } from 'obsidian';
import { useSelectionState, useSelectionDispatch } from '../context/SelectionContext';
import { useServices, useFileSystemOps, useMetadataService } from '../context/ServicesContext';
import { useSettingsState, useSettingsUpdate } from '../context/SettingsContext';
import { useUXPreferenceActions, useUXPreferences } from '../context/UXPreferencesContext';
import { strings } from '../i18n';
import { ConfirmModal } from '../modals/ConfirmModal';
import { createPropertyGroupingOption, getPropertyGroupingKey, getPropertyGroupingOrder } from '../settings/types';
import type { ListNoteGroupingOption, ListSortOverrideValue, NotebookNavigatorSettings, PropertyGroupingOrder } from '../settings/types';
import { ItemType, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID, TAGGED_TAG_ID, UNTAGGED_TAG_ID } from '../types';
import {
    areListSortOverridesEqual,
    buildSortOption,
    cloneListSortOverride,
    createListSortOverride,
    getAvailablePropertySortKeys,
    getListSortFieldIconId,
    getListSortToolbarIconId,
    getListSortOverrideForSelection,
    getManualSortPropertyKey,
    getSortDirection,
    getSortDirectionForFieldChange,
    getSortField,
    getSortIcon as getSortIconName,
    isManualSortPropertyKey,
    isDateSortOption,
    resolveListSort,
    resolveListSortOverrideForDefault,
    type SortDirection,
    type SortField
} from '../utils/sortUtils';
import { showListPaneAppearanceMenu } from '../components/ListPaneAppearanceMenu';
import {
    areStoredListPaneAppearanceFieldsEqual,
    getStoredListPaneAppearanceFields,
    hasStoredListPaneAppearanceOverride,
    mergeListPaneAppearanceAndGrouping
} from '../settings/listPaneAppearance';
import type { ListPaneAppearance } from '../settings/listPaneAppearance';
import { getFilesForFolder } from '../utils/fileFinder';
import { runAsyncAction } from '../utils/async';
import { FILE_VISIBILITY } from '../utils/fileTypeUtils';
import {
    getManualSortBaselineSettings,
    getCachedManualSortPropertyState,
    getLocalizedManualSortWriteFailureMessage,
    hasCachedManualSortProperty,
    isValidManualSortPropertyKey,
    orderManualSortFiles,
    removeManualSortProperty,
    writeManualSortOrder,
    type ManualSortNewFilePlacementContext
} from '../utils/manualSort';
import { resolveIconForMenu, resolveUXIcon, resolveUXIconForMenu } from '../utils/uxIcons';
import { buildPropertyKeyNodeId, parsePropertyNodeId } from '../utils/propertyTree';
import { getFilesForNavigationSelection } from '../utils/selectionUtils';
import { findVaultProfileById } from '../utils/vaultProfiles';
import { casefold, ensureRecord, sanitizeRecord } from '../utils/recordUtils';
import {
    areListGroupingOptionsEqual,
    areListGroupingOptionsSameKind,
    getAvailablePropertyGroupKeys,
    resolveEffectiveListGroupingForSort,
    resolveListGrouping,
    resolveListGroupingOverrideForDefault
} from '../utils/listGrouping';
import { getErrorMessage } from '../utils/errorUtils';
import { showNotice } from '../utils/noticeUtils';
import { registerActiveFileWorkspaceListeners } from '../utils/workspaceActiveFileEvents';

type SelectionSortTarget =
    | { type: typeof ItemType.FOLDER; key: string }
    | { type: typeof ItemType.TAG; key: string }
    | { type: typeof ItemType.PROPERTY; key: string };

type DescendantApplyStats = {
    descendantCount: number;
    savedDescendantCount: number;
    matchingSavedDescendantCount: number;
    changedSavedDescendantCount: number;
    missingSavedDescendantCount: number;
    affectedCount: number;
    disabled: boolean;
};

type ManualSortPropertyStats = {
    markdownCount: number;
    validRankCount: number;
    invalidPropertyCount: number;
};

interface UseListActionsOptions {
    onManualSortStart?: (propertyKey: string) => void;
    getManualSortNewFileContext?: () => ManualSortNewFilePlacementContext | null;
    trackRevealFileAvailability?: boolean;
}

const BIDI_ISOLATE_START = '\u2068'; // First Strong Isolate
const BIDI_ISOLATE_END = '\u2069'; // Pop Directional Isolate

function isolateBidiText(value: string): string {
    // Keeps user-authored LTR property keys from reordering quotes and punctuation inside RTL labels.
    return `${BIDI_ISOLATE_START}${value}${BIDI_ISOLATE_END}`;
}

function countMarkdownFilesWithManualSortProperty(app: App, files: readonly TFile[], propertyKey: string): number {
    return files.reduce((count, file) => {
        if (file.extension !== 'md') {
            return count;
        }
        return hasCachedManualSortProperty(app, file, propertyKey) ? count + 1 : count;
    }, 0);
}

function getManualSortPropertyStats(app: App, files: readonly TFile[], propertyKey: string): ManualSortPropertyStats {
    return files.reduce<ManualSortPropertyStats>(
        (stats, file) => {
            if (file.extension !== 'md') {
                return stats;
            }

            stats.markdownCount += 1;
            const manualSortProperty = getCachedManualSortPropertyState(app, file, propertyKey);
            if (!manualSortProperty.hasProperty) {
                return stats;
            }

            if (manualSortProperty.rank === null) {
                stats.invalidPropertyCount += 1;
            } else {
                stats.validRankCount += 1;
            }
            return stats;
        },
        {
            markdownCount: 0,
            validRankCount: 0,
            invalidPropertyCount: 0
        }
    );
}

function samePropertySortKey(left: string, right: string): boolean {
    return casefold(left) === casefold(right);
}

function getSortOverridesForTarget(
    settings: NotebookNavigatorSettings,
    target: SelectionSortTarget
): Record<string, ListSortOverrideValue> {
    if (target.type === ItemType.FOLDER) {
        return sanitizeRecord(ensureRecord(settings.folderSortOverrides));
    }
    if (target.type === ItemType.TAG) {
        return sanitizeRecord(ensureRecord(settings.tagSortOverrides));
    }
    return sanitizeRecord(ensureRecord(settings.propertySortOverrides));
}

function setSortOverridesForTarget(
    settings: NotebookNavigatorSettings,
    target: SelectionSortTarget,
    sortOverrides: Record<string, ListSortOverrideValue>
): void {
    if (target.type === ItemType.FOLDER) {
        settings.folderSortOverrides = sortOverrides;
        return;
    }
    if (target.type === ItemType.TAG) {
        settings.tagSortOverrides = sortOverrides;
        return;
    }
    settings.propertySortOverrides = sortOverrides;
}

function setSortOverrideForTarget(
    settings: NotebookNavigatorSettings,
    target: SelectionSortTarget,
    sortOverride: ListSortOverrideValue
): void {
    const sortOverrides = getSortOverridesForTarget(settings, target);
    sortOverrides[target.key] = cloneListSortOverride(sortOverride);
    setSortOverridesForTarget(settings, target, sortOverrides);
}

function collectFolderDescendantPaths(folder: TFolder): string[] {
    const paths: string[] = [];
    const stack: TFolder[] = [];

    folder.children.forEach(child => {
        if (child instanceof TFolder) {
            stack.push(child);
        }
    });

    while (stack.length > 0) {
        const current = stack.pop();
        if (!current) {
            continue;
        }

        paths.push(current.path);
        current.children.forEach(child => {
            if (child instanceof TFolder) {
                stack.push(child);
            }
        });
    }

    return paths;
}

function countFolderDescendants(folder: TFolder): number {
    let count = 0;
    const stack: TFolder[] = [];

    folder.children.forEach(child => {
        if (child instanceof TFolder) {
            stack.push(child);
        }
    });

    while (stack.length > 0) {
        const current = stack.pop();
        if (!current) {
            continue;
        }

        count += 1;
        current.children.forEach(child => {
            if (child instanceof TFolder) {
                stack.push(child);
            }
        });
    }

    return count;
}

function isFolderDescendantSettingKey(selectedFolderPath: string, candidatePath: string): boolean {
    if (candidatePath === selectedFolderPath) {
        return false;
    }

    // Root uses "/" while child folder paths never start with "//", so every non-root key is a descendant.
    if (selectedFolderPath === '/') {
        return candidatePath !== '/';
    }

    return candidatePath.startsWith(`${selectedFolderPath}/`);
}

function isTagDescendantSettingKey(selectedTagPath: string, candidatePath: string): boolean {
    if (candidatePath === selectedTagPath) {
        return false;
    }

    if (selectedTagPath === UNTAGGED_TAG_ID) {
        return false;
    }

    // The "all tagged" virtual node does not live inside the tag hierarchy.
    // For settings-only scans, treat every real stored tag key as part of its descendant scope.
    if (selectedTagPath === TAGGED_TAG_ID) {
        return candidatePath !== TAGGED_TAG_ID && candidatePath !== UNTAGGED_TAG_ID;
    }

    return candidatePath.startsWith(`${selectedTagPath}/`);
}

function isPropertyDescendantSettingKey(selectedNodeId: string, candidateNodeId: string): boolean {
    if (candidateNodeId === selectedNodeId) {
        return false;
    }

    if (selectedNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
        return candidateNodeId !== PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
    }

    const selectedNode = parsePropertyNodeId(selectedNodeId);
    const candidateNode = parsePropertyNodeId(candidateNodeId);
    if (!selectedNode || !candidateNode || selectedNode.key !== candidateNode.key) {
        return false;
    }

    if (!selectedNode.valuePath) {
        return candidateNode.valuePath !== null;
    }

    if (!candidateNode.valuePath) {
        return false;
    }

    return candidateNode.valuePath.startsWith(`${selectedNode.valuePath}/`);
}

function buildDescendantApplyStats<T>({
    descendantCount,
    descendantEntries,
    hasCurrentOverride,
    matchesCurrentOverride
}: {
    descendantCount: number;
    descendantEntries: readonly T[];
    hasCurrentOverride: boolean;
    matchesCurrentOverride: (entry: T) => boolean;
}): DescendantApplyStats {
    const savedDescendantCount = descendantEntries.length;

    if (!hasCurrentOverride) {
        return {
            descendantCount,
            savedDescendantCount,
            matchingSavedDescendantCount: 0,
            changedSavedDescendantCount: savedDescendantCount,
            missingSavedDescendantCount: 0,
            affectedCount: savedDescendantCount,
            disabled: descendantCount === 0 || savedDescendantCount === 0
        };
    }

    const matchingSavedDescendantCount = descendantEntries.filter(matchesCurrentOverride).length;
    const changedSavedDescendantCount = savedDescendantCount - matchingSavedDescendantCount;
    const missingSavedDescendantCount = Math.max(descendantCount - savedDescendantCount, 0);

    // `changedSavedDescendantCount` is the confirmation-modal count: existing saved
    // descendant overrides that will be overwritten. `affectedCount` also includes
    // live descendants that do not have a saved override yet and will receive one.
    return {
        descendantCount,
        savedDescendantCount,
        matchingSavedDescendantCount,
        changedSavedDescendantCount,
        missingSavedDescendantCount,
        affectedCount: changedSavedDescendantCount + missingSavedDescendantCount,
        disabled: descendantCount === 0 || (savedDescendantCount === descendantCount && matchingSavedDescendantCount === descendantCount)
    };
}

function getGroupingIcon(option: ListNoteGroupingOption): string {
    switch (option) {
        case 'custom':
            return 'lucide-heading';
        case 'date':
            return 'lucide-calendar';
        case 'folder':
            return 'lucide-folder';
        default:
            return 'lucide-heading';
    }
}

function collectAllPropertyNodeIds(propertyTreeService: NonNullable<ReturnType<typeof useServices>['propertyTreeService']>): string[] {
    const nodeIds: string[] = [];
    const visited = new Set<string>();

    const collectIds = (nodeId: string) => {
        if (visited.has(nodeId)) {
            return;
        }
        visited.add(nodeId);
        nodeIds.push(nodeId);

        const node = propertyTreeService.findNode(nodeId);
        if (!node) {
            return;
        }

        node.children.forEach(child => {
            collectIds(child.id);
        });
    };

    propertyTreeService.getPropertyTree().forEach(node => {
        collectIds(node.id);
    });

    return nodeIds;
}

/**
 * Custom hook that provides shared actions for list pane toolbars.
 * Used by both ListPaneHeader (desktop) and ListToolbar (mobile) to avoid code duplication.
 *
 * @returns Object containing action handlers and computed values for list pane operations
 */
export function useListActions({
    onManualSortStart,
    getManualSortNewFileContext,
    trackRevealFileAvailability = false
}: UseListActionsOptions = {}) {
    const { app, plugin, tagTreeService, propertyTreeService } = useServices();
    const settings = useSettingsState();
    const vaultProfileId = settings.vaultProfile;
    const vaultProfiles = settings.vaultProfiles;
    const uxPreferences = useUXPreferences();
    const includeDescendantNotes = uxPreferences.includeDescendantNotes;
    const showHiddenItems = uxPreferences.showHiddenItems;
    const { setIncludeDescendantNotes } = useUXPreferenceActions();
    const updateSettings = useSettingsUpdate();
    const selectionState = useSelectionState();
    const selectionDispatch = useSelectionDispatch();
    const fileSystemOps = useFileSystemOps();
    const metadataService = useMetadataService();
    const hasFolderSelection = selectionState.selectionType === ItemType.FOLDER && Boolean(selectionState.selectedFolder);
    const hasTagSelection = selectionState.selectionType === ItemType.TAG && Boolean(selectionState.selectedTag);
    const hasCreatableTagSelection =
        hasTagSelection && selectionState.selectedTag !== TAGGED_TAG_ID && selectionState.selectedTag !== UNTAGGED_TAG_ID;
    const hasPropertySelection = selectionState.selectionType === ItemType.PROPERTY && Boolean(selectionState.selectedProperty);
    const hasCreatablePropertySelection = hasPropertySelection && selectionState.selectedProperty !== PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
    const hasAppearanceOrSortSelection = hasFolderSelection || hasTagSelection || hasPropertySelection;

    const openDefaultListSettings = useCallback(() => {
        plugin.openSettings();
    }, [plugin]);

    const openDefaultListAppearanceSettings = useCallback(() => {
        plugin.openSettings();
    }, [plugin]);
    const canCreateNewFile = Boolean(selectionState.selectedFolder) || hasCreatableTagSelection || hasCreatablePropertySelection;
    const getRevealableActiveFile = useCallback((): TFile | null => {
        const activeFile = app.workspace.getActiveFile();
        return activeFile?.parent ? activeFile : null;
    }, [app.workspace]);
    const [canRevealFile, setCanRevealFile] = useState(() => (trackRevealFileAvailability ? Boolean(getRevealableActiveFile()) : false));

    const getSelectionSortTarget = useCallback((): SelectionSortTarget | null => {
        if (selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder) {
            return { type: ItemType.FOLDER, key: selectionState.selectedFolder.path };
        }
        if (selectionState.selectionType === ItemType.TAG && selectionState.selectedTag) {
            return { type: ItemType.TAG, key: selectionState.selectedTag };
        }
        if (selectionState.selectionType === ItemType.PROPERTY && selectionState.selectedProperty) {
            return { type: ItemType.PROPERTY, key: selectionState.selectedProperty };
        }
        return null;
    }, [selectionState.selectionType, selectionState.selectedFolder, selectionState.selectedTag, selectionState.selectedProperty]);

    const handleNewFile = useCallback(async () => {
        try {
            const manualSortContext = getManualSortNewFileContext?.() ?? null;
            if (selectionState.selectedFolder) {
                await fileSystemOps.createNewFile(selectionState.selectedFolder, settings.createNewNotesInNewTab, manualSortContext);
                return;
            }

            if (hasCreatableTagSelection && selectionState.selectedTag) {
                const sourcePath = selectionState.selectedFile?.path ?? app.workspace.getActiveFile()?.path ?? '';
                await fileSystemOps.createNewFileForTag(
                    selectionState.selectedTag,
                    sourcePath,
                    settings.createNewNotesInNewTab,
                    manualSortContext
                );
                return;
            }

            if (hasCreatablePropertySelection && selectionState.selectedProperty) {
                const sourcePath = selectionState.selectedFile?.path ?? app.workspace.getActiveFile()?.path ?? '';
                await fileSystemOps.createNewFileForProperty(
                    selectionState.selectedProperty,
                    sourcePath,
                    settings.createNewNotesInNewTab,
                    manualSortContext
                );
            }
        } catch {
            // Error is handled by FileSystemOperations with user notification
        }
    }, [
        selectionState.selectedFolder,
        selectionState.selectedTag,
        selectionState.selectedProperty,
        selectionState.selectedFile,
        hasCreatableTagSelection,
        hasCreatablePropertySelection,
        settings.createNewNotesInNewTab,
        getManualSortNewFileContext,
        fileSystemOps,
        app
    ]);

    const handleRevealFile = useCallback(async () => {
        const activeFile = getRevealableActiveFile();
        if (!activeFile) {
            return;
        }

        await plugin.revealFileInActualFolder(activeFile, { showHiddenFileNotice: true });
    }, [getRevealableActiveFile, plugin]);

    const getSelectionSortOverride = useCallback((): ListSortOverrideValue | undefined => {
        return getListSortOverrideForSelection(
            settings,
            selectionState.selectionType,
            selectionState.selectedFolder,
            selectionState.selectedTag,
            selectionState.selectedProperty
        );
    }, [
        selectionState.selectionType,
        selectionState.selectedFolder,
        selectionState.selectedTag,
        selectionState.selectedProperty,
        settings
    ]);

    const getSelectionAppearanceOverride = useCallback((): ListPaneAppearance | undefined => {
        if (selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder) {
            return settings.folderAppearances?.[selectionState.selectedFolder.path];
        }
        if (selectionState.selectionType === ItemType.TAG && selectionState.selectedTag) {
            return settings.tagAppearances?.[selectionState.selectedTag];
        }
        if (selectionState.selectionType === ItemType.PROPERTY && selectionState.selectedProperty) {
            return settings.propertyAppearances?.[selectionState.selectedProperty];
        }
        return undefined;
    }, [
        selectionState.selectionType,
        selectionState.selectedFolder,
        selectionState.selectedTag,
        selectionState.selectedProperty,
        settings.folderAppearances,
        settings.tagAppearances,
        settings.propertyAppearances
    ]);

    const getSelectionDescendantKeys = useCallback((): string[] => {
        // Bulk apply should use the live tree when the user confirms the action so
        // descendants without stored settings still receive the propagated override.
        if (selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder) {
            return collectFolderDescendantPaths(selectionState.selectedFolder);
        }

        if (selectionState.selectionType === ItemType.TAG && selectionState.selectedTag) {
            if (selectionState.selectedTag === TAGGED_TAG_ID) {
                return Array.from(tagTreeService?.getAllTagPaths() ?? []);
            }
            return Array.from(tagTreeService?.collectDescendantTagPaths(selectionState.selectedTag) ?? []);
        }

        if (selectionState.selectionType === ItemType.PROPERTY && selectionState.selectedProperty && propertyTreeService) {
            if (selectionState.selectedProperty === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
                return collectAllPropertyNodeIds(propertyTreeService);
            }
            return Array.from(propertyTreeService.collectDescendantNodeIds(selectionState.selectedProperty));
        }

        return [];
    }, [
        propertyTreeService,
        selectionState.selectionType,
        selectionState.selectedFolder,
        selectionState.selectedTag,
        selectionState.selectedProperty,
        tagTreeService
    ]);

    const isSelectionDescendantSettingKey = useCallback(
        (candidateKey: string): boolean => {
            if (selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder) {
                return isFolderDescendantSettingKey(selectionState.selectedFolder.path, candidateKey);
            }

            if (selectionState.selectionType === ItemType.TAG && selectionState.selectedTag) {
                return isTagDescendantSettingKey(selectionState.selectedTag, candidateKey);
            }

            if (selectionState.selectionType === ItemType.PROPERTY && selectionState.selectedProperty) {
                return isPropertyDescendantSettingKey(selectionState.selectedProperty, candidateKey);
            }

            return false;
        },
        [selectionState.selectionType, selectionState.selectedFolder, selectionState.selectedTag, selectionState.selectedProperty]
    );

    const getSelectionDescendantLabel = useCallback((): string => {
        if (selectionState.selectionType === ItemType.FOLDER) {
            return strings.paneHeader.subfolders;
        }
        if (selectionState.selectionType === ItemType.TAG) {
            return strings.paneHeader.subtags;
        }
        if (selectionState.selectionType === ItemType.PROPERTY) {
            if (selectionState.selectedProperty === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
                return strings.paneHeader.descendants;
            }
            return strings.paneHeader.childValues;
        }
        return strings.paneHeader.descendants;
    }, [selectionState.selectedProperty, selectionState.selectionType]);

    const selectionSortTarget = useMemo(() => getSelectionSortTarget(), [getSelectionSortTarget]);
    const selectionSortOverride = useMemo(() => getSelectionSortOverride(), [getSelectionSortOverride]);
    const selectionSortSpec = useMemo(() => resolveListSort(settings, selectionSortOverride), [settings, selectionSortOverride]);
    const isSelectionManualSortActive = isManualSortPropertyKey(settings, selectionSortSpec.propertyKey);
    const resolvePropertySortIcon = useCallback(
        (propertyKey: string): string | null => {
            const normalizedPropertyKey = casefold(propertyKey);
            if (!normalizedPropertyKey) {
                return null;
            }

            return metadataService.getPropertyIcon(buildPropertyKeyNodeId(normalizedPropertyKey)) ?? null;
        },
        [metadataService]
    );
    const getSortIcon = useCallback(() => {
        const sortIconId = getListSortToolbarIconId(settings, selectionSortOverride);
        if (isManualSortPropertyKey(settings, selectionSortSpec.propertyKey)) {
            return 'list-ordered';
        }
        if (sortIconId === 'list-sort-property') {
            const propertyIcon = resolvePropertySortIcon(selectionSortSpec.propertyKey);
            if (propertyIcon) {
                return propertyIcon;
            }
        }

        return resolveUXIcon(settings.interfaceIcons, sortIconId);
    }, [resolvePropertySortIcon, selectionSortOverride, selectionSortSpec.propertyKey, settings]);
    const selectionAppearanceOverride = useMemo(() => getSelectionAppearanceOverride(), [getSelectionAppearanceOverride]);
    const selectionAppearanceFields = useMemo(
        () => getStoredListPaneAppearanceFields(selectionAppearanceOverride),
        [selectionAppearanceOverride]
    );
    const hasSelectionAppearanceOverride = selectionAppearanceFields !== null;
    const groupingInfo = useMemo(
        () =>
            resolveListGrouping({
                settings,
                selectionType: selectionState.selectionType,
                folderPath: selectionState.selectedFolder ? selectionState.selectedFolder.path : null,
                tag: selectionState.selectedTag ?? null,
                propertyNodeId: selectionState.selectedProperty ?? null
            }),
        [settings, selectionState.selectedFolder, selectionState.selectedProperty, selectionState.selectedTag, selectionState.selectionType]
    );
    const selectionGroupOverride = groupingInfo.normalizedOverride;
    const hasSelectionGroupOverride = groupingInfo.hasCustomOverride;
    const effectiveSelectionGroupOverride = isSelectionManualSortActive
        ? 'custom'
        : selectionGroupOverride === undefined
          ? undefined
          : resolveEffectiveListGroupingForSort({
                groupBy: selectionGroupOverride,
                sortOption: selectionSortSpec.option,
                selectionType: selectionState.selectionType
            });
    const selectionDescendantLabel = useMemo(() => getSelectionDescendantLabel(), [getSelectionDescendantLabel]);
    const [folderTreeVersion, setFolderTreeVersion] = useState(0);
    const [tagTreeVersion, setTagTreeVersion] = useState(0);
    const [propertyTreeVersion, setPropertyTreeVersion] = useState(0);

    useEffect(() => {
        const bumpFolderTreeVersion = (file: unknown) => {
            if (file instanceof TFolder) {
                setFolderTreeVersion(current => current + 1);
            }
        };

        const createRef = app.vault.on('create', bumpFolderTreeVersion);
        const deleteRef = app.vault.on('delete', bumpFolderTreeVersion);
        const renameRef = app.vault.on('rename', file => {
            bumpFolderTreeVersion(file);
        });

        return () => {
            app.vault.offref(createRef);
            app.vault.offref(deleteRef);
            app.vault.offref(renameRef);
        };
    }, [app.vault]);

    useEffect(() => {
        if (!tagTreeService) {
            return;
        }

        return tagTreeService.addTreeUpdateListener(() => {
            setTagTreeVersion(current => current + 1);
        });
    }, [tagTreeService]);

    useEffect(() => {
        if (!propertyTreeService) {
            return;
        }

        return propertyTreeService.addTreeUpdateListener(() => {
            setPropertyTreeVersion(current => current + 1);
        });
    }, [propertyTreeService]);

    useEffect(() => {
        if (!trackRevealFileAvailability) {
            setCanRevealFile(false);
            return;
        }

        const updateCanRevealFile = () => {
            setCanRevealFile(Boolean(getRevealableActiveFile()));
        };

        updateCanRevealFile();

        return registerActiveFileWorkspaceListeners({
            workspace: app.workspace,
            onChange: updateCanRevealFile
        });
    }, [app.workspace, getRevealableActiveFile, trackRevealFileAvailability]);

    // The descendant action follows a strict two-phase contract.
    // Phase 1 is menu construction: decide enabled/disabled from descendantCount plus
    // the saved settings record only. The menu must be disabled only when clicking it
    // would be a guaranteed no-op:
    // - there are no descendants
    // - the selected node is default and there are no saved descendant overrides
    // - the selected node has a saved override and every descendant already has that
    //   same saved override
    // Phase 2 uses the live tree to write or clear settings for every real descendant.
    // Sort and group confirms only when existing overrides change. Appearance always
    // confirms because creating new overrides can visibly change many descendants.
    const selectionDescendantCount = useMemo(() => {
        // These version counters exist only to invalidate the cached descendantCount
        // when folder/tag/property tree structure changes without changing the current selection id.
        void folderTreeVersion;
        void tagTreeVersion;
        void propertyTreeVersion;

        if (selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder) {
            return countFolderDescendants(selectionState.selectedFolder);
        }

        if (selectionState.selectionType === ItemType.TAG && selectionState.selectedTag) {
            if (selectionState.selectedTag === TAGGED_TAG_ID) {
                return tagTreeService?.getAllTagPaths().length ?? 0;
            }

            return tagTreeService?.collectDescendantTagPaths(selectionState.selectedTag).size ?? 0;
        }

        if (selectionState.selectionType === ItemType.PROPERTY && selectionState.selectedProperty && propertyTreeService) {
            if (selectionState.selectedProperty === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
                return collectAllPropertyNodeIds(propertyTreeService).length;
            }

            return propertyTreeService.collectDescendantNodeIds(selectionState.selectedProperty).size;
        }

        return 0;
    }, [
        folderTreeVersion,
        propertyTreeService,
        propertyTreeVersion,
        selectionState.selectedFolder,
        selectionState.selectedProperty,
        selectionState.selectedTag,
        selectionState.selectionType,
        tagTreeService,
        tagTreeVersion
    ]);
    // Keep the action available for selections that conceptually own descendants.
    // The actual disabled state is derived later from descendantCount plus saved settings.
    const canApplyToDescendants =
        hasFolderSelection || (hasTagSelection && selectionState.selectedTag !== UNTAGGED_TAG_ID) || hasPropertySelection;

    const removeSelectionSortOverride = useCallback(async () => {
        const target = getSelectionSortTarget();
        if (!target) {
            return;
        }
        if (target.type === ItemType.FOLDER) {
            await metadataService.removeFolderSortOverride(target.key);
            return;
        }
        if (target.type === ItemType.TAG) {
            await metadataService.removeTagSortOverride(target.key);
            return;
        }
        await metadataService.removePropertySortOverride(target.key);
    }, [getSelectionSortTarget, metadataService]);

    const setSelectionSortOverride = useCallback(
        async (sortOverride: ListSortOverrideValue) => {
            const target = getSelectionSortTarget();
            if (!target) {
                return;
            }
            if (target.type === ItemType.FOLDER) {
                await metadataService.setFolderSortOverride(target.key, sortOverride);
                return;
            }
            if (target.type === ItemType.TAG) {
                await metadataService.setTagSortOverride(target.key, sortOverride);
                return;
            }
            await metadataService.setPropertySortOverride(target.key, sortOverride);
        },
        [getSelectionSortTarget, metadataService]
    );

    const setSelectionGroupOverride = useCallback(
        async (groupBy: ListNoteGroupingOption | undefined) => {
            const target = getSelectionSortTarget();
            if (!target) {
                return;
            }

            await updateSettings(current => {
                const next =
                    target.type === ItemType.FOLDER
                        ? sanitizeRecord(ensureRecord(current.folderAppearances))
                        : target.type === ItemType.TAG
                          ? sanitizeRecord(ensureRecord(current.tagAppearances))
                          : sanitizeRecord(ensureRecord(current.propertyAppearances));
                const currentAppearance = next[target.key];
                const normalizedAppearance = mergeListPaneAppearanceAndGrouping(
                    getStoredListPaneAppearanceFields(currentAppearance),
                    groupBy
                );

                if (normalizedAppearance) {
                    next[target.key] = normalizedAppearance;
                } else {
                    delete next[target.key];
                }

                if (target.type === ItemType.FOLDER) {
                    current.folderAppearances = next;
                    return;
                }
                if (target.type === ItemType.TAG) {
                    current.tagAppearances = next;
                    return;
                }
                current.propertyAppearances = next;
            });
        },
        [getSelectionSortTarget, updateSettings]
    );

    const openManualSortConfirm = useCallback(
        (propertyKey: string, affectedCount: number, onConfirm: () => Promise<void>) => {
            new ConfirmModal(
                app,
                strings.modals.manualSortConfirm.propertySortTitle,
                strings.modals.manualSortConfirm.propertySortMessage(propertyKey, affectedCount),
                onConfirm,
                strings.modals.manualSortConfirm.propertySortConfirmButton
            ).open();
        },
        [app]
    );

    const getManualSortInitialFiles = useCallback(
        (target: SelectionSortTarget, sortOverride?: ListSortOverrideValue): TFile[] => {
            const baselineSettings = getManualSortBaselineSettings(settings);
            if (sortOverride !== undefined) {
                setSortOverrideForTarget(baselineSettings, target, sortOverride);
            }

            return orderManualSortFiles(
                getFilesForNavigationSelection(
                    {
                        selectionType: selectionState.selectionType,
                        selectedFolder: selectionState.selectedFolder,
                        selectedTag: selectionState.selectedTag,
                        selectedProperty: selectionState.selectedProperty
                    },
                    baselineSettings,
                    { includeDescendantNotes, showHiddenItems },
                    app,
                    tagTreeService,
                    propertyTreeService
                )
            );
        },
        [
            app,
            includeDescendantNotes,
            propertyTreeService,
            selectionState.selectedFolder,
            selectionState.selectedProperty,
            selectionState.selectedTag,
            selectionState.selectionType,
            settings,
            showHiddenItems,
            tagTreeService
        ]
    );

    const getManualSortPropertyRemovalFiles = useCallback((): TFile[] => {
        const baselineSettings = getManualSortBaselineSettings(settings);

        return getFilesForNavigationSelection(
            {
                selectionType: selectionState.selectionType,
                selectedFolder: selectionState.selectedFolder,
                selectedTag: selectionState.selectedTag,
                selectedProperty: selectionState.selectedProperty
            },
            baselineSettings,
            { includeDescendantNotes, showHiddenItems },
            app,
            tagTreeService,
            propertyTreeService,
            { orderResults: false }
        );
    }, [
        app,
        includeDescendantNotes,
        propertyTreeService,
        selectionState.selectedFolder,
        selectionState.selectedProperty,
        selectionState.selectedTag,
        selectionState.selectionType,
        settings,
        showHiddenItems,
        tagTreeService
    ]);

    const applyManualSortForProperty = useCallback(
        async (propertyKey: string, target: SelectionSortTarget) => {
            await updateSettings(current => {
                setSortOverrideForTarget(current, target, createListSortOverride('property-asc', propertyKey));

                const appearances =
                    target.type === ItemType.FOLDER
                        ? sanitizeRecord(ensureRecord(current.folderAppearances))
                        : target.type === ItemType.TAG
                          ? sanitizeRecord(ensureRecord(current.tagAppearances))
                          : sanitizeRecord(ensureRecord(current.propertyAppearances));
                const normalizedAppearance = getStoredListPaneAppearanceFields(appearances[target.key]);

                if (normalizedAppearance) {
                    appearances[target.key] = normalizedAppearance;
                } else {
                    delete appearances[target.key];
                }

                if (target.type === ItemType.FOLDER) {
                    current.folderAppearances = appearances;
                    return;
                }
                if (target.type === ItemType.TAG) {
                    current.tagAppearances = appearances;
                    return;
                }
                current.propertyAppearances = appearances;
            });

            app.workspace.requestSaveLayout();
        },
        [app.workspace, updateSettings]
    );

    const writeInitialManualSortOrder = useCallback(
        async (files: readonly TFile[], propertyKey: string): Promise<boolean> => {
            try {
                const result = await writeManualSortOrder(app, files, propertyKey);
                if (result.failed > 0) {
                    showNotice(
                        strings.dragDrop.errors.failedToSetProperty.replace('{error}', getLocalizedManualSortWriteFailureMessage(result)),
                        { variant: 'warning' }
                    );
                    return false;
                }
                return true;
            } catch (error) {
                showNotice(
                    strings.dragDrop.errors.failedToSetProperty.replace('{error}', getErrorMessage(error, strings.common.unknownError)),
                    { variant: 'warning' }
                );
                return false;
            }
        },
        [app]
    );

    const removeManualSortPropertyFromFiles = useCallback(
        async (files: readonly TFile[], propertyKey: string): Promise<void> => {
            try {
                const result = await removeManualSortProperty(app, files, propertyKey);
                if (result.updated > 0) {
                    const message =
                        result.updated === 1
                            ? strings.fileSystem.notifications.manualSortPropertyRemovedFromNote
                            : strings.fileSystem.notifications.manualSortPropertyRemovedFromNotes.replace(
                                  '{count}',
                                  result.updated.toString()
                              );
                    showNotice(message, { variant: 'success' });
                }
                if (result.failed > 0) {
                    showNotice(
                        strings.dragDrop.errors.failedToSetProperty.replace('{error}', getLocalizedManualSortWriteFailureMessage(result)),
                        { variant: 'warning' }
                    );
                }
            } catch (error) {
                showNotice(
                    strings.dragDrop.errors.failedToSetProperty.replace('{error}', getErrorMessage(error, strings.common.unknownError)),
                    { variant: 'warning' }
                );
            }
        },
        [app]
    );

    const promptRemoveManualSortProperty = useCallback(
        (propertyKey: string, files: readonly TFile[], affectedCount: number) => {
            if (!isValidManualSortPropertyKey(propertyKey) || affectedCount === 0) {
                return;
            }

            new ConfirmModal(
                app,
                strings.modals.manualSortConfirm.removePropertyTitle,
                strings.modals.manualSortConfirm.removePropertyMessage(propertyKey, affectedCount),
                async () => {
                    await removeManualSortPropertyFromFiles(files, propertyKey);
                },
                strings.modals.manualSortConfirm.removePropertyConfirmButton
            ).open();
        },
        [app, removeManualSortPropertyFromFiles]
    );

    const applyManualSortMode = useCallback(async () => {
        const normalizedPropertyKey = getManualSortPropertyKey(settings);
        const target = getSelectionSortTarget();
        if (!target || !isValidManualSortPropertyKey(normalizedPropertyKey)) {
            return;
        }

        const currentSortSpec = resolveListSort(settings, selectionSortOverride);
        const isCurrentManualSort = isManualSortPropertyKey(settings, currentSortSpec.propertyKey);
        const initialFiles = getManualSortInitialFiles(target, selectionSortOverride);
        const propertyStats = getManualSortPropertyStats(app, initialFiles, normalizedPropertyKey);
        const allMarkdownFilesHaveValidManualSortRanks =
            propertyStats.markdownCount > 0 && propertyStats.validRankCount === propertyStats.markdownCount;
        const hasInvalidManualSortProperty = propertyStats.invalidPropertyCount > 0;
        const shouldInitializeManualSort = !isCurrentManualSort && propertyStats.markdownCount > 0 && propertyStats.validRankCount === 0;
        const shouldConfirmManualSort =
            !isCurrentManualSort &&
            !allMarkdownFilesHaveValidManualSortRanks &&
            (hasInvalidManualSortProperty || settings.confirmBeforeManualSort);
        const applyManualSort = async () => {
            if (shouldInitializeManualSort) {
                const didWriteInitialOrder = await writeInitialManualSortOrder(initialFiles, normalizedPropertyKey);
                if (!didWriteInitialOrder) {
                    return;
                }
            }

            await applyManualSortForProperty(normalizedPropertyKey, target);
        };

        if (shouldConfirmManualSort) {
            openManualSortConfirm(normalizedPropertyKey, propertyStats.markdownCount, applyManualSort);
            return;
        }

        await applyManualSort();
    }, [
        app,
        applyManualSortForProperty,
        getManualSortInitialFiles,
        getSelectionSortTarget,
        openManualSortConfirm,
        selectionSortOverride,
        settings,
        writeInitialManualSortOrder
    ]);

    const getDescendantSortAndGroupChangeStats = useCallback((): DescendantApplyStats => {
        const target = selectionSortTarget;
        if (!target) {
            return buildDescendantApplyStats({
                descendantCount: 0,
                descendantEntries: [],
                hasCurrentOverride: false,
                matchesCurrentOverride: () => false
            });
        }

        const sortOverrides =
            target.type === ItemType.FOLDER
                ? settings.folderSortOverrides
                : target.type === ItemType.TAG
                  ? settings.tagSortOverrides
                  : settings.propertySortOverrides;
        const appearances =
            target.type === ItemType.FOLDER
                ? settings.folderAppearances
                : target.type === ItemType.TAG
                  ? settings.tagAppearances
                  : settings.propertyAppearances;

        const sortEntries = Object.entries(sortOverrides ?? {}).filter(([key]) => isSelectionDescendantSettingKey(key));
        const groupEntries = Object.entries(appearances ?? {}).filter(
            ([key, descendantAppearance]) => isSelectionDescendantSettingKey(key) && descendantAppearance.groupBy !== undefined
        );
        const sortByKey = new Map(sortEntries);
        const groupByKey = new Map(groupEntries.map(([key, appearance]) => [key, appearance.groupBy]));
        const savedKeys = new Set([...sortByKey.keys(), ...groupByKey.keys()]);
        // One descendant can have both sort and group changes; confirmation counts each key once.
        const changedSavedKeys = new Set<string>();
        const missingRequiredKeys = new Set<string>();
        const matchingSavedKeys = new Set<string>();
        const hasCurrentSortOverride = selectionSortOverride !== undefined;
        const hasCurrentGroupOverride = effectiveSelectionGroupOverride !== undefined;

        savedKeys.forEach(key => {
            let changed = false;
            let missingRequired = false;

            if (hasCurrentSortOverride) {
                if (!sortByKey.has(key)) {
                    missingRequired = true;
                } else if (!areListSortOverridesEqual(sortByKey.get(key), selectionSortOverride)) {
                    changed = true;
                }
            } else if (sortByKey.has(key)) {
                changed = true;
            }

            if (effectiveSelectionGroupOverride !== undefined) {
                const savedGroupBy = groupByKey.get(key);
                if (savedGroupBy === undefined) {
                    missingRequired = true;
                } else if (!areListGroupingOptionsEqual(savedGroupBy, effectiveSelectionGroupOverride)) {
                    changed = true;
                }
            } else if (groupByKey.has(key)) {
                changed = true;
            }

            if (changed) {
                changedSavedKeys.add(key);
            }
            if (missingRequired) {
                missingRequiredKeys.add(key);
            }
            if (!changed && !missingRequired) {
                matchingSavedKeys.add(key);
            }
        });

        const missingUnsavedDescendantCount =
            hasCurrentSortOverride || hasCurrentGroupOverride ? Math.max(selectionDescendantCount - savedKeys.size, 0) : 0;
        const missingSavedDescendantCount = missingRequiredKeys.size + missingUnsavedDescendantCount;
        const affectedSavedKeys = new Set([...changedSavedKeys, ...missingRequiredKeys]);
        const affectedCount = affectedSavedKeys.size + missingUnsavedDescendantCount;

        return {
            descendantCount: selectionDescendantCount,
            savedDescendantCount: savedKeys.size,
            matchingSavedDescendantCount: matchingSavedKeys.size,
            changedSavedDescendantCount: changedSavedKeys.size,
            missingSavedDescendantCount,
            affectedCount,
            disabled: selectionDescendantCount === 0 || affectedCount === 0
        };
    }, [
        isSelectionDescendantSettingKey,
        selectionDescendantCount,
        effectiveSelectionGroupOverride,
        selectionSortOverride,
        selectionSortTarget,
        settings.folderAppearances,
        settings.folderSortOverrides,
        settings.propertyAppearances,
        settings.propertySortOverrides,
        settings.tagAppearances,
        settings.tagSortOverrides
    ]);

    const applySortAndGroupToDescendants = useCallback(async () => {
        const target = selectionSortTarget;
        if (!target) {
            return;
        }

        const selectionDescendantKeys = getSelectionDescendantKeys();
        if (selectionDescendantKeys.length === 0) {
            return;
        }

        await updateSettings(current => {
            const sortOverrides =
                target.type === ItemType.FOLDER
                    ? sanitizeRecord(ensureRecord(current.folderSortOverrides))
                    : target.type === ItemType.TAG
                      ? sanitizeRecord(ensureRecord(current.tagSortOverrides))
                      : sanitizeRecord(ensureRecord(current.propertySortOverrides));
            selectionDescendantKeys.forEach(key => {
                if (selectionSortOverride !== undefined) {
                    sortOverrides[key] = cloneListSortOverride(selectionSortOverride);
                    return;
                }
                delete sortOverrides[key];
            });

            if (target.type === ItemType.FOLDER) {
                current.folderSortOverrides = sortOverrides;
            } else if (target.type === ItemType.TAG) {
                current.tagSortOverrides = sortOverrides;
            } else {
                current.propertySortOverrides = sortOverrides;
            }

            const appearances =
                target.type === ItemType.FOLDER
                    ? sanitizeRecord(ensureRecord(current.folderAppearances))
                    : target.type === ItemType.TAG
                      ? sanitizeRecord(ensureRecord(current.tagAppearances))
                      : sanitizeRecord(ensureRecord(current.propertyAppearances));
            selectionDescendantKeys.forEach(key => {
                const normalizedAppearance = mergeListPaneAppearanceAndGrouping(
                    getStoredListPaneAppearanceFields(appearances[key]),
                    effectiveSelectionGroupOverride
                );
                if (normalizedAppearance) {
                    appearances[key] = normalizedAppearance;
                    return;
                }
                delete appearances[key];
            });

            if (target.type === ItemType.FOLDER) {
                current.folderAppearances = appearances;
                return;
            }
            if (target.type === ItemType.TAG) {
                current.tagAppearances = appearances;
                return;
            }
            current.propertyAppearances = appearances;
        });
        app.workspace.requestSaveLayout();
    }, [app, effectiveSelectionGroupOverride, getSelectionDescendantKeys, selectionSortOverride, selectionSortTarget, updateSettings]);

    const promptApplySortAndGroupToDescendants = useCallback(() => {
        const target = selectionSortTarget;
        if (!target) {
            return;
        }

        // Keep the prompt path on the same fast path as the menu: cached descendantCount
        // plus saved settings only. The only live tree walk happens inside applySortAndGroupToDescendants.
        const stats = getDescendantSortAndGroupChangeStats();

        if (stats.disabled) {
            return;
        }

        if (stats.changedSavedDescendantCount === 0) {
            // Only new descendant overrides will be created here. There is nothing to
            // overwrite or delete, so skip the confirmation modal and apply directly.
            runAsyncAction(async () => {
                await applySortAndGroupToDescendants();
            });
            return;
        }

        const title = strings.modals.bulkApply.applySortAndGroupTitle(selectionDescendantLabel);
        // The modal count reports only existing descendant overrides that will be
        // deleted or overwritten. Missing descendants that receive new overrides
        // are intentionally excluded from this number.
        const message = strings.modals.bulkApply.affectedCountMessage(stats.changedSavedDescendantCount);

        new ConfirmModal(
            app,
            title,
            message,
            async () => {
                await applySortAndGroupToDescendants();
            },
            strings.modals.bulkApply.applyButton,
            { confirmButtonClass: 'mod-cta' }
        ).open();
    }, [app, applySortAndGroupToDescendants, getDescendantSortAndGroupChangeStats, selectionDescendantLabel, selectionSortTarget]);

    const getDescendantAppearanceChangeStats = useCallback(
        (liveDescendantKeys?: readonly string[]) => {
            const target = selectionSortTarget;
            if (!target) {
                return buildDescendantApplyStats({
                    descendantCount: 0,
                    descendantEntries: [],
                    hasCurrentOverride: false,
                    matchesCurrentOverride: () => false
                });
            }

            const appearances =
                target.type === ItemType.FOLDER
                    ? settings.folderAppearances
                    : target.type === ItemType.TAG
                      ? settings.tagAppearances
                      : settings.propertyAppearances;

            const liveDescendantKeySet = liveDescendantKeys ? new Set(liveDescendantKeys) : null;
            const descendantEntries = Object.entries(appearances ?? {}).filter(([key, descendantAppearance]) => {
                const isDescendant = liveDescendantKeySet ? liveDescendantKeySet.has(key) : isSelectionDescendantSettingKey(key);
                return isDescendant && hasStoredListPaneAppearanceOverride(descendantAppearance);
            });

            return buildDescendantApplyStats({
                descendantCount: liveDescendantKeySet?.size ?? selectionDescendantCount,
                descendantEntries,
                hasCurrentOverride: hasSelectionAppearanceOverride,
                matchesCurrentOverride: ([, descendantAppearance]) =>
                    hasSelectionAppearanceOverride &&
                    selectionAppearanceOverride !== undefined &&
                    areStoredListPaneAppearanceFieldsEqual(descendantAppearance, selectionAppearanceOverride)
            });
        },
        [
            hasSelectionAppearanceOverride,
            isSelectionDescendantSettingKey,
            selectionAppearanceOverride,
            selectionDescendantCount,
            selectionSortTarget,
            settings.folderAppearances,
            settings.propertyAppearances,
            settings.tagAppearances
        ]
    );

    const applyAppearanceToDescendants = useCallback(async () => {
        const target = selectionSortTarget;
        if (!target) {
            return;
        }

        const selectionDescendantKeys = getSelectionDescendantKeys();
        if (selectionDescendantKeys.length === 0) {
            return;
        }

        await updateSettings(current => {
            const next = sanitizeRecord(
                ensureRecord(
                    target.type === ItemType.FOLDER
                        ? current.folderAppearances
                        : target.type === ItemType.TAG
                          ? current.tagAppearances
                          : current.propertyAppearances
                )
            );
            selectionDescendantKeys.forEach(key => {
                const normalizedAppearance = mergeListPaneAppearanceAndGrouping(
                    hasSelectionAppearanceOverride ? selectionAppearanceFields : null,
                    next[key]?.groupBy
                );
                if (normalizedAppearance) {
                    next[key] = normalizedAppearance;
                    return;
                }
                delete next[key];
            });

            if (target.type === ItemType.FOLDER) {
                current.folderAppearances = next;
            } else if (target.type === ItemType.TAG) {
                current.tagAppearances = next;
            } else {
                current.propertyAppearances = next;
            }
        });
        app.workspace.requestSaveLayout();
    }, [app, getSelectionDescendantKeys, hasSelectionAppearanceOverride, selectionAppearanceFields, selectionSortTarget, updateSettings]);

    const promptApplyAppearanceToDescendants = useCallback(() => {
        const target = selectionSortTarget;
        if (!target) {
            return;
        }

        // Menu enablement uses cached tree counts, while the confirmation promises concrete
        // counts and therefore intersects saved overrides with descendants that currently exist.
        const stats = getDescendantAppearanceChangeStats(getSelectionDescendantKeys());

        if (stats.disabled) {
            return;
        }

        // Every bulk appearance change is confirmed because creating overrides can visibly change many
        // descendants even when none of them has a saved customization yet.
        const title = hasSelectionAppearanceOverride
            ? strings.modals.bulkApply.applyAppearanceTitle(selectionDescendantLabel)
            : strings.modals.bulkApply.resetAppearanceTitle(selectionDescendantLabel);
        const message = hasSelectionAppearanceOverride
            ? strings.modals.bulkApply.applyAppearanceMessage(stats.affectedCount, stats.changedSavedDescendantCount)
            : strings.modals.bulkApply.resetAppearanceMessage(stats.affectedCount);

        new ConfirmModal(
            app,
            title,
            message,
            async () => {
                await applyAppearanceToDescendants();
            },
            strings.modals.bulkApply.applyButton,
            { confirmButtonClass: 'mod-cta' }
        ).open();
    }, [
        app,
        applyAppearanceToDescendants,
        getDescendantAppearanceChangeStats,
        getSelectionDescendantKeys,
        hasSelectionAppearanceOverride,
        selectionDescendantLabel,
        selectionSortTarget
    ]);

    const handleAppearanceMenu = useCallback(
        (event: React.MouseEvent) => {
            if (!hasAppearanceOrSortSelection) {
                return;
            }

            showListPaneAppearanceMenu({
                event: event.nativeEvent,
                settings,
                selectedFolder: selectionState.selectedFolder,
                selectedTag: selectionState.selectedTag,
                selectedProperty: selectionState.selectedProperty,
                selectionType: selectionState.selectionType,
                updateSettings,
                descendantAction: canApplyToDescendants
                    ? {
                          menuTitle: hasSelectionAppearanceOverride
                              ? strings.paneHeader.applyAppearanceToDescendants(selectionDescendantLabel)
                              : strings.paneHeader.resetAppearanceInDescendants(selectionDescendantLabel),
                          onApply: promptApplyAppearanceToDescendants,
                          disabled: getDescendantAppearanceChangeStats().disabled
                      }
                    : undefined,
                defaultSettingsAction: {
                    menuTitle: strings.folderAppearance.openPluginSettings,
                    onOpen: openDefaultListAppearanceSettings
                }
            });
        },
        [
            canApplyToDescendants,
            getDescendantAppearanceChangeStats,
            hasAppearanceOrSortSelection,
            hasSelectionAppearanceOverride,
            openDefaultListAppearanceSettings,
            promptApplyAppearanceToDescendants,
            selectionDescendantLabel,
            settings,
            selectionState.selectedFolder,
            selectionState.selectedTag,
            selectionState.selectedProperty,
            selectionState.selectionType,
            updateSettings
        ]
    );

    const handleSortMenu = useCallback(
        (event: React.MouseEvent) => {
            if (!hasAppearanceOrSortSelection) {
                return;
            }

            const menu = new Menu();
            const currentSortSpec = resolveListSort(settings, selectionSortOverride);
            const defaultSortSpec = resolveListSort(settings);
            const currentSort = currentSortSpec.option;
            const currentDirection = getSortDirection(currentSort);
            const currentField = getSortField(currentSort);
            const defaultDirection = getSortDirection(defaultSortSpec.option);
            const defaultField = getSortField(defaultSortSpec.option);
            const manualSortPropertyKey = getManualSortPropertyKey(settings);
            const propertySortKeys = getAvailablePropertySortKeys(settings);
            const hasManualSortPropertyKey = isValidManualSortPropertyKey(manualSortPropertyKey);
            const manualSortPropertyFiles = hasManualSortPropertyKey && selectionSortTarget ? getManualSortPropertyRemovalFiles() : [];
            const manualSortPropertyCount = hasManualSortPropertyKey
                ? countMarkdownFilesWithManualSortProperty(app, manualSortPropertyFiles, manualSortPropertyKey)
                : 0;
            const isPropertySortActive = currentField === 'property';
            const isManualSortActive = isPropertySortActive && isManualSortPropertyKey(settings, currentSortSpec.propertyKey);
            const sortFieldLabels: Record<SortField, string> = {
                modified: strings.settings.items.defaultSortOrder.fields.dateEdited,
                created: strings.settings.items.defaultSortOrder.fields.dateCreated,
                title: strings.settings.items.defaultSortOrder.fields.title,
                filename: strings.settings.items.defaultSortOrder.fields.fileName,
                property: strings.settings.items.defaultSortOrder.fields.property
            };
            const sortDirectionLabels: Record<SortDirection, string> = {
                asc: strings.settings.items.defaultSortOrder.directions.asc,
                desc: strings.settings.items.defaultSortOrder.directions.desc
            };
            const getSortFieldLabel = (field: SortField, propertyKey?: string): string => {
                if (field === 'property') {
                    const trimmedPropertyKey = propertyKey?.trim();
                    return trimmedPropertyKey
                        ? `${sortFieldLabels.property} \u2018${isolateBidiText(trimmedPropertyKey)}\u2019`
                        : sortFieldLabels.property;
                }

                return sortFieldLabels[field];
            };
            const withDefaultSuffix = (label: string, isDefault: boolean): string =>
                isDefault ? `${label} ${strings.folderAppearance.defaultSuffix}` : label;
            const getSortFieldMenuIcon = (field: SortField, propertyKey?: string): string => {
                if (field === 'property') {
                    const propertyMenuIcon = resolveIconForMenu(resolvePropertySortIcon(propertyKey ?? ''));
                    if (propertyMenuIcon) {
                        return propertyMenuIcon;
                    }
                }

                return resolveUXIconForMenu(settings.interfaceIcons, getListSortFieldIconId(field));
            };
            const defaultSortOverride = createListSortOverride(defaultSortSpec.option, defaultSortSpec.propertyKey);
            // Field and direction share one persisted value, so an override is removed only when
            // the complete selection matches the default. Comparing either component alone would
            // also reset the other component when its default-marked entry is clicked.
            const applySort = (field: SortField, direction: SortDirection, propertyKey?: string) => {
                const option = buildSortOption(field, direction);
                const selectedSort = createListSortOverride(option, propertyKey);
                const nextOverride = resolveListSortOverrideForDefault(selectedSort, defaultSortOverride);
                runAsyncAction(async () => {
                    if (nextOverride === undefined) {
                        await removeSelectionSortOverride();
                    } else {
                        await setSelectionSortOverride(nextOverride);
                    }
                    app.workspace.requestSaveLayout();
                });
            };
            // Field changes start dates with newest first and text/property fields in ascending
            // order. The direction entries below remain available as explicit overrides.
            const applySortField = (field: SortField, propertyKey?: string) => {
                applySort(field, getSortDirectionForFieldChange(field), propertyKey);
            };
            const hasSelectionSortOverride = selectionSortOverride !== undefined;
            const isViewUsingDefaults = !hasSelectionSortOverride && !hasSelectionGroupOverride;

            menu.addItem(item => {
                item.setTitle(strings.folderAppearance.sortBy).setIcon('lucide-arrow-up-down').setDisabled(true);
            });

            (['modified', 'created', 'title', 'filename'] as const).forEach(field => {
                const isDefaultField = defaultField === field;
                const isCurrentField = currentField === field;
                menu.addItem(item => {
                    item.setTitle(withDefaultSuffix(getSortFieldLabel(field), isDefaultField))
                        .setIcon(getSortFieldMenuIcon(field))
                        .setChecked(isCurrentField)
                        .onClick(() => {
                            if (isCurrentField) {
                                return;
                            }
                            applySortField(field);
                        });
                });
            });

            propertySortKeys.forEach(propertyKey => {
                const isDefaultField = defaultField === 'property' && samePropertySortKey(defaultSortSpec.propertyKey, propertyKey);
                const isCurrentField = currentField === 'property' && samePropertySortKey(currentSortSpec.propertyKey, propertyKey);
                menu.addItem(item => {
                    item.setTitle(withDefaultSuffix(getSortFieldLabel('property', propertyKey), isDefaultField))
                        .setIcon(getSortFieldMenuIcon('property', propertyKey))
                        .setChecked(isCurrentField)
                        .onClick(() => {
                            if (isCurrentField) {
                                return;
                            }
                            applySortField('property', propertyKey);
                        });
                });
            });

            // Without configured property keys the property sort entries above render nothing, so a
            // disabled placeholder keeps the feature visible, matching the disabled manual sort entry.
            if (propertySortKeys.length === 0) {
                menu.addItem(item => {
                    item.setTitle(getSortFieldLabel('property')).setIcon(getSortFieldMenuIcon('property')).setDisabled(true);
                });
            }

            menu.addSeparator();

            (['asc', 'desc'] as const).forEach(direction => {
                const isDefaultDirection = defaultDirection === direction;
                menu.addItem(item => {
                    const option = buildSortOption(currentField, direction);
                    item.setTitle(withDefaultSuffix(sortDirectionLabels[direction], isDefaultDirection))
                        .setIcon(getSortIconName(option))
                        .setDisabled(isManualSortActive)
                        .setChecked(currentDirection === direction)
                        .onClick(() => {
                            if (isManualSortActive) {
                                return;
                            }
                            applySort(currentField, direction, currentField === 'property' ? currentSortSpec.propertyKey : undefined);
                        });
                });
            });

            menu.addSeparator();

            // The manual sort toggle and its actions sit in their own separated cluster after the
            // direction entries because those entries apply to the sort fields but not to manual sort.
            // Manual sort never carries a default marker: reconciliation prevents the default sort
            // from resolving to the manual-sort property, so this entry always stores an override.
            menu.addItem(item => {
                item.setTitle(strings.paneHeader.manualSort)
                    .setIcon('lucide-list-ordered')
                    .setDisabled(!hasManualSortPropertyKey)
                    .setChecked(isManualSortActive)
                    .onClick(() => {
                        if (!hasManualSortPropertyKey) {
                            return;
                        }
                        runAsyncAction(applyManualSortMode);
                    });
            });

            menu.addItem(item => {
                item.setTitle(strings.paneHeader.editSortOrder)
                    .setIcon('lucide-list-ordered')
                    .setDisabled(!isManualSortActive || !onManualSortStart)
                    .onClick(() => {
                        if (!isManualSortActive || !onManualSortStart) {
                            return;
                        }
                        onManualSortStart(currentSortSpec.propertyKey);
                    });
            });

            menu.addItem(item => {
                item.setTitle(strings.paneHeader.removeSortProperty)
                    .setIcon('lucide-eraser')
                    .setDisabled(manualSortPropertyCount === 0)
                    .onClick(() => {
                        if (manualSortPropertyCount === 0) {
                            return;
                        }
                        promptRemoveManualSortProperty(manualSortPropertyKey, manualSortPropertyFiles, manualSortPropertyCount);
                    });
            });

            menu.addSeparator();

            menu.addItem(item => {
                item.setTitle(strings.folderAppearance.groupBy).setIcon('lucide-layers').setDisabled(true);
            });

            const effectiveCurrentGroup = resolveEffectiveListGroupingForSort({
                groupBy: groupingInfo.effectiveGrouping,
                sortOption: currentSort,
                selectionType: selectionState.selectionType,
                isManualSortActive
            });
            const isGroupOptionDisabled = (option: ListNoteGroupingOption): boolean =>
                isManualSortActive || (option === 'date' && !isDateSortOption(currentSort));
            // Group property and order share one persisted value, matching the composite handling
            // above for sort field and direction.
            const applyGrouping = (option: ListNoteGroupingOption) => {
                const nextOverride = resolveListGroupingOverrideForDefault(option, groupingInfo.defaultGrouping);
                runAsyncAction(async () => {
                    await setSelectionGroupOverride(nextOverride);
                    app.workspace.requestSaveLayout();
                });
            };
            const addGroupOptionItem = (option: ListNoteGroupingOption, title: string, icon: string, isDisabled: boolean): void => {
                // Same-kind comparison marks the default property entry even when only the current
                // order differs; persistence still compares the complete grouping value.
                const isDefaultGroupKind = areListGroupingOptionsSameKind(option, groupingInfo.defaultGrouping);
                menu.addItem(item => {
                    // Same-kind comparison keeps a property entry checked when only its group order direction differs.
                    item.setTitle(`    ${withDefaultSuffix(title, isDefaultGroupKind)}`)
                        .setIcon(icon)
                        .setDisabled(isDisabled)
                        .setChecked(areListGroupingOptionsSameKind(effectiveCurrentGroup, option))
                        .onClick(() => {
                            if (isDisabled) {
                                return;
                            }
                            applyGrouping(option);
                        });
                });
            };

            // Custom and Date annotate the sorted list with headers; the separator below splits
            // them from the entries that partition the list into ordered groups.
            (['custom', 'date'] as const).forEach(option => {
                addGroupOptionItem(
                    option,
                    strings.settings.items.defaultGrouping.options[option],
                    getGroupingIcon(option),
                    isGroupOptionDisabled(option)
                );
            });

            menu.addSeparator();

            if (hasFolderSelection) {
                addGroupOptionItem(
                    'folder',
                    strings.settings.items.defaultGrouping.options.folder,
                    getGroupingIcon('folder'),
                    isGroupOptionDisabled('folder')
                );
            }

            // The configured grouping properties provide the grouping choices, mirroring the sort field list above.
            // Switching the grouping property keeps the current group order, matching Obsidian Bases.
            const effectiveGroupPropertyKey = getPropertyGroupingKey(effectiveCurrentGroup);
            const effectiveGroupOrder = getPropertyGroupingOrder(effectiveCurrentGroup) ?? 'follow';
            const propertyGroupKeys = getAvailablePropertyGroupKeys(settings);
            propertyGroupKeys.forEach(propertyKey => {
                addGroupOptionItem(
                    createPropertyGroupingOption(propertyKey, effectiveGroupOrder),
                    getSortFieldLabel('property', propertyKey),
                    getSortFieldMenuIcon('property', propertyKey),
                    isManualSortActive
                );
            });

            // Without configured property keys the property grouping entries above render nothing, so a
            // disabled placeholder keeps the feature visible, matching the disabled manual sort entry.
            if (propertyGroupKeys.length === 0) {
                menu.addItem(item => {
                    item.setTitle(`    ${getSortFieldLabel('property')}`)
                        .setIcon(getSortFieldMenuIcon('property'))
                        .setDisabled(true);
                });
            }

            // Group order applies only to property grouping; date and folder groups keep their fixed order.
            if (effectiveGroupPropertyKey !== null) {
                menu.addSeparator();
                // The default marker follows the default grouping's order independent of its
                // property key, matching how the sort menu marks its default direction.
                const defaultGroupOrder = getPropertyGroupingOrder(groupingInfo.defaultGrouping);
                const groupOrderLabels: Record<PropertyGroupingOrder, string> = {
                    follow: strings.settings.items.defaultGroupingDirection.options.follow,
                    asc: sortDirectionLabels.asc,
                    desc: sortDirectionLabels.desc
                };
                const groupOrderIcons: Record<PropertyGroupingOrder, string> = {
                    follow: 'lucide-arrow-up-down',
                    asc: 'lucide-sort-asc',
                    desc: 'lucide-sort-desc'
                };
                (['follow', 'asc', 'desc'] as const).forEach(order => {
                    const orderOption = createPropertyGroupingOption(effectiveGroupPropertyKey, order);
                    const isDefaultOrder = defaultGroupOrder === order;
                    menu.addItem(item => {
                        item.setTitle(`    ${withDefaultSuffix(groupOrderLabels[order], isDefaultOrder)}`)
                            .setIcon(groupOrderIcons[order])
                            .setChecked(effectiveGroupOrder === order)
                            .onClick(() => {
                                // Re-clicking the checked order keeps the current grouping property and order unchanged.
                                if (effectiveGroupOrder === order) {
                                    return;
                                }
                                applyGrouping(orderOption);
                            });
                    });
                });
            }

            if (canApplyToDescendants) {
                menu.addSeparator();
                menu.addItem(item => {
                    const descendantStats = getDescendantSortAndGroupChangeStats();
                    item.setTitle(strings.paneHeader.applySortAndGroupToDescendants(selectionDescendantLabel))
                        .setIcon('lucide-squares-unite')
                        .setDisabled(descendantStats.disabled)
                        .onClick(() => {
                            promptApplySortAndGroupToDescendants();
                        });
                });
            }

            menu.addSeparator();
            menu.addItem(item => {
                item.setTitle(strings.paneHeader.resetViewToDefaults)
                    .setIcon('lucide-rotate-ccw')
                    .setDisabled(isViewUsingDefaults)
                    .onClick(() => {
                        if (isViewUsingDefaults) {
                            return;
                        }

                        runAsyncAction(async () => {
                            if (hasSelectionSortOverride) {
                                await removeSelectionSortOverride();
                            }
                            if (hasSelectionGroupOverride) {
                                await setSelectionGroupOverride(undefined);
                            }
                            app.workspace.requestSaveLayout();
                        });
                    });
            });
            menu.addSeparator();
            menu.addItem(item => {
                item.setTitle(strings.settings.changeDefaultSettings)
                    .setIcon('lucide-settings')
                    .onClick(() => {
                        openDefaultListSettings();
                    });
            });

            menu.showAtMouseEvent(event.nativeEvent);
        },
        [
            canApplyToDescendants,
            hasAppearanceOrSortSelection,
            hasFolderSelection,
            hasSelectionGroupOverride,
            app,
            applyManualSortMode,
            getDescendantSortAndGroupChangeStats,
            getManualSortPropertyRemovalFiles,
            groupingInfo.defaultGrouping,
            groupingInfo.effectiveGrouping,
            openDefaultListSettings,
            promptApplySortAndGroupToDescendants,
            promptRemoveManualSortProperty,
            removeSelectionSortOverride,
            resolvePropertySortIcon,
            selectionDescendantLabel,
            selectionSortTarget,
            selectionSortOverride,
            selectionState.selectionType,
            setSelectionGroupOverride,
            setSelectionSortOverride,
            settings,
            onManualSortStart
        ]
    );

    /**
     * Toggles the display of notes from descendants.
     * When enabling descendants, automatically selects the active file if it's within the current folder/tag hierarchy.
     */
    const handleToggleDescendants = useCallback(() => {
        const wasShowingDescendants = includeDescendantNotes;
        const activeFile = app.workspace.getActiveFile();

        // Toggle descendant notes preference using UX action
        setIncludeDescendantNotes(!wasShowingDescendants);

        // Special case: When enabling descendants, auto-select the active file if it's in the folder
        if (!wasShowingDescendants && selectionState.selectedFolder && !selectionState.selectedFile) {
            if (activeFile) {
                // Check if the active file would be visible with descendants enabled
                const filesInFolder = getFilesForFolder(
                    selectionState.selectedFolder,
                    settings,
                    { includeDescendantNotes: true, showHiddenItems },
                    app
                );

                if (filesInFolder.some(f => f.path === activeFile.path)) {
                    selectionDispatch({ type: 'SET_SELECTED_FILE', file: activeFile });
                }
            }
        }
    }, [
        setIncludeDescendantNotes,
        includeDescendantNotes,
        showHiddenItems,
        selectionState.selectedFolder,
        selectionState.selectedFile,
        app,
        selectionDispatch,
        settings
    ]);

    const hasCustomSortOrGroup = selectionSortOverride !== undefined || hasSelectionGroupOverride;

    const hasMeaningfulOverrides = (appearance: ListPaneAppearance | undefined) => hasStoredListPaneAppearanceOverride(appearance);

    // Check if folder, tag, or property has custom appearance settings
    const hasCustomAppearance =
        (hasFolderSelection &&
            selectionState.selectedFolder &&
            hasMeaningfulOverrides(settings.folderAppearances?.[selectionState.selectedFolder.path])) ||
        (hasTagSelection && selectionState.selectedTag && hasMeaningfulOverrides(settings.tagAppearances?.[selectionState.selectedTag])) ||
        (hasPropertySelection &&
            selectionState.selectedProperty &&
            hasMeaningfulOverrides(settings.propertyAppearances?.[selectionState.selectedProperty]));

    const activeFileVisibility = useMemo(() => {
        return findVaultProfileById(vaultProfiles, vaultProfileId).fileVisibility;
    }, [vaultProfileId, vaultProfiles]);

    const descendantsTooltip = useMemo(() => {
        const showNotes = activeFileVisibility === FILE_VISIBILITY.DOCUMENTS;

        if (selectionState.selectionType === ItemType.TAG) {
            return showNotes ? strings.paneHeader.showNotesFromDescendants : strings.paneHeader.showFilesFromDescendants;
        }

        if (selectionState.selectionType === ItemType.PROPERTY) {
            return showNotes ? strings.paneHeader.showNotesFromDescendants : strings.paneHeader.showFilesFromDescendants;
        }

        if (selectionState.selectionType === ItemType.FOLDER) {
            return showNotes ? strings.paneHeader.showNotesFromSubfolders : strings.paneHeader.showFilesFromSubfolders;
        }

        return showNotes ? strings.paneHeader.showNotesFromSubfolders : strings.paneHeader.showFilesFromSubfolders;
    }, [activeFileVisibility, selectionState.selectionType]);

    return {
        handleNewFile,
        canCreateNewFile,
        handleRevealFile,
        canRevealFile,
        handleAppearanceMenu,
        handleSortMenu,
        handleToggleDescendants,
        getSortIcon,
        hasAppearanceOrSortSelection,
        hasCustomSortOrGroup,
        hasCustomAppearance,
        descendantsTooltip
    };
}
