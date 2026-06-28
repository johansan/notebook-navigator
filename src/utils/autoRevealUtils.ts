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

import { WorkspaceLeaf } from 'obsidian';

interface ShouldSkipNavigatorAutoRevealParams {
    hasNavigatorFocus: boolean;
    isOpeningVersionHistory: boolean;
    isOpeningInNewContext: boolean;
    isNavigatorOpeningSelectedFile: boolean;
}

/**
 * Determines whether auto-reveal should be suppressed for navigator-initiated opens.
 * Used to prevent workspace file-open events from racing with rapid keyboard navigation.
 */
export function shouldSkipNavigatorAutoReveal({
    hasNavigatorFocus,
    isOpeningVersionHistory,
    isOpeningInNewContext,
    isNavigatorOpeningSelectedFile
}: ShouldSkipNavigatorAutoRevealParams): boolean {
    if (!hasNavigatorFocus) {
        return false;
    }

    if (isOpeningVersionHistory || isOpeningInNewContext) {
        return false;
    }

    return isNavigatorOpeningSelectedFile;
}

export function isLeafInNavigatorWindow(leaf: WorkspaceLeaf | null, navigatorLeaves: WorkspaceLeaf[]): boolean {
    if (!leaf || navigatorLeaves.length === 0) {
        return false;
    }

    const activeWindow = leaf.getContainer().win;
    return navigatorLeaves.some(navigatorLeaf => navigatorLeaf.getContainer().win === activeWindow);
}
