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

import React, { useSyncExternalStore } from 'react';
import type { LanguageService } from '../i18n/LanguageService';
import { SkeletonView } from './SkeletonView';

/** Mounts the view's providers only after language selection so no English labels are captured during the download. */
export function LanguageLoadingBoundary({ service, children }: { service: LanguageService; children: React.ReactNode }) {
    const state = useSyncExternalStore(service.subscribe, service.getSnapshot);
    if (state.ready) return <>{children}</>;
    return (
        <div className="nn-language-loading">
            <div className="nn-language-loading-skeleton" aria-hidden="true">
                <SkeletonView paneSize={250} singlePane={true} searchActive={false} orientation="horizontal" />
            </div>
            <div className="nn-language-loading-status">
                <span role="status">{service.bootstrap.downloading}</span>
                <button type="button" onClick={service.continueInEnglish}>
                    {service.bootstrap.continueInEnglish}
                </button>
            </div>
        </div>
    );
}
