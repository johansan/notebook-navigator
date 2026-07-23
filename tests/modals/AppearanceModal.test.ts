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

import { App } from 'obsidian';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ISettingsProvider } from '../../src/interfaces/ISettingsProvider';
import { AppearanceModal } from '../../src/modals/AppearanceModal';
import type { MetadataService } from '../../src/services/MetadataService';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';

const { renderIcon } = vi.hoisted(() => ({ renderIcon: vi.fn() }));

vi.mock('../../src/services/icons', async importOriginal => {
    const actual = await importOriginal<typeof import('../../src/services/icons')>();
    return {
        ...actual,
        getIconService: () => ({ renderIcon })
    };
});

class TestStyle {
    private readonly properties = new Map<string, string>();

    setProperty(name: string, value: string): void {
        this.properties.set(name, value);
    }

    removeProperty(name: string): void {
        this.properties.delete(name);
    }

    getPropertyValue(name: string): string {
        return this.properties.get(name) ?? '';
    }
}

class TestElement {
    private readonly classes = new Set<string>();
    readonly style = new TestStyle();

    empty(): void {}

    addClass(className: string): void {
        this.classes.add(className);
    }

    removeClass(className: string): void {
        this.classes.delete(className);
    }

    hasClass(className: string): boolean {
        return this.classes.has(className);
    }
}

interface AppearanceModalHarness {
    previewItem: TestElement;
    previewIconEl: TestElement;
    renderPreview(): void;
}

function createSettingsProvider(colorIconOnly: boolean, showCategoryIcons = false): ISettingsProvider {
    return {
        settings: { ...DEFAULT_SETTINGS, colorIconOnly, showCategoryIcons },
        saveSettingsAndUpdate: vi.fn(),
        notifySettingsUpdate: vi.fn(),
        getRecentNotes: () => [],
        setRecentNotes: vi.fn(),
        getRecentIcons: () => ({}),
        setRecentIcons: vi.fn(),
        getRecentColors: () => [],
        setRecentColors: vi.fn()
    };
}

function renderAppearancePreview(options: {
    colorIconOnly: boolean;
    color?: string | null;
    customIcon?: string | null;
    defaultIcon?: string | null;
    colorIconPlaceholder?: string;
    showCategoryIcons?: boolean;
}): { previewItem: TestElement; previewIcon: TestElement } {
    const {
        colorIconOnly,
        color = '#aabbcc',
        customIcon = null,
        defaultIcon = null,
        colorIconPlaceholder,
        showCategoryIcons = false
    } = options;
    const settingsProvider = createSettingsProvider(colorIconOnly, showCategoryIcons);
    const metadataService = { getSettingsProvider: () => settingsProvider } as unknown as MetadataService;
    const modal = new AppearanceModal(new App(), {
        title: 'Projects',
        metadataService,
        defaultIcon,
        colorIconPlaceholder,
        icon: { initial: customIcon, apply: vi.fn() },
        color: { initial: color, apply: vi.fn() },
        background: { initial: '#ddeeff', apply: vi.fn() }
    }) as unknown as AppearanceModalHarness;
    const previewItem = new TestElement();
    const previewIcon = new TestElement();
    modal.previewItem = previewItem;
    modal.previewIconEl = previewIcon;

    modal.renderPreview();

    return { previewItem, previewIcon };
}

