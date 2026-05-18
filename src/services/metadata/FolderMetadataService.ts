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

import { EventRef, TFile } from 'obsidian';
import type { AlphaSortOrder, ListSortOverrideValue, NotebookNavigatorSettings } from '../../settings';
import { getDBInstanceOrNull } from '../../storage/fileOperations';
import { ItemType } from '../../types';
import { isFolderShortcut } from '../../types/shortcuts';
import type { FileContentChange } from '../../storage/IndexedDBStorage';
import { normalizeCanonicalIconId } from '../../utils/iconizeFormat';
import { getParentFolderPath } from '../../utils/pathUtils';
import { createShortcutTargetPathEventMatcher } from '../../utils/shortcutPathResolver';
import {
    cleanupCollapsedPinnedContextKeys,
    deleteCollapsedPinnedContextKeys,
    ensureRecord,
    isStringRecordValue,
    updateCollapsedPinnedContextKeys
} from '../../utils/recordUtils';
import type { CleanupValidators } from '../MetadataService';
import { BaseMetadataService } from './BaseMetadataService';
import { FolderDisplayCache } from './folderMetadata/FolderDisplayCache';
import { FolderNoteMetadataAdapter } from './folderMetadata/FolderNoteMetadataAdapter';
import { resolveFolderDisplayData, resolveInheritedFolderStyleValues } from './folderMetadata/folderDisplayResolver';
import type {
    FolderDisplayCacheSettingsSnapshot,
    FolderDisplayData,
    FolderDisplayResolveOptions,
    FolderStyleRecordSource,
    FolderStyleUpdate,
    FolderStyleValues
} from './folderMetadata/types';

export type { FolderDisplayData } from './folderMetadata/types';

/**
 * Service for managing folder-specific metadata operations
 * Handles folder colors, icons, sort overrides, and cleanup operations
 */
type SettingsMutation = (settings: NotebookNavigatorSettings) => boolean;

interface SettingsUpdateListenerProvider {
    registerSettingsUpdateListener(id: string, callback: () => void): void;
    unregisterSettingsUpdateListener(id: string): void;
}

function isSettingsUpdateListenerProvider(value: unknown): value is SettingsUpdateListenerProvider {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    return (
        typeof Reflect.get(value, 'registerSettingsUpdateListener') === 'function' &&
        typeof Reflect.get(value, 'unregisterSettingsUpdateListener') === 'function'
    );
}

export class FolderMetadataService extends BaseMetadataService {
    private folderStyleChangeListener: ((folderPath: string) => void) | null = null;
    private readonly folderDisplayCache = new FolderDisplayCache();
    private readonly folderNoteMetadataAdapter: FolderNoteMetadataAdapter;
    private readonly folderDisplayCacheVaultEventRefs: EventRef[] = [];
    private folderDisplayCacheSettingsListenerProvider: SettingsUpdateListenerProvider | null = null;
    private readonly folderDisplayCacheSettingsListenerId: string;
    private folderDisplayCacheUnsubscribe: (() => void) | null = null;
    private folderDisplayVersion = 0;
    private readonly folderDisplayListeners = new Set<(version: number) => void>();
    private folderDisplayNameVersion = 0;
    private readonly folderDisplayNameListeners = new Set<(version: number) => void>();
    private static folderDisplayCacheSettingsListenerCounter = 0;

    constructor(...args: ConstructorParameters<typeof BaseMetadataService>) {
        super(...args);
        this.folderNoteMetadataAdapter = new FolderNoteMetadataAdapter(this.app, this.settingsProvider);

        FolderMetadataService.folderDisplayCacheSettingsListenerCounter += 1;
        this.folderDisplayCacheSettingsListenerId = `folder-display-cache-${FolderMetadataService.folderDisplayCacheSettingsListenerCounter}`;
    }

