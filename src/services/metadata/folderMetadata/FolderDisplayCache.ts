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

import { sanitizeRecord } from '../../../utils/recordUtils';
import type { FolderDisplayCacheSettingsSnapshot, FolderDisplayData, FolderDisplayResolveOptions, FolderStyleRecordSource } from './types';

interface FolderStyleRecordSnapshot {
    icons: Record<string, string> | null;
    colors: Record<string, string> | null;
    backgrounds: Record<string, string> | null;
}

const FOLDER_DISPLAY_CACHE_MAX_ENTRIES = 1000;

export class FolderDisplayCache {
    private readonly dataByKey = new Map<string, FolderDisplayData>();
    private readonly keysByFolderPath = new Map<string, Set<string>>();
    private readonly folderPathByKey = new Map<string, string>();
    private readonly folderNotePathByFolderPath = new Map<string, string | null>();
    private readonly folderPathsByFolderNotePath = new Map<string, Set<string>>();
    private settingsSnapshot: FolderDisplayCacheSettingsSnapshot | null = null;
    private styleSnapshot: FolderStyleRecordSnapshot = {
        icons: null,
        colors: null,
        backgrounds: null
    };
    private styleSnapshotInitialized = false;

    hasEntries(): boolean {
        return this.dataByKey.size > 0;
    }

    hasTrackedFolderNotePath(folderNotePath: string): boolean {
        return this.folderPathsByFolderNotePath.has(folderNotePath);
    }

    getTrackedFolderPaths(folderNotePath: string): ReadonlySet<string> | undefined {
        return this.folderPathsByFolderNotePath.get(folderNotePath);
    }

    clear(): void {
        this.dataByKey.clear();
        this.keysByFolderPath.clear();
        this.folderPathByKey.clear();
        this.folderNotePathByFolderPath.clear();
        this.folderPathsByFolderNotePath.clear();
        this.resetStyleSnapshot();
    }

    hasSettingsSnapshotChanged(snapshot: FolderDisplayCacheSettingsSnapshot): boolean {
        if (!this.settingsSnapshot) {
            return true;
        }

        return (
            this.settingsSnapshot.useFrontmatterMetadata !== snapshot.useFrontmatterMetadata ||
            this.settingsSnapshot.enableFolderNotes !== snapshot.enableFolderNotes ||
            this.settingsSnapshot.inheritFolderColors !== snapshot.inheritFolderColors ||
            this.settingsSnapshot.folderNoteNamePattern !== snapshot.folderNoteNamePattern ||
            this.settingsSnapshot.frontmatterNameField !== snapshot.frontmatterNameField ||
            this.settingsSnapshot.frontmatterIconField !== snapshot.frontmatterIconField ||
            this.settingsSnapshot.frontmatterColorField !== snapshot.frontmatterColorField ||
            this.settingsSnapshot.frontmatterBackgroundField !== snapshot.frontmatterBackgroundField
        );
    }

    hasDisplayNameSettingsSnapshotChanged(snapshot: FolderDisplayCacheSettingsSnapshot): boolean {
        if (!this.settingsSnapshot) {
            return true;
        }

        return (
            this.settingsSnapshot.useFrontmatterMetadata !== snapshot.useFrontmatterMetadata ||
            this.settingsSnapshot.enableFolderNotes !== snapshot.enableFolderNotes ||
            this.settingsSnapshot.folderNoteNamePattern !== snapshot.folderNoteNamePattern ||
            this.settingsSnapshot.frontmatterNameField !== snapshot.frontmatterNameField
        );
    }

    captureSettingsSnapshot(snapshot: FolderDisplayCacheSettingsSnapshot): void {
        this.settingsSnapshot = { ...snapshot };
    }

    isStyleSnapshotInitialized(): boolean {
        return this.styleSnapshotInitialized;
    }

    hasStyleSnapshotChanged(styleSource: FolderStyleRecordSource): boolean {
        return (
            !this.areStringRecordsEqual(this.styleSnapshot.icons, styleSource.icons) ||
            !this.areStringRecordsEqual(this.styleSnapshot.colors, styleSource.colors) ||
            !this.areStringRecordsEqual(this.styleSnapshot.backgrounds, styleSource.backgrounds)
        );
    }

    captureStyleSnapshot(styleSource: FolderStyleRecordSource): void {
        this.styleSnapshot = {
            icons: this.cloneStringRecord(styleSource.icons),
            colors: this.cloneStringRecord(styleSource.colors),
            backgrounds: this.cloneStringRecord(styleSource.backgrounds)
        };
        this.styleSnapshotInitialized = true;
    }

    get(folderPath: string, options: FolderDisplayResolveOptions): FolderDisplayData | undefined {
        const key = this.createCacheKey(folderPath, options);
        const cached = this.dataByKey.get(key);
        if (!cached) {
            return undefined;
        }

        this.dataByKey.delete(key);
        this.dataByKey.set(key, cached);
        return cached;
    }

    set(folderPath: string, options: FolderDisplayResolveOptions, data: FolderDisplayData, styleSource: FolderStyleRecordSource): void {
        const key = this.createCacheKey(folderPath, options);
        this.removeEntry(key);

        this.dataByKey.set(key, data);
        if (!this.styleSnapshotInitialized) {
            this.captureStyleSnapshot(styleSource);
        }

        const cacheKeys = this.keysByFolderPath.get(folderPath);
        if (cacheKeys) {
            cacheKeys.add(key);
        } else {
            this.keysByFolderPath.set(folderPath, new Set([key]));
        }
        this.folderPathByKey.set(key, folderPath);

        if (this.dataByKey.size <= FOLDER_DISPLAY_CACHE_MAX_ENTRIES) {
            return;
        }

        const oldestEntry = this.dataByKey.entries().next();
        if (!oldestEntry.done) {
            const [oldestKey] = oldestEntry.value;
            this.removeEntry(oldestKey);
        }
    }

