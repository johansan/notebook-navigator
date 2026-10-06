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

import { App, TFile, prepareFuzzySearch, type SearchResult } from 'obsidian';
import { naturalCompare } from '../../../utils/sortUtils';
import type { IconDefinition, IconProvider, IconRenderResult } from '../types';
import { getIconRenderToken, resetIconContainer } from './providerUtils';

// Icon provider that renders SVG files stored in the vault.
interface CachedSvg {
    mtime: number;
    svg: SVGSVGElement;
}

const SVG_CACHE = new Map<string, CachedSvg>();
let ICON_LIST_CACHE: IconDefinition[] | null = null;
const SVG_RENDER_FAILURE_REASONS = new Map<string, string>();

const MAX_SVG_CACHE_ENTRIES = 200;
const MAX_SVG_SOURCE_LENGTH = 200_000;
const MAX_SVG_ELEMENT_COUNT = 2_000;

const VAULT_ICON_EXTENSION = 'svg';
const FORBIDDEN_SVG_SELECTORS =
    'script,style,foreignObject,iframe,object,embed,link,image,a,animate,animateMotion,animateTransform,animateColor,set,mpath,filter,mask,pattern,linearGradient,radialGradient,stop';
const STRIPPED_STYLE_PROPERTIES = new Set(['fill', 'stroke', 'color']);
const ALLOWED_SVG_STYLE_PROPERTIES = new Set([
    'clip-rule',
    'fill-opacity',
    'fill-rule',
    'opacity',
    'stroke-dasharray',
    'stroke-dashoffset',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-miterlimit',
    'stroke-opacity',
    'stroke-width',
    'vector-effect'
]);

function isVaultIconFileExtension(extension: string): boolean {
    return extension.toLowerCase() === VAULT_ICON_EXTENSION;
}

/**
 * Returns true when the file can be used as a vault icon.
 */
export function isVaultIconFile(file: TFile): boolean {
    return isVaultIconFileExtension(file.extension);
}

/**
 * Returns true when the path points to an SVG file.
 */
export function isVaultIconPath(path: string): boolean {
    return path.trim().toLowerCase().endsWith(`.${VAULT_ICON_EXTENSION}`);
}

/**
 * Removes an SVG from the cache, or clears the entire cache when no path is provided.
 */
export function invalidateVaultIconSvgCache(path?: string): void {
    if (typeof path === 'string' && path.trim().length > 0) {
        SVG_CACHE.delete(path);
        return;
    }

    SVG_CACHE.clear();
}

function logSvgNotRendered(path: string, reason: string, extra?: Record<string, unknown>): void {
    const normalizedPath = path.trim();
    if (!normalizedPath) {
        return;
    }

    const previousReason = SVG_RENDER_FAILURE_REASONS.get(normalizedPath);
    if (previousReason === reason) {
        return;
    }

    SVG_RENDER_FAILURE_REASONS.set(normalizedPath, reason);
    console.warn('[VaultIconProvider] SVG icon not rendered', { path: normalizedPath, reason, ...extra });
}

function clearSvgNotRendered(path: string): void {
    const normalizedPath = path.trim();
    if (!normalizedPath) {
        return;
    }
    SVG_RENDER_FAILURE_REASONS.delete(normalizedPath);
}

function compareIconDefinitions(a: IconDefinition, b: IconDefinition): number {
    const nameCompare = naturalCompare(a.displayName, b.displayName);
    if (nameCompare !== 0) {
        return nameCompare;
    }
    return naturalCompare(a.id, b.id);
}

function insertIntoSortedIconList(icons: IconDefinition[], icon: IconDefinition): void {
    let low = 0;
    let high = icons.length;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const compare = compareIconDefinitions(icon, icons[mid]);
        if (compare <= 0) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }

    icons.splice(low, 0, icon);
}

function removeFromIconList(icons: IconDefinition[], path: string): boolean {
    const index = icons.findIndex(icon => icon.id === path);
    if (index === -1) {
        return false;
    }

    icons.splice(index, 1);
    return true;
}

function upsertVaultIconInListCache(file: TFile): void {
    if (!ICON_LIST_CACHE) {
        return;
    }

    removeFromIconList(ICON_LIST_CACHE, file.path);
    insertIntoSortedIconList(ICON_LIST_CACHE, { id: file.path, displayName: file.name });
}

function removeVaultIconFromListCache(path: string): void {
    if (!ICON_LIST_CACHE) {
        return;
    }

    removeFromIconList(ICON_LIST_CACHE, path);
}

/**
 * Adds a new vault SVG file to the icon list cache.
 */
export function updateVaultIconListCacheForCreate(file: TFile): void {
    if (!isVaultIconFile(file)) {
        return;
    }

    upsertVaultIconInListCache(file);
}

