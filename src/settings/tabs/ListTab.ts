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
import type { SettingDefinitionItem } from 'obsidian';
import { strings } from '../../i18n';
import { DEFAULT_SETTINGS } from '../defaultSettings';
import { createDropdownDefinition, createGroupDefinition, createRenderDefinition, createToggleDefinition } from '../nativeSettingControls';
import { MANUAL_SORT_NEW_NOTE_PLACEMENT_OPTIONS, PROPERTY_SORT_SECONDARY_OPTIONS, SORT_OPTIONS } from '../types';
import type { SettingsTabContext } from './SettingsTabContext';
import { runAsyncAction } from '../../utils/async';
import { addSettingSyncModeToggle } from '../syncModeToggle';
import { pruneUnavailablePropertySortOverrides } from '../../utils/sortUtils';
import { getManualSortGroupHeaderPropertyKey, isValidManualSortPropertyKey, normalizeManualSortPropertyKey } from '../../utils/manualSort';
import { formatPixelSliderValue, renderSliderSetting } from './SliderSetting';

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

/** Builds native 1.13 setting definitions for list pane settings. */
export function createListPaneSettingDefinitions(context: SettingsTabContext): SettingDefinitionItem[] {
    const { plugin } = context;
    const items: SettingDefinitionItem[] = [
        createGroupDefinition(undefined, [
            createRenderDefinition({
                name: strings.settings.items.includeDescendantNotes.name,
                desc: strings.settings.items.includeDescendantNotes.desc,
                render: setting => renderIncludeDescendantNotesSetting(setting, context)
            }),
            createDropdownDefinition('defaultFolderSort', {
                name: strings.settings.items.sortNotesBy.name,
                desc: strings.settings.items.sortNotesBy.desc,
                aliases: Object.values(strings.settings.items.sortNotesBy.options),
                options: createDefaultFolderSortOptions()
            }),
            createDropdownDefinition('noteGrouping', {
                name: strings.settings.items.groupNotes.name,
                desc: strings.settings.items.groupNotes.desc,
                aliases: Object.values(strings.settings.items.groupNotes.options),
                options: {
                    custom: strings.settings.items.groupNotes.options.custom,
                    date: strings.settings.items.groupNotes.options.date,
                    folder: strings.settings.items.groupNotes.options.folder
                }
            }),
            createToggleDefinition('showCurrentFolderFilesAtBottom', {
                name: strings.settings.items.showCurrentFolderFilesAtBottom.name,
                desc: strings.settings.items.showCurrentFolderFilesAtBottom.desc
            })
        ]),
        createGroupDefinition(strings.settings.groups.list.groupHeaders, [
            createToggleDefinition('stickyGroupHeaders', {
                name: strings.settings.items.stickyGroupHeaders.name,
                desc: strings.settings.items.stickyGroupHeaders.desc
            }),
            createToggleDefinition('showFolderGroupPaths', {
                name: strings.settings.items.showFolderGroupPaths.name,
                desc: strings.settings.items.showFolderGroupPaths.desc
            }),
            createToggleDefinition('showGroupHeaderItemCounts', {
                name: strings.settings.items.showGroupHeaderItemCounts.name,
                desc: strings.settings.items.showGroupHeaderItemCounts.desc
            }),
            createRenderDefinition({
                name: strings.settings.items.manualSortGroupHeaderProperty.name,
                desc: strings.settings.items.manualSortGroupHeaderProperty.desc,
                render: setting => renderManualSortGroupHeaderPropertySetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.groupHeadersInstructions.intro,
                searchable: false,
                render: setting => renderInstructionSetting(setting, strings.settings.items.groupHeadersInstructions)
            })
        ]),
        createGroupDefinition(strings.settings.groups.list.propertySort, [
            createRenderDefinition({
                name: strings.settings.items.propertySortKey.name,
                desc: strings.settings.items.propertySortKey.desc,
                aliases: [strings.settings.items.propertySortKey.placeholder],
                render: setting => renderPropertySortKeySetting(setting, context)
            }),
            createDropdownDefinition('propertySortSecondary', {
                name: strings.settings.items.propertySortSecondary.name,
                desc: strings.settings.items.propertySortSecondary.desc,
                aliases: Object.values(strings.settings.items.propertySortSecondary.options),
                visible: () => plugin.settings.propertySortKey.trim().length > 0,
                options: createPropertySortSecondaryOptions()
            }),
            createRenderDefinition({
                name: strings.settings.items.propertySortInstructions.intro,
                searchable: false,
                render: setting => renderInfoTextSetting(setting, strings.settings.items.propertySortInstructions.intro)
            })
        ]),
        createGroupDefinition(strings.settings.groups.list.manualSort, [
            createRenderDefinition({
                name: strings.settings.items.manualSortPropertyKey.name,
                desc: strings.settings.items.manualSortPropertyKey.desc,
                aliases: [DEFAULT_SETTINGS.manualSortPropertyKey],
                render: setting => renderManualSortPropertyKeySetting(setting, context)
            }),
            createDropdownDefinition('manualSortNewNotePlacement', {
                name: strings.settings.items.manualSortNewNotePlacement.name,
                desc: strings.settings.items.manualSortNewNotePlacement.desc,
                aliases: Object.values(strings.settings.items.manualSortNewNotePlacement.options),
                options: createManualSortNewNotePlacementOptions()
            }),
            createToggleDefinition('confirmBeforeManualSort', {
                name: strings.settings.items.confirmBeforeManualSort.name,
                desc: strings.settings.items.confirmBeforeManualSort.desc
            }),
            createRenderDefinition({
                name: strings.settings.items.manualSortInstructions.intro,
                searchable: false,
                render: setting => renderInstructionSetting(setting, strings.settings.items.manualSortInstructions)
            })
        ]),
        createGroupDefinition(strings.settings.groups.list.pinnedNotes, [
            createToggleDefinition('filterPinnedByFolder', {
                name: strings.settings.items.limitPinnedToCurrentFolder.name,
                desc: strings.settings.items.limitPinnedToCurrentFolder.desc
            })
        ]),
        createListAppearanceDefinitionGroup(context),
        createGroupDefinition(strings.settings.groups.general.behavior, [
            createToggleDefinition('revealFileOnListChanges', {
                name: strings.settings.items.revealFileOnListChanges.name,
                desc: strings.settings.items.revealFileOnListChanges.desc
            }),
            ...(Platform.isMobile
                ? []
                : [
                      createRenderDefinition({
                          name: strings.settings.items.showQuickActions.name,
                          desc: strings.settings.items.showQuickActions.desc,
                          aliases: [
                              strings.contextMenu.file.revealInFolder,
                              strings.contextMenu.file.addTag,
                              strings.shortcuts.add,
                              strings.contextMenu.file.pinNote,
                              strings.contextMenu.file.openInNewTab
                          ],
                          render: setting => renderQuickActionsSetting(setting, context)
                      })
                  ])
        ]),
        createGroupDefinition(strings.settings.groups.list.drawingPreviews, [
            createToggleDefinition('hideDrawingPreviewImages', {
                name: strings.settings.items.hideDrawingPreviewImages.name,
                desc: strings.settings.items.hideDrawingPreviewImages.desc
            }),
            createRenderDefinition({
                name: strings.settings.items.drawingIntegrationInfo.intro,
                searchable: false,
                render: setting => renderInstructionSetting(setting, strings.settings.items.drawingIntegrationInfo)
            })
        ])
    ];

    return items;
}

