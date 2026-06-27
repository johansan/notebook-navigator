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

import type { CSSProperties } from 'react';
import type { ManualSortGroupHeaderData } from '../../utils/manualSort';
import { getManualSortGroupHeaderTargetWordCount, shouldShowManualSortGroupHeaderWordCount } from '../../utils/manualSort';
import { formatTextCount } from '../../utils/wordCountUtils';
import { ServiceIcon } from '../ServiceIcon';

type ManualSortGroupHeaderStyle = CSSProperties & {
    '--nn-manual-sort-group-header-accent'?: string;
    '--nn-manual-sort-group-header-progress'?: string;
};

interface ManualSortGroupHeaderContentProps {
    header: ManualSortGroupHeaderData;
    wordCount: number;
    targetWordCount?: number | null;
}

interface ManualSortGroupHeaderProgressData {
    progressPercent: number | null;
    progressWidth: number | null;
}

function getDisplayWordCount(wordCount: number): number {
    return Math.max(0, Math.trunc(wordCount));
}

function formatManualSortGroupHeaderCountText(
    header: ManualSortGroupHeaderData,
    wordCount: number,
    targetWordCount: number | null | undefined
): string {
    const formattedWordCount = formatTextCount(getDisplayWordCount(wordCount));
    const resolvedTargetWordCount = getManualSortGroupHeaderTargetWordCount(header, targetWordCount);
    if (resolvedTargetWordCount !== null) {
        return `${formattedWordCount} / ${formatTextCount(resolvedTargetWordCount)}`;
    }

    return formattedWordCount;
}

function getProgressPercent(wordCount: number, targetWordCount: number): number | null {
    if (targetWordCount <= 0) {
        return null;
    }

    const percent = Math.round((getDisplayWordCount(wordCount) / targetWordCount) * 100);
    return Number.isFinite(percent) ? percent : 0;
}

function getManualSortGroupHeaderProgress(
    header: ManualSortGroupHeaderData,
    wordCount: number,
    targetWordCount: number | null | undefined
): ManualSortGroupHeaderProgressData {
    const resolvedTargetWordCount = getManualSortGroupHeaderTargetWordCount(header, targetWordCount);
    const progressPercent = resolvedTargetWordCount !== null ? getProgressPercent(wordCount, resolvedTargetWordCount) : null;
    const progressWidth = progressPercent === null ? null : Math.min(100, Math.max(0, progressPercent));

    return {
        progressPercent,
        progressWidth
    };
}

function getManualSortGroupHeaderStyle(
    header: ManualSortGroupHeaderData,
    progress: ManualSortGroupHeaderProgressData
): ManualSortGroupHeaderStyle {
    const style: ManualSortGroupHeaderStyle = {};

    if (header.color) {
        style['--nn-manual-sort-group-header-accent'] = header.color;
    }
    if (progress.progressWidth !== null) {
        style['--nn-manual-sort-group-header-progress'] = `${progress.progressWidth}%`;
    }

    return style;
}

export function ManualSortGroupHeaderContent({ header, wordCount, targetWordCount }: ManualSortGroupHeaderContentProps) {
    const shouldShowWordCount = shouldShowManualSortGroupHeaderWordCount(header);
    const countText = formatManualSortGroupHeaderCountText(header, wordCount, targetWordCount);
    const progress = getManualSortGroupHeaderProgress(header, wordCount, targetWordCount);
    const style = getManualSortGroupHeaderStyle(header, progress);
    const contentClasses = ['nn-manual-sort-group-header-content'];
    if (header.color && progress.progressPercent === null) {
        contentClasses.push('nn-manual-sort-group-header-content--accent-all');
    }
    if (header.color || progress.progressPercent !== null) {
        contentClasses.push('nn-manual-sort-group-header-content--accent-icon');
    }

    return (
        <div className={contentClasses.join(' ')} style={style}>
            {header.iconId ? (
                <ServiceIcon iconId={header.iconId} className="nn-manual-sort-group-header-custom-icon" aria-hidden={true} />
            ) : null}
            <span className="nn-manual-sort-group-header-title">{header.title}</span>
            {shouldShowWordCount ? <span className="nn-manual-sort-group-header-count">({countText})</span> : null}
            {progress.progressPercent !== null ? (
                <span className="nn-manual-sort-group-header-percent">{progress.progressPercent}%</span>
            ) : null}
        </div>
    );
}

export function ManualSortGroupHeaderProgress({ header, wordCount, targetWordCount }: ManualSortGroupHeaderContentProps) {
    const progress = getManualSortGroupHeaderProgress(header, wordCount, targetWordCount);

    if (progress.progressWidth === null) {
        return null;
    }

    const style = getManualSortGroupHeaderStyle(header, progress);

    return (
        <div className="nn-manual-sort-group-header-progress-row" style={style} aria-hidden={true}>
            <div className="nn-manual-sort-group-header-progress">
                <div className="nn-manual-sort-group-header-progress-fill" />
            </div>
        </div>
    );
}
