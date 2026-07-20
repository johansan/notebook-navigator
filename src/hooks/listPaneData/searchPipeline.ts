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

import { useEffect, useRef, useState } from 'react';
import { parseFrontMatterAliases, TFile, TFolder } from 'obsidian';
import type { App, FrontMatterCache } from 'obsidian';
import type { NotebookNavigatorSettings, SortOption } from '../../settings/types';
import type { FilterSearchMatchOptions, FilterSearchTokens } from '../../utils/filterSearch';
import {
    fileMatchesDateFilterTokens,
    filterSearchHasActiveCriteria,
    filterSearchNeedsPropertyLookup,
    filterSearchNeedsTagLookup,
    filterSearchRequiresTagsForEveryMatch,
    getFileFilterSearchMatch,
    parseFilterSearchTokens
} from '../../utils/filterSearch';
import { resolveDefaultDateField } from '../../utils/sortUtils';
import { PreviewTextUtils } from '../../utils/previewTextUtils';
import { getCachedFileTags } from '../../utils/tagUtils';
import { createOmnisearchHighlightQueryTokenContext, sanitizeOmnisearchHighlightTokens } from '../../utils/omnisearchHighlight';
import { foldSearchText } from '../../utils/recordUtils';
import { normalizePropertyTreeValuePath } from '../../utils/propertyTree';
import {
    createFrontmatterPropertyExclusionMatcher,
    createHiddenFileNameMatcher,
    isFolderInExcludedFolder,
    shouldExcludeFileWithMatcher
} from '../../utils/fileFilters';
import { createHiddenTagVisibility, normalizeTagPathValue } from '../../utils/tagPrefixMatcher';
import { runAsyncAction } from '../../utils/async';
import type { AliasSearchMatch, SearchResultMeta } from '../../types/search';
import type { OmnisearchService } from '../../services/OmnisearchService';
import type { IndexedDBStorage, FileData } from '../../storage/IndexedDBStorage';
import { shouldHideDrawingCompanionImageFile } from '../../utils/drawingFeatureImages';

const EMPTY_FILTER_SEARCH_PROPERTIES = new Map<string, string[]>();
const TAG_PRESENCE_SENTINEL = ['__nn_tag_present__'];
const EMPTY_HIDDEN_STATE = new Map<string, boolean>();
const EMPTY_MATCHED_ALIASES = new Map<string, readonly AliasSearchMatch[]>();

export interface OmnisearchListResult {
    query: string;
    files: TFile[];
    meta: Map<string, SearchResultMeta>;
}

interface UseOmnisearchListResultArgs {
    basePathSet: ReadonlySet<string>;
    omnisearchPathScope?: string;
    omnisearchService: OmnisearchService | null;
    trimmedQuery: string;
    useOmnisearch: boolean;
}

interface UseSearchableNamesArgs {
    app: App;
    baseFiles: TFile[];
    getFileDisplayName: (file: TFile) => string;
}

export interface SearchableNameData {
    foldedDisplayName: string;
    /** Original and folded aliases share frontmatter order so a match index resolves to the displayed alias. */
    aliases: readonly string[];
    foldedAliases: readonly string[];
}

export interface FilterListPaneFilesResult {
    files: TFile[];
    /** Contains the aliases that were required to satisfy each included file's internal-search name tokens. */
    matchedAliases: ReadonlyMap<string, readonly AliasSearchMatch[]>;
}

interface FilterListPaneFilesArgs {
    app: App;
    baseFiles: TFile[];
    getDB: () => IndexedDBStorage;
    getFileTimestamps: (file: TFile) => { created: number; modified: number };
    omnisearchResult: OmnisearchListResult | null;
    searchTokens?: FilterSearchTokens;
    searchableNames: ReadonlyMap<string, SearchableNameData>;
    settings: Pick<NotebookNavigatorSettings, 'alphabeticalDateMode'>;
    sortOption: SortOption;
    trimmedQuery: string;
    useOmnisearch: boolean;
}

interface BuildHiddenFileStateArgs {
    app: App;
    files: TFile[];
    getDB: () => IndexedDBStorage;
    hiddenFileNames: string[];
    hiddenFilePropertyMatcher: ReturnType<typeof createFrontmatterPropertyExclusionMatcher>;
    hiddenFileTags: string[];
    hiddenFolders: string[];
    hideDrawingPreviewImages: boolean;
    showHiddenItems: boolean;
}

function normalizeTagsForFilterSearch(rawTags: readonly string[]): string[] {
    return rawTags.map(tag => foldSearchText(normalizeTagPathValue(tag))).filter((value): value is string => value.length > 0);
}

