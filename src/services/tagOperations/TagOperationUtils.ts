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
import { strings } from '../../i18n';
import { ConfirmModal } from '../../modals/ConfirmModal';
import type { ITagTreeProvider } from '../../interfaces/ITagTreeProvider';
import type { TagSourceSetting } from '../../settings/types';
import { collectRenameFiles, type RenameFile, type TagDescriptor } from '../tagRename/TagRenameEngine';
import type { TagUsageSummary } from './types';
import { normalizeTagPathValue } from '../../utils/tagPrefixMatcher';
import { isInlineTagValueCompatible } from '../../utils/tagUtils';
import { buildUsageSummaryFromPaths as buildOperationUsageSummaryFromPaths, yieldToEventLoop } from '../operations/OperationBatchUtils';

export { yieldToEventLoop };

/**
 * Collects all file paths in the vault that contain the specified tag in the sources the tag source reads.
 */
export function collectPreviewPaths(
    app: App,
    tag: TagDescriptor,
    _tagTreeService: ITagTreeProvider | null,
    tagSource: TagSourceSetting
): string[] {
    if (tag.canonicalName.length === 0) {
        return [];
    }
    return collectRenameFiles(app, tag, tagSource).map(target => target.filePath);
}

/**
 * Builds a usage summary from file paths
 * Limits sample to 8 files for display in modals
 */
export function buildUsageSummaryFromPaths(app: App, paths: Iterable<string>): TagUsageSummary {
    return buildOperationUsageSummaryFromPaths(app, paths);
}

/**
 * Builds a usage summary from rename target files
 * Wrapper for buildUsageSummaryFromPaths
 */
export function buildUsageSummary(app: App, targets: RenameFile[]): TagUsageSummary {
    return buildUsageSummaryFromPaths(
        app,
        targets.map(target => target.filePath)
    );
}

/**
 * Resolves canonical tag path to its display path using the tag tree
 * Returns original path if tag tree is unavailable or tag not found
 */
export function resolveDisplayTagPath(tagPath: string, tagTreeService: ITagTreeProvider | null): string {
    const canonical = normalizeTagPathValue(tagPath);
    if (canonical.length === 0) {
        return tagPath;
    }
    if (!tagTreeService) {
        return tagPath;
    }
    const node = tagTreeService.findTagNode(canonical);
    return node?.displayPath ?? tagPath;
}

function formatTagLabel(tagValue: string): string {
    const trimmed = tagValue.trim();
    if (trimmed.startsWith('#')) {
        return trimmed;
    }
    return `#${trimmed}`;
}

/**
 * Shows a warning confirmation for tags that are not compatible with Obsidian inline parsing.
 * Returns true when the action should continue.
 */
export async function confirmInlineTagParsingRisk(app: App, tagValue: string): Promise<boolean> {
    if (isInlineTagValueCompatible(tagValue)) {
        return true;
    }

    const warning = strings.modals.tagOperation.inlineParsingWarning;

    return await new Promise<boolean>(resolve => {
        const modal = new ConfirmModal(
            app,
            warning.title,
            warning.message.replace('{tag}', formatTagLabel(tagValue)),
            () => resolve(true),
            warning.confirm,
            { confirmButtonClass: 'mod-cta', onCancel: () => resolve(false) }
        );

        modal.open();
    });
}
