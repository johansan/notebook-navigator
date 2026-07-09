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

import { FileView, TFile, TFolder, type WorkspaceLeaf } from 'obsidian';
import type NotebookNavigatorPlugin from '../../main';
import { getCurrentLanguage, strings } from '../../i18n';
import {
    createDailyNote,
    getDailyNoteFile,
    getDailyNoteFilename,
    getDailyNoteSettings as getCoreDailyNoteSettings
} from '../../utils/dailyNotes';
import {
    buildCustomCalendarFilePathForPattern,
    buildCustomCalendarMomentPattern,
    createCalendarMarkdownFile,
    getCalendarNoteConfig,
    getCalendarTemplatePath,
    resolveCalendarCustomNotePathDate,
    type CalendarNoteKind
} from '../../utils/calendarNotes';
import { getFolderNote, getFolderNoteDetectionSettings, isFolderNote, isSupportedFolderNoteExtension } from '../../utils/folderNoteLookup';
import { createFrontmatterPropertyExclusionMatcher, isFolderInExcludedFolder, shouldExcludeFileWithMatcher } from '../../utils/fileFilters';
import { getEffectiveFrontmatterExclusions } from '../../utils/exclusionUtils';
import { runAsyncAction } from '../../utils/async';
import {
    getMomentApi,
    resolveCalendarLocales,
    resolveCalendarPeriodicNotesLocale,
    resolveDailyNoteLocale,
    type MomentInstance
} from '../../utils/moment';
import type { NotebookNavigatorView } from '../../view/NotebookNavigatorView';
import { isNotebookNavigatorView } from '../../view/viewGuards';
import { getActiveHiddenFolders, getActiveVaultProfile } from '../../utils/vaultProfiles';
import { showNotice } from '../../utils/noticeUtils';
import { ConfirmModal } from '../../modals/ConfirmModal';
import { SelectVaultProfileModal } from '../../modals/SelectVaultProfileModal';
import { localStorage } from '../../utils/localStorage';
import {
    ItemType,
    NOTEBOOK_NAVIGATOR_VIEW,
    PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
    STORAGE_KEYS,
    type VisibilityPreferences
} from '../../types';
import { normalizeTagPath } from '../../utils/tagUtils';
import { isNoteShortcut, type ShortcutEntry } from '../../types/shortcuts';
import { getTemplaterCreateNewNoteFromTemplate } from '../../utils/templaterIntegration';
import { getLeafSplitLocation } from '../../utils/workspaceSplit';
import { openFileInContext } from '../../utils/openFileInContext';
import { resolveNoteShortcutTarget } from '../../utils/shortcutPathResolver';
import {
    canRestorePropertySelectionNodeId,
    isPropertySelectionNodeIdConfigured,
    isPropertySelectionNodeIdVisibleInNavigation,
    isPropertyTreeNodeId,
    parseStoredPropertySelectionNodeId,
    type PropertySelectionNodeId
} from '../../utils/propertyTree';
import { getAdjacentFile, getFilesForNavigationSelection, getPinnedSectionCollapseKey } from '../../utils/selectionUtils';

/**
 * Reveals the navigator view and focuses whichever pane is currently visible
 * @param plugin - The plugin instance
 */
async function focusNavigatorVisiblePane(plugin: NotebookNavigatorPlugin, existingLeaves?: WorkspaceLeaf[]): Promise<void> {
    const navigatorLeaves = existingLeaves ?? plugin.getNavigatorLeaves();
    if (navigatorLeaves.length > 0) {
        const leaf = navigatorLeaves[0];
        const previousActiveLeaf = getLeafToRestoreAfterNavigatorFocus(plugin, leaf);
        await plugin.app.workspace.revealLeaf(leaf);
        const view = leaf.view;
        if (isNotebookNavigatorView(view)) {
            view.focusVisiblePane();
            if (previousActiveLeaf) {
                plugin.app.workspace.setActiveLeaf(previousActiveLeaf, { focus: false });
            }
        }
    }
}

function getLeafViewType(leaf: WorkspaceLeaf): string | null {
    try {
        return leaf.view.getViewType();
    } catch {
        return null;
    }
}

function isNavigatorLeaf(leaf: WorkspaceLeaf): boolean {
    const view = leaf.view;
    return isNotebookNavigatorView(view) || getLeafViewType(leaf) === NOTEBOOK_NAVIGATOR_VIEW;
}

function isRestorableMainLeaf(
    plugin: NotebookNavigatorPlugin,
    leaf: WorkspaceLeaf | null,
    navigatorLeaf: WorkspaceLeaf
): leaf is WorkspaceLeaf {
    if (!leaf || leaf === navigatorLeaf || isNavigatorLeaf(leaf)) {
        return false;
    }

    return getLeafSplitLocation(plugin.app, leaf) === 'main';
}

function getLeafToRestoreAfterNavigatorFocus(plugin: NotebookNavigatorPlugin, navigatorLeaf: WorkspaceLeaf): WorkspaceLeaf | null {
    const activeFileLeaf = plugin.app.workspace.getActiveViewOfType(FileView)?.leaf ?? null;
    if (activeFileLeaf && activeFileLeaf !== navigatorLeaf && !isNavigatorLeaf(activeFileLeaf)) {
        return activeFileLeaf;
    }

    const recentMainLeaf = plugin.app.workspace.getMostRecentLeaf(plugin.app.workspace.rootSplit);
    if (isRestorableMainLeaf(plugin, recentMainLeaf, navigatorLeaf)) {
        return recentMainLeaf;
    }

    let fallbackMainLeaf: WorkspaceLeaf | null = null;
    plugin.app.workspace.iterateAllLeaves((candidateLeaf: WorkspaceLeaf) => {
        if (!fallbackMainLeaf && isRestorableMainLeaf(plugin, candidateLeaf, navigatorLeaf)) {
            fallbackMainLeaf = candidateLeaf;
        }
    });

    return fallbackMainLeaf;
}