describe('AppearanceModal preview', () => {
    beforeEach(() => {
        renderIcon.mockClear();
    });

    it('colors the default icon when icon-only colors are enabled and no custom icon is set', () => {
        const { previewItem, previewIcon } = renderAppearancePreview({
            colorIconOnly: true,
            defaultIcon: 'folder-heart'
        });

        expect(renderIcon).toHaveBeenCalledWith(previewIcon, 'folder-heart');
        expect(previewIcon.hasClass('nn-appearance-preview-icon-empty')).toBe(false);
        expect(previewIcon.style.getPropertyValue('color')).toBe('#aabbcc');
        expect(previewItem.style.getPropertyValue('--nn-preview-fg')).toBe('');
    });

    it('colors the custom icon when icon-only colors are enabled', () => {
        const { previewIcon } = renderAppearancePreview({
            colorIconOnly: true,
            customIcon: 'star',
            defaultIcon: 'folder-heart'
        });

        expect(renderIcon).toHaveBeenCalledWith(previewIcon, 'star');
        expect(previewIcon.style.getPropertyValue('color')).toBe('#aabbcc');
    });

    it('does not show the default icon when icon-only colors are disabled', () => {
        const { previewItem, previewIcon } = renderAppearancePreview({
            colorIconOnly: false,
            colorIconPlaceholder: 'folder-closed'
        });

        expect(renderIcon).not.toHaveBeenCalled();
        expect(previewIcon.hasClass('nn-appearance-preview-icon-empty')).toBe(true);
        expect(previewItem.style.getPropertyValue('--nn-preview-fg')).toBe('#aabbcc');
        expect(previewIcon.style.getPropertyValue('color')).toBe('');
    });

    it('shows a custom icon when icon-only colors are disabled', () => {
        const { previewIcon } = renderAppearancePreview({
            colorIconOnly: false,
            customIcon: 'star'
        });

        expect(renderIcon).toHaveBeenCalledWith(previewIcon, 'star');
        expect(previewIcon.hasClass('nn-appearance-preview-icon-empty')).toBe(false);
    });

    it('hides the file icon when icon-only colors are enabled without a custom color or icon', () => {
        const { previewIcon } = renderAppearancePreview({
            colorIconOnly: true,
            color: null,
            colorIconPlaceholder: 'file'
        });

        expect(renderIcon).not.toHaveBeenCalled();
        expect(previewIcon.hasClass('nn-appearance-preview-icon-empty')).toBe(true);
        expect(previewIcon.style.getPropertyValue('color')).toBe('');
    });

    it('shows the file type icon without a custom color or icon when file type icons are enabled', () => {
        const { previewIcon } = renderAppearancePreview({
            colorIconOnly: true,
            color: null,
            colorIconPlaceholder: 'file-text',
            showCategoryIcons: true
        });

        expect(renderIcon).toHaveBeenCalledWith(previewIcon, 'file-text');
        expect(previewIcon.hasClass('nn-appearance-preview-icon-empty')).toBe(false);
        expect(previewIcon.style.getPropertyValue('color')).toBe('');
    });

    it('shows the file type icon when icon-only colors are disabled', () => {
        const { previewIcon } = renderAppearancePreview({
            colorIconOnly: false,
            color: null,
            colorIconPlaceholder: 'file-text',
            showCategoryIcons: true
        });

        expect(renderIcon).toHaveBeenCalledWith(previewIcon, 'file-text');
        expect(previewIcon.hasClass('nn-appearance-preview-icon-empty')).toBe(false);
    });

    it('does not show the default placeholder without a configured color when icon-only colors are disabled', () => {
        const { previewIcon } = renderAppearancePreview({
            colorIconOnly: false,
            color: null,
            colorIconPlaceholder: 'file'
        });

        expect(renderIcon).not.toHaveBeenCalled();
        expect(previewIcon.hasClass('nn-appearance-preview-icon-empty')).toBe(true);
    });

    it('shows the file icon after a custom color is set in icon-only mode', () => {
        const { previewIcon } = renderAppearancePreview({
            colorIconOnly: true,
            color: '#aabbcc',
            colorIconPlaceholder: 'file'
        });

        expect(renderIcon).toHaveBeenCalledWith(previewIcon, 'file');
        expect(previewIcon.hasClass('nn-appearance-preview-icon-empty')).toBe(false);
        expect(previewIcon.style.getPropertyValue('color')).toBe('#aabbcc');
    });

    it('shows a custom file icon without a custom color in icon-only mode', () => {
        const { previewIcon } = renderAppearancePreview({
            colorIconOnly: true,
            color: null,
            customIcon: 'star',
            colorIconPlaceholder: 'file'
        });

        expect(renderIcon).toHaveBeenCalledWith(previewIcon, 'star');
        expect(previewIcon.hasClass('nn-appearance-preview-icon-empty')).toBe(false);
    });

    it('shows a rendered default icon when icon-only colors are disabled', () => {
        const { previewIcon } = renderAppearancePreview({
            colorIconOnly: false,
            color: null,
            defaultIcon: 'open-vault'
        });

        expect(renderIcon).toHaveBeenCalledWith(previewIcon, 'open-vault');
        expect(previewIcon.hasClass('nn-appearance-preview-icon-empty')).toBe(false);
    });
});
