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

import { Setting, setIcon } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import { strings } from '../../i18n';
import { showNotice } from '../../utils/noticeUtils';
import type { SettingsTabContext } from './SettingsTabContext';
import { runAsyncAction } from '../../utils/async';
import { addSettingSyncModeToggle } from '../syncModeToggle';
import { attachColorSwatchSetting } from '../colorSwatchSetting';
import { DEFAULT_SETTINGS } from '../defaultSettings';
import { createDropdownDefinition, createGroupDefinition, createRenderDefinition, createToggleDefinition } from '../nativeSettingControls';
import { isFeatureImagePixelSizeSetting, isFeatureImageSizeSetting, showsCharacterCount, showsWordCount } from '../types';
import {
    normalizeFileNameIconMapKey,
    normalizeFileTypeIconMapKey,
    parseIconMapText,
    serializeIconMapRecord,
    type IconMapParseResult
} from '../../utils/iconizeFormat';
import { formatCommaSeparatedList, parseCommaSeparatedList } from '../../utils/commaSeparatedListUtils';
import { EXTERNAL_ICON_PROVIDERS } from '../../services/icons/external/providerRegistry';
import { FILE_TYPE_ICON_PROVIDER_PRESET_IDS, isFileTypeIconPreset, isFileTypeIconProviderPreset } from '../../utils/fileTypeIconPresets';
import {
    getMarkdownTextCountDependencies,
    subscribeMarkdownWordCountConsumerChanges,
    type MarkdownTextCountDependency
} from '../../utils/markdownPipelineContentTypes';
import { parsePropertyNodeId } from '../../utils/propertyTree';
import { ItemType, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID } from '../../types';
import { getVirtualTagCollection, isVirtualTagCollectionId } from '../../utils/virtualTagCollections';

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

const MAX_VISIBLE_TEXT_COUNT_DEPENDENCIES = 3;

export function formatTextCountDependencyScope(dependency: MarkdownTextCountDependency): string {
    if (dependency.reason === 'group-header') {
        return dependency.path;
    }

    const labels = strings.settings.items.textCountActiveNotice.scopes;
    switch (dependency.selectionType) {
        case ItemType.FOLDER:
            return labels.folder.replace('{name}', dependency.key);
        case ItemType.TAG:
            if (isVirtualTagCollectionId(dependency.key)) {
                return getVirtualTagCollection(dependency.key).getLabel();
            }
            return labels.tag.replace('{name}', dependency.key);
        case ItemType.PROPERTY: {
            if (dependency.key === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
                return strings.navigationPane.properties;
            }
            const parsed = parsePropertyNodeId(dependency.key);
            const name = parsed ? (parsed.valuePath ? `${parsed.key} = ${parsed.valuePath}` : parsed.key) : dependency.key;
            return labels.property.replace('{name}', name);
        }
        default:
            return dependency.key;
    }
}

/** Renders the explanatory footer shown when non-display settings keep word or character counting active. */
export function renderTextCountActiveNotice(setting: Setting, context: SettingsTabContext): void {
    const dependencies = getMarkdownTextCountDependencies(context.app, context.plugin.settings);
    const copy = strings.settings.items.textCountActiveNotice;

    setting.setName('').setDesc('');
    setting.settingEl.addClass('nn-setting-info-container');
    setting.settingEl.addClass('nn-setting-info-list');
    setting.settingEl.addClass('nn-setting-text-count-warning');
    setting.descEl.empty();

    const headerEl = setting.descEl.createDiv({ cls: 'nn-setting-text-count-warning-header' });
    const iconEl = headerEl.createSpan({ cls: 'nn-setting-text-count-warning-icon', attr: { 'aria-hidden': 'true' } });
    setIcon(iconEl, 'lucide-triangle-alert');
    headerEl.createEl('strong', { text: copy.title });

    setting.descEl.createDiv({ text: copy.summary });

    const listEl = setting.descEl.createEl('ol');
    dependencies.slice(0, MAX_VISIBLE_TEXT_COUNT_DEPENDENCIES).forEach(dependency => {
        const itemEl = listEl.createEl('li');
        const reason = copy.reasons[dependency.reason];
        itemEl.createEl('strong', { text: reason });
        itemEl.appendText(`: ${formatTextCountDependencyScope(dependency)}`);
    });
    if (dependencies.length > MAX_VISIBLE_TEXT_COUNT_DEPENDENCIES) {
        const remainingCount = dependencies.length - MAX_VISIBLE_TEXT_COUNT_DEPENDENCIES;
        listEl.createEl('li', { text: copy.more.replace('{count}', remainingCount.toString()) });
    }
}

