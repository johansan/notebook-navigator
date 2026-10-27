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

import { useEffect, useState } from 'react';
import { TFile, TFolder, debounce } from 'obsidian';
import { useServices } from '../context/ServicesContext';
import { TIMEOUTS } from '../types/obsidian-extended';

export interface RootFileChangeEvent {
    type: 'create' | 'delete' | 'rename';
    path: string;
    oldPath?: string;
}

/**
 * Parameters for the useRootFolders hook
 */
export interface UseRootFoldersParams {
    showRootFolder: boolean;
    showHiddenItems: boolean; // Reveals the vault root as a hidden item when the root folder setting is off
    onFileChange?: (change: RootFileChangeEvent) => void; // Callback triggered when files change
    onFolderChange?: () => void; // Callback triggered when folders are created, deleted, or renamed
}

/**
 * Hook that provides the folders the navigation tree starts from and rebuilds them on vault folder changes.
 * Returns the vault root when it is shown, otherwise the top-level folders in vault order; the tree walker
 * sorts siblings. A new array on every rebuild is what re-renders the tree after nested folder changes.
 */
export function useRootFolders({ showRootFolder, showHiddenItems, onFileChange, onFolderChange }: UseRootFoldersParams): TFolder[] {
    const { app } = useServices();
    const [rootFolders, setRootFolders] = useState<TFolder[]>([]);

    useEffect(() => {
        // A root folder hidden by the setting counts as a hidden item, so the show hidden items
        // toggle reveals it; the tree renders it as excluded while it is only visible this way
        const includeRootFolder = showRootFolder || showHiddenItems;

        const buildFolders = () => {
            const root = app.vault.getRoot();
            if (includeRootFolder) {
                setRootFolders([root]);
                return;
            }
            setRootFolders(root.children.filter((child): child is TFolder => child instanceof TFolder));
        };

        // Notifies parent component of file changes
        const notifyFileChange = (change: RootFileChangeEvent) => {
            if (onFileChange) {
                onFileChange(change);
            }
        };

        // Notifies parent component of folder structure changes ahead of the debounced rebuild
        const notifyFolderChange = () => {
            if (onFolderChange) {
                onFolderChange();
            }
        };

        buildFolders();

        const rebuildFolders = debounce(buildFolders, TIMEOUTS.FILE_OPERATION_DELAY, true);

        const events = [
            app.vault.on('create', file => {
                if (file instanceof TFolder) {
                    rebuildFolders();
                    notifyFolderChange();
                }
                if (file instanceof TFile) {
                    notifyFileChange({ type: 'create', path: file.path });
                }
            }),
            app.vault.on('delete', file => {
                if (file instanceof TFolder) {
                    rebuildFolders();
                    notifyFolderChange();
                }
                if (file instanceof TFile) {
                    notifyFileChange({ type: 'delete', path: file.path });
                }
            }),
            app.vault.on('rename', (file, oldPath) => {
                if (file instanceof TFolder) {
                    rebuildFolders();
                    notifyFolderChange();
                }
                if (file instanceof TFile) {
                    notifyFileChange({ type: 'rename', path: file.path, oldPath });
                }
            })
        ];

        return () => {
            events.forEach(eventRef => app.vault.offref(eventRef));
            rebuildFolders.cancel();
        };
    }, [app, onFileChange, onFolderChange, showRootFolder, showHiddenItems]);

    return rootFolders;
}
