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

import React, { createContext, useContext, useReducer, ReactNode, useMemo, useEffect, useCallback, useRef } from 'react';
import { FILE_PANE_DIMENSIONS, NAVIGATION_PANE_DIMENSIONS, type DualPaneOrientation } from '../types';
// Storage keys
import { STORAGE_KEYS } from '../types';
import { localStorage } from '../utils/localStorage';
import { useServices } from './ServicesContext';
import { useSettingsState } from './SettingsContext';
import type { NotebookNavigatorSettings } from '../settings/types';
import { useUXPreferenceActions, useUXPreferences } from './UXPreferencesContext';

/**
 * Gets the initial view preference for single pane mode.
 * Defaults to 'files' if not explicitly set to 'navigation'.
 */
function getStartView(settings: NotebookNavigatorSettings): 'navigation' | 'files' {
    return settings.startView === 'navigation' ? 'navigation' : 'files';
}

export type ContentPane = 'navigation' | 'files';
export type PaneActivationTarget = ContentPane | 'search';

// State interface
export interface UIState {
    focusedPane: PaneActivationTarget;
    currentSinglePaneView: ContentPane;
    paneWidth: number;
    containerWidth: number | null;
    dualPanePreference: boolean;
    dualPane: boolean;
    singlePane: boolean;
    effectiveDualPaneOrientation: DualPaneOrientation;
    /** Whether shortcuts should be pinned at the top of the navigation pane */
    pinShortcuts: boolean;
}

// Action types
export type UIAction =
    | { type: 'ACTIVATE_PANE'; target: PaneActivationTarget }
    | { type: 'SET_PANE_WIDTH'; width: number }
    | { type: 'SET_CONTAINER_WIDTH'; width: number }
    | { type: 'SET_DUAL_PANE'; value: boolean }
    | { type: 'SET_PIN_SHORTCUTS'; value: boolean }; // Toggle shortcuts pinned state

// Create contexts
const UIStateContext = createContext<UIState | null>(null);
const UIDispatchContext = createContext<React.Dispatch<UIAction> | null>(null);

// Reducer
export function uiStateReducer(state: UIState, action: UIAction): UIState {
    switch (action.type) {
        case 'ACTIVATE_PANE': {
            const visiblePane: ContentPane = action.target === 'search' ? 'files' : action.target;
            if (state.focusedPane === action.target && state.currentSinglePaneView === visiblePane) {
                return state;
            }
            return { ...state, focusedPane: action.target, currentSinglePaneView: visiblePane };
        }

        case 'SET_PANE_WIDTH':
            if (state.paneWidth === action.width) {
                return state;
            }
            return { ...state, paneWidth: action.width };

        case 'SET_CONTAINER_WIDTH':
            if (state.containerWidth === action.width) {
                return state;
            }
            return { ...state, containerWidth: action.width };

        case 'SET_DUAL_PANE':
            if (state.dualPanePreference === action.value) {
                return state;
            }
            return { ...state, dualPanePreference: action.value };

        // Update shortcuts pinned state
        case 'SET_PIN_SHORTCUTS':
            return { ...state, pinShortcuts: action.value };

        default:
            return state;
    }
}

// Provider component
interface UIStateProviderProps {
    children: ReactNode;
    isMobile: boolean;
}

