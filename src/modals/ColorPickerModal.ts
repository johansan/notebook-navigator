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

import { App, Modal, Scope, setIcon } from 'obsidian';
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
import { createDragGhostManager, type DragGhostManager } from '../utils/dragGhost';
import { ConfirmModal } from './ConfirmModal';

const DEFAULT_COLOR = '#3b82f6';

type RGBAValues = { r: number; g: number; b: number; a: number };

type HSVValues = { h: number; s: number; v: number };

/** Palette display mode: default (read-only preset colors) or custom (user-editable colors) */
type PaletteMode = 'default' | 'custom';

interface PaletteDragData {
    color: string;
}

export interface ColorPickerModalParams {
    title: string;
    initialColor: string | null;
    settingsProvider: ISettingsProvider;
    onChooseColor: (color: string | null) => void | Promise<void>;
}

/**
 * Color picker modal with advanced features
 * - Hex input field
 * - RGB sliders
 * - Recently used colors
 * - Preset color palette
 * - Real-time preview
 */
export class ColorPickerModal extends Modal {
    private static lastPaletteMode: PaletteMode = 'default';
    private title: string;
    private settingsProvider: ISettingsProvider;
    private chooseColorHandler: (color: string | null) => void | Promise<void>;
    private currentColor: string | null = null;
    private selectedColor: string = DEFAULT_COLOR;
    private hexInput!: HTMLInputElement;
    private previewCurrent!: HTMLDivElement;
    private previewNew!: HTMLDivElement;
    private svArea!: HTMLDivElement;
    private svThumb!: HTMLDivElement;
    private hueSlider!: HTMLDivElement;
    private hueThumb!: HTMLDivElement;
    private alphaSlider!: HTMLDivElement;
    private alphaThumb!: HTMLDivElement;
    // HSV/alpha working state for the visual picker. Hue is preserved across
    // achromatic colors so dragging brightness/saturation to gray and back keeps it.
    private hue = 0;
    private saturation = 0;
    private value = 0;
    private alpha = 255;
    private recentColorsContainer!: HTMLDivElement;
    private userColorsContainer!: HTMLDivElement;
    private userColorDots: HTMLDivElement[] = [];
    private defaultColors: string[] = [...DEFAULT_USER_COLORS];
    private customColors: string[] = [];
    private paletteMode: PaletteMode = 'default';
    private activeDefaultColorIndex: number | null = null;
    private activeCustomColorIndex: number | null = null;
    private customColorsDirty = false;
    private copyColorsButton!: HTMLButtonElement;
    private pasteColorsButton!: HTMLButtonElement;
    private clearCustomColorsButton!: HTMLButtonElement;
    private paletteToggleDefault!: HTMLElement;
    private paletteToggleCustom!: HTMLElement;
    private paletteDisposers: (() => void)[] = [];
    private recentColorDisposers: (() => void)[] = [];
    private isUpdating = false;
    private domDisposers: (() => void)[] = [];
    private dragGhostManager: DragGhostManager;
    private pendingPaletteSwitchHandle: number | null = null;
    // Embedded mode: the picker surface is hosted inside another modal (AppearanceModal).
    // In this mode there is no header or Apply/Cancel footer, and the host commits the value.
    private embedded = false;
    private onUserEdit?: () => void;
    private cleared = false;
    // True only while building the initial UI, so the first programmatic color
    // load is not mistaken for a user edit.
    private building = false;
    private touched = false;

    /** Returns the last used palette mode across modal instances */
    public static getLastPaletteMode(): PaletteMode {
        return ColorPickerModal.lastPaletteMode;
    }

    /** Persists the palette mode selection for subsequent modal openings */
    public static setLastPaletteMode(mode: PaletteMode) {
        ColorPickerModal.lastPaletteMode = mode;
    }

