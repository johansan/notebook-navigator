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

import { App, TFile } from 'obsidian';
import { normalizeListSortOverride, type ListSortOverrideValue, type NotebookNavigatorSettings } from '../settings/types';
import type { IPropertyTreeProvider } from '../interfaces/IPropertyTreeProvider';
import { strings } from '../i18n';
import { ConfirmModal } from '../modals/ConfirmModal';
import { PropertyKeyRenameModal } from '../modals/PropertyKeyRenameModal';
import { LIMITS } from '../constants/limits';
import { casefold, deleteCollapsedPinnedContextKeys, sanitizeRecord, updateCollapsedPinnedContextKeys } from '../utils/recordUtils';
import { showNotice } from '../utils/noticeUtils';
import { runAsyncAction } from '../utils/async';
import { removePropertyField, renamePropertyField } from '../utils/propertyUtils';
import { isRecord } from '../utils/typeGuards';
import { buildPropertyKeyNodeId } from '../utils/propertyTree';
import { replacePropertySortKey, SORT_OVERRIDE_RECORD_KEYS } from '../utils/sortUtils';
import { buildUsageSummaryFromPaths, renderAffectedFilesPreview, yieldToEventLoop } from './operations/OperationBatchUtils';
import { PropertyFileMutations } from './propertyOperations/PropertyFileMutations';
import type { PropertyKeyDeleteEventPayload, PropertyKeyRenameEventPayload } from './propertyOperations/types';
import { getActivePropertyFields, setActivePropertyFields } from '../utils/vaultProfiles';
import { ItemType } from '../types';

export type { PropertyKeyRenameEventPayload, PropertyKeyDeleteEventPayload } from './propertyOperations/types';

const MUTATION_BATCH_SIZE = LIMITS.operations.metadataMutationYieldBatchSize;
type RenameConflictSnapshot = Map<string, Set<string>>;
type PropertyMetadataRecord = Record<string, unknown>;
interface PropertyMetadataAccessor {
    read: (settings: NotebookNavigatorSettings) => PropertyMetadataRecord | undefined;
    write: (settings: NotebookNavigatorSettings, next: PropertyMetadataRecord) => void;
}
const PROPERTY_NODE_METADATA_ACCESSORS: readonly PropertyMetadataAccessor[] = [
    {
        read: settings => settings.propertyColors,
        write: (settings, next) => {
            settings.propertyColors = next as NotebookNavigatorSettings['propertyColors'];
        }
    },
    {
        read: settings => settings.propertyBackgroundColors,
        write: (settings, next) => {
            settings.propertyBackgroundColors = next as NotebookNavigatorSettings['propertyBackgroundColors'];
        }
    },
    {
        read: settings => settings.propertyIcons,
        write: (settings, next) => {
            settings.propertyIcons = next as NotebookNavigatorSettings['propertyIcons'];
        }
    },
    {
        read: settings => settings.propertySortOverrides,
        write: (settings, next) => {
            settings.propertySortOverrides = next as NotebookNavigatorSettings['propertySortOverrides'];
        }
    },
    {
        read: settings => settings.propertyAppearances,
        write: (settings, next) => {
            settings.propertyAppearances = next as NotebookNavigatorSettings['propertyAppearances'];
        }
    }
];
const PROPERTY_KEY_METADATA_ACCESSORS: readonly PropertyMetadataAccessor[] = [
    {
        read: settings => settings.propertyTreeSortOverrides,
        write: (settings, next) => {
            settings.propertyTreeSortOverrides = next as NotebookNavigatorSettings['propertyTreeSortOverrides'];
        }
    }
];
function updatePropertySortKeySetting(
    settings: NotebookNavigatorSettings,
    oldKeyNormalized: string,
    newKeyDisplay: string | null
): boolean {
    if (!settings.propertySortKey.trim()) {
        return false;
    }

    const nextValue = replacePropertySortKey(settings.propertySortKey, oldKeyNormalized, newKeyDisplay);
    if (nextValue === settings.propertySortKey) {
        return false;
    }

    settings.propertySortKey = nextValue;
    return true;
}

