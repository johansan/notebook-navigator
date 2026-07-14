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

import { useCallback, useEffect, useRef } from 'react';
import { useUIState, useUIDispatch } from '../context/UIStateContext';

interface UseSwipeGestureOptions {
    onSwipeRight?: () => void;
    onSwipeLeft?: () => void;
    threshold?: number;
    edgeThreshold?: number;
    enabled?: boolean;
    allowAnywhereSwipe?: boolean;
    isRTL?: boolean;
    shouldIgnoreTouchStart?: (event: TouchEvent) => boolean;
}

function useSwipeGesture(containerRef: React.RefObject<HTMLElement | null>, options: UseSwipeGestureOptions) {
    const {
        onSwipeRight,
        onSwipeLeft,
        threshold = 50,
        edgeThreshold = 25, // Start swipe must be within this many pixels of edge (iOS uses ~20-25px)
        enabled = true,
        allowAnywhereSwipe = false,
        isRTL: optionsIsRTL,
        shouldIgnoreTouchStart
    } = options;
    const isRTL = optionsIsRTL ?? false;

    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const isValidSwipe = useRef<boolean>(false);

    useEffect(() => {
        if (!enabled || !containerRef.current) return;

        const container = containerRef.current;

        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            touchStartX.current = touch.clientX;
            touchStartY.current = touch.clientY;

            const shouldIgnoreSwipe = shouldIgnoreTouchStart?.(e) ?? false;

            // Check if touch started near the edge for edge swipe
            // In RTL mode, check right edge; in LTR mode, check left edge
            const didStartAtAllowedEdge = allowAnywhereSwipe
                ? true
                : isRTL
                  ? touch.clientX >= window.innerWidth - edgeThreshold
                  : touch.clientX <= edgeThreshold;

            isValidSwipe.current = didStartAtAllowedEdge && !shouldIgnoreSwipe;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isValidSwipe.current || touchStartX.current === null || touchStartY.current === null) {
                return;
            }

            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartX.current;
            const deltaY = touch.clientY - touchStartY.current;

            // Only prevent default if the swipe is clearly horizontal
            // This prevents blocking vertical scrolls that start near the edge
            if (Math.abs(deltaX) > Math.abs(deltaY) + 5) {
                // Add a small tolerance
                e.preventDefault();
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (touchStartX.current === null || touchStartY.current === null) return;
            if (!isValidSwipe.current) {
                touchStartX.current = null;
                touchStartY.current = null;
                isValidSwipe.current = false;
                return;
            }

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX.current;
            const deltaY = touchEndY - touchStartY.current;

            // Check if horizontal swipe is more significant than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
                if (deltaX > 0 && onSwipeRight) {
                    onSwipeRight();
                } else if (deltaX < 0 && onSwipeLeft) {
                    onSwipeLeft();
                }
            }

            touchStartX.current = null;
            touchStartY.current = null;
            isValidSwipe.current = false;
        };

        container.addEventListener('touchstart', handleTouchStart);
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [allowAnywhereSwipe, containerRef, onSwipeRight, onSwipeLeft, threshold, edgeThreshold, enabled, isRTL, shouldIgnoreTouchStart]);
}

/**
 * Mobile navigation hook that enables swipe gestures for navigating between views.
 * This replaces the previous useMobileNavigation hook by directly implementing
 * the navigation logic here.
 */
export function useMobileSwipeNavigation(containerRef: React.RefObject<HTMLElement | null>, isMobile: boolean) {
    const uiState = useUIState();
    const uiDispatch = useUIDispatch();

    // Check if RTL mode is active
    const isRTL = activeDocument.body.classList.contains('mod-rtl');
    const allowAnywhereSwipe = true;

    const shouldIgnoreTouchStart = useCallback((event: TouchEvent) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return false;
        }

        return target.closest('.nn-breadcrumb-scroll') !== null;
    }, []);

    const handleSwipeRight = useCallback(() => {
        if (!isRTL) {
            uiDispatch({ type: 'ACTIVATE_PANE', target: 'navigation' });
        }
    }, [isRTL, uiDispatch]);

    const handleSwipeLeft = useCallback(() => {
        if (isRTL) {
            uiDispatch({ type: 'ACTIVATE_PANE', target: 'navigation' });
        }
    }, [isRTL, uiDispatch]);

    const isSwipeEnabled = isMobile && uiState.singlePane && uiState.currentSinglePaneView === 'files';

    useSwipeGesture(containerRef, {
        onSwipeRight: handleSwipeRight,
        onSwipeLeft: handleSwipeLeft,
        enabled: isSwipeEnabled,
        allowAnywhereSwipe,
        shouldIgnoreTouchStart,
        isRTL
    });
}
