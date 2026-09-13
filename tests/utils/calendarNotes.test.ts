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

import { App, Plugin, TFile } from 'obsidian';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TEMPLATER_PLUGIN_ID } from '../../src/constants/pluginIds';
import {
    buildCustomCalendarFilePathForPattern,
    createCalendarMarkdownFile,
    type CalendarNoteLocation
} from '../../src/utils/calendarNotes';
import type { MomentInstance } from '../../src/utils/moment';
import { createTestTFile } from './createTestTFile';
import { resetMomentApiCacheForTests } from '../../src/utils/moment';
import { promptForTemplateValues } from '../../src/modals/TemplatePromptModal';

vi.mock('../../src/modals/TemplatePromptModal', () => ({ promptForTemplateValues: vi.fn() }));

/** The parts of the moment package used by these tests. */
interface MomentTestApi {
    (input?: string, format?: string): MomentInstance;
}

// Obsidian provides window.moment at runtime. One test installs the real package so date tokens render.
const moment = (await vi.importActual<{ default: unknown }>('moment')).default as MomentTestApi;

interface TestVaultMethods {
    registerFile(file: TFile): void;
}

type TestTemplaterCreateFn = (
    template: TFile | string,
    folder?: unknown,
    filename?: string,
    openNewNote?: boolean
) => TFile | Promise<TFile | undefined> | undefined;

class TestTemplaterPlugin extends Plugin {
    templater: {
        create_new_note_from_template: TestTemplaterCreateFn;
    };

    constructor(app: App, createNoteFromTemplate: TestTemplaterCreateFn) {
        super(app, {
            id: TEMPLATER_PLUGIN_ID,
            name: 'Templater',
            author: 'Test',
            version: '1.0.0',
            minAppVersion: '1.0.0',
            description: 'Test plugin'
        });

        this.templater = {
            create_new_note_from_template: createNoteFromTemplate
        };
    }
}

function getTestVault(app: App): App['vault'] & TestVaultMethods {
    return app.vault as App['vault'] & TestVaultMethods;
}

function registerTemplater(app: App, createNoteFromTemplate: TestTemplaterCreateFn): void {
    const appWithPlugins = app as App & { plugins: { plugins: Record<string, Plugin> } };
    appWithPlugins.plugins = {
        plugins: {
            [TEMPLATER_PLUGIN_ID]: new TestTemplaterPlugin(app, createNoteFromTemplate)
        }
    };
}

/** Date stub for tests without window.moment: date tokens are not rendered, so only clone and startOf are called. */
function createDateStub(): MomentInstance {
    const stub = {
        clone: () => stub,
        startOf: () => stub
    };
    return stub as unknown as MomentInstance;
}

