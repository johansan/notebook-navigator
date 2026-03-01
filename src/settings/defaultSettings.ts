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

import { DEFAULT_CUSTOM_COLORS } from '../constants/colorPalette';
import { getDefaultKeyboardShortcuts } from '../utils/keyboardShortcuts';
import { FILE_VISIBILITY } from '../utils/fileTypeUtils';
import { LISTPANE_MEASUREMENTS, NAVPANE_MEASUREMENTS, type PinnedNotes } from '../types';
import { DEFAULT_UI_SCALE } from '../utils/uiScale';
import type { FolderAppearance, TagAppearance } from '../hooks/useListPaneAppearance';
import type { NotebookNavigatorSettings } from './types';
import { SYNC_MODE_SETTING_IDS, type SettingSyncMode } from './types';
import { sanitizeRecord } from '../utils/recordUtils';
import {
    DEFAULT_CALENDAR_CUSTOM_FILE_PATTERN,
    DEFAULT_CALENDAR_CUSTOM_MONTH_PATTERN,
    DEFAULT_CALENDAR_CUSTOM_QUARTER_PATTERN,
    DEFAULT_CALENDAR_CUSTOM_WEEK_PATTERN,
    DEFAULT_CALENDAR_CUSTOM_YEAR_PATTERN
} from '../utils/calendarCustomNotePatterns';

