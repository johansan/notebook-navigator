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

import { getLanguage } from 'obsidian';
import { STRINGS_EN } from './locales/en';
import { LANGUAGE_METADATA, type LanguageCode } from './localeMetadata';
import { sanitizeRecord } from '../utils/recordUtils';

// Bootstrap labels are bundled in localeMetadata before the full language data is available.
// unused-strings keep language settings.items.dateFormat.placeholder settings.items.timeFormat.placeholder
type TranslationStrings = typeof STRINGS_EN;

// Imports retain this live binding. Module-level copies of individual labels must instead read at use time.
export let strings: TranslationStrings = STRINGS_EN;

export function getCurrentLanguage(): string {
    return getLanguage();
}

export function getLanguageCode(): LanguageCode {
    const language = getCurrentLanguage();
    const normalized =
        language === 'pt-BR'
            ? 'pt_br'
            : ['zh', 'zh-CN', 'zh_cn'].includes(language)
              ? 'zh_cn'
              : ['zh-TW', 'zh_tw'].includes(language)
                ? 'zh_tw'
                : language;
    return isLanguageCode(normalized) ? normalized : 'en';
}

function isLanguageCode(value: string): value is LanguageCode {
    return Object.prototype.hasOwnProperty.call(LANGUAGE_METADATA, value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Validates every leaf against English, including array lengths and the null slots occupied by bundled functions. */
export function isLanguageData(value: unknown, reference: unknown = STRINGS_EN): boolean {
    if (typeof reference === 'string') return typeof value === 'string';
    if (typeof reference === 'function') return value === null;
    if (Array.isArray(reference)) {
        return (
            Array.isArray(value) &&
            value.length === reference.length &&
            reference.every((item, index) => isLanguageData(value[index], item))
        );
    }
    if (!isRecord(reference) || !isRecord(value) || Object.keys(value).length !== Object.keys(reference).length) return false;
    return Object.entries(reference).every(
        ([key, child]) => Object.prototype.hasOwnProperty.call(value, key) && isLanguageData(value[key], child)
    );
}

/** Restores trusted local formatters into validated data. Downloaded content is never evaluated as JavaScript. */
function restoreLanguage(value: unknown, formatters: Record<string, unknown>, path: string[] = []): unknown {
    if (value === null) return formatters[path.join('.')];
    if (Array.isArray(value)) return value.map((child, index) => restoreLanguage(child, formatters, [...path, String(index)]));
    if (isRecord(value)) {
        const result = sanitizeRecord<unknown>(undefined);
        for (const [key, child] of Object.entries(value)) result[key] = restoreLanguage(child, formatters, [...path, key]);
        return result;
    }
    return value;
}

/** Applies a complete, validated language; invalid data leaves the existing language untouched. */
export function applyLanguage(locale: LanguageCode, data: unknown): boolean {
    if (!isLanguageData(data)) return false;
    // Shape validation covers all data leaves; the generated formatter map supplies the matching function signatures.
    strings = restoreLanguage(data, LANGUAGE_METADATA[locale].formatters) as TranslationStrings;
    return true;
}

export function applyEnglish(): void {
    strings = STRINGS_EN;
}

// Defaults must follow the requested language even while its UI strings are downloading, otherwise first-launch
// settings would permanently save English date/time formats before the localized UI becomes available.
export function getDefaultDateFormat(): string {
    return LANGUAGE_METADATA[getLanguageCode()].dateFormat || 'MMM D, YYYY';
}

export function getDefaultTimeFormat(): string {
    return LANGUAGE_METADATA[getLanguageCode()].timeFormat || 'h:mm a';
}
