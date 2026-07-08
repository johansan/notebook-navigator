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

/**
 * Mock IndexedDB harness for storage tests. Backs one object store with a Map keyed by path.
 *
 * Behavior mirrored from the real API surface the storage layer uses:
 * - Request handlers fire when assigned: `onsuccess` runs immediately for a succeeding request,
 *   `onerror` runs immediately for a failing one. Puts and deletes apply synchronously against the
 *   backing Map; requests issued inside an earlier request's `onsuccess` observe prior writes, which
 *   matches in-order request execution inside one transaction.
 * - Paths listed in `failPutPaths` fail their put request. A failed request aborts the transaction:
 *   requests issued after the failure error with `AbortError` instead of executing, the backing Map
 *   is restored to its state at transaction start, and `onabort` fires instead of `oncomplete`.
 */

export class MockIDBRequest<T> {
    result: T;
    error: DOMException | null = null;
    private onSuccessHandler: (() => void) | null = null;
    private onErrorHandler: (() => void) | null = null;
    private isCompleted = false;
    private readonly onComplete: () => void;
    private readonly failure: DOMException | null;

    constructor(result: T, onComplete: () => void, failure: DOMException | null = null) {
        this.result = result;
        this.onComplete = onComplete;
        this.failure = failure;
        if (failure) {
            this.error = failure;
        }
    }

    get onsuccess(): (() => void) | null {
        return this.onSuccessHandler;
    }

    set onsuccess(handler: (() => void) | null) {
        this.onSuccessHandler = handler;
        if (handler && !this.failure) {
            handler();
            this.complete();
        }
    }

    get onerror(): (() => void) | null {
        return this.onErrorHandler;
    }

    set onerror(handler: (() => void) | null) {
        this.onErrorHandler = handler;
        if (handler && this.failure) {
            handler();
            this.complete();
        }
    }

    private complete(): void {
        if (this.isCompleted) {
            return;
        }
        this.isCompleted = true;
        this.onComplete();
    }
}

export class MockIDBTransaction<T> {
    error: DOMException | null = null;
    private onCompleteHandler: (() => void) | null = null;
    private onAbortHandler: (() => void) | null = null;
    onerror: (() => void) | null = null;
    private pendingRequests = 0;
    private hasFailed = false;
    private hasSettled = false;
    private readonly records: Map<string, T>;
    private readonly initialRecords: Map<string, T>;
    private readonly failPutPaths: Set<string>;

    constructor(records: Map<string, T>, failPutPaths: Set<string> = new Set()) {
        this.records = records;
        this.initialRecords = new Map(records);
        this.failPutPaths = failPutPaths;
    }

    get oncomplete(): (() => void) | null {
        return this.onCompleteHandler;
    }

    set oncomplete(handler: (() => void) | null) {
        this.onCompleteHandler = handler;
        this.maybeSettle();
    }

    get onabort(): (() => void) | null {
        return this.onAbortHandler;
    }

    set onabort(handler: (() => void) | null) {
        this.onAbortHandler = handler;
        this.maybeSettle();
    }

    abort(): void {
        this.hasFailed = true;
        this.maybeSettle();
    }

    objectStore(): {
        get: (path: string) => MockIDBRequest<T | undefined>;
        put: (value: T, path: string) => MockIDBRequest<void>;
        delete: (path: string) => MockIDBRequest<void>;
    } {
        return {
            get: (path: string) => this.createGetRequest(path),
            put: (value: T, path: string) => this.createPutRequest(value, path),
            delete: (path: string) => this.createDeleteRequest(path)
        };
    }

    private createGetRequest(path: string): MockIDBRequest<T | undefined> {
        if (this.hasFailed) {
            return new MockIDBRequest<T | undefined>(undefined, () => void 0, this.abortingRequestError());
        }
        this.pendingRequests += 1;
        return new MockIDBRequest(this.records.get(path), () => {
            this.pendingRequests = Math.max(0, this.pendingRequests - 1);
            this.maybeSettle();
        });
    }

    private createPutRequest(value: T, path: string): MockIDBRequest<void> {
        if (this.hasFailed) {
            return new MockIDBRequest<void>(undefined, () => void 0, this.abortingRequestError());
        }
        if (this.failPutPaths.has(path)) {
            // A failing put aborts the transaction once all requests have run.
            const failure = new DOMException('Simulated put failure', 'QuotaExceededError');
            this.hasFailed = true;
            this.error = failure;
            return new MockIDBRequest<void>(undefined, () => void 0, failure);
        }
        this.records.set(path, value);
        return new MockIDBRequest<void>(undefined, () => void 0);
    }

    private createDeleteRequest(path: string): MockIDBRequest<void> {
        if (this.hasFailed) {
            return new MockIDBRequest<void>(undefined, () => void 0, this.abortingRequestError());
        }
        this.records.delete(path);
        return new MockIDBRequest<void>(undefined, () => void 0);
    }

    private abortingRequestError(): DOMException {
        // Once a request has failed the transaction is aborting: later requests error instead of executing.
        return new DOMException('Transaction is aborting', 'AbortError');
    }

    private maybeSettle(): void {
        if (this.hasSettled || this.pendingRequests !== 0) {
            return;
        }
        if (this.hasFailed) {
            if (!this.onAbortHandler) {
                return;
            }
            this.hasSettled = true;
            // Roll back the backing Map to its state at transaction start.
            this.records.clear();
            for (const [path, value] of this.initialRecords) {
                this.records.set(path, value);
            }
            this.onAbortHandler();
            return;
        }
        if (!this.onCompleteHandler) {
            return;
        }
        this.hasSettled = true;
        this.onCompleteHandler();
    }
}

export class MockIDBDatabase<T> {
    private readonly records: Map<string, T>;
    private readonly failPutPaths: Set<string>;

    constructor(records: Map<string, T>, failPutPaths: Set<string> = new Set()) {
        this.records = records;
        this.failPutPaths = failPutPaths;
    }

    transaction(): MockIDBTransaction<T> {
        return new MockIDBTransaction(this.records, this.failPutPaths);
    }
}
