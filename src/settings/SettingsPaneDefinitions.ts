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
import { renderAdvancedTab } from './tabs/legacy/AdvancedLegacyTab';
import { renderAppearanceBehaviorTab } from './tabs/legacy/AppearanceBehaviorLegacyTab';
import { renderCalendarTab } from './tabs/legacy/CalendarLegacyTab';
import { renderFoldersAndFolderNotesTab, renderTagsPropertiesTab } from './tabs/legacy/ContentLegacyTab';
import { renderDisplayFiltersTab } from './tabs/legacy/DisplayFiltersLegacyTab';
import { renderFilesTab } from './tabs/legacy/FilesLegacyTab';
import { renderFrontmatterTab } from './tabs/legacy/FrontmatterLegacyTab';
import { renderGeneralTab } from './tabs/legacy/GeneralLegacyTab';
import { renderIconPacksTab } from './tabs/legacy/IconPacksLegacyTab';
import { renderListPaneTab } from './tabs/legacy/ListLegacyTab';
import { renderNavigationPaneTab } from './tabs/legacy/NavigationLegacyTab';
import { renderNotesTab } from './tabs/legacy/NotesLegacyTab';
import { renderShortcutsTab } from './tabs/legacy/ShortcutsLegacyTab';
import type { SettingsTabContext, SettingsTabId } from './tabs/SettingsTabContext';

/** Identifiers for settings panes rendered as native settings pages. */
export type SettingsPaneId = Exclude<SettingsTabId, 'files' | 'tags' | 'properties'>;

export interface SettingsPageGroupDefinition {
    getHeading: () => string;
    items: SettingsPaneId[];
}

/** Registry entry shared by native setting pages and the legacy display() fallback. */
export interface SettingsPaneDefinition {
    id: SettingsPaneId;
    getLabel: () => string;
    getDescription: () => string;
    render: (context: SettingsTabContext) => void;
    createDefinitions?: (context: SettingsTabContext) => SettingDefinitionItem[];
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

// Native pages use createDefinitions; legacy pages use render.
const SETTINGS_PANE_DEFINITIONS: SettingsPaneDefinition[] = [
    {
        id: 'general',
        getLabel: () => strings.settings.index.label,
        getDescription: () => strings.settings.index.description,
        render: renderGeneralTab
    },
    {
        id: 'vault-filters',
        getLabel: () => strings.settings.pages.displayFilters.label,
        getDescription: () => strings.settings.pages.displayFilters.description,
        render: renderDisplayFiltersTab,
        createDefinitions: createDisplayFiltersSettingDefinitions
    },
    {
        id: 'appearance-behavior',
        getLabel: () => strings.settings.pages.appearanceAndBehavior.label,
        getDescription: () => strings.settings.pages.appearanceAndBehavior.description,
        render: renderAppearanceBehaviorTab,
        createDefinitions: createAppearanceBehaviorSettingDefinitions
    },
    {
        id: 'navigation-pane',
        getLabel: () => strings.settings.pages.navigationPane.label,
        getDescription: () => strings.settings.pages.navigationPane.description,
        render: renderNavigationPaneTab,
        createDefinitions: createNavigationPaneSettingDefinitions
    },
    {
        id: 'shortcuts',
        getLabel: () => strings.settings.pages.shortcutsAndRecentFiles.label,
        getDescription: () => strings.settings.pages.shortcutsAndRecentFiles.description,
        render: renderShortcutsTab,
        createDefinitions: createShortcutsSettingDefinitions
    },
    {
        id: 'folders',
        getLabel: () => strings.settings.pages.foldersAndFolderNotes.label,
        getDescription: () => strings.settings.pages.foldersAndFolderNotes.description,
        render: renderFoldersAndFolderNotesTab,
        createDefinitions: createFoldersAndFolderNotesSettingDefinitions
    },
    {
        id: 'tags-properties',
        getLabel: () => strings.settings.pages.tagsAndProperties.label,
        getDescription: () => strings.settings.pages.tagsAndProperties.description,
        render: renderTagsPropertiesTab,
        createDefinitions: createTagsPropertiesSettingDefinitions
    },
    {
        id: 'list-pane',
        getLabel: () => strings.settings.pages.listPane.label,
        getDescription: () => strings.settings.pages.listPane.description,
        render: renderListPaneTab,
        createDefinitions: createListPaneSettingDefinitions
    },
    {
        id: 'file-operations',
        getLabel: () => strings.settings.pages.fileOperations.label,
        getDescription: () => strings.settings.pages.fileOperations.description,
        render: renderFilesTab,
        createDefinitions: createFilesSettingDefinitions
    },
    {
        id: 'frontmatter',
        getLabel: () => strings.settings.pages.frontmatterFields.label,
        getDescription: () => strings.settings.pages.frontmatterFields.description,
        render: renderFrontmatterTab,
        createDefinitions: createFrontmatterSettingDefinitions
    },
    {
        id: 'notes',
        getLabel: () => strings.settings.pages.fileDisplay.label,
        getDescription: () => strings.settings.pages.fileDisplay.description,
        render: renderNotesTab,
        createDefinitions: createNotesSettingDefinitions
    },
    {
        id: 'calendar',
        getLabel: () => strings.settings.pages.calendar.label,
        getDescription: () => strings.settings.pages.calendar.description,
        render: renderCalendarTab,
        createDefinitions: createCalendarSettingDefinitions
    },
    {
        id: 'icon-packs',
        getLabel: () => strings.settings.pages.iconPacks.label,
        getDescription: () => strings.settings.pages.iconPacks.description,
        render: renderIconPacksTab,
        createDefinitions: createIconPacksSettingDefinitions
    },
    {
        id: 'advanced',
        getLabel: () => strings.settings.pages.advanced.label,
        getDescription: () => strings.settings.pages.advanced.description,
        render: renderAdvancedTab,
        createDefinitions: createAdvancedSettingDefinitions
    }
];

export const SETTINGS_PANE_DEFINITION_MAP = new Map<SettingsPaneId, SettingsPaneDefinition>(
    SETTINGS_PANE_DEFINITIONS.map(definition => [definition.id, definition])
);
