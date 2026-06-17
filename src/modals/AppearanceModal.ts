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
import { ItemType } from '../types';
import { MetadataService } from '../services/MetadataService';
import { getIconService } from '../services/icons';
import { addAsyncEventListener } from '../utils/domEventListeners';
import { ColorPickerModal } from './ColorPickerModal';
import { IconPickerModal } from './IconPickerModal';

type AppearanceItemType =
    | typeof ItemType.FOLDER
    | typeof ItemType.TAG
    | typeof ItemType.PROPERTY
    | typeof ItemType.FILE;

/** Configuration for a single editable aspect (color or background) */
export interface AppearanceColorAspect {
    initial: string | null;
    apply: (value: string | null) => Promise<void>;
}

/** Configuration for the icon aspect */
export interface AppearanceIconAspect {
    initial: string | null;
    apply: (iconId: string | null) => Promise<void>;
}

export interface AppearanceModalParams {
    title: string;
    metadataService: MetadataService;
    itemPath: string;
    itemType: AppearanceItemType;
    icon?: AppearanceIconAspect;
    color?: AppearanceColorAspect;
    background?: AppearanceColorAspect;
}

interface AppearanceTab {
    id: string;
    button: HTMLElement;
    panel: HTMLElement;
}

/**
 * Unified appearance editor combining icon, color and background pickers into a
 * single tabbed dialog. Selecting/editing on a tab only stages the change; the
 * dialog stays open until the user clicks Apply, which commits every staged aspect.
 */
export class AppearanceModal extends Modal {
    private params: AppearanceModalParams;
    private iconService = getIconService();
    private iconView?: IconPickerModal;
    private colorView?: ColorPickerModal;
    private backgroundView?: ColorPickerModal;
    private tabs: AppearanceTab[] = [];
    private activeTabId: string | null = null;
    private domDisposers: (() => void)[] = [];
    private previewItem!: HTMLDivElement;
    private previewIconEl!: HTMLSpanElement;

    constructor(app: App, params: AppearanceModalParams) {
        super(app);
        this.params = params;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        this.modalEl.addClass('nn-appearance-modal');

        // Header doubles as a live preview of the item with the staged appearance
        const header = contentEl.createDiv('nn-appearance-header');
        const preview = header.createDiv('nn-appearance-preview');
        this.previewItem = preview.createDiv('nn-appearance-preview-item');
        this.previewIconEl = this.previewItem.createSpan('nn-appearance-preview-icon');
        this.previewItem.createSpan({ cls: 'nn-appearance-preview-name', text: this.params.title });

        const tabBar = contentEl.createDiv('nn-appearance-tabs');
        tabBar.setAttribute('role', 'tablist');

        const body = contentEl.createDiv('nn-appearance-body');

        if (this.params.icon) {
            this.addIconTab(tabBar, body, this.params.icon);
        }
        if (this.params.color) {
            this.addColorTab(tabBar, body, this.params.color, 'color', strings.modals.appearance.tabColor, strings.modals.appearance.resetColor);
        }
        if (this.params.background) {
            this.addColorTab(
                tabBar,
                body,
                this.params.background,
                'background',
                strings.modals.appearance.tabBackground,
                strings.modals.appearance.resetBackground
            );
        }

        const footer = contentEl.createDiv('nn-appearance-footer');
        const cancelButton = footer.createEl('button', { text: strings.common.cancel });
        this.domDisposers.push(addAsyncEventListener(cancelButton, 'click', () => this.close()));
        const applyButton = footer.createEl('button', { text: strings.modals.appearance.apply, cls: 'mod-cta' });
        this.domDisposers.push(addAsyncEventListener(applyButton, 'click', () => this.applyAll()));

        if (this.tabs.length > 0) {
            this.setActiveTab(this.tabs[0].id);
        }

        this.renderPreview();
    }

    /**
     * Updates the header preview to reflect the currently staged icon, text color
     * and background, mirroring how the item will look in the navigator.
     */
    private renderPreview(): void {
        if (!this.previewItem) {
            return;
        }

        let effectiveIcon: string | null = null;
        if (this.params.icon && this.iconView) {
            effectiveIcon = this.iconView.isIconCleared() ? null : (this.iconView.getStagedIcon() ?? null);
        }

        let effectiveColor: string | null = null;
        if (this.params.color && this.colorView) {
            effectiveColor = this.colorView.isCleared()
                ? null
                : this.colorView.isTouched()
                  ? this.colorView.getColor()
                  : this.params.color.initial;
        }

        let effectiveBackground: string | null = null;
        if (this.params.background && this.backgroundView) {
            effectiveBackground = this.backgroundView.isCleared()
                ? null
                : this.backgroundView.isTouched()
                  ? this.backgroundView.getColor()
                  : this.params.background.initial;
        }

        this.previewIconEl.empty();
        if (effectiveIcon) {
            this.iconService.renderIcon(this.previewIconEl, effectiveIcon);
            this.previewIconEl.removeClass('nn-appearance-preview-icon-empty');
        } else {
            this.previewIconEl.addClass('nn-appearance-preview-icon-empty');
        }

        if (effectiveColor) {
            this.previewItem.style.setProperty('--nn-preview-fg', effectiveColor);
        } else {
            this.previewItem.style.removeProperty('--nn-preview-fg');
        }

        if (effectiveBackground) {
            this.previewItem.style.setProperty('--nn-preview-bg', effectiveBackground);
        } else {
            this.previewItem.style.removeProperty('--nn-preview-bg');
        }
    }

