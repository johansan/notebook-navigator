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

import type { App } from 'obsidian';
import { showsWordCount, type NotebookNavigatorSettings } from '../settings/types';
import type { PropertyItem } from '../storage/IndexedDBStorage';
import { formatCommaSeparatedList, getCachedCommaSeparatedList } from './commaSeparatedListUtils';
import { hasEffectiveCustomListGrouping } from './listGrouping';
import { getManualSortGroupHeaderPropertyKey } from './manualSort';
import { casefold } from './recordUtils';
import { naturalCompare } from './sortUtils';
import { isRecord } from './typeGuards';
import { getActivePropertyFields } from './vaultProfiles';

type WikiLinkTarget = { kind: 'internal'; target: string; displayText: string };
type ExternalLinkTarget = { kind: 'external'; target: string; displayText: string };
type UnsupportedMarkdownLinkTarget = { kind: 'unsupported'; displayText: string };
export type PropertyLinkTarget = WikiLinkTarget | ExternalLinkTarget | UnsupportedMarkdownLinkTarget;
export interface PropertyKeySuggestion {
    key: string;
    noteCount: number;
}

interface PropertyKeyAggregate {
    displayKey: string;
    noteCount: number;
}

const EXTERNAL_URI_SCHEME_PATTERN = /^([a-z][a-z0-9+.-]{1,31}):/i;
// Keep file: out of the blocked set so property pills follow desktop Obsidian's
// external-link flow, which shows its own warning before opening the target.
const BLOCKED_EXTERNAL_URI_PROTOCOLS = new Set(['data:', 'javascript:', 'vbscript:']);
const ALLOWED_NON_SLASH_EXTERNAL_URI_PROTOCOLS = new Set(['mailto:', 'sms:', 'tel:']);

export function hasWordCountTargetPropertyConsumer(settings: NotebookNavigatorSettings): boolean {
    return (
        showsWordCount(settings.textCountDisplay) ||
        (getManualSortGroupHeaderPropertyKey(settings) !== null && hasEffectiveCustomListGrouping(settings))
    );
}

export function hasPropertyFrontmatterFields(settings: NotebookNavigatorSettings): boolean {
    if (getActivePropertyFields(settings).trim().length > 0) {
        return true;
    }

    return hasWordCountTargetPropertyConsumer(settings) && settings.wordCountTargetProperty.trim().length > 0;
}

export function getPropertyFrontmatterFields(settings: NotebookNavigatorSettings): string[] {
    const fields = [...getCachedCommaSeparatedList(getActivePropertyFields(settings))];
    const wordCountTargetProperty = hasWordCountTargetPropertyConsumer(settings) ? settings.wordCountTargetProperty.trim() : '';
    const normalizedWordCountTargetProperty = casefold(wordCountTargetProperty);
    if (normalizedWordCountTargetProperty && !fields.some(field => casefold(field) === normalizedWordCountTargetProperty)) {
        fields.push(wordCountTargetProperty);
    }

    return fields;
}

export function getPropertyFrontmatterFieldSignature(settings: NotebookNavigatorSettings): string {
    return formatCommaSeparatedList(getPropertyFrontmatterFields(settings));
}

export function collectVaultPropertyKeys(app: App): PropertyKeySuggestion[] {
    const keyMap = new Map<string, PropertyKeyAggregate>();

    const registerPropertyKey = (rawKey: string, incrementNoteCount: boolean): void => {
        const trimmedKey = rawKey.trim();
        const normalizedKey = casefold(trimmedKey);
        if (!normalizedKey) {
            return;
        }

        const existing = keyMap.get(normalizedKey);
        if (existing) {
            if (incrementNoteCount) {
                existing.noteCount += 1;
            }
            return;
        }

        keyMap.set(normalizedKey, {
            displayKey: trimmedKey,
            noteCount: incrementNoteCount ? 1 : 0
        });
    };

    app.vault.getMarkdownFiles().forEach(file => {
        const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
        if (!isRecord(frontmatter)) {
            return;
        }

        Object.keys(frontmatter).forEach(propertyKey => {
            registerPropertyKey(propertyKey, true);
        });
    });

    const suggestions = Array.from(keyMap.values()).map(value => ({ key: value.displayKey, noteCount: value.noteCount }));
    suggestions.sort((left, right) => {
        const naturalResult = naturalCompare(left.key, right.key);
        if (naturalResult !== 0) {
            return naturalResult;
        }
        return left.key.localeCompare(right.key);
    });
    return suggestions;
}

