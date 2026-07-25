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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App, TFile } from 'obsidian';
import * as TagRenameModule from '../../src/services/tagRename/TagRenameEngine';
import { TagOperations } from '../../src/services/TagOperations';
import { TagRenameWorkflow, type TagRenameAnalysis, type TagRenameResult } from '../../src/services/tagOperations/TagRenameWorkflow';
import { ShortcutType, type ShortcutEntry } from '../../src/types/shortcuts';
import { TAGGED_TAG_ID } from '../../src/types';
import type { NotebookNavigatorSettings } from '../../src/settings';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import type { ITagTreeProvider } from '../../src/interfaces/ITagTreeProvider';
import type { MetadataService } from '../../src/services/MetadataService';
import { createVaultProfile, getActiveVaultProfile } from '../../src/utils/vaultProfiles';
import type { VaultProfile } from '../../src/settings/types';
import { createTestTFile } from '../utils/createTestTFile';

const cachedTagsByPath = new Map<string, string[]>();

vi.mock('../../src/storage/fileOperations', () => ({
    getDBInstance: () => ({
        getCachedTags: (path: string) => cachedTagsByPath.get(path) ?? []
    })
}));

class TestTagOperations extends TagOperations {
    // Test harness compromise:
    // The production `TagOperations` API intentionally keeps many operations `protected` to enforce
    // workflow boundaries. Tests need to exercise those paths directly, but using `as any` bypasses
    // type safety and can hide real issues under stricter ESLint rules.
    //
    // This subclass re-exposes a small surface as `public` purely for testing.
    public override resolveDisplayTagPath(tagPath: string): string {
        return super.resolveDisplayTagPath(tagPath);
    }

    public override executeRename(analysis: TagRenameAnalysis): Promise<TagRenameResult> {
        return super.executeRename(analysis);
    }

    public override updateTagMetadataAfterRename(oldTagPath: string, newTagPath: string, preserveDestination: boolean): Promise<void> {
        return super.updateTagMetadataAfterRename(oldTagPath, newTagPath, preserveDestination);
    }

    public override updateTagShortcutsAfterRename(oldTagPath: string, newTagPath: string): Promise<void> {
        return super.updateTagShortcutsAfterRename(oldTagPath, newTagPath);
    }

    public override runTagRename(
        oldTagPath: string,
        newTagPath: string,
        presetTargets?: TagRenameModule.RenameFile[] | null
    ): Promise<boolean> {
        return super.runTagRename(oldTagPath, newTagPath, presetTargets ?? null);
    }

    public override runTagDelete(tagPath: string, presetPaths?: readonly string[] | null): Promise<boolean> {
        return super.runTagDelete(tagPath, presetPaths ?? null);
    }

    public override deleteTagFromFile(file: TFile, tag: TagRenameModule.TagDescriptor): Promise<boolean> {
        return super.deleteTagFromFile(file, tag);
    }

    public override removeTagMetadataAfterDelete(tagPath: string): Promise<void> {
        return super.removeTagMetadataAfterDelete(tagPath);
    }

    public override removeTagShortcutsAfterDelete(tagPath: string): Promise<void> {
        return super.removeTagShortcutsAfterDelete(tagPath);
    }
}

function createSettings(): NotebookNavigatorSettings {
    return {
        ...DEFAULT_SETTINGS,
        vaultProfiles: DEFAULT_SETTINGS.vaultProfiles.map(profile =>
            createVaultProfile(profile.name, {
                id: profile.id,
                hiddenFolders: profile.hiddenFolders,
                hiddenFileProperties: profile.hiddenFileProperties,
                hiddenFileNames: profile.hiddenFileNames,
                hiddenTags: profile.hiddenTags,
                hiddenFileTags: profile.hiddenFileTags,
                fileVisibility: profile.fileVisibility,
                navigationBanner: profile.navigationBanner,
                shortcuts: profile.shortcuts
            })
        )
    };
}

function createVaultProfileStub(id: string, shortcuts: ShortcutEntry[]): VaultProfile {
    return createVaultProfile(id, {
        id,
        hiddenFolders: [],
        hiddenFileProperties: [],
        hiddenFileNames: [],
        hiddenTags: [],
        hiddenFileTags: [],
        shortcuts
    });
}

function createSettingsProvider(settings: NotebookNavigatorSettings): Omit<ISettingsProvider, 'saveSettingsAndUpdate'> & {
    saveSettingsAndUpdate: ReturnType<typeof vi.fn>;
} {
    const saveSettingsAndUpdate = vi.fn().mockResolvedValue(undefined);
    return {
        settings,
        saveSettingsAndUpdate,
        notifySettingsUpdate: vi.fn(),
        getRecentNotes: () => [],
        setRecentNotes: vi.fn(),
        getRecentIcons: () => ({}),
        setRecentIcons: vi.fn(),
        getRecentColors: () => [],
        setRecentColors: vi.fn()
    };
}

