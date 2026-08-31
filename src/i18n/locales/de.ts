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
        featureImageAlt: 'Feature-Bild', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Unbekannter Fehler', // Generic fallback when an error has no message (English: Unknown error)
        clipboardWriteError: 'Konnte nicht in Zwischenablage schreiben',
        updateBannerTitle: 'Notebook Navigator-Update verfügbar',
        updateBannerInstruction: 'In Einstellungen -> Externe Erweiterungen aktualisieren',
        previous: 'Zurück', // Generic aria label for previous navigation (English: Previous)
        next: 'Weiter' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Wähle einen Ordner oder Tag aus, um Notizen anzuzeigen', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Keine Notizen', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Angeheftet', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Notizen', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Dateien', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (ausgeblendet)', // Accessibility label applied to list items that are normally hidden
        collapseGroup: 'Gruppe einklappen',
        expandGroup: 'Gruppe ausklappen',
        manualSortTitle: 'Manuelle Sortierung: {property}',
        manualSortHint: 'Zum Neuordnen ziehen. Die Reihenfolge wird als numerische Indexwerte in der Eigenschaft „{property}“ gespeichert.',
        manualSortNonMarkdownHint: 'Nicht-Markdown-Dateien werden unten angezeigt und können nicht neu geordnet werden.',
        unsortedSection: 'Unsortiert',
        propertyGroupNoValue: 'Keine',
        manualSortDone: 'Fertig',
        manualSortMultipleWriteFailure: '{count} Dateien fehlgeschlagen; erste: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Ohne Tag', // Label for the special item showing notes without tags (English: Untagged)
        tags: 'Tags' // Label for the tags virtual folder (English: Tags)
    },

    navigationPane: {
        shortcutsHeader: 'Verknüpfungen',
        recentFilesHeader: 'Zuletzt verwendet', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Eigenschaften',
        folders: 'Ordner',
        tags: 'Tags',
        calendar: 'Kalender',
        reorderRootFoldersTitle: 'Navigation neu anordnen',
        reorderRootFoldersHint: 'Pfeile oder Ziehen zum Neuanordnen',
        vaultRootLabel: 'Vault',
        resetRootToAlpha: 'Auf alphabetische Reihenfolge zurücksetzen',
        resetRootToFrequency: 'Auf Häufigkeitsreihenfolge zurücksetzen',
        pinShortcuts: 'Verknüpfungen anheften',
        pinShortcutsAndRecentFiles: 'Verknüpfungen und zuletzt verwendete Dateien anheften',
        unpinShortcuts: 'Anheftung von Verknüpfungen aufheben',
        unpinShortcutsAndRecentFiles: 'Anheftung von Verknüpfungen und zuletzt verwendeten Dateien aufheben',
        profileMenuAria: 'Vault-Profil ändern'
    },

    navigationCalendar: {
        ariaLabel: 'Kalender',
        dailyNotesNotEnabled: 'Das Kernplugin für tägliche Notizen ist nicht aktiviert.',
        noteHiddenByProfile: 'Die Kalendernotiz ist durch das aktuelle Vault-Profil ausgeblendet.',
        createDailyNote: {
            title: 'Neue tägliche Notiz',
            message: 'Datei {filename} existiert nicht. Möchtest du sie erstellen?',
            confirmButton: 'Erstellen'
        },
        helpModal: {
            title: 'Kalender-Tastenkürzel',
            items: [
                'Klicke auf einen Tag, um eine tägliche Notiz zu öffnen oder zu erstellen. Wochen, Monate, Quartale und Jahre funktionieren genauso.',
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
        folderExists: 'Ordner bereits in Verknüpfungen vorhanden',
        noteExists: 'Notiz bereits in Verknüpfungen vorhanden',
        tagExists: 'Tag bereits in Verknüpfungen vorhanden',
        propertyExists: 'Eigenschaft bereits in Verknüpfungen vorhanden',
        invalidProperty: 'Ungültige Eigenschafts-Verknüpfung',
        searchExists: 'Such-Verknüpfung existiert bereits',
        emptySearchQuery: 'Gib eine Suchanfrage ein, bevor du sie speicherst',
        emptySearchName: 'Gib einen Namen ein, bevor du die Suche speicherst',
        add: 'Zu Verknüpfungen hinzufügen',
        addNotesCount: '{count} Notizen zu Verknüpfungen hinzufügen',
        addFilesCount: '{count} Dateien zu Verknüpfungen hinzufügen',
        rename: 'Verknüpfung umbenennen',
        remove: 'Aus Verknüpfungen entfernen',
        removeAll: 'Alle Verknüpfungen entfernen',
        removeAllConfirm: 'Alle Verknüpfungen entfernen?',
        folderNotesPinned: '{count} Ordnernotizen angeheftet'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Elemente einklappen', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'Alle Elemente ausklappen', // Tooltip for button that expands all items (English: Expand all items)
        collapseAllListGroups: 'Alle Listengruppen einklappen',
        expandAllListGroups: 'Alle Listengruppen ausklappen',
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
        resetAppearanceInDescendants: (target: string) => `Darstellung für ${target} zurücksetzen`,
        showFolders: 'Navigation anzeigen', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: 'Navigation neu anordnen',
        finishRootFolderReorder: 'Neuordnung fertig',
        showExcludedItems: 'Ausgeblendete Ordner, Tags und Notizen anzeigen', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Ausgeblendete Ordner, Tags und Notizen ausblenden', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Zweispaltige Ansicht anzeigen', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Einspaltige Ansicht anzeigen', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            'Doppelbereiche sind nicht verfügbar, wenn die Seitenleiste zu schmal ist. Um dies zu ändern, setze „Wenn Seitenleiste zu schmal ist“ in Einstellungen > Darstellung & Verhalten auf „Nichts tun“.',
        changeAppearance: 'Darstellung ändern', // Tooltip for button to change folder appearance settings (English: Change appearance)
        changeAppearanceCustomized: 'Darstellung ändern, angepasst',
        showNotesFromSubfolders: 'Notizen aus Unterordnern anzeigen',
        showFilesFromSubfolders: 'Dateien aus Unterordnern anzeigen',
        showNotesFromDescendants: 'Notizen aus Nachkommen anzeigen',
        showFilesFromDescendants: 'Dateien aus Nachkommen anzeigen',
        search: 'Suchen' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Suchen...', // Placeholder text for search input (English: Search...)
        placeholderVault: 'Vault durchsuchen...',
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Suche leeren', // Tooltip for clear search button (English: Clear search)
        switchToFilterSearch: 'Zur Filtersuche wechseln',
        switchToOmnisearch: 'Zu Omnisearch wechseln',
        saveSearchShortcut: 'Such-Verknüpfung speichern',
        removeSearchShortcut: 'Such-Verknüpfung entfernen',
        shortcutModalTitle: 'Such-Verknüpfung speichern',
        shortcutNamePlaceholder: 'Verknüpfungsnamen eingeben',
        shortcutStartIn: 'Immer starten in: {path}',
        searchHelp: 'Suchsyntax',
        searchHelpTitle: 'Suchsyntax',
        searchHelpModal: {
            intro: 'Die Filtersuche findet Notizen anhand von Anzeigenamen, Aliasnamen, Eigenschaften, Tags, Daten und Filtern, kombiniert in einer Abfrage (z.B. `meeting .status=active #work @thisweek`). Klicke auf das Sternsymbol, um eine Suche als Such-Verknüpfung zu speichern.',
            introInstallOmnisearch: 'Die Volltextsuche im Inhalt von Notizen erfordert das Omnisearch-Plugin.',
            introSwitching:
                'Wechsle zwischen Filtersuche und Omnisearch mit den Auf-/Ab-Pfeiltasten oder durch Klicken auf das Suchsymbol.',
            activeFilterSearch: 'Die Filtersuche ist aktiv.',
            activeOmnisearch: 'Omnisearch ist aktiv.',
            omnisearchIntro:
                'Omnisearch führt eine Volltextsuche über den Notizinhalt im gesamten Vault durch. Notebook Navigator zeigt die Treffer, die zum aktuellen Ordner, Tag oder zur aktuellen Auswahl gehören.',
            sections: {
                fileNames: {
                    title: 'Dateinamen und Aliasnamen',
                    items: [
                        '`word` Notizen mit "word" im Anzeigenamen oder in einem Aliasnamen finden.',
                        '`word1 word2` Jedes Wort muss im Anzeigenamen oder in den Aliasnamen vorkommen.',
                        '`-word` Notizen mit "word" im Anzeigenamen oder in einem Aliasnamen ausschließen.',
                        '`"text"` Text wörtlich finden; ein Begriff, der mit einem doppelten Anführungszeichen beginnt, wird nie als Tag, Eigenschaft, Datum oder Filter interpretiert (zum Beispiel: `".F"`).',
                        '`-"text"` Notizen mit dem wörtlichen Text im Anzeigenamen oder in einem Aliasnamen ausschließen.'
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
                        '`@13/02/2026` Numerische Formate mit Trennzeichen (`@07022026` folgt deinem Gebietsschema bei Mehrdeutigkeit).',
                        '`@2026-02-01..2026-02-07` Einen inklusiven Datumsbereich finden (offene Enden unterstützt).',
                        '`@c:...` oder `@m:...` Erstellungs- oder Änderungsdatum ansprechen.',
                        '`-@...` Ein Datum ausschließen.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'Die Abfrage wird an das Omnisearch-Plugin gesendet und folgt der Omnisearch-Abfragesyntax. Filtersuche-Token wie `#tag`, `.property` und `@date` haben keine besondere Bedeutung.',
                        'Wenn ein Ordner ausgewählt ist, wird `path:"<folder>/"` an die Abfrage angehängt, damit Omnisearch in diesem Ordner und seinen Unterordnern sucht. Abfragen, die bereits `path:` enthalten, werden unverändert gesendet.',
                        'Omnisearch gibt höchstens 50 nach Relevanz sortierte Ergebnisse zurück. Bei Suchen mit mehr Treffern fehlen die niedriger eingestuften Notizen.',
                        'Das Eingrenzen auf Ordnerpfade mit Nicht-ASCII-Zeichen erfordert Omnisearch 1.30.0 oder neuer. Ältere Versionen durchsuchen den gesamten Vault, und die Ergebnisse werden anschließend auf den Ordner gefiltert.',
                        'Abfragen mit weniger als 3 Zeichen können in großen Vaults langsam sein.',
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
            openToRight: 'Rechts davon öffnen',
            openInNewWindow: 'In neuem Fenster öffnen',
            openMultipleInNewTabs: '{count} Notizen in neuen Tabs öffnen',
            openMultipleToRight: '{count} Notizen rechts öffnen',
            openMultipleInNewWindows: '{count} Notizen in neuen Fenstern öffnen',
            pinNote: 'Notiz anheften',
            unpinNote: 'Anheftung aufheben',
            pinMultipleNotes: '{count} Notizen anheften',
            unpinMultipleNotes: 'Anheftung von {count} Notizen aufheben',
            duplicateNote: 'Notiz duplizieren',
            duplicateMultipleNotes: '{count} Notizen duplizieren',
            openVersionHistory: 'Versionsverlauf öffnen',
            revealInFolder: 'Im Ordner anzeigen',
            revealInFinder: 'Im Finder anzeigen',
            showInExplorer: 'Im Explorer anzeigen',
            openInDefaultApp: 'Mit Standard-Anwendung öffnen',
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
            unpinFile: 'Anheftung aufheben',
            pinMultipleFiles: '{count} Dateien anheften',
            unpinMultipleFiles: 'Anheftung von {count} Dateien aufheben',
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
            newCanvas: 'Neuer Canvas',
            newBase: 'Neue Base',
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
            excludeFolder: 'Ordner ausblenden',
            unhideFolder: 'Ordner einblenden',
            hideRootFolder: 'Wurzelordner ausblenden',
            showRootFolder: 'Wurzelordner anzeigen',
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
        copy: {
            title: 'Kopieren',
            noteLink: 'Notiz-Link',
            fileLink: 'Datei-Link',
            noteLinkAsFootnote: 'Notiz-Link als Fußnote',
            fileLinkAsFootnote: 'Datei-Link als Fußnote',
            noteEmbed: 'Notiz-Einbettung',
            fileEmbed: 'Datei-Einbettung',
            obsidianUrl: 'Obsidian-URL',
            pathFromVaultFolder: 'Pfad vom Vault-Ordner',
            pathFromSystemRoot: 'Pfad vom Systemstammverzeichnis'
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
        titleRows: {
            label: 'Titelzeilen',
            option: (rows: number) => `${rows} Titelzeile${rows === 1 ? '' : 'n'}`
        },
        previewRows: {
            label: 'Vorschauzeilen',
            none: 'Keine',
            option: (rows: number) => `${rows} Vorschauzeile${rows === 1 ? '' : 'n'}`
        },
        groupBy: 'Gruppieren nach',
        tags: 'Tags',
        properties: 'Eigenschaften',
        tasks: 'Aufgaben',
        date: 'Datum',
        parentFolder: 'Übergeordneter Ordner',
        textCount: {
            label: 'Textzählung',
            options: {
                none: 'Keine',
                words: 'Wörter',
                characters: 'Zeichen',
                both: 'Wörter und Zeichen'
            }
        },
        resetAppearance: 'Darstellung zurücksetzen',
        openPluginSettings: 'Plugin-Einstellungen öffnen…'
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Anwenden',
            applySortAndGroupTitle: (target: string) => `Sortierung und Gruppierung auf ${target} anwenden?`,
            applyAppearanceTitle: (target: string) => `Darstellung auf ${target} anwenden?`,
            resetAppearanceTitle: (target: string) => `Darstellung für ${target} zurücksetzen?`,
            applyAppearanceMessage: (count: number, replacedCount: number) =>
                `Die Darstellung ändert sich für ${count} ${count === 1 ? 'Element' : 'Elemente'}. Ersetzte vorhandene Anpassungen: ${replacedCount}. Gespeicherte Darstellungseinstellungen werden einmalig kopiert; Sortierung und Gruppierung bleiben erhalten. Künftige Änderungen und neue Unterelemente sind nicht verknüpft.`,
            resetAppearanceMessage: (count: number) =>
                `Die Darstellung wird für ${count} ${count === 1 ? 'Element' : 'Elemente'} zurückgesetzt. Sortierung und Gruppierung bleiben erhalten. Dies ist eine einmalige Änderung; künftige Änderungen und neue Unterelemente sind nicht verknüpft.`,
            affectedCountMessage: (count: number) => `Vorhandene Überschreibungen, die sich ändern: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'Manuelle Sortierung verwenden?',
            propertySortMessage: (property: string, count: number) =>
                `Wechselt die aktuelle Ansicht zur manuellen Sortierung mit „${property}“. Beim Bearbeiten der Reihenfolge werden numerische Indexwerte bei Bedarf in diese Eigenschaft in ${count} ${count === 1 ? 'Notiz' : 'Notizen'} geschrieben.`,
            propertySortConfirmButton: 'Manuelle Sortierung verwenden',
            removePropertyTitle: 'Sortier-Eigenschaft entfernen?',
            removePropertyMessage: (property: string, count: number) =>
                `Entfernt „${property}“ aus ${count} ${count === 1 ? 'Notiz' : 'Notizen'} in der aktuellen Liste. Die manuelle Sortierreihenfolge dieser Notizen wird gelöscht.`,
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
                'Wenn dieses Feld leer ist, verwendet das Gruppenziel die Zieleigenschaft aus Einstellungen > Dateianzeige > Wort- und Zeichenanzahl. Überschreibe sie, indem du einen Zielwert für diese Gruppe festlegst.',
            description: 'Passe die Gruppenüberschrift für diese Notiz an. Lass den Titel leer, um die Überschrift zu entfernen.'
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
            emptyStateSearch: 'Beginne zu tippen, um Symbole zu suchen',
            emptyStateNoResults: 'Keine Symbole gefunden',
            showingResultsInfo: 'Zeige 50 von {count} Ergebnissen. Gib mehr ein, um die Suche einzugrenzen.',
            emojiInstructions: 'Gib ein Emoji ein oder füge es ein, um es als Symbol zu verwenden',
            removeIcon: 'Symbol entfernen',
            removeFromRecents: 'Aus den kürzlich verwendeten Symbolen entfernen',
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
                'nav-recent-files': 'Zuletzt verwendet',
                'nav-expand-all': 'Alle ausklappen',
                'nav-collapse-all': 'Alle einklappen',
                'nav-calendar': 'Kalender',
                'nav-tree-expand': 'Baumpfeil: ausklappen',
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
                'list-expand-all': 'Alle Gruppen ausklappen',
                'list-collapse-all': 'Alle Gruppen einklappen',
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
                'file-unfinished-task': 'Aufgaben',
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
            pasteInvalidFormat: 'Hex-Farbwert erwartet',
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
            title: 'Vault-Profil wechseln',
            currentBadge: 'Aktiv',
            emptyState: 'Keine Vault-Profile verfügbar.'
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
            invalidTagName: 'Gib einen gültigen Tag-Namen ein.',
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
            invalidKeyName: 'Gib einen gültigen Eigenschaftsnamen ein.'
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
            hideInOtherVaultProfiles: 'In anderen Vault-Profilen ausblenden',
            renamePrompt: 'Neuen Namen eingeben:',
            renameVaultTitle: 'Anzeigenamen des Vaults ändern',
            renameVaultPrompt: 'Benutzerdefinierten Anzeigenamen eingeben (leer lassen für Standard):',
            deleteFolderConfirm: 'Bist du sicher, dass du diesen Ordner und seinen gesamten Inhalt löschen möchtest?',
            deleteFileConfirm: 'Bist du sicher, dass du diese Datei löschen möchtest?',
            deleteFileAttachmentsDescriptionSingle: 'Dieser Anhang wird in keiner Notiz mehr verwendet. Möchtest du ihn löschen?',
            deleteFileAttachmentsDescriptionMultiple: 'Diese Anhänge werden in keiner Notiz mehr verwendet. Möchtest du sie löschen?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Dateibaum',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Galerie',
            moveFileConflictDescriptionSingle: 'Ein Dateikonflikt wurde in „{folder}“ gefunden.',
            moveFileConflictDescriptionMultiple: '{count} Dateikonflikte wurden in „{folder}“ gefunden.',
            moveFileConflictAffectedFiles: 'Betroffene Dateien',
            moveFileConflictItem: '„{name}“ -> „{suggested}“{renameOnly}',
            moveFileConflictRenameOnly: '(nur umbenennen)',
            moveFileConflictRename: 'Umbenennen',
            moveFileConflictOverwrite: 'Überschreiben',
            removeAllTagsTitle: 'Alle Tags entfernen',
            removeAllTagsFromNote: 'Bist du sicher, dass du alle Tags von dieser Notiz entfernen möchtest?',
            removeAllTagsFromNotes: 'Bist du sicher, dass du alle Tags von {count} Notizen entfernen möchtest?'
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
                'Steuere, wo Eigenschaftswerte angezeigt werden. Die Spalten entsprechen dem Navigationsbereich, dem Listenbereich und dem Datei-Kontextmenü. Verwende die untere Zeile, um alle Zeilen einer Spalte umzuschalten.',
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
                'Hallo und herzlich willkommen bei Notebook Navigator, einem besseren Dateibrowser und Kalender für Obsidian. Bevor du loslegst, empfehle ich dir wirklich, mindestens die ersten drei Kapitel des Videos unten, Mastering Notebook Navigator, anzusehen. Dort erfährst du, wie die beiden Bereiche funktionieren und wie du schnell einsteigen kannst.',
            continueText:
                'Wenn du dann noch zehn Minuten Zeit hast, schau dir auch die Kapitel zur Ersteinrichtung und zum täglichen Ablauf an. Damit hast du alles, was du für den Einstieg brauchst, und kannst später zurückkehren, um dir weitere Details anzusehen. Einen Link zum Video findest du oben in den Einstellungen von Notebook Navigator.',
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
            versionHistoryNotFound: 'Versionsverlauf-Befehl nicht gefunden. Stelle sicher, dass Obsidian Sync aktiviert ist.',
            revealInExplorer: 'Datei konnte nicht im Explorer angezeigt werden: {error}',
            openInDefaultApp: 'Öffnen in Standard-App fehlgeschlagen: {error}',
            openInDefaultAppNotAvailable: 'Öffnen in Standard-App ist auf dieser Plattform nicht verfügbar',
            folderNoteAlreadyExists: 'Ordnernotiz existiert bereits',
            folderAlreadyExists: 'Ordner "{name}" existiert bereits',
            folderNotesDisabled: 'Aktiviere Ordnernotizen in den Einstellungen, um Dateien zu konvertieren',
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
            linkCopied: 'Link in die Zwischenablage kopiert',
            footnoteLinkCopied: 'Fußnoten-Link in die Zwischenablage kopiert',
            embedLinkCopied: 'Einbettungs-Link in die Zwischenablage kopiert',
            tagAddedToNote: 'Tag zu 1 Notiz hinzugefügt',
            tagAddedToNotes: 'Tag zu {count} Notizen hinzugefügt',
            tagRemovedFromNote: 'Tag von 1 Notiz entfernt',
            tagRemovedFromNotes: 'Tag von {count} Notizen entfernt',
            tagsClearedFromNote: 'Alle Tags von 1 Notiz entfernt',
            tagsClearedFromNotes: 'Alle Tags von {count} Notizen entfernt',
            noTagsToRemove: 'Keine Tags zum Entfernen',
            noFilesSelected: 'Keine Dateien ausgewählt',
            mergeNotesRequireMultipleMarkdown: 'Wähle mindestens zwei Markdown-Notizen zum Zusammenführen aus',
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
            hiddenFileReveal: 'Datei ist ausgeblendet. Aktiviere „Ausgeblendete Elemente anzeigen“, um sie anzuzeigen'
        },
        confirmations: {
            deleteMultipleFiles: 'Möchtest du wirklich {count} Dateien löschen?',
            deleteConfirmation: 'Diese Aktion kann nicht rückgängig gemacht werden.'
        },
        defaultNames: {
            untitled: 'Unbenannt'
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
        future: 'Zukunft',
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
        searchVaultRoot: 'Gesamten Vault durchsuchen', // Command palette: Selects the vault root folder and focuses search with subfolders included (English: Search whole vault)
        toggleDualPane: 'Doppelbereichslayout umschalten', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        toggleDualPaneOrientation: 'Doppelbereich-Ausrichtung umschalten', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'Kalender umschalten', // Command palette: Toggles showing the calendar overlay in the navigation pane (English: Toggle calendar)
        selectVaultProfile: 'Vault-Profil wechseln', // Command palette: Opens a modal to choose a different vault profile (English: Switch vault profile)
        selectVaultProfile1: 'Vault-Profil 1 auswählen', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Vault-Profil 2 auswählen', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Vault-Profil 3 auswählen', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Dateien löschen', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Neue Notiz erstellen', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Neue Notiz aus Vorlage erstellen', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
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
        addShortcut: 'Zu Verknüpfungen hinzufügen', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: 'Verknüpfung {number} öffnen',
        toggleDescendants: 'Nachkommen umschalten', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Ausgeblendete Ordner, Tags und Notizen umschalten', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Tag-Sortierung umschalten', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: 'Tags nach Auswahl umschalten',
        togglePropertiesBySelection: 'Eigenschaften nach Auswahl umschalten',
        toggleCompactMode: 'Kompaktmodus umschalten', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Angehefteten Bereich umschalten',
        collapseExpand: 'Alle Navigationselemente ein-/ausklappen', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all navigation items)
        collapseExpandListGroups: 'Alle Listengruppen ein-/ausklappen',
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
            'Notebook Navigator konnte seine Einstellungen nicht lesen und wurde nicht gestartet. Wenn dein Vault synchronisiert wird, starte Obsidian nach Abschluss der Synchronisierung neu. Um mit Standardeinstellungen neu zu beginnen, führe den Befehl „Standardeinstellungen wiederherstellen“ aus.', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsMissingConfirm: {
            title: 'Mit Standardeinstellungen starten?', // Title of the dialog shown when the plugin is enabled while its settings file is missing (English: Start with default settings?)
            messageRecentInstall:
                'Notebook Navigator wurde gerade installiert und hat keine Einstellungsdatei. Wenn dies eine Neuinstallation oder eine erneute Installation ist, fahre mit den Standardeinstellungen fort. Wenn deine Einstellungen von einem Synchronisierungsdienst stammen, brich ab, warte das Ende der Synchronisierung ab und starte Obsidian neu.', // Dialog message when the plugin folder was written recently (English: Notebook Navigator was just installed and has no settings file. If this is a new install or a reinstall, continue with default settings. If your settings come from a sync service, cancel, wait for the sync to complete, and restart Obsidian.)
            messageExistingInstall:
                'Notebook Navigator ist auf diesem Gerät schon länger installiert, aber die Einstellungsdatei fehlt. Wenn dein Vault noch synchronisiert wird, brich ab, warte das Ende der Synchronisierung ab und starte Obsidian neu, um deine bestehenden Einstellungen zu behalten. Fahre nur fort, um mit den Standardeinstellungen neu zu beginnen.', // Dialog message when the plugin folder has existed for a while (English: Notebook Navigator has been installed on this device for a while, but its settings file is missing. If your vault is still syncing, cancel, wait for the sync to complete, and restart Obsidian to keep your existing settings. Continue only to start over with default settings.)
            confirmButton: 'Standardeinstellungen verwenden' // Confirm button label in the missing-settings dialog (English: Use default settings)
        },
        settingsRecovery: {
            confirmTitle: 'Standardeinstellungen wiederherstellen', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'Dies ersetzt die Einstellungsdatei von Notebook Navigator durch Standardeinstellungen. Wenn dein Vault noch synchronisiert wird, können die wiederhergestellten Standardwerte die auf deinen anderen Geräten gespeicherten Einstellungen überschreiben. Eine lesbare Einstellungsdatei wird zuvor in eine Sicherungsdatei mit Zeitstempel im Plugin-Ordner kopiert.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'Standardwerte wiederherstellen', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice:
                'Die Wiederherstellung der Einstellungen konnte nicht abgeschlossen werden. Lokale Einstellungen wurden beibehalten.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'Standardeinstellungen wiederhergestellt. Starte Obsidian neu, um den Vorgang abzuschließen.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
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
        wordCount: 'Wortanzahl',
        unfinishedTasks: 'Unerledigte Aufgaben'
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
            exportSuccess: 'Bericht über fehlgeschlagene Metadaten exportiert nach: {filename}',
            exportFailed: 'Export des Metadaten-Berichts fehlgeschlagen'
        },
        index: {
            label: 'Allgemein',
            description: 'Versionshinweise, Support, Vault-Profil, Dateitypen und Eigenschaftsschlüssel.',
            groups: {
                about: 'Über'
            }
        },
        pageGroups: {
            configuration: 'Konfiguration',
            navigationPane: 'Navigationsbereich',
            listPane: 'Listenbereich',
            calendarAndTools: 'Kalender und Werkzeuge'
        },
        pages: {
            displayFilters: {
                label: 'Anzeigefilter',
                description: 'Ausgeblendete Ordner, Tags, Dateien, Datei-Tags und Eigenschaftsregeln.'
            },
            appearanceAndBehavior: {
                label: 'Darstellung & Verhalten',
                description: 'Verhalten, Tastaturnavigation, Maustasten, Darstellung und Formatierung.',
                groups: {
                    startup: 'Start',
                    keyboardNavigation: 'Tastaturnavigation',
                    mouseButtons: 'Maustasten',
                    desktopAppearance: 'Desktop-Darstellung',
                    mobileAppearance: 'Mobile Darstellung',
                    appearance: 'Darstellung',
                    icons: 'Symbole',
                    formatting: 'Formatierung'
                }
            },
            navigationPane: {
                label: 'Navigationsbereich',
                description: 'Layout, Darstellung, Dateianzahl, Einklappverhalten und Regenbogenfarben.',
                groups: {
                    appearance: 'Darstellung',
                    banner: 'Banner',
                    collapseItems: 'Elemente einklappen',
                    dragAndDrop: 'Drag-and-drop',
                    fileCounts: 'Dateianzahlen',
                    rainbowColors: 'Regenbogenfarben'
                }
            },
            shortcutsAndRecentFiles: {
                label: 'Verknüpfungen & zuletzt verwendete Dateien',
                description: 'Verknüpfungssichtbarkeit, Abzeichen, zuletzt verwendete Dateien und angeheftete Elemente.',
                groups: {
                    shortcuts: 'Verknüpfungen',
                    recentFiles: 'Zuletzt verwendet'
                }
            },
            foldersAndFolderNotes: {
                label: 'Ordner & Ordnernotizen',
                description: 'Ordneranzeige, Ordnernotizen, Ordnernotiz-Vorlagen und Ordnernotiz-Verhalten.',
                groups: {
                    folders: 'Ordner',
                    folderNotes: 'Ordnernotizen',
                    folderNoteFiles: 'Ordnernotiz-Dateien'
                }
            },
            tagsAndProperties: {
                label: 'Tags & Eigenschaften',
                description: 'Tag- und Eigenschaftsbereiche, Symbole, Sortierung, Geltungsbereich und Vererbung.',
                groups: {
                    tags: 'Tags',
                    properties: 'Eigenschaften'
                }
            },
            listPane: {
                label: 'Listenbereich',
                description: 'Sortierung, Gruppierung, Listenmodi, angeheftete Notizen und Zeichnungsvorschauen.',
                groups: {
                    appearance: 'Darstellung',
                    sortAndGroup: 'Sortierung & Gruppierung',
                    groupHeaders: 'Gruppenüberschriften',
                    manualSort: 'Manuelle Sortierung',
                    pinnedNotes: 'Angeheftete Notizen',
                    behavior: 'Verhalten',
                    drawingPreviews: 'Zeichnungsvorschauen'
                }
            },
            fileOperations: {
                label: 'Dateioperationen',
                description: 'Vorlagen, Löschbestätigungen, Anhänge und Verhalten bei Dateikonflikten beim Verschieben.',
                groups: {
                    templates: 'Vorlagen'
                }
            },
            frontmatterFields: {
                label: 'Frontmatter-Felder',
                description: 'Frontmatter-Felder für Anzeigenamen, Zeitstempel, Symbole und Farben.'
            },
            fileDisplay: {
                label: 'Dateianzeige',
                description: 'Titel, Vorschautext, Feature-Bilder, Tags, Eigenschaften, Daten, Wortanzahlen und Zeichenanzahlen.',
                groups: {
                    icon: 'Symbol',
                    title: 'Titel',
                    previewText: 'Vorschautext',
                    featureImage: 'Feature-Bild',
                    tags: 'Tags',
                    properties: 'Eigenschaften',
                    tasks: 'Aufgaben',
                    date: 'Datum',
                    parentFolder: 'Übergeordneter Ordner',
                    wordAndCharacterCount: 'Wort- und Zeichenanzahl'
                }
            },
            calendar: {
                label: 'Kalender',
                description: 'Kalenderanzeige, Datumsnotizen, Vorlagen, Sprachumgebung und Seitenleistenposition.',
                groups: {
                    appearance: 'Darstellung',
                    leftSidebar: 'Linke Seitenleiste',
                    calendarIntegration: 'Kalenderintegration',
                    rightSidebar: 'Rechte Seitenleiste'
                }
            },
            iconPacks: {
                label: 'Symbolpakete',
                description: 'Oberflächensymbole, Dateisymbole und Symbolpaket-Verwaltung.'
            },
            advanced: {
                label: 'Erweitert',
                description: 'Diagnose, Metadatenbereinigung, Import/Export und Zurücksetzen.',
                groups: {
                    maintenance: 'Wartung',
                    resetSettings: 'Einstellungen zurücksetzen'
                }
            }
        },
        syncMode: {
            notSynced: '(nicht synchronisiert)',
            enableSync: 'Synchronisierung aktivieren',
            disableSync: 'Synchronisierung deaktivieren'
        },
        items: {
            listPaneTitle: {
                name: 'Titel des Listenbereichs',
                desc: 'Wähle, wo der Titel des Listenbereichs angezeigt wird.',
                options: {
                    header: 'Im Kopfbereich anzeigen',
                    listPane: 'Im Listenbereich anzeigen',
                    hidden: 'Nicht anzeigen'
                }
            },
            defaultSortOrder: {
                name: 'Standard-Sortierreihenfolge',
                desc: 'Wähle die Standard-Sortierreihenfolge für Notizen. Eigenschaften aus Sortiereigenschaften erscheinen als zusätzliche Sortieroptionen.',
                directions: {
                    asc: 'Aufsteigend',
                    desc: 'Absteigend'
                },
                dateDirections: {
                    newestOnTop: 'Neueste oben',
                    oldestOnTop: 'Älteste oben'
                },
                textDirections: {
                    aOnTop: 'A oben',
                    zOnTop: 'Z oben'
                },
                fields: {
                    dateEdited: 'Bearbeitungsdatum',
                    dateCreated: 'Erstellungsdatum',
                    title: 'Titel',
                    fileName: 'Dateiname',
                    property: 'Eigenschaft'
                }
            },
            defaultSortDirection: {
                name: 'Sortierrichtung'
            },
            defaultGroupingDirection: {
                name: 'Gruppierungsrichtung',
                options: {
                    follow: 'Sortierreihenfolge folgen'
                }
            },
            sortingProperties: {
                name: 'Sortiereigenschaften',
                desc: 'Kommagetrennte Frontmatter-Eigenschaften. Jede Eigenschaft erscheint als Sortieroption in der Einstellung Standard-Sortierreihenfolge und im Sortiermenü des Listenbereichs. Diese Eigenschaften werden nicht geändert.',
                placeholder: 'published, author',
                defaultsResetNotices: {
                    sort: 'Die Standard-Sortierreihenfolge wurde zurückgesetzt, weil ihre Eigenschaft nicht mehr verfügbar ist.',
                    grouping: 'Die Standardgruppierung wurde zurückgesetzt, weil ihre Eigenschaft nicht mehr verfügbar ist.',
                    both: 'Standard-Sortierreihenfolge und Standardgruppierung wurden zurückgesetzt, weil ihre Eigenschaften nicht mehr verfügbar sind.'
                }
            },
            propertySecondarySort: {
                name: 'Sekundäre Sortierung',
                desc: 'Wird bei der Eigenschafts-Sortierung verwendet, wenn Notizen denselben Eigenschaftswert oder keinen Eigenschaftswert haben.',
                options: {
                    title: 'Titel',
                    fileName: 'Dateiname',
                    dateCreated: 'Erstellungsdatum',
                    dateEdited: 'Bearbeitungsdatum'
                }
            },
            propertySortInstructions: {
                intro: 'So funktionieren Sortierung und Gruppierung nach einer Eigenschaft:',
                items: [
                    '**Sortierung:** Die Auswahl einer Eigenschaft wie Priorität sortiert Notizen nach ihren Prioritätswerten.',
                    '**Gruppierung:** Die Auswahl einer Eigenschaft wie Status erstellt für jeden Statuswert eine Überschrift. Notizen mit demselben Status erscheinen unter derselben Überschrift.',
                    '**Mehrere Werte:** Wenn eine Eigenschaft eine Liste enthält, verwendet Notebook Navigator die vollständige Liste. Enthält Themen zum Beispiel Bücher und Geschichte, wird die Notiz anhand von „Bücher, Geschichte“ sortiert oder gruppiert und nicht nach jedem Thema einzeln.',
                    '**Fehlende Werte:** Beim Gruppieren erscheinen Notizen ohne die Eigenschaft am Ende unter **Keine**.',
                    '**Tag- und Eigenschaftsansichten:** Wenn **Ordner** als Gruppierung ausgewählt ist, werden stattdessen Datumsüberschriften angezeigt.'
                ]
            },
            groupingProperties: {
                name: 'Gruppierungseigenschaften',
                desc: 'Kommagetrennte Frontmatter-Eigenschaften. Jede Eigenschaft erscheint als Gruppierungsoption in der Einstellung Standardgruppierung und im Sortiermenü des Listenbereichs. Diese Eigenschaften werden nicht geändert.',
                placeholder: 'status, genre'
            },
            manualSortProperty: {
                name: 'Eigenschaft für manuelle Sortierung',
                desc: 'Frontmatter-Eigenschaft zum Speichern der numerischen Indexwerte für die manuelle Sortierung.'
            },
            groupHeaderProperty: {
                name: 'Eigenschaft für Gruppenüberschriften',
                desc: 'Frontmatter-Eigenschaft zum Speichern der benutzerdefinierten Gruppenüberschriften.'
            },
            groupHeadersInstructions: {
                intro: 'Benutzerdefinierte Gruppenüberschriften werden über Notizen im Listenbereich angezeigt.',
                items: [
                    'Stelle im Sortiermenü des Listenbereichs die Gruppierung auf **Benutzerdefiniert**.',
                    'Klicke mit der rechten Maustaste auf eine Notiz und wähle **Gruppenüberschrift festlegen**, um eine Überschrift darüber hinzuzufügen.'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'Platzierung neuer Notizen',
                desc: 'Wähle, wo neue Notizen platziert werden, wenn die aktuelle Liste die manuelle Sortierung verwendet.',
                options: {
                    top: 'Oben',
                    bottom: 'Unten',
                    belowSelectedNote: 'Unter ausgewählter Notiz',
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
                    'Aktiviere die manuelle Sortierung, indem du **Manuelle Sortierung** aus dem Sortiermenü wählst. Danach gibt es zwei Möglichkeiten, Notizen neu anzuordnen.',
                    'Wähle **Sortierreihenfolge bearbeiten...** aus dem Sortiermenü, um eine Neuordnungsansicht zu öffnen. Ziehe Notizen mit der Maus oder per Touch auf Mobilgeräten. Auf dem Desktop wählt **Cmd/Ctrl**- oder **Shift**-Klick mehrere Notizen aus; das Ziehen einer beliebigen verschiebt dann die gesamte Gruppe.',
                    'Wähle im Listenbereich eine Notiz aus oder markiere mehrere und drücke **Cmd/Ctrl + Arrow Up/Down**, um die Auswahl nach oben oder unten zu verschieben.'
                ]
            },
            scrollToSelectedFileOnListChanges: {
                name: 'Zu ausgewählter Datei bei Listenänderungen scrollen',
                desc: 'Zur ausgewählten Datei scrollen beim Anheften von Notizen, Anzeigen von Unternotizen, Ändern der Ordnerdarstellung oder bei Dateioperationen.'
            },
            includeDescendantNotes: {
                name: 'Notizen aus Unterordnern / Nachkommen anzeigen',
                desc: 'Beim Anzeigen eines Ordners, Tags oder einer Eigenschaft Notizen aus Unterordnern sowie Tag- und Eigenschafts-Nachkommen einbeziehen.'
            },
            filterPinnedNotesByFolder: {
                name: 'Notizen nur in ihrem Ordner anheften',
                desc: 'Angeheftete Notizen erscheinen nur in ihrem eigenen Ordner als angeheftet. Nützlich für Ordnernotizen oder bei vielen angehefteten Notizen. Hat keinen Einfluss auf Tag- oder Eigenschaftsansichten.'
            },
            separateFileCounts: {
                name: 'Aktuelle und Nachkommen-Dateianzahl getrennt anzeigen',
                desc: 'Zeigt Dateianzahlen als "aktuell ▾ Nachkommen" für Ordner, Tags und Eigenschaften.'
            },
            defaultGrouping: {
                name: 'Standardgruppierung',
                desc: 'Ohne Gruppierung bleibt die sortierte Liste flach. **Überschriften** kommentieren die sortierte Liste, ohne ihre Reihenfolge zu ändern: Benutzerdefiniert zeigt im Frontmatter definierte Überschriften, Datum fügt Datumsüberschriften ein. **Gruppen** ordnen die Liste neu: Ordner- und Eigenschaftsgruppen werden eigenständig geordnet, und die Notizen in jeder Gruppe folgen der Sortierreihenfolge.',
                families: {
                    headers: 'Überschriften',
                    groups: 'Gruppen'
                },
                options: {
                    none: 'Nicht gruppieren',
                    custom: 'Benutzerdefiniert',
                    date: 'Datum',
                    folder: 'Ordner'
                }
            },
            alwaysShowAllTagAndPropertyPills: {
                name: 'Tag- und Eigenschaftspillen immer anzeigen',
                desc: 'Wenn deaktiviert, werden Pillen ausgeblendet, die der aktuellen Navigationsauswahl entsprechen (z. B. wird die „Rezepte“-Tag-Pille beim Durchsuchen des „Rezepte“-Tags ausgeblendet). Aktivieren, um alle Pillen sichtbar zu halten.'
            },
            stickyGroupHeaders: {
                name: 'Gruppenüberschriften fixieren',
                desc: 'Hält die aktuelle Datums-, Ordner-, Eigenschafts- oder Anheftbereichsüberschrift beim Scrollen sichtbar.'
            },
            showSubfolderPaths: {
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
            unfinishedTaskIcon: {
                name: 'Unerledigte-Aufgaben-Symbol',
                desc: 'Das Dateisymbol ersetzen, wenn eine Notiz unerledigte Aufgaben enthält.',
                options: {
                    disabled: 'Deaktiviert',
                    compact: 'Kompaktmodus',
                    standardAndCompact: 'Standard und kompakt'
                }
            },
            useFolderIcon: {
                name: 'Ordnersymbol verwenden',
                desc: 'Das Symbol des übergeordneten Ordners anzeigen, wenn kein benutzerdefiniertes Dateisymbol festgelegt ist. Die Ordnerfarbe wird verwendet, wenn keine benutzerdefinierte Dateifarbe festgelegt ist.'
            },
            showFileTaskProgress: {
                name: 'Aufgabenfortschritt',
                desc: 'Den Aufgabenstatus mit optionalem Fortschrittsbalken und optionaler Aufgabenanzahl anzeigen. Farben für unerledigte und erledigte Aufgaben können im Style-Settings-Plugin einzeln festgelegt werden.'
            },
            showFileTaskProgressBar: {
                name: 'Aufgabenfortschritt: Fortschrittsbalken',
                desc: 'Einen Fortschrittsbalken neben dem Aufgabensymbol anzeigen.'
            },
            showFileTaskProgressCount: {
                name: 'Aufgabenfortschritt: Aufgabenanzahl',
                desc: 'Die Anzahl der erledigten und die Gesamtzahl der Aufgaben anzeigen, z. B. 3/7.'
            },
            hideFileTaskProgressWhenComplete: {
                name: 'Aufgabenfortschritt: bei Abschluss ausblenden',
                desc: 'Den Aufgabenfortschritt ausblenden, wenn alle Aufgaben einer Notiz erledigt sind.'
            },
            unfinishedTaskBackground: {
                name: 'Unerledigte-Aufgaben-Hintergrund',
                desc: 'Eine Hintergrundfarbe anwenden, wenn eine Notiz unerledigte Aufgaben enthält.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'Hintergrundfarbe für unerledigte Aufgaben',
                desc: 'Die Hintergrundfarbe festlegen, die verwendet wird, wenn eine Notiz unerledigte Aufgaben enthält.'
            },
            showFileNameIcons: {
                name: 'Symbole nach Dateiname',
                desc: 'Symbole basierend auf Text im Dateinamen zuweisen.'
            },
            fileNameIconMap: {
                name: 'Dateiname-Symbol-Zuordnung',
                desc: 'Dateien mit dem Text erhalten das angegebene Symbol. Eine Zuordnung pro Zeile: Text=Symbol',
                placeholder: '# Text=icon\nbesprechung=ph-calendar\nrechnung=ph-receipt',
                editTooltip: 'Zuordnungen bearbeiten'
            },
            showFileTypeIcons: {
                name: 'Symbole nach Dateityp',
                desc: 'Symbole basierend auf der Dateierweiterung zuweisen.'
            },
            fileTypeIconPreset: {
                name: 'Dateisymbol-Voreinstellung',
                desc: 'Die integrierten Symbole oder eine Symbolpaket-Voreinstellung auswählen. Benutzerdefinierte Erweiterungsregeln überschreiben diese Voreinstellung.',
                options: {
                    builtIn: 'Integrierte Symbole'
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
                name: 'Höhe kompakter Elemente',
                desc: 'Legt die Höhe kompakter Listenelemente auf Desktop und Mobilgeräten fest (Pixel).',
                resetTooltip: 'Auf Standard zurücksetzen (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Text an kompakte Elementhöhe anpassen',
                desc: 'Skaliert den Text kompakter Listenelemente bei reduzierter Höhe.'
            },
            showParentFolder: {
                name: 'Übergeordneten Ordner anzeigen',
                desc: 'Den übergeordneten Ordnernamen für Notizen in Unterordnern, Tags oder Eigenschaften anzeigen.'
            },
            showFolderPath: {
                name: 'Ordnerpfad anzeigen',
                desc: 'Den Pfad relativ zum ausgewählten Ordner statt nur den Ordnernamen anzeigen. Tags und Eigenschaften zeigen den vollständigen Pfad.'
            },
            parentFolderClickOpensFolder: {
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
                desc: 'Navigationsbereich und Listenbereich nebeneinander anzeigen.'
            },
            dualPaneOrientation: {
                name: 'Ausrichtung des Doppelbereichs',
                desc: 'Horizontalen oder vertikalen Aufbau wählen, wenn der Doppelbereich aktiv ist.',
                options: {
                    horizontal: 'Horizontale Aufteilung',
                    vertical: 'Vertikale Aufteilung'
                }
            },
            narrowSidebarBehavior: {
                name: 'Wenn Seitenleiste zu schmal ist',
                desc: 'Wähle, was passiert, wenn Navigationsbereich und Listenbereich nicht nebeneinander passen.',
                options: {
                    none: 'Nichts tun',
                    singlePane: 'Zur einspaltigen Ansicht wechseln',
                    vertical: 'Zur vertikalen Aufteilung wechseln'
                }
            },
            narrowSidebarThresholdMode: {
                name: 'Schwellenwert für schmale Seitenleiste',
                desc: 'Wähle, wie der Breiten-Schwellenwert der Seitenleiste berechnet wird.',
                options: {
                    fitPanes: 'Bereiche einpassen',
                    customWidth: 'Benutzerdefinierte Breite'
                }
            },
            narrowSidebarThresholdWidth: {
                name: 'Breiten-Schwellenwert für schmale Seitenleiste',
                desc: 'Wechseln, wenn die Seitenleiste schmaler als diese Breite ist.',
                resetTooltip: 'Auf Standardbreite zurücksetzen'
            },
            paneBackgroundColor: {
                name: 'Hintergrundfarbe',
                desc: 'Wähle Hintergrundfarben für Navigations- und Listenbereich.',
                options: {
                    separate: 'Separate Hintergründe',
                    listBackground: 'Listenhintergrund verwenden',
                    navigationBackground: 'Navigationshintergrund verwenden'
                }
            },
            zoomLevel: {
                name: 'Zoomstufe',
                desc: 'Steuert die gesamte Zoomstufe von Notebook Navigator (Prozent).'
            },
            useFloatingToolbarsOnIOS: {
                name: 'Schwebende Symbolleisten auf iOS verwenden',
                desc: 'Gilt nur für iOS.'
            },
            defaultStartupView: {
                name: 'Startansicht im Einzelbereich',
                desc: 'Wähle, welcher Bereich beim Öffnen von Notebook Navigator in der einspaltigen Ansicht angezeigt wird.',
                options: {
                    navigation: 'Navigationsbereich',
                    listPane: 'Listenbereich'
                }
            },
            toolbarButtons: {
                name: 'Symbolleisten-Schaltflächen',
                desc: 'Wähle aus, welche Schaltflächen in der Symbolleiste angezeigt werden. Ausgeblendete Schaltflächen bleiben über Befehle und Menüs zugänglich.'
            },
            openNewNotesInNewTab: {
                name: 'Neue Notizen in neuem Tab öffnen',
                desc: 'Wenn aktiviert, öffnet der Befehl „Neue Notiz erstellen“ Notizen in einem neuen Tab. Wenn deaktiviert, ersetzen Notizen den aktuellen Tab.'
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
            singlePaneAnimation: {
                name: 'Einzelbereich-Animation',
                desc: 'Übergangsdauer beim Wechseln zwischen Bereichen im Einzelbereich-Modus (Millisekunden).',
                resetTooltip: 'Auf Standard zurücksetzen'
            },
            autoSelectFirstNote: {
                name: 'Erste Notiz automatisch auswählen',
                desc: 'Die erste Notiz automatisch öffnen, wenn du Ordner, Tags oder Eigenschaften wechselst.'
            },
            disableShortcutAutoScroll: {
                name: 'Auto-Scroll für Verknüpfungen deaktivieren',
                desc: 'Navigationsbereich nicht scrollen beim Klicken auf Elemente in Verknüpfungen.'
            },
            expandOnSelection: {
                name: 'Bei Auswahl erweitern',
                desc: 'Ordner, Tags und Eigenschaften bei Auswahl erweitern. Im Einzelbereich-Modus: erste Auswahl erweitert, zweite Auswahl zeigt Dateien.'
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
                name: 'Navigationsbanner (Vault-Profil)',
                desc: 'Bild oberhalb des Navigationsbereichs anzeigen. Ändert sich mit dem ausgewählten Vault-Profil.',
                current: 'Aktuelles Banner: {path}',
                chooseButton: 'Bild auswählen'
            },
            pinNavigationBanner: {
                name: 'Banner anheften',
                desc: 'Banner oberhalb des Navigationsbaums anheften.'
            },
            showShortcuts: {
                name: 'Verknüpfungen anzeigen',
                desc: 'Verknüpfungsbereich im Navigationsbereich anzeigen.'
            },
            shortcutBadgeDisplay: {
                name: 'Verknüpfungsabzeichen',
                desc: "Was neben Verknüpfungen angezeigt wird. Verwende die Befehle 'Verknüpfung 1-9 öffnen', um Verknüpfungen direkt zu öffnen.",
                options: {
                    position: 'Position (1-9)',
                    count: 'Elementanzahl',
                    none: 'Keine'
                }
            },
            showRecentFiles: {
                name: 'Zuletzt verwendete Dateien anzeigen',
                desc: 'Den Bereich für zuletzt verwendete Dateien im Navigationsbereich anzeigen.'
            },
            hideFileTypesFromRecentFiles: {
                name: 'Dateitypen aus zuletzt verwendeten Dateien ausblenden',
                desc: 'Wähle aus, welche Dateitypen im Bereich der zuletzt verwendeten Dateien ausgeblendet werden sollen.',
                options: {
                    none: 'Keine',
                    folderNotes: 'Ordnernotizen'
                }
            },
            recentFilesCount: {
                name: 'Anzahl zuletzt verwendeter Dateien',
                desc: 'Anzahl der anzuzeigenden zuletzt verwendeten Dateien.'
            },
            pinRecentFilesWithShortcuts: {
                name: 'Zuletzt verwendete Dateien mit Verknüpfungen anheften',
                desc: 'Zuletzt verwendete Dateien beim Anheften von Verknüpfungen einbeziehen.'
            },
            enableCalendar: {
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
            calendarSinglePanePlacement: {
                name: 'Einzelbereichs-Platzierung',
                desc: 'Wo der Kalender im Einzelbereichs-Modus angezeigt wird.',
                options: {
                    navigationPane: 'Navigationsbereich',
                    belowPanes: 'Unter den Bereichen'
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
            calendarMonthNameFormat: {
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
            calendarLeftSidebarWeeksToShow: {
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
            calendarShowOutsideMonthDays: {
                name: 'Tage aus anderen Monaten anzeigen',
                desc: 'Tage des vorherigen und nächsten Monats anzeigen, wenn der Kalender einen ganzen Monat anzeigt.'
            },
            calendarShowYearCalendar: {
                name: 'Jahreskalender anzeigen',
                desc: 'Jahresnavigation und Monatsraster in der rechten Seitenleiste anzeigen.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Vor Erstellung bestätigen',
                desc: 'Bestätigungsdialog beim Erstellen einer neuen täglichen Notiz anzeigen.'
            },
            calendarShowHiddenItems: {
                name: 'Ausgeblendete Elemente anzeigen',
                desc: 'Wenn aktiviert, zeigt der Kalender immer alle Kalendernotizen, einschließlich Notizen, die durch Filter des Vault-Profils ausgeblendet sind.'
            },
            dailyNoteSource: {
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

            periodicNotesRootFolder: {
                name: 'Stammordner (Vault-Profil)',
                desc: 'Basisordner für periodische Notizen. Datumsmuster können Unterordner enthalten. Ändert sich mit dem ausgewählten Vault-Profil.',
                placeholder: 'Privat/Tagebuch'
            },
            templateFolderLocation: {
                name: 'Vorlagenordner',
                desc: 'Die Vorlagenauswahl zeigt Notizen aus diesem Ordner.',
                placeholder: 'Vorlagen',
                usage: 'Wird von Kalendernotizen und Ordnernotizen verwendet. Vorlagen unter Kalender > Kalenderintegration und Ordner & Ordnernotizen > Ordnernotiz-Dateien konfigurieren.'
            },
            calendarDailyNotePattern: {
                name: 'Tägliche Notizen',
                desc: 'Pfad mit Moment-Datumsformat formatieren. Unterordnernamen in Klammern setzen, z.B. [Work]/YYYY. Klicke auf das Vorlagensymbol, um eine Vorlage festzulegen. Vorlagenordner unter Dateioperationen > Vorlagen festlegen.',
                placeholder: 'YYYY/YYYYMMDD',
                parsingError: 'Das Muster muss als vollständiges Datum (Jahr, Monat, Tag) formatiert und wieder geparst werden können.'
            },
            calendarPeriodicNotePatterns: {
                momentDescPrefix: 'Pfad formatieren mit ',
                momentLinkText: 'Moment-Datumsformat',
                momentDescSuffix:
                    '. Unterordnernamen in Klammern setzen, z.B. [Work]/YYYY. Klicke auf das Vorlagensymbol, um eine Vorlage festzulegen. Vorlagenordner unter Dateioperationen > Vorlagen festlegen.',
                templateTokenNoticeLabel: 'Wichtig!',
                templateTokenNotice:
                    'Vorlagenunterstützung erfordert das Templater-Plugin. Integrierte Formate wie {{date}} und {{title}} funktionieren nur, wenn {source} auf {option} gesetzt ist.',
                example: 'Aktuelle Syntax: {path}'
            },
            templaterSupport: {
                installed: '✅ Das Templater-Plugin ist mit voller Vorlagenunterstützung installiert.',
                missing: '⚠️ Installiere das Templater-Plugin für Vorlagenunterstützung.'
            },
            calendarWeeklyNotePattern: {
                name: 'Wöchentliche Notizen',
                parsingError:
                    'Das Muster muss als vollständige Woche (Wochenjahr, Wochennummer) formatiert und wieder geparst werden können.',
                weekPathMismatchWarning:
                    'Pfade für wöchentliche Notizen verwenden das Gebietsschema für periodische Notizen. Verwende übereinstimmende Gebietsschemata oder "GGGG" mit "WW" für montagsbasierte Wochen.',
                mixedWeekTokensWarning:
                    'Dieses Muster mischt montagsbasierte Wochen-Token ("W" oder "G") mit gebietsschemabasierten Wochen-Token ("w" oder "g"). Verwende konsequent einen Satz: "GGGG" mit "WW" für montagsbasierte Wochen oder "gggg" mit "ww", wenn wöchentliche Notizen dem gewählten Gebietsschema folgen sollen.'
            },
            calendarMonthlyNotePattern: {
                name: 'Monatliche Notizen',
                parsingError: 'Das Muster muss als vollständiger Monat (Jahr, Monat) formatiert und wieder geparst werden können.'
            },
            calendarQuarterlyNotePattern: {
                name: 'Vierteljährliche Notizen',
                parsingError: 'Das Muster muss als vollständiges Quartal (Jahr, Quartal) formatiert und wieder geparst werden können.'
            },
            calendarYearlyNotePattern: {
                name: 'Jährliche Notizen',
                parsingError: 'Das Muster muss als vollständiges Jahr (Jahr) formatiert und wieder geparst werden können.'
            },
            periodicNoteTemplateFile: {
                current: 'Vorlagendatei: {name}'
            },
            showTooltips: {
                name: 'Tooltips anzeigen',
                desc: 'Zeigt Hover-Tooltips mit zusätzlichen Informationen für Notizen und Ordner an.'
            },
            showTooltipPath: {
                name: 'Pfad in Tooltips anzeigen',
                desc: 'Zeigt den Ordnerpfad unter den Notiznamen in Tooltips an.'
            },
            showTooltipTags: {
                name: 'Tags in Tooltips anzeigen',
                desc: 'Zeigt Tags von Notizen in Tooltips an, wenn der Tag-Bereich aktiviert ist.'
            },
            showTooltipWordCount: {
                name: 'Wortanzahl in Tooltips anzeigen',
                desc: 'Zeigt die Wortanzahl in Tooltips an, wenn die Wortanzahl aktiviert ist.'
            },
            resetPaneSeparator: {
                name: 'Position des Fenstertrennelements zurücksetzen',
                desc: 'Setzt das verschiebbare Trennelement zwischen Navigationsbereich und Listenbereich auf die Standardposition zurück.',
                buttonText: 'Trennelement zurücksetzen',
                notice: 'Trennelementposition zurückgesetzt. Starte Obsidian neu oder öffne Notebook Navigator erneut, um die Änderungen anzuwenden.'
            },
            importAndExportSettings: {
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
                    confirmMessage: 'Beim Importieren werden deine aktuellen Notebook Navigator-Einstellungen ersetzt.',
                    backupToggleName: 'Aktuelle Einstellungen vor dem Importieren im Vault-Hauptordner speichern',
                    backupToggleDesc: 'Erstellt eine JSON-Datei mit Zeitstempel im Vault-Hauptordner.',
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
                notice: 'Alle Einstellungen zurückgesetzt. Starte Obsidian neu oder öffne Notebook Navigator erneut, um die Änderungen anzuwenden.',
                error: 'Zurücksetzen der Einstellungen fehlgeschlagen.'
            },
            multiSelectModifier: {
                name: 'Mehrfachauswahl-Modifikator',
                desc: 'Wähle, welche Modifikatortaste die Mehrfachauswahl umschaltet. Wenn Option/Alt ausgewählt ist, öffnet Cmd/Strg-Klick Notizen in einem neuen Tab.',
                options: {
                    cmdCtrl: 'Cmd/Strg-Klick',
                    optionAlt: 'Option/Alt-Klick'
                }
            },
            enterToOpenFiles: {
                name: 'Enter drücken zum Öffnen',
                desc: 'Dateien nur mit Enter öffnen während der Tastaturnavigation in der Liste. Unter macOS verhindert dies, dass Enter Dateien umbenennt.'
            },
            shiftEnterAction: {
                name: 'Shift+Enter',
                desc: 'Festlegen, ob Shift+Enter die ausgewählte Datei öffnet oder umbenennt.'
            },
            cmdEnterAction: {
                name: 'Cmd+Enter',
                desc: 'Festlegen, ob Cmd+Enter die ausgewählte Datei öffnet oder umbenennt.'
            },
            ctrlEnterAction: {
                name: 'Strg+Enter',
                desc: 'Festlegen, ob Strg+Enter die ausgewählte Datei öffnet oder umbenennt.'
            },
            mouseBackForwardAction: {
                name: 'Maustasten vor/zurück',
                desc: 'Aktion für die Vor- und Zurück-Tasten der Maus auf dem Desktop.',
                options: {
                    systemDefault: 'Systemstandard verwenden',
                    singlePaneSwitch: 'Bereiche wechseln (Einzelbereich)',
                    history: 'Verlauf navigieren'
                }
            },
            hideNotesWithPropertyRules: {
                name: 'Notizen mit Eigenschaftsregeln ausblenden (Vault-Profil)',
                desc: 'Kommagetrennte Liste von Frontmatter-Regeln. Verwende `key` oder `key=value` Einträge (z.B. status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            hideFiles: {
                name: 'Dateien ausblenden (Vault-Profil)',
                desc: 'Kommagetrennte Liste von Dateinamenmustern zum Ausblenden. Unterstützt * Platzhalter und / Pfade (z.B. temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Vault-Profil',
                desc: 'Profile speichern Dateityp-Sichtbarkeit, ausgeblendete Dateien, ausgeblendete Ordner, ausgeblendete Tags, Eigenschaftsregeln für ausgeblendete Notizen, Verknüpfungen und Navigationsbanner. Profile können über die Kopfzeile des Navigationsbereichs gewechselt werden.',
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
                    '{name} entfernen? Ausgeblendete Datei-, Ordner-, Tag- und eigenschaftsbasierte Notizfilter in diesem Profil werden gelöscht.',
                moveUp: 'Nach oben',
                moveDown: 'Nach unten',
                errors: {
                    emptyName: 'Profilnamen eingeben',
                    duplicateName: 'Profilname bereits vorhanden'
                }
            },
            vaultTitlePlacement: {
                name: 'Platzierung des Vault-Titels',
                desc: 'Wähle, wo der Vault-Titel angezeigt wird.',
                options: {
                    header: 'Im Kopfbereich anzeigen',
                    navigation: 'Im Navigationsbereich anzeigen'
                }
            },
            hideFolders: {
                name: 'Ordner ausblenden (Vault-Profil)',
                desc: 'Kommagetrennte Liste von auszublendenden Ordnern. Namensmuster: assets* (Ordner, die mit assets beginnen), *_temp (endet mit _temp). Pfadmuster: /archiv (nur Wurzel-Archiv), /res* (Wurzelordner, die mit res beginnen), /*/temp (temp-Ordner eine Ebene tief), /projekte/* (alle Ordner in projekte).',
                placeholder: 'vorlagen, assets*, /archiv, /res*'
            },
            descendantExcludedFolders: {
                name: 'Ordner aus Unterordner-Notizen ausschließen (Vault-Profil)',
                desc: 'Kommagetrennte Liste von Ordnern, die beim Sammeln von Notizen aus Unterordnern ausgelassen werden. Die Ordner bleiben sichtbar, und beim Auswählen eines Ordners werden seine Notizen weiterhin angezeigt. Verwendet dieselben Muster wie Ordner ausblenden.',
                placeholder: 'täglich, ressourcen, /archiv'
            },
            showFileTypes: {
                name: 'Dateitypen anzeigen (Vault-Profil)',
                desc: 'Filtere, welche Dateitypen im Navigator angezeigt werden. Dateitypen, die von Obsidian nicht unterstützt werden, können in externen Anwendungen geöffnet werden.',
                options: {
                    documents: 'Dokumente (.md, .canvas, .base)',
                    supported: 'Unterstützt (öffnet in Obsidian)',
                    all: 'Alle (öffnet ggf. extern)'
                }
            },
            homepage: {
                name: 'Startseite',
                desc: 'Wähle, was Notebook Navigator beim Start automatisch öffnet.',
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
            dateWhenSortingByName: {
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
            showFullTagPaths: {
                name: 'Vollständige Tag-Pfade anzeigen',
                desc: "Vollständige Tag-Hierarchiepfade anzeigen. Aktiviert: 'ai/openai', 'arbeit/projekte/2024'. Deaktiviert: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Datei-Tags einfärben',
                desc: 'Tag-Farben auf Tag-Abzeichen in Datei-Elementen anwenden.'
            },
            showColoredTagsFirst: {
                name: 'Farbige Tags zuerst anzeigen',
                desc: 'Farbige Tags vor anderen Tags in Datei-Elementen sortieren.'
            },
            showFileTagsInCompactMode: {
                name: 'Datei-Tags im Kompaktmodus anzeigen',
                desc: 'Tags anzeigen, wenn Datum, Vorschau und Bild ausgeblendet sind.'
            },
            showFileProperties: {
                name: 'Datei-Eigenschaften anzeigen',
                desc: 'Eigenschaften in Datei-Elementen anzeigen. Wähle im Dialog „Sichtbarkeit der Eigenschaftsschlüssel“ aus, welche Eigenschaften angezeigt werden.'
            },
            colorFileProperties: {
                name: 'Datei-Eigenschaften einfärben',
                desc: 'Eigenschaftsfarben auf Eigenschafts-Abzeichen in Datei-Elementen anwenden.'
            },
            showColoredPropertiesFirst: {
                name: 'Farbige Eigenschaften zuerst anzeigen',
                desc: 'Farbige Eigenschaften vor anderen Eigenschaften in Datei-Elementen sortieren.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Eigenschaften im Kompaktmodus anzeigen',
                desc: 'Eigenschaften anzeigen, wenn der Kompaktmodus aktiv ist.'
            },
            textCountType: {
                name: 'Zähltyp',
                desc: 'Wähle, welche Textzählungen in Dateielementen angezeigt werden.',
                options: {
                    none: 'Keine',
                    words: 'Wortanzahl',
                    characters: 'Zeichenanzahl',
                    both: 'Wort- und Zeichenanzahl'
                }
            },
            textCountPlacement: {
                name: 'Platzierung',
                desc: 'Wähle, wo Textzählungen angezeigt werden.',
                options: {
                    title: 'Im Titel',
                    property: 'Als Eigenschaft'
                }
            },
            characterCountSpaces: {
                name: 'Zeichenanzahl',
                desc: 'Wähle, ob Leerzeichen in der Zeichenanzahl enthalten sind.',
                options: {
                    include: 'Mit Leerzeichen',
                    exclude: 'Ohne Leerzeichen'
                }
            },
            wordCountTargetProperty: {
                name: 'Zieleigenschaft',
                desc: 'Frontmatter-Eigenschaftsschlüssel mit der Zielwortanzahl. Leer lassen, um Ziele auszublenden.'
            },
            showTargetPercentage: {
                name: 'Zielprozentsatz anzeigen',
                desc: 'Nur den Fortschrittsprozentsatz anzeigen, wenn eine Zielwortanzahl verfügbar ist.'
            },
            textCountActiveNotice: {
                title: 'Zählung ist weiterhin aktiv',
                summary:
                    'Wort- oder Zeichenanzahlen werden weiterhin für alle Notizen berechnet, weil die folgenden Einträge sie verwenden:',
                more: 'und {count} weitere',
                reasons: {
                    appearance: 'Dateidarstellung',
                    'group-header': 'Gruppenüberschrift'
                },
                scopes: {
                    folder: 'Ordner: {name}',
                    tag: 'Tag: #{name}',
                    property: 'Eigenschaft: {name}'
                }
            },
            propertyKeys: {
                name: 'Eigenschaftsschlüssel (Vault-Profil)',
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
            linkPropertyPillsToNotes: {
                name: 'Eigenschafts-Pills mit Notizen verknüpfen',
                desc: 'Auf ein Eigenschafts-Pill klicken, um die verknüpfte Notiz zu öffnen.'
            },
            linkPropertyPillsToUrls: {
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
            showNotePreview: {
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
            skipCalloutsInPreview: {
                name: 'Callouts in Vorschau überspringen',
                desc: 'Callout-Blöcke bei der Erstellung des Vorschautextes überspringen.'
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
            fallbackToNoteContent: {
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
            titleRows: {
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
                name: 'Feature-Bild anzeigen',
                desc: 'Zeigt eine Miniatur des ersten Bildes in der Notiz an.'
            },
            forceSquareFeatureImage: {
                name: 'Quadratische Feature-Bilder erzwingen',
                desc: 'Feature-Bilder als quadratische Miniaturansichten darstellen.'
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
            featureImageDisplaySize: {
                name: 'Anzeigegröße des Feature-Bildes',
                desc: 'Maximale Darstellungsgröße für Feature-Bilder in Notizlisten.',
                options: {
                    '64': '64 px',
                    '96': '96 px',
                    '128': '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'Pixelgröße des Feature-Bildes',
                desc: 'Auflösung für gespeicherte Feature-Bild-Vorschaubilder. Erhöhe diesen Wert, wenn größere Vorschauen unscharf aussehen.',
                options: {
                    '256x144': '256 x 144 px',
                    '384x216': '384 x 216 px',
                    '512x288': '512 x 288 px'
                }
            },
            downloadExternalFeatureImages: {
                name: 'Externe Bilder herunterladen',
                desc: 'Remote-Bilder und YouTube-Vorschaubilder für Feature-Bilder herunterladen.'
            },
            hideExportedPreviewImages: {
                name: 'Exportierte Vorschaubilder ausblenden',
                desc: 'Exportierte PNG-Dateien der Zeichnungsvorschau ausblenden. Aktiviere „Ausgeblendete Elemente anzeigen“, um sie anzuzeigen.'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator zeigt von Excalidraw exportierte PNG-Dateien als Zeichnungsvorschauen an.',
                items: [
                    'Öffne in den **Excalidraw-Einstellungen** **Embedding Excalidraw into your Notes and Exporting**, dann **Export Settings**, dann **Auto-export Settings**.',
                    'Aktiviere **Auto-export PNG**. Optional kannst du **Export both dark- and light-themed image** aktivieren.',
                    'Notebook Navigator sucht nach **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** oder **Drawing.excalidraw.light.png**.',
                    'Solange **Exportierte Vorschaubilder ausblenden** aktiv ist, erscheinen die PNG-Dateien nur, wenn **Ausgeblendete Elemente anzeigen** ebenfalls aktiv ist.'
                ]
            },
            showRootFolder: {
                name: 'Wurzelordner anzeigen',
                desc: 'Den Namen des Vaults als Wurzelordner im Baum anzeigen.'
            },
            showFolderIcons: {
                name: 'Ordnersymbole anzeigen',
                desc: 'Symbole neben Ordnern im Navigationsbereich anzeigen.'
            },
            inheritFolderColors: {
                name: 'Ordnerfarben vererben',
                desc: 'Unterordner erben die Farbe von übergeordneten Ordnern.'
            },
            folderSortOrder: {
                name: 'Ordner-Sortierreihenfolge',
                desc: 'Klicke mit der rechten Maustaste auf einen Ordner, um eine andere Sortierreihenfolge für dessen Unterordner festzulegen.',
                options: {
                    alphaAsc: 'A bis Z',
                    alphaDesc: 'Z bis A'
                }
            },
            showFileCount: {
                name: 'Dateianzahl anzeigen',
                desc: 'Dateianzahlen neben Ordnern, Tags und Eigenschaften anzeigen.'
            },
            showShortcutAndRecentItemIcons: {
                name: 'Symbole für Verknüpfungen und zuletzt verwendete Elemente anzeigen',
                desc: 'Symbole neben Einträgen in den Bereichen Verknüpfungen und Zuletzt verwendet anzeigen.'
            },
            interfaceIcons: {
                name: 'Oberflächensymbole',
                desc: 'Symbole für Symbolleiste, Ordner, Tags, Eigenschaften, angeheftete Elemente, Suche und Sortierung bearbeiten.',
                buttonText: 'Symbole bearbeiten'
            },
            applyColorToIconsOnly: {
                name: 'Farbe nur auf Symbole anwenden',
                desc: 'Wenn aktiviert, werden benutzerdefinierte Farben nur auf Symbole angewendet. Wenn deaktiviert, werden Farben sowohl auf Symbole als auch auf Textbeschriftungen angewendet.'
            },
            navRainbowMode: {
                name: 'Regenbogen-Farbmodus (Vault-Profil)',
                desc: 'Regenbogenfarben im Navigationsbereich anwenden.',
                options: {
                    off: 'Aus',
                    textColor: 'Textfarbe',
                    backgroundColor: 'Hintergrundfarbe'
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
            navRainbowApplyToRecentItems: {
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
            navRainbowConsistentBrightness: {
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
            collapseItems: {
                name: 'Elemente einklappen',
                desc: 'Wähle, was die Schaltfläche zum Ein-/Ausklappen beeinflusst.',
                options: {
                    all: 'Alle',
                    foldersOnly: 'Nur Ordner',
                    tagsOnly: 'Nur Tags',
                    propertiesOnly: 'Nur Eigenschaften'
                }
            },
            keepSelectedItemExpanded: {
                name: 'Ausgewähltes Element erweitert halten',
                desc: 'Beim Einklappen bleiben das ausgewählte Element und seine übergeordneten Elemente erweitert.'
            },
            excludeVaultRootFromCollapse: {
                name: 'Vault-Hauptordner beim Einklappen überspringen',
                desc: 'Beim Einklappen aller Elemente bleibt der Vault-Hauptordner in seinem aktuellen Zustand.'
            },
            treeIndentation: {
                name: 'Baum-Einrückung',
                desc: 'Passe die Einrückungsbreite für verschachtelte Ordner, Tags und Eigenschaften an (Pixel).'
            },
            navItemHeight: {
                name: 'Zeilenhöhe',
                desc: 'Passe die Höhe von Ordnern, Tags und Eigenschaften im Navigationsbereich an (Pixel).'
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
                desc: 'Punkte, Striche oder eine Linie zwischen Elementnamen und Dateianzahl anzeigen.',
                options: {
                    none: 'Keine',
                    dots: 'Punkte (...)',
                    dashes: 'Striche (---)',
                    line: 'Linie'
                }
            },
            rootItemSpacing: {
                name: 'Abstand für Wurzelelemente',
                desc: 'Abstand zwischen Ordnern, Tags und Eigenschaften auf der obersten Ebene (Pixel).'
            },
            showTags: {
                name: 'Tags anzeigen',
                desc: 'Tag-Bereich im Navigator anzeigen.'
            },
            showTagIcons: {
                name: 'Tag-Symbole anzeigen',
                desc: 'Symbole neben Tags im Navigationsbereich anzeigen.'
            },
            inheritTagColors: {
                name: 'Tag-Farben vererben',
                desc: 'Unter-Tags erben die Farbe von übergeordneten Tags.'
            },
            tagSortOrder: {
                name: 'Tag-Sortierreihenfolge',
                desc: 'Klicke mit der rechten Maustaste auf ein Tag, um eine andere Sortierreihenfolge für dessen Unterelemente festzulegen.',
                options: {
                    alphaAsc: 'A bis Z',
                    alphaDesc: 'Z bis A',
                    frequency: 'Häufigkeit',
                    lowToHigh: 'niedrig bis hoch',
                    highToLow: 'hoch bis niedrig'
                }
            },
            showTagsFolder: {
                name: 'Tags-Ordner anzeigen',
                desc: '"Tags" als einklappbaren Ordner anzeigen.'
            },
            showUntaggedNotes: {
                name: 'Ungetaggte Notizen anzeigen',
                desc: '"Ohne Tag" für Notizen ohne Tags anzeigen.'
            },
            filterTagsBySelection: {
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
                propertyKeysInfoLinkText: 'Allgemein > Eigenschaftsschlüssel',
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
            showPropertiesFolder: {
                name: 'Eigenschafts-Ordner anzeigen',
                desc: '"Eigenschaften" als einklappbaren Ordner anzeigen.'
            },
            filterPropertiesBySelection: {
                name: 'Eigenschaften nach Auswahl filtern',
                desc: 'Nur Eigenschaften anzeigen, die in Notizen im ausgewählten Ordner oder dem ausgewählten Tag vorkommen.'
            },
            hideTags: {
                name: 'Tags ausblenden (Vault-Profil)',
                desc: 'Kommagetrennte Liste von Tag-Mustern. Namensmuster: tag* (beginnt mit), *tag (endet mit). Pfadmuster: archiv (Tag und Untergeordnete), archiv/* (nur Untergeordnete), projekte/*/entwürfe (Platzhalter in der Mitte).',
                placeholder: 'archiv*, *entwurf, projekte/*/alt'
            },
            hideNotesWithTags: {
                name: 'Notizen mit Tags ausblenden (Vault-Profil)',
                desc: 'Kommagetrennte Liste von Tag-Mustern. Notizen mit übereinstimmenden Tags werden ausgeblendet. Namensmuster: tag* (beginnt mit), *tag (endet mit). Pfadmuster: archiv (Tag und Untergeordnete), archiv/* (nur Untergeordnete), projekte/*/entwürfe (Platzhalter in der Mitte).',
                placeholder: 'archiv*, *entwurf, projekte/*/alt'
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
                desc: 'Name der Ordnernotiz ohne Erweiterung. Verwende {{folder}}, um den Ordnernamen einzufügen, oder gib einen festen Namen wie index ein.'
            },
            folderNoteTemplate: {
                name: 'Ordnernotiz-Vorlage',
                desc: 'Vorlagendatei, die beim Erstellen von Ordnernotizen verwendet wird. Markdown-Vorlagen können Templater verwenden. Canvas- und Base-Vorlagen werden als Dateiinhalt kopiert. Vorlagenordner unter Dateioperationen > Vorlagen festlegen.',
                formatWarning: 'Das Vorlagenformat muss dem ausgewählten Ordnernotiztyp entsprechen: .md, .canvas oder .base.'
            },
            folderNamesOpenFolderNotes: {
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
            showClosestFolderNoteInRightSidebar: {
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
                desc: 'Verwende dies, wenn Tags fehlen, Vorschauen falsch sind oder Bilder fehlen. Dies kann nach Synchronisierungskonflikten oder unerwarteten Schließungen auftreten.',
                buttonText: 'Cache neu aufbauen',
                error: 'Cache-Neuaufbau fehlgeschlagen',
                indexingTitle: 'Vault wird indiziert...',
                progress: 'Notebook Navigator-Cache wird aktualisiert.'
            },
            iconPackManagement: {
                downloadButton: 'Herunterladen',
                downloadingLabel: 'Wird heruntergeladen...',
                removeButton: 'Entfernen',
                statusInstalled: 'Heruntergeladen (Version {version})',
                statusNotInstalled: 'Nicht heruntergeladen',
                versionUnknown: 'unbekannt',
                downloadFailed: 'Fehler beim Herunterladen von {name}. Überprüfe deine Verbindung und versuche es erneut.',
                removeFailed: 'Fehler beim Entfernen von {name}.',
                infoNote:
                    'Heruntergeladene Symbolpakete synchronisieren den Installationsstatus über Geräte hinweg. Symbolpakete bleiben in der lokalen Datenbank auf jedem Gerät; die Synchronisierung verfolgt nur, ob sie heruntergeladen oder entfernt werden sollen. Symbolpakete werden aus dem Notebook Navigator Repository heruntergeladen (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterMetadata: {
                name: 'Frontmatter-Metadaten verwenden',
                desc: 'Frontmatter für Notizname, Zeitstempel, Symbole und Farben verwenden'
            },
            frontmatterNameFields: {
                name: 'Namensfelder',
                desc: 'Kommagetrennte Liste von Frontmatter-Feldern. Erster nicht-leerer Wert wird verwendet. Fällt auf Dateinamen zurück.',
                placeholder: 'title, name'
            },
            frontmatterIconField: {
                name: 'Symbolfeld',
                desc: 'Frontmatter-Feld für Dateisymbole. Leer lassen, um Symbole aus den Einstellungen zu verwenden.',
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
            migrateIconsAndColorsFromSettings: {
                name: 'Symbole und Farben aus Einstellungen migrieren',
                desc: 'In Einstellungen gespeichert: {icons} Symbole, {colors} Farben.',
                button: 'Migrieren',
                buttonWorking: 'Migriere...',
                noticeNone: 'Keine Dateisymbole oder Farben in den Einstellungen gespeichert.',
                noticeDone: '{migratedIcons}/{icons} Symbole, {migratedColors}/{colors} Farben migriert.',
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
            frontmatterTimestampFormat: {
                name: 'Zeitstempelformat',
                desc: 'Format zum Parsen von Zeitstempeln im Frontmatter. Leer lassen, um ISO 8601-Parsing zu verwenden.',
                helpTooltip: 'Format mit Moment',
                momentLinkText: 'Moment-Format',
                help: 'Häufige Formate:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'Entwicklung unterstützen',
                desc: 'Wenn du Notebook Navigator liebst, ziehe bitte in Betracht, die weitere Entwicklung zu unterstützen.',
                buttonText: '❤️ Sponsor',
                coffeeButton: '☕️ Spendiere mir einen Kaffee'
            },
            otherPlugins: {
                name: 'Schau dir meine anderen Plugins an',
                betterPaste: 'Räumt eingefügten Text, Links und Bilder auf',
                pixelPerfectImage: 'Exakte Bildgrößen und mehr'
            },
            checkForNewVersionOnStart: {
                name: 'Beim Start nach neuer Version suchen',
                desc: 'Prüft beim Start auf neue Plugin-Versionen und zeigt eine Benachrichtigung an, wenn ein Update verfügbar ist. Überprüfungen erfolgen höchstens einmal täglich.',
                status: 'Neue Version verfügbar: {version}'
            },
            startupDebugLogging: {
                name: 'Start-Debugprotokollierung',
                desc: 'Schreibt Startdiagnosen in eine Markdown-Datei mit Zeitstempel im Stammverzeichnis des Vaults und stoppt, nachdem der Start abgeschlossen ist. Die Datei kann synchronisiert werden und Dateipfade enthalten.'
            },
            whatsNew: {
                name: 'Neuigkeiten in Notebook Navigator {version}',
                desc: 'Letzte Updates und Verbesserungen anzeigen',
                buttonText: 'Letzte Updates anzeigen'
            },
            showReleaseNotes: {
                name: 'Versionshinweise nach Updates anzeigen',
                desc: 'Deaktivieren, damit sich der Dialog mit den Neuerungen nach Updates nicht automatisch öffnet.'
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
                withFeatureImage: 'mit Feature-Bild',
                withMetadata: 'mit Metadaten'
            },
            metadataInfo: {
                successfullyParsed: 'Erfolgreich geparst',
                itemsWithName: 'Einträge mit Name',
                withCreatedDate: 'mit Erstellungsdatum',
                withModifiedDate: 'mit Änderungsdatum',
                withIcon: 'mit Symbol',
                withColor: 'mit Farbe',
                failedToParse: 'Parsing fehlgeschlagen',
                createdDates: 'Erstellungsdaten',
                modifiedDates: 'Änderungsdaten',
                checkTimestampFormat: 'Überprüfe dein Zeitstempelformat.',
                exportFailed: 'Fehler exportieren'
            }
        }
    },
    whatsNew: {
        title: 'Neuigkeiten in Notebook Navigator',
        openBannerImage: 'Release-Bannerbild öffnen',
        supportMessage: 'Wenn du Notebook Navigator hilfreich findest, ziehe bitte in Betracht, die Entwicklung zu unterstützen.',
        supportButton: 'Kauf mir einen Kaffee',
        thanksButton: 'Danke!'
    }
};
