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

import { App, Modal, Setting, setIcon } from 'obsidian';
import type NotebookNavigatorPlugin from '../main';
import { strings } from '../i18n';
import { cloneNavRainbowTheme } from '../settings/navRainbowThemes';
import { setElementVisible } from '../settings/dependentSettings';
import { isNavRainbowTransitionStyle, type NavRainbowColorStop, type NavRainbowTheme } from '../settings/types';
import { runAsyncAction } from '../utils/async';
import { buildRainbowColorMapFromPalette, formatCssHex, parseCssColor } from '../utils/colorUtils';
import { buildNavRainbowPaletteBackground, buildNavRainbowThemePalette } from '../utils/navigationRainbow';
import { getCurrentThemeMode } from '../utils/themeMode';
import { ColorPickerModal } from './ColorPickerModal';

const PREVIEW_ITEM_COUNT = 6;

interface NavRainbowThemeEditorModalOptions {
    title: string;
    theme: NavRainbowTheme;
    onSave: (theme: NavRainbowTheme) => Promise<void>;
}

/**
 * Edits a copy of a rainbow theme and hands it to `onSave` only when the user saves, so closing the modal
 * any other way leaves the library unchanged.
 */
export class NavRainbowThemeEditorModal extends Modal {
    private readonly draft: NavRainbowTheme;
    /** Which stop list the color editor shows while separate light and dark colors are on. */
    private editingDark: boolean;
    private selectedIndex = 0;
    private dragPointerId: number | null = null;
    private brightnessSettingEl: HTMLElement | null = null;
    private reverseButton: HTMLButtonElement | null = null;
    private variantSwitchEl: HTMLElement | null = null;
    private variantButtons: { light: HTMLButtonElement; dark: HTMLButtonElement } | null = null;
    private removeButton: HTMLButtonElement | null = null;
    private trackEl: HTMLElement | null = null;
    private handlesEl: HTMLElement | null = null;
    /** Handle elements by stop index. */
    private handleEls: HTMLButtonElement[] = [];
    private stopLabelEl: HTMLElement | null = null;
    private colorButton: HTMLButtonElement | null = null;
    private colorSwatchEl: HTMLElement | null = null;
    private positionInput: HTMLInputElement | null = null;
    private previewEl: HTMLElement | null = null;

    constructor(
        app: App,
        private readonly plugin: NotebookNavigatorPlugin,
        private readonly options: NavRainbowThemeEditorModalOptions
    ) {
        super(app);
        this.draft = cloneNavRainbowTheme(options.theme);
        this.editingDark = this.draft.separateDarkStops && getCurrentThemeMode() === 'dark';
    }

    onOpen(): void {
        const { contentEl } = this;
        const editorStrings = strings.modals.navRainbowThemeEditor;
        this.titleEl.setText(this.options.title);
        contentEl.empty();

        new Setting(contentEl).setName(editorStrings.name).addText(text =>
            text
                .setPlaceholder(strings.modals.navRainbowThemes.defaultName)
                .setValue(this.draft.name)
                .onChange(value => {
                    this.draft.name = value;
                })
        );

        new Setting(contentEl)
            .setName(editorStrings.transitionStyle.name)
            .setDesc(editorStrings.transitionStyle.desc)
            .addDropdown(dropdown =>
                dropdown
                    .addOption('hue', editorStrings.transitionStyle.options.hue)
                    .addOption('rgb', editorStrings.transitionStyle.options.rgb)
                    .setValue(this.draft.transitionStyle)
                    .onChange(value => {
                        if (!isNavRainbowTransitionStyle(value)) {
                            return;
                        }
                        this.draft.transitionStyle = value;
                        this.updateTransitionControls();
                        this.refreshColors();
                    })
            );

        this.brightnessSettingEl = new Setting(contentEl)
            .setName(editorStrings.consistentBrightness.name)
            .setDesc(editorStrings.consistentBrightness.desc)
            .addToggle(toggle =>
                toggle.setValue(this.draft.consistentBrightness).onChange(value => {
                    this.draft.consistentBrightness = value;
                    this.refreshColors();
                })
            ).settingEl;

        new Setting(contentEl)
            .setName(editorStrings.separateDarkColors.name)
            .setDesc(editorStrings.separateDarkColors.desc)
            .addToggle(toggle =>
                toggle.setValue(this.draft.separateDarkStops).onChange(value => {
                    this.draft.separateDarkStops = value;
                    this.editingDark = value && getCurrentThemeMode() === 'dark';
                    this.renderStops();
                })
            );

        this.renderColorEditor(contentEl.createDiv({ cls: 'nn-rainbow-theme-editor-colors' }));
        this.previewEl = contentEl.createDiv({ cls: 'nn-rainbow-theme-preview' });
        this.renderFooter(contentEl.createDiv({ cls: 'nn-button-container' }));
        this.renderStops();
    }

