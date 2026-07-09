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
import { isGeneratedThumbnailFile, isPrimaryDocumentFile, shouldDisplayFile } from './fileTypeUtils';
import {
    getActiveFileVisibility,
    getActiveHiddenFileNames,
    getActiveHiddenFileTags,
    getActiveHiddenFileProperties,
    getHiddenFolderBoundaryMatcher,
    getActiveHiddenFolders,
    getHiddenFolderMatcher
} from './vaultProfiles';
import { getDBInstanceOrNull } from '../storage/fileOperations';
import { createHiddenTagVisibility } from './tagPrefixMatcher';
import { type CachedFileTagsDB, getCachedFileTags } from './tagUtils';
import { casefold, casefoldPreservingWhitespace, sortAndDedupeByComparator } from './recordUtils';
import { normalizePropertyTreeValuePath } from './propertyUtils';
import { isNonMarkdownDrawingFeatureImageFile, shouldHideDrawingCompanionImageFile } from './drawingFeatureImages';
import { isDebugLogPath } from '../services/diagnostics/DebugLoggingService';

interface FileFilterOptions {
    showHiddenItems?: boolean;
}

export interface HiddenFileNameMatcher {
    matches: (file: TFile) => boolean;
}

/**
 * When true, excluded folders are not indexed in the database
 * Set to false to index all files regardless of exclusion settings
 */
const SKIP_EXCLUDED_FOLDERS_IN_INDEX = false;

const hiddenFileNameMatcherCache = new Map<string, HiddenFileNameMatcher>();

export function clearHiddenFileNameMatcherCache(): void {
    hiddenFileNameMatcherCache.clear();
}

function normalizeHiddenFileNamePatterns(patterns: string[]): string[] {
    return Array.from(
        new Set(patterns.map(pattern => normalizeHiddenFileNamePattern(pattern)).filter(pattern => pattern.length > 0))
    ).sort();
}

function normalizeHiddenFileNamePattern(pattern: string): string {
    const trimmed = pattern.trim();
    if (trimmed.length === 0) {
        return '';
    }

    return casefoldPreservingWhitespace(trimmed);
}

interface CompiledGlob {
    glob: string;
    parts: string[];
    requiresPrefixMatch: boolean;
    requiresSuffixMatch: boolean;
    matchAll: boolean;
}

function isPathPattern(pattern: string): boolean {
    return pattern.includes('/');
}

