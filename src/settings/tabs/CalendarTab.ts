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

import { DropdownComponent, ExtraButtonComponent, Setting } from 'obsidian';
import { getCurrentLanguage, strings } from '../../i18n';
import { MOMENT_FORMAT_DOCS_URL } from '../../constants/urls';
import {
    isCalendarMonthHeadingFormat,
    isCalendarLeftPlacement,
    isCalendarPeriodicNotesLocaleSource,
    isCalendarPlacement,
    isCalendarWeekendDays,
    type CalendarWeeksToShow
} from '../types';
import type { SettingsTabContext } from './SettingsTabContext';
import {
    createCalendarCustomDateFormatter,
    DEFAULT_CALENDAR_CUSTOM_FILE_PATTERN,
    DEFAULT_CALENDAR_CUSTOM_MONTH_PATTERN,
    DEFAULT_CALENDAR_CUSTOM_QUARTER_PATTERN,
    DEFAULT_CALENDAR_CUSTOM_WEEK_PATTERN,
    DEFAULT_CALENDAR_CUSTOM_YEAR_PATTERN,
    doesCalendarCustomWeekPatternMixWeekTokenTypes,
    doesCalendarCustomWeekPatternUseDifferentWeekRules,
    ensureMarkdownFileName,
    isCalendarCustomDatePatternValid,
    isCalendarCustomMonthPatternValid,
    isCalendarCustomQuarterPatternValid,
    isCalendarCustomWeekPatternValid,
    isCalendarCustomYearPatternValid,
    normalizeCalendarCustomFilePattern,
    normalizeCalendarCustomRootFolder,
    normalizeCalendarVaultFolderPath,
    splitCalendarCustomPattern,
    type CalendarCustomWeekRules
} from '../../utils/calendarCustomNotePatterns';
import { resolveCalendarCustomNotePathDate, type CalendarNoteKind } from '../../utils/calendarNotes';
import { getActiveVaultProfile } from '../../utils/vaultProfiles';
import { createSettingGroupFactory } from '../settingGroups';
import { addSettingSyncModeToggle } from '../syncModeToggle';
import { createSubSettingsContainer, setElementVisible } from '../subSettings';
import {
    getMomentApi,
    resolveCalendarLocales,
    resolveCalendarPeriodicNotesLocale,
    resolveDailyNoteLocale,
    type MomentApi
} from '../../utils/moment';
import { runAsyncAction } from '../../utils/async';
import { CalendarTemplateModal } from '../../modals/CalendarTemplateModal';
import { createInlineExternalLinkText } from './externalLink';

const CALENDAR_LOCALE_SYSTEM_DEFAULT = 'system-default';

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

