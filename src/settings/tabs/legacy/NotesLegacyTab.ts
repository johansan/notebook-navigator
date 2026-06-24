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
import { showNotice } from '../../../utils/noticeUtils';
import type { SettingsTabContext } from '../SettingsTabContext';
import { runAsyncAction } from '../../../utils/async';
import { createSettingGroupFactory } from '../../settingGroups';
import { addSettingSyncModeToggle } from '../../syncModeToggle';
import { createDependentSettingsSection, setElementVisible, wireToggleSettingWithDependentSection } from '../../dependentSettings';
import { DEFAULT_SETTINGS } from '../../defaultSettings';
import {
    isCharacterCountSpaces,
    isFeatureImagePixelSizeSetting,
    isFeatureImageSizeSetting,
    isTextCountDisplay,
    isTextCountPlacement,
    showsCharacterCount,
    showsWordCount
} from '../../types';
import {
    normalizeFileNameIconMapKey,
    normalizeFileTypeIconMapKey,
    parseIconMapText,
    serializeIconMapRecord,
    type IconMapParseResult
} from '../../../utils/iconizeFormat';
import { formatCommaSeparatedList, parseCommaSeparatedList } from '../../../utils/commaSeparatedListUtils';
import { EXTERNAL_ICON_PROVIDERS } from '../../../services/icons/external/providerRegistry';
import { FILE_TYPE_ICON_PROVIDER_PRESET_IDS, isFileTypeIconPreset, isFileTypeIconProviderPreset } from '../../../utils/fileTypeIconPresets';

function parseFileTypeIconMapText(value: string): IconMapParseResult {
    return parseIconMapText(value, normalizeFileTypeIconMapKey);
}

function parseFileNameIconMapText(value: string): IconMapParseResult {
    return parseIconMapText(value, normalizeFileNameIconMapKey);
}

interface ColorSettingAccess {
    getValue: () => string;
    setValue: (value: string) => void;
    defaultValue: string;
}

interface FileTypeIconPresetOption {
    label: string;
    isInstalled: boolean;
}

function getFileTypeIconPresetOptions(context: SettingsTabContext): Record<string, FileTypeIconPresetOption> {
    const options: Record<string, FileTypeIconPresetOption> = {
        none: {
            label: strings.settings.items.fileTypeIconPreset.options.none,
            isInstalled: true
        }
    };

    FILE_TYPE_ICON_PROVIDER_PRESET_IDS.forEach(providerId => {
        const config = EXTERNAL_ICON_PROVIDERS[providerId];
        const isInstalled = context.plugin.isExternalIconProviderInstalled(providerId);
        options[providerId] = {
            label: config.name,
            isInstalled
        };
    });

    return options;
}

function isSelectedFileTypeIconPresetUnavailable(context: SettingsTabContext): boolean {
    const { plugin } = context;
    const preset = plugin.settings.fileTypeIconPreset;
    return isFileTypeIconProviderPreset(preset) && !plugin.isExternalIconProviderInstalled(preset);
}

