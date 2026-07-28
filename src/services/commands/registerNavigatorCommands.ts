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

import { Platform, type Command } from 'obsidian';
import type NotebookNavigatorPlugin from '../../main';
import { strings } from '../../i18n';

interface NavigatorCommandSpec {
    id: string;
    name: string;
    checkable?: boolean;
}

const STATIC_COMMAND_SPECS: NavigatorCommandSpec[] = [
    { id: 'open', name: strings.commands.open },
    // Desktop only: on mobile the sidebar is a drawer, and on tablets collapse() is a
    // no-op while the sidebar is pinned, so the command would do nothing
    ...(Platform.isMobile ? [] : [{ id: 'toggle-left-sidebar', name: strings.commands.toggleLeftSidebar }]),
    { id: 'open-homepage', name: strings.commands.openHomepage, checkable: true },
    { id: 'reveal-file', name: strings.commands.revealFile, checkable: true },
    { id: 'open-all-files', name: strings.commands.openAllFiles, checkable: true },
    { id: 'toggle-descendants', name: strings.commands.toggleDescendants },
    { id: 'toggle-hidden', name: strings.commands.toggleHidden },
    { id: 'toggle-tag-sort', name: strings.commands.toggleTagSort },
    { id: 'toggle-tags-by-selection', name: strings.commands.toggleTagsBySelection },
    { id: 'toggle-properties-by-selection', name: strings.commands.togglePropertiesBySelection },
    { id: 'toggle-compact-mode', name: strings.commands.toggleCompactMode },
    { id: 'toggle-pinned-section', name: strings.commands.togglePinnedSection },
    { id: 'collapse-expand-list-groups', name: strings.commands.collapseExpandListGroups },
    { id: 'toggle-dual-pane', name: strings.commands.toggleDualPane },
    { id: 'toggle-dual-pane-orientation', name: strings.commands.toggleDualPaneOrientation },
    { id: 'toggle-calendar', name: strings.commands.toggleCalendar },
    { id: 'open-daily-note', name: strings.commands.openDailyNote },
    { id: 'open-weekly-note', name: strings.commands.openWeeklyNote },
    { id: 'open-monthly-note', name: strings.commands.openMonthlyNote },
    { id: 'open-quarterly-note', name: strings.commands.openQuarterlyNote },
    { id: 'open-yearly-note', name: strings.commands.openYearlyNote },
    { id: 'select-profile', name: strings.commands.selectVaultProfile },
    { id: 'select-profile-1', name: strings.commands.selectVaultProfile1 },
    { id: 'select-profile-2', name: strings.commands.selectVaultProfile2 },
    { id: 'select-profile-3', name: strings.commands.selectVaultProfile3 },
    { id: 'collapse-expand', name: strings.commands.collapseExpand },
    { id: 'collapse-expand-selected-item', name: strings.commands.collapseExpandSelectedItem },
    { id: 'new-note', name: strings.commands.createNewNote },
    { id: 'new-note-from-template', name: strings.commands.createNewNoteFromTemplate, checkable: true },
    { id: 'move-files', name: strings.commands.moveFiles },
    { id: 'merge-notes', name: strings.commands.mergeNotes },
    { id: 'select-next-file', name: strings.commands.selectNextFile },
    { id: 'select-previous-file', name: strings.commands.selectPreviousFile },
    { id: 'navigate-back', name: strings.commands.navigateBack },
    { id: 'navigate-forward', name: strings.commands.navigateForward },
    { id: 'convert-to-folder-note', name: strings.commands.convertToFolderNote, checkable: true },
    { id: 'set-as-folder-note', name: strings.commands.setAsFolderNote, checkable: true },
    { id: 'detach-folder-note', name: strings.commands.detachFolderNote, checkable: true },
    { id: 'pin-all-folder-notes', name: strings.commands.pinAllFolderNotes, checkable: true },
    { id: 'delete-files', name: strings.commands.deleteFile },
    { id: 'rebuild-cache', name: strings.commands.rebuildCache },
    { id: 'add-tag', name: strings.commands.addTag },
    { id: 'set-property', name: strings.commands.setProperty },
    { id: 'remove-tag', name: strings.commands.removeTag },
    { id: 'remove-all-tags', name: strings.commands.removeAllTags },
    { id: 'navigate-to-folder', name: strings.commands.navigateToFolder },
    { id: 'navigate-to-tag', name: strings.commands.navigateToTag },
    { id: 'navigate-to-property', name: strings.commands.navigateToProperty },
    { id: 'add-shortcut', name: strings.commands.addShortcut },
    { id: 'search', name: strings.commands.search },
    { id: 'search-vault', name: strings.commands.searchVaultRoot, checkable: true }
];