/** Renders the calendar settings tab */
export function renderCalendarTab(context: SettingsTabContext): void {
    const { containerEl, plugin, createDebouncedTextSetting } = context;
    const createGroup = createSettingGroupFactory(containerEl);
    const getActiveProfile = () => getActiveVaultProfile(plugin.settings);

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

    const momentApi = getMomentApi();
    // Offer moment locales as options; the selected locale is used for week rules (start-of-week + week numbering).
    const localeOptions = momentApi ? [...momentApi.locales()].sort((a, b) => a.localeCompare(b)) : [];

    // This is only used to show a hint in the UI for "system default".
    const systemLocale = typeof navigator !== 'undefined' ? (navigator.language ?? '').toLowerCase() : '';
    const currentLocale = momentApi?.locale() || systemLocale;

    const formatLocaleWeekdayExample = (locale: string): string => {
        const currentMomentApi = getMomentApi();
        const sampleDate = currentMomentApi?.('2026-01-19', 'YYYY-MM-DD', true).locale(locale);
        if (!sampleDate?.isValid()) {
            return '';
        }

        const formatted = sampleDate.format('dddd').trim();
        const [first = '', ...rest] = Array.from(formatted);
        return first ? `${first.toLocaleUpperCase()}${rest.join('')}` : '';
    };

    const formatPeriodicNotesLocaleOption = (label: string, locale: string): string => {
        const example = formatLocaleWeekdayExample(locale);
        return example ? `${label} - ${locale} (${example})` : `${label} - ${locale}`;
    };

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

    const appearanceGroup = createGroup(strings.settings.groups.navigation.appearance);

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
            renderCalendarIntegrationVisibility();
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

    const calendarIntegrationGroup = createGroup(strings.settings.groups.navigation.calendarIntegration);

    const calendarIntegrationSetting = calendarIntegrationGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.calendarIntegrationMode.name)
            .setDesc(strings.settings.items.calendarIntegrationMode.desc)
            .addDropdown(dropdown =>
                dropdown
                    .addOption('daily-notes', strings.settings.items.calendarIntegrationMode.options.dailyNotes)
                    .addOption('notebook-navigator', strings.settings.items.calendarIntegrationMode.options.notebookNavigator)
                    .setValue(plugin.settings.calendarIntegrationMode)
                    .onChange(async value => {
                        if (value !== 'daily-notes' && value !== 'notebook-navigator') {
                            return;
                        }
                        plugin.settings.calendarIntegrationMode = value;
                        await plugin.saveSettingsAndUpdate();
                        renderCalendarIntegrationVisibility();
                    })
            );
    });

    const dailyNotesInfoSettingsEl = createSubSettingsContainer(calendarIntegrationSetting);
    const customCalendarSettingsEl = createSubSettingsContainer(calendarIntegrationSetting, '');

    const dailyNotesInfoSetting = new Setting(dailyNotesInfoSettingsEl).setName('').setDesc('');
    dailyNotesInfoSetting.settingEl.addClass('nn-setting-info-container');
    dailyNotesInfoSetting.settingEl.addClass('nn-setting-info-centered');
    dailyNotesInfoSetting.descEl.empty();
    dailyNotesInfoSetting.descEl.createDiv({ text: strings.settings.items.calendarIntegrationMode.info.dailyNotes });

    let calendarPeriodicNotesLocaleDropdown: DropdownComponent | null = null;

    const renderCalendarPeriodicNotesLocaleOptions = (): void => {
        if (!calendarPeriodicNotesLocaleDropdown) {
            return;
        }

        const currentMomentApi = getMomentApi();
        const { calendarRulesLocale } = resolveCalendarLocales(plugin.settings.calendarLocale, currentMomentApi, getCurrentLanguage());
        const obsidianLocale = resolveDailyNoteLocale(currentMomentApi);
        const optionLabels = {
            calendar: formatPeriodicNotesLocaleOption(
                strings.settings.items.calendarPeriodicNotesLocale.options.calendar,
                calendarRulesLocale
            ),
            obsidian: formatPeriodicNotesLocaleOption(strings.settings.items.calendarPeriodicNotesLocale.options.obsidian, obsidianLocale)
        };

        Object.entries(optionLabels).forEach(([value, label]) => {
            const optionEl = calendarPeriodicNotesLocaleDropdown?.selectEl.querySelector<HTMLOptionElement>(`option[value="${value}"]`);
            if (optionEl) {
                optionEl.text = label;
            }
        });
    };

    new Setting(customCalendarSettingsEl)
        .setName(strings.settings.items.calendarPeriodicNotesLocale.name)
        .setDesc(strings.settings.items.calendarPeriodicNotesLocale.desc)
        .addDropdown(dropdown => {
            calendarPeriodicNotesLocaleDropdown = dropdown;
            dropdown
                .addOption('calendar', strings.settings.items.calendarPeriodicNotesLocale.options.calendar)
                .addOption('obsidian', strings.settings.items.calendarPeriodicNotesLocale.options.obsidian)
                .setValue(plugin.settings.calendarPeriodicNotesLocaleSource)
                .onChange(async value => {
                    if (!isCalendarPeriodicNotesLocaleSource(value)) {
                        return;
                    }

                    plugin.settings.calendarPeriodicNotesLocaleSource = value;
                    renderCalendarIntegrationVisibility();
                    await plugin.saveSettingsAndUpdate();
                });
            renderCalendarPeriodicNotesLocaleOptions();
        });

    const calendarCustomRootFolderSetting = createDebouncedTextSetting(
        customCalendarSettingsEl,
        strings.settings.items.calendarCustomRootFolder.name,
        strings.settings.items.calendarCustomRootFolder.desc,
        strings.settings.items.calendarCustomRootFolder.placeholder,
        () => getActiveProfile().periodicNotesFolder,
        value => {
            getActiveProfile().periodicNotesFolder = normalizeCalendarCustomRootFolder(value);
        }
    );
    calendarCustomRootFolderSetting.controlEl.addClass('nn-setting-wide-input');
    const calendarCustomRootFolderInputEl = calendarCustomRootFolderSetting.controlEl.querySelector<HTMLInputElement>('input');

    /** UI elements and state for a calendar pattern setting with template support. */
    interface CalendarCustomPatternSetting {
        setting: Setting;
        descEl: HTMLElement;
        exampleEl: HTMLElement;
        exampleTextEl: HTMLElement;
        templateEl: HTMLElement;
        templateTextEl: HTMLElement;
        templateButton: ExtraButtonComponent | null;
        inputEl: HTMLInputElement | null;
        getTemplatePath: () => string | null;
    }

    /** Creates a calendar pattern setting with template picker button and preview elements. */
    const createCalendarCustomPatternSetting = (params: {
        name: string;
        placeholder: string;
        getValue: () => string;
        setValue: (value: string) => void;
        getTemplatePath: () => string | null;
        setTemplatePath: (value: string | null) => void;
        onAfterUpdate?: () => void;
    }): CalendarCustomPatternSetting => {
        const setting = createDebouncedTextSetting(
            customCalendarSettingsEl,
            params.name,
            '',
            params.placeholder,
            params.getValue,
            params.setValue,
            undefined,
            params.onAfterUpdate
        );
        setting.controlEl.addClass('nn-setting-wide-input');

        const descEl = setting.descEl;
        descEl.empty();

        const exampleEl = descEl.createDiv({ cls: 'nn-setting-calendar-pattern-example nn-setting-hidden' });
        const exampleTextEl = exampleEl.createSpan({ cls: 'nn-setting-calendar-pattern-example-text' });
        const templateEl = descEl.createDiv({ cls: 'nn-setting-calendar-template-file nn-setting-hidden' });
        const templateTextEl = templateEl.createSpan({ cls: 'nn-setting-calendar-pattern-example-text' });
        const inputEl = setting.controlEl.querySelector<HTMLInputElement>('input');

        // Template picker button: clears template if set, otherwise opens template selection modal
        let templateButton: ExtraButtonComponent | null = null;
        setting.addExtraButton(button => {
            templateButton = button;
            button.onClick(() => {
                const templatePath = params.getTemplatePath();
                if (templatePath) {
                    runAsyncAction(async () => {
                        params.setTemplatePath(null);
                        renderCalendarIntegrationVisibility();
                        await plugin.saveSettingsAndUpdate();
                    });
                    return;
                }

                const templateFolder = plugin.settings.calendarTemplateFolder;
                new CalendarTemplateModal(context.app, templateFolder, async file => {
                    params.setTemplatePath(file.path);
                    renderCalendarIntegrationVisibility();
                    await plugin.saveSettingsAndUpdate();
                }).open();
            });
        });

        return {
            setting,
            descEl,
            exampleEl,
            exampleTextEl,
            templateEl,
            templateTextEl,
            templateButton,
            inputEl,
            getTemplatePath: params.getTemplatePath
        };
    };

    const calendarCustomFilePattern = createCalendarCustomPatternSetting({
        name: strings.settings.items.calendarCustomFilePattern.name,
        placeholder: strings.settings.items.calendarCustomFilePattern.placeholder,
        getValue: () => normalizeCalendarCustomFilePattern(plugin.settings.calendarCustomFilePattern),
        setValue: value => {
            plugin.settings.calendarCustomFilePattern = normalizeCalendarCustomFilePattern(value);
        },
        getTemplatePath: () => plugin.settings.calendarCustomFileTemplate,
        setTemplatePath: value => {
            plugin.settings.calendarCustomFileTemplate = value;
        },
        onAfterUpdate: () => renderCalendarIntegrationVisibility()
    });

    const calendarCustomFilePatternErrorEl = calendarCustomFilePattern.descEl.createDiv({
        cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
    });

    const calendarCustomWeekPattern = createCalendarCustomPatternSetting({
        name: strings.settings.items.calendarCustomWeekPattern.name,
        placeholder: DEFAULT_CALENDAR_CUSTOM_WEEK_PATTERN,
        getValue: () => normalizeCalendarCustomFilePattern(plugin.settings.calendarCustomWeekPattern, ''),
        setValue: value => {
            plugin.settings.calendarCustomWeekPattern = normalizeCalendarCustomFilePattern(value, '');
        },
        getTemplatePath: () => plugin.settings.calendarCustomWeekTemplate,
        setTemplatePath: value => {
            plugin.settings.calendarCustomWeekTemplate = value;
        },
        onAfterUpdate: () => renderCalendarCustomPatternPreviews()
    });

    const calendarCustomWeekPatternErrorEl = calendarCustomWeekPattern.descEl.createDiv({
        cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
    });

    const calendarCustomWeekPatternWarningEl = calendarCustomWeekPattern.descEl.createDiv({
        cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
    });

    const calendarCustomMonthPattern = createCalendarCustomPatternSetting({
        name: strings.settings.items.calendarCustomMonthPattern.name,
        placeholder: DEFAULT_CALENDAR_CUSTOM_MONTH_PATTERN,
        getValue: () => normalizeCalendarCustomFilePattern(plugin.settings.calendarCustomMonthPattern, ''),
        setValue: value => {
            plugin.settings.calendarCustomMonthPattern = normalizeCalendarCustomFilePattern(value, '');
        },
        getTemplatePath: () => plugin.settings.calendarCustomMonthTemplate,
        setTemplatePath: value => {
            plugin.settings.calendarCustomMonthTemplate = value;
        },
        onAfterUpdate: () => renderCalendarCustomPatternPreviews()
    });

    const calendarCustomMonthPatternErrorEl = calendarCustomMonthPattern.descEl.createDiv({
        cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
    });

    const calendarCustomQuarterPattern = createCalendarCustomPatternSetting({
        name: strings.settings.items.calendarCustomQuarterPattern.name,
        placeholder: DEFAULT_CALENDAR_CUSTOM_QUARTER_PATTERN,
        getValue: () => normalizeCalendarCustomFilePattern(plugin.settings.calendarCustomQuarterPattern, ''),
        setValue: value => {
            plugin.settings.calendarCustomQuarterPattern = normalizeCalendarCustomFilePattern(value, '');
        },
        getTemplatePath: () => plugin.settings.calendarCustomQuarterTemplate,
        setTemplatePath: value => {
            plugin.settings.calendarCustomQuarterTemplate = value;
        },
        onAfterUpdate: () => renderCalendarCustomPatternPreviews()
    });

    const calendarCustomQuarterPatternErrorEl = calendarCustomQuarterPattern.descEl.createDiv({
        cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
    });

    const calendarCustomYearPattern = createCalendarCustomPatternSetting({
        name: strings.settings.items.calendarCustomYearPattern.name,
        placeholder: DEFAULT_CALENDAR_CUSTOM_YEAR_PATTERN,
        getValue: () => normalizeCalendarCustomFilePattern(plugin.settings.calendarCustomYearPattern, ''),
        setValue: value => {
            plugin.settings.calendarCustomYearPattern = normalizeCalendarCustomFilePattern(value, '');
        },
        getTemplatePath: () => plugin.settings.calendarCustomYearTemplate,
        setTemplatePath: value => {
            plugin.settings.calendarCustomYearTemplate = value;
        },
        onAfterUpdate: () => renderCalendarCustomPatternPreviews()
    });

    const calendarCustomYearPatternErrorEl = calendarCustomYearPattern.descEl.createDiv({
        cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
    });

    const calendarCustomPatternInfoSetting = new Setting(customCalendarSettingsEl).setName('').setDesc('');
    calendarCustomPatternInfoSetting.settingEl.addClass('nn-setting-info-container');
    calendarCustomPatternInfoSetting.settingEl.addClass('nn-setting-info-centered');
    calendarCustomPatternInfoSetting.descEl.empty();
    calendarCustomPatternInfoSetting.descEl.append(
        createInlineExternalLinkText({
            prefix: strings.settings.items.calendarCustomFilePattern.momentDescPrefix,
            link: { text: strings.settings.items.calendarCustomFilePattern.momentLinkText, href: MOMENT_FORMAT_DOCS_URL },
            suffix: strings.settings.items.calendarCustomFilePattern.momentDescSuffix
        })
    );

    // Read current input values while typing; the setting values are updated via debounced callbacks.
    const getInputValue = (element: HTMLInputElement | null, fallback: string): string => element?.value ?? fallback;

    const buildCustomPattern = (value: string, fallback: string): string => {
        const { folderPattern, filePattern } = splitCalendarCustomPattern(value, fallback);
        return folderPattern ? `${folderPattern}/${filePattern}` : filePattern;
    };

    const resolveSelectedCalendarLocales = (
        momentApi: MomentApi
    ): { displayLocale: string; calendarRulesLocale: string; periodicNotesLocale: string } => {
        const locales = resolveCalendarLocales(plugin.settings.calendarLocale, momentApi, getCurrentLanguage());
        return {
            ...locales,
            periodicNotesLocale: resolveCalendarPeriodicNotesLocale(
                plugin.settings.calendarPeriodicNotesLocaleSource,
                locales.calendarRulesLocale,
                momentApi
            )
        };
    };

    const getLocaleWeekRules = (momentApi: MomentApi, locale: string): CalendarCustomWeekRules => {
        const localeData = momentApi().locale(locale).localeData();
        return {
            firstDayOfWeek: localeData.firstDayOfWeek(),
            firstDayOfYear: localeData.firstDayOfYear?.() ?? null
        };
    };

    const templateTargets = [
        calendarCustomFilePattern,
        calendarCustomWeekPattern,
        calendarCustomMonthPattern,
        calendarCustomQuarterPattern,
        calendarCustomYearPattern
    ] as const;

    /** Extracts the filename from a full file path. */
    const getTemplateFileName = (value: string): string => {
        const parts = value.split('/').filter(Boolean);
        return parts.length > 0 ? parts[parts.length - 1] : value;
    };

    /** Updates template button icons and displays template status. */
    const renderCalendarTemplateIndicators = (): void => {
        templateTargets.forEach(target => {
            const templatePath = target.getTemplatePath();
            const hasTemplate = Boolean(templatePath);
            // Icon reflects the button action: add template vs clear template.
            target.templateButton?.setIcon(hasTemplate ? 'file-x' : 'file-plus');
            if (target.templateButton) {
                target.templateButton.extraSettingsEl.style.color = hasTemplate ? 'var(--text-normal)' : 'var(--text-muted)';
            }

            const templateName = templatePath ? getTemplateFileName(templatePath) : '-';
            target.templateTextEl.setText(strings.settings.items.calendarTemplateFile.current.replace('{name}', templateName));
            setElementVisible(target.templateEl, true);
        });
    };

    /** Updates the preview paths shown under the custom calendar pattern settings */
    const renderCalendarCustomPatternPreviews = (): void => {
        const momentApi = getMomentApi();
        const exampleTemplate = strings.settings.items.calendarCustomFilePattern.example;

        const previewTargets = [
            calendarCustomFilePattern,
            calendarCustomWeekPattern,
            calendarCustomMonthPattern,
            calendarCustomQuarterPattern,
            calendarCustomYearPattern
        ] as const;

        const setExampleText = (target: { exampleEl: HTMLElement; exampleTextEl: HTMLElement }, text: string): void => {
            target.exampleTextEl.setText(text);
            setElementVisible(target.exampleEl, text.trim() !== '');
        };

        const clearExamples = (): void => {
            previewTargets.forEach(target => setExampleText(target, ''));
        };

        if (!momentApi) {
            clearExamples();
            return;
        }

        const { periodicNotesLocale } = resolveSelectedCalendarLocales(momentApi);

        const sampleDate = momentApi('2026-01-19', 'YYYY-MM-DD', true);
        if (!sampleDate.isValid()) {
            clearExamples();
            return;
        }

        const formatExample = (kind: CalendarNoteKind, patternRaw: string, fallback: string): string => {
            const normalized = normalizeCalendarCustomFilePattern(patternRaw, fallback);
            if (!normalized) {
                return '';
            }
            const slashIndex = normalized.lastIndexOf('/');
            const folderPattern = slashIndex === -1 ? '' : normalized.slice(0, slashIndex);
            const filePattern = slashIndex === -1 ? normalized : normalized.slice(slashIndex + 1);
            const folderFormatter = createCalendarCustomDateFormatter(folderPattern);
            const fileFormatter = createCalendarCustomDateFormatter(filePattern);

            const momentPattern = folderPattern ? `${folderPattern}/${filePattern}` : filePattern;
            const dateForPath = resolveCalendarCustomNotePathDate(
                kind,
                sampleDate,
                momentPattern,
                periodicNotesLocale,
                periodicNotesLocale
            );
            const folderSuffix = folderFormatter(dateForPath);
            const folderPath = normalizeCalendarVaultFolderPath(folderSuffix || '/');
            const folderPathRelative = folderPath === '/' ? '' : folderPath;

            const formattedFilePattern = fileFormatter(dateForPath).trim();
            const fileName = ensureMarkdownFileName(formattedFilePattern);
            if (!fileName) {
                return '';
            }
            return folderPathRelative ? `${folderPathRelative}/${fileName}` : fileName;
        };

        const dailyPatternRaw = getInputValue(calendarCustomFilePattern.inputEl, plugin.settings.calendarCustomFilePattern);
        const dailyExamplePath = formatExample('day', dailyPatternRaw, DEFAULT_CALENDAR_CUSTOM_FILE_PATTERN);
        setExampleText(calendarCustomFilePattern, dailyExamplePath ? exampleTemplate.replace('{path}', dailyExamplePath) : '');

        const weekPatternRaw = getInputValue(calendarCustomWeekPattern.inputEl, plugin.settings.calendarCustomWeekPattern);
        const weekExamplePath = formatExample('week', weekPatternRaw, '');
        setExampleText(calendarCustomWeekPattern, weekExamplePath ? exampleTemplate.replace('{path}', weekExamplePath) : '');

        const monthPatternRaw = getInputValue(calendarCustomMonthPattern.inputEl, plugin.settings.calendarCustomMonthPattern);
        const monthExamplePath = formatExample('month', monthPatternRaw, '');
        setExampleText(calendarCustomMonthPattern, monthExamplePath ? exampleTemplate.replace('{path}', monthExamplePath) : '');

        const quarterPatternRaw = getInputValue(calendarCustomQuarterPattern.inputEl, plugin.settings.calendarCustomQuarterPattern);
        const quarterExamplePath = formatExample('quarter', quarterPatternRaw, '');
        setExampleText(calendarCustomQuarterPattern, quarterExamplePath ? exampleTemplate.replace('{path}', quarterExamplePath) : '');

        const yearPatternRaw = getInputValue(calendarCustomYearPattern.inputEl, plugin.settings.calendarCustomYearPattern);
        const yearExamplePath = formatExample('year', yearPatternRaw, '');
        setExampleText(calendarCustomYearPattern, yearExamplePath ? exampleTemplate.replace('{path}', yearExamplePath) : '');
    };

    const renderCalendarWeekCompatibilityWarnings = (): void => {
        calendarLocaleWarningEl.setText('');
        calendarCustomWeekPatternWarningEl.setText('');
        setElementVisible(calendarLocaleWarningEl, false);
        setElementVisible(calendarCustomWeekPatternWarningEl, false);

        if (plugin.settings.calendarIntegrationMode !== 'notebook-navigator') {
            return;
        }

        const momentApi = getMomentApi();
        if (!momentApi) {
            return;
        }

        const weekPatternRaw = getInputValue(calendarCustomWeekPattern.inputEl, plugin.settings.calendarCustomWeekPattern);
        if (weekPatternRaw.trim() === '') {
            return;
        }

        const weekCustomPattern = buildCustomPattern(weekPatternRaw, '');
        if (!isCalendarCustomWeekPatternValid(weekCustomPattern, momentApi)) {
            return;
        }

        const { calendarRulesLocale, periodicNotesLocale } = resolveSelectedCalendarLocales(momentApi);
        const showWarning = doesCalendarCustomWeekPatternUseDifferentWeekRules(
            weekCustomPattern,
            getLocaleWeekRules(momentApi, calendarRulesLocale),
            getLocaleWeekRules(momentApi, periodicNotesLocale)
        );
        if (!showWarning) {
            return;
        }

        calendarLocaleWarningEl.setText(strings.settings.items.calendarLocale.weekPathMismatchWarning);
        calendarCustomWeekPatternWarningEl.setText(
            doesCalendarCustomWeekPatternMixWeekTokenTypes(weekCustomPattern)
                ? strings.settings.items.calendarCustomWeekPattern.mixedWeekTokensWarning
                : strings.settings.items.calendarCustomWeekPattern.weekPathMismatchWarning
        );
        setElementVisible(calendarLocaleWarningEl, true);
        setElementVisible(calendarCustomWeekPatternWarningEl, true);
    };

    /** Updates calendar integration sub-setting visibility and validates the custom file pattern */
    const renderCalendarIntegrationVisibility = (): void => {
        const isDailyNotes = plugin.settings.calendarIntegrationMode === 'daily-notes';
        const isCustom = plugin.settings.calendarIntegrationMode === 'notebook-navigator';
        const activeProfile = getActiveProfile();

        if (calendarCustomRootFolderInputEl && activeDocument.activeElement !== calendarCustomRootFolderInputEl) {
            calendarCustomRootFolderInputEl.value = activeProfile.periodicNotesFolder;
        }

        renderCalendarPeriodicNotesLocaleOptions();

        const setAllMessagesHidden = () => {
            setElementVisible(calendarCustomFilePatternErrorEl, false);
            setElementVisible(calendarCustomWeekPatternErrorEl, false);
            setElementVisible(calendarCustomWeekPatternWarningEl, false);
            setElementVisible(calendarCustomMonthPatternErrorEl, false);
            setElementVisible(calendarCustomQuarterPatternErrorEl, false);
            setElementVisible(calendarCustomYearPatternErrorEl, false);
            setElementVisible(calendarLocaleWarningEl, false);
        };

        setElementVisible(dailyNotesInfoSettingsEl, isDailyNotes);
        setElementVisible(customCalendarSettingsEl, isCustom);

        if (!isCustom) {
            setAllMessagesHidden();
            return;
        }

        const momentApi = getMomentApi();

        const dailyPatternRaw = getInputValue(calendarCustomFilePattern.inputEl, plugin.settings.calendarCustomFilePattern);
        const dailyCustomPattern = buildCustomPattern(dailyPatternRaw, DEFAULT_CALENDAR_CUSTOM_FILE_PATTERN);
        const showDailyError = !isCalendarCustomDatePatternValid(dailyCustomPattern, momentApi);
        calendarCustomFilePatternErrorEl.setText(showDailyError ? strings.settings.items.calendarCustomFilePattern.parsingError : '');
        setElementVisible(calendarCustomFilePatternErrorEl, showDailyError);

        const weekPatternRaw = getInputValue(calendarCustomWeekPattern.inputEl, plugin.settings.calendarCustomWeekPattern);
        const weekCustomPattern = buildCustomPattern(weekPatternRaw, '');
        const showWeekError = weekPatternRaw.trim() !== '' && !isCalendarCustomWeekPatternValid(weekCustomPattern, momentApi);
        calendarCustomWeekPatternErrorEl.setText(showWeekError ? strings.settings.items.calendarCustomWeekPattern.parsingError : '');
        setElementVisible(calendarCustomWeekPatternErrorEl, showWeekError);

        const monthPatternRaw = getInputValue(calendarCustomMonthPattern.inputEl, plugin.settings.calendarCustomMonthPattern);
        const monthCustomPattern = buildCustomPattern(monthPatternRaw, '');
        const showMonthError = monthPatternRaw.trim() !== '' && !isCalendarCustomMonthPatternValid(monthCustomPattern, momentApi);
        calendarCustomMonthPatternErrorEl.setText(showMonthError ? strings.settings.items.calendarCustomMonthPattern.parsingError : '');
        setElementVisible(calendarCustomMonthPatternErrorEl, showMonthError);

        const quarterPatternRaw = getInputValue(calendarCustomQuarterPattern.inputEl, plugin.settings.calendarCustomQuarterPattern);
        const quarterCustomPattern = buildCustomPattern(quarterPatternRaw, '');
        const showQuarterError = quarterPatternRaw.trim() !== '' && !isCalendarCustomQuarterPatternValid(quarterCustomPattern, momentApi);
        calendarCustomQuarterPatternErrorEl.setText(
            showQuarterError ? strings.settings.items.calendarCustomQuarterPattern.parsingError : ''
        );
        setElementVisible(calendarCustomQuarterPatternErrorEl, showQuarterError);

        const yearPatternRaw = getInputValue(calendarCustomYearPattern.inputEl, plugin.settings.calendarCustomYearPattern);
        const yearCustomPattern = buildCustomPattern(yearPatternRaw, '');
        const showYearError = yearPatternRaw.trim() !== '' && !isCalendarCustomYearPatternValid(yearCustomPattern, momentApi);
        calendarCustomYearPatternErrorEl.setText(showYearError ? strings.settings.items.calendarCustomYearPattern.parsingError : '');
        setElementVisible(calendarCustomYearPatternErrorEl, showYearError);

        renderCalendarWeekCompatibilityWarnings();
        renderCalendarCustomPatternPreviews();
        renderCalendarTemplateIndicators();
    };

    const previewInputs = [
        calendarCustomFilePattern.inputEl,
        calendarCustomWeekPattern.inputEl,
        calendarCustomMonthPattern.inputEl,
        calendarCustomQuarterPattern.inputEl,
        calendarCustomYearPattern.inputEl
    ];
    previewInputs.forEach(input => {
        input?.addEventListener('input', () => renderCalendarIntegrationVisibility());
    });

    context.registerSettingsUpdateListener('calendar-tab-calendar-integration', () => {
        renderCalendarIntegrationVisibility();
    });

    renderCalendarIntegrationVisibility();
}
