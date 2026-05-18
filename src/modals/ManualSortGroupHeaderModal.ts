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

import { App, Modal, Setting, setIcon } from 'obsidian';
import { strings } from '../i18n';
import type { MetadataService } from '../services/MetadataService';
import { ItemType } from '../types';
import { runAsyncAction, type MaybePromise } from '../utils/async';
import { getIconService } from '../services/icons';
import {
    parseManualSortGroupHeaderTargetWordCount,
    type ManualSortGroupHeaderData,
    type ManualSortGroupHeaderWriteValue
} from '../utils/manualSort';
import { ColorPickerModal } from './ColorPickerModal';

interface ManualSortGroupHeaderModalOptions {
    metadataService: MetadataService;
}

export class ManualSortGroupHeaderModal extends Modal {
    private headerInputEl: HTMLInputElement | null = null;
    private targetInputEl: HTMLInputElement | null = null;
    private iconPreviewEl: HTMLSpanElement | null = null;
    private iconButtonTextEl: HTMLSpanElement | null = null;
    private colorPreviewEl: HTMLSpanElement | null = null;
    private colorButtonTextEl: HTMLSpanElement | null = null;
    private showWordCount = false;
    private iconId: string | null = null;
    private color: string | null = null;
    private isSubmitting = false;

    constructor(
        app: App,
        private readonly initialValue: ManualSortGroupHeaderData | null,
        private readonly onSubmit: (value: ManualSortGroupHeaderWriteValue) => MaybePromise,
        private readonly options: ManualSortGroupHeaderModalOptions
    ) {
        super(app);
        this.showWordCount = initialValue?.showWordCount ?? false;
        this.iconId = initialValue?.iconId ?? null;
        this.color = initialValue?.color ?? null;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        this.modalEl.addClass('nn-manual-sort-group-header-modal');
        this.titleEl.setText(strings.modals.manualSortGroupHeader.title);

        contentEl.createDiv({
            cls: 'nn-input-description nn-manual-sort-header-description',
            text: strings.modals.manualSortGroupHeader.description
        });

        const headerSectionEl = this.createSection(contentEl);
        const titleFieldEl = headerSectionEl.createDiv({ cls: 'nn-manual-sort-header-field' });
        titleFieldEl.createDiv({ cls: 'nn-manual-sort-header-field-label', text: strings.modals.manualSortGroupHeader.titleLabel });
        this.headerInputEl = titleFieldEl.createEl('input', { cls: 'nn-manual-sort-header-input' });
        this.headerInputEl.type = 'text';
        this.headerInputEl.placeholder = strings.modals.manualSortGroupHeader.placeholder;
        this.headerInputEl.value = this.initialValue?.title ?? '';

        const appearanceSectionEl = this.createSection(contentEl);
        const appearanceActionsEl = appearanceSectionEl.createDiv({ cls: 'nn-manual-sort-header-appearance-actions' });

        const iconActionEl = appearanceActionsEl.createDiv({ cls: 'nn-manual-sort-header-action-row' });
        const iconButtonEl = iconActionEl.createEl('button', { cls: 'nn-manual-sort-header-style-button' });
        iconButtonEl.type = 'button';
        iconButtonEl.addEventListener('click', this.openIconPicker);
        this.iconPreviewEl = iconButtonEl.createSpan({ cls: 'nn-manual-sort-header-style-preview' });
        this.iconButtonTextEl = iconButtonEl.createSpan({ cls: 'nn-manual-sort-header-style-text' });
        this.updateIconControls();

        const colorActionEl = appearanceActionsEl.createDiv({ cls: 'nn-manual-sort-header-action-row' });
        const colorButtonEl = colorActionEl.createEl('button', { cls: 'nn-manual-sort-header-style-button' });
        colorButtonEl.type = 'button';
        colorButtonEl.addEventListener('click', this.openColorPicker);
        this.colorPreviewEl = colorButtonEl.createSpan({
            cls: 'nn-manual-sort-header-style-preview nn-color-swatch'
        });
        this.colorButtonTextEl = colorButtonEl.createSpan({ cls: 'nn-manual-sort-header-style-text' });
        this.updateColorControls();

        const wordCountSectionEl = this.createSection(contentEl);
        const wordCountSetting = new Setting(wordCountSectionEl).setName(strings.modals.manualSortGroupHeader.wordCount).addToggle(toggle =>
            toggle.setValue(this.showWordCount).onChange(value => {
                this.showWordCount = value;
                if (!value && this.targetInputEl) {
                    this.targetInputEl.value = '';
                }
                this.updateWordCountTargetControl();
            })
        );
        wordCountSetting.settingEl.addClass('nn-manual-sort-header-toggle-setting');

        const targetFieldEl = wordCountSectionEl.createDiv({ cls: 'nn-manual-sort-header-field nn-manual-sort-header-target-field' });
        targetFieldEl.createDiv({
            cls: 'nn-manual-sort-header-field-label',
            text: strings.modals.manualSortGroupHeader.wordCountTarget
        });
        this.targetInputEl = targetFieldEl.createEl('input', { cls: 'nn-manual-sort-header-input' });
        this.targetInputEl.type = 'text';
        this.targetInputEl.inputMode = 'numeric';
        this.targetInputEl.placeholder = strings.modals.manualSortGroupHeader.wordCountTargetPlaceholder;
        this.targetInputEl.value = this.showWordCount ? (this.initialValue?.targetWordCount?.toString() ?? '') : '';
        this.targetInputEl.addEventListener('input', this.filterTargetInput);
        targetFieldEl.createDiv({
            cls: 'nn-input-description nn-manual-sort-header-target-description',
            text: strings.modals.manualSortGroupHeader.wordCountTargetDescription
        });
        this.updateWordCountTargetControl();

        const buttonContainer = contentEl.createDiv('nn-button-container');
        const cancelBtn = buttonContainer.createEl('button', { text: strings.common.cancel });
        cancelBtn.addEventListener('click', this.handleCancelClick);

        const submitBtn = buttonContainer.createEl('button', {
            text: strings.common.save,
            cls: 'mod-cta'
        });
        submitBtn.addEventListener('click', this.handleSubmitClick);

        this.scope.register([], 'Enter', event => {
            const activeElement = activeDocument.activeElement;
            if (!(activeElement instanceof HTMLElement) || !this.contentEl.contains(activeElement)) {
                return;
            }

            event.preventDefault();
            this.handleSubmit();
        });

        this.headerInputEl?.focus();
        if (this.initialValue?.title) {
            this.headerInputEl?.select();
        }
    }