    trackFolderNotePath(folderPath: string, folderNotePath: string | null): void {
        const previousPath = this.folderNotePathByFolderPath.get(folderPath);
        if (previousPath === folderNotePath) {
            return;
        }

        if (previousPath !== undefined) {
            this.folderNotePathByFolderPath.delete(folderPath);
            if (previousPath) {
                this.removeFolderPathFromTrackedFolderNotePath(previousPath, folderPath);
            }
        }

        this.folderNotePathByFolderPath.set(folderPath, folderNotePath);
        if (folderNotePath) {
            this.addFolderPathForTrackedFolderNotePath(folderNotePath, folderPath);
        }
    }

    untrackFolderNotePathForFolder(folderPath: string): void {
        const previousPath = this.folderNotePathByFolderPath.get(folderPath);
        if (previousPath === undefined) {
            return;
        }

        this.folderNotePathByFolderPath.delete(folderPath);
        if (previousPath) {
            this.removeFolderPathFromTrackedFolderNotePath(previousPath, folderPath);
        }
    }

    invalidateFolder(folderPath: string): void {
        const cacheKeys = this.keysByFolderPath.get(folderPath);
        if (!cacheKeys || cacheKeys.size === 0) {
            this.untrackFolderNotePathForFolder(folderPath);
            return;
        }

        Array.from(cacheKeys).forEach(key => {
            this.removeEntry(key);
        });
    }

    invalidateFolderAndDescendants(folderPath: string): void {
        if (folderPath === '/') {
            this.clear();
            return;
        }

        Array.from(this.keysByFolderPath.keys()).forEach(cachedFolderPath => {
            if (this.isFolderPathWithinSubtree(folderPath, cachedFolderPath)) {
                this.invalidateFolder(cachedFolderPath);
            }
        });
    }

    private resetStyleSnapshot(): void {
        this.styleSnapshot = {
            icons: null,
            colors: null,
            backgrounds: null
        };
        this.styleSnapshotInitialized = false;
    }

    private createCacheKey(folderPath: string, options: FolderDisplayResolveOptions): string {
        return [
            folderPath,
            options.includeDisplayName ? '1' : '0',
            options.includeColor ? '1' : '0',
            options.includeBackgroundColor ? '1' : '0',
            options.includeIcon ? '1' : '0',
            options.includeInheritedColors ? '1' : '0'
        ].join('|');
    }

    private removeEntry(cacheKey: string): void {
        this.dataByKey.delete(cacheKey);
        if (this.dataByKey.size === 0) {
            this.resetStyleSnapshot();
        }

        const folderPath = this.folderPathByKey.get(cacheKey);
        if (!folderPath) {
            return;
        }

        this.folderPathByKey.delete(cacheKey);
        const cacheKeys = this.keysByFolderPath.get(folderPath);
        if (!cacheKeys) {
            return;
        }

        cacheKeys.delete(cacheKey);
        if (cacheKeys.size === 0) {
            this.keysByFolderPath.delete(folderPath);
            this.untrackFolderNotePathForFolder(folderPath);
        }
    }

    private addFolderPathForTrackedFolderNotePath(folderNotePath: string, folderPath: string): void {
        const folderPaths = this.folderPathsByFolderNotePath.get(folderNotePath);
        if (folderPaths) {
            folderPaths.add(folderPath);
            return;
        }

        this.folderPathsByFolderNotePath.set(folderNotePath, new Set([folderPath]));
    }

    private removeFolderPathFromTrackedFolderNotePath(folderNotePath: string, folderPath: string): void {
        const folderPaths = this.folderPathsByFolderNotePath.get(folderNotePath);
        if (!folderPaths) {
            return;
        }

        folderPaths.delete(folderPath);
        if (folderPaths.size === 0) {
            this.folderPathsByFolderNotePath.delete(folderNotePath);
        }
    }

    private cloneStringRecord(record: Record<string, string> | undefined): Record<string, string> | null {
        if (!record) {
            return null;
        }

        const keys = Object.keys(record);
        if (keys.length === 0) {
            return null;
        }

        const clone = sanitizeRecord<string>(undefined);
        keys.forEach(key => {
            clone[key] = record[key];
        });
        return clone;
    }

    private areStringRecordsEqual(left: Record<string, string> | null, right: Record<string, string> | undefined): boolean {
        const rightKeys = right ? Object.keys(right) : [];
        const leftKeys = left ? Object.keys(left) : [];
        if (leftKeys.length !== rightKeys.length) {
            return false;
        }

        if (leftKeys.length === 0 && rightKeys.length === 0) {
            return true;
        }

        if (!left || !right) {
            return false;
        }

        return rightKeys.every(key => left[key] === right[key]);
    }

    private isFolderPathWithinSubtree(rootFolderPath: string, folderPath: string): boolean {
        if (rootFolderPath === '/') {
            return true;
        }

        return folderPath === rootFolderPath || folderPath.startsWith(`${rootFolderPath}/`);
    }
}
