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

import { TFile, TFolder, App } from 'obsidian';
import type { NotebookNavigatorSettings } from '../settings/types';
import type { NavigatorContext, PinnedNotes, VisibilityPreferences } from '../types';
import { ItemType, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID, TAGGED_TAG_ID, UNTAGGED_TAG_ID } from '../types';
import {
    createFrontmatterPropertyExclusionMatcher,
    shouldExcludeFolder,
    shouldExcludeFolderFromDescendants,
    shouldExcludeFileWithMatcher,
    createHiddenFileNameMatcherForVisibility,
    getFilteredDocumentFiles,
    getFilteredFiles,
    isPathInExcludedFolder,
    isFolderInExcludedFolder
} from './fileFilters';
import { shouldDisplayFile, FILE_VISIBILITY } from './fileTypeUtils';
import { getEffectiveListSort, getPropertySortValueFromRecord, isPropertySortOption, sortFiles, type EffectiveListSort } from './sortUtils';
import { getDBInstanceOrNull } from '../storage/fileOperations';
import { extractMetadata, type ProcessedMetadata } from '../utils/metadataExtractor';
import { extractCurrentFrontmatterMetadataFromFileData } from './frontmatterMetadataCache';
import { METADATA_SENTINEL } from '../storage/IndexedDBStorage';
import { getFileDisplayName as getDisplayName } from './fileNameUtils';
import { getFolderNote, getFolderNoteDetectionSettings } from './folderNoteLookup';
import { createHiddenTagVisibility, normalizeTagPathValue } from './tagPrefixMatcher';
import {
    getActiveFileVisibility,
    getActiveDescendantExcludedFolders,
    getActiveHiddenFileNames,
    getActiveHiddenFileTags,
    getActiveHiddenFileProperties,
    getActiveHiddenFolders,
    getActiveHiddenTags,
    getActivePropertyKeySet
} from './vaultProfiles';
import { getCachedFileTags } from './tagUtils';
import { casefold, normalizePinnedNoteContext } from './recordUtils';
import { getParentFolderPath } from './pathUtils';
import {
    buildPropertyKeyNodeId,
    buildPropertyValueNodeId,
    isPropertyKeyOnlyValuePath,
    matchesPropertyValuePath,
    type PropertySelectionNodeId,
    normalizePropertyTreeValuePath,
    parsePropertyNodeId
} from './propertyTree';
import type { IPropertyTreeProvider } from '../interfaces/IPropertyTreeProvider';
import type { ITagTreeProvider } from '../interfaces/ITagTreeProvider';
import { shouldHideDrawingCompanionImageFile } from './drawingFeatureImages';

interface PinnedDisplayScope {
    restrictToFolderPath?: string;
}

interface NavigationFileQueryOptions {
    orderResults?: boolean;
}

function matchesPathSelection(candidatePath: string, selectedPath: string, includeDescendants: boolean): boolean {
    if (candidatePath === selectedPath) {
        return true;
    }

    if (!includeDescendants) {
        return false;
    }

    return candidatePath.startsWith(`${selectedPath}/`);
}

function getFilteredMarkdownFilesForSelection(
    app: App,
    settings: NotebookNavigatorSettings,
    showHiddenItems: boolean,
    excludedFolderPatterns: string[]
): TFile[] {
    const fileVisibility = getActiveFileVisibility(settings);
    const allFiles =
        fileVisibility === FILE_VISIBILITY.DOCUMENTS
            ? getFilteredDocumentFiles(app, settings, { showHiddenItems })
            : getFilteredFiles(app, settings, { showHiddenItems });

    const baseFiles = showHiddenItems
        ? allFiles
        : allFiles.filter(file => excludedFolderPatterns.length === 0 || !isPathInExcludedFolder(file.path, excludedFolderPatterns));

    return baseFiles.filter(file => file.extension === 'md');
}

