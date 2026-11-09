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

import { TFile } from 'obsidian';
import type { App } from 'obsidian';

import {
    NavigationPaneItemType,
    RECENT_NOTES_VIRTUAL_FOLDER_ID,
    PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
    SHORTCUTS_VIRTUAL_FOLDER_ID,
    TAGS_ROOT_VIRTUAL_FOLDER_ID
} from '../../../types';
import type { NavRainbowSettings, NotebookNavigatorSettings } from '../../../settings/types';
import type { MetadataService } from '../../../services/MetadataService';
import type { CombinedNavigationItem } from '../../../types/virtualization';
import type { NavigationRainbowPalettes } from '../../../utils/navigationRainbow';
import type { FileNameIconNeedle } from '../../../utils/fileIconUtils';
import { resolveUXIcon } from '../../../utils/uxIcons';
import {
    applyScopedRainbow,
    createNavigationItemDecorationContext,
    inheritVirtualFolderStyle,
    overlayItemWithRainbow,
    resolveFolderItemDecorationColors,
    resolveRecentDecorationColors,
    resolveNavigationFileIconId,
    type DecorationColors,
    type NavigationItemDecorationContext,
    type NavigationRainbowColors
} from './navigationItemDecorationShared';
import { decorateShortcutNavigationItem } from './shortcutNavigationDecorators';

type FolderNavigationItem = Extract<CombinedNavigationItem, { type: typeof NavigationPaneItemType.FOLDER }>;
type TagNavigationItem = Extract<CombinedNavigationItem, { type: typeof NavigationPaneItemType.TAG }>;
type UntaggedNavigationItem = Extract<CombinedNavigationItem, { type: typeof NavigationPaneItemType.UNTAGGED }>;
type TagLikeNavigationItem = TagNavigationItem | UntaggedNavigationItem;
type PropertyKeyNavigationItem = Extract<CombinedNavigationItem, { type: typeof NavigationPaneItemType.PROPERTY_KEY }>;
type PropertyValueNavigationItem = Extract<CombinedNavigationItem, { type: typeof NavigationPaneItemType.PROPERTY_VALUE }>;
type PropertyLikeNavigationItem = PropertyKeyNavigationItem | PropertyValueNavigationItem;
type VirtualFolderNavigationItem = Extract<CombinedNavigationItem, { type: typeof NavigationPaneItemType.VIRTUAL_FOLDER }>;
type RecentNoteNavigationItem = Extract<CombinedNavigationItem, { type: typeof NavigationPaneItemType.RECENT_NOTE }>;

function decorateFolderNavigationItem(ctx: NavigationItemDecorationContext, item: FolderNavigationItem): CombinedNavigationItem {
    const folderDisplayData = ctx.getFolderDisplayData(item.data.path);
    let colors: DecorationColors = {
        color: folderDisplayData.color,
        backgroundColor: folderDisplayData.backgroundColor
    };

    colors = resolveFolderItemDecorationColors({
        ctx,
        folderPath: item.data.path,
        color: colors.color,
        backgroundColor: colors.backgroundColor
    });

    return {
        ...item,
        displayName: folderDisplayData.displayName,
        color: colors.color,
        backgroundColor: colors.backgroundColor,
        icon: folderDisplayData.icon,
        parsedExcludedFolders: ctx.parsedExcludedFolders
    };
}

