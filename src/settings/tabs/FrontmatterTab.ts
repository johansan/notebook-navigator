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

import { App, ButtonComponent, Setting, TAbstractFile, TFile } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import { strings } from '../../i18n';
import { MOMENT_FORMAT_DOCS_URL } from '../../constants/urls';
import { showNotice } from '../../utils/noticeUtils';
import { ISO_DATE_FORMAT } from '../../utils/dateUtils';
import { TIMEOUTS } from '../../types/obsidian-extended';
import type { SettingsTabContext } from './SettingsTabContext';
import { runAsyncAction } from '../../utils/async';
import { setElementVisible } from '../dependentSettings';
import { normalizeCommaSeparatedList } from '../../utils/commaSeparatedListUtils';
import { createSettingDescriptionWithExternalLink } from './externalLink';
import { createGroupDefinition, createRenderDefinition } from '../nativeSettingControls';

/**
 * Type guard to check if a file is a markdown file
 * @param file - The file to check
 * @returns True if the file is a markdown file
 */
function isMarkdownFile(file: TAbstractFile | null): file is TFile {
    return file instanceof TFile && file.extension === 'md';
}

/**
 * Counts the number of markdown files with metadata entries
 * @param records - Record of file paths to metadata values
 * @param app - The Obsidian app instance
 * @returns The number of markdown files with metadata entries
 */
function countMarkdownMetadataEntries(records: Record<string, string> | undefined, app: App): number {
    if (!records) {
        return 0;
    }

    let count = 0;
    for (const path of Object.keys(records)) {
        const file = app.vault.getAbstractFileByPath(path);
        if (isMarkdownFile(file)) {
            count += 1;
        }
    }
    return count;
}

