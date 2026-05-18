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

import { App, TFolder } from 'obsidian';
import type { AlphaSortOrder, ListSortOverrideValue, NotebookNavigatorSettings } from '../settings';
import { ISettingsProvider } from '../interfaces/ISettingsProvider';
import { ITagTreeProvider } from '../interfaces/ITagTreeProvider';
import type { IPropertyTreeProvider } from '../interfaces/IPropertyTreeProvider';
import {
    FolderMetadataService,
    TagMetadataService,
    PropertyMetadataService,
    FileMetadataService,
    NavigationSeparatorService,
    type FolderDisplayData,
    type TagColorData,
    type PropertyColorData,
    type FileMetadataMigrationResult
} from './metadata';
import { TagTreeNode } from '../types/storage';
import type { FileData } from '../storage/IndexedDBStorage';
import { getDBInstance } from '../storage/fileOperations';
import { NavigatorContext } from '../types';
import type { NavigationSeparatorTarget } from '../utils/navigationSeparators';
import { buildPropertyKeyNodeId } from '../utils/propertyTree';
import { casefold, getCollapsedPinnedContextTarget } from '../utils/recordUtils';
import { buildTagTreeFromDatabase } from '../utils/tagTree';

/**
 * Validators object containing all data needed for cleanup operations
 */
export interface CleanupValidators {
    dbFiles: { path: string; data: FileData }[];
    tagTree: Map<string, TagTreeNode>;
    vaultFiles: Set<string>;
    vaultFolders: Set<string>; // Actual folder paths from vault
}

export interface MetadataCleanupSummary {
    folders: number;
    tags: number;
    properties: number;
    files: number;
    pinnedNotes: number;
    separators: number;
    total: number;
}

/**
 * Service for managing all folder, tag, and file metadata operations
 * Delegates to specialized sub-services for better organization
 * Provides a unified API for metadata operations
 */
export class MetadataService {
    private fileService: FileMetadataService;
    private folderService: FolderMetadataService;
    private tagService: TagMetadataService;
    private propertyService: PropertyMetadataService;
    private navigationSeparatorService: NavigationSeparatorService;
    private settingsProvider: ISettingsProvider;

    /**
     * Creates a new MetadataService instance
     * @param app - The Obsidian app instance
     * @param settingsProvider - Provider for accessing and saving settings
     * @param getTagTreeProvider - Function to get the tag tree provider
     * @param getPropertyTreeProvider - Function to get the property tree provider
     */
    constructor(
        private readonly app: App,
        settingsProvider: ISettingsProvider,
        getTagTreeProvider: () => ITagTreeProvider | null,
        getPropertyTreeProvider?: () => IPropertyTreeProvider | null
    ) {
        this.settingsProvider = settingsProvider;
        // Initialize sub-services
        this.folderService = new FolderMetadataService(app, settingsProvider);
        this.tagService = new TagMetadataService(app, settingsProvider, getTagTreeProvider);
        this.propertyService = new PropertyMetadataService(app, settingsProvider);
        this.fileService = new FileMetadataService(app, settingsProvider);
        this.navigationSeparatorService = new NavigationSeparatorService(
            app,
            settingsProvider,
            getTagTreeProvider,
            getPropertyTreeProvider
        );
    }

    /**
     * Gets the settings provider for accessing and saving settings
     * @returns The settings provider instance
     */
    getSettingsProvider(): ISettingsProvider {
        return this.settingsProvider;
    }

    dispose(): void {
        this.folderService.dispose();
    }

    setFolderStyleChangeListener(listener: ((folderPath: string) => void) | null): void {
        this.folderService.setFolderStyleChangeListener(listener);
    }

    isFolderStyleEventBridgeEnabled(): boolean {
        return this.folderService.isFolderStyleEventBridgeEnabled();
    }

    // ========== Folder Methods (delegated to FolderMetadataService) ==========

    async setFolderColor(folderPath: string, color: string): Promise<void> {
        return this.folderService.setFolderColor(folderPath, color);
    }

    async setFolderBackgroundColor(folderPath: string, color: string): Promise<void> {
        return this.folderService.setFolderBackgroundColor(folderPath, color);
    }

