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

import React, { useCallback, useMemo } from 'react';
import { useSelectionDispatch, useSelectionState } from '../context/SelectionContext';
import { useCommandQueue, useServices } from '../context/ServicesContext';
import { useSettingsState } from '../context/SettingsContext';
import { useSelectedFolderFileVersion } from '../hooks/useSelectedFolderFileVersion';
import { ItemType } from '../types';
import { runAsyncAction } from '../utils/async';
import { getFolderNote, openFolderNoteFile, revealFolderNoteInNavigator } from '../utils/folderNotes';
import { resolveFolderNoteClickOpenContext } from '../utils/keyboardOpenContext';

interface ListPaneTitleAreaProps {
    desktopTitle: string;
}

export const ListPaneTitleArea = React.memo(function ListPaneTitleArea({ desktopTitle }: ListPaneTitleAreaProps) {
    const { app, plugin } = useServices();
    const commandQueue = useCommandQueue();
    const settings = useSettingsState();
    const selectionState = useSelectionState();
    const selectionDispatch = useSelectionDispatch();

    // Folder note interactions only apply when a folder is selected.
    const selectedFolder = selectionState.selectionType === ItemType.FOLDER ? selectionState.selectedFolder : null;
    // Recomputes folder note lookup when files in the selected folder change.
    const selectedFolderFileVersion = useSelectedFolderFileVersion(
        app.vault,
        selectedFolder,
        settings.enableFolderNotes && settings.enableFolderNoteLinks
    );
    // Resolves the note file that represents the selected folder.
    const selectedFolderNote = useMemo(() => {
        void selectedFolderFileVersion;

        if (!selectedFolder || !settings.enableFolderNotes || !settings.enableFolderNoteLinks) {
            return null;
        }

        return getFolderNote(selectedFolder, {
            enableFolderNotes: settings.enableFolderNotes,
            folderNoteNamePattern: settings.folderNoteNamePattern
        });
    }, [
        selectedFolder,
        settings.enableFolderNotes,
        settings.enableFolderNoteLinks,
        settings.folderNoteNamePattern,
        selectedFolderFileVersion
    ]);

    const handleFolderNoteClick = useCallback(
        (event: React.MouseEvent<HTMLSpanElement>) => {
            if (!selectedFolder || !selectedFolderNote) {
                return;
            }

            // Prevents parent title-area click handlers from running.
            event.stopPropagation();

            const openContext = resolveFolderNoteClickOpenContext(event, settings.folderNoteOpenLocation, settings.multiSelectModifier);
            revealFolderNoteInNavigator(selectionDispatch, selectedFolderNote);

            runAsyncAction(() =>
                openFolderNoteFile({
                    app,
                    commandQueue,
                    folder: selectedFolder,
                    folderNote: selectedFolderNote,
                    context: openContext,
                    openInRightSidebar: folderNote => plugin.openFolderNoteInRightSidebar(folderNote)
                })
            );
        },
        [
            selectedFolder,
            selectedFolderNote,
            settings.folderNoteOpenLocation,
            settings.multiSelectModifier,
            app,
            commandQueue,
            plugin,
            selectionDispatch
        ]
    );

    const handleFolderNoteMouseDown = useCallback(
        (event: React.MouseEvent<HTMLSpanElement>) => {
            if (event.button !== 1 || !selectedFolder || !selectedFolderNote) {
                return;
            }

            // Middle-click always opens folder notes in a new tab.
            event.preventDefault();
            event.stopPropagation();
            revealFolderNoteInNavigator(selectionDispatch, selectedFolderNote);

            runAsyncAction(() =>
                openFolderNoteFile({
                    app,
                    commandQueue,
                    folder: selectedFolder,
                    folderNote: selectedFolderNote,
                    context: 'tab'
                })
            );
        },
        [selectedFolder, selectedFolderNote, app, commandQueue, selectionDispatch]
    );

    return (
        <div className="nn-list-title-area">
            <div className="nn-list-title-content">
                <span className="nn-list-title-text">
                    <span
                        className={`nn-list-title-label${selectedFolderNote ? ' nn-list-title-label--folder-note' : ''}`}
                        onClick={selectedFolderNote ? handleFolderNoteClick : undefined}
                        onMouseDown={selectedFolderNote ? handleFolderNoteMouseDown : undefined}
                    >
                        {desktopTitle}
                    </span>
                </span>
            </div>
        </div>
    );
});
