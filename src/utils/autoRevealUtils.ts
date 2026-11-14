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
    isOpeningVersionHistory: boolean;
    isOpeningInNewContext: boolean;
    isActiveFileSelected: boolean;
}

/**
 * Determines whether auto-reveal leaves the navigator as it is because the file becoming active is already the
 * selected file. The selection already points at the file, so a reveal would only move the navigation context: a
 * shortcut that selects a note without revealing it would otherwise be revealed when its editor is focused later.
 * Version history and new-context opens still reveal.
 */
export function shouldSkipNavigatorAutoReveal({
    isOpeningVersionHistory,
    isOpeningInNewContext,
    isActiveFileSelected
}: ShouldSkipNavigatorAutoRevealParams): boolean {
    if (isOpeningVersionHistory || isOpeningInNewContext) {
        return false;
    }

    return isActiveFileSelected;
}

export function isLeafInNavigatorWindow(leaf: WorkspaceLeaf | null, navigatorLeaves: WorkspaceLeaf[]): boolean {
    if (!leaf || navigatorLeaves.length === 0) {
        return false;
    }

    const activeWindow = leaf.getContainer().win;
    return navigatorLeaves.some(navigatorLeaf => navigatorLeaf.getContainer().win === activeWindow);
}
