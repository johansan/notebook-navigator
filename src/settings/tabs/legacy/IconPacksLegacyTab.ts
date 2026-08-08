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

import { ICON_ASSETS_REPOSITORY_URL } from '../../../constants/urls';
import { strings } from '../../../i18n';
import { EXTERNAL_ICON_PROVIDERS } from '../../../services/icons/external/providerRegistry';
import { runAsyncAction } from '../../../utils/async';
import { showNotice } from '../../../utils/noticeUtils';
import { createSettingGroupFactory } from '../../settingGroups';
import { createExternalLinkText } from '../externalLink';
import type { SettingsTabContext } from '../SettingsTabContext';

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderIconPacksTab(context: SettingsTabContext): void {
    const iconPacksRootEl = context.containerEl.createDiv();
    renderIconPacksContent(context, iconPacksRootEl);
}

function renderIconPacksContent(context: SettingsTabContext, iconPacksRootEl: HTMLElement): void {
    const { plugin, addInfoSetting } = context;
    iconPacksRootEl.empty();

    const createGroup = createSettingGroupFactory(iconPacksRootEl);
    const iconPacksGroup = createGroup(undefined);

    Object.values(EXTERNAL_ICON_PROVIDERS).forEach(config => {
        const isInstalled = plugin.isExternalIconProviderInstalled(config.id);
        const isDownloading = plugin.isExternalIconProviderDownloading(config.id);
        const version = plugin.getExternalIconProviderVersion(config.id);

        const statusText = isInstalled
            ? strings.settings.items.iconPackManagement.statusInstalled.replace(
                  '{version}',
                  version || strings.settings.items.iconPackManagement.versionUnknown
              )
            : strings.settings.items.iconPackManagement.statusNotInstalled;

        const setting = iconPacksGroup.addSetting(setting => {
            setting.setName(config.name).setDesc('');
        });

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
                            renderIconPacksContent(context, iconPacksRootEl);
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
        } else {
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
                            renderIconPacksContent(context, iconPacksRootEl);
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
        }
    });

    addInfoSetting(iconPacksGroup.addSetting, 'nn-setting-info-container', descEl => {
        descEl.createDiv().append(
            createExternalLinkText({
                text: strings.settings.items.iconPackManagement.infoNote,
                link: { text: ICON_ASSETS_REPOSITORY_URL, href: ICON_ASSETS_REPOSITORY_URL }
            })
        );
    });
}