/**
 * Opens the navigator view if not already open, otherwise reveals the existing view
 * @param plugin - The plugin instance
 * @returns The workspace leaf containing the navigator view
 */
async function ensureNavigatorOpen(
    plugin: NotebookNavigatorPlugin,
    existingLeaves?: WorkspaceLeaf[]
): Promise<NotebookNavigatorView | null> {
    const navigatorLeaves = existingLeaves ?? plugin.getNavigatorLeaves();
    if (navigatorLeaves.length > 0) {
        const leaf = navigatorLeaves[0];
        await plugin.app.workspace.revealLeaf(leaf);
        const view = leaf.view;
        return isNotebookNavigatorView(view) ? view : null;
    }

    const createdLeaf = await plugin.activateView();
    if (!createdLeaf) {
        return null;
    }
    const view = createdLeaf.view;
    return isNotebookNavigatorView(view) ? view : null;
}

/**
 * Returns the existing navigator view without revealing or opening it.
 * Used for commands that should not force the navigator to become visible.
 */
function getNavigatorViewIfMounted(plugin: NotebookNavigatorPlugin, existingLeaves?: WorkspaceLeaf[]): NotebookNavigatorView | null {
    const navigatorLeaves = existingLeaves ?? plugin.getNavigatorLeaves();
    if (navigatorLeaves.length === 0) {
        return null;
    }

    const leaf = navigatorLeaves[0];
    const view = leaf.view;
    return isNotebookNavigatorView(view) ? view : null;
}

/**
 * Selects the adjacent file based on persisted navigation context without opening the navigator view.
 */
interface CommandNavigationSelectionScope {
    selectionType: 'folder' | 'tag' | 'property' | null;
    selectedFolder: TFolder | null;
    selectedTag: string | null;
    selectedProperty: PropertySelectionNodeId | null;
}

function getCommandVisibility(plugin: NotebookNavigatorPlugin): VisibilityPreferences {
    const uxPreferences = plugin.getUXPreferences();
    return {
        includeDescendantNotes: uxPreferences.includeDescendantNotes,
        showHiddenItems: uxPreferences.showHiddenItems
    };
}

function getFilesForCommandSelection(plugin: NotebookNavigatorPlugin, selectionScope: CommandNavigationSelectionScope): TFile[] {
    return getFilesForNavigationSelection(
        selectionScope,
        plugin.settings,
        getCommandVisibility(plugin),
        plugin.app,
        plugin.tagTreeService,
        plugin.propertyTreeService
    );
}

function resolveStoredCommandSelection(plugin: NotebookNavigatorPlugin, currentFile: TFile | null): CommandNavigationSelectionScope {
    const vault = plugin.app.vault;
    let selectedProperty: PropertySelectionNodeId | null = null;
    let selectedTag: string | null = null;
    let selectedFolder: TFolder | null = null;

    if (plugin.settings.showProperties) {
        try {
            const savedPropertyRaw = localStorage.get<unknown>(STORAGE_KEYS.selectedPropertyKey);
            selectedProperty = parseStoredPropertySelectionNodeId(savedPropertyRaw);
            if (selectedProperty && !canRestorePropertySelectionNodeId(plugin.settings, selectedProperty)) {
                selectedProperty = null;
                try {
                    localStorage.remove(STORAGE_KEYS.selectedPropertyKey);
                } catch (error) {
                    console.error('Failed to clear invalid selected property from localStorage:', error);
                }
            }
        } catch (error) {
            console.error('Failed to load selected property from localStorage:', error);
        }
    }

    if (!selectedProperty) {
        try {
            const savedTag = localStorage.get<string>(STORAGE_KEYS.selectedTagKey);
            selectedTag = normalizeTagPath(savedTag);
        } catch (error) {
            console.error('Failed to load selected tag from localStorage:', error);
        }
    }

    if (!selectedProperty && !selectedTag) {
        try {
            const savedFolderPath = localStorage.get<string>(STORAGE_KEYS.selectedFolderKey);
            if (savedFolderPath) {
                const folder = vault.getFolderByPath(savedFolderPath);
                if (folder) {
                    selectedFolder = folder;
                }
            }
        } catch (error) {
            console.error('Failed to load selected folder from localStorage:', error);
        }
    }

    if (selectedProperty) {
        return {
            selectionType: ItemType.PROPERTY,
            selectedFolder: null,
            selectedTag: null,
            selectedProperty
        };
    }

    if (selectedTag) {
        return {
            selectionType: ItemType.TAG,
            selectedFolder: null,
            selectedTag,
            selectedProperty: null
        };
    }

    const fallbackFolder = selectedFolder ?? (currentFile && currentFile.parent instanceof TFolder ? currentFile.parent : vault.getRoot());
    return {
        selectionType: ItemType.FOLDER,
        selectedFolder: fallbackFolder,
        selectedTag: null,
        selectedProperty: null
    };
}

async function selectAdjacentFileWithoutNavigatorView(plugin: NotebookNavigatorPlugin, direction: 'next' | 'previous'): Promise<boolean> {
    const app = plugin.app;
    const vault = app.vault;

    let currentFile: TFile | null = app.workspace.getActiveFile();

    if (!currentFile) {
        try {
            const savedFilePath = localStorage.get<string>(STORAGE_KEYS.selectedFileKey);
            if (savedFilePath) {
                const savedFile = vault.getFileByPath(savedFilePath);
                if (savedFile) {
                    currentFile = savedFile;
                }
            }
        } catch (error) {
            console.error('Failed to load selected file from localStorage:', error);
        }
    }

    const selectionScope = resolveStoredCommandSelection(plugin, currentFile);
    const files = getFilesForCommandSelection(plugin, selectionScope);

    if (files.length === 0) {
        return false;
    }

    const targetFile = getAdjacentFile(files, currentFile, direction);
    if (!targetFile) {
        return false;
    }
    const leaf = app.workspace.getLeaf(false);
    if (!leaf) {
        return false;
    }

    try {
        await leaf.openFile(targetFile, { active: true });
    } catch (error) {
        console.error(`Failed to open ${direction} file:`, error);
        return false;
    }

    try {
        localStorage.set(STORAGE_KEYS.selectedFileKey, targetFile.path);
        localStorage.set(STORAGE_KEYS.selectedFilesKey, [targetFile.path]);
    } catch (error) {
        console.error('Failed to persist selected file to localStorage:', error);
    }

    return true;
}

