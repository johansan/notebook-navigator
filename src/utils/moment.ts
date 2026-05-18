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

import { getCurrentLanguage } from '../i18n';
import type { CalendarPeriodicNotesLocaleSource } from '../settings/types';

export interface MomentLocaleData {
    firstDayOfWeek(): number;
    firstDayOfYear?(): number;
    weekdaysMin(): string[];
    weekdaysShort(): string[];
}

export interface MomentInstance {
    clone(): MomentInstance;
    format(format?: string): string;
    isValid(): boolean;
    locale(locale: string): MomentInstance;
    localeData(): MomentLocaleData;
    startOf(unit: string): MomentInstance;
    endOf(unit: string): MomentInstance;
    add(amount: number, unit: string): MomentInstance;
    subtract(amount: number, unit: string): MomentInstance;
    diff(other: MomentInstance, unit: string): number;
    week(): number;
    weekYear(): number;
    isoWeek(): number;
    isoWeekYear(): number;
    month(): number;
    year(): number;
    date(): number;
    set(values: Record<string, number>): MomentInstance;
    get(unit: string): number;
    toDate(): Date;
}

export interface MomentApi {
    (input?: string | number | Date, format?: unknown, strict?: boolean): MomentInstance;
    (input: string, format: string, locale: string, strict: boolean): MomentInstance;
    locales: () => string[];
    locale: () => string;
    fn: object;
    utc: (...args: unknown[]) => unknown;
    ISO_8601?: unknown;
}

let cachedMomentApi: MomentApi | null | undefined;
let cachedLocaleSet: Set<string> | null = null;
let cachedLocaleSetFor: MomentApi | null = null;
let cachedResolvedLocales: Map<string, string> | null = null;
let cachedResolvedLocalesFor: MomentApi | null = null;

export function resetMomentApiCacheForTests(): void {
    cachedMomentApi = undefined;
    cachedLocaleSet = null;
    cachedLocaleSetFor = null;
    cachedResolvedLocales = null;
    cachedResolvedLocalesFor = null;
}

function isMomentApi(value: unknown): value is MomentApi {
    if (typeof value !== 'function') {
        return false;
    }
    if (!('fn' in value) || typeof (value as { fn?: unknown }).fn !== 'object' || (value as { fn?: unknown }).fn === null) {
        return false;
    }
    if (!('utc' in value) || typeof (value as { utc?: unknown }).utc !== 'function') {
        return false;
    }
    return true;
}

export function getMomentApi(): MomentApi | null {
    // Obsidian injects `window.moment` for plugin use; cache the first observed *valid* value to avoid repeated lookups.
    if (cachedMomentApi !== undefined) {
        return cachedMomentApi;
    }

    // Tests run in Node where `window` doesn't exist.
    if (typeof window === 'undefined') {
        return null;
    }

    const momentValue = (window as { moment?: unknown }).moment;
    if (!isMomentApi(momentValue)) {
        return null;
    }

    cachedMomentApi = momentValue;
    return cachedMomentApi;
}

function getMomentLocaleSet(momentApi: MomentApi): Set<string> {
    if (cachedLocaleSetFor === momentApi && cachedLocaleSet) {
        return cachedLocaleSet;
    }

    cachedLocaleSetFor = momentApi;
    cachedLocaleSet = new Set(momentApi.locales());
    return cachedLocaleSet;
}

function getResolvedLocaleCache(momentApi: MomentApi): Map<string, string> {
    if (cachedResolvedLocalesFor === momentApi && cachedResolvedLocales) {
        return cachedResolvedLocales;
    }

    cachedResolvedLocalesFor = momentApi;
    cachedResolvedLocales = new Map<string, string>();
    return cachedResolvedLocales;
}

export function resolveMomentLocale(requestedLocale: string, momentApi: MomentApi | null, fallbackLocale: string): string {
    // `moment` locale ids are not guaranteed to be canonical BCP-47 tags (and may use `_`); normalize and fall back
    // to the best available match (full tag -> lowercase -> base language).
    if (!momentApi) {
        return fallbackLocale || 'en';
    }

    const cacheKey = `${requestedLocale}::${fallbackLocale}`;
    const resolvedCache = getResolvedLocaleCache(momentApi);
    const cached = resolvedCache.get(cacheKey);
    if (cached) {
        return cached;
    }

    const available = getMomentLocaleSet(momentApi);
    const normalized = (requestedLocale || '').replace(/_/g, '-');
    if (available.has(normalized)) {
        resolvedCache.set(cacheKey, normalized);
        return normalized;
    }

    const lower = normalized.toLowerCase();
    if (available.has(lower)) {
        resolvedCache.set(cacheKey, lower);
        return lower;
    }

    const base = lower.split('-')[0];
    if (base && available.has(base)) {
        resolvedCache.set(cacheKey, base);
        return base;
    }

    if (base) {
        const prefix = `${base}-`;
        const matches = Array.from(available).filter(value => value.toLowerCase().startsWith(prefix));
        if (matches.length > 0) {
            matches.sort((left, right) => left.length - right.length || left.localeCompare(right));
            const resolved = matches[0] ?? (fallbackLocale || momentApi.locale() || 'en');
            resolvedCache.set(cacheKey, resolved);
            return resolved;
        }
    }

    const resolved = fallbackLocale || momentApi.locale() || 'en';
    resolvedCache.set(cacheKey, resolved);
    return resolved;
}

export function resolveCalendarLocales(
    calendarLocale: string,
    momentApi: MomentApi | null,
    currentLanguage: string = getCurrentLanguage()
): { displayLocale: string; calendarRulesLocale: string } {
    const fallbackLocale = momentApi?.locale() || 'en';
    const requestedDisplayLocale = (currentLanguage || fallbackLocale).replace(/_/g, '-');
    const displayLocale = resolveMomentLocale(requestedDisplayLocale, momentApi, fallbackLocale);
    const requestedCalendarRulesLocale = calendarLocale === 'system-default' ? displayLocale : calendarLocale;
    const resolvedCalendarRulesLocale = resolveMomentLocale(requestedCalendarRulesLocale, momentApi, displayLocale);

    return {
        displayLocale,
        calendarRulesLocale: resolvedCalendarRulesLocale
    };
}

export function resolveDailyNoteLocale(momentApi: MomentApi | null): string {
    const fallbackLocale = momentApi?.locale() || 'en';
    return resolveMomentLocale(fallbackLocale, momentApi, fallbackLocale);
}

export function resolveCalendarPeriodicNotesLocale(
    source: CalendarPeriodicNotesLocaleSource,
    calendarRulesLocale: string,
    momentApi: MomentApi | null
): string {
    return source === 'obsidian' ? resolveDailyNoteLocale(momentApi) : calendarRulesLocale;
}
