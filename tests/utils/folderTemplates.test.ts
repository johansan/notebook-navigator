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

import { App, TFile, TFolder } from 'obsidian';
import { describe, expect, it, vi } from 'vitest';
import { TemplateFileModal } from '../../src/modals/TemplateFileModal';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { createCalendarMarkdownFile, type CalendarNoteLocation } from '../../src/utils/calendarNotes';
import {
    createFileWithOptions,
    getFolderTemplatePath,
    renameTemplateReferences,
    type TemplateSettings
} from '../../src/utils/fileCreationUtils';
import type { FolderTemplateMapping } from '../../src/settings/types';
import type { MomentInstance } from '../../src/utils/moment';
import { hasPendingTemplateCursor } from '../../src/utils/templateCursor';
import { createTestTFile } from './createTestTFile';

interface TestVaultMethods {
    registerFile(file: TFile): void;
    registerFolder(folder: TFolder): void;
    create: (path: string, content: string) => Promise<TFile>;
}

function getTestVault(app: App): App['vault'] & TestVaultMethods {
    return app.vault as App['vault'] & TestVaultMethods;
}

type TestFolder = TFolder & { name: string; parent: TFolder | null; children: TFile[] };

function createFolder(path: string, parent: TFolder | null): TestFolder {
    const folder = new TFolder(path) as TestFolder;
    folder.name = path === '/' ? '' : (path.split('/').pop() ?? '');
    folder.parent = parent;
    folder.children = [];
    return folder;
}

