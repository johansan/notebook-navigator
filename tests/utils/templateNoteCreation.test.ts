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

import { App, Plugin, TFolder, type TFile } from 'obsidian';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TEMPLATER_PLUGIN_ID } from '../../src/constants/pluginIds';
import { TemplateFileModal } from '../../src/modals/TemplateFileModal';
import { promptForTemplateValues } from '../../src/modals/TemplatePromptModal';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { applyNativeSettingControlValue } from '../../src/settings/nativeSettingControls';
import { createMarkdownFileFromTemplate, createNoteFromTemplateInFolder } from '../../src/utils/fileCreationUtils';
import { hasPendingTemplateCursor } from '../../src/utils/templateCursor';
import { createTestTFile } from './createTestTFile';

vi.mock('../../src/modals/TemplatePromptModal', () => ({ promptForTemplateValues: vi.fn() }));

const { load: parseYaml } = await vi.importActual<{ load: (source: string) => unknown }>('js-yaml');

class TestTemplaterPlugin extends Plugin {
    fuzzy_suggester: { create_new_note_from_template: ReturnType<typeof vi.fn> };
    templater: { create_new_note_from_template: ReturnType<typeof vi.fn> };

    constructor(app: App) {
        super(app, {
            id: TEMPLATER_PLUGIN_ID,
            name: 'Templater',
            author: 'Test',
            version: '1.0.0',
            minAppVersion: '1.0.0',
            description: 'Test plugin'
        });
        this.fuzzy_suggester = { create_new_note_from_template: vi.fn() };
        this.templater = { create_new_note_from_template: vi.fn() };
    }
}

function registerTemplater(app: App): TestTemplaterPlugin {
    const plugin = new TestTemplaterPlugin(app);
    const appWithPlugins = app as App & { plugins: { plugins: Record<string, Plugin> } };
    appWithPlugins.plugins = { plugins: { [TEMPLATER_PLUGIN_ID]: plugin } };
    return plugin;
}

function createFolder(path: string, children: TFile[] = []): TFolder {
    const folder = new TFolder(path) as TFolder & { name: string; children: TFile[] };
    folder.name = path.split('/').pop() ?? '';
    folder.children = children;
    return folder;
}

/** Captures the file chooser callback of the modal so a test can pick a template without a UI. */
function captureTemplateChoice(): { open: ReturnType<typeof vi.fn>; choose: (file: TFile) => Promise<void> } {
    let onChoose: ((file: TFile) => unknown) | null = null;
    const open = vi.spyOn(TemplateFileModal.prototype, 'open').mockImplementation(function (this: TemplateFileModal) {
        const callback: unknown = Reflect.get(this, 'onChooseCallback');
        if (typeof callback === 'function') {
            onChoose = callback as (file: TFile) => unknown;
        }
    });
    return {
        open,
        choose: async file => {
            if (!onChoose) {
                throw new Error('Template modal was not opened');
            }
            await onChoose(file);
        }
    };
}

