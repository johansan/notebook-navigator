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

import { App, WorkspaceLeaf } from 'obsidian';
import type { CSSProperties } from 'react';

/**
 * Shared types and constants for Notebook Navigator
 * Centralizes type definitions used across multiple modules
 */

/**
 * Unique identifier for the Notebook Navigator view type
 * Used by Obsidian to register and manage the custom view
 */
export const NOTEBOOK_NAVIGATOR_VIEW = 'notebook-navigator';

/**
 * Unique identifier for the Notebook Navigator calendar view type.
 * Used by Obsidian to register and manage the right sidebar calendar view.
 */
export const NOTEBOOK_NAVIGATOR_CALENDAR_VIEW = 'notebook-navigator-calendar';

/**
 * Unique identifier for the folder note sidebar placeholder view.
 * Used to keep a stable right sidebar slot when no folder note is open.
 */
export const NOTEBOOK_NAVIGATOR_FOLDER_NOTE_SIDEBAR_VIEW = 'notebook-navigator-folder-note-sidebar';

/**
 * Virtual tag collection id for notes without tags.
 * Stored in tag selection state and used as a tag filter token.
 */
export const UNTAGGED_TAG_ID = '__untagged__';

/**
 * Virtual tag collection id for notes that have at least one tag.
 * Stored in tag selection state and used as a tag filter token.
 */
export const TAGGED_TAG_ID = '__tagged__';

/**
 * Virtual folder id for the root Tags row in navigation.
 * Used by virtual-folder expansion state and tag section rendering.
 */
export const TAGS_ROOT_VIRTUAL_FOLDER_ID = 'tags-root';

/**
 * Virtual folder id for the root Properties row in navigation.
 * Stored in property selection state for the "all configured properties" view.
 */
export const PROPERTIES_ROOT_VIRTUAL_FOLDER_ID = 'properties-root';

/**
 * Identifies which pane currently has keyboard focus
 * Used for keyboard navigation between folder tree and file list
 */
export type FocusedPane = 'navigation' | 'files';

export type CSSPropertiesWithVars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * Enum for all item types in the navigator
 * Using const enum for better performance (inlined at compile time)
 */
export const ItemType = {
    FILE: 'file',
    FOLDER: 'folder',
    TAG: 'tag',
    PROPERTY: 'property'
} as const;

/**
 * Enum for list pane item types
 * These are specific to the list pane view
 */
export const ListPaneItemType = {
    HEADER: 'header',
    HEADER_SPACER: 'header-spacer',
    FILE: 'file',
    TOP_SPACER: 'top-spacer',
    BOTTOM_SPACER: 'bottom-spacer'
} as const;

/**
 * Type representing all possible list pane item types
 */
export type ListPaneItemType = (typeof ListPaneItemType)[keyof typeof ListPaneItemType];

/**
 * Key used for identifying the pinned notes header in list data
 */
export const PINNED_SECTION_HEADER_KEY = 'header-pinned';

/**
 * Navigator context type for context-aware features like pinning
 * Represents different browsing contexts in the navigator
 */
export type NavigatorContext = 'folder' | 'tag' | 'property';

/**
 * Key for a pinned section collapse state in a specific navigation item.
 */
export type PinnedSectionCollapseKey = `${NavigatorContext}:${string}`;

/**
 * Set-like record of navigation items where the pinned section is collapsed.
 */
export type CollapsedPinnedContexts = Partial<Record<PinnedSectionCollapseKey, boolean>>;

/**
 * Type alias for pinned notes storage structure
 * Maps file paths to their pinning context states
 */
export type PinnedNotes = Record<string, Record<NavigatorContext, boolean>>;

/**
 * Enum for navigation pane item types
 * These are specific to the navigation pane (left side)
 */
