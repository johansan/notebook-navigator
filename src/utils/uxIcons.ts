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

import { deserializeIconFromFrontmatter, normalizeCanonicalIconId, serializeIconForFrontmatter } from './iconizeFormat';
import { sanitizeRecord } from './recordUtils';

export type UXIconId =
    | 'nav-show-single-pane'
    | 'nav-show-dual-pane'
    | 'nav-profile-chevron'
    | 'nav-shortcuts'
    | 'nav-expand-all'
    | 'nav-collapse-all'
    | 'nav-calendar'
    | 'nav-hidden-items'
    | 'nav-root-reorder'
    | 'nav-new-folder'
    | 'nav-recent-files'
    | 'nav-tree-expand'
    | 'nav-tree-collapse'
    | 'nav-folder-root'
    | 'nav-folder-open'
    | 'nav-folder-closed'
    | 'nav-tags'
    | 'nav-tag'
    | 'nav-properties'
    | 'nav-property'
    | 'nav-property-value'
    | 'list-search'
    | 'list-reveal-file'
    | 'list-descendants'
    | 'list-sort-ascending'
    | 'list-sort-descending'
    | 'list-sort-modified'
    | 'list-sort-created'
    | 'list-sort-title'
    | 'list-sort-filename'
    | 'list-sort-property'
    | 'list-appearance'
    | 'list-new-note'
    | 'list-pinned'
    | 'file-unfinished-task'
    | 'file-word-count'
    | 'file-character-count';

export type UXIconCategory = 'navigationPane' | 'folders' | 'tags' | 'properties' | 'listPane' | 'fileItems';

export interface UXIconDefinition {
    id: UXIconId;
    category: UXIconCategory;
    defaultIconId: string;
}

export const UX_ICON_DEFINITIONS: UXIconDefinition[] = [
    { id: 'nav-show-single-pane', category: 'navigationPane', defaultIconId: 'panel-left-close' },
    { id: 'nav-show-dual-pane', category: 'navigationPane', defaultIconId: 'panel-left' },
    { id: 'nav-profile-chevron', category: 'navigationPane', defaultIconId: 'chevron-down' },
    { id: 'nav-shortcuts', category: 'navigationPane', defaultIconId: 'star' },
    { id: 'nav-expand-all', category: 'navigationPane', defaultIconId: 'chevrons-up-down' },
    { id: 'nav-collapse-all', category: 'navigationPane', defaultIconId: 'chevrons-down-up' },
    { id: 'nav-calendar', category: 'navigationPane', defaultIconId: 'calendar-days' },
    { id: 'nav-hidden-items', category: 'navigationPane', defaultIconId: 'eye' },
    { id: 'nav-root-reorder', category: 'navigationPane', defaultIconId: 'list-tree' },
    { id: 'nav-new-folder', category: 'navigationPane', defaultIconId: 'folder-plus' },
    { id: 'nav-recent-files', category: 'navigationPane', defaultIconId: 'history' },
    { id: 'nav-tree-expand', category: 'navigationPane', defaultIconId: 'chevron-right' },
    { id: 'nav-tree-collapse', category: 'navigationPane', defaultIconId: 'chevron-down' },
    { id: 'nav-folder-root', category: 'folders', defaultIconId: 'vault' },
    { id: 'nav-folder-open', category: 'folders', defaultIconId: 'folder-open' },
    { id: 'nav-folder-closed', category: 'folders', defaultIconId: 'folder-closed' },
    { id: 'nav-tags', category: 'tags', defaultIconId: 'tags' },
    { id: 'nav-tag', category: 'tags', defaultIconId: 'tag' },
    { id: 'nav-properties', category: 'properties', defaultIconId: 'file-code' },
    { id: 'nav-property', category: 'properties', defaultIconId: 'align-left' },
    { id: 'nav-property-value', category: 'properties', defaultIconId: 'equal' },
    { id: 'list-search', category: 'listPane', defaultIconId: 'search' },
    { id: 'list-reveal-file', category: 'listPane', defaultIconId: 'locate-fixed' },
    { id: 'list-descendants', category: 'listPane', defaultIconId: 'layers' },
    { id: 'list-sort-ascending', category: 'listPane', defaultIconId: 'sort-asc' },
    { id: 'list-sort-descending', category: 'listPane', defaultIconId: 'sort-desc' },
    { id: 'list-sort-modified', category: 'listPane', defaultIconId: 'calendar-clock' },
    { id: 'list-sort-created', category: 'listPane', defaultIconId: 'calendar-plus' },
    { id: 'list-sort-title', category: 'listPane', defaultIconId: 'type' },
    { id: 'list-sort-filename', category: 'listPane', defaultIconId: 'file-text' },
    { id: 'list-sort-property', category: 'listPane', defaultIconId: 'align-left' },
    { id: 'list-appearance', category: 'listPane', defaultIconId: 'palette' },
    { id: 'list-new-note', category: 'listPane', defaultIconId: 'pen-box' },
    { id: 'list-pinned', category: 'listPane', defaultIconId: '' },
    { id: 'file-unfinished-task', category: 'fileItems', defaultIconId: 'circle-alert' },
    { id: 'file-word-count', category: 'fileItems', defaultIconId: 'sigma' },
    { id: 'file-character-count', category: 'fileItems', defaultIconId: 'type' }
];

