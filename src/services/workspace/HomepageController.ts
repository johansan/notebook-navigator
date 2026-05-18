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

import { FileView, TFile, type WorkspaceLeaf } from 'obsidian';
import type NotebookNavigatorPlugin from '../../main';
import { isSupportedHomepageFile } from '../../utils/homepageUtils';
import type { RevealFileOptions } from '../../hooks/useNavigatorReveal';
import WorkspaceCoordinator from './WorkspaceCoordinator';
import { getSupportedLeaves } from '../../types';
import {
    buildCustomCalendarFilePathForPattern,
    buildCustomCalendarMomentPattern,
    createCalendarMarkdownFile,
    getCalendarNoteConfig,
    getCalendarTemplatePath,
    resolveCalendarCustomNotePathDate,
    type CalendarNoteKind
} from '../../utils/calendarNotes';
import { createDailyNote, getDailyNoteFile, getDailyNoteSettings } from '../../utils/dailyNotes';
import { getCurrentLanguage } from '../../i18n';
import { getMomentApi, resolveCalendarLocales, resolveCalendarPeriodicNotesLocale, resolveDailyNoteLocale } from '../../utils/moment';
import { getActiveVaultProfile } from '../../utils/vaultProfiles';
import type { HomepageSource } from '../../settings/types';

// Indicates what triggered the homepage opening
type HomepageTrigger = 'startup' | 'command';

interface WorkspaceReadyOptions {
    // Whether to activate the navigator view during workspace initialization
    shouldActivateOnStartup: boolean;
}

/**
 * Handles homepage resolution and opening behaviour, including deferred triggers
 * while the workspace is loading.
 */
export default class HomepageController {
    private readonly plugin: NotebookNavigatorPlugin;
    private readonly workspace: WorkspaceCoordinator;
    // Tracks whether workspace layout has finished loading
    private isWorkspaceReady = false;
    // Stores a deferred homepage trigger to execute once workspace is ready
    private pendingTrigger: HomepageTrigger | null = null;
    constructor(plugin: NotebookNavigatorPlugin, workspace: WorkspaceCoordinator) {
        this.plugin = plugin;
        this.workspace = workspace;
    }

    /**
     * Resolves the configured homepage target to a file object if valid
     */
    resolveHomepageFile(): TFile | null {
        const { homepage } = this.plugin.settings;

        const resolvePath = (path: string | null): TFile | null => {
            if (!path) {
                return null;
            }

            const candidate = this.plugin.app.vault.getAbstractFileByPath(path);
            if (!isSupportedHomepageFile(candidate)) {
                return null;
            }

            return candidate;
        };

        switch (homepage.source) {
            case 'none':
                return null;
            case 'file':
                return resolvePath(homepage.file);
            case 'daily-note':
                return this.resolvePeriodicHomepageFile('day');
            case 'weekly-note':
                return this.resolvePeriodicHomepageFile('week');
            case 'monthly-note':
                return this.resolvePeriodicHomepageFile('month');
            case 'quarterly-note':
                return this.resolvePeriodicHomepageFile('quarter');
            case 'yearly-note':
                return this.resolvePeriodicHomepageFile('year');
        }
    }

    /**
     * Checks whether the configured homepage can be opened.
     */
    canOpenHomepage(): boolean {
        if (this.resolveHomepageFile()) {
            return true;
        }

        const { homepage } = this.plugin.settings;
        const periodicKind = this.getPeriodicHomepageKind(homepage.source);
        return Boolean(homepage.createMissingPeriodicNote && periodicKind && this.canCreatePeriodicHomepageFile(periodicKind));
    }

    /**
     * Marks the workspace as ready and processes the pending homepage trigger.
     */
    async handleWorkspaceReady(options: WorkspaceReadyOptions): Promise<void> {
        this.isWorkspaceReady = true;

        if (this.plugin.isShuttingDown()) {
            return;
        }

        // Activate navigator view if configured to show on startup
        if (options.shouldActivateOnStartup) {
            await this.workspace.activateNavigatorView();
        }

        // Execute any deferred homepage trigger or default to startup
        const trigger = this.pendingTrigger ?? 'startup';
        this.pendingTrigger = null;
        await this.open(trigger);
    }