export const NavigationPaneItemType = {
    FOLDER: 'folder',
    VIRTUAL_FOLDER: 'virtual-folder',
    TAG: 'tag',
    UNTAGGED: 'untagged',
    PROPERTY_KEY: 'property-key',
    PROPERTY_VALUE: 'property-value',
    SHORTCUT_HEADER: 'shortcut-header',
    SHORTCUT_FOLDER: 'shortcut-folder',
    SHORTCUT_NOTE: 'shortcut-note',
    SHORTCUT_SEARCH: 'shortcut-search',
    SHORTCUT_TAG: 'shortcut-tag',
    SHORTCUT_PROPERTY: 'shortcut-property',
    RECENT_NOTE: 'recent-note',
    TOP_SPACER: 'top-spacer',
    BOTTOM_SPACER: 'bottom-spacer',
    LIST_SPACER: 'list-spacer',
    ROOT_SPACER: 'root-spacer'
} as const;

/**
 * Type representing all possible navigation pane item types
 */
export type NavigationPaneItemType = (typeof NavigationPaneItemType)[keyof typeof NavigationPaneItemType];

/**
 * Identifiers for navigation pane sections used in ordering
 */
export const NavigationSectionId = {
    SHORTCUTS: 'shortcuts',
    RECENT: 'recent',
    FOLDERS: 'folders',
    TAGS: 'tags',
    PROPERTIES: 'properties'
} as const;

/**
 * Type alias for navigation pane section identifiers
 */
export type NavigationSectionId = (typeof NavigationSectionId)[keyof typeof NavigationSectionId];

/**
 * Default ordering for navigation sections
 */
export const DEFAULT_NAVIGATION_SECTION_ORDER: NavigationSectionId[] = [
    NavigationSectionId.SHORTCUTS,
    NavigationSectionId.RECENT,
    NavigationSectionId.FOLDERS,
    NavigationSectionId.TAGS,
    NavigationSectionId.PROPERTIES
];

/**
 * Navigation pane measurements for accurate virtualization
 * Used by NavigationPane component
 * Note: Folder and tag heights are now dynamically calculated from settings
 */
export const NAVPANE_MEASUREMENTS = {
    // Default settings
    defaultItemHeight: 28, // Default item height
    defaultIndent: 16, // Default tree indentation
    defaultFontSize: 13, // Default desktop font size

    // Mobile adjustments
    mobileHeightIncrement: 12, // Mobile item height is desktop + 12px
    mobileFontSizeIncrement: 3, // Mobile font size is desktop + 3px

    // Spacers
    topSpacer: 8,
    listSpacer: 8,
    bottomSpacer: 20
};

/**
 * Overscan value for all virtualized lists
 * Controls how many items are rendered outside the visible area
 */
export const OVERSCAN = 10;

/**
 * List pane measurements for accurate virtualization
 * Used by ListPane component for calculating item heights
 */
export const LISTPANE_MEASUREMENTS = {
    // Default compact mode metrics
    defaultCompactItemHeight: 28, // Desktop compact item height
    defaultCompactFontSize: 13, // Desktop compact mode font size
    mobileHeightIncrement: 8, // Mobile compact item height is desktop + 8px
    mobileFontSizeIncrement: 2, // Mobile compact font size is desktop + 2px
    minCompactPaddingVerticalMobile: 6 // Minimum mobile padding per side
};

/**
 * Platform measurements used for mobile layout math.
 *
 * Keep in sync with CSS in `src/styles/sections/platform-ios.css`.
 */
export const IOS_FLOATING_TOOLBAR_HEIGHT_PX = 58;

/**
 * Pane transition duration limits for single-pane view animations (milliseconds)
 */
export const MIN_PANE_TRANSITION_DURATION_MS = 50;
export const MAX_PANE_TRANSITION_DURATION_MS = 350;
export const PANE_TRANSITION_DURATION_STEP_MS = 10;

/**
 * Type representing all possible item types
 */
export type ItemType = (typeof ItemType)[keyof typeof ItemType];

/**
 * Types of items that can be selected in the navigation pane
 * Either a folder from the file tree or a tag from the tag tree
 * This is a subset of ItemType that excludes 'file'
 */
export type NavigationItemType = typeof ItemType.FOLDER | typeof ItemType.TAG | typeof ItemType.PROPERTY;

