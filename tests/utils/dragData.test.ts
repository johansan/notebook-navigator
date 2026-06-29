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
import { extractFilePathsFromDataTransfer, hasObsidianFileDragType, hasPotentialObsidianFileDragType } from '../../src/utils/dragData';

class TestDataTransfer {
    readonly types: string[];
    private readonly data = new Map<string, string>();

    constructor(entries: Array<[string, string]>) {
        this.types = entries.map(([type]) => type);
        entries.forEach(([type, value]) => {
            this.data.set(type, value);
        });
    }

    getData(type: string): string {
        return this.data.get(type) ?? '';
    }
}

function createDataTransfer(entries: Array<[string, string]>): DataTransfer {
    return new TestDataTransfer(entries) as unknown as DataTransfer;
}

describe('dragData', () => {
    describe('extractFilePathsFromDataTransfer', () => {
        it('reads legacy multi-file payloads', () => {
            const dataTransfer = createDataTransfer([['obsidian/files', '["Folder/A.md","Folder/B.md"]']]);

            expect(extractFilePathsFromDataTransfer(dataTransfer)).toEqual(['Folder/A.md', 'Folder/B.md']);
        });

        it('reads legacy single-file payloads', () => {
            const dataTransfer = createDataTransfer([['obsidian/file', 'Folder/A.md']]);

            expect(extractFilePathsFromDataTransfer(dataTransfer)).toEqual(['Folder/A.md']);
        });

        it('reads native Obsidian URI lists and resolves extensionless markdown paths', () => {
            const payload = [
                'obsidian://open?vault=My%20Vault&file=docs%2Fnote',
                'obsidian://open?vault=My%20Vault&file=Assets%2Fimage.png'
            ].join('\n');
            const existingPaths = new Set(['docs/note.md', 'Assets/image.png']);
            const dataTransfer = createDataTransfer([['text/plain', payload]]);

            expect(
                extractFilePathsFromDataTransfer(dataTransfer, {
                    getPathType: path => (existingPaths.has(path) ? 'file' : null)
                })
            ).toEqual(['docs/note.md', 'Assets/image.png']);
        });

        it('prefers extensionless markdown notes over same-named folders', () => {
            const payload = 'obsidian://open?vault=My%20Vault&file=Projects';
            const dataTransfer = createDataTransfer([['text/plain', payload]]);

            expect(
                extractFilePathsFromDataTransfer(dataTransfer, {
                    getPathType: path => {
                        if (path === 'Projects') {
                            return 'folder';
                        }
                        if (path === 'Projects.md') {
                            return 'file';
                        }
                        return null;
                    },
                    vaultName: 'My Vault'
                })
            ).toEqual(['Projects.md']);
        });

        it('resolves markdown notes whose basename ends with .md', () => {
            const payload = 'obsidian://open?vault=My%20Vault&file=docs%2Fnote.md';
            const dataTransfer = createDataTransfer([['text/plain', payload]]);

            expect(
                extractFilePathsFromDataTransfer(dataTransfer, {
                    getPathType: path => (path === 'docs/note.md.md' ? 'file' : null),
                    vaultName: 'My Vault'
                })
            ).toEqual(['docs/note.md.md']);
        });

        it('reads collapsed native URI-list payloads', () => {
            const payload = 'obsidian://open?vault=My%20Vault&file=docs%2Ffirst' + 'obsidian://open?vault=My%20Vault&file=docs%2Fsecond';
            const existingPaths = new Set(['docs/first.md', 'docs/second.md']);
            const dataTransfer = createDataTransfer([['text/uri-list', payload]]);

            expect(
                extractFilePathsFromDataTransfer(dataTransfer, {
                    getPathType: path => (existingPaths.has(path) ? 'file' : null)
                })
            ).toEqual(['docs/first.md', 'docs/second.md']);
        });

        it('ignores native Obsidian URI payloads from another vault', () => {
            const dataTransfer = createDataTransfer([['text/plain', 'obsidian://open?vault=Other%20Vault&file=docs%2Fnote']]);

            expect(
                extractFilePathsFromDataTransfer(dataTransfer, {
                    getPathType: path => (path === 'docs/note.md' ? 'file' : null),
                    vaultName: 'My Vault'
                })
            ).toBeNull();
        });

        it('ignores non-Obsidian URI payloads', () => {
            const dataTransfer = createDataTransfer([['text/uri-list', 'https://example.com/notes']]);

            expect(extractFilePathsFromDataTransfer(dataTransfer)).toBeNull();
        });
    });

    describe('hasObsidianFileDragType', () => {
        it('recognizes explicit Obsidian file drag types', () => {
            expect(hasObsidianFileDragType(['obsidian/file'])).toBe(true);
            expect(hasObsidianFileDragType(['obsidian/files'])).toBe(true);
        });

        it('rejects plain text without URI-list data', () => {
            expect(hasObsidianFileDragType(['text/plain'])).toBe(false);
        });

        it('does not classify URI-only drag types as explicit Obsidian types', () => {
            expect(hasObsidianFileDragType(['text/plain', 'text/uri-list'])).toBe(false);
        });
    });

    describe('hasPotentialObsidianFileDragType', () => {
        it('recognizes explicit and URI-only Obsidian file drag type signatures', () => {
            expect(hasPotentialObsidianFileDragType(['obsidian/file'])).toBe(true);
            expect(hasPotentialObsidianFileDragType(['obsidian/files'])).toBe(true);
            expect(hasPotentialObsidianFileDragType(['text/plain', 'text/uri-list'])).toBe(true);
        });

        it('does not classify external file drags as Obsidian file drags', () => {
            expect(hasPotentialObsidianFileDragType(['Files', 'text/uri-list'])).toBe(false);
        });

        it('does not classify HTML URL drags as Obsidian file drags', () => {
            expect(hasPotentialObsidianFileDragType(['text/plain', 'text/uri-list', 'text/html'])).toBe(false);
        });

        it('does not classify URI drags with extra non-native types as Obsidian file drags', () => {
            expect(hasPotentialObsidianFileDragType(['text/plain', 'text/uri-list', 'DownloadURL'])).toBe(false);
        });
    });
});
