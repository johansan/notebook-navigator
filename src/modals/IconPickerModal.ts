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

import { App, Modal, TFile } from 'obsidian';
import * as emojilib from 'emojilib';
import { strings } from '../i18n';
import { getIconService, IconDefinition, IconProvider, RECENT_ICONS_PER_PROVIDER_LIMIT } from '../services/icons';
import { getProviderCatalogUrl } from '../services/icons/providerCatalogLinks';
import { isVaultIconFile } from '../services/icons/providers/VaultIconProvider';
import { MetadataService } from '../services/MetadataService';
import { ItemType } from '../types';
import { TIMEOUTS } from '../types/obsidian-extended';
import { ISettingsProvider } from '../interfaces/ISettingsProvider';
import { runAsyncAction } from '../utils/async';
import { addAsyncEventListener } from '../utils/domEventListeners';
import { parsePropertyNodeId } from '../utils/propertyTree';
import { isRecord } from '../utils/typeGuards';

// Constants
const GRID_COLUMNS = 5;
const MAX_SEARCH_RESULTS = 50;
const ALL_PROVIDERS_TAB_ID = 'all';
const VAULT_PROVIDER_ID = 'vault';

/** Result returned by external icon selection handlers */
interface IconSelectionHandlerResult {
    handled: boolean;
}

/** Configuration options for the icon picker modal */
interface IconPickerModalOptions {
    /** Custom title to display in the modal header */
    titleOverride?: string;
    /** Pre-selected icon identifier to highlight */
    currentIconId?: string | null;
    /** Whether to display the remove icon button (defaults to true) */
    showRemoveButton?: boolean;
    /** When true, icon selection does not persist to metadata service */
    disableMetadataUpdates?: boolean;
}

// Type guard to validate emoji keywords from emojilib are strings
function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
}

/**
 * Icon picker modal with tabs for icon providers.
 */
export class IconPickerModal extends Modal {
    private currentProvider: string = ALL_PROVIDERS_TAB_ID;
    private static lastUsedProvider: string | null = null; // Shared session default
    private iconService = getIconService();
    private itemPath: string;
    private itemType: typeof ItemType.FOLDER | typeof ItemType.TAG | typeof ItemType.PROPERTY | typeof ItemType.FILE;
    private metadataService: MetadataService;
    private settingsProvider: ISettingsProvider;
    private titleOverride?: string;
    private showRemoveButton: boolean;
    private disableMetadataUpdates: boolean;
    /** Callback function invoked when an icon is selected */
    public onChooseIcon?: (iconId: string | null) => IconSelectionHandlerResult | Promise<IconSelectionHandlerResult>;
    private resultsContainer!: HTMLDivElement;
    private searchDebounceTimer: number | null = null;
    private searchInput!: HTMLInputElement;

    private tabContainer!: HTMLDivElement;
    private domDisposers: (() => void)[] = [];
    private providerTabs: HTMLElement[] = [];
    private currentIcon: string | undefined;
    private removeButton: HTMLButtonElement | null = null;
    private providerLinkContainer: HTMLDivElement | null = null;
    private providerLinkEl: HTMLAnchorElement | null = null;
    // Container the picker UI is built into. Defaults to contentEl; an embedding
    // host (AppearanceModal) supplies its own container via mountEmbedded().
    private rootEl!: HTMLElement;
    private embedded = false;
    private onSelectCallback?: (iconId: string | null) => void;
    private cleared = false;

    public static getLastUsedProvider(): string | null {
        return IconPickerModal.lastUsedProvider;
    }

    public static setLastUsedProvider(providerId: string | null): void {
        IconPickerModal.lastUsedProvider = providerId;
    }