describe('createNoteFromTemplateInFolder', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.mocked(promptForTemplateValues).mockReset();
    });

    it('does not open the picker when no template folder is set and Templater is unavailable', async () => {
        const app = new App();
        const picker = captureTemplateChoice();

        await createNoteFromTemplateInFolder(
            app,
            {
                templateEngine: 'builtin',
                calendarTemplateFolder: '',
                createNewNotesInNewTab: false,
                dateFormat: 'YYYY-MM-DD',
                timeFormat: 'HH:mm',
                folderTemplates: {}
            },
            createFolder('Projects')
        );

        expect(picker.open).not.toHaveBeenCalled();
    });

    it('opens the picker over the whole vault after the vault root is saved through native settings', async () => {
        const app = new App();
        const picker = captureTemplateChoice();
        const settings = { ...DEFAULT_SETTINGS, templateEngine: 'builtin' as const };
        expect(applyNativeSettingControlValue(settings, 'calendarTemplateFolder', ' / ')).toBe(true);
        expect(settings.calendarTemplateFolder).toBe('/');

        await createNoteFromTemplateInFolder(app, settings, createFolder('Projects'));

        expect(picker.open).toHaveBeenCalled();
        expect(applyNativeSettingControlValue(settings, 'calendarTemplateFolder', '')).toBe(true);
        picker.open.mockClear();
        await createNoteFromTemplateInFolder(app, settings, createFolder('Projects'));
        expect(picker.open).not.toHaveBeenCalled();
    });

    it('uses the Templater picker in automatic mode when no template folder is set', async () => {
        const app = new App();
        const templater = registerTemplater(app);
        const picker = captureTemplateChoice();
        const folder = createFolder('Projects');

        await createNoteFromTemplateInFolder(
            app,
            {
                templateEngine: 'automatic',
                calendarTemplateFolder: '',
                createNewNotesInNewTab: false,
                dateFormat: 'YYYY-MM-DD',
                timeFormat: 'HH:mm',
                folderTemplates: {}
            },
            folder
        );

        expect(templater.fuzzy_suggester.create_new_note_from_template).toHaveBeenCalledWith(folder);
        expect(picker.open).not.toHaveBeenCalled();
    });

    it('creates a uniquely named note with the built-in engine and opens it', async () => {
        const app = new App();
        const picker = captureTemplateChoice();
        const templateFile = createTestTFile('Templates/Meeting.md');
        const existing = createTestTFile('Projects/untitled.md');
        const createdFile = createTestTFile('Projects/Untitled 1.md');
        const folder = createFolder('Projects', [existing]);
        const create = vi.fn(async () => createdFile);
        const openFile = vi.fn(async () => undefined);
        const cachedRead = vi.fn(async () => '# {{title}}');
        app.vault.create = create;
        app.vault.cachedRead = cachedRead;
        app.workspace = { getLeaf: vi.fn(() => ({ openFile })) } as unknown as App['workspace'];

        await createNoteFromTemplateInFolder(
            app,
            {
                templateEngine: 'builtin',
                calendarTemplateFolder: 'Templates',
                createNewNotesInNewTab: false,
                dateFormat: 'YYYY-MM-DD',
                timeFormat: 'HH:mm',
                folderTemplates: {}
            },
            folder
        );
        expect(picker.open).toHaveBeenCalled();
        await picker.choose(templateFile);

        // `untitled.md` already exists, so the name is bumped even though the case differs.
        expect(create).toHaveBeenCalledWith('Projects/Untitled 1.md', '# Untitled 1');
        expect(cachedRead).toHaveBeenCalledTimes(1);
        expect(openFile).toHaveBeenCalledWith(createdFile, { state: { mode: 'source' }, active: true });
    });

    it('lets Templater create and open notes for templates with Templater commands in automatic mode', async () => {
        const app = new App();
        const templater = registerTemplater(app);
        const picker = captureTemplateChoice();
        const templateFile = createTestTFile('Templates/Meeting.md');
        const folder = createFolder('Projects');
        const create = vi.fn();
        const createdFile = createTestTFile('Projects/Untitled.md');
        templater.templater.create_new_note_from_template.mockResolvedValue(createdFile);
        app.vault.create = create;
        app.vault.cachedRead = vi.fn(async () => '<% tp.file.title %>');

        await createNoteFromTemplateInFolder(
            app,
            {
                templateEngine: 'automatic',
                calendarTemplateFolder: 'Templates',
                createNewNotesInNewTab: false,
                dateFormat: 'YYYY-MM-DD',
                timeFormat: 'HH:mm',
                folderTemplates: {}
            },
            folder
        );
        await picker.choose(templateFile);

        expect(templater.templater.create_new_note_from_template).toHaveBeenCalledWith(templateFile, folder, 'Untitled', true);
        expect(create).not.toHaveBeenCalled();
        // Templater opens the note and runs its own cursor jump, so no jump is scheduled for a later open.
        expect(hasPendingTemplateCursor(createdFile.path)).toBe(false);
    });

    it('places the prompted template cursor after opening replaces the previous editor document', async () => {
        const app = new App();
        const picker = captureTemplateChoice();
        const templateFile = createTestTFile('Templates/Dagbok.md');
        const createdFile = createTestTFile('Projects/Untitled cursor.md');
        let cursor = { line: 0, ch: 0 };
        const editor = {
            setCursor: vi.fn((position: { line: number; ch: number }) => {
                cursor = position;
            }),
            focus: vi.fn()
        };
        let finishOpen = () => {
            throw new Error('File open has not started');
        };
        const openFile = vi.fn(
            () =>
                new Promise<void>(resolve => {
                    finishOpen = () => {
                        // Obsidian resets selection when it loads the document, after publishing the new file path.
                        cursor = { line: 0, ch: 0 };
                        resolve();
                    };
                })
        );
        app.vault.create = vi.fn(async () => createdFile);
        app.vault.cachedRead = vi.fn(async () => '---\ncreated: {{now}}\ntitle: {{Prompt:Title}}\n---\n\n## Test\n\n- {{cursor}}\n');
        app.workspace = {
            activeEditor: { file: createdFile, editor },
            getLeaf: vi.fn(() => ({ openFile }))
        } as unknown as App['workspace'];
        vi.mocked(promptForTemplateValues).mockResolvedValue({ Title: 'Cursor test' });

        await createNoteFromTemplateInFolder(
            app,
            { ...DEFAULT_SETTINGS, templateEngine: 'builtin', calendarTemplateFolder: 'Templates' },
            createFolder('Projects')
        );
        const creation = picker.choose(templateFile);
        await vi.waitFor(() => expect(openFile).toHaveBeenCalledOnce());

        expect(editor.setCursor).not.toHaveBeenCalled();
        expect(hasPendingTemplateCursor(createdFile.path)).toBe(true);
        finishOpen();
        await creation;

        expect(promptForTemplateValues).toHaveBeenCalledExactlyOnceWith(app, ['Title']);
        expect(cursor).toEqual({ line: 7, ch: 2 });
        expect(editor.focus).toHaveBeenCalledOnce();
        expect(hasPendingTemplateCursor(createdFile.path)).toBe(false);
    });

    it('writes parseable frontmatter with the entered title when creating a note from a prompted template', async () => {
        const app = new App();
        const picker = captureTemplateChoice();
        const templateFile = createTestTFile('Templates/Meeting.md');
        const createdFile = createTestTFile('Projects/Untitled.md');
        const value = String.raw`A "quoted" title at C:\notes`;
        const create = vi.fn(async (_path: string, _content: string) => createdFile);
        const openFile = vi.fn(async () => undefined);
        app.vault.create = create;
        app.vault.cachedRead = vi.fn(async () => '---\ntitle: "{{prompt:Title}}"\n---\n# {{value:Title}}');
        app.workspace = { getLeaf: vi.fn(() => ({ openFile })) } as unknown as App['workspace'];
        vi.mocked(promptForTemplateValues).mockResolvedValue({ Title: value });

        await createNoteFromTemplateInFolder(
            app,
            { ...DEFAULT_SETTINGS, templateEngine: 'builtin', calendarTemplateFolder: 'Templates' },
            createFolder('Projects')
        );
        await picker.choose(templateFile);

        expect(promptForTemplateValues).toHaveBeenCalledExactlyOnceWith(app, ['Title']);
        expect(create).toHaveBeenCalledTimes(1);
        const content = create.mock.calls[0][1];
        const frontmatterEnd = content.indexOf('\n---', 4);
        expect(parseYaml(content.slice(4, frontmatterEnd))).toEqual({ title: value });
        expect(content.slice(frontmatterEnd)).toBe(`\n---\n# ${value}`);
        expect(openFile).toHaveBeenCalledWith(createdFile, { state: { mode: 'source' }, active: true });
    });
});

