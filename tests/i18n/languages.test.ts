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

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { transformSync } from 'esbuild';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { extractLanguage } from '../../scripts/build-languages.mjs';
import {
    applyEnglish,
    applyLanguage,
    getDefaultDateFormat,
    getDefaultTimeFormat,
    getLanguageCode,
    isLanguageData,
    strings
} from '../../src/i18n';
import { LANGUAGE_DATA_ID, LANGUAGE_METADATA } from '../../src/i18n/localeMetadata';
import { LanguageService } from '../../src/i18n/LanguageService';
import { LanguageDatabase, type LanguageCache } from '../../src/i18n/LanguageCache';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { ensureVaultProfiles, getLocalizedDefaultVaultProfileName } from '../../src/utils/vaultProfiles';

const mocks = vi.hoisted(() => ({ locale: 'de', request: vi.fn() }));
vi.mock('obsidian', async importOriginal => ({
    ...(await importOriginal<Record<string, unknown>>()),
    getLanguage: () => mocks.locale,
    requestUrl: mocks.request
}));

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const sourceLocales = Object.fromEntries(
    Object.keys(LANGUAGE_METADATA).map(locale => {
        const source = readFileSync(new URL(`../../src/i18n/locales/${locale}.ts`, import.meta.url), 'utf8');
        const module = { exports: undefined as unknown };
        runInNewContext(transformSync(source, { loader: 'ts', format: 'cjs' }).code, { module });
        if (!isRecord(module.exports)) throw new Error('Invalid locale module');
        const original: unknown = Object.values(module.exports)[0];
        const extracted: unknown = extractLanguage(source, locale);
        if (!isRecord(extracted)) throw new Error('Invalid extracted locale');
        const data: unknown = extracted.data;
        return [locale, { original, data }];
    })
);
const data = Object.fromEntries(Object.entries(sourceLocales).map(([locale, value]) => [locale, value.data]));
const pack = (version = 'test-version') => ({ version, id: LANGUAGE_DATA_ID, locales: data });
const response = (value: unknown) => ({ text: JSON.stringify(value), status: 200 });

function compareLocale(actual: unknown, expected: unknown): void {
    expect(typeof actual).toBe(typeof expected);
    if (typeof expected === 'function') {
        if (typeof actual !== 'function') throw new Error('Missing formatter');
        for (const argumentsList of [
            [0, 0],
            [1, 1],
            [2, 1],
            [5, 3],
            [11, 2],
            [21, 5],
            [22, 1],
            [101, 0],
            ['目录 {name} <test>', 3]
        ]) {
            expect(Reflect.apply(actual, undefined, argumentsList)).toBe(Reflect.apply(expected, undefined, argumentsList));
        }
    } else if (Array.isArray(expected)) {
        expect(Array.isArray(actual)).toBe(true);
        if (!Array.isArray(actual)) throw new Error('Missing array');
        expect(actual).toHaveLength(expected.length);
        expected.forEach((value, index) => compareLocale(actual[index], value));
    } else if (isRecord(expected)) {
        if (!isRecord(actual)) throw new Error('Missing object');
        expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
        Object.entries(expected).forEach(([key, value]) => compareLocale(actual[key], value));
    } else {
        expect(actual).toBe(expected);
    }
}

class MemoryCache implements LanguageCache {
    records = new Map<string, unknown>();
    reads: string[] = [];
    writes = 0;
    closed = false;
    async get(version: string, locale: string): Promise<unknown> {
        this.reads.push(`${version}/${locale}`);
        return this.records.get(`${version}/${locale}`);
    }
    async put(version: string, locales: Record<string, unknown>): Promise<void> {
        this.writes++;
        for (const [locale, value] of Object.entries(locales)) this.records.set(`${version}/${locale}`, value);
    }
    close(): void {
        this.closed = true;
    }
}

const services: LanguageService[] = [];
function createService(cache: LanguageCache = new MemoryCache(), version = 'test-version'): LanguageService {
    const service = new LanguageService(version, cache);
    services.push(service);
    return service;
}

beforeEach(() => {
    mocks.locale = 'de';
    mocks.request.mockReset();
    applyEnglish();
});
afterEach(() => {
    services.splice(0).forEach(service => service.dispose());
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    applyEnglish();
});

