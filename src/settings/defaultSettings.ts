/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025 Johan Sanneblad
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

import { DEFAULT_CUSTOM_COLORS } from '../constants/colorPalette';
import { getDefaultKeyboardShortcuts } from '../utils/keyboardShortcuts';
import { FILE_VISIBILITY } from '../utils/fileTypeUtils';
import { LISTPANE_MEASUREMENTS, NAVPANE_MEASUREMENTS, type PinnedNotes } from '../types';
import { DEFAULT_UI_SCALE } from '../utils/uiScale';
import type { FolderAppearance, TagAppearance } from '../hooks/useListPaneAppearance';
import type { NotebookNavigatorSettings } from './types';
import { sanitizeRecord } from '../utils/recordUtils';

/**
 * Default settings for the plugin
 * Used when plugin is first installed or settings are reset
 */
export const DEFAULT_SETTINGS: NotebookNavigatorSettings = {
    // General tab - Filtering
    vaultProfiles: [
        {
            id: 'default',
            name: '',
            fileVisibility: FILE_VISIBILITY.SUPPORTED,
            hiddenFolders: [],
            hiddenTags: [],
            hiddenFiles: [],
            hiddenFileNamePatterns: [],
            navigationBanner: null,
            shortcuts: []
        }
    ],
    vaultProfile: 'default',
    vaultTitle: 'navigation',

    // General tab - Behavior
    autoRevealActiveFile: true,
    autoRevealIgnoreRightSidebar: true,
    multiSelectModifier: 'cmdCtrl',
    paneTransitionDuration: 150,

    // General tab - View
    startView: 'files',
    interfaceIcons: sanitizeRecord<string>(undefined),

    // General tab - Homepage
    homepage: null,
    mobileHomepage: null,
    useMobileHomepage: false,

    // General tab - Desktop appearance
    showTooltips: false,
    showTooltipPath: true,
    desktopBackground: 'separate',
    desktopScale: DEFAULT_UI_SCALE,

    mobileScale: DEFAULT_UI_SCALE,

    // General tab - Formatting
    dateFormat: 'MMM d, yyyy',
    timeFormat: 'h:mm a',

    // Navigation pane tab - Behavior
    pinRecentNotesWithShortcuts: false,
    collapseBehavior: 'all',
    smartCollapse: true,

    // Navigation pane tab - Shortcuts & recent items
    showSectionIcons: true,
    showShortcuts: true,
    shortcutBadgeDisplay: 'index',
    skipAutoScroll: false,
    showRecentNotes: true,
    recentNotesCount: 5,

    // Navigation pane tab - Appearance
    colorIconOnly: false,
    toolbarVisibility: {
        navigation: {
            expandCollapse: true,
            hiddenItems: true,
            rootReorder: true,
            newFolder: true
        },
        list: {
            search: true,
            descendants: true,
            sort: true,
            appearance: true,
            newNote: true
        }
    },
    showNoteCount: true,
    separateNoteCounts: true,
    navIndent: NAVPANE_MEASUREMENTS.defaultIndent,
    navItemHeight: NAVPANE_MEASUREMENTS.defaultItemHeight,
    navItemHeightScaleText: true,
    rootLevelSpacing: 0,

    // Folders & tags tab
    autoSelectFirstFileOnFocusChange: false,
    autoExpandFoldersTags: false,
    springLoadedFolders: true,
    springLoadedFoldersInitialDelay: 0.5,
    springLoadedFoldersSubsequentDelay: 0.5,
    showFolderIcons: true,
    showRootFolder: true,
    inheritFolderColors: false,
    inheritTagColors: true,
    enableFolderNotes: false,
    folderNoteType: 'markdown',
    folderNoteName: '',
    folderNoteProperties: '',
    hideFolderNoteInList: true,
    pinCreatedFolderNote: false,
    showTags: true,
    showTagIcons: true,
    showAllTagsFolder: true,
    showUntagged: true,
    tagSortOrder: 'alpha-asc',
    keepEmptyTagsProperty: false,

    // List pane tab
    defaultListMode: 'standard',
    defaultFolderSort: 'modified-desc',
    revealFileOnListChanges: true,
    listPaneTitle: 'header',
    noteGrouping: 'date',
    filterPinnedByFolder: false,
    showPinnedGroupHeader: true,
    showPinnedIcon: true,
    optimizeNoteHeight: true,
    compactItemHeight: LISTPANE_MEASUREMENTS.defaultCompactItemHeight,
    compactItemHeightScaleText: true,
    showQuickActions: true,
    quickActionRevealInFolder: false,
    quickActionAddTag: true,
    quickActionAddToShortcuts: true,
    quickActionPinNote: true,
    quickActionOpenInNewTab: false,

    // Notes tab
    useFrontmatterMetadata: false,
    frontmatterIconField: 'icon',
    frontmatterColorField: 'color',
    frontmatterNameField: '',
    frontmatterCreatedField: '',
    frontmatterModifiedField: '',
    frontmatterDateFormat: '',
    saveMetadataToFrontmatter: false,
    showFileIcons: true,
    showFilenameMatchIcons: false,
    fileNameIconMap: {},
    showCategoryIcons: false,
    fileTypeIconMap: {},
    fileNameRows: 1,
    showFilePreview: true,
    skipHeadingsInPreview: true,
    skipCodeBlocksInPreview: true,
    stripHtmlInPreview: true,
    previewRows: 2,
    previewProperties: [],
    showFeatureImage: true,
    featureImageProperties: [],
    forceSquareFeatureImage: true,
    downloadExternalFeatureImages: true,
    showFileTags: true,
    colorFileTags: true,
    prioritizeColoredFileTags: true,
    showFileTagAncestors: false,
    showFileTagsInCompactMode: false,
    showFileDate: true,
    // Default to showing modified date when sorting alphabetically
    alphabeticalDateMode: 'modified',
    showParentFolder: true,
    parentFolderClickRevealsFile: false,
    showParentFolderColor: true,

    // Icon packs tab
    externalIconProviders: {},

    // Search & hotkeys tab
    searchProvider: 'internal',
    keyboardShortcuts: getDefaultKeyboardShortcuts(),

    // Advanced tab
    checkForUpdatesOnStart: true,
    confirmBeforeDelete: true,
    interceptTagClicks: true,

    // Runtime state and cached data
    customVaultName: '',
    pinnedNotes: {} as PinnedNotes,
    fileIcons: {},
    fileColors: {},
    folderIcons: {},
    folderColors: {},
    folderBackgroundColors: {},
    folderSortOverrides: {},
    folderAppearances: {} as Record<string, FolderAppearance>,
    tagIcons: {},
    tagColors: {},
    tagBackgroundColors: {},
    tagSortOverrides: {},
    tagAppearances: {} as Record<string, TagAppearance>,
    navigationSeparators: {},
    userColors: [...DEFAULT_CUSTOM_COLORS],
    lastShownVersion: '',
    lastAnnouncedRelease: '',
    rootFolderOrder: [],
    rootTagOrder: []
};