describe('createMarkdownFileFromTemplate with Templater', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    interface TemplaterCreation {
        app: App;
        templater: TestTemplaterPlugin;
        templateFile: TFile;
        createdFile: TFile;
        folder: TFolder;
    }

    function setupTemplaterCreation(templatePath: string, createdPath: string): TemplaterCreation {
        const app = new App();
        const templater = registerTemplater(app);
        const templateFile = createTestTFile(templatePath);
        const createdFile = createTestTFile(createdPath);
        templater.templater.create_new_note_from_template.mockResolvedValue(createdFile);
        app.vault.cachedRead = vi.fn(async () => '# <% tp.file.title %>\n\n<% tp.file.cursor() %>\n');
        return { app, templater, templateFile, createdFile, folder: createFolder('Projects') };
    }

    it('schedules the Templater cursor jump when the caller opens the note', async () => {
        const { app, templater, templateFile, createdFile, folder } = setupTemplaterCreation(
            'Templates/Cursor.md',
            'Projects/Cursor note.md'
        );

        const created = await createMarkdownFileFromTemplate({
            app,
            folder,
            baseName: 'Cursor note',
            templateFile,
            settings: { ...DEFAULT_SETTINGS, templateEngine: 'templater' },
            templateErrorContext: 'note'
        });

        expect(created).toBe(createdFile);
        expect(templater.templater.create_new_note_from_template).toHaveBeenCalledWith(templateFile, folder, 'Cursor note', false);
        expect(hasPendingTemplateCursor(createdFile.path)).toBe(true);
    });

    it('does not schedule the jump when Templater opens the note itself', async () => {
        const { app, templateFile, createdFile, folder } = setupTemplaterCreation('Templates/Opened.md', 'Projects/Opened note.md');

        await createMarkdownFileFromTemplate({
            app,
            folder,
            baseName: 'Opened note',
            templateFile,
            settings: { ...DEFAULT_SETTINGS, templateEngine: 'templater' },
            openTemplaterNote: true,
            templateErrorContext: 'note'
        });

        expect(hasPendingTemplateCursor(createdFile.path)).toBe(false);
    });

    it('does not schedule the jump for notes that go straight into title editing', async () => {
        const { app, templateFile, createdFile, folder } = setupTemplaterCreation('Templates/Titled.md', 'Projects/Titled note.md');

        await createMarkdownFileFromTemplate({
            app,
            folder,
            baseName: 'Titled note',
            templateFile,
            settings: { ...DEFAULT_SETTINGS, templateEngine: 'templater' },
            placeCursor: false,
            templateErrorContext: 'note'
        });

        expect(hasPendingTemplateCursor(createdFile.path)).toBe(false);
    });
});
