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

import { App } from 'obsidian';
import { describe, expect, it } from 'vitest';
import { WhatsNewModal } from '../../src/modals/WhatsNewModal';

interface CreateElementOptions {
    cls?: string | string[];
    text?: string;
}

interface WhatsNewModalFormatter {
    renderFormattedText(container: TestElement, text: string): void;
    renderInfoText(container: TestElement, text: string): void;
    renderYoutubeLink(container: TestElement, youtubeUrl: string, playButtonOptions?: { x: number; y: number; scale?: number }): void;
}

class TestStyle {
    private properties = new Map<string, string>();

    setProperty(name: string, value: string): void {
        this.properties.set(name, value);
    }

    getPropertyValue(name: string): string {
        return this.properties.get(name) ?? '';
    }
}

class TestText {
    constructor(readonly text: string) {}

    toMarkup(): string {
        return this.text;
    }
}

class TestElement {
    private attributes = new Map<string, string>();
    private children: (TestElement | TestText)[] = [];
    private classes: string[] = [];
    private eventListeners = new Map<string, (() => void)[]>();
    readonly style = new TestStyle();
    hidden = false;
    src = '';

    constructor(readonly tagName = 'div') {}

    appendText(text: string): void {
        this.children.push(new TestText(text));
    }

    createEl(tagName: string, options: CreateElementOptions = {}): TestElement {
        const child = new TestElement(tagName);
        child.applyOptions(options);
        this.children.push(child);
        return child;
    }

    createSpan(options: CreateElementOptions = {}): TestElement {
        const child = new TestElement('span');
        child.applyOptions(options);
        this.children.push(child);
        return child;
    }

    createDiv(options: CreateElementOptions = {}): TestElement {
        const child = new TestElement('div');
        child.applyOptions(options);
        this.children.push(child);
        return child;
    }

    setAttr(name: string, value: string): void {
        this.attributes.set(name, value);
    }

    addEventListener(type: string, listener: () => void): void {
        const listeners = this.eventListeners.get(type) ?? [];
        listeners.push(listener);
        this.eventListeners.set(type, listeners);
    }

    dispatch(type: string): void {
        this.eventListeners.get(type)?.forEach(listener => listener());
    }

    findByClass(className: string): TestElement | null {
        if (this.classes.includes(className)) {
            return this;
        }

        for (const child of this.children) {
            if (child instanceof TestElement) {
                const match = child.findByClass(className);
                if (match) {
                    return match;
                }
            }
        }

        return null;
    }

    toMarkup(): string {
        return this.children.map(child => (child instanceof TestText ? child.toMarkup() : child.toElementMarkup())).join('');
    }

    private applyOptions(options: CreateElementOptions): void {
        if (options.cls) {
            this.classes = Array.isArray(options.cls) ? options.cls : [options.cls];
        }

        if (options.text) {
            this.appendText(options.text);
        }
    }

    private formatAttributes(): string {
        const attributes = [...this.attributes.entries()];
        if (this.classes.length > 0) {
            attributes.unshift(['class', this.classes.join(' ')]);
        }

        if (attributes.length === 0) {
            return '';
        }

        return ` ${attributes.map(([name, value]) => `${name}="${value}"`).join(' ')}`;
    }

    private toElementMarkup(): string {
        if (this.tagName === 'br') {
            return '<br>';
        }

        return `<${this.tagName}${this.formatAttributes()}>${this.toMarkup()}</${this.tagName}>`;
    }
}

function createFormatter(): WhatsNewModalFormatter {
    return new WhatsNewModal(new App(), []) as unknown as WhatsNewModalFormatter;
}

describe('WhatsNewModal formatting', () => {
    it('renders newline and br markers as line breaks', () => {
        const formatter = createFormatter();
        const container = new TestElement();

        formatter.renderFormattedText(container, 'First\nSecond<br/>Third<br>Fourth\r\nFifth');

        expect(container.toMarkup()).toBe('First<br>Second<br>Third<br>Fourth<br>Fifth');
    });

    it('renders blank lines as separate info paragraphs', () => {
        const formatter = createFormatter();
        const container = new TestElement();

        formatter.renderInfoText(container, 'First **paragraph**\nwrapped\n\nSecond ==paragraph==');

        expect(container.toMarkup()).toBe(
            '<p class="nn-whats-new-info">First <strong>paragraph</strong><br>wrapped</p><p class="nn-whats-new-info">Second <span class="nn-highlight">paragraph</span></p>'
        );
    });

    it('renders consecutive br markers as separate info paragraphs', () => {
        const formatter = createFormatter();
        const container = new TestElement();

        formatter.renderInfoText(container, 'First paragraph<br/><br>Second paragraph');

        expect(container.toMarkup()).toBe(
            '<p class="nn-whats-new-info">First paragraph</p><p class="nn-whats-new-info">Second paragraph</p>'
        );
    });
});

describe('WhatsNewModal YouTube preview', () => {
    it('positions and scales the play button relative to the thumbnail', () => {
        const formatter = createFormatter();
        const container = new TestElement();

        formatter.renderYoutubeLink(container, 'invalid-url', { x: 80, y: 49, scale: 1.8 });

        const playButton = container.findByClass('nn-youtube-play');
        expect(playButton).not.toBeNull();
        expect(playButton?.style.getPropertyValue('--nn-youtube-play-x')).toBe('80%');
        expect(playButton?.style.getPropertyValue('--nn-youtube-play-y')).toBe('49%');
        expect(playButton?.style.getPropertyValue('--nn-youtube-play-scale')).toBe('1.8');
        expect(playButton?.hidden).toBe(false);
    });

    it('keeps the play button hidden until the thumbnail loads', () => {
        const formatter = createFormatter();
        const container = new TestElement();

        formatter.renderYoutubeLink(container, 'https://www.youtube.com/watch?v=video-id');

        const playButton = container.findByClass('nn-youtube-play');
        const image = container.findByClass('nn-whats-new-youtube-image');
        expect(playButton?.hidden).toBe(true);

        image?.dispatch('load');

        expect(playButton?.hidden).toBe(false);
    });
});
