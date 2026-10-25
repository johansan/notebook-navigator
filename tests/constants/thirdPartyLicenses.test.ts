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
import * as fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { THIRD_PARTY_PACKAGES } from '../../src/constants/thirdPartyLicenses';

describe('third-party license notices', () => {
    it('cover every runtime dependency by its exact package name', () => {
        const manifest = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
            dependencies: Record<string, string>;
        };
        expect(Object.keys(manifest.dependencies).filter(name => !THIRD_PARTY_PACKAGES.includes(name))).toEqual([]);
    });
});
