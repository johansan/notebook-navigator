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
import { ServiceIcon } from './ServiceIcon';
import { useUIDispatch, useUIState } from '../context/UIStateContext';
import { useSettingsState } from '../context/SettingsContext';
import { useServices } from '../context/ServicesContext';
import { strings } from '../i18n';
import { matchesShortcut, KeyboardShortcutAction } from '../utils/keyboardShortcuts';
import { runAsyncAction, type MaybePromise } from '../utils/async';
import { SearchDateInputSuggest } from '../suggest/SearchDateInputSuggest';
import { SearchTagInputSuggest } from '../suggest/SearchTagInputSuggest';
import type { SearchProvider } from '../types/search';
import { resolveUXIcon } from '../utils/uxIcons';
import { InfoModal, type InfoModalSection } from '../modals/InfoModal';
import { focusElementPreventScroll } from '../utils/domUtils';

interface SearchInputProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onClose: () => void;
    onFocusFiles?: () => void;
    onEmptySearchExit?: () => void;
    isWholeVaultSearch?: boolean;
    shouldFocus?: boolean;
    onFocusComplete?: () => void;
    /** Root container to scope DOM queries within this navigator instance */
    containerRef?: React.RefObject<HTMLDivElement | null>;
    onSaveShortcut?: () => MaybePromise;
    onRemoveShortcut?: () => MaybePromise;
    isShortcutSaved?: boolean;
    isShortcutDisabled?: boolean;
    searchProvider?: SearchProvider;
}

