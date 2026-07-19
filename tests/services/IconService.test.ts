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

import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { IconService } from '../../src/services/icons/IconService';
import type { IconProvider, IconRenderResult } from '../../src/services/icons/types';

interface FakeIconContainer {
    element: HTMLElement;
    getText: () => string;
}

function createContainer(): FakeIconContainer {
    let text = '';
    const element = {
        childElementCount: 0,
        get textContent() {
            return text;
        },
        empty: () => {
            text = '';
        },
        setText: (value: string) => {
            text = value;
        }
    } as unknown as HTMLElement;

    return { element, getText: () => text };
}

function createProvider(id: string, render: IconProvider['render']): IconProvider {
    return {
        id,
        name: id,
        render,
        search: () => [],
        getAll: () => [],
        isAvailable: () => true
    };
}

describe('IconService', () => {
    it('waits for a render promise created in another JavaScript realm', async () => {
        const service = IconService.getInstance();
        const container = createContainer();
        const foreignPromise = (runInNewContext('Promise.resolve()') as Promise<void>).then((): IconRenderResult => {
            container.element.setText('Glyph');
            return 'rendered';
        });
        const provider = createProvider('foreign-promise', () => foreignPromise);
        const fallbackProvider = createProvider('lucide', fallbackContainer => {
            fallbackContainer.setText('Fallback');
            return 'rendered';
        });

        expect(foreignPromise).not.toBeInstanceOf(Promise);
        service.registerProvider(provider);
        service.registerProvider(fallbackProvider);

        try {
            service.renderIcon(container.element, 'foreign-promise:camera');
            expect(container.getText()).toBe('');

            await foreignPromise;
            expect(container.getText()).toBe('Glyph');
        } finally {
            service.unregisterProvider(provider.id);
            service.unregisterProvider(fallbackProvider.id);
        }
    });
});