const OPEN_ALL_FILES_WARNING_THRESHOLD = 15;

/**
 * Returns the selected folder from navigator state
 */
function getSelectedFolderForCommand(plugin: NotebookNavigatorPlugin): TFolder | null {
    const api = plugin.api;
    if (!api) {
        return null;
    }

    const navItem = api.selection.getNavItem();
    return navItem.folder instanceof TFolder ? navItem.folder : null;
}

/**
 * Returns the selected tag from navigator state
 */
function getSelectedTagForCommand(plugin: NotebookNavigatorPlugin): string | null {
    const api = plugin.api;
    if (!api) {
        return null;
    }

    const navItem = api.selection.getNavItem();
    return normalizeTagPath(navItem.tag);
}

function getSelectedPropertyForCommand(plugin: NotebookNavigatorPlugin): PropertySelectionNodeId | null {
    if (!plugin.settings.showProperties) {
        return null;
    }

    const api = plugin.api;
    if (!api) {
        return null;
    }

    const navItem = api.selection.getNavItem();
    const selectedProperty = navItem.property ?? null;
    if (!selectedProperty) {
        return null;
    }

    if (selectedProperty === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
        return selectedProperty;
    }

    if (!isPropertyTreeNodeId(selectedProperty)) {
        return null;
    }

    if (!isPropertySelectionNodeIdConfigured(plugin.settings, selectedProperty)) {
        return null;
    }

    return isPropertySelectionNodeIdVisibleInNavigation(plugin.settings, selectedProperty) ? selectedProperty : null;
}

function resolveOpenAllFilesContext(plugin: NotebookNavigatorPlugin): CommandNavigationSelectionScope {
    const selectedProperty = getSelectedPropertyForCommand(plugin);
    if (selectedProperty) {
        return {
            selectionType: ItemType.PROPERTY,
            selectedFolder: null,
            selectedTag: null,
            selectedProperty
        };
    }

    const selectedTag = getSelectedTagForCommand(plugin);
    if (selectedTag) {
        return {
            selectionType: ItemType.TAG,
            selectedFolder: null,
            selectedTag,
            selectedProperty: null
        };
    }

    const selectedFolder = getSelectedFolderForCommand(plugin);
    if (selectedFolder) {
        return {
            selectionType: ItemType.FOLDER,
            selectedFolder,
            selectedTag: null,
            selectedProperty: null
        };
    }

    const activeFile = plugin.app.workspace.getActiveFile();
    const parent = activeFile?.parent;
    if (parent instanceof TFolder) {
        return {
            selectionType: ItemType.FOLDER,
            selectedFolder: parent,
            selectedTag: null,
            selectedProperty: null
        };
    }

    return {
        selectionType: null,
        selectedFolder: null,
        selectedTag: null,
        selectedProperty: null
    };
}

function getPinnedCollapseKeyForCommand(plugin: NotebookNavigatorPlugin) {
    return getPinnedSectionCollapseKey(resolveOpenAllFilesContext(plugin));
}

function getOpenAllFilesConfirmTitle(fileCount: number): string {
    const label = fileCount === 1 ? strings.tooltips.file : strings.tooltips.files;
    return `${strings.commands.open} ${fileCount.toString()} ${label}?`;
}

async function openAllFilesInCurrentFolderOrTag(plugin: NotebookNavigatorPlugin): Promise<void> {
    const context = resolveOpenAllFilesContext(plugin);
    if (!context.selectionType) {
        showNotice(strings.common.noSelection, { variant: 'warning' });
        return;
    }

    const files = getFilesForCommandSelection(plugin, context);
    if (files.length === 0) {
        showNotice(strings.listPane.emptyStateNoNotes, { variant: 'warning' });
        return;
    }

    const openFiles = async () => {
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            await openFileInContext({
                app: plugin.app,
                commandQueue: plugin.commandQueue,
                file,
                context: 'tab',
                active: index === files.length - 1
            });
        }
    };

    if (files.length >= OPEN_ALL_FILES_WARNING_THRESHOLD) {
        new ConfirmModal(plugin.app, getOpenAllFilesConfirmTitle(files.length), '', openFiles, strings.commands.open, {
            confirmButtonClass: 'mod-cta'
        }).open();
        return;
    }

    await openFiles();
}

/**
 * Returns the profile ID at the specified zero-based index, or null if it doesn't exist
 */
function getVaultProfileIdAtIndex(plugin: NotebookNavigatorPlugin, index: number): string | null {
    const profiles = Array.isArray(plugin.settings.vaultProfiles) ? plugin.settings.vaultProfiles : [];
    if (index < 0 || index >= profiles.length) {
        return null;
    }
    const profile = profiles[index];
    return profile?.id ?? null;
}

/**
 * Opens the modal that lists all vault profiles for manual selection
 */
function openVaultProfilePicker(plugin: NotebookNavigatorPlugin): void {
    const modal = new SelectVaultProfileModal(plugin.app, {
        profiles: plugin.settings.vaultProfiles ?? [],
        activeProfileId: plugin.settings.vaultProfile,
        onSelect: profileId => plugin.setVaultProfile(profileId)
    });
    modal.open();
}