    constructor(
        app: App,
        metadataService: MetadataService,
        itemPath: string,
        itemType: typeof ItemType.FOLDER | typeof ItemType.TAG | typeof ItemType.PROPERTY | typeof ItemType.FILE = ItemType.FOLDER,
        options: IconPickerModalOptions = {}
    ) {
        super(app);
        this.metadataService = metadataService;
        this.settingsProvider = metadataService.getSettingsProvider();
        this.itemPath = itemPath;
        this.itemType = itemType;
        this.titleOverride = options.titleOverride;
        this.showRemoveButton = options.showRemoveButton !== false;
        this.disableMetadataUpdates = options.disableMetadataUpdates === true;
        this.currentIcon =
            options.currentIconId === undefined && !this.disableMetadataUpdates
                ? this.getCurrentIconForItem()
                : (options.currentIconId ?? undefined);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        this.modalEl.addClass('nn-icon-picker-modal');
        this.rootEl = contentEl;
        this.cleanupVaultRecentIcons();

        // Header showing the folder/tag name
        const header = contentEl.createDiv('nn-icon-picker-header');
        const headerText = (() => {
            if (this.titleOverride) {
                return this.titleOverride;
            }

            if (this.itemType === ItemType.TAG) {
                return `#${this.itemPath}`;
            }

            if (this.itemType === ItemType.PROPERTY) {
                const parsed = parsePropertyNodeId(this.itemPath);
                if (parsed?.valuePath) {
                    return `${parsed.key} = ${parsed.valuePath}`;
                }
                if (parsed) {
                    return parsed.key;
                }
            }

            return this.itemPath.split('/').pop() || this.itemPath;
        })();
        header.createEl('h3', { text: headerText });

        this.attachCloseButtonHandler();

        this.buildPickerBody();

        if (this.showRemoveButton) {
            const buttonContainer = contentEl.createDiv('nn-icon-button-container');
            const removeButton = buttonContainer.createEl('button');
            const removeButtonLabel = strings.modals.iconPicker.removeIcon;
            removeButton.setText(removeButtonLabel);
            if (removeButton.instanceOf(HTMLButtonElement)) {
                this.removeButton = removeButton;
                if (!this.currentIcon) {
                    removeButton.disabled = true;
                }
            }
            this.domDisposers.push(addAsyncEventListener(removeButton, 'click', () => this.removeIcon()));
        }

        // Set up keyboard navigation
        this.setupKeyboardNavigation();

        // Focus search input
        this.searchInput.focus();
        if (typeof window !== 'undefined') {
            window.requestAnimationFrame(() => {
                this.searchInput.focus();
            });
        }

        // Show initial results
        this.updateResults();
    }

    /**
     * Mounts the icon picker UI (provider tabs, search, results) into an external
     * container for use inside AppearanceModal. No header, remove button, keyboard
     * navigation or metadata persistence; selecting an icon stages it via onSelect.
     */
    mountEmbedded(container: HTMLElement, options: { onSelect?: (iconId: string | null) => void } = {}): void {
        this.embedded = true;
        this.rootEl = container;
        this.onSelectCallback = options.onSelect;
        this.cleanupVaultRecentIcons();
        this.buildPickerBody();
        this.updateResults();
    }

    /**
     * Builds the provider tabs, search field, results container and provider link
     * into rootEl, and wires the search input. Shared by standalone and embedded modes.
     */
    private buildPickerBody(): void {
        // Create tabs for providers
        this.createProviderTabs();

        // Create search input
        const searchContainer = this.rootEl.createDiv('nn-icon-search-container');
        this.searchInput = searchContainer.createEl('input', {
            type: 'text',
            placeholder: strings.modals.iconPicker.searchPlaceholder,
            cls: 'nn-icon-search-input'
        });
        this.searchInput.setAttribute('enterkeyhint', 'done');

        // Create results container
        this.resultsContainer = this.rootEl.createDiv('nn-icon-results-container');
        this.domDisposers.push(addAsyncEventListener(this.resultsContainer, 'click', event => this.handleResultsClick(event)));
        this.createProviderLinkRow();
        this.updateProviderLink(this.currentProvider);

        // Search input with debouncing
        this.domDisposers.push(
            addAsyncEventListener(this.searchInput, 'input', () => {
                if (this.searchDebounceTimer) {
                    window.clearTimeout(this.searchDebounceTimer);
                }
                this.searchDebounceTimer = window.setTimeout(() => {
                    this.updateResults();
                }, TIMEOUTS.DEBOUNCE_KEYBOARD);
            })
        );
    }

    private async handleResultsClick(event: MouseEvent): Promise<void> {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const removeButton = target.closest<HTMLButtonElement>('.nn-icon-recent-remove-button');
        if (removeButton) {
            event.stopPropagation();
            event.preventDefault();
            const iconId = removeButton.getAttribute('data-recent-icon-id');
            if (iconId) {
                this.removeRecentIcon(iconId);
            }
            return;
        }

        const iconItem = target.closest<HTMLElement>('.nn-icon-item');
        if (!iconItem) {
            return;
        }

        const iconId = iconItem.getAttribute('data-icon-id');
        if (!iconId) {
            return;
        }

        await this.selectIcon(iconId);
    }

    private createProviderTabs() {
        this.tabContainer = this.rootEl.createDiv('nn-icon-provider-tabs');
        this.tabContainer.setAttribute('role', 'tablist');
        this.providerTabs = [];

        const providers = this.sortProvidersForDisplay(this.iconService.getAllProviders().slice());
        const resolvedProviderId = this.resolveInitialProvider(providers);
        this.currentProvider = resolvedProviderId;
        IconPickerModal.setLastUsedProvider(resolvedProviderId);

        this.addProviderTab(ALL_PROVIDERS_TAB_ID, strings.modals.iconPicker.allTabLabel);

        providers.forEach(provider => {
            this.addProviderTab(provider.id, provider.name);
        });

        this.setActiveProviderTab(resolvedProviderId);
    }

