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
import { showsCharacterCount, type NotebookNavigatorSettings } from '../settings/types';
import { hasWordCountTargetPropertyConsumer } from './propertyUtils';

export function hasMarkdownPreviewConsumer(settings: NotebookNavigatorSettings): boolean {
    return settings.showFilePreview;
}

export function hasMarkdownFeatureImageConsumer(settings: NotebookNavigatorSettings): boolean {
    return settings.showFeatureImage;
}

export function hasMarkdownWordCountConsumer(settings: NotebookNavigatorSettings): boolean {
    return hasWordCountTargetPropertyConsumer(settings) || (settings.showTooltips && settings.showTooltipWordCount);
}

export function hasMarkdownCharacterCountConsumer(settings: NotebookNavigatorSettings): boolean {
    return showsCharacterCount(settings.textCountDisplay);
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
