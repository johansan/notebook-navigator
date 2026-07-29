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

import { Platform, Setting } from 'obsidian';
import { strings } from '../../i18n';
import type NotebookNavigatorPlugin from '../../main';
import { getIconService } from '../../services/icons';
import { runAsyncAction } from '../../utils/async';
import { isDualPaneSupported } from '../../utils/paneLayout';
import { resolveUXIcon, type UXIconId } from '../../utils/uxIcons';
import { addSettingSyncModeToggle } from '../syncModeToggle';
import type { ListToolbarButtonId, NavigationToolbarButtonId } from '../types';

type ToolbarButtonConfig<T extends string> = {
    id: T;
    label: string;
} & ({ iconType: 'ux'; iconId: UXIconId } | { iconType: 'raw'; iconId: string });

const NAVIGATION_TOOLBAR_BUTTONS: ToolbarButtonConfig<NavigationToolbarButtonId>[] = [
    { id: 'toggleDualPane', iconType: 'ux', iconId: 'nav-show-dual-pane', label: strings.paneHeader.showDualPane },
    { id: 'expandCollapse', iconType: 'ux', iconId: 'nav-expand-all', label: strings.paneHeader.expandAllFolders },
    { id: 'hiddenItems', iconType: 'ux', iconId: 'nav-hidden-items', label: strings.paneHeader.showExcludedItems },
    { id: 'calendar', iconType: 'ux', iconId: 'nav-calendar', label: strings.paneHeader.showCalendar },
    { id: 'rootReorder', iconType: 'ux', iconId: 'nav-root-reorder', label: strings.paneHeader.reorderRootFolders },
    { id: 'newFolder', iconType: 'ux', iconId: 'nav-new-folder', label: strings.paneHeader.newFolder }
];

const LIST_TOOLBAR_BUTTONS: ToolbarButtonConfig<ListToolbarButtonId>[] = [
    { id: 'back', iconType: 'raw', iconId: Platform.isAndroidApp ? 'arrow-left' : 'chevron-left', label: strings.paneHeader.showFolders },
    { id: 'search', iconType: 'ux', iconId: 'list-search', label: strings.paneHeader.search },
    { id: 'reveal', iconType: 'ux', iconId: 'list-reveal-file', label: strings.commands.revealFile },
    { id: 'descendants', iconType: 'ux', iconId: 'list-descendants', label: strings.settings.items.includeDescendantNotes.name },
    { id: 'groupExpansion', iconType: 'ux', iconId: 'list-expand-all', label: strings.commands.collapseExpandListGroups },
    { id: 'sort', iconType: 'ux', iconId: 'list-sort-ascending', label: strings.paneHeader.changeSortAndGroup },
    { id: 'appearance', iconType: 'ux', iconId: 'list-appearance', label: strings.paneHeader.changeAppearance },
    { id: 'newNote', iconType: 'ux', iconId: 'list-new-note', label: strings.paneHeader.newNote }
];

/** Renders the button visibility grid for one toolbar. Both grids persist the shared toolbarVisibility setting. */
export function renderToolbarButtonsSetting(
    addSetting: (createSetting: (setting: Setting) => void) => Setting,
    plugin: NotebookNavigatorPlugin,
    toolbar: 'navigation' | 'list'
): void {
    const setting = addSetting(setting => {
        setting.setName(strings.settings.items.toolbarButtons.name).setDesc(strings.settings.items.toolbarButtons.desc);
    });

    setting.controlEl.addClass('nn-toolbar-visibility-control');
    const gridEl = setting.controlEl.createDiv({ cls: ['nn-toolbar-visibility-grid', 'nn-toolbar-visibility-grid-scroll'] });
    const onToggle = () => {
        runAsyncAction(() => plugin.persistToolbarVisibility());
    };

    if (toolbar === 'navigation') {
        const navigationToolbarButtons = NAVIGATION_TOOLBAR_BUTTONS.filter(button => {
            if (button.id === 'calendar') {
                return plugin.settings.calendarEnabled;
            }
            // The dual pane toggle renders only in the desktop pane header, which desktop
            // and tablets always show; phones never render it
            if (button.id === 'toggleDualPane') {
                return isDualPaneSupported();
            }
            return true;
        });
        createToolbarButtonGroup({
            gridEl,
            buttons: navigationToolbarButtons,
            interfaceIcons: plugin.settings.interfaceIcons,
            state: plugin.settings.toolbarVisibility.navigation,
            onToggle
        });
    } else {
        createToolbarButtonGroup({
            gridEl,
            buttons: LIST_TOOLBAR_BUTTONS,
            interfaceIcons: plugin.settings.interfaceIcons,
            state: plugin.settings.toolbarVisibility.list,
            onToggle
        });
    }

    addSettingSyncModeToggle({ setting, plugin, settingId: 'toolbarVisibility' });
}

interface ToolbarButtonGroupProps<T extends string> {
    gridEl: HTMLElement;
    buttons: ToolbarButtonConfig<T>[];
    interfaceIcons: Record<string, string> | undefined;
    state: Record<T, boolean>;
    onToggle: () => void;
}

function createToolbarButtonGroup<T extends string>({
    gridEl,
    buttons,
    interfaceIcons,
    state,
    onToggle
}: ToolbarButtonGroupProps<T>): void {
    buttons.forEach(button => {
        const buttonEl = gridEl.createEl('button', {
            cls: ['nn-toolbar-visibility-toggle', 'nn-mobile-toolbar-button'],
            attr: { type: 'button' }
        });
        buttonEl.setAttr('aria-pressed', state[button.id] ? 'true' : 'false');
        buttonEl.setAttr('aria-label', button.label);
        buttonEl.setAttr('title', button.label);

        const iconEl = buttonEl.createSpan({ cls: 'nn-toolbar-visibility-icon' });
        const resolvedIconId = button.iconType === 'ux' ? resolveUXIcon(interfaceIcons, button.iconId) : button.iconId;
        getIconService().renderIcon(iconEl, resolvedIconId);

        const applyState = () => {
            const isEnabled = Boolean(state[button.id]);
            buttonEl.classList.toggle('is-active', isEnabled);
            buttonEl.classList.toggle('nn-mobile-toolbar-button-active', isEnabled);
            buttonEl.setAttr('aria-pressed', isEnabled ? 'true' : 'false');
        };

        buttonEl.addEventListener('click', () => {
            state[button.id] = !state[button.id];
            applyState();
            onToggle();
        });

        applyState();
    });
}
