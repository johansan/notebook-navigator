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

import { describe, expect, it } from 'vitest';
import { App, TFolder } from 'obsidian';
import { ShortcutStartType } from '../../src/types/shortcuts';
import { resolveSearchShortcutStartFolderPath } from '../../src/hooks/useListPaneSearch';

interface TestVaultRegistration {
    registerFolder(folder: TFolder): void;
}

function getTestVault(app: App): TestVaultRegistration {
    return app.vault as unknown as TestVaultRegistration;
}

describe('resolveSearchShortcutStartFolderPath', () => {
    it('resolves folder start targets with mismatched casing', () => {
        const app = new App();
        getTestVault(app).registerFolder(new TFolder('applab/skills-workflows/mmgi'));

        expect(
            resolveSearchShortcutStartFolderPath(app, {
                type: ShortcutStartType.FOLDER,
                path: 'appLab/SKILLS-WORKFLOWS/mmgi'
            })
        ).toBe('applab/skills-workflows/mmgi');
    });
});
