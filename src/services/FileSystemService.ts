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

import { App, FileSystemAdapter, TFile, TFolder, TAbstractFile, Platform, WorkspaceLeaf, ViewState } from 'obsidian';
import type { SelectionDispatch } from '../context/SelectionContext';
import { strings } from '../i18n';
import { InputModal } from '../modals/InputModal';
import { ConfirmModal } from '../modals/ConfirmModal';
import type { NotebookNavigatorSettings } from '../settings/types';
import { PROPERTIES_ROOT_VIRTUAL_FOLDER_ID, TAGGED_TAG_ID, UNTAGGED_TAG_ID } from '../types';
import type { VisibilityPreferences } from '../types';
import { ExtendedApp, TIMEOUTS, OBSIDIAN_COMMANDS } from '../types/obsidian-extended';
import {
    buildFilePathInFolder,
    buildPathInFolder,
    createFileWithOptions,
    createDatabaseContent,
    generateUniqueFilename
} from '../utils/fileCreationUtils';
import {
    containsForbiddenNameCharactersAllPlatforms,
    containsForbiddenNameCharactersWindows,
    containsInvalidLinkCharacters,
    EXCALIDRAW_BASENAME_SUFFIX,
    isExcalidrawFile,
    stripExcalidrawSuffix,
    stripForbiddenNameCharactersAllPlatforms,
    stripForbiddenNameCharactersWindows,
    stripLeadingPeriods
} from '../utils/fileNameUtils';
import { getCachedCommaSeparatedList } from '../utils/commaSeparatedListUtils';
import { resolveFolderNoteName, shouldRenameFolderNoteWithFolderName } from '../utils/folderNoteName';
import {
    getFolderNote,
    getFolderNoteDetectionSettings,
    isFolderNote,
    isSupportedFolderNoteExtension,
    resolveFolderNoteNameForFolder
} from '../utils/folderNoteLookup';
import { executeCommand, isPluginInstalled, isRecord } from '../utils/typeGuards';
import { getErrorMessage } from '../utils/errorUtils';
import { TagTreeService } from './TagTreeService';
import type { PropertyTreeService } from './PropertyTreeService';
import { CommandQueueService } from './CommandQueueService';
import { showNotice } from '../utils/noticeUtils';
import { isPropertyLinkMarkupValue } from '../utils/propertyUtils';
import {
    getDirectPropertyKeyNoteCount,
    normalizePropertyNodeId,
    normalizePropertyTreeValuePath,
    parsePropertyNodeId
} from '../utils/propertyTree';
import type { ISettingsProvider } from '../interfaces/ISettingsProvider';
import { casefold, findMatchingRecordKey } from '../utils/recordUtils';
import type { MetadataService } from './MetadataService';
import { ensureVaultProfiles, getActiveVaultProfile } from '../utils/vaultProfiles';
import { EXCALIDRAW_PLUGIN_ID, TLDRAW_PLUGIN_ID } from '../constants/pluginIds';
import { createDrawingWithPlugin, DrawingType, getDrawingFilePath, getDrawingTemplate } from '../utils/drawingFileUtils';
import { resolveFolderDisplayName } from '../utils/folderDisplayName';
import { normalizeTagPath } from '../utils/tagUtils';
import type { PropertyTreeNode } from '../types/storage';
import { FolderPathSettingsSync } from './fileSystem/FolderPathSettingsSync';
import { FileMoveService } from './fileSystem/FileMoveService';
import { FileDeletionService, type FileTrashResult } from './fileSystem/FileDeletionService';
import {
    buildManualSortInsertionRankPlan,
    getLocalizedManualSortWriteFailureMessage,
    normalizeManualSortPropertyKey,
    writeManualSortAssignments,
    type ManualSortRankPlan,
    type ManualSortNewFilePlacementContext
} from '../utils/manualSort';
import type {
    MoveFilesOptions,
    MoveFilesResult,
    MoveFilesSelectionContext,
    MoveFolderModalResult,
    MoveFolderResult,
    SelectionContext
} from './fileSystem/types';
export { FolderMoveError } from './fileSystem/FileMoveService';
export type { FileTrashResult };
export type { ManualSortNewFilePlacementContext };

/**
 * Summary of property assignment results across a file batch.
 */
interface ApplyPropertyNodeResult {
    updated: number;
    skipped: number;
}

/**
 * Serialized value shape written into frontmatter.
 */
type PropertyNodeAssignmentValueKind = 'boolean' | 'string';

/**
 * Normalized property write request derived from a tree node id.
 */
interface ResolvedPropertyNodeAssignment {
    propertyKey: string;
    nodeKind: 'key' | 'value';
    desiredValue: string | null;
    normalizedDesiredValue: string | null;
    writeValue: boolean | string;
    writeValueKind: PropertyNodeAssignmentValueKind;
}

interface DisplayNameRenameInputOptions {
    initialValue: string;
    inputFilter?: (value: string) => string;
    onInputChange?: (context: { rawValue: string; filteredValue: string }) => void;
}

interface FrontmatterDisplayNameTarget {
    field: string;
    fallbackValue: string;
    initialValue: string;
    storedValue: string | null;
}

interface ElectronShell {
    openPath(path: string): Promise<string>;
}

interface ElectronModule {
    shell: ElectronShell;
}

interface WindowWithRequire {
    require(moduleName: string): unknown;
}

/**
 * Handles all file system operations for Notebook Navigator
 * Provides centralized methods for creating, renaming, and deleting files/folders
 * Manages user input modals and confirmation dialogs
 */
export class FileSystemOperations {
    private readonly folderPathSettingsSync: FolderPathSettingsSync;
    private readonly moveService: FileMoveService;
    private readonly deletionService: FileDeletionService;
    private manualSortNewFileContextProvider: (() => ManualSortNewFilePlacementContext | null) | null = null;

    /**
     * Creates a new FileSystemOperations instance
     * @param app - The Obsidian app instance for vault operations
     * @param getTagTreeService - Function to get the TagTreeService instance
     * @param getPropertyTreeService - Function to get the PropertyTreeService instance
     * @param getCommandQueue - Function to get the CommandQueueService instance
     * @param getMetadataService - Function to get the MetadataService instance
     */
    constructor(
        private app: App,
        private getTagTreeService: () => TagTreeService | null,
        private getPropertyTreeService: () => PropertyTreeService | null,
        private getCommandQueue: () => CommandQueueService | null,
        private getMetadataService: () => MetadataService | null,
        private getVisibilityPreferences: () => VisibilityPreferences, // Function to get current visibility preferences for descendant/hidden items state
        private settingsProvider: ISettingsProvider
    ) {
        this.folderPathSettingsSync = new FolderPathSettingsSync(this.settingsProvider);
        this.moveService = new FileMoveService({
            app: this.app,
            settingsProvider: this.settingsProvider,
            getCommandQueue: this.getCommandQueue,
            resolveFolderDisplayLabel: folder => this.resolveFolderDisplayLabel(folder),
            folderPathSettingsSync: this.folderPathSettingsSync
        });
        this.deletionService = new FileDeletionService({
            app: this.app,
            settingsProvider: this.settingsProvider,
            getTagTreeService: this.getTagTreeService,
            getPropertyTreeService: this.getPropertyTreeService,
            getCommandQueue: this.getCommandQueue,
            getVisibilityPreferences: this.getVisibilityPreferences,
            resolveFolderDisplayLabel: folder => this.resolveFolderDisplayLabel(folder),
            notifyError: (template, error, fallback) => this.notifyError(template, error, fallback),
            folderPathSettingsSync: this.folderPathSettingsSync
        });
    }

    /**
     * Resolves UI label for a folder, including frontmatter display names.
     */
    private resolveFolderDisplayLabel(folder: TFolder): string {
        const metadataService = this.getMetadataService();
        if (!metadataService) {
            return folder.path === '/' ? this.settingsProvider.settings.customVaultName || this.app.vault.getName() : folder.name;
        }
        return resolveFolderDisplayName({
            app: this.app,
            metadataService,
            settings: { customVaultName: this.settingsProvider.settings.customVaultName },
            folderPath: folder.path,
            fallbackName: folder.name
        });
    }

    /**
     * Shows a notification with a formatted error message
     */
    private notifyError(template: string, error: unknown, fallback?: string): void {
        const message = template.replace('{error}', getErrorMessage(error, fallback ?? strings.common.unknownError));
        showNotice(message, { variant: 'warning' });
    }

