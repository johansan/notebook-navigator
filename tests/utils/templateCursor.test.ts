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

import { App, MarkdownView, type TFile, type WorkspaceLeaf } from 'obsidian';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyPendingTemplateCursor, hasPendingTemplateCursor, schedulePendingTemplateCursor } from '../../src/utils/templateCursor';
import { createTestTFile } from './createTestTFile';

interface TestEditor {
    setCursor: ReturnType<typeof vi.fn>;
    focus: ReturnType<typeof vi.fn>;
}

function createEditor(): TestEditor {
    return { setCursor: vi.fn(), focus: vi.fn() };
}

function createApp(options: { activeFile?: TFile; activeEditor?: TestEditor; leaves?: MarkdownView[] }): App {
    const app = new App();
    app.workspace = {
        activeEditor: options.activeEditor ? { file: options.activeFile ?? null, editor: options.activeEditor } : null,
        iterateAllLeaves: (callback: (leaf: WorkspaceLeaf) => void) => {
            (options.leaves ?? []).forEach(view => callback({ view } as unknown as WorkspaceLeaf));
        }
    } as unknown as App['workspace'];
    return app;
}

describe('template cursor placement', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('places the cursor in the active editor, focuses it and clears the entry', () => {
        const file = createTestTFile('Daily/2026-09-16.md');
        const editor = createEditor();
        const app = createApp({ activeFile: file, activeEditor: editor });
        schedulePendingTemplateCursor(file.path, { line: 2, ch: 4 });

        applyPendingTemplateCursor(app, file);

        expect(editor.setCursor).toHaveBeenCalledWith({ line: 2, ch: 4 });
        expect(editor.focus).toHaveBeenCalled();
        expect(hasPendingTemplateCursor(file.path)).toBe(false);
    });

    it('keeps the entry when no editor shows the file yet', () => {
        const file = createTestTFile('Daily/2026-09-17.md');
        const app = createApp({});
        schedulePendingTemplateCursor(file.path, { line: 0, ch: 0 });

        applyPendingTemplateCursor(app, file);

        expect(hasPendingTemplateCursor(file.path)).toBe(true);
    });

    it('finds the editor of a background leaf without focusing it', () => {
        const file = createTestTFile('Projects/Projects.md');
        const editor = createEditor();
        const view = new MarkdownView();
        view.file = file;
        view.editor = editor;
        const app = createApp({ leaves: [view] });
        schedulePendingTemplateCursor(file.path, { line: 1, ch: 0 });

        applyPendingTemplateCursor(app, file);

        expect(editor.setCursor).toHaveBeenCalledWith({ line: 1, ch: 0 });
        expect(editor.focus).not.toHaveBeenCalled();
        expect(hasPendingTemplateCursor(file.path)).toBe(false);
    });

    it('ignores entries older than the time limit', () => {
        const file = createTestTFile('Daily/2026-09-18.md');
        const editor = createEditor();
        const app = createApp({ activeFile: file, activeEditor: editor });
        const start = 1_000_000;
        const now = vi.spyOn(Date, 'now').mockReturnValue(start);
        schedulePendingTemplateCursor(file.path, { line: 0, ch: 0 });
        now.mockReturnValue(start + 11_000);

        expect(hasPendingTemplateCursor(file.path)).toBe(false);
        applyPendingTemplateCursor(app, file);
        expect(editor.setCursor).not.toHaveBeenCalled();
    });
});
