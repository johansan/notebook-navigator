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

import { App, Modal, setIcon } from 'obsidian';
import type NotebookNavigatorPlugin from '../main';
import { strings } from '../i18n';
import {
    NAV_RAINBOW_BUILT_IN_THEMES,
    createNavRainbowThemeId,
    createUniqueNavRainbowThemeName,
    getNavRainbowThemeName
} from '../settings/navRainbowThemes';
import type { NavRainbowTheme } from '../settings/types';
import { getCurrentThemeMode } from '../utils/themeMode';
import { ConfirmModal } from './ConfirmModal';
import { buildNavRainbowThemeSwatchBackground } from '../utils/navigationRainbow';
import { NavRainbowThemeEditorModal } from './NavRainbowThemeEditorModal';

/** Lists built-in and custom rainbow themes; custom theme changes are saved as soon as each action completes. */
export class NavRainbowThemesModal extends Modal {
    constructor(
        app: App,
        private readonly plugin: NotebookNavigatorPlugin
    ) {
        super(app);
    }

    onOpen(): void {
        this.modalEl.addClass('nn-rainbow-themes-modal');
        this.titleEl.setText(strings.modals.navRainbowThemes.title);
        this.render();
    }

    onClose(): void {
        this.modalEl.removeClass('nn-rainbow-themes-modal');
        this.contentEl.empty();
    }

    private render(): void {
        const { contentEl } = this;
        const modalStrings = strings.modals.navRainbowThemes;
        const isDark = getCurrentThemeMode() === 'dark';
        contentEl.empty();

        contentEl.createDiv({ cls: 'nn-rainbow-themes-heading', text: modalStrings.builtInHeading });
        const builtInListEl = contentEl.createDiv({ cls: 'nn-rainbow-themes-list' });
        NAV_RAINBOW_BUILT_IN_THEMES.forEach(theme => {
            const actionsEl = this.renderRow(builtInListEl, theme, isDark);
            this.createActionButton(actionsEl, 'lucide-copy', modalStrings.duplicate, () => this.duplicateTheme(theme));
        });

        contentEl.createDiv({ cls: 'nn-rainbow-themes-heading', text: modalStrings.customHeading });
        const customThemes = this.plugin.settings.navRainbowThemes;
        if (customThemes.length === 0) {
            contentEl.createDiv({ cls: 'setting-item-description', text: modalStrings.noCustomThemes });
        } else {
            const customListEl = contentEl.createDiv({ cls: 'nn-rainbow-themes-list' });
            customThemes.forEach(theme => {
                const actionsEl = this.renderRow(customListEl, theme, isDark);
                this.createActionButton(actionsEl, 'lucide-pencil', modalStrings.edit, () => this.editTheme(theme));
                this.createActionButton(actionsEl, 'lucide-copy', modalStrings.duplicate, () => this.duplicateTheme(theme));
                const deleteButton = this.createActionButton(actionsEl, 'lucide-trash-2', strings.common.delete, () =>
                    this.confirmDeleteTheme(theme)
                );
                deleteButton.addClass('mod-warning');
            });
        }

        const footerEl = contentEl.createDiv({ cls: 'nn-button-container' });
        const newButton = footerEl.createEl('button', { cls: 'mod-cta', text: modalStrings.newTheme, attr: { type: 'button' } });
        newButton.addEventListener('click', () => this.createTheme());
    }

    /** Renders a theme row and returns its actions container. */
    private renderRow(listEl: HTMLElement, theme: NavRainbowTheme, isDark: boolean): HTMLElement {
        const rowEl = listEl.createDiv({ cls: 'nn-rainbow-themes-row' });
        const swatchEl = rowEl.createDiv({ cls: 'nn-rainbow-theme-swatch' });
        swatchEl.style.setProperty('background-image', buildNavRainbowThemeSwatchBackground(theme, isDark));
        rowEl.createDiv({ cls: 'nn-rainbow-themes-name', text: getNavRainbowThemeName(theme) });
        return rowEl.createDiv({ cls: 'nn-rainbow-themes-actions' });
    }

    private createActionButton(containerEl: HTMLElement, icon: string, label: string, onClick: () => void): HTMLButtonElement {
        const button = containerEl.createEl('button', { cls: 'nn-action-btn', attr: { type: 'button', 'aria-label': label } });
        setIcon(button, icon);
        button.addEventListener('click', onClick);
        return button;
    }

    /** Opens the editor on an unsaved copy; the copy joins the library only when the editor saves it. */
    private openNewThemeEditor(source: NavRainbowTheme, name: string): void {
        // The editor edits its own copy, so the source theme's stops are never changed here
        const draft: NavRainbowTheme = { ...source, id: createNavRainbowThemeId(), name };
        new NavRainbowThemeEditorModal(this.app, this.plugin, {
            title: strings.modals.navRainbowThemeEditor.newTitle,
            theme: draft,
            onSave: async theme => {
                // Replacing by id keeps a retried save, after a failed one, from adding the theme twice
                this.plugin.settings.navRainbowThemes = [
                    ...this.plugin.settings.navRainbowThemes.filter(candidate => candidate.id !== theme.id),
                    theme
                ];
                await this.saveAndRender();
            }
        }).open();
    }

    private createTheme(): void {
        const name = createUniqueNavRainbowThemeName(strings.modals.navRainbowThemes.defaultName, this.plugin.settings.navRainbowThemes);
        this.openNewThemeEditor(NAV_RAINBOW_BUILT_IN_THEMES[0], name);
    }

    private duplicateTheme(theme: NavRainbowTheme): void {
        const name = createUniqueNavRainbowThemeName(
            strings.modals.navRainbowThemes.copyName(getNavRainbowThemeName(theme)),
            this.plugin.settings.navRainbowThemes
        );
        this.openNewThemeEditor(theme, name);
    }

    private editTheme(theme: NavRainbowTheme): void {
        new NavRainbowThemeEditorModal(this.app, this.plugin, {
            title: strings.modals.navRainbowThemeEditor.editTitle,
            theme,
            // Replacing the theme object, rather than changing it, is what tells the navigation pane to rebuild its colors
            onSave: async edited => {
                this.plugin.settings.navRainbowThemes = this.plugin.settings.navRainbowThemes.map(candidate =>
                    candidate.id === edited.id ? edited : candidate
                );
                await this.saveAndRender();
            }
        }).open();
    }

    private confirmDeleteTheme(theme: NavRainbowTheme): void {
        const modalStrings = strings.modals.navRainbowThemes;
        new ConfirmModal(
            this.app,
            modalStrings.deleteTitle,
            modalStrings.deleteMessage(getNavRainbowThemeName(theme)),
            () => this.deleteTheme(theme.id),
            strings.common.delete
        ).open();
    }

    /** Removes the theme; saving normalizes the vault profiles, which sets every section that used it to no theme. */
    private async deleteTheme(themeId: string): Promise<void> {
        this.plugin.settings.navRainbowThemes = this.plugin.settings.navRainbowThemes.filter(theme => theme.id !== themeId);
        await this.saveAndRender();
    }

    private async saveAndRender(): Promise<void> {
        await this.plugin.saveSettingsAndUpdate();
        this.render();
    }
}
