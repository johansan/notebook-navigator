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

import { requestUrl } from 'obsidian';
import { applyLanguage, getLanguageCode, isLanguageData, applyEnglish } from './index';
import { LANGUAGE_DATA_ID, LANGUAGE_METADATA, type LanguageCode } from './localeMetadata';
import type { LanguageCache } from './LanguageCache';
import { sanitizeRecord } from '../utils/recordUtils';

export interface LanguageSnapshot {
    ready: boolean;
    downloading: boolean;
    failed: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Bounds cache/network waits and ignores late responses after timeout or plugin unload. */
function waitFor<T>(promise: Promise<T>, milliseconds: number, signal: AbortSignal): Promise<T> {
    return new Promise((resolve, reject) => {
        const abort = () => finish(() => reject(new Error('Language loading cancelled')));
        const timer = window.setTimeout(() => finish(() => reject(new Error('Language loading timed out'))), milliseconds);
        function finish(callback: () => void) {
            window.clearTimeout(timer);
            signal.removeEventListener('abort', abort);
            callback();
        }
        signal.addEventListener('abort', abort, { once: true });
        if (signal.aborted) abort();
        promise.then(
            value => finish(() => resolve(value)),
            (error: unknown) => finish(() => reject(error instanceof Error ? error : new Error(String(error))))
        );
    });
}

/** Loads one cached locale, downloads all locale data on a cache miss, and keeps English available throughout. */
export class LanguageService {
    readonly locale: LanguageCode = getLanguageCode();
    readonly bootstrap = LANGUAGE_METADATA[this.locale].bootstrap;
    private readonly controller = new AbortController();
    private readonly listeners = new Set<() => void>();
    private readonly pack: string;
    private englishForSession = false;
    private snapshot: LanguageSnapshot;
    private resolveReady: () => void = () => {};
    readonly ready = new Promise<void>(resolve => {
        this.resolveReady = resolve;
    });

    constructor(
        private readonly version: string,
        private readonly cache: LanguageCache
    ) {
        this.pack = `${version}/${LANGUAGE_DATA_ID}`;
        this.snapshot = { ready: this.locale === 'en', downloading: false, failed: false };
        applyEnglish();
        if (this.snapshot.ready) this.resolveReady();
    }

    getSnapshot = (): LanguageSnapshot => this.snapshot;

    subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    /** Returns after the bounded cache read. Network work runs separately so settings and workspace restoration can proceed. */
    async initialize(): Promise<void> {
        try {
            const cached = await waitFor(this.cache.get(this.pack, this.locale), 2000, this.controller.signal);
            if (this.controller.signal.aborted) return;
            if (isLanguageData(cached)) {
                if (!this.englishForSession) applyLanguage(this.locale, cached);
                this.finish(false);
                return;
            }
        } catch (error) {
            if (this.controller.signal.aborted) return;
            console.error('Failed to read cached language data:', error);
        }
        this.update({ ...this.snapshot, downloading: true });
        void this.download();
    }

    /** Opens the UI in English immediately. A pending download still fills the cache but cannot change this session's UI. */
    continueInEnglish = (): void => {
        this.englishForSession = true;
        applyEnglish();
        this.update({ ...this.snapshot, ready: true });
        this.resolveReady();
    };

    dispose(): void {
        this.controller.abort();
        this.cache.close();
        this.listeners.clear();
        this.resolveReady();
    }

    /**
     * Waits up to 30 seconds for the request, then caches and applies the pack. The deadline only releases the loading
     * screen in English: the request keeps running and a valid late response is cached for the next launch. Otherwise a
     * connection too slow to finish within the deadline would restart the download and time out on every launch.
     */
    private async download(): Promise<void> {
        const request = this.requestPack();
        let locales: Record<string, unknown> | null;
        try {
            locales = await waitFor(request, 30000, this.controller.signal);
        } catch (error) {
            if (this.controller.signal.aborted) return;
            console.error('Language download did not finish in time and continues in the background:', error);
            this.useEnglishForSession();
            // englishForSession keeps the open UI in English, so the late pack only fills the cache.
            void request.then(async late => {
                if (late) await this.cachePack(late);
            });
            return;
        }
        // The request can settle before plugin unload while this continuation runs after it.
        if (this.controller.signal.aborted) return;
        if (!locales) {
            this.useEnglishForSession();
            return;
        }
        await this.cachePack(locales);
        if (this.controller.signal.aborted) return;
        if (!this.englishForSession) applyLanguage(this.locale, locales[this.locale]);
        this.finish(false);
    }

    /**
     * Downloads and validates the pack for this plugin version. Resolves with the validated locales, or with null after a
     * logged failure or plugin unload. Never rejects, so a request that outlives the download deadline cannot surface as an
     * unhandled rejection. requestUrl has no cancellation, so unload only stops the result from being used.
     */
    private async requestPack(): Promise<Record<string, unknown> | null> {
        try {
            const response = await requestUrl({
                url: `https://github.com/johansan/notebook-navigator/releases/download/${encodeURIComponent(this.version)}/languages.json`
            });
            if (this.controller.signal.aborted) return null;
            const pack: unknown = JSON.parse(response.text);
            if (!isRecord(pack) || pack.version !== this.version || pack.id !== LANGUAGE_DATA_ID || !isRecord(pack.locales)) {
                throw new Error('Language pack does not match the installed plugin');
            }
            const locales = sanitizeRecord(pack.locales);
            const codes = Object.keys(LANGUAGE_METADATA);
            if (Object.keys(locales).length !== codes.length || !codes.every(locale => isLanguageData(locales[locale]))) {
                throw new Error('Language pack contains invalid translations');
            }
            return locales;
        } catch (error) {
            if (!this.controller.signal.aborted) console.error('Failed to download language data:', error);
            return null;
        }
    }

    /** Stores a validated pack with its own bounded wait. Starts no new write after plugin unload and never rejects. */
    private async cachePack(locales: Record<string, unknown>): Promise<void> {
        if (this.controller.signal.aborted) return;
        try {
            await waitFor(this.cache.put(this.pack, locales), 2000, this.controller.signal);
        } catch (error) {
            // A storage failure must not discard a valid download; this launch can still use its selected language.
            if (!this.controller.signal.aborted) console.error('Failed to cache language data:', error);
        }
    }

    private useEnglishForSession(): void {
        this.englishForSession = true;
        applyEnglish();
        this.finish(true);
    }

    private finish(failed: boolean): void {
        this.update({ ready: true, downloading: false, failed });
        this.resolveReady();
    }

    private update(snapshot: LanguageSnapshot): void {
        this.snapshot = snapshot;
        this.listeners.forEach(listener => listener());
    }
}