    private getCurrentFolderDisplayCacheSettingsSnapshot(): FolderDisplayCacheSettingsSnapshot {
        const settings = this.settingsProvider.settings;
        return {
            useFrontmatterMetadata: settings.useFrontmatterMetadata,
            enableFolderNotes: settings.enableFolderNotes,
            inheritFolderColors: settings.inheritFolderColors,
            folderNoteName: settings.folderNoteName.trim(),
            folderNoteNamePattern: settings.folderNoteNamePattern.trim(),
            frontmatterNameField: settings.frontmatterNameField.trim(),
            frontmatterIconField: settings.frontmatterIconField.trim(),
            frontmatterColorField: settings.frontmatterColorField.trim(),
            frontmatterBackgroundField: settings.frontmatterBackgroundField.trim()
        };
    }

    private getCurrentFolderStyleRecordSource(): FolderStyleRecordSource {
        const settings = this.settingsProvider.settings;
        return {
            icons: settings.folderIcons,
            colors: settings.folderColors,
            backgrounds: settings.folderBackgroundColors
        };
    }

    private getSettingsUpdateListenerProvider(): SettingsUpdateListenerProvider | null {
        return isSettingsUpdateListenerProvider(this.settingsProvider) ? this.settingsProvider : null;
    }

    private handleFolderDisplayCacheSettingsUpdate(): void {
        let shouldClear = false;
        const settingsSnapshot = this.getCurrentFolderDisplayCacheSettingsSnapshot();
        const folderDisplayNameSettingsChanged = this.folderDisplayCache.hasDisplayNameSettingsSnapshotChanged(settingsSnapshot);

        if (this.folderDisplayCache.hasSettingsSnapshotChanged(settingsSnapshot)) {
            this.folderDisplayCache.captureSettingsSnapshot(settingsSnapshot);
            shouldClear = true;
        }

        if (
            this.folderDisplayCache.hasEntries() &&
            this.folderDisplayCache.isStyleSnapshotInitialized() &&
            this.hasFolderStyleRecordSnapshotChanged()
        ) {
            shouldClear = true;
        }

        if (shouldClear) {
            this.folderDisplayCache.clear();
        }
        if (folderDisplayNameSettingsChanged) {
            this.markFolderDisplayNamesChanged();
        } else if (shouldClear) {
            this.markFolderDisplayChanged();
        }
    }

    private ensureFolderDisplayCacheSettingsListener(): void {
        if (this.folderDisplayCacheSettingsListenerProvider) {
            return;
        }

        const provider = this.getSettingsUpdateListenerProvider();
        if (!provider) {
            return;
        }

        provider.registerSettingsUpdateListener(this.folderDisplayCacheSettingsListenerId, () => {
            this.handleFolderDisplayCacheSettingsUpdate();
        });
        this.folderDisplayCacheSettingsListenerProvider = provider;
    }

    private invalidateFolderDisplayCacheForContentChanges(changes: FileContentChange[]): {
        hasFolderDisplayChanges: boolean;
        hasFolderDisplayNameChanges: boolean;
    } {
        const settings = this.settingsProvider.settings;
        if (!settings.useFrontmatterMetadata || !settings.enableFolderNotes) {
            return {
                hasFolderDisplayChanges: false,
                hasFolderDisplayNameChanges: false
            };
        }

        const hasFolderDisplayNameChange = this.hasFolderDisplayNameMetadataChanges(changes);
        if (!this.folderDisplayCache.hasEntries()) {
            return {
                hasFolderDisplayChanges: hasFolderDisplayNameChange,
                hasFolderDisplayNameChanges: hasFolderDisplayNameChange
            };
        }

        const affectedFolderPaths = new Set<string>();
        changes.forEach(change => {
            const folderPaths = this.folderDisplayCache.getTrackedFolderPaths(change.path);
            if (!folderPaths) {
                return;
            }

            folderPaths.forEach(folderPath => {
                affectedFolderPaths.add(folderPath);
            });
        });

        affectedFolderPaths.forEach(folderPath => {
            this.folderDisplayCache.invalidateFolderAndDescendants(folderPath);
        });

        return {
            hasFolderDisplayChanges: affectedFolderPaths.size > 0 || hasFolderDisplayNameChange,
            hasFolderDisplayNameChanges: hasFolderDisplayNameChange
        };
    }

    hasFolderDisplayNameMetadataChanges(changes: FileContentChange[]): boolean {
        return this.folderNoteMetadataAdapter.hasFolderDisplayNameMetadataChanges(changes, path =>
            this.folderDisplayCache.hasTrackedFolderNotePath(path)
        );
    }

