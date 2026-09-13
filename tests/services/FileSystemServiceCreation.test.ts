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

import { App, TFile, TFolder, parseYaml } from 'obsidian';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import { promptForTemplateValues } from '../../src/modals/TemplatePromptModal';
import { FileSystemOperations } from '../../src/services/FileSystemService';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { isPlainObjectRecordValue, sanitizeRecord } from '../../src/utils/recordUtils';
import { createTestTFile } from '../utils/createTestTFile';

vi.mock('../../src/modals/TemplatePromptModal', () => ({ promptForTemplateValues: vi.fn() }));

interface TestVaultMethods {
    registerFile(file: TFile): void;
    registerFolder(folder: TFolder): void;
}

function createContext(templateContent: string, existingNames: string[] = []) {
    const app = new App();
    const vault = app.vault as App['vault'] & TestVaultMethods;
    const folder = new TFolder('Notes');
    folder.name = 'Notes';
    folder.children = existingNames.map(name => createTestTFile(`Notes/${name}`));
    vault.registerFolder(folder);
    folder.children.forEach(file => {
        if (file instanceof TFile) {
            vault.registerFile(file);
        }
    });
    const template = createTestTFile('Templates/Default.md');
    vault.registerFile(template);
    const cachedRead = vi.fn(async () => templateContent);
    app.vault.cachedRead = cachedRead;

    let frontmatter = sanitizeRecord<unknown>(undefined);
    const create = vi.fn(async (path: string, content: string) => {
        // Model the filesystem conflict instead of accepting an invalid path and returning a renamed test file.
        if (folder.children.some(file => file.path.toLowerCase() === path.toLowerCase())) {
            throw new Error('File already exists.');
        }
        const parsed: unknown = parseYaml(content.split('---')[1] ?? '');
        frontmatter = sanitizeRecord(isPlainObjectRecordValue(parsed) ? parsed : undefined);
        const file = createTestTFile(path);
        vault.registerFile(file);
        folder.children.push(file);
        return file;
    });
    app.vault.create = create;
    app.fileManager.getNewFileParent = () => folder;
    app.fileManager.processFrontMatter = async (_file, update) => {
        update(frontmatter);
    };
    const openFile = vi.fn(async () => undefined);
    app.workspace = { getActiveFile: () => null, getLeaf: () => ({ openFile }) } as unknown as App['workspace'];

    const settings = structuredClone(DEFAULT_SETTINGS);
    settings.templateEngine = 'builtin';
    settings.folderTemplates = sanitizeRecord({ Notes: { template: template.path, includeSubfolders: true } });
    const provider: ISettingsProvider = {
        settings,
        saveSettingsAndUpdate: vi.fn(async () => undefined),
        notifySettingsUpdate: vi.fn(),
        getRecentNotes: () => [],
        setRecentNotes: vi.fn(),
        getRecentIcons: () => sanitizeRecord<string[]>(undefined),
        setRecentIcons: vi.fn(),
        getCollapsedPinnedContexts: () => sanitizeRecord<boolean>(undefined),
        updateCollapsedPinnedContexts: () => false,
        getRecentColors: () => [],
        setRecentColors: vi.fn()
    };
    const operations = new FileSystemOperations(
        app,
        () => null,
        () => null,
        () => null,
        () => null,
        () => ({ includeDescendantNotes: false, showHiddenItems: false }),
        provider
    );
    return { app, folder, vault, operations, create, cachedRead, openFile, getFrontmatter: () => frontmatter };
}

function createNote(context: ReturnType<typeof createContext>, source: 'folder' | 'tag' | 'property'): Promise<TFile | null> {
    if (source === 'folder') {
        return context.operations.createNewFile(context.folder);
    }
    return source === 'tag' ? context.operations.createNewFileForTag('work') : context.operations.createNewFileForProperty('key:status');
}