async function openFileInActiveLeaf(plugin: NotebookNavigatorPlugin, file: TFile): Promise<void> {
    const getLeaf = () => plugin.app.workspace.getLeaf(false);

    const openFile = async (leaf: WorkspaceLeaf | null) => {
        if (!leaf) {
            return;
        }
        await leaf.openFile(file, { active: true });
    };

    if (plugin.commandQueue) {
        await plugin.commandQueue.executeOpenActiveFile(file, openFile, { active: true, getLeaf });
        return;
    }

    await openFile(getLeaf());
}

async function createAndOpenCustomCalendarNote(plugin: NotebookNavigatorPlugin, kind: CalendarNoteKind, date: MomentInstance) {
    const config = getCalendarNoteConfig(kind, plugin.settings);
    const settings = { calendarCustomRootFolder: getActiveVaultProfile(plugin.settings).periodicNotesFolder };
    const templatePath = getCalendarTemplatePath(kind, plugin.settings);

    const { folderPath, fileName, filePath } = buildCustomCalendarFilePathForPattern(
        date,
        settings,
        config.calendarCustomFilePattern,
        config.fallbackPattern
    );

    const existing = plugin.app.vault.getAbstractFileByPath(filePath);
    if (existing instanceof TFile) {
        await openFileInActiveLeaf(plugin, existing);
        return;
    }

    let created: TFile;
    try {
        created = await createCalendarMarkdownFile(plugin.app, folderPath, fileName, templatePath);
    } catch (error) {
        console.error('Failed to create calendar note', error);
        showNotice(strings.common.unknownError, { variant: 'warning' });
        return;
    }

    await openFileInActiveLeaf(plugin, created);
}

async function openCalendarNoteForToday(plugin: NotebookNavigatorPlugin, kind: CalendarNoteKind): Promise<void> {
    const momentApi = getMomentApi();
    if (!momentApi) {
        showNotice(strings.common.unknownError, { variant: 'warning' });
        return;
    }

    const currentLanguage = getCurrentLanguage();
    const { calendarRulesLocale } = resolveCalendarLocales(plugin.settings.calendarLocale, momentApi, currentLanguage);
    const periodicNotesLocale = resolveCalendarPeriodicNotesLocale(
        plugin.settings.calendarPeriodicNotesLocaleSource,
        calendarRulesLocale,
        momentApi
    );
    const date: MomentInstance = momentApi().startOf('day');

    if (kind === 'day' && plugin.settings.calendarIntegrationMode === 'daily-notes') {
        const dailyNoteSettings = getCoreDailyNoteSettings(plugin.app);
        if (!dailyNoteSettings) {
            showNotice(strings.navigationCalendar.dailyNotesNotEnabled, { variant: 'warning' });
            return;
        }

        const dailyNoteDate = date.clone().locale(resolveDailyNoteLocale(momentApi));
        const file = getDailyNoteFile(plugin.app, dailyNoteDate, dailyNoteSettings);
        if (!file) {
            const filename = getDailyNoteFilename(dailyNoteDate, dailyNoteSettings);

            const createFile = async () => {
                const created = await createDailyNote(plugin.app, dailyNoteDate, dailyNoteSettings);
                if (!created) {
                    return;
                }
                await openFileInActiveLeaf(plugin, created);
            };

            if (plugin.settings.calendarConfirmBeforeCreate) {
                new ConfirmModal(
                    plugin.app,
                    strings.navigationCalendar.createDailyNote.title,
                    strings.navigationCalendar.createDailyNote.message.replace('{filename}', filename),
                    () => {
                        runAsyncAction(createFile);
                    },
                    strings.navigationCalendar.createDailyNote.confirmButton,
                    { confirmButtonClass: 'mod-cta' }
                ).open();
                return;
            }

            await createFile();
            return;
        }

        await openFileInActiveLeaf(plugin, file);
        return;
    }

    const config = getCalendarNoteConfig(kind, plugin.settings);
    const momentPattern = buildCustomCalendarMomentPattern(config.calendarCustomFilePattern, config.fallbackPattern);
    if (!config.isPatternValid(momentPattern, momentApi)) {
        showNotice(config.parsingErrorText, { variant: 'warning' });
        return;
    }

    const dateForPath = resolveCalendarCustomNotePathDate(kind, date, momentPattern, periodicNotesLocale, periodicNotesLocale);

    const settings = { calendarCustomRootFolder: getActiveVaultProfile(plugin.settings).periodicNotesFolder };
    const expected = buildCustomCalendarFilePathForPattern(dateForPath, settings, config.calendarCustomFilePattern, config.fallbackPattern);
    const fileEntry = plugin.app.vault.getAbstractFileByPath(expected.filePath);
    const file = fileEntry instanceof TFile ? fileEntry : null;
    if (!file) {
        const createFile = () => runAsyncAction(() => createAndOpenCustomCalendarNote(plugin, kind, dateForPath));

        if (plugin.settings.calendarConfirmBeforeCreate) {
            new ConfirmModal(
                plugin.app,
                strings.paneHeader.newNote,
                strings.navigationCalendar.createDailyNote.message.replace('{filename}', expected.filePath),
                createFile,
                strings.navigationCalendar.createDailyNote.confirmButton,
                { confirmButtonClass: 'mod-cta' }
            ).open();
            return;
        }

        createFile();
        return;
    }

    await openFileInActiveLeaf(plugin, file);
}

/**
 * Registers all navigator commands with the plugin
 */
