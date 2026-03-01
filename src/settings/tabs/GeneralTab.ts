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

import { ButtonComponent, DropdownComponent, Platform, Setting, SliderComponent } from 'obsidian';
import { MOMENT_FORMAT_DOCS_URL, getWelcomeVideoBaseUrl, SUPPORT_BUY_ME_A_COFFEE_URL, SUPPORT_SPONSOR_URL } from '../../constants/urls';
import { HomepageModal } from '../../modals/HomepageModal';
import { strings } from '../../i18n';
import { showNotice } from '../../utils/noticeUtils';
import { FILE_VISIBILITY, type FileVisibility } from '../../utils/fileTypeUtils';
import { TIMEOUTS } from '../../types/obsidian-extended';
import {
    MAX_PANE_TRANSITION_DURATION_MS,
    MIN_PANE_TRANSITION_DURATION_MS,
    PANE_TRANSITION_DURATION_STEP_MS,
    type BackgroundMode
} from '../../types';
import type {
    FileOpenContext,
    ListToolbarButtonId,
    MultiSelectModifier,
    NavigationToolbarButtonId,
    VaultProfilePropertyKey,
    VaultTitleOption
} from '../types';
import type { SettingsTabContext } from './SettingsTabContext';
import { resetHiddenToggleIfNoSources } from '../../utils/exclusionUtils';
import { InputModal } from '../../modals/InputModal';
import { EditVaultProfilesModal } from '../../modals/EditVaultProfilesModal';
import {
    DEFAULT_UI_SCALE,
    formatUIScalePercent,
    MIN_UI_SCALE_PERCENT,
    MAX_UI_SCALE_PERCENT,
    UI_SCALE_PERCENT_STEP,
    scaleToPercent,
    percentToScale
} from '../../utils/uiScale';
import { runAsyncAction } from '../../utils/async';
import { getIconService } from '../../services/icons';
import {
    DEFAULT_VAULT_PROFILE_ID,
    ensureVaultProfiles,
    createValidatedVaultProfileFromTemplate,
    validateVaultProfileNameOrNotify
} from '../../utils/vaultProfiles';
import { resolveUXIcon, type UXIconId } from '../../utils/uxIcons';
import { normalizeTagPath } from '../../utils/tagUtils';
import { formatCommaSeparatedList, parseCommaSeparatedList } from '../../utils/commaSeparatedListUtils';
import type NotebookNavigatorPlugin from '../../main';
import { PropertyKeyVisibilityModal } from '../../modals/PropertyKeyVisibilityModal';
import { DEFAULT_SETTINGS } from '../defaultSettings';
import { createSettingGroupFactory } from '../settingGroups';
import { addSettingSyncModeToggle } from '../syncModeToggle';
import { createSubSettingsContainer, setElementVisible, wireToggleSettingWithSubSettings } from '../subSettings';
import { createSettingDescriptionWithExternalLink } from './externalLink';
import { normalizeCalendarCustomRootFolder } from '../../utils/calendarCustomNotePatterns';
import { FolderPathInputSuggest } from '../../suggest/FolderPathInputSuggest';

