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
import {
    MAX_PANE_TRANSITION_DURATION_MS,
    MIN_PANE_TRANSITION_DURATION_MS,
    type LocalStorageKeys,
    type PinnedSectionCollapseKey
} from '../../types';
import { MAX_RECENT_COLORS } from '../../constants/colorPalette';
import { cloneCollapsedPinnedContextsRecord } from '../../utils/recordUtils';
import { localStorage } from '../../utils/localStorage';
import { isRecord } from '../../utils/typeGuards';
import { DEFAULT_UI_SCALE, sanitizeUIScale } from '../../utils/uiScale';
import {
    isAlphaSortOrder,
    isCalendarPlacement,
    isCalendarLeftPlacement,
    isTagSortOrder,
    type AlphaSortOrder,
    type CalendarPlacement,
    type CalendarLeftPlacement,
    type CalendarWeeksToShow,
    type NotebookNavigatorSettings,
    type TagSortOrder
} from '../types';

type ToolbarVisibilitySnapshot = NotebookNavigatorSettings['toolbarVisibility'];

export type MigrationResolution<T> = { value: T; migrated: boolean };

// Merges a per-button visibility record while preserving the expected key set.
function mergeButtonVisibility<T extends string>(defaults: Record<T, boolean>, stored: unknown): Record<T, boolean> {
    const next: Record<T, boolean> = { ...defaults };
    if (!stored || typeof stored !== 'object') {
        return next;
    }

    const entries = stored as Partial<Record<T, unknown>>;
    (Object.keys(defaults) as T[]).forEach(key => {
        const value = entries[key];
        if (typeof value === 'boolean') {
            next[key] = value;
        }
    });

    return next;
}

// Normalizes a toolbar visibility snapshot, allowing for partial/invalid stored input.
function mergeToolbarVisibility(defaultSettings: NotebookNavigatorSettings, stored: unknown): ToolbarVisibilitySnapshot {
    const defaults = defaultSettings.toolbarVisibility;
    const record = stored && typeof stored === 'object' ? (stored as Record<string, unknown>) : undefined;

    return {
        navigation: mergeButtonVisibility(defaults.navigation, record?.navigation),
        list: mergeButtonVisibility(defaults.list, record?.list)
    };
}