/**
 * Removes a deleted vault SVG file from the icon list cache.
 */
export function updateVaultIconListCacheForDelete(path: string): void {
    if (!isVaultIconPath(path)) {
        return;
    }

    removeVaultIconFromListCache(path);
}

/**
 * Updates the icon list cache when a vault SVG file is renamed.
 */
export function updateVaultIconListCacheForRename(file: TFile, oldPath: string): void {
    const didRemove = isVaultIconPath(oldPath);
    const didAdd = isVaultIconFile(file);

    if (!ICON_LIST_CACHE) {
        return;
    }

    if (didRemove) {
        removeVaultIconFromListCache(oldPath);
    }

    if (didAdd) {
        upsertVaultIconInListCache(file);
    }
}

interface VaultIconMatch {
    icon: IconDefinition;
    match: SearchResult;
}

function hasNonNoneValue(value: string | null | undefined): boolean {
    if (!value) {
        return false;
    }
    const trimmed = value.trim().toLowerCase();
    return trimmed.length > 0 && trimmed !== 'none';
}

function isSafeInternalSvgHref(value: string): boolean {
    const trimmed = value.trim();
    return /^#[A-Za-z_][\w:.-]*$/.test(trimmed);
}

function parseInlineStyle(style: string): Map<string, string> {
    const map = new Map<string, string>();
    const parts = style.split(';');

    parts.forEach(part => {
        const trimmed = part.trim();
        if (!trimmed) {
            return;
        }

        const colonIndex = trimmed.indexOf(':');
        if (colonIndex === -1) {
            return;
        }

        const property = trimmed.substring(0, colonIndex).trim().toLowerCase();
        if (!property) {
            return;
        }

        const value = trimmed.substring(colonIndex + 1).trim();
        if (!value) {
            return;
        }

        map.set(property, value);
    });

    return map;
}

function serializeInlineStyle(style: Map<string, string>): string {
    const parts: string[] = [];
    style.forEach((value, property) => {
        const trimmed = value.trim();
        if (!trimmed) {
            return;
        }
        parts.push(`${property}: ${trimmed}`);
    });
    return parts.join('; ');
}

/**
 * Normalizes inline fill/stroke styles to currentColor and removes unsupported style properties.
 */
function stripColorStyles(element: Element): boolean {
    const styleValue = element.getAttribute('style');
    if (!styleValue) {
        return false;
    }

    const style = parseInlineStyle(styleValue);
    const fill = style.get('fill');
    const stroke = style.get('stroke');
    const hasFill = hasNonNoneValue(fill);
    const hasStroke = hasNonNoneValue(stroke);

    if (hasFill && !hasNonNoneValue(element.getAttribute('fill'))) {
        element.setAttribute('fill', 'currentColor');
    }

    if (hasStroke && !hasNonNoneValue(element.getAttribute('stroke'))) {
        element.setAttribute('stroke', 'currentColor');
    }

    const sanitized = new Map<string, string>();

    style.forEach((value, property) => {
        if (STRIPPED_STYLE_PROPERTIES.has(property)) {
            return;
        }
        if (!ALLOWED_SVG_STYLE_PROPERTIES.has(property)) {
            return;
        }
        sanitized.set(property, value);
    });

    const cleaned = serializeInlineStyle(sanitized);
    if (!cleaned) {
        element.removeAttribute('style');
    } else if (cleaned !== styleValue) {
        element.setAttribute('style', cleaned);
    }

    return hasStroke;
}

/**
 * Removes elements that can execute scripts or load external resources.
 */
function removeUnsafeSvgElements(svg: SVGSVGElement): void {
    svg.querySelectorAll(FORBIDDEN_SVG_SELECTORS).forEach(element => {
        element.remove();
    });
}

interface SvgCssHints {
    hasStroke: boolean;
    hasStrokeHints: boolean;
    hasFillNone: boolean;
    hasExplicitFill: boolean;
}

function extractCssHints(svg: SVGSVGElement): SvgCssHints {
    const styles = Array.from(svg.querySelectorAll('style'))
        .map(styleEl => styleEl.textContent ?? '')
        .join('\n');

    if (!styles.trim()) {
        return { hasStroke: false, hasStrokeHints: false, hasFillNone: false, hasExplicitFill: false };
    }

    const hasFillNone = /fill\s*:\s*none\b/i.test(styles);
    const hasStroke = /stroke\s*:\s*(?!none\b)[^;}\n]+/i.test(styles);
    const hasStrokeHints = /(?:stroke-(?:width|linecap|linejoin|miterlimit|dasharray|dashoffset|opacity)|vector-effect)\s*:/i.test(styles);
    const hasExplicitFill = /fill\s*:\s*(?!none\b)[^;}\n]+/i.test(styles);

    return { hasStroke, hasStrokeHints, hasFillNone, hasExplicitFill };
}

