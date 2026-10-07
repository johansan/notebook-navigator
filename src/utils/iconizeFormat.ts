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

import { getIconIds } from 'obsidian';
import { GENERATED_ICONIZE_EXCEPTION_MAPS } from '../generated/iconizeReverseMaps';
import { extractFirstEmoji } from './emojiUtils';
import {
    IDENTIFIER_NORMALIZATION_RULES,
    decodeCompactNameToKebab,
    normalizeIdentifierFromIconize,
    normalizeIconizeCompactName,
    stripAllLeadingPrefixes
} from './iconizeNormalization';
import { casefold, casefoldPreservingWhitespace, sanitizeRecord } from './recordUtils';

/**
 * Base mapping between icon providers and their pack names
 */
interface IconizeMapping {
    providerId: string;
    packName: string;
    isDefaultProvider?: boolean;
    prefix: string;
}

interface ShortProviderAlias {
    alias: string;
    providerId: string;
}

const LUCIDE_PROVIDER_ID = 'lucide';
const VAULT_PROVIDER_ID = 'vault';
const VAULT_SVG_EXTENSION = '.svg';

/**
 * Providers that the plugin currently writes using the short frontmatter alias format.
 * `li` is accepted on read for lenient/manual input, but lucide still serializes as a bare slug.
 */
const SHORT_FRONTMATTER_PROVIDER_ALIASES: ShortProviderAlias[] = [
    { alias: 'li', providerId: LUCIDE_PROVIDER_ID },
    { alias: 'ph', providerId: 'phosphor' },
    { alias: 'bi', providerId: 'bootstrap-icons' },
    { alias: 'fas', providerId: 'fontawesome-solid' },
    { alias: 'mi', providerId: 'material-icons' },
    { alias: 'si', providerId: 'simple-icons' },
    { alias: 'ra', providerId: 'rpg-awesome' }
];

/**
 * Providers that Notebook Navigator currently exposes and can write back out.
 * Keep this separate from the short frontmatter alias table:
 * - aliases define the stored frontmatter format
 * - mappings define the legacy Iconize identifiers we still decode/encode
 */
const SUPPORTED_ICONIZE_MAPPINGS: IconizeMapping[] = [
    { providerId: 'fontawesome-solid', packName: 'font-awesome-solid', prefix: generateIconizePrefix('font-awesome-solid') },
    { providerId: 'bootstrap-icons', packName: 'bootstrap-icons', prefix: generateIconizePrefix('bootstrap-icons') },
    { providerId: 'material-icons', packName: 'material-icons', prefix: generateIconizePrefix('material-icons') },
    { providerId: 'phosphor', packName: 'phosphor', prefix: generateIconizePrefix('phosphor') },
    { providerId: 'rpg-awesome', packName: 'rpg-awesome', prefix: generateIconizePrefix('rpg-awesome') },
    { providerId: 'simple-icons', packName: 'simple-icons', prefix: generateIconizePrefix('simple-icons') },
    { providerId: LUCIDE_PROVIDER_ID, packName: 'lucide-icons', prefix: generateIconizePrefix('lucide-icons'), isDefaultProvider: true }
];

/**
 * Generates an Iconize prefix from a pack name
 * Examples:
 * - "lucide-icons" -> "Li"
 * - "font-awesome-solid" -> "Fas"
 * - "simple-icons" -> "Si"
 */
function generateIconizePrefix(packName: string): string {
    if (packName.includes('-')) {
        const parts = packName.split('-');
        if (parts.length === 0) {
            return '';
        }

        // Take first letter of first part (uppercase) + first letter of remaining parts (lowercase)
        let result = parts[0].charAt(0).toUpperCase();
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            result += part.charAt(0).toLowerCase();
        }
        return result;
    }

    if (packName.length === 0) {
        return '';
    }

    // For single word pack names, take first two letters
    const first = packName.charAt(0).toUpperCase();
    const second = packName.charAt(1) ? packName.charAt(1).toLowerCase() : '';
    return `${first}${second}`;
}