function normalizeVaultPath(value: string): string {
    const trimmed = value.trim();
    const normalized = trimmed.length === 0 ? '' : casefoldPreservingWhitespace(trimmed);
    if (normalized.length === 0) {
        return '';
    }
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function isExtensionLiteral(pattern: string): boolean {
    if (!pattern.startsWith('.')) {
        return false;
    }
    if (pattern.includes('/') || pattern.includes('*')) {
        return false;
    }
    return pattern.length > 1;
}

function compileGlobPattern(glob: string): CompiledGlob {
    if (glob === '*') {
        return {
            glob,
            parts: [],
            requiresPrefixMatch: false,
            requiresSuffixMatch: false,
            matchAll: true
        };
    }

    const parts = glob.split('*').filter(part => part.length > 0);
    return {
        glob,
        parts,
        requiresPrefixMatch: !glob.startsWith('*'),
        requiresSuffixMatch: !glob.endsWith('*'),
        matchAll: false
    };
}

function matchesCompiledGlobPattern(value: string, compiled: CompiledGlob): boolean {
    if (compiled.matchAll) {
        return true;
    }

    const { parts, requiresPrefixMatch, requiresSuffixMatch } = compiled;
    if (parts.length === 0) {
        return true;
    }

    let searchIndex = 0;
    let partIndex = 0;

    if (requiresPrefixMatch) {
        const prefix = parts[0];
        if (!value.startsWith(prefix)) {
            return false;
        }
        searchIndex = prefix.length;
        partIndex = 1;
    }

    const lastPartIndex = parts.length - 1;
    const endIndex = requiresSuffixMatch ? lastPartIndex : parts.length;

    for (; partIndex < endIndex; partIndex += 1) {
        const part = parts[partIndex];
        const foundIndex = value.indexOf(part, searchIndex);
        if (foundIndex === -1) {
            return false;
        }
        searchIndex = foundIndex + part.length;
    }

    if (requiresSuffixMatch) {
        const suffix = parts[lastPartIndex];
        const suffixIndex = value.lastIndexOf(suffix);
        if (suffixIndex === -1) {
            return false;
        }
        if (suffixIndex < searchIndex) {
            return false;
        }
        return suffixIndex + suffix.length === value.length;
    }

    return true;
}

export function createHiddenFileNameMatcher(patterns: string[]): HiddenFileNameMatcher {
    const normalized = normalizeHiddenFileNamePatterns(patterns);
    const cacheKey = normalized.join('\u0000');
    const cached = hiddenFileNameMatcherCache.get(cacheKey);
    if (cached) {
        return cached;
    }

    const literalNames = new Set<string>();
    const literalPaths = new Set<string>();
    const literalExtensions = new Set<string>();
    const nameGlobs: CompiledGlob[] = [];
    const pathGlobs: CompiledGlob[] = [];
    normalized.forEach(pattern => {
        if (!pattern.includes('*')) {
            if (isPathPattern(pattern)) {
                literalPaths.add(normalizeVaultPath(pattern));
                return;
            }

            if (isExtensionLiteral(pattern)) {
                literalExtensions.add(pattern);
                return;
            }

            literalNames.add(pattern);
            return;
        }

        if (isPathPattern(pattern)) {
            pathGlobs.push(compileGlobPattern(normalizeVaultPath(pattern)));
            return;
        }

        nameGlobs.push(compileGlobPattern(pattern));
    });

    const matcher: HiddenFileNameMatcher = {
        matches: (file: TFile) => {
            const name = casefoldPreservingWhitespace(file.name);
            const basename = casefoldPreservingWhitespace(file.basename);
            const path = normalizeVaultPath(file.path);
            const extension = file.extension ? `.${casefoldPreservingWhitespace(file.extension)}` : '';

            if (literalNames.has(name) || literalPaths.has(path) || (extension.length > 0 && literalExtensions.has(extension))) {
                return true;
            }

            if (nameGlobs.some(glob => matchesCompiledGlobPattern(name, glob) || matchesCompiledGlobPattern(basename, glob))) {
                return true;
            }

            if (pathGlobs.some(glob => matchesCompiledGlobPattern(path, glob))) {
                return true;
            }

            return extension.length > 0 && nameGlobs.some(glob => matchesCompiledGlobPattern(extension, glob));
        }
    };

    hiddenFileNameMatcherCache.set(cacheKey, matcher);
    return matcher;
}

export function createHiddenFileNameMatcherForVisibility(patterns: string[], showHiddenItems: boolean): HiddenFileNameMatcher | null {
    if (showHiddenItems || patterns.length === 0) {
        return null;
    }
    return createHiddenFileNameMatcher(patterns);
}

export function shouldExcludeFileName(file: TFile, patterns: string[]): boolean {
    if (patterns.length === 0) {
        return false;
    }
    return createHiddenFileNameMatcher(patterns).matches(file);
}

interface FrontmatterPropertyExclusionRule {
    key: string;
    value: string | null;
}

interface FrontmatterPropertyExclusionMatcher {
    hasCriteria: boolean;
    matches: (record: Record<string, unknown> | null | undefined) => boolean;
}

const EMPTY_FRONTMATTER_PROPERTY_EXCLUSION_MATCHER: FrontmatterPropertyExclusionMatcher = {
    hasCriteria: false,
    matches: () => false
};

const MAX_FRONTMATTER_PROPERTY_EXCLUSION_MATCHER_CACHE = 256;
const frontmatterPropertyExclusionMatcherCache = new Map<string, FrontmatterPropertyExclusionMatcher>();
const frontmatterPropertyExclusionMatcherByRuleSetCache = new WeakMap<readonly string[], FrontmatterPropertyExclusionMatcher>();

function setFrontmatterPropertyExclusionMatcherCacheEntry(cacheKey: string, matcher: FrontmatterPropertyExclusionMatcher): void {
    if (frontmatterPropertyExclusionMatcherCache.size >= MAX_FRONTMATTER_PROPERTY_EXCLUSION_MATCHER_CACHE) {
        const oldestCacheKeyResult: IteratorResult<string, undefined> = frontmatterPropertyExclusionMatcherCache.keys().next();
        if (!oldestCacheKeyResult.done) {
            frontmatterPropertyExclusionMatcherCache.delete(oldestCacheKeyResult.value);
        }
    }

    frontmatterPropertyExclusionMatcherCache.set(cacheKey, matcher);
}

function parseFrontmatterPropertyExclusionRule(rawRule: string): FrontmatterPropertyExclusionRule | null {
    const separatorIndex = rawRule.indexOf('=');
    if (separatorIndex === -1) {
        const normalizedKey = casefold(rawRule);
        if (!normalizedKey) {
            return null;
        }
        return { key: normalizedKey, value: null };
    }

    const normalizedKey = casefold(rawRule.slice(0, separatorIndex));
    const normalizedValue = normalizePropertyTreeValuePath(rawRule.slice(separatorIndex + 1));
    if (!normalizedKey || !normalizedValue) {
        return null;
    }

    return {
        key: normalizedKey,
        value: normalizedValue
    };
}

function frontmatterValueMatchesConfiguredValue(value: unknown, configuredValues: Set<string>): boolean {
    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === 'string') {
        const normalized = normalizePropertyTreeValuePath(value);
        return normalized.length > 0 && configuredValues.has(normalized);
    }

    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            return false;
        }

        const normalized = normalizePropertyTreeValuePath(value.toString());
        return normalized.length > 0 && configuredValues.has(normalized);
    }

    if (typeof value === 'boolean') {
        return configuredValues.has(value ? 'true' : 'false');
    }

    if (Array.isArray(value)) {
        return value.some(entry => frontmatterValueMatchesConfiguredValue(entry, configuredValues));
    }

    return false;
}

