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

import { App, Modal, Setting } from 'obsidian';
import { strings } from '../i18n';
import { getIconService } from '../services/icons';
import type { MetadataService } from '../services/MetadataService';
import {
    DEFAULT_TEMPLATE_COMMAND_ICON,
    isTemplateCommandLocation,
    isTemplateCommandPlacement,
    type TemplateCommand
} from '../settings/types';
import { FilePathInputSuggest } from '../suggest/FilePathInputSuggest';
import { FolderPathInputSuggest } from '../suggest/FolderPathInputSuggest';
import { ItemType } from '../types';
import { runAsyncAction, type MaybePromise } from '../utils/async';
import { addAsyncEventListener } from '../utils/domEventListeners';

interface TemplateCommandModalOptions {
    /** Command to edit. The modal works on a copy and hands the result to `onSave`. */
    command: TemplateCommand;
    /** Template folder used to narrow the template file suggestions. Empty lists the whole vault. */
    templateFolder: string;
    isNew: boolean;
    /** Needed by the icon picker. Without it the icon cannot be changed. */
    metadataService: MetadataService | null;
    onSave: (command: TemplateCommand) => MaybePromise;
}

/** Edits the name, template, file name format, location, button placement and icon of a template command. */
export class TemplateCommandModal extends Modal {
    private readonly draft: TemplateCommand;
    private disposers: (() => void)[] = [];
    private folderSetting: Setting | null = null;
    private saveButton: HTMLButtonElement | null = null;
    private iconButtonEl: HTMLButtonElement | null = null;
    private iconPreviewEl: HTMLSpanElement | null = null;

    constructor(
        app: App,
        private readonly options: TemplateCommandModalOptions
    ) {
        super(app);
        this.draft = { ...options.command };
    }

    onOpen(): void {
        const labels = strings.modals.templateCommand;
        this.titleEl.setText(this.options.isNew ? labels.titleAdd : labels.titleEdit);
        this.contentEl.empty();
        this.modalEl.addClass('nn-template-command-modal');

        new Setting(this.contentEl).setName(labels.name).addText(text => {
            text.setPlaceholder(labels.namePlaceholder)
                .setValue(this.draft.name)
                .onChange(value => {
                    this.draft.name = value;
                    this.updateSaveButtonState();
                });
        });

        new Setting(this.contentEl)
            .setName(labels.template)
            .setDesc(labels.templateDesc)
            .addText(text => {
                text.setPlaceholder(labels.templatePlaceholder).setValue(this.draft.template);
                const suggest = new FilePathInputSuggest(this.app, text.inputEl, {
                    getBaseFolder: () => this.options.templateFolder,
                    includeFile: file => file.extension === 'md'
                });
                // The suggest writes the chosen path into the input, so the input event covers typing and picking.
                this.disposers.push(
                    addAsyncEventListener(text.inputEl, 'input', () => {
                        this.draft.template = text.inputEl.value;
                    }),
                    addAsyncEventListener(text.inputEl, 'click', () => suggest.open())
                );
            });

        new Setting(this.contentEl)
            .setName(labels.fileNameFormat)
            .setDesc(labels.fileNameFormatDesc)
            .addText(text => {
                text.setPlaceholder(labels.fileNameFormatPlaceholder)
                    .setValue(this.draft.fileNameFormat)
                    .onChange(value => {
                        this.draft.fileNameFormat = value;
                    });
            });

        new Setting(this.contentEl).setName(labels.location).addDropdown(dropdown => {
            dropdown
                .addOption('current', strings.settings.items.templateCommands.locationCurrent)
                .addOption('folder', strings.settings.items.templateCommands.locationFolder)
                .setValue(this.draft.location)
                .onChange(value => {
                    if (!isTemplateCommandLocation(value)) {
                        return;
                    }
                    this.draft.location = value;
                    this.updateFolderVisibility();
                });
        });

        this.folderSetting = new Setting(this.contentEl).setName(labels.folder).addText(text => {
            text.setPlaceholder(labels.folderPlaceholder).setValue(this.draft.folder);
            const suggest = new FolderPathInputSuggest(this.app, text.inputEl);
            this.disposers.push(
                addAsyncEventListener(text.inputEl, 'input', () => {
                    this.draft.folder = text.inputEl.value;
                }),
                addAsyncEventListener(text.inputEl, 'click', () => suggest.open())
            );
        });
        this.updateFolderVisibility();

        // Icon and placement share one row: the icon button opens the picker and is hidden while no button is placed.
        const buttonSetting = new Setting(this.contentEl).setName(labels.placement);
        this.iconButtonEl = buttonSetting.controlEl.createEl('button', {
            cls: 'nn-action-btn nn-template-command-icon-button',
            attr: { type: 'button', 'aria-label': labels.icon }
        });
        this.iconPreviewEl = this.iconButtonEl.createSpan();
        this.iconButtonEl.disabled = !this.options.metadataService;
        this.disposers.push(addAsyncEventListener(this.iconButtonEl, 'click', () => this.openIconPicker()));
        buttonSetting.addDropdown(dropdown => {
            dropdown
                .addOption('none', labels.placementNone)
                .addOption('ribbon', labels.placementRibbon)
                .addOption('tabBar', labels.placementTabBar)
                .setValue(this.draft.placement)
                .onChange(value => {
                    if (isTemplateCommandPlacement(value)) {
                        this.draft.placement = value;
                        this.updateIconVisibility();
                    }
                });
        });
        this.updateIconPreview();
        this.updateIconVisibility();

        const buttonContainer = this.contentEl.createDiv('nn-button-container');
        const cancelButton = buttonContainer.createEl('button', { text: strings.common.cancel });
        this.disposers.push(addAsyncEventListener(cancelButton, 'click', () => this.close()));
        this.saveButton = buttonContainer.createEl('button', { text: strings.common.save, cls: 'mod-cta' });
        this.disposers.push(
            addAsyncEventListener(this.saveButton, 'click', () => {
                if (!this.canSave()) {
                    return;
                }
                runAsyncAction(async () => {
                    await this.options.onSave({ ...this.draft, name: this.draft.name.trim() });
                    this.close();
                });
            })
        );
        this.updateSaveButtonState();
    }

