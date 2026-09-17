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
 * Android WebView textZoom Detection and Compensation
 * ====================================================
 *
 * PROBLEM:
 * Android WebView scales text based on system font size settings via the textZoom
 * property. This scaling happens at the rendering level AFTER CSS is parsed but
 * BEFORE layout, so CSS `text-size-adjust: none` has no effect. Users with large
 * system fonts would see oversized text that breaks the carefully designed UI.
 *
 * WHAT ANDROID TEXTZOOM SCALES:
 * - font-size: YES (scaled proportionally)
 * - line-height: YES (when specified in px or em)
 * - width/height/min-height/max-height: NO (not scaled)
 * - SVG dimensions: NO (not scaled)
 * - padding/margin: NO (not scaled)
 *
 * COMPENSATION STRATEGY:
 * Since we can't disable textZoom, we pre-divide values by the scale factor so that
 * when Android applies its scaling, the final rendered size is correct.
 *
 * Example with scale factor 1.8:
 * - We want 14px font-size
 * - We set CSS to: 14px / 1.8 = 7.78px
 * - Android scales: 7.78px × 1.8 = 14px ✓
 *
 * DETECTION METHOD:
 * We create a probe element with a known font-size (16px), measure the computed
 * style, and calculate the ratio. This must happen BEFORE React renders so the
 * virtualizer gets correct measurements for row heights.
 *
 * WHAT WE COMPENSATE:
 *
 * 1. Font-size variables (via JavaScript inline styles):
 *    - --nn-file-name-size, --nn-file-small-size, etc.
 *    - Set on outer container, cascades to all descendants
 *
 * 2. Line-height variables (via CSS calc):
 *    - --nn-file-title-line-height, --nn-file-multiline-text-line-height, etc.
 *    - Must be done in CSS because .nn-mobile class redefines these on inner element
 *    - Uses: calc(21px * var(--nn-android-font-scale-reciprocal, 1))
 *
 * 3. Fixed multi-line row heights (via CSS calc):
 *    - height/min-height for .nn-file-name and .nn-file-preview
 *    - These use line-height vars which are pre-compensated, so we multiply by
 *      scale to get the fixed row height (which Android won't scale)
 *    - Uses: calc(var(--line-height) * rows * var(--nn-android-font-scale, 1))
 *
 * 4. Text elements with hardcoded sizes (via CSS):
 *    - .nn-navitem-count (note counts)
 *    - .nn-root-reorder-hint (reorder panel text)
 *
 * 5. Emoji and webfont icons (via CSS):
 *    - .nn-emoji-icon and .nn-iconfont classes
 *    - These use font-size which Android scales
 *    - Lucide SVG icons are NOT compensated (they use width/height)
 *
 * CSS VARIABLE ARCHITECTURE:
 * - --nn-android-font-scale: The detected scale factor (e.g., 1.8)
 * - --nn-android-font-scale-reciprocal: calc(1 / scale) for multiplication in CSS
 *   (some browsers handle calc(x * reciprocal) better than calc(x / var))
 *
 * FILES INVOLVED:
 * - src/utils/androidFontScale.ts: Detection and font-size variable compensation
 * - src/view/NotebookNavigatorView.tsx: Calls applyAndroidFontCompensation before React
 * - src/components/NotebookNavigatorComponent.tsx: Copies compensation when the navigator root mounts
 * - styles.css: "Android textZoom Compensation" section for CSS-based compensation
 */

/** Expected probe font size in pixels */
const EXPECTED_FONT_SIZE = 16;

/** Tolerance for detecting scaling (2% threshold) */
const SCALE_DETECTION_TOLERANCE = 0.02;

/** Font size variables to compensate (values read from CSS custom properties) */
const ANDROID_FONT_SIZE_VARIABLES = [
    '--nn-file-name-size',
    '--nn-file-name-size-mobile',
    '--nn-file-small-size',
    '--nn-file-small-size-mobile',
    '--nn-list-title-font-size',
    '--nn-desktop-header-font-size',
    '--nn-mobile-header-font-size',
    '--nn-compact-font-size',
    '--nn-compact-font-size-mobile'
] as const;

type FontSizeVariableName = (typeof ANDROID_FONT_SIZE_VARIABLES)[number];

function createMeasurementProbe(container: HTMLElement): HTMLElement {
    // Hidden probe lets us read computed font sizes without disturbing layout
    const probe = container.win.createDiv();
    probe.style.cssText = `
        position: absolute;
        visibility: hidden;
        pointer-events: none;
        width: auto;
        height: auto;
        line-height: 1;
        white-space: nowrap;
    `;
    probe.textContent = 'M';
    container.appendChild(probe);
    return probe;
}

function parsePixelValue(value: string): number | null {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
}

function measureAndroidFontData(container: HTMLElement): {
    scaleFactor: number;
    fontSizeValues: Partial<Record<FontSizeVariableName, number>>;
} {
    // Single probe captures both the textZoom scale and the raw CSS variable values
    const probe = createMeasurementProbe(container);
    try {
        // Mobile class ensures mobile custom properties are active on the probe
        probe.classList.add('nn-mobile');
        probe.style.fontSize = `${EXPECTED_FONT_SIZE}px`;
        const computedStyle = getComputedStyle(probe);
        const rectHeight = probe.getBoundingClientRect().height;
        const measuredFontSize = rectHeight > 0 ? rectHeight : parsePixelValue(computedStyle.fontSize);
        const scaleFactor = measuredFontSize ? measuredFontSize / EXPECTED_FONT_SIZE : 1;

        const fontSizeValues: Partial<Record<FontSizeVariableName, number>> = {};
        for (const variable of ANDROID_FONT_SIZE_VARIABLES) {
            // First try to read the raw custom property value (unscaled)
            const rawValue = computedStyle.getPropertyValue(variable);
            const parsed = parsePixelValue(rawValue.trim());
            if (parsed !== null) {
                fontSizeValues[variable] = parsed;
                continue;
            }
            // Fallback: measure the computed value and divide by the detected scale
            probe.style.fontSize = `var(${variable})`;
            const measuredValue = parsePixelValue(getComputedStyle(probe).fontSize);
            if (measuredValue !== null) {
                fontSizeValues[variable] = measuredValue / scaleFactor;
            }
        }
        return { scaleFactor, fontSizeValues };
    } finally {
        probe.remove();
    }
}

export function clearAndroidFontCompensation(container: HTMLElement): void {
    container.style.removeProperty('--nn-android-font-scale');
    for (const variable of ANDROID_FONT_SIZE_VARIABLES) {
        container.style.removeProperty(variable);
    }
}

/**
 * Line height variables are compensated in CSS rather than JavaScript because
 * the .nn-mobile class (on an inner React element) redefines these variables
 * and would override any inline styles set on the outer container.
 * See styles.css "Android textZoom Compensation" section.
 */

/**
 * Detects Android textZoom and applies compensated font-size CSS variables.
 * Must be called BEFORE React renders to ensure the virtualizer gets correct measurements.
 */
export function applyAndroidFontCompensation(container: HTMLElement): void {
    clearAndroidFontCompensation(container);
    const { scaleFactor: detectedScaleFactor, fontSizeValues } = measureAndroidFontData(container);
    // Round to 3 decimal places to avoid floating point precision artifacts
    const roundedScaleFactor = Math.round(detectedScaleFactor * 1000) / 1000;

    // Only apply if scaling detected (beyond tolerance threshold)
    if (Math.abs(roundedScaleFactor - 1) <= SCALE_DETECTION_TOLERANCE) {
        return;
    }

    // Store the scale factor for use by dynamic font size calculations
    container.style.setProperty('--nn-android-font-scale', String(roundedScaleFactor));

    // Override font-size variables with compensated values
    // If system scales by 1.8x, we set 14px / 1.8 = 7.78px so it renders as 14px
    for (const variable of ANDROID_FONT_SIZE_VARIABLES) {
        const defaultSize = fontSizeValues[variable];
        if (defaultSize === undefined) continue;
        const compensatedSize = defaultSize / roundedScaleFactor;
        container.style.setProperty(variable, `${compensatedSize}px`);
    }
}

/**
 * Gets the detected Android font scale factor from a container element.
 * Returns 1 if no scaling was detected or not on Android.
 */
export function getAndroidFontScale(container: Element | null): number {
    if (!(container instanceof HTMLElement)) {
        return 1;
    }
    const value = container.style.getPropertyValue('--nn-android-font-scale');
    if (!value) {
        return 1;
    }
    const scale = parseFloat(value);
    return Number.isFinite(scale) ? scale : 1;
}

/** Copies Android font compensation CSS variables from source element to target element */
function propagateAndroidFontCompensation(source: HTMLElement, target: HTMLElement): void {
    const scaleValue = source.style.getPropertyValue('--nn-android-font-scale');
    if (scaleValue) {
        target.style.setProperty('--nn-android-font-scale', scaleValue.trim());
    }
    for (const variable of ANDROID_FONT_SIZE_VARIABLES) {
        const value = source.style.getPropertyValue(variable);
        if (value) {
            target.style.setProperty(variable, value.trim());
        }
    }
}

/** Propagates font compensation variables from container to the mobile split pane root */
export function propagateAndroidFontCompensationToMobileRoot(container: HTMLElement): void {
    const mobileRoot = container.querySelector('.nn-split-container.nn-mobile');
    if (mobileRoot instanceof HTMLElement) {
        propagateAndroidFontCompensation(container, mobileRoot);
    }
}
