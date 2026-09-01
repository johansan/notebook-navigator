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

import { Platform, Setting, setIcon } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import { strings } from '../../i18n';
import { DEFAULT_SETTINGS } from '../defaultSettings';
import { createDropdownDefinition, createGroupDefinition, createRenderDefinition, createToggleDefinition } from '../nativeSettingControls';
import {
    createPropertyGroupingOption,
    getPropertyGroupingKey,
    getPropertyGroupingOrder,
    MANUAL_SORT_NEW_NOTE_PLACEMENT_OPTIONS,
    normalizeListNoteGroupingOption,
    PROPERTY_SORT_SECONDARY_OPTIONS,
    type ManualSortNewNotePlacement,
    type PropertySortSecondaryOption
} from '../types';
import type { NotebookNavigatorSettings } from '../types';
import type { SettingsTabContext } from './SettingsTabContext';
import { runAsyncAction } from '../../utils/async';
import { usesMobileChrome } from '../../utils/paneLayout';
import { addSettingSyncModeToggle } from '../syncModeToggle';
import { setElementVisible } from '../dependentSettings';
import { appendSettingText, getPlainSettingText } from '../settingText';
import { casefold } from '../../utils/recordUtils';
import { showNotice } from '../../utils/noticeUtils';
import {
    buildSortOption,
    getAvailablePropertySortKeys,
    getSortDirection,
    getSortDirectionForFieldChange,
    getSortField,
    isPropertySortOption,
    pruneUnavailablePropertySortOverrides,
    reconcileDefaultFolderSort,
    type SortDirection,
    type SortField
} from '../../utils/sortUtils';
import {
    getAvailablePropertyGroupKeys,
    pruneUnavailablePropertyGroupingOverrides,
    reconcileDefaultNoteGrouping
} from '../../utils/listGrouping';
import { getManualSortGroupHeaderPropertyKey, isValidManualSortPropertyKey, normalizeManualSortPropertyKey } from '../../utils/manualSort';
import { formatPixelSliderValue, renderSliderSetting } from './SliderSetting';
import { renderToolbarButtonsSetting } from './ToolbarButtonsSetting';

type QuickActionSettingKey =
    'quickActionRevealInFolder' | 'quickActionAddTag' | 'quickActionAddToShortcuts' | 'quickActionPinNote' | 'quickActionOpenInNewTab';

interface QuickActionToggleConfig {
    key: QuickActionSettingKey;
    icon: string;
    label: string;
}