/**
 * Mappings with generated prefixes for all supported icon providers
 */
const PREFIX_TO_MAPPING = new Map<string, IconizeMapping>();
const PROVIDER_TO_MAPPING = new Map<string, IconizeMapping>();
const SHORT_ALIAS_TO_PROVIDER = new Map<string, string>();
const PROVIDER_TO_SHORT_ALIAS = new Map<string, string>();

// Preserve initial mapping order for provider -> prefix selection
SUPPORTED_ICONIZE_MAPPINGS.forEach(mapping => {
    if (!PROVIDER_TO_MAPPING.has(mapping.providerId)) {
        PROVIDER_TO_MAPPING.set(mapping.providerId, mapping);
    }
});

// Sort by prefix length to ensure longest prefixes match first (e.g. Fab before Fa)
const PREFIX_SORTED_MAPPINGS = [...SUPPORTED_ICONIZE_MAPPINGS].sort((a, b) => b.prefix.length - a.prefix.length);
PREFIX_SORTED_MAPPINGS.forEach(mapping => {
    PREFIX_TO_MAPPING.set(mapping.prefix, mapping);
});

SHORT_FRONTMATTER_PROVIDER_ALIASES.forEach(({ alias, providerId }) => {
    SHORT_ALIAS_TO_PROVIDER.set(alias, providerId);
    PROVIDER_TO_SHORT_ALIAS.set(providerId, alias);
});

function stripProviderPrefixForIconize(identifier: string, providerId: string): string {
    const rule = IDENTIFIER_NORMALIZATION_RULES.get(providerId);
    if (!rule) {
        return identifier;
    }
    return stripAllLeadingPrefixes(identifier, rule.redundantPrefixes ?? []);
}

function normalizeIdentifierForProvider(identifier: string, providerId: string): string {
    return normalizeIdentifierFromIconize(identifier, providerId);
}

function serializeShortProviderIconId(iconId: string): string | null {
    const colonIndex = iconId.indexOf(':');
    if (colonIndex === -1) {
        return isSupportedLucideIconId(iconId) ? iconId : null;
    }

    const providerId = iconId.substring(0, colonIndex);
    const identifier = iconId.substring(colonIndex + 1).trim();
    if (!identifier) {
        return null;
    }

    if (providerId === LUCIDE_PROVIDER_ID) {
        return isSupportedLucideIconId(identifier) ? identifier : null;
    }

    const alias = PROVIDER_TO_SHORT_ALIAS.get(providerId);
    if (!alias) {
        return null;
    }

    // Frontmatter writes use alias-slug values because Obsidian renders
    // alias:slug values as clickable URI-like links in Properties.
    return `${alias}-${identifier}`;
}

function parseShortProviderIconIdWithSeparator(value: string, separator: '-' | ':'): string | null {
    const separatorIndex = value.indexOf(separator);
    if (separatorIndex <= 0 || separatorIndex >= value.length - 1) {
        return null;
    }

    const alias = value.substring(0, separatorIndex).toLowerCase();
    const rawIdentifier = value.substring(separatorIndex + 1).trim();
    if (!alias || !rawIdentifier || rawIdentifier.includes(':')) {
        return null;
    }

    const providerId = SHORT_ALIAS_TO_PROVIDER.get(alias);
    if (!providerId) {
        return null;
    }

    const identifier = normalizeIdentifierForProvider(rawIdentifier, providerId);
    if (!identifier) {
        return null;
    }

    if (providerId === LUCIDE_PROVIDER_ID) {
        return isSupportedLucideIconId(identifier) ? identifier : null;
    }

    return `${providerId}:${identifier}`;
}

function parseShortProviderIconId(value: string): string | null {
    return parseShortProviderIconIdWithSeparator(value, '-') ?? parseShortProviderIconIdWithSeparator(value, ':');
}

