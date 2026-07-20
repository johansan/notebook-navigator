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

import { isDateFilterCandidate, parseDateFilterRange } from './filterSearchDate';
import { evaluateTagExpression, parseTagModeTokens, propertyTokenMatches, tagMatchesToken } from './filterSearchExpression';
import type { DateFilterRange, FilterSearchTokens, FolderFilterToken, InclusionOperator, PropertySearchToken } from './filterSearchTypes';
import { EMPTY_SEARCH_NAV_FILTER_STATE, type SearchNavFilterState } from '../types/search';
import { casefold, foldSearchText, foldSearchTextFromLowercase } from './recordUtils';
import { buildPropertyKeyNodeId, buildPropertyValueNodeId, normalizePropertyTreeValuePath } from './propertyTree';
import { resolvePropertyDisplayText } from './propertyUtils';

export { DATE_FILTER_RELATIVE_KEYWORDS, fileMatchesDateFilterTokens, parseDateFieldPrefix } from './filterSearchDate';
export type { FilterMode, FilterSearchTokens, FolderFilterToken, InclusionOperator, PropertySearchToken } from './filterSearchTypes';

// Default empty token set returned for blank queries
const EMPTY_TOKENS: FilterSearchTokens = {
    mode: 'filter',
    expression: [],
    hasInclusions: false,
    requiresTags: false,
    allRequireTags: false,
    requireUnfinishedTasks: false,
    excludeUnfinishedTasks: false,
    includedTagTokens: [],
    nameTokens: [],
    tagTokens: [],
    dateRanges: [],
    requireTagged: false,
    includeUntagged: false,
    propertyTokens: [],
    excludePropertyTokens: [],
    requiresProperties: false,
    excludeNameTokens: [],
    excludeTagTokens: [],
    folderTokens: [],
    excludeFolderTokens: [],
    extensionTokens: [],
    excludeExtensionTokens: [],
    excludeDateRanges: [],
    excludeTagged: false
};
const EMPTY_PROPERTY_VALUE_MAP = new Map<string, string[]>();

// Set of recognized connector words in search queries
const CONNECTOR_TOKEN_SET = new Set(['and', 'or']);
const UNFINISHED_TASK_FILTER_TOKEN_SET = new Set(['has:task', 'has:tasks']);

const PROPERTY_FILTER_PREFIX = '.';

const normalizePropertyFilterKey = (value: string): string => {
    return casefold(value.trim());
};

// Property search evaluates the text rendered by pills, so query values must unwrap link markup
// to the same label. Otherwise filters generated from Markdown-link property nodes cannot match them.
const normalizePropertyFilterValue = (value: string): string => {
    return normalizePropertyTreeValuePath(resolvePropertyDisplayText(value));
};

const isPropertyFilterCandidate = (token: string): boolean => {
    return token.startsWith(PROPERTY_FILTER_PREFIX);
};

const findPropertyFilterValueSeparator = (content: string): number => {
    let escaped = false;
    let inQuotes = false;

    for (let index = 0; index < content.length; index += 1) {
        const char = content[index];
        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        if (char === '"') {
            inQuotes = !inQuotes;
            continue;
        }

        if (char === '=' && !inQuotes) {
            return index;
        }
    }

    return -1;
};

const tryUnquotePropertyFilterPart = (value: string): string => {
    const trimmed = value.trim();
    if (trimmed.length < 2 || !trimmed.startsWith('"') || !trimmed.endsWith('"')) {
        return value;
    }

    let result = '';
    for (let index = 1; index < trimmed.length - 1; index += 1) {
        const char = trimmed[index];
        if (char === '\\' && index + 1 < trimmed.length - 1) {
            const nextChar = trimmed[index + 1];
            if (nextChar === '"' || nextChar === '\\') {
                result += nextChar;
                index += 1;
                continue;
            }
        }
        result += char;
    }

    return result;
};

const unescapePropertyFilterPart = (value: string): string => {
    let result = '';

    for (let index = 0; index < value.length; index += 1) {
        const char = value[index];
        if (char !== '\\' || index + 1 >= value.length) {
            result += char;
            continue;
        }

        const nextChar = value[index + 1];
        if (nextChar === '=' || nextChar === '\\' || nextChar === '"') {
            result += nextChar;
            index += 1;
            continue;
        }

        result += char;
    }

    return result;
};

const parsePropertyFilterToken = (token: string): PropertySearchToken | null => {
    if (!isPropertyFilterCandidate(token)) {
        return null;
    }

    const content = token.slice(PROPERTY_FILTER_PREFIX.length);
    if (!content) {
        return null;
    }

    const separatorIndex = findPropertyFilterValueSeparator(content);
    if (separatorIndex === -1) {
        const normalizedKey = normalizePropertyFilterKey(unescapePropertyFilterPart(tryUnquotePropertyFilterPart(content)));
        return normalizedKey ? { key: normalizedKey, value: null } : null;
    }

    const rawKey = unescapePropertyFilterPart(tryUnquotePropertyFilterPart(content.slice(0, separatorIndex)));
    const rawValue = unescapePropertyFilterPart(tryUnquotePropertyFilterPart(content.slice(separatorIndex + 1)));
    const normalizedKey = normalizePropertyFilterKey(rawKey);
    if (!normalizedKey) {
        return null;
    }

    const normalizedValue = normalizePropertyFilterValue(rawValue);
    if (!normalizedValue) {
        return { key: normalizedKey, value: null };
    }

    return {
        key: normalizedKey,
        value: normalizedValue
    };
};

const foldPropertySearchToken = (token: PropertySearchToken): PropertySearchToken => {
    // Property tokens are folded once during parsing so matching can stay on pre-normalized values.
    return {
        key: foldSearchText(token.key),
        value: token.value === null ? null : foldSearchText(token.value)
    };
};

function tokenizeFilterSearchQuery(query: string): string[] {
    const tokens: string[] = [];
    const input = query.trim();
    if (!input) {
        return tokens;
    }

    let current = '';
    let inQuotes = false;
    let index = 0;

    while (index < input.length) {
        const char = input[index];

        if (inQuotes && char === '\\') {
            const nextChar = input[index + 1];
            if (nextChar === '"' || nextChar === '\\') {
                current += nextChar;
                index += 2;
                continue;
            }
        }

        if (char === '"') {
            inQuotes = !inQuotes;
            index += 1;
            continue;
        }

        if (!inQuotes && /\s/.test(char)) {
            if (current.length > 0) {
                tokens.push(current);
                current = '';
            }
            index += 1;
            continue;
        }

        current += char;
        index += 1;
    }

    if (current.length > 0) {
        tokens.push(current);
    }

    return tokens;
}

