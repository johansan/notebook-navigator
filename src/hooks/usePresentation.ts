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

import { useCallback, useSyncExternalStore } from 'react';
import type { TFile } from 'obsidian';
import { getPresentationService, type PresentationFileRole, type PresentationSummary } from '../services/PresentationService';

const unsubscribeNothing = () => {};

/**
 * Returns the file's role in a verified presentation. File rows are memoized and a role change does not change
 * their props, so each row subscribes to role changes itself.
 */
export function usePresentationFileRole(file: TFile): PresentationFileRole | null {
    const service = getPresentationService();
    const subscribe = useCallback((listener: () => void) => service?.subscribeToRoles(listener) ?? unsubscribeNothing, [service]);
    return useSyncExternalStore(subscribe, () => service?.getRole(file.path) ?? null);
}

/** Returns the cached summary of the presentation in `folderPath`, or null when the folder holds none. */
export function usePresentationSummary(folderPath: string | null): PresentationSummary | null {
    const service = getPresentationService();
    const subscribe = useCallback(
        (listener: () => void) => (service && folderPath !== null ? service.subscribeToSummary(folderPath, listener) : unsubscribeNothing),
        [folderPath, service]
    );
    return useSyncExternalStore(subscribe, () => (service && folderPath !== null ? service.getSummary(folderPath) : null));
}
