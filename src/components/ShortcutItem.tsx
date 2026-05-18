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

import React, { useMemo } from 'react';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import type { ListReorderHandlers } from '../types/listReorder';
import { NavigationListRow, type DragHandleConfig, type NativeDragData } from './NavigationListRow';
import type { NoteCountInfo } from '../types/noteCounts';
import { buildNoteCountDisplay } from '../utils/noteCountFormatting';
import { strings } from '../i18n';
import { NavItemHoverActionSlot } from './NavItemHoverActionSlot';

/**
 * Props for a shortcut item component that can represent folders, notes, searches, or tags
 */
interface ShortcutItemProps {
    icon: string;
    color?: string;
    backgroundColor?: string;
    adjacentFilledClassName?: string;
    label: string;
    description?: string;
    level: number;
    isDisabled?: boolean;
    isMissing?: boolean;
    type: 'folder' | 'note' | 'search' | 'tag' | 'property';
    countInfo?: NoteCountInfo;
    badge?: string;
    forceShowCount?: boolean;
    isExcluded?: boolean;
    onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
    onRemove?: () => void;
    onMouseDown?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void;
    dragHandlers?: ListReorderHandlers;
    isDragSource?: boolean;
    dragHandleConfig?: DragHandleConfig;
    hasFolderNote?: boolean;
    tooltip?: string;
    onLabelClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
    onLabelMouseDown?: (event: React.MouseEvent<HTMLSpanElement>) => void;
    dragRef?: (node: HTMLDivElement | null) => void;
    dragHandleRef?: (node: HTMLSpanElement | null) => void;
    dragAttributes?: React.HTMLAttributes<HTMLElement>;
    dragListeners?: DraggableSyntheticListeners;
    dragStyle?: React.CSSProperties;
    isSorting?: boolean;
    nativeDragData?: NativeDragData;
}

/**
 * Renders a shortcut item in the navigation pane that supports clicking, drag-and-drop, and context menus.
 * Handles disabled states and conditionally shows item counts based on type and settings.
 */
export const ShortcutItem = React.memo(function ShortcutItem({
    icon,
    color,
    backgroundColor,
    adjacentFilledClassName,
    label,
    description,
    level,
    isDisabled,
    isMissing,
    type,
    countInfo,
    badge,
    forceShowCount,
    isExcluded,
    onClick,
    onRemove,
    onMouseDown,
    onContextMenu,
    dragHandlers,
    isDragSource,
    dragHandleConfig,
    hasFolderNote,
    tooltip,
    onLabelClick,
    onLabelMouseDown,
    dragRef,
    dragHandleRef,
    dragAttributes,
    dragListeners,
    dragStyle,
    isSorting,
    nativeDragData
}: ShortcutItemProps) {
    const settings = useSettingsState();
    const uxPreferences = useUXPreferences();
    const includeDescendantNotes = uxPreferences.includeDescendantNotes;
    // Build formatted display object with label based on note count settings
    const countDisplay = buildNoteCountDisplay(countInfo, includeDescendantNotes, includeDescendantNotes && settings.separateNoteCounts);
    // Check if this item type supports displaying note counts
    const supportsCount = type === 'folder' || type === 'tag' || type === 'property';
    const hasBadge = typeof badge === 'string' && badge.length > 0;
    const hasRemove = Boolean(onRemove);
    // Determines whether to display the badge/count bubble
    // Shows a numeric badge when provided, otherwise shows note counts for folder/tag types when enabled
    const shouldShowCount =
        hasBadge || (supportsCount && countDisplay.shouldDisplay && (Boolean(forceShowCount) || settings.showNoteCount));
    const countLabel = hasBadge ? badge : countDisplay.label;
    // Row is disabled when item exists but is disabled (missing items are handled separately)
    const shouldDisableRow = Boolean(isDisabled) && !isMissing;
    // Builds CSS class names for the shortcut item with conditional missing state
    const classNames = useMemo(() => {
        const classes = ['nn-shortcut-item'];
        if (isMissing) {
            classes.push('nn-shortcut-item--missing');
        }
        if (hasRemove) {
            classes.push('nn-shortcut-item--removable');
        }
        if (adjacentFilledClassName) {
            classes.push(adjacentFilledClassName);
        }
        return classes.join(' ');
    }, [adjacentFilledClassName, hasRemove, isMissing]);

    // Conditionally enables label click handler based on row state
    const labelClickHandler = useMemo(() => {
        if (shouldDisableRow || isMissing) {
            return undefined;
        }
        return onLabelClick;
    }, [isMissing, onLabelClick, shouldDisableRow]);

    const labelMouseDownHandler = useMemo(() => {
        if (shouldDisableRow || isMissing) {
            return undefined;
        }
        return onLabelMouseDown;
    }, [isMissing, onLabelMouseDown, shouldDisableRow]);

    const rowBackgroundColor = useMemo(() => {
        if (isMissing) {
            return undefined;
        }
        return backgroundColor;
    }, [backgroundColor, isMissing]);

    // Determines icon visibility based on shortcuts/recent icons setting
    const shouldShowIcon = useMemo(() => {
        return settings.showSectionIcons;
    }, [settings.showSectionIcons]);

    const countSlot = useMemo(() => {
        if (!onRemove) {
            return undefined;
        }

        return (
            <NavItemHoverActionSlot
                label={shouldShowCount ? countLabel : undefined}
                reserveSpaceWhenHidden={shouldShowCount}
                actionLabel={strings.shortcuts.remove}
                icon="lucide-x"
                onClick={onRemove}
            />
        );
    }, [countLabel, onRemove, shouldShowCount]);

    return (
        <NavigationListRow
            icon={icon}
            color={color}
            backgroundColor={rowBackgroundColor}
            label={label}
            description={description}
            level={level}
            itemType={type}
            isDisabled={shouldDisableRow}
            isExcluded={isExcluded}
            onClick={event => {
                // Prevent click action when item is disabled or missing
                if (shouldDisableRow || isMissing) {
                    event.preventDefault();
                    return;
                }
                onClick(event);
            }}
            onMouseDown={event => {
                // Prevent mouse down action when item is disabled or missing
                if (shouldDisableRow || isMissing) {
                    return;
                }
                onMouseDown?.(event);
            }}
            onContextMenu={onContextMenu}
            dragHandlers={dragHandlers}
            isDragSource={isDragSource}
            showCount={shouldShowCount || hasRemove}
            count={countLabel}
            countSlot={countSlot}
            className={classNames}
            tabIndex={-1}
            ariaDisabled={shouldDisableRow || isMissing}
            dragHandleConfig={dragHandleConfig}
            labelClassName={hasFolderNote ? 'nn-has-folder-note' : undefined}
            tooltip={tooltip}
            onLabelClick={labelClickHandler}
            onLabelMouseDown={labelMouseDownHandler}
            showIcon={shouldShowIcon}
            dragRef={dragRef}
            dragHandleRef={dragHandleRef}
            dragAttributes={dragAttributes}
            dragListeners={dragListeners}
            dragStyle={dragStyle}
            isSorting={isSorting}
            nativeDragData={nativeDragData}
        />
    );
});
