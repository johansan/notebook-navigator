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

import { ExtraButtonComponent, Setting } from 'obsidian';
import type { SettingDefinitionRender } from 'obsidian';
import { MOMENT_FORMAT_DOCS_URL } from '../../constants/urls';
import { strings } from '../../i18n';
import { CalendarTemplateModal } from '../../modals/CalendarTemplateModal';
import { runAsyncAction } from '../../utils/async';
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
import { getMomentApi, type MomentApi } from '../../utils/moment';
import { getTemplaterCreateNoteFromTemplate } from '../../utils/templaterIntegration';
import { setElementVisible } from '../dependentSettings';
import { createRenderDefinition } from '../nativeSettingControls';
import { createInlineExternalLinkText } from './externalLink';
import type { SettingsTabContext } from './SettingsTabContext';

export interface CalendarSelectedLocales {
    calendarRulesLocale: string;
    periodicNotesLocale: string;
}

interface CalendarCustomPatternRenderersOptions {
    context: SettingsTabContext;
    getCalendarLocaleWarningEl: () => HTMLElement | null;
    getActiveProfile: () => { periodicNotesFolder: string };
    resolveSelectedCalendarLocales: (momentApi: MomentApi | null) => CalendarSelectedLocales;
    requestVisibilityRefresh: () => void;
}

interface CalendarCustomPatternSectionOptions extends CalendarCustomPatternRenderersOptions {
    containerEl: HTMLElement;
}

export interface CalendarCustomPatternSectionController {
    refresh: () => void;
    hideMessages: () => void;
}

export interface CalendarCustomPatternRenderers extends CalendarCustomPatternSectionController {
    renderRootFolderSetting(setting: Setting): void | (() => void);
    renderDailyPatternSetting(setting: Setting): void | (() => void);
    renderWeeklyPatternSetting(setting: Setting): void | (() => void);
    renderMonthlyPatternSetting(setting: Setting): void | (() => void);
    renderQuarterlyPatternSetting(setting: Setting): void | (() => void);
    renderYearlyPatternSetting(setting: Setting): void | (() => void);
    renderPatternInfoSetting(setting: Setting): void;
}

interface CalendarCustomPatternSetting {
    descEl: HTMLElement;
    exampleEl: HTMLElement;
    exampleTextEl: HTMLElement;
    templateEl: HTMLElement;
    templateTextEl: HTMLElement;
    templateButton: ExtraButtonComponent | null;
    inputEl: HTMLInputElement | null;
    getTemplatePath: () => string | null;
    dispose: () => void;
}

function getInputValue(element: HTMLInputElement | null, fallback: string): string {
    return element?.value ?? fallback;
}

function buildCustomPattern(value: string, fallback: string): string {
    const { folderPattern, filePattern } = splitCalendarCustomPattern(value, fallback);
    return folderPattern ? `${folderPattern}/${filePattern}` : filePattern;
}

function getLocaleWeekRules(momentApi: MomentApi, locale: string): CalendarCustomWeekRules {
    const localeData = momentApi().locale(locale).localeData();
    return {
        firstDayOfWeek: localeData.firstDayOfWeek(),
        firstDayOfYear: localeData.firstDayOfYear?.() ?? null
    };
}

function getTemplateFileName(value: string): string {
    const parts = value.split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : value;
}

function setExampleText(target: { exampleEl: HTMLElement; exampleTextEl: HTMLElement }, text: string): void {
    target.exampleTextEl.setText(text);
    setElementVisible(target.exampleEl, text.trim() !== '');
}

function setElementVisibleIfPresent(element: HTMLElement | null, visible: boolean): void {
    if (element) {
        setElementVisible(element, visible);
    }
}

function setElementTextIfPresent(element: HTMLElement | null, text: string): void {
    if (element) {
        element.setText(text);
    }
}

function isPatternTarget(target: CalendarCustomPatternSetting | null): target is CalendarCustomPatternSetting {
    return target !== null;
}

