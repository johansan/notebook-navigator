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

import { NAV_RAINBOW_DEFAULTS } from '../settings/defaultSettings';
import {
    isNavRainbowColorMode,
    isNavRainbowScope,
    isNavRainbowTransitionStyle,
    type NavRainbowSettings,
    type NotebookNavigatorSettings,
    type VaultProfile,
    type VaultProfilePropertyKey
} from '../settings/types';
import { isSearchShortcut, type ShortcutEntry } from '../types/shortcuts';
import { strings } from '../i18n';
import { normalizeCalendarCustomRootFolder } from './calendarCustomNotePatterns';
import { FILE_VISIBILITY, type FileVisibility } from './fileTypeUtils';
import { showNotice } from './noticeUtils';
import { stripTrailingSlash } from './pathUtils';
import { casefold } from './recordUtils';
import { normalizeTagPath } from './tagUtils';
import { isRecord } from './typeGuards';
import { createHiddenTagMatcher, matchesHiddenTagPattern, getHiddenTagPathPatterns, normalizeTagPathValue } from './tagPrefixMatcher';
import { formatCommaSeparatedList, getCachedCommaSeparatedList } from './commaSeparatedListUtils';
import {
    createPathPatternMatcher,
    getPathPatternCacheKey,
    getNormalizedPathSegments,
    matchesLiteralPrefix,
    matchesParsedPatternSegments,
    parsePathPattern,
    rebuildRenamedPattern,
    type PathPatternMatcher,
    type ParsedPathPattern
} from './pathPatternMatcher';

export const DEFAULT_VAULT_PROFILE_ID = 'default';
const FALLBACK_VAULT_PROFILE_NAME = 'Default';

interface VaultProfileInitOptions {
    id?: string;
    hiddenFolders?: string[];
    descendantExcludedFolders?: string[];
    hiddenFileProperties?: string[];
    hiddenFileNames?: string[];
    hiddenTags?: string[];
    hiddenFileTags?: string[];
    fileVisibility?: FileVisibility;
    navigationBanner?: string | null;
    periodicNotesFolder?: string;
    propertyKeys?: VaultProfilePropertyKey[];
    shortcuts?: ShortcutEntry[];
    navRainbow?: NavRainbowSettings;
}

// Hidden folder pattern rules (all patterns must be absolute with a leading "/"):
// - "/folder/*" hides descendants while keeping the folder visible
// - "/folder*" hides the folder and its descendants
const normalizePathPattern = (pattern: string): string => {
    const normalized = normalizeHiddenFolderPath(pattern);
    if (!normalized) {
        return '';
    }
    // Collapse multiple slashes inside the pattern while preserving trailing wildcard characters
    const parts = normalized.split('/').filter(Boolean);
    return parts.length === 0 ? '/' : `/${parts.join('/')}`;
};

const normalizeHiddenFolderMatchPath = (value: string): string => {
    const normalized = normalizeHiddenFolderPath(value);
    if (!normalized) {
        return '';
    }
    return casefold(normalized);
};

const normalizeHiddenFolderMatchPattern = (pattern: string): string => {
    const normalized = normalizeHiddenFolderMatchPath(pattern);
    if (!normalized) {
        return '';
    }

    const parts = normalized.split('/').filter(Boolean);
    return parts.length === 0 ? '/' : `/${parts.join('/')}`;
};

const parseHiddenFolderPattern = (pattern: string): ParsedPathPattern | null => {
    return parsePathPattern(pattern, { normalizePattern: normalizePathPattern, requireRoot: true });
};

const createHiddenFolderUpdateMatcher = (patterns: string[]): PathPatternMatcher => {
    const pathPatterns = patterns.filter(pattern => pattern.trim().startsWith('/'));
    return createPathPatternMatcher(pathPatterns, {
        normalizePattern: normalizePathPattern,
        normalizePath: normalizeHiddenFolderPath,
        requireRoot: true
    });
};

const matchesHiddenFolderLiteralPrefix = (pattern: ParsedPathPattern, candidateSegments: string[]): boolean => {
    if (pattern.literalPrefixLength === 0 || candidateSegments.length === 0) {
        return false;
    }

    const compareCount = Math.min(pattern.literalPrefixLength, pattern.segments.length, candidateSegments.length);
    if (compareCount === 0) {
        return false;
    }

    for (let index = 0; index < compareCount; index += 1) {
        const segment = pattern.segments[index];
        const candidate = candidateSegments[index];
        if (segment.type !== 'literal') {
            return false;
        }
        if (casefold(segment.value) !== candidate) {
            return false;
        }
    }

    return true;
};

// Cache compiled hidden-folder matchers keyed by the normalized pattern list.
interface HiddenFolderMatcherCaches {
    byKey: Map<string, PathPatternMatcher>;
    byPatternList: WeakMap<readonly string[], { version: number; matcher: PathPatternMatcher }>;
}

let hiddenFolderMatcherCacheVersion = 0;
const hiddenFolderMatcherCaches: HiddenFolderMatcherCaches = { byKey: new Map(), byPatternList: new WeakMap() };
const hiddenFolderBoundaryMatcherCaches: HiddenFolderMatcherCaches = { byKey: new Map(), byPatternList: new WeakMap() };

const getCachedHiddenFolderMatcher = (
    patterns: string[],
    caches: HiddenFolderMatcherCaches,
    buildMatcher: (pathPatterns: string[]) => PathPatternMatcher
): PathPatternMatcher => {
    const cachedByPatternList = caches.byPatternList.get(patterns);
    if (cachedByPatternList && cachedByPatternList.version === hiddenFolderMatcherCacheVersion) {
        return cachedByPatternList.matcher;
    }

    const pathPatterns: string[] = [];
    const normalizedPatterns = new Set<string>();

    patterns.forEach(pattern => {
        const trimmed = pattern.trim();
        if (!trimmed.startsWith('/')) {
            return;
        }

        pathPatterns.push(trimmed);
        const normalized = normalizeHiddenFolderMatchPattern(trimmed);
        if (normalized) {
            normalizedPatterns.add(normalized);
        }
    });

    const cacheKey = getPathPatternCacheKey(Array.from(normalizedPatterns).sort());
    const cached = caches.byKey.get(cacheKey);
    if (cached) {
        caches.byPatternList.set(patterns, { version: hiddenFolderMatcherCacheVersion, matcher: cached });
        return cached;
    }

    const matcher = buildMatcher(pathPatterns);
    caches.byKey.set(cacheKey, matcher);
    caches.byPatternList.set(patterns, { version: hiddenFolderMatcherCacheVersion, matcher });
    return matcher;
};

