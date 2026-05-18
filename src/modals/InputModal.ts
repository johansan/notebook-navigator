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

import { App, Modal } from 'obsidian';
import { strings } from '../i18n';
import { runAsyncAction, type MaybePromise } from '../utils/async';

interface InputModalCheckboxOptions {
    label: string;
    defaultChecked?: boolean;
}

interface InputModalOptions {
    closeOnSubmit?: boolean;
    checkbox?: InputModalCheckboxOptions;
    description?: string;
    inputFilter?: (value: string) => string;
    onInputChange?: (context: { rawValue: string; filteredValue: string }) => void;
    submitButtonText?: string;
}

export interface InputModalSubmitContext {
    checkboxValue?: boolean;
}

/**
 * Modal dialog for accepting text input from the user
 * Used for file/folder creation and renaming operations
 * Supports Enter key submission and pre-filled default values
 */
export class InputModal extends Modal {
    private cancelBtn: HTMLButtonElement;
    private cancelHandler: () => void;
    private readonly closeOnSubmit: boolean;
    private isSubmitting = false;
    private inputEl: HTMLInputElement;
    private submitBtn: HTMLButtonElement;
    private submitHandler: () => void;
    private checkboxEl: HTMLInputElement | null = null;

    /**
     * Creates an input modal with text field and submit/cancel buttons
     * @param app - The Obsidian app instance
     * @param title - Modal title (e.g., "New Folder")
     * @param placeholder - Placeholder text for the input field
     * @param onSubmit - Callback to execute with the entered value
     * @param defaultValue - Optional pre-filled value for editing operations
     */
    constructor(
        app: App,
        title: string,
        placeholder: string,
        private onSubmit: (value: string, context?: InputModalSubmitContext) => MaybePromise,
        defaultValue: string = '',
        options?: InputModalOptions
    ) {
        super(app);
        this.titleEl.setText(title);
        this.closeOnSubmit = options?.closeOnSubmit ?? true;

        // Apply input filter to default value if provided
        const inputFilter = options?.inputFilter;
        const initialValue = inputFilter ? inputFilter(defaultValue) : defaultValue;

        if (options?.description) {
            this.contentEl.createDiv({ cls: 'nn-input-description', text: options.description });
        }

        this.inputEl = this.contentEl.createEl('input', {
            type: 'text',
            placeholder: placeholder,
            value: initialValue
        });
        this.inputEl.addClass('nn-input');

        // Store handlers for cleanup
        this.cancelHandler = () => this.close();
        this.submitHandler = () => this.handleSubmit();

        if (options?.checkbox) {
            const checkboxRow = this.contentEl.createEl('label', { cls: 'nn-input-checkbox-row' });
            this.checkboxEl = checkboxRow.createEl('input', {
                type: 'checkbox'
            });
            this.checkboxEl.checked = Boolean(options.checkbox.defaultChecked);
            checkboxRow.createSpan({ text: options.checkbox.label });
        }

        const buttonContainer = this.contentEl.createDiv('nn-button-container');

        this.cancelBtn = buttonContainer.createEl('button', { text: strings.common.cancel });
        this.cancelBtn.addEventListener('click', this.cancelHandler);

        this.submitBtn = buttonContainer.createEl('button', {
            text: options?.submitButtonText ?? strings.common.submit,
            cls: 'mod-cta'
        });
        this.submitBtn.addEventListener('click', this.submitHandler);

        // Use Obsidian scope for keyboard handling
        this.scope.register([], 'Enter', evt => {
            const activeElement = activeDocument.activeElement;
            if (!(activeElement instanceof HTMLElement)) {
                return;
            }

            if (!this.contentEl.contains(activeElement)) {
                return;
            }

            if (activeElement === this.cancelBtn) {
                return;
            }

            evt.preventDefault();
            this.handleSubmit();
        });

        this.inputEl.focus();
        if (defaultValue) {
            this.inputEl.select();
        }

        // Attach input filter listener if provided
        if (inputFilter || options?.onInputChange) {
            this.inputEl.addEventListener('input', () => {
                const rawValue = this.inputEl.value;
                const filteredValue = inputFilter ? inputFilter(rawValue) : rawValue;

                // Skip if no filtering occurred
                if (filteredValue !== rawValue) {
                    // Calculate cursor positions and how many characters were removed before them
                    const selectionStart = this.inputEl.selectionStart ?? rawValue.length;
                    const selectionEnd = this.inputEl.selectionEnd ?? selectionStart;
                    const removedBeforeStart =
                        selectionStart - (inputFilter ? inputFilter(rawValue.slice(0, selectionStart)).length : selectionStart);
                    const removedBeforeEnd =
                        selectionEnd - (inputFilter ? inputFilter(rawValue.slice(0, selectionEnd)).length : selectionEnd);

                    // Update value and adjust cursor position to account for removed characters
                    this.inputEl.value = filteredValue;
                    const newSelectionStart = Math.min(filteredValue.length, Math.max(0, selectionStart - removedBeforeStart));
                    const newSelectionEnd = Math.min(filteredValue.length, Math.max(0, selectionEnd - removedBeforeEnd));
                    this.inputEl.setSelectionRange(newSelectionStart, newSelectionEnd);
                }

                if (options?.onInputChange) {
                    options.onInputChange({ rawValue, filteredValue: this.inputEl.value });
                }
            });
        }
    }

    /**
     * Cleanup event listeners when modal is closed
     * Prevents duplicate handlers by removing button event listeners
     */
    onClose() {
        if (this.cancelBtn && this.cancelHandler) {
            this.cancelBtn.removeEventListener('click', this.cancelHandler);
        }
        if (this.submitBtn && this.submitHandler) {
            this.submitBtn.removeEventListener('click', this.submitHandler);
        }
    }

    /**
     * Submits the form value if no submission is currently in-flight.
     */
    private handleSubmit(): void {
        if (this.isSubmitting) {
            return;
        }

        const value = this.inputEl.value;
        if (this.closeOnSubmit) {
            this.close();
        }
        this.submitValue(value);
    }

    /**
     * Executes the submit callback asynchronously with the input value
     */
    private submitValue(value: string): void {
        if (this.isSubmitting) {
            return;
        }
        this.isSubmitting = true;

        const context: InputModalSubmitContext | undefined = this.checkboxEl ? { checkboxValue: this.checkboxEl.checked } : undefined;
        runAsyncAction(async () => {
            try {
                await this.onSubmit(value, context);
            } finally {
                this.isSubmitting = false;
            }
        });
    }
}
