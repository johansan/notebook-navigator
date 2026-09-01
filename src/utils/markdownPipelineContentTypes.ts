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

import { getAllTags, type App, type EventRef, type FrontMatterCache, type TFile } from 'obsidian';
import type { FileContentType } from '../interfaces/IContentProvider';
import { showsCharacterCount, showsWordCount, type NotebookNavigatorSettings } from '../settings/types';
import { ItemType, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID, TAGGED_TAG_ID, UNTAGGED_TAG_ID } from '../types';
import { hasEffectiveCustomListGroupingForSelection } from './listGrouping';
import {
    getManualSortGroupHeaderWordCountConsumerSnapshot,
    refreshManualSortGroupHeaderWordCountConsumer,
    removeManualSortGroupHeaderWordCountConsumer,
    removeManualSortGroupHeaderWordCountConsumersInFolder,
    renameManualSortGroupHeaderWordCountConsumer,
    renameManualSortGroupHeaderWordCountConsumersInFolder,
    rescanManualSortGroupHeaderWordCountConsumers
} from './manualSort';
import { getParentFolderPath } from './pathUtils';
import { buildPropertyKeyNodeId, buildPropertyValueNodeId } from './propertyTree';
import { extractFrontmatterPropertyValues, hasWordCountTargetPropertyConsumer, normalizePropertyTreeValuePath } from './propertyUtils';
import { casefold } from './recordUtils';
import { normalizeTagPathValue } from './tagPrefixMatcher';
import { extractFileTagsFromRawTags } from './tagUtils';
import { getActivePropertyKeySet } from './vaultProfiles';

interface AppearanceTextCountConsumers {
    words: boolean;
    characters: boolean;
}

let appearanceTextCountConsumerCache = new WeakMap<object, AppearanceTextCountConsumers>();
const activeGroupHeaderWordCountConsumerCache = new WeakMap<
    App,
    { settings: NotebookNavigatorSettings; sourceVersion: number; paths: readonly string[] }
>();
const markdownWordCountConsumerChangeStores = new WeakMap<App, { version: number; listeners: Set<() => void> }>();

export type MarkdownTextCountDependency =
    { reason: 'appearance'; selectionType: ItemType; key: string } | { reason: 'group-header'; path: string };

/** Result of applying a metadata-backed word-count consumer update. */
export interface MarkdownWordCountConsumerUpdate {
    /** True when this update introduced the first consumer; false when counting was already active or remains inactive. */
    becameActive: boolean;
    /** True when the active custom group-header paths changed; false when the dependency list stayed the same. */
    dependenciesChanged: boolean;
}

function getMarkdownWordCountConsumerChangeStore(app: App): { version: number; listeners: Set<() => void> } {
    let store = markdownWordCountConsumerChangeStores.get(app);
    if (!store) {
        store = { version: 0, listeners: new Set() };
        markdownWordCountConsumerChangeStores.set(app, store);
    }
    return store;
}

/** Returns the current metadata-backed consumer revision for React external-store subscriptions. */
export function getMarkdownWordCountConsumerVersion(app: App): number {
    return getMarkdownWordCountConsumerChangeStore(app).version;
}

/** Subscribes to active custom group-header dependency changes. */
export function subscribeMarkdownWordCountConsumerChanges(app: App, listener: () => void): () => void {
    const store = getMarkdownWordCountConsumerChangeStore(app);
    store.listeners.add(listener);
    return () => store.listeners.delete(listener);
}

/**
 * Subscribes to the next complete metadata resolution and removes the listener before invoking the callback.
 * Obsidian emits `resolved` again after modified files, so leaving this bootstrap listener active would rescan
 * every markdown file after normal edits even though the per-file metadata handler maintains the cache.
 */
export function subscribeInitialMarkdownWordCountConsumerResolution(app: App, listener: () => void): () => void {
    let eventRef: EventRef | null = null;
    const unsubscribe = () => {
        if (eventRef === null) {
            return;
        }
        app.metadataCache.offref(eventRef);
        eventRef = null;
    };

    eventRef = app.metadataCache.on('resolved', () => {
        unsubscribe();
        listener();
    });
    return unsubscribe;
}

function publishMarkdownWordCountConsumerChange(app: App): void {
    const store = getMarkdownWordCountConsumerChangeStore(app);
    store.version += 1;
    Array.from(store.listeners).forEach(listener => listener());
}

