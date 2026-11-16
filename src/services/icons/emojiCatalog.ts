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

type EmojiCatalog = Record<string, string[]>;

let emojiCatalog: EmojiCatalog | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isKeywordList(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(entry => typeof entry === 'string');
}

function loadEmojiCatalog(): EmojiCatalog {
    if (emojiCatalog) {
        return emojiCatalog;
    }

    // `emojilib` is intentionally loaded only when the emoji catalog is used.
    const moduleValue: unknown = require('emojilib');
    const catalog: EmojiCatalog = {};
    const entries = isRecord(moduleValue) ? Object.entries(moduleValue) : [];

    for (const [emoji, keywords] of entries) {
        if (isKeywordList(keywords)) {
            catalog[emoji] = keywords;
        }
    }

    emojiCatalog = catalog;
    return catalog;
}

export function getEmojiCatalogEntries(): [string, string[]][] {
    return Object.entries(loadEmojiCatalog());
}

export function getEmojiDisplayName(emoji: string): string {
    return loadEmojiCatalog()[emoji]?.[0] ?? '';
}
