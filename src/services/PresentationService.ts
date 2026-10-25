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

import { getDefaults, Lexer, Tokenizer } from 'marked';
import type { Tokens } from 'marked';
import { TFile, TFolder } from 'obsidian';
import type { App, EventRef, TAbstractFile } from 'obsidian';

/**
 * A MarkdownPoint presentation is a folder holding `slides.md` (the writing) and `presentation.mdpoint`
 * (the presentation data), plus the embedded theme under `themes/<key>/`. The recognition rules below
 * mirror the MarkdownPoint plugin (markdownpoint-obsidian `src/format/recognition.ts`), so both plugins
 * agree on which folders are presentations.
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
    /** Theme display name, or null when the presentation names no theme */
    themeName: string | null;
    /** Slide size in canvas units from the theme's master.json, or null when the theme is missing */
    size: { width: number; height: number } | null;
    /** Null when the theme files are missing or unreadable; the cover then uses Obsidian colors */
    cover: PresentationCover | null;
}

const SLIDES_FILE_NAME = 'slides.md';
const COMPANION_FILE_NAME = 'presentation.mdpoint';
const DOCUMENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const STABLE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const RESERVED_THEME_KEY_PATTERN = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/;
const FRONTMATTER_PATTERN = /^---[ \t]*\n(?:[^\n]*\n)*?---[ \t]*(?:\n|$)/;
const SLIDE_MARKER_PATTERN = /^<!--\s*slide:\s*([a-z][a-z0-9-]*)\s*-->$/;
// Any line MarkdownPoint reads as a marker, misspelled ones included; each one outside code starts a new Markdown block
const STRUCTURAL_MARKER_PATTERN =
    /^<!--\s*\/?(?:mp:)?(?:section|slide|composition|text|control|notes)(?=[:\s]|-->|$):?\s*(?:\S+?\s*)?(?:-->.*)?$/i;
const LINE_BREAK_TAG_PATTERN = /^<br[ \t]*\/?>(?:[ \t]*\n)?/i;
const OPEN_FENCE_PROBE = 'mp-open-fence-probe';
const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i;
const BRAND_COLOR_REFERENCE_PATTERN = /^\{brand\.([^}]+)\}$/;
// Matches `<presentation folder>/themes/<theme key>/<file>.json`; group 1 is the presentation folder (absent at the vault root)
const THEME_FILE_PATH_PATTERN = /^(?:(.*)\/)?themes\/[^/]+\/[^/]+\.json$/;
// Collapses the vault event burst of a save, move or sync into one read per folder
const FOLDER_REFRESH_DELAY_MS = 100;

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
 * Classifies a file name as a candidate member of a presentation pair. Candidates include sync conflict
 * copies (`slides 2.md`, `presentation (1).mdpoint`), so a folder with conflicts is not mistaken for a
 * valid pair. AppleDouble files (`._*`) are ignored.
 */
function getPresentationMemberKind(name: string): 'markdown' | 'companion' | null {
    const lower = name.toLowerCase();
    if (!name.startsWith('._') && name.length > 8 && lower.endsWith('.mdpoint')) {
        return 'companion';
    }
    return /^slides(?![a-z])/i.test(name) && lower.endsWith('.md') ? 'markdown' : null;
}

/** Returns the pair's file names when a folder holds exactly one `slides.md` and one `presentation.mdpoint`. */
export function getPresentationPairNames(names: readonly string[]): { markdown: string; companion: string } | null {
    const markdown = names.filter(name => getPresentationMemberKind(name) === 'markdown');
    const companion = names.filter(name => getPresentationMemberKind(name) === 'companion');
    if (markdown.length !== 1 || companion.length !== 1) {
        return null;
    }
    if (markdown[0].toLowerCase() !== SLIDES_FILE_NAME || companion[0].toLowerCase() !== COMPANION_FILE_NAME) {
        return null;
    }
    return { markdown: markdown[0], companion: companion[0] };
}

/**
 * Returns the shared document id when `slides.md` frontmatter and the parsed `.mdpoint` data belong to the
 * same presentation. A copied or replaced companion keeps its own id, so a mismatch is not a presentation.
 */
export function getPresentationIdentity(frontmatter: unknown, companion: unknown): string | null {
    if (!isRecord(frontmatter) || !isRecord(companion)) {
        return null;
    }
    if (frontmatter.markdownpoint !== 1 || companion.markdownpoint !== 1 || companion.kind !== 'presentation') {
        return null;
    }
    const documentId = frontmatter.document;
    if (typeof documentId !== 'string' || !DOCUMENT_ID_PATTERN.test(documentId)) {
        return null;
    }
    return companion.document === documentId ? documentId : null;
}

