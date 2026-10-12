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

import { strings } from '../i18n';
import type { SettingDefinitionItem } from 'obsidian';
import { createAdvancedSettingDefinitions } from './tabs/AdvancedTab';
import { createCalendarSettingDefinitions } from './tabs/CalendarTab';
import { createFoldersAndFolderNotesSettingDefinitions, createTagsPropertiesSettingDefinitions } from './tabs/ContentTab';
import { createDisplayFiltersSettingDefinitions } from './tabs/DisplayFiltersTab';
import { createFilesSettingDefinitions } from './tabs/FilesTab';
import { createFrontmatterSettingDefinitions } from './tabs/FrontmatterTab';
import { createIconPacksSettingDefinitions } from './tabs/IconPacksTab';
import { createListPaneSettingDefinitions } from './tabs/ListTab';
import { createNavigationPaneSettingDefinitions } from './tabs/NavigationTab';
import { createNotesSettingDefinitions } from './tabs/NotesTab';
import { createShortcutsSettingDefinitions } from './tabs/ShortcutsTab';
import { createAppearanceBehaviorSettingDefinitions } from './tabs/AppearanceBehaviorTab';
import type { SettingsTabContext } from './tabs/SettingsTabContext';

/** Identifiers for the settings pages linked from the plugin's settings index. */
export type SettingsPaneId =
    | 'vault-filters'
    | 'appearance-behavior'
    | 'navigation-pane'
    | 'shortcuts'
    | 'folders'
    | 'tags-properties'
    | 'list-pane'
    | 'file-operations'
    | 'frontmatter'
    | 'notes'
    | 'calendar'
    | 'icon-packs'
    | 'advanced';

export interface SettingsPageGroupDefinition {
    getHeading: () => string;
    items: SettingsPaneId[];
}

/** Registry entry for one native settings page. */
export interface SettingsPaneDefinition {
    id: SettingsPaneId;
    getLabel: () => string;
    getDescription: () => string;
    createDefinitions: (context: SettingsTabContext) => SettingDefinitionItem[];
}

export const SETTINGS_PAGE_GROUP_DEFINITIONS: SettingsPageGroupDefinition[] = [
    {
        getHeading: () => strings.settings.pageGroups.configuration,
        items: ['vault-filters', 'appearance-behavior', 'file-operations']
    },
    {
        getHeading: () => strings.settings.pageGroups.navigationPane,
        items: ['navigation-pane', 'shortcuts', 'folders', 'tags-properties']
    },
    {
        getHeading: () => strings.settings.pageGroups.listPane,
        items: ['list-pane', 'frontmatter', 'notes']
    },
    {
        getHeading: () => strings.settings.pageGroups.calendarAndTools,
        items: ['calendar', 'icon-packs', 'advanced']
    }
];

const SETTINGS_PANE_DEFINITIONS: SettingsPaneDefinition[] = [
    {
        id: 'vault-filters',
        getLabel: () => strings.settings.pages.displayFilters.label,
        getDescription: () => strings.settings.pages.displayFilters.description,
        createDefinitions: createDisplayFiltersSettingDefinitions
    },
    {
        id: 'appearance-behavior',
        getLabel: () => strings.settings.pages.appearanceAndBehavior.label,
        getDescription: () => strings.settings.pages.appearanceAndBehavior.description,
        createDefinitions: createAppearanceBehaviorSettingDefinitions
    },
    {
        id: 'navigation-pane',
        getLabel: () => strings.settings.pages.navigationPane.label,
        getDescription: () => strings.settings.pages.navigationPane.description,
        createDefinitions: createNavigationPaneSettingDefinitions
    },
    {
        id: 'shortcuts',
        getLabel: () => strings.settings.pages.shortcutsAndRecentFiles.label,
        getDescription: () => strings.settings.pages.shortcutsAndRecentFiles.description,
        createDefinitions: createShortcutsSettingDefinitions
    },
    {
        id: 'folders',
        getLabel: () => strings.settings.pages.foldersAndFolderNotes.label,
        getDescription: () => strings.settings.pages.foldersAndFolderNotes.description,
        createDefinitions: createFoldersAndFolderNotesSettingDefinitions
    },
    {
        id: 'tags-properties',
        getLabel: () => strings.settings.pages.tagsAndProperties.label,
        getDescription: () => strings.settings.pages.tagsAndProperties.description,
        createDefinitions: createTagsPropertiesSettingDefinitions
    },
    {
        id: 'list-pane',
        getLabel: () => strings.settings.pages.listPane.label,
        getDescription: () => strings.settings.pages.listPane.description,
        createDefinitions: createListPaneSettingDefinitions
    },
    {
        id: 'file-operations',
        getLabel: () => strings.settings.pages.fileOperations.label,
        getDescription: () => strings.settings.pages.fileOperations.description,
        createDefinitions: createFilesSettingDefinitions
    },
    {
        id: 'frontmatter',
        getLabel: () => strings.settings.pages.frontmatterFields.label,
        getDescription: () => strings.settings.pages.frontmatterFields.description,
        createDefinitions: createFrontmatterSettingDefinitions
    },
    {
        id: 'notes',
        getLabel: () => strings.settings.pages.fileDisplay.label,
        getDescription: () => strings.settings.pages.fileDisplay.description,
        createDefinitions: createNotesSettingDefinitions
    },
    {
        id: 'calendar',
        getLabel: () => strings.settings.pages.calendar.label,
        getDescription: () => strings.settings.pages.calendar.description,
        createDefinitions: createCalendarSettingDefinitions
    },
    {
        id: 'icon-packs',
        getLabel: () => strings.settings.pages.iconPacks.label,
        getDescription: () => strings.settings.pages.iconPacks.description,
        createDefinitions: createIconPacksSettingDefinitions
    },
    {
        id: 'advanced',
        getLabel: () => strings.settings.pages.advanced.label,
        getDescription: () => strings.settings.pages.advanced.description,
        createDefinitions: createAdvancedSettingDefinitions
    }
];

export const SETTINGS_PANE_DEFINITION_MAP = new Map<SettingsPaneId, SettingsPaneDefinition>(
    SETTINGS_PANE_DEFINITIONS.map(definition => [definition.id, definition])
);
