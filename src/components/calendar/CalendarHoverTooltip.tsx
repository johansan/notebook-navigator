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
import { createPortal } from 'react-dom';
import type { CalendarHoverTooltipState } from './types';

interface CalendarHoverTooltipProps {
    isMobile: boolean;
    hoverTooltip: CalendarHoverTooltipState | null;
    hoverTooltipStyle: React.CSSProperties | null;
    hoverTooltipRef: React.MutableRefObject<HTMLDivElement | null>;
    hoverTooltipPreviewText: string;
    shouldShowHoverTooltipPreview: boolean;
    hoverTooltipDateText: string;
}

export const CalendarHoverTooltip = React.memo(function CalendarHoverTooltip({
    isMobile,
    hoverTooltip,
    hoverTooltipStyle,
    hoverTooltipRef,
    hoverTooltipPreviewText,
    shouldShowHoverTooltipPreview,
    hoverTooltipDateText
}: CalendarHoverTooltipProps) {
    if (!hoverTooltip || isMobile) {
        return null;
    }

    return createPortal(
        <div
            ref={hoverTooltipRef}
            className="nn-navigation-calendar-hover-tooltip"
            style={
                hoverTooltipStyle ?? {
                    top: 0,
                    left: 0,
                    transform: 'translateY(-50%)',
                    visibility: 'hidden'
                }
            }
            role="tooltip"
        >
            {hoverTooltip.tooltipData.imageUrl ? (
                <div
                    className="nn-navigation-calendar-hover-tooltip-image"
                    style={{ backgroundImage: `url(${hoverTooltip.tooltipData.imageUrl})` }}
                />
            ) : null}
            <div className="nn-compact-file-text-content">
                <div className="nn-file-name" style={{ '--filename-rows': 2, height: 'auto', minHeight: 0 } as React.CSSProperties}>
                    <span className="nn-file-name-label">{hoverTooltip.tooltipData.title}</span>
                </div>
                {shouldShowHoverTooltipPreview ? (
                    <div className="nn-file-preview" style={{ '--preview-rows': 2 } as React.CSSProperties}>
                        {hoverTooltipPreviewText}
                    </div>
                ) : null}
                {hoverTooltipDateText ? <div className="nn-file-date">{hoverTooltipDateText}</div> : null}
            </div>
        </div>,
        activeDocument.body
    );
});