/**
 * MarkdownPoint's grammar reads a `<br>` line as a line break in a paragraph. Marked's default reads it as an HTML
 * block that runs to the next blank line and takes in any fence opened before that line, which would change
 * whether a later marker is inside code.
 */
class PresentationTokenizer extends Tokenizer {
    html(src: string): Tokens.HTML | undefined {
        return LINE_BREAK_TAG_PATTERN.test(src) ? undefined : super.html(src);
    }
}

/**
 * Returns true when the Markdown ends inside a fenced code block, as Marked reads it: an appended probe line joins
 * the last code block only while that block is still open. A fence opened in a list item or a quote closes with it,
 * so only a top-level fence counts.
 */
function endsInOpenFence(markdown: string): boolean {
    if (!markdown.includes('```') && !markdown.includes('~~~')) {
        return false;
    }
    const lexer = new Lexer({ ...getDefaults(), tokenizer: new PresentationTokenizer() });
    const tokens = lexer.blockTokens(`${markdown}\n${OPEN_FENCE_PROBE}`).filter(token => token.type !== 'space');
    const last = tokens[tokens.length - 1];
    return last?.type === 'code' && last.codeBlockStyle !== 'indented' && last.raw.replace(/\n+$/, '').endsWith(OPEN_FENCE_PROBE);
}

/**
 * Counts slides the way the MarkdownPoint app reads `slides.md` (`markerTokens` in MarkdownPoint core): one per
 * `<!-- slide: id -->` line after the frontmatter whose id is a stable id and that a line break ends. The app
 * rejects any other slide marker, so it is not counted.
 *
 * Every marker-shaped line outside code starts a new Markdown block, so a fence or HTML in one block cannot hide
 * the markers of the next. A marker-shaped line inside a fenced code block is slide content. Marked decides that
 * from the block's text before the line, and is asked only after a fence-like line or while a fence is open,
 * because a later line can close it. Keep Marked on the release MarkdownPoint uses, because releases differ in
 * which lines start an HTML block, and an HTML block decides whether a fence-like line opens code.
 */
export function countPresentationSlides(markdown: string): number {
    const text = (markdown.charCodeAt(0) === 0xfeff ? markdown.slice(1) : markdown).replace(/\r\n?/g, '\n');
    let offset = FRONTMATTER_PATTERN.exec(text)?.[0].length ?? 0;
    let blockStart = offset;
    let fenceLineSeen = false;
    let fenceOpen = false;
    let count = 0;
    while (offset < text.length) {
        const newline = text.indexOf('\n', offset);
        const end = newline < 0 ? text.length : newline + 1;
        // Markers are read without the trailing spaces an editor may leave
        const line = text.slice(offset, newline < 0 ? text.length : newline).replace(/[ \t]+$/, '');
        if (line.includes('```') || line.includes('~~~')) {
            fenceLineSeen = true;
        }
        if (STRUCTURAL_MARKER_PATTERN.test(line)) {
            if (fenceLineSeen || fenceOpen) {
                fenceOpen = endsInOpenFence(text.slice(blockStart, offset));
                fenceLineSeen = false;
            }
            if (!fenceOpen) {
                blockStart = end;
                const match = SLIDE_MARKER_PATTERN.exec(line);
                if (match && newline >= 0 && STABLE_ID_PATTERN.test(match[1])) {
                    count += 1;
                }
            }
        }
        offset = end;
    }
    return count;
}

/** Theme keys name a folder under `themes/`, so anything that is not a stable id is ignored. */
export function isPresentationThemeKey(value: unknown): value is string {
    return typeof value === 'string' && STABLE_ID_PATTERN.test(value) && !RESERVED_THEME_KEY_PATTERN.test(value);
}

