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
import {
    NARROW_SIDEBAR_CUSTOM_WIDTH_DEFAULT,
    SYNC_MODE_SETTING_IDS,
    type NavRainbowSettings,
    type NotebookNavigatorSettings,
    type SettingSyncMode
} from './types';
import { sanitizeRecord } from '../utils/recordUtils';
import {
    DEFAULT_CALENDAR_CUSTOM_FILE_PATTERN,
    DEFAULT_CALENDAR_CUSTOM_MONTH_PATTERN,
    DEFAULT_CALENDAR_CUSTOM_QUARTER_PATTERN,
    DEFAULT_CALENDAR_CUSTOM_WEEK_PATTERN,
    DEFAULT_CALENDAR_CUSTOM_YEAR_PATTERN
} from '../utils/calendarCustomNotePatterns';
import { DEFAULT_FILE_TYPE_ICON_PRESET } from '../utils/fileTypeIconPresets';

const defaultSettingsSync = sanitizeRecord<SettingSyncMode>(undefined);
SYNC_MODE_SETTING_IDS.forEach(settingId => {
    defaultSettingsSync[settingId] = 'synced';
});

const NAV_RAINBOW_FIRST_COLOR_DEFAULT = '#ef4444';
const NAV_RAINBOW_LAST_COLOR_DEFAULT = '#8b5cf6';
const NAV_RAINBOW_DARK_FIRST_COLOR_DEFAULT = '#fb7185';
const NAV_RAINBOW_DARK_LAST_COLOR_DEFAULT = '#c084fc';
const UNFINISHED_TASK_BACKGROUND_COLOR_DEFAULT = '#ef000050';

export const NAV_RAINBOW_DEFAULTS: NavRainbowSettings = {
    mode: 'none',
    balanceHueLuminance: true,
    separateThemeColors: false,

    shortcuts: {
        enabled: false,
        firstColor: NAV_RAINBOW_FIRST_COLOR_DEFAULT,
        lastColor: NAV_RAINBOW_LAST_COLOR_DEFAULT,
        darkFirstColor: NAV_RAINBOW_FIRST_COLOR_DEFAULT,
        darkLastColor: NAV_RAINBOW_LAST_COLOR_DEFAULT,
        transitionStyle: 'rgb'
    },

    recent: {
        enabled: false,
        firstColor: NAV_RAINBOW_FIRST_COLOR_DEFAULT,
        lastColor: NAV_RAINBOW_LAST_COLOR_DEFAULT,
        darkFirstColor: NAV_RAINBOW_FIRST_COLOR_DEFAULT,
        darkLastColor: NAV_RAINBOW_LAST_COLOR_DEFAULT,
        transitionStyle: 'rgb'
    },

    folders: {
        enabled: true,
        firstColor: NAV_RAINBOW_FIRST_COLOR_DEFAULT,
        lastColor: NAV_RAINBOW_LAST_COLOR_DEFAULT,
        darkFirstColor: NAV_RAINBOW_DARK_FIRST_COLOR_DEFAULT,
        darkLastColor: NAV_RAINBOW_DARK_LAST_COLOR_DEFAULT,
        transitionStyle: 'hue',
        scope: 'root'
    },

    tags: {
        enabled: false,
        firstColor: NAV_RAINBOW_FIRST_COLOR_DEFAULT,
        lastColor: NAV_RAINBOW_LAST_COLOR_DEFAULT,
        darkFirstColor: NAV_RAINBOW_DARK_FIRST_COLOR_DEFAULT,
        darkLastColor: NAV_RAINBOW_DARK_LAST_COLOR_DEFAULT,
        transitionStyle: 'hue',
        scope: 'root'
    },

    properties: {
        enabled: false,
        firstColor: NAV_RAINBOW_FIRST_COLOR_DEFAULT,
        lastColor: NAV_RAINBOW_LAST_COLOR_DEFAULT,
        darkFirstColor: NAV_RAINBOW_DARK_FIRST_COLOR_DEFAULT,
        darkLastColor: NAV_RAINBOW_DARK_LAST_COLOR_DEFAULT,
        transitionStyle: 'hue',
        scope: 'root'
    }
};

