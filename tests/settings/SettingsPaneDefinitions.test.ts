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

import { describe, expect, it, vi } from 'vitest';

vi.mock('obsidian', async importOriginal => {
    const original = await importOriginal<typeof import('obsidian')>();
    const fallbackClass = class {};
    return {
        ...original,
        AbstractInputSuggest: fallbackClass,
        FuzzySuggestModal: fallbackClass,
        ItemView: fallbackClass
    };
});

import {
    SETTINGS_PAGE_GROUP_DEFINITIONS,
    SETTINGS_PANE_DEFINITION_MAP,
    type SettingsPaneId
} from '../../src/settings/SettingsPaneDefinitions';

const EXPECTED_PANES: Array<{ id: SettingsPaneId; label: string; description: string; native: boolean }> = [
    {
        id: 'general',
        label: 'General',
        description: 'Release notes, support, vault profile, file types, and property keys.',
        native: false
    },
    {
        id: 'vault-filters',
        label: 'Display filters',
        description: 'Hidden folders, tags, files, file tags, and property rules.',
        native: true
    },
    {
        id: 'appearance-behavior',
        label: 'Appearance & behavior',
        description: 'Behavior, keyboard navigation, mouse buttons, appearance, and formatting.',
        native: true
    },
    {
        id: 'navigation-pane',
        label: 'Navigation pane',
        description: 'Layout, appearance, file counts, collapse behavior, and rainbow colors.',
        native: true
    },
    {
        id: 'shortcuts',
        label: 'Shortcuts & recent files',
        description: 'Shortcut visibility, badges, recent files, and pinned items.',
        native: true
    },
    {
        id: 'folders',
        label: 'Folders & folder notes',
        description: 'Folder display, folder notes, folder note templates, and folder note behavior.',
        native: true
    },
    {
        id: 'tags-properties',
        label: 'Tags & properties',
        description: 'Tag and property sections, icons, sorting, scope, and inheritance.',
        native: true
    },
    {
        id: 'list-pane',
        label: 'List pane',
        description: 'Sorting, grouping, list modes, pinned notes, and drawing previews.',
        native: true
    },
    {
        id: 'file-operations',
        label: 'File operations',
        description: 'Template folder, delete confirmations, attachments, and file move conflict behavior.',
        native: true
    },
    {
        id: 'frontmatter',
        label: 'Frontmatter fields',
        description: 'Frontmatter fields for display names, timestamps, icons, and colors.',
        native: true
    },
    {
        id: 'notes',
        label: 'File display',
        description: 'Titles, preview text, feature images, tags, properties, dates, word counts, and character counts.',
        native: true
    },
    {
        id: 'calendar',
        label: 'Calendar',
        description: 'Calendar display, date notes, templates, locale, and sidebar placement.',
        native: true
    },
    {
        id: 'icon-packs',
        label: 'Icon packs',
        description: 'Interface icons, file icons, and icon pack management.',
        native: true
    },
    {
        id: 'advanced',
        label: 'Advanced',
        description: 'Diagnostics, metadata cleanup, import/export, and reset.',
        native: true
    }
];

describe('settings pane definitions', () => {
    it('keeps each pane label and description in its registry entry', () => {
        expect(SETTINGS_PANE_DEFINITION_MAP.size).toBe(EXPECTED_PANES.length);

        EXPECTED_PANES.forEach(expected => {
            const definition = SETTINGS_PANE_DEFINITION_MAP.get(expected.id);
            expect(definition?.getLabel()).toBe(expected.label);
            expect(definition?.getDescription()).toBe(expected.description);
        });
    });

    it('keeps legacy renderers and native page definitions registered together', () => {
        EXPECTED_PANES.forEach(expected => {
            const definition = SETTINGS_PANE_DEFINITION_MAP.get(expected.id);
            expect(definition?.render).toBeTypeOf('function');
            expect(definition?.createDefinitions !== undefined).toBe(expected.native);
        });
    });

    it('uses the current page group headings', () => {
        expect(SETTINGS_PAGE_GROUP_DEFINITIONS.map(group => group.getHeading())).toEqual([
            'Configuration',
            'Navigation pane',
            'List pane',
            'Calendar and tools'
        ]);
    });
});
