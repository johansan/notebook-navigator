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

import { useCallback, useRef, type MutableRefObject } from 'react';
import { debounce, type TFile } from 'obsidian';
import type { Debouncer } from 'obsidian';
import { TIMEOUTS } from '../../types/obsidian-extended';

/**
 * Rebuild implementation registered by a tree sync hook. Receives a getter for the visible markdown
 * files so the vault scan runs at most once per scheduler pass, shared between both trees.
 */
export type TreeRebuildFn = (getVisibleFiles: () => TFile[]) => void;

/**
 * Shared scheduler for tag and property tree rebuilds.
 *
 * Both trees are built from the same visible markdown file scan, and rebuild triggers often fire for both
 * trees in the same change burst. A single debouncer collapses those triggers into one pass that scans the
 * vault once and runs each rebuild whose flag is pending. Flush requests are collected until the end of the
 * current task and run only the requesting trees, so flushes from listeners reacting to the same change
 * batch share one pass while a flush for one tree leaves the other tree's pending rebuild on the debounce
 * timer. Scheduling resets the shared timer; when that has delayed the other tree's pending rebuild past a
 * full debounce window, the pass runs on a zero-delay timer instead of delaying that tree further. A flush
 * pass that runs while the zero-delay timer is armed consumes every pending tree and clears the timer, so
 * both rebuilds share one vault scan.
 */
