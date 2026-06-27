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

import { TFile, TFolder, type App, type TAbstractFile } from 'obsidian';
import { strings } from '../i18n';
import type { ManualSortNewNotePlacement, NotebookNavigatorSettings } from '../settings/types';
import { getErrorMessage } from './errorUtils';
import { deserializeIconFromFrontmatterCompat, normalizeCanonicalIconId, serializeIconForFrontmatter } from './iconizeFormat';
import { casefold, findMatchingRecordKey } from './recordUtils';
import { isRecord } from './typeGuards';
import { formatTextCount } from './wordCountUtils';

export const MANUAL_SORT_RANK_STEP = 1000;

export interface ManualSortFileLike {
    path: string;
    extension: string;
}

export interface ManualSortOrderAssignment {
    path: string;
    value: number;
}

export interface ManualSortWriteFailure {
    path: string;
    message: string;
}

export interface ManualSortWriteResult {
    updated: number;
    skipped: number;
    failed: number;
    failures: ManualSortWriteFailure[];
}

export interface ManualSortGroupHeaderData {
    title: string;
    showWordCount: boolean;
    targetWordCount: number | null;
    iconId: string | null;
    color: string | null;
}

export interface ManualSortGroupHeaderWriteValue {
    title: string;
    showWordCount?: boolean;
    targetWordCount?: number | string | null;
    iconId?: string | null;
    color?: string | null;
}

export interface CachedManualSortPropertyState {
    hasProperty: boolean;
    rank: number | null;
}

interface ManualSortWriteFailureMessageOptions {
    unknownError: string;
    multipleFailureMessage: (count: number, path: string, message: string) => string;
}

export interface ManualSortFilePartitions<T extends ManualSortFileLike> {
    markdown: T[];
    nonMarkdown: T[];
}

export type ManualSortMoveDirection = 'up' | 'down';

export interface ManualSortMoveResult<T extends ManualSortFileLike> {
    files: T[];
    scrollPath: string;
}

export interface ManualSortRankPlan<T extends ManualSortFileLike> {
    files: T[];
    assignments: ManualSortOrderAssignment[];
    requiresCompaction: boolean;
}

export interface ManualSortNewFilePlacementContext {
    targetType: 'folder' | 'tag' | 'property';
    targetKey: string;
    propertyKey: string;
    files: readonly TFile[];
    planningFiles?: readonly TFile[];
    planningInsertionIndex?: number;
    selectedFilePath: string | null;
    rankByPath: ReadonlyMap<string, number>;
    placement: ManualSortNewNotePlacement;
}

interface ManualSortInsertionRankPlanOptions<T extends ManualSortFileLike> {
    files: readonly T[];
    planningFiles?: readonly T[];
    planningInsertionIndex?: number;
    insertedFile: T;
    placement: ManualSortNewNotePlacement;
    selectedPath: string | null;
    rankByPath: ReadonlyMap<string, number>;
}

export function normalizeManualSortPropertyKey(value: string): string {
    return value.trim();
}

function getManualSortWriteFailureMessage(result: ManualSortWriteResult, options: ManualSortWriteFailureMessageOptions): string {
    const firstFailure = result.failures[0];
    if (!firstFailure) {
        return options.unknownError;
    }

    if (result.failed === 1) {
        return `${firstFailure.path}: ${firstFailure.message}`;
    }

    return options.multipleFailureMessage(result.failed, firstFailure.path, firstFailure.message);
}

export function getLocalizedManualSortWriteFailureMessage(result: ManualSortWriteResult): string {
    return getManualSortWriteFailureMessage(result, {
        unknownError: strings.common.unknownError,
        multipleFailureMessage: (count, path, message) =>
            strings.listPane.manualSortMultipleWriteFailure
                .replace('{count}', count.toString())
                .replace('{path}', path)
                .replace('{message}', message)
    });
}

export function isValidManualSortPropertyKey(value: string): boolean {
    const key = normalizeManualSortPropertyKey(value);
    return key.length > 0 && !key.includes(',');
}

export function getManualSortGroupHeaderPropertyKey(
    settings: Pick<NotebookNavigatorSettings, 'manualSortGroupHeaderProperty' | 'manualSortPropertyKey'>
): string | null {
    const key = typeof settings.manualSortGroupHeaderProperty === 'string' ? settings.manualSortGroupHeaderProperty.trim() : '';
    if (!key || key.includes(',')) {
        return null;
    }

    const manualSortPropertyKey = normalizeManualSortPropertyKey(settings.manualSortPropertyKey);
    if (manualSortPropertyKey && casefold(key) === casefold(manualSortPropertyKey)) {
        return null;
    }

    return key;
}

export function getManualSortBaselineSettings(settings: NotebookNavigatorSettings): NotebookNavigatorSettings {
    return {
        ...settings,
        pinnedNotes: {}
    };
}

export function partitionManualSortFiles<T extends ManualSortFileLike>(files: readonly T[]): ManualSortFilePartitions<T> {
    const markdown: T[] = [];
    const nonMarkdown: T[] = [];

    files.forEach(file => {
        if (file.extension === 'md') {
            markdown.push(file);
            return;
        }

        nonMarkdown.push(file);
    });

    return { markdown, nonMarkdown };
}