    onClose(): void {
        this.handleEls = [];
        this.contentEl.empty();
    }

    /** The stop list the color editor shows and edits in place. */
    private getStops(): NavRainbowColorStop[] {
        return this.draft.separateDarkStops && this.editingDark ? this.draft.darkStops : this.draft.stops;
    }

    /** Whether the edited stops render in dark mode; without separate colors the stops serve both, shown in the current appearance. */
    private isEditingDarkAppearance(): boolean {
        return this.draft.separateDarkStops ? this.editingDark : getCurrentThemeMode() === 'dark';
    }

    private updateTransitionControls(): void {
        if (this.brightnessSettingEl) {
            setElementVisible(this.brightnessSettingEl, this.draft.transitionStyle === 'hue');
        }
        // Hue gradients always advance the same way around the color wheel, so mirrored stops would take the other
        // way around instead of reversing the colors
        if (this.reverseButton) {
            setElementVisible(this.reverseButton, this.draft.transitionStyle === 'rgb');
        }
    }

    private renderColorEditor(containerEl: HTMLElement): void {
        const editorStrings = strings.modals.navRainbowThemeEditor;
        const headerEl = containerEl.createDiv({ cls: 'nn-rainbow-theme-editor-colors-header' });
        headerEl.createDiv({ cls: 'nn-rainbow-theme-editor-colors-title', text: editorStrings.colors });

        const variantSwitchEl = headerEl.createDiv({ cls: 'nn-rainbow-theme-editor-variant-switch' });
        this.variantSwitchEl = variantSwitchEl;
        const createVariantButton = (label: string, isDark: boolean): HTMLButtonElement => {
            const button = variantSwitchEl.createEl('button', { text: label, attr: { type: 'button' } });
            button.addEventListener('click', () => {
                this.editingDark = isDark;
                this.renderStops();
            });
            return button;
        };
        this.variantButtons = {
            light: createVariantButton(strings.common.lightMode, false),
            dark: createVariantButton(strings.common.darkMode, true)
        };

        const actionsEl = headerEl.createDiv({ cls: 'nn-rainbow-theme-editor-actions' });
        const createActionButton = (icon: string, label: string, onClick: () => void): HTMLButtonElement => {
            const button = actionsEl.createEl('button', { cls: 'nn-action-btn', attr: { type: 'button', 'aria-label': label } });
            setIcon(button, icon);
            button.addEventListener('click', onClick);
            return button;
        };
        this.reverseButton = createActionButton('lucide-arrow-left-right', editorStrings.reverseColors, () => this.reverseStops());
        createActionButton('lucide-plus', editorStrings.addColor, () => this.addStop(null));
        this.removeButton = createActionButton('lucide-minus', editorStrings.removeColor, () => this.removeStop(this.selectedIndex));

        const rampEl = containerEl.createDiv({ cls: 'nn-rainbow-gradient-ramp' });
        this.trackEl = rampEl.createDiv({ cls: 'nn-rainbow-gradient-track' });
        this.trackEl.addEventListener('pointerdown', event => {
            if (event.button !== 0) {
                return;
            }
            event.preventDefault();
            this.addStop(this.getTrackFraction(event.clientX));
        });
        this.handlesEl = rampEl.createDiv({ cls: 'nn-rainbow-gradient-handles' });

        const selectedEl = containerEl.createDiv({ cls: 'nn-rainbow-theme-editor-selected' });
        this.stopLabelEl = selectedEl.createDiv({ cls: 'nn-rainbow-theme-editor-selected-label' });
        const colorButton = selectedEl.createEl('button', { cls: 'nn-setting-color-swatch-button', attr: { type: 'button' } });
        this.colorButton = colorButton;
        this.colorSwatchEl = colorButton.createDiv({ cls: 'nn-setting-color-swatch' });
        colorButton.addEventListener('click', () => this.openColorPicker(this.selectedIndex));

        const positionEl = selectedEl.createDiv({ cls: 'nn-rainbow-theme-editor-position' });
        positionEl.createSpan({ text: editorStrings.position });
        this.positionInput = positionEl.createEl('input', {
            cls: 'nn-input',
            attr: { type: 'number', min: '0', max: '100', step: '1', 'aria-label': editorStrings.position }
        });
        positionEl.createSpan({ text: '%' });
        this.positionInput.addEventListener('change', () => {
            // valueAsNumber is NaN for an emptied field, which restores the stop's position instead of moving the stop
            const value = this.positionInput?.valueAsNumber ?? Number.NaN;
            if (Number.isNaN(value)) {
                this.refreshColors();
            } else {
                this.setStopPosition(this.selectedIndex, value);
            }
        });
    }

