import { App, Modal } from 'obsidian';

export class ConfirmModal extends Modal {
    constructor(
        app: App,
        title: string,
        message: string,
        private onConfirm: () => void
    ) {
        super(app);
        this.titleEl.setText(title);
        this.contentEl.createEl('p', { text: message });
        
        const buttonContainer = this.contentEl.createDiv('nn-button-container');
        
        const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
        cancelBtn.addEventListener('click', () => this.close());
        
        const confirmBtn = buttonContainer.createEl('button', { 
            text: 'Delete',
            cls: 'mod-warning'
        });
        confirmBtn.addEventListener('click', () => {
            this.close();
            this.onConfirm();
        });
    }
}