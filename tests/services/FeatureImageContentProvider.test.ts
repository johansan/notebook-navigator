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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App, TFile, parseYaml, type CachedMetadata, type FrontMatterCache } from 'obsidian';
import { FeatureImageContentProvider } from '../../src/services/content/FeatureImageContentProvider';
import { MarkdownPipelineContentProvider } from '../../src/services/content/MarkdownPipelineContentProvider';
import { findFeatureImageReference, type FeatureImageReference } from '../../src/services/content/featureImageReferenceResolver';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import type { FileData } from '../../src/storage/IndexedDBStorage';
import { deriveFileMetadata } from '../utils/pathMetadata';
import { getDrawingDirectFeatureImageKey } from '../../src/utils/drawingFeatureImages';

const { requestUrlMock } = vi.hoisted(() => {
    return {
        requestUrlMock: vi.fn()
    };
});

vi.mock('obsidian', async () => {
    const actual = await vi.importActual<typeof import('obsidian')>('obsidian');
    return {
        ...actual,
        requestUrl: requestUrlMock
    };
});

class TestFeatureImageContentProvider extends MarkdownPipelineContentProvider {
    async runProcessFile(file: TFile, settings: NotebookNavigatorSettings) {
        const result = await this.processFile({ file, path: file.path }, null, settings);
        return result.update;
    }

    async runProcessFileWithData(file: TFile, fileData: FileData | null, settings: NotebookNavigatorSettings) {
        const result = await this.processFile({ file, path: file.path }, fileData, settings);
        return result.update;
    }

    buildKey(reference: FeatureImageReference): string {
        return this.getFeatureImageKey(reference);
    }

    async createThumbnailForTest(reference: FeatureImageReference, settings: NotebookNavigatorSettings): Promise<Blob | null> {
        return await this.createThumbnailBlob(reference, settings);
    }

    shouldProcess(fileData: FileData | null, file: TFile, settings: NotebookNavigatorSettings): boolean {
        return this.needsProcessing(fileData, file, settings);
    }
}

class TestNonMarkdownFeatureImageContentProvider extends FeatureImageContentProvider {
    async runProcessFile(file: TFile, settings: NotebookNavigatorSettings) {
        const result = await this.processFile({ file, path: file.path }, null, settings);
        return result.update;
    }

    async runProcessFileWithData(file: TFile, fileData: FileData | null, settings: NotebookNavigatorSettings) {
        const result = await this.processFile({ file, path: file.path }, fileData, settings);
        return result.update;
    }

    shouldProcess(fileData: FileData | null, file: TFile, settings: NotebookNavigatorSettings): boolean {
        return this.needsProcessing(fileData, file, settings);
    }
}

function createSettings(overrides?: Partial<NotebookNavigatorSettings>): NotebookNavigatorSettings {
    return {
        ...DEFAULT_SETTINGS,
        showFilePreview: false,
        featureImageProperties: ['thumbnail'],
        downloadExternalFeatureImages: true,
        ...overrides
    };
}

function createApp() {
    const app = new App();
    const resolvedFiles = new Map<string, TFile>();
    const cachedMetadataByPath = new Map<string, CachedMetadata>();

    app.metadataCache.getFileCache = (file: TFile) => cachedMetadataByPath.get(file.path) ?? null;
    const getFirstLinkpathDest = vi.fn<(path: string, sourcePath: string) => TFile | null>(
        (path: string) => resolvedFiles.get(path) ?? null
    );
    app.metadataCache.getFirstLinkpathDest = getFirstLinkpathDest;
    app.vault.getFolderByPath = () => null;
    app.vault.getAbstractFileByPath = (path: string) => resolvedFiles.get(path) ?? null;
    app.vault.cachedRead = async (_file: TFile) => '';
    app.vault.adapter.readBinary = async () => new ArrayBuffer(0);

    return { app, cachedMetadataByPath, resolvedFiles, getFirstLinkpathDest };
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

function createPngHeaderBytes(width: number, height: number): Uint8Array {
    const bytes = new Uint8Array(24);
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    bytes.set([0x00, 0x00, 0x00, 0x0d], 8);
    bytes.set([0x49, 0x48, 0x44, 0x52], 12);
    bytes[16] = (width >>> 24) & 0xff;
    bytes[17] = (width >>> 16) & 0xff;
    bytes[18] = (width >>> 8) & 0xff;
    bytes[19] = width & 0xff;
    bytes[20] = (height >>> 24) & 0xff;
    bytes[21] = (height >>> 16) & 0xff;
    bytes[22] = (height >>> 8) & 0xff;
    bytes[23] = height & 0xff;
    return bytes;
}

function copyBytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);
    return buffer;
}

type FrontmatterBlock = {
    yamlText: string;
    bodyStartIndex: number;
};

