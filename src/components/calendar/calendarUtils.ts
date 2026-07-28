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
import type { CalendarWeekendDays, MultiSelectModifier } from '../../settings/types';
import type { IndexedDBStorage } from '../../storage/IndexedDBStorage';
import type { CalendarNoteKind } from '../../utils/calendarNotes';
import { isMultiSelectModifierPressed } from '../../utils/keyboardOpenContext';
import { supportsKeyboardInteractions } from '../../utils/paneLayout';
import type { MomentInstance } from '../../utils/moment';

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function formatIsoDate(date: MomentInstance): string {
    return date.format('YYYY-MM-DD');
}

export function buildDateFilterToken(kind: CalendarNoteKind, date: MomentInstance): string {
    switch (kind) {
        case 'day':
            return `@${date.format('YYYY-MM-DD')}`;
        case 'week': {
            const start = date.clone().startOf('day');
            const end = start.clone().add(6, 'day');
            return `@${start.format('YYYY-MM-DD')}..${end.format('YYYY-MM-DD')}`;
        }
        case 'month':
            return `@${date.format('YYYY-MM')}`;
        case 'quarter': {
            const quarter = Math.floor(date.month() / 3) + 1;
            return `@${date.format('YYYY')}-Q${quarter}`;
        }
        case 'year':
            return `@${date.format('YYYY')}`;
        default:
            return '';
    }
}

export function shouldAutoRevealCalendarNoteKind(kind: CalendarNoteKind): boolean {
    return kind === 'day' || kind === 'week' || kind === 'month';
}

export function isDateFilterModifierPressed(
    event: { altKey: boolean; ctrlKey: boolean; metaKey: boolean },
    modifierSetting: MultiSelectModifier
): boolean {
    // Modifier-driven date filters follow pointer-modifier support (desktop and tablets);
    // phones stay touch-only. Without this gate a modified click would fall through to
    // creating or opening the calendar note.
    if (!supportsKeyboardInteractions()) {
        return false;
    }

    return isMultiSelectModifierPressed(event, modifierSetting);
}

function getDayOfWeek(date: MomentInstance): number {
    // Use the JS Date weekday (0..6, Sunday..Saturday) to avoid relying on locale-specific moment formatting tokens.
    return date.toDate().getDay();
}

function startOfWeek(date: MomentInstance, weekStartsOn: number): MomentInstance {
    // Compute week start using the configured first day of week while keeping Moment for date math/formatting.
    const dayOfWeek = getDayOfWeek(date);
    const diff = (dayOfWeek - weekStartsOn + 7) % 7;
    return date.clone().subtract(diff, 'day').startOf('day');
}

interface CalendarWeekWindow {
    windowStart: MomentInstance;
    weekCount: number;
}

export function resolveCalendarWeekWindow(params: {
    cursor: MomentInstance;
    weekStartsOn: number;
    weeksToShow: number;
    alwaysRenderSixWeeks?: boolean;
}): CalendarWeekWindow {
    const weeksToShow = clamp(params.weeksToShow, 1, 6);

    if (weeksToShow === 6) {
        const monthStart = params.cursor.clone().startOf('month');
        const gridStart = startOfWeek(monthStart, params.weekStartsOn);
        if (params.alwaysRenderSixWeeks) {
            return {
                windowStart: gridStart,
                weekCount: 6
            };
        }

        const monthEnd = monthStart.clone().endOf('month');
        const gridEndWeekStart = startOfWeek(monthEnd, params.weekStartsOn);
        const totalWeeks = clamp(gridEndWeekStart.diff(gridStart, 'weeks') + 1, 1, 6);

        return {
            windowStart: gridStart,
            weekCount: totalWeeks
        };
    }

    const offset = Math.floor((weeksToShow - 1) / 2);
    const cursorWeekStart = startOfWeek(params.cursor.clone(), params.weekStartsOn);
    return {
        windowStart: cursorWeekStart.clone().subtract(offset, 'week'),
        weekCount: weeksToShow
    };
}

export function isWeekendDay(dayOfWeek: number, weekendDays: CalendarWeekendDays): boolean {
    switch (weekendDays) {
        case 'none':
            return false;
        case 'fri-sat':
            return dayOfWeek === 5 || dayOfWeek === 6;
        case 'thu-fri':
            return dayOfWeek === 4 || dayOfWeek === 5;
        case 'sat-sun':
        default:
            return dayOfWeek === 0 || dayOfWeek === 6;
    }
}

function getUnfinishedTaskCountForPath(db: IndexedDBStorage, path: string): number | null {
    const taskUnfinished = db.getFile(path)?.taskUnfinished;
    if (typeof taskUnfinished !== 'number' || taskUnfinished <= 0) {
        return null;
    }
    return taskUnfinished;
}

export function setUnfinishedTaskCount<TKey>(counts: Map<TKey, number>, key: TKey, file: TFile | null, db: IndexedDBStorage): void {
    if (!file) {
        return;
    }

    const taskUnfinished = getUnfinishedTaskCountForPath(db, file.path);
    if (taskUnfinished === null) {
        return;
    }

    counts.set(key, taskUnfinished);
}