// Intermediate token representation during classification
type ClassifiedToken =
    | {
          kind: 'operator';
          operator: InclusionOperator;
      }
    | {
          kind: 'tag';
          value: string | null;
      }
    | {
          kind: 'tagNegation';
          value: string | null;
      }
    | {
          kind: 'property';
          value: PropertySearchToken;
      }
    | {
          kind: 'propertyNegation';
          value: PropertySearchToken;
      }
    | {
          kind: 'date';
          range: DateFilterRange;
      }
    | {
          kind: 'dateNegation';
          range: DateFilterRange;
      }
    | {
          kind: 'folder';
          value: FolderFilterToken;
      }
    | {
          kind: 'folderNegation';
          value: FolderFilterToken;
      }
    | {
          kind: 'extension';
          value: string;
      }
    | {
          kind: 'extensionNegation';
          value: string;
      }
    | {
          kind: 'unfinishedTask';
      }
    | {
          kind: 'unfinishedTaskNegation';
      }
    | {
          kind: 'name';
          value: string;
      }
    | {
          kind: 'nameNegation';
          value: string;
      };

// Result of classifying raw string tokens into typed tokens
interface TokenClassificationResult {
    tokens: ClassifiedToken[];
    hasTagOperand: boolean;
    hasNonTagOperand: boolean;
    hasInvalidToken: boolean;
}

// Checks if a token set can use tag expression mode
const canUseTagMode = (classification: TokenClassificationResult): boolean => {
    // Tag expression mode is intentionally strict:
    // - Requires at least one tag operand
    // - Rejects any non-tag operand (name/date/task tokens)
    // - Rejects malformed/dangling syntax
    //
    // This keeps AND/OR operator behavior scoped to tag-only queries.
    // Mixed queries intentionally fall back to regular filter mode where
    // AND/OR are interpreted as literal words in file names.
    return classification.hasTagOperand && !classification.hasNonTagOperand && !classification.hasInvalidToken;
};

// Detects a token prefix used to negate an operand.
const getNegationPrefix = (token: string): '-' | null => {
    if (!token) {
        return null;
    }

    const first = token.charAt(0);
    if (first === '-') {
        return '-';
    }

    return null;
};

const isUnfinishedTaskFilterToken = (token: string): boolean => {
    return UNFINISHED_TASK_FILTER_TOKEN_SET.has(token);
};

const FOLDER_FILTER_PREFIX = 'folder:';
const EXT_FILTER_PREFIX = 'ext:';

// Normalizes folder filter values for exact (`folder:/path`) and segment (`folder:name`) matching.
const normalizeFolderFilterToken = (value: string): FolderFilterToken | null => {
    if (!value) {
        return null;
    }

    const normalizedSlashes = value.trim().replace(/\\/g, '/').replace(/\/+/g, '/');
    if (!normalizedSlashes) {
        return null;
    }

    if (normalizedSlashes.startsWith('/')) {
        const withoutTrailingSlash = normalizedSlashes.replace(/\/+$/u, '');
        if (!withoutTrailingSlash) {
            return { mode: 'exact', value: '' };
        }

        const withoutLeadingSlash = withoutTrailingSlash.replace(/^\/+/u, '');
        if (!withoutLeadingSlash) {
            return { mode: 'exact', value: '' };
        }

        return { mode: 'exact', value: withoutLeadingSlash };
    }

    const segmentQuery = normalizedSlashes.replace(/^\/+/u, '').replace(/\/+$/u, '');
    if (!segmentQuery || segmentQuery.includes('/')) {
        return null;
    }

    return { mode: 'segment', value: segmentQuery };
};

// Checks if a token starts with the folder filter prefix.
const isFolderFilterCandidate = (token: string): boolean => {
    return token.startsWith(FOLDER_FILTER_PREFIX);
};

// Parses folder:... tokens into normalized folder path filters.
const parseFolderFilterToken = (token: string): FolderFilterToken | null => {
    return normalizeFolderFilterToken(token.slice(FOLDER_FILTER_PREFIX.length));
};

// Checks if a token starts with the extension filter prefix.
const isExtensionFilterCandidate = (token: string): boolean => {
    return token.startsWith(EXT_FILTER_PREFIX);
};

// Parses ext:... tokens into normalized file extension filters.
const parseExtensionFilterToken = (token: string): string | null => {
    const raw = token.slice(EXT_FILTER_PREFIX.length).trim();
    if (!raw) {
        return null;
    }

    const withoutLeadingDots = raw.replace(/^\.+/u, '');
    if (!withoutLeadingDots || withoutLeadingDots.includes('/') || withoutLeadingDots.includes('\\')) {
        return null;
    }

    // Obsidian's `TFile.extension` is derived from the last "." segment in the file name.
    // Example: "johan.test.txt" => extension "txt", basename "johan.test".
    const segments = withoutLeadingDots.split('.').filter(Boolean);
    const lastSegment = segments.length > 0 ? segments[segments.length - 1] : '';
    if (!lastSegment) {
        return null;
    }

    return lastSegment;
};

const normalizeFolderPathForMatch = (folderPath: string): string => {
    if (!folderPath) {
        return '';
    }

    let normalized = folderPath;
    if (normalized.includes('\\')) {
        normalized = normalized.replace(/\\/g, '/');
    }
    if (normalized.startsWith('/')) {
        normalized = normalized.replace(/^\/+/u, '');
    }
    if (normalized.endsWith('/')) {
        normalized = normalized.replace(/\/+$/u, '');
    }

    return normalized;
};

const folderMatchesTokenWithNormalizedPath = (
    normalizedFolderPath: string,
    segments: readonly string[] | null,
    token: FolderFilterToken
): boolean => {
    if (token.mode === 'exact') {
        return normalizedFolderPath === token.value;
    }

    if (!token.value || !normalizedFolderPath) {
        return false;
    }

    const resolvedSegments = segments ?? normalizedFolderPath.split('/').filter(Boolean);
    return resolvedSegments.some(segment => segment.includes(token.value));
};

// Checks whether a file extension matches an extension filter token.
const extensionMatchesToken = (fileExtension: string, token: string): boolean => {
    if (!fileExtension || !token) {
        return false;
    }

    return fileExtension === token;
};

