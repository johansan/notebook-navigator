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

/** Builds native 1.13 setting definitions for property settings. */
export function createPropertiesSettingDefinitions(context: SettingsTabContext, heading?: string): SettingDefinitionItem[] {
    const { plugin } = context;

    return [
        createGroupDefinition(heading, [
            createToggleDefinition('showProperties', {
                name: strings.settings.items.showProperties.name,
                desc: strings.settings.items.showProperties.desc
            }),
            createToggleDefinition('showPropertyIcons', {
                name: strings.settings.items.showPropertyIcons.name,
                desc: strings.settings.items.showPropertyIcons.desc,
                visible: () => plugin.settings.showProperties
            }),
            createToggleDefinition('inheritPropertyColors', {
                name: strings.settings.items.inheritPropertyColors.name,
                desc: strings.settings.items.inheritPropertyColors.desc,
                visible: () => plugin.settings.showProperties
            }),
            createRenderDefinition({
                name: strings.settings.items.propertySortOrder.name,
                desc: strings.settings.items.propertySortOrder.desc,
                aliases: Object.values(strings.settings.items.propertySortOrder.options),
                visible: () => plugin.settings.showProperties,
                render: setting => renderPropertySortOrderSetting(setting, context)
            }),
            createToggleDefinition('showAllPropertiesFolder', {
                name: strings.settings.items.showPropertiesFolder.name,
                desc: strings.settings.items.showPropertiesFolder.desc,
                visible: () => plugin.settings.showProperties
            }),
            createToggleDefinition('scopePropertiesToCurrentContext', {
                name: strings.settings.items.filterPropertiesBySelection.name,
                desc: strings.settings.items.filterPropertiesBySelection.desc,
                visible: () => plugin.settings.showProperties
            }),
            createRenderDefinition({
                name: strings.settings.items.showProperties.propertyKeysInfoLinkText,
                searchable: false,
                visible: () => plugin.settings.showProperties,
                render: setting => renderPropertyKeysInfoSetting(setting)
            })
        ])
    ];
}

function renderPropertySortOrderSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting.setName(strings.settings.items.propertySortOrder.name).setDesc(strings.settings.items.propertySortOrder.desc);
    setting.addDropdown(dropdown => {
        const frequencyAscLabel = `${strings.settings.items.propertySortOrder.options.frequency} (${strings.settings.items.propertySortOrder.options.lowToHigh})`;
        const frequencyDescLabel = `${strings.settings.items.propertySortOrder.options.frequency} (${strings.settings.items.propertySortOrder.options.highToLow})`;

        dropdown
            .addOption('alpha-asc', strings.settings.items.propertySortOrder.options.alphaAsc)
            .addOption('alpha-desc', strings.settings.items.propertySortOrder.options.alphaDesc)
            .addOption('frequency-asc', frequencyAscLabel)
            .addOption('frequency-desc', frequencyDescLabel)
            .setValue(plugin.getPropertySortOrder())
            .onChange(value => {
                if (!isTagSortOrder(value)) {
                    return;
                }
                plugin.setPropertySortOrder(value);
            });
    });

    addSettingSyncModeToggle({ setting, plugin, settingId: 'propertySortOrder' });
}

function renderPropertyKeysInfoSetting(setting: Setting): void {
    setting.setName('').setDesc('');
    setting.settingEl.addClass('nn-setting-info-container');
    setting.settingEl.addClass('nn-setting-property-keys-info');
    setting.setDesc(
        `${strings.settings.items.showProperties.propertyKeysInfoPrefix}${strings.settings.items.showProperties.propertyKeysInfoLinkText}${strings.settings.items.showProperties.propertyKeysInfoSuffix}`
    );
}
