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
import type { Token, Tokens } from 'marked';
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
    /** Slide size in canvas units from the theme's master.json, 1920 × 1080 where it declares none, or null when the theme is missing or MarkdownPoint refuses its master or size */
    size: { width: number; height: number } | null;
    /** Null when the theme files are missing or unreadable, or MarkdownPoint refuses the master; the cover then uses Obsidian colors */
    cover: PresentationCover | null;
}

const SLIDES_FILE_NAME = 'slides.md';
const COMPANION_FILE_NAME = 'presentation.mdpoint';
// Format major 1 with any minor, written without leading zeros: "1.0", "1.10"
const FORMAT_VERSION_PATTERN = /^1\.(?:0|[1-9]\d{0,8})$/;
// A lowercase canonical UUID, as the format writes a presentation's id and a theme's
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
// The keys a master states; MarkdownPoint refuses a master that leaves one out before reading any of its settings
const MASTER_REQUIRED_KEYS = ['markdownpoint', 'type', 'id', 'fonts', 'schemes'];
const DEFAULT_SLIDE_SIZE = { width: 1920, height: 1080 };
// The longest side a slide has, in canvas units
const MAX_SLIDE_SIDE = 8192;
const STABLE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const RESERVED_THEME_KEY_PATTERN = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/;
const FRONTMATTER_PATTERN = /^---[ \t]*\n(?:[^\n]*\n)*?---[ \t]*(?:\n|$)/;
const SLIDE_MARKER_PATTERN = /^<!--\s*slide:\s*([a-z][a-z0-9-]*)\s*-->$/;
// Any line MarkdownPoint reads as a marker, misspelled ones included; each one outside code starts a new Markdown block
const STRUCTURAL_MARKER_PATTERN =
    /^<!--\s*\/?(?:mp:)?(?:section|slide|composition|text|control|notes)(?=[:\s]|-->|$):?\s*(?:\S+?\s*)?(?:-->.*)?$/i;
const LINE_BREAK_TAG_PATTERN = /^<br[ \t]*\/?>(?:[ \t]*\n)?/i;
const OPEN_FENCE_PROBE = 'mp-open-fence-probe';
// A hex color as the format writes one: three, four, six or eight digits
const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
// A scheme role's brand color, written as its path in the master: `{brand.colors.<name>}`, the name a stable id
const BRAND_COLOR_REFERENCE_PATTERN = /^\{brand\.colors\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)\}$/;
// A day the calendar has, from year 0001 on, February 29 in leap years alone: a year divisible by 4, a century only when divisible by 400
const CALENDAR_DAY =
    '(?!0000)(?:[0-9]{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12][0-9]|3[01])|(?:0[469]|11)-(?:0[1-9]|[12][0-9]|30)|02-(?:0[1-9]|1[0-9]|2[0-8]))' +
    '|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:[02468][048]|[13579][26])00)-02-29)';
// A saved version's folder name: its save time in UTC to the second on a day the calendar has, then its tail
const VERSION_ID_PATTERN = new RegExp(`^${CALENDAR_DAY}T(?:[01][0-9]|2[0-3])\\.[0-5][0-9]\\.[0-5][0-9]Z-[a-z0-9]{4}$`);
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
 * MarkdownPoint states its format version as a `"major.minor"` string, because as numbers 1.10 and 1.1 are equal.
 * A file of format major 1 opens whatever its minor, since a later minor only adds what a reader may ignore.
 * The type check comes first because a regular expression test would turn an unquoted `1.1` into a match.
 */
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
            (name === 'versions' || (ignoresCase && name.toLowerCase() === 'versions')) &&
            (VERSION_ID_PATTERN.test(folders[at + 1] ?? '') || holdsPresentation(folders.slice(0, at).join('/') || '/'))
    );
}

function holdsPresentationFile(app: App, folderPath: string): boolean {
    const folder = app.vault.getAbstractFileByPath(folderPath);
    return (
        folder instanceof TFolder &&
        folder.children.some(child => child instanceof TFile && getPresentationMemberKind(child.name) === 'companion')
    );
}

function isReadableFormatVersion(value: unknown): boolean {
    return typeof value === 'string' && FORMAT_VERSION_PATTERN.test(value);
}

/**
 * Returns the shared presentation id when `slides.md` frontmatter and the parsed `.mdpoint` data belong to the
 * same presentation. A copied or replaced companion keeps its own id, so a mismatch is not a presentation.
 */
