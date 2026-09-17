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

import { strings } from '../i18n';
import { isRecord } from './typeGuards';

/**
 * Converts any value to an Error object
 */
function toError(error: unknown, fallback: string = strings.common.unknownError): Error {
    if (error instanceof Error) {
        return error;
    }

    if (isRecord(error) && typeof error.message === 'string') {
        return new Error(error.message);
    }

    if (typeof error === 'string') {
        const trimmed = error.trim();
        return new Error(trimmed || fallback);
    }

    if (typeof error === 'number' || typeof error === 'boolean' || typeof error === 'bigint') {
        return new Error(String(error));
    }

    if (typeof error === 'object' && error !== null) {
        try {
            return new Error(JSON.stringify(error));
        } catch {
            return new Error(fallback);
        }
    }

    return new Error(fallback);
}

/**
 * Extracts a readable error message from any value
 */
export function getErrorMessage(error: unknown, fallback: string = strings.common.unknownError): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (isRecord(error) && typeof error.message === 'string') {
        const trimmed = error.message.trim();
        if (trimmed) {
            return trimmed;
        }
    }

    if (typeof error === 'string') {
        const trimmed = error.trim();
        return trimmed || fallback;
    }

    const message = toError(error, fallback).message;
    return message || fallback;
}
