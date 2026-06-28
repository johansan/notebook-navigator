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

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react';
import { TFile } from 'obsidian';
import { resolvePrimarySelectedFile, useSelectionDispatch, useSelectionState } from '../context/SelectionContext';
import { useServices } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { runAsyncAction } from '../utils/async';
import { focusElementPreventScroll, isKeyboardEventContextBlocked } from '../utils/domUtils';
import { isEnterKey, isModifierArrowReorderShortcut, resolveKeyboardOpenContext } from '../utils/keyboardOpenContext';
import { KeyboardShortcutAction, matchesShortcut } from '../utils/keyboardShortcuts';
import { getManualSortSelectedMarkdownPaths, moveManualSortSelectionByDirection, type ManualSortMoveDirection } from '../utils/manualSort';
import { openFileInContext } from '../utils/openFileInContext';
import { getFilesInRange, mergeFilesIntoSelection } from '../utils/selectionUtils';
import { useFileOpener } from './useFileOpener';
import { useMultiSelection } from './useMultiSelection';

interface UseManualSortKeyboardParams {
    scrollContainerRef: RefObject<HTMLDivElement | null>;
    files: TFile[];
    markdownFiles: TFile[];
    selectedFiles: ReadonlySet<string>;
    selectedFilePath: string | null;
    isSaving: boolean;
    onKeyboardSelect: (file: TFile, options?: { debounceOpen?: boolean }) => void;
    onScheduleKeyboardOpen?: () => void;
    onScheduleKeyboardOpenForFile?: (file: TFile) => void;
    onCommitKeyboardOpen?: () => void;
    onReorder: (params: { nextFiles: TFile[]; movedPaths: ReadonlySet<string>; onApplied?: () => void }) => void;
}

interface UseManualSortKeyboardResult {
    handleKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
    handleKeyUp: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
}

const clampManualSortIndex = (index: number, files: readonly TFile[]): number => {
    if (files.length === 0) {
        return -1;
    }

    return Math.max(0, Math.min(index, files.length - 1));
};

const getManualSortPageSize = (scrollElement: HTMLElement | null): number => {
    if (!scrollElement) {
        return 1;
    }

    const firstRow = scrollElement.querySelector<HTMLElement>('.nn-manual-sort-row');
    const rowHeight = firstRow?.getBoundingClientRect().height ?? 0;
    if (rowHeight <= 0) {
        return 1;
    }

    return Math.max(1, Math.floor(scrollElement.clientHeight / rowHeight) - 1);
};

const isManualSortChildControlKeyboardEvent = (event: ReactKeyboardEvent<HTMLDivElement>): boolean => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target === event.currentTarget) {
        return false;
    }

    return target.isContentEditable || target.closest('button, input, textarea, select') !== null;
};

