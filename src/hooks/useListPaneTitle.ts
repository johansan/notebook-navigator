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

import { useEffect, useMemo, useState } from 'react';
import { TAbstractFile, TFile } from 'obsidian';
import { useServices, useMetadataService } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import { useSelectionState } from '../context/SelectionContext';
import { useFileCache } from '../context/StorageContext';
import { useExpansionState } from '../context/ExpansionContext';
import { strings } from '../i18n';
import { getDBInstance } from '../storage/fileOperations';
import { ItemType, PROPERTIES_ROOT_VIRTUAL_FOLDER_ID, TAGGED_TAG_ID, UNTAGGED_TAG_ID } from '../types';
import { FOLDER_NOTE_TYPE_EXTENSIONS } from '../types/folderNote';
import { hasSubfolders } from '../utils/fileFilters';
import { resolveFolderNoteName } from '../utils/folderNoteName';
import { EXCALIDRAW_BASENAME_SUFFIX } from '../utils/fileNameUtils';
import { getVirtualTagCollection, VIRTUAL_TAG_COLLECTION_IDS } from '../utils/virtualTagCollections';
import { getActiveHiddenFolders } from '../utils/vaultProfiles';
import { resolveUXIcon } from '../utils/uxIcons';
import { buildPropertyKeyNodeId, parsePropertyNodeId, type PropertySelectionNodeId } from '../utils/propertyTree';
import { resolveFolderDisplayName, resolveFolderDisplayPathSegments } from '../utils/folderDisplayName';
import { resolveRootFolderNoteSourceName } from '../utils/folderNoteLookup';
import { isFolderEffectivelyExpanded } from '../utils/navigationExpansion';

const FOLDER_NOTE_EXTENSIONS = Object.values(FOLDER_NOTE_TYPE_EXTENSIONS);

function addFolderNoteCandidatePaths(
    target: Set<string>,
    folderPath: string,
    folderName: string,
    settings: {
        folderNoteNamePattern: string;
    }
): void {
    const expectedName = resolveFolderNoteName(folderName, settings);
    if (!expectedName || expectedName.includes('/')) {
        return;
    }

    const prefix = folderPath === '/' ? '' : `${folderPath}/`;
    for (const extension of FOLDER_NOTE_EXTENSIONS) {
        target.add(`${prefix}${expectedName}.${extension}`);
    }

    target.add(`${prefix}${expectedName}${EXCALIDRAW_BASENAME_SUFFIX}.md`);
}

export type BreadcrumbSegment =
    | {
          label: string;
          targetType: 'none';
          isLast: boolean;
          targetPath?: undefined;
      }
    | {
          label: string;
          targetType: 'folder' | 'tag';
          targetPath: string;
          isLast: boolean;
      }
    | {
          label: string;
          targetType: 'property';
          targetPath: PropertySelectionNodeId;
          isLast: boolean;
      };

interface UseListPaneTitleResult {
    desktopTitle: string;
    breadcrumbSegments: BreadcrumbSegment[];
    iconName: string;
    showIcon: boolean;
    selectionType: ItemType | null;
}

interface ListPaneTitleMemoResult {
    desktopTitle: string;
    breadcrumbSegments: BreadcrumbSegment[];
}

