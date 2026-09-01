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

import type { BackgroundMode } from '../../types';
import type { EnterKeyAction, MouseBackForwardAction, MultiSelectModifier, NotebookNavigatorSettings } from '../types';

// Native controls for appearance/behavior include union-typed settings outside the scalar control registry.
export type AppearanceBehaviorControlKey = AppearanceBehaviorToggleKey | AppearanceBehaviorDropdownKey;

export type AppearanceBehaviorToggleKey =
    | 'createNewNotesInNewTab'
    | 'autoRevealActiveFile'
    | 'autoRevealShortestPath'
    | 'autoRevealIgnoreRightSidebar'
    | 'autoRevealIgnoreOtherWindows'
    | 'enterToOpenFiles'
    | 'showTooltips'
    | 'showTooltipPath'
    | 'showTooltipTags'
    | 'showTooltipWordCount'
    | 'showInfoButtons'
    | 'colorIconOnly';

export type AppearanceBehaviorDropdownKey =
    | 'multiSelectModifier'
    | 'shiftEnterOpenContext'
    | 'cmdCtrlEnterOpenContext'
    | 'mouseBackForwardAction'
    | 'desktopBackground'
    | 'startView';

const CONTROL_KEYS: ReadonlySet<AppearanceBehaviorControlKey> = new Set([
    'createNewNotesInNewTab',
    'autoRevealActiveFile',
    'autoRevealShortestPath',
    'autoRevealIgnoreRightSidebar',
    'autoRevealIgnoreOtherWindows',
    'multiSelectModifier',
    'enterToOpenFiles',
    'shiftEnterOpenContext',
    'cmdCtrlEnterOpenContext',
    'mouseBackForwardAction',
    'desktopBackground',
    'showTooltips',
    'showTooltipPath',
    'showTooltipTags',
    'showTooltipWordCount',
    'startView',
    'showInfoButtons',
    'colorIconOnly'
]);

const REFRESH_DOM_STATE_KEYS: ReadonlySet<AppearanceBehaviorControlKey> = new Set([
    'autoRevealActiveFile',
    'enterToOpenFiles',
    'showTooltips'
]);

export function isAppearanceBehaviorControlKey(key: string): key is AppearanceBehaviorControlKey {
    return CONTROL_KEYS.has(key as AppearanceBehaviorControlKey);
}

export function getAppearanceBehaviorControlValue(settings: NotebookNavigatorSettings, key: AppearanceBehaviorControlKey): unknown {
    return settings[key];
}

export function applyAppearanceBehaviorControlValue(
    settings: NotebookNavigatorSettings,
    key: AppearanceBehaviorControlKey,
    value: unknown
): boolean {
    switch (key) {
        case 'createNewNotesInNewTab':
        case 'autoRevealActiveFile':
        case 'autoRevealShortestPath':
        case 'autoRevealIgnoreRightSidebar':
        case 'autoRevealIgnoreOtherWindows':
        case 'enterToOpenFiles':
        case 'showTooltips':
        case 'showTooltipPath':
        case 'showTooltipTags':
        case 'showTooltipWordCount':
        case 'showInfoButtons':
        case 'colorIconOnly':
            return applyToggleValue(settings, key, value);
        case 'multiSelectModifier':
            return applyMultiSelectModifier(settings, value);
        case 'shiftEnterOpenContext':
        case 'cmdCtrlEnterOpenContext':
            return applyOpenContext(settings, key, value);
        case 'mouseBackForwardAction':
            return applyMouseBackForwardAction(settings, value);
        case 'desktopBackground':
            return applyDesktopBackground(settings, value);
        case 'startView':
            return applyStartView(settings, value);
    }
}

export function needsAppearanceBehaviorDomStateRefresh(key: AppearanceBehaviorControlKey): boolean {
    return REFRESH_DOM_STATE_KEYS.has(key);
}

function applyToggleValue(settings: NotebookNavigatorSettings, key: AppearanceBehaviorToggleKey, value: unknown): boolean {
    if (typeof value !== 'boolean') {
        return false;
    }

    settings[key] = value;
    return true;
}

function applyMultiSelectModifier(settings: NotebookNavigatorSettings, value: unknown): boolean {
    if (!isMultiSelectModifierValue(value)) {
        return false;
    }

    settings.multiSelectModifier = value;
    return true;
}

function applyOpenContext(
    settings: NotebookNavigatorSettings,
    key: 'shiftEnterOpenContext' | 'cmdCtrlEnterOpenContext',
    value: unknown
): boolean {
    const enterAction = normalizeEnterKeyActionValue(value);
    if (!enterAction) {
        return false;
    }

    settings[key] = enterAction;
    return true;
}

function applyMouseBackForwardAction(settings: NotebookNavigatorSettings, value: unknown): boolean {
    const action = normalizeMouseBackForwardActionValue(value);
    if (!action) {
        return false;
    }

    settings.mouseBackForwardAction = action;
    return true;
}

function applyDesktopBackground(settings: NotebookNavigatorSettings, value: unknown): boolean {
    const backgroundMode = normalizeBackgroundModeValue(value);
    if (!backgroundMode) {
        return false;
    }

    settings.desktopBackground = backgroundMode;
    return true;
}

function applyStartView(settings: NotebookNavigatorSettings, value: unknown): boolean {
    if (value !== 'navigation' && value !== 'files') {
        return false;
    }

    settings.startView = value;
    return true;
}

function isMultiSelectModifierValue(value: unknown): value is MultiSelectModifier {
    return value === 'cmdCtrl' || value === 'optionAlt';
}

function normalizeEnterKeyActionValue(value: unknown): EnterKeyAction | null {
    if (value === 'tab' || value === 'split' || value === 'window' || value === 'rename') {
        return value;
    }

    return null;
}

function normalizeMouseBackForwardActionValue(value: unknown): MouseBackForwardAction | null {
    if (value === 'none' || value === 'singlePaneSwitch' || value === 'history') {
        return value;
    }

    return null;
}

function normalizeBackgroundModeValue(value: unknown): BackgroundMode | null {
    if (value === 'separate' || value === 'primary' || value === 'secondary') {
        return value;
    }

    return null;
}
