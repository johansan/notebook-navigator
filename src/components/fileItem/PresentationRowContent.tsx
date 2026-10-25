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

import React from 'react';
import { strings } from '../../i18n';
import type { PresentationSummary } from '../../services/PresentationService';
import type { ThemeMode } from '../../utils/themeMode';

const MISSING_VALUE = '—';

function formatSlideCount(count: number): string {
    return count === 1
        ? strings.listPane.presentation.slideCountOne
        : strings.listPane.presentation.slideCount.replace('{count}', String(count));
}

interface PresentationCoverContentProps {
    /** The row's file name element, which carries inline rename and search highlighting */
    titleElement: React.ReactNode;
    folderName: string;
    summary: PresentationSummary;
    /** Empty when the list hides dates for this row */
    displayDate: string;
    themeMode: ThemeMode;
}

/**
 * The slides.md row: the file name above a fixed-height slide drawn in the colors of the theme's Title layout.
 * Without readable theme files the slide uses Obsidian's colors.
 */
export function PresentationCoverContent({ titleElement, folderName, summary, displayDate, themeMode }: PresentationCoverContentProps) {
    const cover = summary.cover;
    const colors = cover ? ((themeMode === 'dark' ? cover.dark : null) ?? cover.light) : null;
    // Runtime colors come from the presentation's theme files, so they cannot live in static CSS
    const coverStyle = colors
        ? ({
              '--nn-presentation-cover-bg': colors.background,
              '--nn-presentation-cover-text': colors.text,
              '--nn-presentation-cover-muted': colors.muted
          } as React.CSSProperties)
        : undefined;

    return (
        <div className="nn-file-text-content">
            {titleElement}
            <div className="nn-presentation-cover" data-align={cover?.align ?? 'start'} style={coverStyle}>
                <div className="nn-presentation-cover-eyebrow">{formatSlideCount(summary.slideCount)}</div>
                <div className="nn-presentation-cover-title">{folderName}</div>
                {displayDate ? <div className="nn-presentation-cover-date">{displayDate}</div> : null}
            </div>
        </div>
    );
}

interface PresentationDetailsContentProps {
    titleElement: React.ReactNode;
    summary: PresentationSummary;
}

/** The presentation.mdpoint row: the file name above the theme, slide count and slide size. */
export function PresentationDetailsContent({ titleElement, summary }: PresentationDetailsContentProps) {
    const size = summary.size;
    return (
        <div className="nn-file-text-content">
            {titleElement}
            <dl className="nn-presentation-details">
                <dt>{strings.listPane.presentation.theme}</dt>
                <dd>{summary.themeName ?? MISSING_VALUE}</dd>
                <dt>{strings.listPane.presentation.slides}</dt>
                <dd>{summary.slideCount}</dd>
                <dt>{strings.listPane.presentation.size}</dt>
                <dd>{size ? `${size.width} × ${size.height}` : MISSING_VALUE}</dd>
            </dl>
        </div>
    );
}
