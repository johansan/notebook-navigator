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

import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import { useSettingsState } from '../context/SettingsContext';
import { getIconService, useIconServiceVersion } from '../services/icons';
import type { ItemType } from '../types';
import type { ListReorderHandlers } from '../types/listReorder';
import { ObsidianIcon } from './ObsidianIcon';
import { Platform, setIcon, setTooltip } from 'obsidian';
import { getTooltipPlacement } from '../utils/domUtils';

/**
 * Configuration for the drag handle element that appears in reorderable rows
 */
export interface DragHandleConfig {
    only?: boolean; // If true, only the handle is draggable, not the entire row
    disabled?: boolean; // Disables drag functionality
    visible?: boolean; // Controls visibility of the drag handle
    icon?: string; // Custom icon for the drag handle
    interactive?: boolean; // Forces interactive styling even when drag is disabled
    events?: {
        // Event handlers for click and context menu on the drag handle
        onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
        onContextMenu?: (event: React.MouseEvent<HTMLSpanElement>) => void;
    };
}

export interface NativeDragData {
    path: string;
    type: ItemType;
    icon?: string;
    iconColor?: string;
    allowMultiFileDrag?: boolean;
}

/**
 * Props for a navigation list row component that supports icons, counts, trailing accessories, and drag-and-drop reordering
 */
interface NavigationListRowProps {
    icon: string;
    color?: string;
    backgroundColor?: string;
    label: string;
    description?: string;
    level: number;
    itemType: string;
    role?: 'treeitem' | 'listitem';
    tabIndex?: number;
    ariaDisabled?: boolean;
    isDisabled?: boolean;
    isExcluded?: boolean;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onMouseDown?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void;
    dragHandlers?: ListReorderHandlers;
    isDragSource?: boolean;
    showCount?: boolean;
    count?: number | string;
    countSlot?: React.ReactNode;
    dragHandleConfig?: DragHandleConfig;
    className?: string;
    chevronIcon?: string;
    labelClassName?: string;
    onLabelClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
    onLabelMouseDown?: (event: React.MouseEvent<HTMLSpanElement>) => void;
    trailingAccessory?: React.ReactNode;
    showIcon?: boolean;
    tooltip?: string;
    dragRef?: (node: HTMLDivElement | null) => void;
    dragHandleRef?: (node: HTMLSpanElement | null) => void;
    dragAttributes?: React.HTMLAttributes<HTMLElement>;
    dragListeners?: DraggableSyntheticListeners;
    dragStyle?: CSSProperties;
    isSorting?: boolean;
    nativeDragData?: NativeDragData;
}

/**
 * Renders a navigation list row with support for icons, counts, trailing accessories, and drag-and-drop reordering.
 * Used for displaying items in navigation panes like shortcuts, tags, and folders.
 */