function createTagOperations(settings: NotebookNavigatorSettings) {
    const provider = createSettingsProvider(settings);
    const app = new App();
    const metadataServiceStub = {
        getSettingsProvider: () => provider
    };
    const tagOperations = new TestTagOperations(
        app,
        () => settings,
        () => null,
        () => metadataServiceStub as unknown as MetadataService
    );
    return { tagOperations, provider };
}

beforeEach(() => {
    cachedTagsByPath.clear();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('TagDescriptor', () => {
    it('normalizes canonical form while preserving display casing', () => {
        const descriptor = new TagRenameModule.TagDescriptor('Projects/Archive/');
        expect(descriptor.tag).toBe('#Projects/Archive/');
        expect(descriptor.canonical).toBe('#projects/archive');
        expect(descriptor.canonicalName).toBe('projects/archive');
    });

    it('matches descendants regardless of hash or casing', () => {
        const descriptor = new TagRenameModule.TagDescriptor('#Projects');
        expect(descriptor.matches('projects')).toBe(true);
        expect(descriptor.matches('Projects/Archive')).toBe(true);
        expect(descriptor.matches('#projects/archive')).toBe(true);
    });
});

describe('isDescendantRename', () => {
    it('returns true when the new tag is within the original hierarchy', () => {
        const original = new TagRenameModule.TagDescriptor('Projects');
        const descendant = new TagRenameModule.TagDescriptor('Projects/Archive');
        expect(TagRenameModule.isDescendantRename(original, descendant)).toBe(true);
    });

    it('returns false for unrelated or sibling tags', () => {
        const original = new TagRenameModule.TagDescriptor('Projects');
        const sibling = new TagRenameModule.TagDescriptor('ProjectsArchive');
        expect(TagRenameModule.isDescendantRename(original, sibling)).toBe(false);
    });
});

describe('TagReplacement', () => {
    it('renames lowercase frontmatter tags without hashes', () => {
        const replacement = new TagRenameModule.TagReplacement(
            new TagRenameModule.TagDescriptor('Projects'),
            new TagRenameModule.TagDescriptor('Areas')
        );
        const [updated] = replacement.inArray(['projects'], false, false) as string[];
        expect(updated).toBe('Areas');
    });

    it('renames lowercase tags with descendants', () => {
        const replacement = new TagRenameModule.TagReplacement(
            new TagRenameModule.TagDescriptor('Projects'),
            new TagRenameModule.TagDescriptor('Areas')
        );
        const [updated] = replacement.inArray(['projects/archive'], false, false) as string[];
        expect(updated).toBe('Areas/archive');
    });

    it('detects collisions when renamed tag already exists', () => {
        const replacement = new TagRenameModule.TagReplacement(
            new TagRenameModule.TagDescriptor('Projects'),
            new TagRenameModule.TagDescriptor('Areas')
        );
        const collision = replacement.willMergeTags(['#Projects', '#areas']);
        expect(collision).not.toBeNull();
        if (!collision) {
            return;
        }
        const [origin, target] = collision;
        expect(origin.canonical).toBe('#projects');
        expect(target.canonical).toBe('#areas');
    });

    it('renames tags and detects collisions across NFC and NFD-equivalent forms', () => {
        const replacement = new TagRenameModule.TagReplacement(
            new TagRenameModule.TagDescriptor('réunion'),
            new TagRenameModule.TagDescriptor('areas')
        );

        const [updated] = replacement.inArray(['re\u0301union/notes'], false, false) as string[];
        expect(updated).toBe('areas/notes');

        const collision = replacement.willMergeTags(['#réunion', '#areas']);
        expect(collision).not.toBeNull();
    });

    it('renames inline tag strings across NFC and NFD-equivalent forms', () => {
        const replacement = new TagRenameModule.TagReplacement(
            new TagRenameModule.TagDescriptor('réunion'),
            new TagRenameModule.TagDescriptor('areas')
        );

        expect(replacement.inString('#re\u0301union')).toBe('#areas');
        expect(replacement.inString('#re\u0301union/notes')).toBe('#areas/notes');

        const collision = replacement.willMergeTags(['#re\u0301union', '#areas']);
        expect(collision).not.toBeNull();
        if (!collision) {
            return;
        }

        const [origin, target] = collision;
        expect(origin.canonical).toBe('#réunion');
        expect(target.canonical).toBe('#areas');
    });
});

describe('RenameFile', () => {
    it('renames inline NFD tags without leaving combining marks behind', async () => {
        const file = Object.assign(createTestTFile('Reunion.md'), {
            content: 'Plan #re\u0301union/notes today'
        });
        const matchedTag = '#re\u0301union/notes';
        const startOffset = file.content.indexOf(matchedTag);
        const endOffset = startOffset + matchedTag.length;
        const tagCache = {
            tag: matchedTag,
            position: {
                start: { line: 0, col: startOffset, offset: startOffset },
                end: { line: 0, col: endOffset, offset: endOffset }
            }
        };

        const app = new App();
        app.vault.getAbstractFileByPath = vi.fn((path: string) => (path === file.path ? file : null));
        app.vault.read = vi.fn(async () => file.content);
        app.vault.modify = vi.fn(async (_file: TFile, content: string) => {
            file.content = content;
        });

        const renameFile = new TagRenameModule.RenameFile(app, file.path, [tagCache], false);
        const replacement = new TagRenameModule.TagReplacement(
            new TagRenameModule.TagDescriptor('réunion'),
            new TagRenameModule.TagDescriptor('areas')
        );

        const result = await renameFile.renamed(replacement);

        expect(result).toEqual({ outcome: 'changed' });
        expect(file.content).toBe('Plan #areas/notes today');
        expect(file.content).not.toContain('\u0301');
    });
});

describe('TagOperations shortcut migration', () => {
    it('renames tag shortcuts that match the renamed tag', async () => {
        const settings = createSettings();
        const profile = getActiveVaultProfile(settings);
        profile.shortcuts = [
            { type: ShortcutType.TAG, tagPath: 'projects' },
            { type: ShortcutType.NOTE, path: 'Notes.md' },
            { type: ShortcutType.TAG, tagPath: 'projects/client' }
        ];
        const { tagOperations, provider } = createTagOperations(settings);

        await tagOperations.updateTagShortcutsAfterRename('projects', 'areas');

        expect(profile.shortcuts).toEqual([
            { type: ShortcutType.TAG, tagPath: 'areas' },
            { type: ShortcutType.NOTE, path: 'Notes.md' },
            { type: ShortcutType.TAG, tagPath: 'areas/client' }
        ]);
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('drops shortcuts when rename collides with existing destination', async () => {
        const settings = createSettings();
        const profile = getActiveVaultProfile(settings);
        profile.shortcuts = [
            { type: ShortcutType.TAG, tagPath: 'areas' },
            { type: ShortcutType.TAG, tagPath: 'projects' }
        ];
        const { tagOperations, provider } = createTagOperations(settings);

        await tagOperations.updateTagShortcutsAfterRename('projects', 'areas');

        expect(profile.shortcuts).toEqual([{ type: ShortcutType.TAG, tagPath: 'areas' }]);
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('leaves shortcuts untouched when new path matches old path after normalization', async () => {
        const settings = createSettings();
        const profile = getActiveVaultProfile(settings);
        profile.shortcuts = [{ type: ShortcutType.TAG, tagPath: 'projects' }];
        const { tagOperations, provider } = createTagOperations(settings);

        await tagOperations.updateTagShortcutsAfterRename('Projects', 'projects');

        expect(profile.shortcuts).toEqual([{ type: ShortcutType.TAG, tagPath: 'projects' }]);
        expect(provider.saveSettingsAndUpdate).not.toHaveBeenCalled();
    });

    it('renames legacy NFD tag shortcuts using canonical path matching', async () => {
        const settings = createSettings();
        const profile = getActiveVaultProfile(settings);
        profile.shortcuts = [
            { type: ShortcutType.TAG, tagPath: 're\u0301union' },
            { type: ShortcutType.TAG, tagPath: 're\u0301union/notes' },
            { type: ShortcutType.NOTE, path: 'Notes.md' }
        ];
        const { tagOperations, provider } = createTagOperations(settings);

        await tagOperations.updateTagShortcutsAfterRename('réunion', 'areas');

        expect(profile.shortcuts).toEqual([
            { type: ShortcutType.TAG, tagPath: 'areas' },
            { type: ShortcutType.TAG, tagPath: 'areas/notes' },
            { type: ShortcutType.NOTE, path: 'Notes.md' }
        ]);
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });
});

describe('TagOperations shortcut cleanup on delete', () => {
    it('removes tag shortcuts for deleted tag hierarchy', async () => {
        const settings = createSettings();
        const profile = getActiveVaultProfile(settings);
        profile.shortcuts = [
            { type: ShortcutType.TAG, tagPath: 'projects' },
            { type: ShortcutType.TAG, tagPath: 'projects/client' },
            { type: ShortcutType.NOTE, path: 'Notes.md' }
        ];
        const { tagOperations, provider } = createTagOperations(settings);

        await tagOperations.removeTagShortcutsAfterDelete('projects');

        expect(profile.shortcuts).toEqual([{ type: ShortcutType.NOTE, path: 'Notes.md' }]);
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('skips saving when no shortcuts reference deleted tag', async () => {
        const settings = createSettings();
        const profile = getActiveVaultProfile(settings);
        profile.shortcuts = [{ type: ShortcutType.NOTE, path: 'Notes.md' }];
        const { tagOperations, provider } = createTagOperations(settings);

        await tagOperations.removeTagShortcutsAfterDelete('projects');

        expect(profile.shortcuts).toEqual([{ type: ShortcutType.NOTE, path: 'Notes.md' }]);
        expect(provider.saveSettingsAndUpdate).not.toHaveBeenCalled();
    });

    it('removes legacy NFD tag shortcuts when deleting a canonical tag path', async () => {
        const settings = createSettings();
        const profile = getActiveVaultProfile(settings);
        profile.shortcuts = [
            { type: ShortcutType.TAG, tagPath: 're\u0301union' },
            { type: ShortcutType.TAG, tagPath: 're\u0301union/notes' },
            { type: ShortcutType.NOTE, path: 'Notes.md' }
        ];
        const { tagOperations, provider } = createTagOperations(settings);

        await tagOperations.removeTagShortcutsAfterDelete('réunion');

        expect(profile.shortcuts).toEqual([{ type: ShortcutType.NOTE, path: 'Notes.md' }]);
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });
});

describe('TagOperations multi-profile shortcuts', () => {
    it('renames tag shortcuts across every vault profile', async () => {
        const settings = createSettings();
        const primary = getActiveVaultProfile(settings);
        primary.shortcuts = [
            { type: ShortcutType.TAG, tagPath: 'projects' },
            { type: ShortcutType.TAG, tagPath: 'projects/delta' }
        ];
        const secondary = createVaultProfileStub('secondary', [
            { type: ShortcutType.TAG, tagPath: 'projects' },
            { type: ShortcutType.NOTE, path: 'Other.md' },
            { type: ShortcutType.TAG, tagPath: 'projects/beta' }
        ]);
        settings.vaultProfiles.push(secondary);

        const { tagOperations, provider } = createTagOperations(settings);

        await tagOperations.updateTagShortcutsAfterRename('projects', 'areas');

        expect(primary.shortcuts).toEqual([
            { type: ShortcutType.TAG, tagPath: 'areas' },
            { type: ShortcutType.TAG, tagPath: 'areas/delta' }
        ]);
        expect(secondary.shortcuts).toEqual([
            { type: ShortcutType.TAG, tagPath: 'areas' },
            { type: ShortcutType.NOTE, path: 'Other.md' },
            { type: ShortcutType.TAG, tagPath: 'areas/beta' }
        ]);
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('removes deleted tag shortcuts from every vault profile', async () => {
        const settings = createSettings();
        const primary = getActiveVaultProfile(settings);
        primary.shortcuts = [
            { type: ShortcutType.TAG, tagPath: 'projects' },
            { type: ShortcutType.NOTE, path: 'Notes.md' }
        ];
        const secondary = createVaultProfileStub('secondary', [
            { type: ShortcutType.TAG, tagPath: 'projects/child' },
            { type: ShortcutType.NOTE, path: 'Archive.md' }
        ]);
        settings.vaultProfiles.push(secondary);

        const { tagOperations, provider } = createTagOperations(settings);

        await tagOperations.removeTagShortcutsAfterDelete('projects');

        expect(primary.shortcuts).toEqual([{ type: ShortcutType.NOTE, path: 'Notes.md' }]);
        expect(secondary.shortcuts).toEqual([{ type: ShortcutType.NOTE, path: 'Archive.md' }]);
        expect(provider.saveSettingsAndUpdate).toHaveBeenCalledTimes(1);
    });
});

describe('TagOperations tag deletion', () => {
    it('removes direct and descendant tags from a file once confirmed', async () => {
        const settings = createSettings();
        const frontmatter = {
            tags: ['project', 'project/client'] as string[] | string,
            aliases: ['#project', '#project/client', 'Project kickoff'],
            alias: '#project/client'
        };
        const file = Object.assign(createTestTFile('Project.md'), {
            frontmatter,
            content: '#project kickoff\nTasks include #project/client follow-up.'
        });

        cachedTagsByPath.set(file.path, ['project', 'project/client']);

        const app = new App();
        const getAbstractFileByPath = vi.fn((path: string) => (path === file.path ? file : null));
        const processFrontMatter = vi.fn((_file: TFile, callback: (fm: Record<string, unknown>) => void) => {
            callback(file.frontmatter);
            return Promise.resolve();
        });
        const process = vi.fn(async (_file: TFile, processor: (content: string) => string) => {
            file.content = processor(file.content);
            return file.content;
        });
        app.vault.getAbstractFileByPath = getAbstractFileByPath;
        app.fileManager.processFrontMatter = processFrontMatter;
        app.vault.process = process;

        const provider = createSettingsProvider(settings);
        const metadataService = {
            getSettingsProvider: () => provider,
            handleTagDelete: vi.fn().mockResolvedValue(undefined)
        };

        const tagOperations = new TestTagOperations(
            app,
            () => settings,
            () => null,
            () => metadataService as unknown as MetadataService
        );

        const result = await tagOperations.runTagDelete('project', [file.path]);

        expect(result).toBe(true);
        expect(processFrontMatter).toHaveBeenCalled();
        expect(process).toHaveBeenCalled();
        expect(file.frontmatter.tags).toBeUndefined();
        expect(file.frontmatter.aliases).toEqual(['Project kickoff']);
        expect(file.frontmatter.alias).toBeUndefined();
        expect(file.content).not.toContain('#project');
        expect(file.content).not.toContain('#project/client');
        expect(file.content).not.toContain('/client');
        expect(metadataService.handleTagDelete).toHaveBeenCalledWith('project');
    });

    it('removes tags when frontmatter uses scalar string formatting', async () => {
        const settings = createSettings();
        const frontmatter = {
            tags: 'project project/client other'
        };

        const file = Object.assign(createTestTFile('Scalar.md'), {
            frontmatter,
            content: '#project details and #project/client next steps'
        });

        cachedTagsByPath.set(file.path, ['project', 'project/client', 'other']);

        const app = new App();
        const getAbstractFileByPath = vi.fn((path: string) => (path === file.path ? file : null));
        const processFrontMatter = vi.fn((_file: TFile, callback: (fm: Record<string, unknown>) => void) => {
            callback(file.frontmatter);
            return Promise.resolve();
        });
        const read = vi.fn(async () => file.content);
        const modify = vi.fn(async (_file: TFile, data: string) => {
            file.content = data;
        });
        const process = vi.fn();
        app.vault.getAbstractFileByPath = getAbstractFileByPath;
        app.fileManager.processFrontMatter = processFrontMatter;
        app.vault.read = read;
        app.vault.modify = modify;
        app.vault.process = process;

        const provider = createSettingsProvider(settings);
        const metadataService = {
            getSettingsProvider: () => provider,
            handleTagDelete: vi.fn().mockResolvedValue(undefined)
        };

        const tagOperations = new TestTagOperations(
            app,
            () => settings,
            () => null,
            () => metadataService as unknown as MetadataService
        );

        const result = await tagOperations.runTagDelete('project', [file.path]);

        expect(result).toBe(true);
        expect(processFrontMatter).toHaveBeenCalled();
        expect(read).toHaveBeenCalled();
        expect(modify).toHaveBeenCalled();
        expect(file.frontmatter.tags).toBe('other');
        expect(file.content).not.toContain('#project');
        expect(file.content).not.toContain('#project/client');
        expect(metadataService.handleTagDelete).toHaveBeenCalledWith('project');
    });

    it('handles malformed tag separators when deleting tag hierarchies', async () => {
        const settings = createSettings();
        const frontmatter = {
            tags: ['project//client', 'project//client/research', 'other'],
            aliases: ['#project//client', '#project//client/research'],
            alias: '#project//client'
        };
        const file = Object.assign(createTestTFile('Client.md'), {
            frontmatter,
            content: 'Meeting notes for #project//client.\nFollow-up tasks #project//client/research.'
        });

        cachedTagsByPath.set(file.path, ['project//client', 'project//client/research', 'other']);

        const app = new App();
        const getAbstractFileByPath = vi.fn((path: string) => (path === file.path ? file : null));
        const processFrontMatter = vi.fn((_file: TFile, callback: (fm: Record<string, unknown>) => void) => {
            callback(file.frontmatter);
            return Promise.resolve();
        });
        const read = vi.fn(async () => file.content);
        const modify = vi.fn(async (_file: TFile, data: string) => {
            file.content = data;
        });
        const process = vi.fn();
        app.vault.getAbstractFileByPath = getAbstractFileByPath;
        app.fileManager.processFrontMatter = processFrontMatter;
        app.vault.read = read;
        app.vault.modify = modify;
        app.vault.process = process;

        const provider = createSettingsProvider(settings);
        const metadataService = {
            getSettingsProvider: () => provider,
            handleTagDelete: vi.fn().mockResolvedValue(undefined)
        };

        const tagOperations = new TestTagOperations(
            app,
            () => settings,
            () => null,
            () => metadataService as unknown as MetadataService
        );

        const result = await tagOperations.runTagDelete('project//client', [file.path]);

        expect(result).toBe(true);
        expect(processFrontMatter).toHaveBeenCalled();
        expect(read).toHaveBeenCalled();
        expect(modify).toHaveBeenCalled();
        expect(file.frontmatter.tags).toEqual(['other']);
        expect(file.frontmatter.aliases).toBeUndefined();
        expect(file.frontmatter.alias).toBeUndefined();
        expect(file.content).not.toContain('#project//client');
        expect(file.content).not.toContain('#project//client/research');
        expect(metadataService.handleTagDelete).toHaveBeenCalledWith('project//client');
    });

    it('preserves hyphenated and underscored tags when deleting base inline tags', async () => {
        const settings = createSettings();
        const frontmatter = {
            tags: ['project', 'project/client', 'project-archive', 'project_2024']
        };
        const file = Object.assign(createTestTFile('Mixed.md'), {
            frontmatter,
            content: 'Summary #project overview #project-archive tasks #project_2024 next #project/client wrap'
        });

        cachedTagsByPath.set(file.path, ['project', 'project/client', 'project-archive', 'project_2024']);

        const app = new App();
        const getAbstractFileByPath = vi.fn((path: string) => (path === file.path ? file : null));
        const processFrontMatter = vi.fn((_file: TFile, callback: (fm: Record<string, unknown>) => void) => {
            callback(file.frontmatter);
            return Promise.resolve();
        });
        const read = vi.fn(async () => file.content);
        const modify = vi.fn(async (_file: TFile, data: string) => {
            file.content = data;
        });
        const process = vi.fn();
        app.vault.getAbstractFileByPath = getAbstractFileByPath;
        app.fileManager.processFrontMatter = processFrontMatter;
        app.vault.read = read;
        app.vault.modify = modify;
        app.vault.process = process;

        const provider = createSettingsProvider(settings);
        const metadataService = {
            getSettingsProvider: () => provider,
            handleTagDelete: vi.fn().mockResolvedValue(undefined)
        };

        const tagOperations = new TestTagOperations(
            app,
            () => settings,
            () => null,
            () => metadataService as unknown as MetadataService
        );

        const result = await tagOperations.runTagDelete('project', [file.path]);

        expect(result).toBe(true);
        expect(file.frontmatter.tags).toEqual(['project-archive', 'project_2024']);
        expect(file.content).toContain('#project-archive');
        expect(file.content).toContain('#project_2024');
        expect(file.content).not.toContain('#project/client');
        expect(/#project(?![-_/])/u.test(file.content)).toBe(false);
        expect(metadataService.handleTagDelete).toHaveBeenCalledWith('project');
    });

    it('notifies listeners after successful tag delete', async () => {
        const settings = createSettings();
        const file = createTestTFile('Project.md');
        const app = new App();
        app.vault.getAbstractFileByPath = vi.fn((path: string) => (path === file.path ? file : null));

        const tagOperations = new TestTagOperations(
            app,
            () => settings,
            () => null,
            () => null
        );

        vi.spyOn(tagOperations, 'deleteTagFromFile').mockResolvedValue(true);
        vi.spyOn(tagOperations, 'removeTagMetadataAfterDelete').mockResolvedValue(undefined);
        vi.spyOn(tagOperations, 'removeTagShortcutsAfterDelete').mockResolvedValue(undefined);

        const listener = vi.fn();
        const unsubscribe = tagOperations.addTagDeleteListener(listener);

        const result = await tagOperations.runTagDelete('project', [file.path]);

        expect(result).toBe(true);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
                canonicalPath: 'project',
                path: 'project'
            })
        );

        unsubscribe();
    });
});

describe('TagOperations tag rename workflow', () => {
    function createTagOperationsInstance(
        overrides: {
            settings?: NotebookNavigatorSettings;
            tagTree?: Partial<ITagTreeProvider> | null;
            metadataService?: Partial<MetadataService> | null;
        } = {}
    ) {
        const settings = overrides.settings ?? createSettings();
        const tagTree = overrides.tagTree ?? null;
        const metadataService = overrides.metadataService ?? null;
        const app = new App();

        return new TestTagOperations(
            app,
            () => settings,
            () => tagTree as ITagTreeProvider | null,
            () => metadataService as MetadataService | null
        );
    }

    function createRenameTargets(count = 1): TagRenameModule.RenameFile[] {
        return Array.from({ length: count }, (_, index) => ({
            filePath: `Note-${index}.md`,
            renamed: vi.fn().mockResolvedValue(true)
        })) as unknown as TagRenameModule.RenameFile[];
    }

    it('rejects descendant rename requests', async () => {
        const tagOperations = createTagOperationsInstance();
        const executeSpy = vi.spyOn(tagOperations, 'executeRename');
        const metadataSpy = vi.spyOn(tagOperations, 'updateTagMetadataAfterRename');
        const shortcutsSpy = vi.spyOn(tagOperations, 'updateTagShortcutsAfterRename');

        const result = await tagOperations.runTagRename('projects', 'projects/client', createRenameTargets());

        expect(result).toBe(false);
        expect(executeSpy).not.toHaveBeenCalled();
        expect(metadataSpy).not.toHaveBeenCalled();
        expect(shortcutsSpy).not.toHaveBeenCalled();
    });

    it('rejects renames that keep the same tag', async () => {
        const tagOperations = createTagOperationsInstance();
        const executeSpy = vi.spyOn(tagOperations, 'executeRename');

        const result = await tagOperations.runTagRename('projects', 'projects', createRenameTargets());

        expect(result).toBe(false);
        expect(executeSpy).not.toHaveBeenCalled();
    });

    it('rejects renames with no target files', async () => {
        const tagOperations = createTagOperationsInstance();
        const executeSpy = vi.spyOn(tagOperations, 'executeRename');

        const result = await tagOperations.runTagRename('projects', 'areas', []);

        expect(result).toBe(false);
        expect(executeSpy).not.toHaveBeenCalled();
    });

    it('aborts when rename produces no file updates', async () => {
        const tagOperations = createTagOperationsInstance();
        vi.spyOn(tagOperations, 'executeRename').mockResolvedValue({
            renamed: 0,
            total: 2,
            skipped: 0,
            failed: 0
        });
        const metadataSpy = vi.spyOn(tagOperations, 'updateTagMetadataAfterRename');
        const shortcutsSpy = vi.spyOn(tagOperations, 'updateTagShortcutsAfterRename');

        const result = await tagOperations.runTagRename('projects', 'areas', createRenameTargets(2));

        expect(result).toBe(false);
        expect(metadataSpy).not.toHaveBeenCalled();
        expect(shortcutsSpy).not.toHaveBeenCalled();
    });

    it('updates metadata and shortcuts after successful rename', async () => {
        const tagOperations = createTagOperationsInstance();
        vi.spyOn(tagOperations, 'executeRename').mockResolvedValue({
            renamed: 3,
            total: 3,
            skipped: 0,
            failed: 0
        });
        const metadataSpy = vi.spyOn(tagOperations, 'updateTagMetadataAfterRename').mockResolvedValue(undefined);
        const shortcutsSpy = vi.spyOn(tagOperations, 'updateTagShortcutsAfterRename').mockResolvedValue(undefined);

        const result = await tagOperations.runTagRename('projects', 'areas', createRenameTargets(3));

        expect(result).toBe(true);
        expect(metadataSpy).toHaveBeenCalledWith('projects', 'areas', false);
        expect(shortcutsSpy).toHaveBeenCalledWith('projects', 'areas');
    });

    it('skips metadata and events when rename has file failures', async () => {
        const tagOperations = createTagOperationsInstance();
        vi.spyOn(tagOperations, 'executeRename').mockResolvedValue({
            renamed: 2,
            total: 3,
            skipped: 0,
            failed: 1
        });
        const metadataSpy = vi.spyOn(tagOperations, 'updateTagMetadataAfterRename').mockResolvedValue(undefined);
        const shortcutsSpy = vi.spyOn(tagOperations, 'updateTagShortcutsAfterRename').mockResolvedValue(undefined);
        const listener = vi.fn();
        const unsubscribe = tagOperations.addTagRenameListener(listener);

        const result = await tagOperations.runTagRename('projects', 'areas', createRenameTargets(3));

        expect(result).toBe(true);
        expect(metadataSpy).not.toHaveBeenCalled();
        expect(shortcutsSpy).not.toHaveBeenCalled();
        expect(listener).not.toHaveBeenCalled();

        unsubscribe();
    });

    it('notifies listeners after successful rename', async () => {
        const tagOperations = createTagOperationsInstance();
        vi.spyOn(tagOperations, 'executeRename').mockResolvedValue({
            renamed: 2,
            total: 2,
            skipped: 0,
            failed: 0
        });
        vi.spyOn(tagOperations, 'updateTagMetadataAfterRename').mockResolvedValue(undefined);
        vi.spyOn(tagOperations, 'updateTagShortcutsAfterRename').mockResolvedValue(undefined);

        const listener = vi.fn();
        const unsubscribe = tagOperations.addTagRenameListener(listener);

        const result = await tagOperations.runTagRename('projects/client', 'areas/client', createRenameTargets(2));

        expect(result).toBe(true);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
                oldCanonicalPath: 'projects/client',
                newCanonicalPath: 'areas/client',
                mergedIntoExisting: false
            })
        );

        unsubscribe();
    });
});

describe('TagOperations drag-based tag renames', () => {
    function createTagOperationsInstance() {
        const settings = createSettings();
        const app = new App();
        return new TestTagOperations(
            app,
            () => settings,
            () => null,
            () => null
        );
    }

    it('promotes nested tags to root leaf name', async () => {
        const tagOperations = createTagOperationsInstance();
        vi.spyOn(tagOperations, 'resolveDisplayTagPath').mockImplementation((path: string) => {
            if (path === 'sourceTag') {
                return 'projects/client';
            }
            return path;
        });
        const modalSpy = vi.spyOn(TagRenameWorkflow.prototype, 'promptRenameTag').mockResolvedValue(undefined);

        await tagOperations.promoteTagToRoot('sourceTag');

        expect(modalSpy).toHaveBeenCalledWith('projects/client', 'client');
    });

    it('skips promotion when tag already at root', async () => {
        const tagOperations = createTagOperationsInstance();
        vi.spyOn(tagOperations, 'resolveDisplayTagPath').mockReturnValue('projects');
        const modalSpy = vi.spyOn(TagRenameWorkflow.prototype, 'promptRenameTag').mockResolvedValue(undefined);

        await tagOperations.promoteTagToRoot('projects');

        expect(modalSpy).not.toHaveBeenCalled();
    });

    it('renames dragged tag under target hierarchy', async () => {
        const tagOperations = createTagOperationsInstance();
        vi.spyOn(tagOperations, 'resolveDisplayTagPath').mockImplementation((path: string) => {
            if (path === 'sourceTag') {
                return 'projects/client';
            }
            if (path === 'targetTag') {
                return 'areas';
            }
            return path;
        });
        const modalSpy = vi.spyOn(TagRenameWorkflow.prototype, 'promptRenameTag').mockResolvedValue(undefined);

        await tagOperations.renameTagByDrag('sourceTag', 'targetTag');

        expect(modalSpy).toHaveBeenCalledWith('projects/client', 'areas/client');
    });

    it('renames dragged tag to root when dropping on empty target', async () => {
        const tagOperations = createTagOperationsInstance();
        vi.spyOn(tagOperations, 'resolveDisplayTagPath').mockImplementation((path: string) => {
            if (path === 'sourceTag') {
                return 'projects/client';
            }
            if (path === 'targetTag') {
                return '';
            }
            return path;
        });
        const modalSpy = vi.spyOn(TagRenameWorkflow.prototype, 'promptRenameTag').mockResolvedValue(undefined);

        await tagOperations.renameTagByDrag('sourceTag', 'targetTag');

        expect(modalSpy).toHaveBeenCalledWith('projects/client', 'client');
    });

    it('skips drag rename when target is virtual tag collection', async () => {
        const tagOperations = createTagOperationsInstance();
        const resolveSpy = vi.spyOn(tagOperations, 'resolveDisplayTagPath');
        const modalSpy = vi.spyOn(TagRenameWorkflow.prototype, 'promptRenameTag').mockResolvedValue(undefined);

        await tagOperations.renameTagByDrag('sourceTag', TAGGED_TAG_ID);

        expect(resolveSpy).not.toHaveBeenCalled();
        expect(modalSpy).not.toHaveBeenCalled();
    });

    it('skips drag rename when target resolves to same path', async () => {
        const tagOperations = createTagOperationsInstance();
        vi.spyOn(tagOperations, 'resolveDisplayTagPath').mockImplementation((path: string) => {
            if (path === 'sourceTag') {
                return 'projects/client';
            }
            if (path === 'targetTag') {
                return 'projects';
            }
            return path;
        });
        const modalSpy = vi.spyOn(TagRenameWorkflow.prototype, 'promptRenameTag').mockResolvedValue(undefined);

        await tagOperations.renameTagByDrag('sourceTag', 'targetTag');

        expect(modalSpy).not.toHaveBeenCalled();
    });
});