function updateManualSortPropertyKeySetting(
    settings: NotebookNavigatorSettings,
    oldKeyNormalized: string,
    newKeyDisplay: string | null
): boolean {
    const currentKey = settings.manualSortPropertyKey.trim();
    if (!currentKey || casefold(currentKey) !== oldKeyNormalized) {
        return false;
    }

    settings.manualSortPropertyKey = newKeyDisplay ?? '';
    return true;
}

function updateManualSortGroupHeaderPropertySetting(
    settings: NotebookNavigatorSettings,
    oldKeyNormalized: string,
    newKeyDisplay: string | null
): boolean {
    const currentKey = settings.manualSortGroupHeaderProperty.trim();
    if (!currentKey || casefold(currentKey) !== oldKeyNormalized) {
        return false;
    }

    settings.manualSortGroupHeaderProperty = newKeyDisplay ?? '';
    return true;
}

function updateSortOverridePropertyKeys(
    record: Record<string, ListSortOverrideValue> | undefined,
    oldKeyNormalized: string,
    newKeyDisplay: string | null
): boolean {
    if (!record) {
        return false;
    }

    let changed = false;
    for (const key of Object.keys(record)) {
        const normalizedOverride = normalizeListSortOverride((record as Record<string, unknown>)[key]);
        if (!normalizedOverride || typeof normalizedOverride === 'string') {
            continue;
        }

        if (casefold(normalizedOverride.propertyKey ?? '') !== oldKeyNormalized) {
            continue;
        }

        if (newKeyDisplay) {
            record[key] = { ...normalizedOverride, propertyKey: newKeyDisplay };
        } else {
            delete record[key];
        }
        changed = true;
    }

    return changed;
}

function updateSortOverridePropertyKeySettings(
    settings: NotebookNavigatorSettings,
    oldKeyNormalized: string,
    newKeyDisplay: string | null
): boolean {
    let changed = false;
    SORT_OVERRIDE_RECORD_KEYS.forEach(recordKey => {
        changed = updateSortOverridePropertyKeys(settings[recordKey], oldKeyNormalized, newKeyDisplay) || changed;
    });
    return changed;
}

/**
 * Facade for property key rename/delete operations across the vault.
 *
 * Contract:
 * - Mutates YAML frontmatter in markdown files via `processFrontMatter`.
 * - Updates active-profile property keys, sort property keys, and related overrides after successful file mutations.
 * - Emits rename/delete events only when settings updates are attempted.
 * - Relies on existing Obsidian modify/metadata listeners for reindexing.
 */
export class PropertyOperations {
    private readonly propertyKeyRenameListeners = new Set<(payload: PropertyKeyRenameEventPayload) => void>();
    private readonly propertyKeyDeleteListeners = new Set<(payload: PropertyKeyDeleteEventPayload) => void>();

    private readonly fileMutations: PropertyFileMutations;

    constructor(
        private readonly app: App,
        private readonly getSettings: () => NotebookNavigatorSettings,
        private readonly saveSettingsAndUpdate: () => Promise<void>,
        private readonly getPropertyTreeService: () => IPropertyTreeProvider | null
    ) {
        this.fileMutations = new PropertyFileMutations(this.app);
    }

    addPropertyKeyRenameListener(listener: (payload: PropertyKeyRenameEventPayload) => void): () => void {
        this.propertyKeyRenameListeners.add(listener);
        return () => {
            this.propertyKeyRenameListeners.delete(listener);
        };
    }

    addPropertyKeyDeleteListener(listener: (payload: PropertyKeyDeleteEventPayload) => void): () => void {
        this.propertyKeyDeleteListeners.add(listener);
        return () => {
            this.propertyKeyDeleteListeners.delete(listener);
        };
    }