// Parses raw tokens into classified tokens with metadata
const classifyRawTokens = (rawTokens: string[]): TokenClassificationResult => {
    const tokens: ClassifiedToken[] = [];
    let hasTagOperand = false;
    let hasNonTagOperand = false;
    let hasInvalidToken = false;

    for (const token of rawTokens) {
        if (!token) {
            continue;
        }

        // Token shape detection (operators, prefixes, separators) is done on lowercase text.
        // Accent folding is applied only to operand payloads that participate in matching.
        const lowercaseToken = token.toLowerCase();
        let foldedLowercaseToken: string | null = null;
        const getFoldedLowercaseToken = (): string => {
            if (foldedLowercaseToken !== null) {
                return foldedLowercaseToken;
            }

            // Fold once per token and reuse in all branches.
            foldedLowercaseToken = foldSearchTextFromLowercase(lowercaseToken);
            return foldedLowercaseToken;
        };

        // Classify connector words first. Whether they behave as operators
        // or literal words is decided later by mode selection:
        // - expression mode (pure tag/property queries): operators
        // - filter mode (mixed queries): literal name tokens
        // Connector detection intentionally runs before accent folding:
        // `and`/`or` become operators, while `ånd`/`ör` stay literal tokens.
        if (lowercaseToken === 'and') {
            tokens.push({ kind: 'operator', operator: 'AND' });
            continue;
        }

        if (lowercaseToken === 'or') {
            tokens.push({ kind: 'operator', operator: 'OR' });
            continue;
        }

        const negationPrefix = getNegationPrefix(lowercaseToken);
        if (negationPrefix !== null) {
            const negatedToken = lowercaseToken.slice(1);
            let foldedNegatedToken: string | null = null;
            const getFoldedNegatedToken = (): string => {
                if (foldedNegatedToken !== null) {
                    return foldedNegatedToken;
                }

                foldedNegatedToken = foldSearchTextFromLowercase(negatedToken);
                return foldedNegatedToken;
            };

            if (!negatedToken) {
                hasInvalidToken = true;
                continue;
            }

            if (isUnfinishedTaskFilterToken(negatedToken)) {
                tokens.push({ kind: 'unfinishedTaskNegation' });
                // Task filters make the query non-tag, so AND/OR must not
                // be interpreted as tag-expression operators.
                hasNonTagOperand = true;
                continue;
            }

            if (negatedToken.startsWith('@')) {
                if (isDateFilterCandidate(negatedToken)) {
                    // Only commit to a date filter when parsing succeeds. Partial/invalid date fragments are ignored
                    // so they don't affect filtering until the token is complete.
                    const range = parseDateFilterRange(negatedToken);
                    if (range) {
                        tokens.push({ kind: 'dateNegation', range });
                        // Date filters are non-tag operands by design.
                        // Their presence forces filter mode so AND/OR are
                        // treated as literal words.
                        hasNonTagOperand = true;
                    }
                    continue;
                }

                hasNonTagOperand = true;
                tokens.push({ kind: 'nameNegation', value: getFoldedNegatedToken() });
                continue;
            }

            if (isFolderFilterCandidate(negatedToken)) {
                const folderValue = parseFolderFilterToken(negatedToken);
                if (folderValue) {
                    // Folder tokens store folded segment/exact values so compare paths can use direct equality/includes.
                    tokens.push({
                        kind: 'folderNegation',
                        value: { ...folderValue, value: foldSearchTextFromLowercase(folderValue.value) }
                    });
                    // Folder filters are non-tag operands.
                    hasNonTagOperand = true;
                }
                // Ignore partial/invalid folder filters (for example `-folder:`) until the token is complete.
                continue;
            }

            if (isExtensionFilterCandidate(negatedToken)) {
                const extensionValue = parseExtensionFilterToken(negatedToken);
                if (extensionValue) {
                    tokens.push({ kind: 'extensionNegation', value: foldSearchTextFromLowercase(extensionValue) });
                    // Extension filters are non-tag operands.
                    hasNonTagOperand = true;
                }
                // Ignore partial/invalid extension filters (for example `-ext:`) until the token is complete.
                continue;
            }

            if (isPropertyFilterCandidate(negatedToken)) {
                const propertyValue = parsePropertyFilterToken(negatedToken);
                if (propertyValue) {
                    tokens.push({ kind: 'propertyNegation', value: foldPropertySearchToken(propertyValue) });
                    hasTagOperand = true;
                }
                continue;
            }

            if (negatedToken.startsWith('#')) {
                const tagValue = negatedToken.slice(1);
                tokens.push({ kind: 'tagNegation', value: tagValue.length > 0 ? foldSearchTextFromLowercase(tagValue) : null });
                hasTagOperand = true;
                continue;
            }

            hasNonTagOperand = true;
            tokens.push({ kind: 'nameNegation', value: getFoldedNegatedToken() });
            continue;
        }

        if (isUnfinishedTaskFilterToken(lowercaseToken)) {
            tokens.push({ kind: 'unfinishedTask' });
            // Task filters are non-tag operands.
            hasNonTagOperand = true;
            continue;
        }

        if (lowercaseToken.startsWith('@')) {
            if (isDateFilterCandidate(lowercaseToken)) {
                // Only commit to a date filter when parsing succeeds. Partial/invalid date fragments are ignored
                // so they don't affect filtering until the token is complete.
                const range = parseDateFilterRange(lowercaseToken);
                if (range) {
                    tokens.push({ kind: 'date', range });
                    // Date filters are non-tag operands.
                    hasNonTagOperand = true;
                }
                continue;
            }

            hasNonTagOperand = true;
            tokens.push({ kind: 'name', value: getFoldedLowercaseToken() });
            continue;
        }

        if (isFolderFilterCandidate(lowercaseToken)) {
            const folderValue = parseFolderFilterToken(lowercaseToken);
            if (folderValue) {
                tokens.push({ kind: 'folder', value: { ...folderValue, value: foldSearchTextFromLowercase(folderValue.value) } });
                // Folder filters are non-tag operands.
                hasNonTagOperand = true;
            }
            // Ignore partial/invalid folder filters (for example `folder:`) until the token is complete.
            continue;
        }

        if (isExtensionFilterCandidate(lowercaseToken)) {
            const extensionValue = parseExtensionFilterToken(lowercaseToken);
            if (extensionValue) {
                tokens.push({ kind: 'extension', value: foldSearchTextFromLowercase(extensionValue) });
                // Extension filters are non-tag operands.
                hasNonTagOperand = true;
            }
            // Ignore partial/invalid extension filters (for example `ext:`) until the token is complete.
            continue;
        }

        if (isPropertyFilterCandidate(lowercaseToken)) {
            const propertyValue = parsePropertyFilterToken(lowercaseToken);
            if (propertyValue) {
                tokens.push({ kind: 'property', value: foldPropertySearchToken(propertyValue) });
                hasTagOperand = true;
            }
            continue;
        }

        if (lowercaseToken.startsWith('#')) {
            const tagValue = lowercaseToken.slice(1);
            tokens.push({ kind: 'tag', value: tagValue.length > 0 ? foldSearchTextFromLowercase(tagValue) : null });
            hasTagOperand = true;
            continue;
        }

        hasNonTagOperand = true;
        tokens.push({ kind: 'name', value: getFoldedLowercaseToken() });
    }

    return {
        tokens,
        hasTagOperand,
        hasNonTagOperand,
        hasInvalidToken
    };
};