    private invalidateFolderDisplayCacheForVaultFilePath(path: string): void {
        this.invalidateFolderDisplayCacheForContentChanges([{ path, changes: {} }]);

        const parentFolderPath = getParentFolderPath(path);
        if (!this.folderNoteMetadataAdapter.isFolderNotePathForFolder(path, parentFolderPath)) {
            return;
        }

        this.folderDisplayCache.invalidateFolderAndDescendants(parentFolderPath);
    }

    private handleFolderDisplayCacheVaultCreateOrDelete(file: unknown): void {
        if (!(file instanceof TFile)) {
            return;
        }

        const settings = this.settingsProvider.settings;
        if (!settings.useFrontmatterMetadata || !settings.enableFolderNotes) {
            return;
        }

        const parentFolderPath = getParentFolderPath(file.path);
        const isTrackedFolderNotePath = this.folderDisplayCache.hasTrackedFolderNotePath(file.path);
        const isFolderNotePath = this.folderNoteMetadataAdapter.isFolderNotePathForFolder(file.path, parentFolderPath);
        this.invalidateFolderDisplayCacheForVaultFilePath(file.path);
        if (isTrackedFolderNotePath || isFolderNotePath) {
            this.markFolderDisplayNamesChanged();
        }
    }

    private handleFolderDisplayCacheVaultRename(file: unknown, oldPath: unknown): void {
        if (!(file instanceof TFile) || typeof oldPath !== 'string') {
            return;
        }

        const settings = this.settingsProvider.settings;
        if (!settings.useFrontmatterMetadata || !settings.enableFolderNotes) {
            return;
        }

        const oldParentFolderPath = getParentFolderPath(oldPath);
        const newParentFolderPath = getParentFolderPath(file.path);
        const hadTrackedOldPath = this.folderDisplayCache.hasTrackedFolderNotePath(oldPath);
        const hasTrackedNewPath = this.folderDisplayCache.hasTrackedFolderNotePath(file.path);
        const oldPathWasFolderNote = this.folderNoteMetadataAdapter.isFolderNotePathForFolder(oldPath, oldParentFolderPath);
        const newPathIsFolderNote = this.folderNoteMetadataAdapter.isFolderNotePathForFolder(file.path, newParentFolderPath);
        this.invalidateFolderDisplayCacheForVaultFilePath(oldPath);
        this.invalidateFolderDisplayCacheForVaultFilePath(file.path);
        if (hadTrackedOldPath || hasTrackedNewPath || oldPathWasFolderNote || newPathIsFolderNote) {
            this.markFolderDisplayNamesChanged();
        }
    }

    private ensureFolderDisplayCacheVaultListeners(): void {
        if (this.folderDisplayCacheVaultEventRefs.length > 0) {
            return;
        }

        const createRef = this.app.vault.on('create', file => {
            this.handleFolderDisplayCacheVaultCreateOrDelete(file);
        });
        const deleteRef = this.app.vault.on('delete', file => {
            this.handleFolderDisplayCacheVaultCreateOrDelete(file);
        });
        const renameRef = this.app.vault.on('rename', (file, oldPath) => {
            this.handleFolderDisplayCacheVaultRename(file, oldPath);
        });

        this.folderDisplayCacheVaultEventRefs.push(createRef, deleteRef, renameRef);
    }

    private ensureFolderDisplayCacheState(): void {
        const settingsSnapshot = this.getCurrentFolderDisplayCacheSettingsSnapshot();
        if (this.folderDisplayCache.hasSettingsSnapshotChanged(settingsSnapshot)) {
            this.folderDisplayCache.captureSettingsSnapshot(settingsSnapshot);
            this.folderDisplayCache.clear();
        }
        this.ensureFolderDisplayCacheSettingsListener();

        if (!this.folderDisplayCacheUnsubscribe) {
            const db = getDBInstanceOrNull();
            if (db) {
                this.folderDisplayCacheUnsubscribe = db.onContentChange(changes => {
                    const { hasFolderDisplayChanges, hasFolderDisplayNameChanges } =
                        this.invalidateFolderDisplayCacheForContentChanges(changes);
                    if (hasFolderDisplayNameChanges) {
                        this.markFolderDisplayNamesChanged();
                    } else if (hasFolderDisplayChanges) {
                        this.markFolderDisplayChanged();
                    }
                });
            }
        }

        this.ensureFolderDisplayCacheVaultListeners();
    }