    public setManualSortNewFileContextProvider(provider: (() => ManualSortNewFilePlacementContext | null) | null): () => void {
        this.manualSortNewFileContextProvider = provider;
        return () => {
            if (this.manualSortNewFileContextProvider === provider) {
                this.manualSortNewFileContextProvider = null;
            }
        };
    }

    private resolveManualSortNewFileContext(
        context: ManualSortNewFilePlacementContext | null | undefined,
        targetType: ManualSortNewFilePlacementContext['targetType'],
        targetKey: string
    ): ManualSortNewFilePlacementContext | null {
        const resolvedContext = context !== undefined ? context : (this.manualSortNewFileContextProvider?.() ?? null);
        if (!resolvedContext || resolvedContext.targetType !== targetType || resolvedContext.targetKey !== targetKey) {
            return null;
        }

        return resolvedContext;
    }

    private async waitForManualSortNewFileContextProviderRefresh(): Promise<void> {
        await new Promise<void>(resolve => {
            window.requestAnimationFrame(() => {
                window.setTimeout(resolve, 0);
            });
        });
    }

    public async getManualSortNewFileContextForTarget(
        targetType: ManualSortNewFilePlacementContext['targetType'],
        targetKey: string,
        options: { waitForSelectionUpdate?: boolean } = {}
    ): Promise<ManualSortNewFilePlacementContext | null> {
        const currentContext = this.resolveManualSortNewFileContext(undefined, targetType, targetKey);
        if (currentContext || !options.waitForSelectionUpdate) {
            return currentContext;
        }

        for (let attempt = 0; attempt < 3; attempt += 1) {
            await this.waitForManualSortNewFileContextProviderRefresh();
            const nextContext = this.resolveManualSortNewFileContext(undefined, targetType, targetKey);
            if (nextContext) {
                return nextContext;
            }
        }

        return null;
    }

    private async writeManualSortNewFilePlacement(propertyKey: string, plan: ManualSortRankPlan<TFile>): Promise<void> {
        try {
            const result = await writeManualSortAssignments(this.app, plan.files, propertyKey, plan.assignments);
            if (result.failed > 0) {
                showNotice(
                    strings.dragDrop.errors.failedToSetProperty.replace('{error}', getLocalizedManualSortWriteFailureMessage(result)),
                    { variant: 'warning' }
                );
            }
        } catch (error) {
            showNotice(
                strings.dragDrop.errors.failedToSetProperty.replace('{error}', getErrorMessage(error, strings.common.unknownError)),
                { variant: 'warning' }
            );
        }
    }

    private openManualSortNewFileCompactionConfirm(propertyKey: string, plan: ManualSortRankPlan<TFile>): void {
        new ConfirmModal(
            this.app,
            strings.modals.manualSortConfirm.compactTitle,
            strings.modals.manualSortConfirm.compactMessage(plan.assignments.length),
            () => this.writeManualSortNewFilePlacement(propertyKey, plan),
            strings.modals.manualSortConfirm.compactConfirmButton,
            { confirmButtonClass: 'mod-cta' }
        ).open();
    }

    private async applyManualSortNewFilePlacement(
        file: TFile,
        context?: ManualSortNewFilePlacementContext | null,
        options: { deferCompactionPrompt?: boolean } = {}
    ): Promise<(() => void) | null> {
        if (!context || file.extension !== 'md') {
            return null;
        }

        const propertyKey = normalizeManualSortPropertyKey(context.propertyKey);
        if (!propertyKey) {
            return null;
        }

        const plan = buildManualSortInsertionRankPlan({
            files: context.files,
            planningFiles: context.planningFiles,
            planningInsertionIndex: context.planningInsertionIndex,
            insertedFile: file,
            placement: context.placement,
            selectedPath: context.selectedFilePath,
            rankByPath: context.rankByPath
        });
        if (!plan || plan.assignments.length === 0) {
            return null;
        }

        if (plan.requiresCompaction) {
            if (options.deferCompactionPrompt) {
                return () => {
                    window.setTimeout(() => {
                        this.openManualSortNewFileCompactionConfirm(propertyKey, plan);
                    }, TIMEOUTS.FILE_OPERATION_DELAY * 2);
                };
            }

            this.openManualSortNewFileCompactionConfirm(propertyKey, plan);
            return null;
        }

        await this.writeManualSortNewFilePlacement(propertyKey, plan);
        return null;
    }

    private resolveConfiguredPropertyDisplayKey(normalizedKey: string): string | null {
        const activeProfile = getActiveVaultProfile(this.settingsProvider.settings);
        const propertyKeys = Array.isArray(activeProfile.propertyKeys) ? activeProfile.propertyKeys : [];

        for (let index = 0; index < propertyKeys.length; index += 1) {
            const rawKey = propertyKeys[index]?.key;
            if (typeof rawKey !== 'string') {
                continue;
            }

            const displayKey = rawKey.trim();
            if (!displayKey) {
                continue;
            }

            if (casefold(displayKey) === normalizedKey) {
                return displayKey;
            }
        }

        return null;
    }

    private resolvePropertyNodeAssignmentText(
        targetNode: PropertyTreeNode | null,
        requestedValuePath: string | null,
        normalizedValuePath: string | null
    ): string | null {
        if (!normalizedValuePath) {
            return null;
        }

        const assignmentValue = targetNode?.kind === 'value' ? targetNode.assignmentValue?.trim() : undefined;
        if (assignmentValue && normalizePropertyTreeValuePath(assignmentValue) === normalizedValuePath) {
            return assignmentValue;
        }

        const displayValue = targetNode?.kind === 'value' ? targetNode.name.trim() : '';
        if (displayValue && normalizePropertyTreeValuePath(displayValue) === normalizedValuePath) {
            return displayValue;
        }

        if (requestedValuePath && normalizePropertyTreeValuePath(requestedValuePath) === normalizedValuePath) {
            return requestedValuePath;
        }

        return normalizedValuePath;
    }

    private shouldKeepCurrentPropertyString(currentValue: string, desiredValue: string, normalizedDesiredValue: string): boolean {
        if (normalizePropertyTreeValuePath(currentValue) !== normalizedDesiredValue) {
            return false;
        }

        return !isPropertyLinkMarkupValue(desiredValue) || isPropertyLinkMarkupValue(currentValue);
    }

    /**
     * Resolves a property node id into a normalized frontmatter assignment.
     */
    private resolvePropertyNodeAssignment(propertyNodeId: string): ResolvedPropertyNodeAssignment | null {
        const requestedNode = parsePropertyNodeId(propertyNodeId);
        if (!requestedNode) {
            return null;
        }

        const normalizedNodeId = normalizePropertyNodeId(propertyNodeId);
        if (!normalizedNodeId) {
            return null;
        }

        const parsedNode = parsePropertyNodeId(normalizedNodeId);
        if (!parsedNode) {
            return null;
        }

        const propertyTreeService = this.getPropertyTreeService();
        const targetNode = propertyTreeService?.findNode(normalizedNodeId) ?? null;
        const keyNode = propertyTreeService?.getKeyNode(parsedNode.key) ?? null;

        const propertyKey = (keyNode?.name?.trim() || this.resolveConfiguredPropertyDisplayKey(parsedNode.key) || parsedNode.key).trim();
        if (!propertyKey) {
            return null;
        }

        const nodeKind: 'key' | 'value' = targetNode?.kind === 'value' || parsedNode.valuePath ? 'value' : 'key';
        const requestedValuePath = requestedNode.valuePath?.trim() ?? null;
        const desiredValue: string | null =
            nodeKind === 'key' ? null : this.resolvePropertyNodeAssignmentText(targetNode, requestedValuePath, parsedNode.valuePath);
        const normalizedDesiredValue = desiredValue ? normalizePropertyTreeValuePath(desiredValue) : null;
        if (nodeKind === 'value' && !normalizedDesiredValue) {
            return null;
        }

        if (nodeKind === 'key') {
            return {
                propertyKey,
                nodeKind,
                desiredValue,
                normalizedDesiredValue,
                writeValue: true,
                writeValueKind: 'boolean'
            };
        }

        if (!desiredValue || !normalizedDesiredValue) {
            return null;
        }

        const isBooleanLiteral = normalizedDesiredValue === 'true' || normalizedDesiredValue === 'false';
        const canResolveBooleanValue =
            isBooleanLiteral && keyNode !== null && targetNode === null && getDirectPropertyKeyNoteCount(keyNode) > 0;
        if (canResolveBooleanValue) {
            return {
                propertyKey,
                nodeKind,
                desiredValue,
                normalizedDesiredValue,
                writeValue: normalizedDesiredValue === 'true',
                writeValueKind: 'boolean'
            };
        }

        return {
            propertyKey,
            nodeKind,
            desiredValue,
            normalizedDesiredValue,
            writeValue: desiredValue,
            writeValueKind: 'string'
        };
    }