    async promptRenamePropertyKey(normalizedKey: string): Promise<void> {
        const propertyTree = this.getPropertyTreeService();
        if (!propertyTree) {
            showNotice(strings.fileSystem.notifications.propertyOperationsNotAvailable, { variant: 'warning' });
            return;
        }

        const keyNode = propertyTree.getKeyNode(normalizedKey);
        if (!keyNode) {
            showNotice(strings.fileSystem.notifications.propertyOperationsNotAvailable, { variant: 'warning' });
            return;
        }

        const affectedPaths = this.collectPropertyKeyPathsFromVault(normalizedKey);
        const usage = buildUsageSummaryFromPaths(this.app, affectedPaths);
        const conflictSnapshotPromise = Promise.resolve().then(() => this.collectRenameConflictSnapshot(normalizedKey, affectedPaths));

        const modal = new PropertyKeyRenameModal(this.app, {
            propertyKey: keyNode.name,
            affectedCount: usage.total,
            sampleFiles: usage.sample,
            initialValue: keyNode.name,
            onSubmit: async newKey => {
                const trimmed = newKey.trim();
                if (!trimmed || trimmed.includes('\n') || trimmed.includes('\r')) {
                    showNotice(strings.modals.propertyOperation.invalidKeyName, { variant: 'warning' });
                    return false;
                }

                const newKeyNormalized = casefold(trimmed);
                if (!newKeyNormalized) {
                    showNotice(strings.modals.propertyOperation.invalidKeyName, { variant: 'warning' });
                    return false;
                }

                const conflictSnapshot = await conflictSnapshotPromise;
                const conflictPaths = this.collectRenameConflictPathsFromSnapshot(normalizedKey, newKeyNormalized, conflictSnapshot);
                if (conflictPaths.size > 0) {
                    const shouldContinue = await this.confirmRenameConflicts({
                        oldKeyDisplay: keyNode.name,
                        newKeyDisplay: trimmed,
                        conflictPaths
                    });
                    if (!shouldContinue) {
                        return false;
                    }
                }

                return await this.runPropertyKeyRename({
                    oldKeyNormalized: normalizedKey,
                    oldKeyDisplay: keyNode.name,
                    newKeyDisplay: trimmed,
                    affectedPaths
                });
            }
        });
        modal.open();
    }

    async promptDeletePropertyKey(normalizedKey: string): Promise<void> {
        const propertyTree = this.getPropertyTreeService();
        if (!propertyTree) {
            showNotice(strings.fileSystem.notifications.propertyOperationsNotAvailable, { variant: 'warning' });
            return;
        }

        const keyNode = propertyTree.getKeyNode(normalizedKey);
        if (!keyNode) {
            showNotice(strings.fileSystem.notifications.propertyOperationsNotAvailable, { variant: 'warning' });
            return;
        }

        const affectedPaths = this.collectPropertyKeyPathsFromVault(normalizedKey);
        const usage = buildUsageSummaryFromPaths(this.app, affectedPaths);
        const countLabel = usage.total === 1 ? strings.modals.tagOperation.file : strings.modals.tagOperation.files;

        const modal = new ConfirmModal(
            this.app,
            strings.modals.propertyOperation.deleteTitle.replace('{property}', keyNode.name),
            strings.modals.propertyOperation.deleteWarning
                .replace('{property}', keyNode.name)
                .replace('{count}', usage.total.toString())
                .replace('{files}', countLabel),
            () => {
                runAsyncAction(() => this.runPropertyKeyDelete({ keyNodeName: keyNode.name, normalizedKey, affectedPaths }));
            },
            strings.modals.propertyOperation.confirmDelete,
            {
                buildContent: container => renderAffectedFilesPreview(container, usage)
            }
        );
        modal.open();
    }