function compareFrontmatterPropertyExclusionRules(left: FrontmatterPropertyExclusionRule, right: FrontmatterPropertyExclusionRule): number {
    const keyResult = left.key.localeCompare(right.key);
    if (keyResult !== 0) {
        return keyResult;
    }

    if (left.value === right.value) {
        return 0;
    }
    if (left.value === null) {
        return -1;
    }
    if (right.value === null) {
        return 1;
    }
    return left.value.localeCompare(right.value);
}

/**
 * Builds a matcher for frontmatter exclusion rules.
 * Supported rule formats:
 * - key
 * - key=value
 */
export function createFrontmatterPropertyExclusionMatcher(rules: string[]): FrontmatterPropertyExclusionMatcher {
    const cachedByRuleSet = frontmatterPropertyExclusionMatcherByRuleSetCache.get(rules);
    if (cachedByRuleSet) {
        return cachedByRuleSet;
    }

    if (rules.length === 0) {
        frontmatterPropertyExclusionMatcherByRuleSetCache.set(rules, EMPTY_FRONTMATTER_PROPERTY_EXCLUSION_MATCHER);
        return EMPTY_FRONTMATTER_PROPERTY_EXCLUSION_MATCHER;
    }

    const parsedRules = rules
        .map(parseFrontmatterPropertyExclusionRule)
        .filter((rule): rule is FrontmatterPropertyExclusionRule => rule !== null);
    if (parsedRules.length === 0) {
        frontmatterPropertyExclusionMatcherByRuleSetCache.set(rules, EMPTY_FRONTMATTER_PROPERTY_EXCLUSION_MATCHER);
        return EMPTY_FRONTMATTER_PROPERTY_EXCLUSION_MATCHER;
    }

    const uniqueRules = sortAndDedupeByComparator(parsedRules, compareFrontmatterPropertyExclusionRules);

    const cacheKey = uniqueRules
        .map(rule => (rule.value === null ? `${rule.key}\u0001k` : `${rule.key}\u0001v${rule.value}`))
        .join('\u0000');
    const cached = frontmatterPropertyExclusionMatcherCache.get(cacheKey);
    if (cached) {
        frontmatterPropertyExclusionMatcherByRuleSetCache.set(rules, cached);
        return cached;
    }

    const keyOnlyRules = new Set<string>();
    const keyValueRules = new Map<string, Set<string>>();

    uniqueRules.forEach(rule => {
        if (rule.value === null) {
            keyOnlyRules.add(rule.key);
            return;
        }

        const values = keyValueRules.get(rule.key);
        if (values) {
            values.add(rule.value);
            return;
        }

        keyValueRules.set(rule.key, new Set<string>([rule.value]));
    });

    const matcher: FrontmatterPropertyExclusionMatcher = {
        hasCriteria: true,
        matches: (record: Record<string, unknown> | null | undefined): boolean => {
            if (!record) {
                return false;
            }

            for (const [key, value] of Object.entries(record)) {
                const normalizedKey = casefold(key);
                if (!normalizedKey) {
                    continue;
                }

                if (keyOnlyRules.has(normalizedKey)) {
                    return true;
                }

                const configuredValues = keyValueRules.get(normalizedKey);
                if (!configuredValues) {
                    continue;
                }

                if (frontmatterValueMatchesConfiguredValue(value, configuredValues)) {
                    return true;
                }
            }

            return false;
        }
    };

    setFrontmatterPropertyExclusionMatcherCacheEntry(cacheKey, matcher);
    frontmatterPropertyExclusionMatcherByRuleSetCache.set(rules, matcher);
    return matcher;
}