function isFileVisibleForScopedSelection(
    file: TFile,
    options: {
        showHiddenItems: boolean;
        excludedFolderPatterns: string[];
        excludedFilePropertyMatcher: ReturnType<typeof createFrontmatterPropertyExclusionMatcher>;
        fileNameMatcher: ReturnType<typeof createHiddenFileNameMatcherForVisibility>;
        shouldFilterHiddenFileTags: boolean;
        hiddenFileTagVisibility: ReturnType<typeof createHiddenTagVisibility>;
        hideDrawingPreviewImages: boolean;
        app: App;
        db: ReturnType<typeof getDBInstanceOrNull>;
    }
): boolean {
    const {
        showHiddenItems,
        excludedFolderPatterns,
        excludedFilePropertyMatcher,
        fileNameMatcher,
        shouldFilterHiddenFileTags,
        hiddenFileTagVisibility,
        hideDrawingPreviewImages,
        app,
        db
    } = options;

    if (!showHiddenItems && excludedFolderPatterns.length > 0 && isPathInExcludedFolder(file.path, excludedFolderPatterns)) {
        return false;
    }

    if (!showHiddenItems && shouldHideDrawingCompanionImageFile(app, file, { hideDrawingPreviewImages })) {
        return false;
    }

    if (
        !showHiddenItems &&
        excludedFilePropertyMatcher.hasCriteria &&
        shouldExcludeFileWithMatcher(file, excludedFilePropertyMatcher, app)
    ) {
        return false;
    }

    if (fileNameMatcher && fileNameMatcher.matches(file)) {
        return false;
    }

    if (shouldFilterHiddenFileTags) {
        const fileData = db?.getFile(file.path) ?? null;
        const tags = getCachedFileTags({ app, file, db, fileData });
        if (tags.some(tagValue => !hiddenFileTagVisibility.isTagVisible(tagValue))) {
            return false;
        }
    }

    return true;
}

function collectVisibleMarkdownFilesFromPaths(paths: Iterable<string>, app: App, isVisible: (file: TFile) => boolean): TFile[] {
    const files: TFile[] = [];
    for (const path of paths) {
        const file = app.vault.getFileByPath(path);
        if (!file || file.extension !== 'md') {
            continue;
        }
        if (!isVisible(file)) {
            continue;
        }
        files.push(file);
    }
    return files;
}

function createPropertySortValueGetter(app: App, propertySortKey: string): (file: TFile) => string | null {
    const trimmedKey = propertySortKey.trim();
    const cache = new Map<string, string | null>();

    return (file: TFile): string | null => {
        if (trimmedKey.length === 0) {
            return null;
        }
        if (file.extension !== 'md') {
            return null;
        }

        if (cache.has(file.path)) {
            return cache.get(file.path) ?? null;
        }

        const fileCache = app.metadataCache.getFileCache(file);
        const extracted = getPropertySortValueFromRecord(fileCache?.frontmatter, trimmedKey);
        cache.set(file.path, extracted);
        return extracted;
    };
}

function sortNavigationFiles(files: TFile[], settings: NotebookNavigatorSettings, app: App, sortSpec: EffectiveListSort): void {
    const sortOption = sortSpec.option;
    const isPropertySort = isPropertySortOption(sortOption);
    const propertySortKey = sortSpec.propertyKey.trim();
    const getPropertySortValue =
        isPropertySort && propertySortKey.length > 0 ? createPropertySortValueGetter(app, propertySortKey) : undefined;

    if (settings.useFrontmatterMetadata) {
        const db = getDBInstanceOrNull();
        const metadataCache = new Map<string, ProcessedMetadata>();
        const getCached = (file: TFile) => {
            if (file.extension !== 'md') {
                return {};
            }

            let metadata = metadataCache.get(file.path);
            if (!metadata) {
                metadata =
                    extractCurrentFrontmatterMetadataFromFileData(file, db?.getFile(file.path) ?? null, settings) ??
                    extractMetadata(app, file, settings);
                metadataCache.set(file.path, metadata);
            }
            return metadata;
        };

        const getCreatedTime = (file: TFile) => {
            const metadata = getCached(file);
            if (
                metadata.fc === undefined ||
                metadata.fc === METADATA_SENTINEL.FIELD_NOT_CONFIGURED ||
                metadata.fc === METADATA_SENTINEL.PARSE_FAILED
            ) {
                return file.stat.ctime;
            }
            return metadata.fc;
        };

        const getModifiedTime = (file: TFile) => {
            const metadata = getCached(file);
            if (
                metadata.fm === undefined ||
                metadata.fm === METADATA_SENTINEL.FIELD_NOT_CONFIGURED ||
                metadata.fm === METADATA_SENTINEL.PARSE_FAILED
            ) {
                return file.stat.mtime;
            }
            return metadata.fm;
        };

        const getTitle = (file: TFile) => {
            const metadata = getCached(file);
            return getDisplayName(file, { fn: metadata.fn }, settings);
        };

        sortFiles(files, sortOption, getCreatedTime, getModifiedTime, getTitle, getPropertySortValue, sortSpec.propertySortSecondary);
        return;
    }

    const getCreatedTime = (file: TFile) => file.stat.ctime;
    const getModifiedTime = (file: TFile) => file.stat.mtime;
    const getTitle = (file: TFile) => file.basename;
    sortFiles(files, sortOption, getCreatedTime, getModifiedTime, getTitle, getPropertySortValue, sortSpec.propertySortSecondary);
}

