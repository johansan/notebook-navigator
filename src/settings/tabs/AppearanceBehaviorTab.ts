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
import type { SettingDefinitionControl, SettingDefinitionGroup, SettingDefinitionItem, SettingDefinitionRender } from 'obsidian';
import { MOMENT_FORMAT_DOCS_URL } from '../../constants/urls';
import { strings } from '../../i18n';
import { HomepageModal } from '../../modals/HomepageModal';
import { MAX_PANE_TRANSITION_DURATION_MS, MIN_PANE_TRANSITION_DURATION_MS, PANE_TRANSITION_DURATION_STEP_MS } from '../../types';
import { TIMEOUTS } from '../../types/obsidian-extended';
import { runAsyncAction } from '../../utils/async';
import { hasMarkdownWordCountConsumer } from '../../utils/markdownPipelineContentTypes';
import { showNotice } from '../../utils/noticeUtils';
import {
    DEFAULT_UI_SCALE,
    formatUIScalePercent,
    MAX_UI_SCALE_PERCENT,
    MIN_UI_SCALE_PERCENT,
    percentToScale,
    scaleToPercent,
    UI_SCALE_PERCENT_STEP
} from '../../utils/uiScale';
import { DEFAULT_SETTINGS } from '../defaultSettings';
import {
    createDropdownControlDefinition,
    createGroupDefinition,
    createRenderDefinition,
    createToggleControlDefinition
} from '../nativeSettingControls';
import { addSettingSyncModeToggle } from '../syncModeToggle';
import {
    isHomepageSource,
    isPeriodicHomepageSource,
    NARROW_SIDEBAR_CUSTOM_WIDTH_DEFAULT,
    NARROW_SIDEBAR_CUSTOM_WIDTH_MAX,
    NARROW_SIDEBAR_CUSTOM_WIDTH_MIN,
    NARROW_SIDEBAR_CUSTOM_WIDTH_STEP
} from '../types';
import type { AppearanceBehaviorDropdownKey, AppearanceBehaviorToggleKey } from './AppearanceBehaviorControlBindings';
import { createSettingDescriptionWithExternalLink } from './externalLink';
import type { SettingsTabContext } from './SettingsTabContext';
import { formatPixelSliderValue, renderSliderSetting } from './SliderSetting';

interface DefinitionOptions {
    aliases?: string[];
    visible?: boolean | (() => boolean);
}

interface ControlDefinitionOptions extends DefinitionOptions {
    name: string;
    desc?: string | DocumentFragment;
}

interface DropdownDefinitionOptions extends ControlDefinitionOptions {
    options: Record<string, string>;
}

/** Builds native 1.13 setting definitions for appearance and behavior settings. */
export function createAppearanceBehaviorSettingDefinitions(context: SettingsTabContext): SettingDefinitionItem[] {
    const groups: SettingDefinitionGroup[] = [createBehaviorDefinitionGroup(context), createStartupDefinitionGroup(context)];

    if (!Platform.isMobile) {
        groups.push(
            createKeyboardNavigationDefinitionGroup(context),
            createMouseButtonsDefinitionGroup(),
            createDesktopAppearanceDefinitionGroup(context)
        );
    } else {
        // Tablets support hardware keyboards, so they get the keyboard navigation settings
        if (Platform.isTablet) {
            groups.push(createKeyboardNavigationDefinitionGroup(context));
        }
        groups.push(createMobileAppearanceDefinitionGroup(context));
    }

    groups.push(createViewDefinitionGroup(context), createIconDefinitionGroup(context), createFormattingDefinitionGroup(context));

    return groups;
}

function createBehaviorDefinitionGroup(context: SettingsTabContext): SettingDefinitionGroup {
    const { plugin } = context;

    return createGroupDefinition(undefined, [
        createToggleDefinition('createNewNotesInNewTab', {
            name: strings.settings.items.openNewNotesInNewTab.name,
            desc: strings.settings.items.openNewNotesInNewTab.desc
        }),
        createToggleDefinition('autoRevealActiveFile', {
            name: strings.settings.items.autoRevealActiveNote.name,
            desc: strings.settings.items.autoRevealActiveNote.desc
        }),
        createToggleDefinition('autoRevealShortestPath', {
            name: strings.settings.items.autoRevealShortestPath.name,
            desc: strings.settings.items.autoRevealShortestPath.desc,
            visible: () => plugin.settings.autoRevealActiveFile
        }),
        createToggleDefinition('autoRevealIgnoreRightSidebar', {
            name: strings.settings.items.autoRevealIgnoreRightSidebar.name,
            desc: strings.settings.items.autoRevealIgnoreRightSidebar.desc,
            visible: () => plugin.settings.autoRevealActiveFile
        }),
        createToggleDefinition('autoRevealIgnoreOtherWindows', {
            name: strings.settings.items.autoRevealIgnoreOtherWindows.name,
            desc: strings.settings.items.autoRevealIgnoreOtherWindows.desc,
            visible: () => plugin.settings.autoRevealActiveFile
        })
    ]);
}