export function shouldExcludeFileWithMatcher(file: TFile, matcher: FrontmatterPropertyExclusionMatcher, app: App): boolean {
    if (!matcher.hasCriteria) {
        return false;
    }

    const metadata = app.metadataCache.getFileCache(file);
    return matcher.matches(metadata?.frontmatter);
}

/**
 * Checks if a file should be excluded based on its frontmatter properties
 */
export function shouldExcludeFile(file: TFile, excludedProperties: string[], app: App): boolean {
    if (excludedProperties.length === 0) return false;

    const matcher = createFrontmatterPropertyExclusionMatcher(excludedProperties);
    return shouldExcludeFileWithMatcher(file, matcher, app);
}

/**
 * Checks if a folder name matches a pattern with wildcard support
 * Supports * at the beginning or end of the pattern
 * @param folderName - The folder name to check
 * @param pattern - The pattern to match against (e.g., "assets*", "*_temp", "exact")
 */
function matchesFolderPattern(folderName: string, pattern: string): boolean {
    const normalizedPattern = casefold(pattern);
    if (!normalizedPattern) {
        return false;
    }

    const normalizedFolderName = casefold(folderName);
    if (!normalizedFolderName) {
        return false;
    }

    // Exact match if no wildcards
    if (!normalizedPattern.includes('*')) {
        return normalizedFolderName === normalizedPattern;
    }

    // Handle wildcard at the end (e.g., "assets*")
    if (normalizedPattern.endsWith('*') && !normalizedPattern.startsWith('*')) {
        const prefix = normalizedPattern.slice(0, -1);
        return normalizedFolderName.startsWith(prefix);
    }

    // Handle wildcard at the beginning (e.g., "*_temp")
    if (normalizedPattern.startsWith('*') && !normalizedPattern.endsWith('*')) {
        const suffix = normalizedPattern.slice(1);
        return normalizedFolderName.endsWith(suffix);
    }

    // For now, we don't support wildcards in the middle or multiple wildcards
    // Just do exact match as fallback
    return normalizedFolderName === normalizedPattern;
}

/**
 * Checks if a folder should be excluded based on the patterns
 * Supports both name-based patterns and path-based patterns (starting with /)
 * @param folderName - The folder name to check (e.g., "archive")
 * @param patterns - Array of exclusion patterns (e.g., ["archive", "/root/archive", "temp*"])
 * @param folderPath - The full folder path for path-based patterns (e.g., "root/archive")
 * @returns true if the folder should be excluded
 */
function matchesFolderExclusionPatterns(
    folderName: string,
    patterns: string[],
    folderPath: string | undefined,
    pathMatcher: (path: string) => boolean
): boolean {
    const hasNamePattern = patterns.some(pattern => !pattern.startsWith('/') && matchesFolderPattern(folderName, pattern));

    if (hasNamePattern) {
        return true;
    }

    if (!folderPath) {
        return false;
    }

    const normalizedPath = folderPath.startsWith('/') ? folderPath : `/${folderPath}`;
    return pathMatcher(normalizedPath);
}

export function shouldExcludeFolder(folderName: string, patterns: string[], folderPath?: string): boolean {
    return matchesFolderExclusionPatterns(folderName, patterns, folderPath, getHiddenFolderMatcher(patterns).matches);
}

