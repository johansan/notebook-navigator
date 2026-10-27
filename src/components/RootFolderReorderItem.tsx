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

import React, { ReactNode, useMemo } from 'react';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { ListReorderHandlers } from '../types/listReorder';
import { NavigationListRow, type DragHandleConfig } from './NavigationListRow';
import { useSettingsState } from '../context/SettingsContext';

/**
 * Props for a root folder item in reorder mode
 */
interface RootFolderReorderItemProps {
    icon: string;
    label: string;
    level: number;
    dragHandlers?: ListReorderHandlers;
    isDragSource?: boolean;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void;
    chevronIcon?: string;
    isMissing?: boolean;
    color?: string;
    itemType?: 'folder' | 'tag' | 'property' | 'section'; // Type of navigation item (folder, tag, property, or section header)
    className?: string; // Additional CSS classes to apply to the item
    dragHandleConfig?: DragHandleConfig;
    trailingAccessory?: ReactNode;
    /** Badge in the count position, such as a folder's subfolder sort indicator */
    countSlot?: ReactNode;
    dragRef?: (node: HTMLDivElement | null) => void;
    dragHandleRef?: (node: HTMLSpanElement | null) => void;
    dragAttributes?: React.HTMLAttributes<HTMLElement>;
    dragListeners?: DraggableSyntheticListeners;
    dragStyle?: React.CSSProperties;
    isSorting?: boolean;
}

/**
 * Renders a root folder item that can be reordered via drag and drop.
 * Wraps NavigationListRow with specific configuration for root folder reordering.
 */
export function RootFolderReorderItem({
    icon,
    label,
    level,
    dragHandlers,
    isDragSource,
    onClick,
    onContextMenu,
    chevronIcon,
    isMissing,
    color,
    itemType = 'folder',
    className,
    dragHandleConfig,
    trailingAccessory,
    countSlot,
    dragRef,
    dragHandleRef,
    dragAttributes,
    dragListeners,
    dragStyle,
    isSorting
}: RootFolderReorderItemProps) {
    const settings = useSettingsState();
    // Prevents event bubbling for reorder item clicks to avoid triggering parent handlers
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (onClick) {
            onClick(event);
        }
    };

    // Configures the drag handle appearance when drag handlers are available
    // Shows a grip icon that allows users to reorder the root folder
    const handleConfig =
        dragHandleConfig ??
        (dragHandlers
            ? {
                  visible: true,
                  icon: 'lucide-grip-horizontal'
              }
            : undefined);

    // Builds the CSS class names for the reorder item, combining base class with optional modifiers
    const rowClassName = (() => {
        const classes = ['nn-root-reorder-item'];
        if (itemType === 'folder') {
            classes.push('nn-folder');
        } else if (itemType === 'tag') {
            classes.push('nn-tag');
        } else if (itemType === 'property') {
            classes.push('nn-property');
        } else if (itemType === 'section') {
            classes.push('nn-section');
        }
        if (isMissing) {
            classes.push('nn-root-reorder-item--missing');
        }
        if (className) {
            classes.push(className);
        }
        return classes.join(' ');
    })();

    // Determines icon visibility based on item-specific icon settings
    const showIcon = useMemo(() => {
        if (itemType === 'section') {
            return true;
        }
        if (itemType === 'folder') {
            return settings.showFolderIcons;
        }
        if (itemType === 'tag') {
            return settings.showTagIcons;
        }
        if (itemType === 'property') {
            return settings.showPropertyIcons;
        }
        return true;
    }, [itemType, settings.showFolderIcons, settings.showPropertyIcons, settings.showTagIcons]);

    return (
        <NavigationListRow
            icon={icon}
            color={color}
            label={label}
            level={level}
            itemType={itemType}
            role="listitem"
            onClick={handleClick}
            onContextMenu={onContextMenu}
            dragHandlers={dragHandlers}
            isDragSource={isDragSource}
            showCount={Boolean(countSlot)}
            countSlot={countSlot}
            className={rowClassName}
            tabIndex={-1}
            dragHandleConfig={handleConfig}
            chevronIcon={chevronIcon}
            trailingAccessory={trailingAccessory}
            showIcon={showIcon}
            dragRef={dragRef}
            dragHandleRef={dragHandleRef}
            dragAttributes={dragAttributes}
            dragListeners={dragListeners}
            dragStyle={dragStyle}
            isSorting={isSorting}
        />
    );
}