/** Builds native 1.13 setting definitions for frontmatter settings. */
export function createFrontmatterSettingDefinitions(context: SettingsTabContext): SettingDefinitionItem[] {
    const { app, plugin } = context;
    let migrateButton: ButtonComponent | null = null;
    let migrationSetting: Setting | null = null;
    let updateMigrationDescription: (() => void) | null = null;

    const refreshMetadataSettings = () => {
        updateMigrationDescription?.();
        context.requestStatisticsRefresh();
    };

    updateMigrationDescription = () => {
        if (!migrationSetting) {
            return;
        }

        const descriptionEl = migrationSetting.descEl;
        descriptionEl.empty();

        const iconsBefore = countMarkdownMetadataEntries(plugin.settings.fileIcons, app);
        const colorsBefore =
            countMarkdownMetadataEntries(plugin.settings.fileColors, app) +
            countMarkdownMetadataEntries(plugin.settings.fileBackgroundColors, app);
        const noMigrationsPending = iconsBefore === 0 && colorsBefore === 0;
        const hasIconField = plugin.settings.frontmatterIconField.trim().length > 0;
        const hasColorField = plugin.settings.frontmatterColorField.trim().length > 0;
        const hasBackgroundField = plugin.settings.frontmatterBackgroundField.trim().length > 0;
        const canMigrateMetadata = hasIconField || hasColorField || hasBackgroundField;
        const isFrontmatterMetadataEnabled = plugin.settings.useFrontmatterMetadata;

        const descriptionText = strings.settings.items.migrateIconsAndColorsFromSettings.desc
            .replace('{icons}', iconsBefore.toString())
            .replace('{colors}', colorsBefore.toString());

        descriptionEl.createDiv({ text: descriptionText });
        const shouldShow = !noMigrationsPending && canMigrateMetadata && isFrontmatterMetadataEnabled;
        migrateButton?.setDisabled(!isFrontmatterMetadataEnabled || !canMigrateMetadata || noMigrationsPending);
        setElementVisible(migrationSetting.settingEl, shouldShow);
    };

    return [
        createGroupDefinition(undefined, [
            createRenderDefinition({
                name: strings.settings.items.useFrontmatterMetadata.name,
                desc: strings.settings.items.useFrontmatterMetadata.desc,
                render: setting => {
                    setting
                        .setName(strings.settings.items.useFrontmatterMetadata.name)
                        .setDesc(strings.settings.items.useFrontmatterMetadata.desc)
                        .addToggle(toggle =>
                            toggle.setValue(plugin.settings.useFrontmatterMetadata).onChange(async value => {
                                plugin.settings.useFrontmatterMetadata = value;
                                context.refreshSettingsDomState();
                                await plugin.saveSettingsAndUpdate();
                                refreshMetadataSettings();
                            })
                        );
                }
            }),
            createFrontmatterTextRenderDefinition({
                context,
                name: strings.settings.items.frontmatterIconField.name,
                desc: strings.settings.items.frontmatterIconField.desc,
                placeholder: strings.settings.items.frontmatterIconField.placeholder,
                visible: () => plugin.settings.useFrontmatterMetadata,
                getValue: () => plugin.settings.frontmatterIconField,
                setValue: value => {
                    plugin.settings.frontmatterIconField = value || '';
                },
                onAfterUpdate: refreshMetadataSettings
            }),
            createFrontmatterTextRenderDefinition({
                context,
                name: strings.settings.items.frontmatterColorField.name,
                desc: strings.settings.items.frontmatterColorField.desc,
                placeholder: strings.settings.items.frontmatterColorField.placeholder,
                visible: () => plugin.settings.useFrontmatterMetadata,
                getValue: () => plugin.settings.frontmatterColorField,
                setValue: value => {
                    plugin.settings.frontmatterColorField = value || '';
                },
                onAfterUpdate: refreshMetadataSettings
            }),
            createFrontmatterTextRenderDefinition({
                context,
                name: strings.settings.items.frontmatterBackgroundField.name,
                desc: strings.settings.items.frontmatterBackgroundField.desc,
                placeholder: strings.settings.items.frontmatterBackgroundField.placeholder,
                visible: () => plugin.settings.useFrontmatterMetadata,
                getValue: () => plugin.settings.frontmatterBackgroundField,
                setValue: value => {
                    plugin.settings.frontmatterBackgroundField = value || '';
                },
                onAfterUpdate: refreshMetadataSettings
            }),
            createRenderDefinition({
                name: strings.settings.items.migrateIconsAndColorsFromSettings.name,
                aliases: [strings.settings.items.migrateIconsAndColorsFromSettings.button],
                visible: () => plugin.settings.useFrontmatterMetadata,
                render: setting => {
                    migrationSetting = setting.setName(strings.settings.items.migrateIconsAndColorsFromSettings.name);
                    setting.addButton(button => {
                        migrateButton = button;
                        button.setButtonText(strings.settings.items.migrateIconsAndColorsFromSettings.button);
                        button.setCta();
                        button.onClick(() => {
                            runAsyncAction(async () => {
                                if (!plugin.metadataService) {
                                    return;
                                }

                                button.setDisabled(true);
                                button.setButtonText(strings.settings.items.migrateIconsAndColorsFromSettings.buttonWorking);

                                try {
                                    const result = await plugin.metadataService.migrateFileMetadataToFrontmatter();
                                    updateMigrationDescription?.();

                                    const { iconsBefore, colorsBefore, migratedIcons, migratedColors, failures } = result;

                                    if (iconsBefore === 0 && colorsBefore === 0) {
                                        showNotice(strings.settings.items.migrateIconsAndColorsFromSettings.noticeNone);
                                    } else if (migratedIcons === 0 && migratedColors === 0) {
                                        showNotice(strings.settings.items.migrateIconsAndColorsFromSettings.noticeNone);
                                    } else {
                                        let message = strings.settings.items.migrateIconsAndColorsFromSettings.noticeDone
                                            .replace('{migratedIcons}', migratedIcons.toString())
                                            .replace('{icons}', iconsBefore.toString())
                                            .replace('{migratedColors}', migratedColors.toString())
                                            .replace('{colors}', colorsBefore.toString());
                                        if (failures > 0) {
                                            message += ` ${strings.settings.items.migrateIconsAndColorsFromSettings.noticeFailures.replace('{failures}', failures.toString())}`;
                                        }
                                        showNotice(message, { variant: 'success' });
                                    }
                                } catch (error) {
                                    console.error('Failed to migrate icon/color metadata to frontmatter', error);
                                    showNotice(strings.settings.items.migrateIconsAndColorsFromSettings.noticeError, {
                                        timeout: TIMEOUTS.NOTICE_ERROR,
                                        variant: 'warning'
                                    });
                                } finally {
                                    button.setButtonText(strings.settings.items.migrateIconsAndColorsFromSettings.button);
                                    button.setDisabled(false);
                                    refreshMetadataSettings();
                                }
                            });
                        });
                    });
                    updateMigrationDescription?.();
                }
            }),
            createFrontmatterTextRenderDefinition({
                context,
                name: strings.settings.items.frontmatterNameFields.name,
                desc: strings.settings.items.frontmatterNameFields.desc,
                placeholder: strings.settings.items.frontmatterNameFields.placeholder,
                visible: () => plugin.settings.useFrontmatterMetadata,
                getValue: () => normalizeCommaSeparatedList(plugin.settings.frontmatterNameField),
                setValue: value => {
                    plugin.settings.frontmatterNameField = normalizeCommaSeparatedList(value);
                },
                onAfterUpdate: () => context.requestStatisticsRefresh()
            }),
            createFrontmatterTextRenderDefinition({
                context,
                name: strings.settings.items.frontmatterCreatedField.name,
                desc: strings.settings.items.frontmatterCreatedField.desc,
                placeholder: strings.settings.items.frontmatterCreatedField.placeholder,
                visible: () => plugin.settings.useFrontmatterMetadata,
                getValue: () => plugin.settings.frontmatterCreatedField,
                setValue: value => {
                    plugin.settings.frontmatterCreatedField = value;
                },
                onAfterUpdate: () => context.requestStatisticsRefresh()
            }),
            createFrontmatterTextRenderDefinition({
                context,
                name: strings.settings.items.frontmatterModifiedField.name,
                desc: strings.settings.items.frontmatterModifiedField.desc,
                placeholder: strings.settings.items.frontmatterModifiedField.placeholder,
                visible: () => plugin.settings.useFrontmatterMetadata,
                getValue: () => plugin.settings.frontmatterModifiedField,
                setValue: value => {
                    plugin.settings.frontmatterModifiedField = value;
                },
                onAfterUpdate: () => context.requestStatisticsRefresh()
            }),
            createRenderDefinition({
                name: strings.settings.items.frontmatterTimestampFormat.name,
                desc: strings.settings.items.frontmatterTimestampFormat.desc,
                aliases: [
                    strings.settings.items.frontmatterTimestampFormat.momentLinkText,
                    strings.settings.items.frontmatterTimestampFormat.helpTooltip
                ],
                visible: () => plugin.settings.useFrontmatterMetadata,
                render: setting => {
                    context.configureDebouncedTextSetting(
                        setting,
                        strings.settings.items.frontmatterTimestampFormat.name,
                        createSettingDescriptionWithExternalLink({
                            text: strings.settings.items.frontmatterTimestampFormat.desc,
                            link: {
                                text: strings.settings.items.frontmatterTimestampFormat.momentLinkText,
                                href: MOMENT_FORMAT_DOCS_URL
                            }
                        }),
                        ISO_DATE_FORMAT,
                        () => plugin.settings.frontmatterDateFormat,
                        value => {
                            plugin.settings.frontmatterDateFormat = value;
                        },
                        undefined,
                        () => context.requestStatisticsRefresh()
                    );
                    setting.addExtraButton(button =>
                        button
                            .setIcon('lucide-help-circle')
                            .setTooltip(strings.settings.items.frontmatterTimestampFormat.helpTooltip)
                            .onClick(() => {
                                showNotice(strings.settings.items.frontmatterTimestampFormat.help, { timeout: TIMEOUTS.NOTICE_HELP });
                            })
                    );
                    setting.controlEl.addClass('nn-setting-wide-input');
                }
            }),
            createRenderDefinition({
                name: strings.settings.items.metadataInfo.successfullyParsed,
                searchable: false,
                visible: () => plugin.settings.useFrontmatterMetadata,
                render: setting => {
                    setting.setName('').setDesc('');
                    setting.settingEl.addClass('nn-setting-info-container');
                    setting.descEl.empty();
                    setting.addButton(button => {
                        context.registerMetadataInfoElement(setting.descEl, button);
                    });
                }
            })
        ])
    ];
}

function createFrontmatterTextRenderDefinition(options: {
    context: SettingsTabContext;
    name: string;
    desc: string;
    placeholder: string;
    visible: () => boolean;
    getValue: () => string;
    setValue: (value: string) => void;
    onAfterUpdate: () => void;
}): ReturnType<typeof createRenderDefinition> {
    return createRenderDefinition({
        name: options.name,
        desc: options.desc,
        aliases: [options.placeholder],
        visible: options.visible,
        render: setting => {
            options.context.configureDebouncedTextSetting(
                setting,
                options.name,
                options.desc,
                options.placeholder,
                options.getValue,
                options.setValue,
                undefined,
                options.onAfterUpdate
            );
            setting.controlEl.addClass('nn-setting-wide-input');
        }
    });
}
