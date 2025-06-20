/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025 Johan Sanneblad
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
import { useCallback, useEffect, useRef } from 'react';
import { TFolder, TFile, Notice } from 'obsidian';
import { useServices, useFileSystemOps } from '../context/ServicesContext';
import { isTFolder } from '../utils/typeGuards';
import { getPathFromDataAttribute, getAbstractFileFromElement } from '../utils/domUtils';
import { strings } from '../i18n';

/**
 * Custom hook that enables drag and drop functionality for files and folders.
 * Handles visual feedback, validation, and file system operations.
 * 
 * ## Design Decision: Event Delegation with Data Attributes
 * This hook uses event delegation and data attributes rather than individual React event handlers.
 * While this differs from typical React patterns, it's the optimal choice here because:
 * 
 * 1. **Performance**: One set of listeners on the container vs hundreds on individual items
 * 2. **Memory Efficiency**: Scales well with large vaults containing many files/folders
 * 3. **Dynamic Content**: Works seamlessly as items are added/removed from the DOM
 * 4. **Obsidian Consistency**: Follows patterns used throughout Obsidian's codebase
 * 5. **Simplicity**: Avoids prop drilling drag handlers through multiple component levels
 * 
 * The alternative React approach would require:
 * - Passing drag handlers as props through FolderTree → FolderItem → each nested level
 * - Managing drag state in React state (causing unnecessary re-renders)
 * - Complex coordination between deeply nested components
 * 
 * Data attributes provide a clean, performant way to associate drag data with DOM elements
 * without coupling the drag logic to the component hierarchy.
 * 
 * @param containerRef - React ref to the container element that will handle drag events
 * 
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * useDragAndDrop(containerRef);
 * 
 * return (
 *   <div ref={containerRef}>
 *     <div data-draggable="true" data-drag-path="/path/to/file" data-drag-type="file">
 *       Draggable item
 *     </div>
 *     <div data-drop-zone="folder" data-drop-path="/path/to/folder">
 *       Drop zone
 *     </div>
 *   </div>
 * );
 * ```
 */
export function useDragAndDrop(containerRef: React.RefObject<HTMLElement | null>) {
    const { app, isMobile } = useServices();
    const fileSystemOps = useFileSystemOps();
    const dragOverElement = useRef<HTMLElement | null>(null);

    /**
     * Handles the drag start event.
     * Extracts drag data from data attributes and sets drag effect.
     * 
     * @param e - The drag event
     */
    const handleDragStart = useCallback((e: DragEvent) => {
        const target = e.target as HTMLElement;
        const draggable = target.closest('[data-draggable="true"]');
        if (!draggable) return;

        const path = getPathFromDataAttribute(draggable as HTMLElement, 'data-drag-path');
        const type = draggable.getAttribute('data-drag-type');
        if (path && e.dataTransfer) {
            e.dataTransfer.setData('text/plain', path);
            e.dataTransfer.effectAllowed = 'move';
            draggable.classList.add('nn-dragging');
        }
    }, []);

    /**
     * Handles the drag over event.
     * Provides visual feedback by adding CSS classes to valid drop targets.
     * 
     * @param e - The drag event
     */
    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        const target = e.target as HTMLElement;
        const dropZone = target.closest<HTMLElement>('[data-drop-zone="folder"]');

        if (dragOverElement.current && dragOverElement.current !== dropZone) {
            dragOverElement.current.classList.remove('nn-drag-over');
            dragOverElement.current = null;
        }

        if (dropZone) {
            dropZone.classList.add('nn-drag-over');
            dragOverElement.current = dropZone;
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        }
    }, []);

    /**
     * Handles the drop event.
     * Validates the drop and performs the file/folder move operation.
     * 
     * @param e - The drag event
     */
    const handleDrop = useCallback(async (e: DragEvent) => {
        e.preventDefault();
        if (dragOverElement.current) {
            dragOverElement.current.classList.remove('nn-drag-over');
        }

        const targetPath = getPathFromDataAttribute(dragOverElement.current, 'data-drop-path');
        const sourcePath = e.dataTransfer?.getData('text/plain');

        if (!sourcePath || !targetPath) return;

        const sourceItem = app.vault.getAbstractFileByPath(sourcePath);
        const targetFolder = app.vault.getAbstractFileByPath(targetPath);

        if (!sourceItem || !isTFolder(targetFolder)) return;

        // Prevent dropping a folder into itself or its own children
        if (sourceItem.path === targetFolder.path || (sourceItem instanceof TFolder && fileSystemOps.isDescendant(sourceItem, targetFolder))) {
            new Notice(strings.dragDrop.errors.cannotMoveIntoSelf, 2000);
            return;
        }
        
        const newPath = `${targetFolder.path}/${sourceItem.name}`;
        if (app.vault.getAbstractFileByPath(newPath)) {
            new Notice(strings.dragDrop.errors.itemAlreadyExists.replace('{name}', sourceItem.name), 2000);
            return;
        }

        try {
            await app.fileManager.renameFile(sourceItem, newPath);
            // The file move will trigger Obsidian's file events, which will update
            // the state naturally through proper event handling
        } catch (error) {
            new Notice(strings.dragDrop.errors.failedToMove.replace('{error}', error.message));
        }
    }, [app, fileSystemOps]);
    
    /**
     * Handles the drag leave event.
     * Removes drag-over styling when leaving a drop zone.
     * 
     * @param e - The drag event
     */
    const handleDragLeave = useCallback((e: DragEvent) => {
        const target = e.target as HTMLElement;
        const dropZone = target.closest('[data-drop-zone]') as HTMLElement;
        if (dropZone && dropZone === dragOverElement.current) {
            // Only remove if we're actually leaving the drop zone, not just moving to a child
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (!dropZone.contains(relatedTarget)) {
                dropZone.classList.remove('nn-drag-over');
                dragOverElement.current = null;
            }
        }
    }, []);
    
    /**
     * Handles the drag end event.
     * Cleans up drag-related CSS classes.
     * 
     * @param e - The drag event
     */
    const handleDragEnd = useCallback((e: DragEvent) => {
        const target = e.target as HTMLElement;
        const draggable = target.closest('[data-draggable="true"]');
        draggable?.classList.remove('nn-dragging');
        if (dragOverElement.current) {
            dragOverElement.current.classList.remove('nn-drag-over');
            dragOverElement.current = null;
        }
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || isMobile) return;

        container.addEventListener('dragstart', handleDragStart);
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('dragleave', handleDragLeave);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragend', handleDragEnd);

        return () => {
            container.removeEventListener('dragstart', handleDragStart);
            container.removeEventListener('dragover', handleDragOver);
            container.removeEventListener('dragleave', handleDragLeave);
            container.removeEventListener('drop', handleDrop);
            container.removeEventListener('dragend', handleDragEnd);
        };
    }, [containerRef, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd, isMobile]);
}