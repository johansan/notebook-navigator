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

import { App, Scope, setIcon } from 'obsidian';
import { strings } from '../i18n';
import {
    DEFAULT_CUSTOM_COLOR,
    DEFAULT_CUSTOM_COLORS,
    DEFAULT_USER_COLORS,
    MAX_RECENT_COLORS,
    USER_COLOR_SLOT_COUNT
} from '../constants/colorPalette';
import { ISettingsProvider } from '../interfaces/ISettingsProvider';
import { runAsyncAction } from '../utils/async';
import { addAsyncEventListener } from '../utils/domEventListeners';
import { showNotice } from '../utils/noticeUtils';
import { setNativeDragPreview } from '../utils/nativeDragPreview';
import { ConfirmModal } from './ConfirmModal';

const DEFAULT_PICKER_COLOR = '#3b82f6';

type RGBAValues = { r: number; g: number; b: number; a: number };
type HSVValues = { h: number; s: number; v: number };

type PaletteMode = 'default' | 'custom';

interface PaletteDragData {
    color: string;
}

export interface ColorPickerSharedState {
    customColors: string[];
    customColorsDirty: boolean;
}

interface ColorPickerSurfaceParams {
    app: App;
    rootEl: HTMLElement;
    scope: Scope;
    initialColor: string | null;
    settingsProvider: ISettingsProvider;
    sharedState?: ColorPickerSharedState;
    showPreview?: boolean;
    recentInLeftColumn?: boolean;
    onChange?: (color: string) => void;
    onCommitRequested?: () => void | Promise<void>;
}

/**
 * Plain color editing surface shared by the standalone color modal and the appearance modal.
 */
export class ColorPickerSurface {
    private static lastPaletteMode: PaletteMode = 'default';
    private app: App;
    private rootEl: HTMLElement;
    private scope: Scope;
    private settingsProvider: ISettingsProvider;
    private currentColor: string | null = null;
    private selectedColor: string = DEFAULT_PICKER_COLOR;
    private hexInput!: HTMLInputElement;
    private previewNew: HTMLDivElement | null = null;
    private svArea!: HTMLDivElement;
    private svThumb!: HTMLDivElement;
    private hueSlider!: HTMLDivElement;
    private hueThumb!: HTMLDivElement;
    private alphaSlider!: HTMLDivElement;
    private alphaThumb!: HTMLDivElement;
    private recentColorsContainer!: HTMLDivElement;
    private userColorsContainer!: HTMLDivElement;
    private userColorDots: HTMLDivElement[] = [];
    private defaultColors: string[] = [...DEFAULT_USER_COLORS];
    private sharedState: ColorPickerSharedState;
    private paletteMode: PaletteMode = 'default';
    private activeDefaultColorIndex: number | null = null;
    private activeCustomColorIndex: number | null = null;
    private copyColorsButton!: HTMLButtonElement;
    private pasteColorsButton!: HTMLButtonElement;
    private clearCustomColorsButton!: HTMLButtonElement;
    private paletteToggleDefault!: HTMLElement;
    private paletteToggleCustom!: HTMLElement;
    private paletteDisposers: (() => void)[] = [];
    private recentColorDisposers: (() => void)[] = [];
    private pointerDisposers: (() => void)[] = [];
    private domDisposers: (() => void)[] = [];
    private isUpdating = false;
    private isBuilding = false;
    private cleared = false;
    private hue = 0;
    private saturation = 0;
    private value = 0;
    private alpha = 255;
    private pendingPaletteSwitchHandle: number | null = null;
    private showPreview: boolean;
    private recentInLeftColumn: boolean;
    private onChange?: (color: string) => void;
    private onCommitRequested?: () => void | Promise<void>;

    /** Returns the last used palette mode across picker instances */
    public static getLastPaletteMode(): PaletteMode {
        return ColorPickerSurface.lastPaletteMode;
    }

    /** Persists the palette mode selection for subsequent picker openings */
    public static setLastPaletteMode(mode: PaletteMode) {
        ColorPickerSurface.lastPaletteMode = mode;
    }

    static createSharedState(settingsProvider: ISettingsProvider): ColorPickerSharedState {
        return {
            customColors: ColorPickerSurface.getNormalizedCustomColors(settingsProvider),
            customColorsDirty: false
        };
    }

    constructor(params: ColorPickerSurfaceParams) {
        this.app = params.app;
        this.rootEl = params.rootEl;
        this.scope = params.scope;
        this.settingsProvider = params.settingsProvider;
        this.sharedState = params.sharedState ?? ColorPickerSurface.createSharedState(params.settingsProvider);
        this.showPreview = params.showPreview !== false;
        this.recentInLeftColumn = params.recentInLeftColumn ?? false;
        this.onChange = params.onChange;
        this.onCommitRequested = params.onCommitRequested;
        this.paletteMode = ColorPickerSurface.getLastPaletteMode();

        const initialColor = params.initialColor;
        if (initialColor) {
            this.currentColor = initialColor;
            const parsedInitial = this.parseColorString(initialColor);
            if (parsedInitial) {
                this.selectedColor = this.rgbaToHex(parsedInitial);
                return;
            }
        }

        this.selectedColor = DEFAULT_PICKER_COLOR;
    }

    build(): void {
        this.isBuilding = true;
        const mainContent = this.rootEl.createDiv('nn-color-picker-content');

        const leftColumn = mainContent.createDiv('nn-color-picker-left');
        if (this.showPreview) {
            this.buildPreview(leftColumn);
        } else {
            leftColumn.addClass('nn-color-picker-left-no-preview');
        }
        this.buildPalette(leftColumn);

        const rightColumn = mainContent.createDiv('nn-color-picker-right');
        this.buildVisualPicker(rightColumn);

        this.buildRecentColors(this.recentInLeftColumn ? leftColumn : this.rootEl);

        this.registerKeyboardShortcuts();
        this.loadRecentColors();
        this.loadPaletteState();
        this.updatePaletteToggleState();
        this.renderUserColors();
        this.updatePresetButtonsVisibility();
        this.updateFromHex(this.selectedColor, { notify: false });
        this.isBuilding = false;
    }

