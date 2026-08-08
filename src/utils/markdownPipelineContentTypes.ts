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

import type { FileContentType } from '../interfaces/IContentProvider';
import {
    resolveTextCountVariant,
    showsCharacterCount,
    showsWordCount,
    type NotebookNavigatorSettings,
    type TextCountDisplay
} from '../settings/types';
import { hasWordCountTargetPropertyConsumer } from './propertyUtils';

const appearanceTextCountConsumerCache = new WeakMap<object, boolean>();

export function hasMarkdownPreviewConsumer(settings: NotebookNavigatorSettings): boolean {
    return settings.showFilePreview;
}

export function hasMarkdownFeatureImageConsumer(settings: NotebookNavigatorSettings): boolean {
    return settings.showFeatureImage;
}

/**
 * Checks folder, tag, and property appearance overrides for an enabled text count toggle.
 * A selection can enable counts while the global count type is 'none', so count extraction
 * must run whenever any selection displays them. The global setting decides the count type.
 */
function hasEnabledAppearanceTextCount(settings: NotebookNavigatorSettings): boolean {
    // Settings snapshots keep unchanged appearance maps immutable and referentially stable, so each
    // map is scanned only when its contents change and the result is shared across settings updates.
    const records = [settings.folderAppearances, settings.tagAppearances, settings.propertyAppearances];
    return records.some(record => {
        const cached = appearanceTextCountConsumerCache.get(record);
        if (cached !== undefined) {
            return cached;
        }
        const enabled = Object.values(record).some(appearance => appearance.showTextCount === true);
        appearanceTextCountConsumerCache.set(record, enabled);
        return enabled;
    });
}

function hasAppearanceTextCountConsumer(settings: NotebookNavigatorSettings, shows: (value: TextCountDisplay) => boolean): boolean {
    if (!shows(resolveTextCountVariant(settings.textCountDisplay))) {
        return false;
    }
    return hasEnabledAppearanceTextCount(settings);
}

export function hasMarkdownWordCountConsumer(settings: NotebookNavigatorSettings): boolean {
    return (
        hasWordCountTargetPropertyConsumer(settings) ||
        (settings.showTooltips && settings.showTooltipWordCount) ||
        hasAppearanceTextCountConsumer(settings, showsWordCount)
    );
}

export function hasMarkdownCharacterCountConsumer(settings: NotebookNavigatorSettings): boolean {
    return showsCharacterCount(settings.textCountDisplay) || hasAppearanceTextCountConsumer(settings, showsCharacterCount);
}

/** Returns whether a settings update changes which text counts the markdown pipeline must extract. */
export function haveMarkdownCountConsumersChanged(oldSettings: NotebookNavigatorSettings, newSettings: NotebookNavigatorSettings): boolean {
    return (
        hasMarkdownWordCountConsumer(oldSettings) !== hasMarkdownWordCountConsumer(newSettings) ||
        hasMarkdownCharacterCountConsumer(oldSettings) !== hasMarkdownCharacterCountConsumer(newSettings)
    );
}

export function hasMarkdownTaskConsumer(_settings: NotebookNavigatorSettings): boolean {
    return true;
}

export function getMarkdownPipelineContentTypes(settings: NotebookNavigatorSettings): FileContentType[] {
    const types: FileContentType[] = [];

    if (hasMarkdownPreviewConsumer(settings)) {
        types.push('preview');
    }
    if (hasMarkdownFeatureImageConsumer(settings)) {
        types.push('featureImage');
    }
    if (hasMarkdownWordCountConsumer(settings)) {
        types.push('wordCount');
    }
    if (hasMarkdownCharacterCountConsumer(settings)) {
        types.push('characterCount');
    }
    if (hasMarkdownTaskConsumer(settings)) {
        types.push('tasks');
    }
    types.push('properties');

    return types;
}

export function hasMarkdownPipelineContent(settings: NotebookNavigatorSettings): boolean {
    return getMarkdownPipelineContentTypes(settings).length > 0;
}
