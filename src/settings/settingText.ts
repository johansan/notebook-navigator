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

interface SettingTextSegment {
    text: string;
    strong: boolean;
}

const STRONG_TEXT_PATTERN = /\*\*([^*]+)\*\*/g;

/**
 * Setting copy supports a small inline format where `**...**` marks strong text.
 * Rendering and plain-text metadata share this parser so formatting markers never
 * appear in native settings search results.
 */
function parseSettingText(value: string): SettingTextSegment[] {
    const segments: SettingTextSegment[] = [];
    let currentIndex = 0;

    for (const match of value.matchAll(STRONG_TEXT_PATTERN)) {
        const matchText = match[0];
        const strongText = match[1];
        const matchIndex = match.index;
        if (!matchText || strongText === undefined || matchIndex === undefined) {
            continue;
        }

        if (matchIndex > currentIndex) {
            segments.push({ text: value.slice(currentIndex, matchIndex), strong: false });
        }

        segments.push({ text: strongText, strong: true });
        currentIndex = matchIndex + matchText.length;
    }

    if (currentIndex < value.length) {
        segments.push({ text: value.slice(currentIndex), strong: false });
    }

    return segments;
}

/** Appends localized setting text, rendering supported inline formatting. */
export function appendSettingText(container: HTMLElement, value: string): void {
    parseSettingText(value).forEach(segment => {
        if (segment.strong) {
            container.createEl('strong', { text: segment.text });
            return;
        }
        container.appendText(segment.text);
    });
}

/** Returns localized setting text without its supported inline formatting. */
export function getPlainSettingText(value: string): string {
    return parseSettingText(value)
        .map(segment => segment.text)
        .join('');
}
