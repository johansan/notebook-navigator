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

import { useCallback } from 'react';
import { TFile, WorkspaceLeaf } from 'obsidian';
import { useServices } from '../context/ServicesContext';
import { runAsyncAction } from '../utils/async';

interface OpenFileOptions {
    /** Optional target leaf for opening the file */
    leaf?: WorkspaceLeaf | null;
    /** Whether to activate the leaf after opening */
    active?: boolean;
}

/**
 * Provides a queue-aware helper for opening files in the workspace.
 * Uses the command queue when available to serialize operations.
 */
export function useFileOpener() {
    const { app, commandQueue } = useServices();

    return useCallback(
        (file: TFile | null, options?: OpenFileOptions) => {
            if (!file) {
                return;
            }

            const active = options?.active ?? false;
            const getLeaf = () => options?.leaf ?? app.workspace.getLeaf(false);

            const openFile = async (targetLeaf: WorkspaceLeaf | null) => {
                if (!targetLeaf) {
                    return;
                }
                await targetLeaf.openFile(file, { active });
            };

            if (commandQueue) {
                // Use command queue to serialize file operations
                runAsyncAction(() => commandQueue.executeOpenActiveFile(file, openFile, { active, getLeaf }));
                return;
            }

            // Open file directly with async error handling
            runAsyncAction(() => openFile(getLeaf()));
        },
        [app.workspace, commandQueue]
    );
}