/** Uses the theme's own `name`, otherwise the key with separators as spaces and a capital first letter. */
export function getPresentationThemeName(themeKey: string, master: Record<string, unknown> | null): string {
    const name = master?.name;
    if (typeof name === 'string' && name.trim()) {
        return name.trim();
    }
    const words = themeKey.replace(/[-_]+/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
}

function resolveThemeColor(value: unknown, brandColors: Record<string, unknown>): string | null {
    if (typeof value !== 'string') {
        return null;
    }
    if (HEX_COLOR_PATTERN.test(value)) {
        return value;
    }
    const reference = BRAND_COLOR_REFERENCE_PATTERN.exec(value);
    const brandColor = reference ? brandColors[reference[1]] : undefined;
    return typeof brandColor === 'string' && HEX_COLOR_PATTERN.test(brandColor) ? brandColor : null;
}

function resolveCoverColors(scheme: unknown, brandColors: Record<string, unknown>): PresentationCoverColors | null {
    if (!isRecord(scheme)) {
        return null;
    }
    const background = resolveThemeColor(scheme.background, brandColors);
    const text = resolveThemeColor(scheme.text, brandColors);
    if (!background || !text) {
        return null;
    }
    return { background, text, muted: resolveThemeColor(scheme.muted, brandColors) ?? text };
}

/**
 * Resolves the cover from the theme's master and Title layout. The Title layout's `scheme` applies in both
 * light and dark mode; without one the cover follows the theme's `light` and `dark` schemes. The title text
 * object's `align` decides between a centered and a start-aligned cover.
 */
export function resolvePresentationCover(
    master: Record<string, unknown> | null,
    titleLayout: Record<string, unknown> | null
): PresentationCover | null {
    if (!master || !isRecord(master.schemes)) {
        return null;
    }
    const schemes = master.schemes;
    const brand = isRecord(master.brand) && isRecord(master.brand.colors) ? master.brand.colors : {};
    const layoutScheme = typeof titleLayout?.scheme === 'string' ? titleLayout.scheme : null;
    const light = resolveCoverColors(schemes[layoutScheme ?? 'light'], brand);
    if (!light) {
        return null;
    }
    const dark = layoutScheme ? null : resolveCoverColors(schemes.dark, brand);
    const objects: unknown[] = Array.isArray(titleLayout?.objects) ? titleLayout.objects : [];
    const titleObject = objects.find(object => isRecord(object) && object.id === 'title');
    const align = isRecord(titleObject) && titleObject.align === 'center' ? 'center' : 'start';
    return { align, light, dark };
}

function resolveSlideSize(master: Record<string, unknown> | null): { width: number; height: number } | null {
    const size = master?.size;
    if (!isRecord(size) || typeof size.width !== 'number' || typeof size.height !== 'number') {
        return null;
    }
    return { width: size.width, height: size.height };
}

function findChildFile(folder: TFolder, name: string): TFile | null {
    const child = folder.children.find(entry => entry instanceof TFile && entry.name === name);
    return child instanceof TFile ? child : null;
}

async function readJson(app: App, path: string): Promise<unknown> {
    const file = app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) {
        return null;
    }
    try {
        return JSON.parse(await app.vault.cachedRead(file)) as unknown;
    } catch {
        // Unreadable or partially synced JSON reads as missing; the next modify event reads it again
        return null;
    }
}

async function readJsonRecord(app: App, path: string): Promise<Record<string, unknown> | null> {
    const value = await readJson(app, path);
    return isRecord(value) ? value : null;
}

/**
 * Reads one folder and returns its summary when it holds a valid presentation pair, otherwise null.
 * The vault is read here, outside rendering, and rows read the cached summary.
 */
async function readPresentation(app: App, folderPath: string): Promise<PresentationSummary | null> {
    const folder = app.vault.getAbstractFileByPath(folderPath);
    if (!(folder instanceof TFolder)) {
        return null;
    }
    const pair = getPresentationPairNames(folder.children.filter(child => child instanceof TFile).map(child => child.name));
    if (!pair) {
        return null;
    }
    const slidesFile = findChildFile(folder, pair.markdown);
    const companionFile = findChildFile(folder, pair.companion);
    if (!slidesFile || !companionFile) {
        return null;
    }
    // Frontmatter comes from the metadata cache; a slides.md that is not indexed yet is verified again on its `changed` event
    const frontmatter = app.metadataCache.getFileCache(slidesFile)?.frontmatter;
    const companion = await readJson(app, companionFile.path);
    if (getPresentationIdentity(frontmatter, companion) === null || !isRecord(companion)) {
        return null;
    }

    const slideCount = countPresentationSlides(await app.vault.cachedRead(slidesFile));
    const themeKey = isPresentationThemeKey(companion.theme) ? companion.theme : null;
    const themeFolderPath = themeKey ? joinPath(folderPath, `themes/${themeKey}`) : null;
    const master = themeFolderPath ? await readJsonRecord(app, `${themeFolderPath}/master.json`) : null;
    const titleLayout = themeFolderPath ? await readJsonRecord(app, `${themeFolderPath}/title.json`) : null;

    return {
        folderPath,
        slidesPath: slidesFile.path,
        companionPath: companionFile.path,
        slideCount,
        themeName: themeKey ? getPresentationThemeName(themeKey, master) : null,
        size: resolveSlideSize(master),
        cover: resolvePresentationCover(master, titleLayout)
    };
}