/**
 * Collects all pinned note paths from settings
 */
function collectPinnedPaths(pinnedNotes: PinnedNotes, contextFilter?: NavigatorContext): Set<string> {
    const allPinnedPaths = new Set<string>();

    if (!pinnedNotes || typeof pinnedNotes !== 'object') {
        return allPinnedPaths;
    }

    for (const [path, contexts] of Object.entries(pinnedNotes)) {
        const normalizedContexts = normalizePinnedNoteContext(contexts);

        if (!contextFilter) {
            // Include all pinned notes
            allPinnedPaths.add(path);
        } else if (normalizedContexts[contextFilter]) {
            // Include if pinned in the specified context
            allPinnedPaths.add(path);
        }
    }

    return allPinnedPaths;
}

function matchesPinnedDisplayScope(file: TFile, context: NavigatorContext | undefined, scope: PinnedDisplayScope | undefined): boolean {
    if (context !== 'folder' || !scope) {
        return true;
    }

    if (scope.restrictToFolderPath === undefined) {
        return true;
    }

    return getParentFolderPath(file.path) === scope.restrictToFolderPath;
}

export function partitionPinnedFiles(
    files: TFile[],
    pinnedNotes: PinnedNotes,
    context?: NavigatorContext,
    scope?: PinnedDisplayScope
): { pinnedFiles: TFile[]; unpinnedFiles: TFile[] } {
    const pinnedPaths = collectPinnedPaths(pinnedNotes, context);
    if (pinnedPaths.size === 0) {
        return { pinnedFiles: [], unpinnedFiles: files };
    }

    const pinnedFiles: TFile[] = [];
    const unpinnedFiles: TFile[] = [];

    for (const file of files) {
        if (!pinnedPaths.has(file.path) || !matchesPinnedDisplayScope(file, context, scope)) {
            unpinnedFiles.push(file);
            continue;
        }

        pinnedFiles.push(file);
    }

    return { pinnedFiles, unpinnedFiles };
}

// Reorders files to place pinned files first, preserving relative order within each group
function applyPinnedOrdering(
    files: TFile[],
    settings: NotebookNavigatorSettings,
    context: NavigatorContext,
    scope?: PinnedDisplayScope
): TFile[] {
    const { pinnedFiles, unpinnedFiles } = partitionPinnedFiles(files, settings.pinnedNotes, context, scope);
    if (pinnedFiles.length === 0) {
        return files;
    }

    return [...pinnedFiles, ...unpinnedFiles];
}

/**
 * Gets a sorted list of files for a given folder, respecting all plugin settings.
 * This is the primary utility function to be used by the reducer.
 * @param folder - The folder to get files from
 * @param settings - Plugin settings for sorting and filtering
 * @param visibility - Visibility preferences for descendant notes and hidden items display
 * @param app - Obsidian app instance
 */
