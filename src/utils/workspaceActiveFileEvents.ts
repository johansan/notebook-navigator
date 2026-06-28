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

import { TFile, type WorkspaceLeaf } from 'obsidian';
import type { CommandQueueService } from '../services/CommandQueueService';
import { TIMEOUTS } from '../types/obsidian-extended';

interface WorkspaceActiveFileEventSource {
    activeLeaf: WorkspaceLeaf | null;
    on(name: 'active-leaf-change', callback: (leaf: WorkspaceLeaf | null) => void): unknown;
    on(name: 'file-open', callback: (file: TFile | null) => void): unknown;
    offref(ref: unknown): void;
}

export interface ActiveFileWorkspaceEvent {
    candidateFile?: TFile | null;
    activeLeaf?: WorkspaceLeaf | null;
}

interface RegisterActiveFileWorkspaceListenersOptions {
    workspace: WorkspaceActiveFileEventSource;
    commandQueue?: Pick<CommandQueueService, 'consumeBackgroundActiveLeafChange' | 'consumeBackgroundFileOpen'> | null;
    onChange: (event: ActiveFileWorkspaceEvent) => void;
}

export function registerActiveFileWorkspaceListeners({
    workspace,
    commandQueue,
    onChange
}: RegisterActiveFileWorkspaceListenersOptions): () => void {
    let pendingSyncTimer: number | null = null;
    let pendingCandidateFile: TFile | null | undefined = undefined;
    let pendingActiveLeaf: WorkspaceLeaf | null | undefined = undefined;

    const clearPendingChange = () => {
        if (pendingSyncTimer !== null && typeof window !== 'undefined') {
            window.clearTimeout(pendingSyncTimer);
        }
        pendingSyncTimer = null;
        pendingCandidateFile = undefined;
        pendingActiveLeaf = undefined;
    };

    const clearPendingActiveLeafChange = () => {
        if (pendingCandidateFile === undefined) {
            clearPendingChange();
        }
    };

    const clearPendingBackgroundActiveLeafChange = () => {
        if (pendingActiveLeaf !== undefined && commandQueue?.consumeBackgroundActiveLeafChange(pendingActiveLeaf) === true) {
            clearPendingActiveLeafChange();
        }
    };

    const scheduleChange = (candidateFile?: TFile | null, activeLeaf?: WorkspaceLeaf | null) => {
        if (candidateFile !== undefined) {
            pendingCandidateFile = candidateFile;
        }
        if (activeLeaf !== undefined) {
            pendingActiveLeaf = activeLeaf;
        }

        if (typeof window === 'undefined') {
            onChange({
                candidateFile,
                activeLeaf: activeLeaf ?? workspace.activeLeaf
            });
            return;
        }

        if (pendingSyncTimer !== null) {
            window.clearTimeout(pendingSyncTimer);
        }

        // Coalesce rapid file-open + active-leaf-change sequences and yield until workspace state settles.
        pendingSyncTimer = window.setTimeout(() => {
            pendingSyncTimer = null;
            const file = pendingCandidateFile;
            const leaf = pendingActiveLeaf ?? workspace.activeLeaf;
            pendingCandidateFile = undefined;
            pendingActiveLeaf = undefined;
            onChange({
                candidateFile: file,
                activeLeaf: leaf
            });
        }, TIMEOUTS.YIELD_TO_EVENT_LOOP);
    };

    const handleActiveLeafChange = (leaf: WorkspaceLeaf | null) => {
        if (commandQueue?.consumeBackgroundActiveLeafChange(leaf) === true) {
            clearPendingActiveLeafChange();
            return;
        }

        scheduleChange(undefined, leaf);
    };

    const handleFileOpen = (file: TFile | null) => {
        if (file instanceof TFile && commandQueue?.consumeBackgroundFileOpen(file.path, workspace.activeLeaf) === true) {
            clearPendingBackgroundActiveLeafChange();
            return;
        }

        scheduleChange(file, workspace.activeLeaf);
    };

    const activeLeafChangeRef = workspace.on('active-leaf-change', handleActiveLeafChange);
    const fileOpenRef = workspace.on('file-open', handleFileOpen);

    return () => {
        clearPendingChange();
        workspace.offref(activeLeafChangeRef);
        workspace.offref(fileOpenRef);
    };
}
