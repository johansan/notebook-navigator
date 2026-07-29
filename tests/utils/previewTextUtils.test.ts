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
import { describe, expect, it, vi } from 'vitest';
import { PreviewTextUtils } from '../../src/utils/previewTextUtils';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { NotebookNavigatorSettings } from '../../src/settings/types';

vi.mock('obsidian', () => ({
    Platform: { isMobile: false }
}));

function createSettings(overrides: Partial<NotebookNavigatorSettings> = {}): NotebookNavigatorSettings {
    return {
        ...DEFAULT_SETTINGS,
        ...overrides
    };
}

describe('PreviewTextUtils.extractPreviewText', () => {
    const skipCodeSettings = createSettings({ skipHeadingsInPreview: false, skipCodeBlocksInPreview: true, stripHtmlInPreview: true });
    const includeCodeSettings = createSettings({ skipHeadingsInPreview: false, skipCodeBlocksInPreview: false, stripHtmlInPreview: true });
    const stripLatexSettings = createSettings({
        skipHeadingsInPreview: false,
        skipCodeBlocksInPreview: true,
        stripHtmlInPreview: true,
        stripLatexInPreview: true
    });
    const includeCodeAndStripLatexSettings = createSettings({
        skipHeadingsInPreview: false,
        skipCodeBlocksInPreview: false,
        stripHtmlInPreview: true,
        stripLatexInPreview: true
    });

    it('keeps italic content wrapped with asterisks', () => {
        const preview = PreviewTextUtils.extractPreviewText('*Italicized* text', skipCodeSettings);
        expect(preview).toBe('Italicized text');
    });

    it('keeps italic content wrapped with underscores', () => {
        const preview = PreviewTextUtils.extractPreviewText('Value with _italic_ content', skipCodeSettings);
        expect(preview).toBe('Value with italic content');
    });

    it('keeps inline code content while removing backticks when code blocks are included', () => {
        const preview = PreviewTextUtils.extractPreviewText('Example `inline` snippet', includeCodeSettings);
        expect(preview).toBe('Example inline snippet');
    });

    it('keeps inline code when code blocks are skipped', () => {
        const preview = PreviewTextUtils.extractPreviewText('Example `inline` snippet', skipCodeSettings);
        expect(preview).toBe('Example inline snippet');
    });

    it('keeps inline code content that includes tags and wiki links', () => {
        const content = 'Use `#include <stdio.h>` and `[[Link]]` here';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Use #include <stdio.h> and [[Link]] here');
    });

    it('removes markdown hard-escape backslashes for punctuation', () => {
        const preview = PreviewTextUtils.extractPreviewText('Escaped \\[bracket\\] and \\\\ backslash', skipCodeSettings);
        expect(preview).toBe('Escaped [bracket] and \\ backslash');
    });

    it('removes markdown hard-escape backslashes for all CommonMark escapable punctuation', () => {
        const escapablePunctuation = [
            '!',
            '"',
            '#',
            '$',
            '%',
            '&',
            "'",
            '(',
            ')',
            '*',
            '+',
            ',',
            '-',
            '.',
            '/',
            ':',
            ';',
            '<',
            '=',
            '>',
            '?',
            '@',
            '[',
            '\\',
            ']',
            '^',
            '_',
            '`',
            '{',
            '|',
            '}',
            '~'
        ];

        const escaped = escapablePunctuation.map(char => `\\${char}`).join(' ');
        const content = `Escaped ${escaped} tail`;

        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe(`Escaped ${escapablePunctuation.join(' ')} tail`);
    });

    it('removes markdown hard-escape backslashes for emphasis characters', () => {
        const preview = PreviewTextUtils.extractPreviewText('Escaped \\*stars\\* and \\_underscores\\_ tail', skipCodeSettings);
        expect(preview).toBe('Escaped *stars* and _underscores_ tail');
    });

    it('does not treat backslashes before non-punctuation as markdown hard-escapes', () => {
        const preview = PreviewTextUtils.extractPreviewText('Alpha \\a \\Z tail', skipCodeSettings);
        expect(preview).toBe('Alpha \\a \\Z tail');
    });

    it('does not unescape markdown hard-escapes inside inline code', () => {
        const preview = PreviewTextUtils.extractPreviewText('Code `\\[literal\\]` tail', skipCodeSettings);
        expect(preview).toBe('Code \\[literal\\] tail');
    });

    it('does not unescape markdown hard-escapes inside multi-backtick inline code spans', () => {
        const escapablePunctuation = [
            '!',
            '"',
            '#',
            '$',
            '%',
            '&',
            "'",
            '(',
            ')',
            '*',
            '+',
            ',',
            '-',
            '.',
            '/',
            ':',
            ';',
            '<',
            '=',
            '>',
            '?',
            '@',
            '[',
            '\\',
            ']',
            '^',
            '_',
            '`',
            '{',
            '|',
            '}',
            '~'
        ];

        const escaped = escapablePunctuation.map(char => `\\${char}`).join(' ');
        const content = 'Code ``' + escaped + '`` tail';

        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe(`Code ${escaped} tail`);
    });

    it('removes markdown hard line-break backslashes outside code', () => {
        const content = ['Alpha\\', 'Beta'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha Beta');
    });

    it('does not treat escaped backslashes before newlines as hard line breaks', () => {
        const content = ['Alpha\\\\', 'Beta'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha\\ Beta');
    });

    it('keeps backslashes before newlines inside fenced code blocks when code blocks are included', () => {
        const content = ['Intro', '```text', 'Alpha\\', 'Beta', '```', 'Outro'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeSettings);
        expect(preview).toBe('Intro Alpha\\ Beta Outro');
    });

    it('keeps escaped wiki syntax as literal text', () => {
        const preview = PreviewTextUtils.extractPreviewText('Escaped \\[\\[Page\\]\\] tail', skipCodeSettings);
        expect(preview).toBe('Escaped [[Page]] tail');
    });

    it('keeps escaped tags as literal text', () => {
        const preview = PreviewTextUtils.extractPreviewText('Escaped \\#tag tail', skipCodeSettings);
        expect(preview).toBe('Escaped #tag tail');
    });

    it('does not alter backslashes in paths', () => {
        const preview = PreviewTextUtils.extractPreviewText('Path C:\\Windows\\System32', skipCodeSettings);
        expect(preview).toBe('Path C:\\Windows\\System32');
    });

    it('does not truncate incomplete markdown image tokens inside inline code', () => {
        const content = 'Alpha `![alt](url` Beta';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha ![alt](url Beta');
    });

    it('keeps multi-backtick inline code content that looks like a callout', () => {
        const content = 'Example ``[!note]`` content';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Example [!note] content');
    });

    it('keeps callout titles and content when callouts are not skipped', () => {
        const content = '> [!note] Important title\n> First line\n> Second line';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Important title First line Second line');
    });

    it('keeps the first content line of an untitled callout', () => {
        const content = '> [!warning]\n> First line\n> Second line';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('First line Second line');
    });

    it('keeps callout content with a fold marker after the type', () => {
        const content = '> [!tip]- Folded title\n> Body line';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Folded title Body line');
    });

    it('removes callout blocks when callouts are skipped', () => {
        const settings = createSettings({ skipHeadingsInPreview: false, skipCalloutsInPreview: true });
        const content = 'Before text\n\n> [!note] Title\n> Callout content\n\nAfter text';
        const preview = PreviewTextUtils.extractPreviewText(content, settings);
        expect(preview).toBe('Before text After text');
    });

    it('removes nested callouts together with their lazy continuation lines', () => {
        const settings = createSettings({ skipHeadingsInPreview: false, skipCalloutsInPreview: true });
        const content = '> Quote line\n> > [!inner] Inner\n> > Inner content\n> More quote\n\n> After blank';
        const preview = PreviewTextUtils.extractPreviewText(content, settings);
        expect(preview).toBe('Quote line After blank');
    });

    it('removes lazy continuation lines that follow a skipped callout', () => {
        const settings = createSettings({ skipHeadingsInPreview: false, skipCalloutsInPreview: true });
        const content = '> [!note] Title\nLazy continuation line\n\nAfter text';
        const preview = PreviewTextUtils.extractPreviewText(content, settings);
        expect(preview).toBe('After text');
    });

    it('ends a skipped callout at a heading without a preceding blank line', () => {
        const settings = createSettings({ skipHeadingsInPreview: false, skipCalloutsInPreview: true });
        const content = '> [!note] Title\n# Next section\nTail text';
        const preview = PreviewTextUtils.extractPreviewText(content, settings);
        expect(preview).toBe('Next section Tail text');
    });

    it('ends a skipped callout at a list item without a preceding blank line', () => {
        const settings = createSettings({ skipHeadingsInPreview: false, skipCalloutsInPreview: true });
        const content = '> [!note] Title\n- First item';
        const preview = PreviewTextUtils.extractPreviewText(content, settings);
        expect(preview).toBe('First item');
    });

    it('removes fenced code inside a skipped callout', () => {
        const settings = createSettings({ skipHeadingsInPreview: false, skipCodeBlocksInPreview: false, skipCalloutsInPreview: true });
        const content = '> [!note]\n> ```js\n> const x = 1\n> ```\n> More callout\n\nTail text';
        const preview = PreviewTextUtils.extractPreviewText(content, settings);
        expect(preview).toBe('Tail text');
    });

    it('removes text absorbed into an unterminated fence inside a skipped callout', () => {
        const settings = createSettings({ skipHeadingsInPreview: false, skipCodeBlocksInPreview: false, skipCalloutsInPreview: true });
        const content = '> [!note]\n> ```js\n> const x = 1\nAbsorbed into code\n\nAfter blank';
        const preview = PreviewTextUtils.extractPreviewText(content, settings);
        expect(preview).toBe('After blank');
    });

    it('removes text lazily absorbed after a fenced code block in a skipped callout', () => {
        const settings = createSettings({ skipHeadingsInPreview: false, skipCodeBlocksInPreview: false, skipCalloutsInPreview: true });
        const content = '> [!note]\n> ```js\n> const x = 1\n> ```\nAbsorbed text\n\nAfter blank';
        const preview = PreviewTextUtils.extractPreviewText(content, settings);
        expect(preview).toBe('After blank');
    });

    it('removes text lazily absorbed after an empty quote line in a skipped callout', () => {
        const settings = createSettings({ skipHeadingsInPreview: false, skipCalloutsInPreview: true });
        const content = '> [!note] Title\n>\nAbsorbed text\n\nAfter blank';
        const preview = PreviewTextUtils.extractPreviewText(content, settings);
        expect(preview).toBe('After blank');
    });

    it('removes table rows lazily absorbed into a skipped callout', () => {
        const settings = createSettings({ skipHeadingsInPreview: false, skipCalloutsInPreview: true });
        const content = '> [!note] Title\n| a | b |\nAbsorbed text\n\nAfter blank';
        const preview = PreviewTextUtils.extractPreviewText(content, settings);
        expect(preview).toBe('After blank');
    });

    it('keeps a fence that interrupts a skipped callout at shallower depth', () => {
        const settings = createSettings({ skipHeadingsInPreview: false, skipCodeBlocksInPreview: false, skipCalloutsInPreview: true });
        const content = '> [!note]\n> ```js\n> const x = 1\n```\nTail text';
        const preview = PreviewTextUtils.extractPreviewText(content, settings);
        expect(preview).toBe('Tail text');
    });

    it('keeps callout syntax inside fenced code blocks when callouts are skipped', () => {
        const settings = createSettings({ skipHeadingsInPreview: false, skipCodeBlocksInPreview: false, skipCalloutsInPreview: true });
        const content = '```\n> [!note] Sample\n```\nTail text';
        const preview = PreviewTextUtils.extractPreviewText(content, settings);
        expect(preview).toBe('> [!note] Sample Tail text');
    });

    it('builds the preview from text after a callout longer than the clip window', () => {
        const settings = createSettings({ skipHeadingsInPreview: false, skipCalloutsInPreview: true });
        const calloutLines = Array.from({ length: 100 }, (_, index) => `> Callout line ${index} with filler text padding`);
        const content = `> [!note] Long callout\n${calloutLines.join('\n')}\n\nVisible tail`;
        const preview = PreviewTextUtils.extractPreviewText(content, settings);
        expect(preview).toBe('Visible tail');
    });

    it('strips markdown formatting inside callout titles', () => {
        const content = '> [!note] A **bold** [link](https://example.com) title\n> Body line';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('A bold link title Body line');
    });

    it('strips links nested inside bold formatting', () => {
        const preview = PreviewTextUtils.extractPreviewText('See **[link text](https://example.com)** here', skipCodeSettings);
        expect(preview).toBe('See link text here');
    });

    it('strips bold formatting nested inside link text', () => {
        const preview = PreviewTextUtils.extractPreviewText('See [**bold text**](https://example.com) here', skipCodeSettings);
        expect(preview).toBe('See bold text here');
    });

    it('strips italic links nested inside bold formatting', () => {
        const preview = PreviewTextUtils.extractPreviewText('See **[*italic*](https://example.com)** here', skipCodeSettings);
        expect(preview).toBe('See italic here');
    });

    it('strips nested formatting inside callout titles', () => {
        const content = '> [!note] A [**bold link**](https://example.com) title\n> Body line';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('A bold link title Body line');
    });

    it('keeps surrounding bold content when italics are nested inside', () => {
        const preview = PreviewTextUtils.extractPreviewText('**alpha *beta* gamma**', skipCodeSettings);
        expect(preview).toBe('alpha beta gamma');
    });

    it('keeps heading text containing italics when headings are included', () => {
        const preview = PreviewTextUtils.extractPreviewText('# Head *word* tail', skipCodeSettings);
        expect(preview).toBe('Head word tail');
    });

    it('keeps bold text that looks like a heading when headings are skipped', () => {
        const settings = createSettings({ skipHeadingsInPreview: true });
        const preview = PreviewTextUtils.extractPreviewText('**# Visible text** tail', settings);
        expect(preview).toBe('# Visible text tail');
    });

    it('keeps bold text that looks like a table row', () => {
        const preview = PreviewTextUtils.extractPreviewText('**| visible | text |** tail', skipCodeSettings);
        expect(preview).toBe('| visible | text | tail');
    });

    it('keeps bold text that looks like a list item', () => {
        const preview = PreviewTextUtils.extractPreviewText('**- item** tail', skipCodeSettings);
        expect(preview).toBe('- item tail');
    });

    it('builds the property preview from text after a callout longer than the clip window', () => {
        const settings = createSettings({
            skipHeadingsInPreview: false,
            skipCalloutsInPreview: true,
            previewProperties: ['summary'],
            previewPropertiesFallback: false
        });
        const calloutLines = Array.from({ length: 100 }, (_, index) => `> Callout line ${index} with filler text padding`);
        const frontmatter = { summary: `> [!note] Long callout\n${calloutLines.join('\n')}\n\nVisible property tail` };
        const preview = PreviewTextUtils.extractPreviewText('Fallback content', settings, frontmatter);
        expect(preview).toBe('Visible property tail');
    });

    it('strips html tags while keeping their text content', () => {
        const content = 'Alpha <font color="red">red</font> and <u>underlined</u> text';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha red and underlined text');
    });

    it('keeps word spacing after stripping adjacent html tags', () => {
        const content = 'Alpha<b>bold</b>Beta';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha bold Beta');
    });

    it('strips script and style blocks with spaced closing tags', () => {
        const content = 'Alpha <script>alert("hidden")</script > Beta <style>.hidden { display: none; }</style > Tail';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha Beta Tail');
    });

    it('strips script blocks with browser-accepted closing tag attributes', () => {
        const content = 'Alpha <script>alert("hidden")</script\t\n bar="baz"> Beta';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha Beta');
    });

    it('keeps html tags that are inside inline code blocks', () => {
        const content = 'Code sample `const markup = "<div>value</div>";` end';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Code sample const markup = "<div>value</div>"; end');
    });

    it('keeps html tags inside multi-backtick inline code spans', () => {
        const content = 'Code sample ``const markup = `<div>value</div>`;`` end';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Code sample const markup = `<div>value</div>`; end');
    });

    it('decodes html entities outside code while preserving code contents', () => {
        const content = 'Alpha &amp; beta &#x2022; gamma `&amp;` tail';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha & beta • gamma &amp; tail');
    });

    it('keeps html tags that are inside fenced code blocks when code blocks are included', () => {
        const content = ['Intro', '```html', '<div><span>code</span></div>', '```', 'Outro'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeSettings);
        expect(preview).toBe('Intro <div><span>code</span></div> Outro');
    });

    it('keeps html tags when HTML stripping is disabled', () => {
        const settings = createSettings({ skipHeadingsInPreview: false, skipCodeBlocksInPreview: true, stripHtmlInPreview: false });
        const preview = PreviewTextUtils.extractPreviewText('Alpha <b>bold</b> text', settings);
        expect(preview).toBe('Alpha <b>bold</b> text');
    });

    it('strips inline latex when latex stripping is enabled', () => {
        const preview = PreviewTextUtils.extractPreviewText('Alpha $x^2 + y^2 = z^2$ tail', stripLatexSettings);
        expect(preview).toBe('Alpha tail');
    });

    it('strips block latex when latex stripping is enabled', () => {
        const content = ['Intro', '$$', '\\sum_{i=1}^{10} i', '$$', 'Outro'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, stripLatexSettings);
        expect(preview).toBe('Intro Outro');
    });

    it('keeps unmatched currency dollar markers', () => {
        const preview = PreviewTextUtils.extractPreviewText('Cost is $5 and $10', stripLatexSettings);
        expect(preview).toBe('Cost is $5 and $10');
    });

    it('keeps currency ranges where closing dollar is followed by a digit', () => {
        const preview = PreviewTextUtils.extractPreviewText('Price range $5-$10 today', stripLatexSettings);
        expect(preview).toBe('Price range $5-$10 today');
    });

    it('strips single-dollar math when closing delimiter is followed by punctuation', () => {
        const preview = PreviewTextUtils.extractPreviewText('Result is $x+1$.', stripLatexSettings);
        expect(preview).toBe('Result is .');
    });

    it('keeps escaped opening dollars as literal text', () => {
        const preview = PreviewTextUtils.extractPreviewText('Escaped \\$x$ tail', stripLatexSettings);
        expect(preview).toBe('Escaped $x$ tail');
    });

    it('strips fenced-dollar math blocks with three-dollar delimiters', () => {
        const content = ['Intro', '$$$', 'x + y = z', '$$$', 'Outro'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, stripLatexSettings);
        expect(preview).toBe('Intro Outro');
    });

    it('does not treat opening $$ lines with trailing text as fenced-dollar blocks', () => {
        const content = ['Intro', '$$ not-fence', 'Outro'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, stripLatexSettings);
        expect(preview).toBe('Intro $$ not-fence Outro');
    });

    it('does not treat lines with prefix text before dollars as fenced-dollar closing lines', () => {
        const content = ['Intro', '$$', 'x + y', 'text $$', 'Outro'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, stripLatexSettings);
        expect(preview).toBe('Intro');
    });

    it('requires fenced-dollar closing indentation to be less than or equal to opening indentation', () => {
        const content = ['Intro', ' $$', 'x + y', '  $$', 'Outro'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, stripLatexSettings);
        expect(preview).toBe('Intro');
    });

    it('strips fenced-dollar blocks that include empty lines', () => {
        const content = ['Intro', '$$', '', 'x + y', '$$', 'Outro'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, stripLatexSettings);
        expect(preview).toBe('Intro Outro');
    });

    it('keeps inline and fenced code segments that contain dollar delimiters', () => {
        const content = ['Inline `$x$` sample', '```', '$$x+y$$', '```', 'Tail'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeAndStripLatexSettings);
        expect(preview).toBe('Inline $x$ sample $$x+y$$ Tail');
    });

    it('keeps latex content when latex stripping is disabled', () => {
        const settings = createSettings({
            skipHeadingsInPreview: false,
            skipCodeBlocksInPreview: true,
            stripHtmlInPreview: true,
            stripLatexInPreview: false
        });
        const preview = PreviewTextUtils.extractPreviewText('Alpha $x^2 + y^2 = z^2$ tail', settings);
        expect(preview).toBe('Alpha $x^2 + y^2 = z^2$ tail');
    });

    it('keeps blockquote text without trailing space', () => {
        const preview = PreviewTextUtils.extractPreviewText('>Quote without space', skipCodeSettings);
        expect(preview).toBe('Quote without space');
    });

    it('keeps blockquote text with trailing space', () => {
        const preview = PreviewTextUtils.extractPreviewText('> Johan', skipCodeSettings);
        expect(preview).toBe('Johan');
    });

    it('removes fenced code blocks inside blockquotes when skipping code blocks', () => {
        const content = ['> ```js', '> const value = 42;', '> ```', 'Tail'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Tail');
    });

    it('ends unterminated blockquote fences at a blank line when skipping code blocks', () => {
        const content = ['> ```js', '> const value = 42;', 'Absorbed into code', '', 'Tail'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Tail');
    });

    it('ends unterminated blockquote fences at a heading when skipping code blocks', () => {
        const content = ['> ```js', '> const value = 42;', '# Heading', 'Tail'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Heading Tail');
    });

    it('keeps fenced code block content inside blockquotes when including code blocks', () => {
        const content = ['> ```js', '> const value = 42;', '> ```', 'Tail'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeSettings);
        expect(preview).toBe('const value = 42; Tail');
    });

    it('removes fenced code blocks inside blockquotes with extra indentation when skipping code blocks', () => {
        const content = ['>   ```js', '>   const value = 42;', '>   ```', 'Tail'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Tail');
    });

    it('keeps fenced code block content inside blockquotes with extra indentation when including code blocks', () => {
        const content = ['>   ```js', '>   const value = 42;', '>   ```', 'Tail'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeSettings);
        expect(preview).toBe('const value = 42; Tail');
    });

    it('removes fenced code blocks inside nested blockquotes with extra spacing when skipping code blocks', () => {
        const content = ['>  > ```js', '>  > const value = 42;', '>  > ```', 'Tail'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Tail');
    });

    it('keeps fenced code block content inside nested blockquotes with extra spacing when including code blocks', () => {
        const content = ['>  > ```js', '>  > const value = 42;', '>  > ```', 'Tail'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeSettings);
        expect(preview).toBe('const value = 42; Tail');
    });

    it('removes tilde fenced code blocks inside blockquotes when skipping code blocks', () => {
        const content = ['> ~~~', '> const value = 42;', '> ~~~', 'Tail'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Tail');
    });

    it('keeps tilde fenced code block content inside blockquotes when including code blocks', () => {
        const content = ['> ~~~', '> const value = 42;', '> ~~~', 'Tail'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeSettings);
        expect(preview).toBe('const value = 42; Tail');
    });

    it('strips heading markers inside blockquotes', () => {
        const content = ['> ## Heading', '> # Title'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Heading Title');
    });

    it('strips list markers inside blockquotes with extra spacing', () => {
        const content = ['>   - Alpha', '>    1. Beta'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha Beta');
    });

    it('strips list markers inside blockquotes', () => {
        const content = ['> - Alpha', '> 1. Beta'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha Beta');
    });

    it('removes table rows inside blockquotes', () => {
        const content = ['> | Header | Value |', '> | --- | --- |', '> | A | B |', 'Tail'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Tail');
    });

    it('strips checkbox syntax while keeping list text', () => {
        const preview = PreviewTextUtils.extractPreviewText('- [ ] Draft task\n- Note item', skipCodeSettings);
        expect(preview).toBe('Draft task Note item');
    });

    it('strips checkbox syntax from indented tasks', () => {
        const preview = PreviewTextUtils.extractPreviewText('    - [ ] Nested task', skipCodeSettings);
        expect(preview).toBe('Nested task');
    });

    it('strips alternate task states while keeping text', () => {
        const content = '+ [x] Done task\n* [/] In progress task\n1. [-] Skipped task';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Done task In progress task Skipped task');
    });

    it('removes inline footnotes from preview text', () => {
        const preview = PreviewTextUtils.extractPreviewText('Sentence ^[footnote content] continues', skipCodeSettings);
        expect(preview).toBe('Sentence continues');
    });

    it('removes Obsidian block identifiers on their own line', () => {
        const content = ['Alpha line', '^37066f', 'Omega line'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha line Omega line');
    });

    it('removes Obsidian block identifiers at the end of paragraphs', () => {
        const preview = PreviewTextUtils.extractPreviewText('The quick purple gem dashes through. ^37066d', skipCodeSettings);
        expect(preview).toBe('The quick purple gem dashes through.');
    });

    it('preserves spacing when removing Obsidian block identifiers inside text', () => {
        const preview = PreviewTextUtils.extractPreviewText('Alpha ^37066d Omega', skipCodeSettings);
        expect(preview).toBe('Alpha Omega');
    });

    it('removes named Obsidian block identifiers', () => {
        const preview = PreviewTextUtils.extractPreviewText('Alpha ^id Omega', skipCodeSettings);
        expect(preview).toBe('Alpha Omega');
    });

    it('removes named Obsidian block identifiers containing hyphens', () => {
        const preview = PreviewTextUtils.extractPreviewText('Alpha ^quote-of-the-day Omega', skipCodeSettings);
        expect(preview).toBe('Alpha Omega');
    });

    it('does not strip Obsidian block identifier patterns inside inline code', () => {
        const preview = PreviewTextUtils.extractPreviewText('Example `^37066d` token', skipCodeSettings);
        expect(preview).toBe('Example ^37066d token');
    });

    it('removes spaced underscore horizontal rules without leaving stray characters', () => {
        const content = ['Alpha line', '_ _ _', 'Omega line'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha line Omega line');
    });

    it('removes spaced star horizontal rules without leaving stray characters', () => {
        const content = ['Top section', '* * * * *', 'Bottom section'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Top section Bottom section');
    });

    it('removes footnote references and definitions', () => {
        const content = 'Reference[^1] continues.\n\n[^1]: Footnote details';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Reference continues.');
    });

    it('removes tilde fenced code blocks when skipping code blocks', () => {
        const content = ['Summary line', '~~~', 'const value = 42;', '~~~', 'Final note'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Summary line Final note');
    });

    it('keeps tilde fenced code block content when including code blocks', () => {
        const content = ['Intro', '~~~', 'console.log(42);', '~~~', 'Outro'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeSettings);
        expect(preview).toBe('Intro console.log(42); Outro');
    });

    it('does not treat closing fences with trailing text as a closing fence', () => {
        const content = ['Intro', '```js', 'const value = 42;', '``` trailing', 'more code', '```', 'Tail'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Intro Tail');
    });

    it('keeps backticks inside fenced code blocks when code blocks are included', () => {
        const content = ['Intro', '```js', 'const value = `test`;', '```', 'Outro'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeSettings);
        expect(preview).toBe('Intro const value = `test`; Outro');
    });

    it('does not strip task checkbox markers inside fenced code blocks when code blocks are included', () => {
        const content = ['Intro', '```md', '- [ ] Not a task', '```', 'Outro'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeSettings);
        expect(preview).toBe('Intro - [ ] Not a task Outro');
    });

    it('does not strip horizontal rule lines inside fenced code blocks when code blocks are included', () => {
        const content = ['Intro', '```', '---', '```', 'Outro'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeSettings);
        expect(preview).toBe('Intro --- Outro');
    });

    it('removes fences from indented code blocks while keeping code when included', () => {
        const content = ['Intro', '  ```js', '  const value = 1;', '  ```', 'Outro'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeSettings);
        expect(preview).toBe('Intro const value = 1; Outro');
    });

    it('truncates after removing a fenced code block that crosses the preview limit', () => {
        const prefix = 'Start ';
        const beforeBlock = 'a'.repeat(300);
        const afterBlock = 'b'.repeat(260);
        const codeBody = 'console.log("x");\n'.repeat(30);
        const content = `${prefix}${beforeBlock}\n\`\`\`js\n${codeBody}\`\`\`\n${afterBlock}`;

        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);

        expect(preview).not.toContain('console.log');
        expect(preview).not.toContain('```');
        expect(preview.startsWith(`${prefix}${beforeBlock}`)).toBe(true);
        expect(preview).toContain(afterBlock.slice(0, 32));
        expect(preview.endsWith('…')).toBe(true);
        expect(preview.length).toBe(500);
    });

    it('truncates after stripping html near the preview limit', () => {
        const fillerA = 'a'.repeat(240);
        const fillerB = 'b'.repeat(260);
        const content = `Intro ${fillerA}<div>middle</div>${fillerB} Outro`;

        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);

        expect(preview).not.toContain('<div>');
        expect(preview).toContain('middle');
        expect(preview.endsWith('…')).toBe(true);
        expect(preview.length).toBe(500);
    });

    it('removes CRLF frontmatter blocks', () => {
        const content = `---\r\ntitle: Test\r\n---\r\nAlpha line`;
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha line');
    });

    it('extends clipping to include inline code spans near the limit', () => {
        const filler = 'alpha beta '.repeat(40);
        const content = `${filler}\`inline code block\` trailer`;

        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeSettings);

        expect(preview).toContain('inline code block');
        expect(preview).toContain('trailer');
        expect(preview.includes('`')).toBe(false);
    });

    it('keeps fenced code content when the preview boundary falls inside the block', () => {
        const whitespace = ' '.repeat(850);
        const codeLines = Array.from({ length: 20 }, (_, index) => `console.log(${index});`).join('\n');
        const content = `${whitespace}\n\`\`\`js\n${codeLines}\n\`\`\``;

        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeSettings);

        expect(preview).toContain('console.log(0);');
        expect(preview).toContain('console.log(19);');
        expect(preview.includes('```')).toBe(false);
    });

    it('extends clipping to the end of a fenced code block when included', () => {
        const filler = 'line '.repeat(80);
        const content = [filler, '```js', 'const first = 1;', 'const second = 2;', '```', 'tail'].join('\n');

        const preview = PreviewTextUtils.extractPreviewText(content, includeCodeSettings);

        expect(preview).toContain('const second = 2;');
        expect(preview).not.toContain('```');
    });

    it('extends clipping to finish an open html tag before stripping', () => {
        const filler = 'word '.repeat(80);
        const content = `${filler}<span>kept</span> tail`;

        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);

        expect(preview).toContain('kept tail');
    });

    it('keeps text separated when removing fenced code blocks that touch surrounding text', () => {
        const content = 'Alpha\n```js\ncode();\n```\nBeta';

        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);

        expect(preview).toBe('Alpha Beta');
    });

    it('strips embeds from previewProperties values', () => {
        const settings = createSettings({ previewProperties: ['summary'] });
        const frontmatter = { summary: '![[image.png]] Caption' };
        const preview = PreviewTextUtils.extractPreviewText('Fallback content', settings, frontmatter);
        expect(preview).toBe('Caption');
    });

    it('matches previewProperties across NFC and NFD-equivalent keys', () => {
        const settings = createSettings({ previewProperties: ['réunion'] });
        const frontmatter = { 're\u0301union': 'Preview from frontmatter' };
        const preview = PreviewTextUtils.extractPreviewText('Fallback content', settings, frontmatter);
        expect(preview).toBe('Preview from frontmatter');
    });

    it('falls back to note content when previewProperties value becomes empty', () => {
        const settings = createSettings({ previewProperties: ['summary'] });
        const frontmatter = { summary: '![[image.png]]' };
        const preview = PreviewTextUtils.extractPreviewText('Fallback content', settings, frontmatter);
        expect(preview).toBe('Fallback content');
    });

    it('returns empty preview when previewProperties fallback is disabled and property value becomes empty', () => {
        const settings = createSettings({
            previewProperties: ['summary'],
            previewPropertiesFallback: false
        });
        const frontmatter = { summary: '![[image.png]]' };
        const preview = PreviewTextUtils.extractPreviewText('Fallback content', settings, frontmatter);
        expect(preview).toBe('');
    });

    it('uses note content when previewProperties fallback is disabled and no preview properties are configured', () => {
        const settings = createSettings({ previewPropertiesFallback: false });
        const preview = PreviewTextUtils.extractPreviewText('Fallback content', settings);
        expect(preview).toBe('Fallback content');
    });

    it('keeps text separated when removing wiki embeds unwrapped by formatting', () => {
        const preview = PreviewTextUtils.extractPreviewText('Alpha**![[image.png]]**Beta', skipCodeSettings);
        expect(preview).toBe('Alpha Beta');
    });

    it('does not leak clipped wiki embed syntax into previews', () => {
        const longFileName = 'vlcsnap-'.padEnd(1100, 'a');
        const content = `---\ncreated: 2024-03-17 19:43:18\n---\n![[${longFileName}.png]]\n`;
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('');
    });

    it('does not leak clipped footnotes into previews', () => {
        const embedFiller = '![[image.png]]\n'.repeat(60);
        const content = `---\ncreated: 2024-03-17 19:43:18\n---\n${embedFiller}^[${'x'.repeat(200)}]\n`;
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('');
    });

    it('keeps internal wiki link text in preview text', () => {
        const content = 'Alpha [[Datorer/Obsidian/Make shortcuts selected]] mid [[Page|Display]] Beta';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha Datorer/Obsidian/Make shortcuts selected mid Display Beta');
    });

    it('uses wiki link alias text in preview text', () => {
        const content = 'Reference [[Artificial intelligence | AI]] in text';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Reference AI in text');
    });

    it('keeps leading hash in wiki link alias text', () => {
        const content = 'Alpha [[Page|#1]] beta';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha #1 beta');
    });

    it('normalizes wiki link display text consistently across passes', () => {
        const content = '[[Page|A|B]] and **[[Page|A|B]]**';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('A|B and A|B');
    });

    it('falls back to link text when wiki link alias is empty', () => {
        const content = 'Alpha [[Page|]] beta **[[Page|]]**';
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha Page beta Page');
    });

    it('strips wiki and markdown link syntax inside blockquotes', () => {
        const content = ['> [[wikilink]]', '> [markdown link](https://example.org)'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('wikilink markdown link');
    });

    it('does not treat wiki syntax split across lines as a wiki link', () => {
        const content = ['Alpha [[', 'Beta', ']] Gamma'].join('\n');
        const preview = PreviewTextUtils.extractPreviewText(content, skipCodeSettings);
        expect(preview).toBe('Alpha [[ Beta ]] Gamma');
    });
});

describe('PreviewTextUtils.normalizeExcerpt', () => {
    it('strips html and collapses whitespace', () => {
        const excerpt = PreviewTextUtils.normalizeExcerpt('Alpha<br>  <div>beta</div>\n gamma');
        expect(excerpt).toBe('Alpha beta gamma');
    });

    it('decodes html entities outside inline code', () => {
        const excerpt = PreviewTextUtils.normalizeExcerpt('Alpha &amp; beta `&amp;`');
        expect(excerpt).toBe('Alpha & beta &amp;');
    });

    it('preserves tags inside inline code', () => {
        const excerpt = PreviewTextUtils.normalizeExcerpt('Sample `const value = "<div>tag</div>"` here');
        expect(excerpt).toBe('Sample const value = "<div>tag</div>" here');
    });

    it('preserves tags inside multi-backtick inline code', () => {
        const excerpt = PreviewTextUtils.normalizeExcerpt('Sample ``const value = `<div>tag</div>`;`` here');
        expect(excerpt).toBe('Sample const value = `<div>tag</div>`; here');
    });

    it('keeps html tags when stripping is disabled', () => {
        const excerpt = PreviewTextUtils.normalizeExcerpt('<b>alpha</b> beta', { stripHtml: false });
        expect(excerpt).toBe('<b>alpha</b> beta');
    });

    it('returns undefined when content is empty after cleanup', () => {
        const excerpt = PreviewTextUtils.normalizeExcerpt(' <div></div> ');
        expect(excerpt).toBeUndefined();
    });

    it('keeps wiki embeds in excerpts', () => {
        const excerpt = PreviewTextUtils.normalizeExcerpt('![[image.png]] Caption');
        expect(excerpt).toBe('![[image.png]] Caption');
    });
});
