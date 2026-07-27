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

import { Platform } from 'obsidian';

import { MAX_RECENT_COLORS } from '../../constants/colorPalette';
import { DEFAULT_SETTINGS } from '../../settings/defaultSettings';
import {
    NARROW_SIDEBAR_CUSTOM_WIDTH_MAX,
    NARROW_SIDEBAR_CUSTOM_WIDTH_MIN,
    type AlphaSortOrder,
    type CalendarLeftPlacement,
    type CalendarPlacement,
    type CalendarWeeksToShow,
    type FeatureImagePixelSizeSetting,
    type FeatureImageSizeSetting,
    type NotebookNavigatorSettings,
    type NarrowSidebarLayout,
    type NarrowSidebarTriggerMode,
    type SyncModeSettingId,
    type TagSortOrder
} from '../../settings/types';
import RecentDataManager from '../recent/RecentDataManager';
import { localStorage } from '../../utils/localStorage';
import { sanitizeUIScale } from '../../utils/uiScale';
import {
    MAX_PANE_TRANSITION_DURATION_MS,
    MIN_PANE_TRANSITION_DURATION_MS,
    type CollapsedPinnedContexts,
    type DualPaneOrientation,
    type LocalStorageKeys,
    type PinnedSectionCollapseKey,
    type UXPreferences
} from '../../types';
import { cloneCollapsedPinnedContextsRecord } from '../../utils/recordUtils';
import { ensureVaultProfiles, DEFAULT_VAULT_PROFILE_ID } from '../../utils/vaultProfiles';
import { runAsyncAction } from '../../utils/async';
import { isAlphaSortOrder, isTagSortOrder } from '../../settings/types';
import { getDefaultUXPreferences, isUXPreferencesRecord, normalizeUXPreferencesRecord } from './uxPreferences';

interface PluginPreferencesControllerOptions {
    keys: LocalStorageKeys;
    getSettings: () => NotebookNavigatorSettings;
    notifySettingsUpdate: () => void;
    saveSettings: () => Promise<void>;
    isShuttingDown: () => boolean;
    isLocal: (settingId: SyncModeSettingId) => boolean;
    persistSyncModeSettingUpdate: (settingId: SyncModeSettingId) => void;
    persistSyncModeSettingUpdateAsync: (settingId: SyncModeSettingId) => Promise<void>;
    isOmnisearchAvailable: () => boolean;
    refreshMatcherCachesIfNeeded: () => void;
}

function areCollapsedPinnedContextsEqual(left: CollapsedPinnedContexts, right: CollapsedPinnedContexts): boolean {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return (
        leftKeys.length === rightKeys.length &&
        leftKeys.every(key => left[key as PinnedSectionCollapseKey] === right[key as PinnedSectionCollapseKey])
    );
}

export class PluginPreferencesController {
    private readonly options: PluginPreferencesControllerOptions;
    private dualPanePreference = true;
    private dualPaneOrientationPreference: DualPaneOrientation = 'horizontal';
    private recentDataManager: RecentDataManager | null = null;
    private recentDataListeners = new Map<string, () => void>();
    private uxPreferences: UXPreferences = getDefaultUXPreferences();
    private uxPreferenceListeners = new Map<string, () => void>();
    // Pinned-section collapse state per navigation context, persisted to vault-local storage instead of synced settings
    private collapsedPinnedContexts: CollapsedPinnedContexts = cloneCollapsedPinnedContextsRecord(undefined);

    constructor(options: PluginPreferencesControllerOptions) {
        this.options = options;
    }

    public syncMirrorsFromSettings(): boolean {
        const settings = this.options.getSettings();
        const previousIncludeDescendantNotes = this.uxPreferences.includeDescendantNotes;

        this.dualPanePreference = settings.dualPane;
        this.dualPaneOrientationPreference = settings.dualPaneOrientation;
        this.uxPreferences = {
            ...this.uxPreferences,
            includeDescendantNotes: settings.includeDescendantNotes
        };

        return previousIncludeDescendantNotes !== this.uxPreferences.includeDescendantNotes;
    }

