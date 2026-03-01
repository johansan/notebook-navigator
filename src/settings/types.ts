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

import type { FileVisibility } from '../utils/fileTypeUtils';
import type { FolderAppearance, TagAppearance } from '../hooks/useListPaneAppearance';
import type { BackgroundMode, DualPaneOrientation, NavigationPaneSide, PinnedNotes } from '../types';
import type { FolderNoteCreationPreference } from '../types/folderNote';
import type { KeyboardShortcutConfig } from '../utils/keyboardShortcuts';
import type { ShortcutEntry } from '../types/shortcuts';
import type { SearchProvider } from '../types/search';

export type SettingSyncMode = 'local' | 'synced';

export function isSettingSyncMode(value: unknown): value is SettingSyncMode {
    return value === 'local' || value === 'synced';
}

export type DeleteAttachmentsSetting = 'ask' | 'always' | 'never';

export function isDeleteAttachmentsSetting(value: unknown): value is DeleteAttachmentsSetting {
    return value === 'ask' || value === 'always' || value === 'never';
}

export function resolveDeleteAttachmentsSetting(value: unknown, fallback: DeleteAttachmentsSetting): DeleteAttachmentsSetting {
    return isDeleteAttachmentsSetting(value) ? value : fallback;
}

export type MoveFileConflictsSetting = 'ask' | 'rename';

export function isMoveFileConflictsSetting(value: unknown): value is MoveFileConflictsSetting {
    return value === 'ask' || value === 'rename';
}

export function resolveMoveFileConflictsSetting(value: unknown, fallback: MoveFileConflictsSetting): MoveFileConflictsSetting {
    return isMoveFileConflictsSetting(value) ? value : fallback;
}

/** Identifiers for settings that can be switched between synced and local storage. */
export const SYNC_MODE_SETTING_IDS = [
    'vaultProfile',
    'folderSortOrder',
    'tagSortOrder',
    'propertySortOrder',
    'includeDescendantNotes',
    'useFloatingToolbars',
    'dualPane',
    'dualPaneOrientation',
    'navigationPaneSide',
    'paneTransitionDuration',
    'toolbarVisibility',
    'pinNavigationBanner',
    'navIndent',
    'navItemHeight',
    'navItemHeightScaleText',
    'calendarPlacement',
    'calendarLeftPlacement',
    'calendarWeeksToShow',
    'compactItemHeight',
    'compactItemHeightScaleText',
    'uiScale'
] as const;

export type SyncModeSettingId = (typeof SYNC_MODE_SETTING_IDS)[number];

/** Available sort options for file listing */
export type SortOption =
    | 'modified-desc'
    | 'modified-asc'
    | 'created-desc'
    | 'created-asc'
    | 'title-asc'
    | 'title-desc'
    | 'filename-asc'
    | 'filename-desc'
    | 'property-asc'
    | 'property-desc';

/** Ordered list of sort options for validation and UI choices */
export const SORT_OPTIONS: SortOption[] = [
    'modified-desc',
    'modified-asc',
    'created-desc',
    'created-asc',
    'title-asc',
    'title-desc',
    'filename-asc',
    'filename-desc',
    'property-asc',
    'property-desc'
];

/** Type guard for validating sort option values */
export function isSortOption(value: unknown): value is SortOption {
    return typeof value === 'string' && SORT_OPTIONS.includes(value as SortOption);
}

/** Available secondary sort options used when sorting by frontmatter property values. */
export type PropertySortSecondaryOption = 'title' | 'filename' | 'created' | 'modified';

export const PROPERTY_SORT_SECONDARY_OPTIONS: PropertySortSecondaryOption[] = ['title', 'filename', 'created', 'modified'];

export function isPropertySortSecondaryOption(value: unknown): value is PropertySortSecondaryOption {
    return value === 'title' || value === 'filename' || value === 'created' || value === 'modified';
}

/** Alphabetical ordering options used by navigation trees. */
export type AlphaSortOrder = 'alpha-asc' | 'alpha-desc';

export function isAlphaSortOrder(value: unknown): value is AlphaSortOrder {
    return value === 'alpha-asc' || value === 'alpha-desc';
}

/** Available orderings for tags in the navigation pane */
export type TagSortOrder = 'alpha-asc' | 'alpha-desc' | 'frequency-asc' | 'frequency-desc';

/** Type guard for validating tag sort order values */
export function isTagSortOrder(value: string): value is TagSortOrder {
    return value === 'alpha-asc' || value === 'alpha-desc' || value === 'frequency-asc' || value === 'frequency-desc';
}

