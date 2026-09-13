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

import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../../src/settings/defaultSettings';
import { renderFilesTab } from '../../src/settings/tabs/legacy/FilesLegacyTab';
import type { DebouncedTextSettingConfigurer, SettingsTabContext } from '../../src/settings/tabs/SettingsTabContext';
import { isTemplateFolderConfigured } from '../../src/utils/fileCreationUtils';

vi.mock('../../src/suggest/FolderPathInputSuggest', () => ({ FolderPathInputSuggest: class {} }));
vi.mock('../../src/settings/tabs/FilesTab', () => ({
    renderFolderTemplatesSetting: vi.fn(),
    renderTemplateInfoSetting: vi.fn()
}));
vi.mock('../../src/settings/tabs/TemplateCommandsSection', () => ({ renderTemplateCommandsSetting: vi.fn() }));
vi.mock('../../src/settings/settingGroups', () => {
    class SettingStub {
        controlEl = { addClass: () => {}, querySelector: () => null };
        setName(): this {
            return this;
        }
        setDesc(): this {
            return this;
        }
        addToggle(): this {
            return this;
        }
        addDropdown(): this {
            return this;
        }
    }
    return {
        createSettingGroupFactory: () => () => ({
            addSetting: (configure: (setting: SettingStub) => void) => {
                const setting = new SettingStub();
                configure(setting);
                return setting;
            }
        })
    };
});

describe('legacy template folder setting', () => {
    it('keeps the root configured across input and display, while clearing the field unsets it', () => {
        const settings = { ...DEFAULT_SETTINGS };
        const configureDebouncedTextSetting = vi.fn<DebouncedTextSettingConfigurer>(setting => setting);
        renderFilesTab({ plugin: { settings }, configureDebouncedTextSetting } as unknown as SettingsTabContext);
        const [, , , , getValue, setValue] = configureDebouncedTextSetting.mock.calls[0];

        setValue(' / ');
        expect(settings.calendarTemplateFolder).toBe('/');
        expect(getValue()).toBe('/');
        expect(isTemplateFolderConfigured(settings.calendarTemplateFolder)).toBe(true);

        setValue(' /Templates/Meetings/ ');
        expect(getValue()).toBe('Templates/Meetings');
        setValue('');
        expect(getValue()).toBe('');
        expect(isTemplateFolderConfigured(settings.calendarTemplateFolder)).toBe(false);
    });
});