export function createCalendarCustomPatternSettingDefinitions(
    renderers: CalendarCustomPatternRenderers,
    visible: () => boolean
): SettingDefinitionRender[] {
    const templateAlias = strings.settings.items.periodicNoteTemplateFile.current.replace('{name}', '').trim();

    return [
        createRenderDefinition({
            name: strings.settings.items.periodicNotesRootFolder.name,
            desc: strings.settings.items.periodicNotesRootFolder.desc,
            aliases: [strings.settings.items.periodicNotesRootFolder.placeholder],
            visible,
            render: setting => renderers.renderRootFolderSetting(setting)
        }),
        createRenderDefinition({
            name: strings.settings.items.calendarDailyNotePattern.name,
            desc: strings.settings.items.calendarDailyNotePattern.desc,
            aliases: [
                strings.settings.items.calendarDailyNotePattern.placeholder,
                strings.settings.items.calendarPeriodicNotePatterns.momentLinkText,
                templateAlias
            ],
            visible,
            render: setting => renderers.renderDailyPatternSetting(setting)
        }),
        createRenderDefinition({
            name: strings.settings.items.calendarWeeklyNotePattern.name,
            aliases: [DEFAULT_CALENDAR_CUSTOM_WEEK_PATTERN, templateAlias],
            visible,
            render: setting => renderers.renderWeeklyPatternSetting(setting)
        }),
        createRenderDefinition({
            name: strings.settings.items.calendarMonthlyNotePattern.name,
            aliases: [DEFAULT_CALENDAR_CUSTOM_MONTH_PATTERN, templateAlias],
            visible,
            render: setting => renderers.renderMonthlyPatternSetting(setting)
        }),
        createRenderDefinition({
            name: strings.settings.items.calendarQuarterlyNotePattern.name,
            aliases: [DEFAULT_CALENDAR_CUSTOM_QUARTER_PATTERN, templateAlias],
            visible,
            render: setting => renderers.renderQuarterlyPatternSetting(setting)
        }),
        createRenderDefinition({
            name: strings.settings.items.calendarYearlyNotePattern.name,
            aliases: [DEFAULT_CALENDAR_CUSTOM_YEAR_PATTERN, templateAlias],
            visible,
            render: setting => renderers.renderYearlyPatternSetting(setting)
        }),
        createRenderDefinition({
            name: strings.settings.items.calendarPeriodicNotePatterns.momentLinkText,
            searchable: false,
            visible,
            render: setting => renderers.renderPatternInfoSetting(setting)
        })
    ];
}

