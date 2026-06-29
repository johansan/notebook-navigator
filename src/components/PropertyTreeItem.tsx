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

import React, { forwardRef, useMemo, useCallback, useEffect, useRef, useImperativeHandle } from 'react';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import { useContextMenu } from '../hooks/useContextMenu';
import { getIconService, useIconServiceVersion } from '../services/icons';
import { ItemType, type CSSPropertiesWithVars } from '../types';
import type { NoteCountInfo } from '../types/noteCounts';
import type { PropertyTreeNode } from '../types/storage';
import { buildNoteCountDisplay, buildSortableNoteCountDisplay } from '../utils/noteCountFormatting';
import { buildSearchMatchContentClass } from '../utils/searchHighlight';
import type { InclusionOperator } from '../utils/filterSearch';
import { resolveUXIcon } from '../utils/uxIcons';
import { IndentGuideColumns } from './IndentGuideColumns';
import { ObsidianIcon } from './ObsidianIcon';
import { InlineRenameInput, type InlineRenameControl } from './InlineRenameInput';

interface PropertyTreeItemProps {
    propertyNode: PropertyTreeNode;
    level: number;
    indentGuideLevels?: number[];
    isExpanded: boolean;
    isSelected: boolean;
    onToggle: () => void;
    onClick: (event: React.MouseEvent) => void;
    onToggleAllSiblings?: () => void;
    countInfo?: NoteCountInfo;
    showFileCount: boolean;
    color?: string;
    backgroundColor?: string;
    adjacentFilledClassName?: string;
    icon?: string;
    searchMatch?: 'include' | 'exclude';
    inclusionOperator?: InclusionOperator;
    isDraggable: boolean;
    inlineRename?: InlineRenameControl;
}

