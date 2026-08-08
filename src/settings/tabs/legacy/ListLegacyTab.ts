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

import { Platform, Setting, setIcon } from 'obsidian';
import { strings } from '../../../i18n';
import { DEFAULT_SETTINGS } from '../../defaultSettings';
import { isListDisplayMode, isListPaneTitleOption, isManualSortNewNotePlacement, isPropertySortSecondaryOption } from '../../types';
import { MANUAL_SORT_NEW_NOTE_PLACEMENT_OPTIONS, PROPERTY_SORT_SECONDARY_OPTIONS } from '../../types';
import type { SettingsTabContext } from '../SettingsTabContext';
import {
    getManualSortNewNotePlacementOptionLabel,
    getPropertySecondarySortOptionLabel,
    reconcileDefaultsAfterPropertyKeysEdit,
    renderDefaultFolderSortSetting,
    renderNoteGroupingSetting,
    renderPropertyGroupKeySetting
} from '../ListTab';
import { runAsyncAction } from '../../../utils/async';
import { usesMobileChrome } from '../../../utils/paneLayout';
import { createSettingGroupFactory } from '../../settingGroups';
import { addSettingSyncModeToggle } from '../../syncModeToggle';
import { createDependentSettingsSection, setElementVisible } from '../../dependentSettings';
import { appendSettingText } from '../../settingText';
import { pruneUnavailablePropertySortOverrides } from '../../../utils/sortUtils';
import { pruneUnavailablePropertyGroupingOverrides } from '../../../utils/listGrouping';
import {
    getManualSortGroupHeaderPropertyKey,
    isValidManualSortPropertyKey,
    normalizeManualSortPropertyKey
} from '../../../utils/manualSort';
import { formatPixelSliderValue, renderSliderSetting } from '../SliderSetting';
import { renderToolbarButtonsSetting } from '../ToolbarButtonsSetting';

type QuickActionSettingKey =
    'quickActionRevealInFolder' | 'quickActionAddTag' | 'quickActionAddToShortcuts' | 'quickActionPinNote' | 'quickActionOpenInNewTab';