/**
 * Snapshot of Obsidian's icon list (`getIconIds()`), shared by the Lucide icon provider and frontmatter
 * parsing. Both must read the same snapshot: when the icon picker lists an icon that frontmatter parsing
 * does not know, the icon cannot be written to frontmatter and is stored in settings instead.
 *
 * Other plugins add icons with `addIcon()` during their own `onload` or later, so the snapshot can miss
 * icons until `refreshRegisteredIconIds()` reads the list again.
 */
let REGISTERED_ICON_IDS: string[] | null = null;
let SUPPORTED_LUCIDE_ICON_IDS: ReadonlySet<string> | null | undefined;

/**
 * Returns Obsidian's registered icon ids with their original prefixes (e.g. "lucide-folder").
 * Reads the list on first use and keeps it until `refreshRegisteredIconIds()` finds a change.
 */
export function getRegisteredIconIds(): readonly string[] {
    if (!REGISTERED_ICON_IDS) {
        REGISTERED_ICON_IDS = getIconIds();
    }
    return REGISTERED_ICON_IDS;
}

/**
 * Reads Obsidian's icon list again and replaces the shared snapshot when icons were added or removed.
 *
 * @returns true when the snapshot changed. false when the list is unchanged or has not been read yet; an
 * unread list needs no refresh because its first read sees the current registry.
 */
export function refreshRegisteredIconIds(): boolean {
    if (!REGISTERED_ICON_IDS) {
        return false;
    }

    const previousIconIds = new Set(REGISTERED_ICON_IDS);
    const nextIconIds = getIconIds();
    const hasChanged = nextIconIds.length !== previousIconIds.size || nextIconIds.some(iconId => !previousIconIds.has(iconId));
    if (!hasChanged) {
        return false;
    }

    REGISTERED_ICON_IDS = nextIconIds;
    // Both caches are derived from the snapshot and are rebuilt from it on next use
    SUPPORTED_LUCIDE_ICON_IDS = undefined;
    ICONIZE_EXCEPTION_CACHE.delete(LUCIDE_PROVIDER_ID);
    return true;
}

function getSupportedLucideIconIds(): ReadonlySet<string> | null {
    if (SUPPORTED_LUCIDE_ICON_IDS !== undefined) {
        return SUPPORTED_LUCIDE_ICON_IDS;
    }

    if (typeof getIconIds !== 'function') {
        SUPPORTED_LUCIDE_ICON_IDS = null;
        return SUPPORTED_LUCIDE_ICON_IDS;
    }

    SUPPORTED_LUCIDE_ICON_IDS = new Set(
        getRegisteredIconIds()
            .map(iconId => normalizeCanonicalIconId(iconId))
            .filter(iconId => iconId.length > 0)
    );
    return SUPPORTED_LUCIDE_ICON_IDS;
}

function isSupportedLucideIconId(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed || trimmed.startsWith('lucide-')) {
        return false;
    }

    const supportedIconIds = getSupportedLucideIconIds();
    return supportedIconIds?.has(trimmed) ?? false;
}

function deserializeStoredFrontmatterIcon(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const emojiOnly = extractFirstEmoji(trimmed);
    if (emojiOnly && emojiOnly === trimmed) {
        return `emoji:${emojiOnly}`;
    }

    const wikiLinkPath = extractVaultSvgPathFromWikiLink(trimmed);
    if (wikiLinkPath) {
        return `${VAULT_PROVIDER_ID}:${wikiLinkPath}`;
    }

    if (!trimmed.includes(':') && trimmed.toLowerCase().endsWith(VAULT_SVG_EXTENSION)) {
        return `${VAULT_PROVIDER_ID}:${trimmed}`;
    }

    // Prefer exact Lucide slugs before trying alias-slug parsing so future
    // Lucide icons like `ph-example` are not interpreted as external packs.
    if (!trimmed.includes(':') && isSupportedLucideIconId(trimmed)) {
        return trimmed;
    }

    // Fall back to the short external-provider format written by Notebook Navigator.
    // This also keeps legacy alias:slug frontmatter values readable.
    const shortProviderIconId = parseShortProviderIconId(trimmed);
    if (shortProviderIconId) {
        return shortProviderIconId;
    }

    if (trimmed.includes(':')) {
        return null;
    }

    return null;
}