    private markFolderDisplayChanged(): void {
        this.folderDisplayVersion += 1;
        this.folderDisplayListeners.forEach(listener => listener(this.folderDisplayVersion));
    }

    private markFolderDisplayNamesChanged(): void {
        this.markFolderDisplayChanged();
        this.folderDisplayNameVersion += 1;
        this.folderDisplayNameListeners.forEach(listener => listener(this.folderDisplayNameVersion));
    }

    getFolderDisplayVersion(): number {
        return this.folderDisplayVersion;
    }

    subscribeToFolderDisplayChanges(listener: (version: number) => void): () => void {
        this.folderDisplayListeners.add(listener);
        return () => this.folderDisplayListeners.delete(listener);
    }

    getFolderDisplayNameVersion(): number {
        return this.folderDisplayNameVersion;
    }

    subscribeToFolderDisplayNameChanges(listener: (version: number) => void): () => void {
        this.folderDisplayNameListeners.add(listener);
        return () => this.folderDisplayNameListeners.delete(listener);
    }

    dispose(): void {
        if (this.folderDisplayCacheUnsubscribe) {
            this.folderDisplayCacheUnsubscribe();
            this.folderDisplayCacheUnsubscribe = null;
        }

        if (this.folderDisplayListeners.size > 0) {
            this.folderDisplayListeners.clear();
        }

        if (this.folderDisplayNameListeners.size > 0) {
            this.folderDisplayNameListeners.clear();
        }

        if (this.folderDisplayCacheSettingsListenerProvider) {
            this.folderDisplayCacheSettingsListenerProvider.unregisterSettingsUpdateListener(this.folderDisplayCacheSettingsListenerId);
            this.folderDisplayCacheSettingsListenerProvider = null;
        }

        if (this.folderDisplayCacheVaultEventRefs.length > 0) {
            this.folderDisplayCacheVaultEventRefs.forEach(eventRef => {
                this.app.vault.offref(eventRef);
            });
            this.folderDisplayCacheVaultEventRefs.length = 0;
        }

        this.folderDisplayCache.clear();
    }

    setFolderStyleChangeListener(listener: ((folderPath: string) => void) | null): void {
        this.folderStyleChangeListener = listener;
    }

    isFolderStyleEventBridgeEnabled(): boolean {
        return this.folderStyleChangeListener !== null;
    }

    private hasFolderDisplayStyleChanged(left: FolderDisplayData, right: FolderDisplayData): boolean {
        return left.color !== right.color || left.backgroundColor !== right.backgroundColor || left.icon !== right.icon;
    }

    private validateFolder(folderPath: string): boolean {
        return this.app.vault.getFolderByPath(folderPath) !== null;
    }

    private getFolderStyleFromSettings(folderPath: string): FolderStyleValues {
        return {
            icon: this.getEntityIcon(ItemType.FOLDER, folderPath),
            color: this.getEntityColor(ItemType.FOLDER, folderPath),
            backgroundColor: this.getEntityBackgroundColor(ItemType.FOLDER, folderPath)
        };
    }

    private trackFolderNotePathForCachedFolder(folderPath: string): void {
        const settings = this.settingsProvider.settings;
        if (!settings.useFrontmatterMetadata || !settings.enableFolderNotes) {
            this.folderDisplayCache.untrackFolderNotePathForFolder(folderPath);
            return;
        }

        this.folderDisplayCache.trackFolderNotePath(folderPath, this.folderNoteMetadataAdapter.getCurrentFolderNotePath(folderPath));
    }

    private hasOwnFolderStyleEntry(record: Record<string, string> | undefined, key: string): boolean {
        return Boolean(record && Object.prototype.hasOwnProperty.call(record, key));
    }

    private hasFolderStyleRecordSnapshotChanged(): boolean {
        return this.folderDisplayCache.hasStyleSnapshotChanged(this.getCurrentFolderStyleRecordSource());
    }

