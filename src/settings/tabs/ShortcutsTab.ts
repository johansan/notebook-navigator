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

import type { SettingDefinitionItem } from 'obsidian';
import type { Setting } from 'obsidian';
import { strings } from '../../i18n';
import { DEFAULT_SETTINGS } from '../defaultSettings';
import type { SettingsTabContext } from './SettingsTabContext';
import { createDropdownDefinition, createGroupDefinition, createRenderDefinition, createToggleDefinition } from '../nativeSettingControls';
import { renderSliderSetting } from './SliderSetting';

/** Builds native 1.13 setting definitions for shortcut and recent note settings. */
export function createShortcutsSettingDefinitions(context: SettingsTabContext): SettingDefinitionItem[] {
    const { plugin } = context;

    return [
        createGroupDefinition(undefined, [
            createToggleDefinition('showSectionIcons', {
                name: strings.settings.items.showSectionIcons.name,
                desc: strings.settings.items.showSectionIcons.desc
            })
        ]),
        createGroupDefinition(strings.navigationPane.shortcutsHeader, [
            createToggleDefinition('showShortcuts', {
                name: strings.settings.items.showShortcuts.name,
                desc: strings.settings.items.showShortcuts.desc
            }),
            createDropdownDefinition('shortcutBadgeDisplay', {
                name: strings.settings.items.shortcutBadgeDisplay.name,
                desc: strings.settings.items.shortcutBadgeDisplay.desc,
                aliases: Object.values(strings.settings.items.shortcutBadgeDisplay.options),
                visible: () => plugin.settings.showShortcuts,
                options: {
                    index: strings.settings.items.shortcutBadgeDisplay.options.index,
                    count: strings.settings.items.shortcutBadgeDisplay.options.count,
                    none: strings.settings.items.shortcutBadgeDisplay.options.none
                }
            }),
            createToggleDefinition('skipAutoScroll', {
                name: strings.settings.items.skipAutoScroll.name,
                desc: strings.settings.items.skipAutoScroll.desc,
                visible: () => plugin.settings.showShortcuts
            })
        ]),
        createGroupDefinition(strings.navigationPane.recentFilesHeader, [
            createToggleDefinition('showRecentNotes', {
                name: strings.settings.items.showRecentNotes.name,
                desc: strings.settings.items.showRecentNotes.desc
            }),
            createDropdownDefinition('hideRecentNotes', {
                name: strings.settings.items.hideRecentNotes.name,
                desc: strings.settings.items.hideRecentNotes.desc,
                aliases: Object.values(strings.settings.items.hideRecentNotes.options),
                visible: () => plugin.settings.showRecentNotes,
                options: {
                    none: strings.settings.items.hideRecentNotes.options.none,
                    'folder-notes': strings.settings.items.hideRecentNotes.options.folderNotes
                }
            }),
            createToggleDefinition('pinRecentNotesWithShortcuts', {
                name: strings.settings.items.pinRecentNotesWithShortcuts.name,
                desc: strings.settings.items.pinRecentNotesWithShortcuts.desc,
                visible: () => plugin.settings.showRecentNotes
            }),
            createRenderDefinition({
                name: strings.settings.items.recentNotesCount.name,
                desc: strings.settings.items.recentNotesCount.desc,
                visible: () => plugin.settings.showRecentNotes,
                render: setting => renderRecentNotesCountSetting(setting, context)
            })
        ])
    ];
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
