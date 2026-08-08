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

import { strings } from '../../../i18n';
import type { SettingsTabContext } from '../SettingsTabContext';
import { renderFoldersTab } from './FoldersLegacyTab';
import { renderPropertiesTab } from './PropertiesLegacyTab';
import { renderTagsTab } from './TagsLegacyTab';

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderFoldersAndFolderNotesTab(context: SettingsTabContext): void {
    renderFoldersTab(context, strings.settings.pages.foldersAndFolderNotes.groups.folders);
}

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderTagsPropertiesTab(context: SettingsTabContext): void {
    renderTagsTab(context, strings.settings.pages.tagsAndProperties.groups.tags);
    renderPropertiesTab(context, strings.settings.pages.tagsAndProperties.groups.properties);
}