    private addProviderTab(providerId: string, label: string): void {
        if (!this.tabContainer) {
            return;
        }

        const tab = this.tabContainer.createDiv({
            cls: 'nn-icon-provider-tab',
            text: label
        });
        tab.setAttribute('role', 'tab');
        tab.setAttribute('tabindex', '-1');
        tab.dataset.providerId = providerId;
        this.providerTabs.push(tab);

        this.domDisposers.push(
            addAsyncEventListener(tab, 'click', () => {
                this.setActiveProviderTab(providerId);
                this.currentProvider = providerId;
                IconPickerModal.setLastUsedProvider(providerId);
                this.updateResults();
                this.resetResultsScroll();
            })
        );
    }

    /**
     * Creates the provider link row UI elements below the icon tabs
     */
    private createProviderLinkRow(): void {
        this.providerLinkContainer = this.rootEl.createDiv('nn-icon-provider-link-row');
        this.providerLinkEl = this.providerLinkContainer.createEl('a', { cls: 'nn-icon-provider-link' });
        this.providerLinkEl.setAttribute('target', '_blank');
        this.providerLinkEl.setAttribute('rel', 'noopener noreferrer');
        this.providerLinkContainer.addClass('nn-icon-provider-link-row-hidden');
    }

    /**
     * Sorts icon providers for display in the UI, prioritizing certain providers
     * @param providers - Array of icon providers to sort
     * @returns Sorted array with pinned providers first, then alphabetically
     */
    private sortProvidersForDisplay(providers: IconProvider[]): IconProvider[] {
        // Providers pinned to the start of the tab row.
        // Tab order: All, Vault, Emoji, Lucide, then remaining providers.
        const pinnedOrder = [VAULT_PROVIDER_ID, 'emoji', 'lucide'];
        return providers.sort((a, b) => {
            const aPinnedIndex = pinnedOrder.indexOf(a.id);
            const bPinnedIndex = pinnedOrder.indexOf(b.id);

            // Both providers are pinned - sort by their pinned order
            if (aPinnedIndex !== -1 && bPinnedIndex !== -1) {
                return aPinnedIndex - bPinnedIndex;
            }

            // Provider a is pinned - it comes first
            if (aPinnedIndex !== -1) {
                return -1;
            }

            // Provider b is pinned - it comes first
            if (bPinnedIndex !== -1) {
                return 1;
            }

            // Neither provider is pinned - sort alphabetically by name
            return a.name.localeCompare(b.name);
        });
    }

    /**
     * Removes missing or invalid vault icon entries from the recent icon list.
     */
    private cleanupVaultRecentIcons(): void {
        const recentIconsMap = this.settingsProvider.getRecentIcons();
        const recentVaultIconsValue = recentIconsMap[VAULT_PROVIDER_ID];
        const recentVaultIcons = Array.isArray(recentVaultIconsValue) ? recentVaultIconsValue : [];
        const hasInvalidType = recentVaultIconsValue !== undefined && !Array.isArray(recentVaultIconsValue);

        if (recentVaultIcons.length === 0 && !hasInvalidType) {
            return;
        }

        if (hasInvalidType) {
            delete recentIconsMap[VAULT_PROVIDER_ID];
            this.settingsProvider.setRecentIcons(recentIconsMap);
            return;
        }

        const validIcons: string[] = [];
        let didChange = false;

        recentVaultIcons.forEach(iconId => {
            if (typeof iconId !== 'string') {
                didChange = true;
                return;
            }

            const parsed = this.iconService.parseIconId(iconId);
            if (parsed.provider !== VAULT_PROVIDER_ID) {
                didChange = true;
                return;
            }

            const file = this.app.vault.getAbstractFileByPath(parsed.identifier);
            if (file instanceof TFile && isVaultIconFile(file)) {
                validIcons.push(iconId);
                return;
            }

            didChange = true;
        });

        if (!didChange) {
            return;
        }

        if (validIcons.length === 0) {
            delete recentIconsMap[VAULT_PROVIDER_ID];
        } else {
            recentIconsMap[VAULT_PROVIDER_ID] = validIcons;
        }

        this.settingsProvider.setRecentIcons(recentIconsMap);
    }