/**
 * Keys used for persisting state in browser localStorage
 * Ensures consistent key naming across the plugin
 */
export interface LocalStorageKeys {
    expandedFoldersKey: string;
    expandedTagsKey: string;
    expandedPropertiesKey: string;
    expandedVirtualFoldersKey: string;
    selectedFolderKey: string;
    selectedPropertyKey: string;
    selectedFileKey: string;
    selectedFilesKey: string;
    selectedTagKey: string;
    navigationPaneWidthKey: string;
    navigationPaneHeightKey: string;
    dualPaneOrientationKey: string;
    narrowSidebarLayoutKey: string;
    narrowSidebarTriggerModeKey: string;
    narrowSidebarCustomWidthKey: string;
    dualPaneKey: string;
    uiScaleKey: string;
    shortcutsExpandedKey: string;
    recentNotesExpandedKey: string;
    recentNotesKey: string;
    recentIconsKey: string;
    navigationSectionOrderKey: string;
    pinnedShortcutsMaxHeightKey: string;
    uxPreferencesKey: string;
    fileCacheKey: string;
    databaseSchemaVersionKey: string;
    databaseContentVersionKey: string;
    frontmatterMetadataCacheSignatureKey: string;
    cacheRebuildNoticeKey: string;
    debugLoggingEnabledKey: string;
    // PDF_CRASH_DIAGNOSTICS: vault-scoped key used by the PDF crash diagnostic flow.
    pdfProcessingDiagnosticKey: string;
    localStorageVersionKey: string;
    vaultProfileKey: string;
    releaseCheckTimestampKey: string;
    searchProviderKey: string;
    homepageKey: string;
    folderSortOrderKey: string;
    tagSortOrderKey: string;
    propertySortOrderKey: string;
    recentColorsKey: string;
    paneTransitionDurationKey: string;
    toolbarVisibilityKey: string;
    useFloatingToolbarsKey: string;
    pinNavigationBannerKey: string;
    navIndentKey: string;
    navItemHeightKey: string;
    navItemHeightScaleTextKey: string;
    calendarPlacementKey: string;
    calendarLeftPlacementKey: string;
    calendarWeeksToShowKey: string;
    compactItemHeightKey: string;
    compactItemHeightScaleTextKey: string;
    featureImageSizeKey: string;
    featureImagePixelSizeKey: string;
    collapsedListGroupsKey: string;
    mergeNotesSeparatorKey: string;
    mergeNotesMoveSourcesToTrashKey: string;
    settingsImportBackupToRootKey: string;
}

/**
 * Singleton instance of localStorage keys
 * Use this instead of defining keys in multiple places
 */
