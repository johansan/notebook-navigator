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

import { DropdownComponent } from 'obsidian';
import { strings } from '../../i18n';
import { getMomentApi } from '../../utils/moment';
import type { createSettingGroupFactory } from '../settingGroups';
import { addSettingSyncModeToggle } from '../syncModeToggle';
import {
    isCalendarLeftPlacement,
    isCalendarMonthHeadingFormat,
    isCalendarPlacement,
    isCalendarWeekendDays,
    type CalendarWeeksToShow
} from '../types';
import type { SettingsTabContext } from './SettingsTabContext';

const CALENDAR_LOCALE_SYSTEM_DEFAULT = 'system-default';

type CreateSettingGroup = ReturnType<typeof createSettingGroupFactory>;

interface CalendarDisplaySectionOptions {
    onCalendarLocaleChange: () => void;
}

interface CalendarDisplaySectionResult {
    calendarLocaleWarningEl: HTMLElement;
}

function parseCalendarWeeksToShow(value: string): CalendarWeeksToShow | null {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 6) {
        return null;
    }
    return parsed as CalendarWeeksToShow;
}

function formatCalendarWeeksOption(count: number): string {
    return strings.settings.items.calendarWeeksToShow.options.weeksCount.replace('{count}', count.toString());
}

export function renderCalendarDisplaySections(
    context: SettingsTabContext,
    createGroup: CreateSettingGroup,
    options: CalendarDisplaySectionOptions
): CalendarDisplaySectionResult {
    const { plugin } = context;

    const topGroup = createGroup(undefined);

    topGroup
        .addSetting(setting => {
            setting.setName(strings.settings.items.calendarEnabled.name).setDesc(strings.settings.items.calendarEnabled.desc);
        })
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.calendarEnabled).onChange(async value => {
                plugin.settings.calendarEnabled = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const calendarPlacementSetting = topGroup.addSetting(setting => {
        setting.setName(strings.settings.items.calendarPlacement.name).setDesc(strings.settings.items.calendarPlacement.desc);
    });

    calendarPlacementSetting.addDropdown((dropdown: DropdownComponent) => {
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

    addSettingSyncModeToggle({ setting: calendarPlacementSetting, plugin, settingId: 'calendarPlacement' });

    topGroup
        .addSetting(setting => {
            setting
                .setName(strings.settings.items.calendarConfirmBeforeCreate.name)
                .setDesc(strings.settings.items.calendarConfirmBeforeCreate.desc);
        })
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.calendarConfirmBeforeCreate).onChange(async value => {
                plugin.settings.calendarConfirmBeforeCreate = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    topGroup
        .addSetting(setting => {
            setting
                .setName(strings.settings.items.calendarShowHiddenItems.name)
                .setDesc(strings.settings.items.calendarShowHiddenItems.desc);
        })
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.calendarShowHiddenItems).onChange(async value => {
                plugin.settings.calendarShowHiddenItems = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const appearanceGroup = createGroup(strings.settings.groups.navigation.appearance);
    const momentApi = getMomentApi();
    const localeOptions = momentApi ? [...momentApi.locales()].sort((a, b) => a.localeCompare(b)) : [];
    const systemLocale = typeof navigator !== 'undefined' ? (navigator.language ?? '').toLowerCase() : '';
    const currentLocale = momentApi?.locale() || systemLocale;

    const calendarLocaleSetting = appearanceGroup.addSetting(setting => {
        setting.setName(strings.settings.items.calendarLocale.name).setDesc(strings.settings.items.calendarLocale.desc);
    });

    calendarLocaleSetting.addDropdown((dropdown: DropdownComponent) => {
        dropdown.addOption(
            CALENDAR_LOCALE_SYSTEM_DEFAULT,
            `${strings.settings.items.calendarLocale.options.systemDefault} (${currentLocale || 'en'})`
        );
        for (const locale of localeOptions) {
            dropdown.addOption(locale, locale);
        }

        dropdown.setValue(plugin.settings.calendarLocale).onChange(async value => {
            plugin.settings.calendarLocale = value;
            options.onCalendarLocaleChange();
            await plugin.saveSettingsAndUpdate();
        });
    });

    const calendarLocaleWarningEl = calendarLocaleSetting.descEl.createDiv({
        cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
    });

    appearanceGroup
        .addSetting(setting => {
            setting.setName(strings.settings.items.calendarWeekendDays.name).setDesc(strings.settings.items.calendarWeekendDays.desc);
        })
        .addDropdown((dropdown: DropdownComponent) => {
            dropdown
                .addOption('none', strings.settings.items.calendarWeekendDays.options.none)
                .addOption('sat-sun', strings.settings.items.calendarWeekendDays.options.satSun)
                .addOption('fri-sat', strings.settings.items.calendarWeekendDays.options.friSat)
                .addOption('thu-fri', strings.settings.items.calendarWeekendDays.options.thuFri)
                .setValue(plugin.settings.calendarWeekendDays)
                .onChange(async value => {
                    if (!isCalendarWeekendDays(value)) {
                        return;
                    }

                    plugin.settings.calendarWeekendDays = value;
                    await plugin.saveSettingsAndUpdate();
                });
        });

    appearanceGroup
        .addSetting(setting => {
            setting
                .setName(strings.settings.items.calendarMonthHeadingFormat.name)
                .setDesc(strings.settings.items.calendarMonthHeadingFormat.desc);
        })
        .addDropdown((dropdown: DropdownComponent) => {
            dropdown
                .addOption('full', strings.settings.items.calendarMonthHeadingFormat.options.full)
                .addOption('short', strings.settings.items.calendarMonthHeadingFormat.options.short)
                .setValue(plugin.settings.calendarMonthHeadingFormat)
                .onChange(async value => {
                    if (!isCalendarMonthHeadingFormat(value)) {
                        return;
                    }

                    plugin.settings.calendarMonthHeadingFormat = value;
                    await plugin.saveSettingsAndUpdate();
                });
        });

    appearanceGroup
        .addSetting(setting => {
            setting.setName(strings.settings.items.calendarHighlightToday.name).setDesc(strings.settings.items.calendarHighlightToday.desc);
        })
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.calendarHighlightToday).onChange(async value => {
                plugin.settings.calendarHighlightToday = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    appearanceGroup
        .addSetting(setting => {
            setting
                .setName(strings.settings.items.calendarShowFeatureImage.name)
                .setDesc(strings.settings.items.calendarShowFeatureImage.desc);
        })
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.calendarShowFeatureImage).onChange(async value => {
                plugin.settings.calendarShowFeatureImage = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    appearanceGroup
        .addSetting(setting => {
            setting.setName(strings.settings.items.calendarShowTasks.name).setDesc(strings.settings.items.calendarShowTasks.desc);
        })
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.calendarShowTasks).onChange(async value => {
                plugin.settings.calendarShowTasks = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    appearanceGroup
        .addSetting(setting => {
            setting.setName(strings.settings.items.calendarShowWeekNumber.name).setDesc(strings.settings.items.calendarShowWeekNumber.desc);
        })
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.calendarShowWeekNumber).onChange(async value => {
                plugin.settings.calendarShowWeekNumber = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    appearanceGroup
        .addSetting(setting => {
            setting.setName(strings.settings.items.calendarShowQuarter.name).setDesc(strings.settings.items.calendarShowQuarter.desc);
        })
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.calendarShowQuarter).onChange(async value => {
                plugin.settings.calendarShowQuarter = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const leftSidebarGroup = createGroup(strings.settings.groups.navigation.leftSidebar);
    const calendarLeftPlacementSetting = leftSidebarGroup.addSetting(setting => {
        setting.setName(strings.settings.items.calendarLeftPlacement.name).setDesc(strings.settings.items.calendarLeftPlacement.desc);
    });

    calendarLeftPlacementSetting.addDropdown((dropdown: DropdownComponent) => {
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

    addSettingSyncModeToggle({ setting: calendarLeftPlacementSetting, plugin, settingId: 'calendarLeftPlacement' });

    const calendarWeeksToShowSetting = leftSidebarGroup.addSetting(setting => {
        setting.setName(strings.settings.items.calendarWeeksToShow.name).setDesc(strings.settings.items.calendarWeeksToShow.desc);
    });

    calendarWeeksToShowSetting.addDropdown((dropdown: DropdownComponent) => {
        dropdown.addOption('1', strings.settings.items.calendarWeeksToShow.options.oneWeek);
        for (let count = 2; count <= 5; count++) {
            dropdown.addOption(String(count), formatCalendarWeeksOption(count));
        }
        dropdown.addOption('6', strings.settings.items.calendarWeeksToShow.options.fullMonth);

        dropdown.setValue(String(plugin.settings.calendarWeeksToShow)).onChange(value => {
            const parsed = parseCalendarWeeksToShow(value);
            if (parsed === null) {
                return;
            }

            plugin.setCalendarWeeksToShow(parsed);
        });
    });

    addSettingSyncModeToggle({ setting: calendarWeeksToShowSetting, plugin, settingId: 'calendarWeeksToShow' });

    const rightSidebarGroup = createGroup(strings.settings.items.calendarPlacement.options.rightSidebar);

    rightSidebarGroup
        .addSetting(setting => {
            setting
                .setName(strings.settings.items.calendarShowYearCalendar.name)
                .setDesc(strings.settings.items.calendarShowYearCalendar.desc);
        })
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.calendarShowYearCalendar).onChange(async value => {
                plugin.settings.calendarShowYearCalendar = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    return { calendarLocaleWarningEl };
}
