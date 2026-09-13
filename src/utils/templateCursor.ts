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

import { MarkdownView, type App, type Editor, type TFile } from 'obsidian';
import type { TemplateCursorPosition } from './templateRenderer';

/**
 * Cursor positions recorded when a template with `{{cursor}}` is rendered. The note is created by one code path and
 * opened by another (calendar, commands, homepage, folder notes), so the position is stored by path and applied when
 * the file opens in an editor instead of being threaded through every open call.
 */

interface PendingTemplateCursor {
    position: TemplateCursorPosition;
    expiresAt: number;
}

/** Entries older than this are ignored so a note that was created but never opened does not move the cursor later. */
const PENDING_TEMPLATE_CURSOR_TTL_MS = 10000;

const pendingCursors = new Map<string, PendingTemplateCursor>();

function getPendingCursor(path: string): PendingTemplateCursor | null {
    const entry = pendingCursors.get(path);
    if (!entry) {
        return null;
    }
    if (Date.now() > entry.expiresAt) {
        pendingCursors.delete(path);
        return null;
    }
    return entry;
}

/**
 * Finds the editor showing `path`. The active editor is preferred because it is the one the user is looking at; other
 * markdown leaves are searched for notes opened in the background, such as folder notes in the right sidebar, whose
 * callers apply the cursor directly after opening.
 */
function findEditorForFile(app: App, path: string): Editor | null {
    const activeEditor = app.workspace.activeEditor;
    if (activeEditor?.editor && activeEditor.file?.path === path) {
        return activeEditor.editor;
    }

    let found: Editor | null = null;
    app.workspace.iterateAllLeaves(leaf => {
        if (found || !(leaf.view instanceof MarkdownView) || leaf.view.file?.path !== path) {
            return;
        }
        found = leaf.view.editor;
    });
    return found;
}

/** Records where the cursor should be placed once the note at `path` opens. */
export function schedulePendingTemplateCursor(path: string, position: TemplateCursorPosition): void {
    pendingCursors.set(path, { position, expiresAt: Date.now() + PENDING_TEMPLATE_CURSOR_TTL_MS });
}

/** Returns true when a cursor position is waiting for the note at `path`. */
export function hasPendingTemplateCursor(path: string): boolean {
    return getPendingCursor(path) !== null;
}

/**
 * Applies the pending cursor for a file that was just opened. Called from the workspace `file-open` handler, which
 * only fires for the active file, and directly by callers that open notes in the background.
 * The cursor moves on the next animation frame because the editor content is not guaranteed to be loaded when the
 * event fires. The entry is only removed after the cursor was placed, so a later open can still apply it before it
 * expires when no editor for the file exists yet.
 */
export function applyPendingTemplateCursor(app: App, file: TFile): void {
    if (!getPendingCursor(file.path)) {
        return;
    }

    window.requestAnimationFrame(() => {
        const entry = getPendingCursor(file.path);
        if (!entry) {
            return;
        }
        const editor = findEditorForFile(app, file.path);
        if (!editor) {
            return;
        }
        pendingCursors.delete(file.path);
        editor.setCursor(entry.position);
        // Only the editor the user is already in receives focus, so notes opened in the background stay there.
        if (app.workspace.activeEditor?.editor === editor) {
            editor.focus();
        }
    });
}