    private async syncFolderStyleSettings(
        folderPath: string,
        updates: FolderStyleUpdate,
        handledByFrontmatter: { icon: boolean; color: boolean; backgroundColor: boolean }
    ): Promise<boolean> {
        if (
            updates.icon === undefined &&
            updates.color === undefined &&
            updates.backgroundColor === undefined &&
            !handledByFrontmatter.icon &&
            !handledByFrontmatter.color &&
            !handledByFrontmatter.backgroundColor
        ) {
            return false;
        }

        let changed = false;
        await this.saveAndUpdate(settings => {
            let hasChanges = false;

            if (handledByFrontmatter.icon) {
                if (this.hasOwnFolderStyleEntry(settings.folderIcons, folderPath)) {
                    delete settings.folderIcons[folderPath];
                    hasChanges = true;
                }
            } else if (updates.icon !== undefined) {
                const currentIcon = this.hasOwnFolderStyleEntry(settings.folderIcons, folderPath)
                    ? settings.folderIcons[folderPath]
                    : undefined;
                const nextIcon =
                    updates.icon === null
                        ? undefined
                        : typeof updates.icon === 'string'
                          ? (normalizeCanonicalIconId(updates.icon) ?? undefined)
                          : undefined;

                if (nextIcon !== currentIcon) {
                    const icons = ensureRecord(settings.folderIcons, isStringRecordValue);
                    if (nextIcon === undefined) {
                        delete icons[folderPath];
                    } else {
                        icons[folderPath] = nextIcon;
                    }
                    settings.folderIcons = icons;
                    hasChanges = true;
                }
            }

            if (handledByFrontmatter.color) {
                if (this.hasOwnFolderStyleEntry(settings.folderColors, folderPath)) {
                    delete settings.folderColors[folderPath];
                    hasChanges = true;
                }
            } else if (updates.color !== undefined) {
                const currentColor = this.hasOwnFolderStyleEntry(settings.folderColors, folderPath)
                    ? settings.folderColors[folderPath]
                    : undefined;
                const nextColor = updates.color === null ? undefined : updates.color;

                if (nextColor !== currentColor) {
                    const colors = ensureRecord(settings.folderColors, isStringRecordValue);
                    if (nextColor === undefined) {
                        delete colors[folderPath];
                    } else {
                        colors[folderPath] = nextColor;
                    }
                    settings.folderColors = colors;
                    hasChanges = true;
                }
            }

            if (handledByFrontmatter.backgroundColor) {
                if (this.hasOwnFolderStyleEntry(settings.folderBackgroundColors, folderPath)) {
                    delete settings.folderBackgroundColors[folderPath];
                    hasChanges = true;
                }
            } else if (updates.backgroundColor !== undefined) {
                const currentBackground = this.hasOwnFolderStyleEntry(settings.folderBackgroundColors, folderPath)
                    ? settings.folderBackgroundColors[folderPath]
                    : undefined;
                const nextBackground = updates.backgroundColor === null ? undefined : updates.backgroundColor;

                if (nextBackground !== currentBackground) {
                    const backgrounds = ensureRecord(settings.folderBackgroundColors, isStringRecordValue);
                    if (nextBackground === undefined) {
                        delete backgrounds[folderPath];
                    } else {
                        backgrounds[folderPath] = nextBackground;
                    }
                    settings.folderBackgroundColors = backgrounds;
                    hasChanges = true;
                }
            }

            changed = hasChanges;
            return hasChanges;
        });

        return changed;
    }

