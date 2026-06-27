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

import { ButtonComponent, Platform, Setting } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import { strings } from '../../i18n';
import { NavigationBannerModal } from '../../modals/NavigationBannerModal';
import { NavRainbowSectionModal } from '../../modals/NavRainbowSectionModal';
import { DEFAULT_SETTINGS } from '../defaultSettings';
import { isNavRainbowColorMode } from '../types';
import type { SettingsTabContext } from './SettingsTabContext';
import { runAsyncAction } from '../../utils/async';
import { getActiveVaultProfile } from '../../utils/vaultProfiles';
import { addSettingSyncModeToggle } from '../syncModeToggle';
import { createDropdownDefinition, createGroupDefinition, createRenderDefinition, createToggleDefinition } from '../nativeSettingControls';
import { formatPixelSliderValue, formatSecondsSliderValue, renderSliderSetting } from './SliderSetting';

/** Builds native 1.13 setting definitions for navigation pane settings. */
export function createNavigationPaneSettingDefinitions(context: SettingsTabContext): SettingDefinitionItem[] {
    const { plugin } = context;

    return [
        createGroupDefinition(undefined, [
            ...(Platform.isMobile
                ? []
                : [
                      createToggleDefinition('autoSelectFirstFileOnFocusChange', {
                          name: strings.settings.items.autoSelectFirstFileOnFocusChange.name,
                          desc: strings.settings.items.autoSelectFirstFileOnFocusChange.desc
                      })
                  ]),
            createToggleDefinition('autoExpandNavItems', {
                name: strings.settings.items.autoExpandNavItems.name,
                desc: strings.settings.items.autoExpandNavItems.desc
            }),
            createToggleDefinition('collapseOtherBranchesOnExpand', {
                name: strings.settings.items.collapseOtherBranchesOnExpand.name,
                desc: strings.settings.items.collapseOtherBranchesOnExpand.desc
            })
        ]),
        createGroupDefinition(strings.settings.groups.navigation.collapseItems, [
            createDropdownDefinition('collapseBehavior', {
                name: strings.settings.items.collapseBehavior.name,
                desc: strings.settings.items.collapseBehavior.desc,
                aliases: Object.values(strings.settings.items.collapseBehavior.options),
                options: {
                    all: strings.settings.items.collapseBehavior.options.all,
                    'folders-only': strings.settings.items.collapseBehavior.options.foldersOnly,
                    'tags-only': strings.settings.items.collapseBehavior.options.tagsOnly,
                    'properties-only': strings.settings.items.collapseBehavior.options.propertiesOnly
                }
            }),
            createToggleDefinition('smartCollapse', {
                name: strings.settings.items.smartCollapse.name,
                desc: strings.settings.items.smartCollapse.desc
            }),
            createToggleDefinition('excludeVaultRootFromCollapse', {
                name: strings.settings.items.excludeVaultRootFromCollapse.name,
                desc: strings.settings.items.excludeVaultRootFromCollapse.desc
            })
        ]),
        ...(Platform.isMobile
            ? []
            : [
                  createGroupDefinition(strings.settings.groups.navigation.dragAndDrop, [
                      createToggleDefinition('springLoadedFolders', {
                          name: strings.settings.items.springLoadedFolders.name,
                          desc: strings.settings.items.springLoadedFolders.desc
                      }),
                      createRenderDefinition({
                          name: strings.settings.items.springLoadedFoldersInitialDelay.name,
                          desc: strings.settings.items.springLoadedFoldersInitialDelay.desc,
                          visible: () => plugin.settings.springLoadedFolders,
                          render: setting => renderSpringLoadedFoldersInitialDelaySetting(setting, context)
                      }),
                      createRenderDefinition({
                          name: strings.settings.items.springLoadedFoldersSubsequentDelay.name,
                          desc: strings.settings.items.springLoadedFoldersSubsequentDelay.desc,
                          visible: () => plugin.settings.springLoadedFolders,
                          render: setting => renderSpringLoadedFoldersSubsequentDelaySetting(setting, context)
                      })
                  ])
              ]),
        createGroupDefinition(strings.settings.groups.navigation.rainbowColors, [
            createRenderDefinition({
                name: strings.settings.items.navRainbowMode.name,
                desc: strings.settings.items.navRainbowMode.desc,
                aliases: Object.values(strings.settings.items.navRainbowMode.options),
                render: setting => renderNavRainbowModeSetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.navRainbowApplyToShortcuts.name,
                desc: strings.settings.items.navRainbowApplyToShortcuts.desc,
                visible: () => getActiveVaultProfile(plugin.settings).navRainbow.mode !== 'none',
                render: setting => renderNavRainbowSectionSetting(setting, context, 'shortcuts')
            }),
            createRenderDefinition({
                name: strings.settings.items.navRainbowApplyToRecent.name,
                desc: strings.settings.items.navRainbowApplyToRecent.desc,
                visible: () => getActiveVaultProfile(plugin.settings).navRainbow.mode !== 'none',
                render: setting => renderNavRainbowSectionSetting(setting, context, 'recent')
            }),
            createRenderDefinition({
                name: strings.settings.items.navRainbowApplyToFolders.name,
                desc: strings.settings.items.navRainbowApplyToFolders.desc,
                visible: () => getActiveVaultProfile(plugin.settings).navRainbow.mode !== 'none',
                render: setting => renderNavRainbowSectionSetting(setting, context, 'folders')
            }),
            createRenderDefinition({
                name: strings.settings.items.navRainbowApplyToTags.name,
                desc: strings.settings.items.navRainbowApplyToTags.desc,
                visible: () => getActiveVaultProfile(plugin.settings).navRainbow.mode !== 'none',
                render: setting => renderNavRainbowSectionSetting(setting, context, 'tags')
            }),
            createRenderDefinition({
                name: strings.settings.items.navRainbowApplyToProperties.name,
                desc: strings.settings.items.navRainbowApplyToProperties.desc,
                visible: () => getActiveVaultProfile(plugin.settings).navRainbow.mode !== 'none',
                render: setting => renderNavRainbowSectionSetting(setting, context, 'properties')
            }),
            createRenderDefinition({
                name: strings.settings.items.navRainbowBalanceHueLuminance.name,
                desc: strings.settings.items.navRainbowBalanceHueLuminance.desc,
                visible: () => getActiveVaultProfile(plugin.settings).navRainbow.mode !== 'none',
                render: setting => renderNavRainbowToggleSetting(setting, context, 'balanceHueLuminance')
            }),
            createRenderDefinition({
                name: strings.settings.items.navRainbowSeparateThemeColors.name,
                desc: strings.settings.items.navRainbowSeparateThemeColors.desc,
                visible: () => getActiveVaultProfile(plugin.settings).navRainbow.mode !== 'none',
                render: setting => renderNavRainbowToggleSetting(setting, context, 'separateThemeColors')
            })
        ]),
        createGroupDefinition(strings.settings.groups.navigation.noteCounts, [
            createToggleDefinition('showNoteCount', {
                name: strings.settings.items.showNoteCount.name,
                desc: strings.settings.items.showNoteCount.desc
            }),
            createToggleDefinition('separateNoteCounts', {
                name: strings.settings.items.separateNoteCounts.name,
                desc: strings.settings.items.separateNoteCounts.desc,
                visible: () => plugin.settings.showNoteCount
            })
        ]),
        createGroupDefinition(strings.settings.groups.navigation.banner, [
            createRenderDefinition({
                name: strings.settings.items.navigationBanner.name,
                desc: strings.settings.items.navigationBanner.desc,
                aliases: [strings.settings.items.navigationBanner.chooseButton, strings.common.clear],
                render: setting => renderNavigationBannerSetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.pinNavigationBanner.name,
                desc: strings.settings.items.pinNavigationBanner.desc,
                render: setting => renderPinNavigationBannerSetting(setting, context)
            })
        ]),
        createGroupDefinition(strings.settings.groups.navigation.appearance, [
            createToggleDefinition('showIndentGuides', {
                name: strings.settings.items.showIndentGuides.name,
                desc: strings.settings.items.showIndentGuides.desc
            }),
            createDropdownDefinition('navCountLeaderStyle', {
                name: strings.settings.items.navCountLeaderStyle.name,
                desc: strings.settings.items.navCountLeaderStyle.desc,
                aliases: Object.values(strings.settings.items.navCountLeaderStyle.options),
                options: {
                    none: strings.settings.items.navCountLeaderStyle.options.none,
                    dots: strings.settings.items.navCountLeaderStyle.options.dots,
                    dashes: strings.settings.items.navCountLeaderStyle.options.dashes,
                    line: strings.settings.items.navCountLeaderStyle.options.line
                }
            }),
            createRenderDefinition({
                name: strings.settings.items.navRootSpacing.name,
                desc: strings.settings.items.navRootSpacing.desc,
                render: setting => renderRootLevelSpacingSetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.navIndent.name,
                desc: strings.settings.items.navIndent.desc,
                render: setting => renderNavIndentSetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.navItemHeight.name,
                desc: strings.settings.items.navItemHeight.desc,
                render: setting => renderNavItemHeightSetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.navItemHeightScaleText.name,
                desc: strings.settings.items.navItemHeightScaleText.desc,
                render: setting => renderNavItemHeightScaleTextSetting(setting, context)
            })
        ])
    ];
}

function renderNavigationBannerSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;
    const getActiveProfile = () => getActiveVaultProfile(plugin.settings);

    setting.setName(strings.settings.items.navigationBanner.name).setDesc('');

    const navigationBannerDescEl = setting.descEl;
    navigationBannerDescEl.empty();
    navigationBannerDescEl.createDiv({ text: strings.settings.items.navigationBanner.desc });

    const navigationBannerValueEl = navigationBannerDescEl.createDiv();
    let clearNavigationBannerButton: ButtonComponent | null = null;

    const renderNavigationBannerValue = () => {
        const navigationBanner = getActiveProfile().navigationBanner;
        navigationBannerValueEl.setText('');
        if (navigationBanner) {
            navigationBannerValueEl.setText(strings.settings.items.navigationBanner.current.replace('{path}', navigationBanner));
        }

        clearNavigationBannerButton?.setDisabled(!navigationBanner);
    };

    setting.addButton(button => {
        button.setButtonText(strings.settings.items.navigationBanner.chooseButton);
        button.onClick(() => {
            new NavigationBannerModal(context.app, file => {
                getActiveProfile().navigationBanner = file.path;
                renderNavigationBannerValue();
                runAsyncAction(() => plugin.saveSettingsAndUpdate());
            }).open();
        });
    });

    setting.addButton(button => {
        button.setButtonText(strings.common.clear);
        clearNavigationBannerButton = button;
        button.setDisabled(!getActiveProfile().navigationBanner);
        button.onClick(() => {
            runAsyncAction(async () => {
                const activeProfile = getActiveProfile();
                if (!activeProfile.navigationBanner) {
                    return;
                }
                activeProfile.navigationBanner = null;
                renderNavigationBannerValue();
                await plugin.saveSettingsAndUpdate();
            });
        });
    });

    renderNavigationBannerValue();
    context.registerSettingsUpdateListener('navigation-pane-navigation-banner', () => {
        renderNavigationBannerValue();
    });
}

function renderPinNavigationBannerSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.pinNavigationBanner.name)
        .setDesc(strings.settings.items.pinNavigationBanner.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.pinNavigationBanner).onChange(value => {
                plugin.setPinNavigationBanner(value);
            })
        );
    addSettingSyncModeToggle({ setting, plugin, settingId: 'pinNavigationBanner' });
}

function renderRootLevelSpacingSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    renderSliderSetting(setting, {
        name: strings.settings.items.navRootSpacing.name,
        desc: strings.settings.items.navRootSpacing.desc,
        value: plugin.settings.rootLevelSpacing,
        defaultValue: DEFAULT_SETTINGS.rootLevelSpacing,
        min: 0,
        max: 12,
        step: 1,
        formatValue: formatPixelSliderValue,
        onChange: async value => {
            plugin.settings.rootLevelSpacing = value;
            await plugin.saveSettingsAndUpdate();
        }
    });
}

function renderNavIndentSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    renderSliderSetting(setting, {
        name: strings.settings.items.navIndent.name,
        desc: strings.settings.items.navIndent.desc,
        value: plugin.settings.navIndent,
        defaultValue: DEFAULT_SETTINGS.navIndent,
        min: 10,
        max: 24,
        step: 1,
        formatValue: formatPixelSliderValue,
        onChange: value => {
            plugin.setNavIndent(value);
        }
    });

    addSettingSyncModeToggle({ setting, plugin, settingId: 'navIndent' });
}

function renderNavItemHeightSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    renderSliderSetting(setting, {
        name: strings.settings.items.navItemHeight.name,
        desc: strings.settings.items.navItemHeight.desc,
        value: plugin.settings.navItemHeight,
        defaultValue: DEFAULT_SETTINGS.navItemHeight,
        min: 20,
        max: 28,
        step: 1,
        formatValue: formatPixelSliderValue,
        onChange: value => {
            plugin.setNavItemHeight(value);
        }
    });

    addSettingSyncModeToggle({ setting, plugin, settingId: 'navItemHeight' });
}

function renderSpringLoadedFoldersInitialDelaySetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    renderSliderSetting(setting, {
        name: strings.settings.items.springLoadedFoldersInitialDelay.name,
        desc: strings.settings.items.springLoadedFoldersInitialDelay.desc,
        value: plugin.settings.springLoadedFoldersInitialDelay,
        defaultValue: DEFAULT_SETTINGS.springLoadedFoldersInitialDelay,
        min: 0.1,
        max: 2,
        step: 0.1,
        formatValue: formatSecondsSliderValue,
        normalizeValue: value => Math.round(value * 10) / 10,
        onChange: async value => {
            plugin.settings.springLoadedFoldersInitialDelay = value;
            await plugin.saveSettingsAndUpdate();
        }
    });
}

function renderSpringLoadedFoldersSubsequentDelaySetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    renderSliderSetting(setting, {
        name: strings.settings.items.springLoadedFoldersSubsequentDelay.name,
        desc: strings.settings.items.springLoadedFoldersSubsequentDelay.desc,
        value: plugin.settings.springLoadedFoldersSubsequentDelay,
        defaultValue: DEFAULT_SETTINGS.springLoadedFoldersSubsequentDelay,
        min: 0.1,
        max: 2,
        step: 0.1,
        formatValue: formatSecondsSliderValue,
        normalizeValue: value => Math.round(value * 10) / 10,
        onChange: async value => {
            plugin.settings.springLoadedFoldersSubsequentDelay = value;
            await plugin.saveSettingsAndUpdate();
        }
    });
}

function renderNavItemHeightScaleTextSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.navItemHeightScaleText.name)
        .setDesc(strings.settings.items.navItemHeightScaleText.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.navItemHeightScaleText).onChange(value => {
                plugin.setNavItemHeightScaleText(value);
            })
        );

    addSettingSyncModeToggle({ setting, plugin, settingId: 'navItemHeightScaleText' });
}

function renderNavRainbowModeSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.navRainbowMode.name)
        .setDesc(strings.settings.items.navRainbowMode.desc)
        .addDropdown(dropdown =>
            dropdown
                .addOption('none', strings.settings.items.navRainbowMode.options.none)
                .addOption('foreground', strings.settings.items.navRainbowMode.options.foreground)
                .addOption('background', strings.settings.items.navRainbowMode.options.background)
                .setValue(getActiveVaultProfile(plugin.settings).navRainbow.mode)
                .onChange(async value => {
                    if (!isNavRainbowColorMode(value)) {
                        return;
                    }

                    const activeProfile = getActiveVaultProfile(plugin.settings);
                    activeProfile.navRainbow = { ...activeProfile.navRainbow, mode: value };
                    context.refreshSettingsDomState();
                    await plugin.saveSettingsAndUpdate();
                })
        );
}

function renderNavRainbowSectionSetting(
    setting: Setting,
    context: SettingsTabContext,
    section: 'shortcuts' | 'recent' | 'folders' | 'tags' | 'properties'
): void {
    const { plugin } = context;
    const sectionStrings = {
        shortcuts: strings.settings.items.navRainbowApplyToShortcuts,
        recent: strings.settings.items.navRainbowApplyToRecent,
        folders: strings.settings.items.navRainbowApplyToFolders,
        tags: strings.settings.items.navRainbowApplyToTags,
        properties: strings.settings.items.navRainbowApplyToProperties
    }[section];

    setting.setName(sectionStrings.name).setDesc(sectionStrings.desc);
    setting.addToggle(toggle =>
        toggle.setValue(getActiveVaultProfile(plugin.settings).navRainbow[section].enabled).onChange(async value => {
            const activeProfile = getActiveVaultProfile(plugin.settings);
            activeProfile.navRainbow = {
                ...activeProfile.navRainbow,
                [section]: { ...activeProfile.navRainbow[section], enabled: value }
            };
            await plugin.saveSettingsAndUpdate();
        })
    );
    setting.addButton(button => {
        button.setButtonText(strings.common.configure);
        button.onClick(() => {
            new NavRainbowSectionModal(context.app, plugin, section).open();
        });
    });
}

function renderNavRainbowToggleSetting(
    setting: Setting,
    context: SettingsTabContext,
    key: 'balanceHueLuminance' | 'separateThemeColors'
): void {
    const { plugin } = context;
    const itemStrings =
        key === 'balanceHueLuminance'
            ? strings.settings.items.navRainbowBalanceHueLuminance
            : strings.settings.items.navRainbowSeparateThemeColors;

    setting.setName(itemStrings.name).setDesc(itemStrings.desc);
    setting.addToggle(toggle =>
        toggle.setValue(getActiveVaultProfile(plugin.settings).navRainbow[key]).onChange(async value => {
            const activeProfile = getActiveVaultProfile(plugin.settings);
            activeProfile.navRainbow = { ...activeProfile.navRainbow, [key]: value };
            await plugin.saveSettingsAndUpdate();
        })
    );
}