function extractFrontmatterBlock(content: string): FrontmatterBlock | null {
    const firstLineEnd = content.indexOf('\n');
    const firstLine = firstLineEnd === -1 ? content : content.slice(0, firstLineEnd);
    const normalizedFirstLine = firstLine.charCodeAt(0) === 0xfeff ? firstLine.slice(1) : firstLine;

    if (normalizedFirstLine.trim() !== '---' || firstLineEnd === -1) {
        return null;
    }

    const yamlStart = firstLineEnd + 1;
    let lineStart = yamlStart;
    while (lineStart <= content.length) {
        const nextLineEnd = content.indexOf('\n', lineStart);
        const lineEnd = nextLineEnd === -1 ? content.length : nextLineEnd;
        const line = content.slice(lineStart, lineEnd);
        const trimmed = line.trim();

        if (trimmed === '---' || trimmed === '...') {
            const yamlText = content.slice(yamlStart, lineStart);
            const bodyStartIndex = nextLineEnd === -1 ? content.length : lineEnd + 1;
            return { yamlText, bodyStartIndex };
        }

        if (nextLineEnd === -1) {
            break;
        }

        lineStart = lineEnd + 1;
    }

    return null;
}

function createFrontmatterPosition(bodyStartIndex: number): CachedMetadata['frontmatterPosition'] {
    return {
        start: { line: 0, col: 0, offset: 0 },
        end: { line: 0, col: 0, offset: bodyStartIndex }
    };
}

