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

// src/hooks/useDragAndDrop.ts
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { setIcon, TFile, TFolder } from 'obsidian';
import { useSelectionState, useSelectionDispatch } from '../context/SelectionContext';
import { useServices, useFileSystemOps, useTagOperations } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { useUXPreferences } from '../context/UXPreferencesContext';
import { useExpansionState, useExpansionDispatch } from '../context/ExpansionContext';
import { strings } from '../i18n';
import { showNotice } from '../utils/noticeUtils';
import { ItemType, TAGGED_TAG_ID, UNTAGGED_TAG_ID } from '../types';
import { SHORTCUT_DRAG_MIME } from '../types/shortcuts';
import { DragManagerPayload, PROPERTY_DRAG_MIME, TAG_DRAG_MIME, hasDragManager, TIMEOUTS } from '../types/obsidian-extended';
import { getPathFromDataAttribute } from '../utils/domUtils';
import { buildFilePathInFolder, generateUniqueFilename } from '../utils/fileCreationUtils';
import { setNativeDragPreview } from '../utils/nativeDragPreview';
import { normalizeTagPathValue } from '../utils/tagPrefixMatcher';
import { runAsyncAction } from '../utils/async';
import { extractFilePathsFromDataTransfer, hasObsidianFileDragType, hasPotentialObsidianFileDragType } from '../utils/dragData';
import { FolderMoveError } from '../services/FileSystemService';
import { getFilesForNavigationSelection } from '../utils/selectionUtils';
import { expandNavigationTreeItems, getFolderAncestorPaths, getTagAncestorPaths } from '../utils/navigationExpansion';
import { getIconService } from '../services/icons';

/**
 * Enables drag and drop for files and folders using event delegation.
 * Adds visual feedback, validates drops, and performs file operations.
 *
 * Usage: call with a container element that contains items with
 * data attributes: `data-draggable`, `data-drag-type`, `data-drag-path`,
 * and drop zones with `data-drop-zone`, `data-drop-path`.
 */
export const DRAG_AUTO_EXPAND_DELAY = 500;
type DragItemType = (typeof ItemType)[keyof typeof ItemType];

type AutoExpandTarget = { type: 'folder' | 'tag'; path: string };

const SUPPRESS_CLICK_AFTER_DROP_MS = 100;
const TEXT_PLAIN_MIME = 'text/plain';
const TEXT_URI_LIST_MIME = 'text/uri-list';

interface AutoExpandConfig {
    type: AutoExpandTarget['type'];
    path: string;
    isAlreadyExpanded: () => boolean;
    resolveNode: () => { isValid: boolean; hasChildren: boolean };
    expand: () => void;
}

interface SupportedDropPayloadOptions {
    hasObsidianData: boolean;
    hasTagPayload: boolean;
    isExternalOnly: boolean;
}

const isSupportedDropPayload = (
    dropType: string | null,
    { hasObsidianData, hasTagPayload, isExternalOnly }: SupportedDropPayloadOptions
): boolean => {
    if (dropType === 'folder') {
        return hasObsidianData || isExternalOnly;
    }
    if (dropType === 'tag') {
        return hasTagPayload || hasObsidianData || isExternalOnly;
    }
    if (dropType === 'tag-root') {
        return hasTagPayload;
    }
    if (dropType === 'property') {
        return hasObsidianData;
    }
    return false;
};

const asEmojiIcon = (iconId: string): string | null => {
    if (iconId.startsWith('emoji:')) {
        return iconId.slice('emoji:'.length);
    }

    const emojiRegex = /\p{Extended_Pictographic}/u;
    return emojiRegex.test(iconId) ? iconId : null;
};

const isRenderableDragPreviewIcon = (iconId: string): boolean => {
    if (asEmojiIcon(iconId)) {
        return true;
    }

    const normalizedIconId = iconId.startsWith('lucide-') ? iconId.slice('lucide-'.length) : iconId;
    return getIconService().isValidIcon(normalizedIconId);
};

const resolveBaseDragPreviewIcon = (itemType: ItemType | null, baseIconId?: string): string | null => {
    if (baseIconId) {
        return baseIconId;
    }
    if (itemType === ItemType.FOLDER) {
        return 'folder-closed';
    }
    if (itemType === ItemType.TAG) {
        return 'tags';
    }
    if (itemType === ItemType.FILE) {
        return 'file';
    }
    if (itemType === ItemType.PROPERTY) {
        return 'align-left';
    }
    return null;
};

const resolveDragPreviewIcons = (itemType: ItemType | null, iconId?: string, fallbackIconId?: string, baseIconId?: string): string[] => {
    const resolvedIcons: string[] = [];
    if (iconId) {
        resolvedIcons.push(iconId);
    }
    if (fallbackIconId) {
        resolvedIcons.push(fallbackIconId);
    }

    const baseIcon = resolveBaseDragPreviewIcon(itemType, baseIconId);
    if (baseIcon) {
        resolvedIcons.push(baseIcon);
    }

    return Array.from(new Set(resolvedIcons));
};

const renderDragPreviewIcon = (target: HTMLElement, iconId: string): boolean => {
    if (!isRenderableDragPreviewIcon(iconId)) {
        return false;
    }

    target.innerHTML = '';
    try {
        getIconService().renderIcon(target, iconId);
        if (target.childNodes.length > 0 || target.innerHTML.trim() !== '') {
            return true;
        }
    } catch (error) {
        void error;
    }

    const emoji = asEmojiIcon(iconId);
    if (emoji) {
        target.textContent = emoji;
        return true;
    }

    try {
        setIcon(target, iconId);
        return target.childNodes.length > 0;
    } catch (error) {
        void error;
    }

    return false;
};

const getNativeObsidianFilePath = (file: TFile): string => {
    if (file.extension === 'md' && file.path.endsWith('.md')) {
        return file.path.slice(0, -'.md'.length);
    }
    return file.path;
};

const buildNativeObsidianUri = (vaultName: string, file: TFile): string => {
    const encodedVault = encodeURIComponent(vaultName);
    const encodedFile = encodeURIComponent(getNativeObsidianFilePath(file));
    return `obsidian://open?vault=${encodedVault}&file=${encodedFile}`;
};

