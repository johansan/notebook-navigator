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
        restoreDefault: 'Standard wiederherstellen', // Button text for restoring values to defaults (English: Restore default)
        submit: 'OK', // Button text for submitting forms and dialogs (English: Submit)
        save: 'Speichern', // Button text for saving settings and dialogs (English: Save)
        configure: 'Konfigurieren', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'Heller Modus', // Label for light theme mode (English: Light mode)
        darkMode: 'Dunkler Modus', // Label for dark theme mode (English: Dark mode)
        noSelection: 'Keine Auswahl', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Ohne Tag', // Label for notes without any tags (English: Untagged)
        featureImageAlt: 'Vorschaubild', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Unbekannter Fehler', // Generic fallback when an error has no message (English: Unknown error)
        clipboardWriteError: 'Konnte nicht in Zwischenablage schreiben',
        updateBannerTitle: 'Notebook Navigator-Update verfügbar',
        updateBannerInstruction: 'In Einstellungen -> Community-Plugins aktualisieren',
        previous: 'Zurück', // Generic aria label for previous navigation (English: Previous)
        next: 'Weiter' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Wählen Sie einen Ordner oder Tag aus, um Notizen anzuzeigen', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Keine Notizen', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Angeheftet', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Notizen', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Dateien', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (ausgeblendet)', // Accessibility label applied to list items that are normally hidden
        collapseGroup: 'Gruppe einklappen',
        expandGroup: 'Gruppe ausklappen',
        manualSortTitle: 'Manuelle Sortierung: {property}',
        manualSortHint: 'Zum Neuordnen ziehen. Die Reihenfolge wird als numerische Indexwerte in der Eigenschaft „{property}" gespeichert.',
        manualSortNonMarkdownHint: 'Nicht-Markdown-Dateien werden unten angezeigt und können nicht neu geordnet werden.',
        unsortedSection: 'Unsortiert',
        manualSortDone: 'Fertig',
        manualSortMultipleWriteFailure: '{count} Dateien fehlgeschlagen; erste: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Ohne Tag', // Label for the special item showing notes without tags (English: Untagged)
        tags: 'Tags' // Label for the tags virtual folder (English: Tags)
    },

    navigationPane: {
        shortcutsHeader: 'Lesezeichen',
        recentFilesHeader: 'Neueste Dateien', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Eigenschaften',
        reorderRootFoldersTitle: 'Navigation neu anordnen',
        reorderRootFoldersHint: 'Pfeile oder Ziehen zum Neuanordnen',
        vaultRootLabel: 'Tresor',
        resetRootToAlpha: 'Auf alphabetische Reihenfolge zurücksetzen',
        resetRootToFrequency: 'Auf Häufigkeitsreihenfolge zurücksetzen',
        pinShortcuts: 'Lesezeichen anheften',
        pinShortcutsAndRecentFiles: 'Lesezeichen und neueste Dateien anheften',
        unpinShortcuts: 'Lesezeichen lösen',
        unpinShortcutsAndRecentFiles: 'Lesezeichen und neueste Dateien lösen',
        profileMenuAria: 'Tresorprofil ändern'
    },

    navigationCalendar: {
        ariaLabel: 'Kalender',
        dailyNotesNotEnabled: 'Das Kernplugin für tägliche Notizen ist nicht aktiviert.',
        noteHiddenByProfile: 'Die Kalendernotiz ist durch das aktuelle Tresorprofil ausgeblendet.',
        createDailyNote: {
            title: 'Neue tägliche Notiz',
            message: 'Datei {filename} existiert nicht. Möchten Sie sie erstellen?',
            confirmButton: 'Erstellen'
        },
        helpModal: {
            title: 'Kalender-Tastenkürzel',
            items: [
                'Klicken Sie auf einen Tag, um eine tägliche Notiz zu öffnen oder zu erstellen. Wochen, Monate, Quartale und Jahre funktionieren genauso.',
                'Ein gefüllter Punkt unter einem Tag bedeutet, dass eine Notiz vorhanden ist. Ein hohler Punkt bedeutet, dass unerledigte Aufgaben vorhanden sind.',
                'Wenn eine Notiz ein Feature-Bild hat, wird es als Tageshintergrund angezeigt.'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+Klick auf ein Datum, um in der Dateiliste nach diesem Datum zu filtern.',
            dateFilterOptionAlt: '`Option/Alt`+Klick auf ein Datum, um in der Dateiliste nach diesem Datum zu filtern.'
        }
    },

    dailyNotes: {
        templateReadFailed: 'Vorlage für tägliche Notizen konnte nicht gelesen werden.',
        createFailed: 'Tägliche Notiz konnte nicht erstellt werden.'
    },

    shortcuts: {
        folderExists: 'Ordner bereits in Lesezeichen vorhanden',
        noteExists: 'Notiz bereits in Lesezeichen vorhanden',
        tagExists: 'Tag bereits in Lesezeichen vorhanden',
        propertyExists: 'Eigenschaft bereits in Lesezeichen vorhanden',
        invalidProperty: 'Ungültiges Eigenschafts-Lesezeichen',
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
        showCalendar: 'Kalender anzeigen',
        hideCalendar: 'Kalender ausblenden',
        newFolder: 'Neuer Ordner', // Tooltip for create new folder button (English: New folder)
        newNote: 'Neue Notiz', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Zurück zur Navigation', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeChildSortOrder: 'Sortierreihenfolge ändern',
        changeSortAndGroup: 'Sortierung und Gruppierung ändern',
        resetViewToDefaults: 'Ansicht auf Standardwerte zurücksetzen',
        manualSort: 'Manuelle Sortierung',
        editSortOrder: 'Sortierreihenfolge bearbeiten...',
        removeSortProperty: 'Sortier-Eigenschaft entfernen',
        descendants: 'Unterelemente',
        subfolders: 'Unterordner',
        subtags: 'Unter-Tags',
        childValues: 'Unterwerte',
        applySortAndGroupToDescendants: (target: string) => `Sortierung und Gruppierung auf ${target} anwenden`,
        applyAppearanceToDescendants: (target: string) => `Darstellung auf ${target} anwenden`,
        showFolders: 'Navigation anzeigen', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: 'Navigation neu anordnen',
        finishRootFolderReorder: 'Neuordnung fertig',
        showExcludedItems: 'Versteckte Ordner, Tags und Notizen anzeigen', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Versteckte Ordner, Tags und Notizen ausblenden', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Zweispaltige Ansicht anzeigen', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Einspaltige Ansicht anzeigen', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            'Doppelbereiche sind nicht verfügbar, wenn die Seitenleiste zu schmal ist. Um dies zu ändern, setzen Sie „Wenn Seitenleiste zu schmal ist“ in Einstellungen > Erscheinungsbild & Verhalten auf „Nichts tun“.',
        changeAppearance: 'Erscheinungsbild ändern', // Tooltip for button to change folder appearance settings (English: Change appearance)
        showNotesFromSubfolders: 'Notizen aus Unterordnern anzeigen',
        showFilesFromSubfolders: 'Dateien aus Unterordnern anzeigen',
        showNotesFromDescendants: 'Notizen aus Nachkommen anzeigen',
        showFilesFromDescendants: 'Dateien aus Nachkommen anzeigen',
        search: 'Suchen' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Suchen...', // Placeholder text for search input (English: Search...)
        placeholderVault: 'Tresor durchsuchen...',
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Suche löschen', // Tooltip for clear search button (English: Clear search)
        switchToFilterSearch: 'Zur Filtersuche wechseln',
        switchToOmnisearch: 'Zu Omnisearch wechseln',
        saveSearchShortcut: 'Such-Lesezeichen speichern',
        removeSearchShortcut: 'Such-Lesezeichen entfernen',
        shortcutModalTitle: 'Such-Lesezeichen speichern',
        shortcutNamePlaceholder: 'Lesezeichen-Namen eingeben',
        shortcutStartIn: 'Immer starten in: {path}',
        searchHelp: 'Suchsyntax',
        searchHelpTitle: 'Suchsyntax',
        searchHelpModal: {
            intro: 'Kombinieren Sie Anzeigenamen, Aliasnamen, Eigenschaften, Tags, Daten und Filter in einer Abfrage (z.B. `meeting .status=active #work @thisweek`). Installieren Sie das Omnisearch-Plugin für Volltextsuche.',
            introSwitching:
                'Wechseln Sie zwischen Filtersuche und Omnisearch mit den Auf-/Ab-Pfeiltasten oder durch Klicken auf das Suchsymbol.',
            sections: {
                fileNames: {
                    title: 'Dateinamen und Aliasnamen',
                    items: [
                        '`word` Notizen mit "word" im Anzeigenamen oder in einem Aliasnamen finden.',
                        '`word1 word2` Jedes Wort muss im Anzeigenamen oder in den Aliasnamen vorkommen.',
                        '`-word` Notizen mit "word" im Anzeigenamen oder in einem Aliasnamen ausschließen.'
                    ]
                },
                tags: {
                    title: 'Tags',
                    items: [
                        '`#tag` Notizen mit Tag einschließen (findet auch verschachtelte Tags wie `#tag/subtag`).',
                        '`#` Nur Notizen mit Tags anzeigen.',
                        '`-#tag` Notizen mit Tag ausschließen.',
                        '`-#` Nur Notizen ohne Tags anzeigen.',
                        '`#tag1 #tag2` Beide Tags finden (implizites AND).',
                        '`#tag1 AND #tag2` Beide Tags finden (explizites AND).',
                        '`#tag1 OR #tag2` Eines der Tags finden.',
                        '`#a OR #b AND #c` AND hat höhere Priorität: findet `#a` oder beide `#b` und `#c`.',
                        'Cmd/Ctrl+Klick auf einen Tag zum Hinzufügen mit AND. Cmd/Ctrl+Shift+Klick zum Hinzufügen mit OR.'
                    ]
                },
                properties: {
                    title: 'Eigenschaften',
                    items: [
                        '`.key` Notizen mit einem Eigenschaftsschlüssel einschließen, der mit `key` beginnt.',
                        '`.key=value` Notizen einschließen, deren Eigenschaftswert `value` enthält.',
                        '`."Reading Status"` Notizen mit einem Eigenschaftsschlüssel einschließen, der Leerzeichen enthält.',
                        '`."Reading Status"="In Progress"` Schlüssel und Werte mit Leerzeichen müssen in Anführungszeichen stehen.',
                        '`-.key` Notizen mit einem Eigenschaftsschlüssel ausschließen, der mit `key` beginnt.',
                        '`-.key=value` Notizen ausschließen, deren Eigenschaftswert `value` enthält.',
                        'Cmd/Ctrl+Klick auf eine Eigenschaft zum Hinzufügen mit AND. Cmd/Ctrl+Shift+Klick zum Hinzufügen mit OR.'
                    ]
                },
                tasks: {
                    title: 'Filter',
                    items: [
                        '`has:task` Notizen mit unerledigten Aufgaben einbeziehen.',
                        '`-has:task` Notizen mit unerledigten Aufgaben ausschließen.',
                        '`folder:meetings` Notizen einbeziehen, deren Ordnername `meetings` enthält.',
                        '`folder:/work/meetings` Notizen nur in `work/meetings` einbeziehen (keine Unterordner).',
                        '`folder:/` Notizen nur im Vault-Stammverzeichnis einbeziehen.',
                        '`-folder:archive` Notizen ausschließen, deren Ordnername `archive` enthält.',
                        '`-folder:/archive` Notizen nur in `archive` ausschließen (keine Unterordner).',
                        '`ext:md` Notizen mit der Erweiterung `md` einbeziehen (`ext:.md` wird ebenfalls unterstützt).',
                        '`-ext:pdf` Notizen mit der Erweiterung `pdf` ausschließen.',
                        'Mit Tags, Namen und Daten kombinieren (zum Beispiel: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'AND/OR-Verhalten',
                    items: [
                        '`AND` und `OR` sind nur in reinen Tag-/Eigenschafts-Abfragen Operatoren.',
                        'Reine Tag-/Eigenschafts-Abfragen enthalten nur Tag- und Eigenschafts-Filter: `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`.',
                        'Wenn eine Abfrage Namen, Daten (`@...`), Aufgabenfilter (`has:task`), Ordnerfilter (`folder:...`) oder Erweiterungsfilter (`ext:...`) enthält, werden `AND` und `OR` als Wörter abgeglichen.',
                        'Beispiel für Operator-Abfrage: `#work OR .status=started`.',
                        'Beispiel für gemischte Abfrage: `#work OR ext:md` (`OR` wird in Dateinamen abgeglichen).'
                    ]
                },
                dates: {
                    title: 'Datum',
                    items: [
                        '`@today` Notizen von heute mit dem Standard-Datumsfeld finden.',
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` Relative Datumsbereiche.',
                        '`@2026-02-07` Einen bestimmten Tag finden (auch `@20260207` möglich).',
                        '`@2026` Ein Kalenderjahr finden.',
                        '`@2026-02` oder `@202602` Einen Kalendermonat finden.',
                        '`@2026-W05` oder `@2026W05` Eine ISO-Woche finden.',
                        '`@2026-Q2` oder `@2026Q2` Ein Kalenderquartal finden.',
                        '`@13/02/2026` Numerische Formate mit Trennzeichen (`@07022026` folgt Ihrem Gebietsschema bei Mehrdeutigkeit).',
                        '`@2026-02-01..2026-02-07` Einen inklusiven Datumsbereich finden (offene Enden unterstützt).',
                        '`@c:...` oder `@m:...` Erstellungs- oder Änderungsdatum ansprechen.',
                        '`-@...` Ein Datum ausschließen.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'Volltextsuche im gesamten Vault, gefiltert nach dem aktuellen Ordner oder ausgewählten Tags.',
                        'Kann bei weniger als 3 Zeichen in großen Vaults langsam sein.',
                        'Kann Pfade mit Nicht-ASCII-Zeichen nicht durchsuchen oder Unterpfade korrekt durchsuchen.',
                        'Gibt begrenzte Ergebnisse vor der Ordnerfilterung zurück, sodass relevante Dateien möglicherweise nicht erscheinen, wenn viele Treffer an anderer Stelle existieren.',
                        'Notizvorschauen zeigen Omnisearch-Auszüge anstelle des Standard-Vorschautexts.'
                    ]
                }
            }
        }
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
            openInDefaultApp: 'In Standard-App öffnen',
            renameNote: 'Notiz umbenennen',
            deleteNote: 'Notiz löschen',
            deleteMultipleNotes: '{count} Notizen löschen',
            moveNoteToFolder: 'Notiz verschieben nach...',
            moveFileToFolder: 'Datei verschieben nach...',
            moveMultipleNotesToFolder: '{count} Notizen verschieben nach...',
            moveMultipleFilesToFolder: '{count} Dateien verschieben nach...',
            mergeNotes: '{count} Notizen zusammenführen...',
            mergeNotesInGroup: 'Notizen in Gruppe zusammenführen...',
            setManualSortGroupHeader: 'Gruppenüberschrift festlegen',
            changeManualSortGroupHeader: 'Gruppenüberschrift ändern',
            manualSortGroupHeader: {
                title: 'Gruppenüberschrift',
                copyStyle: 'Stil der Gruppenüberschrift kopieren',
                pasteStyle: 'Stil der Gruppenüberschrift einfügen',
                remove: 'Gruppenüberschrift entfernen'
            },
            addTag: 'Tag hinzufügen',
            addPropertyKey: 'Eigenschaft setzen',
            removeTag: 'Tag entfernen',
            removeAllTags: 'Alle Tags entfernen',
            changeIcon: 'Symbol ändern',
            changeColor: 'Farbe ändern',
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
            setCalendarHighlight: 'Hervorhebung setzen',
            removeCalendarHighlight: 'Hervorhebung entfernen',
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
            createFolderNote: 'Ordnernotiz erstellen',
            detachFolderNote: 'Ordnernotiz lösen',
            deleteFolderNote: 'Ordnernotiz löschen',
            changeIcon: 'Symbol ändern',
            changeColor: 'Farbe ändern',
            changeBackground: 'Hintergrund ändern',
            excludeFolder: 'Ordner verstecken',
            unhideFolder: 'Ordner einblenden',
            excludeFromDescendants: 'In übergeordneten Ordnern ausblenden',
            includeInDescendants: 'In übergeordneten Ordnern anzeigen',
            hiddenFromParentsIndicator: 'Aus übergeordneten Ordnerlisten ausgeblendet',
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
        property: {
            addKey: 'Eigenschaftsschlüssel konfigurieren',
            renameKey: 'Eigenschaft umbenennen',
            deleteKey: 'Eigenschaft löschen'
        },
        navigation: {
            addSeparator: 'Trennlinie hinzufügen',
            removeSeparator: 'Trennlinie entfernen'
        },
        copyPath: {
            title: 'Pfad kopieren',
            asObsidianUrl: 'als Obsidian-URL',
            fromVaultFolder: 'vom Vault-Ordner',
            fromSystemRoot: 'vom Systemstammverzeichnis'
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
        appearance: 'Darstellung',
        sortBy: 'Sortieren nach',
        standardPreset: 'Standard',
        compactPreset: 'Kompakt',
        defaultSuffix: '(Standard)',
        defaultLabel: 'Standard',
        titleRows: 'Titelzeilen',
        previewRows: 'Vorschauzeilen',
        groupBy: 'Gruppieren nach',
        titleRowOption: (rows: number) => `${rows} Titelzeile${rows === 1 ? '' : 'n'}`,
        previewRowOption: (rows: number) => `${rows} Vorschauzeile${rows === 1 ? '' : 'n'}`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Anwenden',
            applySortAndGroupTitle: (target: string) => `Sortierung und Gruppierung auf ${target} anwenden?`,
            applyAppearanceTitle: (target: string) => `Darstellung auf ${target} anwenden?`,
            affectedCountMessage: (count: number) => `Vorhandene Überschreibungen, die sich ändern: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'Manuelle Sortierung verwenden?',
            propertySortMessage: (property: string, count: number) =>
                `Wechselt die aktuelle Ansicht zur manuellen Sortierung mit „${property}". Beim Bearbeiten der Reihenfolge werden numerische Indexwerte bei Bedarf in diese Eigenschaft in ${count} ${count === 1 ? 'Notiz' : 'Notizen'} geschrieben.`,
            propertySortConfirmButton: 'Manuelle Sortierung verwenden',
            removePropertyTitle: 'Sortier-Eigenschaft entfernen?',
            removePropertyMessage: (property: string, count: number) =>
                `Entfernt „${property}" aus ${count} ${count === 1 ? 'Notiz' : 'Notizen'} in der aktuellen Liste. Die manuelle Sortierreihenfolge dieser Notizen wird gelöscht.`,
            removePropertyConfirmButton: 'Eigenschaft entfernen',
            compactTitle: 'Indexwerte verdichten?',
            compactMessage: (count: number) =>
                `Diese Neuanordnung benötigt mehr numerischen Raum. ${count} ${count === 1 ? 'Notiz erhält' : 'Notizen erhalten'} neue Indexwerte.`,
            compactConfirmButton: 'Indexwerte verdichten'
        },
        manualSortGroupHeader: {
            title: 'Gruppenüberschrift festlegen',
            titleLabel: 'Titel',
            placeholder: 'Gruppenüberschrift',
            icon: 'Symbol',
            color: 'Farbe',
            wordCount: 'Wortzahl anzeigen',
            wordCountTarget: 'Zielwortzahl',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'Wenn dieses Feld leer ist, verwendet das Gruppenziel die Zieleigenschaft aus Einstellungen > Notizen > Wort- und Zeichenanzahl. Überschreiben Sie sie, indem Sie einen Zielwert für diese Gruppe festlegen.',
            description: 'Passen Sie die Gruppenüberschrift für diese Notiz an. Lassen Sie den Titel leer, um die Überschrift zu entfernen.'
        },
        mergeNotes: {
            title: 'Notizen zusammenführen',
            summary: 'Eine Notiz aus {count} Notizen in {folder} erstellen.',
            frontmatterRule: 'Frontmatter der ersten Notiz bleibt erhalten. Frontmatter der anderen Notizen wird entfernt.',
            crossFolderWarning:
                'Quellnotizen befinden sich in verschiedenen Ordnern. Relative Links und Einbettungen funktionieren in der zusammengeführten Notiz möglicherweise nicht mehr.',
            outputName: 'Ausgabename',
            outputNameDesc: 'Die zusammengeführte Notiz wird im oben angezeigten Ordner erstellt.',
            outputNamePlaceholder: 'Zusammengeführte Notizen',
            separator: 'Trennzeichen',
            separatorDesc: 'Wird zwischen Notizen eingefügt.',
            separatorOptions: {
                none: 'Keine',
                blankLine: 'Leerzeile',
                horizontalRule: 'Horizontale Linie',
                heading: 'Überschrift mit Notiztitel'
            },
            moveSourcesToTrash: 'Quellnotizen nach dem Zusammenführen in den Papierkorb verschieben',
            mergeButton: 'Zusammenführen'
        },
        navRainbowSection: {
            title: (section: string) => `Regenbogenfarben: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'Symbole suchen...',
            recentlyUsedHeader: 'Kürzlich verwendet',
            emptyStateSearch: 'Beginnen Sie zu tippen, um Symbole zu suchen',
            emptyStateNoResults: 'Keine Symbole gefunden',
            showingResultsInfo: 'Zeige 50 von {count} Ergebnissen. Geben Sie mehr ein, um die Suche einzugrenzen.',
            emojiInstructions: 'Geben Sie ein Emoji ein oder fügen Sie es ein, um es als Symbol zu verwenden',
            removeIcon: 'Icon entfernen',
            removeFromRecents: 'Aus zuletzt verwendet entfernen',
            allTabLabel: 'Alle'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Regel hinzufügen'
        },
        interfaceIcons: {
            title: 'Oberflächensymbole',
            fileItemsSection: 'Datei-Elemente',
            items: {
                'nav-shortcuts': 'Verknüpfungen',
                'nav-recent-files': 'Zuletzt verwendete Dateien',
                'nav-expand-all': 'Alle erweitern',
                'nav-collapse-all': 'Alle einklappen',
                'nav-calendar': 'Kalender',
                'nav-tree-expand': 'Baumpfeil: erweitern',
                'nav-tree-collapse': 'Baumpfeil: einklappen',
                'nav-hidden-items': 'Ausgeblendete Elemente',
                'nav-root-reorder': 'Stammordner neu anordnen',
                'nav-new-folder': 'Neuer Ordner',
                'nav-show-single-pane': 'Einspaltige Ansicht anzeigen',
                'nav-show-dual-pane': 'Zweispaltige Ansicht anzeigen',
                'nav-profile-chevron': 'Profilmenü-Pfeil',
                'list-search': 'Suche',
                'list-reveal-file': 'Datei anzeigen',
                'list-descendants': 'Notizen aus Unterordnern',
                'list-sort-ascending': 'Sortierung: aufsteigend',
                'list-sort-descending': 'Sortierung: absteigend',
                'list-sort-modified': 'Nach Änderungsdatum sortieren',
                'list-sort-created': 'Nach Erstellungsdatum sortieren',
                'list-sort-title': 'Nach Titel sortieren',
                'list-sort-filename': 'Nach Dateiname sortieren',
                'list-sort-property': 'Nach Eigenschaft sortieren',
                'list-appearance': 'Darstellung ändern',
                'list-new-note': 'Neue Notiz',
                'list-pinned': 'Angeheftete Notizen',
                'nav-folder-open': 'Ordner geöffnet',
                'nav-folder-closed': 'Ordner geschlossen',
                'nav-tags': 'Tags',
                'nav-tag': 'Tag',
                'nav-properties': 'Eigenschaften',
                'nav-property': 'Eigenschaft',
                'nav-property-value': 'Wert',
                'file-unfinished-task': 'Unerledigte Aufgaben',
                'file-word-count': 'Wortanzahl',
                'file-character-count': 'Zeichenanzahl'
            }
        },
        colorPicker: {
            currentColor: 'Aktuell',
            newColor: 'Neu',
            paletteDefault: 'Standard',
            paletteCustom: 'Benutzerdefiniert',
            copyColors: 'Farbe kopieren',
            colorsCopied: 'Farbe in Zwischenablage kopiert',
            pasteColors: 'Farbe einfügen',
            pasteClipboardError: 'Zwischenablage konnte nicht gelesen werden',
            pasteInvalidFormat: 'Ein Hex-Farbwert erwartet',
            colorsPasted: 'Farbe erfolgreich eingefügt',
            resetUserColors: 'Benutzerdefinierte Farben löschen',
            clearCustomColorsConfirm: 'Alle benutzerdefinierten Farben entfernen?',
            userColorSlot: 'Farbe {slot}',
            recentColors: 'Zuletzt verwendete Farben',
            clearRecentColors: 'Zuletzt verwendete Farben löschen',
            removeRecentColor: 'Farbe entfernen',
            apply: 'Anwenden',
            pickerLabel: 'Auswahl',
            hexLabel: 'HEX',
            hexInputLabel: 'Hex-Farbwert',
            saturationValueArea: 'Sättigung und Helligkeit',
            hueSlider: 'Farbton',
            alphaSlider: 'Transparenz'
        },
        appearance: {
            tabIcon: 'Symbol',
            tabColor: 'Farbe',
            tabBackground: 'Hintergrund',
            resetIcon: 'Symbol entfernen',
            resetColor: 'Farbe entfernen',
            resetBackground: 'Hintergrund entfernen',
            clear: 'Stil löschen',
            apply: 'Anwenden'
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
            renameBatchNotFinalized:
                'Umbenannt {renamed}/{total}. Nicht aktualisiert: {notUpdated}. Metadaten und Verknüpfungen wurden nicht aktualisiert.',
            invalidTagName: 'Geben Sie einen gültigen Tag-Namen ein.',
            descendantRenameError: 'Ein Tag kann nicht in sich selbst oder einen Nachkommen verschoben werden.',
            confirmDelete: 'Tag löschen',
            deleteBatchNotFinalized:
                'Entfernt aus {removed}/{total}. Nicht aktualisiert: {notUpdated}. Metadaten und Verknüpfungen wurden nicht aktualisiert.',
            checkConsoleForDetails: 'Details in der Konsole anzeigen.',
            file: 'Datei',
            files: 'Dateien',
            inlineParsingWarning: {
                title: 'Inline-Tag-Kompatibilität',
                message:
                    '{tag} enthält Zeichen, die Obsidian in Inline-Tags nicht verarbeiten kann. Frontmatter-Tags sind nicht betroffen.',
                confirm: 'Trotzdem verwenden'
            }
        },
        propertyOperation: {
            renameTitle: 'Eigenschaft {property} umbenennen',
            deleteTitle: 'Eigenschaft {property} löschen',
            newKeyPrompt: 'Neuer Eigenschaftsname',
            newKeyPlaceholder: 'Neuen Eigenschaftsnamen eingeben',
            renameWarning: 'Das Umbenennen der Eigenschaft {property} ändert {count} {files}.',
            renameConflictWarning:
                'Die Eigenschaft {newKey} existiert bereits in {count} {files}. Das Umbenennen von {oldKey} ersetzt vorhandene {newKey}-Werte.',
            deleteWarning: 'Das Löschen der Eigenschaft {property} ändert {count} {files}.',
            confirmRename: 'Eigenschaft umbenennen',
            confirmDelete: 'Eigenschaft löschen',
            renameNoChanges: '{oldKey} → {newKey} (keine Änderungen)',
            renameSettingsUpdateFailed: 'Eigenschaft {oldKey} → {newKey} umbenannt. Einstellungen konnten nicht aktualisiert werden.',
            deleteSingleSuccess: 'Eigenschaft {property} aus 1 Notiz gelöscht',
            deleteMultipleSuccess: 'Eigenschaft {property} aus {count} Notizen gelöscht',
            deleteSettingsUpdateFailed: 'Eigenschaft {property} gelöscht. Einstellungen konnten nicht aktualisiert werden.',
            invalidKeyName: 'Geben Sie einen gültigen Eigenschaftsnamen ein.'
        },
        fileSystem: {
            newFolderTitle: 'Neuer Ordner',
            renameFolderTitle: 'Ordner umbenennen',
            renameFileTitle: 'Datei umbenennen',
            deleteFolderTitle: "'{name}' löschen?",
            deleteFileTitle: "'{name}' löschen?",
            deleteFileAttachmentsTitle: 'Dateianhänge löschen?',
            moveFileConflictTitle: 'Verschiebekonflikt',
            folderNamePrompt: 'Ordnernamen eingeben:',
            hideInOtherVaultProfiles: 'In anderen Tresorprofilen ausblenden',
            renamePrompt: 'Neuen Namen eingeben:',
            renameVaultTitle: 'Anzeigenamen des Tresors ändern',
            renameVaultPrompt: 'Benutzerdefinierten Anzeigenamen eingeben (leer lassen für Standard):',
            deleteFolderConfirm: 'Sind Sie sicher, dass Sie diesen Ordner und seinen gesamten Inhalt löschen möchten?',
            deleteFileConfirm: 'Sind Sie sicher, dass Sie diese Datei löschen möchten?',
            deleteFileAttachmentsDescriptionSingle: 'Dieser Anhang wird in keiner Notiz mehr verwendet. Möchten Sie ihn löschen?',
            deleteFileAttachmentsDescriptionMultiple: 'Diese Anhänge werden in keiner Notiz mehr verwendet. Möchten Sie sie löschen?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Dateibaum',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Galerie',
            moveFileConflictDescriptionSingle: 'Ein Dateikonflikt wurde in „{folder}" gefunden.',
            moveFileConflictDescriptionMultiple: '{count} Dateikonflikte wurden in „{folder}" gefunden.',
            moveFileConflictAffectedFiles: 'Betroffene Dateien',
            moveFileConflictItem: '„{name}" -> „{suggested}"{renameOnly}',
            moveFileConflictRenameOnly: '(nur umbenennen)',
            moveFileConflictRename: 'Umbenennen',
            moveFileConflictOverwrite: 'Überschreiben',
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
        calendarTemplate: {
            placeholder: 'Vorlagen durchsuchen...',
            instructions: {
                navigate: 'zum Navigieren',
                select: 'zum Auswählen der Vorlage',
                dismiss: 'zum Abbrechen'
            }
        },
        navigationBanner: {
            placeholder: 'Bilder durchsuchen...',
            svgMissingDimensions: 'Die ausgewählte SVG-Datei definiert weder Breite, Höhe noch viewBox.',
            instructions: {
                navigate: 'zum Navigieren',
                select: 'um Banner zu setzen',
                dismiss: 'zum Abbrechen'
            }
        },
        tagSuggest: {
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
        propertySuggest: {
            placeholder: 'Eigenschaftsschlüssel auswählen...',
            navigatePlaceholder: 'Zu Eigenschaft navigieren...',
            instructions: {
                navigate: 'zum Navigieren',
                select: 'zum Hinzufügen der Eigenschaft',
                dismiss: 'zum Abbrechen'
            }
        },
        propertyKeyVisibility: {
            title: 'Sichtbarkeit der Eigenschaftsschlüssel',
            description:
                'Steuern Sie, wo Eigenschaftswerte angezeigt werden. Die Spalten entsprechen dem Navigationsbereich, dem Listenbereich und dem Datei-Kontextmenü. Verwenden Sie die untere Zeile, um alle Zeilen einer Spalte umzuschalten.',
            searchPlaceholder: 'Eigenschaftsschlüssel suchen...',
            propertyColumnLabel: 'Eigenschaft',
            showInNavigation: 'In Navigation anzeigen',
            showInList: 'In Liste anzeigen',
            showInFileMenu: 'Im Dateimenü anzeigen',
            toggleAllInNavigation: 'Alle in Navigation umschalten',
            toggleAllInList: 'Alle in Liste umschalten',
            toggleAllInFileMenu: 'Alle im Dateimenü umschalten',
            applyButton: 'Anwenden',
            emptyState: 'Keine Eigenschaftsschlüssel gefunden.'
        },
        welcome: {
            title: 'Willkommen bei {pluginName}',
            introText:
                'Hallo und herzlich willkommen bei Notebook Navigator, einem besseren Dateibrowser und Kalender für Obsidian. Bevor Sie loslegen, empfehle ich Ihnen wirklich, mindestens die ersten drei Kapitel des Videos unten, Mastering Notebook Navigator, anzusehen. Dort erfahren Sie, wie die beiden Bereiche funktionieren und wie Sie schnell einsteigen können.',
            continueText:
                'Wenn Sie dann noch zehn Minuten Zeit haben, schauen Sie sich auch die Kapitel zur Ersteinrichtung und zum täglichen Ablauf an. Damit haben Sie alles, was Sie für den Einstieg brauchen, und können später zurückkehren, um sich weitere Details anzusehen. Einen Link zum Video finden Sie oben in den Einstellungen von Notebook Navigator.',
            thanksText: 'Viel Spaß mit Notebook Navigator!',
            videoAlt: 'Notebook Navigator 3 meistern',
            openVideoButton: 'Video abspielen',
            closeButton: 'Vielleicht später'
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
            deleteAttachments: 'Anhänge konnten nicht gelöscht werden: {error}',
            mergeNotes: 'Notizen konnten nicht zusammengeführt werden: {error}',
            mergeNotesOpenOutput:
                'Zusammengeführte Notiz wurde als {name} erstellt, konnte aber nicht geöffnet werden: {error}. Quellnotizen wurden nicht verändert.',
            mergeNotesOpenSkipped: 'Eine andere Dateiöffnungsanfrage hatte Vorrang.',
            mergeNotesTrashSources:
                'Zusammengeführte Notiz erstellt. {count} Quellnotizen konnten nicht in den Papierkorb verschoben werden.',
            duplicateNote: 'Notiz konnte nicht dupliziert werden: {error}',
            duplicateFolder: 'Ordner konnte nicht dupliziert werden: {error}',
            openVersionHistory: 'Versionsverlauf konnte nicht geöffnet werden: {error}',
            versionHistoryNotFound: 'Versionsverlauf-Befehl nicht gefunden. Stellen Sie sicher, dass Obsidian Sync aktiviert ist.',
            revealInExplorer: 'Datei konnte nicht im Explorer angezeigt werden: {error}',
            openInDefaultApp: 'Öffnen in Standard-App fehlgeschlagen: {error}',
            openInDefaultAppNotAvailable: 'Öffnen in Standard-App ist auf dieser Plattform nicht verfügbar',
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
            showFolder: 'Ordner eingeblendet: {name}',
            folderExcludedFromDescendants: 'Aus übergeordneten Ordnerlisten ausgeblendet: {name}',
            folderIncludedInDescendants: 'In übergeordneten Ordnerlisten angezeigt: {name}',
            mergeNotes: '{count} Notizen in {name} zusammengeführt'
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
            mergeNotesRequireMultipleMarkdown: 'Wählen Sie mindestens zwei Markdown-Notizen zum Zusammenführen aus',
            tagOperationsNotAvailable: 'Tag-Operationen nicht verfügbar',
            propertyOperationsNotAvailable: 'Eigenschafts-Operationen nicht verfügbar',
            tagsRequireMarkdown: 'Tags werden nur in Markdown-Notizen unterstützt',
            propertiesRequireMarkdown: 'Eigenschaften werden nur bei Markdown-Notizen unterstützt',
            propertySetOnNote: 'Eigenschaft bei 1 Notiz aktualisiert',
            propertySetOnNotes: 'Eigenschaft bei {count} Notizen aktualisiert',
            manualSortPropertyRemovedFromNote: 'Sortier-Eigenschaft aus 1 Notiz entfernt',
            manualSortPropertyRemovedFromNotes: 'Sortier-Eigenschaft aus {count} Notizen entfernt',
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
            untitled: 'Ohne Titel'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Ein Ordner kann nicht in sich selbst oder einen Unterordner verschoben werden.',
            itemAlreadyExists: 'Ein Element mit dem Namen "{name}" existiert bereits an diesem Ort.',
            failedToMove: 'Verschieben fehlgeschlagen: {error}',
            failedToAddTag: 'Hinzufügen des Tags "{tag}" fehlgeschlagen',
            failedToSetProperty: 'Eigenschaft konnte nicht aktualisiert werden: {error}',
            failedToClearTags: 'Entfernen der Tags fehlgeschlagen',
            failedToMoveFolder: 'Ordner "{name}" konnte nicht verschoben werden',
            failedToImportFiles: 'Import fehlgeschlagen: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} Dateien existieren bereits am Zielort',
            filesAlreadyHaveTag: '{count} Dateien haben dieses Tag oder ein spezifischeres bereits',
            filesAlreadyHaveProperty: '{count} Dateien haben diese Eigenschaft bereits',
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

    // Plugin commands
    commands: {
        open: 'Öffnen', // Command palette: Opens the Notebook Navigator view (English: Open)
        toggleLeftSidebar: 'Linke Seitenleiste umschalten', // Command palette: Toggles left sidebar, opening Notebook Navigator when uncollapsing (English: Toggle left sidebar)
        openHomepage: 'Startseite öffnen', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        openDailyNote: 'Tägliche Notiz öffnen',
        openWeeklyNote: 'Wöchentliche Notiz öffnen',
        openMonthlyNote: 'Monatliche Notiz öffnen',
        openQuarterlyNote: 'Vierteljährliche Notiz öffnen',
        openYearlyNote: 'Jährliche Notiz öffnen',
        revealFile: 'Datei anzeigen', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Suchen', // Command palette: Toggle search in the file list (English: Search)
        searchVaultRoot: 'Gesamten Tresor durchsuchen', // Command palette: Selects the vault root folder and focuses search with subfolders included (English: Search whole vault)
        toggleDualPane: 'Doppelbereichslayout umschalten', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        toggleDualPaneOrientation: 'Doppelbereich-Ausrichtung umschalten', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'Kalender umschalten', // Command palette: Toggles showing the calendar overlay in the navigation pane (English: Toggle calendar)
        selectVaultProfile: 'Tresorprofil wechseln', // Command palette: Opens a modal to choose a different vault profile (English: Switch vault profile)
        selectVaultProfile1: 'Tresorprofil 1 auswählen', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Tresorprofil 2 auswählen', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Tresorprofil 3 auswählen', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Dateien löschen', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Neue Notiz erstellen', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Neue Notiz aus Vorlage', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Dateien verschieben', // Command palette: Move selected files to another folder (English: Move files)
        mergeNotes: 'Notizen zusammenführen', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'Nächste Datei auswählen', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Vorherige Datei auswählen', // Command palette: Selects the previous file in the current view (English: Select previous file)
        navigateBack: 'Zurück navigieren',
        navigateForward: 'Vorwärts navigieren',
        convertToFolderNote: 'In Ordnernotiz konvertieren', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Als Ordnernotiz festlegen', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Ordnernotiz lösen', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Alle Ordnernotizen anheften', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Zu Ordner navigieren', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Zu Tag navigieren', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        navigateToProperty: 'Zu Eigenschaft navigieren', // Command palette: Navigate to a property key or value using fuzzy search (English: Navigate to property)
        addShortcut: 'Zu Shortcuts hinzufügen', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: 'Shortcut {number} öffnen',
        toggleDescendants: 'Nachkommen umschalten', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Versteckte Ordner, Tags und Notizen umschalten', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Tag-Sortierung umschalten', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: 'Tags nach Auswahl umschalten',
        togglePropertiesBySelection: 'Eigenschaften nach Auswahl umschalten',
        toggleCompactMode: 'Kompaktmodus umschalten', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Angepinnten Bereich umschalten',
        collapseExpand: 'Alle Elemente ein-/ausklappen', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        collapseExpandSelectedItem: 'Ausgewähltes Element ein-/ausklappen',
        addTag: 'Tag zu ausgewählten Dateien hinzufügen', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        setProperty: 'Eigenschaft für ausgewählte Dateien setzen', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'Tag von ausgewählten Dateien entfernen', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Alle Tags von ausgewählten Dateien entfernen', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        openAllFiles: 'Alle Dateien öffnen', // Command palette: Opens all files in the current folder or tag (English: Open all files)
        rebuildCache: 'Cache neu aufbauen', // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
        restoreDefaultSettings: 'Standardeinstellungen wiederherstellen' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        calendarViewName: 'Kalender', // Name shown in the view header/tab (English: Calendar)
        folderNoteSidebarViewName: 'Ordnernotiz', // Name shown in the folder note sidebar tab (English: Folder note)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'In Notebook Navigator anzeigen', // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
        settingsUnavailableNotice:
            'Notebook Navigator konnte seine Einstellungen nicht lesen und wurde nicht gestartet. Wenn Ihr Vault synchronisiert wird, starten Sie Obsidian nach Abschluss der Synchronisierung neu. Um mit Standardeinstellungen neu zu beginnen, führen Sie den Befehl „Standardeinstellungen wiederherstellen“ aus.', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsRecovery: {
            confirmTitle: 'Standardeinstellungen wiederherstellen', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'Dies ersetzt die Einstellungsdatei von Notebook Navigator durch Standardeinstellungen. Wenn Ihr Vault noch synchronisiert wird, können die wiederhergestellten Standardwerte die auf Ihren anderen Geräten gespeicherten Einstellungen überschreiben. Eine lesbare Einstellungsdatei wird zuvor in eine Sicherungsdatei mit Zeitstempel im Plugin-Ordner kopiert.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'Standardwerte wiederherstellen', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice:
                'Die Wiederherstellung der Einstellungen konnte nicht abgeschlossen werden. Lokale Einstellungen wurden beibehalten.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'Standardeinstellungen wiederhergestellt. Starten Sie Obsidian neu, um den Vorgang abzuschließen.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Zuletzt geändert am',
        createdAt: 'Erstellt am',
        file: 'Datei',
        files: 'Dateien',
        folder: 'Ordner',
        folders: 'Ordner',
        wordCount: 'Wortanzahl'
    },

    fileCounts: {
        words: '{count} Wörter',
        characters: '{count} Zeichen',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'Standardeinstellungen ändern',
        metadataReport: {
            exportSuccess: 'Fehlgeschlagene Metadaten-Bericht exportiert nach: {filename}',
            exportFailed: 'Export des Metadaten-Berichts fehlgeschlagen'
        },
        sections: {
            general: 'Allgemein',
            vaultFilters: 'Anzeigefilter',
            appearanceBehavior: 'Darstellung & Verhalten',
            navigationPane: 'Navigationsbereich',
            calendar: 'Kalender',
            fileOperations: 'Dateioperationen',
            icons: 'Icon-Pakete',
            folders: 'Ordner',
            folderNotes: 'Ordnernotizen',
            folderNoteFiles: 'Ordnernotiz-Dateien',
            foldersAndFolderNotes: 'Ordner & Ordnernotizen',
            tagsAndProperties: 'Tags & Eigenschaften',
            tags: 'Tags',
            listPane: 'Listenbereich',
            notes: 'Dateianzeige',
            shortcutsAndRecentFiles: 'Verknüpfungen & zuletzt verwendete Dateien',
            advanced: 'Erweitert'
        },
        pageGroups: {
            configuration: 'Konfiguration',
            navigationAndContent: 'Navigationsbereich',
            notesAndLists: 'Listenbereich',
            calendarAndTools: 'Kalender und Werkzeuge'
        },
        pageDescriptions: {
            general: 'Versionshinweise, Support, Tresorprofil, Dateitypen und Eigenschaftsschlüssel.',
            vaultFilters: 'Versteckte Ordner, Tags, Dateien, Datei-Tags und Eigenschaftsregeln.',
            appearanceBehavior: 'Verhalten, Tastaturnavigation, Maustasten, Darstellung und Formatierung.',
            navigationPane: 'Layout, Darstellung, Notizenanzahl, Einklappverhalten und Regenbogenfarben.',
            shortcuts: 'Verknüpfungssichtbarkeit, Abzeichen, zuletzt verwendete Dateien und angeheftete Elemente.',
            calendar: 'Kalenderanzeige, Datumsnotizen, Vorlagen, Sprachumgebung und Seitenleistenposition.',
            fileOperations: 'Vorlagen, Löschbestätigungen, Anhänge und Verhalten bei Dateikonflikten beim Verschieben.',
            foldersAndFolderNotes: 'Ordneranzeige, Ordnernotizen, Ordnernotiz-Vorlagen und Ordnernotiz-Verhalten.',
            tagsProperties: 'Tag- und Eigenschaftsbereiche, Symbole, Sortierung, Geltungsbereich und Vererbung.',
            listPane: 'Sortierung, Gruppierung, Listenmodi, angeheftete Notizen und Zeichnungsvorschauen.',
            frontmatter: 'Frontmatter-Felder für Anzeigenamen, Zeitstempel, Symbole und Farben.',
            notes: 'Titel, Vorschautext, Hauptbilder, Tags, Eigenschaften, Daten, Wortanzahlen und Zeichenanzahlen.',
            iconPacks: 'Oberflächensymbole, Dateisymbole und Icon-Paket-Verwaltung.',
            advanced: 'Diagnose, Metadatenbereinigung, Import/Export und Zurücksetzen.'
        },
        groups: {
            general: {
                vaultConfiguration: 'Tresor-Einrichtung',
                templates: 'Vorlagen',
                behavior: 'Verhalten',
                startup: 'Start',
                keyboardNavigation: 'Tastaturnavigation',
                mouseButtons: 'Maustasten',
                view: 'Darstellung',
                icons: 'Symbole',
                desktopAppearance: 'Desktop-Darstellung',
                mobileAppearance: 'Mobile Darstellung',
                formatting: 'Formatierung'
            },
            advanced: {
                maintenance: 'Wartung',
                resetSettings: 'Einstellungen zurücksetzen'
            },
            navigation: {
                appearance: 'Darstellung',
                banner: 'Banner',
                collapseItems: 'Elemente einklappen',
                dragAndDrop: 'Drag-and-drop',
                noteCounts: 'Notizanzahlen',
                rainbowColors: 'Regenbogenfarben',
                leftSidebar: 'Linke Seitenleiste',
                calendarIntegration: 'Kalenderintegration'
            },
            list: {
                display: 'Darstellung',
                groupHeaders: 'Gruppenüberschriften',
                propertySort: 'Eigenschaftssortierung',
                manualSort: 'Manuelle Sortierung',
                pinnedNotes: 'Angeheftete Notizen',
                drawingPreviews: 'Zeichnungsvorschauen'
            },
            notes: {
                frontmatter: 'Frontmatter-Felder',
                tasks: 'Aufgaben',
                icon: 'Symbol',
                title: 'Titel',
                previewText: 'Vorschautext',
                featureImage: 'Hauptbild',
                tags: 'Tags',
                properties: 'Eigenschaften',
                date: 'Datum',
                parentFolder: 'Übergeordneter Ordner',
                wordCount: 'Wort- und Zeichenanzahl'
            }
        },
        syncMode: {
            notSynced: '(nicht synchronisiert)',
            switchToSynced: 'Synchronisierung aktivieren',
            switchToLocal: 'Synchronisierung deaktivieren'
        },
        items: {
            listPaneTitle: {
                name: 'Titel des Listenbereichs',
                desc: 'Wählen Sie, wo der Titel des Listenbereichs angezeigt wird.',
                options: {
                    header: 'Im Kopfbereich anzeigen',
                    list: 'Im Listenbereich anzeigen',
                    hidden: 'Nicht anzeigen'
                }
            },
            sortNotesBy: {
                name: 'Standard-Sortierreihenfolge',
                desc: 'Wählen Sie die Standard-Sortierreihenfolge für Notizen.',
                options: {
                    'modified-desc': 'Bearbeitungsdatum (neueste oben)',
                    'modified-asc': 'Bearbeitungsdatum (älteste oben)',
                    'created-desc': 'Erstellungsdatum (neueste oben)',
                    'created-asc': 'Erstellungsdatum (älteste oben)',
                    'title-asc': 'Titel (A oben)',
                    'title-desc': 'Titel (Z oben)',
                    'filename-asc': 'Dateiname (A oben)',
                    'filename-desc': 'Dateiname (Z oben)'
                },
                directions: {
                    asc: 'Aufsteigend',
                    desc: 'Absteigend'
                },
                fields: {
                    modified: 'Bearbeitungsdatum',
                    created: 'Erstellungsdatum',
                    title: 'Titel',
                    filename: 'Dateiname',
                    property: 'Eigenschaft'
                }
            },
            propertySortKey: {
                name: 'Eigenschaften zum Sortieren',
                desc: 'Kommagetrennte Frontmatter-Eigenschaften, die als Eigenschaftssortier-Optionen angezeigt werden. Array-Werte werden zu einer einzelnen Zeichenkette zusammengefügt. Diese Eigenschaften werden nicht geändert.',
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: 'Sekundäre Sortierung',
                desc: 'Wird bei der Eigenschafts-Sortierung verwendet, wenn Notizen denselben Eigenschaftswert oder keinen Eigenschaftswert haben.',
                options: {
                    title: 'Titel',
                    filename: 'Dateiname',
                    created: 'Erstellungsdatum',
                    modified: 'Bearbeitungsdatum'
                }
            },
            propertySortInstructions: {
                intro: 'Jede oben aufgeführte Eigenschaft erscheint als Sortieroption im Sortiermenü des Listenbereichs. Bei Auswahl werden Notizen nach ihrem Frontmatter-Wert sortiert.'
            },
            manualSortPropertyKey: {
                name: 'Eigenschaft für manuelle Sortierung',
                desc: 'Frontmatter-Eigenschaft zum Speichern der numerischen Indexwerte für die manuelle Sortierung.'
            },
            manualSortGroupHeaderProperty: {
                name: 'Eigenschaft für Gruppenüberschriften',
                desc: 'Frontmatter-Eigenschaft zum Speichern der benutzerdefinierten Gruppenüberschriften.'
            },
            groupHeadersInstructions: {
                intro: 'Benutzerdefinierte Gruppenüberschriften werden über Notizen im Listenbereich angezeigt.',
                items: [
                    'Stellen Sie im Sortiermenü des Listenbereichs die Gruppierung auf **Benutzerdefiniert**.',
                    'Klicken Sie mit der rechten Maustaste auf eine Notiz und wählen Sie **Gruppenüberschrift festlegen**, um eine Überschrift darüber hinzuzufügen.'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'Platzierung neuer Notizen',
                desc: 'Wählen Sie, wo neue Notizen platziert werden, wenn die aktuelle Liste die manuelle Sortierung verwendet.',
                options: {
                    top: 'Oben',
                    bottom: 'Unten',
                    'below-selected-note': 'Unter ausgewählter Notiz',
                    unsorted: 'Unsortiert'
                }
            },
            confirmBeforeManualSort: {
                name: 'Vor manueller Sortierung bestätigen',
                desc: 'Eine Warnung anzeigen, bevor die Eigenschaft für die manuelle Sortierung erstmals in Notizen geschrieben wird. Wenn deaktiviert, erhalten Notizen die Eigenschaft ohne Warnung.'
            },
            manualSortInstructions: {
                intro: 'Die manuelle Sortierung schreibt einen numerischen Indexwert in eine Frontmatter-Eigenschaft jeder Notiz. Notizen ohne Index erscheinen unter Unsortiert.',
                items: [
                    'Aktivieren Sie die manuelle Sortierung, indem Sie **Manuelle Sortierung** aus dem Sortiermenü wählen. Danach gibt es zwei Möglichkeiten, Notizen neu anzuordnen.',
                    'Wählen Sie **Sortierreihenfolge bearbeiten...** aus dem Sortiermenü, um eine Neuordnungsansicht zu öffnen. Ziehen Sie Notizen mit der Maus oder per Touch auf Mobilgeräten. Auf dem Desktop wählt **Cmd/Ctrl**- oder **Shift**-Klick mehrere Notizen aus; das Ziehen einer beliebigen verschiebt dann die gesamte Gruppe.',
                    'Wählen Sie im Listenbereich eine Notiz aus oder markieren Sie mehrere und drücken Sie **Cmd/Ctrl + Arrow Up/Down**, um die Auswahl nach oben oder unten zu verschieben.'
                ]
            },
            revealFileOnListChanges: {
                name: 'Zu ausgewählter Datei bei Listenänderungen scrollen',
                desc: 'Zur ausgewählten Datei scrollen beim Anheften von Notizen, Anzeigen von Unternotizen, Ändern der Ordnerdarstellung oder bei Dateioperationen.'
            },
            includeDescendantNotes: {
                name: 'Notizen aus Unterordnern / Nachkommen anzeigen',
                desc: 'Beim Anzeigen eines Ordners, Tags oder einer Eigenschaft Notizen aus Unterordnern sowie Tag- und Eigenschafts-Nachkommen einbeziehen.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Notizen nur in ihrem Ordner anheften',
                desc: 'Angeheftete Notizen erscheinen nur in ihrem eigenen Ordner als angeheftet. Nützlich für Ordnernotizen oder bei vielen angehefteten Notizen. Hat keinen Einfluss auf Tag- oder Eigenschaftsansichten.'
            },
            separateNoteCounts: {
                name: 'Aktuelle und Nachkommen-Notizanzahl getrennt anzeigen',
                desc: 'Zeigt Notizanzahlen als "aktuell ▾ Nachkommen" für Ordner, Tags und Eigenschaften.'
            },
            groupNotes: {
                name: 'Standardgruppierung',
                desc: 'Benutzerdefiniert zeigt im Frontmatter definierte Überschriften. Datum gruppiert Notizen nach Datum. Ordner gruppiert Notizen nach Ordner. Tag- und Eigenschaftsansichten verwenden Datumsgruppen, wenn Ordner ausgewählt ist.',
                options: {
                    custom: 'Benutzerdefiniert',
                    date: 'Datum',
                    folder: 'Ordner'
                }
            },
            showSelectedNavigationPills: {
                name: 'Tag- und Eigenschaftspillen immer anzeigen',
                desc: 'Wenn deaktiviert, werden Pillen ausgeblendet, die der aktuellen Navigationsauswahl entsprechen (z.\u00a0B. wird die „Rezepte"-Tag-Pille beim Durchsuchen des „Rezepte"-Tags ausgeblendet). Aktivieren, um alle Pillen sichtbar zu halten.'
            },
            stickyGroupHeaders: {
                name: 'Gruppenüberschriften fixieren',
                desc: 'Hält die aktuelle Datums-, Ordner- oder Anheftbereichsüberschrift beim Scrollen sichtbar.'
            },
            showFolderGroupPaths: {
                name: 'Unterordnerpfade anzeigen',
                desc: 'Beim Gruppieren nach Ordner im Listenbereich Unterordnerpfade statt nur Ordnernamen anzeigen.'
            },
            showGroupHeaderItemCounts: {
                name: 'Elementanzahl anzeigen',
                desc: 'Zeigt die Anzahl der Elemente in jeder Gruppenüberschrift im Listenbereich an.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'Ordnergruppierung: Dateien des aktuellen Ordners unten',
                desc: 'Wenn die Standardgruppierung „Ordner“ ist, Dateien direkt im ausgewählten Ordner unter den Unterordnergruppen anzeigen.'
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
                desc: 'Dateisymbole mit linksbündigem Abstand anzeigen. Deaktivierung entfernt sowohl Symbole als auch Einrückung. Priorität: Unerledigte-Aufgaben-Symbol > Benutzerdefiniertes Symbol > Ordnersymbol > Dateiname-Symbol > Dateityp-Symbol > Standard-Symbol.'
            },
            useFolderIcon: {
                name: 'Ordnersymbol verwenden',
                desc: 'Das Symbol des übergeordneten Ordners anzeigen, wenn kein benutzerdefiniertes Dateisymbol festgelegt ist. Die Ordnerfarbe wird verwendet, wenn keine benutzerdefinierte Dateifarbe festgelegt ist.'
            },
            showFileIconUnfinishedTask: {
                name: 'Unerledigte-Aufgaben-Symbol',
                desc: 'Ein Aufgabensymbol anzeigen, wenn eine Notiz unerledigte Aufgaben enthält.'
            },
            showFileBackgroundUnfinishedTask: {
                name: 'Unerledigte-Aufgaben-Hintergrund',
                desc: 'Eine Hintergrundfarbe anwenden, wenn eine Notiz unerledigte Aufgaben enthält.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'Hintergrundfarbe für unerledigte Aufgaben',
                desc: 'Die Hintergrundfarbe festlegen, die verwendet wird, wenn eine Notiz unerledigte Aufgaben enthält.'
            },
            showFilenameMatchIcons: {
                name: 'Symbole nach Dateiname',
                desc: 'Symbole basierend auf Text im Dateinamen zuweisen.'
            },
            fileNameIconMap: {
                name: 'Dateiname-Symbol-Zuordnung',
                desc: 'Dateien mit dem Text erhalten das angegebene Symbol. Eine Zuordnung pro Zeile: Text=Symbol',
                placeholder: '# Text=icon\nbesprechung=ph-calendar\nrechnung=ph-receipt',
                editTooltip: 'Zuordnungen bearbeiten'
            },
            showCategoryIcons: {
                name: 'Symbole nach Dateityp',
                desc: 'Symbole basierend auf der Dateierweiterung zuweisen.'
            },
            fileTypeIconPreset: {
                name: 'Dateisymbol-Voreinstellung',
                desc: 'Die integrierten Symbole oder eine Symbolpaket-Voreinstellung auswählen. Benutzerdefinierte Erweiterungsregeln überschreiben diese Voreinstellung.',
                options: {
                    none: 'Integrierte Symbole'
                },
                notInstalledWarning: 'Dieses Symbolpaket ist nicht installiert. Stattdessen werden integrierte Symbole angezeigt.'
            },
            fileTypeIconMap: {
                name: 'Dateityp-Symbol-Zuordnung',
                desc: 'Dateien mit der Erweiterung erhalten das angegebene Symbol. Eine Zuordnung pro Zeile: Erweiterung=Symbol',
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'Zuordnungen bearbeiten'
            },
            compactItemHeight: {
                name: 'Höhe schlanker Elemente',
                desc: 'Legt die Höhe schlanker Listenelemente auf Desktop und Mobilgeräten fest (Pixel).',
                resetTooltip: 'Auf Standard zurücksetzen (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Text an schlanke Elementhöhe anpassen',
                desc: 'Skaliert den Text schlanker Listenelemente bei reduzierter Höhe.'
            },
            showParentFolder: {
                name: 'Übergeordneten Ordner anzeigen',
                desc: 'Den übergeordneten Ordnernamen für Notizen in Unterordnern, Tags oder Eigenschaften anzeigen.'
            },
            showParentFolderFullPath: {
                name: 'Ordnerpfad anzeigen',
                desc: 'Den Pfad relativ zum ausgewählten Ordner statt nur den Ordnernamen anzeigen. Tags und Eigenschaften zeigen den vollständigen Pfad.'
            },
            parentFolderClickRevealsFile: {
                name: 'Klick auf übergeordneten Ordner öffnet Ordner',
                desc: 'Klicken auf den übergeordneten Ordner öffnet den Ordner im Listenbereich.'
            },
            showParentFolderColor: {
                name: 'Übergeordnete Ordnerfarbe anzeigen',
                desc: 'Ordnerfarben auf übergeordnete Ordnerlabels anwenden.'
            },
            showParentFolderIcon: {
                name: 'Übergeordnetes Ordnersymbol anzeigen',
                desc: 'Ordnersymbole neben übergeordneten Ordnerlabels anzeigen.'
            },
            showQuickActions: {
                name: 'Schnellaktionen anzeigen',
                desc: 'Aktionsschaltflächen beim Überfahren von Dateien anzeigen. Schaltflächensteuerung wählt aus, welche Aktionen erscheinen.'
            },
            dualPane: {
                name: 'Doppelbereichslayout',
                desc: 'Navigationsbereich und Listenbereich nebeneinander auf dem Desktop anzeigen.'
            },
            dualPaneOrientation: {
                name: 'Ausrichtung des Doppelbereichs',
                desc: 'Horizontalen oder vertikalen Aufbau wählen, wenn der Doppelbereich aktiv ist.',
                options: {
                    horizontal: 'Horizontale Aufteilung',
                    vertical: 'Vertikale Aufteilung'
                }
            },
            narrowSidebarLayout: {
                name: 'Wenn Seitenleiste zu schmal ist',
                desc: 'Wählen Sie, was passiert, wenn Navigationsbereich und Listenbereich nicht nebeneinander passen.',
                options: {
                    none: 'Nichts tun',
                    singlePane: 'Zur einspaltigen Ansicht wechseln',
                    vertical: 'Zur vertikalen Aufteilung wechseln'
                }
            },
            narrowSidebarTrigger: {
                name: 'Schwellenwert für schmale Seitenleiste',
                desc: 'Wählen Sie, wie der Breiten-Schwellenwert der Seitenleiste berechnet wird.',
                options: {
                    fitPanes: 'Bereiche einpassen',
                    customWidth: 'Benutzerdefinierte Breite'
                }
            },
            narrowSidebarCustomWidth: {
                name: 'Breiten-Schwellenwert für schmale Seitenleiste',
                desc: 'Wechseln, wenn die Seitenleiste schmaler als diese Breite ist.',
                resetTooltip: 'Auf Standardbreite zurücksetzen'
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
                name: 'Zoomstufe',
                desc: 'Steuert die gesamte Zoomstufe von Notebook Navigator (Prozent).'
            },
            useFloatingToolbars: {
                name: 'Schwebende Symbolleisten auf iOS/iPadOS verwenden',
                desc: 'Gilt nur für iOS und iPadOS.'
            },
            startView: {
                name: 'Standard-Startansicht',
                desc: 'Wählen Sie den Bereich, der beim Öffnen von Notebook Navigator aktiv ist. In der einspaltigen Ansicht wird dieser Bereich zuerst angezeigt, in der zweispaltigen Ansicht erhält er den Tastaturfokus.',
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
            createNewNotesInNewTab: {
                name: 'Neue Notizen in neuem Tab öffnen',
                desc: 'Wenn aktiviert, öffnet der Befehl „Neue Notiz erstellen" Notizen in einem neuen Tab. Wenn deaktiviert, ersetzen Notizen den aktuellen Tab.'
            },
            autoRevealActiveNote: {
                name: 'Aktive Notiz automatisch anzeigen',
                desc: 'Notizen automatisch anzeigen, wenn sie über Schnellauswahl, Links oder Suche geöffnet werden.'
            },
            autoRevealShortestPath: {
                name: 'Automatisches Anzeigen: Kürzesten Pfad verwenden',
                desc: 'Aktiviert: Automatisches Anzeigen wählt den nächsten sichtbaren übergeordneten Ordner oder Tag. Deaktiviert: Automatisches Anzeigen wählt den tatsächlichen Ordner der Datei und den genauen Tag.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Automatisches Anzeigen: Ereignisse von rechter Seitenleiste ignorieren',
                desc: 'Aktive Notiz nicht ändern, wenn in der rechten Seitenleiste auf Notizen geklickt oder diese gewechselt werden.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'Automatisches Anzeigen: Ereignisse von anderen Fenstern ignorieren',
                desc: 'Aktive Notiz nicht ändern, wenn mit Notizen in einem anderen Fenster gearbeitet wird.'
            },
            paneTransitionDuration: {
                name: 'Einzelbereich-Animation',
                desc: 'Übergangsdauer beim Wechseln zwischen Bereichen im Einzelbereich-Modus (Millisekunden).',
                resetTooltip: 'Auf Standard zurücksetzen'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Erste Notiz automatisch auswählen',
                desc: 'Die erste Notiz automatisch öffnen, wenn Sie Ordner, Tags oder Eigenschaften wechseln.'
            },
            skipAutoScroll: {
                name: 'Auto-Scroll für Verknüpfungen deaktivieren',
                desc: 'Navigationsbereich nicht scrollen beim Klicken auf Elemente in Verknüpfungen.'
            },
            autoExpandNavItems: {
                name: 'Bei Auswahl erweitern',
                desc: 'Ordner und Tags bei Auswahl erweitern. Im Einzelfenster-Modus: erste Auswahl erweitert, zweite Auswahl zeigt Dateien.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'Ein erweiterter Zweig',
                desc: 'Andere Zweige im selben Baum einklappen, wenn ein Ordner, Tag oder eine Eigenschaft erweitert wird.'
            },
            springLoadedFolders: {
                name: 'Beim Ziehen erweitern',
                desc: 'Ordner und Tags beim Überfahren während des Ziehens erweitern.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Beim Ziehen erweitern: Verzögerung beim ersten Erweitern',
                desc: 'Verzögerung, bevor der erste Ordner oder Tag während eines Ziehvorgangs erweitert wird (Sekunden).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Beim Ziehen erweitern: Verzögerung bei weiteren Erweiterungen',
                desc: 'Verzögerung, bevor weitere Ordner oder Tags während desselben Ziehvorgangs erweitert werden (Sekunden).'
            },
            navigationBanner: {
                name: 'Navigationsbanner (Tresorprofil)',
                desc: 'Bild oberhalb des Navigationsbereichs anzeigen. Ändert sich mit dem ausgewählten Tresorprofil.',
                current: 'Aktuelles Banner: {path}',
                chooseButton: 'Bild auswählen'
            },
            pinNavigationBanner: {
                name: 'Banner anheften',
                desc: 'Banner oberhalb des Navigationsbaums anheften.'
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
                name: 'Neueste Dateien anzeigen',
                desc: 'Den Bereich für neueste Dateien im Navigationsbereich anzeigen.'
            },
            hideRecentNotes: {
                name: 'Dateitypen aus neuesten Dateien ausblenden',
                desc: 'Wähle aus, welche Dateitypen im Bereich der neuesten Dateien ausgeblendet werden sollen.',
                options: {
                    none: 'Keine',
                    folderNotes: 'Ordnernotizen'
                }
            },
            recentNotesCount: {
                name: 'Anzahl neuester Dateien',
                desc: 'Anzahl der anzuzeigenden neuesten Dateien.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Neueste Dateien mit Lesezeichen anheften',
                desc: 'Neueste Dateien beim Anheften von Lesezeichen einbeziehen.'
            },
            calendarEnabled: {
                name: 'Kalender aktivieren',
                desc: 'Kalenderfunktionen von Notebook Navigator aktivieren.'
            },
            calendarPlacement: {
                name: 'Kalenderposition',
                desc: 'Anzeige in der linken oder rechten Seitenleiste.',
                options: {
                    leftSidebar: 'Linke Seitenleiste',
                    rightSidebar: 'Rechte Seitenleiste'
                }
            },
            calendarLeftPlacement: {
                name: 'Einzelbereichs-Platzierung',
                desc: 'Wo der Kalender im Einzelbereichs-Modus angezeigt wird.',
                options: {
                    navigationPane: 'Navigationsbereich',
                    below: 'Unter den Bereichen'
                }
            },
            calendarLocale: {
                name: 'Gebietsschema',
                desc: 'Steuert Kalenderdatumsformat, Wochennummerierung und ersten Wochentag.',
                weekPathMismatchWarning:
                    'Der sichtbare Kalender und die Pfade f\u00fcr w\u00f6chentliche Notizen verwenden unterschiedliche Wochenanf\u00e4nge oder Wochennummerierungen.',
                options: {
                    systemDefault: 'Standard'
                }
            },
            calendarWeekendDays: {
                name: 'Wochenendtage',
                desc: 'Wochenendtage mit anderer Hintergrundfarbe anzeigen.',
                options: {
                    none: 'Keine',
                    satSun: 'Samstag und Sonntag',
                    friSat: 'Freitag und Samstag',
                    thuFri: 'Donnerstag und Freitag'
                }
            },
            calendarMonthHeadingFormat: {
                name: 'Monatsname-Format',
                desc: 'Langer (Januar) oder kurzer (Jan.) Monatsname.',
                options: {
                    full: 'Januar (voll)',
                    short: 'Jan. (kurz)'
                }
            },
            showInfoButtons: {
                name: 'Info-Schaltflächen anzeigen',
                desc: 'Info-Schaltflächen in der Suchleiste und der Kalenderüberschrift anzeigen.'
            },
            calendarWeeksToShow: {
                name: 'Angezeigte Wochen in linker Seitenleiste',
                desc: 'Der Kalender in der rechten Seitenleiste zeigt immer den vollen Monat an.',
                options: {
                    fullMonth: 'Ganzer Monat',
                    oneWeek: '1 Woche',
                    weeksCount: '{count} Wochen'
                }
            },
            calendarHighlightToday: {
                name: 'Heutiges Datum hervorheben',
                desc: 'Das heutige Datum mit einer Hintergrundfarbe und fettem Text hervorheben.'
            },
            calendarShowFeatureImage: {
                name: 'Feature-Bild anzeigen',
                desc: 'Feature-Bilder für Notizen im Kalender anzeigen.'
            },
            calendarShowTasks: {
                name: 'Aufgaben anzeigen',
                desc: 'Einen Indikator an Tagen, Wochen und Monaten mit unerledigten Aufgaben anzeigen.'
            },
            calendarShowWeekNumber: {
                name: 'Wochennummer anzeigen',
                desc: 'Spalte mit der Wochennummer hinzufügen.'
            },
            calendarShowQuarter: {
                name: 'Quartal anzeigen',
                desc: 'Quartalbezeichnung im Kalender-Header hinzufügen.'
            },
            calendarShowYearCalendar: {
                name: 'Jahreskalender anzeigen',
                desc: 'Jahresnavigation und Monatsraster in der rechten Seitenleiste anzeigen.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Vor Erstellung bestätigen',
                desc: 'Bestätigungsdialog beim Erstellen einer neuen täglichen Notiz anzeigen.'
            },
            calendarIntegrationMode: {
                name: 'Tagesnotiz-Quelle',
                desc: 'Quelle für Kalendernotizen.',
                options: {
                    dailyNotes: 'Tägliche Notizen (Core-Plug-in)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'Ordner und Datumsformat werden im Daily Notes-Core-Plugin konfiguriert.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'Gebietsschema für periodische Notizen',
                desc: 'Steuert lokalisierte Monatsnamen, Wochentagsnamen, Wochennummern und Wochenanfänge in den Pfaden für periodische Notizen von Notebook Navigator.',
                options: {
                    calendar: 'Kalender',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'Stammordner',
                desc: 'Basisordner für periodische Notizen. Datumsmuster können Unterordner enthalten. Ändert sich mit dem ausgewählten Tresorprofil.',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'Vorlagenordner',
                desc: 'Die Vorlagenauswahl zeigt Notizen aus diesem Ordner.',
                placeholder: 'Templates',
                usage: 'Wird von Kalendernotizen und Ordnernotizen verwendet. Vorlagen unter Kalender > Kalenderintegration und Ordner & Ordnernotizen > Ordnernotiz-Dateien konfigurieren.'
            },
            calendarCustomFilePattern: {
                name: 'Tägliche Notizen',
                desc: 'Pfad mit Moment-Datumsformat formatieren. Unterordnernamen in Klammern setzen, z.B. [Work]/YYYY. Klicken Sie auf das Vorlagensymbol, um eine Vorlage festzulegen. Vorlagenordner unter Dateioperationen > Vorlagen festlegen.',
                momentDescPrefix: 'Pfad formatieren mit ',
                momentLinkText: 'Moment-Datumsformat',
                momentDescSuffix:
                    '. Unterordnernamen in Klammern setzen, z.B. [Work]/YYYY. Klicken Sie auf das Vorlagensymbol, um eine Vorlage festzulegen. Vorlagenordner unter Dateioperationen > Vorlagen festlegen.',
                templaterSupportInstalled: '✅ Das Templater-Plugin ist mit voller Vorlagenunterstützung installiert.',
                templaterSupportMissing: '⚠️ Installieren Sie das Templater-Plugin für volle Vorlagenunterstützung.',
                placeholder: 'YYYY/YYYYMMDD',
                example: 'Aktuelle Syntax: {path}',
                parsingError: 'Das Muster muss als vollständiges Datum (Jahr, Monat, Tag) formatiert und wieder geparst werden können.'
            },
            calendarCustomWeekPattern: {
                name: 'Wöchentliche Notizen',
                parsingError:
                    'Das Muster muss als vollständige Woche (Wochenjahr, Wochennummer) formatiert und wieder geparst werden können.',
                weekPathMismatchWarning:
                    'Pfade f\u00fcr w\u00f6chentliche Notizen verwenden das Gebietsschema f\u00fcr periodische Notizen. Verwenden Sie \u00fcbereinstimmende Gebietsschemata oder "GGGG" mit "WW" f\u00fcr montagsbasierte Wochen.',
                mixedWeekTokensWarning:
                    'Dieses Muster mischt montagsbasierte Wochen-Token ("W" oder "G") mit gebietsschemabasierten Wochen-Token ("w" oder "g"). Verwenden Sie konsequent einen Satz: "GGGG" mit "WW" f\u00fcr montagsbasierte Wochen oder "gggg" mit "ww", wenn w\u00f6chentliche Notizen dem gew\u00e4hlten Gebietsschema folgen sollen.'
            },
            calendarCustomMonthPattern: {
                name: 'Monatliche Notizen',
                parsingError: 'Das Muster muss als vollständiger Monat (Jahr, Monat) formatiert und wieder geparst werden können.'
            },
            calendarCustomQuarterPattern: {
                name: 'Vierteljährliche Notizen',
                parsingError: 'Das Muster muss als vollständiges Quartal (Jahr, Quartal) formatiert und wieder geparst werden können.'
            },
            calendarCustomYearPattern: {
                name: 'Jährliche Notizen',
                parsingError: 'Das Muster muss als vollständiges Jahr (Jahr) formatiert und wieder geparst werden können.'
            },
            calendarTemplateFile: {
                current: 'Vorlagendatei: {name}'
            },
            showTooltips: {
                name: 'Tooltips anzeigen',
                desc: 'Zeige Hover-Tooltips mit zusätzlichen Informationen für Notizen und Ordner an.'
            },
            showTooltipPath: {
                name: 'Pfad in Tooltips anzeigen',
                desc: 'Zeigt den Ordnerpfad unter den Notiznamen in Tooltips an.'
            },
            showTooltipWordCount: {
                name: 'Wortanzahl in Tooltips anzeigen',
                desc: 'Zeigt die Wortanzahl von Notizen in Tooltips an.'
            },
            resetPaneSeparator: {
                name: 'Position des Fenstertrennelements zurücksetzen',
                desc: 'Setzt das verschiebbare Trennelement zwischen Navigationsbereich und Listenbereich auf die Standardposition zurück.',
                buttonText: 'Trennelement zurücksetzen',
                notice: 'Trennelementposition zurückgesetzt. Starten Sie Obsidian neu oder öffnen Sie Notebook Navigator erneut, um die Änderungen anzuwenden.'
            },
            settingsTransfer: {
                name: 'Einstellungen importieren und exportieren',
                desc: 'Notebook Navigator-Einstellungen als JSON exportieren oder importieren. Der Import ersetzt alle Einstellungen.',
                importButtonText: 'Importieren',
                exportButtonText: 'Exportieren',
                import: {
                    modalTitle: 'Einstellungen importieren',
                    fileButtonName: 'Aus Datei importieren',
                    fileButtonDesc: 'Eine JSON-Datei von der Festplatte laden.',
                    fileButtonText: 'Aus Datei importieren',
                    editorName: 'JSON',
                    editorDesc:
                        'JSON unten einfügen oder bearbeiten. Nicht enthaltene Einstellungen werden auf Standardwerte zurückgesetzt.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'Importieren',
                    confirmTitle: 'Einstellungen importieren?',
                    confirmMessage: 'Beim Importieren werden Ihre aktuellen Notebook Navigator-Einstellungen ersetzt.',
                    backupToggleName: 'Aktuelle Einstellungen vor dem Importieren im Stammordner des Tresors speichern',
                    backupToggleDesc: 'Erstellt eine JSON-Datei mit Zeitstempel im Stammordner des Tresors.',
                    successWithBackupNotice: 'Einstellungen importiert. Vorherige Einstellungen wurden unter {path} gespeichert.',
                    backupError: 'Aktuelle Einstellungen konnten nicht gespeichert werden: {message}',
                    successNotice: 'Einstellungen importiert.',
                    errorNotice: 'Einstellungen konnten nicht importiert werden: {message}',
                    fileReadError: 'Datei konnte nicht gelesen werden: {message}'
                },
                export: {
                    modalTitle: 'Einstellungen exportieren',
                    editorName: 'JSON',
                    editorDesc: 'Nur Einstellungen, die von den Standardwerten abweichen, sind enthalten.',
                    placeholder: '{}',
                    copyButtonText: 'In die Zwischenablage kopieren',
                    downloadButtonText: 'Herunterladen',
                    copyNotice: 'Einstellungen in die Zwischenablage kopiert.',
                    downloadNotice: 'Einstellungen exportiert.',
                    downloadError: 'Einstellungen konnten nicht heruntergeladen werden: {message}'
                }
            },
            resetAllSettings: {
                name: 'Alle Einstellungen zurücksetzen',
                desc: 'Setzt alle Notebook Navigator-Einstellungen auf die Standardwerte zurück.',
                buttonText: 'Alle Einstellungen zurücksetzen',
                confirmTitle: 'Alle Einstellungen zurücksetzen?',
                confirmMessage:
                    'Dies setzt alle Notebook Navigator-Einstellungen auf ihre Standardwerte zurück. Dies kann nicht rückgängig gemacht werden.',
                confirmButtonText: 'Alle Einstellungen zurücksetzen',
                notice: 'Alle Einstellungen zurückgesetzt. Starten Sie Obsidian neu oder öffnen Sie Notebook Navigator erneut, um die Änderungen anzuwenden.',
                error: 'Zurücksetzen der Einstellungen fehlgeschlagen.'
            },
            multiSelectModifier: {
                name: 'Mehrfachauswahl-Modifikator',
                desc: 'Wählen Sie, welche Modifikatortaste die Mehrfachauswahl umschaltet. Wenn Option/Alt ausgewählt ist, öffnet Cmd/Strg-Klick Notizen in einem neuen Tab.',
                options: {
                    cmdCtrl: 'Cmd/Strg-Klick',
                    optionAlt: 'Option/Alt-Klick'
                }
            },
            enterToOpenFiles: {
                name: 'Enter drücken zum Öffnen',
                desc: 'Dateien nur mit Enter öffnen während der Tastaturnavigation in der Liste. Unter macOS verhindert dies, dass Enter Dateien umbenennt.'
            },
            shiftEnterOpenContext: {
                name: 'Shift+Enter',
                desc: 'Festlegen, ob Shift+Enter die ausgewählte Datei öffnet oder umbenennt.'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Enter',
                desc: 'Festlegen, ob Cmd+Enter die ausgewählte Datei öffnet oder umbenennt.'
            },
            ctrlEnterOpenContext: {
                name: 'Strg+Enter',
                desc: 'Festlegen, ob Strg+Enter die ausgewählte Datei öffnet oder umbenennt.'
            },
            mouseBackForwardAction: {
                name: 'Maustasten vor/zurück',
                desc: 'Aktion für die Vor- und Zurück-Tasten der Maus auf dem Desktop.',
                options: {
                    none: 'Systemstandard verwenden',
                    singlePaneSwitch: 'Bereiche wechseln (Einzelbereich)',
                    history: 'Verlauf navigieren'
                }
            },
            excludedNotes: {
                name: 'Notizen mit Eigenschaftsregeln verstecken (Tresorprofil)',
                desc: 'Kommagetrennte Liste von Frontmatter-Regeln. Verwenden Sie `key` oder `key=value` Einträge (z.B. status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'Dateien verstecken (Tresorprofil)',
                desc: 'Kommagetrennte Liste von Dateinamenmustern zum Ausblenden. Unterstützt * Platzhalter und / Pfade (z.B. temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Tresorprofil',
                desc: 'Profile speichern Dateityp-Sichtbarkeit, versteckte Dateien, versteckte Ordner, versteckte Tags, Eigenschaftsregeln für versteckte Notizen, Verknüpfungen und Navigationsbanner. Profile können über die Kopfzeile des Navigationsbereichs gewechselt werden.',
                defaultName: 'Standard',
                addButton: 'Profil hinzufügen',
                editProfilesButton: 'Profile bearbeiten',
                addProfileOption: 'Profil hinzufügen...',
                applyButton: 'Übernehmen',
                deleteButton: 'Profil löschen',
                addModalTitle: 'Profil hinzufügen',
                editProfilesModalTitle: 'Profile bearbeiten',
                addModalPlaceholder: 'Profilname',
                deleteModalTitle: '{name} löschen',
                deleteModalMessage:
                    '{name} entfernen? Versteckte Datei-, Ordner-, Tag- und eigenschaftsbasierte Notizfilter in diesem Profil werden gelöscht.',
                moveUp: 'Nach oben',
                moveDown: 'Nach unten',
                errors: {
                    emptyName: 'Profilnamen eingeben',
                    duplicateName: 'Profilname bereits vorhanden'
                }
            },
            vaultTitle: {
                name: 'Tresortitel-Platzierung',
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
            descendantExcludedFolders: {
                name: 'Ordner aus Unterordner-Notizen ausschließen (Tresorprofil)',
                desc: 'Kommagetrennte Liste von Ordnern, die beim Sammeln von Notizen aus Unterordnern ausgelassen werden. Die Ordner bleiben sichtbar, und beim Auswählen eines Ordners werden seine Notizen weiterhin angezeigt. Verwendet dieselben Muster wie Ordner verstecken.',
                placeholder: 'daily, ressourcen, /archive'
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
                desc: 'Wählen Sie, was Notebook Navigator beim Start automatisch öffnet.',
                current: 'Aktuell: {path}',
                chooseButton: 'Datei auswählen',
                options: {
                    none: 'Keine',
                    file: 'Datei',
                    dailyNote: 'Tagesnotiz',
                    weeklyNote: 'Wochennotiz',
                    monthlyNote: 'Monatsnotiz',
                    quarterlyNote: 'Quartalsnotiz',
                    yearlyNote: 'Jahresnotiz'
                },
                file: {
                    name: 'Startseite: Startdatei',
                    empty: 'Keine Datei ausgewählt'
                },
                createMissing: {
                    name: 'Startseite: Notiz erstellen, falls nicht vorhanden',
                    desc: 'Erstellt die periodische Notiz beim Start oder per Befehl, falls sie nicht existiert.'
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
                desc: 'Zeigt klickbare Tags in Datei-Elementen an.'
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
            showFileProperties: {
                name: 'Datei-Eigenschaften anzeigen',
                desc: 'Eigenschaften in Datei-Elementen anzeigen. Wähle im Dialog "Sichtbarkeit der Eigenschaftsschlüssel" aus, welche Eigenschaften angezeigt werden.'
            },
            colorFileProperties: {
                name: 'Datei-Eigenschaften einfärben',
                desc: 'Eigenschaftsfarben auf Eigenschafts-Badges in Datei-Elementen anwenden.'
            },
            prioritizeColoredFileProperties: {
                name: 'Farbige Eigenschaften zuerst anzeigen',
                desc: 'Farbige Eigenschaften vor anderen Eigenschaften in Datei-Elementen sortieren.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Eigenschaften im Kompaktmodus anzeigen',
                desc: 'Eigenschaften anzeigen, wenn der Kompaktmodus aktiv ist.'
            },
            textCountDisplay: {
                name: 'Zähltyp',
                desc: 'Wählen Sie, welche Notizzählungen in Dateielementen angezeigt werden.',
                options: {
                    none: 'Keine',
                    words: 'Wortanzahl',
                    characters: 'Zeichenanzahl',
                    both: 'Wort- und Zeichenanzahl'
                }
            },
            textCountPlacement: {
                name: 'Platzierung',
                desc: 'Wählen Sie, wo Notizzählungen angezeigt werden.',
                options: {
                    title: 'Im Titel',
                    property: 'Als Eigenschaft'
                }
            },
            characterCountSpaces: {
                name: 'Zeichenanzahl',
                desc: 'Wählen Sie, ob Leerzeichen in der Zeichenanzahl enthalten sind.',
                options: {
                    include: 'Mit Leerzeichen',
                    exclude: 'Ohne Leerzeichen'
                }
            },
            wordCountTargetProperty: {
                name: 'Zieleigenschaft',
                desc: 'Frontmatter-Eigenschaftsschlüssel mit der Zielwortanzahl. Leer lassen, um Ziele auszublenden.'
            },
            showWordCountPercentage: {
                name: 'Zielprozentsatz anzeigen',
                desc: 'Nur den Fortschrittsprozentsatz anzeigen, wenn eine Zielwortanzahl verfügbar ist.'
            },
            propertyFields: {
                name: 'Eigenschaftsschlüssel (Tresorprofil)',
                desc: 'Frontmatter-Eigenschaftsschlüssel mit schlüsselweiser Sichtbarkeit für Navigation und Dateiliste.',
                addButtonTooltip: 'Eigenschaftsschlüssel konfigurieren',
                noneConfigured: 'Keine Eigenschaften konfiguriert',
                singleConfigured: '1 Eigenschaft konfiguriert: {properties}',
                multipleConfigured: '{count} Eigenschaften konfiguriert: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'Eigenschaften in separaten Zeilen anzeigen',
                desc: 'Jede Eigenschaft in einer eigenen Zeile anzeigen.'
            },
            enablePropertyInternalLinks: {
                name: 'Eigenschafts-Pills mit Notizen verknüpfen',
                desc: 'Auf ein Eigenschafts-Pill klicken, um die verknüpfte Notiz zu öffnen.'
            },
            enablePropertyExternalLinks: {
                name: 'Eigenschafts-Pills mit URLs verknüpfen',
                desc: 'Auf ein Eigenschafts-Pill klicken, um die verknüpfte URL zu öffnen.'
            },
            dateFormat: {
                name: 'Datumsformat',
                desc: 'Format für die Datumsanzeige (verwendet Moment-Format).',
                placeholder: 'DD.MM.YYYY',
                help: 'Gängige Formate:\nDD.MM.YYYY = 25.05.2022\nDD/MM/YYYY = 25/05/2022\nYYYY-MM-DD = 2022-05-25\n\nTokens:\nYYYY/YY = Jahr\nMMMM/MMM/MM = Monat\nDD/D = Tag\ndddd/ddd = Wochentag',
                helpTooltip: 'Format mit Moment',
                momentLinkText: 'Moment-Format'
            },
            timeFormat: {
                name: 'Zeitformat',
                desc: 'Format für die Zeitanzeige (verwendet Moment-Format).',
                placeholder: 'HH:mm',
                help: 'Gängige Formate:\nHH:mm = 14:30 (24-Stunden)\nh:mm a = 2:30 PM (12-Stunden)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nTokens:\nHH/H = 24-Stunden\nhh/h = 12-Stunden\nmm = Minuten\nss = Sekunden\na = AM/PM',
                helpTooltip: 'Format mit Moment',
                momentLinkText: 'Moment-Format'
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
            stripLatexInPreview: {
                name: 'LaTeX in Vorschauen entfernen',
                desc: 'Inline- und Block-LaTeX-Ausdrücke aus dem Vorschautext entfernen.'
            },
            previewProperties: {
                name: 'Vorschau-Eigenschaften',
                desc: 'Kommagetrennte Liste von Frontmatter-Eigenschaften für Vorschautext. Die erste Eigenschaft mit Text wird verwendet.',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'Auf Notizinhalt zurückgreifen',
                desc: 'Notizinhalt als Vorschau anzeigen, wenn keine der angegebenen Eigenschaften Text enthält.'
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
                    '2': '2 Zeilen',
                    '3': '3 Zeilen'
                }
            },
            useFolderColor: {
                name: 'Ordnerfarbe verwenden',
                desc: 'Notizentitel und Dateisymbole mit der Farbe des übergeordneten Ordners einfärben, wenn keine benutzerdefinierte Dateifarbe festgelegt ist. Priorität: Benutzerdefinierte Dateifarbe > Ordnerfarbe > Standardfarbe.'
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
                desc: 'Kommagetrennte Liste von Frontmatter-Eigenschaften, die zuerst geprüft werden. Fällt auf das erste Bild im Markdown-Inhalt zurück.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'Notizen mit Eigenschaften ausschließen',
                desc: 'Kommagetrennte Liste von Frontmatter-Eigenschaften. Notizen mit einer dieser Eigenschaften speichern keine Feature-Bilder.',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: 'Anzeigegröße des Feature-Bildes',
                desc: 'Maximale Darstellungsgröße für Feature-Bilder in Notizlisten.',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'Pixelgröße des Feature-Bildes',
                desc: 'Auflösung für gespeicherte Feature-Bild-Vorschaubilder. Erhöhen Sie diesen Wert, wenn größere Vorschauen unscharf aussehen.',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },
            downloadExternalFeatureImages: {
                name: 'Externe Bilder herunterladen',
                desc: 'Remote-Bilder und YouTube-Vorschaubilder für Feature-Bilder herunterladen.'
            },
            hideDrawingPreviewImages: {
                name: 'Exportierte Vorschaubilder ausblenden',
                desc: 'Exportierte PNG-Dateien der Zeichnungsvorschau ausblenden. Aktiviere "Versteckte Elemente anzeigen", um sie anzuzeigen.'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator zeigt von Excalidraw exportierte PNG-Dateien als Zeichnungsvorschauen an.',
                items: [
                    'Öffne in den **Excalidraw-Einstellungen** **Embedding Excalidraw into your Notes and Exporting**, dann **Export Settings**, dann **Auto-export Settings**.',
                    'Aktiviere **Auto-export PNG**. Optional kannst du **Export both dark- and light-themed image** aktivieren.',
                    'Notebook Navigator sucht nach **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** oder **Drawing.excalidraw.light.png**.',
                    'Solange **Exportierte Vorschaubilder ausblenden** aktiv ist, erscheinen die PNG-Dateien nur, wenn **Versteckte Elemente anzeigen** ebenfalls aktiv ist.'
                ]
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
            folderSortOrder: {
                name: 'Ordner-Sortierreihenfolge',
                desc: 'Klicken Sie mit der rechten Maustaste auf einen Ordner, um eine andere Sortierreihenfolge für dessen Unterordner festzulegen.',
                options: {
                    alphaAsc: 'A bis Z',
                    alphaDesc: 'Z bis A'
                }
            },
            showNoteCount: {
                name: 'Notizenzahl anzeigen',
                desc: 'Notizanzahlen neben Ordnern, Tags und Eigenschaften anzeigen.'
            },
            showSectionIcons: {
                name: 'Icons für Shortcuts und kürzliche Elemente anzeigen',
                desc: 'Icons neben Einträgen in den Bereichen Shortcuts und Zuletzt verwendet anzeigen.'
            },
            interfaceIcons: {
                name: 'Oberflächensymbole',
                desc: 'Symbole für Symbolleiste, Ordner, Tags, Eigenschaften, angeheftete Elemente, Suche und Sortierung bearbeiten.',
                buttonText: 'Symbole bearbeiten'
            },
            showIconsColorOnly: {
                name: 'Farbe nur auf Symbole anwenden',
                desc: 'Wenn aktiviert, werden benutzerdefinierte Farben nur auf Symbole angewendet. Wenn deaktiviert, werden Farben sowohl auf Symbole als auch auf Textbeschriftungen angewendet.'
            },
            navRainbowMode: {
                name: 'Regenbogen-Farbmodus (Tresorprofil)',
                desc: 'Regenbogenfarben im Navigationsbereich anwenden.',
                options: {
                    none: 'Aus',
                    foreground: 'Textfarbe',
                    background: 'Hintergrundfarbe'
                }
            },
            navRainbowFirstColor: {
                name: 'Erste Farbe',
                desc: 'Erste Farbe im Regenbogenverlauf.'
            },
            navRainbowLastColor: {
                name: 'Letzte Farbe',
                desc: 'Letzte Farbe im Regenbogenverlauf.'
            },
            navRainbowTransitionStyle: {
                name: 'Übergangsstil',
                desc: 'Interpolation zwischen der ersten und letzten Farbe.',
                options: {
                    hue: 'Farbton',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'Auf Verknüpfungen anwenden',
                desc: 'Regenbogenfarben auf Verknüpfungen anwenden.'
            },
            navRainbowApplyToRecent: {
                name: 'Auf zuletzt verwendete Elemente anwenden',
                desc: 'Regenbogenfarben auf zuletzt verwendete Elemente anwenden.'
            },
            navRainbowApplyToFolders: {
                name: 'Auf Ordner anwenden',
                desc: 'Regenbogenfarben auf Ordner anwenden.'
            },
            navRainbowFolderScope: {
                name: 'Ordnerbereich',
                desc: 'Auswählen, welche Ordnerebenen Farbzuweisungen starten.',
                options: {
                    root: 'Stammebene',
                    child: 'Unterebene',
                    all: 'Jede Ebene'
                }
            },
            navRainbowApplyToTags: {
                name: 'Auf Tags anwenden',
                desc: 'Regenbogenfarben auf Tags anwenden.'
            },
            navRainbowTagScope: {
                name: 'Tag-Bereich',
                desc: 'Auswählen, welche Tag-Ebenen Farbzuweisungen starten.',
                options: {
                    root: 'Stammebene',
                    child: 'Unterebene',
                    all: 'Jede Ebene'
                }
            },
            navRainbowApplyToProperties: {
                name: 'Auf Eigenschaften anwenden',
                desc: 'Regenbogenfarben auf Eigenschaften anwenden.'
            },
            navRainbowBalanceHueLuminance: {
                name: 'Gleichmäßige Helligkeit über Farbtöne', // (English: Consistent brightness across hues)
                desc: 'Interpoliert die Helligkeit zwischen den Start- und Endfarben bei Farbtonübergängen.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'Separate Farben für hellen und dunklen Modus', // (English: Separate light and dark mode colors)
                desc: 'Verschiedene Regenbogenfarben für den hellen und dunklen Modus verwenden.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'Farbe des hellen Modus in den dunklen Modus kopieren', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'Eigenschaftsbereich',
                desc: 'Auswählen, welche Eigenschaftsebenen Farbzuweisungen starten.',
                options: {
                    root: 'Stammebene',
                    child: 'Unterebene',
                    all: 'Jede Ebene'
                }
            },
            collapseBehavior: {
                name: 'Elemente einklappen',
                desc: 'Wählen Sie, was die Schaltfläche zum Ein-/Ausklappen beeinflusst.',
                options: {
                    all: 'Alle',
                    foldersOnly: 'Nur Ordner',
                    tagsOnly: 'Nur Tags',
                    propertiesOnly: 'Nur Eigenschaften'
                }
            },
            smartCollapse: {
                name: 'Ausgewähltes Element erweitert halten',
                desc: 'Beim Einklappen bleibt das ausgewählte Element und seine übergeordneten Elemente erweitert.'
            },
            excludeVaultRootFromCollapse: {
                name: 'Tresorverzeichnis beim Einklappen überspringen',
                desc: 'Beim Einklappen aller Elemente bleibt der Stammordner des Tresors in seinem aktuellen Zustand.'
            },
            navIndent: {
                name: 'Baum-Einrückung',
                desc: 'Passen Sie die Einrückungsbreite für verschachtelte Ordner, Tags und Eigenschaften an (Pixel).'
            },
            navItemHeight: {
                name: 'Zeilenhöhe',
                desc: 'Passen Sie die Höhe von Ordnern, Tags und Eigenschaften im Navigationsbereich an (Pixel).'
            },
            navItemHeightScaleText: {
                name: 'Text mit Zeilenhöhe skalieren',
                desc: 'Verkleinert die Navigationsschrift, wenn die Zeilenhöhe reduziert wird.'
            },
            showIndentGuides: {
                name: 'Einrückungslinien anzeigen',
                desc: 'Einrückungslinien für verschachtelte Ordner, Tags und Eigenschaften anzeigen.'
            },
            navCountLeaderStyle: {
                name: 'Führungszeichen anzeigen',
                desc: 'Punkte, Striche oder eine Linie zwischen Elementnamen und Notizanzahl anzeigen.',
                options: {
                    none: 'Keine',
                    dots: 'Punkte (...)',
                    dashes: 'Striche (---)',
                    line: 'Linie'
                }
            },
            navRootSpacing: {
                name: 'Abstand für Wurzelelemente',
                desc: 'Abstand zwischen Ordnern, Tags und Eigenschaften auf der obersten Ebene (Pixel).'
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
                desc: 'Klicken Sie mit der rechten Maustaste auf ein Tag, um eine andere Sortierreihenfolge für dessen Unterelemente festzulegen.',
                options: {
                    alphaAsc: 'A bis Z',
                    alphaDesc: 'Z bis A',
                    frequency: 'Häufigkeit',
                    lowToHigh: 'niedrig bis hoch',
                    highToLow: 'hoch bis niedrig'
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
            scopeTagsToCurrentContext: {
                name: 'Tags nach Auswahl filtern',
                desc: 'Nur Tags anzeigen, die in Notizen im ausgewählten Ordner oder der ausgewählten Eigenschaft vorkommen.'
            },
            keepEmptyTagsProperty: {
                name: 'Tags-Eigenschaft nach Entfernen des letzten Tags beibehalten',
                desc: 'Behält die Tags-Frontmatter-Eigenschaft, wenn alle Tags entfernt werden. Wenn deaktiviert, wird die Tags-Eigenschaft aus dem Frontmatter gelöscht.'
            },
            showProperties: {
                name: 'Eigenschaften anzeigen',
                desc: 'Eigenschaftsbereich im Navigator anzeigen.',
                propertyKeysInfoPrefix: 'Eigenschaften konfigurieren unter ',
                propertyKeysInfoLinkText: 'Start > Eigenschaftsschlüssel',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'Eigenschafts-Symbole anzeigen',
                desc: 'Symbole neben Eigenschaften im Navigationsbereich anzeigen.'
            },
            inheritPropertyColors: {
                name: 'Eigenschaftsfarben vererben',
                desc: 'Eigenschaftswerte erben Farbe und Hintergrund von ihrem Eigenschaftsschlüssel.'
            },
            propertySortOrder: {
                name: 'Sortierreihenfolge der Eigenschaften',
                desc: 'Rechtsklick auf eine Eigenschaft, um eine andere Sortierreihenfolge für ihre Werte festzulegen.',
                options: {
                    alphaAsc: 'A bis Z',
                    alphaDesc: 'Z bis A',
                    frequency: 'Häufigkeit',
                    lowToHigh: 'niedrig bis hoch',
                    highToLow: 'hoch bis niedrig'
                }
            },
            showAllPropertiesFolder: {
                name: 'Eigenschafts-Ordner anzeigen',
                desc: '"Eigenschaften" als einklappbaren Ordner anzeigen.'
            },
            scopePropertiesToCurrentContext: {
                name: 'Eigenschaften nach Auswahl filtern',
                desc: 'Nur Eigenschaften anzeigen, die in Notizen im ausgewählten Ordner oder dem ausgewählten Tag vorkommen.'
            },
            hiddenTags: {
                name: 'Tags verstecken (Tresorprofil)',
                desc: 'Kommagetrennte Liste von Tag-Mustern. Namensmuster: tag* (beginnt mit), *tag (endet mit). Pfadmuster: archiv (Tag und Untergeordnete), archiv/* (nur Untergeordnete), projekte/*/entwürfe (Platzhalter in der Mitte).',
                placeholder: 'archiv*, *entwurf, projekte/*/alt'
            },
            hiddenFileTags: {
                name: 'Notizen mit Tags verstecken (Tresorprofil)',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'Ordnernotizen aktivieren',
                desc: 'Ordner mit einer passenden Notizdatei werden als anklickbare Links angezeigt.'
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
                placeholder: 'index'
            },
            folderNoteNamePattern: {
                name: 'Namensmuster der Ordnernotiz',
                desc: 'Namensmuster für Ordnernotizen ohne Erweiterung. Verwende {{folder}}, um den Ordnernamen einzufügen. Wenn gesetzt, gilt der Ordnernotizname nicht.'
            },
            folderNoteTemplate: {
                name: 'Ordnernotiz-Vorlage',
                desc: 'Vorlagendatei, die beim Erstellen von Ordnernotizen verwendet wird. Markdown-Vorlagen können Templater verwenden. Canvas- und Base-Vorlagen werden als Dateiinhalt kopiert. Vorlagenordner unter Dateioperationen > Vorlagen festlegen.',
                formatWarning: 'Das Vorlagenformat muss dem ausgewählten Ordnernotiztyp entsprechen: .md, .canvas oder .base.'
            },
            enableFolderNoteLinks: {
                name: 'Ordnernamen öffnen Ordnernotizen',
                desc: 'Ein Klick auf einen Ordnernamen öffnet seine Ordnernotiz. Wenn deaktiviert, liefern Ordnernotizen nur Ordnermetadaten wie Name, Symbol und Farbe.'
            },
            hideFolderNoteInList: {
                name: 'Ordnernotizen in Liste ausblenden',
                desc: 'Ordnernotizen in der Dateiliste ausblenden.'
            },
            pinCreatedFolderNote: {
                name: 'Erstellte Ordnernotizen anheften',
                desc: 'Ordnernotizen anheften, wenn sie über das Kontextmenü erstellt werden.'
            },
            folderNoteOpenLocation: {
                name: 'Ordnernotizen öffnen in',
                desc: 'Wähle, wo Ordnernotizen beim Klicken auf Ordnernotiz-Links geöffnet werden.',
                options: {
                    currentTab: 'Aktueller Tab',
                    newTab: 'Neuer Tab',
                    rightSidebar: 'Rechte Seitenleiste'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: 'Rechte Seitenleiste: Nächste Ordnernotiz anzeigen',
                desc: 'Wenn ein Ordner ausgewählt wird, zeigt die rechte Seitenleiste automatisch die nächstgelegene übergeordnete Ordnernotiz an.'
            },
            confirmBeforeDelete: {
                name: 'Vor dem Löschen bestätigen',
                desc: 'Bestätigungsdialog beim Löschen von Notizen oder Ordnern anzeigen'
            },
            deleteAttachments: {
                name: 'Anhänge beim Löschen von Dateien löschen',
                desc: 'Verknüpfte Anhänge und generierte Zeichnungsvorschauen automatisch entfernen, wenn sie nicht anderweitig verwendet werden',
                options: {
                    ask: 'Jedes Mal fragen',
                    always: 'Immer',
                    never: 'Nie'
                }
            },
            moveFileConflicts: {
                name: 'Verschiebungskonflikte',
                desc: 'Wenn eine Datei in einen Ordner verschoben wird, in dem bereits eine Datei mit demselben Namen existiert. Jedes Mal fragen (umbenennen, überschreiben, abbrechen) oder immer umbenennen.',
                options: {
                    ask: 'Jedes Mal fragen',
                    rename: 'Immer umbenennen'
                }
            },
            metadataCleanup: {
                name: 'Metadaten bereinigen',
                desc: 'Entfernt verwaiste Metadaten, die zurückbleiben, wenn Dateien, Ordner, Tags oder Eigenschaften außerhalb von Obsidian gelöscht, verschoben oder umbenannt werden. Dies betrifft nur die Notebook Navigator Einstellungsdatei.',
                buttonText: 'Metadaten bereinigen',
                error: 'Einstellungen-Bereinigung fehlgeschlagen',
                loading: 'Metadaten werden überprüft...',
                statusClean: 'Keine Metadaten zu bereinigen',
                statusCounts:
                    'Verwaiste Elemente: {folders} Ordner, {tags} Tags, {properties} Eigenschaften, {files} Dateien, {pinned} Pins, {separators} Trennlinien'
            },
            rebuildCache: {
                name: 'Cache neu aufbauen',
                desc: 'Verwenden Sie dies, wenn Tags fehlen, Vorschauen falsch sind oder Bilder fehlen. Dies kann nach Synchronisierungskonflikten oder unerwarteten Schließungen auftreten.',
                buttonText: 'Cache neu aufbauen',
                error: 'Cache-Neuaufbau fehlgeschlagen',
                indexingTitle: 'Tresor wird indexiert...',
                progress: 'Notebook Navigator-Cache wird aktualisiert.'
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
                placeholder: 'title, name'
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
            frontmatterBackgroundField: {
                name: 'Hintergrundfeld',
                desc: 'Frontmatter-Feld für Hintergrundfarben. Leer lassen, um Hintergrundfarben aus den Einstellungen zu verwenden.',
                placeholder: 'background'
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
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'Feld für Änderungszeitstempel',
                desc: 'Frontmatter-Feldname für den Änderungszeitstempel. Leer lassen, um nur das Dateisystemdatum zu verwenden.',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'Zeitstempelformat',
                desc: 'Format zum Parsen von Zeitstempeln im Frontmatter. Leer lassen, um ISO 8601-Parsing zu verwenden.',
                helpTooltip: 'Format mit Moment',
                momentLinkText: 'Moment-Format',
                help: 'Häufige Formate:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'Entwicklung unterstützen',
                desc: 'Wenn Sie Notebook Navigator lieben, erwägen Sie bitte, die weitere Entwicklung zu unterstützen.',
                buttonText: '❤️ Sponsor',
                coffeeButton: '☕️ Spendiere mir einen Kaffee'
            },
            updateCheckOnStart: {
                name: 'Beim Start nach neuer Version suchen',
                desc: 'Prüft beim Start auf neue Plugin-Versionen und zeigt eine Benachrichtigung an, wenn ein Update verfügbar ist. Überprüfungen erfolgen höchstens einmal täglich.',
                status: 'Neue Version verfügbar: {version}'
            },
            debugLogging: {
                name: 'Start-Debugprotokollierung',
                desc: 'Schreibt Startdiagnosen in eine Markdown-Datei mit Zeitstempel im Stammverzeichnis des Vaults und stoppt, nachdem der Start abgeschlossen ist. Die Datei kann synchronisiert werden und Dateipfade enthalten.'
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
        openBannerImage: 'Release-Bannerbild öffnen',
        supportMessage: 'Wenn Sie Notebook Navigator hilfreich finden, erwägen Sie bitte, die Entwicklung zu unterstützen.',
        supportButton: 'Kauf mir einen Kaffee',
        thanksButton: 'Danke!'
    }
};