export const PropertyTreeItem = React.memo(
    forwardRef<HTMLDivElement, PropertyTreeItemProps>(function PropertyTreeItem(
        {
            propertyNode,
            level,
            indentGuideLevels,
            isExpanded,
            isSelected,
            onToggle,
            onClick,
            onToggleAllSiblings,
            countInfo,
            showFileCount,
            color,
            backgroundColor,
            adjacentFilledClassName,
            icon,
            searchMatch,
            inclusionOperator,
            isDraggable,
            inlineRename
        },
        ref
    ) {
        const settings = useSettingsState();
        const uxPreferences = useUXPreferences();
        const includeDescendantNotes = uxPreferences.includeDescendantNotes;
        const chevronRef = useRef<HTMLDivElement | null>(null);
        const iconRef = useRef<HTMLSpanElement | null>(null);
        const iconVersion = useIconServiceVersion();
        const itemRef = useRef<HTMLDivElement | null>(null);

        const resolvedCounts = useMemo<NoteCountInfo>(() => {
            if (countInfo) {
                return countInfo;
            }
            const current = propertyNode.notesWithValue.size;
            return { current, descendants: 0, total: current };
        }, [countInfo, propertyNode.notesWithValue.size]);

        const propertyTreeSortOverrides = settings.propertyTreeSortOverrides;
        const hasChildSortOrderOverride =
            propertyNode.kind === 'key' &&
            Boolean(propertyTreeSortOverrides && Object.prototype.hasOwnProperty.call(propertyTreeSortOverrides, propertyNode.id));
        const childSortOrderOverride = hasChildSortOrderOverride ? propertyTreeSortOverrides?.[propertyNode.id] : undefined;
        const sortOrderIndicator = childSortOrderOverride === 'alpha-desc' ? '↓' : childSortOrderOverride === 'alpha-asc' ? '↑' : undefined;

        const useSeparateCounts = includeDescendantNotes && settings.separateNoteCounts;
        const noteCountDisplay = buildSortableNoteCountDisplay(
            buildNoteCountDisplay(resolvedCounts, includeDescendantNotes, useSeparateCounts, '•'),
            sortOrderIndicator
        );
        const noteCountLabel = noteCountDisplay.label;
        const shouldDisplayCount = showFileCount && noteCountDisplay.shouldDisplay;
        const operatorIconName =
            inclusionOperator === 'OR' ? 'lucide-squares-unite' : inclusionOperator === 'AND' ? 'lucide-squares-intersect' : null;
        const shouldDisplayOperatorIndicator = searchMatch === 'include' && operatorIconName !== null;
        const hasChildren = useMemo(() => propertyNode.children.size > 0, [propertyNode.children.size]);
        const applyColorToName = Boolean(color) && !settings.colorIconOnly;
        const dragFallbackIconId = useMemo(() => {
            return propertyNode.kind === 'value'
                ? resolveUXIcon(settings.interfaceIcons, 'nav-property-value')
                : resolveUXIcon(settings.interfaceIcons, 'nav-property');
        }, [propertyNode.kind, settings.interfaceIcons]);
        const dragIconId = icon ?? dragFallbackIconId;
        const dragBaseIconId = propertyNode.kind === 'value' ? 'equal' : 'align-left';

        const className = useMemo(() => {
            const classes = ['nn-navitem', 'nn-property'];
            if (isSelected) {
                classes.push('nn-selected');
            }
            if (backgroundColor) {
                classes.push('nn-has-custom-background');
            }
            if (searchMatch) {
                classes.push('nn-has-search-match');
            }
            if (adjacentFilledClassName) {
                classes.push(adjacentFilledClassName);
            }
            return classes.join(' ');
        }, [adjacentFilledClassName, backgroundColor, isSelected, searchMatch]);

        const propertyNameClassName = useMemo(() => {
            const classes = ['nn-navitem-name'];
            if (applyColorToName) {
                classes.push('nn-has-custom-color');
            }
            return classes.join(' ');
        }, [applyColorToName]);

        const contentClassName = useMemo(() => buildSearchMatchContentClass(['nn-navitem-content'], searchMatch), [searchMatch]);

        const handleDoubleClick = useCallback(
            (event: React.MouseEvent) => {
                event.preventDefault();
                if (hasChildren) {
                    onToggle();
                }
            },
            [hasChildren, onToggle]
        );

        const handleChevronClick = useCallback(
            (event: React.MouseEvent) => {
                event.stopPropagation();
                if (!hasChildren) {
                    return;
                }

                if (event.altKey && onToggleAllSiblings) {
                    onToggleAllSiblings();
                    return;
                }

                onToggle();
            },
            [hasChildren, onToggle, onToggleAllSiblings]
        );

        const handleChevronDoubleClick = useCallback((event: React.MouseEvent) => {
            event.stopPropagation();
            event.preventDefault();
        }, []);

        useEffect(() => {
            if (!chevronRef.current) {
                return;
            }

            if (!hasChildren) {
                chevronRef.current.empty();
                return;
            }

            chevronRef.current.empty();
            getIconService().renderIcon(
                chevronRef.current,
                resolveUXIcon(settings.interfaceIcons, isExpanded ? 'nav-tree-collapse' : 'nav-tree-expand')
            );
        }, [hasChildren, iconVersion, isExpanded, settings.interfaceIcons]);

        useEffect(() => {
            if (!iconRef.current || !settings.showPropertyIcons) {
                return;
            }

            iconRef.current.empty();
            const iconId =
                icon ??
                (propertyNode.kind === 'value'
                    ? resolveUXIcon(settings.interfaceIcons, 'nav-property-value')
                    : resolveUXIcon(settings.interfaceIcons, 'nav-property'));
            getIconService().renderIcon(iconRef.current, iconId);
        }, [icon, iconVersion, propertyNode.kind, settings.interfaceIcons, settings.showPropertyIcons]);

        useImperativeHandle(ref, () => itemRef.current as HTMLDivElement);

        useContextMenu(itemRef, {
            type: ItemType.PROPERTY,
            item: propertyNode.id
        });

        const propertyStyle: CSSPropertiesWithVars = {
            '--level': level,
            ...(backgroundColor ? { '--nn-navitem-custom-bg-color': backgroundColor } : {})
        };

        return (
            <div
                ref={itemRef}
                className={className}
                data-property-node={propertyNode.id}
                // Property node id used as drag source identifier
                data-drag-path={propertyNode.id}
                // Identifies element as a property node for drag operations
                data-drag-type="property"
                // Marks element as draggable for drag handler filtering
                data-draggable={isDraggable ? 'true' : undefined}
                // Icon displayed in drag preview
                data-drag-icon={dragIconId}
                // Default icon displayed if the custom drag preview icon is unavailable
                data-drag-fallback-icon={dragFallbackIconId}
                // Built-in icon displayed if the configured fallback icon is unavailable
                data-drag-base-icon={dragBaseIconId}
                // Optional color applied to drag preview icon
                data-drag-icon-color={color || undefined}
                // Enable native drag and drop when not on mobile
                draggable={isDraggable}
                data-drop-zone="property"
                data-drop-path={propertyNode.id}
                data-allow-external-drop="false"
                data-search-match={searchMatch ?? undefined}
                data-level={level}
                style={propertyStyle}
                role="treeitem"
                aria-expanded={hasChildren ? isExpanded : undefined}
                aria-level={level + 1}
            >
                <div className={contentClassName} onClick={onClick} onDoubleClick={handleDoubleClick}>
                    <IndentGuideColumns levels={indentGuideLevels} />
                    <div
                        ref={chevronRef}
                        className={`nn-navitem-chevron ${hasChildren ? 'nn-navitem-chevron--has-children' : 'nn-navitem-chevron--no-children'}`}
                        onClick={handleChevronClick}
                        onDoubleClick={handleChevronDoubleClick}
                        tabIndex={-1}
                    />
                    {settings.showPropertyIcons && <span className="nn-navitem-icon" ref={iconRef} style={color ? { color } : undefined} />}
                    {inlineRename ? (
                        <InlineRenameInput {...inlineRename} className="nn-navitem-inline-rename" />
                    ) : (
                        <span className={propertyNameClassName} style={applyColorToName ? { color } : undefined}>
                            {propertyNode.name}
                        </span>
                    )}
                    <span className="nn-navitem-spacer nn-navitem-spacer--leader" />
                    {shouldDisplayOperatorIndicator ? (
                        <span className="nn-navitem-count nn-navitem-operator-indicator" data-operator={inclusionOperator}>
                            <ObsidianIcon name={operatorIconName} className="nn-navitem-operator-icon" aria-hidden={true} />
                        </span>
                    ) : shouldDisplayCount ? (
                        <span className="nn-navitem-count">{noteCountLabel}</span>
                    ) : null}
                </div>
            </div>
        );
    })
);