export const getHiddenFolderMatcher = (patterns: string[]): PathPatternMatcher =>
    getCachedHiddenFolderMatcher(patterns, hiddenFolderMatcherCaches, pathPatterns =>
        createPathPatternMatcher(pathPatterns, {
            normalizePattern: normalizeHiddenFolderMatchPattern,
            normalizePath: normalizeHiddenFolderMatchPath,
            requireRoot: true
        })
    );

// Boundary matcher: path patterns match the folder itself, never its descendants,
// so the extra path segments allowed by matchesParsedPatternSegments are rejected
// through an exact segment-count requirement.
export const getHiddenFolderBoundaryMatcher = (patterns: string[]): PathPatternMatcher =>
    getCachedHiddenFolderMatcher(patterns, hiddenFolderBoundaryMatcherCaches, pathPatterns => {
        const parsedPatterns = pathPatterns
            .map(pattern => parsePathPattern(pattern, { normalizePattern: normalizeHiddenFolderMatchPattern, requireRoot: true }))
            .filter((pattern): pattern is ParsedPathPattern => pattern !== null);
        return {
            patterns: parsedPatterns,
            matches: path => {
                const pathSegments = getNormalizedPathSegments(path, normalizeHiddenFolderMatchPath);
                return parsedPatterns.some(
                    pattern => pathSegments.length === pattern.segments.length && matchesParsedPatternSegments(pattern, pathSegments)
                );
            }
        };
    });

// Clears all cached hidden-folder matchers.
export const clearHiddenFolderMatcherCache = (): void => {
    hiddenFolderMatcherCaches.byKey.clear();
    hiddenFolderBoundaryMatcherCaches.byKey.clear();
    hiddenFolderMatcherCacheVersion += 1;
};

// Normalizes a folder path to the canonical format used in hidden folder settings
export function normalizeHiddenFolderPath(value: string): string {
    if (!value) {
        return '';
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return '';
    }

    const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return stripTrailingSlash(withLeadingSlash);
}

const isHiddenFolderPathPattern = (pattern: string): boolean => {
    return typeof pattern === 'string' && pattern.startsWith('/');
};

export interface HiddenFolderPatternMatch {
    normalizedPrefix: string;
}

type FolderPatternProfileKey = 'hiddenFolders' | 'descendantExcludedFolders';
const FOLDER_PATTERN_PROFILE_KEYS: readonly FolderPatternProfileKey[] = ['hiddenFolders', 'descendantExcludedFolders'];

export const getHiddenFolderPatternMatch = (pattern: string): HiddenFolderPatternMatch | null => {
    if (!isHiddenFolderPathPattern(pattern)) {
        return null;
    }

    const parsed = parseHiddenFolderPattern(pattern);
    if (!parsed || parsed.literalPrefixLength === 0) {
        return null;
    }

    const normalizedPrefixSegments = parsed.segments.slice(0, parsed.literalPrefixLength).map(segment => {
        return segment.type === 'literal' ? segment.value : '';
    });
    const normalizedPrefix = normalizeHiddenFolderPath(`/${normalizedPrefixSegments.join('/')}`);

    return { normalizedPrefix };
};

// Creates a clean copy of pattern array, trimming and filtering out empty strings
const clonePatterns = (patterns: string[] | undefined): string[] => {
    if (!Array.isArray(patterns)) {
        return [];
    }
    return patterns.map(pattern => pattern.trim()).filter(pattern => pattern.length > 0);
};

const clonePropertyKeyEntry = (entry: VaultProfilePropertyKey): VaultProfilePropertyKey => {
    return {
        key: entry.key,
        showInNavigation: entry.showInNavigation,
        showInList: entry.showInList,
        showInFileMenu: entry.showInFileMenu
    };
};

