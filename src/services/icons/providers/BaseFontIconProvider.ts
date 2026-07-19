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
import { IconAssetRecord } from '../external/IconAssetDatabase';
import { getIconRenderToken, resetIconContainer } from './providerUtils';

export interface BaseFontIconProviderOptions {
    record: IconAssetRecord;
    fontFamily: string;
}

interface IconLookupEntry {
    unicode: string;
    keywords: string[];
}

interface ManagedFontFaceSet {
    add: (font: FontFace) => void;
    delete: (font: FontFace) => boolean;
    has: (font: FontFace) => boolean;
}

interface FontDocumentState {
    fontFace: FontFace;
    fontSet: ManagedFontFaceSet;
    ownerWindow: Window;
    handlePageHide: () => void;
    ready: Promise<FontFace>;
}

/**
 * Base class for icon providers that use web fonts.
 */
export abstract class BaseFontIconProvider implements IconProvider {
    abstract readonly id: string;
    abstract readonly name: string;

    private readonly fontFamily: string;
    private readonly fontData: ArrayBuffer;
    private readonly version: string | null;
    private readonly documentStates = new Map<Document, FontDocumentState>();
    private isDisposed = false;

    protected iconDefinitions: IconDefinition[] = [];
    protected iconLookup: Map<string, IconLookupEntry> = new Map();

    constructor(options: BaseFontIconProviderOptions) {
        this.fontFamily = options.fontFamily;
        this.fontData = options.record.data;
        this.version = options.record?.version ?? null;
        this.parseMetadata(options.record.metadata);
    }

    /**
     * Removes every document-owned face when the provider is unregistered. Pending parses may finish, but the
     * disposed-state check prevents them from becoming usable or being reattached afterward.
     */
    dispose(): void {
        if (this.isDisposed) {
            return;
        }
        this.isDisposed = true;

        Array.from(this.documentStates.entries()).forEach(([document, state]) => {
            this.releaseDocumentState(document, state);
        });
    }

    isAvailable(): boolean {
        return this.iconDefinitions.length > 0;
    }

    /**
     * Loads and registers this provider's font in a specific document.
     *
     * Resolves after the document can use the face. Rejects when construction, parsing, registration, or disposal
     * prevents that document from using it. No glyph is rendered or provider state persisted by this method.
     */
    async prepare(document: Document): Promise<void> {
        const state = this.getOrCreateDocumentState(document);
        await state.ready;
        if (this.isDisposed || this.documentStates.get(document) !== state) {
            throw new Error(`${this.getLogPrefix()} Font load completed after its document state was released`);
        }
        if (!state.fontSet.has(state.fontFace)) {
            throw new Error(`${this.getLogPrefix()} Font face is unavailable in the target document`);
        }
    }

    /**
     * Renders an icon after the container's owner document has its own loaded font face.
     */
    render(container: HTMLElement, iconId: string, size?: number): IconRenderResult | Promise<IconRenderResult> {
        const icon = this.iconLookup.get(iconId);
        resetIconContainer(container);
        if (!icon) {
            return 'not-found';
        }

        const token = getIconRenderToken(container);
        const state = this.getOrCreateDocumentState(container.ownerDocument);
        if (state.fontFace.status === 'loaded' && state.fontSet.has(state.fontFace)) {
            this.renderLoadedIcon(container, icon.unicode, size);
            return 'rendered';
        }

        return state.ready.then(() => {
            if (
                this.isDisposed ||
                this.documentStates.get(container.ownerDocument) !== state ||
                !state.fontSet.has(state.fontFace) ||
                (token && getIconRenderToken(container) !== token)
            ) {
                return 'not-found';
            }
            this.renderLoadedIcon(container, icon.unicode, size);
            return 'rendered';
        });
    }

