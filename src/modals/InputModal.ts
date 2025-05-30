import { App, Modal } from 'obsidian';

/**
 * Modal dialog for accepting text input from the user
 * Used for file/folder creation and renaming operations
 * Supports Enter key submission and pre-filled default values
 */
export class InputModal extends Modal {
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
        private onSubmit: (value: string) => void,
        private defaultValue: string = ''
    ) {
        super(app);
        this.titleEl.setText(title);
        
        const inputEl = this.contentEl.createEl('input', {
            type: 'text',
            placeholder: placeholder,
            value: defaultValue
        });
        inputEl.addClass('nn-input');
        
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.close();
                this.onSubmit(inputEl.value);
            }
        });
        
        const buttonContainer = this.contentEl.createDiv('nn-button-container');
        
        const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
        cancelBtn.addEventListener('click', () => this.close());
        
        const submitBtn = buttonContainer.createEl('button', { 
            text: 'Submit',
            cls: 'mod-cta'
        });
        submitBtn.addEventListener('click', () => {
            this.close();
            this.onSubmit(inputEl.value);
        });
        
        inputEl.focus();
        if (defaultValue) {
            inputEl.select();
        }
    }
}