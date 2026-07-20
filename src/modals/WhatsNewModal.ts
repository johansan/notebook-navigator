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

import { App, Modal, Platform, setIcon } from 'obsidian';
import { getReleaseBannerUrl, getReleaseVideoOpenUrl, getReleaseVideoUrl, SUPPORT_BUY_ME_A_COFFEE_URL } from '../constants/urls';
import { getCurrentLanguage, strings } from '../i18n';
import { ReleaseNote, YoutubePlayButtonOptions } from '../releaseNotes';
import { addAsyncEventListener } from '../utils/domEventListeners';
import { focusElementPreventScroll } from '../utils/domUtils';
import { DateUtils } from '../utils/dateUtils';
import { getYoutubeThumbnailUrl, getYoutubeVideoId } from '../utils/youtubeUtils';

export class WhatsNewModal extends Modal {
    private releaseNotes: ReleaseNote[];
    private thanksButton: HTMLButtonElement | null = null;
    private onCloseCallback?: () => void;
    private domDisposers: (() => void)[] = [];

    private normalizeTextBreaks(text: string): string {
        return text.replace(/\r\n?/g, '\n').replace(/<br\s*\/?>/gi, '\n');
    }

    // Renders limited formatting into a container element.
    // Supports:
    // - **bold**
    // - `inline code`
    // - ==text== (highlight as red + bold)
    // - [label](https://link)
    // - Auto-link bare http(s) URLs
    // - Line breaks: single \n or <br> becomes <br>
    private renderFormattedText(container: HTMLElement, text: string): void {
        const renderInline = (segment: string, dest: HTMLElement) => {
            const pattern = /==([\s\S]*?)==|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|(https?:\/\/[^\s]+)/g;
            let lastIndex = 0;
            let match: RegExpExecArray | null;

            const appendText = (t: string) => {
                if (t.length > 0) dest.appendText(t);
            };

            while ((match = pattern.exec(segment)) !== null) {
                appendText(segment.slice(lastIndex, match.index));

                if (match[1]) {
                    // ==highlight== -> highlight span, supports nested formatting inside
                    const highlight = dest.createSpan({ cls: 'nn-highlight' });
                    renderInline(match[1], highlight);
                } else if (match[2] && match[3]) {
                    // Markdown link [label](url)
                    const a = dest.createEl('a', { text: match[2] });
                    a.setAttr('href', match[3]);
                    a.setAttr('rel', 'noopener noreferrer');
                    a.setAttr('target', '_blank');
                } else if (match[4]) {
                    // `inline code`
                    dest.createEl('code', { text: match[4] });
                } else if (match[5]) {
                    // **bold**
                    dest.createEl('strong', { text: match[5] });
                } else if (match[6]) {
                    // Bare URL - strip trailing punctuation that's likely not part of the URL
                    let url = match[6];
                    let trailing = '';
                    const trailingMatch = url.match(/[.,;:!?)]+$/);
                    if (trailingMatch) {
                        trailing = trailingMatch[0];
                        url = url.slice(0, -trailing.length);
                    }
                    const a = dest.createEl('a', { text: url });
                    a.setAttr('href', url);
                    a.setAttr('rel', 'noopener noreferrer');
                    a.setAttr('target', '_blank');
                    if (trailing) {
                        appendText(trailing);
                    }
                }

                lastIndex = pattern.lastIndex;
            }

            appendText(segment.slice(lastIndex));
        };

