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

import type { CachedMetadata } from 'obsidian';

export type MarkdownTaskCounts = {
    taskTotal: number;
    taskUnfinished: number;
};

export function hasMarkdownTaskMetadata(metadata: CachedMetadata): boolean {
    return Array.isArray(metadata.listItems) && metadata.listItems.some(item => typeof item.task === 'string');
}

export function countMarkdownTasksFromMetadata(metadata: CachedMetadata): MarkdownTaskCounts | null {
    if (!Array.isArray(metadata.listItems)) {
        return { taskTotal: 0, taskUnfinished: 0 };
    }

    if (hasMarkdownTaskMetadata(metadata)) {
        // Obsidian metadata does not include enough line text to preserve the parser's
        // empty-checkbox rule, so task-bearing files use the content parser.
        return null;
    }

    return { taskTotal: 0, taskUnfinished: 0 };
}

export function areMarkdownTaskCountsEqual(
    current: { taskTotal: number | null; taskUnfinished: number | null },
    next: MarkdownTaskCounts
): boolean {
    return current.taskTotal === next.taskTotal && current.taskUnfinished === next.taskUnfinished;
}
