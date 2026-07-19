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

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { CalendarHoverTooltipData } from './types';

export interface CalendarDayButtonProps {
    className: string;
    ariaText: string;
    dayNumber: number;
    isMobile: boolean;
    showUnfinishedTaskIndicator: boolean;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onContextMenu: (event: React.MouseEvent<HTMLButtonElement>) => void;
    style: React.CSSProperties | undefined;
    tooltipEnabled: boolean;
    tooltipData: CalendarHoverTooltipData;
    onHideTooltip: (element: HTMLElement) => void;
    onShowTooltip: (element: HTMLElement, tooltipData: CalendarHoverTooltipData) => void;
}

/** Renders a calendar day button with hover tooltip support on desktop */
export const CalendarDayButton = React.memo(function CalendarDayButton({
    className,
    ariaText,
    dayNumber,
    isMobile,
    showUnfinishedTaskIndicator,
    onClick,
    onMouseDown,
    onContextMenu,
    style,
    tooltipEnabled,
    tooltipData,
    onHideTooltip,
    onShowTooltip
}: CalendarDayButtonProps) {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const { dateTimestamp, imageUrl, previewEnabled, previewPath, showDate, title } = tooltipData;
    const tooltipDataMemo = useMemo<CalendarHoverTooltipData>(
        () => ({
            imageUrl,
            title,
            dateTimestamp,
            previewPath,
            previewEnabled,
            showDate
        }),
        [dateTimestamp, imageUrl, previewEnabled, previewPath, showDate, title]
    );

    const handleMouseEnter = useCallback(() => {
        if (isMobile || !tooltipEnabled) {
            return;
        }

        const element = buttonRef.current;
        if (!element) {
            return;
        }

        onShowTooltip(element, tooltipDataMemo);
    }, [isMobile, onShowTooltip, tooltipDataMemo, tooltipEnabled]);

    const handleMouseLeave = useCallback(() => {
        const element = buttonRef.current;
        if (!element || isMobile) {
            return;
        }

        onHideTooltip(element);
    }, [isMobile, onHideTooltip]);

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            const element = buttonRef.current;
            if (element) {
                onHideTooltip(element);
            }

            onClick(event);
        },
        [onClick, onHideTooltip]
    );

    const handleMouseDown = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            if (event.button === 1) {
                const element = buttonRef.current;
                if (element) {
                    onHideTooltip(element);
                }
            }

            onMouseDown(event);
        },
        [onMouseDown, onHideTooltip]
    );

    useEffect(() => {
        const element = buttonRef.current;
        if (!element) {
            return;
        }

        if (isMobile) {
            return;
        }

        if (!tooltipEnabled) {
            // The anchor can stay hovered while profile visibility changes, so clear tooltip content that is no longer visible.
            onHideTooltip(element);
            return;
        }

        if (!element.matches(':hover')) {
            return;
        }

        onShowTooltip(element, tooltipDataMemo);
    }, [isMobile, onHideTooltip, onShowTooltip, tooltipDataMemo, tooltipEnabled]);

    return (
        <button
            ref={buttonRef}
            type="button"
            className={className}
            style={style}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            onContextMenu={onContextMenu}
        >
            <span className="nn-navigation-calendar-active-outline" aria-hidden="true" />
            <span className="nn-navigation-calendar-day-number" aria-hidden="true">
                {dayNumber}
            </span>
            {showUnfinishedTaskIndicator ? (
                <span className="nn-navigation-calendar-day-unfinished-task-indicator" aria-hidden="true" />
            ) : null}
            <span className="nn-visually-hidden">{ariaText}</span>
        </button>
    );
});
