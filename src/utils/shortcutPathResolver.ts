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

import { TFile, TFolder, type App } from 'obsidian';
import { getShortcutKey, isFolderShortcut, isNoteShortcut, type ShortcutEntry } from '../types/shortcuts';
import { casefoldPreservingWhitespace } from './recordUtils';

export interface ShortcutTargetPathIndex {
    foldersByFoldedPath: ReadonlyMap<string, TFolder | null>;
    notesByFoldedPath: ReadonlyMap<string, TFile | null>;
}

export interface ShortcutTargetResolution {
    folderTargetsByPath: ReadonlyMap<string, TFolder | null>;
    noteTargetsByPath: ReadonlyMap<string, TFile | null>;
}

export interface ShortcutTargetKeyMaps {
    folderShortcutKeysByPath: Map<string, string>;
    noteShortcutKeysByPath: Map<string, string>;
}

export function foldShortcutTargetPath(path: string): string {
    return casefoldPreservingWhitespace(path);
}

function addUniqueFoldedPathMatch<T extends TFile | TFolder>(map: Map<string, T | null>, foldedPath: string, target: T): void {
    if (!map.has(foldedPath)) {
        map.set(foldedPath, target);
        return;
    }

    map.set(foldedPath, null);
}

export function buildShortcutTargetPathIndex(app: App, foldedTargetPaths?: ReadonlySet<string>): ShortcutTargetPathIndex {
    const foldersByFoldedPath = new Map<string, TFolder | null>();
    const notesByFoldedPath = new Map<string, TFile | null>();
    if (foldedTargetPaths?.size === 0) {
        return {
            foldersByFoldedPath,
            notesByFoldedPath
        };
    }

    for (const target of app.vault.getAllLoadedFiles()) {
        const foldedPath = foldShortcutTargetPath(target.path);
        if (foldedTargetPaths && !foldedTargetPaths.has(foldedPath)) {
            continue;
        }

        if (target instanceof TFolder) {
            addUniqueFoldedPathMatch(foldersByFoldedPath, foldedPath, target);
            continue;
        }

        if (target instanceof TFile) {
            addUniqueFoldedPathMatch(notesByFoldedPath, foldedPath, target);
        }
    }

    return {
        foldersByFoldedPath,
        notesByFoldedPath
    };
}

export function resolveFolderShortcutTarget(app: App, path: string, pathIndex?: ShortcutTargetPathIndex): TFolder | null {
    if (path === '/') {
        return app.vault.getRoot();
    }

    const exact = app.vault.getAbstractFileByPath(path);
    if (exact instanceof TFolder) {
        return exact;
    }
    if (exact !== null) {
        return null;
    }

    const index = pathIndex ?? buildShortcutTargetPathIndex(app);
    return index.foldersByFoldedPath.get(foldShortcutTargetPath(path)) ?? null;
}

export function resolveNoteShortcutTarget(app: App, path: string, pathIndex?: ShortcutTargetPathIndex): TFile | null {
    const exact = app.vault.getAbstractFileByPath(path);
    if (exact instanceof TFile) {
        return exact;
    }
    if (exact !== null) {
        return null;
    }

    const index = pathIndex ?? buildShortcutTargetPathIndex(app);
    return index.notesByFoldedPath.get(foldShortcutTargetPath(path)) ?? null;
}

