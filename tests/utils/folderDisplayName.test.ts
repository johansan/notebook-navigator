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
import { resolveFolderDisplayName, resolveFolderDisplayPath, resolveFolderDisplayPathSegments } from '../../src/utils/folderDisplayName';
import type { MetadataService } from '../../src/services/MetadataService';

function createMetadataService(displayNames: Record<string, string | undefined>): Pick<MetadataService, 'getFolderDisplayData'> {
    return {
        getFolderDisplayData: folderPath => ({
            displayName: displayNames[folderPath],
            color: undefined,
            backgroundColor: undefined,
            icon: undefined
        })
    };
}

describe('folderDisplayName', () => {
    it('uses root folder note display metadata before the custom vault name', () => {
        const app = new App();
        Object.defineProperty(app.vault, 'getName', {
            configurable: true,
            value: () => 'Shared Scratch'
        });
        const metadataService = createMetadataService({
            '/': 'Vault home'
        });

        expect(
            resolveFolderDisplayName({
                app,
                metadataService,
                settings: { customVaultName: 'Scratch' },
                folderPath: '/',
                fallbackName: '/'
            })
        ).toBe('Vault home');
    });

    it('falls back to the custom vault name when root display metadata is missing', () => {
        const app = new App();
        Object.defineProperty(app.vault, 'getName', {
            configurable: true,
            value: () => 'Shared Scratch'
        });

        expect(
            resolveFolderDisplayName({
                app,
                metadataService: createMetadataService({}),
                settings: { customVaultName: 'Scratch' },
                folderPath: '/',
                fallbackName: '/'
            })
        ).toBe('Scratch');
    });

    it('resolves full paths with folder display names where available', () => {
        const metadataService = createMetadataService({
            Projects: 'Work',
            'Projects/Clients': undefined,
            'Projects/Clients/Acme': 'Acme Corp'
        });

        expect(resolveFolderDisplayPath({ metadataService, folderPath: 'Projects/Clients/Acme' })).toBe('Work/Clients/Acme Corp');
    });

    it('falls back to path segments when display names are missing', () => {
        const metadataService = createMetadataService({});

        expect(resolveFolderDisplayPath({ metadataService, folderPath: 'Archive/2026/May' })).toBe('Archive/2026/May');
    });

    it('omits the selected folder path while preserving descendant display names', () => {
        const metadataService = createMetadataService({
            Projects: 'Work',
            'Projects/Clients': 'Customers',
            'Projects/Clients/Acme': 'Acme Corp'
        });

        expect(
            resolveFolderDisplayPath({
                metadataService,
                folderPath: 'Projects/Clients/Acme',
                baseFolderPath: 'Projects'
            })
        ).toBe('Customers/Acme Corp');
    });

    it('keeps the vault-relative path when the selected folder is the vault root', () => {
        const metadataService = createMetadataService({});

        expect(
            resolveFolderDisplayPath({
                metadataService,
                folderPath: 'Projects/Clients/Acme',
                baseFolderPath: '/'
            })
        ).toBe('Projects/Clients/Acme');
    });

    it('resolves path segments with paths and display labels', () => {
        const metadataService = createMetadataService({
            Projects: 'Work',
            'Projects/Clients': undefined
        });

        expect(resolveFolderDisplayPathSegments({ metadataService, folderPath: 'Projects/Clients' })).toEqual([
            { path: 'Projects', label: 'Work' },
            { path: 'Projects/Clients', label: 'Clients' }
        ]);
    });
});
