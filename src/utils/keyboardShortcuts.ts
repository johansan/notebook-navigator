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

import { Platform, type Hotkey, type Modifier } from 'obsidian';
import { isRecord } from './typeGuards';

/**
 * Enum-like object defining all keyboard shortcut actions
 */
export const KeyboardShortcutAction = {
    PANE_MOVE_UP: 'pane:move-up',
    PANE_MOVE_DOWN: 'pane:move-down',
    PANE_PAGE_UP: 'pane:page-up',
    PANE_PAGE_DOWN: 'pane:page-down',
    PANE_HOME: 'pane:home',
    PANE_END: 'pane:end',
    PANE_RENAME: 'pane:rename',
    NAV_COLLAPSE_OR_PARENT: 'navigation:collapse-or-parent',
    NAV_EXPAND_OR_FOCUS_LIST: 'navigation:expand-or-focus-list',
    NAV_FOCUS_LIST: 'navigation:focus-list',
    DELETE_SELECTED: 'pane:delete-selected',
    LIST_FOCUS_NAVIGATION: 'list:focus-navigation',
    LIST_FOCUS_EDITOR: 'list:focus-editor',
    LIST_SELECT_ALL: 'list:select-all',
    LIST_EXTEND_SELECTION_UP: 'list:extend-selection-up',
    LIST_EXTEND_SELECTION_DOWN: 'list:extend-selection-down',
    LIST_RANGE_TO_START: 'list:range-to-start',
    LIST_RANGE_TO_END: 'list:range-to-end',
    SEARCH_FOCUS_LIST: 'search:focus-list',
    SEARCH_FOCUS_NAVIGATION: 'search:focus-navigation',
    SEARCH_CLOSE: 'search:close'
} as const;

export type KeyboardShortcutAction = (typeof KeyboardShortcutAction)[keyof typeof KeyboardShortcutAction];

/**
 * Configuration mapping actions to their keyboard shortcuts
 */
export type KeyboardShortcutConfig = Record<KeyboardShortcutAction, Hotkey[]>;

/**
 * Default keyboard shortcuts for all actions
 */
function createDefaultKeyboardShortcuts(): KeyboardShortcutConfig {
    return {
        [KeyboardShortcutAction.PANE_MOVE_UP]: [{ modifiers: [], key: 'ArrowUp' }],
        [KeyboardShortcutAction.PANE_MOVE_DOWN]: [{ modifiers: [], key: 'ArrowDown' }],
        [KeyboardShortcutAction.PANE_PAGE_UP]: [{ modifiers: [], key: 'PageUp' }],
        [KeyboardShortcutAction.PANE_PAGE_DOWN]: [{ modifiers: [], key: 'PageDown' }],
        [KeyboardShortcutAction.PANE_HOME]: [{ modifiers: [], key: 'Home' }],
        [KeyboardShortcutAction.PANE_END]: [{ modifiers: [], key: 'End' }],
        [KeyboardShortcutAction.PANE_RENAME]: [{ modifiers: [], key: Platform.isMacOS ? 'Enter' : 'F2' }],
        [KeyboardShortcutAction.NAV_COLLAPSE_OR_PARENT]: [{ modifiers: [], key: 'ArrowLeft' }],
        [KeyboardShortcutAction.NAV_EXPAND_OR_FOCUS_LIST]: [{ modifiers: [], key: 'ArrowRight' }],
        [KeyboardShortcutAction.NAV_FOCUS_LIST]: [{ modifiers: [], key: 'Tab' }],
        [KeyboardShortcutAction.DELETE_SELECTED]: [
            { modifiers: [], key: 'Delete' },
            { modifiers: [], key: 'Backspace' }
        ],
        [KeyboardShortcutAction.LIST_FOCUS_NAVIGATION]: [
            { modifiers: [], key: 'ArrowLeft' },
            { modifiers: ['Shift'], key: 'Tab' }
        ],
        [KeyboardShortcutAction.LIST_FOCUS_EDITOR]: [
            { modifiers: [], key: 'ArrowRight' },
            { modifiers: [], key: 'Tab' }
        ],
        [KeyboardShortcutAction.LIST_SELECT_ALL]: [{ modifiers: ['Mod'], key: 'A' }],
        [KeyboardShortcutAction.LIST_EXTEND_SELECTION_UP]: [{ modifiers: ['Shift'], key: 'ArrowUp' }],
        [KeyboardShortcutAction.LIST_EXTEND_SELECTION_DOWN]: [{ modifiers: ['Shift'], key: 'ArrowDown' }],
        [KeyboardShortcutAction.LIST_RANGE_TO_START]: [{ modifiers: ['Shift'], key: 'Home' }],
        [KeyboardShortcutAction.LIST_RANGE_TO_END]: [{ modifiers: ['Shift'], key: 'End' }],
        [KeyboardShortcutAction.SEARCH_FOCUS_LIST]: [
            { modifiers: [], key: 'Tab' },
            { modifiers: [], key: 'Enter' }
        ],
        [KeyboardShortcutAction.SEARCH_FOCUS_NAVIGATION]: [{ modifiers: ['Shift'], key: 'Tab' }],
        [KeyboardShortcutAction.SEARCH_CLOSE]: [{ modifiers: [], key: 'Escape' }]
    };
}