    /**
     * Creates a new color picker modal
     * @param app - The Obsidian app instance
     * @param params - Color picker configuration
     */
    constructor(app: App, params: ColorPickerModalParams) {
        super(app);
        this.title = params.title;
        this.settingsProvider = params.settingsProvider;
        this.chooseColorHandler = params.onChooseColor;
        this.dragGhostManager = createDragGhostManager();

        this.customColors = [];
        this.paletteMode = ColorPickerModal.getLastPaletteMode();

        const initialColor = params.initialColor;
        if (initialColor) {
            this.currentColor = initialColor;
            const parsedInitial = this.parseColorString(initialColor);
            if (parsedInitial) {
                this.selectedColor = this.rgbaToHex(parsedInitial);
                return;
            }
        }

        // Default starting color when no stored value is found or parsing failed
        this.selectedColor = DEFAULT_COLOR;
    }

    /**
     * Called when the modal is opened
     */
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        this.modalEl.addClass('nn-color-picker-modal');

        // Header showing the item name
        const header = contentEl.createDiv('nn-color-picker-header');
        header.createEl('h3', { text: this.title });

        this.attachCloseButtonHandler();

        this.buildPickerInto(contentEl, this.scope);

        // Action buttons
        const buttonContainer = contentEl.createDiv('nn-color-button-container');

        // Cancel/restore button
        const restoreDefaultText = strings.common.restoreDefault;
        const cancelRemoveButton = buttonContainer.createEl('button', {
            text: this.currentColor ? restoreDefaultText : strings.common.cancel
        });
        this.domDisposers.push(
            addAsyncEventListener(cancelRemoveButton, 'click', () => {
                if (this.currentColor) {
                    return this.restoreDefaultColor();
                }
                this.close();
                return undefined;
            })
        );