function deserializeFrontmatterIconWithIconizeFallback(value: string): string | null {
    // Read the plugin's stored format first. Only if that fails do we try the
    // supported legacy Iconize format. Unsupported provider-style values stay null.
    const stored = deserializeStoredFrontmatterIcon(value);
    if (stored) {
        return stored;
    }

    return convertIconizeToIconId(value);
}

const ICONIZE_EXCEPTION_CACHE = new Map<string, ReadonlyMap<string, string>>();
const ICONIZE_COMPACT_PREFIX_CACHE = new Map<string, string[]>();

function getCompactRedundantPrefixes(providerId: string): string[] {
    const cached = ICONIZE_COMPACT_PREFIX_CACHE.get(providerId);
    if (cached) {
        return cached;
    }

    const compactPrefixes = (IDENTIFIER_NORMALIZATION_RULES.get(providerId)?.redundantPrefixes ?? [])
        .map(prefix => normalizeIconizeCompactName(prefix))
        .filter(prefix => prefix.length > 0);

    ICONIZE_COMPACT_PREFIX_CACHE.set(providerId, compactPrefixes);
    return compactPrefixes;
}

function stripProviderPrefixForIconizeLookup(identifier: string, providerId: string): string {
    return stripAllLeadingPrefixes(identifier, getCompactRedundantPrefixes(providerId));
}

function buildIconizeExceptionMap(iconIds: string[], providerId: string): ReadonlyMap<string, string> {
    const exceptionMap = new Map<string, string>();

    iconIds.forEach(iconId => {
        const compactName = normalizeIconizeCompactName(iconId);
        const heuristicIdentifier = normalizeIdentifierFromIconize(decodeCompactNameToKebab(compactName), providerId);
        if (heuristicIdentifier !== iconId) {
            exceptionMap.set(compactName, iconId);
        }
    });

    return exceptionMap;
}

function getIconizeExceptionMap(providerId: string): ReadonlyMap<string, string> | null {
    const cached = ICONIZE_EXCEPTION_CACHE.get(providerId);
    if (cached) {
        return cached;
    }

    if (providerId === LUCIDE_PROVIDER_ID) {
        const supportedLucideIconIds = getSupportedLucideIconIds();
        if (!supportedLucideIconIds) {
            return null;
        }

        const lucideExceptionMap = buildIconizeExceptionMap([...supportedLucideIconIds], providerId);
        ICONIZE_EXCEPTION_CACHE.set(providerId, lucideExceptionMap);
        return lucideExceptionMap;
    }

    const generatedExceptionMap = GENERATED_ICONIZE_EXCEPTION_MAPS[providerId as keyof typeof GENERATED_ICONIZE_EXCEPTION_MAPS];
    if (!generatedExceptionMap) {
        return null;
    }

    const exceptionMap = new Map<string, string>(Object.entries(generatedExceptionMap));
    ICONIZE_EXCEPTION_CACHE.set(providerId, exceptionMap);
    return exceptionMap;
}

function resolveExceptionIconizeIdentifier(iconName: string, providerId: string): string | null {
    const normalizedIconName = stripProviderPrefixForIconizeLookup(iconName, providerId);
    const exceptionMap = getIconizeExceptionMap(providerId);
    const exceptionMatch = exceptionMap?.get(iconName) ?? exceptionMap?.get(normalizedIconName) ?? null;
    if (exceptionMatch) {
        return exceptionMatch;
    }

    return null;
}

/**
 * Determines the prefix length in an Iconize identifier using Iconize's original logic.
 * Returns 0 when no prefix marker is found (not Iconize format).
 */