    /**
     * Filters input name for live typing
     * Strips leading periods to avoid hidden files
     * Removes forbidden characters across all platforms (: and /)
     * Removes Windows-reserved characters on Windows (<, >, ", \\, |, ?, *)
     * Does NOT trim whitespace during live filtering to allow typing spaces
     * @param value - The input name to filter
     * @returns Filtered value
     */
    private filterNameInputLive(value: string): string {
        let filtered = stripLeadingPeriods(value);
        filtered = stripForbiddenNameCharactersAllPlatforms(filtered);
        if (Platform.isWin) {
            filtered = stripForbiddenNameCharactersWindows(filtered);
        }
        return filtered;
    }

    /**
     * Filters and trims input name for final submission
     * @param value - The input name to filter
     * @returns Trimmed and filtered value
     */
    private filterNameInputFinal(value: string): string {
        return this.filterNameInputLive(value).trim();
    }

    getFileDisplayNameRenameInput(file: TFile): DisplayNameRenameInputOptions {
        const target = this.resolveFrontmatterDisplayNameTarget(file, this.getFileRenameDefaultValue(file));
        if (target) {
            return { initialValue: target.initialValue };
        }

        return {
            initialValue: this.getFileRenameDefaultValue(file),
            ...this.getNameInputModalOptions()
        };
    }

    getFolderDisplayNameRenameInput(folder: TFolder): DisplayNameRenameInputOptions {
        const target = this.resolveFolderFrontmatterDisplayNameTarget(folder);
        if (target) {
            return { initialValue: target.target.initialValue };
        }

        if (folder.path === '/') {
            return { initialValue: this.settingsProvider.settings.customVaultName || this.app.vault.getName() };
        }

        return {
            initialValue: folder.name,
            ...this.getNameInputModalOptions()
        };
    }

    private getFileRenameDefaultValue(file: TFile): string {
        return isExcalidrawFile(file) ? stripExcalidrawSuffix(file.basename) : file.basename;
    }

    private resolveConfiguredFrontmatterNameField(): string | null {
        const settings = this.settingsProvider.settings;
        if (!settings.useFrontmatterMetadata) {
            return null;
        }

        const fields = getCachedCommaSeparatedList(settings.frontmatterNameField);
        return fields[0] ?? null;
    }

    private extractFrontmatterDisplayNameValue(value: unknown): string | null {
        if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed.length > 0 ? trimmed : null;
        }

        if (Array.isArray(value)) {
            for (const entry of value) {
                if (typeof entry !== 'string') {
                    continue;
                }
                const trimmed = entry.trim();
                if (trimmed.length > 0) {
                    return trimmed;
                }
            }
        }

