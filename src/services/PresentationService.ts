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

import { TFile, TFolder } from 'obsidian';
import type { App, EventRef, TAbstractFile } from 'obsidian';
import {
    caselessKey,
    findPresentationPair,
    holdsPresentationPair,
    readPresentationFile,
    readPresentationMarkdown,
    readPresentationTheme,
    VERSION_ID,
    VERSIONS_FOLDER
} from '../readers/markdownpoint-readers';
import type { FolderEntry, PresentationFacts, PresentationFileReading, SchemeColors, ThemeFacts } from '../readers/markdownpoint-readers';

/**
 * A MarkdownPoint presentation is a folder holding `slides.md` (the writing) and `presentation.mdpoint`
 * (the presentation data), plus the embedded theme under `themes/<key>/`. MarkdownPoint's own readers, bundled
 * in `src/readers` at one app commit, decide which folders hold a presentation that opens, what it holds and how
 * its theme reads, so Navigator lists exactly the presentations MarkdownPoint opens. What a row shows of them,
 * the slide count, the theme's name, the slide size and the cover, is Navigator's.
 */

/** Which file of a recognized presentation pair a path is. */
export type PresentationFileRole = 'slides' | 'companion';

/** Cover colors resolved from one color scheme of the presentation's theme. */
export interface PresentationCoverColors {
    background: string;
    text: string;
    muted: string;
}

/**
 * How the cover row draws the presentation, taken from the theme's Title layout.
 * `dark` is null when the Title layout names its own scheme, because that scheme applies in both appearances.
 */
export interface PresentationCover {
    align: 'start' | 'center';
    light: PresentationCoverColors;
    dark: PresentationCoverColors | null;
}

export interface PresentationSummary {
    folderPath: string;
    slidesPath: string;
    companionPath: string;
    slideCount: number;
    /** The theme's name, or its key humanized when MarkdownPoint doesn't read the theme */
    themeName: string;
    /** Slide size in canvas units, or null when MarkdownPoint doesn't read the theme */
    size: { width: number; height: number } | null;
    /** Null when MarkdownPoint doesn't read the theme; the cover then uses Obsidian colors */
    cover: PresentationCover | null;
}

/** The app commit the readers in `src/readers` were bundled at, as their header names it */
export const READERS_COMMIT = 'c51be3087817596f62383812536d20a993d5e214';
// Collapses the vault event burst of a save, move or sync into one read per folder
const FOLDER_REFRESH_DELAY_MS = 100;
// The names of a presentation's two files as one name in any case, the only files that decide whether a folder holds a pair
const PAIR_NAMES = new Set(['slides.md', 'presentation.mdpoint'].map(caselessKey));
// Matches `<presentation folder>/themes/<theme key>/<file>.json`; group 1 is the presentation folder (absent at the vault root)
const THEME_FILE_PATH_PATTERN = /^(?:(.*)\/)?themes\/[^/]+\/[^/]+\.json$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getParentPath(path: string): string {
    const slash = path.lastIndexOf('/');
    return slash < 0 ? '/' : path.slice(0, slash);
}

function getFileName(path: string): string {
    return path.slice(path.lastIndexOf('/') + 1);
}

function joinPath(folderPath: string, name: string): string {
    return folderPath === '/' ? name : `${folderPath}/${name}`;
}

function isPathInFolder(path: string, folderPath: string): boolean {
    return folderPath === '/' || path === folderPath || path.startsWith(`${folderPath}/`);
}

/**
 * Classifies a file name as a candidate member of a presentation pair, which decides the folders to read. Candidates
 * include sync conflict copies (`slides 2.md`, `presentation (1).mdpoint`), whose arrival can keep a folder from
 * holding a pair. AppleDouble files (`._*`) are ignored.
 */
function getPresentationMemberKind(name: string): 'markdown' | 'companion' | null {
    const lower = name.toLowerCase();
    if (!name.startsWith('._') && name.length > 8 && lower.endsWith('.mdpoint')) {
        return 'companion';
    }
    return /^slides(?![a-z])/i.test(name) && lower.endsWith('.md') ? 'markdown' : null;
}

