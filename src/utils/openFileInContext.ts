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
import type { App, PaneType, TFile } from 'obsidian';
import type { CommandQueueService } from '../services/CommandQueueService';
import { applyPendingTemplateCursor } from './templateCursor';

interface OpenFileInContextParams {
    app: App;
    commandQueue: CommandQueueService | null;
    file: TFile;
    context: PaneType;
    active?: boolean;
}

/**
 * Opens a file in a new workspace context (tab, split, window) while respecting the command queue.
 */
export async function openFileInContext({ app, commandQueue, file, context, active = true }: OpenFileInContextParams): Promise<void> {
    const resolvedContext: PaneType = Platform.isMobile && context === 'window' ? 'tab' : context;

    // Define the file opening operation
    const openFile = async () => {
        const leaf = app.workspace.getLeaf(resolvedContext);
        if (!leaf) {
            throw new Error(`Unable to open file in ${resolvedContext} context: leaf not available`);
        }
        await leaf.openFile(file, { active });
        applyPendingTemplateCursor(app, file);
    };

    // Execute through command queue if available to track file open context
    if (commandQueue) {
        await commandQueue.executeOpenInNewContext(file, resolvedContext, openFile);
        return;
    }

    // Otherwise open directly
    await openFile();
}