    async setFolderStyle(folderPath: string, updates: FolderStyleUpdate): Promise<void> {
        if (!this.validateFolder(folderPath)) {
            return;
        }

        const normalizedUpdates: FolderStyleUpdate = {
            icon: updates.icon,
            color: updates.color,
            backgroundColor: updates.backgroundColor
        };
        if (typeof normalizedUpdates.color === 'string' && !this.validateColor(normalizedUpdates.color)) {
            normalizedUpdates.color = undefined;
        }
        if (typeof normalizedUpdates.backgroundColor === 'string' && !this.validateColor(normalizedUpdates.backgroundColor)) {
            normalizedUpdates.backgroundColor = undefined;
        }

        const hasIconUpdate = normalizedUpdates.icon !== undefined;
        const hasColorUpdate = normalizedUpdates.color !== undefined;
        const hasBackgroundUpdate = normalizedUpdates.backgroundColor !== undefined;
        if (!hasIconUpdate && !hasColorUpdate && !hasBackgroundUpdate) {
            return;
        }

        const directDisplayDataBefore =
            this.folderStyleChangeListener !== null
                ? this.resolveFolderDisplayData(folderPath, {
                      includeDisplayName: false,
                      includeColor: true,
                      includeBackgroundColor: true,
                      includeIcon: true,
                      includeInheritedColors: false
                  })
                : null;

        const invalidateFolderDisplayCacheForStyleUpdate = (): void => {
            if (hasColorUpdate || hasBackgroundUpdate) {
                this.folderDisplayCache.invalidateFolderAndDescendants(folderPath);
                return;
            }
            this.folderDisplayCache.invalidateFolder(folderPath);
        };

        invalidateFolderDisplayCacheForStyleUpdate();
        const handledByFrontmatter = await this.folderNoteMetadataAdapter.writeFolderStyleToFrontmatter(
            folderPath,
            normalizedUpdates,
            this.getFolderStyleFromSettings(folderPath)
        );
        const settingsChanged = await this.syncFolderStyleSettings(folderPath, normalizedUpdates, handledByFrontmatter);
        const hadFrontmatterStyleUpdate = handledByFrontmatter.icon || handledByFrontmatter.color || handledByFrontmatter.backgroundColor;

        if (settingsChanged) {
            invalidateFolderDisplayCacheForStyleUpdate();
        }

        if (this.folderStyleChangeListener && directDisplayDataBefore && hadFrontmatterStyleUpdate && !settingsChanged) {
            const directDisplayDataAfter = this.resolveFolderDisplayData(folderPath, {
                includeDisplayName: false,
                includeColor: true,
                includeBackgroundColor: true,
                includeIcon: true,
                includeInheritedColors: false
            });

            if (this.hasFolderDisplayStyleChanged(directDisplayDataBefore, directDisplayDataAfter)) {
                this.markFolderDisplayChanged();
                this.folderStyleChangeListener(folderPath);
            }
        }
    }

    async setFolderColor(folderPath: string, color: string): Promise<void> {
        return this.setFolderStyle(folderPath, { color });
    }

    async setFolderBackgroundColor(folderPath: string, color: string): Promise<void> {
        return this.setFolderStyle(folderPath, { backgroundColor: color });
    }

    async removeFolderColor(folderPath: string): Promise<void> {
        return this.setFolderStyle(folderPath, { color: null });
    }

    async removeFolderBackgroundColor(folderPath: string): Promise<void> {
        return this.setFolderStyle(folderPath, { backgroundColor: null });
    }

    private resolveFolderDisplayData(folderPath: string, options: FolderDisplayResolveOptions): FolderDisplayData {
        const settings = this.settingsProvider.settings;
        return resolveFolderDisplayData({
            folderPath,
            resolveOptions: options,
            useFrontmatterMetadata: settings.useFrontmatterMetadata,
            directStyle: this.getFolderStyleFromSettings(folderPath),
            frontmatterFields: this.folderNoteMetadataAdapter.getFolderFrontmatterFields(),
            getFolderNoteMetadata: path => this.folderNoteMetadataAdapter.getFolderNoteMetadata(path),
            resolveInheritedFolderStyleValues: needs =>
                resolveInheritedFolderStyleValues({
                    folderPath,
                    inheritFolderColors: settings.inheritFolderColors,
                    needs,
                    getFolderDisplayData: (targetFolderPath, resolveOptions) => this.getFolderDisplayData(targetFolderPath, resolveOptions)
                })
        });
    }