/**
 * Whether a folder lies under a presentation's `versions/`, whose pairs MarkdownPoint never opens as presentations of
 * their own: in a folder there named by a save time, or anywhere below it where the folder around `versions/` holds a
 * presentation file, as it does around a copy of a version's folder. `holdsPresentation` says whether the vault's folder
 * at a path holds one. `ignoresCase` says the vault's volume finds a name in another case, so `Versions/` there is the
 * folder MarkdownPoint reads as `versions/`. Mirrors `inSavedVersions` in markdownpoint-obsidian `src/format/recognition.ts`.
 */
export function isInSavedVersions(folderPath: string, holdsPresentation: (folderPath: string) => boolean, ignoresCase: boolean): boolean {
    const folders = folderPath === '/' ? [] : folderPath.split('/');
    return folders.some(
        (name, at) =>
            (name === VERSIONS_FOLDER || (ignoresCase && name.toLowerCase() === VERSIONS_FOLDER)) &&
            (VERSION_ID.test(folders[at + 1] ?? '') || holdsPresentation(folders.slice(0, at).join('/') || '/'))
    );
}

function holdsPresentationFile(app: App, folderPath: string): boolean {
    const folder = app.vault.getAbstractFileByPath(folderPath);
    return (
        folder instanceof TFolder &&
        folder.children.some(child => child instanceof TFile && getPresentationMemberKind(child.name) === 'companion')
    );
}

/** A folder's entries as MarkdownPoint's readers take them. */
function getFolderEntries(folder: TFolder): FolderEntry[] {
    return folder.children.map(entry => ({ name: entry.name, directory: !(entry instanceof TFile) }));
}

/** Whether a folder above `folder` holds a whole presentation, which keeps every presentation inside it from opening. */
function isInsidePresentation(folder: TFolder): boolean {
    for (let at = folder.parent; at; at = at.parent) {
        // A whole pair takes a presentation file, whose name ends in .mdpoint in any case, so a folder without one is
        // passed over before the caseless match of its every name
        const holdsCompanion = at.children.some(child => child instanceof TFile && getPresentationMemberKind(child.name) === 'companion');
        if (holdsCompanion && holdsPresentationPair(getFolderEntries(at))) {
            return true;
        }
    }
    return false;
}

