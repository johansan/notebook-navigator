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

// src/utils/domUtils.ts

/**
 * Gets the path from a DOM element with a specific data attribute.
 * Useful for drag and drop operations that use different data attributes.
 *
 * @param element - The DOM element to check
 * @param attribute - The data attribute name (e.g., 'data-drag-path')
 * @returns The path string if found, null otherwise
 */
export function getPathFromDataAttribute(element: HTMLElement | null, attribute: string): string | null {
    return element?.getAttribute(attribute) ?? null;
}

/**
 * Checks if the user is currently typing in an input field.
 * Used to prevent keyboard shortcuts from firing while typing.
 *
 * @param e - The keyboard event
 * @returns True if typing in an input field, false otherwise
 */
function isTypingInInput(e: KeyboardEvent): boolean {
    const target = e.target;
    if (!(target instanceof HTMLElement)) {
        // Events from non-HTMLElement targets are treated as non-typing contexts.
        return false;
    }
    // Input/textarea/contenteditable elements own text-entry keyboard behavior.
    return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

/**
 * Checks whether keyboard handling should be ignored for this event context.
 * Blocks shortcuts while typing or when a modal currently has focus.
 *
 * @param e - The keyboard event
 * @returns True when pane keyboard handlers should ignore the event
 */
export function isKeyboardEventContextBlocked(e: KeyboardEvent): boolean {
    if (isTypingInInput(e)) {
        // Never run pane keyboard shortcuts while typing in editable controls.
        return true;
    }

    if (typeof document === 'undefined') {
        // Non-DOM environments cannot have modal focus; treat as unblocked.
        return false;
    }

    const activeElement = activeDocument.activeElement;
    // Obsidian modals should receive keyboard input without pane interception.
    return activeElement?.instanceOf(HTMLElement) === true && activeElement.closest('.modal-container') !== null;
}

/**
 * Focuses an element without scrolling it into view when supported.
 * On desktop (Electron/Chromium), focusing can trigger implicit scroll-into-view behavior.
 * During single-pane pane transitions (translateX), that can cause horizontal overscroll/bounce.
 */
export function focusElementPreventScroll(element: HTMLElement): void {
    try {
        element.focus({ preventScroll: true });
    } catch {
        element.focus();
    }
}

export function getTooltipPlacement(): 'left' | 'right' {
    if (typeof document === 'undefined' || !activeDocument.body) {
        return 'right';
    }
    return activeDocument.body.classList.contains('mod-rtl') ? 'left' : 'right';
}
