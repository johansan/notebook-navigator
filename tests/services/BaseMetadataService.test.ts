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
import { describe, expect, it, vi } from 'vitest';
import { App } from 'obsidian';
import { BaseMetadataService, type EntityType } from '../../src/services/metadata/BaseMetadataService';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import type { NotebookNavigatorSettings } from '../../src/settings';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { ItemType, type CollapsedPinnedContexts } from '../../src/types';
import * as iconizeFormat from '../../src/utils/iconizeFormat';

class TestSettingsProvider implements ISettingsProvider {
    constructor(public settings: NotebookNavigatorSettings) {}

    saveSettingsAndUpdate = vi.fn().mockResolvedValue(undefined);

    notifySettingsUpdate(): void {}

    getRecentNotes(): string[] {
        return [];
    }

    setRecentNotes(): void {}

    getRecentIcons(): Record<string, string[]> {
        return {};
    }

    setRecentIcons(): void {}

    collapsedPinnedContexts: CollapsedPinnedContexts = {};

    getCollapsedPinnedContexts(): CollapsedPinnedContexts {
        return { ...this.collapsedPinnedContexts };
    }

    updateCollapsedPinnedContexts(mutator: (record: CollapsedPinnedContexts) => boolean): boolean {
        return mutator(this.collapsedPinnedContexts);
    }

    getRecentColors(): string[] {
        return [];
    }

    setRecentColors(): void {}
}

class ConcreteMetadataService extends BaseMetadataService {
    public readIcon(entityType: EntityType, path: string): string | undefined {
        return this.getEntityIcon(entityType, path);
    }
}

function createSettings(overrides: Partial<NotebookNavigatorSettings> = {}): NotebookNavigatorSettings {
    return {
        ...DEFAULT_SETTINGS,
        folderIcons: {},
        tagIcons: {},
        fileIcons: {},
        ...overrides
    };
}

describe('BaseMetadataService getEntityIcon', () => {
    const app = new App();

    it('ignores properties from Object.prototype', () => {
        const settings = createSettings({ folderIcons: {} });
        const provider = new TestSettingsProvider(settings);
        const service = new ConcreteMetadataService(app, provider);

        expect(service.readIcon(ItemType.FOLDER, 'constructor')).toBeUndefined();
    });

    it('ignores inherited properties from a custom prototype', () => {
        const proto = { '/proto': 'lucide-bomb' };
        const folderIcons: Record<string, string> = {};
        Object.setPrototypeOf(folderIcons, proto);
        const settings = createSettings({ folderIcons });
        const provider = new TestSettingsProvider(settings);
        const service = new ConcreteMetadataService(app, provider);

        expect(service.readIcon(ItemType.FOLDER, '/proto')).toBeUndefined();
    });

    it('returns undefined when the stored value is not a string', () => {
        const settings = createSettings({ folderIcons: { '/folder': 42 as unknown as string } });
        const provider = new TestSettingsProvider(settings);
        const service = new ConcreteMetadataService(app, provider);

        expect(service.readIcon(ItemType.FOLDER, '/folder')).toBeUndefined();
    });

    it('normalizes string values with the canonical helper', () => {
        const normalizeSpy = vi.spyOn(iconizeFormat, 'normalizeCanonicalIconId').mockReturnValue('normalized-icon');
        const settings = createSettings({ folderIcons: { '/folder': ' lucide-sun ' } });
        const provider = new TestSettingsProvider(settings);
        const service = new ConcreteMetadataService(app, provider);

        expect(service.readIcon(ItemType.FOLDER, '/folder')).toBe('normalized-icon');
        expect(normalizeSpy).toHaveBeenCalledWith(' lucide-sun ');

        normalizeSpy.mockRestore();
    });

    it('ignores prototype values for tag icons', () => {
        const proto = { '#proto': 'lucide-tag' };
        const tagIcons: Record<string, string> = {};
        Object.setPrototypeOf(tagIcons, proto);
        const settings = createSettings({ tagIcons });
        const provider = new TestSettingsProvider(settings);
        const service = new ConcreteMetadataService(app, provider);

        expect(service.readIcon(ItemType.TAG, '#proto')).toBeUndefined();
    });

    it('returns undefined for non-string tag icon values', () => {
        const settings = createSettings({ tagIcons: { '#tag': { nested: true } as unknown as string } });
        const provider = new TestSettingsProvider(settings);
        const service = new ConcreteMetadataService(app, provider);

        expect(service.readIcon(ItemType.TAG, '#tag')).toBeUndefined();
    });

    it('normalizes file icon strings', () => {
        const normalizeSpy = vi.spyOn(iconizeFormat, 'normalizeCanonicalIconId').mockReturnValue('normalized-file-icon');
        const settings = createSettings({ fileIcons: { '/file.md': ' lucide-file ' } });
        const provider = new TestSettingsProvider(settings);
        const service = new ConcreteMetadataService(app, provider);

        expect(service.readIcon(ItemType.FILE, '/file.md')).toBe('normalized-file-icon');
        expect(normalizeSpy).toHaveBeenCalledWith(' lucide-file ');

        normalizeSpy.mockRestore();
    });
});