function createStartupDefinitionGroup(context: SettingsTabContext): SettingDefinitionGroup {
    const { plugin } = context;

    return createGroupDefinition(strings.settings.pages.appearanceAndBehavior.groups.startup, [
        createDropdownDefinition('startView', {
            name: strings.settings.items.defaultStartupView.name,
            desc: strings.settings.items.defaultStartupView.desc,
            aliases: optionAliases(strings.settings.items.defaultStartupView.options),
            options: {
                navigation: strings.settings.items.defaultStartupView.options.navigation,
                files: strings.settings.items.defaultStartupView.options.listPane
            }
        }),
        createRenderDefinition({
            name: strings.settings.items.homepage.name,
            desc: strings.settings.items.homepage.desc,
            aliases: optionAliases(strings.settings.items.homepage.options),
            render: setting => renderHomepageSetting(setting, context)
        }),
        createRenderDefinition({
            name: strings.settings.items.homepage.file.name,
            desc: strings.settings.items.homepage.file.empty,
            aliases: [strings.settings.items.homepage.chooseButton, strings.common.clear],
            visible: () => plugin.settings.homepage.source === 'file',
            render: setting => renderHomepageFileSetting(setting, context)
        }),
        createRenderedToggleDefinition(context, {
            name: strings.settings.items.homepage.createMissing.name,
            desc: strings.settings.items.homepage.createMissing.desc,
            getValue: () => plugin.settings.homepage.createMissingPeriodicNote,
            setValue: value => {
                plugin.settings.homepage = {
                    ...plugin.settings.homepage,
                    createMissingPeriodicNote: value
                };
            },
            visible: () => isPeriodicHomepageSource(plugin.settings.homepage.source)
        })
    ]);
}

function createKeyboardNavigationDefinitionGroup(context: SettingsTabContext): SettingDefinitionGroup {
    const { plugin } = context;
    const openContextOptions = {
        tab: strings.contextMenu.file.openInNewTab,
        split: strings.contextMenu.file.openToRight,
        window: strings.contextMenu.file.openInNewWindow,
        rename: strings.contextMenu.file.renameFile
    };
    // Platform.isMacOS is also true on iOS/iPadOS devices, which use Cmd-based keyboards
    const cmdCtrlStrings = Platform.isMacOS ? strings.settings.items.cmdEnterAction : strings.settings.items.ctrlEnterAction;

    return createGroupDefinition(strings.settings.pages.appearanceAndBehavior.groups.keyboardNavigation, [
        createDropdownDefinition('multiSelectModifier', {
            name: strings.settings.items.multiSelectModifier.name,
            desc: strings.settings.items.multiSelectModifier.desc,
            aliases: optionAliases(strings.settings.items.multiSelectModifier.options),
            options: {
                cmdCtrl: strings.settings.items.multiSelectModifier.options.cmdCtrl,
                optionAlt: strings.settings.items.multiSelectModifier.options.optionAlt
            }
        }),
        createToggleDefinition('enterToOpenFiles', {
            name: strings.settings.items.enterToOpenFiles.name,
            desc: strings.settings.items.enterToOpenFiles.desc
        }),
        createDropdownDefinition('shiftEnterOpenContext', {
            name: strings.settings.items.shiftEnterAction.name,
            desc: strings.settings.items.shiftEnterAction.desc,
            aliases: optionAliases(openContextOptions),
            options: openContextOptions,
            visible: () => plugin.settings.enterToOpenFiles
        }),
        createDropdownDefinition('cmdCtrlEnterOpenContext', {
            name: cmdCtrlStrings.name,
            desc: cmdCtrlStrings.desc,
            aliases: optionAliases(openContextOptions),
            options: openContextOptions,
            visible: () => plugin.settings.enterToOpenFiles
        })
    ]);
}

function createMouseButtonsDefinitionGroup(): SettingDefinitionGroup {
    const mouseBackForwardOptions = strings.settings.items.mouseBackForwardAction.options;

    return createGroupDefinition(strings.settings.pages.appearanceAndBehavior.groups.mouseButtons, [
        createDropdownDefinition('mouseBackForwardAction', {
            name: strings.settings.items.mouseBackForwardAction.name,
            desc: strings.settings.items.mouseBackForwardAction.desc,
            aliases: optionAliases(mouseBackForwardOptions),
            options: {
                // `none` is persisted when the plugin leaves the system action unchanged.
                none: mouseBackForwardOptions.systemDefault,
                singlePaneSwitch: mouseBackForwardOptions.singlePaneSwitch,
                history: mouseBackForwardOptions.history
            }
        })
    ]);
}