export default function registerNavigatorCommands(plugin: NotebookNavigatorPlugin): void {
    // Command to open the navigator or focus it if already open
    plugin.addCommand({
        id: 'open',
        name: strings.commands.open,
        callback: () => {
            // Wrap async operations with error handling
            runAsyncAction(async () => {
                const navigatorLeaves = plugin.getNavigatorLeaves();
                if (navigatorLeaves.length > 0) {
                    await focusNavigatorVisiblePane(plugin, navigatorLeaves);
                    return;
                }
                await plugin.activateView();
            });
        }
    });

    // Command to toggle the left sidebar, opening Notebook Navigator when uncollapsing
    plugin.addCommand({
        id: 'toggle-left-sidebar',
        name: strings.commands.toggleLeftSidebar,
        callback: () => {
            runAsyncAction(async () => {
                const { workspace } = plugin.app;
                const leftSplit = workspace.leftSplit;
                if (leftSplit && !leftSplit.collapsed) {
                    leftSplit.collapse();
                    return;
                }

                const navigatorLeaves = plugin.getNavigatorLeaves();
                const leftSidebarNavigatorLeaf = navigatorLeaves.find(leaf => {
                    return getLeafSplitLocation(plugin.app, leaf) === 'left-sidebar';
                });

                if (leftSidebarNavigatorLeaf) {
                    await focusNavigatorVisiblePane(plugin, [leftSidebarNavigatorLeaf]);
                    return;
                }

                const leftLeaf = workspace.getLeftLeaf(false);
                if (!leftLeaf) {
                    return;
                }

                await leftLeaf.setViewState({ type: NOTEBOOK_NAVIGATOR_VIEW, active: true });
                await workspace.revealLeaf(leftLeaf);
                const view = leftLeaf.view;
                if (isNotebookNavigatorView(view)) {
                    view.focusVisiblePane();
                }
            });
        }
    });

    // Command to open the configured homepage file
    plugin.addCommand({
        id: 'open-homepage',
        name: strings.commands.openHomepage,
        checkCallback: (checking: boolean) => {
            if (!plugin.canOpenHomepage()) {
                return false;
            }

            if (!checking) {
                // Execute homepage opening with error handling
                runAsyncAction(() => plugin.openHomepage('command'));
            }

            return true;
        }
    });

    // Command to reveal the currently active file in the navigator
    plugin.addCommand({
        id: 'reveal-file',
        name: strings.commands.revealFile,
        checkCallback: (checking: boolean) => {
            const activeFile = plugin.app.workspace.getActiveFile();
            if (activeFile && activeFile.parent) {
                if (!checking) {
                    // Wrap file reveal with error handling
                    runAsyncAction(async () => {
                        await plugin.activateView();
                        await plugin.revealFileInActualFolder(activeFile, { showHiddenFileNotice: true });
                    });
                }
                return true;
            }
            return false;
        }
    });

    // Command to open all files in the currently selected folder, tag, or property scope
    plugin.addCommand({
        id: 'open-all-files',
        name: strings.commands.openAllFiles,
        checkCallback: (checking: boolean) => {
            const context = resolveOpenAllFilesContext(plugin);
            if (!context.selectionType) {
                return false;
            }

            if (checking) {
                return true;
            }

            runAsyncAction(() => openAllFilesInCurrentFolderOrTag(plugin));
            return true;
        }
    });

    // Command to toggle showing descendant files in folders
    plugin.addCommand({
        id: 'toggle-descendants',
        name: strings.commands.toggleDescendants,
        callback: () => {
            // Wrap toggle with error handling
            runAsyncAction(async () => {
                await plugin.activateView();
                plugin.toggleIncludeDescendantNotes();
            });
        }
    });

    // Command to toggle showing hidden files and folders
    plugin.addCommand({
        id: 'toggle-hidden',
        name: strings.commands.toggleHidden,
        callback: () => {
            // Wrap toggle with error handling
            runAsyncAction(async () => {
                await plugin.activateView();
                plugin.toggleShowHiddenItems();
            });
        }
    });

    // Command to toggle between alphabetical and frequency tag sorting
    plugin.addCommand({
        id: 'toggle-tag-sort',
        name: strings.commands.toggleTagSort,
        callback: () => {
            // Wrap sort toggle with error handling
            runAsyncAction(async () => {
                await plugin.activateView();
                const nextSort = plugin.getTagSortOrder() === 'frequency-desc' ? 'alpha-asc' : 'frequency-desc';
                plugin.setTagSortOrder(nextSort);
            });
        }
    });

    // Command to toggle filtering the tags section by the current navigation selection
    plugin.addCommand({
        id: 'toggle-tags-by-selection',
        name: strings.commands.toggleTagsBySelection,
        callback: () => {
            runAsyncAction(async () => {
                await plugin.activateView();
                plugin.settings.scopeTagsToCurrentContext = !plugin.settings.scopeTagsToCurrentContext;
                await plugin.saveSettingsAndUpdate();
            });
        }
    });

    // Command to toggle filtering the properties section by the current navigation selection
    plugin.addCommand({
        id: 'toggle-properties-by-selection',
        name: strings.commands.togglePropertiesBySelection,
        callback: () => {
            runAsyncAction(async () => {
                await plugin.activateView();
                plugin.settings.scopePropertiesToCurrentContext = !plugin.settings.scopePropertiesToCurrentContext;
                await plugin.saveSettingsAndUpdate();
            });
        }
    });

    // Command to toggle the default list mode between standard and compact
    plugin.addCommand({
        id: 'toggle-compact-mode',
        name: strings.commands.toggleCompactMode,
        callback: () => {
            runAsyncAction(async () => {
                plugin.settings.defaultListMode = plugin.settings.defaultListMode === 'compact' ? 'standard' : 'compact';
                await plugin.saveSettingsAndUpdate();
            });
        }
    });

    // Command to toggle the pinned section in the list pane
    plugin.addCommand({
        id: 'toggle-pinned-section',
        name: strings.commands.togglePinnedSection,
        callback: () => {
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                await view?.whenReady();
                await plugin.togglePinnedGroupCollapsed(getPinnedCollapseKeyForCommand(plugin));
            });
        }
    });

    // Command to toggle between single and dual pane layouts
    plugin.addCommand({
        id: 'toggle-dual-pane',
        name: strings.commands.toggleDualPane,
        callback: () => {
            // Wrap pane toggle with error handling
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view?.isDualPaneAutoFallbackActive()) {
                    showNotice(strings.paneHeader.dualPaneAutoFallbackNotice, { variant: 'warning' });
                    return;
                }

                plugin.toggleDualPanePreference();
            });
        }
    });

    // Command to toggle dual-pane orientation between horizontal and vertical
    plugin.addCommand({
        id: 'toggle-dual-pane-orientation',
        name: strings.commands.toggleDualPaneOrientation,
        callback: () => {
            runAsyncAction(async () => {
                await plugin.activateView();
                const nextOrientation = plugin.getDualPaneOrientation() === 'vertical' ? 'horizontal' : 'vertical';
                await plugin.setDualPaneOrientation(nextOrientation);
            });
        }
    });

    // Command to toggle showing the calendar overlay in the navigation pane
    plugin.addCommand({
        id: 'toggle-calendar',
        name: strings.commands.toggleCalendar,
        callback: () => {
            runAsyncAction(async () => {
                if (!plugin.settings.calendarEnabled) {
                    return;
                }

                await plugin.activateView();
                plugin.toggleShowCalendar();
            });
        }
    });

    plugin.addCommand({
        id: 'open-daily-note',
        name: strings.commands.openDailyNote,
        callback: () => {
            runAsyncAction(() => openCalendarNoteForToday(plugin, 'day'));
        }
    });

    plugin.addCommand({
        id: 'open-weekly-note',
        name: strings.commands.openWeeklyNote,
        callback: () => {
            runAsyncAction(() => openCalendarNoteForToday(plugin, 'week'));
        }
    });

    plugin.addCommand({
        id: 'open-monthly-note',
        name: strings.commands.openMonthlyNote,
        callback: () => {
            runAsyncAction(() => openCalendarNoteForToday(plugin, 'month'));
        }
    });

    plugin.addCommand({
        id: 'open-quarterly-note',
        name: strings.commands.openQuarterlyNote,
        callback: () => {
            runAsyncAction(() => openCalendarNoteForToday(plugin, 'quarter'));
        }
    });

    plugin.addCommand({
        id: 'open-yearly-note',
        name: strings.commands.openYearlyNote,
        callback: () => {
            runAsyncAction(() => openCalendarNoteForToday(plugin, 'year'));
        }
    });

    // Command to select the active vault profile via modal picker
    plugin.addCommand({
        id: 'select-profile',
        name: strings.commands.selectVaultProfile,
        callback: () => {
            openVaultProfilePicker(plugin);
        }
    });

    const registerQuickProfileCommand = (commandId: string, commandName: string, profileIndex: number): void => {
        plugin.addCommand({
            id: commandId,
            name: commandName,
            callback: () => {
                const profileId = getVaultProfileIdAtIndex(plugin, profileIndex);
                if (!profileId) {
                    openVaultProfilePicker(plugin);
                    return;
                }
                runAsyncAction(() => plugin.setVaultProfile(profileId));
            }
        });
    };

    registerQuickProfileCommand('select-profile-1', strings.commands.selectVaultProfile1, 0);
    registerQuickProfileCommand('select-profile-2', strings.commands.selectVaultProfile2, 1);
    registerQuickProfileCommand('select-profile-3', strings.commands.selectVaultProfile3, 2);

    // Command to collapse or expand all folders in the navigation pane
    plugin.addCommand({
        id: 'collapse-expand',
        name: strings.commands.collapseExpand,
        callback: () => {
            // Wrap collapse/expand with error handling
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    view.triggerCollapse();
                }
            });
        }
    });

    // Command to collapse or expand the selected item in the navigation pane
    plugin.addCommand({
        id: 'collapse-expand-selected-item',
        name: strings.commands.collapseExpandSelectedItem,
        callback: () => {
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (!view) {
                    return;
                }

                await view.whenReady();
                view.triggerSelectedItemCollapse();
            });
        }
    });

    // Command to create a new note in the currently selected folder
    plugin.addCommand({
        id: 'new-note',
        name: strings.commands.createNewNote,
        callback: () => {
            // Wrap note creation with error handling
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    await view.createNoteInSelectedFolder(plugin.settings.createNewNotesInNewTab);
                }
            });
        }
    });

    // Command to create a new note from template in the currently selected folder (requires Templater)
    plugin.addCommand({
        id: 'new-note-from-template',
        name: strings.commands.createNewNoteFromTemplate,
        checkCallback: (checking: boolean) => {
            const createNewNoteFromTemplate = getTemplaterCreateNewNoteFromTemplate(plugin.app);
            if (!createNewNoteFromTemplate) {
                return false;
            }

            if (checking) {
                return true;
            }

            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    await view.createNoteFromTemplateInSelectedFolder();
                }
            });

            return true;
        }
    });

    // Command to move selected files to a different folder
    plugin.addCommand({
        id: 'move-files',
        name: strings.commands.moveFiles,
        callback: () => {
            // Wrap move operation with error handling
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    await view.moveSelectedFiles();
                }
            });
        }
    });

    // Command to merge selected Markdown notes
    plugin.addCommand({
        id: 'merge-notes',
        name: strings.commands.mergeNotes,
        callback: () => {
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    await view.mergeSelectedFiles();
                }
            });
        }
    });

    // Command to select the next file in the current view
    plugin.addCommand({
        id: 'select-next-file',
        name: strings.commands.selectNextFile,
        callback: () => {
            // Wrap file selection with error handling
            runAsyncAction(async () => {
                const existingLeaves = plugin.getNavigatorLeaves();
                const view = getNavigatorViewIfMounted(plugin, existingLeaves);
                if (view) {
                    await view.selectNextFileInCurrentView();
                    return;
                }

                await selectAdjacentFileWithoutNavigatorView(plugin, 'next');
            });
        }
    });

    // Command to select the previous file in the current view
    plugin.addCommand({
        id: 'select-previous-file',
        name: strings.commands.selectPreviousFile,
        callback: () => {
            // Wrap file selection with error handling
            runAsyncAction(async () => {
                const existingLeaves = plugin.getNavigatorLeaves();
                const view = getNavigatorViewIfMounted(plugin, existingLeaves);
                if (view) {
                    await view.selectPreviousFileInCurrentView();
                    return;
                }

                await selectAdjacentFileWithoutNavigatorView(plugin, 'previous');
            });
        }
    });

    // Command to move to the previous folder, tag, or property selection in navigator history
    plugin.addCommand({
        id: 'navigate-back',
        name: strings.commands.navigateBack,
        callback: () => {
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    await view.navigateBack();
                }
            });
        }
    });

    // Command to move to the next folder, tag, or property selection in navigator history
    plugin.addCommand({
        id: 'navigate-forward',
        name: strings.commands.navigateForward,
        callback: () => {
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    await view.navigateForward();
                }
            });
        }
    });

    // Command to convert the active file into a folder note
    plugin.addCommand({
        id: 'convert-to-folder-note',
        name: strings.commands.convertToFolderNote,
        checkCallback: (checking: boolean) => {
            const activeFile = plugin.app.workspace.getActiveFile();
            if (!activeFile) {
                return false;
            }

            if (!plugin.settings.enableFolderNotes) {
                return false;
            }

            if (!isSupportedFolderNoteExtension(activeFile.extension)) {
                return false;
            }

            const parent = activeFile.parent;
            if (!parent || !(parent instanceof TFolder)) {
                return false;
            }

            const fileSystemOps = plugin.fileSystemOps;
            if (!fileSystemOps) {
                return false;
            }

            if (checking) {
                return true;
            }

            // Convert file to folder note with error handling
            runAsyncAction(() => fileSystemOps.convertFileToFolderNote(activeFile, plugin.settings));
            return true;
        }
    });

    // Command to rename the active file to its folder note name
    plugin.addCommand({
        id: 'set-as-folder-note',
        name: strings.commands.setAsFolderNote,
        checkCallback: (checking: boolean) => {
            const activeFile = plugin.app.workspace.getActiveFile();
            if (!activeFile) {
                return false;
            }

            if (!plugin.settings.enableFolderNotes) {
                return false;
            }

            if (!isSupportedFolderNoteExtension(activeFile.extension)) {
                return false;
            }

            const parent = activeFile.parent;
            if (!parent || !(parent instanceof TFolder)) {
                return false;
            }

            const fileSystemOps = plugin.fileSystemOps;
            if (!fileSystemOps) {
                return false;
            }

            if (checking) {
                return true;
            }

            runAsyncAction(() => fileSystemOps.setFileAsFolderNote(activeFile, plugin.settings));
            return true;
        }
    });

    // Command to detach the folder note in the selected folder
    plugin.addCommand({
        id: 'detach-folder-note',
        name: strings.commands.detachFolderNote,
        checkCallback: (checking: boolean) => {
            if (!plugin.settings.enableFolderNotes) {
                return false;
            }

            const fileSystemOps = plugin.fileSystemOps;
            if (!fileSystemOps) {
                return false;
            }

            if (checking) {
                return true;
            }

            const selectedFolder = getSelectedFolderForCommand(plugin);
            if (!selectedFolder) {
                showNotice(strings.fileSystem.errors.noFolderSelected, { variant: 'warning' });
                return true;
            }

            const folderNote = getFolderNote(selectedFolder, getFolderNoteDetectionSettings(plugin.settings));

            if (!folderNote) {
                showNotice(strings.fileSystem.errors.folderNoteNotFound, { variant: 'warning' });
                return true;
            }

            runAsyncAction(() => fileSystemOps.renameFile(folderNote));
            return true;
        }
    });

    // Command to pin all folder notes to the shortcuts list
    plugin.addCommand({
        id: 'pin-all-folder-notes',
        name: strings.commands.pinAllFolderNotes,
        checkCallback: (checking: boolean) => {
            if (!plugin.settings.enableFolderNotes) {
                return false;
            }

            const metadataService = plugin.metadataService;
            if (!metadataService) {
                return false;
            }

            if (checking) {
                return true;
            }

            runAsyncAction(async () => {
                const folderNoteSettings = getFolderNoteDetectionSettings(plugin.settings);

                const { showHiddenItems } = plugin.getUXPreferences();
                const effectiveExcludedFiles = getEffectiveFrontmatterExclusions(plugin.settings, showHiddenItems);
                const effectiveExcludedFileMatcher = createFrontmatterPropertyExclusionMatcher(effectiveExcludedFiles);
                const hiddenFolders = getActiveHiddenFolders(plugin.settings);

                const eligible: TFile[] = [];

                plugin.app.vault.getAllLoadedFiles().forEach(file => {
                    if (!(file instanceof TFile)) {
                        return;
                    }

                    const parent = file.parent;
                    if (!parent || !(parent instanceof TFolder)) {
                        return;
                    }

                    if (!isFolderNote(file, parent, folderNoteSettings)) {
                        return;
                    }

                    if (!showHiddenItems && isFolderInExcludedFolder(parent, hiddenFolders)) {
                        return;
                    }

                    if (
                        effectiveExcludedFileMatcher.hasCriteria &&
                        shouldExcludeFileWithMatcher(file, effectiveExcludedFileMatcher, plugin.app)
                    ) {
                        return;
                    }

                    if (metadataService.isFilePinned(file.path, 'folder')) {
                        return;
                    }

                    eligible.push(file);
                });

                if (eligible.length === 0) {
                    return;
                }

                const pinnedCount = await metadataService.pinNotes(
                    eligible.map(note => note.path),
                    'folder'
                );

                if (pinnedCount === 0) {
                    return;
                }

                showNotice(strings.shortcuts.folderNotesPinned.replace('{count}', pinnedCount.toString()), { variant: 'success' });
            });

            return true;
        }
    });

    // Command to delete selected files
    plugin.addCommand({
        id: 'delete-files',
        name: strings.commands.deleteFile,
        callback: () => {
            // Wrap delete operation with error handling
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    view.deleteSelectedFiles();
                }
            });
        }
    });

    // Command to clear and rebuild the entire local cache database
    plugin.addCommand({
        id: 'rebuild-cache',
        name: strings.commands.rebuildCache,
        callback: () => {
            // Wrap cache rebuild with error handling and logging
            runAsyncAction(async () => {
                try {
                    await plugin.rebuildCache();
                } catch (error) {
                    console.error('Failed to rebuild cache:', error);
                }
            });
        }
    });

    // Command to add a tag to selected files
    plugin.addCommand({
        id: 'add-tag',
        name: strings.commands.addTag,
        callback: () => {
            // Wrap tag addition with error handling
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    await view.addTagToSelectedFiles();
                }
            });
        }
    });

    // Command to set a property on selected files
    plugin.addCommand({
        id: 'set-property',
        name: strings.commands.setProperty,
        callback: () => {
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    await view.setPropertyOnSelectedFiles();
                }
            });
        }
    });

    // Command to remove a tag from selected files
    plugin.addCommand({
        id: 'remove-tag',
        name: strings.commands.removeTag,
        callback: () => {
            // Wrap tag removal with error handling
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    await view.removeTagFromSelectedFiles();
                }
            });
        }
    });

    // Command to remove all tags from selected files
    plugin.addCommand({
        id: 'remove-all-tags',
        name: strings.commands.removeAllTags,
        callback: () => {
            // Wrap tag removal with error handling
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    await view.removeAllTagsFromSelectedFiles();
                }
            });
        }
    });

    // Command to show a modal for navigating to any folder
    plugin.addCommand({
        id: 'navigate-to-folder',
        name: strings.commands.navigateToFolder,
        callback: () => {
            // Wrap folder navigation with error handling
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    await view.navigateToFolderWithModal();
                }
            });
        }
    });

    // Command to show a modal for navigating to any tag
    plugin.addCommand({
        id: 'navigate-to-tag',
        name: strings.commands.navigateToTag,
        callback: () => {
            // Wrap tag navigation with error handling
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    await view.navigateToTagWithModal();
                }
            });
        }
    });

    // Command to show a modal for navigating to any property key or value
    plugin.addCommand({
        id: 'navigate-to-property',
        name: strings.commands.navigateToProperty,
        callback: () => {
            // Wrap property navigation with error handling
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    await view.navigateToPropertyWithModal();
                }
            });
        }
    });

    // Command to add the current selection or active file to shortcuts
    plugin.addCommand({
        id: 'add-shortcut',
        name: strings.commands.addShortcut,
        callback: () => {
            // Wrap shortcut creation with error handling
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    await view.addShortcutForCurrentSelection();
                }
            });
        }
    });

    Array.from({ length: 9 }, (_unused, index) => index + 1).forEach(shortcutNumber => {
        const commandName = strings.commands.openShortcut.replace('{number}', shortcutNumber.toString());
        plugin.addCommand({
            id: `open-shortcut-${shortcutNumber}`,
            name: commandName,
            checkCallback: (checking: boolean) => {
                try {
                    const activeProfile = getActiveVaultProfile(plugin.settings);
                    const shortcuts = activeProfile.shortcuts ?? [];
                    const shortcut = shortcuts[shortcutNumber - 1];
                    if (!shortcut) {
                        return false;
                    }

                    if (checking) {
                        return true;
                    }

                    runAsyncAction(async () => {
                        const didOpenDirectly = await openNoteShortcutWithoutNavigatorView(plugin, shortcut);
                        if (didOpenDirectly) {
                            return;
                        }

                        const view = await ensureNavigatorOpen(plugin);
                        if (!view) {
                            return;
                        }
                        await view.openShortcutByNumber(shortcutNumber);
                    });

                    return true;
                } catch (error) {
                    console.error('Failed to open shortcut command:', error);
                    return false;
                }
            }
        });
    });

    async function openNoteShortcutWithoutNavigatorView(plugin: NotebookNavigatorPlugin, shortcut: ShortcutEntry): Promise<boolean> {
        if (!isNoteShortcut(shortcut)) {
            return false;
        }

        const { app } = plugin;
        const target = resolveNoteShortcutTarget(app, shortcut.path);
        if (!target) {
            return false;
        }

        const leaf = app.workspace.getLeaf(false);
        if (!leaf) {
            return false;
        }

        await leaf.openFile(target, { active: true });
        return true;
    }

    // Command to open or focus the search input
    plugin.addCommand({
        id: 'search',
        name: strings.commands.search,
        callback: () => {
            // Wrap search toggle with error handling
            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (view) {
                    view.toggleSearch();
                }
            });
        }
    });

    // Command to select the vault root folder and open search with descendants included
    plugin.addCommand({
        id: 'search-vault',
        name: strings.commands.searchVaultRoot,
        checkCallback: (checking: boolean) => {
            if (!plugin.settings.showRootFolder) {
                return false;
            }

            if (checking) {
                return true;
            }

            runAsyncAction(async () => {
                const view = await ensureNavigatorOpen(plugin);
                if (!view) {
                    return;
                }

                const root = plugin.app.vault.getRoot();
                view.navigateToFolder(root, { source: 'manual', preserveNavigationFocus: false });
                view.searchWithDescendants();
            });

            return true;
        }
    });
}
