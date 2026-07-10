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

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ListPaneGroupHeader, type HeaderRenderModel } from '../../src/components/listPane/ListPaneVirtualContent';

vi.mock('../../src/components/FileItem', () => ({ FileItem: () => null }));

function createHeader(itemCount: number | null): HeaderRenderModel {
    return {
        index: 0,
        label: 'Today',
        baseLabel: 'Today',
        isFirstHeader: true,
        isPinnedHeader: false,
        collapseKey: 'date:today',
        isCollapsed: false,
        isCollapsible: true,
        folderGroupHeaderTarget: null,
        folderGroupHeaderPath: null,
        folderGroupHeaderSegments: [],
        groupFilePaths: ['First.md', 'Second.md', 'Third.md'],
        itemCount,
        manualSortHeaderFilePath: null,
        manualSortHeader: null,
        manualSortHeaderWordCount: 0,
        manualSortHeaderTargetWordCount: null,
        folderIconId: null,
        folderColor: null,
        applyFolderColorToLabel: false
    };
}

function renderHeader(itemCount: number | null): string {
    return renderToStaticMarkup(
        React.createElement(ListPaneGroupHeader, {
            header: createHeader(itemCount),
            collapseChevronIcons: { collapsed: 'chevron-right', expanded: 'chevron-down' },
            pinnedSectionIcon: '',
            onPinnedGroupHeaderToggle: () => {},
            onListGroupHeaderToggle: () => {},
            onFolderGroupHeaderClick: () => {},
            onFolderGroupHeaderMouseDown: () => {},
            onGroupHeaderContextMenu: () => {}
        })
    );
}

describe('ListPaneGroupHeader item count', () => {
    it('renders the configured item count before the collapse control', () => {
        const markup = renderHeader(3);
        const countIndex = markup.indexOf('<span class="nn-list-group-header-item-count">(3)</span>');
        const collapseIndex = markup.indexOf('nn-list-group-header-collapse-button');

        expect(countIndex).toBeGreaterThan(-1);
        expect(collapseIndex).toBeGreaterThan(countIndex);
    });

    it('omits the item count when the setting is disabled', () => {
        expect(renderHeader(null)).not.toContain('nn-list-group-header-item-count');
    });
});