/** Builds dual pane layout settings shown on desktop and tablets; phones never render these. */
function createDualPaneDefinitions(context: SettingsTabContext): SettingDefinitionRender[] {
    const { plugin } = context;

    return [
        createRenderDefinition({
            name: strings.settings.items.dualPane.name,
            desc: strings.settings.items.dualPane.desc,
            render: setting => {
                setting
                    .setName(strings.settings.items.dualPane.name)
                    .setDesc(strings.settings.items.dualPane.desc)
                    .addToggle(toggle =>
                        toggle.setValue(plugin.useDualPane()).onChange(value => {
                            plugin.setDualPanePreference(value);
                        })
                    );
                addSettingSyncModeToggle({ setting, plugin, settingId: 'dualPane' });
            }
        }),
        createRenderDefinition({
            name: strings.settings.items.dualPaneOrientation.name,
            desc: strings.settings.items.dualPaneOrientation.desc,
            aliases: optionAliases(strings.settings.items.dualPaneOrientation.options),
            render: setting => {
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
                                await plugin.setDualPaneOrientation(value === 'vertical' ? 'vertical' : 'horizontal');
                                context.refreshSettingsDomState();
                            });
                    });
                addSettingSyncModeToggle({ setting, plugin, settingId: 'dualPaneOrientation' });
            }
        }),
        createRenderDefinition({
            name: strings.settings.items.narrowSidebarBehavior.name,
            desc: strings.settings.items.narrowSidebarBehavior.desc,
            aliases: optionAliases(strings.settings.items.narrowSidebarBehavior.options),
            visible: () => plugin.getDualPaneOrientation() === 'horizontal',
            render: setting => {
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
                addSettingSyncModeToggle({ setting, plugin, settingId: 'narrowSidebarLayout' });
            }
        }),
        createRenderDefinition({
            name: strings.settings.items.narrowSidebarThresholdMode.name,
            desc: strings.settings.items.narrowSidebarThresholdMode.desc,
            aliases: optionAliases(strings.settings.items.narrowSidebarThresholdMode.options),
            visible: () => plugin.getDualPaneOrientation() === 'horizontal' && plugin.settings.narrowSidebarLayout !== 'none',
            render: setting => renderNarrowSidebarTriggerSetting(setting, context)
        }),
        createRenderDefinition({
            name: strings.settings.items.narrowSidebarThresholdWidth.name,
            desc: strings.settings.items.narrowSidebarThresholdWidth.desc,
            aliases: [NARROW_SIDEBAR_CUSTOM_WIDTH_DEFAULT.toString(), strings.settings.items.narrowSidebarThresholdWidth.resetTooltip],
            visible: () =>
                plugin.getDualPaneOrientation() === 'horizontal' &&
                plugin.settings.narrowSidebarLayout !== 'none' &&
                plugin.settings.narrowSidebarTriggerMode === 'customWidth',
            render: setting => renderNarrowSidebarCustomWidthSetting(setting, context)
        })
    ];
}

function createDesktopAppearanceDefinitionGroup(context: SettingsTabContext): SettingDefinitionGroup {
    const { plugin } = context;

    return createGroupDefinition(strings.settings.pages.appearanceAndBehavior.groups.desktopAppearance, [
        ...createDualPaneDefinitions(context),
        createDropdownDefinition('desktopBackground', {
            name: strings.settings.items.paneBackgroundColor.name,
            desc: strings.settings.items.paneBackgroundColor.desc,
            aliases: optionAliases(strings.settings.items.paneBackgroundColor.options),
            options: {
                separate: strings.settings.items.paneBackgroundColor.options.separate,
                primary: strings.settings.items.paneBackgroundColor.options.listBackground,
                secondary: strings.settings.items.paneBackgroundColor.options.navigationBackground
            }
        }),
        createToggleDefinition('showTooltips', {
            name: strings.settings.items.showTooltips.name,
            desc: strings.settings.items.showTooltips.desc
        }),
        createToggleDefinition('showTooltipPath', {
            name: strings.settings.items.showTooltipPath.name,
            desc: strings.settings.items.showTooltipPath.desc,
            visible: () => plugin.settings.showTooltips
        }),
        createToggleDefinition('showTooltipTags', {
            name: strings.settings.items.showTooltipTags.name,
            desc: strings.settings.items.showTooltipTags.desc,
            // Tag data only exists while the navigation tags section is enabled
            visible: () => plugin.settings.showTooltips && plugin.settings.showTags
        }),
        createToggleDefinition('showTooltipWordCount', {
            name: strings.settings.items.showTooltipWordCount.name,
            desc: strings.settings.items.showTooltipWordCount.desc,
            // Word counts only exist while a list display setting or appearance requests them
            visible: () => plugin.settings.showTooltips && hasMarkdownWordCountConsumer(plugin.settings, context.app)
        })
    ]);
}

