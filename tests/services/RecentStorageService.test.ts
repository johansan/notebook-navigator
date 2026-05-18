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
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

// Vitest mock factory functions are hoisted. Any referenced variables must be initialized via `vi.hoisted`
// so they exist when the mock is evaluated.
const { mockLocalStorageStore, localStorageInit, localStorageGet, localStorageSet, localStorageRemove } = vi.hoisted(() => {
    const mockLocalStorageStore = new Map<string, unknown>();
    const localStorageInit = vi.fn();
    const localStorageGet = vi.fn((key: string) => (mockLocalStorageStore.has(key) ? (mockLocalStorageStore.get(key) ?? null) : null));
    const localStorageSet = vi.fn((key: string, value: unknown) => {
        mockLocalStorageStore.set(key, value);
        return true;
    });
    const localStorageRemove = vi.fn((key: string) => {
        mockLocalStorageStore.delete(key);
        return true;
    });

    return { mockLocalStorageStore, localStorageInit, localStorageGet, localStorageSet, localStorageRemove };
});

vi.mock('../../src/utils/localStorage', () => {
    return {
        localStorage: {
            init: localStorageInit,
            get: localStorageGet,
            set: localStorageSet,
            remove: localStorageRemove
        }
    };
});

vi.stubGlobal('window', activeWindow);

import { RecentStorageService } from '../../src/services/RecentStorageService';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { STORAGE_KEYS } from '../../src/types';

