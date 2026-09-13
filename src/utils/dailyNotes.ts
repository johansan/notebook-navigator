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
import { createMarkdownFileFromTemplate, getFolderTemplateFile, prepareMarkdownTemplate, type TemplateSettings } from './fileCreationUtils';
import { getInternalPlugin } from './typeGuards';
import { isPlainObjectRecordValue, isStringRecordValue } from './recordUtils';
import type { MomentInstance } from './moment';
import { showNotice } from './noticeUtils';

const DAILY_NOTES_PLUGIN_ID = 'daily-notes';
const DEFAULT_DAILY_NOTE_FORMAT = 'YYYY-MM-DD';

export interface DailyNoteSettings {
    folder: string;
    format: string;
    template: string;
}

interface DailyNotesInternalPlugin {
    enabled?: boolean;
    instance?: {
        options?: unknown;
    };
}

interface FoldManager {
    load: (file: TFile) => unknown;
    save: (file: TFile, foldInfo: unknown) => void;
}

function isFoldManager(value: unknown): value is FoldManager {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const record = value as Record<string, unknown>;
    return typeof record.load === 'function' && typeof record.save === 'function';
}

function getFoldManager(app: App): FoldManager | null {
    const maybe = (app as unknown as { foldManager?: unknown }).foldManager;
    return isFoldManager(maybe) ? maybe : null;
}

function sanitizeDailyNoteSettings(options: unknown): DailyNoteSettings {
    const record = isPlainObjectRecordValue(options) ? options : null;

    const folderRaw = record ? record['folder'] : undefined;
    const formatRaw = record ? record['format'] : undefined;
    const templateRaw = record ? record['template'] : undefined;

    const folder = isStringRecordValue(folderRaw) ? folderRaw.trim() : '';
    const template = isStringRecordValue(templateRaw) ? templateRaw.trim() : '';

    const format = isStringRecordValue(formatRaw) && formatRaw.trim() ? formatRaw.trim() : DEFAULT_DAILY_NOTE_FORMAT;

    return { folder, format, template };
}

export function getDailyNoteSettings(app: App): DailyNoteSettings | null {
    // The Daily Notes core plugin isn't part of the public plugin API; we read its internal options defensively.
    const plugin = getInternalPlugin<DailyNotesInternalPlugin>(app, DAILY_NOTES_PLUGIN_ID);
    if (!plugin || plugin.enabled !== true) {
        return null;
    }

    const options = plugin.instance?.options;
    return sanitizeDailyNoteSettings(options);
}

export function getDailyNoteFilename(date: MomentInstance, settings: DailyNoteSettings): string {
    const path = getDailyNotePath(date, settings);
    return path.slice(path.lastIndexOf('/') + 1);
}

export function getDailyNotePath(date: MomentInstance, settings: DailyNoteSettings): string {
    // Daily Notes uses `folder` + `format` to build a path; normalizePath handles leading/trailing slashes.
    const formatted = date.format(settings.format);
    const combined = settings.folder ? `${settings.folder}/${formatted}` : formatted;
    const normalized = normalizePath(combined);
    // Creation always writes a lowercase extension. Normalize literal extensions here too, otherwise lookup can
    // search for a different path when the format ends in `[.MD]` or `[.Md]`.
    return `${normalized.replace(/\.md$/i, '')}.md`;
}

export function getDailyNoteFile(app: App, date: MomentInstance, settings: DailyNoteSettings): TFile | null {
    const path = getDailyNotePath(date, settings);
    const file = app.vault.getAbstractFileByPath(path);
    return file instanceof TFile ? file : null;
}

async function ensureFolderExists(app: App, path: string): Promise<void> {
    // Create intermediate folders for the note path (no-op if the note is in the vault root).
    const normalized = normalizePath(path);
    const parts = normalized.split('/').filter(Boolean);
    parts.pop();

    if (parts.length === 0) {
        return;
    }

    let current = '';
    for (const part of parts) {
        current = current ? `${current}/${part}` : part;
        const existing = app.vault.getAbstractFileByPath(current);
        if (!existing) {
            await app.vault.createFolder(current);
            continue;
        }
        if (!(existing instanceof TFolder)) {
            throw new Error(`Cannot create daily note folder "${current}": path exists and is not a folder.`);
        }
    }
}

/** Resolves the Daily Notes template setting to a file. The core plugin stores a link path without extension. */
function getDailyNoteTemplateFile(app: App, templatePath: string): TFile | null {
    const normalized = normalizePath(templatePath);
    if (!normalized || normalized === '/') {
        return null;
    }
    // Templates are resolved the same way Obsidian does in other contexts: first matching linkpath destination.
    return app.metadataCache.getFirstLinkpathDest(normalized, '');
}

/** Returns the folder that `ensureFolderExists` created for the note path. Throws so a missing folder never sends the note to the vault root. */
function getParentFolder(app: App, path: string): TFolder {
    const parentPath = path.split('/').slice(0, -1).join('/');
    if (!parentPath) {
        return app.vault.getRoot();
    }
    const parent = app.vault.getAbstractFileByPath(parentPath);
    if (!(parent instanceof TFolder)) {
        throw new Error(`Daily note folder "${parentPath}" is missing.`);
    }
    return parent;
}

/**
 * Creates the daily note for `date` using the Daily Notes core plugin settings. Returns the existing note when it is
 * already present. Returns null when creation failed or stopped after a notice.
 */
export async function createDailyNote(
    app: App,
    date: MomentInstance,
    settings: DailyNoteSettings,
    templateSettings: TemplateSettings
): Promise<TFile | null> {
    const path = getDailyNotePath(date, settings);
    const existing = app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
        return existing;
    }

    try {
        // The Daily Notes template wins even when its file is missing; folder templates only fill the gap when none is set.
        // The template is resolved from the note path before its folders exist, so prompts run first and a cancelled
        // prompt leaves no empty folders behind.
        const folderPath = path.split('/').slice(0, -1).join('/') || '/';
        const templateFile = settings.template
            ? getDailyNoteTemplateFile(app, settings.template)
            : getFolderTemplateFile(app, templateSettings, folderPath);
        const preparedTemplate = await prepareMarkdownTemplate({
            app,
            templateFile,
            settings: templateSettings,
            templateErrorContext: 'daily note'
        });
        if (!preparedTemplate) {
            return null;
        }

        await ensureFolderExists(app, path);
        const folder = getParentFolder(app, path);
        const createdFile = await createMarkdownFileFromTemplate({
            app,
            folder,
            baseName: path.slice(path.lastIndexOf('/') + 1, -3),
            preparedTemplate,
            settings: templateSettings,
            // Format first and then take the basename, so Moment literals and path segments follow the filename rules.
            templateDate: { date, dateFormat: value => getDailyNoteFilename(value, settings).slice(0, -3) },
            templateErrorContext: 'daily note'
        });
        if (!createdFile) {
            return null;
        }

        if (templateFile) {
            // Preserve fold state from the template (best-effort) so new notes look like the template.
            try {
                const foldManager = getFoldManager(app);
                const foldInfo = foldManager?.load(templateFile) ?? null;
                if (foldInfo) {
                    foldManager?.save(createdFile, foldInfo);
                }
            } catch {
                // ignore
            }
        }
        return createdFile;
    } catch (error) {
        console.error(`Failed to create daily note "${path}"`, error);
        showNotice(strings.dailyNotes.createFailed);
        return null;
    }
}