    private renderFooter(footerEl: HTMLElement): void {
        const cancelButton = footerEl.createEl('button', { text: strings.common.cancel, attr: { type: 'button' } });
        cancelButton.addEventListener('click', () => this.close());

        const saveButton = footerEl.createEl('button', { cls: 'mod-cta', text: strings.common.save, attr: { type: 'button' } });
        saveButton.addEventListener('click', () => {
            runAsyncAction(async () => {
                this.draft.name = this.draft.name.trim();
                await this.options.onSave(cloneNavRainbowTheme(this.draft));
                this.close();
            });
        });
    }

    /** Rebuilds the stop handles and mode-dependent controls; call after the stop count, order or edited list changes. */
    private renderStops(): void {
        const handlesEl = this.handlesEl;
        if (!handlesEl) {
            return;
        }

        const stops = this.getStops();
        this.selectedIndex = Math.min(this.selectedIndex, stops.length - 1);
        this.updateTransitionControls();
        if (this.variantSwitchEl) {
            setElementVisible(this.variantSwitchEl, this.draft.separateDarkStops);
        }
        this.variantButtons?.light.toggleClass('is-active', !this.editingDark);
        this.variantButtons?.dark.toggleClass('is-active', this.editingDark);
        if (this.removeButton) {
            this.removeButton.disabled = stops.length <= 2;
        }

        // Removing the handle that holds pointer capture sends lostpointercapture to the document instead of the handle,
        // so the drag ends here; otherwise hovering another handle with the button released would move that stop
        this.dragPointerId = null;
        handlesEl.empty();
        this.handleEls = stops.map((_, index) => this.createHandle(handlesEl, index));
        this.refreshColors();
    }

    private createHandle(handlesEl: HTMLElement, index: number): HTMLButtonElement {
        const handle = handlesEl.createEl('button', { cls: 'nn-rainbow-gradient-handle', attr: { type: 'button' } });

        handle.addEventListener('focus', () => this.selectStop(index));
        handle.addEventListener('dblclick', () => this.openColorPicker(index));
        handle.addEventListener('pointerdown', event => {
            if (event.button !== 0) {
                return;
            }
            // Keeps the browser from starting a text selection during the drag
            event.preventDefault();
            handle.focus();
            this.selectStop(index);
            handle.setPointerCapture(event.pointerId);
            this.dragPointerId = event.pointerId;
        });
        handle.addEventListener('pointermove', event => {
            if (this.dragPointerId === event.pointerId) {
                this.setStopPosition(index, this.getTrackFraction(event.clientX) * 100);
            }
        });
        // The browser releases the capture after pointerup and pointercancel, which always fires lostpointercapture
        handle.addEventListener('lostpointercapture', event => {
            if (this.dragPointerId === event.pointerId) {
                this.dragPointerId = null;
            }
        });
        handle.addEventListener('keydown', event => this.handleKeyDown(event, index));
        return handle;
    }

