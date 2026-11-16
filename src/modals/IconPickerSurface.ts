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

import { App, Scope, TFile } from 'obsidian';
import { strings } from '../i18n';
import { getIconService, IconDefinition, IconProvider, RECENT_ICONS_PER_PROVIDER_LIMIT } from '../services/icons';
import { getEmojiDisplayName } from '../services/icons/emojiCatalog';
import { getProviderCatalogUrl } from '../services/icons/providerCatalogLinks';
import { isVaultIconFile } from '../services/icons/providers/VaultIconProvider';
import { ISettingsProvider } from '../interfaces/ISettingsProvider';
import { TIMEOUTS } from '../types/obsidian-extended';
import { runAsyncAction } from '../utils/async';
import { addAsyncEventListener } from '../utils/domEventListeners';

const GRID_COLUMNS = 5;
const MAX_SEARCH_RESULTS = 50;
const ALL_PROVIDERS_TAB_ID = 'all';
const VAULT_PROVIDER_ID = 'vault';

interface IconPickerSurfaceParams {
    app: App;
    rootEl: HTMLElement;
    scope: Scope;
    settingsProvider: ISettingsProvider;
    currentIconId?: string | null;
    saveRecentOnSelect?: boolean;
    isKeyboardActive?: () => boolean;
    onSelect: (iconId: string) => void | Promise<void>;
}

/**
 * Plain icon picker surface with provider tabs, search results, recents, and keyboard navigation.
 */
export class IconPickerSurface {
    private static lastUsedProvider: string | null = null;
    private app: App;
    private rootEl: HTMLElement;
    private scope: Scope;
    private settingsProvider: ISettingsProvider;
    private iconService = getIconService();
    private currentProvider: string = ALL_PROVIDERS_TAB_ID;
    private currentIcon: string | undefined;
    private selectedIconForRecent: string | null = null;
    private saveRecentOnSelect: boolean;
    private isKeyboardActive: () => boolean;
    private onSelect: (iconId: string) => void | Promise<void>;
    private resultsContainer!: HTMLDivElement;
    private searchInput!: HTMLInputElement;
    private tabContainer!: HTMLDivElement;
    private providerTabs: HTMLElement[] = [];
    private providerLinkContainer: HTMLDivElement | null = null;
    private providerLinkEl: HTMLAnchorElement | null = null;
    private searchDebounceTimer: number | null = null;
    private domDisposers: (() => void)[] = [];

    public static getLastUsedProvider(): string | null {
        return IconPickerSurface.lastUsedProvider;
    }

    public static setLastUsedProvider(providerId: string | null): void {
        IconPickerSurface.lastUsedProvider = providerId;
    }

    constructor(params: IconPickerSurfaceParams) {
        this.app = params.app;
        this.rootEl = params.rootEl;
        this.scope = params.scope;
        this.settingsProvider = params.settingsProvider;
        this.currentIcon = params.currentIconId ?? undefined;
        this.saveRecentOnSelect = params.saveRecentOnSelect !== false;
        this.isKeyboardActive = params.isKeyboardActive ?? (() => true);
        this.onSelect = params.onSelect;
    }

    build(): void {
        this.cleanupVaultRecentIcons();
        this.createProviderTabs();
        this.createSearchInput();
        this.resultsContainer = this.rootEl.createDiv('nn-icon-results-container');
        this.domDisposers.push(addAsyncEventListener(this.resultsContainer, 'click', event => this.handleResultsClick(event)));
        this.createProviderLinkRow();
        this.updateProviderLink(this.currentProvider);
        this.setupKeyboardNavigation();
        this.updateResults();
    }

    focusSearch(): void {
        this.searchInput.focus();
        window.requestAnimationFrame(() => {
            this.searchInput.focus();
        });
    }

    getIcon(): string | null {
        return this.currentIcon ?? null;
    }

    clearSelection(): void {
        this.currentIcon = undefined;
        this.selectedIconForRecent = null;
        if (this.resultsContainer) {
            this.updateResults();
        }
    }

    commitRecentIcon(): void {
        if (!this.selectedIconForRecent) {
            return;
        }
        this.saveToRecentIcons(this.selectedIconForRecent);
        this.selectedIconForRecent = null;
    }

