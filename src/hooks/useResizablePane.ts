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

// src/hooks/useResizablePane.ts
import { useState, useCallback, useEffect } from 'react';
import { type DualPaneOrientation } from '../types';
import { localStorage } from '../utils/localStorage';
import { getNavigationPaneSizing } from '../utils/paneSizing';
import { usePointerDrag } from './usePointerDrag';

interface UseResizablePaneConfig {
    orientation?: DualPaneOrientation;
    initialSize?: number;
    min?: number;
    storageKey?: string;
    scale?: number;
    paneSide?: 'left' | 'right';
}

interface UseResizablePaneResult {
    paneSize: number;
    isResizing: boolean;
    resizeHandleProps: {
        onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    };
}

/**
 * Custom hook for managing resizable pane width with optional localStorage persistence.
 * Handles pointer events for dragging the resize handle and constrains the width
 * within specified bounds.
 *
 * @param config - Configuration object with initial width, min bound, and storage key
 * @returns Current pane width and props to spread on the resize handle element
 */
export function useResizablePane({
    orientation = 'horizontal',
    initialSize,
    min,
    storageKey,
    scale,
    paneSide = 'left'
}: UseResizablePaneConfig = {}): UseResizablePaneResult {
    // Get default sizing parameters for orientation
    const sizing = getNavigationPaneSizing(orientation);

    // Use provided values or fall back to defaults
    const resolvedInitialSize = typeof initialSize === 'number' ? initialSize : sizing.defaultSize;

    const resolvedMin = typeof min === 'number' ? min : sizing.minSize;

    // Load initial width from localStorage if storage key is provided
    const [paneSize, setPaneSize] = useState(() => {
        if (storageKey) {
            const savedSize = localStorage.get<number>(storageKey);
            if (typeof savedSize === 'number') {
                return Math.max(resolvedMin, savedSize);
            }
        }
        return resolvedInitialSize;
    });

    // Track resizing state
    const [isResizing, setIsResizing] = useState(false);

    const { startPointerDrag } = usePointerDrag();

    const scaleFactor = typeof scale === 'number' && Number.isFinite(scale) && scale > 0 ? scale : 1;

    const handleResizePointerDown = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            if (event.pointerType === 'mouse' && event.button !== 0) {
                return;
            }
            // Capture starting position based on orientation
            const startPosition = orientation === 'horizontal' ? event.clientX : event.clientY;
            const startSize = paneSize;
            let currentSize = startSize;

            // Check if RTL mode is active for horizontal dragging
            const isRTL = orientation === 'horizontal' && document.body.classList.contains('mod-rtl');
            // Set resizing state
            setIsResizing(true);

            event.preventDefault();
            event.stopPropagation();

            startPointerDrag({
                event,
                onMove: (moveEvent: PointerEvent) => {
                    // Calculate position delta based on orientation
                    const currentPosition = orientation === 'horizontal' ? moveEvent.clientX : moveEvent.clientY;
                    let delta = currentPosition - startPosition;
                    // In RTL mode, reverse the delta to make dragging feel natural
                    if (isRTL) {
                        delta = -delta;
                    }
                    // Reverse delta when nav pane is on the right
                    if (orientation === 'horizontal' && paneSide === 'right') {
                        delta = -delta;
                    }
                    const scaledDelta = delta / scaleFactor;
                    currentSize = Math.max(resolvedMin, startSize + scaledDelta);
                    setPaneSize(currentSize);
                },
                onEnd: () => {
                    // Save final width to localStorage on pointer end
                    if (storageKey) {
                        localStorage.set(storageKey, currentSize);
                    }
                    // Clear resizing state
                    setIsResizing(false);
                }
            });
        },
        [orientation, paneSize, paneSide, resolvedMin, scaleFactor, storageKey, startPointerDrag]
    );

    // Reload pane size when orientation changes
    useEffect(() => {
        if (!storageKey) {
            setPaneSize(resolvedInitialSize);
            return;
        }

        const savedSize = localStorage.get<number>(storageKey);
        if (typeof savedSize === 'number') {
            setPaneSize(Math.max(resolvedMin, savedSize));
            return;
        }

        setPaneSize(resolvedInitialSize);
    }, [orientation, resolvedInitialSize, resolvedMin, storageKey]);

    return {
        paneSize,
        isResizing,
        resizeHandleProps: {
            onPointerDown: handleResizePointerDown
        }
    };
}
