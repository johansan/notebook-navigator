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

/**
 * File item architecture:
 *
 * 1. React.memo keeps row renders scoped to prop changes.
 *
 * 2. Render-path work:
 *    - displayName: Read from the storage-backed display-name cache
 *    - displayDate: Uses shared date formatting caches
 *    - feature image state: Hydrated from content storage and object URL lifecycle effects
 *    - className/style values: Built directly from row state
 *
 * 3. Extracted subsystems:
 *    - useFileItemContentState: Cache hydration, content subscriptions, feature-image URL lifecycle
 *    - useFileItemPills: Tag/property/text-count pill models and rendering
 *    - listPaneMeasurements helpers: Shared layout rules with the virtualizer
 *
 * 4. Image optimization:
 *    - Feature images use default browser loading behavior
 *    - Resource paths are cached to avoid repeated vault.getResourcePath calls
 */

import React, { useRef, useMemo, useEffect, useState, useCallback, useId } from 'react';
import { TFile, TFolder, setTooltip, setIcon } from 'obsidian';
import { useServices } from '../context/ServicesContext';
import { useMetadataService } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import type { FolderDecorationModel } from '../utils/folderDecoration';
import type { ListPaneAppearanceSettings } from '../hooks/useListPaneAppearance';
import { strings } from '../i18n';
import type { SortOption } from '../settings/types';
import { ItemType, type NavigationItemType } from '../types';
import { DateUtils } from '../utils/dateUtils';
import { runAsyncAction } from '../utils/async';
import { getTooltipPlacement } from '../utils/domUtils';
import { openFileInContext } from '../utils/openFileInContext';
import { FILE_VISIBILITY, getExtensionSuffix, isRasterImageFile, shouldDisplayFile } from '../utils/fileTypeUtils';
import { resolveFolderDecorationColors } from '../utils/folderDecoration';
import { resolveFileDragIconId, resolveFileIconId } from '../utils/fileIconUtils';
import { buildFileTooltip } from '../utils/navigationTooltipUtils';
import { getFoldedSearchHighlightRanges } from '../utils/searchHighlight';
import {
    getFileItemLayoutState,
    shouldShowExtensionBadgeThumbnail,
    shouldShowFeatureImageArea,
    shouldShowFileItemParentFolderLine
} from '../utils/listPaneMeasurements';
import { getIconService, useIconServiceVersion } from '../services/icons';
import type { AliasSearchMatch, SearchResultMeta } from '../types/search';
import { mergeRanges, NumericRange } from '../utils/arrayUtils';
import { openAddTagToFilesModal } from '../utils/tagModalHelpers';
import { resolveUXIcon } from '../utils/uxIcons';
import type { InclusionOperator } from '../utils/filterSearch';
import { getNavigatorPinContext } from '../utils/selectionUtils';
import { resolveDefaultDateField } from '../utils/sortUtils';
import { resolveFolderDisplayPath } from '../utils/folderDisplayName';
import type { FileNameIconNeedle } from '../utils/fileIconUtils';
import type { FileItemPillDecorationModel } from '../utils/fileItemPillDecoration';
import type { FileItemPillOrderModel } from '../utils/fileItemPillOrder';
import type { HiddenTagVisibility } from '../utils/tagPrefixMatcher';
import { useFileItemContentState, type FileItemContentDb } from './fileItem/useFileItemContentState';
import { useFileItemPills } from './fileItem/useFileItemPills';
import { ServiceIcon } from './ServiceIcon';
import { getDrawingFeatureImageSource } from '../utils/drawingFeatureImages';
import { useDrawingFeatureImage } from '../hooks/useDrawingFeatureImage';
import { resolveFileRowBackgroundColor } from '../utils/colorUtils';
import { formatTextCount, getWordCountDisplayText } from '../utils/wordCountUtils';
import { showsCharacterCount, showsWordCount } from '../settings/types';
import { InlineRenameInput } from './InlineRenameInput';
import { ObsidianIcon } from './ObsidianIcon';

const FEATURE_IMAGE_MAX_ASPECT_RATIO = 16 / 9;

function formatCountTextLabel(template: string, countText: string): string {
    return template.replace('{count}', countText);
}

function getCharacterCountDisplayText(count: number | null | undefined): string | null {
    if (typeof count !== 'number' || !Number.isFinite(count) || count <= 0) {
        return null;
    }

    return formatTextCount(count);
}

function getTitleCountDisplayText(params: {
    wordCountDisplayText: string | null;
    characterCountDisplayText: string | null;
}): string | null {
    const { wordCountDisplayText, characterCountDisplayText } = params;
    if (wordCountDisplayText && characterCountDisplayText) {
        const wordText =
            !wordCountDisplayText.includes('/') && !wordCountDisplayText.includes('%')
                ? formatCountTextLabel(strings.fileCounts.words, wordCountDisplayText)
                : wordCountDisplayText;
        const characterText = formatCountTextLabel(strings.fileCounts.characters, characterCountDisplayText);
        return `${wordText}${strings.fileCounts.separator}${characterText}`;
    }

    return wordCountDisplayText ?? characterCountDisplayText;
}

function useImageFileResourceVersion(app: ReturnType<typeof useServices>['app'], file: TFile, enabled: boolean): number {
    const [version, setVersion] = useState(file.stat.mtime);

    useEffect(() => {
        setVersion(file.stat.mtime);
    }, [file, file.stat.mtime]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const eventRef = app.vault.on('modify', changedFile => {
            if (changedFile instanceof TFile && changedFile.path === file.path) {
                setVersion(changedFile.stat.mtime);
            }
        });

        return () => {
            app.vault.offref(eventRef);
        };
    }, [app, enabled, file.path]);

    return enabled ? version : file.stat.mtime;
}

/** Pane-level inputs shared by every file row in a list surface. */
export interface FileItemPaneProps {
    onFileClick: (file: TFile, fileIndex: number | undefined, event: React.MouseEvent) => void;
    selectionType?: NavigationItemType | null;
    sortOption?: SortOption;
    /** Active search query for highlighting matches in the file name */
    searchQuery?: string;
    /** Modifies the active search query with a tag token when modifier clicking */
    onModifySearchWithTag?: (tag: string, operator: InclusionOperator) => void;
    /** Modifies the active search query with a property token when modifier clicking */
    onModifySearchWithProperty?: (key: string, value: string | null, operator: InclusionOperator) => void;
    /** Local day reference date used for relative date group calculations */
    localDayReference: Date | null;
    /** Icon size for rendering file icons */
    fileIconSize: number;
    appearanceSettings: ListPaneAppearanceSettings;
    includeDescendantNotes: boolean;
    hiddenTagVisibility: HiddenTagVisibility;
    fileNameIconNeedles: readonly FileNameIconNeedle[];
    /** Visible frontmatter property keys for file list pills (normalized keys) */
    visiblePropertyKeys: ReadonlySet<string>;
    /** Visible frontmatter property keys in navigation pane (normalized keys) */
    visibleNavigationPropertyKeys: ReadonlySet<string>;
    fileItemStorage: FileItemStorageHelpers;
    onToggleNoteShortcut: (file: TFile, shortcutKey: string | undefined) => Promise<void>;
    folderDecorationModel: FolderDecorationModel;
    fileItemPillDecorationModel: FileItemPillDecorationModel;
    fileItemPillOrderModel: FileItemPillOrderModel;
    getSolidBackground: (color?: string | null) => string | undefined;
    disableNativeDrag?: boolean;
}