/**
 * Checks if a folder's notes should be omitted from parent folder aggregation.
 * Uses the same name and path pattern syntax as shouldExcludeFolder, but path
 * patterns match only the folder itself, not its descendants.
 */
export function shouldExcludeFolderFromDescendants(folderName: string, patterns: string[], folderPath?: string): boolean {
    return matchesFolderExclusionPatterns(folderName, patterns, folderPath, getHiddenFolderBoundaryMatcher(patterns).matches);
}

/**
 * Checks if a file is in an excluded folder by checking all parent folders
 */
function isFileInExcludedFolder(file: TFile, excludedFolderPatterns: string[]): boolean {
    if (!file || excludedFolderPatterns.length === 0) return false;

    const pathMatcher = getHiddenFolderMatcher(excludedFolderPatterns).matches;
    const namePatterns = excludedFolderPatterns.filter(pattern => !pattern.startsWith('/'));
    const matchesNamePattern = (name: string) => namePatterns.some(pattern => matchesFolderPattern(name, pattern));

    let currentFolder: TFolder | null = file.parent;
    while (currentFolder) {
        const normalizedPath = currentFolder.path.startsWith('/') ? currentFolder.path : `/${currentFolder.path}`;
        if (matchesNamePattern(currentFolder.name) || pathMatcher(normalizedPath)) {
            return true;
        }
        currentFolder = currentFolder.parent;
    }

    return false;
}

/**
 * Checks if a folder is a child of an excluded folder by checking all parent folders
 * Also handles wildcard patterns that might exclude parent folders
 */
export function isFolderInExcludedFolder(folder: TFolder, excludedFolderPatterns: string[]): boolean {
    if (!folder || excludedFolderPatterns.length === 0) return false;

    const pathMatcher = getHiddenFolderMatcher(excludedFolderPatterns).matches;
    const namePatterns = excludedFolderPatterns.filter(pattern => !pattern.startsWith('/'));
    const matchesNamePattern = (name: string) => namePatterns.some(pattern => matchesFolderPattern(name, pattern));

    const normalizedFolderPath = folder.path.startsWith('/') ? folder.path : `/${folder.path}`;
    if (pathMatcher(normalizedFolderPath) || matchesNamePattern(folder.name)) {
        return true;
    }

    let currentFolder: TFolder | null = folder.parent;
    while (currentFolder) {
        const normalizedPath = currentFolder.path.startsWith('/') ? currentFolder.path : `/${currentFolder.path}`;
        if (pathMatcher(normalizedPath) || matchesNamePattern(currentFolder.name)) {
            return true;
        }
        currentFolder = currentFolder.parent;
    }

    return false;
}

/**
 * Cleans up redundant exclusion patterns when adding a new pattern
 * Removes existing patterns that would be covered by the new pattern
 * @param existingPatterns - Current list of exclusion patterns
 * @param newPattern - The new pattern being added
 * @returns Cleaned list with the new pattern added and redundant ones removed
 */
export function cleanupExclusionPatterns(existingPatterns: string[], newPattern: string): string[] {
    // If the new pattern is not a path pattern, just add it without cleanup
    // (name patterns work differently and we don't want to mess with them)
    if (!newPattern.startsWith('/')) {
        return [...existingPatterns, newPattern];
    }

    const matcher = getHiddenFolderMatcher([newPattern]).matches;

    // Filter out patterns that would be made redundant by the new pattern
    const cleanedPatterns = existingPatterns.filter(existing => {
        // Keep name-based patterns (they work differently)
        if (!existing.startsWith('/')) {
            return true;
        }

        const normalizedExisting = existing.startsWith('/') ? existing : `/${existing}`;
        return !matcher(normalizedExisting);
    });

    // Add the new pattern
    cleanedPatterns.push(newPattern);

    return cleanedPatterns;
}

/**
 * Checks if a file path is in an excluded folder by checking all parent folders
 * This is a path-based version that doesn't require a TFile object
 */
