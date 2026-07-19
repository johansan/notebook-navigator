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

import { App, TFile, type CachedMetadata } from 'obsidian';
import { describe, expect, it } from 'vitest';
import { MarkdownPipelineContentProvider } from '../../src/services/content/MarkdownPipelineContentProvider';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import { deriveFileMetadata } from '../utils/pathMetadata';

class TestMarkdownPipelineContentProvider extends MarkdownPipelineContentProvider {
    async runProcessFile(file: TFile, settings: NotebookNavigatorSettings) {
        return await this.processFile({ file, path: file.path }, null, settings);
    }
}

function createFile(path: string): TFile {
    const file = new TFile();
    const metadata = deriveFileMetadata(path);
    file.path = path;
    file.name = metadata.name;
    file.basename = metadata.basename;
    file.extension = metadata.extension;
    return file;
}

function createSettings(): NotebookNavigatorSettings {
    return {
        ...structuredClone(DEFAULT_SETTINGS),
        showFilePreview: true,
        previewProperties: ['summary', 'description'],
        previewPropertiesFallback: true,
        showFeatureImage: false
    };
}

function createApp(metadata: CachedMetadata): App {
    const app = new App();
    app.metadataCache.getFileCache = () => metadata;
    app.vault.cachedRead = async () => {
        throw new Error('Drawing body must not be read for preview text');
    };
    return app;
}

describe('MarkdownPipelineContentProvider Preview properties', () => {
    it('uses Preview properties for Excalidraw drawings', async () => {
        const app = createApp({
            frontmatter: {
                'excalidraw-plugin': 'parsed',
                description: 'Architecture sketch'
            }
        });
        const provider = new TestMarkdownPipelineContentProvider(app);
        const file = createFile('drawings/architecture.excalidraw.md');

        const result = await provider.runProcessFile(file, createSettings());

        expect(result.processed).toBe(true);
        expect(result.update?.preview).toBe('Architecture sketch');
    });

    it('does not fall back to Excalidraw drawing content', async () => {
        const app = createApp({ frontmatter: { 'excalidraw-plugin': 'parsed' } });
        const provider = new TestMarkdownPipelineContentProvider(app);
        const file = createFile('drawings/architecture.excalidraw.md');

        const result = await provider.runProcessFile(file, createSettings());

        expect(result.processed).toBe(true);
        expect(result.update?.preview).toBe('');
    });

    it('waits for Preview property frontmatter on recent Excalidraw drawings', async () => {
        const app = createApp({});
        const provider = new TestMarkdownPipelineContentProvider(app);
        const file = createFile('drawings/recent.excalidraw.md');
        file.stat.mtime = Date.now();

        const result = await provider.runProcessFile(file, createSettings());

        expect(result.processed).toBe(false);
        expect(result.update).toBeNull();
    });
});
