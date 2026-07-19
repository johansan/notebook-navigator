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

import type { SettingDefinitionGroup } from 'obsidian';
import { SUPPORT_BUY_ME_A_COFFEE_URL, SUPPORT_SPONSOR_URL, WELCOME_VIDEO_URL } from '../../constants/urls';
import { strings } from '../../i18n';
import { runAsyncAction } from '../../utils/async';
import { createSettingGroupFactory } from '../settingGroups';
import { setElementVisible } from '../dependentSettings';
import { createGroupDefinition, createRenderDefinition } from '../nativeSettingControls';
import type { SettingsTabContext } from './SettingsTabContext';

/** Renders release notes, support links, and onboarding resources on the settings start page. */
export function renderStartResourcesSection(context: SettingsTabContext): void {
    const { containerEl, plugin } = context;
    const pluginVersion = plugin.manifest.version;
    const createGroup = createSettingGroupFactory(containerEl);
    const topGroup = createGroup(undefined);

    let updateStatusEl: HTMLDivElement | null = null;

    const renderUpdateStatus = (version: string | null) => {
        if (!updateStatusEl) {
            return;
        }
        const hasVersion = Boolean(version);
        updateStatusEl.setText(hasVersion ? strings.settings.items.updateCheckOnStart.status.replace('{version}', version ?? '') : '');
        setElementVisible(updateStatusEl, hasVersion);
    };

    const applyCurrentNotice = () => {
        const notice = plugin.getPendingUpdateNotice();
        renderUpdateStatus(notice?.version ?? null);
    };

    const updateStatusListenerId = 'general-update-status';
    plugin.unregisterUpdateNoticeListener(updateStatusListenerId);

    const whatsNewSetting = topGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.whatsNew.name.replace('{version}', pluginVersion))
            .setDesc(strings.settings.items.whatsNew.desc)
            .addButton(button =>
                button.setButtonText(strings.settings.items.whatsNew.buttonText).onClick(() => {
                    runAsyncAction(async () => {
                        const { WhatsNewModal } = await import('../../modals/WhatsNewModal');
                        const { getLatestReleaseNotes } = await import('../../releaseNotes');
                        const latestNotes = getLatestReleaseNotes();
                        new WhatsNewModal(context.app, latestNotes, () => {
                            window.setTimeout(() => {
                                runAsyncAction(async () => {
                                    plugin.settings.lastShownVersion = pluginVersion;
                                    await plugin.saveSettingsAndUpdate();
                                });
                            }, 1000);
                        }).open();
                    });
                })
            );
    });

    updateStatusEl = whatsNewSetting.descEl.createDiv({ cls: 'setting-item-description nn-update-status nn-setting-hidden' });

    applyCurrentNotice();

    plugin.registerUpdateNoticeListener(updateStatusListenerId, notice => {
        renderUpdateStatus(notice?.version ?? null);
    });
    context.registerSettingsRenderCleanup(() => {
        plugin.unregisterUpdateNoticeListener(updateStatusListenerId);
    });

    const supportSetting = topGroup.addSetting(setting => {
        setting.setName(strings.settings.items.supportDevelopment.name).setDesc(strings.settings.items.supportDevelopment.desc);
    });

    supportSetting.addButton(button => {
        button.setButtonText(strings.settings.items.supportDevelopment.buttonText).onClick(() => window.open(SUPPORT_SPONSOR_URL));
        button.buttonEl.addClass('nn-support-button');
    });

    supportSetting.addButton(button => {
        button
            .setButtonText(strings.settings.items.supportDevelopment.coffeeButton)
            .onClick(() => window.open(SUPPORT_BUY_ME_A_COFFEE_URL));
        button.buttonEl.addClass('nn-support-button');
    });

    topGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.masteringVideo.name)
            .setDesc(strings.settings.items.masteringVideo.desc)
            .addButton(button => {
                button
                    .setIcon('lucide-play')
                    .setTooltip(strings.modals.welcome.openVideoButton)
                    .onClick(() => {
                        window.open(WELCOME_VIDEO_URL);
                    });
                button.buttonEl.addClass('nn-youtube-button');
                button.buttonEl.setAttr('aria-label', strings.modals.welcome.openVideoButton);
            });
    });
}