function normalizePropertiesForFilterSearch(properties: FileData['properties'] | null): Map<string, string[]> {
    if (!properties || properties.length === 0) {
        return EMPTY_FILTER_SEARCH_PROPERTIES;
    }

    const normalizedValues = new Map<string, Set<string>>();
    properties.forEach(entry => {
        const normalizedKey = foldSearchText(entry.fieldKey.trim());
        if (!normalizedKey) {
            return;
        }

        let values = normalizedValues.get(normalizedKey);
        if (!values) {
            values = new Set<string>();
            normalizedValues.set(normalizedKey, values);
        }

        const normalizedValue = normalizePropertyTreeValuePath(entry.value);
        if (!normalizedValue) {
            return;
        }

        values.add(foldSearchText(normalizedValue));
    });

    const normalized = new Map<string, string[]>();
    normalizedValues.forEach((values, key) => {
        normalized.set(key, Array.from(values));
    });

    return normalized;
}

export function useOmnisearchListResult({
    basePathSet,
    omnisearchPathScope,
    omnisearchService,
    trimmedQuery,
    useOmnisearch
}: UseOmnisearchListResultArgs): OmnisearchListResult | null {
    const [omnisearchResult, setOmnisearchResult] = useState<OmnisearchListResult | null>(null);
    const searchTokenRef = useRef(0);

    useEffect(() => {
        if (!useOmnisearch) {
            setOmnisearchResult(null);
        }
    }, [useOmnisearch]);

    useEffect(() => {
        if (!useOmnisearch) {
            return;
        }
        if (!omnisearchService) {
            setOmnisearchResult(null);
            return;
        }

        const token = ++searchTokenRef.current;
        let disposed = false;

        runAsyncAction(async () => {
            try {
                const hits = await omnisearchService.search(trimmedQuery, {
                    pathScope: omnisearchPathScope
                });
                if (disposed || searchTokenRef.current !== token) {
                    return;
                }

                const meta = new Map<string, SearchResultMeta>();
                const files: TFile[] = [];
                const queryTokenContext = createOmnisearchHighlightQueryTokenContext(trimmedQuery);

                hits.forEach(hit => {
                    if (!basePathSet.has(hit.path)) {
                        return;
                    }

                    files.push(hit.file);
                    const { matches, terms } = sanitizeOmnisearchHighlightTokens(hit.matches, hit.foundWords, queryTokenContext);
                    const excerpt =
                        typeof hit.excerpt === 'string' ? PreviewTextUtils.normalizeExcerpt(hit.excerpt, { stripHtml: false }) : undefined;

                    meta.set(hit.path, {
                        score: hit.score,
                        terms,
                        matches,
                        excerpt
                    });
                });

                setOmnisearchResult({ query: trimmedQuery, files, meta });
            } catch {
                if (searchTokenRef.current === token) {
                    setOmnisearchResult({ query: trimmedQuery, files: [], meta: new Map() });
                }
            }
        });

        return () => {
            disposed = true;
        };
    }, [basePathSet, omnisearchPathScope, omnisearchService, trimmedQuery, useOmnisearch]);

    return omnisearchResult;
}

export function buildSearchableNameData(displayName: string, frontmatter: FrontMatterCache | null): SearchableNameData {
    const aliases: string[] = [];
    const foldedAliases: string[] = [];

    for (const alias of parseFrontMatterAliases(frontmatter) ?? []) {
        const foldedAlias = foldSearchText(alias);
        if (!foldedAlias) {
            continue;
        }

        aliases.push(alias);
        foldedAliases.push(foldedAlias);
    }

    return {
        foldedDisplayName: foldSearchText(displayName),
        aliases,
        foldedAliases
    };
}

function searchableNameDataEqual(left: SearchableNameData | undefined, right: SearchableNameData): boolean {
    if (!left || left.foldedDisplayName !== right.foldedDisplayName || left.aliases.length !== right.aliases.length) {
        return false;
    }

    return left.aliases.every((alias, index) => alias === right.aliases[index] && left.foldedAliases[index] === right.foldedAliases[index]);
}