describe('templated note creation from folders, tags and properties', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.mocked(promptForTemplateValues).mockReset();
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it.each(['folder', 'tag', 'property'] as const)('avoids case-only filename conflicts when creating from a %s', async source => {
        const context = createContext('---\ntags: [base]\n---\n# {{title}}\n{{path}}', ['untitled.md', 'UNTITLED 1.md']);
        const created = await createNote(context, source);

        expect(created?.path).toBe('Notes/Untitled 2.md');
        expect(context.create).toHaveBeenCalledWith('Notes/Untitled 2.md', '---\ntags: [base]\n---\n# Untitled 2\nNotes/Untitled 2.md');
        expect(context.openFile).toHaveBeenCalledWith(created, { state: { mode: 'source' }, active: true });
        expect(context.getFrontmatter()).toEqual(
            source === 'tag' ? { tags: ['base', 'work'] } : source === 'property' ? { tags: ['base'], status: null } : { tags: ['base'] }
        );
    });

    it.each(['folder', 'tag', 'property'] as const)('chooses the filename after a %s template prompt is answered', async source => {
        const context = createContext('# {{prompt:Title}}\n{{title}}\n{{path}}');
        vi.mocked(promptForTemplateValues).mockImplementation(async () => {
            const arrivingFile = createTestTFile('Notes/UNTITLED.md');
            context.vault.registerFile(arrivingFile);
            context.folder.children.push(arrivingFile);
            return { Title: 'Planning' };
        });

        const created = await createNote(context, source);

        expect(created?.path).toBe('Notes/Untitled 1.md');
        expect(context.create).toHaveBeenCalledWith('Notes/Untitled 1.md', '# Planning\nUntitled 1\nNotes/Untitled 1.md');
        expect(promptForTemplateValues).toHaveBeenCalledTimes(1);
        expect(context.cachedRead).toHaveBeenCalledTimes(1);
    });

    it.each(['folder', 'tag', 'property'] as const)(
        'does not create or reserve a note when a %s template prompt is cancelled',
        async source => {
            const context = createContext('{{prompt:Title}}');
            vi.mocked(promptForTemplateValues).mockResolvedValueOnce(null).mockResolvedValue({ Title: 'Planning' });

            expect(await createNote(context, source)).toBeNull();
            expect(context.create).not.toHaveBeenCalled();
            expect(context.openFile).not.toHaveBeenCalled();
            expect((await createNote(context, source))?.path).toBe('Notes/Untitled.md');
        }
    );

    it('reserves names across folder, tag and property creation until the vault finishes writing', async () => {
        const context = createContext('{{title}}|{{path}}');
        const write = context.create.getMockImplementation();
        if (!write) {
            throw new Error('Missing vault write implementation');
        }
        let releaseWrite = () => {};
        const pendingWrite = new Promise<void>(resolve => {
            releaseWrite = resolve;
        });
        context.create.mockImplementationOnce(async (path, content) => {
            await pendingWrite;
            return write(path, content);
        });

        const folderNote = createNote(context, 'folder');
        await vi.waitFor(() => expect(context.create).toHaveBeenCalledTimes(1));
        const otherNotes = await Promise.all([createNote(context, 'tag'), createNote(context, 'property')]);
        releaseWrite();

        expect((await folderNote)?.path).toBe('Notes/Untitled.md');
        expect(otherNotes.map(file => file?.path)).toEqual(['Notes/Untitled 1.md', 'Notes/Untitled 2.md']);
        expect(context.create.mock.calls).toEqual([
            ['Notes/Untitled.md', 'Untitled|Notes/Untitled.md'],
            ['Notes/Untitled 1.md', 'Untitled 1|Notes/Untitled 1.md'],
            ['Notes/Untitled 2.md', 'Untitled 2|Notes/Untitled 2.md']
        ]);
    });

    it('releases a failed write reservation before another creation attempt', async () => {
        const context = createContext('{{title}}');
        context.create.mockRejectedValueOnce(new Error('Write failed'));

        expect(await createNote(context, 'folder')).toBeNull();
        expect((await createNote(context, 'tag'))?.path).toBe('Notes/Untitled.md');
    });

    it.each([
        { source: 'Status: todo', node: 'key:status=done', expected: { Status: 'done' } },
        { source: 'status: [todo, waiting]', node: 'key:status=done', expected: { status: ['done'] } },
        { source: 'STATUS: [todo]', node: 'key:status=done', expected: { STATUS: ['done'] } },
        { source: 'Status: [todo]', node: 'key:status', expected: { Status: null } }
    ])('preserves template property spelling and shape for $source with $node', async ({ source, node, expected }) => {
        const context = createContext(`---\n${source}\nUnrelated: keep\n---\n`);

        expect(await context.operations.createNewFileForProperty(node)).not.toBeNull();
        expect(context.getFrontmatter()).toEqual({ ...expected, Unrelated: 'keep' });
    });

    it.each(['tags', 'Tags', 'TAGS'])('merges the selected tag into the existing %s field', async field => {
        const context = createContext(`---\n${field}: [base]\n---\n# {{title}}`);

        const created = await context.operations.createNewFileForTag('work');

        expect(created?.path).toBe('Notes/Untitled.md');
        expect(context.getFrontmatter()).toEqual({ [field]: ['base', 'work'] });
        await context.operations.createNewFileForTag('base');
        expect(context.getFrontmatter()).toEqual({ [field]: ['base'] });
    });

    it.each([
        { existing: ['#work'], selected: 'work', expected: ['#work'] },
        { existing: ['base', '#WORK'], selected: 'work', expected: ['base', '#WORK'] },
        { existing: '#work', selected: 'work', expected: ['#work'] },
        { existing: ['Work'], selected: 'work', expected: ['Work'] },
        { existing: ['#cafe\u0301'], selected: 'caf\u00e9', expected: ['#cafe\u0301'] },
        { existing: ['#work'], selected: 'work/project', expected: ['#work', 'work/project'] }
    ])('preserves equivalent template tags without duplicating $selected in $existing', async ({ existing, selected, expected }) => {
        const context = createContext(`---\nTags: ${JSON.stringify(existing)}\nUnrelated: keep\n---\n`);

        expect(await context.operations.createNewFileForTag(selected)).not.toBeNull();
        expect(context.getFrontmatter()).toEqual({ Tags: expected, Unrelated: 'keep' });
    });
});
