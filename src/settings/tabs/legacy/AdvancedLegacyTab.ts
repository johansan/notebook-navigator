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

import { ButtonComponent } from 'obsidian';
import { strings } from '../../../i18n';
import { ConfirmModal } from '../../../modals/ConfirmModal';
import { SettingsExportModal, SettingsImportModal } from '../../../modals/SettingsTransferModal';
import type { MetadataCleanupSummary } from '../../../services/MetadataService';
import { runAsyncAction } from '../../../utils/async';
import { localStorage } from '../../../utils/localStorage';
import { showNotice } from '../../../utils/noticeUtils';
import { isDualPaneSupported } from '../../../utils/paneLayout';
import { getNavigationPaneSizing } from '../../../utils/paneSizing';
import { createSettingGroupFactory } from '../../settingGroups';
import { getNotSyncedSettingName } from '../../syncModeToggle';
import type { SettingsTabContext } from '../SettingsTabContext';

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderAdvancedTab(context: SettingsTabContext): void {
    const { containerEl, plugin, addInfoSetting } = context;

    const createGroup = createSettingGroupFactory(containerEl);
    const advancedGroup = createGroup(undefined);
    const maintenanceGroup = createGroup(strings.settings.pages.advanced.groups.maintenance);
    const resetGroup = createGroup(strings.settings.pages.advanced.groups.resetSettings);

    advancedGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.checkForNewVersionOnStart.name)
            .setDesc(strings.settings.items.checkForNewVersionOnStart.desc)
            .addToggle(toggle =>
                toggle.setValue(plugin.settings.checkForUpdatesOnStart).onChange(async value => {
                    plugin.settings.checkForUpdatesOnStart = value;
                    if (!value) {
                        plugin.dismissPendingUpdateNotice();
                    }
                    await plugin.saveSettingsAndUpdate();
                    if (value) {
                        await plugin.runReleaseUpdateCheck(true);
                    }
                })
            );
    });

    advancedGroup.addSetting(setting => {
        setting
            .setName(getNotSyncedSettingName(strings.settings.items.startupDebugLogging.name))
            .setDesc(strings.settings.items.startupDebugLogging.desc)
            .addToggle(toggle =>
                toggle.setValue(plugin.isDebugLoggingEnabled()).onChange(value => {
                    plugin.setDebugLoggingEnabled(value);
                })
            );
    });

    // The pane separator only exists where dual pane is available (desktop and tablets)
    if (isDualPaneSupported()) {
        maintenanceGroup.addSetting(setting => {
            setting
                .setName(strings.settings.items.resetPaneSeparator.name)
                .setDesc(strings.settings.items.resetPaneSeparator.desc)
                .addButton(button =>
                    button.setButtonText(strings.settings.items.resetPaneSeparator.buttonText).onClick(() => {
                        const orientation = plugin.getDualPaneOrientation();
                        const { storageKey } = getNavigationPaneSizing(orientation);
                        localStorage.remove(storageKey);
                        showNotice(strings.settings.items.resetPaneSeparator.notice);
                    })
                );
        });
    }

    advancedGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.importAndExportSettings.name)
            .setDesc(strings.settings.items.importAndExportSettings.desc)
            .addButton(button =>
                button.setButtonText(strings.settings.items.importAndExportSettings.importButtonText).onClick(() => {
                    new SettingsImportModal(context.app, plugin).open();
                })
            )
            .addButton(button =>
                button.setButtonText(strings.settings.items.importAndExportSettings.exportButtonText).onClick(() => {
                    new SettingsExportModal(context.app, plugin).open();
                })
            );
    });

    let metadataCleanupButton: ButtonComponent | null = null;
    let metadataCleanupInfoText: HTMLDivElement | null = null;

    const setMetadataCleanupLoadingState = () => {
        metadataCleanupInfoText?.setText(strings.settings.items.metadataCleanup.loading);
        metadataCleanupButton?.setDisabled(true);
    };

    const updateMetadataCleanupInfo = ({ folders, tags, properties, files, pinnedNotes, separators, total }: MetadataCleanupSummary) => {
        if (!metadataCleanupInfoText) {
            return;
        }

        if (total === 0) {
            metadataCleanupInfoText.setText(strings.settings.items.metadataCleanup.statusClean);
            metadataCleanupButton?.setDisabled(true);
            return;
        }

        const infoText = strings.settings.items.metadataCleanup.statusCounts
            .replace('{folders}', folders.toString())
            .replace('{tags}', tags.toString())
            .replace('{properties}', properties.toString())
            .replace('{files}', files.toString())
            .replace('{pinned}', pinnedNotes.toString())
            .replace('{separators}', separators.toString());
        metadataCleanupInfoText.setText(infoText);
        metadataCleanupButton?.setDisabled(false);
    };

    const refreshMetadataCleanupSummary = async () => {
        setMetadataCleanupLoadingState();
        try {
            const summary = await plugin.getMetadataCleanupSummary();
            updateMetadataCleanupInfo(summary);
        } catch (error) {
            console.error('Failed to fetch metadata cleanup summary', error);
            metadataCleanupInfoText?.setText(strings.settings.items.metadataCleanup.error);
            metadataCleanupButton?.setDisabled(false);
        }
    };

    const metadataCleanupSetting = maintenanceGroup.addSetting(setting => {
        setting.setName(strings.settings.items.metadataCleanup.name).setDesc(strings.settings.items.metadataCleanup.desc);
    });

    metadataCleanupSetting.addButton(button => {
        metadataCleanupButton = button;
        button.setButtonText(strings.settings.items.metadataCleanup.buttonText);
        button.setDisabled(true);
        button.onClick(() => {
            runAsyncAction(async () => {
                setMetadataCleanupLoadingState();
                try {
                    await plugin.runMetadataCleanup();
                } catch (error) {
                    console.error('Metadata cleanup failed', error);
                    showNotice(strings.settings.items.metadataCleanup.error, { variant: 'warning' });
                } finally {
                    await refreshMetadataCleanupSummary();
                }
            });
        });
    });

    metadataCleanupInfoText = metadataCleanupSetting.descEl.createDiv({
        cls: 'setting-item-description',
        text: strings.settings.items.metadataCleanup.loading
    });

    runAsyncAction(() => refreshMetadataCleanupSummary());

    maintenanceGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.rebuildCache.name)
            .setDesc(strings.settings.items.rebuildCache.desc)
            .addButton(button =>
                button.setButtonText(strings.settings.items.rebuildCache.buttonText).onClick(() => {
                    runAsyncAction(async () => {
                        button.setDisabled(true);
                        try {
                            await plugin.rebuildCache();
                        } catch (error) {
                            console.error('Failed to rebuild cache from settings:', error);
                            showNotice(strings.settings.items.rebuildCache.error, { variant: 'warning' });
                        } finally {
                            button.setDisabled(false);
                        }
                    });
                })
            );
    });

    const cacheStatsSetting = addInfoSetting(maintenanceGroup.addSetting, ['nn-database-stats', 'nn-stats-section'], () => {});

    const statsTextEl = cacheStatsSetting.descEl.createDiv({ cls: 'nn-stats-text' });

    context.registerStatsTextElement(statsTextEl);
    context.requestStatisticsRefresh();
    context.ensureStatisticsInterval();

    resetGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.resetAllSettings.name)
            .setDesc(strings.settings.items.resetAllSettings.desc)
            .addButton(button => {
                button.setButtonText(strings.settings.items.resetAllSettings.buttonText);
                button.buttonEl.addClass('mod-warning');
                button.onClick(() => {
                    new ConfirmModal(
                        context.app,
                        strings.settings.items.resetAllSettings.confirmTitle,
                        strings.settings.items.resetAllSettings.confirmMessage,
                        async () => {
                            button.setDisabled(true);
                            try {
                                await plugin.resetAllSettings();
                                showNotice(strings.settings.items.resetAllSettings.notice);
                            } catch (error) {
                                console.error('Failed to reset all settings', error);
                                showNotice(strings.settings.items.resetAllSettings.error, { variant: 'warning' });
                            } finally {
                                button.setDisabled(false);
                            }
                        },
                        strings.settings.items.resetAllSettings.confirmButtonText
                    ).open();
                });
            });
    });
}
