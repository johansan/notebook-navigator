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

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import type NotebookNavigatorPlugin from '../main';
import type { DualPaneOrientation } from '../types';
import type { NotebookNavigatorSettings, VaultProfile } from '../settings/types';
import type { FileVisibility } from '../utils/fileTypeUtils';
import type { ShortcutEntry } from '../types/shortcuts';
import {
    getShortcutStartTargetFingerprint,
    isFolderShortcut,
    isNoteShortcut,
    isSearchShortcut,
    isTagShortcut,
    isPropertyShortcut
} from '../types/shortcuts';
import {
    areNavRainbowSettingsEqual,
    cloneNavRainbowSettings,
    clonePropertyKeys,
    cloneShortcuts,
    getActiveVaultProfile
} from '../utils/vaultProfiles';
import { clonePinnedNotesRecord, isStringRecordValue, sanitizeRecord, type PinnedNoteContextValue } from '../utils/recordUtils';
import { areStringArraysEqual } from '../utils/arrayUtils';
import { snapshotListPaneAppearanceMap, type ListPaneAppearance } from '../settings/listPaneAppearance';
import { buildFileNameIconNeedles, type FileNameIconNeedle } from '../utils/fileIconUtils';

// Separate contexts for state and update function
type SettingsStateValue = NotebookNavigatorSettings & { dualPaneOrientation: DualPaneOrientation };
export interface ActiveProfileState {
    profile: VaultProfile;
    hiddenFolders: string[];
    descendantExcludedFolders: string[];
    hiddenFileProperties: string[];
    hiddenFileNames: string[];
    hiddenTags: string[];
    hiddenFileTags: string[];
    fileVisibility: FileVisibility;
    propertyKeys: VaultProfile['propertyKeys'];
    navigationBanner: string | null;
}

const SettingsStateContext = createContext<SettingsStateValue | null>(null);
const SettingsUpdateContext = createContext<((updater: (settings: NotebookNavigatorSettings) => void) => Promise<void>) | null>(null);
const ActiveProfileContext = createContext<ActiveProfileState | null>(null);
interface SettingsDerivedValue {
    fileNameIconNeedles: readonly FileNameIconNeedle[];
}
const SettingsDerivedContext = createContext<SettingsDerivedValue | null>(null);

const normalizeShortcutAlias = (alias: string | undefined): string | undefined => {
    return alias && alias.length > 0 ? alias : undefined;
};

const areShortcutAliasesEqual = (prevAlias: string | undefined, nextAlias: string | undefined): boolean => {
    return normalizeShortcutAlias(prevAlias) === normalizeShortcutAlias(nextAlias);
};

const areShortcutStartTargetsEqual = (prevStartTarget: unknown, nextStartTarget: unknown): boolean => {
    return getShortcutStartTargetFingerprint(prevStartTarget) === getShortcutStartTargetFingerprint(nextStartTarget);
};

const arePropertyKeysEqual = (prev?: VaultProfile['propertyKeys'], next?: VaultProfile['propertyKeys']): boolean => {
    const prevEntries = Array.isArray(prev) ? prev : [];
    const nextEntries = Array.isArray(next) ? next : [];
    if (prevEntries.length !== nextEntries.length) {
        return false;
    }

    for (let index = 0; index < prevEntries.length; index += 1) {
        const previous = prevEntries[index];
        const current = nextEntries[index];
        if (
            previous.key !== current.key ||
            previous.showInNavigation !== current.showInNavigation ||
            previous.showInList !== current.showInList ||
            previous.showInFileMenu !== current.showInFileMenu
        ) {
            return false;
        }
    }

    return true;
};

