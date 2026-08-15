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
import { describe, expect, it } from 'vitest';
import { getReleaseBannerUrl, getReleaseVideoOpenUrl, getReleaseVideoUrl } from '../../src/constants/urls';

describe('release banner URLs', () => {
    it('keeps the file extension declared by the release note', () => {
        expect(getReleaseBannerUrl('3.3.4.gif')).toBe(
            'https://raw.githubusercontent.com/johansan/notebook-navigator/main/images/version-banners/3.3.4.gif'
        );
        expect(getReleaseBannerUrl('3.3.3.jpg')).toBe(
            'https://raw.githubusercontent.com/johansan/notebook-navigator/main/images/version-banners/3.3.3.jpg'
        );
    });
});

describe('release video URLs', () => {
    it('uses raw GitHub URLs for embedded release videos', () => {
        expect(getReleaseVideoUrl(true, '3.1.3')).toBe(
            'https://raw.githubusercontent.com/johansan/notebook-navigator/main/images/version-banners/3.1.3.mp4'
        );
        expect(getReleaseVideoUrl('sidebar-resize', '3.1.3')).toBe(
            'https://raw.githubusercontent.com/johansan/notebook-navigator/main/images/version-banners/sidebar-resize.mp4'
        );
    });

    it('uses browser-playable CDN URLs when opening repository-hosted release videos', () => {
        expect(getReleaseVideoOpenUrl(true, '3.1.3')).toBe(
            'https://cdn.jsdelivr.net/gh/johansan/notebook-navigator@main/images/version-banners/3.1.3.mp4'
        );
        expect(getReleaseVideoOpenUrl('sidebar-resize', '3.1.3')).toBe(
            'https://cdn.jsdelivr.net/gh/johansan/notebook-navigator@main/images/version-banners/sidebar-resize.mp4'
        );
    });

    it('keeps explicit release video URLs unchanged', () => {
        const url = 'https://example.com/video.mp4';

        expect(getReleaseVideoUrl(url, '3.1.3')).toBe(url);
        expect(getReleaseVideoOpenUrl(url, '3.1.3')).toBe(url);
    });

    it('returns null for missing release video sources', () => {
        expect(getReleaseVideoUrl(false, '3.1.3')).toBeNull();
        expect(getReleaseVideoOpenUrl(false, '3.1.3')).toBeNull();
        expect(getReleaseVideoUrl('', '3.1.3')).toBeNull();
        expect(getReleaseVideoOpenUrl('', '3.1.3')).toBeNull();
    });
});