function findIconizePrefixLength(value: string): number {
    if (value.length < 2) {
        return 0;
    }

    const searchIndex = value.substring(1).search(/[A-Z0-9]/);
    if (searchIndex === -1) {
        return 0;
    }

    return searchIndex + 1;
}

/**
 * Converts an Iconize formatted value (e.g. LiHome) to the plugin's icon identifier.
 * Returns null when the value does not use the Iconize format or when no mapping exists.
 *
 * Examples:
 * - "LiHome" -> "home" (lucide is default)
 * - "LiLucideUser" -> "user" (removes redundant lucide prefix)
 * - "PhPhAppleLogo" -> "phosphor:apple-logo" (collapses duplicate phosphor prefix)
 * - "RaRaHarpoonTrident" -> "rpg-awesome:harpoon-trident"
 * - "FasUser" -> "fontawesome-solid:user"
 * - "SiGithub" -> "simple-icons:github"
 * - "invalid" -> null (no matching prefix)
 */
export function convertIconizeToIconId(value: string): string | null {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return null;
    }

    const prefixLength = findIconizePrefixLength(trimmed);
    if (prefixLength <= 0 || prefixLength >= trimmed.length) {
        return null;
    }

    const prefix = trimmed.substring(0, prefixLength);
    const iconName = trimmed.substring(prefixLength);

    const mapping = PREFIX_TO_MAPPING.get(prefix);
    if (!mapping) {
        return null;
    }

    const exceptionIdentifier = resolveExceptionIconizeIdentifier(iconName, mapping.providerId);
    if (exceptionIdentifier) {
        if (mapping.isDefaultProvider) {
            return exceptionIdentifier;
        }

        return `${mapping.providerId}:${exceptionIdentifier}`;
    }

    const identifier = decodeCompactNameToKebab(iconName);
    if (!identifier) {
        return null;
    }

    const normalizedIdentifier = normalizeIdentifierFromIconize(identifier, mapping.providerId);
    if (!normalizedIdentifier) {
        return null;
    }

    if (mapping.isDefaultProvider) {
        return normalizedIdentifier;
    }

    return `${mapping.providerId}:${normalizedIdentifier}`;
}

/**
 * Converts a plugin icon identifier to Iconize format (e.g. lucide icon -> LiHome).
 * Returns null when no Iconize mapping exists for the provider.
 *
 * Examples:
 * - "lucide-home" -> "LiHome" (legacy default identifiers)
 * - "home" -> "LiHome" (legacy identifiers without prefix)
 * - "fontawesome-solid:user" -> "FasUser"
 * - "simple-icons:github" -> "SiGithub"
 * - "unknown-provider:icon" -> null (no mapping for provider)
 */
export function convertIconIdToIconize(iconId: string): string | null {
    const trimmed = iconId.trim();
    if (trimmed.length === 0) {
        return null;
    }

    // Parse provider and icon identifier
    const colonIndex = trimmed.indexOf(':');
    const providerId = colonIndex === -1 ? LUCIDE_PROVIDER_ID : trimmed.substring(0, colonIndex);
    const identifier = colonIndex === -1 ? trimmed : trimmed.substring(colonIndex + 1);

    if (identifier.length === 0) {
        return null;
    }

    if (providerId === 'emoji') {
        return null;
    }

    // Find the mapping for this provider
    const mapping = PROVIDER_TO_MAPPING.get(providerId);
    if (!mapping) {
        return null;
    }

    // Convert kebab-case to PascalCase
    const normalizedIdentifier = stripProviderPrefixForIconize(identifier, providerId);

    if (normalizedIdentifier.length === 0) {
        return null;
    }

    const compactName = normalizeIconizeCompactName(normalizedIdentifier);
    if (!compactName) {
        return null;
    }

    // Combine prefix and icon name
    return `${mapping.prefix}${compactName}`;
}