export function getFilesForFolder(
    folder: TFolder,
    settings: NotebookNavigatorSettings,
    visibility: VisibilityPreferences,
    app: App,
    options?: NavigationFileQueryOptions
): TFile[] {
    const files: TFile[] = [];
    const excludedFolderPatterns = getActiveHiddenFolders(settings);
    const descendantExcludedFolderPatterns = getActiveDescendantExcludedFolders(settings);
    const excludedFileProperties = getActiveHiddenFileProperties(settings);
    const excludedFilePropertyMatcher = createFrontmatterPropertyExclusionMatcher(excludedFileProperties);
    const excludedFileNamePatterns = getActiveHiddenFileNames(settings);
    const excludedFileTagPatterns = getActiveHiddenFileTags(settings);
    const fileVisibility = getActiveFileVisibility(settings);
    const fileNameMatcher = createHiddenFileNameMatcherForVisibility(excludedFileNamePatterns, visibility.showHiddenItems);
    const hiddenFileTagVisibility = createHiddenTagVisibility(excludedFileTagPatterns, visibility.showHiddenItems);
    const shouldFilterHiddenFileTags = hiddenFileTagVisibility.hasHiddenRules && !visibility.showHiddenItems;

    // Check if hidden folders should be shown based on UX preference
    const showHiddenFolders = visibility.showHiddenItems;
    const folderHiddenInitially = excludedFolderPatterns.length > 0 && isFolderInExcludedFolder(folder, excludedFolderPatterns);
    if (!showHiddenFolders && folderHiddenInitially) {
        return [];
    }

    // Recursively collect files, tracking excluded folder state through the tree
    const collectFiles = (f: TFolder, parentHidden: boolean): void => {
        for (const child of f.children) {
            if (child instanceof TFile) {
                // Check if file should be displayed based on visibility setting
                if (
                    shouldDisplayFile(child, fileVisibility, app) &&
                    (visibility.showHiddenItems ||
                        !shouldHideDrawingCompanionImageFile(app, child, {
                            hideDrawingPreviewImages: settings.hideDrawingPreviewImages
                        }))
                ) {
                    files.push(child);
                }
            } else if (visibility.includeDescendantNotes && child instanceof TFolder) {
                // Include descendant notes when UX preference is enabled
                // Inherit parent's hidden state, then check if this folder is also excluded
                let childHidden = parentHidden;
                if (excludedFolderPatterns.length > 0 && shouldExcludeFolder(child.name, excludedFolderPatterns, child.path)) {
                    childHidden = true;
                }
                const childExcludedFromDescendants =
                    descendantExcludedFolderPatterns.length > 0 &&
                    shouldExcludeFolderFromDescendants(child.name, descendantExcludedFolderPatterns, child.path);
                const shouldTraverse = (showHiddenFolders || !childHidden) && !childExcludedFromDescendants;
                if (shouldTraverse) {
                    collectFiles(child, childHidden);
                }
            }
        }
    };

    collectFiles(folder, folderHiddenInitially);
    let allFiles: TFile[] = files;
    if (!visibility.showHiddenItems && excludedFilePropertyMatcher.hasCriteria) {
        allFiles = files.filter(file => file.extension !== 'md' || !shouldExcludeFileWithMatcher(file, excludedFilePropertyMatcher, app));
    }
    if (fileNameMatcher) {
        allFiles = allFiles.filter(file => !fileNameMatcher.matches(file));
    }

    if (shouldFilterHiddenFileTags) {
        const db = getDBInstanceOrNull();
        allFiles = allFiles.filter(file => {
            if (file.extension !== 'md') {
                return true;
            }
            const tags = getCachedFileTags({ app, file, db });
            if (tags.length === 0) {
                return true;
            }
            return tags.every(tag => hiddenFileTagVisibility.isTagVisible(tag));
        });
    }

    // Filter out folder notes if enabled and set to hide
    if (settings.enableFolderNotes && settings.hideFolderNoteInList) {
        const detectionSettings = getFolderNoteDetectionSettings(settings);
        const folderNotePathByFolderPath = new Map<string, string | null>();
        allFiles = allFiles.filter(file => {
            const parent = file.parent;
            if (!(parent instanceof TFolder)) {
                return true;
            }

            if (!folderNotePathByFolderPath.has(parent.path)) {
                const folderNote = getFolderNote(parent, detectionSettings);
                folderNotePathByFolderPath.set(parent.path, folderNote ? folderNote.path : null);
            }

            return folderNotePathByFolderPath.get(parent.path) !== file.path;
        });
    }

    if (options?.orderResults === false) {
        return allFiles;
    }

    const sortSpec = getEffectiveListSort(settings, 'folder', folder);
    sortNavigationFiles(allFiles, settings, app, sortSpec);

    const pinnedDisplayScope = settings.filterPinnedByFolder ? { restrictToFolderPath: folder.path } : undefined;
    return applyPinnedOrdering(allFiles, settings, 'folder', pinnedDisplayScope);
}

