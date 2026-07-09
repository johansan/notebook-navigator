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

import { LIMITS } from '../../../constants/limits';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';

export type PreparedSvgFeatureImage = {
    blob: Blob;
    width: number;
    height: number;
};

export type SvgFeatureImagePreparation = { source: PreparedSvgFeatureImage; reason: null } | { source: null; reason: string };

// Decodes SVG source bytes to text; UTF-16 sources are detected by their byte order mark.
export function decodeSvgSourceText(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    if (bytes.length >= 2) {
        if (bytes[0] === 0xff && bytes[1] === 0xfe) {
            return new TextDecoder('utf-16le').decode(buffer);
        }
        if (bytes[0] === 0xfe && bytes[1] === 0xff) {
            return new TextDecoder('utf-16be').decode(buffer);
        }
    }
    return new TextDecoder().decode(buffer);
}

// Resolves the local element a `use` element references, if any.
function getUseTargetElement(element: Element, elementsById: Map<string, Element>): Element | null {
    if (element.namespaceURI !== SVG_NAMESPACE || element.localName !== 'use') {
        return null;
    }

    const href = element.getAttribute('href') ?? element.getAttributeNS(XLINK_NAMESPACE, 'href') ?? element.getAttribute('xlink:href');
    if (!href || !href.startsWith('#')) {
        return null;
    }

    return elementsById.get(href.slice(1)) ?? null;
}

/**
 * Counts the elements the browser paints once `use` references are expanded.
 *
 * Each `use` element clones its referenced subtree at render time, so nested references
 * multiply the painted element count beyond the parsed element count. Per-element costs
 * are memoized, keeping the traversal linear; reference cycles return `Infinity`.
 */
function countExpandedSvgElements(root: Element): number {
    const elementsById = new Map<string, Element>();
    const rootId = root.getAttribute('id');
    if (rootId) {
        elementsById.set(rootId, root);
    }
    for (const element of root.querySelectorAll('[id]')) {
        const id = element.getAttribute('id');
        if (id && !elementsById.has(id)) {
            elementsById.set(id, element);
        }
    }

    type Frame = { element: Element; pending: Element[]; total: number };
    const createFrame = (element: Element): Frame => {
        const pending = Array.from(element.children);
        const target = getUseTargetElement(element, elementsById);
        if (target) {
            pending.push(target);
        }
        return { element, pending, total: 1 };
    };

    const expandedCounts = new Map<Element, number>();
    const inProgress = new Set<Element>([root]);
    const stack: Frame[] = [createFrame(root)];
    let rootTotal = 0;

    while (stack.length > 0) {
        const frame = stack[stack.length - 1];
        const next = frame.pending.pop();
        if (next) {
            const memoized = expandedCounts.get(next);
            if (memoized !== undefined) {
                frame.total += memoized;
                continue;
            }
            if (inProgress.has(next)) {
                // A reference cycle expands without bound.
                return Infinity;
            }
            inProgress.add(next);
            stack.push(createFrame(next));
            continue;
        }

        stack.pop();
        inProgress.delete(frame.element);
        expandedCounts.set(frame.element, frame.total);
        rootTotal = frame.total;
        const parent = stack[stack.length - 1];
        if (parent) {
            parent.total += frame.total;
        }
    }

    return rootTotal;
}