    getColor(): string {
        return this.selectedColor;
    }

    setColor(color: string): void {
        this.cleared = false;
        this.updateFromHex(color, { syncInput: true, notify: false });
    }

    markCleared(): void {
        this.cleared = true;
        this.renderSelectedSwatch();
    }

    isCleared(): boolean {
        return this.cleared;
    }

    commitRecentColor(): void {
        this.saveToRecentColors(this.selectedColor);
    }

    persistCustomColors(): void {
        if (!this.sharedState.customColorsDirty) {
            return;
        }

        this.settingsProvider.settings.userColors = [...this.sharedState.customColors];
        runAsyncAction(() => this.settingsProvider.saveSettingsAndUpdate());
        this.sharedState.customColorsDirty = false;
    }

    dispose(): void {
        this.persistCustomColors();
        this.disposePaletteListeners();
        this.disposeRecentColorListeners();
        this.disposePointerListeners();
        this.disposeDomListeners();
        if (this.pendingPaletteSwitchHandle !== null) {
            window.cancelAnimationFrame(this.pendingPaletteSwitchHandle);
            this.pendingPaletteSwitchHandle = null;
        }
    }

    private static getNormalizedCustomColors(settingsProvider: ISettingsProvider): string[] {
        const storedColors = settingsProvider.settings.userColors ?? [];
        const colors: string[] = [...DEFAULT_CUSTOM_COLORS];

        for (let i = 0; i < USER_COLOR_SLOT_COUNT; i++) {
            const normalized = ColorPickerSurface.normalizeHexColor(storedColors[i]);
            if (normalized) {
                colors[i] = normalized;
            }
        }

        return colors;
    }

    private static normalizeHexColor(color: string | null | undefined): string | null {
        if (!color) {
            return null;
        }

        const parsed = ColorPickerSurface.parseColorString(color);
        if (!parsed) {
            return null;
        }

        return ColorPickerSurface.rgbaToHex(parsed);
    }

    private static hexToRgba(hex: string): RGBAValues | null {
        const normalized = hex.startsWith('#') ? hex.slice(1) : hex;

        if (normalized.length !== 3 && normalized.length !== 4 && normalized.length !== 6 && normalized.length !== 8) {
            return null;
        }

        if (normalized.length === 3 || normalized.length === 4) {
            const [rChar, gChar, bChar, aChar] = normalized.split('');
            const rHex = (rChar ?? '0').repeat(2);
            const gHex = (gChar ?? '0').repeat(2);
            const bHex = (bChar ?? '0').repeat(2);
            const aHex = normalized.length === 4 ? (aChar ?? 'f').repeat(2) : 'ff';

            const r = parseInt(rHex, 16);
            const g = parseInt(gHex, 16);
            const b = parseInt(bHex, 16);
            const a = parseInt(aHex, 16);

            if ([r, g, b, a].some(value => Number.isNaN(value))) {
                return null;
            }

            return { r, g, b, a };
        }

        const r = parseInt(normalized.slice(0, 2), 16);
        const g = parseInt(normalized.slice(2, 4), 16);
        const b = parseInt(normalized.slice(4, 6), 16);
        const a = normalized.length === 8 ? parseInt(normalized.slice(6, 8), 16) : 255;

        if ([r, g, b, a].some(value => Number.isNaN(value))) {
            return null;
        }

        return { r, g, b, a };
    }

    private static rgbaToHex({ r, g, b, a }: RGBAValues): string {
        const base = [r, g, b].map(value => value.toString(16).padStart(2, '0')).join('');
        if (a >= 255) {
            return `#${base}`;
        }

        const alpha = a.toString(16).padStart(2, '0');
        return `#${base}${alpha}`;
    }

    private static parseColorString(color: string): RGBAValues | null {
        if (!color) {
            return null;
        }

        const hex = ColorPickerSurface.hexToRgba(color);
        if (hex) {
            return hex;
        }

        const rgbMatch = color.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
        if (rgbMatch) {
            const [r, g, b] = rgbMatch.slice(1, 4).map(value => ColorPickerSurface.clampColorComponent(parseInt(value, 10)));
            return { r, g, b, a: 255 };
        }

        const rgbaMatch = color.match(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([0-9]*\.?[0-9]+)\s*\)$/i);
        if (rgbaMatch) {
            const [r, g, b] = rgbaMatch.slice(1, 4).map(value => ColorPickerSurface.clampColorComponent(parseInt(value, 10)));
            const alphaFloat = parseFloat(rgbaMatch[4]);
            if (Number.isNaN(alphaFloat)) {
                return null;
            }
            const clampedAlpha = Math.max(0, Math.min(1, alphaFloat));
            return { r, g, b, a: Math.round(clampedAlpha * 255) };
        }

