/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025 Johan Sanneblad
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

// src/components/NotebookNavigatorComponent.tsx
import React, { useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { TFile, WorkspaceLeaf } from 'obsidian';
import { PaneHeader } from './PaneHeader';
import { FolderTree } from './FolderTree';
import { TagList } from './TagList';
import { BacklinkList } from './BacklinkList';
import { FileList } from './FileList';
import { useAppContext } from '../context/AppContext';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useResizablePane } from '../hooks/useResizablePane';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { isTFolder } from '../utils/typeGuards';

export interface NotebookNavigatorHandle {
    revealFile: (file: TFile) => void;
    refresh: () => void;
}

/**
 * Main container component for the Notebook Navigator plugin.
 * Provides a two-pane layout with resizable divider, folder tree on the left,
 * and file list on the right. Manages keyboard navigation, drag-and-drop,
 * and auto-reveal functionality for the active file.
 * 
 * @param _ - Props (none used)
 * @param ref - Forwarded ref exposing revealFile and refresh methods
 * @returns A split-pane container with folder tree and file list
 */
export const NotebookNavigatorComponent = forwardRef<NotebookNavigatorHandle>((_, ref) => {
    const { app, appState, dispatch, plugin, refreshCounter, isMobile } = useAppContext();
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Enable keyboard navigation
    useKeyboardNavigation(containerRef);
    
    // Enable drag and drop only on desktop
    useDragAndDrop(containerRef);
    
    // Enable resizable pane
    const { paneWidth, resizeHandleProps } = useResizablePane({
        initialWidth: 300,
        min: 150,
        max: 600,
        storageKey: 'notebook-navigator-left-pane-width'
    });
    
    // Enable swipe gestures on mobile
    useSwipeGesture(containerRef, {
        onSwipeRight: () => {
            if (isMobile && appState.currentMobileView === 'files') {
                dispatch({ type: 'SET_MOBILE_VIEW', view: 'list' });
            }
        },
        enabled: isMobile
    });
    
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        revealFile: (file: TFile) => {
            dispatch({ type: 'REVEAL_FILE', file });
        },
        refresh: () => {
            dispatch({ type: 'FORCE_REFRESH' });
        }
    }), [dispatch]);

    // Add this useEffect to handle active leaf changes
    useEffect(() => {
        if (!plugin.settings.autoRevealActiveFile) return;

        const handleActiveLeafChange = (leaf: WorkspaceLeaf | null) => {
            // Only trigger for leaves in the main editor area
            if (!leaf || leaf.getRoot() !== app.workspace.rootSplit) {
                return;
            }
            
            // Note: Accessing view.file via 'any' as it's not in Obsidian's public TypeScript API
            const file = (leaf.view as any).file;
            if (file && file instanceof TFile) {
                // Don't reveal if it's already selected
                if (appState.selectedFile?.path !== file.path) {
                    dispatch({ type: 'REVEAL_FILE', file });
                }
            }
        };

        const eventRef = app.workspace.on('active-leaf-change', handleActiveLeafChange);

        return () => {
            app.workspace.offref(eventRef);
        };
    }, [app.workspace, dispatch, plugin.settings.autoRevealActiveFile, appState.selectedFile]);

    // Determine CSS classes for mobile view state
    const containerClasses = ['nn-split-container'];
    if (isMobile) {
        containerClasses.push(appState.currentMobileView === 'list' ? 'show-list' : 'show-files');
    } else {
        containerClasses.push('nn-desktop');
    }
    
    return (
        <div 
            ref={containerRef}
            className={containerClasses.join(' ')} 
            data-focus-pane={appState.focusedPane}
            tabIndex={-1}
        >
            <div className="nn-left-pane" style={{ width: isMobile ? '100%' : `${paneWidth}px` }}>
                <PaneHeader type="folder" />
                <div className="nn-left-pane-scroller">
                    <FolderTree />
                    <TagList />
                    <BacklinkList />
                </div>
            </div>
            {!isMobile && <div className="nn-resize-handle" {...resizeHandleProps} />}
            <div className="nn-right-pane">
                <PaneHeader type="file" />
                <FileList />
            </div>
        </div>
    );
});

NotebookNavigatorComponent.displayName = 'NotebookNavigatorComponent';
