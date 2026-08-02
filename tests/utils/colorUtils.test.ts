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
import { createSolidBackgroundResolver, type RGBA } from '../../src/utils/colorUtils';

describe('createSolidBackgroundResolver', () => {
    it('scopes cached composites to one surface generation', () => {
        const darkSurface: RGBA = { r: 0, g: 0, b: 0, a: 1 };
        const lightSurface: RGBA = { r: 255, g: 255, b: 255, a: 1 };
        const transparentRed = 'rgba(255, 0, 0, 0.5)';

        const resolveDarkBackground = createSolidBackgroundResolver(darkSurface, () => null);
        expect(resolveDarkBackground(transparentRed)).toBe('rgb(128, 0, 0)');
        expect(resolveDarkBackground(transparentRed)).toBe('rgb(128, 0, 0)');

        const resolveLightBackground = createSolidBackgroundResolver(lightSurface, () => null);
        expect(resolveLightBackground(transparentRed)).toBe('rgb(255, 128, 128)');
    });
});
