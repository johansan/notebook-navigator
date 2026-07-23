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

import { App, Modal, setIcon } from 'obsidian';
import { strings } from '../i18n';
import { MetadataService } from '../services/MetadataService';
import { getIconService } from '../services/icons';
import { addAsyncEventListener } from '../utils/domEventListeners';
import { ColorPickerSharedState, ColorPickerSurface } from './ColorPickerSurface';
import { IconPickerSurface } from './IconPickerSurface';

type AppearanceTabId = 'icon' | 'color' | 'background';

export interface AppearanceColorAspect {
    initial: string | null;
    apply: (value: string | null) => Promise<void>;
}

export interface AppearanceIconAspect {
    initial: string | null;
    apply: (iconId: string | null) => Promise<void>;
}

export interface AppearanceModalParams {
    title: string;
    metadataService: MetadataService;
    initialTab?: AppearanceTabId;
    /** Default icon captured for the preview. */
    defaultIcon?: string | null;
    /** Resolved file icon captured for the preview. */
    colorIconPlaceholder?: string | null;
    icon?: AppearanceIconAspect;
    color?: AppearanceColorAspect;
    background?: AppearanceColorAspect;
}

interface AppearanceTab {
    id: AppearanceTabId;
    button: HTMLButtonElement;
    chip: HTMLSpanElement;
    panel: HTMLElement;
    mounted: boolean;
    mount: () => void;
}

/**
 * Staged editor for icon, foreground color, and background color.
 */
export class AppearanceModal extends Modal {
    private params: AppearanceModalParams;
    private iconService = getIconService();
    private colorSharedState: ColorPickerSharedState;
    private tabs: AppearanceTab[] = [];
    private activeTabId: AppearanceTabId | null = null;
    private domDisposers: (() => void)[] = [];
    private previewItem!: HTMLDivElement;
    private previewIconEl!: HTMLSpanElement;
    private clearButton: HTMLButtonElement | null = null;
    private iconSurface: IconPickerSurface | null = null;
    private colorSurface: ColorPickerSurface | null = null;
    private backgroundSurface: ColorPickerSurface | null = null;
    private resetButton: HTMLButtonElement | null = null;
    private stagedIcon: string | null;
    private stagedColor: string | null;
    private stagedBackground: string | null;
    private iconTouched = false;
    private colorTouched = false;
    private backgroundTouched = false;

    constructor(app: App, params: AppearanceModalParams) {
        super(app);
        this.params = params;
        this.stagedIcon = params.icon?.initial ?? null;
        this.stagedColor = params.color?.initial ?? null;
        this.stagedBackground = params.background?.initial ?? null;
        this.colorSharedState = ColorPickerSurface.createSharedState(params.metadataService.getSettingsProvider());
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        this.modalEl.addClass('nn-appearance-modal');

        const header = contentEl.createDiv('nn-appearance-header');
        this.previewItem = header.createDiv('nn-appearance-preview-item');
        this.previewIconEl = this.previewItem.createSpan('nn-appearance-preview-icon');
        this.previewItem.createSpan({ cls: 'nn-appearance-preview-name', text: this.params.title });

        this.clearButton = this.previewItem.createEl('button', {
            cls: 'nn-recent-remove-button nn-appearance-clear-button',
            attr: {
                type: 'button',
                'aria-label': strings.modals.appearance.clear,
                title: strings.modals.appearance.clear
            }
        });
        this.clearButton.createSpan({ text: '×', cls: 'nn-recent-remove-glyph', attr: { 'aria-hidden': 'true' } });
        this.domDisposers.push(addAsyncEventListener(this.clearButton, 'click', () => this.clearAll()));

        const tabBar = contentEl.createDiv('nn-appearance-tabs');
        tabBar.setAttribute('role', 'tablist');
        const body = contentEl.createDiv('nn-appearance-body');

        if (this.params.icon) {
            this.addIconTab(tabBar, body);
        }
        if (this.params.color) {
            this.addColorTab(tabBar, body, 'color');
        }
        if (this.params.background) {
            this.addColorTab(tabBar, body, 'background');
        }

        const footer = contentEl.createDiv('nn-appearance-footer');
        this.resetButton = footer.createEl('button', { cls: 'nn-appearance-reset-button' });
        this.domDisposers.push(addAsyncEventListener(this.resetButton, 'click', () => this.resetActiveTab()));

        const footerActions = footer.createDiv('nn-appearance-footer-actions');
        const cancelButton = footerActions.createEl('button', { text: strings.common.cancel });
        this.domDisposers.push(addAsyncEventListener(cancelButton, 'click', () => this.close()));
        const applyButton = footerActions.createEl('button', { text: strings.modals.appearance.apply, cls: 'mod-cta' });
        this.domDisposers.push(addAsyncEventListener(applyButton, 'click', () => this.applyAll()));

        if (this.tabs.length > 0) {
            const initialTab =
                this.params.initialTab && this.tabs.some(tab => tab.id === this.params.initialTab)
                    ? this.params.initialTab
                    : this.tabs[0].id;
            this.setActiveTab(initialTab);
        }
        this.renderState();
    }