const resolveRainbowColor = (value: unknown, fallback: string): string => {
    if (typeof value !== 'string') {
        return fallback;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
};

const cloneNavRainbowBaseSection = <TSection extends NavRainbowSettings['shortcuts']>(section: TSection): TSection => {
    return { ...section };
};

export const cloneNavRainbowSettings = (settings: NavRainbowSettings): NavRainbowSettings => {
    return {
        mode: settings.mode,
        balanceHueLuminance: settings.balanceHueLuminance,
        separateThemeColors: settings.separateThemeColors,
        shortcuts: cloneNavRainbowBaseSection(settings.shortcuts),
        recent: cloneNavRainbowBaseSection(settings.recent),
        folders: cloneNavRainbowBaseSection(settings.folders),
        tags: cloneNavRainbowBaseSection(settings.tags),
        properties: cloneNavRainbowBaseSection(settings.properties)
    };
};

export const areNavRainbowSettingsEqual = (previous?: NavRainbowSettings | null, next?: NavRainbowSettings | null): boolean => {
    if (previous === next) {
        return true;
    }
    if (!previous || !next) {
        return false;
    }

    return (
        previous.mode === next.mode &&
        previous.balanceHueLuminance === next.balanceHueLuminance &&
        previous.separateThemeColors === next.separateThemeColors &&
        previous.shortcuts.enabled === next.shortcuts.enabled &&
        previous.shortcuts.firstColor === next.shortcuts.firstColor &&
        previous.shortcuts.lastColor === next.shortcuts.lastColor &&
        previous.shortcuts.darkFirstColor === next.shortcuts.darkFirstColor &&
        previous.shortcuts.darkLastColor === next.shortcuts.darkLastColor &&
        previous.shortcuts.transitionStyle === next.shortcuts.transitionStyle &&
        previous.recent.enabled === next.recent.enabled &&
        previous.recent.firstColor === next.recent.firstColor &&
        previous.recent.lastColor === next.recent.lastColor &&
        previous.recent.darkFirstColor === next.recent.darkFirstColor &&
        previous.recent.darkLastColor === next.recent.darkLastColor &&
        previous.recent.transitionStyle === next.recent.transitionStyle &&
        previous.folders.enabled === next.folders.enabled &&
        previous.folders.firstColor === next.folders.firstColor &&
        previous.folders.lastColor === next.folders.lastColor &&
        previous.folders.darkFirstColor === next.folders.darkFirstColor &&
        previous.folders.darkLastColor === next.folders.darkLastColor &&
        previous.folders.transitionStyle === next.folders.transitionStyle &&
        previous.folders.scope === next.folders.scope &&
        previous.tags.enabled === next.tags.enabled &&
        previous.tags.firstColor === next.tags.firstColor &&
        previous.tags.lastColor === next.tags.lastColor &&
        previous.tags.darkFirstColor === next.tags.darkFirstColor &&
        previous.tags.darkLastColor === next.tags.darkLastColor &&
        previous.tags.transitionStyle === next.tags.transitionStyle &&
        previous.tags.scope === next.tags.scope &&
        previous.properties.enabled === next.properties.enabled &&
        previous.properties.firstColor === next.properties.firstColor &&
        previous.properties.lastColor === next.properties.lastColor &&
        previous.properties.darkFirstColor === next.properties.darkFirstColor &&
        previous.properties.darkLastColor === next.properties.darkLastColor &&
        previous.properties.transitionStyle === next.properties.transitionStyle &&
        previous.properties.scope === next.properties.scope
    );
};

const normalizeNavRainbowBaseSection = (value: unknown, defaults: NavRainbowSettings['shortcuts']): NavRainbowSettings['shortcuts'] => {
    const section = isRecord(value) ? value : null;
    const firstColor = resolveRainbowColor(section?.firstColor, defaults.firstColor);
    const lastColor = resolveRainbowColor(section?.lastColor, defaults.lastColor);

    return {
        enabled: typeof section?.enabled === 'boolean' ? section.enabled : defaults.enabled,
        firstColor,
        lastColor,
        darkFirstColor: resolveRainbowColor(section?.darkFirstColor, defaults.darkFirstColor),
        darkLastColor: resolveRainbowColor(section?.darkLastColor, defaults.darkLastColor),
        transitionStyle: isNavRainbowTransitionStyle(section?.transitionStyle) ? section.transitionStyle : defaults.transitionStyle
    };
};

const normalizeNavRainbowSettings = (value: unknown, defaults: NavRainbowSettings = NAV_RAINBOW_DEFAULTS): NavRainbowSettings => {
    const navRainbow = isRecord(value) ? value : null;
    const shortcuts = isRecord(navRainbow?.shortcuts) ? navRainbow.shortcuts : null;
    const recent = isRecord(navRainbow?.recent) ? navRainbow.recent : null;
    const folders = isRecord(navRainbow?.folders) ? navRainbow.folders : null;
    const tags = isRecord(navRainbow?.tags) ? navRainbow.tags : null;
    const properties = isRecord(navRainbow?.properties) ? navRainbow.properties : null;

    const foldersBase = normalizeNavRainbowBaseSection(folders, defaults.folders);
    const tagsBase = normalizeNavRainbowBaseSection(tags, defaults.tags);
    const propertiesBase = normalizeNavRainbowBaseSection(properties, defaults.properties);

    return {
        mode: isNavRainbowColorMode(navRainbow?.mode) ? navRainbow.mode : defaults.mode,
        balanceHueLuminance:
            typeof navRainbow?.balanceHueLuminance === 'boolean' ? navRainbow.balanceHueLuminance : defaults.balanceHueLuminance,
        separateThemeColors:
            typeof navRainbow?.separateThemeColors === 'boolean' ? navRainbow.separateThemeColors : defaults.separateThemeColors,
        shortcuts: normalizeNavRainbowBaseSection(shortcuts, defaults.shortcuts),
        recent: normalizeNavRainbowBaseSection(recent, defaults.recent),
        folders: {
            ...foldersBase,
            scope: isNavRainbowScope(folders?.scope) ? folders.scope : defaults.folders.scope
        },
        tags: {
            ...tagsBase,
            scope: isNavRainbowScope(tags?.scope) ? tags.scope : defaults.tags.scope
        },
        properties: {
            ...propertiesBase,
            scope: isNavRainbowScope(properties?.scope) ? properties.scope : defaults.properties.scope
        }
    };
};

const normalizePropertyKeyToggle = (value: unknown): boolean => value !== false;
// File menu visibility stays disabled unless persisted settings explicitly set true.
const normalizePropertyKeyFileMenuToggle = (value: unknown): boolean => value === true;

const sanitizePropertyKeyEntry = (entry: unknown): VaultProfilePropertyKey | null => {
    if (!isRecord(entry)) {
        return null;
    }

    const key = typeof entry['key'] === 'string' ? entry['key'].trim() : '';
    const normalizedKey = casefold(key);
    if (!key || !normalizedKey) {
        return null;
    }

    return {
        key,
        showInNavigation: normalizePropertyKeyToggle(entry['showInNavigation']),
        showInList: normalizePropertyKeyToggle(entry['showInList']),
        showInFileMenu: normalizePropertyKeyFileMenuToggle(entry['showInFileMenu'])
    };
};

export const clonePropertyKeys = (propertyKeys: VaultProfilePropertyKey[] | undefined): VaultProfilePropertyKey[] => {
    if (!Array.isArray(propertyKeys) || propertyKeys.length === 0) {
        return [];
    }

    const cloned: VaultProfilePropertyKey[] = [];
    const seenKeys = new Set<string>();
    propertyKeys.forEach(entry => {
        const sanitized = sanitizePropertyKeyEntry(entry);
        if (!sanitized) {
            return;
        }
        if (!sanitized.showInNavigation && !sanitized.showInList && !sanitized.showInFileMenu) {
            return;
        }

        const normalizedKey = casefold(sanitized.key);
        if (!normalizedKey || seenKeys.has(normalizedKey)) {
            return;
        }

        seenKeys.add(normalizedKey);
        cloned.push(clonePropertyKeyEntry(sanitized));
    });

    return cloned;
};

export type PropertyKeySetMode = 'any' | 'navigation' | 'list' | 'file-menu';

export function getPropertyKeySet(
    propertyKeys: readonly VaultProfilePropertyKey[] | undefined,
    mode: PropertyKeySetMode = 'any'
): ReadonlySet<string> {
    const entries = propertyKeys ?? [];
    if (entries.length === 0) {
        return new Set();
    }

    const keys = new Set<string>();
    const seen = new Set<string>();
    entries.forEach(entry => {
        if (!entry) {
            return;
        }

        if (mode === 'navigation' && !entry.showInNavigation) {
            return;
        }
        if (mode === 'list' && !entry.showInList) {
            return;
        }
        if (mode === 'file-menu' && !entry.showInFileMenu) {
            return;
        }

        if (mode === 'any' && !entry.showInNavigation && !entry.showInList && !entry.showInFileMenu) {
            return;
        }

        const displayKey = typeof entry.key === 'string' ? entry.key.trim() : '';
        const normalized = casefold(displayKey);
        if (!normalized || seen.has(normalized)) {
            return;
        }

        seen.add(normalized);
        keys.add(normalized);
    });

    return keys;
}

export function getActivePropertyKeySet(settings: NotebookNavigatorSettings, mode: PropertyKeySetMode = 'any'): ReadonlySet<string> {
    return getPropertyKeySet(getActiveVaultProfile(settings).propertyKeys, mode);
}

export function createPropertyKeysFromPropertyFields(
    propertyFields: string,
    existingPropertyKeys?: VaultProfilePropertyKey[]
): VaultProfilePropertyKey[] {
    const existingByKey = new Map<string, VaultProfilePropertyKey>();
    clonePropertyKeys(existingPropertyKeys).forEach(entry => {
        const normalizedKey = casefold(entry.key);
        if (!normalizedKey) {
            return;
        }
        existingByKey.set(normalizedKey, entry);
    });

    const propertyKeys: VaultProfilePropertyKey[] = [];
    const seenKeys = new Set<string>();
    getCachedCommaSeparatedList(propertyFields).forEach(rawKey => {
        const key = rawKey.trim();
        const normalizedKey = casefold(key);
        if (!key || !normalizedKey || seenKeys.has(normalizedKey)) {
            return;
        }

        seenKeys.add(normalizedKey);
        const existing = existingByKey.get(normalizedKey);
        propertyKeys.push({
            key,
            showInNavigation: existing?.showInNavigation ?? true,
            showInList: existing?.showInList ?? true,
            showInFileMenu: existing?.showInFileMenu ?? false
        });
    });

    return propertyKeys;
}

const propertyFieldsByPropertyKeysCache = new WeakMap<readonly VaultProfilePropertyKey[], string>();

const collectPropertyFieldNames = (propertyKeys: readonly VaultProfilePropertyKey[]): string[] => {
    const keys: string[] = [];
    const seenKeys = new Set<string>();
    propertyKeys.forEach(entry => {
        const sanitized = sanitizePropertyKeyEntry(entry);
        if (!sanitized) {
            return;
        }

        const normalizedKey = casefold(sanitized.key);
        if (!normalizedKey || seenKeys.has(normalizedKey)) {
            return;
        }

        seenKeys.add(normalizedKey);
        keys.push(sanitized.key);
    });

    return keys;
};

export function getPropertyFieldsFromPropertyKeys(propertyKeys: readonly VaultProfilePropertyKey[] | undefined): string {
    if (!Array.isArray(propertyKeys) || propertyKeys.length === 0) {
        return '';
    }

    const cached = propertyFieldsByPropertyKeysCache.get(propertyKeys);
    if (cached !== undefined) {
        return cached;
    }

    const formatted = formatCommaSeparatedList(collectPropertyFieldNames(propertyKeys));
    propertyFieldsByPropertyKeysCache.set(propertyKeys, formatted);
    return formatted;
}

// Creates a clone of shortcuts array to prevent shared references
export const cloneShortcuts = (shortcuts: ShortcutEntry[] | undefined): ShortcutEntry[] => {
    if (!Array.isArray(shortcuts)) {
        return [];
    }
    return shortcuts.map(shortcut => {
        if (!isSearchShortcut(shortcut) || !shortcut.startTarget) {
            return { ...shortcut };
        }

        return {
            ...shortcut,
            startTarget: { ...shortcut.startTarget }
        };
    });
};

// Applies a transformation function to shortcuts for every profile that has entries
export const mutateVaultProfileShortcuts = (
    profiles: VaultProfile[] | undefined,
    transform: (shortcuts: ShortcutEntry[]) => ShortcutEntry[] | null | undefined
): boolean => {
    if (!Array.isArray(profiles) || profiles.length === 0) {
        return false;
    }

    let didChange = false;

    profiles.forEach(profile => {
        if (!Array.isArray(profile.shortcuts) || profile.shortcuts.length === 0) {
            return;
        }

        const next = transform(profile.shortcuts);
        if (!next) {
            return;
        }

        profile.shortcuts = next;
        didChange = true;
    });

    return didChange;
};

// Generates a unique profile ID using timestamp and random string
const generateProfileId = (): string => {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

// Returns the profile name or falls back to the localized default name if empty
const resolveProfileName = (name: string | undefined): string => {
    const trimmed = (name ?? '').trim();
    if (trimmed.length > 0) {
        return trimmed;
    }
    return getLocalizedDefaultVaultProfileName();
};

// Validates and returns a file visibility setting, defaulting to SUPPORTED if invalid
const resolveFileVisibility = (value: FileVisibility | undefined): FileVisibility => {
    if (value === FILE_VISIBILITY.ALL || value === FILE_VISIBILITY.DOCUMENTS || value === FILE_VISIBILITY.SUPPORTED) {
        return value;
    }
    return FILE_VISIBILITY.SUPPORTED;
};

// Creates a new vault profile with the specified name and configuration options
export function createVaultProfile(name: string, options: VaultProfileInitOptions = {}): VaultProfile {
    return {
        id: options.id ?? generateProfileId(),
        name: resolveProfileName(name),
        fileVisibility: resolveFileVisibility(options.fileVisibility),
        hiddenFolders: clonePatterns(options.hiddenFolders),
        descendantExcludedFolders: clonePatterns(options.descendantExcludedFolders),
        hiddenTags: clonePatterns(options.hiddenTags),
        hiddenFileNames: clonePatterns(options.hiddenFileNames),
        hiddenFileTags: clonePatterns(options.hiddenFileTags),
        hiddenFileProperties: clonePatterns(options.hiddenFileProperties),
        navigationBanner:
            typeof options.navigationBanner === 'string' && options.navigationBanner.length > 0 ? options.navigationBanner : null,
        periodicNotesFolder: normalizeCalendarCustomRootFolder(
            typeof options.periodicNotesFolder === 'string' ? options.periodicNotesFolder : ''
        ),
        propertyKeys: clonePropertyKeys(options.propertyKeys),
        shortcuts: cloneShortcuts(options.shortcuts),
        navRainbow: normalizeNavRainbowSettings(options.navRainbow)
    };
}

// Creates a vault profile using values from an existing profile with optional fallbacks
export interface VaultProfileTemplateOptions {
    sourceProfile?: VaultProfile | null;
    fallbackHiddenTags?: string[];
    fallbackFileVisibility?: FileVisibility;
}

function createVaultProfileFromTemplate(name: string, template: VaultProfileTemplateOptions = {}): VaultProfile {
    const source = template.sourceProfile ?? null;
    return createVaultProfile(name, {
        hiddenFolders: source?.hiddenFolders,
        descendantExcludedFolders: source?.descendantExcludedFolders,
        hiddenFileProperties: source?.hiddenFileProperties,
        hiddenFileNames: source?.hiddenFileNames,
        hiddenTags: source?.hiddenTags ?? template.fallbackHiddenTags,
        hiddenFileTags: source?.hiddenFileTags,
        fileVisibility: source?.fileVisibility ?? template.fallbackFileVisibility,
        navigationBanner: source?.navigationBanner,
        periodicNotesFolder: source?.periodicNotesFolder,
        propertyKeys: source?.propertyKeys,
        shortcuts: source?.shortcuts,
        navRainbow: source?.navRainbow
    });
}

export type VaultProfileNameError = 'empty' | 'duplicate';

// Validates a candidate profile name and returns a specific error code on failure
function validateVaultProfileName(
    profiles: VaultProfile[] | null | undefined,
    candidateName: string,
    options: { excludeId?: string } = {}
): VaultProfileNameError | null {
    const trimmed = candidateName.trim();
    if (!trimmed) {
        return 'empty';
    }

    if (hasVaultProfileNameDuplicate(profiles, trimmed, options)) {
        return 'duplicate';
    }

    return null;
}

// Creates a profile from the provided template after validating the name
export function createValidatedVaultProfileFromTemplate(
    profiles: VaultProfile[] | null | undefined,
    name: string,
    template: VaultProfileTemplateOptions = {}
): { profile: VaultProfile } | { error: VaultProfileNameError } {
    const validationError = validateVaultProfileName(profiles, name);
    if (validationError) {
        return { error: validationError };
    }

    return {
        profile: createVaultProfileFromTemplate(name.trim(), template)
    };
}

// Validates a profile name and shows a warning notice on failure
export function validateVaultProfileNameOrNotify(
    profiles: VaultProfile[] | null | undefined,
    candidateName: string,
    options: { excludeId?: string } = {}
): string | null {
    const validationError = validateVaultProfileName(profiles, candidateName, options);
    if (!validationError) {
        return candidateName.trim();
    }

    if (validationError === 'empty') {
        showNotice(strings.settings.items.vaultProfiles.errors.emptyName, { variant: 'warning' });
        return null;
    }

    if (validationError === 'duplicate') {
        showNotice(strings.settings.items.vaultProfiles.errors.duplicateName, { variant: 'warning' });
        return null;
    }

    return null;
}

// Checks if a profile name already exists in the list (case-insensitive comparison)
function hasVaultProfileNameDuplicate(
    profiles: VaultProfile[] | null | undefined,
    candidateName: string,
    options: { excludeId?: string } = {}
): boolean {
    if (!Array.isArray(profiles)) {
        return false;
    }

    const normalizedCandidate = casefold(candidateName);
    if (!normalizedCandidate) {
        return false;
    }

    return profiles.some(profile => {
        if (options.excludeId && profile.id === options.excludeId) {
            return false;
        }
        const normalizedProfileName = casefold(profile.name ?? '');
        return normalizedProfileName === normalizedCandidate;
    });
}

function getCanonicalHiddenTagPattern(pattern: string): string {
    const trimmed = pattern.trim();
    if (!trimmed) {
        return '';
    }

    const parsed = parsePathPattern(trimmed, { normalizePattern: normalizeTagPathValue });
    if (parsed) {
        return parsed.normalized;
    }

    if (trimmed.startsWith('*') && !trimmed.slice(1).includes('*') && !trimmed.includes('/')) {
        const suffix = normalizeTagPathValue(trimmed.slice(1));
        return suffix.length > 0 ? `*${suffix}` : '';
    }

    if (trimmed.endsWith('*') && !trimmed.slice(0, -1).includes('*') && !trimmed.includes('/')) {
        const prefix = normalizeTagPathValue(trimmed.slice(0, -1));
        return prefix.length > 0 ? `${prefix}*` : '';
    }

    return normalizeTagPathValue(trimmed);
}

function dedupeCanonicalHiddenTagPatterns(patterns: string[]): string[] {
    const uniquePatterns: string[] = [];
    const seen = new Set<string>();

    patterns.forEach(pattern => {
        const canonical = getCanonicalHiddenTagPattern(pattern);
        if (!canonical || seen.has(canonical)) {
            return;
        }

        seen.add(canonical);
        uniquePatterns.push(pattern);
    });

    return uniquePatterns;
}

// Returns the localized name for the default profile, falling back to English if not available
export function getLocalizedDefaultVaultProfileName(): string {
    const localizedName = strings.settings.items.vaultProfiles.defaultName?.trim();
    if (localizedName && localizedName.length > 0) {
        return localizedName;
    }
    return FALLBACK_VAULT_PROFILE_NAME;
}

// Ensures vault profiles are properly initialized with at least one default profile
export function ensureVaultProfiles(settings: NotebookNavigatorSettings): void {
    if (!Array.isArray(settings.vaultProfiles)) {
        settings.vaultProfiles = [];
    }

    if (settings.vaultProfiles.length === 0) {
        settings.vaultProfiles.push(
            createVaultProfile(getLocalizedDefaultVaultProfileName(), {
                id: DEFAULT_VAULT_PROFILE_ID
            })
        );
    }

    const hasDefaultProfile = settings.vaultProfiles.some(profile => profile.id === DEFAULT_VAULT_PROFILE_ID);
    if (!hasDefaultProfile) {
        settings.vaultProfiles.unshift(
            createVaultProfile(getLocalizedDefaultVaultProfileName(), {
                id: DEFAULT_VAULT_PROFILE_ID
            })
        );
    }

    settings.vaultProfiles.forEach(profile => {
        const profileRecord = isRecord(profile) ? profile : null;
        if (profileRecord) {
            const legacyHiddenFiles = profileRecord['hiddenFiles'];
            if (!Array.isArray(profileRecord['hiddenFileProperties']) && Array.isArray(legacyHiddenFiles)) {
                const migrated = legacyHiddenFiles
                    .map(entry => (typeof entry === 'string' ? entry.trim() : ''))
                    .filter(entry => entry.length > 0);
                profile.hiddenFileProperties = migrated;
            }
            delete profileRecord['hiddenFiles'];

            const legacyFileNamePatterns = profileRecord['hiddenFileNamePatterns'];
            if (!Array.isArray(profileRecord['hiddenFileNames']) && Array.isArray(legacyFileNamePatterns)) {
                const migrated = legacyFileNamePatterns
                    .map(entry => (typeof entry === 'string' ? entry.trim() : ''))
                    .filter(entry => entry.length > 0);
                profile.hiddenFileNames = migrated;
            }
            delete profileRecord['hiddenFileNamePatterns'];

            const legacyPropertyFields = profileRecord['propertyFields'];
            if (!Array.isArray(profileRecord['propertyKeys']) && typeof legacyPropertyFields === 'string') {
                profile.propertyKeys = createPropertyKeysFromPropertyFields(legacyPropertyFields);
            }
            delete profileRecord['propertyFields'];
        }

        profile.name = resolveProfileName(profile.name);
        profile.fileVisibility = resolveFileVisibility(profile.fileVisibility);
        profile.hiddenFolders = clonePatterns(profile.hiddenFolders);
        profile.descendantExcludedFolders = clonePatterns(profile.descendantExcludedFolders);
        const hiddenTagSource = Array.isArray(profile.hiddenTags) ? profile.hiddenTags : [];
        profile.hiddenTags = clonePatterns(hiddenTagSource);
        profile.hiddenFileNames = clonePatterns(profile.hiddenFileNames);
        const hiddenFileTagSource = Array.isArray(profile.hiddenFileTags) ? profile.hiddenFileTags : [];
        profile.hiddenFileTags = clonePatterns(hiddenFileTagSource);
        profile.hiddenFileProperties = clonePatterns(profile.hiddenFileProperties);
        profile.navigationBanner =
            typeof profile.navigationBanner === 'string' && profile.navigationBanner.length > 0 ? profile.navigationBanner : null;
        const profileRecordPeriodicNotesFolder =
            profileRecord && typeof profileRecord['periodicNotesFolder'] === 'string' ? profileRecord['periodicNotesFolder'] : null;
        profile.periodicNotesFolder = normalizeCalendarCustomRootFolder(profileRecordPeriodicNotesFolder ?? '');
        profile.propertyKeys = clonePropertyKeys(profile.propertyKeys);
        profile.shortcuts = cloneShortcuts(profile.shortcuts);
        profile.navRainbow = normalizeNavRainbowSettings(profile.navRainbow);
    });

    const hasActiveProfile = settings.vaultProfiles.some(profile => profile.id === settings.vaultProfile);
    if (!hasActiveProfile) {
        settings.vaultProfile = DEFAULT_VAULT_PROFILE_ID;
    }
}

// Retrieves the currently active vault profile based on settings.
// Assumes settings have already been normalized by ensureVaultProfiles.
export function getActiveVaultProfile(settings: NotebookNavigatorSettings): VaultProfile {
    if (!Array.isArray(settings.vaultProfiles) || settings.vaultProfiles.length === 0) {
        throw new Error('No vault profiles configured');
    }
    return findVaultProfileById(settings.vaultProfiles, settings.vaultProfile);
}

// Finds a vault profile by ID or returns the first profile as fallback
export function findVaultProfileById(profiles: VaultProfile[] | undefined, profileId: string | null | undefined): VaultProfile {
    if (!Array.isArray(profiles) || profiles.length === 0) {
        throw new Error('No vault profiles configured');
    }
    if (profileId) {
        const match = profiles.find(profile => profile.id === profileId);
        if (match) {
            return match;
        }
    }
    return profiles[0];
}

// Returns the list of hidden folder patterns from the active profile
export function getActiveHiddenFolders(settings: NotebookNavigatorSettings): string[] {
    return getActiveVaultProfile(settings).hiddenFolders;
}

export function getActiveDescendantExcludedFolders(settings: NotebookNavigatorSettings): string[] {
    return getActiveVaultProfile(settings).descendantExcludedFolders;
}

export function getActiveHiddenFileNames(settings: NotebookNavigatorSettings): string[] {
    return getActiveVaultProfile(settings).hiddenFileNames;
}

export function getActiveHiddenTags(settings: NotebookNavigatorSettings): string[] {
    return getActiveVaultProfile(settings).hiddenTags;
}

export function getActiveHiddenFileTags(settings: NotebookNavigatorSettings): string[] {
    return getActiveVaultProfile(settings).hiddenFileTags;
}

export function getActiveHiddenFileProperties(settings: NotebookNavigatorSettings): string[] {
    return getActiveVaultProfile(settings).hiddenFileProperties;
}

export function getActivePropertyFields(settings: NotebookNavigatorSettings): string {
    return getPropertyFieldsFromPropertyKeys(getActiveVaultProfile(settings).propertyKeys);
}

export function setActivePropertyFields(settings: NotebookNavigatorSettings, propertyFields: string): boolean {
    const profile = getActiveVaultProfile(settings);
    const nextPropertyKeys = createPropertyKeysFromPropertyFields(propertyFields, profile.propertyKeys);
    const previousPropertyFields = getPropertyFieldsFromPropertyKeys(profile.propertyKeys);
    const nextPropertyFields = getPropertyFieldsFromPropertyKeys(nextPropertyKeys);
    if (previousPropertyFields === nextPropertyFields) {
        return false;
    }

    profile.propertyKeys = nextPropertyKeys;
    return true;
}

export function getActiveFileVisibility(settings: NotebookNavigatorSettings): FileVisibility {
    return getActiveVaultProfile(settings).fileVisibility;
}

export function getActiveNavRainbowSettings(settings: NotebookNavigatorSettings): NavRainbowSettings {
    return getActiveVaultProfile(settings).navRainbow;
}

export function hasHiddenTagMatch(settings: NotebookNavigatorSettings, normalizedPath: string): boolean {
    ensureVaultProfiles(settings);
    if (!normalizedPath) {
        return false;
    }

    const tagName = normalizedPath.split('/').pop() ?? normalizedPath;
    const pathSegments = normalizedPath.split('/').filter(Boolean);

    return settings.vaultProfiles.some(profile => {
        if (!Array.isArray(profile.hiddenTags) || profile.hiddenTags.length === 0) {
            return false;
        }
        const matcher = createHiddenTagMatcher(profile.hiddenTags);
        if (matchesHiddenTagPattern(normalizedPath, tagName, matcher)) {
            return true;
        }
        // Consider patterns whose literal prefix includes the path (e.g., "projects/*/drafts" when renaming "projects")
        return matcher.pathPatterns.some(pattern => matchesLiteralPrefix(pattern, pathSegments));
    });
}

export function hasHiddenFileTagMatch(settings: NotebookNavigatorSettings, normalizedPath: string): boolean {
    ensureVaultProfiles(settings);
    if (!normalizedPath) {
        return false;
    }

    const tagName = normalizedPath.split('/').pop() ?? normalizedPath;
    const pathSegments = normalizedPath.split('/').filter(Boolean);

    return settings.vaultProfiles.some(profile => {
        if (!Array.isArray(profile.hiddenFileTags) || profile.hiddenFileTags.length === 0) {
            return false;
        }
        const matcher = createHiddenTagMatcher(profile.hiddenFileTags);
        if (matchesHiddenTagPattern(normalizedPath, tagName, matcher)) {
            return true;
        }
        // Consider patterns whose literal prefix includes the path (e.g., "projects/*/drafts" when renaming "projects")
        return matcher.pathPatterns.some(pattern => matchesLiteralPrefix(pattern, pathSegments));
    });
}

// Rewrites hidden tag patterns when a tag path is renamed, returning true when any rule changes.
export function updateHiddenTagPrefixMatches(settings: NotebookNavigatorSettings, previousPath: string, nextPath: string): boolean {
    ensureVaultProfiles(settings);
    const normalizedPrevious = normalizeTagPath(previousPath);
    const normalizedNext = normalizeTagPath(nextPath);

    if (!normalizedPrevious || !normalizedNext || normalizedPrevious === normalizedNext) {
        return false;
    }

    const previousSegments = getNormalizedPathSegments(normalizedPrevious, normalizeTagPathValue);
    const nextSegments = getNormalizedPathSegments(normalizedNext, normalizeTagPathValue);

    let didUpdate = false;

    settings.vaultProfiles.forEach(profile => {
        if (!Array.isArray(profile.hiddenTags) || profile.hiddenTags.length === 0) {
            return;
        }

        const parsedPatterns = getHiddenTagPathPatterns(profile.hiddenTags);
        const parsedByRaw = new Map(parsedPatterns.map(pattern => [pattern.raw, pattern]));

        let profileUpdated = false;
        const updatedPatterns = profile.hiddenTags.map(pattern => {
            const parsedPattern = parsedByRaw.get(pattern);
            if (!parsedPattern || parsedPattern.literalPrefixLength === 0 || !matchesLiteralPrefix(parsedPattern, previousSegments)) {
                return pattern;
            }

            const rebuilt = rebuildRenamedPattern(parsedPattern, previousSegments, nextSegments, {
                normalizePattern: normalizeTagPathValue
            });
            if (rebuilt === null) {
                return pattern;
            }
            if (rebuilt !== pattern) {
                profileUpdated = true;
            }
            return rebuilt;
        });

        if (profileUpdated) {
            profile.hiddenTags = dedupeCanonicalHiddenTagPatterns(updatedPatterns);
            didUpdate = true;
        }
    });

    return didUpdate;
}

// Rewrites hidden file tag patterns when a tag path is renamed, returning true when any rule changes.
export function updateHiddenFileTagPrefixMatches(settings: NotebookNavigatorSettings, previousPath: string, nextPath: string): boolean {
    ensureVaultProfiles(settings);
    const normalizedPrevious = normalizeTagPath(previousPath);
    const normalizedNext = normalizeTagPath(nextPath);

    if (!normalizedPrevious || !normalizedNext || normalizedPrevious === normalizedNext) {
        return false;
    }

    const previousSegments = getNormalizedPathSegments(normalizedPrevious, normalizeTagPathValue);
    const nextSegments = getNormalizedPathSegments(normalizedNext, normalizeTagPathValue);

    let didUpdate = false;

    settings.vaultProfiles.forEach(profile => {
        if (!Array.isArray(profile.hiddenFileTags) || profile.hiddenFileTags.length === 0) {
            return;
        }

        const parsedPatterns = getHiddenTagPathPatterns(profile.hiddenFileTags);
        const parsedByRaw = new Map(parsedPatterns.map(pattern => [pattern.raw, pattern]));

        let profileUpdated = false;
        const updatedPatterns = profile.hiddenFileTags.map(pattern => {
            const parsedPattern = parsedByRaw.get(pattern);
            if (!parsedPattern || parsedPattern.literalPrefixLength === 0 || !matchesLiteralPrefix(parsedPattern, previousSegments)) {
                return pattern;
            }

            const rebuilt = rebuildRenamedPattern(parsedPattern, previousSegments, nextSegments, {
                normalizePattern: normalizeTagPathValue
            });
            if (rebuilt === null) {
                return pattern;
            }
            if (rebuilt !== pattern) {
                profileUpdated = true;
            }
            return rebuilt;
        });

        if (profileUpdated) {
            profile.hiddenFileTags = dedupeCanonicalHiddenTagPatterns(updatedPatterns);
            didUpdate = true;
        }
    });

    return didUpdate;
}

// Removes hidden tag rules whose literal prefix matches the deleted path, returning true when any rule is removed.
export function removeHiddenTagPrefixMatches(settings: NotebookNavigatorSettings, targetPath: string): boolean {
    ensureVaultProfiles(settings);
    const normalizedTarget = normalizeTagPath(targetPath);
    if (!normalizedTarget) {
        return false;
    }

    const targetSegments = getNormalizedPathSegments(normalizedTarget, normalizeTagPathValue);
    let didUpdate = false;

    settings.vaultProfiles.forEach(profile => {
        if (!Array.isArray(profile.hiddenTags) || profile.hiddenTags.length === 0) {
            return;
        }

        const parsedPatterns = getHiddenTagPathPatterns(profile.hiddenTags);
        const parsedByRaw = new Map(parsedPatterns.map(pattern => [pattern.raw, pattern]));
        let profileUpdated = false;
        const filtered = profile.hiddenTags.filter(pattern => {
            const parsedPattern = parsedByRaw.get(pattern);
            if (!parsedPattern) {
                return true;
            }

            if (!matchesLiteralPrefix(parsedPattern, targetSegments)) {
                return true;
            }

            if (
                parsedPattern.literalPrefixLength < targetSegments.length &&
                parsedPattern.literalPrefixLength < parsedPattern.segments.length
            ) {
                return true;
            }

            profileUpdated = true;
            return false;
        });

        if (profileUpdated) {
            profile.hiddenTags = filtered;
            didUpdate = true;
        }
    });

    return didUpdate;
}

// Removes hidden file tag rules whose literal prefix matches the deleted path, returning true when any rule is removed.
export function removeHiddenFileTagPrefixMatches(settings: NotebookNavigatorSettings, targetPath: string): boolean {
    ensureVaultProfiles(settings);
    const normalizedTarget = normalizeTagPath(targetPath);
    if (!normalizedTarget) {
        return false;
    }

    const targetSegments = getNormalizedPathSegments(normalizedTarget, normalizeTagPathValue);
    let didUpdate = false;

    settings.vaultProfiles.forEach(profile => {
        if (!Array.isArray(profile.hiddenFileTags) || profile.hiddenFileTags.length === 0) {
            return;
        }

        const parsedPatterns = getHiddenTagPathPatterns(profile.hiddenFileTags);
        const parsedByRaw = new Map(parsedPatterns.map(pattern => [pattern.raw, pattern]));
        let profileUpdated = false;
        const filtered = profile.hiddenFileTags.filter(pattern => {
            const parsedPattern = parsedByRaw.get(pattern);
            if (!parsedPattern) {
                return true;
            }

            if (!matchesLiteralPrefix(parsedPattern, targetSegments)) {
                return true;
            }

            if (
                parsedPattern.literalPrefixLength < targetSegments.length &&
                parsedPattern.literalPrefixLength < parsedPattern.segments.length
            ) {
                return true;
            }

            profileUpdated = true;
            return false;
        });

        if (profileUpdated) {
            profile.hiddenFileTags = filtered;
            didUpdate = true;
        }
    });

    return didUpdate;
}

// Updates hidden folder entries across all vault profiles when an exact path match changes
export function updateHiddenFolderExactMatches(settings: NotebookNavigatorSettings, previousPath: string, nextPath: string): boolean {
    ensureVaultProfiles(settings);
    const normalizedPrevious = normalizeHiddenFolderPath(previousPath);
    const normalizedNext = normalizeHiddenFolderPath(nextPath);

    if (!normalizedPrevious || !normalizedNext || normalizedPrevious === normalizedNext) {
        return false;
    }

    const previousSegments = getNormalizedPathSegments(normalizedPrevious, normalizeHiddenFolderMatchPath);
    const nextSegments = getNormalizedPathSegments(normalizedNext, normalizeHiddenFolderPath);

    let didUpdate = false;

    settings.vaultProfiles.forEach(profile => {
        FOLDER_PATTERN_PROFILE_KEYS.forEach(profileKey => {
            const patterns = profile[profileKey];
            if (!Array.isArray(patterns) || patterns.length === 0) {
                return;
            }

            const matcher = createHiddenFolderUpdateMatcher(patterns);
            if (matcher.patterns.length === 0) {
                return;
            }

            const parsedByRaw = new Map(matcher.patterns.map(pattern => [pattern.raw, pattern]));

            let profileUpdated = false;
            const updated = patterns.map(pattern => {
                const parsed = parsedByRaw.get(pattern);
                if (!parsed || parsed.literalPrefixLength === 0 || !matchesHiddenFolderLiteralPrefix(parsed, previousSegments)) {
                    return pattern;
                }

                // previousSegments are casefolded by normalizeHiddenFolderMatchPath; pattern segments keep their original case
                const rebuilt = rebuildRenamedPattern(parsed, previousSegments, nextSegments, {
                    addLeadingSlash: true,
                    normalizePattern: normalizeHiddenFolderPath,
                    normalizeMatchSegment: casefold
                });
                if (rebuilt === null) {
                    return pattern;
                }
                if (rebuilt !== parsed.raw) {
                    profileUpdated = true;
                }
                return rebuilt;
            });

            if (profileUpdated) {
                profile[profileKey] = Array.from(new Set(updated));
                didUpdate = true;
            }
        });
    });

    return didUpdate;
}

export function removeHiddenFolderExactMatches(settings: NotebookNavigatorSettings, targetPath: string): boolean {
    ensureVaultProfiles(settings);
    const normalizedTarget = normalizeHiddenFolderPath(targetPath);
    if (!normalizedTarget) {
        return false;
    }

    let didUpdate = false;

    settings.vaultProfiles.forEach(profile => {
        FOLDER_PATTERN_PROFILE_KEYS.forEach(profileKey => {
            const patterns = profile[profileKey];
            if (!Array.isArray(patterns) || patterns.length === 0) {
                return;
            }

            const matcher = createHiddenFolderUpdateMatcher(patterns);
            if (matcher.patterns.length === 0) {
                return;
            }

            const parsedByRaw = new Map(matcher.patterns.map(pattern => [pattern.raw, pattern]));
            const targetSegments = getNormalizedPathSegments(normalizedTarget, normalizeHiddenFolderMatchPath);

            let profileUpdated = false;
            const filtered = patterns.filter(pattern => {
                const parsed = parsedByRaw.get(pattern);
                if (!parsed || parsed.literalPrefixLength === 0) {
                    return true;
                }

                if (!matchesHiddenFolderLiteralPrefix(parsed, targetSegments)) {
                    return true;
                }

                if (parsed.literalPrefixLength < targetSegments.length && parsed.literalPrefixLength < parsed.segments.length) {
                    return true;
                }

                profileUpdated = true;
                return false;
            });

            if (profileUpdated) {
                profile[profileKey] = filtered;
                didUpdate = true;
            }
        });
    });

    return didUpdate;
}
