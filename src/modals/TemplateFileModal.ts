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

import { App, TFile } from 'obsidian';
import { strings } from '../i18n';
import { naturalCompare } from '../utils/sortUtils';
import { normalizeCalendarCustomRootFolder } from '../utils/calendarCustomNotePatterns';
import type { MaybePromise } from '../utils/async';
import { BaseSuggestModal } from './BaseSuggestModal';

/** Modal for selecting a template file from the configured template folder. */
export class TemplateFileModal extends BaseSuggestModal<TFile> {
    private templateFolder: string;

    constructor(app: App, templateFolder: string, onChoose: (file: TFile) => MaybePromise) {
        super(app, onChoose, strings.modals.templateFile.placeholder, {
            navigate: strings.modals.templateFile.instructions.navigate,
            action: strings.modals.templateFile.instructions.select,
            dismiss: strings.modals.templateFile.instructions.dismiss
        });

        this.templateFolder = normalizeCalendarCustomRootFolder(templateFolder);
    }

    /** Returns markdown files from the template folder, sorted by path. */
    getItems(): TFile[] {
        const folderPrefix = this.templateFolder ? `${this.templateFolder}/` : '';
        const files = this.app.vault
            .getFiles()
            .filter(file => file.extension === 'md' && (folderPrefix === '' || file.path.startsWith(folderPrefix)));
        files.sort((a, b) => naturalCompare(a.path, b.path));
        return files;
    }

    getItemText(file: TFile): string {
        return file.path;
    }

    protected getDisplayPath(file: TFile): string {
        return file.path;
    }
}
