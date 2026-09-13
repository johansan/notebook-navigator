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

import { App, Plugin, TFile, TFolder } from 'obsidian';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TEMPLATER_PLUGIN_ID } from '../../src/constants/pluginIds';
import { promptForTemplateValues } from '../../src/modals/TemplatePromptModal';
import {
    createDailyNote,
    getDailyNoteFile,
    getDailyNoteFilename,
    getDailyNotePath,
    type DailyNoteSettings
} from '../../src/utils/dailyNotes';
import { resetMomentApiCacheForTests, type MomentInstance } from '../../src/utils/moment';
import { createTestTFile } from './createTestTFile';

vi.mock('../../src/modals/TemplatePromptModal', () => ({ promptForTemplateValues: vi.fn() }));

class TestTemplaterPlugin extends Plugin {}

const moment = (await vi.importActual<{ default: unknown }>('moment')).default as (input: string) => MomentInstance;

interface TestVaultMethods {
    registerFile(file: TFile): void;
    registerFolder(folder: TFolder): void;
    create: (path: string, content: string) => Promise<TFile>;
    createFolder: (path: string) => Promise<TFolder>;
}

function getTestVault(app: App): App['vault'] & TestVaultMethods {
    return app.vault as App['vault'] & TestVaultMethods;
}

/** Date stub whose formatted value is fixed. Date tokens are not rendered because window.moment is unavailable in tests. */
function createDateStub(formatted: string): MomentInstance {
    const stub = {
        format: () => formatted,
        clone: () => stub,
        startOf: () => stub
    };
    return stub as unknown as MomentInstance;
}