    onClose(): void {
        this.disposers.forEach(dispose => dispose());
        this.disposers = [];
        this.folderSetting = null;
        this.saveButton = null;
        this.iconButtonEl = null;
        this.iconPreviewEl = null;
        this.modalEl.removeClass('nn-template-command-modal');
        this.contentEl.empty();
    }

    private openIconPicker(): void {
        const metadataService = this.options.metadataService;
        if (!metadataService) {
            return;
        }
        runAsyncAction(async () => {
            const { IconPickerModal } = await import('./IconPickerModal');
            // Ribbon and view actions are rendered by Obsidian, so only Lucide icons are offered.
            const picker = new IconPickerModal(this.app, metadataService, '', ItemType.FILE, {
                titleOverride: strings.modals.templateCommand.icon,
                currentIconId: this.draft.icon,
                disableMetadataUpdates: true,
                providerIds: ['lucide']
            });
            picker.onChooseIcon = async iconId => {
                // Removing the icon returns to the default rather than leaving the button without one.
                this.draft.icon = iconId ?? DEFAULT_TEMPLATE_COMMAND_ICON;
                this.updateIconPreview();
                return { handled: true };
            };
            picker.open();
        });
    }

    private updateIconPreview(): void {
        if (!this.iconPreviewEl) {
            return;
        }
        this.iconPreviewEl.empty();
        getIconService().renderIcon(this.iconPreviewEl, this.draft.icon, 16);
    }

    private updateIconVisibility(): void {
        this.iconButtonEl?.toggleClass('nn-setting-hidden', this.draft.placement === 'none');
    }

    private canSave(): boolean {
        return this.draft.name.trim().length > 0;
    }

    private updateSaveButtonState(): void {
        if (this.saveButton) {
            this.saveButton.disabled = !this.canSave();
        }
    }

    private updateFolderVisibility(): void {
        this.folderSetting?.settingEl.toggleClass('nn-setting-hidden', this.draft.location !== 'folder');
    }
}
