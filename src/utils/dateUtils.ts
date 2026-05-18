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

import { TFile } from 'obsidian';

import { strings, getCurrentLanguage } from '../i18n';
import { NotebookNavigatorSettings } from '../settings';
import { getMomentApi, resolveMomentLocale, type MomentApi } from './moment';

// Example ISO 8601 moment format string used as a settings placeholder
export const ISO_DATE_FORMAT = 'YYYY-MM-DD[T]HH:mm:ssZ';

export interface DateGroupInfo {
    label: string;
    key: string;
}

export class DateUtils {
    /**
     * Normalizes language codes for consistent lookups.
     */
    private static normalizeLanguageCode(language: string): string {
        if (!language) {
            return 'en';
        }

        return language.replace(/_/g, '-').toLowerCase();
    }

    /**
     * Languages that use lowercase month names by default in the UI
     */
    private static lowercaseMonthLanguages = new Set([
        'es',
        'fr',
        'no',
        'nb',
        'pt',
        'pt-br',
        'it',
        'nl',
        'sv',
        'da',
        'fi',
        'pl',
        'cs',
        'ca',
        'ro'
    ]);

    /**
     * Get the current Obsidian language setting
     * @returns Language code (e.g., 'en', 'de', 'sv')
     */
    private static getObsidianLanguage(): string {
        const currentLocale = getCurrentLanguage();
        return currentLocale || 'en';
    }

    private static getNormalizedLanguage(): string {
        return DateUtils.normalizeLanguageCode(DateUtils.getObsidianLanguage());
    }

    private static getMomentLocale(momentApi: MomentApi): string {
        const currentLanguage = DateUtils.getObsidianLanguage();
        const fallback = momentApi.locale() || 'en';
        const requested = (currentLanguage || fallback).replace(/_/g, '-');
        return resolveMomentLocale(requested, momentApi, fallback);
    }

    private static formatWithFallback(date: Date, formatString: string, formatType: 'date' | 'time'): string {
        const momentApi = getMomentApi();
        if (!momentApi) {
            return formatType === 'time' ? date.toLocaleTimeString() : date.toLocaleDateString();
        }

        const locale = DateUtils.getMomentLocale(momentApi);
        const momentValue = momentApi(date).locale(locale);
        if (!momentValue.isValid()) {
            return formatType === 'time' ? date.toLocaleTimeString() : date.toLocaleDateString();
        }

        return momentValue.format(formatString);
    }

    /**
     * Format a timestamp into a human-readable date string
     * @param timestamp - Unix timestamp in milliseconds
     * @param dateFormat - Date format string (moment format)
     * @returns Formatted date string
     */
    static formatDate(timestamp: number, dateFormat: string): string {
        const date = new Date(timestamp);
        return DateUtils.formatWithFallback(date, dateFormat, 'date');
    }