function createListAppearanceDefinitionGroup(context: SettingsTabContext): SettingDefinitionItem {
    const items: NonNullable<ReturnType<typeof createGroupDefinition>['items']> = [];

    if (!Platform.isMobile) {
        items.push(
            createDropdownDefinition('listPaneTitle', {
                name: strings.settings.items.listPaneTitle.name,
                desc: strings.settings.items.listPaneTitle.desc,
                aliases: Object.values(strings.settings.items.listPaneTitle.options),
                options: {
                    header: strings.settings.items.listPaneTitle.options.header,
                    list: strings.settings.items.listPaneTitle.options.list,
                    hidden: strings.settings.items.listPaneTitle.options.hidden
                }
            })
        );
    }

    items.push(
        createDropdownDefinition('defaultListMode', {
            name: strings.settings.items.defaultListMode.name,
            desc: strings.settings.items.defaultListMode.desc,
            aliases: Object.values(strings.settings.items.defaultListMode.options),
            options: {
                standard: strings.settings.items.defaultListMode.options.standard,
                compact: strings.settings.items.defaultListMode.options.compact
            }
        }),
        createRenderDefinition({
            name: strings.settings.items.compactItemHeight.name,
            desc: strings.settings.items.compactItemHeight.desc,
            aliases: [strings.settings.items.compactItemHeight.resetTooltip],
            render: setting => renderCompactItemHeightSetting(setting, context)
        }),
        createRenderDefinition({
            name: strings.settings.items.compactItemHeightScaleText.name,
            desc: strings.settings.items.compactItemHeightScaleText.desc,
            render: setting => renderCompactItemHeightScaleTextSetting(setting, context)
        }),
        createToggleDefinition('showSelectedNavigationPills', {
            name: strings.settings.items.showSelectedNavigationPills.name,
            desc: strings.settings.items.showSelectedNavigationPills.desc
        })
    );

    return createGroupDefinition(strings.settings.groups.list.display, items);
}