    async setFolderStyle(
        folderPath: string,
        style: {
            icon?: string | null;
            color?: string | null;
            backgroundColor?: string | null;
        }
    ): Promise<void> {
        return this.folderService.setFolderStyle(folderPath, style);
    }

    async removeFolderColor(folderPath: string): Promise<void> {
        return this.folderService.removeFolderColor(folderPath);
    }

    async removeFolderBackgroundColor(folderPath: string): Promise<void> {
        return this.folderService.removeFolderBackgroundColor(folderPath);
    }

    getFolderColor(folderPath: string): string | undefined {
        return this.folderService.getFolderColor(folderPath);
    }

    getFolderBackgroundColor(folderPath: string): string | undefined {
        return this.folderService.getFolderBackgroundColor(folderPath);
    }

    async setFolderIcon(folderPath: string, iconId: string): Promise<void> {
        return this.folderService.setFolderIcon(folderPath, iconId);
    }

    async removeFolderIcon(folderPath: string): Promise<void> {
        return this.folderService.removeFolderIcon(folderPath);
    }

    getFolderIcon(folderPath: string): string | undefined {
        return this.folderService.getFolderIcon(folderPath);
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
        return this.folderService.getFolderDisplayData(folderPath, options);
    }

    getFolderDisplayVersion(): number {
        return this.folderService.getFolderDisplayVersion();
    }

    subscribeToFolderDisplayChanges(listener: (version: number) => void): () => void {
        return this.folderService.subscribeToFolderDisplayChanges(listener);
    }

    getFolderDisplayNameVersion(): number {
        return this.folderService.getFolderDisplayNameVersion();
    }

    subscribeToFolderDisplayNameChanges(listener: (version: number) => void): () => void {
        return this.folderService.subscribeToFolderDisplayNameChanges(listener);
    }

    async setFolderSortOverride(folderPath: string, sortOverride: ListSortOverrideValue): Promise<void> {
        return this.folderService.setFolderSortOverride(folderPath, sortOverride);
    }

    async removeFolderSortOverride(folderPath: string): Promise<void> {
        return this.folderService.removeFolderSortOverride(folderPath);
    }

    getFolderSortOverride(folderPath: string): ListSortOverrideValue | undefined {
        return this.folderService.getFolderSortOverride(folderPath);
    }

    async setFolderChildSortOrderOverride(folderPath: string, sortOrder: AlphaSortOrder): Promise<void> {
        return this.folderService.setFolderChildSortOrderOverride(folderPath, sortOrder);
    }

    async removeFolderChildSortOrderOverride(folderPath: string): Promise<void> {
        return this.folderService.removeFolderChildSortOrderOverride(folderPath);
    }

    getFolderChildSortOrderOverride(folderPath: string): AlphaSortOrder | undefined {
        return this.folderService.getFolderChildSortOrderOverride(folderPath);
    }

    async handleFolderRename(oldPath: string, newPath: string): Promise<void> {
        await this.folderService.handleFolderRename(oldPath, newPath, settings =>
            this.navigationSeparatorService.applyFolderRename(settings, oldPath, newPath)
        );
    }

    async handleFolderDelete(folderPath: string): Promise<void> {
        await this.folderService.handleFolderDelete(folderPath, settings =>
            this.navigationSeparatorService.applyFolderDelete(settings, folderPath)
        );
    }

    // ========== Tag Methods (delegated to TagMetadataService) ==========

    async setTagColor(tagPath: string, color: string): Promise<void> {
        return this.tagService.setTagColor(tagPath, color);
    }

    async setTagBackgroundColor(tagPath: string, color: string): Promise<void> {
        return this.tagService.setTagBackgroundColor(tagPath, color);
    }

    async removeTagColor(tagPath: string): Promise<void> {
        return this.tagService.removeTagColor(tagPath);
    }

    async removeTagBackgroundColor(tagPath: string): Promise<void> {
        return this.tagService.removeTagBackgroundColor(tagPath);
    }

    getTagColor(tagPath: string): string | undefined {
        return this.tagService.getTagColor(tagPath);
    }