const defaultSettingsSync = sanitizeRecord<SettingSyncMode>(undefined);
SYNC_MODE_SETTING_IDS.forEach(settingId => {
    defaultSettingsSync[settingId] = 'synced';
});

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
            propertyKeys: [],
            hiddenFolders: [],
            hiddenTags: [],
            hiddenFileNames: [],
            hiddenFileTags: [],
            hiddenFileProperties: [],
            navigationBanner: null,
            periodicNotesFolder: '',
            shortcuts: []
        }
    ],
    vaultProfile: 'default',
    vaultTitle: 'navigation',
    syncModes: defaultSettingsSync,

    // General tab - Behavior
    createNewNotesInNewTab: false,
    autoRevealActiveFile: true,
    autoRevealShortestPath: true,
    autoRevealIgnoreRightSidebar: true,
    paneTransitionDuration: 150,

    // General tab - Keyboard navigation
    multiSelectModifier: 'cmdCtrl',
    enterToOpenFiles: false,
    shiftEnterOpenContext: 'tab',
    cmdCtrlEnterOpenContext: 'split',

    // General tab - View
    startView: 'files',
    showInfoButtons: true,

    // General tab - Homepage
    homepage: null,
    mobileHomepage: null,
    useMobileHomepage: false,

    // General tab - Desktop appearance
    dualPane: true,
    dualPaneOrientation: 'horizontal',
    navigationPaneSide: 'left',
    showTooltips: false,
    showTooltipPath: true,
    desktopBackground: 'separate',
    desktopScale: DEFAULT_UI_SCALE,

    mobileScale: DEFAULT_UI_SCALE,

    // General tab - Mobile appearance
    useFloatingToolbars: true,

    // General tab - Toolbar buttons
    toolbarVisibility: {
        navigation: {
            toggleDualPane: true,
            expandCollapse: true,
            calendar: true,
            hiddenItems: true,
            rootReorder: true,
            newFolder: true
        },
        list: {
            back: true,
            search: true,
            descendants: true,
            sort: true,
            appearance: true,
            newNote: true
        }
    },

    // General tab - Icons
    interfaceIcons: sanitizeRecord<string>(undefined),
    colorIconOnly: false,

    // General tab - Formatting
    dateFormat: 'MMM D, YYYY',
    timeFormat: 'h:mm a',
    calendarTemplateFolder: '',

    // Files tab
    confirmBeforeDelete: true,
    deleteAttachments: 'ask',
    moveFileConflicts: 'ask',

    // Icon packs tab
    externalIconProviders: {},

    // Advanced tab
    checkForUpdatesOnStart: true,

    // Navigation pane tab - Appearance
    pinNavigationBanner: true,
    showNoteCount: true,
    separateNoteCounts: true,
    showIndentGuides: false,
    rootLevelSpacing: 0,
    navIndent: NAVPANE_MEASUREMENTS.defaultIndent,
    navItemHeight: NAVPANE_MEASUREMENTS.defaultItemHeight,
    navItemHeightScaleText: true,

    // Navigation pane tab - Behavior
    collapseBehavior: 'all',
    smartCollapse: true,
    autoSelectFirstFileOnFocusChange: false,
    autoExpandNavItems: false,
    springLoadedFolders: true,
    springLoadedFoldersInitialDelay: 0.5,
    springLoadedFoldersSubsequentDelay: 0.5,

    // Shortcuts tab
    showSectionIcons: true,
    showShortcuts: true,
    shortcutBadgeDisplay: 'index',
    skipAutoScroll: false,
    showRecentNotes: true,
    hideRecentNotes: 'none',
    pinRecentNotesWithShortcuts: false,
    recentNotesCount: 5,

    // Folders tab
    showFolderIcons: true,
    showRootFolder: true,
    inheritFolderColors: false,
    folderSortOrder: 'alpha-asc',
    enableFolderNotes: false,
    folderNoteType: 'markdown',
    folderNoteName: '',
    folderNoteNamePattern: '',
    folderNoteTemplate: null,
    enableFolderNoteLinks: true,
    hideFolderNoteInList: true,
    pinCreatedFolderNote: false,
    openFolderNotesInNewTab: false,

    // Tags tab
    showTags: true,
    showTagIcons: true,
    showAllTagsFolder: true,
    showUntagged: true,
    tagSortOrder: 'alpha-asc',
    inheritTagColors: true,
    keepEmptyTagsProperty: false,

    // Properties tab
    showProperties: true,
    showPropertyIcons: true,
    inheritPropertyColors: true,
    propertySortOrder: 'alpha-asc',
    showAllPropertiesFolder: true,

    // List pane tab
    defaultListMode: 'standard',
    includeDescendantNotes: false,
    defaultFolderSort: 'modified-desc',
    propertySortKey: '',
    propertySortSecondary: 'title',
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

    // Frontmatter tab
    useFrontmatterMetadata: false,
    frontmatterIconField: 'icon',
    frontmatterColorField: 'color',
    frontmatterBackgroundField: 'background',
    frontmatterNameField: '',
    frontmatterCreatedField: '',
    frontmatterModifiedField: '',
    frontmatterDateFormat: '',

    // Notes tab
    showFileIcons: true,
    showFileIconUnfinishedTask: false,
    showFilenameMatchIcons: false,
    fileNameIconMap: {},
    showCategoryIcons: false,
    fileTypeIconMap: {},
    fileNameRows: 1,
    showFilePreview: true,
    skipHeadingsInPreview: true,
    skipCodeBlocksInPreview: true,
    stripHtmlInPreview: true,
    stripLatexInPreview: true,
    previewRows: 2,
    previewProperties: [],
    showFeatureImage: true,
    featureImageProperties: [],
    featureImageExcludeProperties: [],
    forceSquareFeatureImage: true,
    downloadExternalFeatureImages: true,
    showFileTags: true,
    colorFileTags: true,
    prioritizeColoredFileTags: true,
    showFileTagAncestors: false,
    showFileTagsInCompactMode: false,
    showFileProperties: true,
    colorFileProperties: true,
    prioritizeColoredFileProperties: true,
    notePropertyType: 'none',
    showFilePropertiesInCompactMode: false,
    showPropertiesOnSeparateRows: false,
    showFileDate: true,
    // Default to showing modified date when sorting alphabetically
    alphabeticalDateMode: 'modified',
    showParentFolder: true,
    parentFolderClickRevealsFile: false,
    showParentFolderColor: false,
    showParentFolderIcon: false,

    // Calendar tab - Calendar
    calendarPlacement: 'left-sidebar',
    calendarConfirmBeforeCreate: true,
    calendarLocale: 'system-default',
    calendarWeekendDays: 'sat-sun',
    calendarHighlightToday: true,
    calendarShowFeatureImage: true,
    calendarShowWeekNumber: false,
    calendarShowQuarter: false,
    calendarShowYearCalendar: true,
    calendarLeftPlacement: 'navigation',
    calendarWeeksToShow: 1,

    // Calendar tab - Calendar integration
    calendarIntegrationMode: 'notebook-navigator',
    calendarCustomFilePattern: DEFAULT_CALENDAR_CUSTOM_FILE_PATTERN,
    calendarCustomWeekPattern: DEFAULT_CALENDAR_CUSTOM_WEEK_PATTERN,
    calendarCustomMonthPattern: DEFAULT_CALENDAR_CUSTOM_MONTH_PATTERN,
    calendarCustomQuarterPattern: DEFAULT_CALENDAR_CUSTOM_QUARTER_PATTERN,
    calendarCustomYearPattern: DEFAULT_CALENDAR_CUSTOM_YEAR_PATTERN,
    calendarCustomFileTemplate: null,
    calendarCustomWeekTemplate: null,
    calendarCustomMonthTemplate: null,
    calendarCustomQuarterTemplate: null,
    calendarCustomYearTemplate: null,

    // Search settings and hotkeys
    searchProvider: 'internal',
    keyboardShortcuts: getDefaultKeyboardShortcuts(),

    // Runtime state and cached data
    customVaultName: '',
    pinnedNotes: {} as PinnedNotes,
    fileIcons: {},
    fileColors: {},
    folderIcons: {},
    folderColors: {},
    folderBackgroundColors: {},
    folderSortOverrides: {},
    folderTreeSortOverrides: {},
    folderAppearances: {} as Record<string, FolderAppearance>,
    tagIcons: {},
    tagColors: {},
    tagBackgroundColors: {},
    tagSortOverrides: {},
    tagTreeSortOverrides: {},
    tagAppearances: {} as Record<string, TagAppearance>,
    propertyIcons: {},
    propertyColors: {},
    propertyBackgroundColors: {},
    propertyTreeSortOverrides: {},
    navigationSeparators: {},
    userColors: [...DEFAULT_CUSTOM_COLORS],
    lastShownVersion: '',
    rootFolderOrder: [],
    rootTagOrder: [],
    rootPropertyOrder: []
};