function createDefaultFolderSortOptions(): Record<string, string> {
    const options: Record<string, string> = {};
    SORT_OPTIONS.forEach(option => {
        if (option === 'property-asc' || option === 'property-desc') {
            return;
        }
        options[option] = strings.settings.items.sortNotesBy.options[option];
    });
    return options;
}

function createPropertySortSecondaryOptions(): Record<string, string> {
    const options: Record<string, string> = {};
    PROPERTY_SORT_SECONDARY_OPTIONS.forEach(option => {
        options[option] = strings.settings.items.propertySortSecondary.options[option];
    });
    return options;
}

function createManualSortNewNotePlacementOptions(): Record<string, string> {
    const options: Record<string, string> = {};
    MANUAL_SORT_NEW_NOTE_PLACEMENT_OPTIONS.forEach(option => {
        options[option] = strings.settings.items.manualSortNewNotePlacement.options[option];
    });
    return options;
}

function renderIncludeDescendantNotesSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.includeDescendantNotes.name)
        .setDesc(strings.settings.items.includeDescendantNotes.desc)
        .addToggle(toggle => {
            const preferences = plugin.getUXPreferences();
            toggle.setValue(preferences.includeDescendantNotes).onChange(value => {
                plugin.setIncludeDescendantNotes(value);
            });
        });

    addSettingSyncModeToggle({ setting, plugin, settingId: 'includeDescendantNotes' });
}

function renderCompactItemHeightSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

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

    addSettingSyncModeToggle({ setting, plugin, settingId: 'compactItemHeight' });
}

function renderCompactItemHeightScaleTextSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.compactItemHeightScaleText.name)
        .setDesc(strings.settings.items.compactItemHeightScaleText.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.compactItemHeightScaleText).onChange(value => {
                plugin.setCompactItemHeightScaleText(value);
            })
        );

    addSettingSyncModeToggle({ setting, plugin, settingId: 'compactItemHeightScaleText' });
}

function renderManualSortGroupHeaderPropertySetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

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
}

function renderPropertySortKeySetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

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
                context.refreshSettingsDomState();
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
}

function renderManualSortPropertyKeySetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

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
}

function renderInstructionSetting(setting: Setting, info: { intro: string; items: string[] }): void {
    setting.setName('').setDesc('');
    setting.settingEl.addClass('nn-setting-info-container');
    setting.settingEl.addClass('nn-setting-info-list');
    setting.descEl.empty();
    setting.descEl.createDiv({ text: info.intro });
    const listEl = setting.descEl.createEl('ol');
    info.items.forEach(item => {
        const itemEl = listEl.createEl('li');
        appendStrongText(itemEl, item);
    });
}

function renderInfoTextSetting(setting: Setting, text: string): void {
    setting.setName('').setDesc('');
    setting.settingEl.addClass('nn-setting-info-container');
    setting.descEl.empty();
    setting.descEl.createDiv({ text });
}

function renderQuickActionsSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting.setName(strings.settings.items.showQuickActions.name).setDesc(strings.settings.items.showQuickActions.desc);
    setting.controlEl.addClass('nn-quick-actions-control');

    const quickActionsButtonsEl = setting.controlEl.createDiv({
        cls: ['nn-toolbar-visibility-grid', 'nn-quick-actions-buttons']
    });

    const updateButtonsDisabledState = (enabled: boolean) => {
        quickActionsButtonsEl.classList.toggle('is-disabled', !enabled);
        quickActionsButtonsEl.querySelectorAll('button').forEach(button => {
            button.toggleAttribute('disabled', !enabled);
        });
    };

    const quickActionButtons: QuickActionToggleConfig[] = [
        { key: 'quickActionRevealInFolder', icon: 'lucide-folder-search', label: strings.contextMenu.file.revealInFolder },
        { key: 'quickActionAddTag', icon: 'lucide-tag', label: strings.contextMenu.file.addTag },
        { key: 'quickActionAddToShortcuts', icon: 'lucide-star', label: strings.shortcuts.add },
        { key: 'quickActionPinNote', icon: 'lucide-pin', label: strings.contextMenu.file.pinNote },
        { key: 'quickActionOpenInNewTab', icon: 'lucide-file-plus', label: strings.contextMenu.file.openInNewTab }
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

    setting.addToggle(toggle => {
        toggle.setValue(plugin.settings.showQuickActions).onChange(async value => {
            plugin.settings.showQuickActions = value;
            updateButtonsDisabledState(value);
            await plugin.saveSettingsAndUpdate();
        });
        toggle.toggleEl.addClass('nn-quick-actions-master-toggle');
    });

    updateButtonsDisabledState(plugin.settings.showQuickActions);
}