export function useManualSortKeyboard({
    scrollContainerRef,
    files,
    markdownFiles,
    selectedFiles,
    selectedFilePath,
    isSaving,
    onKeyboardSelect,
    onScheduleKeyboardOpen,
    onScheduleKeyboardOpenForFile,
    onCommitKeyboardOpen,
    onReorder
}: UseManualSortKeyboardParams): UseManualSortKeyboardResult {
    const { app, commandQueue, isMobile } = useServices();
    const settings = useSettingsState();
    const selectionState = useSelectionState();
    const selectionDispatch = useSelectionDispatch();
    const openFileInWorkspace = useFileOpener();
    const { handleShiftArrowSelection, selectAll } = useMultiSelection();
    const keyboardScrollPathRef = useRef<string | null>(null);
    const handledSelectionScrollPathRef = useRef<string | null>(null);

    const scrollFilePathIntoView = useCallback(
        (filePath: string) => {
            const scrollElement = scrollContainerRef.current;
            if (!scrollElement) {
                return;
            }

            let selectedElement: HTMLElement | null = null;
            for (const element of scrollElement.querySelectorAll<HTMLElement>('.nn-file')) {
                if (element.dataset.path === filePath) {
                    selectedElement = element;
                    break;
                }
            }
            if (!selectedElement) {
                return;
            }

            const scrollRect = scrollElement.getBoundingClientRect();
            const selectedRect = selectedElement.getBoundingClientRect();
            if (selectedRect.top >= scrollRect.top && selectedRect.bottom <= scrollRect.bottom) {
                return;
            }

            scrollElement.scrollTo({
                top:
                    scrollElement.scrollTop +
                    selectedRect.top -
                    scrollRect.top -
                    Math.max((scrollElement.clientHeight - selectedRect.height) / 2, 0),
                behavior: 'auto'
            });
        },
        [scrollContainerRef]
    );

    const scrollKeyboardTargetIntoView = useCallback(
        (filePath: string) => {
            handledSelectionScrollPathRef.current = filePath;
            scrollFilePathIntoView(filePath);
        },
        [scrollFilePathIntoView]
    );

    useEffect(() => {
        if (!selectedFilePath) {
            return;
        }

        if (handledSelectionScrollPathRef.current === selectedFilePath) {
            handledSelectionScrollPathRef.current = null;
            return;
        }
        handledSelectionScrollPathRef.current = null;

        const frameId = window.requestAnimationFrame(() => {
            scrollFilePathIntoView(selectedFilePath);
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [scrollFilePathIntoView, selectedFilePath]);

    useEffect(() => {
        const scrollPath = keyboardScrollPathRef.current;
        if (!scrollPath) {
            return;
        }

        keyboardScrollPathRef.current = null;
        const frameId = window.requestAnimationFrame(() => {
            scrollFilePathIntoView(scrollPath);
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [files, scrollFilePathIntoView]);

    const selectedFileIndex = useMemo(() => {
        return selectedFilePath ? files.findIndex(file => file.path === selectedFilePath) : -1;
    }, [files, selectedFilePath]);

    const selectFileAtIndex = useCallback(
        (targetIndex: number, options?: { debounceOpen?: boolean }) => {
            const file = files[targetIndex];
            if (!file) {
                return;
            }

            onKeyboardSelect(file, { debounceOpen: options?.debounceOpen });
            scrollKeyboardTargetIntoView(file.path);
        },
        [files, onKeyboardSelect, scrollKeyboardTargetIntoView]
    );

    const selectRangeToIndex = useCallback(
        (targetIndex: number) => {
            const targetFile = files[targetIndex];
            if (!targetFile || !selectionState.selectedFile) {
                return;
            }

            const currentIndex = files.findIndex(file => file.path === selectionState.selectedFile?.path);
            if (currentIndex === -1) {
                selectionDispatch({ type: 'SET_SELECTED_FILE', file: targetFile });
                return;
            }

            const filesInRange = getFilesInRange(files, Math.min(currentIndex, targetIndex), Math.max(currentIndex, targetIndex));
            const { selectedFiles, changed: selectionChanged } = mergeFilesIntoSelection(selectionState.selectedFiles, filesInRange);

            selectionDispatch({
                type: 'APPLY_FILE_SELECTION',
                selectedFiles,
                selectedFile: targetFile,
                lastMovementDirection: selectionChanged ? null : selectionState.lastMovementDirection
            });
            if (!settings.enterToOpenFiles) {
                openFileInWorkspace(targetFile);
            }
            scrollKeyboardTargetIntoView(targetFile.path);
        },
        [
            files,
            openFileInWorkspace,
            scrollKeyboardTargetIntoView,
            selectionDispatch,
            selectionState.selectedFile,
            selectionState.selectedFiles,
            selectionState.lastMovementDirection,
            settings.enterToOpenFiles
        ]
    );

    const handleKeyboardReorder = useCallback(
        (direction: ManualSortMoveDirection): boolean => {
            if (isSaving) {
                return true;
            }

            const activePath = selectedFilePath;
            const result = moveManualSortSelectionByDirection(files, activePath, selectedFiles, direction);
            if (!result) {
                return true;
            }

            const selectedMarkdownPaths = getManualSortSelectedMarkdownPaths(markdownFiles, activePath ?? '', selectedFiles);
            const movedPaths =
                selectedMarkdownPaths.size > 0 ? selectedMarkdownPaths : activePath ? new Set([activePath]) : new Set<string>();
            onReorder({
                nextFiles: result.files,
                movedPaths,
                onApplied: () => {
                    keyboardScrollPathRef.current = result.scrollPath;
                }
            });
            return true;
        },
        [files, isSaving, markdownFiles, onReorder, selectedFilePath, selectedFiles]
    );

    const handleKeyDown = useCallback(
        (event: ReactKeyboardEvent<HTMLDivElement>) => {
            if (isManualSortChildControlKeyboardEvent(event)) {
                return;
            }

            const nativeEvent = event.nativeEvent;
            if (isKeyboardEventContextBlocked(nativeEvent)) {
                return;
            }

            const shortcuts = settings.keyboardShortcuts;
            const currentIndex = selectedFileIndex;
            const hasFiles = files.length > 0;

            if (settings.enterToOpenFiles && isEnterKey(nativeEvent)) {
                const selectedFile = resolvePrimarySelectedFile(app, selectionState);
                if (!selectedFile) {
                    return;
                }

                event.preventDefault();

                const context = resolveKeyboardOpenContext(nativeEvent, settings);
                if (context) {
                    runAsyncAction(() =>
                        openFileInContext({
                            app,
                            commandQueue,
                            file: selectedFile,
                            context,
                            active: false
                        })
                    );
                    return;
                }

                openFileInWorkspace(selectedFile);
                return;
            }

            if (isModifierArrowReorderShortcut(nativeEvent, settings.multiSelectModifier)) {
                const direction = nativeEvent.key === 'ArrowDown' ? 'down' : 'up';
                if (handleKeyboardReorder(direction)) {
                    event.preventDefault();
                    return;
                }
            }

            if (matchesShortcut(nativeEvent, shortcuts, KeyboardShortcutAction.LIST_EXTEND_SELECTION_DOWN)) {
                event.preventDefault();
                if (!isMobile && currentIndex !== -1) {
                    const finalIndex = handleShiftArrowSelection('down', currentIndex, files, {
                        openFile:
                            nativeEvent.key === 'ArrowDown' && onScheduleKeyboardOpenForFile ? onScheduleKeyboardOpenForFile : undefined
                    });
                    if (finalIndex === -1 && nativeEvent.key === 'ArrowDown') {
                        onScheduleKeyboardOpen?.();
                    }
                    if (finalIndex >= 0) {
                        const finalFile = files[finalIndex];
                        if (finalFile) {
                            scrollKeyboardTargetIntoView(finalFile.path);
                        }
                    }
                }
                return;
            }

            if (matchesShortcut(nativeEvent, shortcuts, KeyboardShortcutAction.LIST_EXTEND_SELECTION_UP)) {
                event.preventDefault();
                if (!isMobile && currentIndex !== -1) {
                    const finalIndex = handleShiftArrowSelection('up', currentIndex, files, {
                        openFile: nativeEvent.key === 'ArrowUp' && onScheduleKeyboardOpenForFile ? onScheduleKeyboardOpenForFile : undefined
                    });
                    if (finalIndex === -1 && nativeEvent.key === 'ArrowUp') {
                        onScheduleKeyboardOpen?.();
                    }
                    if (finalIndex >= 0) {
                        const finalFile = files[finalIndex];
                        if (finalFile) {
                            scrollKeyboardTargetIntoView(finalFile.path);
                        }
                    }
                }
                return;
            }

            if (matchesShortcut(nativeEvent, shortcuts, KeyboardShortcutAction.LIST_SELECT_ALL)) {
                event.preventDefault();
                selectAll(files);
                return;
            }

            if (matchesShortcut(nativeEvent, shortcuts, KeyboardShortcutAction.LIST_RANGE_TO_START)) {
                event.preventDefault();
                if (!isMobile && hasFiles) {
                    selectRangeToIndex(0);
                }
                return;
            }

            if (matchesShortcut(nativeEvent, shortcuts, KeyboardShortcutAction.LIST_RANGE_TO_END)) {
                event.preventDefault();
                if (!isMobile && hasFiles) {
                    selectRangeToIndex(files.length - 1);
                }
                return;
            }

            if (matchesShortcut(nativeEvent, shortcuts, KeyboardShortcutAction.PANE_MOVE_DOWN)) {
                event.preventDefault();
                if (!hasFiles) {
                    return;
                }
                const nextIndex = currentIndex === -1 ? 0 : clampManualSortIndex(currentIndex + 1, files);
                if (nextIndex === currentIndex) {
                    if (nativeEvent.key === 'ArrowDown') {
                        onScheduleKeyboardOpen?.();
                    }
                    return;
                }
                selectFileAtIndex(nextIndex, { debounceOpen: nativeEvent.key === 'ArrowDown' });
                return;
            }

            if (matchesShortcut(nativeEvent, shortcuts, KeyboardShortcutAction.PANE_MOVE_UP)) {
                event.preventDefault();
                if (!hasFiles) {
                    return;
                }
                const nextIndex = currentIndex === -1 ? 0 : clampManualSortIndex(currentIndex - 1, files);
                if (nextIndex === currentIndex) {
                    if (nativeEvent.key === 'ArrowUp') {
                        onScheduleKeyboardOpen?.();
                    }
                    return;
                }
                selectFileAtIndex(nextIndex, { debounceOpen: nativeEvent.key === 'ArrowUp' });
                return;
            }

            if (matchesShortcut(nativeEvent, shortcuts, KeyboardShortcutAction.PANE_PAGE_DOWN)) {
                event.preventDefault();
                if (!hasFiles) {
                    return;
                }
                const pageSize = getManualSortPageSize(scrollContainerRef.current);
                const nextIndex = currentIndex === -1 ? 0 : clampManualSortIndex(currentIndex + pageSize, files);
                if (nextIndex === currentIndex) {
                    if (nativeEvent.key === 'PageDown') {
                        onScheduleKeyboardOpen?.();
                    }
                    return;
                }
                selectFileAtIndex(nextIndex, { debounceOpen: nativeEvent.key === 'PageDown' });
                return;
            }

            if (matchesShortcut(nativeEvent, shortcuts, KeyboardShortcutAction.PANE_PAGE_UP)) {
                event.preventDefault();
                if (!hasFiles) {
                    return;
                }
                const pageSize = getManualSortPageSize(scrollContainerRef.current);
                const nextIndex = currentIndex === -1 ? 0 : clampManualSortIndex(currentIndex - pageSize, files);
                if (nextIndex === currentIndex) {
                    if (nativeEvent.key === 'PageUp') {
                        onScheduleKeyboardOpen?.();
                    }
                    return;
                }
                selectFileAtIndex(nextIndex, { debounceOpen: nativeEvent.key === 'PageUp' });
                return;
            }

            if (matchesShortcut(nativeEvent, shortcuts, KeyboardShortcutAction.PANE_HOME)) {
                event.preventDefault();
                if (!hasFiles || currentIndex === 0) {
                    return;
                }
                selectFileAtIndex(0);
                return;
            }

            if (matchesShortcut(nativeEvent, shortcuts, KeyboardShortcutAction.PANE_END)) {
                event.preventDefault();
                if (!hasFiles || currentIndex === files.length - 1) {
                    return;
                }
                selectFileAtIndex(files.length - 1);
            }
        },
        [
            files,
            app,
            commandQueue,
            handleKeyboardReorder,
            handleShiftArrowSelection,
            isMobile,
            onScheduleKeyboardOpen,
            onScheduleKeyboardOpenForFile,
            openFileInWorkspace,
            scrollContainerRef,
            scrollKeyboardTargetIntoView,
            selectFileAtIndex,
            selectRangeToIndex,
            selectAll,
            selectedFileIndex,
            selectionState,
            settings
        ]
    );

    const handleKeyUp = useCallback(
        (event: ReactKeyboardEvent<HTMLDivElement>) => {
            if (isManualSortChildControlKeyboardEvent(event)) {
                return;
            }

            if (!onCommitKeyboardOpen) {
                return;
            }

            const nativeEvent = event.nativeEvent;
            if (isKeyboardEventContextBlocked(nativeEvent)) {
                return;
            }

            if (nativeEvent.ctrlKey || nativeEvent.metaKey || nativeEvent.altKey) {
                return;
            }

            if (
                nativeEvent.key !== 'ArrowUp' &&
                nativeEvent.key !== 'ArrowDown' &&
                nativeEvent.key !== 'PageUp' &&
                nativeEvent.key !== 'PageDown'
            ) {
                return;
            }

            onCommitKeyboardOpen();
        },
        [onCommitKeyboardOpen]
    );

    const focusManualSortScroller = useCallback(() => {
        const scrollElement = scrollContainerRef.current;
        if (!scrollElement) {
            return;
        }

        focusElementPreventScroll(scrollElement);
    }, [scrollContainerRef]);

    useLayoutEffect(() => {
        focusManualSortScroller();
        const frameId = window.requestAnimationFrame(focusManualSortScroller);

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [focusManualSortScroller]);

    return { handleKeyDown, handleKeyUp };
}
