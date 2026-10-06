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

import { setIcon, type SettingDefinitionGroup } from 'obsidian';
import { MARKDOWNPOINT_URL } from '../constants/urls';
import { strings } from '../i18n';
import { STORAGE_KEYS } from '../types';
import { localStorage } from '../utils/localStorage';
import {
    MARKDOWNPOINT_BANNER_DESIGNS,
    MARKDOWNPOINT_WORDMARK_ON_DARK,
    MARKDOWNPOINT_WORDMARK_ON_LIGHT
} from './markdownPointBannerDesigns';
import { createGroupDefinition, createRenderDefinition } from './nativeSettingControls';
import { createSettingGroupFactory } from './settingGroups';

/*
 * A static banner for MarkdownPoint, the author's presentation app, at the top of the settings start
 * page. Everything it shows is bundled with the plugin; nothing is loaded from the network. It never
 * moves on screen: each time settings open it shows the next message and the next design, taken from
 * the light designs in Obsidian's light theme and from the dark designs in its dark theme.
 */

// Ends a headline on its punctuation mark, which the banner draws in MarkdownPoint's mandarin
const HEADLINE_POINT_REGEX = /[.?!。？！]$/u;

/**
 * Moves the banner on by one on this device and returns its new position. Called once per settings
 * open; the position picks both the design and the message.
 */
export function advanceMarkdownPointBanner(): number {
    // A multiple of the message count and of both theme sets' sizes, so every set steps evenly when the position wraps
    const darkCount = MARKDOWNPOINT_BANNER_DESIGNS.filter(design => design.dark).length;
    const lightCount = MARKDOWNPOINT_BANNER_DESIGNS.length - darkCount;
    const cycle = strings.settings.items.markdownPointBanner.messages.length * lightCount * darkCount;
    // Stores the shown position plus one, which is also the next position, because Obsidian's
    // saveLocalStorage removes the key for a falsy value; a stored 0 would be lost and the banner
    // would show the first design on every open.
    const stored = localStorage.get<unknown>(STORAGE_KEYS.markdownPointBannerKey);
    const position = typeof stored === 'number' && Number.isSafeInteger(stored) && stored > 0 ? stored % cycle : 0;
    localStorage.set(STORAGE_KEYS.markdownPointBannerKey, position + 1);
    return position;
}

function svgDataUrl(svg: string): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Writes a slide's text as presentation.md has it, with ==marks== dimmed and the marked words in the slide's accent. */
function appendMarkdownSource(parentEl: HTMLElement, eyebrow: string, statement: string): void {
    parentEl.appendText(`${eyebrow}\n`);
    let isHighlighted = false;
    for (const part of statement.split(/(==|<br>)/)) {
        if (part === '==' || part === '<br>') {
            parentEl.createSpan({ cls: 'nn-markdownpoint-mark', text: part });
            isHighlighted = part === '==' ? !isHighlighted : isHighlighted;
        } else if (part) {
            parentEl.createSpan({ cls: isHighlighted ? 'nn-markdownpoint-highlight' : undefined, text: part });
        }
    }
}

function appendHeadline(parentEl: HTMLElement, headline: string): void {
    const point = HEADLINE_POINT_REGEX.exec(headline)?.[0];
    if (!point) {
        parentEl.appendText(headline);
        return;
    }
    parentEl.appendText(headline.slice(0, -point.length));
    parentEl.createSpan({ cls: 'nn-markdownpoint-point', text: point });
}

