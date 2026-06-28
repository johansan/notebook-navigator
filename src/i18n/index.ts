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

/**
 * Central export point for internationalization
 * Dynamically loads the appropriate language based on Obsidian's language setting
 */
import { getLanguage } from 'obsidian';
import type { STRINGS_EN } from './locales/en';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unnecessary-type-assertion -- Literal CommonJS requires keep locale modules bundled while deferring locale initialization. */

// Type for the translation strings structure
type TranslationStrings = typeof STRINGS_EN;

// Supported Obsidian languages with Notebook Navigator translations.
//
// Obsidian-supported languages:
// ✅ ar     - Arabic
// ❌ am     - Amharic
// ❌ be     - Belarusian
// ❌ da     - Danish
// ✅ de     - German
// ✅ en     - English
// ❌ en-GB  - English (UK)
// ✅ es     - Spanish
// ✅ fa     - Persian (Farsi)
// ✅ fr     - French
// ✅ id     - Indonesian
// ✅ it     - Italian
// ✅ ja     - Japanese
// ✅ ko     - Korean
// ❌ lv     - Latvian
// ❌ ne     - Nepali
// ✅ nl     - Dutch
// ❌ no     - Norwegian
// ✅ pl     - Polish
// ✅ pt     - Portuguese
// ✅ pt-BR  - Portuguese (Brazil)
// ✅ ru     - Russian
// ❌ sq     - Albanian
// ✅ th     - Thai
// ✅ tr     - Turkish
// ✅ uk     - Ukrainian
// ✅ vi     - Vietnamese
// ✅ zh     - Chinese (Simplified)
// ✅ zh-TW  - Chinese (Traditional)
const SUPPORTED_LANGUAGES = new Set([
    'ar',
    'de',
    'en',
    'es',
    'fa',
    'fr',
    'id',
    'it',
    'ja',
    'ko',
    'nl',
    'pl',
    'pt',
    'pt-BR',
    'ru',
    'th',
    'tr',
    'uk',
    'vi',
    'zh',
    'zh-CN',
    'zh_cn',
    'zh-TW',
    'zh_tw'
]);

let englishStrings: TranslationStrings | null = null;

function getEnglishStrings(): TranslationStrings {
    if (!englishStrings) {
        englishStrings = (require('./locales/en.ts') as typeof import('./locales/en')).STRINGS_EN;
    }
    return englishStrings;
}

function loadLocaleOverrides(locale: string): TranslationStrings | undefined {
    switch (locale) {
        case 'ar':
            return (require('./locales/ar.ts') as typeof import('./locales/ar')).STRINGS_AR;
        case 'de':
            return (require('./locales/de.ts') as typeof import('./locales/de')).STRINGS_DE;
        case 'es':
            return (require('./locales/es.ts') as typeof import('./locales/es')).STRINGS_ES;
        case 'fa':
            return (require('./locales/fa.ts') as typeof import('./locales/fa')).STRINGS_FA;
        case 'fr':
            return (require('./locales/fr.ts') as typeof import('./locales/fr')).STRINGS_FR;
        case 'id':
            return (require('./locales/id.ts') as typeof import('./locales/id')).STRINGS_ID;
        case 'it':
            return (require('./locales/it.ts') as typeof import('./locales/it')).STRINGS_IT;
        case 'ja':
            return (require('./locales/ja.ts') as typeof import('./locales/ja')).STRINGS_JA;
        case 'ko':
            return (require('./locales/ko.ts') as typeof import('./locales/ko')).STRINGS_KO;
        case 'nl':
            return (require('./locales/nl.ts') as typeof import('./locales/nl')).STRINGS_NL;
        case 'pl':
            return (require('./locales/pl.ts') as typeof import('./locales/pl')).STRINGS_PL;
        case 'pt':
            return (require('./locales/pt.ts') as typeof import('./locales/pt')).STRINGS_PT;
        case 'pt-BR':
            return (require('./locales/pt_br.ts') as typeof import('./locales/pt_br')).STRINGS_PT_BR;
        case 'ru':
            return (require('./locales/ru.ts') as typeof import('./locales/ru')).STRINGS_RU;
        case 'th':
            return (require('./locales/th.ts') as typeof import('./locales/th')).STRINGS_TH;
        case 'tr':
            return (require('./locales/tr.ts') as typeof import('./locales/tr')).STRINGS_TR;
        case 'uk':
            return (require('./locales/uk.ts') as typeof import('./locales/uk')).STRINGS_UK;
        case 'vi':
            return (require('./locales/vi.ts') as typeof import('./locales/vi')).STRINGS_VI;
        case 'zh':
        case 'zh-CN':
        case 'zh_cn':
            return (require('./locales/zh_cn.ts') as typeof import('./locales/zh_cn')).STRINGS_ZH_CN;
        case 'zh-TW':
        case 'zh_tw':
            return (require('./locales/zh_tw.ts') as typeof import('./locales/zh_tw')).STRINGS_ZH_TW;
        case 'en':
            return getEnglishStrings();
        default:
            return undefined;
    }
}

const resolvedLanguageCache = new Map<string, TranslationStrings>();

function getResolvedStrings(locale: string): TranslationStrings {
    if (locale === 'en') {
        return getEnglishStrings();
    }

    const cached = resolvedLanguageCache.get(locale);
    if (cached) {
        return cached;
    }

    const loadedLocale = loadLocaleOverrides(locale);
    if (loadedLocale) {
        const resolved = loadedLocale as TranslationStrings;
        resolvedLanguageCache.set(locale, resolved);
        return resolved;
    }

    return getEnglishStrings();
}

/**
 * Gets the current language setting from Obsidian
 */
export function getCurrentLanguage(): string {
    return getLanguage();
}

/**
 * Detects the current Obsidian language setting
 * Falls back to English if the language is not supported
 */
function getObsidianLanguage(): string {
    const locale = getCurrentLanguage();

    if (locale && SUPPORTED_LANGUAGES.has(locale)) {
        return locale;
    }

    return 'en';
}

// Export the appropriate language strings based on Obsidian's setting
export const strings: TranslationStrings = getResolvedStrings(getObsidianLanguage());

/**
 * Get the default date format for the current language
 * Uses Moment format tokens
 */
export function getDefaultDateFormat(): string {
    const localeStrings = getResolvedStrings(getObsidianLanguage());
    return localeStrings.settings.items.dateFormat.placeholder || 'MMM D, YYYY';
}

/**
 * Get the default time format for the current language
 * Uses Moment format tokens
 */
export function getDefaultTimeFormat(): string {
    const localeStrings = getResolvedStrings(getObsidianLanguage());
    return localeStrings.settings.items.timeFormat.placeholder || 'h:mm a';
}
