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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App, TFile } from 'obsidian';
import { TagRenameWorkflow, type TagRenameHooks } from '../../../src/services/tagOperations/TagRenameWorkflow';
import { TagDeleteWorkflow, type TagDeleteHooks } from '../../../src/services/tagOperations/TagDeleteWorkflow';
import { TagFileMutations } from '../../../src/services/tagOperations/TagFileMutations';
import { RenameFile, TagDescriptor, TagReplacement, type RenameFileApplyResult } from '../../../src/services/tagRename/TagRenameEngine';
import { DEFAULT_SETTINGS } from '../../../src/settings/defaultSettings';
import { createTestTFile } from '../../utils/createTestTFile';

class ControlledRenameFile extends RenameFile {
    constructor(
        app: App,
        path: string,
        private readonly shouldRename: boolean
    ) {
        super(app, path, [], false);
    }

    override async renamed(_replacement: TagReplacement): Promise<RenameFileApplyResult> {
        if (this.shouldRename) {
            return { outcome: 'changed' };
        }
        return { outcome: 'skipped', reason: 'no-op' };
    }
}

describe('TagRenameWorkflow', () => {
    let app: App;
    let hooks: TagRenameHooks;
    let workflow: TagRenameWorkflow;

    beforeEach(() => {
        hooks = {
            executeRename: vi.fn().mockResolvedValue({ renamed: 1, total: 1, skipped: 0, failed: 0 }),
            updateTagMetadataAfterRename: vi.fn().mockResolvedValue(undefined),
            updateTagShortcutsAfterRename: vi.fn().mockResolvedValue(undefined),
            notifyTagRenamed: vi.fn()
        };

        app = new App();
        const fileMutations = new TagFileMutations(app, () => DEFAULT_SETTINGS);
        workflow = new TagRenameWorkflow(
            app,
            fileMutations,
            () => null,
            () => null,
            tagPath => tagPath,
            () => hooks
        );
    });

    it('runs rename workflow and notifies listeners', async () => {
        const result = await workflow.runTagRename('Projects/Client', 'Projects/Clients', [new RenameFile(app, 'Notes/One.md', [], false)]);

        expect(result).toBe(true);
        expect(hooks.executeRename).toHaveBeenCalled();
        expect(hooks.updateTagMetadataAfterRename).toHaveBeenCalledWith('Projects/Client', 'Projects/Clients', false, false);
        expect(hooks.updateTagShortcutsAfterRename).toHaveBeenCalledWith('Projects/Client', 'Projects/Clients');
        expect(hooks.notifyTagRenamed).toHaveBeenCalledWith({
            oldPath: 'Projects/Client',
            newPath: 'Projects/Clients',
            oldCanonicalPath: 'projects/client',
            newCanonicalPath: 'projects/clients',
            mergedIntoExisting: false
        });
    });

    it('reports whether a rename into an ancestor keeps the old tag', async () => {
        const tagsByPath: Record<string, string[]> = { 'Notes/One.md': ['#a/b', '#a/z'], 'Archive/Two.md': ['#a/b/b'] };
        Reflect.set(app.metadataCache, 'getCache', (path: string) => ({ tags: (tagsByPath[path] ?? []).map(tag => ({ tag })) }));
        const targets = [new RenameFile(app, 'Notes/One.md', [], false), new RenameFile(app, 'Archive/Two.md', [], false)];

        // #a/b/b becomes #a/b, so #a/b still exists after the rename; read from the notes, which include excluded folders
        await workflow.runTagRename('a/b', 'a', targets);
        expect(hooks.updateTagMetadataAfterRename).toHaveBeenLastCalledWith('a/b', 'a', false, true);

        tagsByPath['Archive/Two.md'] = ['#a/b/x'];
        await workflow.runTagRename('a/b', 'a', targets);
        expect(hooks.updateTagMetadataAfterRename).toHaveBeenLastCalledWith('a/b', 'a', false, false);
    });

    it('does not finalize metadata or events when rename batch has failures', async () => {
        hooks.executeRename = vi.fn().mockResolvedValue({ renamed: 1, total: 2, skipped: 0, failed: 1 });

        const result = await workflow.runTagRename('Projects/Client', 'Projects/Clients', [new RenameFile(app, 'Notes/One.md', [], false)]);

        expect(result).toBe(true);
        expect(hooks.updateTagMetadataAfterRename).not.toHaveBeenCalled();
        expect(hooks.updateTagShortcutsAfterRename).not.toHaveBeenCalled();
        expect(hooks.notifyTagRenamed).not.toHaveBeenCalled();
    });

    it('does not finalize metadata or events when rename batch has skipped files', async () => {
        hooks.executeRename = vi.fn().mockResolvedValue({ renamed: 1, total: 2, skipped: 1, failed: 0 });

        const result = await workflow.runTagRename('Projects/Client', 'Projects/Clients', [new RenameFile(app, 'Notes/One.md', [], false)]);

        expect(result).toBe(true);
        expect(hooks.updateTagMetadataAfterRename).not.toHaveBeenCalled();
        expect(hooks.updateTagShortcutsAfterRename).not.toHaveBeenCalled();
        expect(hooks.notifyTagRenamed).not.toHaveBeenCalled();
    });

    it('rejects descendant renames', async () => {
        const result = await workflow.runTagRename('Project', 'Project/Sub', [new RenameFile(app, 'Notes/One.md', [], false)]);

        expect(result).toBe(false);
        expect(hooks.executeRename).not.toHaveBeenCalled();
        expect(hooks.notifyTagRenamed).not.toHaveBeenCalled();
    });

    it('rejects rename when no targets are provided', async () => {
        const result = await workflow.runTagRename('Project', 'Projects', []);

        expect(result).toBe(false);
        expect(hooks.executeRename).not.toHaveBeenCalled();
    });

    it('counts unchanged targets as skipped during executeRename', async () => {
        const oldTag = new TagDescriptor('Projects/Client');
        const newTag = new TagDescriptor('Projects/Clients');

        const result = await workflow.executeRename({
            oldTag,
            newTag,
            replacement: new TagReplacement(oldTag, newTag),
            targets: [new ControlledRenameFile(app, 'Notes/One.md', true), new ControlledRenameFile(app, 'Notes/Two.md', false)],
            mergeConflict: null,
            keepsOldTag: false
        });

        expect(result).toEqual({ renamed: 1, total: 2, skipped: 1, failed: 0 });
    });
});