    getTagBackgroundColor(tagPath: string): string | undefined {
        return this.tagService.getTagBackgroundColor(tagPath);
    }

    getTagColorData(tagPath: string): TagColorData {
        // Returns resolved tag color/background, including inherited values when enabled.
        return this.tagService.getTagColorData(tagPath);
    }

    async setTagIcon(tagPath: string, iconId: string): Promise<void> {
        return this.tagService.setTagIcon(tagPath, iconId);
    }

    async removeTagIcon(tagPath: string): Promise<void> {
        return this.tagService.removeTagIcon(tagPath);
    }

    getTagIcon(tagPath: string): string | undefined {
        return this.tagService.getTagIcon(tagPath);
    }

    /**
     * Updates tag metadata when a tag is renamed, optionally preserving existing overrides at the new path
     */
    async handleTagRename(oldPath: string, newPath: string, preserveExisting = false): Promise<void> {
        await this.tagService.handleTagRename(oldPath, newPath, preserveExisting, settings =>
            this.navigationSeparatorService.applyTagRename(settings, oldPath, newPath, preserveExisting)
        );
    }

    /**
     * Removes all metadata associated with a tag and its descendants
     */
    async handleTagDelete(tagPath: string): Promise<void> {
        await this.tagService.handleTagDelete(tagPath, settings => this.navigationSeparatorService.applyTagDelete(settings, tagPath));
    }

    async setTagSortOverride(tagPath: string, sortOverride: ListSortOverrideValue): Promise<void> {
        return this.tagService.setTagSortOverride(tagPath, sortOverride);
    }

    async removeTagSortOverride(tagPath: string): Promise<void> {
        return this.tagService.removeTagSortOverride(tagPath);
    }

    getTagSortOverride(tagPath: string): ListSortOverrideValue | undefined {
        return this.tagService.getTagSortOverride(tagPath);
    }

    async setTagChildSortOrderOverride(tagPath: string, sortOrder: AlphaSortOrder): Promise<void> {
        return this.tagService.setTagChildSortOrderOverride(tagPath, sortOrder);
    }

    async removeTagChildSortOrderOverride(tagPath: string): Promise<void> {
        return this.tagService.removeTagChildSortOrderOverride(tagPath);
    }

    getTagChildSortOrderOverride(tagPath: string): AlphaSortOrder | undefined {
        return this.tagService.getTagChildSortOrderOverride(tagPath);
    }

    // ========== Property Methods (delegated to PropertyMetadataService) ==========

    async setPropertyColor(nodeId: string, color: string): Promise<void> {
        return this.propertyService.setPropertyColor(nodeId, color);
    }

    async setPropertyBackgroundColor(nodeId: string, color: string): Promise<void> {
        return this.propertyService.setPropertyBackgroundColor(nodeId, color);
    }

    async removePropertyColor(nodeId: string): Promise<void> {
        return this.propertyService.removePropertyColor(nodeId);
    }

    async removePropertyBackgroundColor(nodeId: string): Promise<void> {
        return this.propertyService.removePropertyBackgroundColor(nodeId);
    }

    getPropertyColor(nodeId: string): string | undefined {
        return this.propertyService.getPropertyColor(nodeId);
    }

    getPropertyBackgroundColor(nodeId: string): string | undefined {
        return this.propertyService.getPropertyBackgroundColor(nodeId);
    }

    getPropertyColorData(nodeId: string): PropertyColorData {
        return this.propertyService.getPropertyColorData(nodeId);
    }

    async setPropertyIcon(nodeId: string, iconId: string): Promise<void> {
        return this.propertyService.setPropertyIcon(nodeId, iconId);
    }

    async removePropertyIcon(nodeId: string): Promise<void> {
        return this.propertyService.removePropertyIcon(nodeId);
    }

    getPropertyIcon(nodeId: string): string | undefined {
        return this.propertyService.getPropertyIcon(nodeId);
    }

    async setPropertySortOverride(nodeId: string, sortOverride: ListSortOverrideValue): Promise<void> {
        return this.propertyService.setPropertySortOverride(nodeId, sortOverride);
    }

    async removePropertySortOverride(nodeId: string): Promise<void> {
        return this.propertyService.removePropertySortOverride(nodeId);
    }