    private resolveInitialProvider(providers: IconProvider[]): string {
        if (!providers.length) {
            return ALL_PROVIDERS_TAB_ID;
        }

        const providerIds = new Set(providers.map(provider => provider.id));
        const candidates = [IconPickerModal.getLastUsedProvider(), this.currentProvider]; // Prefer stored selection

        for (const candidate of candidates) {
            if (!candidate) {
                continue;
            }
            if (candidate === ALL_PROVIDERS_TAB_ID) {
                return candidate;
            }
            if (providerIds.has(candidate)) {
                return candidate;
            }
        }

        return ALL_PROVIDERS_TAB_ID;
    }

    private searchAllProvidersExcludingVault(query: string): IconDefinition[] {
        // Excludes vault icons from the "All" tab search.
        const results: IconDefinition[] = [];
        this.iconService.getAllProviders().forEach(provider => {
            if (provider.id === VAULT_PROVIDER_ID) {
                return;
            }

            const providerResults = provider.search(query);
            results.push(
                ...providerResults.map(icon => ({
                    ...icon,
                    id: this.iconService.formatIconId(provider.id, icon.id)
                }))
            );
        });
        return results;
    }

    private updateResults() {
        this.resultsContainer.empty();

        const searchTerm = this.searchInput.value.toLowerCase().trim();
        const isAllProvider = this.currentProvider === ALL_PROVIDERS_TAB_ID;
        const provider = isAllProvider ? undefined : this.iconService.getProvider(this.currentProvider);

        if (searchTerm === '') {
            const hasRecents = isAllProvider ? false : this.renderRecentIcons();

            if (!hasRecents) {
                if (this.currentProvider === 'emoji') {
                    const emptyMessage = this.resultsContainer.createDiv('nn-icon-empty-message');
                    emptyMessage.setText(strings.modals.iconPicker.emojiInstructions);
                } else {
                    this.showEmptyState();
                }
            }
            return;
        }

        const results = isAllProvider
            ? this.searchAllProvidersExcludingVault(searchTerm)
            : this.iconService.search(searchTerm, this.currentProvider);

        if (results.length > 0 && (isAllProvider || provider)) {
            const grid = this.resultsContainer.createDiv('nn-icon-grid');

            results.slice(0, MAX_SEARCH_RESULTS).forEach(iconDef => {
                this.createIconItem(iconDef, grid, provider);
            });

            if (results.length > MAX_SEARCH_RESULTS) {
                const moreMessage = this.resultsContainer.createDiv('nn-icon-more-message');
                moreMessage.setText(strings.modals.iconPicker.showingResultsInfo.replace('{count}', results.length.toString()));
            }
            return;
        }

        this.showEmptyState(true);
    }

    /**
     * Renders recently used icons for the current provider
     * @returns true if any icons were rendered, false otherwise
     */
    private renderRecentIcons(): boolean {
        const recentIconsMap = this.settingsProvider.getRecentIcons();
        const recentIcons = recentIconsMap[this.currentProvider] || [];

        if (!recentIcons.length) {
            return false;
        }

        const header = this.resultsContainer.createDiv('nn-icon-section-header');
        header.setText(strings.modals.iconPicker.recentlyUsedHeader);
        const grid = this.resultsContainer.createDiv('nn-icon-grid');

        let rendered = 0;
        // Cache provider icons to avoid multiple getAll() calls
        const providerCache = new Map<string, IconDefinition[]>();

        recentIcons.forEach(iconId => {
            const parsed = this.iconService.parseIconId(iconId);
            const provider = this.iconService.getProvider(parsed.provider);
            if (!provider) {
                return;
            }

            // Special handling for emoji provider - create icon definition on the fly
            if (provider.id === 'emoji') {
                let displayName = '';
                // Look up emoji keywords from emojilib with type safety
                const emojiLibValue: unknown = emojilib;
                const emojiEntries = isRecord(emojiLibValue) ? Object.entries(emojiLibValue) : [];
                for (const [emoji, keywords] of emojiEntries) {
                    if (emoji === parsed.identifier && isStringArray(keywords)) {
                        displayName = keywords[0] ?? '';
                        break;
                    }
                }

                const iconDef = {
                    id: parsed.identifier,
                    displayName,
                    preview: parsed.identifier
                };
                const iconItem = this.createIconItem(iconDef, grid, provider);
                if (iconItem) {
                    this.addRecentIconRemoveButton(iconItem, iconId);
                }
                rendered += 1;
                return;
            }

            // For non-emoji providers, look up icon from cached provider data
            let icons = providerCache.get(provider.id);
            if (!icons) {
                icons = provider.getAll();
                providerCache.set(provider.id, icons);
            }

            const iconDef = icons.find(icon => icon.id === parsed.identifier);
            if (!iconDef) {
                return;
            }

            const iconItem = this.createIconItem(iconDef, grid, provider);
            if (iconItem) {
                this.addRecentIconRemoveButton(iconItem, iconId);
            }
            rendered += 1;
        });

        // Clean up UI if no icons were actually rendered
        if (rendered === 0) {
            header.remove();
            grid.remove();
            return false;
        }

        return true;
    }

