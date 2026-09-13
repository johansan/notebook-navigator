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

import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { MomentApi, MomentInstance } from '../../src/utils/moment';
import {
    collectTemplatePrompts,
    containsTemplaterCommands,
    renderNoteTemplate,
    type TemplateRenderContext
} from '../../src/utils/templateRenderer';

/** The parts of the moment package used by these tests. */
interface MomentTestApi {
    (input?: string, format?: string): MomentInstance;
    defineLocale(name: string, config: { parentLocale: string; week: { dow: number; doy: number } }): unknown;
    locale(name: string): string;
}

// Obsidian provides window.moment at runtime. Tests load the real package so date arithmetic and formatting are exercised.
const moment = (await vi.importActual<{ default: unknown }>('moment')).default as MomentTestApi;
const momentApi = moment as unknown as MomentApi;
// Use a YAML parser instead of the Obsidian stub so invalid escaping and changed scalar values fail these tests.
const { load: parseYaml } = await vi.importActual<{ load: (source: string) => unknown }>('js-yaml');

function noteDate(value: string, locale = 'en'): MomentInstance {
    return moment(value, 'YYYY-MM-DD').locale(locale);
}

/** Fixed creation time so clock-dependent assertions are exact. */
function fixedNow(): MomentInstance {
    return moment('2026-09-16 14:35:20', 'YYYY-MM-DD HH:mm:ss').locale('en');
}

function createContext(overrides: Partial<TemplateRenderContext> = {}): TemplateRenderContext {
    return {
        momentApi,
        title: '2026-09-16',
        folderName: 'Daily',
        path: 'Journal/Daily/2026-09-16.md',
        date: noteDate('2026-09-16'),
        dateFormat: 'YYYY-MM-DD',
        todayFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        now: fixedNow(),
        ...overrides
    };
}