/** Builds native 1.13 setting definitions for note appearance and metadata settings. */
export function createNotesSettingDefinitions(context: SettingsTabContext): SettingDefinitionItem[] {
    const { plugin } = context;

    return [
        createGroupDefinition(strings.settings.pages.fileDisplay.groups.icon, [
            createToggleDefinition('showFileIcons', {
                name: strings.settings.items.showFileIcons.name,
                desc: strings.settings.items.showFileIcons.desc
            }),
            createDropdownDefinition('unfinishedTaskIcon', {
                name: strings.settings.items.unfinishedTaskIcon.name,
                desc: strings.settings.items.unfinishedTaskIcon.desc,
                aliases: Object.values(strings.settings.items.unfinishedTaskIcon.options),
                options: {
                    none: strings.settings.items.unfinishedTaskIcon.options.disabled,
                    compact: strings.settings.items.unfinishedTaskIcon.options.compact,
                    all: strings.settings.items.unfinishedTaskIcon.options.standardAndCompact
                },
                visible: () => plugin.settings.showFileIcons
            }),
            createToggleDefinition('useFolderIconForFiles', {
                name: strings.settings.items.useFolderIcon.name,
                desc: strings.settings.items.useFolderIcon.desc,
                visible: () => plugin.settings.showFileIcons
            }),
            createToggleDefinition('showFilenameMatchIcons', {
                name: strings.settings.items.showFileNameIcons.name,
                desc: strings.settings.items.showFileNameIcons.desc,
                visible: () => plugin.settings.showFileIcons
            }),
            createRenderDefinition({
                name: strings.settings.items.fileNameIconMap.name,
                desc: strings.settings.items.fileNameIconMap.desc,
                aliases: [strings.settings.items.fileNameIconMap.placeholder, strings.settings.items.fileNameIconMap.editTooltip],
                visible: () => plugin.settings.showFileIcons && plugin.settings.showFilenameMatchIcons,
                render: setting =>
                    renderIconMapSetting(setting, context, {
                        name: strings.settings.items.fileNameIconMap.name,
                        desc: strings.settings.items.fileNameIconMap.desc,
                        placeholder: strings.settings.items.fileNameIconMap.placeholder,
                        tooltip: strings.settings.items.fileNameIconMap.editTooltip,
                        mode: 'fileName',
                        getMap: () => plugin.settings.fileNameIconMap,
                        setMap: nextMap => {
                            plugin.settings.fileNameIconMap = nextMap;
                        },
                        parse: parseFileNameIconMapText,
                        normalizeKey: normalizeFileNameIconMapKey
                    })
            }),
            createToggleDefinition('showCategoryIcons', {
                name: strings.settings.items.showFileTypeIcons.name,
                desc: strings.settings.items.showFileTypeIcons.desc,
                visible: () => plugin.settings.showFileIcons
            }),
            createRenderDefinition({
                name: strings.settings.items.fileTypeIconPreset.name,
                desc: strings.settings.items.fileTypeIconPreset.desc,
                aliases: Object.values(getFileTypeIconPresetOptions(context)).map(option => option.label),
                visible: () => plugin.settings.showFileIcons && plugin.settings.showCategoryIcons,
                render: setting => renderFileTypeIconPresetSetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.fileTypeIconMap.name,
                desc: strings.settings.items.fileTypeIconMap.desc,
                aliases: [strings.settings.items.fileTypeIconMap.placeholder, strings.settings.items.fileTypeIconMap.editTooltip],
                visible: () => plugin.settings.showFileIcons && plugin.settings.showCategoryIcons,
                render: setting =>
                    renderIconMapSetting(setting, context, {
                        name: strings.settings.items.fileTypeIconMap.name,
                        desc: strings.settings.items.fileTypeIconMap.desc,
                        placeholder: strings.settings.items.fileTypeIconMap.placeholder,
                        tooltip: strings.settings.items.fileTypeIconMap.editTooltip,
                        mode: 'fileType',
                        getMap: () => plugin.settings.fileTypeIconMap,
                        setMap: nextMap => {
                            plugin.settings.fileTypeIconMap = nextMap;
                        },
                        parse: parseFileTypeIconMapText,
                        normalizeKey: normalizeFileTypeIconMapKey
                    })
            })
        ]),
        createGroupDefinition(strings.settings.pages.fileDisplay.groups.title, [
            createRenderDefinition({
                name: strings.settings.items.titleRows.name,
                desc: strings.settings.items.titleRows.desc,
                aliases: Object.values(strings.settings.items.titleRows.options),
                render: setting => renderFileNameRowsSetting(setting, context)
            }),
            createToggleDefinition('useFolderColorForTitles', {
                name: strings.settings.items.useFolderColor.name,
                desc: strings.settings.items.useFolderColor.desc
            })
        ]),
        createGroupDefinition(strings.settings.pages.fileDisplay.groups.previewText, [
            createToggleDefinition('showFilePreview', {
                name: strings.settings.items.showNotePreview.name,
                desc: strings.settings.items.showNotePreview.desc
            }),
            createRenderDefinition({
                name: strings.settings.items.previewRows.name,
                desc: strings.settings.items.previewRows.desc,
                aliases: Object.values(strings.settings.items.previewRows.options),
                visible: () => plugin.settings.showFilePreview,
                render: setting => renderPreviewRowsSetting(setting, context)
            }),
            createToggleDefinition('skipHeadingsInPreview', {
                name: strings.settings.items.skipHeadingsInPreview.name,
                desc: strings.settings.items.skipHeadingsInPreview.desc,
                visible: () => plugin.settings.showFilePreview
            }),
            createToggleDefinition('skipCodeBlocksInPreview', {
                name: strings.settings.items.skipCodeBlocksInPreview.name,
                desc: strings.settings.items.skipCodeBlocksInPreview.desc,
                visible: () => plugin.settings.showFilePreview
            }),
            createToggleDefinition('skipCalloutsInPreview', {
                name: strings.settings.items.skipCalloutsInPreview.name,
                desc: strings.settings.items.skipCalloutsInPreview.desc,
                visible: () => plugin.settings.showFilePreview
            }),
            createToggleDefinition('stripHtmlInPreview', {
                name: strings.settings.items.stripHtmlInPreview.name,
                desc: strings.settings.items.stripHtmlInPreview.desc,
                visible: () => plugin.settings.showFilePreview
            }),
            createToggleDefinition('stripLatexInPreview', {
                name: strings.settings.items.stripLatexInPreview.name,
                desc: strings.settings.items.stripLatexInPreview.desc,
                visible: () => plugin.settings.showFilePreview
            }),
            createRenderDefinition({
                name: strings.settings.items.previewProperties.name,
                desc: strings.settings.items.previewProperties.desc,
                aliases: [strings.settings.items.previewProperties.placeholder],
                visible: () => plugin.settings.showFilePreview,
                render: setting =>
                    renderCommaSeparatedTextSetting(setting, context, {
                        name: strings.settings.items.previewProperties.name,
                        desc: strings.settings.items.previewProperties.desc,
                        placeholder: strings.settings.items.previewProperties.placeholder,
                        getValue: () => formatCommaSeparatedList(plugin.settings.previewProperties),
                        setValue: value => {
                            plugin.settings.previewProperties = parseCommaSeparatedList(value);
                        },
                        onAfterUpdate: () => context.refreshSettingsDomState()
                    })
            }),
            createToggleDefinition('previewPropertiesFallback', {
                name: strings.settings.items.fallbackToNoteContent.name,
                desc: strings.settings.items.fallbackToNoteContent.desc,
                visible: () => plugin.settings.showFilePreview && plugin.settings.previewProperties.length > 0
            })
        ]),
        createGroupDefinition(strings.settings.pages.fileDisplay.groups.featureImage, [
            createToggleDefinition('showFeatureImage', {
                name: strings.settings.items.showFeatureImage.name,
                desc: strings.settings.items.showFeatureImage.desc
            }),
            createRenderDefinition({
                name: strings.settings.items.featureImageProperties.name,
                desc: strings.settings.items.featureImageProperties.desc,
                aliases: [strings.settings.items.featureImageProperties.placeholder],
                visible: () => plugin.settings.showFeatureImage,
                render: setting =>
                    renderCommaSeparatedTextSetting(setting, context, {
                        name: strings.settings.items.featureImageProperties.name,
                        desc: strings.settings.items.featureImageProperties.desc,
                        placeholder: strings.settings.items.featureImageProperties.placeholder,
                        getValue: () => formatCommaSeparatedList(plugin.settings.featureImageProperties),
                        setValue: value => {
                            plugin.settings.featureImageProperties = parseCommaSeparatedList(value);
                        }
                    })
            }),
            createRenderDefinition({
                name: strings.settings.items.featureImageExcludeProperties.name,
                desc: strings.settings.items.featureImageExcludeProperties.desc,
                aliases: [strings.settings.items.featureImageExcludeProperties.placeholder],
                visible: () => plugin.settings.showFeatureImage,
                render: setting =>
                    renderCommaSeparatedTextSetting(setting, context, {
                        name: strings.settings.items.featureImageExcludeProperties.name,
                        desc: strings.settings.items.featureImageExcludeProperties.desc,
                        placeholder: strings.settings.items.featureImageExcludeProperties.placeholder,
                        getValue: () => formatCommaSeparatedList(plugin.settings.featureImageExcludeProperties),
                        setValue: value => {
                            plugin.settings.featureImageExcludeProperties = parseCommaSeparatedList(value);
                        }
                    })
            }),
            createRenderDefinition({
                name: strings.settings.items.featureImageDisplaySize.name,
                desc: strings.settings.items.featureImageDisplaySize.desc,
                aliases: Object.values(strings.settings.items.featureImageDisplaySize.options),
                visible: () => plugin.settings.showFeatureImage,
                render: setting => renderFeatureImageSizeSetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.featureImagePixelSize.name,
                desc: strings.settings.items.featureImagePixelSize.desc,
                aliases: Object.values(strings.settings.items.featureImagePixelSize.options),
                visible: () => plugin.settings.showFeatureImage,
                render: setting => renderFeatureImagePixelSizeSetting(setting, context)
            }),
            createToggleDefinition('forceSquareFeatureImage', {
                name: strings.settings.items.forceSquareFeatureImage.name,
                desc: strings.settings.items.forceSquareFeatureImage.desc,
                visible: () => plugin.settings.showFeatureImage
            }),
            createToggleDefinition('downloadExternalFeatureImages', {
                name: strings.settings.items.downloadExternalFeatureImages.name,
                desc: strings.settings.items.downloadExternalFeatureImages.desc,
                visible: () => plugin.settings.showFeatureImage
            })
        ]),
        createGroupDefinition(
            strings.settings.pages.fileDisplay.groups.tags,
            [
                createToggleDefinition('showFileTags', {
                    name: strings.settings.items.showFileTags.name,
                    desc: strings.settings.items.showFileTags.desc
                }),
                createToggleDefinition('colorFileTags', {
                    name: strings.settings.items.colorFileTags.name,
                    desc: strings.settings.items.colorFileTags.desc,
                    visible: () => plugin.settings.showFileTags
                }),
                createToggleDefinition('prioritizeColoredFileTags', {
                    name: strings.settings.items.showColoredTagsFirst.name,
                    desc: strings.settings.items.showColoredTagsFirst.desc,
                    visible: () => plugin.settings.showFileTags && plugin.settings.colorFileTags
                }),
                createToggleDefinition('showFileTagAncestors', {
                    name: strings.settings.items.showFullTagPaths.name,
                    desc: strings.settings.items.showFullTagPaths.desc,
                    visible: () => plugin.settings.showFileTags
                }),
                createToggleDefinition('showFileTagsInCompactMode', {
                    name: strings.settings.items.showFileTagsInCompactMode.name,
                    desc: strings.settings.items.showFileTagsInCompactMode.desc,
                    visible: () => plugin.settings.showFileTags
                })
            ],
            { visible: () => plugin.settings.showTags }
        ),
        createGroupDefinition(strings.settings.pages.fileDisplay.groups.properties, [
            createToggleDefinition('showFileProperties', {
                name: strings.settings.items.showFileProperties.name,
                desc: strings.settings.items.showFileProperties.desc
            }),
            createToggleDefinition('colorFileProperties', {
                name: strings.settings.items.colorFileProperties.name,
                desc: strings.settings.items.colorFileProperties.desc,
                visible: () => plugin.settings.showFileProperties
            }),
            createToggleDefinition('prioritizeColoredFileProperties', {
                name: strings.settings.items.showColoredPropertiesFirst.name,
                desc: strings.settings.items.showColoredPropertiesFirst.desc,
                visible: () => plugin.settings.showFileProperties && plugin.settings.colorFileProperties
            }),
            createToggleDefinition('showFilePropertiesInCompactMode', {
                name: strings.settings.items.showFilePropertiesInCompactMode.name,
                desc: strings.settings.items.showFilePropertiesInCompactMode.desc,
                visible: () => plugin.settings.showFileProperties
            }),
            createToggleDefinition('showPropertiesOnSeparateRows', {
                name: strings.settings.items.showPropertiesOnSeparateRows.name,
                desc: strings.settings.items.showPropertiesOnSeparateRows.desc,
                visible: () => plugin.settings.showFileProperties
            }),
            createToggleDefinition('enablePropertyInternalLinks', {
                name: strings.settings.items.linkPropertyPillsToNotes.name,
                desc: strings.settings.items.linkPropertyPillsToNotes.desc,
                visible: () => plugin.settings.showFileProperties
            }),
            createToggleDefinition('enablePropertyExternalLinks', {
                name: strings.settings.items.linkPropertyPillsToUrls.name,
                desc: strings.settings.items.linkPropertyPillsToUrls.desc,
                visible: () => plugin.settings.showFileProperties
            })
        ]),
        createGroupDefinition(strings.settings.pages.fileDisplay.groups.tasks, [
            createToggleDefinition('showFileTaskProgress', {
                name: strings.settings.items.showFileTaskProgress.name,
                desc: strings.settings.items.showFileTaskProgress.desc
            }),
            createToggleDefinition('showFileTaskProgressCount', {
                name: strings.settings.items.showFileTaskProgressCount.name,
                desc: strings.settings.items.showFileTaskProgressCount.desc,
                visible: () => plugin.settings.showFileTaskProgress
            }),
            createToggleDefinition('showFileTaskProgressBar', {
                name: strings.settings.items.showFileTaskProgressBar.name,
                desc: strings.settings.items.showFileTaskProgressBar.desc,
                visible: () => plugin.settings.showFileTaskProgress
            }),
            createToggleDefinition('hideFileTaskProgressWhenComplete', {
                name: strings.settings.items.hideFileTaskProgressWhenComplete.name,
                desc: strings.settings.items.hideFileTaskProgressWhenComplete.desc,
                visible: () => plugin.settings.showFileTaskProgress
            }),
            createToggleDefinition('showFileBackgroundUnfinishedTask', {
                name: strings.settings.items.unfinishedTaskBackground.name,
                desc: strings.settings.items.unfinishedTaskBackground.desc
            }),
            createRenderDefinition({
                name: strings.settings.items.unfinishedTaskBackgroundColor.name,
                desc: strings.settings.items.unfinishedTaskBackgroundColor.desc,
                visible: () => plugin.settings.showFileBackgroundUnfinishedTask,
                render: setting =>
                    renderColorSetting(setting, context, {
                        name: strings.settings.items.unfinishedTaskBackgroundColor.name,
                        desc: strings.settings.items.unfinishedTaskBackgroundColor.desc,
                        access: {
                            getValue: () => plugin.settings.unfinishedTaskBackgroundColor,
                            setValue: value => {
                                plugin.settings.unfinishedTaskBackgroundColor = value;
                            },
                            defaultValue: DEFAULT_SETTINGS.unfinishedTaskBackgroundColor
                        },
                        darkAccess: {
                            getValue: () => plugin.settings.unfinishedTaskBackgroundColorDark,
                            setValue: value => {
                                plugin.settings.unfinishedTaskBackgroundColorDark = value;
                            },
                            defaultValue: DEFAULT_SETTINGS.unfinishedTaskBackgroundColorDark
                        }
                    })
            })
        ]),
        createGroupDefinition(strings.settings.pages.fileDisplay.groups.date, [
            createToggleDefinition('showFileDate', {
                name: strings.settings.items.showFileDate.name,
                desc: strings.settings.items.showFileDate.desc
            }),
            createDropdownDefinition('alphabeticalDateMode', {
                name: strings.settings.items.dateWhenSortingByName.name,
                desc: strings.settings.items.dateWhenSortingByName.desc,
                aliases: Object.values(strings.settings.items.dateWhenSortingByName.options),
                visible: () => plugin.settings.showFileDate,
                options: {
                    created: strings.settings.items.dateWhenSortingByName.options.created,
                    modified: strings.settings.items.dateWhenSortingByName.options.modified
                }
            })
        ]),
        createGroupDefinition(strings.settings.pages.fileDisplay.groups.parentFolder, [
            createToggleDefinition('showParentFolder', {
                name: strings.settings.items.showParentFolder.name,
                desc: strings.settings.items.showParentFolder.desc
            }),
            createToggleDefinition('showParentFolderFullPath', {
                name: strings.settings.items.showFolderPath.name,
                desc: strings.settings.items.showFolderPath.desc,
                visible: () => plugin.settings.showParentFolder
            }),
            createToggleDefinition('parentFolderClickRevealsFile', {
                name: strings.settings.items.parentFolderClickOpensFolder.name,
                desc: strings.settings.items.parentFolderClickOpensFolder.desc,
                visible: () => plugin.settings.showParentFolder
            }),
            createToggleDefinition('showParentFolderColor', {
                name: strings.settings.items.showParentFolderColor.name,
                desc: strings.settings.items.showParentFolderColor.desc,
                visible: () => plugin.settings.showParentFolder
            }),
            createToggleDefinition('showParentFolderIcon', {
                name: strings.settings.items.showParentFolderIcon.name,
                desc: strings.settings.items.showParentFolderIcon.desc,
                visible: () => plugin.settings.showParentFolder
            })
        ]),
        createGroupDefinition(strings.settings.pages.fileDisplay.groups.wordAndCharacterCount, [
            createDropdownDefinition('textCountDisplay', {
                name: strings.settings.items.textCountType.name,
                desc: strings.settings.items.textCountType.desc,
                aliases: Object.values(strings.settings.items.textCountType.options),
                options: {
                    none: strings.settings.items.textCountType.options.none,
                    words: strings.settings.items.textCountType.options.words,
                    characters: strings.settings.items.textCountType.options.characters,
                    both: strings.settings.items.textCountType.options.both
                }
            }),
            createDropdownDefinition('textCountPlacement', {
                name: strings.settings.items.textCountPlacement.name,
                desc: strings.settings.items.textCountPlacement.desc,
                aliases: Object.values(strings.settings.items.textCountPlacement.options),
                visible: () => plugin.settings.textCountDisplay !== 'none',
                options: {
                    title: strings.settings.items.textCountPlacement.options.title,
                    property: strings.settings.items.textCountPlacement.options.property
                }
            }),
            createDropdownDefinition('characterCountSpaces', {
                name: strings.settings.items.characterCountSpaces.name,
                desc: strings.settings.items.characterCountSpaces.desc,
                aliases: Object.values(strings.settings.items.characterCountSpaces.options),
                visible: () => showsCharacterCount(plugin.settings.textCountDisplay),
                options: {
                    include: strings.settings.items.characterCountSpaces.options.include,
                    exclude: strings.settings.items.characterCountSpaces.options.exclude
                }
            }),
            createRenderDefinition({
                name: strings.settings.items.wordCountTargetProperty.name,
                desc: strings.settings.items.wordCountTargetProperty.desc,
                aliases: [DEFAULT_SETTINGS.wordCountTargetProperty],
                visible: () => showsWordCount(plugin.settings.textCountDisplay),
                render: setting => {
                    context.configureDebouncedTextSetting(
                        setting,
                        strings.settings.items.wordCountTargetProperty.name,
                        strings.settings.items.wordCountTargetProperty.desc,
                        DEFAULT_SETTINGS.wordCountTargetProperty,
                        () => plugin.settings.wordCountTargetProperty,
                        value => {
                            plugin.settings.wordCountTargetProperty = value.trim();
                        }
                    );
                    setting.controlEl.addClass('nn-setting-wide-input');
                }
            }),
            createToggleDefinition('showWordCountPercentage', {
                name: strings.settings.items.showTargetPercentage.name,
                desc: strings.settings.items.showTargetPercentage.desc,
                visible: () => showsWordCount(plugin.settings.textCountDisplay)
            }),
            createRenderDefinition({
                name: strings.settings.items.textCountActiveNotice.title,
                searchable: false,
                visible: () => getMarkdownTextCountDependencies(context.app, plugin.settings).length > 0,
                render: setting => {
                    const refresh = () => renderTextCountActiveNotice(setting, context);
                    context.registerSettingsUpdateListener('notes-text-count-active-notice', refresh);
                    const unsubscribe = subscribeMarkdownWordCountConsumerChanges(context.app, () => {
                        refresh();
                        context.refreshSettingsDomState();
                    });
                    context.registerSettingsRenderCleanup(unsubscribe);
                    refresh();
                }
            })
        ])
    ];
}