    getPropertySortOverride(nodeId: string): ListSortOverrideValue | undefined {
        return this.propertyService.getPropertySortOverride(nodeId);
    }

    async setPropertyChildSortOrderOverride(nodeId: string, sortOrder: AlphaSortOrder): Promise<void> {
        return this.propertyService.setPropertyChildSortOrderOverride(nodeId, sortOrder);
    }

    async removePropertyChildSortOrderOverride(nodeId: string): Promise<void> {
        return this.propertyService.removePropertyChildSortOrderOverride(nodeId);
    }

    getPropertyChildSortOrderOverride(nodeId: string): AlphaSortOrder | undefined {
        return this.propertyService.getPropertyChildSortOrderOverride(nodeId);
    }

    // ========== Navigation Separator Methods ==========

    getNavigationSeparators(): Record<string, boolean> {
        return this.navigationSeparatorService.getSeparators();
    }

    hasNavigationSeparator(target: NavigationSeparatorTarget): boolean {
        return this.navigationSeparatorService.hasSeparator(target);
    }

    async addNavigationSeparator(target: NavigationSeparatorTarget): Promise<void> {
        return this.navigationSeparatorService.setSeparator(target);
    }

    async removeNavigationSeparator(target: NavigationSeparatorTarget): Promise<void> {
        return this.navigationSeparatorService.removeSeparator(target);
    }

    getNavigationSeparatorsVersion(): number {
        return this.navigationSeparatorService.getVersion();
    }

    subscribeToNavigationSeparatorChanges(listener: (version: number) => void): () => void {
        return this.navigationSeparatorService.subscribe(listener);
    }

    // ========== File/Pinned Notes Methods (delegated to FileMetadataService) ==========

    async togglePin(filePath: string, context: NavigatorContext): Promise<void> {
        return this.fileService.togglePinnedNote(filePath, context);
    }

    async pinNotes(filePaths: string[], context: NavigatorContext): Promise<number> {
        return this.fileService.pinNotes(filePaths, context);
    }

    isFilePinned(filePath: string, context?: NavigatorContext): boolean {
        return this.fileService.isPinned(filePath, context);
    }

    getPinnedNotes(context?: NavigatorContext): string[] {
        return this.fileService.getPinnedNotes(context);
    }

    async setFileIcon(filePath: string, iconId: string): Promise<void> {
        return this.fileService.setFileIcon(filePath, iconId);
    }

    async removeFileIcon(filePath: string): Promise<void> {
        return this.fileService.removeFileIcon(filePath);
    }

    /**
     * Gets the icon for a file, checking frontmatter first if enabled
     * @param filePath - Path to the file
     * @returns Icon ID if found, undefined otherwise
     */
    getFileIcon(filePath: string): string | undefined {
        const settings = this.settingsProvider.settings;
        // Check frontmatter metadata first if enabled
        if (settings.useFrontmatterMetadata) {
            const db = getDBInstance();
            const record = db.getFile(filePath);
            const frontmatterIcon = record?.metadata?.icon?.trim();
            if (frontmatterIcon) {
                return frontmatterIcon;
            }
        }
        // Fall back to settings-based storage
        return this.fileService.getFileIcon(filePath);
    }

    async setFileColor(filePath: string, color: string): Promise<void> {
        return this.fileService.setFileColor(filePath, color);
    }

    async removeFileColor(filePath: string): Promise<void> {
        return this.fileService.removeFileColor(filePath);
    }

    async setFileBackgroundColor(filePath: string, color: string): Promise<void> {
        return this.fileService.setFileBackgroundColor(filePath, color);
    }

    async removeFileBackgroundColor(filePath: string): Promise<void> {
        return this.fileService.removeFileBackgroundColor(filePath);
    }

    /**
     * Gets the color for a file, checking frontmatter first if enabled
     * @param filePath - Path to the file
     * @returns Color value if found, undefined otherwise
     */
    getFileColor(filePath: string): string | undefined {
        const settings = this.settingsProvider.settings;
        // Check frontmatter metadata first if enabled
        if (settings.useFrontmatterMetadata) {
            const db = getDBInstance();
            const record = db.getFile(filePath);
            const frontmatterColor = record?.metadata?.color?.trim();
            if (frontmatterColor) {
                return frontmatterColor;
            }
        }
        // Fall back to settings-based storage
        return this.fileService.getFileColor(filePath);
    }

