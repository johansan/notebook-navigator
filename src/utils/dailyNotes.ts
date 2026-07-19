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
import { getInternalPlugin } from './typeGuards';
import { isPlainObjectRecordValue, isStringRecordValue } from './recordUtils';
import { getMomentApi, type MomentInstance } from './moment';
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

type DailyNotesDeltaUnit = 'y' | 'Q' | 'M' | 'm' | 'w' | 'd' | 'h' | 's';

/** Normalizes date/time delta units used in daily note templates to moment-compatible units */
function normalizeDailyNotesDeltaUnit(value: string): DailyNotesDeltaUnit | null {
    switch (value) {
        case 'y':
        case 'Y':
            return 'y';
        case 'q':
        case 'Q':
            return 'Q';
        case 'm':
            return 'm';
        case 'M':
            return 'M';
        case 'w':
        case 'W':
            return 'w';
        case 'd':
            return 'd';
        case 'h':
        case 'H':
            return 'h';
        case 's':
        case 'S':
            return 's';
        default:
            return null;
    }
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
    const title = formatDailyNoteTitle(date, settings.format);
    return `${title}.md`;
}

export function getDailyNotePath(date: MomentInstance, settings: DailyNoteSettings): string {
    // Daily Notes uses `folder` + `format` to build a path; normalizePath handles leading/trailing slashes.
    const formatted = date.format(settings.format);
    const combined = settings.folder ? `${settings.folder}/${formatted}` : formatted;
    const normalized = normalizePath(combined);
    return normalized.endsWith('.md') ? normalized : `${normalized}.md`;
}

function formatDailyNoteTitle(date: MomentInstance, format: string): string {
    const formatted = date.format(format);
    const basename = formatted.split('/').pop() ?? formatted;
    return basename.replace(/\.md$/i, '');
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

async function readTemplateInfo(app: App, templatePath: string): Promise<{ contents: string; foldInfo: unknown }> {
    const normalized = normalizePath(templatePath);
    if (!normalized || normalized === '/') {
        return { contents: '', foldInfo: null };
    }

    try {
        // Templates are resolved the same way Obsidian does in other contexts: first matching linkpath destination.
        const templateFile = app.metadataCache.getFirstLinkpathDest(normalized, '');
        if (!templateFile) {
            return { contents: '', foldInfo: null };
        }

        const contents = await app.vault.cachedRead(templateFile);
        // Preserve fold state from the template (best-effort) so new notes look like the template.
        const foldManager = getFoldManager(app);
        const foldInfo = foldManager?.load(templateFile) ?? null;
        return { contents, foldInfo };
    } catch (error) {
        console.error(`Failed to read the daily note template "${normalized}"`, error);
        showNotice(strings.dailyNotes.templateReadFailed);
        return { contents: '', foldInfo: null };
    }
}

function renderDailyNoteTemplate(template: string, date: MomentInstance, noteTitle: string, format: string): string {
    if (!template) {
        return '';
    }

    const momentApi = getMomentApi();
    if (!momentApi) {
        return template;
    }

    const now = momentApi();
    const time = now.format('HH:mm');

    // Support a small subset of Obsidian's template tokens commonly used with Daily Notes.
    // - Basic tokens: {{date}}, {{time}}, {{title}}
    // - Relative tokens: {{yesterday}}, {{tomorrow}}
    // - Calculated tokens: {{date +1d:YYYY-MM-DD}} / {{time -2h:HH:mm}}
    return template
        .replace(/{{\s*date\s*}}/gi, noteTitle)
        .replace(/{{\s*time\s*}}/gi, time)
        .replace(/{{\s*title\s*}}/gi, noteTitle)
        .replace(
            /{{\s*(date|time)\s*(([+-]\d+)([yQmwdhs]))?\s*(:.+?)?}}/gi,
            (
                _match,
                timeOrDate: string,
                _calcGroup: string | undefined,
                deltaRaw: string | undefined,
                unitRaw: string | undefined,
                formatRaw: string | undefined
            ) => {
                const isTimeToken = timeOrDate.toLowerCase() === 'time';
                const currentDate = date.clone().set({
                    hour: now.get('hour'),
                    minute: now.get('minute'),
                    second: now.get('second')
                });

                const deltaUnit = unitRaw ? normalizeDailyNotesDeltaUnit(unitRaw) : null;
                if (deltaRaw && deltaUnit) {
                    currentDate.add(Number.parseInt(deltaRaw, 10), deltaUnit);
                }

                if (formatRaw) {
                    return currentDate.format(formatRaw.substring(1).trim());
                }

                return isTimeToken ? currentDate.format('HH:mm') : formatDailyNoteTitle(currentDate, format);
            }
        )
        .replace(/{{\s*yesterday\s*}}/gi, formatDailyNoteTitle(date.clone().subtract(1, 'day'), format))
        .replace(/{{\s*tomorrow\s*}}/gi, formatDailyNoteTitle(date.clone().add(1, 'day'), format));
}

export async function createDailyNote(app: App, date: MomentInstance, settings: DailyNoteSettings): Promise<TFile | null> {
    const path = getDailyNotePath(date, settings);
    const existing = app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
        return existing;
    }

    try {
        await ensureFolderExists(app, path);

        const { contents: templateContents, foldInfo } = await readTemplateInfo(app, settings.template);
        const noteTitle = formatDailyNoteTitle(date, settings.format);

        const createdFile = await app.vault.create(path, renderDailyNoteTemplate(templateContents, date, noteTitle, settings.format));
        if (foldInfo) {
            try {
                const foldManager = getFoldManager(app);
                foldManager?.save(createdFile, foldInfo);
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