    /**
     * Opens the configured homepage target if it resolves and conditions are met
     */
    async open(trigger: HomepageTrigger): Promise<boolean> {
        if (this.plugin.isShuttingDown()) {
            return false;
        }

        // Defer opening until workspace is ready
        if (!this.isWorkspaceReady && trigger !== 'startup') {
            this.pendingTrigger = trigger;
            return false;
        }

        const homepageFile = await this.resolveHomepageFileForOpen();
        if (!homepageFile) {
            return false;
        }

        const shouldRevealInNavigator = trigger !== 'startup' || this.plugin.settings.autoRevealActiveFile;
        const revealOptions: RevealFileOptions = {
            source: trigger === 'startup' ? 'startup' : 'manual',
            isStartupReveal: trigger === 'startup',
            preserveNavigationFocus: this.plugin.settings.startView === 'navigation' && trigger === 'startup'
        };

        if (trigger === 'startup') {
            const existingLeaf = this.findExistingHomepageLeaf(homepageFile);
            if (existingLeaf) {
                const { workspace } = this.plugin.app;
                await workspace.revealLeaf(existingLeaf);
                workspace.setActiveLeaf(existingLeaf, { focus: true });
                if (shouldRevealInNavigator) {
                    this.workspace.revealFileInNearestFolder(homepageFile, revealOptions);
                }
                return true;
            }
        }

        // Reveal homepage in navigator
        if (shouldRevealInNavigator) {
            this.workspace.revealFileInNearestFolder(homepageFile, revealOptions);
        }

        // Open homepage file in the editor
        // Use command queue to track the homepage open operation if available
        const { commandQueue } = this.plugin;
        if (commandQueue) {
            const result = await commandQueue.executeHomepageOpen(homepageFile, () =>
                this.plugin.app.workspace.openLinkText(homepageFile.path, '', false)
            );

            return result.success;
        }

        // Fallback for when command queue is not available
        await this.plugin.app.workspace.openLinkText(homepageFile.path, '', false);
        return true;
    }

    /**
     * Finds an open workspace leaf that already hosts the resolved homepage file.
     * Restricting this check to supported file leaves avoids iterating every workspace tab.
     */
    private findExistingHomepageLeaf(homepageFile: TFile): WorkspaceLeaf | null {
        const leaves = getSupportedLeaves(this.plugin.app);
        const targetPath = homepageFile.path;

        for (const leaf of leaves) {
            const resolvedPath = this.getLeafFilePath(leaf);
            if (resolvedPath === targetPath) {
                return leaf;
            }
        }
        return null;
    }

    /**
     * Gets the file path currently associated with a workspace leaf, falling back to stored view state.
     */
    private getLeafFilePath(leaf: WorkspaceLeaf): string | null {
        const { view } = leaf;
        if (view instanceof FileView && view.file) {
            return view.file.path;
        }

        const liveState = view?.getState?.();
        const liveStateFile = this.extractFilePath(liveState);
        if (liveStateFile) {
            return liveStateFile;
        }

        const persistedState = leaf.getViewState();
        return this.extractFilePath(persistedState.state);
    }

    /**
     * Extracts a file path from a view state object when available.
     */
    private extractFilePath(state: unknown): string | null {
        if (typeof state !== 'object' || state === null) {
            return null;
        }

        if (!Object.prototype.hasOwnProperty.call(state, 'file')) {
            return null;
        }

        const stateRecord = state as Record<string, unknown>;
        const fileValue = stateRecord.file;
        return typeof fileValue === 'string' ? fileValue : null;
    }

    private async resolveHomepageFileForOpen(): Promise<TFile | null> {
        const existingHomepageFile = this.resolveHomepageFile();
        if (existingHomepageFile || !this.plugin.settings.homepage.createMissingPeriodicNote) {
            return existingHomepageFile;
        }

        const periodicKind = this.getPeriodicHomepageKind(this.plugin.settings.homepage.source);
        if (!periodicKind) {
            return null;
        }

        return this.createPeriodicHomepageFile(periodicKind);
    }

    private getPeriodicHomepageKind(source: HomepageSource): CalendarNoteKind | null {
        switch (source) {
            case 'daily-note':
                return 'day';
            case 'weekly-note':
                return 'week';
            case 'monthly-note':
                return 'month';
            case 'quarterly-note':
                return 'quarter';
            case 'yearly-note':
                return 'year';
            case 'none':
            case 'file':
                return null;
        }
    }