export function orderManualSortFiles<T extends ManualSortFileLike>(files: readonly T[]): T[] {
    const { markdown, nonMarkdown } = partitionManualSortFiles(files);
    return [...markdown, ...nonMarkdown];
}

export function applyManualSortMarkdownOrder<T extends ManualSortFileLike>(
    files: readonly T[],
    orderedMarkdownPaths: readonly string[]
): T[] {
    const { markdown, nonMarkdown } = partitionManualSortFiles(files);
    if (orderedMarkdownPaths.length === 0 || markdown.length === 0) {
        return [...markdown, ...nonMarkdown];
    }

    const orderIndexByPath = new Map(orderedMarkdownPaths.map((path, index) => [path, index]));
    const orderedMarkdown = [...markdown].sort((left, right) => {
        const leftIndex = orderIndexByPath.get(left.path);
        const rightIndex = orderIndexByPath.get(right.path);

        if (leftIndex !== undefined && rightIndex !== undefined) {
            return leftIndex - rightIndex;
        }
        if (leftIndex !== undefined) {
            return -1;
        }
        if (rightIndex !== undefined) {
            return 1;
        }
        return 0;
    });

    return [...orderedMarkdown, ...nonMarkdown];
}

function moveSingleManualSortMarkdownFile<T extends ManualSortFileLike>(
    markdownFiles: readonly T[],
    activeIndex: number,
    overIndex: number
): T[] {
    const reorderedMarkdown = [...markdownFiles];
    const [activeFile] = reorderedMarkdown.splice(activeIndex, 1);
    reorderedMarkdown.splice(overIndex, 0, activeFile);
    return reorderedMarkdown;
}

export function getManualSortSelectedMarkdownPaths<T extends ManualSortFileLike>(
    markdownFiles: readonly T[],
    activePath: string,
    selectedPaths: ReadonlySet<string>
): Set<string> {
    if (!selectedPaths.has(activePath)) {
        return new Set();
    }

    return new Set(markdownFiles.filter(file => selectedPaths.has(file.path)).map(file => file.path));
}

export function moveManualSortMarkdownFiles<T extends ManualSortFileLike>(
    files: readonly T[],
    activePath: string,
    overPath: string,
    selectedPaths: ReadonlySet<string>
): T[] | null {
    const { markdown, nonMarkdown } = partitionManualSortFiles(files);
    const activeIndex = markdown.findIndex(file => file.path === activePath);
    const overIndex = markdown.findIndex(file => file.path === overPath);
    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
        return null;
    }

    const selectedMarkdownPaths = getManualSortSelectedMarkdownPaths(markdown, activePath, selectedPaths);

    if (selectedMarkdownPaths.size <= 1) {
        return [...moveSingleManualSortMarkdownFile(markdown, activeIndex, overIndex), ...nonMarkdown];
    }

    if (selectedMarkdownPaths.has(overPath)) {
        return null;
    }

    const movedMarkdown = markdown.filter(file => selectedMarkdownPaths.has(file.path));
    const remainingMarkdown = markdown.filter(file => !selectedMarkdownPaths.has(file.path));
    const overRemainingIndex = remainingMarkdown.findIndex(file => file.path === overPath);
    if (overRemainingIndex === -1) {
        return null;
    }

    const insertionIndex = overIndex > activeIndex ? overRemainingIndex + 1 : overRemainingIndex;
    return [...remainingMarkdown.slice(0, insertionIndex), ...movedMarkdown, ...remainingMarkdown.slice(insertionIndex), ...nonMarkdown];
}

export function moveManualSortSelectionByDirection<T extends ManualSortFileLike>(
    files: readonly T[],
    activePath: string | null,
    selectedPaths: ReadonlySet<string>,
    direction: ManualSortMoveDirection
): ManualSortMoveResult<T> | null {
    if (!activePath) {
        return null;
    }

    const { markdown, nonMarkdown } = partitionManualSortFiles(files);
    const activeMarkdownFile = markdown.find(file => file.path === activePath);
    if (!activeMarkdownFile) {
        return null;
    }

    const movedPathSet = selectedPaths.has(activePath)
        ? new Set(markdown.filter(file => selectedPaths.has(file.path)).map(file => file.path))
        : new Set([activePath]);
    if (movedPathSet.size === 0) {
        return null;
    }

    const movedMarkdown = markdown.filter(file => movedPathSet.has(file.path));
    const remainingMarkdown = markdown.filter(file => !movedPathSet.has(file.path));
    if (movedMarkdown.length === 0 || remainingMarkdown.length === 0) {
        return null;
    }

    const firstMovedIndex = markdown.findIndex(file => movedPathSet.has(file.path));
    const currentInsertionIndex = markdown.slice(0, firstMovedIndex).filter(file => !movedPathSet.has(file.path)).length;
    const nextInsertionIndex = direction === 'up' ? currentInsertionIndex - 1 : currentInsertionIndex + 1;
    if (nextInsertionIndex < 0 || nextInsertionIndex > remainingMarkdown.length) {
        return null;
    }

    const nextMarkdown = [
        ...remainingMarkdown.slice(0, nextInsertionIndex),
        ...movedMarkdown,
        ...remainingMarkdown.slice(nextInsertionIndex)
    ];
    const scrollFile = direction === 'up' ? movedMarkdown[0] : movedMarkdown[movedMarkdown.length - 1];

    return {
        files: [...nextMarkdown, ...nonMarkdown],
        scrollPath: scrollFile.path
    };
}

