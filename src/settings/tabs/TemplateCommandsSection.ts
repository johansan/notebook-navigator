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

import { setIcon, type Setting } from 'obsidian';
import { strings } from '../../i18n';
import { TemplateCommandModal } from '../../modals/TemplateCommandModal';
import { createTemplateCommand } from '../../services/commands/templateCommands';
import { getIconService } from '../../services/icons';
import type { TemplateCommand } from '../types';
import { runAsyncAction } from '../../utils/async';
import { normalizeCalendarCustomRootFolder } from '../../utils/calendarCustomNotePatterns';
import { formatFolderPathForDisplay } from '../../utils/pathUtils';
import type { SettingsTabContext } from './SettingsTabContext';

/**
 * Renders the list of template commands with add, edit and remove controls. Editing happens in a modal because each
 * command has four fields. Used by the native and the legacy Files tab.
 */
export function renderTemplateCommandsSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;
    const labels = strings.settings.items.templateCommands;
    setting.setName(labels.name).setDesc(labels.desc);
    // The list is a wrapped full-width child of the setting row rather than part of its description, so the rows
    // reach the right edge while the add button keeps its place in the control column. The setting element is not
    // attached to the page yet when this runs, so a sibling element could not be inserted here.
    setting.settingEl.addClass('nn-setting-template-commands');
    const listEl = setting.settingEl.createEl('ul', { cls: 'nn-setting-template-command-list' });

    const openEditor = (command: TemplateCommand, isNew: boolean): void => {
        new TemplateCommandModal(context.app, {
            command,
            isNew,
            metadataService: plugin.metadataService,
            templateFolder: normalizeCalendarCustomRootFolder(plugin.settings.calendarTemplateFolder),
            onSave: async next => {
                const commands = plugin.settings.templateCommands;
                const index = commands.findIndex(entry => entry.id === next.id);
                if (index === -1) {
                    commands.push(next);
                } else {
                    commands[index] = next;
                }
                await plugin.saveSettingsAndUpdate();
                renderList();
            }
        }).open();
    };

    const renderList = (): void => {
        listEl.empty();
        const commands = plugin.settings.templateCommands;
        if (commands.length === 0) {
            listEl.createEl('li', { text: labels.empty });
            return;
        }
        commands.forEach(command => {
            const rowEl = listEl.createEl('li', { cls: 'nn-setting-template-command-row' });
            const textEl = rowEl.createDiv({ cls: 'nn-setting-template-command-text' });
            textEl.createDiv({ cls: 'nn-setting-template-command-name', text: command.name || labels.unnamed });
            // The summary reads like the path the command produces: the target folder followed by the file name format.
            const folderDisplay = command.location === 'folder' ? formatFolderPathForDisplay(command.folder) : labels.locationCurrent;
            const fileName = command.fileNameFormat.trim() || strings.fileSystem.defaultNames.untitled;
            textEl.createDiv({
                cls: 'nn-setting-template-command-summary',
                text: folderDisplay === '/' ? `/${fileName}` : `${folderDisplay}/${fileName}`
            });

            const controlsEl = rowEl.createDiv({ cls: 'nn-setting-template-command-controls' });
            if (command.placement !== 'none') {
                const iconEl = controlsEl.createSpan({ cls: 'nn-setting-template-command-icon' });
                getIconService().renderIcon(iconEl, command.icon, 16);
            }
            const editButton = controlsEl.createEl('button', {
                cls: 'clickable-icon',
                attr: { type: 'button', 'aria-label': labels.edit }
            });
            setIcon(editButton, 'lucide-pencil');
            editButton.addEventListener('click', () => openEditor(command, false));

            const removeButton = controlsEl.createEl('button', {
                cls: 'clickable-icon',
                attr: { type: 'button', 'aria-label': strings.common.remove }
            });
            setIcon(removeButton, 'lucide-x');
            removeButton.addEventListener('click', () => {
                runAsyncAction(async () => {
                    plugin.settings.templateCommands = plugin.settings.templateCommands.filter(entry => entry.id !== command.id);
                    await plugin.saveSettingsAndUpdate();
                    renderList();
                });
            });
        });
    };

    setting.addButton(button => button.setButtonText(labels.add).onClick(() => openEditor(createTemplateCommand(), true)));
    renderList();
}