export function resolveShortcutTargets(app: App, shortcuts: readonly ShortcutEntry[]): ShortcutTargetResolution {
    const folderTargetsByPath = new Map<string, TFolder | null>();
    const noteTargetsByPath = new Map<string, TFile | null>();
    const fallbackTargetPaths = new Set<string>();
    const missingFolderTargets: { path: string; foldedPath: string }[] = [];
    const missingNoteTargets: { path: string; foldedPath: string }[] = [];

    shortcuts.forEach(shortcut => {
        if (isFolderShortcut(shortcut)) {
            if (shortcut.path === '/') {
                folderTargetsByPath.set(shortcut.path, app.vault.getRoot());
                return;
            }
            const exact = app.vault.getAbstractFileByPath(shortcut.path);
            if (exact instanceof TFolder) {
                folderTargetsByPath.set(shortcut.path, exact);
                return;
            }
            if (exact === null) {
                const foldedPath = foldShortcutTargetPath(shortcut.path);
                fallbackTargetPaths.add(foldedPath);
                missingFolderTargets.push({ path: shortcut.path, foldedPath });
                return;
            }
            folderTargetsByPath.set(shortcut.path, null);
            return;
        }

        if (isNoteShortcut(shortcut)) {
            const exact = app.vault.getAbstractFileByPath(shortcut.path);
            if (exact instanceof TFile) {
                noteTargetsByPath.set(shortcut.path, exact);
                return;
            }
            if (exact === null) {
                const foldedPath = foldShortcutTargetPath(shortcut.path);
                fallbackTargetPaths.add(foldedPath);
                missingNoteTargets.push({ path: shortcut.path, foldedPath });
                return;
            }
            noteTargetsByPath.set(shortcut.path, null);
        }
    });

    if (fallbackTargetPaths.size > 0) {
        const fallbackIndex = buildShortcutTargetPathIndex(app, fallbackTargetPaths);
        missingFolderTargets.forEach(({ path, foldedPath }) => {
            folderTargetsByPath.set(path, fallbackIndex.foldersByFoldedPath.get(foldedPath) ?? null);
        });
        missingNoteTargets.forEach(({ path, foldedPath }) => {
            noteTargetsByPath.set(path, fallbackIndex.notesByFoldedPath.get(foldedPath) ?? null);
        });
    }

    return {
        folderTargetsByPath,
        noteTargetsByPath
    };
}

export function buildShortcutTargetKeyMaps(
    shortcuts: readonly ShortcutEntry[],
    resolution: ShortcutTargetResolution
): ShortcutTargetKeyMaps {
    const folderShortcutKeysByPath = new Map<string, string>();
    const noteShortcutKeysByPath = new Map<string, string>();

    shortcuts.forEach(shortcut => {
        if (isFolderShortcut(shortcut)) {
            const key = getShortcutKey(shortcut);
            folderShortcutKeysByPath.set(shortcut.path, key);
            const target = resolution.folderTargetsByPath.get(shortcut.path);
            if (target) {
                folderShortcutKeysByPath.set(target.path, key);
            }
            return;
        }

        if (isNoteShortcut(shortcut)) {
            const key = getShortcutKey(shortcut);
            noteShortcutKeysByPath.set(shortcut.path, key);
            const target = resolution.noteTargetsByPath.get(shortcut.path);
            if (target) {
                noteShortcutKeysByPath.set(target.path, key);
            }
        }
    });

    return {
        folderShortcutKeysByPath,
        noteShortcutKeysByPath
    };
}

export function createShortcutTargetPathEventMatcher(
    app: App,
    targetType: 'folder' | 'note',
    eventPath: string,
    replacementPath?: string
): (shortcutPath: string) => boolean {
    const foldedEventPath = foldShortcutTargetPath(eventPath);
    let isFallbackUnique: boolean | null = null;

    const getIsFallbackUnique = (): boolean => {
        if (isFallbackUnique !== null) {
            return isFallbackUnique;
        }

        let matchingTargetCount = 1;
        for (const target of app.vault.getAllLoadedFiles()) {
            if (replacementPath && target.path === replacementPath) {
                continue;
            }
            if (targetType === 'folder' && !(target instanceof TFolder)) {
                continue;
            }
            if (targetType === 'note' && !(target instanceof TFile)) {
                continue;
            }
            if (foldShortcutTargetPath(target.path) !== foldedEventPath) {
                continue;
            }

            matchingTargetCount += 1;
            if (matchingTargetCount > 1) {
                isFallbackUnique = false;
                return isFallbackUnique;
            }
        }

        isFallbackUnique = true;
        return isFallbackUnique;
    };

    return (shortcutPath: string): boolean => {
        if (shortcutPath === eventPath) {
            return true;
        }
        if (foldShortcutTargetPath(shortcutPath) !== foldedEventPath) {
            return false;
        }
        if (app.vault.getAbstractFileByPath(shortcutPath) !== null) {
            return false;
        }

        return getIsFallbackUnique();
    };
}
