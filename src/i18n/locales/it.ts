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
        restoreDefault: 'Ripristina predefinito', // Button text for restoring values to defaults (English: Restore default)
        submit: 'Invia', // Button text for submitting forms and dialogs (English: Submit)
        save: 'Salva', // Button text for saving settings and dialogs (English: Save)
        configure: 'Configura', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'Modalità chiara', // Label for light theme mode (English: Light mode)
        darkMode: 'Modalità scura', // Label for dark theme mode (English: Dark mode)
        noSelection: 'Nessuna selezione', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Senza tag', // Label for notes without any tags (English: Untagged)
        featureImageAlt: 'Immagine in evidenza', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Errore sconosciuto', // Generic fallback when an error has no message (English: Unknown error)
        clipboardWriteError: 'Impossibile scrivere negli appunti',
        updateBannerTitle: 'Aggiornamento Notebook Navigator disponibile',
        updateBannerInstruction: 'Aggiorna in Impostazioni -> Plugin della community',
        previous: 'Precedente', // Generic aria label for previous navigation (English: Previous)
        next: 'Successivo' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Seleziona una cartella o un tag per visualizzare le note', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Nessuna nota', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Fissate', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Note', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'File', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (nascosto)', // Accessibility label applied to list items that are normally hidden
        collapseGroup: 'Comprimi gruppo',
        expandGroup: 'Espandi gruppo',
        manualSortTitle: 'Ordinamento manuale: {property}',
        manualSortHint: 'Trascina per riordinare. L\'ordine è salvato come valori indice numerici nella proprietà "{property}".',
        manualSortNonMarkdownHint: 'I file non Markdown sono mostrati in fondo e non possono essere riordinati.',
        unsortedSection: 'Non ordinato',
        manualSortDone: 'Fatto',
        manualSortMultipleWriteFailure: '{count} file non riusciti; primo: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Senza tag', // Label for the special item showing notes without tags (English: Untagged)
        tags: 'Tag' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Scorciatoie', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentFilesHeader: 'File recenti', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Proprietà',
        reorderRootFoldersTitle: 'Riordina navigazione',
        reorderRootFoldersHint: 'Usa frecce o trascina per riordinare',
        vaultRootLabel: 'Vault',
        resetRootToAlpha: 'Ripristina ordine alfabetico',
        resetRootToFrequency: 'Ripristina ordine per frequenza',
        pinShortcuts: 'Fissa scorciatoie',
        pinShortcutsAndRecentFiles: 'Fissa scorciatoie e file recenti',
        unpinShortcuts: 'Rimuovi fissatura scorciatoie',
        unpinShortcutsAndRecentFiles: 'Rimuovi fissatura scorciatoie e file recenti',
        profileMenuAria: 'Cambia profilo vault'
    },

    navigationCalendar: {
        ariaLabel: 'Calendario',
        dailyNotesNotEnabled: 'Il plugin delle note giornaliere non è abilitato.',
        createDailyNote: {
            title: 'Nuova nota giornaliera',
            message: 'Il file {filename} non esiste. Vuoi crearlo?',
            confirmButton: 'Crea'
        },
        helpModal: {
            title: 'Scorciatoie del calendario',
            items: [
                'Fai clic su un giorno per aprire o creare una nota giornaliera. Settimane, mesi, trimestri e anni funzionano allo stesso modo.',
                'Un punto pieno sotto un giorno indica che ha una nota. Un punto vuoto indica che ha attività incomplete.',
                "Se una nota ha un'immagine in evidenza, appare come sfondo del giorno."
            ],
            dateFilterCmdCtrl: "`Cmd/Ctrl`+clic su una data per filtrare per quella data nell'elenco dei file.",
            dateFilterOptionAlt: "`Option/Alt`+clic su una data per filtrare per quella data nell'elenco dei file."
        }
    },

    dailyNotes: {
        templateReadFailed: 'Impossibile leggere il modello della nota giornaliera.',
        createFailed: 'Impossibile creare la nota giornaliera.'
    },

    shortcuts: {
        folderExists: 'Cartella già presente nelle scorciatoie',
        noteExists: 'Nota già presente nelle scorciatoie',
        tagExists: 'Tag già presente nelle scorciatoie',
        propertyExists: 'Proprietà già presente nei preferiti',
        invalidProperty: 'Scorciatoia proprietà non valida',
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
        showCalendar: 'Mostra calendario',
        hideCalendar: 'Nascondi calendario',
        newFolder: 'Nuova cartella', // Tooltip for create new folder button (English: New folder)
        newNote: 'Nuova nota', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Torna alla navigazione', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeChildSortOrder: 'Cambia ordine',
        changeSortAndGroup: 'Cambia ordine e raggruppamento',
        resetViewToDefaults: 'Ripristina vista alle impostazioni predefinite',
        manualSort: 'Ordinamento manuale',
        editSortOrder: 'Modifica ordinamento...',
        removeSortProperty: 'Rimuovi proprietà di ordinamento',
        descendants: 'discendenti',
        subfolders: 'sottocartelle',
        subtags: 'sotto-tag',
        childValues: 'valori figli',
        applySortAndGroupToDescendants: (target: string) => `Applica ordinamento e raggruppamento a ${target}`,
        applyAppearanceToDescendants: (target: string) => `Applica aspetto a ${target}`,
        showFolders: 'Mostra navigazione', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: 'Riordina navigazione',
        finishRootFolderReorder: 'Fatto',
        showExcludedItems: 'Mostra cartelle, tag e note nascosti', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Nascondi cartelle, tag e note nascosti', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Mostra doppio pannello', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Mostra pannello singolo', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            'I pannelli doppi non sono disponibili quando la barra laterale è troppo stretta. Per modificarlo, imposta "Quando la barra laterale è troppo stretta" su "Non fare nulla" in Impostazioni > Aspetto e comportamento.',
        changeAppearance: 'Cambia aspetto', // Tooltip for button to change folder appearance settings (English: Change appearance)
        showNotesFromSubfolders: 'Mostra note da sottocartelle',
        showFilesFromSubfolders: 'Mostra file da sottocartelle',
        showNotesFromDescendants: 'Mostra note da discendenti',
        showFilesFromDescendants: 'Mostra file da discendenti',
        search: 'Cerca' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Cerca...', // Placeholder text for search input (English: Search...)
        placeholderVault: 'Cerca nel vault...',
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Cancella ricerca', // Tooltip for clear search button (English: Clear search)
        switchToFilterSearch: 'Passa alla ricerca con filtro',
        switchToOmnisearch: 'Passa a Omnisearch',
        saveSearchShortcut: 'Salva scorciatoia ricerca',
        removeSearchShortcut: 'Rimuovi scorciatoia ricerca',
        shortcutModalTitle: 'Salva scorciatoia ricerca',
        shortcutNamePlaceholder: 'Inserisci nome scorciatoia',
        shortcutStartIn: 'Inizia sempre in: {path}',
        searchHelp: 'Sintassi di ricerca',
        searchHelpTitle: 'Sintassi di ricerca',
        searchHelpModal: {
            intro: 'Combina nomi file, proprietà, tag, date e filtri in una query (es. `meeting .status=active #work @thisweek`). Installa il plugin Omnisearch per usare la ricerca full-text.',
            introSwitching: "Passa tra ricerca con filtro e Omnisearch usando i tasti freccia su/giù o cliccando sull'icona di ricerca.",
            sections: {
                fileNames: {
                    title: 'Nomi file',
                    items: [
                        '`word` Trova note con "word" nel nome del file.',
                        '`word1 word2` Ogni parola deve corrispondere al nome del file.',
                        '`-word` Escludi note con "word" nel nome del file.'
                    ]
                },
                tags: {
                    title: 'Tag',
                    items: [
                        '`#tag` Includi note con tag (trova anche tag nidificati come `#tag/subtag`).',
                        '`#` Includi solo note con tag.',
                        '`-#tag` Escludi note con tag.',
                        '`-#` Includi solo note senza tag.',
                        '`#tag1 #tag2` Trova entrambi i tag (AND implicito).',
                        '`#tag1 AND #tag2` Trova entrambi i tag (AND esplicito).',
                        '`#tag1 OR #tag2` Trova uno dei tag.',
                        '`#a OR #b AND #c` AND ha priorità maggiore: trova `#a`, o entrambi `#b` e `#c`.',
                        'Cmd/Ctrl+Clic su un tag per aggiungere con AND. Cmd/Ctrl+Shift+Clic per aggiungere con OR.'
                    ]
                },
                properties: {
                    title: 'Proprietà',
                    items: [
                        '`.key` Includi note con chiave di proprietà.',
                        '`.key=value` Includi note in cui il valore della proprietà contiene `value`.',
                        '`."Reading Status"` Includi note con una chiave di proprietà che contiene spazi.',
                        '`."Reading Status"="In Progress"` Chiavi e valori con spazi devono essere racchiusi tra virgolette doppie.',
                        '`-.key` Escludi note con chiave di proprietà.',
                        '`-.key=value` Escludi note in cui il valore della proprietà contiene `value`.',
                        'Cmd/Ctrl+Clic su una proprietà per aggiungere con AND. Cmd/Ctrl+Shift+Clic per aggiungere con OR.'
                    ]
                },
                tasks: {
                    title: 'Filtri',
                    items: [
                        '`has:task` Includi note con attività non completate.',
                        '`-has:task` Escludi note con attività non completate.',
                        '`folder:meetings` Includi note in cui un nome di cartella contiene `meetings`.',
                        '`folder:/work/meetings` Includi note solo in `work/meetings` (non sottocartelle).',
                        '`folder:/` Includi note solo nella radice del vault.',
                        '`-folder:archive` Escludi note in cui un nome di cartella contiene `archive`.',
                        '`-folder:/archive` Escludi note solo in `archive` (non sottocartelle).',
                        '`ext:md` Includi note con estensione `md` (`ext:.md` è anche supportato).',
                        '`-ext:pdf` Escludi note con estensione `pdf`.',
                        'Combina con tag, nomi e date (ad esempio: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'Comportamento AND/OR',
                    items: [
                        '`AND` e `OR` sono operatori solo nelle query composte esclusivamente da tag e proprietà.',
                        'Le query esclusive di tag e proprietà contengono solo filtri di tag e proprietà: `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`.',
                        'Se una query include nomi, date (`@...`), filtri attività (`has:task`), filtri cartella (`folder:...`) o filtri estensione (`ext:...`), `AND` e `OR` vengono cercati come parole.',
                        'Esempio di query con operatori: `#work OR .status=started`.',
                        'Esempio di query mista: `#work OR ext:md` (`OR` viene cercato nei nomi dei file).'
                    ]
                },
                dates: {
                    title: 'Date',
                    items: [
                        '`@today` Trova note di oggi usando il campo data predefinito.',
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` Intervalli di date relativi.',
                        '`@2026-02-07` Trova un giorno specifico (supporta anche `@20260207`).',
                        '`@2026` Trova un anno solare.',
                        '`@2026-02` o `@202602` Trova un mese solare.',
                        '`@2026-W05` o `@2026W05` Trova una settimana ISO.',
                        '`@2026-Q2` o `@2026Q2` Trova un trimestre solare.',
                        '`@13/02/2026` Formati numerici con separatori (`@07022026` segue la tua locale in caso di ambiguità).',
                        '`@2026-02-01..2026-02-07` Trova un intervallo di giorni inclusivo (estremi aperti supportati).',
                        '`@c:...` o `@m:...` Indica data di creazione o modifica.',
                        '`-@...` Escludi una corrispondenza di data.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        "Ricerca full-text nell'intero vault, filtrata per la cartella corrente o i tag selezionati.",
                        'Può essere lento con meno di 3 caratteri nei vault grandi.',
                        'Non può cercare percorsi con caratteri non-ASCII o cercare correttamente i sottopercorsi.',
                        'Restituisce risultati limitati prima del filtraggio per cartella, quindi file rilevanti potrebbero non apparire se esistono molte corrispondenze altrove.',
                        'Le anteprime delle note mostrano estratti di Omnisearch invece del testo di anteprima predefinito.'
                    ]
                }
            }
        }
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
            unpinNote: 'Rimuovi fissatura nota',
            unpinFile: 'Rimuovi fissatura file',
            pinMultipleNotes: 'Fissa {count} note',
            pinMultipleFiles: 'Fissa {count} file',
            unpinMultipleNotes: 'Rimuovi fissatura {count} note',
            unpinMultipleFiles: 'Rimuovi fissatura {count} file',
            duplicateNote: 'Duplica nota',
            duplicateFile: 'Duplica file',
            duplicateMultipleNotes: 'Duplica {count} note',
            duplicateMultipleFiles: 'Duplica {count} file',
            openVersionHistory: 'Apri cronologia versioni',
            revealInFolder: 'Mostra nella cartella',
            revealInFinder: 'Mostra nel Finder',
            showInExplorer: 'Mostra in esplora risorse',
            openInDefaultApp: "Apri nell'app predefinita",
            renameNote: 'Rinomina nota',
            renameFile: 'Rinomina file',
            deleteNote: 'Elimina nota',
            deleteFile: 'Elimina file',
            setCalendarHighlight: 'Imposta evidenziazione',
            removeCalendarHighlight: 'Rimuovi evidenziazione',
            deleteMultipleNotes: 'Elimina {count} note',
            deleteMultipleFiles: 'Elimina {count} file',
            moveNoteToFolder: 'Sposta nota in...',
            moveFileToFolder: 'Sposta file in...',
            moveMultipleNotesToFolder: 'Sposta {count} note in...',
            moveMultipleFilesToFolder: 'Sposta {count} file in...',
            mergeNotes: 'Unisci {count} note...',
            mergeNotesInGroup: 'Unisci note nel gruppo...',
            setManualSortGroupHeader: 'Imposta intestazione gruppo',
            changeManualSortGroupHeader: 'Cambia intestazione gruppo',
            manualSortGroupHeader: {
                title: 'Intestazione gruppo',
                copyStyle: 'Copia stile intestazione',
                pasteStyle: 'Incolla stile intestazione',
                remove: 'Rimuovi intestazione gruppo'
            },
            addTag: 'Aggiungi tag',
            addPropertyKey: 'Imposta proprietà',
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
            createFolderNote: 'Crea nota cartella',
            detachFolderNote: 'Scollega nota cartella',
            deleteFolderNote: 'Elimina nota cartella',
            changeIcon: 'Cambia icona',
            changeColor: 'Cambia colore',
            changeBackground: 'Cambia sfondo',
            excludeFolder: 'Nascondi cartella',
            unhideFolder: 'Mostra cartella',
            excludeFromDescendants: 'Nascondi dalle cartelle superiori',
            includeInDescendants: 'Mostra nelle cartelle superiori',
            hiddenFromParentsIndicator: 'Nascosta dagli elenchi delle cartelle superiori',
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
        property: {
            addKey: 'Configura chiavi proprietà',
            renameKey: 'Rinomina proprietà',
            deleteKey: 'Elimina proprietà'
        },
        navigation: {
            addSeparator: 'Aggiungi separatore',
            removeSeparator: 'Rimuovi separatore'
        },
        copyPath: {
            title: 'Copia percorso',
            asObsidianUrl: 'come URL Obsidian',
            fromVaultFolder: 'dalla cartella vault',
            fromSystemRoot: 'dalla radice di sistema'
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
        appearance: 'Aspetto',
        sortBy: 'Ordina per',
        standardPreset: 'Standard',
        compactPreset: 'Compatto',
        defaultSuffix: '(predefinito)',
        defaultLabel: 'Predefinito',
        titleRows: 'Righe titolo',
        previewRows: 'Righe anteprima',
        groupBy: 'Raggruppa per',
        titleRowOption: (rows: number) => `${rows} ${rows === 1 ? 'riga' : 'righe'} titolo`,
        previewRowOption: (rows: number) => `${rows} ${rows === 1 ? 'riga' : 'righe'} anteprima`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Applica',
            applySortAndGroupTitle: (target: string) => `Applicare ordinamento e raggruppamento a ${target}?`,
            applyAppearanceTitle: (target: string) => `Applicare aspetto a ${target}?`,
            affectedCountMessage: (count: number) => `Sostituzioni esistenti che cambieranno: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: "Usare l'ordinamento manuale?",
            propertySortMessage: (property: string, count: number) =>
                `Questo cambia la vista corrente all'ordinamento manuale usando "${property}". La modifica dell'ordine scrive valori indice numerici in quella proprietà in ${count} ${count === 1 ? 'nota' : 'note'} secondo necessità.`,
            propertySortConfirmButton: 'Usa ordinamento manuale',
            removePropertyTitle: 'Rimuovere la proprietà di ordinamento?',
            removePropertyMessage: (property: string, count: number) =>
                `Questo rimuove "${property}" da ${count} ${count === 1 ? 'nota' : 'note'} nella lista corrente. L'ordinamento manuale verrà cancellato per quelle note.`,
            removePropertyConfirmButton: 'Rimuovi proprietà',
            compactTitle: 'Compattare i valori indice?',
            compactMessage: (count: number) =>
                `Questo riordino richiede più spazio numerico. ${count} ${count === 1 ? 'nota riceverà' : 'note riceveranno'} nuovi valori indice.`,
            compactConfirmButton: 'Compatta valori indice'
        },
        manualSortGroupHeader: {
            title: 'Imposta intestazione gruppo',
            titleLabel: 'Titolo',
            placeholder: 'Intestazione gruppo',
            icon: 'Icona',
            color: 'Colore',
            wordCount: 'Mostra il conteggio parole',
            wordCountTarget: 'Conteggio parole obiettivo',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'Quando questo campo è vuoto, l’obiettivo del gruppo usa la proprietà obiettivo impostata in Impostazioni > Note > Conteggio parole e caratteri. Sovrascrivila impostando un valore obiettivo per questo gruppo.',
            description: "Personalizza l'intestazione di gruppo per questa nota. Lascia il titolo vuoto per rimuovere l'intestazione."
        },
        mergeNotes: {
            title: 'Unisci note',
            summary: 'Crea una nota da {count} note in {folder}.',
            frontmatterRule: 'Il frontmatter della prima nota viene mantenuto. Il frontmatter delle altre note viene rimosso.',
            crossFolderWarning:
                'Le note di origine si trovano in cartelle diverse. Link relativi e incorporamenti potrebbero smettere di funzionare nella nota unita.',
            outputName: 'Nome di output',
            outputNameDesc: 'La nota unita viene creata nella cartella mostrata sopra.',
            outputNamePlaceholder: 'Note unite',
            separator: 'Separatore',
            separatorDesc: 'Inserito tra le note.',
            separatorOptions: {
                none: 'Nessuno',
                blankLine: 'Riga vuota',
                horizontalRule: 'Linea orizzontale',
                heading: 'Intestazione con titolo della nota'
            },
            moveSourcesToTrash: 'Sposta le note di origine nel cestino dopo averle unite',
            mergeButton: 'Unisci'
        },
        navRainbowSection: {
            title: (section: string) => `Colori arcobaleno: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'Cerca icone...',
            recentlyUsedHeader: 'Usate di recente',
            emptyStateSearch: 'Inizia a digitare per cercare icone',
            emptyStateNoResults: 'Nessuna icona trovata',
            showingResultsInfo: 'Mostrati 50 di {count} risultati. Digita di più per restringere.',
            emojiInstructions: 'Digita o incolla qualsiasi emoji per usarla come icona',
            removeIcon: 'Rimuovi icona',
            removeFromRecents: 'Rimuovi dai recenti',
            allTabLabel: 'Tutte'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Aggiungi regola'
        },
        interfaceIcons: {
            title: "Icone dell'interfaccia",
            fileItemsSection: 'Elementi file',
            items: {
                'nav-shortcuts': 'Scorciatoie',
                'nav-recent-files': 'File recenti',
                'nav-expand-all': 'Espandi tutto',
                'nav-collapse-all': 'Comprimi tutto',
                'nav-calendar': 'Calendario',
                'nav-tree-expand': 'Freccia albero: espandi',
                'nav-tree-collapse': 'Freccia albero: comprimi',
                'nav-hidden-items': 'Elementi nascosti',
                'nav-root-reorder': 'Riordina cartelle radice',
                'nav-new-folder': 'Nuova cartella',
                'nav-show-single-pane': 'Mostra pannello singolo',
                'nav-show-dual-pane': 'Mostra doppio pannello',
                'nav-profile-chevron': 'Freccia menu profilo',
                'list-search': 'Cerca',
                'list-reveal-file': 'Mostra file',
                'list-descendants': 'Note dalle sottocartelle',
                'list-sort-ascending': 'Ordine: crescente',
                'list-sort-descending': 'Ordine: decrescente',
                'list-sort-modified': 'Ordina per data di modifica',
                'list-sort-created': 'Ordina per data di creazione',
                'list-sort-title': 'Ordina per titolo',
                'list-sort-filename': 'Ordina per nome file',
                'list-sort-property': 'Ordina per proprietà',
                'list-appearance': 'Cambia aspetto',
                'list-new-note': 'Nuova nota',
                'list-pinned': 'Note fissate',
                'nav-folder-open': 'Cartella aperta',
                'nav-folder-closed': 'Cartella chiusa',
                'nav-tags': 'Tag',
                'nav-tag': 'Tag',
                'nav-properties': 'Proprietà',
                'nav-property': 'Proprietà',
                'nav-property-value': 'Valore',
                'file-unfinished-task': 'Attività incomplete',
                'file-word-count': 'Conteggio parole',
                'file-character-count': 'Conteggio caratteri'
            }
        },
        colorPicker: {
            currentColor: 'Attuale',
            newColor: 'Nuovo',
            paletteDefault: 'Predefinito',
            paletteCustom: 'Personalizzato',
            copyColors: 'Copia colore',
            colorsCopied: 'Colore copiato negli appunti',
            pasteColors: 'Incolla colore',
            pasteClipboardError: 'Impossibile leggere gli appunti',
            pasteInvalidFormat: 'Previsto un valore colore hex',
            colorsPasted: 'Colore incollato con successo',
            resetUserColors: 'Cancella colori personalizzati',
            clearCustomColorsConfirm: 'Rimuovere tutti i colori personalizzati?',
            userColorSlot: 'Colore {slot}',
            recentColors: 'Colori recenti',
            clearRecentColors: 'Cancella colori recenti',
            removeRecentColor: 'Rimuovi colore',
            apply: 'Applica',
            pickerLabel: 'Selettore',
            hexLabel: 'HEX',
            hexInputLabel: 'Valore colore esadecimale',
            saturationValueArea: 'Saturazione e luminosità',
            hueSlider: 'Tonalità',
            alphaSlider: 'Trasparenza'
        },
        appearance: {
            tabIcon: 'Icona',
            tabColor: 'Colore',
            tabBackground: 'Sfondo',
            resetIcon: 'Rimuovi icona',
            resetColor: 'Rimuovi colore',
            resetBackground: 'Rimuovi sfondo',
            clear: 'Cancella stile',
            apply: 'Applica'
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
            renameBatchNotFinalized: 'Rinominati {renamed}/{total}. Non aggiornati: {notUpdated}. Metadati e scorciatoie non aggiornati.',
            invalidTagName: 'Inserisci un nome tag valido.',
            descendantRenameError: 'Impossibile spostare un tag in sé stesso o in un discendente.',
            confirmDelete: 'Elimina tag',
            deleteBatchNotFinalized: 'Rimossi da {removed}/{total}. Non aggiornati: {notUpdated}. Metadati e scorciatoie non aggiornati.',
            checkConsoleForDetails: 'Controlla la console per i dettagli.',
            file: 'file',
            files: 'file',
            inlineParsingWarning: {
                title: 'Compatibilità dei tag inline',
                message: '{tag} contiene caratteri che Obsidian non può analizzare nei tag inline. I tag Frontmatter non sono interessati.',
                confirm: 'Usa comunque'
            }
        },
        propertyOperation: {
            renameTitle: 'Rinomina proprietà {property}',
            deleteTitle: 'Elimina proprietà {property}',
            newKeyPrompt: 'Nuovo nome proprietà',
            newKeyPlaceholder: 'Inserisci il nuovo nome della proprietà',
            renameWarning: 'Rinominare la proprietà {property} modificherà {count} {files}.',
            renameConflictWarning:
                'La proprietà {newKey} esiste già in {count} {files}. Rinominare {oldKey} sostituirà i valori esistenti di {newKey}.',
            deleteWarning: 'Eliminare la proprietà {property} modificherà {count} {files}.',
            confirmRename: 'Rinomina proprietà',
            confirmDelete: 'Elimina proprietà',
            renameNoChanges: '{oldKey} → {newKey} (nessuna modifica)',
            renameSettingsUpdateFailed: 'Proprietà {oldKey} → {newKey} rinominata. Impossibile aggiornare le impostazioni.',
            deleteSingleSuccess: 'Proprietà {property} eliminata da 1 nota',
            deleteMultipleSuccess: 'Proprietà {property} eliminata da {count} note',
            deleteSettingsUpdateFailed: 'Proprietà {property} eliminata. Impossibile aggiornare le impostazioni.',
            invalidKeyName: 'Inserisci un nome di proprietà valido.'
        },
        fileSystem: {
            newFolderTitle: 'Nuova cartella',
            renameFolderTitle: 'Rinomina cartella',
            renameFileTitle: 'Rinomina file',
            deleteFolderTitle: "Eliminare '{name}'?",
            deleteFileTitle: "Eliminare '{name}'?",
            deleteFileAttachmentsTitle: 'Eliminare gli allegati del file?',
            moveFileConflictTitle: 'Conflitto di spostamento',
            folderNamePrompt: 'Inserisci nome cartella:',
            hideInOtherVaultProfiles: 'Nascondi in altri profili vault',
            renamePrompt: 'Inserisci nuovo nome:',
            renameVaultTitle: 'Cambia nome visualizzato vault',
            renameVaultPrompt: 'Inserisci nome visualizzato personalizzato (lascia vuoto per usare predefinito):',
            deleteFolderConfirm: 'Sei sicuro di voler eliminare questa cartella e tutto il suo contenuto?',
            deleteFileConfirm: 'Sei sicuro di voler eliminare questo file?',
            deleteFileAttachmentsDescriptionSingle: 'Questo allegato non è più utilizzato in nessuna nota. Vuoi eliminarlo?',
            deleteFileAttachmentsDescriptionMultiple: 'Questi allegati non sono più utilizzati in nessuna nota. Vuoi eliminarli?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Albero dei file',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Galleria',
            moveFileConflictDescriptionSingle: 'Un conflitto di file è stato trovato in "{folder}".',
            moveFileConflictDescriptionMultiple: '{count} conflitti di file sono stati trovati in "{folder}".',
            moveFileConflictAffectedFiles: 'File interessati',
            moveFileConflictItem: '"{name}" -> "{suggested}"{renameOnly}',
            moveFileConflictRenameOnly: '(solo rinomina)',
            moveFileConflictRename: 'Rinomina',
            moveFileConflictOverwrite: 'Sovrascrivi',
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
        calendarTemplate: {
            placeholder: 'Cerca modelli...',
            instructions: {
                navigate: 'per navigare',
                select: 'per selezionare il modello',
                dismiss: 'per chiudere'
            }
        },
        navigationBanner: {
            placeholder: 'Cerca immagini...',
            svgMissingDimensions: 'Il file SVG selezionato non definisce larghezza, altezza o viewBox.',
            instructions: {
                navigate: 'per navigare',
                select: 'per impostare banner',
                dismiss: 'per chiudere'
            }
        },
        tagSuggest: {
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
        propertySuggest: {
            placeholder: 'Seleziona chiave proprietà...',
            navigatePlaceholder: 'Vai alla proprietà...',
            instructions: {
                navigate: 'per navigare',
                select: 'per aggiungere proprietà',
                dismiss: 'per chiudere'
            }
        },
        propertyKeyVisibility: {
            title: 'Visibilità chiavi proprietà',
            description:
                'Controlla dove vengono mostrati i valori delle proprietà. Le colonne corrispondono al pannello di navigazione, al pannello elenco e al menu contestuale del file. Usa la riga in basso per attivare/disattivare tutte le righe di una colonna.',
            searchPlaceholder: 'Cerca chiavi proprietà...',
            propertyColumnLabel: 'Proprietà',
            showInNavigation: 'Mostra nella navigazione',
            showInList: 'Mostra nella lista',
            showInFileMenu: 'Mostra nel menu file',
            toggleAllInNavigation: 'Attiva/disattiva tutti nella navigazione',
            toggleAllInList: 'Attiva/disattiva tutti nella lista',
            toggleAllInFileMenu: 'Attiva/disattiva tutti nel menu file',
            applyButton: 'Applica',
            emptyState: 'Nessuna chiave proprietà trovata.'
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
            closeButton: 'Forse più tardi'
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
            deleteAttachments: 'Impossibile eliminare gli allegati: {error}',
            mergeNotes: 'Impossibile unire le note: {error}',
            mergeNotesOpenOutput:
                'La nota unita è stata creata come {name}, ma non è stato possibile aprirla: {error}. Le note di origine non sono state modificate.',
            mergeNotesOpenSkipped: 'Un’altra richiesta di apertura file ha avuto la precedenza.',
            mergeNotesTrashSources: 'Nota unita creata. Impossibile spostare {count} note di origine nel cestino.',
            duplicateNote: 'Impossibile duplicare nota: {error}',
            duplicateFolder: 'Impossibile duplicare cartella: {error}',
            openVersionHistory: 'Impossibile aprire cronologia versioni: {error}',
            versionHistoryNotFound: 'Comando cronologia versioni non trovato. Assicurati che Obsidian Sync sia abilitato.',
            revealInExplorer: 'Impossibile mostrare file in esplora risorse: {error}',
            openInDefaultApp: "Impossibile aprire nell'app predefinita: {error}",
            openInDefaultAppNotAvailable: "Apertura nell'app predefinita non disponibile su questa piattaforma",
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
            showFolder: 'Cartella mostrata: {name}',
            folderExcludedFromDescendants: 'Nascosta dagli elenchi delle cartelle superiori: {name}',
            folderIncludedInDescendants: 'Mostrata negli elenchi delle cartelle superiori: {name}',
            mergeNotes: 'Unite {count} note in {name}'
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
            mergeNotesRequireMultipleMarkdown: 'Seleziona almeno due note Markdown da unire',
            tagOperationsNotAvailable: 'Operazioni tag non disponibili',
            propertyOperationsNotAvailable: 'Operazioni sulle proprietà non disponibili',
            tagsRequireMarkdown: 'I tag sono supportati solo nelle note Markdown',
            propertiesRequireMarkdown: 'Le proprietà sono supportate solo nelle note Markdown',
            propertySetOnNote: 'Proprietà aggiornata su 1 nota',
            propertySetOnNotes: 'Proprietà aggiornata su {count} note',
            manualSortPropertyRemovedFromNote: 'Proprietà di ordinamento rimossa da 1 nota',
            manualSortPropertyRemovedFromNotes: 'Proprietà di ordinamento rimossa da {count} note',
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
            untitled: 'Senza titolo'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Impossibile spostare una cartella in sé stessa o in una sottocartella.',
            itemAlreadyExists: 'Un elemento chiamato "{name}" esiste già in questa posizione.',
            failedToMove: 'Impossibile spostare: {error}',
            failedToAddTag: 'Impossibile aggiungere tag "{tag}"',
            failedToSetProperty: 'Aggiornamento proprietà non riuscito: {error}',
            failedToClearTags: 'Impossibile rimuovere i tag',
            failedToMoveFolder: 'Impossibile spostare cartella "{name}"',
            failedToImportFiles: 'Impossibile importare: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} file esistono già nella destinazione',
            filesAlreadyHaveTag: '{count} file hanno già questo tag o uno più specifico',
            filesAlreadyHaveProperty: '{count} file hanno già questa proprietà',
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

    // Plugin commands
    commands: {
        open: 'Apri', // Command palette: Opens the Notebook Navigator view (English: Open)
        toggleLeftSidebar: 'Attiva/disattiva barra laterale sinistra', // Command palette: Toggles left sidebar, opening Notebook Navigator when uncollapsing (English: Toggle left sidebar)
        openHomepage: 'Apri homepage', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        openDailyNote: 'Apri nota giornaliera',
        openWeeklyNote: 'Apri nota settimanale',
        openMonthlyNote: 'Apri nota mensile',
        openQuarterlyNote: 'Apri nota trimestrale',
        openYearlyNote: 'Apri nota annuale',
        revealFile: 'Mostra file', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Cerca', // Command palette: Toggle search in the file list (English: Search)
        searchVaultRoot: 'Cerca in tutto il vault', // Command palette: Selects the vault root folder and focuses search with subfolders included (English: Search whole vault)
        toggleDualPane: 'Attiva/disattiva doppio pannello', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        toggleDualPaneOrientation: 'Cambia orientamento doppio pannello', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'Attiva/disattiva calendario', // Command palette: Toggles showing the calendar overlay in the navigation pane (English: Toggle calendar)
        selectVaultProfile: 'Seleziona profilo vault', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'Seleziona profilo vault 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Seleziona profilo vault 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Seleziona profilo vault 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Elimina file', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Crea nuova nota', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Nuova nota da modello', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Sposta file', // Command palette: Move selected files to another folder (English: Move files)
        mergeNotes: 'Unisci note', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'Seleziona file successivo', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Seleziona file precedente', // Command palette: Selects the previous file in the current view (English: Select previous file)
        navigateBack: 'Naviga indietro',
        navigateForward: 'Naviga avanti',
        convertToFolderNote: 'Converti in nota cartella', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Imposta come nota cartella', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Scollega nota cartella', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Fissa tutte le note cartella', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Vai alla cartella', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Vai al tag', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        navigateToProperty: 'Vai alla proprietà', // Command palette: Navigate to a property key or value using fuzzy search (English: Navigate to property)
        addShortcut: 'Aggiungi alle scorciatoie', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: 'Apri scorciatoia {number}',
        toggleDescendants: 'Attiva/disattiva discendenti', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Attiva/disattiva cartelle, tag e note nascosti', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Attiva/disattiva ordinamento tag', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: 'Attiva/disattiva tag per selezione',
        togglePropertiesBySelection: 'Attiva/disattiva proprietà per selezione',
        toggleCompactMode: 'Attiva/disattiva modalità compatta', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Attiva/disattiva sezione fissata',
        collapseExpand: 'Comprimi / espandi tutti gli elementi', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        collapseExpandSelectedItem: "Comprimi / espandi l'elemento selezionato",
        addTag: 'Aggiungi tag ai file selezionati', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        setProperty: 'Imposta proprietà sui file selezionati', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'Rimuovi tag dai file selezionati', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Rimuovi tutti i tag dai file selezionati', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        openAllFiles: 'Apri tutti i file', // Command palette: Opens all files in the current folder or tag (English: Open all files)
        rebuildCache: 'Ricostruisci cache', // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
        restoreDefaultSettings: 'Ripristina impostazioni predefinite' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        calendarViewName: 'Calendario', // Name shown in the view header/tab (English: Calendar)
        folderNoteSidebarViewName: 'Nota cartella', // Name shown in the folder note sidebar tab (English: Folder note)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Mostra in Notebook Navigator', // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
        settingsUnavailableNotice:
            'Notebook Navigator non è riuscito a leggere le impostazioni e non è stato avviato. Se il tuo vault è in sincronizzazione, riavvia Obsidian al termine della sincronizzazione. Per ricominciare con le impostazioni predefinite, esegui il comando "Ripristina impostazioni predefinite".', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsRecovery: {
            confirmTitle: 'Ripristina impostazioni predefinite', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'Questa operazione sostituisce il file delle impostazioni di Notebook Navigator con le impostazioni predefinite. Se il tuo vault è ancora in sincronizzazione, le impostazioni predefinite ripristinate possono sovrascrivere quelle salvate sugli altri tuoi dispositivi. Un file delle impostazioni leggibile viene prima copiato in un backup con data e ora nella cartella del plugin.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'Ripristina predefinite', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: 'Impossibile completare il ripristino delle impostazioni. Le preferenze locali sono state mantenute.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'Impostazioni predefinite ripristinate. Riavvia Obsidian per completare.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Ultima modifica',
        createdAt: 'Creato il',
        file: 'file',
        files: 'file',
        folder: 'cartella',
        folders: 'cartelle',
        wordCount: 'Conteggio parole'
    },

    fileCounts: {
        words: '{count} parole',
        characters: '{count} caratteri',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'Modifica impostazioni predefinite',
        metadataReport: {
            exportSuccess: 'Report metadati falliti esportato in: {filename}',
            exportFailed: 'Impossibile esportare report metadati'
        },
        sections: {
            general: 'Generale',
            vaultFilters: 'Filtri di visualizzazione',
            appearanceBehavior: 'Aspetto e comportamento',
            navigationPane: 'Pannello di navigazione',
            calendar: 'Calendario',
            fileOperations: 'Operazioni sui file',
            icons: 'Pacchetti icone',
            folders: 'Cartelle',
            folderNotes: 'Note cartella',
            folderNoteFiles: 'File note cartella',
            foldersAndFolderNotes: 'Cartelle e note cartella',
            tagsAndProperties: 'Tag e proprietà',
            tags: 'Tag',
            listPane: 'Pannello lista',
            notes: 'Visualizzazione file',
            shortcutsAndRecentFiles: 'Scorciatoie e file recenti',
            advanced: 'Avanzate'
        },
        pageGroups: {
            configuration: 'Configurazione',
            navigationAndContent: 'Pannello di navigazione',
            notesAndLists: 'Pannello lista',
            calendarAndTools: 'Calendario e strumenti'
        },
        pageDescriptions: {
            general: 'Note di rilascio, supporto, profilo vault, tipi di file e chiavi delle proprietà.',
            vaultFilters: 'Cartelle, tag, file, tag dei file e regole delle proprietà nascosti.',
            appearanceBehavior: 'Comportamento, navigazione da tastiera, pulsanti del mouse, aspetto e formattazione.',
            navigationPane: 'Layout, aspetto, conteggio note, comportamento del collasso e colori arcobaleno.',
            shortcuts: 'Visibilità delle scorciatoie, badge, file recenti ed elementi fissati.',
            calendar: 'Visualizzazione calendario, note data, modelli, locale e posizionamento della barra laterale.',
            fileOperations: 'Modelli, conferme di eliminazione, allegati e comportamento in caso di conflitti di spostamento dei file.',
            foldersAndFolderNotes: 'Visualizzazione cartelle, note cartella, modelli di note cartella e comportamento delle note cartella.',
            tagsProperties: 'Sezioni tag e proprietà, icone, ordinamento, ambito ed ereditarietà.',
            listPane: 'Ordinamento, raggruppamento, modalità lista, note fissate e anteprime dei disegni.',
            frontmatter: 'Campi frontmatter per nomi visualizzati, timestamp, icone e colori.',
            notes: 'Titoli, testo anteprima, immagini in evidenza, tag, proprietà, date, conteggio parole e conteggio caratteri.',
            iconPacks: 'Icone interfaccia, icone file e gestione pacchetti icone.',
            advanced: 'Diagnostica, pulizia metadati, importazione/esportazione e ripristino.'
        },
        groups: {
            general: {
                vaultConfiguration: 'Configurazione vault',
                templates: 'Modelli',
                behavior: 'Comportamento',
                startup: 'Avvio',
                keyboardNavigation: 'Navigazione da tastiera',
                mouseButtons: 'Pulsanti del mouse',
                view: 'Aspetto',
                icons: 'Icone',
                desktopAppearance: 'Aspetto desktop',
                mobileAppearance: 'Aspetto mobile',
                formatting: 'Formattazione'
            },
            advanced: {
                maintenance: 'Manutenzione',
                resetSettings: 'Reimposta impostazioni'
            },
            navigation: {
                appearance: 'Aspetto',
                banner: 'Banner',
                collapseItems: 'Comprimi elementi',
                dragAndDrop: 'Trascina e rilascia',
                noteCounts: 'Conteggi note',
                rainbowColors: 'Colori arcobaleno',
                leftSidebar: 'Barra laterale sinistra',
                calendarIntegration: 'Integrazione calendario'
            },
            list: {
                display: 'Aspetto',
                groupHeaders: 'Intestazioni di gruppo',
                propertySort: 'Ordinamento per proprietà',
                manualSort: 'Ordinamento manuale',
                pinnedNotes: 'Note fissate',
                drawingPreviews: 'Anteprime dei disegni'
            },
            notes: {
                frontmatter: 'Campi frontmatter',
                tasks: 'Attività',
                icon: 'Icona',
                title: 'Titolo',
                previewText: 'Testo anteprima',
                featureImage: 'Immagine in evidenza',
                tags: 'Tag',
                properties: 'Proprietà',
                date: 'Data',
                parentFolder: 'Cartella superiore',
                wordCount: 'Conteggio parole e caratteri'
            }
        },
        syncMode: {
            notSynced: '(non sincronizzato)',
            switchToSynced: 'Attiva sincronizzazione',
            switchToLocal: 'Disattiva sincronizzazione'
        },
        items: {
            listPaneTitle: {
                name: 'Titolo pannello lista',
                desc: 'Scegli dove mostrare il titolo del pannello lista.',
                options: {
                    header: "Mostra nell'intestazione",
                    list: 'Mostra nel pannello lista',
                    hidden: 'Non mostrare'
                }
            },
            sortNotesBy: {
                name: 'Ordinamento predefinito',
                desc: "Scegli l'ordinamento predefinito per le note.",
                options: {
                    'modified-desc': 'Data modifica (più recenti in alto)',
                    'modified-asc': 'Data modifica (più vecchie in alto)',
                    'created-desc': 'Data creazione (più recenti in alto)',
                    'created-asc': 'Data creazione (più vecchie in alto)',
                    'title-asc': 'Titolo (A in alto)',
                    'title-desc': 'Titolo (Z in alto)',
                    'filename-asc': 'Nome file (A in alto)',
                    'filename-desc': 'Nome file (Z in alto)'
                },
                directions: {
                    asc: 'Crescente',
                    desc: 'Decrescente'
                },
                fields: {
                    modified: 'Data di modifica',
                    created: 'Data di creazione',
                    title: 'Titolo',
                    filename: 'Nome file',
                    property: 'Proprietà'
                }
            },
            propertySortKey: {
                name: 'Proprietà per ordinare',
                desc: 'Proprietà frontmatter separate da virgola mostrate come opzioni di ordinamento per proprietà. I valori array vengono uniti in una singola stringa. Queste proprietà non vengono modificate.',
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: 'Ordinamento secondario',
                desc: "Usato con l'ordinamento per proprietà quando le note hanno lo stesso valore di proprietà o nessun valore.",
                options: {
                    title: 'Titolo',
                    filename: 'Nome file',
                    created: 'Data di creazione',
                    modified: 'Data di modifica'
                }
            },
            propertySortInstructions: {
                intro: 'Ogni proprietà elencata sopra appare come opzione di ordinamento nel menu di ordinamento nel pannello lista. Selezionandone una si ordinano le note per il suo valore frontmatter.'
            },
            manualSortPropertyKey: {
                name: 'Proprietà ordinamento manuale',
                desc: "Proprietà frontmatter usata per memorizzare i valori indice numerici per l'ordinamento manuale."
            },
            manualSortGroupHeaderProperty: {
                name: 'Proprietà intestazione gruppo',
                desc: 'Proprietà frontmatter usata per memorizzare le intestazioni di gruppo personalizzate.'
            },
            groupHeadersInstructions: {
                intro: 'Le intestazioni di gruppo personalizzate vengono visualizzate sopra le note nel pannello lista.',
                items: [
                    'Dal menu di ordinamento nel pannello lista, imposta il raggruppamento su **Personalizzato**.',
                    "Fai clic destro su una nota e scegli **Imposta intestazione gruppo** per aggiungere un'intestazione sopra di essa."
                ]
            },
            manualSortNewNotePlacement: {
                name: 'Posizionamento nuove note',
                desc: "Scegli dove sono posizionate le nuove note quando la lista corrente usa l'ordinamento manuale.",
                options: {
                    top: 'In alto',
                    bottom: 'In basso',
                    'below-selected-note': 'Sotto la nota selezionata',
                    unsorted: 'Non ordinato'
                }
            },
            confirmBeforeManualSort: {
                name: "Conferma prima dell'ordinamento manuale",
                desc: 'Mostra un avviso prima di scrivere la proprietà di ordinamento manuale nelle note per la prima volta. Quando disattivato, le note ricevono la proprietà senza avviso.'
            },
            manualSortInstructions: {
                intro: "L'ordinamento manuale scrive un valore indice numerico in una proprietà frontmatter su ogni nota. Le note senza indice appaiono sotto Non ordinato.",
                items: [
                    "Abilita l'ordinamento manuale scegliendo **Ordinamento manuale** dal menu di ordinamento. Successivamente, ci sono due modi per riordinare le note.",
                    "Scegli **Modifica ordinamento...** dal menu di ordinamento per aprire una vista di riordinamento. Trascina le note con il mouse, o con il tocco su mobile. Su desktop, **Cmd/Ctrl** o **Shift** clic seleziona più note, quindi trascinandone una qualsiasi sposta l'intero gruppo.",
                    'Nel pannello lista, seleziona una nota o selezionane più, quindi premi **Cmd/Ctrl + Arrow Up/Down** per spostare la selezione su o giù.'
                ]
            },
            revealFileOnListChanges: {
                name: 'Scorri al file selezionato quando la lista cambia',
                desc: "Scorri al file selezionato quando fissi note, mostri note discendenti, cambi l'aspetto cartella o esegui operazioni sui file."
            },
            includeDescendantNotes: {
                name: 'Mostra note da sottocartelle / discendenti',
                desc: 'Includi note da sottocartelle nidificate e discendenti di tag e proprietà quando visualizzi una cartella, tag o proprietà.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Fissare le note solo nella loro cartella',
                desc: 'Le note fissate appaiono fissate solo nella propria cartella. Utile per le note cartella o se hai molte note fissate. Non influisce sulle viste per tag o proprietà.'
            },
            separateNoteCounts: {
                name: 'Mostra conteggi note correnti e discendenti separatamente',
                desc: 'Visualizza i conteggi note nel formato "correnti ▾ discendenti" per cartelle, tag e proprietà.'
            },
            groupNotes: {
                name: 'Raggruppamento predefinito',
                desc: 'Personalizzato mostra le intestazioni definite nel frontmatter. Data raggruppa le note per data. Cartella raggruppa le note per cartella. Le viste per tag e proprietà usano gruppi per data quando è selezionata una cartella.',
                options: {
                    custom: 'Personalizzato',
                    date: 'Data',
                    folder: 'Cartella'
                }
            },
            showSelectedNavigationPills: {
                name: 'Mostra sempre tutti i badge di tag e proprietà',
                desc: 'Quando disattivato, i badge corrispondenti alla selezione di navigazione corrente vengono nascosti (ad es. il badge del tag "ricette" viene nascosto durante la navigazione nel tag "ricette"). Attiva per mantenere tutti i badge visibili.'
            },
            stickyGroupHeaders: {
                name: 'Intestazioni di gruppo fisse',
                desc: "Mantieni visibile l'intestazione corrente di data, cartella o sezione fissate mentre scorri."
            },
            showFolderGroupPaths: {
                name: 'Mostra percorsi sottocartelle',
                desc: 'Quando raggruppi per cartella nel pannello lista, mostra i percorsi delle sottocartelle invece dei soli nomi cartella.'
            },
            showGroupHeaderItemCounts: {
                name: 'Mostra il numero di elementi',
                desc: 'Mostra il numero di elementi in ogni intestazione di gruppo del pannello lista.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'Raggruppamento per cartella: file della cartella corrente in basso',
                desc: 'Quando il raggruppamento predefinito è Cartella, sposta i file direttamente nella cartella selezionata sotto i gruppi di sottocartelle.'
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
                desc: 'Visualizza icone file con spaziatura allineata a sinistra. Disabilitando rimuove sia icone che indentazione. Priorità: icona attività incomplete > icona personalizzata > icona cartella > icona nome file > icona tipo file > icona predefinita.'
            },
            useFolderIcon: {
                name: 'Usa icona cartella',
                desc: "Visualizza l'icona della cartella genitore quando non è impostata un'icona file personalizzata. Il colore della cartella viene usato quando non è impostato un colore file personalizzato."
            },
            showFileIconUnfinishedTask: {
                name: 'Icona attività incomplete',
                desc: "Mostra un'icona di attività quando una nota ha attività incomplete."
            },
            showFileBackgroundUnfinishedTask: {
                name: 'Sfondo attività incomplete',
                desc: 'Applica un colore di sfondo quando una nota ha attività incomplete.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'Colore sfondo attività incomplete',
                desc: 'Imposta il colore di sfondo usato quando una nota ha attività incomplete.'
            },
            showFilenameMatchIcons: {
                name: 'Icone per nome file',
                desc: 'Assegna icone ai file in base al testo nei loro nomi.'
            },
            fileNameIconMap: {
                name: 'Mappa icone per nome',
                desc: "I file contenenti il testo ottengono l'icona specificata. Una mappatura per riga: testo=icona",
                placeholder: '# testo=icona\nriunione=ph-calendar\nfattura=ph-receipt',
                editTooltip: 'Modifica mappature'
            },
            showCategoryIcons: {
                name: 'Icone per tipo file',
                desc: 'Assegna icone ai file in base alla loro estensione.'
            },
            fileTypeIconPreset: {
                name: 'Preset icone file',
                desc: 'Scegli le icone integrate o un preset di pacchetto icone. Le regole di estensione personalizzate sostituiscono questo preset.',
                options: {
                    none: 'Icone integrate'
                },
                notInstalledWarning: 'Questo pacchetto icone non è installato. Vengono mostrate invece le icone integrate.'
            },
            fileTypeIconMap: {
                name: 'Mappa icone per tipo',
                desc: "I file con l'estensione ottengono l'icona specificata. Una mappatura per riga: estensione=icona",
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'Modifica mappature'
            },
            compactItemHeight: {
                name: 'Altezza elemento compatto',
                desc: "Imposta l'altezza degli elementi lista compatta su desktop e mobile (pixel).",
                resetTooltip: 'Ripristina predefinito (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Scala testo con altezza elemento compatto',
                desc: "Scala il testo della lista compatta quando l'altezza elemento è ridotta."
            },
            showParentFolder: {
                name: 'Mostra cartella genitore',
                desc: 'Visualizza il percorso della cartella genitore per note in sottocartelle, tag o proprietà.'
            },
            parentFolderClickRevealsFile: {
                name: 'Click su cartella genitore apre cartella',
                desc: "Cliccando sull'etichetta cartella genitore apre la cartella nel pannello elenco."
            },
            showParentFolderColor: {
                name: 'Mostra colore cartella genitore',
                desc: 'Usa i colori cartella sulle etichette cartella genitore.'
            },
            showParentFolderIcon: {
                name: 'Mostra icona cartella genitore',
                desc: 'Mostra le icone delle cartelle accanto alle etichette cartella genitore.'
            },
            showQuickActions: {
                name: 'Mostra azioni rapide',
                desc: 'Mostra pulsanti azione al passaggio del mouse sui file. I controlli pulsanti selezionano quali azioni appaiono.'
            },
            dualPane: {
                name: 'Layout doppio pannello',
                desc: 'Mostra pannello navigazione e pannello lista affiancati su desktop.'
            },
            dualPaneOrientation: {
                name: 'Orientamento doppio pannello',
                desc: 'Scegli layout orizzontale o verticale quando il doppio pannello è attivo.',
                options: {
                    horizontal: 'Divisione orizzontale',
                    vertical: 'Divisione verticale'
                }
            },
            narrowSidebarLayout: {
                name: 'Quando la barra laterale è troppo stretta',
                desc: 'Scegli cosa succede quando il pannello di navigazione e il pannello elenco non entrano affiancati.',
                options: {
                    none: 'Non fare nulla',
                    singlePane: 'Passa a pannello singolo',
                    vertical: 'Passa a divisione verticale'
                }
            },
            narrowSidebarTrigger: {
                name: 'Soglia barra laterale stretta',
                desc: 'Scegli come viene calcolata la soglia di larghezza della barra laterale.',
                options: {
                    fitPanes: 'Adatta pannelli',
                    customWidth: 'Larghezza personalizzata'
                }
            },
            narrowSidebarCustomWidth: {
                name: 'Larghezza soglia barra laterale stretta',
                desc: 'Passa quando la barra laterale è più stretta di questa larghezza.',
                resetTooltip: 'Ripristina larghezza predefinita'
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
                name: 'Livello zoom',
                desc: 'Controlla il livello di zoom complessivo di Notebook Navigator (percentuale).'
            },
            useFloatingToolbars: {
                name: 'Usa barre degli strumenti flottanti su iOS/iPadOS',
                desc: 'Si applica solo a iOS e iPadOS.'
            },
            startView: {
                name: "Vista predefinita all'avvio",
                desc: "Scegli quale pannello è attivo all'apertura di Notebook Navigator. Il layout a pannello singolo mostra prima questo pannello; il layout a doppio pannello gli assegna il focus della tastiera.",
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
            createNewNotesInNewTab: {
                name: 'Apri nuove note in una nuova scheda',
                desc: 'Quando attivo, il comando Crea nuova nota apre le note in una nuova scheda. Quando disattivo, le note sostituiscono la scheda corrente.'
            },
            autoRevealActiveNote: {
                name: 'Auto-mostra nota attiva',
                desc: 'Mostra automaticamente le note quando aperte da Switcher rapido, link o ricerca.'
            },
            autoRevealShortestPath: {
                name: 'Rivelazione automatica: Usa il percorso più breve',
                desc: 'Attivato: La rivelazione automatica seleziona la cartella antenata o il tag visibile più vicino. Disattivato: La rivelazione automatica seleziona la cartella effettiva del file e il tag esatto.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Rivelazione automatica: Ignora eventi dalla barra laterale destra',
                desc: 'Non cambiare nota attiva quando clicchi o cambi note nella barra laterale destra.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'Rivelazione automatica: Ignora eventi da altre finestre',
                desc: "Non cambiare nota attiva quando lavori con note in un'altra finestra."
            },
            paneTransitionDuration: {
                name: 'Animazione pannello singolo',
                desc: 'Durata della transizione quando si passa tra i pannelli in modalità pannello singolo (millisecondi).',
                resetTooltip: 'Ripristina predefinito'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Auto-seleziona prima nota',
                desc: 'Apri automaticamente la prima nota quando cambi cartella, tag o proprietà.'
            },
            skipAutoScroll: {
                name: 'Disabilita auto-scroll per scorciatoie',
                desc: 'Non scorrere il pannello navigazione quando clicchi elementi nelle scorciatoie.'
            },
            autoExpandNavItems: {
                name: 'Espandi alla selezione',
                desc: 'Espandi cartelle e tag quando selezionati. In modalità pannello singolo, la prima selezione espande, la seconda mostra i file.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'Un ramo espanso',
                desc: 'Comprimi gli altri rami dello stesso albero quando espandi una cartella, un tag o una proprietà.'
            },
            springLoadedFolders: {
                name: 'Espandi durante il trascinamento',
                desc: 'Espandi cartelle e tag al passaggio del mouse durante il trascinamento.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Espandi durante il trascinamento: Ritardo prima espansione',
                desc: 'Ritardo prima che la prima cartella o tag si espanda durante un trascinamento (secondi).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Espandi durante il trascinamento: Ritardo espansioni successive',
                desc: 'Ritardo prima di espandere cartelle o tag aggiuntivi durante lo stesso trascinamento (secondi).'
            },
            navigationBanner: {
                name: 'Banner navigazione (profilo vault)',
                desc: "Visualizza un'immagine sopra il pannello navigazione. Cambia con il profilo vault selezionato.",
                current: 'Banner attuale: {path}',
                chooseButton: 'Scegli immagine'
            },
            pinNavigationBanner: {
                name: 'Fissa banner',
                desc: "Fissa il banner di navigazione sopra l'albero di navigazione."
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
                name: 'Mostra file recenti',
                desc: 'Visualizza la sezione file recenti nel pannello navigazione.'
            },
            hideRecentNotes: {
                name: 'Nascondi tipi di file dai file recenti',
                desc: 'Scegli quali tipi di file nascondere nella sezione file recenti.',
                options: {
                    none: 'Nessuno',
                    folderNotes: 'Note cartella'
                }
            },
            recentNotesCount: {
                name: 'Numero file recenti',
                desc: 'Numero di file recenti da visualizzare.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Fissa file recenti con scorciatoie',
                desc: 'Includi i file recenti quando le scorciatoie sono fissate.'
            },
            calendarEnabled: {
                name: 'Attiva calendario',
                desc: 'Attivare le funzionalità del calendario di Notebook Navigator.'
            },
            calendarPlacement: {
                name: 'Posizione del calendario',
                desc: 'Visualizza nella barra laterale sinistra o destra.',
                options: {
                    leftSidebar: 'Barra laterale sinistra',
                    rightSidebar: 'Barra laterale destra'
                }
            },
            calendarLeftPlacement: {
                name: 'Posizione pannello singolo',
                desc: 'Dove viene mostrato il calendario in modalità pannello singolo.',
                options: {
                    navigationPane: 'Pannello di navigazione',
                    below: 'Sotto i pannelli'
                }
            },
            calendarLocale: {
                name: 'Lingua',
                desc: 'Controlla la formattazione delle date del calendario, la numerazione delle settimane e il primo giorno della settimana.',
                weekPathMismatchWarning:
                    'Il calendario visibile e i percorsi delle note settimanali utilizzano inizi settimana o numerazioni delle settimane diversi.',
                options: {
                    systemDefault: 'Predefinito'
                }
            },
            calendarWeekendDays: {
                name: 'Giorni del fine settimana',
                desc: 'Mostra i giorni del fine settimana con un colore di sfondo diverso.',
                options: {
                    none: 'Nessuno',
                    satSun: 'Sabato e domenica',
                    friSat: 'Venerdì e sabato',
                    thuFri: 'Giovedì e venerdì'
                }
            },
            calendarMonthHeadingFormat: {
                name: 'Formato del nome del mese',
                desc: 'Nome del mese lungo (gennaio) o abbreviato (gen).',
                options: {
                    full: 'gennaio (completo)',
                    short: 'gen (breve)'
                }
            },
            showInfoButtons: {
                name: 'Mostra pulsanti informazioni',
                desc: "Mostra i pulsanti informazioni nella barra di ricerca e nell'intestazione del calendario."
            },
            calendarWeeksToShow: {
                name: 'Settimane da mostrare nella barra laterale sinistra',
                desc: 'Il calendario nella barra laterale destra mostra sempre il mese completo.',
                options: {
                    fullMonth: 'Mese intero',
                    oneWeek: '1 settimana',
                    weeksCount: '{count} settimane'
                }
            },
            calendarHighlightToday: {
                name: 'Evidenzia la data di oggi',
                desc: 'Evidenzia la data di oggi con un colore di sfondo e testo in grassetto.'
            },
            calendarShowFeatureImage: {
                name: 'Mostra immagine in evidenza',
                desc: 'Visualizza le immagini in evidenza delle note nel calendario.'
            },
            calendarShowTasks: {
                name: 'Mostra attività',
                desc: 'Mostra un indicatore su giorni, settimane e mesi con attività incomplete.'
            },
            calendarShowWeekNumber: {
                name: 'Mostra numero settimana',
                desc: 'Aggiungi una colonna con il numero della settimana.'
            },
            calendarShowQuarter: {
                name: 'Mostra trimestre',
                desc: "Aggiungi un'etichetta del trimestre nell'intestazione del calendario."
            },
            calendarShowYearCalendar: {
                name: 'Mostra calendario annuale',
                desc: 'Mostra la navigazione annuale e la griglia dei mesi nella barra laterale destra.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Conferma prima di creare',
                desc: 'Mostra una finestra di conferma quando si crea una nuova nota giornaliera.'
            },
            calendarIntegrationMode: {
                name: 'Fonte note giornaliere',
                desc: 'Fonte per le note del calendario.',
                options: {
                    dailyNotes: 'Note giornaliere (plug-in principale)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'Cartella e formato data sono configurati nel plugin Note giornaliere.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'Lingua delle note periodiche',
                desc: 'Controlla i nomi localizzati di mesi, giorni della settimana, numeri di settimana e inizi settimana nei percorsi delle note periodiche di Notebook Navigator.',
                options: {
                    calendar: 'Calendario',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'Cartella radice',
                desc: 'Cartella base per le note periodiche. I pattern di data possono includere sottocartelle. Cambia con il profilo del vault selezionato.',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'Posizione cartella modelli',
                desc: 'Il selettore file modello mostra le note da questa cartella.',
                placeholder: 'Templates',
                usage: 'Usato dalle note calendario e dalle note cartella. Configura i modelli in Calendario > Integrazione calendario e Cartelle e note cartella > File note cartella.'
            },
            calendarCustomFilePattern: {
                name: 'Note giornaliere',
                desc: "Formatta percorso usando formato data Moment. Racchiudi i nomi delle sottocartelle tra parentesi quadre, es. [Work]/YYYY. Clicca sull'icona del modello per impostare un modello. Impostare la posizione della cartella modelli in Operazioni sui file > Modelli.",
                momentDescPrefix: 'Formatta percorso usando ',
                momentLinkText: 'formato data Moment',
                momentDescSuffix:
                    ". Racchiudi i nomi delle sottocartelle tra parentesi quadre, es. [Work]/YYYY. Clicca sull'icona del modello per impostare un modello. Impostare la posizione della cartella modelli in Operazioni sui file > Modelli.",
                templaterSupportInstalled: '✅ Il plugin Templater è installato con supporto completo ai modelli.',
                templaterSupportMissing: '⚠️ Installa il plugin Templater per il supporto completo ai modelli.',
                placeholder: 'YYYY/YYYYMMDD',
                example: 'Sintassi attuale: {path}',
                parsingError: 'Il modello deve poter essere formattato e rianalizzato come una data completa (anno, mese, giorno).'
            },
            calendarCustomWeekPattern: {
                name: 'Note settimanali',
                parsingError:
                    'Il modello deve poter essere formattato e rianalizzato come una settimana completa (anno settimana, numero settimana).',
                weekPathMismatchWarning:
                    'I percorsi delle note settimanali utilizzano la lingua delle note periodiche. Usa lingue corrispondenti, o usa "GGGG" con "WW" per settimane basate sul lunedì.',
                mixedWeekTokensWarning:
                    'Questo modello mescola token di settimana basati sul lunedì ("W" o "G") con token di settimana basati sulla lingua ("w" o "g"). Usa un solo insieme in modo coerente: "GGGG" con "WW" per settimane basate sul lunedì, o "gggg" con "ww" se le note settimanali devono seguire la lingua selezionata.'
            },
            calendarCustomMonthPattern: {
                name: 'Note mensili',
                parsingError: 'Il modello deve poter essere formattato e rianalizzato come un mese completo (anno, mese).'
            },
            calendarCustomQuarterPattern: {
                name: 'Note trimestrali',
                parsingError: 'Il modello deve poter essere formattato e rianalizzato come un trimestre completo (anno, trimestre).'
            },
            calendarCustomYearPattern: {
                name: 'Note annuali',
                parsingError: 'Il modello deve poter essere formattato e rianalizzato come un anno completo (anno).'
            },
            calendarTemplateFile: {
                current: 'File modello: {name}'
            },
            showTooltips: {
                name: 'Mostra tooltip',
                desc: 'Visualizza tooltip al passaggio del mouse con informazioni aggiuntive per note e cartelle.'
            },
            showTooltipPath: {
                name: 'Mostra percorso nei tooltip',
                desc: 'Visualizza il percorso cartella sotto i nomi note nei tooltip.'
            },
            showTooltipWordCount: {
                name: 'Mostra conteggio parole nei tooltip',
                desc: 'Visualizza il conteggio delle parole delle note nei tooltip.'
            },
            resetPaneSeparator: {
                name: 'Ripristina posizione separatore pannelli',
                desc: 'Ripristina il separatore trascinabile tra pannello navigazione e pannello lista alla posizione predefinita.',
                buttonText: 'Ripristina separatore',
                notice: 'Posizione separatore ripristinata. Riavvia Obsidian o riapri Notebook Navigator per applicare.'
            },
            settingsTransfer: {
                name: 'Importa ed esporta impostazioni',
                desc: 'Esporta o importa le impostazioni di Notebook Navigator come JSON. L\u2019importazione sostituisce tutte le impostazioni.',
                importButtonText: 'Importa',
                exportButtonText: 'Esporta',
                import: {
                    modalTitle: 'Importa impostazioni',
                    fileButtonName: 'Importa da file',
                    fileButtonDesc: 'Carica un file JSON dal disco.',
                    fileButtonText: 'Importa da file',
                    editorName: 'JSON',
                    editorDesc:
                        'Incolla o modifica il JSON qui sotto. Le impostazioni non incluse vengono ripristinate ai valori predefiniti.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'Importa',
                    confirmTitle: 'Importare le impostazioni?',
                    confirmMessage: 'L’importazione sostituisce le impostazioni correnti di Notebook Navigator.',
                    backupToggleName: 'Salva le impostazioni correnti nella radice del vault prima di importare',
                    backupToggleDesc: 'Crea un file JSON con timestamp nella radice del vault.',
                    successWithBackupNotice: 'Impostazioni importate. Le impostazioni precedenti sono state salvate in {path}.',
                    backupError: 'Impossibile salvare le impostazioni correnti: {message}',
                    successNotice: 'Impostazioni importate.',
                    errorNotice: 'Impossibile importare le impostazioni: {message}',
                    fileReadError: 'Impossibile leggere il file: {message}'
                },
                export: {
                    modalTitle: 'Esporta impostazioni',
                    editorName: 'JSON',
                    editorDesc: 'Sono incluse solo le impostazioni modificate rispetto ai valori predefiniti.',
                    placeholder: '{}',
                    copyButtonText: 'Copia negli appunti',
                    downloadButtonText: 'Scarica',
                    copyNotice: 'Impostazioni copiate negli appunti.',
                    downloadNotice: 'Impostazioni esportate.',
                    downloadError: 'Impossibile scaricare le impostazioni: {message}'
                }
            },
            resetAllSettings: {
                name: 'Ripristina tutte le impostazioni',
                desc: 'Ripristina tutte le impostazioni di Notebook Navigator ai valori predefiniti.',
                buttonText: 'Ripristina tutte le impostazioni',
                confirmTitle: 'Ripristinare tutte le impostazioni?',
                confirmMessage:
                    'Questo ripristinerà tutte le impostazioni di Notebook Navigator ai valori predefiniti. Non può essere annullato.',
                confirmButtonText: 'Ripristina tutte le impostazioni',
                notice: 'Impostazioni ripristinate. Riavvia Obsidian o riapri Notebook Navigator per applicare.',
                error: 'Impossibile ripristinare le impostazioni.'
            },
            multiSelectModifier: {
                name: 'Modificatore selezione multipla',
                desc: 'Scegli quale tasto modificatore attiva la selezione multipla. Quando Option/Alt è selezionato, Cmd/Ctrl click apre le note in una nuova scheda.',
                options: {
                    cmdCtrl: 'Click Cmd/Ctrl',
                    optionAlt: 'Click Option/Alt'
                }
            },
            enterToOpenFiles: {
                name: 'Premi Invio per aprire i file',
                desc: "Apri i file solo premendo Invio durante la navigazione da tastiera nell'elenco. Su macOS, questo impedisce a Invio di rinominare i file."
            },
            shiftEnterOpenContext: {
                name: 'Shift+Invio',
                desc: 'Scegli se Shift+Invio apre o rinomina il file selezionato.'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Invio',
                desc: 'Scegli se Cmd+Invio apre o rinomina il file selezionato.'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Invio',
                desc: 'Scegli se Ctrl+Invio apre o rinomina il file selezionato.'
            },
            mouseBackForwardAction: {
                name: 'Pulsanti indietro/avanti del mouse',
                desc: 'Azione per i pulsanti indietro e avanti del mouse su desktop.',
                options: {
                    none: 'Usa impostazione predefinita di sistema',
                    singlePaneSwitch: 'Cambia pannello (pannello singolo)',
                    history: 'Naviga nella cronologia'
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
                desc: 'Scegli cosa Notebook Navigator apre automaticamente all\u2019avvio.',
                current: 'Attuale: {path}',
                chooseButton: 'Scegli file',
                options: {
                    none: 'Nessuno',
                    file: 'File',
                    dailyNote: 'Nota giornaliera',
                    weeklyNote: 'Nota settimanale',
                    monthlyNote: 'Nota mensile',
                    quarterlyNote: 'Nota trimestrale',
                    yearlyNote: 'Nota annuale'
                },
                file: {
                    name: 'Homepage: File di avvio',
                    empty: 'Nessun file selezionato'
                },
                createMissing: {
                    name: 'Homepage: Crea nota se mancante',
                    desc: "Crea la nota periodica all'avvio o tramite comando se non esiste."
                }
            },
            excludedNotes: {
                name: 'Nascondi note con regole di proprietà (profilo vault)',
                desc: 'Lista di regole frontmatter separate da virgola. Usa voci `key` o `key=value` (es. status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'Nascondi file (profilo vault)',
                desc: 'Lista di pattern di nomi file separati da virgola da nascondere. Supporta caratteri jolly * e percorsi / (es. temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Profilo vault',
                desc: "I profili memorizzano visibilità tipi file, file nascosti, cartelle nascoste, tag nascosti, regole di proprietà per note nascoste, scorciatoie e banner navigazione. Cambia profilo dall'intestazione del pannello navigazione.",
                defaultName: 'Predefinito',
                addButton: 'Aggiungi profilo',
                editProfilesButton: 'Modifica profili',
                addProfileOption: 'Aggiungi profilo...',
                applyButton: 'Applica',
                deleteButton: 'Elimina profilo',
                addModalTitle: 'Aggiungi profilo',
                editProfilesModalTitle: 'Modifica profili',
                addModalPlaceholder: 'Nome profilo',
                deleteModalTitle: 'Elimina {name}',
                deleteModalMessage:
                    'Rimuovere {name}? I filtri file, cartelle, tag e note basati su proprietà salvati in questo profilo saranno eliminati.',
                moveUp: 'Sposta su',
                moveDown: 'Sposta giù',
                errors: {
                    emptyName: 'Inserisci un nome profilo',
                    duplicateName: 'Nome profilo già esistente'
                }
            },
            vaultTitle: {
                name: 'Posizione titolo vault',
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
            descendantExcludedFolders: {
                name: 'Escludi cartelle dalle note delle sottocartelle (profilo vault)',
                desc: 'Lista di cartelle separate da virgola da ignorare quando vengono raccolte le note dalle sottocartelle. Le cartelle restano visibili e selezionandone una vengono comunque mostrate le sue note. Usa gli stessi pattern di Nascondi cartelle.',
                placeholder: 'giornaliere, risorse, /archivio'
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
            showFileProperties: {
                name: 'Mostra proprietà file',
                desc: 'Visualizza le proprietà negli elementi file. Usa la finestra "Visibilità chiavi proprietà" per scegliere quali proprietà mostrare.'
            },
            colorFileProperties: {
                name: 'Colora proprietà file',
                desc: 'Applica i colori delle proprietà ai badge delle proprietà negli elementi file.'
            },
            prioritizeColoredFileProperties: {
                name: 'Mostra proprietà colorate prima',
                desc: 'Ordina le proprietà colorate prima delle altre proprietà negli elementi file.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Mostra proprietà in modalità compatta',
                desc: 'Visualizza le proprietà quando la modalità compatta è attiva.'
            },
            textCountDisplay: {
                name: 'Tipo di conteggio',
                desc: 'Scegli quali conteggi delle note mostrare negli elementi file.',
                options: {
                    none: 'Nessuno',
                    words: 'Conteggio parole',
                    characters: 'Conteggio caratteri',
                    both: 'Conteggio parole e caratteri'
                }
            },
            textCountPlacement: {
                name: 'Posizione',
                desc: 'Scegli dove mostrare i conteggi delle note.',
                options: {
                    title: 'Nel titolo',
                    property: 'Come proprietà'
                }
            },
            characterCountSpaces: {
                name: 'Conteggio caratteri',
                desc: 'Scegli se includere gli spazi nel conteggio caratteri.',
                options: {
                    include: 'Spazi inclusi',
                    exclude: 'Spazi esclusi'
                }
            },
            wordCountTargetProperty: {
                name: 'Proprietà obiettivo',
                desc: 'Chiave della proprietà frontmatter contenente l’obiettivo di conteggio parole. Lascia vuoto per nascondere gli obiettivi.'
            },
            showWordCountPercentage: {
                name: 'Mostra percentuale obiettivo',
                desc: 'Mostra solo la percentuale di avanzamento quando è disponibile un obiettivo di conteggio parole.'
            },
            propertyFields: {
                name: 'Chiavi proprietà (profilo cassaforte)',
                desc: "Chiavi proprietà dei metadati, con visibilità per chiave per la navigazione e l'elenco file.",
                addButtonTooltip: 'Configura chiavi proprietà',
                noneConfigured: 'Nessuna proprietà configurata',
                singleConfigured: '1 proprietà configurata: {properties}',
                multipleConfigured: '{count} proprietà configurate: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'Mostra proprietà su righe separate',
                desc: 'Mostra ogni proprietà sulla propria riga.'
            },
            enablePropertyInternalLinks: {
                name: 'Collega le etichette proprietà alle note',
                desc: "Fai clic su un'etichetta proprietà per aprire la nota collegata."
            },
            enablePropertyExternalLinks: {
                name: 'Collega le etichette proprietà agli URL',
                desc: "Fai clic su un'etichetta proprietà per aprire l'URL collegato."
            },
            dateFormat: {
                name: 'Formato data',
                desc: 'Formato per visualizzare le date (usa formato Moment).',
                placeholder: 'D MMM YYYY',
                help: 'Formati comuni:\nD MMM YYYY = 25 mag 2022\nDD/MM/YYYY = 25/05/2022\nYYYY-MM-DD = 2022-05-25\n\nToken:\nYYYY/YY = anno\nMMMM/MMM/MM = mese\nDD/D = giorno\ndddd/ddd = giorno settimana',
                helpTooltip: 'Formato con Moment',
                momentLinkText: 'formato Moment'
            },
            timeFormat: {
                name: 'Formato ora',
                desc: 'Formato per visualizzare le ore (usa formato Moment).',
                placeholder: 'HH:mm',
                help: 'Formati comuni:\nh:mm a = 2:30 PM (12 ore)\nHH:mm = 14:30 (24 ore)\nh:mm:ss a = 2:30:45 PM\nHH:mm:ss = 14:30:45\n\nToken:\nHH/H = 24 ore\nhh/h = 12 ore\nmm = minuti\nss = secondi\na = AM/PM',
                helpTooltip: 'Formato con Moment',
                momentLinkText: 'formato Moment'
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
            stripLatexInPreview: {
                name: 'Rimuovi LaTeX nelle anteprime',
                desc: 'Rimuove le espressioni LaTeX inline e a blocco dal testo di anteprima.'
            },
            previewProperties: {
                name: 'Proprietà anteprima',
                desc: 'Lista di proprietà frontmatter separate da virgola da controllare per testo anteprima. La prima proprietà con testo sarà usata.',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'Ricorri al contenuto della nota',
                desc: 'Mostra il contenuto della nota come anteprima quando nessuna delle proprietà specificate contiene testo.'
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
                    '2': '2 righe',
                    '3': '3 righe'
                }
            },
            useFolderColor: {
                name: 'Usa colore cartella',
                desc: 'Colora i titoli delle note e le icone file con il colore della cartella genitore quando non è impostato un colore file personalizzato. Priorità: colore file personalizzato > colore cartella > colore predefinito.'
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
                desc: 'Lista di proprietà frontmatter separate da virgola da controllare per prime. Usa la prima immagine nel contenuto markdown come fallback.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'Escludi note con proprietà',
                desc: 'Lista di proprietà frontmatter separate da virgola. Le note contenenti una di queste proprietà non memorizzano immagini di copertina.',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: "Dimensione di visualizzazione dell'immagine in evidenza",
                desc: 'Dimensione massima di rendering per le immagini in evidenza nelle liste di note.',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: "Dimensione in pixel dell'immagine in evidenza",
                desc: 'Risoluzione utilizzata per generare le miniature memorizzate delle immagini in evidenza. Aumenta questo valore se le anteprime più grandi appaiono sfocate.',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'Scarica immagini esterne',
                desc: 'Scarica immagini remote e miniature di YouTube per le immagini in evidenza.'
            },
            hideDrawingPreviewImages: {
                name: 'Nascondi le immagini di anteprima esportate',
                desc: 'Nasconde i file PNG di anteprima dei disegni esportati. Attiva "Mostra elementi nascosti" per visualizzarli.'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator mostra i file PNG esportati da Excalidraw come anteprime dei disegni.',
                items: [
                    'Nelle **impostazioni di Excalidraw**, apri **Embedding Excalidraw into your Notes and Exporting**, poi **Export Settings**, poi **Auto-export Settings**.',
                    'Attiva **Auto-export PNG**. Facoltativamente, attiva **Export both dark- and light-themed image**.',
                    'Notebook Navigator cerca **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** o **Drawing.excalidraw.light.png**.',
                    'Quando **Nascondi le immagini di anteprima esportate** è attivo, i file PNG vengono mostrati solo se anche **Mostra elementi nascosti** è attivo.'
                ]
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
            folderSortOrder: {
                name: 'Ordine cartelle',
                desc: 'Fai clic destro su una cartella per impostare un ordine diverso per i suoi elementi secondari.',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A'
                }
            },
            showNoteCount: {
                name: 'Mostra conteggio note',
                desc: 'Visualizza i conteggi note accanto a cartelle, tag e proprietà.'
            },
            showSectionIcons: {
                name: 'Mostra icone per scorciatoie e elementi recenti',
                desc: 'Visualizza icone accanto agli elementi nelle sezioni Scorciatoie e Recenti.'
            },
            interfaceIcons: {
                name: "Icone dell'interfaccia",
                desc: 'Modifica icone di barra strumenti, cartelle, tag, proprietà, elementi fissati, ricerca e ordinamento.',
                buttonText: 'Modifica icone'
            },
            showIconsColorOnly: {
                name: 'Applica colore solo alle icone',
                desc: 'Quando abilitato, i colori personalizzati sono applicati solo alle icone. Quando disabilitato, i colori sono applicati sia alle icone che alle etichette testo.'
            },
            navRainbowMode: {
                name: 'Modalità colori arcobaleno (profilo vault)',
                desc: 'Applica colori arcobaleno nel pannello di navigazione.',
                options: {
                    none: 'Disattivato',
                    foreground: 'Colore del testo',
                    background: 'Colore di sfondo'
                }
            },
            navRainbowFirstColor: {
                name: 'Primo colore',
                desc: 'Primo colore nel gradiente arcobaleno.'
            },
            navRainbowLastColor: {
                name: 'Ultimo colore',
                desc: 'Ultimo colore nel gradiente arcobaleno.'
            },
            navRainbowTransitionStyle: {
                name: 'Stile di transizione',
                desc: "Interpolazione utilizzata tra il primo e l'ultimo colore.",
                options: {
                    hue: 'Hue',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'Applica alle scorciatoie',
                desc: 'Applica colori arcobaleno alle scorciatoie.'
            },
            navRainbowApplyToRecent: {
                name: 'Applica agli elementi recenti',
                desc: 'Applica colori arcobaleno agli elementi recenti.'
            },
            navRainbowApplyToFolders: {
                name: 'Applica alle cartelle',
                desc: 'Applica colori arcobaleno alle cartelle.'
            },
            navRainbowFolderScope: {
                name: 'Ambito cartelle',
                desc: 'Seleziona quali livelli di cartella avviano le assegnazioni di colore.',
                options: {
                    root: 'Livello radice',
                    child: 'Livello figlio',
                    all: 'Ogni livello'
                }
            },
            navRainbowApplyToTags: {
                name: 'Applica ai tag',
                desc: 'Applica colori arcobaleno ai tag.'
            },
            navRainbowTagScope: {
                name: 'Ambito tag',
                desc: 'Seleziona quali livelli di tag avviano le assegnazioni di colore.',
                options: {
                    root: 'Livello radice',
                    child: 'Livello figlio',
                    all: 'Ogni livello'
                }
            },
            navRainbowApplyToProperties: {
                name: 'Applica alle proprietà',
                desc: 'Applica colori arcobaleno alle proprietà.'
            },
            navRainbowBalanceHueLuminance: {
                name: 'Luminosità uniforme tra le tonalità', // (English: Consistent brightness across hues)
                desc: 'Interpola la luminosità tra i colori iniziale e finale durante le transizioni di tonalità.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'Colori separati per modalità chiara e scura', // (English: Separate light and dark mode colors)
                desc: 'Usa colori arcobaleno diversi per la modalità chiara e la modalità scura.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'Copia il colore della modalità chiara nella modalità scura', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'Ambito proprietà',
                desc: 'Seleziona quali livelli di proprietà avviano le assegnazioni di colore.',
                options: {
                    root: 'Livello radice',
                    child: 'Livello figlio',
                    all: 'Ogni livello'
                }
            },
            collapseBehavior: {
                name: 'Comprimi elementi',
                desc: 'Scegli cosa influenza il pulsante espandi/comprimi tutto.',
                options: {
                    all: 'Tutto',
                    foldersOnly: 'Solo cartelle',
                    tagsOnly: 'Solo tag',
                    propertiesOnly: 'Solo proprietà'
                }
            },
            smartCollapse: {
                name: 'Mantieni elemento selezionato espanso',
                desc: "Quando comprimi, mantieni l'elemento selezionato e i suoi genitori espansi."
            },
            excludeVaultRootFromCollapse: {
                name: 'Ignora la root del vault quando comprimi',
                desc: 'Quando comprimi tutti gli elementi, lascia la cartella root del vault nello stato corrente.'
            },
            navIndent: {
                name: 'Indentazione albero',
                desc: 'Regola la larghezza indentazione per cartelle, tag e proprietà nidificati (pixel).'
            },
            navItemHeight: {
                name: 'Altezza elemento',
                desc: "Regola l'altezza di cartelle, tag e proprietà nel pannello navigazione (pixel)."
            },
            navItemHeightScaleText: {
                name: 'Scala testo con altezza elemento',
                desc: "Riduci dimensione testo navigazione quando l'altezza elemento è ridotta."
            },
            showIndentGuides: {
                name: 'Mostra guide di indentazione',
                desc: 'Mostra guide di indentazione per cartelle, tag e proprietà nidificati.'
            },
            navCountLeaderStyle: {
                name: 'Mostra caratteri di riempimento',
                desc: 'Mostra punti, trattini o una linea tra i nomi degli elementi e il numero di note.',
                options: {
                    none: 'Nessuno',
                    dots: 'Punti (...)',
                    dashes: 'Trattini (---)',
                    line: 'Linea'
                }
            },
            navRootSpacing: {
                name: 'Spaziatura elementi root',
                desc: 'Spaziatura tra cartelle, tag e proprietà di livello root (pixel).'
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
                desc: 'Fai clic destro su un tag per impostare un ordine diverso per i suoi elementi secondari.',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A',
                    frequency: 'Frequenza',
                    lowToHigh: 'bassa ad alta',
                    highToLow: 'alta a bassa'
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
            scopeTagsToCurrentContext: {
                name: 'Filtra tag per selezione',
                desc: 'Mostra solo i tag presenti nelle note nella cartella o proprietà selezionata.'
            },
            keepEmptyTagsProperty: {
                name: 'Mantieni proprietà tags dopo rimozione ultimo tag',
                desc: 'Mantieni la proprietà tags frontmatter quando tutti i tag sono rimossi. Quando disabilitato, la proprietà tags è eliminata dal frontmatter.'
            },
            showProperties: {
                name: 'Mostra proprietà',
                desc: 'Visualizza la sezione proprietà nel navigatore.',
                propertyKeysInfoPrefix: 'Configura le proprietà in ',
                propertyKeysInfoLinkText: 'Avvio > Chiavi proprietà',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'Mostra icone proprietà',
                desc: 'Visualizza le icone accanto alle proprietà nel pannello di navigazione.'
            },
            inheritPropertyColors: {
                name: 'Eredita colori proprietà',
                desc: 'I valori delle proprietà ereditano colore e sfondo dalla loro chiave di proprietà.'
            },
            propertySortOrder: {
                name: 'Ordine di ordinamento proprietà',
                desc: 'Fai clic destro su una proprietà per impostare un ordine di ordinamento diverso per i suoi valori.',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A',
                    frequency: 'Frequenza',
                    lowToHigh: "dal basso all'alto",
                    highToLow: "dall'alto al basso"
                }
            },
            showAllPropertiesFolder: {
                name: 'Mostra cartella proprietà',
                desc: 'Visualizza "Proprietà" come cartella comprimibile.'
            },
            scopePropertiesToCurrentContext: {
                name: 'Filtra proprietà per selezione',
                desc: 'Mostra solo le proprietà presenti nelle note nella cartella o tag selezionato.'
            },
            hiddenTags: {
                name: 'Nascondi tag (profilo vault)',
                desc: 'Lista di pattern tag separati da virgola. Pattern nome: tag* (inizia con), *tag (finisce con). Pattern percorso: archivio (tag e discendenti), archivio/* (solo discendenti), progetti/*/bozze (wildcard intermedio).',
                placeholder: 'archivio*, *bozza, progetti/*/vecchio'
            },
            hiddenFileTags: {
                name: 'Nascondi note con tag (profilo vault)',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'Abilita note cartella',
                desc: 'Le cartelle con un file nota corrispondente vengono visualizzate come link cliccabili.'
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
            folderNoteNamePattern: {
                name: 'Modello nome nota cartella',
                desc: 'Modello di nome per le note cartella senza estensione. Usa {{folder}} per inserire il nome della cartella. Se impostato, il nome della nota cartella non si applica.'
            },
            folderNoteTemplate: {
                name: 'Modello nota cartella',
                desc: 'File modello usato durante la creazione delle note cartella. I modelli Markdown possono usare Templater. I modelli Canvas e Base vengono copiati come contenuto del file. Impostare la posizione della cartella modelli in Operazioni sui file > Modelli.',
                formatWarning: 'Il formato del modello deve corrispondere al tipo di nota cartella selezionato: .md, .canvas o .base.'
            },
            enableFolderNoteLinks: {
                name: 'I nomi delle cartelle aprono note cartella',
                desc: 'Facendo clic sul nome di una cartella si apre la relativa nota cartella. Quando disattivato, le note cartella forniscono solo metadati della cartella come nome, icona e colore.'
            },
            hideFolderNoteInList: {
                name: 'Nascondi note cartella nella lista',
                desc: "Nascondere le note cartella dall'elenco dei file."
            },
            pinCreatedFolderNote: {
                name: 'Fissa note cartella create',
                desc: 'Fissare le note cartella quando create dal menu contestuale.'
            },
            folderNoteOpenLocation: {
                name: 'Apri note cartella in',
                desc: 'Scegli dove aprire le note cartella quando si fa clic sui link delle note cartella.',
                options: {
                    currentTab: 'Scheda corrente',
                    newTab: 'Nuova scheda',
                    rightSidebar: 'Barra laterale destra'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: 'Barra laterale destra: Mostra nota cartella più vicina',
                desc: 'Quando viene selezionata una cartella, la barra laterale destra mostra automaticamente la nota cartella antenata più vicina.'
            },
            confirmBeforeDelete: {
                name: 'Conferma prima di eliminare',
                desc: 'Mostra dialogo conferma quando elimini note o cartelle'
            },
            deleteAttachments: {
                name: 'Elimina allegati quando si eliminano i file',
                desc: 'Rimuovi automaticamente gli allegati collegati e le anteprime dei disegni generate se non sono utilizzati altrove',
                options: {
                    ask: 'Chiedi ogni volta',
                    always: 'Sempre',
                    never: 'Mai'
                }
            },
            moveFileConflicts: {
                name: 'Conflitti di spostamento',
                desc: 'Quando si sposta un file in una cartella dove esiste già un file con lo stesso nome. Chiedi ogni volta (rinomina, sovrascrivi, annulla) o rinomina sempre.',
                options: {
                    ask: 'Chiedi ogni volta',
                    rename: 'Rinomina sempre'
                }
            },
            metadataCleanup: {
                name: 'Pulisci metadati',
                desc: 'Rimuove metadati orfani lasciati quando file, cartelle, tag o proprietà sono eliminati, spostati o rinominati fuori da Obsidian. Questo influisce solo sul file impostazioni Notebook Navigator.',
                buttonText: 'Pulisci metadati',
                error: 'Pulizia impostazioni fallita',
                loading: 'Controllo metadati...',
                statusClean: 'Nessun metadato da pulire',
                statusCounts:
                    'Elementi orfani: {folders} cartelle, {tags} tag, {properties} proprietà, {files} file, {pinned} fissati, {separators} separatori'
            },
            rebuildCache: {
                name: 'Ricostruisci cache',
                desc: 'Usa se riscontri tag mancanti, anteprime errate o immagini in evidenza mancanti. Questo può accadere dopo conflitti sync o chiusure inaspettate.',
                buttonText: 'Ricostruisci cache',
                error: 'Impossibile ricostruire cache',
                indexingTitle: 'Indicizzazione del vault...',
                progress: 'Aggiornamento della cache di Notebook Navigator.'
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
            frontmatterBackgroundField: {
                name: 'Campo sfondo',
                desc: 'Campo frontmatter per colori di sfondo. Lascia vuoto per usare colori di sfondo salvati nelle impostazioni.',
                placeholder: 'background'
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
                placeholder: 'title, name'
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
                desc: 'Formato usato per parsare timestamp nel frontmatter. Lascia vuoto per usare parsing ISO 8601.',
                helpTooltip: 'Formato con Moment',
                momentLinkText: 'formato Moment',
                help: 'Formati comuni:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'Supporta lo sviluppo',
                desc: 'Se ami usare Notebook Navigator, considera di supportare il suo sviluppo continuo.',
                buttonText: '❤️ Sponsorizza',
                coffeeButton: '☕️ Offrimi un caffè'
            },
            updateCheckOnStart: {
                name: "Controlla nuova versione all'avvio",
                desc: "Controlla nuovi rilasci plugin all'avvio e mostra notifica quando un aggiornamento è disponibile. I controlli avvengono al massimo una volta al giorno.",
                status: 'Nuova versione disponibile: {version}'
            },
            debugLogging: {
                name: 'Registro di debug all’avvio',
                desc: 'Scrive la diagnostica di avvio in un file Markdown con data e ora nella radice del vault, poi si ferma quando l’avvio si stabilizza. Il file può essere sincronizzato e può includere percorsi di file.'
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
        openBannerImage: 'Apri immagine banner della versione',
        supportMessage: 'Se trovi Notebook Navigator utile, considera di supportare il suo sviluppo.',
        supportButton: 'Offrimi un caffè',
        thanksButton: 'Grazie!'
    }
};