// Compares shortcut lists to reuse the previous profile object when entries are unchanged.
const areShortcutsEqual = (prev?: ShortcutEntry[] | null, next?: ShortcutEntry[] | null): boolean => {
    if (prev === next) {
        return true;
    }
    const prevList = Array.isArray(prev) ? prev : [];
    const nextList = Array.isArray(next) ? next : [];
    if (prevList.length !== nextList.length) {
        return false;
    }

    for (let index = 0; index < prevList.length; index += 1) {
        const prevShortcut = prevList[index];
        const nextShortcut = nextList[index];

        if (prevShortcut.type !== nextShortcut.type) {
            return false;
        }

        if (isFolderShortcut(prevShortcut)) {
            if (
                !isFolderShortcut(nextShortcut) ||
                prevShortcut.path !== nextShortcut.path ||
                !areShortcutAliasesEqual(prevShortcut.alias, nextShortcut.alias)
            ) {
                return false;
            }
            continue;
        }

        if (isNoteShortcut(prevShortcut)) {
            if (
                !isNoteShortcut(nextShortcut) ||
                prevShortcut.path !== nextShortcut.path ||
                !areShortcutAliasesEqual(prevShortcut.alias, nextShortcut.alias)
            ) {
                return false;
            }
            continue;
        }

        if (isTagShortcut(prevShortcut)) {
            if (
                !isTagShortcut(nextShortcut) ||
                prevShortcut.tagPath !== nextShortcut.tagPath ||
                !areShortcutAliasesEqual(prevShortcut.alias, nextShortcut.alias)
            ) {
                return false;
            }
            continue;
        }

        if (isPropertyShortcut(prevShortcut)) {
            if (
                !isPropertyShortcut(nextShortcut) ||
                prevShortcut.nodeId !== nextShortcut.nodeId ||
                !areShortcutAliasesEqual(prevShortcut.alias, nextShortcut.alias)
            ) {
                return false;
            }
            continue;
        }

        if (!isSearchShortcut(prevShortcut) || !isSearchShortcut(nextShortcut)) {
            return false;
        }
        if (
            prevShortcut.name !== nextShortcut.name ||
            prevShortcut.query !== nextShortcut.query ||
            prevShortcut.provider !== nextShortcut.provider ||
            !areShortcutStartTargetsEqual(prevShortcut.startTarget, nextShortcut.startTarget)
        ) {
            return false;
        }
    }

    return true;
};

const arePinnedNotesEqual = (
    previous: Record<string, PinnedNoteContextValue> | null,
    next: Record<string, PinnedNoteContextValue>
): boolean => {
    if (!previous) {
        return false;
    }

    const previousKeys = Object.keys(previous);
    const nextKeys = Object.keys(next);
    if (previousKeys.length !== nextKeys.length) {
        return false;
    }

    for (const path of nextKeys) {
        const previousContext = previous[path];
        const nextContext = next[path];
        if (
            !previousContext ||
            previousContext.folder !== nextContext.folder ||
            previousContext.tag !== nextContext.tag ||
            previousContext.property !== nextContext.property
        ) {
            return false;
        }
    }

    return true;
};

interface SettingsProviderProps {
    children: ReactNode;
    plugin: NotebookNavigatorPlugin;
}

