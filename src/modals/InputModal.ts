import { App, Modal } from 'obsidian';

export class InputModal extends Modal {
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