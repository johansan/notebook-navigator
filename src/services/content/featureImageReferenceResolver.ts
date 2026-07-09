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

import { normalizePath, type App, type FrontMatterCache, TFile } from 'obsidian';
import type { NotebookNavigatorSettings } from '../../settings/types';
import { isPdfFile, isRasterImageExtension, isRasterImageFile, isSvgExtension, isSvgFile } from '../../utils/fileTypeUtils';
import { getMatchingRecordValue } from '../../utils/recordUtils';
import { getYoutubeVideoId } from '../../utils/youtubeUtils';

export type FeatureImageReference =
    { kind: 'local'; file: TFile } | { kind: 'external'; url: string } | { kind: 'youtube'; videoId: string };

type FrontmatterImageTarget = { kind: 'wiki' | 'md' | 'plain'; target: string };

const wikiImagePattern = `!\\[\\[(?<wikiImage>(?:[^\\]]|\\](?!\\]))+)\\]\\]`;
const mdImagePattern = `!\\[[^\\]]*\\]\\((?<mdImage>(?:https?:\\/\\/(?:[^)\\r\\n(]|\\([^()\\r\\n]*\\))+|[^)\\r\\n]+))\\)`;

const markdownImageRegex = new RegExp(mdImagePattern, 'i');
const createCombinedImageRegex = () => new RegExp([wikiImagePattern, mdImagePattern].join('|'), 'ig');

function normalizeExternalUrl(url: string): string {
    try {
        const parsed = new URL(url);
        parsed.hash = '';
        return parsed.toString();
    } catch {
        return url;
    }
}

function isHttpUrl(value: string): boolean {
    return value.trim().toLowerCase().startsWith('http://');
}

