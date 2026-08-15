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

const NOTEBOOK_NAVIGATOR_REPOSITORY = 'johansan/notebook-navigator';
const NOTEBOOK_NAVIGATOR_RAW_BASE_URL = `https://raw.githubusercontent.com/${NOTEBOOK_NAVIGATOR_REPOSITORY}/main`;
const NOTEBOOK_NAVIGATOR_CDN_BASE_URL = `https://cdn.jsdelivr.net/gh/${NOTEBOOK_NAVIGATOR_REPOSITORY}@main`;

export const NOTEBOOK_NAVIGATOR_RELEASE_CHECK_URL = `https://api.github.com/repos/${NOTEBOOK_NAVIGATOR_REPOSITORY}/releases/latest`;

export const SUPPORT_SPONSOR_URL = 'https://github.com/sponsors/johansan/';
export const SUPPORT_BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/johansan';

export const MOMENT_FORMAT_DOCS_URL = 'https://momentjs.com/docs/#/displaying/format/';
export const ICON_ASSETS_REPOSITORY_URL = `https://github.com/${NOTEBOOK_NAVIGATOR_REPOSITORY}/tree/main/icon-assets`;

export const WELCOME_VIDEO_URL = 'https://www.youtube.com/watch?v=m2maDNtho7Y';

/** Opens a plugin's page in Obsidian's community plugin browser. */
export function communityPluginUrl(pluginId: string): string {
    return `obsidian://show-plugin?id=${pluginId}`;
}

/** Builds a repository URL from a release banner filename, including its extension. */
export function getReleaseBannerUrl(fileName: string): string {
    return `${NOTEBOOK_NAVIGATOR_RAW_BASE_URL}/images/version-banners/${fileName}`;
}

export function getReleaseVideoUrl(videoUrl: boolean | string | undefined, version: string): string | null {
    if (!videoUrl) {
        return null;
    }

    const videoSource = videoUrl === true ? version : videoUrl.trim();
    if (videoSource.length === 0) {
        return null;
    }

    if (/^https?:\/\//i.test(videoSource)) {
        return videoSource;
    }

    return `${NOTEBOOK_NAVIGATOR_RAW_BASE_URL}/images/version-banners/${videoSource}.mp4`;
}

export function getReleaseVideoOpenUrl(videoUrl: boolean | string | undefined, version: string): string | null {
    if (!videoUrl) {
        return null;
    }

    const videoSource = videoUrl === true ? version : videoUrl.trim();
    if (videoSource.length === 0) {
        return null;
    }

    if (/^https?:\/\//i.test(videoSource)) {
        return videoSource;
    }

    return `${NOTEBOOK_NAVIGATOR_CDN_BASE_URL}/images/version-banners/${videoSource}.mp4`;
}