    public initializeRecentDataManager(): void {
        const settings = this.options.getSettings();
        if (!this.recentDataManager) {
            this.recentDataManager = new RecentDataManager({
                settings,
                keys: this.options.keys,
                onRecentDataChange: () => this.notifyRecentDataUpdate()
            });
        }

        this.recentDataManager.initialize(settings.vaultProfile);
    }

    public flushPendingPersists(): void {
        this.recentDataManager?.flushPendingPersists();
    }

    public dispose(): void {
        this.recentDataManager?.dispose();
        this.recentDataManager = null;
        this.recentDataListeners.clear();
        this.uxPreferenceListeners.clear();
    }

    public getRecentNotes(): string[] {
        return this.recentDataManager?.getRecentNotes() ?? [];
    }

    public setRecentNotes(recentNotes: string[]): void {
        this.recentDataManager?.setRecentNotes(recentNotes);
    }

    public applyRecentNotesLimit(): void {
        this.recentDataManager?.applyRecentNotesLimit();
    }

    public getRecentIcons(): Record<string, string[]> {
        return this.recentDataManager?.getRecentIcons() ?? {};
    }

    public setRecentIcons(recentIcons: Record<string, string[]>): void {
        this.recentDataManager?.setRecentIcons(recentIcons);
    }

    public registerRecentDataListener(id: string, callback: () => void): void {
        this.recentDataListeners.set(id, callback);
    }

    public unregisterRecentDataListener(id: string): void {
        this.recentDataListeners.delete(id);
    }

    public loadUXPreferences(): void {
        const defaults = getDefaultUXPreferences();
        const stored = localStorage.get<unknown>(this.options.keys.uxPreferencesKey);
        const normalized = normalizeUXPreferencesRecord(stored, defaults);
        this.uxPreferences = normalized.preferences;
        if (normalized.changed || !isUXPreferencesRecord(stored)) {
            this.persistUXPreferences(false);
        }
        this.syncCollapsedPinnedContextsFromLocalStorage();
    }

    public resetUXPreferencesToDefaults(): void {
        this.uxPreferences = getDefaultUXPreferences();
        this.persistUXPreferences(false);
        // First-launch reset runs after localStorage is cleared, so drop the in-memory pinned collapse state as well
        this.collapsedPinnedContexts = cloneCollapsedPinnedContextsRecord(undefined);
    }

    public getCollapsedPinnedContexts(): CollapsedPinnedContexts {
        return cloneCollapsedPinnedContextsRecord(this.collapsedPinnedContexts);
    }

    /**
     * Refreshes the in-memory record after a settings migration writes vault-local storage.
     * Without this refresh, a later mutation would persist the stale record and discard migrated keys.
     *
     * @returns True when the in-memory record changed
     */
    public syncCollapsedPinnedContextsFromLocalStorage(): boolean {
        const next = cloneCollapsedPinnedContextsRecord(localStorage.get<unknown>(this.options.keys.collapsedPinnedContextsKey));
        if (areCollapsedPinnedContextsEqual(this.collapsedPinnedContexts, next)) {
            return false;
        }

        this.collapsedPinnedContexts = next;
        return true;
    }

    /**
     * Applies a mutation to the pinned-section collapse record. When the mutator reports a change,
     * the record is persisted to vault-local storage and UX preference listeners are notified;
     * otherwise no storage write or notification happens.
     *
     * @returns True when the mutator changed the record
     */
    public updateCollapsedPinnedContexts(mutator: (record: CollapsedPinnedContexts) => boolean): boolean {
        const changed = mutator(this.collapsedPinnedContexts);
        if (changed) {
            localStorage.set(this.options.keys.collapsedPinnedContextsKey, this.collapsedPinnedContexts);
            this.notifyUXPreferencesUpdate();
        }
        return changed;
    }

    public togglePinnedGroupCollapsed(collapseKey: PinnedSectionCollapseKey): void {
        this.updateCollapsedPinnedContexts(record => {
            if (record[collapseKey]) {
                delete record[collapseKey];
            } else {
                record[collapseKey] = true;
            }
            return true;
        });
    }

