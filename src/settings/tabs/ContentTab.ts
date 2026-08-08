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

import { strings } from '../../i18n';
import type { SettingDefinitionItem } from 'obsidian';
import type { SettingsTabContext } from './SettingsTabContext';
import { createFoldersSettingDefinitions } from './FoldersTab';
import { createPropertiesSettingDefinitions } from './PropertiesTab';
import { createTagsSettingDefinitions } from './TagsTab';

/** Builds native 1.13 setting definitions for folder display and folder note settings. */
export function createFoldersAndFolderNotesSettingDefinitions(context: SettingsTabContext): SettingDefinitionItem[] {
    return createFoldersSettingDefinitions(context, strings.settings.pages.foldersAndFolderNotes.groups.folders);
}

/** Builds native 1.13 setting definitions for tag and property settings. */
export function createTagsPropertiesSettingDefinitions(context: SettingsTabContext): SettingDefinitionItem[] {
    return [
        ...createTagsSettingDefinitions(context, strings.settings.pages.tagsAndProperties.groups.tags),
        ...createPropertiesSettingDefinitions(context, strings.settings.pages.tagsAndProperties.groups.properties)
    ];
}