function renderColorSetting(
    setting: Setting,
    context: SettingsTabContext,
    params: { name: string; desc: string; access: ColorSettingAccess; darkAccess?: ColorSettingAccess }
): void {
    attachColorSwatchSetting({
        app: context.app,
        plugin: context.plugin,
        setting,
        name: params.name,
        desc: params.desc,
        access: params.access,
        darkAccess: params.darkAccess,
        showRestoreDefault: true
    });
}

function getFileTypeIconPresetOptions(context: SettingsTabContext): Record<string, FileTypeIconPresetOption> {
    const options: Record<string, FileTypeIconPresetOption> = {
        none: {
            label: strings.settings.items.fileTypeIconPreset.options.builtIn,
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

function renderFileTypeIconPresetSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;
    const options = getFileTypeIconPresetOptions(context);

    setting.setName(strings.settings.items.fileTypeIconPreset.name).setDesc(strings.settings.items.fileTypeIconPreset.desc);
    const warningEl = setting.descEl.createDiv({
        cls: 'setting-item-description nn-setting-hidden nn-setting-warning'
    });

    const updateWarning = () => {
        const showWarning = isSelectedFileTypeIconPresetUnavailable(context);
        warningEl.setText(showWarning ? strings.settings.items.fileTypeIconPreset.notInstalledWarning : '');
        warningEl.toggleClass('nn-setting-hidden', !showWarning);
    };

    setting.addDropdown(dropdown => {
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
            updateWarning();
            await plugin.saveSettingsAndUpdate();
        });
    });

    updateWarning();
}