    public mirrorUXPreferences(update: Partial<UXPreferences>): void {
        this.uxPreferences = {
            ...this.uxPreferences,
            ...update
        };
        this.persistUXPreferences(false);
    }

    public getUXPreferences(): UXPreferences {
        return { ...this.uxPreferences };
    }

    public registerUXPreferencesListener(id: string, callback: () => void): void {
        this.uxPreferenceListeners.set(id, callback);
    }

    public unregisterUXPreferencesListener(id: string): void {
        this.uxPreferenceListeners.delete(id);
    }

    public useDualPane(): boolean {
        return this.dualPanePreference;
    }

    public setDualPanePreference(enabled: boolean): void {
        const next = Boolean(enabled);
        if (this.dualPanePreference === next) {
            return;
        }

        this.dualPanePreference = next;
        const settings = this.options.getSettings();
        settings.dualPane = next;
        localStorage.set(this.options.keys.dualPaneKey, next ? '1' : '0');
        this.options.persistSyncModeSettingUpdate('dualPane');
    }

    public toggleDualPanePreference(): void {
        this.setDualPanePreference(!this.dualPanePreference);
    }

    public getDualPaneOrientation(): DualPaneOrientation {
        return this.dualPaneOrientationPreference;
    }

    public async setDualPaneOrientation(orientation: DualPaneOrientation): Promise<void> {
        const normalized: DualPaneOrientation = orientation === 'vertical' ? 'vertical' : 'horizontal';
        if (this.dualPaneOrientationPreference === normalized) {
            return;
        }

        this.dualPaneOrientationPreference = normalized;
        const settings = this.options.getSettings();
        settings.dualPaneOrientation = normalized;
        localStorage.set(this.options.keys.dualPaneOrientationKey, normalized);
        await this.options.persistSyncModeSettingUpdateAsync('dualPaneOrientation');
    }

    public setNarrowSidebarLayout(layout: NarrowSidebarLayout): void {
        const normalized: NarrowSidebarLayout = layout === 'vertical' || layout === 'singlePane' ? layout : 'none';
        const settings = this.options.getSettings();
        if (settings.narrowSidebarLayout === normalized) {
            return;
        }

        settings.narrowSidebarLayout = normalized;
        localStorage.set(this.options.keys.narrowSidebarLayoutKey, normalized);
        this.options.persistSyncModeSettingUpdate('narrowSidebarLayout');
    }

    public setNarrowSidebarTriggerMode(mode: NarrowSidebarTriggerMode): void {
        const normalized: NarrowSidebarTriggerMode = mode === 'customWidth' ? 'customWidth' : 'fitPanes';
        const settings = this.options.getSettings();
        if (settings.narrowSidebarTriggerMode === normalized) {
            return;
        }

        settings.narrowSidebarTriggerMode = normalized;
        localStorage.set(this.options.keys.narrowSidebarTriggerModeKey, normalized);
        this.options.persistSyncModeSettingUpdate('narrowSidebarTriggerMode');
    }

    public setNarrowSidebarCustomWidth(width: number): void {
        if (!Number.isFinite(width)) {
            return;
        }

        const rounded = Math.round(width);
        const normalized = Math.min(NARROW_SIDEBAR_CUSTOM_WIDTH_MAX, Math.max(NARROW_SIDEBAR_CUSTOM_WIDTH_MIN, rounded));
        const settings = this.options.getSettings();
        if (settings.narrowSidebarCustomWidth === normalized) {
            return;
        }

        settings.narrowSidebarCustomWidth = normalized;
        localStorage.set(this.options.keys.narrowSidebarCustomWidthKey, normalized);
        this.options.persistSyncModeSettingUpdate('narrowSidebarCustomWidth');
    }

    public getUIScale(): number {
        const settings = this.options.getSettings();
        const current = Platform.isMobile ? settings.mobileScale : settings.desktopScale;
        return sanitizeUIScale(current);
    }