const setNativeFileDragPayload = (dataTransfer: DataTransfer, vaultName: string, files: TFile[]) => {
    const payload = files.map(file => buildNativeObsidianUri(vaultName, file)).join('\n');
    if (!payload) {
        return;
    }

    dataTransfer.setData(TEXT_PLAIN_MIME, payload);
    dataTransfer.setData(TEXT_URI_LIST_MIME, payload);
};

export function useDragAndDrop(containerRef: React.RefObject<HTMLElement | null>) {
    const { app, isMobile, tagTreeService, propertyTreeService } = useServices();
    const fileSystemOps = useFileSystemOps();
    const tagOperations = useTagOperations();
    const selectionState = useSelectionState();
    const dispatch = useSelectionDispatch();
    const settings = useSettingsState();
    const uxPreferences = useUXPreferences();
    const includeDescendantNotes = uxPreferences.includeDescendantNotes;
    const showHiddenItems = uxPreferences.showHiddenItems;
    const expansionState = useExpansionState();
    const expansionDispatch = useExpansionDispatch();
    const dragOverElement = useRef<HTMLElement | null>(null);
    const autoExpandTimeoutRef = useRef<number | null>(null);
    const autoExpandTargetRef = useRef<AutoExpandTarget | null>(null);
    const springLoadedExpandCountRef = useRef(0);
    const expandedFoldersRef = useRef(expansionState.expandedFolders);
    const expandedTagsRef = useRef(expansionState.expandedTags);
    const dragTypeRef = useRef<DragItemType | null>(null);
    const dragOverDropEffectRef = useRef<DataTransfer['dropEffect'] | null>(null);
    // Stores display path of dragged tag for rename operations
    const dragTagDisplayRef = useRef<string | null>(null);
    // Stores canonical path of dragged tag for comparison and validation
    const dragTagCanonicalRef = useRef<string | null>(null);
    const suppressClickUntilRef = useRef(0);
    const draggingElementsRef = useRef<Set<HTMLElement>>(new Set());
    const springLoadedInitialDelayMs = useMemo(() => {
        const delaySeconds = settings.springLoadedFoldersInitialDelay;
        if (!Number.isFinite(delaySeconds)) {
            return DRAG_AUTO_EXPAND_DELAY;
        }
        return Math.round(Math.min(2, Math.max(0.1, delaySeconds)) * 1000);
    }, [settings.springLoadedFoldersInitialDelay]);
    const springLoadedSubsequentDelayMs = useMemo(() => {
        const delaySeconds = settings.springLoadedFoldersSubsequentDelay;
        if (!Number.isFinite(delaySeconds)) {
            return DRAG_AUTO_EXPAND_DELAY;
        }
        return Math.round(Math.min(2, Math.max(0.1, delaySeconds)) * 1000);
    }, [settings.springLoadedFoldersSubsequentDelay]);

    /**
     * Sets or clears the drag payload in Obsidian's internal drag manager.
     * This allows other plugins (like Excalidraw) to access drag metadata.
     *
     * @param payload - Drag metadata to set, or null to clear
     */
    const setDragManagerPayload = useCallback(
        (payload: DragManagerPayload | null) => {
            if (!hasDragManager(app)) {
                return;
            }

            try {
                if (!payload) {
                    app.dragManager.draggable = null;
                    return;
                }

                const existingPayload = app.dragManager.draggable;
                const mergedPayload: DragManagerPayload = existingPayload ? { ...existingPayload, ...payload } : { ...payload };
                app.dragManager.draggable = mergedPayload;
            } catch (error) {
                console.error('[Notebook Navigator] Failed to set drag payload', error);
            }
        },
        [app]
    );

    /**
     * Type guard to check if an element is an HTMLElement
     */
    const isHTMLElement = (element: EventTarget | null): element is HTMLElement => {
        return element instanceof HTMLElement;
    };

    const isPreviewableDragType = (value: string | null): value is ItemType => {
        return value === ItemType.FILE || value === ItemType.FOLDER || value === ItemType.TAG || value === ItemType.PROPERTY;
    };

    const markDraggingElement = useCallback((element: HTMLElement) => {
        element.classList.add('nn-dragging');
        draggingElementsRef.current.add(element);
    }, []);

    const clearDraggingElements = useCallback(() => {
        draggingElementsRef.current.forEach(element => {
            element.classList.remove('nn-dragging');
        });
        draggingElementsRef.current.clear();
    }, []);

    const markSelectedFileRowsDragging = useCallback(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        container.querySelectorAll<HTMLElement>('.nn-file[data-drag-path]').forEach(element => {
            const selectedPath = getPathFromDataAttribute(element, 'data-drag-path');
            if (selectedPath && selectionState.selectedFiles.has(selectedPath)) {
                markDraggingElement(element);
            }
        });
    }, [containerRef, markDraggingElement, selectionState.selectedFiles]);

    const showNativeMultiFileDragPreview = useCallback(
        (event: DragEvent, count: number): boolean => {
            const ownerDocument = containerRef.current?.ownerDocument ?? activeDocument;
            const badge = ownerDocument.createElement('div');
            badge.className = 'nn-drag-preview-badge';
            badge.textContent = `${count}`;
            return setNativeDragPreview(event, badge);
        },
        [containerRef]
    );

    const showNativeSingleItemDragPreview = useCallback(
        (
            event: DragEvent,
            itemType: ItemType | null,
            iconId?: string,
            iconColor?: string,
            fallbackIconId?: string,
            baseIconId?: string
        ): boolean => {
            const resolvedIcons = resolveDragPreviewIcons(itemType, iconId, fallbackIconId, baseIconId);
            if (resolvedIcons.length === 0) {
                return false;
            }

            const ownerDocument = containerRef.current?.ownerDocument ?? activeDocument;
            const iconWrapper = ownerDocument.createElement('div');
            iconWrapper.className = 'nn-drag-preview-icon';
            const resolvedIconColor = iconColor ?? '#ffffff';
            iconWrapper.style.color = resolvedIconColor;
            iconWrapper.style.setProperty('--icon-color', resolvedIconColor);
            iconWrapper.style.fill = resolvedIconColor;
            iconWrapper.style.stroke = resolvedIconColor;

            const didRender = resolvedIcons.some(resolvedIcon => renderDragPreviewIcon(iconWrapper, resolvedIcon));
            if (!didRender) {
                return false;
            }

            return setNativeDragPreview(event, iconWrapper);
        },
        [containerRef]
    );

    /**
     * Helper function to get current file list based on selection
     */
    const getCurrentFileList = useCallback((): TFile[] => {
        return getFilesForNavigationSelection(
            {
                selectionType: selectionState.selectionType,
                selectedFolder: selectionState.selectedFolder,
                selectedTag: selectionState.selectedTag,
                selectedProperty: selectionState.selectedProperty
            },
            settings,
            { includeDescendantNotes, showHiddenItems },
            app,
            tagTreeService,
            propertyTreeService
        );
    }, [selectionState, settings, includeDescendantNotes, showHiddenItems, app, tagTreeService, propertyTreeService]);

    /**
     * Converts an array of file paths to TFile objects
     */
    const getFilesFromPaths = useCallback(
        (paths: string[]): TFile[] => {
            const files: TFile[] = [];
            for (const path of paths) {
                const file = app.vault.getFileByPath(path);
                if (file) {
                    files.push(file);
                }
            }
            return files;
        },
        [app]
    );

    const getDragPathType = useCallback(
        (dragPath: string): 'file' | 'folder' | null => {
            const target = app.vault.getAbstractFileByPath(dragPath);
            if (target instanceof TFile) {
                return 'file';
            }
            if (target instanceof TFolder) {
                return 'folder';
            }
            return null;
        },
        [app]
    );

    /**
     * Moves files to a folder with selection context
     */
    const moveFilesWithContext = useCallback(
        async (files: TFile[], targetFolder: TFolder) => {
            const currentFiles = getCurrentFileList();
            await fileSystemOps.moveFilesToFolder({
                files,
                targetFolder,
                selectionContext: {
                    selectedFile: selectionState.selectedFile,
                    dispatch,
                    allFiles: currentFiles
                },
                showNotifications: true
            });
        },
        [fileSystemOps, getCurrentFileList, selectionState.selectedFile, dispatch]
    );

    const getMarkdownFilesFromDragEvent = useCallback(
        (event: DragEvent): { files: TFile[]; hasNonMarkdown: boolean } => {
            const selectedPaths = extractFilePathsFromDataTransfer(event.dataTransfer ?? null, {
                getPathType: getDragPathType,
                vaultName: app.vault.getName()
            });
            if (!selectedPaths || selectedPaths.length === 0) {
                return { files: [], hasNonMarkdown: false };
            }

            const files = getFilesFromPaths(selectedPaths);
            if (files.length === 0) {
                return { files: [], hasNonMarkdown: false };
            }

            const hasNonMarkdown = files.some(file => file.extension !== 'md');
            return { files, hasNonMarkdown };
        },
        [app, getDragPathType, getFilesFromPaths]
    );

    /**
     * Handles the drag start event.
     * Extracts drag data from data attributes and sets drag effect.
     *
     * @param e - The drag event
     */
    const handleDragStart = useCallback(
        (e: DragEvent) => {
            if (!isHTMLElement(e.target)) {
                return;
            }

            springLoadedExpandCountRef.current = 0;
            clearDraggingElements();

            const draggable = e.target.closest('[data-draggable="true"]');
            if (!draggable || !draggable.instanceOf(HTMLElement)) {
                return;
            }

            const path = getPathFromDataAttribute(draggable, 'data-drag-path');
            const type = draggable.getAttribute('data-drag-type');
            const canonicalTag = draggable.getAttribute('data-drag-canonical');
            const iconIdAttr = draggable.getAttribute('data-drag-icon');
            const fallbackIconIdAttr = draggable.getAttribute('data-drag-fallback-icon');
            const baseIconIdAttr = draggable.getAttribute('data-drag-base-icon');
            const iconColorAttr = draggable.getAttribute('data-drag-icon-color');
            const allowMultiFileDrag = draggable.getAttribute('data-drag-allow-multi-file') !== 'false';
            const iconId = iconIdAttr && iconIdAttr.trim().length > 0 ? iconIdAttr : undefined;
            const fallbackIconId = fallbackIconIdAttr && fallbackIconIdAttr.trim().length > 0 ? fallbackIconIdAttr : undefined;
            const baseIconId = baseIconIdAttr && baseIconIdAttr.trim().length > 0 ? baseIconIdAttr : undefined;
            const iconColor = iconColorAttr && iconColorAttr.trim().length > 0 ? iconColorAttr : undefined;
            if (!path || !e.dataTransfer) {
                return;
            }

            const isMultiFileDrag =
                allowMultiFileDrag &&
                type === ItemType.FILE &&
                selectionState.selectedFiles.has(path) &&
                selectionState.selectedFiles.size > 1;

            // Clear any existing drag payload before setting new one
            setDragManagerPayload(null);

            // Handle multiple file selection drag
            if (isMultiFileDrag) {
                const selectedPaths = Array.from(selectionState.selectedFiles);
                e.dataTransfer.effectAllowed = 'all';
                dragTypeRef.current = ItemType.FILE;

                const draggedFiles = getFilesFromPaths(selectedPaths);
                if (draggedFiles.length > 0) {
                    setNativeFileDragPayload(e.dataTransfer, app.vault.getName(), draggedFiles);
                    setDragManagerPayload({
                        type: 'files',
                        files: draggedFiles,
                        title: `${draggedFiles.length} files`
                    });
                }

                markSelectedFileRowsDragging();

                showNativeMultiFileDragPreview(e, selectedPaths.length);
                return;
            }

            if (type === ItemType.FOLDER) {
                e.dataTransfer.setData('obsidian/file', path);
            }

            if (type === ItemType.FILE || type === ItemType.FOLDER || type === ItemType.TAG || type === ItemType.PROPERTY) {
                dragTypeRef.current = type;
            } else {
                dragTypeRef.current = ItemType.FILE;
            }
            e.dataTransfer.effectAllowed = type === ItemType.PROPERTY ? 'copy' : 'all';

            if (type === ItemType.FILE) {
                const file = app.vault.getFileByPath(path);
                if (file) {
                    setNativeFileDragPayload(e.dataTransfer, app.vault.getName(), [file]);
                    setDragManagerPayload({
                        type: 'file',
                        file,
                        title: file.basename
                    });
                }
            } else if (type === ItemType.TAG) {
                dragTagDisplayRef.current = path;
                dragTagCanonicalRef.current = canonicalTag ?? null;
                try {
                    const tagPayload = {
                        displayPath: path,
                        canonicalPath: canonicalTag ?? normalizeTagPathValue(path)
                    };
                    e.dataTransfer.setData(TAG_DRAG_MIME, JSON.stringify(tagPayload));
                    e.dataTransfer.setData('text/plain', `#${path}`);
                } catch (error) {
                    console.error('[Notebook Navigator] Failed to attach tag drag payload', error);
                }
                setDragManagerPayload({
                    type: 'tag',
                    title: path
                });
            } else if (type === ItemType.PROPERTY) {
                try {
                    const payload = { nodeId: path };
                    e.dataTransfer.setData(PROPERTY_DRAG_MIME, JSON.stringify(payload));
                } catch (error) {
                    console.error('[Notebook Navigator] Failed to attach property drag payload', error);
                }
            }

            markDraggingElement(draggable);
            const previewItemType = isPreviewableDragType(type) ? type : null;
            showNativeSingleItemDragPreview(e, previewItemType, iconId, iconColor, fallbackIconId, baseIconId);
        },
        [
            selectionState,
            app,
            getFilesFromPaths,
            setDragManagerPayload,
            clearDraggingElements,
            markDraggingElement,
            markSelectedFileRowsDragging,
            showNativeMultiFileDragPreview,
            showNativeSingleItemDragPreview
        ]
    );

    useEffect(() => {
        expandedFoldersRef.current = expansionState.expandedFolders;
    }, [expansionState.expandedFolders]);

    useEffect(() => {
        expandedTagsRef.current = expansionState.expandedTags;
    }, [expansionState.expandedTags]);

    /**
     * Cancels pending auto-expand timer for folders and tags
     */
    const clearAutoExpandTimer = useCallback(() => {
        if (autoExpandTimeoutRef.current !== null) {
            window.clearTimeout(autoExpandTimeoutRef.current);
            autoExpandTimeoutRef.current = null;
        }
        autoExpandTargetRef.current = null;
    }, []);

    useEffect(() => {
        if (!settings.springLoadedFolders) {
            clearAutoExpandTimer();
        }
    }, [settings.springLoadedFolders, clearAutoExpandTimer]);

    /**
     * Schedules auto-expansion of a folder or tag when hovering during drag
     * Validates the node has children before expanding after delay
     */
    const scheduleAutoExpand = useCallback(
        (config: AutoExpandConfig) => {
            // Skip if already scheduled for this target
            if (autoExpandTargetRef.current?.type === config.type && autoExpandTargetRef.current.path === config.path) {
                return;
            }

            clearAutoExpandTimer();

            // Skip if already expanded
            if (config.isAlreadyExpanded()) {
                return;
            }

            // Validate node exists and has children
            const initial = config.resolveNode();
            if (!initial.isValid || !initial.hasChildren) {
                return;
            }

            const delay = springLoadedExpandCountRef.current === 0 ? springLoadedInitialDelayMs : springLoadedSubsequentDelayMs;
            autoExpandTargetRef.current = { type: config.type, path: config.path };
            autoExpandTimeoutRef.current = window.setTimeout(() => {
                const latest = config.resolveNode();
                if (!latest.isValid) {
                    clearAutoExpandTimer();
                    return;
                }

                if (latest.hasChildren && !config.isAlreadyExpanded()) {
                    config.expand();
                    springLoadedExpandCountRef.current += 1;
                }

                clearAutoExpandTimer();
            }, delay);
        },
        [clearAutoExpandTimer, springLoadedInitialDelayMs, springLoadedSubsequentDelayMs]
    );

    /**
     * Schedules folder auto-expansion when dragging over a collapsed folder
     */
    const scheduleFolderAutoExpand = useCallback(
        (targetPath: string) => {
            scheduleAutoExpand({
                type: 'folder',
                path: targetPath,
                isAlreadyExpanded: () => expandedFoldersRef.current.has(targetPath),
                resolveNode: () => {
                    const folder = app.vault.getFolderByPath(targetPath);
                    if (!folder) {
                        return { isValid: false, hasChildren: false };
                    }
                    return {
                        isValid: true,
                        hasChildren: folder.children.some(child => child instanceof TFolder)
                    };
                },
                expand: () => {
                    const folder = settings.collapseOtherBranchesOnExpand ? app.vault.getFolderByPath(targetPath) : null;
                    const folderPaths = folder ? [...getFolderAncestorPaths(folder), targetPath] : [targetPath];
                    expandNavigationTreeItems({
                        type: 'folder',
                        ids: folderPaths,
                        collapseOtherBranches: settings.collapseOtherBranchesOnExpand,
                        dispatch: expansionDispatch
                    });
                }
            });
        },
        [app, expansionDispatch, scheduleAutoExpand, settings.collapseOtherBranchesOnExpand]
    );

    /**
     * Schedules tag auto-expansion when dragging over a collapsed tag
     */
    const scheduleTagAutoExpand = useCallback(
        (targetPath: string) => {
            if (!tagTreeService) {
                return;
            }

            scheduleAutoExpand({
                type: 'tag',
                path: targetPath,
                isAlreadyExpanded: () => expandedTagsRef.current.has(targetPath),
                resolveNode: () => {
                    if (!tagTreeService) {
                        return { isValid: false, hasChildren: false };
                    }
                    const node = tagTreeService.findTagNode(targetPath);
                    if (!node) {
                        return { isValid: false, hasChildren: false };
                    }
                    return { isValid: true, hasChildren: node.children.size > 0 };
                },
                expand: () => {
                    const tagPaths = settings.collapseOtherBranchesOnExpand
                        ? [...getTagAncestorPaths(targetPath), targetPath]
                        : [targetPath];
                    expandNavigationTreeItems({
                        type: 'tag',
                        ids: tagPaths,
                        collapseOtherBranches: settings.collapseOtherBranchesOnExpand,
                        dispatch: expansionDispatch
                    });
                }
            });
        },
        [tagTreeService, expansionDispatch, scheduleAutoExpand, settings.collapseOtherBranchesOnExpand]
    );

    const maybeScheduleAutoExpand = useCallback(
        (targetType: 'folder' | 'tag', targetPath: string) => {
            if (!settings.springLoadedFolders) {
                clearAutoExpandTimer();
                return;
            }

            if (targetType === 'folder') {
                scheduleFolderAutoExpand(targetPath);
                return;
            }

            scheduleTagAutoExpand(targetPath);
        },
        [settings.springLoadedFolders, clearAutoExpandTimer, scheduleFolderAutoExpand, scheduleTagAutoExpand]
    );

    /**
     * Handles the drag over event.
     * Provides visual feedback by adding CSS classes to valid drop targets.
     *
     * @param e - The drag event
     */
    const handleDragOver = useCallback(
        (e: DragEvent) => {
            if (!isHTMLElement(e.target)) return;
            const dropZone = e.target.closest<HTMLElement>(
                '[data-drop-zone="folder"],[data-drop-zone="tag"],[data-drop-zone="tag-root"],[data-drop-zone="property"]'
            );
            const isShortcutDrag = Boolean(e.dataTransfer?.types?.includes(SHORTCUT_DRAG_MIME));

            if (dragOverElement.current && dragOverElement.current !== dropZone) {
                dragOverElement.current.classList.remove('nn-drag-over');
                dragOverElement.current = null;
                dragOverDropEffectRef.current = null;
                clearAutoExpandTimer();
            }

            if (!dropZone) {
                if (isShortcutDrag && e.dataTransfer) {
                    e.dataTransfer.dropEffect = 'none';
                }
                dragOverDropEffectRef.current = null;
                clearAutoExpandTimer();
                return;
            }

            if (dragOverElement.current === dropZone && dragOverDropEffectRef.current && e.dataTransfer) {
                e.preventDefault();
                e.dataTransfer.dropEffect = dragOverDropEffectRef.current;
                return;
            }

            if (isShortcutDrag) {
                dropZone.classList.remove('nn-drag-over');
                dragOverElement.current = null;
                dragOverDropEffectRef.current = null;
                clearAutoExpandTimer();
                if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = 'none';
                }
                return;
            }

            if (dragTypeRef.current === ItemType.PROPERTY) {
                dropZone.classList.remove('nn-drag-over');
                dragOverElement.current = null;
                dragOverDropEffectRef.current = null;
                clearAutoExpandTimer();
                if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = 'none';
                }
                return;
            }

            if (e.dataTransfer) {
                const dropType = dropZone.getAttribute('data-drop-zone');
                const targetPath = dropZone.getAttribute('data-drop-path');

                // Check drop zone permissions
                const allowInternalDrop = dropZone.dataset.allowInternalDrop !== 'false';
                const allowExternalDrop = dropZone.dataset.allowExternalDrop !== 'false';
                const typesList = e.dataTransfer.types;
                const hasObsidianData = hasPotentialObsidianFileDragType(typesList);
                const hasTagPayload = Boolean(typesList?.includes(TAG_DRAG_MIME));
                const hasExternalFiles = Boolean(e.dataTransfer.files && e.dataTransfer.files.length > 0);
                const isInternalTransfer = hasObsidianData || hasTagPayload;
                const isExternalOnly = hasExternalFiles && !isInternalTransfer;

                if (dropType === 'property') {
                    const isNavigatorFolderDrag = dragTypeRef.current === ItemType.FOLDER;
                    const isNavigatorTagDrag = dragTypeRef.current === ItemType.TAG;
                    if (isNavigatorFolderDrag || isNavigatorTagDrag || !hasObsidianData || isExternalOnly) {
                        if (dragOverElement.current === dropZone) {
                            dropZone.classList.remove('nn-drag-over');
                            dragOverElement.current = null;
                            dragOverDropEffectRef.current = null;
                        }
                        clearAutoExpandTimer();
                        e.dataTransfer.dropEffect = 'none';
                        return;
                    }
                }

                // Block drops that do not meet drop zone permissions
                if ((isInternalTransfer && !allowInternalDrop) || (isExternalOnly && !allowExternalDrop)) {
                    if (dragOverElement.current === dropZone) {
                        dropZone.classList.remove('nn-drag-over');
                        dragOverElement.current = null;
                        dragOverDropEffectRef.current = null;
                    }
                    clearAutoExpandTimer();
                    e.dataTransfer.dropEffect = 'none';
                    return;
                }

                if (!isSupportedDropPayload(dropType, { hasObsidianData, hasTagPayload, isExternalOnly })) {
                    if (dragOverElement.current === dropZone) {
                        dropZone.classList.remove('nn-drag-over');
                        dragOverElement.current = null;
                        dragOverDropEffectRef.current = null;
                    }
                    clearAutoExpandTimer();
                    e.dataTransfer.dropEffect = 'none';
                    return;
                }

                e.preventDefault();

                const isExternal = !!typesList?.includes('Files') && !isInternalTransfer;

                // Folder: move (internal) / copy (external); Tag: untagged = move, tag = copy
                if (dropType === 'folder') {
                    if (dragTypeRef.current === ItemType.TAG) {
                        if (dragOverElement.current === dropZone) {
                            dropZone.classList.remove('nn-drag-over');
                            dragOverElement.current = null;
                            dragOverDropEffectRef.current = null;
                        }
                        clearAutoExpandTimer();
                        e.dataTransfer.dropEffect = 'none';
                        return;
                    }
                    e.dataTransfer.dropEffect = isExternal ? 'copy' : 'move';
                    if (targetPath) {
                        maybeScheduleAutoExpand('folder', targetPath);
                    }
                } else if (dropType === 'tag') {
                    if (dragTypeRef.current === ItemType.FOLDER) {
                        if (dragOverElement.current === dropZone) {
                            dropZone.classList.remove('nn-drag-over');
                        }
                        dragOverElement.current = null;
                        dragOverDropEffectRef.current = null;
                        clearAutoExpandTimer();
                        e.dataTransfer.dropEffect = 'none';
                        return;
                    }
                    e.dataTransfer.dropEffect = targetPath === UNTAGGED_TAG_ID ? 'move' : 'copy';
                    if (targetPath !== UNTAGGED_TAG_ID) {
                        const canonicalTagPath = dropZone.getAttribute('data-tag');
                        if (canonicalTagPath) {
                            maybeScheduleAutoExpand('tag', canonicalTagPath);
                        } else {
                            clearAutoExpandTimer();
                        }
                    } else {
                        clearAutoExpandTimer();
                    }
                } else if (dropType === 'property') {
                    clearAutoExpandTimer();
                    e.dataTransfer.dropEffect = 'move';
                }

                if (dropType === 'tag-root') {
                    if (dragTypeRef.current !== ItemType.TAG) {
                        if (dragOverElement.current === dropZone) {
                            dropZone.classList.remove('nn-drag-over');
                            dragOverElement.current = null;
                            dragOverDropEffectRef.current = null;
                        }
                        clearAutoExpandTimer();
                        e.dataTransfer.dropEffect = 'none';
                        return;
                    }
                    e.dataTransfer.dropEffect = 'move';
                    clearAutoExpandTimer();
                }
            }

            // Skip visual feedback if drop is not allowed
            if (!e.defaultPrevented) {
                return;
            }

            if (dragOverElement.current !== dropZone) {
                dropZone.classList.add('nn-drag-over');
            }
            dragOverElement.current = dropZone;
            dragOverDropEffectRef.current = e.dataTransfer?.dropEffect ?? null;
        },
        [clearAutoExpandTimer, maybeScheduleAutoExpand]
    );

    /**
     * Handles dropping files on a tag to add that tag to the files
     *
     * @param e - The drag event
     * @param targetTag - The tag to add (or UNTAGGED_TAG_ID to clear all tags)
     */
    const handleTagDrop = useCallback(
        async (e: DragEvent, targetTag: string) => {
            const { files, hasNonMarkdown } = getMarkdownFilesFromDragEvent(e);
            if (files.length === 0) {
                return;
            }

            // Verify all files are markdown (tags only work with markdown)
            if (hasNonMarkdown) {
                showNotice(strings.fileSystem.notifications.tagsRequireMarkdown, { variant: 'warning' });
                return;
            }

            // Handle special "untagged" drop zone - clear all tags
            if (targetTag === UNTAGGED_TAG_ID) {
                try {
                    const clearedCount = await tagOperations.clearAllTagsFromFiles(files);
                    if (clearedCount > 0) {
                        const message =
                            clearedCount === 1
                                ? strings.fileSystem.notifications.tagsClearedFromNote
                                : strings.fileSystem.notifications.tagsClearedFromNotes.replace('{count}', clearedCount.toString());
                        showNotice(message, { variant: 'success' });
                    } else {
                        showNotice(strings.dragDrop.notifications.noTagsToClear, { variant: 'warning' });
                    }
                } catch (error) {
                    console.error('Error clearing tags:', error);
                    showNotice(strings.dragDrop.errors.failedToClearTags, { variant: 'warning' });
                }
            } else {
                // Add tag to files
                try {
                    const { added, skipped } = await tagOperations.addTagToFiles(targetTag, files);

                    if (added > 0) {
                        const message =
                            added === 1
                                ? strings.fileSystem.notifications.tagAddedToNote
                                : strings.fileSystem.notifications.tagAddedToNotes.replace('{count}', added.toString());
                        showNotice(message, { variant: 'success' });
                    }
                    if (skipped > 0) {
                        showNotice(strings.dragDrop.notifications.filesAlreadyHaveTag.replace('{count}', skipped.toString()), {
                            timeout: TIMEOUTS.NOTICE_ERROR,
                            variant: 'warning'
                        });
                    }
                } catch (error) {
                    console.error('Error adding tag:', error);
                    showNotice(strings.dragDrop.errors.failedToAddTag.replace('{tag}', targetTag), { variant: 'warning' });
                }
            }
        },
        [getMarkdownFilesFromDragEvent, tagOperations]
    );

    const handlePropertyDrop = useCallback(
        async (event: DragEvent, targetPropertyNodeId: string) => {
            const { files, hasNonMarkdown } = getMarkdownFilesFromDragEvent(event);
            if (files.length === 0) {
                return;
            }

            if (hasNonMarkdown) {
                showNotice(strings.fileSystem.notifications.propertiesRequireMarkdown, { variant: 'warning' });
                return;
            }

            await fileSystemOps.applyPropertyNodeToFiles(targetPropertyNodeId, files);
        },
        [fileSystemOps, getMarkdownFilesFromDragEvent]
    );

    /**
     * Imports external files dropped from OS into a target folder
     * Handles both text and binary files with unique name generation
     */
    const handleExternalFileDrop = useCallback(
        async (files: FileList, targetFolder: TFolder) => {
            const importedCount = { success: 0, failed: 0 };
            const errors: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    // Extract base name and extension
                    const lastDotIndex = file.name.lastIndexOf('.');
                    let baseName: string;
                    let extension: string;

                    if (lastDotIndex === -1 || lastDotIndex === 0) {
                        // No extension or hidden file starting with dot
                        baseName = file.name;
                        extension = '';
                    } else {
                        baseName = file.name.substring(0, lastDotIndex);
                        extension = file.name.substring(lastDotIndex + 1);
                    }

                    // Generate unique filename if needed
                    const uniqueBaseName = generateUniqueFilename(targetFolder.path, baseName, extension, app);
                    const finalPath = buildFilePathInFolder(targetFolder.path, uniqueBaseName, extension);

                    // Decide text vs binary import
                    const lowerName = file.name.toLowerCase();
                    const mime = file.type || '';
                    const isLikelyText =
                        extension.toLowerCase() === 'md' ||
                        mime.startsWith('text/') ||
                        mime === 'application/json' ||
                        mime === 'application/xml' ||
                        /\.(canvas|json|csv|txt|xml|html|css|js|ts)$/i.test(lowerName);

                    if (isLikelyText) {
                        const content = await file.text();
                        await app.vault.create(finalPath, content);
                    } else {
                        const arrayBuffer = await file.arrayBuffer();
                        await app.vault.createBinary(finalPath, arrayBuffer);
                    }

                    importedCount.success++;
                } catch (error) {
                    console.error(`Failed to import file ${file.name}:`, error);
                    errors.push(file.name);
                    importedCount.failed++;
                }
            }

            // Show notification
            if (importedCount.success > 0) {
                const message =
                    importedCount.success === 1
                        ? strings.dragDrop.notifications.fileImported
                        : strings.dragDrop.notifications.filesImported.replace('{count}', importedCount.success.toString());
                showNotice(message, { variant: 'success' });
            }

            if (importedCount.failed > 0) {
                const errorMessage = strings.dragDrop.errors.failedToImportFiles.replace('{names}', errors.join(', '));
                showNotice(errorMessage, { timeout: TIMEOUTS.NOTICE_ERROR, variant: 'warning' });
            }
        },
        [app]
    );

    /**
     * Handles the drop event.
     * Validates the drop and performs the appropriate operation based on drop zone type.
     * - For folders: moves files/folders or imports external files
     * - For tags: adds tag to files
     * - For untagged: clears all tags from files
     *
     * @param e - The drag event
     */
    const handleDrop = useCallback(
        async (e: DragEvent) => {
            suppressClickUntilRef.current = Date.now() + SUPPRESS_CLICK_AFTER_DROP_MS;
            try {
                let dropZone = dragOverElement.current;
                if (dropZone) {
                    dropZone.classList.remove('nn-drag-over');
                }
                dragOverElement.current = null;
                dragOverDropEffectRef.current = null;

                if (!dropZone && isHTMLElement(e.target)) {
                    const candidate = e.target.closest('[data-drop-zone]');
                    dropZone = candidate instanceof HTMLElement ? candidate : null;
                }

                const isShortcutDrag = Boolean(e.dataTransfer?.types?.includes(SHORTCUT_DRAG_MIME));
                if (isShortcutDrag) {
                    clearAutoExpandTimer();
                    return;
                }

                if (dragTypeRef.current === ItemType.PROPERTY) {
                    clearAutoExpandTimer();
                    return;
                }

                if (!dropZone) {
                    clearAutoExpandTimer();
                    return;
                }

                const dropType = dropZone.getAttribute('data-drop-zone');
                const targetPath = getPathFromDataAttribute(dropZone, 'data-drop-path');
                if (!dropType || !targetPath) {
                    clearAutoExpandTimer();
                    return;
                }

                clearAutoExpandTimer();

                // Check drop zone permissions
                const allowInternalDrop = dropZone.dataset.allowInternalDrop !== 'false';
                const allowExternalDrop = dropZone.dataset.allowExternalDrop !== 'false';
                const typesList = e.dataTransfer?.types;
                const externalFiles = e.dataTransfer?.files ?? null;
                const selectedPaths = extractFilePathsFromDataTransfer(e.dataTransfer ?? null, {
                    getPathType: getDragPathType,
                    vaultName: app.vault.getName()
                });
                const hasObsidianData = hasObsidianFileDragType(typesList) || Boolean(selectedPaths && selectedPaths.length > 0);
                const hasTagPayload = Boolean(typesList?.includes(TAG_DRAG_MIME));
                const hasExternalFiles = Boolean(externalFiles && externalFiles.length > 0);
                const isInternalTransfer = hasObsidianData || hasTagPayload;
                const isExternalOnly = hasExternalFiles && !isInternalTransfer;

                // Block internal drops if not allowed
                if (isInternalTransfer && !allowInternalDrop) {
                    return;
                }

                // Block external drops if not allowed
                if (isExternalOnly && !allowExternalDrop) {
                    return;
                }

                if (!isSupportedDropPayload(dropType, { hasObsidianData, hasTagPayload, isExternalOnly })) {
                    return;
                }

                e.preventDefault();

                if (dropType === 'tag-root') {
                    if (dragTypeRef.current === ItemType.TAG) {
                        const sourceDisplay = dragTagDisplayRef.current;
                        if (!sourceDisplay) {
                            return;
                        }
                        await tagOperations.promoteTagToRoot(sourceDisplay);
                    }
                    return;
                }

                if (dropType === 'tag') {
                    // Handle tag-to-tag drag for renaming and restructuring
                    if (dragTypeRef.current === ItemType.TAG) {
                        const sourceDisplay = dragTagDisplayRef.current;
                        const sourceCanonical = dragTagCanonicalRef.current;
                        if (!sourceDisplay || !sourceCanonical) {
                            return;
                        }
                        const targetCanonical = dropZone.getAttribute('data-tag') ?? '';
                        // Reject drops on virtual tags
                        if (targetPath === UNTAGGED_TAG_ID) {
                            return;
                        }
                        if (targetCanonical === TAGGED_TAG_ID || targetPath === TAGGED_TAG_ID) {
                            return;
                        }
                        // Reject drops on same tag
                        if (targetCanonical === sourceCanonical) {
                            return;
                        }
                        // Reject drops that would create descendant rename
                        if (targetCanonical.startsWith(`${sourceCanonical}/`)) {
                            showNotice(strings.modals.tagOperation.descendantRenameError, { variant: 'warning' });
                            return;
                        }
                        await tagOperations.renameTagByDrag(sourceDisplay, targetPath);
                        return;
                    }

                    if (dragTypeRef.current === ItemType.FOLDER) {
                        return;
                    }

                    if (isExternalOnly) {
                        showNotice(strings.fileSystem.notifications.tagOperationsNotAvailable, {
                            timeout: TIMEOUTS.NOTICE_ERROR,
                            variant: 'warning'
                        });
                        return;
                    }

                    await handleTagDrop(e, targetPath);
                    return;
                }

                if (dropType === 'property') {
                    if (!hasObsidianData || isExternalOnly) {
                        return;
                    }

                    if (dragTypeRef.current === ItemType.TAG || dragTypeRef.current === ItemType.FOLDER) {
                        return;
                    }

                    await handlePropertyDrop(e, targetPath);
                    return;
                }

                if (dropType === 'folder' && dragTypeRef.current === ItemType.TAG) {
                    return;
                }

                const targetFolder = app.vault.getFolderByPath(targetPath);
                if (!targetFolder) {
                    return;
                }

                // Handle external file imports
                if (externalFiles && externalFiles.length > 0 && !hasObsidianData) {
                    await handleExternalFileDrop(externalFiles, targetFolder);
                    return;
                }

                // Extract file paths from drag event data for folder move
                if (selectedPaths && selectedPaths.length > 0) {
                    const filesToMove = getFilesFromPaths(selectedPaths);
                    if (filesToMove.length > 0) {
                        await moveFilesWithContext(filesToMove, targetFolder);
                        return;
                    }
                }

                const singleItemData = e.dataTransfer?.getData('obsidian/file');
                if (!singleItemData) {
                    return;
                }

                const sourceItem = app.vault.getAbstractFileByPath(singleItemData);
                if (!sourceItem) {
                    return;
                }

                if (sourceItem instanceof TFile) {
                    await moveFilesWithContext([sourceItem], targetFolder);
                } else if (sourceItem instanceof TFolder) {
                    if (targetFolder.path === sourceItem.path || targetFolder.path.startsWith(`${sourceItem.path}/`)) {
                        showNotice(strings.dragDrop.errors.cannotMoveIntoSelf, { variant: 'warning' });
                        return;
                    }

                    if (sourceItem.parent?.path === targetFolder.path) {
                        return;
                    }

                    try {
                        await fileSystemOps.moveFolderToTarget(sourceItem, targetFolder);
                        showNotice(strings.fileSystem.notifications.folderMoved.replace('{name}', sourceItem.name), { variant: 'success' });
                    } catch (error) {
                        if (error instanceof FolderMoveError) {
                            if (error.code === 'destination-exists') {
                                showNotice(strings.fileSystem.errors.folderAlreadyExists.replace('{name}', sourceItem.name), {
                                    variant: 'warning'
                                });
                                return;
                            }
                            if (error.code === 'invalid-target') {
                                showNotice(strings.dragDrop.errors.cannotMoveIntoSelf, { variant: 'warning' });
                                return;
                            }
                        }
                        console.error('Error moving folder:', error);
                        showNotice(strings.dragDrop.errors.failedToMoveFolder.replace('{name}', sourceItem.name), { variant: 'warning' });
                    }
                }
            } finally {
                // Clean up drag state and payload after drop completes
                clearDraggingElements();
                setDragManagerPayload(null);
                dragTypeRef.current = null;
                dragTagDisplayRef.current = null;
                dragTagCanonicalRef.current = null;
                springLoadedExpandCountRef.current = 0;
            }
        },
        [
            app,
            handlePropertyDrop,
            handleTagDrop,
            handleExternalFileDrop,
            moveFilesWithContext,
            getFilesFromPaths,
            getDragPathType,
            clearAutoExpandTimer,
            clearDraggingElements,
            setDragManagerPayload,
            tagOperations,
            fileSystemOps
        ]
    );

    /**
     * Handles the drag leave event.
     * Removes drag-over styling when leaving a drop zone.
     *
     * @param e - The drag event
     */
    const handleDragLeave = useCallback(
        (e: DragEvent) => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) return;

            const dropZone = target.closest('[data-drop-zone]');
            if (dropZone instanceof HTMLElement && dropZone === dragOverElement.current) {
                // Only remove if we're actually leaving the drop zone, not just moving to a child
                const relatedTarget = e.relatedTarget;
                if (!(relatedTarget instanceof Node) || !dropZone.contains(relatedTarget)) {
                    dropZone.classList.remove('nn-drag-over');
                    dragOverElement.current = null;
                    dragOverDropEffectRef.current = null;
                    clearAutoExpandTimer();
                }
            }
        },
        [clearAutoExpandTimer]
    );

    /**
     * Cleans up drag state and visual feedback when drag ends
     * Removes CSS classes and clears drag payload
     */
    const handleDragEnd = useCallback(() => {
        springLoadedExpandCountRef.current = 0;
        clearDraggingElements();

        if (dragOverElement.current) {
            dragOverElement.current.classList.remove('nn-drag-over');
            dragOverElement.current = null;
        }
        dragOverDropEffectRef.current = null;

        // Clean up drag state and payload when drag ends
        setDragManagerPayload(null);
        clearAutoExpandTimer();
        dragTypeRef.current = null;
        dragTagDisplayRef.current = null;
        dragTagCanonicalRef.current = null;
    }, [clearDraggingElements, clearAutoExpandTimer, setDragManagerPayload]);

    /**
     * Attaches drag and drop event listeners to container element
     * Skips on mobile devices where drag and drop is not supported
     */
    useEffect(() => {
        const container = containerRef.current;
        if (!container || isMobile) return;
        // Wrap handleDrop to catch async errors properly
        const handleDropListener = (event: DragEvent) => {
            runAsyncAction(() => handleDrop(event));
        };

        container.addEventListener('dragstart', handleDragStart);
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('dragleave', handleDragLeave);
        container.addEventListener('drop', handleDropListener);
        container.addEventListener('dragend', handleDragEnd);
        const handleClickCapture = (event: MouseEvent) => {
            if (Date.now() > suppressClickUntilRef.current) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        };
        container.addEventListener('click', handleClickCapture, true);

        return () => {
            container.removeEventListener('dragstart', handleDragStart);
            container.removeEventListener('dragover', handleDragOver);
            container.removeEventListener('dragleave', handleDragLeave);
            container.removeEventListener('drop', handleDropListener);
            container.removeEventListener('dragend', handleDragEnd);
            container.removeEventListener('click', handleClickCapture, true);

            // Clean up any lingering drag state on unmount
            clearDraggingElements();
            setDragManagerPayload(null);
            clearAutoExpandTimer();
            dragTypeRef.current = null;
            dragOverDropEffectRef.current = null;
        };
    }, [
        containerRef,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
        isMobile,
        clearDraggingElements,
        clearAutoExpandTimer,
        setDragManagerPayload
    ]);
}
