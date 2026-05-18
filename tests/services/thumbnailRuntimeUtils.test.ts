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
import { createOnceLogger, createRenderBudgetLimiter } from '../../src/services/content/thumbnail/thumbnailRuntimeUtils';

describe('createOnceLogger', () => {
    it('logs a key once and evicts old keys', () => {
        const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const logOnce = createOnceLogger(2);

        logOnce('a', 'A');
        logOnce('a', 'A again');
        logOnce('b', 'B');
        logOnce('c', 'C');
        logOnce('a', 'A after eviction');

        expect(spy).toHaveBeenCalledTimes(4);
        expect(spy).toHaveBeenNthCalledWith(1, 'A');
        expect(spy).toHaveBeenNthCalledWith(2, 'B');
        expect(spy).toHaveBeenNthCalledWith(3, 'C');
        expect(spy).toHaveBeenNthCalledWith(4, 'A after eviction');
        spy.mockRestore();
    });
});

describe('createRenderBudgetLimiter', () => {
    async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
        let timeoutId: ReturnType<typeof window.setTimeout> | null = null;
        const timeout = new Promise<never>((_, reject) => {
            timeoutId = window.setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
        });

        try {
            return await Promise.race([promise, timeout]);
        } finally {
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
        }
    }

    it('queues acquisitions when budget is exceeded', async () => {
        const limiter = createRenderBudgetLimiter(5);

        const releaseA = await limiter.acquire(3);
        expect(limiter.getActiveWeight()).toBe(3);

        let acquiredB = false;
        const acquireB = limiter.acquire(3).then(release => {
            acquiredB = true;
            return release;
        });

        await Promise.resolve();
        expect(acquiredB).toBe(false);

        releaseA();
        const releaseB = await acquireB;
        expect(acquiredB).toBe(true);
        expect(limiter.getActiveWeight()).toBe(3);

        releaseB();
        expect(limiter.getActiveWeight()).toBe(0);
    });

    it('clamps overweight acquisitions to the total budget', async () => {
        const limiter = createRenderBudgetLimiter(5);

        const releaseA = await limiter.acquire(3);
        expect(limiter.getActiveWeight()).toBe(3);

        const acquireOverweight = limiter.acquire(10);
        await Promise.resolve();
        expect(limiter.getActiveWeight()).toBe(3);

        releaseA();

        const releaseOverweight = await withTimeout(acquireOverweight, 250);
        expect(limiter.getActiveWeight()).toBe(5);

        releaseOverweight();
        expect(limiter.getActiveWeight()).toBe(0);
    });
});