/** The key with separators as spaces and a capital first letter, for a theme MarkdownPoint doesn't read. */
function getPresentationThemeName(themeKey: string): string {
    const words = themeKey.replace(/[-_]+/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
}

function getCoverColors({ background, text, muted }: SchemeColors): PresentationCoverColors {
    return { background, text, muted };
}

/**
 * Resolves the cover from the theme's schemes and its Title layout. The Title layout's scheme applies in both light
 * and dark mode; without one, the cover follows the theme's `light` and `dark` schemes. The title text's alignment
 * decides between a centered and a start-aligned cover.
 */
export function resolvePresentationCover(theme: ThemeFacts): PresentationCover {
    const titleLayout = theme.layouts.find(layout => layout.key === 'title');
    const layoutScheme =
        titleLayout?.scheme !== undefined && Object.prototype.hasOwnProperty.call(theme.schemes, titleLayout.scheme)
            ? titleLayout.scheme
            : null;
    return {
        align: titleLayout?.titleAlign === 'center' ? 'center' : 'start',
        light: getCoverColors(theme.schemes[layoutScheme ?? 'light']),
        dark: layoutScheme ? null : getCoverColors(theme.schemes.dark)
    };
}

/**
 * What MarkdownPoint's readers say of a folder holding a presentation that opens: its pair's file names, what the
 * presentation holds, and its theme where MarkdownPoint reads it. Navigator's summary is made from it each time it is
 * shown, so a stored reading never keeps an earlier version's summary.
 */
interface PresentationReading {
    markdown: string;
    json: string;
    presentation: PresentationFacts;
    theme: ThemeFacts | null;
}

/** A folder's reading as the database keeps it, null where the folder holds no presentation that opens. */
interface StoredPresentationReading {
    stamp: string;
    reading: PresentationReading | null;
}

/** The shape of a stored reading, which a stamp names so a record of another shape is read again; change it with that shape */
const STORED_READING_VERSION = 1;

/** The database's store of readings, by folder path; a record read back can come from an earlier version. */
export interface PresentationReadingStore {
    getPresentationReadings(): Promise<Map<string, unknown>>;
    setPresentationReading(folderPath: string, reading: unknown): Promise<void>;
}

function getPresentationSummary(folderPath: string, { markdown, json, presentation, theme }: PresentationReading): PresentationSummary {
    return {
        folderPath,
        slidesPath: joinPath(folderPath, markdown),
        companionPath: joinPath(folderPath, json),
        slideCount: presentation.slides.length,
        themeName: theme ? theme.name : getPresentationThemeName(presentation.theme),
        size: theme ? { width: theme.size.width, height: theme.size.height } : null,
        cover: theme ? resolvePresentationCover(theme) : null
    };
}

function compareNames(first: unknown[], second: unknown[]): number {
    const [a, b] = [String(first[0]), String(second[0])];
    return a < b ? -1 : a > b ? 1 : 0;
}

/** The folder's entries with each file's time and size, in name order, as the vault lists them. */
function getFolderStamp(folder: TFolder): unknown[] {
    return folder.children
        .map(entry => (entry instanceof TFile ? [entry.name, entry.stat.mtime, entry.stat.size] : [`${entry.name}/`]))
        .sort(compareNames);
}

function getThemeFolder(app: App, folderPath: string, themeKey: string): TFolder | null {
    const folder = app.vault.getAbstractFileByPath(joinPath(folderPath, `themes/${themeKey}`));
    return folder instanceof TFolder ? folder : null;
}

function getThemeFiles(folder: TFolder | null): TFile[] {
    return (folder?.children ?? []).filter((entry): entry is TFile => entry instanceof TFile && entry.name.toLowerCase().endsWith('.json'));
}

function getThemeStamp(folder: TFolder | null): unknown[] | null {
    return folder
        ? getThemeFiles(folder)
              .map(file => [file.name, file.stat.mtime, file.stat.size])
              .sort(compareNames)
        : null;
}

/**
 * What a folder's reading rests on: the stored shape, the readers' commit, the folder's entries and the theme's JSON
 * files, each file by its time and size.
 */
function getStamp(folderStamp: unknown[], themeKey: string | null, themeStamp: unknown[] | null): string {
    return JSON.stringify([STORED_READING_VERSION, READERS_COMMIT, folderStamp, themeKey, themeStamp]);
}

function isSameSummary(previous: PresentationSummary | null, next: PresentationSummary | null): boolean {
    return JSON.stringify(previous) === JSON.stringify(next);
}

/**
 * Keeps an in-memory index of the vault's MarkdownPoint presentations.
 *
 * Roles (which paths are `slides.md` and `presentation.mdpoint` of a presentation that opens) are published together
 * with the presentation data. Row rendering, row height estimates and file visibility all read the same role map
 * synchronously, so they always agree: a pair that has not been read yet renders, measures and filters as ordinary files.
 *
 * Each folder's reading is stored in the database with the stamp of the files it was read from, so a folder whose files
 * are as they were when Obsidian last ran is not read again. Folders are read one at a time.
 */
export class PresentationService {
    private readonly app: App;
    // Resolves to the store of readings once the database is ready, or null when it isn't available
    private readonly getStore: () => Promise<PresentationReadingStore | null>;
    private readonly summaries = new Map<string, PresentationSummary>();
    private readonly roles = new Map<string, PresentationFileRole>();
    private readonly summaryListeners = new Map<string, Set<() => void>>();
    private readonly roleListeners = new Set<() => void>();
    private readonly pendingFolders = new Set<string>();
    private readonly vaultEventRefs: EventRef[] = [];
    // Folders found at start whose stored reading has not been checked yet; an event reads the folder instead
    private unrestoredFolders: Set<string> | null = null;
    // The presentation file read last, kept until its time or size changes or an event names it, so a save of slides.md
    // doesn't read it again
    private keptFile: { path: string; mtime: number; size: number; reading: PresentationFileReading } | null = null;
    private refreshTimer: number | null = null;
    // The reads of each quiet interval's folders, one after another
    private reads: Promise<void> = Promise.resolve();
    // Counts the vault events the service has handled, so a read can tell whether one came while it ran
    private vaultEvents = 0;
    private disposed = false;
    private ignoresCase: Promise<boolean> | null = null;

    constructor(app: App, getStore: () => Promise<PresentationReadingStore | null>) {
        this.app = app;
        this.getStore = getStore;
    }

    /**
     * Registers vault listeners and publishes every presentation folder, from its stored reading when its files are as
     * they were, otherwise by reading it. Call after the workspace layout is ready, because the vault emits a `create`
     * event per file while it loads.
     */
    start(): void {
        const { vault } = this.app;
        this.vaultEventRefs.push(
            vault.on('create', file => this.handleChange(file, file.path, true)),
            vault.on('modify', file => this.handleChange(file, file.path, false)),
            vault.on('delete', file => this.handleChange(file, file.path, true)),
            vault.on('rename', (file, oldPath) => {
                this.handleChange(file, oldPath, true);
                this.handleChange(file, file.path, true);
            })
        );
        this.unrestoredFolders = this.getCompanionFolders();
        void this.restore();
    }

    /** Reads every presentation folder again, as after the database was cleared. */
    readAll(): void {
        this.keptFile = null;
        this.getCompanionFolders().forEach(folderPath => this.queueFolder(folderPath));
    }

    dispose(): void {
        this.disposed = true;
        this.vaultEventRefs.forEach(ref => this.app.vault.offref(ref));
        this.vaultEventRefs.length = 0;
        if (this.refreshTimer !== null) {
            window.clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        this.pendingFolders.clear();
        this.unrestoredFolders = null;
        this.keptFile = null;
        this.summaries.clear();
        this.roles.clear();
        this.summaryListeners.clear();
        this.roleListeners.clear();
    }

    getRole(path: string): PresentationFileRole | null {
        return this.roles.get(path) ?? null;
    }

    getSummary(folderPath: string): PresentationSummary | null {
        return this.summaries.get(folderPath) ?? null;
    }

    /** Notifies when a folder's summary changes without changing which files are presentation files. */
    subscribeToSummary(folderPath: string, listener: () => void): () => void {
        const existing = this.summaryListeners.get(folderPath);
        const listeners = existing ?? new Set<() => void>();
        listeners.add(listener);
        if (!existing) {
            this.summaryListeners.set(folderPath, listeners);
        }
        return () => {
            listeners.delete(listener);
            if (listeners.size === 0) {
                this.summaryListeners.delete(folderPath);
            }
        };
    }

    /** Notifies when files become or stop being presentation files, which changes visibility, row type and height. */
    subscribeToRoles(listener: () => void): () => void {
        this.roleListeners.add(listener);
        return () => {
            this.roleListeners.delete(listener);
        };
    }

    private getCompanionFolders(): Set<string> {
        const folderPaths = new Set<string>();
        for (const file of this.app.vault.getFiles()) {
            if (getPresentationMemberKind(file.name) === 'companion') {
                folderPaths.add(getParentPath(file.path));
            }
        }
        return folderPaths;
    }

    /** Publishes each folder found at start whose stored reading matches its files, and reads the others. */
    private async restore(): Promise<void> {
        let stored = new Map<string, unknown>();
        try {
            stored = (await (await this.getStore())?.getPresentationReadings()) ?? stored;
        } catch (error: unknown) {
            console.error('Failed to load presentation readings:', error);
        }
        const ignoresCase = await this.vaultIgnoresCase();
        const folderPaths = this.unrestoredFolders;
        this.unrestoredFolders = null;
        if (this.disposed || !folderPaths) {
            return;
        }
        for (const folderPath of folderPaths) {
            const summary = this.getRestoredSummary(folderPath, stored.get(folderPath), ignoresCase);
            if (summary === undefined) {
                this.queueFolder(folderPath);
                continue;
            }
            try {
                this.publish(folderPath, summary);
            } catch (error: unknown) {
                // A listener that throws while a folder is published leaves the other folders to be published
                console.error('Failed to publish a presentation folder:', error);
            }
        }
        // A folder that holds no presentation file keeps no reading
        for (const folderPath of stored.keys()) {
            if (!holdsPresentationFile(this.app, folderPath)) {
                this.storeReading(folderPath, null);
            }
        }
    }

    /** The summary a stored reading gives while the folder's files are as they were when it was read; otherwise undefined. */
    private getRestoredSummary(folderPath: string, value: unknown, ignoresCase: boolean): PresentationSummary | null | undefined {
        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        if (!isRecord(value) || typeof value.stamp !== 'string' || !(folder instanceof TFolder) || this.isExcluded(folder, ignoresCase)) {
            return undefined;
        }
        try {
            // A stamp that matches names this version's stored shape, which the reading then has
            const { stamp, reading } = value as unknown as StoredPresentationReading;
            const themeKey = reading?.presentation.theme ?? null;
            const themeStamp = themeKey === null ? null : getThemeStamp(getThemeFolder(this.app, folderPath, themeKey));
            if (stamp !== getStamp(getFolderStamp(folder), themeKey, themeStamp)) {
                return undefined;
            }
            return reading ? getPresentationSummary(folderPath, reading) : null;
        } catch {
            // A record of another shape is read again
            return undefined;
        }
    }

    /** `placed` is true for an event that adds, removes or moves the file, false for one that changes what it holds. */
    private handleChange(file: TAbstractFile, path: string, placed: boolean): void {
        this.vaultEvents += 1;
        if (file instanceof TFolder) {
            // A renamed or deleted folder moves or removes every presentation inside it, and a folder moved or
            // synced into the vault can bring complete presentations with it
            for (const folderPath of this.summaries.keys()) {
                if (isPathInFolder(folderPath, path)) {
                    this.queueFolder(folderPath);
                }
            }
            const current = this.app.vault.getAbstractFileByPath(path);
            if (current instanceof TFolder) {
                this.queueCompanionFoldersIn(current);
            }
            return;
        }

        if (this.keptFile?.path === path) {
            // A volume that keeps file times coarsely can leave an edited file's time and size as they were
            this.keptFile = null;
        }
        const folderPath = getParentPath(path);
        const name = getFileName(path);
        const kind = getPresentationMemberKind(name);
        if (kind !== null) {
            this.queueFolder(folderPath);
            const folder = placed ? this.app.vault.getAbstractFileByPath(folderPath) : null;
            if (folder instanceof TFolder && PAIR_NAMES.has(caselessKey(name))) {
                // A pair's file coming or going decides whether the presentations inside its folder open
                this.queueCompanionFoldersIn(folder);
            } else if (folder instanceof TFolder && kind === 'companion') {
                // A presentation file coming or going decides whether the copies of saved versions beside it open
                for (const child of folder.children) {
                    if (child instanceof TFolder && child.name.toLowerCase() === VERSIONS_FOLDER) {
                        this.queueCompanionFoldersIn(child);
                    }
                }
            }
            return;
        }
        // Theme edits change the cover and details of the presentation around them, one still being read among them
        const themeMatch = THEME_FILE_PATH_PATTERN.exec(path);
        const themeOwnerPath = themeMatch ? (themeMatch[1] ?? '/') : null;
        if (themeOwnerPath !== null && holdsPresentationFile(this.app, themeOwnerPath)) {
            this.queueFolder(themeOwnerPath);
        }
    }

    private queueCompanionFoldersIn(folder: TFolder): void {
        for (const child of folder.children) {
            if (child instanceof TFolder) {
                this.queueCompanionFoldersIn(child);
            } else if (child instanceof TFile && getPresentationMemberKind(child.name) === 'companion') {
                this.queueFolder(folder.path);
            }
        }
    }

    private queueFolder(folderPath: string): void {
        this.unrestoredFolders?.delete(folderPath);
        this.pendingFolders.add(folderPath);
        if (this.refreshTimer === null) {
            this.refreshTimer = window.setTimeout(() => {
                this.refreshTimer = null;
                const folderPaths = [...this.pendingFolders];
                this.pendingFolders.clear();
                this.reads = this.reads.then(() => this.readQueued(folderPaths));
            }, FOLDER_REFRESH_DELAY_MS);
        }
    }

    /** Reads one quiet interval's folders one at a time, after the reads of the intervals before it. */
    private async readQueued(folderPaths: readonly string[]): Promise<void> {
        for (const folderPath of folderPaths) {
            if (this.disposed) {
                return;
            }
            try {
                await this.refreshFolder(folderPath);
            } catch (error: unknown) {
                // A listener that throws while a folder is published leaves the other folders to be read
                console.error('Failed to publish a presentation folder:', error);
            }
        }
    }

    /**
     * Whether the vault's volume finds a name in another case, learned once: its config folder's plugins folder spelled
     * in the other case is found, though no folder is spelled so.
     */
    private vaultIgnoresCase(): Promise<boolean> {
        this.ignoresCase ??= (async () => {
            const known = `${this.app.vault.configDir}/plugins`;
            const other = [...known]
                .map(letter => (letter === letter.toLowerCase() ? letter.toUpperCase() : letter.toLowerCase()))
                .join('');
            return other !== known && (await this.app.vault.adapter.exists(other)) && !(await this.app.vault.adapter.exists(other, true));
        })().catch(() => false);
        return this.ignoresCase;
    }

    /** Whether MarkdownPoint never opens a pair in the folder: one in a presentation's saved versions or inside another presentation. */
    private isExcluded(folder: TFolder, ignoresCase: boolean): boolean {
        return isInSavedVersions(folder.path, path => holdsPresentationFile(this.app, path), ignoresCase) || isInsidePresentation(folder);
    }

    private async refreshFolder(folderPath: string): Promise<void> {
        const ignoresCase = await this.vaultIgnoresCase();
        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        if (this.disposed) {
            return;
        }
        // A folder without a presentation file, or one where MarkdownPoint never opens a pair, holds none and is not
        // read; a reading stored for it goes at the next start once it holds no presentation file, unused until then
        if (!(folder instanceof TFolder) || !holdsPresentationFile(this.app, folderPath) || this.isExcluded(folder, ignoresCase)) {
            this.publish(folderPath, null);
            return;
        }
        // Each stamp is taken before its files are read, so a file that changes during the read is read again at the next start
        const folderStamp = getFolderStamp(folder);
        let pair: Omit<PresentationReading, 'theme'> | null;
        try {
            pair = await this.readPair(folder);
        } catch {
            // A file deleted, renamed or not yet downloaded during the read leaves the folder unread until its next
            // event; nothing is stored, so the next start reads it again
            if (!this.disposed) {
                this.publish(folderPath, null);
                this.storeReading(folderPath, null);
            }
            return;
        }
        let reading: PresentationReading | null = null;
        let themeStamp: unknown[] | null = null;
        let complete = true;
        if (pair) {
            const themeFolder = getThemeFolder(this.app, folderPath, pair.presentation.theme);
            themeStamp = getThemeStamp(themeFolder);
            let theme: ThemeFacts | null = null;
            try {
                theme = await this.readTheme(pair.presentation.theme, themeFolder);
            } catch {
                // A theme file that can't be read now, as one replaced, locked or not yet downloaded, leaves the
                // presentation listed without its theme, as MarkdownPoint opens it; nothing is stored, so the file's
                // next event or the next start reads it again
                complete = false;
            }
            reading = { ...pair, theme };
        }
        if (this.disposed) {
            return;
        }
        // Stored first, so a listener that throws while it is published leaves the reading stored
        this.storeReading(
            folderPath,
            complete ? { stamp: getStamp(folderStamp, reading?.presentation.theme ?? null, themeStamp), reading } : null
        );
        this.publish(folderPath, reading ? getPresentationSummary(folderPath, reading) : null);
    }

    /** The folder's pair through MarkdownPoint's readers: its file names and what it holds when it opens, else null. */
    private async readPair(folder: TFolder): Promise<Omit<PresentationReading, 'theme'> | null> {
        const pair = findPresentationPair(folder.path, getFolderEntries(folder));
        if (pair.kind !== 'pair') {
            return null;
        }
        const files = folder.children.filter((entry): entry is TFile => entry instanceof TFile);
        const companionFile = files.find(file => file.name === pair.json);
        const slidesFile = files.find(file => file.name === pair.markdown);
        if (!companionFile || !slidesFile) {
            return null;
        }
        const companion = await this.readCompanion(folder.path, companionFile);
        const opened = readPresentationMarkdown(companion, {
            name: slidesFile.name,
            bytes: new Uint8Array(await this.app.vault.readBinary(slidesFile))
        });
        return opened.opens ? { markdown: slidesFile.name, json: companionFile.name, presentation: opened.presentation } : null;
    }

    private async readCompanion(folderPath: string, file: TFile): Promise<PresentationFileReading> {
        const kept = this.keptFile;
        if (kept && kept.path === file.path && kept.mtime === file.stat.mtime && kept.size === file.stat.size) {
            return kept.reading;
        }
        // The time and size are taken before the read, so a file that changes during it is never taken as read
        const { mtime, size } = file.stat;
        const events = this.vaultEvents;
        const reading = readPresentationFile(folderPath, { name: file.name, bytes: new Uint8Array(await this.app.vault.readBinary(file)) });
        // An event during the read can name the file with its time and size unchanged, so only a quiet read is kept
        if (this.vaultEvents === events) {
            this.keptFile = { path: file.path, mtime, size, reading };
        }
        return reading;
    }

    /**
     * The presentation's theme as MarkdownPoint reads it from the JSON files of its folder, or null where it doesn't;
     * a file that can't be read now throws.
     */
    private async readTheme(themeKey: string, themeFolder: TFolder | null): Promise<ThemeFacts | null> {
        const files = getThemeFiles(themeFolder);
        if (files.length === 0) {
            return null;
        }
        const contents = await Promise.all(files.map(file => this.app.vault.readBinary(file)));
        const reading = readPresentationTheme(
            themeKey,
            files.map((file, at) => ({ name: file.name, bytes: new Uint8Array(contents[at]) }))
        );
        return reading.reads ? reading.theme : null;
    }

    private storeReading(folderPath: string, stored: StoredPresentationReading | null): void {
        void this.getStore()
            .then(store => store?.setPresentationReading(folderPath, stored))
            .catch((error: unknown) => {
                if (!this.disposed) {
                    console.error('Failed to store a presentation reading:', error);
                }
            });
    }

    private publish(folderPath: string, next: PresentationSummary | null): void {
        const previous = this.summaries.get(folderPath) ?? null;
        if (isSameSummary(previous, next)) {
            return;
        }

        if (next) {
            this.summaries.set(folderPath, next);
        } else {
            this.summaries.delete(folderPath);
        }

        const rolesChanged = previous?.slidesPath !== next?.slidesPath || previous?.companionPath !== next?.companionPath;
        if (rolesChanged) {
            if (previous) {
                this.roles.delete(previous.slidesPath);
                this.roles.delete(previous.companionPath);
            }
            if (next) {
                this.roles.set(next.slidesPath, 'slides');
                this.roles.set(next.companionPath, 'companion');
            }
        }

        this.summaryListeners.get(folderPath)?.forEach(listener => listener());
        if (rolesChanged) {
            this.roleListeners.forEach(listener => listener());
        }
    }
}

// The plugin owns one service; module-level access lets synchronous helpers such as file visibility and row
// height estimation read presentation roles without threading the service through every caller.
let activePresentationService: PresentationService | null = null;

export function setPresentationService(service: PresentationService | null): void {
    activePresentationService = service;
}

export function getPresentationService(): PresentationService | null {
    return activePresentationService;
}

/** Returns the file's role in a presentation that opens, or null for every other file. */
export function getPresentationFileRole(file: TFile): PresentationFileRole | null {
    return activePresentationService?.getRole(file.path) ?? null;
}
