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

import { describe, expect, it } from 'vitest';
import type { FileData } from '../../src/storage/IndexedDBStorage';
import { markFilesForRegeneration } from '../../src/storage/fileOperations';
import { createTestTFile } from '../utils/createTestTFile';

class FakeDb {
    private readonly files = new Map<string, FileData>();

    setFile(path: string, data: FileData): void {
        this.files.set(path, { ...data });
    }

    getFile(path: string): FileData | null {
        return this.files.get(path) ?? null;
    }

    getFiles(paths: string[]): Map<string, FileData> {
        const result = new Map<string, FileData>();
        for (const path of paths) {
            const data = this.files.get(path);
            if (data) {
                result.set(path, { ...data });
            }
        }
        return result;
    }

    async upsertFilesWithPatch(updates: { path: string; create: FileData; patch?: Partial<FileData> }[]): Promise<void> {
        for (const update of updates) {
            const existing = this.files.get(update.path);
            this.files.set(update.path, { ...(existing ?? update.create), ...(update.patch ?? {}) });
        }
    }
}

function createFileData(overrides: Partial<FileData>): FileData {
    return {
        mtime: 0,
        markdownPipelineMtime: 0,
        tagsMtime: 0,
        metadataMtime: 0,
        fileThumbnailsMtime: 0,
        tags: null,
        wordCount: null,
        characterCountWithSpaces: null,
        characterCountWithoutSpaces: null,
        taskTotal: 0,
        taskUnfinished: 0,
        properties: null,
        previewStatus: 'unprocessed',
        featureImage: null,
        featureImageStatus: 'unprocessed',
        featureImageKey: null,
        metadata: null,
        ...overrides
    };
}

describe('markFilesForRegeneration', () => {
    it('resets only requested provider mtimes when providers are specified', async () => {
        const db = new FakeDb();
        const file = createTestTFile('notes/note.md');
        file.stat.mtime = 500;
        db.setFile(
            file.path,
            createFileData({
                mtime: 400,
                markdownPipelineMtime: 300,
                tagsMtime: 301,
                metadataMtime: 302,
                fileThumbnailsMtime: 303
            })
        );

        await markFilesForRegeneration([file], ['markdownPipeline'], db);

        const updated = db.getFile(file.path);
        expect(updated).not.toBeNull();
        if (!updated) {
            throw new Error('Expected updated file data');
        }
        expect(updated.mtime).toBe(500);
        expect(updated.markdownPipelineMtime).toBe(0);
        expect(updated.tagsMtime).toBe(301);
        expect(updated.metadataMtime).toBe(302);
        expect(updated.fileThumbnailsMtime).toBe(303);
    });
});