    private addRecentIconRemoveButton(iconItem: HTMLElement, iconId: string): void {
        const removeButton = iconItem.createEl('button', {
            cls: 'nn-icon-recent-remove-button',
            attr: {
                type: 'button',
                'aria-label': strings.modals.iconPicker.removeFromRecents,
                title: strings.modals.iconPicker.removeFromRecents,
                'data-recent-icon-id': iconId
            }
        });
        removeButton.createSpan({ text: '×', cls: 'nn-icon-recent-remove-glyph', attr: { 'aria-hidden': 'true' } });
    }

    private removeRecentIcon(iconId: string): void {
        const parsed = this.iconService.parseIconId(iconId);
        const providerId = parsed.provider;

        const recentIconsMap = this.settingsProvider.getRecentIcons();
        const providerValue = recentIconsMap[providerId];
        const hasInvalidType = providerValue !== undefined && !Array.isArray(providerValue);

        if (hasInvalidType) {
            delete recentIconsMap[providerId];
            this.settingsProvider.setRecentIcons(recentIconsMap);
            this.updateResults();
            return;
        }

        const providerIcons = Array.isArray(providerValue) ? providerValue : [];
        const index = providerIcons.indexOf(iconId);
        if (index < 0) {
            return;
        }

        const updatedProviderIcons = [...providerIcons];
        updatedProviderIcons.splice(index, 1);

        if (updatedProviderIcons.length === 0) {
            delete recentIconsMap[providerId];
        } else {
            recentIconsMap[providerId] = updatedProviderIcons;
        }

        this.settingsProvider.setRecentIcons(recentIconsMap);
        this.updateResults();
    }

    /**
     * Resets the scroll position of the results container to top
     * Called when switching between provider tabs
     */
    private resetResultsScroll(): void {
        if (!this.resultsContainer) {
            return;
        }
        this.resultsContainer.scrollTop = 0;
    }

    private showEmptyState(isSearch: boolean = false) {
        const emptyMessage = this.resultsContainer.createDiv('nn-icon-empty-message');
        emptyMessage.setText(isSearch ? strings.modals.iconPicker.emptyStateNoResults : strings.modals.iconPicker.emptyStateSearch);
    }

    private createIconItem(iconDef: IconDefinition, container: HTMLElement, provider?: IconProvider): HTMLDivElement | null {
        let resolvedProvider = provider;
        let fullIconId: string;

        if (resolvedProvider) {
            fullIconId = this.iconService.formatIconId(resolvedProvider.id, iconDef.id);
        } else {
            const parsed = this.iconService.parseIconId(iconDef.id);
            resolvedProvider = this.iconService.getProvider(parsed.provider);
            if (!resolvedProvider) {
                return null;
            }
            fullIconId = iconDef.id;
        }

        const iconItem = container.createDiv('nn-icon-item');
        iconItem.setAttribute('data-icon-id', fullIconId);
        if (this.currentIcon && fullIconId === this.currentIcon) {
            iconItem.addClass('nn-icon-item-selected');
        }

        // Icon preview
        const iconPreview = iconItem.createDiv('nn-icon-item-preview');
        this.iconService.renderIcon(iconPreview, fullIconId);

        // For emojis, also show the emoji as preview text if available
        if (resolvedProvider.id === 'emoji' && iconDef.preview) {
            iconPreview.addClass('nn-emoji-preview');
        }

        // Icon name
        const iconName = iconItem.createDiv('nn-icon-item-name');
        iconName.setText(iconDef.displayName);

        // Make focusable
        iconItem.setAttribute('tabindex', '0');
        return iconItem;
    }

    /**
     * Adds icon to the recent icons list for its provider
     */
    private saveToRecentIcons(iconId: string) {
        // Parse icon ID to get provider
        const parsed = this.iconService.parseIconId(iconId);
        const providerId = parsed.provider;

        // Get current recent icons and copy provider's list
        const recentIconsMap = this.settingsProvider.getRecentIcons();
        const providerIcons = [...(recentIconsMap[providerId] ?? [])];
        const index = providerIcons.indexOf(iconId);

        // Remove if already exists to avoid duplicates
        if (index > -1) {
            providerIcons.splice(index, 1);
        }

        // Add to front of list
        providerIcons.unshift(iconId);

        // Trim to maximum allowed recent icons per provider
        if (providerIcons.length > RECENT_ICONS_PER_PROVIDER_LIMIT) {
            providerIcons.length = RECENT_ICONS_PER_PROVIDER_LIMIT;
        }

        // Update and persist recent icons to local storage
        recentIconsMap[providerId] = providerIcons;
        this.settingsProvider.setRecentIcons(recentIconsMap);
    }

