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

import { App, Modal, Setting, TFolder } from 'obsidian';
import { strings } from '../i18n';
import { STORAGE_KEYS } from '../types';
import { runAsyncAction } from '../utils/async';
import { localStorage } from '../utils/localStorage';
import { normalizeMergeOutputBaseName, type MergeNotesSeparator } from '../utils/noteMerge';

const DEFAULT_MERGE_NOTES_SEPARATOR: MergeNotesSeparator = 'blank-line';
const DEFAULT_MERGE_NOTES_MOVE_SOURCES_TO_TRASH = false;

export interface MergeNotesModalSubmitValue {
    outputName: string;
    separator: MergeNotesSeparator;
    moveSourcesToTrash: boolean;
}

interface MergeNotesModalOptions {
    defaultOutputName: string;
    destinationFolder: TFolder;
    noteCount: number;
    showCrossFolderLinkWarning: boolean;
    onSubmit: (value: MergeNotesModalSubmitValue) => Promise<boolean> | boolean;
}

export class MergeNotesModal extends Modal {
    private readonly defaultOutputName: string;
    private readonly destinationFolder: TFolder;
    private readonly noteCount: number;
    private readonly showCrossFolderLinkWarning: boolean;
    private readonly onSubmit: (value: MergeNotesModalSubmitValue) => Promise<boolean> | boolean;
    private isSubmitting = false;
    private moveSourcesToTrash = loadMergeNotesMoveSourcesToTrash();
    private outputName = '';
    private separator: MergeNotesSeparator = loadMergeNotesSeparator();
    private submitBtn!: HTMLButtonElement;

    constructor(app: App, options: MergeNotesModalOptions) {
        super(app);
        this.defaultOutputName = options.defaultOutputName;
        this.destinationFolder = options.destinationFolder;
        this.noteCount = options.noteCount;
        this.showCrossFolderLinkWarning = options.showCrossFolderLinkWarning;
        this.onSubmit = options.onSubmit;
        this.outputName = options.defaultOutputName;
    }

    onOpen(): void {
        this.titleEl.setText(strings.modals.mergeNotes.title);

        this.contentEl.createDiv({
            cls: 'nn-input-description nn-merge-notes-summary',
            text: strings.modals.mergeNotes.summary
                .replace('{count}', this.noteCount.toString())
                .replace('{folder}', this.getDestinationFolderLabel())
        });

        new Setting(this.contentEl)
            .setName(strings.modals.mergeNotes.outputName)
            .setDesc(strings.modals.mergeNotes.outputNameDesc)
            .addText(text => {
                text.setPlaceholder(strings.modals.mergeNotes.outputNamePlaceholder)
                    .setValue(this.defaultOutputName)
                    .onChange(value => {
                        this.outputName = value;
                        this.updateSubmitState();
                    });
            });

        new Setting(this.contentEl)
            .setName(strings.modals.mergeNotes.separator)
            .setDesc(strings.modals.mergeNotes.separatorDesc)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('none', strings.modals.mergeNotes.separatorOptions.none)
                    .addOption('blank-line', strings.modals.mergeNotes.separatorOptions.blankLine)
                    .addOption('horizontal-rule', strings.modals.mergeNotes.separatorOptions.horizontalRule)
                    .addOption('heading', strings.modals.mergeNotes.separatorOptions.heading)
                    .setValue(this.separator)
                    .onChange(value => {
                        this.separator = this.parseSeparator(value);
                    });
            });

        new Setting(this.contentEl).setName(strings.modals.mergeNotes.moveSourcesToTrash).addToggle(toggle => {
            toggle.setValue(this.moveSourcesToTrash).onChange(value => {
                this.moveSourcesToTrash = value;
            });
        });

        this.renderMergeNotesDetails();

        const buttonContainer = this.contentEl.createDiv('nn-button-container');
        const cancelBtn = buttonContainer.createEl('button', { text: strings.common.cancel });
        cancelBtn.addEventListener('click', () => this.close());

        this.submitBtn = buttonContainer.createEl('button', {
            text: strings.modals.mergeNotes.mergeButton,
            cls: 'mod-cta'
        });
        this.submitBtn.addEventListener('click', () => this.submit());

        this.scope.register([], 'Enter', event => {
            const activeElement = activeDocument.activeElement;
            if (!(activeElement instanceof HTMLElement) || !this.contentEl.contains(activeElement)) {
                return;
            }

            event.preventDefault();
            this.submit();
        });

        this.updateSubmitState();
    }

    onClose(): void {
        this.contentEl.empty();
    }

    private getDestinationFolderLabel(): string {
        return this.destinationFolder.path === '/' ? strings.navigationPane.vaultRootLabel : this.destinationFolder.path;
    }

    private parseSeparator(value: string): MergeNotesSeparator {
        if (isMergeNotesSeparator(value)) {
            return value;
        }
        return DEFAULT_MERGE_NOTES_SEPARATOR;
    }

    private renderMergeNotesDetails(): void {
        const detailsEl = this.contentEl.createEl('p', {
            cls: 'nn-merge-notes-details',
            attr: { dir: 'auto' }
        });
        detailsEl.createSpan({ text: strings.modals.mergeNotes.frontmatterRule });
        if (!this.showCrossFolderLinkWarning) {
            return;
        }

        detailsEl.appendText(' ');
        detailsEl.createSpan({
            cls: 'nn-merge-notes-warning',
            text: strings.modals.mergeNotes.crossFolderWarning,
            attr: { dir: 'auto' }
        });
    }

    private updateSubmitState(): void {
        if (!this.submitBtn) {
            return;
        }

        const disabled = normalizeMergeOutputBaseName(this.outputName).length === 0 || this.isSubmitting;
        this.submitBtn.disabled = disabled;
        this.submitBtn.toggleClass('mod-disabled', disabled);
    }

    private submit(): void {
        if (this.isSubmitting || normalizeMergeOutputBaseName(this.outputName).length === 0) {
            return;
        }

        this.isSubmitting = true;
        this.updateSubmitState();

        runAsyncAction(async () => {
            try {
                const shouldClose = await this.onSubmit({
                    outputName: this.outputName,
                    separator: this.separator,
                    moveSourcesToTrash: this.moveSourcesToTrash
                });
                if (shouldClose) {
                    persistMergeNotesPreferences(this.separator, this.moveSourcesToTrash);
                    this.close();
                }
            } finally {
                this.isSubmitting = false;
                this.updateSubmitState();
            }
        });
    }
}

function loadMergeNotesSeparator(): MergeNotesSeparator {
    const stored = localStorage.get<unknown>(STORAGE_KEYS.mergeNotesSeparatorKey);
    return isMergeNotesSeparator(stored) ? stored : DEFAULT_MERGE_NOTES_SEPARATOR;
}

function loadMergeNotesMoveSourcesToTrash(): boolean {
    const stored = localStorage.get<unknown>(STORAGE_KEYS.mergeNotesMoveSourcesToTrashKey);
    return typeof stored === 'boolean' ? stored : DEFAULT_MERGE_NOTES_MOVE_SOURCES_TO_TRASH;
}

function persistMergeNotesPreferences(separator: MergeNotesSeparator, moveSourcesToTrash: boolean): void {
    localStorage.set(STORAGE_KEYS.mergeNotesSeparatorKey, separator);
    localStorage.set(STORAGE_KEYS.mergeNotesMoveSourcesToTrashKey, moveSourcesToTrash);
}

function isMergeNotesSeparator(value: unknown): value is MergeNotesSeparator {
    return value === 'none' || value === 'blank-line' || value === 'horizontal-rule' || value === 'heading';
}