/** Builds native 1.13 setting definitions for list pane settings. */
export function createListPaneSettingDefinitions(context: SettingsTabContext): SettingDefinitionItem[] {
    const { plugin } = context;
    const items: SettingDefinitionItem[] = [
        createGroupDefinition(undefined, [
            createRenderDefinition({
                name: strings.settings.items.toolbarButtons.name,
                desc: strings.settings.items.toolbarButtons.desc,
                aliases: [
                    strings.paneHeader.showFolders,
                    strings.paneHeader.search,
                    strings.commands.revealFile,
                    strings.settings.items.includeDescendantNotes.name,
                    strings.commands.collapseExpandListGroups,
                    strings.paneHeader.changeSortAndGroup,
                    strings.paneHeader.changeAppearance,
                    strings.paneHeader.newNote
                ],
                render: setting => {
                    renderToolbarButtonsSetting(
                        createSetting => {
                            createSetting(setting);
                            return setting;
                        },
                        plugin,
                        'list'
                    );
                }
            }),
            createRenderDefinition({
                name: strings.settings.items.includeDescendantNotes.name,
                desc: strings.settings.items.includeDescendantNotes.desc,
                render: setting => renderIncludeDescendantNotesSetting(setting, context)
            })
        ]),
        createGroupDefinition(strings.settings.pages.listPane.groups.sortAndGroup, [
            createRenderDefinition({
                name: strings.settings.items.defaultSortOrder.name,
                desc: strings.settings.items.defaultSortOrder.desc,
                aliases: [
                    ...Object.values(strings.settings.items.defaultSortOrder.fields),
                    ...Object.values(strings.settings.items.defaultSortOrder.directions),
                    ...Object.values(strings.settings.items.defaultSortOrder.dateDirections),
                    ...Object.values(strings.settings.items.defaultSortOrder.textDirections),
                    strings.settings.items.defaultSortDirection.name
                ],
                render: setting => renderDefaultFolderSortSetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.defaultGrouping.name,
                desc: getPlainSettingText(strings.settings.items.defaultGrouping.desc),
                aliases: [
                    ...Object.values(strings.settings.items.defaultGrouping.options),
                    ...Object.values(strings.settings.items.defaultGrouping.families),
                    ...Object.values(strings.settings.items.defaultSortOrder.directions),
                    strings.settings.items.defaultGroupingDirection.name,
                    strings.settings.items.defaultGroupingDirection.options.follow
                ],
                render: setting => renderNoteGroupingSetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.sortingProperties.name,
                desc: strings.settings.items.sortingProperties.desc,
                aliases: [strings.settings.items.sortingProperties.placeholder],
                render: setting => renderPropertySortKeySetting(setting, context)
            }),
            createDropdownDefinition('propertySortSecondary', {
                name: strings.settings.items.propertySecondarySort.name,
                desc: strings.settings.items.propertySecondarySort.desc,
                aliases: Object.values(strings.settings.items.propertySecondarySort.options),
                visible: () => plugin.settings.propertySortKey.trim().length > 0,
                options: createPropertySortSecondaryOptions()
            }),
            createRenderDefinition({
                name: strings.settings.items.groupingProperties.name,
                desc: strings.settings.items.groupingProperties.desc,
                aliases: [strings.settings.items.groupingProperties.placeholder],
                render: setting => renderPropertyGroupKeySetting(setting, context)
            }),
            createToggleDefinition('showCurrentFolderFilesAtBottom', {
                name: strings.settings.items.showCurrentFolderFilesAtBottom.name,
                desc: strings.settings.items.showCurrentFolderFilesAtBottom.desc
            }),
            createRenderDefinition({
                name: strings.settings.items.propertySortInstructions.intro,
                searchable: false,
                render: setting => renderInstructionSetting(setting, strings.settings.items.propertySortInstructions)
            })
        ]),
        createGroupDefinition(strings.settings.pages.listPane.groups.groupHeaders, [
            createToggleDefinition('stickyGroupHeaders', {
                name: strings.settings.items.stickyGroupHeaders.name,
                desc: strings.settings.items.stickyGroupHeaders.desc
            }),
            createToggleDefinition('showFolderGroupPaths', {
                name: strings.settings.items.showSubfolderPaths.name,
                desc: strings.settings.items.showSubfolderPaths.desc
            }),
            createToggleDefinition('showGroupHeaderItemCounts', {
                name: strings.settings.items.showGroupHeaderItemCounts.name,
                desc: strings.settings.items.showGroupHeaderItemCounts.desc
            }),
            createRenderDefinition({
                name: strings.settings.items.groupHeaderProperty.name,
                desc: strings.settings.items.groupHeaderProperty.desc,
                render: setting => renderManualSortGroupHeaderPropertySetting(setting, context)
            }),
            createRenderDefinition({
                name: strings.settings.items.groupHeadersInstructions.intro,
                searchable: false,
                render: setting => renderInstructionSetting(setting, strings.settings.items.groupHeadersInstructions)
            })
        ]),
        createGroupDefinition(strings.settings.pages.listPane.groups.manualSort, [
            createRenderDefinition({
                name: strings.settings.items.manualSortProperty.name,
                desc: strings.settings.items.manualSortProperty.desc,
                aliases: [DEFAULT_SETTINGS.manualSortPropertyKey],
                render: setting => renderManualSortPropertyKeySetting(setting, context)
            }),
            createDropdownDefinition('manualSortNewNotePlacement', {
                name: strings.settings.items.manualSortNewNotePlacement.name,
                desc: strings.settings.items.manualSortNewNotePlacement.desc,
                aliases: Object.values(strings.settings.items.manualSortNewNotePlacement.options),
                options: createManualSortNewNotePlacementOptions()
            }),
            createToggleDefinition('confirmBeforeManualSort', {
                name: strings.settings.items.confirmBeforeManualSort.name,
                desc: strings.settings.items.confirmBeforeManualSort.desc
            }),
            createRenderDefinition({
                name: strings.settings.items.manualSortInstructions.intro,
                searchable: false,
                render: setting => renderInstructionSetting(setting, strings.settings.items.manualSortInstructions)
            })
        ]),
        createGroupDefinition(strings.settings.pages.listPane.groups.pinnedNotes, [
            createToggleDefinition('filterPinnedByFolder', {
                name: strings.settings.items.filterPinnedNotesByFolder.name,
                desc: strings.settings.items.filterPinnedNotesByFolder.desc
            })
        ]),
        createListAppearanceDefinitionGroup(context),
        createGroupDefinition(strings.settings.pages.listPane.groups.behavior, [
            createToggleDefinition('revealFileOnListChanges', {
                name: strings.settings.items.scrollToSelectedFileOnListChanges.name,
                desc: strings.settings.items.scrollToSelectedFileOnListChanges.desc
            }),
            ...(Platform.isMobile
                ? []
                : [
                      createRenderDefinition({
                          name: strings.settings.items.showQuickActions.name,
                          desc: strings.settings.items.showQuickActions.desc,
                          aliases: [
                              strings.contextMenu.file.revealInFolder,
                              strings.contextMenu.file.addTag,
                              strings.shortcuts.add,
                              strings.contextMenu.file.pinNote,
                              strings.contextMenu.file.openInNewTab
                          ],
                          render: setting => renderQuickActionsSetting(setting, context)
                      })
                  ])
        ]),
        createGroupDefinition(strings.settings.pages.listPane.groups.drawingPreviews, [
            createToggleDefinition('hideDrawingPreviewImages', {
                name: strings.settings.items.hideExportedPreviewImages.name,
                desc: strings.settings.items.hideExportedPreviewImages.desc
            }),
            createRenderDefinition({
                name: strings.settings.items.drawingIntegrationInfo.intro,
                searchable: false,
                render: setting => renderInstructionSetting(setting, strings.settings.items.drawingIntegrationInfo)
            })
        ])
    ];

    return items;
}

