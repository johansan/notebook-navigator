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
import { MemoryFileCache } from '../../src/storage/MemoryFileCache';
import {
    runBatchUpdateFileContentAndProviderProcessedMtimes,
    type BatchContentUpdate
} from '../../src/storage/indexeddb/batchContentUpdateOperation';
import { createDefaultFileData, type FileContentChange, type FileData } from '../../src/storage/indexeddb/fileData';
import { normalizeFileData } from '../../src/storage/indexeddb/normalizeFileData';
import { MockIDBDatabase } from './mockIndexedDB';

const FILE_PATH = 'notes/tasks.md';

function asIdb(db: MockIDBDatabase<FileData>): IDBDatabase {
    return db as unknown as IDBDatabase;
}

async function runTaskUpdate(
    previous: Pick<FileData, 'taskTotal' | 'taskUnfinished'>,
    update: Pick<BatchContentUpdate, 'taskTotal' | 'taskUnfinished'>
): Promise<{ emittedChanges: FileContentChange[][]; persisted: FileData }> {
    const existing = createDefaultFileData({ mtime: 1, path: FILE_PATH });
    existing.taskTotal = previous.taskTotal;
    existing.taskUnfinished = previous.taskUnfinished;
    const records = new Map<string, FileData>([[FILE_PATH, existing]]);
    const emittedChanges: FileContentChange[][] = [];

    await runBatchUpdateFileContentAndProviderProcessedMtimes(
        {
            db: asIdb(new MockIDBDatabase(records)),
            cache: new MemoryFileCache(),
            normalizeFileData,
            featureImageBlobs: { deleteFromCache: vi.fn() },
            emitChanges: changes => emittedChanges.push(changes)
        },
        {
            contentUpdates: [{ path: FILE_PATH, ...update }]
        }
    );

    const persisted = records.get(FILE_PATH);
    if (!persisted) {
        throw new Error('Expected the task record to remain persisted');
    }
    return { emittedChanges, persisted };
}

describe('runBatchUpdateFileContentAndProviderProcessedMtimes task notifications', () => {
    it('persists the counter pair but publishes only taskTotal when unfinished tasks are unchanged', async () => {
        const { emittedChanges, persisted } = await runTaskUpdate({ taskTotal: 4, taskUnfinished: 1 }, { taskTotal: 5, taskUnfinished: 1 });

        expect({ taskTotal: persisted.taskTotal, taskUnfinished: persisted.taskUnfinished }).toEqual({
            taskTotal: 5,
            taskUnfinished: 1
        });
        expect(emittedChanges).toEqual([
            [
                {
                    path: FILE_PATH,
                    changes: { taskTotal: 5 },
                    changeType: 'content',
                    previousTaskCounters: { taskTotal: 4, taskUnfinished: 1 }
                }
            ]
        ]);
    });

    it('publishes only taskUnfinished when the total is unchanged', async () => {
        const { emittedChanges } = await runTaskUpdate({ taskTotal: 4, taskUnfinished: 1 }, { taskTotal: 4, taskUnfinished: 0 });

        expect(emittedChanges).toEqual([
            [
                {
                    path: FILE_PATH,
                    changes: { taskUnfinished: 0 },
                    changeType: 'content',
                    previousTaskCounters: { taskTotal: 4, taskUnfinished: 1 }
                }
            ]
        ]);
    });

    it('publishes null counter values without treating them as absent', async () => {
        const { emittedChanges } = await runTaskUpdate({ taskTotal: 4, taskUnfinished: 1 }, { taskTotal: null, taskUnfinished: null });

        expect(emittedChanges[0]?.[0]).toMatchObject({
            changes: { taskTotal: null, taskUnfinished: null },
            previousTaskCounters: { taskTotal: 4, taskUnfinished: 1 }
        });
    });

    it('does not emit a task notification when both normalized counters are unchanged', async () => {
        const { emittedChanges } = await runTaskUpdate({ taskTotal: 4, taskUnfinished: 1 }, { taskTotal: 4, taskUnfinished: 1 });

        expect(emittedChanges).toEqual([]);
    });
});