export const STORAGE_KEYS: LocalStorageKeys = {
    expandedFoldersKey: 'notebook-navigator-expanded-folders',
    expandedTagsKey: 'notebook-navigator-expanded-tags',
    expandedPropertiesKey: 'notebook-navigator-expanded-properties',
    expandedVirtualFoldersKey: 'notebook-navigator-expanded-virtual-folders',
    selectedFolderKey: 'notebook-navigator-selected-folder',
    selectedPropertyKey: 'notebook-navigator-selected-property',
    selectedFileKey: 'notebook-navigator-selected-file',
    selectedFilesKey: 'notebook-navigator-selected-files',
    selectedTagKey: 'notebook-navigator-selected-tag',
    navigationPaneWidthKey: 'notebook-navigator-navigation-pane-width',
    navigationPaneHeightKey: 'notebook-navigator-navigation-pane-height',
    dualPaneOrientationKey: 'notebook-navigator-dual-pane-orientation',
    narrowSidebarLayoutKey: 'notebook-navigator-narrow-sidebar-layout',
    narrowSidebarTriggerModeKey: 'notebook-navigator-narrow-sidebar-trigger-mode',
    narrowSidebarCustomWidthKey: 'notebook-navigator-narrow-sidebar-custom-width',
    dualPaneKey: 'notebook-navigator-dual-pane',
    uiScaleKey: 'notebook-navigator-ui-scale',
    shortcutsExpandedKey: 'notebook-navigator-shortcuts-expanded',
    recentNotesExpandedKey: 'notebook-navigator-recent-notes-expanded',
    recentNotesKey: 'notebook-navigator-recent-notes',
    recentIconsKey: 'notebook-navigator-recent-icons',
    navigationSectionOrderKey: 'notebook-navigator-section-order',
    pinnedShortcutsMaxHeightKey: 'notebook-navigator-pinned-shortcuts-max-height',
    uxPreferencesKey: 'notebook-navigator-ux-preferences',
    fileCacheKey: 'notebook-navigator-file-cache',
    databaseSchemaVersionKey: 'notebook-navigator-db-schema-version',
    databaseContentVersionKey: 'notebook-navigator-db-content-version',
    frontmatterMetadataCacheSignatureKey: 'notebook-navigator-frontmatter-metadata-cache-signature',
    cacheRebuildNoticeKey: 'notebook-navigator-cache-rebuild-notice',
    debugLoggingEnabledKey: 'notebook-navigator-debug-logging-enabled',
    // PDF_CRASH_DIAGNOSTICS: persists the last PDF path being processed on mobile support builds.
    pdfProcessingDiagnosticKey: 'notebook-navigator-pdf-processing-diagnostic',
    localStorageVersionKey: 'notebook-navigator-localstorage-version',
    vaultProfileKey: 'notebook-navigator-vault-profile',
    releaseCheckTimestampKey: 'notebook-navigator-release-check-timestamp',
    searchProviderKey: 'notebook-navigator-search-provider',
    homepageKey: 'notebook-navigator-homepage',
    folderSortOrderKey: 'notebook-navigator-folder-sort-order',
    tagSortOrderKey: 'notebook-navigator-tag-sort-order',
    propertySortOrderKey: 'notebook-navigator-property-sort-order',
    recentColorsKey: 'notebook-navigator-recent-colors',
    paneTransitionDurationKey: 'notebook-navigator-pane-transition-duration',
    toolbarVisibilityKey: 'notebook-navigator-toolbar-visibility',
    useFloatingToolbarsKey: 'notebook-navigator-use-floating-toolbars',
    pinNavigationBannerKey: 'notebook-navigator-pin-navigation-banner',
    navIndentKey: 'notebook-navigator-nav-indent',
    navItemHeightKey: 'notebook-navigator-nav-item-height',
    navItemHeightScaleTextKey: 'notebook-navigator-nav-item-height-scale-text',
    calendarPlacementKey: 'notebook-navigator-calendar-placement',
    calendarLeftPlacementKey: 'notebook-navigator-calendar-left-placement',
    calendarWeeksToShowKey: 'notebook-navigator-calendar-weeks-to-show',
    compactItemHeightKey: 'notebook-navigator-compact-item-height',
    compactItemHeightScaleTextKey: 'notebook-navigator-compact-item-height-scale-text',
    featureImageSizeKey: 'notebook-navigator-feature-image-size',
    featureImagePixelSizeKey: 'notebook-navigator-feature-image-pixel-size',
    collapsedListGroupsKey: 'notebook-navigator-collapsed-list-groups',
    mergeNotesSeparatorKey: 'notebook-navigator-merge-notes-separator',
    mergeNotesMoveSourcesToTrashKey: 'notebook-navigator-merge-notes-move-sources-to-trash',
    settingsImportBackupToRootKey: 'notebook-navigator-settings-import-backup-to-root'
};

export interface UXPreferences {
    searchActive: boolean;
    includeDescendantNotes: boolean;
    showHiddenItems: boolean;
    pinShortcuts: boolean;
    showCalendar: boolean;
}

export type VisibilityPreferences = Pick<UXPreferences, 'includeDescendantNotes' | 'showHiddenItems'>;

/** Orientation options for dual-pane layout */
export type DualPaneOrientation = 'horizontal' | 'vertical';

/** Background color mode for navigation/list panes on desktop */
export type BackgroundMode = 'separate' | 'primary' | 'secondary';