/**
 * Normalizes canonical icon identifiers to remove redundant provider prefixes.
 * Ensures phosphor/rpg-awesome icons use slug-only identifiers and lucide icons
 * drop the `lucide-` prefix when stored in canonical form.
 */
export function normalizeCanonicalIconId(iconId: string): string {
    const trimmed = iconId.trim();
    if (!trimmed) {
        return trimmed;
    }

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
        const normalized = normalizeIdentifierForProvider(trimmed, LUCIDE_PROVIDER_ID);
        return normalized && normalized.length > 0 ? normalized : trimmed;
    }

    const providerId = trimmed.substring(0, colonIndex);
    const identifier = trimmed.substring(colonIndex + 1);
    const normalized = normalizeIdentifierForProvider(identifier, providerId);

    if (!normalized || normalized.length === 0 || normalized === identifier) {
        return trimmed;
    }

    return `${providerId}:${normalized}`;
}

/** Normalizes a file type icon map key, removing quotes, leading dots, and converting to lowercase */
export function normalizeFileTypeIconMapKey(input: string): string {
    const trimmed = input.trim();
    const unquoted = tryUnquoteSingleQuotedText(trimmed);
    const value = unquoted ?? trimmed;
    return casefold(value.trim().replace(/^\./, ''));
}

/**
 * Normalizes a file name icon map key, preserving intentional whitespace.
 * Supports single-quoted values (e.g., 'ai ') to allow keys with leading/trailing spaces.
 */
export function normalizeFileNameIconMapKey(input: string): string {
    if (!input || input.trim().length === 0) {
        return '';
    }

    // Check if the input is a single-quoted string and extract its content
    const trimmedForQuote = input.trim();
    const unquoted = tryUnquoteSingleQuotedText(trimmedForQuote);
    if (unquoted !== null) {
        if (unquoted.trim().length === 0) {
            return '';
        }
        return casefoldPreservingWhitespace(unquoted);
    }

    // Preserve whitespace if the raw input has leading or trailing spaces
    if (/^\s|\s$/.test(input)) {
        return casefoldPreservingWhitespace(input);
    }

    return casefold(input);
}

interface NormalizedIconMapEntry {
    key: string;
    iconId: string;
}

export interface IconMapParseResult {
    map: Record<string, string>;
    invalidLines: string[];
}

export function normalizeIconMapEntry(key: string, iconId: string, normalizeKey: (input: string) => string): NormalizedIconMapEntry | null {
    const normalizedKey = normalizeKey(key);
    if (!normalizedKey) {
        return null;
    }

    const normalizedIconValue = normalizeIconMapIconValue(iconId);
    if (!normalizedIconValue) {
        return null;
    }

    return { key: normalizedKey, iconId: normalizedIconValue };
}

/**
 * Normalizes an icon value from icon map input to match the value stored in frontmatter.
 * Returns null for invalid or unrecognized identifiers.
 */
function normalizeIconMapIconValue(iconId: string): string | null {
    const trimmed = iconId.trim();
    if (!trimmed) {
        return null;
    }

    // Preserve plain emoji values as-is (matches frontmatter storage).
    const emojiOnly = extractFirstEmoji(trimmed);
    if (emojiOnly && emojiOnly === trimmed) {
        return emojiOnly;
    }

    // Heuristic: treat unknown Iconize-style identifiers as invalid rather than lucide names.
    // Example: "Si" should not be interpreted as a lucide icon.
    const converted = convertIconizeToIconId(trimmed);
    if (!converted && !trimmed.includes(':') && /[A-Z]/.test(trimmed) && !/[-_]/.test(trimmed)) {
        return null;
    }

    const canonical = deserializeIconFromFrontmatter(trimmed);
    if (!canonical) {
        return null;
    }

    const serialized = serializeIconForFrontmatter(canonical);
    return serialized && serialized.length > 0 ? serialized : null;
}