// Parses a numeric SVG length attribute; accepts unitless and px values, including exponent notation.
export function parseSvgLengthAttribute(value: string | null): number | null {
    if (!value) {
        return null;
    }

    const match = /^\+?(\d*\.?\d+(?:e[+-]?\d+)?)(?:px)?$/i.exec(value.trim());
    if (!match) {
        return null;
    }

    const parsed = Number(match[1]);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

// Parses the width and height components of an SVG viewBox attribute.
export function parseSvgViewBoxDimensions(value: string | null): { width: number; height: number } | null {
    if (!value) {
        return null;
    }

    const parts = value.trim().split(/[\s,]+/);
    if (parts.length !== 4) {
        return null;
    }

    const numbers = parts.map(Number);
    if (numbers.some(entry => !Number.isFinite(entry))) {
        return null;
    }

    const width = numbers[2];
    const height = numbers[3];
    return width > 0 && height > 0 ? { width, height } : null;
}

/**
 * Determines whether an SVG source declares intrinsic dimensions.
 *
 * An `img` element derives its aspect ratio from width/height attributes or a viewBox on the
 * SVG root; sources without either render at the browser default object size.
 */
export function svgSourceDefinesDimensions(svgText: string): boolean {
    if (typeof DOMParser === 'undefined') {
        return true;
    }

    const parsed = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    const root = parsed.documentElement;
    if (root.namespaceURI !== SVG_NAMESPACE || root.localName !== 'svg') {
        return false;
    }

    const width = parseSvgLengthAttribute(root.getAttribute('width'));
    const height = parseSvgLengthAttribute(root.getAttribute('height'));
    if (width && height) {
        return true;
    }

    return parseSvgViewBoxDimensions(root.getAttribute('viewBox')) !== null;
}

/**
 * Scales intrinsic SVG dimensions to fit the thumbnail box while preserving aspect ratio.
 * Vector sources scale up as well as down, so small icons render at full thumbnail resolution.
 */
export function calculateSvgRenderDimensions(
    source: { width: number; height: number },
    bounds: { maxWidth: number; maxHeight: number }
): { width: number; height: number } {
    const scale = Math.min(bounds.maxWidth / source.width, bounds.maxHeight / source.height);
    return {
        width: Math.max(1, Math.round(source.width * scale)),
        height: Math.max(1, Math.round(source.height * scale))
    };
}

/**
 * Validates an SVG source and prepares a decode-ready blob sized to the thumbnail box.
 *
 * Rejects sources that exceed the element budget (parsed or after `use` expansion) or embed
 * raster content (`image`, `feImage`, and `foreignObject` elements). The returned blob carries explicit
 * width/height attributes so the browser rasterizes the vector at thumbnail resolution.
 */
export function prepareSvgFeatureImageSource(params: { svgText: string; maxWidth: number; maxHeight: number }): SvgFeatureImagePreparation {
    if (typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') {
        return { source: null, reason: 'dom-parser-unavailable' };
    }

    if (!params.svgText.trim()) {
        return { source: null, reason: 'empty-svg' };
    }

    const parsed = new DOMParser().parseFromString(params.svgText, 'image/svg+xml');
    const root = parsed.documentElement;
    if (root.namespaceURI !== SVG_NAMESPACE || root.localName !== 'svg') {
        return { source: null, reason: 'invalid-svg-root' };
    }

    const elementCount = 1 + root.querySelectorAll('*').length;
    if (elementCount > LIMITS.thumbnails.featureImage.svg.maxElementCount) {
        return { source: null, reason: 'svg-too-complex' };
    }

    // The parsed element count does not bound render cost when `use` references nest, so the
    // expanded count is checked against the same budget before the source is rasterized.
    if (root.querySelector('use') && countExpandedSvgElements(root) > LIMITS.thumbnails.featureImage.svg.maxElementCount) {
        return { source: null, reason: 'svg-use-expansion-too-complex' };
    }

    // Only pure vector sources are rasterized; embedded raster content is rejected.
    // Type selectors match case-sensitively in XML documents, so feImage needs its own selector entry.
    if (root.querySelector('image, feImage')) {
        return { source: null, reason: 'svg-contains-bitmap-image' };
    }
    if (root.querySelector('foreignObject')) {
        return { source: null, reason: 'svg-contains-foreign-object' };
    }

    const attributeWidth = parseSvgLengthAttribute(root.getAttribute('width'));
    const attributeHeight = parseSvgLengthAttribute(root.getAttribute('height'));
    const viewBox = parseSvgViewBoxDimensions(root.getAttribute('viewBox'));

    const intrinsic = attributeWidth && attributeHeight ? { width: attributeWidth, height: attributeHeight } : viewBox;
    if (!intrinsic) {
        return { source: null, reason: 'unknown-svg-dimensions' };
    }

    // A viewBox is required for the width/height override below to scale the vector content.
    if (!viewBox) {
        root.setAttribute('viewBox', `0 0 ${intrinsic.width} ${intrinsic.height}`);
    }

    const render = calculateSvgRenderDimensions(intrinsic, { maxWidth: params.maxWidth, maxHeight: params.maxHeight });
    root.setAttribute('width', String(render.width));
    root.setAttribute('height', String(render.height));

    const serialized = new XMLSerializer().serializeToString(root);
    return {
        source: {
            blob: new Blob([serialized], { type: 'image/svg+xml' }),
            width: render.width,
            height: render.height
        },
        reason: null
    };
}
