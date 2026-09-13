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

import { strings } from '../../../i18n';
import { FolderPathInputSuggest } from '../../../suggest/FolderPathInputSuggest';
import { normalizeOptionalVaultFolderPath } from '../../../utils/pathUtils';
import { createSettingGroupFactory } from '../../settingGroups';
import { isDeleteAttachmentsSetting, isMoveFileConflictsSetting, isTemplateEngineSetting } from '../../types';
import type { SettingsTabContext } from '../SettingsTabContext';
import { renderTemplateCommandsSetting } from '../TemplateCommandsSection';
import { renderFolderTemplatesSetting, renderTemplateInfoSetting } from '../FilesTab';

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
            () => normalizeOptionalVaultFolderPath(plugin.settings.calendarTemplateFolder) ?? '',
            value => {
                // Keep an explicitly selected vault root distinct from an unset template folder.
                plugin.settings.calendarTemplateFolder = normalizeOptionalVaultFolderPath(value) ?? '';
            }
        );
    });
    templateFolderSetting.controlEl.addClass('nn-setting-wide-input');
    const templateFolderInputEl = templateFolderSetting.controlEl.querySelector<HTMLInputElement>('input');
    if (templateFolderInputEl) {
        const folderSuggest = new FolderPathInputSuggest(context.app, templateFolderInputEl);
        templateFolderInputEl.addEventListener('click', () => folderSuggest.open());
    }

    templatesGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.templateEngine.name)
            .setDesc(strings.settings.items.templateEngine.desc)
            .addDropdown(dropdown => {
                dropdown
                    .addOption('automatic', strings.settings.items.templateEngine.options.automatic)
                    .addOption('builtin', strings.settings.items.templateEngine.options.builtin)
                    .addOption('templater', strings.settings.items.templateEngine.options.templater)
                    .setValue(plugin.settings.templateEngine)
                    .onChange(async value => {
                        if (!isTemplateEngineSetting(value)) {
                            return;
                        }
                        plugin.settings.templateEngine = value;
                        await plugin.saveSettingsAndUpdate();
                    });
            });
    });

    templatesGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.showFolderTemplateIcons.name)
            .setDesc(strings.settings.items.showFolderTemplateIcons.desc)
            .addToggle(toggle =>
                toggle.setValue(plugin.settings.showFolderTemplateIcons).onChange(async value => {
                    plugin.settings.showFolderTemplateIcons = value;
                    await plugin.saveSettingsAndUpdate();
                })
            );
    });
    templatesGroup.addSetting(setting => renderFolderTemplatesSetting(setting, context));
    templatesGroup.addSetting(setting => renderTemplateInfoSetting(setting, context));

    const commandsGroup = createGroup(strings.settings.pages.fileOperations.groups.templateCommands);
    commandsGroup.addSetting(setting => renderTemplateCommandsSetting(setting, context));
}