/**
 * Gets a sorted list of files for a given tag, respecting all plugin settings.
 * @param tag - The tag to get files for
 * @param settings - Plugin settings for sorting and filtering
 * @param visibility - Visibility preferences for descendant notes and hidden items display
 * @param app - Obsidian app instance
 * @param tagTreeService - Service for tag tree operations
 */
export function getFilesForTag(
    tag: string,
    settings: NotebookNavigatorSettings,
    visibility: VisibilityPreferences,
    app: App,
    tagTreeService: ITagTreeProvider | null,
    options?: NavigationFileQueryOptions
): TFile[] {
    const hiddenTags = getActiveHiddenTags(settings);
    const hiddenFileTags = getActiveHiddenFileTags(settings);
    const excludedFolderPatterns = getActiveHiddenFolders(settings);
    const excludedFileProperties = getActiveHiddenFileProperties(settings);
    const excludedFilePropertyMatcher = createFrontmatterPropertyExclusionMatcher(excludedFileProperties);
    const excludedFileNamePatterns = getActiveHiddenFileNames(settings);
    const fileNameMatcher = createHiddenFileNameMatcherForVisibility(excludedFileNamePatterns, visibility.showHiddenItems);
    const hiddenTagVisibility = createHiddenTagVisibility(hiddenTags, visibility.showHiddenItems);
    const shouldFilterHiddenTags = hiddenTagVisibility.shouldFilterHiddenTags;
    const hiddenFileTagVisibility = createHiddenTagVisibility(hiddenFileTags, visibility.showHiddenItems);
    const shouldFilterHiddenFileTags = hiddenFileTagVisibility.hasHiddenRules && !visibility.showHiddenItems;
    const db = getDBInstanceOrNull();
    let markdownFilesCache: TFile[] | null = null;

    const getMarkdownFiles = (): TFile[] => {
        if (markdownFilesCache) {
            return markdownFilesCache;
        }

        markdownFilesCache = getFilteredMarkdownFilesForSelection(app, settings, visibility.showHiddenItems, excludedFolderPatterns);
        return markdownFilesCache;
    };

    const matchesCurrentVisibility = (file: TFile): boolean => {
        return isFileVisibleForScopedSelection(file, {
            showHiddenItems: visibility.showHiddenItems,
            excludedFolderPatterns,
            excludedFilePropertyMatcher,
            fileNameMatcher,
            shouldFilterHiddenFileTags,
            hiddenFileTagVisibility,
            hideDrawingPreviewImages: settings.hideDrawingPreviewImages,
            app,
            db
        });
    };

    let filteredFiles: TFile[];

    // Special case for untagged files
    if (tag === UNTAGGED_TAG_ID) {
        // Only show markdown files in untagged section since only they can be tagged
        filteredFiles = getMarkdownFiles().filter(file => {
            // Check if the markdown file has tags using our cache
            const fileTags = getCachedFileTags({ app, file, db });
            return fileTags.length === 0;
        });
    } else if (tag === TAGGED_TAG_ID) {
        if (!visibility.includeDescendantNotes) {
            return [];
        }

        // Include markdown files that have at least one tag, respecting hidden tag visibility
        const markdownFiles = getMarkdownFiles();
        filteredFiles = markdownFiles.filter(file => {
            const fileTags = getCachedFileTags({ app, file, db });
            if (fileTags.length === 0) {
                return false;
            }

            if (shouldFilterHiddenFileTags && fileTags.some(tagValue => !hiddenFileTagVisibility.isTagVisible(tagValue))) {
                return false;
            }

            if (!shouldFilterHiddenTags) {
                return true;
            }

            return fileTags.some(tagValue => hiddenTagVisibility.isTagVisible(normalizeTagPathValue(tagValue)));
        });
    } else {
        const selectedNode = tagTreeService?.findTagNode(tag) ?? null;
        const normalizedSelectedTagPath = normalizeTagPathValue(tag);
        if (!normalizedSelectedTagPath) {
            filteredFiles = [];
        } else {
            const selectedTagPath = selectedNode?.path ?? normalizedSelectedTagPath;

            const matchesSelectedTagPath = (file: TFile): boolean => {
                const fileTags = getCachedFileTags({ app, file, db });
                if (fileTags.length === 0) {
                    return false;
                }

                if (shouldFilterHiddenFileTags && fileTags.some(tagValue => !hiddenFileTagVisibility.isTagVisible(tagValue))) {
                    return false;
                }

                return fileTags.some(tagValue => {
                    const normalizedTag = normalizeTagPathValue(tagValue);
                    if (!matchesPathSelection(normalizedTag, selectedTagPath, visibility.includeDescendantNotes)) {
                        return false;
                    }
                    if (!shouldFilterHiddenTags) {
                        return true;
                    }
                    return hiddenTagVisibility.isTagVisible(normalizedTag);
                });
            };

            const candidateMarkdownFiles = (() => {
                if (!tagTreeService || !tagTreeService.hasNodes()) {
                    return null;
                }

                const candidatePaths = tagTreeService.collectTagFilePaths(selectedTagPath);
                if (candidatePaths.length === 0 && !selectedNode) {
                    return null;
                }

                return collectVisibleMarkdownFilesFromPaths(candidatePaths, app, matchesCurrentVisibility);
            })();

            const markdownFiles = candidateMarkdownFiles ?? getMarkdownFiles();
            filteredFiles = markdownFiles.filter(matchesSelectedTagPath);
        }
    }

    if (options?.orderResults === false) {
        return filteredFiles;
    }

    const sortSpec = getEffectiveListSort(settings, 'tag', null, tag);
    sortNavigationFiles(filteredFiles, settings, app, sortSpec);

    return applyPinnedOrdering(filteredFiles, settings, 'tag');
}