/** Renders the general settings tab */
export function renderGeneralTab(context: SettingsTabContext): void {
    const { containerEl, plugin, addToggleSetting, configureDebouncedTextSetting } = context;
    const pluginVersion = plugin.manifest.version;
    ensureVaultProfiles(plugin.settings);

    const createGroup = createSettingGroupFactory(containerEl);
    const topGroup = createGroup(undefined);

    let updateStatusEl: HTMLDivElement | null = null;

    const renderUpdateStatus = (version: string | null) => {
        if (!updateStatusEl) {
            return;
        }
        const hasVersion = Boolean(version);
        updateStatusEl.setText(hasVersion ? strings.settings.items.updateCheckOnStart.status.replace('{version}', version ?? '') : '');
        setElementVisible(updateStatusEl, hasVersion);
    };

    const applyCurrentNotice = () => {
        const notice = plugin.getPendingUpdateNotice();
        renderUpdateStatus(notice?.version ?? null);
    };

    const updateStatusListenerId = 'general-update-status';
    plugin.unregisterUpdateNoticeListener(updateStatusListenerId);

    const whatsNewSetting = topGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.whatsNew.name.replace('{version}', pluginVersion))
            .setDesc(strings.settings.items.whatsNew.desc)
            .addButton(button =>
                button.setButtonText(strings.settings.items.whatsNew.buttonText).onClick(() => {
                    // Load and display release notes without blocking the UI
                    runAsyncAction(async () => {
                        const { WhatsNewModal } = await import('../../modals/WhatsNewModal');
                        const { getLatestReleaseNotes } = await import('../../releaseNotes');
                        const latestNotes = getLatestReleaseNotes();
                        new WhatsNewModal(context.app, latestNotes, plugin.settings.dateFormat, () => {
                            setTimeout(() => {
                                runAsyncAction(async () => {
                                    plugin.settings.lastShownVersion = pluginVersion;
                                    await plugin.saveSettingsAndUpdate();
                                });
                            }, 1000);
                        }).open();
                    });
                })
            );
    });

    updateStatusEl = whatsNewSetting.descEl.createDiv({ cls: 'setting-item-description nn-update-status nn-setting-hidden' });

    applyCurrentNotice();

    plugin.registerUpdateNoticeListener(updateStatusListenerId, notice => {
        renderUpdateStatus(notice?.version ?? null);
    });

    const supportSetting = topGroup.addSetting(setting => {
        setting.setName(strings.settings.items.supportDevelopment.name).setDesc(strings.settings.items.supportDevelopment.desc);
    });

    supportSetting.addButton(button => {
        button.setButtonText(strings.settings.items.supportDevelopment.buttonText).onClick(() => window.open(SUPPORT_SPONSOR_URL));
        button.buttonEl.addClass('nn-support-button');
    });

    supportSetting.addButton(button => {
        button
            .setButtonText(strings.settings.items.supportDevelopment.coffeeButton)
            .onClick(() => window.open(SUPPORT_BUY_ME_A_COFFEE_URL));
        button.buttonEl.addClass('nn-support-button');
    });

    topGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.masteringVideo.name)
            .setDesc(strings.settings.items.masteringVideo.desc)
            .addButton(button => {
                button
                    .setIcon('lucide-play')
                    .setTooltip(strings.modals.welcome.openVideoButton)
                    .onClick(() => {
                        window.open(getWelcomeVideoBaseUrl());
                    });
                button.buttonEl.addClass('nn-youtube-button');
                button.buttonEl.setAttr('aria-label', strings.modals.welcome.openVideoButton);
            });
    });

    const vaultProfilesGroup = createGroup(strings.settings.groups.general.vaultProfiles);
    const filteringGroup = createGroup(strings.settings.groups.general.filtering);

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
    let excludedFoldersInput: HTMLInputElement | null = null;
    let hiddenTagsInput: HTMLInputElement | null = null;
    let hiddenFileTagsInput: HTMLInputElement | null = null;
    let excludedFilesInput: HTMLInputElement | null = null;
    let hiddenFileNamesInput: HTMLInputElement | null = null;
    let propertyKeysSummaryTextEl: HTMLSpanElement | null = null;

    const formatPropertyKeysSummary = (propertyKeys: VaultProfilePropertyKey[]): string => {
        const configuredKeys = propertyKeys.map(entry => entry.key.trim()).filter(key => key.length > 0);
        const configuredCount = configuredKeys.length;
        if (configuredCount === 0) {
            return strings.settings.items.propertyFields.noneConfigured;
        }

        const visibleKeys = configuredKeys.slice(0, 5);
        const keyList = configuredCount > visibleKeys.length ? `${visibleKeys.join(', ')}, ...` : visibleKeys.join(', ');
        if (configuredCount === 1) {
            return strings.settings.items.propertyFields.singleConfigured.replace('{properties}', keyList);
        }

        return strings.settings.items.propertyFields.multipleConfigured
            .replace('{count}', configuredCount.toString())
            .replace('{properties}', keyList);
    };

    // Updates all profile-related UI controls with current settings values
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
        if (excludedFoldersInput) {
            excludedFoldersInput.value = activeProfile ? formatCommaSeparatedList(activeProfile.hiddenFolders) : '';
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
        if (propertyKeysSummaryTextEl) {
            const propertyKeys = Array.isArray(activeProfile?.propertyKeys) ? activeProfile.propertyKeys : [];
            propertyKeysSummaryTextEl.setText(formatPropertyKeysSummary(propertyKeys));
        }
    };

    // Creates a new vault profile with the given name and switches to it
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

    // Returns the requested profile ID if it exists, otherwise falls back to default or first profile
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

    // Opens the modal for editing, reordering, and deleting vault profiles
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

    const profileSetting = vaultProfilesGroup.addSetting(setting => {
        setting.setName(strings.settings.items.vaultProfiles.name).setDesc(strings.settings.items.vaultProfiles.desc);
    });

    profileSetting.addDropdown(dropdown => {
        profileDropdown = dropdown;
        refreshProfileControls();
        dropdown.onChange(value => {
            // Handle "Add new profile" option by opening the input modal
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

    if (!Platform.isMobile) {
        vaultProfilesGroup.addSetting(setting => {
            setting
                .setName(strings.settings.items.vaultTitle.name)
                .setDesc(strings.settings.items.vaultTitle.desc)
                .addDropdown(dropdown =>
                    dropdown
                        .addOption('header', strings.settings.items.vaultTitle.options.header)
                        .addOption('navigation', strings.settings.items.vaultTitle.options.navigation)
                        .setValue(plugin.settings.vaultTitle)
                        .onChange(async (value: VaultTitleOption) => {
                            plugin.settings.vaultTitle = value;
                            await plugin.saveSettingsAndUpdate();
                        })
                );
        });
    }

    filteringGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.fileVisibility.name)
            .setDesc(strings.settings.items.fileVisibility.desc)
            .addDropdown(dropdown => {
                fileVisibilityDropdown = dropdown;
                dropdown
                    .addOption(FILE_VISIBILITY.DOCUMENTS, strings.settings.items.fileVisibility.options.documents)
                    .addOption(FILE_VISIBILITY.SUPPORTED, strings.settings.items.fileVisibility.options.supported)
                    .addOption(FILE_VISIBILITY.ALL, strings.settings.items.fileVisibility.options.all)
                    .setValue(getActiveProfile()?.fileVisibility ?? FILE_VISIBILITY.SUPPORTED)
                    .onChange(async (value: FileVisibility) => {
                        const activeProfile = plugin.settings.vaultProfiles.find(profile => profile.id === plugin.settings.vaultProfile);
                        if (activeProfile) {
                            activeProfile.fileVisibility = value;
                        }
                        await plugin.saveSettingsAndUpdate();
                        refreshProfileControls();
                    });
                return dropdown;
            });
    });

    const propertyKeysSetting = filteringGroup.addSetting(setting => {
        setting.setName(strings.settings.items.propertyFields.name).setDesc(strings.settings.items.propertyFields.desc);
    });

    const propertyKeysCountLineEl = propertyKeysSetting.descEl.createDiv({
        cls: 'nn-setting-property-keys-count-line'
    });
    propertyKeysSummaryTextEl = propertyKeysCountLineEl.createSpan({ cls: 'nn-setting-property-keys-summary-text' });

    propertyKeysSetting.addButton(button =>
        button.setButtonText(strings.settings.items.propertyFields.addButtonTooltip).onClick(() => {
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

    const hiddenFileNamesSetting = filteringGroup.addSetting(setting => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.excludedFileNamePatterns.name,
            strings.settings.items.excludedFileNamePatterns.desc,
            strings.settings.items.excludedFileNamePatterns.placeholder,
            () => formatCommaSeparatedList(getActiveProfile()?.hiddenFileNames ?? []),
            value => {
                const activeProfile = getActiveProfile();
                if (!activeProfile) {
                    return;
                }
                const nextHiddenPatterns = parseCommaSeparatedList(value);
                activeProfile.hiddenFileNames = Array.from(new Set(nextHiddenPatterns));
                resetHiddenToggleIfNoSources({
                    settings: plugin.settings,
                    showHiddenItems: plugin.getUXPreferences().showHiddenItems,
                    setShowHiddenItems: value => plugin.setShowHiddenItems(value)
                });
            }
        );
    });
    hiddenFileNamesSetting.controlEl.addClass('nn-setting-wide-input');
    hiddenFileNamesInput = hiddenFileNamesSetting.controlEl.querySelector('input');

    const excludedFoldersSetting = filteringGroup.addSetting(setting => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.excludedFolders.name,
            strings.settings.items.excludedFolders.desc,
            strings.settings.items.excludedFolders.placeholder,
            () => formatCommaSeparatedList(getActiveProfile()?.hiddenFolders ?? []),
            value => {
                const activeProfile = getActiveProfile();
                if (!activeProfile) {
                    return;
                }
                const nextHiddenFolders = parseCommaSeparatedList(value);
                activeProfile.hiddenFolders = Array.from(new Set(nextHiddenFolders));
                resetHiddenToggleIfNoSources({
                    settings: plugin.settings,
                    showHiddenItems: plugin.getUXPreferences().showHiddenItems,
                    setShowHiddenItems: value => plugin.setShowHiddenItems(value)
                });
            }
        );
    });
    excludedFoldersSetting.controlEl.addClass('nn-setting-wide-input');
    excludedFoldersInput = excludedFoldersSetting.controlEl.querySelector('input');

    const hiddenTagsSetting = filteringGroup.addSetting(setting => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.hiddenTags.name,
            strings.settings.items.hiddenTags.desc,
            strings.settings.items.hiddenTags.placeholder,
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
                resetHiddenToggleIfNoSources({
                    settings: plugin.settings,
                    showHiddenItems: plugin.getUXPreferences().showHiddenItems,
                    setShowHiddenItems: value => plugin.setShowHiddenItems(value)
                });
            }
        );
    });
    hiddenTagsSetting.controlEl.addClass('nn-setting-wide-input');
    hiddenTagsInput = hiddenTagsSetting.controlEl.querySelector('input');

    const hiddenFileTagsSetting = filteringGroup.addSetting(setting => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.hiddenFileTags.name,
            strings.settings.items.hiddenFileTags.desc,
            strings.settings.items.hiddenFileTags.placeholder,
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
                resetHiddenToggleIfNoSources({
                    settings: plugin.settings,
                    showHiddenItems: plugin.getUXPreferences().showHiddenItems,
                    setShowHiddenItems: value => plugin.setShowHiddenItems(value)
                });
            }
        );
    });
    hiddenFileTagsSetting.controlEl.addClass('nn-setting-wide-input');
    hiddenFileTagsInput = hiddenFileTagsSetting.controlEl.querySelector('input');

    const excludedFilesSetting = filteringGroup.addSetting(setting => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.excludedNotes.name,
            strings.settings.items.excludedNotes.desc,
            strings.settings.items.excludedNotes.placeholder,
            () => formatCommaSeparatedList(getActiveProfile()?.hiddenFileProperties ?? []),
            value => {
                const activeProfile = getActiveProfile();
                if (!activeProfile) {
                    return;
                }
                const nextHiddenFiles = parseCommaSeparatedList(value);
                activeProfile.hiddenFileProperties = Array.from(new Set(nextHiddenFiles));
                resetHiddenToggleIfNoSources({
                    settings: plugin.settings,
                    showHiddenItems: plugin.getUXPreferences().showHiddenItems,
                    setShowHiddenItems: value => plugin.setShowHiddenItems(value)
                });
            }
        );
    });
    excludedFilesSetting.controlEl.addClass('nn-setting-wide-input');
    excludedFilesInput = excludedFilesSetting.controlEl.querySelector('input');
    refreshProfileControls();

    const templatesGroup = createGroup(strings.settings.groups.general.templates);
    const templateFolderSetting = templatesGroup.addSetting(setting => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.calendarTemplateFolder.name,
            strings.settings.items.calendarTemplateFolder.desc,
            strings.settings.items.calendarTemplateFolder.placeholder,
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

    const behaviorGroup = createGroup(strings.settings.groups.general.behavior);

    addToggleSetting(
        behaviorGroup.addSetting,
        strings.settings.items.createNewNotesInNewTab.name,
        strings.settings.items.createNewNotesInNewTab.desc,
        () => plugin.settings.createNewNotesInNewTab,
        value => {
            plugin.settings.createNewNotesInNewTab = value;
        }
    );

    const autoRevealSetting = behaviorGroup.addSetting(setting => {
        setting.setName(strings.settings.items.autoRevealActiveNote.name).setDesc(strings.settings.items.autoRevealActiveNote.desc);
    });

    const autoRevealSettingsEl = wireToggleSettingWithSubSettings(
        autoRevealSetting,
        () => plugin.settings.autoRevealActiveFile,
        async value => {
            plugin.settings.autoRevealActiveFile = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    new Setting(autoRevealSettingsEl)
        .setName(strings.settings.items.autoRevealShortestPath.name)
        .setDesc(strings.settings.items.autoRevealShortestPath.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.autoRevealShortestPath).onChange(async value => {
                plugin.settings.autoRevealShortestPath = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(autoRevealSettingsEl)
        .setName(strings.settings.items.autoRevealIgnoreRightSidebar.name)
        .setDesc(strings.settings.items.autoRevealIgnoreRightSidebar.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.autoRevealIgnoreRightSidebar).onChange(async value => {
                plugin.settings.autoRevealIgnoreRightSidebar = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const paneTransitionSetting = behaviorGroup.addSetting(setting => {
        setting.setName(strings.settings.items.paneTransitionDuration.name).setDesc(strings.settings.items.paneTransitionDuration.desc);
    });

    const paneTransitionValueEl = paneTransitionSetting.controlEl.createDiv({ cls: 'nn-slider-value' });
    const updatePaneTransitionLabel = (ms: number) => {
        paneTransitionValueEl.setText(`${ms} ms`);
    };
    updatePaneTransitionLabel(plugin.settings.paneTransitionDuration);

    let paneTransitionSlider: SliderComponent;
    paneTransitionSetting
        .addSlider(slider => {
            paneTransitionSlider = slider
                .setLimits(MIN_PANE_TRANSITION_DURATION_MS, MAX_PANE_TRANSITION_DURATION_MS, PANE_TRANSITION_DURATION_STEP_MS)
                .setValue(plugin.settings.paneTransitionDuration)
                .setInstant(false)
                .setDynamicTooltip()
                .onChange(value => {
                    plugin.setPaneTransitionDuration(value);
                    updatePaneTransitionLabel(value);
                });
            return slider;
        })
        .addExtraButton(button =>
            button
                .setIcon('lucide-rotate-ccw')
                .setTooltip(strings.settings.items.paneTransitionDuration.resetTooltip)
                .onClick(() => {
                    runAsyncAction(() => {
                        const defaultValue = DEFAULT_SETTINGS.paneTransitionDuration;
                        paneTransitionSlider.setValue(defaultValue);
                        plugin.setPaneTransitionDuration(defaultValue);
                        updatePaneTransitionLabel(defaultValue);
                    });
                })
        );

    addSettingSyncModeToggle({ setting: paneTransitionSetting, plugin, settingId: 'paneTransitionDuration' });

    if (!Platform.isMobile) {
        const keyboardNavigationGroup = createGroup(strings.settings.groups.general.keyboardNavigation);

        keyboardNavigationGroup.addSetting(setting => {
            setting
                .setName(strings.settings.items.multiSelectModifier.name)
                .setDesc(strings.settings.items.multiSelectModifier.desc)
                .addDropdown(dropdown =>
                    dropdown
                        .addOption('cmdCtrl', strings.settings.items.multiSelectModifier.options.cmdCtrl)
                        .addOption('optionAlt', strings.settings.items.multiSelectModifier.options.optionAlt)
                        .setValue(plugin.settings.multiSelectModifier)
                        .onChange(async (value: MultiSelectModifier) => {
                            plugin.settings.multiSelectModifier = value;
                            await plugin.saveSettingsAndUpdate();
                        })
                );
        });

        const enterToOpenSetting = keyboardNavigationGroup.addSetting(setting => {
            setting.setName(strings.settings.items.enterToOpenFiles.name).setDesc(strings.settings.items.enterToOpenFiles.desc);
        });

        const enterToOpenSettingsEl = wireToggleSettingWithSubSettings(
            enterToOpenSetting,
            () => plugin.settings.enterToOpenFiles,
            async value => {
                plugin.settings.enterToOpenFiles = value;
                await plugin.saveSettingsAndUpdate();
            }
        );

        const normalizeOpenContext = (value: string): FileOpenContext => {
            if (value === 'split' || value === 'window') {
                return value;
            }
            return 'tab';
        };

        new Setting(enterToOpenSettingsEl)
            .setName(strings.settings.items.shiftEnterOpenContext.name)
            .setDesc(strings.settings.items.shiftEnterOpenContext.desc)
            .addDropdown(dropdown =>
                dropdown
                    .addOption('tab', strings.contextMenu.file.openInNewTab)
                    .addOption('split', strings.contextMenu.file.openToRight)
                    .addOption('window', strings.contextMenu.file.openInNewWindow)
                    .setValue(plugin.settings.shiftEnterOpenContext)
                    .onChange(async value => {
                        plugin.settings.shiftEnterOpenContext = normalizeOpenContext(value);
                        await plugin.saveSettingsAndUpdate();
                    })
            );

        const cmdCtrlStrings = Platform.isMacOS ? strings.settings.items.cmdEnterOpenContext : strings.settings.items.ctrlEnterOpenContext;

        new Setting(enterToOpenSettingsEl)
            .setName(cmdCtrlStrings.name)
            .setDesc(cmdCtrlStrings.desc)
            .addDropdown(dropdown =>
                dropdown
                    .addOption('tab', strings.contextMenu.file.openInNewTab)
                    .addOption('split', strings.contextMenu.file.openToRight)
                    .addOption('window', strings.contextMenu.file.openInNewWindow)
                    .setValue(plugin.settings.cmdCtrlEnterOpenContext)
                    .onChange(async value => {
                        plugin.settings.cmdCtrlEnterOpenContext = normalizeOpenContext(value);
                        await plugin.saveSettingsAndUpdate();
                    })
            );
    }

    if (!Platform.isMobile) {
        const desktopAppearanceGroup = createGroup(strings.settings.groups.general.desktopAppearance);

        const dualPaneSetting = desktopAppearanceGroup.addSetting(setting => {
            setting
                .setName(strings.settings.items.dualPane.name)
                .setDesc(strings.settings.items.dualPane.desc)
                .addToggle(toggle =>
                    toggle.setValue(plugin.useDualPane()).onChange(value => {
                        plugin.setDualPanePreference(value);
                    })
                );
        });

        addSettingSyncModeToggle({ setting: dualPaneSetting, plugin, settingId: 'dualPane' });

        const dualPaneOrientationSetting = desktopAppearanceGroup.addSetting(setting => {
            setting
                .setName(strings.settings.items.dualPaneOrientation.name)
                .setDesc(strings.settings.items.dualPaneOrientation.desc)
                .addDropdown(dropdown => {
                    dropdown
                        .addOptions({
                            horizontal: strings.settings.items.dualPaneOrientation.options.horizontal,
                            vertical: strings.settings.items.dualPaneOrientation.options.vertical
                        })
                        .setValue(plugin.getDualPaneOrientation())
                        .onChange(async value => {
                            const nextOrientation = value === 'vertical' ? 'vertical' : 'horizontal';
                            await plugin.setDualPaneOrientation(nextOrientation);
                        });
                });
        });

        addSettingSyncModeToggle({ setting: dualPaneOrientationSetting, plugin, settingId: 'dualPaneOrientation' });

        const navigationPaneSideSetting = desktopAppearanceGroup.addSetting(setting => {
            setting
                .setName('Navigation pane side')
                .setDesc('Choose which side the navigation pane appears on (horizontal mode only)')
                .addDropdown(dropdown => {
                    dropdown
                        .addOptions({
                            left: 'Left (default)',
                            right: 'Right'
                        })
                        .setValue(plugin.getNavigationPaneSide())
                        .onChange(async value => {
                            const nextValue = value === 'right' ? 'right' : 'left';
                            plugin.setNavigationPaneSide(nextValue);
                        });
                });
        });

        addSettingSyncModeToggle({ setting: navigationPaneSideSetting, plugin, settingId: 'navigationPaneSide' });

        desktopAppearanceGroup.addSetting(setting => {
            setting
                .setName(strings.settings.items.appearanceBackground.name)
                .setDesc(strings.settings.items.appearanceBackground.desc)
                .addDropdown(dropdown =>
                    dropdown
                        .addOptions({
                            separate: strings.settings.items.appearanceBackground.options.separate,
                            primary: strings.settings.items.appearanceBackground.options.primary,
                            secondary: strings.settings.items.appearanceBackground.options.secondary
                        })
                        .setValue(plugin.settings.desktopBackground ?? 'separate')
                        .onChange(async value => {
                            const nextValue: BackgroundMode = value === 'primary' || value === 'secondary' ? value : 'separate';
                            plugin.settings.desktopBackground = nextValue;
                            await plugin.saveSettingsAndUpdate();
                        })
                );
        });

        const showTooltipsSetting = desktopAppearanceGroup.addSetting(setting => {
            setting.setName(strings.settings.items.showTooltips.name).setDesc(strings.settings.items.showTooltips.desc);
        });

        const showTooltipsSubSettings = wireToggleSettingWithSubSettings(
            showTooltipsSetting,
            () => plugin.settings.showTooltips,
            async value => {
                plugin.settings.showTooltips = value;
                await plugin.saveSettingsAndUpdate();
            }
        );

        new Setting(showTooltipsSubSettings)
            .setName(strings.settings.items.showTooltipPath.name)
            .setDesc(strings.settings.items.showTooltipPath.desc)
            .addToggle(toggle =>
                toggle.setValue(plugin.settings.showTooltipPath).onChange(async value => {
                    plugin.settings.showTooltipPath = value;
                    await plugin.saveSettingsAndUpdate();
                })
            );
    }

    if (Platform.isMobile) {
        const mobileAppearanceGroup = createGroup(strings.settings.groups.general.mobileAppearance);

        const useFloatingToolbarsSetting = mobileAppearanceGroup.addSetting(setting => {
            setting
                .setName(strings.settings.items.useFloatingToolbars.name)
                .setDesc(strings.settings.items.useFloatingToolbars.desc)
                .addToggle(toggle =>
                    toggle.setValue(plugin.settings.useFloatingToolbars).onChange(value => {
                        plugin.setUseFloatingToolbars(value);
                    })
                );
        });

        addSettingSyncModeToggle({ setting: useFloatingToolbarsSetting, plugin, settingId: 'useFloatingToolbars' });
    }

    const viewGroup = createGroup(strings.settings.groups.general.view);

    const uiScaleSetting = viewGroup.addSetting(setting => {
        setting.setName(strings.settings.items.appearanceScale.name).setDesc(strings.settings.items.appearanceScale.desc);
    });

    const uiScaleValueEl = uiScaleSetting.controlEl.createDiv({ cls: 'nn-slider-value' });
    const updateUIScaleLabel = (percentValue: number) => {
        uiScaleValueEl.setText(formatUIScalePercent(percentToScale(percentValue)));
    };

    let uiScaleSlider: SliderComponent;
    const initialUIScalePercent = scaleToPercent(plugin.getUIScale());

    uiScaleSetting
        .addSlider(slider => {
            uiScaleSlider = slider
                .setLimits(MIN_UI_SCALE_PERCENT, MAX_UI_SCALE_PERCENT, UI_SCALE_PERCENT_STEP)
                .setInstant(false)
                .setDynamicTooltip()
                .setValue(initialUIScalePercent)
                .onChange(value => {
                    const nextValue = percentToScale(value);
                    plugin.setUIScale(nextValue);
                    updateUIScaleLabel(value);
                });
            return slider;
        })
        .addExtraButton(button =>
            button
                .setIcon('lucide-rotate-ccw')
                .setTooltip('Restore to default (100%)')
                .onClick(() => {
                    const defaultPercent = scaleToPercent(DEFAULT_UI_SCALE);
                    uiScaleSlider.setValue(defaultPercent);
                    plugin.setUIScale(DEFAULT_UI_SCALE);
                    updateUIScaleLabel(defaultPercent);
                })
        );

    addSettingSyncModeToggle({ setting: uiScaleSetting, plugin, settingId: 'uiScale' });

    updateUIScaleLabel(initialUIScalePercent);

    viewGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.startView.name)
            .setDesc(strings.settings.items.startView.desc)
            .addDropdown(dropdown => {
                dropdown
                    .addOptions({
                        navigation: strings.settings.items.startView.options.navigation,
                        files: strings.settings.items.startView.options.files
                    })
                    .setValue(plugin.settings.startView)
                    .onChange(async value => {
                        const nextView = value === 'navigation' ? 'navigation' : 'files';
                        plugin.settings.startView = nextView;
                        await plugin.saveSettingsAndUpdate();
                    });
            });
    });

    const homepageSetting = viewGroup.addSetting(setting => {
        setting.setName(strings.settings.items.homepage.name);
    });
    homepageSetting.setDesc('');

    const homepageDescEl = homepageSetting.descEl;
    homepageDescEl.empty();
    homepageDescEl.createDiv({ text: strings.settings.items.homepage.desc });

    const homepageValueEl = homepageDescEl.createDiv();
    let clearHomepageButton: ButtonComponent | null = null;

    /** Updates the displayed homepage path and button state */
    const renderHomepageValue = () => {
        const { homepage, mobileHomepage, useMobileHomepage } = plugin.settings;
        const isMobile = Platform.isMobile;

        const activePath = isMobile && useMobileHomepage ? mobileHomepage : homepage;
        const labelTemplate =
            isMobile && useMobileHomepage
                ? (strings.settings.items.homepage.currentMobile ?? strings.settings.items.homepage.current)
                : strings.settings.items.homepage.current;

        homepageValueEl.setText('');
        if (activePath) {
            homepageValueEl.setText(labelTemplate.replace('{path}', activePath));
        }

        if (clearHomepageButton) {
            const canClear = isMobile && useMobileHomepage ? Boolean(mobileHomepage) : Boolean(homepage);
            clearHomepageButton.setDisabled(!canClear);
        }
    };

    homepageSetting.addButton(button => {
        button.setButtonText(strings.settings.items.homepage.chooseButton);
        button.onClick(() => {
            new HomepageModal(context.app, file => {
                if (Platform.isMobile && plugin.settings.useMobileHomepage) {
                    plugin.settings.mobileHomepage = file.path;
                } else {
                    plugin.settings.homepage = file.path;
                }
                renderHomepageValue();
                // Save homepage setting without blocking the UI
                runAsyncAction(() => plugin.saveSettingsAndUpdate());
            }).open();
        });
    });

    homepageSetting.addButton(button => {
        button.setButtonText(strings.common.clear);
        clearHomepageButton = button;
        // Clear homepage file without blocking the UI
        button.onClick(() => {
            runAsyncAction(async () => {
                if (Platform.isMobile && plugin.settings.useMobileHomepage) {
                    if (!plugin.settings.mobileHomepage) {
                        return;
                    }
                    plugin.settings.mobileHomepage = null;
                } else {
                    if (!plugin.settings.homepage) {
                        return;
                    }
                    plugin.settings.homepage = null;
                }
                renderHomepageValue();
                await plugin.saveSettingsAndUpdate();
            });
        });
    });

    renderHomepageValue();

    const homepageSubSettingsEl = createSubSettingsContainer(homepageSetting);
    new Setting(homepageSubSettingsEl)
        .setName(strings.settings.items.homepage.separateMobile.name)
        .setDesc(strings.settings.items.homepage.separateMobile.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.useMobileHomepage).onChange(async value => {
                plugin.settings.useMobileHomepage = value;
                await plugin.saveSettingsAndUpdate();
                renderHomepageValue();
            })
        );

    viewGroup
        .addSetting(setting => {
            setting.setName(strings.settings.items.showInfoButtons.name).setDesc(strings.settings.items.showInfoButtons.desc);
        })
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showInfoButtons).onChange(async value => {
                plugin.settings.showInfoButtons = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    renderToolbarVisibilitySetting(createSetting => viewGroup.addSetting(createSetting), plugin);

    const iconsGroup = createGroup(strings.settings.groups.general.icons);

    iconsGroup.addSetting(setting => {
        setting.setName(strings.settings.items.interfaceIcons.name).setDesc(strings.settings.items.interfaceIcons.desc);
        setting.addButton(button => {
            button.setButtonText(strings.settings.items.interfaceIcons.buttonText).onClick(() => {
                runAsyncAction(async () => {
                    const metadataService = plugin.metadataService;
                    if (!metadataService) {
                        showNotice(strings.common.unknownError, { variant: 'warning' });
                        return;
                    }

                    const { UXIconMapModal } = await import('../../modals/UXIconMapModal');
                    const modal = new UXIconMapModal(context.app, {
                        metadataService,
                        initialMap: plugin.settings.interfaceIcons,
                        onSave: async nextMap => {
                            plugin.settings.interfaceIcons = nextMap;
                            await plugin.saveSettingsAndUpdate();
                        }
                    });
                    modal.open();
                });
            });
        });
    });

    addToggleSetting(
        iconsGroup.addSetting,
        strings.settings.items.showIconsColorOnly.name,
        strings.settings.items.showIconsColorOnly.desc,
        () => plugin.settings.colorIconOnly,
        value => {
            plugin.settings.colorIconOnly = value;
        }
    );

    const formattingGroup = createGroup(strings.settings.groups.general.formatting);

    const dateFormatSetting = formattingGroup.addSetting(setting => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.dateFormat.name,
            createSettingDescriptionWithExternalLink({
                text: strings.settings.items.dateFormat.desc,
                link: { text: strings.settings.items.dateFormat.momentLinkText, href: MOMENT_FORMAT_DOCS_URL }
            }),
            strings.settings.items.dateFormat.placeholder,
            () => plugin.settings.dateFormat,
            value => {
                plugin.settings.dateFormat = value || 'MMM D, YYYY';
            }
        );
    });
    dateFormatSetting.addExtraButton(button =>
        button
            .setIcon('lucide-help-circle')
            .setTooltip(strings.settings.items.dateFormat.helpTooltip)
            .onClick(() => {
                showNotice(strings.settings.items.dateFormat.help, { timeout: TIMEOUTS.NOTICE_HELP });
            })
    );
    dateFormatSetting.controlEl.addClass('nn-setting-wide-input');

    const timeFormatSetting = formattingGroup.addSetting(setting => {
        configureDebouncedTextSetting(
            setting,
            strings.settings.items.timeFormat.name,
            createSettingDescriptionWithExternalLink({
                text: strings.settings.items.timeFormat.desc,
                link: { text: strings.settings.items.timeFormat.momentLinkText, href: MOMENT_FORMAT_DOCS_URL }
            }),
            strings.settings.items.timeFormat.placeholder,
            () => plugin.settings.timeFormat,
            value => {
                plugin.settings.timeFormat = value || 'h:mm a';
            }
        );
    });
    timeFormatSetting.addExtraButton(button =>
        button
            .setIcon('lucide-help-circle')
            .setTooltip(strings.settings.items.timeFormat.helpTooltip)
            .onClick(() => {
                showNotice(strings.settings.items.timeFormat.help, { timeout: TIMEOUTS.NOTICE_HELP });
            })
    );
    timeFormatSetting.controlEl.addClass('nn-setting-wide-input');
}

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
    { id: 'descendants', iconType: 'ux', iconId: 'list-descendants', label: strings.settings.items.includeDescendantNotes.name },
    { id: 'sort', iconType: 'ux', iconId: 'list-sort-ascending', label: strings.paneHeader.changeSortOrder },
    { id: 'appearance', iconType: 'ux', iconId: 'list-appearance', label: strings.paneHeader.changeAppearance },
    { id: 'newNote', iconType: 'ux', iconId: 'list-new-note', label: strings.paneHeader.newNote }
];