function decorateTagLikeNavigationItem(ctx: NavigationItemDecorationContext, item: TagLikeNavigationItem): CombinedNavigationItem {
    const tagNode = item.data;
    const tagColorData = ctx.metadataService.getTagColorData(tagNode.path);

    let colors: DecorationColors = {
        color: tagColorData.color,
        backgroundColor: tagColorData.background
    };

    const inheritedRoot = inheritVirtualFolderStyle({
        ctx,
        enabled: ctx.settings.showAllTagsFolder && ctx.settings.inheritTagColors,
        virtualFolderId: TAGS_ROOT_VIRTUAL_FOLDER_ID,
        color: colors.color,
        backgroundColor: colors.backgroundColor
    });
    if (inheritedRoot) {
        colors = {
            color: inheritedRoot.color,
            backgroundColor: inheritedRoot.backgroundColor
        };
    }

    const tagRainbow = ctx.rainbow.tag;
    if (tagRainbow.isEnabled) {
        const ownRainbowColor = tagRainbow.colors.colorsByPath.get(tagNode.path);
        const inheritedRainbowColor = ownRainbowColor ? undefined : tagRainbow.colors.getInheritedColor(tagNode.path);
        const rainbowColor = ownRainbowColor ?? inheritedRainbowColor;
        const shouldApplyByScope =
            tagRainbow.scope === 'all'
                ? true
                : tagRainbow.scope === 'root'
                  ? item.level === tagRainbow.rootLevel || Boolean(inheritedRainbowColor)
                  : item.level > tagRainbow.rootLevel;

        colors = applyScopedRainbow({ ctx, shouldApply: shouldApplyByScope, rainbowColor, colors });
    }

    return {
        ...item,
        color: colors.color,
        backgroundColor: colors.backgroundColor,
        icon: ctx.metadataService.getTagIcon(tagNode.path)
    };
}

function decoratePropertyLikeNavigationItem(
    ctx: NavigationItemDecorationContext,
    item: PropertyLikeNavigationItem
): CombinedNavigationItem {
    const propertyNode = item.data;
    const propertyNodeId = propertyNode.id;
    const propertyColorData = ctx.metadataService.getPropertyColorData(propertyNodeId);
    const icon =
        ctx.metadataService.getPropertyIcon(propertyNodeId) ||
        (propertyNode.kind === 'value' ? resolveUXIcon(ctx.settings.interfaceIcons, 'nav-property-value') : undefined);

    let colors: DecorationColors = {
        color: propertyColorData.color,
        backgroundColor: propertyColorData.background
    };

    const inheritedRoot = inheritVirtualFolderStyle({
        ctx,
        enabled: ctx.settings.showAllPropertiesFolder && ctx.settings.inheritPropertyColors,
        virtualFolderId: PROPERTIES_ROOT_VIRTUAL_FOLDER_ID,
        color: colors.color,
        backgroundColor: colors.backgroundColor
    });
    if (inheritedRoot) {
        colors = {
            color: inheritedRoot.color,
            backgroundColor: inheritedRoot.backgroundColor
        };
    }

    const propertyRainbow = ctx.rainbow.property;
    if (propertyRainbow.isEnabled) {
        const ownRainbowColor = propertyRainbow.colors.colorsByNodeId.get(propertyNode.id);
        const inheritedRainbowColor =
            ownRainbowColor || propertyRainbow.scope !== 'root' || !ctx.settings.inheritPropertyColors || propertyNode.kind !== 'value'
                ? undefined
                : propertyRainbow.colors.rootColorsByKey.get(propertyNode.key);
        const rainbowColor = ownRainbowColor ?? inheritedRainbowColor;
        const isPropertyRootNode = propertyNode.kind === 'key' && item.level === propertyRainbow.rootLevel;
        const shouldApplyByScope =
            propertyRainbow.scope === 'all'
                ? true
                : propertyRainbow.scope === 'root'
                  ? isPropertyRootNode || Boolean(inheritedRainbowColor)
                  : !isPropertyRootNode;

        colors = applyScopedRainbow({ ctx, shouldApply: shouldApplyByScope, rainbowColor, colors });
    }

    return { ...item, color: colors.color, backgroundColor: colors.backgroundColor, icon };
}

function decorateVirtualFolderNavigationItem(
    ctx: NavigationItemDecorationContext,
    item: VirtualFolderNavigationItem
): CombinedNavigationItem {
    const virtualFolderId = item.data.id;
    const color = ctx.settings.virtualFolderColors[virtualFolderId];
    const backgroundColor = ctx.settings.virtualFolderBackgroundColors[virtualFolderId];
    const nextItem =
        color || backgroundColor
            ? {
                  ...item,
                  color: color ?? undefined,
                  backgroundColor: backgroundColor ?? undefined
              }
            : item;

    let rainbowColor: string | undefined;
    if (item.data.id === TAGS_ROOT_VIRTUAL_FOLDER_ID) {
        rainbowColor = ctx.rainbow.tag.colors.rootColor;
    } else if (item.data.id === PROPERTIES_ROOT_VIRTUAL_FOLDER_ID) {
        rainbowColor = ctx.rainbow.property.colors.rootColor;
    } else if (item.data.id === SHORTCUTS_VIRTUAL_FOLDER_ID) {
        rainbowColor = ctx.rainbow.shortcut.colors.rootColor;
    } else if (item.data.id === RECENT_NOTES_VIRTUAL_FOLDER_ID) {
        rainbowColor = ctx.rainbow.recent.colors.rootColor;
    }

    return overlayItemWithRainbow(ctx, nextItem, rainbowColor);
}

