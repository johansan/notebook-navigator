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

import { TFile, TFolder } from 'obsidian';
import type { App } from 'obsidian';
import type { NotebookNavigatorSettings } from '../settings/types';
import { strings } from '../i18n';
import { DateUtils } from './dateUtils';
import { getEffectiveFrontmatterExclusions } from './exclusionUtils';
import { createFrontmatterPropertyExclusionMatcher, shouldExcludeFileWithMatcher, shouldExcludeFolder } from './fileFilters';
import type { FileVisibility } from './fileTypeUtils';
import { shouldDisplayFile } from './fileTypeUtils';
import { formatTextCount } from './wordCountUtils';

type FileTooltipSettings = Pick<NotebookNavigatorSettings, 'dateFormat' | 'timeFormat' | 'showTooltipPath' | 'showTooltipWordCount'>;

interface FileTooltipOptions {
    file: TFile;
    displayName: string;
    extensionSuffix: string;
    settings: FileTooltipSettings;
    getFileTimestamps: (file: TFile) => { created: number; modified: number };
    sortOption?: string | null | undefined;
    unfinishedTaskTooltipText?: string | null | undefined;
    wordCount?: number | null | undefined;
}

interface FolderTooltipOptions {
    app: App;
    folder: TFolder;
    displayName: string;
    fileVisibility: FileVisibility;
    hiddenFolders: string[];
    settings: NotebookNavigatorSettings;
    showHiddenItems: boolean;
}

function formatDateLines(createdDate: string, modifiedDate: string, sortOption?: string | null): string {
    if (sortOption?.startsWith('created-')) {
        return `${strings.tooltips.createdAt} ${createdDate}\n${strings.tooltips.lastModifiedAt} ${modifiedDate}`;
    }

    return `${strings.tooltips.lastModifiedAt} ${modifiedDate}\n${strings.tooltips.createdAt} ${createdDate}`;
}

export function buildFileTooltip({
    file,
    displayName,
    extensionSuffix,
    settings,
    getFileTimestamps,
    sortOption,
    unfinishedTaskTooltipText,
    wordCount
}: FileTooltipOptions): string {
    const dateTimeFormat = settings.timeFormat ? `${settings.dateFormat} ${settings.timeFormat}` : settings.dateFormat;
    const timestamps = getFileTimestamps(file);
    const createdDate = DateUtils.formatDate(timestamps.created, dateTimeFormat);
    const modifiedDate = DateUtils.formatDate(timestamps.modified, dateTimeFormat);
    const topLine = extensionSuffix.length > 0 ? file.name : displayName;
    const tooltipLines = [topLine];

    if (settings.showTooltipPath) {
        tooltipLines.push(file.parent?.path ?? '/');
    }

    if (unfinishedTaskTooltipText) {
        tooltipLines.push(unfinishedTaskTooltipText);
    }

    if (
        settings.showTooltipWordCount &&
        file.extension === 'md' &&
        typeof wordCount === 'number' &&
        Number.isFinite(wordCount) &&
        wordCount >= 0
    ) {
        tooltipLines.push(`${strings.tooltips.wordCount}: ${formatTextCount(wordCount)}`);
    }

    tooltipLines.push('', formatDateLines(createdDate, modifiedDate, sortOption));
    return tooltipLines.join('\n');
}

export function buildFolderTooltip({
    app,
    folder,
    displayName,
    fileVisibility,
    hiddenFolders,
    settings,
    showHiddenItems
}: FolderTooltipOptions): string {
    let fileCount = 0;
    let folderCount = 0;
    const effectiveExcludedFiles = getEffectiveFrontmatterExclusions(settings, showHiddenItems);
    const effectiveExcludedFileMatcher = createFrontmatterPropertyExclusionMatcher(effectiveExcludedFiles);

    for (const child of folder.children) {
        if (child instanceof TFile) {
            if (shouldDisplayFile(child, fileVisibility, app) && !shouldExcludeFileWithMatcher(child, effectiveExcludedFileMatcher, app)) {
                fileCount++;
            }
        } else if (child instanceof TFolder) {
            if (showHiddenItems || !shouldExcludeFolder(child.name, hiddenFolders, child.path)) {
                folderCount++;
            }
        }
    }

    const fileText = fileCount === 1 ? `${fileCount} ${strings.tooltips.file}` : `${fileCount} ${strings.tooltips.files}`;
    const folderText = folderCount === 1 ? `${folderCount} ${strings.tooltips.folder}` : `${folderCount} ${strings.tooltips.folders}`;
    const statsTooltip = `${fileText}, ${folderText}`;

    return folder.path === '/' ? statsTooltip : `${displayName}\n\n${statsTooltip}`;
}
