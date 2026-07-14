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

import { Platform } from 'obsidian';
import type { EnterKeyAction, FolderNoteOpenLocation, MultiSelectModifier } from '../settings/types';

interface KeyboardOpenContextSettings {
    shiftEnterOpenContext: EnterKeyAction;
    cmdCtrlEnterOpenContext: EnterKeyAction;
}

interface CmdCtrlEventState {
    ctrlKey: boolean;
    metaKey: boolean;
}

interface MultiSelectModifierEventState extends CmdCtrlEventState {
    altKey: boolean;
}

export function isEnterKey(e: KeyboardEvent): boolean {
    return e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter';
}

export function resolveKeyboardEnterAction(e: KeyboardEvent, settings: KeyboardOpenContextSettings): EnterKeyAction | null {
    const isCmdCtrl = e.metaKey || e.ctrlKey;
    if (isCmdCtrl) {
        return settings.cmdCtrlEnterOpenContext;
    }

    if (e.shiftKey) {
        return settings.shiftEnterOpenContext;
    }

    return null;
}

export function isCmdCtrlModifierPressed(event: CmdCtrlEventState): boolean {
    return Platform.isMacOS ? event.metaKey : event.metaKey || event.ctrlKey;
}

export function isMultiSelectModifierPressed(event: MultiSelectModifierEventState, modifierSetting: MultiSelectModifier): boolean {
    if (modifierSetting === 'optionAlt') {
        return event.altKey;
    }

    return isCmdCtrlModifierPressed(event);
}

export function shouldOpenNoteClickInNewTab(
    event: MultiSelectModifierEventState,
    multiSelectModifier: MultiSelectModifier,
    isMobile: boolean
): boolean {
    return (
        !isMobile &&
        multiSelectModifier === 'optionAlt' &&
        !isMultiSelectModifierPressed(event, multiSelectModifier) &&
        isCmdCtrlModifierPressed(event)
    );
}

export function resolveFolderNoteClickOpenContext(
    event: CmdCtrlEventState,
    folderNoteOpenLocation: FolderNoteOpenLocation,
    multiSelectModifier: MultiSelectModifier,
    isMobile: boolean
): 'tab' | 'right-sidebar' | null {
    // Explicit setting takes precedence over modifier-driven behavior.
    if (folderNoteOpenLocation === 'new-tab') {
        return 'tab';
    }

    if (folderNoteOpenLocation === 'right-sidebar') {
        return 'right-sidebar';
    }

    // Folder note click-to-tab modifier is desktop-only and tied to optionAlt mode.
    if (isMobile || multiSelectModifier !== 'optionAlt') {
        return null;
    }

    return isCmdCtrlModifierPressed(event) ? 'tab' : null;
}

export function resolveFolderNoteDefaultOpenContext(folderNoteOpenLocation: FolderNoteOpenLocation): 'tab' | 'right-sidebar' | null {
    if (folderNoteOpenLocation === 'new-tab') {
        return 'tab';
    }

    if (folderNoteOpenLocation === 'right-sidebar') {
        return 'right-sidebar';
    }

    return null;
}
