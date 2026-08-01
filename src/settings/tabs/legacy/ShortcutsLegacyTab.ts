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

import { DropdownComponent, Setting } from 'obsidian';
import { strings } from '../../../i18n';
import { DEFAULT_SETTINGS } from '../../defaultSettings';
import { wireToggleSettingWithDependentSection } from '../../dependentSettings';
import { createSettingGroupFactory } from '../../settingGroups';
import { isRecentNotesHideMode, isShortcutBadgeDisplayMode } from '../../types';
import type { SettingsTabContext } from '../SettingsTabContext';
import { renderSliderSetting } from '../SliderSetting';

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderShortcutsTab(context: SettingsTabContext): void {
    const { containerEl, plugin, addToggleSetting } = context;
    const createGroup = createSettingGroupFactory(containerEl);
    const sharedGroup = createGroup(undefined);
    const shortcutsGroup = createGroup(strings.navigationPane.shortcutsHeader);
    const recentFilesGroup = createGroup(strings.navigationPane.recentFilesHeader);

    addToggleSetting(
        sharedGroup.addSetting,
        strings.settings.items.showSectionIcons.name,
        strings.settings.items.showSectionIcons.desc,
        () => plugin.settings.showSectionIcons,
        value => {
            plugin.settings.showSectionIcons = value;
        }
    );

    const showShortcutsSetting = shortcutsGroup.addSetting(setting => {
        setting.setName(strings.settings.items.showShortcuts.name).setDesc(strings.settings.items.showShortcuts.desc);
    });

    const shortcutsDependentSettings = wireToggleSettingWithDependentSection(
        showShortcutsSetting,
        () => plugin.settings.showShortcuts,
        async value => {
            plugin.settings.showShortcuts = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    new Setting(shortcutsDependentSettings)
        .setName(strings.settings.items.shortcutBadgeDisplay.name)
        .setDesc(strings.settings.items.shortcutBadgeDisplay.desc)
        .addDropdown((dropdown: DropdownComponent) =>
            dropdown
                .addOption('index', strings.settings.items.shortcutBadgeDisplay.options.index)
                .addOption('count', strings.settings.items.shortcutBadgeDisplay.options.count)
                .addOption('none', strings.settings.items.shortcutBadgeDisplay.options.none)
                .setValue(plugin.settings.shortcutBadgeDisplay)
                .onChange(async value => {
                    if (!isShortcutBadgeDisplayMode(value)) {
                        return;
                    }
                    plugin.settings.shortcutBadgeDisplay = value;
                    await plugin.saveSettingsAndUpdate();
                })
        );

    new Setting(shortcutsDependentSettings)
        .setName(strings.settings.items.skipAutoScroll.name)
        .setDesc(strings.settings.items.skipAutoScroll.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.skipAutoScroll).onChange(async value => {
                plugin.settings.skipAutoScroll = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const showRecentNotesSetting = recentFilesGroup.addSetting(setting => {
        setting.setName(strings.settings.items.showRecentNotes.name).setDesc(strings.settings.items.showRecentNotes.desc);
    });

    const recentNotesDependentSettings = wireToggleSettingWithDependentSection(
        showRecentNotesSetting,
        () => plugin.settings.showRecentNotes,
        async value => {
            plugin.settings.showRecentNotes = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    new Setting(recentNotesDependentSettings)
        .setName(strings.settings.items.hideRecentNotes.name)
        .setDesc(strings.settings.items.hideRecentNotes.desc)
        .addDropdown((dropdown: DropdownComponent) =>
            dropdown
                .addOption('none', strings.settings.items.hideRecentNotes.options.none)
                .addOption('folder-notes', strings.settings.items.hideRecentNotes.options.folderNotes)
                .setValue(plugin.settings.hideRecentNotes)
                .onChange(async value => {
                    if (!isRecentNotesHideMode(value)) {
                        return;
                    }
                    plugin.settings.hideRecentNotes = value;
                    await plugin.saveSettingsAndUpdate();
                })
        );

    new Setting(recentNotesDependentSettings)
        .setName(strings.settings.items.pinRecentNotesWithShortcuts.name)
        .setDesc(strings.settings.items.pinRecentNotesWithShortcuts.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.pinRecentNotesWithShortcuts).onChange(async value => {
                plugin.settings.pinRecentNotesWithShortcuts = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    renderRecentNotesCountSetting(new Setting(recentNotesDependentSettings), context);
}

function renderRecentNotesCountSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    renderSliderSetting(setting, {
        name: strings.settings.items.recentNotesCount.name,
        desc: strings.settings.items.recentNotesCount.desc,
        value: plugin.settings.recentNotesCount,
        defaultValue: DEFAULT_SETTINGS.recentNotesCount,
        min: 1,
        max: 50,
        step: 1,
        onChange: async value => {
            plugin.settings.recentNotesCount = value;
            plugin.applyRecentNotesLimit();
            await plugin.saveSettingsAndUpdate();
        }
    });
}
