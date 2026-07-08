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
import { FileView, TFile, WorkspaceLeaf } from 'obsidian';
import type { App } from 'obsidian';
import { useServices } from '../context/ServicesContext';
import { getSupportedLeaves, isSupportedLeafType } from '../types';
import { runAsyncAction } from '../utils/async';
import { getLeafSplitLocation } from '../utils/workspaceSplit';

interface OpenFileOptions {
    /** Optional target leaf for opening the file */
    leaf?: WorkspaceLeaf | null;
    /** Whether to activate the leaf after opening */
    active?: boolean;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function hasFunctionProperty<T extends string>(value: unknown, property: T): value is Record<T, () => unknown> {
    return isObject(value) && typeof value[property] === 'function';
}

function extractFilePathFromState(state: unknown): string | null {
    if (!isObject(state) || !Object.prototype.hasOwnProperty.call(state, 'file')) {
        return null;
    }

    const fileValue = state.file;
    return typeof fileValue === 'string' ? fileValue : null;
}

function isSupportedLeafViewState(value: unknown): value is { state?: unknown; type: string } {
    return isObject(value) && typeof value.type === 'string' && isSupportedLeafType(value.type);
}

function getSupportedLeafViewState(leaf: WorkspaceLeaf): { state?: unknown; type: string } | null {
    if (!hasFunctionProperty(leaf, 'getViewState')) {
        return null;
    }

    try {
        const viewState = leaf.getViewState();
        return isSupportedLeafViewState(viewState) ? viewState : null;
    } catch {
        return null;
    }
}

function getLeafFilePath(leaf: WorkspaceLeaf): string | null {
    const { view } = leaf;
    if (view instanceof FileView && view.file) {
        return view.file.path;
    }

    const persistedState = getSupportedLeafViewState(leaf);
    if (!persistedState) {
        return null;
    }

    if (hasFunctionProperty(view, 'getState')) {
        try {
            const liveStateFile = extractFilePathFromState(view.getState());
            if (liveStateFile) {
                return liveStateFile;
            }
        } catch {
            // Ignore state inspection failures and use persisted view state instead.
        }
    }

    return extractFilePathFromState(persistedState.state);
}

function isLeafDisplayingFile(leaf: WorkspaceLeaf, file: TFile): boolean {
    return getLeafFilePath(leaf) === file.path;
}

export function findOpenMainLeafForFile(app: App, file: TFile): WorkspaceLeaf | null {
    try {
        return (
            getSupportedLeaves(app).find(leaf => {
                return getLeafSplitLocation(app, leaf) === 'main' && isLeafDisplayingFile(leaf, file);
            }) ?? null
        );
    } catch {
        return null;
    }
}

export function resolveFileOpenLeaf(app: App, file: TFile, explicitLeaf: WorkspaceLeaf | null): WorkspaceLeaf | null {
    if (explicitLeaf) {
        return explicitLeaf;
    }

    return findOpenMainLeafForFile(app, file) ?? app.workspace.getLeaf(false);
}

export async function openFileInResolvedLeaf(app: App, leaf: WorkspaceLeaf | null, file: TFile, active: boolean): Promise<void> {
    if (!leaf) {
        return;
    }

    if (isLeafDisplayingFile(leaf, file)) {
        await app.workspace.revealLeaf(leaf);
        app.workspace.setActiveLeaf(leaf, { focus: active });
        return;
    }

    await leaf.openFile(file, { active });
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
            const explicitLeaf = options?.leaf ?? null;
            const getLeaf = () => resolveFileOpenLeaf(app, file, explicitLeaf);

            const openFile = async (targetLeaf: WorkspaceLeaf | null) => {
                await openFileInResolvedLeaf(app, targetLeaf, file, active);
            };

            if (commandQueue) {
                // Use command queue to serialize file operations
                runAsyncAction(() => commandQueue.executeOpenActiveFile(file, openFile, { active, getLeaf }));
                return;
            }

            // Open file directly with async error handling
            runAsyncAction(() => openFile(getLeaf()));
        },
        [app, commandQueue]
    );
}