function createSettings(
    folderTemplates: Record<string, FolderTemplateMapping>,
    overrides: Partial<TemplateSettings> = {}
): TemplateSettings {
    return { templateEngine: 'builtin', dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm', folderTemplates, ...overrides };
}

describe('folder template resolution', () => {
    const root = '/';
    const personal = 'Personal';
    const daily = 'Personal/DailyNotes';

    it('uses the closest folder with a template, falling back to parents and the root', () => {
        const folderTemplates = {
            '/': { template: 'Templates/Root.md', includeSubfolders: true },
            'Personal/DailyNotes': { template: 'Templates/Daily.md', includeSubfolders: true }
        };
        expect(getFolderTemplatePath(folderTemplates, daily)).toBe('Templates/Daily.md');
        expect(getFolderTemplatePath(folderTemplates, personal)).toBe('Templates/Root.md');
        expect(getFolderTemplatePath(folderTemplates, root)).toBe('Templates/Root.md');
    });

    it('skips ancestor mappings limited to their own folder and keeps searching upwards', () => {
        const folderTemplates = {
            '/': { template: 'Templates/Root.md', includeSubfolders: true },
            Personal: { template: 'Templates/Personal.md', includeSubfolders: false }
        };
        expect(getFolderTemplatePath(folderTemplates, personal)).toBe('Templates/Personal.md');
        expect(getFolderTemplatePath(folderTemplates, daily)).toBe('Templates/Root.md');
        expect(getFolderTemplatePath({ '/': { template: 'Templates/Root.md', includeSubfolders: false } }, daily)).toBeNull();
    });

    it('returns null when no folder in the ancestry has a template', () => {
        expect(getFolderTemplatePath({ Work: { template: 'Templates/Work.md', includeSubfolders: true } }, daily)).toBeNull();
        expect(getFolderTemplatePath({}, root)).toBeNull();
    });
});

describe('template references after renames', () => {
    it('keeps the picker populated when an ancestor of its folder is renamed without any template mappings', () => {
        const app = new App();
        const template = createTestTFile('Archive/Templates/Meeting.md');
        app.vault.getFiles = vi.fn(() => [template]);
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.calendarTemplateFolder = 'Notes/Templates';

        expect(renameTemplateReferences(settings, 'Notes', 'Archive')).toBe(true);
        expect(settings.calendarTemplateFolder).toBe('Archive/Templates');
        const picker = new TemplateFileModal(app, settings.calendarTemplateFolder, () => {});
        expect(picker.getItems()).toEqual([template]);
    });

    it.each(['', '/'])('keeps the template folder setting %j unchanged during unrelated renames', calendarTemplateFolder => {
        const settings = structuredClone(DEFAULT_SETTINGS);
        settings.calendarTemplateFolder = calendarTemplateFolder;

        expect(renameTemplateReferences(settings, 'Notes', 'Archive')).toBe(false);
        expect(settings.calendarTemplateFolder).toBe(calendarTemplateFolder);
    });

    it('updates template files and command folders that were renamed or moved', () => {
        const settings = {
            calendarTemplateFolder: 'Templates',
            folderTemplates: {
                '/': { template: 'Templates/Root.md', includeSubfolders: true },
                Work: { template: 'Other/Work.md', includeSubfolders: true }
            },
            templateCommands: [
                {
                    id: 'meeting',
                    name: 'Meeting',
                    template: 'Templates/Meeting.md',
                    fileNameFormat: '',
                    location: 'folder' as const,
                    folder: 'Templates/Archive',
                    icon: 'lucide-file-plus',
                    placement: 'none' as const
                }
            ],
            folderNoteTemplate: 'Templates/Folder.md',
            calendarCustomFileTemplate: null,
            calendarCustomWeekTemplate: 'Templates/Week.md',
            calendarCustomMonthTemplate: null,
            calendarCustomQuarterTemplate: null,
            calendarCustomYearTemplate: null
        };

        expect(renameTemplateReferences(settings, 'Templates', 'Vorlagen')).toBe(true);
        expect(settings.calendarTemplateFolder).toBe('Vorlagen');
        expect(settings.folderTemplates['/'].template).toBe('Vorlagen/Root.md');
        expect(settings.folderTemplates.Work.template).toBe('Other/Work.md');
        expect(settings.templateCommands[0].template).toBe('Vorlagen/Meeting.md');
        expect(settings.templateCommands[0].folder).toBe('Vorlagen/Archive');
        expect(settings.folderNoteTemplate).toBe('Vorlagen/Folder.md');
        expect(settings.calendarCustomWeekTemplate).toBe('Vorlagen/Week.md');

        expect(renameTemplateReferences(settings, 'Vorlagen/Root.md', 'Vorlagen/Base.md')).toBe(true);
        expect(settings.folderTemplates['/'].template).toBe('Vorlagen/Base.md');
        expect(settings.calendarTemplateFolder).toBe('Vorlagen');
        expect(renameTemplateReferences(settings, 'Unrelated', 'Elsewhere')).toBe(false);
    });
});

describe('folder templates in note creation', () => {
    it('renders the folder template for a new note without scheduling the cursor', async () => {
        const app = new App();
        const vault = getTestVault(app);
        const root = createFolder('/', null);
        const projects = createFolder('Projects', root);
        // An existing lowercase `untitled.md` must bump the name on case-insensitive file systems.
        projects.children = [createTestTFile('Projects/untitled.md')];
        const templateFile = createTestTFile('Templates/Root.md');
        const createdFile = createTestTFile('Projects/Untitled 1.md');
        const create = vi.fn(async () => createdFile);
        const openFile = vi.fn(async () => undefined);

        vault.registerFile(templateFile);
        vault.registerFolder(projects);
        vault.create = create;
        app.vault.cachedRead = vi.fn(async () => '# {{title}}\n{{cursor}}');
        app.workspace = { getLeaf: vi.fn(() => ({ openFile })) } as unknown as App['workspace'];

        const file = await createFileWithOptions(projects, app, {
            extension: 'md',
            content: '',
            triggerRename: false,
            templateSettings: createSettings({ '/': { template: templateFile.path, includeSubfolders: true } })
        });

        expect(file).toBe(createdFile);
        expect(create).toHaveBeenCalledWith('Projects/Untitled 1.md', '# Untitled 1\n');
        expect(hasPendingTemplateCursor(createdFile.path)).toBe(false);
    });

    it('prefers a configured calendar template over the folder template even when its file is missing', async () => {
        const app = new App();
        const vault = getTestVault(app);
        const root = createFolder('/', null);
        const templateFile = createTestTFile('Templates/Root.md');
        const createdFile = createTestTFile('2026-06-06.md');
        const createNewMarkdownFile = vi.fn(async () => createdFile);
        const create = vi.fn(async () => createdFile);

        vault.registerFile(templateFile);
        app.fileManager.createNewMarkdownFile = createNewMarkdownFile;
        vault.create = create;
        app.vault.cachedRead = vi.fn(async () => '# {{title}}');
        app.vault.getRoot = () => root;

        const target: CalendarNoteLocation = {
            folderPath: '/',
            fileName: '2026-06-06.md',
            filePath: '2026-06-06.md',
            formattedFilePattern: '2026-06-06',
            filePattern: 'YYYY-MM-DD',
            date: { clone: () => ({ startOf: () => ({}) }) } as unknown as MomentInstance
        };
        const settings = createSettings({ '/': { template: templateFile.path, includeSubfolders: true } });

        const withMissingExplicit = await createCalendarMarkdownFile(app, 'day', target, 'Templates/Missing.md', settings);
        expect(withMissingExplicit).toBe(createdFile);
        expect(create).not.toHaveBeenCalled();

        const withFolderTemplate = await createCalendarMarkdownFile(app, 'day', target, null, settings);
        expect(withFolderTemplate).toBe(createdFile);
        expect(create).toHaveBeenCalledWith('2026-06-06.md', '# 2026-06-06');
    });
});
