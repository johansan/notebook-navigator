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

import { setIcon, type Setting } from 'obsidian';
import { strings } from '../i18n';
import { getTemplaterCreateNoteFromTemplate } from '../utils/templaterIntegration';
import { setElementVisible } from './dependentSettings';
import type { SettingsTabContext } from './tabs/SettingsTabContext';

/**
 * Appends the engine status shared by template settings. A warning-only row is hidden
 * entirely when Templater is not required or is available; other rows retain their help text.
 */
export function renderTemplateEngineStatus(setting: Setting, context: SettingsTabContext, listenerId: string, warningOnly = false): void {
    const statusEl = setting.descEl.createDiv({ cls: 'nn-setting-template-status' });
    const updateStatus = () => {
        const engine = context.plugin.settings.templateEngine;
        // Use the same availability check as note creation so disabled plugins also show the warning.
        const installed = getTemplaterCreateNoteFromTemplate(context.app) !== null;
        const missing = engine === 'templater' && !installed;
        const visible = warningOnly ? missing : engine !== 'builtin' && (installed || missing);
        statusEl.empty();
        setElementVisible(warningOnly ? setting.settingEl : statusEl, visible);
        if (!visible) {
            return;
        }

        const text = strings.settings.items.templateEngine;
        const headerEl = statusEl.createDiv({ cls: 'nn-setting-template-status-header' });
        if (missing) {
            headerEl.addClass('nn-setting-warning');
            const iconEl = headerEl.createSpan({ cls: 'nn-setting-template-status-icon', attr: { 'aria-hidden': 'true' } });
            setIcon(iconEl, 'lucide-triangle-alert');
        }
        headerEl.createEl('strong', { text: installed ? text.templaterInstalled : text.templaterNotInstalled });
        statusEl.createDiv({
            text: missing
                ? text.templaterMissingWarning
                      .replace('{setting}', text.name)
                      .replace('{automatic}', text.options.automatic)
                      .replace('{builtin}', text.options.builtin)
                      .replace(
                          '{location}',
                          `${strings.settings.pages.fileOperations.label} > ${strings.settings.pages.fileOperations.groups.templates}`
                      )
                : engine === 'automatic'
                  ? text.templaterAutomatic
                  : text.templaterUsage
        });
    };

    // Native and legacy controls both publish settings updates without rebuilding every help row.
    context.registerSettingsUpdateListener(listenerId, updateStatus);
    updateStatus();
}

/** Renders the warning on the settings landing page in both native and legacy settings. */
export function renderTemplateEngineWarningSetting(setting: Setting, context: SettingsTabContext): void {
    setting.setName('').setDesc('');
    renderTemplateEngineStatus(setting, context, 'general-template-engine-status', true);
}