    getFolderDisplayData(
        folderPath: string,
        options?: {
            includeDisplayName?: boolean;
            includeColor?: boolean;
            includeBackgroundColor?: boolean;
            includeIcon?: boolean;
            includeInheritedColors?: boolean;
        }
    ): FolderDisplayData {
        this.ensureFolderDisplayCacheState();
        const resolvedOptions: FolderDisplayResolveOptions = {
            includeDisplayName: options?.includeDisplayName ?? true,
            includeColor: options?.includeColor ?? true,
            includeBackgroundColor: options?.includeBackgroundColor ?? true,
            includeIcon: options?.includeIcon ?? true,
            includeInheritedColors: options?.includeInheritedColors ?? true
        };

        const cached = this.folderDisplayCache.get(folderPath, resolvedOptions);
        if (cached) {
            return { ...cached };
        }

        const resolved = this.resolveFolderDisplayData(folderPath, resolvedOptions);
        this.trackFolderNotePathForCachedFolder(folderPath);
        this.folderDisplayCache.set(folderPath, resolvedOptions, resolved, this.getCurrentFolderStyleRecordSource());
        return { ...resolved };
    }

    getFolderColor(folderPath: string): string | undefined {
        return this.getFolderDisplayData(folderPath, {
            includeDisplayName: false,
            includeColor: true,
            includeBackgroundColor: false,
            includeIcon: false,
            includeInheritedColors: true
        }).color;
    }

    getFolderBackgroundColor(folderPath: string): string | undefined {
        return this.getFolderDisplayData(folderPath, {
            includeDisplayName: false,
            includeColor: false,
            includeBackgroundColor: true,
            includeIcon: false,
            includeInheritedColors: true
        }).backgroundColor;
    }

    async setFolderIcon(folderPath: string, iconId: string): Promise<void> {
        return this.setFolderStyle(folderPath, { icon: iconId });
    }

    async removeFolderIcon(folderPath: string): Promise<void> {
        return this.setFolderStyle(folderPath, { icon: null });
    }

    getFolderIcon(folderPath: string): string | undefined {
        return this.getFolderDisplayData(folderPath, {
            includeDisplayName: false,
            includeColor: false,
            includeBackgroundColor: false,
            includeIcon: true,
            includeInheritedColors: true
        }).icon;
    }

    async setFolderSortOverride(folderPath: string, sortOverride: ListSortOverrideValue): Promise<void> {
        if (!this.validateFolder(folderPath)) {
            return;
        }
        return this.setEntitySortOverride(ItemType.FOLDER, folderPath, sortOverride);
    }

    async removeFolderSortOverride(folderPath: string): Promise<void> {
        return this.removeEntitySortOverride(ItemType.FOLDER, folderPath);
    }

    getFolderSortOverride(folderPath: string): ListSortOverrideValue | undefined {
        return this.getEntitySortOverride(ItemType.FOLDER, folderPath);
    }

    async setFolderChildSortOrderOverride(folderPath: string, sortOrder: AlphaSortOrder): Promise<void> {
        if (!this.validateFolder(folderPath)) {
            return;
        }
        return this.setEntityChildSortOrderOverride(ItemType.FOLDER, folderPath, sortOrder);
    }

    async removeFolderChildSortOrderOverride(folderPath: string): Promise<void> {
        return this.removeEntityChildSortOrderOverride(ItemType.FOLDER, folderPath);
    }

    getFolderChildSortOrderOverride(folderPath: string): AlphaSortOrder | undefined {
        return this.getEntityChildSortOrderOverride(ItemType.FOLDER, folderPath);
    }

    async handleFolderRename(oldPath: string, newPath: string, extraMutation?: SettingsMutation): Promise<void> {
        this.folderDisplayCache.clear();
        const matchesShortcutPath = createShortcutTargetPathEventMatcher(this.app, 'folder', oldPath, newPath);
        await this.saveAndUpdate(settings => {
            let changed = false;

            changed = this.updateNestedPaths(settings.folderColors, oldPath, newPath) || changed;
            changed = this.updateNestedPaths(settings.folderBackgroundColors, oldPath, newPath) || changed;
            changed = this.updateNestedPaths(settings.folderIcons, oldPath, newPath) || changed;
            changed = this.updateNestedPaths(settings.folderSortOverrides, oldPath, newPath) || changed;
            changed = this.updateNestedPaths(settings.folderTreeSortOverrides, oldPath, newPath) || changed;
            changed = this.updateNestedPaths(settings.folderAppearances, oldPath, newPath) || changed;
            changed =
                updateCollapsedPinnedContextKeys(settings.collapsedPinnedContexts, ItemType.FOLDER, oldPath, newPath, {
                    descendantDelimiter: '/'
                }) || changed;

            const shortcutsChanged = this.updateShortcuts(settings, shortcut => {
                if (!isFolderShortcut(shortcut) || !matchesShortcutPath(shortcut.path)) {
                    return undefined;
                }

                return {
                    ...shortcut,
                    path: newPath
                };
            });
            changed = shortcutsChanged || changed;

            if (extraMutation) {
                changed = extraMutation(settings) || changed;
            }

            return changed;
        });
    }

