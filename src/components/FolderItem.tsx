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

/**
 * OPTIMIZATIONS:
 *
 * 1. React.memo - Component only re-renders when props actually change
 *
 * 2. Props-based state:
 *    - icon and color passed as props from NavigationPane to enable proper reactivity
 *    - File count pre-computed by parent to avoid redundant calculations
 *
 * 3. Memoized values:
 *    - hasFolderNote: Cached check for folder note existence
 *    - className: Cached CSS class string construction
 *    - folderNameClassName: Cached folder name styling classes
 *
 * 4. Stable callbacks:
 *    - handleDoubleClick: Memoized folder expansion handler
 *    - handleChevronClick: Memoized chevron click with Alt+click support
 *    - handleChevronDoubleClick: Prevents event propagation
 *    - handleNameClick: Optional folder name click handler
 *
 * 5. Direct computations:
 *    - hasChildren: NOT memoized because Obsidian mutates folder.children array
 *    - This ensures chevron updates immediately when subfolders are added/removed
 *
 * 6. Icon rendering optimization:
 *    - Icons rendered via useEffect to avoid blocking main render
 *    - Conditional rendering based on settings.showFolderIcons
 *
 * 7. Tooltip optimization:
 *    - Tooltip only created on desktop (mobile skipped)
 *    - Tooltip creation deferred to useEffect
 */

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { TFolder, setTooltip } from 'obsidian';
import { useServices } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import { useContextMenu, hideNavigatorContextMenu } from '../hooks/useContextMenu';
import { getIconService, useIconServiceVersion } from '../services/icons';
import { getTooltipPlacement } from '../utils/domUtils';
import { getFolderNote } from '../utils/folderNoteLookup';
import { hasSubfolders, shouldExcludeFolderFromDescendants } from '../utils/fileFilters';
import { IndentGuideColumns } from './IndentGuideColumns';
import type { NoteCountInfo } from '../types/noteCounts';
import { buildNoteCountDisplay, buildSortableNoteCountDisplay } from '../utils/noteCountFormatting';
import { useActiveProfile } from '../context/SettingsContext';
import { resolveUXIcon } from '../utils/uxIcons';
import { ItemType, type CSSPropertiesWithVars } from '../types';
import { buildFolderTooltip } from '../utils/navigationTooltipUtils';
import { InlineRenameInput, type InlineRenameControl } from './InlineRenameInput';
import { strings } from '../i18n';

interface FolderItemProps {
    folder: TFolder;
    displayName?: string;
    level: number;
    indentGuideLevels?: number[];
    isExpanded: boolean;
    isSelected: boolean;
    isExcluded?: boolean;
    onToggle: () => void;
    onClick: () => void;
    onNameClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
    onNameMouseDown?: (event: React.MouseEvent<HTMLSpanElement>) => void;
    onToggleAllSiblings?: () => void;
    icon?: string;
    color?: string;
    backgroundColor?: string;
    adjacentFilledClassName?: string;
    countInfo?: NoteCountInfo;
    excludedFolders: string[];
    descendantExcludedFolders: string[];
    vaultChangeVersion: number;
    disableContextMenu?: boolean;
    disableNavigationSeparatorActions?: boolean;
    onStartInlineRename?: (folder: TFolder) => boolean;
    inlineRename?: InlineRenameControl;
}

/**
 * Renders an individual folder item in the folder tree with expand/collapse functionality.
 * Displays folder icon, name, and optional file count. Handles selection state,
 * context menus, drag-and-drop, and auto-scrolling when selected.
 *
 * @param props - The component props
 * @param props.folder - The Obsidian TFolder to display
 * @param props.level - The nesting level for indentation
 * @param props.isExpanded - Whether this folder is currently expanded
 * @param props.isSelected - Whether this folder is currently selected
 * @param props.onToggle - Handler called when the expand/collapse chevron is clicked
 * @param props.onClick - Handler called when the folder is clicked
 * @returns A folder item element with chevron, icon, name and optional file count
 */
