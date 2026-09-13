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

import { DropdownComponent, setIcon, type Setting, type SettingDefinitionItem } from 'obsidian';
import { runAsyncAction } from '../../utils/async';
import { formatFolderPathForDisplay } from '../../utils/pathUtils';
import { strings } from '../../i18n';
import { naturalCompare } from '../../utils/sortUtils';
import { getTemplaterCreateNoteFromTemplate } from '../../utils/templaterIntegration';
import {
    createDropdownDefinition,
    createFolderDefinition,
    createGroupDefinition,
    createRenderDefinition,
    createToggleDefinition
} from '../nativeSettingControls';
import type { SettingsTabContext } from './SettingsTabContext';
import { renderTemplateCommandsSetting } from './TemplateCommandsSection';

/** Builds native 1.13 setting definitions for file operations settings. */
export function createFilesSettingDefinitions(context: SettingsTabContext, heading?: string): SettingDefinitionItem[] {
    return [
        createGroupDefinition(heading, [
            createToggleDefinition('confirmBeforeDelete', {
                name: strings.settings.items.confirmBeforeDelete.name,
                desc: strings.settings.items.confirmBeforeDelete.desc
            }),
            createDropdownDefinition('deleteAttachments', {
                name: strings.settings.items.deleteAttachments.name,
                desc: strings.settings.items.deleteAttachments.desc,
                aliases: Object.values(strings.settings.items.deleteAttachments.options),
                options: {
                    ask: strings.settings.items.deleteAttachments.options.ask,
                    always: strings.settings.items.deleteAttachments.options.always,
                    never: strings.settings.items.deleteAttachments.options.never
                }
            }),
            createDropdownDefinition('moveFileConflicts', {
                name: strings.settings.items.moveFileConflicts.name,
                desc: strings.settings.items.moveFileConflicts.desc,
                aliases: Object.values(strings.settings.items.moveFileConflicts.options),
                options: {
                    ask: strings.settings.items.moveFileConflicts.options.ask,
                    rename: strings.settings.items.moveFileConflicts.options.rename
                }
            })
        ]),
        createGroupDefinition(strings.settings.pages.fileOperations.groups.templates, [
            createFolderDefinition('calendarTemplateFolder', {
                name: strings.settings.items.templateFolderLocation.name,
                desc: strings.settings.items.templateFolderLocation.desc,
                aliases: [strings.settings.items.templateFolderLocation.placeholder],
                placeholder: strings.settings.items.templateFolderLocation.placeholder,
                includeRoot: true
            }),
            createDropdownDefinition('templateEngine', {
                name: strings.settings.items.templateEngine.name,
                desc: strings.settings.items.templateEngine.desc,
                aliases: Object.values(strings.settings.items.templateEngine.options),
                options: {
                    automatic: strings.settings.items.templateEngine.options.automatic,
                    builtin: strings.settings.items.templateEngine.options.builtin,
                    templater: strings.settings.items.templateEngine.options.templater
                }
            }),
            createToggleDefinition('showFolderTemplateIcons', {
                name: strings.settings.items.showFolderTemplateIcons.name,
                desc: strings.settings.items.showFolderTemplateIcons.desc
            }),
            createRenderDefinition({
                name: strings.settings.items.folderTemplates.name,
                desc: strings.settings.items.folderTemplates.desc,
                render: setting => renderFolderTemplatesSetting(setting, context)
            }),
            createRenderDefinition({
                name: 'Templates',
                searchable: false,
                render: setting => renderTemplateInfoSetting(setting, context)
            })
        ]),
        createGroupDefinition(strings.settings.pages.fileOperations.groups.templateCommands, [
            createRenderDefinition({
                name: strings.settings.items.templateCommands.name,
                desc: strings.settings.items.templateCommands.desc,
                aliases: [strings.settings.items.templateCommands.add],
                render: setting => renderTemplateCommandsSetting(setting, context)
            })
        ])
    ];
}

/** Renders template help and engine availability in the native and legacy Files tabs. */
export function renderTemplateInfoSetting(setting: Setting, context: SettingsTabContext): void {
    setting.setName('').setDesc('');
    setting.settingEl.addClass('nn-setting-info-container');
    setting.descEl.empty();

    const templaterStatusText = getTemplaterCreateNoteFromTemplate(context.app)
        ? strings.settings.items.templateEngine.templaterInstalled
        : strings.settings.items.templateEngine.templaterNotInstalled;
    setting.descEl.append(
        strings.settings.items.templateFolderLocation.usage,
        createEl('br'),
        createEl('br'),
        strings.settings.items.templateEngine.tokens,
        createEl('br'),
        createEl('br'),
        createEl('strong', { text: templaterStatusText })
    );
}

/** Lists folder templates with scope and removal controls in the native and legacy Files tabs. */
export function renderFolderTemplatesSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;
    setting.setName(strings.settings.items.folderTemplates.name).setDesc(strings.settings.items.folderTemplates.desc);
    const listEl = setting.descEl.createEl('ul', { cls: 'nn-setting-folder-template-list' });

    const renderList = (): void => {
        listEl.empty();
        const entries = Object.entries(plugin.settings.folderTemplates).sort(([left], [right]) => naturalCompare(left, right));
        if (entries.length === 0) {
            listEl.createEl('li', { text: strings.settings.items.folderTemplates.empty });
            return;
        }
        entries.forEach(([folderPath, mapping]) => {
            const rowEl = listEl.createEl('li', { cls: 'nn-setting-folder-template-row' });
            rowEl.createSpan({
                cls: 'nn-setting-folder-template-text',
                text: `${formatFolderPathForDisplay(folderPath)} → ${mapping.template}`
            });
            const controlsEl = rowEl.createDiv({ cls: 'nn-setting-folder-template-controls' });
            new DropdownComponent(controlsEl)
                .addOption('subfolders', strings.settings.items.folderTemplates.scopeSubfolders)
                .addOption('folder', strings.settings.items.folderTemplates.scopeFolder)
                .setValue(mapping.includeSubfolders ? 'subfolders' : 'folder')
                .onChange(value => {
                    runAsyncAction(async () => {
                        mapping.includeSubfolders = value === 'subfolders';
                        await plugin.saveSettingsAndUpdate();
                    });
                });
            const removeButton = controlsEl.createEl('button', {
                cls: 'clickable-icon nn-setting-folder-template-remove',
                attr: { type: 'button', 'aria-label': strings.common.remove }
            });
            setIcon(removeButton, 'lucide-x');
            removeButton.addEventListener('click', () => {
                runAsyncAction(async () => {
                    delete plugin.settings.folderTemplates[folderPath];
                    await plugin.saveSettingsAndUpdate();
                    renderList();
                });
            });
        });
    };

    renderList();
}
