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

import { normalizePath, type TFile } from 'obsidian';
import type { NotebookNavigatorSettings } from '../../settings/types';
import { escapeMomentLiteralPath } from '../../utils/calendarCustomNotePatterns';
import { isPathInExcludedFolder } from '../../utils/fileFilters';
import {
    buildCustomCalendarFilePathForPattern,
    buildCustomCalendarMomentPattern,
    getCalendarNoteConfig,
    resolveCalendarCustomNotePathDate
} from '../../utils/calendarNotes';
import type { MomentApi, MomentInstance } from '../../utils/moment';
import type { CalendarNoteTarget, CustomCalendarNoteConfig, CustomCalendarNoteKind } from './types';

export interface CalendarNotePathResolverContext {
    config: CustomCalendarNoteConfig;
    momentPattern: string;
}

export interface ResolvedCalendarNotePath {
    folderPath: string;
    fileName: string;
    filePath: string;
}

export interface CalendarNoteRootFolderSettings {
    calendarCustomRootFolder: string;
}

interface ResolveCalendarNoteTargetOptions {
    existingFile: TFile | null;
    targetPath: string | null;
    hiddenFolders: string[];
    showHiddenItems: boolean;
    isExistingFileVisible: (file: TFile) => boolean;
}

interface ResolveCalendarNotePathOptions {
    kind: CustomCalendarNoteKind;
    date: MomentInstance;
    resolverContext: CalendarNotePathResolverContext;
    calendarLocale: string;
    weekLocale: string;
    customCalendarRootFolderSettings: CalendarNoteRootFolderSettings;
    momentApi: MomentApi | null;
}

interface ParseCalendarNoteDateFromPathOptions extends Omit<ResolveCalendarNotePathOptions, 'date'> {
    filePath: string;
    parseLocale: string;
}

function stripMarkdownExtension(path: string): string {
    return path.replace(/\.md$/iu, '');
}

function normalizeVaultRelativePath(path: string): string {
    return normalizePath(path).replace(/^\/+/u, '').replace(/\/+$/u, '');
}

function stripMomentLiterals(pattern: string): string {
    let result = '';
    let inLiteral = false;

    for (const character of pattern) {
        if (character === '[') {
            inLiteral = true;
            continue;
        }

        if (character === ']') {
            inLiteral = false;
            continue;
        }

        if (!inLiteral) {
            result += character;
        }
    }

    return result;
}

function hasWeekParseTokens(pattern: string): boolean {
    const tokenSource = stripMomentLiterals(pattern);
    return /[YgG]/u.test(tokenSource) && /[wW]/u.test(tokenSource);
}

function getCalendarNotePathRelativeToRoot(filePath: string, rootFolder: string): string | null {
    const normalizedPath = normalizeVaultRelativePath(filePath);
    const normalizedRootFolder = normalizeVaultRelativePath(rootFolder);

    if (!normalizedRootFolder) {
        return normalizedPath;
    }

    if (normalizedPath === normalizedRootFolder) {
        return '';
    }

    if (!normalizedPath.startsWith(`${normalizedRootFolder}/`)) {
        return null;
    }

    return normalizedPath.slice(normalizedRootFolder.length + 1);
}

function parseWeeklyCalendarNoteDateFromPath({
    filePath,
    resolverContext,
    parseLocale,
    calendarLocale,
    weekLocale,
    customCalendarRootFolderSettings,
    momentApi
}: Omit<ParseCalendarNoteDateFromPathOptions, 'momentApi'> & { momentApi: MomentApi }): MomentInstance | null {
    const pathWithoutExtension = stripMarkdownExtension(filePath);
    const relativePath = getCalendarNotePathRelativeToRoot(pathWithoutExtension, customCalendarRootFolderSettings.calendarCustomRootFolder);
    if (!relativePath) {
        return null;
    }

    const patternSegments = resolverContext.momentPattern.split('/').filter(Boolean);
    const pathSegments = relativePath.split('/').filter(Boolean);
    if (patternSegments.length !== pathSegments.length) {
        return null;
    }

    for (let startIndex = patternSegments.length - 1; startIndex >= 0; startIndex--) {
        const suffixPattern = patternSegments.slice(startIndex).join('/');
        if (!hasWeekParseTokens(suffixPattern)) {
            continue;
        }

        const suffixPath = pathSegments.slice(startIndex).join('/');
        const parsedDate = momentApi(suffixPath, suffixPattern, parseLocale, true);
        if (!parsedDate.isValid()) {
            continue;
        }

        const resolved = resolveCalendarNotePath({
            kind: 'week',
            date: parsedDate,
            resolverContext,
            calendarLocale,
            weekLocale,
            customCalendarRootFolderSettings,
            momentApi
        });
        if (resolved?.filePath === filePath) {
            return parsedDate;
        }
    }

    return null;
}