function createListAppearanceDefinitionGroup(context: SettingsTabContext): SettingDefinitionItem {
    const items: NonNullable<ReturnType<typeof createGroupDefinition>['items']> = [];

    // The list pane title only renders with the desktop chrome (desktop and tablets)
    if (!usesMobileChrome()) {
        items.push(
            createDropdownDefinition('listPaneTitle', {
                name: strings.settings.items.listPaneTitle.name,
                desc: strings.settings.items.listPaneTitle.desc,
                aliases: Object.values(strings.settings.items.listPaneTitle.options),
                options: {
                    header: strings.settings.items.listPaneTitle.options.header,
                    list: strings.settings.items.listPaneTitle.options.listPane,
                    hidden: strings.settings.items.listPaneTitle.options.hidden
                }
            })
        );
    }

    items.push(
        createDropdownDefinition('defaultListMode', {
            name: strings.settings.items.defaultListMode.name,
            desc: strings.settings.items.defaultListMode.desc,
            aliases: Object.values(strings.settings.items.defaultListMode.options),
            options: {
                standard: strings.settings.items.defaultListMode.options.standard,
                compact: strings.settings.items.defaultListMode.options.compact
            }
        }),
        createRenderDefinition({
            name: strings.settings.items.compactItemHeight.name,
            desc: strings.settings.items.compactItemHeight.desc,
            aliases: [strings.settings.items.compactItemHeight.resetTooltip],
            render: setting => renderCompactItemHeightSetting(setting, context)
        }),
        createRenderDefinition({
            name: strings.settings.items.compactItemHeightScaleText.name,
            desc: strings.settings.items.compactItemHeightScaleText.desc,
            render: setting => renderCompactItemHeightScaleTextSetting(setting, context)
        }),
        createToggleDefinition('showSelectedNavigationPills', {
            name: strings.settings.items.alwaysShowAllTagAndPropertyPills.name,
            desc: strings.settings.items.alwaysShowAllTagAndPropertyPills.desc
        })
    );

    return createGroupDefinition(strings.settings.pages.listPane.groups.appearance, items);
}

const BIDI_ISOLATE_START = '\u2068'; // First Strong Isolate
const BIDI_ISOLATE_END = '\u2069'; // Pop Directional Isolate

function isolateBidiText(value: string): string {
    // Keeps user-authored LTR property keys from reordering quotes and punctuation inside RTL labels.
    return `${BIDI_ISOLATE_START}${value}${BIDI_ISOLATE_END}`;
}

function getPropertyDropdownOptionLabel(propertyKey: string): string {
    return `${strings.settings.items.defaultSortOrder.fields.property} \u2018${isolateBidiText(propertyKey)}\u2019`;
}

/**
 * Renders the default sort order dropdown with the built-in sort fields plus one entry per
 * configured sorting property. Changing the field selects newest-first for dates and ascending for
 * title, file name, and property fields; the direction dropdown can then adjust it independently. A
 * property entry writes both defaultFolderSort and defaultFolderSortPropertyKey; built-in entries clear the property key.
 * Entries rebuild on every settings update so edits to the configured property list are
 * reflected while the tab stays open.
 */
