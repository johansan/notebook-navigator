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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InputModal } from '../../src/modals/InputModal';
import { promptForTemplateValues } from '../../src/modals/TemplatePromptModal';

interface FakeInputModal {
    title: string;
    closeOnSubmit: boolean;
    closed: boolean;
    onClose: () => void;
    submit: (value: string) => void;
    close: () => void;
}

/**
 * Stand-in for the input modal that mirrors the real submit order: with `closeOnSubmit` the modal closes before the
 * submit callback runs, which is exactly the case the prompt wrapper has to survive.
 */
vi.mock('../../src/modals/InputModal', () => {
    const instances: FakeInputModal[] = [];
    class FakeModal implements FakeInputModal {
        static instances = instances;
        closeOnSubmit: boolean;
        closed = false;
        constructor(
            _app: App,
            public title: string,
            _placeholder: string,
            private readonly onSubmit: (value: string) => unknown,
            _defaultValue = '',
            options?: { closeOnSubmit?: boolean }
        ) {
            this.closeOnSubmit = options?.closeOnSubmit ?? true;
            instances.push(this);
        }
        open(): void {}
        close(): void {
            this.closed = true;
            this.onClose();
        }
        onClose(): void {}
        submit(value: string): void {
            if (this.closeOnSubmit) {
                this.close();
            }
            this.onSubmit(value);
        }
    }
    return { InputModal: FakeModal };
});

function getInstances(): FakeInputModal[] {
    return (InputModal as unknown as { instances: FakeInputModal[] }).instances;
}

describe('promptForTemplateValues', () => {
    beforeEach(() => {
        getInstances().length = 0;
    });

    it('resolves submitted values in order and closes each modal after resolving', async () => {
        const app = new App();
        const pending = promptForTemplateValues(app, ['Title', 'Room']);
        await Promise.resolve();
        expect(getInstances().map(modal => modal.title)).toEqual(['Title']);

        getInstances()[0].submit('Weekly sync');
        await Promise.resolve();
        expect(getInstances()[0].closed).toBe(true);
        expect(getInstances().map(modal => modal.title)).toEqual(['Title', 'Room']);

        getInstances()[1].submit('4B');
        await expect(pending).resolves.toEqual({ Title: 'Weekly sync', Room: '4B' });
    });

    it('resolves null when a prompt is closed without submitting', async () => {
        const app = new App();
        const pending = promptForTemplateValues(app, ['Title', 'Room']);
        await Promise.resolve();

        getInstances()[0].close();
        await expect(pending).resolves.toBeNull();
        expect(getInstances()).toHaveLength(1);
    });

    it('resolves an empty record without opening a modal when there are no prompts', async () => {
        await expect(promptForTemplateValues(new App(), [])).resolves.toEqual({});
        expect(getInstances()).toHaveLength(0);
    });

    it('stores labels that collide with object prototype keys as plain values', async () => {
        const pending = promptForTemplateValues(new App(), ['__proto__']);
        await Promise.resolve();
        getInstances()[0].submit('kept');
        const values = await pending;
        expect(values?.['__proto__']).toBe('kept');
    });
});