/** Scope of items that button actions affect */
export type ItemScope = 'all' | 'folders-only' | 'tags-only';

/** Modifier key used for multi-select operations */
export type MultiSelectModifier = 'cmdCtrl' | 'optionAlt';

/** Workspace context used when opening a file in a new leaf. */
export type FileOpenContext = 'tab' | 'split' | 'window';

/** Display options for vault title */
export type VaultTitleOption = 'header' | 'navigation';

/** Display options for list pane title */
export type ListPaneTitleOption = 'header' | 'list' | 'hidden';

/** Display options for shortcut row badges in the navigation pane */
export type ShortcutBadgeDisplayMode = 'index' | 'count' | 'none';

/** Filter options for hidden items in the recent notes section */
export type RecentNotesHideMode = 'none' | 'folder-notes';

export function isRecentNotesHideMode(value: unknown): value is RecentNotesHideMode {
    return value === 'none' || value === 'folder-notes';
}

/** Number of calendar week rows shown in the navigation pane */
export type CalendarWeeksToShow = 1 | 2 | 3 | 4 | 5 | 6;

/** Where the calendar is shown in the navigator UI. */
export type CalendarPlacement = 'left-sidebar' | 'right-sidebar';

export function isCalendarPlacement(value: unknown): value is CalendarPlacement {
    return value === 'left-sidebar' || value === 'right-sidebar';
}

/** Where the left-sidebar calendar is shown in single-pane mode. */
export type CalendarLeftPlacement = 'navigation' | 'below';

export function isCalendarLeftPlacement(value: unknown): value is CalendarLeftPlacement {
    return value === 'navigation' || value === 'below';
}

/** Which days are highlighted as weekend days in the calendar UI. */
export type CalendarWeekendDays = 'none' | 'sat-sun' | 'fri-sat' | 'thu-fri';

export function isCalendarWeekendDays(value: unknown): value is CalendarWeekendDays {
    return value === 'none' || value === 'sat-sun' || value === 'fri-sat' || value === 'thu-fri';
}

/** Source used for calendar notes in the navigation pane */
export type CalendarIntegrationMode = 'daily-notes' | 'notebook-navigator';

/** Default display modes for list items */
export type ListDisplayMode = 'standard' | 'compact';

/** Grouping options for list pane notes */
export type ListNoteGroupingOption = 'none' | 'date' | 'folder';

/** Date source to display when alphabetical sorting is active */
export type AlphabeticalDateMode = 'created' | 'modified';

/** Available note property types displayed in file items */
export type NotePropertyType = 'none' | 'wordCount';

/** Type guard for validating note property type values */
export function isNotePropertyType(value: string): value is NotePropertyType {
    return value === 'none' || value === 'wordCount';
}

/** Buttons available in the navigation toolbar */
export type NavigationToolbarButtonId = 'toggleDualPane' | 'expandCollapse' | 'calendar' | 'hiddenItems' | 'rootReorder' | 'newFolder';

/** Buttons available in the list toolbar */
export type ListToolbarButtonId = 'back' | 'search' | 'descendants' | 'sort' | 'appearance' | 'newNote';

/** Visibility toggles for toolbar buttons */
export interface ToolbarVisibilitySettings {
    navigation: Record<NavigationToolbarButtonId, boolean>;
    list: Record<ListToolbarButtonId, boolean>;
}

/** Per-property visibility configuration stored in a vault profile. */
export interface VaultProfilePropertyKey {
    key: string;
    showInNavigation: boolean;
    showInList: boolean;
    showInFileMenu: boolean;
}

/** Vault profile storing per-profile filtering and layout preferences */
export interface VaultProfile {
    id: string;
    name: string;
    fileVisibility: FileVisibility;
    propertyKeys: VaultProfilePropertyKey[];
    hiddenFolders: string[];
    hiddenTags: string[];
    hiddenFileNames: string[];
    hiddenFileTags: string[];
    hiddenFileProperties: string[];
    navigationBanner: string | null;
    periodicNotesFolder: string;
    shortcuts: ShortcutEntry[];
}

/**
 * Plugin settings interface defining all configurable options
 * Settings are organized by tab for easier maintenance
 */
export interface NotebookNavigatorSettings {
    vaultProfiles: VaultProfile[];
    vaultProfile: string;
    vaultTitle: VaultTitleOption;
    syncModes: Record<SyncModeSettingId, SettingSyncMode>;

