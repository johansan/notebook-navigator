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

import { IconProvider, IconDefinition, IconRenderResult } from '../types';
import { getIconIds, setIcon } from 'obsidian';
import { getRegisteredIconIds } from '../../../utils/iconizeFormat';
import { resetIconContainer } from './providerUtils';

// Obsidian exposes Lucide identifiers with this prefix, but the rest of the
// plugin stores bare slugs. Keeping the prefix definition here keeps the
// translation logic in one place.
const LUCIDE_PREFIX = 'lucide-';

/**
 * Icon provider for Lucide icons.
 *
 * This provider is the only place that talks to Obsidian's Lucide APIs and knows
 * about their prefixed identifiers (e.g., "lucide-folder"). Every method exposes
 * and consumes the plugin's canonical format ("folder") so storage, settings,
 * and UI never have to worry about the prefix.
 */
export class LucideIconProvider implements IconProvider {
    id = 'lucide';
    name = 'Lucide';

    /**
     * Lucide icons are bundled with Obsidian and have no separate version
     * @returns Always null for Lucide provider
     */
    getVersion(): string | null {
        return null;
    }

    /**
     * Checks if the Lucide provider is available.
     * Verifies that Obsidian's icon APIs are accessible.
     */
    isAvailable(): boolean {
        return typeof getIconIds === 'function' && typeof setIcon === 'function';
    }

    /**
     * Renders a Lucide icon into the specified container.
     *
     * All callers pass canonical identifiers. Obsidian accepts these values
     * directly (no prefix required), so we simply forward the normalized ID
     * to keep the rest of the codebase prefix-agnostic.
     *
     * @param container - The HTML element to render the icon into
     * @param iconId - The Lucide icon identifier (e.g., 'folder', 'file-text')
     * @param size - Optional size in pixels for the icon
     */
    render(container: HTMLElement, iconId: string, size?: number): IconRenderResult {
        resetIconContainer(container);
        const canonicalId = this.normalizeIconId(iconId);
        if (!canonicalId) {
            return 'not-found';
        }
        setIcon(container, canonicalId);

        if (size) {
            // Using inline styles here because size is dynamic and passed as parameter
            // CSS classes cannot handle arbitrary pixel values
            container.style.setProperty('--icon-size', `${size}px`);
            container.style.width = `${size}px`;
            container.style.height = `${size}px`;
        } else {
            container.style.removeProperty('--icon-size');
            container.style.removeProperty('width');
            container.style.removeProperty('height');
        }

        return container.childElementCount > 0 ? 'rendered' : 'not-found';
    }

    /**
     * Searches for Lucide icons based on a query string.
     * Searches both icon names and associated keywords.
     *
     * `getIconIds()` always returns prefixed identifiers. We normalize them
     * at the start of the loop so the search logic and results remain canonical.
     *
     * @param query - The search query
     * @returns Array of all matching icon definitions, best match first
     */
    search(query: string): IconDefinition[] {
        const normalizedQuery = query.toLowerCase().trim();

        if (!normalizedQuery) {
            return [];
        }

        const allIcons = this.getIconList();
        // Collect all matching icons with relevance scores
        const matches: { icon: IconDefinition; score: number; name: string; id: string }[] = [];

        for (const id of allIcons) {
            const canonicalId = this.normalizeIconId(id);
            const keywords = this.getKeywords(canonicalId);
            const normalizedKeywords = keywords.map(keyword => keyword.toLowerCase());
            const displayName = this.formatDisplayName(canonicalId);
            const normalizedId = canonicalId.toLowerCase();
            const normalizedDisplay = displayName.toLowerCase();
            // Calculate match relevance score (lower score = better match)
            const score = this.resolveMatchScore(normalizedQuery, normalizedId, normalizedDisplay, normalizedKeywords);

            if (score === null) {
                continue; // No match found
            }

            matches.push({
                icon: {
                    id: canonicalId,
                    displayName,
                    keywords
                },
                score,
                name: normalizedDisplay || normalizedId,
                id: canonicalId
            });
        }

        // Sort matches by relevance score, then alphabetically
        matches.sort((a, b) => {
            // Primary sort: by relevance score (lower is better)
            if (a.score !== b.score) {
                return a.score - b.score;
            }

            // Secondary sort: alphabetically by display name
            const nameCompare = a.name.localeCompare(b.name);
            if (nameCompare !== 0) {
                return nameCompare;
            }

            // Tertiary sort: alphabetically by ID
            return a.id.localeCompare(b.id);
        });

        return matches.map(match => match.icon);
    }

    /**
     * Gets all available Lucide icons.
     *
     * The raw Obsidian list carries prefixes, but consumers expect canonical IDs.
     * Normalizing here means contexts like the icon picker, metadata services,
     * and storage always receive the same identifier format.
     *
     * @returns Array of all Lucide icon definitions with formatted names and keywords
     */
    getAll(): IconDefinition[] {
        const allIcons = this.getIconList();

        return allIcons.map(id => {
            const canonicalId = this.normalizeIconId(id);
            return {
                id: canonicalId,
                displayName: this.formatDisplayName(canonicalId),
                keywords: this.getKeywords(canonicalId)
            };
        });
    }

