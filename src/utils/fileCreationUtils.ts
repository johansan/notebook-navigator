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

import { App, TFile, TFolder, normalizePath } from 'obsidian';
import { strings } from '../i18n';
import { TemplateFileModal } from '../modals/TemplateFileModal';
import { promptForTemplateValues } from '../modals/TemplatePromptModal';
import type { FolderTemplateMapping, NotebookNavigatorSettings, TemplateEngineSetting } from '../settings/types';
import { TIMEOUTS, OBSIDIAN_COMMANDS } from '../types/obsidian-extended';
import { executeCommand } from './typeGuards';
import { getMomentApi, type MomentInstance } from './moment';
import { showNotice } from './noticeUtils';
import { normalizeCalendarCustomRootFolder } from './calendarCustomNotePatterns';
import { normalizeOptionalVaultFilePath } from './pathUtils';
import { sanitizeRecord } from './recordUtils';
import { hasPendingTemplateCursor, schedulePendingTemplateCursor } from './templateCursor';
import { collectTemplatePrompts, containsTemplaterCommands, renderNoteTemplate, type TemplateRenderResult } from './templateRenderer';
import { getTemplaterCreateNewNoteFromTemplate, getTemplaterCreateNoteFromTemplate } from './templaterIntegration';

/**
 * Options for creating a new file
 */
export interface CreateFileOptions {
    /** The file extension (without dot) */
    extension: string;
    /** Initial content for the file */
    content?: string;
    /** Whether to open the file after creation */
    openFile?: boolean;
    /** Whether to open the file in a new tab when opening */
    openInNewTab?: boolean;
    /** Whether to trigger rename mode after opening */
    triggerRename?: boolean;
    /** Hook run after creating the file and before opening it */
    afterCreate?: (file: TFile) => Promise<void>;
    /** Custom error message key */
    errorKey?: string;
    /** When set, empty markdown notes are created from the folder template of `parent`, if one applies. */
    templateSettings?: TemplateSettings;
}

export interface GenerateUniqueFilenameOptions {
    /** Paths that should be treated as already occupied */
    occupiedPaths?: ReadonlySet<string>;
    /** Whether to consult vault contents while checking candidates (default: true) */
    useVaultLookup?: boolean;
    /** Optional suffix inserted before numeric increments and extension */
    baseNameSuffix?: string;
    /** Compare candidates against `occupiedPaths` case-insensitively. The set must then contain lowercase paths. */
    ignoreCase?: boolean;
}

/** Date context for built-in template tokens. */
export interface TemplateDateContext {
    /** Date that `{{date}}` and relative tokens resolve against. Periodic notes pass the start of their period. */
    date: MomentInstance;
    /** Default format of note date tokens, or a formatter that applies the note filename's basename rules. */
    dateFormat: string | ((date: MomentInstance) => string);
    /** Week that weekday tokens resolve inside. Weekly notes pass `note-date` so the week starts at the note date. */
    weekdayBase?: 'locale-week' | 'note-date';
}

/** Settings that control template processing: the engine, folder templates, and the date and time formats used by tokens without an explicit format. */
export type TemplateSettings = Pick<NotebookNavigatorSettings, 'templateEngine' | 'dateFormat' | 'timeFormat' | 'folderTemplates'>;

/**
 * Returns true when the template folder setting names a folder, including the vault root written as `/`.
 * `normalizeCalendarCustomRootFolder` maps both the root and an empty setting to an empty string, so the raw value decides.
 */
export function isTemplateFolderConfigured(templateFolderSetting: string): boolean {
    return templateFolderSetting.trim().length > 0;
}

/**
 * Returns the template path that applies to notes created in the folder at `folderPath`, or null when none is
 * configured. The folder's own mapping always applies. Ancestor mappings apply only when they include subfolders, so
 * a mapping limited to its folder is skipped and a higher ancestor can still supply the template.
 * Works on paths so the template is known before a periodic note folder is created.
 */
export function getFolderTemplatePath(folderTemplates: Record<string, FolderTemplateMapping>, folderPath: string): string | null {
    let current = folderPath === '' ? '/' : folderPath;
    let isOwnFolder = true;
    for (;;) {
        const mapping = folderTemplates[current];
        if (mapping && mapping.template.trim() && (isOwnFolder || mapping.includeSubfolders)) {
            return mapping.template;
        }
        if (current === '/') {
            return null;
        }
        const slashIndex = current.lastIndexOf('/');
        current = slashIndex <= 0 ? '/' : current.slice(0, slashIndex);
        isOwnFolder = false;
    }
}

