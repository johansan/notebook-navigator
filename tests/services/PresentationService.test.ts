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
import { beforeEach, describe, expect, it } from 'vitest';
import { TFile, TFolder } from 'obsidian';
import type { App } from 'obsidian';
import { isInSavedVersions, PresentationService, resolvePresentationCover } from '../../src/services/PresentationService';
import type { PresentationReadingStore } from '../../src/services/PresentationService';
import { getListPaneMeasurements, getPresentationRowHeight } from '../../src/utils/listPaneMeasurements';

// The database's presentation store, by folder path
const storedReadings = new Map<string, unknown>();
const readingStore: PresentationReadingStore = {
    getPresentationReadings: async () => new Map(storedReadings),
    setPresentationReading: async (folderPath, reading) => {
        if (reading === null) {
            storedReadings.delete(folderPath);
        } else {
            storedReadings.set(folderPath, structuredClone(reading));
        }
    }
};

const PRESENTATION_ID = '656fb827-4f76-4106-91c1-de84af82e131';
const BYTE_ORDER_MARK = String.fromCharCode(0xfeff);

function schemeColors(background: string, text: string, muted: string) {
    return { background, surface: background, accent: text, text, muted, separator: muted, link: text };
}

const MASTER = {
    markdownpoint: '1.0',
    type: 'master',
    id: '41c1a2a4-5d2e-4f0a-9b8e-2a7c6c1d9e30',
    name: 'Studio Pro',
    size: { width: 1280, height: 720 },
    fonts: { display: 'Inter', body: 'Inter', mono: 'Source Code Pro' },
    schemes: {
        light: { appearance: 'light', colors: schemeColors('#FFFFFF', '#1D1D1F', '#6E6E73') },
        dark: { appearance: 'dark', colors: schemeColors('#000000', '#F5F5F7', '#A1A1A6') },
        spotlight: { appearance: 'dark', colors: schemeColors('#1C1C3A', '#FFFFFF', '#C7C7FF') }
    }
};
const TITLE_FRAME = { x: 80, y: 300, width: 1120, height: 120 };
const TITLE_LAYOUT = {
    markdownpoint: '1.0',
    type: 'layout',
    scheme: 'spotlight',
    objects: [{ id: 'title', type: 'text', placeholder: true, frame: TITLE_FRAME, align: 'center' }]
};
const SLIDES = `---\nmarkdownpoint: "1.0"\nid: ${PRESENTATION_ID}\n---\n\n<!-- slide: opening -->\n\n<!-- slide: closing -->\n`;
const COMPANION = {
    markdownpoint: '1.0',
    type: 'presentation',
    id: PRESENTATION_ID,
    theme: 'studio',
    slides: { opening: { layout: 'title' }, closing: { layout: 'blank' } }
};

/** A presentation's files in `folder`, as MarkdownPoint writes them, with its theme */
function deck(
    folder: string,
    changes: { companion?: string; master?: unknown; title?: unknown; theme?: boolean } = {}
): Record<string, string> {
    const files: Record<string, string> = {
        [`${folder}/slides.md`]: SLIDES,
        [`${folder}/presentation.mdpoint`]: changes.companion ?? JSON.stringify(COMPANION)
    };
    if (changes.theme !== false) {
        files[`${folder}/themes/studio/master.json`] = JSON.stringify(changes.master ?? MASTER);
        files[`${folder}/themes/studio/title.json`] = JSON.stringify(changes.title ?? TITLE_LAYOUT);
        files[`${folder}/themes/studio/blank.json`] = JSON.stringify({ markdownpoint: '1.0', type: 'layout' });
    }
    return files;
}

function getParentPath(path: string): string {
    return path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '/';
}