function isSameSummary(previous: PresentationSummary | null, next: PresentationSummary | null): boolean {
    return JSON.stringify(previous) === JSON.stringify(next);
}

/**
 * Keeps an in-memory index of the vault's MarkdownPoint presentations.
 *
 * Roles (which paths are `slides.md` and `presentation.mdpoint` of a verified pair) are published only after
 * the companion's document id matches the frontmatter, together with the presentation data. Row rendering,
 * row height estimates and file visibility all read the same role map synchronously, so they always agree:
 * a pair that is not verified yet renders, measures and filters as ordinary files.
 */
export class PresentationService {
    private readonly app: App;
    private readonly summaries = new Map<string, PresentationSummary>();
    private readonly roles = new Map<string, PresentationFileRole>();
    private readonly summaryListeners = new Map<string, Set<() => void>>();
    private readonly roleListeners = new Set<() => void>();
    private readonly pendingFolders = new Set<string>();
    // Bumped per folder read so a slow read that finishes after a newer one cannot publish stale data
    private readonly readGenerations = new Map<string, number>();
    private readonly vaultEventRefs: EventRef[] = [];
    private metadataEventRef: EventRef | null = null;
    private refreshTimer: number | null = null;
    private disposed = false;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Registers vault and metadata listeners and queues every folder that holds a `.mdpoint` file.
     * Call after the workspace layout is ready, because the vault emits a `create` event per file while it loads.
     */
    start(): void {
        const { vault, metadataCache } = this.app;
        this.vaultEventRefs.push(
            vault.on('create', file => this.handleChange(file, file.path)),
            vault.on('modify', file => this.handleChange(file, file.path)),
            vault.on('delete', file => this.handleChange(file, file.path)),
            vault.on('rename', (file, oldPath) => {
                this.handleChange(file, oldPath);
                this.handleChange(file, file.path);
            })
        );
        // Frontmatter edits in slides.md arrive here once the metadata cache has indexed them
        this.metadataEventRef = metadataCache.on('changed', file => this.handleChange(file, file.path));

        for (const file of vault.getFiles()) {
            if (getPresentationMemberKind(file.name) === 'companion') {
                this.queueFolder(getParentPath(file.path));
            }
        }
    }

    dispose(): void {
        this.disposed = true;
        this.vaultEventRefs.forEach(ref => this.app.vault.offref(ref));
        this.vaultEventRefs.length = 0;
        if (this.metadataEventRef) {
            this.app.metadataCache.offref(this.metadataEventRef);
            this.metadataEventRef = null;
        }
        if (this.refreshTimer !== null) {
            window.clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        this.pendingFolders.clear();
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

    private handleChange(file: TAbstractFile, path: string): void {
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

        const folderPath = getParentPath(path);
        if (getPresentationMemberKind(getFileName(path)) !== null) {
            this.queueFolder(folderPath);
            return;
        }
        // Theme edits change the cover and details of an already recognized presentation
        const themeMatch = THEME_FILE_PATH_PATTERN.exec(path);
        const themeOwnerPath = themeMatch ? (themeMatch[1] ?? '/') : null;
        if (themeOwnerPath !== null && this.summaries.has(themeOwnerPath)) {
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
        this.pendingFolders.add(folderPath);
        if (this.refreshTimer === null) {
            this.refreshTimer = window.setTimeout(() => {
                this.refreshTimer = null;
                const folderPaths = Array.from(this.pendingFolders);
                this.pendingFolders.clear();
                folderPaths.forEach(path => void this.refreshFolder(path));
            }, FOLDER_REFRESH_DELAY_MS);
        }
    }

    private async refreshFolder(folderPath: string): Promise<void> {
        const generation = (this.readGenerations.get(folderPath) ?? 0) + 1;
        this.readGenerations.set(folderPath, generation);

        let next: PresentationSummary | null;
        try {
            next = await readPresentation(this.app, folderPath);
        } catch {
            // A file deleted or renamed during the read makes the folder unreadable until its next event
            next = null;
        }
        if (this.disposed || this.readGenerations.get(folderPath) !== generation) {
            return;
        }
        this.publish(folderPath, next);
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

/** Returns the file's role in a verified presentation, or null for every other file. */
export function getPresentationFileRole(file: TFile): PresentationFileRole | null {
    return activePresentationService?.getRole(file.path) ?? null;
}
