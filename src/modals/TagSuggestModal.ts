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

import { App, FuzzyMatch } from 'obsidian';
import { strings } from '../i18n';
import { TagTreeNode } from '../types/storage';
import { getTotalNoteCount } from '../utils/tagTree';
import { BaseSuggestModal } from './BaseSuggestModal';
import NotebookNavigatorPlugin from '../main';
import { alphanumericCompare } from 'src/utils/sortUtils'

/**
 * Modal for selecting a tag to navigate to
 * Uses Obsidian's FuzzySuggestModal for fuzzy search and familiar UI
 */
export class TagSuggestModal extends BaseSuggestModal<TagTreeNode> {
    private includeUntagged: boolean;
    private untaggedNode: TagTreeNode;
    private plugin: NotebookNavigatorPlugin;
    private currentInput: string = '';
    private createNewNode: TagTreeNode | null = null;

    /**
     * Creates a new TagSuggestModal
     * @param app - The Obsidian app instance
     * @param plugin - The NotebookNavigator plugin instance
     * @param onChooseTag - Callback when a tag is selected
     * @param placeholderText - Placeholder text for the search input
     * @param actionText - Action text for the enter key instruction
     * @param includeUntagged - Whether to include "Untagged" option
     */
    constructor(
        app: App,
        plugin: NotebookNavigatorPlugin,
        onChooseTag: (tag: string) => void,
        placeholderText: string,
        actionText: string,
        includeUntagged: boolean = true
    ) {
        // Pass tag node to base, but store the string callback separately
        super(
            app,
            (tagNode: TagTreeNode) => {
                // Handle special cases
                if (tagNode.path === '__create_new__' && this.currentInput) {
                    onChooseTag(this.currentInput);
                } else if (tagNode.path === '__untagged__') {
                    onChooseTag(tagNode.path);
                } else {
                    // Use displayPath to preserve canonical casing
                    onChooseTag(tagNode.displayPath);
                }
            },
            placeholderText,
            {
                navigate: strings.modals.tagSuggest.instructions.navigate,
                action: actionText,
                dismiss: strings.modals.tagSuggest.instructions.dismiss
            }
        );
        this.plugin = plugin;
        this.includeUntagged = includeUntagged;

        // Create special untagged node
        this.untaggedNode = {
            name: strings.common.untagged,
            path: '__untagged__',
            displayPath: '__untagged__',
            children: new Map(),
            notesWithTag: new Set()
        };
    }

    /**
     * Validates if a tag name is valid
     * Only allows letters, numbers, hyphens, underscores, and forward slashes
     * @param tagName - The tag name to validate
     * @returns Whether the tag name is valid
     */
    private isValidTagName(tagName: string): boolean {
        if (!tagName || tagName.trim() === '') return false;

        // Check for invalid characters (anything other than alphanumeric, -, _, /)
        const validTagRegex = /^[a-zA-Z0-9\-_/]+$/;
        return validTagRegex.test(tagName);
    }

    /**
     * Override getSuggestions to add "Create new tag" option when appropriate
     */
    getSuggestions(query: string): FuzzyMatch<TagTreeNode>[] {
        this.currentInput = query.trim();

        // Get the default suggestions
        const suggestions = super.getSuggestions(query);

        // If query is empty or invalid, don't show create option
        if (!this.currentInput || !this.isValidTagName(this.currentInput)) {
            return suggestions;
        }

        // Check if an exact match already exists (case-insensitive)
        const lowerInput = this.currentInput.toLowerCase();
        const exactMatch = suggestions.find(s => s.item.path === lowerInput);
        if (exactMatch) {
            return suggestions;
        }

        // Create the "Create new tag" node
        this.createNewNode = {
            name: strings.modals.tagSuggest.createNewTag.replace('{tag}', this.currentInput),
            path: '__create_new__',
            displayPath: '__create_new__',
            children: new Map(),
            notesWithTag: new Set()
        };

        // Add it to the beginning of the list
        const createMatch: FuzzyMatch<TagTreeNode> = {
            item: this.createNewNode,
            match: {
                score: -1, // High priority
                matches: []
            }
        };

        return [createMatch, ...suggestions];
    }

    /**
     * Gets all tags in the vault as a flat list
     * @returns Array of tag nodes available for selection
     */
    getItems(): TagTreeNode[] {
        const tags: TagTreeNode[] = [];

        // Add untagged option if enabled
        if (this.includeUntagged) {
            tags.push(this.untaggedNode);
        }

        // Get all tag paths from the TagTreeService (includes both favorite and regular tags)
        const allTagPaths = this.plugin.tagTreeService?.getAllTagPaths() || [];

        // Convert paths to nodes
        for (const tagPath of allTagPaths) {
            const node = this.plugin.tagTreeService?.findTagNode(tagPath);
            if (node && !tags.some(t => t.path === node.path)) {
                tags.push(node);
            }
        }

        // Sort tags alphabetically by path
        tags.sort((a, b) => {
            // Keep untagged at the top
            if (a.path === '__untagged__') return -1;
            if (b.path === '__untagged__') return 1;
            return alphanumericCompare(a.path, b.path);
        });

        return tags;
    }

    /**
     * Gets the display text for a tag
     * Shows the full path with # prefix and note count
     * @param tag - The tag node to get text for
     * @returns The display text
     */
    getItemText(tag: TagTreeNode): string {
        if (tag.path === '__untagged__') {
            return tag.name;
        }
        if (tag.path === '__create_new__') {
            return this.currentInput; // Return the input for fuzzy matching
        }
        // Return displayPath with # prefix for fuzzy matching
        return `#${tag.displayPath}`;
    }

    /**
     * Gets the display path for a tag
     * @param tag - The tag to get display path for
     * @returns The path to display
     */
    protected getDisplayPath(tag: TagTreeNode): string {
        if (tag.path === '__untagged__') {
            return tag.name;
        }
        if (tag.path === '__create_new__') {
            return tag.name; // Already contains the full text
        }
        // Show tag with # prefix using displayPath for correct casing
        return `#${tag.displayPath}`;
    }

    /**
     * Gets the CSS class for tag items
     * @returns The CSS class name
     */
    protected getItemClass(): string {
        return 'nn-tag-suggest-item';
    }

    /**
     * Renders additional content for a tag
     * @param tag - The tag being rendered
     * @param itemEl - The container element
     */
    protected renderAdditionalContent(tag: TagTreeNode, itemEl: HTMLElement): void {
        // Special class for untagged
        if (tag.path === '__untagged__') {
            itemEl.addClass('nn-tag-suggest-untagged');
        }

        // Don't add note count for create new tag
        if (tag.path === '__create_new__') {
            return;
        }

        // Add note count
        const noteCount = getTotalNoteCount(tag);
        if (noteCount > 0) {
            itemEl.createSpan({
                text: ` (${noteCount})`,
                cls: 'nn-tag-suggest-count'
            });
        }
    }
}
