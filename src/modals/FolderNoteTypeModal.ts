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

import { App, Modal } from 'obsidian';
import { strings } from '../i18n';
import { FolderNoteType } from '../types/folderNote';

/**
 * Modal dialog for choosing a folder note type
 * Displays three buttons: Markdown, Canvas, and Base
 * Used when the user has selected "Ask" as their folder note type preference
 */
export class FolderNoteTypeModal extends Modal {
    private markdownBtn: HTMLButtonElement;
    private canvasBtn: HTMLButtonElement;
    private baseBtn: HTMLButtonElement;
    private cancelBtn: HTMLButtonElement;
    private markdownHandler: () => void;
    private canvasHandler: () => void;
    private baseHandler: () => void;
    private cancelHandler: () => void;

    /**
     * Creates a folder note type selection modal
     * @param app - The Obsidian app instance
     * @param onSelect - Callback to execute when user selects a type, receives the selected type
     */
    constructor(app: App, private onSelect: (type: Exclude<FolderNoteType, 'ask'>) => void) {
        super(app);
        this.titleEl.setText(strings.modals.folderNoteType.title);

        const buttonContainer = this.contentEl.createDiv('nn-button-container-vertical');

        // Store references for cleanup
        this.markdownHandler = () => {
            this.close();
            this.onSelect('markdown');
        };

        this.canvasHandler = () => {
            this.close();
            this.onSelect('canvas');
        };

        this.baseHandler = () => {
            this.close();
            this.onSelect('base');
        };

        this.cancelHandler = () => this.close();

        // Create buttons for each type
        this.markdownBtn = buttonContainer.createEl('button', {
            text: strings.modals.folderNoteType.markdown
        });
        this.markdownBtn.addEventListener('click', this.markdownHandler);

        this.canvasBtn = buttonContainer.createEl('button', {
            text: strings.modals.folderNoteType.canvas
        });
        this.canvasBtn.addEventListener('click', this.canvasHandler);

        this.baseBtn = buttonContainer.createEl('button', {
            text: strings.modals.folderNoteType.base
        });
        this.baseBtn.addEventListener('click', this.baseHandler);

        this.cancelBtn = buttonContainer.createEl('button', {
            text: strings.common.cancel,
            cls: 'mod-warning'
        });
        this.cancelBtn.addEventListener('click', this.cancelHandler);

        // Keyboard shortcuts
        this.scope.register([], 'Escape', evt => {
            evt.preventDefault();
            this.close();
        });
    }

    /**
     * Cleanup event listeners when modal is closed
     * Prevents memory leaks by removing all event listeners
     */
    onClose() {
        if (this.markdownBtn && this.markdownHandler) {
            this.markdownBtn.removeEventListener('click', this.markdownHandler);
        }
        if (this.canvasBtn && this.canvasHandler) {
            this.canvasBtn.removeEventListener('click', this.canvasHandler);
        }
        if (this.baseBtn && this.baseHandler) {
            this.baseBtn.removeEventListener('click', this.baseHandler);
        }
        if (this.cancelBtn && this.cancelHandler) {
            this.cancelBtn.removeEventListener('click', this.cancelHandler);
        }
    }
}