/**
 * Gets a sorted list of files for a selected property tree node.
 * @param propertyNodeId - Selected property node id (key/value) or the properties root id
 * @param settings - Plugin settings for sorting and filtering
 * @param visibility - Visibility preferences for descendant notes and hidden items display
 * @param app - Obsidian app instance
 */
export function getFilesForProperty(
    propertyNodeId: PropertySelectionNodeId,
    settings: NotebookNavigatorSettings,
    visibility: VisibilityPreferences,
    app: App,
    propertyTreeService: IPropertyTreeProvider | null = null,
    options?: NavigationFileQueryOptions
): TFile[] {
    const includesAnyProperty = propertyNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID;
    // Root properties selection includes every configured key that is enabled in either
    // navigation or list visibility modes.
    const configuredPropertyKeys = getActivePropertyKeySet(settings, 'any');

    if (includesAnyProperty && configuredPropertyKeys.size === 0) {
        return [];
    }

    const selectionNode = includesAnyProperty ? null : parsePropertyNodeId(propertyNodeId);
    if (!includesAnyProperty && !selectionNode) {
        return [];
    }
    const normalizedKey = includesAnyProperty ? null : (selectionNode?.key ?? null);

    if (!includesAnyProperty && (!normalizedKey || !configuredPropertyKeys.has(normalizedKey))) {
        return [];
    }

    const normalizedValue =
        includesAnyProperty || !selectionNode?.valuePath ? null : normalizePropertyTreeValuePath(selectionNode.valuePath);
    if (normalizedValue !== null && normalizedValue.length === 0) {
        return [];
    }

    const selectedPropertyKey = normalizedKey ?? '';
    const excludedFolderPatterns = getActiveHiddenFolders(settings);
    const excludedFileProperties = getActiveHiddenFileProperties(settings);
    const excludedFilePropertyMatcher = createFrontmatterPropertyExclusionMatcher(excludedFileProperties);
    const excludedFileNamePatterns = getActiveHiddenFileNames(settings);
    const fileNameMatcher = createHiddenFileNameMatcherForVisibility(excludedFileNamePatterns, visibility.showHiddenItems);

    const hiddenFileTags = getActiveHiddenFileTags(settings);
    const hiddenFileTagVisibility = createHiddenTagVisibility(hiddenFileTags, visibility.showHiddenItems);
    const shouldFilterHiddenFileTags = hiddenFileTagVisibility.hasHiddenRules && !visibility.showHiddenItems;
    const db = getDBInstanceOrNull();
    const candidatePaths = (() => {
        if (includesAnyProperty && !visibility.includeDescendantNotes) {
            return new Set<string>();
        }

        if (!propertyTreeService || !propertyTreeService.hasNodes()) {
            return null;
        }

        if (includesAnyProperty) {
            // Root properties selection aggregates across configured keys through the provider contract.
            return propertyTreeService.collectFilesForKeys(configuredPropertyKeys);
        }

        if (normalizedValue === null) {
            return propertyTreeService.collectFilePaths(buildPropertyKeyNodeId(selectedPropertyKey), visibility.includeDescendantNotes);
        }

        const valueNodeId = buildPropertyValueNodeId(selectedPropertyKey, normalizedValue);
        const valueNode = propertyTreeService.findNode(valueNodeId);
        if (!valueNode || valueNode.kind !== 'value') {
            return new Set<string>();
        }

        return propertyTreeService.collectFilePaths(valueNodeId, visibility.includeDescendantNotes);
    })();

    const matchesCurrentVisibility = (file: TFile): boolean => {
        return isFileVisibleForScopedSelection(file, {
            showHiddenItems: visibility.showHiddenItems,
            excludedFolderPatterns,
            excludedFilePropertyMatcher,
            fileNameMatcher,
            shouldFilterHiddenFileTags,
            hiddenFileTagVisibility,
            hideDrawingPreviewImages: settings.hideDrawingPreviewImages,
            app,
            db
        });
    };

    const matchedFiles = (() => {
        if (candidatePaths) {
            return collectVisibleMarkdownFilesFromPaths(candidatePaths, app, matchesCurrentVisibility);
        }

        const markdownFiles = getFilteredMarkdownFilesForSelection(app, settings, visibility.showHiddenItems, excludedFolderPatterns);

        return markdownFiles.filter(file => {
            const fileData = db?.getFile(file.path) ?? null;
            const properties = fileData?.properties;
            if (!properties || properties.length === 0) {
                return false;
            }

            if (shouldFilterHiddenFileTags) {
                const tags = getCachedFileTags({ app, file, db, fileData });
                if (tags.some(tagValue => !hiddenFileTagVisibility.isTagVisible(tagValue))) {
                    return false;
                }
            }

            if (includesAnyProperty) {
                return properties.some(entry => configuredPropertyKeys.has(casefold(entry.fieldKey)));
            }

            let hasMatchingKey = false;
            let hasDirectMatchingKey = false;
            for (const entry of properties) {
                if (casefold(entry.fieldKey) !== selectedPropertyKey) {
                    continue;
                }

                hasMatchingKey = true;
                if (normalizedValue === null) {
                    const normalizedEntryValue = normalizePropertyTreeValuePath(entry.value);
                    if (isPropertyKeyOnlyValuePath(normalizedEntryValue, entry.valueKind)) {
                        hasDirectMatchingKey = true;
                        if (!visibility.includeDescendantNotes) {
                            return true;
                        }
                    }
                    continue;
                }

                const normalizedEntryValue = normalizePropertyTreeValuePath(entry.value);
                if (!normalizedEntryValue) {
                    continue;
                }

                if (matchesPropertyValuePath(normalizedEntryValue, normalizedValue)) {
                    return true;
                }
            }

            if (normalizedValue === null) {
                return visibility.includeDescendantNotes ? hasMatchingKey : hasDirectMatchingKey;
            }

            return false;
        });
    })();

    if (options?.orderResults === false) {
        return matchedFiles;
    }

    const sortSpec = getEffectiveListSort(settings, ItemType.PROPERTY, null, null, propertyNodeId);
    sortNavigationFiles(matchedFiles, settings, app, sortSpec);

    return applyPinnedOrdering(matchedFiles, settings, 'property');
}