export function buildManualSortOrderAssignments<T extends ManualSortFileLike>(files: readonly T[]): ManualSortOrderAssignment[] {
    return partitionManualSortFiles(files).markdown.map((file, index) => ({
        path: file.path,
        value: (index + 1) * MANUAL_SORT_RANK_STEP
    }));
}

function getFolderDescendantPrefix(folder: TFolder): string {
    return folder.path === '/' ? '' : `${folder.path}/`;
}

function findBoundaryFilePathForTreeItem(
    item: TAbstractFile,
    planningBaseFiles: readonly TFile[],
    planningBasePathSet: ReadonlySet<string>,
    direction: 'before' | 'after'
): string | null {
    if (item instanceof TFile) {
        return planningBasePathSet.has(item.path) ? item.path : null;
    }

    if (!(item instanceof TFolder)) {
        return null;
    }

    const prefix = getFolderDescendantPrefix(item);
    if (direction === 'after') {
        return planningBaseFiles.find(file => file.path.startsWith(prefix))?.path ?? null;
    }

    for (let index = planningBaseFiles.length - 1; index >= 0; index -= 1) {
        const file = planningBaseFiles[index];
        if (file.path.startsWith(prefix)) {
            return file.path;
        }
    }

    return null;
}

function getFolderPlanningBoundaryPaths(
    folder: TFolder,
    planningBaseFiles: readonly TFile[]
): { beforePath: string | null; afterPath: string | null } {
    const planningBasePathSet = new Set(planningBaseFiles.map(file => file.path));
    let beforePath: string | null = null;
    let afterPath: string | null = null;
    let currentFolder: TFolder = folder;

    while (currentFolder.parent instanceof TFolder && currentFolder.parent.path !== currentFolder.path) {
        const siblings = currentFolder.parent.children;
        const currentIndex = siblings.findIndex(child => child.path === currentFolder.path);
        if (currentIndex !== -1) {
            if (!beforePath) {
                for (let index = currentIndex - 1; index >= 0; index -= 1) {
                    beforePath = findBoundaryFilePathForTreeItem(siblings[index], planningBaseFiles, planningBasePathSet, 'before');
                    if (beforePath) {
                        break;
                    }
                }
            }

            if (!afterPath) {
                for (let index = currentIndex + 1; index < siblings.length; index += 1) {
                    afterPath = findBoundaryFilePathForTreeItem(siblings[index], planningBaseFiles, planningBasePathSet, 'after');
                    if (afterPath) {
                        break;
                    }
                }
            }
        }

        if (beforePath && afterPath) {
            break;
        }

        currentFolder = currentFolder.parent;
    }

    return { beforePath, afterPath };
}

export function getFolderPlanningInsertionIndex(
    folder: TFolder | null,
    planningBaseFiles: readonly TFile[],
    planningFiles: readonly TFile[]
): number | undefined {
    if (!folder) {
        return undefined;
    }

    const { beforePath, afterPath } = getFolderPlanningBoundaryPaths(folder, planningBaseFiles);
    const planningIndexByPath = new Map(planningFiles.map((file, index) => [file.path, index]));
    const beforeIndex = beforePath ? (planningIndexByPath.get(beforePath) ?? -1) : -1;
    const afterIndex = afterPath ? (planningIndexByPath.get(afterPath) ?? -1) : -1;

    if (beforeIndex !== -1) {
        return beforeIndex + 1;
    }
    if (afterIndex !== -1) {
        return afterIndex;
    }

    return undefined;
}

export function applyManualSortTargetOrderToPlanningScope<T extends ManualSortFileLike>(
    planningFiles: readonly T[],
    previousTargetFiles: readonly T[],
    nextTargetFiles: readonly T[]
): T[] {
    const previousTargetPathSet = new Set(previousTargetFiles.map(file => file.path));
    if (previousTargetPathSet.size === 0) {
        return [...planningFiles];
    }

    const firstTargetIndex = planningFiles.findIndex(file => previousTargetPathSet.has(file.path));
    if (firstTargetIndex === -1) {
        return [...planningFiles];
    }

    let lastTargetIndex = firstTargetIndex;
    for (let index = planningFiles.length - 1; index > firstTargetIndex; index--) {
        if (previousTargetPathSet.has(planningFiles[index].path)) {
            lastTargetIndex = index;
            break;
        }
    }

    const displacedPlanningFiles = planningFiles
        .slice(firstTargetIndex, lastTargetIndex + 1)
        .filter(file => !previousTargetPathSet.has(file.path));

    return [
        ...planningFiles.slice(0, firstTargetIndex),
        ...nextTargetFiles,
        ...displacedPlanningFiles,
        ...planningFiles.slice(lastTargetIndex + 1)
    ];
}