export function UIStateProvider({ children, isMobile }: UIStateProviderProps) {
    const { plugin } = useServices();
    const settings = useSettingsState();
    const uxPreferences = useUXPreferences();
    const { setPinShortcuts } = useUXPreferenceActions();

    const loadInitialState = (): UIState => {
        const savedWidth = localStorage.get<number>(STORAGE_KEYS.navigationPaneWidthKey);

        const paneWidth = savedWidth ?? NAVIGATION_PANE_DIMENSIONS.defaultWidth;
        const startView = getStartView(plugin.settings);

        const initialState = {
            focusedPane: startView,
            currentSinglePaneView: startView,
            paneWidth: Math.max(NAVIGATION_PANE_DIMENSIONS.minWidth, paneWidth),
            containerWidth: null,
            dualPanePreference: plugin.useDualPane(),
            dualPane: false, // Will be computed later
            singlePane: false, // Will be computed later
            effectiveDualPaneOrientation: plugin.getDualPaneOrientation(),
            pinShortcuts: uxPreferences.pinShortcuts
        };

        return initialState;
    };

    const [state, internalDispatch] = useReducer(uiStateReducer, undefined, loadInitialState);
    // Tracks latest shortcuts state so we can detect actual transitions before notifying the plugin
    const pinShortcutsRef = useRef(state.pinShortcuts);

    useEffect(() => {
        pinShortcutsRef.current = state.pinShortcuts;
    }, [state.pinShortcuts]);

    // Compute the effective pane layout from user preference and current container width.
    const stateWithPaneMode = useMemo(() => {
        let dualPane = !isMobile && state.dualPanePreference;
        let effectiveDualPaneOrientation: DualPaneOrientation = settings.dualPaneOrientation;

        if (
            dualPane &&
            settings.dualPaneOrientation === 'horizontal' &&
            settings.narrowSidebarLayout !== 'none' &&
            state.containerWidth !== null
        ) {
            const requiredHorizontalWidth =
                settings.narrowSidebarTriggerMode === 'customWidth'
                    ? settings.narrowSidebarCustomWidth
                    : state.paneWidth + FILE_PANE_DIMENSIONS.minWidth;
            const horizontalFits = state.containerWidth >= requiredHorizontalWidth;

            if (!horizontalFits) {
                if (settings.narrowSidebarLayout === 'singlePane') {
                    dualPane = false;
                } else if (settings.narrowSidebarLayout === 'vertical') {
                    effectiveDualPaneOrientation = 'vertical';
                }
            }
        }

        return {
            ...state,
            dualPane,
            singlePane: !dualPane,
            effectiveDualPaneOrientation,
            pinShortcuts: state.pinShortcuts
        };
    }, [
        state,
        isMobile,
        settings.dualPaneOrientation,
        settings.narrowSidebarCustomWidth,
        settings.narrowSidebarLayout,
        settings.narrowSidebarTriggerMode
    ]);

    // Wraps reducer dispatch to forward real changes to the plugin while ignoring redundant writes
    const dispatch = useCallback(
        (action: UIAction) => {
            if (action.type === 'SET_PIN_SHORTCUTS') {
                const nextValue = action.value;
                if (nextValue !== pinShortcutsRef.current) {
                    pinShortcutsRef.current = nextValue;
                    setPinShortcuts(nextValue);
                }
            }
            internalDispatch(action);
        },
        [internalDispatch, setPinShortcuts]
    );

    useEffect(() => {
        const id = `ui-state-${Date.now()}`;
        const handleUpdate = () => {
            internalDispatch({ type: 'SET_DUAL_PANE', value: plugin.useDualPane() });
        };

        plugin.registerSettingsUpdateListener(id, handleUpdate);

        return () => {
            plugin.unregisterSettingsUpdateListener(id);
        };
    }, [plugin]);

    // Pulls fresh plugin preference into local state when an external update is observed
    useEffect(() => {
        if (pinShortcutsRef.current === uxPreferences.pinShortcuts) {
            return;
        }
        pinShortcutsRef.current = uxPreferences.pinShortcuts;
        internalDispatch({ type: 'SET_PIN_SHORTCUTS', value: uxPreferences.pinShortcuts });
    }, [internalDispatch, uxPreferences.pinShortcuts]);

    // Note: Pane width persistence is handled by useResizablePane hook
    // to avoid duplicate writes during drag operations

    return (
        <UIStateContext.Provider value={stateWithPaneMode}>
            <UIDispatchContext.Provider value={dispatch}>{children}</UIDispatchContext.Provider>
        </UIStateContext.Provider>
    );
}

// Custom hooks
export function useUIState() {
    const context = useContext(UIStateContext);
    if (!context) {
        throw new Error('useUIState must be used within UIStateProvider');
    }
    return context;
}

export function useUIDispatch() {
    const context = useContext(UIDispatchContext);
    if (!context) {
        throw new Error('useUIDispatch must be used within UIStateProvider');
    }
    return context;
}