        const lines = this.normalizeTextBreaks(text).split('\n');
        for (let i = 0; i < lines.length; i++) {
            renderInline(lines[i], container);
            if (i < lines.length - 1) {
                container.createEl('br');
            }
        }
    }

    private renderInfoText(container: HTMLElement, text: string): void {
        const normalizedText = this.normalizeTextBreaks(text).trim();
        if (normalizedText.length === 0) {
            return;
        }

        const paragraphs = normalizedText
            .split(/\n[ \t]*\n+/)
            .map(paragraph => paragraph.trim())
            .filter(paragraph => paragraph.length > 0);

        paragraphs.forEach(paragraph => {
            const p = container.createEl('p', { cls: 'nn-whats-new-info' });
            this.renderFormattedText(p, paragraph);
        });
    }

    private renderReleaseBanner(container: HTMLElement, imageUrl: string, isClickable: boolean): void {
        let banner: HTMLElement;
        if (isClickable) {
            const link = container.createEl('a', { cls: 'nn-whats-new-banner' });
            link.setAttr('href', imageUrl);
            link.setAttr('rel', 'noopener noreferrer');
            link.setAttr('target', '_blank');
            link.setAttr('aria-label', strings.whatsNew.openBannerImage);
            banner = link;
        } else {
            banner = container.createDiv({ cls: 'nn-whats-new-banner' });
        }

        const image = banner.createEl('img', { cls: 'nn-whats-new-banner-image' });
        image.setAttr('alt', '');
        image.setAttr('loading', 'lazy');
        image.setAttr('decoding', 'async');

        image.addEventListener('error', () => {
            banner.remove();
        });

        image.src = imageUrl;
    }

    private renderReleaseVideo(container: HTMLElement, videoUrl: string, openUrl: string | null): void {
        const frame = container.createDiv({ cls: 'nn-whats-new-video-frame' });
        const video = frame.createEl('video', { cls: 'nn-whats-new-video' });

        video.autoplay = true;
        video.defaultMuted = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.setAttr('autoplay', '');
        video.setAttr('loop', '');
        video.setAttr('muted', '');
        video.setAttr('playsinline', '');
        video.setAttr('webkit-playsinline', '');

        video.addEventListener('error', () => {
            frame.remove();
        });

        video.src = videoUrl;

        if (openUrl) {
            const openLink = frame.createEl('a', { cls: 'nn-whats-new-video-open' });
            openLink.setAttr('href', openUrl);
            openLink.setAttr('rel', 'noopener noreferrer');
            openLink.setAttr('target', '_blank');
            openLink.setAttr('aria-label', strings.modals.welcome.openVideoButton);
            setIcon(openLink, 'external-link');
        }
    }

    private renderYoutubeLink(container: HTMLElement, youtubeUrl: string, playButtonOptions?: YoutubePlayButtonOptions): void {
        const link = container.createEl('a', { cls: 'nn-whats-new-youtube-link' });
        link.setAttr('href', youtubeUrl);
        link.setAttr('rel', 'noopener noreferrer');
        link.setAttr('target', '_blank');
        link.setAttr('aria-label', strings.modals.welcome.openVideoButton);

        const thumbnail = link.createDiv({ cls: 'nn-whats-new-youtube-thumbnail' });

        const videoId = getYoutubeVideoId(youtubeUrl);
        let image: HTMLImageElement | null = null;
        if (videoId) {
            image = thumbnail.createEl('img', { cls: 'nn-whats-new-youtube-image' });
            image.setAttr('alt', strings.modals.welcome.openVideoButton);
            image.setAttr('loading', 'lazy');
        } else {
            thumbnail.createDiv({ cls: 'nn-whats-new-youtube-placeholder', text: strings.modals.welcome.openVideoButton });
        }

        const playButton = thumbnail.createDiv({ cls: 'nn-youtube-play' });
        playButton.setAttr('aria-hidden', 'true');

        if (playButtonOptions) {
            // Thumbnail-relative percentages preserve the intended placement as the modal width changes.
            playButton.style.setProperty('--nn-youtube-play-x', `${playButtonOptions.x}%`);
            playButton.style.setProperty('--nn-youtube-play-y', `${playButtonOptions.y}%`);
            if (playButtonOptions.scale !== undefined) {
                playButton.style.setProperty('--nn-youtube-play-scale', playButtonOptions.scale.toString());
            }
        }

        if (image && videoId) {
            const primaryUrl = getYoutubeThumbnailUrl(videoId, 'maxresdefault.jpg');
            const fallbackUrl = getYoutubeThumbnailUrl(videoId, 'hqdefault.jpg');

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
    }

    constructor(app: App, releaseNotes: ReleaseNote[], onCloseCallback?: () => void) {
        super(app);
        this.releaseNotes = releaseNotes;
        this.onCloseCallback = onCloseCallback;
    }

    onOpen(): void {
        const { contentEl } = this;

        contentEl.empty();
        this.modalEl.addClass('nn-whats-new-modal');
        this.titleEl.setText(strings.whatsNew.title);

        this.attachCloseButtonHandler();

        const scrollContainer = contentEl.createDiv('nn-whats-new-scroll');

        const displayLocale = (getCurrentLanguage() || 'en').replace(/_/g, '-');

        this.releaseNotes.forEach(note => {
            const versionContainer = scrollContainer.createDiv('nn-whats-new-version');
            let headerText = `Version ${note.version}`;

            const parsedDate = DateUtils.parseLocalDayKey(note.date);
            if (parsedDate) {
                const formattedDate = DateUtils.formatLocalizedMonthDay(parsedDate, displayLocale);
                headerText = `${headerText} (${formattedDate})`;
            }
            versionContainer.createEl('h3', { text: headerText });

            const bannerUrl = getReleaseBannerUrl(note.bannerUrl, note.version);
            if (bannerUrl) {
                this.renderReleaseBanner(versionContainer, bannerUrl, note.bannerClickable === true);
            }

            const videoUrl = getReleaseVideoUrl(note.videoUrl, note.version);
            if (videoUrl) {
                const openUrl = note.videoClickable === true ? getReleaseVideoOpenUrl(note.videoUrl, note.version) : null;
                this.renderReleaseVideo(versionContainer, videoUrl, openUrl);
            }

            if (note.youtubeUrl) {
                this.renderYoutubeLink(versionContainer, note.youtubeUrl, note.youtubePlayButton);
            }

            if (note.info) {
                this.renderInfoText(versionContainer, note.info);
            }

            const categories = [
                { key: 'new', label: 'New' },
                { key: 'improved', label: 'Improved' },
                { key: 'changed', label: 'Changed' },
                { key: 'fixed', label: 'Fixed' }
            ];

            categories.forEach(category => {
                const items = note[category.key as keyof ReleaseNote] as string[] | undefined;
                if (items && items.length > 0) {
                    // Create category header
                    versionContainer.createEl('h4', {
                        text: category.label,
                        cls: 'nn-whats-new-category'
                    });

                    // Create list for this category
                    const categoryList = versionContainer.createEl('ul', {
                        cls: 'nn-whats-new-features'
                    });

                    items.forEach(item => {
                        const li = categoryList.createEl('li');
                        this.renderFormattedText(li, item);
                    });
                }
            });
        });

        // Add divider line right after scroll container
        contentEl.createDiv('nn-whats-new-divider');

        const supportContainer = contentEl.createDiv('nn-whats-new-support');

        supportContainer.createEl('p', {
            text: strings.whatsNew.supportMessage,
            cls: 'nn-whats-new-support-text'
        });

        const buttonContainer = contentEl.createDiv('nn-whats-new-buttons');

        // Create buttons directly without Setting wrapper
        const supportButton = buttonContainer.createEl('button', {
            cls: 'nn-support-button-small'
        });
        supportButton.setAttr('type', 'button');

        const supportIcon = supportButton.createSpan({ cls: 'nn-support-button-icon' });
        supportIcon.setAttr('aria-hidden', 'true');
        supportIcon.setText('☕');

        supportButton.createSpan({
            cls: 'nn-support-button-label',
            text: strings.whatsNew.supportButton
        });
        this.domDisposers.push(
            addAsyncEventListener(supportButton, 'click', () => {
                window.open(SUPPORT_BUY_ME_A_COFFEE_URL);
            })
        );

        const thanksButton = buttonContainer.createEl('button', {
            text: strings.whatsNew.thanksButton,
            cls: 'mod-cta'
        });
        this.domDisposers.push(
            addAsyncEventListener(thanksButton, 'click', () => {
                this.close();
            })
        );

        // Store reference to thanks button
        this.thanksButton = thanksButton;
    }

    open(): void {
        super.open();
        // Focus the thanks button after the modal is fully opened
        if (this.thanksButton && !Platform.isMobile) {
            // Use requestAnimationFrame to ensure DOM is ready
            window.requestAnimationFrame(() => {
                if (this.thanksButton) {
                    focusElementPreventScroll(this.thanksButton);
                }
            });
        }
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
        this.modalEl.removeClass('nn-whats-new-modal');
        if (this.domDisposers.length) {
            this.domDisposers.forEach(dispose => {
                try {
                    dispose();
                } catch (e) {
                    console.error("Error disposing what's new modal listener:", e);
                }
            });
            this.domDisposers = [];
        }

        // Call the callback when modal is closed
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
    }

    // Attaches event handlers to the modal close button to ensure proper modal closure
    private attachCloseButtonHandler(): void {
        const closeButton = this.modalEl.querySelector<HTMLElement>('.modal-close-button');
        if (!closeButton) {
            return;
        }

        const handleClose = (event: Event) => {
            event.preventDefault();
            this.close();
        };

        // Close modal on click or pointer down
        this.domDisposers.push(addAsyncEventListener(closeButton, 'click', handleClose));
        this.domDisposers.push(addAsyncEventListener(closeButton, 'pointerdown', handleClose));
    }
}
