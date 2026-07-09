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
import { FileView, type App, type TFile, type WorkspaceLeaf } from 'obsidian';
import { findOpenMainLeafForFile, openFileInResolvedLeaf, resolveFileOpenLeaf } from '../../src/hooks/useFileOpener';
import { createTestTFile } from '../utils/createTestTFile';

function createFileView(file: TFile): FileView {
    return Object.setPrototypeOf({ file }, FileView.prototype) as FileView;
}

function createFileLeaf(file: TFile, split: object) {
    const openFile = vi.fn().mockResolvedValue(undefined);
    const leaf = {
        parent: { parent: split },
        view: createFileView(file),
        openFile,
        getViewState: () => ({ state: { file: file.path } })
    } as unknown as WorkspaceLeaf;

    return { leaf, openFile };
}

function createEmptyLeaf(split: object) {
    const openFile = vi.fn().mockResolvedValue(undefined);
    const leaf = {
        parent: { parent: split },
        view: {},
        openFile,
        getViewState: () => ({ state: {} })
    } as unknown as WorkspaceLeaf;

    return { leaf, openFile };
}

interface TestWorkspaceSplits {
    rootSplit: object;
    rightSplit: object;
}

function createApp(leaves: WorkspaceLeaf[], fallbackLeaf: WorkspaceLeaf, splits: TestWorkspaceSplits) {
    const getLeaf = vi.fn(() => fallbackLeaf);
    const revealLeaf = vi.fn().mockResolvedValue(undefined);
    const setActiveLeaf = vi.fn();

    const app = {
        workspace: {
            rootSplit: splits.rootSplit,
            rightSplit: splits.rightSplit,
            getLeavesOfType: vi.fn(() => leaves),
            getLeaf,
            revealLeaf,
            setActiveLeaf
        }
    } as unknown as App;

    return { app, getLeaf, revealLeaf, setActiveLeaf };
}

describe('useFileOpener helpers', () => {
    it('finds an existing main workspace leaf displaying the target file', () => {
        const file = createTestTFile('README.md');
        const splits = { rootSplit: {}, rightSplit: {} };
        const fallbackLeaf = createEmptyLeaf(splits.rootSplit).leaf;
        const rightLeaf = createFileLeaf(file, splits.rightSplit).leaf;
        const mainLeaf = createFileLeaf(file, splits.rootSplit).leaf;
        const { app } = createApp([rightLeaf, mainLeaf], fallbackLeaf, splits);

        expect(findOpenMainLeafForFile(app, file)).toBe(mainLeaf);
    });

    it('falls back to the current workspace leaf when only a right sidebar leaf displays the file', () => {
        const file = createTestTFile('README.md');
        const splits = { rootSplit: {}, rightSplit: {} };
        const fallbackLeaf = createEmptyLeaf(splits.rootSplit).leaf;
        const rightLeaf = createFileLeaf(file, splits.rightSplit).leaf;
        const { app, getLeaf } = createApp([rightLeaf], fallbackLeaf, splits);

        expect(resolveFileOpenLeaf(app, file, null)).toBe(fallbackLeaf);
        expect(getLeaf).toHaveBeenCalledWith(false);
    });

    it('reveals and activates an existing matching leaf instead of reopening the file', async () => {
        const file = createTestTFile('README.md');
        const splits = { rootSplit: {}, rightSplit: {} };
        const { leaf: matchingLeaf, openFile } = createFileLeaf(file, splits.rootSplit);
        const { app, revealLeaf, setActiveLeaf } = createApp([], matchingLeaf, splits);

        await openFileInResolvedLeaf(app, matchingLeaf, file, false);

        expect(revealLeaf).toHaveBeenCalledWith(matchingLeaf);
        expect(setActiveLeaf).toHaveBeenCalledWith(matchingLeaf, { focus: false });
        expect(openFile).not.toHaveBeenCalled();
    });

    it('opens the target leaf when it is not already displaying the file', async () => {
        const file = createTestTFile('README.md');
        const otherFile = createTestTFile('notes/other.md');
        const splits = { rootSplit: {}, rightSplit: {} };
        const { leaf: targetLeaf, openFile } = createFileLeaf(otherFile, splits.rootSplit);
        const { app, revealLeaf, setActiveLeaf } = createApp([], targetLeaf, splits);

        await openFileInResolvedLeaf(app, targetLeaf, file, false);

        expect(openFile).toHaveBeenCalledWith(file, { active: false });
        expect(revealLeaf).not.toHaveBeenCalled();
        expect(setActiveLeaf).not.toHaveBeenCalled();
    });
});
