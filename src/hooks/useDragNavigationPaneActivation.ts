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

// src/hooks/useDragNavigationPaneActivation.ts
import { useEffect, useRef } from 'react';
import { DRAG_AUTO_EXPAND_DELAY } from './useDragAndDrop';
import { hasPotentialObsidianFileDragType } from '../utils/dragData';

// Pixels from left edge that trigger navigation pane activation
const EDGE_ACTIVATION_THRESHOLD = 32;
const NAVIGATION_TOGGLE_SELECTOR = '[data-pane-toggle="navigation"]';

interface DragNavigationPaneActivationOptions {
    containerRef: React.RefObject<HTMLElement | null>;
    isMobile: boolean;
    isSinglePane: boolean;
    isFilesView: boolean;
    onActivateNavigation: () => void;
    onRestoreFiles: () => void;
}

// Checks if a drag event's coordinates fall within a given rectangle
function isWithinRect(event: DragEvent, rect: DOMRect | null): boolean {
    if (!rect) {
        return false;
    }

    return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
}

// Determines if the drag event contains Obsidian file data
function isEligibleFileDrag(event: DragEvent): boolean {
    return hasPotentialObsidianFileDragType(event.dataTransfer?.types);
}

/**
 * Automatically switches to navigation pane during drag operations in single-pane mode.
 * When dragging files near the left edge or over the navigation button, temporarily
 * shows the navigation pane to allow dropping files into folders.
 */
export function useDragNavigationPaneActivation({
    containerRef,
    isMobile,
    isSinglePane,
    isFilesView,
    onActivateNavigation,
    onRestoreFiles
}: DragNavigationPaneActivationOptions) {
    const activationTimeoutRef = useRef<number | null>(null);
    const navigationActivatedRef = useRef(false);
    const dragActiveRef = useRef(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || isMobile) {
            return;
        }
        const ownerDocument = container.ownerDocument;

        const clearActivationTimeout = () => {
            if (activationTimeoutRef.current !== null) {
                window.clearTimeout(activationTimeoutRef.current);
                activationTimeoutRef.current = null;
            }
        };

        const scheduleNavigationActivation = () => {
            if (activationTimeoutRef.current !== null || navigationActivatedRef.current) {
                return;
            }

            activationTimeoutRef.current = window.setTimeout(() => {
                activationTimeoutRef.current = null;

                if (!dragActiveRef.current) {
                    return;
                }

                if (!isSinglePane || !isFilesView) {
                    return;
                }

                navigationActivatedRef.current = true;
                onActivateNavigation();
            }, DRAG_AUTO_EXPAND_DELAY);
        };

        // Checks if drag is in activation zone (left edge or nav button)
        const isInActivationZone = (event: DragEvent): boolean => {
            const containerRect = container.getBoundingClientRect();
            const edgeLimit = containerRect.left + EDGE_ACTIVATION_THRESHOLD;

            if (event.clientX <= edgeLimit) {
                return true;
            }

            const navigationToggle = container.querySelector<HTMLElement>(NAVIGATION_TOGGLE_SELECTOR);
            if (!navigationToggle) {
                return false;
            }

            return isWithinRect(event, navigationToggle.getBoundingClientRect());
        };

        const handleDragStart = () => {
            dragActiveRef.current = true;
            navigationActivatedRef.current = false;
            clearActivationTimeout();
        };

        const handleDragOver = (event: DragEvent) => {
            if (!isEligibleFileDrag(event)) {
                return;
            }

            dragActiveRef.current = true;

            if (!isSinglePane || !isFilesView) {
                clearActivationTimeout();
                return;
            }

            if (isInActivationZone(event)) {
                scheduleNavigationActivation();
            } else if (!navigationActivatedRef.current) {
                clearActivationTimeout();
            }
        };

        const handleDragLeave = (event: DragEvent) => {
            if (!isEligibleFileDrag(event)) {
                return;
            }

            const nextTarget = event.relatedTarget;
            if (nextTarget instanceof Node && container.contains(nextTarget)) {
                return;
            }

            const rect = container.getBoundingClientRect();
            const isInsideContainer =
                event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
            if (isInsideContainer) {
                return;
            }

            dragActiveRef.current = false;
            clearActivationTimeout();

            if (navigationActivatedRef.current) {
                navigationActivatedRef.current = false;
                onRestoreFiles();
            }
        };

        const handleDragEnd = () => {
            dragActiveRef.current = false;

            clearActivationTimeout();

            if (navigationActivatedRef.current) {
                navigationActivatedRef.current = false;
                onRestoreFiles();
            }
        };

        const handleDrop = () => {
            handleDragEnd();
        };

        container.addEventListener('dragstart', handleDragStart);
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('dragleave', handleDragLeave);
        container.addEventListener('dragend', handleDragEnd);
        container.addEventListener('drop', handleDrop);

        ownerDocument.addEventListener('dragend', handleDragEnd);
        ownerDocument.addEventListener('drop', handleDragEnd);

        return () => {
            clearActivationTimeout();
            container.removeEventListener('dragstart', handleDragStart);
            container.removeEventListener('dragover', handleDragOver);
            container.removeEventListener('dragleave', handleDragLeave);
            container.removeEventListener('dragend', handleDragEnd);
            container.removeEventListener('drop', handleDrop);
            ownerDocument.removeEventListener('dragend', handleDragEnd);
            ownerDocument.removeEventListener('drop', handleDragEnd);
        };
    }, [containerRef, isMobile, isSinglePane, isFilesView, onActivateNavigation, onRestoreFiles]);
}