function insertManualSortTargetOrderIntoPlanningScope<T extends ManualSortFileLike>(
    planningFiles: readonly T[],
    insertionIndex: number,
    nextTargetFiles: readonly T[]
): T[] {
    const targetPathSet = new Set(nextTargetFiles.map(file => file.path));
    const boundedInsertionIndex = Math.max(0, Math.min(insertionIndex, planningFiles.length));
    const adjustedInsertionIndex = planningFiles.slice(0, boundedInsertionIndex).filter(file => !targetPathSet.has(file.path)).length;
    const planningFilesWithoutTarget = planningFiles.filter(file => !targetPathSet.has(file.path));

    return [
        ...planningFilesWithoutTarget.slice(0, adjustedInsertionIndex),
        ...nextTargetFiles,
        ...planningFilesWithoutTarget.slice(adjustedInsertionIndex)
    ];
}

export function parseManualSortRank(value: unknown): number | null {
    if (typeof value === 'number') {
        return Number.isSafeInteger(value) && value > 0 ? value : null;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) {
        return null;
    }

    const parsed = Number(trimmed);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function parseManualSortGroupHeaderTargetWordCount(value: unknown): number | null {
    if (typeof value === 'number') {
        return Number.isSafeInteger(value) && value > 0 ? value : null;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const normalized = value.replace(/,/g, '').trim();
    if (!/^\d+$/.test(normalized)) {
        return null;
    }

    const parsed = Number(normalized);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function isManualSortValueEqual(value: unknown, order: number): boolean {
    return parseManualSortRank(value) === order;
}

export function getManualSortPropertyValue(app: App, file: TFile, propertyKey: string): string | null {
    if (file.extension !== 'md') {
        return null;
    }

    const rank = getCachedManualSortRank(app, file, propertyKey);
    return rank === null ? null : rank.toString();
}

export function getCachedManualSortPropertyState(app: App, file: TFile, propertyKey: string): CachedManualSortPropertyState {
    const frontmatter = app.metadataCache?.getFileCache(file)?.frontmatter;
    if (!isRecord(frontmatter)) {
        return { hasProperty: false, rank: null };
    }

    const targetKey = findMatchingRecordKey(frontmatter, propertyKey);
    if (targetKey === null) {
        return { hasProperty: false, rank: null };
    }

    return {
        hasProperty: true,
        rank: parseManualSortRank(frontmatter[targetKey])
    };
}

export function hasCachedManualSortProperty(app: App, file: TFile, propertyKey: string): boolean {
    return getCachedManualSortPropertyState(app, file, propertyKey).hasProperty;
}

export function getCachedManualSortRank(app: App, file: TFile, propertyKey: string): number | null {
    return getCachedManualSortPropertyState(app, file, propertyKey).rank;
}

export function getCachedManualSortGroupHeaderValue(app: App, file: TFile, propertyKey: string): string | null {
    return getCachedManualSortGroupHeader(app, file, propertyKey)?.title ?? null;
}

function parseManualSortGroupHeaderValue(value: unknown): ManualSortGroupHeaderData | null {
    if (typeof value !== 'string') {
        if (!isRecord(value)) {
            return null;
        }

        const title = typeof value.title === 'string' ? value.title.trim() : '';
        if (!title) {
            return null;
        }

        return {
            title,
            showWordCount: value.show_word_count === true,
            targetWordCount: parseManualSortGroupHeaderTargetWordCount(value.target_word_count),
            iconId: parseManualSortGroupHeaderIcon(value.icon),
            color: parseManualSortGroupHeaderColor(value.color)
        };
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? { title: trimmed, showWordCount: false, targetWordCount: null, iconId: null, color: null } : null;
}

export function getCachedManualSortGroupHeader(app: App, file: TFile, propertyKey: string): ManualSortGroupHeaderData | null {
    if (file.extension !== 'md') {
        return null;
    }

    const frontmatter = app.metadataCache?.getFileCache(file)?.frontmatter;
    if (!isRecord(frontmatter)) {
        return null;
    }

    const targetKey = findMatchingRecordKey(frontmatter, propertyKey);
    if (!targetKey) {
        return null;
    }

    return parseManualSortGroupHeaderValue(frontmatter[targetKey]);
}

export function shouldShowManualSortGroupHeaderWordCount(header: ManualSortGroupHeaderData): boolean {
    return header.showWordCount;
}

export function getManualSortGroupHeaderTargetWordCount(
    header: ManualSortGroupHeaderData,
    targetWordCount: number | null | undefined = header.targetWordCount
): number | null {
    if (!shouldShowManualSortGroupHeaderWordCount(header)) {
        return null;
    }

    const resolvedTargetWordCount = header.targetWordCount ?? targetWordCount;
    return typeof resolvedTargetWordCount === 'number' && Number.isFinite(resolvedTargetWordCount) && resolvedTargetWordCount > 0
        ? Math.trunc(resolvedTargetWordCount)
        : null;
}

export function shouldShowManualSortGroupHeaderProgress(
    header: ManualSortGroupHeaderData
): header is ManualSortGroupHeaderData & { targetWordCount: number };
export function shouldShowManualSortGroupHeaderProgress(
    header: ManualSortGroupHeaderData,
    targetWordCount: number | null | undefined
): boolean;
export function shouldShowManualSortGroupHeaderProgress(
    header: ManualSortGroupHeaderData,
    targetWordCount: number | null | undefined = header.targetWordCount
): boolean {
    return getManualSortGroupHeaderTargetWordCount(header, targetWordCount) !== null;
}

export function normalizeManualSortGroupHeaderWordCount(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.trunc(value) : 0;
}

export function formatManualSortGroupHeaderLabel(
    header: ManualSortGroupHeaderData,
    wordCount: number,
    targetWordCount: number | null | undefined = header.targetWordCount
): string {
    if (!shouldShowManualSortGroupHeaderWordCount(header)) {
        return header.title;
    }

    const formattedWordCount = formatTextCount(wordCount);
    const resolvedTargetWordCount = getManualSortGroupHeaderTargetWordCount(header, targetWordCount);
    if (resolvedTargetWordCount !== null) {
        return `${header.title} (${formattedWordCount} / ${formatTextCount(resolvedTargetWordCount)})`;
    }

    return `${header.title} (${formattedWordCount})`;
}

function parseManualSortGroupHeaderIcon(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const normalized = deserializeIconFromFrontmatterCompat(trimmed) ?? normalizeCanonicalIconId(trimmed);
    return normalized.length > 0 ? normalized : null;
}

function parseManualSortGroupHeaderColor(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function hasCachedManualSortValue(app: App, file: TFile, propertyKey: string, order: number): boolean {
    const frontmatter = app.metadataCache?.getFileCache(file)?.frontmatter;
    if (!isRecord(frontmatter)) {
        return false;
    }

    const targetKey = findMatchingRecordKey(frontmatter, propertyKey) ?? propertyKey;
    return isManualSortValueEqual(frontmatter[targetKey], order);
}

function getRankFromMap(rankByPath: ReadonlyMap<string, number>, path: string): number | null {
    return parseManualSortRank(rankByPath.get(path));
}

function hasRankInMap<T extends ManualSortFileLike>(rankByPath: ReadonlyMap<string, number>, file: T): boolean {
    return getRankFromMap(rankByPath, file.path) !== null;
}

function buildSingleInsertionAssignment<T extends ManualSortFileLike>(
    file: T,
    lowerRank: number | null,
    upperRank: number | null
): ManualSortOrderAssignment[] | null {
    if (upperRank === null) {
        const startRank = lowerRank ?? 0;
        const value = startRank + MANUAL_SORT_RANK_STEP;
        return Number.isSafeInteger(value) ? [{ path: file.path, value }] : null;
    }

    const startRank = lowerRank ?? 0;
    const gap = upperRank - startRank;
    if (gap <= 1) {
        return null;
    }

    return [{ path: file.path, value: startRank + Math.floor(gap / 2) }];
}

function resolveBottomInsertion<T extends ManualSortFileLike>(
    markdown: readonly T[],
    rankByPath: ReadonlyMap<string, number>
): { insertionIndex: number; lowerRank: number | null } {
    let lastRankedIndex = -1;
    markdown.forEach((file, index) => {
        if (hasRankInMap(rankByPath, file)) {
            lastRankedIndex = index;
        }
    });

    if (lastRankedIndex === -1) {
        return { insertionIndex: markdown.length, lowerRank: null };
    }

    return {
        insertionIndex: lastRankedIndex + 1,
        lowerRank: getRankFromMap(rankByPath, markdown[lastRankedIndex].path)
    };
}

export function buildManualSortInsertionRankPlan<T extends ManualSortFileLike>({
    files,
    planningFiles,
    planningInsertionIndex,
    insertedFile,
    placement,
    selectedPath,
    rankByPath
}: ManualSortInsertionRankPlanOptions<T>): ManualSortRankPlan<T> | null {
    if (insertedFile.extension !== 'md' || placement === 'unsorted') {
        return null;
    }

    const currentFiles = files.filter(file => file.path !== insertedFile.path);
    const { markdown, nonMarkdown } = partitionManualSortFiles(currentFiles);
    let insertionIndex: number | null = null;
    let lowerRank: number | null = null;
    let upperRank: number | null = null;

    if (placement === 'below-selected-note') {
        const selectedRank = selectedPath ? getRankFromMap(rankByPath, selectedPath) : null;
        const selectedIndex = selectedPath ? markdown.findIndex(file => file.path === selectedPath) : -1;

        if (selectedRank !== null && selectedIndex !== -1) {
            insertionIndex = selectedIndex + 1;
            lowerRank = selectedRank;
            for (let index = selectedIndex + 1; index < markdown.length; index++) {
                upperRank = getRankFromMap(rankByPath, markdown[index].path);
                if (upperRank !== null) {
                    break;
                }
            }
        } else {
            const bottomInsertion = resolveBottomInsertion(markdown, rankByPath);
            insertionIndex = bottomInsertion.insertionIndex;
            lowerRank = bottomInsertion.lowerRank;
        }
    } else if (placement === 'top') {
        const firstRankedIndex = markdown.findIndex(file => hasRankInMap(rankByPath, file));
        insertionIndex = firstRankedIndex === -1 ? 0 : firstRankedIndex;
        upperRank = firstRankedIndex === -1 ? null : getRankFromMap(rankByPath, markdown[firstRankedIndex].path);
    } else {
        const bottomInsertion = resolveBottomInsertion(markdown, rankByPath);
        insertionIndex = bottomInsertion.insertionIndex;
        lowerRank = bottomInsertion.lowerRank;
    }

    const nextMarkdown = [...markdown.slice(0, insertionIndex), insertedFile, ...markdown.slice(insertionIndex)];
    const nextTargetFiles = [...nextMarkdown, ...nonMarkdown];
    if (planningFiles && planningFiles !== files && currentFiles.length > 0) {
        return buildManualSortRankPlan(
            applyManualSortTargetOrderToPlanningScope(planningFiles, currentFiles, nextTargetFiles),
            new Set([insertedFile.path]),
            rankByPath
        );
    }
    if (planningFiles && planningFiles !== files && currentFiles.length === 0 && planningInsertionIndex !== undefined) {
        return buildManualSortRankPlan(
            insertManualSortTargetOrderIntoPlanningScope(planningFiles, planningInsertionIndex, nextTargetFiles),
            new Set([insertedFile.path]),
            rankByPath
        );
    }

    const singleAssignment = buildSingleInsertionAssignment(insertedFile, lowerRank, upperRank);
    if (singleAssignment) {
        return { files: [insertedFile], assignments: singleAssignment, requiresCompaction: false };
    }

    return buildManualSortRankPlan(nextTargetFiles, new Set([insertedFile.path]), rankByPath);
}

function getPreviousRankedIndex<T extends ManualSortFileLike>(
    files: readonly T[],
    startIndex: number,
    rankByPath: ReadonlyMap<string, number>
): number {
    for (let index = startIndex - 1; index >= 0; index--) {
        if (getRankFromMap(rankByPath, files[index].path) !== null) {
            return index;
        }
    }
    return -1;
}

function getNextRankedIndex<T extends ManualSortFileLike>(
    files: readonly T[],
    endIndex: number,
    rankByPath: ReadonlyMap<string, number>
): number {
    for (let index = endIndex + 1; index < files.length; index++) {
        if (getRankFromMap(rankByPath, files[index].path) !== null) {
            return index;
        }
    }
    return -1;
}

function buildGapAssignments<T extends ManualSortFileLike>(
    files: readonly T[],
    lowerRank: number | null,
    upperRank: number | null
): ManualSortOrderAssignment[] | null {
    const count = files.length;
    if (count === 0) {
        return [];
    }

    if (upperRank === null) {
        const startRank = lowerRank ?? 0;
        const lastRank = startRank + count * MANUAL_SORT_RANK_STEP;
        if (!Number.isSafeInteger(lastRank)) {
            return null;
        }

        return files.map((file, index) => ({
            path: file.path,
            value: startRank + (index + 1) * MANUAL_SORT_RANK_STEP
        }));
    }

    const startRank = lowerRank ?? 0;
    const gap = upperRank - startRank;
    if (gap <= count) {
        return null;
    }

    const step = Math.floor(gap / (count + 1));
    if (step < 1) {
        return null;
    }

    return files.map((file, index) => ({
        path: file.path,
        value: startRank + (index + 1) * step
    }));
}

function canCompactWindow<T extends ManualSortFileLike>(
    files: readonly T[],
    startIndex: number,
    endIndex: number,
    rankByPath: ReadonlyMap<string, number>
): boolean {
    const count = endIndex - startIndex + 1;
    const lowerIndex = getPreviousRankedIndex(files, startIndex, rankByPath);
    const upperIndex = getNextRankedIndex(files, endIndex, rankByPath);
    const lowerRank = lowerIndex === -1 ? 0 : getRankFromMap(rankByPath, files[lowerIndex].path);
    const upperRank = upperIndex === -1 ? null : getRankFromMap(rankByPath, files[upperIndex].path);
    const startRank = lowerRank ?? 0;
    const lastRank = startRank + count * MANUAL_SORT_RANK_STEP;

    if (!Number.isSafeInteger(lastRank)) {
        return false;
    }

    return upperRank === null || upperRank > lastRank;
}

function findCompactionWindow<T extends ManualSortFileLike>(
    files: readonly T[],
    groupStartIndex: number,
    groupEndIndex: number,
    rankByPath: ReadonlyMap<string, number>
): { startIndex: number; endIndex: number } {
    let startIndex = groupStartIndex;
    let endIndex = groupEndIndex;

    while (!canCompactWindow(files, startIndex, endIndex, rankByPath)) {
        const previousRankedIndex = getPreviousRankedIndex(files, startIndex, rankByPath);
        const nextRankedIndex = getNextRankedIndex(files, endIndex, rankByPath);

        if (previousRankedIndex === -1 && nextRankedIndex === -1) {
            return { startIndex: 0, endIndex: files.length - 1 };
        }

        if (previousRankedIndex === -1) {
            endIndex = nextRankedIndex;
            continue;
        }

        if (nextRankedIndex === -1) {
            startIndex = previousRankedIndex;
            continue;
        }

        if (startIndex - previousRankedIndex <= nextRankedIndex - endIndex) {
            startIndex = previousRankedIndex;
        } else {
            endIndex = nextRankedIndex;
        }
    }

    return { startIndex, endIndex };
}

function buildCompactionAssignments<T extends ManualSortFileLike>(
    files: readonly T[],
    startIndex: number,
    endIndex: number,
    rankByPath: ReadonlyMap<string, number>
): ManualSortOrderAssignment[] {
    const lowerIndex = getPreviousRankedIndex(files, startIndex, rankByPath);
    const lowerRank = lowerIndex === -1 ? 0 : getRankFromMap(rankByPath, files[lowerIndex].path);
    const startRank = lowerRank ?? 0;

    return files.slice(startIndex, endIndex + 1).map((file, index) => ({
        path: file.path,
        value: startRank + (index + 1) * MANUAL_SORT_RANK_STEP
    }));
}

function addAssignments(
    assignmentsByPath: Map<string, ManualSortOrderAssignment>,
    rankByPath: Map<string, number>,
    assignedPaths: Set<string>,
    assignments: readonly ManualSortOrderAssignment[]
): void {
    assignments.forEach(assignment => {
        assignmentsByPath.set(assignment.path, assignment);
        rankByPath.set(assignment.path, assignment.value);
        assignedPaths.add(assignment.path);
    });
}

export function buildManualSortRankPlan<T extends ManualSortFileLike>(
    nextFiles: readonly T[],
    movedPaths: ReadonlySet<string>,
    rankByPath: ReadonlyMap<string, number>
): ManualSortRankPlan<T> {
    const targetMarkdownFiles = partitionManualSortFiles(nextFiles).markdown;
    const targetPathSet = new Set(targetMarkdownFiles.map(file => file.path));
    const movedPathSet = new Set(Array.from(movedPaths).filter(path => targetPathSet.has(path)));
    const plannedRankByPath = new Map<string, number>();
    const originalRankByPath = new Map<string, number>();
    rankByPath.forEach((rank, path) => {
        const parsedRank = parseManualSortRank(rank);
        if (parsedRank !== null && targetPathSet.has(path)) {
            originalRankByPath.set(path, parsedRank);
            if (!movedPathSet.has(path)) {
                plannedRankByPath.set(path, parsedRank);
            }
        }
    });

    if (movedPathSet.size === 0) {
        return { files: [...nextFiles], assignments: [], requiresCompaction: false };
    }

    const requiredPaths = new Set<string>(movedPathSet);
    let rankedPrefixEndIndex = -1;
    targetMarkdownFiles.forEach((file, index) => {
        if (movedPathSet.has(file.path) || getRankFromMap(plannedRankByPath, file.path) !== null) {
            rankedPrefixEndIndex = index;
        }
    });

    for (let index = 0; index <= rankedPrefixEndIndex; index++) {
        const path = targetMarkdownFiles[index]?.path;
        if (path && getRankFromMap(plannedRankByPath, path) === null) {
            requiredPaths.add(path);
        }
    }

    let previousRank = 0;
    targetMarkdownFiles.forEach(file => {
        const rank = getRankFromMap(plannedRankByPath, file.path);
        if (rank === null) {
            return;
        }
        if (rank <= previousRank) {
            requiredPaths.add(file.path);
        }
        previousRank = rank;
    });

    const assignmentsByPath = new Map<string, ManualSortOrderAssignment>();
    const assignedPaths = new Set<string>();
    let requiresCompaction = false;

    for (let index = 0; index < targetMarkdownFiles.length; index++) {
        const path = targetMarkdownFiles[index].path;
        if (!requiredPaths.has(path) || assignedPaths.has(path)) {
            continue;
        }

        const groupStartIndex = index;
        let groupEndIndex = index;
        while (
            groupEndIndex + 1 < targetMarkdownFiles.length &&
            requiredPaths.has(targetMarkdownFiles[groupEndIndex + 1].path) &&
            !assignedPaths.has(targetMarkdownFiles[groupEndIndex + 1].path)
        ) {
            groupEndIndex += 1;
        }

        const lowerIndex = getPreviousRankedIndex(targetMarkdownFiles, groupStartIndex, plannedRankByPath);
        const upperIndex = getNextRankedIndex(targetMarkdownFiles, groupEndIndex, plannedRankByPath);
        const lowerRank = lowerIndex === -1 ? null : getRankFromMap(plannedRankByPath, targetMarkdownFiles[lowerIndex].path);
        const upperRank = upperIndex === -1 ? null : getRankFromMap(plannedRankByPath, targetMarkdownFiles[upperIndex].path);
        const groupAssignments = buildGapAssignments(targetMarkdownFiles.slice(groupStartIndex, groupEndIndex + 1), lowerRank, upperRank);

        if (groupAssignments) {
            addAssignments(assignmentsByPath, plannedRankByPath, assignedPaths, groupAssignments);
            index = groupEndIndex;
            continue;
        }

        requiresCompaction = true;
        const compactionWindow = findCompactionWindow(targetMarkdownFiles, groupStartIndex, groupEndIndex, plannedRankByPath);
        const compactionAssignments = buildCompactionAssignments(
            targetMarkdownFiles,
            compactionWindow.startIndex,
            compactionWindow.endIndex,
            plannedRankByPath
        );
        addAssignments(assignmentsByPath, plannedRankByPath, assignedPaths, compactionAssignments);
        index = compactionWindow.endIndex;
    }

    return {
        files: [...nextFiles],
        assignments: Array.from(assignmentsByPath.values()).filter(
            assignment => originalRankByPath.get(assignment.path) !== assignment.value
        ),
        requiresCompaction
    };
}

export function areManualSortAssignmentsCached(
    app: App,
    files: readonly TFile[],
    propertyKey: string,
    assignments: readonly ManualSortOrderAssignment[]
): boolean {
    const fileByPath = new Map(files.map(file => [file.path, file]));
    return assignments.every(assignment => {
        const file = fileByPath.get(assignment.path);
        return Boolean(file && file.extension === 'md' && hasCachedManualSortValue(app, file, propertyKey, assignment.value));
    });
}

export async function writeManualSortAssignments(
    app: App,
    files: readonly TFile[],
    propertyKey: string,
    assignments: readonly ManualSortOrderAssignment[]
): Promise<ManualSortWriteResult> {
    const assignmentPaths = new Set(assignments.map(assignment => assignment.path));
    const fileByPath = new Map(files.filter(file => assignmentPaths.has(file.path)).map(file => [file.path, file]));
    let updated = 0;
    let skipped = 0;
    const failures: ManualSortWriteFailure[] = [];

    for (const assignment of assignments) {
        const file = fileByPath.get(assignment.path);
        if (!file || file.extension !== 'md') {
            continue;
        }

        if (hasCachedManualSortValue(app, file, propertyKey, assignment.value)) {
            skipped += 1;
            continue;
        }

        let didChange = false;
        try {
            await app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
                const existingKey = findMatchingRecordKey(frontmatter, propertyKey);
                const targetKey = existingKey ?? propertyKey;
                if (isManualSortValueEqual(frontmatter[targetKey], assignment.value)) {
                    return;
                }

                frontmatter[targetKey] = assignment.value;
                didChange = true;
            });
        } catch (error) {
            failures.push({
                path: file.path,
                message: getErrorMessage(error)
            });
            continue;
        }

        if (didChange) {
            updated += 1;
        } else {
            skipped += 1;
        }
    }

    return { updated, skipped, failed: failures.length, failures };
}

export async function writeManualSortOrder(app: App, files: readonly TFile[], propertyKey: string): Promise<ManualSortWriteResult> {
    return writeManualSortAssignments(app, files, propertyKey, buildManualSortOrderAssignments(files));
}

export async function removeManualSortProperty(app: App, files: readonly TFile[], propertyKey: string): Promise<ManualSortWriteResult> {
    const normalizedPropertyKey = normalizeManualSortPropertyKey(propertyKey);
    const targetKey = casefold(normalizedPropertyKey);
    if (!targetKey) {
        return { updated: 0, skipped: 0, failed: 0, failures: [] };
    }

    let updated = 0;
    let skipped = 0;
    const failures: ManualSortWriteFailure[] = [];

    for (const file of files) {
        if (file.extension !== 'md') {
            continue;
        }

        if (!hasCachedManualSortProperty(app, file, normalizedPropertyKey)) {
            skipped += 1;
            continue;
        }

        let didChange = false;
        try {
            await app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
                Object.keys(frontmatter).forEach(key => {
                    if (casefold(key) !== targetKey) {
                        return;
                    }
                    delete frontmatter[key];
                    didChange = true;
                });
            });
        } catch (error) {
            failures.push({
                path: file.path,
                message: getErrorMessage(error)
            });
            continue;
        }

        if (didChange) {
            updated += 1;
        } else {
            skipped += 1;
        }
    }

    return { updated, skipped, failed: failures.length, failures };
}

function normalizeManualSortGroupHeaderWriteValue(value: string | ManualSortGroupHeaderWriteValue): ManualSortGroupHeaderData | null {
    if (typeof value === 'string') {
        const title = value.trim();
        return title ? { title, showWordCount: false, targetWordCount: null, iconId: null, color: null } : null;
    }

    const title = value.title.trim();
    if (!title) {
        return null;
    }

    return {
        title,
        showWordCount: value.showWordCount === true,
        targetWordCount: parseManualSortGroupHeaderTargetWordCount(value.targetWordCount),
        iconId: parseManualSortGroupHeaderIcon(value.iconId),
        color: parseManualSortGroupHeaderColor(value.color)
    };
}

function serializeManualSortGroupHeaderValue(header: ManualSortGroupHeaderData): string | Record<string, unknown> {
    const serializedIcon = header.iconId ? serializeIconForFrontmatter(header.iconId) : null;
    if (!header.showWordCount && header.targetWordCount === null && !serializedIcon && header.color === null) {
        return header.title;
    }

    const serialized: Record<string, unknown> = {
        title: header.title,
        show_word_count: header.showWordCount
    };
    if (header.targetWordCount !== null) {
        serialized.target_word_count = header.targetWordCount;
    }
    if (serializedIcon) {
        serialized.icon = serializedIcon;
    }
    if (header.color !== null) {
        serialized.color = header.color;
    }
    return serialized;
}

export async function writeManualSortGroupHeader(
    app: App,
    file: TFile,
    propertyKey: string,
    value: string | ManualSortGroupHeaderWriteValue
): Promise<void> {
    if (file.extension !== 'md') {
        return;
    }

    const nextValue = normalizeManualSortGroupHeaderWriteValue(value);
    await app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
        const existingKey = findMatchingRecordKey(frontmatter, propertyKey);
        const targetKey = existingKey ?? propertyKey;

        if (!nextValue) {
            if (existingKey) {
                delete frontmatter[existingKey];
            }
            return;
        }

        frontmatter[targetKey] = serializeManualSortGroupHeaderValue(nextValue);
    });
}
