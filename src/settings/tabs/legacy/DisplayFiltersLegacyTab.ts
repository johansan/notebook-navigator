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
import { formatCommaSeparatedList, parseCommaSeparatedList } from '../../../utils/commaSeparatedListUtils';
import { normalizeTagPath } from '../../../utils/tagUtils';
import { ensureVaultProfiles } from '../../../utils/vaultProfiles';
import { createSettingGroupFactory } from '../../settingGroups';
import type { SettingsTabContext } from '../SettingsTabContext';

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderDisplayFiltersTab(context: SettingsTabContext): void {
    const { containerEl, plugin, configureDebouncedTextSetting } = context;
    ensureVaultProfiles(plugin.settings);
    const createGroup = createSettingGroupFactory(containerEl);
    const filteringGroup = createGroup(undefined);

    let excludedFoldersInput: HTMLInputElement | null = null;
    let descendantExcludedFoldersInput: HTMLInputElement | null = null;
    let hiddenTagsInput: HTMLInputElement | null = null;
    let hiddenFileTagsInput: HTMLInputElement | null = null;
    let excludedFilesInput: HTMLInputElement | null = null;
    let hiddenFileNamesInput: HTMLInputElement | null = null;

    const getActiveProfile = () => {
        return (
            plugin.settings.vaultProfiles.find(profile => profile.id === plugin.settings.vaultProfile) ??
            plugin.settings.vaultProfiles[0] ??
            null
        );
    };

    const refreshFilterControls = () => {
        const activeProfile = getActiveProfile();
        if (excludedFoldersInput) {
            excludedFoldersInput.value = activeProfile ? formatCommaSeparatedList(activeProfile.hiddenFolders) : '';
        }
        if (descendantExcludedFoldersInput) {
            descendantExcludedFoldersInput.value = activeProfile ? formatCommaSeparatedList(activeProfile.descendantExcludedFolders) : '';
        }
        if (hiddenTagsInput) {
            hiddenTagsInput.value = activeProfile ? formatCommaSeparatedList(activeProfile.hiddenTags) : '';
        }
        if (hiddenFileTagsInput) {
            hiddenFileTagsInput.value = activeProfile ? formatCommaSeparatedList(activeProfile.hiddenFileTags) : '';
        }
        if (excludedFilesInput) {
            excludedFilesInput.value = activeProfile ? formatCommaSeparatedList(activeProfile.hiddenFileProperties) : '';
        }
        if (hiddenFileNamesInput) {
            hiddenFileNamesInput.value = activeProfile ? formatCommaSeparatedList(activeProfile.hiddenFileNames) : '';
        }
    };

    const hiddenFileNamesSetting = filteringGroup.addSetting(setting => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.hideFiles.name,
            strings.settings.items.hideFiles.desc,
            strings.settings.items.hideFiles.placeholder,
            () => formatCommaSeparatedList(getActiveProfile()?.hiddenFileNames ?? []),
            value => {
                const activeProfile = getActiveProfile();
                if (!activeProfile) {
                    return;
                }
                const nextHiddenPatterns = parseCommaSeparatedList(value);
                activeProfile.hiddenFileNames = Array.from(new Set(nextHiddenPatterns));
            }
        );
    });
    hiddenFileNamesSetting.controlEl.addClass('nn-setting-wide-input');
    hiddenFileNamesInput = hiddenFileNamesSetting.controlEl.querySelector('input');

    const excludedFoldersSetting = filteringGroup.addSetting(setting => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.hideFolders.name,
            strings.settings.items.hideFolders.desc,
            strings.settings.items.hideFolders.placeholder,
            () => formatCommaSeparatedList(getActiveProfile()?.hiddenFolders ?? []),
            value => {
                const activeProfile = getActiveProfile();
                if (!activeProfile) {
                    return;
                }
                const nextHiddenFolders = parseCommaSeparatedList(value);
                activeProfile.hiddenFolders = Array.from(new Set(nextHiddenFolders));
            }
        );
    });
    excludedFoldersSetting.controlEl.addClass('nn-setting-wide-input');
    excludedFoldersInput = excludedFoldersSetting.controlEl.querySelector('input');

    const descendantExcludedFoldersSetting = filteringGroup.addSetting(setting => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.descendantExcludedFolders.name,
            strings.settings.items.descendantExcludedFolders.desc,
            strings.settings.items.descendantExcludedFolders.placeholder,
            () => formatCommaSeparatedList(getActiveProfile()?.descendantExcludedFolders ?? []),
            value => {
                const activeProfile = getActiveProfile();
                if (!activeProfile) {
                    return;
                }
                const nextDescendantExcludedFolders = parseCommaSeparatedList(value);
                activeProfile.descendantExcludedFolders = Array.from(new Set(nextDescendantExcludedFolders));
            }
        );
    });
    descendantExcludedFoldersSetting.controlEl.addClass('nn-setting-wide-input');
    descendantExcludedFoldersInput = descendantExcludedFoldersSetting.controlEl.querySelector('input');

    const hiddenTagsSetting = filteringGroup.addSetting(setting => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.hideTags.name,
            strings.settings.items.hideTags.desc,
            strings.settings.items.hideTags.placeholder,
            () => formatCommaSeparatedList(getActiveProfile()?.hiddenTags ?? []),
            value => {
                const activeProfile = getActiveProfile();
                if (!activeProfile) {
                    return;
                }
                const normalizedHiddenTags = parseCommaSeparatedList(value)
                    .map(entry => normalizeTagPath(entry))
                    .filter((entry): entry is string => entry !== null);

                activeProfile.hiddenTags = Array.from(new Set(normalizedHiddenTags));
            }
        );
    });
    hiddenTagsSetting.controlEl.addClass('nn-setting-wide-input');
    hiddenTagsInput = hiddenTagsSetting.controlEl.querySelector('input');

    const hiddenFileTagsSetting = filteringGroup.addSetting(setting => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.hideNotesWithTags.name,
            strings.settings.items.hideNotesWithTags.desc,
            strings.settings.items.hideNotesWithTags.placeholder,
            () => formatCommaSeparatedList(getActiveProfile()?.hiddenFileTags ?? []),
            value => {
                const activeProfile = getActiveProfile();
                if (!activeProfile) {
                    return;
                }

                const normalizedHiddenFileTags = parseCommaSeparatedList(value)
                    .map(entry => normalizeTagPath(entry))
                    .filter((entry): entry is string => entry !== null);

                activeProfile.hiddenFileTags = Array.from(new Set(normalizedHiddenFileTags));
            }
        );
    });
    hiddenFileTagsSetting.controlEl.addClass('nn-setting-wide-input');
    hiddenFileTagsInput = hiddenFileTagsSetting.controlEl.querySelector('input');

    const excludedFilesSetting = filteringGroup.addSetting(setting => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.hideNotesWithPropertyRules.name,
            strings.settings.items.hideNotesWithPropertyRules.desc,
            strings.settings.items.hideNotesWithPropertyRules.placeholder,
            () => formatCommaSeparatedList(getActiveProfile()?.hiddenFileProperties ?? []),
            value => {
                const activeProfile = getActiveProfile();
                if (!activeProfile) {
                    return;
                }
                const nextHiddenFiles = parseCommaSeparatedList(value);
                activeProfile.hiddenFileProperties = Array.from(new Set(nextHiddenFiles));
            }
        );
    });
    excludedFilesSetting.controlEl.addClass('nn-setting-wide-input');
    excludedFilesInput = excludedFilesSetting.controlEl.querySelector('input');

    refreshFilterControls();
}