/**
 * Returns a deep clone of the default keyboard shortcut configuration
 */
export function getDefaultKeyboardShortcuts(): KeyboardShortcutConfig {
    return cloneKeyboardShortcutConfig(createDefaultKeyboardShortcuts());
}

/**
 * Validates modifier strings and only accepts canonical Obsidian values
 */
function normalizeModifier(value: unknown): Modifier | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    if (trimmed === 'Mod' || trimmed === 'Ctrl' || trimmed === 'Shift' || trimmed === 'Alt') {
        return trimmed;
    }

    return null;
}

/**
 * Creates a deep copy of a hotkey configuration
 */
function cloneHotkey(hotkey: Hotkey): Hotkey {
    return {
        key: hotkey.key,
        modifiers: Array.isArray(hotkey.modifiers) ? [...hotkey.modifiers] : []
    };
}

/**
 * Creates a deep copy of the entire keyboard shortcut configuration
 */
function cloneKeyboardShortcutConfig(config: KeyboardShortcutConfig): KeyboardShortcutConfig {
    const clone = {} as KeyboardShortcutConfig;
    (Object.keys(config) as KeyboardShortcutAction[]).forEach(action => {
        const hotkeysForAction = config[action] ?? [];
        clone[action] = hotkeysForAction.map(hotkey => cloneHotkey(hotkey));
    });
    return clone;
}

/**
 * Validates and sanitizes a single hotkey entry from user configuration
 */
function sanitizeHotkeyEntry(entry: unknown): Hotkey | null {
    if (!isRecord(entry) || Array.isArray(entry)) {
        return null;
    }

    const rawModifiers = entry.modifiers;
    const rawKey = entry.key;

    if (!Array.isArray(rawModifiers) || typeof rawKey !== 'string') {
        return null;
    }

    const normalizedModifiers: Modifier[] = [];
    for (const modifier of rawModifiers) {
        const normalized = normalizeModifier(modifier);
        if (!normalized) {
            return null;
        }
        normalizedModifiers.push(normalized);
    }

    const trimmedKey = rawKey.trim();
    if (!trimmedKey) {
        return null;
    }

    // Remove duplicate modifiers
    const uniqueModifiers = [...new Set<Modifier>(normalizedModifiers)];

    return {
        key: trimmedKey,
        modifiers: uniqueModifiers
    };
}

/**
 * Validates and sanitizes an array of hotkeys from user configuration.
 * Returns null if input is invalid, otherwise returns sanitized array.
 */