    protected async runPropertyKeyRename(params: {
        oldKeyNormalized: string;
        oldKeyDisplay: string;
        newKeyDisplay: string;
        affectedPaths: Set<string>;
    }): Promise<boolean> {
        const oldKeyNormalized = casefold(params.oldKeyNormalized);
        const oldKeyDisplay = params.oldKeyDisplay.trim();
        const newKeyDisplay = params.newKeyDisplay.trim();
        const newKeyNormalized = casefold(newKeyDisplay);

        if (!oldKeyNormalized || !newKeyNormalized || !newKeyDisplay) {
            showNotice(strings.modals.propertyOperation.invalidKeyName, { variant: 'warning' });
            return false;
        }

        if (oldKeyDisplay === newKeyDisplay) {
            showNotice(
                strings.modals.propertyOperation.renameNoChanges.replace('{oldKey}', oldKeyDisplay).replace('{newKey}', newKeyDisplay),
                { variant: 'warning' }
            );
            return false;
        }

        let renamed = 0;
        let failed = 0;
        let processedMarkdown = 0;
        let processed = 0;

        for (const path of params.affectedPaths) {
            const abstract = this.app.vault.getAbstractFileByPath(path);
            if (!(abstract instanceof TFile)) {
                processed += 1;
                continue;
            }

            try {
                if (!this.fileMutations.isMarkdownFile(abstract)) {
                    processed += 1;
                    continue;
                }
                processedMarkdown += 1;

                const didChange = await this.fileMutations.renamePropertyKeyInFile(abstract, { oldKey: oldKeyDisplay, newKeyDisplay });
                if (didChange) {
                    renamed += 1;
                }
            } catch (error: unknown) {
                failed += 1;
                console.error(`[Notebook Navigator] Failed to rename property key ${oldKeyDisplay} → ${newKeyDisplay} in ${path}`, error);
            }

            processed += 1;
            if (processed % MUTATION_BATCH_SIZE === 0) {
                await yieldToEventLoop();
            }
        }

        const shouldFinalize = failed === 0 && renamed > 0;
        if (!shouldFinalize) {
            showNotice(
                `${strings.modals.propertyOperation.confirmRename}: ${oldKeyDisplay} → ${newKeyDisplay} (${renamed}/${processedMarkdown})`,
                { variant: 'warning' }
            );
            return true;
        }

        let settingsUpdateFailed = false;
        try {
            await this.updateSettingsAfterRename(oldKeyNormalized, newKeyDisplay);
        } catch (error: unknown) {
            settingsUpdateFailed = true;
            console.error('[Notebook Navigator] Failed to update settings after property key rename', error);
        }

        this.notifyPropertyKeyRenamed({ oldKey: oldKeyNormalized, newKey: newKeyNormalized });

        if (settingsUpdateFailed) {
            showNotice(
                strings.modals.propertyOperation.renameSettingsUpdateFailed
                    .replace('{oldKey}', oldKeyDisplay)
                    .replace('{newKey}', newKeyDisplay),
                { variant: 'warning' }
            );
        } else {
            showNotice(
                `${strings.modals.propertyOperation.confirmRename}: ${oldKeyDisplay} → ${newKeyDisplay} (${renamed}/${processedMarkdown})`,
                {
                    variant: 'success'
                }
            );
        }

        return true;
    }