export interface FileItemInlineRenameHandlers {
    onCommit: (file: TFile, value: string) => Promise<boolean>;
    onCancel: () => void;
    onRestoreFocus: () => void;
}

interface FileItemProps {
    file: TFile;
    paneProps: FileItemPaneProps;
    isSelected: boolean;
    hasSelectedAbove?: boolean;
    hasSelectedBelow?: boolean;
    showQuickActionsPanel: boolean;
    fileIndex?: number;
    groupHeaderLabel?: string | null;
    parentFolder?: string | null;
    isPinned?: boolean;
    /** Search metadata from Omnisearch provider */
    searchMeta?: SearchResultMeta;
    /** Aliases that satisfied the active internal filter search */
    matchedAliases?: readonly AliasSearchMatch[];
    /** Whether the file is normally hidden (frontmatter or excluded folder) */
    isHidden?: boolean;
    shortcutKey?: string;
    manualSortDisabled?: boolean;
    inlineRename?: FileItemInlineRenameHandlers;
}

export interface FileItemStorageHelpers {
    getFileDisplayName: (file: TFile) => string;
    getDB: () => FileItemContentDb;
    getFileTimestamps: (file: TFile) => { created: number; modified: number };
    hasPreview: (path: string) => boolean;
    regenerateFeatureImageForFile: (file: TFile) => Promise<void>;
}

/**
 * Computes merged highlight ranges for all occurrences of search segments.
 * Overlapping ranges are merged to avoid nested highlights.
 */
function getMergedHighlightRanges(text: string, query?: string, searchMeta?: SearchResultMeta): NumericRange[] {
    if (!text) return [];

    const lower = text.toLowerCase();
    const ranges: NumericRange[] = [];
    const seenTokens = new Set<string>();

    const addTokenRanges = (rawToken: string | undefined) => {
        if (!rawToken) return;
        const token = rawToken.toLowerCase();
        if (!token || seenTokens.has(token)) return;
        seenTokens.add(token);

        let idx = lower.indexOf(token);
        while (idx !== -1) {
            ranges.push({ start: idx, end: idx + token.length });
            idx = lower.indexOf(token, idx + token.length);
        }
    };

    if (searchMeta) {
        searchMeta.matches.forEach(match => addTokenRanges(match.text));
        searchMeta.terms.forEach(term => addTokenRanges(term));
    }

    // When Omnisearch metadata is present, highlight strictly from provider tokens.
    // This avoids raw-query fallback highlighting for path/ext-only filters.
    if (!searchMeta && ranges.length === 0 && query) {
        const normalizedQuery = query.trim().toLowerCase();
        if (normalizedQuery) {
            normalizedQuery
                .split(/\s+/)
                .filter(Boolean)
                .forEach(segment => addTokenRanges(segment));
        }
    }

    if (ranges.length === 0) {
        return [];
    }

    return mergeRanges(ranges);
}

function renderTextWithHighlightRanges(text: string, ranges: readonly NumericRange[]): React.ReactNode {
    if (!text || ranges.length === 0) return text;
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    ranges.forEach((r, i) => {
        if (r.start > cursor) {
            parts.push(text.slice(cursor, r.start));
        }
        parts.push(
            <span key={`h-${i}`} className="nn-search-highlight">
                {text.slice(r.start, r.end)}
            </span>
        );
        cursor = r.end;
    });
    if (cursor < text.length) {
        parts.push(text.slice(cursor));
    }
    return <>{parts}</>;
}

/**
 * Splits text into plain and highlighted parts based on merged ranges.
 */
function renderHighlightedText(text: string, query?: string, searchMeta?: SearchResultMeta): React.ReactNode {
    return renderTextWithHighlightRanges(text, getMergedHighlightRanges(text, query, searchMeta));
}

function renderAliasSearchMatch(matchedAlias: AliasSearchMatch): React.ReactNode {
    // Matched aliases are passed only to virtualized search rows, so resolving folded offsets here skips every offscreen result.
    const ranges = getFoldedSearchHighlightRanges(matchedAlias.value, matchedAlias.foldedTerms);
    return renderTextWithHighlightRanges(matchedAlias.value, ranges);
}

interface ParentFolderLabelProps {
    iconId: string;
    label: string;
    iconVersion: number;
    color?: string;
    backgroundColor?: string;
    showIcon: boolean;
    applyColorToName: boolean;
    onReveal?: () => void;
}

/**
 * Renders a parent folder label with icon for display in file items.
 */
function ParentFolderLabel({
    iconId,
    label,
    iconVersion,
    color,
    backgroundColor,
    showIcon,
    applyColorToName,
    onReveal
}: ParentFolderLabelProps) {
    const iconRef = useRef<HTMLSpanElement | null>(null);
    const hasColor = Boolean(color);
    const hasBackground = Boolean(backgroundColor);
    const iconStyle: React.CSSProperties | undefined = color ? { color } : undefined;
    const labelStyle: React.CSSProperties | undefined = applyColorToName && color ? { color } : undefined;
    const contentStyle: React.CSSProperties | undefined = backgroundColor ? { backgroundColor } : undefined;
    const labelClassName = applyColorToName ? 'nn-parent-folder-label nn-parent-folder-label--colored' : 'nn-parent-folder-label';
    const isRevealEnabled = Boolean(onReveal);

    // Handles click on parent folder label to reveal the file when enabled
    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            if (!onReveal) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            onReveal();
        },
        [onReveal]
    );

    // Render the folder icon when iconId or iconVersion changes
    useEffect(() => {
        const iconContainer = iconRef.current;
        if (!iconContainer) {
            return;
        }

        iconContainer.innerHTML = '';
        if (!iconId || !showIcon) {
            return;
        }

        const iconService = getIconService();
        iconService.renderIcon(iconContainer, iconId);
    }, [iconId, iconVersion, showIcon]);

    return (
        <div className="nn-parent-folder" data-dot-separator={showIcon ? 'false' : 'true'}>
            <div
                className="nn-parent-folder-content"
                data-has-background={hasBackground ? 'true' : 'false'}
                data-reveal={isRevealEnabled ? 'true' : 'false'}
                style={contentStyle}
                onClick={isRevealEnabled ? handleClick : undefined}
            >
                {showIcon ? (
                    <span
                        className="nn-parent-folder-icon"
                        ref={iconRef}
                        aria-hidden="true"
                        data-has-color={hasColor ? 'true' : 'false'}
                        style={iconStyle}
                    />
                ) : null}
                <span className={labelClassName} style={labelStyle} data-has-color={applyColorToName ? 'true' : 'false'}>
                    {label}
                </span>
            </div>
        </div>
    );
}