export const FolderItem = React.memo(function FolderItem({
    folder,
    displayName,
    level,
    indentGuideLevels,
    isExpanded,
    isSelected,
    isExcluded,
    onToggle,
    onClick,
    onNameClick,
    onNameMouseDown,
    onToggleAllSiblings,
    icon,
    color,
    backgroundColor,
    adjacentFilledClassName,
    countInfo,
    excludedFolders,
    descendantExcludedFolders,
    vaultChangeVersion,
    disableContextMenu,
    disableNavigationSeparatorActions,
    onStartInlineRename,
    inlineRename
}: FolderItemProps) {
    const { app, fileSystemOps, isMobile } = useServices();
    const settings = useSettingsState();
    const { fileVisibility } = useActiveProfile();
    const uxPreferences = useUXPreferences();
    const includeDescendantNotes = uxPreferences.includeDescendantNotes;
    const showHiddenItems = uxPreferences.showHiddenItems;
    const folderRef = useRef<HTMLDivElement | null>(null);

    const chevronRef = React.useRef<HTMLDivElement | null>(null);
    const iconRef = React.useRef<HTMLSpanElement | null>(null);
    const noteCountRef = React.useRef<HTMLSpanElement | null>(null);
    const iconVersion = useIconServiceVersion();

    // Merge provided count info with default values to ensure all properties are present
    const noteCounts: NoteCountInfo = countInfo ?? { current: 0, descendants: 0, total: 0 };

    const folderTreeSortOverrides = settings.folderTreeSortOverrides;
    const hasChildSortOrderOverride = Boolean(
        folderTreeSortOverrides && Object.prototype.hasOwnProperty.call(folderTreeSortOverrides, folder.path)
    );
    const childSortOrderOverride = hasChildSortOrderOverride ? folderTreeSortOverrides?.[folder.path] : undefined;
    const sortOrderIndicator = childSortOrderOverride === 'alpha-desc' ? '↓' : childSortOrderOverride === 'alpha-asc' ? '↑' : undefined;

    // Determine if we should show separate counts (e.g., "2 • 5") or combined count (e.g., "7")
    const useSeparateCounts = includeDescendantNotes && settings.separateNoteCounts;
    // The exclusion only affects parent aggregation, so the indicator applies only while descendant notes are shown
    const isHiddenFromParentLists = useMemo(
        () =>
            includeDescendantNotes &&
            descendantExcludedFolders.length > 0 &&
            shouldExcludeFolderFromDescendants(folder.name, descendantExcludedFolders, folder.path),
        [descendantExcludedFolders, folder.name, folder.path, includeDescendantNotes]
    );
    // Build formatted display object with label and visibility flags
    const baseNoteCountDisplay = buildNoteCountDisplay(noteCounts, includeDescendantNotes, useSeparateCounts, '•');
    // Parentheses around the count mark folders whose notes are omitted from parent folder lists
    const showsHiddenFromParentsIndicator = isHiddenFromParentLists && baseNoteCountDisplay.shouldDisplay;
    const noteCountDisplay = buildSortableNoteCountDisplay(
        showsHiddenFromParentsIndicator ? { shouldDisplay: true, label: `(${baseNoteCountDisplay.label})` } : baseNoteCountDisplay,
        sortOrderIndicator
    );
    // Render count badge when note counts are enabled and there is either a count or a sort override indicator
    const shouldDisplayCount = settings.showNoteCount && noteCountDisplay.shouldDisplay;

    // Check if folder has children - not memoized because Obsidian mutates the children array
    // The hasSubfolders function handles the logic of whether to show all or only visible subfolders
    const showHiddenFolders = showHiddenItems;
    const hasChildren = hasSubfolders(folder, excludedFolders, showHiddenFolders);

    // Use color from props (passed from NavigationPane)
    const customColor = color;
    // Determine whether to apply color to the folder name instead of the icon
    const applyColorToName = Boolean(customColor) && !settings.colorIconOnly;
    const folderNoteLinksEnabled = settings.enableFolderNotes && settings.enableFolderNoteLinks;

    const hasFolderNote = useMemo(() => {
        if (!folderNoteLinksEnabled) return false;
        const folderNote = getFolderNote(folder, settings);
        return folderNote !== null;
        // eslint-disable-next-line react-hooks/exhaustive-deps -- noteCounts.current and vaultChangeVersion refresh folder-note detection.
    }, [folder, settings, folderNoteLinksEnabled, noteCounts.current, vaultChangeVersion]);

    const isRootFolder = folder.path === '/';
    const effectiveDisplayName = displayName || (isRootFolder ? settings.customVaultName || app.vault.getName() : folder.name);
    const shouldShowFolderIcon = settings.showFolderIcons || isRootFolder;
    const tooltip = useMemo(() => {
        if (isMobile || !settings.showTooltips) {
            return undefined;
        }

        void vaultChangeVersion;
        return buildFolderTooltip({
            app,
            folder,
            displayName: effectiveDisplayName,
            fileVisibility,
            hiddenFolders: excludedFolders,
            settings,
            showHiddenItems
        });
    }, [app, effectiveDisplayName, excludedFolders, fileVisibility, folder, isMobile, settings, showHiddenItems, vaultChangeVersion]);

    const dragFallbackIconId = useMemo(() => {
        if (isRootFolder) {
            return hasChildren && isExpanded ? 'open-vault' : 'vault';
        }
        return hasChildren && isExpanded
            ? resolveUXIcon(settings.interfaceIcons, 'nav-folder-open')
            : resolveUXIcon(settings.interfaceIcons, 'nav-folder-closed');
    }, [hasChildren, isExpanded, isRootFolder, settings.interfaceIcons]);
    const dragIconId = icon ?? dragFallbackIconId;
    const customBackground = backgroundColor;

    // Memoize className to avoid string concatenation on every render
    const className = useMemo(() => {
        const classes = ['nn-navitem', 'nn-folder'];
        if (isSelected) classes.push('nn-selected');
        if (isExcluded) classes.push('nn-excluded');
        if (customBackground) classes.push('nn-has-custom-background');
        if (adjacentFilledClassName) classes.push(adjacentFilledClassName);
        return classes.join(' ');
    }, [adjacentFilledClassName, customBackground, isSelected, isExcluded]);

    const folderNameClassName = useMemo(() => {
        const classes = ['nn-navitem-name'];
        if (hasFolderNote) classes.push('nn-has-folder-note');
        if (applyColorToName) classes.push('nn-has-custom-color');
        return classes.join(' ');
    }, [applyColorToName, hasFolderNote]);
    const renameInputOptions = useMemo(
        () => (inlineRename ? fileSystemOps.getFolderDisplayNameRenameInput(folder) : null),
        [fileSystemOps, folder, inlineRename]
    );

    // Stable event handlers
    const handleDoubleClick = useCallback(() => {
        if (hasChildren) {
            onToggle();
        }
    }, [hasChildren, onToggle]);

    const handleChevronClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasChildren) {
                if (e.altKey && onToggleAllSiblings) {
                    onToggleAllSiblings();
                } else {
                    onToggle();
                }
            }
        },
        [hasChildren, onToggle, onToggleAllSiblings]
    );

    const handleChevronDoubleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
    }, []);

    const handleNameClick = useCallback(
        (e: React.MouseEvent<HTMLSpanElement>) => {
            if (onNameClick) {
                e.stopPropagation();
                onNameClick(e);
            }
        },
        [onNameClick]
    );

    const handleNameMouseDown = useCallback(
        (e: React.MouseEvent<HTMLSpanElement>) => {
            hideNavigatorContextMenu();
            if (onNameMouseDown) {
                e.stopPropagation();
                onNameMouseDown(e);
            }
        },
        [onNameMouseDown]
    );

    // Add Obsidian tooltip
    useEffect(() => {
        if (!folderRef.current) return;

        // Skip tooltip creation on mobile
        if (isMobile) return;

        // Remove tooltip if disabled
        if (!settings.showTooltips) {
            setTooltip(folderRef.current, '');
            return;
        }

        if (!tooltip) {
            setTooltip(folderRef.current, '');
            return;
        }

        setTooltip(folderRef.current, tooltip, {
            placement: getTooltipPlacement()
        });
    }, [settings.showTooltips, isMobile, tooltip]);

    useEffect(() => {
        if (chevronRef.current) {
            const iconService = getIconService();
            const iconId = resolveUXIcon(settings.interfaceIcons, isExpanded ? 'nav-tree-collapse' : 'nav-tree-expand');
            iconService.renderIcon(chevronRef.current, iconId);
        }
    }, [iconVersion, isExpanded, settings.interfaceIcons]);

    // Update folder icon
    useEffect(() => {
        if (iconRef.current && shouldShowFolderIcon) {
            const iconService = getIconService();

            if (icon) {
                // Custom icon is set - always show it, never toggle
                iconService.renderIcon(iconRef.current, icon);
            } else if (isRootFolder) {
                // Root folder - use vault icon (open/closed based on expansion state)
                const vaultIconName = hasChildren && isExpanded ? 'open-vault' : 'vault';
                iconService.renderIcon(iconRef.current, vaultIconName);
            } else {
                // Default icon - show open folder only if has children AND is expanded
                const iconName =
                    hasChildren && isExpanded
                        ? resolveUXIcon(settings.interfaceIcons, 'nav-folder-open')
                        : resolveUXIcon(settings.interfaceIcons, 'nav-folder-closed');
                iconService.renderIcon(iconRef.current, iconName);
            }
        }
    }, [hasChildren, icon, iconVersion, isExpanded, isRootFolder, settings.interfaceIcons, shouldShowFolderIcon]);

    useEffect(() => {
        if (!noteCountRef.current) return;

        if (isMobile || !settings.showTooltips || !showsHiddenFromParentsIndicator || !shouldDisplayCount) {
            setTooltip(noteCountRef.current, '');
            return;
        }

        setTooltip(noteCountRef.current, strings.contextMenu.folder.hiddenFromParentsIndicator, {
            placement: getTooltipPlacement()
        });
    }, [showsHiddenFromParentsIndicator, isMobile, settings.showTooltips, shouldDisplayCount]);

    const folderMenuOptions = useMemo(
        () =>
            disableNavigationSeparatorActions || onStartInlineRename
                ? {
                      ...(disableNavigationSeparatorActions ? { disableNavigationSeparatorActions: true } : {}),
                      ...(onStartInlineRename ? { onStartInlineRename } : {})
                  }
                : undefined,
        [disableNavigationSeparatorActions, onStartInlineRename]
    );

    // Enable context menu
    const folderMenuConfig = disableContextMenu
        ? null
        : {
              type: ItemType.FOLDER,
              item: folder,
              options: folderMenuOptions
          };

    useContextMenu(folderRef, folderMenuConfig);

    const isDraggable = !isMobile && !isRootFolder;
    const folderStyle: CSSPropertiesWithVars = {
        '--level': level,
        ...(customBackground ? { '--nn-navitem-custom-bg-color': customBackground } : {})
    };

    return (
        <div
            ref={folderRef}
            className={className}
            data-path={folder.path}
            // Path to use when this folder is dragged
            data-drag-path={folder.path}
            // Type of item being dragged (folder, file, or tag)
            data-drag-type="folder"
            // Marks element as draggable for event delegation
            data-draggable={isDraggable ? 'true' : undefined}
            // Icon to display in drag preview
            data-drag-icon={dragIconId}
            // Default icon displayed if the custom drag preview icon is unavailable
            data-drag-fallback-icon={dragFallbackIconId}
            // Icon color to display in drag preview
            data-drag-icon-color={customColor || undefined}
            draggable={isDraggable}
            // Drop zone type (folder or tag)
            data-drop-zone="folder"
            // Target path for drop operations on this folder
            data-drop-path={folder.path}
            data-clickable="folder"
            data-level={level}
            onClick={onClick}
            onDoubleClick={handleDoubleClick}
            style={folderStyle}
            role="treeitem"
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-level={level + 1}
        >
            <div className="nn-navitem-content">
                <IndentGuideColumns levels={indentGuideLevels} />
                <div
                    className={`nn-navitem-chevron ${hasChildren ? 'nn-navitem-chevron--has-children' : 'nn-navitem-chevron--no-children'}`}
                    ref={chevronRef}
                    onClick={handleChevronClick}
                    onDoubleClick={handleChevronDoubleClick}
                    tabIndex={-1}
                />
                {shouldShowFolderIcon && (
                    <span className="nn-navitem-icon" ref={iconRef} style={customColor ? { color: customColor } : undefined}></span>
                )}
                {inlineRename && renameInputOptions ? (
                    <InlineRenameInput {...inlineRename} {...renameInputOptions} className="nn-navitem-inline-rename" />
                ) : (
                    <span
                        className={folderNameClassName}
                        style={applyColorToName ? { color: customColor } : undefined}
                        onClick={handleNameClick}
                        onMouseDown={handleNameMouseDown}
                    >
                        {effectiveDisplayName}
                    </span>
                )}
                <span className="nn-navitem-spacer nn-navitem-spacer--leader" />
                {shouldDisplayCount && (
                    <span ref={noteCountRef} className="nn-navitem-count">
                        {noteCountDisplay.label}
                    </span>
                )}
            </div>
        </div>
    );
});