    protected async runPropertyKeyDelete(params: {
        keyNodeName: string;
        normalizedKey: string;
        affectedPaths: Set<string>;
    }): Promise<boolean> {
        const normalizedKey = casefold(params.normalizedKey);
        if (!normalizedKey) {
            return false;
        }

        let removed = 0;
        let failed = 0;
        let processedMarkdown = 0;
        let processed = 0;

        for (const path of params.affectedPaths) {
            const abstract = this.app.vault.getAbstractFileByPath(path);
            if (!(abstract instanceof TFile)) {
                processed += 1;
                continue;
            }

            try {
                if (!this.fileMutations.isMarkdownFile(abstract)) {
                    processed += 1;
                    continue;
                }
                processedMarkdown += 1;

                const didChange = await this.fileMutations.deletePropertyKeyFromFile(abstract, normalizedKey);
                if (didChange) {
                    removed += 1;
                }
            } catch (error: unknown) {
                failed += 1;
                console.error(`[Notebook Navigator] Failed to delete property key ${params.keyNodeName} in ${path}`, error);
            }

            processed += 1;
            if (processed % MUTATION_BATCH_SIZE === 0) {
                await yieldToEventLoop();
            }
        }

        const shouldFinalize = failed === 0 && removed > 0;

        if (!shouldFinalize) {
            showNotice(`${strings.modals.propertyOperation.confirmDelete}: ${params.keyNodeName} (${removed}/${processedMarkdown})`, {
                variant: 'warning'
            });
            return true;
        }

        let settingsUpdateFailed = false;
        try {
            await this.updateSettingsAfterDelete(normalizedKey);
        } catch (error: unknown) {
            settingsUpdateFailed = true;
            console.error('[Notebook Navigator] Failed to update settings after property key delete', error);
        }

        this.notifyPropertyKeyDeleted({ key: normalizedKey });

        if (settingsUpdateFailed) {
            showNotice(strings.modals.propertyOperation.deleteSettingsUpdateFailed.replace('{property}', params.keyNodeName), {
                variant: 'warning'
            });
        } else if (removed === 1) {
            showNotice(strings.modals.propertyOperation.deleteSingleSuccess.replace('{property}', params.keyNodeName), {
                variant: 'success'
            });
        } else {
            showNotice(
                strings.modals.propertyOperation.deleteMultipleSuccess
                    .replace('{property}', params.keyNodeName)
                    .replace('{count}', removed.toString()),
                { variant: 'success' }
            );
        }

        return true;
    }

    private renamePropertyNodeMetadataRecord<T>(
        record: Record<string, T> | undefined,
        oldKeyNodeId: string,
        newKeyNodeId: string
    ): { changed: boolean; next: Record<string, T> | undefined } {
        if (!record || oldKeyNodeId === newKeyNodeId) {
            return { changed: false, next: record };
        }

        const oldValuePrefix = `${oldKeyNodeId}=`;
        const keys = Object.keys(record);
        let next: Record<string, T> | undefined;
        let changed = false;

        keys.forEach(key => {
            if (key !== oldKeyNodeId && !key.startsWith(oldValuePrefix)) {
                return;
            }

            if (!next) {
                next = sanitizeRecord(record);
            }

            if (key === oldKeyNodeId) {
                next[newKeyNodeId] = next[key];
                delete next[key];
                changed = true;
                return;
            }

            if (key.startsWith(oldValuePrefix)) {
                const mappedKey = `${newKeyNodeId}${key.slice(oldKeyNodeId.length)}`;
                next[mappedKey] = next[key];
                delete next[key];
                changed = true;
            }
        });

        return changed && next ? { changed: true, next } : { changed: false, next: record };
    }

    private renamePropertyKeyMetadataRecord<T>(
        record: Record<string, T> | undefined,
        oldKeyNodeId: string,
        newKeyNodeId: string
    ): { changed: boolean; next: Record<string, T> | undefined } {
        if (!record || oldKeyNodeId === newKeyNodeId || !Object.prototype.hasOwnProperty.call(record, oldKeyNodeId)) {
            return { changed: false, next: record };
        }

        const next = sanitizeRecord(record);
        next[newKeyNodeId] = next[oldKeyNodeId];
        delete next[oldKeyNodeId];
        return { changed: true, next };
    }