export function renderDefaultFolderSortSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    // Field changes rebuild the sibling direction dropdown immediately; waiting for the settings
    // update listener would leave the row briefly showing direction labels of the previous field.
    let refreshDirectionControl: () => void = () => {};

    setting
        .setName(strings.settings.items.defaultSortOrder.name)
        .setDesc(strings.settings.items.defaultSortOrder.desc)
        .addDropdown(dropdown => {
            dropdown.selectEl.setAttribute('aria-label', strings.settings.items.defaultSortOrder.name);
            // Maps property entry ids to their key. Index-based ids mean decoding never parses the
            // property key out of the id (keys may contain any characters, including separators).
            let propertySelections = new Map<string, string>();

            const getSelectedId = (): string => {
                const currentOption = plugin.settings.defaultFolderSort;
                if (!isPropertySortOption(currentOption)) {
                    return getSortField(currentOption);
                }

                const currentPropertyKey = casefold(plugin.settings.defaultFolderSortPropertyKey);
                for (const [id, propertyKey] of propertySelections) {
                    if (casefold(propertyKey) === currentPropertyKey) {
                        return id;
                    }
                }
                // Reconciliation resets unavailable property defaults, so a missing entry only occurs
                // transiently; display the stock default rather than an empty selection.
                return getSortField(DEFAULT_SETTINGS.defaultFolderSort);
            };

            const rebuildOptions = (): void => {
                propertySelections = new Map();
                dropdown.selectEl.empty();
                // Persisted sort fields intentionally differ from some localization aliases, so
                // indexing the translated record with the stored value would omit those labels.
                const fieldLabels: Record<Exclude<SortField, 'property'>, string> = {
                    modified: strings.settings.items.defaultSortOrder.fields.dateEdited,
                    created: strings.settings.items.defaultSortOrder.fields.dateCreated,
                    title: strings.settings.items.defaultSortOrder.fields.title,
                    filename: strings.settings.items.defaultSortOrder.fields.fileName
                };
                (['modified', 'created', 'title', 'filename'] as const).forEach(field => {
                    dropdown.addOption(field, fieldLabels[field]);
                });
                getAvailablePropertySortKeys(plugin.settings).forEach((propertyKey, index) => {
                    const id = `property:${index}`;
                    propertySelections.set(id, propertyKey);
                    dropdown.addOption(id, getPropertyDropdownOptionLabel(propertyKey));
                });
                dropdown.setValue(getSelectedId());
            };

            dropdown.onChange(value => {
                const propertyKey = propertySelections.get(value);
                let field: SortField;
                let nextPropertyKey: string;
                if (propertyKey !== undefined) {
                    field = 'property';
                    nextPropertyKey = propertyKey;
                } else {
                    if (value !== 'modified' && value !== 'created' && value !== 'title' && value !== 'filename') {
                        return;
                    }
                    field = value;
                    nextPropertyKey = '';
                }
                // A field selection starts with the direction that matches its value type. Without
                // this reset, switching from a date to a text field can unexpectedly put Z on top.
                const option = buildSortOption(field, getSortDirectionForFieldChange(field));
                if (plugin.settings.defaultFolderSort === option && plugin.settings.defaultFolderSortPropertyKey === nextPropertyKey) {
                    return;
                }
                plugin.settings.defaultFolderSort = option;
                plugin.settings.defaultFolderSortPropertyKey = nextPropertyKey;
                refreshDirectionControl();
                runAsyncAction(() => plugin.saveSettingsAndUpdate());
            });

            rebuildOptions();
            context.registerSettingsUpdateListener('list-pane-default-folder-sort', rebuildOptions);
        })
        .addDropdown(dropdown => {
            // Direction dropdown sharing the row with the field dropdown. The option labels adapt
            // to the selected field: date fields use newest/oldest phrasing, text fields use A/Z
            // phrasing, and property fields use generic ascending/descending, so the concrete
            // meaning of each direction stays visible without baking directions into the entries.
            dropdown.selectEl.setAttribute('aria-label', strings.settings.items.defaultSortDirection.name);

            const getDirectionLabels = (): Record<SortDirection, string> => {
                const field = getSortField(plugin.settings.defaultFolderSort);
                if (field === 'modified' || field === 'created') {
                    return {
                        asc: strings.settings.items.defaultSortOrder.dateDirections.oldestOnTop,
                        desc: strings.settings.items.defaultSortOrder.dateDirections.newestOnTop
                    };
                }
                if (field === 'property') {
                    return strings.settings.items.defaultSortOrder.directions;
                }
                return {
                    asc: strings.settings.items.defaultSortOrder.textDirections.aOnTop,
                    desc: strings.settings.items.defaultSortOrder.textDirections.zOnTop
                };
            };

            const rebuildOptions = (): void => {
                const labels = getDirectionLabels();
                const field = getSortField(plugin.settings.defaultFolderSort);
                dropdown.selectEl.empty();
                // Date fields list newest first, matching the historical order of the combined
                // sort entries; other fields list ascending first.
                const directionOrder: SortDirection[] = field === 'modified' || field === 'created' ? ['desc', 'asc'] : ['asc', 'desc'];
                directionOrder.forEach(direction => {
                    dropdown.addOption(direction, labels[direction]);
                });
                dropdown.setValue(getSortDirection(plugin.settings.defaultFolderSort));
            };

            dropdown.onChange(value => {
                if (value !== 'asc' && value !== 'desc') {
                    return;
                }
                const option = buildSortOption(getSortField(plugin.settings.defaultFolderSort), value);
                if (plugin.settings.defaultFolderSort === option) {
                    return;
                }
                plugin.settings.defaultFolderSort = option;
                runAsyncAction(() => plugin.saveSettingsAndUpdate());
            });

            rebuildOptions();
            refreshDirectionControl = rebuildOptions;
            context.registerSettingsUpdateListener('list-pane-default-sort-direction', rebuildOptions);
        });
}