// Parses a finite number from a number-like value.
function parseFiniteNumber(value: unknown): number | null {
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

// Parses a pane transition duration within the supported bounds.
function parsePaneTransitionDuration(value: unknown): number | null {
    const parsed = parseFiniteNumber(value);
    if (parsed === null) {
        return null;
    }
    const rounded = Math.round(parsed);
    if (rounded < MIN_PANE_TRANSITION_DURATION_MS || rounded > MAX_PANE_TRANSITION_DURATION_MS) {
        return null;
    }
    return rounded;
}

// Parses a navigation indent value within the supported bounds.
function parseNavIndent(value: unknown): number | null {
    const parsed = parseFiniteNumber(value);
    if (parsed === null) {
        return null;
    }
    const rounded = Math.round(parsed);
    if (rounded < 10 || rounded > 24) {
        return null;
    }
    return rounded;
}

// Parses a navigation item height value within the supported bounds.
function parseNavItemHeight(value: unknown): number | null {
    const parsed = parseFiniteNumber(value);
    if (parsed === null) {
        return null;
    }
    const rounded = Math.round(parsed);
    if (rounded < 20 || rounded > 28) {
        return null;
    }
    return rounded;
}

function parseCalendarPlacement(value: unknown): CalendarPlacement | null {
    return isCalendarPlacement(value) ? value : null;
}

function parseCalendarLeftPlacement(value: unknown): CalendarLeftPlacement | null {
    return isCalendarLeftPlacement(value) ? value : null;
}

// Parses the calendar weeks-to-show setting to a supported integer value.
function parseCalendarWeeksToShow(value: unknown): CalendarWeeksToShow | null {
    const parsed = parseFiniteNumber(value);
    if (parsed === null) {
        return null;
    }
    const rounded = Math.round(parsed);
    if (rounded !== 1 && rounded !== 2 && rounded !== 3 && rounded !== 4 && rounded !== 5 && rounded !== 6) {
        return null;
    }
    return rounded;
}

// Parses a compact item height value within the supported bounds.
function parseCompactItemHeight(value: unknown): number | null {
    const parsed = parseFiniteNumber(value);
    if (parsed === null) {
        return null;
    }
    const rounded = Math.round(parsed);
    if (rounded < 20 || rounded > 28) {
        return null;
    }
    return rounded;
}

/**
 * Migrates the release check timestamp from synced settings to vault-local storage.
 * Removes the legacy synced release fields from persisted settings.
 */
export function migrateReleaseCheckState(params: {
    settings: NotebookNavigatorSettings;
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
}): boolean {
    const { settings, storedData, keys } = params;

    const storedTimestamp =
        typeof storedData?.['lastReleaseCheckAt'] === 'number' && Number.isFinite(storedData.lastReleaseCheckAt)
            ? storedData.lastReleaseCheckAt
            : null;

    const localTimestamp = localStorage.get<unknown>(keys.releaseCheckTimestampKey);

    // Prefer local values, falling back to legacy synced values if local storage is unset.
    const resolvedTimestamp =
        typeof localTimestamp === 'number' && Number.isFinite(localTimestamp) ? localTimestamp : (storedTimestamp ?? null);

    // Write back only if the resolved value differs from the stored local value.
    if (resolvedTimestamp && resolvedTimestamp !== localTimestamp) {
        localStorage.set(keys.releaseCheckTimestampKey, resolvedTimestamp);
    }

    delete (settings as unknown as Record<string, unknown>).lastReleaseCheckAt;
    delete (settings as unknown as Record<string, unknown>).latestKnownRelease;

    // Signals that synced fields existed and should be cleaned up via getPersistableSettings().
    return Boolean(storedData && ('lastReleaseCheckAt' in storedData || 'latestKnownRelease' in storedData));
}

/**
 * Migrates pinned-section collapse state from synced settings to vault-local storage.
 */
export function migrateCollapsedPinnedContexts(params: {
    settings: NotebookNavigatorSettings;
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
}): boolean {
    const { settings, storedData, keys } = params;

    const storedRecord = cloneCollapsedPinnedContextsRecord(storedData?.['collapsedPinnedContexts']);
    const localRecord = cloneCollapsedPinnedContextsRecord(localStorage.get<unknown>(keys.collapsedPinnedContextsKey));

    // Seed local storage from the legacy synced record without dropping collapse state already stored locally.
    let changed = false;
    (Object.keys(storedRecord) as PinnedSectionCollapseKey[]).forEach(key => {
        if (localRecord[key] !== true) {
            localRecord[key] = true;
            changed = true;
        }
    });
    if (changed) {
        localStorage.set(keys.collapsedPinnedContextsKey, localRecord);
    }

    delete (settings as unknown as Record<string, unknown>).collapsedPinnedContexts;

    // Signals that synced fields existed and should be cleaned up via getPersistableSettings().
    return Boolean(storedData && 'collapsedPinnedContexts' in storedData);
}

/**
 * Migrates recent colors history from synced settings to vault-local storage.
 */
export function migrateRecentColors(params: {
    settings: NotebookNavigatorSettings;
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
}): boolean {
    const { settings, storedData, keys } = params;

    const stored = storedData?.['recentColors'];
    const storedColors = Array.isArray(stored)
        ? stored.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0).slice(0, MAX_RECENT_COLORS)
        : [];

    const localStored = localStorage.get<unknown>(keys.recentColorsKey);
    const localColors = Array.isArray(localStored)
        ? localStored.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
        : [];

    // Prefer local values, otherwise seed local storage from the legacy synced list.
    const resolvedColors = localColors.length > 0 ? localColors : storedColors;
    if (resolvedColors.length > 0) {
        const capped = resolvedColors.slice(0, MAX_RECENT_COLORS);
        const shouldUpdateLocal = localColors.length !== capped.length || capped.some((color, index) => color !== localColors[index]);
        if (shouldUpdateLocal) {
            localStorage.set(keys.recentColorsKey, capped);
        }
    }

    delete (settings as unknown as Record<string, unknown>).recentColors;

    // Signals that synced fields existed and should be cleaned up via getPersistableSettings().
    return Boolean(storedData && 'recentColors' in storedData);
}

/**
 * Resolves the effective pane transition duration with local overrides.
 */
