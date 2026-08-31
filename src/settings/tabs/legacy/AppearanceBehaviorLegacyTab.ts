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
import { MOMENT_FORMAT_DOCS_URL } from '../../../constants/urls';
import { strings } from '../../../i18n';
import { HomepageModal } from '../../../modals/HomepageModal';
import {
    MAX_PANE_TRANSITION_DURATION_MS,
    MIN_PANE_TRANSITION_DURATION_MS,
    PANE_TRANSITION_DURATION_STEP_MS,
    type BackgroundMode
} from '../../../types';
import { TIMEOUTS } from '../../../types/obsidian-extended';
import { runAsyncAction } from '../../../utils/async';
import { hasMarkdownWordCountConsumer } from '../../../utils/markdownPipelineContentTypes';
import { showNotice } from '../../../utils/noticeUtils';
import {
    DEFAULT_UI_SCALE,
    formatUIScalePercent,
    MAX_UI_SCALE_PERCENT,
    MIN_UI_SCALE_PERCENT,
    percentToScale,
    scaleToPercent,
    UI_SCALE_PERCENT_STEP
} from '../../../utils/uiScale';
import { DEFAULT_SETTINGS } from '../../defaultSettings';
import { createDependentSettingsSection, setElementVisible, wireToggleSettingWithDependentSection } from '../../dependentSettings';
import { createSettingGroupFactory } from '../../settingGroups';
import { addSettingSyncModeToggle } from '../../syncModeToggle';
import type { EnterKeyAction, MouseBackForwardAction } from '../../types';
import {
    isHomepageSource,
    isMultiSelectModifier,
    isPeriodicHomepageSource,
    NARROW_SIDEBAR_CUSTOM_WIDTH_DEFAULT,
    NARROW_SIDEBAR_CUSTOM_WIDTH_MAX,
    NARROW_SIDEBAR_CUSTOM_WIDTH_MIN,
    NARROW_SIDEBAR_CUSTOM_WIDTH_STEP
} from '../../types';
import { createSettingDescriptionWithExternalLink } from '../externalLink';
import { formatPixelSliderValue, renderSliderSetting } from '../SliderSetting';
import type { SettingsTabContext } from '../SettingsTabContext';

type CreateSettingGroup = ReturnType<typeof createSettingGroupFactory>;

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderAppearanceBehaviorTab(context: SettingsTabContext): void {
    const createGroup = createSettingGroupFactory(context.containerEl);

    renderBehaviorSettings(context, createGroup);
    renderStartupSettings(context, createGroup);

    if (!Platform.isMobile) {
        renderKeyboardNavigationSettings(context, createGroup);
        renderMouseButtonSettings(context, createGroup);
        renderDesktopAppearanceSettings(context, createGroup);
    } else {
        // Tablets support hardware keyboards, so they get the keyboard navigation settings
        if (Platform.isTablet) {
            renderKeyboardNavigationSettings(context, createGroup);
        }
        renderMobileAppearanceSettings(context, createGroup);
    }

    renderViewSettings(context, createGroup);
    renderIconSettings(context, createGroup);
    renderFormattingSettings(context, createGroup);
}

function renderBehaviorSettings(context: SettingsTabContext, createGroup: CreateSettingGroup): void {
    const { plugin, addToggleSetting } = context;

    const behaviorGroup = createGroup(undefined);

    addToggleSetting(
        behaviorGroup.addSetting,
        strings.settings.items.openNewNotesInNewTab.name,
        strings.settings.items.openNewNotesInNewTab.desc,
        () => plugin.settings.createNewNotesInNewTab,
        value => {
            plugin.settings.createNewNotesInNewTab = value;
        }
    );

    const autoRevealSetting = behaviorGroup.addSetting(setting => {
        setting.setName(strings.settings.items.autoRevealActiveNote.name).setDesc(strings.settings.items.autoRevealActiveNote.desc);
    });

    const autoRevealSettingsEl = wireToggleSettingWithDependentSection(
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

    new Setting(autoRevealSettingsEl)
        .setName(strings.settings.items.autoRevealIgnoreOtherWindows.name)
        .setDesc(strings.settings.items.autoRevealIgnoreOtherWindows.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.autoRevealIgnoreOtherWindows).onChange(async value => {
                plugin.settings.autoRevealIgnoreOtherWindows = value;
                await plugin.saveSettingsAndUpdate();
            })
        );
}