const SHORTCUT_COMMAND_SPECS: NavigatorCommandSpec[] = Array.from({ length: 9 }, (_unused, index) => {
    const shortcutNumber = index + 1;
    return {
        id: `open-shortcut-${shortcutNumber}`,
        name: strings.commands.openShortcut.replace('{number}', shortcutNumber.toString()),
        checkable: true
    };
});

const COMMAND_SPECS = [...STATIC_COMMAND_SPECS, ...SHORTCUT_COMMAND_SPECS];
const capturedCommandsByPlugin = new WeakMap<NotebookNavigatorPlugin, Map<string, Command>>();

function captureCommandHandlers(plugin: NotebookNavigatorPlugin): Map<string, Command> {
    const cached = capturedCommandsByPlugin.get(plugin);
    if (cached) {
        return cached;
    }

    const capturedCommands = new Map<string, Command>();
    const hadOwnAddCommand = Object.prototype.hasOwnProperty.call(plugin, 'addCommand');
    const originalAddCommand = plugin.addCommand.bind(plugin);

    plugin.addCommand = (command: Command): Command => {
        capturedCommands.set(command.id, command);
        return command;
    };

    try {
        const { default: registerNavigatorCommandHandlers } =
            // eslint-disable-next-line @typescript-eslint/no-require-imports -- Command handlers stay out of startup and load on first command use.
            require('./navigatorCommandHandlers') as typeof import('./navigatorCommandHandlers');
        registerNavigatorCommandHandlers(plugin);
    } finally {
        if (hadOwnAddCommand) {
            plugin.addCommand = originalAddCommand;
        } else {
            delete (plugin as { addCommand?: NotebookNavigatorPlugin['addCommand'] }).addCommand;
        }
    }

    capturedCommandsByPlugin.set(plugin, capturedCommands);
    return capturedCommands;
}

function getCommandHandler(plugin: NotebookNavigatorPlugin, id: string): Command | undefined {
    return captureCommandHandlers(plugin).get(id);
}

function runCommandHandler(plugin: NotebookNavigatorPlugin, id: string): void {
    const command = getCommandHandler(plugin, id);
    if (!command?.callback) {
        console.error(`Notebook Navigator command handler not found: ${id}`);
        return;
    }

    command.callback();
}

function checkCommandHandler(plugin: NotebookNavigatorPlugin, id: string, checking: boolean): boolean {
    const command = getCommandHandler(plugin, id);
    if (!command?.checkCallback) {
        console.error(`Notebook Navigator command check handler not found: ${id}`);
        return false;
    }

    return command.checkCallback(checking) === true;
}

/**
 * Registers command metadata at startup while deferring command implementation modules until first use.
 */
export default function registerNavigatorCommands(plugin: NotebookNavigatorPlugin): void {
    COMMAND_SPECS.forEach(commandSpec => {
        if (commandSpec.checkable) {
            plugin.addCommand({
                id: commandSpec.id,
                name: commandSpec.name,
                checkCallback: (checking: boolean) => checkCommandHandler(plugin, commandSpec.id, checking)
            });
            return;
        }

        plugin.addCommand({
            id: commandSpec.id,
            name: commandSpec.name,
            callback: () => runCommandHandler(plugin, commandSpec.id)
        });
    });
}
