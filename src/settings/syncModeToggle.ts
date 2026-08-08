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

import type { Setting } from 'obsidian';

import { strings } from '../i18n';
import { runAsyncAction } from '../utils/async';
import type NotebookNavigatorPlugin from '../main';
import type { SettingSyncMode, SyncModeSettingId } from './types';

interface SettingSyncModeToggleOptions {
    setting: Setting;
    plugin: NotebookNavigatorPlugin;
    settingId: SyncModeSettingId;
    onToggle?: () => void;
}

export function getNotSyncedSettingName(name: string): string {
    const suffix = ` ${strings.settings.syncMode.notSynced}`;
    return name.endsWith(suffix) ? name : `${name}${suffix}`;
}

function getBaseSettingName(setting: Setting): string {
    const name = setting.nameEl.textContent?.trim() ?? '';
    const suffix = ` ${strings.settings.syncMode.notSynced}`;
    return name.endsWith(suffix) ? name.slice(0, -suffix.length) : name;
}

export function addSettingSyncModeToggle(options: SettingSyncModeToggleOptions): void {
    const { setting, plugin, settingId, onToggle } = options;
    const baseName = getBaseSettingName(setting);

    setting.addExtraButton(button => {
        button.extraSettingsEl.addClass('nn-setting-sync-toggle');

        const updateButtonState = () => {
            const isLocal = plugin.isLocal(settingId);
            button.setIcon(isLocal ? 'lucide-cloud-off' : 'lucide-cloud');
            const tooltip = isLocal ? strings.settings.syncMode.enableSync : strings.settings.syncMode.disableSync;
            button.setTooltip(tooltip);
            button.extraSettingsEl.setAttr('aria-label', tooltip);

            if (baseName.length > 0) {
                setting.setName(isLocal ? getNotSyncedSettingName(baseName) : baseName);
            }
        };

        updateButtonState();

        button.onClick(() => {
            runAsyncAction(async () => {
                const isLocal = plugin.isLocal(settingId);
                const nextMode: SettingSyncMode = isLocal ? 'synced' : 'local';
                await plugin.setSyncMode(settingId, nextMode);
                updateButtonState();
                onToggle?.();
            });
        });
    });
}
