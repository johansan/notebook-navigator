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

import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CalendarGrid } from '../../src/components/calendar/CalendarGrid';
import { CalendarHeader } from '../../src/components/calendar/CalendarHeader';
import { CalendarYearPanel } from '../../src/components/calendar/CalendarYearPanel';
import type { CalendarYearMonthEntry } from '../../src/components/calendar/types';
import type { MomentInstance, MomentLocaleData } from '../../src/utils/moment';
import { createTestTFile } from '../utils/createTestTFile';

function createCalendarDayMoment(): MomentInstance {
    const localeData: MomentLocaleData = {
        firstDayOfWeek: () => 1,
        weekdaysMin: () => [],
        weekdaysShort: () => []
    };
    const moment: MomentInstance = {
        clone: () => moment,
        format: format => (format === 'LL' ? 'June 14, 2026' : '2026-06-14'),
        isValid: () => true,
        locale: () => moment,
        localeData: () => localeData,
        startOf: () => moment,
        endOf: () => moment,
        add: () => moment,
        subtract: () => moment,
        diff: () => 0,
        week: () => 24,
        weekYear: () => 2026,
        isoWeek: () => 24,
        isoWeekYear: () => 2026,
        month: () => 5,
        year: () => 2026,
        date: () => 14,
        set: () => moment,
        get: () => 0,
        toDate: () => new Date('2026-06-14T00:00:00Z')
    };
    return moment;
}