/**
 * Normalizes stored icon map entries. Entries with an invalid key or an empty value are dropped.
 *
 * Values that name no known icon are kept as stored, because the icon can come from a plugin that adds it
 * with `addIcon()` after settings load, or that is installed only on another device. Dropping the value would
 * delete the rule from synced settings the next time settings are saved.
 */
export function normalizeIconMapRecord(record: Record<string, string>, normalizeKey: (input: string) => string): Record<string, string> {
    const normalized = sanitizeRecord<string>(undefined);

    Object.entries(record).forEach(([key, value]) => {
        if (typeof value !== 'string') {
            return;
        }

        const normalizedKey = normalizeKey(key);
        const trimmedValue = value.trim();
        if (!normalizedKey || !trimmedValue) {
            return;
        }

        normalized[normalizedKey] = normalizeIconMapIconValue(trimmedValue) ?? trimmedValue;
    });

    return normalized;
}

export function serializeIconMapRecord(map: Record<string, string>): string {
    const entries = Object.entries(map)
        .filter(([key, iconId]) => Boolean(key) && Boolean(iconId))
        .sort(([a], [b]) => a.localeCompare(b));

    return entries
        .map(([key, iconId]) => {
            // Wrap keys containing whitespace or starting with '#' in single quotes
            const serializedKey = shouldQuoteIconMapKey(key) ? `'${escapeSingleQuotedText(key)}'` : key;
            return `${serializedKey}=${iconId}`;
        })
        .join('\n');
}

export function parseIconMapText(value: string, normalizeKey: (input: string) => string): IconMapParseResult {
    const map = sanitizeRecord<string>(undefined);
    const invalidLines: string[] = [];

    const lines = value.replace(/\r\n/g, '\n').split('\n');
    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();

        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }

        const separatorIndex = trimmed.indexOf('=');
        const altSeparatorIndex = trimmed.indexOf(':');
        const hasEquals = separatorIndex !== -1;
        const hasColon = altSeparatorIndex !== -1;

        const splitIndex = hasEquals ? separatorIndex : hasColon ? altSeparatorIndex : -1;
        if (splitIndex === -1) {
            invalidLines.push(trimmed);
            continue;
        }

        const rawKey = trimmed.substring(0, splitIndex).trim();
        const rawIconId = trimmed.substring(splitIndex + 1).trim();

        const normalizedEntry = normalizeIconMapEntry(rawKey, rawIconId, normalizeKey);
        if (!normalizedEntry) {
            invalidLines.push(trimmed);
            continue;
        }

        map[normalizedEntry.key] = normalizedEntry.iconId;
    }

    return { map, invalidLines };
}

/** Returns true if the key needs to be wrapped in single quotes for serialization */
function shouldQuoteIconMapKey(key: string): boolean {
    return /\s/.test(key) || key.startsWith('#');
}

/** Escapes backslashes and single quotes for embedding in a single-quoted string */
function escapeSingleQuotedText(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/** Extracts the content from a single-quoted string, or returns null if not quoted */
function tryUnquoteSingleQuotedText(value: string): string | null {
    if (value.length < 2 || !value.startsWith("'") || !value.endsWith("'")) {
        return null;
    }

    return unescapeSingleQuotedText(value.slice(1, -1));
}

/** Unescapes backslashes and single quotes in a single-quoted string's content */
function unescapeSingleQuotedText(value: string): string {
    let result = '';
    for (let i = 0; i < value.length; i++) {
        const ch = value[i];
        // Handle escape sequences: \' and \\
        if (ch === '\\' && i + 1 < value.length) {
            const next = value[i + 1];
            if (next === "'" || next === '\\') {
                result += next;
                i += 1;
                continue;
            }
        }
        result += ch;
    }
    return result;
}

/**
 * Serializes a canonical icon identifier to the value stored in frontmatter.
 * Returns null when the icon cannot be normalized.
 */
export function serializeIconForFrontmatter(iconId: string): string | null {
    const canonical = normalizeCanonicalIconId(iconId);
    if (!canonical) {
        return null;
    }

    const trimmed = canonical.trim();
    if (!trimmed) {
        return null;
    }

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex !== -1) {
        const providerId = trimmed.substring(0, colonIndex);
        const identifier = trimmed.substring(colonIndex + 1).trim();
        if (providerId === VAULT_PROVIDER_ID && identifier.toLowerCase().endsWith(VAULT_SVG_EXTENSION)) {
            return identifier;
        }
    }

    const emojiPrefix = 'emoji:';
    const emojiCandidate = trimmed.startsWith(emojiPrefix) ? trimmed.substring(emojiPrefix.length).trim() : trimmed;
    const emojiOnly = extractFirstEmoji(emojiCandidate);

    if (emojiOnly && emojiCandidate === emojiOnly) {
        return emojiOnly;
    }

    const shortProviderIconId = serializeShortProviderIconId(trimmed);
    if (shortProviderIconId) {
        return shortProviderIconId;
    }

    return null;
}

