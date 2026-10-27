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

import { useEffect, useRef } from 'react';
import { useSettingsState, useSettingsUpdate } from '../context/SettingsContext';
import { useFileCache } from '../context/StorageContext';
import { runAsyncAction } from '../utils/async';
import { sanitizeRecord } from '../utils/recordUtils';
import { getChildOrder } from '../utils/treeFlattener';

interface UseChildOrderAppendParams<TTree extends object> {
    settingsKey: 'tagChildOrder' | 'propertyChildOrder';
    /** The tag or property tree. Each rebuild is a new map, which is what runs the check. */
    tree: TTree;
    /** Names of a parent's children in a tree, in the order the tree shows them */
    getChildNames: (tree: TTree, parentKey: string) => string[];
}

/**
 * Appends tags or property values that appear under a manually ordered parent to the end of its stored order, so a
 * manually ordered parent lists every child and new children land at the bottom, as folders do when one is created.
 * Tags and properties have no create event, so each tree rebuild is compared with the previous tree, and the
 * children a parent did not have before are appended in the order the tree shows them. During indexing, children
 * found in a later batch land below those found earlier. A parent's order the check has not seen yet (the first
 * tree after storage is ready, an order dragged here, or one synced from another device) gets every child it shows
 * and does not list, so a later child cannot land above them.
 */
export function useChildOrderAppend<TTree extends object>({ settingsKey, tree, getChildNames }: UseChildOrderAppendParams<TTree>): void {
    const settings = useSettingsState();
    const updateSettings = useSettingsUpdate();
    const { isStorageReady } = useFileCache();
    const childOrder = settings[settingsKey];
    const previousTreeRef = useRef<TTree | null>(null);
    const previousParentKeysRef = useRef<ReadonlySet<string>>(new Set());

    useEffect(() => {
        if (!isStorageReady) {
            return;
        }
        const previousTree = previousTreeRef.current;
        const previousParentKeys = previousParentKeysRef.current;
        const parentKeys = Object.keys(childOrder);
        previousTreeRef.current = tree;
        previousParentKeysRef.current = new Set(parentKeys);
        // A settings change with the same tree checks only new parents: a rename or delete can update the stored
        // order before the tree rebuilds, and the previous tree would put the removed child back
        const isNewTree = previousTree !== tree;
        const parentsToCheck = isNewTree ? parentKeys : parentKeys.filter(parentKey => !previousParentKeys.has(parentKey));

        const additions = new Map<string, string[]>();
        parentsToCheck.forEach(parentKey => {
            const storedNames = new Set(childOrder[parentKey]);
            // New means missing from the previous tree, not missing from the stored order. A tag rename or delete
            // drops the old name from the order once the files are written, while trees rebuilt before every file's
            // tags are read again still show it; appending unlisted children would put it back.
            const previousNames =
                previousTree && previousParentKeys.has(parentKey) ? new Set(getChildNames(previousTree, parentKey)) : null;
            const newNames = getChildNames(tree, parentKey).filter(name => !storedNames.has(name) && !previousNames?.has(name));
            if (newNames.length > 0) {
                additions.set(parentKey, newNames);
            }
        });
        if (additions.size === 0) {
            return;
        }

        runAsyncAction(async () => {
            await updateSettings(current => {
                // Merge against the current orders: a reset or drag may have landed since the check
                const nextRecord = sanitizeRecord(current[settingsKey]);
                let changed = false;
                additions.forEach((newNames, parentKey) => {
                    const storedOrder = getChildOrder(current[settingsKey], parentKey);
                    const storedNames = new Set(storedOrder);
                    const appended = newNames.filter(name => !storedNames.has(name));
                    if (storedOrder.length === 0 || appended.length === 0) {
                        return;
                    }
                    nextRecord[parentKey] = [...storedOrder, ...appended];
                    changed = true;
                });
                if (changed) {
                    current[settingsKey] = nextRecord;
                }
            });
        });
    }, [childOrder, getChildNames, isStorageReady, settingsKey, tree, updateSettings]);
}