function renderStartupSettings(context: SettingsTabContext, createGroup: CreateSettingGroup): void {
    const { plugin } = context;
    const startupGroup = createGroup(strings.settings.pages.appearanceAndBehavior.groups.startup);

    startupGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.defaultStartupView.name)
            .setDesc(strings.settings.items.defaultStartupView.desc)
            .addDropdown(dropdown => {
                dropdown
                    .addOptions({
                        navigation: strings.settings.items.defaultStartupView.options.navigation,
                        files: strings.settings.items.defaultStartupView.options.listPane
                    })
                    .setValue(plugin.settings.startView)
                    .onChange(async value => {
                        const nextView = value === 'navigation' ? 'navigation' : 'files';
                        plugin.settings.startView = nextView;
                        await plugin.saveSettingsAndUpdate();
                    });
            });
    });

    const homepageSetting = startupGroup.addSetting(setting => {
        setting.setName(strings.settings.items.homepage.name);
    });
    homepageSetting.setDesc(strings.settings.items.homepage.desc).addDropdown(dropdown =>
        dropdown
            .addOption('none', strings.settings.items.homepage.options.none)
            .addOption('file', strings.settings.items.homepage.options.file)
            .addOption('daily-note', strings.settings.items.homepage.options.dailyNote)
            .addOption('weekly-note', strings.settings.items.homepage.options.weeklyNote)
            .addOption('monthly-note', strings.settings.items.homepage.options.monthlyNote)
            .addOption('quarterly-note', strings.settings.items.homepage.options.quarterlyNote)
            .addOption('yearly-note', strings.settings.items.homepage.options.yearlyNote)
            .setValue(plugin.settings.homepage.source)
            .onChange(async value => {
                if (!isHomepageSource(value)) {
                    return;
                }

                plugin.settings.homepage = {
                    ...plugin.settings.homepage,
                    source: value
                };
                renderHomepageDependentSettings();
                await plugin.saveSettingsAndUpdate();
            })
    );

    addSettingSyncModeToggle({ setting: homepageSetting, plugin, settingId: 'homepage' });

    const homepageFileDependentSettingsEl = createDependentSettingsSection(homepageSetting);
    const homepageFileSetting = new Setting(homepageFileDependentSettingsEl);
    let homepageFileValueEl: HTMLDivElement | null = null;
    let clearHomepageButton: ButtonComponent | null = null;

    homepageFileSetting.setName(strings.settings.items.homepage.file.name);
    homepageFileSetting.setDesc('');

    const homepageFileDescEl = homepageFileSetting.descEl;
    homepageFileDescEl.empty();
    homepageFileValueEl = homepageFileDescEl.createDiv();

    homepageFileSetting.addButton(button => {
        button.setButtonText(strings.settings.items.homepage.chooseButton);
        button.onClick(() => {
            if (plugin.settings.homepage.source !== 'file') {
                return;
            }

            new HomepageModal(context.app, file => {
                plugin.settings.homepage = {
                    ...plugin.settings.homepage,
                    file: file.path
                };
                renderHomepageDependentSettings();
                runAsyncAction(() => plugin.saveSettingsAndUpdate());
            }).open();
        });
    });

    homepageFileSetting.addButton(button => {
        button.setButtonText(strings.common.clear);
        clearHomepageButton = button;
        button.onClick(() => {
            runAsyncAction(async () => {
                if (plugin.settings.homepage.source !== 'file' || !plugin.settings.homepage.file) {
                    return;
                }

                plugin.settings.homepage = {
                    ...plugin.settings.homepage,
                    file: null
                };
                renderHomepageDependentSettings();
                await plugin.saveSettingsAndUpdate();
            });
        });
    });

    const homepagePeriodicDependentSettingsEl = createDependentSettingsSection(homepageSetting);
    new Setting(homepagePeriodicDependentSettingsEl)
        .setName(strings.settings.items.homepage.createMissing.name)
        .setDesc(strings.settings.items.homepage.createMissing.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.homepage.createMissingPeriodicNote).onChange(async value => {
                plugin.settings.homepage = {
                    ...plugin.settings.homepage,
                    createMissingPeriodicNote: value
                };
                await plugin.saveSettingsAndUpdate();
            })
        );

    const renderHomepageDependentSettings = () => {
        const isFileHomepage = plugin.settings.homepage.source === 'file';
        setElementVisible(homepageFileDependentSettingsEl, isFileHomepage);
        setElementVisible(homepagePeriodicDependentSettingsEl, isPeriodicHomepageSource(plugin.settings.homepage.source));

        if (homepageFileValueEl) {
            homepageFileValueEl.setText(
                plugin.settings.homepage.file
                    ? strings.settings.items.homepage.current.replace('{path}', plugin.settings.homepage.file)
                    : strings.settings.items.homepage.file.empty
            );
        }

        if (clearHomepageButton) {
            clearHomepageButton.setDisabled(!plugin.settings.homepage.file);
        }
    };

    renderHomepageDependentSettings();
}