    /**
     * Invokes the external handler and returns whether it handled the icon update
     */
    private async wasHandledBySelection(iconId: string | null): Promise<boolean> {
        if (!this.onChooseIcon) {
            return false;
        }

        const result = await this.onChooseIcon(iconId);
        return result?.handled === true;
    }

    private async selectIcon(iconId: string) {
        // Save to recent icons
        this.saveToRecentIcons(iconId);

        // Embedded mode: stage the selection without persisting or closing the host modal
        if (this.embedded) {
            this.currentIcon = iconId;
            this.cleared = false;
            this.onSelectCallback?.(iconId);
            this.updateResults();
            return;
        }

        // Delegate to caller when a handler is provided to support multi-selection updates
        if (await this.wasHandledBySelection(iconId)) {
            this.currentIcon = iconId;
            this.close();
            return;
        }

        // Skip metadata persistence when modal is in standalone mode
        if (this.disableMetadataUpdates) {
            this.currentIcon = iconId;
            this.close();
            return;
        }

        // Set the icon based on item type
        if (this.itemType === ItemType.TAG) {
            await this.metadataService.setTagIcon(this.itemPath, iconId);
        } else if (this.itemType === ItemType.PROPERTY) {
            await this.metadataService.setPropertyIcon(this.itemPath, iconId);
        } else if (this.itemType === ItemType.FILE) {
            await this.metadataService.setFileIcon(this.itemPath, iconId);
        } else {
            await this.metadataService.setFolderIcon(this.itemPath, iconId);
        }

        this.currentIcon = iconId;
        this.close();
    }
    private getCurrentIconForItem(): string | undefined {
        if (this.itemType === ItemType.TAG) {
            return this.metadataService.getTagIcon(this.itemPath);
        }
        if (this.itemType === ItemType.PROPERTY) {
            return this.metadataService.getPropertyIcon(this.itemPath);
        }
        if (this.itemType === ItemType.FILE) {
            return this.metadataService.getFileIcon(this.itemPath);
        }
        return this.metadataService.getFolderIcon(this.itemPath);
    }

    private async removeIcon(): Promise<void> {
        const existingIcon = this.disableMetadataUpdates ? this.currentIcon : this.getCurrentIconForItem();
        if (!existingIcon) {
            this.close();
            return;
        }

        // Delegate removal when a handler is provided to support multi-selection updates
        const handled = await this.wasHandledBySelection(null);
        if (!handled) {
            // Clear icon state without metadata persistence in standalone mode
            if (this.disableMetadataUpdates) {
                this.currentIcon = undefined;
                if (this.removeButton) {
                    this.removeButton.disabled = true;
                }
                this.close();
                return;
            }

            if (this.itemType === ItemType.TAG) {
                await this.metadataService.removeTagIcon(this.itemPath);
            } else if (this.itemType === ItemType.PROPERTY) {
                await this.metadataService.removePropertyIcon(this.itemPath);
            } else if (this.itemType === ItemType.FILE) {
                await this.metadataService.removeFileIcon(this.itemPath);
            } else {
                await this.metadataService.removeFolderIcon(this.itemPath);
            }
        }
        this.currentIcon = undefined;
        if (this.removeButton) {
            this.removeButton.disabled = true;
        }
        this.close();
    }