/** Resolves the folder template that applies to notes created in the folder at `folderPath`. */
export function getFolderTemplateFile(
    app: App,
    settings: Pick<NotebookNavigatorSettings, 'folderTemplates'>,
    folderPath: string
): TFile | null {
    return getMarkdownTemplateFile(app, getFolderTemplatePath(settings.folderTemplates, folderPath), 'folder template');
}

/**
 * Updates template file paths and command folders in settings after a file or folder rename, so folder templates,
 * calendar and folder note templates and create note commands keep pointing at the moved files.
 * Returns true when any setting changed.
 */
export function renameTemplateReferences(
    settings: Pick<
        NotebookNavigatorSettings,
        | 'folderTemplates'
        | 'templateCommands'
        | 'calendarTemplateFolder'
        | 'folderNoteTemplate'
        | 'calendarCustomFileTemplate'
        | 'calendarCustomWeekTemplate'
        | 'calendarCustomMonthTemplate'
        | 'calendarCustomQuarterTemplate'
        | 'calendarCustomYearTemplate'
    >,
    oldPath: string,
    newPath: string
): boolean {
    const renamePath = (value: string): string => {
        if (value === oldPath) {
            return newPath;
        }
        return value.startsWith(`${oldPath}/`) ? `${newPath}${value.slice(oldPath.length)}` : value;
    };
    let changed = false;
    const update = (value: string): string => {
        const next = renamePath(value);
        changed = changed || next !== value;
        return next;
    };

    Object.values(settings.folderTemplates).forEach(mapping => {
        mapping.template = update(mapping.template);
    });
    settings.templateCommands.forEach(command => {
        command.template = update(command.template);
        command.folder = update(command.folder);
    });
    // Pickers filter by this folder independently of the template file references, so both must follow a move.
    settings.calendarTemplateFolder = update(settings.calendarTemplateFolder);
    settings.folderNoteTemplate = settings.folderNoteTemplate === null ? null : update(settings.folderNoteTemplate);
    settings.calendarCustomFileTemplate = settings.calendarCustomFileTemplate === null ? null : update(settings.calendarCustomFileTemplate);
    settings.calendarCustomWeekTemplate = settings.calendarCustomWeekTemplate === null ? null : update(settings.calendarCustomWeekTemplate);
    settings.calendarCustomMonthTemplate =
        settings.calendarCustomMonthTemplate === null ? null : update(settings.calendarCustomMonthTemplate);
    settings.calendarCustomQuarterTemplate =
        settings.calendarCustomQuarterTemplate === null ? null : update(settings.calendarCustomQuarterTemplate);
    settings.calendarCustomYearTemplate = settings.calendarCustomYearTemplate === null ? null : update(settings.calendarCustomYearTemplate);
    return changed;
}

/** Content and engine selected before prompts, reused during creation so built-in rendering uses the content that was prompted. */
interface PreparedMarkdownTemplate {
    templateFile: TFile | null;
    /** Null means no template or a failed read; creation falls back to an empty note and reports a failed read then. */
    content: string | null;
    engine: ResolvedTemplateEngine;
    promptValues: Record<string, string>;
}

/** Lowercase vault paths reserved by note creations that have not finished writing. */
const pendingTemplatePaths = new WeakMap<App, Set<string>>();

type CreateMarkdownFileFromTemplateOptions = {
    app: App;
    folder: TFolder;
    baseName: string;
    settings: TemplateSettings;
    /** Date context for built-in date tokens. Omitted or null resolves `{{date}}` to the current date with the default format. */
    templateDate?: TemplateDateContext | null;
    /**
     * Whether a `{{cursor}}` token schedules cursor placement when the note opens. Defaults to true. Notes that enter
     * title editing right after creation pass false so the cursor jump does not interrupt naming the note.
     */
    placeCursor?: boolean;
    /** Choose an unused name after preparation and reserve it until creation finishes. Fixed periodic/folder note names omit this. */
    ensureUniqueName?: boolean;
    /** Let Templater open the note and apply its own cursor/title behavior; built-in notes are opened by the caller. */
    openTemplaterNote?: boolean;
    /** Label used in log messages and the Templater failure error, such as `folder note`. */
    templateErrorContext: string;
} & ({ templateFile: TFile | null; preparedTemplate?: never } | { templateFile?: never; preparedTemplate: PreparedMarkdownTemplate });

