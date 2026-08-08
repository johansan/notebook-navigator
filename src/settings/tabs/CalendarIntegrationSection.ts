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

import { DropdownComponent, Setting } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import { getCurrentLanguage, strings } from '../../i18n';
import {
    getMomentApi,
    resolveCalendarLocales,
    resolveCalendarPeriodicNotesLocale,
    resolveDailyNoteLocale,
    type MomentApi
} from '../../utils/moment';
import { getActiveVaultProfile } from '../../utils/vaultProfiles';
import type { createSettingGroupFactory } from '../settingGroups';
import { createDependentSettingsSection, setElementVisible } from '../dependentSettings';
import { isCalendarPeriodicNotesLocaleSource } from '../types';
import { createGroupDefinition, createRenderDefinition } from '../nativeSettingControls';
import {
    createCalendarCustomPatternRenderers,
    createCalendarCustomPatternSettingDefinitions,
    renderCalendarCustomPatternSection,
    type CalendarSelectedLocales
} from './CalendarCustomPatternSection';
import type { SettingsTabContext } from './SettingsTabContext';

type CreateSettingGroup = ReturnType<typeof createSettingGroupFactory>;

interface CalendarIntegrationSectionOptions {
    calendarLocaleWarningEl: HTMLElement;
}

interface CalendarIntegrationSettingDefinitionOptions {
    getCalendarLocaleWarningEl: () => HTMLElement | null;
}

function formatLocaleWeekdayExample(locale: string): string {
    const currentMomentApi = getMomentApi();
    const sampleDate = currentMomentApi?.('2026-01-19', 'YYYY-MM-DD', true).locale(locale);
    if (!sampleDate?.isValid()) {
        return '';
    }

    const formatted = sampleDate.format('dddd').trim();
    const [first = '', ...rest] = Array.from(formatted);
    return first ? `${first.toLocaleUpperCase()}${rest.join('')}` : '';
}

function formatPeriodicNotesLocaleOption(label: string, locale: string): string {
    const example = formatLocaleWeekdayExample(locale);
    return example ? `${label} - ${locale} (${example})` : `${label} - ${locale}`;
}

function createSelectedCalendarLocalesResolver(context: SettingsTabContext): (momentApi: MomentApi | null) => CalendarSelectedLocales {
    const { plugin } = context;

    return (momentApi: MomentApi | null): CalendarSelectedLocales => {
        const locales = resolveCalendarLocales(plugin.settings.calendarLocale, momentApi, getCurrentLanguage());
        return {
            calendarRulesLocale: locales.calendarRulesLocale,
            periodicNotesLocale: resolveCalendarPeriodicNotesLocale(
                plugin.settings.calendarPeriodicNotesLocaleSource,
                locales.calendarRulesLocale,
                momentApi
            )
        };
    };
}

function renderDailyNotesInfoSetting(setting: Setting): void {
    setting.setName('').setDesc('');
    setting.settingEl.addClass('nn-setting-info-container');
    setting.descEl.empty();
    setting.descEl.createDiv({ text: strings.settings.items.dailyNoteSource.info.dailyNotes });
}

function renderCalendarIntegrationModeSetting(setting: Setting, context: SettingsTabContext, onChange: () => void): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.dailyNoteSource.name)
        .setDesc(strings.settings.items.dailyNoteSource.desc)
        .addDropdown(dropdown =>
            dropdown
                .addOption('daily-notes', strings.settings.items.dailyNoteSource.options.dailyNotes)
                .addOption('notebook-navigator', strings.settings.items.dailyNoteSource.options.notebookNavigator)
                .setValue(plugin.settings.calendarIntegrationMode)
                .onChange(async value => {
                    if (value !== 'daily-notes' && value !== 'notebook-navigator') {
                        return;
                    }
                    plugin.settings.calendarIntegrationMode = value;
                    onChange();
                    await plugin.saveSettingsAndUpdate();
                })
        );
}

