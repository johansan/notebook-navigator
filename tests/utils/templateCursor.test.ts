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
import { TEMPLATER_JUMP_TO_CURSOR_COMMAND_ID } from '../../src/constants/pluginIds';
import {
    applyPendingTemplateCursor,
    applyPendingTemplaterCursorOnFileOpen,
    hasPendingTemplateCursor,
    schedulePendingTemplateCursor,
    schedulePendingTemplaterCursor
} from '../../src/utils/templateCursor';
import { createTestTFile } from './createTestTFile';

interface TestEditor {
    setCursor: ReturnType<typeof vi.fn>;
    focus: ReturnType<typeof vi.fn>;
    getValue: () => string;
}

const TEMPLATER_CURSOR_CONTENT = '# Meeting\n\n<% tp.file.cursor() %>\n';

function createEditor(content = ''): TestEditor {
    return { setCursor: vi.fn(), focus: vi.fn(), getValue: () => content };
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

    it('runs the Templater jump command once in the active editor and clears the entry', () => {
        const file = createTestTFile('Meetings/Weekly sync.md');
        const editor = createEditor(TEMPLATER_CURSOR_CONTENT);
        const app = createApp({ activeFile: file, activeEditor: editor });
        const executeCommandById = vi.fn(() => true);
        Reflect.set(app, 'commands', { executeCommandById });
        schedulePendingTemplaterCursor(file.path);

        // Folder notes apply the cursor twice for one open; the second call must not consume another cursor stop.
        applyPendingTemplateCursor(app, file);
        applyPendingTemplateCursor(app, file);

        expect(executeCommandById).toHaveBeenCalledExactlyOnceWith(TEMPLATER_JUMP_TO_CURSOR_COMMAND_ID);
        expect(editor.setCursor).not.toHaveBeenCalled();
        expect(editor.focus).toHaveBeenCalledOnce();
        expect(hasPendingTemplateCursor(file.path)).toBe(false);
    });

    it('keeps a Templater entry while the file is only open in a background leaf', () => {
        const file = createTestTFile('Projects/Templater project.md');
        const view = new MarkdownView();
        view.file = file;
        view.editor = createEditor(TEMPLATER_CURSOR_CONTENT);
        const app = createApp({ activeFile: createTestTFile('Projects/Other.md'), activeEditor: createEditor(), leaves: [view] });
        const executeCommandById = vi.fn(() => true);
        Reflect.set(app, 'commands', { executeCommandById });
        schedulePendingTemplaterCursor(file.path);

        applyPendingTemplateCursor(app, file);

        expect(executeCommandById).not.toHaveBeenCalled();
        expect(hasPendingTemplateCursor(file.path)).toBe(true);
    });

    it.each(['# Previous note\n', TEMPLATER_CURSOR_CONTENT])(
        'ignores file-open before loading finishes with previous content %j',
        content => {
            const file = createTestTFile('Projects/Loading.md');
            const app = createApp({ activeFile: file, activeEditor: createEditor(content) });
            const executeCommandById = vi.fn(() => true);
            Reflect.set(app, 'commands', { executeCommandById });
            schedulePendingTemplaterCursor(file.path);

            applyPendingTemplaterCursorOnFileOpen(app, file);

            expect(executeCommandById).not.toHaveBeenCalled();
            expect(hasPendingTemplateCursor(file.path)).toBe(true);
        }
    );

    it('runs the Templater jump on file-open once a background note becomes the active editor', () => {
        const file = createTestTFile('Projects/Sidebar folder note.md');
        const editor = createEditor(TEMPLATER_CURSOR_CONTENT);
        const view = new MarkdownView();
        view.file = file;
        view.editor = editor;
        const app = createApp({ activeFile: createTestTFile('Projects/Other.md'), activeEditor: createEditor(), leaves: [view] });
        const executeCommandById = vi.fn(() => true);
        Reflect.set(app, 'commands', { executeCommandById });
        schedulePendingTemplaterCursor(file.path);

        applyPendingTemplateCursor(app, file);
        expect(executeCommandById).not.toHaveBeenCalled();
        app.workspace.activeEditor = view;
        applyPendingTemplaterCursorOnFileOpen(app, file);
        applyPendingTemplaterCursorOnFileOpen(app, file);

        expect(executeCommandById).toHaveBeenCalledExactlyOnceWith(TEMPLATER_JUMP_TO_CURSOR_COMMAND_ID);
        expect(editor.focus).toHaveBeenCalledOnce();
        expect(hasPendingTemplateCursor(file.path)).toBe(false);
    });

    it('waits for the new editor to finish loading when a background note opens in another leaf', () => {
        const file = createTestTFile('Projects/Another leaf.md');
        const view = new MarkdownView();
        view.file = file;
        view.editor = createEditor(TEMPLATER_CURSOR_CONTENT);
        const app = createApp({ leaves: [view] });
        const executeCommandById = vi.fn(() => true);
        Reflect.set(app, 'commands', { executeCommandById });
        schedulePendingTemplaterCursor(file.path);
        applyPendingTemplateCursor(app, file);

        const otherView = new MarkdownView();
        otherView.file = file;
        otherView.editor = createEditor(TEMPLATER_CURSOR_CONTENT);
        app.workspace.activeEditor = otherView;
        applyPendingTemplaterCursorOnFileOpen(app, file);

        expect(executeCommandById).not.toHaveBeenCalled();
        expect(hasPendingTemplateCursor(file.path)).toBe(true);

        applyPendingTemplateCursor(app, file);
        expect(executeCommandById).toHaveBeenCalledExactlyOnceWith(TEMPLATER_JUMP_TO_CURSOR_COMMAND_ID);
    });

    it('requires another completed open after the loaded editor switches to a different note', () => {
        const file = createTestTFile('Projects/Reopened.md');
        const otherFile = createTestTFile('Templates/Previous.md');
        const view = new MarkdownView();
        view.file = file;
        view.editor = createEditor(TEMPLATER_CURSOR_CONTENT);
        const app = createApp({ leaves: [view] });
        const executeCommandById = vi.fn(() => true);
        Reflect.set(app, 'commands', { executeCommandById });
        schedulePendingTemplaterCursor(file.path);
        applyPendingTemplateCursor(app, file);

        app.workspace.activeEditor = view;
        view.file = otherFile;
        applyPendingTemplaterCursorOnFileOpen(app, otherFile);
        // The same editor object can publish the pending file path before replacing the other note's content.
        view.file = file;
        applyPendingTemplaterCursorOnFileOpen(app, file);

        expect(executeCommandById).not.toHaveBeenCalled();
        expect(hasPendingTemplateCursor(file.path)).toBe(true);

        applyPendingTemplateCursor(app, file);
        expect(executeCommandById).toHaveBeenCalledExactlyOnceWith(TEMPLATER_JUMP_TO_CURSOR_COMMAND_ID);
    });

    it('leaves position entries untouched on file-open', () => {
        const file = createTestTFile('Daily/2026-09-20.md');
        const editor = createEditor();
        const app = createApp({ activeFile: file, activeEditor: editor });
        schedulePendingTemplateCursor(file.path, { line: 3, ch: 0 });

        applyPendingTemplaterCursorOnFileOpen(app, file);

        expect(editor.setCursor).not.toHaveBeenCalled();
        expect(hasPendingTemplateCursor(file.path)).toBe(true);
    });
});