    /**
     * Gets the list of available Lucide icons, including icons other plugins registered with `addIcon()`.
     *
     * Reads the snapshot shared with frontmatter parsing, so every icon the picker lists can also be
     * written to and read from frontmatter.
     */
    private getIconList(): readonly string[] {
        return getRegisteredIconIds();
    }

    /**
     * Formats an icon ID for user-friendly display.
     * Converts kebab-case to Title Case.
     *
     * @param iconId - The icon identifier (e.g., 'file-text')
     * @returns Formatted name (e.g., 'File Text')
     */
    private formatDisplayName(iconId: string): string {
        return iconId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Generates keywords for an icon based on its ID.
     * Includes synonyms and related terms for better search results.
     *
     * @param iconId - The icon identifier
     * @returns Array of keywords including synonyms
     */
    private getKeywords(iconId: string): string[] {
        const keywords = iconId.split('-');

        const keywordMap: Record<string, string[]> = {
            folder: ['directory', 'container'],
            file: ['document', 'page'],
            tag: ['label', 'category'],
            search: ['find', 'query'],
            star: ['favorite', 'bookmark'],
            heart: ['love', 'like', 'favorite'],
            home: ['house', 'main'],
            settings: ['config', 'preferences', 'gear'],
            user: ['person', 'account', 'profile'],
            calendar: ['date', 'schedule'],
            clock: ['time', 'watch'],
            mail: ['email', 'message', 'envelope'],
            phone: ['call', 'mobile'],
            trash: ['delete', 'bin', 'remove'],
            edit: ['modify', 'change', 'pencil'],
            plus: ['add', 'new', 'create'],
            check: ['done', 'complete', 'tick'],
            x: ['close', 'cancel', 'remove'],
            arrow: ['direction', 'pointer'],
            chevron: ['expand', 'collapse'],
            grid: ['layout', 'dashboard'],
            list: ['items', 'menu'],
            image: ['picture', 'photo'],
            video: ['movie', 'film'],
            music: ['audio', 'sound'],
            book: ['read', 'library'],
            bookmark: ['save', 'mark'],
            download: ['save', 'get'],
            upload: ['send', 'put'],
            share: ['send', 'distribute'],
            link: ['url', 'connection'],
            lock: ['secure', 'private'],
            unlock: ['open', 'public'],
            eye: ['view', 'see', 'visible'],
            alert: ['warning', 'attention'],
            info: ['information', 'help'],
            question: ['help', 'ask'],
            zap: ['lightning', 'fast', 'energy'],
            sun: ['light', 'day', 'bright'],
            moon: ['night', 'dark'],
            cloud: ['weather', 'storage'],
            globe: ['world', 'internet', 'web'],
            map: ['location', 'navigate'],
            pin: ['location', 'mark', 'attach'],
            flag: ['mark', 'country', 'report'],
            bell: ['notification', 'alert', 'ring'],
            message: ['chat', 'talk', 'comment'],
            code: ['programming', 'develop'],
            terminal: ['console', 'command'],
            database: ['storage', 'data'],
            server: ['host', 'backend'],
            cpu: ['processor', 'computer'],
            wifi: ['internet', 'wireless', 'network'],
            battery: ['power', 'charge'],
            printer: ['print', 'document'],
            camera: ['photo', 'capture'],
            mic: ['microphone', 'audio', 'record']
        };

        const additionalKeywords: string[] = [];
        keywords.forEach(keyword => {
            if (keywordMap[keyword]) {
                additionalKeywords.push(...keywordMap[keyword]);
            }
        });

        return [...keywords, ...additionalKeywords];
    }

    /**
     * Converts Obsidian's prefixed identifier into the canonical form.
     * The rest of the plugin always works with these normalized values.
     */
    private normalizeIconId(iconId: string): string {
        if (!iconId) {
            return iconId;
        }

        const trimmed = iconId.trim();
        if (!trimmed) {
            return trimmed;
        }

        return trimmed.startsWith(LUCIDE_PREFIX) ? trimmed.substring(LUCIDE_PREFIX.length) : trimmed;
    }

    /**
     * Calculates a relevance score for how well an icon matches a search query
     * Lower scores indicate better matches
     * @param query - The search query (normalized to lowercase)
     * @param iconId - The icon ID (normalized to lowercase)
     * @param displayName - The display name (normalized to lowercase)
     * @param keywords - Array of keywords (normalized to lowercase)
     * @returns Score from 0-8 (lower is better) or null if no match
     */
    private resolveMatchScore(query: string, iconId: string, displayName: string, keywords: string[]): number | null {
        // Exact matches (highest priority)
        if (iconId === query) {
            return 0;
        }
        if (displayName && displayName === query) {
            return 1;
        }
        if (keywords.includes(query)) {
            return 2;
        }
        // Prefix matches (high priority)
        if (iconId.startsWith(query)) {
            return 3;
        }
        if (displayName && displayName.startsWith(query)) {
            return 4;
        }
        if (keywords.some(keyword => keyword.startsWith(query))) {
            return 5;
        }
        // Substring matches (lower priority)
        if (iconId.includes(query)) {
            return 6;
        }
        if (displayName && displayName.includes(query)) {
            return 7;
        }
        if (keywords.some(keyword => keyword.includes(query))) {
            return 8;
        }
        // No match found
        return null;
    }
}
