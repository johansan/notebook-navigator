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

import { Setting } from 'obsidian';
import { strings } from '../../../i18n';
import { FilePathInputSuggest } from '../../../suggest/FilePathInputSuggest';
import { isFolderNoteCreationPreference } from '../../../types/folderNote';
import { FOLDER_NOTE_NAME_PATTERN_TOKEN } from '../../../utils/folderNoteName';
import { isFolderNoteTemplateCompatible, isSupportedFolderNoteExtension } from '../../../utils/folderNotes';
import { normalizeOptionalVaultFilePath } from '../../../utils/pathUtils';
import { getTemplaterCreateNoteFromTemplate } from '../../../utils/templaterIntegration';
import { setElementVisible, wireToggleSettingWithDependentSection } from '../../dependentSettings';
import { createSettingGroupFactory } from '../../settingGroups';
import { addSettingSyncModeToggle } from '../../syncModeToggle';
import { isAlphaSortOrder, isFolderNoteOpenLocation } from '../../types';
import type { SettingsTabContext } from '../SettingsTabContext';

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderFoldersTab(context: SettingsTabContext, heading?: string): void {
    const { containerEl, plugin, addToggleSetting } = context;
    const createGroup = createSettingGroupFactory(containerEl);

    const foldersGroup = createGroup(heading);

    addToggleSetting(
        foldersGroup.addSetting,
        strings.settings.items.showFolderIcons.name,
        strings.settings.items.showFolderIcons.desc,
        () => plugin.settings.showFolderIcons,
        value => {
            plugin.settings.showFolderIcons = value;
        }
    );

    addToggleSetting(
        foldersGroup.addSetting,
        strings.settings.items.showRootFolder.name,
        strings.settings.items.showRootFolder.desc,
        () => plugin.settings.showRootFolder,
        value => {
            plugin.settings.showRootFolder = value;
        }
    );

    addToggleSetting(
        foldersGroup.addSetting,
        strings.settings.items.inheritFolderColors.name,
        strings.settings.items.inheritFolderColors.desc,
        () => plugin.settings.inheritFolderColors,
        value => {
            plugin.settings.inheritFolderColors = value;
        }
    );

    const folderSortOrderSetting = foldersGroup.addSetting(setting => {
        setting.setName(strings.settings.items.folderSortOrder.name).setDesc(strings.settings.items.folderSortOrder.desc);
        setting.addDropdown(dropdown => {
            dropdown
                .addOption('alpha-asc', strings.settings.items.folderSortOrder.options.alphaAsc)
                .addOption('alpha-desc', strings.settings.items.folderSortOrder.options.alphaDesc)
                .setValue(plugin.getFolderSortOrder())
                .onChange(value => {
                    if (!isAlphaSortOrder(value)) {
                        return;
                    }
                    plugin.setFolderSortOrder(value);
                });
        });
    });

    addSettingSyncModeToggle({ setting: folderSortOrderSetting, plugin, settingId: 'folderSortOrder' });

    const folderNotesGroup = createGroup(strings.settings.pages.foldersAndFolderNotes.groups.folderNotes);

    let folderNoteFilesGroupRootEl: HTMLElement | null = null;
    const enableFolderNotesSetting = folderNotesGroup.addSetting(setting => {
        setting.setName(strings.settings.items.enableFolderNotes.name).setDesc(strings.settings.items.enableFolderNotes.desc);
    });
    const folderNotesSettingsEl = wireToggleSettingWithDependentSection(
        enableFolderNotesSetting,
        () => plugin.settings.enableFolderNotes,
        async value => {
            plugin.settings.enableFolderNotes = value;
            await plugin.saveSettingsAndUpdate();
            if (folderNoteFilesGroupRootEl) {
                setElementVisible(folderNoteFilesGroupRootEl, value);
            }
        }
    );

    let showNearestFolderNoteSetting: Setting | null = null;
    new Setting(folderNotesSettingsEl)
        .setName(strings.settings.items.folderNoteOpenLocation.name)
        .setDesc(strings.settings.items.folderNoteOpenLocation.desc)
        .addDropdown(dropdown => {
            dropdown
                .addOption('current-tab', strings.settings.items.folderNoteOpenLocation.options.currentTab)
                .addOption('new-tab', strings.settings.items.folderNoteOpenLocation.options.newTab)
                .addOption('right-sidebar', strings.settings.items.folderNoteOpenLocation.options.rightSidebar)
                .setValue(plugin.settings.folderNoteOpenLocation)
                .onChange(async value => {
                    if (!isFolderNoteOpenLocation(value)) {
                        return;
                    }

                    plugin.settings.folderNoteOpenLocation = value;
                    await plugin.saveSettingsAndUpdate();
                    if (showNearestFolderNoteSetting) {
                        setElementVisible(showNearestFolderNoteSetting.settingEl, value === 'right-sidebar');
                    }
                });
        });

    showNearestFolderNoteSetting = new Setting(folderNotesSettingsEl)
        .setName(strings.settings.items.showClosestFolderNoteInRightSidebar.name)
        .setDesc(strings.settings.items.showClosestFolderNoteInRightSidebar.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showNearestFolderNoteInSidebar).onChange(async value => {
                plugin.settings.showNearestFolderNoteInSidebar = value;
                await plugin.saveSettingsAndUpdate();
            })
        );
    setElementVisible(showNearestFolderNoteSetting.settingEl, plugin.settings.folderNoteOpenLocation === 'right-sidebar');

    new Setting(folderNotesSettingsEl)
        .setName(strings.settings.items.folderNamesOpenFolderNotes.name)
        .setDesc(strings.settings.items.folderNamesOpenFolderNotes.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.enableFolderNoteLinks).onChange(async value => {
                plugin.settings.enableFolderNoteLinks = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(folderNotesSettingsEl)
        .setName(strings.settings.items.hideFolderNoteInList.name)
        .setDesc(strings.settings.items.hideFolderNoteInList.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.hideFolderNoteInList).onChange(async value => {
                plugin.settings.hideFolderNoteInList = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(folderNotesSettingsEl)
        .setName(strings.settings.items.pinCreatedFolderNote.name)
        .setDesc(strings.settings.items.pinCreatedFolderNote.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.pinCreatedFolderNote).onChange(async value => {
                plugin.settings.pinCreatedFolderNote = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const folderNoteFilesGroup = createGroup(strings.settings.pages.foldersAndFolderNotes.groups.folderNoteFiles);
    folderNoteFilesGroupRootEl = folderNoteFilesGroup.rootEl;
    setElementVisible(folderNoteFilesGroupRootEl, plugin.settings.enableFolderNotes);

    folderNoteFilesGroup.addSetting(setting => {
        setting.setName(strings.settings.items.folderNoteType.name).setDesc(strings.settings.items.folderNoteType.desc);
        setting.addDropdown(dropdown =>
            dropdown
                .addOption('ask', strings.settings.items.folderNoteType.options.ask)
                .addOption('markdown', strings.settings.items.folderNoteType.options.markdown)
                .addOption('canvas', strings.settings.items.folderNoteType.options.canvas)
                .addOption('base', strings.settings.items.folderNoteType.options.base)
                .setValue(plugin.settings.folderNoteType)
                .onChange(async value => {
                    if (!isFolderNoteCreationPreference(value)) {
                        return;
                    }
                    plugin.settings.folderNoteType = value;
                    await plugin.saveSettingsAndUpdate();
                })
        );
    });

    folderNoteFilesGroup.addSetting(setting => {
        context.configureDebouncedTextSetting(
            setting,
            strings.settings.items.folderNoteName.name,
            strings.settings.items.folderNoteName.desc,
            FOLDER_NOTE_NAME_PATTERN_TOKEN,
            () => plugin.settings.folderNoteNamePattern,
            value => {
                plugin.settings.folderNoteNamePattern = value;
            }
        );
    });

    let updateTemplateWarning = () => {};
    const folderNoteTemplateSetting = folderNoteFilesGroup.addSetting(setting => {
        context.configureDebouncedTextSetting(
            setting,
            strings.settings.items.folderNoteTemplate.name,
            strings.settings.items.folderNoteTemplate.desc,
            '',
            () => plugin.settings.folderNoteTemplate ?? '',
            value => {
                plugin.settings.folderNoteTemplate = normalizeOptionalVaultFilePath(value);
            },
            undefined,
            () => updateTemplateWarning()
        );
    });
    folderNoteTemplateSetting.controlEl.addClass('nn-setting-wide-input');
    const folderNoteTemplateWarningEl = folderNoteTemplateSetting.descEl.createDiv({
        cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
    });
    const folderNoteTemplateInputEl = folderNoteTemplateSetting.controlEl.querySelector<HTMLInputElement>('input');
    updateTemplateWarning = () => {
        const templatePath = folderNoteTemplateInputEl?.value ?? plugin.settings.folderNoteTemplate ?? '';
        const isCompatible = isFolderNoteTemplateCompatible(templatePath, plugin.settings.folderNoteType);
        folderNoteTemplateWarningEl.setText(isCompatible ? '' : strings.settings.items.folderNoteTemplate.formatWarning);
        setElementVisible(folderNoteTemplateWarningEl, !isCompatible);
    };

    if (folderNoteTemplateInputEl) {
        const templateSuggest = new FilePathInputSuggest(context.app, folderNoteTemplateInputEl, {
            getBaseFolder: () => plugin.settings.calendarTemplateFolder,
            includeFile: file => isSupportedFolderNoteExtension(file.extension)
        });
        folderNoteTemplateInputEl.addEventListener('input', updateTemplateWarning);
        folderNoteTemplateInputEl.addEventListener('click', () => templateSuggest.open());
    }
    context.registerSettingsUpdateListener('folders-folder-note-template-warning', updateTemplateWarning);
    updateTemplateWarning();

    folderNoteFilesGroup.addSetting(setting => renderFolderNoteTemplateInfoSetting(setting, context));
}

function renderFolderNoteTemplateInfoSetting(setting: Setting, context: SettingsTabContext): void {
    setting.setName('').setDesc('');
    setting.settingEl.addClass('nn-setting-info-container');
    setting.descEl.empty();

    const templaterSupportText = getTemplaterCreateNoteFromTemplate(context.app)
        ? strings.settings.items.templaterSupport.installed
        : strings.settings.items.templaterSupport.missing;
    setting.descEl.createEl('strong', { text: templaterSupportText });
}