// Parses tokens into filter mode with simple AND semantics
const parseFilterModeTokens = (
    classifiedTokens: ClassifiedToken[],
    excludeTagTokens: string[],
    excludePropertyTokens: PropertySearchToken[],
    hasUntaggedOperand: boolean
): FilterSearchTokens => {
    const nameTokens: string[] = [];
    const tagTokens: string[] = [];
    const propertyTokens: PropertySearchToken[] = [];
    const folderTokens: FolderFilterToken[] = [];
    const extensionTokens: string[] = [];
    const dateRanges: DateFilterRange[] = [];
    const connectorCandidates: string[] = [];
    const excludeNameTokens: string[] = [];
    const excludeFolderTokens: FolderFilterToken[] = [];
    const excludeExtensionTokens: string[] = [];
    const excludeDateRanges: DateFilterRange[] = [];
    let requireUnfinishedTasks = false;
    let excludeUnfinishedTasks = false;
    let requireTagged = false;

    // Extract name and tag tokens, treating operators as potential name tokens
    for (const token of classifiedTokens) {
        switch (token.kind) {
            case 'name':
                nameTokens.push(token.value);
                break;
            case 'nameNegation':
                excludeNameTokens.push(token.value);
                break;
            case 'tag':
                if (token.value) {
                    tagTokens.push(token.value);
                }
                requireTagged = true;
                break;
            case 'property':
                propertyTokens.push(token.value);
                break;
            case 'folder':
                folderTokens.push(token.value);
                break;
            case 'extension':
                extensionTokens.push(token.value);
                break;
            case 'date':
                dateRanges.push(token.range);
                break;
            case 'unfinishedTask':
                requireUnfinishedTasks = true;
                break;
            case 'unfinishedTaskNegation':
                excludeUnfinishedTasks = true;
                break;
            case 'operator':
                connectorCandidates.push(token.operator.toLowerCase());
                break;
            case 'tagNegation':
                break;
            case 'propertyNegation':
                break;
            case 'folderNegation':
                excludeFolderTokens.push(token.value);
                break;
            case 'extensionNegation':
                excludeExtensionTokens.push(token.value);
                break;
            case 'dateNegation':
                excludeDateRanges.push(token.range);
                break;
        }
    }

    // Treat connector words as literal tokens when not in tag mode.
    // This allows users to search for "and"/"or" in file names while
    // keeping explicit operator behavior exclusive to pure tag queries.
    if (connectorCandidates.length > 0) {
        nameTokens.push(...connectorCandidates);
    }

    const hasInclusions =
        nameTokens.length > 0 ||
        tagTokens.length > 0 ||
        propertyTokens.length > 0 ||
        folderTokens.length > 0 ||
        extensionTokens.length > 0 ||
        dateRanges.length > 0 ||
        requireTagged ||
        requireUnfinishedTasks;
    const requiresTags = requireTagged || tagTokens.length > 0;
    const requiresProperties = propertyTokens.length > 0;
    const allRequireTags = hasInclusions ? requiresTags : false;
    const includedTagTokens = tagTokens.slice();

    return {
        mode: 'filter',
        expression: [],
        hasInclusions,
        requiresTags,
        allRequireTags,
        requireUnfinishedTasks,
        excludeUnfinishedTasks,
        includedTagTokens,
        propertyTokens,
        excludePropertyTokens,
        requiresProperties,
        nameTokens,
        tagTokens,
        dateRanges,
        requireTagged,
        includeUntagged: hasUntaggedOperand,
        excludeNameTokens,
        excludeTagTokens,
        folderTokens,
        excludeFolderTokens,
        extensionTokens,
        excludeExtensionTokens,
        excludeDateRanges,
        excludeTagged: hasUntaggedOperand
    };
};

/**
 * Parse a filter search query into name, tag, folder, and extension tokens with support for negations.
 *
 * Inclusion patterns (must match):
 * - #tag - Include notes with tags containing "tag"
 * - # - Include only notes that have at least one tag
 * - .key - Include notes with property key
 * - .key=value - Include notes where the property value contains "value"
 * - @today - Include notes matching the default date field on the current day
 * - @YYYY-MM-DD / @YYYYMMDD - Include notes matching the default date field on a specific day
 * - @YYYY - Include notes matching the default date field inside a calendar year
 * - @YYYY-MM / @YYYYMM - Include notes matching the default date field inside a calendar month
 * - @YYYY-Www - Include notes matching the default date field inside an ISO week
 * - @YYYY-Qq - Include notes matching the default date field inside a calendar quarter
 * - @YYYY-MM-DD..YYYY-MM-DD - Include notes matching the default date field inside an inclusive day range (open ends supported)
 * - @c:... / @m:... - Target created/modified date field for a date token
 * - has:task - Include notes with unfinished tasks
 * - folder:meetings - Include notes where any folder segment contains "meetings"
 * - folder:/work/meetings - Include notes whose parent folder path is exactly "work/meetings"
 * - folder:/ - Include notes in the vault root
 * - ext:md - Include notes with extension "md"
 * - word - Include notes with "word" in their name
 *
 * Exclusion patterns (must NOT match):
 * - -#tag - Exclude notes with tags containing "tag"
 * - -# - Exclude all tagged notes (show only untagged)
 * - -.key - Exclude notes with property key
 * - -.key=value - Exclude notes where the property value contains "value"
 * - -@... - Exclude notes matching a date token or range
 * - -has:task - Exclude notes with unfinished tasks
 * - -folder:archive - Exclude notes where any folder segment contains "archive"
 * - -folder:/archive - Exclude notes whose parent folder path is exactly "archive"
 * - -ext:pdf - Exclude notes with extension "pdf"
 * - -word - Exclude notes with "word" in their name
 *
 * Special handling:
 * - AND/OR act as operators only in pure tag queries
 * - Mixed queries treat AND/OR as literal name tokens
 * - In pure tag queries, AND has higher precedence than OR
 * - Adjacent tokens without connectors implicitly use AND
 * - Leading or consecutive connectors are treated as literal text tokens in filter mode
 * - All tokens are normalized with lowercase folding plus Latin diacritic folding
 *
 * @param query - Raw search query from the UI
 * @returns Parsed tokens with include/exclude criteria for filtering
 */