export function useSearchableNames({
    app,
    baseFiles,
    getFileDisplayName
}: UseSearchableNamesArgs): ReadonlyMap<string, SearchableNameData> {
    const [searchableNames, setSearchableNames] = useState<Map<string, SearchableNameData>>(new Map());

    useEffect(() => {
        const next = new Map<string, SearchableNameData>();
        baseFiles.forEach(file => {
            const frontmatter = file.extension === 'md' ? (app.metadataCache.getFileCache(file)?.frontmatter ?? null) : null;
            next.set(file.path, buildSearchableNameData(getFileDisplayName(file), frontmatter));
        });
        setSearchableNames(next);
    }, [app.metadataCache, baseFiles, getFileDisplayName]);

    useEffect(() => {
        const basePaths = new Set(baseFiles.map(file => file.path));
        const offref = app.metadataCache.on('changed', (changedFile, _data, cache) => {
            if (!changedFile || !basePaths.has(changedFile.path)) {
                return;
            }

            const frontmatter = changedFile.extension === 'md' ? (cache.frontmatter ?? null) : null;
            const nextName = buildSearchableNameData(getFileDisplayName(changedFile), frontmatter);
            setSearchableNames(previous => {
                if (searchableNameDataEqual(previous.get(changedFile.path), nextName)) {
                    return previous;
                }

                const next = new Map(previous);
                next.set(changedFile.path, nextName);
                return next;
            });
        });

        return () => {
            app.metadataCache.offref(offref);
        };
    }, [app.metadataCache, baseFiles, getFileDisplayName]);

    return searchableNames;
}

export function filterListPaneFiles({
    app,
    baseFiles,
    getDB,
    getFileTimestamps,
    omnisearchResult,
    searchTokens,
    searchableNames,
    settings,
    sortOption,
    trimmedQuery,
    useOmnisearch
}: FilterListPaneFilesArgs): FilterListPaneFilesResult {
    if (!trimmedQuery) {
        return { files: baseFiles, matchedAliases: EMPTY_MATCHED_ALIASES };
    }

    if (useOmnisearch) {
        if (!omnisearchResult || omnisearchResult.query !== trimmedQuery) {
            return { files: [], matchedAliases: EMPTY_MATCHED_ALIASES };
        }

        const omnisearchPaths = new Set(omnisearchResult.files.map(file => file.path));
        if (omnisearchPaths.size === 0) {
            return { files: [], matchedAliases: EMPTY_MATCHED_ALIASES };
        }

        return {
            files: baseFiles.filter(file => omnisearchPaths.has(file.path)),
            matchedAliases: EMPTY_MATCHED_ALIASES
        };
    }

    const tokens = searchTokens ?? parseFilterSearchTokens(trimmedQuery);
    if (!filterSearchHasActiveCriteria(tokens)) {
        return { files: baseFiles, matchedAliases: EMPTY_MATCHED_ALIASES };
    }

    const hasDateFilters = tokens.dateRanges.length > 0 || tokens.excludeDateRanges.length > 0;
    const hasTaskFilters = tokens.requireUnfinishedTasks || tokens.excludeUnfinishedTasks;
    const hasFolderFilters = tokens.folderTokens.length > 0 || tokens.excludeFolderTokens.length > 0;
    const hasExtensionFilters = tokens.extensionTokens.length > 0 || tokens.excludeExtensionTokens.length > 0;
    const defaultDateField = resolveDefaultDateField(sortOption, settings.alphabeticalDateMode ?? 'modified');
    const needsTagLookup = filterSearchNeedsTagLookup(tokens);
    const needsPropertyLookup = filterSearchNeedsPropertyLookup(tokens);
    const requireTaggedMatches = filterSearchRequiresTagsForEveryMatch(tokens);
    const requiresNormalizedTagValues = tokens.mode === 'tag' || tokens.tagTokens.length > 0 || tokens.excludeTagTokens.length > 0;
    const db = getDB();
    const emptyTags: string[] = [];
    const matchedAliases = new Map<string, readonly AliasSearchMatch[]>();

    const files = baseFiles.filter(file => {
        const searchableName = searchableNames.get(file.path);
        const foldedName = searchableName?.foldedDisplayName ?? '';
        const foldedAliases = searchableName?.foldedAliases ?? emptyTags;
        const fileData = hasTaskFilters || needsTagLookup || needsPropertyLookup ? db.getFile(file.path) : null;
        const hasUnfinishedTasks = hasTaskFilters && typeof fileData?.taskUnfinished === 'number' && fileData.taskUnfinished > 0;
        const matchOptions: FilterSearchMatchOptions = { hasUnfinishedTasks, foldedAliases };

        if (hasFolderFilters) {
            matchOptions.foldedFolderPath = foldSearchText(file.parent?.path ?? '');
        }

        if (hasExtensionFilters) {
            matchOptions.foldedExtension = foldSearchText(file.extension);
        }

        if (needsPropertyLookup) {
            matchOptions.propertyValuesByKey = normalizePropertiesForFilterSearch(fileData?.properties ?? null);
        }

        let foldedTags = emptyTags;
        if (needsTagLookup) {
            const rawTags = getCachedFileTags({ app, file, db, fileData });
            const hasTags = rawTags.length > 0;
            if (requireTaggedMatches && !hasTags) {
                return false;
            }

            if (hasTags) {
                foldedTags = requiresNormalizedTagValues ? normalizeTagsForFilterSearch(rawTags) : TAG_PRESENCE_SENTINEL;
            }
        }

        const filterMatch = getFileFilterSearchMatch(foldedName, foldedTags, tokens, matchOptions);
        if (!filterMatch.matches) {
            return false;
        }

        if (hasDateFilters) {
            const timestamps = getFileTimestamps(file);
            if (
                !fileMatchesDateFilterTokens(
                    { created: timestamps.created, modified: timestamps.modified, defaultField: defaultDateField },
                    tokens
                )
            ) {
                return false;
            }
        }

        if (searchableName && filterMatch.nameMatch && filterMatch.nameMatch.aliasIndexes.length > 0) {
            const aliasMatches = filterMatch.nameMatch.aliasIndexes.flatMap(aliasIndex => {
                const alias = searchableName.aliases[aliasIndex];
                return alias === undefined
                    ? []
                    : [
                          {
                              value: alias,
                              foldedTerms: tokens.nameTokens
                          }
                      ];
            });
            if (aliasMatches.length > 0) {
                matchedAliases.set(file.path, aliasMatches);
            }
        }

        return true;
    });

    return { files, matchedAliases };
}