/**
 * Removes attributes that can execute scripts or load external resources.
 */
function removeUnsafeSvgAttributes(svg: SVGSVGElement): void {
    const elements = [svg, ...Array.from(svg.querySelectorAll('*'))];
    elements.forEach(element => {
        const attributes = Array.from(element.attributes);
        const tagName = element.tagName.toLowerCase();
        attributes.forEach(attribute => {
            const name = attribute.name.toLowerCase();
            if (name.startsWith('on')) {
                element.removeAttribute(attribute.name);
                return;
            }

            if (name === 'class') {
                element.removeAttribute(attribute.name);
                return;
            }

            if (name === 'tabindex') {
                element.removeAttribute(attribute.name);
                return;
            }

            if (name === 'href' || name === 'xlink:href') {
                const rawHref = attribute.value;
                if (tagName === 'use' && isSafeInternalSvgHref(rawHref)) {
                    if (name === 'xlink:href') {
                        element.setAttribute('href', rawHref.trim());
                        element.removeAttribute(attribute.name);
                    }
                    return;
                }
                element.removeAttribute(attribute.name);
                return;
            }

            if (name === 'filter' || name === 'mask' || name === 'clip-path') {
                element.removeAttribute(attribute.name);
            }
        });
    });
}

/**
 * Applies currentColor fill/stroke rules to the SVG root and descendants.
 */
function applyCurrentColor(svg: SVGSVGElement, options: { hasStroke: boolean }): void {
    svg.classList.add('nn-vault-icon-svg');

    if (options.hasStroke) {
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('fill', 'none');
    } else {
        svg.setAttribute('fill', 'currentColor');
        svg.setAttribute('stroke', 'none');
    }

    const elements = [svg, ...Array.from(svg.querySelectorAll('*'))];
    elements.forEach(element => {
        const fill = element.getAttribute('fill');
        if (hasNonNoneValue(fill)) {
            element.setAttribute('fill', 'currentColor');
        }

        const stroke = element.getAttribute('stroke');
        if (hasNonNoneValue(stroke)) {
            element.setAttribute('stroke', 'currentColor');
        }
    });
}

function hasRenderableSvgContent(svg: SVGSVGElement): boolean {
    return svg.querySelector('path,circle,rect,line,polyline,polygon,ellipse,use,text') !== null;
}

interface SvgParseResult {
    svg: SVGSVGElement | null;
    reason: string | null;
}

/**
 * Parses a raw SVG string into an SVG root element with size and complexity guards.
 */
function parseSvg(raw: string): SvgParseResult {
    if (typeof DOMParser === 'undefined') {
        return { svg: null, reason: 'dom-parser-unavailable' };
    }

    if (!raw) {
        return { svg: null, reason: 'empty-svg' };
    }

    if (raw.length > MAX_SVG_SOURCE_LENGTH) {
        return { svg: null, reason: 'svg-source-too-large' };
    }

    const parsed = new DOMParser().parseFromString(raw, 'image/svg+xml');
    const root = parsed.documentElement;
    if (!root.instanceOf(SVGSVGElement)) {
        return { svg: null, reason: 'invalid-svg-root' };
    }

    const elementCount = 1 + root.querySelectorAll('*').length;
    if (elementCount > MAX_SVG_ELEMENT_COUNT) {
        return { svg: null, reason: 'svg-too-complex' };
    }

    return { svg: root, reason: null };
}

function hasStrokeHintAttributes(element: Element): boolean {
    return (
        element.hasAttribute('stroke-width') ||
        element.hasAttribute('stroke-linecap') ||
        element.hasAttribute('stroke-linejoin') ||
        element.hasAttribute('stroke-miterlimit') ||
        element.hasAttribute('stroke-dasharray') ||
        element.hasAttribute('stroke-dashoffset') ||
        element.hasAttribute('stroke-opacity') ||
        element.hasAttribute('vector-effect')
    );
}

export class VaultIconProvider implements IconProvider {
    id = 'vault';
    name = 'Vault';

    private readonly app: App;

    constructor(app: App) {
        this.app = app;
    }

    isAvailable(): boolean {
        return true;
    }