    private removePropertyNodeMetadataRecord<T>(
        record: Record<string, T> | undefined,
        keyNodeId: string
    ): { changed: boolean; next: Record<string, T> | undefined } {
        if (!record) {
            return { changed: false, next: record };
        }

        const valuePrefix = `${keyNodeId}=`;
        const keys = Object.keys(record);
        let next: Record<string, T> | undefined;
        let changed = false;

        keys.forEach(key => {
            if (key !== keyNodeId && !key.startsWith(valuePrefix)) {
                return;
            }

            if (!next) {
                next = sanitizeRecord(record);
            }

            delete next[key];
            changed = true;
        });

        return changed && next ? { changed: true, next } : { changed: false, next: record };
    }

    private removePropertyKeyMetadataRecord<T>(
        record: Record<string, T> | undefined,
        keyNodeId: string
    ): { changed: boolean; next: Record<string, T> | undefined } {
        if (!record || !Object.prototype.hasOwnProperty.call(record, keyNodeId)) {
            return { changed: false, next: record };
        }

        const next = sanitizeRecord(record);
        delete next[keyNodeId];
        return { changed: true, next };
    }

    private mutatePropertyMetadataRecords(
        settings: NotebookNavigatorSettings,
        accessors: readonly PropertyMetadataAccessor[],
        mutate: (record: PropertyMetadataRecord | undefined) => { changed: boolean; next: PropertyMetadataRecord | undefined }
    ): boolean {
        let changed = false;
        accessors.forEach(accessor => {
            const result = mutate(accessor.read(settings));
            if (!result.changed || !result.next) {
                return;
            }
            accessor.write(settings, result.next);
            changed = true;
        });
        return changed;
    }

    private renamePropertyNodeMetadataFields(settings: NotebookNavigatorSettings, oldKeyNodeId: string, newKeyNodeId: string): boolean {
        return this.mutatePropertyMetadataRecords(settings, PROPERTY_NODE_METADATA_ACCESSORS, record =>
            this.renamePropertyNodeMetadataRecord(record, oldKeyNodeId, newKeyNodeId)
        );
    }

    private renamePropertyKeyMetadataFields(settings: NotebookNavigatorSettings, oldKeyNodeId: string, newKeyNodeId: string): boolean {
        return this.mutatePropertyMetadataRecords(settings, PROPERTY_KEY_METADATA_ACCESSORS, record =>
            this.renamePropertyKeyMetadataRecord(record, oldKeyNodeId, newKeyNodeId)
        );
    }

    private removePropertyNodeMetadataFields(settings: NotebookNavigatorSettings, keyNodeId: string): boolean {
        return this.mutatePropertyMetadataRecords(settings, PROPERTY_NODE_METADATA_ACCESSORS, record =>
            this.removePropertyNodeMetadataRecord(record, keyNodeId)
        );
    }

    private removePropertyKeyMetadataFields(settings: NotebookNavigatorSettings, keyNodeId: string): boolean {
        return this.mutatePropertyMetadataRecords(settings, PROPERTY_KEY_METADATA_ACCESSORS, record =>
            this.removePropertyKeyMetadataRecord(record, keyNodeId)
        );
    }

    private migratePropertyMetadataAfterRename(
        settings: NotebookNavigatorSettings,
        oldKeyNormalized: string,
        newKeyNormalized: string
    ): boolean {
        const oldKeyNodeId = buildPropertyKeyNodeId(oldKeyNormalized);
        const newKeyNodeId = buildPropertyKeyNodeId(newKeyNormalized);
        const nodeChanged = this.renamePropertyNodeMetadataFields(settings, oldKeyNodeId, newKeyNodeId);
        const keyChanged = this.renamePropertyKeyMetadataFields(settings, oldKeyNodeId, newKeyNodeId);
        const collapsedPinnedContextChanged = updateCollapsedPinnedContextKeys(
            settings.collapsedPinnedContexts,
            ItemType.PROPERTY,
            oldKeyNodeId,
            newKeyNodeId,
            { descendantDelimiter: '=' }
        );
        return nodeChanged || keyChanged || collapsedPinnedContextChanged;
    }