/** Renders the banner for a position from advanceMarkdownPointBanner(). */
function renderMarkdownPointBanner(containerEl: HTMLElement, position: number): void {
    const { messages, credit } = strings.settings.items.markdownPointBanner;
    // The theme is read on every render, so a theme change shows the next time the banner renders
    const isDarkTheme = containerEl.ownerDocument.body.classList.contains('theme-dark');
    const designs = MARKDOWNPOINT_BANNER_DESIGNS.filter(candidate => candidate.dark === isDarkTheme);
    const design = designs[position % designs.length];
    const message = messages[position % messages.length];

    // The banner takes the design's colors, so it looks the same in light and dark themes
    const bannerEl = containerEl.createDiv({ cls: 'nn-markdownpoint-banner' });
    bannerEl.toggleClass('nn-markdownpoint-banner-dark', design.dark);
    bannerEl.setCssProps({
        '--nn-markdownpoint-canvas': design.colors.canvas,
        '--nn-markdownpoint-surface': design.colors.surface,
        '--nn-markdownpoint-text': design.colors.text,
        '--nn-markdownpoint-muted': design.colors.muted,
        '--nn-markdownpoint-accent': design.colors.accent
    });

    // The whole strip is one link
    const stripEl = bannerEl.createDiv({ cls: 'nn-markdownpoint-strip', attr: { role: 'link', tabindex: '0' } });
    const openSite = () => window.open(MARKDOWNPOINT_URL);
    stripEl.addEventListener('click', openSite);
    stripEl.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            openSite();
        }
    });

    // The slide's Markdown file lies behind the slide it makes
    const visualEl = stripEl.createDiv({ cls: 'nn-markdownpoint-visual', attr: { 'aria-hidden': 'true' } });
    const fileEl = visualEl.createDiv({ cls: 'nn-markdownpoint-file' });
    fileEl.createDiv({ cls: 'nn-markdownpoint-file-name', text: 'presentation.md' });
    appendMarkdownSource(fileEl.createDiv({ cls: 'nn-markdownpoint-file-text', attr: { dir: 'ltr' } }), design.eyebrow, design.statement);
    visualEl.createEl('img', { cls: 'nn-markdownpoint-slide', attr: { src: svgDataUrl(design.svg), alt: '' } });

    const copyEl = stripEl.createDiv({ cls: 'nn-markdownpoint-copy' });
    // The wordmark, its maker and the link icon read as one line: "MarkdownPoint by Johan Sanneblad"
    const brandEl = copyEl.createDiv({ cls: 'nn-markdownpoint-brand' });
    brandEl.createEl('img', {
        cls: 'nn-markdownpoint-wordmark',
        attr: { src: svgDataUrl(design.dark ? MARKDOWNPOINT_WORDMARK_ON_DARK : MARKDOWNPOINT_WORDMARK_ON_LIGHT), alt: 'MarkdownPoint' }
    });
    brandEl.createSpan({ cls: 'nn-markdownpoint-credit', text: credit });
    // The icon marks the banner as a link to the website, because touch screens show no pointer over it
    setIcon(brandEl.createSpan({ cls: 'nn-markdownpoint-link-icon', attr: { 'aria-hidden': 'true' } }), 'lucide-external-link');
    appendHeadline(copyEl.createDiv({ cls: 'nn-markdownpoint-headline' }), message.headline);
    copyEl.createDiv({ cls: 'nn-markdownpoint-subtext', text: message.subtext });
}

/** Marks a setting row as the banner's, so the stylesheet removes the row's padding and hides its name and control. */
function renderBannerRow(settingEl: HTMLElement, position: number): void {
    settingEl.addClass('nn-markdownpoint-setting');
    renderMarkdownPointBanner(settingEl, position);
}

/**
 * Where the banner sits on the settings start page: 'top' above everything without a heading, or 'below' after
 * the settings pages under a heading asking about other presentation apps. The Advanced setting
 * showMarkdownPointBannerAtTop picks one.
 */
export type MarkdownPointBannerPlacement = 'top' | 'below';

function headingFor(placement: MarkdownPointBannerPlacement): string | undefined {
    return placement === 'below' ? strings.settings.items.markdownPointBanner.heading : undefined;
}

/**
 * The banner as a group of the native settings index at one placement, shown only while the Advanced setting
 * picks that placement. The position is read when the row renders, not when definitions are built, because
 * Obsidian also builds them for settings search; only the visible placement renders, so a settings open
 * advances the banner once.
 */
export function createMarkdownPointBannerDefinitions(
    placement: MarkdownPointBannerPlacement,
    isAtTop: () => boolean,
    getPosition: () => number
): SettingDefinitionGroup[] {
    return [
        createGroupDefinition(
            headingFor(placement),
            [
                createRenderDefinition({
                    // Product name, not translated
                    name: 'MarkdownPoint',
                    searchable: false,
                    render: setting => renderBannerRow(setting.settingEl, getPosition())
                })
            ],
            { cls: 'nn-markdownpoint-group', visible: () => isAtTop() === (placement === 'top') }
        )
    ];
}

/** The same group on the legacy settings page, which Obsidian versions before native settings pages render. */
export function renderMarkdownPointBannerGroup(containerEl: HTMLElement, placement: MarkdownPointBannerPlacement, position: number): void {
    const group = createSettingGroupFactory(containerEl)(headingFor(placement));
    group.rootEl.addClass('nn-markdownpoint-group');
    group.addSetting(setting => renderBannerRow(setting.settingEl, position));
}