    async handleFolderDelete(folderPath: string, extraMutation?: SettingsMutation): Promise<void> {
        this.folderDisplayCache.clear();
        const matchesShortcutPath = createShortcutTargetPathEventMatcher(this.app, 'folder', folderPath);
        await this.saveAndUpdate(settings => {
            let changed = false;

            changed = this.deleteNestedPaths(settings.folderColors, folderPath) || changed;
            changed = this.deleteNestedPaths(settings.folderBackgroundColors, folderPath) || changed;
            changed = this.deleteNestedPaths(settings.folderIcons, folderPath) || changed;
            changed = this.deleteNestedPaths(settings.folderSortOverrides, folderPath) || changed;
            changed = this.deleteNestedPaths(settings.folderTreeSortOverrides, folderPath) || changed;
            changed = this.deleteNestedPaths(settings.folderAppearances, folderPath) || changed;
            changed =
                deleteCollapsedPinnedContextKeys(settings.collapsedPinnedContexts, ItemType.FOLDER, folderPath, {
                    descendantDelimiter: '/'
                }) || changed;

            const shortcutsChanged = this.updateShortcuts(settings, shortcut => {
                if (!isFolderShortcut(shortcut)) {
                    return undefined;
                }
                return matchesShortcutPath(shortcut.path) ? null : undefined;
            });
            changed = shortcutsChanged || changed;

            if (extraMutation) {
                changed = extraMutation(settings) || changed;
            }

            return changed;
        });
    }

    async cleanupFolderMetadata(targetSettings: NotebookNavigatorSettings = this.settingsProvider.settings): Promise<boolean> {
        this.folderDisplayCache.clear();
        const validator = (path: string) => this.app.vault.getFolderByPath(path) !== null;
        const collapsedPinnedContextChanges = cleanupCollapsedPinnedContextKeys(
            targetSettings.collapsedPinnedContexts,
            ItemType.FOLDER,
            validator
        );

        const results = await Promise.all([
            this.cleanupMetadata(targetSettings, 'folderColors', validator),
            this.cleanupMetadata(targetSettings, 'folderBackgroundColors', validator),
            this.cleanupMetadata(targetSettings, 'folderIcons', validator),
            this.cleanupMetadata(targetSettings, 'folderSortOverrides', validator),
            this.cleanupMetadata(targetSettings, 'folderTreeSortOverrides', validator),
            this.cleanupMetadata(targetSettings, 'folderAppearances', validator)
        ]);

        return collapsedPinnedContextChanges || results.some(changed => changed);
    }

    async cleanupWithValidators(
        validators: CleanupValidators,
        targetSettings: NotebookNavigatorSettings = this.settingsProvider.settings
    ): Promise<boolean> {
        this.folderDisplayCache.clear();
        const validator = (path: string) => validators.vaultFolders.has(path);
        const collapsedPinnedContextChanges = cleanupCollapsedPinnedContextKeys(
            targetSettings.collapsedPinnedContexts,
            ItemType.FOLDER,
            validator
        );

        const results = await Promise.all([
            this.cleanupMetadata(targetSettings, 'folderColors', validator),
            this.cleanupMetadata(targetSettings, 'folderBackgroundColors', validator),
            this.cleanupMetadata(targetSettings, 'folderIcons', validator),
            this.cleanupMetadata(targetSettings, 'folderSortOverrides', validator),
            this.cleanupMetadata(targetSettings, 'folderTreeSortOverrides', validator),
            this.cleanupMetadata(targetSettings, 'folderAppearances', validator)
        ]);

        return collapsedPinnedContextChanges || results.some(changed => changed);
    }
}
