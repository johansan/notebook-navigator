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
    countPresentationSlides,
    getPresentationIdentity,
    getPresentationPairNames,
    getPresentationThemeName,
    isPresentationThemeKey,
    resolvePresentationCover
} from '../../src/services/PresentationService';
import { getListPaneMeasurements, getPresentationRowHeight } from '../../src/utils/listPaneMeasurements';

const PRESENTATION_ID = '656fb827-4f76-4106-91c1-de84af82e131';

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

describe('getPresentationIdentity', () => {
    const frontmatter = { markdownpoint: '1.0', id: PRESENTATION_ID };
    const companion = { markdownpoint: '1.0', kind: 'presentation', id: PRESENTATION_ID };

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
        expect(getPresentationIdentity(frontmatter, { ...companion, kind: 'master' })).toBeNull();
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
                light: { background: '#FFFFFF', text: '#17120F', muted: '#6B605A', accent: '{brand.orange}' },
                dark: { background: '#17120F', text: '#FFF6EA', muted: '#BDB2A9' },
                apricot: { background: '#FECAA3', text: '{brand.orange}', muted: '#524843' }
            }
        };
        const titleLayout = { scheme: 'apricot', objects: [{ id: 'title', type: 'text' }] };

        expect(resolvePresentationCover(master, titleLayout)).toEqual({
            align: 'start',
            light: { background: '#FECAA3', text: '#F2641F', muted: '#524843' },
            dark: null
        });
    });

    it('follows the light and dark schemes and a centered title when the Title layout names no scheme', () => {
        const master = {
            schemes: {
                light: { background: '#FFFFFF', text: '#1D1D1F', muted: '#6E6E73' },
                dark: { background: '#000000', text: '#F5F5F7' }
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

    it('returns no cover without readable scheme colors', () => {
        expect(resolvePresentationCover(null, null)).toBeNull();
        expect(resolvePresentationCover({ schemes: { light: { background: 'white', text: '#000000' } } }, null)).toBeNull();
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
