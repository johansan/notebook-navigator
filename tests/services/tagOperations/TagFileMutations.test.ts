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
import { App, TFile } from 'obsidian';
import { TagFileMutations } from '../../../src/services/tagOperations/TagFileMutations';
import type { NotebookNavigatorSettings } from '../../../src/settings/types';
import { DEFAULT_SETTINGS } from '../../../src/settings/defaultSettings';
import { createTestTFile } from '../../utils/createTestTFile';

const cachedTagsByPath = new Map<string, string[]>();

vi.mock('../../../src/storage/fileOperations', () => ({
    getDBInstance: () => ({
        getCachedTags: (path: string) => cachedTagsByPath.get(path) ?? []
    })
}));

function createFile(path: string, frontmatter: Record<string, unknown>, content: string) {
    return Object.assign(createTestTFile(path), {
        frontmatter,
        content
    });
}

describe('TagFileMutations', () => {
    let app: App;
    let settings: NotebookNavigatorSettings;
    let fileMutations: TagFileMutations;
    let vaultProcess: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        cachedTagsByPath.clear();
        settings = { ...DEFAULT_SETTINGS };

        app = new App();
        app.fileManager.processFrontMatter = vi.fn((file: TFile, callback: (fm: Record<string, unknown>) => void) => {
            callback((file as unknown as { frontmatter: Record<string, unknown> }).frontmatter);
            return Promise.resolve();
        });

        app.vault.read = vi.fn(async (file: TFile) => (file as unknown as { content: string }).content);
        app.vault.modify = vi.fn(async (file: TFile, data: string) => {
            (file as unknown as { content: string }).content = data;
        });
        vaultProcess = vi.fn(async (file: TFile, processor: (content: string) => string) => {
            const next = processor((file as unknown as { content: string }).content);
            (file as unknown as { content: string }).content = next;
            return next;
        });
        app.vault.process = vaultProcess;

        fileMutations = new TagFileMutations(app, () => settings);
    });

    it('validates tag names using canonical rules', () => {
        expect(fileMutations.isValidTagName('project')).toBe(true);
        expect(fileMutations.isValidTagName('project/client')).toBe(true);
        expect(fileMutations.isValidTagName('project😀')).toBe(true);
        expect(fileMutations.isValidTagName('my‼tag')).toBe(true);
        expect(fileMutations.isValidTagName('my👩‍💻tag')).toBe(true);
        expect(fileMutations.isValidTagName('a\u0301')).toBe(true);
        expect(fileMutations.isValidTagName('\u200D')).toBe(false);
        expect(fileMutations.isValidTagName('\u0301')).toBe(false);
        expect(fileMutations.isValidTagName('project//client')).toBe(false);
        expect(fileMutations.isValidTagName('/leading')).toBe(false);
        expect(fileMutations.isValidTagName('trailing/')).toBe(false);
        expect(fileMutations.isValidTagName('')).toBe(false);
    });

    it('removes inline tag occurrences when removing tag from file', async () => {
        const file = createFile(
            'Projects/Client.md',
            { tags: ['project', 'project/client'] },
            '#project kickoff\nFollow up with #project/client tomorrow'
        );
        cachedTagsByPath.set(file.path, ['project', 'project/client']);

        const removed = await fileMutations.removeTagFromFile(file, 'project/client');

        expect(removed).toBe(true);
        expect(file.frontmatter.tags as string[]).toEqual(['project']);
        expect(file.content).toBe('#project kickoff\nFollow up with tomorrow');
    });

    it('leaves inline tags in the note body when removing a tag with the frontmatter tag source', async () => {
        settings.tagSource = 'frontmatter';
        const file = createFile('Projects/Client.md', { tags: ['project', 'project/client'] }, 'Follow up with #project/client tomorrow');
        cachedTagsByPath.set(file.path, ['project', 'project/client']);

        const removed = await fileMutations.removeTagFromFile(file, 'project/client');

        expect(removed).toBe(true);
        expect(file.frontmatter.tags as string[]).toEqual(['project']);
        expect(file.content).toBe('Follow up with #project/client tomorrow');
    });

    it('leaves inline tags in the note body when clearing tags with the frontmatter tag source', async () => {
        settings.tagSource = 'frontmatter';
        const file = createFile('Notes/Tagged.md', { tags: ['project'] }, 'Plan #inbox today');

        const cleared = await fileMutations.clearAllTagsFromFile(file);

        expect(cleared).toBe(true);
        expect(Reflect.has(file.frontmatter, 'tags')).toBe(false);
        expect(file.content).toBe('Plan #inbox today');
        expect(vaultProcess).not.toHaveBeenCalled();
    });

    it('adds tags using the existing frontmatter key and dedupes NFC and NFD-equivalent values', async () => {
        const file = createFile('Notes/Cafe.md', { Tags: ['Cafe\u0301'] }, '');

        await fileMutations.addTagToFile(file, 'Café');

        expect(file.frontmatter.Tags).toEqual(['Cafe\u0301']);
        expect(Reflect.has(file.frontmatter, 'tags')).toBe(false);
    });

    it('clears tags using the existing frontmatter key when keeping an empty tags property', async () => {
        settings.keepEmptyTagsProperty = true;
        const file = createFile('Notes/Tagged.md', { Tags: 'project' }, '');

        const cleared = await fileMutations.clearAllTagsFromFile(file);

        expect(cleared).toBe(true);
        expect(file.frontmatter.Tags).toEqual([]);
        expect(Reflect.has(file.frontmatter, 'tags')).toBe(false);
    });

    it('removes emoji inline tag occurrences when removing tag from file', async () => {
        const file = createFile('Notes/Emoji.md', { tags: ['project😀'] }, 'Plan #project😀 today');
        cachedTagsByPath.set(file.path, ['project😀']);

        const removed = await fileMutations.removeTagFromFile(file, 'project😀');

        expect(removed).toBe(true);
        expect(Reflect.has(file.frontmatter, 'tags')).toBe(false);
        expect(file.content).toBe('Plan today');
    });

    it('skips removing inline tags inside code contexts', async () => {
        const file = createFile(
            'Projects/Review.md',
            { tags: ['project'] },
            [
                'Overview line #project with summary',
                'Johan',
                '```',
                '#project inside fenced block',
                '```',
                '`#project` inline code sample',
                'Final line #project after code'
            ].join('\n')
        );
        cachedTagsByPath.set(file.path, ['project']);

        const removed = await fileMutations.removeTagFromFile(file, 'project');

        expect(removed).toBe(true);
        const [textLine, nameLine, openingFence, fencedLine, closingFence, inlineCodeLine, finalLine] = file.content.split('\n');
        expect(textLine).not.toContain('#project');
        expect(nameLine).toBe('Johan');
        expect(openingFence).toBe('```');
        expect(fencedLine).toBe('#project inside fenced block');
        expect(closingFence).toBe('```');
        expect(inlineCodeLine).toBe('`#project` inline code sample');
        expect(finalLine).not.toContain('#project');
    });

    it('skips removing inline tags inside tilde code fences', async () => {
        const file = createFile(
            'Projects/Tilde.md',
            { tags: ['project'] },
            ['Intro line #project before code', '~~~', '#project inside tilde fenced block', '~~~', 'Outro line #project after code'].join(
                '\n'
            )
        );
        cachedTagsByPath.set(file.path, ['project']);

        const removed = await fileMutations.removeTagFromFile(file, 'project');

        expect(removed).toBe(true);
        const [introLine, openingFence, fencedLine, closingFence, outroLine] = file.content.split('\n');
        expect(introLine).not.toContain('#project');
        expect(openingFence).toBe('~~~');
        expect(fencedLine).toBe('#project inside tilde fenced block');
        expect(closingFence).toBe('~~~');
        expect(outroLine).not.toContain('#project');
    });

    it('removes inline tags inside indented markdown structures', async () => {
        const file = createFile(
            'Projects/Indented.md',
            { tags: ['project'] },
            [
                '- Parent task',
                '    - Child entry with #project tag',
                '    Text block with leading spaces and #project tag',
                '\t#project tab-indented tag'
            ].join('\n')
        );
        cachedTagsByPath.set(file.path, ['project']);

        const removed = await fileMutations.removeTagFromFile(file, 'project');

        expect(removed).toBe(true);
        const [parentLine, childLine, textLine, tabLine] = file.content.split('\n');
        expect(parentLine).toBe('- Parent task');
        expect(childLine).not.toContain('#project');
        expect(textLine).not.toContain('#project');
        expect(tabLine).not.toContain('#project');
    });

    it('does not remove non-whitespace hash fragments when clearing all tags', async () => {
        const file = createFile('Notes/AnchorFragment.md', {}, 'Visit /#anchor for section');
        cachedTagsByPath.set(file.path, []);

        const cleared = await fileMutations.clearAllTagsFromFile(file);

        expect(cleared).toBe(false);
        expect(file.content).toBe('Visit /#anchor for section');
        expect(vaultProcess).not.toHaveBeenCalled();
    });

    it('does not remove hash fragments preceded by punctuation when clearing all tags', async () => {
        const file = createFile('Notes/BangFragment.md', {}, 'Flag !#anchor token');
        cachedTagsByPath.set(file.path, []);

        const cleared = await fileMutations.clearAllTagsFromFile(file);

        expect(cleared).toBe(false);
        expect(file.content).toBe('Flag !#anchor token');
        expect(vaultProcess).not.toHaveBeenCalled();
    });

    it('keeps matches inside html tags when removing inline tags', async () => {
        const file = createFile(
            'Projects/Color.md',
            {},
            ['Inline tag #D10000 inside text', '<span style="color:#D10000">example</span>', '<a href="#D10000">link</a>'].join('\n')
        );
        cachedTagsByPath.set(file.path, ['D10000']);

        const removed = await fileMutations.removeTagFromFile(file, 'D10000');

        expect(removed).toBe(true);
        const [inlineText, spanLine, linkLine] = file.content.split('\n');
        expect(inlineText).not.toContain('#D10000');
        expect(spanLine).toContain('color:#D10000');
        expect(linkLine).toContain('href="#D10000"');
    });

    it('keeps matches inside html attributes that contain greater-than signs', async () => {
        const file = createFile('Projects/HtmlAttribute.md', {}, 'Inline #D10000 <span title="a > b #D10000">example</span>');
        cachedTagsByPath.set(file.path, ['D10000']);

        const removed = await fileMutations.removeTagFromFile(file, 'D10000');

        expect(removed).toBe(true);
        expect(file.content).toBe('Inline <span title="a > b #D10000">example</span>');
    });

    it('removes inline tags surrounded by comparison operators', async () => {
        const file = createFile('Projects/Compare.md', {}, 'Value < 5 #D10000 > threshold');
        cachedTagsByPath.set(file.path, ['D10000']);

        const removed = await fileMutations.removeTagFromFile(file, 'D10000');

        expect(removed).toBe(true);
        expect(file.content).toBe('Value < 5 > threshold');
    });

    it('collects descendant tags using cached data', () => {
        const file = createFile('Projects/Research.md', { tags: ['project', 'project/research'] }, '#project notes');
        cachedTagsByPath.set(file.path, ['project', 'project/research', 'project/research/notes']);

        const descendants = fileMutations.collectDescendantTags(file, 'project');

        expect(descendants).not.toBeNull();
        expect(descendants?.tags.sort()).toEqual(['project/research', 'project/research/notes']);
        expect(descendants?.normalizedSet.has('project/research')).toBe(true);
    });

    it('preserves code and html contexts when clearing all tags', async () => {
        const file = createFile(
            'Notes/Inline.md',
            { tags: ['ai', 'research'] },
            [
                'First line #ai tag',
                '```',
                '#ai inside fenced block',
                '```',
                '<span style="color: #0009D1">prova</span>',
                '`#ai` inline code sample',
                'Final #research line'
            ].join('\n')
        );
        cachedTagsByPath.set(file.path, ['ai', 'research']);

        const cleared = await fileMutations.clearAllTagsFromFile(file);

        expect(cleared).toBe(true);
        expect(Reflect.has(file.frontmatter, 'tags')).toBe(false);
        const [textLine, openingFence, fencedLine, closingFence, spanLine, inlineCodeLine, finalLine] = file.content.split('\n');
        expect(textLine).toBe('First line tag');
        expect(openingFence).toBe('```');
        expect(fencedLine).toBe('#ai inside fenced block');
        expect(closingFence).toBe('```');
        expect(spanLine).toContain('#0009D1');
        expect(inlineCodeLine).toBe('`#ai` inline code sample');
        expect(finalLine).toBe('Final line');
    });
});
