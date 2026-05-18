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

import { useSelectionState } from '../context/SelectionContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import { strings } from '../i18n';
import { ServiceIcon } from './ServiceIcon';
import { useListActions } from '../hooks/useListActions';
import { runAsyncAction } from '../utils/async';
import { resolveUXIcon } from '../utils/uxIcons';
import type { ManualSortNewFilePlacementContext } from '../utils/manualSort';

interface ListToolbarProps {
    isSearchActive?: boolean;
    onSearchToggle?: () => void;
    onManualSortStart?: (propertyKey: string) => void;
    getManualSortNewFileContext?: () => ManualSortNewFilePlacementContext | null;
    useFloatingLayout?: boolean;
}

export function ListToolbar({
    isSearchActive,
    onSearchToggle,
    onManualSortStart,
    getManualSortNewFileContext,
    useFloatingLayout = false
}: ListToolbarProps) {
    const uxPreferences = useUXPreferences();
    const includeDescendantNotes = uxPreferences.includeDescendantNotes;
    const selectionState = useSelectionState();
    const settings = useSettingsState();
    const listVisibility = settings.toolbarVisibility.list;

    // Use the shared actions hook
    const {
        handleNewFile,
        canCreateNewFile,
        handleAppearanceMenu,
        handleSortMenu,
        handleToggleDescendants,
        descendantsTooltip,
        getSortIcon,
        hasAppearanceOrSortSelection,
        hasCustomSortOrGroup,
        hasCustomAppearance
    } = useListActions({ onManualSortStart, getManualSortNewFileContext });

    const showSearchButton = listVisibility.search;
    const showDescendantsButton = listVisibility.descendants;
    const showSortButton = listVisibility.sort;
    const showAppearanceButton = listVisibility.appearance;
    const showNewNoteButton = listVisibility.newNote;
    const hasNavigationSelection = Boolean(selectionState.selectedFolder || selectionState.selectedTag || selectionState.selectedProperty);

    const leftButtonCount = [showSearchButton, showDescendantsButton, showSortButton, showAppearanceButton].filter(Boolean).length;
    const totalButtonCount = leftButtonCount + (showNewNoteButton ? 1 : 0);
    const leftGroupClassName = leftButtonCount === 1 ? 'nn-mobile-toolbar-circle' : 'nn-mobile-toolbar-pill';
    const leftButtonBaseClassName =
        leftButtonCount === 1 ? 'nn-mobile-toolbar-button nn-mobile-toolbar-button-circle' : 'nn-mobile-toolbar-button';

    if (totalButtonCount === 0) {
        return null;
    }

    const leftButtons = [
        showSearchButton ? (
            <button
                key="search"
                className={`${leftButtonBaseClassName}${isSearchActive ? ' nn-mobile-toolbar-button-active' : ''}`}
                aria-label={strings.paneHeader.search}
                onClick={onSearchToggle}
                disabled={!hasNavigationSelection}
                tabIndex={-1}
            >
                <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'list-search')} />
            </button>
        ) : null,
        showDescendantsButton ? (
            <button
                key="descendants"
                className={`${leftButtonBaseClassName}${includeDescendantNotes ? ' nn-mobile-toolbar-button-active' : ''}`}
                aria-label={descendantsTooltip}
                onClick={handleToggleDescendants}
                disabled={!hasNavigationSelection}
                tabIndex={-1}
            >
                <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'list-descendants')} />
            </button>
        ) : null,
        showSortButton ? (
            <button
                key="sort"
                className={`${leftButtonBaseClassName}${hasCustomSortOrGroup ? ' nn-mobile-toolbar-button-active' : ''}`}
                aria-label={strings.paneHeader.changeSortAndGroup}
                onClick={handleSortMenu}
                disabled={!hasAppearanceOrSortSelection}
                tabIndex={-1}
            >
                <ServiceIcon iconId={getSortIcon()} />
            </button>
        ) : null,
        showAppearanceButton ? (
            <button
                key="appearance"
                className={`${leftButtonBaseClassName}${hasCustomAppearance ? ' nn-mobile-toolbar-button-active' : ''}`}
                aria-label={strings.paneHeader.changeAppearance}
                onClick={handleAppearanceMenu}
                disabled={!hasAppearanceOrSortSelection}
                tabIndex={-1}
            >
                <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'list-appearance')} />
            </button>
        ) : null
    ].filter(Boolean);
    const newNoteButton = showNewNoteButton ? (
        <button
            key="new-note"
            className="nn-mobile-toolbar-button nn-mobile-toolbar-button-circle"
            aria-label={strings.paneHeader.newNote}
            onClick={() => {
                runAsyncAction(() => handleNewFile());
            }}
            disabled={!canCreateNewFile}
            tabIndex={-1}
        >
            <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'list-new-note')} />
        </button>
    ) : null;

    if (!useFloatingLayout) {
        return (
            <div className="nn-mobile-toolbar">
                {leftButtons}
                {newNoteButton}
            </div>
        );
    }

    return (
        <div className="nn-mobile-toolbar">
            <div className="nn-mobile-toolbar-left">
                {leftButtonCount > 0 ? <div className={leftGroupClassName}>{leftButtons}</div> : null}
            </div>

            {showNewNoteButton ? (
                <div className="nn-mobile-toolbar-right">
                    <div className="nn-mobile-toolbar-circle">{newNoteButton}</div>
                </div>
            ) : null}
        </div>
    );
}