    onClose(): void {
        const { contentEl } = this;
        this.iconSurface?.dispose();
        this.colorSurface?.dispose();
        this.backgroundSurface?.dispose();
        this.iconSurface = null;
        this.colorSurface = null;
        this.backgroundSurface = null;
        this.resetButton = null;
        this.clearButton = null;
        this.tabs = [];
        this.activeTabId = null;
        this.domDisposers.forEach(dispose => {
            try {
                dispose();
            } catch (e) {
                console.error('Error disposing appearance modal listener:', e);
            }
        });
        this.domDisposers = [];
        contentEl.empty();
        this.modalEl.removeClass('nn-appearance-modal');
    }

    private addIconTab(tabBar: HTMLElement, body: HTMLElement): void {
        const tab = this.createTab(tabBar, body, 'icon', strings.modals.appearance.tabIcon, panel => this.mountIconTab(panel));
        this.tabs.push(tab);
    }

    private addColorTab(tabBar: HTMLElement, body: HTMLElement, id: 'color' | 'background'): void {
        const label = id === 'color' ? strings.modals.appearance.tabColor : strings.modals.appearance.tabBackground;
        const tab = this.createTab(tabBar, body, id, label, panel => this.mountColorTab(panel, id));
        this.tabs.push(tab);
    }

    private createTab(
        tabBar: HTMLElement,
        body: HTMLElement,
        id: AppearanceTabId,
        label: string,
        mount: (panel: HTMLElement) => void
    ): AppearanceTab {
        const button = tabBar.createEl('button', {
            cls: 'nn-appearance-tab',
            attr: { type: 'button', role: 'tab' }
        });
        const chip = button.createSpan('nn-appearance-tab-chip');
        button.createSpan({ cls: 'nn-appearance-tab-label', text: label });
        const panel = body.createDiv('nn-appearance-panel nn-appearance-panel-hidden');
        panel.setAttribute('role', 'tabpanel');

        const tab: AppearanceTab = { id, button, chip, panel, mounted: false, mount: () => mount(panel) };
        this.domDisposers.push(addAsyncEventListener(button, 'click', () => this.setActiveTab(id)));
        return tab;
    }

    private mountIconTab(panel: HTMLElement): void {
        const host = panel.createDiv('nn-appearance-picker-host');
        this.iconSurface = new IconPickerSurface({
            app: this.app,
            rootEl: host,
            scope: this.scope,
            settingsProvider: this.params.metadataService.getSettingsProvider(),
            currentIconId: this.stagedIcon,
            saveRecentOnSelect: false,
            isKeyboardActive: () => this.activeTabId === 'icon',
            onSelect: iconId => {
                this.iconTouched = true;
                this.stagedIcon = iconId;
                this.renderState();
            }
        });
        this.iconSurface.build();
        this.iconSurface.focusSearch();
    }

