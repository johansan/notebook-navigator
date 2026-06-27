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

import { ButtonComponent, DropdownComponent, Platform, Setting, ToggleComponent } from 'obsidian';
import { strings } from '../../../i18n';
import { NavigationBannerModal } from '../../../modals/NavigationBannerModal';
import { NavRainbowSectionModal } from '../../../modals/NavRainbowSectionModal';
import { DEFAULT_SETTINGS } from '../../defaultSettings';
import { isItemScope, isNavCountLeaderStyle, isNavRainbowColorMode, type NavRainbowSettings } from '../../types';
import type { SettingsTabContext } from '../SettingsTabContext';
import { runAsyncAction } from '../../../utils/async';
import { getActiveVaultProfile } from '../../../utils/vaultProfiles';
import { createSettingGroupFactory } from '../../settingGroups';
import { addSettingSyncModeToggle } from '../../syncModeToggle';
import { createDependentSettingsSection, setElementVisible, wireToggleSettingWithDependentSection } from '../../dependentSettings';
import { createHueInterpolator, toCssRgba } from '../../../utils/colorUtils';
import { NAV_RAINBOW_DEFAULT_END, NAV_RAINBOW_DEFAULT_START } from '../../../utils/navigationRainbow';
import { formatPixelSliderValue, formatSecondsSliderValue, renderSliderSetting } from '../SliderSetting';

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderNavigationPaneTab(context: SettingsTabContext): void {
    const { containerEl, plugin, addToggleSetting } = context;
    const getActiveProfile = () => getActiveVaultProfile(plugin.settings);

    const createRainbowHeading = (heading: string): DocumentFragment => {
        const doc = containerEl.ownerDocument;
        const fragment = doc.createDocumentFragment();
        const chars = Array.from(heading);
        const coloredChars = chars.filter(char => char.trim().length > 0);
        const colorDenominator = Math.max(1, coloredChars.length - 1);
        const interpolateHeadingColor = createHueInterpolator(NAV_RAINBOW_DEFAULT_START, NAV_RAINBOW_DEFAULT_END);
        let colorIndex = 0;

        for (const char of chars) {
            if (char.trim().length === 0) {
                fragment.appendChild(doc.createTextNode(char));
                continue;
            }

            const span = doc.createElement('span');
            const color = interpolateHeadingColor(colorIndex / colorDenominator);
            span.style.color = toCssRgba(color);
            span.setText(char);
            fragment.appendChild(span);
            colorIndex += 1;
        }

        return fragment;
    };

    const createGroup = createSettingGroupFactory(containerEl);
    const behaviorGroup = createGroup(undefined);
    const collapseGroup = createGroup(strings.settings.groups.navigation.collapseItems);
    const dragAndDropGroup = Platform.isMobile ? null : createGroup(strings.settings.groups.navigation.dragAndDrop);
    const rainbowGroup = createGroup(createRainbowHeading(strings.settings.groups.navigation.rainbowColors));
    const noteCountsGroup = createGroup(strings.settings.groups.navigation.noteCounts);
    const bannerGroup = createGroup(strings.settings.groups.navigation.banner);
    const appearanceGroup = createGroup(strings.settings.groups.navigation.appearance);

    const navigationBannerSetting = bannerGroup.addSetting(setting => {
        setting.setName(strings.settings.items.navigationBanner.name);
    });
    navigationBannerSetting.setDesc('');

    const navigationBannerDescEl = navigationBannerSetting.descEl;
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

        if (clearNavigationBannerButton) {
            clearNavigationBannerButton.setDisabled(!navigationBanner);
        }
    };

    navigationBannerSetting.addButton(button => {
        button.setButtonText(strings.settings.items.navigationBanner.chooseButton);
        button.onClick(() => {
            new NavigationBannerModal(context.app, file => {
                getActiveProfile().navigationBanner = file.path;
                renderNavigationBannerValue();
                // Save navigation banner setting without blocking the UI
                runAsyncAction(() => plugin.saveSettingsAndUpdate());
            }).open();
        });
    });

    navigationBannerSetting.addButton(button => {
        button.setButtonText(strings.common.clear);
        clearNavigationBannerButton = button;
        button.setDisabled(!getActiveProfile().navigationBanner);
        // Clear navigation banner without blocking the UI
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

    const navigationBannerDependentSettingsEl = createDependentSettingsSection(navigationBannerSetting);
    const pinNavigationBannerSetting = new Setting(navigationBannerDependentSettingsEl)
        .setName(strings.settings.items.pinNavigationBanner.name)
        .setDesc(strings.settings.items.pinNavigationBanner.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.pinNavigationBanner).onChange(value => {
                plugin.setPinNavigationBanner(value);
            })
        );
    addSettingSyncModeToggle({ setting: pinNavigationBannerSetting, plugin, settingId: 'pinNavigationBanner' });

    const showNoteCountSetting = noteCountsGroup.addSetting(setting => {
        setting.setName(strings.settings.items.showNoteCount.name).setDesc(strings.settings.items.showNoteCount.desc);
    });

    const noteCountDependentSettingsEl = wireToggleSettingWithDependentSection(
        showNoteCountSetting,
        () => plugin.settings.showNoteCount,
        async value => {
            plugin.settings.showNoteCount = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    new Setting(noteCountDependentSettingsEl)
        .setName(strings.settings.items.separateNoteCounts.name)
        .setDesc(strings.settings.items.separateNoteCounts.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.separateNoteCounts).onChange(async value => {
                plugin.settings.separateNoteCounts = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    appearanceGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.showIndentGuides.name)
            .setDesc(strings.settings.items.showIndentGuides.desc)
            .addToggle(toggle =>
                toggle.setValue(plugin.settings.showIndentGuides).onChange(async value => {
                    plugin.settings.showIndentGuides = value;
                    await plugin.saveSettingsAndUpdate();
                })
            );
    });

    appearanceGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.navCountLeaderStyle.name)
            .setDesc(strings.settings.items.navCountLeaderStyle.desc)
            .addDropdown(dropdown =>
                dropdown
                    .addOptions({
                        none: strings.settings.items.navCountLeaderStyle.options.none,
                        dots: strings.settings.items.navCountLeaderStyle.options.dots,
                        dashes: strings.settings.items.navCountLeaderStyle.options.dashes,
                        line: strings.settings.items.navCountLeaderStyle.options.line
                    })
                    .setValue(plugin.settings.navCountLeaderStyle)
                    .onChange(async value => {
                        plugin.settings.navCountLeaderStyle = isNavCountLeaderStyle(value) ? value : DEFAULT_SETTINGS.navCountLeaderStyle;
                        await plugin.saveSettingsAndUpdate();
                    })
            );
    });

    appearanceGroup.addSetting(setting => {
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
    });

    const navIndentSetting = appearanceGroup.addSetting(setting => {
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
    });

    addSettingSyncModeToggle({ setting: navIndentSetting, plugin, settingId: 'navIndent' });

    const navItemHeightSetting = appearanceGroup.addSetting(setting => {
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
    });

    addSettingSyncModeToggle({ setting: navItemHeightSetting, plugin, settingId: 'navItemHeight' });

    const navItemHeightSettingsEl = createDependentSettingsSection(navItemHeightSetting);

    const navItemHeightScaleTextSetting = new Setting(navItemHeightSettingsEl)
        .setName(strings.settings.items.navItemHeightScaleText.name)
        .setDesc(strings.settings.items.navItemHeightScaleText.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.navItemHeightScaleText).onChange(value => {
                plugin.setNavItemHeightScaleText(value);
            })
        );

    addSettingSyncModeToggle({ setting: navItemHeightScaleTextSetting, plugin, settingId: 'navItemHeightScaleText' });

    const rainbowModeSetting = rainbowGroup.addSetting(setting => {
        setting.setName(strings.settings.items.navRainbowMode.name).setDesc(strings.settings.items.navRainbowMode.desc);
    });

    const rainbowDependentSettingsEl = createDependentSettingsSection(rainbowModeSetting);
    let navRainbowModeDropdown: DropdownComponent | null = null;
    const refreshRainbowSectionControls: (() => void)[] = [];

    const updateNavRainbow = async (updater: (settings: NavRainbowSettings) => NavRainbowSettings): Promise<void> => {
        const activeProfile = getActiveProfile();
        activeProfile.navRainbow = updater(activeProfile.navRainbow);
        await plugin.saveSettingsAndUpdate();
    };

    const refreshNavRainbowControls = (): void => {
        const navRainbow = getActiveProfile().navRainbow;
        setElementVisible(rainbowDependentSettingsEl, navRainbow.mode !== 'none');
        navRainbowModeDropdown?.setValue(navRainbow.mode);
        refreshRainbowSectionControls.forEach(refresh => {
            refresh();
        });
    };

    rainbowModeSetting.addDropdown(
        dropdown =>
            (navRainbowModeDropdown = dropdown
                .addOption('none', strings.settings.items.navRainbowMode.options.none)
                .addOption('foreground', strings.settings.items.navRainbowMode.options.foreground)
                .addOption('background', strings.settings.items.navRainbowMode.options.background)
                .setValue(getActiveProfile().navRainbow.mode)
                .onChange(async value => {
                    if (!isNavRainbowColorMode(value)) {
                        return;
                    }

                    await updateNavRainbow(settings => ({ ...settings, mode: value }));
                    setElementVisible(rainbowDependentSettingsEl, value !== 'none');
                }))
    );

    const createRainbowSectionSetting = (params: {
        name: string;
        desc: string;
        getEnabled: () => boolean;
        setEnabled: (value: boolean) => Promise<void>;
        onConfigure: () => void;
    }): void => {
        const setting = new Setting(rainbowDependentSettingsEl).setName(params.name).setDesc(params.desc);
        let toggleComponent: ToggleComponent | null = null;

        const refreshToggle = (): void => {
            toggleComponent?.setValue(params.getEnabled());
        };

        refreshRainbowSectionControls.push(refreshToggle);

        setting.addToggle(
            toggle =>
                (toggleComponent = toggle.setValue(params.getEnabled()).onChange(async value => {
                    await params.setEnabled(value);
                }))
        );

        setting.addButton(button => {
            button.setButtonText(strings.common.configure);
            button.onClick(params.onConfigure);
        });
    };

    createRainbowSectionSetting({
        name: strings.settings.items.navRainbowApplyToShortcuts.name,
        desc: strings.settings.items.navRainbowApplyToShortcuts.desc,
        getEnabled: () => getActiveProfile().navRainbow.shortcuts.enabled,
        setEnabled: async value => {
            await updateNavRainbow(settings => ({ ...settings, shortcuts: { ...settings.shortcuts, enabled: value } }));
        },
        onConfigure: () => {
            new NavRainbowSectionModal(context.app, plugin, 'shortcuts').open();
        }
    });

    createRainbowSectionSetting({
        name: strings.settings.items.navRainbowApplyToRecent.name,
        desc: strings.settings.items.navRainbowApplyToRecent.desc,
        getEnabled: () => getActiveProfile().navRainbow.recent.enabled,
        setEnabled: async value => {
            await updateNavRainbow(settings => ({ ...settings, recent: { ...settings.recent, enabled: value } }));
        },
        onConfigure: () => {
            new NavRainbowSectionModal(context.app, plugin, 'recent').open();
        }
    });

    createRainbowSectionSetting({
        name: strings.settings.items.navRainbowApplyToFolders.name,
        desc: strings.settings.items.navRainbowApplyToFolders.desc,
        getEnabled: () => getActiveProfile().navRainbow.folders.enabled,
        setEnabled: async value => {
            await updateNavRainbow(settings => ({ ...settings, folders: { ...settings.folders, enabled: value } }));
        },
        onConfigure: () => {
            new NavRainbowSectionModal(context.app, plugin, 'folders').open();
        }
    });

    createRainbowSectionSetting({
        name: strings.settings.items.navRainbowApplyToTags.name,
        desc: strings.settings.items.navRainbowApplyToTags.desc,
        getEnabled: () => getActiveProfile().navRainbow.tags.enabled,
        setEnabled: async value => {
            await updateNavRainbow(settings => ({ ...settings, tags: { ...settings.tags, enabled: value } }));
        },
        onConfigure: () => {
            new NavRainbowSectionModal(context.app, plugin, 'tags').open();
        }
    });

    createRainbowSectionSetting({
        name: strings.settings.items.navRainbowApplyToProperties.name,
        desc: strings.settings.items.navRainbowApplyToProperties.desc,
        getEnabled: () => getActiveProfile().navRainbow.properties.enabled,
        setEnabled: async value => {
            await updateNavRainbow(settings => ({ ...settings, properties: { ...settings.properties, enabled: value } }));
        },
        onConfigure: () => {
            new NavRainbowSectionModal(context.app, plugin, 'properties').open();
        }
    });

    let navRainbowBalanceHueLuminanceToggle: ToggleComponent | null = null;
    refreshRainbowSectionControls.push(() => {
        navRainbowBalanceHueLuminanceToggle?.setValue(getActiveProfile().navRainbow.balanceHueLuminance);
    });

    new Setting(rainbowDependentSettingsEl)
        .setName(strings.settings.items.navRainbowBalanceHueLuminance.name)
        .setDesc(strings.settings.items.navRainbowBalanceHueLuminance.desc)
        .addToggle(toggle => {
            navRainbowBalanceHueLuminanceToggle = toggle
                .setValue(getActiveProfile().navRainbow.balanceHueLuminance)
                .onChange(async value => {
                    await updateNavRainbow(settings => ({ ...settings, balanceHueLuminance: value }));
                });
        });

    let navRainbowSeparateThemeColorsToggle: ToggleComponent | null = null;
    refreshRainbowSectionControls.push(() => {
        navRainbowSeparateThemeColorsToggle?.setValue(getActiveProfile().navRainbow.separateThemeColors);
    });

    new Setting(rainbowDependentSettingsEl)
        .setName(strings.settings.items.navRainbowSeparateThemeColors.name)
        .setDesc(strings.settings.items.navRainbowSeparateThemeColors.desc)
        .addToggle(toggle => {
            navRainbowSeparateThemeColorsToggle = toggle
                .setValue(getActiveProfile().navRainbow.separateThemeColors)
                .onChange(async value => {
                    await updateNavRainbow(settings => ({ ...settings, separateThemeColors: value }));
                });
        });

    refreshNavRainbowControls();
    context.registerSettingsUpdateListener('navigation-pane-nav-rainbow', () => {
        refreshNavRainbowControls();
    });

    if (!Platform.isMobile) {
        addToggleSetting(
            behaviorGroup.addSetting,
            strings.settings.items.autoSelectFirstFileOnFocusChange.name,
            strings.settings.items.autoSelectFirstFileOnFocusChange.desc,
            () => plugin.settings.autoSelectFirstFileOnFocusChange,
            value => {
                plugin.settings.autoSelectFirstFileOnFocusChange = value;
            }
        );
    }

    addToggleSetting(
        behaviorGroup.addSetting,
        strings.settings.items.autoExpandNavItems.name,
        strings.settings.items.autoExpandNavItems.desc,
        () => plugin.settings.autoExpandNavItems,
        value => {
            plugin.settings.autoExpandNavItems = value;
        }
    );

    addToggleSetting(
        behaviorGroup.addSetting,
        strings.settings.items.collapseOtherBranchesOnExpand.name,
        strings.settings.items.collapseOtherBranchesOnExpand.desc,
        () => plugin.settings.collapseOtherBranchesOnExpand,
        value => {
            plugin.settings.collapseOtherBranchesOnExpand = value;
        }
    );

    collapseGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.collapseBehavior.name)
            .setDesc(strings.settings.items.collapseBehavior.desc)
            .addDropdown(dropdown =>
                dropdown
                    .addOption('all', strings.settings.items.collapseBehavior.options.all)
                    .addOption('folders-only', strings.settings.items.collapseBehavior.options.foldersOnly)
                    .addOption('tags-only', strings.settings.items.collapseBehavior.options.tagsOnly)
                    .addOption('properties-only', strings.settings.items.collapseBehavior.options.propertiesOnly)
                    .setValue(plugin.settings.collapseBehavior)
                    .onChange(async value => {
                        if (!isItemScope(value)) {
                            return;
                        }
                        plugin.settings.collapseBehavior = value;
                        await plugin.saveSettingsAndUpdate();
                    })
            );
    });

    addToggleSetting(
        collapseGroup.addSetting,
        strings.settings.items.smartCollapse.name,
        strings.settings.items.smartCollapse.desc,
        () => plugin.settings.smartCollapse,
        value => {
            plugin.settings.smartCollapse = value;
        }
    );

    addToggleSetting(
        collapseGroup.addSetting,
        strings.settings.items.excludeVaultRootFromCollapse.name,
        strings.settings.items.excludeVaultRootFromCollapse.desc,
        () => plugin.settings.excludeVaultRootFromCollapse,
        value => {
            plugin.settings.excludeVaultRootFromCollapse = value;
        }
    );

    if (dragAndDropGroup) {
        const springLoadedFoldersSetting = dragAndDropGroup.addSetting(setting => {
            setting.setName(strings.settings.items.springLoadedFolders.name).setDesc(strings.settings.items.springLoadedFolders.desc);
        });
        const springLoadedFoldersDependentSettings = wireToggleSettingWithDependentSection(
            springLoadedFoldersSetting,
            () => plugin.settings.springLoadedFolders,
            async value => {
                plugin.settings.springLoadedFolders = value;
                await plugin.saveSettingsAndUpdate();
            }
        );

        renderSpringLoadedFoldersInitialDelaySetting(new Setting(springLoadedFoldersDependentSettings), context);
        renderSpringLoadedFoldersSubsequentDelaySetting(new Setting(springLoadedFoldersDependentSettings), context);
    }
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