function renderCalendarPeriodicNotesLocaleOptions(
    dropdown: DropdownComponent | null,
    resolveSelectedCalendarLocales: (momentApi: MomentApi | null) => CalendarSelectedLocales
): void {
    if (!dropdown) {
        return;
    }

    const currentMomentApi = getMomentApi();
    const { calendarRulesLocale } = resolveSelectedCalendarLocales(currentMomentApi);
    const obsidianLocale = resolveDailyNoteLocale(currentMomentApi);
    const optionLabels = {
        calendar: formatPeriodicNotesLocaleOption(strings.settings.items.calendarPeriodicNotesLocale.options.calendar, calendarRulesLocale),
        obsidian: formatPeriodicNotesLocaleOption(strings.settings.items.calendarPeriodicNotesLocale.options.obsidian, obsidianLocale)
    };

    Object.entries(optionLabels).forEach(([value, label]) => {
        const optionEl = dropdown.selectEl.querySelector<HTMLOptionElement>(`option[value="${value}"]`);
        if (optionEl) {
            optionEl.text = label;
        }
    });
}

function renderCalendarPeriodicNotesLocaleSetting(
    setting: Setting,
    context: SettingsTabContext,
    options: {
        setDropdown(dropdown: DropdownComponent): void;
        refresh(): void;
    }
): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.calendarPeriodicNotesLocale.name)
        .setDesc(strings.settings.items.calendarPeriodicNotesLocale.desc)
        .addDropdown(dropdown => {
            options.setDropdown(dropdown);
            dropdown
                .addOption('calendar', strings.settings.items.calendarPeriodicNotesLocale.options.calendar)
                .addOption('obsidian', strings.settings.items.calendarPeriodicNotesLocale.options.obsidian)
                .setValue(plugin.settings.calendarPeriodicNotesLocaleSource)
                .onChange(async value => {
                    if (!isCalendarPeriodicNotesLocaleSource(value)) {
                        return;
                    }

                    plugin.settings.calendarPeriodicNotesLocaleSource = value;
                    options.refresh();
                    await plugin.saveSettingsAndUpdate();
                });
            options.refresh();
        });
}

export function createCalendarIntegrationSettingDefinitions(
    context: SettingsTabContext,
    options: CalendarIntegrationSettingDefinitionOptions
): SettingDefinitionItem[] {
    const { plugin } = context;
    const getActiveProfile = () => getActiveVaultProfile(plugin.settings);
    const resolveSelectedCalendarLocales = createSelectedCalendarLocalesResolver(context);
    const isNotebookNavigatorIntegration = () => plugin.settings.calendarIntegrationMode === 'notebook-navigator';
    let calendarPeriodicNotesLocaleDropdown: DropdownComponent | null = null;

    const customPatternRenderers = createCalendarCustomPatternRenderers({
        context,
        getCalendarLocaleWarningEl: options.getCalendarLocaleWarningEl,
        getActiveProfile,
        resolveSelectedCalendarLocales,
        requestVisibilityRefresh: () => refreshCalendarIntegrationContent()
    });

    const refreshCalendarIntegrationContent = (): void => {
        renderCalendarPeriodicNotesLocaleOptions(calendarPeriodicNotesLocaleDropdown, resolveSelectedCalendarLocales);

        if (!isNotebookNavigatorIntegration()) {
            customPatternRenderers.hideMessages();
            return;
        }

        customPatternRenderers.refresh();
    };

    const refreshCalendarIntegrationDomState = (): void => {
        context.refreshSettingsDomState();
        refreshCalendarIntegrationContent();
    };

    return [
        createGroupDefinition(strings.settings.pages.calendar.groups.calendarIntegration, [
            createRenderDefinition({
                name: strings.settings.items.dailyNoteSource.name,
                desc: strings.settings.items.dailyNoteSource.desc,
                aliases: Object.values(strings.settings.items.dailyNoteSource.options),
                render: setting => {
                    renderCalendarIntegrationModeSetting(setting, context, refreshCalendarIntegrationDomState);
                    context.registerSettingsUpdateListener('calendar-tab-calendar-integration', refreshCalendarIntegrationDomState);
                    refreshCalendarIntegrationContent();
                }
            }),
            createRenderDefinition({
                name: strings.settings.items.dailyNoteSource.info.dailyNotes,
                searchable: false,
                visible: () => plugin.settings.calendarIntegrationMode === 'daily-notes',
                render: setting => renderDailyNotesInfoSetting(setting)
            }),
            createRenderDefinition({
                name: strings.settings.items.calendarPeriodicNotesLocale.name,
                desc: strings.settings.items.calendarPeriodicNotesLocale.desc,
                aliases: Object.values(strings.settings.items.calendarPeriodicNotesLocale.options),
                visible: isNotebookNavigatorIntegration,
                render: setting =>
                    renderCalendarPeriodicNotesLocaleSetting(setting, context, {
                        setDropdown: dropdown => {
                            calendarPeriodicNotesLocaleDropdown = dropdown;
                        },
                        refresh: refreshCalendarIntegrationContent
                    })
            }),
            ...createCalendarCustomPatternSettingDefinitions(customPatternRenderers, isNotebookNavigatorIntegration)
        ])
    ];
}

