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

import { App, MarkdownView, Plugin, TFile, TFolder, type Command } from 'obsidian';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type NotebookNavigatorPlugin from '../../src/main';
import { promptForTemplateValues } from '../../src/modals/TemplatePromptModal';
import {
    buildTemplateCommandFileName,
    disposeTemplateCommandButtons,
    resolveTemplateCommandFolder,
    runTemplateCommand,
    syncTemplateCommandButtons,
    syncTemplateCommands
} from '../../src/services/commands/templateCommands';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { TemplateCommand } from '../../src/settings/types';
import { sanitizeTemplateCommands } from '../../src/settings/types';
import { createTestTFile } from '../utils/createTestTFile';
import { TEMPLATER_JUMP_TO_CURSOR_COMMAND_ID, TEMPLATER_PLUGIN_ID } from '../../src/constants/pluginIds';
import { applyPendingTemplaterCursorOnFileOpen, hasPendingTemplateCursor } from '../../src/utils/templateCursor';

vi.mock('../../src/modals/TemplatePromptModal', () => ({
    promptForTemplateValues: vi.fn()
}));
vi.mock('../../src/services/icons', () => ({ getIconService: () => ({ renderIcon: vi.fn() }) }));

class TestTemplaterPlugin extends Plugin {}

interface TestVaultMethods {
    registerFile(file: TFile): void;
    registerFolder(folder: TFolder): void;
    create: (path: string, content: string) => Promise<TFile>;
}

function getTestVault(app: App): App['vault'] & TestVaultMethods {
    return app.vault as App['vault'] & TestVaultMethods;
}

type TestFolder = TFolder & { name: string; parent: TFolder | null; children: TFile[] };

function createFolder(app: App, path: string, parent: TFolder | null): TestFolder {
    const folder = new TFolder(path) as TestFolder;
    folder.name = path === '/' ? '' : (path.split('/').pop() ?? '');
    folder.parent = parent;
    folder.children = [];
    if (path !== '/') {
        getTestVault(app).registerFolder(folder);
    }
    return folder;
}

function createCommand(overrides: Partial<TemplateCommand> = {}): TemplateCommand {
    return {
        id: 'meeting',
        name: 'New meeting note',
        template: 'Templates/Meeting.md',
        fileNameFormat: '{{prompt:Title}}',
        location: 'current',
        folder: '',
        icon: 'lucide-file-plus',
        placement: 'none',
        ...overrides
    };
}

class TestButtonElement {
    constructor(public remove: () => void) {}
}

function createButtonElement(remove: () => void): HTMLElement {
    return new TestButtonElement(remove) as unknown as HTMLElement;
}

type AddCommandMock = ReturnType<typeof vi.fn<(command: Command) => Command>>;
type RemoveCommandMock = ReturnType<typeof vi.fn<(id: string) => void>>;

interface TestPlugin {
    plugin: NotebookNavigatorPlugin;
    addCommand: AddCommandMock;
    removeCommand: RemoveCommandMock;
}

function createPlugin(app: App, commands: TemplateCommand[]): TestPlugin {
    const settings = { ...DEFAULT_SETTINGS, templateCommands: commands, templateEngine: 'builtin' as const };
    const addCommand = vi.fn<(command: Command) => Command>(command => command);
    const removeCommand = vi.fn<(id: string) => void>();
    const plugin = {
        app,
        settings,
        addCommand,
        removeCommand,
        manifest: { id: 'notebook-navigator' }
    } as unknown as NotebookNavigatorPlugin;
    return { plugin, addCommand, removeCommand };
}

