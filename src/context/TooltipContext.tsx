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

import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Custom hover tooltip for navigator item rows. Replicates the timing, placement, and
 * appearance of the built-in Obsidian tooltip while accepting arbitrary React content,
 * which the string-only `setTooltip` API cannot render.
 */

/** Delay before a tooltip appears on first hover, matching the built-in Obsidian tooltip delay. */
const SHOW_DELAY_MS = 1000;
/**
 * A tooltip requested within this window after the previous one hid is shown without delay.
 * This matches the built-in behavior where sweeping the pointer across rows keeps the
 * tooltip up instantly while the first hover waits for the full delay.
 */
const INSTANT_SHOW_WINDOW_MS = 100;
/** Distance between the anchor edge and the tooltip, matching the built-in tooltip gap. */
const ANCHOR_GAP = 8;
/** Minimum distance kept between the tooltip and the window edges. */
const EDGE_MARGIN = 8;

type TooltipPlacement = 'left' | 'right';

interface TooltipContextValue {
    /**
     * Requests the tooltip for an anchor element. First-time hovers show after the standard
     * delay; requests inside the instant window (or for the already active anchor) apply
     * immediately. Re-invoking for the active anchor refreshes its content in place.
     */
    showTooltip: (anchor: HTMLElement, content: React.ReactNode) => void;
    /**
     * Replaces the content of the tooltip for an anchor when that anchor is currently shown
     * or pending. Does nothing for other anchors, so rows can call it on every data change
     * without affecting tooltip visibility.
     */
    updateTooltip: (anchor: HTMLElement, content: React.ReactNode) => void;
    /** Hides the tooltip for an anchor and cancels a pending show for it. */
    hideTooltip: (anchor: HTMLElement) => void;
}

interface ActiveTooltip {
    anchor: HTMLElement;
    content: React.ReactNode;
    /** Increments per shown anchor so every tooltip starts from a deterministic DOM element. */
    key: number;
    /** The first tooltip after the full delay uses the native pop animation; instant handoffs do not. */
    animate: boolean;
}