export function getPresentationIdentity(frontmatter: unknown, companion: unknown): string | null {
    if (!isRecord(frontmatter) || !isRecord(companion)) {
        return null;
    }
    if (
        !isReadableFormatVersion(frontmatter.markdownpoint) ||
        !isReadableFormatVersion(companion.markdownpoint) ||
        companion.type !== 'presentation'
    ) {
        return null;
    }
    const presentationId = frontmatter.id;
    if (typeof presentationId !== 'string' || !UUID_PATTERN.test(presentationId)) {
        return null;
    }
    return companion.id === presentationId ? presentationId : null;
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
 * Returns true when the last line of the Markdown stands in a fenced code block, one a list item or a quote ends with
 * included, which an indented line continues (`markdownLastLineFenced` in MarkdownPoint core).
 */
function lastLineFenced(markdown: string): boolean {
    const lexer = new Lexer({ ...getDefaults(), tokenizer: new PresentationTokenizer() });
    const lastBlock = (tokens: readonly Token[] | undefined) => {
        const blocks = tokens?.filter(token => token.type !== 'space') ?? [];
        return blocks[blocks.length - 1];
    };
    let last = lastBlock(lexer.blockTokens(markdown));
    while (last?.type === 'list' || last?.type === 'list_item' || last?.type === 'blockquote') {
        // A list holds its items, and an item or a quote its blocks
        const { items, tokens } = last as { items?: Token[]; tokens?: Token[] };
        last = lastBlock(items ?? tokens);
    }
    return last?.type === 'code' && last.codeBlockStyle !== 'indented';
}

/**
 * Counts slides the way the MarkdownPoint app reads `slides.md` (`markerTokens` in MarkdownPoint core): one per
 * `<!-- slide: id -->` line after the frontmatter whose id is a stable id and that a line break ends, the spaces or
 * tabs around it aside. The app rejects any other slide marker, so it is not counted.
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
    let blockFenced = false;
    let fenceOpen = false;
    let count = 0;
    while (offset < text.length) {
        const newline = text.indexOf('\n', offset);
        const end = newline < 0 ? text.length : newline + 1;
        // Markers are read without the spaces or tabs an editor may leave at either end
        const padded = text.slice(offset, newline < 0 ? text.length : newline).replace(/[ \t]+$/, '');
        const line = padded.replace(/^[ \t]+/, '');
        if (line.includes('```') || line.includes('~~~')) {
            fenceLineSeen = true;
            blockFenced = true;
        }
        if (STRUCTURAL_MARKER_PATTERN.test(line)) {
            if (fenceLineSeen || fenceOpen) {
                fenceOpen = endsInOpenFence(text.slice(blockStart, offset));
                fenceLineSeen = false;
            }
            // An indented marker-shaped line may continue a fenced code block that a list item or a quote holds
            const inCode = fenceOpen || (blockFenced && line !== padded && lastLineFenced(`${text.slice(blockStart, offset)}${padded}\n`));
            if (!inCode) {
                blockStart = end;
                blockFenced = false;
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
    const brandColor = reference && Object.prototype.hasOwnProperty.call(brandColors, reference[1]) ? brandColors[reference[1]] : undefined;
    return typeof brandColor === 'string' && HEX_COLOR_PATTERN.test(brandColor) ? brandColor : null;
}

function resolveCoverColors(scheme: unknown, brandColors: Record<string, unknown>): PresentationCoverColors | null {
    if (!isRecord(scheme) || !isRecord(scheme.colors)) {
        return null;
    }
    const colors = scheme.colors;
    const background = resolveThemeColor(colors.background, brandColors);
    const text = resolveThemeColor(colors.text, brandColors);
    if (!background || !text) {
        return null;
    }
    return { background, text, muted: resolveThemeColor(colors.muted, brandColors) ?? text };
}

/**
 * Resolves the cover from the theme's master and Title layout. The Title layout's `scheme` applies in both
 * light and dark mode; without one, or with one the master lacks, which MarkdownPoint shows in light, the cover
 * follows the theme's `light` and `dark` schemes. The title text
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
    const layoutScheme =
        typeof titleLayout?.scheme === 'string' && Object.prototype.hasOwnProperty.call(schemes, titleLayout.scheme)
            ? titleLayout.scheme
            : null;
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

/**
 * The theme's master as MarkdownPoint reads it, or null where MarkdownPoint refuses it before reading any of its
 * settings, as MarkdownPoint core's theme file envelope does: it states format major 1 with any minor, its type is
 * "master", its id is a lowercase UUID, and it has every key a master states.
 */
export function readableMaster(master: Record<string, unknown> | null): Record<string, unknown> | null {
    if (!master || !MASTER_REQUIRED_KEYS.every(key => Object.prototype.hasOwnProperty.call(master, key))) {
        return null;
    }
    const readable = isReadableFormatVersion(master.markdownpoint) && master.type === 'master';
    return readable && typeof master.id === 'string' && UUID_PATTERN.test(master.id) ? master : null;
}

/**
 * The slide size a readable master gives, as MarkdownPoint core's `masterJsonSize` reads it, or null where MarkdownPoint
 * refuses it. A master that declares no size gives 1920 × 1080. Each side is read to the millionth and must then be a
 * whole number from 1 to 8192, width first. Format 1.0 refuses any other side and any key beside width and height. A
 * newer minor gives 1920 × 1080 for the whole size from the first side outside that range, and passes other keys
 * over. Every minor refuses a size that isn't a record and a side that is left out or isn't a finite number.
 */
export function resolveSlideSize(master: Record<string, unknown> | null): { width: number; height: number } | null {
    if (!master) {
        return null;
    }
    const size = master.size;
    if (size === undefined) {
        return { ...DEFAULT_SLIDE_SIZE };
    }
    if (!isRecord(size) || !('width' in size) || !('height' in size)) {
        return null;
    }
    // MarkdownPoint reads format 1.0; a newer minor reads as far as 1.0 knows it
    const newerMinor = master.markdownpoint !== '1.0';
    if (!newerMinor && Object.keys(size).some(key => key !== 'width' && key !== 'height')) {
        return null;
    }
    const sides: number[] = [];
    for (const side of [size.width, size.height]) {
        if (typeof side !== 'number' || !Number.isFinite(side)) {
            return null;
        }
        // To the millionth, as MarkdownPoint keeps every number a file holds
        const value = Number(side.toFixed(6));
        if (!Number.isInteger(value) || value < 1 || value > MAX_SLIDE_SIDE) {
            return newerMinor ? { ...DEFAULT_SLIDE_SIZE } : null;
        }
        sides.push(value);
    }
    return { width: sides[0], height: sides[1] };
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
 * Reads one folder and returns its summary when it holds a valid presentation pair outside a presentation's saved
 * versions, otherwise null.
 * The vault is read here, outside rendering, and rows read the cached summary.
 */
async function readPresentation(app: App, folderPath: string, ignoresCase: boolean): Promise<PresentationSummary | null> {
    const folder = app.vault.getAbstractFileByPath(folderPath);
    // A saved version's pair belongs to its presentation's history, never a presentation of its own
    if (!(folder instanceof TFolder) || isInSavedVersions(folderPath, path => holdsPresentationFile(app, path), ignoresCase)) {
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
    const master = readableMaster(themeFolderPath ? await readJsonRecord(app, `${themeFolderPath}/master.json`) : null);
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
 * the companion's presentation id matches the frontmatter, together with the presentation data. Row rendering,
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
    private ignoresCase: Promise<boolean> | null = null;

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
            vault.on('create', file => this.handleChange(file, file.path, true)),
            vault.on('modify', file => this.handleChange(file, file.path, false)),
            vault.on('delete', file => this.handleChange(file, file.path, true)),
            vault.on('rename', (file, oldPath) => {
                this.handleChange(file, oldPath, true);
                this.handleChange(file, file.path, true);
            })
        );
        // Frontmatter edits in slides.md arrive here once the metadata cache has indexed them
        this.metadataEventRef = metadataCache.on('changed', file => this.handleChange(file, file.path, false));

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

    /** `placed` is true for an event that adds, removes or moves the file, false for one that changes what it holds. */
    private handleChange(file: TAbstractFile, path: string, placed: boolean): void {
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
            // A copy of a saved version is told apart by the presentation file around its `versions/`, so it is read
            // again when that file comes or goes
            const folder =
                placed && getPresentationMemberKind(getFileName(path)) === 'companion'
                    ? this.app.vault.getAbstractFileByPath(folderPath)
                    : null;
            if (folder instanceof TFolder) {
                for (const child of folder.children) {
                    if (child instanceof TFolder && child.name.toLowerCase() === 'versions') {
                        this.queueCompanionFoldersIn(child);
                    }
                }
            }
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

    private async refreshFolder(folderPath: string): Promise<void> {
        const generation = (this.readGenerations.get(folderPath) ?? 0) + 1;
        this.readGenerations.set(folderPath, generation);

        let next: PresentationSummary | null;
        try {
            next = await readPresentation(this.app, folderPath, await this.vaultIgnoresCase());
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
