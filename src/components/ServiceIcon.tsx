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

import { useEffect, useRef, type CSSProperties } from 'react';
import { getIconService, useIconServiceVersion } from '../services/icons';

interface ServiceIconProps {
    iconId: string;
    size?: number;
    className?: string;
    style?: CSSProperties;
    'data-has-color'?: 'true' | 'false';
    'aria-label'?: string;
    'aria-hidden'?: boolean;
}

export function ServiceIcon({
    iconId,
    size,
    className,
    style,
    'data-has-color': dataHasColor,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden
}: ServiceIconProps) {
    const ref = useRef<HTMLSpanElement | null>(null);
    const iconServiceVersion = useIconServiceVersion();

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        getIconService().renderIcon(ref.current, iconId, size);
    }, [iconId, iconServiceVersion, size]);

    return (
        <span ref={ref} className={className} style={style} data-has-color={dataHasColor} aria-label={ariaLabel} aria-hidden={ariaHidden} />
    );
}