    /**
     * Sets up keyboard navigation for the icon picker modal
     * Handles Tab/Shift+Tab cycling, arrow key navigation, and Enter selection
     */
    private setupKeyboardNavigation() {
        // Shift+Tab -> focus search input or provider tabs based on current focus
        this.scope.register(['Shift'], 'Tab', evt => {
            const currentFocused = activeDocument.activeElement instanceof HTMLElement ? activeDocument.activeElement : null;

            // Prevent default tab cycling when on provider tabs
            if (currentFocused?.classList.contains('nn-icon-provider-tab')) {
                evt.preventDefault();
                return;
            }

            evt.preventDefault();
            const activeTab = this.getActiveProviderTab();

            // From icon grid -> back to search input
            if (currentFocused?.classList.contains('nn-icon-item')) {
                this.searchInput.focus();
                return;
            }

            // From search input -> to provider tabs
            if (currentFocused === this.searchInput) {
                activeTab?.focus();
                return;
            }

            this.searchInput.focus();
        });

        // Tab -> focus first icon if not in grid
        this.scope.register([], 'Tab', evt => {
            const activeElement = activeDocument.activeElement;
            const currentFocused = activeElement instanceof HTMLElement ? activeElement : null;
            if (currentFocused?.classList.contains('nn-icon-provider-tab')) {
                evt.preventDefault();
                this.searchInput.focus();
                return;
            }
            const isInGrid = currentFocused?.classList.contains('nn-icon-item');

            if (!isInGrid) {
                evt.preventDefault();
                const firstIcon = this.resultsContainer.querySelector<HTMLElement>('.nn-icon-item');
                if (firstIcon) firstIcon.focus();
            }
        });

        // Arrow keys and Enter for grid navigation
        this.scope.register([], 'ArrowLeft', evt => this.handleArrowKey(evt, -1, 0));
        this.scope.register([], 'ArrowRight', evt => this.handleArrowKey(evt, 1, 0));
        this.scope.register([], 'ArrowUp', evt => this.handleArrowKey(evt, 0, -1));
        this.scope.register([], 'ArrowDown', evt => this.handleArrowKey(evt, 0, 1));

        this.scope.register([], 'Enter', evt => {
            const currentFocused = activeDocument.activeElement instanceof HTMLElement ? activeDocument.activeElement : null;
            if (currentFocused === this.searchInput) {
                evt.preventDefault();
                window.setTimeout(() => {
                    this.searchInput.blur();
                });
                return;
            }

            if (currentFocused?.classList.contains('nn-icon-item')) {
                evt.preventDefault();
                const iconId = currentFocused.getAttribute('data-icon-id');
                if (iconId) {
                    runAsyncAction(() => this.selectIcon(iconId));
                }
            }
        });
    }

    /**
     * Handles arrow key navigation in the icon grid and provider tabs
     * @param evt - The keyboard event
     * @param deltaX - Horizontal movement (-1 for left, 1 for right)
     * @param deltaY - Vertical movement (-1 for up, 1 for down)
     */
    private handleArrowKey(evt: KeyboardEvent, deltaX: number, deltaY: number) {
        const activeElement = activeDocument.activeElement;
        if (!(activeElement instanceof HTMLElement)) {
            return;
        }
        const currentFocused = activeElement;
        // Handle horizontal navigation between provider tabs
        if (currentFocused?.classList.contains('nn-icon-provider-tab')) {
            if (deltaX === 0) {
                return; // Ignore vertical arrows on tabs
            }
            evt.preventDefault();
            this.focusAdjacentTab(currentFocused, deltaX);
            return;
        }
        if (!currentFocused?.classList.contains('nn-icon-item')) return;

        evt.preventDefault();
        const iconItems = Array.from(this.resultsContainer.querySelectorAll<HTMLElement>('.nn-icon-item'));
        const currentIndex = iconItems.indexOf(currentFocused);

        const newIndex = deltaX !== 0 ? currentIndex + deltaX : currentIndex + deltaY * GRID_COLUMNS;

        if (newIndex >= 0 && newIndex < iconItems.length) {
            iconItems[newIndex].focus();
            this.ensureIconVisible(iconItems[newIndex]);
        }
    }

    /**
     * Focuses the adjacent provider tab when using arrow keys
     * @param currentTab - The currently focused tab
     * @param deltaX - Direction to move (-1 for left, 1 for right)
     */
    private focusAdjacentTab(currentTab: HTMLElement, deltaX: number) {
        const currentIndex = this.providerTabs.indexOf(currentTab);
        if (currentIndex === -1) {
            return;
        }

        const nextIndex = currentIndex + (deltaX < 0 ? -1 : 1);
        if (nextIndex < 0 || nextIndex >= this.providerTabs.length) {
            return;
        }

        const nextTab = this.providerTabs[nextIndex];
        const providerId = nextTab.dataset.providerId;
        if (!providerId) {
            return;
        }

        // Update active tab and trigger click to switch provider
        this.setActiveProviderTab(providerId);
        nextTab.focus();
        nextTab.click();
    }

    private ensureIconVisible(iconElement: HTMLElement) {
        const container = this.resultsContainer;
        const containerRect = container.getBoundingClientRect();
        const elementRect = iconElement.getBoundingClientRect();

        const padding = 8;

        if (elementRect.top < containerRect.top + padding) {
            container.scrollTop -= containerRect.top - elementRect.top + padding;
        }

        if (elementRect.bottom > containerRect.bottom - padding) {
            container.scrollTop += elementRect.bottom - containerRect.bottom + padding;
        }
    }

    /**
     * Sets the active provider tab and updates ARIA attributes
     * @param providerId - The ID of the provider to activate
     */
    private setActiveProviderTab(providerId: string) {
        this.providerTabs.forEach(tab => {
            const isActive = tab.dataset.providerId === providerId;
            if (isActive) {
                tab.addClass('nn-active');
                tab.setAttribute('tabindex', '0'); // Make tab focusable
            } else {
                tab.removeClass('nn-active');
                tab.setAttribute('tabindex', '-1'); // Remove from tab order
            }
        });
        this.updateProviderLink(providerId);
    }

