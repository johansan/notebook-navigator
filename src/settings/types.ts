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
import type { BackgroundMode, CollapsedPinnedContexts, DualPaneOrientation, PinnedNotes } from '../types';
import type { FolderNoteCreationPreference } from '../types/folderNote';
import type { KeyboardShortcutConfig } from '../utils/keyboardShortcuts';
import type { ShortcutEntry } from '../types/shortcuts';
import type { SearchProvider } from '../types/search';
import type { FileTypeIconPreset } from '../utils/fileTypeIconPresets';

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

const FEATURE_IMAGE_DISPLAY_SIZE_OPTIONS = ['64', '96', '128'] as const;

const FEATURE_IMAGE_PIXEL_SIZE_OPTIONS = ['256', '384', '512'] as const;

export type FeatureImageSizeSetting = (typeof FEATURE_IMAGE_DISPLAY_SIZE_OPTIONS)[number];

export type FeatureImagePixelSizeSetting = (typeof FEATURE_IMAGE_PIXEL_SIZE_OPTIONS)[number];

export function isFeatureImageSizeSetting(value: unknown): value is FeatureImageSizeSetting {
    return typeof value === 'string' && FEATURE_IMAGE_DISPLAY_SIZE_OPTIONS.includes(value as FeatureImageSizeSetting);
}

export function isFeatureImagePixelSizeSetting(value: unknown): value is FeatureImagePixelSizeSetting {
    return typeof value === 'string' && FEATURE_IMAGE_PIXEL_SIZE_OPTIONS.includes(value as FeatureImagePixelSizeSetting);
}

const PERIODIC_HOMEPAGE_SOURCES = ['daily-note', 'weekly-note', 'monthly-note', 'quarterly-note', 'yearly-note'] as const;
const HOMEPAGE_SOURCES = ['none', 'file', ...PERIODIC_HOMEPAGE_SOURCES] as const;

export type HomepageSource = (typeof HOMEPAGE_SOURCES)[number];
export type PeriodicHomepageSource = (typeof PERIODIC_HOMEPAGE_SOURCES)[number];

export function isHomepageSource(value: unknown): value is HomepageSource {
    return typeof value === 'string' && HOMEPAGE_SOURCES.includes(value as HomepageSource);
}

export function isPeriodicHomepageSource(value: unknown): value is PeriodicHomepageSource {
    return typeof value === 'string' && PERIODIC_HOMEPAGE_SOURCES.includes(value as PeriodicHomepageSource);
}

export interface HomepageSetting {
    source: HomepageSource;
    file: string | null;
    createMissingPeriodicNote: boolean;
}

/** Identifiers for settings that can be switched between synced and local storage. */
export const SYNC_MODE_SETTING_IDS = [
    'vaultProfile',
    'homepage',
    'folderSortOrder',
    'tagSortOrder',
    'propertySortOrder',
    'includeDescendantNotes',
    'useFloatingToolbars',
    'dualPane',
    'dualPaneOrientation',
    'narrowSidebarLayout',
    'narrowSidebarTriggerMode',
    'narrowSidebarCustomWidth',
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
    'featureImageSize',
    'featureImagePixelSize',
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

export interface ListSortOverride {
    option: SortOption;
    propertyKey?: string;
}

export type ListSortOverrideValue = SortOption | ListSortOverride;

function isPropertySortOptionValue(value: SortOption): boolean {
    return value === 'property-asc' || value === 'property-desc';
}

export function normalizeListSortOverride(value: unknown): ListSortOverrideValue | undefined {
    if (isSortOption(value)) {
        return value;
    }

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return undefined;
    }

    const record = value as Record<string, unknown>;
    if (!isSortOption(record.option)) {
        return undefined;
    }

    const option = record.option;
    if (!isPropertySortOptionValue(option)) {
        return option;
    }

    if (typeof record.propertyKey !== 'string') {
        return option;
    }

    const propertyKey = record.propertyKey.trim();
    if (propertyKey.length === 0) {
        return option;
    }

    return { option, propertyKey };
}

/** Available secondary sort options used when sorting by frontmatter property values. */
export type PropertySortSecondaryOption = 'title' | 'filename' | 'created' | 'modified';

export const PROPERTY_SORT_SECONDARY_OPTIONS: PropertySortSecondaryOption[] = ['title', 'filename', 'created', 'modified'];

export function isPropertySortSecondaryOption(value: unknown): value is PropertySortSecondaryOption {
    return value === 'title' || value === 'filename' || value === 'created' || value === 'modified';
}