function renderKeyboardNavigationSettings(context: SettingsTabContext, createGroup: CreateSettingGroup): void {
    const { plugin } = context;
    const keyboardNavigationGroup = createGroup(strings.settings.pages.appearanceAndBehavior.groups.keyboardNavigation);

    keyboardNavigationGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.multiSelectModifier.name)
            .setDesc(strings.settings.items.multiSelectModifier.desc)
            .addDropdown(dropdown =>
                dropdown
                    .addOption('cmdCtrl', strings.settings.items.multiSelectModifier.options.cmdCtrl)
                    .addOption('optionAlt', strings.settings.items.multiSelectModifier.options.optionAlt)
                    .setValue(plugin.settings.multiSelectModifier)
                    .onChange(async value => {
                        if (!isMultiSelectModifier(value)) {
                            return;
                        }
                        plugin.settings.multiSelectModifier = value;
                        await plugin.saveSettingsAndUpdate();
                    })
            );
    });

    const enterToOpenSetting = keyboardNavigationGroup.addSetting(setting => {
        setting.setName(strings.settings.items.enterToOpenFiles.name).setDesc(strings.settings.items.enterToOpenFiles.desc);
    });

    const enterToOpenSettingsEl = wireToggleSettingWithDependentSection(
        enterToOpenSetting,
        () => plugin.settings.enterToOpenFiles,
        async value => {
            plugin.settings.enterToOpenFiles = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    const normalizeEnterKeyAction = (value: string): EnterKeyAction => {
        if (value === 'split' || value === 'window' || value === 'rename') {
            return value;
        }
        return 'tab';
    };

    new Setting(enterToOpenSettingsEl)
        .setName(strings.settings.items.shiftEnterAction.name)
        .setDesc(strings.settings.items.shiftEnterAction.desc)
        .addDropdown(dropdown =>
            dropdown
                .addOption('tab', strings.contextMenu.file.openInNewTab)
                .addOption('split', strings.contextMenu.file.openToRight)
                .addOption('window', strings.contextMenu.file.openInNewWindow)
                .addOption('rename', strings.contextMenu.file.renameFile)
                .setValue(plugin.settings.shiftEnterOpenContext)
                .onChange(async value => {
                    plugin.settings.shiftEnterOpenContext = normalizeEnterKeyAction(value);
                    await plugin.saveSettingsAndUpdate();
                })
        );

    // Platform.isMacOS is also true on iOS/iPadOS devices, which use Cmd-based keyboards
    const cmdCtrlStrings = Platform.isMacOS ? strings.settings.items.cmdEnterAction : strings.settings.items.ctrlEnterAction;

    new Setting(enterToOpenSettingsEl)
        .setName(cmdCtrlStrings.name)
        .setDesc(cmdCtrlStrings.desc)
        .addDropdown(dropdown =>
            dropdown
                .addOption('tab', strings.contextMenu.file.openInNewTab)
                .addOption('split', strings.contextMenu.file.openToRight)
                .addOption('window', strings.contextMenu.file.openInNewWindow)
                .addOption('rename', strings.contextMenu.file.renameFile)
                .setValue(plugin.settings.cmdCtrlEnterOpenContext)
                .onChange(async value => {
                    plugin.settings.cmdCtrlEnterOpenContext = normalizeEnterKeyAction(value);
                    await plugin.saveSettingsAndUpdate();
                })
        );
}

function renderMouseButtonSettings(context: SettingsTabContext, createGroup: CreateSettingGroup): void {
    const { plugin } = context;
    const mouseButtonsGroup = createGroup(strings.settings.pages.appearanceAndBehavior.groups.mouseButtons);
    const normalizeMouseBackForwardAction = (value: string): MouseBackForwardAction => {
        if (value === 'singlePaneSwitch' || value === 'history') {
            return value;
        }
        return 'none';
    };

    mouseButtonsGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.mouseBackForwardAction.name)
            .setDesc(strings.settings.items.mouseBackForwardAction.desc)
            .addDropdown(dropdown =>
                dropdown
                    .addOption('none', strings.settings.items.mouseBackForwardAction.options.systemDefault)
                    .addOption('singlePaneSwitch', strings.settings.items.mouseBackForwardAction.options.singlePaneSwitch)
                    .addOption('history', strings.settings.items.mouseBackForwardAction.options.history)
                    .setValue(plugin.settings.mouseBackForwardAction)
                    .onChange(async value => {
                        plugin.settings.mouseBackForwardAction = normalizeMouseBackForwardAction(value);
                        await plugin.saveSettingsAndUpdate();
                    })
            );
    });
}