describe('calendar active editor state', () => {
    it('renders active outlines on month, quarter, and year period buttons', () => {
        const html = renderToStaticMarkup(
            React.createElement(CalendarHeader, {
                monthLabel: 'April',
                yearLabel: '2026',
                quarterLabel: 'Q2',
                showYearInHeader: true,
                showQuarter: true,
                hasMonthPeriodNote: true,
                hasQuarterPeriodNote: true,
                hasYearPeriodNote: true,
                isMonthPeriodActive: true,
                isQuarterPeriodActive: true,
                isYearPeriodActive: true,
                showInlineMonthNavigation: false,
                showCompactQuarterInMonthRow: false,
                showHeaderPeriodDetails: true,
                showHeaderNavRow: false,
                showCompactHeaderInlineInfoButton: false,
                showInfoInNavRow: false,
                onNavigate: () => {},
                onToday: () => {},
                onOpenHelp: () => {},
                onPeriodClick: () => {},
                onPeriodMouseDown: () => {},
                onPeriodContextMenu: () => {}
            })
        );

        expect(html).toContain('nn-navigation-calendar-period-month has-period-note is-active-editor-file');
        expect(html).toContain('nn-navigation-calendar-quarter-button has-period-note is-active-editor-file');
        expect(html).toContain('nn-navigation-calendar-period-year has-period-note is-active-editor-file');
    });

    it('renders an active outline on the selected weekly note button', () => {
        const weekNoteFile = createTestTFile('Periodic/2026/W14.md');
        const html = renderToStaticMarkup(
            React.createElement(CalendarGrid, {
                activeEditorFilePath: weekNoteFile.path,
                showWeekNumbers: true,
                weekdays: [],
                weekStartsOn: 1,
                trailingSpacerWeekCount: 0,
                weeks: [{ key: 'week-2026-W14', weekNumber: 14, days: [] }],
                weekNotesEnabled: true,
                weekNoteTargetsByKey: new Map([
                    [
                        'week-2026-W14',
                        {
                            existingFile: weekNoteFile,
                            visibleFile: weekNoteFile,
                            isHidden: false,
                            targetPath: weekNoteFile.path
                        }
                    ]
                ]),
                weekUnfinishedTaskCountByKey: new Map(),
                displayLocale: 'en',
                calendarWeekendDays: 'sat-sun',
                todayIso: null,
                unfinishedTaskCountByIso: new Map(),
                featureImageUrls: {},
                featureImageKeysByIso: new Map(),
                frontmatterTitlesByPath: new Map(),
                dateFormat: 'YYYY-MM-DD',
                isMobile: false,
                canCreateDayNotes: true,
                onShowTooltip: () => {},
                onHideTooltip: () => {},
                onDayClick: () => {},
                onDayMouseDown: () => {},
                onDayContextMenu: () => {},
                onWeekClick: () => {},
                onWeekMouseDown: () => {},
                onWeekLabelClick: () => {},
                onWeekContextMenu: () => {}
            })
        );

        expect(html).toContain('nn-navigation-calendar-weeknumber-button has-period-note is-active-editor-file');
    });

    it('does not render a stale feature image for a hidden daily note', () => {
        const dayFile = createTestTFile('Periodic/2026-06-14.md');
        const dayIso = '2026-06-14';
        const html = renderToStaticMarkup(
            React.createElement(CalendarGrid, {
                activeEditorFilePath: dayFile.path,
                showWeekNumbers: false,
                weekdays: [],
                weekStartsOn: 1,
                trailingSpacerWeekCount: 0,
                weeks: [
                    {
                        key: 'week-2026-W24',
                        weekNumber: 24,
                        days: [
                            {
                                date: createCalendarDayMoment(),
                                iso: dayIso,
                                inMonth: true,
                                note: {
                                    existingFile: dayFile,
                                    visibleFile: null,
                                    isHidden: true,
                                    targetPath: dayFile.path
                                }
                            }
                        ]
                    }
                ],
                weekNotesEnabled: false,
                weekNoteTargetsByKey: new Map(),
                weekUnfinishedTaskCountByKey: new Map(),
                displayLocale: 'en',
                calendarWeekendDays: 'sat-sun',
                todayIso: null,
                unfinishedTaskCountByIso: new Map([[dayIso, 1]]),
                featureImageUrls: { [dayIso]: 'blob:stale-calendar-image' },
                featureImageKeysByIso: new Map([[dayIso, 'cover']]),
                frontmatterTitlesByPath: new Map([[dayFile.path, 'Hidden title']]),
                dateFormat: 'YYYY-MM-DD',
                isMobile: false,
                canCreateDayNotes: true,
                onShowTooltip: () => {},
                onHideTooltip: () => {},
                onDayClick: () => {},
                onDayMouseDown: () => {},
                onDayContextMenu: () => {},
                onWeekClick: () => {},
                onWeekMouseDown: () => {},
                onWeekLabelClick: () => {},
                onWeekContextMenu: () => {}
            })
        );

        expect(html).not.toContain('blob:stale-calendar-image');
        expect(html).not.toContain('has-feature-image');
        expect(html).not.toContain('has-daily-note');
        expect(html).not.toContain('has-unfinished-tasks');
        expect(html).not.toContain('Hidden title');
    });

    it('renders an active outline on the year period button in the year panel', () => {
        const yearEntry: CalendarYearMonthEntry = {
            date: {} as CalendarYearMonthEntry['date'],
            fullLabel: 'January',
            hasDailyNote: false,
            hasUnfinishedTasks: false,
            key: '2026-01',
            monthIndex: 0,
            shortLabel: 'Jan'
        };
        const html = renderToStaticMarkup(
            React.createElement(CalendarYearPanel, {
                showYearCalendar: true,
                currentMonthKey: null,
                displayedYearValue: 2026,
                activeYearValue: 2026,
                activeMonthIndex: 0,
                hasYearPeriodNote: true,
                isYearPeriodActive: true,
                yearMonthEntries: [yearEntry],
                highlightedMonthFeatureImageKeys: new Set<string>(),
                highlightedMonthImageUrls: {},
                onNavigateYear: () => {},
                onYearPeriodClick: () => {},
                onYearPeriodMouseDown: () => {},
                onYearPeriodContextMenu: () => {},
                onSelectYearMonth: () => {}
            })
        );

        expect(html).toContain(
            'nn-navigation-calendar-year-label nn-navigation-calendar-period-button has-period-note is-active-editor-file'
        );
    });
});