function renderIconMapSetting(
    setting: Setting,
    context: SettingsTabContext,
    options: {
        name: string;
        desc: string;
        placeholder: string;
        tooltip: string;
        mode: 'fileName' | 'fileType';
        getMap: () => Record<string, string>;
        setMap: (nextMap: Record<string, string>) => void;
        parse: (value: string) => IconMapParseResult;
        normalizeKey: (input: string) => string;
    }
): void {
    const { app, plugin } = context;

    context.configureDebouncedTextAreaSetting(
        setting,
        options.name,
        options.desc,
        options.placeholder,
        () => serializeIconMapRecord(options.getMap()),
        value => {
            const parsed = options.parse(value);
            options.setMap(parsed.map);
        },
        {
            rows: 3,
            validator: value => options.parse(value).invalidLines.length === 0
        }
    );

    setting.addExtraButton(button =>
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

                    const { FileIconRuleEditorModal } = await import('../../modals/FileIconRuleEditorModal');
                    const modal = new FileIconRuleEditorModal(app, {
                        title: options.name,
                        mode: options.mode,
                        initialMap: options.getMap(),
                        fallbackIconId: 'file',
                        metadataService,
                        normalizeKey: options.normalizeKey,
                        onSave: async nextMap => {
                            options.setMap(nextMap);

                            const textarea = setting.controlEl.querySelector('textarea');
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
    setting.controlEl.addClass('nn-setting-wide-input');
}

function renderFileNameRowsSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.titleRows.name)
        .setDesc(strings.settings.items.titleRows.desc)
        .addDropdown(dropdown =>
            dropdown
                .addOption('1', strings.settings.items.titleRows.options['1'])
                .addOption('2', strings.settings.items.titleRows.options['2'])
                .addOption('3', strings.settings.items.titleRows.options['3'])
                .setValue(plugin.settings.fileNameRows.toString())
                .onChange(async value => {
                    plugin.settings.fileNameRows = parseInt(value, 10);
                    await plugin.saveSettingsAndUpdate();
                })
        );
}

function renderPreviewRowsSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
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
}

function renderCommaSeparatedTextSetting(
    setting: Setting,
    context: SettingsTabContext,
    options: {
        name: string;
        desc: string;
        placeholder: string;
        getValue: () => string;
        setValue: (value: string) => void;
        onAfterUpdate?: () => void;
    }
): void {
    context.configureDebouncedTextSetting(
        setting,
        options.name,
        options.desc,
        options.placeholder,
        options.getValue,
        options.setValue,
        undefined,
        options.onAfterUpdate
    );
    setting.controlEl.addClass('nn-setting-wide-input');
}

function renderFeatureImageSizeSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.featureImageDisplaySize.name)
        .setDesc(strings.settings.items.featureImageDisplaySize.desc)
        .addDropdown(dropdown =>
            dropdown
                .addOption('64', strings.settings.items.featureImageDisplaySize.options['64'])
                .addOption('96', strings.settings.items.featureImageDisplaySize.options['96'])
                .addOption('128', strings.settings.items.featureImageDisplaySize.options['128'])
                .setValue(plugin.settings.featureImageSize)
                .onChange(value => {
                    if (!isFeatureImageSizeSetting(value)) {
                        return;
                    }
                    plugin.setFeatureImageSize(value);
                })
        );
    addSettingSyncModeToggle({ setting, plugin, settingId: 'featureImageSize' });
}

function renderFeatureImagePixelSizeSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.featureImagePixelSize.name)
        .setDesc(strings.settings.items.featureImagePixelSize.desc)
        .addDropdown(dropdown =>
            dropdown
                .addOption('256', strings.settings.items.featureImagePixelSize.options['256x144'])
                .addOption('384', strings.settings.items.featureImagePixelSize.options['384x216'])
                .addOption('512', strings.settings.items.featureImagePixelSize.options['512x288'])
                .setValue(plugin.settings.featureImagePixelSize)
                .onChange(value => {
                    if (!isFeatureImagePixelSizeSetting(value)) {
                        return;
                    }
                    plugin.setFeatureImagePixelSize(value);
                })
        );
    addSettingSyncModeToggle({ setting, plugin, settingId: 'featureImagePixelSize' });
}