export function createCalendarNotePathResolverContext(
    kind: CustomCalendarNoteKind,
    settings: NotebookNavigatorSettings
): CalendarNotePathResolverContext {
    const config = getCalendarNoteConfig(kind, settings);
    const momentPattern = buildCustomCalendarMomentPattern(config.calendarCustomFilePattern, config.fallbackPattern);
    return { config, momentPattern };
}

export function resolveCalendarNotePath({
    kind,
    date,
    resolverContext,
    calendarLocale,
    weekLocale,
    customCalendarRootFolderSettings,
    momentApi
}: ResolveCalendarNotePathOptions): ResolvedCalendarNotePath | null {
    const { config, momentPattern } = resolverContext;
    if (!config.isPatternValid(momentPattern, momentApi)) {
        return null;
    }

    const dateForPath = resolveCalendarCustomNotePathDate(kind, date, momentPattern, calendarLocale, weekLocale);
    return buildCustomCalendarFilePathForPattern(
        dateForPath,
        customCalendarRootFolderSettings,
        config.calendarCustomFilePattern,
        config.fallbackPattern
    );
}

/**
 * Resolves the four calendar target states without discarding an existing hidden file.
 *
 * - Existing and visible: both file fields contain the file and actions may open it.
 * - Existing and hidden: only `existingFile` contains the file and actions are blocked.
 * - Missing and visible: both file fields are null and actions may create the target.
 * - Missing and hidden: both file fields are null and actions are blocked because the destination folder is hidden.
 */
export function resolveCalendarNoteTarget({
    existingFile,
    targetPath,
    hiddenFolders,
    showHiddenItems,
    isExistingFileVisible
}: ResolveCalendarNoteTargetOptions): CalendarNoteTarget {
    const isHidden =
        !showHiddenItems &&
        ((targetPath !== null && hiddenFolders.length > 0 && isPathInExcludedFolder(targetPath, hiddenFolders)) ||
            (existingFile !== null && !isExistingFileVisible(existingFile)));

    return {
        existingFile,
        visibleFile: isHidden ? null : existingFile,
        isHidden,
        targetPath
    };
}

export function parseCalendarNoteDateFromPath({
    filePath,
    kind,
    resolverContext,
    calendarLocale,
    weekLocale,
    customCalendarRootFolderSettings,
    momentApi,
    parseLocale
}: ParseCalendarNoteDateFromPathOptions): MomentInstance | null {
    if (!momentApi || !filePath.toLowerCase().endsWith('.md')) {
        return null;
    }

    const normalizedFilePath = normalizePath(filePath);
    const { config, momentPattern } = resolverContext;
    if (!config.isPatternValid(momentPattern, momentApi)) {
        return null;
    }

    if (kind === 'week') {
        return parseWeeklyCalendarNoteDateFromPath({
            filePath: normalizedFilePath,
            kind,
            resolverContext,
            calendarLocale,
            weekLocale,
            customCalendarRootFolderSettings,
            momentApi,
            parseLocale
        });
    }

    const rootFolderPattern = escapeMomentLiteralPath(customCalendarRootFolderSettings.calendarCustomRootFolder);
    const fullPattern = rootFolderPattern ? `${rootFolderPattern}/${momentPattern}` : momentPattern;
    const parsedDate = momentApi(stripMarkdownExtension(normalizedFilePath), fullPattern, parseLocale, true);
    if (!parsedDate.isValid()) {
        return null;
    }

    const resolved = resolveCalendarNotePath({
        kind,
        date: parsedDate,
        resolverContext,
        calendarLocale,
        weekLocale,
        customCalendarRootFolderSettings,
        momentApi
    });
    if (!resolved || resolved.filePath !== normalizedFilePath) {
        return null;
    }

    return parsedDate;
}