export function hasMarkdownPreviewConsumer(settings: NotebookNavigatorSettings): boolean {
    return settings.showFilePreview;
}

export function hasMarkdownFeatureImageConsumer(settings: NotebookNavigatorSettings): boolean {
    return settings.showFeatureImage;
}

function getFolderSelectionPaths(filePath: string, includeDescendantNotes: boolean): string[] {
    const paths: string[] = [];
    let folderPath = getParentFolderPath(filePath);
    while (true) {
        paths.push(folderPath);
        if (!includeDescendantNotes || folderPath === '/') {
            return paths;
        }
        folderPath = getParentFolderPath(folderPath);
    }
}

function getTagSelectionPaths(metadata: FrontMatterCache | null, includeDescendantNotes: boolean): string[] {
    const paths = new Set<string>();
    const tags = extractFileTagsFromRawTags(metadata ? getAllTags(metadata) : null);
    if (tags.length === 0) {
        return [UNTAGGED_TAG_ID];
    }

    tags.forEach(tag => {
        let tagPath = normalizeTagPathValue(tag);
        while (tagPath) {
            paths.add(tagPath);
            if (!includeDescendantNotes) {
                break;
            }
            const separatorIndex = tagPath.lastIndexOf('/');
            tagPath = separatorIndex === -1 ? '' : tagPath.slice(0, separatorIndex);
        }
    });
    if (includeDescendantNotes) {
        paths.add(TAGGED_TAG_ID);
    }
    return Array.from(paths);
}

function getPropertySelectionPaths(frontmatter: FrontMatterCache, settings: NotebookNavigatorSettings): string[] {
    const activePropertyKeys = getActivePropertyKeySet(settings);
    const paths = new Set<string>();
    let hasIndexedProperty = false;

    Object.entries(frontmatter).forEach(([key, value]) => {
        const normalizedKey = casefold(key);
        if (!activePropertyKeys.has(normalizedKey)) {
            return;
        }

        const values = extractFrontmatterPropertyValues(value);
        if (values.length === 0) {
            return;
        }
        hasIndexedProperty = true;

        const normalizedValues = values.map(entry => normalizePropertyTreeValuePath(entry.value));
        if (settings.includeDescendantNotes || normalizedValues.some(entry => entry.length === 0)) {
            paths.add(buildPropertyKeyNodeId(normalizedKey));
        }
        normalizedValues.forEach(entry => {
            if (entry) {
                paths.add(buildPropertyValueNodeId(normalizedKey, entry));
            }
        });
    });

    if (settings.includeDescendantNotes && hasIndexedProperty) {
        paths.add(PROPERTIES_ROOT_VIRTUAL_FOLDER_ID);
    }
    return Array.from(paths);
}

function hasActiveCustomGroupingForHeader(app: App, settings: NotebookNavigatorSettings, file: TFile): boolean {
    if (
        getFolderSelectionPaths(file.path, settings.includeDescendantNotes).some(folderPath =>
            hasEffectiveCustomListGroupingForSelection(settings, ItemType.FOLDER, folderPath)
        )
    ) {
        return true;
    }

    const metadata = app.metadataCache.getFileCache(file);
    if (
        // Hiding the Tags section does not clear the active tag selection, so its list can still render headers.
        getTagSelectionPaths(metadata, settings.includeDescendantNotes).some(tagPath =>
            hasEffectiveCustomListGroupingForSelection(settings, ItemType.TAG, tagPath)
        )
    ) {
        return true;
    }

    const frontmatter = metadata?.frontmatter;
    if (!settings.showProperties || !frontmatter) {
        return false;
    }
    return getPropertySelectionPaths(frontmatter, settings).some(propertyPath =>
        hasEffectiveCustomListGroupingForSelection(settings, ItemType.PROPERTY, propertyPath)
    );
}

