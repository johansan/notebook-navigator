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

import { isTagSourceSetting, type TagSourceSetting } from '../settings/types';
import { STORAGE_KEYS } from '../types';
import { localStorage } from './localStorage';

/**
 * Records the Tag source value the cached `tags` field was built with. Cached tags carry the file mtime they were
 * read at, so tags cached under another source look current; the startup check compares this record with the setting
 * because the setting can change through sync while the plugin is not running. A missing record means `all`, the
 * source every tag cache was built with before the setting existed.
 */
export function getTagSourceCache(): TagSourceSetting {
    const stored = localStorage.get<unknown>(STORAGE_KEYS.tagSourceCacheKey);
    return isTagSourceSetting(stored) ? stored : 'all';
}

export function markTagSourceCacheCurrent(tagSource: TagSourceSetting): void {
    if (tagSource === 'all') {
        localStorage.remove(STORAGE_KEYS.tagSourceCacheKey);
        return;
    }
    localStorage.set(STORAGE_KEYS.tagSourceCacheKey, tagSource);
}