    /**
     * Gets the background color for a file, checking frontmatter first if enabled
     * @param filePath - Path to the file
     * @returns Background color value if found, undefined otherwise
     */
    getFileBackgroundColor(filePath: string): string | undefined {
        const settings = this.settingsProvider.settings;
        if (settings.useFrontmatterMetadata) {
            const db = getDBInstance();
            const record = db.getFile(filePath);
            const frontmatterBackground = record?.metadata?.background?.trim();
            if (frontmatterBackground) {
                return frontmatterBackground;
            }
        }

        return this.fileService.getFileBackgroundColor(filePath);
    }

    async migrateFileMetadataToFrontmatter(): Promise<FileMetadataMigrationResult> {
        return this.fileService.migrateSettingsToFrontmatter();
    }

    async handleFileDelete(filePath: string): Promise<void> {
        return this.fileService.handleFileDelete(filePath);
    }

    async handleFileRename(oldPath: string, newPath: string): Promise<void> {
        return this.fileService.handleFileRename(oldPath, newPath);
    }

    // ========== Cleanup Operations ==========

    /**
     * Cleanup metadata for folders, tags, and files
     * Called on plugin startup to remove references to deleted items
     * @returns True if any changes were made
     */
    async cleanupAllMetadata(targetSettings: NotebookNavigatorSettings = this.settingsProvider.settings): Promise<boolean> {
        const validators = MetadataService.prepareCleanupValidators(this.app);
        return this.runUnifiedCleanup(validators, targetSettings);
    }

    /**
     * Cleanup tag metadata for tags that no longer exist in the vault
     * Called by StorageProvider after tag tree is successfully built
     * This ensures the metadata cache is ready and all parent tags are identified
     * @returns True if any changes were made
     */
    async cleanupTagMetadata(targetSettings: NotebookNavigatorSettings = this.settingsProvider.settings): Promise<boolean> {
        return this.tagService.cleanupTagMetadata(targetSettings);
    }

    /**
     * Run unified cleanup using pre-loaded data from StorageContext
     * This avoids multiple file iterations during startup
     *
     * @param validators - Object containing database files, tag tree, and vault files
     * @returns true if any changes were made
     */
    async runUnifiedCleanup(
        validators: CleanupValidators,
        targetSettings: NotebookNavigatorSettings = this.settingsProvider.settings
    ): Promise<boolean> {
        const [folderChanges, tagChanges, propertyChanges, fileChanges, separatorChanges] = await Promise.all([
            this.folderService.cleanupWithValidators(validators, targetSettings),
            this.tagService.cleanupWithValidators(validators, targetSettings),
            this.propertyService.cleanupWithValidators(validators, targetSettings),
            this.fileService.cleanupWithValidators(validators, targetSettings),
            this.navigationSeparatorService.cleanupWithValidators(validators, targetSettings)
        ]);

        return folderChanges || tagChanges || propertyChanges || fileChanges || separatorChanges;
    }

    async getCleanupSummary(): Promise<MetadataCleanupSummary> {
        const clonedSettings = MetadataService.cloneSettings(this.settingsProvider.settings);
        const before = MetadataService.computeMetadataCounts(clonedSettings);
        await this.cleanupAllMetadata(clonedSettings);
        const after = MetadataService.computeMetadataCounts(clonedSettings);

        const folders = Math.max(0, before.folders - after.folders);
        const tags = Math.max(0, before.tags - after.tags);
        const properties = Math.max(0, before.properties - after.properties);
        const files = Math.max(0, before.files - after.files);
        const pinnedNotes = Math.max(0, before.pinnedNotes - after.pinnedNotes);
        const separators = Math.max(0, before.separators - after.separators);
        const total = folders + tags + properties + files + pinnedNotes + separators;

        return { folders, tags, properties, files, pinnedNotes, separators, total };
    }