const UX_ICON_ID_SET: ReadonlySet<string> = new Set(UX_ICON_DEFINITIONS.map(definition => definition.id));

const UX_ICON_DEFAULT_CANONICAL: Record<UXIconId, string> = (() => {
    const defaults = Object.create(null) as Record<UXIconId, string>;
    UX_ICON_DEFINITIONS.forEach(definition => {
        defaults[definition.id] = normalizeCanonicalIconId(definition.defaultIconId);
    });
    return defaults;
})();

function isUXIconId(value: string): value is UXIconId {
    return UX_ICON_ID_SET.has(value);
}

function normalizeUXIconKey(key: string): UXIconId | null {
    if (isUXIconId(key)) {
        return key;
    }

    switch (key) {
        case 'folder-open':
            return 'nav-folder-open';
        case 'folder-closed':
            return 'nav-folder-closed';
        case 'tag':
            return 'nav-tag';
        case 'recent-files':
            return 'nav-recent-files';
        case 'list-sort':
            return 'list-sort-ascending';
        default:
            return null;
    }
}

export function resolveUXIcon(uxIconMap: Record<string, string> | undefined, iconId: UXIconId): string {
    const stored = uxIconMap?.[iconId];
    if (stored) {
        const canonical = deserializeIconFromFrontmatter(stored);
        if (canonical) {
            return normalizeCanonicalIconId(canonical);
        }
    }

    return UX_ICON_DEFAULT_CANONICAL[iconId];
}

export function resolveNavigationFolderIcon(params: {
    interfaceIcons: Record<string, string> | undefined;
    customIcon?: string | null;
    isRoot: boolean;
    hasChildren: boolean;
    isExpanded: boolean;
}): string {
    const { interfaceIcons, customIcon, isRoot, hasChildren, isExpanded } = params;
    if (customIcon) {
        return customIcon;
    }

    if (isRoot) {
        // A configured vault icon remains stable; otherwise the built-in icon reflects the root expansion state.
        return interfaceIcons?.['nav-folder-root']
            ? resolveUXIcon(interfaceIcons, 'nav-folder-root')
            : hasChildren && isExpanded
              ? 'open-vault'
              : 'vault';
    }

    return hasChildren && isExpanded
        ? resolveUXIcon(interfaceIcons, 'nav-folder-open')
        : resolveUXIcon(interfaceIcons, 'nav-folder-closed');
}

function tryResolveLucideMenuIconId(iconId: string): string | null {
    const trimmed = iconId.trim();
    if (!trimmed) {
        return null;
    }

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex !== -1) {
        const provider = trimmed.substring(0, colonIndex);
        if (provider !== 'lucide') {
            return null;
        }

        const identifier = trimmed.substring(colonIndex + 1).trim();
        if (!identifier) {
            return null;
        }

        const slug = identifier.startsWith('lucide-') ? identifier.substring('lucide-'.length) : identifier;
        return slug ? `lucide-${slug}` : null;
    }

    const slug = trimmed.startsWith('lucide-') ? trimmed.substring('lucide-'.length) : trimmed;
    return slug ? `lucide-${slug}` : null;
}

/**
 * Normalizes an icon id into a Lucide menu icon id.
 */
export function resolveIconForMenu(iconId: string | null | undefined): string | null {
    if (typeof iconId !== 'string') {
        return null;
    }

    return tryResolveLucideMenuIconId(iconId);
}

export function resolveUXIconForMenu(
    uxIconMap: Record<string, string> | undefined,
    iconId: UXIconId,
    fallbackLucideMenuIconId?: string
): string {
    const resolved = resolveUXIcon(uxIconMap, iconId);
    return (
        resolveIconForMenu(resolved) ?? fallbackLucideMenuIconId ?? resolveIconForMenu(UX_ICON_DEFAULT_CANONICAL[iconId]) ?? 'lucide-circle'
    );
}

export function normalizeUXIconMapRecord(uxIconMap: Record<string, string> | undefined): Record<string, string> {
    const normalized = sanitizeRecord<string>(undefined);

    if (!uxIconMap) {
        return normalized;
    }

    Object.entries(uxIconMap).forEach(([key, value]) => {
        const normalizedKey = normalizeUXIconKey(key);
        if (!normalizedKey || typeof value !== 'string') {
            return;
        }

        const trimmed = value.trim();
        if (!trimmed) {
            return;
        }

        const canonical = deserializeIconFromFrontmatter(trimmed);
        if (!canonical) {
            return;
        }

        const normalizedCanonical = normalizeCanonicalIconId(canonical);
        const defaultCanonical = UX_ICON_DEFAULT_CANONICAL[normalizedKey];
        if (normalizedCanonical === defaultCanonical) {
            return;
        }

        const serialized = serializeIconForFrontmatter(normalizedCanonical);
        if (!serialized) {
            return;
        }

        normalized[normalizedKey] = serialized;
    });

    return normalized;
}
