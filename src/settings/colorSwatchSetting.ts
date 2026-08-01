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

import { Setting, setIcon, type App } from 'obsidian';
import type NotebookNavigatorPlugin from '../main';
import { strings } from '../i18n';
import { runAsyncAction } from '../utils/async';
import { showNotice } from '../utils/noticeUtils';

export interface ColorSwatchAccess {
    getValue: () => string;
    setValue: (value: string) => void;
    defaultValue: string;
}

export interface ColorSwatchSettingParams {
    app: App;
    plugin: NotebookNavigatorPlugin;
    setting: Setting;
    name: string;
    desc?: string;
    /** Color edited by the single swatch, or by the light swatch when `darkAccess` is set. */
    access: ColorSwatchAccess;
    /** Renders themed light/dark swatches with a copy button instead of a single swatch. */
    darkAccess?: ColorSwatchAccess;
    /** Adds an extra button that restores the color(s) to their defaults. */
    showRestoreDefault?: boolean;
}

/**
 * Renders color swatches on a settings row.
 * Without `darkAccess` a single swatch edits one stored color used in both themes. With
 * `darkAccess` the row shows a light swatch, a copy-light-to-dark button, and a dark swatch;
 * each swatch edits its own stored color and the caller applies them per theme at render time.
 */
export function attachColorSwatchSetting(params: ColorSwatchSettingParams): void {
    const { app, plugin, setting, name, access, darkAccess } = params;

    setting.setName(name);
    if (params.desc !== undefined) {
        setting.setDesc(params.desc);
    }

    const previewEl = setting.controlEl.createDiv({ cls: 'nn-setting-color-preview' });

    const createSwatchButton = (ariaLabel: string, isDark: boolean): { buttonEl: HTMLButtonElement; swatchEl: HTMLDivElement } => {
        const buttonEl = previewEl.createEl('button', {
            cls: `nn-setting-color-swatch-button${isDark ? ' nn-setting-color-swatch-button-dark' : ''}`,
            attr: {
                type: 'button',
                'aria-label': ariaLabel
            }
        });
        const swatchEl = buttonEl.createDiv({ cls: 'nn-setting-color-swatch' });
        return { buttonEl, swatchEl };
    };

    const lightSwatch = createSwatchButton(darkAccess ? `${name} (${strings.common.lightMode})` : name, false);
    const copyLightToDarkButton = darkAccess
        ? previewEl.createEl('button', {
              cls: 'clickable-icon nn-setting-color-copy-button',
              attr: {
                  type: 'button',
                  'aria-label': strings.settings.items.navRainbowCopyLightToDark,
                  title: strings.settings.items.navRainbowCopyLightToDark
              }
          })
        : null;
    const darkSwatch = darkAccess ? createSwatchButton(`${name} (${strings.common.darkMode})`, true) : null;
    if (copyLightToDarkButton) {
        setIcon(copyLightToDarkButton, 'arrow-right');
    }

    const renderValue = () => {
        const lightColor = access.getValue();
        lightSwatch.swatchEl.style.backgroundColor = lightColor;
        lightSwatch.buttonEl.setAttribute('title', darkAccess ? `${strings.common.lightMode}: ${lightColor}` : lightColor);

        if (darkAccess && darkSwatch) {
            const darkColor = darkAccess.getValue();
            darkSwatch.swatchEl.style.backgroundColor = darkColor;
            darkSwatch.buttonEl.setAttribute('title', `${strings.common.darkMode}: ${darkColor}`);
        }
    };

    const applyChange = async () => {
        await plugin.saveSettingsAndUpdate();
        renderValue();
    };

    const openColorPicker = (target: ColorSwatchAccess, title: string) => {
        runAsyncAction(async () => {
            const metadataService = plugin.metadataService;
            if (!metadataService) {
                showNotice(strings.common.unknownError, { variant: 'warning' });
                return;
            }

            const { ColorPickerModal } = await import('../modals/ColorPickerModal');
            const modal = new ColorPickerModal(app, {
                title,
                initialColor: target.getValue(),
                settingsProvider: metadataService.getSettingsProvider(),
                onChooseColor: async color => {
                    // An empty selection restores the default instead of storing an empty color
                    const nextValue = typeof color === 'string' && color.trim().length > 0 ? color.trim() : target.defaultValue;
                    target.setValue(nextValue);
                    await applyChange();
                }
            });

            modal.open();
        });
    };

    lightSwatch.buttonEl.addEventListener('click', () => {
        openColorPicker(access, darkAccess ? `${name} (${strings.common.lightMode})` : name);
    });
    darkSwatch?.buttonEl.addEventListener('click', () => {
        if (darkAccess) {
            openColorPicker(darkAccess, `${name} (${strings.common.darkMode})`);
        }
    });
    copyLightToDarkButton?.addEventListener('click', () => {
        runAsyncAction(async () => {
            if (!darkAccess) {
                return;
            }

            darkAccess.setValue(access.getValue());
            await applyChange();
        });
    });

    if (params.showRestoreDefault) {
        const defaultsLabel =
            darkAccess && darkAccess.defaultValue !== access.defaultValue
                ? `${access.defaultValue} / ${darkAccess.defaultValue}`
                : access.defaultValue;
        setting.addExtraButton(button => {
            button
                .setIcon('lucide-rotate-ccw')
                .setTooltip(`${strings.common.restoreDefault} (${defaultsLabel})`)
                .onClick(() => {
                    runAsyncAction(async () => {
                        const lightAtDefault = access.getValue() === access.defaultValue;
                        const darkAtDefault = !darkAccess || darkAccess.getValue() === darkAccess.defaultValue;
                        if (lightAtDefault && darkAtDefault) {
                            return;
                        }

                        access.setValue(access.defaultValue);
                        darkAccess?.setValue(darkAccess.defaultValue);
                        await applyChange();
                    });
                });
        });
    }

    renderValue();
}
