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

import { RECENT_NOTES_VIRTUAL_FOLDER_ID, SHORTCUTS_VIRTUAL_FOLDER_ID } from '../../../types';
import type { NavRainbowSettings, NotebookNavigatorSettings } from '../../../settings/types';
import type { MetadataService } from '../../../services/MetadataService';
import { shouldDisplayFile, FILE_VISIBILITY } from '../../../utils/fileTypeUtils';
import {
    resolveFileIconId,
    type FileIconFallbackMode,
    type FileIconResolutionSettings,
    type FileNameIconNeedle
} from '../../../utils/fileIconUtils';
import {
    applyRainbowOverlay,
    type NavigationRainbowPalettes,
    type PropertyRainbowColors,
    type RecentRainbowColors,
    type ShortcutRainbowColors,
    type TagRainbowColors
} from '../../../utils/navigationRainbow';
import { resolveFolderDecorationColors, type FolderDecorationModel } from '../../../utils/folderDecoration';

interface TagRainbowContext {
    isEnabled: boolean;
    scope: NavRainbowSettings['tags']['scope'];
    rootLevel: number;
    colors: TagRainbowColors;
}

interface PropertyRainbowContext {
    isEnabled: boolean;
    scope: NavRainbowSettings['properties']['scope'];
    rootLevel: number;
    colors: PropertyRainbowColors;
}

interface ShortcutRainbowContext {
    isEnabled: boolean;
    colors: ShortcutRainbowColors;
}

interface RecentRainbowContext {
    isEnabled: boolean;
    colors: RecentRainbowColors;
}

interface NavigationRainbowContext {
    mode: NavRainbowSettings['mode'];
    isEnabled: boolean;
    tag: TagRainbowContext;
    property: PropertyRainbowContext;
    shortcut: ShortcutRainbowContext;
    recent: RecentRainbowContext;
}

interface NavigationFileIconContext {
    settings: FileIconResolutionSettings;
    fallbackMode: FileIconFallbackMode;
    fileNameIconNeedles: readonly FileNameIconNeedle[];
    getFileNameForMatch: (file: TFile) => string | undefined;
}

export interface NavigationItemDecorationContext {
    app: App;
    settings: NotebookNavigatorSettings;
    metadataService: MetadataService;
    parsedExcludedFolders: string[];
    getFolderDisplayData: (folderPath: string) => ReturnType<MetadataService['getFolderDisplayData']>;
    folderDecorationModel: FolderDecorationModel;
    fileIcons: NavigationFileIconContext;
    rainbow: NavigationRainbowContext;
}

export interface NavigationRainbowColors {
    tag: TagRainbowColors;
    property: PropertyRainbowColors;
    shortcut: ShortcutRainbowColors;
    recent: RecentRainbowColors;
}

export function createNavigationItemDecorationContext(params: {
    app: App;
    settings: NotebookNavigatorSettings;
    navRainbow: NavRainbowSettings;
    fileNameIconNeedles: readonly FileNameIconNeedle[];
    getFileDisplayName: (file: TFile) => string;
    metadataService: MetadataService;
    parsedExcludedFolders: string[];
    folderDecorationModel: NavigationItemDecorationContext['folderDecorationModel'];
    navRainbowPalettes: NavigationRainbowPalettes;
    navRainbowColors: NavigationRainbowColors;
}): NavigationItemDecorationContext {
    const {
        app,
        settings,
        navRainbow,
        fileNameIconNeedles,
        getFileDisplayName,
        metadataService,
        parsedExcludedFolders,
        folderDecorationModel,
        navRainbowPalettes,
        navRainbowColors
    } = params;

    const folderDisplayDataByPath = new Map<string, ReturnType<MetadataService['getFolderDisplayData']>>();
    const getFolderDisplayData = (folderPath: string): ReturnType<MetadataService['getFolderDisplayData']> => {
        const cachedData = folderDisplayDataByPath.get(folderPath);
        if (cachedData) {
            return cachedData;
        }

        const nextData = metadataService.getFolderDisplayData(folderPath);
        folderDisplayDataByPath.set(folderPath, nextData);
        return nextData;
    };

    const fileIconSettings: FileIconResolutionSettings = {
        showFilenameMatchIcons: settings.showFilenameMatchIcons,
        fileNameIconMap: settings.fileNameIconMap,
        showCategoryIcons: true,
        fileTypeIconMap: settings.fileTypeIconMap,
        fileTypeIconPreset: settings.fileTypeIconPreset,
        externalIconProviders: settings.externalIconProviders
    };
    const fileIconFallbackMode: FileIconFallbackMode = 'file';
    const getFileNameForMatch = (file: TFile): string | undefined => {
        if (!settings.showFilenameMatchIcons) {
            return undefined;
        }
        return getFileDisplayName(file);
    };

    const rainbowMode = navRainbow.mode;
    const isRainbowEnabled = rainbowMode !== 'none';

    const tagRootLevel = settings.showAllTagsFolder ? 1 : 0;
    const propertyRootLevel = settings.showAllPropertiesFolder ? 1 : 0;

    const tagPalette = navRainbowPalettes.tag;
    const propertyPalette = navRainbowPalettes.property;
    const shortcutPalette = navRainbowPalettes.shortcut;
    const recentPalette = navRainbowPalettes.recent;

    return {
        app,
        settings,
        metadataService,
        parsedExcludedFolders,
        getFolderDisplayData,
        folderDecorationModel,
        fileIcons: {
            settings: fileIconSettings,
            fallbackMode: fileIconFallbackMode,
            fileNameIconNeedles,
            getFileNameForMatch
        },
        rainbow: {
            mode: rainbowMode,
            isEnabled: isRainbowEnabled,
            tag: {
                isEnabled: Boolean(tagPalette),
                scope: navRainbow.tags.scope,
                rootLevel: tagRootLevel,
                colors: navRainbowColors.tag
            },
            property: {
                isEnabled: Boolean(propertyPalette),
                scope: navRainbow.properties.scope,
                rootLevel: propertyRootLevel,
                colors: navRainbowColors.property
            },
            shortcut: { isEnabled: Boolean(shortcutPalette), colors: navRainbowColors.shortcut },
            recent: { isEnabled: Boolean(recentPalette), colors: navRainbowColors.recent }
        }
    };
}

