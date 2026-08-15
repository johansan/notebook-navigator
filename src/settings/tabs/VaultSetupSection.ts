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

import { DropdownComponent } from 'obsidian';
import type { Setting, SettingDefinitionGroup } from 'obsidian';
import { strings } from '../../i18n';
import { EditVaultProfilesModal } from '../../modals/EditVaultProfilesModal';
import { InputModal } from '../../modals/InputModal';
import { PropertyKeyVisibilityModal } from '../../modals/PropertyKeyVisibilityModal';
import { runAsyncAction } from '../../utils/async';
import { FILE_VISIBILITY, isFileVisibility } from '../../utils/fileTypeUtils';
import {
    createValidatedVaultProfileFromTemplate,
    DEFAULT_VAULT_PROFILE_ID,
    ensureVaultProfiles,
    validateVaultProfileNameOrNotify
} from '../../utils/vaultProfiles';
import { showNotice } from '../../utils/noticeUtils';
import { usesMobileChrome } from '../../utils/paneLayout';
import { addSettingSyncModeToggle } from '../syncModeToggle';
import type { VaultProfilePropertyKey } from '../types';
import { isVaultTitleOption } from '../types';
import { createGroupDefinition, createRenderDefinition } from '../nativeSettingControls';
import { createSettingGroupFactory } from '../settingGroups';
import type { SettingsTabContext } from './SettingsTabContext';

interface VaultSetupRenderers {
    renderProfileSetting(setting: Setting): void;
    renderVaultTitleSetting(setting: Setting): void;
    renderFileVisibilitySetting(setting: Setting): void;
    renderPropertyKeysSetting(setting: Setting): void;
}

/** Renders the vault setup section inside the General settings page. */
export function renderGeneralVaultSetupSection(context: SettingsTabContext): void {
    renderVaultSetupSection(context);
}

function renderVaultSetupSection(context: SettingsTabContext): void {
    const { containerEl } = context;
    const renderers = createVaultSetupRenderers(context);
    const createGroup = createSettingGroupFactory(containerEl);
    const vaultSetupGroup = createGroup(undefined);

    vaultSetupGroup.addSetting(setting => renderers.renderProfileSetting(setting));
    // The vault title places the profile selector in the desktop chrome (desktop and
    // tablets); phones render the profile trigger in the mobile header instead
    if (!usesMobileChrome()) {
        vaultSetupGroup.addSetting(setting => renderers.renderVaultTitleSetting(setting));
    }
    vaultSetupGroup.addSetting(setting => renderers.renderFileVisibilitySetting(setting));
    vaultSetupGroup.addSetting(setting => renderers.renderPropertyKeysSetting(setting));
}

export function createVaultSetupSettingDefinitions(context: SettingsTabContext): SettingDefinitionGroup[] {
    const renderers = createVaultSetupRenderers(context);
    const items: NonNullable<SettingDefinitionGroup['items']> = [
        createRenderDefinition({
            name: strings.settings.items.vaultProfiles.name,
            desc: strings.settings.items.vaultProfiles.desc,
            render: setting => renderers.renderProfileSetting(setting)
        }),
        createRenderDefinition({
            name: strings.settings.items.showFileTypes.name,
            desc: strings.settings.items.showFileTypes.desc,
            render: setting => renderers.renderFileVisibilitySetting(setting)
        }),
        createRenderDefinition({
            name: strings.settings.items.propertyKeys.name,
            desc: strings.settings.items.propertyKeys.desc,
            render: setting => renderers.renderPropertyKeysSetting(setting)
        })
    ];

    // The vault title places the profile selector in the desktop chrome (desktop and
    // tablets); phones render the profile trigger in the mobile header instead
    if (!usesMobileChrome()) {
        items.splice(
            1,
            0,
            createRenderDefinition({
                name: strings.settings.items.vaultTitlePlacement.name,
                desc: strings.settings.items.vaultTitlePlacement.desc,
                render: setting => renderers.renderVaultTitleSetting(setting)
            })
        );
    }

    return [createGroupDefinition(undefined, items)];
}