export function SettingsProvider({ children, plugin }: SettingsProviderProps) {
    // Use a version counter to force re-renders when settings change
    const [version, setVersion] = useState(0);
    const previousActiveProfileRef = useRef<ActiveProfileState | null>(null);
    const previousInterfaceIconsRef = useRef<{
        raw: NotebookNavigatorSettings['interfaceIcons'] | undefined;
        sanitized: Record<string, string>;
    } | null>(null);
    const previousPinnedNotesRef = useRef<Record<string, PinnedNoteContextValue> | null>(null);
    const previousAppearanceMapsRef = useRef<{
        folders: Record<string, ListPaneAppearance>;
        tags: Record<string, ListPaneAppearance>;
        properties: Record<string, ListPaneAppearance>;
    } | null>(null);

    const updateSettings = useCallback(
        async (updater: (settings: NotebookNavigatorSettings) => void) => {
            // Update the settings object
            updater(plugin.settings);

            // Save to storage
            await plugin.saveSettingsAndUpdate();

            // The listener registered in useEffect will handle the re-render
            // by incrementing the version when onSettingsUpdate is called
        },
        [plugin]
    );

    // Create a stable settings object that changes reference when version changes
    // This ensures components using SettingsStateContext re-render when settings change
    // NOTE: settings are mutated in place; the version counter forces object recreation
    const settingsValue = React.useMemo<SettingsStateValue>(() => {
        // Clone tag color records so settings updates change object identity and trigger consumers
        const tagColors = sanitizeRecord(plugin.settings.tagColors);
        const tagBackgroundColors = sanitizeRecord(plugin.settings.tagBackgroundColors);
        const propertyColors = sanitizeRecord(plugin.settings.propertyColors);
        const propertyBackgroundColors = sanitizeRecord(plugin.settings.propertyBackgroundColors);
        const virtualFolderColors = sanitizeRecord(plugin.settings.virtualFolderColors);
        const virtualFolderBackgroundColors = sanitizeRecord(plugin.settings.virtualFolderBackgroundColors);
        const tagIcons = sanitizeRecord(plugin.settings.tagIcons, isStringRecordValue);
        const propertyIcons = sanitizeRecord(plugin.settings.propertyIcons, isStringRecordValue);
        const calendarMonthHighlights = sanitizeRecord(plugin.settings.calendarMonthHighlights, isStringRecordValue);
        const rawInterfaceIcons = plugin.settings.interfaceIcons;
        const interfaceIconsCache = previousInterfaceIconsRef.current;
        const interfaceIcons =
            interfaceIconsCache && interfaceIconsCache.raw === rawInterfaceIcons
                ? interfaceIconsCache.sanitized
                : sanitizeRecord(rawInterfaceIcons, isStringRecordValue);
        if (!interfaceIconsCache || interfaceIconsCache.raw !== rawInterfaceIcons) {
            previousInterfaceIconsRef.current = { raw: rawInterfaceIcons, sanitized: interfaceIcons };
        }
        const clonedPinnedNotes = clonePinnedNotesRecord(plugin.settings.pinnedNotes);
        const previousPinnedNotes = previousPinnedNotesRef.current;
        const pinnedNotes =
            previousPinnedNotes && arePinnedNotesEqual(previousPinnedNotes, clonedPinnedNotes) ? previousPinnedNotes : clonedPinnedNotes;
        previousPinnedNotesRef.current = pinnedNotes;
        const previousAppearanceMaps = previousAppearanceMapsRef.current;
        const folderAppearances = snapshotListPaneAppearanceMap(plugin.settings.folderAppearances, previousAppearanceMaps?.folders);
        const tagAppearances = snapshotListPaneAppearanceMap(plugin.settings.tagAppearances, previousAppearanceMaps?.tags);
        const propertyAppearances = snapshotListPaneAppearanceMap(plugin.settings.propertyAppearances, previousAppearanceMaps?.properties);
        previousAppearanceMapsRef.current = {
            folders: folderAppearances,
            tags: tagAppearances,
            properties: propertyAppearances
        };
        const nextSettings: SettingsStateValue = {
            ...plugin.settings,
            dualPaneOrientation: plugin.getDualPaneOrientation(),
            tagColors,
            tagBackgroundColors,
            propertyColors,
            propertyBackgroundColors,
            virtualFolderColors,
            virtualFolderBackgroundColors,
            tagIcons,
            propertyIcons,
            calendarMonthHighlights,
            interfaceIcons,
            folderAppearances,
            tagAppearances,
            propertyAppearances,
            pinnedNotes
        };
        // Deep copy vault profiles to prevent mutations from affecting the original settings
        if (Array.isArray(plugin.settings.vaultProfiles)) {
            // Create deep copies of profile arrays to prevent shared references
            nextSettings.vaultProfiles = plugin.settings.vaultProfiles.map(profile => ({
                ...profile,
                hiddenFolders: Array.isArray(profile.hiddenFolders) ? [...profile.hiddenFolders] : [],
                descendantExcludedFolders: Array.isArray(profile.descendantExcludedFolders) ? [...profile.descendantExcludedFolders] : [],
                hiddenFileProperties: Array.isArray(profile.hiddenFileProperties) ? [...profile.hiddenFileProperties] : [],
                hiddenFileNames: Array.isArray(profile.hiddenFileNames) ? [...profile.hiddenFileNames] : [],
                hiddenTags: Array.isArray(profile.hiddenTags) ? [...profile.hiddenTags] : [],
                hiddenFileTags: Array.isArray(profile.hiddenFileTags) ? [...profile.hiddenFileTags] : [],
                propertyKeys: clonePropertyKeys(profile.propertyKeys),
                shortcuts: cloneShortcuts(profile.shortcuts),
                navRainbow: cloneNavRainbowSettings(profile.navRainbow)
            }));
        }
        void version; // Keep dependency so settings snapshot recreates when updates are published
        return nextSettings;
    }, [plugin, version]);

    const derivedValue = React.useMemo<SettingsDerivedValue>(() => {
        const fileNameIconNeedles = settingsValue.showFilenameMatchIcons ? buildFileNameIconNeedles(settingsValue.fileNameIconMap) : [];
        return { fileNameIconNeedles };
    }, [settingsValue.showFilenameMatchIcons, settingsValue.fileNameIconMap]);

    // Listen for settings updates from the plugin (e.g., from settings tab)
    useEffect(() => {
        const id = `settings-provider-${Date.now()}`;

        const handleSettingsUpdate = () => {
            // Force re-render by incrementing version
            setVersion(v => v + 1);
        };

        plugin.registerSettingsUpdateListener(id, handleSettingsUpdate);

        return () => {
            plugin.unregisterSettingsUpdateListener(id);
        };
    }, [plugin]);

    // Memoize the active profile snapshot and reuse the previous object when nothing changed.
    const activeProfileValue = React.useMemo<ActiveProfileState>(() => {
        const profile = getActiveVaultProfile(settingsValue);
        const previous = previousActiveProfileRef.current;
        const isSameProfile = previous?.profile.id === profile.id;

        const hiddenFoldersEqual = areStringArraysEqual(previous?.profile.hiddenFolders ?? [], profile.hiddenFolders);
        const descendantExcludedFoldersEqual = areStringArraysEqual(
            previous?.profile.descendantExcludedFolders ?? [],
            profile.descendantExcludedFolders
        );
        const hiddenFilePropertiesEqual = areStringArraysEqual(previous?.profile.hiddenFileProperties ?? [], profile.hiddenFileProperties);
        const hiddenFileNamesEqual = areStringArraysEqual(previous?.profile.hiddenFileNames ?? [], profile.hiddenFileNames);
        const hiddenTagsEqual = areStringArraysEqual(previous?.profile.hiddenTags ?? [], profile.hiddenTags);
        const hiddenFileTagsEqual = areStringArraysEqual(previous?.profile.hiddenFileTags ?? [], profile.hiddenFileTags);
        const fileVisibilityEqual = previous?.profile.fileVisibility === profile.fileVisibility;
        const navigationBanner = profile.navigationBanner ?? null;
        const navigationBannerEqual = previous?.navigationBanner === navigationBanner;
        const periodicNotesFolderEqual = previous?.profile.periodicNotesFolder === profile.periodicNotesFolder;
        const nameEqual = previous?.profile.name === profile.name;
        const propertyKeysEqual = arePropertyKeysEqual(previous?.profile.propertyKeys, profile.propertyKeys);
        const shortcutsEqual = areShortcutsEqual(previous?.profile.shortcuts, profile.shortcuts);
        const navRainbowEqual = areNavRainbowSettingsEqual(previous?.profile.navRainbow, profile.navRainbow);

        if (
            isSameProfile &&
            hiddenFoldersEqual &&
            descendantExcludedFoldersEqual &&
            hiddenFilePropertiesEqual &&
            hiddenFileNamesEqual &&
            hiddenTagsEqual &&
            hiddenFileTagsEqual &&
            fileVisibilityEqual &&
            navigationBannerEqual &&
            periodicNotesFolderEqual &&
            nameEqual &&
            propertyKeysEqual &&
            shortcutsEqual &&
            navRainbowEqual &&
            previous
        ) {
            return previous;
        }

        const nextActiveProfile: ActiveProfileState = {
            profile,
            hiddenFolders: profile.hiddenFolders,
            descendantExcludedFolders: profile.descendantExcludedFolders,
            hiddenFileProperties: profile.hiddenFileProperties,
            hiddenFileNames: profile.hiddenFileNames,
            hiddenTags: profile.hiddenTags,
            hiddenFileTags: profile.hiddenFileTags,
            fileVisibility: profile.fileVisibility,
            propertyKeys: propertyKeysEqual && previous ? previous.propertyKeys : profile.propertyKeys,
            navigationBanner
        };

        previousActiveProfileRef.current = nextActiveProfile;
        return nextActiveProfile;
    }, [settingsValue]);

    return (
        <SettingsStateContext.Provider value={settingsValue}>
            <SettingsDerivedContext.Provider value={derivedValue}>
                <ActiveProfileContext.Provider value={activeProfileValue}>
                    <SettingsUpdateContext.Provider value={updateSettings}>{children}</SettingsUpdateContext.Provider>
                </ActiveProfileContext.Provider>
            </SettingsDerivedContext.Provider>
        </SettingsStateContext.Provider>
    );
}

// Hook to get only settings state (use this when you only need to read settings)
export function useSettingsState(): SettingsStateValue {
    const context = useContext(SettingsStateContext);
    if (context === null) {
        throw new Error('useSettingsState must be used within a SettingsProvider');
    }
    return context;
}

// Hook to get only the update function (use this when you only need to update settings)
export function useSettingsUpdate() {
    const context = useContext(SettingsUpdateContext);
    if (!context) {
        throw new Error('useSettingsUpdate must be used within a SettingsProvider');
    }
    return context;
}

export function useSettingsDerived(): SettingsDerivedValue {
    const context = useContext(SettingsDerivedContext);
    if (!context) {
        throw new Error('useSettingsDerived must be used within a SettingsProvider');
    }
    return context;
}

export function useActiveProfile(): ActiveProfileState {
    const context = useContext(ActiveProfileContext);
    if (!context) {
        throw new Error('useActiveProfile must be used within a SettingsProvider');
    }
    return context;
}