    dispose(): void {
        if (this.searchDebounceTimer) {
            window.clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = null;
        }
        this.providerLinkContainer = null;
        this.providerLinkEl = null;
        this.domDisposers.forEach(dispose => {
            try {
                dispose();
            } catch (e) {
                console.error('Error disposing icon picker surface listener:', e);
            }
        });
        this.domDisposers = [];
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

    private createProviderTabs(): void {
        this.tabContainer = this.rootEl.createDiv('nn-icon-provider-tabs');
        this.tabContainer.setAttribute('role', 'tablist');
        this.providerTabs = [];

        const providers = this.sortProvidersForDisplay(this.iconService.getAllProviders().slice());
        const resolvedProviderId = this.resolveInitialProvider(providers);
        this.currentProvider = resolvedProviderId;
        IconPickerSurface.setLastUsedProvider(resolvedProviderId);

        this.addProviderTab(ALL_PROVIDERS_TAB_ID, strings.modals.iconPicker.allTabLabel);

        providers.forEach(provider => {
            this.addProviderTab(provider.id, provider.name);
        });

        this.setActiveProviderTab(resolvedProviderId);
    }

    private addProviderTab(providerId: string, label: string): void {
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
                IconPickerSurface.setLastUsedProvider(providerId);
                this.updateResults();
                this.resetResultsScroll();
            })
        );
    }

    private createSearchInput(): void {
        const searchContainer = this.rootEl.createDiv('nn-icon-search-container');
        this.searchInput = searchContainer.createEl('input', {
            type: 'text',
            placeholder: strings.modals.iconPicker.searchPlaceholder,
            cls: 'nn-icon-search-input'
        });
        this.searchInput.setAttribute('enterkeyhint', 'done');

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

    private createProviderLinkRow(): void {
        this.providerLinkContainer = this.rootEl.createDiv('nn-icon-provider-link-row');
        this.providerLinkEl = this.providerLinkContainer.createEl('a', { cls: 'nn-icon-provider-link' });
        this.providerLinkEl.setAttribute('target', '_blank');
        this.providerLinkEl.setAttribute('rel', 'noopener noreferrer');
        this.providerLinkContainer.addClass('nn-icon-provider-link-row-hidden');
    }

    private sortProvidersForDisplay(providers: IconProvider[]): IconProvider[] {
        const pinnedOrder = [VAULT_PROVIDER_ID, 'emoji', 'lucide'];
        return providers.sort((a, b) => {
            const aPinnedIndex = pinnedOrder.indexOf(a.id);
            const bPinnedIndex = pinnedOrder.indexOf(b.id);

            if (aPinnedIndex !== -1 && bPinnedIndex !== -1) {
                return aPinnedIndex - bPinnedIndex;
            }

            if (aPinnedIndex !== -1) {
                return -1;
            }

            if (bPinnedIndex !== -1) {
                return 1;
            }

            return a.name.localeCompare(b.name);
        });
    }

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
        const candidates = [IconPickerSurface.getLastUsedProvider(), this.currentProvider];

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

    private updateResults(): void {
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
        const providerCache = new Map<string, IconDefinition[]>();

        recentIcons.forEach(iconId => {
            const parsed = this.iconService.parseIconId(iconId);
            const provider = this.iconService.getProvider(parsed.provider);
            if (!provider) {
                return;
            }

            if (provider.id === 'emoji') {
                const iconDef = {
                    id: parsed.identifier,
                    displayName: getEmojiDisplayName(parsed.identifier),
                    preview: parsed.identifier
                };
                const iconItem = this.createIconItem(iconDef, grid, provider);
                if (iconItem) {
                    this.addRecentIconRemoveButton(iconItem, iconId);
                }
                rendered += 1;
                return;
            }

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

    private resetResultsScroll(): void {
        this.resultsContainer.scrollTop = 0;
    }

    private showEmptyState(isSearch: boolean = false): void {
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
        iconItem.toggleClass('nn-icon-item-selected', fullIconId === this.currentIcon);

        const iconPreview = iconItem.createDiv('nn-icon-item-preview');
        this.iconService.renderIcon(iconPreview, fullIconId);

        if (resolvedProvider.id === 'emoji' && iconDef.preview) {
            iconPreview.addClass('nn-emoji-preview');
        }

        const iconName = iconItem.createDiv('nn-icon-item-name');
        iconName.setText(iconDef.displayName);

        iconItem.setAttribute('tabindex', '0');
        return iconItem;
    }

    private saveToRecentIcons(iconId: string): void {
        const parsed = this.iconService.parseIconId(iconId);
        const providerId = parsed.provider;

        const recentIconsMap = this.settingsProvider.getRecentIcons();
        const providerIcons = [...(recentIconsMap[providerId] ?? [])];
        const index = providerIcons.indexOf(iconId);

        if (index > -1) {
            providerIcons.splice(index, 1);
        }

        providerIcons.unshift(iconId);

        if (providerIcons.length > RECENT_ICONS_PER_PROVIDER_LIMIT) {
            providerIcons.length = RECENT_ICONS_PER_PROVIDER_LIMIT;
        }

        recentIconsMap[providerId] = providerIcons;
        this.settingsProvider.setRecentIcons(recentIconsMap);
    }

    private async selectIcon(iconId: string): Promise<void> {
        if (this.saveRecentOnSelect) {
            this.saveToRecentIcons(iconId);
        } else {
            this.selectedIconForRecent = iconId;
        }

        this.currentIcon = iconId;
        await this.onSelect(iconId);
        this.updateResults();
    }

    private setupKeyboardNavigation(): void {
        this.scope.register(['Shift'], 'Tab', evt => {
            if (!this.isKeyboardActive()) {
                return;
            }

            const currentFocused = activeDocument.activeElement?.instanceOf(HTMLElement) ? activeDocument.activeElement : null;

            if (currentFocused?.classList.contains('nn-icon-provider-tab')) {
                evt.preventDefault();
                return;
            }

            evt.preventDefault();
            const activeTab = this.getActiveProviderTab();

            if (currentFocused?.classList.contains('nn-icon-item')) {
                this.searchInput.focus();
                return;
            }

            if (currentFocused === this.searchInput) {
                activeTab?.focus();
                return;
            }

            this.searchInput.focus();
        });

        this.scope.register([], 'Tab', evt => {
            if (!this.isKeyboardActive()) {
                return;
            }

            const activeElement = activeDocument.activeElement;
            const currentFocused = activeElement?.instanceOf(HTMLElement) ? activeElement : null;
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

        this.scope.register([], 'ArrowLeft', evt => this.handleArrowKey(evt, -1, 0));
        this.scope.register([], 'ArrowRight', evt => this.handleArrowKey(evt, 1, 0));
        this.scope.register([], 'ArrowUp', evt => this.handleArrowKey(evt, 0, -1));
        this.scope.register([], 'ArrowDown', evt => this.handleArrowKey(evt, 0, 1));

        this.scope.register([], 'Enter', evt => {
            if (!this.isKeyboardActive()) {
                return;
            }

            const currentFocused = activeDocument.activeElement?.instanceOf(HTMLElement) ? activeDocument.activeElement : null;
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

    private handleArrowKey(evt: KeyboardEvent, deltaX: number, deltaY: number): void {
        if (!this.isKeyboardActive()) {
            return;
        }

        const activeElement = activeDocument.activeElement;
        if (!activeElement?.instanceOf(HTMLElement)) {
            return;
        }
        const currentFocused = activeElement;
        if (currentFocused.classList.contains('nn-icon-provider-tab')) {
            if (deltaX === 0) {
                return;
            }
            evt.preventDefault();
            this.focusAdjacentTab(currentFocused, deltaX);
            return;
        }
        if (!currentFocused.classList.contains('nn-icon-item')) return;

        evt.preventDefault();
        const iconItems = Array.from(this.resultsContainer.querySelectorAll<HTMLElement>('.nn-icon-item'));
        const currentIndex = iconItems.indexOf(currentFocused);

        const newIndex = deltaX !== 0 ? currentIndex + deltaX : currentIndex + deltaY * GRID_COLUMNS;

        if (newIndex >= 0 && newIndex < iconItems.length) {
            iconItems[newIndex].focus();
            this.ensureIconVisible(iconItems[newIndex]);
        }
    }

    private focusAdjacentTab(currentTab: HTMLElement, deltaX: number): void {
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

        this.setActiveProviderTab(providerId);
        nextTab.focus();
        nextTab.click();
    }

    private ensureIconVisible(iconElement: HTMLElement): void {
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

    private setActiveProviderTab(providerId: string): void {
        this.providerTabs.forEach(tab => {
            const isActive = tab.dataset.providerId === providerId;
            if (isActive) {
                tab.addClass('nn-active');
                tab.setAttribute('tabindex', '0');
            } else {
                tab.removeClass('nn-active');
                tab.setAttribute('tabindex', '-1');
            }
        });
        this.updateProviderLink(providerId);
    }

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

    private formatCatalogLinkText(url: string): string {
        const trimmed = url.trim();
        if (!trimmed) {
            return '';
        }
        return trimmed.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }

    private buildProviderLinkLabel(provider: IconProvider | undefined, catalogUrl: string): string {
        const version = this.resolveProviderVersion(provider);
        const linkLabel = this.formatCatalogLinkText(catalogUrl);

        if (version) {
            return `${version}, ${linkLabel}`;
        }
        return linkLabel;
    }

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

    private getActiveProviderTab(): HTMLElement | null {
        return this.providerTabs.find(tab => tab.dataset.providerId === this.currentProvider) ?? null;
    }
}