    private mountColorTab(panel: HTMLElement, id: 'color' | 'background'): void {
        const host = panel.createDiv('nn-appearance-picker-host');
        const surface = new ColorPickerSurface({
            app: this.app,
            rootEl: host,
            scope: this.scope,
            initialColor: id === 'color' ? this.stagedColor : this.stagedBackground,
            settingsProvider: this.params.metadataService.getSettingsProvider(),
            sharedState: this.colorSharedState,
            showPreview: false,
            recentInLeftColumn: true,
            onChange: color => {
                if (id === 'color') {
                    this.colorTouched = true;
                    this.stagedColor = color;
                } else {
                    this.backgroundTouched = true;
                    this.stagedBackground = color;
                }
                this.renderState();
            }
        });
        surface.build();

        if (id === 'color') {
            this.colorSurface = surface;
            if (this.colorTouched && this.stagedColor === null) {
                surface.markCleared();
            }
        } else {
            this.backgroundSurface = surface;
            if (this.backgroundTouched && this.stagedBackground === null) {
                surface.markCleared();
            }
        }
    }

    private setActiveTab(id: AppearanceTabId): void {
        this.activeTabId = id;
        this.tabs.forEach(tab => {
            const isActive = tab.id === id;
            tab.button.toggleClass('nn-active', isActive);
            tab.button.setAttribute('aria-selected', isActive ? 'true' : 'false');
            tab.panel.toggleClass('nn-appearance-panel-hidden', !isActive);
            if (isActive && !tab.mounted) {
                tab.mounted = true;
                tab.mount();
            }
        });
        this.renderResetButton();
    }

    private renderState(): void {
        this.renderPreview();
        this.renderTabChips();
        this.renderResetButton();
        this.renderClearButton();
    }

    private clearAll(): void {
        if (this.params.icon) {
            this.iconTouched = true;
            this.stagedIcon = null;
            this.iconSurface?.clearSelection();
        }
        if (this.params.color) {
            this.colorTouched = true;
            this.stagedColor = null;
            this.colorSurface?.markCleared();
        }
        if (this.params.background) {
            this.backgroundTouched = true;
            this.stagedBackground = null;
            this.backgroundSurface?.markCleared();
        }
        this.renderState();
    }

    private resetActiveTab(): void {
        switch (this.activeTabId) {
            case 'icon':
                this.iconTouched = true;
                this.stagedIcon = null;
                this.iconSurface?.clearSelection();
                break;
            case 'color':
                this.colorTouched = true;
                this.stagedColor = null;
                this.colorSurface?.markCleared();
                break;
            case 'background':
                this.backgroundTouched = true;
                this.stagedBackground = null;
                this.backgroundSurface?.markCleared();
                break;
        }
        this.renderState();
    }

    /**
     * Modal preview behavior:
     *
     * - The modal captures the persistent item state when opened. It does not follow later item events.
     * - Temporary states, such as unfinished-task icons, are ignored.
     * - A custom icon takes priority over the default icon.
     * - Folders, tags, properties, and navigation sections show their normal default icon when no custom icon exists.
     * - The vault root always shows its current custom or default icon.
     * - File-type icons remain visible when Icons by file type is enabled.
     *
     * For file items in icon-only mode, the resolved file icon is hidden only when all four are true:
     *
     * - Apply color to icons only is enabled.
     * - Icons by file type is disabled.
     * - No custom color is set.
     * - No custom icon is set.
     *
     * Color display:
     *
     * - Apply color to icons only enabled: color applies only to the icon.
     * - Disabled: color applies to both the icon and text.
     * - Background color always applies to the whole preview item.
     * - Clearing a custom icon returns to the applicable default icon.
     */
    private renderPreview(): void {
        const settings = this.params.metadataService.getSettingsProvider().settings;
        const colorIconOnly = settings.colorIconOnly;
        const showFileIconPlaceholder = colorIconOnly || settings.showCategoryIcons;
        const hideUnstyledFileIcon =
            colorIconOnly &&
            !settings.showCategoryIcons &&
            !this.stagedColor &&
            !this.stagedIcon &&
            Boolean(this.params.colorIconPlaceholder);
        const previewIcon = hideUnstyledFileIcon
            ? null
            : (this.stagedIcon ?? this.params.defaultIcon ?? (showFileIconPlaceholder ? this.params.colorIconPlaceholder : null));

        this.previewIconEl.empty();
        if (previewIcon) {
            this.iconService.renderIcon(this.previewIconEl, previewIcon);
            this.previewIconEl.removeClass('nn-appearance-preview-icon-empty');
        } else {
            this.previewIconEl.addClass('nn-appearance-preview-icon-empty');
        }

        this.previewItem.style.removeProperty('--nn-preview-fg');
        this.previewIconEl.style.removeProperty('color');
        if (this.stagedColor) {
            if (colorIconOnly) {
                this.previewIconEl.style.setProperty('color', this.stagedColor);
            } else {
                this.previewItem.style.setProperty('--nn-preview-fg', this.stagedColor);
            }
        }

        if (this.stagedBackground) {
            this.previewItem.style.setProperty('--nn-preview-bg', this.stagedBackground);
        } else {
            this.previewItem.style.removeProperty('--nn-preview-bg');
        }
    }