    /**
     * Updates the provider link URL and text for the currently active provider
     * @param providerId - The ID of the provider to show the link for
     */
    private updateProviderLink(providerId: string): void {
        if (!this.providerLinkContainer || !this.providerLinkEl) {
            return;
        }

        const catalogUrl = getProviderCatalogUrl(providerId);
        if (!catalogUrl) {
            this.providerLinkContainer.addClass('nn-icon-provider-link-row-hidden');
            this.providerLinkEl.removeAttribute('href');
            this.providerLinkEl.setText('');
            this.providerLinkEl.removeAttribute('title');
            return;
        }

        this.providerLinkContainer.removeClass('nn-icon-provider-link-row-hidden');
        this.providerLinkEl.setAttribute('href', catalogUrl);
        this.providerLinkEl.setAttribute('title', catalogUrl);
        const provider = this.iconService.getProvider(providerId);
        this.providerLinkEl.setText(this.buildProviderLinkLabel(provider, catalogUrl));
    }

    /**
     * Formats a catalog URL for display by removing protocol and trailing slash
     * @param url - The full catalog URL
     * @returns Formatted URL text without protocol and trailing slash
     */
    private formatCatalogLinkText(url: string): string {
        const trimmed = url.trim();
        if (!trimmed) {
            return '';
        }
        return trimmed.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }

    /**
     * Builds the display label for the provider link, including version if available
     * @param provider - The icon provider
     * @param catalogUrl - The catalog URL to format
     * @returns Display label with optional version prefix
     */
    private buildProviderLinkLabel(provider: IconProvider | undefined, catalogUrl: string): string {
        const version = this.resolveProviderVersion(provider);
        const linkLabel = this.formatCatalogLinkText(catalogUrl);

        if (version) {
            return `${version}, ${linkLabel}`;
        }
        return linkLabel;
    }

    /**
     * Extracts and formats the version string from a provider, adding 'v' prefix if missing
     * @param provider - The icon provider
     * @returns Formatted version string with 'v' prefix, or null if no version available
     */
    private resolveProviderVersion(provider: IconProvider | undefined): string | null {
        if (!provider || typeof provider.getVersion !== 'function') {
            return null;
        }

        const rawVersion = provider.getVersion();
        if (!rawVersion) {
            return null;
        }

        const trimmed = rawVersion.trim();
        if (!trimmed) {
            return null;
        }

        if (/^v/i.test(trimmed)) {
            return trimmed;
        }

        return `v${trimmed}`;
    }

    /**
     * Gets the currently active provider tab element
     * @returns The active tab element or null if not found
     */
    private getActiveProviderTab(): HTMLElement | null {
        return this.providerTabs.find(tab => tab.dataset.providerId === this.currentProvider) ?? null;
    }

    /** Returns the currently staged icon id, or undefined if none selected */
    getStagedIcon(): string | undefined {
        return this.currentIcon;
    }

    /** Returns true if the icon has been flagged for removal */
    isIconCleared(): boolean {
        return this.cleared;
    }

    /** Stages removal of the icon (used by the embedding host's reset action) */
    clearSelection(): void {
        this.currentIcon = undefined;
        this.cleared = true;
        this.onSelectCallback?.(null);
        if (this.resultsContainer) {
            this.updateResults();
        }
    }

    /** Releases listeners and timers. Shared by standalone onClose and the embedding host. */
    detach(): void {
        if (this.searchDebounceTimer) {
            window.clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = null;
        }
        this.removeButton = null;
        this.providerLinkContainer = null;
        this.providerLinkEl = null;
        // Cleanup DOM listeners
        if (this.domDisposers.length) {
            this.domDisposers.forEach(dispose => {
                try {
                    dispose();
                } catch (e) {
                    console.error('Error disposing icon picker listener:', e);
                }
            });
            this.domDisposers = [];
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
        this.modalEl.removeClass('nn-icon-picker-modal');
        this.detach();
    }

    // Attaches event handlers to the modal close button to ensure proper modal closure
    private attachCloseButtonHandler() {
        const closeButton = this.modalEl.querySelector<HTMLElement>('.modal-close-button');
        if (!closeButton) {
            return;
        }

        const handleClose = (event: Event) => {
            event.preventDefault();
            this.close();
        };

        // Close modal on click or pointer down
        this.domDisposers.push(addAsyncEventListener(closeButton, 'click', handleClose));
        this.domDisposers.push(addAsyncEventListener(closeButton, 'pointerdown', handleClose));
    }
}
