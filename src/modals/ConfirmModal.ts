import { App, Modal } from 'obsidian';

/**
 * Modal dialog for confirming destructive actions
 * Used primarily for delete confirmations with a warning-styled confirm button
 * Provides Cancel and Delete buttons with appropriate styling
 */
export class ConfirmModal extends Modal {
    private cancelBtn: HTMLButtonElement;
    private confirmBtn: HTMLButtonElement;
    private cancelHandler: () => void;
    private confirmHandler: () => void;
    
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
        
        // Store references for cleanup
        this.cancelHandler = () => this.close();
        this.confirmHandler = () => {
            this.close();
            this.onConfirm();
        };
        
        this.cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
        this.cancelBtn.addEventListener('click', this.cancelHandler);
        
        this.confirmBtn = buttonContainer.createEl('button', { 
            text: 'Delete',
            cls: 'mod-warning'
        });
        this.confirmBtn.addEventListener('click', this.confirmHandler);
    }
    
    /**
     * Cleanup event listeners when modal is closed
     * Prevents memory leaks by removing all event listeners
     */
    onClose() {
        if (this.cancelBtn && this.cancelHandler) {
            this.cancelBtn.removeEventListener('click', this.cancelHandler);
        }
        if (this.confirmBtn && this.confirmHandler) {
            this.confirmBtn.removeEventListener('click', this.confirmHandler);
        }
    }
}