function decorateRecentNoteNavigationItem(ctx: NavigationItemDecorationContext, item: RecentNoteNavigationItem): CombinedNavigationItem {
    const note: TFile = item.note;
    const customIconId = ctx.metadataService.getFileIcon(note.path);
    const baseColor = ctx.metadataService.getFileColor(note.path);
    const colors = resolveRecentDecorationColors({
        ctx,
        itemKey: item.key,
        color: baseColor,
        backgroundColor: item.backgroundColor
    });
    const resolvedIconId = resolveNavigationFileIconId(ctx, note, customIconId);

    return {
        ...item,
        icon: resolvedIconId ?? undefined,
        color: colors.color,
        backgroundColor: colors.backgroundColor
    };
}

function decorateNavigationItem(ctx: NavigationItemDecorationContext, item: CombinedNavigationItem): CombinedNavigationItem {
    switch (item.type) {
        case NavigationPaneItemType.FOLDER:
            return decorateFolderNavigationItem(ctx, item);
        case NavigationPaneItemType.TAG:
        case NavigationPaneItemType.UNTAGGED:
            return decorateTagLikeNavigationItem(ctx, item);
        case NavigationPaneItemType.PROPERTY_KEY:
        case NavigationPaneItemType.PROPERTY_VALUE:
            return decoratePropertyLikeNavigationItem(ctx, item);
        case NavigationPaneItemType.VIRTUAL_FOLDER:
            return decorateVirtualFolderNavigationItem(ctx, item);
        case NavigationPaneItemType.RECENT_NOTE:
            return decorateRecentNoteNavigationItem(ctx, item);
        case NavigationPaneItemType.SHORTCUT_FOLDER:
        case NavigationPaneItemType.SHORTCUT_TAG:
        case NavigationPaneItemType.SHORTCUT_PROPERTY:
        case NavigationPaneItemType.SHORTCUT_NOTE:
        case NavigationPaneItemType.SHORTCUT_SEARCH: {
            const decoratedShortcut = decorateShortcutNavigationItem(ctx, item);
            return decoratedShortcut ?? item;
        }
        default:
            return item;
    }
}

export interface DecorateNavigationItemsParams {
    app: App;
    settings: NotebookNavigatorSettings;
    navRainbow: NavRainbowSettings;
    fileNameIconNeedles: readonly FileNameIconNeedle[];
    getFileNameForIconMatch: (file: TFile) => string;
    metadataService: MetadataService;
    parsedExcludedFolders: string[];
    folderDecorationModel: NavigationItemDecorationContext['folderDecorationModel'];
    navRainbowPalettes: NavigationRainbowPalettes;
    navRainbowColors: NavigationRainbowColors;
}

export function createNavigationItemDecorator(
    params: DecorateNavigationItemsParams
): (item: CombinedNavigationItem) => CombinedNavigationItem {
    const {
        app,
        settings,
        navRainbow,
        fileNameIconNeedles,
        getFileNameForIconMatch,
        metadataService,
        parsedExcludedFolders,
        folderDecorationModel,
        navRainbowPalettes,
        navRainbowColors
    } = params;

    const ctx = createNavigationItemDecorationContext({
        app,
        settings,
        navRainbow,
        fileNameIconNeedles,
        getFileNameForIconMatch,
        metadataService,
        parsedExcludedFolders,
        folderDecorationModel,
        navRainbowPalettes,
        navRainbowColors
    });

    return (item: CombinedNavigationItem): CombinedNavigationItem => decorateNavigationItem(ctx, item);
}

export type { NavigationRainbowColors };