function isFrontMatterCache(value: unknown): value is FrontMatterCache {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deriveFrontmatterAndBodyStartIndex(content: string): { frontmatter: FrontMatterCache | null; bodyStartIndex: number } {
    const block = extractFrontmatterBlock(content);
    if (!block) {
        return { frontmatter: null, bodyStartIndex: 0 };
    }

    const yamlText = block.yamlText.trim();
    if (yamlText.length === 0) {
        return { frontmatter: null, bodyStartIndex: block.bodyStartIndex };
    }

    const parsed: unknown = parseYaml(yamlText);
    if (!isFrontMatterCache(parsed) || Object.keys(parsed).length === 0) {
        return { frontmatter: null, bodyStartIndex: block.bodyStartIndex };
    }

    return { frontmatter: parsed, bodyStartIndex: block.bodyStartIndex };
}

function resolveReference(app: App, file: TFile, content: string, settings: NotebookNavigatorSettings) {
    const { frontmatter, bodyStartIndex } = deriveFrontmatterAndBodyStartIndex(content);
    return findFeatureImageReference({ app, file, content, settings, frontmatter, bodyStartIndex });
}

beforeEach(() => {
    requestUrlMock.mockReset();
    requestUrlMock.mockResolvedValue({
        status: 404,
        headers: {}
    });
});

function setMarkdownContent(
    context: ReturnType<typeof createApp>,
    file: TFile,
    content: string,
    options?: { overrideRead?: boolean }
): void {
    if (options?.overrideRead !== false) {
        context.app.vault.cachedRead = async (target: TFile) => {
            return target.path === file.path ? content : '';
        };
    }

    const { frontmatter, bodyStartIndex } = deriveFrontmatterAndBodyStartIndex(content);
    const metadata: CachedMetadata = {};

    if (frontmatter) {
        metadata.frontmatter = frontmatter;
    }

    if (bodyStartIndex > 0) {
        metadata.frontmatterPosition = createFrontmatterPosition(bodyStartIndex);
    }

    context.cachedMetadataByPath.set(file.path, metadata);
}

describe('FeatureImageContentProvider thumbnails', () => {
    it('re-encodes local images that already fit thumbnail dimensions', async () => {
        const { app } = createApp();
        const provider = new TestFeatureImageContentProvider(app);
        const imageFile = createFile('images/small.png');
        const sourceBytes = createPngHeaderBytes(64, 64);
        const encodedBytes = new Uint8Array([9, 8, 7]);
        imageFile.stat.size = sourceBytes.byteLength;
        app.vault.adapter.readBinary = async () => copyBytesToArrayBuffer(sourceBytes);

        const testWindow = window as Window & {
            createImageBitmap?: (image: Blob, options?: ImageBitmapOptions) => Promise<ImageBitmap>;
            OffscreenCanvas?: typeof OffscreenCanvas;
        };
        const originalCreateImageBitmap = testWindow.createImageBitmap;
        const originalOffscreenCanvas = testWindow.OffscreenCanvas;
        const drawImage = vi.fn();
        const createImageBitmapMock = vi.fn(async (): Promise<ImageBitmap> => ({ width: 64, height: 64, close: vi.fn() }));

        class TestOffscreenCanvas {
            width: number;
            height: number;

            constructor(width: number, height: number) {
                this.width = width;
                this.height = height;
            }

            getContext(contextId: string): OffscreenCanvasRenderingContext2D | null {
                if (contextId !== '2d') {
                    return null;
                }

                return {
                    imageSmoothingQuality: 'low',
                    clearRect: vi.fn(),
                    drawImage
                } as unknown as OffscreenCanvasRenderingContext2D;
            }

            async convertToBlob(options?: ImageEncodeOptions): Promise<Blob> {
                return new Blob([encodedBytes], { type: options?.type ?? 'image/png' });
            }
        }

        Object.defineProperty(testWindow, 'createImageBitmap', {
            configurable: true,
            value: createImageBitmapMock
        });
        Object.defineProperty(testWindow, 'OffscreenCanvas', {
            configurable: true,
            value: TestOffscreenCanvas
        });

        try {
            const thumbnail = await provider.createThumbnailForTest({ kind: 'local', file: imageFile }, createSettings());

            expect(thumbnail).toBeInstanceOf(Blob);
            expect(thumbnail?.type).toBe('image/webp');
            expect(new Uint8Array(await thumbnail!.arrayBuffer())).toEqual(encodedBytes);
            expect(createImageBitmapMock).toHaveBeenCalledTimes(1);
            expect(drawImage).toHaveBeenCalledTimes(1);
        } finally {
            Object.defineProperty(testWindow, 'createImageBitmap', {
                configurable: true,
                value: originalCreateImageBitmap
            });
            Object.defineProperty(testWindow, 'OffscreenCanvas', {
                configurable: true,
                value: originalOffscreenCanvas
            });
        }
    });
});

describe('FeatureImageContentProvider scanning', () => {
    it('treats featureImagePixelSize as a markdown regeneration setting', () => {
        const { app } = createApp();
        const provider = new TestFeatureImageContentProvider(app);

        expect(provider.getRelevantSettings()).toContain('featureImagePixelSize');
        expect(
            provider.shouldRegenerate(
                { ...DEFAULT_SETTINGS, featureImagePixelSize: '256' },
                { ...DEFAULT_SETTINGS, featureImagePixelSize: '384' }
            )
        ).toBe(true);
    });

    it('uses the first embedded YouTube link in the document', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings({ downloadExternalFeatureImages: true });
        const noteFile = createFile('notes/note.md');

        const imageFile = createFile('images/cover.png');
        resolvedFiles.set('image', imageFile);
        resolvedFiles.set(imageFile.path, imageFile);

        const content = `![](https://youtu.be/abc123)\n![[image]]`;
        const result = resolveReference(app, noteFile, content, settings);

        expect(result?.kind).toBe('youtube');
        if (result?.kind === 'youtube') {
            expect(result.videoId).toBe('abc123');
        }
    });

    it('resolves extensionless wiki embeds to local images', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const imageFile = createFile('images/hero.png');
        resolvedFiles.set('hero', imageFile);
        resolvedFiles.set(imageFile.path, imageFile);

        const result = resolveReference(app, noteFile, '![[hero]]', settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(imageFile.path);
        }
    });

    it('resolves wiki embeds that contain brackets in the path', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const target = '_resources/[1762422974956].jpg';
        const imageFile = createFile(`attachments/${target}`);
        resolvedFiles.set(target, imageFile);
        resolvedFiles.set(imageFile.path, imageFile);

        const result = resolveReference(app, noteFile, `![[${target}]]`, settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(imageFile.path);
        }
    });

    it('resolves extensionless markdown embeds to local images', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const imageFile = createFile('images/hero.png');
        resolvedFiles.set('hero', imageFile);
        resolvedFiles.set(imageFile.path, imageFile);

        const result = resolveReference(app, noteFile, '![](hero)', settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(imageFile.path);
        }
    });

    it('resolves local SVG feature image embeds', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const svgFile = createFile('images/logo.svg');
        resolvedFiles.set('logo.svg', svgFile);
        resolvedFiles.set(svgFile.path, svgFile);

        const result = resolveReference(app, noteFile, '![[logo.svg]]', settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(svgFile.path);
        }
    });

    it('resolves external SVG feature image URLs', () => {
        const { app } = createApp();
        const settings = createSettings({ downloadExternalFeatureImages: true });
        const noteFile = createFile('notes/note.md');

        const result = resolveReference(app, noteFile, '![](https://example.com/icons/logo.svg?token=abc)', settings);

        expect(result?.kind).toBe('external');
        if (result?.kind === 'external') {
            expect(result.url).toBe('https://example.com/icons/logo.svg?token=abc');
        }
    });

    it('skips external images when downloads are disabled and continues scanning', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings({ downloadExternalFeatureImages: false });
        const noteFile = createFile('notes/note.md');

        const imageFile = createFile('images/hero.png');
        resolvedFiles.set('hero', imageFile);
        resolvedFiles.set(imageFile.path, imageFile);

        const content = `![](https://example.com/cover.jpg)\n![[hero]]`;
        const result = resolveReference(app, noteFile, content, settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(imageFile.path);
        }
    });

    it('ignores frontmatter content when scanning the document body', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const imageFile = createFile('images/hero.png');
        resolvedFiles.set('hero', imageFile);
        resolvedFiles.set(imageFile.path, imageFile);

        const content = `---\ncover: ![](https://youtu.be/frontmatter)\n---\n![[hero]]`;
        const result = resolveReference(app, noteFile, content, settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(imageFile.path);
        }
    });

    it('ignores CRLF frontmatter content when scanning the document body', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const imageFile = createFile('images/hero.png');
        resolvedFiles.set('hero', imageFile);
        resolvedFiles.set(imageFile.path, imageFile);

        const content = `---\r\ncover: ![](https://youtu.be/frontmatter)\r\n---\r\n![[hero]]`;
        const result = resolveReference(app, noteFile, content, settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(imageFile.path);
        }
    });

    it('skips non-image wiki embeds with extensions before resolving and continues scanning', () => {
        const { app, resolvedFiles, getFirstLinkpathDest } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const imageFile = createFile('images/hero.png');
        resolvedFiles.set('hero', imageFile);
        resolvedFiles.set(imageFile.path, imageFile);

        const content = `![[note.md]]\n![[hero]]`;
        const result = resolveReference(app, noteFile, content, settings);

        expect(result?.kind).toBe('local');
        expect(getFirstLinkpathDest.mock.calls.some(call => call[0] === 'note.md')).toBe(false);
    });

    it('skips non-image markdown embeds with extensions before resolving and continues scanning', () => {
        const { app, resolvedFiles, getFirstLinkpathDest } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const imageFile = createFile('images/hero.png');
        resolvedFiles.set('hero', imageFile);
        resolvedFiles.set(imageFile.path, imageFile);

        const content = `![](doc.docx)\n![[hero]]`;
        const result = resolveReference(app, noteFile, content, settings);

        expect(result?.kind).toBe('local');
        expect(getFirstLinkpathDest.mock.calls.some(call => call[0] === 'doc.docx')).toBe(false);
    });

    it('resolves PDF markdown embeds to local files', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const pdfFile = createFile('resources/doc.pdf');
        resolvedFiles.set('doc.pdf', pdfFile);
        resolvedFiles.set(pdfFile.path, pdfFile);

        const result = resolveReference(app, noteFile, '![](doc.pdf)', settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(pdfFile.path);
        }
    });

    it('resolves PDF markdown embeds with fragments to local files', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const pdfFile = createFile('resources/doc.pdf');
        resolvedFiles.set('doc.pdf', pdfFile);
        resolvedFiles.set(pdfFile.path, pdfFile);

        const result = resolveReference(app, noteFile, '![](doc.pdf#page=2)', settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(pdfFile.path);
        }
    });

    it('resolves PDF markdown embeds with query strings to local files', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const pdfFile = createFile('resources/doc.pdf');
        resolvedFiles.set('doc.pdf', pdfFile);
        resolvedFiles.set(pdfFile.path, pdfFile);

        const result = resolveReference(app, noteFile, '![](doc.pdf?page=2)', settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(pdfFile.path);
        }
    });

    it('resolves PDF wiki embeds to local files', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const pdfFile = createFile('resources/hero.pdf');
        resolvedFiles.set('hero.pdf', pdfFile);
        resolvedFiles.set(pdfFile.path, pdfFile);

        const result = resolveReference(app, noteFile, '![[hero.pdf]]', settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(pdfFile.path);
        }
    });

    it('resolves PDF wiki embeds with fragments to local files', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const pdfFile = createFile('resources/hero.pdf');
        resolvedFiles.set('hero.pdf', pdfFile);
        resolvedFiles.set(pdfFile.path, pdfFile);

        const result = resolveReference(app, noteFile, '![[hero.pdf#page=2]]', settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(pdfFile.path);
        }
    });

    it('resolves PDF wiki embeds with query strings to local files', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const pdfFile = createFile('resources/hero.pdf');
        resolvedFiles.set('hero.pdf', pdfFile);
        resolvedFiles.set(pdfFile.path, pdfFile);

        const result = resolveReference(app, noteFile, '![[hero.pdf?page=2]]', settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(pdfFile.path);
        }
    });

    it('continues scanning when PDF embed cannot be resolved', () => {
        const { app, resolvedFiles, getFirstLinkpathDest } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const imageFile = createFile('images/hero.png');
        resolvedFiles.set('hero', imageFile);
        resolvedFiles.set(imageFile.path, imageFile);

        const content = `![](doc.pdf)\n![[hero]]`;
        const result = resolveReference(app, noteFile, content, settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(imageFile.path);
        }
        expect(getFirstLinkpathDest.mock.calls.some(call => call[0] === 'doc.pdf')).toBe(true);
    });

    it('resolves frontmatter properties to local images', () => {
        const { app, resolvedFiles } = createApp();
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');

        const imageFile = createFile('images/hero.png');
        resolvedFiles.set('hero', imageFile);
        resolvedFiles.set(imageFile.path, imageFile);

        const content = `---\nthumbnail: ![[hero]]\n---`;
        const result = resolveReference(app, noteFile, content, settings);

        expect(result?.kind).toBe('local');
        if (result?.kind === 'local') {
            expect(result.file.path).toBe(imageFile.path);
        }
    });

    it('preserves query params in frontmatter external URLs while stripping the hash', () => {
        const { app } = createApp();
        const settings = createSettings({ downloadExternalFeatureImages: true });
        const noteFile = createFile('notes/note.md');

        const content = `---\nthumbnail: https://example.com/cover.jpg?width=800&sig=%2Babc#frag\n---`;
        const result = resolveReference(app, noteFile, content, settings);

        expect(result?.kind).toBe('external');
        if (result?.kind === 'external') {
            expect(result.url).toBe('https://example.com/cover.jpg?width=800&sig=%2Babc');
        }
    });

    it('preserves encoded query params in markdown external URLs while stripping the hash', () => {
        const { app } = createApp();
        const settings = createSettings({ downloadExternalFeatureImages: true });
        const noteFile = createFile('notes/note.md');

        const content = '![](https://example.com/cover.jpg?width=800&sig=%2Babc#frag)';
        const result = resolveReference(app, noteFile, content, settings);

        expect(result?.kind).toBe('external');
        if (result?.kind === 'external') {
            expect(result.url).toBe('https://example.com/cover.jpg?width=800&sig=%2Babc');
        }
    });

    it('includes source mtime in local image cache keys', () => {
        const { app } = createApp();
        const provider = new TestFeatureImageContentProvider(app);
        const imageFile = createFile('images/hero.png');
        imageFile.stat.mtime = 12345;

        const key = provider.buildKey({ kind: 'local', file: imageFile });

        expect(key).toBe(`f:${imageFile.path}@${imageFile.stat.mtime}`);
    });

    it('skips regeneration when featureImageKey matches even without a blob', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');
        setMarkdownContent(context, noteFile, '');

        // Existing data already recorded the same feature image key.
        const fileData: FileData = {
            mtime: noteFile.stat.mtime,
            markdownPipelineMtime: noteFile.stat.mtime,
            tagsMtime: noteFile.stat.mtime,
            metadataMtime: noteFile.stat.mtime,
            fileThumbnailsMtime: noteFile.stat.mtime,
            tags: null,
            wordCount: null,
            characterCountWithSpaces: 0,
            characterCountWithoutSpaces: 0,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: null,
            previewStatus: 'unprocessed',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: 'e:https://example.com/cover.jpg',
            metadata: null
        };

        // No content update is emitted when the key matches and hidden counters have no consumer.
        const result = await provider.runProcessFileWithData(noteFile, fileData, settings);
        expect(result).toBeNull();
    });

    it('acknowledges mtime mismatch when featureImageKey matches and a thumbnail exists', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');
        noteFile.stat.mtime = 200;

        const content = `---\nthumbnail: https://example.com/cover.jpg\n---\n`;
        setMarkdownContent(context, noteFile, content);

        const fileData: FileData = {
            mtime: noteFile.stat.mtime,
            markdownPipelineMtime: 100,
            tagsMtime: 100,
            metadataMtime: 100,
            fileThumbnailsMtime: 100,
            tags: null,
            wordCount: null,
            characterCountWithSpaces: 0,
            characterCountWithoutSpaces: 0,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: null,
            previewStatus: 'unprocessed',
            featureImage: null,
            featureImageStatus: 'has',
            featureImageKey: 'e:https://example.com/cover.jpg',
            metadata: null
        };

        const result = await provider.runProcessFileWithData(noteFile, fileData, settings);

        expect(result).toBeNull();
    });

    it('retries external downloads when the file changed but the featureImageKey did not', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings({ downloadExternalFeatureImages: true });
        const noteFile = createFile('notes/note.md');
        noteFile.stat.mtime = 200;

        const content = `---\nthumbnail: https://example.com/cover.jpg\n---\n`;
        setMarkdownContent(context, noteFile, content);

        const fileData: FileData = {
            mtime: noteFile.stat.mtime,
            markdownPipelineMtime: 100,
            tagsMtime: 100,
            metadataMtime: 100,
            fileThumbnailsMtime: 100,
            tags: null,
            wordCount: null,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: null,
            previewStatus: 'unprocessed',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: 'e:https://example.com/cover.jpg',
            metadata: null
        };

        const result = await provider.runProcessFileWithData(noteFile, fileData, settings);

        expect(result).not.toBeNull();
        expect(result?.featureImageKey).toBe('e:https://example.com/cover.jpg');
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
    });

    it('retries YouTube thumbnails when the file changed but the featureImageKey did not', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings({ downloadExternalFeatureImages: true });
        const noteFile = createFile('notes/note.md');
        noteFile.stat.mtime = 200;

        const content = `---\nthumbnail: https://youtu.be/abc123\n---\n`;
        setMarkdownContent(context, noteFile, content);

        const fileData: FileData = {
            mtime: noteFile.stat.mtime,
            markdownPipelineMtime: 100,
            tagsMtime: 100,
            metadataMtime: 100,
            fileThumbnailsMtime: 100,
            tags: null,
            wordCount: null,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: null,
            previewStatus: 'unprocessed',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: 'y:abc123',
            metadata: null
        };

        const result = await provider.runProcessFileWithData(noteFile, fileData, settings);

        expect(result).not.toBeNull();
        expect(result?.featureImageKey).toBe('y:abc123');
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
    });

    it('skips feature image storage when note contains an excluded property', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings({ featureImageExcludeProperties: ['private'] });
        const noteFile = createFile('notes/note.md');

        const content = `---\nprivate: true\nthumbnail: https://example.com/cover.jpg\n---\n`;
        setMarkdownContent(context, noteFile, content);

        const result = await provider.runProcessFile(noteFile, settings);

        expect(result).not.toBeNull();
        expect(result?.featureImageKey).toBe('');
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
    });

    it('does not read note content when excluded property only affects feature images', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings({ featureImageExcludeProperties: ['private'] });
        const noteFile = createFile('notes/note.md');

        const content = `---\nprivate: true\n---\n`;
        setMarkdownContent(context, noteFile, content, { overrideRead: false });

        const cachedRead = vi.fn<() => Promise<string>>(async () => content);
        app.vault.cachedRead = cachedRead;

        const fileData: FileData = {
            mtime: noteFile.stat.mtime,
            markdownPipelineMtime: noteFile.stat.mtime,
            tagsMtime: noteFile.stat.mtime,
            metadataMtime: noteFile.stat.mtime,
            fileThumbnailsMtime: noteFile.stat.mtime,
            tags: null,
            wordCount: 0,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: null,
            previewStatus: 'none',
            featureImage: null,
            featureImageStatus: 'unprocessed',
            featureImageKey: null,
            metadata: null
        };

        const result = await provider.runProcessFileWithData(noteFile, fileData, settings);

        expect(cachedRead).not.toHaveBeenCalled();
        expect(result).not.toBeNull();
        expect(result?.featureImageKey).toBe('');
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
    });

    it('stores empty blob when external download fails', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings({ downloadExternalFeatureImages: true });
        const noteFile = createFile('notes/note.md');

        // Provide a document with an external image reference.
        const content = '![](https://example.com/cover.jpg)';
        setMarkdownContent(context, noteFile, content);

        const result = await provider.runProcessFile(noteFile, settings);

        // An empty blob is written alongside the key when no thumbnail is produced.
        expect(result).not.toBeNull();
        expect(result?.featureImageKey).toBe('e:https://example.com/cover.jpg');
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
    });

    it('stores the rejected SVG key without falling back to later embeds', async () => {
        const context = createApp();
        const { app, resolvedFiles } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');
        const svgFile = createFile('images/diagram.svg');
        svgFile.stat.mtime = 111;
        const pngFile = createFile('images/cover.png');
        pngFile.stat.mtime = 222;
        resolvedFiles.set('diagram.svg', svgFile);
        resolvedFiles.set(svgFile.path, svgFile);
        resolvedFiles.set('cover.png', pngFile);
        resolvedFiles.set(pngFile.path, pngFile);

        setMarkdownContent(context, noteFile, '![[diagram.svg]]\n![[cover.png]]');

        const result = await provider.runProcessFile(noteFile, settings);

        // Rasterization requires DOM APIs unavailable in the node test environment, so the SVG is
        // rejected and the empty marker is stored under its key; later embeds are not consulted.
        expect(result?.featureImageKey).toBe(provider.buildKey({ kind: 'local', file: svgFile }));
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
    });

    it('stores the rejected frontmatter SVG key without falling back to body embeds', async () => {
        const context = createApp();
        const { app, resolvedFiles } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');
        const svgFile = createFile('images/diagram.svg');
        svgFile.stat.mtime = 111;
        const pngFile = createFile('images/cover.png');
        pngFile.stat.mtime = 222;
        resolvedFiles.set('diagram.svg', svgFile);
        resolvedFiles.set(svgFile.path, svgFile);
        resolvedFiles.set('cover.png', pngFile);
        resolvedFiles.set(pngFile.path, pngFile);

        setMarkdownContent(context, noteFile, '---\nthumbnail: "[[diagram.svg]]"\n---\n![[cover.png]]');

        const result = await provider.runProcessFile(noteFile, settings);

        expect(result?.featureImageKey).toBe(provider.buildKey({ kind: 'local', file: svgFile }));
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
    });

    it('stores the rejected SVG key when no other images are referenced', async () => {
        const context = createApp();
        const { app, resolvedFiles } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings();
        const noteFile = createFile('notes/note.md');
        const svgFile = createFile('images/diagram.svg');
        svgFile.stat.mtime = 111;
        resolvedFiles.set('diagram.svg', svgFile);
        resolvedFiles.set(svgFile.path, svgFile);

        setMarkdownContent(context, noteFile, '![[diagram.svg]]');

        const result = await provider.runProcessFile(noteFile, settings);

        expect(result?.featureImageKey).toBe(provider.buildKey({ kind: 'local', file: svgFile }));
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
    });

    it('processes standalone SVG files with the local source key', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestNonMarkdownFeatureImageContentProvider(app);
        const settings = createSettings();
        const svgFile = createFile('images/logo.svg');
        svgFile.stat.mtime = 4242;

        expect(provider.shouldProcess(null, svgFile, settings)).toBe(true);

        const result = await provider.runProcessFile(svgFile, settings);

        // Rasterization requires DOM APIs unavailable in the node test environment,
        // so the empty processed marker is stored under the mtime-based local key.
        expect(result?.featureImageKey).toBe(`f:${svgFile.path}@${svgFile.stat.mtime}`);
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
    });

    it('downloads extensionless external SVG responses after successful HEAD preflight', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings({ downloadExternalFeatureImages: true });
        const noteFile = createFile('notes/note.md');

        requestUrlMock.mockImplementation(async (request: { method?: string }) => {
            if (request.method === 'HEAD') {
                return {
                    status: 200,
                    headers: { 'content-type': 'image/svg+xml', 'content-length': '1024' }
                };
            }

            return {
                status: 200,
                headers: { 'content-type': 'image/svg+xml' },
                arrayBuffer: new ArrayBuffer(0)
            };
        });

        setMarkdownContent(context, noteFile, '![](https://example.com/render?id=cover)');

        const result = await provider.runProcessFile(noteFile, settings);

        // Rasterization requires DOM APIs unavailable in the node test environment,
        // so the result is the empty processed marker with the external key.
        expect(result?.featureImageKey).toBe('e:https://example.com/render?id=cover');
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
        expect(requestUrlMock).toHaveBeenCalledTimes(2);
        expect(requestUrlMock).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                url: 'https://example.com/render?id=cover',
                method: 'HEAD'
            })
        );
        expect(requestUrlMock).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                url: 'https://example.com/render?id=cover',
                method: 'GET'
            })
        );
    });

    it('skips oversized external SVG responses before downloading the body', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings({ downloadExternalFeatureImages: true });
        const noteFile = createFile('notes/note.md');

        requestUrlMock.mockImplementation(async () => {
            return {
                status: 200,
                headers: { 'content-type': 'image/svg+xml', 'content-length': '3000000' }
            };
        });

        setMarkdownContent(context, noteFile, '![](https://example.com/render?id=cover)');

        const result = await provider.runProcessFile(noteFile, settings);

        // The reported length exceeds the SVG source cap, so only the HEAD request runs.
        expect(result?.featureImageKey).toBe('e:https://example.com/render?id=cover');
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
        expect(requestUrlMock).toHaveBeenCalledTimes(1);
        expect(requestUrlMock).toHaveBeenCalledWith(
            expect.objectContaining({
                url: 'https://example.com/render?id=cover',
                method: 'HEAD'
            })
        );
    });

    it('downloads raster URLs after successful HEAD preflight', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings({ downloadExternalFeatureImages: true });
        const noteFile = createFile('notes/note.md');

        requestUrlMock.mockImplementation(async (request: { method?: string }) => {
            if (request.method === 'HEAD') {
                return {
                    status: 200,
                    headers: { 'content-type': 'image/png', 'content-length': '0' }
                };
            }

            return {
                status: 200,
                headers: { 'content-type': 'image/png' },
                arrayBuffer: new ArrayBuffer(0)
            };
        });

        setMarkdownContent(context, noteFile, '![](https://example.com/cover.png)');

        const result = await provider.runProcessFile(noteFile, settings);

        expect(result?.featureImageKey).toBe('e:https://example.com/cover.png');
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
        expect(requestUrlMock).toHaveBeenCalledTimes(2);
        expect(requestUrlMock).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                url: 'https://example.com/cover.png',
                method: 'HEAD'
            })
        );
        expect(requestUrlMock).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                url: 'https://example.com/cover.png',
                method: 'GET'
            })
        );
    });

    it('skips raster URLs when HEAD is unavailable', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings({ downloadExternalFeatureImages: true });
        const noteFile = createFile('notes/note.md');

        requestUrlMock.mockResolvedValue({
            status: 405,
            headers: {}
        });

        setMarkdownContent(context, noteFile, '![](https://example.com/cover.png)');

        const result = await provider.runProcessFile(noteFile, settings);

        expect(result?.featureImageKey).toBe('e:https://example.com/cover.png');
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
        expect(requestUrlMock).toHaveBeenCalledTimes(1);
        expect(requestUrlMock).toHaveBeenCalledWith(
            expect.objectContaining({
                url: 'https://example.com/cover.png',
                method: 'HEAD'
            })
        );
    });

    it('skips raster URLs when HEAD omits Content-Length', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings({ downloadExternalFeatureImages: true });
        const noteFile = createFile('notes/note.md');

        requestUrlMock.mockResolvedValue({
            status: 200,
            headers: { 'content-type': 'image/png' }
        });

        setMarkdownContent(context, noteFile, '![](https://example.com/cover.png)');

        const result = await provider.runProcessFile(noteFile, settings);

        expect(result?.featureImageKey).toBe('e:https://example.com/cover.png');
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
        expect(requestUrlMock).toHaveBeenCalledTimes(1);
        expect(requestUrlMock).toHaveBeenCalledWith(
            expect.objectContaining({
                url: 'https://example.com/cover.png',
                method: 'HEAD'
            })
        );
    });

    it('marks Excalidraw feature images as direct companion-image rows', async () => {
        const context = createApp();
        const { app, resolvedFiles } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings();
        const excalidrawFile = createFile('drawings/sketch.excalidraw.md');
        excalidrawFile.stat.mtime = 123;
        setMarkdownContent(context, excalidrawFile, '');

        const companionImage = createFile('drawings/sketch.excalidraw.png');
        companionImage.stat.mtime = 456;
        companionImage.stat.size = 24;
        resolvedFiles.set(companionImage.path, companionImage);
        const readBinary = vi.fn(async () => new ArrayBuffer(0));
        app.vault.adapter.readBinary = readBinary;

        const result = await provider.runProcessFile(excalidrawFile, settings);

        expect(result?.featureImageKey).toBe(getDrawingDirectFeatureImageKey(excalidrawFile, 'excalidraw'));
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
        expect(readBinary).not.toHaveBeenCalled();
    });

    it('marks frontmatter Excalidraw feature images as direct companion-image rows', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings();
        const excalidrawFile = createFile('drawings/sketch.md');
        const content = `---\nexcalidraw-plugin: parsed\n---\n`;
        setMarkdownContent(context, excalidrawFile, content);

        const result = await provider.runProcessFile(excalidrawFile, settings);

        expect(result?.featureImageKey).toBe(getDrawingDirectFeatureImageKey(excalidrawFile, 'excalidraw'));
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
    });

    it('marks frontmatter Tldraw feature images as direct drawing rows', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings();
        const tldrawFile = createFile('drawings/sketch.md');
        const content = `---\ntldraw-file: true\n---\n`;
        setMarkdownContent(context, tldrawFile, content);

        const result = await provider.runProcessFile(tldrawFile, settings);

        expect(result?.featureImageKey).toBe(getDrawingDirectFeatureImageKey(tldrawFile, 'tldraw'));
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
    });

    it('replaces generic markdown feature markers for frontmatter Tldraw files', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings();
        const tldrawFile = createFile('drawings/sketch.md');
        setMarkdownContent(context, tldrawFile, `---\ntldraw-file: true\n---\n`);
        const fileData: FileData = {
            mtime: tldrawFile.stat.mtime,
            markdownPipelineMtime: tldrawFile.stat.mtime,
            tagsMtime: tldrawFile.stat.mtime,
            metadataMtime: tldrawFile.stat.mtime,
            fileThumbnailsMtime: tldrawFile.stat.mtime,
            tags: null,
            wordCount: 0,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: null,
            previewStatus: 'none',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: '',
            metadata: null
        };

        expect(provider.shouldProcess(fileData, tldrawFile, settings)).toBe(true);

        const result = await provider.runProcessFileWithData(tldrawFile, fileData, settings);

        expect(result?.featureImageKey).toBe(getDrawingDirectFeatureImageKey(tldrawFile, 'tldraw'));
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
    });

    it('skips excluded frontmatter Tldraw regeneration when the empty marker is current', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings({ featureImageExcludeProperties: ['private'] });
        const tldrawFile = createFile('drawings/sketch.md');
        setMarkdownContent(context, tldrawFile, `---\ntldraw-file: true\nprivate: true\n---\n`);
        const fileData: FileData = {
            mtime: tldrawFile.stat.mtime,
            markdownPipelineMtime: tldrawFile.stat.mtime,
            tagsMtime: tldrawFile.stat.mtime,
            metadataMtime: tldrawFile.stat.mtime,
            fileThumbnailsMtime: tldrawFile.stat.mtime,
            tags: null,
            wordCount: 0,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: null,
            previewStatus: 'none',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: '',
            metadata: null
        };

        expect(provider.shouldProcess(fileData, tldrawFile, settings)).toBe(false);

        const result = await provider.runProcessFileWithData(tldrawFile, fileData, settings);

        expect(result).toBeNull();
    });

    it('marks raw Tldraw feature images as direct drawing rows', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestNonMarkdownFeatureImageContentProvider(app);
        const settings = createSettings();
        const tldrawFile = createFile('drawings/sketch.tldr');

        const result = await provider.runProcessFile(tldrawFile, settings);

        expect(result?.featureImageKey).toBe(getDrawingDirectFeatureImageKey(tldrawFile, 'tldraw'));
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
    });

    it('replaces generic non-markdown feature markers for raw Tldraw files', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestNonMarkdownFeatureImageContentProvider(app);
        const settings = createSettings();
        const tldrawFile = createFile('drawings/sketch.tldr');
        const fileData: FileData = {
            mtime: tldrawFile.stat.mtime,
            markdownPipelineMtime: tldrawFile.stat.mtime,
            tagsMtime: tldrawFile.stat.mtime,
            metadataMtime: tldrawFile.stat.mtime,
            fileThumbnailsMtime: tldrawFile.stat.mtime,
            tags: null,
            wordCount: null,
            taskTotal: null,
            taskUnfinished: null,
            properties: null,
            previewStatus: 'none',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: '',
            metadata: null
        };

        expect(provider.shouldProcess(fileData, tldrawFile, settings)).toBe(true);

        const result = await provider.runProcessFileWithData(tldrawFile, fileData, settings);

        expect(result?.featureImageKey).toBe(getDrawingDirectFeatureImageKey(tldrawFile, 'tldraw'));
        expect(result?.featureImage).toBeInstanceOf(Blob);
        expect(result?.featureImage?.size).toBe(0);
    });

    it('skips raw Tldraw regeneration when the direct drawing marker matches', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestNonMarkdownFeatureImageContentProvider(app);
        const settings = createSettings();
        const tldrawFile = createFile('drawings/sketch.tldr');
        const fileData: FileData = {
            mtime: tldrawFile.stat.mtime,
            markdownPipelineMtime: tldrawFile.stat.mtime,
            tagsMtime: tldrawFile.stat.mtime,
            metadataMtime: tldrawFile.stat.mtime,
            fileThumbnailsMtime: tldrawFile.stat.mtime,
            tags: null,
            wordCount: null,
            taskTotal: null,
            taskUnfinished: null,
            properties: null,
            previewStatus: 'none',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: getDrawingDirectFeatureImageKey(tldrawFile, 'tldraw'),
            metadata: null
        };

        expect(provider.shouldProcess(fileData, tldrawFile, settings)).toBe(false);

        const result = await provider.runProcessFileWithData(tldrawFile, fileData, settings);
        expect(result).toBeNull();
    });

    it('skips Excalidraw regeneration when the direct companion marker matches', async () => {
        const context = createApp();
        const { app } = context;
        const provider = new TestFeatureImageContentProvider(app);
        const settings = createSettings();
        const excalidrawFile = createFile('drawings/sketch.excalidraw.md');
        excalidrawFile.stat.mtime = 456;
        setMarkdownContent(context, excalidrawFile, '');

        const fileData: FileData = {
            mtime: excalidrawFile.stat.mtime,
            markdownPipelineMtime: excalidrawFile.stat.mtime,
            tagsMtime: excalidrawFile.stat.mtime,
            metadataMtime: excalidrawFile.stat.mtime,
            fileThumbnailsMtime: excalidrawFile.stat.mtime,
            tags: null,
            wordCount: 0,
            taskTotal: 0,
            taskUnfinished: 0,
            properties: null,
            previewStatus: 'unprocessed',
            featureImage: null,
            featureImageStatus: 'none',
            featureImageKey: getDrawingDirectFeatureImageKey(excalidrawFile, 'excalidraw'),
            metadata: null
        };

        const result = await provider.runProcessFileWithData(excalidrawFile, fileData, settings);
        expect(result).toBeNull();
    });
});