    /**
     * Creates a tab button + panel, registers the activation handler, and returns the panel.
     */
    private createTab(tabBar: HTMLElement, body: HTMLElement, id: string, label: string, iconName: string): HTMLElement {
        const button = tabBar.createDiv({ cls: 'nn-appearance-tab' });
        button.setAttribute('role', 'tab');
        const tabIcon = button.createSpan('nn-appearance-tab-icon');
        setIcon(tabIcon, iconName);
        button.createSpan({ cls: 'nn-appearance-tab-label', text: label });

        const panel = body.createDiv('nn-appearance-panel nn-appearance-panel-hidden');

        this.tabs.push({ id, button, panel });
        this.domDisposers.push(addAsyncEventListener(button, 'click', () => this.setActiveTab(id)));
        return panel;
    }

    private addIconTab(tabBar: HTMLElement, body: HTMLElement, cfg: AppearanceIconAspect): void {
        const panel = this.createTab(tabBar, body, 'icon', strings.modals.appearance.tabIcon, 'lucide-image');

        const resetRow = panel.createDiv('nn-appearance-reset-row');
        const resetButton = this.createResetButton(resetRow, strings.modals.appearance.resetIcon);

        const view = new IconPickerModal(this.app, this.params.metadataService, this.params.itemPath, this.params.itemType, {
            currentIconId: cfg.initial ?? null,
            disableMetadataUpdates: true
        });
        this.iconView = view;

        const pickerHost = panel.createDiv('nn-appearance-picker-host');
        view.mountEmbedded(pickerHost, {
            onSelect: iconId => {
                this.setResetActive(resetButton, iconId === null);
                this.renderPreview();
            }
        });

        this.domDisposers.push(
            addAsyncEventListener(resetButton, 'click', () => {
                view.clearSelection();
                this.setResetActive(resetButton, true);
                this.renderPreview();
            })
        );
    }

    private addColorTab(
        tabBar: HTMLElement,
        body: HTMLElement,
        cfg: AppearanceColorAspect,
        id: 'color' | 'background',
        label: string,
        resetLabel: string
    ): void {
        const iconName = id === 'background' ? 'lucide-paint-bucket' : 'lucide-palette';
        const panel = this.createTab(tabBar, body, id, label, iconName);

        const resetRow = panel.createDiv('nn-appearance-reset-row');
        const resetButton = this.createResetButton(resetRow, resetLabel);

        const view = new ColorPickerModal(this.app, {
            title: this.params.title,
            initialColor: cfg.initial,
            settingsProvider: this.params.metadataService.getSettingsProvider(),
            // Unused in embedded mode; the host commits the value via applyAll()
            onChooseColor: () => undefined
        });

        if (id === 'background') {
            this.backgroundView = view;
        } else {
            this.colorView = view;
        }

        const pickerHost = panel.createDiv('nn-appearance-picker-host');
        view.mountInto(pickerHost, this.scope, {
            onUserEdit: () => {
                this.setResetActive(resetButton, false);
                this.renderPreview();
            }
        });

        this.domDisposers.push(
            addAsyncEventListener(resetButton, 'click', () => {
                view.markCleared();
                this.setResetActive(resetButton, true);
                this.renderPreview();
            })
        );
    }

    private createResetButton(container: HTMLElement, label: string): HTMLButtonElement {
        const button = container.createEl('button', { cls: 'nn-appearance-reset-button', text: label });
        return button;
    }

    private setResetActive(button: HTMLElement, active: boolean): void {
        button.toggleClass('nn-appearance-reset-active', active);
    }

    private setActiveTab(id: string): void {
        this.activeTabId = id;
        this.tabs.forEach(tab => {
            const isActive = tab.id === id;
            tab.button.toggleClass('nn-active', isActive);
            tab.panel.toggleClass('nn-appearance-panel-hidden', !isActive);
        });
    }

    /**
     * Commits every staged aspect, then closes the dialog.
     */
    private async applyAll(): Promise<void> {
        const actions: Promise<void>[] = [];

        if (this.params.icon && this.iconView) {
            const action = this.collectIconAction(this.iconView, this.params.icon);
            if (action) {
                actions.push(action);
            }
        }
        if (this.params.color && this.colorView) {
            const action = this.collectColorAction(this.colorView, this.params.color);
            if (action) {
                actions.push(action);
            }
        }
        if (this.params.background && this.backgroundView) {
            const action = this.collectColorAction(this.backgroundView, this.params.background);
            if (action) {
                actions.push(action);
            }
        }

        await Promise.all(actions);
        this.close();
    }

    private collectIconAction(view: IconPickerModal, cfg: AppearanceIconAspect): Promise<void> | null {
        if (view.isIconCleared()) {
            return cfg.initial ? cfg.apply(null) : null;
        }
        const staged = view.getStagedIcon();
        const initial = cfg.initial ?? undefined;
        if (staged !== undefined && staged !== initial) {
            return cfg.apply(staged);
        }
        return null;
    }

    private collectColorAction(view: ColorPickerModal, cfg: AppearanceColorAspect): Promise<void> | null {
        if (view.isCleared()) {
            return cfg.initial ? cfg.apply(null) : null;
        }
        if (view.isTouched()) {
            view.commitRecentColor();
            return cfg.apply(view.getColor());
        }
        return null;
    }

    onClose() {
        const { contentEl } = this;
        this.iconView?.detach();
        this.colorView?.detach();
        this.backgroundView?.detach();
        this.iconView = undefined;
        this.colorView = undefined;
        this.backgroundView = undefined;
        this.tabs = [];
        this.activeTabId = null;
        if (this.domDisposers.length) {
            this.domDisposers.forEach(dispose => {
                try {
                    dispose();
                } catch (e) {
                    console.error('Error disposing appearance modal listener:', e);
                }
            });
            this.domDisposers = [];
        }
        contentEl.empty();
        this.modalEl.removeClass('nn-appearance-modal');
    }
}
