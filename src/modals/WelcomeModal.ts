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
import { WELCOME_VIDEO_URL } from '../constants/urls';
import { strings } from '../i18n';
import { addAsyncEventListener } from '../utils/domEventListeners';
import { getYoutubeThumbnailUrl, getYoutubeVideoId } from '../utils/youtubeUtils';

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

        const videoId = getYoutubeVideoId(WELCOME_VIDEO_URL);
        if (videoId) {
            const image = thumbnailFrame.createEl('img', {
                cls: 'nn-welcome-thumbnail',
                attr: {
                    alt: strings.modals.welcome.videoAlt,
                    width: '1920',
                    height: '1080'
                }
            });

            const primaryUrl = getYoutubeThumbnailUrl(videoId, 'maxresdefault.jpg');
            const fallbackUrl = getYoutubeThumbnailUrl(videoId, 'hqdefault.jpg');

            const playButton = thumbnailFrame.createDiv({
                cls: ['nn-youtube-play', 'nn-welcome-youtube-play']
            });
            playButton.setAttr('aria-hidden', 'true');

            // Keep the overlay hidden until the thumbnail is painted; otherwise it appears over the empty frame during loading.
            playButton.hidden = true;
            image.addEventListener('load', () => {
                playButton.hidden = false;
            });

            // YouTube does not generate a max-resolution image for every video, so retry once with its standard thumbnail.
            let usedFallback = false;
            image.addEventListener('error', () => {
                if (usedFallback) {
                    return;
                }
                usedFallback = true;
                image.src = fallbackUrl;
            });

            image.src = primaryUrl;
        }

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
