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
import { describe, expect, it } from 'vitest';
import {
    calculateSvgRenderDimensions,
    decodeSvgSourceText,
    parseSvgLengthAttribute,
    parseSvgViewBoxDimensions,
    prepareSvgFeatureImageSource,
    svgSourceDefinesDimensions
} from '../../src/services/content/thumbnail/svgFeatureImage';

function encodeUtf16(text: string, littleEndian: boolean): ArrayBuffer {
    const codeUnits = [0xfeff, ...Array.from(text, character => character.charCodeAt(0))];
    const buffer = new ArrayBuffer(codeUnits.length * 2);
    const view = new DataView(buffer);
    codeUnits.forEach((codeUnit, index) => view.setUint16(index * 2, codeUnit, littleEndian));
    return buffer;
}

describe('svgFeatureImage', () => {
    describe('decodeSvgSourceText', () => {
        const svgText = '<svg xmlns="http://www.w3.org/2000/svg"/>';

        it('decodes UTF-8 sources with and without a byte order mark', () => {
            expect(decodeSvgSourceText(new TextEncoder().encode(svgText).buffer)).toBe(svgText);
            expect(decodeSvgSourceText(new TextEncoder().encode('\ufeff' + svgText).buffer)).toBe(svgText);
        });

        it('decodes UTF-16 sources by their byte order mark', () => {
            expect(decodeSvgSourceText(encodeUtf16(svgText, true))).toBe(svgText);
            expect(decodeSvgSourceText(encodeUtf16(svgText, false))).toBe(svgText);
        });

        it('decodes empty buffers', () => {
            expect(decodeSvgSourceText(new ArrayBuffer(0))).toBe('');
        });
    });

    describe('parseSvgLengthAttribute', () => {
        it('parses unitless and px values', () => {
            expect(parseSvgLengthAttribute('128')).toBe(128);
            expect(parseSvgLengthAttribute(' 128.5 ')).toBe(128.5);
            expect(parseSvgLengthAttribute('128px')).toBe(128);
            expect(parseSvgLengthAttribute('128PX')).toBe(128);
            expect(parseSvgLengthAttribute('.5')).toBe(0.5);
        });

        it('parses exponent notation values', () => {
            expect(parseSvgLengthAttribute('6e2')).toBe(600);
            expect(parseSvgLengthAttribute('6E2')).toBe(600);
            expect(parseSvgLengthAttribute('1.5e+2')).toBe(150);
            expect(parseSvgLengthAttribute('5e-1')).toBe(0.5);
            expect(parseSvgLengthAttribute('6e2px')).toBe(600);
        });

        it('rejects other units, percentages, and non-positive values', () => {
            expect(parseSvgLengthAttribute('100%')).toBeNull();
            expect(parseSvgLengthAttribute('10em')).toBeNull();
            expect(parseSvgLengthAttribute('4cm')).toBeNull();
            expect(parseSvgLengthAttribute('0')).toBeNull();
            expect(parseSvgLengthAttribute('-5')).toBeNull();
            expect(parseSvgLengthAttribute('')).toBeNull();
            expect(parseSvgLengthAttribute(null)).toBeNull();
        });
    });

    describe('parseSvgViewBoxDimensions', () => {
        it('parses whitespace- and comma-separated viewBox values', () => {
            expect(parseSvgViewBoxDimensions('0 0 24 16')).toEqual({ width: 24, height: 16 });
            expect(parseSvgViewBoxDimensions('0,0,24,16')).toEqual({ width: 24, height: 16 });
            expect(parseSvgViewBoxDimensions(' -10 -10 24.5 16.25 ')).toEqual({ width: 24.5, height: 16.25 });
        });

        it('rejects malformed and non-positive viewBox values', () => {
            expect(parseSvgViewBoxDimensions('0 0 24')).toBeNull();
            expect(parseSvgViewBoxDimensions('0 0 0 16')).toBeNull();
            expect(parseSvgViewBoxDimensions('0 0 24 -16')).toBeNull();
            expect(parseSvgViewBoxDimensions('a b c d')).toBeNull();
            expect(parseSvgViewBoxDimensions('')).toBeNull();
            expect(parseSvgViewBoxDimensions(null)).toBeNull();
        });
    });

    describe('calculateSvgRenderDimensions', () => {
        it('scales small sources up to the thumbnail box', () => {
            expect(calculateSvgRenderDimensions({ width: 24, height: 24 }, { maxWidth: 256, maxHeight: 144 })).toEqual({
                width: 144,
                height: 144
            });
        });

        it('scales large sources down to the thumbnail box', () => {
            expect(calculateSvgRenderDimensions({ width: 1920, height: 1080 }, { maxWidth: 256, maxHeight: 144 })).toEqual({
                width: 256,
                height: 144
            });
        });

        it('clamps degenerate aspect ratios to at least one pixel', () => {
            expect(calculateSvgRenderDimensions({ width: 10000, height: 1 }, { maxWidth: 256, maxHeight: 144 })).toEqual({
                width: 256,
                height: 1
            });
        });
    });

    describe('svgSourceDefinesDimensions', () => {
        it('does not block selection in environments without a DOM', () => {
            // The vitest environment is node, so DOMParser is unavailable.
            expect(svgSourceDefinesDimensions('<svg xmlns="http://www.w3.org/2000/svg"/>')).toBe(true);
        });
    });

    describe('prepareSvgFeatureImageSource', () => {
        it('reports missing DOM APIs in environments without a DOM', () => {
            // The vitest environment is node, so DOMParser is unavailable.
            const result = prepareSvgFeatureImageSource({
                svgText: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>',
                maxWidth: 256,
                maxHeight: 144
            });

            expect(result.source).toBeNull();
            expect(result.reason).toBe('dom-parser-unavailable');
        });
    });
});
