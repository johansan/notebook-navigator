/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025 Johan Sanneblad
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
import { STRINGS_EN } from './locales/en';
import { STRINGS_DE } from './locales/de';
import { STRINGS_ES } from './locales/es';
import { STRINGS_FR } from './locales/fr';
import { STRINGS_JA } from './locales/ja';
import { STRINGS_ZH } from './locales/zh';
// import { STRINGS_SV } from './locales/sv'; // Uncomment when Swedish is supported by Obsidian

// Type for the translation strings structure
type TranslationStrings = typeof STRINGS_EN;

// Map of supported languages to their translation modules
// Just add new languages here as they are created
const LANGUAGE_MAP: Record<string, TranslationStrings> = {
    en: STRINGS_EN,
    de: STRINGS_DE,
    es: STRINGS_ES,
    fr: STRINGS_FR,
    ja: STRINGS_JA,
    zh: STRINGS_ZH,
//    sv: STRINGS_SV, // Uncomment when Swedish is supported by Obsidian
};

/**
 * Detects the current Obsidian language setting
 * Falls back to English if the language is not supported
 */
function getObsidianLanguage(): string {
    const obsidianLanguage = window.localStorage.getItem('language');
    
    // Check if the detected language is supported
    if (obsidianLanguage && obsidianLanguage in LANGUAGE_MAP) {
        return obsidianLanguage;
    }
    
    // Fallback to English
    return 'en';
}

// Export the appropriate language strings based on Obsidian's setting
export const strings: TranslationStrings = LANGUAGE_MAP[getObsidianLanguage()];