    onClose(): void {
        this.targetInputEl?.removeEventListener('input', this.filterTargetInput);
        this.modalEl.removeClass('nn-manual-sort-group-header-modal');
        this.contentEl.empty();
    }

    private createSection(containerEl: HTMLElement): HTMLElement {
        const sectionEl = containerEl.createDiv({ cls: 'nn-manual-sort-header-section' });
        return sectionEl;
    }

    private readonly openIconPicker = (): void => {
        runAsyncAction(async () => {
            const { IconPickerModal } = await import('./IconPickerModal');
            const picker = new IconPickerModal(this.app, this.options.metadataService, '', ItemType.FILE, {
                titleOverride: strings.modals.manualSortGroupHeader.icon,
                currentIconId: this.iconId,
                disableMetadataUpdates: true
            });

            picker.onChooseIcon = async iconId => {
                this.iconId = iconId;
                this.updateIconControls();
                return { handled: true };
            };

            picker.open();
        });
    };

    private readonly openColorPicker = (): void => {
        const modal = new ColorPickerModal(this.app, {
            title: strings.modals.manualSortGroupHeader.color,
            initialColor: this.color,
            settingsProvider: this.options.metadataService.getSettingsProvider(),
            onChooseColor: color => {
                this.color = color;
                this.updateColorControls();
            }
        });
        modal.open();
    };

    private updateIconControls(): void {
        if (this.iconButtonTextEl) {
            this.iconButtonTextEl.setText(strings.modals.manualSortGroupHeader.icon);
        }
        if (!this.iconPreviewEl) {
            return;
        }

        this.iconPreviewEl.empty();
        this.iconPreviewEl.toggleClass('is-empty', !this.iconId);
        if (this.iconId) {
            getIconService().renderIcon(this.iconPreviewEl, this.iconId, 16);
        } else {
            setIcon(this.iconPreviewEl, 'lucide-square-dashed');
        }
    }

    private updateColorControls(): void {
        if (this.colorButtonTextEl) {
            this.colorButtonTextEl.setText(strings.modals.manualSortGroupHeader.color);
        }
        if (!this.colorPreviewEl) {
            return;
        }

        this.colorPreviewEl.toggleClass('is-empty', !this.color);
        if (this.color) {
            this.colorPreviewEl.style.setProperty('--nn-manual-sort-header-preview-color', this.color);
        } else {
            this.colorPreviewEl.style.removeProperty('--nn-manual-sort-header-preview-color');
        }
    }

    private updateWordCountTargetControl(): void {
        if (!this.targetInputEl) {
            return;
        }

        this.targetInputEl.disabled = !this.showWordCount;
    }

    private readonly filterTargetInput = (): void => {
        if (!this.targetInputEl) {
            return;
        }

        this.targetInputEl.value = this.targetInputEl.value.replace(/[^\d,]/g, '');
    };

    private readonly handleCancelClick = (): void => {
        this.close();
    };

    private readonly handleSubmitClick = (): void => {
        this.handleSubmit();
    };

    private handleSubmit(): void {
        if (this.isSubmitting) {
            return;
        }

        const targetWordCount = this.showWordCount ? parseManualSortGroupHeaderTargetWordCount(this.targetInputEl?.value ?? '') : null;
        const value: ManualSortGroupHeaderWriteValue = {
            title: this.headerInputEl?.value ?? '',
            showWordCount: this.showWordCount,
            targetWordCount,
            iconId: this.iconId,
            color: this.color
        };

        this.isSubmitting = true;
        this.close();
        runAsyncAction(async () => {
            try {
                await this.onSubmit(value);
            } finally {
                this.isSubmitting = false;
            }
        });
    }
}