    private removePropertyMetadataForDeletedKey(settings: NotebookNavigatorSettings, normalizedKey: string): boolean {
        const keyNodeId = buildPropertyKeyNodeId(normalizedKey);
        const nodeChanged = this.removePropertyNodeMetadataFields(settings, keyNodeId);
        const keyChanged = this.removePropertyKeyMetadataFields(settings, keyNodeId);
        const collapsedPinnedContextChanged = deleteCollapsedPinnedContextKeys(
            settings.collapsedPinnedContexts,
            ItemType.PROPERTY,
            keyNodeId,
            { descendantDelimiter: '=' }
        );
        return nodeChanged || keyChanged || collapsedPinnedContextChanged;
    }

    protected async updateSettingsAfterRename(oldKeyNormalized: string, newKeyDisplay: string): Promise<void> {
        const settings = this.getSettings();
        let changed = false;
        const activePropertyFields = getActivePropertyFields(settings);
        const newKeyNormalized = casefold(newKeyDisplay);

        const nextPropertyFields = renamePropertyField(activePropertyFields, oldKeyNormalized, newKeyDisplay, false);
        changed = setActivePropertyFields(settings, nextPropertyFields) || changed;

        changed = updatePropertySortKeySetting(settings, oldKeyNormalized, newKeyDisplay) || changed;
        changed = updateManualSortPropertyKeySetting(settings, oldKeyNormalized, newKeyDisplay) || changed;
        changed = updateManualSortGroupHeaderPropertySetting(settings, oldKeyNormalized, newKeyDisplay) || changed;
        changed = updateSortOverridePropertyKeySettings(settings, oldKeyNormalized, newKeyDisplay) || changed;

        if (newKeyNormalized) {
            changed = this.migratePropertyMetadataAfterRename(settings, oldKeyNormalized, newKeyNormalized) || changed;
        }

        if (changed) {
            await this.saveSettingsAndUpdate();
        }
    }

    protected async updateSettingsAfterDelete(normalizedKey: string): Promise<void> {
        const settings = this.getSettings();
        let changed = false;
        const activePropertyFields = getActivePropertyFields(settings);

        const nextPropertyFields = removePropertyField(activePropertyFields, normalizedKey);
        changed = setActivePropertyFields(settings, nextPropertyFields) || changed;

        changed = updatePropertySortKeySetting(settings, normalizedKey, null) || changed;
        changed = updateManualSortPropertyKeySetting(settings, normalizedKey, null) || changed;
        changed = updateManualSortGroupHeaderPropertySetting(settings, normalizedKey, null) || changed;
        changed = updateSortOverridePropertyKeySettings(settings, normalizedKey, null) || changed;

        changed = this.removePropertyMetadataForDeletedKey(settings, normalizedKey) || changed;

        if (changed) {
            await this.saveSettingsAndUpdate();
        }
    }

    protected collectRenameConflictPaths(oldKeyNormalized: string, newKeyNormalized: string, affectedPaths: Set<string>): Set<string> {
        const snapshot = this.collectRenameConflictSnapshot(oldKeyNormalized, affectedPaths);
        return this.collectRenameConflictPathsFromSnapshot(oldKeyNormalized, newKeyNormalized, snapshot);
    }

