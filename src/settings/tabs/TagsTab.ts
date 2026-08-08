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
import type { SettingDefinitionItem } from 'obsidian';
import { strings } from '../../i18n';
import { isTagSortOrder } from '../types';
import type { SettingsTabContext } from './SettingsTabContext';
import { createGroupDefinition, createRenderDefinition, createToggleDefinition } from '../nativeSettingControls';
import { addSettingSyncModeToggle } from '../syncModeToggle';

/** Builds native 1.13 setting definitions for tag settings. */
export function createTagsSettingDefinitions(context: SettingsTabContext, heading?: string): SettingDefinitionItem[] {
    const { plugin } = context;

    return [
        createGroupDefinition(heading, [
            createToggleDefinition('showTags', {
                name: strings.settings.items.showTags.name,
                desc: strings.settings.items.showTags.desc
            }),
            createToggleDefinition('showTagIcons', {
                name: strings.settings.items.showTagIcons.name,
                desc: strings.settings.items.showTagIcons.desc,
                visible: () => plugin.settings.showTags
            }),
            createToggleDefinition('inheritTagColors', {
                name: strings.settings.items.inheritTagColors.name,
                desc: strings.settings.items.inheritTagColors.desc,
                visible: () => plugin.settings.showTags
            }),
            createRenderDefinition({
                name: strings.settings.items.tagSortOrder.name,
                desc: strings.settings.items.tagSortOrder.desc,
                aliases: Object.values(strings.settings.items.tagSortOrder.options),
                visible: () => plugin.settings.showTags,
                render: setting => renderTagSortOrderSetting(setting, context)
            }),
            createToggleDefinition('showAllTagsFolder', {
                name: strings.settings.items.showTagsFolder.name,
                desc: strings.settings.items.showTagsFolder.desc,
                visible: () => plugin.settings.showTags
            }),
            createToggleDefinition('showUntagged', {
                name: strings.settings.items.showUntaggedNotes.name,
                desc: strings.settings.items.showUntaggedNotes.desc,
                visible: () => plugin.settings.showTags
            }),
            createToggleDefinition('scopeTagsToCurrentContext', {
                name: strings.settings.items.filterTagsBySelection.name,
                desc: strings.settings.items.filterTagsBySelection.desc,
                visible: () => plugin.settings.showTags
            }),
            createToggleDefinition('keepEmptyTagsProperty', {
                name: strings.settings.items.keepEmptyTagsProperty.name,
                desc: strings.settings.items.keepEmptyTagsProperty.desc,
                visible: () => plugin.settings.showTags
            })
        ])
    ];
}

function renderTagSortOrderSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting.setName(strings.settings.items.tagSortOrder.name).setDesc(strings.settings.items.tagSortOrder.desc);
    setting.addDropdown(dropdown => {
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

    addSettingSyncModeToggle({ setting, plugin, settingId: 'tagSortOrder' });
}
