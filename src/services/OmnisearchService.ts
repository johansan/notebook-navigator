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

import { App, TFile, TAbstractFile } from 'obsidian';
import { ExtendedApp } from '../types/obsidian-extended';
import { compareVersions } from '../utils/versionUtils';

/**
 * Raw match data structure from the Omnisearch plugin API.
 * Represents a single text match within a file.
 */
interface SearchMatchApi {
    match: string;
    offset: number;
}

/**
 * Raw search result structure from the Omnisearch plugin API.
 * Represents a complete search hit for a single file.
 */
interface ResultNoteApi {
    score: number;
    vault: string;
    path: string;
    basename: string;
    foundWords: string[];
    matches: SearchMatchApi[];
    excerpt: string;
}

/**
 * Expected shape of the Omnisearch plugin's public API.
 * This interface defines the contract we depend on for integration.
 */
interface OmnisearchApi {
    search: (query: string) => Promise<ResultNoteApi[]>;
    refreshIndex: () => Promise<void>;
    registerOnIndexed: (callback: () => void) => void;
    unregisterOnIndexed: (callback: () => void) => void;
}

/**
 * Optional query-shaping options for Omnisearch requests.
 *
 * `pathScope` appends a `path:"..."` filter to the outgoing query when it is
 * safe to do so. This lets Omnisearch apply folder restriction internally
 * before returning ranked results. The restriction runs before Omnisearch
 * truncates to its top 50 hits, so a scoped query returns up to 50 results
 * from the folder tree instead of the vault-wide top 50.
 */
interface OmnisearchSearchOptions {
    pathScope?: string;
}