/**
 * Renders the default grouping row: a mode dropdown with the base grouping modes plus one entry
 * per configured grouping property, and a group order dropdown beside it that only shows for
 * property groupings. Property entries carry no group order in the mode dropdown; the current
 * default's order is preserved (or starts at follow-sort). Property entries store the same
 * encodings used by per-view grouping overrides. Entries rebuild on every settings update so
 * edits to the configured property list are reflected while the tab stays open.
 */
export function renderNoteGroupingSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    // Mode changes refresh the sibling group order dropdown immediately; waiting for the settings
    // update listener would leave the order control briefly shown or hidden for the wrong mode.
    let refreshOrderControl: () => void = () => {};

    setting.setName(strings.settings.items.defaultGrouping.name).setDesc('');
    setting.descEl.empty();
    appendSettingText(setting.descEl, strings.settings.items.defaultGrouping.desc);

    setting
        .addDropdown(dropdown => {
            dropdown.selectEl.setAttribute('aria-label', strings.settings.items.defaultGrouping.name);
            // Property entry ids use the follow-sort encoding regardless of the stored order;
            // the order lives in the group order dropdown in the same row.
            const getSelectedValue = (): string => {
                const grouping = plugin.settings.noteGrouping;
                const propertyKey = getPropertyGroupingKey(grouping);
                if (propertyKey === null) {
                    return grouping;
                }

                // Entries are generated from the configured list, so match the stored key
                // case-insensitively against it to select the generated entry.
                const matchedKey = getAvailablePropertyGroupKeys(plugin.settings).find(
                    availableKey => casefold(availableKey) === casefold(propertyKey)
                );
                // Reconciliation resets unavailable property groupings, so a missing entry only occurs
                // transiently; display the stock default rather than an empty selection.
                return matchedKey ? createPropertyGroupingOption(matchedKey, 'follow') : DEFAULT_SETTINGS.noteGrouping;
            };

            const rebuildOptions = (): void => {
                dropdown.selectEl.empty();
                // None disables headers, while Custom and Date annotate the sorted list without
                // changing its order. Folder and property groups partition the list and order the
                // groups on their own.
                const headersGroupEl = dropdown.selectEl.createEl('optgroup', {
                    attr: { label: strings.settings.items.defaultGrouping.families.headers }
                });
                (['none', 'custom', 'date'] as const).forEach(option => {
                    headersGroupEl.createEl('option', { value: option, text: strings.settings.items.defaultGrouping.options[option] });
                });
                const groupsGroupEl = dropdown.selectEl.createEl('optgroup', {
                    attr: { label: strings.settings.items.defaultGrouping.families.groups }
                });
                groupsGroupEl.createEl('option', { value: 'folder', text: strings.settings.items.defaultGrouping.options.folder });
                getAvailablePropertyGroupKeys(plugin.settings).forEach(propertyKey => {
                    groupsGroupEl.createEl('option', {
                        value: createPropertyGroupingOption(propertyKey, 'follow'),
                        text: getPropertyDropdownOptionLabel(propertyKey)
                    });
                });
                dropdown.setValue(getSelectedValue());
            };

            dropdown.onChange(value => {
                const normalized = normalizeListNoteGroupingOption(value);
                if (!normalized) {
                    return;
                }
                // Switching to another property keeps the current group order; coming from a base
                // mode the order starts at follow-sort.
                const propertyKey = getPropertyGroupingKey(normalized);
                const next =
                    propertyKey === null
                        ? normalized
                        : createPropertyGroupingOption(propertyKey, getPropertyGroupingOrder(plugin.settings.noteGrouping) ?? 'follow');
                if (plugin.settings.noteGrouping === next) {
                    return;
                }
                plugin.settings.noteGrouping = next;
                refreshOrderControl();
                runAsyncAction(() => plugin.saveSettingsAndUpdate());
            });

            rebuildOptions();
            context.registerSettingsUpdateListener('list-pane-note-grouping', rebuildOptions);
        })
        .addDropdown(dropdown => {
            // Group order dropdown sharing the row with the mode dropdown. Groups are arranged by
            // their property value in this order; follow-sort borrows the direction from the sort
            // order. Base modes have no group order at all — None, Custom, and Date never reorder and
            // Folder has its own fixed ordering — so the control hides rather than showing a
            // disabled value that would state something false.
            dropdown.selectEl.setAttribute('aria-label', strings.settings.items.defaultGroupingDirection.name);
            (['follow', 'asc', 'desc'] as const).forEach(order => {
                dropdown.addOption(
                    order,
                    order === 'follow'
                        ? strings.settings.items.defaultGroupingDirection.options.follow
                        : strings.settings.items.defaultSortOrder.directions[order]
                );
            });

            const refreshControlState = (): void => {
                const propertyKey = getPropertyGroupingKey(plugin.settings.noteGrouping);
                dropdown.setValue(propertyKey === null ? 'follow' : (getPropertyGroupingOrder(plugin.settings.noteGrouping) ?? 'follow'));
                setElementVisible(dropdown.selectEl, propertyKey !== null);
            };

            dropdown.onChange(value => {
                if (value !== 'follow' && value !== 'asc' && value !== 'desc') {
                    return;
                }
                const propertyKey = getPropertyGroupingKey(plugin.settings.noteGrouping);
                // The control is hidden for base grouping modes, but the guard keeps a stale
                // change event from rewriting a base mode into a property grouping.
                if (propertyKey === null) {
                    return;
                }
                const next = createPropertyGroupingOption(propertyKey, value);
                if (plugin.settings.noteGrouping === next) {
                    return;
                }
                plugin.settings.noteGrouping = next;
                runAsyncAction(() => plugin.saveSettingsAndUpdate());
            });

            refreshControlState();
            refreshOrderControl = refreshControlState;
            context.registerSettingsUpdateListener('list-pane-default-grouping-direction', refreshControlState);
        });
}

