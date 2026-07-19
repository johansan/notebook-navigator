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

import { Modal } from 'obsidian';
import { WELCOME_VIDEO_THUMBNAIL_URL, WELCOME_VIDEO_URL } from '../constants/urls';
import { strings } from '../i18n';
import { addAsyncEventListener } from '../utils/domEventListeners';

export class WelcomeModal extends Modal {
    private domDisposers: (() => void)[] = [];
    private openVideoButton: HTMLButtonElement | null = null;

    onOpen(): void {
        const pluginName = strings.plugin.viewName;

        this.modalEl.addClass('nn-welcome-modal');
        this.titleEl.setText(strings.modals.welcome.title.replace('{pluginName}', pluginName));
        this.contentEl.empty();

        this.attachCloseButtonHandler();

        const body = this.contentEl.createDiv({ cls: 'nn-welcome-body' });

        const paragraphs = [strings.modals.welcome.introText, strings.modals.welcome.continueText, strings.modals.welcome.thanksText];
        paragraphs.forEach(text => {
            body.createEl('p', {
                text,
                cls: 'nn-welcome-text'
            });
        });

        const thumbnailLink = body.createEl('a', {
            cls: 'nn-welcome-thumbnail-link',
            attr: {
                href: WELCOME_VIDEO_URL,
                target: '_blank',
                rel: 'noopener noreferrer'
            }
        });

        const thumbnailFrame = thumbnailLink.createDiv({ cls: 'nn-welcome-thumbnail-frame' });

        thumbnailFrame.createEl('img', {
            cls: 'nn-welcome-thumbnail',
            attr: {
                src: WELCOME_VIDEO_THUMBNAIL_URL,
                alt: strings.modals.welcome.videoAlt,
                width: '1920',
                height: '1080'
            }
        });

        const buttonContainer = this.contentEl.createDiv({ cls: 'nn-welcome-buttons' });

        const openVideoButton = buttonContainer.createEl('button', {
            text: strings.modals.welcome.openVideoButton,
            cls: 'mod-cta'
        });
        openVideoButton.setAttr('type', 'button');
        this.domDisposers.push(
            addAsyncEventListener(openVideoButton, 'click', () => {
                window.open(WELCOME_VIDEO_URL);
                this.close();
            })
        );
        this.openVideoButton = openVideoButton;

        const closeButton = buttonContainer.createEl('button', {
            text: strings.modals.welcome.closeButton
        });
        closeButton.setAttr('type', 'button');
        this.domDisposers.push(
            addAsyncEventListener(closeButton, 'click', () => {
                this.close();
            })
        );
    }

    open(): void {
        super.open();
        window.requestAnimationFrame(() => {
            this.openVideoButton?.focus();
        });
    }

    onClose(): void {
        this.contentEl.empty();
        this.modalEl.removeClass('nn-welcome-modal');
        this.openVideoButton = null;

        if (this.domDisposers.length) {
            this.domDisposers.forEach(dispose => {
                try {
                    dispose();
                } catch (error: unknown) {
                    console.error('Error disposing welcome modal listener:', error);
                }
            });
            this.domDisposers = [];
        }
    }

    private attachCloseButtonHandler(): void {
        const closeButton = this.modalEl.querySelector<HTMLElement>('.modal-close-button');
        if (!closeButton) {
            return;
        }

        const handleClose = (event: Event) => {
            event.preventDefault();
            this.close();
        };

        this.domDisposers.push(addAsyncEventListener(closeButton, 'click', handleClose));
        this.domDisposers.push(addAsyncEventListener(closeButton, 'pointerdown', handleClose));
    }
}