/** Renders dual pane layout settings shown on desktop and tablets; phones never render these. */
function renderDualPaneSettings(context: SettingsTabContext, group: ReturnType<CreateSettingGroup>): void {
    const { plugin } = context;

    const dualPaneSetting = group.addSetting(setting => {
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

    const dualPaneOrientationSetting = group.addSetting(setting => {
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
                        context.refreshSettingsDomState();
                    });
            });
    });

    addSettingSyncModeToggle({ setting: dualPaneOrientationSetting, plugin, settingId: 'dualPaneOrientation' });

    const showNarrowSidebarSettings = plugin.getDualPaneOrientation() === 'horizontal';

    if (showNarrowSidebarSettings) {
        const narrowSidebarLayoutSetting = group.addSetting(setting => {
            setting
                .setName(strings.settings.items.narrowSidebarBehavior.name)
                .setDesc(strings.settings.items.narrowSidebarBehavior.desc)
                .addDropdown(dropdown => {
                    dropdown
                        .addOptions({
                            none: strings.settings.items.narrowSidebarBehavior.options.none,
                            singlePane: strings.settings.items.narrowSidebarBehavior.options.singlePane,
                            vertical: strings.settings.items.narrowSidebarBehavior.options.vertical
                        })
                        .setValue(plugin.settings.narrowSidebarLayout)
                        .onChange(value => {
                            const nextLayout = value === 'vertical' || value === 'singlePane' ? value : 'none';
                            plugin.setNarrowSidebarLayout(nextLayout);
                            context.refreshSettingsDomState();
                        });
                });
        });

        addSettingSyncModeToggle({ setting: narrowSidebarLayoutSetting, plugin, settingId: 'narrowSidebarLayout' });

        if (plugin.settings.narrowSidebarLayout !== 'none') {
            const narrowSidebarTriggerSetting = group.addSetting(setting => {
                setting
                    .setName(strings.settings.items.narrowSidebarThresholdMode.name)
                    .setDesc(strings.settings.items.narrowSidebarThresholdMode.desc)
                    .addDropdown(dropdown => {
                        dropdown
                            .addOptions({
                                fitPanes: strings.settings.items.narrowSidebarThresholdMode.options.fitPanes,
                                customWidth: strings.settings.items.narrowSidebarThresholdMode.options.customWidth
                            })
                            .setValue(plugin.settings.narrowSidebarTriggerMode)
                            .onChange(value => {
                                plugin.setNarrowSidebarTriggerMode(value === 'customWidth' ? 'customWidth' : 'fitPanes');
                                context.refreshSettingsDomState();
                            });
                    });
            });

            addSettingSyncModeToggle({ setting: narrowSidebarTriggerSetting, plugin, settingId: 'narrowSidebarTriggerMode' });
        }

        if (plugin.settings.narrowSidebarLayout !== 'none' && plugin.settings.narrowSidebarTriggerMode === 'customWidth') {
            const narrowSidebarCustomWidthSetting = group.addSetting(setting => {
                renderSliderSetting(setting, {
                    name: strings.settings.items.narrowSidebarThresholdWidth.name,
                    desc: strings.settings.items.narrowSidebarThresholdWidth.desc,
                    value: plugin.settings.narrowSidebarCustomWidth,
                    defaultValue: NARROW_SIDEBAR_CUSTOM_WIDTH_DEFAULT,
                    min: NARROW_SIDEBAR_CUSTOM_WIDTH_MIN,
                    max: NARROW_SIDEBAR_CUSTOM_WIDTH_MAX,
                    step: NARROW_SIDEBAR_CUSTOM_WIDTH_STEP,
                    resetTooltip: strings.settings.items.narrowSidebarThresholdWidth.resetTooltip,
                    formatValue: formatPixelSliderValue,
                    onChange: value => {
                        plugin.setNarrowSidebarCustomWidth(value);
                    }
                });
            });

            addSettingSyncModeToggle({ setting: narrowSidebarCustomWidthSetting, plugin, settingId: 'narrowSidebarCustomWidth' });
        }
    }
}