function getActiveManualSortGroupHeaderWordCountConsumerPaths(
    app: App,
    settings: NotebookNavigatorSettings,
    options?: { scanIfMissing?: boolean }
): readonly string[] {
    const source = getManualSortGroupHeaderWordCountConsumerSnapshot(app, settings, options);
    const cached = activeGroupHeaderWordCountConsumerCache.get(app);
    const sourceIsCurrent = cached?.sourceVersion === source.version;
    if (sourceIsCurrent && (cached.settings === settings || options?.scanIfMissing === false)) {
        return cached.paths;
    }
    // Cache-only callers never resolve files or metadata. Settings publication and storage events
    // prepare the derived snapshot before React reads it.
    if (options?.scanIfMissing === false) {
        return [];
    }

    const paths = source.paths.filter(path => {
        const file = app.vault.getFileByPath(path);
        return file ? hasActiveCustomGroupingForHeader(app, settings, file) : false;
    });
    activeGroupHeaderWordCountConsumerCache.set(app, { settings, sourceVersion: source.version, paths });
    return paths;
}

/**
 * Checks folder, tag, and property appearance overrides for text count consumers.
 * A selection can request either count while the global count type is 'none', so extraction
 * must include every count type used by an appearance.
 */
function hasAppearanceTextCountConsumer(settings: NotebookNavigatorSettings, type: keyof AppearanceTextCountConsumers): boolean {
    // Settings snapshots keep unchanged appearance maps immutable and referentially stable, so each
    // map is scanned only when its contents change and both consumer checks share the result.
    const records = [settings.folderAppearances, settings.tagAppearances, settings.propertyAppearances];
    return records.some(record => {
        let consumers = appearanceTextCountConsumerCache.get(record);
        if (!consumers) {
            const detectedConsumers: AppearanceTextCountConsumers = { words: false, characters: false };
            Object.values(record).forEach(appearance => {
                if (appearance.textCount) {
                    detectedConsumers.words ||= showsWordCount(appearance.textCount);
                    detectedConsumers.characters ||= showsCharacterCount(appearance.textCount);
                }
            });
            consumers = detectedConsumers;
            appearanceTextCountConsumerCache.set(record, consumers);
        }
        return consumers[type];
    });
}

function hasSettingsBackedMarkdownWordCountConsumer(settings: NotebookNavigatorSettings): boolean {
    return hasWordCountTargetPropertyConsumer(settings) || hasAppearanceTextCountConsumer(settings, 'words');
}

/**
 * The tooltip word count setting is deliberately not a consumer. Tooltips show a word count
 * only for notes whose resolved appearance already displays one, so enabling the tooltip
 * setting alone never keeps word count extraction running.
 */
export function hasMarkdownWordCountConsumer(settings: NotebookNavigatorSettings, app?: App): boolean {
    return (
        hasSettingsBackedMarkdownWordCountConsumer(settings) ||
        (app !== undefined && getActiveManualSortGroupHeaderWordCountConsumerPaths(app, settings).length > 0)
    );
}

/**
 * Cache-only consumer check for render paths. Global and appearance consumers are resolved immediately,
 * while group-header consumers remain inactive until the storage lifecycle has scanned vault metadata.
 */
export function hasCachedMarkdownWordCountConsumer(settings: NotebookNavigatorSettings, app: App): boolean {
    return (
        hasSettingsBackedMarkdownWordCountConsumer(settings) ||
        getActiveManualSortGroupHeaderWordCountConsumerPaths(app, settings, { scanIfMissing: false }).length > 0
    );
}

function invalidateMarkdownWordCountConsumerSettings(app: App): void {
    appearanceTextCountConsumerCache = new WeakMap<object, AppearanceTextCountConsumers>();
    activeGroupHeaderWordCountConsumerCache.delete(app);
}

/** Rebuilds settings-derived consumer results before mutable plugin settings are published to listeners. */
export function refreshMarkdownWordCountConsumerSettings(app: App, settings: NotebookNavigatorSettings): void {
    invalidateMarkdownWordCountConsumerSettings(app);
    // The prepared result is shared with cache-only render checks even though SettingsProvider
    // publishes a snapshot object with a different identity from the mutable plugin settings.
    hasMarkdownWordCountConsumer(settings, app);
}

function areMarkdownWordCountConsumerPathsEqual(left: readonly string[], right: readonly string[]): boolean {
    return left.length === right.length && left.every((path, index) => path === right[index]);
}

