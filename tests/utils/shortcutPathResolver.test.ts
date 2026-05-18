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

import { describe, expect, it, vi } from 'vitest';
import { App, TFile, TFolder } from 'obsidian';
import { ShortcutType } from '../../src/types/shortcuts';
import {
    buildShortcutTargetKeyMaps,
    buildShortcutTargetPathIndex,
    createShortcutTargetPathEventMatcher,
    resolveFolderShortcutTarget,
    resolveNoteShortcutTarget,
    resolveShortcutTargets
} from '../../src/utils/shortcutPathResolver';

interface TestVaultRegistration {
    registerFile(file: TFile): void;
    registerFolder(folder: TFolder): void;
}

function getTestVault(app: App): TestVaultRegistration {
    return app.vault as unknown as TestVaultRegistration;
}

describe('shortcut path resolver', () => {
    it('resolves a folder shortcut through a unique casefolded path fallback', () => {
        const app = new App();
        const folder = new TFolder('applab/skills-workflows/mmgi/00_archive');
        getTestVault(app).registerFolder(folder);

        const index = buildShortcutTargetPathIndex(app);

        expect(resolveFolderShortcutTarget(app, 'appLab/SKILLS-WORKFLOWS/mmgi/00_archive', index)).toBe(folder);
    });

    it('hydrates a unique casefolded folder shortcut target', () => {
        const app = new App();
        const folder = new TFolder('applab/skills-workflows/mmgi/00_archive');
        getTestVault(app).registerFolder(folder);

        const resolution = resolveShortcutTargets(app, [{ type: ShortcutType.FOLDER, path: 'appLab/SKILLS-WORKFLOWS/mmgi/00_archive' }]);

        expect(resolution.folderTargetsByPath.get('appLab/SKILLS-WORKFLOWS/mmgi/00_archive')).toBe(folder);
    });

    it('resolves a note shortcut through a unique casefolded path fallback', () => {
        const app = new App();
        const note = new TFile('applab/skills-workflows/mmgi/Note.md');
        getTestVault(app).registerFile(note);

        const index = buildShortcutTargetPathIndex(app);

        expect(resolveNoteShortcutTarget(app, 'appLab/SKILLS-WORKFLOWS/mmgi/note.md', index)).toBe(note);
    });

    it('matches NFC and NFD-equivalent shortcut paths', () => {
        const app = new App();
        const note = new TFile('Café/Note.md');
        getTestVault(app).registerFile(note);

        const index = buildShortcutTargetPathIndex(app);

        expect(resolveNoteShortcutTarget(app, 'Cafe\u0301/Note.md', index)).toBe(note);
    });

    it('keeps ambiguous casefolded folder matches missing', () => {
        const app = new App();
        const vault = getTestVault(app);
        vault.registerFolder(new TFolder('Projects/Archive'));
        vault.registerFolder(new TFolder('projects/archive'));

        const index = buildShortcutTargetPathIndex(app);

        expect(resolveFolderShortcutTarget(app, 'PROJECTS/ARCHIVE', index)).toBeNull();
    });

    it('keeps zero-match casefolded folder shortcuts missing', () => {
        const app = new App();

        const index = buildShortcutTargetPathIndex(app);

        expect(resolveFolderShortcutTarget(app, 'Projects/Missing', index)).toBeNull();
    });

    it('uses exact matches before consulting ambiguous fallback matches', () => {
        const app = new App();
        const exact = new TFile('Projects/Note.md');
        const vault = getTestVault(app);
        vault.registerFile(exact);
        vault.registerFile(new TFile('projects/note.md'));

        const index = buildShortcutTargetPathIndex(app);

        expect(resolveNoteShortcutTarget(app, 'Projects/Note.md', index)).toBe(exact);
    });

    it('does not scan loaded vault entries when an exact note path resolves', () => {
        const app = new App();
        const note = new TFile('Projects/Note.md');
        getTestVault(app).registerFile(note);
        const getAllLoadedFiles = vi.spyOn(app.vault, 'getAllLoadedFiles');

        expect(resolveNoteShortcutTarget(app, 'Projects/Note.md')).toBe(note);
        expect(getAllLoadedFiles).not.toHaveBeenCalled();
    });

    it('does not scan loaded vault entries when shortcut targets resolve exactly', () => {
        const app = new App();
        const folder = new TFolder('Projects');
        const note = new TFile('Projects/Note.md');
        const vault = getTestVault(app);
        vault.registerFolder(folder);
        vault.registerFile(note);
        const getAllLoadedFiles = vi.spyOn(app.vault, 'getAllLoadedFiles');

        const resolution = resolveShortcutTargets(app, [
            { type: ShortcutType.FOLDER, path: 'Projects' },
            { type: ShortcutType.NOTE, path: 'Projects/Note.md' }
        ]);

        expect(resolution.folderTargetsByPath.get('Projects')).toBe(folder);
        expect(resolution.noteTargetsByPath.get('Projects/Note.md')).toBe(note);
        expect(getAllLoadedFiles).not.toHaveBeenCalled();
    });

    it('treats resolved actual folder paths as existing shortcuts', () => {
        const app = new App();
        const folder = new TFolder('applab/skills-workflows/mmgi/00_archive');
        const shortcut = { type: ShortcutType.FOLDER, path: 'appLab/SKILLS-WORKFLOWS/mmgi/00_archive' } as const;
        getTestVault(app).registerFolder(folder);

        const resolution = resolveShortcutTargets(app, [shortcut]);
        const { folderShortcutKeysByPath } = buildShortcutTargetKeyMaps([shortcut], resolution);

        expect(folderShortcutKeysByPath.get('applab/skills-workflows/mmgi/00_archive')).toBe(
            'folder:appLab/SKILLS-WORKFLOWS/mmgi/00_archive'
        );
    });

    it('matches shortcut event paths through unique casefolded fallback', () => {
        const app = new App();
        const matcher = createShortcutTargetPathEventMatcher(app, 'folder', 'applab/skills-workflows/mmgi/00_archive');

        expect(matcher('appLab/SKILLS-WORKFLOWS/mmgi/00_archive')).toBe(true);
    });

    it('keeps ambiguous shortcut event paths unmatched', () => {
        const app = new App();
        getTestVault(app).registerFolder(new TFolder('applab/skills-workflows/mmgi/00_archive'));
        const matcher = createShortcutTargetPathEventMatcher(app, 'folder', 'applab/skills-workflows/mmgi/00_archive');

        expect(matcher('appLab/SKILLS-WORKFLOWS/mmgi/00_archive')).toBe(false);
    });

    it('does not scan loaded vault entries when no fallback paths are requested', () => {
        const app = new App();
        const getAllLoadedFiles = vi.spyOn(app.vault, 'getAllLoadedFiles');

        const index = buildShortcutTargetPathIndex(app, new Set());

        expect(index.foldersByFoldedPath.size).toBe(0);
        expect(index.notesByFoldedPath.size).toBe(0);
        expect(getAllLoadedFiles).not.toHaveBeenCalled();
    });
});
