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

import type { App } from 'obsidian';
import { sanitizeRecord } from '../utils/recordUtils';
import { InputModal } from './InputModal';

/** Asks for one value. Resolves with null when the modal is closed without submitting. */
function promptForTemplateValue(app: App, label: string): Promise<string | null> {
    return new Promise(resolve => {
        let settled = false;
        // The modal must not close itself on submit: its close handler runs before the submit callback, which would
        // report a cancel first. The value is resolved here and the modal is closed afterwards.
        const modal = new InputModal(
            app,
            label,
            '',
            value => {
                settled = true;
                resolve(value);
                modal.close();
            },
            '',
            { closeOnSubmit: false }
        );
        const originalOnClose = modal.onClose.bind(modal);
        modal.onClose = () => {
            originalOnClose();
            if (!settled) {
                settled = true;
                resolve(null);
            }
        };
        modal.open();
    });
}

/**
 * Asks for the value of each `{{prompt:Label}}` token, one modal at a time in the given order.
 * Resolves with the values keyed by label, or null when the user cancels any prompt so no note is created.
 */
export async function promptForTemplateValues(app: App, labels: string[]): Promise<Record<string, string> | null> {
    // A null-prototype record keeps labels such as `__proto__` as plain keys.
    const values = sanitizeRecord<string>(undefined);
    for (const label of labels) {
        const value = await promptForTemplateValue(app, label);
        if (value === null) {
            return null;
        }
        values[label] = value;
    }
    return values;
}