    private collectRenameConflictSnapshot(oldKeyNormalized: string, affectedPaths: Set<string>): RenameConflictSnapshot {
        const normalizedOldKey = casefold(oldKeyNormalized);
        if (!normalizedOldKey) {
            return new Map();
        }

        const snapshot: RenameConflictSnapshot = new Map();
        for (const path of affectedPaths) {
            const abstract = this.app.vault.getAbstractFileByPath(path);
            if (!(abstract instanceof TFile) || !this.fileMutations.isMarkdownFile(abstract)) {
                continue;
            }

            try {
                const frontmatter = this.app.metadataCache.getFileCache(abstract)?.frontmatter;
                if (!isRecord(frontmatter)) {
                    continue;
                }

                const keys = Object.keys(frontmatter);
                if (keys.length === 0) {
                    continue;
                }

                const normalizedKeys = new Set<string>();
                let hasSourceKey = false;
                keys.forEach(key => {
                    const normalizedKey = casefold(key);
                    if (!normalizedKey) {
                        return;
                    }
                    normalizedKeys.add(normalizedKey);
                    if (normalizedKey === normalizedOldKey) {
                        hasSourceKey = true;
                    }
                });

                if (!hasSourceKey) {
                    continue;
                }

                snapshot.set(path, normalizedKeys);
            } catch (error: unknown) {
                console.error(`[Notebook Navigator] Failed to analyze property rename conflict in ${path}`, error);
            }
        }

        return snapshot;
    }

    private collectPropertyKeyPathsFromVault(normalizedKey: string): Set<string> {
        const targetKey = casefold(normalizedKey);
        if (!targetKey) {
            return new Set();
        }

        const paths = new Set<string>();
        const markdownFiles = this.app.vault.getMarkdownFiles();
        for (const file of markdownFiles) {
            const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
            if (!isRecord(frontmatter)) {
                continue;
            }

            const keys = Object.keys(frontmatter);
            if (keys.some(key => casefold(key) === targetKey)) {
                paths.add(file.path);
            }
        }

        return paths;
    }

    private collectRenameConflictPathsFromSnapshot(
        oldKeyNormalized: string,
        newKeyNormalized: string,
        snapshot: RenameConflictSnapshot
    ): Set<string> {
        const normalizedOldKey = casefold(oldKeyNormalized);
        const normalizedNewKey = casefold(newKeyNormalized);
        if (!normalizedOldKey || !normalizedNewKey || normalizedOldKey === normalizedNewKey) {
            return new Set();
        }

        const conflicts = new Set<string>();
        snapshot.forEach((keys, path) => {
            if (keys.has(normalizedNewKey)) {
                conflicts.add(path);
            }
        });
        return conflicts;
    }

    private async confirmRenameConflicts(params: {
        oldKeyDisplay: string;
        newKeyDisplay: string;
        conflictPaths: Set<string>;
    }): Promise<boolean> {
        const usage = buildUsageSummaryFromPaths(this.app, params.conflictPaths);
        const countLabel = usage.total === 1 ? strings.modals.tagOperation.file : strings.modals.tagOperation.files;

        return await new Promise<boolean>(resolve => {
            const modal = new ConfirmModal(
                this.app,
                strings.modals.propertyOperation.renameTitle.replace('{property}', params.oldKeyDisplay),
                strings.modals.propertyOperation.renameConflictWarning
                    .replace('{oldKey}', params.oldKeyDisplay)
                    .replace('{newKey}', params.newKeyDisplay)
                    .replace('{count}', usage.total.toString())
                    .replace('{files}', countLabel),
                () => resolve(true),
                strings.modals.propertyOperation.confirmRename,
                {
                    buildContent: container => renderAffectedFilesPreview(container, usage),
                    onCancel: () => resolve(false)
                }
            );
            modal.open();
        });
    }

    private notifyPropertyKeyRenamed(payload: PropertyKeyRenameEventPayload): void {
        if (this.propertyKeyRenameListeners.size === 0) {
            return;
        }
        for (const listener of this.propertyKeyRenameListeners) {
            try {
                listener(payload);
            } catch (error) {
                console.error('[Notebook Navigator] Property key rename listener failed', error);
            }
        }
    }

    private notifyPropertyKeyDeleted(payload: PropertyKeyDeleteEventPayload): void {
        if (this.propertyKeyDeleteListeners.size === 0) {
            return;
        }
        for (const listener of this.propertyKeyDeleteListeners) {
            try {
                listener(payload);
            } catch (error) {
                console.error('[Notebook Navigator] Property key delete listener failed', error);
            }
        }
    }
}