function finalizeMarkdownWordCountConsumerUpdate(
    app: App,
    settings: NotebookNavigatorSettings,
    beforePaths: readonly string[],
    afterPaths: readonly string[]
): MarkdownWordCountConsumerUpdate {
    const settingsBackedConsumer = hasSettingsBackedMarkdownWordCountConsumer(settings);
    const dependenciesChanged = !areMarkdownWordCountConsumerPathsEqual(beforePaths, afterPaths);
    if (dependenciesChanged) {
        publishMarkdownWordCountConsumerChange(app);
    }
    return {
        becameActive: !settingsBackedConsumer && beforePaths.length === 0 && afterPaths.length > 0,
        dependenciesChanged
    };
}

function applyMarkdownWordCountConsumerUpdate(
    app: App,
    settings: NotebookNavigatorSettings,
    updateSource: () => void
): MarkdownWordCountConsumerUpdate {
    // Metadata cache events arrive after Obsidian has published the new metadata. Preserve the last
    // prepared derived paths here; resolving them again would erase the pre-event state needed to
    // detect a context activation or deactivation.
    const beforePaths = getActiveManualSortGroupHeaderWordCountConsumerPaths(app, settings, { scanIfMissing: false });
    updateSource();
    const afterPaths = getActiveManualSortGroupHeaderWordCountConsumerPaths(app, settings);
    return finalizeMarkdownWordCountConsumerUpdate(app, settings, beforePaths, afterPaths);
}

function applyPreparedMarkdownWordCountConsumerUpdate(
    app: App,
    settings: NotebookNavigatorSettings,
    updateSource: () => boolean
): MarkdownWordCountConsumerUpdate {
    const beforePaths = getActiveManualSortGroupHeaderWordCountConsumerPaths(app, settings, { scanIfMissing: false });
    if (!updateSource()) {
        return { becameActive: false, dependenciesChanged: false };
    }
    // Prefix updates preserve an existing source cache, so resolving its invalidated ordering and
    // active list contexts cannot fall back to a vault-wide metadata scan.
    const afterPaths = getActiveManualSortGroupHeaderWordCountConsumerPaths(app, settings);
    return finalizeMarkdownWordCountConsumerUpdate(app, settings, beforePaths, afterPaths);
}

/**
 * Rebuilds metadata-backed group-header consumers.
 * Callers use the transition to populate counts that were intentionally absent while every consumer was disabled.
 *
 * @returns Whether word counting became active and whether the active header paths changed.
 */
export function rescanMarkdownWordCountConsumers(app: App, settings: NotebookNavigatorSettings): MarkdownWordCountConsumerUpdate {
    const beforePaths = getActiveManualSortGroupHeaderWordCountConsumerPaths(app, settings, { scanIfMissing: false });
    rescanManualSortGroupHeaderWordCountConsumers(app, settings);
    const afterPaths = getActiveManualSortGroupHeaderWordCountConsumerPaths(app, settings);
    return finalizeMarkdownWordCountConsumerUpdate(app, settings, beforePaths, afterPaths);
}

/** Refreshes one note after Obsidian publishes its frontmatter metadata. */
export function refreshMarkdownWordCountConsumerForFile(
    app: App,
    file: TFile,
    settings: NotebookNavigatorSettings
): MarkdownWordCountConsumerUpdate {
    return applyMarkdownWordCountConsumerUpdate(app, settings, () => {
        refreshManualSortGroupHeaderWordCountConsumer(app, file, settings);
    });
}

/** Removes one deleted or non-markdown note path from metadata-backed consumers. */
export function removeMarkdownWordCountConsumerForFile(
    app: App,
    path: string,
    settings: NotebookNavigatorSettings
): MarkdownWordCountConsumerUpdate {
    return applyMarkdownWordCountConsumerUpdate(app, settings, () => {
        removeManualSortGroupHeaderWordCountConsumer(app, path, settings);
    });
}

/** Rewrites one cached note path after a markdown rename. */
export function renameMarkdownWordCountConsumerForFile(
    app: App,
    oldPath: string,
    newPath: string,
    settings: NotebookNavigatorSettings
): MarkdownWordCountConsumerUpdate {
    return applyMarkdownWordCountConsumerUpdate(app, settings, () => {
        renameManualSortGroupHeaderWordCountConsumer(app, oldPath, newPath, settings);
    });
}

/** Rewrites cached note paths below a renamed folder without rescanning vault metadata. */
export function renameMarkdownWordCountConsumersInFolder(
    app: App,
    oldFolderPath: string,
    newFolderPath: string,
    settings: NotebookNavigatorSettings
): MarkdownWordCountConsumerUpdate {
    return applyPreparedMarkdownWordCountConsumerUpdate(app, settings, () =>
        renameManualSortGroupHeaderWordCountConsumersInFolder(app, oldFolderPath, newFolderPath, settings)
    );
}

