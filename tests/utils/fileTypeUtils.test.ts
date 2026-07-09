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
import { describe, it, expect } from 'vitest';
import {
    getExtensionSuffix,
    isGeneratedThumbnailFile,
    isPrimaryDocumentFile,
    isRasterImageExtension,
    isRasterImageFile,
    isSvgExtension,
    isSvgFile,
    shouldShowExtensionSuffix
} from '../../src/utils/fileTypeUtils';
import { createTestTFile } from './createTestTFile';

describe('fileTypeUtils', () => {
    describe('extension suffix display', () => {
        it('hides suffix for Excalidraw composite extension files', () => {
            const file = createTestTFile('Drawing.excalidraw.md');
            expect(shouldShowExtensionSuffix(file)).toBe(false);
            expect(getExtensionSuffix(file)).toBe('');
        });

        it('shows suffix for Excalidraw extension files', () => {
            const file = createTestTFile('Drawing.excalidraw');
            expect(shouldShowExtensionSuffix(file)).toBe(true);
            expect(getExtensionSuffix(file)).toBe('.excalidraw');
        });

        it('shows suffix for supported non-core file types', () => {
            const file = createTestTFile('Document.pdf');
            expect(shouldShowExtensionSuffix(file)).toBe(true);
            expect(getExtensionSuffix(file)).toBe('.pdf');
        });

        it('hides suffix for markdown, canvas, and base files', () => {
            expect(getExtensionSuffix(createTestTFile('Note.md'))).toBe('');
            expect(getExtensionSuffix(createTestTFile('Board.canvas'))).toBe('');
            expect(getExtensionSuffix(createTestTFile('Data.base'))).toBe('');
        });

        it('identifies primary document files by extension', () => {
            expect(isPrimaryDocumentFile(createTestTFile('Note.md'))).toBe(true);
            expect(isPrimaryDocumentFile(createTestTFile('Board.canvas'))).toBe(true);
            expect(isPrimaryDocumentFile(createTestTFile('Data.base'))).toBe(true);
            expect(isPrimaryDocumentFile(createTestTFile('Asset.png'))).toBe(false);
        });

        it('excludes SVG files from raster image helpers', () => {
            expect(isSvgExtension('SVG')).toBe(true);
            expect(isSvgFile(createTestTFile('Vector.svg'))).toBe(true);
            expect(isSvgFile(createTestTFile('Photo.png'))).toBe(false);
            expect(isRasterImageExtension('svg')).toBe(false);
            expect(isRasterImageFile(createTestTFile('Vector.svg'))).toBe(false);
            expect(isRasterImageFile(createTestTFile('Photo.png'))).toBe(true);
        });

        it('identifies PDF and SVG files as generated thumbnail sources', () => {
            expect(isGeneratedThumbnailFile(createTestTFile('Document.pdf'))).toBe(true);
            expect(isGeneratedThumbnailFile(createTestTFile('Vector.svg'))).toBe(true);
            expect(isGeneratedThumbnailFile(createTestTFile('Photo.png'))).toBe(false);
            expect(isGeneratedThumbnailFile(createTestTFile('Note.md'))).toBe(false);
        });
    });
});
