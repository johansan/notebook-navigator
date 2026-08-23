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

import { addIcon, setIcon } from 'obsidian';
import type { Setting, SettingDefinitionGroup } from 'obsidian';
import { BETTER_PASTE_PLUGIN_ID, PIXEL_PERFECT_IMAGE_PLUGIN_ID } from '../../constants/pluginIds';
import { communityPluginUrl, SUPPORT_BUY_ME_A_COFFEE_URL, SUPPORT_SPONSOR_URL, WELCOME_VIDEO_URL } from '../../constants/urls';
import { strings } from '../../i18n';
import { runAsyncAction } from '../../utils/async';
import { createSettingGroupFactory } from '../settingGroups';
import { setElementVisible } from '../dependentSettings';
import { createGroupDefinition, createRenderDefinition, createToggleDefinition } from '../nativeSettingControls';
import type { SettingsTabContext } from './SettingsTabContext';

/*
 * Better Paste's icon, copied from icon.svg in that plugin's repository, because only the
 * plugin that owns a drawing registers it and the card has to look right whether or not
 * Better Paste is installed. The id carries this plugin's name so registering it cannot
 * replace the drawing Better Paste registers for itself. Obsidian wraps the content in an
 * svg with a "0 0 100 100" viewBox, which is what the path is drawn against.
 */
const BETTER_PASTE_ICON_ID = 'notebook-navigator-better-paste';

addIcon(
    BETTER_PASTE_ICON_ID,
    `<path d="M 12.82,21.75 A 39.51,10.69 0 0 1 88.77,21.75 Q 91,23.86 89.03,26.21 L 62.48,57.81 Q 59.78,61.02 59.16,67.38 L 58.18,77.41 Q 57.98,79.4 56.2,80.31 L 46.81,85.13 Q 45.03,86.04 44.75,84.06 L 42.43,67.38 Q 41.49,60.64 39.11,57.81 L 12.56,26.21 Q 10.59,23.86 12.82,21.75 Z M 16.87,24.7 A 33.93,5.16 0 1 0 84.72,24.7 A 33.93,5.16 0 1 0 16.87,24.7 Z" fill="currentColor" fill-rule="evenodd" stroke="none"/>`
);

/**
 * Renders one card per plugin, each opening that plugin's page in Obsidian's community
 * browser. Shared by the native and legacy settings pages so both look the same. The
 * plugin names are product names and stay untranslated; Pixel Perfect Image has no icon of
 * its own, so it uses an Obsidian one.
 */
function renderOtherPluginCards(setting: Setting): void {
    // Marks the row so the cards lay out below the label rather than beside it
    setting.settingEl.addClass('nn-plugin-cards');
    const listEl = setting.settingEl.createDiv({ cls: 'nn-plugin-card-list' });

    const plugins = [
        {
            id: BETTER_PASTE_PLUGIN_ID,
            name: 'Better Paste',
            icon: BETTER_PASTE_ICON_ID,
            description: strings.settings.items.otherPlugins.betterPaste
        },
        {
            id: PIXEL_PERFECT_IMAGE_PLUGIN_ID,
            name: 'Pixel Perfect Image',
            icon: 'lucide-image',
            description: strings.settings.items.otherPlugins.pixelPerfectImage
        }
    ];

    for (const plugin of plugins) {
        const cardEl = listEl.createEl('button', { cls: 'nn-plugin-card', attr: { type: 'button' } });
        setIcon(cardEl.createDiv({ cls: 'nn-plugin-card-icon' }), plugin.icon);
        const detailsEl = cardEl.createDiv({ cls: 'nn-plugin-card-details' });
        detailsEl.createDiv({ cls: 'nn-plugin-card-name', text: plugin.name });
        detailsEl.createDiv({ cls: 'nn-plugin-card-description', text: plugin.description });
        setIcon(cardEl.createDiv({ cls: 'nn-plugin-card-arrow' }), 'lucide-chevron-right');
        cardEl.addEventListener('click', () => {
            window.open(communityPluginUrl(plugin.id));
        });
    }
}

/** Renders release notes, support links, and onboarding resources in the About group. */
export function renderStartResourcesSection(context: SettingsTabContext): void {
    const { containerEl, plugin } = context;
    const pluginVersion = plugin.manifest.version;
    const createGroup = createSettingGroupFactory(containerEl);
    const aboutGroup = createGroup(strings.settings.index.groups.about);

    let updateStatusEl: HTMLDivElement | null = null;

    const renderUpdateStatus = (version: string | null) => {
        if (!updateStatusEl) {
            return;
        }
        const hasVersion = Boolean(version);
        updateStatusEl.setText(
            hasVersion ? strings.settings.items.checkForNewVersionOnStart.status.replace('{version}', version ?? '') : ''
        );
        setElementVisible(updateStatusEl, hasVersion);
    };

    const applyCurrentNotice = () => {
        const notice = plugin.getPendingUpdateNotice();
        renderUpdateStatus(notice?.version ?? null);
    };

    const updateStatusListenerId = 'general-update-status';
    plugin.unregisterUpdateNoticeListener(updateStatusListenerId);

    const whatsNewSetting = aboutGroup.addSetting(setting => {
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
                                    await plugin.advanceLastShownVersion(pluginVersion);
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

    aboutGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.showReleaseNotes.name)
            .setDesc(strings.settings.items.showReleaseNotes.desc)
            .addToggle(toggle =>
                toggle.setValue(plugin.settings.showReleaseNotes).onChange(async value => {
                    plugin.settings.showReleaseNotes = value;
                    await plugin.saveSettingsAndUpdate();
                })
            );
    });

    aboutGroup.addSetting(setting => {
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

    const supportSetting = aboutGroup.addSetting(setting => {
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

    aboutGroup.addSetting(setting => {
        setting.setName(strings.settings.items.otherPlugins.name);
        renderOtherPluginCards(setting);
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
        createGroupDefinition(strings.settings.index.groups.about, [
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
                            hasVersion ? strings.settings.items.checkForNewVersionOnStart.status.replace('{version}', version ?? '') : ''
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
                                                await plugin.advanceLastShownVersion(pluginVersion);
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
            createToggleDefinition('showReleaseNotes', {
                name: strings.settings.items.showReleaseNotes.name,
                desc: strings.settings.items.showReleaseNotes.desc
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
                name: strings.settings.items.otherPlugins.name,
                render: setting => {
                    setting.setName(strings.settings.items.otherPlugins.name);
                    renderOtherPluginCards(setting);
                }
            })
        ])
    ];
}
