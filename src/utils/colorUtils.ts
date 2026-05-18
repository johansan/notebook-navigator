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

// ============================================================================
// Type Definitions
// ============================================================================

export interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface ColorParsingOptions {
    container?: HTMLElement | null;
}

// ============================================================================
// CSS Variable Resolution
// ============================================================================
// CSS variables (e.g., var(--my-color)) cannot be parsed directly. We need
// to apply them to a DOM element and read the computed style to get the
// actual RGB value. This section manages a hidden resolver element per container.

const resolverElementMap = new WeakMap<HTMLElement, HTMLElement>();
/** CSS variable name used in the hidden resolver element for color computation. */
const COLOR_VARIABLE_NAME = '--nn-color-resolver-value';

/**
 * Creates or retrieves a hidden DOM element used to resolve CSS variable colors via computed styles.
 * The resolver element is styled via CSS (.nn-color-resolver) to be invisible and non-interactive.
 * Uses WeakMap to associate one resolver per container and automatically clean up when container is removed.
 */
function ensureResolverElement(container: HTMLElement): HTMLElement {
    // Reuse existing resolver if it's still in the DOM
    const existing = resolverElementMap.get(container);
    if (existing && existing.isConnected) {
        return existing;
    }

    // Create new hidden resolver element
    const doc = container.ownerDocument;
    const resolver = doc.createElement('div');
    resolver.classList.add('nn-color-resolver');
    resolver.setAttribute('aria-hidden', 'true');
    container.appendChild(resolver);

    // Cache for future use
    resolverElementMap.set(container, resolver);
    return resolver;
}

/**
 * Resolves a CSS color value by setting it on a hidden element and reading the computed style.
 * This is necessary to resolve CSS variables (e.g., var(--my-color)) to actual RGB values.
 *
 * How it works:
 * 1. Apply the color value to a custom CSS variable on the resolver element
 * 2. Read the computed style which has resolved all variables and functions
 * 3. Return the resolved color (tries 'color' property first, then 'backgroundColor')
 *
 * Example:
 *   Input: "var(--nn-theme-navitem-selected-bg)"
 *   Output: "rgba(100, 150, 200, 0.2)"
 */
function resolveColorValue(input: string, container?: HTMLElement | null): string {
    // Without a container, we can't resolve CSS variables
    if (!container) {
        return input;
    }

    // Get or create the hidden resolver element
    const resolver = ensureResolverElement(container);

    // Clear any previous value and set the new color value
    resolver.style.removeProperty(COLOR_VARIABLE_NAME);
    resolver.style.setProperty(COLOR_VARIABLE_NAME, input);

    // Read the computed style - this is where CSS variables get resolved
    const computed = window.getComputedStyle(resolver);

    // The CSS applies the variable to both 'color' and 'background-color'
    // Try 'color' first as it's more reliable for color values
    const computedColor = computed.color;
    if (computedColor) {
        return computedColor;
    }

    // Fallback to background-color
    const computedBackground = computed.backgroundColor;
    if (computedBackground) {
        return computedBackground;
    }

    // If both fail, return original input
    return input;
}

/**
 * Removes the color resolver element from the container and cleans up the WeakMap entry.
 * Called during component cleanup to prevent memory leaks.
 */
export function releaseColorResolver(container: HTMLElement): void {
    const resolver = resolverElementMap.get(container);
    if (!resolver) {
        return;
    }
    resolverElementMap.delete(container);
    if (resolver.parentElement) {
        resolver.parentElement.removeChild(resolver);
    }
}

// ============================================================================
// Value Clamping and Validation
// ============================================================================
// Ensures all color values are within valid ranges to prevent rendering issues

/** Clamps a color channel value to the valid range [0, 255]. */
function clampChannel(value: number): number {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
        return 0;
    }
    if (value <= 0) {
        return 0;
    }
    if (value >= 255) {
        return 255;
    }
    return value;
}

/** Clamps an alpha value to the valid range [0, 1]. */
function clampAlpha(value: number): number {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
        return 1;
    }
    if (value <= 0) {
        return 0;
    }
    if (value >= 1) {
        return 1;
    }
    return value;
}

// ============================================================================
// Color Component Parsing
// ============================================================================
// Converts various color component formats (hex, percentage, decimal) to numeric values

/** Parses a hexadecimal color component string into a numeric channel value. */
function parseHexComponent(component: string): number {
    return clampChannel(parseInt(component, 16));
}