describe('language data generation', () => {
    it('keeps the generated data ID synchronized with every source locale', () => {
        expect(createHash('sha256').update(JSON.stringify(data)).digest('hex')).toBe(LANGUAGE_DATA_ID);
    });
    for (const locale of Object.keys(LANGUAGE_METADATA)) {
        it(`preserves every string, array and formatter in ${locale}`, () => {
            mocks.locale = locale;
            const code = getLanguageCode();
            expect(applyLanguage(code, data[locale])).toBe(true);
            compareLocale(strings, sourceLocales[locale].original);
            expect(getDefaultDateFormat()).toBe(strings.settings.items.dateFormat.placeholder);
            expect(getDefaultTimeFormat()).toBe(strings.settings.items.timeFormat.placeholder);
            expect(getLocalizedDefaultVaultProfileName()).toBe(strings.settings.items.vaultProfiles.defaultName);
        });
    }
    it.each([
        ['pt-BR', 'pt_br'],
        ['zh', 'zh_cn'],
        ['zh-CN', 'zh_cn'],
        ['zh-TW', 'zh_tw'],
        ['unknown', 'en']
    ])('resolves %s as %s', (input, expected) => {
        mocks.locale = input;
        expect(getLanguageCode()).toBe(expected);
    });
    it('retains the requested date/time defaults before a language is available', () => {
        mocks.locale = 'de';
        expect(strings.common.cancel).toBe('Cancel');
        expect(getDefaultDateFormat()).toBe(LANGUAGE_METADATA.de.dateFormat);
        expect(getDefaultTimeFormat()).toBe(LANGUAGE_METADATA.de.timeFormat);
    });
    it('rejects changed array lengths, missing nested keys and executable strings in formatter slots', () => {
        const wrongArray: unknown = { ...(isRecord(data.de) ? data.de : {}), language: {} };
        expect(isLanguageData(wrongArray)).toBe(false);
        expect(isLanguageData(['one'], ['one', 'two'])).toBe(false);
        expect(isLanguageData('() => "remote"', () => 'local')).toBe(false);
        expect(applyLanguage('de', wrongArray)).toBe(false);
        expect(strings.common.cancel).toBe('Cancel');
    });
});

