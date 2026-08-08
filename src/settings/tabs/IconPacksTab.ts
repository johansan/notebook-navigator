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

import { strings } from '../../i18n';
import type { Setting, SettingDefinitionItem } from 'obsidian';
import { EXTERNAL_ICON_PROVIDERS } from '../../services/icons/external/providerRegistry';
import type { SettingsTabContext } from './SettingsTabContext';
import { ICON_ASSETS_REPOSITORY_URL } from '../../constants/urls';
import { runAsyncAction } from '../../utils/async';
import { showNotice } from '../../utils/noticeUtils';
import { createGroupDefinition, createRenderDefinition } from '../nativeSettingControls';
import { createExternalLinkText } from './externalLink';

/** Builds native 1.13 setting definitions for icon pack settings. */
export function createIconPacksSettingDefinitions(context: SettingsTabContext): SettingDefinitionItem[] {
    return [
        createGroupDefinition(undefined, [
            ...Object.values(EXTERNAL_ICON_PROVIDERS).map(config =>
                createRenderDefinition({
                    name: config.name,
                    desc: config.catalogUrl,
                    aliases: [
                        strings.settings.items.iconPackManagement.downloadButton,
                        strings.settings.items.iconPackManagement.removeButton,
                        config.catalogUrl
                    ],
                    render: setting => renderIconProviderSetting(setting, context, config)
                })
            ),
            createRenderDefinition({
                name: strings.settings.items.iconPackManagement.infoNote,
                searchable: false,
                render: setting => {
                    setting.setName('').setDesc('');
                    setting.settingEl.addClass('nn-setting-info-container');
                    setting.descEl.empty();
                    setting.descEl.createDiv().append(
                        createExternalLinkText({
                            text: strings.settings.items.iconPackManagement.infoNote,
                            link: { text: ICON_ASSETS_REPOSITORY_URL, href: ICON_ASSETS_REPOSITORY_URL }
                        })
                    );
                }
            })
        ])
    ];
}

function renderIconProviderSetting(
    setting: Setting,
    context: SettingsTabContext,
    config: (typeof EXTERNAL_ICON_PROVIDERS)[keyof typeof EXTERNAL_ICON_PROVIDERS]
): void {
    const { plugin } = context;

    const renderState = () => {
        setting.clear();
        const isInstalled = plugin.isExternalIconProviderInstalled(config.id);
        const isDownloading = plugin.isExternalIconProviderDownloading(config.id);
        const version = plugin.getExternalIconProviderVersion(config.id);

        const statusText = isInstalled
            ? strings.settings.items.iconPackManagement.statusInstalled.replace(
                  '{version}',
                  version || strings.settings.items.iconPackManagement.versionUnknown
              )
            : strings.settings.items.iconPackManagement.statusNotInstalled;

        setting.setName(config.name).setDesc('');

        const descriptionEl = setting.descEl;
        descriptionEl.empty();

        const linkRow = descriptionEl.createDiv();
        const catalogUrl = config.catalogUrl;
        const linkEl = linkRow.createEl('a', {
            text: catalogUrl,
            href: catalogUrl
        });
        linkEl.setAttr('rel', 'noopener noreferrer');
        linkEl.setAttr('target', '_blank');

        descriptionEl.createDiv({ text: statusText });

        if (isInstalled) {
            setting.addButton(button => {
                button.setButtonText(strings.settings.items.iconPackManagement.removeButton);
                button.setDisabled(isDownloading);
                button.onClick(() => {
                    runAsyncAction(async () => {
                        button.setDisabled(true);
                        try {
                            await plugin.removeExternalIconProvider(config.id);
                            renderState();
                        } catch (error) {
                            console.error('Failed to remove icon provider', error);
                            showNotice(strings.settings.items.iconPackManagement.removeFailed.replace('{name}', config.name), {
                                variant: 'warning'
                            });
                            button.setDisabled(false);
                        }
                    });
                });
            });
            return;
        }

        setting.addButton(button => {
            button.setButtonText(
                isDownloading
                    ? strings.settings.items.iconPackManagement.downloadingLabel
                    : strings.settings.items.iconPackManagement.downloadButton
            );
            button.setDisabled(isDownloading);
            button.onClick(() => {
                runAsyncAction(async () => {
                    button.setDisabled(true);
                    try {
                        await plugin.downloadExternalIconProvider(config.id);
                        renderState();
                    } catch (error) {
                        console.error('Failed to download icon provider', error);
                        showNotice(strings.settings.items.iconPackManagement.downloadFailed.replace('{name}', config.name), {
                            variant: 'warning'
                        });
                        button.setDisabled(false);
                    }
                });
            });
        });
    };

    renderState();
}