/** A vault of files by path with their bytes, the reads the service makes and the events it listens to */
function fakeVault(contents: Record<string, string>) {
    const root = Object.assign(new TFolder('/'), { name: '', parent: null });
    const folders = new Map<string, TFolder>([['/', root]]);
    const files = new Map<string, TFile>();
    const bytes = new Map<string, Uint8Array>();
    const listeners = new Map<string, (file: TFile | TFolder) => void>();
    const reads: string[] = [];
    let clock = 1;
    const folderAt = (path: string): TFolder => {
        let folder = folders.get(path);
        if (!folder) {
            const parent = folderAt(getParentPath(path));
            folder = Object.assign(new TFolder(path), { name: path.slice(path.lastIndexOf('/') + 1), parent });
            folders.set(path, folder);
            parent.children.push(folder);
        }
        return folder;
    };
    const write = (path: string, content: string): { file: TFile; created: boolean } => {
        const data = new TextEncoder().encode(content);
        const existing = files.get(path);
        const file = existing ?? new TFile(path);
        if (!existing) {
            files.set(path, file);
            folderAt(getParentPath(path)).children.push(file);
        }
        bytes.set(path, data);
        Object.assign(file, { stat: { mtime: clock++, ctime: 0, size: data.byteLength } });
        return { file, created: !existing };
    };
    Object.entries(contents).forEach(([path, content]) => write(path, content));
    const app = {
        vault: {
            configDir: 'config',
            adapter: { exists: async () => false },
            on: (name: string, listener: (file: TFile | TFolder) => void) => listeners.set(name, listener),
            offref: () => {},
            getFiles: () => [...files.values()],
            getAbstractFileByPath: (path: string) => files.get(path) ?? folders.get(path) ?? null,
            readBinary: async (file: TFile) => {
                reads.push(file.path);
                return bytes.get(file.path)!.slice().buffer;
            }
        }
    } as unknown as App;
    return {
        app,
        reads,
        write: (path: string, content: string) => {
            const { file, created } = write(path, content);
            listeners.get(created ? 'create' : 'modify')?.(file);
        },
        delete: (path: string) => {
            const file = files.get(path)!;
            files.delete(path);
            bytes.delete(path);
            const siblings = folderAt(getParentPath(path)).children;
            siblings.splice(siblings.indexOf(file), 1);
            listeners.get('delete')?.(file);
        }
    };
}

// The service reads a folder 100 ms after its last event
const settle = () => new Promise(resolve => window.setTimeout(resolve, 250));

async function started(app: App): Promise<PresentationService> {
    const service = new PresentationService(app, async () => readingStore);
    service.start();
    await settle();
    return service;
}

const SPOTLIGHT = { background: '#1C1C3A', text: '#FFFFFF', muted: '#C7C7FF' };
const LIGHT = { background: '#FFFFFF', text: '#1D1D1F', muted: '#6E6E73' };
const DARK = { background: '#000000', text: '#F5F5F7', muted: '#A1A1A6' };

describe('PresentationService', () => {
    beforeEach(() => {
        storedReadings.clear();
    });

    it('shows a folder as a presentation exactly where MarkdownPoint opens its pair', async () => {
        const otherId = JSON.stringify({ ...COMPANION, id: '7b0c5f8e-1d2a-4c3b-9e8f-0a1b2c3d4e5f' });
        const vault = fakeVault({
            ...deck('Talk'),
            ...deck('Marked', { companion: BYTE_ORDER_MARK + JSON.stringify(COMPANION) }),
            ...deck('Copied', { companion: otherId }),
            ...deck('Synced'),
            'Synced/slides 2.md': SLIDES
        });
        const service = await started(vault.app);

        expect(service.getSummary('Talk')).toEqual({
            folderPath: 'Talk',
            slidesPath: 'Talk/slides.md',
            companionPath: 'Talk/presentation.mdpoint',
            slideCount: 2,
            themeName: 'Studio Pro',
            size: { width: 1280, height: 720 },
            cover: { align: 'center', light: SPOTLIGHT, dark: null }
        });
        expect(service.getRole('Talk/slides.md')).toBe('slides');
        expect(service.getRole('Talk/presentation.mdpoint')).toBe('companion');
        expect(service.getSummary('Marked')).not.toBeNull();
        expect(service.getSummary('Copied')).toBeNull();
        expect(service.getSummary('Synced')).toBeNull();
        expect(service.getRole('Synced/slides.md')).toBeNull();
        service.dispose();
    });

    it('hides a presentation inside another one and a copy of a saved version beside its presentation, while the other stands', async () => {
        const vault = fakeVault({ ...deck('Talk/versions/copy'), ...deck('Talk/inner') });
        const service = await started(vault.app);
        expect(service.getSummary('Talk/versions/copy')).not.toBeNull();
        expect(service.getSummary('Talk/inner')).not.toBeNull();

        vault.write('Talk/slides.md', SLIDES);
        vault.write('Talk/presentation.mdpoint', JSON.stringify(COMPANION));
        await settle();
        expect(service.getSummary('Talk')).not.toBeNull();
        expect(service.getSummary('Talk/versions/copy')).toBeNull();
        expect(service.getSummary('Talk/inner')).toBeNull();

        vault.delete('Talk/presentation.mdpoint');
        await settle();
        expect(service.getSummary('Talk')).toBeNull();
        expect(service.getSummary('Talk/versions/copy')).not.toBeNull();
        expect(service.getSummary('Talk/inner')).not.toBeNull();
        service.dispose();
    });

    it('draws the cover from the Title layout, and names a theme MarkdownPoint does not read by its key with no size or cover', async () => {
        const plainTitle = {
            ...TITLE_LAYOUT,
            scheme: undefined,
            objects: [{ id: 'title', type: 'text', placeholder: true, frame: TITLE_FRAME }]
        };
        const vault = fakeVault({
            ...deck('Plain', { title: plainTitle }),
            ...deck('Newer', { master: { ...MASTER, markdownpoint: '2.0' } }),
            ...deck('Bare', { theme: false })
        });
        const service = await started(vault.app);

        expect(service.getSummary('Plain')?.cover).toEqual({ align: 'start', light: LIGHT, dark: DARK });
        for (const folderPath of ['Newer', 'Bare']) {
            const summary = service.getSummary(folderPath);
            expect({ themeName: summary?.themeName, size: summary?.size, cover: summary?.cover }).toEqual({
                themeName: 'Studio',
                size: null,
                cover: null
            });
        }
        service.dispose();
    });

    it('shows each presentation from its stored reading at a later start, reading only one whose files changed since', async () => {
        const vault = fakeVault({ ...deck('Talk'), ...deck('Pitch') });
        const first = await started(vault.app);
        const summaries = [first.getSummary('Talk'), first.getSummary('Pitch')];
        first.dispose();
        expect(summaries.every(summary => summary !== null)).toBe(true);

        vault.reads.length = 0;
        const second = await started(vault.app);
        expect([second.getSummary('Talk'), second.getSummary('Pitch')]).toEqual(summaries);
        expect(vault.reads).toEqual([]);
        second.dispose();

        vault.write('Pitch/slides.md', `${SLIDES}\n<!-- slide: encore -->\n`);
        vault.write(
            'Pitch/presentation.mdpoint',
            JSON.stringify({ ...COMPANION, slides: { ...COMPANION.slides, encore: { layout: 'blank' } } })
        );
        await settle();
        const third = await started(vault.app);
        expect(third.getSummary('Talk')).toEqual(summaries[0]);
        expect(third.getSummary('Pitch')?.slideCount).toBe(3);
        expect(vault.reads.length).toBeGreaterThan(0);
        expect(vault.reads.every(path => path.startsWith('Pitch/'))).toBe(true);
        third.dispose();
    });
});

