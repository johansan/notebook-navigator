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
 * German language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_DE = {
    // Common UI elements
    common: {
        cancel: 'Abbrechen', // Button text for canceling dialogs and operations (English: Cancel)
        delete: 'Löschen', // Button text for delete operations in dialogs (English: Delete)
        clear: 'Zurücksetzen', // Button text for clearing values (English: Clear)
        remove: 'Entfernen', // Button text for remove operations in dialogs (English: Remove)
        submit: 'OK', // Button text for submitting forms and dialogs (English: Submit)
        noSelection: 'Keine Auswahl', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Ohne Tag', // Label for notes without any tags (English: Untagged)
        untitled: 'Ohne Titel', // Default name for notes without a title (English: Untitled)
        featureImageAlt: 'Vorschaubild', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Unbekannter Fehler', // Generic fallback when an error has no message (English: Unknown error)
        updateBannerTitle: 'Notebook Navigator-Update verfügbar',
        updateBannerInstruction: 'In Einstellungen -> Community-Plugins aktualisieren',
        updateIndicatorLabel: 'Neue Version verfügbar'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Wählen Sie einen Ordner oder Tag aus, um Notizen anzuzeigen', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Keine Notizen', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Angeheftet', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Notizen', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Dateien', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (ausgeblendet)' // Accessibility label applied to list items that are normally hidden
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Ohne Tag', // Label for the special item showing notes without tags (English: Untagged)
        hiddenTags: 'Versteckte Tags', // Label for the hidden tags virtual folder (English: Hidden tags)
        tags: 'Tags' // Label for the tags virtual folder (English: Tags)
    },

    navigationPane: {
        shortcutsHeader: 'Lesezeichen',
        recentNotesHeader: 'Neueste Notizen',
        recentFilesHeader: 'Neueste Dateien',
        reorderRootFoldersTitle: 'Navigation neu anordnen',
        reorderRootFoldersHint: 'Pfeile oder Ziehen zum Neuanordnen',
        vaultRootLabel: 'Tresor',
        resetRootToAlpha: 'Auf alphabetische Reihenfolge zurücksetzen',
        resetRootToFrequency: 'Auf Häufigkeitsreihenfolge zurücksetzen',
        pinShortcuts: 'Lesezeichen anheften',
        pinShortcutsAndRecentNotes: 'Lesezeichen und neueste Notizen anheften',
        pinShortcutsAndRecentFiles: 'Lesezeichen und neueste Dateien anheften',
        unpinShortcuts: 'Lesezeichen lösen',
        unpinShortcutsAndRecentNotes: 'Lesezeichen und neueste Notizen lösen',
        unpinShortcutsAndRecentFiles: 'Lesezeichen und neueste Dateien lösen',
        profileMenuLabel: 'Profil',
        profileMenuAria: 'Tresorprofil ändern'
    },

    shortcuts: {
        folderExists: 'Ordner bereits in Lesezeichen vorhanden',
        noteExists: 'Notiz bereits in Lesezeichen vorhanden',
        tagExists: 'Tag bereits in Lesezeichen vorhanden',
        searchExists: 'Such-Lesezeichen existiert bereits',
        emptySearchQuery: 'Geben Sie eine Suchanfrage ein, bevor Sie sie speichern',
        emptySearchName: 'Geben Sie einen Namen ein, bevor Sie die Suche speichern',
        add: 'Zu Lesezeichen hinzufügen',
        addNotesCount: '{count} Notizen zu Lesezeichen hinzufügen',
        addFilesCount: '{count} Dateien zu Lesezeichen hinzufügen',
        rename: 'Lesezeichen umbenennen',
        remove: 'Aus Lesezeichen entfernen',
        removeAll: 'Alle Lesezeichen entfernen',
        removeAllConfirm: 'Alle Lesezeichen entfernen?',
        folderNotesPinned: '{count} Ordnernotizen angeheftet'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Elemente einklappen', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'Alle Elemente ausklappen', // Tooltip for button that expands all items (English: Expand all items)
        scrollToTop: 'Nach oben scrollen',
        newFolder: 'Neuer Ordner', // Tooltip for create new folder button (English: New folder)
        newNote: 'Neue Notiz', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Zurück zur Navigation', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeSortOrder: 'Sortierreihenfolge ändern', // Tooltip for the sort order toggle button (English: Change sort order)
        defaultSort: 'Standard', // Label for default sorting mode (English: Default)
        customSort: 'Benutzerdefiniert', // Label for custom sorting mode (English: Custom)
        showFolders: 'Navigation anzeigen', // Tooltip for button to show the navigation pane (English: Show navigation)
        hideFolders: 'Navigation ausblenden', // Tooltip for button to hide the navigation pane (English: Hide navigation)
        reorderRootFolders: 'Navigation neu anordnen',
        finishRootFolderReorder: 'Neuordnung fertig',
        toggleDescendantNotes: 'Notizen aus Unterordnern / Nachkommen anzeigen', // Tooltip for button to toggle showing notes from descendants (English: Show notes from subfolders / descendants)
        autoExpandFoldersTags: 'Ordner und Tags automatisch erweitern', // Tooltip for button to toggle auto-expanding folders and tags when selected (English: Auto-expand folders and tags)
        showExcludedItems: 'Versteckte Ordner, Tags und Notizen anzeigen', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Versteckte Ordner, Tags und Notizen ausblenden', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Zweispaltige Ansicht anzeigen', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Einspaltige Ansicht anzeigen', // Tooltip for button to show single-pane layout (English: Show single pane)
        changeAppearance: 'Erscheinungsbild ändern', // Tooltip for button to change folder appearance settings (English: Change appearance)
        search: 'Suchen' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Suchen...', // Placeholder text for search input (English: Search...)
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Suche löschen', // Tooltip for clear search button (English: Clear search)
        saveSearchShortcut: 'Such-Lesezeichen speichern',
        removeSearchShortcut: 'Such-Lesezeichen entfernen',
        shortcutModalTitle: 'Such-Lesezeichen speichern',
        shortcutNamePlaceholder: 'Lesezeichen-Namen eingeben'
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'In neuem Tab öffnen',
            openToRight: 'Rechts öffnen',
            openInNewWindow: 'In neuem Fenster öffnen',
            openMultipleInNewTabs: '{count} Notizen in neuen Tabs öffnen',
            openMultipleToRight: '{count} Notizen rechts öffnen',
            openMultipleInNewWindows: '{count} Notizen in neuen Fenstern öffnen',
            pinNote: 'Notiz anheften',
            unpinNote: 'Notiz lösen',
            pinMultipleNotes: '{count} Notizen anheften',
            unpinMultipleNotes: '{count} Notizen lösen',
            duplicateNote: 'Notiz duplizieren',
            duplicateMultipleNotes: '{count} Notizen duplizieren',
            openVersionHistory: 'Versionsverlauf öffnen',
            revealInFolder: 'Im Ordner anzeigen',
            revealInFinder: 'Im Finder anzeigen',
            showInExplorer: 'Im Explorer anzeigen',
            copyDeepLink: 'Obsidian-URL kopieren',
            copyPath: 'Dateisystempfad kopieren',
            copyRelativePath: 'Vault-Pfad kopieren',
            renameNote: 'Notiz umbenennen',
            deleteNote: 'Notiz löschen',
            deleteMultipleNotes: '{count} Notizen löschen',
            moveNoteToFolder: 'Notiz verschieben nach...',
            moveFileToFolder: 'Datei verschieben nach...',
            moveMultipleNotesToFolder: '{count} Notizen verschieben nach...',
            moveMultipleFilesToFolder: '{count} Dateien verschieben nach...',
            addTag: 'Tag hinzufügen',
            removeTag: 'Tag entfernen',
            removeAllTags: 'Alle Tags entfernen',
            changeIcon: 'Icon ändern',
            removeIcon: 'Icon entfernen',
            changeColor: 'Farbe ändern',
            removeColor: 'Farbe entfernen',
            // File-specific context menu items (non-markdown files)
            openMultipleFilesInNewTabs: '{count} Dateien in neuen Tabs öffnen',
            openMultipleFilesToRight: '{count} Dateien rechts öffnen',
            openMultipleFilesInNewWindows: '{count} Dateien in neuen Fenstern öffnen',
            pinFile: 'Datei anheften',
            unpinFile: 'Datei lösen',
            pinMultipleFiles: '{count} Dateien anheften',
            unpinMultipleFiles: '{count} Dateien lösen',
            duplicateFile: 'Datei duplizieren',
            duplicateMultipleFiles: '{count} Dateien duplizieren',
            renameFile: 'Datei umbenennen',
            deleteFile: 'Datei löschen',
            deleteMultipleFiles: '{count} Dateien löschen'
        },
        folder: {
            newNote: 'Neue Notiz',
            newNoteFromTemplate: 'Neue Notiz aus Vorlage',
            newFolder: 'Neuer Ordner',
            newCanvas: 'Neue Canvas',
            newBase: 'Neue Datenbank',
            newDrawing: 'Neue Zeichnung',
            newExcalidrawDrawing: 'Neue Excalidraw-Zeichnung',
            newTldrawDrawing: 'Neue Tldraw-Zeichnung',
            duplicateFolder: 'Ordner duplizieren',
            searchInFolder: 'In Ordner suchen',
            copyPath: 'Dateisystempfad kopieren',
            copyRelativePath: 'Vault-Pfad kopieren',
            createFolderNote: 'Ordnernotiz erstellen',
            detachFolderNote: 'Ordnernotiz lösen',
            deleteFolderNote: 'Ordnernotiz löschen',
            changeIcon: 'Symbol ändern',
            changeColor: 'Farbe ändern',
            changeBackground: 'Hintergrund ändern',
            excludeFolder: 'Ordner verstecken',
            unhideFolder: 'Ordner einblenden',
            moveFolder: 'Ordner verschieben nach...',
            renameFolder: 'Ordner umbenennen',
            deleteFolder: 'Ordner löschen'
        },
        tag: {
            changeIcon: 'Symbol ändern',
            changeColor: 'Farbe ändern',
            changeBackground: 'Hintergrund ändern',
            showTag: 'Tag anzeigen',
            hideTag: 'Tag ausblenden'
        },
        navigation: {
            addSeparator: 'Trennlinie hinzufügen',
            removeSeparator: 'Trennlinie entfernen'
        },
        style: {
            title: 'Stil',
            copy: 'Stil kopieren',
            paste: 'Stil einfügen',
            removeIcon: 'Symbol entfernen',
            removeColor: 'Farbe entfernen',
            removeBackground: 'Hintergrund entfernen',
            clear: 'Stil löschen'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        standardPreset: 'Standard',
        compactPreset: 'Kompakt',
        defaultSuffix: '(Standard)',
        titleRows: 'Titelzeilen',
        previewRows: 'Vorschauzeilen',
        groupBy: 'Gruppieren nach',
        defaultOption: (rows: number) => `Standard (${rows})`,
        defaultTitleOption: (rows: number) => `Standard-Titelzeilen (${rows})`,
        defaultPreviewOption: (rows: number) => `Standard-Vorschauzeilen (${rows})`,
        defaultGroupOption: (groupLabel: string) => `Standardgruppierung (${groupLabel})`,
        titleRowOption: (rows: number) => `${rows} Titelzeile${rows === 1 ? '' : 'n'}`,
        previewRowOption: (rows: number) => `${rows} Vorschauzeile${rows === 1 ? '' : 'n'}`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'Symbole suchen...',
            recentlyUsedHeader: 'Kürzlich verwendet',
            emptyStateSearch: 'Beginnen Sie zu tippen, um Symbole zu suchen',
            emptyStateNoResults: 'Keine Symbole gefunden',
            showingResultsInfo: 'Zeige 50 von {count} Ergebnissen. Geben Sie mehr ein, um die Suche einzugrenzen.',
            emojiInstructions: 'Geben Sie ein Emoji ein oder fügen Sie es ein, um es als Symbol zu verwenden',
            removeIcon: 'Icon entfernen',
            allTabLabel: 'Alle'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Regel hinzufügen'
        },
        interfaceIcons: {
            title: 'Oberflächensymbole',
            items: {
                'nav-shortcuts': 'Verknüpfungen',
                'nav-recent-files': 'Zuletzt verwendete Dateien',
                'nav-expand-all': 'Alle erweitern',
                'nav-collapse-all': 'Alle einklappen',
                'nav-tree-expand': 'Baumpfeil: erweitern',
                'nav-tree-collapse': 'Baumpfeil: einklappen',
                'nav-hidden-items': 'Ausgeblendete Elemente',
                'nav-root-reorder': 'Stammordner neu anordnen',
                'nav-new-folder': 'Neuer Ordner',
                'nav-show-single-pane': 'Einspaltige Ansicht anzeigen',
                'nav-show-dual-pane': 'Zweispaltige Ansicht anzeigen',
                'nav-profile-chevron': 'Profilmenü-Pfeil',
                'list-search': 'Suche',
                'list-descendants': 'Notizen aus Unterordnern',
                'list-sort-ascending': 'Sortierung: aufsteigend',
                'list-sort-descending': 'Sortierung: absteigend',
                'list-appearance': 'Darstellung ändern',
                'list-new-note': 'Neue Notiz',
                'nav-folder-open': 'Ordner geöffnet',
                'nav-folder-closed': 'Ordner geschlossen',
                'nav-tag': 'Tag',
                'list-pinned': 'Angeheftete Elemente'
            }
        },
        colorPicker: {
            currentColor: 'Aktuell',
            newColor: 'Neu',
            presetColors: 'Vordefinierte Farben',
            userColors: 'Benutzerfarben',
            paletteDefault: 'Standard',
            paletteCustom: 'Benutzerdefiniert',
            copyColors: 'Farbe kopieren',
            colorsCopied: 'Farbe in Zwischenablage kopiert',
            copyClipboardError: 'Konnte nicht in Zwischenablage schreiben',
            pasteColors: 'Farbe einfügen',
            pasteClipboardError: 'Zwischenablage konnte nicht gelesen werden',
            pasteInvalidJson: 'Zwischenablage enthält keinen gültigen Text',
            pasteInvalidFormat: 'Ein Hex-Farbwert erwartet',
            colorsPasted: 'Farbe erfolgreich eingefügt',
            resetUserColors: 'Benutzerdefinierte Farben löschen',
            clearCustomColorsConfirm: 'Alle benutzerdefinierten Farben entfernen?',
            userColorSlot: 'Farbe {slot}',
            recentColors: 'Zuletzt verwendete Farben',
            clearRecentColors: 'Zuletzt verwendete Farben löschen',
            removeRecentColor: 'Farbe entfernen',
            removeColor: 'Farbe entfernen',
            apply: 'Anwenden',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'Rot',
                orange: 'Orange',
                amber: 'Bernstein',
                yellow: 'Gelb',
                lime: 'Limette',
                green: 'Grün',
                emerald: 'Smaragd',
                teal: 'Blaugrün',
                cyan: 'Cyan',
                sky: 'Himmelblau',
                blue: 'Blau',
                indigo: 'Indigo',
                violet: 'Violett',
                purple: 'Lila',
                fuchsia: 'Fuchsia',
                pink: 'Pink',
                rose: 'Rosé',
                gray: 'Grau',
                slate: 'Schiefer',
                stone: 'Stein'
            }
        },
        selectVaultProfile: {
            title: 'Tresorprofil wechseln',
            currentBadge: 'Aktiv',
            emptyState: 'Keine Tresorprofile verfügbar.'
        },
        tagOperation: {
            renameTitle: 'Tag {tag} umbenennen',
            deleteTitle: 'Tag {tag} löschen',
            newTagPrompt: 'Neuer Tag-Name',
            newTagPlaceholder: 'Neuen Tag-Namen eingeben',
            renameWarning: 'Das Umbenennen des Tags {oldTag} wird {count} {files} ändern.',
            deleteWarning: 'Das Löschen des Tags {tag} wird {count} {files} ändern.',
            modificationWarning: 'Dies wird die Änderungsdaten der Dateien aktualisieren.',
            affectedFiles: 'Betroffene Dateien:',
            andMore: '...und {count} weitere',
            confirmRename: 'Tag umbenennen',
            renameUnchanged: '{tag} unverändert',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            invalidTagName: 'Geben Sie einen gültigen Tag-Namen ein.',
            descendantRenameError: 'Ein Tag kann nicht in sich selbst oder einen Nachkommen verschoben werden.',
            confirmDelete: 'Tag löschen',
            file: 'Datei',
            files: 'Dateien'
        },
        fileSystem: {
            newFolderTitle: 'Neuer Ordner',
            renameFolderTitle: 'Ordner umbenennen',
            renameFileTitle: 'Datei umbenennen',
            deleteFolderTitle: "'{name}' löschen?",
            deleteFileTitle: "'{name}' löschen?",
            folderNamePrompt: 'Ordnernamen eingeben:',
            hideInOtherVaultProfiles: 'In anderen Tresorprofilen ausblenden',
            renamePrompt: 'Neuen Namen eingeben:',
            renameVaultTitle: 'Anzeigenamen des Tresors ändern',
            renameVaultPrompt: 'Benutzerdefinierten Anzeigenamen eingeben (leer lassen für Standard):',
            deleteFolderConfirm: 'Sind Sie sicher, dass Sie diesen Ordner und seinen gesamten Inhalt löschen möchten?',
            deleteFileConfirm: 'Sind Sie sicher, dass Sie diese Datei löschen möchten?',
            removeAllTagsTitle: 'Alle Tags entfernen',
            removeAllTagsFromNote: 'Sind Sie sicher, dass Sie alle Tags von dieser Notiz entfernen möchten?',
            removeAllTagsFromNotes: 'Sind Sie sicher, dass Sie alle Tags von {count} Notizen entfernen möchten?'
        },
        folderNoteType: {
            title: 'Ordnernotiztyp auswählen',
            folderLabel: 'Ordner: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `In Ordner verschieben: ${name}...`,
            multipleFilesLabel: (count: number) => `${count} Dateien`,
            navigatePlaceholder: 'Zu Ordner navigieren...',
            instructions: {
                navigate: 'zum Navigieren',
                move: 'zum Verschieben',
                select: 'zum Auswählen',
                dismiss: 'zum Abbrechen'
            }
        },
        homepage: {
            placeholder: 'Dateien durchsuchen...',
            instructions: {
                navigate: 'zum Navigieren',
                select: 'als Startseite setzen',
                dismiss: 'zum Abbrechen'
            }
        },
        navigationBanner: {
            placeholder: 'Bilder durchsuchen...',
            instructions: {
                navigate: 'zum Navigieren',
                select: 'um Banner zu setzen',
                dismiss: 'zum Abbrechen'
            }
        },
        tagSuggest: {
            placeholder: 'Tags suchen...',
            navigatePlaceholder: 'Zu Tag navigieren...',
            addPlaceholder: 'Nach hinzuzufügendem Tag suchen...',
            removePlaceholder: 'Tag zum Entfernen auswählen...',
            createNewTag: 'Neuen Tag erstellen: #{tag}',
            instructions: {
                navigate: 'zum Navigieren',
                select: 'zum Auswählen',
                dismiss: 'zum Abbrechen',
                add: 'zum Hinzufügen des Tags',
                remove: 'zum Entfernen des Tags'
            }
        },
        welcome: {
            title: 'Willkommen bei {pluginName}',
            introText:
                'Hallo! Bevor Sie beginnen, empfehle ich Ihnen, die ersten fünf Minuten des Videos unten anzusehen, um zu verstehen, wie die Bereiche und der Schalter „Notizen aus Unterordnern anzeigen" funktionieren.',
            continueText:
                'Wenn Sie weitere fünf Minuten haben, schauen Sie das Video weiter an, um die kompakten Anzeigemodi und die richtige Einrichtung von Lesezeichen und wichtigen Tastenkombinationen zu verstehen.',
            thanksText: 'Vielen Dank fürs Herunterladen und viel Spaß!',
            videoAlt: 'Notebook Navigator installieren und beherrschen',
            openVideoButton: 'Video abspielen',
            closeButton: 'Ich schaue es später'
        }
    },

    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Ordner konnte nicht erstellt werden: {error}',
            createFile: 'Datei konnte nicht erstellt werden: {error}',
            renameFolder: 'Ordner konnte nicht umbenannt werden: {error}',
            renameFolderNoteConflict: 'Umbenennung nicht möglich: "{name}" existiert bereits in diesem Ordner',
            renameFile: 'Datei konnte nicht umbenannt werden: {error}',
            deleteFolder: 'Ordner konnte nicht gelöscht werden: {error}',
            deleteFile: 'Datei konnte nicht gelöscht werden: {error}',
            duplicateNote: 'Notiz konnte nicht dupliziert werden: {error}',
            createCanvas: 'Canvas konnte nicht erstellt werden: {error}',
            createDatabase: 'Datenbank konnte nicht erstellt werden: {error}',
            duplicateFolder: 'Ordner konnte nicht dupliziert werden: {error}',
            openVersionHistory: 'Versionsverlauf konnte nicht geöffnet werden: {error}',
            versionHistoryNotFound: 'Versionsverlauf-Befehl nicht gefunden. Stellen Sie sicher, dass Obsidian Sync aktiviert ist.',
            revealInExplorer: 'Datei konnte nicht im Explorer angezeigt werden: {error}',
            folderNoteAlreadyExists: 'Ordnernotiz existiert bereits',
            folderAlreadyExists: 'Ordner "{name}" existiert bereits',
            folderNotesDisabled: 'Aktivieren Sie Ordnernotizen in den Einstellungen, um Dateien zu konvertieren',
            folderNoteAlreadyLinked: 'Diese Datei fungiert bereits als Ordnernotiz',
            folderNoteNotFound: 'Keine Ordnernotiz im ausgewählten Ordner',
            folderNoteUnsupportedExtension: 'Nicht unterstützte Dateierweiterung: {extension}',
            folderNoteMoveFailed: 'Datei konnte während der Konvertierung nicht verschoben werden: {error}',
            folderNoteRenameConflict: 'Eine Datei namens "{name}" existiert bereits im Ordner',
            folderNoteConversionFailed: 'Konvertierung in Ordnernotiz fehlgeschlagen',
            folderNoteConversionFailedWithReason: 'Konvertierung in Ordnernotiz fehlgeschlagen: {error}',
            folderNoteOpenFailed: 'Datei konvertiert, aber Ordnernotiz konnte nicht geöffnet werden: {error}',
            failedToDeleteFile: 'Löschen von {name} fehlgeschlagen: {error}',
            failedToDeleteMultipleFiles: 'Löschen von {count} Dateien fehlgeschlagen',
            versionHistoryNotAvailable: 'Versionsverlauf-Dienst nicht verfügbar',
            drawingAlreadyExists: 'Eine Zeichnung mit diesem Namen existiert bereits',
            failedToCreateDrawing: 'Zeichnung konnte nicht erstellt werden',
            noFolderSelected: 'Kein Ordner im Notebook Navigator ausgewählt',
            noFileSelected: 'Keine Datei ausgewählt'
        },
        warnings: {
            linkBreakingNameCharacters: 'Dieser Name enthält Zeichen, die Obsidian-Links zerstören: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'Namen dürfen nicht mit einem Punkt beginnen oder : oder / enthalten.',
            forbiddenNameCharactersWindows: 'Windows-reservierte Zeichen sind nicht erlaubt: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'Ordner ausgeblendet: {name}',
            showFolder: 'Ordner eingeblendet: {name}'
        },
        notifications: {
            deletedMultipleFiles: '{count} Dateien gelöscht',
            movedMultipleFiles: '{count} Dateien nach {folder} verschoben',
            folderNoteConversionSuccess: 'Datei in Ordnernotiz in "{name}" konvertiert',
            folderMoved: 'Ordner "{name}" verschoben',
            deepLinkCopied: 'Obsidian-URL in die Zwischenablage kopiert',
            pathCopied: 'Pfad in die Zwischenablage kopiert',
            relativePathCopied: 'Relativen Pfad in die Zwischenablage kopiert',
            tagAddedToNote: 'Tag zu 1 Notiz hinzugefügt',
            tagAddedToNotes: 'Tag zu {count} Notizen hinzugefügt',
            tagRemovedFromNote: 'Tag von 1 Notiz entfernt',
            tagRemovedFromNotes: 'Tag von {count} Notizen entfernt',
            tagsClearedFromNote: 'Alle Tags von 1 Notiz entfernt',
            tagsClearedFromNotes: 'Alle Tags von {count} Notizen entfernt',
            noTagsToRemove: 'Keine Tags zum Entfernen',
            noFilesSelected: 'Keine Dateien ausgewählt',
            tagOperationsNotAvailable: 'Tag-Operationen nicht verfügbar',
            tagsRequireMarkdown: 'Tags werden nur in Markdown-Notizen unterstützt',
            iconPackDownloaded: '{provider} heruntergeladen',
            iconPackUpdated: '{provider} aktualisiert ({version})',
            iconPackRemoved: '{provider} entfernt',
            iconPackLoadFailed: '{provider} konnte nicht geladen werden',
            hiddenFileReveal: 'Datei ist ausgeblendet. Aktiviere „Ausgeblendete Elemente anzeigen", um sie anzuzeigen'
        },
        confirmations: {
            deleteMultipleFiles: 'Möchten Sie wirklich {count} Dateien löschen?',
            deleteConfirmation: 'Diese Aktion kann nicht rückgängig gemacht werden.'
        },
        defaultNames: {
            untitled: 'Ohne Titel',
            untitledNumber: 'Ohne Titel {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Ein Ordner kann nicht in sich selbst oder einen Unterordner verschoben werden.',
            itemAlreadyExists: 'Ein Element mit dem Namen "{name}" existiert bereits an diesem Ort.',
            failedToMove: 'Verschieben fehlgeschlagen: {error}',
            failedToAddTag: 'Hinzufügen des Tags "{tag}" fehlgeschlagen',
            failedToClearTags: 'Entfernen der Tags fehlgeschlagen',
            failedToMoveFolder: 'Ordner "{name}" konnte nicht verschoben werden',
            failedToImportFiles: 'Import fehlgeschlagen: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} Dateien existieren bereits am Zielort',
            addedTag: 'Tag "{tag}" zu {count} Dateien hinzugefügt',
            filesAlreadyHaveTag: '{count} Dateien haben dieses Tag oder ein spezifischeres bereits',
            clearedTags: 'Alle Tags von {count} Dateien entfernt',
            noTagsToClear: 'Keine Tags zum Entfernen',
            fileImported: '1 Datei importiert',
            filesImported: '{count} Dateien importiert'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'Heute',
        yesterday: 'Gestern',
        previous7Days: 'Letzte 7 Tage',
        previous30Days: 'Letzte 30 Tage'
    },

    // Weekdays
    weekdays: {
        sunday: 'Sonntag',
        monday: 'Montag',
        tuesday: 'Dienstag',
        wednesday: 'Mittwoch',
        thursday: 'Donnerstag',
        friday: 'Freitag',
        saturday: 'Samstag'
    },

    // Plugin commands
    commands: {
        open: 'Öffnen', // Command palette: Opens the Notebook Navigator view (English: Open)
        openHomepage: 'Startseite öffnen', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        revealFile: 'Datei anzeigen', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Suchen', // Command palette: Toggle search in the file list (English: Search)
        toggleDualPane: 'Doppelbereichslayout umschalten', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        selectVaultProfile: 'Tresorprofil wechseln', // Command palette: Opens a modal to choose a different vault profile (English: Switch vault profile)
        selectVaultProfile1: 'Tresorprofil 1 auswählen', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Tresorprofil 2 auswählen', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Tresorprofil 3 auswählen', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Dateien löschen', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Neue Notiz erstellen', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Neue Notiz aus Vorlage', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Dateien verschieben', // Command palette: Move selected files to another folder (English: Move files)
        selectNextFile: 'Nächste Datei auswählen', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Vorherige Datei auswählen', // Command palette: Selects the previous file in the current view (English: Select previous file)
        convertToFolderNote: 'In Ordnernotiz konvertieren', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Als Ordnernotiz festlegen', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Ordnernotiz lösen', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Alle Ordnernotizen anheften', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Zu Ordner navigieren', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Zu Tag navigieren', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        addShortcut: 'Zu Shortcuts hinzufügen', // Command palette: Adds the current file, folder, or tag to shortcuts (English: Add to shortcuts)
        openShortcut: 'Shortcut {number} öffnen',
        toggleDescendants: 'Nachkommen umschalten', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Versteckte Ordner, Tags und Notizen umschalten', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Tag-Sortierung umschalten', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        collapseExpand: 'Alle Elemente ein-/ausklappen', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        addTag: 'Tag zu ausgewählten Dateien hinzufügen', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        removeTag: 'Tag von ausgewählten Dateien entfernen', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Alle Tags von ausgewählten Dateien entfernen', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        rebuildCache: 'Cache neu aufbauen' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'In Notebook Navigator anzeigen' // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Zuletzt geändert am',
        createdAt: 'Erstellt am',
        file: 'Datei',
        files: 'Dateien',
        folder: 'Ordner',
        folders: 'Ordner'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'Fehlgeschlagene Metadaten-Bericht exportiert nach: {filename}',
            exportFailed: 'Export des Metadaten-Berichts fehlgeschlagen'
        },
        sections: {
            general: 'Allgemein',
            notes: 'Notizenanzeige',
            navigationPane: 'Ordneranzeige',
            icons: 'Icon-Pakete',
            tags: 'Tag-Anzeige',
            folders: 'Ordnernotizen',
            foldersAndTags: 'Ordner & Tags',
            search: 'Suchen',
            searchAndHotkeys: 'Suche & Tastenkürzel',
            listPane: 'Listenbereich',
            hotkeys: 'Tastenkürzel',
            advanced: 'Erweitert'
        },
        groups: {
            general: {
                filtering: 'Filterung',
                behavior: 'Verhalten',
                view: 'Darstellung',
                icons: 'Symbole',
                desktopAppearance: 'Desktop-Darstellung',
                formatting: 'Formatierung'
            },
            navigation: {
                appearance: 'Darstellung',
                shortcutsAndRecent: 'Verknüpfungen & Letzte Einträge'
            },
            list: {
                display: 'Darstellung',
                pinnedNotes: 'Angeheftete Notizen',
                quickActions: 'Schnellaktionen'
            },
            notes: {
                frontmatter: 'Frontmatter',
                icon: 'Symbol',
                title: 'Titel',
                previewText: 'Vorschautext',
                featureImage: 'Hauptbild',
                tags: 'Tags',
                date: 'Datum',
                parentFolder: 'Übergeordneter Ordner'
            }
        },
        items: {
            searchProvider: {
                name: 'Suchanbieter',
                desc: 'Wählen Sie zwischen schneller Dateinamensuche oder Volltextsuche mit dem Omnisearch-Plugin. (nicht synchronisiert)',
                options: {
                    internal: 'Filtersuche',
                    omnisearch: 'Omnisearch (Volltext)'
                },
                info: {
                    filterSearch: {
                        title: 'Filtersuche (Standard):',
                        description:
                            'Filtert Dateien nach Namen und Tags im aktuellen Ordner und Unterordnern. Filtermodus: Gemischter Text und Tags entsprechen allen Begriffen (z.B. "projekt #arbeit"). Tag-Modus: Suche nur mit Tags unterstützt AND/OR-Operatoren (z.B. "#arbeit AND #dringend", "#projekt OR #persönlich"). Cmd/Strg+Klick auf Tags zum Hinzufügen mit AND, Cmd/Strg+Umschalt+Klick zum Hinzufügen mit OR. Unterstützt Ausschluss mit ! Präfix (z.B. !entwurf, !#archiviert) und das Finden von Notizen ohne Tags mit !#.'
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            'Volltextsuche, die Ihren gesamten Tresor durchsucht und dann die Ergebnisse filtert, um nur Dateien aus dem aktuellen Ordner, Unterordnern oder ausgewählten Tags anzuzeigen. Erfordert die Installation des Omnisearch-Plugins - falls nicht verfügbar, fällt die Suche automatisch auf die Filtersuche zurück.',
                        warningNotInstalled: 'Omnisearch-Plugin nicht installiert. Filtersuche wird verwendet.',
                        limitations: {
                            title: 'Bekannte Einschränkungen:',
                            performance:
                                'Leistung: Kann langsam sein, besonders bei der Suche nach weniger als 3 Zeichen in großen Tresoren',
                            pathBug:
                                'Pfadfehler: Kann nicht in Pfaden mit Nicht-ASCII-Zeichen suchen und durchsucht Unterpfade nicht korrekt, was die angezeigten Suchergebnisse beeinflusst',
                            limitedResults:
                                'Begrenzte Ergebnisse: Da Omnisearch den gesamten Tresor durchsucht und eine begrenzte Anzahl von Ergebnissen vor der Filterung zurückgibt, erscheinen relevante Dateien aus Ihrem aktuellen Ordner möglicherweise nicht, wenn zu viele Treffer an anderer Stelle im Tresor vorhanden sind',
                            previewText:
                                'Vorschautext: Notizvorschauen werden durch Omnisearch-Ergebnisauszüge ersetzt, die möglicherweise nicht die tatsächliche Suchtreffhervorhebung anzeigen, wenn sie an anderer Stelle in der Datei erscheint'
                        }
                    }
                }
            },
            listPaneTitle: {
                name: 'Titel des Listenbereichs (nur Desktop)',
                desc: 'Wählen Sie, wo der Titel des Listenbereichs angezeigt wird.',
                options: {
                    header: 'Im Kopfbereich anzeigen',
                    list: 'Im Listenbereich anzeigen',
                    hidden: 'Nicht anzeigen'
                }
            },
            sortNotesBy: {
                name: 'Notizen sortieren nach',
                desc: 'Wählen Sie, wie Notizen in der Notizenliste sortiert werden.',
                options: {
                    'modified-desc': 'Bearbeitungsdatum (neueste oben)',
                    'modified-asc': 'Bearbeitungsdatum (älteste oben)',
                    'created-desc': 'Erstellungsdatum (neueste oben)',
                    'created-asc': 'Erstellungsdatum (älteste oben)',
                    'title-asc': 'Titel (A oben)',
                    'title-desc': 'Titel (Z oben)'
                }
            },
            revealFileOnListChanges: {
                name: 'Zu ausgewählter Datei bei Listenänderungen scrollen',
                desc: 'Zur ausgewählten Datei scrollen beim Anheften von Notizen, Anzeigen von Unternotizen, Ändern der Ordnerdarstellung oder bei Dateioperationen.'
            },
            includeDescendantNotes: {
                name: 'Notizen aus Unterordnern / Nachkommen anzeigen (nicht synchronisiert)',
                desc: 'Beim Anzeigen eines Ordners oder Tags Notizen aus Unterordnern und Tag-Nachkommen einbeziehen.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Angeheftete Notizen auf ihren Ordner beschränken',
                desc: 'Angeheftete Notizen erscheinen nur beim Anzeigen des Ordners oder Tags, in dem sie angeheftet wurden.'
            },
            separateNoteCounts: {
                name: 'Aktuelle und Nachkommen-Anzahl getrennt anzeigen',
                desc: 'Zeigt Notizanzahl als "aktuell ▾ Nachkommen" Format in Ordnern und Tags.'
            },
            groupNotes: {
                name: 'Notizen gruppieren',
                desc: 'Zeigt Überschriften zwischen Notizen gruppiert nach Datum oder Ordner an. Tag-Ansichten verwenden Datumsgruppen, wenn Ordnergruppierung aktiviert ist.',
                options: {
                    none: 'Nicht gruppieren',
                    date: 'Nach Datum gruppieren',
                    folder: 'Nach Ordner gruppieren'
                }
            },
            showPinnedGroupHeader: {
                name: 'Überschrift für angeheftete Notizen anzeigen',
                desc: 'Zeigt die Überschrift des Abschnitts für angeheftete Notizen an.'
            },
            showPinnedIcon: {
                name: 'Icon für angeheftete Notizen anzeigen',
                desc: 'Icon neben der Überschrift für angeheftete Notizen anzeigen.'
            },
            defaultListMode: {
                name: 'Standardmodus für Listen',
                desc: 'Standardlistenlayout auswählen. Standard zeigt Titel, Datum, Beschreibung und Vorschautext. Kompakt zeigt nur den Titel. Ansicht kann pro Ordner überschrieben werden.',
                options: {
                    standard: 'Standard',
                    compact: 'Kompakt'
                }
            },
            showFileIcons: {
                name: 'Dateisymbole anzeigen',
                desc: 'Dateisymbole mit linksbündigem Abstand anzeigen. Deaktivierung entfernt sowohl Symbole als auch Einrückung. Priorität: Benutzerdefiniert > Dateiname > Dateityp > Standard.'
            },
            showFilenameMatchIcons: {
                name: 'Symbole nach Dateiname',
                desc: 'Symbole basierend auf Text im Dateinamen zuweisen.'
            },
            fileNameIconMap: {
                name: 'Dateiname-Symbol-Zuordnung',
                desc: 'Dateien mit dem Text erhalten das angegebene Symbol. Eine Zuordnung pro Zeile: Text=Symbol',
                placeholder: '# Text=icon\nbesprechung=LiCalendar\nrechnung=PhReceipt',
                editTooltip: 'Zuordnungen bearbeiten'
            },
            showCategoryIcons: {
                name: 'Symbole nach Dateityp',
                desc: 'Symbole basierend auf der Dateierweiterung zuweisen.'
            },
            fileTypeIconMap: {
                name: 'Dateityp-Symbol-Zuordnung',
                desc: 'Dateien mit der Erweiterung erhalten das angegebene Symbol. Eine Zuordnung pro Zeile: Erweiterung=Symbol',
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: 'Zuordnungen bearbeiten'
            },
            optimizeNoteHeight: {
                name: 'Variable Notizenhöhe',
                desc: 'Kompakte Höhe für angeheftete Notizen und Notizen ohne Vorschautext verwenden.'
            },
            compactItemHeight: {
                name: 'Höhe schlanker Elemente',
                desc: 'Legt die Höhe schlanker Listenelemente auf Desktop und Mobilgeräten fest.',
                resetTooltip: 'Auf Standard zurücksetzen (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Text an schlanke Elementhöhe anpassen',
                desc: 'Skaliert den Text schlanker Listenelemente bei reduzierter Höhe.'
            },
            showParentFolder: {
                name: 'Übergeordneten Ordner anzeigen',
                desc: 'Den übergeordneten Ordnernamen für Notizen in Unterordnern oder Tags anzeigen.'
            },
            parentFolderClickRevealsFile: {
                name: 'Klick auf übergeordneten Ordner öffnet Ordner',
                desc: 'Klicken auf den übergeordneten Ordner öffnet den Ordner im Listenbereich.'
            },
            showParentFolderColor: {
                name: 'Übergeordnete Ordnerfarbe anzeigen',
                desc: 'Ordnerfarben auf übergeordnete Ordnerlabels anwenden.'
            },
            showQuickActions: {
                name: 'Schnellaktionen anzeigen (nur Desktop)',
                desc: 'Aktionsschaltflächen beim Überfahren von Dateien anzeigen. Schaltflächensteuerung wählt aus, welche Aktionen erscheinen.'
            },
            dualPane: {
                name: 'Doppelbereichslayout (nicht synchronisiert)',
                desc: 'Navigationsbereich und Listenbereich nebeneinander auf dem Desktop anzeigen.'
            },
            dualPaneOrientation: {
                name: 'Ausrichtung des Doppelbereichs (nicht synchronisiert)',
                desc: 'Horizontalen oder vertikalen Aufbau wählen, wenn der Doppelbereich aktiv ist.',
                options: {
                    horizontal: 'Horizontale Aufteilung',
                    vertical: 'Vertikale Aufteilung'
                }
            },
            appearanceBackground: {
                name: 'Hintergrundfarbe',
                desc: 'Wählen Sie Hintergrundfarben für Navigations- und Listenbereich.',
                options: {
                    separate: 'Separate Hintergründe',
                    primary: 'Listenhintergrund verwenden',
                    secondary: 'Navigationshintergrund verwenden'
                }
            },
            appearanceScale: {
                name: 'Zoomstufe (nicht synchronisiert)',
                desc: 'Steuert die gesamte Zoomstufe von Notebook Navigator.'
            },
            startView: {
                name: 'Standard-Startansicht',
                desc: 'Wählen Sie den Bereich, der beim Öffnen von Notebook Navigator angezeigt wird. Der Navigationsbereich zeigt Verknüpfungen, aktuelle Notizen und die Ordnerstruktur. Der Listenbereich zeigt die Notizliste.',
                options: {
                    navigation: 'Navigationsbereich',
                    files: 'Listenbereich'
                }
            },
            toolbarButtons: {
                name: 'Symbolleisten-Schaltflächen',
                desc: 'Wählen Sie aus, welche Schaltflächen in der Symbolleiste angezeigt werden. Ausgeblendete Schaltflächen bleiben über Befehle und Menüs zugänglich.',
                navigationLabel: 'Navigationssymbolleiste',
                listLabel: 'Listensymbolleiste'
            },
            autoRevealActiveNote: {
                name: 'Aktive Notiz automatisch anzeigen',
                desc: 'Notizen automatisch anzeigen, wenn sie über Schnellauswahl, Links oder Suche geöffnet werden.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Ereignisse von rechter Seitenleiste ignorieren',
                desc: 'Aktive Notiz nicht ändern, wenn in der rechten Seitenleiste auf Notizen geklickt oder diese gewechselt werden.'
            },
            paneTransitionDuration: {
                name: 'Einzelbereich-Animation',
                desc: 'Übergangsdauer beim Wechseln zwischen Bereichen im Einzelbereich-Modus (Millisekunden).',
                resetTooltip: 'Auf Standard zurücksetzen'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Erste Notiz automatisch auswählen (nur Desktop)',
                desc: 'Die erste Notiz automatisch öffnen, wenn Sie den Ordner oder Tag wechseln.'
            },
            skipAutoScroll: {
                name: 'Auto-Scroll für Verknüpfungen deaktivieren',
                desc: 'Navigationsbereich nicht scrollen beim Klicken auf Elemente in Verknüpfungen.'
            },
            autoExpandFoldersTags: {
                name: 'Bei Auswahl erweitern',
                desc: 'Ordner und Tags bei Auswahl erweitern. Im Einzelfenster-Modus: erste Auswahl erweitert, zweite Auswahl zeigt Dateien.'
            },
            springLoadedFolders: {
                name: 'Beim Ziehen erweitern (nur Desktop)',
                desc: 'Ordner und Tags beim Überfahren während des Ziehens erweitern.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Verzögerung beim ersten Erweitern',
                desc: 'Verzögerung, bevor der erste Ordner oder Tag während eines Ziehvorgangs erweitert wird (Sekunden).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Verzögerung bei weiteren Erweiterungen',
                desc: 'Verzögerung, bevor weitere Ordner oder Tags während desselben Ziehvorgangs erweitert werden (Sekunden).'
            },
            navigationBanner: {
                name: 'Navigationsbanner (Tresorprofil)',
                desc: 'Bild oberhalb des Navigationsbereichs anzeigen. Ändert sich mit dem ausgewählten Tresorprofil.',
                current: 'Aktuelles Banner: {path}',
                chooseButton: 'Bild auswählen'
            },
            showShortcuts: {
                name: 'Lesezeichen anzeigen',
                desc: 'Lesezeichen-Bereich im Navigationsbereich anzeigen.'
            },
            shortcutBadgeDisplay: {
                name: 'Verknüpfungsabzeichen',
                desc: "Was neben Verknüpfungen angezeigt wird. Verwenden Sie die Befehle 'Verknüpfung 1-9 öffnen', um Verknüpfungen direkt zu öffnen.",
                options: {
                    index: 'Position (1-9)',
                    count: 'Elementanzahl',
                    none: 'Keine'
                }
            },
            showRecentNotes: {
                name: 'Neueste Notizen anzeigen',
                desc: 'Den Bereich für neueste Notizen im Navigationsbereich anzeigen.'
            },
            recentNotesCount: {
                name: 'Anzahl neuester Notizen',
                desc: 'Anzahl der anzuzeigenden neuesten Notizen.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Neueste Notizen mit Lesezeichen anheften',
                desc: 'Neueste Notizen beim Anheften von Lesezeichen einbeziehen.'
            },
            showTooltips: {
                name: 'Tooltips anzeigen',
                desc: 'Zeige Hover-Tooltips mit zusätzlichen Informationen für Notizen und Ordner an.'
            },
            showTooltipPath: {
                name: 'Pfad anzeigen',
                desc: 'Zeigt den Ordnerpfad unter den Notiznamen in Tooltips an.'
            },
            resetPaneSeparator: {
                name: 'Position des Fenstertrennelements zurücksetzen',
                desc: 'Setzt das verschiebbare Trennelement zwischen Navigationsbereich und Listenbereich auf die Standardposition zurück.',
                buttonText: 'Trennelement zurücksetzen',
                notice: 'Trennelementposition zurückgesetzt. Starten Sie Obsidian neu oder öffnen Sie Notebook Navigator erneut, um die Änderungen anzuwenden.'
            },
            multiSelectModifier: {
                name: 'Mehrfachauswahl-Modifikator (nur Desktop)',
                desc: 'Wählen Sie, welche Modifikatortaste die Mehrfachauswahl umschaltet. Wenn Option/Alt ausgewählt ist, öffnet Cmd/Strg-Klick Notizen in einem neuen Tab.',
                options: {
                    cmdCtrl: 'Cmd/Strg-Klick',
                    optionAlt: 'Option/Alt-Klick'
                }
            },
            excludedNotes: {
                name: 'Notizen verstecken (Tresorprofil)',
                desc: 'Kommagetrennte Liste von Frontmatter-Eigenschaften. Notizen mit diesen Eigenschaften werden ausgeblendet (z.B. Entwurf, privat, archiviert).',
                placeholder: 'entwurf, privat'
            },
            excludedFileNamePatterns: {
                name: 'Dateien verstecken (Tresorprofil)',
                desc: 'Kommagetrennte Liste von Dateinamenmustern zum Ausblenden. Unterstützt * Platzhalter und / Pfade (z.B. temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Tresorprofil',
                desc: 'Profile speichern Dateityp-Sichtbarkeit, versteckte Dateien, versteckte Ordner, versteckte Tags, versteckte Notizen, Verknüpfungen und Navigationsbanner. Profile können über die Kopfzeile des Navigationsbereichs gewechselt werden.',
                defaultName: 'Standard',
                addButton: 'Profil hinzufügen',
                editProfilesButton: 'Profile bearbeiten',
                addProfileOption: 'Profil hinzufügen...',
                applyButton: 'Übernehmen',
                editButton: 'Profil bearbeiten',
                deleteButton: 'Profil löschen',
                addModalTitle: 'Profil hinzufügen',
                editProfilesModalTitle: 'Profile bearbeiten',
                editModalTitle: 'Profil bearbeiten',
                addModalPlaceholder: 'Profilname',
                deleteModalTitle: '{name} löschen',
                deleteModalMessage: '{name} entfernen? Versteckte Datei-, Ordner-, Tag- und Notizfilter in diesem Profil werden gelöscht.',
                moveUp: 'Nach oben',
                moveDown: 'Nach unten',
                errors: {
                    emptyName: 'Profilnamen eingeben',
                    duplicateName: 'Profilname bereits vorhanden'
                }
            },
            vaultTitle: {
                name: 'Tresortitel-Platzierung (nur Desktop)',
                desc: 'Wählen Sie, wo der Tresortitel angezeigt wird.',
                options: {
                    header: 'Im Header anzeigen',
                    navigation: 'Im Navigationsbereich anzeigen'
                }
            },
            excludedFolders: {
                name: 'Ordner verstecken (Tresorprofil)',
                desc: 'Kommagetrennte Liste von auszublendenden Ordnern. Namensmuster: assets* (Ordner die mit assets beginnen), *_temp (endet mit _temp). Pfadmuster: /archive (nur Wurzel-Archive), /res* (Wurzelordner die mit res beginnen), /*/temp (temp-Ordner eine Ebene tief), /projects/* (alle Ordner in projects).',
                placeholder: 'templates, assets*, /archive, /res*'
            },
            fileVisibility: {
                name: 'Dateitypen anzeigen (Tresorprofil)',
                desc: 'Filtern Sie, welche Dateitypen im Navigator angezeigt werden. Dateitypen, die von Obsidian nicht unterstützt werden, können in externen Anwendungen geöffnet werden.',
                options: {
                    documents: 'Dokumente (.md, .canvas, .base)',
                    supported: 'Unterstützt (öffnet in Obsidian)',
                    all: 'Alle (öffnet ggf. extern)'
                }
            },
            homepage: {
                name: 'Startseite',
                desc: 'Datei auswählen, die Notebook Navigator automatisch öffnet, z. B. ein Dashboard.',
                current: 'Aktuell: {path}',
                currentMobile: 'Mobil: {path}',
                chooseButton: 'Datei auswählen',

                separateMobile: {
                    name: 'Separate mobile Startseite',
                    desc: 'Verwenden Sie eine andere Startseite für Mobilgeräte.'
                }
            },
            showFileDate: {
                name: 'Datum anzeigen',
                desc: 'Das Datum unter Notizennamen anzeigen.'
            },
            alphabeticalDateMode: {
                name: 'Bei Sortierung nach Name',
                desc: 'Datum, das angezeigt wird, wenn Notizen alphabetisch sortiert sind.',
                options: {
                    created: 'Erstelldatum',
                    modified: 'Änderungsdatum'
                }
            },
            showFileTags: {
                name: 'Datei-Tags anzeigen',
                desc: 'Zeigt klickbare Tags in Datei-Elementen an. Verwenden Sie Tag-Farben, um verschiedene Tag-Typen visuell zu unterscheiden.'
            },
            showFileTagAncestors: {
                name: 'Vollständige Tag-Pfade anzeigen',
                desc: "Vollständige Tag-Hierarchiepfade anzeigen. Aktiviert: 'ai/openai', 'arbeit/projekte/2024'. Deaktiviert: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Datei-Tags einfärben',
                desc: 'Tag-Farben auf Tag-Abzeichen in Datei-Elementen anwenden.'
            },
            prioritizeColoredFileTags: {
                name: 'Farbige Tags zuerst anzeigen',
                desc: 'Farbige Tags vor anderen Tags in Datei-Elementen sortieren.'
            },
            showFileTagsInCompactMode: {
                name: 'Datei-Tags im schlanken Modus anzeigen',
                desc: 'Tags anzeigen, wenn Datum, Vorschau und Bild ausgeblendet sind.'
            },
            dateFormat: {
                name: 'Datumsformat',
                desc: 'Format für die Datumsanzeige (verwendet date-fns Format).',
                placeholder: 'dd.MM.yyyy',
                help: 'Gängige Formate:\ndd.MM.yyyy = 25.05.2022\ndd/MM/yyyy = 25/05/2022\nyyyy-MM-dd = 2022-05-25\n\nTokens:\nyyyy/yy = Jahr\nMMMM/MMM/MM = Monat\ndd/d = Tag\nEEEE/EEE = Wochentag',
                helpTooltip: 'Klicken für Formatreferenz'
            },
            timeFormat: {
                name: 'Zeitformat',
                desc: 'Format für die Zeitanzeige (verwendet date-fns Format).',
                placeholder: 'HH:mm',
                help: 'Gängige Formate:\nHH:mm = 14:30 (24-Stunden)\nh:mm a = 2:30 PM (12-Stunden)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nTokens:\nHH/H = 24-Stunden\nhh/h = 12-Stunden\nmm = Minuten\nss = Sekunden\na = AM/PM',
                helpTooltip: 'Klicken für Formatreferenz'
            },
            showFilePreview: {
                name: 'Notizenvorschau anzeigen',
                desc: 'Vorschautext unter Notizennamen anzeigen.'
            },
            skipHeadingsInPreview: {
                name: 'Überschriften in Vorschau überspringen',
                desc: 'Überschriftenzeilen bei der Erstellung des Vorschautextes überspringen.'
            },
            skipCodeBlocksInPreview: {
                name: 'Codeblöcke in Vorschau überspringen',
                desc: 'Codeblöcke bei der Erstellung des Vorschautextes überspringen.'
            },
            stripHtmlInPreview: {
                name: 'HTML in Vorschauen entfernen',
                desc: 'HTML-Tags aus dem Vorschautext entfernen. Kann die Leistung bei großen Notizen beeinträchtigen.'
            },
            previewProperties: {
                name: 'Vorschau-Eigenschaften',
                desc: 'Kommagetrennte Liste von Frontmatter-Eigenschaften für Vorschautext. Die erste Eigenschaft mit Text wird verwendet.',
                placeholder: 'zusammenfassung, beschreibung, abstrakt',
                info: 'Wenn kein Vorschautext in den angegebenen Eigenschaften gefunden wird, wird die Vorschau aus dem Notizinhalt generiert.'
            },
            previewRows: {
                name: 'Vorschauzeilen',
                desc: 'Anzahl der Zeilen für den Vorschautext.',
                options: {
                    '1': '1 Zeile',
                    '2': '2 Zeilen',
                    '3': '3 Zeilen',
                    '4': '4 Zeilen',
                    '5': '5 Zeilen'
                }
            },
            fileNameRows: {
                name: 'Titelzeilen',
                desc: 'Anzahl der Zeilen für Notizentitel.',
                options: {
                    '1': '1 Zeile',
                    '2': '2 Zeilen'
                }
            },
            showFeatureImage: {
                name: 'Vorschaubild anzeigen',
                desc: 'Zeigt eine Miniatur des ersten Bildes in der Notiz an.'
            },
            forceSquareFeatureImage: {
                name: 'Quadratische Vorschaubilder erzwingen',
                desc: 'Vorschaubilder als quadratische Miniaturansichten darstellen.'
            },
            featureImageProperties: {
                name: 'Bildeigenschaften',
                desc: 'Kommagetrennte Liste von Frontmatter-Eigenschaften für Miniaturbilder.',
                placeholder: 'thumbnail, featureResized, feature'
            },

            downloadExternalFeatureImages: {
                name: 'Externe Bilder herunterladen',
                desc: 'Remote-Bilder und YouTube-Vorschaubilder für Feature-Bilder herunterladen.'
            },
            showRootFolder: {
                name: 'Wurzelordner anzeigen',
                desc: 'Den Namen des Wurzelordners im Baum anzeigen.'
            },
            showFolderIcons: {
                name: 'Ordner-Icons anzeigen',
                desc: 'Icons neben Ordnern im Navigationsbereich anzeigen.'
            },
            inheritFolderColors: {
                name: 'Ordnerfarben vererben',
                desc: 'Unterordner erben die Farbe von übergeordneten Ordnern.'
            },
            showNoteCount: {
                name: 'Notizenzahl anzeigen',
                desc: 'Die Anzahl der Notizen neben jedem Ordner und Tag anzeigen.'
            },
            showSectionIcons: {
                name: 'Icons für Shortcuts und kürzliche Elemente anzeigen',
                desc: 'Icons für Navigationsbereiche wie Shortcuts und Zuletzt verwendete Dateien anzeigen.'
            },
            interfaceIcons: {
                name: 'Oberflächensymbole',
                desc: 'Symbole für Symbolleiste, Ordner, Tags, angeheftete Elemente, Suche und Sortierung bearbeiten.',
                buttonText: 'Symbole bearbeiten'
            },
            showIconsColorOnly: {
                name: 'Farbe nur auf Symbole anwenden',
                desc: 'Wenn aktiviert, werden benutzerdefinierte Farben nur auf Symbole angewendet. Wenn deaktiviert, werden Farben sowohl auf Symbole als auch auf Textbeschriftungen angewendet.'
            },
            collapseBehavior: {
                name: 'Elemente einklappen',
                desc: 'Wählen Sie, was die Schaltfläche zum Ein-/Ausklappen beeinflusst.',
                options: {
                    all: 'Alle Ordner und Tags',
                    foldersOnly: 'Nur Ordner',
                    tagsOnly: 'Nur Tags'
                }
            },
            smartCollapse: {
                name: 'Ausgewähltes Element erweitert halten',
                desc: 'Beim Einklappen bleiben der aktuell ausgewählte Ordner oder Tag und seine übergeordneten Elemente erweitert.'
            },
            navIndent: {
                name: 'Baum-Einrückung',
                desc: 'Passen Sie die Einrückungsbreite für verschachtelte Ordner und Tags an.'
            },
            navItemHeight: {
                name: 'Zeilenhöhe',
                desc: 'Passen Sie die Höhe von Ordnern und Tags im Navigationsbereich an.'
            },
            navItemHeightScaleText: {
                name: 'Text mit Zeilenhöhe skalieren',
                desc: 'Verkleinert die Navigationsschrift, wenn die Zeilenhöhe reduziert wird.'
            },
            navRootSpacing: {
                name: 'Abstand für Wurzelelemente',
                desc: 'Abstand zwischen Ordnern und Tags auf der obersten Ebene.'
            },
            showTags: {
                name: 'Tags anzeigen',
                desc: 'Tag-Bereich im Navigator anzeigen.'
            },
            showTagIcons: {
                name: 'Tag-Icons anzeigen',
                desc: 'Icons neben Tags im Navigationsbereich anzeigen.'
            },
            inheritTagColors: {
                name: 'Tag-Farben vererben',
                desc: 'Unter-Tags erben die Farbe von übergeordneten Tags.'
            },
            tagSortOrder: {
                name: 'Tag-Sortierreihenfolge',
                desc: 'Lege fest, wie Tags im Navigationsbereich sortiert werden. (nicht synchronisiert)',
                options: {
                    alphaAsc: 'A bis Z',
                    alphaDesc: 'Z bis A',
                    frequencyAsc: 'Häufigkeit (niedrig bis hoch)',
                    frequencyDesc: 'Häufigkeit (hoch bis niedrig)'
                }
            },
            showAllTagsFolder: {
                name: 'Tags-Ordner anzeigen',
                desc: '"Tags" als einklappbaren Ordner anzeigen.'
            },
            showUntagged: {
                name: 'Ungetaggte Notizen anzeigen',
                desc: '"Ohne Tag" für Notizen ohne Tags anzeigen.'
            },
            keepEmptyTagsProperty: {
                name: 'Tags-Eigenschaft nach Entfernen des letzten Tags beibehalten',
                desc: 'Behält die Tags-Frontmatter-Eigenschaft, wenn alle Tags entfernt werden. Wenn deaktiviert, wird die Tags-Eigenschaft aus dem Frontmatter gelöscht.'
            },
            hiddenTags: {
                name: 'Tags verstecken (Tresorprofil)',
                desc: 'Kommagetrennte Liste von Tag-Mustern. Namensmuster: tag* (beginnt mit), *tag (endet mit). Pfadmuster: archiv (Tag und Untergeordnete), archiv/* (nur Untergeordnete), projekte/*/entwürfe (Platzhalter in der Mitte).',
                placeholder: 'archiv*, *entwurf, projekte/*/alt'
            },
            enableFolderNotes: {
                name: 'Ordnernotizen aktivieren',
                desc: 'Wenn aktiviert, werden Ordner mit zugehörigen Notizen als anklickbare Links angezeigt.'
            },
            folderNoteType: {
                name: 'Standardtyp für Ordnernotizen',
                desc: 'Ordnernotiztyp, der über das Kontextmenü erstellt wird.',
                options: {
                    ask: 'Beim Erstellen fragen',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'Name der Ordnernotiz',
                desc: 'Name der Ordnernotiz. Leer lassen, um denselben Namen wie der Ordner zu verwenden.',
                placeholder: 'Leer lassen für Ordnernamen'
            },
            folderNoteProperties: {
                name: 'Ordnernotiz-Eigenschaften',
                desc: 'YAML-Frontmatter, das neuen Ordnernotizen hinzugefügt wird. --- Markierungen werden automatisch hinzugefügt.',
                placeholder: 'theme: dark\nfoldernote: true'
            },
            hideFolderNoteInList: {
                name: 'Ordnernotizen in Liste ausblenden',
                desc: 'Die Ordnernotiz in der Notizliste des Ordners ausblenden.'
            },
            pinCreatedFolderNote: {
                name: 'Erstellte Ordnernotizen anheften',
                desc: 'Automatisch Ordnernotizen anheften, wenn sie über das Kontextmenü erstellt werden.'
            },
            confirmBeforeDelete: {
                name: 'Vor dem Löschen bestätigen',
                desc: 'Bestätigungsdialog beim Löschen von Notizen oder Ordnern anzeigen'
            },
            interceptTagClicks: {
                name: 'Zu Tags beim Klicken navigieren',
                desc: 'Beim Klicken auf Tags in Notizen zu diesem Tag im Notebook Navigator navigieren, anstatt die Obsidian-Suche auszulösen.'
            },
            metadataCleanup: {
                name: 'Metadaten bereinigen',
                desc: 'Entfernt verwaiste Metadaten, die zurückbleiben, wenn Dateien, Ordner oder Tags außerhalb von Obsidian gelöscht, verschoben oder umbenannt werden. Dies betrifft nur die Notebook Navigator Einstellungsdatei.',
                buttonText: 'Metadaten bereinigen',
                error: 'Einstellungen-Bereinigung fehlgeschlagen',
                loading: 'Metadaten werden überprüft...',
                statusClean: 'Keine Metadaten zu bereinigen',
                statusCounts: 'Verwaiste Elemente: {folders} Ordner, {tags} Tags, {files} Dateien, {pinned} Pins, {separators} Trennlinien'
            },
            rebuildCache: {
                name: 'Cache neu aufbauen',
                desc: 'Verwenden Sie dies, wenn Tags fehlen, Vorschauen falsch sind oder Bilder fehlen. Dies kann nach Synchronisierungskonflikten oder unerwarteten Schließungen auftreten.',
                buttonText: 'Cache neu aufbauen',
                success: 'Cache wurde neu aufgebaut',
                error: 'Cache-Neuaufbau fehlgeschlagen',
                indexingTitle: 'Tresor wird indexiert...',
                progress: 'Notebook Navigator-Cache wird aktualisiert.'
            },
            hotkeys: {
                intro: 'Bearbeite <plugin folder>/notebook-navigator/data.json, um Notebook Navigator-Tastenkürzel anzupassen. Öffne die Datei in einem Texteditor und suche den Abschnitt "keyboardShortcuts". Jede Zuordnung nutzt diese Struktur:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Strg (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Umschalt',
                    '"Ctrl" = Steuerung ("Mod" für plattformübergreifend bevorzugen)'
                ],
                guidance:
                    'Füge mehrere Zuordnungen hinzu, um alternative Tasten wie im obigen ArrowUp- und K-Beispiel zu unterstützen. Kombiniere Modifikatortasten, indem du sie gemeinsam angibst, zum Beispiel "modifiers": ["Mod", "Shift"]. Tastatursequenzen wie "gg" oder "dd" werden nicht unterstützt. Lade Obsidian nach dem Bearbeiten der Datei neu.'
            },
            externalIcons: {
                downloadButton: 'Herunterladen',
                downloadingLabel: 'Wird heruntergeladen...',
                removeButton: 'Entfernen',
                statusInstalled: 'Heruntergeladen (Version {version})',
                statusNotInstalled: 'Nicht heruntergeladen',
                versionUnknown: 'unbekannt',
                downloadFailed: 'Fehler beim Herunterladen von {name}. Überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
                removeFailed: 'Fehler beim Entfernen von {name}.',
                infoNote:
                    'Heruntergeladene Icon-Pakete synchronisieren den Installationsstatus über Geräte hinweg. Icon-Pakete bleiben in der lokalen Datenbank auf jedem Gerät; die Synchronisierung verfolgt nur, ob sie heruntergeladen oder entfernt werden sollen. Icon-Pakete werden aus dem Notebook Navigator Repository heruntergeladen (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterDates: {
                name: 'Frontmatter-Metadaten verwenden',
                desc: 'Frontmatter für Notizname, Zeitstempel, Icons und Farben verwenden'
            },
            frontmatterNameField: {
                name: 'Namensfelder',
                desc: 'Kommagetrennte Liste von Frontmatter-Feldern. Erster nicht-leerer Wert wird verwendet. Fällt auf Dateinamen zurück.',
                placeholder: 'titel, name'
            },
            frontmatterIconField: {
                name: 'Icon-Feld',
                desc: 'Frontmatter-Feld für Datei-Icons. Leer lassen, um Icons aus den Einstellungen zu verwenden.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'Farbfeld',
                desc: 'Frontmatter-Feld für Dateifarben. Leer lassen, um Farben aus den Einstellungen zu verwenden.',
                placeholder: 'color'
            },
            frontmatterSaveMetadata: {
                name: 'Icons und Farben im Frontmatter speichern',
                desc: 'Schreibt Datei-Icons und Farben automatisch ins Frontmatter über die oben konfigurierten Felder.'
            },
            frontmatterMigration: {
                name: 'Icons und Farben aus Einstellungen migrieren',
                desc: 'In Einstellungen gespeichert: {icons} Icons, {colors} Farben.',
                button: 'Migrieren',
                buttonWorking: 'Migriere...',
                noticeNone: 'Keine Datei-Icons oder Farben in den Einstellungen gespeichert.',
                noticeDone: '{migratedIcons}/{icons} Icons, {migratedColors}/{colors} Farben migriert.',
                noticeFailures: 'Fehlgeschlagene Einträge: {failures}.',
                noticeError: 'Migration fehlgeschlagen. Details in der Konsole.'
            },
            frontmatterCreatedField: {
                name: 'Feld für Erstellungszeitstempel',
                desc: 'Frontmatter-Feldname für den Erstellungszeitstempel. Leer lassen, um nur das Dateisystemdatum zu verwenden.',
                placeholder: 'erstellt'
            },
            frontmatterModifiedField: {
                name: 'Feld für Änderungszeitstempel',
                desc: 'Frontmatter-Feldname für den Änderungszeitstempel. Leer lassen, um nur das Dateisystemdatum zu verwenden.',
                placeholder: 'geändert'
            },
            frontmatterDateFormat: {
                name: 'Zeitstempelformat',
                desc: 'Format zum Parsen von Zeitstempeln im Frontmatter. Leer lassen, um ISO 8601-Format zu verwenden',
                helpTooltip: 'Siehe date-fns Formatdokumentation',
                help: "Häufige Formate:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'Entwicklung unterstützen',
                desc: 'Wenn Sie Notebook Navigator lieben, erwägen Sie bitte, die weitere Entwicklung zu unterstützen.',
                buttonText: '❤️ Sponsor',
                coffeeButton: '☕️ Spendiere mir einen Kaffee'
            },
            updateCheckOnStart: {
                name: 'Beim Start nach neuer Version suchen',
                desc: 'Prüft beim Start auf neue Plugin-Versionen und zeigt eine Benachrichtigung an, wenn ein Update verfügbar ist. Jede Version wird nur einmal angekündigt, und Überprüfungen erfolgen höchstens einmal täglich.',
                status: 'Neue Version verfügbar: {version}'
            },
            whatsNew: {
                name: 'Neuigkeiten in Notebook Navigator {version}',
                desc: 'Letzte Updates und Verbesserungen anzeigen',
                buttonText: 'Letzte Updates anzeigen'
            },
            masteringVideo: {
                name: 'Notebook Navigator meistern (Video)',
                desc: 'Dieses Video behandelt alles, was du brauchst, um produktiv mit Notebook Navigator zu arbeiten, einschließlich Tastenkürzel, Suche, Tags und erweiterte Anpassungen.'
            },
            cacheStatistics: {
                localCache: 'Lokaler Cache',
                items: 'Einträge',
                withTags: 'mit Tags',
                withPreviewText: 'mit Vorschautext',
                withFeatureImage: 'mit Vorschaubild',
                withMetadata: 'mit Metadaten'
            },
            metadataInfo: {
                successfullyParsed: 'Erfolgreich geparst',
                itemsWithName: 'Einträge mit Name',
                withCreatedDate: 'mit Erstellungsdatum',
                withModifiedDate: 'mit Änderungsdatum',
                withIcon: 'mit Icon',
                withColor: 'mit Farbe',
                failedToParse: 'Parsing fehlgeschlagen',
                createdDates: 'Erstellungsdaten',
                modifiedDates: 'Änderungsdaten',
                checkTimestampFormat: 'Überprüfen Sie Ihr Zeitstempelformat.',
                exportFailed: 'Fehler exportieren'
            }
        }
    },
    whatsNew: {
        title: 'Neuigkeiten in Notebook Navigator',
        supportMessage: 'Wenn Sie Notebook Navigator hilfreich finden, erwägen Sie bitte, die Entwicklung zu unterstützen.',
        supportButton: 'Kauf mir einen Kaffee',
        thanksButton: 'Danke!'
    }
};