function renderDesktopAppearanceSettings(context: SettingsTabContext, createGroup: CreateSettingGroup): void {
    const { plugin } = context;
    const desktopAppearanceGroup = createGroup(strings.settings.pages.appearanceAndBehavior.groups.desktopAppearance);

    renderDualPaneSettings(context, desktopAppearanceGroup);

    desktopAppearanceGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.paneBackgroundColor.name)
            .setDesc(strings.settings.items.paneBackgroundColor.desc)
            .addDropdown(dropdown =>
                dropdown
                    .addOptions({
                        separate: strings.settings.items.paneBackgroundColor.options.separate,
                        primary: strings.settings.items.paneBackgroundColor.options.listBackground,
                        secondary: strings.settings.items.paneBackgroundColor.options.navigationBackground
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

    const showTooltipsDependentSettings = wireToggleSettingWithDependentSection(
        showTooltipsSetting,
        () => plugin.settings.showTooltips,
        async value => {
            plugin.settings.showTooltips = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    new Setting(showTooltipsDependentSettings)
        .setName(strings.settings.items.showTooltipPath.name)
        .setDesc(strings.settings.items.showTooltipPath.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showTooltipPath).onChange(async value => {
                plugin.settings.showTooltipPath = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const showTooltipTagsSetting = new Setting(showTooltipsDependentSettings)
        .setName(strings.settings.items.showTooltipTags.name)
        .setDesc(strings.settings.items.showTooltipTags.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showTooltipTags).onChange(async value => {
                plugin.settings.showTooltipTags = value;
                await plugin.saveSettingsAndUpdate();
            })
        );
    // Tag data only exists while the navigation tags section is enabled
    setElementVisible(showTooltipTagsSetting.settingEl, plugin.settings.showTags);

    const showTooltipWordCountSetting = new Setting(showTooltipsDependentSettings)
        .setName(strings.settings.items.showTooltipWordCount.name)
        .setDesc(strings.settings.items.showTooltipWordCount.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showTooltipWordCount).onChange(async value => {
                plugin.settings.showTooltipWordCount = value;
                await plugin.saveSettingsAndUpdate();
            })
        );
    // Word counts only exist while a list display setting or appearance requests them
    setElementVisible(showTooltipWordCountSetting.settingEl, hasMarkdownWordCountConsumer(plugin.settings, context.app));
}

function renderMobileAppearanceSettings(context: SettingsTabContext, createGroup: CreateSettingGroup): void {
    const { plugin } = context;
    const mobileAppearanceGroup = createGroup(strings.settings.pages.appearanceAndBehavior.groups.mobileAppearance);

    // Tablets support the dual pane layout, so they get the same pane settings as desktop
    if (Platform.isTablet) {
        renderDualPaneSettings(context, mobileAppearanceGroup);
        return;
    }

    // Floating toolbars only render with the phone chrome; tablets use the desktop headers
    const useFloatingToolbarsSetting = mobileAppearanceGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.useFloatingToolbarsOnIOS.name)
            .setDesc(strings.settings.items.useFloatingToolbarsOnIOS.desc)
            .addToggle(toggle =>
                toggle.setValue(plugin.settings.useFloatingToolbars).onChange(value => {
                    plugin.setUseFloatingToolbars(value);
                })
            );
    });

    addSettingSyncModeToggle({ setting: useFloatingToolbarsSetting, plugin, settingId: 'useFloatingToolbars' });
}

function renderViewSettings(context: SettingsTabContext, createGroup: CreateSettingGroup): void {
    const { plugin } = context;
    const viewGroup = createGroup(strings.settings.pages.appearanceAndBehavior.groups.appearance);

    const initialUIScalePercent = scaleToPercent(plugin.getUIScale());
    const uiScaleSetting = viewGroup.addSetting(setting => {
        renderSliderSetting(setting, {
            name: strings.settings.items.zoomLevel.name,
            desc: strings.settings.items.zoomLevel.desc,
            value: initialUIScalePercent,
            defaultValue: scaleToPercent(DEFAULT_UI_SCALE),
            min: MIN_UI_SCALE_PERCENT,
            max: MAX_UI_SCALE_PERCENT,
            step: UI_SCALE_PERCENT_STEP,
            formatValue: value => formatUIScalePercent(percentToScale(value)),
            onChange: value => {
                plugin.setUIScale(percentToScale(value));
            }
        });
    });

    addSettingSyncModeToggle({ setting: uiScaleSetting, plugin, settingId: 'uiScale' });

    const paneTransitionSetting = viewGroup.addSetting(setting => {
        renderSliderSetting(setting, {
            name: strings.settings.items.singlePaneAnimation.name,
            desc: strings.settings.items.singlePaneAnimation.desc,
            value: plugin.settings.paneTransitionDuration,
            defaultValue: DEFAULT_SETTINGS.paneTransitionDuration,
            min: MIN_PANE_TRANSITION_DURATION_MS,
            max: MAX_PANE_TRANSITION_DURATION_MS,
            step: PANE_TRANSITION_DURATION_STEP_MS,
            resetTooltip: strings.settings.items.singlePaneAnimation.resetTooltip,
            formatValue: value => `${value}ms`,
            onChange: value => {
                plugin.setPaneTransitionDuration(value);
            }
        });
    });

    addSettingSyncModeToggle({ setting: paneTransitionSetting, plugin, settingId: 'paneTransitionDuration' });

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
}

function renderIconSettings(context: SettingsTabContext, createGroup: CreateSettingGroup): void {
    const { plugin, addToggleSetting } = context;
    const iconsGroup = createGroup(strings.settings.pages.appearanceAndBehavior.groups.icons);

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

                    const { UXIconMapModal } = await import('../../../modals/UXIconMapModal');
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
        strings.settings.items.applyColorToIconsOnly.name,
        strings.settings.items.applyColorToIconsOnly.desc,
        () => plugin.settings.colorIconOnly,
        value => {
            plugin.settings.colorIconOnly = value;
        }
    );
}

function renderFormattingSettings(context: SettingsTabContext, createGroup: CreateSettingGroup): void {
    const { plugin, configureDebouncedTextSetting } = context;
    const formattingGroup = createGroup(strings.settings.pages.appearanceAndBehavior.groups.formatting);

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