/** Removes cached note paths below a deleted folder without rescanning vault metadata. */
export function removeMarkdownWordCountConsumersInFolder(
    app: App,
    folderPath: string,
    settings: NotebookNavigatorSettings
): MarkdownWordCountConsumerUpdate {
    return applyPreparedMarkdownWordCountConsumerUpdate(app, settings, () =>
        removeManualSortGroupHeaderWordCountConsumersInFolder(app, folderPath, settings)
    );
}

/**
 * Lists the non-global settings and custom headers that keep word- or character-count extraction
 * active beyond what the global count type already shows. Appearance entries are included when
 * they request a count kind the global display omits. Custom headers always consume word counts,
 * so they are included only while the global display omits words, and only when the header
 * requests counts and belongs to a folder, tag, or property list that resolves to custom
 * grouping. An empty result means the global count type fully explains the active extraction.
 */
export function getMarkdownTextCountDependencies(app: App, settings: NotebookNavigatorSettings): readonly MarkdownTextCountDependency[] {
    const includeWords = !showsWordCount(settings.textCountDisplay);
    const includeCharacters = !showsCharacterCount(settings.textCountDisplay);
    const dependencies: MarkdownTextCountDependency[] = [];
    if (!includeWords && !includeCharacters) {
        return dependencies;
    }
    const appearanceRecords = [
        { selectionType: ItemType.FOLDER, appearances: settings.folderAppearances },
        { selectionType: ItemType.TAG, appearances: settings.tagAppearances },
        { selectionType: ItemType.PROPERTY, appearances: settings.propertyAppearances }
    ];

    appearanceRecords.forEach(({ selectionType, appearances }) => {
        Object.entries(appearances).forEach(([key, appearance]) => {
            if (appearance.textCount === undefined) {
                return;
            }
            const usesWords = includeWords && showsWordCount(appearance.textCount);
            const usesCharacters = includeCharacters && showsCharacterCount(appearance.textCount);
            if (usesWords || usesCharacters) {
                dependencies.push({ reason: 'appearance', selectionType, key });
            }
        });
    });

    if (includeWords) {
        getActiveManualSortGroupHeaderWordCountConsumerPaths(app, settings).forEach(path => {
            dependencies.push({ reason: 'group-header', path });
        });
    }

    return dependencies;
}

export function hasMarkdownCharacterCountConsumer(settings: NotebookNavigatorSettings): boolean {
    return showsCharacterCount(settings.textCountDisplay) || hasAppearanceTextCountConsumer(settings, 'characters');
}

/** Returns whether a settings update changes which text counts the markdown pipeline must extract. */
export function haveMarkdownCountConsumersChanged(
    oldSettings: NotebookNavigatorSettings,
    newSettings: NotebookNavigatorSettings,
    app?: App
): boolean {
    return (
        hasMarkdownWordCountConsumer(oldSettings, app) !== hasMarkdownWordCountConsumer(newSettings, app) ||
        hasMarkdownCharacterCountConsumer(oldSettings) !== hasMarkdownCharacterCountConsumer(newSettings)
    );
}

export function hasMarkdownTaskConsumer(_settings: NotebookNavigatorSettings): boolean {
    return true;
}

export function getMarkdownPipelineContentTypes(settings: NotebookNavigatorSettings, app?: App): FileContentType[] {
    const types: FileContentType[] = [];

    if (hasMarkdownPreviewConsumer(settings)) {
        types.push('preview');
    }
    if (hasMarkdownFeatureImageConsumer(settings)) {
        types.push('featureImage');
    }
    if (hasMarkdownWordCountConsumer(settings, app)) {
        types.push('wordCount');
    }
    if (hasMarkdownCharacterCountConsumer(settings)) {
        types.push('characterCount');
    }
    if (hasMarkdownTaskConsumer(settings)) {
        types.push('tasks');
    }
    types.push('properties');

    return types;
}

export function hasMarkdownPipelineContent(settings: NotebookNavigatorSettings, app?: App): boolean {
    return getMarkdownPipelineContentTypes(settings, app).length > 0;
}
