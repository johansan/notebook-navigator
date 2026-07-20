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

import { LIMITS } from '../../constants/limits';

export const STORE_NAME = 'keyvaluepairs';
export const PREVIEW_STORE_NAME = 'filePreviews';

export const DB_SCHEMA_VERSION = 3; // IndexedDB structure version
export const DB_CONTENT_VERSION = 7; // Data format version

// Default limits for preview text caching and load batching.
export const DEFAULT_PREVIEW_TEXT_CACHE_MAX_ENTRIES = LIMITS.storage.previewTextCacheMaxEntriesDefault;
export const DEFAULT_PREVIEW_LOAD_MAX_BATCH = LIMITS.storage.previewLoadMaxBatchDefault;