    private static cloneSettings(settings: NotebookNavigatorSettings): NotebookNavigatorSettings {
        return JSON.parse(JSON.stringify(settings)) as NotebookNavigatorSettings;
    }

    private static computeMetadataCounts(settings: NotebookNavigatorSettings) {
        const folderKeys = MetadataService.collectUniqueKeys([
            settings.folderColors,
            settings.folderBackgroundColors,
            settings.folderIcons,
            settings.folderSortOverrides,
            settings.folderAppearances
        ]);

        const tagKeys = MetadataService.collectUniqueKeys([
            settings.tagColors,
            settings.tagBackgroundColors,
            settings.tagIcons,
            settings.tagSortOverrides,
            settings.tagAppearances
        ]);

        const fileKeys = MetadataService.collectUniqueKeys([settings.fileIcons, settings.fileColors, settings.fileBackgroundColors]);
        const propertyKeys = MetadataService.collectUniqueKeys([
            settings.propertyColors,
            settings.propertyBackgroundColors,
            settings.propertyIcons,
            settings.propertySortOverrides,
            settings.propertyAppearances,
            settings.propertyTreeSortOverrides
        ]);
        settings.vaultProfiles.forEach(profile => {
            if (!Array.isArray(profile.propertyKeys) || profile.propertyKeys.length === 0) {
                return;
            }

            profile.propertyKeys.forEach(entry => {
                const normalizedKey = typeof entry?.key === 'string' ? casefold(entry.key) : '';
                if (!normalizedKey) {
                    return;
                }

                propertyKeys.add(buildPropertyKeyNodeId(normalizedKey));
            });
        });

        Object.keys(settings.collapsedPinnedContexts ?? {}).forEach(key => {
            const folderTarget = getCollapsedPinnedContextTarget(key, 'folder');
            if (folderTarget !== null) {
                folderKeys.add(folderTarget);
                return;
            }

            const tagTarget = getCollapsedPinnedContextTarget(key, 'tag');
            if (tagTarget !== null) {
                tagKeys.add(tagTarget);
                return;
            }

            const propertyTarget = getCollapsedPinnedContextTarget(key, 'property');
            if (propertyTarget !== null) {
                propertyKeys.add(propertyTarget);
            }
        });

        const pinnedNotes = settings.pinnedNotes ? Object.keys(settings.pinnedNotes).length : 0;

        const separators = settings.navigationSeparators ? Object.keys(settings.navigationSeparators).length : 0;

        return {
            folders: folderKeys.size,
            tags: tagKeys.size,
            properties: propertyKeys.size,
            files: fileKeys.size,
            pinnedNotes,
            separators
        };
    }

    private static collectUniqueKeys(records: (Record<string, unknown> | undefined)[]): Set<string> {
        const result = new Set<string>();
        records.forEach(record => {
            if (!record) {
                return;
            }
            Object.keys(record).forEach(key => {
                result.add(key);
            });
        });
        return result;
    }

    /**
     * Prepares validators for metadata cleanup by collecting current vault state
     * @param app - Obsidian app instance
     * @param tagTree - Tag tree for tag metadata validation. When omitted, a vault-wide tree is built from cache data.
     * @returns Validators object for cleanup
     */
    static prepareCleanupValidators(app: App, tagTree?: Map<string, TagTreeNode>): CleanupValidators {
        const db = getDBInstance();
        const cleanupTagTree = tagTree ?? buildTagTreeFromDatabase(db, undefined, undefined, [], true, false).tagTree;

        // Collect all files in vault
        const vaultFiles = new Set(app.vault.getFiles().map(f => f.path));

        // Recursively collect all folder paths
        const vaultFolders = new Set<string>();
        const collectAllFolderPaths = (folder: TFolder) => {
            vaultFolders.add(folder.path);
            folder.children.forEach(child => {
                if (child instanceof TFolder) {
                    collectAllFolderPaths(child);
                }
            });
        };
        collectAllFolderPaths(app.vault.getRoot());

        return {
            dbFiles: db.getAllFiles(),
            tagTree: cleanupTagTree,
            vaultFiles,
            vaultFolders
        };
    }
}
