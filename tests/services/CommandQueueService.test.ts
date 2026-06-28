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
import type { WorkspaceLeaf } from 'obsidian';
import { CommandQueueService, OperationType } from '../../src/services/CommandQueueService';
import { createTestTFile } from '../utils/createTestTFile';

function createDeferredVoid(): { promise: Promise<void>; resolve: () => void } {
    let resolveFn: (() => void) | null = null;
    const promise = new Promise<void>(resolve => {
        resolveFn = () => resolve(undefined);
    });
    if (!resolveFn) {
        throw new Error('Deferred promise resolver not initialized');
    }
    return { promise, resolve: resolveFn };
}

function createMockLeaf(id: string): WorkspaceLeaf {
    return { id } as unknown as WorkspaceLeaf;
}

describe('CommandQueueService', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(0);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('creates scoped preview markers inside active-file operations', async () => {
        const commandQueue = new CommandQueueService();
        const file = createTestTFile('notes/test.md');
        const leaf = createMockLeaf('preview-leaf');
        const otherLeaf = createMockLeaf('other-leaf');

        const openGate = createDeferredVoid();
        const openFile = vi.fn(async (_targetLeaf: WorkspaceLeaf | null) => openGate.promise);

        const task = commandQueue.executeOpenActiveFile(file, openFile, { active: false, getLeaf: () => leaf });
        await Promise.resolve();

        expect(openFile).toHaveBeenCalledWith(leaf);
        expect(commandQueue.isBackgroundFileOpenInProgress()).toBe(true);
        expect(commandQueue.consumeBackgroundFileOpen(file.path, null)).toBe(true);
        expect(commandQueue.consumeBackgroundFileOpen(file.path, null)).toBe(false);
        expect(commandQueue.consumeBackgroundActiveLeafChange(otherLeaf)).toBe(false);
        expect(commandQueue.consumeBackgroundActiveLeafChange(leaf)).toBe(true);

        openGate.resolve();
        await task;

        expect(commandQueue.isBackgroundFileOpenInProgress()).toBe(false);
    });

    it('creates scoped markers for dedicated background file opens', async () => {
        const commandQueue = new CommandQueueService();
        const file = createTestTFile('notes/sidebar.md');
        const leaf = createMockLeaf('sidebar-leaf');

        const openGate = createDeferredVoid();
        const openFile = vi.fn(async (_targetLeaf: WorkspaceLeaf | null) => openGate.promise);

        const task = commandQueue.executeBackgroundFileOpen(file, openFile, { getLeaf: () => leaf });
        await Promise.resolve();

        expect(openFile).toHaveBeenCalledWith(leaf);
        expect(commandQueue.isBackgroundFileOpenInProgress()).toBe(true);
        expect(commandQueue.consumeBackgroundActiveLeafChange(leaf)).toBe(true);

        openGate.resolve();
        await task;

        expect(commandQueue.isBackgroundFileOpenInProgress()).toBe(false);
        expect(commandQueue.consumeBackgroundFileOpen(file.path, null)).toBe(true);
    });

    it('expires completed preview markers when expected events do not arrive', async () => {
        const commandQueue = new CommandQueueService();
        const file = createTestTFile('notes/stale.md');
        const leaf = createMockLeaf('stale-leaf');

        await commandQueue.executeOpenActiveFile(file, async () => undefined, { active: false, getLeaf: () => leaf });
        vi.advanceTimersByTime(500);

        expect(commandQueue.consumeBackgroundFileOpen(file.path, null)).toBe(false);
        expect(commandQueue.consumeBackgroundActiveLeafChange(leaf)).toBe(false);
    });

    it('does not report active:true opens as background', async () => {
        const commandQueue = new CommandQueueService();
        const file = createTestTFile('notes/test.md');
        const leaf = createMockLeaf('active-leaf');

        const openGate = createDeferredVoid();
        const openFile = vi.fn(async (_targetLeaf: WorkspaceLeaf | null) => openGate.promise);

        const task = commandQueue.executeOpenActiveFile(file, openFile, { active: true, getLeaf: () => leaf });
        await Promise.resolve();

        expect(openFile).toHaveBeenCalledWith(leaf);
        expect(commandQueue.isBackgroundFileOpenInProgress()).toBe(false);
        expect(commandQueue.consumeBackgroundFileOpen(file.path, leaf)).toBe(false);
        expect(commandQueue.consumeBackgroundActiveLeafChange(leaf)).toBe(false);

        openGate.resolve();
        await task;

        expect(commandQueue.consumeBackgroundFileOpen(file.path, leaf)).toBe(false);
    });

    it('does not create preview markers for skipped queued opens', async () => {
        const commandQueue = new CommandQueueService();
        const skippedFile = createTestTFile('notes/skipped.md');
        const openedFile = createTestTFile('notes/opened.md');
        const skippedLeaf = createMockLeaf('skipped-leaf');
        const openedLeaf = createMockLeaf('opened-leaf');
        const openGate = createDeferredVoid();
        const skippedOpenFile = vi.fn(async () => undefined);
        const openedOpenFile = vi.fn(async (_targetLeaf: WorkspaceLeaf | null) => openGate.promise);

        const skippedTask = commandQueue.executeOpenActiveFile(skippedFile, skippedOpenFile, { active: false, getLeaf: () => skippedLeaf });
        const openedTask = commandQueue.executeOpenActiveFile(openedFile, openedOpenFile, { active: false, getLeaf: () => openedLeaf });

        await skippedTask;
        await Promise.resolve();

        expect(skippedOpenFile).not.toHaveBeenCalled();
        expect(openedOpenFile).toHaveBeenCalledWith(openedLeaf);
        expect(commandQueue.consumeBackgroundFileOpen(skippedFile.path, skippedLeaf)).toBe(false);
        expect(commandQueue.consumeBackgroundFileOpen(openedFile.path, openedLeaf)).toBe(true);

        openGate.resolve();
        await Promise.all([skippedTask, openedTask]);
    });

    it('replays active operations to late operation listeners', async () => {
        const commandQueue = new CommandQueueService();
        const file = createTestTFile('notes/delete.md');
        const deleteGate = createDeferredVoid();
        const performDelete = vi.fn(async () => deleteGate.promise);
        const listener = vi.fn();

        const task = commandQueue.executeDeleteFiles([file], performDelete);
        await Promise.resolve();

        const unsubscribe = commandQueue.onOperationChange(listener);

        expect(listener).toHaveBeenCalledWith(OperationType.DELETE_FILES, true);

        deleteGate.resolve();
        await task;

        expect(listener).toHaveBeenCalledWith(OperationType.DELETE_FILES, false);

        unsubscribe();
    });

    it('clears active operation snapshots', async () => {
        const commandQueue = new CommandQueueService();
        const file = createTestTFile('notes/delete.md');
        const deleteGate = createDeferredVoid();
        const performDelete = vi.fn(async () => deleteGate.promise);
        const listener = vi.fn();

        const task = commandQueue.executeDeleteFiles([file], performDelete);
        await Promise.resolve();

        commandQueue.clearAllOperations();
        commandQueue.onOperationChange(listener);

        expect(commandQueue.isDeletingFiles()).toBe(false);
        expect(listener).not.toHaveBeenCalled();

        deleteGate.resolve();
        await task;
    });
});