    static formatLocalizedMonthDay(date: Date, locale: string): string {
        return new Intl.DateTimeFormat(locale || undefined, {
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    /**
     * Capitalize the first letter of a string
     * @param str - String to capitalize
     * @returns Capitalized string
     */
    private static capitalizeFirst(str: string): string {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Inserts a space between Chinese meridiem markers and the time portion.
     */
    private static normalizeMeridiemSpacing(value: string, normalizedLanguage: string): string {
        if (!normalizedLanguage.startsWith('zh')) {
            return value;
        }

        return value.replace(/(上午|下午|中午|凌晨|晚上)(\d)/g, '$1 $2');
    }

    /**
     * Parse a local day key (YYYY-MM-DD) into a local date anchored at midday.
     */
    static parseLocalDayKey(dayKey: string): Date | null {
        const [yearText, monthText, dayText] = dayKey.split('-');
        const year = Number(yearText);
        const month = Number(monthText);
        const day = Number(dayText);
        if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
            return null;
        }

        const reference = new Date(year, month - 1, day, 12, 0, 0, 0);
        return Number.isFinite(reference.getTime()) ? reference : null;
    }

    static getDateGroupInfo(timestamp: number, nowOverride?: Date): DateGroupInfo {
        const now = nowOverride && Number.isFinite(nowOverride.getTime()) ? nowOverride : new Date();
        const date = new Date(timestamp);

        // Reset times to start of day for comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);

        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (dateOnly.getTime() === today.getTime()) {
            return { label: strings.dateGroups.today, key: 'relative:today' };
        } else if (dateOnly.getTime() === yesterday.getTime()) {
            return { label: strings.dateGroups.yesterday, key: 'relative:yesterday' };
        } else if (dateOnly > weekAgo) {
            return { label: strings.dateGroups.previous7Days, key: 'relative:previous-7-days' };
        } else if (dateOnly > monthAgo) {
            return { label: strings.dateGroups.previous30Days, key: 'relative:previous-30-days' };
        } else if (date.getFullYear() === now.getFullYear()) {
            // Same year - show month name
            const normalizedLanguage = DateUtils.getNormalizedLanguage();
            const momentApi = getMomentApi();
            let monthName: string;
            if (momentApi) {
                const locale = DateUtils.getMomentLocale(momentApi);
                monthName = momentApi(date).locale(locale).format('MMMM');
            } else {
                monthName = date.toLocaleString(undefined, { month: 'long' });
            }

            // Capitalize month name for languages that use lowercase
            if (DateUtils.lowercaseMonthLanguages.has(normalizedLanguage)) {
                monthName = DateUtils.capitalizeFirst(monthName);
            }

            const month = String(date.getMonth() + 1).padStart(2, '0');
            return { label: monthName, key: `month:${date.getFullYear()}-${month}` };
        }

        // Previous years - show year
        const year = date.getFullYear().toString();
        return { label: year, key: `year:${year}` };
    }

    /**
     * Get a date group label for grouping files by date
     * @param timestamp - Unix timestamp in milliseconds
     * @param nowOverride - Optional reference time for grouping comparisons
     * @returns Date group label (e.g. "Today", "Yesterday", "Previous 7 Days", etc.)
     */
    static getDateGroup(timestamp: number, nowOverride?: Date): string {
        return DateUtils.getDateGroupInfo(timestamp, nowOverride).label;
    }

    /**
     * Format a date based on its group - Apple Notes style
     * @param timestamp - Unix timestamp in milliseconds
     * @param group - The date group this timestamp belongs to
     * @param dateFormat - Default date format string (moment format)
     * @param timeFormat - Time format string (moment format)
     * @returns Formatted date string appropriate for the group
     */
    static formatDateForGroup(timestamp: number, group: string, dateFormat: string, timeFormat: string): string {
        const date = new Date(timestamp);

        // Today and Yesterday groups - show time only
        if (group === strings.dateGroups.today || group === strings.dateGroups.yesterday) {
            return DateUtils.formatWithFallback(date, timeFormat, 'time');
        }

        // Previous 7 days - show weekday name
        if (group === strings.dateGroups.previous7Days) {
            return DateUtils.formatWithFallback(date, 'dddd', 'date');
        }

        // All other groups - use default format
        return DateUtils.formatDate(timestamp, dateFormat);
    }

    /**
     * Get file timestamp
     * @param file - The file to get timestamp for
     * @param dateType - Whether to get created or modified timestamp
     * @param cachedData - Optional cached file data containing frontmatter timestamps
     * @param settings - Plugin settings to check if frontmatter is enabled
     * @returns Unix timestamp in milliseconds
     */
    static getFileTimestamp(
        file: TFile,
        dateType: 'created' | 'modified',
        cachedData?: { fc?: number; fm?: number },
        settings?: NotebookNavigatorSettings
    ): number {
        // If frontmatter metadata is enabled and we have cached timestamps, use them
        if (settings?.useFrontmatterMetadata && cachedData) {
            const timestamp = dateType === 'created' ? cachedData.fc : cachedData.fm;
            if (timestamp !== undefined) {
                return timestamp;
            }
        }

        // Fall back to file system timestamps
        return dateType === 'created' ? file.stat.ctime : file.stat.mtime;
    }

    /**
     * Parse a frontmatter date value into a timestamp
     * @param value - The frontmatter value to parse
     * @param dateFormat - The expected date format from settings
     * @returns Unix timestamp in milliseconds, or undefined if parsing fails
     */
    static parseFrontmatterDate(value: unknown, dateFormat: string): number | undefined {
        if (!value) return undefined;

        try {
            // If it's already a Date object
            if (value instanceof Date) {
                return value.getTime();
            }

            // If it's a number, assume it's already a timestamp
            if (typeof value === 'number') {
                // If it looks like seconds (less than year 3000 in milliseconds)
                if (value < 32503680000) {
                    return value * 1000;
                }
                return value;
            }

            // If it's a string, parse it
            if (typeof value === 'string') {
                const normalizedLanguage = DateUtils.getNormalizedLanguage();
                const trimmedValue = value.trim();
                const normalizedValue = DateUtils.normalizeMeridiemSpacing(trimmedValue, normalizedLanguage);
                const momentApi = getMomentApi();
                if (!momentApi) {
                    if (!dateFormat || !dateFormat.trim()) {
                        const parsedTimestamp = Date.parse(normalizedValue);
                        return Number.isFinite(parsedTimestamp) ? parsedTimestamp : undefined;
                    }
                    return undefined;
                }

                const locale = DateUtils.getMomentLocale(momentApi);
                if (!dateFormat || !dateFormat.trim()) {
                    const isoToken = 'ISO_8601' in momentApi ? momentApi.ISO_8601 : undefined;
                    if (!isoToken) {
                        return undefined;
                    }
                    const parsedDate = momentApi(normalizedValue, isoToken, true).locale(locale);
                    return parsedDate.isValid() ? parsedDate.toDate().getTime() : undefined;
                }

                const parsedDate = momentApi(normalizedValue, dateFormat, locale, true);
                return parsedDate.isValid() ? parsedDate.toDate().getTime() : undefined;
            }
        } catch {
            // Parsing failed
        }

        return undefined;
    }
}