function sanitizeHotkeyArray(value: unknown): Hotkey[] | null {
    if (!Array.isArray(value)) {
        return null;
    }

    const sanitized: Hotkey[] = [];
    for (const entry of value) {
        const hotkey = sanitizeHotkeyEntry(entry);
        if (hotkey) {
            sanitized.push(cloneHotkey(hotkey));
        }
    }

    return sanitized;
}

/**
 * Validates and sanitizes user-provided keyboard shortcut configuration.
 * Falls back to defaults for any invalid entries.
 */
export function sanitizeKeyboardShortcuts(value: unknown): KeyboardShortcutConfig {
    const sanitized = getDefaultKeyboardShortcuts();
    if (!isRecord(value) || Array.isArray(value)) {
        return sanitized;
    }

    (Object.keys(KeyboardShortcutAction) as (keyof typeof KeyboardShortcutAction)[]).forEach(key => {
        const action = KeyboardShortcutAction[key];
        const sanitizedHotkeys = sanitizeHotkeyArray(value[action]);
        if (sanitizedHotkeys) {
            sanitized[action] = sanitizedHotkeys;
        }
    });

    return sanitized;
}

/**
 * Options for keyboard shortcut matching
 */
interface MatchOptions {
    isRTL?: boolean;
    directional?: 'horizontal';
}

/**
 * Normalizes key strings for comparison (lowercase for consistency)
 */
function normalizeKey(key: string): string {
    const trimmed = key.trim();
    return trimmed.length === 1 ? trimmed.toLowerCase() : trimmed.toLowerCase();
}

/**
 * Swaps left/right arrow keys for RTL language support
 */
function swapDirectionalKey(key: string): string {
    switch (key) {
        case 'ArrowLeft':
            return 'ArrowRight';
        case 'ArrowRight':
            return 'ArrowLeft';
        default:
            return key;
    }
}

/**
 * Checks if keyboard event modifiers match hotkey configuration.
 * Handles platform-specific 'Mod' key (Cmd on Mac, Ctrl on Windows/Linux).
 */
function modifiersMatch(event: KeyboardEvent, hotkey: Hotkey): boolean {
    const modifiers = Array.isArray(hotkey.modifiers) ? hotkey.modifiers : [];
    const required = new Set<Modifier>(modifiers);

    const requiresMod = required.has('Mod');
    const requiresCtrl = required.has('Ctrl') || (!Platform.isMacOS && requiresMod);
    const requiresMeta = Platform.isMacOS && requiresMod;
    const requiresAlt = required.has('Alt');
    const requiresShift = required.has('Shift');

    if (event.altKey !== requiresAlt) {
        return false;
    }
    if (event.shiftKey !== requiresShift) {
        return false;
    }
    if (event.ctrlKey !== requiresCtrl) {
        return false;
    }
    if (event.metaKey !== requiresMeta) {
        return false;
    }

    return true;
}

/**
 * Checks if a keyboard event matches a specific hotkey configuration.
 * Handles RTL directional key swapping when specified.
 */
function hotkeyMatches(event: KeyboardEvent, hotkey: Hotkey, options?: MatchOptions): boolean {
    const configKey = options?.directional === 'horizontal' && options?.isRTL ? swapDirectionalKey(hotkey.key) : hotkey.key;
    const expectedKey = normalizeKey(configKey);
    const eventKey = normalizeKey(event.key);

    if (expectedKey !== eventKey) {
        return false;
    }

    return modifiersMatch(event, hotkey);
}

/**
 * Main function to check if a keyboard event matches any hotkey for a given action.
 * Returns true if any of the configured hotkeys for the action match the event.
 */
export function matchesShortcut(
    event: KeyboardEvent,
    config: KeyboardShortcutConfig,
    action: KeyboardShortcutAction,
    options?: MatchOptions
): boolean {
    const hotkeys = config[action];
    if (!hotkeys || hotkeys.length === 0) {
        return false;
    }

    for (const hotkey of hotkeys) {
        if (hotkeyMatches(event, hotkey, options)) {
            return true;
        }
    }

    return false;
}