export function createCalendarCustomPatternRenderers(options: CalendarCustomPatternRenderersOptions): CalendarCustomPatternRenderers {
    const { context, getCalendarLocaleWarningEl, getActiveProfile, resolveSelectedCalendarLocales, requestVisibilityRefresh } = options;
    const { plugin, configureDebouncedTextSetting } = context;

    let calendarCustomRootFolderInputEl: HTMLInputElement | null = null;
    let calendarCustomFilePattern: CalendarCustomPatternSetting | null = null;
    let calendarCustomWeekPattern: CalendarCustomPatternSetting | null = null;
    let calendarCustomMonthPattern: CalendarCustomPatternSetting | null = null;
    let calendarCustomQuarterPattern: CalendarCustomPatternSetting | null = null;
    let calendarCustomYearPattern: CalendarCustomPatternSetting | null = null;
    let calendarCustomFilePatternErrorEl: HTMLElement | null = null;
    let calendarCustomWeekPatternErrorEl: HTMLElement | null = null;
    let calendarCustomWeekPatternWarningEl: HTMLElement | null = null;
    let calendarCustomMonthPatternErrorEl: HTMLElement | null = null;
    let calendarCustomQuarterPatternErrorEl: HTMLElement | null = null;
    let calendarCustomYearPatternErrorEl: HTMLElement | null = null;

    const getPatternTargets = (): CalendarCustomPatternSetting[] =>
        [
            calendarCustomFilePattern,
            calendarCustomWeekPattern,
            calendarCustomMonthPattern,
            calendarCustomQuarterPattern,
            calendarCustomYearPattern
        ].filter(isPatternTarget);

    const renderRootFolderSetting = (setting: Setting): (() => void) => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.periodicNotesRootFolder.name,
            strings.settings.items.periodicNotesRootFolder.desc,
            strings.settings.items.periodicNotesRootFolder.placeholder,
            () => getActiveProfile().periodicNotesFolder,
            value => {
                getActiveProfile().periodicNotesFolder = normalizeCalendarCustomRootFolder(value);
            }
        );
        setting.controlEl.addClass('nn-setting-wide-input');
        const inputEl = setting.controlEl.querySelector<HTMLInputElement>('input');
        calendarCustomRootFolderInputEl = inputEl;

        return () => {
            if (calendarCustomRootFolderInputEl === inputEl) {
                calendarCustomRootFolderInputEl = null;
            }
        };
    };

    const createCalendarCustomPatternSetting = (
        setting: Setting,
        params: {
            name: string;
            placeholder: string;
            getValue: () => string;
            setValue: (value: string) => void;
            getTemplatePath: () => string | null;
            setTemplatePath: (value: string | null) => void;
            onAfterUpdate?: () => void;
        }
    ): CalendarCustomPatternSetting => {
        configureDebouncedTextSetting(
            setting,
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

        let templateButton: ExtraButtonComponent | null = null;
        setting.addExtraButton(button => {
            templateButton = button;
            button.onClick(() => {
                const templatePath = params.getTemplatePath();
                if (templatePath) {
                    runAsyncAction(async () => {
                        params.setTemplatePath(null);
                        requestVisibilityRefresh();
                        await plugin.saveSettingsAndUpdate();
                    });
                    return;
                }

                const templateFolder = plugin.settings.calendarTemplateFolder;
                new CalendarTemplateModal(context.app, templateFolder, async file => {
                    params.setTemplatePath(file.path);
                    requestVisibilityRefresh();
                    await plugin.saveSettingsAndUpdate();
                }).open();
            });
        });
        const handleInput = (): void => requestVisibilityRefresh();
        inputEl?.addEventListener('input', handleInput);

        return {
            descEl,
            exampleEl,
            exampleTextEl,
            templateEl,
            templateTextEl,
            templateButton,
            inputEl,
            getTemplatePath: params.getTemplatePath,
            dispose: () => inputEl?.removeEventListener('input', handleInput)
        };
    };

    const renderDailyPatternSetting = (setting: Setting): (() => void) => {
        const target = createCalendarCustomPatternSetting(setting, {
            name: strings.settings.items.calendarDailyNotePattern.name,
            placeholder: strings.settings.items.calendarDailyNotePattern.placeholder,
            getValue: () => normalizeCalendarCustomFilePattern(plugin.settings.calendarCustomFilePattern),
            setValue: value => {
                plugin.settings.calendarCustomFilePattern = normalizeCalendarCustomFilePattern(value);
            },
            getTemplatePath: () => plugin.settings.calendarCustomFileTemplate,
            setTemplatePath: value => {
                plugin.settings.calendarCustomFileTemplate = value;
            },
            onAfterUpdate: () => requestVisibilityRefresh()
        });
        calendarCustomFilePattern = target;
        calendarCustomFilePatternErrorEl = calendarCustomFilePattern.descEl.createDiv({
            cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
        });
        requestVisibilityRefresh();

        return () => {
            target.dispose();
            if (calendarCustomFilePattern === target) {
                calendarCustomFilePattern = null;
                calendarCustomFilePatternErrorEl = null;
            }
        };
    };

    const renderWeeklyPatternSetting = (setting: Setting): (() => void) => {
        const target = createCalendarCustomPatternSetting(setting, {
            name: strings.settings.items.calendarWeeklyNotePattern.name,
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
        calendarCustomWeekPattern = target;
        calendarCustomWeekPatternErrorEl = calendarCustomWeekPattern.descEl.createDiv({
            cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
        });
        calendarCustomWeekPatternWarningEl = calendarCustomWeekPattern.descEl.createDiv({
            cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
        });
        requestVisibilityRefresh();

        return () => {
            target.dispose();
            if (calendarCustomWeekPattern === target) {
                calendarCustomWeekPattern = null;
                calendarCustomWeekPatternErrorEl = null;
                calendarCustomWeekPatternWarningEl = null;
            }
        };
    };

    const renderMonthlyPatternSetting = (setting: Setting): (() => void) => {
        const target = createCalendarCustomPatternSetting(setting, {
            name: strings.settings.items.calendarMonthlyNotePattern.name,
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
        calendarCustomMonthPattern = target;
        calendarCustomMonthPatternErrorEl = calendarCustomMonthPattern.descEl.createDiv({
            cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
        });
        requestVisibilityRefresh();

        return () => {
            target.dispose();
            if (calendarCustomMonthPattern === target) {
                calendarCustomMonthPattern = null;
                calendarCustomMonthPatternErrorEl = null;
            }
        };
    };

    const renderQuarterlyPatternSetting = (setting: Setting): (() => void) => {
        const target = createCalendarCustomPatternSetting(setting, {
            name: strings.settings.items.calendarQuarterlyNotePattern.name,
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
        calendarCustomQuarterPattern = target;
        calendarCustomQuarterPatternErrorEl = calendarCustomQuarterPattern.descEl.createDiv({
            cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
        });
        requestVisibilityRefresh();

        return () => {
            target.dispose();
            if (calendarCustomQuarterPattern === target) {
                calendarCustomQuarterPattern = null;
                calendarCustomQuarterPatternErrorEl = null;
            }
        };
    };

    const renderYearlyPatternSetting = (setting: Setting): (() => void) => {
        const target = createCalendarCustomPatternSetting(setting, {
            name: strings.settings.items.calendarYearlyNotePattern.name,
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
        calendarCustomYearPattern = target;
        calendarCustomYearPatternErrorEl = calendarCustomYearPattern.descEl.createDiv({
            cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
        });
        requestVisibilityRefresh();

        return () => {
            target.dispose();
            if (calendarCustomYearPattern === target) {
                calendarCustomYearPattern = null;
                calendarCustomYearPatternErrorEl = null;
            }
        };
    };

    const renderPatternInfoSetting = (setting: Setting): void => {
        setting.setName('').setDesc('');
        setting.settingEl.addClass('nn-setting-info-container');
        setting.descEl.empty();
        const description = createInlineExternalLinkText({
            prefix: strings.settings.items.calendarPeriodicNotePatterns.momentDescPrefix,
            link: { text: strings.settings.items.calendarPeriodicNotePatterns.momentLinkText, href: MOMENT_FORMAT_DOCS_URL },
            suffix: strings.settings.items.calendarPeriodicNotePatterns.momentDescSuffix
        });
        const templaterSupportText = getTemplaterCreateNoteFromTemplate(context.app)
            ? strings.settings.items.templaterSupport.installed
            : strings.settings.items.templaterSupport.missing;
        // Built-in formats such as {{date}} are only applied when daily notes come from the Daily Notes core plugin,
        // so this section leaves them literally. The setting name and option label are substituted from the dropdown
        // strings so the notice keeps matching the control it refers to in every locale.
        const tokenNoticeText = strings.settings.items.calendarPeriodicNotePatterns.templateTokenNotice
            .replace('{source}', strings.settings.items.dailyNoteSource.name)
            .replace('{option}', strings.settings.items.dailyNoteSource.options.dailyNotes);
        description.append(
            createEl('br'),
            createEl('br'),
            createEl('strong', { text: templaterSupportText }),
            createEl('br'),
            createEl('br'),
            createEl('strong', { text: strings.settings.items.calendarPeriodicNotePatterns.templateTokenNoticeLabel }),
            ` ${tokenNoticeText}`
        );
        setting.descEl.append(description);
    };

    const renderCalendarTemplateIndicators = (): void => {
        getPatternTargets().forEach(target => {
            const templatePath = target.getTemplatePath();
            const hasTemplate = Boolean(templatePath);
            target.templateButton?.setIcon(hasTemplate ? 'file-x' : 'file-plus');
            if (target.templateButton) {
                target.templateButton.extraSettingsEl.style.color = hasTemplate ? 'var(--text-normal)' : 'var(--text-muted)';
            }

            const templateName = templatePath ? getTemplateFileName(templatePath) : '-';
            target.templateTextEl.setText(strings.settings.items.periodicNoteTemplateFile.current.replace('{name}', templateName));
            setElementVisible(target.templateEl, true);
        });
    };

    const renderCalendarCustomPatternPreviews = (): void => {
        const momentApi = getMomentApi();
        const exampleTemplate = strings.settings.items.calendarPeriodicNotePatterns.example;

        const clearExamples = (): void => {
            getPatternTargets().forEach(target => setExampleText(target, ''));
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

        if (isPatternTarget(calendarCustomFilePattern)) {
            const dailyPatternRaw = getInputValue(calendarCustomFilePattern.inputEl, plugin.settings.calendarCustomFilePattern);
            const dailyExamplePath = formatExample('day', dailyPatternRaw, DEFAULT_CALENDAR_CUSTOM_FILE_PATTERN);
            setExampleText(calendarCustomFilePattern, dailyExamplePath ? exampleTemplate.replace('{path}', dailyExamplePath) : '');
        }

        if (isPatternTarget(calendarCustomWeekPattern)) {
            const weekPatternRaw = getInputValue(calendarCustomWeekPattern.inputEl, plugin.settings.calendarCustomWeekPattern);
            const weekExamplePath = formatExample('week', weekPatternRaw, '');
            setExampleText(calendarCustomWeekPattern, weekExamplePath ? exampleTemplate.replace('{path}', weekExamplePath) : '');
        }

        if (isPatternTarget(calendarCustomMonthPattern)) {
            const monthPatternRaw = getInputValue(calendarCustomMonthPattern.inputEl, plugin.settings.calendarCustomMonthPattern);
            const monthExamplePath = formatExample('month', monthPatternRaw, '');
            setExampleText(calendarCustomMonthPattern, monthExamplePath ? exampleTemplate.replace('{path}', monthExamplePath) : '');
        }

        if (isPatternTarget(calendarCustomQuarterPattern)) {
            const quarterPatternRaw = getInputValue(calendarCustomQuarterPattern.inputEl, plugin.settings.calendarCustomQuarterPattern);
            const quarterExamplePath = formatExample('quarter', quarterPatternRaw, '');
            setExampleText(calendarCustomQuarterPattern, quarterExamplePath ? exampleTemplate.replace('{path}', quarterExamplePath) : '');
        }

        if (isPatternTarget(calendarCustomYearPattern)) {
            const yearPatternRaw = getInputValue(calendarCustomYearPattern.inputEl, plugin.settings.calendarCustomYearPattern);
            const yearExamplePath = formatExample('year', yearPatternRaw, '');
            setExampleText(calendarCustomYearPattern, yearExamplePath ? exampleTemplate.replace('{path}', yearExamplePath) : '');
        }
    };

    const renderCalendarWeekCompatibilityWarnings = (): void => {
        const calendarLocaleWarningEl = getCalendarLocaleWarningEl();
        setElementTextIfPresent(calendarLocaleWarningEl, '');
        setElementTextIfPresent(calendarCustomWeekPatternWarningEl, '');
        setElementVisibleIfPresent(calendarLocaleWarningEl, false);
        setElementVisibleIfPresent(calendarCustomWeekPatternWarningEl, false);

        if (plugin.settings.calendarIntegrationMode !== 'notebook-navigator' || !isPatternTarget(calendarCustomWeekPattern)) {
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

        setElementTextIfPresent(calendarLocaleWarningEl, strings.settings.items.calendarLocale.weekPathMismatchWarning);
        setElementTextIfPresent(
            calendarCustomWeekPatternWarningEl,
            doesCalendarCustomWeekPatternMixWeekTokenTypes(weekCustomPattern)
                ? strings.settings.items.calendarWeeklyNotePattern.mixedWeekTokensWarning
                : strings.settings.items.calendarWeeklyNotePattern.weekPathMismatchWarning
        );
        setElementVisibleIfPresent(calendarLocaleWarningEl, true);
        setElementVisibleIfPresent(calendarCustomWeekPatternWarningEl, true);
    };

    const hideMessages = (): void => {
        setElementVisibleIfPresent(calendarCustomFilePatternErrorEl, false);
        setElementVisibleIfPresent(calendarCustomWeekPatternErrorEl, false);
        setElementVisibleIfPresent(calendarCustomWeekPatternWarningEl, false);
        setElementVisibleIfPresent(calendarCustomMonthPatternErrorEl, false);
        setElementVisibleIfPresent(calendarCustomQuarterPatternErrorEl, false);
        setElementVisibleIfPresent(calendarCustomYearPatternErrorEl, false);
        setElementVisibleIfPresent(getCalendarLocaleWarningEl(), false);
    };

    const refresh = (): void => {
        const activeProfile = getActiveProfile();
        const activeElement = typeof activeDocument !== 'undefined' ? activeDocument.activeElement : null;
        if (calendarCustomRootFolderInputEl && activeElement !== calendarCustomRootFolderInputEl) {
            calendarCustomRootFolderInputEl.value = activeProfile.periodicNotesFolder;
        }

        const momentApi = getMomentApi();

        if (isPatternTarget(calendarCustomFilePattern)) {
            const dailyPatternRaw = getInputValue(calendarCustomFilePattern.inputEl, plugin.settings.calendarCustomFilePattern);
            const dailyCustomPattern = buildCustomPattern(dailyPatternRaw, DEFAULT_CALENDAR_CUSTOM_FILE_PATTERN);
            const showDailyError = !isCalendarCustomDatePatternValid(dailyCustomPattern, momentApi);
            setElementTextIfPresent(
                calendarCustomFilePatternErrorEl,
                showDailyError ? strings.settings.items.calendarDailyNotePattern.parsingError : ''
            );
            setElementVisibleIfPresent(calendarCustomFilePatternErrorEl, showDailyError);
        }

        if (isPatternTarget(calendarCustomWeekPattern)) {
            const weekPatternRaw = getInputValue(calendarCustomWeekPattern.inputEl, plugin.settings.calendarCustomWeekPattern);
            const weekCustomPattern = buildCustomPattern(weekPatternRaw, '');
            const showWeekError = weekPatternRaw.trim() !== '' && !isCalendarCustomWeekPatternValid(weekCustomPattern, momentApi);
            setElementTextIfPresent(
                calendarCustomWeekPatternErrorEl,
                showWeekError ? strings.settings.items.calendarWeeklyNotePattern.parsingError : ''
            );
            setElementVisibleIfPresent(calendarCustomWeekPatternErrorEl, showWeekError);
        }

        if (isPatternTarget(calendarCustomMonthPattern)) {
            const monthPatternRaw = getInputValue(calendarCustomMonthPattern.inputEl, plugin.settings.calendarCustomMonthPattern);
            const monthCustomPattern = buildCustomPattern(monthPatternRaw, '');
            const showMonthError = monthPatternRaw.trim() !== '' && !isCalendarCustomMonthPatternValid(monthCustomPattern, momentApi);
            setElementTextIfPresent(
                calendarCustomMonthPatternErrorEl,
                showMonthError ? strings.settings.items.calendarMonthlyNotePattern.parsingError : ''
            );
            setElementVisibleIfPresent(calendarCustomMonthPatternErrorEl, showMonthError);
        }

        if (isPatternTarget(calendarCustomQuarterPattern)) {
            const quarterPatternRaw = getInputValue(calendarCustomQuarterPattern.inputEl, plugin.settings.calendarCustomQuarterPattern);
            const quarterCustomPattern = buildCustomPattern(quarterPatternRaw, '');
            const showQuarterError =
                quarterPatternRaw.trim() !== '' && !isCalendarCustomQuarterPatternValid(quarterCustomPattern, momentApi);
            setElementTextIfPresent(
                calendarCustomQuarterPatternErrorEl,
                showQuarterError ? strings.settings.items.calendarQuarterlyNotePattern.parsingError : ''
            );
            setElementVisibleIfPresent(calendarCustomQuarterPatternErrorEl, showQuarterError);
        }

        if (isPatternTarget(calendarCustomYearPattern)) {
            const yearPatternRaw = getInputValue(calendarCustomYearPattern.inputEl, plugin.settings.calendarCustomYearPattern);
            const yearCustomPattern = buildCustomPattern(yearPatternRaw, '');
            const showYearError = yearPatternRaw.trim() !== '' && !isCalendarCustomYearPatternValid(yearCustomPattern, momentApi);
            setElementTextIfPresent(
                calendarCustomYearPatternErrorEl,
                showYearError ? strings.settings.items.calendarYearlyNotePattern.parsingError : ''
            );
            setElementVisibleIfPresent(calendarCustomYearPatternErrorEl, showYearError);
        }

        renderCalendarWeekCompatibilityWarnings();
        renderCalendarCustomPatternPreviews();
        renderCalendarTemplateIndicators();
    };

    return {
        renderRootFolderSetting,
        renderDailyPatternSetting,
        renderWeeklyPatternSetting,
        renderMonthlyPatternSetting,
        renderQuarterlyPatternSetting,
        renderYearlyPatternSetting,
        renderPatternInfoSetting,
        refresh,
        hideMessages
    };
}

export function renderCalendarCustomPatternSection(options: CalendarCustomPatternSectionOptions): CalendarCustomPatternSectionController {
    const renderers = createCalendarCustomPatternRenderers(options);
    const { containerEl } = options;

    renderers.renderRootFolderSetting(new Setting(containerEl));
    renderers.renderDailyPatternSetting(new Setting(containerEl));
    renderers.renderWeeklyPatternSetting(new Setting(containerEl));
    renderers.renderMonthlyPatternSetting(new Setting(containerEl));
    renderers.renderQuarterlyPatternSetting(new Setting(containerEl));
    renderers.renderYearlyPatternSetting(new Setting(containerEl));
    renderers.renderPatternInfoSetting(new Setting(containerEl));

    return renderers;
}