export function buildHiddenFileState({
    app,
    files,
    getDB,
    hiddenFileNames,
    hiddenFilePropertyMatcher,
    hiddenFileTags,
    hiddenFolders,
    hideDrawingPreviewImages,
    showHiddenItems
}: BuildHiddenFileStateArgs): ReadonlyMap<string, boolean> {
    if (!showHiddenItems || files.length === 0) {
        return EMPTY_HIDDEN_STATE;
    }

    const db = getDB();
    const records = db.getFiles(files.map(file => file.path));
    const shouldCheckFolders = hiddenFolders.length > 0;
    const shouldCheckFrontmatter = hiddenFilePropertyMatcher.hasCriteria;
    const shouldCheckFileNames = hiddenFileNames.length > 0;
    const shouldCheckFileTags = hiddenFileTags.length > 0;
    const fileNameMatcher = shouldCheckFileNames ? createHiddenFileNameMatcher(hiddenFileNames) : null;
    const hiddenFileTagVisibility = shouldCheckFileTags ? createHiddenTagVisibility(hiddenFileTags, false) : null;
    const folderHiddenCache = shouldCheckFolders ? new Map<string, boolean>() : null;
    const result = new Map<string, boolean>();

    const resolveFolderHidden = (folder: TFolder | null): boolean => {
        if (!folderHiddenCache || !folder) {
            return false;
        }
        if (folderHiddenCache.has(folder.path)) {
            return folderHiddenCache.get(folder.path) ?? false;
        }

        const hidden = isFolderInExcludedFolder(folder, hiddenFolders);
        folderHiddenCache.set(folder.path, hidden);
        return hidden;
    };

    files.forEach(file => {
        const record = records.get(file.path);
        let hiddenByFrontmatter = false;
        if (shouldCheckFrontmatter && file.extension === 'md') {
            hiddenByFrontmatter =
                record?.metadata?.hidden === undefined
                    ? shouldExcludeFileWithMatcher(file, hiddenFilePropertyMatcher, app)
                    : Boolean(record.metadata?.hidden);
        }

        const hiddenByFileName = fileNameMatcher ? fileNameMatcher.matches(file) : false;
        const hiddenByFolder = shouldCheckFolders ? resolveFolderHidden(file.parent ?? null) : false;
        const hiddenByDrawingCompanion = shouldHideDrawingCompanionImageFile(app, file, { hideDrawingPreviewImages });
        const hiddenByTags =
            hiddenFileTagVisibility !== null &&
            hiddenFileTagVisibility.hasHiddenRules &&
            file.extension === 'md' &&
            getCachedFileTags({ app, file, db, fileData: record ?? null }).some(
                tagValue => !hiddenFileTagVisibility.isTagVisible(tagValue)
            );

        if (hiddenByFrontmatter || hiddenByFileName || hiddenByFolder || hiddenByDrawingCompanion || hiddenByTags) {
            result.set(file.path, true);
        }
    });

    return result;
}