/**
 * Turns generated text into a usable note name: characters Obsidian rejects in file names are removed, whitespace is
 * collapsed, and trailing dots are dropped. Returns an empty string when nothing usable remains.
 */
export function sanitizeNoteBaseName(value: string): string {
    const withoutControlCharacters = Array.from(value)
        .filter(character => character.charCodeAt(0) >= 32)
        .join('');
    return withoutControlCharacters
        .replace(/[\\/:*?"<>|]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\.+$/, '')
        .trim();
}

/**
 * Builds a normalized path inside a folder.
 */
export function buildPathInFolder(folderPath: string, name: string): string {
    const base = folderPath === '/' || folderPath === '' ? '' : `${folderPath}/`;
    return normalizePath(`${base}${name}`);
}

/**
 * Builds a normalized file path inside a folder from name and extension.
 */
export function buildFilePathInFolder(folderPath: string, fileName: string, extension: string): string {
    if (!extension) {
        return buildPathInFolder(folderPath, fileName);
    }
    return buildPathInFolder(folderPath, `${fileName}.${extension}`);
}

/**
 * Generates a unique filename by appending a number if the file already exists
 * @param folderPath - The folder path where the file will be created
 * @param baseName - The base name of the file (without extension)
 * @param extension - The file extension (without dot)
 * @param app - The Obsidian app instance
 * @param options - Optional collision controls and naming suffix
 * @returns A unique filename
 */
export function generateUniqueFilename(
    folderPath: string,
    baseName: string,
    extension: string,
    app: App,
    options?: GenerateUniqueFilenameOptions
): string {
    const occupiedPaths = options?.occupiedPaths;
    const useVaultLookup = options?.useVaultLookup !== false;
    const baseNameSuffix = options?.baseNameSuffix ?? '';
    const ignoreCase = options?.ignoreCase === true;
    let counter = 0;

    const makePath = (name: string) => buildFilePathInFolder(folderPath, name, extension);

    // Keep incrementing until we find a unique name
    while (true) {
        const nameWithCounter = counter === 0 ? baseName : `${baseName} ${counter}`;
        const fileName = `${nameWithCounter}${baseNameSuffix}`;
        const path = makePath(fileName);
        const occupied = occupiedPaths?.has(ignoreCase ? path.toLowerCase() : path) ?? false;
        const existsInVault = useVaultLookup && Boolean(app.vault.getAbstractFileByPath(path));
        if (!occupied && !existsInVault) {
            return fileName;
        }

        counter++;
    }
}

/**
 * Creates a new file with the specified options
 * This helper eliminates code duplication across createNewFile, createCanvas, createBase, etc.
 *
 * @param parent - The parent folder to create the file in
 * @param app - The Obsidian app instance
 * @param options - File creation options
 * @returns The created file or null if creation failed
 */
export async function createFileWithOptions(parent: TFolder, app: App, options: CreateFileOptions): Promise<TFile | null> {
    const {
        extension,
        content = '',
        openFile = true,
        openInNewTab = false,
        triggerRename = true,
        afterCreate,
        errorKey = 'createFile'
    } = options;

    try {
        const baseName = strings.fileSystem.defaultNames.untitled;
        let file: TFile;

        if (extension === 'md' && content.length === 0) {
            const templateSettings = options.templateSettings ?? null;
            const folderTemplateFile = templateSettings ? getFolderTemplateFile(app, templateSettings, parent.path) : null;
            const created = templateSettings
                ? await createMarkdownFileFromTemplate({
                      app,
                      folder: parent,
                      baseName,
                      templateFile: folderTemplateFile,
                      settings: templateSettings,
                      placeCursor: false,
                      ensureUniqueName: true,
                      templateErrorContext: 'folder template'
                  })
                : await app.fileManager.createNewMarkdownFile(parent, generateUniqueFilename(parent.path, baseName, extension, app));
            if (!created) {
                return null;
            }
            file = created;
        } else {
            const fileName = generateUniqueFilename(parent.path, baseName, extension, app);
            const path = buildFilePathInFolder(parent.path, fileName, extension);
            file = await app.vault.create(path, content);
        }

        if (afterCreate) {
            await afterCreate(file);
        }

        // Open the file if requested
        if (openFile) {
            const leaf = app.workspace.getLeaf(openInNewTab);
            const openState = extension === 'md' ? { state: { mode: 'source' }, active: true } : undefined;
            await leaf.openFile(file, openState);

            // Trigger rename mode if requested
            if (triggerRename) {
                // We use setTimeout to push this command to the end of the event queue.
                // This gives Obsidian's workspace time to finish opening the file and rendering the editor,
                // making it more likely that the 'edit-file-title' command will find an active editor title to focus.
                // Note: This is a known workaround for a race condition in Obsidian and may fail on slower systems.
                window.setTimeout(() => {
                    executeCommand(app, OBSIDIAN_COMMANDS.EDIT_FILE_TITLE);
                }, TIMEOUTS.FILE_OPERATION_DELAY);
            }
        }

        return file;
    } catch (error: unknown) {
        // Type-safe error message lookup
        const errorMessages = strings.fileSystem.errors as Record<string, string>;
        // Safely extract error message handling non-Error exceptions
        const errorText = error instanceof Error ? error.message : String(error);
        const errorMessage = errorMessages[errorKey]?.replace('{error}', errorText) || `Failed to create file: ${errorText}`;
        showNotice(errorMessage, { variant: 'warning' });
        return null;
    }
}

/**
 * Resolves a markdown template setting to a vault file.
 * Returns null and logs a warning when the path is empty, invalid, missing, or not a markdown file.
 */
export function getMarkdownTemplateFile(app: App, templatePath: string | null | undefined, templateErrorContext: string): TFile | null {
    if (!templatePath) {
        return null;
    }

    const normalizedTemplatePath = normalizeOptionalVaultFilePath(templatePath);
    if (!normalizedTemplatePath) {
        console.warn(`[${templateErrorContext} template] Invalid template path`, templatePath);
        return null;
    }

    const entry = app.vault.getAbstractFileByPath(normalizedTemplatePath);
    if (!(entry instanceof TFile) || entry.extension !== 'md') {
        console.warn(`[${templateErrorContext} template] Template file not found`, normalizedTemplatePath);
        return null;
    }

    return entry;
}

export type ResolvedTemplateEngine = 'builtin' | 'templater';

/**
 * Renders template content for a note with the built-in engine and reports malformed tokens with one notice.
 * Periodic notes format `{{date}}` like their file name so links between them resolve; other notes use the display format.
 */
function renderTemplateContent(
    templateFile: TFile,
    templateContent: string,
    settings: TemplateSettings,
    note: { folder: TFolder; baseName: string; path: string },
    templateDate?: TemplateDateContext | null,
    promptValues?: Record<string, string>
): TemplateRenderResult {
    const rendered = renderNoteTemplate(templateContent, {
        momentApi: getMomentApi(),
        title: note.baseName,
        folderName: note.folder.path === '/' ? '' : note.folder.name,
        path: note.path,
        date: templateDate?.date ?? null,
        dateFormat: templateDate?.dateFormat ?? settings.dateFormat,
        todayFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
        weekdayBase: templateDate?.weekdayBase,
        promptValues
    });

    if (rendered.invalidTokens.length > 0) {
        showNotice(
            strings.templates.invalidTokens.replace('{name}', templateFile.basename).replace('{tokens}', rendered.invalidTokens.join(' ')),
            { variant: 'warning' }
        );
    }

    return rendered;
}

/**
 * Picks the engine that processes a template.
 * - `templater` requires the Templater plugin and returns null when it is missing so callers stop with a notice.
 * - `automatic` routes templates containing Templater commands to Templater when it is installed. Every other
 *   template uses the built-in engine, so tokens render even when Templater is present.
 * - `builtin` never involves Templater.
 */
function resolveTemplateEngine(app: App, setting: TemplateEngineSetting, templateContent: string): ResolvedTemplateEngine | null {
    const templaterAvailable = getTemplaterCreateNoteFromTemplate(app) !== null;
    switch (setting) {
        case 'templater':
            return templaterAvailable ? 'templater' : null;
        case 'builtin':
            return 'builtin';
        default:
            return templaterAvailable && containsTemplaterCommands(templateContent) ? 'templater' : 'builtin';
    }
}

/**
 * Reads a template, selects its engine and collects prompts without writing any files or folders.
 * File name prompts always use the built-in engine; body prompts are only collected when that engine owns the body.
 * Returns null on cancellation or after a missing-Templater notice, leaving the vault untouched. Otherwise returns
 * the prepared content and values. A missing or unreadable template prepares an empty note; read failures are logged
 * here and shown to the user only after the empty note is created.
 */
export async function prepareMarkdownTemplate({
    app,
    templateFile,
    settings,
    templateErrorContext,
    fileNameFormat = ''
}: {
    app: App;
    templateFile: TFile | null;
    settings: TemplateSettings;
    templateErrorContext: string;
    fileNameFormat?: string;
}): Promise<PreparedMarkdownTemplate | null> {
    let content: string | null = null;
    if (templateFile) {
        try {
            content = await app.vault.cachedRead(templateFile);
        } catch (error) {
            console.error(`Failed to read ${templateErrorContext} template`, templateFile.path, error);
        }
    }

    const engine = content === null ? 'builtin' : resolveTemplateEngine(app, settings.templateEngine, content);
    if (engine === null) {
        showNotice(strings.templates.templaterMissing, { variant: 'warning' });
        return null;
    }

    // Templater receives the original template, so asking for built-in body values would discard the answers.
    const labels = collectTemplatePrompts(fileNameFormat);
    if (engine === 'builtin' && content !== null) {
        collectTemplatePrompts(content).forEach(label => {
            if (!labels.includes(label)) {
                labels.push(label);
            }
        });
    }
    const promptValues = labels.length > 0 ? await promptForTemplateValues(app, labels) : sanitizeRecord<string>(undefined);
    return promptValues ? { templateFile, content, engine, promptValues } : null;
}

/**
 * Creates a markdown note from a template with the engine chosen by `settings.templateEngine`.
 *
 * @returns The created file. Returns null without writing when a prompt is cancelled or required Templater is missing.
 * A prepared template is reused without reading or prompting again. Throws when the vault write fails or Templater
 * does not return a file. With `ensureUniqueName`, the final unused name is chosen after preparation and reserved
 * until the write settles; fixed note names are left unchanged otherwise.
 */
export async function createMarkdownFileFromTemplate({
    app,
    folder,
    baseName,
    templateFile,
    preparedTemplate,
    settings,
    templateDate,
    placeCursor = true,
    ensureUniqueName = false,
    openTemplaterNote = false,
    templateErrorContext
}: CreateMarkdownFileFromTemplateOptions): Promise<TFile | null> {
    const prepared =
        preparedTemplate ??
        (await prepareMarkdownTemplate({
            app,
            templateFile: templateFile ?? null,
            settings,
            templateErrorContext
        }));
    if (!prepared) {
        return null;
    }

    let reservedPath: string | null = null;
    const pendingPaths = pendingTemplatePaths.get(app) ?? new Set<string>();
    if (ensureUniqueName) {
        // Reads and prompts can yield while another note arrives. Pending writes are reserved too because the vault
        // may not expose their files yet; otherwise overlapping creation calls can choose the same path.
        const occupiedPaths = new Set([...folder.children.map(child => child.path.toLowerCase()), ...pendingPaths]);
        baseName = generateUniqueFilename(folder.path, baseName, 'md', app, { occupiedPaths, useVaultLookup: false, ignoreCase: true });
        reservedPath = buildFilePathInFolder(folder.path, baseName, 'md').toLowerCase();
        pendingPaths.add(reservedPath);
        pendingTemplatePaths.set(app, pendingPaths);
    }

    try {
        const { templateFile: sourceFile, content, engine, promptValues } = prepared;
        if (!sourceFile || content === null) {
            const created = await app.fileManager.createNewMarkdownFile(folder, baseName);
            if (sourceFile) {
                showNotice(strings.templates.readFailed.replace('{name}', sourceFile.basename), { variant: 'warning' });
            }
            return created;
        }

        if (engine === 'templater') {
            const createFromTemplater = getTemplaterCreateNoteFromTemplate(app);
            const created = createFromTemplater ? await createFromTemplater(sourceFile, folder, baseName, openTemplaterNote) : undefined;
            if (created instanceof TFile) {
                return created;
            }
            throw new Error(`Templater did not create the ${templateErrorContext}`);
        }

        const path = buildFilePathInFolder(folder.path, baseName, 'md');
        const rendered = renderTemplateContent(sourceFile, content, settings, { folder, baseName, path }, templateDate, promptValues);

        // The content is written by the same call that creates the file, so plugins reacting to new files never see an
        // empty note. Templater's folder templates can still apply when the rendered body is empty apart from frontmatter.
        const created = await app.vault.create(path, rendered.content);
        if (rendered.cursor && placeCursor) {
            schedulePendingTemplateCursor(created.path, rendered.cursor);
        }
        return created;
    } finally {
        // Failed writes release their name too, so retrying does not skip a name that was never created.
        if (reservedPath !== null) {
            pendingPaths.delete(reservedPath);
            if (pendingPaths.size === 0) {
                pendingTemplatePaths.delete(app);
            }
        }
    }
}

/**
 * Creates a note in `folder` from a template chosen by the user and opens it.
 * With the Templater engine, Templater's own picker and creation flow run. Otherwise the user picks a file from the
 * template folder. In automatic mode a template with Templater commands is still handed to Templater, which then
 * opens the note itself so its cursor jump and title behavior apply.
 */
export async function createNoteFromTemplateInFolder(
    app: App,
    settings: TemplateSettings & Pick<NotebookNavigatorSettings, 'calendarTemplateFolder' | 'createNewNotesInNewTab'>,
    folder: TFolder
): Promise<void> {
    if (settings.templateEngine === 'templater') {
        const createWithTemplater = getTemplaterCreateNewNoteFromTemplate(app);
        if (!createWithTemplater) {
            showNotice(strings.templates.templaterMissing, { variant: 'warning' });
            return;
        }
        await createWithTemplater(folder);
        return;
    }

    if (!isTemplateFolderConfigured(settings.calendarTemplateFolder)) {
        // Without a template folder the picker would list every note in the vault. Templater's own picker covers the
        // automatic case when Templater is installed; otherwise the user is told where to set the folder.
        const createWithTemplater = settings.templateEngine === 'automatic' ? getTemplaterCreateNewNoteFromTemplate(app) : null;
        if (createWithTemplater) {
            await createWithTemplater(folder);
            return;
        }
        showNotice(strings.templates.folderNotSet, { variant: 'warning' });
        return;
    }

    new TemplateFileModal(app, normalizeCalendarCustomRootFolder(settings.calendarTemplateFolder), async templateFile => {
        try {
            const preparedTemplate = await prepareMarkdownTemplate({ app, templateFile, settings, templateErrorContext: 'note' });
            if (!preparedTemplate) {
                return;
            }

            const created = await createMarkdownFileFromTemplate({
                app,
                folder,
                baseName: strings.fileSystem.defaultNames.untitled,
                preparedTemplate,
                settings,
                ensureUniqueName: true,
                openTemplaterNote: true,
                templateErrorContext: 'note'
            });
            if (!created || preparedTemplate.engine === 'templater') {
                return;
            }

            // A template cursor takes precedence over title editing because both compete for editor focus.
            const hasCursor = hasPendingTemplateCursor(created.path);
            const leaf = app.workspace.getLeaf(settings.createNewNotesInNewTab);
            await leaf.openFile(created, { state: { mode: 'source' }, active: true });
            if (!hasCursor) {
                window.setTimeout(() => {
                    executeCommand(app, OBSIDIAN_COMMANDS.EDIT_FILE_TITLE);
                }, TIMEOUTS.FILE_OPERATION_DELAY);
            }
        } catch (error) {
            console.error('Failed to create note from template', error);
            showNotice(strings.common.unknownError, { variant: 'warning' });
        }
    }).open();
}

/**
 * Creates initial content for a database (.base) file
 */
export function createDatabaseContent(): string {
    return JSON.stringify(
        {
            model: {
                version: 1,
                kind: 'Table',
                columns: []
            },
            pluginVersion: '1.0.0'
        },
        null,
        2
    );
}
