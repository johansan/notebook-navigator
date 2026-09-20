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
import { TEMPLATER_JUMP_TO_CURSOR_COMMAND_ID } from '../constants/pluginIds';
import type { TemplateCursorPosition } from './templateRenderer';
import { executeCommand } from './typeGuards';

/**
 * Cursor placements recorded when a note is created from a template. The note is created by one code path and
 * opened by another (calendar, commands, homepage, folder notes), so the placement is stored by path and applied when
 * the file has finished opening in an editor instead of being threaded through every creation call.
 * A `position` entry holds where the built-in renderer removed `{{cursor}}`. A `templater` entry marks a note that
 * Templater created without opening it: Templater leaves its `<% tp.file.cursor() %>` markers in the note, and only
 * its jump command removes them and places the cursor.
 */

type PendingTemplateCursor =
    | { kind: 'position'; position: TemplateCursorPosition; expiresAt: number }
    | {
          kind: 'templater';
          /** Completed opens register their editors without retaining closed views while the entry waits for expiry. */
          loadedEditors: WeakSet<Editor>;
          expiresAt: number;
      };

/** Entries older than this are ignored so a note that was created but never opened does not move the cursor later. */
const PENDING_TEMPLATE_CURSOR_TTL_MS = 10000;

/** Text every `<% tp.file.cursor() %>` marker contains, including numbered markers such as `tp.file.cursor(1)`. */
const TEMPLATER_CURSOR_MARKER = 'tp.file.cursor';

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
 * Stores an entry and drops the expired ones. Lookups only delete the expired entry of their own path, so without this
 * pass the entries of notes that were created but never opened as an editor would stay in the map.
 */
function setPendingCursor(path: string, entry: PendingTemplateCursor): void {
    const now = Date.now();
    pendingCursors.forEach((pending, pendingPath) => {
        if (now > pending.expiresAt) {
            pendingCursors.delete(pendingPath);
        }
    });
    pendingCursors.set(path, entry);
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
    setPendingCursor(path, { kind: 'position', position, expiresAt: Date.now() + PENDING_TEMPLATE_CURSOR_TTL_MS });
}

/** Records that Templater's jump command should run once the note at `path` opens as the active editor. */
export function schedulePendingTemplaterCursor(path: string): void {
    setPendingCursor(path, { kind: 'templater', loadedEditors: new WeakSet(), expiresAt: Date.now() + PENDING_TEMPLATE_CURSOR_TTL_MS });
}

/** Returns true when a cursor placement is waiting for the note at `path`. */
export function hasPendingTemplateCursor(path: string): boolean {
    return getPendingCursor(path) !== null;
}

/**
 * Runs Templater's jump command for the note at `path` when it is the active editor. The command acts on the active
 * editor only, so a note that is open in a background leaf keeps its entry until it becomes active or the entry
 * expires. Callers must establish that this editor has finished opening the note before calling this helper; a
 * marker alone cannot establish readiness because the previous document may also contain one. Notes without
 * markers have nothing to jump to, so they do not receive focus.
 */
function applyTemplaterCursor(app: App, path: string): void {
    const activeEditor = app.workspace.activeEditor;
    if (!activeEditor?.editor || activeEditor.file?.path !== path) {
        return;
    }
    if (!activeEditor.editor.getValue().includes(TEMPLATER_CURSOR_MARKER)) {
        return;
    }
    // Removed before the command runs because folder notes apply the cursor twice for one open, and every run of the
    // command consumes one cursor stop of the note.
    pendingCursors.delete(path);
    // Runs regardless of Templater's own automatic jump setting, matching how `{{cursor}}` always places the cursor.
    executeCommand(app, TEMPLATER_JUMP_TO_CURSOR_COMMAND_ID);
    activeEditor.editor.focus();
}

/**
 * Applies the pending cursor after the caller has awaited the file-opening operation. Obsidian can emit `file-open`
 * after assigning the new file to a view but before replacing its previous document, so neither that event nor an
 * animation frame guarantees that cursor placement will survive loading the new note.
 * A position entry is consumed only when an editor shows the file. A Templater entry records the loaded editor and
 * is consumed only when it is active and shows a marker, see `applyTemplaterCursor`. Background editors retain their
 * entries so activation can retry without treating an unfinished open as a loaded document. Entries otherwise
 * remain until another completed open or expiry.
 */
export function applyPendingTemplateCursor(app: App, file: TFile): void {
    const entry = getPendingCursor(file.path);
    if (!entry) {
        return;
    }

    const editor = findEditorForFile(app, file.path);
    if (!editor) {
        return;
    }
    if (entry.kind === 'templater') {
        entry.loadedEditors.add(editor);
        applyTemplaterCursor(app, file.path);
        return;
    }

    editor.setCursor(entry.position);
    pendingCursors.delete(file.path);
    // Only the editor the user is already in receives focus, so notes opened in the background stay there.
    if (app.workspace.activeEditor?.editor === editor) {
        editor.focus();
    }
}

/**
 * Applies a pending Templater entry from the workspace `file-open` handler, which fires when a note opened in the
 * background, such as a folder note in the right sidebar, becomes the active editor. Only editors recorded after a
 * completed open can retry; a new editor may still show its previous document. Position entries are left untouched
 * for the callers that await the open. Unready Templater entries remain pending until a completed open or expiry.
 */
export function applyPendingTemplaterCursorOnFileOpen(app: App, file: TFile): void {
    const activeEditor = app.workspace.activeEditor;
    const editor = activeEditor?.editor;
    if (!editor || activeEditor.file?.path !== file.path) {
        return;
    }

    // Obsidian reuses editor objects across notes. Once another file opens in a loaded editor, reopening the pending
    // note must await loading again; otherwise the old readiness would permit a jump against that other document.
    pendingCursors.forEach((pending, pendingPath) => {
        if (pending.kind === 'templater' && pendingPath !== file.path) {
            pending.loadedEditors.delete(editor);
        }
    });

    const entry = getPendingCursor(file.path);
    if (entry?.kind !== 'templater' || !entry.loadedEditors.has(editor)) {
        return;
    }
    applyTemplaterCursor(app, file.path);
}