export function useListPaneTitle(): UseListPaneTitleResult {
    const { app } = useServices();
    const settings = useSettingsState();
    const uxPreferences = useUXPreferences();
    const showHiddenItems = uxPreferences.showHiddenItems;
    // Memoized list of folders hidden by the active vault profile
    const hiddenFolders = useMemo(() => getActiveHiddenFolders(settings), [settings]);
    const selectionState = useSelectionState();
    const selectedFolderPath = selectionState.selectedFolder?.path ?? null;
    const selectedFolderName = selectionState.selectedFolder?.name ?? null;
    const { getTagDisplayPath, getPropertyTree } = useFileCache();
    const expansionState = useExpansionState();
    const metadataService = useMetadataService();
    const [folderNoteVersion, setFolderNoteVersion] = useState(0);

    const watchedFolderNotePaths = useMemo(() => {
        if (!settings.enableFolderNotes || selectionState.selectionType !== ItemType.FOLDER || !selectedFolderPath) {
            return new Set<string>();
        }

        const folderNoteNameSettings = {
            folderNoteNamePattern: settings.folderNoteNamePattern
        };

        const targets = new Set<string>();

        if (selectedFolderPath === '/') {
            const rootFolder = selectionState.selectedFolder;
            const rootFolderNoteSourceName = rootFolder
                ? resolveRootFolderNoteSourceName(rootFolder, app.vault)
                : (selectedFolderName ?? '');
            addFolderNoteCandidatePaths(targets, '/', rootFolderNoteSourceName, folderNoteNameSettings);
            return targets;
        }

        const segments = selectedFolderPath.split('/').filter(Boolean);
        let currentPath = '';
        segments.forEach(segment => {
            currentPath = currentPath ? `${currentPath}/${segment}` : segment;
            addFolderNoteCandidatePaths(targets, currentPath, segment, folderNoteNameSettings);
        });

        return targets;
    }, [
        selectedFolderName,
        selectedFolderPath,
        app.vault,
        selectionState.selectedFolder,
        selectionState.selectionType,
        settings.enableFolderNotes,
        settings.folderNoteNamePattern
    ]);

    useEffect(() => {
        if (watchedFolderNotePaths.size === 0) {
            return;
        }

        const db = getDBInstance();
        const unsubscribers = Array.from(watchedFolderNotePaths).map(path => {
            return db.onFileContentChange(path, changes => {
                if (changes.metadata === undefined) {
                    return;
                }
                setFolderNoteVersion(version => version + 1);
            });
        });

        return () => {
            unsubscribers.forEach(unsubscribe => {
                unsubscribe();
            });
        };
    }, [watchedFolderNotePaths]);

    useEffect(() => {
        if (watchedFolderNotePaths.size === 0) {
            return;
        }

        const handleFileChange = (file: TAbstractFile, oldPath?: string) => {
            if (!(file instanceof TFile)) {
                return;
            }

            if (watchedFolderNotePaths.has(file.path) || (typeof oldPath === 'string' && watchedFolderNotePaths.has(oldPath))) {
                setFolderNoteVersion(version => version + 1);
            }
        };

        const createRef = app.vault.on('create', file => {
            handleFileChange(file);
        });
        const deleteRef = app.vault.on('delete', file => {
            handleFileChange(file);
        });
        const renameRef = app.vault.on('rename', (file, oldPath) => {
            handleFileChange(file, oldPath);
        });

        return () => {
            app.vault.offref(createRef);
            app.vault.offref(deleteRef);
            app.vault.offref(renameRef);
        };
    }, [app.vault, watchedFolderNotePaths]);

    const settingsSignature = useMemo(() => {
        return JSON.stringify({
            folderIcons: settings.folderIcons || {},
            tagIcons: settings.tagIcons || {},
            propertyIcons: settings.propertyIcons || {},
            enableFolderNotes: settings.enableFolderNotes,
            folderNoteNamePattern: settings.folderNoteNamePattern,
            useFrontmatterMetadata: settings.useFrontmatterMetadata,
            frontmatterNameField: settings.frontmatterNameField
        });
    }, [settings]);

    const metadataVersion = useMemo(() => {
        return `${settingsSignature}::${folderNoteVersion}`;
    }, [folderNoteVersion, settingsSignature]);

    // Determines the icon to display in the list pane header based on selection type and icon settings
    const iconName = useMemo(() => {
        // Forces recompute when folder note metadata changes in IndexedDB.
        void metadataVersion;
        if (selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder) {
            if (!settings.showFolderIcons) {
                return '';
            }
            const folder = selectionState.selectedFolder;
            const customIcon = metadataService.getFolderDisplayData(folder.path, {
                includeDisplayName: false,
                includeColor: false,
                includeBackgroundColor: false,
                includeIcon: true
            }).icon;
            if (customIcon) {
                return customIcon;
            }

            const excludedFolders = hiddenFolders;
            const showHiddenFolders = showHiddenItems;
            const hasChildren = hasSubfolders(folder, excludedFolders, showHiddenFolders);
            const isExpanded = isFolderEffectivelyExpanded(folder.path, expansionState.expandedFolders, settings.showRootFolder);
            return hasChildren && isExpanded
                ? resolveUXIcon(settings.interfaceIcons, 'nav-folder-open')
                : resolveUXIcon(settings.interfaceIcons, 'nav-folder-closed');
        }

        if (selectionState.selectionType === ItemType.TAG && selectionState.selectedTag) {
            if (!settings.showTagIcons) {
                return '';
            }
            return metadataService.getTagIcon(selectionState.selectedTag) || resolveUXIcon(settings.interfaceIcons, 'nav-tag');
        }

        if (selectionState.selectionType === ItemType.PROPERTY && selectionState.selectedProperty) {
            if (!settings.showPropertyIcons) {
                return '';
            }

            const selectedPropertyNodeId = selectionState.selectedProperty;
            if (selectedPropertyNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
                return resolveUXIcon(settings.interfaceIcons, 'nav-properties');
            }

            const customIcon = metadataService.getPropertyIcon(selectedPropertyNodeId);
            if (customIcon) {
                return customIcon;
            }

            const parsedPropertyNode = parsePropertyNodeId(selectedPropertyNodeId);
            if (parsedPropertyNode?.valuePath) {
                return resolveUXIcon(settings.interfaceIcons, 'nav-property-value');
            }

            return resolveUXIcon(settings.interfaceIcons, 'nav-property');
        }

        return '';
    }, [
        expansionState.expandedFolders,
        metadataService,
        selectionState.selectedFolder,
        selectionState.selectedTag,
        selectionState.selectedProperty,
        selectionState.selectionType,
        hiddenFolders,
        showHiddenItems,
        settings.interfaceIcons,
        settings.showFolderIcons,
        settings.showPropertyIcons,
        settings.showRootFolder,
        settings.showTagIcons,
        metadataVersion
    ]);

    const { desktopTitle, breadcrumbSegments } = useMemo<ListPaneTitleMemoResult>(() => {
        // Forces recompute when folder note metadata changes in IndexedDB.
        void metadataVersion;
        if (selectionState.selectionType === ItemType.FOLDER && selectionState.selectedFolder) {
            const folder = selectionState.selectedFolder;

            if (folder.path === '/') {
                const vaultName = resolveFolderDisplayName({
                    app,
                    metadataService,
                    settings: { customVaultName: settings.customVaultName },
                    folderPath: folder.path,
                    fallbackName: folder.name
                });
                const rootBreadcrumb: BreadcrumbSegment[] = [
                    {
                        label: vaultName,
                        targetType: 'none',
                        isLast: true
                    }
                ];
                return {
                    desktopTitle: vaultName,
                    breadcrumbSegments: rootBreadcrumb
                };
            }

            const folderDisplayPathSegments = resolveFolderDisplayPathSegments({ metadataService, folderPath: folder.path });
            const breadcrumb: BreadcrumbSegment[] = folderDisplayPathSegments.map((segment, index) => {
                const isLast = index === folderDisplayPathSegments.length - 1;
                if (isLast) {
                    return {
                        label: segment.label,
                        targetType: 'none',
                        isLast: true
                    };
                }

                return {
                    label: segment.label,
                    targetType: 'folder',
                    targetPath: segment.path,
                    isLast: false
                };
            });

            return {
                desktopTitle: folderDisplayPathSegments[folderDisplayPathSegments.length - 1]?.label ?? folder.name,
                breadcrumbSegments: breadcrumb
            };
        }

        if (selectionState.selectionType === ItemType.TAG && selectionState.selectedTag) {
            const tag = selectionState.selectedTag;

            // Handle virtual tag collection showing all tagged notes
            if (tag === TAGGED_TAG_ID) {
                const taggedLabel = getVirtualTagCollection(VIRTUAL_TAG_COLLECTION_IDS.TAGGED).getLabel();
                const taggedBreadcrumb: BreadcrumbSegment[] = [
                    {
                        label: taggedLabel,
                        targetType: 'none',
                        isLast: true
                    }
                ];
                return {
                    desktopTitle: taggedLabel,
                    breadcrumbSegments: taggedBreadcrumb
                };
            }

            if (tag === UNTAGGED_TAG_ID) {
                const untaggedBreadcrumb: BreadcrumbSegment[] = [
                    {
                        label: strings.common.untagged,
                        targetType: 'none',
                        isLast: true
                    }
                ];
                return {
                    desktopTitle: strings.common.untagged,
                    breadcrumbSegments: untaggedBreadcrumb
                };
            }

            const displayPath = getTagDisplayPath(tag);
            const segments = displayPath.split('/').filter(Boolean);
            const breadcrumb: BreadcrumbSegment[] = segments.map((segment, index): BreadcrumbSegment => {
                const isLast = index === segments.length - 1;
                if (isLast) {
                    return {
                        label: segment,
                        targetType: 'none',
                        isLast: true
                    };
                }

                return {
                    label: segment,
                    targetType: 'tag',
                    targetPath: segments.slice(0, index + 1).join('/'),
                    isLast: false
                };
            });

            return {
                desktopTitle: segments[segments.length - 1] || displayPath,
                breadcrumbSegments: breadcrumb
            };
        }

        if (selectionState.selectionType === ItemType.PROPERTY && selectionState.selectedProperty) {
            const propertyNodeId = selectionState.selectedProperty;
            if (propertyNodeId === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
                const propertiesBreadcrumb: BreadcrumbSegment[] = [
                    {
                        label: strings.navigationPane.properties,
                        targetType: 'none',
                        isLast: true
                    }
                ];

                return {
                    desktopTitle: strings.navigationPane.properties,
                    breadcrumbSegments: propertiesBreadcrumb
                };
            }

            const parsed = parsePropertyNodeId(propertyNodeId);
            if (!parsed) {
                return {
                    desktopTitle: strings.navigationPane.properties,
                    breadcrumbSegments: [
                        {
                            label: strings.navigationPane.properties,
                            targetType: 'none',
                            isLast: true
                        }
                    ]
                };
            }

            const propertyTree = getPropertyTree();
            const keyNode = propertyTree.get(parsed.key) ?? null;
            const displayKey = keyNode?.name ?? parsed.key;
            const valueNode = parsed.valuePath ? (keyNode?.children.get(propertyNodeId) ?? null) : null;
            const keyNodeId = buildPropertyKeyNodeId(parsed.key);

            return {
                desktopTitle: parsed.valuePath ? (valueNode?.displayPath ?? parsed.valuePath) : displayKey,
                breadcrumbSegments: parsed.valuePath
                    ? [
                          { label: displayKey, targetType: 'property', targetPath: keyNodeId, isLast: false },
                          { label: valueNode?.displayPath ?? parsed.valuePath, targetType: 'none', isLast: true }
                      ]
                    : [{ label: displayKey, targetType: 'none', isLast: true }]
            };
        }

        const noSelectionBreadcrumb: BreadcrumbSegment[] = [
            {
                label: strings.common.noSelection,
                targetType: 'none',
                isLast: true
            }
        ];

        return {
            desktopTitle: strings.common.noSelection,
            breadcrumbSegments: noSelectionBreadcrumb
        };
    }, [
        app,
        getTagDisplayPath,
        getPropertyTree,
        metadataService,
        selectionState.selectedFolder,
        selectionState.selectedTag,
        selectionState.selectedProperty,
        selectionState.selectionType,
        settings.customVaultName,
        metadataVersion
    ]);

    return {
        desktopTitle,
        breadcrumbSegments,
        iconName,
        showIcon:
            (selectionState.selectionType === ItemType.FOLDER && settings.showFolderIcons && iconName.length > 0) ||
            (selectionState.selectionType === ItemType.TAG && settings.showTagIcons && iconName.length > 0) ||
            (selectionState.selectionType === ItemType.PROPERTY && settings.showPropertyIcons && iconName.length > 0),
        selectionType: selectionState.selectionType
    };
}
