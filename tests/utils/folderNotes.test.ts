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
import { describe, expect, it, vi } from 'vitest';
import { TEMPLATER_PLUGIN_ID } from '../../src/constants/pluginIds';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import {
    createFolderNote,
    getFolderNote,
    isFolderNote,
    isFolderNoteTemplateCompatible,
    resolveFolderNoteNameForFolder
} from '../../src/utils/folderNotes';
import { createTestTFile } from './createTestTFile';

interface TestVaultMethods {
    registerFile(file: TFile): void;
    create(path: string, content: string): Promise<TFile>;
    read(file: TFile): Promise<string>;
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

function createRootFolder(app: App, vaultName: string): TFolder {
    Object.defineProperty(app.vault, 'getName', {
        configurable: true,
        value: () => vaultName
    });

    const root = app.vault.getRoot() as TFolder & { children: TFile[]; name: string; vault: App['vault'] };
    root.name = '/';
    root.path = '/';
    root.children = [];
    root.vault = app.vault;

    return root;
}

function registerRootFile(app: App, root: TFolder, path: string): TFile {
    const file = createTestTFile(path);
    file.parent = root;
    file.vault = app.vault;
    root.children.push(file);
    getTestVault(app).registerFile(file);

    return file;
}

describe('root folder notes', () => {
    it('resolves root folder note names from the vault name when no fixed name is configured', () => {
        const app = new App();
        const root = createRootFolder(app, 'Shared Scratch');

        expect(
            resolveFolderNoteNameForFolder(root, {
                folderNoteNamePattern: ''
            })
        ).toBe('Shared Scratch');
    });

    it('applies folder note name patterns to the vault root', () => {
        const app = new App();
        const root = createRootFolder(app, 'Shared Scratch');

        expect(
            resolveFolderNoteNameForFolder(root, {
                folderNoteNamePattern: '_{{folder}}'
            })
        ).toBe('_Shared Scratch');
    });

    it('detects a root folder note at the vault root', () => {
        const app = new App();
        const root = createRootFolder(app, 'Shared Scratch');
        const folderNote = registerRootFile(app, root, 'Shared Scratch.md');

        expect(
            getFolderNote(root, {
                enableFolderNotes: true,
                folderNoteNamePattern: ''
            })
        ).toBe(folderNote);
    });

    it('matches root folder note files using the vault name', () => {
        const app = new App();
        const root = createRootFolder(app, 'Shared Scratch');
        const folderNote = registerRootFile(app, root, 'Shared Scratch.md');

        expect(
            isFolderNote(folderNote, root, {
                enableFolderNotes: true,
                folderNoteNamePattern: ''
            })
        ).toBe(true);
    });

    it('keeps fixed folder note names for the vault root', () => {
        const app = new App();
        const root = createRootFolder(app, 'Shared Scratch');
        const folderNote = registerRootFile(app, root, 'index.md');

        expect(
            getFolderNote(root, {
                enableFolderNotes: true,
                folderNoteNamePattern: 'index'
            })
        ).toBe(folderNote);
    });

    it('creates root folder notes at the vault root', async () => {
        const app = new App();
        const root = createRootFolder(app, 'Shared Scratch');
        const openFile = vi.fn().mockResolvedValue(undefined);
        const createdFile = createTestTFile('Shared Scratch.md');
        createdFile.parent = root;
        createdFile.vault = app.vault;

        const createNewMarkdownFile = vi.fn(async () => {
            root.children.push(createdFile);
            getTestVault(app).registerFile(createdFile);
            return createdFile;
        });
        app.fileManager.createNewMarkdownFile = createNewMarkdownFile;
        app.workspace = {
            getLeaf: vi.fn(() => ({ openFile }))
        } as unknown as App['workspace'];

        const created = await createFolderNote(
            app,
            root,
            {
                folderNoteType: 'markdown',
                folderNoteNamePattern: '',
                folderNoteTemplate: DEFAULT_SETTINGS.folderNoteTemplate
            },
            null
        );

        expect(createNewMarkdownFile).toHaveBeenCalledWith(root, 'Shared Scratch');
        expect(created).toBe(createdFile);
        expect(openFile).toHaveBeenCalledWith(createdFile, { active: true });
    });

    it('opens created folder notes in the right sidebar when requested', async () => {
        const app = new App();
        const root = createRootFolder(app, 'Shared Scratch');
        const openFile = vi.fn().mockResolvedValue(undefined);
        const openInRightSidebar = vi.fn().mockResolvedValue(undefined);
        const createdFile = createTestTFile('Shared Scratch.md');
        createdFile.parent = root;
        createdFile.vault = app.vault;

        const createNewMarkdownFile = vi.fn(async () => {
            root.children.push(createdFile);
            getTestVault(app).registerFile(createdFile);
            return createdFile;
        });
        app.fileManager.createNewMarkdownFile = createNewMarkdownFile;
        app.workspace = {
            getLeaf: vi.fn(() => ({ openFile }))
        } as unknown as App['workspace'];

        const created = await createFolderNote(
            app,
            root,
            {
                folderNoteType: 'markdown',
                folderNoteNamePattern: '',
                folderNoteTemplate: DEFAULT_SETTINGS.folderNoteTemplate
            },
            null,
            {
                openContext: 'right-sidebar',
                openInRightSidebar
            }
        );

        expect(created).toBe(createdFile);
        expect(openInRightSidebar).toHaveBeenCalledWith(createdFile);
        expect(openFile).not.toHaveBeenCalled();
    });

    it('uses Templater directly when a configured folder note template is available', async () => {
        const app = new App();
        const root = createRootFolder(app, 'Shared Scratch');
        const templateFile = createTestTFile('Templates/Folder.md');
        const createdFile = createTestTFile('Shared Scratch.md');
        const openFile = vi.fn().mockResolvedValue(undefined);
        const createNewMarkdownFile = vi.fn();
        const createNoteFromTemplate = vi.fn(async () => createdFile);

        getTestVault(app).registerFile(templateFile);
        registerTemplater(app, createNoteFromTemplate);
        app.fileManager.createNewMarkdownFile = createNewMarkdownFile;
        app.workspace = {
            getLeaf: vi.fn(() => ({ openFile }))
        } as unknown as App['workspace'];

        const created = await createFolderNote(
            app,
            root,
            {
                folderNoteType: 'markdown',
                folderNoteNamePattern: '',
                folderNoteTemplate: templateFile.path
            },
            null
        );

        expect(created).toBe(createdFile);
        expect(createNoteFromTemplate).toHaveBeenCalledWith(templateFile, root, 'Shared Scratch', false);
        expect(createNewMarkdownFile).not.toHaveBeenCalled();
        expect(openFile).toHaveBeenCalledWith(createdFile, { active: true });
    });

    it('copies folder note template content when Templater is unavailable', async () => {
        const app = new App();
        const root = createRootFolder(app, 'Shared Scratch');
        const templateFile = createTestTFile('Templates/Folder.md');
        const createdFile = createTestTFile('Shared Scratch.md');
        const templateContent = '---\ncreated: <% tp.file.creation_date("YYYY-MM-DD") %>\n---\n';
        const openFile = vi.fn().mockResolvedValue(undefined);
        const createNewMarkdownFile = vi.fn(async () => createdFile);
        const read = vi.fn(async () => templateContent);
        const modify = vi.fn(async () => undefined);

        getTestVault(app).registerFile(templateFile);
        app.fileManager.createNewMarkdownFile = createNewMarkdownFile;
        app.vault.read = read;
        app.vault.modify = modify;
        app.workspace = {
            getLeaf: vi.fn(() => ({ openFile }))
        } as unknown as App['workspace'];

        const created = await createFolderNote(
            app,
            root,
            {
                folderNoteType: 'markdown',
                folderNoteNamePattern: '',
                folderNoteTemplate: templateFile.path
            },
            null
        );

        expect(created).toBe(createdFile);
        expect(createNewMarkdownFile).toHaveBeenCalledWith(root, 'Shared Scratch');
        expect(read).toHaveBeenCalledWith(templateFile);
        expect(modify).toHaveBeenCalledWith(createdFile, templateContent);
        expect(openFile).toHaveBeenCalledWith(createdFile, { active: true });
    });

    it('copies canvas folder note template content', async () => {
        const app = new App();
        const root = createRootFolder(app, 'Shared Scratch');
        const templateFile = createTestTFile('Templates/Folder.canvas');
        const templateContent = '{"nodes":[{"id":"folder-note"}],"edges":[]}';
        const createdFile = createTestTFile('Shared Scratch.canvas');
        createdFile.parent = root;
        createdFile.vault = app.vault;
        const openFile = vi.fn().mockResolvedValue(undefined);
        const create = vi.fn(async () => {
            root.children.push(createdFile);
            getTestVault(app).registerFile(createdFile);
            return createdFile;
        });
        const read = vi.fn(async () => templateContent);

        getTestVault(app).registerFile(templateFile);
        getTestVault(app).create = create;
        getTestVault(app).read = read;
        app.workspace = {
            getLeaf: vi.fn(() => ({ openFile }))
        } as unknown as App['workspace'];

        const created = await createFolderNote(
            app,
            root,
            {
                folderNoteType: 'canvas',
                folderNoteNamePattern: '',
                folderNoteTemplate: templateFile.path
            },
            null
        );

        expect(created).toBe(createdFile);
        expect(read).toHaveBeenCalledWith(templateFile);
        expect(create).toHaveBeenCalledWith('Shared Scratch.canvas', templateContent);
        expect(openFile).toHaveBeenCalledWith(createdFile, { active: true });
    });

    it('copies base folder note template content', async () => {
        const app = new App();
        const root = createRootFolder(app, 'Shared Scratch');
        const templateFile = createTestTFile('Templates/Folder.base');
        const templateContent = '{"model":{"version":1,"kind":"Table","columns":[{"name":"Status"}]},"pluginVersion":"1.0.0"}';
        const createdFile = createTestTFile('Shared Scratch.base');
        createdFile.parent = root;
        createdFile.vault = app.vault;
        const openFile = vi.fn().mockResolvedValue(undefined);
        const create = vi.fn(async () => {
            root.children.push(createdFile);
            getTestVault(app).registerFile(createdFile);
            return createdFile;
        });
        const read = vi.fn(async () => templateContent);

        getTestVault(app).registerFile(templateFile);
        getTestVault(app).create = create;
        getTestVault(app).read = read;
        app.workspace = {
            getLeaf: vi.fn(() => ({ openFile }))
        } as unknown as App['workspace'];

        const created = await createFolderNote(
            app,
            root,
            {
                folderNoteType: 'base',
                folderNoteNamePattern: '',
                folderNoteTemplate: templateFile.path
            },
            null
        );

        expect(created).toBe(createdFile);
        expect(read).toHaveBeenCalledWith(templateFile);
        expect(create).toHaveBeenCalledWith('Shared Scratch.base', templateContent);
        expect(openFile).toHaveBeenCalledWith(createdFile, { active: true });
    });

    it('uses default canvas content when the template extension does not match', async () => {
        const app = new App();
        const root = createRootFolder(app, 'Shared Scratch');
        const templateFile = createTestTFile('Templates/Folder.md');
        const createdFile = createTestTFile('Shared Scratch.canvas');
        createdFile.parent = root;
        createdFile.vault = app.vault;
        const openFile = vi.fn().mockResolvedValue(undefined);
        const create = vi.fn(async () => createdFile);
        const read = vi.fn(async () => '# Template');

        getTestVault(app).registerFile(templateFile);
        getTestVault(app).create = create;
        getTestVault(app).read = read;
        app.workspace = {
            getLeaf: vi.fn(() => ({ openFile }))
        } as unknown as App['workspace'];

        const created = await createFolderNote(
            app,
            root,
            {
                folderNoteType: 'canvas',
                folderNoteNamePattern: '',
                folderNoteTemplate: templateFile.path
            },
            null
        );

        expect(created).toBe(createdFile);
        expect(read).not.toHaveBeenCalled();
        expect(create).toHaveBeenCalledWith('Shared Scratch.canvas', '{}');
    });
});

describe('folder note template compatibility', () => {
    it('accepts matching supported template extensions', () => {
        expect(isFolderNoteTemplateCompatible('Templates/Folder.md', 'markdown')).toBe(true);
        expect(isFolderNoteTemplateCompatible('Templates/Folder.canvas', 'canvas')).toBe(true);
        expect(isFolderNoteTemplateCompatible('Templates/Folder.base', 'base')).toBe(true);
    });

    it('rejects mismatched fixed folder note template extensions', () => {
        expect(isFolderNoteTemplateCompatible('Templates/Folder.md', 'canvas')).toBe(false);
        expect(isFolderNoteTemplateCompatible('Templates/Folder.canvas', 'base')).toBe(false);
        expect(isFolderNoteTemplateCompatible('Templates/Folder.base', 'markdown')).toBe(false);
    });

    it('accepts any supported template extension when folder note type is selected during creation', () => {
        expect(isFolderNoteTemplateCompatible('Templates/Folder.md', 'ask')).toBe(true);
        expect(isFolderNoteTemplateCompatible('Templates/Folder.canvas', 'ask')).toBe(true);
        expect(isFolderNoteTemplateCompatible('Templates/Folder.base', 'ask')).toBe(true);
    });

    it('rejects unsupported template extensions', () => {
        expect(isFolderNoteTemplateCompatible('Templates/Folder.txt', 'ask')).toBe(false);
        expect(isFolderNoteTemplateCompatible('Templates/Folder.txt', 'markdown')).toBe(false);
    });
});
