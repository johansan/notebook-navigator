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
import { NavRainbowThemesModal } from '../../modals/NavRainbowThemesModal';
import { DEFAULT_SETTINGS, NAV_RAINBOW_DEFAULTS } from '../defaultSettings';
import { NAV_RAINBOW_BUILT_IN_THEMES, findNavRainbowTheme, getNavRainbowThemeName } from '../navRainbowThemes';
import { NAV_RAINBOW_NO_THEME, isNavRainbowColorMode, isNavRainbowScope, type NavRainbowSectionId } from '../types';
import type { SettingsTabContext } from './SettingsTabContext';
import { runAsyncAction } from '../../utils/async';
import { supportsKeyboardInteractions } from '../../utils/paneLayout';
import { buildNavRainbowThemeSwatchBackground } from '../../utils/navigationRainbow';
import { getCurrentThemeMode } from '../../utils/themeMode';
import { getActiveVaultProfile } from '../../utils/vaultProfiles';
import { addSettingSyncModeToggle } from '../syncModeToggle';
import { createDropdownDefinition, createGroupDefinition, createRenderDefinition, createToggleDefinition } from '../nativeSettingControls';
import { formatPixelSliderValue, formatSecondsSliderValue, renderSliderSetting } from './SliderSetting';
import { renderToolbarButtonsSetting } from './ToolbarButtonsSetting';