export function parseFilterSearchTokens(query: string): FilterSearchTokens {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
        return EMPTY_TOKENS;
    }

    // Tokenization preserves original code points.
    // Normalization is handled in classification so token type detection and token folding
    // stay explicit and testable.
    const rawTokens = tokenizeFilterSearchQuery(trimmedQuery).filter(Boolean);
    if (rawTokens.length === 0) {
        return EMPTY_TOKENS;
    }

    const classification = classifyRawTokens(rawTokens);
    const { tokens: classifiedTokens } = classification;

    const excludeTagTokens: string[] = [];
    const excludePropertyTokens: PropertySearchToken[] = [];
    let hasUntaggedOperand = false;
    for (const token of classifiedTokens) {
        if (token.kind === 'tagNegation') {
            if (token.value === null) {
                hasUntaggedOperand = true;
            } else {
                excludeTagTokens.push(token.value);
            }
            continue;
        }

        if (token.kind === 'propertyNegation') {
            excludePropertyTokens.push(token.value);
        }
    }

    if (canUseTagMode(classification)) {
        // Tag mode is only allowed for pure tag expressions.
        // Once a query includes any non-tag operand (name/date/task),
        // we intentionally stay in filter mode so connector words are
        // evaluated as literal name tokens.
        const tagTokens = parseTagModeTokens(classifiedTokens, excludeTagTokens, excludePropertyTokens);
        if (tagTokens) {
            return tagTokens;
        }
    }

    return parseFilterModeTokens(classifiedTokens, excludeTagTokens, excludePropertyTokens, hasUntaggedOperand);
}

const isSearchNavOperandToken = (
    token: ClassifiedToken
): token is Extract<ClassifiedToken, { kind: 'tag' | 'tagNegation' | 'property' | 'propertyNegation' }> => {
    return token.kind === 'tag' || token.kind === 'tagNegation' || token.kind === 'property' || token.kind === 'propertyNegation';
};

const buildSearchNavPropertyNodeId = (token: PropertySearchToken): string => {
    return token.value === null ? buildPropertyKeyNodeId(token.key) : buildPropertyValueNodeId(token.key, token.value);
};

/**
 * Builds the navigation highlight state for the active search query.
 * Include operators are only tracked for tag-mode expressions where AND/OR act as connectors.
 */
export function buildSearchNavFilterState(query: string): SearchNavFilterState {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
        return EMPTY_SEARCH_NAV_FILTER_STATE;
    }

    const tokens = parseFilterSearchTokens(trimmedQuery);
    const tagIncludeSet = new Set<string>();
    const tagExcludeSet = new Set<string>();
    const propertyIncludeSet = new Set<string>();
    const propertyExcludeSet = new Set<string>();

    tokens.includedTagTokens.forEach(token => {
        if (token) {
            tagIncludeSet.add(token);
        }
    });
    tokens.excludeTagTokens.forEach(token => {
        if (token) {
            tagExcludeSet.add(token);
        }
    });
    tokens.propertyTokens.forEach(token => {
        propertyIncludeSet.add(buildSearchNavPropertyNodeId(token));
    });
    tokens.excludePropertyTokens.forEach(token => {
        propertyExcludeSet.add(buildSearchNavPropertyNodeId(token));
    });

    const tagIncludeOperators: Record<string, InclusionOperator> = {};
    const propertyIncludeOperators: Record<string, InclusionOperator> = {};

    if (tokens.mode === 'tag') {
        const rawTokens = tokenizeFilterSearchQuery(trimmedQuery).filter(Boolean);
        const classification = classifyRawTokens(rawTokens);
        let hasPriorOperand = false;
        let pendingOperator: InclusionOperator | null = null;

        for (const token of classification.tokens) {
            if (token.kind === 'operator') {
                pendingOperator = token.operator;
                continue;
            }

            if (!isSearchNavOperandToken(token)) {
                continue;
            }

            const operator = hasPriorOperand ? (pendingOperator ?? 'AND') : null;
            if (token.kind === 'tag' && token.value && operator) {
                tagIncludeOperators[token.value] = operator;
            } else if (token.kind === 'property' && operator) {
                propertyIncludeOperators[buildSearchNavPropertyNodeId(token.value)] = operator;
            }

            hasPriorOperand = true;
            pendingOperator = null;
        }
    }

    return {
        tags: {
            include: Array.from(tagIncludeSet),
            exclude: Array.from(tagExcludeSet),
            includeOperators: tagIncludeOperators,
            excludeTagged: tokens.excludeTagged,
            includeUntagged: tokens.includeUntagged,
            requireTagged: tokens.requireTagged
        },
        properties: {
            include: Array.from(propertyIncludeSet),
            exclude: Array.from(propertyExcludeSet),
            includeOperators: propertyIncludeOperators
        }
    };
}

// Checks if a token is a recognized connector word
const isConnectorToken = (value: string | undefined): boolean => {
    if (!value) {
        return false;
    }
    return CONNECTOR_TOKEN_SET.has(value.toLowerCase());
};

// Checks whether a query contains only tag/property operands and connector words.
const isTagOnlyMutationQuery = (query: string): boolean => {
    const trimmed = query.trim();
    if (!trimmed) {
        return true;
    }

    const tokens = tokenizeFilterSearchQuery(trimmed);
    let hasTagOperand = false;

    for (const token of tokens) {
        const lowercaseToken = token.toLowerCase();
        if (isConnectorToken(lowercaseToken)) {
            continue;
        }

        const candidate = lowercaseToken.startsWith('-') ? lowercaseToken.slice(1) : lowercaseToken;
        if (!candidate) {
            return false;
        }

        if (candidate.startsWith('#')) {
            hasTagOperand = true;
            continue;
        }

        if (parsePropertyFilterToken(candidate)) {
            hasTagOperand = true;
            continue;
        }

        return false;
    }

    return hasTagOperand;
};

const escapeQuotedTokenValue = (value: string): string => {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};

