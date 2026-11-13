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
import { TFile, TFolder } from 'obsidian';
import type { App } from 'obsidian';
import {
    countPresentationSlides,
    getPresentationIdentity,
    getPresentationPairNames,
    getPresentationThemeName,
    isInSavedVersions,
    isPresentationThemeKey,
    PresentationService,
    readableMaster,
    resolvePresentationCover,
    resolveSlideSize
} from '../../src/services/PresentationService';
import { getListPaneMeasurements, getPresentationRowHeight } from '../../src/utils/listPaneMeasurements';

const PRESENTATION_ID = '656fb827-4f76-4106-91c1-de84af82e131';
const THEME_ID = '41c1a2a4-5d2e-4f0a-9b8e-2a7c6c1d9e30';

/** A copy of a record without one key, as a file that leaves the key out */
function withoutKey(record: Record<string, unknown>, key: string): Record<string, unknown> {
    return Object.fromEntries(Object.entries(record).filter(([name]) => name !== key));
}

describe('getPresentationPairNames', () => {
    it('recognizes slides.md beside presentation.mdpoint and keeps the stored spelling', () => {
        expect(getPresentationPairNames(['slides.md', 'presentation.mdpoint', 'notes.md'])).toEqual({
            markdown: 'slides.md',
            companion: 'presentation.mdpoint'
        });
        expect(getPresentationPairNames(['Slides.md', 'Presentation.mdpoint'])).toEqual({
            markdown: 'Slides.md',
            companion: 'Presentation.mdpoint'
        });
    });

    it('rejects folders with sync conflict copies or other names', () => {
        expect(getPresentationPairNames(['slides.md', 'slides 2.md', 'presentation.mdpoint'])).toBeNull();
        expect(getPresentationPairNames(['slides.md', 'presentation.mdpoint', 'presentation (1).mdpoint'])).toBeNull();
        expect(getPresentationPairNames(['slides.md', 'deck.mdpoint'])).toBeNull();
        expect(getPresentationPairNames(['slides.md'])).toBeNull();
    });

    it('ignores AppleDouble files and markdown that only starts with the word slides', () => {
        expect(getPresentationPairNames(['slides.md', 'presentation.mdpoint', '._presentation.mdpoint', 'slideshow.md'])).toEqual({
            markdown: 'slides.md',
            companion: 'presentation.mdpoint'
        });
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

describe('PresentationService', () => {
    /** A vault of files by path, with the reads the service makes and the events it listens to, each file a presentation's. */
    function fakeVault(paths: string[], contents: Record<string, string> = {}) {
        const folders = new Map<string, TFolder>([['/', new TFolder('/')]]);
        const files = new Map<string, TFile>();
        const listeners = new Map<string, (file: TFile | TFolder) => void>();
        const folderAt = (path: string): TFolder => {
            let folder = folders.get(path);
            if (!folder) {
                folder = Object.assign(new TFolder(path), { name: path.slice(path.lastIndexOf('/') + 1) });
                folders.set(path, folder);
                folderAt(path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '/').children.push(folder);
            }
            return folder;
        };
        const parentOf = (path: string) => folderAt(path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '/');
        const add = (path: string) => {
            const file = new TFile(path);
            files.set(path, file);
            parentOf(path).children.push(file);
            return file;
        };
        paths.forEach(add);
        const app = {
            vault: {
                configDir: 'config',
                adapter: { exists: async () => false },
                on: (name: string, listener: (file: TFile | TFolder) => void) => listeners.set(name, listener),
                offref: () => {},
                getFiles: () => [...files.values()],
                getAbstractFileByPath: (path: string) => files.get(path) ?? folders.get(path) ?? null,
                cachedRead: async (file: TFile) =>
                    contents[file.path] ??
                    (file.extension === 'mdpoint'
                        ? JSON.stringify({ markdownpoint: '1.0', type: 'presentation', id: PRESENTATION_ID })
                        : '')
            },
            metadataCache: {
                on: () => ({}),
                offref: () => {},
                getFileCache: () => ({ frontmatter: { markdownpoint: '1.0', id: PRESENTATION_ID } })
            }
        } as unknown as App;
        return {
            app,
            create: (path: string) => listeners.get('create')?.(add(path)),
            delete: (path: string) => {
                const file = files.get(path)!;
                files.delete(path);
                const siblings = parentOf(path).children;
                siblings.splice(siblings.indexOf(file), 1);
                listeners.get('delete')?.(file);
            }
        };
    }
    // The service reads a folder 100 ms after its last event
    const settle = () => new Promise(resolve => window.setTimeout(resolve, 250));

    it('reads a copy of a saved version as a presentation of its own only while no presentation file stands around its versions/', async () => {
        const vault = fakeVault(['Talk/versions/copy/slides.md', 'Talk/versions/copy/presentation.mdpoint']);
        const service = new PresentationService(vault.app);
        service.start();
        await settle();
        expect(service.getSummary('Talk/versions/copy')).not.toBeNull();

        vault.create('Talk/slides.md');
        vault.create('Talk/presentation.mdpoint');
        await settle();
        expect(service.getSummary('Talk')).not.toBeNull();
        expect(service.getSummary('Talk/versions/copy')).toBeNull();

        vault.delete('Talk/presentation.mdpoint');
        await settle();
        expect(service.getSummary('Talk')).toBeNull();
        expect(service.getSummary('Talk/versions/copy')).not.toBeNull();
        service.dispose();
    });

    it('names the theme by its key and shows no size or cover where MarkdownPoint refuses the master', async () => {
        const companion = JSON.stringify({ markdownpoint: '1.0', type: 'presentation', id: PRESENTATION_ID, theme: 'studio-dark' });
        const master = {
            markdownpoint: '1.0',
            type: 'master',
            id: THEME_ID,
            name: 'Studio',
            fonts: {},
            schemes: { light: { colors: { background: '#FFFFFF', text: '#1D1D1F' } } },
            size: { width: 1280, height: 720 }
        };
        const summaryOf = async (stated: Record<string, unknown>) => {
            const paths = ['Talk/slides.md', 'Talk/presentation.mdpoint', 'Talk/themes/studio-dark/master.json'];
            const vault = fakeVault(paths, {
                'Talk/presentation.mdpoint': companion,
                'Talk/themes/studio-dark/master.json': JSON.stringify(stated)
            });
            const service = new PresentationService(vault.app);
            service.start();
            await settle();
            const summary = service.getSummary('Talk');
            service.dispose();
            return { themeName: summary?.themeName, size: summary?.size, cover: summary?.cover ?? null };
        };

        expect(await summaryOf(master)).toEqual({
            themeName: 'Studio',
            size: { width: 1280, height: 720 },
            cover: { align: 'start', light: { background: '#FFFFFF', text: '#1D1D1F', muted: '#1D1D1F' }, dark: null }
        });
        for (const refused of [{ ...master, markdownpoint: '2.0' }, { ...master, type: 'layout' }, withoutKey(master, 'markdownpoint')]) {
            expect(await summaryOf(refused)).toEqual({ themeName: 'Studio dark', size: null, cover: null });
        }
    });
});

describe('getPresentationIdentity', () => {
    const frontmatter = { markdownpoint: '1.0', id: PRESENTATION_ID };
    const companion = { markdownpoint: '1.0', type: 'presentation', id: PRESENTATION_ID };

    it('returns the presentation id when both files belong to the same presentation', () => {
        expect(getPresentationIdentity(frontmatter, companion)).toBe(PRESENTATION_ID);
    });

    it('opens any minor of format major 1 in either file', () => {
        expect(getPresentationIdentity({ ...frontmatter, markdownpoint: '1.10' }, { ...companion, markdownpoint: '1.2' })).toBe(
            PRESENTATION_ID
        );
    });

    it('rejects numeric, malformed and newer major format versions', () => {
        for (const version of [1, 1.1, '1', '1.09', '01.0', '2.0', '0.9']) {
            expect(getPresentationIdentity({ ...frontmatter, markdownpoint: version }, companion)).toBeNull();
            expect(getPresentationIdentity(frontmatter, { ...companion, markdownpoint: version })).toBeNull();
        }
    });

    it('rejects a companion from another presentation or of another kind', () => {
        const otherId = 'e39a0a69-91a3-4004-9f08-77e0759de936';
        expect(getPresentationIdentity(frontmatter, { ...companion, id: otherId })).toBeNull();
        expect(getPresentationIdentity(frontmatter, { ...companion, type: 'master' })).toBeNull();
        expect(getPresentationIdentity({ ...frontmatter, id: PRESENTATION_ID.toUpperCase() }, companion)).toBeNull();
        expect(getPresentationIdentity(undefined, companion)).toBeNull();
    });

    it('does not read the pre-1.0 document key', () => {
        expect(
            getPresentationIdentity(
                { markdownpoint: '1.0', document: PRESENTATION_ID },
                { ...companion, id: undefined, document: PRESENTATION_ID }
            )
        ).toBeNull();
    });
});

describe('countPresentationSlides', () => {
    it('counts slide markers and skips marker-shaped lines inside fenced code', () => {
        const markdown = [
            '---',
            'markdownpoint: "1.0"',
            '---',
            '',
            '<!-- section: intro -->',
            '# Intro',
            '',
            '<!-- slide: beginning -->',
            '',
            '<!-- text: body -->',
            '```markdown',
            '<!-- slide: example -->',
            '```',
            '',
            '<!-- slide: ending -->',
            '<!-- text: title -->',
            'The end'
        ].join('\r\n');

        expect(countPresentationSlides(markdown)).toBe(2);
    });

    it('reads fences as Markdown does inside lists, HTML comments and indented code', () => {
        const slides = (content: string[]) =>
            [
                '---',
                'markdownpoint: "1.0"',
                '---',
                '<!-- slide: first -->',
                '<!-- text: body -->',
                ...content,
                '',
                '<!-- slide: second -->',
                '<!-- text: body -->',
                '```',
                'code',
                '```',
                '',
                '<!-- slide: third -->',
                ''
            ].join('\n');

        expect(countPresentationSlides(slides(['- ```js', '  code()', '  ```']))).toBe(3);
        expect(countPresentationSlides(slides(['<!--', '```', '-->']))).toBe(3);
        expect(countPresentationSlides(slides(['    ```']))).toBe(3);
        expect(countPresentationSlides(slides(['```', '<!-- slide: example -->']))).toBe(1);
        expect(countPresentationSlides(slides(['<br>', '```', '<!-- slide: example -->', '```']))).toBe(3);
    });

    it('reads a marker without the spaces or tabs before it, outside fenced code', () => {
        const slides = (content: string[]) =>
            [
                '---',
                'markdownpoint: "1.0"',
                '---',
                '<!-- slide: first -->',
                '<!-- text: body -->',
                ...content,
                '',
                '  <!-- slide: second -->',
                '\t<!-- slide: third -->',
                ''
            ].join('\n');

        expect(countPresentationSlides(slides(['Words']))).toBe(3);
        // A marker-shaped line a fence holds is the code's words, in a list item's fence too
        expect(countPresentationSlides(slides(['```', '  <!-- slide: example -->', '```']))).toBe(3);
        expect(countPresentationSlides(slides(['- ```', '  <!-- slide: example -->', '  ```']))).toBe(3);
    });

    it('counts only slide markers MarkdownPoint accepts', () => {
        const markdown = [
            '---',
            'example: |',
            '  ```',
            '---',
            '<!-- slide: intro -->  ',
            '<!--slide:next-->',
            '<!-- slide: Upper -->',
            '<!-- slide: double--dash -->',
            '<!-- slide: trailing- -->',
            '<!-- slide: last -->'
        ].join('\n');

        expect(countPresentationSlides(markdown)).toBe(2);
        expect(countPresentationSlides(`${markdown}\n`)).toBe(3);
    });

    it('returns zero for markdown without slides', () => {
        expect(countPresentationSlides('# An ordinary note\n\nKeep this ordinary.\n')).toBe(0);
    });
});

describe('presentation themes', () => {
    it('accepts only stable theme keys that name a folder', () => {
        expect(isPresentationThemeKey('basic')).toBe(true);
        expect(isPresentationThemeKey('dark-room')).toBe(true);
        expect(isPresentationThemeKey('../basic')).toBe(false);
        expect(isPresentationThemeKey('con')).toBe(false);
        expect(isPresentationThemeKey(42)).toBe(false);
    });

    it('names a theme by its master name or its humanized key', () => {
        expect(getPresentationThemeName('basic', { name: 'Basic light' })).toBe('Basic light');
        expect(getPresentationThemeName('dark-room', {})).toBe('Dark room');
        expect(getPresentationThemeName('basic', null)).toBe('Basic');
    });

    it('keeps a Title layout scheme in both appearances and resolves brand colors', () => {
        const master = {
            brand: { colors: { orange: '#F2641F' } },
            schemes: {
                light: { colors: { background: '#FFFFFF', text: '#17120F', muted: '#6B605A', accent: '{brand.colors.orange}' } },
                dark: { colors: { background: '#17120F', text: '#FFF6EA', muted: '#BDB2A9' } },
                apricot: { appearance: 'light', colors: { background: '#FECAA3', text: '{brand.colors.orange}', muted: '#524843' } }
            }
        };
        const titleLayout = { scheme: 'apricot', objects: [{ id: 'title', type: 'text' }] };

        expect(resolvePresentationCover(master, titleLayout)).toEqual({
            align: 'start',
            light: { background: '#FECAA3', text: '#F2641F', muted: '#524843' },
            dark: null
        });
    });

    it('reads every hex form the format writes, and no brand color by a reference outside brand.colors', () => {
        const master = {
            brand: { colors: { orange: '#F2641F', sky: '#08F' } },
            schemes: {
                light: { colors: { background: '#FFF', text: '{brand.colors.sky}', muted: '#6B605A80' } },
                dark: { colors: { background: '#17120FCC', text: '#FEA8', muted: '{brand.orange}' } },
                retired: { appearance: 'light', colors: { background: '#FFFFFF', text: '{brand.orange}' } }
            }
        };

        expect(resolvePresentationCover(master, null)).toEqual({
            align: 'start',
            light: { background: '#FFF', text: '#08F', muted: '#6B605A80' },
            dark: { background: '#17120FCC', text: '#FEA8', muted: '#FEA8' }
        });
        // A cover in a scheme whose text names no brand color has none
        expect(resolvePresentationCover(master, { scheme: 'retired' })).toBeNull();
    });

    it('follows the light and dark schemes and a centered title when the Title layout names no scheme', () => {
        const master = {
            schemes: {
                light: { colors: { background: '#FFFFFF', text: '#1D1D1F', muted: '#6E6E73' } },
                dark: { colors: { background: '#000000', text: '#F5F5F7' } }
            }
        };
        const titleLayout = {
            objects: [
                { id: 'eyebrow', align: 'center' },
                { id: 'title', align: 'center' }
            ]
        };

        expect(resolvePresentationCover(master, titleLayout)).toEqual({
            align: 'center',
            light: { background: '#FFFFFF', text: '#1D1D1F', muted: '#6E6E73' },
            dark: { background: '#000000', text: '#F5F5F7', muted: '#F5F5F7' }
        });
    });

    it('follows the light and dark schemes when the Title layout names a scheme the master lacks, as MarkdownPoint shows it in light', () => {
        const master = {
            schemes: {
                light: { colors: { background: '#FFFFFF', text: '#1D1D1F' } },
                dark: { colors: { background: '#000000', text: '#F5F5F7' } }
            }
        };

        for (const scheme of ['retired', 'toString']) {
            expect(resolvePresentationCover(master, { scheme, objects: [] })).toEqual({
                align: 'start',
                light: { background: '#FFFFFF', text: '#1D1D1F', muted: '#1D1D1F' },
                dark: { background: '#000000', text: '#F5F5F7', muted: '#F5F5F7' }
            });
        }
    });

    it('reads a master only where MarkdownPoint reads it: format major 1, the type master, a lowercase UUID, and every key a master states', () => {
        const master = { markdownpoint: '1.0', type: 'master', id: THEME_ID, fonts: {}, schemes: {} };
        expect(readableMaster(master)).toBe(master);
        expect(readableMaster({ ...master, markdownpoint: '1.12' })).not.toBeNull();
        const refused = [
            ...Object.keys(master).map(key => withoutKey(master, key)),
            ...['2.0', '1.01', '1', 'one', 1].map(markdownpoint => ({ ...master, markdownpoint })),
            { ...master, type: 'layout' },
            { ...master, id: THEME_ID.toUpperCase() },
            { ...master, id: 'studio' }
        ];
        for (const value of refused) {
            expect(readableMaster(value), JSON.stringify(value)).toBeNull();
        }
        expect(readableMaster(null)).toBeNull();
    });

    it('reads a master’s size as MarkdownPoint does, and gives none where MarkdownPoint refuses it', () => {
        // [the master's version, its size, MarkdownPoint core's reading (`masterJsonSize`)]
        const readings: [string, unknown, { width: number; height: number } | null][] = [
            ['1.0', undefined, { width: 1920, height: 1080 }],
            ['1.0', { width: 1280, height: 720 }, { width: 1280, height: 720 }],
            ['1.0', { width: 1920.0000004, height: 1080 }, { width: 1920, height: 1080 }],
            ['1.0', { width: 1919.9999996, height: 1080 }, { width: 1920, height: 1080 }],
            ['1.0', { width: 8192.0000004, height: 1080 }, { width: 8192, height: 1080 }],
            ['1.0', { width: 1920.4, height: 1080 }, null],
            ['1.0', { width: 8193, height: 1080 }, null],
            ['1.0', { width: 0, height: 1080 }, null],
            ['1.0', { width: 0.0000004, height: 1080 }, null],
            ['1.0', { width: 1280, height: 720, depth: 1 }, null],
            ['1.0', { width: '1280', height: 720 }, null],
            ['1.0', { width: 1280 }, null],
            ['1.0', 'wide', null],
            ['1.0', null, null],
            // JSON.parse reads 1e999 as Infinity, which MarkdownPoint refuses
            ['1.0', { width: Infinity, height: 1080 }, null],
            ['1.1', { width: 8193, height: 1080 }, { width: 1920, height: 1080 }],
            ['1.1', { width: 1280, height: 720.5 }, { width: 1920, height: 1080 }],
            ['1.1', { width: -5, height: 1080 }, { width: 1920, height: 1080 }],
            ['1.1', { width: 1920.0000004, height: 1080 }, { width: 1920, height: 1080 }],
            ['1.1', { width: 1280.0000004, height: 720 }, { width: 1280, height: 720 }],
            ['1.1', { width: 1280, height: 720, depth: 1 }, { width: 1280, height: 720 }],
            ['1.10', { width: 1280, height: 720 }, { width: 1280, height: 720 }],
            // The width is read first, and a side outside the range decides before the next is read
            ['1.1', { width: 720.5, height: null }, { width: 1920, height: 1080 }],
            ['1.1', { width: 1280.5, height: '720' }, { width: 1920, height: 1080 }],
            ['1.1', { height: 720.5, width: 'x' }, null],
            ['1.1', { width: Infinity, height: 720.5 }, null],
            ['1.1', { width: null, height: 720 }, null],
            ['1.1', { width: '1280', height: 720 }, null],
            ['1.1', { width: 1280 }, null],
            ['1.1', { height: 720.5 }, null],
            ['1.1', [], null],
            ['1.1', 'wide', null]
        ];
        for (const [markdownpoint, size, reading] of readings) {
            const master = size === undefined ? { markdownpoint } : { markdownpoint, size };
            expect(resolveSlideSize(master), `${markdownpoint} ${String(JSON.stringify(size))}`).toEqual(reading);
        }
        expect(resolveSlideSize(null)).toBeNull();
    });

    it('returns no cover without readable scheme colors', () => {
        expect(resolvePresentationCover(null, null)).toBeNull();
        expect(resolvePresentationCover({ schemes: { light: { colors: { background: 'white', text: '#000000' } } } }, null)).toBeNull();
        expect(resolvePresentationCover({ schemes: { light: { background: '#FFFFFF', text: '#000000' } } }, null)).toBeNull();
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