/**
 * Parses a percentage color channel value (e.g., "50%") into a 0-255 range.
 * Example: "50%" → 127.5 → 127 (after clamping)
 */
function parsePercentageChannel(value: string): number {
    const numeric = parseFloat(value);
    if (Number.isNaN(numeric) || !Number.isFinite(numeric)) {
        return 0;
    }
    return clampChannel((numeric / 100) * 255);
}

/**
 * Parses a decimal color channel value into a clamped 0-255 range.
 * Example: "200" → 200, "300" → 255 (clamped)
 */
function parseDecimalChannel(value: string): number {
    const numeric = parseFloat(value);
    if (Number.isNaN(numeric) || !Number.isFinite(numeric)) {
        return 0;
    }
    return clampChannel(numeric);
}

/**
 * Parses an alpha component from a CSS color string, supporting both decimal and percentage values.
 * Examples:
 *   "0.5" → 0.5
 *   "50%" → 0.5
 *   undefined → 1 (fully opaque)
 */
function parseAlphaComponent(value: string | undefined): number {
    if (!value) {
        return 1;
    }
    const trimmed = value.trim();
    if (trimmed.endsWith('%')) {
        const numeric = parseFloat(trimmed.slice(0, -1));
        if (Number.isNaN(numeric) || !Number.isFinite(numeric)) {
            return 1;
        }
        return clampAlpha(numeric / 100);
    }
    const numeric = parseFloat(trimmed);
    return clampAlpha(numeric);
}

// ============================================================================
// CSS Color String Parsing
// ============================================================================

/**
 * Parses a CSS color string into an RGBA object. Supports hex and rgb/rgba formats.
 *
 * Supported formats:
 * - Hex: #rgb, #rgba, #rrggbb, #rrggbbaa
 * - RGB: rgb(r, g, b), rgba(r, g, b, a)
 * - Modern: rgb(r g b / a)
 * - CSS variables: var(--my-color) when container is provided
 *
 * @param input - The CSS color string to parse
 * @param options - Optional container for resolving CSS variables
 * @returns RGBA object with values r/g/b (0-255) and a (0-1), or null if parsing fails
 */
export function parseCssColor(input: string | null | undefined, options?: ColorParsingOptions): RGBA | null {
    if (!input) {
        return null;
    }
    const trimmedInput = input.trim();
    if (!trimmedInput) {
        return null;
    }

    // Step 1: Resolve CSS variables if a container is provided
    // This converts "var(--my-color)" to "rgba(100, 150, 200, 0.2)"
    const resolvedInput = options?.container ? resolveColorValue(trimmedInput, options.container) : trimmedInput;

    // Step 2: Try parsing as hex color (#rgb, #rrggbb, etc.)
    const hexMatch = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(resolvedInput);
    if (hexMatch) {
        const hexValue = hexMatch[1];

        // #rgb → #rrggbb (3-digit shorthand)
        if (hexValue.length === 3) {
            const r = hexValue[0];
            const g = hexValue[1];
            const b = hexValue[2];
            return {
                r: parseHexComponent(r + r), // "f" → "ff" → 255
                g: parseHexComponent(g + g),
                b: parseHexComponent(b + b),
                a: 1
            };
        }

        // #rgba → #rrggbbaa (4-digit shorthand with alpha)
        if (hexValue.length === 4) {
            const r = hexValue[0];
            const g = hexValue[1];
            const b = hexValue[2];
            const a = hexValue[3];
            return {
                r: parseHexComponent(r + r),
                g: parseHexComponent(g + g),
                b: parseHexComponent(b + b),
                a: clampAlpha(parseInt(a + a, 16) / 255) // hex to 0-1 range
            };
        }

        // #rrggbb (6-digit full hex)
        if (hexValue.length === 6) {
            return {
                r: parseHexComponent(hexValue.slice(0, 2)),
                g: parseHexComponent(hexValue.slice(2, 4)),
                b: parseHexComponent(hexValue.slice(4, 6)),
                a: 1
            };
        }

        // #rrggbbaa (8-digit with alpha)
        if (hexValue.length === 8) {
            return {
                r: parseHexComponent(hexValue.slice(0, 2)),
                g: parseHexComponent(hexValue.slice(2, 4)),
                b: parseHexComponent(hexValue.slice(4, 6)),
                a: clampAlpha(parseInt(hexValue.slice(6, 8), 16) / 255)
            };
        }
    }

    // Step 3: Try parsing as rgb/rgba function
    // Supports both legacy (comma) and modern (space/slash) syntax:
    // - rgb(255, 0, 0), rgba(255, 0, 0, 0.5)
    // - rgb(255 0 0), rgb(255 0 0 / 0.5)
    const rgbaMatch =
        /^rgba?\(\s*([^\s,]+)\s*,\s*([^\s,]+)\s*,\s*([^\s,]+)(?:\s*,\s*([^\s,]+))?\s*\)$/i.exec(resolvedInput) ||
        /^rgba?\(\s*([^\s,]+)\s+([^\s,]+)\s+([^\s,]+)(?:\s*\/\s*([^\s,]+))?\s*\)$/i.exec(resolvedInput);
    if (rgbaMatch) {
        const [, rRaw, gRaw, bRaw, aRaw] = rgbaMatch;

        // Helper to parse channel values (supports both decimal and percentage)
        const parseChannel = (value: string): number => {
            const channel = value.trim();
            if (channel.endsWith('%')) {
                return parsePercentageChannel(channel.slice(0, -1));
            }
            return parseDecimalChannel(channel);
        };

        return {
            r: parseChannel(rRaw),
            g: parseChannel(gRaw),
            b: parseChannel(bRaw),
            a: parseAlphaComponent(aRaw)
        };
    }

    // Step 4: Parsing failed - return null
    return null;
}