export function renderCalendarIntegrationSection(
    context: SettingsTabContext,
    createGroup: CreateSettingGroup,
    options: CalendarIntegrationSectionOptions
): () => void {
    const { calendarLocaleWarningEl } = options;
    const { plugin } = context;
    const getActiveProfile = () => getActiveVaultProfile(plugin.settings);
    const resolveSelectedCalendarLocales = createSelectedCalendarLocalesResolver(context);

    const calendarIntegrationGroup = createGroup(strings.settings.pages.calendar.groups.calendarIntegration);
    let renderCalendarIntegrationVisibility = (): void => {};

    const calendarIntegrationSetting = calendarIntegrationGroup.addSetting(setting => {
        renderCalendarIntegrationModeSetting(setting, context, () => renderCalendarIntegrationVisibility());
    });

    const dailyNotesInfoSettingsEl = createDependentSettingsSection(calendarIntegrationSetting);
    const customCalendarSettingsEl = createDependentSettingsSection(calendarIntegrationSetting);

    renderDailyNotesInfoSetting(new Setting(dailyNotesInfoSettingsEl));

    let calendarPeriodicNotesLocaleDropdown: DropdownComponent | null = null;

    const refreshCalendarPeriodicNotesLocaleOptions = (): void => {
        renderCalendarPeriodicNotesLocaleOptions(calendarPeriodicNotesLocaleDropdown, resolveSelectedCalendarLocales);
    };

    renderCalendarPeriodicNotesLocaleSetting(new Setting(customCalendarSettingsEl), context, {
        setDropdown: dropdown => {
            calendarPeriodicNotesLocaleDropdown = dropdown;
        },
        refresh: () => renderCalendarIntegrationVisibility()
    });

    const customPatternController = renderCalendarCustomPatternSection({
        context,
        containerEl: customCalendarSettingsEl,
        getCalendarLocaleWarningEl: () => calendarLocaleWarningEl,
        getActiveProfile,
        resolveSelectedCalendarLocales,
        requestVisibilityRefresh: () => renderCalendarIntegrationVisibility()
    });

    renderCalendarIntegrationVisibility = (): void => {
        const isDailyNotes = plugin.settings.calendarIntegrationMode === 'daily-notes';
        const isCustom = plugin.settings.calendarIntegrationMode === 'notebook-navigator';

        refreshCalendarPeriodicNotesLocaleOptions();
        setElementVisible(dailyNotesInfoSettingsEl, isDailyNotes);
        setElementVisible(customCalendarSettingsEl, isCustom);

        if (!isCustom) {
            customPatternController.hideMessages();
            return;
        }

        customPatternController.refresh();
    };

    context.registerSettingsUpdateListener('calendar-tab-calendar-integration', () => {
        renderCalendarIntegrationVisibility();
    });

    return renderCalendarIntegrationVisibility;
}