export function NavigationListRow({
    icon,
    color,
    backgroundColor,
    label,
    level,
    itemType,
    description,
    isDisabled,
    isExcluded,
    onClick,
    onMouseDown,
    onContextMenu,
    dragHandlers,
    isDragSource,
    showCount,
    count,
    countSlot,
    dragHandleConfig,
    className,
    chevronIcon,
    role = 'treeitem',
    tabIndex,
    ariaDisabled,
    labelClassName,
    onLabelClick,
    onLabelMouseDown,
    trailingAccessory,
    showIcon = true,
    tooltip,
    dragRef,
    dragHandleRef,
    dragAttributes,
    dragListeners,
    dragStyle,
    isSorting,
    nativeDragData
}: NavigationListRowProps) {
    const settings = useSettingsState();
    const rowRef = useRef<HTMLDivElement | null>(null);
    const chevronRef = useRef<HTMLSpanElement | null>(null);
    const iconRef = useRef<HTMLSpanElement | null>(null);
    const iconVersion = useIconServiceVersion();

    // Determine whether to apply color to the label text instead of the icon
    const applyColorToLabel = Boolean(color) && !settings.colorIconOnly;

    // Compute CSS style for label with color when colorIconOnly is disabled
    const labelStyle = useMemo(() => {
        return applyColorToLabel && color ? { color } : undefined;
    }, [applyColorToLabel, color]);

    // Builds CSS class names based on component state (disabled, excluded, dragging, etc.)
    const classes = useMemo(() => {
        const classList = ['nn-navitem', 'nn-drag-item'];
        if (className) {
            classList.push(className);
        }
        if (isDisabled) {
            classList.push('nn-shortcut-disabled');
        }
        if (isExcluded) {
            classList.push('nn-excluded');
        }
        if (dragHandleConfig?.visible) {
            classList.push('nn-drag-item-has-handle');
        }
        if (backgroundColor) {
            classList.push('nn-has-custom-background');
        }
        return classList.join(' ');
    }, [backgroundColor, className, dragHandleConfig?.visible, isDisabled, isExcluded]);

    // Builds CSS classes for the label element, combining base class with optional custom class
    const labelClasses = useMemo(() => {
        const classList = ['nn-navitem-name'];
        if (labelClassName) {
            classList.push(labelClassName);
        }
        if (applyColorToLabel && color) {
            classList.push('nn-has-custom-color');
        }
        return classList.join(' ');
    }, [applyColorToLabel, color, labelClassName]);

    // Renders chevron icon when provided, clearing it for rows without chevrons
    useEffect(() => {
        if (!chevronRef.current) {
            return;
        }

        if (!chevronIcon) {
            chevronRef.current.empty();
            return;
        }

        chevronRef.current.empty();
        setIcon(chevronRef.current, chevronIcon);
    }, [chevronIcon]);

    // Renders icon using Obsidian's icon service, clearing it if icons are disabled in settings
    useEffect(() => {
        if (!iconRef.current) {
            return;
        }

        if (!showIcon) {
            iconRef.current.textContent = '';
            return;
        }

        const iconService = getIconService();
        iconService.renderIcon(iconRef.current, icon);
    }, [icon, iconVersion, showIcon]);

    // Determines drag and drop behavior based on handlers and configuration
    // Supports both full-row dragging and handle-only dragging modes
    const hasDndKitListeners = Boolean(dragListeners);
    const handleVisible = Boolean(dragHandleConfig?.visible);
    const handleOnly = dragHandleConfig?.only === true;
    const handleDisabled = dragHandleConfig?.disabled === true;
    const handleAllowsDrag = handleVisible && !handleDisabled && hasDndKitListeners;
    const handleLooksInteractive = handleAllowsDrag || dragHandleConfig?.interactive === true;
    const handleOnlyActive = handleOnly && hasDndKitListeners;
    const bindToHandle = handleOnlyActive;
    // Check if count has a valid value - supports both numeric counts and string labels
    const hasCountValue = typeof count === 'number' ? count > 0 : typeof count === 'string' ? count.length > 0 : false;
    const hasCountSlot = countSlot !== undefined && countSlot !== null;
    // Determine if count badge should be displayed based on settings and valid count content
    const shouldShowCount = Boolean(showCount && (hasCountValue || hasCountSlot));

    // Handles click events on the label element, preventing event propagation to parent row
    const handleLabelClick = useCallback(
        (event: React.MouseEvent<HTMLSpanElement>) => {
            if (!onLabelClick) {
                return;
            }
            event.stopPropagation();
            onLabelClick(event);
        },
        [onLabelClick]
    );

    const handleLabelMouseDown = useCallback(
        (event: React.MouseEvent<HTMLSpanElement>) => {
            if (!onLabelMouseDown) {
                return;
            }
            event.stopPropagation();
            onLabelMouseDown(event);
        },
        [onLabelMouseDown]
    );

    const rowStyle = useMemo(() => {
        if (!backgroundColor) {
            return { '--level': level } as CSSProperties;
        }
        return {
            '--level': level,
            '--nn-navitem-custom-bg-color': backgroundColor
        } as CSSProperties;
    }, [backgroundColor, level]);

    const combinedRowStyle = useMemo(() => {
        if (!dragStyle) {
            return rowStyle;
        }
        return { ...rowStyle, ...dragStyle };
    }, [dragStyle, rowStyle]);

    const rowDragAttributes = useMemo(() => {
        if (!dragAttributes) {
            return undefined;
        }
        const { role: _role, tabIndex: _tabIndex, ...rest } = dragAttributes;
        void _role;
        void _tabIndex;
        return rest;
    }, [dragAttributes]);

    const setRowRef = useCallback(
        (node: HTMLDivElement | null) => {
            rowRef.current = node;
            if (dragRef) {
                dragRef(node);
            }
        },
        [dragRef]
    );

    useEffect(() => {
        const row = rowRef.current;
        if (!row) {
            return;
        }

        if (Platform.isMobile || !settings.showTooltips || !tooltip) {
            setTooltip(row, '');
            return;
        }

        setTooltip(row, tooltip, {
            placement: getTooltipPlacement()
        });
    }, [settings.showTooltips, tooltip]);

    const setHandleRef = useCallback(
        (node: HTMLSpanElement | null) => {
            if (dragHandleRef) {
                dragHandleRef(node);
            }
        },
        [dragHandleRef]
    );

    const handleActive = isDragSource || isSorting;
    const isNativeDraggable = Boolean(nativeDragData?.path);

    return (
        <div
            ref={setRowRef}
            className={classes}
            role={role}
            tabIndex={tabIndex}
            aria-disabled={ariaDisabled || undefined}
            data-nav-item-type={itemType}
            data-nav-item-disabled={isDisabled ? 'true' : undefined}
            data-nav-item-excluded={isExcluded ? 'true' : undefined}
            data-nav-item-level={level}
            data-drag-path={nativeDragData?.path}
            data-drag-type={nativeDragData?.type}
            data-draggable={isNativeDraggable ? 'true' : undefined}
            data-drag-icon={nativeDragData?.icon}
            data-drag-icon-color={nativeDragData?.iconColor}
            data-drag-allow-multi-file={nativeDragData?.allowMultiFileDrag === false ? 'false' : undefined}
            data-level={level}
            aria-level={level + 1}
            draggable={isNativeDraggable || undefined}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onContextMenu={onContextMenu}
            onDragOver={dragHandlers?.onDragOver}
            onDragLeave={dragHandlers?.onDragLeave}
            onDrop={dragHandlers?.onDrop}
            style={combinedRowStyle}
            {...(!bindToHandle ? rowDragAttributes : undefined)}
            {...(!bindToHandle ? dragListeners : undefined)}
        >
            <div className="nn-navitem-content">
                <span
                    ref={chevronRef}
                    className={`nn-navitem-chevron${chevronIcon ? '' : ' nn-navitem-chevron--no-children'}`}
                    aria-hidden="true"
                />
                {showIcon ? (
                    <span
                        ref={iconRef}
                        className="nn-navitem-icon"
                        aria-hidden="true"
                        data-has-color={color ? 'true' : 'false'}
                        style={color ? { color } : undefined}
                    />
                ) : null}
                <span
                    className={labelClasses}
                    onClick={onLabelClick ? handleLabelClick : undefined}
                    onMouseDown={onLabelMouseDown ? handleLabelMouseDown : undefined}
                >
                    <span className="nn-shortcut-label" data-has-color={applyColorToLabel ? 'true' : undefined} style={labelStyle}>
                        {label}
                    </span>
                    {description ? <span className="nn-shortcut-description">{description}</span> : null}
                </span>
                <span className="nn-navitem-spacer" />
                {shouldShowCount ? (countSlot ?? <span className="nn-navitem-count">{count}</span>) : null}
                {trailingAccessory ? <div className="nn-navitem-accessory">{trailingAccessory}</div> : null}
                {handleVisible ? (
                    <span
                        className={`nn-drag-handle${handleLooksInteractive ? '' : ' nn-drag-handle-disabled'}${
                            handleActive ? ' nn-drag-handle-active' : ''
                        }`}
                        role="button"
                        tabIndex={-1}
                        ref={setHandleRef}
                        onClick={dragHandleConfig?.events?.onClick}
                        onContextMenu={dragHandleConfig?.events?.onContextMenu}
                        {...(bindToHandle ? dragAttributes : undefined)}
                        {...(bindToHandle ? dragListeners : undefined)}
                    >
                        <ObsidianIcon name={dragHandleConfig?.icon ?? 'lucide-grip-horizontal'} />
                    </span>
                ) : null}
            </div>
        </div>
    );
}
