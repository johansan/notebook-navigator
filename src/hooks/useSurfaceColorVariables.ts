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
import type { App, EventRef } from 'obsidian';
import {
    colorsEqual,
    compositeWithBase,
    createSolidBackgroundResolver,
    parseCssColor,
    releaseColorResolver,
    type RGBA,
    type SolidBackgroundResolver
} from '../utils/colorUtils';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Defines a mapping from a source CSS variable (semi-transparent) to a target
 * CSS variable (pre-composited surface color).
 *
 * Example:
 *   source: '--nn-theme-navitem-selected-bg' (rgba(100, 150, 200, 0.2))
 *   target: '--nn-computed-navitem-selected-bg' (rgb(44, 54, 64))
 */
export interface SurfaceVariableMapping {
    source: string;
    target: string;
}

interface UseSurfaceColorVariablesOptions {
    app: App | null | undefined;
    rootContainerRef: React.RefObject<HTMLElement | null>;
    variables: SurfaceVariableMapping[];
    /** Caller-owned color state that requires a new solid-background resolver when its identity changes. */
    solidBackgroundRevision?: unknown;
}

type MutationUnsubscribe = () => void;

interface SurfaceColorVariablesResult {
    /** Resolves transparent colors against the current surface generation. */
    getSolidBackground: SolidBackgroundResolver;
}

// ============================================================================
// Shared Body Mutation Observer
// ============================================================================
// Multiple hook instances need to watch for theme changes on document.body.
// Instead of creating one MutationObserver per instance, we use a single
// shared observer and maintain a Set of listeners for efficiency.

/** MutationObserver configuration for monitoring body element changes. */
const BODY_ATTRIBUTE_FILTER: MutationObserverInit = {
    attributes: true,
    attributeFilter: ['class', 'style', 'data-theme'] // Theme changes often modify these
};

// Global state for the shared observer pattern
const bodyMutationListeners = new Set<() => void>();
let sharedBodyObserver: MutationObserver | null = null;

/**
 * Subscribes to body element mutations with a shared MutationObserver instance.
 * Multiple subscribers share a single MutationObserver for efficiency.
 *
 * @param callback - Function to call when body attributes change
 * @returns Unsubscribe function to remove the listener
 */
function subscribeToBodyMutations(callback: () => void): MutationUnsubscribe {
    if (!activeDocument?.body) {
        return () => undefined;
    }

    // Lazy initialization: create observer when first listener subscribes
    if (!sharedBodyObserver) {
        sharedBodyObserver = new MutationObserver(() => {
            // Notify all registered listeners
            bodyMutationListeners.forEach(listener => listener());
        });
        sharedBodyObserver.observe(activeDocument.body, BODY_ATTRIBUTE_FILTER);
    }

    // Register this callback
    bodyMutationListeners.add(callback);

    // Return cleanup function
    return () => {
        bodyMutationListeners.delete(callback);
        // Cleanup: disconnect observer when no listeners remain
        if (bodyMutationListeners.size === 0 && sharedBodyObserver) {
            sharedBodyObserver.disconnect();
            sharedBodyObserver = null;
        }
    };
}

// ============================================================================
// Container Attribute Observer
// ============================================================================

/**
 * Observes attribute changes on a container element, invoking the listener on mutations.
 * This watches the root container for class/style changes that might affect theming.
 *
 * @param container - The element to observe (null if not yet mounted)
 * @param listener - Callback to invoke when attributes change
 * @returns Object containing the observer instance (for cleanup) and optional RAF id
 */
function observeContainerAttributes(
    container: HTMLElement | null,
    listener: () => void
): { observer: MutationObserver | null; rafId: number | null } {
    if (!container) {
        // Container not yet available - schedule listener for next frame
        const rafId = window.requestAnimationFrame(() => listener());
        return { observer: null, rafId };
    }

    // Create observer for this specific container
    const observer = new MutationObserver(listener);
    observer.observe(container, { attributes: true, attributeFilter: ['class', 'style'] });
    return { observer, rafId: null };
}

// ============================================================================
// Main Hook: useSurfaceColorVariables
// ============================================================================

/**
 * Hook that computes solid background colors by blending semi-transparent theme colors with the pane's surface color.
 * This solves the "hairline artifacts" problem that occurs when using semi-transparent backgrounds.
 *
 * How it works:
 * 1. Reads the pane's background color (the "surface color")
 * 2. For each variable mapping, reads the source CSS variable (e.g., a semi-transparent theme color)
 * 3. Composites (blends) the theme color onto the surface color to create a solid color
 * 4. Sets the target CSS variable to this pre-composited solid color
 * 5. Watches for theme changes and updates all colors automatically
 *
 * Why this prevents hairlines:
 * - Semi-transparent backgrounds can create visible gaps between items due to rounding errors
 * - Solid colors eliminate these artifacts while maintaining the same visual appearance
 * - Each item uses the exact same solid color, ensuring perfect alignment
 *
 * @param paneRef - Reference to the pane element (NavigationPane or ListPane)
 * @param options - Configuration including app instance, root container, and variable mappings
 * @returns A generation-scoped solid-background resolver
 */