export function resolvePaneTransitionDuration(params: {
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
}): MigrationResolution<number> {
    const { storedData, keys, defaultSettings } = params;

    const storedLocal = localStorage.get<unknown>(keys.paneTransitionDurationKey);
    const localValue = parsePaneTransitionDuration(storedLocal);
    if (localValue !== null) {
        // Local storage takes precedence for per-device preferences.
        return { value: localValue, migrated: false };
    }

    const storedSetting = storedData?.['paneTransitionDuration'];
    const settingValue = parsePaneTransitionDuration(storedSetting);
    if (settingValue !== null) {
        // Migrate legacy synced value into local storage.
        localStorage.set(keys.paneTransitionDurationKey, settingValue);
        return { value: settingValue, migrated: true };
    }

    // Seed local storage with a valid default value.
    const fallback = defaultSettings.paneTransitionDuration;
    localStorage.set(keys.paneTransitionDurationKey, fallback);
    return { value: fallback, migrated: false };
}

/**
 * Resolves toolbar button visibility with local overrides.
 */
export function resolveToolbarVisibility(params: {
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
}): MigrationResolution<ToolbarVisibilitySnapshot> {
    const { storedData, keys, defaultSettings } = params;

    const storedLocal = localStorage.get<unknown>(keys.toolbarVisibilityKey);
    if (isRecord(storedLocal)) {
        // Local storage takes precedence for per-device preferences.
        return { value: mergeToolbarVisibility(defaultSettings, storedLocal), migrated: false };
    }

    const storedSetting = storedData?.['toolbarVisibility'];
    if (isRecord(storedSetting)) {
        const resolved = mergeToolbarVisibility(defaultSettings, storedSetting);
        // Migrate legacy synced value into local storage.
        localStorage.set(keys.toolbarVisibilityKey, resolved);
        return { value: resolved, migrated: true };
    }

    // Seed local storage with a valid default value.
    const fallback = mergeToolbarVisibility(defaultSettings, null);
    localStorage.set(keys.toolbarVisibilityKey, fallback);
    return { value: fallback, migrated: false };
}

/**
 * Resolves the navigation indent with local overrides.
 */
export function resolveNavIndent(params: {
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
}): MigrationResolution<number> {
    const { storedData, keys, defaultSettings } = params;

    const storedLocal = localStorage.get<unknown>(keys.navIndentKey);
    const localValue = parseNavIndent(storedLocal);
    if (localValue !== null) {
        // Local storage takes precedence for per-device preferences.
        return { value: localValue, migrated: false };
    }

    const storedSetting = storedData?.['navIndent'];
    const settingValue = parseNavIndent(storedSetting);
    if (settingValue !== null) {
        // Migrate legacy synced value into local storage.
        localStorage.set(keys.navIndentKey, settingValue);
        return { value: settingValue, migrated: true };
    }

    // Seed local storage with a valid default value.
    const fallback = defaultSettings.navIndent;
    localStorage.set(keys.navIndentKey, fallback);
    return { value: fallback, migrated: false };
}

/**
 * Resolves the navigation item height with local overrides.
 */
export function resolveNavItemHeight(params: {
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
}): MigrationResolution<number> {
    const { storedData, keys, defaultSettings } = params;

    const storedLocal = localStorage.get<unknown>(keys.navItemHeightKey);
    const localValue = parseNavItemHeight(storedLocal);
    if (localValue !== null) {
        // Local storage takes precedence for per-device preferences.
        return { value: localValue, migrated: false };
    }

    const storedSetting = storedData?.['navItemHeight'];
    const settingValue = parseNavItemHeight(storedSetting);
    if (settingValue !== null) {
        // Migrate legacy synced value into local storage.
        localStorage.set(keys.navItemHeightKey, settingValue);
        return { value: settingValue, migrated: true };
    }

    // Seed local storage with a valid default value.
    const fallback = defaultSettings.navItemHeight;
    localStorage.set(keys.navItemHeightKey, fallback);
    return { value: fallback, migrated: false };
}

/**
 * Resolves the navigation item height text scaling toggle with local overrides.
 */
export function resolveNavItemHeightScaleText(params: {
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
}): MigrationResolution<boolean> {
    const { storedData, keys, defaultSettings } = params;

    const storedLocal = localStorage.get<unknown>(keys.navItemHeightScaleTextKey);
    if (typeof storedLocal === 'boolean') {
        // Local storage takes precedence for per-device preferences.
        return { value: storedLocal, migrated: false };
    }

    const storedSetting = storedData?.['navItemHeightScaleText'];
    if (typeof storedSetting === 'boolean') {
        // Migrate legacy synced value into local storage.
        localStorage.set(keys.navItemHeightScaleTextKey, storedSetting);
        return { value: storedSetting, migrated: true };
    }

    // Seed local storage with a valid default value.
    const fallback = defaultSettings.navItemHeightScaleText;
    localStorage.set(keys.navItemHeightScaleTextKey, fallback);
    return { value: fallback, migrated: false };
}

