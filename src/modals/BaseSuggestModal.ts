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

import { App, FuzzySuggestModal, FuzzyMatch, prepareSimpleSearch, renderMatches } from 'obsidian';
import { runAsyncAction, type MaybePromise } from '../utils/async';

/**
 * Configuration for modal instructions
 */
export interface ModalInstructions {
    navigate: string;
    action: string;
    dismiss: string;
}

/**
 * Base class for suggest modals in Notebook Navigator
 * Provides common functionality for fuzzy search modals
 * @template T - The type of items being searched
 */
export abstract class BaseSuggestModal<T> extends FuzzySuggestModal<T> {
    protected onChooseCallback: (item: T) => MaybePromise;

    /**
     * Creates a new BaseSuggestModal
     * @param app - The Obsidian app instance
     * @param onChoose - Callback when an item is selected
     * @param placeholderText - Placeholder text for the search input
     * @param instructions - Instructions to display in the modal
     */
    constructor(app: App, onChoose: (item: T) => MaybePromise, placeholderText: string, instructions: ModalInstructions) {
        super(app);
        this.onChooseCallback = onChoose;

        // Set placeholder text
        this.setPlaceholder(placeholderText);

        // Set instructions
        this.setInstructions([
            { command: '↑↓', purpose: instructions.navigate },
            { command: '↵', purpose: instructions.action },
            { command: 'esc', purpose: instructions.dismiss }
        ]);
    }

    /**
     * Provides a unique key for an item to avoid duplicate suggestions
     * @param item - The item to identify
     * @returns Unique string key for the item
     */
    protected getItemKey(item: T): string {
        return this.getItemText(item);
    }

    /**
     * Overrides fuzzy suggestions to add multi-token matching support using simple search
     * @param query - User input query string
     * @returns Array of matched items with highlight data
     */
    getSuggestions(query: string): FuzzyMatch<T>[] {
        const baseSuggestions = super.getSuggestions(query);
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            return baseSuggestions;
        }

        const tokens = trimmedQuery.split(/\s+/u).filter(Boolean);
        if (tokens.length <= 1) {
            return baseSuggestions;
        }

        const simpleSearch = prepareSimpleSearch(trimmedQuery);
        const seenKeys = new Set(baseSuggestions.map(result => this.getItemKey(result.item)));
        const additionalMatches: FuzzyMatch<T>[] = [];

        for (const item of this.getItems()) {
            const key = this.getItemKey(item);
            if (seenKeys.has(key)) {
                continue;
            }

            const match = simpleSearch(this.getItemText(item));
            if (match) {
                additionalMatches.push({ item, match });
            }
        }

        if (additionalMatches.length === 0) {
            return baseSuggestions;
        }

        // Fuzzy and simple search share Obsidian's scoring, where values closer to 0 are better
        // matches, so sort descending like Obsidian's sortSearchResults.
        const combined = [...baseSuggestions, ...additionalMatches];
        combined.sort((a, b) => b.match.score - a.match.score);
        return combined;
    }

    /**
     * Gets all items available for selection
     * Must be implemented by subclasses
     * @returns Array of items available for selection
     */
    abstract getItems(): T[];

    /**
     * Gets the display text for an item
     * Must be implemented by subclasses
     * @param item - The item to get text for
     * @returns The display text for fuzzy matching
     */
    abstract getItemText(item: T): string;

    /**
     * Gets the display path for an item
     * Can be overridden by subclasses for custom display
     * @param item - The item to get display path for
     * @returns The path to display in the suggestion
     */
    protected abstract getDisplayPath(item: T): string;

    /**
     * Gets the CSS class for the item container
     * Can be overridden by subclasses
     * @returns The CSS class name
     */
    protected getItemClass(): string {
        return 'nn-suggest-item';
    }

    /**
     * Renders additional content for an item
     * Can be overridden by subclasses to add extra elements
     * @param item - The item being rendered
     * @param itemEl - The container element
     */
    protected renderAdditionalContent(_item: T, _itemEl: HTMLElement): void {
        // Default implementation does nothing
        // Subclasses can override to add note counts, icons, etc.
    }

    /**
     * Renders an item in the suggestion list
     * @param match - The fuzzy match result containing the item
     * @param el - The element to render into
     */
    renderSuggestion(match: FuzzyMatch<T>, el: HTMLElement): void {
        const item = match.item;

        // Create a container div
        const itemEl = el.createDiv({ cls: this.getItemClass() });

        // Get display path
        const displayPath = this.getDisplayPath(item);

        // Use renderMatches to render the text with highlights
        renderMatches(itemEl, displayPath, match.match.matches);

        // Allow subclasses to add additional content
        this.renderAdditionalContent(item, itemEl);
    }

    /**
     * Called when an item is selected
     * @param item - The selected item
     * @param evt - The triggering event
     */
    onChooseItem(item: T, _evt: MouseEvent | KeyboardEvent): void {
        // Execute the callback asynchronously to support async handlers
        runAsyncAction(() => this.onChooseCallback(item));
    }
}