describe('resolvePresentationCover', () => {
    it('follows the light and dark schemes when the Title layout names a scheme the theme lacks', () => {
        const theme = {
            name: 'Studio',
            size: { width: 1920, height: 1080 },
            schemes: { light: { appearance: 'light' as const, ...LIGHT }, dark: { appearance: 'dark' as const, ...DARK } },
            layouts: [{ key: 'title', name: 'Title', reads: true, scheme: 'missing', titleAlign: 'center' as const }]
        };
        expect(resolvePresentationCover(theme)).toEqual({ align: 'center', light: LIGHT, dark: DARK });
    });
});

describe('isInSavedVersions', () => {
    const holds = (folders: string[]) => (folderPath: string) => folders.includes(folderPath);

    it('places a pair in a folder named by a save time under versions/ in its presentation, whatever is around it', () => {
        expect(isInSavedVersions('Talk/versions/2026-11-13T09.30.00Z-ab12', holds([]), false)).toBe(true);
        expect(isInSavedVersions('versions/2026-02-29T23.59.59Z-z9z9', holds([]), false)).toBe(false);
        expect(isInSavedVersions('versions/2028-02-29T23.59.59Z-z9z9', holds([]), false)).toBe(true);
    });

    it('places any folder under versions/ in its presentation when the folder around versions/ holds a presentation file', () => {
        expect(isInSavedVersions('Talk/versions/copy', holds(['Talk']), false)).toBe(true);
        expect(isInSavedVersions('Talk/versions', holds(['Talk']), false)).toBe(true);
        expect(isInSavedVersions('versions/copy/inner', holds(['/']), false)).toBe(true);
        expect(isInSavedVersions('Talk/versions/copy', holds([]), false)).toBe(false);
        expect(isInSavedVersions('Talk/notes', holds(['Talk']), false)).toBe(false);
    });

    it('reads Versions/ as versions/ only where the vault ignores case', () => {
        expect(isInSavedVersions('Talk/Versions/copy', holds(['Talk']), true)).toBe(true);
        expect(isInSavedVersions('Talk/Versions/copy', holds(['Talk']), false)).toBe(false);
    });
});

describe('getPresentationRowHeight', () => {
    it('matches the fixed cover and detail row layouts on desktop and mobile', () => {
        expect(getPresentationRowHeight('slides', getListPaneMeasurements(false))).toBe(186);
        expect(getPresentationRowHeight('companion', getListPaneMeasurements(false))).toBe(93);
        expect(getPresentationRowHeight('slides', getListPaneMeasurements(true))).toBe(195);
        expect(getPresentationRowHeight('companion', getListPaneMeasurements(true))).toBe(105);
    });
});
