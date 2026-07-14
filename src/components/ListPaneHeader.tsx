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

import React, { useEffect, useMemo } from 'react';
import { Platform } from 'obsidian';
import { useSelectionState, useSelectionDispatch } from '../context/SelectionContext';
import { useCommandQueue, useServices } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import { useUIState, useUIDispatch } from '../context/UIStateContext';
import { strings } from '../i18n';
import { getIconService, useIconServiceVersion } from '../services/icons';
import { ServiceIcon } from './ServiceIcon';
import { useListActions } from '../hooks/useListActions';
import type { BreadcrumbSegment } from '../hooks/useListPaneTitle';
import { useSelectedFolderFileVersion } from '../hooks/useSelectedFolderFileVersion';
import { ItemType } from '../types';
import { getFolderNote, openFolderNoteFile } from '../utils/folderNotes';
import { resolveFolderNoteClickOpenContext } from '../utils/keyboardOpenContext';
import { normalizeTagPath } from '../utils/tagUtils';
import { runAsyncAction } from '../utils/async';
import { resolveUXIcon } from '../utils/uxIcons';
import type { ManualSortNewFilePlacementContext } from '../utils/manualSort';

interface ListPaneHeaderProps {
    onHeaderClick?: () => void;
    isSearchActive?: boolean;
    onSearchToggle?: () => void;
    onManualSortStart?: (propertyKey: string) => void;
    getManualSortNewFileContext?: () => ManualSortNewFilePlacementContext | null;
    actionsDisabled?: boolean;
    desktopTitle: string;
    breadcrumbSegments: BreadcrumbSegment[];
    iconName: string;
    showIcon: boolean;
}