export type ManualSortNewNotePlacement = 'top' | 'bottom' | 'below-selected-note' | 'unsorted';

export const MANUAL_SORT_NEW_NOTE_PLACEMENT_OPTIONS: ManualSortNewNotePlacement[] = ['top', 'bottom', 'below-selected-note', 'unsorted'];

export function isManualSortNewNotePlacement(value: unknown): value is ManualSortNewNotePlacement {
    return value === 'top' || value === 'bottom' || value === 'below-selected-note' || value === 'unsorted';
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
export type ItemScope = 'all' | 'folders-only' | 'tags-only' | 'properties-only';

export function isItemScope(value: unknown): value is ItemScope {
    return value === 'all' || value === 'folders-only' || value === 'tags-only' || value === 'properties-only';
}

export type NavRainbowColorMode = 'none' | 'foreground' | 'background';

export function isNavRainbowColorMode(value: unknown): value is NavRainbowColorMode {
    return value === 'none' || value === 'foreground' || value === 'background';
}

export type NavRainbowScope = 'root' | 'child' | 'all';

export function isNavRainbowScope(value: unknown): value is NavRainbowScope {
    return value === 'root' || value === 'child' || value === 'all';
}

export type NavRainbowTransitionStyle = 'hue' | 'rgb';

export function isNavRainbowTransitionStyle(value: unknown): value is NavRainbowTransitionStyle {
    return value === 'hue' || value === 'rgb';
}

export interface NavRainbowSectionSettings {
    enabled: boolean;
    firstColor: string;
    lastColor: string;
    darkFirstColor: string;
    darkLastColor: string;
    transitionStyle: NavRainbowTransitionStyle;
}

export interface NavRainbowSettings {
    mode: NavRainbowColorMode;
    balanceHueLuminance: boolean;
    separateThemeColors: boolean;
    shortcuts: NavRainbowSectionSettings;
    recent: NavRainbowSectionSettings;
    folders: NavRainbowSectionSettings & { scope: NavRainbowScope };
    tags: NavRainbowSectionSettings & { scope: NavRainbowScope };
    properties: NavRainbowSectionSettings & { scope: NavRainbowScope };
}

/** Modifier key used for multi-select operations */
export type MultiSelectModifier = 'cmdCtrl' | 'optionAlt';

export function isMultiSelectModifier(value: unknown): value is MultiSelectModifier {
    return value === 'cmdCtrl' || value === 'optionAlt';
}

/** Workspace context used when opening a file in a new leaf. */
export type FileOpenContext = 'tab' | 'split' | 'window';

function isFileOpenContext(value: unknown): value is FileOpenContext {
    return value === 'tab' || value === 'split' || value === 'window';
}

/** Action used by Enter modifier key settings in the file list. */
export type EnterKeyAction = FileOpenContext | 'rename';

export function isEnterKeyAction(value: unknown): value is EnterKeyAction {
    return isFileOpenContext(value) || value === 'rename';
}

/** Action triggered by mouse back and forward buttons. */
export type MouseBackForwardAction = 'none' | 'singlePaneSwitch' | 'history';

export function isMouseBackForwardAction(value: unknown): value is MouseBackForwardAction {
    return value === 'none' || value === 'singlePaneSwitch' || value === 'history';
}

export const NARROW_SIDEBAR_CUSTOM_WIDTH_MIN = 240;
export const NARROW_SIDEBAR_CUSTOM_WIDTH_MAX = 900;
export const NARROW_SIDEBAR_CUSTOM_WIDTH_STEP = 10;
export const NARROW_SIDEBAR_CUSTOM_WIDTH_DEFAULT = 350;

/** Layout used when horizontal dual pane does not fit in the sidebar. */
export type NarrowSidebarLayout = 'none' | 'singlePane' | 'vertical';

function isNarrowSidebarLayout(value: unknown): value is NarrowSidebarLayout {
    return value === 'none' || value === 'singlePane' || value === 'vertical';
}

export function normalizeNarrowSidebarLayout(value: unknown): NarrowSidebarLayout | null {
    if (value === 'dualPane') {
        return 'vertical';
    }

    return isNarrowSidebarLayout(value) ? value : null;
}

/** How the narrow sidebar switch threshold is calculated. */
export type NarrowSidebarTriggerMode = 'fitPanes' | 'customWidth';

export function isNarrowSidebarTriggerMode(value: unknown): value is NarrowSidebarTriggerMode {
    return value === 'fitPanes' || value === 'customWidth';
}

/** Display options for vault title */
export type VaultTitleOption = 'header' | 'navigation';

export function isVaultTitleOption(value: unknown): value is VaultTitleOption {
    return value === 'header' || value === 'navigation';
}

/** Display options for list pane title */
export type ListPaneTitleOption = 'header' | 'list' | 'hidden';

export function isListPaneTitleOption(value: unknown): value is ListPaneTitleOption {
    return value === 'header' || value === 'list' || value === 'hidden';
}

/** Display options for shortcut row badges in the navigation pane */
export type ShortcutBadgeDisplayMode = 'index' | 'count' | 'none';

export function isShortcutBadgeDisplayMode(value: unknown): value is ShortcutBadgeDisplayMode {
    return value === 'index' || value === 'count' || value === 'none';
}

/** Leader marks shown between navigation item names and note counts */
export type NavCountLeaderStyle = 'none' | 'dots' | 'dashes' | 'line';

export function isNavCountLeaderStyle(value: unknown): value is NavCountLeaderStyle {
    return value === 'none' || value === 'dots' || value === 'dashes' || value === 'line';
}

/** Filter options for hidden items in the recent notes section */
export type RecentNotesHideMode = 'none' | 'folder-notes';

export function isRecentNotesHideMode(value: unknown): value is RecentNotesHideMode {
    return value === 'none' || value === 'folder-notes';
}

/** Where folder notes open when folder-note links are activated. */
export type FolderNoteOpenLocation = 'current-tab' | 'new-tab' | 'right-sidebar';

export function isFolderNoteOpenLocation(value: unknown): value is FolderNoteOpenLocation {
    return value === 'current-tab' || value === 'new-tab' || value === 'right-sidebar';
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

/** How the calendar month heading is formatted. */
export type CalendarMonthHeadingFormat = 'full' | 'short';

export function isCalendarMonthHeadingFormat(value: unknown): value is CalendarMonthHeadingFormat {
    return value === 'full' || value === 'short';
}

/** Source used for calendar notes in the navigation pane */
export type CalendarIntegrationMode = 'daily-notes' | 'notebook-navigator';

/** Locale source used when Notebook Navigator formats periodic note paths */
export type CalendarPeriodicNotesLocaleSource = 'calendar' | 'obsidian';

export function isCalendarPeriodicNotesLocaleSource(value: unknown): value is CalendarPeriodicNotesLocaleSource {
    return value === 'calendar' || value === 'obsidian';
}

/** Default display modes for list items */
export type ListDisplayMode = 'standard' | 'compact';

export function isListDisplayMode(value: unknown): value is ListDisplayMode {
    return value === 'standard' || value === 'compact';
}

/** Grouping options for list pane notes */
export type ListNoteGroupingOption = 'custom' | 'date' | 'folder';

export function isListNoteGroupingOption(value: unknown): value is ListNoteGroupingOption {
    return value === 'custom' || value === 'date' || value === 'folder';
}

export function normalizeListNoteGroupingOption(value: unknown): ListNoteGroupingOption | null {
    if (value === 'none') {
        return 'custom';
    }

    return isListNoteGroupingOption(value) ? value : null;
}

export interface AppearanceGroupingValue {
    groupBy?: ListNoteGroupingOption;
}

export function normalizeAppearanceGroupBy<T extends AppearanceGroupingValue>(appearance: T): void {
    const appearanceRecord = appearance as unknown as Record<string, unknown>;
    const groupBy = normalizeListNoteGroupingOption(appearanceRecord.groupBy);
    if (groupBy) {
        appearance.groupBy = groupBy;
        return;
    }

    delete appearance.groupBy;
}

/** Date source to display when alphabetical sorting is active */
export type AlphabeticalDateMode = 'created' | 'modified';

/** Placement options for note text counts */
export type TextCountPlacement = 'title' | 'property';

/** Type guard for validating text count placement values */
export function isTextCountPlacement(value: unknown): value is TextCountPlacement {
    return value === 'title' || value === 'property';
}

/** Display modes for note word and character counts */
export type TextCountDisplay = 'none' | 'words' | 'characters' | 'both';

/** Type guard for validating word and character count display modes */
export function isTextCountDisplay(value: unknown): value is TextCountDisplay {
    return value === 'none' || value === 'words' || value === 'characters' || value === 'both';
}

/** Whether spaces are included in note character counts */
export type CharacterCountSpaces = 'include' | 'exclude';

/** Type guard for validating character count space handling */
export function isCharacterCountSpaces(value: unknown): value is CharacterCountSpaces {
    return value === 'include' || value === 'exclude';
}

export function showsWordCount(display: TextCountDisplay): boolean {
    return display === 'words' || display === 'both';
}

export function showsCharacterCount(display: TextCountDisplay): boolean {
    return display === 'characters' || display === 'both';
}

/** Buttons available in the navigation toolbar */
export type NavigationToolbarButtonId = 'toggleDualPane' | 'expandCollapse' | 'calendar' | 'hiddenItems' | 'rootReorder' | 'newFolder';

/** Buttons available in the list toolbar */
export type ListToolbarButtonId = 'back' | 'search' | 'reveal' | 'descendants' | 'sort' | 'appearance' | 'newNote';

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
    descendantExcludedFolders: string[];
    hiddenTags: string[];
    hiddenFileNames: string[];
    hiddenFileTags: string[];
    hiddenFileProperties: string[];
    navigationBanner: string | null;
    periodicNotesFolder: string;
    shortcuts: ShortcutEntry[];
    navRainbow: NavRainbowSettings;
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
    autoRevealIgnoreOtherWindows: boolean;
    paneTransitionDuration: number;

    // General tab - Keyboard navigation
    multiSelectModifier: MultiSelectModifier;
    enterToOpenFiles: boolean;
    shiftEnterOpenContext: EnterKeyAction;
    cmdCtrlEnterOpenContext: EnterKeyAction;

    // General tab - Mouse buttons
    mouseBackForwardAction: MouseBackForwardAction;

    // General tab - View
    startView: 'navigation' | 'files';
    showInfoButtons: boolean;

    // General tab - Homepage
    homepage: HomepageSetting;

    // General tab - Desktop appearance
    dualPane: boolean;
    dualPaneOrientation: DualPaneOrientation;
    narrowSidebarLayout: NarrowSidebarLayout;
    narrowSidebarTriggerMode: NarrowSidebarTriggerMode;
    narrowSidebarCustomWidth: number;
    showTooltips: boolean;
    showTooltipPath: boolean;
    showTooltipWordCount: boolean;
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
    navCountLeaderStyle: NavCountLeaderStyle;
    rootLevelSpacing: number;
    navIndent: number;
    navItemHeight: number;
    navItemHeightScaleText: boolean;

    // Navigation pane tab - Behavior
    collapseBehavior: ItemScope;
    smartCollapse: boolean;
    excludeVaultRootFromCollapse: boolean;
    collapseOtherBranchesOnExpand: boolean;
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
    folderNoteOpenLocation: FolderNoteOpenLocation;
    showNearestFolderNoteInSidebar: boolean;

    // Tags tab
    showTags: boolean;
    showTagIcons: boolean;
    showAllTagsFolder: boolean;
    showUntagged: boolean;
    scopeTagsToCurrentContext: boolean;
    tagSortOrder: TagSortOrder;
    inheritTagColors: boolean;
    keepEmptyTagsProperty: boolean;

    // Properties tab
    showProperties: boolean;
    showPropertyIcons: boolean;
    inheritPropertyColors: boolean;
    propertySortOrder: TagSortOrder;
    showAllPropertiesFolder: boolean;
    scopePropertiesToCurrentContext: boolean;

    // List pane tab
    defaultListMode: ListDisplayMode;
    includeDescendantNotes: boolean;
    defaultFolderSort: SortOption;
    propertySortKey: string;
    propertySortSecondary: PropertySortSecondaryOption;
    manualSortPropertyKey: string;
    manualSortGroupHeaderProperty: string;
    manualSortNewNotePlacement: ManualSortNewNotePlacement;
    confirmBeforeManualSort: boolean;
    revealFileOnListChanges: boolean;
    listPaneTitle: ListPaneTitleOption;
    noteGrouping: ListNoteGroupingOption;
    showSelectedNavigationPills: boolean;
    stickyGroupHeaders: boolean;
    showFolderGroupPaths: boolean;
    showGroupHeaderItemCounts: boolean;
    showCurrentFolderFilesAtBottom: boolean;
    filterPinnedByFolder: boolean;
    compactItemHeight: number;
    compactItemHeightScaleText: boolean;
    showQuickActions: boolean;
    quickActionRevealInFolder: boolean;
    quickActionAddTag: boolean;
    quickActionAddToShortcuts: boolean;
    quickActionPinNote: boolean;
    quickActionOpenInNewTab: boolean;
    hideDrawingPreviewImages: boolean;

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
    showFileIconUnfinishedTask: boolean;
    showFileBackgroundUnfinishedTask: boolean;
    unfinishedTaskBackgroundColor: string;
    showFileIcons: boolean;
    useFolderIconForFiles: boolean;
    showFilenameMatchIcons: boolean;
    fileNameIconMap: Record<string, string>;
    showCategoryIcons: boolean;
    fileTypeIconMap: Record<string, string>;
    fileTypeIconPreset: FileTypeIconPreset;
    fileNameRows: number;
    useFolderColorForTitles: boolean;
    showFilePreview: boolean;
    skipHeadingsInPreview: boolean;
    skipCodeBlocksInPreview: boolean;
    stripHtmlInPreview: boolean;
    stripLatexInPreview: boolean;
    previewRows: number;
    previewProperties: string[];
    previewPropertiesFallback: boolean;
    showFeatureImage: boolean;
    featureImageProperties: string[];
    featureImageExcludeProperties: string[];
    featureImageSize: FeatureImageSizeSetting;
    featureImagePixelSize: FeatureImagePixelSizeSetting;
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
    showFilePropertiesInCompactMode: boolean;
    showPropertiesOnSeparateRows: boolean;
    enablePropertyInternalLinks: boolean;
    enablePropertyExternalLinks: boolean;
    textCountDisplay: TextCountDisplay;
    textCountPlacement: TextCountPlacement;
    characterCountSpaces: CharacterCountSpaces;
    wordCountTargetProperty: string;
    showWordCountPercentage: boolean;
    showFileDate: boolean;
    alphabeticalDateMode: AlphabeticalDateMode;
    showParentFolder: boolean;
    showParentFolderFullPath: boolean;
    parentFolderClickRevealsFile: boolean;
    showParentFolderColor: boolean;
    showParentFolderIcon: boolean;

    // Calendar tab - Calendar
    calendarEnabled: boolean;
    calendarPlacement: CalendarPlacement;
    calendarConfirmBeforeCreate: boolean;
    calendarLocale: string;
    calendarWeekendDays: CalendarWeekendDays;
    calendarMonthHeadingFormat: CalendarMonthHeadingFormat;
    calendarHighlightToday: boolean;
    calendarShowFeatureImage: boolean;
    calendarShowTasks: boolean;
    calendarMonthHighlights: Record<string, string>;
    calendarShowWeekNumber: boolean;
    calendarShowQuarter: boolean;
    calendarShowYearCalendar: boolean;
    calendarLeftPlacement: CalendarLeftPlacement;
    calendarWeeksToShow: CalendarWeeksToShow;

    // Calendar tab - Calendar integration
    calendarIntegrationMode: CalendarIntegrationMode;
    calendarPeriodicNotesLocaleSource: CalendarPeriodicNotesLocaleSource;
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
    collapsedPinnedContexts: CollapsedPinnedContexts;
    fileIcons: Record<string, string>;
    fileColors: Record<string, string>;
    fileBackgroundColors: Record<string, string>;
    folderIcons: Record<string, string>;
    folderColors: Record<string, string>;
    folderBackgroundColors: Record<string, string>;
    folderSortOverrides: Record<string, ListSortOverrideValue>;
    folderTreeSortOverrides: Record<string, AlphaSortOrder>;
    folderAppearances: Record<string, FolderAppearance>;
    tagIcons: Record<string, string>;
    tagColors: Record<string, string>;
    tagBackgroundColors: Record<string, string>;
    tagSortOverrides: Record<string, ListSortOverrideValue>;
    tagTreeSortOverrides: Record<string, AlphaSortOrder>;
    tagAppearances: Record<string, TagAppearance>;
    propertyIcons: Record<string, string>;
    propertyColors: Record<string, string>;
    propertyBackgroundColors: Record<string, string>;
    propertySortOverrides: Record<string, ListSortOverrideValue>;
    propertyTreeSortOverrides: Record<string, AlphaSortOrder>;
    propertyAppearances: Record<string, FolderAppearance>;
    virtualFolderColors: Record<string, string>;
    virtualFolderBackgroundColors: Record<string, string>;
    navigationSeparators: Record<string, boolean>;
    userColors: string[];
    lastShownVersion: string;
    rootFolderOrder: string[];
    rootTagOrder: string[];
    rootPropertyOrder: string[];
}
