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

import type { Setting } from 'obsidian';
import { strings } from '../../../i18n';
import { FolderPathInputSuggest } from '../../../suggest/FolderPathInputSuggest';
import { normalizeCalendarCustomRootFolder } from '../../../utils/calendarCustomNotePatterns';
import { getTemplaterCreateNoteFromTemplate } from '../../../utils/templaterIntegration';
import { createSettingGroupFactory } from '../../settingGroups';
import { isDeleteAttachmentsSetting, isMoveFileConflictsSetting } from '../../types';
import type { SettingsTabContext } from '../SettingsTabContext';

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderFilesTab(context: SettingsTabContext, heading?: string): void {
    const { containerEl, plugin } = context;

    const createGroup = createSettingGroupFactory(containerEl);
    const filesGroup = createGroup(heading);

    filesGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.confirmBeforeDelete.name)
            .setDesc(strings.settings.items.confirmBeforeDelete.desc)
            .addToggle(toggle =>
                toggle.setValue(plugin.settings.confirmBeforeDelete).onChange(async value => {
                    plugin.settings.confirmBeforeDelete = value;
                    await plugin.saveSettingsAndUpdate();
                })
            );
    });

    filesGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.deleteAttachments.name)
            .setDesc(strings.settings.items.deleteAttachments.desc)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('ask', strings.settings.items.deleteAttachments.options.ask)
                    .addOption('always', strings.settings.items.deleteAttachments.options.always)
                    .addOption('never', strings.settings.items.deleteAttachments.options.never)
                    .setValue(plugin.settings.deleteAttachments)
                    .onChange(async value => {
                        if (!isDeleteAttachmentsSetting(value)) {
                            return;
                        }
                        plugin.settings.deleteAttachments = value;
                        await plugin.saveSettingsAndUpdate();
                    });
            });
    });

    filesGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.moveFileConflicts.name)
            .setDesc(strings.settings.items.moveFileConflicts.desc)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('ask', strings.settings.items.moveFileConflicts.options.ask)
                    .addOption('rename', strings.settings.items.moveFileConflicts.options.rename)
                    .setValue(plugin.settings.moveFileConflicts)
                    .onChange(async value => {
                        if (!isMoveFileConflictsSetting(value)) {
                            return;
                        }
                        plugin.settings.moveFileConflicts = value;
                        await plugin.saveSettingsAndUpdate();
                    });
            });
    });

    const templatesGroup = createGroup(strings.settings.pages.fileOperations.groups.templates);
    const templateFolderSetting = templatesGroup.addSetting(setting => {
        context.configureDebouncedTextSetting(
            setting,
            strings.settings.items.templateFolderLocation.name,
            strings.settings.items.templateFolderLocation.desc,
            strings.settings.items.templateFolderLocation.placeholder,
            () => normalizeCalendarCustomRootFolder(plugin.settings.calendarTemplateFolder),
            value => {
                plugin.settings.calendarTemplateFolder = normalizeCalendarCustomRootFolder(value);
            }
        );
    });
    templateFolderSetting.controlEl.addClass('nn-setting-wide-input');
    const templateFolderInputEl = templateFolderSetting.controlEl.querySelector<HTMLInputElement>('input');
    if (templateFolderInputEl) {
        const folderSuggest = new FolderPathInputSuggest(context.app, templateFolderInputEl);
        templateFolderInputEl.addEventListener('click', () => folderSuggest.open());
    }

    templatesGroup.addSetting(setting => renderTemplateFolderInfoSetting(setting, context));
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