export const ListPaneHeader = React.memo(function ListPaneHeader({
    onHeaderClick,
    isSearchActive,
    onSearchToggle,
    onManualSortStart,
    getManualSortNewFileContext,
    actionsDisabled = false,
    desktopTitle,
    breadcrumbSegments,
    iconName,
    showIcon
}: ListPaneHeaderProps) {
    const iconRef = React.useRef<HTMLSpanElement | null>(null);
    const { app, isMobile, plugin } = useServices();
    const commandQueue = useCommandQueue();
    const settings = useSettingsState();
    const uxPreferences = useUXPreferences();
    const includeDescendantNotes = uxPreferences.includeDescendantNotes;
    const selectionState = useSelectionState();
    const selectionDispatch = useSelectionDispatch();
    const uiState = useUIState();
    const uiDispatch = useUIDispatch();
    const listPaneTitlePreference = settings.listPaneTitle ?? 'header';
    const iconVersion = useIconServiceVersion();
    const listToolbarVisibility = settings.toolbarVisibility.list;
    const showRevealButton = listToolbarVisibility.reveal;

    // Use the shared actions hook
    const {
        handleNewFile,
        canCreateNewFile,
        handleRevealFile,
        canRevealFile,
        handleAppearanceMenu,
        handleSortMenu,
        handleToggleDescendants,
        descendantsTooltip,
        getSortIcon,
        hasAppearanceOrSortSelection,
        hasCustomSortOrGroup,
        hasCustomAppearance
    } = useListActions({
        onManualSortStart,
        getManualSortNewFileContext,
        trackRevealFileAvailability: !isMobile && showRevealButton
    });
    const showBackButton = listToolbarVisibility.back && uiState.singlePane;
    const showSearchButton = listToolbarVisibility.search;
    const showDescendantsButton = listToolbarVisibility.descendants;
    const showSortButton = listToolbarVisibility.sort;
    const showAppearanceButton = listToolbarVisibility.appearance;
    const showNewNoteButton = listToolbarVisibility.newNote;
    const hasNavigationSelection = Boolean(selectionState.selectedFolder || selectionState.selectedTag || selectionState.selectedProperty);

    const shouldRenderBreadcrumbSegments = isMobile;
    const shouldShowHeaderTitle = !isMobile && listPaneTitlePreference === 'header';
    const shouldShowHeaderIcon = shouldShowHeaderTitle && showIcon;
    const shouldRenderDesktopHeader =
        showBackButton ||
        shouldShowHeaderTitle ||
        showSearchButton ||
        showRevealButton ||
        showDescendantsButton ||
        showSortButton ||
        showAppearanceButton ||
        showNewNoteButton;

    const backIconId = useMemo(() => {
        return Platform.isAndroidApp ? 'arrow-left' : 'chevron-left';
    }, []);

    const sortIconId = useMemo(() => {
        return getSortIcon();
    }, [getSortIcon]);

    // Folder note interactions only apply when a folder is the active selection.
    const selectedFolder = selectionState.selectionType === ItemType.FOLDER ? selectionState.selectedFolder : null;
    // Folder note lookup is only needed when the title/breadcrumb is rendered.
    const shouldResolveSelectedFolderNote = shouldRenderBreadcrumbSegments || shouldShowHeaderTitle;
    // Tracks direct child file changes so folder note lookup recalculates when names move.
    const selectedFolderFileVersion = useSelectedFolderFileVersion(
        app.vault,
        selectedFolder,
        settings.enableFolderNotes && settings.enableFolderNoteLinks && shouldResolveSelectedFolderNote
    );
    // Resolves the selected folder's note file with current folder note settings.
    const selectedFolderNote = useMemo(() => {
        void selectedFolderFileVersion;

        if (!selectedFolder || !settings.enableFolderNotes || !settings.enableFolderNoteLinks || !shouldResolveSelectedFolderNote) {
            return null;
        }

        return getFolderNote(selectedFolder, {
            enableFolderNotes: settings.enableFolderNotes,
            folderNoteName: settings.folderNoteName,
            folderNoteNamePattern: settings.folderNoteNamePattern
        });
    }, [
        selectedFolder,
        settings.enableFolderNotes,
        settings.enableFolderNoteLinks,
        settings.folderNoteName,
        settings.folderNoteNamePattern,
        shouldResolveSelectedFolderNote,
        selectedFolderFileVersion
    ]);

    const handleSelectedFolderNoteClick = React.useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            if (!selectedFolder || !selectedFolderNote) {
                return;
            }

            // Prevents header click handlers from also running.
            event.stopPropagation();

            const openContext = resolveFolderNoteClickOpenContext(
                event,
                settings.folderNoteOpenLocation,
                settings.multiSelectModifier,
                isMobile
            );

            runAsyncAction(() =>
                openFolderNoteFile({
                    app,
                    commandQueue,
                    folder: selectedFolder,
                    folderNote: selectedFolderNote,
                    context: openContext,
                    openInRightSidebar: folderNote => plugin.openFolderNoteInRightSidebar(folderNote)
                })
            );
        },
        [
            selectedFolder,
            selectedFolderNote,
            settings.folderNoteOpenLocation,
            settings.multiSelectModifier,
            isMobile,
            app,
            commandQueue,
            plugin
        ]
    );

    const handleSelectedFolderNoteMouseDown = React.useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            if (event.button !== 1 || !selectedFolder || !selectedFolderNote) {
                return;
            }

            // Middle-click opens in a new tab and suppresses default browser behavior.
            event.preventDefault();
            event.stopPropagation();

            runAsyncAction(() =>
                openFolderNoteFile({
                    app,
                    commandQueue,
                    folder: selectedFolder,
                    folderNote: selectedFolderNote,
                    context: 'tab'
                })
            );
        },
        [selectedFolder, selectedFolderNote, app, commandQueue]
    );

    const breadcrumbContent = useMemo((): React.ReactNode => {
        if (!shouldRenderBreadcrumbSegments) {
            if (!selectedFolderNote) {
                return desktopTitle;
            }

            // Desktop header title becomes clickable when a folder note exists.
            return (
                <span
                    className="nn-pane-header-folder-note"
                    onClick={handleSelectedFolderNoteClick}
                    onMouseDown={handleSelectedFolderNoteMouseDown}
                >
                    {desktopTitle}
                </span>
            );
        }

        const parts: React.ReactNode[] = [];
        breadcrumbSegments.forEach((segment, index) => {
            const key = `${segment.label}-${index}`;
            // The last breadcrumb segment maps to the active selection.
            const isCurrentFolderNoteSegment = segment.isLast && Boolean(selectedFolderNote);

            if (segment.isLast || segment.targetType === 'none' || !segment.targetPath) {
                parts.push(
                    <span
                        key={key}
                        className={`nn-path-current${isCurrentFolderNoteSegment ? ' nn-pane-header-folder-note' : ''}`}
                        onClick={isCurrentFolderNoteSegment ? handleSelectedFolderNoteClick : undefined}
                        onMouseDown={isCurrentFolderNoteSegment ? handleSelectedFolderNoteMouseDown : undefined}
                    >
                        {segment.label}
                    </span>
                );
            } else {
                const handleClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (segment.targetType === 'folder') {
                        const targetPath = segment.targetPath;
                        const targetFolder = targetPath ? app.vault.getFolderByPath(targetPath) : null;
                        if (targetFolder) {
                            selectionDispatch({ type: 'SET_SELECTED_FOLDER', folder: targetFolder });
                        }
                    } else if (segment.targetType === 'tag' && segment.targetPath) {
                        selectionDispatch({ type: 'SET_SELECTED_TAG', tag: normalizeTagPath(segment.targetPath) });
                    } else if (segment.targetType === 'property' && segment.targetPath) {
                        selectionDispatch({ type: 'SET_SELECTED_PROPERTY', nodeId: segment.targetPath });
                    }
                };

                parts.push(
                    <span key={key} className="nn-path-segment" onClick={handleClick}>
                        {segment.label}
                    </span>
                );
            }

            if (!segment.isLast) {
                parts.push(
                    <span key={`${key}-separator`} className="nn-path-separator">
                        {' / '}
                    </span>
                );
            }
        });

        return parts;
    }, [
        app.vault,
        breadcrumbSegments,
        desktopTitle,
        selectionDispatch,
        shouldRenderBreadcrumbSegments,
        selectedFolderNote,
        handleSelectedFolderNoteClick,
        handleSelectedFolderNoteMouseDown
    ]);

    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
    const [showFade, setShowFade] = React.useState(false);

    // Renders the header icon when icon name or version changes
    useEffect(() => {
        if (!shouldShowHeaderIcon || !iconRef.current) {
            return;
        }

        const iconService = getIconService();
        iconService.renderIcon(iconRef.current, iconName);
    }, [iconName, iconVersion, shouldShowHeaderIcon]);

    // Auto-scroll to end when selection changes
    useEffect(() => {
        if (!isMobile) {
            setShowFade(false);
            return;
        }
        if (!scrollContainerRef.current) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({
                    left: scrollContainerRef.current.scrollWidth,
                    behavior: 'instant'
                });
            }
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [selectionState.selectedFolder, selectionState.selectedTag, selectionState.selectedProperty, isMobile]);

    // Updates fade gradient visibility based on scroll position
    const handleScroll = React.useCallback(() => {
        if (!isMobile) {
            return;
        }
        if (scrollContainerRef.current) {
            setShowFade(scrollContainerRef.current.scrollLeft > 0);
        }
    }, [isMobile]);

    if (isMobile) {
        // On mobile, show simplified header with back button and path - actions moved to tab bar
        return (
            <div className="nn-pane-header nn-pane-header-simple" onClick={onHeaderClick}>
                <div className="nn-mobile-header nn-mobile-header-no-icon">
                    <button
                        className="nn-icon-button nn-back-button"
                        aria-label={strings.paneHeader.mobileBackToNavigation}
                        data-pane-toggle="navigation"
                        onClick={e => {
                            e.stopPropagation();
                            uiDispatch({ type: 'ACTIVATE_PANE', target: 'navigation' });
                        }}
                        tabIndex={-1}
                    >
                        <ServiceIcon iconId={backIconId} aria-hidden={true} />
                    </button>
                    {showFade && <div className="nn-breadcrumb-fade" />}
                    <div ref={scrollContainerRef} className="nn-breadcrumb-scroll" onScroll={handleScroll}>
                        <span className="nn-mobile-title">{breadcrumbContent}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!shouldRenderDesktopHeader) {
        return null;
    }

    return (
        <div className="nn-pane-header">
            <div className="nn-header-actions nn-header-actions--space-between">
                {showBackButton ? (
                    <button
                        className="nn-icon-button"
                        data-pane-toggle="navigation"
                        onClick={() => {
                            uiDispatch({ type: 'ACTIVATE_PANE', target: 'navigation' });
                        }}
                        aria-label={strings.paneHeader.showFolders}
                        tabIndex={-1}
                    >
                        <ServiceIcon iconId={backIconId} aria-hidden={true} />
                    </button>
                ) : null}
                <span className="nn-pane-header-title">
                    {shouldShowHeaderIcon && <span ref={iconRef} className="nn-pane-header-icon" />}
                    {shouldShowHeaderTitle && <span className="nn-pane-header-text">{breadcrumbContent}</span>}
                </span>
                <div className="nn-header-actions">
                    {showSearchButton ? (
                        <button
                            className={`nn-icon-button ${isSearchActive ? 'nn-icon-button-active' : ''}`}
                            aria-label={strings.paneHeader.search}
                            onClick={onSearchToggle}
                            disabled={actionsDisabled || !hasNavigationSelection}
                            tabIndex={-1}
                        >
                            <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'list-search')} />
                        </button>
                    ) : null}
                    {showRevealButton ? (
                        <button
                            className="nn-icon-button"
                            aria-label={strings.commands.revealFile}
                            onClick={() => {
                                runAsyncAction(() => handleRevealFile());
                            }}
                            disabled={actionsDisabled || !canRevealFile}
                            tabIndex={-1}
                        >
                            <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'list-reveal-file')} />
                        </button>
                    ) : null}
                    {showDescendantsButton ? (
                        <button
                            className={`nn-icon-button ${includeDescendantNotes ? 'nn-icon-button-active' : ''}`}
                            aria-label={descendantsTooltip}
                            onClick={handleToggleDescendants}
                            disabled={actionsDisabled || !hasNavigationSelection}
                            tabIndex={-1}
                        >
                            <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'list-descendants')} />
                        </button>
                    ) : null}
                    {showSortButton ? (
                        <button
                            className={`nn-icon-button ${hasCustomSortOrGroup ? 'nn-icon-button-active' : ''}`}
                            aria-label={strings.paneHeader.changeSortAndGroup}
                            onClick={handleSortMenu}
                            disabled={actionsDisabled || !hasAppearanceOrSortSelection}
                            tabIndex={-1}
                        >
                            <ServiceIcon iconId={sortIconId} />
                        </button>
                    ) : null}
                    {showAppearanceButton ? (
                        <button
                            className={`nn-icon-button ${hasCustomAppearance ? 'nn-icon-button-active' : ''}`}
                            aria-label={strings.paneHeader.changeAppearance}
                            onClick={handleAppearanceMenu}
                            disabled={actionsDisabled || !hasAppearanceOrSortSelection}
                            tabIndex={-1}
                        >
                            <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'list-appearance')} />
                        </button>
                    ) : null}
                    {showNewNoteButton ? (
                        <button
                            className="nn-icon-button"
                            aria-label={strings.paneHeader.newNote}
                            onClick={() => {
                                runAsyncAction(() => handleNewFile());
                            }}
                            disabled={actionsDisabled || !canCreateNewFile}
                            tabIndex={-1}
                        >
                            <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'list-new-note')} />
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
});
