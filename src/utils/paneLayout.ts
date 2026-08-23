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

import { Platform } from 'obsidian';
import type { BackgroundMode } from '../types';

/*
 * Tablet platform behavior these helpers depend on (verified against the Obsidian 1.13.4
 * app bundle):
 * - Platform.isTablet and Platform.isPhone are dynamic: Obsidian re-evaluates them from a
 *   `(min-width: 600px) and (min-height: 600px)` media query when the window resizes
 *   (e.g. iPadOS Split View). The helpers below are functions that read the flags at call
 *   time instead of module constants so they never cache a stale value.
 * - Mobile sidebars are WorkspaceMobileDrawer instances. Platform.canPinSidebar
 *   (isMobile && !isPhone) enables pinning: pinning expands the drawer inline with a
 *   drag-resizable width (minimum 150px, maximum half the window width, persisted in the
 *   workspace layout as pinnedSize), and WorkspaceMobileDrawer.collapse() is a no-op while
 *   pinned. Unpinning restores the overlay drawer and collapses it. This is why calling
 *   leftSplit.collapse() after opening a note is safe in pinned dual pane: Obsidian ignores
 *   it while the sidebar is pinned and only closes the unpinned overlay drawer.
 * - The core `app:toggle-left-sidebar` command toggles the pin on tablets instead of
 *   expanding or collapsing the drawer.
 */

/**
 * Returns whether the device can show the dual pane layout.
 * Dual pane is available on desktop and tablets; phones always use single pane
 * because the drawer is too narrow to fit both panes.
 */
export function isDualPaneSupported(): boolean {
    return !Platform.isMobile || Platform.isTablet;
}

/**
 * Returns whether dual pane is the resolved layout after container measurement.
 * Before measurement, the provisional dual-pane calculation must not count as a
 * completed layout transition.
 */
export function isResolvedDualPaneLayout(dualPane: boolean, containerWidth: number | null): boolean {
    return containerWidth !== null && dualPane;
}

/**
 * Chooses the pane shown when the navigator enters single-pane layout.
 * A transition from a resolved dual-pane layout shows the file list. Startup and
 * direct single-pane entry keep the configured pane.
 */
export function getSinglePaneEntryView({
    preferredView,
    wasDualPane
}: {
    preferredView: 'navigation' | 'files';
    wasDualPane: boolean;
}): 'navigation' | 'files' {
    return wasDualPane ? 'files' : preferredView;
}

/**
 * Returns whether the device gets keyboard and pointer-modifier interactions:
 * modifier-based multi-select, keyboard range selection, navigator focus tracking,
 * and the keyboard navigation settings. Enabled on desktop and tablets, which
 * support hardware keyboards and pointers; phones stay touch-only.
 */
export function supportsKeyboardInteractions(): boolean {
    return !Platform.isMobile || Platform.isTablet;
}

/**
 * Returns whether the navigator renders the mobile chrome: simplified pane headers
 * with breadcrumbs and the mobile toolbars. Phones only; desktop and tablets always
 * render the desktop pane headers so the toolbars stay at the top and the chrome
 * does not shift when switching between single and dual pane.
 */
export function usesMobileChrome(): boolean {
    return Platform.isPhone;
}

/** Returns CSS classes for the configured background mode */
export function getBackgroundClasses(mode: BackgroundMode | null | undefined): string[] {
    if (mode === 'primary') {
        return ['nn-bg-primary'];
    }
    if (mode === 'secondary') {
        return ['nn-bg-secondary'];
    }
    return [];
}