/**
 * Resolves the navigation banner pinned toggle with local overrides.
 */
export function resolvePinNavigationBanner(params: {
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
}): MigrationResolution<boolean> {
    const { storedData, keys, defaultSettings } = params;

    const storedLocal = localStorage.get<unknown>(keys.pinNavigationBannerKey);
    if (typeof storedLocal === 'boolean') {
        // Local storage takes precedence for per-device preferences.
        return { value: storedLocal, migrated: false };
    }

    const storedSetting = storedData?.['pinNavigationBanner'];
    if (typeof storedSetting === 'boolean') {
        // Migrate legacy synced value into local storage.
        localStorage.set(keys.pinNavigationBannerKey, storedSetting);
        return { value: storedSetting, migrated: true };
    }

    // Seed local storage with a valid default value.
    const fallback = defaultSettings.pinNavigationBanner;
    localStorage.set(keys.pinNavigationBannerKey, fallback);
    return { value: fallback, migrated: false };
}

/**
 * Resolves the calendar placement value with local overrides.
 */
export function resolveCalendarPlacement(params: {
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
}): MigrationResolution<CalendarPlacement> {
    const { storedData, keys, defaultSettings } = params;

    const storedLocal = localStorage.get<unknown>(keys.calendarPlacementKey);
    const localValue = parseCalendarPlacement(storedLocal);
    if (localValue !== null) {
        // Local storage takes precedence for per-device preferences.
        return { value: localValue, migrated: false };
    }

    const storedSetting = storedData?.['calendarPlacement'];
    const settingValue = parseCalendarPlacement(storedSetting);
    if (settingValue !== null) {
        // Migrate legacy synced value into local storage.
        localStorage.set(keys.calendarPlacementKey, settingValue);
        return { value: settingValue, migrated: true };
    }

    // Seed local storage with a valid default value.
    const fallback = defaultSettings.calendarPlacement;
    localStorage.set(keys.calendarPlacementKey, fallback);
    return { value: fallback, migrated: false };
}

/**
 * Resolves the calendar single-pane placement for left sidebar with local overrides.
 */
export function resolveCalendarLeftPlacement(params: {
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
}): MigrationResolution<CalendarLeftPlacement> {
    const { storedData, keys, defaultSettings } = params;

    const storedLocal = localStorage.get<unknown>(keys.calendarLeftPlacementKey);
    const localValue = parseCalendarLeftPlacement(storedLocal);
    if (localValue !== null) {
        // Local storage takes precedence for per-device preferences.
        return { value: localValue, migrated: false };
    }

    const storedSetting = storedData?.['calendarLeftPlacement'];
    const settingValue = parseCalendarLeftPlacement(storedSetting);
    if (settingValue !== null) {
        // Migrate legacy synced value into local storage.
        localStorage.set(keys.calendarLeftPlacementKey, settingValue);
        return { value: settingValue, migrated: true };
    }

    // Seed local storage with a valid default value.
    const fallback = defaultSettings.calendarLeftPlacement;
    localStorage.set(keys.calendarLeftPlacementKey, fallback);
    return { value: fallback, migrated: false };
}

/**
 * Resolves the calendar weeks-to-show value with local overrides.
 */
export function resolveCalendarWeeksToShow(params: {
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
}): MigrationResolution<CalendarWeeksToShow> {
    const { storedData, keys, defaultSettings } = params;

    const storedLocal = localStorage.get<unknown>(keys.calendarWeeksToShowKey);
    const localValue = parseCalendarWeeksToShow(storedLocal);
    if (localValue !== null) {
        // Local storage takes precedence for per-device preferences.
        return { value: localValue, migrated: false };
    }

    const storedSetting = storedData?.['calendarWeeksToShow'];
    const settingValue = parseCalendarWeeksToShow(storedSetting);
    if (settingValue !== null) {
        // Migrate legacy synced value into local storage.
        localStorage.set(keys.calendarWeeksToShowKey, settingValue);
        return { value: settingValue, migrated: true };
    }

    // Seed local storage with a valid default value.
    const fallback = defaultSettings.calendarWeeksToShow;
    localStorage.set(keys.calendarWeeksToShowKey, fallback);
    return { value: fallback, migrated: false };
}

