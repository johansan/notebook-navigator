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
 * Polish language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_PL = {
    // Common UI elements
    common: {
        cancel: 'Anuluj', // Button text for canceling dialogs and operations (English: Cancel)
        delete: 'Usuń', // Button text for delete operations in dialogs (English: Delete)
        clear: 'Wyczyść', // Button text for clearing values (English: Clear)
        remove: 'Usuń', // Button text for remove operations in dialogs (English: Remove)
        restoreDefault: 'Przywróć domyślne', // Button text for restoring values to defaults (English: Restore default)
        submit: 'Wyślij', // Button text for submitting forms and dialogs (English: Submit)
        save: 'Zapisz', // Button text for saving settings and dialogs (English: Save)
        configure: 'Konfiguruj', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'Tryb jasny', // Label for light theme mode (English: Light mode)
        darkMode: 'Tryb ciemny', // Label for dark theme mode (English: Dark mode)
        noSelection: 'Nie wybrano', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Bez tagów', // Label for notes without any tags (English: Untagged)
        featureImageAlt: 'Wyróżniony obraz', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Nieznany błąd', // Generic fallback when an error has no message (English: Unknown error)
        clipboardWriteError: 'Nie można zapisać do schowka',
        updateBannerTitle: 'Aktualizacja Notebook Navigator dostępna',
        updateBannerInstruction: 'Zaktualizuj w Ustawienia → Wtyczki społeczności',
        previous: 'Poprzedni', // Generic aria label for previous navigation (English: Previous)
        next: 'Następny' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Wybierz folder lub tag, aby wyświetlić notatki', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Brak notatek', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Przypięte', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Notatki', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Pliki', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (ukryte)', // Accessibility label applied to list items that are normally hidden
        collapseGroup: 'Zwiń grupę',
        expandGroup: 'Rozwiń grupę',
        manualSortTitle: 'Sortowanie ręczne: {property}',
        manualSortHint:
            'Przeciągnij, aby zmienić kolejność. Kolejność jest zapisywana jako wartości indeksu liczbowego w atrybucie „{property}”.',
        manualSortNonMarkdownHint: 'Pliki inne niż Markdown są wyświetlane na dole i nie można zmieniać ich kolejności.',
        unsortedSection: 'Nieposortowane',
        manualSortDone: 'Gotowe',
        manualSortMultipleWriteFailure: '{count} plików nie powiodło się; pierwszy: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Bez tagów', // Label for the special item showing notes without tags (English: Untagged)
        tags: 'Tagi' // Label for the tags virtual folder (English: Tags)
    },

    navigationPane: {
        shortcutsHeader: 'Skróty',
        recentFilesHeader: 'Ostatnie pliki', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Atrybuty',
        reorderRootFoldersTitle: 'Zmień kolejność elementów',
        reorderRootFoldersHint: 'Użyj strzałek lub przeciągnij, aby zmienić kolejność',
        vaultRootLabel: 'Sejf',
        resetRootToAlpha: 'Ustaw alfabetycznie',
        resetRootToFrequency: 'Ustaw ostatnie',
        pinShortcuts: 'Przypnij skróty',
        pinShortcutsAndRecentFiles: 'Przypnij skróty i ostatnie pliki',
        unpinShortcuts: 'Odepnij skróty',
        unpinShortcutsAndRecentFiles: 'Odepnij skróty i ostatnie pliki',
        profileMenuAria: 'Zmień profil sejfu'
    },

    navigationCalendar: {
        ariaLabel: 'Kalendarz',
        dailyNotesNotEnabled: 'Wbudowana wtyczka Dziennik jest wyłączona.',
        noteHiddenByProfile: 'Notatka kalendarza jest ukryta przez bieżący profil magazynu.',
        createDailyNote: {
            title: 'Nowy dziennik',
            message: 'Plik {filename} nie istnieje. Czy chcesz go utworzyć?',
            confirmButton: 'Utwórz'
        },
        helpModal: {
            title: 'Skróty kalendarza',
            items: [
                'Kliknij dowolny dzień, aby otworzyć lub utworzyć dziennik. Tygodnie, miesiące, kwartały i lata działają w ten sam sposób.',
                'Wypełniona kropka pod dniem oznacza, że jest do niego dołączona notatka. Pusta kropka oznacza, że są do niego przypisane zadania do wykonania.',
                'Jeśli notatka zawiera obrazek, pojawia się on jako tło dnia.'
            ],
            dateFilterCmdCtrl: 'Kliknij datę z Cmd/Ctrl, aby filtrować według tej daty na liście plików.',
            dateFilterOptionAlt: 'Kliknij datę z Option/Alt, aby filtrować według tej daty na liście plików.'
        }
    },

    dailyNotes: {
        templateReadFailed: 'Nie udało się odczytać szablonu dziennika.',
        createFailed: 'Nie można utworzyć dziennika.'
    },

    shortcuts: {
        folderExists: 'Folder jest już w skrótach',
        noteExists: 'Notatka jest już w skrótach',
        tagExists: 'Tag jest już w skrótach',
        propertyExists: 'Atrybut jest już w skrótach',
        invalidProperty: 'Nieprawidłowy atrybut',
        searchExists: 'Skrót wyszukiwania już istnieje',
        emptySearchQuery: 'Wprowadź wyszukiwanie przed zapisaniem',
        emptySearchName: 'Wprowadź nazwę przed zapisaniem wyszukiwania',
        add: 'Dodaj do skrótów',
        addNotesCount: 'Dodaj notatki do skrótów: {count}',
        addFilesCount: 'Dodaj pliki do skrótów: {count}',
        rename: 'Zmień nazwę skrótu',
        remove: 'Usuń ze skrótów',
        removeAll: 'Usuń wszystkie skróty',
        removeAllConfirm: 'Usunąć wszystkie skróty?',
        folderNotesPinned: 'Przypięte notatki folderu: {count}'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Zwiń elementy', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'Rozwiń wszystkie elementy', // Tooltip for button that expands all items (English: Expand all items)
        showCalendar: 'Pokaż kalendarz',
        hideCalendar: 'Ukryj kalendarz',
        newFolder: 'Nowy folder', // Tooltip for create new folder button (English: New folder)
        newNote: 'Nowa notatka', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Wróć do nawigacji', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeChildSortOrder: 'Zmień kolejność sortowania',
        changeSortAndGroup: 'Zmień sortowanie i grupowanie',
        resetViewToDefaults: 'Przywróć widok do ustawień domyślnych',
        manualSort: 'Sortowanie ręczne',
        editSortOrder: 'Edytuj kolejność sortowania...',
        removeSortProperty: 'Usuń atrybut sortowania',
        descendants: 'potomków',
        subfolders: 'podfolderów',
        subtags: 'podtagów',
        childValues: 'wartości podrzędnych',
        applySortAndGroupToDescendants: (target: string) => `Zastosuj sortowanie i grupowanie dla ${target}`,
        applyAppearanceToDescendants: (target: string) => `Zastosuj wygląd dla ${target}`,
        showFolders: 'Pokaż nawigację', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: 'Zmień kolejność elementów',
        finishRootFolderReorder: 'Gotowe',
        showExcludedItems: 'Pokaż ukryte foldery, tagi i notatki', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Ukryj ukryte foldery, tagi i notatki', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Pokaż oba panele', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Pokaż jeden panel', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            'Podwójne panele są niedostępne, gdy pasek boczny jest zbyt wąski. Aby to zmienić, ustaw „Gdy pasek boczny jest zbyt wąski” na „Nic nie rób” w Ustawienia > Wygląd i zachowanie.',
        changeAppearance: 'Zmień wygląd', // Tooltip for button to change folder appearance settings (English: Change appearance)
        showNotesFromSubfolders: 'Pokaż notatki z podfolderów',
        showFilesFromSubfolders: 'Pokaż pliki z podfolderów',
        showNotesFromDescendants: 'Pokaż notatki z potomnych',
        showFilesFromDescendants: 'Pokaż pliki z potomnych',
        search: 'Szukaj' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Szukaj...', // Placeholder text for search input (English: Search...)
        placeholderVault: 'Szukaj w sejfie...',
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Wyczyść wyszukiwanie', // Tooltip for clear search button (English: Clear search)
        switchToFilterSearch: 'Przełącz na wyszukiwanie z filtrem',
        switchToOmnisearch: 'Przełącz na Omnisearch',
        saveSearchShortcut: 'Zapisz wyszukiwanie w skrótach',
        removeSearchShortcut: 'Usuń wyszukiwanie ze skrótów',
        shortcutModalTitle: 'Zapisz wyszukiwanie',
        shortcutNamePlaceholder: 'Wprowadź nazwę skrótu',
        shortcutStartIn: 'Zawsze rozpocznij w: {path}',
        searchHelp: 'Składnia wyszukiwania',
        searchHelpTitle: 'Składnia wyszukiwania',
        searchHelpModal: {
            intro: 'Połącz nazwy wyświetlane, aliasy, atrybuty, tagi, daty i filtry w jednym zapytaniu (np. „meeting .status=active #work @thisweek”). Zainstaluj wtyczkę Omnisearch, aby korzystać z wyszukiwania pełnotekstowego.',
            introSwitching:
                'Przełączaj się między wyszukiwaniem z filtrem a Omnisearch za pomocą strzałek w górę i w dół lub klikając ikonę wyszukiwania.',
            sections: {
                fileNames: {
                    title: 'Nazwy plików i aliasy',
                    items: [
                        '`word` Dopasuj notatki ze słowem "word" w nazwie wyświetlanej lub aliasie.',
                        '`word1 word2` Każde słowo musi występować w nazwie wyświetlanej lub aliasach.',
                        '`-word` Wyklucz notatki zawierające słowo "word" w nazwie wyświetlanej lub aliasie.'
                    ]
                },
                tags: {
                    title: 'Tagi',
                    items: [
                        '`#tag` Uwzględnij notatki z tagiem (pasuje również do zagnieżdżonych tagów, takich jak `#tag/subtag`).',
                        '`#` Uwzględnij tylko otagowane notatki.',
                        '`-#tag` Wyklucz notatki z tym tagiem.',
                        '`-#` Uwzględnij tylko nieotagowane notatki.',
                        '`#tag1 #tag2` Znajdź oba tagi (niejawne AND).',
                        '`#tag1 AND #tag2` Znajdź oba tagi (jawne AND).',
                        '`#tag1 OR #tag2` Znajdź którykolwiek z tagów.',
                        '`#a OR #b AND #c` AND ma wyższy priorytet: pasuje do `#a` lub zarówno do `#b`, jak i do `#c`.',
                        'Kliknij tag z Cmd/Ctrl, aby dodać go operatorem AND. Kliknij tag z Cmd/Ctrl+Shift, aby dodać go operatorem OR.'
                    ]
                },
                properties: {
                    title: 'Atrybuty',
                    items: [
                        '`.key` Uwzględnij notatki z kluczem właściwości zaczynającym się od `key`.',
                        '`.key=value` Uwzględnij notatki, których wartość atrybutu zawiera `value`.',
                        '`."Reading Status"` Uwzględnij notatki z atrybutem zawierającym spacje.',
                        '`."Reading Status"="In Progress"` Atrybuty i ich wartości ze spacjami muszą być w podwójnych cudzysłowach.',
                        '`-.key` Wyklucz notatki z kluczem właściwości zaczynającym się od `key`.',
                        '`-.key=value` Wyklucz notatki, których wartość atrybutu zawiera `value`.',
                        'Kliknij atrybut z Cmd/Ctrl, aby dodać go operatorem AND. Kliknij atrybut z Cmd/Ctrl+Shift, aby dodać go operatorem OR.'
                    ]
                },
                tasks: {
                    title: 'Filtry',
                    items: [
                        '`has:task` Uwzględnij notatki z nieukończonymi zadaniami.',
                        '`-has:task` Wyklucz notatki z nieukończonymi zadaniami.',
                        '`folder:meetings` Uwzględnij notatki z folderu o nazwie `meetings`.',
                        '`folder:/work/meetings` Uwzględnij notatki tylko z `work/meetings` (bez podfolderów).',
                        '`folder:/` Uwzględnij notatki tylko z folderu głównego sejfu.',
                        '`-folder:archive` Wyklucz notatki z folderu o nazwie `archive`.',
                        '`-folder:/archive` Wyklucz notatki tylko z `archive` (bez podfolderów).',
                        '`ext:md` Uwzględnij notatki z rozszerzeniem `md` (`ext:.md` jest również obsługiwane).',
                        '`-ext:pdf` Wyklucz notatki z rozszerzeniem `pdf`.',
                        'Łącz z tagami, nazwami i datami (na przykład: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'Zachowanie AND/OR',
                    items: [
                        '`AND` i `OR` są operatorami stosowanymi wyłącznie w zapytaniach zawierających tylko tagi.',
                        'Zapytania zawierające wyłącznie tagi zawierają tylko filtry tagów: `#tag`, `-#tag`, `#`, `-#`.',
                        'Jeśli zapytanie zawiera nazwy, daty (`@...`), filtry zadań (`has:task`), filtry folderów (`folder:...`) lub filtry rozszerzeń (`ext:...`), `AND` i `OR` są dopasowywane jako słowa.',
                        'Przykładowe zapytanie z operatorem: `#work OR #home`.',
                        'Przykładowe zapytanie mieszane: `#work OR ext:md` (`OR` jest wyszukiwane w nazwach plików).'
                    ]
                },
                dates: {
                    title: 'Daty',
                    items: [
                        '`@today` Znajdź dzisiejsze notatki, korzystając z domyślnego pola daty.',
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` Względne zakresy dat.',
                        '`@2026-02-07` Znajdź konkretny dzień (obsługuje też `@20260207`).',
                        '`@2026` Znajdź rok kalendarzowy.',
                        '`@2026-02` lub `@202602` Znajdź miesiąc kalendarzowy.',
                        '`@2026-W05` lub `@2026W05` Znajdź tydzień ISO.',
                        '`@2026-Q2` lub `@2026Q2` Znajdź kwartał kalendarzowy.',
                        '`@13/02/2026` Formaty numeryczne z separatorami (`@07022026` jest zgodny z ustawieniami regionalnymi, w razie niejednoznaczności).',
                        '`@2026-02-01..2026-02-07` Znajdź zakres dat włącznie z dniami granicznymi (obsługiwane są daty bez początku lub końca).',
                        '`@c:...` lub `@m:...` Wyszukaj według daty utworzenia lub modyfikacji.',
                        '`-@...` Wyklucz dopasowanie daty.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'Wyszukiwanie pełnotekstowe w całym sejfie, filtrowane według bieżącego folderu lub wybranych tagów.',
                        'Może działać wolno w przypadku mniej niż 3 znaków w dużych sejfach.',
                        'Nie można wyszukiwać ścieżek zawierających znaki spoza ASCII ani poprawnie wyszukiwać podścieżek.',
                        'Zwraca ograniczone wyniki przed filtrowaniem folderów, więc odpowiednie pliki mogą nie pojawić się, jeśli istnieje wiele dopasowań w innych miejscach.',
                        'Podgląd notatek pokazuje fragmenty Omnisearch zamiast domyślnego tekstu podglądu.'
                    ]
                }
            }
        }
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'Otwórz w nowej karcie',
            openToRight: 'Otwórz po prawej',
            openInNewWindow: 'Otwórz w nowym oknie',
            openMultipleInNewTabs: 'Otwórz notatki w nowych kartach: {count}',
            openMultipleFilesInNewTabs: 'Otwórz pliki w nowych kartach: {count}',
            openMultipleToRight: 'Otwórz notatki po prawej: {count}',
            openMultipleFilesToRight: 'Otwórz pliki po prawej: {count}',
            openMultipleInNewWindows: 'Otwórz notatki w nowych oknach: {count}',
            openMultipleFilesInNewWindows: 'Otwórz pliki w nowych oknach: {count}',
            pinNote: 'Przypnij notatkę',
            pinFile: 'Przypnij plik',
            unpinNote: 'Odepnij notatkę',
            unpinFile: 'Odepnij plik',
            pinMultipleNotes: 'Przypnij notatki: {count}',
            pinMultipleFiles: 'Przypnij pliki: {count}',
            unpinMultipleNotes: 'Odepnij notatki: {count}',
            unpinMultipleFiles: 'Odepnij pliki: {count}',
            duplicateNote: 'Duplikuj notatkę',
            duplicateFile: 'Duplikuj plik',
            duplicateMultipleNotes: 'Duplikuj notatki: {count}',
            duplicateMultipleFiles: 'Duplikuj pliki: {count}',
            openVersionHistory: 'Otwórz historię wersji',
            revealInFolder: 'Pokaż w folderze',
            revealInFinder: 'Pokaż w Finderze',
            showInExplorer: 'Pokaż w eksploratorze systemowym',
            openInDefaultApp: 'Otwórz w domyślnej aplikacji',
            renameNote: 'Zmień nazwę notatki',
            renameFile: 'Zmień nazwę pliku',
            deleteNote: 'Usuń notatkę',
            deleteFile: 'Usuń plik',
            setCalendarHighlight: 'Ustaw podświetlenie',
            removeCalendarHighlight: 'Usuń podświetlenie',
            deleteMultipleNotes: 'Usuń notatki: {count}',
            deleteMultipleFiles: 'Usuń pliki: {count}',
            moveNoteToFolder: 'Przenieś notatkę do...',
            moveFileToFolder: 'Przenieś plik do...',
            moveMultipleNotesToFolder: 'Przenieś notatki ({count}) do...',
            moveMultipleFilesToFolder: 'Przenieś pliki ({count}) do...',
            mergeNotes: 'Scal notatki ({count})...',
            mergeNotesInGroup: 'Scal notatki w grupie...',
            setManualSortGroupHeader: 'Ustaw nagłówek grupy',
            changeManualSortGroupHeader: 'Zmień nagłówek grupy',
            manualSortGroupHeader: {
                title: 'Nagłówek grupy',
                copyStyle: 'Kopiuj styl nagłówka',
                pasteStyle: 'Wklej styl nagłówka',
                remove: 'Usuń nagłówek grupy'
            },
            addTag: 'Dodaj tag',
            addPropertyKey: 'Ustaw atrybut',
            removeTag: 'Usuń tag',
            removeAllTags: 'Usuń wszystkie tagi',
            changeIcon: 'Zmień ikonkę',
            changeColor: 'Zmień kolor'
        },
        folder: {
            newNote: 'Nowa notatka',
            newNoteFromTemplate: 'Nowa notatka na podstawie szablonu',
            newFolder: 'Nowy folder',
            newCanvas: 'Nowa tablica',
            newBase: 'Nowa baza danych',
            newDrawing: 'Nowy rysunek',
            newExcalidrawDrawing: 'Nowy rysunek Excalidraw',
            newTldrawDrawing: 'Nowy rysunek Tldraw',
            duplicateFolder: 'Duplikuj folder',
            searchInFolder: 'Szukaj w folderze',
            createFolderNote: 'Utwórz notatkę folderu',
            detachFolderNote: 'Odłącz notatkę folderu',
            deleteFolderNote: 'Usuń notatkę folderu',
            changeIcon: 'Zmień ikonkę',
            changeColor: 'Zmień kolor ikonki',
            changeBackground: 'Zmień tło',
            excludeFolder: 'Ukryj folder',
            unhideFolder: 'Pokaż folder',
            excludeFromDescendants: 'Ukryj w folderach nadrzędnych',
            includeInDescendants: 'Pokaż w folderach nadrzędnych',
            hiddenFromParentsIndicator: 'Ukryte na listach folderów nadrzędnych',
            moveFolder: 'Przenieś folder do...',
            renameFolder: 'Zmień nazwę folderu',
            deleteFolder: 'Usuń folder'
        },
        tag: {
            changeIcon: 'Zmień ikonkę',
            changeColor: 'Zmień kolor',
            changeBackground: 'Zmień tło',
            showTag: 'Pokaż tag',
            hideTag: 'Ukryj tag'
        },
        property: {
            addKey: 'Konfiguruj klucze atrybutów',
            renameKey: 'Zmień nazwę atrybutu',
            deleteKey: 'Usuń atrybut'
        },
        navigation: {
            addSeparator: 'Dodaj separator',
            removeSeparator: 'Usuń separator'
        },
        copyPath: {
            title: 'Kopiuj ścieżkę',
            asObsidianUrl: 'jako adres URL Obsidian',
            fromVaultFolder: 'z folderu sejfu',
            fromSystemRoot: 'z folderu systemu'
        },
        style: {
            title: 'Styl',
            copy: 'Kopiuj styl',
            paste: 'Wklej styl',
            removeIcon: 'Usuń ikonkę',
            removeColor: 'Usuń kolor',
            removeBackground: 'Usuń tło',
            clear: 'Wyczyść styl'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        appearance: 'Wygląd',
        sortBy: 'Sortuj według',
        standardPreset: 'Standardowy',
        compactPreset: 'Kompaktowy',
        defaultSuffix: '(domyślne)',
        defaultLabel: 'Domyślne',
        titleRows: 'Wiersze tytułu',
        previewRows: 'Wiersze podglądu',
        groupBy: 'Grupuj według',
        titleRowOption: (rows: number) =>
            `${rows} ${rows === 1 ? 'wiersz' : rows === 2 || rows === 3 || rows === 4 ? 'wiersze' : 'wierszy'} tytułu`,
        previewRowOption: (rows: number) =>
            `${rows} ${rows === 1 ? 'wiersz' : rows === 2 || rows === 3 || rows === 4 ? 'wiersze' : 'wierszy'} podglądu`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Zastosuj',
            applySortAndGroupTitle: (target: string) => `Zastosuj sortowanie i grupowanie dla ${target}?`,
            applyAppearanceTitle: (target: string) => `Zastosuj wygląd dla ${target}?`,
            affectedCountMessage: (count: number) => `Istniejące nadpisania do zmiany: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'Użyć sortowania ręcznego?',
            propertySortMessage: (property: string, count: number) =>
                `Przełącza bieżący widok na sortowanie ręczne z użyciem „${property}”. Edycja kolejności w razie potrzeby zapisuje wartości indeksu liczbowego do tego atrybutu w ${count} ${count === 1 ? 'notatce' : 'notatkach'}.`,
            propertySortConfirmButton: 'Użyj sortowania ręcznego',
            removePropertyTitle: 'Usunąć atrybut sortowania?',
            removePropertyMessage: (property: string, count: number) =>
                `Usuwa „${property}” z ${count} ${count === 1 ? 'notatki' : 'notatek'} na bieżącej liście. Kolejność sortowania ręcznego zostanie wyczyszczona dla tych notatek.`,
            removePropertyConfirmButton: 'Usuń atrybut',
            compactTitle: 'Zagęścić wartości indeksu?',
            compactMessage: (count: number) =>
                `Ta zmiana kolejności wymaga więcej miejsca na wartości liczbowe. ${count} ${count === 1 ? 'notatka otrzyma' : 'notatek otrzyma'} nowe wartości indeksu.`,
            compactConfirmButton: 'Zagęść wartości indeksu'
        },
        manualSortGroupHeader: {
            title: 'Ustaw nagłówek grupy',
            titleLabel: 'Tytuł',
            placeholder: 'Nagłówek grupy',
            icon: 'Ikona',
            color: 'Kolor',
            wordCount: 'Pokaż liczbę słów',
            wordCountTarget: 'Docelowa liczba słów',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'Gdy to pole jest puste, cel grupy używa atrybutu celu ustawionego w Ustawienia > Notatki > Liczba słów i znaków. Nadpisz go, ustawiając wartość celu dla tej grupy.',
            description: 'Dostosuj nagłówek grupy dla tej notatki. Pozostaw tytuł pusty, aby usunąć nagłówek.'
        },
        mergeNotes: {
            title: 'Scal notatki',
            summary: 'Utwórz jedną notatkę z {count} notatek w {folder}.',
            frontmatterRule: 'Frontmatter z pierwszej notatki zostaje zachowany. Frontmatter z pozostałych notatek zostaje usunięty.',
            crossFolderWarning:
                'Notatki źródłowe znajdują się w różnych folderach. Linki względne i osadzenia mogą przestać działać w scalonej notatce.',
            outputName: 'Nazwa wyjściowa',
            outputNameDesc: 'Scalona notatka zostanie utworzona w folderze pokazanym powyżej.',
            outputNamePlaceholder: 'Scalone notatki',
            separator: 'Separator',
            separatorDesc: 'Wstawiany między notatkami.',
            separatorOptions: {
                none: 'Brak',
                blankLine: 'Pusty wiersz',
                horizontalRule: 'Linia pozioma',
                heading: 'Nagłówek z tytułem notatki'
            },
            moveSourcesToTrash: 'Przenieś notatki źródłowe do kosza po scaleniu',
            mergeButton: 'Scal'
        },
        navRainbowSection: {
            title: (section: string) => `Kolory tęczy: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'Wyszukaj ikonki...',
            recentlyUsedHeader: 'Ostatnio używane',
            emptyStateSearch: 'Zacznij pisać, aby wyszukać ikonki',
            emptyStateNoResults: 'Nie znaleziono ikonek',
            showingResultsInfo: 'Wyświetlono 50 wyników z {count}. Wpisz więcej, aby zawęzić wyniki.',
            emojiInstructions: 'Wpisz lub wklej dowolną emotkę, aby użyć jej jako ikonki',
            removeIcon: 'Usuń ikonkę',
            removeFromRecents: 'Usuń z ostatnich',
            allTabLabel: 'Wszystkie'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Dodaj regułę'
        },
        interfaceIcons: {
            title: 'Ikonki interfejsu',
            fileItemsSection: 'Elementy pliku',
            items: {
                'nav-shortcuts': 'Skróty',
                'nav-recent-files': 'Ostatnie pliki',
                'nav-expand-all': 'Rozwiń wszystkie',
                'nav-collapse-all': 'Zwiń wszystkie',
                'nav-calendar': 'Kalendarz',
                'nav-tree-expand': 'Strzałka drzewka: rozwiń',
                'nav-tree-collapse': 'Strzałka drzewka: zwiń',
                'nav-hidden-items': 'Ukryte elementy',
                'nav-root-reorder': 'Zmień kolejność folderów głównych',
                'nav-new-folder': 'Nowy folder',
                'nav-show-single-pane': 'Pokaż jeden panel',
                'nav-show-dual-pane': 'Pokaż oba panele',
                'nav-profile-chevron': 'Strzałka menu profilu',
                'list-search': 'Szukaj',
                'list-reveal-file': 'Pokaż plik',
                'list-descendants': 'Notatki z podfolderów',
                'list-sort-ascending': 'Kolejność: rosnąco',
                'list-sort-descending': 'Kolejność: malejąco',
                'list-sort-modified': 'Sortuj według daty modyfikacji',
                'list-sort-created': 'Sortuj według daty utworzenia',
                'list-sort-title': 'Sortuj według tytułu',
                'list-sort-filename': 'Sortuj według nazwy pliku',
                'list-sort-property': 'Sortuj według atrybutu',
                'list-appearance': 'Zmień wygląd',
                'list-new-note': 'Nowa notatka',
                'list-pinned': 'Przypięte notatki',
                'nav-folder-open': 'Folder otwarty',
                'nav-folder-closed': 'Folder zamknięty',
                'nav-tags': 'Tagi',
                'nav-tag': 'Tag',
                'nav-properties': 'Atrybuty',
                'nav-property': 'Atrybut',
                'nav-property-value': 'Wartość',
                'file-unfinished-task': 'Nieukończone zadania',
                'file-word-count': 'Liczba słów',
                'file-character-count': 'Liczba znaków'
            }
        },
        colorPicker: {
            currentColor: 'Aktywny',
            newColor: 'Nowy',
            paletteDefault: 'Domyślne',
            paletteCustom: 'Własne',
            copyColors: 'Kopiuj kolor',
            colorsCopied: 'Kolor skopiowany do schowka',
            pasteColors: 'Wklej kolor',
            pasteClipboardError: 'Nie można odczytać schowka',
            pasteInvalidFormat: 'Oczekiwano wartości koloru hex',
            colorsPasted: 'Kolor wklejony pomyślnie',
            resetUserColors: 'Wyczyść kolory niestandardowe',
            clearCustomColorsConfirm: 'Usunąć wszystkie kolory niestandardowe?',
            userColorSlot: 'Kolor {slot}',
            recentColors: 'Ostatnio używane kolory',
            clearRecentColors: 'Wyczyść ostatnie kolory',
            removeRecentColor: 'Usuń kolor',
            apply: 'Zastosuj',
            pickerLabel: 'Selektor',
            hexLabel: 'HEX',
            hexInputLabel: 'Wartość koloru HEX',
            saturationValueArea: 'Nasycenie i jasność',
            hueSlider: 'Odcień',
            alphaSlider: 'Przezroczystość'
        },
        appearance: {
            tabIcon: 'Ikona',
            tabColor: 'Kolor',
            tabBackground: 'Tło',
            resetIcon: 'Usuń ikonkę',
            resetColor: 'Usuń kolor',
            resetBackground: 'Usuń tło',
            clear: 'Wyczyść styl',
            apply: 'Zastosuj'
        },
        selectVaultProfile: {
            title: 'Zmień profil sejfu',
            currentBadge: 'Aktywny',
            emptyState: 'Brak dostępnych profili sejfu.'
        },
        tagOperation: {
            renameTitle: 'Zmień nazwę tagu {tag}',
            deleteTitle: 'Usuń tag {tag}',
            newTagPrompt: 'Nowa nazwa tagu',
            newTagPlaceholder: 'Wprowadź nową nazwę tagu',
            renameWarning: 'Zmiana nazwy tagu {oldTag} zmodyfikuje {files}: {count}.',
            deleteWarning: 'Usunięcie tagu {tag} zmodyfikuje {files}: {count}.',
            modificationWarning: 'Spowoduje to aktualizację dat modyfikacji plików.',
            affectedFiles: 'Pliki, na które to wpłynie:',
            andMore: '…i jeszcze {count}',
            confirmRename: 'Zmień nazwę tagu',
            renameUnchanged: '{tag} bez zmian',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            renameBatchNotFinalized:
                'Zmieniono nazwę {renamed}/{total}. Nie zaktualizowano: {notUpdated}. Metadane i skróty nie zostały zaktualizowane.',
            invalidTagName: 'Wprowadź prawidłową nazwę tagu.',
            descendantRenameError: 'Nie można przenieść do tego samego lub podrzędnego tagu.',
            confirmDelete: 'Usuń tag',
            deleteBatchNotFinalized:
                'Usunięto z {removed}/{total}. Nie zaktualizowano: {notUpdated}. Metadane i skróty nie zostały zaktualizowane.',
            checkConsoleForDetails: 'Sprawdź konsolę, aby uzyskać szczegóły.',
            file: 'plik',
            files: 'pliki',
            inlineParsingWarning: {
                title: 'Zgodność tagów w treści',
                message:
                    '{tag} zawiera znaki, których Obsidian nie może przetworzyć w tagach w treści. Nie ma to wpływu na tagi w atrybutach.',
                confirm: 'Użyj mimo to'
            }
        },
        propertyOperation: {
            renameTitle: 'Zmień nazwę atrybutu {property}',
            deleteTitle: 'Usuń atrybut {property}',
            newKeyPrompt: 'Nowa nazwa atrybutu',
            newKeyPlaceholder: 'Wprowadź nową nazwę atrybutu',
            renameWarning: 'Zmiana nazwy atrybutu {property} zmodyfikuje {count} {files}.',
            renameConflictWarning:
                'Atrybut {newKey} już istnieje w {count} {files}. Zmiana nazwy {oldKey} zastąpi istniejące wartości {newKey}.',
            deleteWarning: 'Usunięcie atrybutu {property} zmodyfikuje {count} {files}.',
            confirmRename: 'Zmień nazwę atrybutu',
            confirmDelete: 'Usuń atrybut',
            renameNoChanges: '{oldKey} → {newKey} (bez zmian)',
            renameSettingsUpdateFailed: 'Zmieniono nazwę atrybutu {oldKey} → {newKey}. Nie udało się zaktualizować ustawień.',
            deleteSingleSuccess: 'Usunięto atrybut {property} z 1 notatki',
            deleteMultipleSuccess: 'Usunięto atrybut {property} z {count} notatek',
            deleteSettingsUpdateFailed: 'Usunięto atrybut {property}. Nie udało się zaktualizować ustawień.',
            invalidKeyName: 'Wprowadź prawidłową nazwę atrybutu.'
        },
        fileSystem: {
            newFolderTitle: 'Nowy folder',
            renameFolderTitle: 'Zmień nazwę folderu',
            renameFileTitle: 'Zmień nazwę pliku',
            deleteFolderTitle: "Usunąć '{name}'?",
            deleteFileTitle: "Usunąć '{name}'?",
            deleteFileAttachmentsTitle: 'Usunąć załączniki pliku?',
            moveFileConflictTitle: 'Konflikt przenoszenia',
            folderNamePrompt: 'Wprowadź nazwę folderu:',
            hideInOtherVaultProfiles: 'Ukryj w innych profilach sejfu',
            renamePrompt: 'Wprowadź nową nazwę:',
            renameVaultTitle: 'Zmień widoczną nazwę sejfu',
            renameVaultPrompt: 'Wprowadź niestandardową nazwę (pozostaw puste, aby użyć nazwy domyślnej):',
            deleteFolderConfirm: 'Czy na pewno chcesz usunąć ten folder i całą jego zawartość?',
            deleteFileConfirm: 'Czy na pewno chcesz usunąć ten plik?',
            deleteFileAttachmentsDescriptionSingle: 'Ten załącznik nie jest już używany w żadnej notatce. Czy chcesz go usunąć?',
            deleteFileAttachmentsDescriptionMultiple: 'Te załączniki nie są już używane w żadnej notatce. Czy chcesz je usunąć?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Drzewo plików',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Galeria',
            moveFileConflictDescriptionSingle: 'Znaleziono konflikt pliku w „{folder}”.',
            moveFileConflictDescriptionMultiple: 'Znaleziono {count} konfliktów plików w „{folder}”.',
            moveFileConflictAffectedFiles: 'Dotknięte pliki',
            moveFileConflictItem: '„{name}” → „{suggested}”{renameOnly}',
            moveFileConflictRenameOnly: '(tylko zmiana nazwy)',
            moveFileConflictRename: 'Zmień nazwę',
            moveFileConflictOverwrite: 'Nadpisz',
            removeAllTagsTitle: 'Usuń wszystkie tagi',
            removeAllTagsFromNote: 'Czy na pewno chcesz usunąć wszystkie tagi z tej notatki?',
            removeAllTagsFromNotes: 'Czy na pewno chcesz usunąć wszystkie tagi ({count}) z notatek?'
        },
        folderNoteType: {
            title: 'Wybierz typ notatki folderu',
            folderLabel: 'Folder: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `Przenieś ${name} do folderu...`,
            multipleFilesLabel: (count: number) => `pliki: ${count}`,
            navigatePlaceholder: 'Przejdź do folderu...',
            instructions: {
                navigate: 'aby przejść',
                move: 'aby przenieść',
                select: 'aby wybrać',
                dismiss: 'aby anulować'
            }
        },
        homepage: {
            placeholder: 'Wyszukaj pliki...',
            instructions: {
                navigate: 'aby przejść',
                select: 'aby ustawić stronę główną',
                dismiss: 'aby anulować'
            }
        },
        calendarTemplate: {
            placeholder: 'Wyszukaj szablony...',
            instructions: {
                navigate: 'aby przejść',
                select: 'aby wybrać szablon',
                dismiss: 'aby anulować'
            }
        },
        navigationBanner: {
            placeholder: 'Wyszukaj obrazy...',
            svgMissingDimensions: 'Wybrany plik SVG nie definiuje szerokości, wysokości ani viewBox.',
            instructions: {
                navigate: 'aby przejść',
                select: 'aby ustawić baner',
                dismiss: 'aby anulować'
            }
        },
        tagSuggest: {
            navigatePlaceholder: 'Przejdź do tagu...',
            addPlaceholder: 'Wyszukaj tag, który chcesz dodać...',
            removePlaceholder: 'Wybierz tag do usunięcia...',
            createNewTag: 'Utwórz nowy tag: #{tag}',
            instructions: {
                navigate: 'aby przejść',
                select: 'aby wybrać',
                dismiss: 'aby anulować',
                add: 'aby dodać tag',
                remove: 'aby usunąć tag'
            }
        },
        propertySuggest: {
            placeholder: 'Wybierz atrybut...',
            navigatePlaceholder: 'Przejdź do atrybutu...',
            instructions: {
                navigate: 'aby nawigować',
                select: 'aby dodać atrybut',
                dismiss: 'aby anulować'
            }
        },
        propertyKeyVisibility: {
            title: 'Widoczność kluczy atrybutów',
            description:
                'Kontroluj, gdzie wyświetlane są wartości atrybutów. Kolumny odpowiadają panelowi nawigacji, panelowi listy i menu kontekstowemu pliku. Użyj dolnego wiersza, aby przełączyć wszystkie wiersze w kolumnie.',
            searchPlaceholder: 'Szukaj kluczy atrybutów...',
            propertyColumnLabel: 'Atrybut',
            showInNavigation: 'Pokaż w nawigacji',
            showInList: 'Pokaż na liście',
            showInFileMenu: 'Pokaż w menu pliku',
            toggleAllInNavigation: 'Przełącz wszystkie w nawigacji',
            toggleAllInList: 'Przełącz wszystkie na liście',
            toggleAllInFileMenu: 'Przełącz wszystkie w menu pliku',
            applyButton: 'Zastosuj',
            emptyState: 'Nie znaleziono kluczy atrybutów.'
        },
        welcome: {
            title: 'Witaj w {pluginName}',
            introText:
                'Cześć i witaj w Notebook Navigator, lepszej przeglądarce plików i kalendarzu dla Obsidian. Zanim zaczniesz, naprawdę polecam obejrzeć co najmniej trzy pierwsze rozdziały poniższego filmu Mastering Notebook Navigator. Poznasz w nich sposób działania dwóch paneli i szybko rozpoczniesz pracę.',
            continueText:
                'Jeśli masz jeszcze dziesięć minut, obejrzyj także rozdziały o pierwszej konfiguracji i codziennej pracy. Dowiesz się z nich wszystkiego, czego potrzebujesz na początek, a do szczegółów możesz wrócić później. Łącze do filmu znajdziesz u góry ustawień Notebook Navigator.',
            thanksText: 'Miłego korzystania z Notebook Navigator!',
            videoAlt: 'Opanuj Notebook Navigator 3',
            openVideoButton: 'Odtwórz wideo',
            closeButton: 'Może później'
        }
    },

    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Nie udało się utworzyć folderu: {error}',
            createFile: 'Nie udało się utworzyć pliku: {error}',
            renameFolder: 'Nie udało się zmienić nazwy folderu: {error}',
            renameFolderNoteConflict: 'Nie można zmienić nazwy: "{name}" już istnieje w tym folderze',
            renameFile: 'Nie udało się zmienić nazwy pliku: {error}',
            deleteFolder: 'Nie udało się usunąć folderu: {error}',
            deleteFile: 'Nie udało się usunąć pliku: {error}',
            deleteAttachments: 'Nie udało się usunąć załączników: {error}',
            mergeNotes: 'Nie udało się scalić notatek: {error}',
            mergeNotesOpenOutput:
                'Scalona notatka została utworzona jako {name}, ale nie można jej otworzyć: {error}. Notatki źródłowe nie zostały zmienione.',
            mergeNotesOpenSkipped: 'Inne żądanie otwarcia pliku miało pierwszeństwo.',
            mergeNotesTrashSources: 'Utworzono scaloną notatkę. Nie udało się przenieść {count} notatek źródłowych do kosza.',
            duplicateNote: 'Nie udało się zduplikować notatki: {error}',
            duplicateFolder: 'Nie udało się zduplikować folderu: {error}',
            openVersionHistory: 'Nie udało się otworzyć historii wersji: {error}',
            versionHistoryNotFound: 'Nie znaleziono polecenia historii wersji. Upewnij się, że Obsidian Sync jest włączony.',
            revealInExplorer: 'Nie udało się pokazać pliku w eksploratorze systemowym: {error}',
            openInDefaultApp: 'Nie udało się otworzyć w domyślnej aplikacji: {error}',
            openInDefaultAppNotAvailable: 'Otwieranie w domyślnej aplikacji nie jest dostępne na tej platformie',
            folderNoteAlreadyExists: 'Notatka folderu już istnieje',
            folderAlreadyExists: 'Folder "{name}" już istnieje',
            folderNotesDisabled: 'Włącz notatki folderu w ustawieniach, aby przekształcić pliki',
            folderNoteAlreadyLinked: 'Ten plik pełni już funkcję notatki folderu',
            folderNoteNotFound: 'Brak notatki folderu w wybranym folderze',
            folderNoteUnsupportedExtension: 'Nieobsługiwane rozszerzenie pliku: {extension}',
            folderNoteMoveFailed: 'Nie udało się przenieść pliku podczas konwersji: {error}',
            folderNoteRenameConflict: 'Plik o nazwie "{name}" już istnieje w folderze',
            folderNoteConversionFailed: 'Nie udało się przekształcić pliku na notatkę folderu',
            folderNoteConversionFailedWithReason: 'Nie udało się przekształcić pliku na notatkę folderu: {error}',
            folderNoteOpenFailed: 'Przekształcono plik, ale nie udało się otworzyć notatki folderu: {error}',
            failedToDeleteFile: 'Nie udało się usunąć {name}: {error}',
            failedToDeleteMultipleFiles: 'Nie udało się usunąć plików: {count}',
            versionHistoryNotAvailable: 'Historia wersji nie jest dostępna',
            drawingAlreadyExists: 'Rysunek o tej nazwie już istnieje',
            failedToCreateDrawing: 'Nie udało się utworzyć rysunku',
            noFolderSelected: 'Żaden folder nie jest wybrany w Notebook Navigator',
            noFileSelected: 'Żaden plik nie jest wybrany'
        },
        warnings: {
            linkBreakingNameCharacters: 'Ta nazwa zawiera znaki, które psują linki Obsidian: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'Nazwy nie mogą zaczynać się od kropki ani zawierać : lub /.',
            forbiddenNameCharactersWindows: 'Znaki zarezerwowane przez system Windows są niedozwolone: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'Ukryty folder: {name}',
            showFolder: 'Widoczny folder: {name}',
            folderExcludedFromDescendants: 'Ukryte na listach folderów nadrzędnych: {name}',
            folderIncludedInDescendants: 'Pokazane na listach folderów nadrzędnych: {name}',
            mergeNotes: 'Scalono {count} notatek w {name}'
        },
        notifications: {
            deletedMultipleFiles: 'Usunięto pliki: {count}',
            movedMultipleFiles: 'Przeniesiono pliki ({count}) do {folder}',
            folderNoteConversionSuccess: 'Przekształcono plik na notatkę folderu w "{name}"',
            folderMoved: 'Przeniesiono folder "{name}"',
            deepLinkCopied: 'Adres URL Obsidian skopiowany do schowka',
            pathCopied: 'Ścieżka skopiowana do schowka',
            relativePathCopied: 'Ścieżka względna skopiowana do schowka',
            tagAddedToNote: 'Dodano tag do 1 notatki',
            tagAddedToNotes: 'Dodano tag do wielu ({count}) notatek',
            tagRemovedFromNote: 'Usunięto tag z 1 notatki',
            tagRemovedFromNotes: 'Usunięto tag z wielu ({count}) notatek',
            tagsClearedFromNote: 'Wyczyszczono wszystkie tagi z 1 notatki',
            tagsClearedFromNotes: 'Wyczyszczono wszystkie tagi z wielu ({count}) notatek',
            noTagsToRemove: 'Brak tagów do usunięcia',
            noFilesSelected: 'Nie wybrano plików',
            mergeNotesRequireMultipleMarkdown: 'Wybierz co najmniej dwie notatki Markdown do scalenia',
            tagOperationsNotAvailable: 'Operacje na tagach niedostępne',
            propertyOperationsNotAvailable: 'Operacje na atrybutach niedostępne',
            tagsRequireMarkdown: 'Tagi są obsługiwane tylko w notatkach Markdown',
            propertiesRequireMarkdown: 'Atrybuty są obsługiwane tylko w notatkach Markdown',
            propertySetOnNote: 'Zaktualizowano atrybut w 1 notatce',
            propertySetOnNotes: 'Zaktualizowano atrybut w wielu ({count}) notatkach',
            manualSortPropertyRemovedFromNote: 'Usunięto atrybut sortowania z 1 notatki',
            manualSortPropertyRemovedFromNotes: 'Usunięto atrybut sortowania z {count} notatek',
            iconPackDownloaded: '{provider} pobrano',
            iconPackUpdated: '{provider} zaktualizowano ({version})',
            iconPackRemoved: '{provider} usunięto',
            iconPackLoadFailed: 'Nie udało się wczytać {provider}',
            hiddenFileReveal: 'Plik jest ukryty. Aby go wyświetlić, włącz opcję "Pokaż ukryte elementy".'
        },
        confirmations: {
            deleteMultipleFiles: 'Czy na pewno chcesz usunąć wiele ({count}) plików?',
            deleteConfirmation: 'Nie można cofnąć tej czynności.'
        },
        defaultNames: {
            untitled: 'Bez nazwy'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Nie można przenieść do tego samego lub podrzędnego folderu.',
            itemAlreadyExists: 'Element o nazwie "{name}" już istnieje w tej lokalizacji.',
            failedToMove: 'Nie udało się przenieść: {error}',
            failedToAddTag: 'Nie udało się dodać tagu "{tag}"',
            failedToSetProperty: 'Nie udało się zaktualizować atrybutu: {error}',
            failedToClearTags: 'Nie udało się wyczyścić tagów',
            failedToMoveFolder: 'Nie udało się przenieść folderu "{name}"',
            failedToImportFiles: 'Nie udało się zaimportować: {names}'
        },
        notifications: {
            filesAlreadyExist: 'Wiele plików ({count}) już istnieje w miejscu docelowym',
            filesAlreadyHaveTag: 'Wiele plików ({count}) już ma ten lub bardziej szczegółowy tag',
            filesAlreadyHaveProperty: 'Wiele plików ({count}) ma już ten atrybut',
            noTagsToClear: 'Brak tagów do wyczyszczenia',
            fileImported: 'Zaimportowano 1 plik',
            filesImported: 'Zaimportowano wiele plików ({count})'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'Dzisiaj',
        yesterday: 'Wczoraj',
        previous7Days: 'Poprzednie 7 dni',
        previous30Days: 'Poprzednie 30 dni'
    },

    // Plugin commands
    commands: {
        open: 'Otwórz', // Command palette: Opens the Notebook Navigator view (English: Open)
        toggleLeftSidebar: 'Przełącz lewy panel boczny', // Command palette: Toggles left sidebar, opening Notebook Navigator when uncollapsing (English: Toggle left sidebar)
        openHomepage: 'Otwórz stronę główną', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        openDailyNote: 'Otwórz dziennik',
        openWeeklyNote: 'Otwórz notatkę tygodnia',
        openMonthlyNote: 'Otwórz notatkę miesiąca',
        openQuarterlyNote: 'Otwórz notatkę kwartału',
        openYearlyNote: 'Otwórz notatkę roku',
        revealFile: 'Pokaż plik', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Szukaj', // Command palette: Toggle search in the file list (English: Search)
        searchVaultRoot: 'Szukaj w całym sejfie', // Command palette: Selects the vault root folder and focuses search with subfolders included (English: Search whole vault)
        toggleDualPane: 'Przełącz układ podwójnego panelu', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        toggleDualPaneOrientation: 'Przełącz orientację podwójnego panelu', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'Przełącz kalendarz', // Command palette: Toggles showing the calendar overlay in the navigation pane (English: Toggle calendar)
        selectVaultProfile: 'Wybierz profil sejfu', // Command palette: Opens a modal to choose a different vault profile (English: Switch vault profile)
        selectVaultProfile1: 'Wybierz profil sejfu 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Wybierz profil sejfu 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Wybierz profil sejfu 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Usuń plik', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Utwórz nową notatkę', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Utwórz nową notatkę na podstawie szablonu', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Przenieś pliki', // Command palette: Move selected files to another folder (English: Move files)
        mergeNotes: 'Scal notatki', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'Wybierz następny plik', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Wybierz poprzedni plik', // Command palette: Selects the previous file in the current view (English: Select previous file)
        navigateBack: 'Nawiguj wstecz',
        navigateForward: 'Nawiguj do przodu',
        convertToFolderNote: 'Przekształć na notatkę folderu', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Ustaw jako notatkę folderu', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Odłącz notatkę folderu', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Przypnij wszystkie notatki folderu', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Przejdź do folderu', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Przejdź do tagu', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        navigateToProperty: 'Przejdź do atrybutu', // Command palette: Navigate to a property key or value using fuzzy search (English: Navigate to property)
        addShortcut: 'Dodaj do skrótów', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: 'Otwórz skrót {number}',
        toggleDescendants: 'Przełącz podfoldery', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Przełącz ukryte foldery, tagi i notatki', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Przełącz sortowanie tagów', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: 'Przełącz tagi według wyboru',
        togglePropertiesBySelection: 'Przełącz atrybuty według wyboru',
        toggleCompactMode: 'Przełącz tryb kompaktowy', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Przełącz przypiętą sekcję',
        collapseExpand: 'Zwiń / rozwiń wszystkie elementy', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        collapseExpandSelectedItem: 'Zwiń / rozwiń wybrany element',
        addTag: 'Dodaj tag do wybranych plików', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        setProperty: 'Ustaw atrybut dla wybranych plików', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'Usuń tag z wybranych plików', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Usuń wszystkie tagi z wybranych plików', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        openAllFiles: 'Otwórz wszystkie pliki', // Command palette: Opens all files in the current folder or tag (English: Open all files)
        rebuildCache: 'Odbuduj pamięć podręczną', // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
        restoreDefaultSettings: 'Przywróć ustawienia domyślne' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        calendarViewName: 'Kalendarz', // Name shown in the view header/tab (English: Calendar)
        folderNoteSidebarViewName: 'Notatka folderu', // Name shown in the folder note sidebar tab (English: Folder note)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Pokaż w Notebook Navigator', // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
        settingsUnavailableNotice:
            'Notebook Navigator nie mógł odczytać swoich ustawień i nie został uruchomiony. Jeśli sejf jest synchronizowany, uruchom ponownie Obsidian po zakończeniu synchronizacji. Aby zacząć od nowa z ustawieniami domyślnymi, uruchom polecenie „Przywróć ustawienia domyślne”.', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsRecovery: {
            confirmTitle: 'Przywróć ustawienia domyślne', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'Ta operacja zastępuje plik ustawień Notebook Navigator ustawieniami domyślnymi. Jeśli sejf jest nadal synchronizowany, przywrócone ustawienia domyślne mogą nadpisać ustawienia zapisane na innych urządzeniach. Czytelny plik ustawień jest najpierw kopiowany do kopii zapasowej ze znacznikiem czasu w folderze wtyczki.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'Przywróć domyślne', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: 'Nie udało się dokończyć odzyskiwania ustawień. Lokalne preferencje zostały zachowane.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'Przywrócono ustawienia domyślne. Uruchom ponownie Obsidian, aby zakończyć.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Zmodyfikowano',
        createdAt: 'Utworzono',
        file: 'plik',
        files: 'pliki',
        folder: 'folder',
        folders: 'foldery',
        wordCount: 'Liczba słów'
    },

    fileCounts: {
        words: '{count} słów',
        characters: '{count} znaków',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'Zmień ustawienia domyślne',
        metadataReport: {
            exportSuccess: 'Raport nieprawidłowych metadanych wyeksportowany do: {filename}',
            exportFailed: 'Nie udało się wyeksportować raportu metadanych'
        },
        sections: {
            general: 'Ogólne',
            vaultFilters: 'Filtry wyświetlania',
            appearanceBehavior: 'Wygląd i zachowanie',
            navigationPane: 'Panel nawigacji',
            calendar: 'Kalendarz',
            fileOperations: 'Operacje na plikach',
            icons: 'Pakiety ikon',
            folders: 'Foldery',
            folderNotes: 'Notatki folderu',
            folderNoteFiles: 'Pliki notatek folderów',
            foldersAndFolderNotes: 'Foldery i notatki folderu',
            tagsAndProperties: 'Tagi i atrybuty',
            tags: 'Tagi',
            listPane: 'Panel listy',
            notes: 'Wyświetlanie plików',
            shortcutsAndRecentFiles: 'Skróty i ostatnie pliki',
            advanced: 'Zaawansowane'
        },
        pageGroups: {
            configuration: 'Konfiguracja',
            navigationAndContent: 'Panel nawigacji',
            notesAndLists: 'Panel listy',
            calendarAndTools: 'Kalendarz i narzędzia'
        },
        pageDescriptions: {
            general: 'Informacje o wydaniu, wsparcie, profil sejfu, typy plików i klucze atrybutów.',
            vaultFilters: 'Ukryte foldery, tagi, pliki, tagi plików i reguły atrybutów.',
            appearanceBehavior: 'Zachowanie, nawigacja klawiaturą, przyciski myszy, wygląd i formatowanie.',
            navigationPane: 'Układ, wygląd, liczba notatek, zachowanie zwijania i kolory tęczy.',
            shortcuts: 'Widoczność skrótów, odznaki, ostatnie pliki i przypięte elementy.',
            calendar: 'Wyświetlanie kalendarza, notatki dat, szablony, lokalizacja i położenie paska bocznego.',
            fileOperations: 'Szablony, potwierdzenia usunięcia, załączniki i zachowanie przy konflikcie przenoszenia plików.',
            foldersAndFolderNotes: 'Wyświetlanie folderów, notatki folderu, szablony notatek folderu i zachowanie notatek folderu.',
            tagsProperties: 'Sekcje tagów i atrybutów, ikony, sortowanie, zakres i dziedziczenie.',
            listPane: 'Sortowanie, grupowanie, tryby listy, przypięte notatki i podglądy rysunków.',
            frontmatter: 'Pola metadanych dla nazw wyświetlanych, znaczników czasu, ikon i kolorów.',
            notes: 'Tytuły, tekst podglądu, wyróżnione obrazy, tagi, atrybuty, daty, liczba słów i liczba znaków.',
            iconPacks: 'Ikony interfejsu, ikony plików i zarządzanie pakietami ikon.',
            advanced: 'Diagnostyka, czyszczenie metadanych, import/eksport i resetowanie.'
        },
        groups: {
            general: {
                vaultConfiguration: 'Konfiguracja sejfu',
                templates: 'Szablony',
                behavior: 'Zachowanie',
                startup: 'Uruchamianie',
                keyboardNavigation: 'Nawigacja klawiaturą',
                mouseButtons: 'Przyciski myszy',
                view: 'Wygląd',
                icons: 'Ikonki',
                desktopAppearance: 'Wygląd na komputerze',
                mobileAppearance: 'Wygląd mobilny',
                formatting: 'Formatowanie'
            },
            advanced: {
                maintenance: 'Konserwacja',
                resetSettings: 'Resetowanie ustawień'
            },
            navigation: {
                appearance: 'Wygląd',
                banner: 'Baner',
                collapseItems: 'Zwiń elementy',
                dragAndDrop: 'Przeciągnij i upuść',
                noteCounts: 'Liczba notatek',
                rainbowColors: 'Kolory tęczy',
                leftSidebar: 'Lewy panel boczny',
                calendarIntegration: 'Integracja z kalendarzem'
            },
            list: {
                display: 'Wygląd',
                groupHeaders: 'Nagłówki grup',
                propertySort: 'Sortowanie według atrybutów',
                manualSort: 'Sortowanie ręczne',
                pinnedNotes: 'Przypięte notatki',
                drawingPreviews: 'Podglądy rysunków'
            },
            notes: {
                frontmatter: 'Pola metadanych',
                tasks: 'Zadania',
                icon: 'Ikonka',
                title: 'Tytuł',
                previewText: 'Tekst podglądu',
                featureImage: 'Wyróżniony obraz',
                tags: 'Tagi',
                properties: 'Atrybuty',
                date: 'Data',
                parentFolder: 'Folder nadrzędny',
                wordCount: 'Liczba słów i znaków'
            }
        },
        syncMode: {
            notSynced: '(niezsynchronizowane)',
            switchToSynced: 'Włącz synchronizację',
            switchToLocal: 'Wyłącz synchronizację'
        },
        items: {
            listPaneTitle: {
                name: 'Tytuł panelu listy',
                desc: 'Wybierz, gdzie ma być widoczny tytuł panelu listy.',
                options: {
                    header: 'Pokaż w nagłówku',
                    list: 'Pokaż w panelu listy',
                    hidden: 'Ukryj'
                }
            },
            sortNotesBy: {
                name: 'Domyślny porządek sortowania',
                desc: 'Wybierz domyślny porządek sortowania notatek.',
                options: {
                    'modified-desc': 'daty edycji (od najnowszych)',
                    'modified-asc': 'daty edycji (od najstarszych)',
                    'created-desc': 'daty utworzenia (od najnowszych)',
                    'created-asc': 'daty utworzenia (od najstarszych)',
                    'title-asc': 'tytułu (od A do Z)',
                    'title-desc': 'tytułu (od Z do A)',
                    'filename-asc': 'nazwy (od A do Z)',
                    'filename-desc': 'nazwy (od Z do A)'
                },
                directions: {
                    asc: 'Rosnąco',
                    desc: 'Malejąco'
                },
                fields: {
                    modified: 'Data edycji',
                    created: 'Data utworzenia',
                    title: 'Tytuł',
                    filename: 'Nazwa pliku',
                    property: 'Atrybut'
                }
            },
            propertySortKey: {
                name: 'Atrybuty do sortowania',
                desc: 'Rozdzielone przecinkami atrybuty frontmatter pokazywane jako opcje sortowania według atrybutów. Tablice są łączone w jeden ciąg. Te atrybuty nie są zmieniane.',
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: 'Sortowanie drugorzędne',
                desc: 'Używane z sortowaniem według atrybutów, gdy notatki mają taką samą wartość lub jej nie mają.',
                options: {
                    title: 'Tytuł',
                    filename: 'Nazwa pliku',
                    created: 'Data utworzenia',
                    modified: 'Data edycji'
                }
            },
            propertySortInstructions: {
                intro: 'Każdy wymieniony powyżej atrybut pojawia się jako opcja sortowania w menu sortowania w panelu listy. Wybranie jednego sortuje notatki według jego wartości frontmatter.'
            },
            manualSortPropertyKey: {
                name: 'Atrybut sortowania ręcznego',
                desc: 'Atrybut frontmatter używany do przechowywania wartości indeksu liczbowego dla sortowania ręcznego.'
            },
            manualSortGroupHeaderProperty: {
                name: 'Atrybut nagłówka grupy',
                desc: 'Atrybut frontmatter używany do przechowywania niestandardowych nagłówków grup.'
            },
            groupHeadersInstructions: {
                intro: 'Niestandardowe nagłówki grup wyświetlają się nad notatkami w panelu listy.',
                items: [
                    'W menu sortowania w panelu listy ustaw grupowanie na **Niestandardowe**.',
                    'Kliknij notatkę prawym przyciskiem myszy i wybierz **Ustaw nagłówek grupy**, aby dodać nagłówek nad nią.'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'Umiejscowienie nowych notatek',
                desc: 'Wybierz, gdzie umieszczane są nowe notatki, gdy bieżąca lista używa sortowania ręcznego.',
                options: {
                    top: 'Na górze',
                    bottom: 'Na dole',
                    'below-selected-note': 'Pod wybraną notatką',
                    unsorted: 'Nieposortowane'
                }
            },
            confirmBeforeManualSort: {
                name: 'Potwierdzaj przed sortowaniem ręcznym',
                desc: 'Pokaż ostrzeżenie przed pierwszym zapisaniem atrybutu sortowania ręcznego w notatkach. Po wyłączeniu notatki otrzymują atrybut bez ostrzeżenia.'
            },
            manualSortInstructions: {
                intro: 'Sortowanie ręczne zapisuje wartość indeksu liczbowego do atrybutu frontmatter w każdej notatce. Notatki bez indeksu pojawiają się w sekcji Nieposortowane.',
                items: [
                    'Włącz sortowanie ręczne, wybierając **Sortowanie ręczne** z menu sortowania. Następnie istnieją dwa sposoby zmiany kolejności notatek.',
                    'Wybierz **Edytuj kolejność sortowania...** z menu sortowania, aby otworzyć widok zmiany kolejności. Przeciągaj notatki myszą lub dotykiem na urządzeniach mobilnych. Na komputerze kliknięcie z **Cmd/Ctrl** lub **Shift** zaznacza wiele notatek, a następnie przeciągnięcie którejkolwiek z nich przenosi całą grupę.',
                    'W panelu listy zaznacz jedną notatkę lub zaznacz wiele, a następnie naciśnij **Cmd/Ctrl + Arrow Up/Down**, aby przesunąć zaznaczenie w górę lub w dół.'
                ]
            },
            revealFileOnListChanges: {
                name: 'Przewiń do wybranego pliku podczas zmian na liście',
                desc: 'Przewiń do wybranego pliku podczas przypinania notatek, wyświetlania notatek podrzędnych, zmiany wyglądu folderu lub wykonywania operacji na plikach.'
            },
            includeDescendantNotes: {
                name: 'Pokaż notatki z podfolderów / elementów podrzędnych',
                desc: 'Podczas przeglądania folderu, tagu lub właściwości uwzględnij notatki z podfolderów oraz elementów podrzędnych tagów i właściwości.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Przypinaj notatki tylko w ich folderze',
                desc: 'Przypięte notatki są wyświetlane jako przypięte tylko w swoim własnym folderze. Przydatne dla notatek folderów lub jeśli masz wiele przypiętych notatek. Nie wpływa na widoki tagów ani atrybutów.'
            },
            separateNoteCounts: {
                name: 'Pokaż bieżącą i podrzędną liczbę notatek oddzielnie',
                desc: 'Wyświetla liczbę notatek jako "nadrzędne ▾ podrzędne" dla folderów, tagów i właściwości.'
            },
            groupNotes: {
                name: 'Domyślne grupowanie',
                desc: 'Niestandardowe wyświetla nagłówki zdefiniowane w metadanych. Data grupuje notatki według daty. Folder grupuje notatki według folderu. Widoki tagów i atrybutów używają grup dat, gdy wybrany jest folder.',
                options: {
                    custom: 'Niestandardowe',
                    date: 'Data',
                    folder: 'Folder'
                }
            },
            showSelectedNavigationPills: {
                name: 'Zawsze pokazuj wszystkie etykiety tagów i atrybutów',
                desc: 'Po wyłączeniu etykiety odpowiadające bieżącemu wyborowi nawigacji są ukrywane (np. etykieta tagu „przepisy” jest ukrywana podczas przeglądania tagu „przepisy”). Włącz, aby wszystkie etykiety były zawsze widoczne.'
            },
            stickyGroupHeaders: {
                name: 'Przyklejone nagłówki grup',
                desc: 'Bieżący nagłówek sekcji daty, folderu lub przypiętej pozostaje widoczny podczas przewijania.'
            },
            showFolderGroupPaths: {
                name: 'Pokaż ścieżki podfolderów',
                desc: 'Podczas grupowania według folderu w panelu listy pokazuj ścieżki podfolderów zamiast samych nazw folderów.'
            },
            showGroupHeaderItemCounts: {
                name: 'Pokaż liczbę elementów',
                desc: 'Wyświetla liczbę elementów w każdym nagłówku grupy w panelu listy.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'Grupowanie folderów: pliki bieżącego folderu na dole',
                desc: 'Gdy domyślne grupowanie to Folder, przenieś pliki znajdujące się bezpośrednio w wybranym folderze pod grupy podfolderów.'
            },
            defaultListMode: {
                name: 'Domyślny tryb listy',
                desc: 'Wybierz domyślny układ listy. Opcja "Standardowy" wyświetla tytuł, datę, opis i tekst podglądu. Opcja "Kompaktowy" wyświetla tylko tytuł. Można to zmienić dla konkretnych folderów.',
                options: {
                    standard: 'Standardowy',
                    compact: 'Kompaktowy'
                }
            },
            showFileIcons: {
                name: 'Pokaż ikonki plików',
                desc: 'Wyświetla ikonki plików z wyrównaniem do lewej strony. Wyłączenie tej opcji powoduje usunięcie zarówno ikonek, jak i wcięć. Priorytet: ikonka nieukończonych zadań > ikonka niestandardowa > ikonka folderu > ikonka nazwy pliku > ikonka typu pliku > ikonka domyślna.'
            },
            useFolderIcon: {
                name: 'Użyj ikonki folderu',
                desc: 'Wyświetla ikonkę folderu nadrzędnego, gdy nie ustawiono niestandardowej ikonki pliku. Kolor folderu jest używany, gdy nie ustawiono niestandardowego koloru pliku.'
            },
            showFileIconUnfinishedTask: {
                name: 'Ikona nieukończonych zadań',
                desc: 'Wyświetla ikonkę, gdy notatka zawiera niezakończone zadania.'
            },
            showFileBackgroundUnfinishedTask: {
                name: 'Tło nieukończonych zadań',
                desc: 'Zastosuj kolor tła, gdy notatka zawiera nieukończone zadania.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'Kolor tła nieukończonych zadań',
                desc: 'Ustaw kolor tła używany, gdy notatka zawiera nieukończone zadania.'
            },
            showFilenameMatchIcons: {
                name: 'Ikonki na podstawie nazwy pliku',
                desc: 'Przypisuje ikonki do plików na podstawie tekstu w ich nazwach.'
            },
            fileNameIconMap: {
                name: 'Przypisanie ikonek na podstawie nazwy pliku',
                desc: 'Pliki zawierające dany tekst otrzymują określoną ikonkę. Jedno przypisanie na linię: tekst=ikonka',
                placeholder: '# tekst=ikona\nspotkanie=ph-calendar\nfaktura=ph-receipt',
                editTooltip: 'Edytuj przypisania'
            },
            showCategoryIcons: {
                name: 'Ikonki według typu pliku',
                desc: 'Przypisuje ikonki do plików na podstawie ich rozszerzeń.'
            },
            fileTypeIconPreset: {
                name: 'Ustawienie wstępne ikonek plików',
                desc: 'Wybierz wbudowane ikonki lub ustawienie wstępne pakietu ikonek. Niestandardowe reguły rozszerzeń zastępują to ustawienie wstępne.',
                options: {
                    none: 'Wbudowane ikonki'
                },
                notInstalledWarning: 'Ten pakiet ikonek nie jest zainstalowany. Zamiast niego są wyświetlane wbudowane ikonki.'
            },
            fileTypeIconMap: {
                name: 'Przypisanie ikonek na podstawie typu pliku',
                desc: 'Pliki z danym rozszerzeniem otrzymują określoną ikonkę. Jedno przypisanie na linię: rozszerzenie=ikonka',
                placeholder: '# rozszerzenie=ikonka\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'Edytuj przypisania'
            },
            compactItemHeight: {
                name: 'Wysokość elementów w trybie kompaktowym',
                desc: 'Ustawia wysokość elementów kompaktowej listy na komputerach stacjonarnych i urządzeniach mobilnych (piksele).',
                resetTooltip: 'Przywróć wartość domyślną (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Skalowanie tekstu z wysokością trybu kompaktowego',
                desc: 'Skaluje tekst na kompaktowej liście, gdy wysokość elementu zostanie zmniejszona.'
            },
            showParentFolder: {
                name: 'Pokaż folder nadrzędny',
                desc: 'Wyświetla nazwę folderu nadrzędnego dla notatek w podfolderach, tagach lub właściwościach.'
            },
            showParentFolderFullPath: {
                name: 'Pokaż ścieżkę folderu',
                desc: 'Wyświetla ścieżkę względem wybranego folderu zamiast samej nazwy folderu. Tagi i właściwości pokazują pełną ścieżkę.'
            },
            parentFolderClickRevealsFile: {
                name: 'Kliknięcie folderu nadrzędnego otwiera folder',
                desc: 'Kliknięcie etykiety folderu nadrzędnego otwiera folder w panelu listy.'
            },
            showParentFolderColor: {
                name: 'Pokaż kolor folderu nadrzędnego',
                desc: 'Używa kolorów folderów na etykietach folderów nadrzędnych.'
            },
            showParentFolderIcon: {
                name: 'Pokaż ikonkę folderu nadrzędnego',
                desc: 'Wyświetla ikonki folderów obok etykiet folderów nadrzędnych.'
            },
            showQuickActions: {
                name: 'Pokaż szybkie czynności',
                desc: 'Wyświetla przyciski akcji po najechaniu kursorem na pliki. Wyróżnij ikonkę, aby wyświetlić czynność.'
            },
            dualPane: {
                name: 'Układ podwójnego panelu',
                desc: 'Wyświetla panel nawigacji i panel listy obok siebie na komputerze.'
            },
            dualPaneOrientation: {
                name: 'Orientacja trybu podwójnego',
                desc: 'Wybierz układ poziomy lub pionowy, gdy aktywny jest podwójny panel.',
                options: {
                    horizontal: 'Podział poziomy',
                    vertical: 'Podział pionowy'
                }
            },
            narrowSidebarLayout: {
                name: 'Gdy pasek boczny jest zbyt wąski',
                desc: 'Wybierz, co się dzieje, gdy panel nawigacji i panel listy nie mieszczą się obok siebie.',
                options: {
                    none: 'Nic nie rób',
                    singlePane: 'Przełącz na jeden panel',
                    vertical: 'Przełącz na podział pionowy'
                }
            },
            narrowSidebarTrigger: {
                name: 'Próg wąskiego paska bocznego',
                desc: 'Wybierz sposób obliczania progu szerokości paska bocznego.',
                options: {
                    fitPanes: 'Dopasuj panele',
                    customWidth: 'Niestandardowa szerokość'
                }
            },
            narrowSidebarCustomWidth: {
                name: 'Szerokość progu wąskiego paska bocznego',
                desc: 'Przełączaj, gdy pasek boczny jest węższy niż ta szerokość.',
                resetTooltip: 'Przywróć domyślną szerokość'
            },
            appearanceBackground: {
                name: 'Kolor tła',
                desc: 'Wybierz kolory tła dla panelu nawigacji i listy.',
                options: {
                    separate: 'Oddzielne tła',
                    primary: 'Użyj tła listy',
                    secondary: 'Użyj tła nawigacji'
                }
            },
            appearanceScale: {
                name: 'Poziom przybliżenia',
                desc: 'Kontroluje ogólny poziom przybliżenia Notebook Navigator (procent).'
            },
            useFloatingToolbars: {
                name: 'Użyj pływających pasków narzędzi w systemie iOS/iPadOS',
                desc: 'Dotyczy tylko iOS i iPadOS.'
            },
            startView: {
                name: 'Domyślny widok początkowy',
                desc: 'Wybierz, który panel jest aktywny po otwarciu Notebook Navigator. Układ jednopanelowy pokazuje ten panel jako pierwszy; układ dwupanelowy przenosi na niego fokus klawiatury.',
                options: {
                    navigation: 'Panel nawigacji',
                    files: 'Panel listy'
                }
            },
            toolbarButtons: {
                name: 'Przyciski paska narzędzi',
                desc: 'Wybierz, które przyciski mają być wyświetlane na pasku narzędzi. Ukryte przyciski pozostają dostępne za pośrednictwem palety poleceń i w menu.',
                navigationLabel: 'Panel nawigacji',
                listLabel: 'Panel listy'
            },
            createNewNotesInNewTab: {
                name: 'Otwieraj nowe notatki w nowej karcie',
                desc: 'Gdy włączone, polecenie Utwórz nową notatkę otwiera notatki w nowej karcie. Gdy wyłączone, notatki zastępują bieżącą kartę.'
            },
            autoRevealActiveNote: {
                name: 'Pokaż aktywną notatkę',
                desc: 'Automatycznie wyświetla notatki po otwarciu za pomocą okna szybkiego wyboru, linków lub wyszukiwania.'
            },
            autoRevealShortestPath: {
                name: 'Automatyczne ujawnianie: Użyj najkrótszej ścieżki',
                desc: 'Włączone: Automatyczne ujawnianie wybiera najbliższy widoczny folder nadrzędny lub tag. Wyłączone: Automatyczne ujawnianie wybiera rzeczywisty folder pliku i dokładny tag.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Automatyczne ujawnianie: Ignoruj zdarzenia z prawego paska bocznego',
                desc: 'Nie zmieniaj aktywnej notatki podczas klikania lub zmiany notatek w prawym pasku bocznym.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'Automatyczne ujawnianie: Ignoruj zdarzenia z innych okien',
                desc: 'Nie zmieniaj aktywnej notatki podczas pracy z notatkami w innym oknie.'
            },
            paneTransitionDuration: {
                name: 'Animacja pojedynczego panelu',
                desc: 'Czas trwania przejścia podczas przełączania paneli w trybie pojedynczego panelu (w milisekundach).',
                resetTooltip: 'Przywróć domyślne'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Automatycznie wybierz pierwszą notatkę',
                desc: 'Automatycznie otwiera pierwszą notatkę po zmianie folderu, tagu lub właściwości.'
            },
            skipAutoScroll: {
                name: 'Wyłącz automatyczne przewijanie skrótów',
                desc: 'Nie przewijaj panelu nawigacji podczas klikania elementów w skrótach.'
            },
            autoExpandNavItems: {
                name: 'Rozwiń podczas zaznaczania',
                desc: 'Rozwija foldery, tagi i atrybuty po zaznaczeniu. W trybie pojedynczego panelu pierwsze zaznaczenie powoduje rozwinięcie, drugie zaznaczenie powoduje wyświetlenie plików.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'Jedna rozwinięta gałąź',
                desc: 'Zwijaj inne gałęzie w tym samym drzewie podczas rozwijania folderu, tagu lub atrybutu.'
            },
            springLoadedFolders: {
                name: 'Rozwiń podczas przeciągania',
                desc: 'Rozwija foldery i tagi po najechaniu kursorem podczas przeciągania.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Rozwiń podczas przeciągania: Opóźnienie pierwszego rozwinięcia',
                desc: 'Opóźnienie przed rozwinięciem pierwszego folderu lub tagu podczas przeciągania (w sekundach).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Rozwiń podczas przeciągania: Opóźnienie kolejnych rozwinięć',
                desc: 'Opóźnienie przed rozwinięciem kolejnych folderów lub tagów podczas tego samego przeciągania (w sekundach).'
            },
            navigationBanner: {
                name: 'Baner nawigacji (profil sejfu)',
                desc: 'Wyświetla obraz nad panelem nawigacji. Zmienia się wraz z wybranym profilem sejfu.',
                current: 'Aktywny baner: {path}',
                chooseButton: 'Wybierz obraz'
            },
            pinNavigationBanner: {
                name: 'Przypnij baner',
                desc: 'Przypnij baner nad panelem nawigacji.'
            },
            showShortcuts: {
                name: 'Pokaż skróty',
                desc: 'Wyświetla sekcję skrótów w panelu nawigacji.'
            },
            shortcutBadgeDisplay: {
                name: 'Plakietka skrótu',
                desc: "Co ma być widoczne obok skrótów. Użyj poleceń 'Otwórz skrót 1-9', aby otworzyć skróty bezpośrednio.",
                options: {
                    index: 'Pozycja (1-9)',
                    count: 'Liczba elementów',
                    none: 'Brak'
                }
            },
            showRecentNotes: {
                name: 'Pokaż ostatnie pliki',
                desc: 'Wyświetla sekcję ostatnich plików w panelu nawigacji.'
            },
            hideRecentNotes: {
                name: 'Ukryj typy plików z ostatnich plików',
                desc: 'Wybierz typy plików do ukrycia w sekcji ostatnich plików.',
                options: {
                    none: 'Brak',
                    folderNotes: 'Notatki folderów'
                }
            },
            recentNotesCount: {
                name: 'Liczba ostatnich plików',
                desc: 'Liczba ostatnich plików do wyświetlenia.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Przypnij ostatnie pliki razem ze skrótami',
                desc: 'Dołącz ostatnie pliki podczas przypinania skrótów.'
            },
            calendarEnabled: {
                name: 'Włącz kalendarz',
                desc: 'Włącz funkcje kalendarza w Notebook Navigator.'
            },
            calendarPlacement: {
                name: 'Położenie kalendarza',
                desc: 'Umieść kalendarz w lewym lub prawym panelu bocznym.',
                options: {
                    leftSidebar: 'Lewy panel boczny',
                    rightSidebar: 'Prawy panel boczny'
                }
            },
            calendarLeftPlacement: {
                name: 'Pozycja w trybie pojedynczego panelu',
                desc: 'Gdzie kalendarz jest wyświetlany w trybie pojedynczego panelu.',
                options: {
                    navigationPane: 'Panel nawigacji',
                    below: 'Pod panelami'
                }
            },
            calendarLocale: {
                name: 'Ustawienia regionalne',
                desc: 'Kontroluje formatowanie dat kalendarza, numerację tygodni i pierwszy dzień tygodnia.',
                weekPathMismatchWarning:
                    'Widoczny kalendarz i ścieżki notatek tygodniowych używają różnych początków tygodni lub numeracji tygodni.',
                options: {
                    systemDefault: 'Domyślne'
                }
            },
            calendarWeekendDays: {
                name: 'Dni weekendowe',
                desc: 'Wyświetla dni weekendowe z innym kolorem tła.',
                options: {
                    none: 'Brak',
                    satSun: 'sobota i niedziela',
                    friSat: 'piątek i sobota',
                    thuFri: 'czwartek i piątek'
                }
            },
            calendarMonthHeadingFormat: {
                name: 'Format nazwy miesiąca',
                desc: 'Pełna (styczeń) lub skrócona (sty) nazwa miesiąca.',
                options: {
                    full: 'styczeń (pełna)',
                    short: 'sty (krótka)'
                }
            },
            showInfoButtons: {
                name: 'Pokaż przyciski informacyjne',
                desc: 'Wyświetla przyciski informacyjne w pasku wyszukiwania i nagłówku kalendarza.'
            },
            calendarWeeksToShow: {
                name: 'Tygodnie widoczne w lewym pasku bocznym',
                desc: 'Kalendarz w prawym pasku bocznym zawsze wyświetla cały miesiąc.',
                options: {
                    fullMonth: 'Cały miesiąc',
                    oneWeek: '1 tydzień',
                    weeksCount: 'tygodnie: {count}'
                }
            },
            calendarHighlightToday: {
                name: 'Wyróżnij dzisiejszą datę',
                desc: 'Wyróżnij dzisiejszą datę kolorem tła i pogrubioną czcionką.'
            },
            calendarShowFeatureImage: {
                name: 'Pokaż wyróżniony obraz',
                desc: 'Wyświetla wyróżnione obrazy notatek w kalendarzu.'
            },
            calendarShowTasks: {
                name: 'Pokaż zadania',
                desc: 'Wyświetla wskaźnik przy dniach, tygodniach i miesiącach z niezakończonymi zadaniami.'
            },
            calendarShowWeekNumber: {
                name: 'Pokaż numer tygodnia',
                desc: 'Dodaje kolumnę z numerem tygodnia.'
            },
            calendarShowQuarter: {
                name: 'Pokaż kwartał',
                desc: 'Dodaje etykietę kwartału w nagłówku kalendarza.'
            },
            calendarShowYearCalendar: {
                name: 'Pokaż kalendarz roczny',
                desc: 'Wyświetla nawigację roczną i siatkę miesięczną w prawym pasku bocznym.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Potwierdź przed utworzeniem',
                desc: 'Wyświetla możliwość potwierdzenia podczas tworzenia nowej notatki dziennika.'
            },
            calendarShowHiddenItems: {
                name: 'Pokaż ukryte elementy',
                desc: 'Po włączeniu kalendarz zawsze pokazuje wszystkie notatki kalendarza, w tym notatki ukryte przez filtry profilu magazynu.'
            },
            calendarIntegrationMode: {
                name: 'Źródło notatek',
                desc: 'Źródło notatek kalendarza.',
                options: {
                    dailyNotes: 'Dziennik (wbudowana wtyczka)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'Folder i format daty można zmienić w ustawieniach wtyczki Dziennik.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'Ustawienia regionalne notatek okresowych',
                desc: 'Kontroluje zlokalizowane nazwy miesięcy, dni tygodnia, numery tygodni oraz początki tygodni w ścieżkach notatek okresowych Notebook Navigator.',
                options: {
                    calendar: 'Kalendarz',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'Folder główny',
                desc: 'Folder bazowy dla notatek okresowych. Wzory dat mogą zawierać podfoldery. Zmienia się wraz z wybranym profilem sejfu.',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'Lokalizacja folderu szablonów',
                desc: 'Wybór pliku szablonu pokazuje notatki z tego folderu.',
                placeholder: 'Templates',
                usage: 'Używane przez notatki kalendarza i notatki folderów. Skonfiguruj szablony w Kalendarz > Integracja z kalendarzem oraz Foldery i notatki folderu > Pliki notatek folderów.'
            },
            calendarCustomFilePattern: {
                name: 'Notatki dziennika',
                desc: 'Sformatuj ścieżkę przy użyciu formatu daty Moment. Nazwy podfolderów umieść w nawiasach, np. [Work]/YYYY. Kliknij ikonkę szablonu, aby ustawić szablon. Ustaw lokalizację folderu szablonów w sekcji Operacje na plikach > Szablony.',
                momentDescPrefix: 'Sformatuj ścieżkę przy użyciu ',
                momentLinkText: 'formatu daty Moment',
                momentDescSuffix:
                    '. Nazwy podfolderów umieść w nawiasach, np. [Work]/YYYY. Kliknij ikonkę szablonu, aby ustawić szablon. Ustaw lokalizację folderu szablonów w sekcji Operacje na plikach > Szablony.',
                templaterSupportInstalled: '✅ Wtyczka Templater jest zainstalowana i zapewnia pełną obsługę szablonów.',
                templaterSupportMissing: '⚠️ Zainstaluj wtyczkę Templater, aby uzyskać pełną obsługę szablonów.',
                placeholder: 'YYYY/YYYYMMDD',
                example: 'Aktywna składnia: {path}',
                parsingError: 'Wzór musi być tak sformatowany, aby można było odczytać kompletną datę (rok, miesiąc, dzień).'
            },
            calendarCustomWeekPattern: {
                name: 'Notatki tygodniowe',
                parsingError: 'Wzór musi być tak sformatowany, aby można było odczytać kompletną datę (rok tygodnia, numer tygodnia).',
                weekPathMismatchWarning:
                    'Ścieżki notatek tygodniowych używają ustawień regionalnych notatek okresowych. Użyj pasujących ustawień regionalnych lub użyj "GGGG" z "WW" dla tygodni rozpoczynających się w poniedziałek.',
                mixedWeekTokensWarning:
                    'Ten wzór miesza tokeny tygodnia rozpoczynające się w poniedziałek ("W" lub "G") z tokenami tygodnia opartymi na ustawieniach regionalnych ("w" lub "g"). Użyj konsekwentnie jednego zestawu: "GGGG" z "WW" dla tygodni rozpoczynających się w poniedziałek lub "gggg" z "ww", jeśli notatki tygodniowe mają być zgodne z wybranymi ustawieniami regionalnymi.'
            },
            calendarCustomMonthPattern: {
                name: 'Notatki miesięczne',
                parsingError: 'Wzór musi być tak sformatowany, aby można było odczytać kompletną datę (rok, miesiąc).'
            },
            calendarCustomQuarterPattern: {
                name: 'Notatki kwartalne',
                parsingError: 'Wzór musi być tak sformatowany, aby można było odczytać kompletną datę (rok, kwartał).'
            },
            calendarCustomYearPattern: {
                name: 'Notatki roczne',
                parsingError: 'Wzór musi być tak sformatowany, aby można było odczytać kompletną datę (rok).'
            },
            calendarTemplateFile: {
                current: 'Plik szablonu: {name}'
            },
            showTooltips: {
                name: 'Pokaż informacje',
                desc: 'Po najechaniu kursorem wyświetla dodatkowe informacje dotyczące notatek i folderów.'
            },
            showTooltipPath: {
                name: 'Pokaż ścieżkę w podpowiedziach',
                desc: 'Po najechaniu kursorem wyświetla ścieżkę folderu pod nazwami notatek.'
            },
            showTooltipWordCount: {
                name: 'Pokaż liczbę słów w podpowiedziach',
                desc: 'Wyświetla liczbę słów notatek w podpowiedziach.'
            },
            resetPaneSeparator: {
                name: 'Przywróć położenie separatora paneli',
                desc: 'Przywraca domyślne położenie separatora oddzielającego panel nawigacji i panel listy.',
                buttonText: 'Przywróć separator',
                notice: 'Przywrócono pozycję separatora. Uruchom ponownie Obsidian lub ponownie otwórz Notebook Navigator, aby zastosować zmiany.'
            },
            settingsTransfer: {
                name: 'Importuj i eksportuj ustawienia',
                desc: 'Eksportuj lub importuj ustawienia Notebook Navigator jako JSON. Import zastępuje wszystkie ustawienia.',
                importButtonText: 'Importuj',
                exportButtonText: 'Eksportuj',
                import: {
                    modalTitle: 'Importuj ustawienia',
                    fileButtonName: 'Importuj z pliku',
                    fileButtonDesc: 'Wczytaj plik JSON z dysku.',
                    fileButtonText: 'Importuj z pliku',
                    editorName: 'JSON',
                    editorDesc: 'Wklej lub edytuj JSON poniżej. Nieuwzględnione ustawienia zostaną zresetowane do wartości domyślnych.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'Importuj',
                    confirmTitle: 'Zaimportować ustawienia?',
                    confirmMessage: 'Importowanie zastąpi bieżące ustawienia Notebook Navigator.',
                    backupToggleName: 'Zapisz bieżące ustawienia w katalogu głównym sejfu przed importem',
                    backupToggleDesc: 'Tworzy plik JSON ze znacznikiem czasu w katalogu głównym sejfu.',
                    successWithBackupNotice: 'Ustawienia zaimportowane. Poprzednie ustawienia zapisano w {path}.',
                    backupError: 'Nie można zapisać bieżących ustawień: {message}',
                    successNotice: 'Ustawienia zaimportowane.',
                    errorNotice: 'Nie udało się zaimportować ustawień: {message}',
                    fileReadError: 'Nie można odczytać pliku: {message}'
                },
                export: {
                    modalTitle: 'Eksportuj ustawienia',
                    editorName: 'JSON',
                    editorDesc: 'Uwzględnione są tylko ustawienia zmienione w stosunku do wartości domyślnych.',
                    placeholder: '{}',
                    copyButtonText: 'Kopiuj do schowka',
                    downloadButtonText: 'Pobierz',
                    copyNotice: 'Ustawienia skopiowane do schowka.',
                    downloadNotice: 'Ustawienia wyeksportowane.',
                    downloadError: 'Nie udało się pobrać ustawień: {message}'
                }
            },
            resetAllSettings: {
                name: 'Przywróć wszystkie ustawienia',
                desc: 'Przywraca wszystkie ustawienia Notebook Navigator do wartości domyślnych.',
                buttonText: 'Przywróć wszystkie ustawienia',
                confirmTitle: 'Przywrócić wszystkie ustawienia?',
                confirmMessage:
                    'Spowoduje to przywrócenie wszystkich ustawień Notebook Navigator do wartości domyślnych. Nie można cofnąć tej czynności.',
                confirmButtonText: 'Przywróć wszystkie ustawienia',
                notice: 'Przywrócono wszystkie ustawienia. Uruchom ponownie Obsidian lub ponownie otwórz Notebook Navigator, aby zastosować zmiany.',
                error: 'Nie udało się przywrócić ustawień.'
            },
            multiSelectModifier: {
                name: 'Zaznaczanie wielu elementów',
                desc: 'Wybierz, który klawisz umożliwia zaznaczanie wielu elementów. Gdy wybrano Option/Alt, kliknięcie z Cmd/Ctrl otwiera notatki w nowej karcie.',
                options: {
                    cmdCtrl: 'kliknięcie z Cmd/Ctrl',
                    optionAlt: 'kliknięcie z Option/Alt'
                }
            },
            enterToOpenFiles: {
                name: 'Naciśnij Enter, aby otworzyć pliki',
                desc: 'Otwieraj pliki tylko po naciśnięciu Enter podczas nawigacji po liście za pomocą klawiatury. W macOS zapobiega to zmianie nazw plików klawiszem Enter.'
            },
            shiftEnterOpenContext: {
                name: 'Shift+Enter',
                desc: 'Wybierz, czy Shift+Enter otwiera, czy zmienia nazwę wybranego pliku.'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Enter',
                desc: 'Wybierz, czy Cmd+Enter otwiera, czy zmienia nazwę wybranego pliku.'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Enter',
                desc: 'Wybierz, czy Ctrl+Enter otwiera, czy zmienia nazwę wybranego pliku.'
            },
            mouseBackForwardAction: {
                name: 'Przyciski wstecz/dalej myszy',
                desc: 'Działanie przycisków wstecz i dalej myszy na komputerze.',
                options: {
                    none: 'Użyj domyślnych systemu',
                    singlePaneSwitch: 'Przełącz panele (jeden panel)',
                    history: 'Nawiguj historię'
                }
            },
            fileVisibility: {
                name: 'Pokaż typy plików (profil sejfu)',
                desc: 'Filtruj typy plików widoczne w przeglądarce. Pliki nieobsługiwane przez Obsidian mogą być otwierane w aplikacjach zewnętrznych.',
                options: {
                    documents: 'Dokumenty (.md, .canvas, .base)',
                    supported: 'Obsługiwane (otwiera się w Obsidian)',
                    all: 'Wszystkie (mogą otworzyć się zewnętrznie)'
                }
            },
            homepage: {
                name: 'Strona główna',
                desc: 'Wybierz, co Notebook Navigator otwiera automatycznie przy uruchomieniu.',
                current: 'Aktywny: {path}',
                chooseButton: 'Wybierz plik',
                options: {
                    none: 'Brak',
                    file: 'Plik',
                    dailyNote: 'Dziennik',
                    weeklyNote: 'Notatka tygodniowa',
                    monthlyNote: 'Notatka miesięczna',
                    quarterlyNote: 'Notatka kwartalna',
                    yearlyNote: 'Notatka roczna'
                },
                file: {
                    name: 'Strona główna: Plik startowy',
                    empty: 'Nie wybrano pliku'
                },
                createMissing: {
                    name: 'Strona główna: Utwórz notatkę, jeśli jej brak',
                    desc: 'Tworzy notatkę okresową podczas uruchamiania lub po wywołaniu polecenia, jeśli nie istnieje.'
                }
            },
            excludedNotes: {
                name: 'Ukryj notatki na podstawie reguł atrybutów (profil sejfu)',
                desc: 'Lista reguł atrybutów rozdzielonych przecinkami. Użyj `key` lub `key=value` (np. status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'Ukryj pliki (profil sejfu)',
                desc: 'Lista nazw plików oddzielonych przecinkami. Obsługuje symbole wieloznaczne * i ścieżki / (np. temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Profil sejfu',
                desc: 'Profile przechowują widoczność typów plików, ukryte pliki, ukryte foldery, ukryte tagi, reguły właściwości dla ukrytych notatek, skróty i panel nawigacji. Przełącz profile w nagłówku panelu nawigacji.',
                defaultName: 'Domyślny',
                addButton: 'Dodaj profil',
                editProfilesButton: 'Edytuj profile',
                addProfileOption: 'Dodaj profil...',
                applyButton: 'Zastosuj',
                deleteButton: 'Usuń profil',
                addModalTitle: 'Dodaj profil',
                editProfilesModalTitle: 'Edytuj profile',
                addModalPlaceholder: 'Nazwa profilu',
                deleteModalTitle: 'Usuń {name}',
                deleteModalMessage:
                    'Usunąć {name}? Filtry ukrytych plików, folderów, tagów i notatek oparte na właściwościach zapisane w tym profilu zostaną usunięte.',
                moveUp: 'Przesuń w górę',
                moveDown: 'Przesuń w dół',
                errors: {
                    emptyName: 'Wprowadź nazwę profilu',
                    duplicateName: 'Nazwa profilu już istnieje'
                }
            },
            vaultTitle: {
                name: 'Położenie tytułu sejfu',
                desc: 'Wybierz, gdzie jest widoczny tytuł sejfu.',
                options: {
                    header: 'Pokaż w nagłówku',
                    navigation: 'Pokaż w panelu nawigacji'
                }
            },
            excludedFolders: {
                name: 'Ukryj foldery (profil sejfu)',
                desc: 'Lista folderów rozdzielonych przecinkami. Wzory nazw: assets* (foldery zaczynające się od assets), *_temp (kończące się na _temp). Wzory ścieżek: /archive (folder nadrzędny o nazwie archive), /res* (folder nadrzędny o nazwie zaczynającej się od res), /*/temp (foldery podrzędne o nazwie temp), /projects/* (wszystkie foldery wewnątrz folderu projects).',
                placeholder: 'templates, assets*, /archive, /res*'
            },
            descendantExcludedFolders: {
                name: 'Wyklucz foldery z notatek z podfolderów (profil skarbca)',
                desc: 'Lista folderów oddzielonych przecinkami, które mają być pomijane podczas zbierania notatek z podfolderów. Foldery pozostają widoczne, a wybranie folderu nadal pokazuje jego notatki. Używa tych samych wzorców co Ukryj foldery.',
                placeholder: 'dzienne, zasoby, /archiwum'
            },
            showFileDate: {
                name: 'Pokaż datę',
                desc: 'Wyświetla datę pod nazwami notatek.'
            },
            alphabeticalDateMode: {
                name: 'Podczas sortowania według nazwy',
                desc: 'Data widoczna, gdy notatki są sortowane alfabetycznie.',
                options: {
                    created: 'Data utworzenia',
                    modified: 'Data modyfikacji'
                }
            },
            showFileTags: {
                name: 'Pokaż tagi plików',
                desc: 'Wyświetla klikalne tagi w elementach plików.'
            },
            showFileTagAncestors: {
                name: 'Pokaż kompletne ścieżki tagów',
                desc: "Wyświetla kompletne ścieżki hierarchii tagów. Po włączeniu: 'ai/openai', 'praca/projekty/2024'. Po wyłączeniu: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Koloruj tagi plików',
                desc: 'Zastosuj kolory do tagów w elementach plików.'
            },
            prioritizeColoredFileTags: {
                name: 'Pokaż kolorowe tagi jako pierwsze',
                desc: 'Wyświetla kolorowe tagi przed innymi w elementach plików.'
            },
            showFileTagsInCompactMode: {
                name: 'Pokaż tagi plików w trybie kompaktowym',
                desc: 'Wyświetla tagi, gdy data, podgląd i obraz są ukryte.'
            },
            showFileProperties: {
                name: 'Pokaż atrybuty plików',
                desc: 'Wyświetl atrybuty w elementach plików. Użyj okna „Widoczność kluczy atrybutów”, aby wybrać, które atrybuty są pokazywane.'
            },
            colorFileProperties: {
                name: 'Koloruj atrybuty plików',
                desc: 'Zastosuj kolory do etykiet atrybutów w elementach plików.'
            },
            prioritizeColoredFileProperties: {
                name: 'Wyświetl kolorowe atrybuty jako pierwsze',
                desc: 'Sortuj kolorowe atrybuty przed pozostałymi w elementach plików.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Pokaż atrybuty w trybie kompaktowym',
                desc: 'Wyświetlaj atrybuty, gdy tryb kompaktowy jest aktywny.'
            },
            textCountDisplay: {
                name: 'Typ licznika',
                desc: 'Wybierz, które liczniki notatek pojawiają się w elementach plików.',
                options: {
                    none: 'Brak',
                    words: 'Liczba słów',
                    characters: 'Liczba znaków',
                    both: 'Liczba słów i znaków'
                }
            },
            textCountPlacement: {
                name: 'Położenie',
                desc: 'Wybierz, gdzie pojawiają się liczniki notatek.',
                options: {
                    title: 'W tytule',
                    property: 'Jako atrybut'
                }
            },
            characterCountSpaces: {
                name: 'Liczba znaków',
                desc: 'Wybierz, czy spacje są uwzględniane w liczbie znaków.',
                options: {
                    include: 'Ze spacjami',
                    exclude: 'Bez spacji'
                }
            },
            wordCountTargetProperty: {
                name: 'Atrybut celu',
                desc: 'Klucz atrybutu frontmatter zawierający docelową liczbę słów. Pozostaw puste, aby ukryć cele.'
            },
            showWordCountPercentage: {
                name: 'Pokaż procent celu',
                desc: 'Wyświetlaj tylko procent postępu, gdy dostępna jest docelowa liczba słów.'
            },
            propertyFields: {
                name: 'Klucze atrybutów (profil sejfu)',
                desc: 'Klucze atrybutów frontmatter z kontrolą widoczności per klucz dla nawigacji i listy plików.',
                addButtonTooltip: 'Konfiguruj klucze atrybutów',
                noneConfigured: 'Brak skonfigurowanych atrybutów',
                singleConfigured: '1 atrybut skonfigurowany: {properties}',
                multipleConfigured: '{count} atrybutów skonfigurowanych: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'Pokaż atrybuty w osobnych wierszach',
                desc: 'Wyświetl każdy atrybut w osobnym wierszu.'
            },
            enablePropertyInternalLinks: {
                name: 'Połącz etykiety atrybutów z notatkami',
                desc: 'Kliknij etykietę atrybutu, aby otworzyć powiązaną notatkę.'
            },
            enablePropertyExternalLinks: {
                name: 'Połącz etykiety atrybutów z adresami URL',
                desc: 'Kliknij etykietę atrybutu, aby otworzyć powiązany adres URL.'
            },
            dateFormat: {
                name: 'Format daty',
                desc: 'Format widocznych dat (format Moment).',
                placeholder: 'DD.MM.YYYY',
                help: 'Popularne formaty:\nDD.MM.YYYY = 25.05.2022\nDD/MM/YYYY = 25/05/2022\nYYYY-MM-DD = 2022-05-25\n\nTokeny:\nYYYY/YY = rok\nMMMM/MMM/MM = miesiąc\nDD/D = dzień\ndddd/ddd = dzień tygodnia',
                helpTooltip: 'Format z Moment',
                momentLinkText: 'format Moment'
            },
            timeFormat: {
                name: 'Format czasu',
                desc: 'Format widocznego czasu (format Moment).',
                placeholder: 'HH:mm',
                help: 'Popularne formaty:\nHH:mm = 14:30 (24-godzinny)\nh:mm a = 2:30 PM (12-godzinny)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nTokeny:\nHH/H = 24-godzinny\nhh/h = 12-godzinny\nmm = minuty\nss = sekundy\na = AM/PM',
                helpTooltip: 'Format z Moment',
                momentLinkText: 'format Moment'
            },
            showFilePreview: {
                name: 'Pokaż podgląd notatki',
                desc: 'Wyświetla tekst podglądu pod nazwami notatek.'
            },
            skipHeadingsInPreview: {
                name: 'Pomiń nagłówki w podglądzie',
                desc: 'Pomija wiersze nagłówków podczas generowania tekstu podglądu.'
            },
            skipCodeBlocksInPreview: {
                name: 'Pomiń bloki kodu w podglądzie',
                desc: 'Pomija bloki kodu podczas generowania tekstu podglądu.'
            },
            stripHtmlInPreview: {
                name: 'Usuń HTML w podglądach',
                desc: 'Usuń znaczniki HTML z tekstu podglądu. Może wpływać na wydajność przy dużych notatkach.'
            },
            stripLatexInPreview: {
                name: 'Usuń LaTeX w podglądach',
                desc: 'Usuń wyrażenia LaTeX inline i blokowe z tekstu podglądu.'
            },
            previewProperties: {
                name: 'Podgląd atrybutów',
                desc: 'Lista atrybutów rozdzielonych przecinkami do sprawdzenia dla tekstu podglądu. Zostanie użyty pierwszy atrybut z tekstem.',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'Użyj treści notatki zastępczo',
                desc: 'Wyświetl treść notatki jako podgląd, gdy żaden ze wskazanych atrybutów nie zawiera tekstu.'
            },
            previewRows: {
                name: 'Wiersze podglądu',
                desc: 'Liczba widocznych wierszy w podglądzie.',
                options: {
                    '1': '1 wiersz',
                    '2': '2 wiersze',
                    '3': '3 wiersze',
                    '4': '4 wiersze',
                    '5': '5 wierszy'
                }
            },
            fileNameRows: {
                name: 'Wiersze tytułu',
                desc: 'Liczba widocznych wierszy tytułów notatek.',
                options: {
                    '1': '1 wiersz',
                    '2': '2 wiersze',
                    '3': '3 wiersze'
                }
            },
            useFolderColor: {
                name: 'Użyj koloru folderu',
                desc: 'Koloruje tytuły notatek i ikonki plików kolorem folderu nadrzędnego, gdy nie ustawiono niestandardowego koloru pliku. Priorytet: niestandardowy kolor pliku > kolor folderu > kolor domyślny.'
            },
            showFeatureImage: {
                name: 'Pokaż wyróżniony obraz',
                desc: 'Wyświetla miniaturę pierwszego obrazu znalezionego w notatce.'
            },
            forceSquareFeatureImage: {
                name: 'Wymuś kwadratowy wyróżniony obraz',
                desc: 'Wyświetla wyróżnione obrazy jako kwadratowe miniatury.'
            },
            featureImageProperties: {
                name: 'Atrybuty obrazu',
                desc: 'Lista atrybutów rozdzielonych przecinkami do sprawdzenia w pierwszej kolejności. Używa pierwszego obrazu z treści markdown, jeśli nie określono.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'Wyklucz notatki z atrybutami',
                desc: 'Lista atrybutów rozdzielonych przecinkami. Notatki zawierające którykolwiek z tych atrybutów nie wyświetlają wyróżnionych obrazów.',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: 'Rozmiar wyświetlania obrazu wyróżniającego',
                desc: 'Maksymalny rozmiar renderowania wyróżnionych obrazów na listach notatek.',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'Rozmiar pikseli obrazu wyróżniającego',
                desc: 'Rozdzielczość używana podczas generowania przechowywanych miniatur wyróżnionych obrazów. Zwiększ tę wartość, jeśli większe podglądy wyglądają na rozmyte.',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'Pobierz obrazy zewnętrzne',
                desc: 'Pobiera zdalne obrazy i miniatury YouTube wyróżnionych obrazów.'
            },
            hideDrawingPreviewImages: {
                name: 'Ukryj wyeksportowane obrazy podglądu',
                desc: 'Ukrywa wyeksportowane pliki PNG podglądu rysunków. Włącz „Pokaż ukryte elementy”, aby je wyświetlić.'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator wyświetla pliki PNG wyeksportowane przez Excalidraw jako podglądy rysunków.',
                items: [
                    'W **ustawieniach Excalidraw** otwórz **Embedding Excalidraw into your Notes and Exporting**, następnie **Export Settings**, następnie **Auto-export Settings**.',
                    'Włącz **Auto-export PNG**. Opcjonalnie włącz **Export both dark- and light-themed image**.',
                    'Notebook Navigator szuka **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** lub **Drawing.excalidraw.light.png**.',
                    'Gdy **Ukryj wyeksportowane obrazy podglądu** jest włączone, pliki PNG pojawiają się tylko wtedy, gdy włączone jest również **Pokaż ukryte elementy**.'
                ]
            },
            showRootFolder: {
                name: 'Pokaż folder główny',
                desc: 'Wyświetla nazwę sejfu jako folder główny w strukturze folderów.'
            },
            showFolderIcons: {
                name: 'Pokaż ikonki folderów',
                desc: 'Wyświetla ikonki obok folderów w panelu nawigacji.'
            },
            inheritFolderColors: {
                name: 'Dziedzicz kolory folderów',
                desc: 'Podfoldery dziedziczą kolor z folderów nadrzędnych.'
            },
            folderSortOrder: {
                name: 'Kolejność sortowania folderów',
                desc: 'Kliknij folder prawym przyciskiem myszy, aby ustawić inną kolejność sortowania dla jego elementów podrzędnych.',
                options: {
                    alphaAsc: 'od A do Z',
                    alphaDesc: 'od Z do A'
                }
            },
            showNoteCount: {
                name: 'Pokaż liczbę notatek',
                desc: 'Wyświetla liczbę notatek obok folderów, tagów i właściwości.'
            },
            showSectionIcons: {
                name: 'Pokaż ikonki skrótów i ostatnich elementów',
                desc: 'Wyświetla ikonki obok elementów w sekcjach Skróty i Ostatnie.'
            },
            interfaceIcons: {
                name: 'Ikonki interfejsu',
                desc: 'Edytuj ikonki paska narzędzi, folderów, tagów, właściwości, przypiętych elementów, wyszukiwania i sortowania.',
                buttonText: 'Edytuj ikonki'
            },
            showIconsColorOnly: {
                name: 'Zastosuj kolor tylko do ikonek',
                desc: 'Po włączeniu niestandardowe kolory są stosowane tylko do ikonek. Po wyłączeniu kolory są stosowane zarówno do ikonek, jak i etykiet tekstowych.'
            },
            navRainbowMode: {
                name: 'Tryb kolorów tęczy (profil sejfu)',
                desc: 'Zastosuj kolory tęczy w panelu nawigacji.',
                options: {
                    none: 'Wyłączone',
                    foreground: 'Kolor tekstu',
                    background: 'Kolor tła'
                }
            },
            navRainbowFirstColor: {
                name: 'Pierwszy kolor',
                desc: 'Pierwszy kolor w gradiencie tęczy.'
            },
            navRainbowLastColor: {
                name: 'Ostatni kolor',
                desc: 'Ostatni kolor w gradiencie tęczy.'
            },
            navRainbowTransitionStyle: {
                name: 'Styl przejścia',
                desc: 'Interpolacja między pierwszym a ostatnim kolorem.',
                options: {
                    hue: 'Barwa',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'Zastosuj do skrótów',
                desc: 'Zastosuj kolory tęczy do skrótów.'
            },
            navRainbowApplyToRecent: {
                name: 'Zastosuj do ostatnich elementów',
                desc: 'Zastosuj kolory tęczy do ostatnich elementów.'
            },
            navRainbowApplyToFolders: {
                name: 'Zastosuj do folderów',
                desc: 'Zastosuj kolory tęczy do folderów.'
            },
            navRainbowFolderScope: {
                name: 'Zakres folderów',
                desc: 'Wybierz, które poziomy folderów rozpoczynają przypisywanie kolorów.',
                options: {
                    root: 'Poziom główny',
                    child: 'Poziom podrzędny',
                    all: 'Każdy poziom'
                }
            },
            navRainbowApplyToTags: {
                name: 'Zastosuj do tagów',
                desc: 'Zastosuj kolory tęczy do tagów.'
            },
            navRainbowTagScope: {
                name: 'Zakres tagów',
                desc: 'Wybierz, które poziomy tagów rozpoczynają przypisywanie kolorów.',
                options: {
                    root: 'Poziom główny',
                    child: 'Poziom podrzędny',
                    all: 'Każdy poziom'
                }
            },
            navRainbowApplyToProperties: {
                name: 'Zastosuj do atrybutów',
                desc: 'Zastosuj kolory tęczy do atrybutów.'
            },
            navRainbowBalanceHueLuminance: {
                name: 'Spójna jasność dla odcieni', // (English: Consistent brightness across hues)
                desc: 'Interpoluje jasność między kolorami początkowymi i końcowymi podczas przejść odcieni.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'Oddzielne kolory dla trybu jasnego i ciemnego', // (English: Separate light and dark mode colors)
                desc: 'Użyj różnych kolorów tęczy dla trybu jasnego i trybu ciemnego.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'Kopiuj kolor trybu jasnego do trybu ciemnego', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'Zakres atrybutów',
                desc: 'Wybierz, które poziomy atrybutów rozpoczynają przypisywanie kolorów.',
                options: {
                    root: 'Poziom główny',
                    child: 'Poziom podrzędny',
                    all: 'Każdy poziom'
                }
            },
            collapseBehavior: {
                name: 'Zwiń elementy',
                desc: 'Wybierz na co wpływa przycisk służący do zwijania i rozwijania elementów.',
                options: {
                    all: 'Wszystko',
                    foldersOnly: 'Tylko foldery',
                    tagsOnly: 'Tylko tagi',
                    propertiesOnly: 'Tylko atrybuty'
                }
            },
            smartCollapse: {
                name: 'Zachowaj wybrany element rozwinięty',
                desc: 'Podczas zwijania, zachowaj wybrany element oraz elementy nadrzędne rozwinięte.'
            },
            excludeVaultRootFromCollapse: {
                name: 'Pomiń katalog główny sejfu podczas zwijania',
                desc: 'Podczas zwijania wszystkich elementów pozostaw folder główny sejfu w bieżącym stanie.'
            },
            navIndent: {
                name: 'Wcięcie w strukturze',
                desc: 'Dostosuj szerokość wcięcia w strukturze folderów, tagów i właściwości (piksele).'
            },
            navItemHeight: {
                name: 'Wysokość elementu',
                desc: 'Dostosuj wysokość folderów, tagów i właściwości w panelu nawigacji (piksele).'
            },
            navItemHeightScaleText: {
                name: 'Skaluj tekst z wysokością elementu',
                desc: 'Zmniejsza tekst nawigacji, gdy wysokość elementu jest obniżona.'
            },
            showIndentGuides: {
                name: 'Pokaż linie wcięć',
                desc: 'Wyświetla linie wcięć w strukturze folderów, tagów i właściwości.'
            },
            navCountLeaderStyle: {
                name: 'Pokaż znaki wiodące',
                desc: 'Wyświetla kropki, kreski lub linię między nazwami elementów a liczbą notatek.',
                options: {
                    none: 'Brak',
                    dots: 'Kropki (...)',
                    dashes: 'Kreski (---)',
                    line: 'Linia'
                }
            },
            navRootSpacing: {
                name: 'Odstęp elementów głównych',
                desc: 'Odstęp między nadrzędnymi folderami, tagami i właściwościami (piksele).'
            },
            showTags: {
                name: 'Pokaż tagi',
                desc: 'Wyświetla sekcję tagów w panelu nawigacji.'
            },
            showTagIcons: {
                name: 'Pokaż ikonki tagów',
                desc: 'Wyświetla ikonki obok tagów w panelu nawigacji.'
            },
            inheritTagColors: {
                name: 'Dziedzicz kolory tagów',
                desc: 'Tagi podrzędne dziedziczą kolor tagów nadrzędnych.'
            },
            tagSortOrder: {
                name: 'Kolejność sortowania tagów',
                desc: 'Kliknij tag prawym przyciskiem myszy, aby ustawić inną kolejność sortowania dla jego elementów podrzędnych.',
                options: {
                    alphaAsc: 'od A do Z',
                    alphaDesc: 'od Z do A',
                    frequency: 'liczba wystąpień',
                    lowToHigh: 'rosnąco',
                    highToLow: 'malejąco'
                }
            },
            showAllTagsFolder: {
                name: 'Pokaż folder tagów',
                desc: 'Wyświetla "Tagi" jako folder, który można zwinąć.'
            },
            showUntagged: {
                name: 'Pokaż nieotagowane notatki',
                desc: 'Nieotagowane notatki zawierają etykietę "Bez tagów".'
            },
            scopeTagsToCurrentContext: {
                name: 'Filtruj tagi według wyboru',
                desc: 'Pokaż tylko tagi występujące w notatkach w wybranym folderze lub atrybucie.'
            },
            keepEmptyTagsProperty: {
                name: 'Zachowaj atrybut tags po usunięciu ostatniego tagu',
                desc: 'Zachowuje atrybut tags, gdy wszystkie tagi zostaną usunięte. Gdy wyłączone, atrybut tags również zostanie usunięty.'
            },
            showProperties: {
                name: 'Pokaż atrybuty',
                desc: 'Wyświetl sekcję atrybutów w panelu nawigacji.',
                propertyKeysInfoPrefix: 'Konfiguruj atrybuty w ',
                propertyKeysInfoLinkText: 'Start > Klucze atrybutów',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'Pokaż ikonki atrybutów',
                desc: 'Wyświetl ikonki obok atrybutów w panelu nawigacji.'
            },
            inheritPropertyColors: {
                name: 'Dziedzicz kolory atrybutów',
                desc: 'Wartości dziedziczą kolor i tło atrybutu.'
            },
            propertySortOrder: {
                name: 'Kolejność sortowania atrybutów',
                desc: 'Kliknij prawym przyciskiem atrybut, aby zmienić kolejność sortowania wartości.',
                options: {
                    alphaAsc: 'A do Z',
                    alphaDesc: 'Z do A',
                    frequency: 'liczba wystąpień',
                    lowToHigh: 'rosnąco',
                    highToLow: 'malejąco'
                }
            },
            showAllPropertiesFolder: {
                name: 'Pokaż folder atrybutów',
                desc: 'Wyświetl "Atrybuty" jako zwijany folder.'
            },
            scopePropertiesToCurrentContext: {
                name: 'Filtruj atrybuty według wyboru',
                desc: 'Pokaż tylko atrybuty występujące w notatkach w wybranym folderze lub tagu.'
            },
            hiddenTags: {
                name: 'Ukryj tagi (profil sejfu)',
                desc: 'Lista tagów rozdzielonych przecinkami. Format nazw: tag* (zaczynające się od), *tag (kończące się na). Format ścieżek: archiwum (tag i elementy podrzędne), archiwum/* (tylko elementy podrzędne), projekty/*/szkice (dowolne w środku).',
                placeholder: 'archiwum*, *szkic, projekty/*/stare'
            },
            hiddenFileTags: {
                name: 'Ukryj notatki z tagami (profil sejfu)',
                desc: 'Lista tagów rozdzielonych przecinkami. Notatki zawierające pasujące tagi są ukryte. Format nazw: tag* (zaczynające się od), *tag (kończące się na). Format ścieżek: archiwum (tag i elementy podrzędne), archiwum/* (tylko elementy podrzędne), projekty/*/szkice (dowolne w środku).',
                placeholder: 'archiwum*, *szkic, projekty/*/stare'
            },
            enableFolderNotes: {
                name: 'Włącz notatki folderów',
                desc: 'Foldery z pasującym plikiem notatki są wyświetlane jako klikalne linki.'
            },
            folderNoteType: {
                name: 'Domyślny rodzaj notatki folderu',
                desc: 'Rodzaj notatki folderu tworzony za pomocą menu kontekstowego.',
                options: {
                    ask: 'Pytaj przy tworzeniu',
                    markdown: 'Markdown',
                    canvas: 'Tablica',
                    base: 'Baza danych'
                }
            },
            folderNoteName: {
                name: 'Nazwa notatki folderu',
                desc: 'Nazwa notatki folderu bez rozszerzenia. Zostaw puste, aby użyć takiej samej nazwy jak folder.',
                placeholder: 'index'
            },
            folderNoteNamePattern: {
                name: 'Format nazwy notatki folderu',
                desc: 'Format nazwy notatek folderów bez rozszerzenia. Użyj {{folder}}, aby wstawić nazwę folderu. Po ustawieniu nazwa notatki folderu nie ma zastosowania.'
            },
            folderNoteTemplate: {
                name: 'Szablon notatki folderu',
                desc: 'Plik szablonu używany podczas tworzenia notatek folderów. Szablony Markdown mogą używać Templatera. Szablony Canvas i Base są kopiowane jako zawartość pliku. Ustaw lokalizację folderu szablonów w Operacje na plikach > Szablony.',
                formatWarning: 'Format szablonu musi odpowiadać wybranemu typowi notatki folderu: .md, .canvas lub .base.'
            },
            enableFolderNoteLinks: {
                name: 'Nazwy folderów otwierają notatki folderów',
                desc: 'Kliknięcie nazwy folderu otwiera jego notatkę folderu. Po wyłączeniu notatki folderów dostarczają tylko metadane folderu, takie jak nazwa, ikona i kolor.'
            },
            hideFolderNoteInList: {
                name: 'Ukryj notatki folderów na liście',
                desc: 'Ukryj notatki folderów z listy plików.'
            },
            pinCreatedFolderNote: {
                name: 'Przypnij utworzone notatki folderów',
                desc: 'Przypnij notatki folderów podczas tworzenia z menu kontekstowego.'
            },
            folderNoteOpenLocation: {
                name: 'Otwieraj notatki folderów w',
                desc: 'Wybierz, gdzie otwierają się notatki folderów po kliknięciu linków notatek folderów.',
                options: {
                    currentTab: 'Bieżąca karta',
                    newTab: 'Nowa karta',
                    rightSidebar: 'Prawy pasek boczny'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: 'Prawy pasek boczny: Pokaż najbliższą notatkę folderu',
                desc: 'Po wybraniu folderu prawy pasek boczny automatycznie pokazuje najbliższą nadrzędną notatkę folderu.'
            },
            confirmBeforeDelete: {
                name: 'Potwierdź przed usunięciem',
                desc: 'Wyświetla możliwość potwierdzenia podczas usuwania notatek lub folderów'
            },
            deleteAttachments: {
                name: 'Usuń załączniki przy usuwaniu plików',
                desc: 'Automatycznie usuwaj powiązane załączniki i wygenerowane podglądy rysunków, jeśli nie są używane gdzie indziej',
                options: {
                    ask: 'Pytaj za każdym razem',
                    always: 'Zawsze',
                    never: 'Nigdy'
                }
            },
            moveFileConflicts: {
                name: 'Konflikty przenoszenia',
                desc: 'Podczas przenoszenia pliku do folderu, w którym istnieje już plik o tej samej nazwie. Pytaj za każdym razem (zmień nazwę, nadpisz, anuluj) lub zawsze zmieniaj nazwę.',
                options: {
                    ask: 'Pytaj za każdym razem',
                    rename: 'Zawsze zmieniaj nazwę'
                }
            },
            metadataCleanup: {
                name: 'Wyczyść metadane',
                desc: 'Usuwa niepowiązane metadane pozostałe po usunięciu, przeniesieniu lub zmianie nazwy plików, folderów, tagów lub właściwości poza Obsidian. Dotyczy to wyłącznie pliku ustawień Notebook Navigator.',
                buttonText: 'Wyczyść metadane',
                error: 'Czyszczenie ustawień nie powiodło się',
                loading: 'Sprawdzanie metadanych...',
                statusClean: 'Brak metadanych do wyczyszczenia',
                statusCounts:
                    'Niepowiązane elementy: foldery {folders}, tagi {tags}, atrybuty {properties}, pliki {files}, przypięte {pinned}, separatory {separators}'
            },
            rebuildCache: {
                name: 'Odbuduj pamięć podręczną',
                desc: 'Użyj tej opcji, jeśli zauważysz brakujące tagi, nieprawidłowe podglądy lub brakujące wyróżnione obrazy. Może tak być w przypadku konfliktów synchronizacji lub po nieoczekiwanych zamknięciach.',
                buttonText: 'Odbuduj pamięć podręczną',
                error: 'Nie udało się odbudować pamięci podręcznej',
                indexingTitle: 'Indeksowanie sejfu...',
                progress: 'Aktualizowanie pamięci podręcznej Notebook Navigator.'
            },
            externalIcons: {
                downloadButton: 'Pobierz',
                downloadingLabel: 'Pobieranie...',
                removeButton: 'Usuń',
                statusInstalled: 'Pobrano (wersja {version})',
                statusNotInstalled: 'Nie pobrano',
                versionUnknown: 'nieznana',
                downloadFailed: 'Nie udało się pobrać {name}. Sprawdź połączenie i spróbuj ponownie.',
                removeFailed: 'Nie udało się usunąć {name}.',
                infoNote:
                    'Pobrane pakiety ikonek synchronizują się między urządzeniami. Pakiety ikonek są przechowywane lokalnie na każdym urządzeniu; synchronizacja śledzi jedynie, czy należy je pobrać, czy usunąć. Pakiety ikonek są pobierane z repozytorium Notebook Navigator (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterDates: {
                name: 'Używaj metadanych',
                desc: 'Używaj metadanych dla nazwy notatki, znaczników czasu, ikonek i kolorów'
            },
            frontmatterIconField: {
                name: 'Pole ikonki',
                desc: 'Pole metadanych dla ikonek plików. Pozostaw puste, aby użyć ikonek zapisanych w ustawieniach.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'Pole koloru',
                desc: 'Pole metadanych dla kolorów plików. Pozostaw puste, aby użyć kolorów zapisanych w ustawieniach.',
                placeholder: 'color'
            },
            frontmatterBackgroundField: {
                name: 'Pole tła',
                desc: 'Pole metadanych dla kolorów tła. Pozostaw puste, aby użyć kolorów tła zapisanych w ustawieniach.',
                placeholder: 'background'
            },
            frontmatterMigration: {
                name: 'Przenieś ikonki i kolory z ustawień',
                desc: 'Zapisane w ustawieniach: ikonki {icons}, kolory {colors}.',
                button: 'Przenieś',
                buttonWorking: 'Przenoszenie...',
                noticeNone: 'W ustawieniach nie ma zapisanych żadnych ikonek plików ani kolorów.',
                noticeDone: 'Przeniesione: ikonki {migratedIcons}/{icons}, kolory {migratedColors}/{colors}.',
                noticeFailures: 'Niepowodzenie: {failures}.',
                noticeError: 'Przenoszenie nie powiodło się. Sprawdź konsolę, aby uzyskać więcej informacji.'
            },
            frontmatterNameField: {
                name: 'Pola nazwy',
                desc: 'Lista pól metadanych rozdzielonych przecinkami. Używana jest pierwsza poprawna wartość. W przypadku braku wartości używana jest nazwa pliku.',
                placeholder: 'tytuł, nazwa'
            },
            frontmatterCreatedField: {
                name: 'Pole znacznika czasu utworzenia',
                desc: 'Nazwa pola metadanych dla znacznika czasu utworzenia. Pozostaw puste, aby używać tylko daty systemu plików.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'Pole znacznika czasu modyfikacji',
                desc: 'Nazwa pola metadanych dla znacznika czasu modyfikacji. Pozostaw puste, aby używać tylko daty systemu plików.',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'Format znacznika czasu',
                desc: 'Format używany do przetwarzania znaczników czasu w metadanych. Pozostaw puste, aby użyć formatu ISO 8601.',
                helpTooltip: 'Format z Moment',
                momentLinkText: 'format Moment',
                help: 'Popularne formaty:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'Wspieraj rozwój',
                desc: 'Jeśli lubisz korzystać z Notebook Navigator, rozważ wsparcie jego dalszego rozwoju.',
                buttonText: '❤️ Wesprzyj',
                coffeeButton: '☕️ Postaw kawę'
            },
            updateCheckOnStart: {
                name: 'Sprawdź nową wersję podczas uruchamiania',
                desc: 'Sprawdza dostępność nowych wersji wtyczki podczas uruchamiania i wyświetla powiadomienie, gdy dostępna jest aktualizacja. Sprawdzanie odbywa się maksymalnie raz dziennie.',
                status: 'Nowa wersja dostępna: {version}'
            },
            debugLogging: {
                name: 'Rejestrowanie debugowania przy starcie',
                desc: 'Zapisuje diagnostykę startu w pliku Markdown ze znacznikiem czasu w katalogu głównym sejfu, a następnie zatrzymuje się po ustabilizowaniu startu. Plik może być synchronizowany i zawierać ścieżki plików.'
            },
            whatsNew: {
                name: 'Co nowego w Notebook Navigator {version}',
                desc: 'Zobacz najnowsze aktualizacje i ulepszenia',
                buttonText: 'Zobacz ostatnie aktualizacje'
            },
            masteringVideo: {
                name: 'Poradnik do Notebook Navigator (wideo)',
                desc: 'Ten film przedstawia wszystko, co jest potrzebne do wydajnej pracy w Notebook Navigator, w tym skróty klawiszowe, wyszukiwanie, tagi i ustawienia zaawansowane.'
            },
            cacheStatistics: {
                localCache: 'Lokalna pamięć podręczna',
                items: 'elementy',
                withTags: 'z tagami',
                withPreviewText: 'z tekstem podglądu',
                withFeatureImage: 'z wyróżnionym obrazem',
                withMetadata: 'z metadanymi'
            },
            metadataInfo: {
                successfullyParsed: 'Pomyślnie przetworzono elementy',
                itemsWithName: 'z nazwą',
                withCreatedDate: 'z datą utworzenia',
                withModifiedDate: 'z datą modyfikacji',
                withIcon: 'z ikonką',
                withColor: 'z kolorem',
                failedToParse: 'Nie udało się przetworzyć',
                createdDates: 'dat utworzenia',
                modifiedDates: 'dat modyfikacji',
                checkTimestampFormat: 'Sprawdź format znacznika czasu.',
                exportFailed: 'Eksportuj błędy'
            }
        }
    },
    whatsNew: {
        title: 'Co nowego w Notebook Navigator',
        openBannerImage: 'Otwórz obraz banera wydania',
        supportMessage: 'Jeśli uważasz, że Notebook Navigator jest pomocny, rozważ wsparcie jego rozwoju.',
        supportButton: 'Postaw kawę',
        thanksButton: 'Dzięki!'
    }
};