export function removePropertyField(propertyFields: string, propertyKey: string): string {
    const existingFields = getCachedCommaSeparatedList(propertyFields);
    const normalizedPropertyKey = casefold(propertyKey.trim());
    if (!normalizedPropertyKey) {
        return formatCommaSeparatedList(existingFields);
    }

    const remainingFields = existingFields.filter(field => casefold(field.trim()) !== normalizedPropertyKey);
    return formatCommaSeparatedList(remainingFields);
}

export function renamePropertyField(
    propertyFields: string,
    oldPropertyKey: string,
    newPropertyKey: string,
    preserveExisting: boolean = false
): string {
    const existingFields = getCachedCommaSeparatedList(propertyFields);
    const normalizedOldPropertyKey = casefold(oldPropertyKey.trim());
    const trimmedNewPropertyKey = newPropertyKey.trim();
    const normalizedNewPropertyKey = casefold(trimmedNewPropertyKey);
    if (!normalizedOldPropertyKey || !normalizedNewPropertyKey) {
        return formatCommaSeparatedList(existingFields);
    }

    const destinationExists = preserveExisting ? existingFields.some(field => casefold(field.trim()) === normalizedNewPropertyKey) : false;

    const nextFields: string[] = [];
    const seen = new Set<string>();

    existingFields.forEach(field => {
        const trimmedField = field.trim();
        const normalizedField = casefold(trimmedField);
        if (!normalizedField) {
            return;
        }

        if (normalizedField === normalizedOldPropertyKey && destinationExists) {
            return;
        }

        const nextField = normalizedField === normalizedOldPropertyKey ? trimmedNewPropertyKey : trimmedField;
        const normalizedNextField = casefold(nextField);
        if (!normalizedNextField || seen.has(normalizedNextField)) {
            return;
        }
        seen.add(normalizedNextField);
        nextFields.push(nextField);
    });

    return formatCommaSeparatedList(nextFields);
}

export function normalizePropertyTreeValuePath(rawValue: string): string {
    const wikiLink = parseStrictWikiLink(rawValue);
    if (wikiLink) {
        return casefold(wikiLink.displayText);
    }

    return casefold(rawValue);
}

function parseStrictWikiLink(value: string): WikiLinkTarget | null {
    // Property pills are clickable only when the full value is a single wiki link token.
    const trimmed = value.trim();
    if (!trimmed.startsWith('[[') || !trimmed.endsWith(']]')) {
        return null;
    }

    const inner = trimmed.slice(2, -2).trim();
    if (inner.length === 0 || inner.includes('\n') || inner.includes('\r')) {
        return null;
    }

    const pipeIndex = inner.indexOf('|');
    const rawTarget = (pipeIndex === -1 ? inner : inner.slice(0, pipeIndex)).trim();
    if (rawTarget.length === 0) {
        return null;
    }

    const rawDisplayText = pipeIndex === -1 ? '' : inner.slice(pipeIndex + 1).trim();
    const displayText = rawDisplayText.length > 0 ? rawDisplayText : rawTarget;

    return {
        kind: 'internal',
        target: rawTarget,
        displayText: displayText.startsWith('#') ? displayText.slice(1) : displayText
    };
}

function parseSupportedExternalUriTarget(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed || trimmed.includes('\n') || trimmed.includes('\r')) {
        return null;
    }

    const schemeMatch = EXTERNAL_URI_SCHEME_PATTERN.exec(trimmed);
    if (!schemeMatch) {
        return null;
    }

    try {
        const url = new URL(trimmed);
        const protocol = url.protocol.toLowerCase();
        if (BLOCKED_EXTERNAL_URI_PROTOCOLS.has(protocol)) {
            return null;
        }

        if (ALLOWED_NON_SLASH_EXTERNAL_URI_PROTOCOLS.has(protocol)) {
            return trimmed;
        }

        return trimmed.slice(protocol.length).startsWith('//') ? trimmed : null;
    } catch {
        return null;
    }
}

