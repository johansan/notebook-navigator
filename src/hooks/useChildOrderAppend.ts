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
    /** Children of a stored parent that its order does not list yet, in the order the tree shows them */
    getNewChildNames: (parentKey: string, storedOrder: readonly string[]) => string[];
    /** Changes whenever tag or property content changes, so a finished index re-runs the check */
    contentVersion: number;
}

/**
 * Appends tags or property values that appear under a manually ordered parent to the end of its stored order, so a
 * manually ordered parent lists every child, as folders do when one is created. Tags and properties have no create
 * event, so this compares the trees with the stored orders. It waits until no file is waiting for tag or property
 * content: a cold index delivers children in batches, and appending earlier would save batch order instead of the
 * order shown. Until then new children show after the listed ones without being saved.
 */
export function useChildOrderAppend({ settingsKey, contentType, getNewChildNames, contentVersion }: UseChildOrderAppendParams): void {
    const settings = useSettingsState();
    const updateSettings = useSettingsUpdate();
    const { isStorageReady } = useFileCache();
    const childOrder = settings[settingsKey];

    useEffect(() => {
        void contentVersion;
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
    }, [childOrder, contentType, contentVersion, getNewChildNames, isStorageReady, settingsKey, updateSettings]);
}