    // General tab - Behavior
    createNewNotesInNewTab: boolean;
    autoRevealActiveFile: boolean;
    autoRevealShortestPath: boolean;
    autoRevealIgnoreRightSidebar: boolean;
    paneTransitionDuration: number;

    // General tab - Keyboard navigation
    multiSelectModifier: MultiSelectModifier;
    enterToOpenFiles: boolean;
    shiftEnterOpenContext: FileOpenContext;
    cmdCtrlEnterOpenContext: FileOpenContext;

    // General tab - View
    startView: 'navigation' | 'files';
    showInfoButtons: boolean;

    // General tab - Homepage
    homepage: string | null;
    mobileHomepage: string | null;
    useMobileHomepage: boolean;

    // General tab - Desktop appearance
    dualPane: boolean;
    dualPaneOrientation: DualPaneOrientation;
    navigationPaneSide: NavigationPaneSide;
    showTooltips: boolean;
    showTooltipPath: boolean;
    desktopBackground: BackgroundMode;
    desktopScale: number;
    mobileScale: number;

    // General tab - Mobile appearance
    useFloatingToolbars: boolean;

    // General tab - Toolbar buttons
    toolbarVisibility: ToolbarVisibilitySettings;

    // General tab - Icons
    interfaceIcons: Record<string, string>;
    colorIconOnly: boolean;

    // General tab - Formatting
    dateFormat: string;
    timeFormat: string;
    calendarTemplateFolder: string;

    // Files tab
    confirmBeforeDelete: boolean;
    deleteAttachments: DeleteAttachmentsSetting;
    moveFileConflicts: MoveFileConflictsSetting;

    // Icon packs tab
    externalIconProviders: Record<string, boolean>;

    // Advanced tab
    checkForUpdatesOnStart: boolean;

    // Navigation pane tab - Appearance
    pinNavigationBanner: boolean;
    showNoteCount: boolean;
    separateNoteCounts: boolean;
    showIndentGuides: boolean;
    rootLevelSpacing: number;
    navIndent: number;
    navItemHeight: number;
    navItemHeightScaleText: boolean;

    // Navigation pane tab - Behavior
    collapseBehavior: ItemScope;
    smartCollapse: boolean;
    autoSelectFirstFileOnFocusChange: boolean;
    autoExpandNavItems: boolean;
    springLoadedFolders: boolean;
    springLoadedFoldersInitialDelay: number;
    springLoadedFoldersSubsequentDelay: number;

    // Shortcuts tab
    showSectionIcons: boolean;
    showShortcuts: boolean;
    shortcutBadgeDisplay: ShortcutBadgeDisplayMode;
    skipAutoScroll: boolean;
    showRecentNotes: boolean;
    hideRecentNotes: RecentNotesHideMode;
    pinRecentNotesWithShortcuts: boolean;
    recentNotesCount: number;

    // Folders tab
    showFolderIcons: boolean;
    showRootFolder: boolean;
    inheritFolderColors: boolean;
    folderSortOrder: AlphaSortOrder;
    enableFolderNotes: boolean;
    folderNoteType: FolderNoteCreationPreference;
    folderNoteName: string;
    folderNoteNamePattern: string;
    folderNoteTemplate: string | null;
    enableFolderNoteLinks: boolean;
    hideFolderNoteInList: boolean;
    pinCreatedFolderNote: boolean;
    openFolderNotesInNewTab: boolean;

    // Tags tab
    showTags: boolean;
    showTagIcons: boolean;
    showAllTagsFolder: boolean;
    showUntagged: boolean;
    tagSortOrder: TagSortOrder;
    inheritTagColors: boolean;
    keepEmptyTagsProperty: boolean;

    // Properties tab
    showProperties: boolean;
    showPropertyIcons: boolean;
    inheritPropertyColors: boolean;
    propertySortOrder: TagSortOrder;
    showAllPropertiesFolder: boolean;

    // List pane tab
    defaultListMode: ListDisplayMode;
    includeDescendantNotes: boolean;
    defaultFolderSort: SortOption;
    propertySortKey: string;
    propertySortSecondary: PropertySortSecondaryOption;
    revealFileOnListChanges: boolean;
    listPaneTitle: ListPaneTitleOption;
    noteGrouping: ListNoteGroupingOption;
    filterPinnedByFolder: boolean;
    showPinnedGroupHeader: boolean;
    showPinnedIcon: boolean;
    optimizeNoteHeight: boolean;
    compactItemHeight: number;
    compactItemHeightScaleText: boolean;
    showQuickActions: boolean;
    quickActionRevealInFolder: boolean;
    quickActionAddTag: boolean;
    quickActionAddToShortcuts: boolean;
    quickActionPinNote: boolean;
    quickActionOpenInNewTab: boolean;