/**
 * Default dimensions for the navigation pane (folder/tag tree)
 * These values are used when no saved state exists
 */
export const NAVIGATION_PANE_DIMENSIONS = {
    defaultWidth: 200, // Obsidian left panel default width is 300
    minWidth: 150,
    defaultHeight: 260,
    minHeight: 160,
    pinnedShortcutsMinHeight: 80
};

/**
 * Default dimensions for the file pane (file list)
 * The file pane uses flex: 1 so it doesn't have a defaultWidth or maxWidth
 */
export const FILE_PANE_DIMENSIONS = {
    minWidth: 150
};

/**
 * Supported file types in Notebook Navigator
 * Maps file extensions to their corresponding Obsidian leaf types
 */
const SUPPORTED_FILE_TYPES = {
    // Extension to leaf type mapping
    md: 'markdown',
    canvas: 'canvas',
    pdf: 'pdf',
    base: 'base'
} as const;

/**
 * Array of supported leaf types (derived from SUPPORTED_FILE_TYPES values)
 */
const SUPPORTED_LEAF_TYPES = Object.values(SUPPORTED_FILE_TYPES);

/**
 * Type for supported file extensions
 */
export type SupportedFileExtension = keyof typeof SUPPORTED_FILE_TYPES;

/**
 * Type for supported leaf types
 */
export type SupportedLeafType = (typeof SUPPORTED_FILE_TYPES)[SupportedFileExtension];

/**
 * Helper functions related to supported leaf types
 */

/**
 * Helper function to get all leaves with supported file types
 */
export function getSupportedLeaves(app: App): WorkspaceLeaf[] {
    return SUPPORTED_LEAF_TYPES.flatMap(type => app.workspace.getLeavesOfType(type));
}

export function isSupportedLeafType(viewType: string): viewType is SupportedLeafType {
    return SUPPORTED_LEAF_TYPES.includes(viewType as SupportedLeafType);
}

/**
 * Virtual folder for organizing tags
 * These are not real folders but act like folders in the UI
 */
export interface VirtualFolder {
    /** Unique identifier for the virtual folder */
    id: string;
    /** Display name of the virtual folder */
    name: string;
    /** Optional custom icon for the virtual folder */
    icon?: string;
}

/**
 * Virtual folder id for the shortcuts section in the navigation pane
 */
export const SHORTCUTS_VIRTUAL_FOLDER_ID = 'shortcuts-root';
export const RECENT_NOTES_VIRTUAL_FOLDER_ID = 'recent-notes-root';

/**
 * Data attributes for drag-and-drop functionality using event delegation
 * These attributes are added to DOM elements to enable drag-drop without individual event listeners
 */
export interface DragDropAttributes {
    // Draggable element attributes
    'data-draggable'?: 'true';
    'data-drag-type'?: ItemType;
    'data-drag-path'?: string;
    'data-drag-handle'?: 'true';
    'data-drag-allow-multi-file'?: 'false';

    // Drop zone attributes
    'data-drop-zone'?: typeof ItemType.FOLDER;
    'data-drop-path'?: string;
    'data-drop-validator'?: typeof ItemType.FOLDER;

    // Interaction attributes
    'data-clickable'?: typeof ItemType.FOLDER | typeof ItemType.FILE;
    'data-click-path'?: string;
    'data-dblclick-action'?: 'expand' | 'preview';
    'data-context-menu'?: ItemType;

    // State attributes
    'data-expanded'?: 'true' | 'false';
    'data-selected'?: 'true' | 'false';
    'data-focused'?: 'true' | 'false';

    // Index for keyboard navigation
    'data-index'?: string;

    // Nesting level for folders
    'data-level'?: string;
}

/**
 * Combined attributes interface for DOM elements
 * Extends standard HTML attributes with our custom data attributes
 */
export interface NavigatorElementAttributes extends DragDropAttributes {
    'data-path': string; // Required path attribute for all items
    class?: string;
    draggable?: 'true' | 'false';
    'aria-label'?: string;
    'aria-expanded'?: 'true' | 'false';
    'aria-selected'?: 'true' | 'false';
}
