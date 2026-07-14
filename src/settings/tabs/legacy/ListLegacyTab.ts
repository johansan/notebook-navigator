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

import { DropdownComponent, Platform, Setting, setIcon } from 'obsidian';
import { strings } from '../../../i18n';
import { DEFAULT_SETTINGS } from '../../defaultSettings';
import {
    isListDisplayMode,
    isListNoteGroupingOption,
    isListPaneTitleOption,
    isManualSortNewNotePlacement,
    isPropertySortSecondaryOption,
    isSortOption
} from '../../types';
import { MANUAL_SORT_NEW_NOTE_PLACEMENT_OPTIONS, PROPERTY_SORT_SECONDARY_OPTIONS, SORT_OPTIONS } from '../../types';
import type { SettingsTabContext } from '../SettingsTabContext';
import { runAsyncAction } from '../../../utils/async';
import { createSettingGroupFactory } from '../../settingGroups';
import { addSettingSyncModeToggle } from '../../syncModeToggle';
import { createDependentSettingsSection, setElementVisible } from '../../dependentSettings';
import { pruneUnavailablePropertySortOverrides } from '../../../utils/sortUtils';
import {
    getManualSortGroupHeaderPropertyKey,
    isValidManualSortPropertyKey,
    normalizeManualSortPropertyKey
} from '../../../utils/manualSort';
import { formatPixelSliderValue, renderSliderSetting } from '../SliderSetting';

type QuickActionSettingKey =
    'quickActionRevealInFolder' | 'quickActionAddTag' | 'quickActionAddToShortcuts' | 'quickActionPinNote' | 'quickActionOpenInNewTab';

interface QuickActionToggleConfig {
    key: QuickActionSettingKey;
    icon: string;
    label: string;
}

const STRONG_TEXT_PATTERN = /\*\*([^*]+)\*\*/g;

