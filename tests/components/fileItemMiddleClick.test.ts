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
import { prepareFileItemMiddleMouseDown } from '../../src/components/FileItem';

vi.mock('../../src/utils/tagModalHelpers', () => ({ openAddTagToFilesModal: vi.fn() }));

describe('prepareFileItemMiddleMouseDown', () => {
    it('prevents the middle-button default while preserving propagation to Obsidian', () => {
        const event = {
            button: 1,
            preventDefault: vi.fn(),
            stopPropagation: vi.fn()
        };

        expect(prepareFileItemMiddleMouseDown(event)).toBe(true);
        expect(event.preventDefault).toHaveBeenCalledOnce();
        expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    it('leaves other mouse buttons untouched', () => {
        const event = {
            button: 0,
            preventDefault: vi.fn()
        };

        expect(prepareFileItemMiddleMouseDown(event)).toBe(false);
        expect(event.preventDefault).not.toHaveBeenCalled();
    });
});