    /**
     * Renders a vault SVG file into the container.
     */
    render(container: HTMLElement, iconId: string, size?: number): IconRenderResult | Promise<IconRenderResult> {
        resetIconContainer(container);

        if (size) {
            container.style.width = `${size}px`;
            container.style.height = `${size}px`;
        } else {
            container.style.removeProperty('width');
            container.style.removeProperty('height');
        }

        const file = this.app.vault.getAbstractFileByPath(iconId);
        if (!(file instanceof TFile) || !isVaultIconFile(file)) {
            if (iconId.trim().length > 0) {
                logSvgNotRendered(iconId, 'file-not-found-or-not-svg');
            }
            return 'not-found';
        }

        const cached = SVG_CACHE.get(file.path);
        if (cached && cached.mtime === file.stat.mtime) {
            clearSvgNotRendered(file.path);
            container.appendChild(cached.svg.cloneNode(true));
            return 'rendered';
        }

        const token = getIconRenderToken(container);
        if (!token) {
            return 'not-found';
        }

        return this.app.vault
            .cachedRead(file)
            .then(raw => {
                if (getIconRenderToken(container) !== token) {
                    return 'not-found';
                }

                const parsedSvg = parseSvg(raw);
                const svg = parsedSvg.svg;
                if (!svg) {
                    logSvgNotRendered(file.path, parsedSvg.reason ?? 'parse-failed');
                    return 'not-found';
                }

                const cssHints = extractCssHints(svg);
                removeUnsafeSvgElements(svg);
                removeUnsafeSvgAttributes(svg);

                if (!hasRenderableSvgContent(svg)) {
                    logSvgNotRendered(file.path, 'no-renderable-elements-after-sanitize');
                    return 'not-found';
                }

                const elements = [svg, ...Array.from(svg.querySelectorAll('*'))];
                let hasStroke = false;
                let hasStrokeHints = false;
                let hasFillNone = false;
                let hasExplicitFill = false;

                elements.forEach(element => {
                    const fill = element.getAttribute('fill');
                    if (fill && fill.trim().toLowerCase() === 'none') {
                        hasFillNone = true;
                    } else if (hasNonNoneValue(fill)) {
                        hasExplicitFill = true;
                    }

                    if (hasNonNoneValue(element.getAttribute('stroke'))) {
                        hasStroke = true;
                    }

                    if (stripColorStyles(element)) {
                        hasStroke = true;
                    }

                    if (!hasStroke && hasStrokeHintAttributes(element)) {
                        hasStrokeHints = true;
                    }
                });

                const treatAsStrokeIcon =
                    hasStroke ||
                    cssHints.hasStroke ||
                    ((hasStrokeHints || cssHints.hasStrokeHints) &&
                        (hasFillNone || cssHints.hasFillNone) &&
                        !(hasExplicitFill || cssHints.hasExplicitFill));
                applyCurrentColor(svg, { hasStroke: treatAsStrokeIcon });

                SVG_CACHE.set(file.path, { mtime: file.stat.mtime, svg });
                while (SVG_CACHE.size > MAX_SVG_CACHE_ENTRIES) {
                    const first = SVG_CACHE.keys().next();
                    if (first.done) {
                        break;
                    }
                    SVG_CACHE.delete(first.value);
                }

                if (getIconRenderToken(container) !== token) {
                    return 'not-found';
                }

                container.empty();
                container.appendChild(svg.cloneNode(true));
                clearSvgNotRendered(file.path);
                return 'rendered';
            })
            .catch(error => {
                if (getIconRenderToken(container) !== token) {
                    return 'not-found';
                }
                logSvgNotRendered(file.path, 'read-or-render-error', { error });
                return 'not-found';
            });
    }

    search(query: string): IconDefinition[] {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
            return [];
        }

        const icons = this.getAll();
        if (!icons.length) {
            return [];
        }

        const search = prepareFuzzySearch(trimmedQuery);
        const matches: VaultIconMatch[] = [];

        for (const icon of icons) {
            const result = search(icon.displayName);
            if (!result) {
                continue;
            }
            matches.push({ icon, match: result });
        }

        // Obsidian fuzzy scores are negative penalties where values closer to 0 are better matches,
        // so sort descending. Ascending order puts exact name matches last, where the icon picker's
        // result limit cuts them off.
        matches.sort((a, b) => {
            const scoreA = a.match.score;
            const scoreB = b.match.score;
            if (scoreA === scoreB) {
                const nameCompare = naturalCompare(a.icon.displayName, b.icon.displayName);
                if (nameCompare !== 0) {
                    return nameCompare;
                }
                return naturalCompare(a.icon.id, b.icon.id);
            }
            return scoreB - scoreA;
        });

        return matches.map(match => match.icon);
    }

    getAll(): IconDefinition[] {
        if (ICON_LIST_CACHE) {
            return ICON_LIST_CACHE.slice();
        }

        const files = this.app.vault.getFiles();
        const icons = files
            .filter(file => isVaultIconFile(file))
            .map(file => ({
                id: file.path,
                displayName: file.name
            }));

        icons.sort(compareIconDefinitions);

        ICON_LIST_CACHE = icons;
        return icons.slice();
    }
}