export function useTreeRebuildScheduler(params: {
    isStorageReadyRef: MutableRefObject<boolean>;
    stoppedRef: MutableRefObject<boolean>;
    getVisibleMarkdownFiles: () => TFile[];
}): {
    /** Latest tag tree rebuild implementation; assigned by `useTagTreeSync` on every render */
    tagTreeRebuildFnRef: MutableRefObject<TreeRebuildFn | null>;
    /** Latest property tree rebuild implementation; assigned by `usePropertyTreeSync` on every render */
    propertyTreeRebuildFnRef: MutableRefObject<TreeRebuildFn | null>;
    scheduleTreeRebuild: (kind: 'tags' | 'properties', options?: { flush?: boolean }) => void;
    cancelTreeRebuildDebouncer: (options?: { reset?: boolean }) => void;
} {
    const { isStorageReadyRef, stoppedRef, getVisibleMarkdownFiles } = params;

    const tagTreeRebuildFnRef = useRef<TreeRebuildFn | null>(null);
    const propertyTreeRebuildFnRef = useRef<TreeRebuildFn | null>(null);
    // Marks which trees have pending rebuild requests for the next scheduler pass.
    const pendingRef = useRef({ tags: false, properties: false });
    // Marks which trees requested a flush for the queued end-of-task pass.
    const flushRequestedRef = useRef({ tags: false, properties: false });
    const flushMicrotaskQueuedRef = useRef(false);
    // Time each tree's pending flag flipped from false to true; detects rebuilds delayed past a full
    // debounce window by the other tree's churn. Stamped only on that transition: later requests for an
    // already-pending tree must not refresh it, or interleaved churn on both trees would keep each
    // timestamp fresh and the overdue check below would never trip.
    const pendingSinceRef = useRef({ tags: 0, properties: 0 });
    const debouncerRef = useRef<Debouncer<[], void> | null>(null);
    // Zero-delay timer armed by the overdue path below.
    const overdueTimerRef = useRef<number | null>(null);
    const getVisibleMarkdownFilesRef = useRef(getVisibleMarkdownFiles);
    getVisibleMarkdownFilesRef.current = getVisibleMarkdownFiles;

    const runRebuilds = useCallback(
        (kinds: { tags: boolean; properties: boolean }) => {
            if (stoppedRef.current || !isStorageReadyRef.current) {
                return;
            }
            if (!kinds.tags && !kinds.properties) {
                return;
            }

            // The scan runs lazily so a rebuild that ends up not building a tree (feature disabled) skips it.
            let visibleFiles: TFile[] | null = null;
            const getVisibleFiles = () => (visibleFiles ??= getVisibleMarkdownFilesRef.current());

            if (kinds.tags) {
                tagTreeRebuildFnRef.current?.(getVisibleFiles);
            }
            if (kinds.properties) {
                propertyTreeRebuildFnRef.current?.(getVisibleFiles);
            }
        },
        [isStorageReadyRef, stoppedRef]
    );

    const runPendingRebuilds = useCallback(() => {
        const pending = pendingRef.current;
        pendingRef.current = { tags: false, properties: false };
        runRebuilds(pending);
    }, [runRebuilds]);

    // Runs flush-requested rebuilds. Queued as a microtask so every listener reacting to the same change
    // batch has marked its flags before the pass runs.
    const runFlushRequests = useCallback(() => {
        flushMicrotaskQueuedRef.current = false;
        const requested = flushRequestedRef.current;
        flushRequestedRef.current = { tags: false, properties: false };
        const pending = pendingRef.current;
        // The overdue path arms a zero-delay timer that runs every pending tree. This microtask runs
        // before that timer fires, so it takes over the timer's work: it consumes all pending trees
        // instead of only the flush-requesting ones, sharing one vault scan across both rebuilds.
        let overdueTimerArmed = false;
        if (overdueTimerRef.current !== null) {
            window.clearTimeout(overdueTimerRef.current);
            overdueTimerRef.current = null;
            overdueTimerArmed = true;
        }
        // A scheduler pass may already have covered a requested tree; flush only trees still pending.
        const kinds = {
            tags: (requested.tags || overdueTimerArmed) && pending.tags,
            properties: (requested.properties || overdueTimerArmed) && pending.properties
        };
        if (kinds.tags) {
            pending.tags = false;
        }
        if (kinds.properties) {
            pending.properties = false;
        }
        runRebuilds(kinds);
    }, [runRebuilds]);

    const scheduleTreeRebuild = useCallback(
        (kind: 'tags' | 'properties', options?: { flush?: boolean }) => {
            // performance.now() is monotonic; a backward wall-clock step must not disable the overdue check.
            const now = performance.now();
            const other = kind === 'tags' ? 'properties' : 'tags';
            const otherOverdue = pendingRef.current[other] && now - pendingSinceRef.current[other] >= TIMEOUTS.DEBOUNCE_TAG_TREE;

            if (!pendingRef.current[kind]) {
                pendingRef.current[kind] = true;
                pendingSinceRef.current[kind] = now;
            }

            if (otherOverdue) {
                // Scheduling for this tree alone would keep resetting the shared timer and delay the other
                // tree's pending rebuild indefinitely. Run the pass for both trees on a zero-delay timer:
                // scheduling happens inside vault event handlers and database change emissions, so the
                // vault scan and rebuilds must not run in the caller's stack.
                debouncerRef.current?.cancel();
                if (overdueTimerRef.current === null) {
                    overdueTimerRef.current = window.setTimeout(() => {
                        overdueTimerRef.current = null;
                        runPendingRebuilds();
                    }, 0);
                }
            } else {
                if (!debouncerRef.current) {
                    debouncerRef.current = debounce(runPendingRebuilds, TIMEOUTS.DEBOUNCE_TAG_TREE, true);
                }

                debouncerRef.current();
            }

            if (options?.flush) {
                // Used when a rebuild should happen in the current task (for example, the active file
                // changed tags).
                flushRequestedRef.current[kind] = true;
                if (!flushMicrotaskQueuedRef.current) {
                    flushMicrotaskQueuedRef.current = true;
                    queueMicrotask(runFlushRequests);
                }
            }
        },
        [runFlushRequests, runPendingRebuilds]
    );

    const cancelTreeRebuildDebouncer = useCallback((options?: { reset?: boolean }) => {
        pendingRef.current = { tags: false, properties: false };
        flushRequestedRef.current = { tags: false, properties: false };
        if (overdueTimerRef.current !== null) {
            window.clearTimeout(overdueTimerRef.current);
            overdueTimerRef.current = null;
        }
        const debouncer = debouncerRef.current;
        if (!debouncer) {
            return;
        }

        try {
            debouncer.cancel();
        } catch {
            // ignore
        }

        if (options?.reset) {
            debouncerRef.current = null;
        }
    }, []);

    return { tagTreeRebuildFnRef, propertyTreeRebuildFnRef, scheduleTreeRebuild, cancelTreeRebuildDebouncer };
}
