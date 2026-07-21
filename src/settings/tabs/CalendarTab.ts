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

import type { Setting, SettingDefinitionItem } from 'obsidian';
import { DropdownComponent } from 'obsidian';
import { strings } from '../../i18n';
import { getMomentApi } from '../../utils/moment';
import { createDropdownDefinition, createGroupDefinition, createRenderDefinition, createToggleDefinition } from '../nativeSettingControls';
import { addSettingSyncModeToggle } from '../syncModeToggle';
import { isCalendarLeftPlacement, isCalendarPlacement, type CalendarWeeksToShow } from '../types';
import { createCalendarIntegrationSettingDefinitions } from './CalendarIntegrationSection';
import type { SettingsTabContext } from './SettingsTabContext';

const CALENDAR_LOCALE_SYSTEM_DEFAULT = 'system-default';

/** Builds native 1.13 setting definitions for calendar settings. */
export function createCalendarSettingDefinitions(context: SettingsTabContext): SettingDefinitionItem[] {
    let calendarLocaleWarningEl: HTMLElement | null = null;

    return [
        createGroupDefinition(undefined, [
            createToggleDefinition('calendarEnabled', {
                name: strings.settings.items.calendarEnabled.name,
                desc: strings.settings.items.calendarEnabled.desc
            }),
            createRenderDefinition({
                name: strings.settings.items.calendarPlacement.name,
                desc: strings.settings.items.calendarPlacement.desc,
                aliases: Object.values(strings.settings.items.calendarPlacement.options),
                render: setting => renderCalendarPlacementSetting(setting, context)
            }),
            createToggleDefinition('calendarConfirmBeforeCreate', {
                name: strings.settings.items.calendarConfirmBeforeCreate.name,
                desc: strings.settings.items.calendarConfirmBeforeCreate.desc
            }),
            createToggleDefinition('calendarShowHiddenItems', {
                name: strings.settings.items.calendarShowHiddenItems.name,
                desc: strings.settings.items.calendarShowHiddenItems.desc
            })
        ]),
        createGroupDefinition(strings.settings.groups.navigation.appearance, [
            createRenderDefinition({
                name: strings.settings.items.calendarLocale.name,
                desc: strings.settings.items.calendarLocale.desc,
                render: setting => {
                    calendarLocaleWarningEl = renderCalendarLocaleSetting(setting, context);
                }
            }),
            createDropdownDefinition('calendarWeekendDays', {
                name: strings.settings.items.calendarWeekendDays.name,
                desc: strings.settings.items.calendarWeekendDays.desc,
                aliases: Object.values(strings.settings.items.calendarWeekendDays.options),
                options: {
                    none: strings.settings.items.calendarWeekendDays.options.none,
                    'sat-sun': strings.settings.items.calendarWeekendDays.options.satSun,
                    'fri-sat': strings.settings.items.calendarWeekendDays.options.friSat,
                    'thu-fri': strings.settings.items.calendarWeekendDays.options.thuFri
                }
            }),
            createDropdownDefinition('calendarMonthHeadingFormat', {
                name: strings.settings.items.calendarMonthHeadingFormat.name,
                desc: strings.settings.items.calendarMonthHeadingFormat.desc,
                aliases: Object.values(strings.settings.items.calendarMonthHeadingFormat.options),
                options: {
                    full: strings.settings.items.calendarMonthHeadingFormat.options.full,
                    short: strings.settings.items.calendarMonthHeadingFormat.options.short
                }
            }),
            createToggleDefinition('calendarHighlightToday', {
                name: strings.settings.items.calendarHighlightToday.name,
                desc: strings.settings.items.calendarHighlightToday.desc
            }),
            createToggleDefinition('calendarShowFeatureImage', {
                name: strings.settings.items.calendarShowFeatureImage.name,
                desc: strings.settings.items.calendarShowFeatureImage.desc
            }),
            createToggleDefinition('calendarShowTasks', {
                name: strings.settings.items.calendarShowTasks.name,
                desc: strings.settings.items.calendarShowTasks.desc
            }),
            createToggleDefinition('calendarShowWeekNumber', {
                name: strings.settings.items.calendarShowWeekNumber.name,
                desc: strings.settings.items.calendarShowWeekNumber.desc
            }),
            createToggleDefinition('calendarShowQuarter', {
                name: strings.settings.items.calendarShowQuarter.name,
                desc: strings.settings.items.calendarShowQuarter.desc
            })
        ]),
        createGroupDefinition(strings.settings.groups.navigation.leftSidebar, [
            createRenderDefinition({
                name: strings.settings.items.calendarLeftPlacement.name,
                desc: strings.settings.items.calendarLeftPlacement.desc,
                aliases: Object.values(strings.settings.items.calendarLeftPlacement.options),
                render: setting => renderCalendarLeftPlacementSetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.calendarWeeksToShow.name,
                desc: strings.settings.items.calendarWeeksToShow.desc,
                aliases: Object.values(strings.settings.items.calendarWeeksToShow.options),
                render: setting => renderCalendarWeeksToShowSetting(setting, context)
            })
        ]),
        createGroupDefinition(strings.settings.items.calendarPlacement.options.rightSidebar, [
            createToggleDefinition('calendarShowYearCalendar', {
                name: strings.settings.items.calendarShowYearCalendar.name,
                desc: strings.settings.items.calendarShowYearCalendar.desc
            })
        ]),
        ...createCalendarIntegrationSettingDefinitions(context, {
            getCalendarLocaleWarningEl: () => calendarLocaleWarningEl
        })
    ];
}

function renderCalendarPlacementSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting.setName(strings.settings.items.calendarPlacement.name).setDesc(strings.settings.items.calendarPlacement.desc);
    setting.addDropdown((dropdown: DropdownComponent) => {
        dropdown
            .addOption('left-sidebar', strings.settings.items.calendarPlacement.options.leftSidebar)
            .addOption('right-sidebar', strings.settings.items.calendarPlacement.options.rightSidebar)
            .setValue(plugin.settings.calendarPlacement)
            .onChange(value => {
                if (!isCalendarPlacement(value)) {
                    return;
                }

                plugin.setCalendarPlacement(value);
            });
    });

    addSettingSyncModeToggle({ setting, plugin, settingId: 'calendarPlacement' });
}

function renderCalendarLocaleSetting(setting: Setting, context: SettingsTabContext): HTMLElement {
    const { plugin } = context;
    const momentApi = getMomentApi();
    const localeOptions = momentApi ? [...momentApi.locales()].sort((a, b) => a.localeCompare(b)) : [];
    const systemLocale = typeof navigator !== 'undefined' ? (navigator.language ?? '').toLowerCase() : '';
    const currentLocale = momentApi?.locale() || systemLocale;

    setting.setName(strings.settings.items.calendarLocale.name).setDesc(strings.settings.items.calendarLocale.desc);
    setting.addDropdown((dropdown: DropdownComponent) => {
        dropdown.addOption(
            CALENDAR_LOCALE_SYSTEM_DEFAULT,
            `${strings.settings.items.calendarLocale.options.systemDefault} (${currentLocale || 'en'})`
        );
        for (const locale of localeOptions) {
            dropdown.addOption(locale, locale);
        }

        dropdown.setValue(plugin.settings.calendarLocale).onChange(async value => {
            plugin.settings.calendarLocale = value;
            await plugin.saveSettingsAndUpdate();
        });
    });

    return setting.descEl.createDiv({
        cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
    });
}

function renderCalendarLeftPlacementSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting.setName(strings.settings.items.calendarLeftPlacement.name).setDesc(strings.settings.items.calendarLeftPlacement.desc);
    setting.addDropdown((dropdown: DropdownComponent) => {
        dropdown
            .addOption('below', strings.settings.items.calendarLeftPlacement.options.below)
            .addOption('navigation', strings.settings.items.calendarLeftPlacement.options.navigationPane)
            .setValue(plugin.settings.calendarLeftPlacement)
            .onChange(value => {
                if (!isCalendarLeftPlacement(value)) {
                    return;
                }

                plugin.setCalendarLeftPlacement(value);
            });
    });

    addSettingSyncModeToggle({ setting, plugin, settingId: 'calendarLeftPlacement' });
}

function renderCalendarWeeksToShowSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting.setName(strings.settings.items.calendarWeeksToShow.name).setDesc(strings.settings.items.calendarWeeksToShow.desc);
    setting.addDropdown((dropdown: DropdownComponent) => {
        dropdown.addOption('1', strings.settings.items.calendarWeeksToShow.options.oneWeek);
        for (let count = 2; count <= 5; count++) {
            dropdown.addOption(
                String(count),
                strings.settings.items.calendarWeeksToShow.options.weeksCount.replace('{count}', count.toString())
            );
        }
        dropdown.addOption('6', strings.settings.items.calendarWeeksToShow.options.fullMonth);

        dropdown.setValue(String(plugin.settings.calendarWeeksToShow)).onChange(value => {
            const parsed = Number.parseInt(value, 10);
            if (!Number.isFinite(parsed) || parsed < 1 || parsed > 6) {
                return;
            }

            plugin.setCalendarWeeksToShow(parsed as CalendarWeeksToShow);
        });
    });

    addSettingSyncModeToggle({ setting, plugin, settingId: 'calendarWeeksToShow' });
}
