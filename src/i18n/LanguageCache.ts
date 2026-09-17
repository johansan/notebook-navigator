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

/** A complete pack is committed in one transaction; readers never observe a partially downloaded release. */
export interface LanguageCache {
    get(pack: string, locale: string): Promise<unknown>;
    put(pack: string, locales: Record<string, unknown>): Promise<void>;
    close(): void;
}

export class LanguageDatabase implements LanguageCache {
    private db: IDBDatabase | null = null;
    private opening: Promise<IDBDatabase> | null = null;
    private closed = false;

    constructor(private readonly vaultId: string) {}

    async get(pack: string, locale: string): Promise<unknown> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('languages', 'readonly');
            const store = transaction.objectStore('languages');
            const complete = store.get(`${pack}/complete`);
            const language = store.get(`${pack}/${locale}`);
            transaction.oncomplete = () => resolve(complete.result === true ? language.result : undefined);
            transaction.onerror = transaction.onabort = () => reject(transaction.error ?? new Error('Language cache read failed'));
        });
    }

    async put(pack: string, locales: Record<string, unknown>): Promise<void> {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('languages', 'readwrite');
            const store = transaction.objectStore('languages');
            // The database is vault-local. Clear old releases only inside the successful replacement transaction,
            // so an interrupted download or aborted write retains the previous complete pack.
            store.clear();
            for (const [locale, data] of Object.entries(locales)) store.put(data, `${pack}/${locale}`);
            store.put(true, `${pack}/complete`);
            transaction.oncomplete = () => resolve();
            transaction.onerror = transaction.onabort = () => reject(transaction.error ?? new Error('Language cache write failed'));
        });
    }

    close(): void {
        this.closed = true;
        this.db?.close();
        this.db = null;
    }

    private open(): Promise<IDBDatabase> {
        if (this.closed) return Promise.reject(new Error('Language cache closed'));
        if (this.db) return Promise.resolve(this.db);
        if (this.opening) return this.opening;
        this.opening = new Promise((resolve, reject) => {
            const request = indexedDB.open(`notebooknavigator/languages/${this.vaultId}`, 1);
            request.onupgradeneeded = () => request.result.createObjectStore('languages');
            request.onerror = () => reject(request.error ?? new Error('Language cache open failed'));
            request.onblocked = () => reject(new Error('Language cache open blocked'));
            request.onsuccess = () => {
                if (this.closed) {
                    request.result.close();
                    reject(new Error('Language cache closed'));
                    return;
                }
                this.db = request.result;
                this.db.onversionchange = () => this.close();
                resolve(this.db);
            };
        });
        return this.opening;
    }
}
