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

import { Platform } from 'obsidian';

import { STORAGE_KEYS } from '../../../types';
import { localStorage } from '../../../utils/localStorage';

// PDF_CRASH_DIAGNOSTICS: searchable marker for PDF crash diagnostics kept in support builds.
// Internal diagnostic switch that identifies the last PDF path being processed.
const pdfProcessingCrashDiagnosticsConfig = {
    enabled: false
};

type PdfProcessingDiagnosticRecord = {
    path: string;
    token: string;
};

type PdfProcessingDiagnosticHandle = PdfProcessingDiagnosticRecord;

let pdfProcessingDiagnosticTokenCounter = 0;

function isPdfCrashDiagnosticsEnabled(): boolean {
    return Platform.isMobile && pdfProcessingCrashDiagnosticsConfig.enabled;
}

function normalizePdfDiagnosticPath(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function isPdfProcessingDiagnosticRecord(value: unknown): value is PdfProcessingDiagnosticRecord {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const record = value as Record<string, unknown>;
    return typeof record['path'] === 'string' && typeof record['token'] === 'string';
}

function createPdfProcessingDiagnosticToken(): string {
    pdfProcessingDiagnosticTokenCounter += 1;
    return `pdf-processing-${pdfProcessingDiagnosticTokenCounter}`;
}

export function markPdfProcessingInProgress(path: string): PdfProcessingDiagnosticHandle | null {
    if (!isPdfCrashDiagnosticsEnabled()) {
        return null;
    }

    // PDF_CRASH_DIAGNOSTICS: store the current mobile PDF path before rendering starts.
    const normalizedPath = normalizePdfDiagnosticPath(path);
    if (normalizedPath === null) {
        return null;
    }

    const handle: PdfProcessingDiagnosticHandle = {
        path: normalizedPath,
        token: createPdfProcessingDiagnosticToken()
    };
    localStorage.set(STORAGE_KEYS.pdfProcessingDiagnosticKey, handle);
    return handle;
}

export function clearPdfProcessingInProgress(handle: PdfProcessingDiagnosticHandle | null): void {
    if (!isPdfCrashDiagnosticsEnabled()) {
        return;
    }

    if (handle === null) {
        return;
    }

    // PDF_CRASH_DIAGNOSTICS: clear the stored path after processing finishes normally.
    const stored = localStorage.get<unknown>(STORAGE_KEYS.pdfProcessingDiagnosticKey);
    if (!isPdfProcessingDiagnosticRecord(stored)) {
        localStorage.remove(STORAGE_KEYS.pdfProcessingDiagnosticKey);
        return;
    }

    if (stored.path !== handle.path || stored.token !== handle.token) {
        return;
    }

    localStorage.remove(STORAGE_KEYS.pdfProcessingDiagnosticKey);
}

export function consumePendingPdfProcessingDiagnostic(): string | null {
    if (!isPdfCrashDiagnosticsEnabled()) {
        return null;
    }

    // PDF_CRASH_DIAGNOSTICS: startup reads and clears the previous session's unfinished PDF marker.
    const stored = localStorage.get<unknown>(STORAGE_KEYS.pdfProcessingDiagnosticKey);
    localStorage.remove(STORAGE_KEYS.pdfProcessingDiagnosticKey);
    if (isPdfProcessingDiagnosticRecord(stored)) {
        return normalizePdfDiagnosticPath(stored.path);
    }

    return normalizePdfDiagnosticPath(stored);
}