function renderToolbarVisibilitySetting(
    addSetting: (createSetting: (setting: Setting) => void) => Setting,
    plugin: NotebookNavigatorPlugin
): void {
    const setting = addSetting(setting => {
        setting.setName(strings.settings.items.toolbarButtons.name).setDesc(strings.settings.items.toolbarButtons.desc);
    });

    setting.controlEl.addClass('nn-toolbar-visibility-control');
    const sectionsEl = setting.controlEl.createDiv({ cls: 'nn-toolbar-visibility-sections' });

    createToolbarButtonGroup({
        containerEl: sectionsEl,
        label: strings.settings.items.toolbarButtons.navigationLabel,
        buttons: NAVIGATION_TOOLBAR_BUTTONS,
        interfaceIcons: plugin.settings.interfaceIcons,
        state: plugin.settings.toolbarVisibility.navigation,
        onToggle: () => {
            runAsyncAction(() => plugin.persistToolbarVisibility());
        }
    });

    createToolbarButtonGroup({
        containerEl: sectionsEl,
        label: strings.settings.items.toolbarButtons.listLabel,
        buttons: LIST_TOOLBAR_BUTTONS,
        interfaceIcons: plugin.settings.interfaceIcons,
        state: plugin.settings.toolbarVisibility.list,
        onToggle: () => {
            runAsyncAction(() => plugin.persistToolbarVisibility());
        }
    });

    addSettingSyncModeToggle({ setting, plugin, settingId: 'toolbarVisibility' });
}

interface ToolbarButtonGroupProps<T extends string> {
    containerEl: HTMLElement;
    label: string;
    buttons: ToolbarButtonConfig<T>[];
    interfaceIcons: Record<string, string> | undefined;
    state: Record<T, boolean>;
    onToggle: () => void;
}

function createToolbarButtonGroup<T extends string>({
    containerEl,
    label,
    buttons,
    interfaceIcons,
    state,
    onToggle
}: ToolbarButtonGroupProps<T>): void {
    const groupEl = containerEl.createDiv({ cls: 'nn-toolbar-visibility-group' });
    groupEl.createDiv({ cls: 'nn-toolbar-visibility-group-label', text: label });
    const gridEl = groupEl.createDiv({ cls: ['nn-toolbar-visibility-grid', 'nn-toolbar-visibility-grid-scroll'] });

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