    /**
     * Searches icons by display name and keywords.
     */
    search(query: string): IconDefinition[] {
        const normalized = query.trim().toLowerCase();
        if (!normalized) {
            return [];
        }

        // Collect all matching icons with relevance scores
        const matches: { icon: IconDefinition; score: number; name: string; id: string }[] = [];

        for (const icon of this.iconDefinitions) {
            const lookupEntry = this.iconLookup.get(icon.id);
            const keywords = lookupEntry?.keywords ?? [];
            const normalizedKeywords = keywords.map(keyword => keyword.toLowerCase());
            const displayName = icon.displayName?.toLowerCase() ?? '';
            const iconId = icon.id.toLowerCase();
            // Calculate match relevance score (lower score = better match)
            const score = this.resolveMatchScore(normalized, iconId, displayName, normalizedKeywords);

            if (score === null) {
                continue; // No match found
            }

            matches.push({
                icon,
                score,
                name: displayName || iconId,
                id: icon.id
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

    getAll(): IconDefinition[] {
        return this.iconDefinitions;
    }

    /**
     * Returns the provider version from the loaded icon pack metadata
     * @returns Version string or null if no version available
     */
    getVersion(): string | null {
        return this.version;
    }

    protected abstract parseMetadata(raw: string): void;

    protected abstract getCssClass(): string;

    /**
     * Sets the icon definitions and lookup map from parsed metadata.
     */
    protected setIconData(definitions: IconDefinition[], lookup: Map<string, IconLookupEntry>): void {
        this.iconDefinitions = definitions;
        this.iconLookup = lookup;
    }

    /**
     * Clears all icon data when parsing fails.
     */
    protected clearIconData(): void {
        this.iconDefinitions = [];
        this.iconLookup.clear();
    }

    protected logParseError(message: string, error: unknown): void {
        console.error(`${this.getLogPrefix()} ${message}`, error);
    }

    /**
     * Creates one face with the owner document's constructor because each document has an independent font source.
     * The state is stored before the promise settles so concurrent icon renders share the same parse operation.
     */
    private getOrCreateDocumentState(document: Document): FontDocumentState {
        if (this.isDisposed) {
            throw new Error(`${this.getLogPrefix()} Cannot load a disposed font provider`);
        }

        const existing = this.documentStates.get(document);
        if (existing) {
            return existing;
        }

        const ownerWindow = document.defaultView;
        const fontFaceConstructor = ownerWindow?.FontFace;
        const fontSet = document.fonts as unknown as ManagedFontFaceSet | undefined;
        let fontFace: FontFace;

        try {
            if (!fontFaceConstructor) {
                throw new Error('FontFace constructor is unavailable in the target document');
            }
            if (typeof fontSet?.add !== 'function') {
                throw new Error('FontFaceSet.add is unavailable in the target document');
            }
            if (typeof fontSet.delete !== 'function' || typeof fontSet.has !== 'function') {
                throw new Error('FontFaceSet lifecycle methods are unavailable in the target document');
            }

            fontFace = new fontFaceConstructor(this.fontFamily, this.fontData);
            fontSet.add(fontFace);
        } catch (error) {
            console.error(`${this.getLogPrefix()} Failed to create font face`, error);
            throw error;
        }

        let loadPromise: Promise<FontFace>;
        try {
            loadPromise = fontFace.load();
        } catch (error) {
            fontSet.delete(fontFace);
            console.error(`${this.getLogPrefix()} Failed to load font`, error);
            throw error;
        }
        const handlePageHide = () => {
            this.releaseDocumentState(document, state);
        };
        const state: FontDocumentState = {
            fontFace,
            fontSet,
            ownerWindow,
            handlePageHide,
            ready: loadPromise
        };
        this.documentStates.set(document, state);
        // Popout documents can close while the provider remains active. Releasing their faces here prevents the
        // provider map from retaining the closed window and its DOM until the pack is disabled.
        ownerWindow.addEventListener('pagehide', handlePageHide, { once: true });

        state.ready = loadPromise
            .then(loaded => {
                if (this.isDisposed || this.documentStates.get(document) !== state) {
                    state.fontSet.delete(loaded);
                }
                return loaded;
            })
            .catch(error => {
                state.fontSet.delete(fontFace);
                console.error(`${this.getLogPrefix()} Failed to load font`, error);
                throw error;
            });

        return state;
    }

    /**
     * Removes one document-owned face and listener. The identity check keeps late cleanup from deleting a newer state
     * created for the same document after pagehide processing.
     */
    private releaseDocumentState(document: Document, state: FontDocumentState): void {
        if (this.documentStates.get(document) === state) {
            this.documentStates.delete(document);
        }
        state.ownerWindow.removeEventListener('pagehide', state.handlePageHide);
        try {
            state.fontSet.delete(state.fontFace);
        } catch (error) {
            console.error(`${this.getLogPrefix()} Failed to delete font face`, error);
        }
    }

    private renderLoadedIcon(container: HTMLElement, unicode: string, size: number | undefined): void {
        container.addClass('nn-iconfont');
        container.addClass(this.getCssClass());
        container.setText(this.unicodeToGlyph(unicode));

        if (size) {
            container.style.fontSize = `${size}px`;
            container.style.width = `${size}px`;
            container.style.height = `${size}px`;
            container.style.lineHeight = `${size}px`;
        } else {
            container.style.removeProperty('font-size');
            container.style.removeProperty('width');
            container.style.removeProperty('height');
            container.style.removeProperty('line-height');
        }
    }

    /**
     * Converts a hex unicode string to its corresponding character.
     */
    private unicodeToGlyph(unicode: string): string {
        try {
            return String.fromCodePoint(parseInt(unicode, 16));
        } catch {
            return '';
        }
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

    private getLogPrefix(): string {
        return `[${this.name}]`;
    }
}