const shouldQuoteQueryTokenPart = (value: string): boolean => {
    return /\s/.test(value) || value.includes('"') || value.includes('\\') || value.includes('=');
};

const escapePropertyFilterPartForQuery = (value: string, includeQuotes = false): string => {
    let escaped = '';

    for (const char of value) {
        if (char === '\\' || char === '=' || (includeQuotes && char === '"')) {
            escaped += '\\';
        }
        escaped += char;
    }

    return escaped;
};

const formatPropertyFilterPartForQuery = (value: string): string => {
    const shouldQuote = shouldQuoteQueryTokenPart(value);
    const escaped = escapePropertyFilterPartForQuery(value, shouldQuote);
    if (!shouldQuote) {
        return escaped;
    }

    return `"${escaped}"`;
};

const formatPropertyTokenForQuery = (propertyToken: PropertySearchToken, negated = false): string => {
    const prefix = negated ? '-.' : '.';
    const serializedKey = formatPropertyFilterPartForQuery(propertyToken.key);
    if (propertyToken.value === null) {
        return `${prefix}${serializedKey}`;
    }

    const serializedValue = formatPropertyFilterPartForQuery(propertyToken.value);
    return `${prefix}${serializedKey}=${serializedValue}`;
};

const serializeMutationToken = (token: string): string => {
    const normalized = token.toLowerCase();
    if (normalized.startsWith('-.') || normalized.startsWith('.')) {
        const negated = normalized.startsWith('-.');
        const candidate = negated ? normalized.slice(1) : normalized;
        const parsedProperty = parsePropertyFilterToken(candidate);
        if (parsedProperty) {
            return formatPropertyTokenForQuery(parsedProperty, negated);
        }
    }

    if (/\s/.test(token) || token.includes('"') || token.includes('\\')) {
        return `"${escapeQuotedTokenValue(token)}"`;
    }

    return token;
};

const serializeMutationTokens = (tokens: string[]): string => {
    return tokens
        .map(token => serializeMutationToken(token))
        .join(' ')
        .trim();
};

export interface UpdateFilterQueryWithTagResult {
    query: string;
    action: 'added' | 'removed';
    changed: boolean;
}

export interface UpdateFilterQueryWithDateTokenResult {
    query: string;
    changed: boolean;
}

export interface UpdateFilterQueryWithPropertyResult {
    query: string;
    action: 'added' | 'removed';
    changed: boolean;
}

const removeMutationToken = (tokens: string[], removalIndex: number, expressionMode: boolean): string[] => {
    const updatedTokens = tokens.slice();
    updatedTokens.splice(removalIndex, 1);

    if (!expressionMode) {
        return updatedTokens;
    }

    const precedingIndex = removalIndex - 1;
    if (precedingIndex >= 0 && isConnectorToken(updatedTokens[precedingIndex])) {
        updatedTokens.splice(precedingIndex, 1);
    }

    while (updatedTokens.length > 0 && isConnectorToken(updatedTokens[0])) {
        updatedTokens.shift();
    }

    for (let index = 0; index < updatedTokens.length - 1; index += 1) {
        if (isConnectorToken(updatedTokens[index]) && isConnectorToken(updatedTokens[index + 1])) {
            updatedTokens.splice(index + 1, 1);
            index -= 1;
        }
    }

    while (updatedTokens.length > 0 && isConnectorToken(updatedTokens[updatedTokens.length - 1])) {
        updatedTokens.pop();
    }

    return updatedTokens;
};

const appendMutationToken = (tokens: string[], token: string, operator: InclusionOperator, expressionMode: boolean): string[] => {
    const nextTokens = tokens.slice();
    if (!expressionMode) {
        nextTokens.push(token);
        return nextTokens;
    }

    const connector = operator === 'OR' ? 'OR' : 'AND';
    if (nextTokens.length === 0) {
        nextTokens.push(token);
    } else if (isConnectorToken(nextTokens[nextTokens.length - 1])) {
        nextTokens[nextTokens.length - 1] = connector;
        nextTokens.push(token);
    } else {
        nextTokens.push(connector, token);
    }

    return nextTokens;
};

/**
 * Toggle a normalized tag inside a raw query string.
 * In tag-only queries, connectors are inserted/cleaned as expression operators.
 * In mixed queries, tags are appended/removed without connector mutation.
 * Returns the updated query string and whether the operation modified the input.
 */
export function updateFilterQueryWithTag(
    query: string,
    normalizedTag: string,
    operator: InclusionOperator
): UpdateFilterQueryWithTagResult {
    const trimmed = query.trim();
    if (!normalizedTag) {
        return {
            query: trimmed,
            action: 'removed',
            changed: false
        };
    }

    const formattedTag = `#${normalizedTag}`;
    const tokens = trimmed.length > 0 ? tokenizeFilterSearchQuery(trimmed) : [];
    const tagOnlyQuery = isTagOnlyMutationQuery(trimmed);
    const lowerTarget = foldSearchText(formattedTag);
    const removalIndex = tokens.findIndex(token => foldSearchText(token) === lowerTarget);

    if (removalIndex !== -1) {
        const updatedTokens = removeMutationToken(tokens, removalIndex, tagOnlyQuery);

        const nextQuery = serializeMutationTokens(updatedTokens);
        return {
            query: nextQuery,
            action: 'removed',
            changed: nextQuery !== trimmed
        };
    }

    const nextTokens = appendMutationToken(tokens, formattedTag, operator, tagOnlyQuery);

    const nextQuery = serializeMutationTokens(nextTokens);
    return {
        query: nextQuery,
        action: 'added',
        changed: nextQuery !== trimmed
    };
}