        return null;
    }

    private resolveFrontmatterDisplayNameTarget(file: TFile | null, fallbackInitialValue?: string): FrontmatterDisplayNameTarget | null {
        if (!file || file.extension !== 'md') {
            return null;
        }

        const fallbackField = this.resolveConfiguredFrontmatterNameField();
        if (!fallbackField) {
            return null;
        }

        const frontmatterValue: unknown = this.app.metadataCache.getFileCache(file)?.frontmatter;
        const frontmatter = isRecord(frontmatterValue) ? frontmatterValue : null;
        const fields = getCachedCommaSeparatedList(this.settingsProvider.settings.frontmatterNameField);
        let firstExistingField: string | null = null;

        for (const field of fields) {
            const matchingField = findMatchingRecordKey(frontmatter, field);
            if (!matchingField) {
                continue;
            }

            firstExistingField = firstExistingField ?? matchingField;
            const displayName = this.extractFrontmatterDisplayNameValue(frontmatter?.[matchingField]);
            if (displayName) {
                return {
                    field: matchingField,
                    fallbackValue: fallbackInitialValue ?? '',
                    initialValue: displayName,
                    storedValue: displayName
                };
            }
        }

        return {
            field: firstExistingField ?? fallbackField,
            fallbackValue: fallbackInitialValue ?? '',
            initialValue: fallbackInitialValue ?? '',
            storedValue: null
        };
    }

    private resolveFolderFrontmatterDisplayNameTarget(folder: TFolder): { file: TFile; target: FrontmatterDisplayNameTarget } | null {
        const settings = this.settingsProvider.settings;
        if (!settings.useFrontmatterMetadata || !settings.enableFolderNotes) {
            return null;
        }

        const folderNote = getFolderNote(folder, getFolderNoteDetectionSettings(settings));
        if (!folderNote || folderNote.extension !== 'md') {
            return null;
        }

        const fallbackName = folder.path === '/' ? this.settingsProvider.settings.customVaultName || this.app.vault.getName() : folder.name;
        const target = this.resolveFrontmatterDisplayNameTarget(folderNote, fallbackName);
        return target ? { file: folderNote, target } : null;
    }

    private async writeFrontmatterDisplayName(file: TFile, target: FrontmatterDisplayNameTarget, value: string): Promise<void> {
        const nextValue = value.trim();
        await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
            const targetField = findMatchingRecordKey(frontmatter, target.field) ?? target.field;
            if (nextValue.length > 0 && nextValue !== target.fallbackValue.trim()) {
                frontmatter[targetField] = nextValue;
                return;
            }

            if (Reflect.has(frontmatter, targetField)) {
                delete frontmatter[targetField];
            }
        });
    }

    private hasFrontmatterDisplayNameChange(target: FrontmatterDisplayNameTarget, value: string): boolean {
        const nextValue = value.trim();
        if (target.storedValue !== null) {
            return nextValue !== target.storedValue;
        }

        return nextValue.length > 0 && nextValue !== target.fallbackValue.trim();
    }

    /**
     * Builds a folder note filename for the provided base name.
     */
    private buildFolderNoteFileName(baseName: string, extension: string, isExcalidraw: boolean): string {
        const folderNoteBaseName = isExcalidraw ? `${baseName}${EXCALIDRAW_BASENAME_SUFFIX}` : baseName;
        return `${folderNoteBaseName}.${extension}`;
    }

    /**
     * Builds a folder note filename for the provided base name.
     */
    private getFolderNoteFileName(baseName: string, folderNote: TFile): string {
        return this.buildFolderNoteFileName(baseName, folderNote.extension, isExcalidrawFile(folderNote));
    }

    /**
     * Returns options for input filtering and warnings in InputModal
     */
    private getNameInputModalOptions(): {
        inputFilter: (value: string) => string;
        onInputChange: (context: { rawValue: string; filteredValue: string }) => void;
    } {
        let previouslyHadLinkBreakingCharacters = false;

        return {
            inputFilter: (input: string) => this.filterNameInputLive(input),
            onInputChange: ({ rawValue, filteredValue }) => {
                const charactersWereRemoved = rawValue !== filteredValue;
                if (charactersWereRemoved) {
                    const hasLeadingPeriods = rawValue.startsWith('.');
                    const hasForbiddenAllPlatforms = hasLeadingPeriods || containsForbiddenNameCharactersAllPlatforms(rawValue);
                    if (hasForbiddenAllPlatforms) {
                        showNotice(strings.fileSystem.warnings.forbiddenNameCharactersAllPlatforms, { variant: 'warning' });
                    }

                    if (Platform.isWin) {
                        const hasForbiddenWindows = containsForbiddenNameCharactersWindows(rawValue);
                        if (hasForbiddenWindows) {
                            showNotice(strings.fileSystem.warnings.forbiddenNameCharactersWindows, { variant: 'warning' });
                        }
                    }
                }

                const hasLinkBreakingCharacters = containsInvalidLinkCharacters(filteredValue);
                if (hasLinkBreakingCharacters && !previouslyHadLinkBreakingCharacters) {
                    showNotice(strings.fileSystem.warnings.linkBreakingNameCharacters, { variant: 'warning' });
                }
                previouslyHadLinkBreakingCharacters = hasLinkBreakingCharacters;
            }
        };
    }

    /**
     * Creates a new folder with user-provided name
     * Shows input modal for folder name and handles creation
     * @param parent - The parent folder to create the new folder in
     * @param onSuccess - Optional callback with the new folder path on successful creation
     */
    async createNewFolder(parent: TFolder, onSuccess?: (path: string) => void): Promise<void> {
        const settings = this.settingsProvider.settings;
        ensureVaultProfiles(settings);
        const showHiddenOption = settings.vaultProfiles.length >= 2;
        const nameInputOptions = this.getNameInputModalOptions();
        const modalOptions = showHiddenOption
            ? {
                  checkbox: {
                      label: strings.modals.fileSystem.hideInOtherVaultProfiles
                  },
                  ...nameInputOptions
              }
            : nameInputOptions;

        const modal = new InputModal(
            this.app,
            strings.modals.fileSystem.newFolderTitle,
            strings.modals.fileSystem.folderNamePrompt,
            async (name, context) => {
                const filteredName = this.filterNameInputFinal(name);
                if (!filteredName) {
                    return;
                }

                try {
                    const path = buildPathInFolder(parent.path, filteredName);
                    await this.app.vault.createFolder(path);
                    if (showHiddenOption && context?.checkboxValue) {
                        await this.folderPathSettingsSync.hideFolderInOtherVaultProfiles(path);
                    }
                    if (onSuccess) {
                        onSuccess(path);
                    }
                } catch (error) {
                    this.notifyError(strings.fileSystem.errors.createFolder, error);
                }
            },
            '',
            modalOptions
        );
        modal.open();
    }

    /**
     * Creates a new markdown file with auto-generated "Untitled" name
     * Automatically increments name if "Untitled" already exists
     * Opens the file and triggers rename mode for immediate naming
     * @param parent - The parent folder to create the file in
     * @param openInNewTab - Whether the file should open in a new tab
     * @returns The created file or null if creation failed
     */
    async createNewFile(
        parent: TFolder,
        openInNewTab = false,
        manualSortContext?: ManualSortNewFilePlacementContext | null
    ): Promise<TFile | null> {
        const resolvedManualSortContext = this.resolveManualSortNewFileContext(manualSortContext, 'folder', parent.path);
        const deferredManualSortPrompt: { run: (() => void) | null } = { run: null };
        const file = await createFileWithOptions(parent, this.app, {
            extension: 'md',
            content: '',
            openInNewTab,
            afterCreate: async createdFile => {
                deferredManualSortPrompt.run = await this.applyManualSortNewFilePlacement(createdFile, resolvedManualSortContext, {
                    deferCompactionPrompt: true
                });
            },
            errorKey: 'createFile'
        });
        deferredManualSortPrompt.run?.();
        return file;
    }

    /**
     * Creates a new markdown file in the user's configured default location and adds the selected tag in frontmatter.
     * Uses Obsidian's markdown file creation API so plugin hooks run on creation.
     * @param tagPath - Canonical tag path without # prefix
     * @param sourcePath - Current file path used for "same folder as current file" preference
     * @param openInNewTab - Whether the file should open in a new tab
     * @returns The created file or null when creation fails
     */
    async createNewFileForTag(
        tagPath: string,
        sourcePath?: string,
        openInNewTab = false,
        manualSortContext?: ManualSortNewFilePlacementContext | null
    ): Promise<TFile | null> {
        const normalizedTag = normalizeTagPath(tagPath);
        if (!normalizedTag || normalizedTag === TAGGED_TAG_ID || normalizedTag === UNTAGGED_TAG_ID) {
            return null;
        }

        const tagTreeService = this.getTagTreeService();
        const tagNode = tagTreeService?.findTagNode(normalizedTag);
        const resolvedTagPath = tagNode?.displayPath ?? normalizedTag;
        const resolvedManualSortContext = this.resolveManualSortNewFileContext(manualSortContext, 'tag', normalizedTag);

        try {
            const activeFilePath = this.app.workspace.getActiveFile()?.path ?? '';
            const sourceFilePath = sourcePath?.trim().length ? sourcePath : activeFilePath;
            const defaultParent = this.app.fileManager.getNewFileParent(sourceFilePath ?? '');
            const targetFolder = defaultParent instanceof TFolder ? defaultParent : this.app.vault.getRoot();
            const fileName = generateUniqueFilename(targetFolder.path, strings.fileSystem.defaultNames.untitled, 'md', this.app);
            const file = await this.app.fileManager.createNewMarkdownFile(targetFolder, fileName);

            try {
                // Mutate frontmatter through Obsidian's API so YAML serialization matches other tag operations.
                await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
                    frontmatter.tags = [resolvedTagPath];
                });
            } catch (error) {
                console.error('[Notebook Navigator] Failed to update created note tags', error);
                showNotice(strings.dragDrop.errors.failedToAddTag.replace('{tag}', `#${resolvedTagPath}`), { variant: 'warning' });
            }

            const scheduleDeferredManualSortPrompt = await this.applyManualSortNewFilePlacement(file, resolvedManualSortContext, {
                deferCompactionPrompt: true
            });

            const leaf = this.app.workspace.getLeaf(openInNewTab);
            await leaf.openFile(file, { state: { mode: 'source' }, active: true });

            window.setTimeout(() => {
                executeCommand(this.app, OBSIDIAN_COMMANDS.EDIT_FILE_TITLE);
            }, TIMEOUTS.FILE_OPERATION_DELAY);
            scheduleDeferredManualSortPrompt?.();

            return file;
        } catch (error) {
            this.notifyError(strings.fileSystem.errors.createFile, error);
            return null;
        }
    }

    /**
     * Creates a new markdown file in the user's configured default location and applies the selected property.
     * Uses Obsidian's markdown file creation API so plugin hooks run on creation.
     * @param propertyNodeId - Canonical property node id (`key:<property>` or `key:<property>=<value>`)
     * @param sourcePath - Current file path used for "same folder as current file" preference
     * @param openInNewTab - Whether the file should open in a new tab
     * @returns The created file or null when creation fails
     */
    async createNewFileForProperty(
        propertyNodeId: string,
        sourcePath?: string,
        openInNewTab = false,
        manualSortContext?: ManualSortNewFilePlacementContext | null
    ): Promise<TFile | null> {
        if (propertyNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
            return null;
        }

        const assignment = this.resolvePropertyNodeAssignment(propertyNodeId);
        if (!assignment) {
            return null;
        }
        const normalizedPropertyNodeId = normalizePropertyNodeId(propertyNodeId);
        const resolvedManualSortContext = this.resolveManualSortNewFileContext(
            manualSortContext,
            'property',
            normalizedPropertyNodeId ?? ''
        );

        const propertyValue: unknown = assignment.writeValue;

        try {
            const activeFilePath = this.app.workspace.getActiveFile()?.path ?? '';
            const sourceFilePath = sourcePath?.trim().length ? sourcePath : activeFilePath;
            const defaultParent = this.app.fileManager.getNewFileParent(sourceFilePath ?? '');
            const targetFolder = defaultParent instanceof TFolder ? defaultParent : this.app.vault.getRoot();
            const fileName = generateUniqueFilename(targetFolder.path, strings.fileSystem.defaultNames.untitled, 'md', this.app);
            const file = await this.app.fileManager.createNewMarkdownFile(targetFolder, fileName);

            try {
                // Mutate frontmatter through Obsidian's API so YAML serialization matches other property operations.
                await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
                    frontmatter[assignment.propertyKey] = propertyValue;
                });
            } catch (error) {
                console.error('[Notebook Navigator] Failed to update created note properties', error);
                showNotice(
                    strings.dragDrop.errors.failedToSetProperty.replace('{error}', getErrorMessage(error, strings.common.unknownError)),
                    { variant: 'warning' }
                );
            }

            const scheduleDeferredManualSortPrompt = await this.applyManualSortNewFilePlacement(file, resolvedManualSortContext, {
                deferCompactionPrompt: true
            });

            const leaf = this.app.workspace.getLeaf(openInNewTab);
            await leaf.openFile(file, { state: { mode: 'source' }, active: true });

            window.setTimeout(() => {
                executeCommand(this.app, OBSIDIAN_COMMANDS.EDIT_FILE_TITLE);
            }, TIMEOUTS.FILE_OPERATION_DELAY);
            scheduleDeferredManualSortPrompt?.();

            return file;
        } catch (error) {
            this.notifyError(strings.fileSystem.errors.createFile, error);
            return null;
        }
    }

    /**
     * Applies a property key/value node to one or more markdown files.
     * Key nodes set `key: true`.
     * Value nodes set `key: value`, replacing the current value. When the current value is a string array, replaces it with a single item array.
     */
    async applyPropertyNodeToFiles(propertyNodeId: string, files: readonly TFile[]): Promise<ApplyPropertyNodeResult> {
        const markdownFiles = files.filter(file => file.extension === 'md');
        if (markdownFiles.length === 0) {
            return { updated: 0, skipped: 0 };
        }

        if (markdownFiles.length !== files.length) {
            showNotice(strings.fileSystem.notifications.propertiesRequireMarkdown, { variant: 'warning' });
            return { updated: 0, skipped: 0 };
        }

        const assignment = this.resolvePropertyNodeAssignment(propertyNodeId);
        if (!assignment) {
            return { updated: 0, skipped: 0 };
        }

        const normalizedPropertyKey = casefold(assignment.propertyKey);

        const isUnknownArray = (value: unknown): value is unknown[] => Array.isArray(value);

        let updated = 0;
        let skipped = 0;

        try {
            for (const file of markdownFiles) {
                let didChange = false;

                await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
                    const resolveExistingFrontmatterKey = (): string | null => {
                        for (const existingKey of Object.keys(frontmatter)) {
                            if (casefold(existingKey) === normalizedPropertyKey) {
                                return existingKey;
                            }
                        }
                        return null;
                    };

                    const targetPropertyKey = resolveExistingFrontmatterKey() ?? assignment.propertyKey;
                    const currentValue = frontmatter[targetPropertyKey];

                    if (assignment.nodeKind === 'key') {
                        if (currentValue === true || currentValue === null) {
                            return;
                        }

                        frontmatter[targetPropertyKey] = true;
                        didChange = true;
                        return;
                    }

                    if (assignment.writeValueKind === 'boolean') {
                        const desiredValue = assignment.writeValue;
                        if (typeof desiredValue !== 'boolean') {
                            return;
                        }

                        if (currentValue === desiredValue || (desiredValue && currentValue === null)) {
                            return;
                        }

                        frontmatter[targetPropertyKey] = desiredValue;
                        didChange = true;
                        return;
                    }

                    const desiredValue = assignment.desiredValue;
                    const normalizedDesiredValue = assignment.normalizedDesiredValue;
                    if (!desiredValue || !normalizedDesiredValue) {
                        return;
                    }

                    if (typeof currentValue === 'string') {
                        if (this.shouldKeepCurrentPropertyString(currentValue, desiredValue, normalizedDesiredValue)) {
                            return;
                        }
                        frontmatter[targetPropertyKey] = desiredValue;
                        didChange = true;
                        return;
                    }

                    if (isUnknownArray(currentValue)) {
                        const isSingleMatch =
                            currentValue.length === 1 &&
                            typeof currentValue[0] === 'string' &&
                            this.shouldKeepCurrentPropertyString(currentValue[0], desiredValue, normalizedDesiredValue);
                        if (isSingleMatch) {
                            return;
                        }

                        frontmatter[targetPropertyKey] = [desiredValue];
                        didChange = true;
                        return;
                    }

                    frontmatter[targetPropertyKey] = desiredValue;
                    didChange = true;
                });

                if (didChange) {
                    updated += 1;
                } else {
                    skipped += 1;
                }
            }
        } catch (error) {
            const message = getErrorMessage(error, strings.common.unknownError);
            showNotice(strings.dragDrop.errors.failedToSetProperty.replace('{error}', message), { variant: 'warning' });
            return { updated, skipped };
        }

        if (updated > 0) {
            const message =
                updated === 1
                    ? strings.fileSystem.notifications.propertySetOnNote
                    : strings.fileSystem.notifications.propertySetOnNotes.replace('{count}', updated.toString());
            showNotice(message, { variant: 'success' });
        }

        if (skipped > 0) {
            showNotice(strings.dragDrop.notifications.filesAlreadyHaveProperty.replace('{count}', skipped.toString()), {
                timeout: TIMEOUTS.NOTICE_ERROR,
                variant: 'warning'
            });
        }

        return { updated, skipped };
    }

    /**
     * Renames a folder from an already-collected name.
     * Returns false only when the rename attempted and failed.
     */
    async renameFolderToName(folder: TFolder, newName: string, settings?: NotebookNavigatorSettings): Promise<boolean> {
        const filteredName = this.filterNameInputFinal(newName);
        if (!filteredName || filteredName === folder.name) {
            return true;
        }

        try {
            const previousFolderPath = folder.path;
            const folderNoteNamingSettings =
                settings?.enableFolderNotes && shouldRenameFolderNoteWithFolderName(settings) ? settings : null;

            let folderNote: TFile | null = null;
            let renamedFolderNoteFileName: string | null = null;
            if (folderNoteNamingSettings) {
                folderNote = getFolderNote(folder, folderNoteNamingSettings);
            }

            if (folderNote && folderNoteNamingSettings) {
                const newFolderNoteBaseName = resolveFolderNoteName(filteredName, folderNoteNamingSettings);
                renamedFolderNoteFileName = this.getFolderNoteFileName(newFolderNoteBaseName, folderNote);
                const conflictPath = buildPathInFolder(folder.path, renamedFolderNoteFileName);
                const conflict = this.app.vault.getFileByPath(conflictPath);
                if (conflict) {
                    showNotice(strings.fileSystem.errors.renameFolderNoteConflict.replace('{name}', renamedFolderNoteFileName), {
                        variant: 'warning'
                    });
                    return false;
                }
            }

            const parentPath = folder.parent?.path ?? '/';
            const newFolderPath = buildPathInFolder(parentPath, filteredName);

            const performRename = async (): Promise<void> => {
                await this.app.fileManager.renameFile(folder, newFolderPath);
                await this.folderPathSettingsSync.syncHiddenFolderPathChange(previousFolderPath, newFolderPath);

                if (folderNote && renamedFolderNoteFileName !== null) {
                    const newNotePath = buildPathInFolder(newFolderPath, renamedFolderNoteFileName);
                    await this.app.fileManager.renameFile(folderNote, newNotePath);
                }
            };

            const commandQueue = this.getCommandQueue();
            if (commandQueue) {
                const result = await commandQueue.executeRenameFolder(previousFolderPath, performRename);
                if (!result.success) {
                    throw result.error ?? new Error(strings.common.unknownError);
                }
            } else {
                await performRename();
            }
            return true;
        } catch (error) {
            this.notifyError(strings.fileSystem.errors.renameFolder, error);
            return false;
        }
    }

    /**
     * Opens a modal that renames the vault root display name or a folder path.
     */
    async renameFolder(folder: TFolder, settings?: NotebookNavigatorSettings): Promise<void> {
        const isRootFolder = folder.path === '/';
        const nameInputOptions = isRootFolder ? undefined : this.getNameInputModalOptions();

        const modal = new InputModal(
            this.app,
            isRootFolder ? strings.modals.fileSystem.renameVaultTitle : strings.modals.fileSystem.renameFolderTitle,
            isRootFolder ? strings.modals.fileSystem.renameVaultPrompt : strings.modals.fileSystem.renamePrompt,
            async newName => {
                if (isRootFolder) {
                    await this.renameFolderDisplayName(folder, newName, settings);
                    return;
                }

                await this.renameFolderToName(folder, newName, settings);
            },
            isRootFolder ? this.settingsProvider.settings.customVaultName : folder.name,
            nameInputOptions
        );
        modal.open();
    }

    async renameFolderDisplayName(folder: TFolder, value: string, settings?: NotebookNavigatorSettings): Promise<boolean> {
        const frontmatterTarget = this.resolveFolderFrontmatterDisplayNameTarget(folder);
        if (frontmatterTarget) {
            if (!this.hasFrontmatterDisplayNameChange(frontmatterTarget.target, value)) {
                return true;
            }

            try {
                await this.writeFrontmatterDisplayName(frontmatterTarget.file, frontmatterTarget.target, value);
                return true;
            } catch (error) {
                this.notifyError(strings.fileSystem.errors.renameFolder, error);
                return false;
            }
        }

        if (folder.path === '/') {
            const trimmed = value.trim();
            const vaultName = this.app.vault.getName();
            const isUnchanged =
                this.settingsProvider.settings.customVaultName === trimmed ||
                (!this.settingsProvider.settings.customVaultName && trimmed === vaultName);
            if (!isUnchanged) {
                const previousCustomVaultName = this.settingsProvider.settings.customVaultName;
                try {
                    this.settingsProvider.settings.customVaultName = trimmed;
                    await this.settingsProvider.saveSettingsAndUpdate();
                } catch (error) {
                    this.settingsProvider.settings.customVaultName = previousCustomVaultName;
                    this.notifyError(strings.fileSystem.errors.renameFolder, error);
                    return false;
                }
            }
            return true;
        }

        return this.renameFolderToName(folder, value, settings);
    }

    /**
     * Renames a file with user-provided name
     * Shows input modal pre-filled with current basename
     * Preserves original file extension if not provided in new name
     * @param file - The file to rename
     */
    async renameFile(file: TFile): Promise<void> {
        const defaultValue = this.getFileRenameDefaultValue(file);
        const nameInputOptions = this.getNameInputModalOptions();

        const modal = new InputModal(
            this.app,
            strings.modals.fileSystem.renameFileTitle,
            strings.modals.fileSystem.renamePrompt,
            async rawInput => {
                await this.renameFileToName(file, rawInput);
            },
            defaultValue,
            nameInputOptions
        );
        modal.open();
    }

    async renameFileDisplayName(file: TFile, rawInput: string): Promise<boolean> {
        const target = this.resolveFrontmatterDisplayNameTarget(file, this.getFileRenameDefaultValue(file));
        if (!target) {
            return this.renameFileToName(file, rawInput);
        }

        if (!this.hasFrontmatterDisplayNameChange(target, rawInput)) {
            return true;
        }

        try {
            await this.writeFrontmatterDisplayName(file, target, rawInput);
            return true;
        } catch (error) {
            this.notifyError(strings.fileSystem.errors.renameFile, error);
            return false;
        }
    }

    /**
     * Renames a file from an already-collected name while preserving its extension.
     * Returns false only when the rename attempted and failed.
     */
    async renameFileToName(file: TFile, rawInput: string): Promise<boolean> {
        const isExcalidraw = isExcalidrawFile(file);
        const extension = file.extension;
        const extensionSuffix = extension ? `.${extension}` : '';
        const trimmedInput = this.filterNameInputFinal(rawInput);
        if (!trimmedInput) {
            return true;
        }

        let finalFileName: string;

        if (isExcalidraw) {
            let workingName = trimmedInput;
            const lowerWorking = workingName.toLowerCase();

            if (extensionSuffix && lowerWorking.endsWith(extensionSuffix.toLowerCase())) {
                workingName = workingName.slice(0, -extensionSuffix.length);
            }

            workingName = stripExcalidrawSuffix(workingName);

            if (!workingName) {
                return true;
            }

            finalFileName = `${workingName}${EXCALIDRAW_BASENAME_SUFFIX}${extensionSuffix}`;
        } else {
            let workingName = trimmedInput;
            if (extensionSuffix && workingName.toLowerCase().endsWith(extensionSuffix.toLowerCase())) {
                workingName = workingName.slice(0, -extensionSuffix.length);
            }
            workingName = workingName.replace(/\.+$/u, '');
            if (!workingName) {
                return true;
            }
            finalFileName = extensionSuffix ? `${workingName}${extensionSuffix}` : workingName;
        }

        if (!finalFileName || finalFileName === file.name) {
            return true;
        }

        try {
            const parentPath = file.parent?.path ?? '/';
            const newPath = buildPathInFolder(parentPath, finalFileName);
            await this.app.fileManager.renameFile(file, newPath);
            return true;
        } catch (error) {
            this.notifyError(strings.fileSystem.errors.renameFile, error);
            return false;
        }
    }

    async deleteFolder(folder: TFolder, confirmBeforeDelete: boolean, onSuccess?: () => void): Promise<void> {
        await this.deletionService.deleteFolder(folder, confirmBeforeDelete, onSuccess);
    }

    async deleteFile(
        file: TFile,
        confirmBeforeDelete: boolean,
        onSuccess?: () => void,
        preDeleteAction?: () => Promise<void>
    ): Promise<void> {
        await this.deletionService.deleteFile(file, confirmBeforeDelete, onSuccess, preDeleteAction);
    }

    async deleteSelectedFile(
        file: TFile,
        settings: NotebookNavigatorSettings,
        selectionContext: SelectionContext,
        selectionDispatch: SelectionDispatch,
        confirmBeforeDelete: boolean,
        currentFiles?: readonly TFile[]
    ): Promise<void> {
        await this.deletionService.deleteSelectedFile(
            file,
            settings,
            selectionContext,
            selectionDispatch,
            confirmBeforeDelete,
            currentFiles
        );
    }

    /**
     * Checks if one file/folder is a descendant of another
     * Used to prevent invalid drag-and-drop operations
     * Prevents moving a folder into its own subfolder
     * @param parent - The potential parent file/folder
     * @param child - The potential descendant file/folder
     * @returns True if child is a descendant of parent
     */
    isDescendant(parent: TAbstractFile, child: TAbstractFile): boolean {
        let current = child.parent;
        while (current) {
            if (current === parent) return true;
            current = current.parent;
        }
        return false;
    }

    async moveFilesToFolder(options: MoveFilesOptions): Promise<MoveFilesResult> {
        return this.moveService.moveFilesToFolder(options);
    }

    async moveFilesWithModal(files: TFile[], selectionContext?: MoveFilesSelectionContext): Promise<void> {
        await this.moveService.moveFilesWithModal(files, selectionContext);
    }

    async moveFolderWithModal(folder: TFolder): Promise<MoveFolderModalResult> {
        return this.moveService.moveFolderWithModal(folder);
    }

    async moveFolderToTarget(folder: TFolder, targetFolder: TFolder): Promise<MoveFolderResult> {
        return this.moveService.moveFolderToTarget(folder, targetFolder);
    }

    /**
     * Renames a file to match its parent folder's folder note naming
     * @param file - The file to rename
     * @param settings - Notebook Navigator settings for folder note configuration
     */
    async setFileAsFolderNote(file: TFile, settings: NotebookNavigatorSettings): Promise<void> {
        if (!settings.enableFolderNotes) {
            return;
        }

        const parent = file.parent;
        if (!parent || !(parent instanceof TFolder)) {
            return;
        }

        const detectionSettings = getFolderNoteDetectionSettings(settings);

        if (isFolderNote(file, parent, detectionSettings)) {
            showNotice(strings.fileSystem.errors.folderNoteAlreadyLinked, { variant: 'warning' });
            return;
        }

        if (!isSupportedFolderNoteExtension(file.extension)) {
            showNotice(strings.fileSystem.errors.folderNoteUnsupportedExtension.replace('{extension}', file.extension), {
                variant: 'warning'
            });
            return;
        }

        const existingFolderNote = getFolderNote(parent, detectionSettings);
        if (existingFolderNote && existingFolderNote.path !== file.path) {
            showNotice(strings.fileSystem.errors.folderNoteAlreadyExists, { variant: 'warning' });
            return;
        }

        const isExcalidraw = isExcalidrawFile(file);
        let targetBaseName = resolveFolderNoteNameForFolder(parent, settings);
        if (isExcalidraw) {
            // Strip .excalidraw from the base name for folder note naming.
            targetBaseName = stripExcalidrawSuffix(targetBaseName);
            if (!targetBaseName) {
                return;
            }
        }

        const targetFileName = this.buildFolderNoteFileName(targetBaseName, file.extension, isExcalidraw);
        const targetPath = buildPathInFolder(parent.path, targetFileName);

        if (file.path === targetPath) {
            return;
        }

        if (this.app.vault.getAbstractFileByPath(targetPath)) {
            showNotice(strings.fileSystem.errors.folderNoteRenameConflict.replace('{name}', targetFileName), {
                variant: 'warning'
            });
            return;
        }

        try {
            await this.app.fileManager.renameFile(file, targetPath);
        } catch (error) {
            this.notifyError(strings.fileSystem.errors.renameFile, error);
        }
    }

    /**
     * Converts a single file into a folder note by creating a sibling folder and moving the file inside
     * @param file - The file to convert
     * @param settings - Notebook Navigator settings for folder note configuration
     */
    async convertFileToFolderNote(file: TFile, settings: NotebookNavigatorSettings): Promise<void> {
        // Validate folder notes are enabled
        if (!settings.enableFolderNotes) {
            showNotice(strings.fileSystem.errors.folderNotesDisabled, { variant: 'warning' });
            return;
        }

        // Validate file has a parent folder
        const parent = file.parent;
        if (!parent || !(parent instanceof TFolder)) {
            showNotice(strings.fileSystem.errors.folderNoteConversionFailed, { variant: 'warning' });
            return;
        }

        const detectionSettings = getFolderNoteDetectionSettings(settings);

        // Check if file is already acting as a folder note
        if (isFolderNote(file, parent, detectionSettings)) {
            showNotice(strings.fileSystem.errors.folderNoteAlreadyLinked, { variant: 'warning' });
            return;
        }

        // Validate file extension is supported for folder notes
        if (!isSupportedFolderNoteExtension(file.extension)) {
            showNotice(strings.fileSystem.errors.folderNoteUnsupportedExtension.replace('{extension}', file.extension), {
                variant: 'warning'
            });
            return;
        }

        const isExcalidraw = isExcalidrawFile(file);
        let folderName = file.basename;
        if (isExcalidraw) {
            // Strip .excalidraw from the basename when deriving the folder name.
            folderName = stripExcalidrawSuffix(folderName);
            if (!folderName) {
                showNotice(strings.fileSystem.errors.folderNoteConversionFailed, { variant: 'warning' });
                return;
            }
        }

        // Build target folder path using the file's basename
        const targetFolderPath = buildPathInFolder(parent.path, folderName);

        // Check if folder already exists to avoid conflicts
        if (this.app.vault.getAbstractFileByPath(targetFolderPath)) {
            showNotice(strings.fileSystem.errors.folderAlreadyExists.replace('{name}', folderName), { variant: 'warning' });
            return;
        }

        // Determine final filename based on folder note settings
        let finalBaseName = resolveFolderNoteName(folderName, settings);
        if (isExcalidraw) {
            // Strip .excalidraw from the base name for folder note naming.
            finalBaseName = stripExcalidrawSuffix(finalBaseName);
            if (!finalBaseName) {
                showNotice(strings.fileSystem.errors.folderNoteConversionFailed, { variant: 'warning' });
                return;
            }
        }

        // Create the target folder
        try {
            await this.app.vault.createFolder(targetFolderPath);
        } catch (error) {
            this.notifyError(strings.fileSystem.errors.createFolder, error);
            return;
        }

        // Verify folder was created successfully
        const targetFolder = this.app.vault.getAbstractFileByPath(targetFolderPath);
        if (!targetFolder || !(targetFolder instanceof TFolder)) {
            showNotice(strings.fileSystem.errors.folderNoteConversionFailed, { variant: 'warning' });
            return;
        }

        try {
            // Move file into the newly created folder
            const moveResult = await this.moveFilesToFolder({
                files: [file],
                targetFolder,
                showNotifications: false
            });

            // Handle move failure by cleaning up empty folder
            if (moveResult.movedCount === 0) {
                await this.removeFolderIfEmpty(targetFolder);
                const firstError = moveResult.errors[0]?.error;
                this.notifyError(strings.fileSystem.errors.folderNoteMoveFailed, firstError, strings.common.unknownError);
                return;
            }

            // Get reference to the moved file
            const movedFilePath = buildPathInFolder(targetFolder.path, file.name);
            const movedFileEntry = this.app.vault.getAbstractFileByPath(movedFilePath);
            if (!movedFileEntry || !(movedFileEntry instanceof TFile)) {
                showNotice(strings.fileSystem.errors.folderNoteConversionFailed, { variant: 'warning' });
                return;
            }
            let movedFile: TFile = movedFileEntry;

            // Rename file if folder note name setting requires it
            const finalFileName = this.buildFolderNoteFileName(finalBaseName, file.extension, isExcalidraw);
            const finalPath = buildPathInFolder(targetFolder.path, finalFileName);

            if (movedFile.path !== finalPath) {
                if (this.app.vault.getAbstractFileByPath(finalPath)) {
                    showNotice(strings.fileSystem.errors.folderNoteRenameConflict.replace('{name}', finalFileName), { variant: 'warning' });
                } else {
                    await this.app.fileManager.renameFile(movedFile, finalPath);
                    const updatedFile = this.app.vault.getAbstractFileByPath(finalPath);
                    if (updatedFile instanceof TFile) {
                        movedFile = updatedFile;
                    }
                }
            }

            // Attempt to open the folder note using command queue for proper context tracking
            const commandQueue = this.getCommandQueue();
            let opened = false;

            if (commandQueue) {
                const openResult = await commandQueue.executeOpenFolderNote(targetFolder.path, async () => {
                    await this.app.workspace.getLeaf().openFile(movedFile);
                });

                if (openResult.success) {
                    opened = true;
                } else {
                    console.error('Failed to open folder note via command queue', openResult.error);
                }
            }

            // Fallback to direct file opening if command queue unavailable or failed
            if (!opened) {
                try {
                    await this.app.workspace.getLeaf().openFile(movedFile);
                    opened = true;
                } catch (openError) {
                    console.error('Failed to open folder note after conversion', openError);
                    this.notifyError(strings.fileSystem.errors.folderNoteOpenFailed, openError);
                }
            }

            // Show success notification only if file was successfully opened
            if (opened) {
                showNotice(strings.fileSystem.notifications.folderNoteConversionSuccess.replace('{name}', targetFolder.name), {
                    variant: 'success'
                });
            }
        } catch (error) {
            // Clean up folder on any error and show error message
            await this.removeFolderIfEmpty(targetFolder);
            this.notifyError(strings.fileSystem.errors.folderNoteConversionFailedWithReason, error);
        }
    }

    /**
     * Removes a folder if it's empty
     * Used for cleanup after failed folder note conversion
     * @param folder - The folder to remove if empty
     */
    private async removeFolderIfEmpty(folder: TFolder): Promise<void> {
        if (folder.children.length > 0) {
            return;
        }

        try {
            await this.app.fileManager.trashFile(folder);
        } catch (error) {
            console.error('Failed to remove folder after conversion failure', error);
        }
    }

    /**
     * Duplicates a file with an incremented name
     * @param file - The file to duplicate
     */
    async duplicateNote(file: TFile): Promise<void> {
        try {
            const baseName = file.basename;
            const extension = file.extension;
            const parentPath = file.parent?.path ?? '/';
            const newName = generateUniqueFilename(parentPath, baseName, extension, this.app);
            const newPath = buildFilePathInFolder(parentPath, newName, extension);

            const newFile = await this.app.vault.copy(file, newPath);

            if (newFile instanceof TFile) {
                await this.app.workspace.getLeaf(false).openFile(newFile);
            }
        } catch (error) {
            this.notifyError(strings.fileSystem.errors.duplicateNote, error);
        }
    }

    /**
     * Creates a new canvas file in the specified folder
     * @param parent - The parent folder
     */
    async createCanvas(parent: TFolder): Promise<TFile | null> {
        return createFileWithOptions(parent, this.app, {
            extension: 'canvas',
            content: '{}',
            errorKey: 'createCanvas'
        });
    }

    /**
     * Creates a new database view file in the specified folder
     * @param parent - The parent folder
     */
    async createBase(parent: TFolder): Promise<TFile | null> {
        return createFileWithOptions(parent, this.app, {
            extension: 'base',
            content: createDatabaseContent(),
            errorKey: 'createDatabase'
        });
    }

    /**
     * Duplicates a folder and all its contents
     * @param folder - The folder to duplicate
     */
    async duplicateFolder(folder: TFolder): Promise<void> {
        try {
            const baseName = folder.name;
            let counter = 1;
            let newName = `${baseName} ${counter}`;
            const parentPath = folder.parent?.path ?? '/';
            let newPath = buildPathInFolder(parentPath, newName);

            while (this.app.vault.getFolderByPath(newPath)) {
                counter++;
                newName = `${baseName} ${counter}`;
                newPath = buildPathInFolder(parentPath, newName);
            }

            await this.app.vault.copy(folder, newPath);
            await this.folderPathSettingsSync.copyFolderDisplayMetadata(folder.path, newPath);
        } catch (error) {
            this.notifyError(strings.fileSystem.errors.duplicateFolder, error);
        }
    }

    async deleteMultipleFiles(files: TFile[], confirmBeforeDelete = true, preDeleteAction?: () => void | Promise<void>): Promise<void> {
        await this.deletionService.deleteMultipleFiles(files, confirmBeforeDelete, preDeleteAction);
    }

    async trashFilesWithOpenLeafCleanup(files: readonly TFile[]): Promise<FileTrashResult> {
        return this.deletionService.trashFilesWithOpenLeafCleanup(files);
    }

    async deleteFilesWithSmartSelection(
        selectedFiles: Set<string>,
        allFiles: readonly TFile[],
        selectionDispatch: SelectionDispatch,
        confirmBeforeDelete: boolean
    ): Promise<void> {
        await this.deletionService.deleteFilesWithSmartSelection(selectedFiles, allFiles, selectionDispatch, confirmBeforeDelete);
    }

    /**
     * Opens version history for a file using Obsidian Sync.
     *
     * The version history modal requires the editor to have focus when the command executes.
     * The Notebook Navigator's aggressive focus management can interfere with this.
     *
     * Solution:
     * 1. Track the operation to prevent the navigator from stealing focus
     * 2. Always use openLinkText to open/re-open the file (ensures proper editor focus)
     * 3. Wait briefly for the editor to be ready
     * 4. Execute the version history command
     *
     * @param file - The file to view version history for
     */
    async openVersionHistory(file: TFile): Promise<void> {
        const commandQueue = this.getCommandQueue();
        if (!commandQueue) {
            showNotice(strings.fileSystem.errors.versionHistoryNotAvailable, { variant: 'warning' });
            return;
        }

        const result = await commandQueue.executeOpenVersionHistory(file, async () => {
            // Always open/re-open the file to ensure proper focus
            await this.app.workspace.openLinkText(file.path, '', false);

            // Small delay to ensure the editor is ready
            await new Promise(resolve => window.setTimeout(resolve, TIMEOUTS.FILE_OPERATION_DELAY));

            // Execute the version history command
            if (!executeCommand(this.app, OBSIDIAN_COMMANDS.VERSION_HISTORY)) {
                showNotice(strings.fileSystem.errors.versionHistoryNotFound, { variant: 'warning' });
            }
        });

        if (!result.success && result.error) {
            this.notifyError(strings.fileSystem.errors.openVersionHistory, result.error);
        }
    }

    /**
     * Gets the platform-specific text for the "Reveal in system explorer" menu option
     * @returns The appropriate text based on the current platform
     */
    getRevealInSystemExplorerText(): string {
        if (Platform.isMacOS) {
            return strings.contextMenu.file.revealInFinder;
        }
        return strings.contextMenu.file.showInExplorer;
    }

    /**
     * Reveals a file or folder in the system's file explorer
     * @param file - The file or folder to reveal
     */
    async revealInSystemExplorer(file: TFile | TFolder): Promise<void> {
        try {
            // Use Obsidian's built-in method to reveal the file or folder
            // Note: showInFolder is not in Obsidian's public TypeScript API, but is widely used by plugins
            // showInFolder expects the vault-relative path, not the full system path
            if (!this.hasShowInFolder(this.app)) {
                showNotice(strings.fileSystem.errors.revealInExplorer, { variant: 'warning' });
                return;
            }
            await this.app.showInFolder(file.path);
        } catch (error) {
            this.notifyError(strings.fileSystem.errors.revealInExplorer, error);
        }
    }

    /**
     * Opens a file or folder in the operating system default app
     * @param file - The file or folder to open
     */
    async openInDefaultApp(file: TFile | TFolder): Promise<void> {
        if (Platform.isMobile) {
            showNotice(strings.fileSystem.errors.openInDefaultAppNotAvailable, { variant: 'warning' });
            return;
        }

        const adapter = this.app.vault.adapter;
        if (!(adapter instanceof FileSystemAdapter)) {
            showNotice(strings.fileSystem.errors.openInDefaultAppNotAvailable, { variant: 'warning' });
            return;
        }

        const shell = this.getElectronShell();
        if (!shell) {
            showNotice(strings.fileSystem.errors.openInDefaultAppNotAvailable, { variant: 'warning' });
            return;
        }

        const absolutePath = adapter.getFullPath(file.path);

        try {
            const shellResult = await shell.openPath(absolutePath);
            if (shellResult.trim().length > 0) {
                this.notifyError(strings.fileSystem.errors.openInDefaultApp, shellResult);
            }
        } catch (error) {
            this.notifyError(strings.fileSystem.errors.openInDefaultApp, error);
        }
    }

    /** Type guard checking if the app exposes the showInFolder method */
    private hasShowInFolder(app: App): app is ExtendedApp {
        const showInFolder: unknown = Reflect.get(app, 'showInFolder');
        return typeof showInFolder === 'function';
    }

    /** Returns the Electron shell module when available in desktop runtime */
    private getElectronShell(): ElectronShell | null {
        if (typeof window === 'undefined') {
            return null;
        }

        const runtimeWindow: unknown = window;
        if (!this.hasWindowRequire(runtimeWindow)) {
            return null;
        }

        try {
            const electronModule = runtimeWindow.require('electron');
            if (!this.hasElectronModule(electronModule)) {
                return null;
            }
            return electronModule.shell;
        } catch {
            return null;
        }
    }

    /** Type guard checking if the runtime window exposes CommonJS require */
    private hasWindowRequire(value: unknown): value is WindowWithRequire {
        if (typeof value !== 'object' || value === null) {
            return false;
        }

        const requireFn: unknown = Reflect.get(value, 'require');
        return typeof requireFn === 'function';
    }

    /** Type guard checking if a value exposes Electron shell methods */
    private hasElectronModule(value: unknown): value is ElectronModule {
        if (typeof value !== 'object' || value === null) {
            return false;
        }

        const shell: unknown = Reflect.get(value, 'shell');
        return this.hasElectronShell(shell);
    }

    /** Type guard checking if a value is an Electron shell object */
    private hasElectronShell(value: unknown): value is ElectronShell {
        if (typeof value !== 'object' || value === null) {
            return false;
        }

        const openPath: unknown = Reflect.get(value, 'openPath');
        return typeof openPath === 'function';
    }

    /**
     * Creates a new drawing in the specified folder
     * Supports Excalidraw and Tldraw
     * @param parent - The parent folder to create the drawing in
     * @param type - Drawing provider to use
     * @returns The created file or null if creation failed
     */
    async createNewDrawing(parent: TFolder, type: DrawingType = 'excalidraw'): Promise<TFile | null> {
        try {
            const pluginFile = await createDrawingWithPlugin(this.app, parent, type);
            if (pluginFile) {
                return pluginFile;
            }

            const allowCompatibilitySuffix = type !== 'excalidraw';
            const filePath = getDrawingFilePath(this.app, parent, type, { allowCompatibilitySuffix });
            const content = getDrawingTemplate(type);

            const file = await this.app.vault.create(filePath, content);

            const leaf = this.app.workspace.getLeaf(false);
            await leaf.openFile(file);

            await this.trySwitchToDrawingView(leaf, file, type);

            return file;
        } catch (error) {
            const message = getErrorMessage(error);
            if (message.includes('already exists')) {
                showNotice(strings.fileSystem.errors.drawingAlreadyExists, { variant: 'warning' });
            } else {
                showNotice(strings.fileSystem.errors.failedToCreateDrawing, { variant: 'warning' });
            }
            return null;
        }
    }

    /**
     * Returns the view type identifier for the drawing plugin, or null if plugin is not installed
     */
    private getDrawingViewType(type: DrawingType): string | null {
        if (type === 'excalidraw' && isPluginInstalled(this.app, EXCALIDRAW_PLUGIN_ID)) {
            return 'excalidraw';
        }

        if (type === 'tldraw' && isPluginInstalled(this.app, TLDRAW_PLUGIN_ID)) {
            return 'tldraw-view';
        }

        return null;
    }

    /**
     * Attempts to switch the leaf view state to the drawing plugin's view
     */
    private async trySwitchToDrawingView(leaf: WorkspaceLeaf, file: TFile, type: DrawingType): Promise<void> {
        const viewType = this.getDrawingViewType(type);
        if (!viewType) {
            return;
        }

        const viewState: ViewState = {
            type: viewType,
            state: { file: file.path }
        };

        try {
            await leaf.setViewState(viewState);
        } catch (error: unknown) {
            console.error('Failed to switch drawing view', { viewType, error });
        }
    }
}