describe('template commands', () => {
    beforeEach(() => {
        vi.stubGlobal('HTMLElement', TestButtonElement);
    });

    afterEach(() => {
        vi.mocked(promptForTemplateValues).mockReset();
        vi.unstubAllGlobals();
    });

    it('drops malformed persisted commands and fills defaults', () => {
        const sanitized = sanitizeTemplateCommands([
            { id: 'a', name: 'Meeting', template: 'T.md', fileNameFormat: '{{prompt:Title}}', location: 'folder', folder: 'Meetings' },
            { id: 'a', name: 'Duplicate id' },
            { id: 'b', name: 'Minimal', location: 'elsewhere' },
            { name: 'No id' },
            'text'
        ]);
        expect(sanitized).toEqual([
            {
                id: 'a',
                name: 'Meeting',
                template: 'T.md',
                fileNameFormat: '{{prompt:Title}}',
                location: 'folder',
                folder: 'Meetings',
                icon: 'lucide-file-plus',
                placement: 'none'
            },
            {
                id: 'b',
                name: 'Minimal',
                template: '',
                fileNameFormat: '',
                location: 'current',
                folder: '',
                icon: 'lucide-file-plus',
                placement: 'none'
            }
        ]);
    });

    it('registers a command per template command and removes commands that disappeared from settings', () => {
        const app = new App();
        const { plugin, addCommand, removeCommand } = createPlugin(app, [
            createCommand({ id: 'one', name: 'One' }),
            createCommand({ id: 'two', name: 'Two' })
        ]);
        const registeredNames = (): string[][] => addCommand.mock.calls.map(call => [call[0].id, call[0].name]);

        syncTemplateCommands(plugin);
        expect(registeredNames()).toEqual([
            ['template-command-one', 'One'],
            ['template-command-two', 'Two']
        ]);

        // Unchanged commands are not registered again on later settings updates.
        syncTemplateCommands(plugin);
        expect(addCommand).toHaveBeenCalledTimes(2);

        plugin.settings.templateCommands = [createCommand({ id: 'two', name: 'Two renamed' })];
        syncTemplateCommands(plugin);
        expect(removeCommand.mock.calls.map(call => call[0])).toEqual(['template-command-one', 'template-command-two']);
        expect(registeredNames().slice(-1)[0]).toEqual(['template-command-two', 'Two renamed']);
    });

    it('resolves a configured folder, and falls back from the selected folder to the active file and the root', () => {
        const app = new App();
        const root = createFolder(app, '/', null);
        const meetings = createFolder(app, 'Meetings', root);
        const active = createTestTFile('Work/Note.md');
        (active as TFile & { parent: TFolder }).parent = createFolder(app, 'Work', root);
        app.vault.getRoot = () => root;
        app.workspace = { getActiveFile: () => active } as unknown as App['workspace'];

        expect(resolveTemplateCommandFolder(app, createCommand({ location: 'folder', folder: 'Meetings' }))).toBe(meetings);
        expect(resolveTemplateCommandFolder(app, createCommand({ location: 'folder', folder: '/' }))).toBe(root);
        expect(resolveTemplateCommandFolder(app, createCommand({ location: 'folder', folder: 'Missing' }))).toBeNull();
        expect(resolveTemplateCommandFolder(app, createCommand({ location: 'current' }))?.path).toBe('Work');

        app.workspace = { getActiveFile: () => null } as unknown as App['workspace'];
        expect(resolveTemplateCommandFolder(app, createCommand({ location: 'current' }))).toBe(root);
    });

    it('builds a valid file name from the format and the entered values', () => {
        const app = new App();
        const root = createFolder(app, '/', null);
        const meetings = createFolder(app, 'Meetings', root);
        const settings = { dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm' };

        const build = (fileNameFormat: string, promptValues: Record<string, string> = {}) =>
            buildTemplateCommandFileName(settings, createCommand({ fileNameFormat }), meetings, promptValues);

        expect(build('{{prompt:Title}}', { Title: 'Weekly sync' })).toEqual({ baseName: ['Weekly sync'], invalidTokens: [] });
        expect(build('Call: {{prompt:Title}}?', { Title: 'A/B  test...' })).toEqual({ baseName: ['Call AB test'], invalidTokens: [] });
        expect(build('{{prompt:Title}}', { Title: '' })).toEqual({ baseName: ['Untitled'], invalidTokens: [] });
        // Number tokens stay as slots. The text around them is sanitized as one name, so the space before the slot survives
        // while the colon and the trailing periods are removed.
        expect(build('Note: {{number:00}}...')).toEqual({ baseName: ['Note ', { padding: 2 }], invalidTokens: [] });
        expect(build(' {{number}} ')).toEqual({ baseName: [{ padding: 1 }], invalidTokens: [] });
        expect(build('Note {{number}} draft. ')).toEqual({ baseName: ['Note ', { padding: 1 }, ' draft'], invalidTokens: [] });
        expect(build('{{number+1}} {{prompt:Title}}', { Title: 'x' })).toEqual({
            baseName: ['{{number+1}} x'],
            invalidTokens: ['{{number+1}}']
        });
    });

    it('continues the numbering of matching notes in the folder and shares the number with the template', async () => {
        const app = new App();
        const root = createFolder(app, '/', null);
        const folder = createFolder(app, 'Notes', root);
        folder.children = ['Notes/Note 03.md', 'Notes/note 7.md', 'Notes/Note 12 draft.md', 'Notes/Note 99.txt', 'Notes/Other 50.md'].map(
            createTestTFile
        );
        getTestVault(app).registerFile(createTestTFile('Templates/Note.md'));
        app.vault.cachedRead = vi.fn(async () => '# {{number}} {{title}}');
        const create = vi.fn(async (path: string) => createTestTFile(path));
        app.vault.create = create;
        app.workspace = { getLeaf: () => ({ openFile: vi.fn(async () => undefined) }) } as unknown as App['workspace'];
        const { plugin } = createPlugin(app, [
            createCommand({
                id: 'numbered',
                location: 'folder',
                folder: 'Notes',
                fileNameFormat: 'Note {{number:00}}',
                template: 'Templates/Note.md'
            }),
            createCommand({ id: 'plain', location: 'folder', folder: 'Notes', fileNameFormat: 'Plain', template: 'Templates/Note.md' })
        ]);

        await runTemplateCommand(plugin, 'numbered');
        await runTemplateCommand(plugin, 'plain');

        expect(create.mock.calls).toEqual([
            ['Notes/Note 08.md', '# 8 Note 08'],
            // Without a numbered file name the body token has no value and stays in the note.
            ['Notes/Plain.md', '# {{number}} Plain']
        ]);
    });

    it('gives overlapping numbered commands consecutive numbers before their files appear in the vault', async () => {
        const app = new App();
        const root = createFolder(app, '/', null);
        const folder = createFolder(app, 'Notes', root);
        folder.children = [createTestTFile('Notes/Note 04.md')];
        getTestVault(app).registerFile(createTestTFile('Templates/Note.md'));
        app.vault.cachedRead = vi.fn(async () => '{{number}}|{{title}}');
        const pendingWrites: Array<{ path: string; finish: (file: TFile) => void }> = [];
        const create = vi.fn((path: string, _content: string) => new Promise<TFile>(finish => pendingWrites.push({ path, finish })));
        app.vault.create = create;
        app.workspace = { getLeaf: () => ({ openFile: vi.fn(async () => undefined) }) } as unknown as App['workspace'];
        const { plugin } = createPlugin(app, [
            createCommand({ location: 'folder', folder: 'Notes', fileNameFormat: 'Note {{number:00}}', template: 'Templates/Note.md' })
        ]);

        const first = runTemplateCommand(plugin, 'meeting');
        const second = runTemplateCommand(plugin, 'meeting');
        await vi.waitFor(() => expect(pendingWrites).toHaveLength(2));
        pendingWrites.forEach(({ path, finish }) => finish(createTestTFile(path)));
        await Promise.all([first, second]);

        expect(create.mock.calls).toEqual([
            ['Notes/Note 05.md', '5|Note 05'],
            ['Notes/Note 06.md', '6|Note 06']
        ]);
    });

    it('creates nothing when the file name format has malformed tokens', async () => {
        const app = new App();
        const root = createFolder(app, '/', null);
        createFolder(app, 'Notes', root);
        getTestVault(app).registerFile(createTestTFile('Templates/Note.md'));
        app.vault.cachedRead = vi.fn(async () => 'body');
        const create = vi.fn();
        app.vault.create = create;
        const { plugin } = createPlugin(app, [
            createCommand({ location: 'folder', folder: 'Notes', fileNameFormat: 'Note {{number+1}}', template: 'Templates/Note.md' })
        ]);

        await runTemplateCommand(plugin, 'meeting');

        expect(create).not.toHaveBeenCalled();
    });

    it('reserves sequential names for overlapping commands even before their files appear in the vault', async () => {
        const app = new App();
        const root = createFolder(app, '/', null);
        const folder = createFolder(app, 'Meetings', root);
        folder.children = [createTestTFile('Meetings/weekly sync.md')];
        const template = createTestTFile('Templates/Meeting.md');
        getTestVault(app).registerFile(template);
        app.vault.cachedRead = vi.fn(async () => '{{title}}|{{path}}');
        const pendingWrites: Array<{ path: string; finish: (file: TFile) => void }> = [];
        const create = vi.fn((path: string, _content: string) => new Promise<TFile>(finish => pendingWrites.push({ path, finish })));
        app.vault.create = create;
        app.workspace = { getLeaf: () => ({ openFile: vi.fn(async () => undefined) }) } as unknown as App['workspace'];
        const { plugin } = createPlugin(app, [createCommand({ location: 'folder', folder: 'Meetings', fileNameFormat: 'Weekly sync' })]);

        const first = runTemplateCommand(plugin, 'meeting');
        const second = runTemplateCommand(plugin, 'meeting');
        await vi.waitFor(() => expect(pendingWrites).toHaveLength(2));
        pendingWrites.forEach(({ path, finish }) => finish(createTestTFile(path)));
        await Promise.all([first, second]);

        expect(create.mock.calls).toEqual([
            ['Meetings/Weekly sync 1.md', 'Weekly sync 1|Meetings/Weekly sync 1.md'],
            ['Meetings/Weekly sync 2.md', 'Weekly sync 2|Meetings/Weekly sync 2.md']
        ]);
    });

    it('prompts once per label across the file name and the template, then creates and opens the note', async () => {
        const app = new App();
        const vault = getTestVault(app);
        const root = createFolder(app, '/', null);
        createFolder(app, 'Meetings', root);
        const templateFile = createTestTFile('Templates/Meeting.md');
        const createdFile = createTestTFile('Meetings/Weekly sync.md');
        const create = vi.fn(async () => createdFile);
        const openFile = vi.fn(async () => undefined);
        vault.registerFile(templateFile);
        vault.create = create;
        const cachedRead = vi.fn(async () => '---\ntitle: {{prompt:Title}}\nroom: {{prompt:Room}}\n---\n');
        app.vault.cachedRead = cachedRead;
        app.workspace = { getActiveFile: () => null, getLeaf: vi.fn(() => ({ openFile })) } as unknown as App['workspace'];
        vi.mocked(promptForTemplateValues).mockResolvedValue({ Title: 'Weekly sync', Room: '4B' });
        const { plugin } = createPlugin(app, [
            createCommand({ location: 'folder', folder: 'Meetings', fileNameFormat: '{{prompt:Title}}' })
        ]);

        await runTemplateCommand(plugin, 'meeting');

        expect(promptForTemplateValues).toHaveBeenCalledWith(app, ['Title', 'Room']);
        expect(cachedRead).toHaveBeenCalledTimes(1);
        expect(create).toHaveBeenCalledWith('Meetings/Weekly sync.md', '---\ntitle: Weekly sync\nroom: 4B\n---\n');
        expect(openFile).toHaveBeenCalledWith(createdFile, { state: { mode: 'source' }, active: true });
    });

    it.each(['automatic', 'templater'] as const)(
        'keeps filename prompts, skips body prompts and runs the Templater cursor jump with the %s Templater path',
        async templateEngine => {
            const app = new App();
            const root = createFolder(app, '/', null);
            const folder = createFolder(app, 'Meetings', root);
            const templateFile = createTestTFile('Templates/Meeting.md');
            const createdFile = createTestTFile('Meetings/Weekly sync.md');
            const createFromTemplater = vi.fn(async () => createdFile);
            const templateContent = '<% tp.file.title %> {{prompt:Ignored}} {{prompt:Title}}\nBefore <% tp.file.cursor() %>';
            const createdContent = 'Weekly sync {{prompt:Ignored}} {{prompt:Title}}\nBefore <% tp.file.cursor() %>';
            let content = templateContent;
            let finishOpen = () => {
                throw new Error('File open has not started');
            };
            const view = new MarkdownView();
            view.file = templateFile;
            const focusEditor = vi.fn();
            view.editor = { focus: focusEditor, getValue: () => content } as unknown as MarkdownView['editor'];
            const openFile = vi.fn(
                () =>
                    new Promise<void>(resolve => {
                        // The early event sees the new path with the old template's marker still in the editor.
                        view.file = createdFile;
                        applyPendingTemplaterCursorOnFileOpen(app, createdFile);
                        finishOpen = () => {
                            content = createdContent;
                            resolve();
                        };
                    })
            );
            const templater = new TestTemplaterPlugin(app, {
                id: TEMPLATER_PLUGIN_ID,
                name: 'Templater',
                version: '1.0.0',
                minAppVersion: '1.0.0',
                author: 'Test',
                description: ''
            });
            Reflect.set(templater, 'templater', { create_new_note_from_template: createFromTemplater });
            Reflect.set(app, 'plugins', { plugins: { [TEMPLATER_PLUGIN_ID]: templater } });
            getTestVault(app).registerFile(templateFile);
            const cachedRead = vi.fn(async () => templateContent);
            app.vault.cachedRead = cachedRead;
            const executeCommandById = vi.fn(() => {
                expect(content).toBe(createdContent);
                content = content.replace('<% tp.file.cursor() %>', '');
                return true;
            });
            Reflect.set(app, 'commands', { executeCommandById });
            app.workspace = {
                activeEditor: view,
                getLeaf: vi.fn(() => ({ openFile }))
            } as unknown as App['workspace'];
            vi.mocked(promptForTemplateValues).mockResolvedValue({ Title: 'Weekly sync' });
            const { plugin } = createPlugin(app, [createCommand({ location: 'folder', folder: 'Meetings' })]);
            plugin.settings.templateEngine = templateEngine;

            const creation = runTemplateCommand(plugin, 'meeting');
            await vi.waitFor(() => expect(openFile).toHaveBeenCalledOnce());
            expect(executeCommandById).not.toHaveBeenCalled();
            expect(content).toBe(templateContent);
            expect(hasPendingTemplateCursor(createdFile.path)).toBe(true);
            finishOpen();
            await creation;

            expect(promptForTemplateValues).toHaveBeenCalledExactlyOnceWith(app, ['Title']);
            expect(createFromTemplater).toHaveBeenCalledWith(templateFile, folder, 'Weekly sync', false);
            expect(openFile).toHaveBeenCalledWith(createdFile, { state: { mode: 'source' }, active: true });
            // Templater leaves its cursor markers in the note, so its jump command runs after the note has opened.
            expect(executeCommandById).toHaveBeenCalledExactlyOnceWith(TEMPLATER_JUMP_TO_CURSOR_COMMAND_ID);
            expect(openFile.mock.invocationCallOrder[0]).toBeLessThan(executeCommandById.mock.invocationCallOrder[0]);
            expect(content).toBe(createdContent.replace('<% tp.file.cursor() %>', ''));
            expect(focusEditor).toHaveBeenCalledOnce();
            expect(hasPendingTemplateCursor(createdFile.path)).toBe(false);
            expect(cachedRead).toHaveBeenCalledTimes(1);
        }
    );

    it('uses the folder template when the command has no template, and an empty note when there is none', async () => {
        const app = new App();
        const vault = getTestVault(app);
        const root = createFolder(app, '/', null);
        createFolder(app, 'Meetings', root);
        const folderTemplate = createTestTFile('Templates/Root.md');
        const createdFile = createTestTFile('Meetings/Weekly sync.md');
        const create = vi.fn(async () => createdFile);
        const createNewMarkdownFile = vi.fn(async () => createdFile);
        const openFile = vi.fn(async () => undefined);
        vault.registerFile(folderTemplate);
        vault.create = create;
        app.fileManager.createNewMarkdownFile = createNewMarkdownFile;
        app.vault.cachedRead = vi.fn(async () => '# {{prompt:Title}}');
        app.workspace = { getActiveFile: () => null, getLeaf: vi.fn(() => ({ openFile })) } as unknown as App['workspace'];
        vi.mocked(promptForTemplateValues).mockResolvedValue({ Title: 'Weekly sync' });

        const { plugin } = createPlugin(app, [createCommand({ template: '', location: 'folder', folder: 'Meetings' })]);
        plugin.settings.folderTemplates = { '/': { template: folderTemplate.path, includeSubfolders: true } };
        await runTemplateCommand(plugin, 'meeting');
        expect(create).toHaveBeenCalledWith('Meetings/Weekly sync.md', '# Weekly sync');

        plugin.settings.folderTemplates = {};
        await runTemplateCommand(plugin, 'meeting');
        expect(createNewMarkdownFile).toHaveBeenCalledWith(expect.objectContaining({ path: 'Meetings' }), 'Weekly sync');
    });

    it('places ribbon and tab bar buttons for commands and removes them when the placement changes', () => {
        const app = new App();
        const view = new MarkdownView();
        const removeRibbonAction = vi.fn();
        const removeRibbon = vi.fn();
        const addRibbonItemButton = vi.fn((_id: string, _icon: string, _title: string, _callback: () => void) =>
            createButtonElement(removeRibbon)
        );
        const removeAction = vi.fn();
        const addAction = vi.fn(() => createButtonElement(removeAction));
        (view as MarkdownView & { addAction: typeof addAction }).addAction = addAction;
        app.workspace = {
            getLeavesOfType: () => [{ view }],
            leftRibbon: { addRibbonItemButton, removeRibbonAction }
        } as unknown as App['workspace'];
        const { plugin } = createPlugin(app, [
            createCommand({ id: 'ribbon', name: 'Ribbon note', placement: 'ribbon' }),
            createCommand({ id: 'tab', name: 'Tab note', placement: 'tabBar' })
        ]);
        (plugin as NotebookNavigatorPlugin & { registerEvent: () => void }).registerEvent = vi.fn();

        syncTemplateCommandButtons(plugin);
        expect(addRibbonItemButton).toHaveBeenCalledExactlyOnceWith(
            'notebook-navigator:template-command-ribbon',
            'lucide-file-plus',
            'Ribbon note',
            expect.any(Function)
        );
        expect(addAction).toHaveBeenCalledTimes(1);

        // Unchanged commands keep their buttons on later syncs.
        syncTemplateCommandButtons(plugin);
        expect(addRibbonItemButton).toHaveBeenCalledTimes(1);
        expect(addAction).toHaveBeenCalledTimes(1);

        plugin.settings.templateCommands = [createCommand({ id: 'ribbon', name: 'Ribbon note', placement: 'none' })];
        syncTemplateCommandButtons(plugin);
        expect(removeRibbon).toHaveBeenCalled();
        expect(removeRibbonAction).toHaveBeenCalledWith('notebook-navigator:template-command-ribbon');
        expect(removeAction).toHaveBeenCalled();

        disposeTemplateCommandButtons(plugin);
    });

    it('keeps same-name ribbon commands independent through removal, renaming and disposal', () => {
        const app = new App();
        const actions = new Map<string, { title: string; element: HTMLElement }>();
        const addRibbonItemButton = vi.fn((id: string, _icon: string, title: string, _callback: () => void) => {
            const element = createButtonElement(vi.fn());
            // Obsidian replaces an existing ribbon action with the same id, regardless of its label or callback.
            actions.set(id, { title, element });
            return element;
        });
        const removeRibbonAction = vi.fn((id: string) => actions.delete(id));
        app.workspace = {
            getLeavesOfType: () => [],
            leftRibbon: { addRibbonItemButton, removeRibbonAction }
        } as unknown as App['workspace'];
        const { plugin } = createPlugin(app, [
            createCommand({ id: 'one', name: 'Meeting', placement: 'ribbon' }),
            createCommand({ id: 'two', name: 'Meeting', placement: 'ribbon' }),
            createCommand({ id: 'navigator', name: 'Notebook Navigator', placement: 'ribbon' })
        ]);
        const navigatorButton = addRibbonItemButton('notebook-navigator:Notebook Navigator', 'icon', 'Notebook Navigator', () => {});
        // Model the public API too so using labels as ids would reproduce the collision in this test.
        plugin.addRibbonIcon = (icon, title, callback) =>
            addRibbonItemButton(`${plugin.manifest.id}:${title}`, icon, title, () => {
                callback(new MouseEvent('click'));
            });

        syncTemplateCommandButtons(plugin);
        expect(actions.size).toBe(4);
        expect([...actions.values()].map(action => action.title)).toEqual([
            'Notebook Navigator',
            'Meeting',
            'Meeting',
            'Notebook Navigator'
        ]);
        const survivingButton = actions.get('notebook-navigator:template-command-two')?.element;

        plugin.settings.templateCommands = plugin.settings.templateCommands.filter(command => command.id !== 'one');
        syncTemplateCommandButtons(plugin);
        expect(actions.size).toBe(3);
        expect(actions.get('notebook-navigator:template-command-two')?.element).toBe(survivingButton);

        plugin.settings.templateCommands[0].name = 'Renamed';
        syncTemplateCommandButtons(plugin);
        expect(actions.size).toBe(3);
        expect(actions.get('notebook-navigator:template-command-two')?.title).toBe('Renamed');
        expect(actions.get('notebook-navigator:Notebook Navigator')?.element).toBe(navigatorButton);

        disposeTemplateCommandButtons(plugin);
        expect([...actions.keys()]).toEqual(['notebook-navigator:Notebook Navigator']);
    });

    it('creates nothing when a prompt is cancelled or the template is missing', async () => {
        const app = new App();
        const vault = getTestVault(app);
        const root = createFolder(app, '/', null);
        createFolder(app, 'Meetings', root);
        const templateFile = createTestTFile('Templates/Meeting.md');
        const create = vi.fn();
        vault.registerFile(templateFile);
        vault.create = create;
        app.vault.cachedRead = vi.fn(async () => '{{prompt:Title}}');
        app.workspace = { getActiveFile: () => null } as unknown as App['workspace'];

        vi.mocked(promptForTemplateValues).mockResolvedValue(null);
        await runTemplateCommand(createPlugin(app, [createCommand({ location: 'folder', folder: 'Meetings' })]).plugin, 'meeting');

        vi.mocked(promptForTemplateValues).mockResolvedValue({});
        await runTemplateCommand(
            createPlugin(app, [createCommand({ location: 'folder', folder: 'Meetings', template: 'Templates/Missing.md' })]).plugin,
            'meeting'
        );

        expect(create).not.toHaveBeenCalled();
    });
});