/**
 * Resolves the compact list item height with local overrides.
 */
export function resolveCompactItemHeight(params: {
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
}): MigrationResolution<number> {
    const { storedData, keys, defaultSettings } = params;

    const storedLocal = localStorage.get<unknown>(keys.compactItemHeightKey);
    const localValue = parseCompactItemHeight(storedLocal);
    if (localValue !== null) {
        // Local storage takes precedence for per-device preferences.
        return { value: localValue, migrated: false };
    }

    const storedSetting = storedData?.['compactItemHeight'];
    const settingValue = parseCompactItemHeight(storedSetting);
    if (settingValue !== null) {
        // Migrate legacy synced value into local storage.
        localStorage.set(keys.compactItemHeightKey, settingValue);
        return { value: settingValue, migrated: true };
    }

    // Seed local storage with a valid default value.
    const fallback = defaultSettings.compactItemHeight;
    localStorage.set(keys.compactItemHeightKey, fallback);
    return { value: fallback, migrated: false };
}

/**
 * Resolves the compact list item height text scaling toggle with local overrides.
 */
export function resolveCompactItemHeightScaleText(params: {
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
}): MigrationResolution<boolean> {
    const { storedData, keys, defaultSettings } = params;

    const storedLocal = localStorage.get<unknown>(keys.compactItemHeightScaleTextKey);
    if (typeof storedLocal === 'boolean') {
        // Local storage takes precedence for per-device preferences.
        return { value: storedLocal, migrated: false };
    }

    const storedSetting = storedData?.['compactItemHeightScaleText'];
    if (typeof storedSetting === 'boolean') {
        // Migrate legacy synced value into local storage.
        localStorage.set(keys.compactItemHeightScaleTextKey, storedSetting);
        return { value: storedSetting, migrated: true };
    }

    // Seed local storage with a valid default value.
    const fallback = defaultSettings.compactItemHeightScaleText;
    localStorage.set(keys.compactItemHeightScaleTextKey, fallback);
    return { value: fallback, migrated: false };
}

/**
 * Resolves the effective tag sort order preference with local overrides.
 */
export function resolveTagSortOrder(params: {
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
}): TagSortOrder {
    const { storedData, keys, defaultSettings } = params;

    const storedLocal = localStorage.get<unknown>(keys.tagSortOrderKey);
    const storedLocalValue = typeof storedLocal === 'string' ? storedLocal : null;
    if (storedLocalValue && isTagSortOrder(storedLocalValue)) {
        // Local storage takes precedence for per-device preferences.
        return storedLocalValue;
    }

    const storedSetting = storedData?.['tagSortOrder'];
    const storedSettingValue = typeof storedSetting === 'string' ? storedSetting : null;
    if (storedSettingValue && isTagSortOrder(storedSettingValue)) {
        // Migrate legacy synced value into local storage.
        localStorage.set(keys.tagSortOrderKey, storedSettingValue);
        return storedSettingValue;
    }

    // Seed local storage with a valid default value.
    localStorage.set(keys.tagSortOrderKey, defaultSettings.tagSortOrder);
    return defaultSettings.tagSortOrder;
}

/**
 * Resolves the effective property sort order preference with local overrides.
 */
export function resolvePropertySortOrder(params: {
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
}): TagSortOrder {
    const { storedData, keys, defaultSettings } = params;

    const storedLocal = localStorage.get<unknown>(keys.propertySortOrderKey);
    const storedLocalValue = typeof storedLocal === 'string' ? storedLocal : null;
    if (storedLocalValue && isTagSortOrder(storedLocalValue)) {
        // Local storage takes precedence for per-device preferences.
        return storedLocalValue;
    }

    const storedSetting = storedData?.['propertySortOrder'];
    const storedSettingValue = typeof storedSetting === 'string' ? storedSetting : null;
    if (storedSettingValue && isTagSortOrder(storedSettingValue)) {
        // Migrate legacy synced value into local storage.
        localStorage.set(keys.propertySortOrderKey, storedSettingValue);
        return storedSettingValue;
    }

    // Seed local storage with a valid default value.
    localStorage.set(keys.propertySortOrderKey, defaultSettings.propertySortOrder);
    return defaultSettings.propertySortOrder;
}

