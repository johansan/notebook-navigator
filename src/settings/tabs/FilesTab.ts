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

import type { Setting, SettingDefinitionItem } from 'obsidian';
import { strings } from '../../i18n';
import { getTemplaterCreateNoteFromTemplate } from '../../utils/templaterIntegration';
import {
    createDropdownDefinition,
    createFolderDefinition,
    createGroupDefinition,
    createRenderDefinition,
    createToggleDefinition
} from '../nativeSettingControls';
import type { SettingsTabContext } from './SettingsTabContext';

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
            createRenderDefinition({
                name: 'Templater',
                searchable: false,
                render: setting => renderTemplateFolderInfoSetting(setting, context)
            })
        ])
    ];
}

function renderTemplateFolderInfoSetting(setting: Setting, context: SettingsTabContext): void {
    setting.setName('').setDesc('');
    setting.settingEl.addClass('nn-setting-info-container');
    setting.descEl.empty();

    setting.descEl.createDiv({ text: strings.settings.items.templateFolderLocation.usage });

    const templaterSupportText = getTemplaterCreateNoteFromTemplate(context.app)
        ? strings.settings.items.templaterSupport.installed
        : strings.settings.items.templaterSupport.missing;
    setting.descEl.append(createEl('br'), createEl('strong', { text: templaterSupportText }));
}
