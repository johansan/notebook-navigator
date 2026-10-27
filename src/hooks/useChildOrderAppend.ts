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

import { useEffect } from 'react';
import { useSettingsState, useSettingsUpdate } from '../context/SettingsContext';
import { useFileCache } from '../context/StorageContext';
import { getDBInstanceOrNull } from '../storage/fileOperations';
import { runAsyncAction } from '../utils/async';
import { sanitizeRecord } from '../utils/recordUtils';
import { getChildOrder } from '../utils/treeFlattener';

interface UseChildOrderAppendParams {
    settingsKey: 'tagChildOrder' | 'propertyChildOrder';
    contentType: 'tags' | 'properties';
    /**
     * Children of a stored parent that its order does not list yet, in the order the tree shows them. Its identity
     * changes with every tree rebuild, which is what re-runs the check.
     */
    getNewChildNames: (parentKey: string, storedOrder: readonly string[]) => string[];
}

/**
 * Appends tags or property values that appear under a manually ordered parent to the end of its stored order, so a
 * manually ordered parent lists every child, as folders do when one is created. Tags and properties have no create
 * event, so this compares the trees with the stored orders. It runs when a tree rebuild hands it a new tree and only
 * saves while no file is waiting for tag or property content: a cold index delivers children in batches, and saving
 * from a tree built before the last batch would store batch order instead of the order shown. It does not run on
 * content changes alone, because those arrive before the debounced rebuild and would read the previous tree. New
 * children that are not saved yet still show after the listed ones, and the next rebuild saves them.
 */
export function useChildOrderAppend({ settingsKey, contentType, getNewChildNames }: UseChildOrderAppendParams): void {
    const settings = useSettingsState();
    const updateSettings = useSettingsUpdate();
    const { isStorageReady } = useFileCache();
    const childOrder = settings[settingsKey];

    useEffect(() => {
        if (!isStorageReady) {
            return;
        }

        const additions = new Map<string, string[]>();
        Object.keys(childOrder).forEach(parentKey => {
            const newNames = getNewChildNames(parentKey, childOrder[parentKey]);
            if (newNames.length > 0) {
                additions.set(parentKey, newNames);
            }
        });
        if (additions.size === 0) {
            return;
        }

        const db = getDBInstanceOrNull();
        if (!db || db.getFilesNeedingContent(contentType).size > 0) {
            return;
        }

        runAsyncAction(async () => {
            await updateSettings(current => {
                // Merge against the current orders: a reset or drag may have landed since the check
                const nextRecord = sanitizeRecord(current[settingsKey]);
                let changed = false;
                additions.forEach((newNames, parentKey) => {
                    const storedOrder = getChildOrder(current[settingsKey], parentKey);
                    const appended = newNames.filter(name => !storedOrder.includes(name));
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
    }, [childOrder, contentType, getNewChildNames, isStorageReady, settingsKey, updateSettings]);
}