function appendStrongText(container: HTMLElement, value: string): void {
    let currentIndex = 0;

    for (const match of value.matchAll(STRONG_TEXT_PATTERN)) {
        const matchText = match[0];
        const strongText = match[1];
        if (!matchText || strongText === undefined) {
            continue;
        }

        const matchIndex = match.index ?? -1;
        if (matchIndex === -1) {
            break;
        }

        if (matchIndex > currentIndex) {
            container.appendText(value.slice(currentIndex, matchIndex));
        }

        container.createEl('strong', { text: strongText });
        currentIndex = matchIndex + matchText.length;
    }

    if (currentIndex < value.length) {
        container.appendText(value.slice(currentIndex));
    }
}

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderListPaneTab(context: SettingsTabContext): void {
    const { containerEl, plugin, addToggleSetting, addInfoSetting } = context;
    const createGroup = createSettingGroupFactory(containerEl);

    const renderAppearanceGroup = (): void => {
        const appearanceGroup = createGroup(strings.settings.groups.list.display);

        if (!Platform.isMobile) {
            appearanceGroup.addSetting(setting => {
                setting
                    .setName(strings.settings.items.listPaneTitle.name)
                    .setDesc(strings.settings.items.listPaneTitle.desc)
                    .addDropdown(dropdown =>
                        dropdown
                            .addOption('header', strings.settings.items.listPaneTitle.options.header)
                            .addOption('list', strings.settings.items.listPaneTitle.options.list)
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
            strings.settings.items.showSelectedNavigationPills.name,
            strings.settings.items.showSelectedNavigationPills.desc,
            () => plugin.settings.showSelectedNavigationPills,
            value => {
                plugin.settings.showSelectedNavigationPills = value;
            }
        );
    };

    const organizationGroup = createGroup(undefined);

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

    organizationGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.sortNotesBy.name)
            .setDesc(strings.settings.items.sortNotesBy.desc)
            .addDropdown((dropdown: DropdownComponent) => {
                SORT_OPTIONS.forEach(option => {
                    if (option === 'property-asc' || option === 'property-desc') {
                        return;
                    }
                    dropdown.addOption(option, strings.settings.items.sortNotesBy.options[option]);
                });
                const defaultFolderSort =
                    plugin.settings.defaultFolderSort === 'property-asc' || plugin.settings.defaultFolderSort === 'property-desc'
                        ? DEFAULT_SETTINGS.defaultFolderSort
                        : plugin.settings.defaultFolderSort;
                return dropdown.setValue(defaultFolderSort).onChange(async value => {
                    if (!isSortOption(value)) {
                        return;
                    }
                    plugin.settings.defaultFolderSort = value;
                    await plugin.saveSettingsAndUpdate();
                });
            });
    });

    organizationGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.groupNotes.name)
            .setDesc(strings.settings.items.groupNotes.desc)
            .addDropdown(dropdown =>
                dropdown
                    .addOption('custom', strings.settings.items.groupNotes.options.custom)
                    .addOption('date', strings.settings.items.groupNotes.options.date)
                    .addOption('folder', strings.settings.items.groupNotes.options.folder)
                    .setValue(plugin.settings.noteGrouping)
                    .onChange(async value => {
                        if (!isListNoteGroupingOption(value)) {
                            return;
                        }
                        plugin.settings.noteGrouping = value;
                        await plugin.saveSettingsAndUpdate();
                    })
            );
    });

    addToggleSetting(
        organizationGroup.addSetting,
        strings.settings.items.showCurrentFolderFilesAtBottom.name,
        strings.settings.items.showCurrentFolderFilesAtBottom.desc,
        () => plugin.settings.showCurrentFolderFilesAtBottom,
        value => {
            plugin.settings.showCurrentFolderFilesAtBottom = value;
        }
    );

    const groupHeadersGroup = createGroup(strings.settings.groups.list.groupHeaders);

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
        strings.settings.items.showFolderGroupPaths.name,
        strings.settings.items.showFolderGroupPaths.desc,
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
            .setName(strings.settings.items.manualSortGroupHeaderProperty.name)
            .setDesc(strings.settings.items.manualSortGroupHeaderProperty.desc)
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
            appendStrongText(itemEl, item);
        });
    });

    const propertySortGroup = createGroup(strings.settings.groups.list.propertySort);
    let refreshPropertySortSecondaryVisibility = (): void => {};

    const propertySortKeySetting = propertySortGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.propertySortKey.name)
            .setDesc(strings.settings.items.propertySortKey.desc)
            .addText(text => {
                const commitPropertySortKey = async (): Promise<void> => {
                    const value = text.getValue();
                    if (plugin.settings.propertySortKey === value) {
                        return;
                    }
                    plugin.settings.propertySortKey = value;
                    pruneUnavailablePropertySortOverrides(plugin.settings);
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

                return text.setPlaceholder(strings.settings.items.propertySortKey.placeholder).setValue(plugin.settings.propertySortKey);
            });
    });

    const propertySortSecondarySettingsEl = createDependentSettingsSection(propertySortKeySetting);
    refreshPropertySortSecondaryVisibility = (): void => {
        setElementVisible(propertySortSecondarySettingsEl, plugin.settings.propertySortKey.trim().length > 0);
    };

    new Setting(propertySortSecondarySettingsEl)
        .setName(strings.settings.items.propertySortSecondary.name)
        .setDesc(strings.settings.items.propertySortSecondary.desc)
        .addDropdown(dropdown => {
            PROPERTY_SORT_SECONDARY_OPTIONS.forEach(option => {
                dropdown.addOption(option, strings.settings.items.propertySortSecondary.options[option]);
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

    addInfoSetting(propertySortGroup.addSetting, 'nn-setting-info-container', descEl => {
        descEl.createDiv({ text: strings.settings.items.propertySortInstructions.intro });
    });

    const manualSortGroup = createGroup(strings.settings.groups.list.manualSort);

    manualSortGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.manualSortPropertyKey.name)
            .setDesc(strings.settings.items.manualSortPropertyKey.desc)
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
                    dropdown.addOption(option, strings.settings.items.manualSortNewNotePlacement.options[option]);
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
            appendStrongText(itemEl, item);
        });
    });

    const pinnedNotesGroup = createGroup(strings.settings.groups.list.pinnedNotes);

    addToggleSetting(
        pinnedNotesGroup.addSetting,
        strings.settings.items.limitPinnedToCurrentFolder.name,
        strings.settings.items.limitPinnedToCurrentFolder.desc,
        () => plugin.settings.filterPinnedByFolder,
        value => {
            plugin.settings.filterPinnedByFolder = value;
        }
    );

    renderAppearanceGroup();

    const behaviorGroup = createGroup(strings.settings.groups.general.behavior);

    addToggleSetting(
        behaviorGroup.addSetting,
        strings.settings.items.revealFileOnListChanges.name,
        strings.settings.items.revealFileOnListChanges.desc,
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

    const drawingPreviewsGroup = createGroup(strings.settings.groups.list.drawingPreviews);

    addToggleSetting(
        drawingPreviewsGroup.addSetting,
        strings.settings.items.hideDrawingPreviewImages.name,
        strings.settings.items.hideDrawingPreviewImages.desc,
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
            appendStrongText(itemEl, item);
        });
    });
}