function createDefaultNavRainbowSettings(): NavRainbowSettings {
    return {
        mode: NAV_RAINBOW_DEFAULTS.mode,
        balanceHueLuminance: NAV_RAINBOW_DEFAULTS.balanceHueLuminance,
        separateThemeColors: NAV_RAINBOW_DEFAULTS.separateThemeColors,
        shortcuts: { ...NAV_RAINBOW_DEFAULTS.shortcuts },
        recent: { ...NAV_RAINBOW_DEFAULTS.recent },
        folders: { ...NAV_RAINBOW_DEFAULTS.folders },
        tags: { ...NAV_RAINBOW_DEFAULTS.tags },
        properties: { ...NAV_RAINBOW_DEFAULTS.properties }
    };
}

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
            descendantExcludedFolders: [],
            hiddenTags: [],
            hiddenFileNames: [],
            hiddenFileTags: [],
            hiddenFileProperties: [],
            navigationBanner: null,
            periodicNotesFolder: '',
            shortcuts: [],
            navRainbow: createDefaultNavRainbowSettings()
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
    autoRevealIgnoreOtherWindows: true,
    paneTransitionDuration: 150,

    // General tab - Keyboard navigation
    multiSelectModifier: 'cmdCtrl',
    enterToOpenFiles: false,
    shiftEnterOpenContext: 'tab',
    cmdCtrlEnterOpenContext: 'split',

    // General tab - Mouse buttons
    mouseBackForwardAction: 'history',

    // General tab - View
    startView: 'files',
    showInfoButtons: true,

    // General tab - Homepage
    homepage: {
        source: 'none',
        file: null,
        createMissingPeriodicNote: true
    },

    // General tab - Desktop appearance
    dualPane: true,
    dualPaneOrientation: 'horizontal',
    narrowSidebarLayout: 'singlePane',
    narrowSidebarTriggerMode: 'fitPanes',
    narrowSidebarCustomWidth: NARROW_SIDEBAR_CUSTOM_WIDTH_DEFAULT,
    showTooltips: false,
    showTooltipPath: true,
    showTooltipWordCount: false,
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
            reveal: false,
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
    externalIconProviders: sanitizeRecord<boolean>(undefined),

    // Advanced tab
    checkForUpdatesOnStart: true,

    // Navigation pane tab - Appearance
    pinNavigationBanner: true,
    showNoteCount: true,
    separateNoteCounts: true,
    showIndentGuides: false,
    navCountLeaderStyle: 'none',
    rootLevelSpacing: 0,
    navIndent: NAVPANE_MEASUREMENTS.defaultIndent,
    navItemHeight: NAVPANE_MEASUREMENTS.defaultItemHeight,
    navItemHeightScaleText: true,

    // Navigation pane tab - Behavior
    collapseBehavior: 'all',
    smartCollapse: true,
    excludeVaultRootFromCollapse: false,
    collapseOtherBranchesOnExpand: false,
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
    inheritFolderColors: true,
    folderSortOrder: 'alpha-asc',
    enableFolderNotes: false,
    folderNoteType: 'markdown',
    folderNoteName: '',
    folderNoteNamePattern: '',
    folderNoteTemplate: null,
    enableFolderNoteLinks: true,
    hideFolderNoteInList: true,
    pinCreatedFolderNote: false,
    folderNoteOpenLocation: 'current-tab',
    showNearestFolderNoteInSidebar: true,

    // Tags tab
    showTags: true,
    showTagIcons: true,
    showAllTagsFolder: true,
    showUntagged: true,
    scopeTagsToCurrentContext: false,
    tagSortOrder: 'alpha-asc',
    inheritTagColors: true,
    keepEmptyTagsProperty: false,

    // Properties tab
    showProperties: true,
    showPropertyIcons: true,
    inheritPropertyColors: true,
    propertySortOrder: 'alpha-asc',
    showAllPropertiesFolder: true,
    scopePropertiesToCurrentContext: false,

    // List pane tab
    defaultListMode: 'standard',
    includeDescendantNotes: false,
    defaultFolderSort: 'modified-desc',
    propertySortKey: '',
    propertySortSecondary: 'title',
    manualSortPropertyKey: 'sort_index',
    manualSortGroupHeaderProperty: 'group_header',
    manualSortNewNotePlacement: 'below-selected-note',
    confirmBeforeManualSort: true,
    revealFileOnListChanges: true,
    listPaneTitle: 'header',
    noteGrouping: 'date',
    showSelectedNavigationPills: false,
    stickyGroupHeaders: true,
    showFolderGroupPaths: true,
    showGroupHeaderItemCounts: false,
    showCurrentFolderFilesAtBottom: false,
    filterPinnedByFolder: false,
    compactItemHeight: LISTPANE_MEASUREMENTS.defaultCompactItemHeight,
    compactItemHeightScaleText: true,
    showQuickActions: true,
    quickActionRevealInFolder: false,
    quickActionAddTag: true,
    quickActionAddToShortcuts: true,
    quickActionPinNote: true,
    quickActionOpenInNewTab: false,
    hideDrawingPreviewImages: true,

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
    showFileIconUnfinishedTask: false,
    showFileBackgroundUnfinishedTask: false,
    unfinishedTaskBackgroundColor: UNFINISHED_TASK_BACKGROUND_COLOR_DEFAULT,
    showFileIcons: true,
    useFolderIconForFiles: false,
    showFilenameMatchIcons: false,
    fileNameIconMap: sanitizeRecord<string>(undefined),
    showCategoryIcons: false,
    fileTypeIconMap: sanitizeRecord<string>(undefined),
    fileTypeIconPreset: DEFAULT_FILE_TYPE_ICON_PRESET,
    fileNameRows: 1,
    useFolderColorForTitles: false,
    showFilePreview: true,
    skipHeadingsInPreview: true,
    skipCodeBlocksInPreview: true,
    stripHtmlInPreview: true,
    stripLatexInPreview: true,
    previewRows: 2,
    previewProperties: [],
    previewPropertiesFallback: true,
    showFeatureImage: true,
    featureImageProperties: [],
    featureImageExcludeProperties: [],
    featureImageSize: '64',
    featureImagePixelSize: '256',
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
    showFilePropertiesInCompactMode: false,
    showPropertiesOnSeparateRows: false,
    enablePropertyInternalLinks: true,
    enablePropertyExternalLinks: true,
    textCountDisplay: 'none',
    textCountPlacement: 'title',
    characterCountSpaces: 'include',
    wordCountTargetProperty: 'word-goal',
    showWordCountPercentage: false,
    showFileDate: true,
    // Default to showing modified date when sorting alphabetically
    alphabeticalDateMode: 'modified',
    showParentFolder: true,
    showParentFolderFullPath: false,
    parentFolderClickRevealsFile: false,
    showParentFolderColor: false,
    showParentFolderIcon: false,

    // Calendar tab - Calendar
    calendarEnabled: true,
    calendarPlacement: 'left-sidebar',
    calendarConfirmBeforeCreate: true,
    calendarShowHiddenItems: false,
    calendarLocale: 'system-default',
    calendarWeekendDays: 'sat-sun',
    calendarMonthHeadingFormat: 'full',
    calendarHighlightToday: true,
    calendarShowFeatureImage: true,
    calendarShowTasks: true,
    calendarMonthHighlights: sanitizeRecord<string>(undefined),
    calendarShowWeekNumber: false,
    calendarShowQuarter: false,
    calendarShowYearCalendar: true,
    calendarLeftPlacement: 'navigation',
    calendarWeeksToShow: 1,

    // Calendar tab - Calendar integration
    calendarIntegrationMode: 'notebook-navigator',
    calendarPeriodicNotesLocaleSource: 'calendar',
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
    pinnedNotes: sanitizeRecord<PinnedNotes[string]>(undefined),
    collapsedPinnedContexts: sanitizeRecord<boolean>(undefined),
    fileIcons: sanitizeRecord<string>(undefined),
    fileColors: sanitizeRecord<string>(undefined),
    fileBackgroundColors: sanitizeRecord<string>(undefined),
    folderIcons: sanitizeRecord<string>(undefined),
    folderColors: sanitizeRecord<string>(undefined),
    folderBackgroundColors: sanitizeRecord<string>(undefined),
    folderSortOverrides: sanitizeRecord<NotebookNavigatorSettings['folderSortOverrides'][string]>(undefined),
    folderTreeSortOverrides: sanitizeRecord<NotebookNavigatorSettings['folderTreeSortOverrides'][string]>(undefined),
    folderAppearances: sanitizeRecord<FolderAppearance>(undefined),
    tagIcons: sanitizeRecord<string>(undefined),
    tagColors: sanitizeRecord<string>(undefined),
    tagBackgroundColors: sanitizeRecord<string>(undefined),
    tagSortOverrides: sanitizeRecord<NotebookNavigatorSettings['tagSortOverrides'][string]>(undefined),
    tagTreeSortOverrides: sanitizeRecord<NotebookNavigatorSettings['tagTreeSortOverrides'][string]>(undefined),
    tagAppearances: sanitizeRecord<TagAppearance>(undefined),
    propertyIcons: sanitizeRecord<string>(undefined),
    propertyColors: sanitizeRecord<string>(undefined),
    propertyBackgroundColors: sanitizeRecord<string>(undefined),
    propertySortOverrides: sanitizeRecord<NotebookNavigatorSettings['propertySortOverrides'][string]>(undefined),
    propertyTreeSortOverrides: sanitizeRecord<NotebookNavigatorSettings['propertyTreeSortOverrides'][string]>(undefined),
    propertyAppearances: sanitizeRecord<FolderAppearance>(undefined),
    virtualFolderColors: sanitizeRecord<string>(undefined),
    virtualFolderBackgroundColors: sanitizeRecord<string>(undefined),
    navigationSeparators: sanitizeRecord<boolean>(undefined),
    userColors: [...DEFAULT_CUSTOM_COLORS],
    lastShownVersion: '',
    rootFolderOrder: [],
    rootTagOrder: [],
    rootPropertyOrder: []
};