describe('createDailyNote', () => {
    const builtinSettings = { templateEngine: 'builtin' as const, dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm', folderTemplates: {} };
    const automaticSettings = { ...builtinSettings, templateEngine: 'automatic' as const };
    const settings: DailyNoteSettings = {
        folder: 'Daily',
        format: 'YYYY/YYYY-MM-DD',
        template: 'Templates/Daily'
    };

    afterEach(() => {
        vi.mocked(promptForTemplateValues).mockReset();
        Reflect.deleteProperty(window, 'moment');
        resetMomentApiCacheForTests();
    });

    it.each([
        'YYYY/MM/YYYY-MM-DD[.md]',
        'YYYY/MM/YYYY-MM-DD[.MD]',
        'YYYY/MM/YYYY-MM-DD[.Md]',
        'YYYY/MM/[note ]YYYY-MM-DD[.md]',
        'YYYY/MM/[entry.md]'
    ])('uses the filename basename for default date tokens with format %s', async format => {
        Object.defineProperty(window, 'moment', { value: moment, configurable: true, writable: true });
        resetMomentApiCacheForTests();
        const app = new App();
        const vault = getTestVault(app);
        const templateFile = createTestTFile('Templates/Daily.md');
        const date = moment('2026-09-30');
        const noteSettings = { folder: 'Daily', format, template: templateFile.path };
        vault.registerFile(templateFile);
        vault.createFolder = vi.fn(async (path: string) => {
            const folder = new TFolder(path);
            vault.registerFolder(folder);
            return folder;
        });
        const create = vi.fn(async (path: string) => {
            const file = createTestTFile(path);
            vault.registerFile(file);
            return file;
        });
        vault.create = create;
        app.metadataCache.getFirstLinkpathDest = vi.fn(() => templateFile);
        const cachedRead = vi.fn(async () => '{{title}}|{{date}}|{{yesterday}}|{{tomorrow}}|{{date+1d}}|{{date:YYYY-MM-DD[.md]}}');
        app.vault.cachedRead = cachedRead;

        const created = await createDailyNote(app, date, noteSettings, builtinSettings);

        const base = format.includes('[entry.md]') ? 'entry' : format.includes('[note ]') ? 'note 2026-09-30' : '2026-09-30';
        const yesterday = base.replace('2026-09-30', '2026-09-29');
        const tomorrow = base.replace('2026-09-30', '2026-10-01');
        expect(create).toHaveBeenCalledWith(
            `Daily/2026/09/${base}.md`,
            `${base}|${base}|${yesterday}|${tomorrow}|${tomorrow}|2026-09-30.md`
        );
        expect(cachedRead).toHaveBeenCalledTimes(1);
        expect(getDailyNotePath(date, noteSettings)).toBe(`Daily/2026/09/${base}.md`);
        expect(getDailyNoteFilename(date, noteSettings)).toBe(`${base}.md`);
        expect(getDailyNoteFile(app, date, noteSettings)).toBe(created);
        expect(await createDailyNote(app, date, noteSettings, builtinSettings)).toBe(created);
        expect(create).toHaveBeenCalledTimes(1);
    });

    it('finds an empty daily note again when its format includes an uppercase extension', async () => {
        const app = new App();
        const vault = getTestVault(app);
        const date = moment('2026-09-13');
        const noteSettings = { folder: '', format: 'YYYY-MM-DD[.MD]', template: '' };
        const createNewMarkdownFile = vi.fn(async (_folder: TFolder, baseName: string) => {
            // FileManager accepts a basename or an explicit extension and normalizes that extension to lowercase.
            const file = createTestTFile(`${baseName.replace(/\.md$/i, '')}.md`);
            vault.registerFile(file);
            return file;
        });
        app.fileManager.createNewMarkdownFile = createNewMarkdownFile;

        const created = await createDailyNote(app, date, noteSettings, automaticSettings);

        expect(created?.path).toBe('2026-09-13.md');
        expect(getDailyNoteFilename(date, noteSettings)).toBe('2026-09-13.md');
        expect(getDailyNoteFile(app, date, noteSettings)).toBe(created);
        expect(await createDailyNote(app, date, noteSettings, automaticSettings)).toBe(created);
        expect(createNewMarkdownFile).toHaveBeenCalledExactlyOnceWith(app.vault.getRoot(), '2026-09-13');
    });

    it.each(['automatic', 'templater'] as const)(
        'normalizes the filename and skips built-in body prompts with %s Templater',
        async templateEngine => {
            const app = new App();
            const templateFile = createTestTFile('Templates/Daily.md');
            const createdFile = createTestTFile('2026-09-16.md');
            const createFromTemplater = vi.fn(async () => {
                getTestVault(app).registerFile(createdFile);
                return createdFile;
            });
            const plugin = new TestTemplaterPlugin(app, {
                id: TEMPLATER_PLUGIN_ID,
                name: 'Templater',
                version: '1.0.0',
                minAppVersion: '1.0.0',
                author: 'Test',
                description: ''
            });
            Reflect.set(plugin, 'templater', { create_new_note_from_template: createFromTemplater });
            Reflect.set(app, 'plugins', { plugins: { [TEMPLATER_PLUGIN_ID]: plugin } });
            getTestVault(app).registerFile(templateFile);
            app.metadataCache.getFirstLinkpathDest = vi.fn(() => templateFile);
            app.vault.cachedRead = vi.fn(async () => '<% tp.file.title %> {{prompt:Ignored}}');
            vi.mocked(promptForTemplateValues).mockResolvedValue(null);

            const date = moment('2026-09-16');
            const noteSettings = { folder: '', format: 'YYYY-MM-DD[.MD]', template: templateFile.path };
            const templateSettings = { ...builtinSettings, templateEngine };
            const created = await createDailyNote(app, date, noteSettings, templateSettings);

            expect(created).toBe(createdFile);
            expect(promptForTemplateValues).not.toHaveBeenCalled();
            expect(getDailyNoteFile(app, date, noteSettings)).toBe(created);
            expect(await createDailyNote(app, date, noteSettings, templateSettings)).toBe(created);
            expect(createFromTemplater).toHaveBeenCalledExactlyOnceWith(templateFile, app.vault.getRoot(), '2026-09-16', false);
        }
    );

    it('creates no folders or files when a daily note prompt is cancelled', async () => {
        const app = new App();
        const vault = getTestVault(app);
        const templateFile = createTestTFile('Templates/Daily.md');
        vault.registerFile(templateFile);
        const createFolder = vi.fn();
        const create = vi.fn();
        vault.createFolder = createFolder;
        vault.create = create;
        app.metadataCache.getFirstLinkpathDest = vi.fn(() => templateFile);
        app.vault.cachedRead = vi.fn(async () => '{{prompt:Title}}');
        vi.mocked(promptForTemplateValues).mockResolvedValue(null);

        expect(await createDailyNote(app, createDateStub('2026/2026-09-16'), settings, builtinSettings)).toBeNull();
        expect(promptForTemplateValues).toHaveBeenCalledExactlyOnceWith(app, ['Title']);
        expect(createFolder).not.toHaveBeenCalled();
        expect(create).not.toHaveBeenCalled();
    });

    it('creates missing folders and writes the rendered template into the note', async () => {
        const app = new App();
        const vault = getTestVault(app);
        const templateFile = createTestTFile('Templates/Daily.md');
        const createdFile = createTestTFile('Daily/2026/2026-09-16.md');
        const createFolder = vi.fn(async (path: string) => {
            const folder = new TFolder(path) as TFolder & { name: string };
            folder.name = path.split('/').pop() ?? '';
            vault.registerFolder(folder);
            return folder;
        });
        const create = vi.fn(async () => createdFile);

        vault.registerFile(templateFile);
        vault.createFolder = createFolder;
        vault.create = create;
        app.vault.cachedRead = vi.fn(async () => '# {{title}} in {{folder}}\n{{cursor}}');
        const getFirstLinkpathDest = vi.fn(() => templateFile);
        app.metadataCache.getFirstLinkpathDest = getFirstLinkpathDest;

        const created = await createDailyNote(app, createDateStub('2026/2026-09-16'), settings, builtinSettings);

        expect(created).toBe(createdFile);
        expect(createFolder.mock.calls.map(call => call[0])).toEqual(['Daily', 'Daily/2026']);
        expect(getFirstLinkpathDest).toHaveBeenCalledWith('Templates/Daily', '');
        expect(create).toHaveBeenCalledWith('Daily/2026/2026-09-16.md', '# 2026-09-16 in 2026\n');
    });

    it('returns the existing note without creating anything', async () => {
        const app = new App();
        const vault = getTestVault(app);
        const existing = createTestTFile('Daily/2026/2026-09-16.md');
        const create = vi.fn();

        vault.registerFile(existing);
        vault.create = create;

        const created = await createDailyNote(app, createDateStub('2026/2026-09-16'), settings, builtinSettings);

        expect(created).toBe(existing);
        expect(create).not.toHaveBeenCalled();
    });

    it('creates an empty note when the template setting does not resolve to a file', async () => {
        const app = new App();
        const vault = getTestVault(app);
        const createdFile = createTestTFile('2026-09-16.md');
        const createNewMarkdownFile = vi.fn(async () => createdFile);

        vault.create = vi.fn();
        app.fileManager.createNewMarkdownFile = createNewMarkdownFile;
        app.metadataCache.getFirstLinkpathDest = vi.fn(() => null);

        const created = await createDailyNote(
            app,
            createDateStub('2026-09-16'),
            { folder: '', format: 'YYYY-MM-DD', template: 'Missing' },
            automaticSettings
        );

        expect(created).toBe(createdFile);
        expect(createNewMarkdownFile).toHaveBeenCalledWith(app.vault.getRoot(), '2026-09-16');
    });
});
