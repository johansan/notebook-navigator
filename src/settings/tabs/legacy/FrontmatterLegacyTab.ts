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
import { strings } from '../../../i18n';
import { MOMENT_FORMAT_DOCS_URL } from '../../../constants/urls';
import { showNotice } from '../../../utils/noticeUtils';
import { ISO_DATE_FORMAT } from '../../../utils/dateUtils';
import { TIMEOUTS } from '../../../types/obsidian-extended';
import type { SettingsTabContext } from '../SettingsTabContext';
import { runAsyncAction } from '../../../utils/async';
import { createSettingGroupFactory } from '../../settingGroups';
import { setElementVisible, wireToggleSettingWithDependentSection } from '../../dependentSettings';
import { normalizeCommaSeparatedList } from '../../../utils/commaSeparatedListUtils';
import { createSettingDescriptionWithExternalLink } from '../externalLink';

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

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderFrontmatterTab(context: SettingsTabContext): void {
    const { app, containerEl, plugin } = context;
    let migrateButton: ButtonComponent | null = null;
    let updateMigrationDescription: (() => void) | null = null;

    const createGroup = createSettingGroupFactory(containerEl);
    const frontmatterGroup = createGroup(undefined);

    const useFrontmatterSetting = frontmatterGroup.addSetting(setting => {
        setting.setName(strings.settings.items.useFrontmatterMetadata.name).setDesc(strings.settings.items.useFrontmatterMetadata.desc);
    });

    const frontmatterSettingsEl = wireToggleSettingWithDependentSection(
        useFrontmatterSetting,
        () => plugin.settings.useFrontmatterMetadata,
        async value => {
            plugin.settings.useFrontmatterMetadata = value;
            await plugin.saveSettingsAndUpdate();
            updateMigrationDescription?.();
            // Use context directly to satisfy eslint exhaustive-deps requirements
            context.requestStatisticsRefresh();
        }
    );

    const frontmatterIconSetting = context.createDebouncedTextSetting(
        frontmatterSettingsEl,
        strings.settings.items.frontmatterIconField.name,
        strings.settings.items.frontmatterIconField.desc,
        strings.settings.items.frontmatterIconField.placeholder,
        () => plugin.settings.frontmatterIconField,
        value => {
            plugin.settings.frontmatterIconField = value || '';
            updateMigrationDescription?.();
        },
        undefined,
        () => context.requestStatisticsRefresh()
    );
    frontmatterIconSetting.controlEl.addClass('nn-setting-wide-input');

    const frontmatterColorSetting = context.createDebouncedTextSetting(
        frontmatterSettingsEl,
        strings.settings.items.frontmatterColorField.name,
        strings.settings.items.frontmatterColorField.desc,
        strings.settings.items.frontmatterColorField.placeholder,
        () => plugin.settings.frontmatterColorField,
        value => {
            plugin.settings.frontmatterColorField = value || '';
            updateMigrationDescription?.();
        },
        undefined,
        () => context.requestStatisticsRefresh()
    );
    frontmatterColorSetting.controlEl.addClass('nn-setting-wide-input');

    const frontmatterBackgroundSetting = context.createDebouncedTextSetting(
        frontmatterSettingsEl,
        strings.settings.items.frontmatterBackgroundField.name,
        strings.settings.items.frontmatterBackgroundField.desc,
        strings.settings.items.frontmatterBackgroundField.placeholder,
        () => plugin.settings.frontmatterBackgroundField,
        value => {
            plugin.settings.frontmatterBackgroundField = value || '';
            updateMigrationDescription?.();
        },
        undefined,
        () => context.requestStatisticsRefresh()
    );
    frontmatterBackgroundSetting.controlEl.addClass('nn-setting-wide-input');

    const migrationSetting = new Setting(frontmatterSettingsEl).setName(strings.settings.items.migrateIconsAndColorsFromSettings.name);

    migrationSetting.addButton(button => {
        migrateButton = button;
        button.setButtonText(strings.settings.items.migrateIconsAndColorsFromSettings.button);
        button.setCta();
        // Migrate metadata to frontmatter without blocking the UI
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
                    updateMigrationDescription?.();
                    context.requestStatisticsRefresh();
                }
            });
        });
    });

    /** Updates the migration setting description based on pending migrations */
    updateMigrationDescription = () => {
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

    updateMigrationDescription();

    context.createDebouncedTextSetting(
        frontmatterSettingsEl,
        strings.settings.items.frontmatterNameFields.name,
        strings.settings.items.frontmatterNameFields.desc,
        strings.settings.items.frontmatterNameFields.placeholder,
        () => normalizeCommaSeparatedList(plugin.settings.frontmatterNameField),
        value => {
            plugin.settings.frontmatterNameField = normalizeCommaSeparatedList(value);
        },
        undefined,
        () => context.requestStatisticsRefresh()
    );

    context.createDebouncedTextSetting(
        frontmatterSettingsEl,
        strings.settings.items.frontmatterCreatedField.name,
        strings.settings.items.frontmatterCreatedField.desc,
        strings.settings.items.frontmatterCreatedField.placeholder,
        () => plugin.settings.frontmatterCreatedField,
        value => {
            plugin.settings.frontmatterCreatedField = value;
        },
        undefined,
        () => context.requestStatisticsRefresh()
    );

    context.createDebouncedTextSetting(
        frontmatterSettingsEl,
        strings.settings.items.frontmatterModifiedField.name,
        strings.settings.items.frontmatterModifiedField.desc,
        strings.settings.items.frontmatterModifiedField.placeholder,
        () => plugin.settings.frontmatterModifiedField,
        value => {
            plugin.settings.frontmatterModifiedField = value;
        },
        undefined,
        () => context.requestStatisticsRefresh()
    );

    const dateFormatSetting = context
        .createDebouncedTextSetting(
            frontmatterSettingsEl,
            strings.settings.items.frontmatterTimestampFormat.name,
            createSettingDescriptionWithExternalLink({
                text: strings.settings.items.frontmatterTimestampFormat.desc,
                link: { text: strings.settings.items.frontmatterTimestampFormat.momentLinkText, href: MOMENT_FORMAT_DOCS_URL }
            }),
            ISO_DATE_FORMAT,
            () => plugin.settings.frontmatterDateFormat,
            value => {
                plugin.settings.frontmatterDateFormat = value;
            },
            undefined,
            () => context.requestStatisticsRefresh()
        )
        .addExtraButton(button =>
            button
                .setIcon('lucide-help-circle')
                .setTooltip(strings.settings.items.frontmatterTimestampFormat.helpTooltip)
                .onClick(() => {
                    showNotice(strings.settings.items.frontmatterTimestampFormat.help, { timeout: TIMEOUTS.NOTICE_HELP });
                })
        );
    dateFormatSetting.controlEl.addClass('nn-setting-wide-input');

    const metadataInfoSetting = new Setting(frontmatterSettingsEl).setName('').setDesc('');
    metadataInfoSetting.settingEl.addClass('nn-setting-info-container');
    metadataInfoSetting.descEl.empty();
    metadataInfoSetting.addButton(button => {
        context.registerMetadataInfoElement(metadataInfoSetting.descEl, button);
    });
}