/**
 * Memoized FileItem component.
 * Renders an individual file item in the file list with preview text and metadata.
 * Displays the file name, date, preview text, and optional feature image.
 * Handles selection state, quick actions, and drag-and-drop functionality.
 *
 * @param props - The component props
 * @param props.file - The Obsidian TFile to display
 * @param props.isSelected - Whether this file is currently selected
 * @param props.onClick - Handler called when the file is clicked
 * @returns A file item element with name, date, preview and optional image
 */
export const FileItem = React.memo(function FileItem({
    file,
    paneProps,
    isSelected,
    hasSelectedAbove,
    hasSelectedBelow,
    showQuickActionsPanel,
    fileIndex,
    groupHeaderLabel,
    parentFolder,
    isPinned = false,
    searchMeta,
    matchedAliases,
    isHidden = false,
    shortcutKey,
    manualSortDisabled = false,
    inlineRename
}: FileItemProps) {
    const {
        onFileClick,
        selectionType,
        sortOption,
        searchQuery,
        onModifySearchWithTag,
        onModifySearchWithProperty,
        localDayReference,
        fileIconSize,
        appearanceSettings,
        includeDescendantNotes,
        hiddenTagVisibility,
        fileNameIconNeedles,
        visiblePropertyKeys,
        visibleNavigationPropertyKeys,
        fileItemStorage,
        onToggleNoteShortcut,
        folderDecorationModel,
        fileItemPillDecorationModel,
        fileItemPillOrderModel,
        getSolidBackground,
        disableNativeDrag = false
    } = paneProps;
    // === Hooks (all hooks together at the top) ===
    const { app, isMobile, plugin, commandQueue, fileSystemOps, tagOperations } = useServices();
    const settings = useSettingsState();
    const metadataService = useMetadataService();
    const { getFileDisplayName, getDB, getFileTimestamps, hasPreview, regenerateFeatureImageForFile } = fileItemStorage;
    const isCompactMode = appearanceSettings.mode === 'compact';
    const shouldShowWordCount = showsWordCount(settings.textCountDisplay);
    const shouldShowCharacterCount = showsCharacterCount(settings.textCountDisplay);
    const isMarkdownFile = file.extension === 'md';
    const canShowPropertyPills = isMarkdownFile && (!isCompactMode || settings.showFilePropertiesInCompactMode);
    const shouldLoadTags =
        isMarkdownFile && settings.showTags && settings.showFileTags && (!isCompactMode || settings.showFileTagsInCompactMode);
    const shouldLoadWordCountForDisplay =
        isMarkdownFile &&
        shouldShowWordCount &&
        (settings.textCountPlacement === 'title' || (settings.textCountPlacement === 'property' && canShowPropertyPills));
    const shouldLoadWordCount =
        shouldLoadWordCountForDisplay || (isMarkdownFile && !isMobile && settings.showTooltips && settings.showTooltipWordCount);
    const shouldLoadCharacterCount =
        isMarkdownFile &&
        shouldShowCharacterCount &&
        (settings.textCountPlacement === 'title' || (settings.textCountPlacement === 'property' && canShowPropertyPills));
    const shouldLoadProperties =
        isMarkdownFile &&
        ((canShowPropertyPills && settings.showFileProperties && visiblePropertyKeys.size > 0) ||
            (shouldLoadWordCountForDisplay && settings.wordCountTargetProperty.trim().length > 0));
    const shouldLoadTaskUnfinished =
        isMarkdownFile &&
        (settings.showFileIconUnfinishedTask || settings.showFileBackgroundUnfinishedTask || (!isMobile && settings.showTooltips));
    const shouldRefreshMetadataVersionOnFeatureImageChange = isMarkdownFile && appearanceSettings.showImage;
    const fileStatMtime = useImageFileResourceVersion(app, file, appearanceSettings.showImage && isRasterImageFile(file));
    const drawingFeatureImageSource = getDrawingFeatureImageSource(app, file);
    const isDrawingFeatureImageRow = drawingFeatureImageSource !== null;
    const {
        previewText,
        tags,
        featureImageKey,
        featureImageStatus,
        featureImageUrl,
        properties,
        wordCount,
        characterCountWithSpaces,
        characterCountWithoutSpaces,
        taskUnfinished,
        metadataVersion
    } = useFileItemContentState({
        app,
        file,
        showPreview: appearanceSettings.showPreview,
        showImage: appearanceSettings.showImage,
        skipFeatureImage: isDrawingFeatureImageRow,
        fileStatMtime,
        getDB,
        regenerateFeatureImageForFile,
        loadOptions: {
            loadPreviewText: appearanceSettings.showPreview && isMarkdownFile && !searchMeta?.excerpt,
            loadTags: shouldLoadTags,
            loadFeatureImage: appearanceSettings.showImage && !isDrawingFeatureImageRow,
            loadProperties: shouldLoadProperties,
            loadWordCount: shouldLoadWordCount,
            loadCharacterCount: shouldLoadCharacterCount,
            loadTaskUnfinished: shouldLoadTaskUnfinished
        },
        refreshMetadataVersionOnFeatureImageChange: shouldRefreshMetadataVersionOnFeatureImageChange
    });
    const drawingFeatureImage = useDrawingFeatureImage({
        app,
        file,
        enabled: appearanceSettings.showImage,
        source: drawingFeatureImageSource,
        metadataVersion
    });
    const effectiveFeatureImageUrl = drawingFeatureImage.url ?? (drawingFeatureImage.isDrawing ? null : featureImageUrl);
    const effectiveFeatureImageKey = drawingFeatureImage.key ?? featureImageKey;

    // === State ===
    const [featureImageAspectRatio, setFeatureImageAspectRatio] = useState<number | null>(null);
    const [isFeatureImageHidden, setIsFeatureImageHidden] = useState(false);

    // === Refs ===
    const fileRef = useRef<HTMLDivElement | null>(null);
    const revealInFolderIconRef = useRef<HTMLDivElement | null>(null);
    const addTagIconRef = useRef<HTMLDivElement | null>(null);
    const addShortcutIconRef = useRef<HTMLDivElement | null>(null);
    const pinNoteIconRef = useRef<HTMLDivElement | null>(null);
    const openInNewTabIconRef = useRef<HTMLDivElement | null>(null);
    const fileIconRef = useRef<HTMLSpanElement | null>(null);
    const featureImageImgRef = useRef<HTMLImageElement | null>(null);
    // Unique ID for linking screen reader description to the file item
    const hiddenDescriptionId = useId();

    // === Derived State & Memoized Values ===

    // Check which quick actions should be shown
    const shouldShowOpenInNewTab = settings.showQuickActions && settings.quickActionOpenInNewTab;
    const shouldShowPinNote = settings.showQuickActions && settings.quickActionPinNote;
    const shouldShowRevealIcon =
        settings.showQuickActions && settings.quickActionRevealInFolder && file.parent && file.parent.path !== parentFolder;
    const canAddTagsToFile = file.extension === 'md';
    const shouldShowAddTagAction = settings.showQuickActions && settings.quickActionAddTag && canAddTagsToFile && Boolean(tagOperations);
    const shouldShowShortcutAction = settings.showQuickActions && settings.quickActionAddToShortcuts;
    const hasQuickActions =
        shouldShowOpenInNewTab || shouldShowPinNote || shouldShowRevealIcon || shouldShowAddTagAction || shouldShowShortcutAction;
    const hasShortcut = typeof shortcutKey === 'string';
    const iconServiceVersion = useIconServiceVersion();
    const showFileIcons = settings.showFileIcons;
    const hasUnfinishedTasks = typeof taskUnfinished === 'number' && taskUnfinished > 0;
    const showFileIconUnfinishedTask = settings.showFileIconUnfinishedTask && hasUnfinishedTasks;
    const unfinishedTaskIconId = resolveUXIcon(settings.interfaceIcons, 'file-unfinished-task');
    const unfinishedTaskLabel = strings.modals.interfaceIcons.items['file-unfinished-task'];
    const unfinishedTaskTooltipText =
        hasUnfinishedTasks && typeof taskUnfinished === 'number' ? `${unfinishedTaskLabel}: ${taskUnfinished}` : null;

    // Get display name from RAM cache (handles frontmatter title)
    const displayName = getFileDisplayName(file);

    // Highlight matches in display name when search is active
    const highlightedName = useMemo(
        () => renderHighlightedText(displayName, searchQuery, searchMeta),
        [displayName, searchQuery, searchMeta]
    );

    // Decide whether to render an inline extension suffix after the name
    const extensionSuffix = getExtensionSuffix(file);
    const fileIconId = metadataService.getFileIcon(file.path);
    const fileColor = metadataService.getFileColor(file.path);
    const parentFolderSource = file.parent;
    const hasParentFolderSource = parentFolderSource instanceof TFolder;
    const shouldShowParentFolderLine = shouldShowFileItemParentFolderLine({
        showParentFolder: settings.showParentFolder,
        isPinned,
        selectionType,
        includeDescendantNotes,
        parentFolder,
        fileParentPath: parentFolderSource?.path ?? null
    });
    const shouldBuildParentFolderMeta = shouldShowParentFolderLine && hasParentFolderSource && parentFolderSource.path !== '/';
    const shouldShowParentFolderIcon = shouldBuildParentFolderMeta && settings.showParentFolderIcon;
    const shouldShowParentFolderColor = shouldBuildParentFolderMeta && settings.showParentFolderColor;
    const shouldResolveParentFolderDisplayName = shouldBuildParentFolderMeta && !settings.showParentFolderFullPath;
    const canUseFolderFileDecoration = !showFileIconUnfinishedTask;
    const shouldResolveFolderIcon = canUseFolderFileDecoration && settings.useFolderIconForFiles && !fileIconId && hasParentFolderSource;
    const shouldResolveFolderColorForFileDecoration =
        canUseFolderFileDecoration &&
        !fileColor &&
        hasParentFolderSource &&
        (settings.useFolderColorForTitles || settings.useFolderIconForFiles);
    const shouldResolveFolderColorForTitle =
        !settings.colorIconOnly && settings.useFolderColorForTitles && !fileColor && hasParentFolderSource;
    const shouldResolveFolderColor = shouldResolveFolderColorForFileDecoration || shouldResolveFolderColorForTitle;
    const parentFolderDisplayData =
        hasParentFolderSource &&
        (shouldResolveFolderIcon ||
            shouldResolveFolderColor ||
            shouldResolveParentFolderDisplayName ||
            shouldShowParentFolderIcon ||
            shouldShowParentFolderColor)
            ? metadataService.getFolderDisplayData(parentFolderSource.path, {
                  includeDisplayName: shouldResolveParentFolderDisplayName,
                  includeColor: shouldResolveFolderColor || shouldShowParentFolderColor,
                  includeBackgroundColor: shouldShowParentFolderColor,
                  includeIcon: shouldResolveFolderIcon || shouldShowParentFolderIcon,
                  includeInheritedColors: shouldResolveFolderColor || shouldShowParentFolderColor
              })
            : null;
    const folderIconId = shouldResolveFolderIcon ? parentFolderDisplayData?.icon : undefined;
    const folderListColor =
        shouldResolveFolderColor && hasParentFolderSource
            ? resolveFolderDecorationColors({
                  model: folderDecorationModel,
                  folderPath: parentFolderSource.path,
                  color: parentFolderDisplayData?.color,
                  backgroundColor: undefined
              }).color
            : undefined;
    const customFileBackgroundColor = metadataService.getFileBackgroundColor(file.path);
    const fileBackgroundColor = resolveFileRowBackgroundColor({
        customBackgroundColor: customFileBackgroundColor,
        taskUnfinished,
        showUnfinishedTaskBackground: settings.showFileBackgroundUnfinishedTask,
        unfinishedTaskBackgroundColor: settings.unfinishedTaskBackgroundColor,
        getSolidBackground
    });
    const fileExtension = file.extension.toLowerCase();
    const isBaseFile = fileExtension === 'base';
    const isCanvasFile = fileExtension === 'canvas';
    // Check if file is not natively supported by Obsidian (e.g., Office files, archives)
    const isExternalFile = !shouldDisplayFile(file, FILE_VISIBILITY.SUPPORTED, app);
    const fileIconColor = fileColor ?? folderListColor;
    const allowCategoryIcons = settings.showCategoryIcons || (settings.colorIconOnly && Boolean(fileIconColor));
    // Determine the actual icon to display, considering custom icon and colorIconOnly setting
    const effectiveFileIconId = useMemo(() => {
        void metadataVersion;
        if (showFileIconUnfinishedTask) {
            return unfinishedTaskIconId;
        }

        return resolveFileIconId(
            file,
            {
                showFilenameMatchIcons: settings.showFilenameMatchIcons,
                fileNameIconMap: settings.fileNameIconMap,
                showCategoryIcons: settings.showCategoryIcons,
                fileTypeIconMap: settings.fileTypeIconMap,
                fileTypeIconPreset: settings.fileTypeIconPreset,
                externalIconProviders: settings.externalIconProviders
            },
            {
                customIconId: fileIconId ?? folderIconId,
                metadataCache: app.metadataCache,
                isExternalFile,
                allowCategoryIcons,
                fallbackMode: allowCategoryIcons ? 'file' : 'none',
                fileNameNeedles: fileNameIconNeedles,
                fileNameForMatch: displayName
            }
        );
    }, [
        allowCategoryIcons,
        app.metadataCache,
        displayName,
        fileNameIconNeedles,
        fileIconId,
        folderIconId,
        file,
        isExternalFile,
        metadataVersion,
        settings.fileNameIconMap,
        settings.externalIconProviders,
        settings.fileTypeIconPreset,
        settings.fileTypeIconMap,
        settings.showCategoryIcons,
        settings.showFilenameMatchIcons,
        showFileIconUnfinishedTask,
        unfinishedTaskIconId
    ]);
    const fileTitleColor = !settings.colorIconOnly
        ? (fileColor ?? (settings.useFolderColorForTitles ? folderListColor : undefined))
        : undefined;
    const applyColorToName = Boolean(fileTitleColor);
    const dragFallbackIconId = useMemo(() => {
        void metadataVersion;
        return resolveFileDragIconId(
            file,
            settings.fileTypeIconMap,
            app.metadataCache,
            undefined,
            settings.fileTypeIconPreset,
            settings.externalIconProviders
        );
    }, [app.metadataCache, file, metadataVersion, settings.externalIconProviders, settings.fileTypeIconMap, settings.fileTypeIconPreset]);
    // Icon to use when dragging the file
    const dragIconId = effectiveFileIconId || dragFallbackIconId;

    // Determines whether to display the file icon based on icon availability
    const shouldShowFileIcon = showFileIcons && Boolean(effectiveFileIconId);
    const fileIconHasColor = Boolean(fileIconColor) && !showFileIconUnfinishedTask;
    const fileIconStyle = fileIconColor && !showFileIconUnfinishedTask ? ({ color: fileIconColor } as React.CSSProperties) : undefined;
    const fileIconClassName = showFileIconUnfinishedTask ? 'nn-file-icon nn-file-icon-unfinished-task' : 'nn-file-icon';
    const dragIconColor = showFileIconUnfinishedTask ? undefined : (fileIconColor ?? undefined);
    const shouldShowCompactExtensionBadge = isCompactMode && (isBaseFile || isCanvasFile);
    const wordCountDisplayText =
        shouldShowWordCount && file.extension === 'md'
            ? getWordCountDisplayText({
                  wordCount,
                  properties,
                  targetProperty: settings.wordCountTargetProperty,
                  showTargetPercentage: settings.showWordCountPercentage
              })
            : null;
    const selectedCharacterCount = settings.characterCountSpaces === 'include' ? characterCountWithSpaces : characterCountWithoutSpaces;
    const characterCountDisplayText =
        shouldShowCharacterCount && file.extension === 'md' ? getCharacterCountDisplayText(selectedCharacterCount) : null;
    const titleCountDisplayText = getTitleCountDisplayText({ wordCountDisplayText, characterCountDisplayText });
    const shouldShowCountInTitle = settings.textCountPlacement === 'title' && titleCountDisplayText !== null;

    const renameInputOptions = useMemo(
        () => (inlineRename ? fileSystemOps.getFileDisplayNameRenameInput(file) : null),
        [file, fileSystemOps, inlineRename]
    );
    const fileTitleElement = (() => {
        if (inlineRename && renameInputOptions) {
            return (
                <div
                    className="nn-file-name nn-file-name--inline-renaming"
                    data-has-color={applyColorToName ? 'true' : 'false'}
                    data-title-rows={appearanceSettings.titleRows}
                    style={
                        {
                            '--filename-rows': appearanceSettings.titleRows,
                            ...(applyColorToName ? { '--nn-file-name-custom-color': fileTitleColor } : {})
                        } as React.CSSProperties
                    }
                >
                    <InlineRenameInput
                        initialValue={renameInputOptions.initialValue}
                        ariaLabel={file.extension === 'md' ? strings.contextMenu.file.renameNote : strings.contextMenu.file.renameFile}
                        onCommit={value => inlineRename.onCommit(file, value)}
                        onCancel={inlineRename.onCancel}
                        onRestoreFocus={inlineRename.onRestoreFocus}
                        inputFilter={renameInputOptions.inputFilter}
                        onInputChange={renameInputOptions.onInputChange}
                        className="nn-file-inline-rename"
                    />
                    {extensionSuffix.length > 0 && <span className="nn-file-ext-suffix">{extensionSuffix}</span>}
                </div>
            );
        }

        return (
            <div
                className="nn-file-name"
                data-has-color={applyColorToName ? 'true' : 'false'}
                data-title-rows={appearanceSettings.titleRows}
                style={
                    {
                        '--filename-rows': appearanceSettings.titleRows,
                        ...(applyColorToName ? { '--nn-file-name-custom-color': fileTitleColor } : {})
                    } as React.CSSProperties
                }
            >
                {highlightedName}
                {matchedAliases && matchedAliases.length > 0 ? (
                    <span className="nn-file-alias-match">
                        <ObsidianIcon name="lucide-forward" className="nn-file-alias-match-icon" aria-hidden={true} />
                        <span>
                            {matchedAliases.map((matchedAlias, index) => (
                                <React.Fragment key={`${matchedAlias.value}-${index}`}>
                                    {index > 0 ? ', ' : null}
                                    {renderAliasSearchMatch(matchedAlias)}
                                </React.Fragment>
                            ))}
                        </span>
                    </span>
                ) : null}
                {shouldShowCountInTitle ? <span className="nn-file-word-count-suffix"> ({titleCountDisplayText})</span> : null}
                {extensionSuffix.length > 0 && <span className="nn-file-ext-suffix">{extensionSuffix}</span>}
            </div>
        );
    })();

    const { shouldShowFileTags, hasVisiblePillRows, pillRows } = useFileItemPills({
        file,
        isCompactMode,
        tags,
        properties,
        wordCount,
        characterCount: selectedCharacterCount,
        wordCountDisplayText,
        characterCountDisplayText,
        settings,
        visiblePropertyKeys,
        visibleNavigationPropertyKeys,
        hiddenTagVisibility,
        onModifySearchWithTag,
        onModifySearchWithProperty,
        fileItemPillDecorationModel,
        fileItemPillOrderModel
    });

    // Format display date based on current sort
    const displayDate = useMemo(() => {
        if (!appearanceSettings.showDate || !sortOption) return '';

        const timestamps = getFileTimestamps(file);
        const defaultDateField = resolveDefaultDateField(sortOption, settings.alphabeticalDateMode ?? 'modified');
        const timestamp = defaultDateField === 'created' ? timestamps.created : timestamps.modified;

        // Pinned items are all grouped under "📌 Pinned" section regardless of their actual dates
        // We need to calculate the actual date group to show smart formatting
        if (isPinned) {
            const actualDateGroup = DateUtils.getDateGroup(timestamp, localDayReference ?? undefined);
            return DateUtils.formatDateForGroup(timestamp, actualDateGroup, settings.dateFormat, settings.timeFormat);
        }

        // Date group labels use relative formatting; folder group labels fall back to the default date format.
        if (groupHeaderLabel && groupHeaderLabel !== strings.listPane.pinnedSection) {
            return DateUtils.formatDateForGroup(timestamp, groupHeaderLabel, settings.dateFormat, settings.timeFormat);
        }

        // Otherwise format as absolute date
        return DateUtils.formatDate(timestamp, settings.dateFormat);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- file.stat timestamps refresh dates when Obsidian mutates TFile objects.
    }, [
        file,
        file.stat.mtime,
        file.stat.ctime,
        sortOption,
        groupHeaderLabel,
        isPinned,
        appearanceSettings.showDate,
        settings.dateFormat,
        settings.timeFormat,
        settings.alphabeticalDateMode,
        getFileTimestamps,
        metadataVersion,
        localDayReference
    ]);

    const effectivePreviewText = searchMeta?.excerpt ? searchMeta.excerpt : previewText;
    const hasPreviewAccordingToStatus = appearanceSettings.showPreview && file.extension === 'md' ? hasPreview(file.path) : false;
    const hasPreviewContent = hasPreviewAccordingToStatus || effectivePreviewText.length > 0;
    const highlightedPreview = useMemo(
        // Only Omnisearch trigger highlighting in preview, not regular filter
        () => (searchMeta ? renderHighlightedText(effectivePreviewText, searchQuery, searchMeta) : effectivePreviewText),
        [effectivePreviewText, searchMeta, searchQuery]
    );
    const pinnedPreviewRows = isPinned ? 1 : appearanceSettings.previewRows;

    // Determine if we should show the feature image area (either with an image or extension badge)
    const showFeatureImageArea = shouldShowFeatureImageArea({
        showImage: appearanceSettings.showImage,
        file,
        featureImageStatus,
        hasFeatureImageUrl: Boolean(effectiveFeatureImageUrl),
        showDrawingFeatureImage: drawingFeatureImage.showsFeatureImageBox
    });
    const showDrawingMissingFeatureImage = drawingFeatureImage.isMissing;
    const showExtensionBadgeThumbnail = shouldShowExtensionBadgeThumbnail({
        showFeatureImageArea,
        file,
        hasFeatureImageUrl: Boolean(effectiveFeatureImageUrl),
        showDrawingMissingFeatureImage
    });
    const shouldShowPillRows = !showDrawingMissingFeatureImage;
    const effectiveShouldShowFileTags = shouldShowPillRows && shouldShowFileTags;
    const effectiveHasVisiblePillRows = shouldShowPillRows && hasVisiblePillRows;
    const renderedPillRows = shouldShowPillRows ? pillRows : null;

    const { shouldShowMultilinePreview, shouldShowDateForItem } = getFileItemLayoutState({
        isCompactMode,
        showDate: appearanceSettings.showDate,
        showPreview: appearanceSettings.showPreview,
        isPinned,
        hasPreviewContent,
        showFeatureImageArea,
        showExtensionBadgeThumbnail,
        hasVisiblePillRows: effectiveHasVisiblePillRows
    });

    let parentFolderMeta: {
        name: string;
        iconId: string;
        color?: string;
        backgroundColor?: string;
        applyColorToName: boolean;
        showIcon: boolean;
    } | null = null;
    if (shouldBuildParentFolderMeta && hasParentFolderSource) {
        const customParentIcon = shouldShowParentFolderIcon ? parentFolderDisplayData?.icon : undefined;
        const fallbackParentIcon = 'lucide-folder-closed';

        const parentFolderDecorationColors = shouldShowParentFolderColor
            ? resolveFolderDecorationColors({
                  model: folderDecorationModel,
                  folderPath: parentFolderSource.path,
                  color: parentFolderDisplayData?.color,
                  backgroundColor: parentFolderDisplayData?.backgroundColor
              })
            : { color: undefined, backgroundColor: undefined };
        const parentFolderColor = parentFolderDecorationColors.color;
        const shouldApplyParentFolderColor = Boolean(parentFolderColor);
        // Tag and property selections can retain the last selected folder, but only a folder selection establishes the
        // path base. Using that stale folder elsewhere would produce a label unrelated to the files in the current view.
        const baseFolderPath = selectionType === ItemType.FOLDER ? parentFolder : null;
        const parentFolderLabel = settings.showParentFolderFullPath
            ? resolveFolderDisplayPath({ metadataService, folderPath: parentFolderSource.path, baseFolderPath })
            : parentFolderDisplayData?.displayName || parentFolderSource.name;
        parentFolderMeta = {
            name: parentFolderLabel,
            iconId: customParentIcon ?? fallbackParentIcon,
            color: shouldApplyParentFolderColor ? parentFolderColor : undefined,
            backgroundColor: parentFolderDecorationColors.backgroundColor,
            applyColorToName: shouldApplyParentFolderColor && !settings.colorIconOnly,
            showIcon: shouldShowParentFolderIcon
        };
    }

    // Render parent folder label if metadata is available
    const renderParentFolder = () =>
        parentFolderMeta ? (
            <ParentFolderLabel
                iconId={parentFolderMeta.iconId}
                label={parentFolderMeta.name}
                iconVersion={iconServiceVersion}
                color={parentFolderMeta.color}
                backgroundColor={parentFolderMeta.backgroundColor}
                showIcon={parentFolderMeta.showIcon}
                applyColorToName={parentFolderMeta.applyColorToName}
                onReveal={settings.parentFolderClickRevealsFile ? revealFileInNavigation : undefined}
            />
        ) : null;
    const shouldShowMetadataLine = shouldShowDateForItem || parentFolderMeta !== null;

    // Reset image hidden state when the feature image URL changes
    useEffect(() => {
        setIsFeatureImageHidden(false);
    }, [effectiveFeatureImageKey, effectiveFeatureImageUrl]);

    const isDrawingFeatureImage = drawingFeatureImage.isDrawing;
    const useSquareFeatureImage = !effectiveFeatureImageUrl || settings.forceSquareFeatureImage;

    const featureImageContainerClasses = ['nn-file-thumbnail'];
    if (useSquareFeatureImage) {
        featureImageContainerClasses.push('nn-file-thumbnail--square');
    } else {
        featureImageContainerClasses.push('nn-file-thumbnail--natural');
    }
    if (effectiveFeatureImageUrl) {
        featureImageContainerClasses.push('nn-file-thumbnail--inset-highlight');
    }
    if (isDrawingFeatureImage) {
        featureImageContainerClasses.push('nn-file-thumbnail--drawing');
    }
    if (showExtensionBadgeThumbnail || showDrawingMissingFeatureImage) {
        featureImageContainerClasses.push('nn-file-thumbnail--extension-badge');
    }
    // Hide container if image failed to load
    if (isFeatureImageHidden) {
        featureImageContainerClasses.push('nn-file-thumbnail--hidden');
    }
    const featureImageContainerClassName = featureImageContainerClasses.join(' ');

    // The inset highlight overlay uses the thumbnail as a mask so it only covers opaque pixels.
    const featureImageMaskImage = effectiveFeatureImageUrl ? `url("${effectiveFeatureImageUrl.replace(/[\\"]/g, '\\$&')}")` : null;

    let featureImageStyle: React.CSSProperties | undefined;
    if (!useSquareFeatureImage) {
        featureImageStyle = { '--nn-file-thumbnail-aspect-ratio': featureImageAspectRatio ?? 1 } as React.CSSProperties;
    }
    if (featureImageMaskImage) {
        featureImageStyle = {
            ...featureImageStyle,
            '--nn-file-thumbnail-mask-image': featureImageMaskImage
        } as React.CSSProperties;
    }

    const handleFeatureImageLoad = useCallback(() => {
        if (useSquareFeatureImage) {
            return;
        }

        const image = featureImageImgRef.current;
        if (!image) {
            return;
        }

        const width = image.naturalWidth || image.width || 0;
        const height = image.naturalHeight || image.height || 0;

        if (width <= 0 || height <= 0) {
            setFeatureImageAspectRatio(null);
            return;
        }

        const ratio = width / height;
        const clampedRatio = Math.min(ratio, FEATURE_IMAGE_MAX_ASPECT_RATIO);
        setFeatureImageAspectRatio(clampedRatio);
    }, [useSquareFeatureImage]);
    const showTooltips = settings.showTooltips;

    const classes = ['nn-file'];
    if (isSelected) classes.push('nn-selected');
    if (isCompactMode) classes.push('nn-compact');
    if (isSelected && hasSelectedAbove) classes.push('nn-has-selected-above');
    if (isSelected && hasSelectedBelow) classes.push('nn-has-selected-below');
    if (fileBackgroundColor) classes.push('nn-has-custom-background');
    // Apply muted style when file is normally hidden but shown via "show hidden items"
    if (isHidden) classes.push('nn-hidden-file');
    if (manualSortDisabled) classes.push('nn-file-manual-sort-disabled');
    const className = classes.join(' ');

    const fileRowStyle = fileBackgroundColor
        ? ({
              '--nn-file-custom-bg-color': fileBackgroundColor
          } as React.CSSProperties)
        : undefined;

    // Screen reader description for files shown via "show hidden items" toggle
    const hiddenDescription = isHidden ? strings.listPane.hiddenItemAriaLabel.replace('{name}', displayName) : undefined;

    useEffect(() => {
        if (useSquareFeatureImage) {
            setFeatureImageAspectRatio(null);
            return;
        }

        setFeatureImageAspectRatio(null);
        // If the already-rendered image is cached and completes synchronously,
        // compute the aspect ratio immediately without forcing a second decode.
        const image = featureImageImgRef.current;
        if (image && image.complete) {
            const width = image.naturalWidth || image.width || 0;
            const height = image.naturalHeight || image.height || 0;
            if (width > 0 && height > 0) {
                const ratio = width / height;
                const clampedRatio = Math.min(ratio, FEATURE_IMAGE_MAX_ASPECT_RATIO);
                setFeatureImageAspectRatio(clampedRatio);
            }
        }
    }, [effectiveFeatureImageUrl, useSquareFeatureImage]);

    // Add Obsidian tooltip (desktop only)
    useEffect(() => {
        if (!fileRef.current) return;

        // Skip tooltips on mobile
        if (isMobile) return;

        // Remove tooltip if disabled
        if (!showTooltips) {
            setTooltip(fileRef.current, '');
            return;
        }

        const tooltip = buildFileTooltip({
            file,
            displayName,
            extensionSuffix,
            settings: {
                dateFormat: settings.dateFormat,
                timeFormat: settings.timeFormat,
                showTooltipPath: settings.showTooltipPath,
                showTooltipWordCount: settings.showTooltipWordCount
            },
            getFileTimestamps,
            sortOption,
            unfinishedTaskTooltipText,
            wordCount
        });

        setTooltip(fileRef.current, tooltip, {
            placement: getTooltipPlacement()
        });
    }, [
        isMobile,
        file,
        file.stat.ctime,
        file.stat.mtime,
        showTooltips,
        settings.dateFormat,
        settings.timeFormat,
        settings.showTooltipPath,
        settings.showTooltipWordCount,
        displayName,
        extensionSuffix,
        getFileTimestamps,
        sortOption,
        metadataVersion,
        file.name,
        unfinishedTaskTooltipText,
        wordCount
    ]);

    // Reveals the file by selecting its folder in navigation pane and showing the file in list pane
    const revealFileInNavigation = () => {
        runAsyncAction(async () => {
            await plugin.activateView();
            await plugin.revealFileInActualFolder(file, { showHiddenFileNotice: true });
        });
    };

    const pinContext = getNavigatorPinContext(selectionType ?? null);
    const isPinnedInCurrentContext = metadataService.isFilePinned(file.path, pinContext);

    // Quick action handlers are used only by local action elements.
    const handleOpenInNewTab = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        runAsyncAction(() => openFileInContext({ app, commandQueue, file, context: 'tab' }));
    };

    // Toggle pin status for the file in the current context
    const handlePinClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        runAsyncAction(async () => {
            if (!file.parent) {
                return;
            }

            await metadataService.togglePin(file.path, pinContext);
        });
    };

    const handleShortcutToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        runAsyncAction(async () => onToggleNoteShortcut(file, shortcutKey));
    };

    // Reveal the file in its actual folder in the navigator
    const handleRevealClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        revealFileInNavigation();
    };

    const handleAddTagClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!tagOperations) {
            return;
        }

        openAddTagToFilesModal({
            app,
            plugin,
            tagOperations,
            files: [file]
        });
    };

    // Handle middle mouse button click to open in new tab
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 1) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        runAsyncAction(() => openFileInContext({ app, commandQueue, file, context: 'tab' }));
    };

    const quickActionItems: { key: string; element: React.ReactNode }[] = [];

    if (showQuickActionsPanel && shouldShowRevealIcon) {
        quickActionItems.push({
            key: 'reveal',
            element: (
                <div
                    ref={revealInFolderIconRef}
                    className="nn-quick-action-item"
                    onClick={handleRevealClick}
                    title={strings.contextMenu.file.revealInFolder}
                />
            )
        });
    }

    if (showQuickActionsPanel && shouldShowAddTagAction) {
        quickActionItems.push({
            key: 'add-tag',
            element: (
                <div
                    ref={addTagIconRef}
                    className="nn-quick-action-item"
                    onClick={handleAddTagClick}
                    title={strings.contextMenu.file.addTag}
                />
            )
        });
    }

    if (showQuickActionsPanel && shouldShowShortcutAction) {
        quickActionItems.push({
            key: 'shortcut',
            element: (
                <div
                    ref={addShortcutIconRef}
                    className="nn-quick-action-item"
                    onClick={handleShortcutToggle}
                    title={hasShortcut ? strings.shortcuts.remove : strings.shortcuts.add}
                />
            )
        });
    }

    if (showQuickActionsPanel && shouldShowPinNote) {
        quickActionItems.push({
            key: 'pin',
            element: (
                <div
                    ref={pinNoteIconRef}
                    className="nn-quick-action-item"
                    onClick={handlePinClick}
                    title={
                        isPinnedInCurrentContext
                            ? file.extension === 'md'
                                ? strings.contextMenu.file.unpinNote
                                : strings.contextMenu.file.unpinFile
                            : file.extension === 'md'
                              ? strings.contextMenu.file.pinNote
                              : strings.contextMenu.file.pinFile
                    }
                />
            )
        });
    }

    if (showQuickActionsPanel && shouldShowOpenInNewTab) {
        quickActionItems.push({
            key: 'new-tab',
            element: (
                <div
                    ref={openInNewTabIconRef}
                    className="nn-quick-action-item"
                    onClick={handleOpenInNewTab}
                    title={strings.contextMenu.file.openInNewTab}
                />
            )
        });
    }

    // === Effects ===

    // Renders the file icon in the DOM using the icon service
    useEffect(() => {
        const iconContainer = fileIconRef.current;
        if (!iconContainer) {
            return;
        }

        iconContainer.innerHTML = '';
        if (!shouldShowFileIcon) {
            return;
        }

        const iconId = effectiveFileIconId;
        if (!iconId) {
            return;
        }
        const iconService = getIconService();
        iconService.renderIcon(iconContainer, iconId, fileIconSize);
    }, [effectiveFileIconId, iconServiceVersion, shouldShowFileIcon, isCompactMode, fileIconSize]);

    // Set up quick action icons after their elements mount.
    useEffect(() => {
        if (isMobile || !showQuickActionsPanel) {
            return;
        }

        if (revealInFolderIconRef.current && shouldShowRevealIcon) {
            setIcon(revealInFolderIconRef.current, 'lucide-folder-search');
        }
        if (addTagIconRef.current && shouldShowAddTagAction) {
            setIcon(addTagIconRef.current, 'lucide-tag');
        }
        if (addShortcutIconRef.current && shouldShowShortcutAction) {
            setIcon(addShortcutIconRef.current, hasShortcut ? 'lucide-star-off' : 'lucide-star');
        }
        if (pinNoteIconRef.current && shouldShowPinNote) {
            setIcon(pinNoteIconRef.current, isPinnedInCurrentContext ? 'lucide-pin-off' : 'lucide-pin');
        }
        if (openInNewTabIconRef.current && shouldShowOpenInNewTab) {
            setIcon(openInNewTabIconRef.current, 'lucide-file-plus');
        }
    }, [
        isMobile,
        shouldShowOpenInNewTab,
        shouldShowPinNote,
        shouldShowRevealIcon,
        shouldShowAddTagAction,
        shouldShowShortcutAction,
        showQuickActionsPanel,
        hasShortcut,
        isPinnedInCurrentContext
    ]);

    // Wrap onFileClick to pass file and fileIndex
    const handleItemClick = useCallback(
        (event: React.MouseEvent) => {
            onFileClick(file, fileIndex, event);
        },
        [file, fileIndex, onFileClick]
    );

    return (
        <div
            ref={fileRef}
            className={className}
            data-path={file.path}
            // Path to use when this file is dragged
            data-drag-path={file.path}
            // Type of item being dragged (folder, file, or tag)
            data-drag-type="file"
            // Marks element as draggable for event delegation
            data-draggable={!isMobile && !disableNativeDrag ? 'true' : undefined}
            // Icon to display in drag preview
            data-drag-icon={dragIconId}
            // Default icon displayed if the custom drag preview icon is unavailable
            data-drag-fallback-icon={dragFallbackIconId}
            // Icon color to display in drag preview
            data-drag-icon-color={dragIconColor}
            onClick={handleItemClick}
            onMouseDown={handleMouseDown}
            draggable={!isMobile && !disableNativeDrag}
            role="listitem"
            aria-describedby={hiddenDescription ? hiddenDescriptionId : undefined}
            style={fileRowStyle}
        >
            <div className="nn-file-content">
                {/* Quick actions mount only for the row currently tracked by the list pane hover state. */}
                {!isMobile && hasQuickActions && showQuickActionsPanel && (
                    <div
                        className={`nn-quick-actions-panel ${isCompactMode ? 'nn-compact-mode' : ''}`}
                        data-title-rows={appearanceSettings.titleRows}
                        data-has-tags={effectiveShouldShowFileTags ? 'true' : 'false'}
                    >
                        {quickActionItems.map((action, index) => (
                            <React.Fragment key={action.key}>
                                {index > 0 && <div className="nn-quick-action-separator" />}
                                {action.element}
                            </React.Fragment>
                        ))}
                    </div>
                )}
                <div className="nn-file-inner-content">
                    {showFileIcons ? (
                        <div className="nn-file-icon-slot">
                            {shouldShowFileIcon ? (
                                <span
                                    ref={fileIconRef}
                                    className={fileIconClassName}
                                    data-has-color={fileIconHasColor ? 'true' : 'false'}
                                    style={fileIconStyle}
                                    title={
                                        !isMobile && !settings.showTooltips && showFileIconUnfinishedTask
                                            ? (unfinishedTaskTooltipText ?? undefined)
                                            : undefined
                                    }
                                />
                            ) : null}
                        </div>
                    ) : null}
                    {isCompactMode ? (
                        // ========== COMPACT MODE ==========
                        // Minimal layout: file name + pills
                        // Used when the current list appearance mode is compact
                        <div className="nn-compact-file-text-content">
                            <div className="nn-compact-file-header">
                                {fileTitleElement}
                                {shouldShowCompactExtensionBadge ? (
                                    <div className="nn-compact-extension-badge" aria-hidden="true">
                                        <div className="nn-file-icon-rectangle">
                                            <span className="nn-file-icon-rectangle-text">{fileExtension}</span>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            {renderedPillRows}
                        </div>
                    ) : (
                        // ========== NORMAL MODE ==========
                        // Full layout with all enabled elements
                        <>
                            <div className="nn-file-text-content">
                                {fileTitleElement}

                                {/* Multi-row preview clamps to the configured row count. */}
                                {shouldShowMultilinePreview && (
                                    <div className="nn-file-preview" style={{ '--preview-rows': pinnedPreviewRows } as React.CSSProperties}>
                                        {highlightedPreview}
                                    </div>
                                )}

                                {/* Pills */}
                                {renderedPillRows}

                                {/* Date + Parent folder share the metadata line */}
                                {shouldShowMetadataLine && (
                                    <div className="nn-file-second-line">
                                        {shouldShowDateForItem && <div className="nn-file-date">{displayDate}</div>}
                                        {renderParentFolder()}
                                    </div>
                                )}
                            </div>
                            {/* ========== FEATURE IMAGE AREA ========== */}
                            {/* Shows either actual image or extension badge for non-markdown files */}
                            {showFeatureImageArea && (
                                <div className={featureImageContainerClassName} style={featureImageStyle}>
                                    {effectiveFeatureImageUrl ? (
                                        <img
                                            key={effectiveFeatureImageKey ?? effectiveFeatureImageUrl}
                                            src={effectiveFeatureImageUrl}
                                            alt={strings.common.featureImageAlt}
                                            className="nn-file-thumbnail-img"
                                            ref={featureImageImgRef}
                                            draggable={false}
                                            onDragStart={e => e.preventDefault()}
                                            onLoad={handleFeatureImageLoad}
                                            // Hide the image container when image fails to load
                                            onError={() => {
                                                setIsFeatureImageHidden(true);
                                            }}
                                        />
                                    ) : showDrawingMissingFeatureImage ? (
                                        <div className="nn-file-extension-badge nn-file-extension-badge--drawing" aria-hidden="true">
                                            <ServiceIcon
                                                iconId={drawingFeatureImage.iconId ?? 'brush'}
                                                className="nn-file-extension-icon"
                                                aria-hidden={true}
                                            />
                                        </div>
                                    ) : showExtensionBadgeThumbnail ? (
                                        <div className="nn-file-extension-badge">
                                            <span className="nn-file-extension-text">{file.extension}</span>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {/* Screen reader announcement for hidden files */}
            {hiddenDescription ? (
                <span id={hiddenDescriptionId} className="nn-visually-hidden">
                    {hiddenDescription}
                </span>
            ) : null}
        </div>
    );
});