describe('calendar note creation', () => {
    const automaticSettings = { templateEngine: 'automatic' as const, dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm', folderTemplates: {} };
    const builtinSettings = { ...automaticSettings, templateEngine: 'builtin' as const };
    const templaterSettings = { ...automaticSettings, templateEngine: 'templater' as const };
    const target: CalendarNoteLocation = {
        folderPath: '/',
        fileName: '2026-06-06.md',
        filePath: '2026-06-06.md',
        formattedFilePattern: '2026-06-06',
        filePattern: 'YYYY-MM-DD',
        date: createDateStub()
    };

    afterEach(() => {
        vi.mocked(promptForTemplateValues).mockReset();
        Reflect.deleteProperty(window, 'moment');
        resetMomentApiCacheForTests();
    });

    it.each(['YYYY-MM-DD', 'YYYY-MM-DD[.md]', 'YYYY-MM-DD[.MD]'])(
        'formats calendar date tokens without the extension in %s',
        async pattern => {
            Object.defineProperty(window, 'moment', { value: moment, configurable: true, writable: true });
            resetMomentApiCacheForTests();
            const app = new App();
            const templateFile = createTestTFile('Templates/Daily.md');
            getTestVault(app).registerFile(templateFile);
            app.vault.cachedRead = vi.fn(async () => '{{title}}|{{date}}|{{yesterday}}|{{tomorrow}}|{{date+1d}}');
            const create = vi.fn(async () => createTestTFile('2026-09-13.md'));
            app.vault.create = create;
            const location = buildCustomCalendarFilePathForPattern(moment('2026-09-13'), { calendarCustomRootFolder: '/' }, pattern);

            await createCalendarMarkdownFile(app, 'day', location, templateFile.path, builtinSettings);

            expect(create).toHaveBeenCalledWith('2026-09-13.md', '2026-09-13|2026-09-13|2026-09-12|2026-09-14|2026-09-14');
        }
    );

    it('renders date tokens from the start of the period for monthly, quarterly and yearly notes', async () => {
        Object.defineProperty(window, 'moment', { value: moment, configurable: true, writable: true });
        resetMomentApiCacheForTests();
        const app = new App();
        const templateFile = createTestTFile('Templates/Quarter.md');
        const createdFile = createTestTFile('Q3 2026.md');
        const create = vi.fn(async () => createdFile);

        getTestVault(app).registerFile(templateFile);
        app.vault.cachedRead = vi.fn(async () => '{{date:YYYY-MM-DD}} {{date}} {{date+1Q:[Q]Q}}');
        getTestVault(app).create = create;

        const quarterTarget: CalendarNoteLocation = {
            folderPath: '/',
            fileName: 'Q3 2026.md',
            filePath: 'Q3 2026.md',
            formattedFilePattern: 'Q3 2026',
            filePattern: '[Q]Q YYYY',
            date: moment('2026-09-12', 'YYYY-MM-DD')
        };
        const created = await createCalendarMarkdownFile(app, 'quarter', quarterTarget, templateFile.path, builtinSettings);

        expect(created).toBe(createdFile);
        expect(create).toHaveBeenCalledWith('Q3 2026.md', '2026-07-01 Q3 2026 Q4');
    });

    it('uses Templater for templates with Templater commands when Templater is installed', async () => {
        const app = new App();
        const templateFile = createTestTFile('Templates/Daily.md');
        const createdFile = createTestTFile('Daily/2026-06-06.md');
        const createNoteFromTemplate = vi.fn(async () => createdFile);
        const create = vi.fn();

        getTestVault(app).registerFile(templateFile);
        registerTemplater(app, createNoteFromTemplate);
        app.vault.cachedRead = vi.fn(async () => '<% tp.date.now() %>');
        getTestVault(app).create = create;

        const created = await createCalendarMarkdownFile(app, 'day', target, templateFile.path, automaticSettings);

        expect(created).toBe(createdFile);
        expect(createNoteFromTemplate).toHaveBeenCalledWith(templateFile, app.vault.getRoot(), '2026-06-06', false);
        expect(create).not.toHaveBeenCalled();
    });

    it('renders templates without Templater commands with the built-in engine even when Templater is installed', async () => {
        const app = new App();
        const templateFile = createTestTFile('Templates/Daily.md');
        const createdFile = createTestTFile('2026-06-06.md');
        const createNoteFromTemplate = vi.fn(async () => createdFile);
        const create = vi.fn(async () => createdFile);

        getTestVault(app).registerFile(templateFile);
        registerTemplater(app, createNoteFromTemplate);
        app.vault.cachedRead = vi.fn(async () => '# {{title}}\n{{cursor}}');
        getTestVault(app).create = create;

        const created = await createCalendarMarkdownFile(app, 'day', target, templateFile.path, automaticSettings);

        expect(created).toBe(createdFile);
        expect(createNoteFromTemplate).not.toHaveBeenCalled();
        expect(create).toHaveBeenCalledWith('2026-06-06.md', '# 2026-06-06\n');
    });

    it.each(['automatic', 'templater'] as const)('does not prompt for a body handled by the %s Templater path', async templateEngine => {
        const app = new App();
        const templateFile = createTestTFile('Templates/Daily.md');
        const createdFile = createTestTFile(target.filePath);
        const createFromTemplater = vi.fn(async () => createdFile);
        getTestVault(app).registerFile(templateFile);
        registerTemplater(app, createFromTemplater);
        const cachedRead = vi.fn(async () => '<% tp.file.title %> {{prompt:Ignored}}');
        app.vault.cachedRead = cachedRead;
        vi.mocked(promptForTemplateValues).mockResolvedValue(null);

        expect(await createCalendarMarkdownFile(app, 'day', target, templateFile.path, { ...automaticSettings, templateEngine })).toBe(
            createdFile
        );
        expect(promptForTemplateValues).not.toHaveBeenCalled();
        expect(createFromTemplater).toHaveBeenCalledTimes(1);
        expect(cachedRead).toHaveBeenCalledTimes(1);
    });

    it('leaves folders and files untouched when a built-in prompt is cancelled or required Templater is missing', async () => {
        const app = new App();
        const templateFile = createTestTFile('Templates/Daily.md');
        const create = vi.fn();
        const createFolder = vi.fn();
        getTestVault(app).registerFile(templateFile);
        app.vault.create = create;
        app.vault.createFolder = createFolder;
        app.vault.cachedRead = vi.fn(async () => '{{prompt:Title}}');
        vi.mocked(promptForTemplateValues).mockResolvedValue(null);
        const nestedTarget = { ...target, folderPath: 'Daily/2026', filePath: `Daily/2026/${target.fileName}` };

        expect(await createCalendarMarkdownFile(app, 'day', nestedTarget, templateFile.path, builtinSettings)).toBeNull();
        expect(promptForTemplateValues).toHaveBeenCalledWith(app, ['Title']);
        vi.mocked(promptForTemplateValues).mockClear();
        expect(await createCalendarMarkdownFile(app, 'day', nestedTarget, templateFile.path, templaterSettings)).toBeNull();
        expect(promptForTemplateValues).not.toHaveBeenCalled();
        expect(create).not.toHaveBeenCalled();
        expect(createFolder).not.toHaveBeenCalled();
    });

    it('renders the same content that supplied the prompts without reading the template again', async () => {
        const app = new App();
        const templateFile = createTestTFile('Templates/Daily.md');
        const createdFile = createTestTFile(target.filePath);
        getTestVault(app).registerFile(templateFile);
        const cachedRead = vi.fn().mockResolvedValueOnce('{{prompt:Title}}').mockResolvedValue('{{prompt:Changed}}');
        const create = vi.fn(async () => createdFile);
        app.vault.cachedRead = cachedRead;
        app.vault.create = create;
        vi.mocked(promptForTemplateValues).mockResolvedValue({ Title: 'Planning' });

        await createCalendarMarkdownFile(app, 'day', target, templateFile.path, builtinSettings);

        expect(promptForTemplateValues).toHaveBeenCalledExactlyOnceWith(app, ['Title']);
        expect(cachedRead).toHaveBeenCalledTimes(1);
        expect(create).toHaveBeenCalledWith(target.filePath, 'Planning');
    });

    it('writes the template content in the create call when Templater is unavailable', async () => {
        const app = new App();
        const templateFile = createTestTFile('Templates/Daily.md');
        const createdFile = createTestTFile('2026-06-06.md');
        const templateContent = '---\ncreated: <% tp.file.creation_date("YYYY-MM-DD") %>\n---\n';
        const createNewMarkdownFile = vi.fn(async () => createdFile);
        const cachedRead = vi.fn(async () => templateContent);
        const create = vi.fn(async () => createdFile);
        const modify = vi.fn(async () => undefined);

        getTestVault(app).registerFile(templateFile);
        app.fileManager.createNewMarkdownFile = createNewMarkdownFile;
        app.vault.cachedRead = cachedRead;
        getTestVault(app).create = create;
        app.vault.modify = modify;

        const created = await createCalendarMarkdownFile(app, 'day', target, templateFile.path, automaticSettings);

        expect(created).toBe(createdFile);
        expect(createNewMarkdownFile).not.toHaveBeenCalled();
        expect(cachedRead).toHaveBeenCalledWith(templateFile);
        expect(create).toHaveBeenCalledWith('2026-06-06.md', templateContent);
        expect(modify).not.toHaveBeenCalled();
    });

    it('stops with a notice when the Templater engine is selected but Templater is missing', async () => {
        const app = new App();
        const templateFile = createTestTFile('Templates/Daily.md');
        const create = vi.fn();

        getTestVault(app).registerFile(templateFile);
        app.vault.cachedRead = vi.fn(async () => '# {{title}}');
        getTestVault(app).create = create;

        const created = await createCalendarMarkdownFile(app, 'day', target, templateFile.path, templaterSettings);

        expect(created).toBeNull();
        expect(create).not.toHaveBeenCalled();
    });

    it('creates an empty note when no template is configured', async () => {
        const app = new App();
        const createdFile = createTestTFile('2026-06-06.md');
        const createNewMarkdownFile = vi.fn(async () => createdFile);
        app.fileManager.createNewMarkdownFile = createNewMarkdownFile;

        const created = await createCalendarMarkdownFile(app, 'day', target, null, automaticSettings);

        expect(created).toBe(createdFile);
        expect(createNewMarkdownFile).toHaveBeenCalledWith(app.vault.getRoot(), '2026-06-06');
    });
});