    // Frontmatter tab
    useFrontmatterMetadata: boolean;
    frontmatterIconField: string;
    frontmatterColorField: string;
    frontmatterBackgroundField: string;
    frontmatterNameField: string;
    frontmatterCreatedField: string;
    frontmatterModifiedField: string;
    frontmatterDateFormat: string;

    // Notes tab
    showFileIcons: boolean;
    showFileIconUnfinishedTask: boolean;
    showFilenameMatchIcons: boolean;
    fileNameIconMap: Record<string, string>;
    showCategoryIcons: boolean;
    fileTypeIconMap: Record<string, string>;
    fileNameRows: number;
    showFilePreview: boolean;
    skipHeadingsInPreview: boolean;
    skipCodeBlocksInPreview: boolean;
    stripHtmlInPreview: boolean;
    stripLatexInPreview: boolean;
    previewRows: number;
    previewProperties: string[];
    showFeatureImage: boolean;
    featureImageProperties: string[];
    featureImageExcludeProperties: string[];
    forceSquareFeatureImage: boolean;
    downloadExternalFeatureImages: boolean;
    showFileTags: boolean;
    colorFileTags: boolean;
    prioritizeColoredFileTags: boolean;
    showFileTagAncestors: boolean;
    showFileTagsInCompactMode: boolean;
    showFileProperties: boolean;
    colorFileProperties: boolean;
    prioritizeColoredFileProperties: boolean;
    notePropertyType: NotePropertyType;
    showFilePropertiesInCompactMode: boolean;
    showPropertiesOnSeparateRows: boolean;
    showFileDate: boolean;
    alphabeticalDateMode: AlphabeticalDateMode;
    showParentFolder: boolean;
    parentFolderClickRevealsFile: boolean;
    showParentFolderColor: boolean;
    showParentFolderIcon: boolean;

    // Calendar tab - Calendar
    calendarPlacement: CalendarPlacement;
    calendarConfirmBeforeCreate: boolean;
    calendarLocale: string;
    calendarWeekendDays: CalendarWeekendDays;
    calendarHighlightToday: boolean;
    calendarShowFeatureImage: boolean;
    calendarShowWeekNumber: boolean;
    calendarShowQuarter: boolean;
    calendarShowYearCalendar: boolean;
    calendarLeftPlacement: CalendarLeftPlacement;
    calendarWeeksToShow: CalendarWeeksToShow;

    // Calendar tab - Calendar integration
    calendarIntegrationMode: CalendarIntegrationMode;
    calendarCustomFilePattern: string;
    calendarCustomWeekPattern: string;
    calendarCustomMonthPattern: string;
    calendarCustomQuarterPattern: string;
    calendarCustomYearPattern: string;
    calendarCustomFileTemplate: string | null;
    calendarCustomWeekTemplate: string | null;
    calendarCustomMonthTemplate: string | null;
    calendarCustomQuarterTemplate: string | null;
    calendarCustomYearTemplate: string | null;

    // Search settings and hotkeys
    searchProvider: SearchProvider | null;
    keyboardShortcuts: KeyboardShortcutConfig;

    // Runtime state and cached data
    customVaultName: string;
    pinnedNotes: PinnedNotes;
    fileIcons: Record<string, string>;
    fileColors: Record<string, string>;
    folderIcons: Record<string, string>;
    folderColors: Record<string, string>;
    folderBackgroundColors: Record<string, string>;
    folderSortOverrides: Record<string, SortOption>;
    folderTreeSortOverrides: Record<string, AlphaSortOrder>;
    folderAppearances: Record<string, FolderAppearance>;
    tagIcons: Record<string, string>;
    tagColors: Record<string, string>;
    tagBackgroundColors: Record<string, string>;
    tagSortOverrides: Record<string, SortOption>;
    tagTreeSortOverrides: Record<string, AlphaSortOrder>;
    tagAppearances: Record<string, TagAppearance>;
    propertyIcons: Record<string, string>;
    propertyColors: Record<string, string>;
    propertyBackgroundColors: Record<string, string>;
    propertyTreeSortOverrides: Record<string, AlphaSortOrder>;
    navigationSeparators: Record<string, boolean>;
    userColors: string[];
    lastShownVersion: string;
    rootFolderOrder: string[];
    rootTagOrder: string[];
    rootPropertyOrder: string[];
}