function parseStrictMarkdownLink(value: string): PropertyLinkTarget | null {
    const trimmed = value.trim();
    if (!trimmed.startsWith('[') || trimmed.startsWith('![') || !trimmed.endsWith(')')) {
        return null;
    }

    if (trimmed.includes('\n') || trimmed.includes('\r')) {
        return null;
    }

    const dividerIndex = trimmed.indexOf('](');
    if (dividerIndex <= 1) {
        return null;
    }

    const rawDisplayText = trimmed.slice(1, dividerIndex).trim();
    if (rawDisplayText.length === 0) {
        return null;
    }

    let rawTarget = trimmed.slice(dividerIndex + 2, -1).trim();
    if (rawTarget.startsWith('<') && rawTarget.endsWith('>')) {
        rawTarget = rawTarget.slice(1, -1).trim();
    }

    if (rawTarget.length === 0) {
        return null;
    }

    const supportedTarget = parseSupportedExternalUriTarget(rawTarget);
    if (!supportedTarget) {
        return {
            kind: 'unsupported',
            displayText: rawDisplayText
        };
    }

    return {
        kind: 'external',
        target: supportedTarget,
        displayText: rawDisplayText
    };
}

function parsePlainExternalUrl(value: string): ExternalLinkTarget | null {
    const trimmed = value.trim();
    const supportedTarget = parseSupportedExternalUriTarget(trimmed);
    if (!supportedTarget) {
        return null;
    }

    return {
        kind: 'external',
        target: supportedTarget,
        displayText: supportedTarget
    };
}

export function parsePropertyLinkTarget(value: string): PropertyLinkTarget | null {
    return parseStrictWikiLink(value) ?? parseStrictMarkdownLink(value) ?? parsePlainExternalUrl(value);
}

export function resolvePropertyDisplayText(rawValue: string): string {
    return parsePropertyLinkTarget(rawValue)?.displayText ?? rawValue.trim();
}

export function isPropertyLinkMarkupValue(rawValue: string): boolean {
    const trimmed = rawValue.trim();
    const linkTarget = parsePropertyLinkTarget(trimmed);
    return linkTarget !== null && linkTarget.displayText !== trimmed;
}

export function isSupportedCssColor(value: string): boolean {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return false;
    }

    const cssApi = (activeWindow as Window & { CSS?: { supports(propertyName: string, value: string): boolean } }).CSS;
    if (cssApi && typeof cssApi.supports === 'function') {
        // Runtime validation for CSS color strings (handles named colors, hex, hsl(), var(), etc).
        return cssApi.supports('color', trimmed);
    }

    // Fallback for environments without CSS.supports (conservative allowlist).
    const lower = trimmed.toLowerCase();
    return (
        lower.startsWith('#') ||
        lower.startsWith('rgb(') ||
        lower.startsWith('rgba(') ||
        lower.startsWith('hsl(') ||
        lower.startsWith('hsla(') ||
        lower.startsWith('var(')
    );
}

// Clones property data so React state can compare and update safely without mutating cache objects.
export function clonePropertyItems(values: readonly PropertyItem[] | null): PropertyItem[] | null {
    if (!values) {
        return null;
    }
    return values.map(entry => ({ ...entry }));
}

// Compares property items by field key + value, preserving order.
// Order is significant so the UI matches the configured field list and frontmatter value order.
export function arePropertyItemsEqual(first: readonly PropertyItem[] | null, second: readonly PropertyItem[] | null): boolean {
    if (first === second) {
        return true;
    }
    if (!first || !second) {
        return false;
    }
    if (first.length !== second.length) {
        return false;
    }
    for (let index = 0; index < first.length; index += 1) {
        const firstItem = first[index];
        const secondItem = second[index];
        if (firstItem.fieldKey !== secondItem.fieldKey) {
            return false;
        }
        if (firstItem.value !== secondItem.value) {
            return false;
        }
        const firstValueKind = firstItem.valueKind ?? 'string';
        const secondValueKind = secondItem.valueKind ?? 'string';
        if (firstValueKind !== secondValueKind) {
            return false;
        }
    }
    return true;
}