export interface DecorationColors {
    color: string | undefined;
    backgroundColor: string | undefined;
}

export function resolveFolderItemDecorationColors(params: {
    ctx: NavigationItemDecorationContext;
    folderPath: string;
    color: string | undefined;
    backgroundColor: string | undefined;
}): DecorationColors {
    const { ctx, folderPath, color, backgroundColor } = params;
    return resolveFolderDecorationColors({
        model: ctx.folderDecorationModel,
        folderPath,
        color,
        backgroundColor
    });
}

function applyRainbowOverlayToColors(params: {
    ctx: NavigationItemDecorationContext;
    rainbowColor: string | undefined;
    color: string | undefined;
    backgroundColor: string | undefined;
}): { color?: string; backgroundColor?: string } {
    const { ctx, rainbowColor, color, backgroundColor } = params;

    if (!ctx.rainbow.isEnabled || !rainbowColor) {
        return { color, backgroundColor };
    }

    return applyRainbowOverlay({
        mode: ctx.rainbow.mode,
        rainbowColor,
        color,
        backgroundColor
    });
}

export function applyScopedRainbow(params: {
    ctx: NavigationItemDecorationContext;
    shouldApply: boolean;
    rainbowColor: string | undefined;
    colors: DecorationColors;
}): DecorationColors {
    const { ctx, shouldApply, rainbowColor, colors } = params;
    if (!shouldApply || !rainbowColor) {
        return colors;
    }

    const next = applyRainbowOverlayToColors({
        ctx,
        rainbowColor,
        color: colors.color,
        backgroundColor: colors.backgroundColor
    });

    return {
        color: next.color,
        backgroundColor: next.backgroundColor
    };
}

export function inheritVirtualFolderStyle(params: {
    ctx: NavigationItemDecorationContext;
    enabled: boolean;
    virtualFolderId: string;
    color: string | undefined;
    backgroundColor: string | undefined;
}): { color: string | undefined; backgroundColor: string | undefined } | null {
    const { ctx, enabled, virtualFolderId, color, backgroundColor } = params;
    if (!enabled) {
        return null;
    }

    if (color && backgroundColor) {
        return null;
    }

    const inheritedColor = color ? undefined : ctx.settings.virtualFolderColors[virtualFolderId];
    const inheritedBackgroundColor = backgroundColor ? undefined : ctx.settings.virtualFolderBackgroundColors[virtualFolderId];

    if (!inheritedColor && !inheritedBackgroundColor) {
        return null;
    }

    return {
        color: color ?? inheritedColor,
        backgroundColor: backgroundColor ?? inheritedBackgroundColor
    };
}