describe('TagDeleteWorkflow', () => {
    let hooks: TagDeleteHooks;
    let workflow: TagDeleteWorkflow;
    let app: App;
    let file: TFile & { content: string };
    let deleteTagFromFile: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        file = Object.assign(createTestTFile('Projects/Client.md'), {
            content: '#project/client note'
        });

        deleteTagFromFile = vi.fn().mockResolvedValue(true);

        hooks = {
            deleteTagFromFile,
            removeTagMetadataAfterDelete: vi.fn().mockResolvedValue(undefined),
            removeTagShortcutsAfterDelete: vi.fn().mockResolvedValue(undefined),
            notifyTagDeleted: vi.fn(),
            resolveDisplayTagPath: vi.fn().mockReturnValue('project/client')
        };

        app = new App();
        app.vault.getAbstractFileByPath = vi.fn((path: string) => (path === file.path ? file : null));

        const fileMutations = new TagFileMutations(app, () => DEFAULT_SETTINGS);
        workflow = new TagDeleteWorkflow(
            app,
            fileMutations,
            () => null,
            () => null,
            () => hooks
        );
    });

    it('removes tags across preset paths and notifies listeners', async () => {
        const result = await workflow.runTagDelete('project/client', [file.path]);

        expect(result).toBe(true);
        expect(deleteTagFromFile).toHaveBeenCalledTimes(1);
        expect(deleteTagFromFile.mock.calls[0][0]).toBe(file);
        expect(deleteTagFromFile.mock.calls[0][1]).toBeInstanceOf(TagDescriptor);
        expect(hooks.removeTagMetadataAfterDelete).toHaveBeenCalledWith('project/client');
        expect(hooks.removeTagShortcutsAfterDelete).toHaveBeenCalledWith('project/client');
        expect(hooks.notifyTagDeleted).toHaveBeenCalledWith({
            path: 'project/client',
            canonicalPath: 'project/client'
        });
    });

    it('short-circuits when no tags were removed', async () => {
        deleteTagFromFile.mockResolvedValue(false);

        const result = await workflow.runTagDelete('project/client', [file.path]);

        expect(result).toBe(false);
        expect(hooks.removeTagMetadataAfterDelete).not.toHaveBeenCalled();
        expect(hooks.notifyTagDeleted).not.toHaveBeenCalled();
    });

    it('does not finalize metadata or events when delete batch has failures', async () => {
        const failingFile = Object.assign(createTestTFile('Projects/Blocked.md'), {
            content: '#project/client blocked'
        });
        app.vault.getAbstractFileByPath = vi.fn((path: string) => {
            if (path === file.path) {
                return file;
            }
            if (path === failingFile.path) {
                return failingFile;
            }
            return null;
        });

        deleteTagFromFile.mockImplementation((target: TFile) => {
            if (target.path === failingFile.path) {
                throw new Error('read only');
            }
            return true;
        });

        const result = await workflow.runTagDelete('project/client', [file.path, failingFile.path]);

        expect(result).toBe(true);
        expect(hooks.removeTagMetadataAfterDelete).not.toHaveBeenCalled();
        expect(hooks.removeTagShortcutsAfterDelete).not.toHaveBeenCalled();
        expect(hooks.notifyTagDeleted).not.toHaveBeenCalled();
    });

    it('does not finalize metadata or events when delete batch has skipped files', async () => {
        const skippedFile = Object.assign(createTestTFile('Projects/Skipped.md'), {
            content: '#project/client skipped'
        });
        app.vault.getAbstractFileByPath = vi.fn((path: string) => {
            if (path === file.path) {
                return file;
            }
            if (path === skippedFile.path) {
                return skippedFile;
            }
            return null;
        });

        deleteTagFromFile.mockImplementation((target: TFile) => {
            if (target.path === skippedFile.path) {
                return false;
            }
            return true;
        });

        const result = await workflow.runTagDelete('project/client', [file.path, skippedFile.path]);

        expect(result).toBe(true);
        expect(hooks.removeTagMetadataAfterDelete).not.toHaveBeenCalled();
        expect(hooks.removeTagShortcutsAfterDelete).not.toHaveBeenCalled();
        expect(hooks.notifyTagDeleted).not.toHaveBeenCalled();
    });
});