function createVaultSetupRenderers(context: SettingsTabContext): VaultSetupRenderers {
    const { plugin } = context;
    ensureVaultProfiles(plugin.settings);

    const fallbackProfileName = strings.settings.items.vaultProfiles.defaultName || 'Default';
    const getProfileDisplayName = (name?: string): string => {
        const trimmed = name?.trim();
        return trimmed && trimmed.length > 0 ? trimmed : fallbackProfileName;
    };
    const getActiveProfile = () => {
        return (
            plugin.settings.vaultProfiles.find(profile => profile.id === plugin.settings.vaultProfile) ??
            plugin.settings.vaultProfiles[0] ??
            null
        );
    };

    const ADD_PROFILE_OPTION_VALUE = '__add_new__';
    let profileDropdown: DropdownComponent | null = null;
    let fileVisibilityDropdown: DropdownComponent | null = null;
    let propertyKeysSummaryTextEl: HTMLSpanElement | null = null;

    const formatPropertyKeysSummary = (propertyKeys: VaultProfilePropertyKey[]): string => {
        const configuredKeys = propertyKeys.map(entry => entry.key.trim()).filter(key => key.length > 0);
        const configuredCount = configuredKeys.length;
        if (configuredCount === 0) {
            return strings.settings.items.propertyKeys.noneConfigured;
        }

        const visibleKeys = configuredKeys.slice(0, 5);
        const keyList = configuredCount > visibleKeys.length ? `${visibleKeys.join(', ')}, ...` : visibleKeys.join(', ');
        if (configuredCount === 1) {
            return strings.settings.items.propertyKeys.singleConfigured.replace('{properties}', keyList);
        }

        return strings.settings.items.propertyKeys.multipleConfigured
            .replace('{count}', configuredCount.toString())
            .replace('{properties}', keyList);
    };

    // Updates profile-related UI controls with current settings values.
    const refreshProfileControls = () => {
        if (profileDropdown) {
            const selectEl = profileDropdown.selectEl;
            while (selectEl.firstChild) {
                selectEl.removeChild(selectEl.firstChild);
            }
            plugin.settings.vaultProfiles.forEach(profile => {
                selectEl.createEl('option', {
                    value: profile.id,
                    text: getProfileDisplayName(profile.name)
                });
            });
            selectEl.createEl('option', {
                value: ADD_PROFILE_OPTION_VALUE,
                text: strings.settings.items.vaultProfiles.addProfileOption
            });
            const hasActive = plugin.settings.vaultProfiles.some(profile => profile.id === plugin.settings.vaultProfile);
            const nextActiveId = hasActive ? plugin.settings.vaultProfile : (plugin.settings.vaultProfiles[0]?.id ?? '');
            selectEl.value = nextActiveId;
        }
        const activeProfile = getActiveProfile();
        if (fileVisibilityDropdown) {
            fileVisibilityDropdown.setValue(activeProfile?.fileVisibility ?? FILE_VISIBILITY.SUPPORTED);
        }
        if (propertyKeysSummaryTextEl) {
            const propertyKeys = Array.isArray(activeProfile?.propertyKeys) ? activeProfile.propertyKeys : [];
            propertyKeysSummaryTextEl.setText(formatPropertyKeysSummary(propertyKeys));
        }
    };

    // Creates a new vault profile with the given name and switches to it.
    const handleAddProfile = async (profileName: string) => {
        const validatedName = validateVaultProfileNameOrNotify(plugin.settings.vaultProfiles, profileName);
        if (!validatedName) {
            return;
        }
        const activeProfile = getActiveProfile();
        const result = createValidatedVaultProfileFromTemplate(plugin.settings.vaultProfiles, validatedName, {
            sourceProfile: activeProfile,
            fallbackHiddenTags: activeProfile?.hiddenTags,
            fallbackFileVisibility: activeProfile?.fileVisibility
        });

        if ('error' in result) {
            if (result.error === 'duplicate') {
                showNotice(strings.settings.items.vaultProfiles.errors.duplicateName, { variant: 'warning' });
            } else {
                showNotice(strings.settings.items.vaultProfiles.errors.emptyName, { variant: 'warning' });
            }
            return;
        }

        plugin.settings.vaultProfiles.push(result.profile);
        plugin.setVaultProfile(result.profile.id);
        await plugin.saveSettingsAndUpdate();
        refreshProfileControls();
    };

    // Returns the requested profile ID if it exists, otherwise falls back to default or first profile.
    const resolveActiveProfileId = (profiles: typeof plugin.settings.vaultProfiles, requestedId: string) => {
        const hasRequested = profiles.some(profile => profile.id === requestedId);
        if (hasRequested) {
            return requestedId;
        }
        const defaultProfile = profiles.find(profile => profile.id === DEFAULT_VAULT_PROFILE_ID);
        if (defaultProfile) {
            return defaultProfile.id;
        }
        return profiles[0]?.id ?? DEFAULT_VAULT_PROFILE_ID;
    };

    // Opens the modal for editing, reordering, and deleting vault profiles.
    const openEditProfilesModal = () => {
        const modal = new EditVaultProfilesModal(context.app, {
            profiles: plugin.settings.vaultProfiles,
            activeProfileId: plugin.settings.vaultProfile,
            onSave: async (updatedProfiles, nextActiveProfileId) => {
                plugin.settings.vaultProfiles = updatedProfiles;
                const targetProfileId = resolveActiveProfileId(updatedProfiles, nextActiveProfileId);
                if (plugin.settings.vaultProfile === targetProfileId) {
                    await plugin.saveSettingsAndUpdate();
                } else {
                    plugin.setVaultProfile(targetProfileId);
                    await plugin.saveSettingsAndUpdate();
                }
                refreshProfileControls();
            }
        });
        modal.open();
    };

    const renderProfileSetting = (profileSetting: Setting): void => {
        profileSetting.setName(strings.settings.items.vaultProfiles.name).setDesc(strings.settings.items.vaultProfiles.desc);

        profileSetting.addDropdown(dropdown => {
            profileDropdown = dropdown;
            refreshProfileControls();
            dropdown.onChange(value => {
                if (value === ADD_PROFILE_OPTION_VALUE) {
                    if (profileDropdown) {
                        profileDropdown.selectEl.value = plugin.settings.vaultProfile;
                    }
                    const modal = new InputModal(
                        context.app,
                        strings.settings.items.vaultProfiles.addModalTitle,
                        strings.settings.items.vaultProfiles.addModalPlaceholder,
                        profileName => handleAddProfile(profileName)
                    );
                    modal.open();
                    return;
                }
                runAsyncAction(() => {
                    plugin.setVaultProfile(value);
                    refreshProfileControls();
                });
            });
            return dropdown;
        });

        profileSetting.addButton(button => {
            button.setButtonText(strings.settings.items.vaultProfiles.editProfilesButton).onClick(() => {
                openEditProfilesModal();
            });
            return button;
        });

        profileSetting.controlEl.addClass('nn-setting-profile-dropdown');
        addSettingSyncModeToggle({ setting: profileSetting, plugin, settingId: 'vaultProfile' });
    };

    const renderVaultTitleSetting = (setting: Setting): void => {
        setting
            .setName(strings.settings.items.vaultTitlePlacement.name)
            .setDesc(strings.settings.items.vaultTitlePlacement.desc)
            .addDropdown(dropdown =>
                dropdown
                    .addOption('header', strings.settings.items.vaultTitlePlacement.options.header)
                    .addOption('navigation', strings.settings.items.vaultTitlePlacement.options.navigation)
                    .setValue(plugin.settings.vaultTitle)
                    .onChange(async value => {
                        if (!isVaultTitleOption(value)) {
                            return;
                        }
                        plugin.settings.vaultTitle = value;
                        await plugin.saveSettingsAndUpdate();
                    })
            );
    };

    const renderFileVisibilitySetting = (setting: Setting): void => {
        setting
            .setName(strings.settings.items.showFileTypes.name)
            .setDesc(strings.settings.items.showFileTypes.desc)
            .addDropdown(dropdown => {
                fileVisibilityDropdown = dropdown;
                dropdown
                    .addOption(FILE_VISIBILITY.DOCUMENTS, strings.settings.items.showFileTypes.options.documents)
                    .addOption(FILE_VISIBILITY.SUPPORTED, strings.settings.items.showFileTypes.options.supported)
                    .addOption(FILE_VISIBILITY.ALL, strings.settings.items.showFileTypes.options.all)
                    .setValue(getActiveProfile()?.fileVisibility ?? FILE_VISIBILITY.SUPPORTED)
                    .onChange(async value => {
                        if (!isFileVisibility(value)) {
                            return;
                        }
                        const activeProfile = plugin.settings.vaultProfiles.find(profile => profile.id === plugin.settings.vaultProfile);
                        if (activeProfile) {
                            activeProfile.fileVisibility = value;
                        }
                        await plugin.saveSettingsAndUpdate();
                        refreshProfileControls();
                    });
                return dropdown;
            });
    };

    const renderPropertyKeysSetting = (propertyKeysSetting: Setting): void => {
        propertyKeysSetting.setName(strings.settings.items.propertyKeys.name).setDesc(strings.settings.items.propertyKeys.desc);

        const propertyKeysCountLineEl = propertyKeysSetting.descEl.createDiv({
            cls: 'nn-setting-property-keys-count-line'
        });
        propertyKeysSummaryTextEl = propertyKeysCountLineEl.createSpan({ cls: 'nn-setting-property-keys-summary-text' });

        propertyKeysSetting.addButton(button =>
            button.setButtonText(strings.settings.items.propertyKeys.addButtonTooltip).onClick(() => {
                const activeProfile = getActiveProfile();
                if (!activeProfile) {
                    return;
                }
                const modal = new PropertyKeyVisibilityModal(context.app, {
                    initialKeys: activeProfile.propertyKeys,
                    onSave: async nextKeys => {
                        activeProfile.propertyKeys = nextKeys;
                        await plugin.saveSettingsAndUpdate();
                        refreshProfileControls();
                    }
                });
                modal.open();
            })
        );

        refreshProfileControls();
    };

    return {
        renderProfileSetting,
        renderVaultTitleSetting,
        renderFileVisibilitySetting,
        renderPropertyKeysSetting
    };
}
