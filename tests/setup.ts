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

const fallbackDocument = {
    activeElement: null,
    body: {
        append: () => {},
        appendChild: () => {},
        classList: {
            contains: () => false
        }
    },
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null,
    removeEventListener: () => {}
} as unknown as Document;

// eslint-disable-next-line obsidianmd/no-global-this -- Vitest exposes the test runtime through globalThis.
const testWindow = globalThis as Window & typeof globalThis & { document?: Document };

Object.defineProperty(testWindow, 'activeWindow', {
    configurable: true,
    get: () => testWindow
});

Object.defineProperty(testWindow, 'window', {
    configurable: true,
    get: () => testWindow
});

Object.defineProperty(testWindow, 'activeDocument', {
    configurable: true,
    get: () => testWindow.document ?? fallbackDocument
});
