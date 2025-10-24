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

/**
 * English language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_EN = {
    // Common UI elements
    common: {
        cancel: 'Cancel', // Button text for canceling dialogs and operations (English: Cancel)
        delete: 'Delete', // Button text for delete operations in dialogs (English: Delete)
        remove: 'Remove', // Button text for remove operations in dialogs (English: Remove)
        submit: 'Submit', // Button text for submitting forms and dialogs (English: Submit)
        noSelection: 'No selection', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Untagged', // Label for notes without any tags (English: Untagged)
        untitled: 'Untitled', // Default name for notes without a title (English: Untitled)
        featureImageAlt: 'Feature image', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Unknown error', // Generic fallback when an error has no message (English: Unknown error)
        updateBannerTitle: 'Notebook Navigator update available',
        updateBannerInstruction: 'Update in Settings -> Community plugins',
        updateIndicatorLabel: 'New version available'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Select a folder or tag to view notes', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'No notes', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: '📌 Pinned', // Header for the pinned notes section at the top of file list (English: 📌 Pinned)
        notesSection: 'Notes', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Files' // Header shown between pinned and regular items when showing supported or all files (English: Files)
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Untagged', // Label for the special item showing notes without tags (English: Untagged)
        hiddenTags: 'Hidden tags', // Label for the hidden tags virtual folder (English: Hidden tags)
        tags: 'Tags' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Shortcuts', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentNotesHeader: 'Recent notes', // Header label for recent notes section in navigation pane (English: Recent notes)
        recentFilesHeader: 'Recent files', // Header label when showing recent non-note files in navigation pane (English: Recent files)
        reorderRootFoldersTitle: 'Reorder navigation sections',
        reorderRootFoldersHint: 'Drag headers or items to change order',
        vaultRootLabel: 'Vault',
        resetRootToAlpha: 'Reset to alphabetical order',
        resetRootToFrequency: 'Reset to frequency order',
        dragHandleLabel: 'Drag to reorder',
        pinShortcuts: 'Pin shortcuts',
        unpinShortcuts: 'Unpin shortcuts'
    },

    shortcuts: {
        folderExists: 'Folder already in shortcuts',
        noteExists: 'Note already in shortcuts',
        tagExists: 'Tag already in shortcuts',
        searchExists: 'Search shortcut already exists',
        emptySearchQuery: 'Enter a search query before saving it',
        emptySearchName: 'Enter a name before saving the search',
        add: 'Add to shortcuts',
        remove: 'Remove from shortcuts',
        moveUp: 'Move up',
        moveDown: 'Move down',
        folderNotesPinned: 'Pinned {count} folder notes'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Collapse items', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'Expand all items', // Tooltip for button that expands all items (English: Expand all items)
        scrollToTop: 'Scroll to top',
        newFolder: 'New folder', // Tooltip for create new folder button (English: New folder)
        newNote: 'New note', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Back to navigation', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeSortOrder: 'Change sort order', // Tooltip for the sort order toggle button (English: Change sort order)
        defaultSort: 'Default', // Label for default sorting mode (English: Default)
        customSort: 'Custom', // Label for custom sorting mode (English: Custom)
        showFolders: 'Show navigation', // Tooltip for button to show the navigation pane (English: Show navigation)
        hideFolders: 'Hide navigation', // Tooltip for button to hide the navigation pane (English: Hide navigation)
        reorderRootFolders: 'Reorder root folders and tags',
        finishRootFolderReorder: 'Finish root reorder',
        toggleDescendantNotes: 'Show notes from subfolders / descendants', // Tooltip: include descendants for folders and tags
        autoExpandFoldersTags: 'Auto-expand folders and tags', // Tooltip for button to toggle auto-expanding folders and tags when selected (English: Auto-expand folders and tags)
        showExcludedItems: 'Show hidden items', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Hide hidden items', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Show dual panes', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Show single pane', // Tooltip for button to show single-pane layout (English: Show single pane)
        changeAppearance: 'Change appearance', // Tooltip for button to change folder appearance settings (English: Change appearance)
        search: 'Search' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Search...', // Placeholder text for search input (English: Search...)
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Clear search', // Tooltip for clear search button (English: Clear search)
        saveSearchShortcut: 'Save search shortcut',
        removeSearchShortcut: 'Remove search shortcut',
        shortcutModalTitle: 'Save search shortcut',
        shortcutNameLabel: 'Shortcut name',
        shortcutNamePlaceholder: 'Enter shortcut name'
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'Open in new tab',
            openToRight: 'Open to the right',
            openInNewWindow: 'Open in new window',
            openMultipleInNewTabs: 'Open {count} notes in new tabs',
            openMultipleFilesInNewTabs: 'Open {count} files in new tabs',
            openMultipleToRight: 'Open {count} notes to the right',
            openMultipleFilesToRight: 'Open {count} files to the right',
            openMultipleInNewWindows: 'Open {count} notes in new windows',
            openMultipleFilesInNewWindows: 'Open {count} files in new windows',
            pinNote: 'Pin note',
            pinFile: 'Pin file',
            unpinNote: 'Unpin note',
            unpinFile: 'Unpin file',
            pinMultipleNotes: 'Pin {count} notes',
            pinMultipleFiles: 'Pin {count} files',
            unpinMultipleNotes: 'Unpin {count} notes',
            unpinMultipleFiles: 'Unpin {count} files',
            duplicateNote: 'Duplicate note',
            duplicateFile: 'Duplicate file',
            duplicateMultipleNotes: 'Duplicate {count} notes',
            duplicateMultipleFiles: 'Duplicate {count} files',
            openVersionHistory: 'Open version history',
            revealInFolder: 'Reveal in folder',
            revealInFinder: 'Reveal in Finder',
            showInExplorer: 'Show in system explorer',
            copyDeepLink: 'Copy Obsidian URL',
            copyPath: 'Copy path',
            copyRelativePath: 'Copy relative path',
            renameNote: 'Rename note',
            renameFile: 'Rename file',
            deleteNote: 'Delete note',
            deleteFile: 'Delete file',
            deleteMultipleNotes: 'Delete {count} notes',
            deleteMultipleFiles: 'Delete {count} files',
            moveToFolder: 'Move to...',
            moveMultipleToFolder: 'Move {count} files to...',
            addTag: 'Add tag',
            removeTag: 'Remove tag',
            removeAllTags: 'Remove all tags',
            changeIcon: 'Change icon',
            changeColor: 'Change color'
        },
        folder: {
            newNote: 'New note',
            newFolder: 'New folder',
            newCanvas: 'New canvas',
            newBase: 'New base',
            newDrawing: 'New drawing',
            duplicateFolder: 'Duplicate folder',
            searchInFolder: 'Search in folder',
            createFolderNote: 'Create folder note',
            deleteFolderNote: 'Delete folder note',
            changeIcon: 'Change icon',
            changeColor: 'Change color',
            changeBackground: 'Change background',
            excludeFolder: 'Hide folder',
            moveFolder: 'Move to...',
            renameFolder: 'Rename folder',
            deleteFolder: 'Delete folder'
        },
        tag: {
            changeIcon: 'Change icon',
            changeColor: 'Change color',
            changeBackground: 'Change background',
            showTag: 'Show tag',
            hideTag: 'Hide tag'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        defaultPreset: 'Default appearance',
        slimPreset: 'Slim (no date/preview/image)',
        titleRows: 'Title rows',
        previewRows: 'Preview rows',
        defaultOption: (rows: number) => `Default (${rows})`,
        defaultTitleOption: (rows: number) => `Default title rows (${rows})`,
        defaultPreviewOption: (rows: number) => `Default preview rows (${rows})`,
        titleRowOption: (rows: number) => `${rows} title row${rows === 1 ? '' : 's'}`,
        previewRowOption: (rows: number) => `${rows} preview row${rows === 1 ? '' : 's'}`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'Search icons...',
            recentlyUsedHeader: 'Recently used',
            emptyStateSearch: 'Start typing to search icons',
            emptyStateNoResults: 'No icons found',
            showingResultsInfo: 'Showing 50 of {count} results. Type more to narrow down.',
            emojiInstructions: 'Type or paste any emoji to use it as an icon',
            removeIcon: 'Remove icon'
        },
        colorPicker: {
            currentColor: 'Current',
            newColor: 'New',
            presetColors: 'Preset colors',
            recentColors: 'Recent colors',
            clearRecentColors: 'Clear recent colors',
            removeRecentColor: 'Remove color',
            removeColor: 'Remove color',
            apply: 'Apply',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'Red',
                orange: 'Orange',
                amber: 'Amber',
                yellow: 'Yellow',
                lime: 'Lime',
                green: 'Green',
                emerald: 'Emerald',
                teal: 'Teal',
                cyan: 'Cyan',
                sky: 'Sky',
                blue: 'Blue',
                indigo: 'Indigo',
                violet: 'Violet',
                purple: 'Purple',
                fuchsia: 'Fuchsia',
                pink: 'Pink',
                rose: 'Rose',
                gray: 'Gray',
                slate: 'Slate',
                stone: 'Stone'
            }
        },
        tagOperation: {
            renameTitle: 'Rename tag {tag}',
            deleteTitle: 'Delete tag {tag}',
            newTagPrompt: 'New tag name',
            newTagPlaceholder: 'Enter new tag name',
            renameWarning: 'Renaming tag {oldTag} will modify {count} {files}.',
            deleteWarning: 'Deleting tag {tag} will modify {count} {files}.',
            modificationWarning: 'This will update file modification dates.',
            affectedFiles: 'Affected files:',
            andMore: '...and {count} more',
            confirmRename: 'Rename tag',
            confirmDelete: 'Delete tag',
            file: 'file',
            files: 'files'
        },
        fileSystem: {
            newFolderTitle: 'New folder',
            renameFolderTitle: 'Rename folder',
            renameFileTitle: 'Rename file',
            deleteFolderTitle: "Delete '{name}'?",
            deleteFileTitle: "Delete '{name}'?",
            folderNamePrompt: 'Enter folder name:',
            renamePrompt: 'Enter new name:',
            renameVaultTitle: 'Change vault display name',
            renameVaultPrompt: 'Enter custom display name (leave empty to use default):',
            deleteFolderConfirm: 'Are you sure you want to delete this folder and all its contents?',
            deleteFileConfirm: 'Are you sure you want to delete this file?',
            removeAllTagsTitle: 'Remove all tags',
            removeAllTagsFromNote: 'Are you sure you want to remove all tags from this note?',
            removeAllTagsFromNotes: 'Are you sure you want to remove all tags from {count} notes?'
        },
        folderSuggest: {
            placeholder: 'Move to folder...',
            navigatePlaceholder: 'Navigate to folder...',
            instructions: {
                navigate: 'to navigate',
                move: 'to move',
                select: 'to select',
                dismiss: 'to dismiss'
            }
        },
        homepage: {
            placeholder: 'Search files...',
            instructions: {
                navigate: 'to navigate',
                select: 'to set homepage',
                dismiss: 'to dismiss'
            }
        },
        navigationBanner: {
            placeholder: 'Search images...',
            instructions: {
                navigate: 'to navigate',
                select: 'to set banner',
                dismiss: 'to dismiss'
            }
        },
        tagSuggest: {
            placeholder: 'Search tags...',
            navigatePlaceholder: 'Navigate to tag...',
            addPlaceholder: 'Search for tag to add...',
            removePlaceholder: 'Select tag to remove...',
            createNewTag: 'Create new tag: #{tag}',
            instructions: {
                navigate: 'to navigate',
                select: 'to select',
                dismiss: 'to dismiss',
                add: 'to add tag',
                remove: 'to remove tag'
            }
        },
        folderNoteType: {
            title: 'Choose folder note type',
            markdown: 'Markdown',
            canvas: 'Canvas',
            base: 'Base'
        }
    },
    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Failed to create folder: {error}',
            createFile: 'Failed to create file: {error}',
            renameFolder: 'Failed to rename folder: {error}',
            renameFolderNoteConflict: 'Cannot rename: "{name}" already exists in this folder',
            renameFile: 'Failed to rename file: {error}',
            deleteFolder: 'Failed to delete folder: {error}',
            deleteFile: 'Failed to delete file: {error}',
            duplicateNote: 'Failed to duplicate note: {error}',
            createCanvas: 'Failed to create canvas: {error}',
            createDatabase: 'Failed to create database: {error}',
            duplicateFolder: 'Failed to duplicate folder: {error}',
            openVersionHistory: 'Failed to open version history: {error}',
            versionHistoryNotFound: 'Version history command not found. Ensure Obsidian Sync is enabled.',
            revealInExplorer: 'Failed to reveal file in system explorer: {error}',
            folderNoteAlreadyExists: 'Folder note already exists',
            folderAlreadyExists: 'Folder "{name}" already exists',
            folderNotesDisabled: 'Enable folder notes in settings to convert files',
            folderNoteAlreadyLinked: 'This file already acts as a folder note',
            folderNoteUnsupportedExtension: 'Unsupported file extension: {extension}',
            folderNoteMoveFailed: 'Failed to move file during conversion: {error}',
            folderNoteRenameConflict: 'A file named "{name}" already exists in the folder',
            folderNoteConversionFailed: 'Failed to convert file to folder note',
            folderNoteConversionFailedWithReason: 'Failed to convert file to folder note: {error}',
            folderNoteOpenFailed: 'Converted file but failed to open folder note: {error}',
            failedToDeleteFile: 'Failed to delete {name}: {error}',
            failedToDeleteMultipleFiles: 'Failed to delete {count} files',
            versionHistoryNotAvailable: 'Version history service not available',
            drawingAlreadyExists: 'A drawing with this name already exists',
            failedToCreateDrawing: 'Failed to create drawing',
            noFolderSelected: 'No folder is selected in Notebook Navigator',
            noFileSelected: 'No file is selected'
        },
        notices: {
            excludedFolder: 'Excluded folder: {name}'
        },
        notifications: {
            deletedMultipleFiles: 'Deleted {count} files',
            movedMultipleFiles: 'Moved {count} files to {folder}',
            folderNoteConversionSuccess: 'Converted file to folder note in "{name}"',
            folderMoved: 'Moved folder "{name}"',
            deepLinkCopied: 'Obsidian URL copied to clipboard',
            pathCopied: 'Path copied to clipboard',
            relativePathCopied: 'Relative path copied to clipboard',
            tagAddedToNote: 'Added tag to 1 note',
            tagAddedToNotes: 'Added tag to {count} notes',
            tagRemovedFromNote: 'Removed tag from 1 note',
            tagRemovedFromNotes: 'Removed tag from {count} notes',
            tagsClearedFromNote: 'Cleared all tags from 1 note',
            tagsClearedFromNotes: 'Cleared all tags from {count} notes',
            noTagsToRemove: 'No tags to remove',
            noFilesSelected: 'No files selected',
            tagOperationsNotAvailable: 'Tag operations not available',
            tagsRequireMarkdown: 'Tags are only supported on Markdown notes',
            iconPackDownloaded: '{provider} downloaded',
            iconPackUpdated: '{provider} updated ({version})',
            iconPackRemoved: '{provider} removed',
            iconPackLoadFailed: 'Failed to load {provider}'
        },
        confirmations: {
            deleteMultipleFiles: 'Are you sure you want to delete {count} files?',
            deleteConfirmation: 'This action cannot be undone.'
        },
        defaultNames: {
            untitled: 'Untitled',
            untitledNumber: 'Untitled {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Cannot move a folder into itself or a subfolder.',
            itemAlreadyExists: 'An item named "{name}" already exists in this location.',
            failedToMove: 'Failed to move: {error}',
            failedToAddTag: 'Failed to add tag "{tag}"',
            failedToClearTags: 'Failed to clear tags',
            failedToMoveFolder: 'Failed to move folder "{name}"',
            failedToImportFiles: 'Failed to import: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} files already exist in destination',
            addedTag: 'Added tag "{tag}" to {count} files',
            filesAlreadyHaveTag: '{count} files already have this tag or a more specific one',
            clearedTags: 'Cleared all tags from {count} files',
            noTagsToClear: 'No tags to clear',
            fileImported: 'Imported 1 file',
            filesImported: 'Imported {count} files'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'Today',
        yesterday: 'Yesterday',
        previous7Days: 'Previous 7 days',
        previous30Days: 'Previous 30 days'
    },

    // Weekdays
    weekdays: {
        sunday: 'Sunday',
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday'
    },

    // Plugin commands
    commands: {
        open: 'Open', // Command palette: Opens the Notebook Navigator view (English: Open)
        openHomepage: 'Open homepage', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        revealFile: 'Reveal file', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Search', // Command palette: Toggle search in the file list (English: Search)
        toggleDualPane: 'Toggle dual pane layout', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        deleteFile: 'Delete files', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Create new note', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        moveFiles: 'Move files', // Command palette: Move selected files to another folder (English: Move files)
        convertToFolderNote: 'Convert to folder note', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        pinAllFolderNotes: 'Pin all folder notes', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Navigate to folder', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Navigate to tag', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        addShortcut: 'Add to shortcuts', // Command palette: Adds the current file, folder, or tag to shortcuts (English: Add to shortcuts)
        toggleDescendants: 'Toggle descendants', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Toggle hidden items', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        collapseExpand: 'Collapse / expand all items', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        addTag: 'Add tag to selected files', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        removeTag: 'Remove tag from selected files', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Remove all tags from selected files', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        rebuildCache: 'Rebuild cache' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Reveal in Notebook Navigator' // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Last modified at',
        createdAt: 'Created at',
        file: 'file',
        files: 'files',
        folder: 'folder',
        folders: 'folders'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'Failed metadata report exported to: {filename}',
            exportFailed: 'Failed to export metadata report'
        },
        sections: {
            general: 'General',
            navigationPane: 'Navigation pane',
            icons: 'Icon packs',
            folders: 'Folders',
            tags: 'Tags',
            search: 'Search',
            listPane: 'List pane',
            notes: 'Notes',
            hotkeys: 'Hotkeys',
            advanced: 'Advanced'
        },
        groups: {
            general: {
                view: 'Appearance',
                behavior: 'Behavior',
                filtering: 'Filtering',
                formatting: 'Formatting'
            },
            navigation: {
                behavior: 'Behavior',
                appearance: 'Appearance'
            },
            list: {
                display: 'Appearance',
                quickActions: 'Quick actions'
            },
            notes: {
                frontmatter: 'Frontmatter',
                display: 'Appearance'
            }
        },
        items: {
            searchProvider: {
                name: 'Search provider',
                desc: 'Choose between quick file name search or full-text search with Omnisearch plugin.',
                options: {
                    internal: 'Filter search',
                    omnisearch: 'Omnisearch (full-text)'
                },
                info: {
                    filterSearch: {
                        title: 'Filter search (default):',
                        description:
                            'Fast, lightweight search that filters files by name and tags within the current folder and subfolders. Supports tag filtering with # prefix (e.g., #project), exclusion with ! prefix (e.g., !draft, !#archived), and finding untagged notes with !#. Ideal for quick navigation within your current context.'
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            'Full-text search that searches your entire vault, then filters the results to show only files from the current folder, subfolders, or selected tags. Requires the Omnisearch plugin to be installed - if not available, search will automatically fall back to Filter search.',
                        warningNotInstalled: 'Omnisearch plugin not installed. Filter search is used.',
                        limitations: {
                            title: 'Known limitations:',
                            performance: 'Performance: Can be slow, especially when searching for less than 3 characters in large vaults',
                            pathBug:
                                'Path bug: Cannot search in paths with non-ASCII characters and does not search subpaths correctly, affecting which files appear in search results',
                            limitedResults:
                                'Limited results: Since Omnisearch searches the entire vault and returns a limited number of results before filtering, relevant files from your current folder may not appear if too many matches exist elsewhere in the vault',
                            previewText:
                                'Preview text: Note previews are replaced with Omnisearch result excerpts, which may not show the actual search match highlight if it appears elsewhere in the file'
                        }
                    }
                }
            },
            listPaneTitle: {
                name: 'List pane title',
                desc: 'Choose where the list pane title is shown.',
                options: {
                    header: 'Show in header',
                    list: 'Show in list pane',
                    hidden: 'Do not show'
                }
            },
            sortNotesBy: {
                name: 'Sort notes by',
                desc: 'Choose how notes are sorted in the note list.',
                options: {
                    'modified-desc': 'Date edited (newest on top)',
                    'modified-asc': 'Date edited (oldest on top)',
                    'created-desc': 'Date created (newest on top)',
                    'created-asc': 'Date created (oldest on top)',
                    'title-asc': 'Title (A on top)',
                    'title-desc': 'Title (Z on top)'
                }
            },
            includeDescendantNotes: {
                name: 'Show notes from subfolders / descendants',
                desc: 'Include notes from nested subfolders and tag descendants when viewing a folder or tag.'
            },
            separateNoteCounts: {
                name: 'Show current and descendant counts separately',
                desc: 'Display note counts as "current ▾ descendants" format in folders and tags.'
            },
            groupNotes: {
                name: 'Group notes',
                desc: 'Display headers between notes grouped by date or folder. Tag views use date groups when folder grouping is enabled.',
                options: {
                    none: "Don't group",
                    date: 'Group by date',
                    folder: 'Group by folder'
                }
            },
            optimizeNoteHeight: {
                name: 'Optimize note height',
                desc: 'Reduce height for pinned notes and notes without preview text.'
            },
            showParentFolderNames: {
                name: 'Show parent folder names',
                desc: 'Display the parent folder name for notes in subfolders or tags.'
            },
            showQuickActions: {
                name: 'Show quick actions (desktop only)',
                desc: 'Show hover actions on file items.'
            },
            quickActionsRevealInFolder: {
                name: 'Reveal in folder',
                desc: "Quick action: Reveal note in its parent folder. Only visible when viewing notes from subfolders or in tags (not shown in the note's actual folder)."
            },
            quickActionsPinNote: {
                name: 'Pin note',
                desc: 'Quick action: Pin or unpin note at top of list.'
            },
            quickActionsOpenInNewTab: {
                name: 'Open in new tab',
                desc: 'Quick action: Open note in new tab.'
            },
            dualPane: {
                name: 'Dual pane layout (desktop only, not synced)',
                desc: 'Show navigation pane and list pane side by side on desktop.'
            },
            dualPaneOrientation: {
                name: 'Dual pane orientation',
                desc: 'Choose horizontal or vertical layout when dual pane is active.',
                options: {
                    horizontal: 'Horizontal split',
                    vertical: 'Vertical split'
                }
            },
            dualPaneBackground: {
                name: 'Background color (desktop only)',
                desc: 'Choose background colors for navigation and list panes on desktop.',
                options: {
                    separate: 'Separate backgrounds',
                    primary: 'Use list background',
                    secondary: 'Use navigation background'
                }
            },
            startView: {
                name: 'Default startup view',
                desc: 'Choose which pane to display when opening Notebook Navigator. Navigation pane shows shortcuts, recent notes, and folder tree. List pane shows note list immediately.',
                options: {
                    navigation: 'Navigation pane',
                    files: 'List pane'
                }
            },
            autoRevealActiveNote: {
                name: 'Auto-reveal active note',
                desc: 'Automatically reveal notes when opened from Quick Switcher, links, or search.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Ignore events from right sidebar',
                desc: 'Do not change active note when clicking or changing notes in the right sidebar.'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Auto-select first note (desktop only)',
                desc: 'Automatically open the first note when switching folders or tags.'
            },
            autoExpandFoldersTags: {
                name: 'Auto-expand folders and tags',
                desc: 'Automatically expand folders and tags when they are selected.'
            },
            navigationBanner: {
                name: 'Navigation banner',
                desc: 'Display an image above the navigation pane.',
                current: 'Current banner: {path}',
                chooseButton: 'Choose image',
                clearButton: 'Clear'
            },
            showShortcuts: {
                name: 'Show shortcuts',
                desc: 'Display the shortcuts section in the navigation pane.'
            },
            showRecentNotes: {
                name: 'Show recent notes',
                desc: 'Display the recent notes section in the navigation pane.'
            },
            recentNotesCount: {
                name: 'Recent notes count',
                desc: 'Number of recent notes to display.'
            },
            showTooltips: {
                name: 'Show tooltips (desktop only)',
                desc: 'Display hover tooltips with additional information for notes and folders.'
            },
            showTooltipPath: {
                name: 'Show path',
                desc: 'Display the folder path below note names in tooltips.'
            },
            multiSelectModifier: {
                name: 'Multi-select modifier',
                desc: 'Choose which modifier key toggles multi-selection. When Option/Alt is selected, Cmd/Ctrl click opens notes in a new tab.',
                options: {
                    cmdCtrl: 'Cmd/Ctrl click',
                    optionAlt: 'Option/Alt click'
                }
            },
            fileVisibility: {
                name: 'Show file types',
                desc: 'Filter which file types are shown in the navigator. File types not supported by Obsidian may open in external applications.',
                options: {
                    documents: 'Documents (.md, .canvas, .base)',
                    supported: 'Supported (opens in Obsidian)',
                    all: 'All (may open externally)'
                }
            },
            homepage: {
                name: 'Homepage',
                desc: 'Choose the file that Notebook Navigator opens automatically, such as a dashboard.',
                current: 'Current: {path}',
                currentMobile: 'Mobile: {path}',
                chooseButton: 'Choose file',
                clearButton: 'Clear',
                separateMobile: {
                    name: 'Separate mobile homepage',
                    desc: 'Use a different homepage for mobile devices.'
                }
            },
            excludedNotes: {
                name: 'Hide notes',
                desc: 'Comma-separated list of frontmatter properties. Notes containing any of these properties will be hidden (e.g., draft, private, archived).',
                placeholder: 'draft, private'
            },
            excludedFolders: {
                name: 'Hide folders',
                desc: 'Comma-separated list of folders to hide. Name patterns: assets* (folders starting with assets), *_temp (ending with _temp). Path patterns: /archive (root archive only), /res* (root folders starting with res), /*/temp (temp folders one level deep), /projects/* (all folders inside projects).',
                placeholder: 'templates, assets*, /archive, /res*'
            },
            showFileDate: {
                name: 'Show date',
                desc: 'Display the date below note names.'
            },
            showFileTags: {
                name: 'Show file tags',
                desc: 'Display clickable tags in file items.'
            },
            showFileTagAncestors: {
                name: 'Show parent tags',
                desc: 'Display parent segments before the tag name.'
            },
            colorFileTags: {
                name: 'Color file tags',
                desc: 'Apply tag colors to tag badges on file items.'
            },
            showFileTagsInSlimMode: {
                name: 'Show file tags in slim mode',
                desc: 'Display tags when date, preview, and image are hidden.'
            },
            dateFormat: {
                name: 'Date format',
                desc: 'Format for displaying dates (uses date-fns format).',
                placeholder: 'MMM d, yyyy',
                help: 'Common formats:\nMMM d, yyyy = May 25, 2022\ndd/MM/yyyy = 25/05/2022\nyyyy-MM-dd = 2022-05-25\n\nTokens:\nyyyy/yy = year\nMMMM/MMM/MM = month\ndd/d = day\nEEEE/EEE = weekday',
                helpTooltip: 'Click for format reference'
            },
            timeFormat: {
                name: 'Time format',
                desc: 'Format for displaying times (uses date-fns format).',
                placeholder: 'h:mm a',
                help: 'Common formats:\nh:mm a = 2:30 PM (12-hour)\nHH:mm = 14:30 (24-hour)\nh:mm:ss a = 2:30:45 PM\nHH:mm:ss = 14:30:45\n\nTokens:\nHH/H = 24-hour\nhh/h = 12-hour\nmm = minutes\nss = seconds\na = AM/PM',
                helpTooltip: 'Click for format reference'
            },
            showFilePreview: {
                name: 'Show note preview',
                desc: 'Display preview text beneath note names.'
            },
            skipHeadingsInPreview: {
                name: 'Skip headings in preview',
                desc: 'Skip heading lines when generating preview text.'
            },
            skipCodeBlocksInPreview: {
                name: 'Skip code blocks in preview',
                desc: 'Skip code blocks when generating preview text.'
            },
            previewProperties: {
                name: 'Preview properties',
                desc: 'Comma-separated list of frontmatter properties to check for preview text. The first property with text will be used.',
                placeholder: 'summary, description, abstract',
                info: 'If no preview text is found in the specified properties, the preview will be generated from the note content.'
            },
            previewRows: {
                name: 'Preview rows',
                desc: 'Number of rows to display for preview text.',
                options: {
                    '1': '1 row',
                    '2': '2 rows',
                    '3': '3 rows',
                    '4': '4 rows',
                    '5': '5 rows'
                }
            },
            fileNameRows: {
                name: 'Title rows',
                desc: 'Number of rows to display for note titles.',
                options: {
                    '1': '1 row',
                    '2': '2 rows'
                }
            },
            showFeatureImage: {
                name: 'Show feature image',
                desc: 'Display thumbnail images from frontmatter. Tip: Use the "Featured Image" plugin to automatically set feature images for all your documents.'
            },
            forceSquareFeatureImage: {
                name: 'Force square feature image',
                desc: 'Render feature images as square thumbnails.'
            },
            featureImageProperties: {
                name: 'Image properties',
                desc: 'Comma-separated list of frontmatter properties to check for thumbnail images. The first property with an image will be used. If empty and the fallback setting is enabled, the first embedded image will be used.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            useEmbeddedImageFallback: {
                name: 'Use embedded image fallback',
                desc: 'Use the first embedded image in the document as a fallback when no thumbnail is found in frontmatter properties (requires Obsidian 1.9.4+). Disable this to verify that thumbnails are properly configured.'
            },
            showRootFolder: {
                name: 'Show root folder',
                desc: 'Display the vault name as the root folder in the tree.'
            },
            inheritFolderColors: {
                name: 'Inherit folder colors',
                desc: 'Child folders inherit color from parent folders.'
            },
            showNoteCount: {
                name: 'Show note count',
                desc: 'Display the number of notes next to each folder and tag.'
            },
            showIcons: {
                name: 'Show icons',
                desc: 'Display icons for folders, tags and notes.'
            },
            showIconsColorOnly: {
                name: 'Apply color to icons only',
                desc: 'When enabled, custom colors are applied only to icons. When disabled, colors are applied to both icons and text labels.'
            },
            collapseBehavior: {
                name: 'Collapse items',
                desc: 'Choose what the expand/collapse all button affects.',
                options: {
                    all: 'All folders and tags',
                    foldersOnly: 'Folders only',
                    tagsOnly: 'Tags only'
                }
            },
            smartCollapse: {
                name: 'Keep selected item expanded',
                desc: 'When collapsing, keep the currently selected folder or tag and its parents expanded.'
            },
            navIndent: {
                name: 'Tree indentation',
                desc: 'Adjust the indentation width for nested folders and tags.'
            },
            navItemHeight: {
                name: 'Item height',
                desc: 'Adjust the height of folders and tags in the navigation pane.'
            },
            navItemHeightScaleText: {
                name: 'Scale text with item height',
                desc: 'Reduce navigation text size when item height is decreased.'
            },
            showTags: {
                name: 'Show tags',
                desc: 'Display tags section below folders in the navigator.'
            },
            tagSortOrder: {
                name: 'Tag sort order',
                desc: 'Choose how tags are ordered in the navigation pane.',
                options: {
                    alphaAsc: 'A to Z',
                    alphaDesc: 'Z to A',
                    frequencyAsc: 'Frequency (low to high)',
                    frequencyDesc: 'Frequency (high to low)'
                }
            },
            showAllTagsFolder: {
                name: 'Show tags folder',
                desc: 'Display "Tags" as a collapsible folder.'
            },
            showUntagged: {
                name: 'Show untagged notes',
                desc: 'Display "Untagged" item for notes without any tags.'
            },
            hiddenTags: {
                name: 'Hidden tags',
                desc: 'Comma-separated list of tag prefixes or name wildcards. Use tag* or *tag to match tag names. Hiding a tag also hides all its sub-tags (e.g., "archive" hides "archive/2024/docs").',
                placeholder: 'internal, temp/drafts, archive/2024'
            },
            enableFolderNotes: {
                name: 'Enable folder notes',
                desc: 'When enabled, folders with associated notes are displayed as clickable links.'
            },
            folderNoteType: {
                name: 'Default folder note type',
                desc: 'Folder note type created from the context menu.',
                options: {
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base',
                    ask: 'Ask when creating'
                }
            },
            folderNoteName: {
                name: 'Folder note name',
                desc: 'Name of the folder note without extension. Leave empty to use the same name as the folder.',
                placeholder: 'index'
            },
            folderNoteProperties: {
                name: 'Folder note properties',
                desc: 'Frontmatter properties to add to newly created folder notes (comma-separated).',
                placeholder: 'foldernote, darktheme'
            },
            hideFolderNoteInList: {
                name: 'Hide folder notes in list',
                desc: "Hide the folder note from appearing in the folder's note list."
            },
            pinCreatedFolderNote: {
                name: 'Pin created folder notes',
                desc: 'Automatically pin folder notes when created from the context menu.'
            },
            confirmBeforeDelete: {
                name: 'Confirm before deleting',
                desc: 'Show confirmation dialog when deleting notes or folders'
            },
            metadataCleanup: {
                name: 'Clean up metadata',
                desc: 'Removes orphaned metadata left behind when files, folders, or tags are deleted, moved, or renamed outside of Obsidian. This only affects the Notebook Navigator settings file.',
                buttonText: 'Clean metadata',
                error: 'Settings cleanup failed',
                loading: 'Checking metadata...',
                statusClean: 'No metadata to clean',
                statusCounts: 'Orphaned items: {folders} folders, {tags} tags, {files} files, {pinned} pins'
            },
            rebuildCache: {
                name: 'Rebuild cache',
                desc: 'Use this if you experience missing tags, incorrect previews or missing feature images. This can happen after sync conflicts or unexpected closures.',
                buttonText: 'Rebuild cache',
                success: 'Cache rebuilt',
                error: 'Failed to rebuild cache'
            },
            hotkeys: {
                intro: 'Edit <plugin folder>/notebook-navigator/data.json to customize Notebook Navigator hotkeys. Open the file and locate the "keyboardShortcuts" section. Each entry uses this structure:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Shift',
                    '"Ctrl" = Control (prefer "Mod" for cross-platform)'
                ],
                guidance:
                    'Add multiple mappings to support alternate keys, like the ArrowUp and K bindings shown above. Combine modifiers in one entry by listing each value, for example "modifiers": ["Mod", "Shift"]. Keyboard sequences such as "gg" or "dd" are not supported. Reload Obsidian after editing the file.'
            },
            externalIcons: {
                downloadButton: 'Download',
                downloadingLabel: 'Downloading...',
                removeButton: 'Remove',
                statusInstalled: 'Downloaded (version {version})',
                statusNotInstalled: 'Not downloaded',
                versionUnknown: 'unknown',
                downloadFailed: 'Failed to download {name}. Check your connection and try again.',
                removeFailed: 'Failed to remove {name}.',
                infoNote:
                    'Downloaded icon packs sync installation state across devices. Icon packs stay in the local database on each device; sync only tracks whether to download or remove them. Icon packs download from the Notebook Navigator repository (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).',
                providers: {
                    bootstrapIconsDesc: 'https://icons.getbootstrap.com/',
                    fontAwesomeDesc: 'https://fontawesome.com/',
                    materialIconsDesc: 'https://fonts.google.com/icons',
                    phosphorDesc: 'https://phosphoricons.com/',
                    rpgAwesomeDesc: 'https://nagoshiashumari.github.io/Rpg-Awesome/',
                    simpleIconsDesc: 'https://simpleicons.org/'
                }
            },
            useFrontmatterDates: {
                name: 'Read metadata from frontmatter',
                desc: 'Read note names, timestamps, icons, and colors from frontmatter when available, falling back to file system values or settings'
            },
            frontmatterIconField: {
                name: 'Icon field',
                desc: 'Frontmatter field for file icons. Leave empty to use icons stored in settings.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'Color field',
                desc: 'Frontmatter field for file colors. Leave empty to use colors stored in settings.',
                placeholder: 'color'
            },
            frontmatterSaveMetadata: {
                name: 'Save icons and colors to frontmatter',
                desc: 'Automatically write file icons and colors to frontmatter using the configured fields above.'
            },
            frontmatterIconizeFormat: {
                name: 'Save in Iconize format',
                desc: 'Save icons using Iconize format (e.g. LiHome, FasUser, SiGithub) instead of plugin format (e.g. home, fontawesome-solid:user, simple-icons:github).'
            },
            frontmatterMigration: {
                name: 'Migrate icons and colors from settings',
                desc: 'Stored in settings: {icons} icons, {colors} colors.',
                button: 'Migrate',
                buttonWorking: 'Migrating...',
                noticeNone: 'No file icons or colors stored in settings.',
                noticeDone: 'Migrated {migratedIcons}/{icons} icons, {migratedColors}/{colors} colors.',
                noticeFailures: 'Failed entries: {failures}.',
                noticeError: 'Migration failed. Check console for details.'
            },
            frontmatterNameField: {
                name: 'Name field',
                desc: 'Frontmatter field to use as the note display name. Leave empty to use the file name.',
                placeholder: 'title'
            },
            frontmatterCreatedField: {
                name: 'Created timestamp field',
                desc: 'Frontmatter field name for the created timestamp. Leave empty to only use file system date.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'Modified timestamp field',
                desc: 'Frontmatter field name for the modified timestamp. Leave empty to only use file system date.',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'Timestamp format',
                desc: 'Format used to parse timestamps in frontmatter. Leave empty to use ISO 8601 format',
                helpTooltip: 'See date-fns format documentation',
                help: "Common formats:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'Support development',
                desc: 'If you love using Notebook Navigator, please consider supporting its continued development.',
                buttonText: '❤️ Sponsor',
                coffeeButton: '☕️ Buy me a coffee'
            },
            updateCheckOnStart: {
                name: 'Check for new version on start',
                desc: 'Checks for new plugin releases on startup and shows a notification when an update is available. Each version is announced only once, and checks occur at most once per day.',
                status: 'New version available: {version}'
            },
            whatsNew: {
                name: "What's new",
                desc: 'See recent updates and improvements',
                buttonText: 'View recent updates'
            },
            cacheStatistics: {
                localCache: 'Local cache',
                items: 'items',
                withTags: 'with tags',
                withPreviewText: 'with preview text',
                withFeatureImage: 'with feature image',
                withMetadata: 'with metadata'
            },
            metadataInfo: {
                successfullyParsed: 'Successfully parsed',
                itemsWithName: 'items with name',
                withCreatedDate: 'with created date',
                withModifiedDate: 'with modified date',
                withIcon: 'with icon',
                withColor: 'with color',
                failedToParse: 'Failed to parse',
                createdDates: 'created dates',
                modifiedDates: 'modified dates',
                checkTimestampFormat: 'Check your timestamp format.',
                exportFailed: 'Export errors'
            }
        }
    },
    whatsNew: {
        title: "What's new in Notebook Navigator",
        supportMessage: 'If you find Notebook Navigator helpful, please consider supporting its development.',
        supportButton: 'Buy me a coffee',
        thanksButton: 'Thanks!'
    }
};