/**
 * Deserializes an icon value from frontmatter back into canonical format.
 * Accepts the plugin's stored frontmatter format, then falls back to supported
 * legacy Iconize identifiers.
 */
export function deserializeIconFromFrontmatter(value: string): string | null {
    return deserializeFrontmatterIconWithIconizeFallback(value);
}

/**
 * Deserializes a legacy provider-prefixed frontmatter value (e.g. "emoji:🔭") into canonical format.
 */
function deserializeLegacyProviderPrefixedFrontmatter(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
        return null;
    }

    const provider = trimmed.substring(0, colonIndex).trim().toLowerCase();
    const identifier = trimmed.substring(colonIndex + 1).trim();
    if (!provider || !identifier) {
        return null;
    }

    if (provider === 'emoji') {
        const emojiOnly = extractFirstEmoji(identifier);
        if (emojiOnly && emojiOnly === identifier) {
            return `emoji:${emojiOnly}`;
        }
        return null;
    }

    if (provider === LUCIDE_PROVIDER_ID) {
        const normalized = normalizeCanonicalIconId(identifier);
        return normalized && normalized.length > 0 ? normalized : null;
    }

    if (provider === VAULT_PROVIDER_ID && !identifier.includes(':') && identifier.toLowerCase().endsWith(VAULT_SVG_EXTENSION)) {
        return `${VAULT_PROVIDER_ID}:${identifier}`;
    }

    return null;
}

function extractVaultSvgPathFromWikiLink(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed.startsWith('[[') || !trimmed.endsWith(']]')) {
        return null;
    }

    const inner = trimmed.slice(2, -2).trim();
    if (!inner || inner.includes('\n') || inner.includes('\r')) {
        return null;
    }

    const pipeIndex = inner.indexOf('|');
    const rawTarget = (pipeIndex === -1 ? inner : inner.slice(0, pipeIndex)).trim();
    if (!rawTarget || rawTarget.includes('#') || rawTarget.includes('^')) {
        return null;
    }

    return rawTarget.toLowerCase().endsWith(VAULT_SVG_EXTENSION) ? rawTarget : null;
}

/**
 * Deserializes an icon value from note frontmatter back into canonical format.
 * Accepts the plugin's stored frontmatter format, then falls back to supported
 * legacy Iconize identifiers.
 */
export function deserializeIconFromFrontmatterStrict(value: string): string | null {
    return deserializeFrontmatterIconWithIconizeFallback(value);
}

/**
 * Deserializes an icon value from note frontmatter back into canonical format.
 *
 * Accepts a legacy provider-prefixed format (e.g. "emoji:🔭") for backward compatibility.
 */
export function deserializeIconFromFrontmatterCompat(value: string): string | null {
    const legacy = deserializeLegacyProviderPrefixedFrontmatter(value);
    if (legacy) {
        return legacy;
    }

    return deserializeIconFromFrontmatterStrict(value);
}
