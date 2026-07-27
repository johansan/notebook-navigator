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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { App, TFile } from 'obsidian';
import { OmnisearchService } from '../../src/services/OmnisearchService';
import { createTestTFile } from '../utils/createTestTFile';

interface RawMatch {
    match: string;
    offset: number;
}

interface RawResult {
    score: number;
    vault: string;
    path: string;
    basename: string;
    foundWords: string[];
    matches: RawMatch[];
    excerpt: string;
}

interface OmnisearchApiStub {
    search: (query: string) => Promise<unknown[]>;
    refreshIndex: () => Promise<void>;
    registerOnIndexed: (callback: () => void) => void;
    unregisterOnIndexed: (callback: () => void) => void;
}

function createOmnisearchApi(searchHandler: (query: string) => Promise<unknown[]>): {
    api: OmnisearchApiStub;
    search: ReturnType<typeof vi.fn>;
} {
    const search = vi.fn(searchHandler);
    const api: OmnisearchApiStub = {
        search,
        refreshIndex: vi.fn(async () => undefined),
        registerOnIndexed: vi.fn(() => undefined),
        unregisterOnIndexed: vi.fn(() => undefined)
    };
    return { api, search };
}

function installOmnisearchApi(searchHandler: (query: string) => Promise<unknown[]>): ReturnType<typeof vi.fn> {
    const { api, search } = createOmnisearchApi(searchHandler);
    vi.stubGlobal('omnisearch', api);
    return search;
}

/** Registers the API through the plugin manager so the service can read the manifest version. */
function installOmnisearchPlugin(
    app: App,
    version: string,
    searchHandler: (query: string) => Promise<unknown[]>
): ReturnType<typeof vi.fn> {
    const { api, search } = createOmnisearchApi(searchHandler);
    (app as App & { plugins?: unknown }).plugins = {
        plugins: {
            omnisearch: { api, manifest: { version } }
        }
    };
    return search;
}

function createRawResult(path: string): RawResult {
    const file = createTestTFile(path);
    return {
        score: 10,
        vault: 'main',
        path: file.path,
        basename: file.basename,
        foundWords: ['term'],
        matches: [{ match: 'term', offset: 0 }],
        excerpt: 'term excerpt'
    };
}

function mockVaultFiles(app: App, filesByPath: Map<string, TFile>): void {
    vi.spyOn(app.vault, 'getAbstractFileByPath').mockImplementation(path => filesByPath.get(path) ?? null);
}

describe('OmnisearchService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        Reflect.deleteProperty(activeWindow, 'omnisearch');
    });

    it('appends a scoped path filter when pathScope is safe', async () => {
        const app = new App();
        const file = createTestTFile('Projects/alpha.md');
        mockVaultFiles(app, new Map([[file.path, file]]));

        const search = installOmnisearchApi(async () => [createRawResult(file.path)]);
        const service = new OmnisearchService(app);

        const hits = await service.search('meeting notes', { pathScope: 'Projects' });

        expect(search).toHaveBeenCalledWith('meeting notes path:"Projects/"');
        expect(hits).toHaveLength(1);
        expect(hits[0]?.path).toBe(file.path);
    });

    it('preserves user-provided path filters in query text', async () => {
        const app = new App();
        const search = installOmnisearchApi(async () => []);
        const service = new OmnisearchService(app);

        const queries = ['meeting path:"Archive"', 'meeting -path:"Archive"'];
        for (const query of queries) {
            await service.search(query, { pathScope: 'Projects' });
        }

        expect(search).toHaveBeenNthCalledWith(1, queries[0]);
        expect(search).toHaveBeenNthCalledWith(2, queries[1]);
    });

    it('scopes ASCII paths with special characters regardless of version', async () => {
        const app = new App();
        const search = installOmnisearchApi(async () => []);
        const service = new OmnisearchService(app);

        await service.search('meeting', { pathScope: 'Projects & Ops' });
        await service.search('meeting', { pathScope: 'Projects (2026)' });

        expect(search).toHaveBeenNthCalledWith(1, 'meeting path:"Projects & Ops/"');
        expect(search).toHaveBeenNthCalledWith(2, 'meeting path:"Projects (2026)/"');
    });

    it('skips path-scope injection for quoted folder names', async () => {
        const app = new App();
        const search = installOmnisearchApi(async () => []);
        const service = new OmnisearchService(app);

        await service.search('meeting', { pathScope: 'Quotes "and" more' });

        expect(search).toHaveBeenCalledWith('meeting');
    });

    // Parser contract: Omnisearch's query parser splits keyword values on commas,
    // which would turn one folder scope into multiple OR'd path filters.
    it('skips path-scope injection for folder names with commas', async () => {
        const app = new App();
        const search = installOmnisearchApi(async () => []);
        const service = new OmnisearchService(app);

        await service.search('meeting', { pathScope: 'Projects, 2026' });

        expect(search).toHaveBeenCalledWith('meeting');
    });

    it('skips non-ASCII path scopes when the Omnisearch version is unknown', async () => {
        const app = new App();
        const search = installOmnisearchApi(async () => []);
        const service = new OmnisearchService(app);

        await service.search('meeting', { pathScope: 'Málaga' });

        expect(search).toHaveBeenCalledWith('meeting');
    });

    it('scopes non-ASCII paths when Omnisearch is 1.30.0 or later', async () => {
        const app = new App();
        const search = installOmnisearchPlugin(app, '1.30.0', async () => []);
        const service = new OmnisearchService(app);

        await service.search('meeting', { pathScope: 'Personligt/Möten' });

        expect(search).toHaveBeenCalledWith('meeting path:"Personligt/Möten/"');
    });

    it('skips non-ASCII path scopes on Omnisearch versions before 1.30.0', async () => {
        const app = new App();
        const search = installOmnisearchPlugin(app, '1.29.3', async () => []);
        const service = new OmnisearchService(app);

        await service.search('meeting', { pathScope: 'Personligt/Möten' });
        await service.search('meeting', { pathScope: 'Projects' });

        expect(search).toHaveBeenNthCalledWith(1, 'meeting');
        expect(search).toHaveBeenNthCalledWith(2, 'meeting path:"Projects/"');
    });

    it('returns an empty array when Omnisearch API search rejects', async () => {
        const app = new App();
        const search = installOmnisearchApi(async () => {
            throw new Error('search failed');
        });
        const service = new OmnisearchService(app);

        const hits = await service.search('meeting', { pathScope: 'Projects' });

        expect(search).toHaveBeenCalledTimes(1);
        expect(hits).toEqual([]);
    });

    it('filters missing-file and invalid API search results', async () => {
        const app = new App();
        const validFile = createTestTFile('Projects/alpha.md');
        mockVaultFiles(app, new Map([[validFile.path, validFile]]));

        const validResult = createRawResult(validFile.path);
        const missingFileResult = createRawResult('Projects');
        const invalidResult: unknown = { path: 42 };

        installOmnisearchApi(async () => [validResult, missingFileResult, invalidResult]);
        const service = new OmnisearchService(app);

        const hits = await service.search('meeting');

        expect(hits).toHaveLength(1);
        expect(hits[0]?.path).toBe(validFile.path);
    });
});