export function isPathInExcludedFolder(filePath: string, excludedFolderPatterns: string[]): boolean {
    if (!filePath || excludedFolderPatterns.length === 0) return false;

    const pathParts = filePath.split('/');
    let folderPath = '';
    // Check each folder in the path (excluding the file name itself)
    for (let i = 0; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i];
        // Build the folder path up to this point
        folderPath = i === 0 ? folderName : `${folderPath}/${folderName}`;
        if (shouldExcludeFolder(folderName, excludedFolderPatterns, folderPath)) {
            return true;
        }
    }

    return false;
}

/**
 * Checks if a folder has any subfolders based on visibility settings.
 * This is used to determine whether to show expand/collapse chevrons
 * and whether to use the open/closed folder icon.
 *
 * @param folder - The folder to check
 * @param excludePatterns - Array of exclusion patterns
 * @param showHiddenItems - Whether excluded folders are being shown
 * @returns True if the folder has subfolders (visible or all, depending on settings)
 */
export function hasSubfolders(folder: TFolder, excludePatterns: string[], showHiddenItems: boolean): boolean {
    if (!folder.children || folder.children.length === 0) {
        return false;
    }

    // When showing hidden items, count all child folders regardless of exclusion patterns
    // This ensures chevrons appear so users can expand to reveal excluded children
    if (showHiddenItems) {
        return folder.children.some(child => child instanceof TFolder);
    }

    // Skip exclusion check if no exclusion patterns are defined
    const noPatterns = excludePatterns.length === 0;

    // Check if any visible (non-excluded) child folder exists
    return folder.children.some(child => {
        if (!(child instanceof TFolder)) {
            return false;
        }

        // If there are no patterns, any folder counts
        if (noPatterns) {
            return true;
        }

        // Exclude subfolders that match patterns when not showing hidden items
        return !shouldExcludeFolder(child.name, excludePatterns, child.path);
    });
}

/**
 * Returns true if a file passes exclusion rules based on settings
 * - Excludes markdown files with matching frontmatter properties
 * - Excludes files with matching filename patterns
 * - Optionally excludes files in excluded folders when indexing is configured to skip them
 */
interface ExclusionFilterState {
    excludedPropertyMatcher: FrontmatterPropertyExclusionMatcher;
    excludedFolderPatterns: string[];
    includeHiddenItems: boolean;
    hideDrawingPreviewImages: boolean;
    fileNameMatcher: HiddenFileNameMatcher | null;
    hiddenFileTagVisibility: ReturnType<typeof createHiddenTagVisibility> | null;
    db: CachedFileTagsDB | null;
}

function createExclusionFilterState(settings: NotebookNavigatorSettings, options?: FileFilterOptions): ExclusionFilterState {
    const includeHiddenItems = options?.showHiddenItems ?? false;
    const excludedProperties = getActiveHiddenFileProperties(settings);
    const excludedPropertyMatcher = createFrontmatterPropertyExclusionMatcher(excludedProperties);
    const excludedFileNamePatterns = getActiveHiddenFileNames(settings);
    const fileNameMatcher = createHiddenFileNameMatcherForVisibility(excludedFileNamePatterns, includeHiddenItems);
    const hiddenFileTags = getActiveHiddenFileTags(settings);
    const hiddenFileTagVisibility = hiddenFileTags.length > 0 ? createHiddenTagVisibility(hiddenFileTags, includeHiddenItems) : null;
    const db = !includeHiddenItems && hiddenFileTagVisibility?.shouldFilterHiddenTags ? getDBInstanceOrNull() : null;

    return {
        excludedPropertyMatcher,
        excludedFolderPatterns: getActiveHiddenFolders(settings),
        includeHiddenItems,
        hideDrawingPreviewImages: settings.hideDrawingPreviewImages,
        fileNameMatcher,
        hiddenFileTagVisibility,
        db
    };
}