function getPathExtension(target: string): string | null {
    const withoutSuffix = target.split(/[?#]/, 1)[0];
    const lastDot = withoutSuffix.lastIndexOf('.');
    if (lastDot === -1 || lastDot === withoutSuffix.length - 1) {
        return null;
    }

    const extension = withoutSuffix.slice(lastDot + 1);
    return extension.length > 0 ? extension : null;
}

// Checks whether an external image URL points at an SVG file by its path extension.
export function hasSvgUrlPathExtension(url: string): boolean {
    try {
        return isSvgExtension(getPathExtension(new URL(url).pathname) ?? '');
    } catch {
        return false;
    }
}

export function isValidHttpsUrl(value: string): boolean {
    const trimmed = value.trim();
    if (trimmed.length < 8 || trimmed.slice(0, 8).toLowerCase() !== 'https://') {
        return false;
    }

    try {
        const url = new URL(trimmed);
        return url.protocol === 'https:';
    } catch {
        return false;
    }
}

function createExternalReference(url: string, settings: NotebookNavigatorSettings): FeatureImageReference | null {
    if (!settings.downloadExternalFeatureImages) {
        return null;
    }

    const normalized = normalizeExternalUrl(url.trim());
    const videoId = getYoutubeVideoId(normalized);
    if (videoId) {
        return { kind: 'youtube', videoId };
    }
    return { kind: 'external', url: normalized };
}

function extractWikiLinkTarget(value: string): string | undefined {
    const wikiMatch = value.match(/!?\[\[(.*?)\]\]/);
    return wikiMatch ? wikiMatch[1] : undefined;
}

function stripLinkMetadata(value: string): string {
    return value.split('|')[0].split(/[?#]/, 1)[0].trim();
}

function stripMarkdownImageTitle(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return trimmedValue;
    }

    const titlePattern = /\s+(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\((?:[^)\\]|\\.)*\))\s*$/;
    const match = titlePattern.exec(trimmedValue);
    if (!match) {
        return trimmedValue;
    }

    const candidate = trimmedValue.slice(0, match.index).trimEnd();
    return candidate || trimmedValue;
}

function safeDecodeLinkComponent(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function hasUnsupportedEmbedExtension(target: string): boolean {
    const extension = getPathExtension(target);
    if (!extension) {
        return false;
    }

    return extension.length > 0 && !isRasterImageExtension(extension) && !isSvgExtension(extension) && extension.toLowerCase() !== 'pdf';
}

function resolveLocalFeatureFile(app: App, imagePath: string, contextFile: TFile): TFile | null {
    const trimmedPath = imagePath.trim();
    const resolvedFromCache = app.metadataCache.getFirstLinkpathDest(trimmedPath, contextFile.path);
    if (
        resolvedFromCache instanceof TFile &&
        (isRasterImageFile(resolvedFromCache) || isSvgFile(resolvedFromCache) || isPdfFile(resolvedFromCache))
    ) {
        return resolvedFromCache;
    }

    const normalizedPath = normalizePath(trimmedPath);
    const abstractFile = app.vault.getAbstractFileByPath(normalizedPath);
    if (abstractFile instanceof TFile && (isRasterImageFile(abstractFile) || isSvgFile(abstractFile) || isPdfFile(abstractFile))) {
        return abstractFile;
    }

    return null;
}

function extractFrontmatterStringValues(value: FrontMatterCache[keyof FrontMatterCache]): string[] {
    if (typeof value === 'string') {
        return [value];
    }

    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string');
    }

    return [];
}

function extractFrontmatterImageTarget(rawValue: string): FrontmatterImageTarget | null {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) {
        return null;
    }

    const wikiTarget = extractWikiLinkTarget(trimmedValue);
    if (wikiTarget) {
        return { kind: 'wiki', target: wikiTarget };
    }

    const mdMatch = markdownImageRegex.exec(trimmedValue);
    if (mdMatch?.groups?.mdImage) {
        return { kind: 'md', target: mdMatch.groups.mdImage };
    }

    return { kind: 'plain', target: trimmedValue };
}

function normalizeFrontmatterImageTarget(extracted: FrontmatterImageTarget): string {
    let path = extracted.target.split('|')[0].trim();

    if (extracted.kind === 'md') {
        path = stripMarkdownImageTitle(path).trim();
    }

    if (isValidHttpsUrl(path)) {
        return normalizeExternalUrl(path);
    }

    path = safeDecodeLinkComponent(path);
    return path.split(/[?#]/, 1)[0].trim();
}

function resolveMarkdownImageTarget(
    app: App,
    rawTarget: string,
    contextFile: TFile,
    settings: NotebookNavigatorSettings
): FeatureImageReference | null {
    const sanitizedMdImage = stripMarkdownImageTitle(rawTarget);
    const trimmedMdImage = sanitizedMdImage.trim();
    if (!trimmedMdImage) {
        return null;
    }

    if (isHttpUrl(trimmedMdImage)) {
        return null;
    }

    if (isValidHttpsUrl(trimmedMdImage)) {
        return createExternalReference(trimmedMdImage, settings);
    }

    const decodedLocalTarget = safeDecodeLinkComponent(trimmedMdImage);
    const localTarget = stripLinkMetadata(decodedLocalTarget);
    if (!localTarget) {
        return null;
    }
    if (hasUnsupportedEmbedExtension(localTarget)) {
        return null;
    }

    const resolvedMdImage = resolveLocalFeatureFile(app, localTarget, contextFile);
    if (resolvedMdImage) {
        return { kind: 'local', file: resolvedMdImage };
    }

    return null;
}

function resolveDocumentImageMatch(
    app: App,
    match: RegExpExecArray,
    contextFile: TFile,
    settings: NotebookNavigatorSettings
): FeatureImageReference | null {
    const groups = match.groups;
    if (groups?.wikiImage) {
        const wikiTarget = safeDecodeLinkComponent(groups.wikiImage);
        const cleanedTarget = stripLinkMetadata(wikiTarget);
        if (!cleanedTarget) {
            return null;
        }
        if (hasUnsupportedEmbedExtension(cleanedTarget)) {
            return null;
        }
        const resolvedWikiImage = resolveLocalFeatureFile(app, cleanedTarget, contextFile);
        if (resolvedWikiImage) {
            return { kind: 'local', file: resolvedWikiImage };
        }
        return null;
    }

    if (groups?.mdImage) {
        return resolveMarkdownImageTarget(app, groups.mdImage, contextFile, settings);
    }

    return null;
}

type FeatureImageReferenceParams = {
    app: App;
    file: TFile;
    content: string;
    settings: NotebookNavigatorSettings;
    frontmatter: FrontMatterCache | null;
    bodyStartIndex: number;
};

/**
 * Returns the first feature image reference in resolution order: frontmatter properties first, then document embeds.
 */
export function findFeatureImageReference(params: FeatureImageReferenceParams): FeatureImageReference | null {
    const frontmatter = params.frontmatter;
    if (frontmatter) {
        for (const property of params.settings.featureImageProperties) {
            const candidates = extractFrontmatterStringValues(getMatchingRecordValue(frontmatter, property));

            for (const candidate of candidates) {
                const extracted = extractFrontmatterImageTarget(candidate);
                if (!extracted) {
                    continue;
                }

                const normalized = normalizeFrontmatterImageTarget(extracted);
                if (!normalized) {
                    continue;
                }

                if (isHttpUrl(normalized)) {
                    continue;
                }

                if (isValidHttpsUrl(normalized)) {
                    const external = createExternalReference(normalized, params.settings);
                    if (external) {
                        return external;
                    }
                    continue;
                }

                const resolved = resolveLocalFeatureFile(params.app, normalized, params.file);
                if (resolved) {
                    return { kind: 'local', file: resolved };
                }
            }
        }
    }

    if (params.content.length === 0) {
        return null;
    }

    const combinedImageRegex = createCombinedImageRegex();
    combinedImageRegex.lastIndex = Math.min(Math.max(0, params.bodyStartIndex), params.content.length);
    let match: RegExpExecArray | null;

    while ((match = combinedImageRegex.exec(params.content)) !== null) {
        const reference = resolveDocumentImageMatch(params.app, match, params.file, params.settings);
        if (reference) {
            return reference;
        }
    }

    return null;
}
