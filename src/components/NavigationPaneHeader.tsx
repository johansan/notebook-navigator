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
import { useServices } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferenceActions, useUXPreferences } from '../context/UXPreferencesContext';
import { useUIState } from '../context/UIStateContext';
import { useVaultProfileMenu } from '../hooks/useVaultProfileMenu';
import { strings } from '../i18n';
import { ServiceIcon } from './ServiceIcon';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { runAsyncAction } from '../utils/async';
import { resolveUXIcon } from '../utils/uxIcons';

interface NavigationPaneHeaderProps {
    onTreeUpdateComplete?: () => void;
    onToggleRootFolderReorder?: () => void;
    rootReorderActive?: boolean;
    rootReorderDisabled?: boolean;
    showVaultTitleInHeader: boolean;
}

export function NavigationPaneHeader({
    onTreeUpdateComplete,
    onToggleRootFolderReorder,
    rootReorderActive,
    rootReorderDisabled,
    showVaultTitleInHeader
}: NavigationPaneHeaderProps) {
    const { isMobile, plugin } = useServices();
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
    const showToggleDualPaneButton = navigationVisibility.toggleDualPane;
    const showExpandCollapseButton = navigationVisibility.expandCollapse;
    const showCalendarButton = navigationVisibility.calendar && settings.calendarEnabled && settings.calendarPlacement !== 'right-sidebar';
    const showHiddenItemsButton = navigationVisibility.hiddenItems;
    const showRootReorderButton = navigationVisibility.rootReorder;
    const showNewFolderButton = navigationVisibility.newFolder;
    const showRevealActiveFileButton = navigationVisibility.revealActiveFile;

    if (!hasProfiles) {
        return null;
    }

    // Clickable element that displays the active profile name and opens the profile menu on interaction
    const shouldRenderProfileTrigger = hasMultipleProfiles && (isMobile || showVaultTitleInHeader);
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
        isMobile ? (
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

    if (isMobile) {
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
        showNewFolderButton ||
        showRevealActiveFileButton;

    if (!shouldRenderDesktopHeader) {
        return null;
    }

    return (
        <div className="nn-pane-header">
            <div className="nn-header-actions nn-header-actions--space-between">
                <div className="nn-header-actions nn-header-actions-profile">
                    {showToggleDualPaneButton ? (
                        <button
                            className="nn-icon-button"
                            aria-label={uiState.dualPane ? strings.paneHeader.showSinglePane : strings.paneHeader.showDualPane}
                            onClick={() => {
                                plugin.setDualPanePreference(!plugin.useDualPane());
                            }}
                            tabIndex={-1}
                            type="button"
                        >
                            <ServiceIcon
                                iconId={resolveUXIcon(
                                    settings.interfaceIcons,
                                    uiState.dualPane ? 'nav-show-single-pane' : 'nav-show-dual-pane'
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
                    {showRevealActiveFileButton ? (
                        <button
                            className="nn-icon-button"
                            aria-label={strings.paneHeader.revealActiveFile}
                            onClick={() => {
                                runAsyncAction(async () => {
                                    const activeFile = plugin.app.workspace.getActiveFile();
                                    if (!activeFile || !activeFile.parent) {
                                        return;
                                    }
                                    await plugin.activateView();
                                    await plugin.revealFileInActualFolder(activeFile, { showHiddenFileNotice: true });
                                });
                            }}
                            disabled={!plugin.app.workspace.getActiveFile()}
                            tabIndex={-1}
                        >
                            <ServiceIcon iconId="lucide-folder-search" />
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