function passesExclusionFilters(file: TFile, state: ExclusionFilterState, app: App): boolean {
    const {
        excludedPropertyMatcher,
        excludedFolderPatterns,
        includeHiddenItems,
        hideDrawingPreviewImages,
        fileNameMatcher,
        hiddenFileTagVisibility,
        db
    } = state;

    if (isDebugLogPath(file.path)) {
        return false;
    }

    if (!includeHiddenItems && shouldHideDrawingCompanionImageFile(app, file, { hideDrawingPreviewImages })) {
        return false;
    }

    // Frontmatter based exclusion (markdown only)
    if (!includeHiddenItems && file.extension === 'md' && excludedPropertyMatcher.hasCriteria) {
        const metadata = app.metadataCache.getFileCache(file);
        if (excludedPropertyMatcher.matches(metadata?.frontmatter)) {
            return false;
        }
    }

    if (fileNameMatcher && fileNameMatcher.matches(file)) {
        return false;
    }

    if (hiddenFileTagVisibility && hiddenFileTagVisibility.shouldFilterHiddenTags && file.extension === 'md') {
        const tags = getCachedFileTags({ app, file, db });
        if (tags.some(tag => !hiddenFileTagVisibility.isTagVisible(tag))) {
            return false;
        }
    }

    // Folder based exclusion (only if configured to skip in index)
    if (SKIP_EXCLUDED_FOLDERS_IN_INDEX && isFileInExcludedFolder(file, excludedFolderPatterns)) {
        return false;
    }

    return true;
}

/**
 * Gets filtered markdown files from the vault, excluding files based on:
 * - Excluded folder patterns
 * - Excluded frontmatter properties
 */
export function getFilteredMarkdownFiles(app: App, settings: NotebookNavigatorSettings, options?: FileFilterOptions): TFile[] {
    if (!app || !settings) return [];

    const filterState = createExclusionFilterState(settings, options);
    return app.vault.getMarkdownFiles().filter(file => passesExclusionFilters(file, filterState, app));
}

/**
 * Creates a predicate that applies the same exclusion filters as `getFilteredMarkdownFiles`, used to
 * test individual files without scanning the vault.
 */
export function createFileVisibilityChecker(
    app: App,
    settings: NotebookNavigatorSettings,
    options?: FileFilterOptions
): (file: TFile) => boolean {
    const filterState = createExclusionFilterState(settings, options);
    return (file: TFile) => passesExclusionFilters(file, filterState, app);
}

/**
 * Gets filtered files that should be present in the storage cache.
 */
export function getFilteredIndexableFiles(app: App, settings: NotebookNavigatorSettings, options?: FileFilterOptions): TFile[] {
    if (!app || !settings) return [];

    const fileVisibility = getActiveFileVisibility(settings);
    const filterState = createExclusionFilterState(settings, options);
    const result: TFile[] = [];

    for (const file of app.vault.getFiles()) {
        if (file.extension === 'md') {
            if (passesExclusionFilters(file, filterState, app)) {
                result.push(file);
            }
            continue;
        }

        const isNonMarkdownDrawingFile = isNonMarkdownDrawingFeatureImageFile(file);
        if (!isGeneratedThumbnailFile(file) && !isNonMarkdownDrawingFile) {
            continue;
        }

        if (!isNonMarkdownDrawingFile && !shouldDisplayFile(file, fileVisibility, app)) {
            continue;
        }

        if (passesExclusionFilters(file, filterState, app)) {
            result.push(file);
        }
    }

    return result;
}

/**
 * Gets filtered document files (markdown, canvas, base) from the vault, excluding files based on:
 * - Excluded folder patterns
 * - Excluded frontmatter properties
 */
export function getFilteredDocumentFiles(app: App, settings: NotebookNavigatorSettings, options?: FileFilterOptions): TFile[] {
    if (!app || !settings) return [];

    const filterState = createExclusionFilterState(settings, options);
    return app.vault.getFiles().filter(file => {
        // Only include document files (md, canvas, base)
        const isDocument = isPrimaryDocumentFile(file);
        if (!isDocument) return false;

        return passesExclusionFilters(file, filterState, app);
    });
}

/**
 * Gets all filtered files from the vault (markdown and non-markdown), excluding:
 * - Excluded folder patterns
 * - Excluded frontmatter properties (for markdown files only)
 * - Files based on visibility settings
 */
export function getFilteredFiles(app: App, settings: NotebookNavigatorSettings, options?: FileFilterOptions): TFile[] {
    if (!app || !settings) return [];

    const fileVisibility = getActiveFileVisibility(settings);
    const filterState = createExclusionFilterState(settings, options);

    return app.vault.getFiles().filter(file => {
        // Filter by visibility settings
        if (!shouldDisplayFile(file, fileVisibility, app)) {
            return false;
        }

        return passesExclusionFilters(file, filterState, app);
    });
}