/**
 * Renders the grouping properties input. Commits prune per-view grouping overrides and reconcile
 * the global defaults so removed properties never stay active anywhere.
 */
export function renderPropertyGroupKeySetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.groupingProperties.name)
        .setDesc(strings.settings.items.groupingProperties.desc)
        .addText(text => {
            const commitPropertyGroupKey = async (): Promise<void> => {
                const value = text.getValue();
                if (plugin.settings.propertyGroupKey === value) {
                    return;
                }
                plugin.settings.propertyGroupKey = value;
                pruneUnavailablePropertyGroupingOverrides(plugin.settings);
                reconcileDefaultsAfterPropertyKeysEdit(plugin.settings);
                await plugin.saveSettingsAndUpdate();
            };

            text.inputEl.addEventListener('blur', () => {
                runAsyncAction(commitPropertyGroupKey);
            });
            text.inputEl.addEventListener('keydown', event => {
                if (event.key !== 'Enter') {
                    return;
                }
                event.preventDefault();
                runAsyncAction(commitPropertyGroupKey);
                text.inputEl.blur();
            });

            return text.setPlaceholder(strings.settings.items.groupingProperties.placeholder).setValue(plugin.settings.propertyGroupKey);
        });
}

/**
 * Reconciles the global sort and grouping defaults after the configured sorting or grouping
 * properties changed through a settings-tab edit, announcing a reset with a notice. Load and
 * sync paths reconcile silently in the settings controller instead.
 */
export function reconcileDefaultsAfterPropertyKeysEdit(settings: NotebookNavigatorSettings): void {
    const sortResult = reconcileDefaultFolderSort(settings);
    const groupingResult = reconcileDefaultNoteGrouping(settings);
    const notices = strings.settings.items.sortingProperties.defaultsResetNotices;
    if (sortResult.reset && groupingResult.reset) {
        showNotice(notices.both);
    } else if (sortResult.reset) {
        showNotice(notices.sort);
    } else if (groupingResult.reset) {
        showNotice(notices.grouping);
    }
}

function createPropertySortSecondaryOptions(): Record<string, string> {
    const options: Record<string, string> = {};
    PROPERTY_SORT_SECONDARY_OPTIONS.forEach(option => {
        options[option] = getPropertySecondarySortOptionLabel(option);
    });
    return options;
}

function createManualSortNewNotePlacementOptions(): Record<string, string> {
    const options: Record<string, string> = {};
    MANUAL_SORT_NEW_NOTE_PLACEMENT_OPTIONS.forEach(option => {
        options[option] = getManualSortNewNotePlacementOptionLabel(option);
    });
    return options;
}

/** Maps persisted property-sort values to their semantic localization aliases. */
export function getPropertySecondarySortOptionLabel(option: PropertySortSecondaryOption): string {
    switch (option) {
        case 'title':
            return strings.settings.items.propertySecondarySort.options.title;
        case 'filename':
            return strings.settings.items.propertySecondarySort.options.fileName;
        case 'created':
            return strings.settings.items.propertySecondarySort.options.dateCreated;
        case 'modified':
            return strings.settings.items.propertySecondarySort.options.dateEdited;
    }
}