/**
 * Resolves the effective folder sort order preference with local overrides.
 */
export function resolveFolderSortOrder(params: {
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    defaultSettings: NotebookNavigatorSettings;
}): AlphaSortOrder {
    const { storedData, keys, defaultSettings } = params;

    const storedLocal = localStorage.get<unknown>(keys.folderSortOrderKey);
    const storedLocalValue = typeof storedLocal === 'string' ? storedLocal : null;
    if (storedLocalValue && isAlphaSortOrder(storedLocalValue)) {
        // Local storage takes precedence for per-device preferences.
        return storedLocalValue;
    }

    const storedSetting = storedData?.['folderSortOrder'];
    const storedSettingValue = typeof storedSetting === 'string' ? storedSetting : null;
    if (storedSettingValue && isAlphaSortOrder(storedSettingValue)) {
        // Mirror the synced value into local storage when switching to local.
        localStorage.set(keys.folderSortOrderKey, storedSettingValue);
        return storedSettingValue;
    }

    // Seed local storage with a valid default value.
    localStorage.set(keys.folderSortOrderKey, defaultSettings.folderSortOrder);
    return defaultSettings.folderSortOrder;
}

// Resolves UI scale from local storage, migrating from legacy synced values if present.
function resolveUIScaleFromStorage(storageKey: string, storedSetting: unknown): number {
    const parseScale = (value: unknown): number | null => {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return sanitizeUIScale(value);
        }
        if (typeof value === 'string') {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
                return sanitizeUIScale(parsed);
            }
        }
        return null;
    };

    const storedLocal = localStorage.get<unknown>(storageKey);
    const localScale = parseScale(storedLocal);
    if (localScale !== null) {
        // Local storage takes precedence for per-device preferences.
        return localScale;
    }

    const settingScale = parseScale(storedSetting);
    if (settingScale !== null) {
        // Migrate legacy synced value into local storage.
        localStorage.set(storageKey, settingScale);
        return settingScale;
    }

    // Seed local storage with a valid default value.
    localStorage.set(storageKey, DEFAULT_UI_SCALE);
    return DEFAULT_UI_SCALE;
}

/**
 * Migrates desktop and mobile UI scales from synced settings to vault-local storage.
 */
export function migrateUIScales(params: {
    settings: NotebookNavigatorSettings;
    storedData: Record<string, unknown> | null;
    keys: LocalStorageKeys;
    shouldPersistDesktopScale: boolean;
    shouldPersistMobileScale: boolean;
}): { migrated: boolean; shouldPersistDesktopScale: boolean; shouldPersistMobileScale: boolean } {
    const { settings, storedData, keys } = params;
    let { shouldPersistDesktopScale, shouldPersistMobileScale } = params;

    const storedDesktopScale = storedData?.['desktopScale'];
    const storedMobileScale = storedData?.['mobileScale'];
    const hadLegacyFields = Boolean(storedData && ('desktopScale' in storedData || 'mobileScale' in storedData));

    // Keeps legacy scale values usable without reintroducing removed fields from other devices
    const sanitizeScale = (value: unknown, fallback: number): number => {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return sanitizeUIScale(value);
        }
        if (typeof value === 'string') {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
                return sanitizeUIScale(parsed);
            }
        }
        return sanitizeUIScale(fallback);
    };

    if (Platform.isMobile) {
        // Uses local scale for the current device type and keeps the opposite value as legacy-only.
        const resolvedMobile = resolveUIScaleFromStorage(keys.uiScaleKey, storedMobileScale);
        settings.mobileScale = resolvedMobile;
        settings.desktopScale = sanitizeScale(storedDesktopScale, settings.desktopScale);
        if (shouldPersistMobileScale) {
            shouldPersistMobileScale = false;
        }
    } else {
        // Uses local scale for the current device type and keeps the opposite value as legacy-only.
        const resolvedDesktop = resolveUIScaleFromStorage(keys.uiScaleKey, storedDesktopScale);
        settings.desktopScale = resolvedDesktop;
        settings.mobileScale = sanitizeScale(storedMobileScale, settings.mobileScale);
        if (shouldPersistDesktopScale) {
            shouldPersistDesktopScale = false;
        }
    }

    return { migrated: hadLegacyFields, shouldPersistDesktopScale, shouldPersistMobileScale };
}