/** Builds native 1.13 setting definitions for navigation pane settings. */
export function createNavigationPaneSettingDefinitions(context: SettingsTabContext): SettingDefinitionItem[] {
    const { plugin } = context;

    return [
        createGroupDefinition(undefined, [
            createRenderDefinition({
                name: strings.settings.items.toolbarButtons.name,
                desc: strings.settings.items.toolbarButtons.desc,
                aliases: [
                    strings.paneHeader.showDualPane,
                    strings.paneHeader.expandAllFolders,
                    strings.paneHeader.showExcludedItems,
                    strings.paneHeader.showCalendar,
                    strings.paneHeader.reorderRootFolders,
                    strings.paneHeader.newFolder
                ],
                render: setting => {
                    renderToolbarButtonsSetting(
                        createSetting => {
                            createSetting(setting);
                            return setting;
                        },
                        plugin,
                        'navigation'
                    );
                }
            }),
            // Auto-select follows keyboard navigation support (desktop and tablets); phones never auto-open
            ...(supportsKeyboardInteractions()
                ? [
                      createToggleDefinition('autoSelectFirstFileOnFocusChange', {
                          name: strings.settings.items.autoSelectFirstNote.name,
                          desc: strings.settings.items.autoSelectFirstNote.desc
                      })
                  ]
                : []),
            createToggleDefinition('autoExpandNavItems', {
                name: strings.settings.items.expandOnSelection.name,
                desc: strings.settings.items.expandOnSelection.desc
            }),
            createToggleDefinition('collapseOtherBranchesOnExpand', {
                name: strings.settings.items.collapseOtherBranchesOnExpand.name,
                desc: strings.settings.items.collapseOtherBranchesOnExpand.desc
            })
        ]),
        createGroupDefinition(strings.settings.pages.navigationPane.groups.collapseItems, [
            createDropdownDefinition('collapseBehavior', {
                name: strings.settings.items.collapseItems.name,
                desc: strings.settings.items.collapseItems.desc,
                aliases: Object.values(strings.settings.items.collapseItems.options),
                options: {
                    all: strings.settings.items.collapseItems.options.all,
                    'folders-only': strings.settings.items.collapseItems.options.foldersOnly,
                    'tags-only': strings.settings.items.collapseItems.options.tagsOnly,
                    'properties-only': strings.settings.items.collapseItems.options.propertiesOnly
                }
            }),
            createToggleDefinition('smartCollapse', {
                name: strings.settings.items.keepSelectedItemExpanded.name,
                desc: strings.settings.items.keepSelectedItemExpanded.desc
            }),
            createToggleDefinition('excludeVaultRootFromCollapse', {
                name: strings.settings.items.excludeVaultRootFromCollapse.name,
                desc: strings.settings.items.excludeVaultRootFromCollapse.desc
            })
        ]),
        ...(Platform.isMobile
            ? []
            : [
                  createGroupDefinition(strings.settings.pages.navigationPane.groups.dragAndDrop, [
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
        createGroupDefinition(strings.settings.pages.navigationPane.groups.rainbowColors, [
            createRenderDefinition({
                name: strings.settings.items.navRainbowMode.name,
                desc: strings.settings.items.navRainbowMode.desc,
                aliases: Object.values(strings.settings.items.navRainbowMode.options),
                render: setting => renderNavRainbowModeSetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.navRainbowIntensity.name,
                desc: strings.settings.items.navRainbowIntensity.desc,
                visible: () => getActiveVaultProfile(plugin.settings).navRainbow.mode !== 'none',
                render: setting => renderNavRainbowIntensitySetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.navRainbowShortcuts.name,
                desc: strings.settings.items.navRainbowShortcuts.desc,
                visible: () => getActiveVaultProfile(plugin.settings).navRainbow.mode !== 'none',
                render: setting => renderNavRainbowSectionSetting(setting, context, 'shortcuts')
            }),
            createRenderDefinition({
                name: strings.settings.items.navRainbowRecentItems.name,
                desc: strings.settings.items.navRainbowRecentItems.desc,
                visible: () => getActiveVaultProfile(plugin.settings).navRainbow.mode !== 'none',
                render: setting => renderNavRainbowSectionSetting(setting, context, 'recent')
            }),
            createRenderDefinition({
                name: strings.settings.items.navRainbowFolders.name,
                desc: strings.settings.items.navRainbowFolders.desc,
                visible: () => getActiveVaultProfile(plugin.settings).navRainbow.mode !== 'none',
                render: setting => renderNavRainbowSectionSetting(setting, context, 'folders')
            }),
            createRenderDefinition({
                name: strings.settings.items.navRainbowTags.name,
                desc: strings.settings.items.navRainbowTags.desc,
                visible: () => getActiveVaultProfile(plugin.settings).navRainbow.mode !== 'none',
                render: setting => renderNavRainbowSectionSetting(setting, context, 'tags')
            }),
            createRenderDefinition({
                name: strings.settings.items.navRainbowProperties.name,
                desc: strings.settings.items.navRainbowProperties.desc,
                visible: () => getActiveVaultProfile(plugin.settings).navRainbow.mode !== 'none',
                render: setting => renderNavRainbowSectionSetting(setting, context, 'properties')
            }),
            createRenderDefinition({
                name: strings.settings.items.navRainbowThemes.name,
                desc: strings.settings.items.navRainbowThemes.desc,
                visible: () => getActiveVaultProfile(plugin.settings).navRainbow.mode !== 'none',
                render: setting => renderNavRainbowThemesSetting(setting, context)
            })
        ]),
        createGroupDefinition(strings.settings.pages.navigationPane.groups.fileCounts, [
            createToggleDefinition('showNoteCount', {
                name: strings.settings.items.showFileCount.name,
                desc: strings.settings.items.showFileCount.desc
            }),
            createToggleDefinition('separateNoteCounts', {
                name: strings.settings.items.separateFileCounts.name,
                desc: strings.settings.items.separateFileCounts.desc,
                visible: () => plugin.settings.showNoteCount
            })
        ]),
        createGroupDefinition(strings.settings.pages.navigationPane.groups.banner, [
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
        createGroupDefinition(strings.settings.pages.navigationPane.groups.appearance, [
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
                name: strings.settings.items.rootItemSpacing.name,
                desc: strings.settings.items.rootItemSpacing.desc,
                render: setting => renderRootLevelSpacingSetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.treeIndentation.name,
                desc: strings.settings.items.treeIndentation.desc,
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
        name: strings.settings.items.rootItemSpacing.name,
        desc: strings.settings.items.rootItemSpacing.desc,
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
        name: strings.settings.items.treeIndentation.name,
        desc: strings.settings.items.treeIndentation.desc,
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
        max: 40,
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
                .addOption('none', strings.settings.items.navRainbowMode.options.off)
                .addOption('foreground', strings.settings.items.navRainbowMode.options.textColor)
                .addOption('background', strings.settings.items.navRainbowMode.options.backgroundColor)
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

function renderNavRainbowIntensitySetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    renderSliderSetting(setting, {
        name: strings.settings.items.navRainbowIntensity.name,
        desc: strings.settings.items.navRainbowIntensity.desc,
        value: getActiveVaultProfile(plugin.settings).navRainbow.intensity,
        defaultValue: NAV_RAINBOW_DEFAULTS.intensity,
        min: 0,
        max: 100,
        step: 5,
        formatValue: value => `${value}%`,
        onChange: async value => {
            const activeProfile = getActiveVaultProfile(plugin.settings);
            activeProfile.navRainbow = { ...activeProfile.navRainbow, intensity: value };
            await plugin.saveSettingsAndUpdate();
        }
    });
}

/** Renders a section's theme dropdown and swatch; the folder, tag and property rows add a level scope dropdown between them. */
function renderNavRainbowSectionSetting(setting: Setting, context: SettingsTabContext, section: NavRainbowSectionId): void {
    const { plugin } = context;
    const sectionStrings = {
        shortcuts: strings.settings.items.navRainbowShortcuts,
        recent: strings.settings.items.navRainbowRecentItems,
        folders: strings.settings.items.navRainbowFolders,
        tags: strings.settings.items.navRainbowTags,
        properties: strings.settings.items.navRainbowProperties
    }[section];

    setting.setName(sectionStrings.name).setDesc(sectionStrings.desc);
    const swatchEl = createDiv({ cls: 'nn-rainbow-theme-swatch nn-rainbow-section-swatch' });
    const renderSwatch = (): void => {
        const theme = findNavRainbowTheme(
            plugin.settings.navRainbowThemes,
            getActiveVaultProfile(plugin.settings).navRainbow[section].theme
        );
        // Hidden rather than removed for no theme, so the swatches and dropdowns stay aligned between rows
        swatchEl.toggleClass('nn-rainbow-section-swatch-empty', theme === null);
        if (theme) {
            swatchEl.style.setProperty('background-image', buildNavRainbowThemeSwatchBackground(theme, getCurrentThemeMode() === 'dark'));
        }
    };

    setting.addDropdown(dropdown => {
        // Theme manager edits change the custom themes while the settings tab stays open, so options rebuild on each settings update
        const rebuildOptions = (): void => {
            dropdown.selectEl.empty();
            dropdown.addOption(NAV_RAINBOW_NO_THEME, strings.settings.items.navRainbowNoTheme);
            [...NAV_RAINBOW_BUILT_IN_THEMES, ...plugin.settings.navRainbowThemes].forEach(theme => {
                dropdown.addOption(theme.id, getNavRainbowThemeName(theme));
            });
            dropdown.setValue(getActiveVaultProfile(plugin.settings).navRainbow[section].theme);
            renderSwatch();
        };

        dropdown.onChange(value => {
            const activeProfile = getActiveVaultProfile(plugin.settings);
            activeProfile.navRainbow = {
                ...activeProfile.navRainbow,
                [section]: { ...activeProfile.navRainbow[section], theme: value }
            };
            renderSwatch();
            runAsyncAction(() => plugin.saveSettingsAndUpdate());
        });

        rebuildOptions();
        context.registerSettingsUpdateListener(`navigation-rainbow-theme-${section}`, rebuildOptions);
    });

    if (section === 'folders' || section === 'tags' || section === 'properties') {
        const scopeLabel = {
            folders: strings.settings.items.navRainbowFolderScope,
            tags: strings.settings.items.navRainbowTagScope,
            properties: strings.settings.items.navRainbowPropertyScope
        }[section];
        const scopeOptions = strings.settings.items.navRainbowScopeOptions;
        setting.addDropdown(dropdown => {
            dropdown.selectEl.setAttribute('aria-label', scopeLabel);
            dropdown
                .addOption('root', scopeOptions.root)
                .addOption('child', scopeOptions.child)
                .addOption('all', scopeOptions.all)
                .setValue(getActiveVaultProfile(plugin.settings).navRainbow[section].scope)
                .onChange(value => {
                    if (!isNavRainbowScope(value)) {
                        return;
                    }
                    const activeProfile = getActiveVaultProfile(plugin.settings);
                    activeProfile.navRainbow = {
                        ...activeProfile.navRainbow,
                        [section]: { ...activeProfile.navRainbow[section], scope: value }
                    };
                    runAsyncAction(() => plugin.saveSettingsAndUpdate());
                });
        });
    }

    // Last in the row, so the swatches of all sections line up at the right edge
    setting.controlEl.appendChild(swatchEl);
}

function renderNavRainbowThemesSetting(setting: Setting, context: SettingsTabContext): void {
    setting.addButton(button => {
        button.setButtonText(strings.settings.items.navRainbowThemes.buttonText);
        button.onClick(() => {
            new NavRainbowThemesModal(context.app, context.plugin).open();
        });
    });
}
