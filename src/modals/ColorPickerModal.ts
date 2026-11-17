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

import { App, Modal } from 'obsidian';
import { strings } from '../i18n';
import { ISettingsProvider } from '../interfaces/ISettingsProvider';
import { addAsyncEventListener } from '../utils/domEventListeners';
import { ColorPickerSurface } from './ColorPickerSurface';

export interface ColorPickerModalParams {
    title: string;
    initialColor: string | null;
    settingsProvider: ISettingsProvider;
    /** Calls `onChooseColor(null)` when the user restores the default color; only offered when `initialColor` is set. Defaults to true. */
    showRestoreDefault?: boolean;
    onChooseColor: (color: string | null) => void | Promise<void>;
}

/**
 * Standalone modal wrapper around the shared color editing surface.
 */
export class ColorPickerModal extends Modal {
    private title: string;
    private initialColor: string | null;
    private chooseColorHandler: (color: string | null) => void | Promise<void>;
    private settingsProvider: ISettingsProvider;
    private showRestoreDefault: boolean;
    private surface: ColorPickerSurface | null = null;
    private domDisposers: (() => void)[] = [];

    /** Returns the last used palette mode across modal instances */
    public static getLastPaletteMode(): ReturnType<typeof ColorPickerSurface.getLastPaletteMode> {
        return ColorPickerSurface.getLastPaletteMode();
    }

    /** Persists the palette mode selection for subsequent modal openings */
    public static setLastPaletteMode(mode: Parameters<typeof ColorPickerSurface.setLastPaletteMode>[0]) {
        ColorPickerSurface.setLastPaletteMode(mode);
    }

    constructor(app: App, params: ColorPickerModalParams) {
        super(app);
        this.title = params.title;
        this.initialColor = params.initialColor;
        this.settingsProvider = params.settingsProvider;
        this.chooseColorHandler = params.onChooseColor;
        this.showRestoreDefault = params.showRestoreDefault !== false && Boolean(params.initialColor);
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        this.modalEl.addClass('nn-color-picker-modal');

        const header = contentEl.createDiv('nn-color-picker-header');
        header.createEl('h3', { text: this.title });

        this.attachCloseButtonHandler();

        this.surface = new ColorPickerSurface({
            app: this.app,
            rootEl: contentEl,
            scope: this.scope,
            initialColor: this.initialColor,
            settingsProvider: this.settingsProvider,
            onCommitRequested: () => this.applyColor()
        });
        this.surface.build();

        const buttonContainer = contentEl.createDiv('nn-color-button-container');
        const cancelRemoveButton = buttonContainer.createEl('button', {
            text: this.showRestoreDefault ? strings.common.restoreDefault : strings.common.cancel
        });
        this.domDisposers.push(
            addAsyncEventListener(cancelRemoveButton, 'click', () => {
                if (this.showRestoreDefault) {
                    return this.restoreDefaultColor();
                }
                this.close();
                return undefined;
            })
        );

        const applyButton = buttonContainer.createEl('button', {
            text: strings.modals.colorPicker.apply,
            cls: 'mod-cta'
        });
        this.domDisposers.push(addAsyncEventListener(applyButton, 'click', () => this.applyColor()));
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
        this.modalEl.removeClass('nn-color-picker-modal');
        this.surface?.dispose();
        this.surface = null;
        this.domDisposers.forEach(dispose => {
            try {
                dispose();
            } catch (e) {
                console.error('Error disposing color modal listener:', e);
            }
        });
        this.domDisposers = [];
    }

    private attachCloseButtonHandler(): void {
        const closeButton = this.modalEl.querySelector<HTMLElement>('.modal-close-button');
        if (!closeButton) {
            return;
        }

        const handleClose = (event: Event) => {
            event.preventDefault();
            this.close();
        };

        this.domDisposers.push(addAsyncEventListener(closeButton, 'click', handleClose));
        this.domDisposers.push(addAsyncEventListener(closeButton, 'pointerdown', handleClose));
    }

    private async applyColor(): Promise<void> {
        if (!this.surface) {
            return;
        }

        this.surface.commitRecentColor();
        await this.chooseColorHandler(this.surface.getColor());
        this.close();
    }

    private async restoreDefaultColor(): Promise<void> {
        await this.chooseColorHandler(null);
        this.close();
    }
}