/** Legacy settings renderer used only by Obsidian versions before native 1.13 setting definitions. */
export function renderNotesTab(context: SettingsTabContext): void {
    const { app, containerEl, plugin } = context;

    const createGroup = createSettingGroupFactory(containerEl);
    const tasksGroup = createGroup(strings.settings.groups.notes.tasks);
    const iconGroup = createGroup(strings.settings.groups.notes.icon);
    const titleGroup = createGroup(strings.settings.groups.notes.title);
    const previewTextGroup = createGroup(strings.settings.groups.notes.previewText);
    const featureImageGroup = createGroup(strings.settings.groups.notes.featureImage);
    const tagsGroup = createGroup(strings.settings.groups.notes.tags);
    const notePropertyGroup = createGroup(strings.settings.groups.notes.properties);
    const dateGroup = createGroup(strings.settings.groups.notes.date);
    const parentFolderGroup = createGroup(strings.settings.groups.notes.parentFolder);
    const wordCountGroup = createGroup(strings.settings.groups.notes.wordCount);

    const setGroupVisible = (groupRootEl: HTMLElement, visible: boolean) => {
        setElementVisible(groupRootEl, visible);

        const headingEl = groupRootEl.previousElementSibling;
        if (headingEl instanceof HTMLElement && headingEl.classList.contains('setting-item-heading')) {
            setElementVisible(headingEl, visible);
        }
    };

    const createColorSetting = (params: { containerEl: HTMLElement; name: string; desc: string; access: ColorSettingAccess }): void => {
        const setting = new Setting(params.containerEl).setName(params.name).setDesc(params.desc);

        const previewEl = setting.controlEl.createDiv({ cls: 'nn-setting-color-preview' });
        const swatchButtonEl = previewEl.createEl('button', {
            cls: 'nn-setting-color-swatch-button',
            attr: {
                type: 'button',
                'aria-label': params.name
            }
        });
        const swatchEl = swatchButtonEl.createDiv({ cls: 'nn-setting-color-swatch' });

        const renderValue = () => {
            const current = params.access.getValue();
            swatchEl.style.backgroundColor = current;
            swatchButtonEl.setAttribute('title', current);
        };

        const openColorPicker = () => {
            runAsyncAction(async () => {
                if (!plugin.metadataService) {
                    showNotice(strings.common.unknownError, { variant: 'warning' });
                    return;
                }

                const { ColorPickerModal } = await import('../../../modals/ColorPickerModal');
                const modal = new ColorPickerModal(app, {
                    title: params.name,
                    initialColor: params.access.getValue(),
                    settingsProvider: plugin.metadataService.getSettingsProvider(),
                    onChooseColor: async color => {
                        const nextValue = typeof color === 'string' && color.trim().length > 0 ? color.trim() : params.access.defaultValue;
                        params.access.setValue(nextValue);
                        await plugin.saveSettingsAndUpdate();
                        renderValue();
                    }
                });

                modal.open();
            });
        };

        swatchButtonEl.addEventListener('click', openColorPicker);

        renderValue();

        setting.addExtraButton(button => {
            button
                .setIcon('lucide-rotate-ccw')
                .setTooltip(`${strings.common.restoreDefault} (${params.access.defaultValue})`)
                .onClick(() => {
                    runAsyncAction(async () => {
                        const current = params.access.getValue();
                        if (current === params.access.defaultValue) {
                            return;
                        }

                        params.access.setValue(params.access.defaultValue);
                        await plugin.saveSettingsAndUpdate();
                        renderValue();
                    });
                });
        });
    };

    tasksGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.showFileIconUnfinishedTask.name)
            .setDesc(strings.settings.items.showFileIconUnfinishedTask.desc)
            .addToggle(toggle =>
                toggle.setValue(plugin.settings.showFileIconUnfinishedTask).onChange(async value => {
                    plugin.settings.showFileIconUnfinishedTask = value;
                    await plugin.saveSettingsAndUpdate();
                })
            );
    });

    const showFileBackgroundUnfinishedTaskSetting = tasksGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.showFileBackgroundUnfinishedTask.name)
            .setDesc(strings.settings.items.showFileBackgroundUnfinishedTask.desc);
    });

    const unfinishedTaskBackgroundSettingsEl = wireToggleSettingWithDependentSection(
        showFileBackgroundUnfinishedTaskSetting,
        () => plugin.settings.showFileBackgroundUnfinishedTask,
        async value => {
            plugin.settings.showFileBackgroundUnfinishedTask = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    createColorSetting({
        containerEl: unfinishedTaskBackgroundSettingsEl,
        name: strings.settings.items.unfinishedTaskBackgroundColor.name,
        desc: strings.settings.items.unfinishedTaskBackgroundColor.desc,
        access: {
            getValue: () => plugin.settings.unfinishedTaskBackgroundColor,
            setValue: value => {
                plugin.settings.unfinishedTaskBackgroundColor = value;
            },
            defaultValue: DEFAULT_SETTINGS.unfinishedTaskBackgroundColor
        }
    });

    const showFileIconsSetting = iconGroup.addSetting(setting => {
        setting.setName(strings.settings.items.showFileIcons.name).setDesc(strings.settings.items.showFileIcons.desc);
    });

    const fileIconDependentSettingsEl = wireToggleSettingWithDependentSection(
        showFileIconsSetting,
        () => plugin.settings.showFileIcons,
        async value => {
            plugin.settings.showFileIcons = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    let updateFileNameIconMapVisibility: (() => void) | null = null;
    let updateFileTypeIconMapVisibility: (() => void) | null = null;

    /**
     * Adds an edit button to an icon map setting that opens the visual rule editor modal
     */
    const addIconMapEditorButton = (options: {
        setting: Setting;
        tooltip: string;
        title: string;
        mode: 'fileName' | 'fileType';
        getMap: () => Record<string, string>;
        setMap: (nextMap: Record<string, string>) => void;
        normalizeKey: (input: string) => string;
    }): void => {
        options.setting.addExtraButton(button =>
            button
                .setIcon('lucide-pencil')
                .setTooltip(options.tooltip)
                .onClick(() => {
                    runAsyncAction(async () => {
                        const metadataService = plugin.metadataService;
                        if (!metadataService) {
                            showNotice(strings.common.unknownError, { variant: 'warning' });
                            return;
                        }

                        const { FileIconRuleEditorModal } = await import('../../../modals/FileIconRuleEditorModal');
                        const modal = new FileIconRuleEditorModal(app, {
                            title: options.title,
                            mode: options.mode,
                            initialMap: options.getMap(),
                            fallbackIconId: 'file',
                            metadataService,
                            normalizeKey: options.normalizeKey,
                            onSave: async nextMap => {
                                options.setMap(nextMap);

                                const textarea = options.setting.controlEl.querySelector('textarea');
                                if (textarea instanceof HTMLTextAreaElement) {
                                    textarea.value = serializeIconMapRecord(nextMap);
                                }

                                await plugin.saveSettingsAndUpdate();
                            }
                        });
                        modal.open();
                    });
                })
        );
    };

    new Setting(fileIconDependentSettingsEl)
        .setName(strings.settings.items.useFolderIcon.name)
        .setDesc(strings.settings.items.useFolderIcon.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.useFolderIconForFiles).onChange(async value => {
                plugin.settings.useFolderIconForFiles = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const showFilenameMatchIconsSetting = new Setting(fileIconDependentSettingsEl)
        .setName(strings.settings.items.showFilenameMatchIcons.name)
        .setDesc(strings.settings.items.showFilenameMatchIcons.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showFilenameMatchIcons).onChange(async value => {
                plugin.settings.showFilenameMatchIcons = value;
                await plugin.saveSettingsAndUpdate();
                updateFileNameIconMapVisibility?.();
            })
        );
    const fileNameIconMapSettingsEl = createDependentSettingsSection(showFilenameMatchIconsSetting);

    const fileNameIconMapSetting = context.createDebouncedTextAreaSetting(
        fileNameIconMapSettingsEl,
        strings.settings.items.fileNameIconMap.name,
        strings.settings.items.fileNameIconMap.desc,
        strings.settings.items.fileNameIconMap.placeholder,
        () => serializeIconMapRecord(plugin.settings.fileNameIconMap),
        value => {
            const parsed = parseFileNameIconMapText(value);
            plugin.settings.fileNameIconMap = parsed.map;
        },
        {
            rows: 3,
            validator: value => parseFileNameIconMapText(value).invalidLines.length === 0
        }
    );

    addIconMapEditorButton({
        setting: fileNameIconMapSetting,
        tooltip: strings.settings.items.fileNameIconMap.editTooltip,
        title: strings.settings.items.fileNameIconMap.name,
        mode: 'fileName',
        getMap: () => plugin.settings.fileNameIconMap,
        setMap: nextMap => {
            plugin.settings.fileNameIconMap = nextMap;
        },
        normalizeKey: normalizeFileNameIconMapKey
    });
    fileNameIconMapSetting.controlEl.addClass('nn-setting-wide-input');
    updateFileNameIconMapVisibility = () => {
        setElementVisible(fileNameIconMapSettingsEl, plugin.settings.showFilenameMatchIcons);
    };
    updateFileNameIconMapVisibility();

    const showCategoryIconsSetting = new Setting(fileIconDependentSettingsEl)
        .setName(strings.settings.items.showCategoryIcons.name)
        .setDesc(strings.settings.items.showCategoryIcons.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showCategoryIcons).onChange(async value => {
                plugin.settings.showCategoryIcons = value;
                await plugin.saveSettingsAndUpdate();
                updateFileTypeIconMapVisibility?.();
            })
        );
    const fileTypeIconMapSettingsEl = createDependentSettingsSection(showCategoryIconsSetting);

    const fileTypeIconPresetSetting = new Setting(fileTypeIconMapSettingsEl)
        .setName(strings.settings.items.fileTypeIconPreset.name)
        .setDesc(strings.settings.items.fileTypeIconPreset.desc);
    const fileTypeIconPresetWarningEl = fileTypeIconPresetSetting.descEl.createDiv({
        cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
    });
    const updateFileTypeIconPresetWarning = () => {
        const showWarning = isSelectedFileTypeIconPresetUnavailable(context);
        fileTypeIconPresetWarningEl.setText(showWarning ? strings.settings.items.fileTypeIconPreset.notInstalledWarning : '');
        setElementVisible(fileTypeIconPresetWarningEl, showWarning);
    };

    fileTypeIconPresetSetting.addDropdown(dropdown => {
        const options = getFileTypeIconPresetOptions(context);

        Object.entries(options).forEach(([value, option]) => {
            dropdown.addOption(value, option.label);
        });

        Object.entries(options).forEach(([value, option]) => {
            if (option.isInstalled) {
                return;
            }

            const optionEl = Array.from(dropdown.selectEl.options).find(candidate => candidate.value === value);
            if (optionEl) {
                optionEl.disabled = true;
            }
        });

        dropdown.setValue(plugin.settings.fileTypeIconPreset).onChange(async value => {
            if (!isFileTypeIconPreset(value)) {
                return;
            }

            plugin.settings.fileTypeIconPreset = value;
            updateFileTypeIconPresetWarning();
            await plugin.saveSettingsAndUpdate();
        });
    });
    updateFileTypeIconPresetWarning();

    const fileTypeIconMapSetting = context.createDebouncedTextAreaSetting(
        fileTypeIconMapSettingsEl,
        strings.settings.items.fileTypeIconMap.name,
        strings.settings.items.fileTypeIconMap.desc,
        strings.settings.items.fileTypeIconMap.placeholder,
        () => serializeIconMapRecord(plugin.settings.fileTypeIconMap),
        value => {
            const parsed = parseFileTypeIconMapText(value);
            plugin.settings.fileTypeIconMap = parsed.map;
        },
        {
            rows: 3,
            validator: value => parseFileTypeIconMapText(value).invalidLines.length === 0
        }
    );

    addIconMapEditorButton({
        setting: fileTypeIconMapSetting,
        tooltip: strings.settings.items.fileTypeIconMap.editTooltip,
        title: strings.settings.items.fileTypeIconMap.name,
        mode: 'fileType',
        getMap: () => plugin.settings.fileTypeIconMap,
        setMap: nextMap => {
            plugin.settings.fileTypeIconMap = nextMap;
        },
        normalizeKey: normalizeFileTypeIconMapKey
    });
    fileTypeIconMapSetting.controlEl.addClass('nn-setting-wide-input');
    updateFileTypeIconMapVisibility = () => {
        setElementVisible(fileTypeIconMapSettingsEl, plugin.settings.showCategoryIcons);
    };
    updateFileTypeIconMapVisibility();

    titleGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.fileNameRows.name)
            .setDesc(strings.settings.items.fileNameRows.desc)
            .addDropdown(dropdown =>
                dropdown
                    .addOption('1', strings.settings.items.fileNameRows.options['1'])
                    .addOption('2', strings.settings.items.fileNameRows.options['2'])
                    .addOption('3', strings.settings.items.fileNameRows.options['3'])
                    .setValue(plugin.settings.fileNameRows.toString())
                    .onChange(async value => {
                        plugin.settings.fileNameRows = parseInt(value, 10);
                        await plugin.saveSettingsAndUpdate();
                    })
            );
    });

    titleGroup.addSetting(setting => {
        setting
            .setName(strings.settings.items.useFolderColor.name)
            .setDesc(strings.settings.items.useFolderColor.desc)
            .addToggle(toggle =>
                toggle.setValue(plugin.settings.useFolderColorForTitles).onChange(async value => {
                    plugin.settings.useFolderColorForTitles = value;
                    await plugin.saveSettingsAndUpdate();
                })
            );
    });

    const showPreviewSetting = previewTextGroup.addSetting(setting => {
        setting.setName(strings.settings.items.showFilePreview.name).setDesc(strings.settings.items.showFilePreview.desc);
    });

    const previewSettingsEl = wireToggleSettingWithDependentSection(
        showPreviewSetting,
        () => plugin.settings.showFilePreview,
        async value => {
            plugin.settings.showFilePreview = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    new Setting(previewSettingsEl)
        .setName(strings.settings.items.previewRows.name)
        .setDesc(strings.settings.items.previewRows.desc)
        .addDropdown(dropdown =>
            dropdown
                .addOption('1', strings.settings.items.previewRows.options['1'])
                .addOption('2', strings.settings.items.previewRows.options['2'])
                .addOption('3', strings.settings.items.previewRows.options['3'])
                .addOption('4', strings.settings.items.previewRows.options['4'])
                .addOption('5', strings.settings.items.previewRows.options['5'])
                .setValue(plugin.settings.previewRows.toString())
                .onChange(async value => {
                    plugin.settings.previewRows = parseInt(value, 10);
                    await plugin.saveSettingsAndUpdate();
                })
        );

    new Setting(previewSettingsEl)
        .setName(strings.settings.items.skipHeadingsInPreview.name)
        .setDesc(strings.settings.items.skipHeadingsInPreview.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.skipHeadingsInPreview).onChange(async value => {
                plugin.settings.skipHeadingsInPreview = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(previewSettingsEl)
        .setName(strings.settings.items.skipCodeBlocksInPreview.name)
        .setDesc(strings.settings.items.skipCodeBlocksInPreview.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.skipCodeBlocksInPreview).onChange(async value => {
                plugin.settings.skipCodeBlocksInPreview = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(previewSettingsEl)
        .setName(strings.settings.items.stripHtmlInPreview.name)
        .setDesc(strings.settings.items.stripHtmlInPreview.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.stripHtmlInPreview).onChange(async value => {
                plugin.settings.stripHtmlInPreview = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(previewSettingsEl)
        .setName(strings.settings.items.stripLatexInPreview.name)
        .setDesc(strings.settings.items.stripLatexInPreview.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.stripLatexInPreview).onChange(async value => {
                plugin.settings.stripLatexInPreview = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const previewPropertiesSetting = context.createDebouncedTextSetting(
        previewSettingsEl,
        strings.settings.items.previewProperties.name,
        strings.settings.items.previewProperties.desc,
        strings.settings.items.previewProperties.placeholder,
        () => formatCommaSeparatedList(plugin.settings.previewProperties),
        value => {
            plugin.settings.previewProperties = parseCommaSeparatedList(value);
        },
        undefined,
        () => {
            updatePreviewFallbackVisibility();
        }
    );
    previewPropertiesSetting.controlEl.addClass('nn-setting-wide-input');

    const previewFallbackSetting = new Setting(previewSettingsEl)
        .setName(strings.settings.items.previewPropertiesFallback.name)
        .setDesc(strings.settings.items.previewPropertiesFallback.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.previewPropertiesFallback).onChange(async value => {
                plugin.settings.previewPropertiesFallback = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const updatePreviewFallbackVisibility = () => {
        setElementVisible(previewFallbackSetting.settingEl, plugin.settings.previewProperties.length > 0);
    };
    updatePreviewFallbackVisibility();

    const showFeatureImageSetting = featureImageGroup.addSetting(setting => {
        setting.setName(strings.settings.items.showFeatureImage.name).setDesc(strings.settings.items.showFeatureImage.desc);
    });

    const featureImageSettingsEl = wireToggleSettingWithDependentSection(
        showFeatureImageSetting,
        () => plugin.settings.showFeatureImage,
        async value => {
            plugin.settings.showFeatureImage = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    const featurePropertiesSetting = context.createDebouncedTextSetting(
        featureImageSettingsEl,
        strings.settings.items.featureImageProperties.name,
        strings.settings.items.featureImageProperties.desc,
        strings.settings.items.featureImageProperties.placeholder,
        () => formatCommaSeparatedList(plugin.settings.featureImageProperties),
        value => {
            plugin.settings.featureImageProperties = parseCommaSeparatedList(value);
        }
    );
    featurePropertiesSetting.controlEl.addClass('nn-setting-wide-input');

    const featureExcludePropertiesSetting = context.createDebouncedTextSetting(
        featureImageSettingsEl,
        strings.settings.items.featureImageExcludeProperties.name,
        strings.settings.items.featureImageExcludeProperties.desc,
        strings.settings.items.featureImageExcludeProperties.placeholder,
        () => formatCommaSeparatedList(plugin.settings.featureImageExcludeProperties),
        value => {
            plugin.settings.featureImageExcludeProperties = parseCommaSeparatedList(value);
        }
    );
    featureExcludePropertiesSetting.controlEl.addClass('nn-setting-wide-input');

    const featureImageSizeSetting = new Setting(featureImageSettingsEl)
        .setName(strings.settings.items.featureImageSize.name)
        .setDesc(strings.settings.items.featureImageSize.desc)
        .addDropdown(dropdown =>
            dropdown
                .addOption('64', strings.settings.items.featureImageSize.options.standard)
                .addOption('96', strings.settings.items.featureImageSize.options.large)
                .addOption('128', strings.settings.items.featureImageSize.options.extraLarge)
                .setValue(plugin.settings.featureImageSize)
                .onChange(value => {
                    if (!isFeatureImageSizeSetting(value)) {
                        return;
                    }
                    plugin.setFeatureImageSize(value);
                })
        );
    addSettingSyncModeToggle({ setting: featureImageSizeSetting, plugin, settingId: 'featureImageSize' });

    const featureImagePixelSizeSetting = new Setting(featureImageSettingsEl)
        .setName(strings.settings.items.featureImagePixelSize.name)
        .setDesc(strings.settings.items.featureImagePixelSize.desc)
        .addDropdown(dropdown =>
            dropdown
                .addOption('256', strings.settings.items.featureImagePixelSize.options.standard)
                .addOption('384', strings.settings.items.featureImagePixelSize.options.large)
                .addOption('512', strings.settings.items.featureImagePixelSize.options.extraLarge)
                .setValue(plugin.settings.featureImagePixelSize)
                .onChange(value => {
                    if (!isFeatureImagePixelSizeSetting(value)) {
                        return;
                    }
                    plugin.setFeatureImagePixelSize(value);
                })
        );
    addSettingSyncModeToggle({ setting: featureImagePixelSizeSetting, plugin, settingId: 'featureImagePixelSize' });

    new Setting(featureImageSettingsEl)
        .setName(strings.settings.items.forceSquareFeatureImage.name)
        .setDesc(strings.settings.items.forceSquareFeatureImage.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.forceSquareFeatureImage).onChange(async value => {
                plugin.settings.forceSquareFeatureImage = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(featureImageSettingsEl)
        .setName(strings.settings.items.downloadExternalFeatureImages.name)
        .setDesc(strings.settings.items.downloadExternalFeatureImages.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.downloadExternalFeatureImages).onChange(async value => {
                plugin.settings.downloadExternalFeatureImages = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const showFileTagsSetting = tagsGroup.addSetting(setting => {
        setting.setName(strings.settings.items.showFileTags.name).setDesc(strings.settings.items.showFileTags.desc);
    });

    const fileTagsDependentSettingsEl = wireToggleSettingWithDependentSection(
        showFileTagsSetting,
        () => plugin.settings.showFileTags,
        async value => {
            plugin.settings.showFileTags = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    const colorFileTagsSetting = new Setting(fileTagsDependentSettingsEl)
        .setName(strings.settings.items.colorFileTags.name)
        .setDesc(strings.settings.items.colorFileTags.desc);
    const colorFileTagsDependentSettingsEl = wireToggleSettingWithDependentSection(
        colorFileTagsSetting,
        () => plugin.settings.colorFileTags,
        async value => {
            plugin.settings.colorFileTags = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    new Setting(colorFileTagsDependentSettingsEl)
        .setName(strings.settings.items.prioritizeColoredFileTags.name)
        .setDesc(strings.settings.items.prioritizeColoredFileTags.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.prioritizeColoredFileTags).onChange(async value => {
                plugin.settings.prioritizeColoredFileTags = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(fileTagsDependentSettingsEl)
        .setName(strings.settings.items.showFileTagAncestors.name)
        .setDesc(strings.settings.items.showFileTagAncestors.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showFileTagAncestors).onChange(async value => {
                plugin.settings.showFileTagAncestors = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(fileTagsDependentSettingsEl)
        .setName(strings.settings.items.showFileTagsInCompactMode.name)
        .setDesc(strings.settings.items.showFileTagsInCompactMode.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showFileTagsInCompactMode).onChange(async value => {
                plugin.settings.showFileTagsInCompactMode = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const showFilePropertiesSetting = notePropertyGroup.addSetting(setting => {
        setting.setName(strings.settings.items.showFileProperties.name).setDesc(strings.settings.items.showFileProperties.desc);
    });

    const filePropertiesDependentSettingsEl = wireToggleSettingWithDependentSection(
        showFilePropertiesSetting,
        () => plugin.settings.showFileProperties,
        async value => {
            plugin.settings.showFileProperties = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    const colorFilePropertiesSetting = new Setting(filePropertiesDependentSettingsEl)
        .setName(strings.settings.items.colorFileProperties.name)
        .setDesc(strings.settings.items.colorFileProperties.desc);

    const colorFilePropertiesDependentSettingsEl = wireToggleSettingWithDependentSection(
        colorFilePropertiesSetting,
        () => plugin.settings.colorFileProperties,
        async value => {
            plugin.settings.colorFileProperties = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    new Setting(colorFilePropertiesDependentSettingsEl)
        .setName(strings.settings.items.prioritizeColoredFileProperties.name)
        .setDesc(strings.settings.items.prioritizeColoredFileProperties.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.prioritizeColoredFileProperties).onChange(async value => {
                plugin.settings.prioritizeColoredFileProperties = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(filePropertiesDependentSettingsEl)
        .setName(strings.settings.items.showFilePropertiesInCompactMode.name)
        .setDesc(strings.settings.items.showFilePropertiesInCompactMode.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showFilePropertiesInCompactMode).onChange(async value => {
                plugin.settings.showFilePropertiesInCompactMode = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(filePropertiesDependentSettingsEl)
        .setName(strings.settings.items.showPropertiesOnSeparateRows.name)
        .setDesc(strings.settings.items.showPropertiesOnSeparateRows.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showPropertiesOnSeparateRows).onChange(async value => {
                plugin.settings.showPropertiesOnSeparateRows = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(filePropertiesDependentSettingsEl)
        .setName(strings.settings.items.enablePropertyInternalLinks.name)
        .setDesc(strings.settings.items.enablePropertyInternalLinks.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.enablePropertyInternalLinks).onChange(async value => {
                plugin.settings.enablePropertyInternalLinks = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(filePropertiesDependentSettingsEl)
        .setName(strings.settings.items.enablePropertyExternalLinks.name)
        .setDesc(strings.settings.items.enablePropertyExternalLinks.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.enablePropertyExternalLinks).onChange(async value => {
                plugin.settings.enablePropertyExternalLinks = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const showFileDateSetting = dateGroup.addSetting(setting => {
        setting.setName(strings.settings.items.showFileDate.name).setDesc(strings.settings.items.showFileDate.desc);
    });

    const fileDateDependentSettingsEl = wireToggleSettingWithDependentSection(
        showFileDateSetting,
        () => plugin.settings.showFileDate,
        async value => {
            plugin.settings.showFileDate = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    // Dropdown to choose which date to display when sorting alphabetically
    new Setting(fileDateDependentSettingsEl)
        .setName(strings.settings.items.alphabeticalDateMode.name)
        .setDesc(strings.settings.items.alphabeticalDateMode.desc)
        .addDropdown(dropdown =>
            dropdown
                .addOption('created', strings.settings.items.alphabeticalDateMode.options.created)
                .addOption('modified', strings.settings.items.alphabeticalDateMode.options.modified)
                .setValue(plugin.settings.alphabeticalDateMode)
                .onChange(async value => {
                    plugin.settings.alphabeticalDateMode = value === 'modified' ? 'modified' : 'created';
                    await plugin.saveSettingsAndUpdate();
                })
        );

    const showParentFolderSetting = parentFolderGroup.addSetting(setting => {
        setting.setName(strings.settings.items.showParentFolder.name).setDesc(strings.settings.items.showParentFolder.desc);
    });

    const parentFolderSettingsEl = wireToggleSettingWithDependentSection(
        showParentFolderSetting,
        () => plugin.settings.showParentFolder,
        async value => {
            plugin.settings.showParentFolder = value;
            await plugin.saveSettingsAndUpdate();
        }
    );

    new Setting(parentFolderSettingsEl)
        .setName(strings.settings.items.showParentFolderFullPath.name)
        .setDesc(strings.settings.items.showParentFolderFullPath.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showParentFolderFullPath).onChange(async value => {
                plugin.settings.showParentFolderFullPath = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(parentFolderSettingsEl)
        .setName(strings.settings.items.parentFolderClickRevealsFile.name)
        .setDesc(strings.settings.items.parentFolderClickRevealsFile.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.parentFolderClickRevealsFile).onChange(async value => {
                plugin.settings.parentFolderClickRevealsFile = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(parentFolderSettingsEl)
        .setName(strings.settings.items.showParentFolderColor.name)
        .setDesc(strings.settings.items.showParentFolderColor.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showParentFolderColor).onChange(async value => {
                plugin.settings.showParentFolderColor = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    new Setting(parentFolderSettingsEl)
        .setName(strings.settings.items.showParentFolderIcon.name)
        .setDesc(strings.settings.items.showParentFolderIcon.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showParentFolderIcon).onChange(async value => {
                plugin.settings.showParentFolderIcon = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    const textCountDisplaySetting = wordCountGroup.addSetting(setting => {
        setting.setName(strings.settings.items.textCountDisplay.name).setDesc(strings.settings.items.textCountDisplay.desc);
    });
    const textCountSettingsEl = createDependentSettingsSection(textCountDisplaySetting);
    const wordCountSettingsEl = textCountSettingsEl.createDiv();
    const characterCountSettingsEl = textCountSettingsEl.createDiv();
    const refreshTextCountSections = (): void => {
        setElementVisible(textCountSettingsEl, plugin.settings.textCountDisplay !== 'none');
        setElementVisible(wordCountSettingsEl, showsWordCount(plugin.settings.textCountDisplay));
        setElementVisible(characterCountSettingsEl, showsCharacterCount(plugin.settings.textCountDisplay));
    };
    refreshTextCountSections();

    textCountDisplaySetting.addDropdown(dropdown =>
        dropdown
            .addOption('none', strings.settings.items.textCountDisplay.options.none)
            .addOption('words', strings.settings.items.textCountDisplay.options.words)
            .addOption('characters', strings.settings.items.textCountDisplay.options.characters)
            .addOption('both', strings.settings.items.textCountDisplay.options.both)
            .setValue(plugin.settings.textCountDisplay)
            .onChange(async value => {
                if (!isTextCountDisplay(value)) {
                    return;
                }

                plugin.settings.textCountDisplay = value;
                await plugin.saveSettingsAndUpdate();
                refreshTextCountSections();
            })
    );

    new Setting(textCountSettingsEl)
        .setName(strings.settings.items.textCountPlacement.name)
        .setDesc(strings.settings.items.textCountPlacement.desc)
        .addDropdown(dropdown =>
            dropdown
                .addOption('title', strings.settings.items.textCountPlacement.options.title)
                .addOption('property', strings.settings.items.textCountPlacement.options.property)
                .setValue(plugin.settings.textCountPlacement)
                .onChange(async value => {
                    if (!isTextCountPlacement(value)) {
                        return;
                    }

                    plugin.settings.textCountPlacement = value;
                    await plugin.saveSettingsAndUpdate();
                })
        );

    new Setting(characterCountSettingsEl)
        .setName(strings.settings.items.characterCountSpaces.name)
        .setDesc(strings.settings.items.characterCountSpaces.desc)
        .addDropdown(dropdown =>
            dropdown
                .addOption('include', strings.settings.items.characterCountSpaces.options.include)
                .addOption('exclude', strings.settings.items.characterCountSpaces.options.exclude)
                .setValue(plugin.settings.characterCountSpaces)
                .onChange(async value => {
                    if (!isCharacterCountSpaces(value)) {
                        return;
                    }

                    plugin.settings.characterCountSpaces = value;
                    await plugin.saveSettingsAndUpdate();
                })
        );

    const wordCountTargetPropertySetting = context.createDebouncedTextSetting(
        wordCountSettingsEl,
        strings.settings.items.wordCountTargetProperty.name,
        strings.settings.items.wordCountTargetProperty.desc,
        DEFAULT_SETTINGS.wordCountTargetProperty,
        () => plugin.settings.wordCountTargetProperty,
        value => {
            plugin.settings.wordCountTargetProperty = value.trim();
        }
    );
    wordCountTargetPropertySetting.controlEl.addClass('nn-setting-wide-input');

    new Setting(wordCountSettingsEl)
        .setName(strings.settings.items.showWordCountPercentage.name)
        .setDesc(strings.settings.items.showWordCountPercentage.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.showWordCountPercentage).onChange(async value => {
                plugin.settings.showWordCountPercentage = value;
                await plugin.saveSettingsAndUpdate();
            })
        );

    context.registerShowTagsListener(visible => {
        setGroupVisible(tagsGroup.rootEl, visible);
    });
}