    private canCreatePeriodicHomepageFile(kind: CalendarNoteKind): boolean {
        const momentApi = getMomentApi();
        if (!momentApi) {
            return false;
        }

        if (kind === 'day' && this.plugin.settings.calendarIntegrationMode === 'daily-notes') {
            return Boolean(getDailyNoteSettings(this.plugin.app));
        }

        const config = getCalendarNoteConfig(kind, this.plugin.settings);
        const momentPattern = buildCustomCalendarMomentPattern(config.calendarCustomFilePattern, config.fallbackPattern);
        return config.isPatternValid(momentPattern, momentApi);
    }

    private resolvePeriodicHomepageFile(kind: CalendarNoteKind): TFile | null {
        const momentApi = getMomentApi();
        if (!momentApi) {
            return null;
        }

        const currentLanguage = getCurrentLanguage();
        const { calendarRulesLocale } = resolveCalendarLocales(this.plugin.settings.calendarLocale, momentApi, currentLanguage);
        const periodicNotesLocale = resolveCalendarPeriodicNotesLocale(
            this.plugin.settings.calendarPeriodicNotesLocaleSource,
            calendarRulesLocale,
            momentApi
        );
        const date = momentApi().startOf('day');

        if (kind === 'day' && this.plugin.settings.calendarIntegrationMode === 'daily-notes') {
            const dailyNoteSettings = getDailyNoteSettings(this.plugin.app);
            if (!dailyNoteSettings) {
                return null;
            }

            return getDailyNoteFile(this.plugin.app, date.clone().locale(resolveDailyNoteLocale(momentApi)), dailyNoteSettings);
        }

        const config = getCalendarNoteConfig(kind, this.plugin.settings);
        const momentPattern = buildCustomCalendarMomentPattern(config.calendarCustomFilePattern, config.fallbackPattern);

        if (!config.isPatternValid(momentPattern, momentApi)) {
            return null;
        }

        const dateForPath = resolveCalendarCustomNotePathDate(kind, date, momentPattern, periodicNotesLocale, periodicNotesLocale);
        const expected = buildCustomCalendarFilePathForPattern(
            dateForPath,
            { calendarCustomRootFolder: getActiveVaultProfile(this.plugin.settings).periodicNotesFolder },
            config.calendarCustomFilePattern,
            config.fallbackPattern
        );
        const file = this.plugin.app.vault.getAbstractFileByPath(expected.filePath);
        return file instanceof TFile ? file : null;
    }

    private async createPeriodicHomepageFile(kind: CalendarNoteKind): Promise<TFile | null> {
        const momentApi = getMomentApi();
        if (!momentApi) {
            return null;
        }

        const currentLanguage = getCurrentLanguage();
        const { calendarRulesLocale } = resolveCalendarLocales(this.plugin.settings.calendarLocale, momentApi, currentLanguage);
        const periodicNotesLocale = resolveCalendarPeriodicNotesLocale(
            this.plugin.settings.calendarPeriodicNotesLocaleSource,
            calendarRulesLocale,
            momentApi
        );
        const date = momentApi().startOf('day');

        if (kind === 'day' && this.plugin.settings.calendarIntegrationMode === 'daily-notes') {
            const dailyNoteSettings = getDailyNoteSettings(this.plugin.app);
            if (!dailyNoteSettings) {
                return null;
            }

            return createDailyNote(this.plugin.app, date.clone().locale(resolveDailyNoteLocale(momentApi)), dailyNoteSettings);
        }

        const config = getCalendarNoteConfig(kind, this.plugin.settings);
        const momentPattern = buildCustomCalendarMomentPattern(config.calendarCustomFilePattern, config.fallbackPattern);

        if (!config.isPatternValid(momentPattern, momentApi)) {
            return null;
        }

        const dateForPath = resolveCalendarCustomNotePathDate(kind, date, momentPattern, periodicNotesLocale, periodicNotesLocale);
        const expected = buildCustomCalendarFilePathForPattern(
            dateForPath,
            { calendarCustomRootFolder: getActiveVaultProfile(this.plugin.settings).periodicNotesFolder },
            config.calendarCustomFilePattern,
            config.fallbackPattern
        );
        const existing = this.plugin.app.vault.getAbstractFileByPath(expected.filePath);
        if (existing instanceof TFile) {
            return existing;
        }

        try {
            const templatePath = getCalendarTemplatePath(kind, this.plugin.settings);
            return await createCalendarMarkdownFile(this.plugin.app, expected.folderPath, expected.fileName, templatePath);
        } catch (error) {
            console.error('Failed to create homepage note', error);
            return null;
        }
    }
}
