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

import React, { useMemo } from 'react';
import type { TFile } from 'obsidian';
import { useActiveProfile, useSettingsState } from '../context/SettingsContext';
import { useFileCache } from '../context/StorageContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import type { NotebookNavigatorSettings } from '../settings/types';
import type { FileItemPillDecorationModel } from '../utils/fileItemPillDecoration';
import type { FileItemPillOrderModel } from '../utils/fileItemPillOrder';
import { buildFileTooltipDateLines, buildFileTooltipWordCountLine } from '../utils/navigationTooltipUtils';
import { createHiddenTagVisibility } from '../utils/tagPrefixMatcher';
import { useFileItemTagPills } from './fileItem/useFileItemTagPills';

interface FileTooltipContentProps {
    file: TFile;
    /** Shown as the first line unless the file carries an extension suffix, in which case the full file name is shown */
    displayName: string;
    extensionSuffix: string;
    settings: Pick<NotebookNavigatorSettings, 'dateFormat' | 'timeFormat' | 'showTooltipPath' | 'showTooltipWordCount'>;
    getFileTimestamps: (file: TFile) => { created: number; modified: number };
    sortOption?: string | null;
    unfinishedTaskTooltipText?: string | null;
    wordCount: number | null;
    /** Tag pill row placed between the folder path and the count lines */
    tagRow?: React.ReactNode;
}

/**
 * Structured hover tooltip for a file. It renders inside the tooltip portal, so the lines are
 * computed only while the tooltip is visible. Callers must create a new element whenever an
 * input changes, including mutable TFile fields, because the tooltip refreshes on content
 * identity rather than by observing the file.
 */
export function FileTooltipContent({
    file,
    displayName,
    extensionSuffix,
    settings,
    getFileTimestamps,
    sortOption,
    unfinishedTaskTooltipText,
    wordCount,
    tagRow
}: FileTooltipContentProps) {
    const topLine = extensionSuffix.length > 0 ? file.name : displayName;
    const parentPath = settings.showTooltipPath ? (file.parent?.path ?? '/') : null;
    const wordCountLine = buildFileTooltipWordCountLine({ file, settings, wordCount });
    const dateLines = buildFileTooltipDateLines({ file, settings, getFileTimestamps, sortOption });

    return (
        <>
            <div>{topLine}</div>
            {parentPath !== null ? <div className="nn-tooltip-muted">{parentPath}</div> : null}
            {tagRow}
            {unfinishedTaskTooltipText ? <div>{unfinishedTaskTooltipText}</div> : null}
            {wordCountLine !== null ? <div>{wordCountLine}</div> : null}
            <div className="nn-tooltip-dates nn-tooltip-muted">
                <div>{dateLines[0]}</div>
                <div>{dateLines[1]}</div>
            </div>
        </>
    );
}

interface FileTooltipTagRowProps {
    file: TFile;
    fileItemPillDecorationModel: FileItemPillDecorationModel;
    fileItemPillOrderModel: FileItemPillOrderModel;
}

const EMPTY_TAGS: string[] = [];

/**
 * Tag pill row for file tooltips outside the list pane (shortcuts, recent notes). Cached tags
 * are read at render time so the row reflects the cache whenever the tooltip opens or
 * refreshes. Hidden tags follow the active profile like list-pane pills; nothing is hidden
 * for the navigation selection because these rows are not scoped to it.
 */
export function FileTooltipTagRow({ file, fileItemPillDecorationModel, fileItemPillOrderModel }: FileTooltipTagRowProps) {
    const settings = useSettingsState();
    const { hiddenTags } = useActiveProfile();
    const { showHiddenItems } = useUXPreferences();
    const { getFile } = useFileCache();
    const hiddenTagVisibility = useMemo(() => createHiddenTagVisibility(hiddenTags, showHiddenItems), [hiddenTags, showHiddenItems]);
    const tags = getFile(file.path)?.tags ?? EMPTY_TAGS;
    const { tooltipTagRow } = useFileItemTagPills({
        tags,
        settings,
        hiddenTagVisibility,
        selectedTagToHide: null,
        fileItemPillDecorationModel,
        fileItemPillOrderModel
    });

    return <>{tooltipTagRow}</>;
}