    public setUIScale(scale: number): void {
        const next = sanitizeUIScale(scale);
        const settings = this.options.getSettings();
        const isMobile = Platform.isMobile;
        const current = sanitizeUIScale(isMobile ? settings.mobileScale : settings.desktopScale);
        if (isMobile) {
            settings.mobileScale = next;
        } else {
            settings.desktopScale = next;
        }

        localStorage.set(this.options.keys.uiScaleKey, next);
        if (current === next) {
            return;
        }

        this.options.persistSyncModeSettingUpdate('uiScale');
    }

    public getTagSortOrder(): TagSortOrder {
        return this.options.getSettings().tagSortOrder;
    }

    public getPropertySortOrder(): TagSortOrder {
        return this.options.getSettings().propertySortOrder;
    }

    public getFolderSortOrder(): AlphaSortOrder {
        return this.options.getSettings().folderSortOrder;
    }

    public setTagSortOrder(order: TagSortOrder): void {
        const settings = this.options.getSettings();
        if (!isTagSortOrder(order) || settings.tagSortOrder === order) {
            return;
        }

        settings.tagSortOrder = order;
        localStorage.set(this.options.keys.tagSortOrderKey, order);
        this.options.persistSyncModeSettingUpdate('tagSortOrder');
    }

    public setPropertySortOrder(order: TagSortOrder): void {
        const settings = this.options.getSettings();
        if (!isTagSortOrder(order) || settings.propertySortOrder === order) {
            return;
        }

        settings.propertySortOrder = order;
        localStorage.set(this.options.keys.propertySortOrderKey, order);
        this.options.persistSyncModeSettingUpdate('propertySortOrder');
    }

    public setFolderSortOrder(order: AlphaSortOrder): void {
        const settings = this.options.getSettings();
        if (!isAlphaSortOrder(order) || settings.folderSortOrder === order) {
            return;
        }

        settings.folderSortOrder = order;
        localStorage.set(this.options.keys.folderSortOrderKey, order);
        this.options.persistSyncModeSettingUpdate('folderSortOrder');
    }

    public getReleaseCheckTimestamp(): number | null {
        const value = localStorage.get<unknown>(this.options.keys.releaseCheckTimestampKey);
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        return null;
    }

    public setReleaseCheckTimestamp(timestamp: number): void {
        localStorage.set(this.options.keys.releaseCheckTimestampKey, timestamp);
    }

    public getRecentColors(): string[] {
        const stored = localStorage.get<unknown>(this.options.keys.recentColorsKey);
        if (!Array.isArray(stored)) {
            return [];
        }

        return stored.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
    }

    public setRecentColors(recentColors: string[]): void {
        const sanitized = Array.isArray(recentColors)
            ? recentColors.filter(color => typeof color === 'string' && color.trim().length > 0)
            : [];
        localStorage.set(this.options.keys.recentColorsKey, sanitized.slice(0, MAX_RECENT_COLORS));
    }

    public getSearchProvider(): 'internal' | 'omnisearch' {
        return this.options.getSettings().searchProvider === 'omnisearch' ? 'omnisearch' : 'internal';
    }

    public setSearchProvider(provider: 'internal' | 'omnisearch'): void {
        const settings = this.options.getSettings();
        const normalized = provider === 'omnisearch' && this.options.isOmnisearchAvailable() ? 'omnisearch' : 'internal';
        if (settings.searchProvider === normalized) {
            return;
        }

        settings.searchProvider = normalized;
        localStorage.set(this.options.keys.searchProviderKey, normalized);
        this.options.notifySettingsUpdate();
    }

    public setPaneTransitionDuration(durationMs: number): void {
        this.updateBoundedNumberSettingAndMirror({
            settingId: 'paneTransitionDuration',
            localStorageKey: this.options.keys.paneTransitionDurationKey,
            rawValue: durationMs,
            min: MIN_PANE_TRANSITION_DURATION_MS,
            max: MAX_PANE_TRANSITION_DURATION_MS,
            fallback: DEFAULT_SETTINGS.paneTransitionDuration
        });
    }