function createMobileAppearanceDefinitionGroup(context: SettingsTabContext): SettingDefinitionGroup {
    const { plugin } = context;

    return createGroupDefinition(strings.settings.pages.appearanceAndBehavior.groups.mobileAppearance, [
        // Tablets support the dual pane layout, so they get the same pane settings as desktop
        ...(Platform.isTablet ? createDualPaneDefinitions(context) : []),
        // Floating toolbars only render with the phone chrome; tablets use the desktop headers
        ...(Platform.isTablet
            ? []
            : [
                  createRenderDefinition({
                      name: strings.settings.items.useFloatingToolbarsOnIOS.name,
                      desc: strings.settings.items.useFloatingToolbarsOnIOS.desc,
                      render: setting => {
                          setting
                              .setName(strings.settings.items.useFloatingToolbarsOnIOS.name)
                              .setDesc(strings.settings.items.useFloatingToolbarsOnIOS.desc)
                              .addToggle(toggle =>
                                  toggle.setValue(plugin.settings.useFloatingToolbars).onChange(value => {
                                      plugin.setUseFloatingToolbars(value);
                                  })
                              );
                          addSettingSyncModeToggle({ setting, plugin, settingId: 'useFloatingToolbars' });
                      }
                  })
              ])
    ]);
}

function createViewDefinitionGroup(context: SettingsTabContext): SettingDefinitionGroup {
    return createGroupDefinition(strings.settings.pages.appearanceAndBehavior.groups.appearance, [
        createRenderDefinition({
            name: strings.settings.items.zoomLevel.name,
            desc: strings.settings.items.zoomLevel.desc,
            render: setting => renderUIScaleSetting(setting, context)
        }),
        createRenderDefinition({
            name: strings.settings.items.singlePaneAnimation.name,
            desc: strings.settings.items.singlePaneAnimation.desc,
            aliases: [strings.settings.items.singlePaneAnimation.resetTooltip],
            render: setting => renderPaneTransitionSetting(setting, context)
        }),
        createToggleDefinition('showInfoButtons', {
            name: strings.settings.items.showInfoButtons.name,
            desc: strings.settings.items.showInfoButtons.desc
        })
    ]);
}

function createIconDefinitionGroup(context: SettingsTabContext): SettingDefinitionGroup {
    const { plugin } = context;

    return createGroupDefinition(strings.settings.pages.appearanceAndBehavior.groups.icons, [
        createRenderDefinition({
            name: strings.settings.items.interfaceIcons.name,
            desc: strings.settings.items.interfaceIcons.desc,
            aliases: [strings.settings.items.interfaceIcons.buttonText],
            render: setting => {
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
            }
        }),
        createToggleDefinition('colorIconOnly', {
            name: strings.settings.items.applyColorToIconsOnly.name,
            desc: strings.settings.items.applyColorToIconsOnly.desc
        })
    ]);
}

function createFormattingDefinitionGroup(context: SettingsTabContext): SettingDefinitionGroup {
    return createGroupDefinition(strings.settings.pages.appearanceAndBehavior.groups.formatting, [
        createRenderDefinition({
            name: strings.settings.items.dateFormat.name,
            desc: strings.settings.items.dateFormat.desc,
            aliases: [strings.settings.items.dateFormat.momentLinkText, strings.settings.items.dateFormat.helpTooltip],
            render: setting => renderDateFormatSetting(setting, context)
        }),
        createRenderDefinition({
            name: strings.settings.items.timeFormat.name,
            desc: strings.settings.items.timeFormat.desc,
            aliases: [strings.settings.items.timeFormat.momentLinkText, strings.settings.items.timeFormat.helpTooltip],
            render: setting => renderTimeFormatSetting(setting, context)
        })
    ]);
}

function renderUIScaleSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;
    const initialUIScalePercent = scaleToPercent(plugin.getUIScale());

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

    addSettingSyncModeToggle({ setting, plugin, settingId: 'uiScale' });
}

function renderPaneTransitionSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

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

    addSettingSyncModeToggle({ setting, plugin, settingId: 'paneTransitionDuration' });
}

function renderNarrowSidebarTriggerSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

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

    addSettingSyncModeToggle({ setting, plugin, settingId: 'narrowSidebarTriggerMode' });
}

function renderNarrowSidebarCustomWidthSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

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

    addSettingSyncModeToggle({ setting, plugin, settingId: 'narrowSidebarCustomWidth' });
}

function renderHomepageSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.homepage.name)
        .setDesc(strings.settings.items.homepage.desc)
        .addDropdown(dropdown =>
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
                    context.refreshSettingsDomState();
                    await plugin.saveSettingsAndUpdate();
                })
        );

    addSettingSyncModeToggle({ setting, plugin, settingId: 'homepage' });
}

function renderHomepageFileSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting.setName(strings.settings.items.homepage.file.name);
    setting.setDesc('');

    const homepageFileDescEl = setting.descEl;
    homepageFileDescEl.empty();
    const homepageFileValueEl = homepageFileDescEl.createDiv();
    let clearHomepageButton: ButtonComponent | null = null;

    setting.addButton(button => {
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
                homepageFileValueEl.setText(strings.settings.items.homepage.current.replace('{path}', file.path));
                clearHomepageButton?.setDisabled(false);
                runAsyncAction(() => plugin.saveSettingsAndUpdate());
            }).open();
        });
    });

    setting.addButton(button => {
        button.setButtonText(strings.common.clear);
        clearHomepageButton = button;
        button.setDisabled(!plugin.settings.homepage.file);
        button.onClick(() => {
            runAsyncAction(async () => {
                if (plugin.settings.homepage.source !== 'file' || !plugin.settings.homepage.file) {
                    return;
                }

                plugin.settings.homepage = {
                    ...plugin.settings.homepage,
                    file: null
                };
                homepageFileValueEl.setText(strings.settings.items.homepage.file.empty);
                button.setDisabled(true);
                await plugin.saveSettingsAndUpdate();
            });
        });
    });

    homepageFileValueEl.setText(
        plugin.settings.homepage.file
            ? strings.settings.items.homepage.current.replace('{path}', plugin.settings.homepage.file)
            : strings.settings.items.homepage.file.empty
    );
}

function renderDateFormatSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin, configureDebouncedTextSetting } = context;

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
    setting.addExtraButton(button =>
        button
            .setIcon('lucide-help-circle')
            .setTooltip(strings.settings.items.dateFormat.helpTooltip)
            .onClick(() => {
                showNotice(strings.settings.items.dateFormat.help, { timeout: TIMEOUTS.NOTICE_HELP });
            })
    );
    setting.controlEl.addClass('nn-setting-wide-input');
}

function renderTimeFormatSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin, configureDebouncedTextSetting } = context;

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
    setting.addExtraButton(button =>
        button
            .setIcon('lucide-help-circle')
            .setTooltip(strings.settings.items.timeFormat.helpTooltip)
            .onClick(() => {
                showNotice(strings.settings.items.timeFormat.help, { timeout: TIMEOUTS.NOTICE_HELP });
            })
    );
    setting.controlEl.addClass('nn-setting-wide-input');
}

interface RenderedToggleOptions extends DefinitionOptions {
    name: string;
    desc: string;
    getValue: () => boolean;
    setValue: (value: boolean) => void;
}

function createRenderedToggleDefinition(context: SettingsTabContext, options: RenderedToggleOptions): SettingDefinitionRender {
    return createRenderDefinition({
        name: options.name,
        desc: options.desc,
        aliases: options.aliases,
        visible: options.visible,
        render: setting => {
            setting.setName(options.name).setDesc(options.desc);
            setting.addToggle(toggle =>
                toggle.setValue(options.getValue()).onChange(async value => {
                    options.setValue(value);
                    await context.plugin.saveSettingsAndUpdate();
                })
            );
        }
    });
}

function createToggleDefinition(
    key: AppearanceBehaviorToggleKey,
    options: ControlDefinitionOptions
): SettingDefinitionControl<AppearanceBehaviorToggleKey> {
    return createToggleControlDefinition(key, {
        ...options,
        defaultValue: DEFAULT_SETTINGS[key]
    });
}

function createDropdownDefinition(
    key: AppearanceBehaviorDropdownKey,
    options: DropdownDefinitionOptions
): SettingDefinitionControl<AppearanceBehaviorDropdownKey> {
    return createDropdownControlDefinition(key, {
        ...options,
        defaultValue: DEFAULT_SETTINGS[key]
    });
}

function optionAliases(options: Record<string, string>): string[] {
    return Object.values(options);
}