interface PendingTooltip {
    anchor: HTMLElement;
    content: React.ReactNode;
    timeout: number;
    /** Removes dismissal listeners installed before the delayed tooltip becomes active. */
    removeDismissListeners: () => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltip(): TooltipContextValue {
    const context = useContext(TooltipContext);
    if (!context) {
        throw new Error('useTooltip must be used within TooltipProvider');
    }
    return context;
}

/**
 * Returns whether a hover event target sits inside a row descendant that carries its own
 * native tooltip (an `aria-label` attribute, as set by `setTooltip`). Rows hide their custom
 * tooltip for those targets so only the innermost labelled element's tooltip is visible,
 * mirroring how the built-in delegation resolves nested labelled elements.
 */
export function isInsideNativeTooltipTarget(row: HTMLElement, target: EventTarget | null): boolean {
    // Resolve constructors through the row's own window so the check works in popout windows,
    // where elements are not instances of the main window's Element.
    const win = row.ownerDocument.defaultView;
    if (!win || !(target instanceof win.Element)) {
        return false;
    }
    const labelled = target.closest('[aria-label]');
    return labelled !== null && labelled !== row && row.contains(labelled);
}

/** Reads the preferred placement from the anchor's document so RTL popout windows place correctly. */
function getPreferredPlacement(doc: Document): TooltipPlacement {
    return doc.body.classList.contains('mod-rtl') ? 'left' : 'right';
}

interface TooltipHostProps {
    active: ActiveTooltip;
    /** Called when the anchor left the DOM (virtualized row unmounted) so the provider can hide. */
    onAnchorDisconnected: () => void;
}

function TooltipHost({ active, onAnchorDisconnected }: TooltipHostProps) {
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const [style, setStyle] = useState<React.CSSProperties | null>(null);
    const [placement, setPlacement] = useState<TooltipPlacement>(() => getPreferredPlacement(active.anchor.ownerDocument));

    const updatePosition = useCallback(() => {
        const tooltipElement = tooltipRef.current;
        if (!tooltipElement) {
            return;
        }

        const anchor = active.anchor;
        if (!anchor.isConnected) {
            onAnchorDisconnected();
            return;
        }

        const win = anchor.ownerDocument.defaultView;
        if (!win) {
            return;
        }

        const rect = anchor.getBoundingClientRect();
        const tooltipWidth = tooltipElement.offsetWidth;
        const tooltipHeight = tooltipElement.offsetHeight;

        // Vertical center on the anchor; the CSS transform translates the tooltip up by half
        // its height. Clamp so the tooltip stays fully inside the window.
        const halfHeight = tooltipHeight / 2;
        const rawCenterY = rect.top + rect.height / 2;
        const minCenterY = EDGE_MARGIN + halfHeight;
        const maxCenterY = win.innerHeight - EDGE_MARGIN - halfHeight;
        const centerY = maxCenterY >= minCenterY ? Math.min(Math.max(rawCenterY, minCenterY), maxCenterY) : rawCenterY;

        // Prefer the RTL-aware side but flip when the tooltip does not fit, unlike the
        // built-in tooltip which lets the preferred side overflow.
        const preferred = getPreferredPlacement(anchor.ownerDocument);
        const requiredWidth = tooltipWidth + ANCHOR_GAP;
        const fitsRight = win.innerWidth - rect.right - EDGE_MARGIN >= requiredWidth;
        const fitsLeft = rect.left - EDGE_MARGIN >= requiredWidth;

        let nextPlacement: TooltipPlacement = preferred;
        if (preferred === 'right' && !fitsRight && fitsLeft) {
            nextPlacement = 'left';
        } else if (preferred === 'left' && !fitsLeft && fitsRight) {
            nextPlacement = 'right';
        }

        let left = nextPlacement === 'right' ? rect.right + ANCHOR_GAP : rect.left - ANCHOR_GAP - tooltipWidth;
        const minLeft = EDGE_MARGIN;
        const maxLeft = win.innerWidth - EDGE_MARGIN - tooltipWidth;
        if (maxLeft >= minLeft) {
            left = Math.min(Math.max(left, minLeft), maxLeft);
        }

        setPlacement(nextPlacement);
        setStyle({ top: centerY, left, visibility: 'visible' });
    }, [active, onAnchorDisconnected]);

    // Measure and place after the tooltip content is in the DOM. Reruns when the content
    // changes because `active` identity changes on every content update.
    useLayoutEffect(() => {
        updatePosition();
    }, [updatePosition]);

    // Follow the anchor while the list scrolls or the window resizes. The capture-phase scroll
    // listener sees scroll events from the nested pane scrollers.
    useEffect(() => {
        const win = active.anchor.ownerDocument.defaultView;
        if (!win) {
            return;
        }

        let frameId: number | null = null;
        const schedulePositionUpdate = () => {
            if (frameId !== null) {
                return;
            }
            frameId = win.requestAnimationFrame(() => {
                frameId = null;
                updatePosition();
            });
        };

        win.addEventListener('resize', schedulePositionUpdate);
        win.addEventListener('scroll', schedulePositionUpdate, true);

        return () => {
            if (frameId !== null) {
                win.cancelAnimationFrame(frameId);
            }
            win.removeEventListener('resize', schedulePositionUpdate);
            win.removeEventListener('scroll', schedulePositionUpdate, true);
        };
    }, [active, updatePosition]);

    return createPortal(
        <div
            // Remount per anchor, but skip the pop animation during dense row-to-row handoffs.
            key={active.key}
            ref={tooltipRef}
            className="nn-tooltip"
            data-placement={placement}
            data-instant={active.animate ? undefined : 'true'}
            style={style ?? { top: 0, left: 0, visibility: 'hidden' }}
            role="tooltip"
        >
            {active.content}
            <div className="nn-tooltip-arrow" />
        </div>,
        active.anchor.ownerDocument.body
    );
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
    const [active, setActive] = useState<ActiveTooltip | null>(null);
    const activeRef = useRef<ActiveTooltip | null>(null);
    const pendingRef = useRef<PendingTooltip | null>(null);
    // Timestamp of the last hide; shows within INSTANT_SHOW_WINDOW_MS of it skip the delay.
    const lastHideRef = useRef(0);
    const keyRef = useRef(0);

    const clearPending = useCallback(() => {
        const pending = pendingRef.current;
        if (pending) {
            pendingRef.current = null;
            window.clearTimeout(pending.timeout);
            pending.removeDismissListeners();
        }
    }, []);

    const hideActive = useCallback(() => {
        if (activeRef.current) {
            lastHideRef.current = Date.now();
            activeRef.current = null;
            setActive(null);
        }
    }, []);

    const dismissTooltip = useCallback(() => {
        clearPending();
        hideActive();
    }, [clearPending, hideActive]);

    const displayNow = useCallback((anchor: HTMLElement, content: React.ReactNode, animate: boolean) => {
        keyRef.current += 1;
        const next: ActiveTooltip = { anchor, content, key: keyRef.current, animate };
        activeRef.current = next;
        setActive(next);
    }, []);

    const showTooltip = useCallback(
        (anchor: HTMLElement, content: React.ReactNode) => {
            const current = activeRef.current;
            if (current && current.anchor === anchor) {
                // Hover events refire while crossing child boundaries; refresh content in place
                // without restarting the animation.
                if (current.content !== content) {
                    const next: ActiveTooltip = { ...current, content };
                    activeRef.current = next;
                    setActive(next);
                }
                return;
            }

            const pending = pendingRef.current;
            if (pending && pending.anchor === anchor) {
                pending.content = content;
                return;
            }

            clearPending();
            // Instant only when no tooltip is visible and one hid moments ago; otherwise the
            // full delay applies, matching the built-in tooltip timing.
            const instant = current === null && Date.now() <= lastHideRef.current + INSTANT_SHOW_WINDOW_MS;
            if (instant) {
                displayNow(anchor, content, false);
                return;
            }

            // Dismissal listeners must exist during the delay because pointerup and dragstart
            // can suppress mouseleave before the scheduled tooltip has become active.
            const doc = anchor.ownerDocument;
            const dismissPending = () => {
                dismissTooltip();
            };
            const removeDismissListeners = () => {
                doc.removeEventListener('pointerup', dismissPending, true);
                doc.removeEventListener('dragstart', dismissPending, true);
            };
            const timeout = window.setTimeout(() => {
                const scheduled = pendingRef.current;
                // A cleared timeout may already be queued. It must not consume a newer request.
                if (!scheduled || scheduled.anchor !== anchor || scheduled.timeout !== timeout) {
                    return;
                }
                pendingRef.current = null;
                scheduled.removeDismissListeners();
                displayNow(scheduled.anchor, scheduled.content, true);
            }, SHOW_DELAY_MS);
            pendingRef.current = { anchor, content, timeout, removeDismissListeners };
            doc.addEventListener('pointerup', dismissPending, true);
            doc.addEventListener('dragstart', dismissPending, true);
        },
        [clearPending, dismissTooltip, displayNow]
    );

    const updateTooltip = useCallback((anchor: HTMLElement, content: React.ReactNode) => {
        const current = activeRef.current;
        if (current && current.anchor === anchor) {
            if (current.content !== content) {
                const next: ActiveTooltip = { ...current, content };
                activeRef.current = next;
                setActive(next);
            }
            return;
        }

        const pending = pendingRef.current;
        if (pending && pending.anchor === anchor) {
            pending.content = content;
        }
    }, []);

    const hideTooltip = useCallback(
        (anchor: HTMLElement) => {
            const pending = pendingRef.current;
            if (pending && pending.anchor === anchor) {
                clearPending();
            }
            const current = activeRef.current;
            if (current && current.anchor === anchor) {
                hideActive();
            }
        },
        [clearPending, hideActive]
    );

    // The built-in tooltip hides on any pointer release; dragging must also dismiss because
    // mouse events are suppressed for the drag duration and mouseleave never fires.
    useEffect(() => {
        if (!active) {
            return;
        }

        const doc = active.anchor.ownerDocument;
        doc.addEventListener('pointerup', dismissTooltip, true);
        doc.addEventListener('dragstart', dismissTooltip, true);

        return () => {
            doc.removeEventListener('pointerup', dismissTooltip, true);
            doc.removeEventListener('dragstart', dismissTooltip, true);
        };
    }, [active, dismissTooltip]);

    // Cancel a pending show when the provider unmounts (view closed).
    useEffect(() => {
        return () => {
            clearPending();
        };
    }, [clearPending]);

    const handleAnchorDisconnected = useCallback(() => {
        hideActive();
    }, [hideActive]);

    const contextValue = React.useMemo(() => ({ showTooltip, updateTooltip, hideTooltip }), [showTooltip, updateTooltip, hideTooltip]);

    return (
        <TooltipContext.Provider value={contextValue}>
            {children}
            {active ? <TooltipHost active={active} onAnchorDisconnected={handleAnchorDisconnected} /> : null}
        </TooltipContext.Provider>
    );
}