describe('RecentStorageService', () => {
    let service: RecentStorageService;
    const notifyChange = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        mockLocalStorageStore.clear();
        vi.clearAllMocks();
        service = new RecentStorageService({
            settings: DEFAULT_SETTINGS,
            keys: STORAGE_KEYS,
            notifyChange,
            vaultProfileId: DEFAULT_SETTINGS.vaultProfile
        });
        service.hydrate();
    });

    afterEach(() => {
        service.flushPendingPersists();
        vi.useRealTimers();
    });

    it('returns independent copies of the recent icons map', () => {
        const icons = service.getRecentIcons();
        icons.lucide = ['lucide-home'];

        const next = service.getRecentIcons();
        expect(next).toEqual({});
    });

    it('persists icon selections when callers mutate the returned map', () => {
        const icons = service.getRecentIcons();
        icons.lucide = ['lucide-home'];

        service.setRecentIcons(icons);
        service.flushPendingPersists();

        expect(localStorageSet).toHaveBeenCalledWith(STORAGE_KEYS.recentIconsKey, {
            lucide: ['home']
        });
        expect(notifyChange).toHaveBeenCalled();
    });

    it('normalizes legacy phosphor identifiers when persisting recent icons', () => {
        const icons = service.getRecentIcons();
        icons.phosphor = ['phosphor:ph-apple-logo', 'ph-apple-logo', 'phosphor:apple-logo'];

        service.setRecentIcons(icons);
        service.flushPendingPersists();

        expect(localStorageSet).toHaveBeenCalledWith(STORAGE_KEYS.recentIconsKey, {
            phosphor: ['phosphor:apple-logo']
        });
    });

    it('cleans stored legacy identifiers on hydrate', () => {
        mockLocalStorageStore.set(STORAGE_KEYS.recentIconsKey, {
            phosphor: ['phosphor:ph-sword']
        });

        service.hydrate();

        const icons = service.getRecentIcons();
        expect(icons.phosphor).toEqual(['phosphor:sword']);
        expect(localStorageSet).toHaveBeenCalledWith(STORAGE_KEYS.recentIconsKey, {
            phosphor: ['phosphor:sword']
        });
    });

    it('removes non-string values from stored recent icons records', () => {
        mockLocalStorageStore.set(STORAGE_KEYS.recentIconsKey, {
            lucide: ['home', 123]
        });

        service.hydrate();

        const icons = service.getRecentIcons();
        expect(icons.lucide).toEqual(['home']);
        expect(localStorageSet).toHaveBeenCalledWith(STORAGE_KEYS.recentIconsKey, {
            lucide: ['home']
        });
    });

    it('migrates legacy recent notes lists to the active vault profile', () => {
        const vaultProfileId = 'profile-a';
        const settings = {
            ...DEFAULT_SETTINGS,
            vaultProfile: vaultProfileId,
            vaultProfiles: [{ ...DEFAULT_SETTINGS.vaultProfiles[0], id: vaultProfileId }]
        };

        mockLocalStorageStore.set(STORAGE_KEYS.recentNotesKey, ['a.md', 'b.md']);

        const notesService = new RecentStorageService({
            settings,
            keys: STORAGE_KEYS,
            notifyChange,
            vaultProfileId
        });
        notesService.hydrate();

        expect(notesService.getRecentNotes()).toEqual(['a.md', 'b.md']);
        expect(localStorageSet).toHaveBeenCalledWith(STORAGE_KEYS.recentNotesKey, {
            [vaultProfileId]: ['a.md', 'b.md']
        });
    });

    it('removes non-string values from stored recent notes records', () => {
        const vaultProfileId = 'profile-a';
        const settings = {
            ...DEFAULT_SETTINGS,
            vaultProfile: vaultProfileId,
            vaultProfiles: [{ ...DEFAULT_SETTINGS.vaultProfiles[0], id: vaultProfileId }]
        };

        mockLocalStorageStore.set(STORAGE_KEYS.recentNotesKey, {
            [vaultProfileId]: ['a.md', 123]
        });

        const notesService = new RecentStorageService({
            settings,
            keys: STORAGE_KEYS,
            notifyChange,
            vaultProfileId
        });
        notesService.hydrate();

        expect(notesService.getRecentNotes()).toEqual(['a.md']);
        expect(localStorageSet).toHaveBeenCalledWith(STORAGE_KEYS.recentNotesKey, {
            [vaultProfileId]: ['a.md']
        });
    });

    it('persists recent notes per vault profile', () => {
        const profileA = 'profile-a';
        const profileB = 'profile-b';
        const baseProfile = DEFAULT_SETTINGS.vaultProfiles[0];
        const vaultProfiles = [
            { ...baseProfile, id: profileA },
            { ...baseProfile, id: profileB }
        ];

        const serviceA = new RecentStorageService({
            settings: { ...DEFAULT_SETTINGS, vaultProfile: profileA, vaultProfiles },
            keys: STORAGE_KEYS,
            notifyChange,
            vaultProfileId: profileA
        });
        serviceA.hydrate();
        serviceA.setRecentNotes(['a.md']);
        serviceA.flushPendingPersists();

        const serviceB = new RecentStorageService({
            settings: { ...DEFAULT_SETTINGS, vaultProfile: profileB, vaultProfiles },
            keys: STORAGE_KEYS,
            notifyChange,
            vaultProfileId: profileB
        });
        serviceB.hydrate();

        expect(serviceB.getRecentNotes()).toEqual([]);

        serviceB.setRecentNotes(['b.md']);
        serviceB.flushPendingPersists();

        expect(mockLocalStorageStore.get(STORAGE_KEYS.recentNotesKey)).toEqual({
            [profileA]: ['a.md'],
            [profileB]: ['b.md']
        });
    });

    it('drops recent notes stored for deleted vault profiles when persisting', () => {
        const activeProfileId = 'profile-a';
        const deletedProfileId = 'profile-deleted';
        const baseProfile = DEFAULT_SETTINGS.vaultProfiles[0];
        const settings = {
            ...DEFAULT_SETTINGS,
            vaultProfile: activeProfileId,
            vaultProfiles: [
                { ...baseProfile, id: activeProfileId },
                { ...baseProfile, id: deletedProfileId }
            ]
        };

        mockLocalStorageStore.set(STORAGE_KEYS.recentNotesKey, {
            [activeProfileId]: ['a.md'],
            [deletedProfileId]: ['deleted.md']
        });

        const notesService = new RecentStorageService({
            settings,
            keys: STORAGE_KEYS,
            notifyChange,
            vaultProfileId: activeProfileId
        });
        notesService.hydrate();

        settings.vaultProfiles = settings.vaultProfiles.filter(profile => profile.id !== deletedProfileId);

        notesService.setRecentNotes(['b.md', 'a.md']);
        notesService.flushPendingPersists();

        expect(mockLocalStorageStore.get(STORAGE_KEYS.recentNotesKey)).toEqual({
            [activeProfileId]: ['b.md', 'a.md']
        });
    });
});