interface QuickActionToggleConfig {
    key: QuickActionSettingKey;
    icon: string;
    label: string;
}

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderListPaneTab(context: SettingsTabContext): void {
    const { containerEl, plugin, addToggleSetting, addInfoSetting } = context;
    const createGroup = createSettingGroupFactory(containerEl);

    const renderAppearanceGroup = (): void => {
        const appearanceGroup = createGroup(strings.settings.pages.listPane.groups.appearance);

        // The list pane title only renders with the desktop chrome (desktop and tablets)
        if (!usesMobileChrome()) {
            appearanceGroup.addSetting(setting => {
                setting
                    .setName(strings.settings.items.listPaneTitle.name)
                    .setDesc(strings.settings.items.listPaneTitle.desc)
                    .addDropdown(dropdown =>
                        dropdown
                            .addOption('header', strings.settings.items.listPaneTitle.options.header)
                            .addOption('list', strings.settings.items.listPaneTitle.options.listPane)
                            .addOption('hidden', strings.settings.items.listPaneTitle.options.hidden)
                            .setValue(plugin.settings.listPaneTitle)
                            .onChange(async value => {
                                if (!isListPaneTitleOption(value)) {
                                    return;
                                }
                                plugin.settings.listPaneTitle = value;
                                await plugin.saveSettingsAndUpdate();
                            })
                    );
            });
        }

        appearanceGroup.addSetting(setting => {
            setting
                .setName(strings.settings.items.defaultListMode.name)
                .setDesc(strings.settings.items.defaultListMode.desc)
                .addDropdown(dropdown =>
                    dropdown
                        .addOption('standard', strings.settings.items.defaultListMode.options.standard)
                        .addOption('compact', strings.settings.items.defaultListMode.options.compact)
                        .setValue(plugin.settings.defaultListMode)
                        .onChange(async value => {
                            if (!isListDisplayMode(value)) {
                                return;
                            }
                            plugin.settings.defaultListMode = value === 'compact' ? 'compact' : 'standard';
                            await plugin.saveSettingsAndUpdate();
                        })
                );
        });

        const compactItemHeightSetting = appearanceGroup.addSetting(setting => {
            renderSliderSetting(setting, {
                name: strings.settings.items.compactItemHeight.name,
                desc: strings.settings.items.compactItemHeight.desc,
                value: plugin.settings.compactItemHeight,
                defaultValue: DEFAULT_SETTINGS.compactItemHeight,
                min: 20,
                max: 28,
                step: 1,
                resetTooltip: strings.settings.items.compactItemHeight.resetTooltip,
                formatValue: formatPixelSliderValue,
                onChange: value => {
                    plugin.setCompactItemHeight(value);
                }
            });
        });

        addSettingSyncModeToggle({ setting: compactItemHeightSetting, plugin, settingId: 'compactItemHeight' });

        const compactItemHeightSettingsEl = createDependentSettingsSection(compactItemHeightSetting);

        const compactItemHeightScaleTextSetting = new Setting(compactItemHeightSettingsEl)
            .setName(strings.settings.items.compactItemHeightScaleText.name)
            .setDesc(strings.settings.items.compactItemHeightScaleText.desc)
            .addToggle(toggle =>
                toggle.setValue(plugin.settings.compactItemHeightScaleText).onChange(value => {
                    plugin.setCompactItemHeightScaleText(value);
                })
            );

        addSettingSyncModeToggle({ setting: compactItemHeightScaleTextSetting, plugin, settingId: 'compactItemHeightScaleText' });

        addToggleSetting(
            appearanceGroup.addSetting,
            strings.settings.items.alwaysShowAllTagAndPropertyPills.name,
            strings.settings.items.alwaysShowAllTagAndPropertyPills.desc,
            () => plugin.settings.showSelectedNavigationPills,
            value => {
                plugin.settings.showSelectedNavigationPills = value;
            }
        );
    };

    const organizationGroup = createGroup(undefined);

    renderToolbarButtonsSetting(createSetting => organizationGroup.addSetting(createSetting), plugin, 'list');

    const includeDescendantNotesSetting = organizationGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.includeDescendantNotes.name)
            .setDesc(strings.settings.items.includeDescendantNotes.desc)
            .addToggle(toggle => {
                const preferences = plugin.getUXPreferences();
                toggle.setValue(preferences.includeDescendantNotes).onChange(value => {
                    plugin.setIncludeDescendantNotes(value);
                });
            });
    });

    addSettingSyncModeToggle({ setting: includeDescendantNotesSetting, plugin, settingId: 'includeDescendantNotes' });

    const sortAndGroupGroup = createGroup(strings.settings.pages.listPane.groups.sortAndGroup);
    let refreshPropertySortSecondaryVisibility = (): void => {};

    sortAndGroupGroup.addSetting(setting => {
        renderDefaultFolderSortSetting(setting, context);
    });

    sortAndGroupGroup.addSetting(setting => {
        renderNoteGroupingSetting(setting, context);
    });

    const propertySortKeySetting = sortAndGroupGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.sortingProperties.name)
            .setDesc(strings.settings.items.sortingProperties.desc)
            .addText(text => {
                const commitPropertySortKey = async (): Promise<void> => {
                    const value = text.getValue();
                    if (plugin.settings.propertySortKey === value) {
                        return;
                    }
                    plugin.settings.propertySortKey = value;
                    pruneUnavailablePropertySortOverrides(plugin.settings);
                    reconcileDefaultsAfterPropertyKeysEdit(plugin.settings);
                    refreshPropertySortSecondaryVisibility();
                    await plugin.saveSettingsAndUpdate();
                };

                text.inputEl.addEventListener('blur', () => {
                    runAsyncAction(commitPropertySortKey);
                });
                text.inputEl.addEventListener('keydown', event => {
                    if (event.key !== 'Enter') {
                        return;
                    }
                    event.preventDefault();
                    runAsyncAction(commitPropertySortKey);
                    text.inputEl.blur();
                });

                return text.setPlaceholder(strings.settings.items.sortingProperties.placeholder).setValue(plugin.settings.propertySortKey);
            });
    });

    const propertySortSecondarySettingsEl = createDependentSettingsSection(propertySortKeySetting);
    refreshPropertySortSecondaryVisibility = (): void => {
        setElementVisible(propertySortSecondarySettingsEl, plugin.settings.propertySortKey.trim().length > 0);
    };

    new Setting(propertySortSecondarySettingsEl)
        .setName(strings.settings.items.propertySecondarySort.name)
        .setDesc(strings.settings.items.propertySecondarySort.desc)
        .addDropdown(dropdown => {
            PROPERTY_SORT_SECONDARY_OPTIONS.forEach(option => {
                dropdown.addOption(option, getPropertySecondarySortOptionLabel(option));
            });
            return dropdown.setValue(plugin.settings.propertySortSecondary).onChange(async value => {
                if (!isPropertySortSecondaryOption(value)) {
                    return;
                }
                plugin.settings.propertySortSecondary = value;
                await plugin.saveSettingsAndUpdate();
            });
        });
    refreshPropertySortSecondaryVisibility();

    sortAndGroupGroup.addSetting(setting => {
        renderPropertyGroupKeySetting(setting, context);
    });

    addToggleSetting(
        sortAndGroupGroup.addSetting,
        strings.settings.items.showCurrentFolderFilesAtBottom.name,
        strings.settings.items.showCurrentFolderFilesAtBottom.desc,
        () => plugin.settings.showCurrentFolderFilesAtBottom,
        value => {
            plugin.settings.showCurrentFolderFilesAtBottom = value;
        }
    );

    addInfoSetting(sortAndGroupGroup.addSetting, ['nn-setting-info-container', 'nn-setting-info-list'], descEl => {
        const info = strings.settings.items.propertySortInstructions;
        descEl.createDiv({ text: info.intro });
        const listEl = descEl.createEl('ol');
        info.items.forEach(item => {
            const itemEl = listEl.createEl('li');
            appendSettingText(itemEl, item);
        });
    });

    const groupHeadersGroup = createGroup(strings.settings.pages.listPane.groups.groupHeaders);

    addToggleSetting(
        groupHeadersGroup.addSetting,
        strings.settings.items.stickyGroupHeaders.name,
        strings.settings.items.stickyGroupHeaders.desc,
        () => plugin.settings.stickyGroupHeaders,
        value => {
            plugin.settings.stickyGroupHeaders = value;
        }
    );

    addToggleSetting(
        groupHeadersGroup.addSetting,
        strings.settings.items.showSubfolderPaths.name,
        strings.settings.items.showSubfolderPaths.desc,
        () => plugin.settings.showFolderGroupPaths,
        value => {
            plugin.settings.showFolderGroupPaths = value;
        }
    );

    addToggleSetting(
        groupHeadersGroup.addSetting,
        strings.settings.items.showGroupHeaderItemCounts.name,
        strings.settings.items.showGroupHeaderItemCounts.desc,
        () => plugin.settings.showGroupHeaderItemCounts,
        value => {
            plugin.settings.showGroupHeaderItemCounts = value;
        }
    );

    groupHeadersGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.groupHeaderProperty.name)
            .setDesc(strings.settings.items.groupHeaderProperty.desc)
            .addText(text => {
                const commitGroupHeaderProperty = async (): Promise<void> => {
                    const value = text.getValue().trim();
                    if (
                        value.length > 0 &&
                        getManualSortGroupHeaderPropertyKey({
                            manualSortGroupHeaderProperty: value,
                            manualSortPropertyKey: plugin.settings.manualSortPropertyKey
                        }) === null
                    ) {
                        text.setValue(plugin.settings.manualSortGroupHeaderProperty);
                        return;
                    }
                    text.setValue(value);
                    if (plugin.settings.manualSortGroupHeaderProperty === value) {
                        return;
                    }
                    plugin.settings.manualSortGroupHeaderProperty = value;
                    await plugin.saveSettingsAndUpdate();
                };

                text.inputEl.addEventListener('blur', () => {
                    runAsyncAction(commitGroupHeaderProperty);
                });
                text.inputEl.addEventListener('keydown', event => {
                    if (event.key !== 'Enter') {
                        return;
                    }
                    event.preventDefault();
                    runAsyncAction(commitGroupHeaderProperty);
                    text.inputEl.blur();
                });

                return text
                    .setPlaceholder(DEFAULT_SETTINGS.manualSortGroupHeaderProperty)
                    .setValue(plugin.settings.manualSortGroupHeaderProperty);
            });
    });

    addInfoSetting(groupHeadersGroup.addSetting, ['nn-setting-info-container', 'nn-setting-info-list'], descEl => {
        const info = strings.settings.items.groupHeadersInstructions;
        descEl.createDiv({ text: info.intro });
        const listEl = descEl.createEl('ol');
        info.items.forEach(item => {
            const itemEl = listEl.createEl('li');
            appendSettingText(itemEl, item);
        });
    });

    const manualSortGroup = createGroup(strings.settings.pages.listPane.groups.manualSort);

    manualSortGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.manualSortProperty.name)
            .setDesc(strings.settings.items.manualSortProperty.desc)
            .addText(text => {
                const commitManualSortPropertyKey = async (): Promise<void> => {
                    const value = normalizeManualSortPropertyKey(text.getValue());
                    if (!isValidManualSortPropertyKey(value)) {
                        text.setValue(plugin.settings.manualSortPropertyKey);
                        return;
                    }
                    text.setValue(value);
                    if (plugin.settings.manualSortPropertyKey === value) {
                        return;
                    }
                    plugin.settings.manualSortPropertyKey = value;
                    pruneUnavailablePropertySortOverrides(plugin.settings);
                    pruneUnavailablePropertyGroupingOverrides(plugin.settings);
                    reconcileDefaultsAfterPropertyKeysEdit(plugin.settings);
                    await plugin.saveSettingsAndUpdate();
                };

                text.inputEl.addEventListener('blur', () => {
                    runAsyncAction(commitManualSortPropertyKey);
                });
                text.inputEl.addEventListener('keydown', event => {
                    if (event.key !== 'Enter') {
                        return;
                    }
                    event.preventDefault();
                    runAsyncAction(commitManualSortPropertyKey);
                    text.inputEl.blur();
                });

                return text.setPlaceholder(DEFAULT_SETTINGS.manualSortPropertyKey).setValue(plugin.settings.manualSortPropertyKey);
            });
    });

    manualSortGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.manualSortNewNotePlacement.name)
            .setDesc(strings.settings.items.manualSortNewNotePlacement.desc)
            .addDropdown(dropdown => {
                MANUAL_SORT_NEW_NOTE_PLACEMENT_OPTIONS.forEach(option => {
                    dropdown.addOption(option, getManualSortNewNotePlacementOptionLabel(option));
                });
                return dropdown.setValue(plugin.settings.manualSortNewNotePlacement).onChange(async value => {
                    if (!isManualSortNewNotePlacement(value)) {
                        return;
                    }
                    plugin.settings.manualSortNewNotePlacement = value;
                    await plugin.saveSettingsAndUpdate();
                });
            });
    });

    addToggleSetting(
        manualSortGroup.addSetting,
        strings.settings.items.confirmBeforeManualSort.name,
        strings.settings.items.confirmBeforeManualSort.desc,
        () => plugin.settings.confirmBeforeManualSort,
        value => {
            plugin.settings.confirmBeforeManualSort = value;
        }
    );

    addInfoSetting(manualSortGroup.addSetting, ['nn-setting-info-container', 'nn-setting-info-list'], descEl => {
        const info = strings.settings.items.manualSortInstructions;
        descEl.createDiv({ text: info.intro });
        const listEl = descEl.createEl('ol');
        info.items.forEach(item => {
            const itemEl = listEl.createEl('li');
            appendSettingText(itemEl, item);
        });
    });

    const pinnedNotesGroup = createGroup(strings.settings.pages.listPane.groups.pinnedNotes);

    addToggleSetting(
        pinnedNotesGroup.addSetting,
        strings.settings.items.filterPinnedNotesByFolder.name,
        strings.settings.items.filterPinnedNotesByFolder.desc,
        () => plugin.settings.filterPinnedByFolder,
        value => {
            plugin.settings.filterPinnedByFolder = value;
        }
    );

    renderAppearanceGroup();

    const behaviorGroup = createGroup(strings.settings.pages.listPane.groups.behavior);

    addToggleSetting(
        behaviorGroup.addSetting,
        strings.settings.items.scrollToSelectedFileOnListChanges.name,
        strings.settings.items.scrollToSelectedFileOnListChanges.desc,
        () => plugin.settings.revealFileOnListChanges,
        value => {
            plugin.settings.revealFileOnListChanges = value;
        }
    );

    if (!Platform.isMobile) {
        const quickActionsSetting = behaviorGroup.addSetting(setting => {
            setting.setName(strings.settings.items.showQuickActions.name).setDesc(strings.settings.items.showQuickActions.desc);
        });

        quickActionsSetting.controlEl.addClass('nn-quick-actions-control');

        const quickActionsButtonsEl = quickActionsSetting.controlEl.createDiv({
            cls: ['nn-toolbar-visibility-grid', 'nn-quick-actions-buttons']
        });

        const updateButtonsDisabledState = (enabled: boolean) => {
            quickActionsButtonsEl.classList.toggle('is-disabled', !enabled);
            quickActionsButtonsEl.querySelectorAll('button').forEach(button => {
                button.toggleAttribute('disabled', !enabled);
            });
        };

        const quickActionButtons: QuickActionToggleConfig[] = [
            {
                key: 'quickActionRevealInFolder',
                icon: 'lucide-folder-search',
                label: strings.contextMenu.file.revealInFolder
            },
            {
                key: 'quickActionAddTag',
                icon: 'lucide-tag',
                label: strings.contextMenu.file.addTag
            },
            {
                key: 'quickActionAddToShortcuts',
                icon: 'lucide-star',
                label: strings.shortcuts.add
            },
            {
                key: 'quickActionPinNote',
                icon: 'lucide-pin',
                label: strings.contextMenu.file.pinNote
            },
            {
                key: 'quickActionOpenInNewTab',
                icon: 'lucide-file-plus',
                label: strings.contextMenu.file.openInNewTab
            }
        ];

        quickActionButtons.forEach(buttonConfig => {
            const buttonEl = quickActionsButtonsEl.createEl('button', {
                cls: ['nn-toolbar-visibility-toggle', 'nn-mobile-toolbar-button'],
                attr: { type: 'button' }
            });
            buttonEl.setAttr('aria-label', buttonConfig.label);
            buttonEl.setAttr('title', buttonConfig.label);

            const iconEl = buttonEl.createSpan({ cls: 'nn-toolbar-visibility-icon' });
            setIcon(iconEl, buttonConfig.icon);

            const applyState = () => {
                const isEnabled = Boolean(plugin.settings[buttonConfig.key]);
                buttonEl.classList.toggle('is-active', isEnabled);
                buttonEl.classList.toggle('nn-mobile-toolbar-button-active', isEnabled);
                buttonEl.setAttr('aria-pressed', isEnabled ? 'true' : 'false');
            };

            buttonEl.addEventListener('click', () => {
                plugin.settings[buttonConfig.key] = !plugin.settings[buttonConfig.key];
                applyState();
                runAsyncAction(async () => {
                    await plugin.saveSettingsAndUpdate();
                });
            });

            applyState();
        });

        quickActionsSetting.addToggle(toggle => {
            toggle.setValue(plugin.settings.showQuickActions).onChange(async value => {
                plugin.settings.showQuickActions = value;
                updateButtonsDisabledState(value);
                await plugin.saveSettingsAndUpdate();
            });
            toggle.toggleEl.addClass('nn-quick-actions-master-toggle');
        });

        updateButtonsDisabledState(plugin.settings.showQuickActions);
    }

    const drawingPreviewsGroup = createGroup(strings.settings.pages.listPane.groups.drawingPreviews);

    addToggleSetting(
        drawingPreviewsGroup.addSetting,
        strings.settings.items.hideExportedPreviewImages.name,
        strings.settings.items.hideExportedPreviewImages.desc,
        () => plugin.settings.hideDrawingPreviewImages,
        value => {
            plugin.settings.hideDrawingPreviewImages = value;
        }
    );

    addInfoSetting(drawingPreviewsGroup.addSetting, ['nn-setting-info-container', 'nn-setting-info-list'], descEl => {
        const info = strings.settings.items.drawingIntegrationInfo;
        descEl.createDiv({ text: info.intro });
        const listEl = descEl.createEl('ol');
        info.items.forEach(item => {
            const itemEl = listEl.createEl('li');
            appendSettingText(itemEl, item);
        });
    });
}
