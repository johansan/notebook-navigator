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

import React from 'react';
import { useSelectionState } from '../context/SelectionContext';
import { useServices } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferenceActions, useUXPreferences } from '../context/UXPreferencesContext';
import { useUIState } from '../context/UIStateContext';
import { useVaultProfileMenu } from '../hooks/useVaultProfileMenu';
import { strings } from '../i18n';
import { ServiceIcon } from './ServiceIcon';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { runAsyncAction } from '../utils/async';
import { showNotice } from '../utils/noticeUtils';
import { usesMobileChrome } from '../utils/paneLayout';
import { resolveUXIcon } from '../utils/uxIcons';

interface NavigationPaneHeaderProps {
    onTreeUpdateComplete?: () => void;
    onToggleRootFolderReorder?: () => void;
    rootReorderActive?: boolean;
    rootReorderDisabled?: boolean;
    showVaultTitleInHeader: boolean;
}

export const NavigationPaneHeader = React.memo(function NavigationPaneHeader({
    onTreeUpdateComplete,
    onToggleRootFolderReorder,
    rootReorderActive,
    rootReorderDisabled,
    showVaultTitleInHeader
}: NavigationPaneHeaderProps) {
    const { plugin } = useServices();
    const settings = useSettingsState();
    const uxPreferences = useUXPreferences();
    const { toggleShowCalendar } = useUXPreferenceActions();
    const showHiddenItems = uxPreferences.showHiddenItems;
    const isCalendarVisible = uxPreferences.showCalendar;
    const uiState = useUIState();
    const selectionState = useSelectionState();
    const { hasProfiles, hasMultipleProfiles, activeProfileName, handleTriggerClick, handleTriggerKeyDown } = useVaultProfileMenu({
        plugin,
        vaultProfiles: settings.vaultProfiles ?? [],
        activeProfileId: settings.vaultProfile
    });

    // Hook providing shared navigation actions (expand/collapse, folder creation, toggle visibility)
    const { shouldCollapseItems, handleExpandCollapseAll, handleNewFolder, handleToggleShowExcludedFolders } = useNavigationActions();
    const navigationVisibility = settings.toolbarVisibility.navigation;
    // Mobile chrome (profile-only header, actions in the tab bar) applies to phones only.
    // Tablets render the desktop header in both pane layouts so the toolbars stay at the
    // top when switching between single and dual pane.
    const useMobileChrome = usesMobileChrome();
    const showToggleDualPaneButton = navigationVisibility.toggleDualPane;
    const showExpandCollapseButton = navigationVisibility.expandCollapse;
    const showCalendarButton = navigationVisibility.calendar && settings.calendarEnabled && settings.calendarPlacement !== 'right-sidebar';
    const showHiddenItemsButton = navigationVisibility.hiddenItems;
    const showRootReorderButton = navigationVisibility.rootReorder;
    const showNewFolderButton = navigationVisibility.newFolder;

    if (!hasProfiles) {
        return null;
    }

    // Clickable element that displays the active profile name and opens the profile menu on interaction
    const shouldRenderProfileTrigger = hasMultipleProfiles && (useMobileChrome || showVaultTitleInHeader);
    const profileTriggerContent = (
        <>
            <span className="nn-pane-header-text">{activeProfileName}</span>
            <ServiceIcon
                className="nn-pane-header-profile-chevron"
                iconId={resolveUXIcon(settings.interfaceIcons, 'nav-profile-chevron')}
                aria-hidden={true}
            />
        </>
    );
    const profileTrigger = shouldRenderProfileTrigger ? (
        useMobileChrome ? (
            <div
                className="nn-pane-header-title nn-pane-header-profile"
                aria-label={strings.navigationPane.profileMenuAria}
                role="button"
                tabIndex={0}
                onClick={handleTriggerClick}
                onKeyDown={handleTriggerKeyDown}
            >
                {profileTriggerContent}
            </div>
        ) : (
            <div className="nn-pane-header-title nn-pane-header-profile">
                <div
                    className="nn-pane-header-profile"
                    aria-label={strings.navigationPane.profileMenuAria}
                    role="button"
                    tabIndex={0}
                    onClick={handleTriggerClick}
                    onKeyDown={handleTriggerKeyDown}
                >
                    {profileTriggerContent}
                </div>
            </div>
        )
    ) : null;

    if (useMobileChrome) {
        if (!profileTrigger) {
            return null;
        }
        return <div className="nn-pane-header nn-pane-header-simple">{profileTrigger}</div>;
    }

    const shouldRenderDesktopHeader =
        Boolean(profileTrigger) ||
        showToggleDualPaneButton ||
        showExpandCollapseButton ||
        showHiddenItemsButton ||
        showCalendarButton ||
        showRootReorderButton ||
        showNewFolderButton;

    if (!shouldRenderDesktopHeader) {
        return null;
    }

    const dualPanePreference = plugin.useDualPane();
    const dualPaneAutoFallbackActive = dualPanePreference && uiState.singlePane;

    return (
        <div className="nn-pane-header">
            <div className="nn-header-actions nn-header-actions--space-between">
                <div className="nn-header-actions nn-header-actions-profile">
                    {showToggleDualPaneButton ? (
                        <button
                            className="nn-icon-button"
                            aria-label={dualPanePreference ? strings.paneHeader.showSinglePane : strings.paneHeader.showDualPane}
                            onClick={() => {
                                if (dualPaneAutoFallbackActive) {
                                    showNotice(strings.paneHeader.dualPaneAutoFallbackNotice, { variant: 'warning' });
                                    return;
                                }
                                plugin.setDualPanePreference(!dualPanePreference);
                            }}
                            tabIndex={-1}
                            type="button"
                        >
                            <ServiceIcon
                                iconId={resolveUXIcon(
                                    settings.interfaceIcons,
                                    dualPanePreference ? 'nav-show-single-pane' : 'nav-show-dual-pane'
                                )}
                            />
                        </button>
                    ) : null}
                    {profileTrigger}
                </div>
                <div className="nn-header-actions">
                    {showExpandCollapseButton ? (
                        <button
                            className="nn-icon-button"
                            aria-label={shouldCollapseItems() ? strings.paneHeader.collapseAllFolders : strings.paneHeader.expandAllFolders}
                            onClick={() => {
                                handleExpandCollapseAll();
                                if (onTreeUpdateComplete) {
                                    // Defer callback until after DOM updates complete
                                    window.requestAnimationFrame(() => {
                                        onTreeUpdateComplete();
                                    });
                                }
                            }}
                            tabIndex={-1}
                        >
                            <ServiceIcon
                                iconId={resolveUXIcon(
                                    settings.interfaceIcons,
                                    shouldCollapseItems() ? 'nav-collapse-all' : 'nav-expand-all'
                                )}
                            />
                        </button>
                    ) : null}
                    {showHiddenItemsButton ? (
                        <button
                            className={`nn-icon-button ${showHiddenItems ? 'nn-icon-button-active' : ''}`}
                            aria-label={showHiddenItems ? strings.paneHeader.hideExcludedItems : strings.paneHeader.showExcludedItems}
                            onClick={() => {
                                handleToggleShowExcludedFolders();
                                if (onTreeUpdateComplete) {
                                    // Defer callback until after DOM updates complete
                                    window.requestAnimationFrame(() => {
                                        onTreeUpdateComplete();
                                    });
                                }
                            }}
                            tabIndex={-1}
                        >
                            <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'nav-hidden-items')} />
                        </button>
                    ) : null}
                    {showCalendarButton ? (
                        <button
                            className={`nn-icon-button ${isCalendarVisible ? 'nn-icon-button-active' : ''}`}
                            aria-label={isCalendarVisible ? strings.paneHeader.hideCalendar : strings.paneHeader.showCalendar}
                            onClick={toggleShowCalendar}
                            tabIndex={-1}
                            type="button"
                        >
                            <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'nav-calendar')} />
                        </button>
                    ) : null}
                    {showRootReorderButton ? (
                        <button
                            className={`nn-icon-button ${rootReorderActive ? 'nn-icon-button-active' : ''}`}
                            aria-label={
                                rootReorderActive ? strings.paneHeader.finishRootFolderReorder : strings.paneHeader.reorderRootFolders
                            }
                            onClick={onToggleRootFolderReorder}
                            disabled={rootReorderDisabled}
                            tabIndex={-1}
                        >
                            <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'nav-root-reorder')} />
                        </button>
                    ) : null}
                    {showNewFolderButton ? (
                        <button
                            className="nn-icon-button"
                            aria-label={strings.paneHeader.newFolder}
                            onClick={() => {
                                runAsyncAction(() => handleNewFolder());
                            }}
                            disabled={!selectionState.selectedFolder}
                            tabIndex={-1}
                        >
                            <ServiceIcon iconId={resolveUXIcon(settings.interfaceIcons, 'nav-new-folder')} />
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
});