    private handleKeyDown(event: KeyboardEvent, index: number): void {
        const stops = this.getStops();
        const direction =
            event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : 0;

        if (event.key === 'Delete' || event.key === 'Backspace') {
            this.removeStop(index);
        } else if (event.key === 'Enter') {
            this.openColorPicker(index);
        } else if (direction !== 0) {
            this.setStopPosition(index, stops[index].position + direction * (event.shiftKey ? 10 : 1));
        } else if (event.key === 'Home' || event.key === 'End') {
            this.setStopPosition(index, event.key === 'Home' ? 0 : 100);
        } else {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
    }

    /** Pointer position across the track, from 0 at the left edge to 1 at the right edge. */
    private getTrackFraction(clientX: number): number {
        const rect = this.trackEl?.getBoundingClientRect();
        if (!rect || rect.width <= 0) {
            return 0;
        }
        return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    }

    private selectStop(index: number): void {
        if (index === this.selectedIndex) {
            return;
        }
        this.selectedIndex = index;
        this.refreshColors();
    }

    /** Moves a stop, held between its neighbors so the stop order never changes and handles keep their indexes. */
    private setStopPosition(index: number, position: number): void {
        const stops = this.getStops();
        const min = stops[index - 1]?.position ?? 0;
        const max = stops[index + 1]?.position ?? 100;
        stops[index].position = Math.min(max, Math.max(min, Math.round(position)));
        this.refreshColors();
    }

    /**
     * Adds a stop at `fraction` along the track, or in the middle of the widest gap when null, with the color the
     * gradient shows there. Hue gradients with consistent brightness can still shift around the new stop, because
     * the shown color is already fitted to the screen's color range and the hex stop cannot keep the original.
     */
    private addStop(fraction: number | null): void {
        const stops = this.getStops();
        let position: number;
        if (fraction === null) {
            let widestIndex = 0;
            for (let index = 1; index < stops.length - 1; index++) {
                if (stops[index + 1].position - stops[index].position > stops[widestIndex + 1].position - stops[widestIndex].position) {
                    widestIndex = index;
                }
            }
            position = (stops[widestIndex].position + stops[widestIndex + 1].position) / 2;
        } else {
            position = fraction * 100;
        }
        position = Math.round(position);

        const palette = buildNavRainbowThemePalette(this.draft, this.isEditingDarkAppearance());
        const sampled = parseCssColor(palette[Math.round((position / 100) * (palette.length - 1))]);
        const insertIndex = stops.findIndex(stop => stop.position > position);
        const index = insertIndex === -1 ? stops.length : insertIndex;
        stops.splice(index, 0, { color: sampled ? formatCssHex(sampled) : stops[Math.max(0, index - 1)].color, position });
        this.selectedIndex = index;
        this.renderStops();
        this.handleEls[this.selectedIndex]?.focus();
    }

    private removeStop(index: number): void {
        const stops = this.getStops();
        if (stops.length <= 2) {
            return;
        }
        stops.splice(index, 1);
        this.selectedIndex = Math.max(0, index - 1);
        this.renderStops();
        this.handleEls[this.selectedIndex]?.focus();
    }

    /** Reverses the colors by mirroring the stop positions. */
    private reverseStops(): void {
        const stops = this.getStops();
        const reversed = stops.map(stop => ({ color: stop.color, position: 100 - stop.position })).reverse();
        stops.splice(0, stops.length, ...reversed);
        this.selectedIndex = stops.length - 1 - this.selectedIndex;
        this.renderStops();
    }

    private openColorPicker(index: number): void {
        const stop = this.getStops()[index];
        new ColorPickerModal(this.app, {
            title: strings.modals.navRainbowThemeEditor.colorStop(index + 1),
            initialColor: stop.color,
            settingsProvider: this.plugin,
            showRestoreDefault: false,
            onChooseColor: color => {
                if (color) {
                    stop.color = color;
                    this.refreshColors();
                }
            }
        }).open();
    }

    /** Updates colors and positions in place, keeping the handle elements so an active drag keeps its pointer capture. */
    private refreshColors(): void {
        const stops = this.getStops();
        const isDark = this.isEditingDarkAppearance();
        const palette = buildNavRainbowThemePalette(this.draft, isDark);
        const editorStrings = strings.modals.navRainbowThemeEditor;

        this.trackEl?.style.setProperty('background-image', buildNavRainbowPaletteBackground(palette));
        this.handleEls.forEach((handle, index) => {
            const stop = stops[index];
            handle.style.setProperty('left', `${stop.position}%`);
            handle.style.setProperty('background-color', stop.color);
            handle.toggleClass('is-selected', index === this.selectedIndex);
            handle.setAttribute('aria-label', editorStrings.colorStop(index + 1));
        });

        const selected = stops[this.selectedIndex];
        const stopLabel = editorStrings.colorStop(this.selectedIndex + 1);
        this.stopLabelEl?.setText(stopLabel);
        this.colorButton?.setAttribute('aria-label', stopLabel);
        this.colorSwatchEl?.style.setProperty('background-color', selected.color);
        if (this.positionInput) {
            this.positionInput.value = String(selected.position);
        }

        this.renderPreview(palette, isDark);
    }

    private renderPreview(palette: readonly string[], isDark: boolean): void {
        const previewEl = this.previewEl;
        if (!previewEl) {
            return;
        }

        const editorStrings = strings.modals.navRainbowThemeEditor;
        const modeOptions = strings.settings.items.navRainbowMode.options;
        const keys = Array.from({ length: PREVIEW_ITEM_COUNT }, (_, index) => String(index));
        const colors = buildRainbowColorMapFromPalette({ keys, palette });

        previewEl.empty();
        previewEl.createDiv({ cls: 'nn-rainbow-theme-preview-title', text: editorStrings.preview });
        const surfaceEl = previewEl.createDiv({
            cls: `nn-rainbow-theme-preview-surface ${isDark ? 'nn-rainbow-theme-preview-dark' : 'nn-rainbow-theme-preview-light'}`
        });
        const columns: { label: string; property: 'color' | 'background-color' }[] = [
            { label: modeOptions.textColor, property: 'color' },
            { label: modeOptions.backgroundColor, property: 'background-color' }
        ];
        columns.forEach(column => {
            const columnEl = surfaceEl.createDiv({ cls: 'nn-rainbow-theme-preview-column' });
            columnEl.createDiv({ cls: 'nn-rainbow-theme-preview-heading', text: column.label });
            keys.forEach((key, index) => {
                const rowEl = columnEl.createDiv({ cls: 'nn-rainbow-theme-preview-row', text: editorStrings.previewItem(index + 1) });
                const color = colors.get(key);
                if (color) {
                    rowEl.style.setProperty(column.property, color);
                }
            });
        });
    }
}