describe('renderNoteTemplate', () => {
    beforeAll(() => {
        // Custom locale with a Monday week start so weekday tokens can be verified against both week rules.
        moment.defineLocale('nn-monday-start', { parentLocale: 'en', week: { dow: 1, doy: 4 } });
        moment.locale('en');
    });

    it('replaces text tokens regardless of case and inner whitespace', () => {
        const result = renderNoteTemplate('# {{title}} in {{ FOLDER }} at {{Path}}', createContext());
        expect(result.content).toBe('# 2026-09-16 in Daily at Journal/Daily/2026-09-16.md');
        expect(result.invalidTokens).toEqual([]);
    });

    it('formats the note date with the default format and explicit formats', () => {
        const result = renderNoteTemplate('{{date}} {{date:dddd, MMMM D}} {{date:[Q]Q YYYY}}', createContext({ dateFormat: 'DD.MM.YYYY' }));
        expect(result.content).toBe('16.09.2026 Wednesday, September 16 Q3 2026');
    });

    it('applies signed calendar offsets with moment units', () => {
        const template = '{{date+1d:YYYY-MM-DD}} {{date -1w:YYYY-MM-DD}} {{date+1M:YYYY-MM}} {{date+1Y:YYYY}} {{date+2q:[Q]Q}}';
        const result = renderNoteTemplate(template, createContext());
        expect(result.content).toBe('2026-09-17 2026-09-09 2026-10 2027 Q1');
    });

    it('keeps month and minute units distinct and applies time offsets to the creation clock', () => {
        const template = '{{date+1m:YYYY-MM-DD HH:mm}} {{date+1M:YYYY-MM-DD HH:mm}} {{time-1h}} {{today+2d}}';
        const result = renderNoteTemplate(template, createContext());
        expect(result.content).toBe('2026-09-16 14:36 2026-10-16 14:35 13:35 2026-09-18');
    });

    it('renders yesterday and tomorrow relative to the note date using the default date format', () => {
        const result = renderNoteTemplate(
            '[[{{yesterday}}]] [[{{tomorrow}}]] {{tomorrow:MMM D}}',
            createContext({ dateFormat: 'YYYY-MM-DD' })
        );
        expect(result.content).toBe('[[2026-09-15]] [[2026-09-17]] Sep 17');
    });

    it('resolves weekday tokens inside the locale week of the note date', () => {
        const sundayStart = renderNoteTemplate('{{sunday}} {{monday}} {{saturday:MMM D}}', createContext());
        expect(sundayStart.content).toBe('2026-09-13 2026-09-14 Sep 19');

        const mondayStart = renderNoteTemplate('{{monday}} {{sunday}}', createContext({ date: noteDate('2026-09-16', 'nn-monday-start') }));
        expect(mondayStart.content).toBe('2026-09-14 2026-09-20');
    });

    it('resolves weekday tokens inside the seven days starting at the note date for weekly notes', () => {
        const isoWeekStart = noteDate('2026-09-14');
        const result = renderNoteTemplate(
            '{{monday}} {{sunday}} {{date:GGGG-[W]WW}} {{date+1w:GGGG-[W]WW}}',
            createContext({ date: isoWeekStart, weekdayBase: 'note-date' })
        );
        expect(result.content).toBe('2026-09-14 2026-09-20 2026-W38 2026-W39');
    });

    it('renders clock tokens from the shared creation time', () => {
        const result = renderNoteTemplate('{{time}}|{{today}}|{{today:YYYY}}|{{time:HH:mm:ss}}', createContext());
        expect(result.content).toBe('14:35|2026-09-16|2026|14:35:20');
    });

    it('renders {{now}} as an ISO timestamp with the local offset', () => {
        const result = renderNoteTemplate('{{now}}|{{now:YYYY-MM-DD HH:mm}}|{{now+1h:HH:mm}}', createContext());
        expect(result.content).toMatch(/^2026-09-16T14:35:20[+-]\d{2}:\d{2}\|2026-09-16 14:35\|15:35$/);
    });

    it('uses the configured date and time formats for clock and weekday tokens without a format', () => {
        const result = renderNoteTemplate(
            '{{time}}|{{today}}|{{monday}}|{{date}}',
            createContext({ todayFormat: 'MMM D, YYYY', timeFormat: 'h:mm a' })
        );
        expect(result.content).toBe('2:35 pm|Sep 16, 2026|Sep 14, 2026|2026-09-16');
    });

    it('carries the creation clock time on note date tokens so time formats do not show midnight', () => {
        const result = renderNoteTemplate('{{date:YYYY-MM-DD HH:mm}} {{tomorrow:HH:mm}} {{friday:HH:mm}}', createContext());
        expect(result.content).toBe('2026-09-16 14:35 14:35 14:35');
    });

    it('reads the clock once per render when no fixed time is given', () => {
        const result = renderNoteTemplate('{{today}}', createContext({ now: undefined }));
        expect(result.content).toBe(moment().format('YYYY-MM-DD'));
    });

    it('falls back to the creation date when the context has no note date', () => {
        const result = renderNoteTemplate('{{date}} {{yesterday}}', createContext({ date: null }));
        expect(result.content).toBe('2026-09-16 2026-09-15');
    });

    it('removes cursor tokens and reports the position of the first one', () => {
        const result = renderNoteTemplate('# {{title}}\n\n- {{cursor}}\n- {{cursor}}\n', createContext());
        expect(result.content).toBe('# 2026-09-16\n\n- \n- \n');
        expect(result.cursor).toEqual({ line: 2, ch: 2 });
    });

    it('positions the cursor after escaped tokens, emoji and CRLF line breaks', () => {
        const result = renderNoteTemplate('{{!x}} 😀\r\nab{{cursor}}', createContext());
        expect(result.content).toBe('{{x}} 😀\r\nab');
        expect(result.cursor).toEqual({ line: 1, ch: 2 });
    });

    it('returns a null cursor when the template has no cursor token', () => {
        expect(renderNoteTemplate('plain', createContext()).cursor).toBeNull();
    });

    it('writes escaped tokens as literal text', () => {
        const result = renderNoteTemplate('{{!date}} and {{! title:x }}', createContext());
        expect(result.content).toBe('{{date}} and {{ title:x}}');
        expect(result.invalidTokens).toEqual([]);
    });

    it('keeps unknown tokens unchanged without reporting them', () => {
        const template = '{{CLIPBOARD}} {{ foo:bar }} {{}} {{ 42 }} {{date_created}} {{title-x}} {{time_zone:Z}}';
        const result = renderNoteTemplate(template, createContext());
        expect(result.content).toBe(template);
        expect(result.invalidTokens).toEqual([]);
    });

    it('keeps malformed known tokens unchanged and reports them', () => {
        const template = '{{date+1x}} {{title:YYYY}} {{date:}} {{folder+1d}} {{date+999999999999999999999d}} {{date}}';
        const result = renderNoteTemplate(template, createContext());
        expect(result.content).toBe('{{date+1x}} {{title:YYYY}} {{date:}} {{folder+1d}} {{date+999999999999999999999d}} 2026-09-16');
        expect(result.invalidTokens).toEqual([
            '{{date+1x}}',
            '{{title:YYYY}}',
            '{{date:}}',
            '{{folder+1d}}',
            '{{date+999999999999999999999d}}'
        ]);
    });

    it('renders the innermost token when tokens are nested', () => {
        // Tokens cannot contain braces, so the outer text is not a token and stays as written around the inner result.
        const result = renderNoteTemplate('{{date:{{title}}}}', createContext());
        expect(result.content).toBe('{{date:2026-09-16}}');
    });

    it('replaces prompt tokens with entered values and reports prompts without a value', () => {
        const template = '{{prompt:Title}} | {{VALUE:Title}} | {{value}} | {{prompt:Missing}}';
        const result = renderNoteTemplate(template, createContext({ promptValues: { Title: 'Weekly sync', Value: 'x' } }));
        expect(result.content).toBe('Weekly sync | Weekly sync | x | {{prompt:Missing}}');
        expect(result.invalidTokens).toEqual(['{{prompt:Missing}}']);
        expect(collectTemplatePrompts('{{date}} {{prompt:Title}} {{VALUE:Title}} {{value}} {{!prompt:Skip}} {{prompt+1d:Bad}}')).toEqual([
            'Title',
            'Value'
        ]);
    });

    it.each(['A "quoted" title', String.raw`C:\notes\topic`, 'A "quote" and \\backslash', 'Line one\nLine two\t😀'])(
        'preserves the prompt value %j in double-quoted frontmatter and Markdown',
        value => {
            const template = '---\ntitle: "{{prompt:Title}}"\ncreated: "{{now}}"\n---\n# {{value:Title}}\n{{cursor}}';
            const result = renderNoteTemplate(template, createContext({ promptValues: { Title: value } }));
            const frontmatterEnd = result.content.indexOf('\n---', 4);
            expect(parseYaml(result.content.slice(4, frontmatterEnd))).toMatchObject({ title: value });
            expect(result.content.slice(frontmatterEnd)).toBe(`\n---\n# ${value}\n`);
            expect(result.cursor).toEqual({ line: result.content.split('\n').length - 1, ch: 0 });
            expect(result.invalidTokens).toEqual([]);
        }
    );

    it('preserves apostrophes in single-quoted frontmatter values', () => {
        const value = String.raw`O'Reilly's "notes" in C:\notes`;
        const result = renderNoteTemplate(
            "---\ntitle: '{{prompt:Title}}'\n---\n{{prompt:Title}}",
            createContext({ promptValues: { Title: value } })
        );
        expect(parseYaml(result.content.slice(4, result.content.indexOf('\n---', 4)))).toEqual({ title: value });
        expect(result.content.endsWith(value)).toBe(true);
    });

    it('escapes composed quoted values and flow collections without reparsing prompt labels or replacements', () => {
        const value = String.raw`A "quote" {{date}} and \path`;
        const template = [
            '---',
            'title: "He said \\"{{prompt:Title}}\\" and {{value:Title}}"',
            'aliases: ["{{prompt:Title}}", \'{{prompt:Title}}\']',
            'nested: {"name":"{{prompt:Say "hello"}}"}',
            '---'
        ].join('\n');
        const result = renderNoteTemplate(template, createContext({ promptValues: { Title: value, 'Say "hello"': value } }));
        expect(parseYaml(result.content.slice(4, result.content.lastIndexOf('\n---')))).toEqual({
            title: `He said "${value}" and ${value}`,
            aliases: [value, value],
            nested: { name: value }
        });
    });

    it('leaves prompt replacements literal in comments, block scalars, plain scalars and the note body', () => {
        const value = 'A "quote" and \\path';
        const template = [
            '---',
            '# title: "{{prompt:Title}}"',
            'literal: |',
            '  title: "{{prompt:Title}}"',
            'folded: >-',
            '  "{{prompt:Title}}"',
            'plain: He said "{{prompt:Title}}"',
            '  and "{{prompt:Title}}"',
            '---',
            'title: "{{prompt:Title}}"'
        ].join('\n');
        expect(renderNoteTemplate(template, createContext({ promptValues: { Title: value } })).content).toBe(
            template.replace(/\{\{prompt:Title\}\}/g, () => value)
        );
    });

    it('distinguishes sequence mappings from scalar continuations', () => {
        const value = 'A "quote"';
        const template = [
            '---',
            'items:',
            '  - description: plain text',
            '    title: "{{prompt:Title}}"',
            '  - description: |',
            '      "{{prompt:Title}}"',
            '    title: "{{prompt:Title}}"',
            '---'
        ].join('\n');
        const result = renderNoteTemplate(template, createContext({ promptValues: { Title: value } }));
        expect(parseYaml(result.content.slice(4, result.content.lastIndexOf('\n---')))).toEqual({
            items: [
                { description: 'plain text', title: value },
                { description: `"${value}"\n`, title: value }
            ]
        });
    });

    it('escapes text and date tokens in quoted frontmatter with CRLF line endings', () => {
        const template = '\uFEFF---\r\ntitle: "{{title}}"\r\nfolder: \'{{folder}}\'\r\ndate: "{{date:[A "quote"]}}"\r\n---\r\n';
        const result = renderNoteTemplate(template, createContext({ title: 'A "quote"', folderName: "It's here" }));
        expect(parseYaml(result.content.slice(6, result.content.lastIndexOf('\r\n---')))).toEqual({
            title: 'A "quote"',
            folder: "It's here",
            date: 'A "quote"'
        });
    });

    it('never parses replacement text again', () => {
        const result = renderNoteTemplate('{{title}}', createContext({ title: '{{date}}' }));
        expect(result.content).toBe('{{date}}');
    });

    it('does not modify the context date', () => {
        const date = noteDate('2026-09-16');
        renderNoteTemplate('{{date+1M}} {{monday}} {{yesterday}}', createContext({ date }));
        expect(date.format('YYYY-MM-DD')).toBe('2026-09-16');
    });

    it('leaves date tokens unchanged without a moment API while still rendering text tokens', () => {
        const result = renderNoteTemplate('{{title}} {{date}} {{time}}', createContext({ momentApi: null }));
        expect(result.content).toBe('2026-09-16 {{date}} {{time}}');
        expect(result.invalidTokens).toEqual([]);
    });

    it('copies templates without tokens unchanged, including Templater syntax', () => {
        const template = '---\ncreated: <% tp.file.creation_date() %>\n---\n';
        expect(renderNoteTemplate(template, createContext()).content).toBe(template);
        expect(containsTemplaterCommands(template)).toBe(true);
        expect(containsTemplaterCommands('{{date}}')).toBe(false);
    });
});