    public persistToolbarVisibility(): void {
        localStorage.set(this.options.keys.toolbarVisibilityKey, this.options.getSettings().toolbarVisibility);
        this.options.notifySettingsUpdate();
        if (this.options.isLocal('toolbarVisibility')) {
            return;
        }

        runAsyncAction(() => this.options.saveSettings());
    }

    public setUseFloatingToolbars(enabled: boolean): void {
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'useFloatingToolbars',
            localStorageKey: this.options.keys.useFloatingToolbarsKey,
            nextValue: Boolean(enabled)
        });
    }

    public setPinNavigationBanner(enabled: boolean): void {
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'pinNavigationBanner',
            localStorageKey: this.options.keys.pinNavigationBannerKey,
            nextValue: Boolean(enabled)
        });
    }

    public setNavIndent(indent: number): void {
        this.updateBoundedNumberSettingAndMirror({
            settingId: 'navIndent',
            localStorageKey: this.options.keys.navIndentKey,
            rawValue: indent,
            min: 10,
            max: 24,
            fallback: DEFAULT_SETTINGS.navIndent
        });
    }

    public setNavItemHeight(height: number): void {
        this.updateBoundedNumberSettingAndMirror({
            settingId: 'navItemHeight',
            localStorageKey: this.options.keys.navItemHeightKey,
            rawValue: height,
            min: 20,
            max: 28,
            fallback: DEFAULT_SETTINGS.navItemHeight
        });
    }

    public setNavItemHeightScaleText(enabled: boolean): void {
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'navItemHeightScaleText',
            localStorageKey: this.options.keys.navItemHeightScaleTextKey,
            nextValue: enabled
        });
    }

    public setCalendarWeeksToShow(weeks: CalendarWeeksToShow): void {
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'calendarWeeksToShow',
            localStorageKey: this.options.keys.calendarWeeksToShowKey,
            nextValue: weeks
        });
    }

    public setCalendarPlacement(placement: CalendarPlacement): void {
        const settings = this.options.getSettings();
        const previousPlacement = settings.calendarPlacement;
        if (previousPlacement === placement) {
            return;
        }

        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'calendarPlacement',
            localStorageKey: this.options.keys.calendarPlacementKey,
            nextValue: placement
        });

        if (previousPlacement === 'right-sidebar' && placement === 'left-sidebar') {
            this.setShowCalendar(true);
        }
    }

    public setCalendarLeftPlacement(placement: CalendarLeftPlacement): void {
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'calendarLeftPlacement',
            localStorageKey: this.options.keys.calendarLeftPlacementKey,
            nextValue: placement
        });
    }

    public setCompactItemHeight(height: number): void {
        this.updateBoundedNumberSettingAndMirror({
            settingId: 'compactItemHeight',
            localStorageKey: this.options.keys.compactItemHeightKey,
            rawValue: height,
            min: 20,
            max: 28,
            fallback: DEFAULT_SETTINGS.compactItemHeight
        });
    }

    public setCompactItemHeightScaleText(enabled: boolean): void {
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'compactItemHeightScaleText',
            localStorageKey: this.options.keys.compactItemHeightScaleTextKey,
            nextValue: enabled
        });
    }

    public setFeatureImageSize(size: FeatureImageSizeSetting): void {
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'featureImageSize',
            localStorageKey: this.options.keys.featureImageSizeKey,
            nextValue: size
        });
    }

    public setFeatureImagePixelSize(size: FeatureImagePixelSizeSetting): void {
        this.updateSettingAndMirrorToLocalStorage({
            settingId: 'featureImagePixelSize',
            localStorageKey: this.options.keys.featureImagePixelSizeKey,
            nextValue: size
        });
    }

    public setVaultProfile(profileId: string): void {
        const settings = this.options.getSettings();
        ensureVaultProfiles(settings);
        const nextProfile =
            settings.vaultProfiles.find(profile => profile.id === profileId) ??
            settings.vaultProfiles.find(profile => profile.id === DEFAULT_VAULT_PROFILE_ID) ??
            settings.vaultProfiles[0];

        if (!nextProfile || settings.vaultProfile === nextProfile.id) {
            return;
        }

        settings.vaultProfile = nextProfile.id;
        localStorage.set(this.options.keys.vaultProfileKey, nextProfile.id);
        this.initializeRecentDataManager();

        this.options.refreshMatcherCachesIfNeeded();
        this.options.persistSyncModeSettingUpdate('vaultProfile');
    }

    public setSearchActive(value: boolean): void {
        this.updateUXPreference('searchActive', value);
    }

    public setIncludeDescendantNotes(value: boolean): void {
        const next = Boolean(value);
        if (this.uxPreferences.includeDescendantNotes === next) {
            return;
        }

        const settings = this.options.getSettings();
        settings.includeDescendantNotes = next;
        this.updateUXPreference('includeDescendantNotes', next);
        this.options.persistSyncModeSettingUpdate('includeDescendantNotes');
    }

    public toggleIncludeDescendantNotes(): void {
        this.setIncludeDescendantNotes(!this.uxPreferences.includeDescendantNotes);
    }

    public setShowHiddenItems(value: boolean): void {
        this.updateUXPreference('showHiddenItems', value);
    }

    public toggleShowHiddenItems(): void {
        this.setShowHiddenItems(!this.uxPreferences.showHiddenItems);
    }

    public setPinShortcuts(value: boolean): void {
        this.updateUXPreference('pinShortcuts', value);
    }

    public setShowCalendar(value: boolean): void {
        const next = Boolean(value);
        if (this.uxPreferences.showCalendar === next) {
            return;
        }

        this.updateUXPreference('showCalendar', next);
    }

    public toggleShowCalendar(): void {
        this.setShowCalendar(!this.uxPreferences.showCalendar);
    }

    public notifyUXPreferencesUpdate(): void {
        if (this.uxPreferenceListeners.size === 0) {
            return;
        }

        for (const [id, listener] of this.uxPreferenceListeners) {
            try {
                listener();
            } catch (error) {
                console.error(`Failed to notify UX preferences listener "${id}"`, error);
            }
        }
    }

    private notifyRecentDataUpdate(): void {
        if (this.options.isShuttingDown()) {
            return;
        }

        const listeners = Array.from(this.recentDataListeners.values());
        listeners.forEach(listener => {
            try {
                listener();
            } catch {
                // Ignore listener errors during recent-data fanout.
            }
        });
    }

    private updateUXPreference(key: keyof UXPreferences, value: boolean): void {
        if (this.uxPreferences[key] === value) {
            return;
        }

        this.uxPreferences = {
            ...this.uxPreferences,
            [key]: value
        };
        this.persistUXPreferences();
    }

    private persistUXPreferences(notify = true): void {
        localStorage.set(this.options.keys.uxPreferencesKey, this.uxPreferences);
        if (notify) {
            this.notifyUXPreferencesUpdate();
        }
    }

    private updateSettingAndMirrorToLocalStorage<K extends SyncModeSettingId & keyof NotebookNavigatorSettings>(params: {
        settingId: K;
        localStorageKey: string;
        nextValue: NotebookNavigatorSettings[K];
    }): void {
        const settings = this.options.getSettings();
        if (settings[params.settingId] === params.nextValue) {
            return;
        }

        settings[params.settingId] = params.nextValue;
        localStorage.set(params.localStorageKey, params.nextValue);
        this.options.persistSyncModeSettingUpdate(params.settingId);
    }

    private updateBoundedNumberSettingAndMirror(params: {
        settingId: 'paneTransitionDuration' | 'navIndent' | 'navItemHeight' | 'compactItemHeight';
        localStorageKey: string;
        rawValue: number;
        min: number;
        max: number;
        fallback: number;
    }): void {
        const parsed = this.parseFiniteNumber(params.rawValue);
        const next = parsed !== null ? Math.min(params.max, Math.max(params.min, parsed)) : params.fallback;
        this.updateSettingAndMirrorToLocalStorage({
            settingId: params.settingId,
            localStorageKey: params.localStorageKey,
            nextValue: next
        });
    }

    private parseFiniteNumber(value: unknown): number | null {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === 'string') {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
        return null;
    }
}