        return null;
    }

    private static clampColorComponent(value: number): number {
        if (Number.isNaN(value)) {
            return 0;
        }
        return Math.max(0, Math.min(255, value));
    }

    private buildPreview(leftColumn: HTMLElement): void {
        const previewSection = leftColumn.createDiv('nn-color-preview-section');
        const previewContainer = previewSection.createDiv('nn-color-preview-container');

        const currentSection = previewContainer.createDiv('nn-preview-current');
        currentSection.createSpan({ text: strings.modals.colorPicker.currentColor, cls: 'nn-preview-label' });
        const previewCurrent = currentSection.createDiv('nn-preview-color');
        if (this.currentColor) {
            this.applySwatchColor(previewCurrent, this.currentColor);
        } else {
            previewCurrent.addClass('nn-no-color');
        }
        this.makeSwatchDraggable(previewCurrent, () => this.currentColor, this.domDisposers);
        this.domDisposers.push(
            addAsyncEventListener(previewCurrent, 'click', () => {
                const normalized = this.normalizeHexColor(this.currentColor);
                if (!normalized) {
                    return;
                }
                this.updateFromHex(normalized);
            })
        );
        this.domDisposers.push(
            addAsyncEventListener(previewCurrent, 'dblclick', () => {
                const normalized = this.normalizeHexColor(this.currentColor);
                if (!normalized) {
                    return;
                }
                this.handleSwatchDoubleClick(normalized);
            })
        );

        const arrow = previewContainer.createDiv('nn-preview-arrow');
        setIcon(arrow, 'lucide-arrow-right');

        const newSection = previewContainer.createDiv('nn-preview-new');
        newSection.createSpan({ text: strings.modals.colorPicker.newColor, cls: 'nn-preview-label' });
        const previewNew = newSection.createDiv('nn-preview-color nn-show-checkerboard');
        this.previewNew = previewNew;
        this.applySwatchColor(previewNew, this.selectedColor);
        this.makeSwatchDraggable(previewNew, () => (this.cleared ? null : this.selectedColor), this.domDisposers);
    }

    private buildPalette(leftColumn: HTMLElement): void {
        const presetSection = leftColumn.createDiv('nn-preset-section');
        const presetHeader = presetSection.createDiv('nn-preset-header');
        const paletteToggle = presetHeader.createDiv('nn-preset-toggle');
        this.paletteToggleDefault = paletteToggle.createSpan({
            text: strings.modals.colorPicker.paletteDefault,
            cls: 'nn-preset-toggle-label'
        });
        this.domDisposers.push(
            addAsyncEventListener(this.paletteToggleDefault, 'click', event => {
                event.preventDefault();
                this.setPaletteMode('default');
            })
        );

        paletteToggle.createSpan({ text: '|', cls: 'nn-preset-toggle-separator' });

        this.paletteToggleCustom = paletteToggle.createSpan({
            text: strings.modals.colorPicker.paletteCustom,
            cls: 'nn-preset-toggle-label'
        });
        this.domDisposers.push(
            addAsyncEventListener(this.paletteToggleCustom, 'click', event => {
                event.preventDefault();
                this.setPaletteMode('custom');
            })
        );

        const presetButtons = presetHeader.createDiv('nn-preset-buttons');

        this.copyColorsButton = presetButtons.createEl('button', {
            cls: 'nn-preset-action-button',
            attr: {
                type: 'button',
                'aria-label': strings.modals.colorPicker.copyColors,
                title: strings.modals.colorPicker.copyColors
            }
        });
        setIcon(this.copyColorsButton, 'copy');
        this.domDisposers.push(addAsyncEventListener(this.copyColorsButton, 'click', () => this.copySelectedColor()));

        this.pasteColorsButton = presetButtons.createEl('button', {
            cls: 'nn-preset-action-button',
            attr: {
                type: 'button',
                'aria-label': strings.modals.colorPicker.pasteColors,
                title: strings.modals.colorPicker.pasteColors
            }
        });
        setIcon(this.pasteColorsButton, 'clipboard-paste');
        this.domDisposers.push(addAsyncEventListener(this.pasteColorsButton, 'click', () => this.pasteSelectedColor()));

        this.clearCustomColorsButton = presetButtons.createEl('button', {
            cls: 'nn-clear-recent nn-clear-custom-colors',
            text: '×',
            attr: {
                type: 'button',
                'aria-label': strings.modals.colorPicker.resetUserColors,
                title: strings.modals.colorPicker.resetUserColors
            }
        });
        this.domDisposers.push(addAsyncEventListener(this.clearCustomColorsButton, 'click', () => this.confirmClearCustomColors()));

        this.userColorsContainer = presetSection.createDiv('nn-preset-colors');
    }

    private buildHexInput(parent: HTMLElement): void {
        const hexSection = parent.createDiv('nn-hex-section');
        const header = hexSection.createDiv('nn-hex-header');
        header.createEl('label', { text: strings.modals.colorPicker.hexLabel, cls: 'nn-hex-title' });
        const hexContainer = hexSection.createDiv('nn-hex-container');
        hexContainer.createSpan({ text: '#', cls: 'nn-hex-label' });
        this.hexInput = hexContainer.createEl('input', {
            type: 'text',
            cls: 'nn-hex-input',
            value: this.selectedColor.substring(1),
            attr: {
                'aria-label': strings.modals.colorPicker.hexInputLabel,
                maxlength: '8',
                placeholder: 'RRGGBB or RRGGBBAA'
            }
        });
        this.hexInput.setAttribute('enterkeyhint', 'done');

        this.domDisposers.push(
            addAsyncEventListener(this.hexInput, 'input', () => {
                const sanitized = this.sanitizeHexInput(this.hexInput.value);
                if (sanitized !== this.hexInput.value) {
                    this.hexInput.value = sanitized;
                }

                if (sanitized.length === 6 || sanitized.length === 8) {
                    this.updateFromHex(`#${sanitized.toLowerCase()}`, { syncInput: false });
                }
            })
        );
    }

    private buildVisualPicker(rightColumn: HTMLElement): void {
        const pickerHeader = rightColumn.createDiv('nn-sv-header');
        pickerHeader.createSpan({ text: strings.modals.colorPicker.pickerLabel, cls: 'nn-section-label' });

        const colorAreaSection = rightColumn.createDiv('nn-color-area-section');

        this.svArea = colorAreaSection.createDiv('nn-sv-area');
        this.svArea.setAttribute('aria-label', strings.modals.colorPicker.saturationValueArea);
        this.svThumb = this.svArea.createDiv('nn-sv-thumb');
        this.attachPointerArea(this.svArea, (x, y) => {
            this.saturation = x;
            this.value = 1 - y;
            this.commitHsvColor();
        });

        const controls = colorAreaSection.createDiv('nn-color-controls');

        this.hueSlider = controls.createDiv('nn-color-slider nn-hue-slider');
        this.hueSlider.setAttribute('aria-label', strings.modals.colorPicker.hueSlider);
        this.hueThumb = this.hueSlider.createDiv('nn-slider-thumb');
        this.attachPointerArea(this.hueSlider, x => {
            this.hue = x * 360;
            this.commitHsvColor();
        });

        this.alphaSlider = controls.createDiv('nn-color-slider nn-alpha-slider nn-checkerboard');
        this.alphaSlider.setAttribute('aria-label', strings.modals.colorPicker.alphaSlider);
        this.alphaSlider.createDiv('nn-alpha-gradient');
        this.alphaThumb = this.alphaSlider.createDiv('nn-slider-thumb');
        this.attachPointerArea(this.alphaSlider, x => {
            this.alpha = Math.round(x * 255);
            this.commitHsvColor();
        });

        this.buildHexInput(controls);
    }

    private buildRecentColors(container: HTMLElement): void {
        const recentSection = container.createDiv('nn-recent-section');
        const recentHeader = recentSection.createDiv('nn-recent-header');
        recentHeader.createDiv({ text: strings.modals.colorPicker.recentColors, cls: 'nn-section-label' });

        const clearButton = recentHeader.createEl('button', {
            text: '×',
            cls: 'nn-clear-recent',
            title: strings.modals.colorPicker.clearRecentColors
        });
        this.domDisposers.push(
            addAsyncEventListener(clearButton, 'click', () => {
                this.clearRecentColors();
            })
        );

        this.recentColorsContainer = recentSection.createDiv('nn-recent-colors');
    }

    private attachPointerArea(element: HTMLElement, onMove: (x: number, y: number) => void): void {
        const updateFromEvent = (event: PointerEvent) => {
            const rect = element.getBoundingClientRect();
            const x = rect.width <= 0 ? 0 : (event.clientX - rect.left) / rect.width;
            const y = rect.height <= 0 ? 0 : (event.clientY - rect.top) / rect.height;
            onMove(Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y)));
        };

        const pointerMove = (event: PointerEvent) => {
            event.preventDefault();
            updateFromEvent(event);
        };

        const pointerUp = (event: PointerEvent) => {
            element.releasePointerCapture(event.pointerId);
            element.removeEventListener('pointermove', pointerMove);
            element.removeEventListener('pointerup', pointerUp);
            element.removeEventListener('pointercancel', pointerUp);
        };

        this.pointerDisposers.push(
            addAsyncEventListener(element, 'pointerdown', event => {
                event.preventDefault();
                element.setPointerCapture(event.pointerId);
                updateFromEvent(event);
                element.addEventListener('pointermove', pointerMove);
                element.addEventListener('pointerup', pointerUp);
                element.addEventListener('pointercancel', pointerUp);
            })
        );
    }

    private registerKeyboardShortcuts(): void {
        this.scope.register([], 'Enter', event => {
            if (activeDocument.activeElement === this.hexInput) {
                event.preventDefault();
                window.setTimeout(() => {
                    this.hexInput.blur();
                });
            }
        });
    }

    private getRecentColors(): string[] {
        return this.settingsProvider.getRecentColors();
    }

    private saveRecentColors(recentColors: string[]): void {
        this.settingsProvider.setRecentColors(recentColors);
    }

    private loadRecentColors(): void {
        const recentColors = this.getRecentColors();
        this.disposeRecentColorListeners();
        this.recentColorsContainer.empty();

        recentColors.forEach((color, index) => {
            const dot = this.recentColorsContainer.createDiv('nn-color-dot nn-recent-color nn-show-checkerboard');
            this.applySwatchColor(dot, color);
            dot.setAttribute('data-color', color);
            this.makeSwatchDraggable(dot, () => color, this.recentColorDisposers);
            this.recentColorDisposers.push(
                addAsyncEventListener(dot, 'click', () => {
                    this.updateFromHex(color);
                })
            );
            this.recentColorDisposers.push(
                addAsyncEventListener(dot, 'dblclick', () => {
                    this.handleSwatchDoubleClick(color);
                })
            );

            const removeButton = dot.createEl('button', {
                cls: 'nn-recent-remove-button',
                attr: {
                    type: 'button',
                    'aria-label': strings.modals.colorPicker.removeRecentColor,
                    title: strings.modals.colorPicker.removeRecentColor
                }
            });
            removeButton.createSpan({ text: '×', cls: 'nn-recent-remove-glyph', attr: { 'aria-hidden': 'true' } });
            this.recentColorDisposers.push(
                addAsyncEventListener(removeButton, 'click', event => {
                    event.stopPropagation();
                    event.preventDefault();
                    this.removeRecentColor(index);
                })
            );
        });

        for (let i = recentColors.length; i < MAX_RECENT_COLORS; i++) {
            this.recentColorsContainer.createDiv('nn-color-dot nn-color-empty');
        }
    }

    private clearRecentColors(): void {
        this.saveRecentColors([]);
        this.loadRecentColors();
    }

    private removeRecentColor(index: number): void {
        const recentColors = this.getRecentColors();
        if (index < 0 || index >= recentColors.length) {
            return;
        }

        recentColors.splice(index, 1);
        this.saveRecentColors(recentColors);
        this.loadRecentColors();
    }

    private loadPaletteState(): void {
        this.activeDefaultColorIndex = this.findDefaultColorIndex(this.selectedColor);
        this.activeCustomColorIndex = this.findCustomColorIndex(this.selectedColor);
    }

    private renderUserColors(): void {
        this.disposePaletteListeners();
        this.userColorsContainer.empty();
        this.userColorDots = [];

        const colors = this.paletteMode === 'default' ? this.defaultColors : this.sharedState.customColors;
        const activeIndex = this.paletteMode === 'default' ? this.activeDefaultColorIndex : this.activeCustomColorIndex;

        colors.forEach((color, index) => {
            const dot = this.userColorsContainer.createDiv('nn-color-dot');
            this.userColorDots.push(dot);
            dot.setAttribute('title', this.getUserColorSlotLabel(index));

            const normalizedColor = this.normalizeHexColor(color) ?? DEFAULT_CUSTOM_COLOR;
            dot.addClass('nn-show-checkerboard');
            this.applySwatchColor(dot, normalizedColor);
            dot.setAttribute('data-color', normalizedColor);

            if (activeIndex === index) {
                dot.addClass('nn-user-color-selected');
            }

            this.makeSwatchDraggable(dot, () => colors[index], this.paletteDisposers);

            if (this.paletteMode === 'custom') {
                this.registerCustomDropTarget(dot, index);
            }

            this.paletteDisposers.push(
                addAsyncEventListener(dot, 'click', () => {
                    const paletteColor =
                        this.paletteMode === 'default'
                            ? this.defaultColors[index]
                            : (this.sharedState.customColors[index] ?? DEFAULT_CUSTOM_COLOR);
                    const nextColor = this.normalizeHexColor(paletteColor) ?? DEFAULT_CUSTOM_COLOR;
                    this.handlePaletteColorClick(index, nextColor);
                })
            );

            this.paletteDisposers.push(
                addAsyncEventListener(dot, 'dblclick', () => {
                    const paletteColor =
                        this.paletteMode === 'default'
                            ? this.defaultColors[index]
                            : (this.sharedState.customColors[index] ?? DEFAULT_CUSTOM_COLOR);
                    const nextColor = this.normalizeHexColor(paletteColor) ?? DEFAULT_CUSTOM_COLOR;
                    this.handlePaletteColorDoubleClick(index, nextColor);
                })
            );
        });
    }

    private registerCustomDropTarget(element: HTMLElement, index: number): void {
        const addHover = () => element.addClass('nn-drop-hover');
        const removeHover = () => element.removeClass('nn-drop-hover');

        this.paletteDisposers.push(
            addAsyncEventListener(element, 'dragover', event => {
                const transfer = event.dataTransfer;
                if (!transfer) {
                    return;
                }

                const types = Array.from(transfer.types || []);
                const canAccept = types.includes('application/x-notebook-navigator-color') || types.includes('text/plain');
                if (!canAccept) {
                    return;
                }

                event.preventDefault();
                transfer.dropEffect = 'move';
                addHover();
            })
        );

        this.paletteDisposers.push(
            addAsyncEventListener(element, 'dragleave', () => {
                removeHover();
            })
        );

        this.paletteDisposers.push(
            addAsyncEventListener(element, 'drop', event => {
                const dragData = this.parseDragData(event);
                removeHover();
                if (!dragData) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                this.handleCustomDrop(index, dragData);
            })
        );
    }

    private updatePaletteSelection(): void {
        const activeIndex = this.paletteMode === 'custom' ? this.activeCustomColorIndex : this.activeDefaultColorIndex;
        this.userColorDots.forEach((dot, dotIndex) => {
            dot.toggleClass('nn-user-color-selected', dotIndex === activeIndex);
        });
        this.updatePresetButtonsVisibility();
    }

    private handlePaletteColorClick(index: number, color: string | null): void {
        const activeIndex = this.paletteMode === 'custom' ? this.activeCustomColorIndex : this.activeDefaultColorIndex;
        if (activeIndex === index) {
            if (this.paletteMode === 'custom') {
                this.activeCustomColorIndex = null;
            } else {
                this.activeDefaultColorIndex = null;
            }
            this.updatePaletteSelection();
            return;
        }

        if (this.paletteMode === 'custom') {
            this.activeCustomColorIndex = index;
        } else {
            this.activeDefaultColorIndex = index;
        }

        this.updatePaletteSelection();

        if (color) {
            this.updateFromHex(color, { syncInput: true });
        }
    }

    private handlePaletteColorDoubleClick(index: number, color: string | null): void {
        if (!color) {
            return;
        }

        if (this.paletteMode === 'custom') {
            this.activeCustomColorIndex = index;
        } else {
            this.activeDefaultColorIndex = index;
        }

        this.updatePaletteSelection();
        this.handleSwatchDoubleClick(color);
    }

    private getUserColorSlotLabel(index: number): string {
        return strings.modals.colorPicker.userColorSlot.replace('{slot}', (index + 1).toString());
    }

    private findDefaultColorIndex(color: string | null): number | null {
        const normalized = this.normalizeHexColor(color);
        if (!normalized) {
            return null;
        }

        const index = this.defaultColors.findIndex(defaultColor => defaultColor === normalized);
        return index === -1 ? null : index;
    }

    private findCustomColorIndex(color: string | null): number | null {
        const normalized = this.normalizeHexColor(color);
        if (!normalized) {
            return null;
        }

        const index = this.sharedState.customColors.findIndex(customColor => customColor === normalized);
        return index === -1 ? null : index;
    }

    private disposePaletteListeners(): void {
        if (!this.paletteDisposers.length) {
            return;
        }

        this.paletteDisposers.forEach(dispose => {
            try {
                dispose();
            } catch (e) {
                console.error('Error disposing palette listener:', e);
            }
        });
        this.paletteDisposers = [];
    }

    private disposeRecentColorListeners(): void {
        if (!this.recentColorDisposers.length) {
            return;
        }

        this.recentColorDisposers.forEach(dispose => {
            try {
                dispose();
            } catch (e) {
                console.error('Error disposing recent color listener:', e);
            }
        });
        this.recentColorDisposers = [];
    }

    private disposePointerListeners(): void {
        if (!this.pointerDisposers.length) {
            return;
        }

        this.pointerDisposers.forEach(dispose => {
            try {
                dispose();
            } catch (e) {
                console.error('Error disposing color pointer listener:', e);
            }
        });
        this.pointerDisposers = [];
    }

    private disposeDomListeners(): void {
        if (!this.domDisposers.length) {
            return;
        }

        this.domDisposers.forEach(dispose => {
            try {
                dispose();
            } catch (e) {
                console.error('Error disposing color picker listener:', e);
            }
        });
        this.domDisposers = [];
    }

    private makeSwatchDraggable(element: HTMLElement, getColor: () => string | null, disposers: (() => void)[] = this.domDisposers): void {
        element.setAttribute('draggable', 'true');
        const dispose = addAsyncEventListener(element, 'dragstart', event => {
            const color = this.normalizeHexColor(getColor());
            const transfer = event.dataTransfer;
            if (!color || !transfer) {
                event.preventDefault();
                return;
            }

            const payload: PaletteDragData = { color };

            transfer.setData('application/x-notebook-navigator-color', JSON.stringify(payload));
            transfer.setData('text/plain', color);
            transfer.effectAllowed = 'copyMove';

            setNativeDragPreview(event, this.createDragPreview(color));

            this.ensureCustomPaletteVisibleForDrag();
        });
        disposers.push(dispose);
    }

    private parseDragData(event: DragEvent): PaletteDragData | null {
        const transfer = event.dataTransfer;
        if (!transfer) {
            return null;
        }

        const encoded = transfer.getData('application/x-notebook-navigator-color');
        if (encoded) {
            const parsedPayload = this.tryParseDragPayload(encoded);
            if (parsedPayload) {
                return parsedPayload;
            }
        }

        const text = transfer.getData('text/plain');
        const normalizedText = this.normalizeHexColor(text);
        if (normalizedText) {
            return { color: normalizedText };
        }

        return null;
    }

    private tryParseDragPayload(raw: string): PaletteDragData | null {
        try {
            const parsed = JSON.parse(raw) as Partial<PaletteDragData>;
            if (!parsed || typeof parsed.color !== 'string') {
                return null;
            }

            const normalized = this.normalizeHexColor(parsed.color);
            if (!normalized) {
                return null;
            }

            return { color: normalized };
        } catch {
            return null;
        }
    }

    private createDragPreview(color: string): HTMLElement {
        const size = 36;
        const canvas = this.rootEl.ownerDocument.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        canvas.className = 'nn-drag-preview';

        const context = canvas.getContext('2d');
        if (!context) {
            return canvas;
        }

        const rgba = this.hexToRgba(color) ?? { r: 0, g: 0, b: 0, a: 255 };
        const fill = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${Math.max(0, Math.min(255, rgba.a)) / 255})`;
        const radius = size / 2 - 2;
        context.beginPath();
        context.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
        context.fillStyle = fill;
        context.fill();
        context.lineWidth = 1.5;
        context.strokeStyle = 'rgba(0,0,0,0.25)';
        context.stroke();

        return canvas;
    }

    private ensureCustomPaletteVisibleForDrag(): void {
        if (this.paletteMode === 'custom') {
            return;
        }

        if (this.pendingPaletteSwitchHandle !== null) {
            return;
        }

        this.pendingPaletteSwitchHandle = window.requestAnimationFrame(() => {
            this.pendingPaletteSwitchHandle = null;
            this.setPaletteMode('custom');
        });
    }

    private handleCustomDrop(targetIndex: number, dragData: PaletteDragData): void {
        if (this.paletteMode !== 'custom') {
            return;
        }

        if (targetIndex < 0 || targetIndex >= USER_COLOR_SLOT_COUNT) {
            return;
        }

        const normalized = this.normalizeHexColor(dragData.color);
        if (!normalized) {
            return;
        }

        this.sharedState.customColors[targetIndex] = normalized;
        this.activeCustomColorIndex = targetIndex;
        this.markCustomColorsDirty();
        this.renderUserColors();
        this.updatePresetButtonsVisibility();
        this.updateFromHex(normalized, { syncInput: true });
    }

    private handleSwatchDoubleClick(color: string): void {
        this.updateFromHex(color, { syncInput: true });
        void this.onCommitRequested?.();
    }

    private setPaletteMode(mode: PaletteMode): void {
        if (this.paletteMode === mode) {
            return;
        }

        this.paletteMode = mode;
        ColorPickerSurface.setLastPaletteMode(mode);
        if (mode === 'custom') {
            this.activeCustomColorIndex = this.findCustomColorIndex(this.selectedColor);
        } else {
            this.activeDefaultColorIndex = this.findDefaultColorIndex(this.selectedColor);
        }

        this.updatePaletteToggleState();
        this.renderUserColors();
        this.updatePresetButtonsVisibility();
    }

    private updatePaletteToggleState(): void {
        const isDefault = this.paletteMode === 'default';
        if (this.paletteToggleDefault) {
            this.paletteToggleDefault.toggleClass('nn-preset-toggle-active', isDefault);
        }
        if (this.paletteToggleCustom) {
            this.paletteToggleCustom.toggleClass('nn-preset-toggle-active', !isDefault);
        }
    }

    private updatePresetButtonsVisibility(): void {
        const showCustomActions = this.paletteMode === 'custom';
        const hasActiveSelection =
            (this.paletteMode === 'custom' && this.activeCustomColorIndex !== null) ||
            (this.paletteMode === 'default' && this.activeDefaultColorIndex !== null);
        const hasActiveCustom = this.activeCustomColorIndex !== null && this.paletteMode === 'custom';

        if (this.copyColorsButton) {
            this.copyColorsButton.removeClass('nn-preset-action-hidden');
            this.copyColorsButton.toggleAttribute('disabled', !hasActiveSelection);
            this.copyColorsButton.toggleClass('nn-preset-action-disabled', !hasActiveSelection);
        }
        if (this.pasteColorsButton) {
            this.pasteColorsButton.toggleClass('nn-preset-action-hidden', !showCustomActions);
            this.pasteColorsButton.toggleAttribute('disabled', !hasActiveCustom);
            this.pasteColorsButton.toggleClass('nn-preset-action-disabled', !hasActiveCustom);
        }
        if (this.clearCustomColorsButton) {
            this.clearCustomColorsButton.toggleClass('nn-preset-action-hidden', !showCustomActions);
        }
    }

    private confirmClearCustomColors(): void {
        const modal = new ConfirmModal(
            this.app,
            strings.modals.colorPicker.resetUserColors,
            strings.modals.colorPicker.clearCustomColorsConfirm,
            () => this.clearCustomColors(),
            strings.common.clear
        );
        modal.open();
    }

    private clearCustomColors(): void {
        this.sharedState.customColors.splice(0, this.sharedState.customColors.length, ...DEFAULT_CUSTOM_COLORS);
        this.activeCustomColorIndex = null;
        if (this.paletteMode === 'custom') {
            this.renderUserColors();
            this.updatePresetButtonsVisibility();
        }
        this.markCustomColorsDirty();
    }

    private async copySelectedColor(): Promise<void> {
        const activeColor = this.getActiveColor();
        if (!activeColor) {
            return;
        }

        const normalized = this.normalizeHexColor(activeColor);
        if (!normalized) {
            return;
        }

        const hexWithoutHash = normalized.startsWith('#') ? normalized.substring(1) : normalized;
        try {
            await navigator.clipboard.writeText(hexWithoutHash);
            showNotice(strings.modals.colorPicker.colorsCopied, { variant: 'success' });
        } catch {
            showNotice(strings.common.clipboardWriteError, { variant: 'warning' });
        }
    }

    private async pasteSelectedColor(): Promise<void> {
        if (this.activeCustomColorIndex === null || this.paletteMode !== 'custom') {
            return;
        }

        let text: string;
        try {
            text = await navigator.clipboard.readText();
        } catch {
            showNotice(strings.modals.colorPicker.pasteClipboardError, { variant: 'warning' });
            return;
        }

        const sanitized = this.sanitizeHexInput(text.trim());
        if (sanitized.length !== 6 && sanitized.length !== 8) {
            showNotice(strings.modals.colorPicker.pasteInvalidFormat, { variant: 'warning' });
            return;
        }

        const normalized = this.normalizeHexColor(`#${sanitized}`);
        if (!normalized) {
            showNotice(strings.modals.colorPicker.pasteInvalidFormat, { variant: 'warning' });
            return;
        }

        this.sharedState.customColors[this.activeCustomColorIndex] = normalized;
        this.markCustomColorsDirty();
        this.updateFromHex(normalized, { syncInput: true });
        this.renderUserColors();
        showNotice(strings.modals.colorPicker.colorsPasted, { variant: 'success' });
    }

    private getActiveColor(): string | null {
        if (this.paletteMode === 'custom') {
            if (this.activeCustomColorIndex === null) {
                return null;
            }
            return this.sharedState.customColors[this.activeCustomColorIndex];
        }

        if (this.activeDefaultColorIndex === null) {
            return null;
        }

        return this.defaultColors[this.activeDefaultColorIndex];
    }

    private updateActiveCustomColor(color: string): void {
        if (this.paletteMode !== 'custom') {
            return;
        }

        if (this.activeCustomColorIndex === null) {
            return;
        }

        const slotIndex = this.activeCustomColorIndex;
        if (this.sharedState.customColors[slotIndex] === color) {
            return;
        }

        this.sharedState.customColors[slotIndex] = color;
        const swatch = this.userColorDots[slotIndex];
        if (swatch) {
            this.applySwatchColor(swatch, color);
            swatch.setAttribute('data-color', color);
            swatch.removeClass('nn-color-empty');
        }
        this.markCustomColorsDirty();
    }

    private markCustomColorsDirty(): void {
        this.sharedState.customColorsDirty = true;
    }

    private applySwatchColor(element: HTMLElement, color: string): void {
        element.classList.remove('nn-no-color');
        const wantsCheckerboard = element.hasClass('nn-show-checkerboard');

        element.addClass('nn-color-swatch');
        element.style.setProperty('--nn-color-swatch-color', color);

        if (wantsCheckerboard) {
            element.addClass('nn-checkerboard');
        } else {
            element.removeClass('nn-checkerboard');
        }
    }

    private renderSelectedSwatch(): void {
        if (!this.previewNew) {
            return;
        }

        if (this.cleared) {
            this.previewNew.addClass('nn-no-color');
            this.previewNew.removeClass('nn-color-swatch');
            this.previewNew.style.removeProperty('--nn-color-swatch-color');
            return;
        }

        this.previewNew.removeClass('nn-no-color');
        this.applySwatchColor(this.previewNew, this.selectedColor);
    }

    private updateFromHex(
        hex: string,
        { syncInput = true, notify = true, fromHsv = false }: { syncInput?: boolean; notify?: boolean; fromHsv?: boolean } = {}
    ): void {
        this.isUpdating = true;
        let normalizedHex: string | null = null;
        const rgba = this.hexToRgba(hex);
        if (rgba) {
            normalizedHex = this.rgbaToHex(rgba);
            this.selectedColor = normalizedHex;

            // When the change comes from the H/S/V controls those values are already authoritative.
            // Re-deriving them from the hex would round-trip through 8-bit RGB and drift the hue thumb.
            if (!fromHsv) {
                this.alpha = rgba.a;

                const hsv = this.rgbToHsv(rgba);
                if (hsv.s > 0 && hsv.v > 0) {
                    this.hue = hsv.h;
                }
                this.saturation = hsv.s;
                this.value = hsv.v;
            }

            this.cleared = false;
            this.renderSelectedSwatch();
            if (syncInput) {
                this.hexInput.value = normalizedHex.substring(1);
            }

            this.renderColorControls();
        }

        this.isUpdating = false;

        if (normalizedHex) {
            this.updateActiveCustomColor(normalizedHex);
            if (notify && !this.isBuilding) {
                this.onChange?.(normalizedHex);
            }
        }
    }

    private commitHsvColor(): void {
        if (this.isUpdating) {
            return;
        }
        this.updateFromHex(this.composeHsvColor(), { syncInput: true, fromHsv: true });
    }

    private composeHsvColor(): string {
        const rgb = this.hsvToRgb(this.hue, this.saturation, this.value);
        return this.rgbaToHex({ ...rgb, a: this.alpha });
    }

    private renderColorControls(): void {
        if (!this.svArea) {
            return;
        }

        const pureHue = this.rgbaToHex({ ...this.hsvToRgb(this.hue, 1, 1), a: 255 });
        const opaque = this.rgbaToHex({ ...this.hsvToRgb(this.hue, this.saturation, this.value), a: 255 });

        this.svArea.style.setProperty('--nn-sv-hue', pureHue);
        this.svThumb.style.left = this.formatThumbPosition(this.saturation);
        this.svThumb.style.top = this.formatThumbPosition(1 - this.value);
        this.svThumb.style.setProperty('--nn-thumb-color', opaque);

        this.hueThumb.style.left = this.formatThumbPosition(this.hue / 360);

        this.alphaSlider.style.setProperty('--nn-alpha-color', opaque);
        this.alphaThumb.style.left = this.formatThumbPosition(this.alpha / 255);
    }

    private formatThumbPosition(fraction: number): string {
        const clamped = Math.max(0, Math.min(1, fraction));
        return `calc(${clamped * 100}% + ${8 - clamped * 16}px)`;
    }

    private rgbToHsv({ r, g, b }: RGBAValues): HSVValues {
        const red = r / 255;
        const green = g / 255;
        const blue = b / 255;
        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);
        const delta = max - min;

        let h = 0;
        if (delta !== 0) {
            if (max === red) {
                h = ((green - blue) / delta) % 6;
            } else if (max === green) {
                h = (blue - red) / delta + 2;
            } else {
                h = (red - green) / delta + 4;
            }
            h *= 60;
            if (h < 0) {
                h += 360;
            }
        }

        const s = max === 0 ? 0 : delta / max;
        return { h, s, v: max };
    }

    private hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
        const chroma = v * s;
        const sector = (((h % 360) + 360) % 360) / 60;
        const x = chroma * (1 - Math.abs((sector % 2) - 1));
        const m = v - chroma;

        let r1 = 0;
        let g1 = 0;
        let b1 = 0;
        if (sector < 1) {
            r1 = chroma;
            g1 = x;
        } else if (sector < 2) {
            r1 = x;
            g1 = chroma;
        } else if (sector < 3) {
            g1 = chroma;
            b1 = x;
        } else if (sector < 4) {
            g1 = x;
            b1 = chroma;
        } else if (sector < 5) {
            r1 = x;
            b1 = chroma;
        } else {
            r1 = chroma;
            b1 = x;
        }

        return {
            r: Math.round((r1 + m) * 255),
            g: Math.round((g1 + m) * 255),
            b: Math.round((b1 + m) * 255)
        };
    }

    private hexToRgba(hex: string): RGBAValues | null {
        return ColorPickerSurface.hexToRgba(hex);
    }

    private rgbaToHex(color: RGBAValues): string {
        return ColorPickerSurface.rgbaToHex(color);
    }

    private normalizeHexColor(color: string | null | undefined): string | null {
        return ColorPickerSurface.normalizeHexColor(color);
    }

    private parseColorString(color: string): RGBAValues | null {
        return ColorPickerSurface.parseColorString(color);
    }

    private sanitizeHexInput(input: string): string {
        return input.replace(/[^0-9A-Fa-f]/g, '').slice(0, 8);
    }

    private saveToRecentColors(color: string): void {
        const isPaletteColor =
            this.defaultColors.some(defaultColor => defaultColor === color) ||
            this.sharedState.customColors.some(customColor => customColor === color);
        if (isPaletteColor) {
            return;
        }

        let recentColors = this.getRecentColors();
        recentColors = recentColors.filter(c => c !== color);
        recentColors.unshift(color);
        recentColors = recentColors.slice(0, MAX_RECENT_COLORS);
        this.saveRecentColors(recentColors);
    }
}