// ============================================================================
// Color Formatting and Comparison
// ============================================================================

interface Oklab {
    l: number;
    a: number;
    b: number;
}

interface Oklch {
    l: number;
    c: number;
    h: number;
}

interface LinearRGB {
    r: number;
    g: number;
    b: number;
}

/** Clamps a normalized value to the valid range [0, 1]. */
function clampUnit(value: number): number {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
        return 0;
    }
    if (value <= 0) {
        return 0;
    }
    if (value >= 1) {
        return 1;
    }
    return value;
}

/** Linearly interpolates between two numbers. */
function lerp(left: number, right: number, t: number): number {
    return left + (right - left) * t;
}

/** Formats an RGBA object into an rgba() string. */
export function toCssRgba(color: RGBA): string {
    const r = Math.round(clampChannel(color.r));
    const g = Math.round(clampChannel(color.g));
    const b = Math.round(clampChannel(color.b));
    const a = Math.round(clampUnit(color.a) * 1000) / 1000;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function srgbChannelToLinear(channel: number): number {
    const normalized = clampUnit(channel);
    if (normalized <= 0.04045) {
        return normalized / 12.92;
    }
    return Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function linearChannelToSrgb(channel: number): number {
    if (!Number.isFinite(channel)) {
        return 0;
    }
    if (channel <= 0) {
        return 0;
    }
    if (channel >= 1) {
        return 1;
    }
    if (channel <= 0.0031308) {
        return 12.92 * channel;
    }
    return 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

function rgbToOklab(color: RGBA): Oklab {
    const red = srgbChannelToLinear(color.r / 255);
    const green = srgbChannelToLinear(color.g / 255);
    const blue = srgbChannelToLinear(color.b / 255);

    const lChannel = 0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue;
    const mChannel = 0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue;
    const sChannel = 0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue;

    const lPrime = Math.cbrt(lChannel);
    const mPrime = Math.cbrt(mChannel);
    const sPrime = Math.cbrt(sChannel);

    return {
        l: 0.2104542553 * lPrime + 0.793617785 * mPrime - 0.0040720468 * sPrime,
        a: 1.9779984951 * lPrime - 2.428592205 * mPrime + 0.4505937099 * sPrime,
        b: 0.0259040371 * lPrime + 0.7827717662 * mPrime - 0.808675766 * sPrime
    };
}

function oklabToLinearRgb(lab: Oklab): LinearRGB {
    const lPrime = lab.l + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
    const mPrime = lab.l - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
    const sPrime = lab.l - 0.0894841775 * lab.a - 1.291485548 * lab.b;

    const lChannel = lPrime * lPrime * lPrime;
    const mChannel = mPrime * mPrime * mPrime;
    const sChannel = sPrime * sPrime * sPrime;

    return {
        r: 4.0767416621 * lChannel - 3.3077115913 * mChannel + 0.2309699292 * sChannel,
        g: -1.2684380046 * lChannel + 2.6097574011 * mChannel - 0.3413193965 * sChannel,
        b: -0.0041960863 * lChannel - 0.7034186147 * mChannel + 1.707614701 * sChannel
    };
}

function oklchToOklab(oklch: Oklch): Oklab {
    const hueRadians = (oklch.h * Math.PI) / 180;
    return {
        l: oklch.l,
        a: Math.cos(hueRadians) * oklch.c,
        b: Math.sin(hueRadians) * oklch.c
    };
}

function oklchToLinearRgb(oklch: Oklch): LinearRGB {
    return oklabToLinearRgb(oklchToOklab(oklch));
}

function isLinearRgbInGamut(rgb: LinearRGB): boolean {
    return rgb.r >= 0 && rgb.r <= 1 && rgb.g >= 0 && rgb.g <= 1 && rgb.b >= 0 && rgb.b <= 1;
}

function linearRgbToRgba(rgb: LinearRGB, alpha: number): RGBA {
    const red = linearChannelToSrgb(rgb.r);
    const green = linearChannelToSrgb(rgb.g);
    const blue = linearChannelToSrgb(rgb.b);
    return {
        r: red * 255,
        g: green * 255,
        b: blue * 255,
        a: clampUnit(alpha)
    };
}

function rgbaToLinearRgb(color: RGBA): LinearRGB {
    return {
        r: srgbChannelToLinear(color.r / 255),
        g: srgbChannelToLinear(color.g / 255),
        b: srgbChannelToLinear(color.b / 255)
    };
}

function relativeLuminanceFromLinearRgb(color: LinearRGB): number {
    return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

function relativeLuminanceFromRgba(color: RGBA): number {
    return relativeLuminanceFromLinearRgb(rgbaToLinearRgb(color));
}

function adjustRgbaToTargetLuminance(color: RGBA, targetLuminance: number): RGBA {
    const target = clampUnit(targetLuminance);
    const linear = rgbaToLinearRgb(color);
    const current = relativeLuminanceFromLinearRgb(linear);

    if (!Number.isFinite(current)) {
        return color;
    }

    if (Math.abs(current - target) <= 0.0005) {
        return color;
    }

    if (target <= 0) {
        return linearRgbToRgba({ r: 0, g: 0, b: 0 }, color.a);
    }

    if (target >= 1) {
        return linearRgbToRgba({ r: 1, g: 1, b: 1 }, color.a);
    }

    if (current <= 0) {
        return linearRgbToRgba({ r: target, g: target, b: target }, color.a);
    }

    if (current > target) {
        const scale = target / current;
        return linearRgbToRgba({ r: linear.r * scale, g: linear.g * scale, b: linear.b * scale }, color.a);
    }

    const blend = (target - current) / (1 - current);
    return linearRgbToRgba(
        {
            r: linear.r + (1 - linear.r) * blend,
            g: linear.g + (1 - linear.g) * blend,
            b: linear.b + (1 - linear.b) * blend
        },
        color.a
    );
}

function rgbToOklch(color: RGBA): Oklch {
    const lab = rgbToOklab(color);
    const chroma = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
    const hueRadians = chroma > 0 ? Math.atan2(lab.b, lab.a) : 0;
    const hueDegrees = ((hueRadians * 180) / Math.PI + 360) % 360;
    return { l: lab.l, c: chroma, h: hueDegrees };
}

function oklchToRgbaGamutMapped(oklch: Oklch, alpha: number): RGBA {
    const lightness = clampUnit(oklch.l);
    const hue = ((oklch.h % 360) + 360) % 360;
    const chroma = Math.max(0, oklch.c);
    const normalized = { l: lightness, c: chroma, h: hue };
    const direct = oklchToLinearRgb(normalized);
    if (isLinearRgbInGamut(direct)) {
        return linearRgbToRgba(direct, alpha);
    }

    let lowChroma = 0;
    let highChroma = chroma;
    for (let i = 0; i < 20; i++) {
        const midChroma = (lowChroma + highChroma) / 2;
        const candidate = oklchToLinearRgb({ ...normalized, c: midChroma });
        if (isLinearRgbInGamut(candidate)) {
            lowChroma = midChroma;
        } else {
            highChroma = midChroma;
        }
    }

    const mapped = oklchToLinearRgb({ ...normalized, c: lowChroma });
    return linearRgbToRgba(mapped, alpha);
}

function interpolateRgb(start: RGBA, end: RGBA, t: number): RGBA {
    const clampedT = clampUnit(t);
    return {
        r: lerp(start.r, end.r, clampedT),
        g: lerp(start.g, end.g, clampedT),
        b: lerp(start.b, end.b, clampedT),
        a: lerp(start.a, end.a, clampedT)
    };
}

interface HSLA {
    h: number;
    s: number;
    l: number;
    a: number;
}

/** Converts an RGBA color to HSLA. */
function rgbaToHsla(color: RGBA): HSLA {
    const r = clampChannel(color.r) / 255;
    const g = clampChannel(color.g) / 255;
    const b = clampChannel(color.b) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const l = (max + min) / 2;

    if (delta === 0) {
        return { h: 0, s: 0, l, a: clampAlpha(color.a) };
    }

    const s = delta / (1 - Math.abs(2 * l - 1));
    let h: number;

    if (max === r) {
        h = ((g - b) / delta) % 6;
    } else if (max === g) {
        h = (b - r) / delta + 2;
    } else {
        h = (r - g) / delta + 4;
    }

    return {
        h: (h * 60 + 360) % 360,
        s,
        l,
        a: clampAlpha(color.a)
    };
}

/** Converts a hue sector value to an RGB channel. */
function hueToRgb(p: number, q: number, t: number): number {
    let normalizedT = t;
    if (normalizedT < 0) {
        normalizedT += 1;
    }
    if (normalizedT > 1) {
        normalizedT -= 1;
    }
    if (normalizedT < 1 / 6) {
        return p + (q - p) * 6 * normalizedT;
    }
    if (normalizedT < 1 / 2) {
        return q;
    }
    if (normalizedT < 2 / 3) {
        return p + (q - p) * (2 / 3 - normalizedT) * 6;
    }
    return p;
}

/** Converts an HSLA color to RGBA. */
function hslaToRgba(color: HSLA): RGBA {
    const h = (((color.h % 360) + 360) % 360) / 360;
    const s = clampUnit(color.s);
    const l = clampUnit(color.l);
    const a = clampAlpha(color.a);

    if (s === 0) {
        const channel = clampChannel(l * 255);
        return { r: channel, g: channel, b: channel, a };
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return {
        r: clampChannel(hueToRgb(p, q, h + 1 / 3) * 255),
        g: clampChannel(hueToRgb(p, q, h) * 255),
        b: clampChannel(hueToRgb(p, q, h - 1 / 3) * 255),
        a
    };
}

/**
 * Builds a hue interpolator in OKLCH space and keeps luminance aligned with the end-point ramp.
 */
export function createHueInterpolator(start: RGBA, end: RGBA): (t: number) => RGBA {
    const startLch = rgbToOklch(start);
    const endLch = rgbToOklch(end);
    const startLuminance = relativeLuminanceFromRgba(start);
    const endLuminance = relativeLuminanceFromRgba(end);

    let hueDelta = endLch.h - startLch.h;
    if (hueDelta < 0) {
        hueDelta += 360;
    }

    return (t: number) => {
        const clampedT = clampUnit(t);
        if (clampedT <= 0) {
            return start;
        }
        if (clampedT >= 1) {
            return end;
        }

        const h = (startLch.h + hueDelta * clampedT) % 360;
        const l = lerp(startLch.l, endLch.l, clampedT);
        const c = lerp(startLch.c, endLch.c, clampedT);
        const color = oklchToRgbaGamutMapped({ l, c, h }, lerp(start.a, end.a, clampedT));
        const targetLuminance = lerp(startLuminance, endLuminance, clampedT);
        return adjustRgbaToTargetLuminance(color, targetLuminance);
    };
}

/** Builds a hue interpolator in HSL space without OKLCH luminance balancing. */
function createSimpleHueInterpolator(start: RGBA, end: RGBA): (t: number) => RGBA {
    const startHsl = rgbaToHsla(start);
    const endHsl = rgbaToHsla(end);

    let hueDelta = endHsl.h - startHsl.h;
    if (hueDelta < 0) {
        hueDelta += 360;
    }

    return (t: number) => {
        const clampedT = clampUnit(t);
        if (clampedT <= 0) {
            return start;
        }
        if (clampedT >= 1) {
            return end;
        }

        return hslaToRgba({
            h: (startHsl.h + hueDelta * clampedT) % 360,
            s: lerp(startHsl.s, endHsl.s, clampedT),
            l: lerp(startHsl.l, endHsl.l, clampedT),
            a: lerp(startHsl.a, endHsl.a, clampedT)
        });
    };
}

/** Builds a fixed-size palette for a start/end gradient and a transition style. */
export function buildRainbowPalette(params: {
    steps: number;
    start: RGBA;
    end: RGBA;
    style: 'hue' | 'rgb';
    balanceHueLuminance?: boolean;
}): string[] {
    const steps = Math.max(2, Math.floor(params.steps));
    const maxIndex = steps - 1;

    const palette = new Array<string>(steps);
    if (params.style === 'hue') {
        const interpolate =
            params.balanceHueLuminance === false
                ? createSimpleHueInterpolator(params.start, params.end)
                : createHueInterpolator(params.start, params.end);
        for (let i = 0; i < steps; i++) {
            palette[i] = toCssRgba(interpolate(i / maxIndex));
        }
        return palette;
    }

    for (let i = 0; i < steps; i++) {
        palette[i] = toCssRgba(interpolateRgb(params.start, params.end, i / maxIndex));
    }

    return palette;
}

/** Assigns key-to-color entries by indexing into a precomputed palette. */
export function assignRainbowColorsFromPalette(params: {
    keys: readonly string[];
    palette: readonly string[];
    target: Map<string, string>;
}): void {
    const { keys, palette, target } = params;
    if (keys.length === 0 || palette.length === 0) {
        return;
    }

    const maxIndex = Math.max(1, keys.length - 1);
    const paletteMax = palette.length - 1;
    for (let i = 0; i < keys.length; i++) {
        const t = i / maxIndex;
        const paletteIndex = Math.min(paletteMax, Math.max(0, Math.round(t * paletteMax)));
        const value = palette[paletteIndex];
        if (value) {
            target.set(keys[i], value);
        }
    }
}

/** Builds a key-to-color map by indexing into a precomputed palette. */
export function buildRainbowColorMapFromPalette(params: { keys: readonly string[]; palette: readonly string[] }): Map<string, string> {
    const result = new Map<string, string>();
    assignRainbowColorsFromPalette({ ...params, target: result });
    return result;
}

/**
 * Formats an RGBA object into an rgb() string without alpha.
 * Always returns a solid (opaque) color string suitable for CSS.
 * Example: {r: 100, g: 150, b: 200, a: 0.5} → "rgb(100, 150, 200)"
 */
function formatRgb(color: RGBA): string {
    const r = Math.round(clampChannel(color.r));
    const g = Math.round(clampChannel(color.g));
    const b = Math.round(clampChannel(color.b));
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Returns true if two RGBA colors are component-wise equal within a small epsilon.
 * Uses epsilon tolerance to account for floating-point precision and rounding.
 *
 * @param left - First color to compare
 * @param right - Second color to compare
 * @param epsilon - Tolerance for RGB channels (default 0.5 out of 255)
 * @returns true if colors are equal within tolerance
 */
export function colorsEqual(left: RGBA | null, right: RGBA | null, epsilon = 0.5): boolean {
    if (!left && !right) {
        return true;
    }
    if (!left || !right) {
        return false;
    }
    return (
        Math.abs(left.r - right.r) <= epsilon &&
        Math.abs(left.g - right.g) <= epsilon &&
        Math.abs(left.b - right.b) <= epsilon &&
        Math.abs(left.a - right.a) <= 0.01 // Tighter tolerance for alpha
    );
}

// ============================================================================
// Alpha Compositing (Blending)
// ============================================================================
// Implements standard alpha compositing to blend semi-transparent colors
// onto opaque backgrounds, producing solid colors that appear identical
// to the transparent overlay when viewed on the base color.

/**
 * Composites an overlay color onto an opaque base color, returning the resulting RGBA.
 * Uses the standard alpha compositing formula: result = overlay * alpha + base * (1 - alpha)
 *
 * Example:
 *   Base: rgb(30, 30, 30) - dark pane background
 *   Overlay: rgba(100, 150, 200, 0.3) - 30% transparent blue
 *   Result: rgb(51, 66, 81) - solid color that looks like the overlay on that background
 *
 * @param base - The opaque base color (typically the pane background)
 * @param overlay - The overlay color (may be transparent)
 * @returns Solid RGBA with alpha = 1
 */
function compositeOntoBase(base: RGBA, overlay: RGBA): RGBA {
    const overlayAlpha = clampAlpha(overlay.a);

    // Optimization: If overlay is fully opaque, just return it
    if (overlayAlpha >= 1) {
        return {
            r: clampChannel(overlay.r),
            g: clampChannel(overlay.g),
            b: clampChannel(overlay.b),
            a: 1
        };
    }

    // Optimization: If overlay is fully transparent, return base
    if (overlayAlpha <= 0) {
        return {
            r: clampChannel(base.r),
            g: clampChannel(base.g),
            b: clampChannel(base.b),
            a: 1
        };
    }

    // Standard alpha compositing formula
    // Each channel: result = (overlay * alpha) + (base * (1 - alpha))
    const inverse = 1 - overlayAlpha;
    return {
        r: clampChannel(overlay.r * overlayAlpha + base.r * inverse),
        g: clampChannel(overlay.g * overlayAlpha + base.g * inverse),
        b: clampChannel(overlay.b * overlayAlpha + base.b * inverse),
        a: 1 // Result is always fully opaque
    };
}

/**
 * Composites the given overlay color string onto the provided base color.
 * This is the main entry point for converting semi-transparent theme colors
 * into solid colors that prevent hairline artifacts.
 *
 * Process:
 * 1. Parse overlay color string to RGBA
 * 2. Check if base is opaque enough (alpha >= 0.99)
 * 3. Blend overlay onto base using alpha compositing
 * 4. Return solid rgb() string
 *
 * @param base - The base color (usually pane background) as RGBA object
 * @param overlayColor - The overlay color (usually theme color) as CSS string
 * @param options - Optional container for resolving CSS variables
 * @returns Solid rgb() string, or undefined if overlay is null/empty
 *
 * Examples:
 *   base: {r: 30, g: 30, b: 30, a: 1}
 *   overlayColor: "rgba(100, 150, 200, 0.2)"
 *   → "rgb(44, 54, 64)"
 *
 *   overlayColor: "var(--nn-theme-navitem-selected-bg)"
 *   → Resolves variable, then composites
 *   → "rgb(51, 66, 81)"
 */
export function compositeWithBase(
    base: RGBA | null,
    overlayColor: string | null | undefined,
    options?: ColorParsingOptions
): string | undefined {
    // Threshold for considering a color "opaque enough" for compositing
    // Set to 0.99 to account for floating-point precision
    const OPAQUE_THRESHOLD = 0.99;

    // Early return if no overlay color provided
    if (!overlayColor) {
        return undefined;
    }
    const trimmedOverlay = overlayColor.trim();
    if (!trimmedOverlay) {
        return undefined;
    }

    // Step 1: Parse the overlay color string (resolves CSS variables if container provided)
    const overlay = parseCssColor(trimmedOverlay, options);
    if (!overlay) {
        // Parsing failed, return original string as fallback
        return trimmedOverlay;
    }

    // Step 2: Check if base is opaque enough for compositing
    // If base is transparent, we can't composite accurately (would affect transparency)
    const effectiveBase = base && base.a >= OPAQUE_THRESHOLD ? base : null;

    // Step 3: Handle case where we don't have a valid opaque base
    if (!effectiveBase) {
        // If overlay is already opaque, format it
        // Otherwise return original string to preserve transparency
        return overlay.a >= 1 ? formatRgb(overlay) : trimmedOverlay;
    }

    // Step 4: Perform alpha compositing and return solid color
    const blended = compositeOntoBase(effectiveBase, overlay);
    return formatRgb(blended);
}

// ============================================================================
// File Row Background Resolution
// ============================================================================

interface ResolveFileRowBackgroundColorParams {
    customBackgroundColor?: string;
    taskUnfinished?: number | null;
    showUnfinishedTaskBackground: boolean;
    unfinishedTaskBackgroundColor: string;
    getSolidBackground: (color?: string | null) => string | undefined;
}

export function resolveFileRowBackgroundColor({
    customBackgroundColor,
    taskUnfinished,
    showUnfinishedTaskBackground,
    unfinishedTaskBackgroundColor,
    getSolidBackground
}: ResolveFileRowBackgroundColorParams): string | undefined {
    const taskBackgroundColor =
        showUnfinishedTaskBackground && typeof taskUnfinished === 'number' && taskUnfinished > 0
            ? unfinishedTaskBackgroundColor
            : undefined;

    return getSolidBackground(taskBackgroundColor ?? customBackgroundColor);
}

export function hasSolidFileRowBackground(params: ResolveFileRowBackgroundColorParams): boolean {
    return Boolean(resolveFileRowBackgroundColor(params));
}