describe('language startup and downloads', () => {
    it.each(['download', 'continue-in-English'])('initializes localized profile names before %s completes', async choice => {
        mocks.locale = 'fr';
        let resolveDownload: (value: unknown) => void = () => {};
        mocks.request.mockImplementation(
            () =>
                new Promise(resolve => {
                    resolveDownload = resolve;
                })
        );
        const service = createService();
        await service.initialize();
        expect(service.getSnapshot().ready).toBe(false);
        expect(strings.common.cancel).toBe('Cancel');

        const settings = structuredClone(DEFAULT_SETTINGS);
        ensureVaultProfiles(settings);
        expect(settings.vaultProfiles[0].name).toBe('Par défaut');

        // A stored name is user data, including an existing English default or a custom profile name.
        const storedSettings = structuredClone(DEFAULT_SETTINGS);
        storedSettings.vaultProfiles[0].name = 'Default';
        storedSettings.vaultProfiles.push({ ...structuredClone(storedSettings.vaultProfiles[0]), id: 'work', name: 'Work' });
        ensureVaultProfiles(storedSettings);

        if (choice === 'continue-in-English') service.continueInEnglish();
        resolveDownload(response(pack()));
        await vi.waitFor(() => expect(service.getSnapshot().downloading).toBe(false));
        await service.ready;

        ensureVaultProfiles(settings);
        ensureVaultProfiles(storedSettings);
        expect(settings.vaultProfiles[0].name).toBe('Par défaut');
        expect(storedSettings.vaultProfiles.map(profile => profile.name)).toEqual(['Default', 'Work']);
        expect(strings.common.cancel).toBe(choice === 'download' ? 'Annuler' : 'Cancel');
    });

    it('downloads all languages, then activates the selected language once', async () => {
        const cache = new MemoryCache();
        let resolveDownload: (value: unknown) => void = () => {};
        mocks.request.mockImplementation(
            () =>
                new Promise(resolve => {
                    resolveDownload = resolve;
                })
        );
        const service = createService(cache);
        await service.initialize();
        expect(service.getSnapshot()).toEqual({ ready: false, downloading: true, failed: false });
        expect(strings.common.cancel).toBe('Cancel');
        expect(mocks.request).toHaveBeenCalledWith({
            url: 'https://github.com/johansan/notebook-navigator/releases/download/test-version/languages.json'
        });
        resolveDownload(response(pack()));
        await service.ready;
        expect(service.getSnapshot()).toEqual({ ready: true, downloading: false, failed: false });
        expect(cache.records.size).toBe(21);
        expect(strings.common.cancel).toBe('Abbrechen');
    });
    it('reads only the chosen cached locale and makes no request on subsequent launches', async () => {
        const cache = new MemoryCache();
        await cache.put(`test-version/${LANGUAGE_DATA_ID}`, data);
        const service = createService(cache);
        await service.initialize();
        await service.ready;
        expect(cache.reads).toEqual([`test-version/${LANGUAGE_DATA_ID}/de`]);
        expect(mocks.request).not.toHaveBeenCalled();
        expect(strings.common.cancel).toBe('Abbrechen');
    });
    it('requires a fresh pack after a plugin update', async () => {
        const cache = new MemoryCache();
        await cache.put(`old-version/${LANGUAGE_DATA_ID}`, data);
        mocks.request.mockResolvedValue(response(pack()));
        const service = createService(cache);
        await service.initialize();
        await service.ready;
        expect(mocks.request).toHaveBeenCalledTimes(1);
        expect(cache.writes).toBe(2);
    });
    it('continues in English without letting a late successful download replace the open UI', async () => {
        const cache = new MemoryCache();
        let resolveDownload: (value: unknown) => void = () => {};
        mocks.request.mockImplementation(
            () =>
                new Promise(resolve => {
                    resolveDownload = resolve;
                })
        );
        const service = createService(cache);
        await service.initialize();
        service.continueInEnglish();
        await service.ready;
        expect(service.getSnapshot().ready).toBe(true);
        resolveDownload(response(pack()));
        await vi.waitFor(() => expect(service.getSnapshot().downloading).toBe(false));
        expect(cache.writes).toBe(1);
        expect(strings.common.cancel).toBe('Cancel');
    });
    it.each(['network', 'wrong-version', 'wrong-data-id', 'missing-locale', 'invalid-leaf'])(
        'uses English after %s failure',
        async failure => {
            vi.spyOn(console, 'error').mockImplementation(() => {});
            const value = structuredClone(pack());
            if (failure === 'network') mocks.request.mockRejectedValue(new Error('Offline'));
            else {
                if (failure === 'wrong-version') value.version = 'another-release';
                if (failure === 'wrong-data-id') value.id = 'wrong';
                if (failure === 'missing-locale') delete value.locales.de;
                if (failure === 'invalid-leaf') value.locales.fr = {};
                mocks.request.mockResolvedValue(response(value));
            }
            const cache = new MemoryCache();
            const service = createService(cache);
            await service.initialize();
            await service.ready;
            expect(service.getSnapshot()).toEqual({ ready: true, downloading: false, failed: true });
            expect(strings.common.cancel).toBe('Cancel');
            expect(cache.writes).toBe(0);
        }
    );
    it('times out a stalled request and ignores its later response', async () => {
        vi.useFakeTimers();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        let resolveDownload: (value: unknown) => void = () => {};
        mocks.request.mockImplementation(
            () =>
                new Promise(resolve => {
                    resolveDownload = resolve;
                })
        );
        const cache = new MemoryCache();
        const service = createService(cache);
        await service.initialize();
        await vi.advanceTimersByTimeAsync(30000);
        await service.ready;
        expect(service.getSnapshot().failed).toBe(true);
        resolveDownload(response(pack()));
        await vi.advanceTimersByTimeAsync(0);
        expect(cache.writes).toBe(0);
        expect(strings.common.cancel).toBe('Cancel');
        expect(vi.getTimerCount()).toBe(0);
    });
    it('does not change language or write a cache after plugin unload', async () => {
        let resolveDownload: (value: unknown) => void = () => {};
        mocks.request.mockImplementation(
            () =>
                new Promise(resolve => {
                    resolveDownload = resolve;
                })
        );
        const cache = new MemoryCache();
        const service = createService(cache);
        await service.initialize();
        service.dispose();
        resolveDownload(response(pack()));
        await service.ready;
        await Promise.resolve();
        expect(cache.closed).toBe(true);
        expect(cache.writes).toBe(0);
        expect(strings.common.cancel).toBe('Cancel');
    });
    it('still uses valid downloaded text when persistent storage fails', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const cache = new MemoryCache();
        vi.spyOn(cache, 'put').mockRejectedValue(new Error('Quota exceeded'));
        mocks.request.mockResolvedValue(response(pack()));
        const service = createService(cache);
        await service.initialize();
        await service.ready;
        expect(service.getSnapshot().failed).toBe(false);
        expect(strings.common.cancel).toBe('Abbrechen');
    });
    it('keeps English usable while its all-language pack downloads', async () => {
        mocks.locale = 'en';
        mocks.request.mockImplementation(() => new Promise(() => {}));
        const service = createService();
        await service.initialize();
        await service.ready;
        expect(service.getSnapshot()).toEqual({ ready: true, downloading: true, failed: false });
        expect(strings.common.cancel).toBe('Cancel');
    });
});

describe('language IndexedDB cache', () => {
    beforeEach(() => vi.stubGlobal('indexedDB', new IDBFactory()));
    it('persists a complete pack across connections and replaces an old version atomically', async () => {
        const first = new LanguageDatabase('test-vault');
        await first.put('v1', { en: { title: 'English' }, de: { title: 'Deutsch' } });
        first.close();
        const second = new LanguageDatabase('test-vault');
        expect(await second.get('v1', 'de')).toEqual({ title: 'Deutsch' });
        expect(await second.get('v2', 'de')).toBeUndefined();
        await second.put('v2', { en: { title: 'English 2' }, de: { title: 'Deutsch 2' } });
        expect(await second.get('v1', 'de')).toBeUndefined();
        expect(await second.get('v2', 'de')).toEqual({ title: 'Deutsch 2' });
        second.close();
    });
    it('does not share cached data between vaults', async () => {
        const first = new LanguageDatabase('first');
        const second = new LanguageDatabase('second');
        await first.put('v1', { en: 'English' });
        expect(await second.get('v1', 'en')).toBeUndefined();
        first.close();
        second.close();
    });
    it('closes a connection that completes after shutdown', async () => {
        const database = new LanguageDatabase('closing');
        const pending = database.get('v1', 'en');
        database.close();
        await expect(pending).rejects.toThrow('Language cache closed');
    });
});
