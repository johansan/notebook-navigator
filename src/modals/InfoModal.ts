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

export interface InfoModalSection {
    title: string;
    items: string[];
}

export interface InfoModalContent {
    title: string;
    intro?: string;
    emphasizedIntro?: string;
    sections?: InfoModalSection[];
    items?: string[];
}

const INLINE_EMPHASIS_PATTERN = /`([^`]+)`/g;

// Appends text to a container, converting backtick-wrapped segments into <strong> elements.
function appendInlineEmphasisText(container: HTMLElement, value: string): void {
    if (!value) {
        return;
    }

    let currentIndex = 0;

    for (const match of value.matchAll(INLINE_EMPHASIS_PATTERN)) {
        const matchText = match[0];
        const emphasizedValue = match[1];
        if (!matchText || emphasizedValue === undefined) {
            continue;
        }

        const matchIndex = match.index ?? -1;
        if (matchIndex === -1) {
            break;
        }

        if (matchIndex > currentIndex) {
            container.appendText(value.slice(currentIndex, matchIndex));
        }

        const strongEl = container.createEl('strong');
        strongEl.textContent = emphasizedValue;
        currentIndex = matchIndex + matchText.length;
    }

    if (currentIndex < value.length) {
        container.appendText(value.slice(currentIndex));
    }
}

function appendInlineEmphasisList(container: HTMLElement, items: string[]): void {
    const listEl = container.createEl('ul');
    for (const itemText of items) {
        const itemEl = listEl.createEl('li');
        appendInlineEmphasisText(itemEl, itemText);
    }
}

export class InfoModal extends Modal {
    private readonly modalContent: InfoModalContent;

    constructor(app: App, modalContent: InfoModalContent) {
        super(app);
        this.modalContent = modalContent;
        this.modalEl.addClass('nn-search-help-modal');
        this.titleEl.setText(modalContent.title);
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        const scrollEl = contentEl.createDiv({ cls: 'nn-search-help-scroll' });

        // The emphasized paragraph renders first so callers can use it as a status banner
        // (for example the active search provider) above the descriptive intro text.
        if (this.modalContent.emphasizedIntro) {
            const introEl = scrollEl.createEl('p');
            introEl.createEl('strong', { text: this.modalContent.emphasizedIntro });
        }

        if (this.modalContent.intro) {
            scrollEl.createEl('p', { text: this.modalContent.intro });
        }

        const sections = this.modalContent.sections ?? [];
        if (sections.length > 0) {
            for (const section of sections) {
                scrollEl.createEl('h3', { text: section.title });
                appendInlineEmphasisList(scrollEl, section.items);
            }
            return;
        }

        if (this.modalContent.items && this.modalContent.items.length > 0) {
            appendInlineEmphasisList(scrollEl, this.modalContent.items);
        }
    }

    onClose(): void {
        this.modalEl.removeClass('nn-search-help-modal');
        this.contentEl.empty();
    }
}