export function createStartResourcesSettingDefinitions(context: SettingsTabContext, onFirstRender?: () => void): SettingDefinitionGroup[] {
    const { plugin } = context;
    const pluginVersion = plugin.manifest.version;
    let hasRendered = false;

    const runOnFirstRender = () => {
        if (hasRendered) {
            return;
        }
        hasRendered = true;
        onFirstRender?.();
    };

    return [
        createGroupDefinition(undefined, [
            createRenderDefinition({
                name: strings.settings.items.whatsNew.name.replace('{version}', pluginVersion),
                desc: strings.settings.items.whatsNew.desc,
                render: setting => {
                    runOnFirstRender();
                    const updateStatusListenerId = 'general-update-status';
                    let updateStatusEl: HTMLDivElement | null = null;

                    const renderUpdateStatus = (version: string | null) => {
                        if (!updateStatusEl) {
                            return;
                        }
                        const hasVersion = Boolean(version);
                        updateStatusEl.setText(
                            hasVersion ? strings.settings.items.updateCheckOnStart.status.replace('{version}', version ?? '') : ''
                        );
                        setElementVisible(updateStatusEl, hasVersion);
                    };

                    setting
                        .setName(strings.settings.items.whatsNew.name.replace('{version}', pluginVersion))
                        .setDesc(strings.settings.items.whatsNew.desc)
                        .addButton(button =>
                            button.setButtonText(strings.settings.items.whatsNew.buttonText).onClick(() => {
                                runAsyncAction(async () => {
                                    const { WhatsNewModal } = await import('../../modals/WhatsNewModal');
                                    const { getLatestReleaseNotes } = await import('../../releaseNotes');
                                    const latestNotes = getLatestReleaseNotes();
                                    new WhatsNewModal(context.app, latestNotes, () => {
                                        window.setTimeout(() => {
                                            runAsyncAction(async () => {
                                                plugin.settings.lastShownVersion = pluginVersion;
                                                await plugin.saveSettingsAndUpdate();
                                            });
                                        }, 1000);
                                    }).open();
                                });
                            })
                        );

                    updateStatusEl = setting.descEl.createDiv({
                        cls: 'setting-item-description nn-update-status nn-setting-hidden'
                    });

                    renderUpdateStatus(plugin.getPendingUpdateNotice()?.version ?? null);
                    plugin.unregisterUpdateNoticeListener(updateStatusListenerId);
                    plugin.registerUpdateNoticeListener(updateStatusListenerId, notice => {
                        renderUpdateStatus(notice?.version ?? null);
                    });

                    return () => {
                        plugin.unregisterUpdateNoticeListener(updateStatusListenerId);
                    };
                }
            }),
            createRenderDefinition({
                name: strings.settings.items.supportDevelopment.name,
                desc: strings.settings.items.supportDevelopment.desc,
                render: setting => {
                    setting.setName(strings.settings.items.supportDevelopment.name).setDesc(strings.settings.items.supportDevelopment.desc);

                    setting.addButton(button => {
                        button
                            .setButtonText(strings.settings.items.supportDevelopment.buttonText)
                            .onClick(() => window.open(SUPPORT_SPONSOR_URL));
                        button.buttonEl.addClass('nn-support-button');
                    });

                    setting.addButton(button => {
                        button
                            .setButtonText(strings.settings.items.supportDevelopment.coffeeButton)
                            .onClick(() => window.open(SUPPORT_BUY_ME_A_COFFEE_URL));
                        button.buttonEl.addClass('nn-support-button');
                    });
                }
            }),
            createRenderDefinition({
                name: strings.settings.items.masteringVideo.name,
                desc: strings.settings.items.masteringVideo.desc,
                render: setting => {
                    setting
                        .setName(strings.settings.items.masteringVideo.name)
                        .setDesc(strings.settings.items.masteringVideo.desc)
                        .addButton(button => {
                            button
                                .setIcon('lucide-play')
                                .setTooltip(strings.modals.welcome.openVideoButton)
                                .onClick(() => {
                                    window.open(WELCOME_VIDEO_URL);
                                });
                            button.buttonEl.addClass('nn-youtube-button');
                            button.buttonEl.setAttr('aria-label', strings.modals.welcome.openVideoButton);
                        });
                }
            })
        ])
    ];
}