/** Maps persisted manual-sort placement values to their semantic localization aliases. */
export function getManualSortNewNotePlacementOptionLabel(option: ManualSortNewNotePlacement): string {
    switch (option) {
        case 'top':
            return strings.settings.items.manualSortNewNotePlacement.options.top;
        case 'bottom':
            return strings.settings.items.manualSortNewNotePlacement.options.bottom;
        case 'below-selected-note':
            return strings.settings.items.manualSortNewNotePlacement.options.belowSelectedNote;
        case 'unsorted':
            return strings.settings.items.manualSortNewNotePlacement.options.unsorted;
    }
}

function renderIncludeDescendantNotesSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.includeDescendantNotes.name)
        .setDesc(strings.settings.items.includeDescendantNotes.desc)
        .addToggle(toggle => {
            const preferences = plugin.getUXPreferences();
            toggle.setValue(preferences.includeDescendantNotes).onChange(value => {
                plugin.setIncludeDescendantNotes(value);
            });
        });

    addSettingSyncModeToggle({ setting, plugin, settingId: 'includeDescendantNotes' });
}

function renderCompactItemHeightSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    renderSliderSetting(setting, {
        name: strings.settings.items.compactItemHeight.name,
        desc: strings.settings.items.compactItemHeight.desc,
        value: plugin.settings.compactItemHeight,
        defaultValue: DEFAULT_SETTINGS.compactItemHeight,
        min: 20,
        max: 28,
        step: 1,
        resetTooltip: strings.settings.items.compactItemHeight.resetTooltip,
        formatValue: formatPixelSliderValue,
        onChange: value => {
            plugin.setCompactItemHeight(value);
        }
    });

    addSettingSyncModeToggle({ setting, plugin, settingId: 'compactItemHeight' });
}

function renderCompactItemHeightScaleTextSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.compactItemHeightScaleText.name)
        .setDesc(strings.settings.items.compactItemHeightScaleText.desc)
        .addToggle(toggle =>
            toggle.setValue(plugin.settings.compactItemHeightScaleText).onChange(value => {
                plugin.setCompactItemHeightScaleText(value);
            })
        );

    addSettingSyncModeToggle({ setting, plugin, settingId: 'compactItemHeightScaleText' });
}

function renderManualSortGroupHeaderPropertySetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.groupHeaderProperty.name)
        .setDesc(strings.settings.items.groupHeaderProperty.desc)
        .addText(text => {
            const commitGroupHeaderProperty = async (): Promise<void> => {
                const value = text.getValue().trim();
                if (
                    value.length > 0 &&
                    getManualSortGroupHeaderPropertyKey({
                        manualSortGroupHeaderProperty: value,
                        manualSortPropertyKey: plugin.settings.manualSortPropertyKey
                    }) === null
                ) {
                    text.setValue(plugin.settings.manualSortGroupHeaderProperty);
                    return;
                }
                text.setValue(value);
                if (plugin.settings.manualSortGroupHeaderProperty === value) {
                    return;
                }
                plugin.settings.manualSortGroupHeaderProperty = value;
                await plugin.saveSettingsAndUpdate();
            };

            text.inputEl.addEventListener('blur', () => {
                runAsyncAction(commitGroupHeaderProperty);
            });
            text.inputEl.addEventListener('keydown', event => {
                if (event.key !== 'Enter') {
                    return;
                }
                event.preventDefault();
                runAsyncAction(commitGroupHeaderProperty);
                text.inputEl.blur();
            });

            return text
                .setPlaceholder(DEFAULT_SETTINGS.manualSortGroupHeaderProperty)
                .setValue(plugin.settings.manualSortGroupHeaderProperty);
        });
}

function renderPropertySortKeySetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.sortingProperties.name)
        .setDesc(strings.settings.items.sortingProperties.desc)
        .addText(text => {
            const commitPropertySortKey = async (): Promise<void> => {
                const value = text.getValue();
                if (plugin.settings.propertySortKey === value) {
                    return;
                }
                plugin.settings.propertySortKey = value;
                pruneUnavailablePropertySortOverrides(plugin.settings);
                reconcileDefaultsAfterPropertyKeysEdit(plugin.settings);
                context.refreshSettingsDomState();
                await plugin.saveSettingsAndUpdate();
            };

            text.inputEl.addEventListener('blur', () => {
                runAsyncAction(commitPropertySortKey);
            });
            text.inputEl.addEventListener('keydown', event => {
                if (event.key !== 'Enter') {
                    return;
                }
                event.preventDefault();
                runAsyncAction(commitPropertySortKey);
                text.inputEl.blur();
            });

            return text.setPlaceholder(strings.settings.items.sortingProperties.placeholder).setValue(plugin.settings.propertySortKey);
        });
}

function renderManualSortPropertyKeySetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting
        .setName(strings.settings.items.manualSortProperty.name)
        .setDesc(strings.settings.items.manualSortProperty.desc)
        .addText(text => {
            const commitManualSortPropertyKey = async (): Promise<void> => {
                const value = normalizeManualSortPropertyKey(text.getValue());
                if (!isValidManualSortPropertyKey(value)) {
                    text.setValue(plugin.settings.manualSortPropertyKey);
                    return;
                }
                text.setValue(value);
                if (plugin.settings.manualSortPropertyKey === value) {
                    return;
                }
                plugin.settings.manualSortPropertyKey = value;
                pruneUnavailablePropertySortOverrides(plugin.settings);
                pruneUnavailablePropertyGroupingOverrides(plugin.settings);
                reconcileDefaultsAfterPropertyKeysEdit(plugin.settings);
                await plugin.saveSettingsAndUpdate();
            };

            text.inputEl.addEventListener('blur', () => {
                runAsyncAction(commitManualSortPropertyKey);
            });
            text.inputEl.addEventListener('keydown', event => {
                if (event.key !== 'Enter') {
                    return;
                }
                event.preventDefault();
                runAsyncAction(commitManualSortPropertyKey);
                text.inputEl.blur();
            });

            return text.setPlaceholder(DEFAULT_SETTINGS.manualSortPropertyKey).setValue(plugin.settings.manualSortPropertyKey);
        });
}

function renderInstructionSetting(setting: Setting, info: { intro: string; items: string[] }): void {
    setting.setName('').setDesc('');
    setting.settingEl.addClass('nn-setting-info-container');
    setting.settingEl.addClass('nn-setting-info-list');
    setting.descEl.empty();
    setting.descEl.createDiv({ text: info.intro });
    const listEl = setting.descEl.createEl('ol');
    info.items.forEach(item => {
        const itemEl = listEl.createEl('li');
        appendSettingText(itemEl, item);
    });
}

function renderQuickActionsSetting(setting: Setting, context: SettingsTabContext): void {
    const { plugin } = context;

    setting.setName(strings.settings.items.showQuickActions.name).setDesc(strings.settings.items.showQuickActions.desc);
    setting.controlEl.addClass('nn-quick-actions-control');

    const quickActionsButtonsEl = setting.controlEl.createDiv({
        cls: ['nn-toolbar-visibility-grid', 'nn-quick-actions-buttons']
    });

    const updateButtonsDisabledState = (enabled: boolean) => {
        quickActionsButtonsEl.classList.toggle('is-disabled', !enabled);
        quickActionsButtonsEl.querySelectorAll('button').forEach(button => {
            button.toggleAttribute('disabled', !enabled);
        });
    };

    const quickActionButtons: QuickActionToggleConfig[] = [
        { key: 'quickActionRevealInFolder', icon: 'lucide-folder-search', label: strings.contextMenu.file.revealInFolder },
        { key: 'quickActionAddTag', icon: 'lucide-tag', label: strings.contextMenu.file.addTag },
        { key: 'quickActionAddToShortcuts', icon: 'lucide-star', label: strings.shortcuts.add },
        { key: 'quickActionPinNote', icon: 'lucide-pin', label: strings.contextMenu.file.pinNote },
        { key: 'quickActionOpenInNewTab', icon: 'lucide-file-plus', label: strings.contextMenu.file.openInNewTab }
    ];

    quickActionButtons.forEach(buttonConfig => {
        const buttonEl = quickActionsButtonsEl.createEl('button', {
            cls: ['nn-toolbar-visibility-toggle', 'nn-mobile-toolbar-button'],
            attr: { type: 'button' }
        });
        buttonEl.setAttr('aria-label', buttonConfig.label);
        buttonEl.setAttr('title', buttonConfig.label);

        const iconEl = buttonEl.createSpan({ cls: 'nn-toolbar-visibility-icon' });
        setIcon(iconEl, buttonConfig.icon);

        const applyState = () => {
            const isEnabled = Boolean(plugin.settings[buttonConfig.key]);
            buttonEl.classList.toggle('is-active', isEnabled);
            buttonEl.classList.toggle('nn-mobile-toolbar-button-active', isEnabled);
            buttonEl.setAttr('aria-pressed', isEnabled ? 'true' : 'false');
        };

        buttonEl.addEventListener('click', () => {
            plugin.settings[buttonConfig.key] = !plugin.settings[buttonConfig.key];
            applyState();
            runAsyncAction(async () => {
                await plugin.saveSettingsAndUpdate();
            });
        });

        applyState();
    });

    setting.addToggle(toggle => {
        toggle.setValue(plugin.settings.showQuickActions).onChange(async value => {
            plugin.settings.showQuickActions = value;
            updateButtonsDisabledState(value);
            await plugin.saveSettingsAndUpdate();
        });
        toggle.toggleEl.addClass('nn-quick-actions-master-toggle');
    });

    updateButtonsDisabledState(plugin.settings.showQuickActions);
}
