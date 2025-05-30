import { App, Modal } from 'obsidian';

/**
 * Modal dialog for confirming destructive actions
 * Used primarily for delete confirmations with a warning-styled confirm button
 * Provides Cancel and Delete buttons with appropriate styling
 */
export class ConfirmModal extends Modal {
    /**
     * Creates a confirmation modal with title, message, and callback
     * @param app - The Obsidian app instance
     * @param title - Modal title (e.g., "Delete 'filename'?")
     * @param message - Confirmation message to display
     * @param onConfirm - Callback to execute when user confirms the action
     */
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