// The scope is injected as a quoted path:"..." token. A double quote would terminate
// that token early, and Omnisearch's query parser splits keyword values on commas,
// turning one folder scope into multiple OR'd path filters. Either way the query no
// longer means a single folder, so such paths are not injected at all.
const UNSAFE_PATH_SCOPE_CHARACTER_REGEX = /[",]/;
// Printable ASCII scopes are safe on every Omnisearch version because diacritics
// normalization does not alter ASCII text.
const ASCII_PATH_SCOPE_REGEX = /^[\x20-\x7E]+$/;
// Detect user-supplied path filters and preserve user intent.
// Supports both `path:` and `-path:`.
const HAS_PATH_FILTER_REGEX = /(^|\s)-?path\s*:/i;

// Omnisearch 1.30.0 normalizes diacritics in the note path before matching path filters.
// Earlier versions normalize only the query, so a non-ASCII scope matches nothing and
// would empty the result list instead of scoping it.
const NON_ASCII_PATH_SCOPE_MIN_VERSION = '1.30.0';

/**
 * Type guard to verify that a file is a regular file (TFile) and not a folder.
 * @param file - The file to check, may be null
 * @returns true if the file is a TFile instance, false otherwise
 */
function isTFile(file: TAbstractFile | null): file is TFile {
    return file instanceof TFile;
}

/**
 * Validates that an unknown object matches the expected Omnisearch API shape.
 * Uses structural typing to ensure all required methods are present.
 * @param candidate - The object to validate
 * @returns true if the object has all required API methods, false otherwise
 */
function isOmnisearchApi(candidate: unknown): candidate is OmnisearchApi {
    if (!candidate || typeof candidate !== 'object') {
        return false;
    }
    const api = candidate as Partial<OmnisearchApi>;
    return (
        typeof api.search === 'function' &&
        typeof api.refreshIndex === 'function' &&
        typeof api.registerOnIndexed === 'function' &&
        typeof api.unregisterOnIndexed === 'function'
    );
}

/**
 * Validates that a search result object matches the expected structure from Omnisearch.
 * Ensures all required properties are present with correct types.
 * @param candidate - The object to validate
 * @returns true if the object is a valid search result, false otherwise
 */
function isResultNoteApi(candidate: unknown): candidate is ResultNoteApi {
    if (!candidate || typeof candidate !== 'object') {
        return false;
    }
    const note = candidate as Partial<ResultNoteApi>;
    return (
        typeof note.path === 'string' &&
        typeof note.score === 'number' &&
        Array.isArray(note.matches) &&
        Array.isArray(note.foundWords) &&
        typeof note.basename === 'string'
    );
}

/**
 * Normalized match data for internal use within Notebook Navigator.
 * Provides a stable interface independent of Omnisearch's internal structure.
 */
export interface OmnisearchMatch {
    text: string;
    offset: number;
    length: number;
}

/**
 * Complete search result with resolved file reference.
 * Combines raw search data with actual Obsidian file objects for easy consumption.
 */
export interface OmnisearchHit {
    file: TFile;
    path: string;
    basename: string;
    score: number;
    excerpt: string;
    matches: OmnisearchMatch[];
    foundWords: string[];
}

/**
 * Converts raw match data from the Omnisearch API to normalized format with calculated lengths.
 * @param matches - Array of raw match data from Omnisearch API
 * @returns Array of normalized matches with text, offset, and length properties
 */
function normalizeMatches(matches: SearchMatchApi[]): OmnisearchMatch[] {
    return matches
        .filter(match => typeof match.match === 'string' && typeof match.offset === 'number')
        .map(match => ({
            text: match.match,
            offset: match.offset,
            length: match.match.length
        }));
}

/**
 * Checks whether a folder scope is safe to inject into an Omnisearch query.
 *
 * Rules:
 * - empty strings are rejected
 * - double quotes and commas are rejected on every version
 * - non-ASCII paths are accepted only when `allowNonAsciiScope` is true
 *
 * If this check fails we keep the original query unchanged.
 */
function isSafePathScope(path: string, allowNonAsciiScope: boolean): boolean {
    const normalized = path.trim();
    if (!normalized || UNSAFE_PATH_SCOPE_CHARACTER_REGEX.test(normalized)) {
        return false;
    }
    return allowNonAsciiScope || ASCII_PATH_SCOPE_REGEX.test(normalized);
}

/**
 * Builds the query that will be sent to Omnisearch.
 *
 * Rules:
 * - if no valid scope is provided, return the query unchanged
 * - if the user already included `path:` in their query, do not override it
 * - otherwise append a scoped `path:"..."` clause
 *
 * Appending a path clause allows Omnisearch to apply path filtering within its
 * own search pipeline. Notebook Navigator still performs post-filtering by the
 * current view scope after results are returned.
 */
function buildScopedQuery(query: string, options: OmnisearchSearchOptions | undefined, allowNonAsciiScope: boolean): string {
    const pathScope = options?.pathScope?.trim();
    if (!pathScope || !isSafePathScope(pathScope, allowNonAsciiScope)) {
        return query;
    }
    if (HAS_PATH_FILTER_REGEX.test(query)) {
        return query;
    }
    // The trailing slash anchors the substring filter at the folder boundary so
    // sibling folders sharing the scope as a name prefix do not consume slots in
    // Omnisearch's ranked top-50 result list.
    return `${query} path:"${pathScope}/"`;
}

/**
 * Service wrapper around the Omnisearch community plugin API.
 * Provides type-safe access to Omnisearch functionality with automatic fallback handling.
 *
 * When Omnisearch is not available, all methods gracefully degrade:
 * - isAvailable() returns false
 * - search() returns empty results
 * - Event registration methods become no-ops
 *
 * This allows Notebook Navigator to optionally enhance search with full-text capabilities
 * while maintaining core functionality when the plugin is not installed.
 */
export class OmnisearchService {
    constructor(private readonly app: App) {}

    /**
     * Locates the Omnisearch API through plugin manager or global scope.
     * Tries multiple access paths to maximize compatibility:
     * 1. First checks the official plugin registry
     * 2. Falls back to global scope (for older versions or custom installations)
     *
     * @returns The Omnisearch API if available and valid, null otherwise
     * @private
     */
    private resolveApi(): OmnisearchApi | null {
        const extended = this.app as ExtendedApp;

        // Try plugin manager first
        const pluginManager = extended.plugins;
        const plugin = pluginManager?.plugins?.omnisearch as { api?: unknown } | undefined;
        if (plugin && plugin.api && isOmnisearchApi(plugin.api)) {
            return plugin.api;
        }

        // Fallback to global scope
        const globalApi = (activeWindow as Window & { omnisearch?: unknown }).omnisearch;
        if (globalApi && isOmnisearchApi(globalApi)) {
            return globalApi;
        }

        return null;
    }

    /**
     * Reads the installed Omnisearch version from the plugin registry.
     * Returns null when the plugin entry or its manifest is unavailable, for
     * example when the API was resolved through the global-scope fallback.
     */
    private resolveInstalledVersion(): string | null {
        const extended = this.app as ExtendedApp;
        const plugin = extended.plugins?.plugins?.omnisearch as { manifest?: { version?: unknown } } | undefined;
        const version = plugin?.manifest?.version;
        return typeof version === 'string' && version.length > 0 ? version : null;
    }

    /**
     * Indicates whether the Omnisearch plugin is currently available and functional.
     * Use this to conditionally enable full-text search features in the UI.
     *
     * @returns true if Omnisearch is installed and accessible, false otherwise
     */
    public isAvailable(): boolean {
        return this.resolveApi() !== null;
    }

    /**
     * Executes a full-text search through the Omnisearch API.
     *
     * @param query - The search query string to execute
     * @param options - Optional query shaping options
     * @returns Promise resolving to an array of search hits with file references and match data.
     *          Returns empty array if Omnisearch is unavailable or if an error occurs.
     *
     * @remarks
     * - Invalid or non-file results are filtered out silently
     * - Results include match excerpts and highlighted segments
     * - Files that no longer exist in the vault are automatically excluded
     * - pathScope is appended as path:"..." for any folder path without double
     *   quotes or commas; non-ASCII paths additionally require Omnisearch 1.30.0+
     */
    public async search(query: string, options?: OmnisearchSearchOptions): Promise<OmnisearchHit[]> {
        const api = this.resolveApi();
        if (!api) {
            return [];
        }

        try {
            // Non-ASCII scopes require the 1.30.0 path-filter diacritics fix. When the
            // version is unknown (global-scope API fallback) only ASCII scopes are used.
            const installedVersion = this.resolveInstalledVersion();
            const allowNonAsciiScope =
                installedVersion !== null && compareVersions(installedVersion, NON_ASCII_PATH_SCOPE_MIN_VERSION) >= 0;
            // Use the scoped query when safe; otherwise this is exactly `query`.
            const scopedQuery = buildScopedQuery(query, options, allowNonAsciiScope);
            // Omnisearch's public API accepts one query string and returns ranked hits.
            const rawResults = await api.search(scopedQuery);
            const hits: OmnisearchHit[] = [];

            for (const raw of rawResults) {
                if (!isResultNoteApi(raw)) {
                    continue;
                }
                const file = this.app.vault.getAbstractFileByPath(raw.path);
                if (!isTFile(file)) {
                    continue;
                }

                hits.push({
                    file,
                    path: raw.path,
                    basename: raw.basename,
                    score: raw.score,
                    excerpt: raw.excerpt,
                    matches: normalizeMatches(raw.matches),
                    foundWords: Array.isArray(raw.foundWords) ? raw.foundWords.filter(word => typeof word === 'string') : []
                });
            }

            return hits;
        } catch {
            return [];
        }
    }

    /**
     * Registers a callback to be invoked when Omnisearch completes indexing.
     * Use this to refresh UI or trigger dependent operations after index updates.
     *
     * @param callback - Function to call when indexing completes
     *
     * @remarks
     * If Omnisearch is not available, this method becomes a no-op.
     * Remember to unregister callbacks when components unmount to prevent memory leaks.
     */
    public registerOnIndexed(callback: () => void): void {
        const api = this.resolveApi();
        if (!api) {
            return;
        }
        api.registerOnIndexed(callback);
    }

    /**
     * Unregisters a previously registered indexing callback.
     * Call this when components unmount to prevent memory leaks.
     *
     * @param callback - The exact callback function that was previously registered
     *
     * @remarks
     * If Omnisearch is not available, this method becomes a no-op.
     * The callback must be the same function reference that was registered.
     */
    public unregisterOnIndexed(callback: () => void): void {
        const api = this.resolveApi();
        if (!api) {
            return;
        }
        api.unregisterOnIndexed(callback);
    }
}