export function SearchInput({
    searchQuery,
    onSearchQueryChange,
    onClose,
    onFocusFiles,
    onEmptySearchExit,
    isWholeVaultSearch = false,
    shouldFocus,
    onFocusComplete,
    containerRef,
    onSaveShortcut,
    onRemoveShortcut,
    isShortcutSaved,
    isShortcutDisabled,
    searchProvider
}: SearchInputProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const tagSuggestRef = useRef<SearchTagInputSuggest | null>(null);
    const dateSuggestRef = useRef<SearchDateInputSuggest | null>(null);
    const { isMobile, omnisearchService, app, tagTreeService, plugin } = useServices();
    const settings = useSettingsState();
    const uiState = useUIState();
    const uiDispatch = useUIDispatch();

    const activeProvider = searchProvider ?? settings.searchProvider ?? 'internal';
    const isOmnisearchAvailable = omnisearchService?.isAvailable() ?? false;
    const isOmnisearchActive = activeProvider === 'omnisearch' && isOmnisearchAvailable;
    const showWholeVaultSearchIcon = isWholeVaultSearch && !isOmnisearchActive;
    const shortcutIconId = useMemo(() => resolveUXIcon(settings.interfaceIcons, 'nav-shortcuts'), [settings.interfaceIcons]);
    const searchIconId = useMemo(
        () =>
            isOmnisearchActive
                ? 'text-search'
                : showWholeVaultSearchIcon
                  ? 'folder-search'
                  : resolveUXIcon(settings.interfaceIcons, 'list-search'),
        [isOmnisearchActive, settings.interfaceIcons, showWholeVaultSearchIcon]
    );
    const placeholderText = isOmnisearchActive
        ? strings.searchInput.placeholderOmnisearch
        : showWholeVaultSearchIcon
          ? strings.searchInput.placeholderVault
          : strings.searchInput.placeholder;
    const hasQuery = searchQuery.trim().length > 0;
    const showShortcutButton = hasQuery && Boolean(onSaveShortcut || (isShortcutSaved && onRemoveShortcut));
    const shortcutButtonDisabled = isShortcutDisabled || (!isShortcutSaved && !onSaveShortcut) || (isShortcutSaved && !onRemoveShortcut);
    const searchContainerClassName = `nn-search-input-container${showShortcutButton ? ' nn-search-input-container--has-shortcut' : ''}`;

    const notifyEmptySearchExit = useCallback(() => {
        if (!hasQuery) {
            onEmptySearchExit?.();
        }
    }, [hasQuery, onEmptySearchExit]);

    const restoreSearchInputFocus = useCallback((selection?: { start: number | null; end: number | null }) => {
        const input = inputRef.current;
        if (!input) {
            return;
        }

        input.focus();

        const start = selection?.start ?? input.selectionStart;
        const end = selection?.end ?? input.selectionEnd;
        if (start !== null && end !== null) {
            input.setSelectionRange(start, end);
        }
    }, []);

    const handleToggleProvider = useCallback(
        (options?: { restoreFocus?: boolean }) => {
            if (!isOmnisearchAvailable) {
                return;
            }

            const input = inputRef.current;
            const selection = input ? { start: input.selectionStart, end: input.selectionEnd } : undefined;
            plugin.setSearchProvider(isOmnisearchActive ? 'internal' : 'omnisearch');

            if (options?.restoreFocus) {
                window.requestAnimationFrame(() => restoreSearchInputFocus(selection));
            }
        },
        [isOmnisearchAvailable, isOmnisearchActive, plugin, restoreSearchInputFocus]
    );

    // Auto-focus input when shouldFocus is true
    useEffect(() => {
        if (shouldFocus) {
            inputRef.current?.focus();
            // Reset the focus flag after focusing
            if (onFocusComplete) {
                onFocusComplete();
            }
        }
    }, [shouldFocus, onFocusComplete]);

    const applyTagSuggestion = useCallback(
        (value: string, cursor: number) => {
            onSearchQueryChange(value);
            window.requestAnimationFrame(() => {
                const input = inputRef.current;
                if (!input) {
                    return;
                }
                input.focus();
                input.setSelectionRange(cursor, cursor);
            });
        },
        [onSearchQueryChange]
    );

    // Initialize Obsidian's tag suggest helper on the search input
    useEffect(() => {
        const inputEl = inputRef.current;
        if (!inputEl || !tagTreeService || !settings.showTags || isOmnisearchActive) {
            tagSuggestRef.current?.dispose();
            tagSuggestRef.current = null;
            return;
        }

        if (tagSuggestRef.current) {
            return;
        }

        const suggest = new SearchTagInputSuggest(app, inputEl, {
            getTags: () => tagTreeService.getFlattenedTagNodes() ?? [],
            onApply: applyTagSuggestion,
            isMobile
        });

        tagSuggestRef.current = suggest;
        return () => {
            suggest.dispose();
            tagSuggestRef.current = null;
        };
    }, [app, tagTreeService, settings.showTags, isOmnisearchActive, applyTagSuggestion, isMobile]);

    // Initialize date filter suggestions on the search input (Filter search provider)
    useEffect(() => {
        const inputEl = inputRef.current;
        if (!inputEl || isOmnisearchActive) {
            dateSuggestRef.current?.dispose();
            dateSuggestRef.current = null;
            return;
        }

        if (dateSuggestRef.current) {
            return;
        }

        const suggest = new SearchDateInputSuggest(app, inputEl, {
            onApply: applyTagSuggestion,
            isMobile
        });
        dateSuggestRef.current = suggest;
        return () => {
            suggest.dispose();
            dateSuggestRef.current = null;
        };
    }, [app, applyTagSuggestion, isMobile, isOmnisearchActive]);

    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            return;
        }
        tagSuggestRef.current?.close();
        dateSuggestRef.current?.close();
    }, [searchQuery]);

    /**
     * Focuses the list pane scroll container to enable keyboard navigation.
     * Used after closing search or switching focus away from search input.
     */
    const focusListPane = () => {
        window.setTimeout(() => {
            const scope = containerRef?.current ?? activeDocument;
            const listPaneScroller = scope.querySelector('.nn-list-pane-scroller');
            if (listPaneScroller instanceof HTMLElement) {
                focusElementPreventScroll(listPaneScroller);
            }
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const nativeEvent = e.nativeEvent;
        const shortcuts = settings.keyboardShortcuts;
        // Read the legacy IME key code without typed deprecated member access.
        const nativeKeyCode: unknown = Reflect.get(nativeEvent, 'keyCode');
        const isImeComposing = nativeEvent.isComposing || nativeKeyCode === 229;

        if (isImeComposing) {
            return;
        }

        // Toggle search provider with ArrowUp/ArrowDown when no suggestion popup is open
        if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && isOmnisearchAvailable) {
            if (nativeEvent.repeat) {
                return;
            }

            const isSuggestOpen = Boolean(
                tagSuggestRef.current?.containerEl?.isConnected || dateSuggestRef.current?.containerEl?.isConnected
            );
            if (isSuggestOpen) {
                return;
            }

            e.preventDefault();
            handleToggleProvider({ restoreFocus: true });
            return;
        }

        if (matchesShortcut(nativeEvent, shortcuts, KeyboardShortcutAction.SEARCH_CLOSE)) {
            e.preventDefault();
            onClose();
            uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });
            focusListPane();
            return;
        }

        if (matchesShortcut(nativeEvent, shortcuts, KeyboardShortcutAction.SEARCH_FOCUS_NAVIGATION)) {
            if (!uiState.singlePane && !isMobile) {
                e.preventDefault();
                notifyEmptySearchExit();
                uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'navigation' });
            }
            return;
        }

        if (matchesShortcut(nativeEvent, shortcuts, KeyboardShortcutAction.SEARCH_FOCUS_LIST)) {
            e.preventDefault();
            notifyEmptySearchExit();
            uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'files' });

            if (isMobile) {
                uiDispatch({ type: 'SET_SINGLE_PANE_VIEW', view: 'files' });
                focusListPane();
                return;
            }

            if (onFocusFiles) {
                onFocusFiles();
            }

            focusListPane();
        }
    };

    // Set focus state to search when clicking on search field
    const handleSearchClick = () => {
        uiDispatch({ type: 'SET_FOCUSED_PANE', pane: 'search' });
    };

    // Opens the search syntax help modal, closing any active suggest popups first
    const openSearchHelp = useCallback(() => {
        tagSuggestRef.current?.close();
        dateSuggestRef.current?.close();
        const { fileNames, tags, properties, tasks, connectors, dates, omnisearch } = strings.searchInput.searchHelpModal.sections;
        const propertiesSection = Object.prototype.hasOwnProperty.call(strings.searchInput.searchHelpModal.sections, 'properties')
            ? properties
            : undefined;
        const sections = [fileNames, propertiesSection, tags, dates, tasks, connectors, omnisearch].filter(
            (section): section is InfoModalSection => Boolean(section)
        );
        new InfoModal(app, {
            title: strings.searchInput.searchHelpTitle,
            intro: strings.searchInput.searchHelpModal.intro,
            emphasizedIntro: strings.searchInput.searchHelpModal.introSwitching,
            sections
        }).open();
    }, [app]);

    return (
        <div className="nn-search-input-wrapper">
            <div className={searchContainerClassName}>
                <div
                    className="nn-search-input-icon"
                    role="button"
                    tabIndex={isOmnisearchAvailable ? 0 : -1}
                    aria-label={isOmnisearchActive ? strings.searchInput.switchToFilterSearch : strings.searchInput.switchToOmnisearch}
                    style={isOmnisearchAvailable ? undefined : { pointerEvents: 'none' }}
                    onMouseDown={
                        isOmnisearchAvailable
                            ? event => {
                                  event.preventDefault();
                              }
                            : undefined
                    }
                    onClick={isOmnisearchAvailable ? () => handleToggleProvider({ restoreFocus: true }) : undefined}
                    onKeyDown={
                        isOmnisearchAvailable
                            ? event => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault();
                                      handleToggleProvider({ restoreFocus: true });
                                  }
                              }
                            : undefined
                    }
                >
                    <ServiceIcon iconId={searchIconId} aria-hidden={true} />
                </div>
                <input
                    ref={inputRef}
                    type="search"
                    className={`nn-search-input ${searchQuery ? 'nn-search-active' : ''}`}
                    placeholder={placeholderText}
                    spellCheck={false}
                    enterKeyHint="search"
                    value={searchQuery}
                    onChange={e => onSearchQueryChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onClick={handleSearchClick}
                    onBlur={notifyEmptySearchExit}
                />
                {!hasQuery && settings.showInfoButtons && (
                    <div
                        className="nn-search-help-button"
                        role="button"
                        tabIndex={0}
                        aria-label={strings.searchInput.searchHelp}
                        onClick={() => {
                            openSearchHelp();
                        }}
                        onKeyDown={event => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                openSearchHelp();
                            }
                        }}
                    >
                        <ServiceIcon iconId="info" aria-hidden={true} />
                    </div>
                )}
                {/* Star button to save/remove search as shortcut */}
                {showShortcutButton && (
                    <div
                        className={`nn-search-star-button ${isShortcutSaved ? 'nn-search-star-button--active' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-label={isShortcutSaved ? strings.searchInput.removeSearchShortcut : strings.searchInput.saveSearchShortcut}
                        aria-pressed={isShortcutSaved || false}
                        onClick={() => {
                            if (shortcutButtonDisabled) {
                                return;
                            }
                            const action = isShortcutSaved ? onRemoveShortcut : onSaveShortcut;
                            if (action) {
                                runAsyncAction(action);
                            }
                            inputRef.current?.focus();
                        }}
                        onKeyDown={event => {
                            if ((event.key === 'Enter' || event.key === ' ') && !shortcutButtonDisabled) {
                                event.preventDefault();
                                const action = isShortcutSaved ? onRemoveShortcut : onSaveShortcut;
                                if (action) {
                                    runAsyncAction(action);
                                }
                                inputRef.current?.focus();
                            }
                        }}
                    >
                        <ServiceIcon iconId={shortcutIconId} aria-hidden={true} />
                    </div>
                )}
                {hasQuery && (
                    <div
                        className="nn-search-clear-button"
                        role="button"
                        tabIndex={0}
                        aria-label={strings.searchInput.clearSearch}
                        onClick={() => {
                            onSearchQueryChange('');
                            inputRef.current?.focus();
                        }}
                        onKeyDown={event => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onSearchQueryChange('');
                                inputRef.current?.focus();
                            }
                        }}
                    >
                        <ServiceIcon iconId="circle-x" aria-hidden={true} />
                    </div>
                )}
            </div>
        </div>
    );
}