export function useSurfaceColorVariables(
    paneRef: React.RefObject<HTMLElement | null>,
    options: UseSurfaceColorVariablesOptions
): SurfaceColorVariablesResult {
    const { app, rootContainerRef, solidBackgroundRevision, variables } = options;

    // State: Current pane background color
    const [surfaceColor, setSurfaceColor] = useState<RGBA | null>(null);

    // State: Version number that advances the resolver generation when mapped colors change
    // without producing a different surface color.
    const [version, setVersion] = useState(0);

    // Memoize the variable mappings array to prevent unnecessary re-renders
    const variableMappings = useMemo(() => variables.slice(), [variables]);

    // The cache belongs to the resolver created for this render generation. Replacing the resolver
    // here clears stale composites before descendants render and gives memoized rows a new callback.
    const getSolidBackground = useMemo(() => {
        void solidBackgroundRevision;
        void version;
        return createSolidBackgroundResolver(surfaceColor, () => paneRef.current);
    }, [paneRef, solidBackgroundRevision, surfaceColor, version]);

    // Main effect: Set up color monitoring and updating
    useEffect(() => {
        const paneNode = paneRef.current;
        if (!paneNode) {
            return undefined;
        }

        let isDisposed = false;

        /**
         * Core update function: Reads the pane background color and updates all mapped
         * CSS variables with pre-composited solid colors.
         *
         * This function is called whenever:
         * - Component mounts (via RAF)
         * - Theme changes (via body mutations or css-change event)
         * - Root container attributes change (via container observer)
         */
        const updateSurfaceColors = () => {
            if (isDisposed) {
                return;
            }
            const node = paneRef.current;
            if (!node) {
                return;
            }

            // Step 1: Read the pane's current background color
            const computed = window.getComputedStyle(node);
            const baseColor = parseCssColor(computed.backgroundColor, { container: node });

            // Step 2: Update surface color state if it changed
            let surfaceColorChanged = false;
            setSurfaceColor(previous => {
                // Use color comparison with epsilon tolerance to avoid unnecessary updates
                if (colorsEqual(previous, baseColor)) {
                    return previous; // No change, keep previous reference
                }
                surfaceColorChanged = true;
                return baseColor;
            });

            // Step 3: Update each CSS variable mapping
            let variablesChanged = false;
            for (const mapping of variableMappings) {
                // Read the source variable value (e.g., "--nn-theme-navitem-selected-bg")
                const sourceValue = computed.getPropertyValue(mapping.source);

                // Composite the source color onto the base color to get a solid color
                const solidValue = compositeWithBase(baseColor, sourceValue, { container: node });

                // Get the current value of the target variable (if any)
                const current = node.style.getPropertyValue(mapping.target);

                // Update the target variable if needed
                if (solidValue) {
                    // We have a solid color - set it if different from current
                    if (current !== solidValue) {
                        node.style.setProperty(mapping.target, solidValue);
                        variablesChanged = true;
                    }
                } else if (current) {
                    // No solid color (parsing failed or base transparent) - remove target variable if set
                    node.style.removeProperty(mapping.target);
                    variablesChanged = true;
                }
            }

            // Step 4: Increment version if anything changed
            // This signals to consumers that they should invalidate their caches
            if (surfaceColorChanged || variablesChanged) {
                setVersion(previous => previous + 1);
            }
        };

        // Run initial update (both immediate and on next frame for timing)
        const rafId = window.requestAnimationFrame(updateSurfaceColors);
        updateSurfaceColors();

        // ========================================================================
        // Set up change detection from multiple sources
        // ========================================================================

        let containerObserver: MutationObserver | null = null;
        let containerObserverRaf: number | null = null;

        /**
         * Ensures the root container observer is initialized.
         * Retries via RAF if container is not yet available (async mounting).
         */
        const ensureContainerObserver = () => {
            if (containerObserver) {
                return; // Already initialized
            }
            const container = rootContainerRef.current;
            if (!container) {
                // Container not ready yet - retry on next frame
                containerObserverRaf = window.requestAnimationFrame(ensureContainerObserver);
                return;
            }
            // Container is ready - set up observer
            const result = observeContainerAttributes(container, updateSurfaceColors);
            containerObserver = result.observer;
            containerObserverRaf = result.rafId;
        };

        // 1. Watch root container for class/style changes (e.g., theme switching)
        ensureContainerObserver();

        // 2. Watch document.body for global theme changes
        const unsubscribeBody = subscribeToBodyMutations(updateSurfaceColors);

        // 3. Watch Obsidian's CSS change event (fired when snippets/themes change)
        let cssChangeRef: EventRef | null = null;
        if (app?.workspace) {
            cssChangeRef = app.workspace.on('css-change', updateSurfaceColors);
        }

        // ========================================================================
        // Cleanup function
        // ========================================================================
        return () => {
            // Mark as disposed to prevent updates during cleanup
            isDisposed = true;

            // Cancel pending animation frames
            cancelAnimationFrame(rafId);
            if (containerObserverRaf !== null) {
                cancelAnimationFrame(containerObserverRaf);
            }

            // Disconnect observers
            if (containerObserver) {
                containerObserver.disconnect();
            }
            unsubscribeBody();

            // Remove Obsidian event listener
            if (cssChangeRef) {
                app?.workspace?.offref(cssChangeRef);
            }

            // Clean up color resolver element
            if (paneNode) {
                releaseColorResolver(paneNode);
            }
        };
    }, [app, paneRef, rootContainerRef, variableMappings]);

    return { getSolidBackground };
}