export function updateFilterQueryWithProperty(
    query: string,
    key: string,
    value: string | null,
    operator: InclusionOperator
): UpdateFilterQueryWithPropertyResult {
    const trimmed = query.trim();
    const normalizedKey = normalizePropertyFilterKey(key);
    if (!normalizedKey) {
        return {
            query: trimmed,
            action: 'removed',
            changed: false
        };
    }

    let normalizedValue: string | null = null;
    if (typeof value === 'string') {
        const normalizedCandidate = normalizePropertyFilterValue(value);
        if (!normalizedCandidate) {
            return {
                query: trimmed,
                action: 'removed',
                changed: false
            };
        }
        normalizedValue = normalizedCandidate;
    }

    const propertyToken: PropertySearchToken = { key: normalizedKey, value: normalizedValue };
    const formattedToken = formatPropertyTokenForQuery(propertyToken);
    const tokens = trimmed.length > 0 ? tokenizeFilterSearchQuery(trimmed) : [];
    const tagOnlyQuery = isTagOnlyMutationQuery(trimmed);
    const foldedTargetKey = foldSearchText(propertyToken.key);
    const foldedTargetValue = foldSearchText(propertyToken.value ?? '');

    const removalIndex = tokens.findIndex(token => {
        if (token.startsWith('-')) {
            return false;
        }
        const parsed = parsePropertyFilterToken(token);
        if (!parsed) {
            return false;
        }
        const parsedKey = foldSearchText(parsed.key);
        const parsedValue = foldSearchText(parsed.value ?? '');
        return parsedKey === foldedTargetKey && parsedValue === foldedTargetValue;
    });

    if (removalIndex !== -1) {
        const updatedTokens = removeMutationToken(tokens, removalIndex, tagOnlyQuery);

        const nextQuery = serializeMutationTokens(updatedTokens);
        return {
            query: nextQuery,
            action: 'removed',
            changed: nextQuery !== trimmed
        };
    }

    const nextTokens = appendMutationToken(tokens, formattedToken, operator, tagOnlyQuery);

    const nextQuery = serializeMutationTokens(nextTokens);
    return {
        query: nextQuery,
        action: 'added',
        changed: nextQuery !== trimmed
    };
}

/**
 * Replaces a raw query string with a date token (for example `@2026-02-08`).
 */
export function updateFilterQueryWithDateToken(query: string, dateToken: string): UpdateFilterQueryWithDateTokenResult {
    const trimmedToken = dateToken.trim();

    if (!trimmedToken || !trimmedToken.startsWith('@')) {
        const trimmedQuery = query.trim();
        return { query: trimmedQuery, changed: false };
    }

    const trimmedQuery = query.trim();
    const nextQuery = trimmedToken;
    return {
        query: nextQuery,
        changed: nextQuery !== trimmedQuery
    };
}

/**
 * Check if parsed tokens contain any include or exclude criteria.
 */
export function filterSearchHasActiveCriteria(tokens: FilterSearchTokens): boolean {
    return (
        tokens.hasInclusions ||
        tokens.excludeNameTokens.length > 0 ||
        tokens.excludeTagTokens.length > 0 ||
        tokens.excludePropertyTokens.length > 0 ||
        tokens.excludeFolderTokens.length > 0 ||
        tokens.excludeExtensionTokens.length > 0 ||
        tokens.excludeDateRanges.length > 0 ||
        tokens.excludeUnfinishedTasks ||
        tokens.excludeTagged
    );
}

/**
 * Check if evaluating the parsed tokens requires file tag metadata.
 */
export function filterSearchNeedsTagLookup(tokens: FilterSearchTokens): boolean {
    return tokens.requiresTags || tokens.excludeTagged || tokens.excludeTagTokens.length > 0;
}

/**
 * Check if evaluating the parsed tokens requires file property metadata.
 */
export function filterSearchNeedsPropertyLookup(tokens: FilterSearchTokens): boolean {
    return tokens.requiresProperties || tokens.excludePropertyTokens.length > 0;
}

/**
 * Check if every matching clause requires tagged files.
 */
export function filterSearchRequiresTagsForEveryMatch(tokens: FilterSearchTokens): boolean {
    return tokens.hasInclusions && tokens.allRequireTags;
}

export interface FilterSearchMatchOptions {
    hasUnfinishedTasks: boolean;
    foldedAliases?: readonly string[];
    foldedFolderPath?: string;
    foldedExtension?: string;
    propertyValuesByKey?: Map<string, string[]>;
}

export interface FilterSearchNameMatch {
    aliasIndexes: readonly number[];
}

/**
 * `matches: false` means a criterion rejected the file and no name state is retained. `matches: true` with a `nameMatch`
 * records the aliases used by filter-mode name tokens; `nameMatch: null` means the query had no filter-mode name tokens.
 */
export type FilterSearchFileMatch =
    { readonly matches: false; readonly nameMatch: null } | { readonly matches: true; readonly nameMatch: FilterSearchNameMatch | null };

const FILTER_SEARCH_NO_MATCH: FilterSearchFileMatch = { matches: false, nameMatch: null };
const FILTER_SEARCH_MATCH_WITHOUT_NAME: FilterSearchFileMatch = { matches: true, nameMatch: null };

/**
 * Matches every name token across the display name and aliases.
 * Returns an empty alias index list when the display name covers every token, alias indexes in frontmatter order when aliases
 * are required, or null when the combined name candidates do not cover every token.
 */
export function findFilterSearchNameMatch(
    foldedName: string,
    foldedAliases: readonly string[],
    nameTokens: readonly string[]
): FilterSearchNameMatch | null {
    const aliasRequiredTokens = Array.from(new Set(nameTokens.filter(token => !foldedName.includes(token))));
    const unmatchedTokens = new Set(aliasRequiredTokens);
    if (unmatchedTokens.size === 0) {
        return { aliasIndexes: [] };
    }

    const aliasIndexes: number[] = [];
    while (unmatchedTokens.size > 0) {
        let bestAliasIndex = -1;
        let bestCoverage = 0;

        // Prefer the alias covering the most remaining tokens so a combined alias does not produce redundant labels.
        // Equal coverage retains frontmatter order because only a larger count replaces the current candidate.
        foldedAliases.forEach((alias, aliasIndex) => {
            let coverage = 0;
            unmatchedTokens.forEach(token => {
                if (alias.includes(token)) {
                    coverage += 1;
                }
            });

            if (coverage > bestCoverage) {
                bestAliasIndex = aliasIndex;
                bestCoverage = coverage;
            }
        });

        if (bestAliasIndex === -1) {
            return null;
        }

        aliasIndexes.push(bestAliasIndex);
        const matchedAlias = foldedAliases[bestAliasIndex];
        unmatchedTokens.forEach(token => {
            if (matchedAlias.includes(token)) {
                unmatchedTokens.delete(token);
            }
        });
    }

    // A later greedy choice can make an earlier alias redundant. Remove redundant aliases from the end first so frontmatter
    // order remains the tie-breaker when either alias can be retained.
    aliasIndexes.sort((left, right) => left - right);
    for (let position = aliasIndexes.length - 1; position >= 0; position -= 1) {
        const remainingAliasIndexes = aliasIndexes.filter((_aliasIndex, index) => index !== position);
        const stillCoversEveryToken = aliasRequiredTokens.every(token =>
            remainingAliasIndexes.some(aliasIndex => foldedAliases[aliasIndex]?.includes(token))
        );
        if (stillCoversEveryToken) {
            aliasIndexes.splice(position, 1);
        }
    }

    return { aliasIndexes };
}

