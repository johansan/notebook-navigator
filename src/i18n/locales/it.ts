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
 * Italian language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_IT = {
    // Common UI elements
    common: {
        cancel: 'Annulla', // Button text for canceling dialogs and operations (English: Cancel)
        delete: 'Elimina', // Button text for delete operations in dialogs (English: Delete)
        clear: 'Cancella', // Button text for clearing values (English: Clear)
        remove: 'Rimuovi', // Button text for remove operations in dialogs (English: Remove)
        submit: 'Invia', // Button text for submitting forms and dialogs (English: Submit)
        noSelection: 'Nessuna selezione', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Senza tag', // Label for notes without any tags (English: Untagged)
        untitled: 'Senza titolo', // Default name for notes without a title (English: Untitled)
        featureImageAlt: 'Immagine in evidenza', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Errore sconosciuto', // Generic fallback when an error has no message (English: Unknown error)
        updateBannerTitle: 'Aggiornamento Notebook Navigator disponibile',
        updateBannerInstruction: 'Aggiorna in Impostazioni -> Plugin della community',
        updateIndicatorLabel: 'Nuova versione disponibile'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Seleziona una cartella o un tag per visualizzare le note', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Nessuna nota', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Fissate', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Note', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'File', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (nascosto)' // Accessibility label applied to list items that are normally hidden
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Senza tag', // Label for the special item showing notes without tags (English: Untagged)
        hiddenTags: 'Tag nascosti', // Label for the hidden tags virtual folder (English: Hidden tags)
        tags: 'Tag' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Scorciatoie', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentNotesHeader: 'Note recenti', // Header label for recent notes section in navigation pane (English: Recent notes)
        recentFilesHeader: 'File recenti', // Header label when showing recent non-note files in navigation pane (English: Recent files)
        reorderRootFoldersTitle: 'Riordina navigazione',
        reorderRootFoldersHint: 'Usa frecce o trascina per riordinare',
        vaultRootLabel: 'Vault',
        resetRootToAlpha: 'Ripristina ordine alfabetico',
        resetRootToFrequency: 'Ripristina ordine per frequenza',
        pinShortcuts: 'Fissa scorciatoie',
        pinShortcutsAndRecentNotes: 'Fissa scorciatoie e note recenti',
        pinShortcutsAndRecentFiles: 'Fissa scorciatoie e file recenti',
        unpinShortcuts: 'Sblocca scorciatoie',
        unpinShortcutsAndRecentNotes: 'Sblocca scorciatoie e note recenti',
        unpinShortcutsAndRecentFiles: 'Sblocca scorciatoie e file recenti',
        profileMenuLabel: 'Profilo',
        profileMenuAria: 'Cambia profilo vault'
    },

    shortcuts: {
        folderExists: 'Cartella già presente nelle scorciatoie',
        noteExists: 'Nota già presente nelle scorciatoie',
        tagExists: 'Tag già presente nelle scorciatoie',
        searchExists: 'Scorciatoia di ricerca già esistente',
        emptySearchQuery: 'Inserisci una query di ricerca prima di salvare',
        emptySearchName: 'Inserisci un nome prima di salvare la ricerca',
        add: 'Aggiungi alle scorciatoie',
        addNotesCount: 'Aggiungi {count} note alle scorciatoie',
        addFilesCount: 'Aggiungi {count} file alle scorciatoie',
        rename: 'Rinomina scorciatoia',
        remove: 'Rimuovi dalle scorciatoie',
        removeAll: 'Rimuovi tutte le scorciatoie',
        removeAllConfirm: 'Rimuovere tutte le scorciatoie?',
        folderNotesPinned: 'Fissate {count} note cartella'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Comprimi elementi', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'Espandi tutti gli elementi', // Tooltip for button that expands all items (English: Expand all items)
        scrollToTop: "Scorri all'inizio",
        newFolder: 'Nuova cartella', // Tooltip for create new folder button (English: New folder)
        newNote: 'Nuova nota', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Torna alla navigazione', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeSortOrder: 'Cambia ordine', // Tooltip for the sort order toggle button (English: Change sort order)
        defaultSort: 'Predefinito', // Label for default sorting mode (English: Default)
        customSort: 'Personalizzato', // Label for custom sorting mode (English: Custom)
        showFolders: 'Mostra navigazione', // Tooltip for button to show the navigation pane (English: Show navigation)
        hideFolders: 'Nascondi navigazione', // Tooltip for button to hide the navigation pane (English: Hide navigation)
        reorderRootFolders: 'Riordina navigazione',
        finishRootFolderReorder: 'Fatto',
        toggleDescendantNotes: 'Mostra note da sottocartelle / discendenti', // Tooltip: include descendants for folders and tags
        autoExpandFoldersTags: 'Espandi alla selezione', // Tooltip for button to toggle auto-expanding folders and tags when selected (English: Expand on selection)
        showExcludedItems: 'Mostra cartelle, tag e note nascosti', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Nascondi cartelle, tag e note nascosti', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Mostra doppio pannello', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Mostra pannello singolo', // Tooltip for button to show single-pane layout (English: Show single pane)
        changeAppearance: 'Cambia aspetto', // Tooltip for button to change folder appearance settings (English: Change appearance)
        search: 'Cerca' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Cerca...', // Placeholder text for search input (English: Search...)
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Cancella ricerca', // Tooltip for clear search button (English: Clear search)
        saveSearchShortcut: 'Salva scorciatoia ricerca',
        removeSearchShortcut: 'Rimuovi scorciatoia ricerca',
        shortcutModalTitle: 'Salva scorciatoia ricerca',
        shortcutNamePlaceholder: 'Inserisci nome scorciatoia'
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'Apri in nuova scheda',
            openToRight: 'Apri a destra',
            openInNewWindow: 'Apri in nuova finestra',
            openMultipleInNewTabs: 'Apri {count} note in nuove schede',
            openMultipleFilesInNewTabs: 'Apri {count} file in nuove schede',
            openMultipleToRight: 'Apri {count} note a destra',
            openMultipleFilesToRight: 'Apri {count} file a destra',
            openMultipleInNewWindows: 'Apri {count} note in nuove finestre',
            openMultipleFilesInNewWindows: 'Apri {count} file in nuove finestre',
            pinNote: 'Fissa nota',
            pinFile: 'Fissa file',
            unpinNote: 'Sblocca nota',
            unpinFile: 'Sblocca file',
            pinMultipleNotes: 'Fissa {count} note',
            pinMultipleFiles: 'Fissa {count} file',
            unpinMultipleNotes: 'Sblocca {count} note',
            unpinMultipleFiles: 'Sblocca {count} file',
            duplicateNote: 'Duplica nota',
            duplicateFile: 'Duplica file',
            duplicateMultipleNotes: 'Duplica {count} note',
            duplicateMultipleFiles: 'Duplica {count} file',
            openVersionHistory: 'Apri cronologia versioni',
            revealInFolder: 'Mostra nella cartella',
            revealInFinder: 'Mostra nel Finder',
            showInExplorer: 'Mostra in esplora risorse',
            copyDeepLink: 'Copia URL Obsidian',
            copyPath: 'Copia percorso file system',
            copyRelativePath: 'Copia percorso vault',
            renameNote: 'Rinomina nota',
            renameFile: 'Rinomina file',
            deleteNote: 'Elimina nota',
            deleteFile: 'Elimina file',
            deleteMultipleNotes: 'Elimina {count} note',
            deleteMultipleFiles: 'Elimina {count} file',
            moveNoteToFolder: 'Sposta nota in...',
            moveFileToFolder: 'Sposta file in...',
            moveMultipleNotesToFolder: 'Sposta {count} note in...',
            moveMultipleFilesToFolder: 'Sposta {count} file in...',
            addTag: 'Aggiungi tag',
            removeTag: 'Rimuovi tag',
            removeAllTags: 'Rimuovi tutti i tag',
            changeIcon: 'Cambia icona',
            changeColor: 'Cambia colore'
        },
        folder: {
            newNote: 'Nuova nota',
            newNoteFromTemplate: 'Nuova nota da modello',
            newFolder: 'Nuova cartella',
            newCanvas: 'Nuova canvas',
            newBase: 'Nuovo base',
            newDrawing: 'Nuovo disegno',
            newExcalidrawDrawing: 'Nuovo disegno Excalidraw',
            newTldrawDrawing: 'Nuovo disegno Tldraw',
            duplicateFolder: 'Duplica cartella',
            searchInFolder: 'Cerca nella cartella',
            copyPath: 'Copia percorso file system',
            copyRelativePath: 'Copia percorso vault',
            createFolderNote: 'Crea nota cartella',
            detachFolderNote: 'Scollega nota cartella',
            deleteFolderNote: 'Elimina nota cartella',
            changeIcon: 'Cambia icona',
            changeColor: 'Cambia colore',
            changeBackground: 'Cambia sfondo',
            excludeFolder: 'Nascondi cartella',
            unhideFolder: 'Mostra cartella',
            moveFolder: 'Sposta cartella in...',
            renameFolder: 'Rinomina cartella',
            deleteFolder: 'Elimina cartella'
        },
        tag: {
            changeIcon: 'Cambia icona',
            changeColor: 'Cambia colore',
            changeBackground: 'Cambia sfondo',
            showTag: 'Mostra tag',
            hideTag: 'Nascondi tag'
        },
        navigation: {
            addSeparator: 'Aggiungi separatore',
            removeSeparator: 'Rimuovi separatore'
        },
        style: {
            title: 'Stile',
            copy: 'Copia stile',
            paste: 'Incolla stile',
            removeIcon: 'Rimuovi icona',
            removeColor: 'Rimuovi colore',
            removeBackground: 'Rimuovi sfondo',
            clear: 'Cancella stile'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        standardPreset: 'Standard',
        compactPreset: 'Compatto',
        defaultSuffix: '(predefinito)',
        titleRows: 'Righe titolo',
        previewRows: 'Righe anteprima',
        groupBy: 'Raggruppa per',
        defaultOption: (rows: number) => `Predefinito (${rows})`,
        defaultTitleOption: (rows: number) => `Righe titolo predefinite (${rows})`,
        defaultPreviewOption: (rows: number) => `Righe anteprima predefinite (${rows})`,
        defaultGroupOption: (groupLabel: string) => `Raggruppamento predefinito (${groupLabel})`,
        titleRowOption: (rows: number) => `${rows} ${rows === 1 ? 'riga' : 'righe'} titolo`,
        previewRowOption: (rows: number) => `${rows} ${rows === 1 ? 'riga' : 'righe'} anteprima`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'Cerca icone...',
            recentlyUsedHeader: 'Usate di recente',
            emptyStateSearch: 'Inizia a digitare per cercare icone',
            emptyStateNoResults: 'Nessuna icona trovata',
            showingResultsInfo: 'Mostrati 50 di {count} risultati. Digita di più per restringere.',
            emojiInstructions: 'Digita o incolla qualsiasi emoji per usarla come icona',
            removeIcon: 'Rimuovi icona',
            allTabLabel: 'Tutte'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Aggiungi regola'
        },
        interfaceIcons: {
            title: "Icone dell'interfaccia",
            items: {
                'nav-shortcuts': 'Scorciatoie',
                'nav-recent-files': 'File recenti',
                'nav-expand-all': 'Espandi tutto',
                'nav-collapse-all': 'Comprimi tutto',
                'nav-tree-expand': 'Freccia albero: espandi',
                'nav-tree-collapse': 'Freccia albero: comprimi',
                'nav-hidden-items': 'Elementi nascosti',
                'nav-root-reorder': 'Riordina cartelle radice',
                'nav-new-folder': 'Nuova cartella',
                'nav-show-single-pane': 'Mostra pannello singolo',
                'nav-show-dual-pane': 'Mostra doppio pannello',
                'nav-profile-chevron': 'Freccia menu profilo',
                'list-search': 'Cerca',
                'list-descendants': 'Note dalle sottocartelle',
                'list-sort-ascending': 'Ordine: crescente',
                'list-sort-descending': 'Ordine: decrescente',
                'list-appearance': 'Cambia aspetto',
                'list-new-note': 'Nuova nota',
                'nav-folder-open': 'Cartella aperta',
                'nav-folder-closed': 'Cartella chiusa',
                'nav-tag': 'Tag',
                'list-pinned': 'Elementi fissati'
            }
        },
        colorPicker: {
            currentColor: 'Attuale',
            newColor: 'Nuovo',
            presetColors: 'Colori predefiniti',
            userColors: 'Colori utente',
            paletteDefault: 'Predefinito',
            paletteCustom: 'Personalizzato',
            copyColors: 'Copia colore',
            colorsCopied: 'Colore copiato negli appunti',
            copyClipboardError: 'Impossibile scrivere negli appunti',
            pasteColors: 'Incolla colore',
            pasteClipboardError: 'Impossibile leggere gli appunti',
            pasteInvalidJson: 'Gli appunti non contengono testo valido',
            pasteInvalidFormat: 'Previsto un valore colore hex',
            colorsPasted: 'Colore incollato con successo',
            resetUserColors: 'Cancella colori personalizzati',
            clearCustomColorsConfirm: 'Rimuovere tutti i colori personalizzati?',
            userColorSlot: 'Colore {slot}',
            recentColors: 'Colori recenti',
            clearRecentColors: 'Cancella colori recenti',
            removeRecentColor: 'Rimuovi colore',
            removeColor: 'Rimuovi colore',
            apply: 'Applica',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'Rosso',
                orange: 'Arancione',
                amber: 'Ambra',
                yellow: 'Giallo',
                lime: 'Lime',
                green: 'Verde',
                emerald: 'Smeraldo',
                teal: 'Foglia di tè',
                cyan: 'Ciano',
                sky: 'Cielo',
                blue: 'Blu',
                indigo: 'Indaco',
                violet: 'Viola',
                purple: 'Porpora',
                fuchsia: 'Fucsia',
                pink: 'Rosa',
                rose: 'Rosa antico',
                gray: 'Grigio',
                slate: 'Ardesia',
                stone: 'Pietra'
            }
        },
        selectVaultProfile: {
            title: 'Seleziona profilo vault',
            currentBadge: 'Attivo',
            emptyState: 'Nessun profilo vault disponibile.'
        },
        tagOperation: {
            renameTitle: 'Rinomina tag {tag}',
            deleteTitle: 'Elimina tag {tag}',
            newTagPrompt: 'Nuovo nome tag',
            newTagPlaceholder: 'Inserisci nuovo nome tag',
            renameWarning: 'Rinominando il tag {oldTag} verranno modificati {count} {files}.',
            deleteWarning: 'Eliminando il tag {tag} verranno modificati {count} {files}.',
            modificationWarning: 'Questo aggiornerà le date di modifica dei file.',
            affectedFiles: 'File interessati:',
            andMore: '...e altri {count}',
            confirmRename: 'Rinomina tag',
            renameUnchanged: '{tag} invariato',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            invalidTagName: 'Inserisci un nome tag valido.',
            descendantRenameError: 'Impossibile spostare un tag in sé stesso o in un discendente.',
            confirmDelete: 'Elimina tag',
            file: 'file',
            files: 'file'
        },
        fileSystem: {
            newFolderTitle: 'Nuova cartella',
            renameFolderTitle: 'Rinomina cartella',
            renameFileTitle: 'Rinomina file',
            deleteFolderTitle: "Eliminare '{name}'?",
            deleteFileTitle: "Eliminare '{name}'?",
            folderNamePrompt: 'Inserisci nome cartella:',
            hideInOtherVaultProfiles: 'Nascondi in altri profili vault',
            renamePrompt: 'Inserisci nuovo nome:',
            renameVaultTitle: 'Cambia nome visualizzato vault',
            renameVaultPrompt: 'Inserisci nome visualizzato personalizzato (lascia vuoto per usare predefinito):',
            deleteFolderConfirm: 'Sei sicuro di voler eliminare questa cartella e tutto il suo contenuto?',
            deleteFileConfirm: 'Sei sicuro di voler eliminare questo file?',
            removeAllTagsTitle: 'Rimuovi tutti i tag',
            removeAllTagsFromNote: 'Sei sicuro di voler rimuovere tutti i tag da questa nota?',
            removeAllTagsFromNotes: 'Sei sicuro di voler rimuovere tutti i tag da {count} note?'
        },
        folderNoteType: {
            title: 'Seleziona tipo nota cartella',
            folderLabel: 'Cartella: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `Sposta ${name} nella cartella...`,
            multipleFilesLabel: (count: number) => `${count} file`,
            navigatePlaceholder: 'Vai alla cartella...',
            instructions: {
                navigate: 'per navigare',
                move: 'per spostare',
                select: 'per selezionare',
                dismiss: 'per chiudere'
            }
        },
        homepage: {
            placeholder: 'Cerca file...',
            instructions: {
                navigate: 'per navigare',
                select: 'per impostare homepage',
                dismiss: 'per chiudere'
            }
        },
        navigationBanner: {
            placeholder: 'Cerca immagini...',
            instructions: {
                navigate: 'per navigare',
                select: 'per impostare banner',
                dismiss: 'per chiudere'
            }
        },
        tagSuggest: {
            placeholder: 'Cerca tag...',
            navigatePlaceholder: 'Vai al tag...',
            addPlaceholder: 'Cerca tag da aggiungere...',
            removePlaceholder: 'Seleziona tag da rimuovere...',
            createNewTag: 'Crea nuovo tag: #{tag}',
            instructions: {
                navigate: 'per navigare',
                select: 'per selezionare',
                dismiss: 'per chiudere',
                add: 'per aggiungere tag',
                remove: 'per rimuovere tag'
            }
        },
        welcome: {
            title: 'Benvenuto in {pluginName}',
            introText:
                'Ciao! Prima di iniziare, ti consiglio vivamente di guardare i primi cinque minuti del video qui sotto per capire come funzionano i pannelli e l\'interruttore "Mostra note dalle sottocartelle".',
            continueText:
                'Se hai altri cinque minuti, continua a guardare il video per capire le modalità di visualizzazione compatta e come configurare correttamente le scorciatoie e i tasti di scelta rapida importanti.',
            thanksText: 'Grazie mille per aver scaricato e buon divertimento!',
            videoAlt: 'Installare e padroneggiare Notebook Navigator',
            openVideoButton: 'Riproduci video',
            closeButton: 'Lo guarderò più tardi'
        }
    },
    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Impossibile creare cartella: {error}',
            createFile: 'Impossibile creare file: {error}',
            renameFolder: 'Impossibile rinominare cartella: {error}',
            renameFolderNoteConflict: 'Impossibile rinominare: "{name}" esiste già in questa cartella',
            renameFile: 'Impossibile rinominare file: {error}',
            deleteFolder: 'Impossibile eliminare cartella: {error}',
            deleteFile: 'Impossibile eliminare file: {error}',
            duplicateNote: 'Impossibile duplicare nota: {error}',
            createCanvas: 'Impossibile creare canvas: {error}',
            createDatabase: 'Impossibile creare database: {error}',
            duplicateFolder: 'Impossibile duplicare cartella: {error}',
            openVersionHistory: 'Impossibile aprire cronologia versioni: {error}',
            versionHistoryNotFound: 'Comando cronologia versioni non trovato. Assicurati che Obsidian Sync sia abilitato.',
            revealInExplorer: 'Impossibile mostrare file in esplora risorse: {error}',
            folderNoteAlreadyExists: 'La nota cartella esiste già',
            folderAlreadyExists: 'La cartella "{name}" esiste già',
            folderNotesDisabled: 'Abilita le note cartella nelle impostazioni per convertire i file',
            folderNoteAlreadyLinked: 'Questo file funge già da nota cartella',
            folderNoteNotFound: 'Nessuna nota cartella nella cartella selezionata',
            folderNoteUnsupportedExtension: 'Estensione file non supportata: {extension}',
            folderNoteMoveFailed: 'Impossibile spostare file durante la conversione: {error}',
            folderNoteRenameConflict: 'Un file chiamato "{name}" esiste già nella cartella',
            folderNoteConversionFailed: 'Impossibile convertire file in nota cartella',
            folderNoteConversionFailedWithReason: 'Impossibile convertire file in nota cartella: {error}',
            folderNoteOpenFailed: 'File convertito ma impossibile aprire nota cartella: {error}',
            failedToDeleteFile: 'Impossibile eliminare {name}: {error}',
            failedToDeleteMultipleFiles: 'Impossibile eliminare {count} file',
            versionHistoryNotAvailable: 'Servizio cronologia versioni non disponibile',
            drawingAlreadyExists: 'Un disegno con questo nome esiste già',
            failedToCreateDrawing: 'Impossibile creare disegno',
            noFolderSelected: 'Nessuna cartella selezionata in Notebook Navigator',
            noFileSelected: 'Nessun file selezionato'
        },
        warnings: {
            linkBreakingNameCharacters: 'Questo nome include caratteri che interrompono i link di Obsidian: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'I nomi non possono iniziare con un punto né includere : o /.',
            forbiddenNameCharactersWindows: 'I caratteri riservati di Windows non sono consentiti: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'Cartella nascosta: {name}',
            showFolder: 'Cartella mostrata: {name}'
        },
        notifications: {
            deletedMultipleFiles: 'Eliminati {count} file',
            movedMultipleFiles: 'Spostati {count} file in {folder}',
            folderNoteConversionSuccess: 'File convertito in nota cartella in "{name}"',
            folderMoved: 'Spostata cartella "{name}"',
            deepLinkCopied: 'URL Obsidian copiato negli appunti',
            pathCopied: 'Percorso copiato negli appunti',
            relativePathCopied: 'Percorso relativo copiato negli appunti',
            tagAddedToNote: 'Tag aggiunto a 1 nota',
            tagAddedToNotes: 'Tag aggiunto a {count} note',
            tagRemovedFromNote: 'Tag rimosso da 1 nota',
            tagRemovedFromNotes: 'Tag rimosso da {count} note',
            tagsClearedFromNote: 'Rimossi tutti i tag da 1 nota',
            tagsClearedFromNotes: 'Rimossi tutti i tag da {count} note',
            noTagsToRemove: 'Nessun tag da rimuovere',
            noFilesSelected: 'Nessun file selezionato',
            tagOperationsNotAvailable: 'Operazioni tag non disponibili',
            tagsRequireMarkdown: 'I tag sono supportati solo nelle note Markdown',
            iconPackDownloaded: '{provider} scaricato',
            iconPackUpdated: '{provider} aggiornato ({version})',
            iconPackRemoved: '{provider} rimosso',
            iconPackLoadFailed: 'Impossibile caricare {provider}',
            hiddenFileReveal: 'Il file è nascosto. Abilita "Mostra elementi nascosti" per visualizzarlo'
        },
        confirmations: {
            deleteMultipleFiles: 'Sei sicuro di voler eliminare {count} file?',
            deleteConfirmation: 'Questa azione non può essere annullata.'
        },
        defaultNames: {
            untitled: 'Senza titolo',
            untitledNumber: 'Senza titolo {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Impossibile spostare una cartella in sé stessa o in una sottocartella.',
            itemAlreadyExists: 'Un elemento chiamato "{name}" esiste già in questa posizione.',
            failedToMove: 'Impossibile spostare: {error}',
            failedToAddTag: 'Impossibile aggiungere tag "{tag}"',
            failedToClearTags: 'Impossibile rimuovere i tag',
            failedToMoveFolder: 'Impossibile spostare cartella "{name}"',
            failedToImportFiles: 'Impossibile importare: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} file esistono già nella destinazione',
            addedTag: 'Aggiunto tag "{tag}" a {count} file',
            filesAlreadyHaveTag: '{count} file hanno già questo tag o uno più specifico',
            clearedTags: 'Rimossi tutti i tag da {count} file',
            noTagsToClear: 'Nessun tag da rimuovere',
            fileImported: 'Importato 1 file',
            filesImported: 'Importati {count} file'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'Oggi',
        yesterday: 'Ieri',
        previous7Days: 'Ultimi 7 giorni',
        previous30Days: 'Ultimi 30 giorni'
    },

    // Weekdays
    weekdays: {
        sunday: 'Domenica',
        monday: 'Lunedì',
        tuesday: 'Martedì',
        wednesday: 'Mercoledì',
        thursday: 'Giovedì',
        friday: 'Venerdì',
        saturday: 'Sabato'
    },

    // Plugin commands
    commands: {
        open: 'Apri', // Command palette: Opens the Notebook Navigator view (English: Open)
        openHomepage: 'Apri homepage', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        revealFile: 'Mostra file', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Cerca', // Command palette: Toggle search in the file list (English: Search)
        toggleDualPane: 'Attiva/disattiva doppio pannello', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        selectVaultProfile: 'Seleziona profilo vault', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'Seleziona profilo vault 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Seleziona profilo vault 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Seleziona profilo vault 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Elimina file', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Crea nuova nota', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Nuova nota da modello', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Sposta file', // Command palette: Move selected files to another folder (English: Move files)
        selectNextFile: 'Seleziona file successivo', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Seleziona file precedente', // Command palette: Selects the previous file in the current view (English: Select previous file)
        convertToFolderNote: 'Converti in nota cartella', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Imposta come nota cartella', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Scollega nota cartella', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Fissa tutte le note cartella', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Vai alla cartella', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Vai al tag', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        addShortcut: 'Aggiungi alle scorciatoie', // Command palette: Adds the current file, folder, or tag to shortcuts (English: Add to shortcuts)
        openShortcut: 'Apri scorciatoia {number}',
        toggleDescendants: 'Attiva/disattiva discendenti', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Attiva/disattiva cartelle, tag e note nascosti', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Attiva/disattiva ordinamento tag', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        collapseExpand: 'Comprimi / espandi tutti gli elementi', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        addTag: 'Aggiungi tag ai file selezionati', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        removeTag: 'Rimuovi tag dai file selezionati', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Rimuovi tutti i tag dai file selezionati', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        rebuildCache: 'Ricostruisci cache' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Mostra in Notebook Navigator' // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Ultima modifica',
        createdAt: 'Creato il',
        file: 'file',
        files: 'file',
        folder: 'cartella',
        folders: 'cartelle'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'Report metadati falliti esportato in: {filename}',
            exportFailed: 'Impossibile esportare report metadati'
        },
        sections: {
            general: 'Generale',
            navigationPane: 'Pannello navigazione',
            icons: 'Pacchetti icone',
            folders: 'Cartelle',
            foldersAndTags: 'Cartelle e tag',
            tags: 'Tag',
            search: 'Ricerca',
            searchAndHotkeys: 'Ricerca e scorciatoie',
            listPane: 'Pannello lista',
            notes: 'Note',
            hotkeys: 'Scorciatoie da tastiera',
            advanced: 'Avanzate'
        },
        groups: {
            general: {
                filtering: 'Filtri',
                behavior: 'Comportamento',
                view: 'Aspetto',
                icons: 'Icone',
                desktopAppearance: 'Aspetto desktop',
                formatting: 'Formattazione'
            },
            navigation: {
                appearance: 'Aspetto',
                shortcutsAndRecent: 'Scorciatoie ed elementi recenti'
            },
            list: {
                display: 'Aspetto',
                pinnedNotes: 'Note fissate',
                quickActions: 'Azioni rapide'
            },
            notes: {
                frontmatter: 'Frontmatter',
                icon: 'Icona',
                title: 'Titolo',
                previewText: 'Testo anteprima',
                featureImage: 'Immagine in evidenza',
                tags: 'Tag',
                date: 'Data',
                parentFolder: 'Cartella superiore'
            }
        },
        items: {
            searchProvider: {
                name: 'Provider di ricerca',
                desc: 'Scegli tra ricerca rapida per nome file o ricerca full-text con il plugin Omnisearch. (non sincronizzato)',
                options: {
                    internal: 'Ricerca con filtro',
                    omnisearch: 'Omnisearch (full-text)'
                },
                info: {
                    filterSearch: {
                        title: 'Ricerca con filtro (predefinito):',
                        description:
                            'Filtra i file per nome e tag nella cartella corrente e sottocartelle. Modalità filtro: testo e tag misti corrispondono a tutti i termini (es. "progetto #lavoro"). Modalità tag: la ricerca solo con tag supporta operatori AND/OR (es. "#lavoro AND #urgente", "#progetto OR #personale"). Cmd/Ctrl+Clic sui tag per aggiungere con AND, Cmd/Ctrl+Maiusc+Clic per aggiungere con OR. Supporta esclusione con prefisso ! (es. !bozza, !#archiviato) e ricerca note senza tag con !#.'
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            "Ricerca full-text che cerca nell'intero vault, poi filtra i risultati per mostrare solo i file dalla cartella corrente, sottocartelle o tag selezionati. Richiede il plugin Omnisearch installato - se non disponibile, la ricerca tornerà automaticamente alla Ricerca con filtro.",
                        warningNotInstalled: 'Plugin Omnisearch non installato. Viene usata la Ricerca con filtro.',
                        limitations: {
                            title: 'Limitazioni note:',
                            performance: 'Prestazioni: Può essere lento, specialmente cercando meno di 3 caratteri in vault grandi',
                            pathBug:
                                'Bug percorsi: Non può cercare in percorsi con caratteri non-ASCII e non cerca correttamente nei sottopercorsi, influenzando quali file appaiono nei risultati',
                            limitedResults:
                                "Risultati limitati: Poiché Omnisearch cerca nell'intero vault e restituisce un numero limitato di risultati prima del filtro, i file rilevanti dalla cartella corrente potrebbero non apparire se ci sono troppe corrispondenze altrove nel vault",
                            previewText:
                                "Testo anteprima: Le anteprime note sono sostituite con estratti dei risultati Omnisearch, che potrebbero non mostrare l'evidenziazione della corrispondenza se appare altrove nel file"
                        }
                    }
                }
            },
            listPaneTitle: {
                name: 'Titolo pannello lista (solo desktop)',
                desc: 'Scegli dove mostrare il titolo del pannello lista.',
                options: {
                    header: "Mostra nell'intestazione",
                    list: 'Mostra nel pannello lista',
                    hidden: 'Non mostrare'
                }
            },
            sortNotesBy: {
                name: 'Ordina note per',
                desc: "Scegli come ordinare le note nell'elenco.",
                options: {
                    'modified-desc': 'Data modifica (più recenti in alto)',
                    'modified-asc': 'Data modifica (più vecchie in alto)',
                    'created-desc': 'Data creazione (più recenti in alto)',
                    'created-asc': 'Data creazione (più vecchie in alto)',
                    'title-asc': 'Titolo (A in alto)',
                    'title-desc': 'Titolo (Z in alto)'
                }
            },
            revealFileOnListChanges: {
                name: 'Scorri al file selezionato quando la lista cambia',
                desc: "Scorri al file selezionato quando fissi note, mostri note discendenti, cambi l'aspetto cartella o esegui operazioni sui file."
            },
            includeDescendantNotes: {
                name: 'Mostra note da sottocartelle / discendenti (non sincronizzato)',
                desc: 'Includi note da sottocartelle nidificate e tag discendenti quando visualizzi una cartella o tag.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Limita note fissate alla loro cartella',
                desc: 'Le note fissate appaiono solo quando visualizzi la cartella o il tag dove sono state fissate.'
            },
            separateNoteCounts: {
                name: 'Mostra conteggi correnti e discendenti separatamente',
                desc: 'Visualizza i conteggi note nel formato "correnti ▾ discendenti" in cartelle e tag.'
            },
            groupNotes: {
                name: 'Raggruppa note',
                desc: 'Visualizza intestazioni tra note raggruppate per data o cartella. Le viste tag usano gruppi per data quando il raggruppamento per cartella è abilitato.',
                options: {
                    none: 'Non raggruppare',
                    date: 'Raggruppa per data',
                    folder: 'Raggruppa per cartella'
                }
            },
            showPinnedGroupHeader: {
                name: 'Mostra intestazione gruppo fissate',
                desc: "Visualizza l'intestazione della sezione fissate sopra le note fissate."
            },
            showPinnedIcon: {
                name: 'Mostra icona fissate',
                desc: "Mostra l'icona accanto all'intestazione della sezione fissate."
            },
            defaultListMode: {
                name: 'Modalità lista predefinita',
                desc: "Seleziona il layout lista predefinito. Standard mostra titolo, data, descrizione e testo anteprima. Compatto mostra solo il titolo. Sovrascrivi l'aspetto per cartella.",
                options: {
                    standard: 'Standard',
                    compact: 'Compatto'
                }
            },
            showFileIcons: {
                name: 'Mostra icone file',
                desc: 'Visualizza icone file con spaziatura allineata a sinistra. Disabilitando rimuove sia icone che indentazione. Priorità: personalizzato > nome file > tipo file > predefinito.'
            },
            showFilenameMatchIcons: {
                name: 'Icone per nome file',
                desc: 'Assegna icone ai file in base al testo nei loro nomi.'
            },
            fileNameIconMap: {
                name: 'Mappa icone per nome',
                desc: "I file contenenti il testo ottengono l'icona specificata. Una mappatura per riga: testo=icona",
                placeholder: '# testo=icona\nriunione=LiCalendar\nfattura=PhReceipt',
                editTooltip: 'Modifica mappature'
            },
            showCategoryIcons: {
                name: 'Icone per tipo file',
                desc: 'Assegna icone ai file in base alla loro estensione.'
            },
            fileTypeIconMap: {
                name: 'Mappa icone per tipo',
                desc: "I file con l'estensione ottengono l'icona specificata. Una mappatura per riga: estensione=icona",
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: 'Modifica mappature'
            },
            optimizeNoteHeight: {
                name: 'Altezza nota variabile',
                desc: 'Usa altezza compatta per note fissate e note senza testo anteprima.'
            },
            compactItemHeight: {
                name: 'Altezza elemento compatto',
                desc: "Imposta l'altezza degli elementi lista compatta su desktop e mobile.",
                resetTooltip: 'Ripristina predefinito (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Scala testo con altezza elemento compatto',
                desc: "Scala il testo della lista compatta quando l'altezza elemento è ridotta."
            },
            showParentFolder: {
                name: 'Mostra cartella genitore',
                desc: 'Visualizza il nome della cartella genitore per note in sottocartelle o tag.'
            },
            parentFolderClickRevealsFile: {
                name: 'Click su cartella genitore apre cartella',
                desc: "Cliccando sull'etichetta cartella genitore apre la cartella nel pannello elenco."
            },
            showParentFolderColor: {
                name: 'Mostra colore cartella genitore',
                desc: 'Usa i colori cartella sulle etichette cartella genitore.'
            },
            showQuickActions: {
                name: 'Mostra azioni rapide (solo desktop)',
                desc: 'Mostra pulsanti azione al passaggio del mouse sui file. I controlli pulsanti selezionano quali azioni appaiono.'
            },
            dualPane: {
                name: 'Layout doppio pannello (non sincronizzato)',
                desc: 'Mostra pannello navigazione e pannello lista affiancati su desktop.'
            },
            dualPaneOrientation: {
                name: 'Orientamento doppio pannello (non sincronizzato)',
                desc: 'Scegli layout orizzontale o verticale quando il doppio pannello è attivo.',
                options: {
                    horizontal: 'Divisione orizzontale',
                    vertical: 'Divisione verticale'
                }
            },
            appearanceBackground: {
                name: 'Colore sfondo',
                desc: 'Scegli i colori sfondo per i pannelli navigazione e lista.',
                options: {
                    separate: 'Sfondi separati',
                    primary: 'Usa sfondo lista',
                    secondary: 'Usa sfondo navigazione'
                }
            },
            appearanceScale: {
                name: 'Livello zoom (non sincronizzato)',
                desc: 'Controlla il livello di zoom complessivo di Notebook Navigator.'
            },
            startView: {
                name: "Vista predefinita all'avvio",
                desc: "Scegli quale pannello visualizzare all'apertura di Notebook Navigator. Il pannello navigazione mostra scorciatoie, note recenti e albero cartelle. Il pannello lista mostra subito l'elenco note.",
                options: {
                    navigation: 'Pannello navigazione',
                    files: 'Pannello lista'
                }
            },
            toolbarButtons: {
                name: 'Pulsanti barra strumenti',
                desc: 'Scegli quali pulsanti appaiono nella barra strumenti. I pulsanti nascosti rimangono accessibili tramite comandi e menu.',
                navigationLabel: 'Barra strumenti navigazione',
                listLabel: 'Barra strumenti lista'
            },
            autoRevealActiveNote: {
                name: 'Auto-mostra nota attiva',
                desc: 'Mostra automaticamente le note quando aperte da Switcher rapido, link o ricerca.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Ignora eventi dalla barra laterale destra',
                desc: 'Non cambiare nota attiva quando clicchi o cambi note nella barra laterale destra.'
            },
            paneTransitionDuration: {
                name: 'Animazione pannello singolo',
                desc: 'Durata della transizione quando si passa tra i pannelli in modalità pannello singolo (millisecondi).',
                resetTooltip: 'Ripristina predefinito'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Auto-seleziona prima nota (solo desktop)',
                desc: 'Apri automaticamente la prima nota quando cambi cartella o tag.'
            },
            skipAutoScroll: {
                name: 'Disabilita auto-scroll per scorciatoie',
                desc: 'Non scorrere il pannello navigazione quando clicchi elementi nelle scorciatoie.'
            },
            autoExpandFoldersTags: {
                name: 'Espandi alla selezione',
                desc: 'Espandi cartelle e tag quando selezionati. In modalità pannello singolo, la prima selezione espande, la seconda mostra i file.'
            },
            springLoadedFolders: {
                name: 'Espandi durante il trascinamento (solo desktop)',
                desc: 'Espandi cartelle e tag al passaggio del mouse durante il trascinamento.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Ritardo prima espansione',
                desc: 'Ritardo prima che la prima cartella o tag si espanda durante un trascinamento (secondi).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Ritardo espansioni successive',
                desc: 'Ritardo prima di espandere cartelle o tag aggiuntivi durante lo stesso trascinamento (secondi).'
            },
            navigationBanner: {
                name: 'Banner navigazione (profilo vault)',
                desc: "Visualizza un'immagine sopra il pannello navigazione. Cambia con il profilo vault selezionato.",
                current: 'Banner attuale: {path}',
                chooseButton: 'Scegli immagine'
            },
            showShortcuts: {
                name: 'Mostra scorciatoie',
                desc: 'Visualizza la sezione scorciatoie nel pannello navigazione.'
            },
            shortcutBadgeDisplay: {
                name: 'Badge scorciatoia',
                desc: "Cosa visualizzare accanto alle scorciatoie. Usa i comandi 'Apri scorciatoia 1-9' per aprire le scorciatoie direttamente.",
                options: {
                    index: 'Posizione (1-9)',
                    count: 'Numero elementi',
                    none: 'Nessuno'
                }
            },
            showRecentNotes: {
                name: 'Mostra note recenti',
                desc: 'Visualizza la sezione note recenti nel pannello navigazione.'
            },
            recentNotesCount: {
                name: 'Numero note recenti',
                desc: 'Numero di note recenti da visualizzare.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Fissa note recenti con scorciatoie',
                desc: 'Includi le note recenti quando le scorciatoie sono fissate.'
            },
            showTooltips: {
                name: 'Mostra tooltip',
                desc: 'Visualizza tooltip al passaggio del mouse con informazioni aggiuntive per note e cartelle.'
            },
            showTooltipPath: {
                name: 'Mostra percorso',
                desc: 'Visualizza il percorso cartella sotto i nomi note nei tooltip.'
            },
            resetPaneSeparator: {
                name: 'Ripristina posizione separatore pannelli',
                desc: 'Ripristina il separatore trascinabile tra pannello navigazione e pannello lista alla posizione predefinita.',
                buttonText: 'Ripristina separatore',
                notice: 'Posizione separatore ripristinata. Riavvia Obsidian o riapri Notebook Navigator per applicare.'
            },
            multiSelectModifier: {
                name: 'Modificatore selezione multipla (solo desktop)',
                desc: 'Scegli quale tasto modificatore attiva la selezione multipla. Quando Option/Alt è selezionato, Cmd/Ctrl click apre le note in una nuova scheda.',
                options: {
                    cmdCtrl: 'Click Cmd/Ctrl',
                    optionAlt: 'Click Option/Alt'
                }
            },
            fileVisibility: {
                name: 'Mostra tipi file (profilo vault)',
                desc: 'Filtra quali tipi di file vengono mostrati nel navigatore. I tipi file non supportati da Obsidian potrebbero aprirsi in applicazioni esterne.',
                options: {
                    documents: 'Documenti (.md, .canvas, .base)',
                    supported: 'Supportati (si aprono in Obsidian)',
                    all: 'Tutti (potrebbero aprirsi esternamente)'
                }
            },
            homepage: {
                name: 'Homepage',
                desc: 'Scegli il file che Notebook Navigator apre automaticamente, come una dashboard.',
                current: 'Attuale: {path}',
                currentMobile: 'Mobile: {path}',
                chooseButton: 'Scegli file',

                separateMobile: {
                    name: 'Homepage mobile separata',
                    desc: 'Usa una homepage diversa per dispositivi mobili.'
                }
            },
            excludedNotes: {
                name: 'Nascondi note (profilo vault)',
                desc: 'Lista di proprietà frontmatter separate da virgola. Le note contenenti una qualsiasi di queste proprietà saranno nascoste (es. bozza, privato, archiviato).',
                placeholder: 'bozza, privato'
            },
            excludedFileNamePatterns: {
                name: 'Nascondi file (profilo vault)',
                desc: 'Lista di pattern di nomi file separati da virgola da nascondere. Supporta caratteri jolly * e percorsi / (es. temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Profilo vault',
                desc: "I profili memorizzano visibilità tipi file, file nascosti, cartelle nascoste, tag nascosti, note nascoste, scorciatoie e banner navigazione. Cambia profilo dall'intestazione del pannello navigazione.",
                defaultName: 'Predefinito',
                addButton: 'Aggiungi profilo',
                editProfilesButton: 'Modifica profili',
                addProfileOption: 'Aggiungi profilo...',
                applyButton: 'Applica',
                editButton: 'Modifica profilo',
                deleteButton: 'Elimina profilo',
                addModalTitle: 'Aggiungi profilo',
                editProfilesModalTitle: 'Modifica profili',
                editModalTitle: 'Modifica profilo',
                addModalPlaceholder: 'Nome profilo',
                deleteModalTitle: 'Elimina {name}',
                deleteModalMessage:
                    'Rimuovere {name}? I filtri file, cartelle, tag e note nascoste salvati in questo profilo saranno eliminati.',
                moveUp: 'Sposta su',
                moveDown: 'Sposta giù',
                errors: {
                    emptyName: 'Inserisci un nome profilo',
                    duplicateName: 'Nome profilo già esistente'
                }
            },
            vaultTitle: {
                name: 'Posizione titolo vault (solo desktop)',
                desc: 'Scegli dove viene mostrato il titolo del vault.',
                options: {
                    header: "Mostra nell'intestazione",
                    navigation: 'Mostra nel pannello di navigazione'
                }
            },
            excludedFolders: {
                name: 'Nascondi cartelle (profilo vault)',
                desc: 'Lista di cartelle da nascondere separate da virgola. Pattern nome: assets* (cartelle che iniziano con assets), *_temp (che finiscono con _temp). Pattern percorso: /archivio (solo archivio root), /res* (cartelle root che iniziano con res), /*/temp (cartelle temp un livello sotto), /progetti/* (tutte le cartelle in progetti).',
                placeholder: 'modelli, assets*, /archivio, /res*'
            },
            showFileDate: {
                name: 'Mostra data',
                desc: 'Visualizza la data sotto i nomi note.'
            },
            alphabeticalDateMode: {
                name: 'Quando ordini per nome',
                desc: 'Data da mostrare quando le note sono ordinate alfabeticamente.',
                options: {
                    created: 'Data creazione',
                    modified: 'Data modifica'
                }
            },
            showFileTags: {
                name: 'Mostra tag file',
                desc: 'Visualizza tag cliccabili negli elementi file.'
            },
            showFileTagAncestors: {
                name: 'Mostra percorsi tag completi',
                desc: "Visualizza percorsi gerarchia tag completi. Quando abilitato: 'ai/openai', 'lavoro/progetti/2024'. Quando disabilitato: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Colora tag file',
                desc: 'Applica colori tag ai badge tag sugli elementi file.'
            },
            prioritizeColoredFileTags: {
                name: 'Mostra tag colorati prima',
                desc: 'Ordina i tag colorati prima degli altri tag sugli elementi file.'
            },
            showFileTagsInCompactMode: {
                name: 'Mostra tag file in modalità compatta',
                desc: 'Visualizza tag quando data, anteprima e immagine sono nascosti.'
            },
            dateFormat: {
                name: 'Formato data',
                desc: 'Formato per visualizzare le date (usa formato date-fns).',
                placeholder: 'd MMM yyyy',
                help: 'Formati comuni:\nd MMM yyyy = 25 mag 2022\ndd/MM/yyyy = 25/05/2022\nyyyy-MM-dd = 2022-05-25\n\nToken:\nyyyy/yy = anno\nMMMM/MMM/MM = mese\ndd/d = giorno\nEEEE/EEE = giorno settimana',
                helpTooltip: 'Clicca per riferimento formato'
            },
            timeFormat: {
                name: 'Formato ora',
                desc: 'Formato per visualizzare le ore (usa formato date-fns).',
                placeholder: 'HH:mm',
                help: 'Formati comuni:\nh:mm a = 2:30 PM (12 ore)\nHH:mm = 14:30 (24 ore)\nh:mm:ss a = 2:30:45 PM\nHH:mm:ss = 14:30:45\n\nToken:\nHH/H = 24 ore\nhh/h = 12 ore\nmm = minuti\nss = secondi\na = AM/PM',
                helpTooltip: 'Clicca per riferimento formato'
            },
            showFilePreview: {
                name: 'Mostra anteprima nota',
                desc: 'Visualizza testo anteprima sotto i nomi note.'
            },
            skipHeadingsInPreview: {
                name: "Salta intestazioni nell'anteprima",
                desc: 'Salta righe intestazione quando generi testo anteprima.'
            },
            skipCodeBlocksInPreview: {
                name: "Salta blocchi codice nell'anteprima",
                desc: 'Salta blocchi codice quando generi testo anteprima.'
            },
            stripHtmlInPreview: {
                name: 'Rimuovi HTML nelle anteprime',
                desc: 'Rimuove i tag HTML dal testo di anteprima. Potrebbe influire sulle prestazioni nelle note lunghe.'
            },
            previewProperties: {
                name: 'Proprietà anteprima',
                desc: 'Lista di proprietà frontmatter separate da virgola da controllare per testo anteprima. La prima proprietà con testo sarà usata.',
                placeholder: 'sommario, descrizione, abstract',
                info: "Se nessun testo anteprima viene trovato nelle proprietà specificate, l'anteprima sarà generata dal contenuto nota."
            },
            previewRows: {
                name: 'Righe anteprima',
                desc: 'Numero di righe da visualizzare per il testo anteprima.',
                options: {
                    '1': '1 riga',
                    '2': '2 righe',
                    '3': '3 righe',
                    '4': '4 righe',
                    '5': '5 righe'
                }
            },
            fileNameRows: {
                name: 'Righe titolo',
                desc: 'Numero di righe da visualizzare per i titoli note.',
                options: {
                    '1': '1 riga',
                    '2': '2 righe'
                }
            },
            showFeatureImage: {
                name: 'Mostra immagine in evidenza',
                desc: 'Visualizza una miniatura della prima immagine trovata nella nota.'
            },
            forceSquareFeatureImage: {
                name: 'Forza immagine in evidenza quadrata',
                desc: 'Renderizza immagini in evidenza come miniature quadrate.'
            },
            featureImageProperties: {
                name: 'Proprietà immagine',
                desc: "Lista di proprietà frontmatter separate da virgola da controllare per immagini miniatura. La prima proprietà con un'immagine sarà usata. Se vuoto e l'impostazione fallback è abilitata, la prima immagine incorporata sarà usata.",
                placeholder: 'thumbnail, featureResized, feature'
            },

            downloadExternalFeatureImages: {
                name: 'Scarica immagini esterne',
                desc: 'Scarica immagini remote e miniature di YouTube per le immagini in evidenza.'
            },
            showRootFolder: {
                name: 'Mostra cartella root',
                desc: "Visualizza il nome vault come cartella root nell'albero."
            },
            showFolderIcons: {
                name: 'Mostra icone cartelle',
                desc: 'Visualizza icone accanto alle cartelle nel pannello navigazione.'
            },
            inheritFolderColors: {
                name: 'Eredita colori cartelle',
                desc: 'Le sottocartelle ereditano il colore dalle cartelle genitore.'
            },
            showNoteCount: {
                name: 'Mostra conteggio note',
                desc: 'Visualizza il numero di note accanto a ogni cartella e tag.'
            },
            showSectionIcons: {
                name: 'Mostra icone per scorciatoie e elementi recenti',
                desc: 'Visualizza icone per sezioni navigazione come Scorciatoie e File recenti.'
            },
            interfaceIcons: {
                name: "Icone dell'interfaccia",
                desc: 'Modifica icone di barra strumenti, cartelle, tag, elementi fissati, ricerca e ordinamento.',
                buttonText: 'Modifica icone'
            },
            showIconsColorOnly: {
                name: 'Applica colore solo alle icone',
                desc: 'Quando abilitato, i colori personalizzati sono applicati solo alle icone. Quando disabilitato, i colori sono applicati sia alle icone che alle etichette testo.'
            },
            collapseBehavior: {
                name: 'Comprimi elementi',
                desc: 'Scegli cosa influenza il pulsante espandi/comprimi tutto.',
                options: {
                    all: 'Tutte cartelle e tag',
                    foldersOnly: 'Solo cartelle',
                    tagsOnly: 'Solo tag'
                }
            },
            smartCollapse: {
                name: 'Mantieni elemento selezionato espanso',
                desc: 'Quando comprimi, mantieni la cartella o tag attualmente selezionato e i suoi genitori espansi.'
            },
            navIndent: {
                name: 'Indentazione albero',
                desc: 'Regola la larghezza indentazione per cartelle e tag nidificati.'
            },
            navItemHeight: {
                name: 'Altezza elemento',
                desc: "Regola l'altezza di cartelle e tag nel pannello navigazione."
            },
            navItemHeightScaleText: {
                name: 'Scala testo con altezza elemento',
                desc: "Riduci dimensione testo navigazione quando l'altezza elemento è ridotta."
            },
            navRootSpacing: {
                name: 'Spaziatura elementi root',
                desc: 'Spaziatura tra cartelle e tag di livello root.'
            },
            showTags: {
                name: 'Mostra tag',
                desc: 'Visualizza sezione tag nel navigatore.'
            },
            showTagIcons: {
                name: 'Mostra icone tag',
                desc: 'Visualizza icone accanto ai tag nel pannello navigazione.'
            },
            inheritTagColors: {
                name: 'Eredita colori dei tag',
                desc: 'I tag figli ereditano il colore dai tag genitori.'
            },
            tagSortOrder: {
                name: 'Ordine tag',
                desc: 'Scegli come ordinare i tag nel pannello navigazione. (non sincronizzato)',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A',
                    frequencyAsc: 'Frequenza (bassa ad alta)',
                    frequencyDesc: 'Frequenza (alta a bassa)'
                }
            },
            showAllTagsFolder: {
                name: 'Mostra cartella tag',
                desc: 'Visualizza "Tag" come cartella comprimibile.'
            },
            showUntagged: {
                name: 'Mostra note senza tag',
                desc: 'Visualizza elemento "Senza tag" per note senza alcun tag.'
            },
            keepEmptyTagsProperty: {
                name: 'Mantieni proprietà tags dopo rimozione ultimo tag',
                desc: 'Mantieni la proprietà tags frontmatter quando tutti i tag sono rimossi. Quando disabilitato, la proprietà tags è eliminata dal frontmatter.'
            },
            hiddenTags: {
                name: 'Nascondi tag (profilo vault)',
                desc: 'Lista di pattern tag separati da virgola. Pattern nome: tag* (inizia con), *tag (finisce con). Pattern percorso: archivio (tag e discendenti), archivio/* (solo discendenti), progetti/*/bozze (wildcard intermedio).',
                placeholder: 'archivio*, *bozza, progetti/*/vecchio'
            },
            enableFolderNotes: {
                name: 'Abilita note cartella',
                desc: 'Quando abilitato, le cartelle con note associate sono visualizzate come link cliccabili.'
            },
            folderNoteType: {
                name: 'Tipo nota cartella predefinito',
                desc: 'Tipo nota cartella creata dal menu contestuale.',
                options: {
                    ask: 'Chiedi quando crei',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'Nome nota cartella',
                desc: 'Nome della nota cartella senza estensione. Lascia vuoto per usare lo stesso nome della cartella.',
                placeholder: 'index'
            },
            folderNoteProperties: {
                name: 'Proprietà nota cartella',
                desc: 'YAML frontmatter aggiunto alle nuove note cartella. I marcatori --- sono aggiunti automaticamente.',
                placeholder: 'theme: dark\nfoldernote: true'
            },
            hideFolderNoteInList: {
                name: 'Nascondi note cartella nella lista',
                desc: "Nascondi la nota cartella dall'apparire nell'elenco note della cartella."
            },
            pinCreatedFolderNote: {
                name: 'Fissa note cartella create',
                desc: 'Fissa automaticamente le note cartella quando create dal menu contestuale.'
            },
            confirmBeforeDelete: {
                name: 'Conferma prima di eliminare',
                desc: 'Mostra dialogo conferma quando elimini note o cartelle'
            },
            interceptTagClicks: {
                name: 'Naviga ai tag al clic',
                desc: 'Quando clicchi sui tag nelle note, naviga a quel tag in Notebook Navigator invece di attivare la ricerca di Obsidian.'
            },
            metadataCleanup: {
                name: 'Pulisci metadati',
                desc: 'Rimuove metadati orfani lasciati quando file, cartelle o tag sono eliminati, spostati o rinominati fuori da Obsidian. Questo influisce solo sul file impostazioni Notebook Navigator.',
                buttonText: 'Pulisci metadati',
                error: 'Pulizia impostazioni fallita',
                loading: 'Controllo metadati...',
                statusClean: 'Nessun metadato da pulire',
                statusCounts: 'Elementi orfani: {folders} cartelle, {tags} tag, {files} file, {pinned} fissati, {separators} separatori'
            },
            rebuildCache: {
                name: 'Ricostruisci cache',
                desc: 'Usa se riscontri tag mancanti, anteprime errate o immagini in evidenza mancanti. Questo può accadere dopo conflitti sync o chiusure inaspettate.',
                buttonText: 'Ricostruisci cache',
                success: 'Cache ricostruita',
                error: 'Impossibile ricostruire cache',
                indexingTitle: 'Indicizzazione del vault...',
                progress: 'Aggiornamento della cache di Notebook Navigator.'
            },
            hotkeys: {
                intro: 'Modifica <cartella plugin>/notebook-navigator/data.json per personalizzare le scorciatoie da tastiera di Notebook Navigator. Apri il file e trova la sezione "keyboardShortcuts". Ogni voce usa questa struttura:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Shift',
                    '"Ctrl" = Control (preferisci "Mod" per cross-platform)'
                ],
                guidance:
                    'Aggiungi più mapping per supportare tasti alternativi, come i binding ArrowUp e K mostrati sopra. Combina modificatori in una voce elencando ogni valore, ad esempio "modifiers": ["Mod", "Shift"]. Sequenze tastiera come "gg" o "dd" non sono supportate. Ricarica Obsidian dopo aver modificato il file.'
            },
            externalIcons: {
                downloadButton: 'Scarica',
                downloadingLabel: 'Scaricamento...',
                removeButton: 'Rimuovi',
                statusInstalled: 'Scaricato (versione {version})',
                statusNotInstalled: 'Non scaricato',
                versionUnknown: 'sconosciuta',
                downloadFailed: 'Impossibile scaricare {name}. Controlla la connessione e riprova.',
                removeFailed: 'Impossibile rimuovere {name}.',
                infoNote:
                    'I pacchetti icone scaricati sincronizzano lo stato installazione tra dispositivi. I pacchetti icone rimangono nel database locale su ogni dispositivo; la sync traccia solo se scaricarli o rimuoverli. I pacchetti icone si scaricano dal repository Notebook Navigator (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterDates: {
                name: 'Usa metadati frontmatter',
                desc: 'Usa frontmatter per nome nota, timestamp, icone e colori'
            },
            frontmatterIconField: {
                name: 'Campo icona',
                desc: 'Campo frontmatter per icone file. Lascia vuoto per usare icone salvate nelle impostazioni.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'Campo colore',
                desc: 'Campo frontmatter per colori file. Lascia vuoto per usare colori salvati nelle impostazioni.',
                placeholder: 'color'
            },
            frontmatterSaveMetadata: {
                name: 'Salva icone e colori nel frontmatter',
                desc: 'Scrivi automaticamente icone e colori file nel frontmatter usando i campi configurati sopra.'
            },
            frontmatterMigration: {
                name: 'Migra icone e colori dalle impostazioni',
                desc: 'Salvati nelle impostazioni: {icons} icone, {colors} colori.',
                button: 'Migra',
                buttonWorking: 'Migrazione...',
                noticeNone: 'Nessuna icona o colore file salvato nelle impostazioni.',
                noticeDone: 'Migrati {migratedIcons}/{icons} icone, {migratedColors}/{colors} colori.',
                noticeFailures: 'Voci fallite: {failures}.',
                noticeError: 'Migrazione fallita. Controlla console per dettagli.'
            },
            frontmatterNameField: {
                name: 'Campi nome',
                desc: 'Elenco di campi frontmatter separati da virgola. Viene usato il primo valore non vuoto. Usa il nome file come alternativa.',
                placeholder: 'titolo, nome'
            },
            frontmatterCreatedField: {
                name: 'Campo timestamp creazione',
                desc: 'Nome campo frontmatter per timestamp creazione. Lascia vuoto per usare solo data file system.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'Campo timestamp modifica',
                desc: 'Nome campo frontmatter per timestamp modifica. Lascia vuoto per usare solo data file system.',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'Formato timestamp',
                desc: 'Formato usato per parsare timestamp nel frontmatter. Lascia vuoto per usare formato ISO 8601',
                helpTooltip: 'Vedi documentazione formato date-fns',
                help: "Formati comuni:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'Supporta lo sviluppo',
                desc: 'Se ami usare Notebook Navigator, considera di supportare il suo sviluppo continuo.',
                buttonText: '❤️ Sponsorizza',
                coffeeButton: '☕️ Offrimi un caffè'
            },
            updateCheckOnStart: {
                name: "Controlla nuova versione all'avvio",
                desc: "Controlla nuovi rilasci plugin all'avvio e mostra notifica quando un aggiornamento è disponibile. Ogni versione è annunciata solo una volta, e i controlli avvengono al massimo una volta al giorno.",
                status: 'Nuova versione disponibile: {version}'
            },
            whatsNew: {
                name: 'Novità in Notebook Navigator {version}',
                desc: 'Vedi aggiornamenti e miglioramenti recenti',
                buttonText: 'Vedi aggiornamenti recenti'
            },
            masteringVideo: {
                name: 'Padroneggiare Notebook Navigator (video)',
                desc: 'Questo video copre tutto ciò che serve per essere produttivi in Notebook Navigator, incluse scorciatoie da tastiera, ricerca, tag e personalizzazione avanzata.'
            },
            cacheStatistics: {
                localCache: 'Cache locale',
                items: 'elementi',
                withTags: 'con tag',
                withPreviewText: 'con testo anteprima',
                withFeatureImage: 'con immagine in evidenza',
                withMetadata: 'con metadati'
            },
            metadataInfo: {
                successfullyParsed: 'Parsati con successo',
                itemsWithName: 'elementi con nome',
                withCreatedDate: 'con data creazione',
                withModifiedDate: 'con data modifica',
                withIcon: 'con icona',
                withColor: 'con colore',
                failedToParse: 'Impossibile parsare',
                createdDates: 'date creazione',
                modifiedDates: 'date modifica',
                checkTimestampFormat: 'Controlla il formato timestamp.',
                exportFailed: 'Esporta errori'
            }
        }
    },
    whatsNew: {
        title: 'Novità in Notebook Navigator',
        supportMessage: 'Se trovi Notebook Navigator utile, considera di supportare il suo sviluppo.',
        supportButton: 'Offrimi un caffè',
        thanksButton: 'Grazie!'
    }
};