function inheritShortcutsRootStyle(
    ctx: NavigationItemDecorationContext,
    color: string | undefined,
    backgroundColor: string | undefined
): { color: string | undefined; backgroundColor: string | undefined } | null {
    return inheritVirtualFolderStyle({
        ctx,
        enabled: true,
        virtualFolderId: SHORTCUTS_VIRTUAL_FOLDER_ID,
        color,
        backgroundColor
    });
}

function inheritRecentRootStyle(
    ctx: NavigationItemDecorationContext,
    color: string | undefined,
    backgroundColor: string | undefined
): { color: string | undefined; backgroundColor: string | undefined } | null {
    return inheritVirtualFolderStyle({
        ctx,
        enabled: true,
        virtualFolderId: RECENT_NOTES_VIRTUAL_FOLDER_ID,
        color,
        backgroundColor
    });
}

export function overlayItemWithRainbow<T extends { color?: string; backgroundColor?: string }>(
    ctx: NavigationItemDecorationContext,
    item: T,
    rainbowColor: string | undefined
): T {
    if (!ctx.rainbow.isEnabled || !rainbowColor) {
        return item;
    }

    const baseColor = item.color ?? undefined;
    const baseBackgroundColor = item.backgroundColor ?? undefined;
    const next = applyRainbowOverlayToColors({
        ctx,
        rainbowColor,
        color: baseColor,
        backgroundColor: baseBackgroundColor
    });

    if (next.color === baseColor && next.backgroundColor === baseBackgroundColor) {
        return item;
    }

    return { ...item, ...next };
}

export function resolveNavigationFileIconId(
    ctx: NavigationItemDecorationContext,
    file: TFile,
    customIconId: string | undefined
): string | undefined {
    const isExternalFile = !shouldDisplayFile(file, FILE_VISIBILITY.SUPPORTED, ctx.app);
    const resolvedIconId = resolveFileIconId(file, ctx.fileIcons.settings, {
        customIconId,
        metadataCache: ctx.app.metadataCache,
        isExternalFile,
        fallbackMode: ctx.fileIcons.fallbackMode,
        fileNameNeedles: ctx.fileIcons.fileNameIconNeedles,
        fileNameForMatch: ctx.fileIcons.getFileNameForMatch(file)
    });

    return resolvedIconId ?? undefined;
}

function resolveShortcutRainbowColor(ctx: NavigationItemDecorationContext, key: string): string | undefined {
    if (!ctx.rainbow.shortcut.isEnabled) {
        return undefined;
    }
    return ctx.rainbow.shortcut.colors.colorsByKey.get(key);
}

function resolveRecentRainbowColor(ctx: NavigationItemDecorationContext, key: string): string | undefined {
    if (!ctx.rainbow.recent.isEnabled) {
        return undefined;
    }
    return ctx.rainbow.recent.colors.colorsByKey.get(key);
}

export function resolveShortcutDecorationColors(params: {
    ctx: NavigationItemDecorationContext;
    itemKey: string;
    color: string | undefined;
    backgroundColor: string | undefined;
    allowRainbow?: boolean;
}): DecorationColors {
    const { ctx, itemKey, color, backgroundColor, allowRainbow = true } = params;

    let nextColor = color;
    let nextBackgroundColor = backgroundColor;

    const inheritedRoot = inheritShortcutsRootStyle(ctx, nextColor, nextBackgroundColor);
    if (inheritedRoot) {
        nextColor = inheritedRoot.color;
        nextBackgroundColor = inheritedRoot.backgroundColor;
    }

    if (!allowRainbow) {
        return { color: nextColor, backgroundColor: nextBackgroundColor };
    }

    return applyScopedRainbow({
        ctx,
        shouldApply: true,
        rainbowColor: resolveShortcutRainbowColor(ctx, itemKey),
        colors: {
            color: nextColor,
            backgroundColor: nextBackgroundColor
        }
    });
}

export function resolveRecentDecorationColors(params: {
    ctx: NavigationItemDecorationContext;
    itemKey: string;
    color: string | undefined;
    backgroundColor: string | undefined;
}): DecorationColors {
    const { ctx, itemKey, color, backgroundColor } = params;
    let nextColor = color;
    let nextBackgroundColor = backgroundColor;

    const inheritedRoot = inheritRecentRootStyle(ctx, nextColor, nextBackgroundColor);
    if (inheritedRoot) {
        nextColor = inheritedRoot.color;
        nextBackgroundColor = inheritedRoot.backgroundColor;
    }

    return applyScopedRainbow({
        ctx,
        shouldApply: true,
        rainbowColor: resolveRecentRainbowColor(ctx, itemKey),
        colors: {
            color: nextColor,
            backgroundColor: nextBackgroundColor
        }
    });
}