    private renderTabChips(): void {
        this.tabs.forEach(tab => {
            tab.chip.empty();
            tab.chip.removeClass('nn-appearance-tab-chip-empty');
            tab.chip.removeClass('nn-appearance-tab-color-chip');
            tab.chip.removeClass('nn-checkerboard');
            tab.chip.removeClass('nn-color-swatch');
            tab.chip.style.removeProperty('--nn-color-swatch-color');

            if (tab.id === 'icon') {
                this.renderIconChip(tab.chip);
                return;
            }

            const color = tab.id === 'color' ? this.stagedColor : this.stagedBackground;
            this.renderColorChip(tab.chip, color);
        });
    }

    private renderIconChip(chip: HTMLElement): void {
        chip.addClass('nn-appearance-tab-icon-chip');
        if (this.stagedIcon) {
            this.iconService.renderIcon(chip, this.stagedIcon);
            return;
        }

        chip.addClass('nn-appearance-tab-chip-empty');
        setIcon(chip, 'lucide-image');
    }

    private renderColorChip(chip: HTMLElement, color: string | null): void {
        chip.addClass('nn-appearance-tab-color-chip');
        chip.addClass('nn-checkerboard');
        if (!color) {
            chip.addClass('nn-appearance-tab-chip-empty');
            return;
        }

        chip.addClass('nn-color-swatch');
        chip.style.setProperty('--nn-color-swatch-color', color);
    }

    private renderResetButton(): void {
        if (!this.resetButton) {
            return;
        }

        let label = '';
        let active = false;
        switch (this.activeTabId) {
            case 'icon':
                label = strings.modals.appearance.resetIcon;
                active = this.iconTouched && this.stagedIcon === null;
                break;
            case 'color':
                label = strings.modals.appearance.resetColor;
                active = this.colorTouched && this.stagedColor === null;
                break;
            case 'background':
                label = strings.modals.appearance.resetBackground;
                active = this.backgroundTouched && this.stagedBackground === null;
                break;
        }

        this.resetButton.setText(label);
        this.resetButton.toggleClass('nn-appearance-reset-active', active);
    }

    private renderClearButton(): void {
        if (!this.clearButton) {
            return;
        }
        const hasStyle = this.stagedIcon !== null || this.stagedColor !== null || this.stagedBackground !== null;
        this.clearButton.toggleClass('nn-appearance-clear-hidden', !hasStyle);
    }

    private async applyAll(): Promise<void> {
        if (this.params.icon && this.hasChanged(this.params.icon.initial, this.stagedIcon, this.iconTouched)) {
            if (this.stagedIcon) {
                this.iconSurface?.commitRecentIcon();
            }
            await this.params.icon.apply(this.stagedIcon);
        }

        if (this.params.color && this.hasChanged(this.params.color.initial, this.stagedColor, this.colorTouched)) {
            if (this.stagedColor) {
                this.colorSurface?.commitRecentColor();
            }
            await this.params.color.apply(this.stagedColor);
        }

        if (this.params.background && this.hasChanged(this.params.background.initial, this.stagedBackground, this.backgroundTouched)) {
            if (this.stagedBackground) {
                this.backgroundSurface?.commitRecentColor();
            }
            await this.params.background.apply(this.stagedBackground);
        }

        this.colorSurface?.persistCustomColors();
        this.backgroundSurface?.persistCustomColors();
        this.close();
    }

    private hasChanged(initialValue: string | null, stagedValue: string | null, touched: boolean): boolean {
        return touched && (initialValue ?? null) !== (stagedValue ?? null);
    }
}
