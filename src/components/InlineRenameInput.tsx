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

import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface InlineRenameControl {
    initialValue: string;
    ariaLabel: string;
    onCommit: (value: string) => boolean | Promise<boolean>;
    onCancel: () => void;
    onRestoreFocus?: () => void;
    inputFilter?: (value: string) => string;
    onInputChange?: (context: { rawValue: string; filteredValue: string }) => void;
}

interface InlineRenameInputProps extends InlineRenameControl {
    className?: string;
}

export function InlineRenameInput({
    initialValue,
    ariaLabel,
    onCommit,
    onCancel,
    onRestoreFocus,
    inputFilter,
    onInputChange,
    className
}: InlineRenameInputProps) {
    const [value, setValue] = useState(initialValue);
    const [isCommitting, setIsCommitting] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const isFinishedRef = useRef(false);
    const isCommittingRef = useRef(false);

    useEffect(() => {
        const input = inputRef.current;
        if (!input) {
            return;
        }
        input.focus({ preventScroll: true });
        input.select();
    }, []);

    const refocusInput = useCallback(() => {
        window.requestAnimationFrame(() => {
            const input = inputRef.current;
            if (!input || isFinishedRef.current) {
                return;
            }
            input.focus({ preventScroll: true });
            input.select();
        });
    }, []);

    const commit = useCallback(
        async (options?: { restoreFocus?: boolean }) => {
            if (isFinishedRef.current || isCommittingRef.current) {
                return;
            }

            isCommittingRef.current = true;
            setIsCommitting(true);
            try {
                const shouldClose = await onCommit(value);
                if (shouldClose) {
                    isFinishedRef.current = true;
                    if (options?.restoreFocus) {
                        onRestoreFocus?.();
                    }
                    return;
                }
            } catch (error) {
                console.error('[Notebook Navigator] Inline rename commit failed', error);
            }

            isCommittingRef.current = false;
            setIsCommitting(false);
            refocusInput();
        },
        [onCommit, onRestoreFocus, refocusInput, value]
    );

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const rawValue = event.currentTarget.value;
            const filteredValue = inputFilter ? inputFilter(rawValue) : rawValue;
            setValue(filteredValue);
            onInputChange?.({ rawValue, filteredValue });
        },
        [inputFilter, onInputChange]
    );

    const cancel = useCallback(
        (options?: { restoreFocus?: boolean }) => {
            if (isFinishedRef.current) {
                return;
            }
            isFinishedRef.current = true;
            onCancel();
            if (options?.restoreFocus) {
                onRestoreFocus?.();
            }
        },
        [onCancel, onRestoreFocus]
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            event.stopPropagation();

            if (event.key === 'Enter') {
                event.preventDefault();
                void commit({ restoreFocus: true });
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                cancel({ restoreFocus: true });
            }
        },
        [cancel, commit]
    );

    return (
        <input
            ref={inputRef}
            className={className ? `nn-inline-rename-input ${className}` : 'nn-inline-rename-input'}
            value={value}
            aria-label={ariaLabel}
            disabled={isCommitting}
            spellCheck={false}
            onChange={handleChange}
            onBlur={() => {
                void commit();
            }}
            onClick={event => event.stopPropagation()}
            onMouseDown={event => event.stopPropagation()}
            onDoubleClick={event => event.stopPropagation()}
            onKeyDown={handleKeyDown}
        />
    );
}