        // Apply color button
        const applyButton = buttonContainer.createEl('button', {
            text: strings.modals.colorPicker.apply,
            cls: 'mod-cta'
        });
        this.domDisposers.push(addAsyncEventListener(applyButton, 'click', () => this.applyColor()));
    }

    /**
     * Mounts the color editing surface into an external container (used by AppearanceModal).
     * No header or Apply/Cancel footer is created; the host commits the value via getColor().
     */
    mountInto(container: HTMLElement, scope: Scope, options: { onUserEdit?: () => void } = {}) {
        this.embedded = true;
        this.onUserEdit = options.onUserEdit;
        this.buildPickerInto(container, scope);
    }

    /** Returns true if the user has changed the color since mounting (embedded mode) */
    isTouched(): boolean {
        return this.touched;
    }

    /**
     * Builds the color editing surface (preview, palette, picker area, hex, recent) into a container.
     */
    private buildPickerInto(root: HTMLElement, scope: Scope) {
        this.building = true;
        // Two-column layout
        const mainContent = root.createDiv('nn-color-picker-content');

        // Left column
        const leftColumn = mainContent.createDiv('nn-color-picker-left');

        // Color preview section
        const previewSection = leftColumn.createDiv('nn-color-preview-section');
        const previewContainer = previewSection.createDiv('nn-color-preview-container');

        const currentSection = previewContainer.createDiv('nn-preview-current');
        currentSection.createSpan({ text: strings.modals.colorPicker.currentColor, cls: 'nn-preview-label' });
        this.previewCurrent = currentSection.createDiv('nn-preview-color');
        if (this.currentColor) {
            this.applySwatchColor(this.previewCurrent, this.currentColor);
        } else {
            this.previewCurrent.addClass('nn-no-color');
        }
        this.makeSwatchDraggable(this.previewCurrent, () => this.currentColor, this.domDisposers);
        this.domDisposers.push(
            addAsyncEventListener(this.previewCurrent, 'click', () => {
                const normalized = this.normalizeHexColor(this.currentColor);
                if (!normalized) {
                    return;
                }
                this.updateFromHex(normalized);
            })
        );
        this.domDisposers.push(
            addAsyncEventListener(this.previewCurrent, 'dblclick', () => {
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
        this.previewNew = newSection.createDiv('nn-preview-color nn-show-checkerboard');
        this.applySwatchColor(this.previewNew, this.selectedColor);
        this.makeSwatchDraggable(this.previewNew, () => this.selectedColor, this.domDisposers);

        // User colors section
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

        // Right column
        const rightColumn = mainContent.createDiv('nn-color-picker-right');

        // Hex input section
        const hexSection = rightColumn.createDiv('nn-hex-section');
        hexSection.createEl('label', { text: strings.modals.colorPicker.hexLabel, cls: 'nn-hex-title' });
        const hexContainer = hexSection.createDiv('nn-hex-container');
        hexContainer.createSpan({ text: '#', cls: 'nn-hex-label' });
        this.hexInput = hexContainer.createEl('input', {
            type: 'text',
            cls: 'nn-hex-input',
            value: this.selectedColor.substring(1),
            attr: {
                'aria-label': 'Hex color value',
                maxlength: '8',
                placeholder: 'RRGGBB or RRGGBBAA'
            }
        });
        this.hexInput.setAttribute('enterkeyhint', 'done');

        // Visual color picker: 2D saturation/brightness area plus hue and alpha sliders
        const colorAreaSection = rightColumn.createDiv('nn-color-area-section');

        this.svArea = colorAreaSection.createDiv('nn-sv-area');
        this.svArea.setAttribute('aria-label', strings.modals.colorPicker.saturationValueArea);
        this.svThumb = this.svArea.createDiv('nn-sv-thumb');
        this.attachPointerArea(
            this.svArea,
            (x, y) => {
                this.saturation = x;
                this.value = 1 - y;
                this.commitHsvColor();
            },
            this.domDisposers
        );

        this.hueSlider = colorAreaSection.createDiv('nn-color-slider nn-hue-slider');
        this.hueSlider.setAttribute('aria-label', strings.modals.colorPicker.hueSlider);
        this.hueThumb = this.hueSlider.createDiv('nn-slider-thumb');
        this.attachPointerArea(
            this.hueSlider,
            x => {
                this.hue = x * 360;
                this.commitHsvColor();
            },
            this.domDisposers
        );

        this.alphaSlider = colorAreaSection.createDiv('nn-color-slider nn-alpha-slider nn-checkerboard');
        this.alphaSlider.setAttribute('aria-label', strings.modals.colorPicker.alphaSlider);
        this.alphaSlider.createDiv('nn-alpha-gradient');
        this.alphaThumb = this.alphaSlider.createDiv('nn-slider-thumb');
        this.attachPointerArea(
            this.alphaSlider,
            x => {
                this.alpha = Math.round(x * 255);
                this.commitHsvColor();
            },
            this.domDisposers
        );

        // Recent colors section
        const recentSection = rightColumn.createDiv('nn-recent-section');
        const recentHeader = recentSection.createDiv('nn-recent-header');
        recentHeader.createDiv({ text: strings.modals.colorPicker.recentColors, cls: 'nn-section-label' });

        // Clear button
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

        // Set up event handlers
        this.registerKeyboardShortcuts(scope);
        this.loadRecentColors();
        this.loadCustomColors();
        this.updatePaletteToggleState();
        this.renderUserColors();
        this.updatePresetButtonsVisibility();
        this.updateFromHex(this.selectedColor);
        this.building = false;

        // Hex input real-time validation and update
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

    /** Returns the currently selected color as a hex string */
    getColor(): string {
        return this.selectedColor;
    }

    /** Marks the value for removal when the host commits */
    markCleared(): void {
        this.cleared = true;
    }

    /** Returns true if the value has been flagged for removal */
    isCleared(): boolean {
        return this.cleared;
    }

    /** Persists the current color into the recent colors history */
    commitRecentColor(): void {
        this.saveToRecentColors(this.selectedColor);
    }

    /**
     * Releases listeners and persists pending custom-palette edits.
     * Shared by standalone onClose and the embedding host.
     */
    detach(): void {
        if (this.customColorsDirty) {
            this.settingsProvider.settings.userColors = [...this.customColors];
            runAsyncAction(() => this.settingsProvider.saveSettingsAndUpdate());
            this.customColorsDirty = false;
        }
        // Cleanup DOM listeners
        this.disposePaletteListeners();
        this.disposeRecentColorListeners();
        if (this.domDisposers.length) {
            this.domDisposers.forEach(dispose => {
                try {
                    dispose();
                } catch (e) {
                    console.error('Error disposing color picker listener:', e);
                }
            });
            this.domDisposers = [];
        }
        this.dragGhostManager.hideGhost();
        if (this.pendingPaletteSwitchHandle !== null) {
            window.cancelAnimationFrame(this.pendingPaletteSwitchHandle);
            this.pendingPaletteSwitchHandle = null;
        }
    }

    /**
     * Called when the modal is closed
     */
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
        this.modalEl.removeClass('nn-color-picker-modal');
        this.detach();
    }

    // Attaches event handlers to the modal close button to ensure proper modal closure
    private attachCloseButtonHandler() {
        const closeButton = this.modalEl.querySelector<HTMLElement>('.modal-close-button');
        if (!closeButton) {
            return;
        }

        const handleClose = (event: Event) => {
            event.preventDefault();
            this.close();
        };

        // Close modal on click or pointer down
        this.domDisposers.push(addAsyncEventListener(closeButton, 'click', handleClose));
        this.domDisposers.push(addAsyncEventListener(closeButton, 'pointerdown', handleClose));
    }

    /**
     * Attaches pointer drag handling to a track element, emitting normalized
     * [0,1] coordinates on press and drag. Pointer capture keeps the drag alive
     * even when the cursor leaves the element.
     */
    private attachPointerArea(
        element: HTMLElement,
        onChange: (xRatio: number, yRatio: number) => void,
        disposers: (() => void)[]
    ) {
        let dragging = false;

        const emit = (event: PointerEvent) => {
            const rect = element.getBoundingClientRect();
            const x = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
            const y = rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0;
            onChange(Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y)));
        };

        const stop = (event: PointerEvent) => {
            if (!dragging) {
                return;
            }
            dragging = false;
            if (element.hasPointerCapture(event.pointerId)) {
                element.releasePointerCapture(event.pointerId);
            }
        };

        disposers.push(
            addAsyncEventListener(element, 'pointerdown', event => {
                dragging = true;
                element.setPointerCapture(event.pointerId);
                event.preventDefault();
                emit(event);
            })
        );
        disposers.push(
            addAsyncEventListener(element, 'pointermove', event => {
                if (dragging) {
                    emit(event);
                }
            })
        );
        disposers.push(addAsyncEventListener(element, 'pointerup', stop));
        disposers.push(addAsyncEventListener(element, 'pointercancel', stop));
    }

    /**
     * Register keyboard shortcuts for the modal
     */
    private registerKeyboardShortcuts(scope: Scope) {
        scope.register([], 'Enter', event => {
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

    /**
     * Load and display recently used colors
     */
    private loadRecentColors() {
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
            // Remove recent color with event suppression
            this.recentColorDisposers.push(
                addAsyncEventListener(removeButton, 'click', event => {
                    event.stopPropagation();
                    event.preventDefault();
                    this.removeRecentColor(index);
                })
            );
        });

        // Fill empty slots
        for (let i = recentColors.length; i < MAX_RECENT_COLORS; i++) {
            this.recentColorsContainer.createDiv('nn-color-dot nn-color-empty');
        }
    }

    /**
     * Clear all recently used colors
     */
    private clearRecentColors() {
        this.saveRecentColors([]);
        this.loadRecentColors();
    }

    /**
     * Remove a single recently used color by index
     */
    private removeRecentColor(index: number) {
        const recentColors = this.getRecentColors();
        if (index < 0 || index >= recentColors.length) {
            return;
        }

        recentColors.splice(index, 1);
        this.saveRecentColors(recentColors);
        this.loadRecentColors();
    }

    /**
     * Load user color palette
     */
    private loadCustomColors() {
        this.customColors = this.getNormalizedCustomColors();
        this.activeDefaultColorIndex = this.findDefaultColorIndex(this.selectedColor);
        this.activeCustomColorIndex = this.findCustomColorIndex(this.selectedColor);
    }

    /**
     * Renders color swatches for the current palette mode
     */
    private renderUserColors() {
        this.disposePaletteListeners();
        this.userColorsContainer.empty();
        this.userColorDots = [];

        const colors = this.paletteMode === 'default' ? this.defaultColors : this.customColors;
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

            const dispose = addAsyncEventListener(dot, 'click', () => {
                const paletteColor =
                    this.paletteMode === 'default' ? this.defaultColors[index] : (this.customColors[index] ?? DEFAULT_CUSTOM_COLOR);
                const nextColor = this.normalizeHexColor(paletteColor) ?? DEFAULT_CUSTOM_COLOR;
                this.handlePaletteColorClick(index, nextColor);
            });
            this.paletteDisposers.push(dispose);

            const doubleClickDispose = addAsyncEventListener(dot, 'dblclick', () => {
                const paletteColor =
                    this.paletteMode === 'default' ? this.defaultColors[index] : (this.customColors[index] ?? DEFAULT_CUSTOM_COLOR);
                const nextColor = this.normalizeHexColor(paletteColor) ?? DEFAULT_CUSTOM_COLOR;
                this.handlePaletteColorDoubleClick(index, nextColor);
            });
            this.paletteDisposers.push(doubleClickDispose);
        });
    }

    /**
     * Registers drag-and-drop handlers for a custom palette swatch
     */
    private registerCustomDropTarget(element: HTMLElement, index: number) {
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
                this.dragGhostManager.hideGhost();
                this.handleCustomDrop(index, dragData);
            })
        );
    }

    /**
     * Updates the selection highlight on palette color swatches
     */
    private updatePaletteSelection() {
        const activeIndex = this.paletteMode === 'custom' ? this.activeCustomColorIndex : this.activeDefaultColorIndex;
        this.userColorDots.forEach((dot, dotIndex) => {
            dot.toggleClass('nn-user-color-selected', dotIndex === activeIndex);
        });
        this.updatePresetButtonsVisibility();
    }

    /**
     * Handles click on a palette color swatch, toggling selection or applying color
     */
    private handlePaletteColorClick(index: number, color: string | null) {
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

    /**
     * Handles double-click on a palette swatch to select and apply color
     */
    private handlePaletteColorDoubleClick(index: number, color: string | null) {
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

    /**
     * Loads custom colors from settings, merging with defaults for empty slots
     */
    private getNormalizedCustomColors(): string[] {
        const storedColors = this.settingsProvider.settings.userColors ?? [];
        const colors: string[] = [...DEFAULT_CUSTOM_COLORS];

        for (let i = 0; i < USER_COLOR_SLOT_COUNT; i++) {
            const normalized = this.normalizeHexColor(storedColors[i]);
            if (normalized) {
                colors[i] = normalized;
            }
        }

        return colors;
    }

    /**
     * Finds the index of a color in the default palette
     */
    private findDefaultColorIndex(color: string | null): number | null {
        const normalized = this.normalizeHexColor(color);
        if (!normalized) {
            return null;
        }

        const index = this.defaultColors.findIndex(defaultColor => defaultColor === normalized);
        if (index === -1) {
            return null;
        }

        return index;
    }

    /**
     * Finds the index of a color in the custom palette
     */
    private findCustomColorIndex(color: string | null): number | null {
        const normalized = this.normalizeHexColor(color);
        if (!normalized) {
            return null;
        }

        const index = this.customColors.findIndex(customColor => customColor === normalized);
        if (index === -1) {
            return null;
        }

        return index;
    }

    /**
     * Removes all palette swatch click listeners
     */
    private disposePaletteListeners() {
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

    /**
     * Removes all recent color swatch event listeners
     */
    private disposeRecentColorListeners() {
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

    /**
     * Configures a color swatch element for drag operations
     */
    private makeSwatchDraggable(element: HTMLElement, getColor: () => string | null, disposers: (() => void)[] = this.domDisposers) {
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

            this.dragGhostManager.hideNativePreview(event);
            this.dragGhostManager.showGhost(event, {
                customElement: this.createDragPreview(color),
                cursorOffset: { x: 12, y: 12 },
                itemType: null
            });

            this.ensureCustomPaletteVisibleForDrag();
        });
        const dragEndDispose = addAsyncEventListener(element, 'dragend', () => {
            this.dragGhostManager.hideGhost();
        });
        disposers.push(dragEndDispose);
        disposers.push(dispose);
    }

    /**
     * Extracts color data from a drag event's data transfer
     */
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

    /**
     * Parses and validates a JSON-encoded drag payload string
     */
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

    /**
     * Creates a circular canvas element for the drag preview
     */
    private createDragPreview(color: string): HTMLElement {
        const size = 36;
        const canvas = createEl('canvas');
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

    /**
     * Switches to custom palette mode when a drag operation starts
     */
    private ensureCustomPaletteVisibleForDrag() {
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

    /**
     * Applies a dropped color to a custom palette slot
     */
    private handleCustomDrop(targetIndex: number, dragData: PaletteDragData) {
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

        this.customColors[targetIndex] = normalized;
        this.activeCustomColorIndex = targetIndex;
        this.markCustomColorsDirty();
        this.renderUserColors();
        this.updatePresetButtonsVisibility();
        this.updateFromHex(normalized, { syncInput: true });
        this.dragGhostManager.hideGhost();
    }

    /**
     * Selects a color and applies it immediately
     */
    private handleSwatchDoubleClick(color: string) {
        this.updateFromHex(color, { syncInput: true });
        void this.applyColor();
    }

    /**
     * Switches between default and custom palette modes
     */
    private setPaletteMode(mode: PaletteMode) {
        if (this.paletteMode === mode) {
            return;
        }

        this.paletteMode = mode;
        ColorPickerModal.setLastPaletteMode(mode);
        if (mode === 'custom') {
            this.activeCustomColorIndex = this.findCustomColorIndex(this.selectedColor);
        } else {
            this.activeDefaultColorIndex = this.findDefaultColorIndex(this.selectedColor);
        }

        this.updatePaletteToggleState();
        this.renderUserColors();
        this.updatePresetButtonsVisibility();
    }

    /**
     * Updates the active state of palette toggle labels
     */
    private updatePaletteToggleState() {
        const isDefault = this.paletteMode === 'default';
        if (this.paletteToggleDefault) {
            this.paletteToggleDefault.toggleClass('nn-preset-toggle-active', isDefault);
        }
        if (this.paletteToggleCustom) {
            this.paletteToggleCustom.toggleClass('nn-preset-toggle-active', !isDefault);
        }
    }

    /**
     * Shows or hides palette action buttons based on mode and selection state
     */
    private updatePresetButtonsVisibility() {
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

    /**
     * Opens confirmation dialog before clearing custom colors
     */
    private confirmClearCustomColors() {
        const modal = new ConfirmModal(
            this.app,
            strings.modals.colorPicker.resetUserColors,
            strings.modals.colorPicker.clearCustomColorsConfirm,
            () => this.clearCustomColors(),
            strings.common.clear
        );
        modal.open();
    }

    /**
     * Resets custom colors to defaults
     */
    private clearCustomColors() {
        this.customColors = [...DEFAULT_CUSTOM_COLORS];
        this.activeCustomColorIndex = null;
        if (this.paletteMode === 'custom') {
            this.renderUserColors();
            this.updatePresetButtonsVisibility();
        }
        this.markCustomColorsDirty();
    }

    /**
     * Copies the currently selected palette color to clipboard
     */
    private async copySelectedColor() {
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

    /**
     * Pastes a color from clipboard into the selected custom color slot
     */
    private async pasteSelectedColor() {
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

        this.customColors[this.activeCustomColorIndex] = normalized;
        this.markCustomColorsDirty();
        this.updateFromHex(normalized, { syncInput: true });
        this.renderUserColors();
        showNotice(strings.modals.colorPicker.colorsPasted, { variant: 'success' });
    }

    /**
     * Returns the color value of the currently selected palette slot
     */
    private getActiveColor(): string | null {
        if (this.paletteMode === 'custom') {
            if (this.activeCustomColorIndex === null) {
                return null;
            }
            return this.customColors[this.activeCustomColorIndex];
        }

        if (this.activeDefaultColorIndex === null) {
            return null;
        }

        return this.defaultColors[this.activeDefaultColorIndex];
    }

    /**
     * Converts a color string to normalized hex format
     */
    private normalizeHexColor(color: string | null | undefined): string | null {
        if (!color) {
            return null;
        }

        const parsed = this.parseColorString(color);
        if (!parsed) {
            return null;
        }

        return this.rgbaToHex(parsed);
    }

    /**
     * Updates the selected custom color slot with the current color value
     */
    private updateActiveCustomColor(color: string) {
        if (this.paletteMode !== 'custom') {
            return;
        }

        if (this.activeCustomColorIndex === null) {
            return;
        }

        const slotIndex = this.activeCustomColorIndex;
        if (this.customColors[slotIndex] === color) {
            return;
        }

        this.customColors[slotIndex] = color;
        const swatch = this.userColorDots[slotIndex];
        if (swatch) {
            this.applySwatchColor(swatch, color);
            swatch.setAttribute('data-color', color);
            swatch.removeClass('nn-color-empty');
        }
        this.markCustomColorsDirty();
    }

    /**
     * Marks custom colors as modified for persistence on close
     */
    private markCustomColorsDirty() {
        this.customColorsDirty = true;
    }

    /**
     * Apply swatch background and transparency indicator
     */
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

    /**
     * Update all controls from hex value
     */
    private updateFromHex(hex: string, { syncInput = true }: { syncInput?: boolean } = {}) {
        this.isUpdating = true;
        let normalizedHex: string | null = null;
        const rgba = this.hexToRgba(hex);
        if (rgba) {
            normalizedHex = this.rgbaToHex(rgba);
            this.selectedColor = normalizedHex;
            this.alpha = rgba.a;

            const hsv = this.rgbToHsv(rgba);
            // Keep the previous hue for grayscale colors so the hue slider doesn't jump
            if (hsv.s > 0 && hsv.v > 0) {
                this.hue = hsv.h;
            }
            this.saturation = hsv.s;
            this.value = hsv.v;

            this.applySwatchColor(this.previewNew, normalizedHex);
            if (syncInput) {
                this.hexInput.value = normalizedHex.substring(1);
            }

            this.renderColorControls();
        }

        this.isUpdating = false;

        if (normalizedHex) {
            this.updateActiveCustomColor(normalizedHex);
            // A user-driven color change un-marks pending removal and notifies the host.
            // The initial programmatic load (building) must not count as a user edit.
            if (this.embedded && !this.building) {
                this.cleared = false;
                this.touched = true;
                this.onUserEdit?.();
            }
        }
    }

    /**
     * Builds a hex color from the current HSV/alpha state and applies it
     */
    private commitHsvColor() {
        if (this.isUpdating) {
            return;
        }
        this.updateFromHex(this.composeHsvColor(), { syncInput: true });
    }

    /**
     * Combines current hue, saturation, value and alpha into a hex string
     */
    private composeHsvColor(): string {
        const rgb = this.hsvToRgb(this.hue, this.saturation, this.value);
        return this.rgbaToHex({ ...rgb, a: this.alpha });
    }

    /**
     * Positions the picker thumbs and refreshes the gradients to match current state
     */
    private renderColorControls() {
        if (!this.svArea) {
            return;
        }

        const pureHue = this.rgbaToHex({ ...this.hsvToRgb(this.hue, 1, 1), a: 255 });
        const opaque = this.rgbaToHex({ ...this.hsvToRgb(this.hue, this.saturation, this.value), a: 255 });

        this.svArea.style.setProperty('--nn-sv-hue', pureHue);
        this.svThumb.style.left = `${this.saturation * 100}%`;
        this.svThumb.style.top = `${(1 - this.value) * 100}%`;
        this.svThumb.style.setProperty('--nn-thumb-color', opaque);

        this.hueThumb.style.left = `${(this.hue / 360) * 100}%`;

        this.alphaSlider.style.setProperty('--nn-alpha-color', opaque);
        this.alphaThumb.style.left = `${(this.alpha / 255) * 100}%`;
    }

    /**
     * Converts an RGBA color to HSV (hue 0-360, saturation/value 0-1)
     */
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

    /**
     * Converts HSV (hue 0-360, saturation/value 0-1) to an RGB color (0-255)
     */
    private hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
        const chroma = v * s;
        const sector = ((((h % 360) + 360) % 360) / 60);
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

    /**
     * Convert hex to RGBA
     */
    private hexToRgba(hex: string): RGBAValues | null {
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

    /**
     * Convert RGBA to hex, collapsing alpha when fully opaque
     */
    private rgbaToHex({ r, g, b, a }: RGBAValues): string {
        const base = [r, g, b].map(value => value.toString(16).padStart(2, '0')).join('');
        if (a >= 255) {
            return `#${base}`;
        }

        const alpha = a.toString(16).padStart(2, '0');
        return `#${base}${alpha}`;
    }

    /**
     * Parses common CSS color formats into RGBA values
     */
    private parseColorString(color: string): RGBAValues | null {
        if (!color) {
            return null;
        }

        const hex = this.hexToRgba(color);
        if (hex) {
            return hex;
        }

        const rgbMatch = color.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
        if (rgbMatch) {
            const [r, g, b] = rgbMatch.slice(1, 4).map(value => this.clampColorComponent(parseInt(value, 10)));
            return { r, g, b, a: 255 };
        }

        const rgbaMatch = color.match(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([0-9]*\.?[0-9]+)\s*\)$/i);
        if (rgbaMatch) {
            const [r, g, b] = rgbaMatch.slice(1, 4).map(value => this.clampColorComponent(parseInt(value, 10)));
            const alphaFloat = parseFloat(rgbaMatch[4]);
            if (Number.isNaN(alphaFloat)) {
                return null;
            }
            const clampedAlpha = Math.max(0, Math.min(1, alphaFloat));
            return { r, g, b, a: Math.round(clampedAlpha * 255) };
        }

        return null;
    }

    private clampColorComponent(value: number): number {
        if (Number.isNaN(value)) {
            return 0;
        }
        return Math.max(0, Math.min(255, value));
    }

    /**
     * Validate and format hex input
     */
    private sanitizeHexInput(input: string): string {
        return input.replace(/[^0-9A-Fa-f]/g, '').slice(0, 8);
    }

    /**
     * Save color to recent colors
     */
    private saveToRecentColors(color: string): void {
        // Don't add saved user colors to recent
        const isPaletteColor =
            this.defaultColors.some(defaultColor => defaultColor === color) || this.customColors.some(customColor => customColor === color);
        if (isPaletteColor) {
            return;
        }

        let recentColors = this.getRecentColors();

        // Remove if already exists
        recentColors = recentColors.filter(c => c !== color);

        // Add to front
        recentColors.unshift(color);

        // Limit to max
        recentColors = recentColors.slice(0, MAX_RECENT_COLORS);

        this.saveRecentColors(recentColors);
    }

    /**
     * Apply the selected color and close
     */
    private async applyColor() {
        // Save the color
        await this.saveColor();
        // Close the modal
        this.close();
    }

    /**
     * Restore default color and close
     */
    private async restoreDefaultColor() {
        await this.chooseColorHandler(null);
        this.close();
    }

    /**
     * Save the selected color
     */
    private async saveColor() {
        // Save to recent colors
        this.saveToRecentColors(this.selectedColor);
        await this.chooseColorHandler(this.selectedColor);
    }
}
