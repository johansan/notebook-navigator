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

import { App } from 'obsidian';
import { describe, expect, it } from 'vitest';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import type { NotebookNavigatorSettings } from '../../src/settings/types';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { IconService } from '../../src/services/icons/IconService';
import type { IconAssetRecord } from '../../src/services/icons/external/IconAssetDatabase';
import { ExternalIconProviderController } from '../../src/services/icons/external/ExternalIconProviderController';
import {
    EXTERNAL_ICON_PROVIDERS,
    type ExternalIconProviderConfig,
    type ExternalIconProviderId
} from '../../src/services/icons/external/providerRegistry';
import type { BaseFontIconProvider } from '../../src/services/icons/providers/BaseFontIconProvider';

const PROVIDER_ID: ExternalIconProviderId = 'bootstrap-icons';
const PROVIDER_CONFIG = EXTERNAL_ICON_PROVIDERS[PROVIDER_ID];

class TestSettingsProvider implements ISettingsProvider {
    constructor(public settings: NotebookNavigatorSettings) {}

    async saveSettingsAndUpdate(): Promise<void> {}

    notifySettingsUpdate(): void {}

    getRecentNotes(): string[] {
        return [];
    }

    setRecentNotes(): void {}

    getRecentIcons(): Record<string, string[]> {
        return {};
    }

    setRecentIcons(): void {}

    getRecentColors(): string[] {
        return [];
    }

    setRecentColors(): void {}
}

interface DeferredProvider {
    provider: BaseFontIconProvider;
    resolvePreparation: () => void;
    isDisposed: () => boolean;
}

interface ControllerTestAccess {
    activateIfEnabled: (config: ExternalIconProviderConfig, record: IconAssetRecord) => Promise<boolean>;
    createProvider: (config: ExternalIconProviderConfig, record: IconAssetRecord) => BaseFontIconProvider | null;
}

function createRecord(): IconAssetRecord {
    return {
        id: PROVIDER_ID,
        version: '1.0.0',
        mimeType: 'font/woff2',
        data: new ArrayBuffer(8),
        metadataFormat: 'json',
        metadata: '{}',
        updated: 1
    };
}

function createSettingsProvider(): TestSettingsProvider {
    return new TestSettingsProvider({
        ...DEFAULT_SETTINGS,
        externalIconProviders: { [PROVIDER_ID]: true }
    });
}

function createDeferredProvider(): DeferredProvider {
    let resolvePreparation = () => {};
    let disposed = false;
    const preparation = new Promise<void>(resolve => {
        resolvePreparation = resolve;
    });
    const provider = {
        id: PROVIDER_ID,
        name: 'Test provider',
        prepare: () => preparation,
        dispose: () => {
            disposed = true;
        },
        isAvailable: () => true,
        render: () => 'not-found' as const,
        search: () => [],
        getAll: () => []
    } as unknown as BaseFontIconProvider;

    return {
        provider,
        resolvePreparation,
        isDisposed: () => disposed
    };
}

function createControllerHarness(providers: DeferredProvider[]) {
    const iconService = IconService.getInstance();
    iconService.unregisterProvider(PROVIDER_ID);
    const settingsProvider = createSettingsProvider();
    const controller = new ExternalIconProviderController(new App(), iconService, settingsProvider);
    const access = controller as unknown as ControllerTestAccess;
    let providerIndex = 0;
    access.createProvider = () => providers[providerIndex++]?.provider ?? null;

    return { controller, access, iconService, settingsProvider };
}

describe('ExternalIconProviderController activation', () => {
    it('does not register a provider disabled while preparation is pending', async () => {
        const deferred = createDeferredProvider();
        const { controller, access, iconService, settingsProvider } = createControllerHarness([deferred]);

        try {
            const activation = access.activateIfEnabled(PROVIDER_CONFIG, createRecord());
            settingsProvider.settings.externalIconProviders[PROVIDER_ID] = false;
            deferred.resolvePreparation();

            await expect(activation).resolves.toBe(false);
            expect(deferred.isDisposed()).toBe(true);
            expect(iconService.getProvider(PROVIDER_ID)).toBeUndefined();
        } finally {
            controller.dispose();
        }
    });

    it('does not register a provider after the controller is disposed', async () => {
        const deferred = createDeferredProvider();
        const { controller, access, iconService } = createControllerHarness([deferred]);
        const activation = access.activateIfEnabled(PROVIDER_CONFIG, createRecord());

        controller.dispose();
        deferred.resolvePreparation();

        await expect(activation).resolves.toBe(false);
        expect(deferred.isDisposed()).toBe(true);
        expect(iconService.getProvider(PROVIDER_ID)).toBeUndefined();
    });

    it('keeps only the latest provider when activations overlap', async () => {
        const first = createDeferredProvider();
        const second = createDeferredProvider();
        const { controller, access, iconService } = createControllerHarness([first, second]);

        try {
            const firstActivation = access.activateIfEnabled(PROVIDER_CONFIG, createRecord());
            const secondActivation = access.activateIfEnabled(PROVIDER_CONFIG, createRecord());
            expect(first.isDisposed()).toBe(true);

            second.resolvePreparation();
            await expect(secondActivation).resolves.toBe(true);
            first.resolvePreparation();
            await expect(firstActivation).resolves.toBe(false);

            expect(iconService.getProvider(PROVIDER_ID)).toBe(second.provider);
        } finally {
            controller.dispose();
        }
    });
});