/**
 * Matches a file against parsed filter search tokens and retains the name/alias coverage result.
 *
 * The detailed result lets list rendering reuse alias coverage from the acceptance pass instead of matching the name twice.
 */
export function getFileFilterSearchMatch(
    foldedName: string,
    foldedTags: string[],
    tokens: FilterSearchTokens,
    options?: FilterSearchMatchOptions
): FilterSearchFileMatch {
    const hasUnfinishedTasks = options?.hasUnfinishedTasks ?? false;
    // Callers provide pre-folded aliases/folder/extension values so this matcher can use direct comparisons.
    const foldedAliases = options?.foldedAliases ?? [];
    const foldedFolderPath = options?.foldedFolderPath ?? '';
    const foldedExtension = options?.foldedExtension ?? '';
    // Property map keys and values are expected in folded form.
    const propertyValuesByKey = options?.propertyValuesByKey ?? EMPTY_PROPERTY_VALUE_MAP;

    if (tokens.excludeUnfinishedTasks && hasUnfinishedTasks) {
        return FILTER_SEARCH_NO_MATCH;
    }

    if (tokens.requireUnfinishedTasks && !hasUnfinishedTasks) {
        return FILTER_SEARCH_NO_MATCH;
    }

    if (tokens.mode === 'filter') {
        let nameMatch: FilterSearchNameMatch | null = null;
        const hasFolderCriteria = tokens.excludeFolderTokens.length > 0 || tokens.folderTokens.length > 0;
        const normalizedFolderPath = hasFolderCriteria ? normalizeFolderPathForMatch(foldedFolderPath) : '';
        const needsFolderSegments =
            hasFolderCriteria &&
            (tokens.excludeFolderTokens.some(token => token.mode === 'segment') ||
                tokens.folderTokens.some(token => token.mode === 'segment'));
        const folderSegments = needsFolderSegments ? normalizedFolderPath.split('/').filter(Boolean) : null;

        if (tokens.excludeNameTokens.length > 0) {
            const hasExcludedName = tokens.excludeNameTokens.some(
                token => foldedName.includes(token) || foldedAliases.some(alias => alias.includes(token))
            );
            if (hasExcludedName) {
                return FILTER_SEARCH_NO_MATCH;
            }
        }

        if (tokens.excludeFolderTokens.length > 0) {
            const hasExcludedFolder = tokens.excludeFolderTokens.some(token =>
                folderMatchesTokenWithNormalizedPath(normalizedFolderPath, folderSegments, token)
            );
            if (hasExcludedFolder) {
                return FILTER_SEARCH_NO_MATCH;
            }
        }

        if (tokens.excludeExtensionTokens.length > 0) {
            const hasExcludedExtension = tokens.excludeExtensionTokens.some(token => extensionMatchesToken(foldedExtension, token));
            if (hasExcludedExtension) {
                return FILTER_SEARCH_NO_MATCH;
            }
        }

        if (tokens.excludeTagged) {
            if (foldedTags.length > 0) {
                return FILTER_SEARCH_NO_MATCH;
            }
        } else if (tokens.excludeTagTokens.length > 0 && foldedTags.length > 0) {
            const hasExcludedTag = tokens.excludeTagTokens.some(token => foldedTags.some(tag => tagMatchesToken(tag, token)));
            if (hasExcludedTag) {
                return FILTER_SEARCH_NO_MATCH;
            }
        }

        if (tokens.excludePropertyTokens.length > 0) {
            const hasExcludedProperty = tokens.excludePropertyTokens.some(token => propertyTokenMatches(propertyValuesByKey, token));
            if (hasExcludedProperty) {
                return FILTER_SEARCH_NO_MATCH;
            }
        }

        if (tokens.nameTokens.length > 0) {
            nameMatch = findFilterSearchNameMatch(foldedName, foldedAliases, tokens.nameTokens);
            if (!nameMatch) {
                return FILTER_SEARCH_NO_MATCH;
            }
        }

        if (tokens.folderTokens.length > 0) {
            const matchesFolders = tokens.folderTokens.every(token =>
                folderMatchesTokenWithNormalizedPath(normalizedFolderPath, folderSegments, token)
            );
            if (!matchesFolders) {
                return FILTER_SEARCH_NO_MATCH;
            }
        }

        if (tokens.extensionTokens.length > 0) {
            const matchesExtensions = tokens.extensionTokens.every(token => extensionMatchesToken(foldedExtension, token));
            if (!matchesExtensions) {
                return FILTER_SEARCH_NO_MATCH;
            }
        }

        if (tokens.propertyTokens.length > 0) {
            const matchesProperties = tokens.propertyTokens.every(token => propertyTokenMatches(propertyValuesByKey, token));
            if (!matchesProperties) {
                return FILTER_SEARCH_NO_MATCH;
            }
        }

        if (tokens.requireTagged || tokens.tagTokens.length > 0) {
            if (foldedTags.length === 0) {
                return FILTER_SEARCH_NO_MATCH;
            }
            if (tokens.tagTokens.length > 0) {
                const matchesTags = tokens.tagTokens.every(token => foldedTags.some(tag => tagMatchesToken(tag, token)));
                if (!matchesTags) {
                    return FILTER_SEARCH_NO_MATCH;
                }
            }
        }

        return nameMatch ? { matches: true, nameMatch } : FILTER_SEARCH_MATCH_WITHOUT_NAME;
    }

    if (tokens.excludeTagged) {
        if (foldedTags.length > 0) {
            return FILTER_SEARCH_NO_MATCH;
        }
    }

    if (tokens.expression.length === 0) {
        return FILTER_SEARCH_MATCH_WITHOUT_NAME;
    }

    return evaluateTagExpression(tokens.expression, foldedTags, propertyValuesByKey)
        ? FILTER_SEARCH_MATCH_WITHOUT_NAME
        : FILTER_SEARCH_NO_MATCH;
}

/**
 * Check if a file matches parsed filter search tokens.
 *
 * @returns True when the file passes all filter criteria
 */
export function fileMatchesFilterTokens(
    foldedName: string,
    foldedTags: string[],
    tokens: FilterSearchTokens,
    options?: FilterSearchMatchOptions
): boolean {
    return getFileFilterSearchMatch(foldedName, foldedTags, tokens, options).matches;
}
