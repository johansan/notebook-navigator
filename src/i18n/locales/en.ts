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
        clear: 'Clear', // Button text for clearing values (English: Clear)
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
        pinnedSection: 'Pinned', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Notes', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Files', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (hidden)' // Accessibility label applied to list items that are normally hidden
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
        reorderRootFoldersTitle: 'Reorder navigation',
        reorderRootFoldersHint: 'Use arrows or drag to reorder',
        vaultRootLabel: 'Vault',
        resetRootToAlpha: 'Reset to alphabetical order',
        resetRootToFrequency: 'Reset to frequency order',
        pinShortcuts: 'Pin shortcuts',
        pinShortcutsAndRecentNotes: 'Pin shortcuts and recent notes',
        pinShortcutsAndRecentFiles: 'Pin shortcuts and recent files',
        unpinShortcuts: 'Unpin shortcuts',
        unpinShortcutsAndRecentNotes: 'Unpin shortcuts and recent notes',
        unpinShortcutsAndRecentFiles: 'Unpin shortcuts and recent files',
        profileMenuLabel: 'Profile',
        profileMenuAria: 'Change vault profile'
    },

    shortcuts: {
        folderExists: 'Folder already in shortcuts',
        noteExists: 'Note already in shortcuts',
        tagExists: 'Tag already in shortcuts',
        searchExists: 'Search shortcut already exists',
        emptySearchQuery: 'Enter a search query before saving it',
        emptySearchName: 'Enter a name before saving the search',
        add: 'Add to shortcuts',
        addNotesCount: 'Add {count} notes to shortcuts',
        addFilesCount: 'Add {count} files to shortcuts',
        rename: 'Rename shortcut',
        remove: 'Remove from shortcuts',
        removeAll: 'Remove all shortcuts',
        removeAllConfirm: 'Remove all shortcuts?',
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
        reorderRootFolders: 'Reorder navigation',
        finishRootFolderReorder: 'Done reordering',
        toggleDescendantNotes: 'Show notes from subfolders / descendants', // Tooltip: include descendants for folders and tags
        autoExpandFoldersTags: 'Expand on selection', // Tooltip for button to toggle auto-expanding folders and tags when selected (English: Expand on selection)
        showExcludedItems: 'Show hidden folders, tags, and notes', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Hide hidden folders, tags, and notes', // Tooltip for button to hide hidden items (English: Hide hidden items)
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
            copyPath: 'Copy file system path',
            copyRelativePath: 'Copy vault path',
            renameNote: 'Rename note',
            renameFile: 'Rename file',
            deleteNote: 'Delete note',
            deleteFile: 'Delete file',
            deleteMultipleNotes: 'Delete {count} notes',
            deleteMultipleFiles: 'Delete {count} files',
            moveNoteToFolder: 'Move note to...',
            moveFileToFolder: 'Move file to...',
            moveMultipleNotesToFolder: 'Move {count} notes to...',
            moveMultipleFilesToFolder: 'Move {count} files to...',
            addTag: 'Add tag',
            removeTag: 'Remove tag',
            removeAllTags: 'Remove all tags',
            changeIcon: 'Change icon',
            changeColor: 'Change color'
        },
        folder: {
            newNote: 'New note',
            newNoteFromTemplate: 'New note from template',
            newFolder: 'New folder',
            newCanvas: 'New canvas',
            newBase: 'New base',
            newDrawing: 'New drawing',
            newExcalidrawDrawing: 'New Excalidraw drawing',
            newTldrawDrawing: 'New Tldraw drawing',
            duplicateFolder: 'Duplicate folder',
            searchInFolder: 'Search in folder',
            copyPath: 'Copy file system path',
            copyRelativePath: 'Copy vault path',
            createFolderNote: 'Create folder note',
            detachFolderNote: 'Detach folder note',
            deleteFolderNote: 'Delete folder note',
            changeIcon: 'Change icon',
            changeColor: 'Change color',
            changeBackground: 'Change background',
            excludeFolder: 'Hide folder',
            unhideFolder: 'Unhide folder',
            moveFolder: 'Move folder to...',
            renameFolder: 'Rename folder',
            deleteFolder: 'Delete folder'
        },
        tag: {
            changeIcon: 'Change icon',
            changeColor: 'Change color',
            changeBackground: 'Change background',
            showTag: 'Show tag',
            hideTag: 'Hide tag'
        },
        navigation: {
            addSeparator: 'Add separator',
            removeSeparator: 'Remove separator'
        },
        style: {
            title: 'Style',
            copy: 'Copy style',
            paste: 'Paste style',
            removeIcon: 'Remove icon',
            removeColor: 'Remove color',
            removeBackground: 'Remove background',
            clear: 'Clear style'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        standardPreset: 'Standard',
        compactPreset: 'Compact',
        defaultSuffix: '(default)',
        titleRows: 'Title rows',
        previewRows: 'Preview rows',
        groupBy: 'Group by',
        defaultOption: (rows: number) => `Default (${rows})`,
        defaultTitleOption: (rows: number) => `Default title rows (${rows})`,
        defaultPreviewOption: (rows: number) => `Default preview rows (${rows})`,
        defaultGroupOption: (groupLabel: string) => `Default grouping (${groupLabel})`,
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
            removeIcon: 'Remove icon',
            allTabLabel: 'All'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Add rule'
        },
        interfaceIcons: {
            title: 'Interface icons',
            items: {
                'nav-shortcuts': 'Shortcuts',
                'nav-recent-files': 'Recent files',
                'nav-expand-all': 'Expand all',
                'nav-collapse-all': 'Collapse all',
                'nav-tree-expand': 'Tree chevron: expand',
                'nav-tree-collapse': 'Tree chevron: collapse',
                'nav-hidden-items': 'Hidden items',
                'nav-root-reorder': 'Reorder root folders',
                'nav-new-folder': 'New folder',
                'nav-show-single-pane': 'Show single pane',
                'nav-show-dual-pane': 'Show dual panes',
                'nav-profile-chevron': 'Profile menu chevron',
                'list-search': 'Search',
                'list-descendants': 'Notes from subfolders',
                'list-sort-ascending': 'Sort order: ascending',
                'list-sort-descending': 'Sort order: descending',
                'list-appearance': 'Change appearance',
                'list-new-note': 'New note',
                'nav-folder-open': 'Folder open',
                'nav-folder-closed': 'Folder closed',
                'nav-tag': 'Tag',
                'list-pinned': 'Pinned items'
            }
        },
        colorPicker: {
            currentColor: 'Current',
            newColor: 'New',
            presetColors: 'Preset colors',
            userColors: 'User colors',
            paletteDefault: 'Default',
            paletteCustom: 'Custom',
            copyColors: 'Copy color',
            colorsCopied: 'Color copied to clipboard',
            copyClipboardError: 'Could not write to clipboard',
            pasteColors: 'Paste color',
            pasteClipboardError: 'Could not read clipboard',
            pasteInvalidJson: 'Clipboard does not contain valid text',
            pasteInvalidFormat: 'Expected a hex color value',
            colorsPasted: 'Color pasted successfully',
            resetUserColors: 'Clear custom colors',
            clearCustomColorsConfirm: 'Remove all custom colors?',
            userColorSlot: 'Color {slot}',
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
        selectVaultProfile: {
            title: 'Select vault profile',
            currentBadge: 'Active',
            emptyState: 'No vault profiles available.'
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
            renameUnchanged: '{tag} unchanged',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            invalidTagName: 'Enter a valid tag name.',
            descendantRenameError: 'Cannot move a tag into itself or a descendant.',
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
            hideInOtherVaultProfiles: 'Hide in other vault profiles',
            renamePrompt: 'Enter new name:',
            renameVaultTitle: 'Change vault display name',
            renameVaultPrompt: 'Enter custom display name (leave empty to use default):',
            deleteFolderConfirm: 'Are you sure you want to delete this folder and all its contents?',
            deleteFileConfirm: 'Are you sure you want to delete this file?',
            removeAllTagsTitle: 'Remove all tags',
            removeAllTagsFromNote: 'Are you sure you want to remove all tags from this note?',
            removeAllTagsFromNotes: 'Are you sure you want to remove all tags from {count} notes?'
        },
        folderNoteType: {
            title: 'Select folder note type',
            folderLabel: 'Folder: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `Move ${name} to folder...`,
            multipleFilesLabel: (count: number) => `${count} files`,
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
        welcome: {
            title: 'Welcome to {pluginName}',
            introText:
                'Hi there! Before you start, I highly recommend that you watch the first five minutes of the video below to understand how the panes and the toggle "Show notes from subfolders" works.',
            continueText:
                'If you have five more minutes then continue watching the video to understand the compact display modes and how to properly set up shortcuts and important hotkeys.',
            thanksText: 'Thank you so much for downloading, and enjoy!',
            videoAlt: 'Installing and mastering Notebook Navigator',
            openVideoButton: 'Play video',
            closeButton: "I'll watch it later"
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
            folderNoteNotFound: 'No folder note in selected folder',
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
        warnings: {
            linkBreakingNameCharacters: 'This name includes characters that break Obsidian links: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'Names cannot start with a period or include : or /.',
            forbiddenNameCharactersWindows: 'Windows-reserved characters are not allowed: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'Folder hidden: {name}',
            showFolder: 'Folder shown: {name}'
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
            iconPackLoadFailed: 'Failed to load {provider}',
            hiddenFileReveal: 'File is hidden. Enable "Show hidden items" to display it'
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
        selectVaultProfile: 'Select vault profile', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'Select vault profile 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Select vault profile 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Select vault profile 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Delete files', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Create new note', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Create new note from template', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Move files', // Command palette: Move selected files to another folder (English: Move files)
        selectNextFile: 'Select next file', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Select previous file', // Command palette: Selects the previous file in the current view (English: Select previous file)
        convertToFolderNote: 'Convert to folder note', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Set as folder note', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Detach folder note', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Pin all folder notes', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Navigate to folder', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Navigate to tag', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        addShortcut: 'Add to shortcuts', // Command palette: Adds the current file, folder, or tag to shortcuts (English: Add to shortcuts)
        openShortcut: 'Open shortcut {number}', // Command palette: Opens a shortcut by its position (English: Open shortcut {number})
        toggleDescendants: 'Toggle descendants', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Toggle hidden folders, tags, and notes', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Toggle tag sort order', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
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
            foldersAndTags: 'Folders & tags',
            tags: 'Tags',
            search: 'Search',
            searchAndHotkeys: 'Search & hotkeys',
            listPane: 'List pane',
            notes: 'Notes',
            hotkeys: 'Hotkeys',
            advanced: 'Advanced'
        },
        groups: {
            general: {
                filtering: 'Filtering',
                behavior: 'Behavior',
                view: 'Appearance',
                icons: 'Icons',
                desktopAppearance: 'Desktop appearance',
                formatting: 'Formatting'
            },
            navigation: {
                appearance: 'Appearance',
                shortcutsAndRecent: 'Shortcuts & recent items'
            },
            list: {
                display: 'Appearance',
                pinnedNotes: 'Pinned notes',
                quickActions: 'Quick actions'
            },
            notes: {
                frontmatter: 'Frontmatter',
                icon: 'Icon',
                title: 'Title',
                previewText: 'Preview text',
                featureImage: 'Feature image',
                tags: 'Tags',
                date: 'Date',
                parentFolder: 'Parent folder'
            }
        },
        items: {
            searchProvider: {
                name: 'Search provider',
                desc: 'Choose between quick file name search or full-text search with Omnisearch plugin. (not synced)',
                options: {
                    internal: 'Filter search',
                    omnisearch: 'Omnisearch (full-text)'
                },
                info: {
                    filterSearch: {
                        title: 'Filter search (default):',
                        description:
                            'Filters files by name and tags within the current folder and subfolders. Filter mode: mixed text and tags match all terms (e.g., "project #work"). Tag mode: search with only tags supports AND/OR operators (e.g., "#work AND #urgent", "#project OR #personal"). Cmd/Ctrl+Click tags to add with AND, Cmd/Ctrl+Shift+Click to add with OR. Supports exclusion with ! prefix (e.g., !draft, !#archived) and finding untagged notes with !#.'
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
                name: 'List pane title (desktop only)',
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
            revealFileOnListChanges: {
                name: 'Scroll to selected file on list changes',
                desc: 'Scroll to the selected file when pinning notes, showing descendant notes, changing folder appearance, or running file operations.'
            },
            includeDescendantNotes: {
                name: 'Show notes from subfolders / descendants (not synced)',
                desc: 'Include notes from nested subfolders and tag descendants when viewing a folder or tag.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Limit pinned notes to their folder',
                desc: 'Pinned notes appear only when viewing the folder or tag where they were pinned.'
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
            showPinnedGroupHeader: {
                name: 'Show pinned group header',
                desc: 'Display the pinned section header above pinned notes.'
            },
            showPinnedIcon: {
                name: 'Show pinned icon',
                desc: 'Show the icon next to the pinned section header.'
            },
            defaultListMode: {
                name: 'Default list mode',
                desc: 'Select the default list layout. Standard shows title, date, description, and preview text. Compact shows title only. Override appearance per folder.',
                options: {
                    standard: 'Standard',
                    compact: 'Compact'
                }
            },
            showFileIcons: {
                name: 'Show file icons',
                desc: 'Display file icons with left-aligned spacing. Disabling removes both icons and indentation. Priority: custom > file name > file type > default.'
            },
            showFilenameMatchIcons: {
                name: 'Icons by file name',
                desc: 'Assign icons to files based on text in their names.'
            },
            fileNameIconMap: {
                name: 'File name icon map',
                desc: 'Files containing the text get the specified icon. One mapping per line: text=icon',
                placeholder: '# Text=icon\nmeeting=LiCalendar\ninvoice=PhReceipt',
                editTooltip: 'Edit mappings'
            },
            showCategoryIcons: {
                name: 'Icons by file type',
                desc: 'Assign icons to files based on their extension.'
            },
            fileTypeIconMap: {
                name: 'File type icon map',
                desc: 'Files with the extension get the specified icon. One mapping per line: extension=icon',
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: 'Edit mappings'
            },
            optimizeNoteHeight: {
                name: 'Variable note height',
                desc: 'Use compact height for pinned notes and notes without preview text.'
            },
            compactItemHeight: {
                name: 'Compact item height',
                desc: 'Set the height of compact list items on desktop and mobile.',
                resetTooltip: 'Restore to default (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Scale text with compact item height',
                desc: 'Scale compact list text when the item height is reduced.'
            },
            showParentFolder: {
                name: 'Show parent folder',
                desc: 'Display the parent folder name for notes in subfolders or tags.'
            },
            parentFolderClickRevealsFile: {
                name: 'Click parent folder to go to folder',
                desc: 'Clicking the parent folder label opens the folder in list pane.'
            },
            showParentFolderColor: {
                name: 'Show parent folder color',
                desc: 'Use folder colors on parent folder labels.'
            },
            showQuickActions: {
                name: 'Show quick actions (desktop only)',
                desc: 'Show action buttons when hovering over files. Button controls select which actions appear.'
            },
            dualPane: {
                name: 'Dual pane layout (not synced)',
                desc: 'Show navigation pane and list pane side by side on desktop.'
            },
            dualPaneOrientation: {
                name: 'Dual pane orientation (not synced)',
                desc: 'Choose horizontal or vertical layout when dual pane is active.',
                options: {
                    horizontal: 'Horizontal split',
                    vertical: 'Vertical split'
                }
            },
            appearanceBackground: {
                name: 'Background color',
                desc: 'Choose background colors for navigation and list panes.',
                options: {
                    separate: 'Separate backgrounds',
                    primary: 'Use list background',
                    secondary: 'Use navigation background'
                }
            },
            appearanceScale: {
                name: 'Zoom level (not synced)',
                desc: 'Controls the overall zoom level of Notebook Navigator.'
            },
            startView: {
                name: 'Default startup view',
                desc: 'Choose which pane to display when opening Notebook Navigator. Navigation pane shows shortcuts, recent notes, and folder tree. List pane shows note list immediately.',
                options: {
                    navigation: 'Navigation pane',
                    files: 'List pane'
                }
            },
            toolbarButtons: {
                name: 'Toolbar buttons',
                desc: 'Choose which buttons appear in the toolbar. Hidden buttons remain accessible via commands and menus.',
                navigationLabel: 'Navigation toolbar',
                listLabel: 'List toolbar'
            },
            autoRevealActiveNote: {
                name: 'Auto-reveal active note',
                desc: 'Automatically reveal notes when opened from Quick Switcher, links, or search.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Ignore events from right sidebar',
                desc: 'Do not change active note when clicking or changing notes in the right sidebar.'
            },
            paneTransitionDuration: {
                name: 'Single pane animation',
                desc: 'Transition duration when switching panes in single-pane mode (milliseconds).',
                resetTooltip: 'Reset to default'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Auto-select first note (desktop only)',
                desc: 'Automatically open the first note when switching folders or tags.'
            },
            skipAutoScroll: {
                name: 'Disable auto-scroll for shortcuts',
                desc: "Don't scroll the navigation pane when clicking items in shortcuts."
            },
            autoExpandFoldersTags: {
                name: 'Expand on selection',
                desc: 'Expand folders and tags when selected. In single pane mode, first selection expands, second selection shows files.'
            },
            springLoadedFolders: {
                name: 'Spring-loaded folders (desktop only)',
                desc: 'Expand folders and tags on hover during drag operations.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'First expand delay',
                desc: 'Delay before the first folder or tag expands during a drag operation (seconds).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Subsequent expand delay',
                desc: 'Delay before expanding additional folders or tags during the same drag operation (seconds).'
            },
            navigationBanner: {
                name: 'Navigation banner (vault profile)',
                desc: 'Display an image above the navigation pane. Changes with the selected vault profile.',
                current: 'Current banner: {path}',
                chooseButton: 'Choose image'
            },
            showShortcuts: {
                name: 'Show shortcuts',
                desc: 'Display the shortcuts section in the navigation pane.'
            },
            shortcutBadgeDisplay: {
                name: 'Shortcut badge',
                desc: "What to display next to shortcuts. Use 'Open shortcut 1-9' commands to open shortcuts directly.",
                options: {
                    index: 'Position (1-9)',
                    count: 'Item counts',
                    none: 'None'
                }
            },
            showRecentNotes: {
                name: 'Show recent notes',
                desc: 'Display the recent notes section in the navigation pane.'
            },
            recentNotesCount: {
                name: 'Recent notes count',
                desc: 'Number of recent notes to display.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Pin recent notes with shortcuts',
                desc: 'Include recent notes when shortcuts are pinned.'
            },
            showTooltips: {
                name: 'Show tooltips',
                desc: 'Display hover tooltips with additional information for notes and folders.'
            },
            showTooltipPath: {
                name: 'Show path',
                desc: 'Display the folder path below note names in tooltips.'
            },
            resetPaneSeparator: {
                name: 'Reset pane separator position',
                desc: 'Reset the draggable separator between navigation pane and list pane to default position.',
                buttonText: 'Reset separator',
                notice: 'Separator position reset. Restart Obsidian or reopen Notebook Navigator to apply.'
            },
            multiSelectModifier: {
                name: 'Multi-select modifier (desktop only)',
                desc: 'Choose which modifier key toggles multi-selection. When Option/Alt is selected, Cmd/Ctrl click opens notes in a new tab.',
                options: {
                    cmdCtrl: 'Cmd/Ctrl click',
                    optionAlt: 'Option/Alt click'
                }
            },
            fileVisibility: {
                name: 'Show file types (vault profile)',
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
                separateMobile: {
                    name: 'Separate mobile homepage',
                    desc: 'Use a different homepage for mobile devices.'
                }
            },
            excludedNotes: {
                name: 'Hide notes (vault profile)',
                desc: 'Comma-separated list of frontmatter properties. Notes containing any of these properties will be hidden (e.g., draft, private, archived).',
                placeholder: 'draft, private'
            },
            excludedFileNamePatterns: {
                name: 'Hide files (vault profile)',
                desc: 'Comma-separated list of filename patterns to hide. Supports * wildcards and / paths (e.g., temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Vault profile',
                desc: 'Profiles store file type visibility, hidden files, hidden folders, hidden tags, hidden notes, shortcuts, and navigation banner. Switch profiles from the navigation pane header.',
                defaultName: 'Default',
                addButton: 'Add profile',
                editProfilesButton: 'Edit profiles',
                addProfileOption: 'Add profile...',
                applyButton: 'Apply',
                editButton: 'Edit profile',
                deleteButton: 'Delete profile',
                addModalTitle: 'Add profile',
                editProfilesModalTitle: 'Edit profiles',
                editModalTitle: 'Edit profile',
                addModalPlaceholder: 'Profile name',
                deleteModalTitle: 'Delete {name}',
                deleteModalMessage: 'Remove {name}? Hidden file, folder, tag, and note filters saved in this profile will be deleted.',
                moveUp: 'Move up',
                moveDown: 'Move down',
                errors: {
                    emptyName: 'Enter a profile name',
                    duplicateName: 'Profile name already exists'
                }
            },
            vaultTitle: {
                name: 'Vault title placement (desktop only)',
                desc: 'Choose where the vault title is shown.',
                options: {
                    header: 'Show in header',
                    navigation: 'Show in navigation pane'
                }
            },
            excludedFolders: {
                name: 'Hide folders (vault profile)',
                desc: 'Comma-separated list of folders to hide. Name patterns: assets* (folders starting with assets), *_temp (ending with _temp). Path patterns: /archive (root archive only), /res* (root folders starting with res), /*/temp (temp folders one level deep), /projects/* (all folders inside projects).',
                placeholder: 'templates, assets*, /archive, /res*'
            },
            showFileDate: {
                name: 'Show date',
                desc: 'Display the date below note names.'
            },
            alphabeticalDateMode: {
                name: 'When sorting by name',
                desc: 'Date to show when notes are alphabetically sorted.',
                options: {
                    created: 'Created date',
                    modified: 'Modified date'
                }
            },
            showFileTags: {
                name: 'Show file tags',
                desc: 'Display clickable tags in file items.'
            },
            showFileTagAncestors: {
                name: 'Show full tag paths',
                desc: "Display complete tag hierarchy paths. When enabled: 'ai/openai', 'work/projects/2024'. When disabled: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Color file tags',
                desc: 'Apply tag colors to tag badges on file items.'
            },
            prioritizeColoredFileTags: {
                name: 'Show colored tags first',
                desc: 'Sort colored tags before other tags on file items.'
            },
            showFileTagsInCompactMode: {
                name: 'Show file tags in compact mode',
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
            stripHtmlInPreview: {
                name: 'Strip HTML in previews',
                desc: 'Remove HTML tags from preview text. May affect performance on large notes.'
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
                desc: 'Display a thumbnail of the first image found in the note.'
            },
            forceSquareFeatureImage: {
                name: 'Force square feature image',
                desc: 'Render feature images as square thumbnails.'
            },
            featureImageProperties: {
                name: 'Image properties',
                desc: 'Comma-separated list of frontmatter properties to check for thumbnail images.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            downloadExternalFeatureImages: {
                name: 'Download external images',
                desc: 'Download remote images and YouTube thumbnails for feature images.'
            },
            showRootFolder: {
                name: 'Show root folder',
                desc: 'Display the vault name as the root folder in the tree.'
            },
            showFolderIcons: {
                name: 'Show folder icons',
                desc: 'Display icons next to folders in the navigation pane.'
            },
            inheritFolderColors: {
                name: 'Inherit folder colors',
                desc: 'Child folders inherit color from parent folders.'
            },
            showNoteCount: {
                name: 'Show note count',
                desc: 'Display the number of notes next to each folder and tag.'
            },
            showSectionIcons: {
                name: 'Show icons for shortcuts and recent items',
                desc: 'Display icons for navigation sections like Shortcuts and Recent files.'
            },
            interfaceIcons: {
                name: 'Interface icons',
                desc: 'Edit toolbar, folder, tag, pinned, search, and sort icons.',
                buttonText: 'Edit icons'
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
            navRootSpacing: {
                name: 'Root item spacing',
                desc: 'Spacing between root-level folders and tags.'
            },
            showTags: {
                name: 'Show tags',
                desc: 'Display tags section in the navigator.'
            },
            showTagIcons: {
                name: 'Show tag icons',
                desc: 'Display icons next to tags in the navigation pane.'
            },
            inheritTagColors: {
                name: 'Inherit tag colors',
                desc: 'Child tags inherit color from parent tags.'
            },
            tagSortOrder: {
                name: 'Tag sort order',
                desc: 'Choose how tags are ordered in the navigation pane. (not synced)',
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
            keepEmptyTagsProperty: {
                name: 'Retain tags property after removing last tag',
                desc: 'Keep the tags frontmatter property when all tags are removed. When disabled, the tags property is deleted from frontmatter.'
            },
            hiddenTags: {
                name: 'Hide tags (vault profile)',
                desc: 'Comma-separated list of tag patterns. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'Enable folder notes',
                desc: 'When enabled, folders with associated notes are displayed as clickable links.'
            },
            folderNoteType: {
                name: 'Default folder note type',
                desc: 'Folder note type created from the context menu.',
                options: {
                    ask: 'Ask when creating',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'Folder note name',
                desc: 'Name of the folder note without extension. Leave empty to use the same name as the folder.',
                placeholder: 'index'
            },
            folderNoteProperties: {
                name: 'Folder note properties',
                desc: 'YAML frontmatter added to new folder notes. --- markers are added automatically.',
                placeholder: 'theme: dark\nfoldernote: true'
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
            interceptTagClicks: {
                name: 'Navigate to tags on click',
                desc: 'When clicking tags in notes, navigate to that tag in Notebook Navigator instead of triggering Obsidian search.'
            },
            metadataCleanup: {
                name: 'Clean up metadata',
                desc: 'Removes orphaned metadata left behind when files, folders, or tags are deleted, moved, or renamed outside of Obsidian. This only affects the Notebook Navigator settings file.',
                buttonText: 'Clean metadata',
                error: 'Settings cleanup failed',
                loading: 'Checking metadata...',
                statusClean: 'No metadata to clean',
                statusCounts: 'Orphaned items: {folders} folders, {tags} tags, {files} files, {pinned} pins, {separators} separators'
            },
            rebuildCache: {
                name: 'Rebuild cache',
                desc: 'Use this if you experience missing tags, incorrect previews or missing feature images. This can happen after sync conflicts or unexpected closures.',
                buttonText: 'Rebuild cache',
                success: 'Cache rebuilt',
                error: 'Failed to rebuild cache',
                indexingTitle: 'Indexing vault...',
                progress: 'Updating Notebook Navigator cache.'
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
                    'Downloaded icon packs sync installation state across devices. Icon packs stay in the local database on each device; sync only tracks whether to download or remove them. Icon packs download from the Notebook Navigator repository (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterDates: {
                name: 'Use frontmatter metadata',
                desc: 'Use frontmatter for note name, timestamps, icons, and colors'
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
                name: 'Name fields',
                desc: 'Comma-separated list of frontmatter fields. First non-empty value is used. Falls back to file name.',
                placeholder: 'title, name'
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
                help: "Common formats:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
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
                name: "What's new in Notebook Navigator {version}",
                desc: 'See recent updates and improvements',
                buttonText: 'View recent updates'
            },
            masteringVideo: {
                name: 'Mastering Notebook Navigator (video)',
                desc: 'This video covers everything you need to be productive in Notebook Navigator, including hot keys, search, tags and advanced customization.'
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
