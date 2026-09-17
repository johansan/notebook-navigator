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
import { TFolder } from 'obsidian';
import { describe, expect, it, vi } from 'vitest';
import { FolderItem } from '../../src/components/FolderItem';
import { NavigationListRow } from '../../src/components/NavigationListRow';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';

vi.mock('react', async importOriginal => {
    const actual = await importOriginal<typeof import('react')>();
    return {
        ...actual,
        // Keep hooks under the server renderer while exposing the folder component's returned element tree.
        default: { ...actual, memo: (component: React.ComponentType) => component }
    };
});

vi.mock('../../src/context/SettingsContext', () => ({
    useSettingsState: () => ({ ...DEFAULT_SETTINGS, showTooltips: false }),
    useActiveProfile: () => ({ fileVisibility: {} })
}));
vi.mock('../../src/context/ServicesContext', () => ({
    useServices: () => ({ app: {}, fileSystemOps: {}, isMobile: false })
}));
vi.mock('../../src/context/UXPreferencesContext', () => ({
    useUXPreferences: () => ({ includeDescendantNotes: false, showHiddenItems: false })
}));
vi.mock('../../src/context/TooltipContext', () => ({ useTooltip: () => ({}) }));
vi.mock('../../src/hooks/useContextMenu', () => ({ useContextMenu: vi.fn(), hideNavigatorContextMenu: vi.fn() }));
vi.mock('../../src/services/icons', () => ({ useIconServiceVersion: () => 0 }));

type MouseDownHandler = (event: React.MouseEvent<HTMLSpanElement>) => void;

function findLabelMouseDown(node: React.ReactNode): MouseDownHandler | undefined {
    let handler: MouseDownHandler | undefined;
    React.Children.forEach(node, child => {
        if (!React.isValidElement<React.HTMLAttributes<HTMLSpanElement>>(child)) {
            return;
        }
        if (child.props.className?.split(' ').includes('nn-navitem-name')) {
            handler = child.props.onMouseDown;
        } else {
            handler ??= findLabelMouseDown(child.props.children);
        }
    });
    return handler;
}

function renderLabelMouseDown(kind: 'folder' | 'shortcut', onMouseDown: MouseDownHandler): MouseDownHandler {
    const captured: { handler?: MouseDownHandler } = {};
    function Harness() {
        const element =
            kind === 'folder'
                ? FolderItem({
                      folder: new TFolder('Projects'),
                      level: 0,
                      isExpanded: false,
                      isSelected: false,
                      onToggle: vi.fn(),
                      onClick: vi.fn(),
                      onNameMouseDown: onMouseDown,
                      excludedFolders: [],
                      descendantExcludedFolders: [],
                      vaultChangeVersion: 0
                  })
                : NavigationListRow({
                      icon: 'lucide-folder',
                      label: 'Projects',
                      level: 0,
                      itemType: 'folder',
                      onLabelMouseDown: onMouseDown
                  });
        captured.handler = findLabelMouseDown(element);
        return null;
    }
    renderToStaticMarkup(React.createElement(Harness));
    if (!captured.handler) {
        throw new Error('Expected a folder-note label mouse-down handler');
    }
    return captured.handler;
}

describe.each(['folder', 'shortcut'] as const)('%s folder-note label', kind => {
    it('preserves propagation after the middle-click callback prevents the default', () => {
        const callback = vi.fn<MouseDownHandler>(event => event.preventDefault());
        const handler = renderLabelMouseDown(kind, callback);
        const event = {
            button: 1,
            preventDefault: vi.fn(),
            stopPropagation: vi.fn()
        };

        handler(event as unknown as React.MouseEvent<HTMLSpanElement>);

        expect(callback).toHaveBeenCalledExactlyOnceWith(event);
        expect(event.preventDefault).toHaveBeenCalledOnce();
        expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    it.each([0, 2])('keeps button %i from propagating while invoking the callback once', button => {
        const callback = vi.fn<MouseDownHandler>();
        const handler = renderLabelMouseDown(kind, callback);
        const event = {
            button,
            preventDefault: vi.fn(),
            stopPropagation: vi.fn()
        };

        handler(event as unknown as React.MouseEvent<HTMLSpanElement>);

        expect(callback).toHaveBeenCalledExactlyOnceWith(event);
        expect(event.stopPropagation).toHaveBeenCalledOnce();
        expect(event.preventDefault).not.toHaveBeenCalled();
    });
});
