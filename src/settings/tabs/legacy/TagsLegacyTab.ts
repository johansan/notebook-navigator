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

import { Setting } from 'obsidian';
import { strings } from '../../../i18n';
import { wireToggleSettingWithDependentSection } from '../../dependentSettings';
import { createSettingGroupFactory } from '../../settingGroups';
import { addSettingSyncModeToggle } from '../../syncModeToggle';
import { isTagSortOrder } from '../../types';
import type { SettingsTabContext } from '../SettingsTabContext';

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderTagsTab(context: SettingsTabContext, heading?: string): void {
    const { containerEl, plugin } = context;
    const createGroup = createSettingGroupFactory(containerEl);

    const tagsGroup = createGroup(heading);

    const showTagsSetting = tagsGroup.addSetting(setting => {
        setting.setName(strings.settings.items.showTags.name).setDesc(strings.settings.items.showTags.desc);
    });
    const tagDependentSettingsEl = wireToggleSettingWithDependentSection(
        showTagsSetting,
        () => plugin.settings.showTags,
        async value => {
            plugin.settings.showTags = value;
            await plugin.saveSettingsAndUpdate();
            context.notifyShowTagsVisibility(value);
        }
    );

    new Setting(tagDependentSettingsEl)
        .setName(strings.settings.items.showTagIcons.name)
        .setDesc(strings.settings.items.showTagIcons.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showTagIcons).onChange(async value => {
                plugin.settings.showTagIcons = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(tagDependentSettingsEl)
        .setName(strings.settings.items.inheritTagColors.name)
        .setDesc(strings.settings.items.inheritTagColors.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.inheritTagColors).onChange(async value => {
                plugin.settings.inheritTagColors = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const tagSortOrderSetting = new Setting(tagDependentSettingsEl)
        .setName(strings.settings.items.tagSortOrder.name)
        .setDesc(strings.settings.items.tagSortOrder.desc)
        .addDropdown(dropdown => {
            const frequencyAscLabel = `${strings.settings.items.tagSortOrder.options.frequency} (${strings.settings.items.tagSortOrder.options.lowToHigh})`;
            const frequencyDescLabel = `${strings.settings.items.tagSortOrder.options.frequency} (${strings.settings.items.tagSortOrder.options.highToLow})`;

            dropdown
                .addOption('alpha-asc', strings.settings.items.tagSortOrder.options.alphaAsc)
                .addOption('alpha-desc', strings.settings.items.tagSortOrder.options.alphaDesc)
                .addOption('frequency-asc', frequencyAscLabel)
                .addOption('frequency-desc', frequencyDescLabel)
                .setValue(plugin.getTagSortOrder())
                .onChange(value => {
                    if (!isTagSortOrder(value)) {
                        return;
                    }
                    plugin.setTagSortOrder(value);
                });
        });

    addSettingSyncModeToggle({ setting: tagSortOrderSetting, plugin, settingId: 'tagSortOrder' });

    new Setting(tagDependentSettingsEl)
        .setName(strings.settings.items.showTagsFolder.name)
        .setDesc(strings.settings.items.showTagsFolder.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showAllTagsFolder).onChange(async value => {
                plugin.settings.showAllTagsFolder = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(tagDependentSettingsEl)
        .setName(strings.settings.items.showUntaggedNotes.name)
        .setDesc(strings.settings.items.showUntaggedNotes.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showUntagged).onChange(async value => {
                plugin.settings.showUntagged = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(tagDependentSettingsEl)
        .setName(strings.settings.items.filterTagsBySelection.name)
        .setDesc(strings.settings.items.filterTagsBySelection.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.scopeTagsToCurrentContext).onChange(async value => {
                plugin.settings.scopeTagsToCurrentContext = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(tagDependentSettingsEl)
        .setName(strings.settings.items.keepEmptyTagsProperty.name)
        .setDesc(strings.settings.items.keepEmptyTagsProperty.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.keepEmptyTagsProperty).onChange(async value => {
                plugin.settings.keepEmptyTagsProperty = value;
                await plugin.saveSettingsAndUpdate();
            })
        );
}
