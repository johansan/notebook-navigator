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
 * Dutch language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_NL = {
    // Common UI elements
    common: {
        cancel: 'Annuleren',
        delete: 'Verwijderen',
        clear: 'Wissen',
        remove: 'Verwijderen',
        restoreDefault: 'Standaard herstellen', // Button text for restoring values to defaults (English: Restore default)
        submit: 'Verzenden',
        save: 'Opslaan', // Button text for saving settings and dialogs (English: Save)
        configure: 'Configureren', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'Lichte modus', // Label for light theme mode (English: Light mode)
        darkMode: 'Donkere modus', // Label for dark theme mode (English: Dark mode)
        noSelection: 'Geen selectie',
        untagged: 'Zonder tags',
        featureImageAlt: 'Uitgelichte afbeelding',
        unknownError: 'Onbekende fout',
        clipboardWriteError: 'Kon niet naar klembord schrijven',
        updateBannerTitle: 'Notebook Navigator update beschikbaar',
        updateBannerInstruction: 'Werk bij in Instellingen -> Community plugins',
        previous: 'Vorige', // Generic aria label for previous navigation (English: Previous)
        next: 'Volgende' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Selecteer een map of tag om notities te bekijken',
        emptyStateNoNotes: 'Geen notities',
        pinnedSection: 'Vastgepind',
        notesSection: 'Notities',
        filesSection: 'Bestanden',
        hiddenItemAriaLabel: '{name} (verborgen)',
        collapseGroup: 'Groep samenvouwen',
        expandGroup: 'Groep uitvouwen',
        manualSortTitle: 'Handmatig sorteren: {property}',
        manualSortHint:
            'Sleep om opnieuw te ordenen. De volgorde wordt opgeslagen als numerieke indexwaarden in de eigenschap "{property}".',
        manualSortNonMarkdownHint: 'Niet-Markdown-bestanden worden onderaan getoond en kunnen niet opnieuw worden geordend.',
        unsortedSection: 'Niet gesorteerd',
        manualSortDone: 'Klaar',
        manualSortMultipleWriteFailure: '{count} bestanden mislukt; eerste: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Zonder tags',
        tags: 'Tags'
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Snelkoppelingen',
        recentFilesHeader: 'Recente bestanden', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Eigenschappen',
        reorderRootFoldersTitle: 'Navigatie herschikken',
        reorderRootFoldersHint: 'Gebruik pijlen of sleep om te herschikken',
        vaultRootLabel: 'Kluis',
        resetRootToAlpha: 'Terugzetten naar alfabetische volgorde',
        resetRootToFrequency: 'Terugzetten naar frequentievolgorde',
        pinShortcuts: 'Snelkoppelingen vastpinnen',
        pinShortcutsAndRecentFiles: 'Snelkoppelingen en recente bestanden vastpinnen',
        unpinShortcuts: 'Snelkoppelingen losmaken',
        unpinShortcutsAndRecentFiles: 'Snelkoppelingen en recente bestanden losmaken',
        profileMenuAria: 'Kluis profiel wijzigen'
    },

    navigationCalendar: {
        ariaLabel: 'Kalender',
        dailyNotesNotEnabled: 'De dagelijkse notities plugin is niet ingeschakeld.',
        createDailyNote: {
            title: 'Nieuwe dagelijkse notitie',
            message: 'Bestand {filename} bestaat niet. Wilt u het aanmaken?',
            confirmButton: 'Aanmaken'
        },
        helpModal: {
            title: 'Kalendersneltoetsen',
            items: [
                'Klik op een dag om een dagnotitie te openen of aan te maken. Weken, maanden, kwartalen en jaren werken op dezelfde manier.',
                'Een gevulde stip onder een dag betekent dat er een notitie is. Een holle stip betekent dat er onvoltooide taken zijn.',
                'Als een notitie een uitgelichte afbeelding heeft, wordt deze weergegeven als achtergrond van de dag.'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+klik op een datum om te filteren op die datum in de bestandenlijst.',
            dateFilterOptionAlt: '`Option/Alt`+klik op een datum om te filteren op die datum in de bestandenlijst.'
        }
    },

    dailyNotes: {
        templateReadFailed: 'Kan de sjabloon voor dagelijkse notities niet lezen.',
        createFailed: 'Kan dagelijkse notitie niet aanmaken.'
    },

    shortcuts: {
        folderExists: 'Map staat al in snelkoppelingen',
        noteExists: 'Notitie staat al in snelkoppelingen',
        tagExists: 'Tag staat al in snelkoppelingen',
        propertyExists: 'Eigenschap staat al in snelkoppelingen',
        invalidProperty: 'Ongeldige eigenschapssnelkoppeling',
        searchExists: 'Zoeksnelkoppeling bestaat al',
        emptySearchQuery: 'Voer een zoekopdracht in voordat u deze opslaat',
        emptySearchName: 'Voer een naam in voordat u de zoekopdracht opslaat',
        add: 'Toevoegen aan snelkoppelingen',
        addNotesCount: 'Voeg {count} notities toe aan snelkoppelingen',
        addFilesCount: 'Voeg {count} bestanden toe aan snelkoppelingen',
        rename: 'Snelkoppeling hernoemen',
        remove: 'Verwijderen uit snelkoppelingen',
        removeAll: 'Alle snelkoppelingen verwijderen',
        removeAllConfirm: 'Alle snelkoppelingen verwijderen?',
        folderNotesPinned: '{count} mapnotities vastgepind'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Items inklappen',
        expandAllFolders: 'Alle items uitklappen',
        showCalendar: 'Kalender tonen',
        hideCalendar: 'Kalender verbergen',
        newFolder: 'Nieuwe map',
        newNote: 'Nieuwe notitie',
        mobileBackToNavigation: 'Terug naar navigatie',
        changeChildSortOrder: 'Sorteervolgorde wijzigen',
        changeSortAndGroup: 'Sortering en groepering wijzigen',
        resetViewToDefaults: 'Weergave terugzetten naar standaardwaarden',
        manualSort: 'Handmatig sorteren',
        editSortOrder: 'Sorteervolgorde bewerken...',
        removeSortProperty: 'Sorteereigenschap verwijderen',
        descendants: 'subelementen',
        subfolders: 'submappen',
        subtags: 'subtags',
        childValues: 'onderliggende waarden',
        applySortAndGroupToDescendants: (target: string) => `Sortering en groepering toepassen op ${target}`,
        applyAppearanceToDescendants: (target: string) => `Weergave toepassen op ${target}`,
        showFolders: 'Navigatie tonen',
        reorderRootFolders: 'Navigatie herschikken',
        finishRootFolderReorder: 'Klaar',
        showExcludedItems: 'Verborgen mappen, tags en notities tonen',
        hideExcludedItems: 'Verborgen mappen, tags en notities verbergen',
        showDualPane: 'Dubbel paneel tonen',
        showSinglePane: 'Enkel paneel tonen',
        dualPaneAutoFallbackNotice:
            'Dubbele panelen zijn niet beschikbaar wanneer de zijbalk te smal is. Stel "Wanneer de zijbalk te smal is" in op "Niets doen" in Instellingen > Uiterlijk & gedrag om dit te wijzigen.',
        changeAppearance: 'Uiterlijk wijzigen',
        showNotesFromSubfolders: 'Notities uit submappen tonen',
        showFilesFromSubfolders: 'Bestanden uit submappen tonen',
        showNotesFromDescendants: 'Notities uit afstammelingen tonen',
        showFilesFromDescendants: 'Bestanden uit afstammelingen tonen',
        search: 'Zoeken'
    },

    // Search input
    searchInput: {
        placeholder: 'Zoeken...',
        placeholderVault: 'Kluis doorzoeken...',
        placeholderOmnisearch: 'Omnisearch...',
        clearSearch: 'Zoekopdracht wissen',
        switchToFilterSearch: 'Overschakelen naar filterzoeken',
        switchToOmnisearch: 'Overschakelen naar Omnisearch',
        saveSearchShortcut: 'Zoeksnelkoppeling opslaan',
        removeSearchShortcut: 'Zoeksnelkoppeling verwijderen',
        shortcutModalTitle: 'Zoeksnelkoppeling opslaan',
        shortcutNamePlaceholder: 'Voer naam snelkoppeling in',
        shortcutStartIn: 'Altijd starten in: {path}',
        searchHelp: 'Zoeksyntax',
        searchHelpTitle: 'Zoeksyntax',
        searchHelpModal: {
            intro: 'Combineer bestandsnamen, eigenschappen, tags, datums en filters in één zoekopdracht (bijv. `meeting .status=active #work @thisweek`). Installeer de Omnisearch-plugin om zoeken in volledige tekst te gebruiken.',
            introSwitching:
                'Schakel tussen filterzoeken en Omnisearch met de pijltoetsen omhoog/omlaag of door op het zoekpictogram te klikken.',
            sections: {
                fileNames: {
                    title: 'Bestandsnamen',
                    items: [
                        '`word` Notities met "word" in de bestandsnaam vinden.',
                        '`word1 word2` Elk woord moet overeenkomen met de bestandsnaam.',
                        '`-word` Notities met "word" in de bestandsnaam uitsluiten.'
                    ]
                },
                tags: {
                    title: 'Tags',
                    items: [
                        '`#tag` Notities met tag opnemen (vindt ook geneste tags zoals `#tag/subtag`).',
                        '`#` Alleen notities met tags opnemen.',
                        '`-#tag` Notities met tag uitsluiten.',
                        '`-#` Alleen notities zonder tags opnemen.',
                        '`#tag1 #tag2` Beide tags vinden (impliciete AND).',
                        '`#tag1 AND #tag2` Beide tags vinden (expliciete AND).',
                        '`#tag1 OR #tag2` Een van beide tags vinden.',
                        '`#a OR #b AND #c` AND heeft hogere prioriteit: vindt `#a`, of beide `#b` en `#c`.',
                        'Cmd/Ctrl+Klik op een tag om toe te voegen met AND. Cmd/Ctrl+Shift+Klik om toe te voegen met OR.'
                    ]
                },
                properties: {
                    title: 'Eigenschappen',
                    items: [
                        '`.key` Notities met eigenschapssleutel opnemen.',
                        '`.key=value` Notities opnemen waarvan de eigenschapswaarde `value` bevat.',
                        '`."Reading Status"` Notities opnemen met een eigenschapssleutel die spaties bevat.',
                        '`."Reading Status"="In Progress"` Sleutels en waarden met spaties moeten tussen dubbele aanhalingstekens staan.',
                        '`-.key` Notities met eigenschapssleutel uitsluiten.',
                        '`-.key=value` Notities uitsluiten waarvan de eigenschapswaarde `value` bevat.',
                        'Cmd/Ctrl+Klik op een eigenschap om toe te voegen met AND. Cmd/Ctrl+Shift+Klik om toe te voegen met OR.'
                    ]
                },
                tasks: {
                    title: 'Filters',
                    items: [
                        '`has:task` Notities met onvoltooide taken opnemen.',
                        '`-has:task` Notities met onvoltooide taken uitsluiten.',
                        '`folder:meetings` Notities opnemen waarvan een mapnaam `meetings` bevat.',
                        '`folder:/work/meetings` Notities alleen in `work/meetings` opnemen (geen submappen).',
                        '`folder:/` Notities alleen in de vault-root opnemen.',
                        '`-folder:archive` Notities uitsluiten waarvan een mapnaam `archive` bevat.',
                        '`-folder:/archive` Notities alleen in `archive` uitsluiten (geen submappen).',
                        '`ext:md` Notities met extensie `md` opnemen (`ext:.md` wordt ook ondersteund).',
                        '`-ext:pdf` Notities met extensie `pdf` uitsluiten.',
                        'Combineer met tags, namen en datums (bijvoorbeeld: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'AND/OR-gedrag',
                    items: [
                        "`AND` en `OR` zijn alleen operatoren in query's met uitsluitend tags en eigenschappen.",
                        "Query's met uitsluitend tags en eigenschappen bevatten alleen tag- en eigenschapsfilters: `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`.",
                        'Als een zoekopdracht namen, datums (`@...`), taakfilters (`has:task`), mapfilters (`folder:...`) of extensiefilters (`ext:...`) bevat, worden `AND` en `OR` als woorden gezocht.',
                        'Voorbeeld operatorquery: `#work OR .status=started`.',
                        'Voorbeeld gemengde zoekopdracht: `#work OR ext:md` (`OR` wordt gezocht in bestandsnamen).'
                    ]
                },
                dates: {
                    title: 'Datums',
                    items: [
                        '`@today` Notities van vandaag vinden met het standaard datumveld.',
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` Relatieve datumbereiken.',
                        '`@2026-02-07` Een specifieke dag vinden (ondersteunt ook `@20260207`).',
                        '`@2026` Een kalenderjaar vinden.',
                        '`@2026-02` of `@202602` Een kalendermaand vinden.',
                        '`@2026-W05` of `@2026W05` Een ISO-week vinden.',
                        '`@2026-Q2` of `@2026Q2` Een kalenderkwartaal vinden.',
                        '`@13/02/2026` Numerieke formaten met scheidingstekens (`@07022026` volgt uw landinstelling bij onduidelijkheid).',
                        '`@2026-02-01..2026-02-07` Een inclusief dagenbereik vinden (open einden ondersteund).',
                        '`@c:...` of `@m:...` Aanmaak- of wijzigingsdatum targeten.',
                        '`-@...` Een datumovereenkomst uitsluiten.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'Zoeken in volledige tekst door de hele vault, gefilterd op de huidige map of geselecteerde tags.',
                        'Kan traag zijn met minder dan 3 tekens in grote vaults.',
                        'Kan geen paden met niet-ASCII-tekens doorzoeken of subpaden correct doorzoeken.',
                        'Geeft beperkte resultaten terug vóór mapfiltering, waardoor relevante bestanden mogelijk niet verschijnen als er elders veel overeenkomsten bestaan.',
                        'Notitievoorbeelden tonen Omnisearch-fragmenten in plaats van de standaard voorbeeldtekst.'
                    ]
                }
            }
        }
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'Openen in nieuw tabblad',
            openToRight: 'Openen aan de rechterkant',
            openInNewWindow: 'Openen in nieuw venster',
            openMultipleInNewTabs: '{count} notities openen in nieuwe tabbladen',
            openMultipleFilesInNewTabs: '{count} bestanden openen in nieuwe tabbladen',
            openMultipleToRight: '{count} notities openen aan de rechterkant',
            openMultipleFilesToRight: '{count} bestanden openen aan de rechterkant',
            openMultipleInNewWindows: '{count} notities openen in nieuwe vensters',
            openMultipleFilesInNewWindows: '{count} bestanden openen in nieuwe vensters',
            pinNote: 'Notitie vastpinnen',
            pinFile: 'Bestand vastpinnen',
            unpinNote: 'Notitie losmaken',
            unpinFile: 'Bestand losmaken',
            pinMultipleNotes: '{count} notities vastpinnen',
            pinMultipleFiles: '{count} bestanden vastpinnen',
            unpinMultipleNotes: '{count} notities losmaken',
            unpinMultipleFiles: '{count} bestanden losmaken',
            duplicateNote: 'Notitie dupliceren',
            duplicateFile: 'Bestand dupliceren',
            duplicateMultipleNotes: '{count} notities dupliceren',
            duplicateMultipleFiles: '{count} bestanden dupliceren',
            openVersionHistory: 'Versiegeschiedenis openen',
            revealInFolder: 'Tonen in map',
            revealInFinder: 'Tonen in Finder',
            showInExplorer: 'Tonen in systeemverkenner',
            openInDefaultApp: 'Openen in standaardapp',
            renameNote: 'Notitie hernoemen',
            renameFile: 'Bestand hernoemen',
            deleteNote: 'Notitie verwijderen',
            deleteFile: 'Bestand verwijderen',
            setCalendarHighlight: 'Markering instellen',
            removeCalendarHighlight: 'Markering verwijderen',
            deleteMultipleNotes: '{count} notities verwijderen',
            deleteMultipleFiles: '{count} bestanden verwijderen',
            moveNoteToFolder: 'Notitie verplaatsen naar...',
            moveFileToFolder: 'Bestand verplaatsen naar...',
            moveMultipleNotesToFolder: '{count} notities verplaatsen naar...',
            moveMultipleFilesToFolder: '{count} bestanden verplaatsen naar...',
            mergeNotes: '{count} notities samenvoegen...',
            mergeNotesInGroup: 'Notities in groep samenvoegen...',
            setManualSortGroupHeader: 'Groepskop instellen',
            changeManualSortGroupHeader: 'Groepskop wijzigen',
            manualSortGroupHeader: {
                title: 'Groepskop',
                copyStyle: 'Kopstijl kopiëren',
                pasteStyle: 'Kopstijl plakken',
                remove: 'Groepskop verwijderen'
            },
            addTag: 'Tag toevoegen',
            addPropertyKey: 'Eigenschap instellen',
            removeTag: 'Tag verwijderen',
            removeAllTags: 'Alle tags verwijderen',
            changeIcon: 'Pictogram wijzigen',
            changeColor: 'Kleur wijzigen'
        },
        folder: {
            newNote: 'Nieuwe notitie',
            newNoteFromTemplate: 'Nieuwe notitie uit sjabloon',
            newFolder: 'Nieuwe map',
            newCanvas: 'Nieuw canvas',
            newBase: 'Nieuwe base',
            newDrawing: 'Nieuwe tekening',
            newExcalidrawDrawing: 'Nieuwe Excalidraw-tekening',
            newTldrawDrawing: 'Nieuwe Tldraw-tekening',
            duplicateFolder: 'Map dupliceren',
            searchInFolder: 'Zoeken in map',
            createFolderNote: 'Mapnotitie maken',
            detachFolderNote: 'Mapnotitie loskoppelen',
            deleteFolderNote: 'Mapnotitie verwijderen',
            changeIcon: 'Pictogram wijzigen',
            changeColor: 'Kleur wijzigen',
            changeBackground: 'Achtergrond wijzigen',
            excludeFolder: 'Map verbergen',
            unhideFolder: 'Map zichtbaar maken',
            excludeFromDescendants: 'Verbergen in bovenliggende mappen',
            includeInDescendants: 'Weergeven in bovenliggende mappen',
            hiddenFromParentsIndicator: 'Verborgen in lijsten van bovenliggende mappen',
            moveFolder: 'Map verplaatsen naar...',
            renameFolder: 'Map hernoemen',
            deleteFolder: 'Map verwijderen'
        },
        tag: {
            changeIcon: 'Pictogram wijzigen',
            changeColor: 'Kleur wijzigen',
            changeBackground: 'Achtergrond wijzigen',
            showTag: 'Tag tonen',
            hideTag: 'Tag verbergen'
        },
        property: {
            addKey: 'Eigenschapssleutels configureren',
            renameKey: 'Eigenschap hernoemen',
            deleteKey: 'Eigenschap verwijderen'
        },
        navigation: {
            addSeparator: 'Scheidingslijn toevoegen',
            removeSeparator: 'Scheidingslijn verwijderen'
        },
        copyPath: {
            title: 'Pad kopiëren',
            asObsidianUrl: 'als Obsidian URL',
            fromVaultFolder: 'vanuit vault-map',
            fromSystemRoot: 'vanaf systeemroot'
        },
        style: {
            title: 'Stijl',
            copy: 'Stijl kopiëren',
            paste: 'Stijl plakken',
            removeIcon: 'Pictogram verwijderen',
            removeColor: 'Kleur verwijderen',
            removeBackground: 'Achtergrond verwijderen',
            clear: 'Stijl wissen'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        appearance: 'Uiterlijk',
        sortBy: 'Sorteren op',
        standardPreset: 'Standaard',
        compactPreset: 'Compact',
        defaultSuffix: '(standaard)',
        defaultLabel: 'Standaard',
        titleRows: 'Titelrijen',
        previewRows: 'Voorbeeldrijen',
        groupBy: 'Groeperen op',
        titleRowOption: (rows: number) => `${rows} titelrij${rows === 1 ? '' : 'en'}`,
        previewRowOption: (rows: number) => `${rows} voorbeeldrij${rows === 1 ? '' : 'en'}`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Toepassen',
            applySortAndGroupTitle: (target: string) => `Sortering en groepering toepassen op ${target}?`,
            applyAppearanceTitle: (target: string) => `Weergave toepassen op ${target}?`,
            affectedCountMessage: (count: number) => `Bestaande overschrijvingen die wijzigen: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'Handmatig sorteren gebruiken?',
            propertySortMessage: (property: string, count: number) =>
                `Dit schakelt de huidige weergave over naar handmatig sorteren met "${property}". Bij het bewerken van de volgorde worden indien nodig numerieke indexwaarden naar die eigenschap geschreven in ${count} ${count === 1 ? 'notitie' : 'notities'}.`,
            propertySortConfirmButton: 'Handmatig sorteren gebruiken',
            removePropertyTitle: 'Sorteereigenschap verwijderen?',
            removePropertyMessage: (property: string, count: number) =>
                `Dit verwijdert "${property}" uit ${count} ${count === 1 ? 'notitie' : 'notities'} in de huidige lijst. Voor die notities wordt de handmatige sorteervolgorde gewist.`,
            removePropertyConfirmButton: 'Eigenschap verwijderen',
            compactTitle: 'Indexwaarden comprimeren?',
            compactMessage: (count: number) =>
                `Deze herordening heeft meer numerieke ruimte nodig. ${count} ${count === 1 ? 'notitie krijgt' : 'notities krijgen'} nieuwe indexwaarden.`,
            compactConfirmButton: 'Indexwaarden comprimeren'
        },
        manualSortGroupHeader: {
            title: 'Groepskop instellen',
            titleLabel: 'Titel',
            placeholder: 'Groepskop',
            icon: 'Pictogram',
            color: 'Kleur',
            wordCount: 'Aantal woorden tonen',
            wordCountTarget: 'Doel aantal woorden',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'Wanneer dit veld leeg is, gebruikt het groepsdoel de doeleigenschap die is ingesteld in Instellingen > Notities > Aantal woorden en tekens. Overschrijf dit door een doelwaarde voor deze groep in te stellen.',
            description: 'Pas de groepskop voor deze notitie aan. Laat de titel leeg om de kop te verwijderen.'
        },
        mergeNotes: {
            title: 'Notities samenvoegen',
            summary: 'Maak één notitie van {count} notities in {folder}.',
            frontmatterRule: 'Frontmatter van de eerste notitie blijft behouden. Frontmatter van de andere notities wordt verwijderd.',
            crossFolderWarning:
                'Bronnotities staan in verschillende mappen. Relatieve links en embeds werken mogelijk niet meer in de samengevoegde notitie.',
            outputName: 'Uitvoernaam',
            outputNameDesc: 'De samengevoegde notitie wordt gemaakt in de hierboven weergegeven map.',
            outputNamePlaceholder: 'Samengevoegde notities',
            separator: 'Scheiding',
            separatorDesc: 'Ingevoegd tussen notities.',
            separatorOptions: {
                none: 'Geen',
                blankLine: 'Lege regel',
                horizontalRule: 'Horizontale lijn',
                heading: 'Kop met notitietitel'
            },
            moveSourcesToTrash: 'Bronnotities naar prullenbak verplaatsen na samenvoegen',
            mergeButton: 'Samenvoegen'
        },
        navRainbowSection: {
            title: (section: string) => `Regenboogkleuren: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'Pictogrammen zoeken...',
            recentlyUsedHeader: 'Recent gebruikt',
            emptyStateSearch: 'Begin met typen om pictogrammen te zoeken',
            emptyStateNoResults: 'Geen pictogrammen gevonden',
            showingResultsInfo: '50 van {count} resultaten weergegeven. Typ meer om te verfijnen.',
            emojiInstructions: 'Typ of plak een emoji om deze als pictogram te gebruiken',
            removeIcon: 'Pictogram verwijderen',
            removeFromRecents: 'Verwijderen uit recent',
            allTabLabel: 'Alle'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Regel toevoegen'
        },
        interfaceIcons: {
            title: 'Interface-iconen',
            fileItemsSection: 'Bestandsitems',
            items: {
                'nav-shortcuts': 'Snelkoppelingen',
                'nav-recent-files': 'Recente bestanden',
                'nav-expand-all': 'Alles uitvouwen',
                'nav-collapse-all': 'Alles invouwen',
                'nav-calendar': 'Kalender',
                'nav-tree-expand': 'Boompijl: uitvouwen',
                'nav-tree-collapse': 'Boompijl: invouwen',
                'nav-hidden-items': 'Verborgen items',
                'nav-root-reorder': 'Hoofdmappen herschikken',
                'nav-new-folder': 'Nieuwe map',
                'nav-show-single-pane': 'Enkel paneel tonen',
                'nav-show-dual-pane': 'Dubbel paneel tonen',
                'nav-profile-chevron': 'Profielmenu-pijl',
                'list-search': 'Zoeken',
                'list-reveal-file': 'Bestand tonen',
                'list-descendants': 'Notities uit submappen',
                'list-sort-ascending': 'Sorteervolgorde: oplopend',
                'list-sort-descending': 'Sorteervolgorde: aflopend',
                'list-sort-modified': 'Sorteren op bewerkingsdatum',
                'list-sort-created': 'Sorteren op aanmaakdatum',
                'list-sort-title': 'Sorteren op titel',
                'list-sort-filename': 'Sorteren op bestandsnaam',
                'list-sort-property': 'Sorteren op eigenschap',
                'list-appearance': 'Uiterlijk wijzigen',
                'list-new-note': 'Nieuwe notitie',
                'list-pinned': 'Vastgezette notities',
                'nav-folder-open': 'Map open',
                'nav-folder-closed': 'Map gesloten',
                'nav-tags': 'Tags',
                'nav-tag': 'Tag',
                'nav-properties': 'Eigenschappen',
                'nav-property': 'Eigenschap',
                'nav-property-value': 'Waarde',
                'file-unfinished-task': 'Onvoltooide taken',
                'file-word-count': 'Aantal woorden',
                'file-character-count': 'Aantal tekens'
            }
        },
        colorPicker: {
            currentColor: 'Huidig',
            newColor: 'Nieuw',
            paletteDefault: 'Standaard',
            paletteCustom: 'Aangepast',
            copyColors: 'Kleur kopiëren',
            colorsCopied: 'Kleur gekopieerd naar klembord',
            pasteColors: 'Kleur plakken',
            pasteClipboardError: 'Kan klembord niet lezen',
            pasteInvalidFormat: 'Een hex kleurwaarde verwacht',
            colorsPasted: 'Kleur succesvol geplakt',
            resetUserColors: 'Aangepaste kleuren wissen',
            clearCustomColorsConfirm: 'Alle aangepaste kleuren verwijderen?',
            userColorSlot: 'Kleur {slot}',
            recentColors: 'Recente kleuren',
            clearRecentColors: 'Recente kleuren wissen',
            removeRecentColor: 'Kleur verwijderen',
            apply: 'Toepassen',
            pickerLabel: 'Kiezer',
            hexLabel: 'HEX',
            hexInputLabel: 'Hex-kleurwaarde',
            saturationValueArea: 'Verzadiging en helderheid',
            hueSlider: 'Tint',
            alphaSlider: 'Transparantie'
        },
        appearance: {
            tabIcon: 'Pictogram',
            tabColor: 'Kleur',
            tabBackground: 'Achtergrond',
            resetIcon: 'Pictogram verwijderen',
            resetColor: 'Kleur verwijderen',
            resetBackground: 'Achtergrond verwijderen',
            clear: 'Stijl wissen',
            apply: 'Toepassen'
        },
        selectVaultProfile: {
            title: 'Kluisprofiel wijzigen',
            currentBadge: 'Actief',
            emptyState: 'Geen kluisprofielen beschikbaar.'
        },
        tagOperation: {
            renameTitle: 'Tag {tag} hernoemen',
            deleteTitle: 'Tag {tag} verwijderen',
            newTagPrompt: 'Nieuwe tagnaam',
            newTagPlaceholder: 'Voer nieuwe tagnaam in',
            renameWarning: 'Het hernoemen van tag {oldTag} wijzigt {count} {files}.',
            deleteWarning: 'Het verwijderen van tag {tag} wijzigt {count} {files}.',
            modificationWarning: 'Dit werkt de wijzigingsdatums van bestanden bij.',
            affectedFiles: 'Betreffende bestanden:',
            andMore: '...en {count} meer',
            confirmRename: 'Tag hernoemen',
            renameUnchanged: '{tag} niet gewijzigd',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            renameBatchNotFinalized:
                'Hernoemd {renamed}/{total}. Niet bijgewerkt: {notUpdated}. Metadata en snelkoppelingen zijn niet bijgewerkt.',
            invalidTagName: 'Voer een geldige tagnaam in.',
            descendantRenameError: 'Een tag kan niet in zichzelf of een afstammeling worden verplaatst.',
            confirmDelete: 'Tag verwijderen',
            deleteBatchNotFinalized:
                'Verwijderd uit {removed}/{total}. Niet bijgewerkt: {notUpdated}. Metadata en snelkoppelingen zijn niet bijgewerkt.',
            checkConsoleForDetails: 'Controleer de console voor details.',
            file: 'bestand',
            files: 'bestanden',
            inlineParsingWarning: {
                title: 'Inline-tagcompatibiliteit',
                message: '{tag} bevat tekens die Obsidian niet kan verwerken in inline-tags. Frontmatter-tags worden niet beïnvloed.',
                confirm: 'Toch gebruiken'
            }
        },
        propertyOperation: {
            renameTitle: 'Eigenschap {property} hernoemen',
            deleteTitle: 'Eigenschap {property} verwijderen',
            newKeyPrompt: 'Nieuwe eigenschapnaam',
            newKeyPlaceholder: 'Voer de nieuwe eigenschapnaam in',
            renameWarning: 'Het hernoemen van eigenschap {property} wijzigt {count} {files}.',
            renameConflictWarning:
                'Eigenschap {newKey} bestaat al in {count} {files}. Het hernoemen van {oldKey} vervangt bestaande {newKey}-waarden.',
            deleteWarning: 'Het verwijderen van eigenschap {property} wijzigt {count} {files}.',
            confirmRename: 'Eigenschap hernoemen',
            confirmDelete: 'Eigenschap verwijderen',
            renameNoChanges: '{oldKey} → {newKey} (geen wijzigingen)',
            renameSettingsUpdateFailed: 'Eigenschap {oldKey} → {newKey} hernoemd. Instellingen konden niet worden bijgewerkt.',
            deleteSingleSuccess: 'Eigenschap {property} verwijderd uit 1 notitie',
            deleteMultipleSuccess: 'Eigenschap {property} verwijderd uit {count} notities',
            deleteSettingsUpdateFailed: 'Eigenschap {property} verwijderd. Instellingen konden niet worden bijgewerkt.',
            invalidKeyName: 'Voer een geldige eigenschapnaam in.'
        },
        fileSystem: {
            newFolderTitle: 'Nieuwe map',
            renameFolderTitle: 'Map hernoemen',
            renameFileTitle: 'Bestand hernoemen',
            deleteFolderTitle: "'{name}' verwijderen?",
            deleteFileTitle: "'{name}' verwijderen?",
            deleteFileAttachmentsTitle: 'Bestandsbijlagen verwijderen?',
            moveFileConflictTitle: 'Verplaatsingsconflict',
            folderNamePrompt: 'Voer mapnaam in:',
            hideInOtherVaultProfiles: 'Verbergen in andere kluisprofielen',
            renamePrompt: 'Voer nieuwe naam in:',
            renameVaultTitle: 'Weergavenaam kluis wijzigen',
            renameVaultPrompt: 'Voer aangepaste weergavenaam in (laat leeg voor standaard):',
            deleteFolderConfirm: 'Weet u zeker dat u deze map en alle inhoud wilt verwijderen?',
            deleteFileConfirm: 'Weet u zeker dat u dit bestand wilt verwijderen?',
            deleteFileAttachmentsDescriptionSingle: 'Deze bijlage wordt niet meer gebruikt in notities. Wilt u deze verwijderen?',
            deleteFileAttachmentsDescriptionMultiple: 'Deze bijlagen worden niet meer gebruikt in notities. Wilt u ze verwijderen?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Bestandsboom',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Galerij',
            moveFileConflictDescriptionSingle: 'Een bestandsconflict is gevonden in "{folder}".',
            moveFileConflictDescriptionMultiple: '{count} bestandsconflicten zijn gevonden in "{folder}".',
            moveFileConflictAffectedFiles: 'Betrokken bestanden',
            moveFileConflictItem: '"{name}" -> "{suggested}"{renameOnly}',
            moveFileConflictRenameOnly: '(alleen hernoemen)',
            moveFileConflictRename: 'Hernoemen',
            moveFileConflictOverwrite: 'Overschrijven',
            removeAllTagsTitle: 'Alle tags verwijderen',
            removeAllTagsFromNote: 'Weet u zeker dat u alle tags van deze notitie wilt verwijderen?',
            removeAllTagsFromNotes: 'Weet u zeker dat u alle tags van {count} notities wilt verwijderen?'
        },
        folderNoteType: {
            title: 'Selecteer type mapnotitie',
            folderLabel: 'Map: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `Verplaats ${name} naar map...`,
            multipleFilesLabel: (count: number) => `${count} bestanden`,
            navigatePlaceholder: 'Navigeren naar map...',
            instructions: {
                navigate: 'om te navigeren',
                move: 'om te verplaatsen',
                select: 'om te selecteren',
                dismiss: 'om te sluiten'
            }
        },
        homepage: {
            placeholder: 'Bestanden zoeken...',
            instructions: {
                navigate: 'om te navigeren',
                select: 'om startpagina in te stellen',
                dismiss: 'om te sluiten'
            }
        },
        calendarTemplate: {
            placeholder: 'Sjablonen zoeken...',
            instructions: {
                navigate: 'om te navigeren',
                select: 'om sjabloon te selecteren',
                dismiss: 'om te sluiten'
            }
        },
        navigationBanner: {
            placeholder: 'Afbeeldingen zoeken...',
            svgMissingDimensions: 'Het geselecteerde SVG-bestand definieert geen breedte, hoogte of viewBox.',
            instructions: {
                navigate: 'om te navigeren',
                select: 'om banner in te stellen',
                dismiss: 'om te sluiten'
            }
        },
        tagSuggest: {
            navigatePlaceholder: 'Navigeren naar tag...',
            addPlaceholder: 'Zoeken naar tag om toe te voegen...',
            removePlaceholder: 'Selecteer tag om te verwijderen...',
            createNewTag: 'Nieuwe tag maken: #{tag}',
            instructions: {
                navigate: 'om te navigeren',
                select: 'om te selecteren',
                dismiss: 'om te sluiten',
                add: 'om tag toe te voegen',
                remove: 'om tag te verwijderen'
            }
        },
        propertySuggest: {
            placeholder: 'Eigenschap selecteren...',
            navigatePlaceholder: 'Navigeer naar eigenschap...',
            instructions: {
                navigate: 'om te navigeren',
                select: 'om eigenschap toe te voegen',
                dismiss: 'om te sluiten'
            }
        },
        propertyKeyVisibility: {
            title: 'Zichtbaarheid van eigenschapssleutels',
            description:
                'Bepaal waar eigenschapswaarden worden weergegeven. De kolommen komen overeen met het navigatiepaneel, het lijstpaneel en het contextmenu van bestanden. Gebruik de onderste rij om alle rijen in een kolom om te schakelen.',
            searchPlaceholder: 'Eigenschapssleutels zoeken...',
            propertyColumnLabel: 'Eigenschap',
            showInNavigation: 'Tonen in navigatie',
            showInList: 'Tonen in lijst',
            showInFileMenu: 'Tonen in bestandsmenu',
            toggleAllInNavigation: 'Alles in navigatie omschakelen',
            toggleAllInList: 'Alles in lijst omschakelen',
            toggleAllInFileMenu: 'Alles in bestandsmenu omschakelen',
            applyButton: 'Toepassen',
            emptyState: 'Geen eigenschapssleutels gevonden.'
        },
        welcome: {
            title: 'Welkom bij {pluginName}',
            introText:
                'Hallo! Voordat je begint, raad ik je sterk aan om de eerste vijf minuten van de onderstaande video te bekijken om te begrijpen hoe de panelen en de schakelaar "Notities uit submappen weergeven" werken.',
            continueText:
                'Als je nog vijf minuten hebt, bekijk dan de rest van de video om de compacte weergavemodi te begrijpen en hoe je snelkoppelingen en belangrijke sneltoetsen correct instelt.',
            thanksText: 'Heel erg bedankt voor het downloaden en veel plezier!',
            videoAlt: 'Notebook Navigator installeren en beheersen',
            openVideoButton: 'Video afspelen',
            closeButton: 'Misschien later'
        }
    },

    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Kan map niet maken: {error}',
            createFile: 'Kan bestand niet maken: {error}',
            renameFolder: 'Kan map niet hernoemen: {error}',
            renameFolderNoteConflict: 'Kan niet hernoemen: "{name}" bestaat al in deze map',
            renameFile: 'Kan bestand niet hernoemen: {error}',
            deleteFolder: 'Kan map niet verwijderen: {error}',
            deleteFile: 'Kan bestand niet verwijderen: {error}',
            deleteAttachments: 'Kan bijlagen niet verwijderen: {error}',
            mergeNotes: 'Kan notities niet samenvoegen: {error}',
            mergeNotesOpenOutput:
                'Samengevoegde notitie gemaakt als {name}, maar deze kon niet worden geopend: {error}. Bronnotities zijn niet gewijzigd.',
            mergeNotesOpenSkipped: 'Een ander verzoek om een bestand te openen kreeg voorrang.',
            mergeNotesTrashSources: 'Samengevoegde notitie gemaakt. Kan {count} bronnotities niet naar prullenbak verplaatsen.',
            duplicateNote: 'Kan notitie niet dupliceren: {error}',
            duplicateFolder: 'Kan map niet dupliceren: {error}',
            openVersionHistory: 'Kan versiegeschiedenis niet openen: {error}',
            versionHistoryNotFound: 'Versiegeschiedenis commando niet gevonden. Zorg dat Obsidian Sync is ingeschakeld.',
            revealInExplorer: 'Kan bestand niet tonen in systeemverkenner: {error}',
            openInDefaultApp: 'Kan niet openen in standaardapp: {error}',
            openInDefaultAppNotAvailable: 'Openen in standaardapp is niet beschikbaar op dit platform',
            folderNoteAlreadyExists: 'Mapnotitie bestaat al',
            folderAlreadyExists: 'Map "{name}" bestaat al',
            folderNotesDisabled: 'Schakel mapnotities in via instellingen om bestanden te converteren',
            folderNoteAlreadyLinked: 'Dit bestand fungeert al als mapnotitie',
            folderNoteNotFound: 'Geen mapnotitie in de geselecteerde map',
            folderNoteUnsupportedExtension: 'Niet-ondersteunde bestandsextensie: {extension}',
            folderNoteMoveFailed: 'Kan bestand niet verplaatsen tijdens conversie: {error}',
            folderNoteRenameConflict: 'Een bestand met de naam "{name}" bestaat al in de map',
            folderNoteConversionFailed: 'Kan bestand niet converteren naar mapnotitie',
            folderNoteConversionFailedWithReason: 'Kan bestand niet converteren naar mapnotitie: {error}',
            folderNoteOpenFailed: 'Bestand geconverteerd maar kan mapnotitie niet openen: {error}',
            failedToDeleteFile: 'Kan {name} niet verwijderen: {error}',
            failedToDeleteMultipleFiles: 'Kan {count} bestanden niet verwijderen',
            versionHistoryNotAvailable: 'Versiegeschiedenis niet beschikbaar',
            drawingAlreadyExists: 'Een tekening met deze naam bestaat al',
            failedToCreateDrawing: 'Kan tekening niet maken',
            noFolderSelected: 'Geen map geselecteerd in Notebook Navigator',
            noFileSelected: 'Geen bestand geselecteerd'
        },
        warnings: {
            linkBreakingNameCharacters: 'Deze naam bevat tekens die Obsidian-links verbreken: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'Namen mogen niet met een punt beginnen of : of / bevatten.',
            forbiddenNameCharactersWindows: 'Door Windows gereserveerde tekens zijn niet toegestaan: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'Map verborgen: {name}',
            showFolder: 'Map zichtbaar: {name}',
            folderExcludedFromDescendants: 'Verborgen in lijsten van bovenliggende mappen: {name}',
            folderIncludedInDescendants: 'Weergegeven in lijsten van bovenliggende mappen: {name}',
            mergeNotes: '{count} notities samengevoegd in {name}'
        },
        notifications: {
            deletedMultipleFiles: '{count} bestanden verwijderd',
            movedMultipleFiles: '{count} bestanden verplaatst naar {folder}',
            folderNoteConversionSuccess: 'Bestand geconverteerd naar mapnotitie in "{name}"',
            folderMoved: 'Map "{name}" verplaatst',
            deepLinkCopied: 'Obsidian URL gekopieerd naar klembord',
            pathCopied: 'Pad gekopieerd naar klembord',
            relativePathCopied: 'Relatief pad gekopieerd naar klembord',
            tagAddedToNote: 'Tag toegevoegd aan 1 notitie',
            tagAddedToNotes: 'Tag toegevoegd aan {count} notities',
            tagRemovedFromNote: 'Tag verwijderd van 1 notitie',
            tagRemovedFromNotes: 'Tag verwijderd van {count} notities',
            tagsClearedFromNote: 'Alle tags verwijderd van 1 notitie',
            tagsClearedFromNotes: 'Alle tags verwijderd van {count} notities',
            noTagsToRemove: 'Geen tags om te verwijderen',
            noFilesSelected: 'Geen bestanden geselecteerd',
            mergeNotesRequireMultipleMarkdown: 'Selecteer ten minste twee Markdown-notities om samen te voegen',
            tagOperationsNotAvailable: 'Tagbewerkingen niet beschikbaar',
            propertyOperationsNotAvailable: 'Eigenschapbewerkingen niet beschikbaar',
            tagsRequireMarkdown: 'Tags worden alleen ondersteund op Markdown-notities',
            propertiesRequireMarkdown: 'Eigenschappen worden alleen ondersteund in Markdown-notities',
            propertySetOnNote: 'Eigenschap bijgewerkt op 1 notitie',
            propertySetOnNotes: 'Eigenschap bijgewerkt op {count} notities',
            manualSortPropertyRemovedFromNote: 'Sorteereigenschap verwijderd uit 1 notitie',
            manualSortPropertyRemovedFromNotes: 'Sorteereigenschap verwijderd uit {count} notities',
            iconPackDownloaded: '{provider} gedownload',
            iconPackUpdated: '{provider} bijgewerkt ({version})',
            iconPackRemoved: '{provider} verwijderd',
            iconPackLoadFailed: 'Kan {provider} niet laden',
            hiddenFileReveal: 'Bestand is verborgen. Schakel "Verborgen items tonen" in om het weer te geven'
        },
        confirmations: {
            deleteMultipleFiles: 'Weet u zeker dat u {count} bestanden wilt verwijderen?',
            deleteConfirmation: 'Deze actie kan niet ongedaan worden gemaakt.'
        },
        defaultNames: {
            untitled: 'Zonder titel'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Kan een map niet in zichzelf of een submap verplaatsen.',
            itemAlreadyExists: 'Een item met de naam "{name}" bestaat al op deze locatie.',
            failedToMove: 'Verplaatsen mislukt: {error}',
            failedToAddTag: 'Kan tag "{tag}" niet toevoegen',
            failedToSetProperty: 'Kan eigenschap niet bijwerken: {error}',
            failedToClearTags: 'Kan tags niet wissen',
            failedToMoveFolder: 'Kan map "{name}" niet verplaatsen',
            failedToImportFiles: 'Importeren mislukt: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} bestanden bestaan al op de bestemming',
            filesAlreadyHaveTag: '{count} bestanden hebben deze tag of een specifiekere al',
            filesAlreadyHaveProperty: '{count} bestanden hebben deze eigenschap al',
            noTagsToClear: 'Geen tags om te wissen',
            fileImported: '1 bestand geïmporteerd',
            filesImported: '{count} bestanden geïmporteerd'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'Vandaag',
        yesterday: 'Gisteren',
        previous7Days: 'Afgelopen 7 dagen',
        previous30Days: 'Afgelopen 30 dagen'
    },

    // Plugin commands
    commands: {
        open: 'Openen',
        toggleLeftSidebar: 'Linker zijbalk in-/uitschakelen',
        openHomepage: 'Startpagina openen',
        openDailyNote: 'Dagelijkse notitie openen',
        openWeeklyNote: 'Wekelijkse notitie openen',
        openMonthlyNote: 'Maandelijkse notitie openen',
        openQuarterlyNote: 'Kwartaalnotitie openen',
        openYearlyNote: 'Jaarlijkse notitie openen',
        revealFile: 'Bestand tonen',
        search: 'Zoeken',
        searchVaultRoot: 'Hele kluis doorzoeken',
        toggleDualPane: 'Dubbel paneel in-/uitschakelen',
        toggleDualPaneOrientation: 'Dubbel paneel oriëntatie wisselen', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'Kalender in-/uitschakelen',
        selectVaultProfile: 'Kluisprofiel wijzigen',
        selectVaultProfile1: 'Kluisprofiel 1 selecteren',
        selectVaultProfile2: 'Kluisprofiel 2 selecteren',
        selectVaultProfile3: 'Kluisprofiel 3 selecteren',
        deleteFile: 'Bestanden verwijderen',
        createNewNote: 'Nieuwe notitie maken',
        createNewNoteFromTemplate: 'Nieuwe notitie uit sjabloon',
        moveFiles: 'Bestanden verplaatsen',
        mergeNotes: 'Notities samenvoegen', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'Volgend bestand selecteren',
        selectPreviousFile: 'Vorig bestand selecteren',
        navigateBack: 'Terug navigeren',
        navigateForward: 'Vooruit navigeren',
        convertToFolderNote: 'Converteren naar mapnotitie',
        setAsFolderNote: 'Als mapnotitie instellen',
        detachFolderNote: 'Mapnotitie loskoppelen',
        pinAllFolderNotes: 'Alle mapnotities vastpinnen',
        navigateToFolder: 'Navigeren naar map',
        navigateToTag: 'Navigeren naar tag',
        navigateToProperty: 'Navigeer naar eigenschap',
        addShortcut: 'Toevoegen aan snelkoppelingen',
        openShortcut: 'Snelkoppeling {number} openen',
        toggleDescendants: 'Afstammelingen in-/uitschakelen',
        toggleHidden: 'Verborgen mappen, tags en notities in-/uitschakelen',
        toggleTagSort: 'Tag sorteervolgorde in-/uitschakelen',
        toggleTagsBySelection: 'Tags op selectie in-/uitschakelen',
        togglePropertiesBySelection: 'Eigenschappen op selectie in-/uitschakelen',
        toggleCompactMode: 'Compacte modus in-/uitschakelen', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Vastgemaakt gedeelte in-/uitschakelen',
        collapseExpand: 'Alle items in-/uitklappen',
        collapseExpandSelectedItem: 'Geselecteerd item in-/uitklappen',
        addTag: 'Tag toevoegen aan geselecteerde bestanden',
        setProperty: 'Eigenschap instellen op geselecteerde bestanden', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'Tag verwijderen van geselecteerde bestanden',
        removeAllTags: 'Alle tags verwijderen van geselecteerde bestanden',
        openAllFiles: 'Alle bestanden openen',
        rebuildCache: 'Cache opnieuw opbouwen',
        restoreDefaultSettings: 'Standaardinstellingen herstellen' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator',
        calendarViewName: 'Kalender',
        folderNoteSidebarViewName: 'Mapnotitie',
        ribbonTooltip: 'Notebook Navigator',
        revealInNavigator: 'Tonen in Notebook Navigator',
        settingsUnavailableNotice:
            'Notebook Navigator kon de instellingen niet lezen en is niet gestart. Als je kluis wordt gesynchroniseerd, herstart Obsidian nadat de synchronisatie is voltooid. Om opnieuw te beginnen met standaardinstellingen, voer je de opdracht "Standaardinstellingen herstellen" uit.', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsRecovery: {
            confirmTitle: 'Standaardinstellingen herstellen', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'Dit vervangt het instellingenbestand van Notebook Navigator door standaardinstellingen. Als je kluis nog wordt gesynchroniseerd, kunnen de herstelde standaardwaarden de instellingen op je andere apparaten overschrijven. Een leesbaar instellingenbestand wordt eerst gekopieerd naar een back-up met tijdstempel in de pluginmap.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'Standaardwaarden herstellen', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: 'Instellingenherstel kon niet worden voltooid. Lokale voorkeuren zijn behouden.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'Standaardinstellingen hersteld. Herstart Obsidian om te voltooien.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Laatst gewijzigd op',
        createdAt: 'Gemaakt op',
        file: 'bestand',
        files: 'bestanden',
        folder: 'map',
        folders: 'mappen',
        wordCount: 'Aantal woorden'
    },

    fileCounts: {
        words: '{count} woorden',
        characters: '{count} tekens',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'Standaardinstellingen wijzigen',
        metadataReport: {
            exportSuccess: 'Metadatarapport met fouten geëxporteerd naar: {filename}',
            exportFailed: 'Kan metadatarapport niet exporteren'
        },
        sections: {
            general: 'Algemeen',
            vaultFilters: 'Weergavefilters',
            appearanceBehavior: 'Uiterlijk & gedrag',
            navigationPane: 'Navigatiepaneel',
            calendar: 'Kalender',
            fileOperations: 'Bestandsbewerkingen',
            icons: 'Pictogrampakketten',
            folders: 'Mappen',
            folderNotes: 'Mapnotities',
            folderNoteFiles: 'Mapnotitiebestanden',
            foldersAndFolderNotes: 'Mappen & mapnotities',
            tagsAndProperties: 'Tags & eigenschappen',
            tags: 'Tags',
            listPane: 'Lijstpaneel',
            notes: 'Bestandsweergave',
            shortcutsAndRecentFiles: 'Snelkoppelingen & recente bestanden',
            advanced: 'Geavanceerd'
        },
        pageGroups: {
            configuration: 'Configuratie',
            navigationAndContent: 'Navigatiepaneel',
            notesAndLists: 'Lijstpaneel',
            calendarAndTools: 'Kalender en hulpmiddelen'
        },
        pageDescriptions: {
            general: 'Releasenotities, ondersteuning, kluisprofiel, bestandstypen en eigenschapssleutels.',
            vaultFilters: 'Verborgen mappen, tags, bestanden, bestandstags en eigenschapsregels.',
            appearanceBehavior: 'Gedrag, toetsenbordnavigatie, muisknoppen, uiterlijk en opmaak.',
            navigationPane: 'Indeling, uiterlijk, aantal notities, inklapgedrag en regenboogkleuren.',
            shortcuts: 'Zichtbaarheid van snelkoppelingen, badges, recente bestanden en vastgezette items.',
            calendar: 'Kalenderweergave, datumnotities, sjablonen, taalinstellingen en zijbalkplaatsing.',
            fileOperations: 'Sjablonen, verwijderingsbevestigingen, bijlagen en gedrag bij bestandsverplaatsingsconflicten.',
            foldersAndFolderNotes: 'Mapweergave, mapnotities, mapnotitiesjablonen en mapnotitiegedrag.',
            tagsProperties: 'Tag- en eigenschapssecties, pictogrammen, sortering, bereik en overerving.',
            listPane: 'Sortering, groepering, lijstmodi, vastgezette notities en tekeningvoorbeelden.',
            frontmatter: 'Frontmattervelden voor weergavenamen, tijdstempels, pictogrammen en kleuren.',
            notes: 'Titels, voorbeeldtekst, uitgelichte afbeeldingen, tags, eigenschappen, datums, aantal woorden en aantal tekens.',
            iconPacks: 'Interfacepictogrammen, bestandspictogrammen en beheer van pictogrampakketten.',
            advanced: 'Diagnostiek, opschonen van metadata, import/export en herstellen.'
        },
        groups: {
            general: {
                vaultConfiguration: 'Kluisinstelling',
                templates: 'Sjablonen',
                behavior: 'Gedrag',
                startup: 'Opstarten',
                keyboardNavigation: 'Toetsenbordnavigatie',
                mouseButtons: 'Muisknoppen',
                view: 'Uiterlijk',
                icons: 'Iconen',
                desktopAppearance: 'Desktop-uiterlijk',
                mobileAppearance: 'Mobiele weergave',
                formatting: 'Opmaak'
            },
            advanced: {
                maintenance: 'Onderhoud',
                resetSettings: 'Instellingen resetten'
            },
            navigation: {
                appearance: 'Uiterlijk',
                banner: 'Banner',
                collapseItems: 'Items inklappen',
                dragAndDrop: 'Slepen en neerzetten',
                noteCounts: 'Notitietellingen',
                rainbowColors: 'Regenboogkleuren',
                leftSidebar: 'Linkerzijbalk',
                calendarIntegration: 'Kalenderintegratie'
            },
            list: {
                display: 'Uiterlijk',
                groupHeaders: 'Groepskoppen',
                propertySort: 'Sorteren op eigenschap',
                manualSort: 'Handmatig sorteren',
                pinnedNotes: 'Vastgezette notities',
                drawingPreviews: 'Tekeningvoorbeelden'
            },
            notes: {
                frontmatter: 'Frontmattervelden',
                tasks: 'Taken',
                icon: 'Icoon',
                title: 'Titel',
                previewText: 'Voorbeeldtekst',
                featureImage: 'Uitgelichte afbeelding',
                tags: 'Tags',
                properties: 'Eigenschappen',
                date: 'Datum',
                parentFolder: 'Bovenliggende map',
                wordCount: 'Aantal woorden en tekens'
            }
        },
        syncMode: {
            notSynced: '(niet gesynchroniseerd)',
            switchToSynced: 'Synchronisatie inschakelen',
            switchToLocal: 'Synchronisatie uitschakelen'
        },
        items: {
            listPaneTitle: {
                name: 'Titel lijstpaneel',
                desc: 'Kies waar de titel van het lijstpaneel wordt weergegeven.',
                options: {
                    header: 'Tonen in koptekst',
                    list: 'Tonen in lijstpaneel',
                    hidden: 'Niet tonen'
                }
            },
            sortNotesBy: {
                name: 'Standaard sorteervolgorde',
                desc: 'Kies de standaard sorteervolgorde voor notities.',
                options: {
                    'modified-desc': 'Datum bewerkt (nieuwste bovenaan)',
                    'modified-asc': 'Datum bewerkt (oudste bovenaan)',
                    'created-desc': 'Datum gemaakt (nieuwste bovenaan)',
                    'created-asc': 'Datum gemaakt (oudste bovenaan)',
                    'title-asc': 'Titel (A bovenaan)',
                    'title-desc': 'Titel (Z bovenaan)',
                    'filename-asc': 'Bestandsnaam (A bovenaan)',
                    'filename-desc': 'Bestandsnaam (Z bovenaan)'
                },
                directions: {
                    asc: 'Oplopend',
                    desc: 'Aflopend'
                },
                fields: {
                    modified: 'Datum bewerkt',
                    created: 'Datum gemaakt',
                    title: 'Titel',
                    filename: 'Bestandsnaam',
                    property: 'Eigenschap'
                }
            },
            propertySortKey: {
                name: 'Eigenschappen om op te sorteren',
                desc: "Door komma's gescheiden frontmatter-eigenschappen die worden weergegeven als sorteeropties op eigenschap. Arraywaarden worden samengevoegd tot één string. Deze eigenschappen worden niet gewijzigd.",
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: 'Secundaire sortering',
                desc: 'Gebruikt bij Eigenschap-sortering wanneer notities dezelfde eigenschapswaarde of geen eigenschapswaarde hebben.',
                options: {
                    title: 'Titel',
                    filename: 'Bestandsnaam',
                    created: 'Aanmaakdatum',
                    modified: 'Bewerkingsdatum'
                }
            },
            propertySortInstructions: {
                intro: 'Elke hierboven vermelde eigenschap verschijnt als sorteeroptie in het sorteermenu van het lijstpaneel. Een keuze sorteert notities op de frontmatter-waarde ervan.'
            },
            manualSortPropertyKey: {
                name: 'Eigenschap voor handmatig sorteren',
                desc: 'Frontmatter-eigenschap gebruikt om numerieke indexwaarden voor handmatig sorteren op te slaan.'
            },
            manualSortGroupHeaderProperty: {
                name: 'Eigenschap voor groepskop',
                desc: 'Frontmatter-eigenschap gebruikt om aangepaste groepskoppen op te slaan.'
            },
            groupHeadersInstructions: {
                intro: 'Aangepaste groepskoppen verschijnen boven notities in het lijstpaneel.',
                items: [
                    'Stel in het sorteermenu van het lijstpaneel groepering in op **Aangepast**.',
                    'Klik met de rechtermuisknop op een notitie en kies **Groepskop instellen** om een kop boven de notitie te plaatsen.'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'Plaatsing nieuwe notitie',
                desc: 'Kies waar nieuwe notities worden geplaatst wanneer de huidige lijst handmatig sorteren gebruikt.',
                options: {
                    top: 'Bovenaan',
                    bottom: 'Onderaan',
                    'below-selected-note': 'Onder geselecteerde notitie',
                    unsorted: 'Niet gesorteerd'
                }
            },
            confirmBeforeManualSort: {
                name: 'Bevestigen voor handmatig sorteren',
                desc: 'Toon een waarschuwing voordat de eigenschap voor handmatig sorteren voor het eerst naar notities wordt geschreven. Wanneer uitgeschakeld, ontvangen notities de eigenschap zonder waarschuwing.'
            },
            manualSortInstructions: {
                intro: 'Handmatig sorteren schrijft een numerieke indexwaarde naar een frontmatter-eigenschap op elke notitie. Notities zonder index verschijnen onder Niet gesorteerd.',
                items: [
                    'Schakel handmatig sorteren in door **Handmatig sorteren** te kiezen uit het sorteermenu. Daarna zijn er twee manieren om notities te herschikken.',
                    'Kies **Sorteervolgorde bewerken...** uit het sorteermenu om een herschikweergave te openen. Sleep notities met de muis, of met aanraking op mobiel. Op desktop selecteert **Cmd/Ctrl** of **Shift** klikken meerdere notities, daarna verplaatst slepen van een ervan de hele groep.',
                    'Selecteer in het lijstpaneel één notitie of selecteer er meerdere, en druk vervolgens op **Cmd/Ctrl + Arrow Up/Down** om de selectie omhoog of omlaag te verplaatsen.'
                ]
            },
            revealFileOnListChanges: {
                name: 'Scroll naar geselecteerd bestand bij lijstwijzigingen',
                desc: 'Scroll naar het geselecteerde bestand bij het vastpinnen van notities, tonen van afstammelingen-notities, wijzigen van mapweergave of uitvoeren van bestandsoperaties.'
            },
            includeDescendantNotes: {
                name: 'Notities uit submappen / afstammelingen tonen',
                desc: 'Notities uit geneste submappen en tag- en eigenschap-afstammelingen opnemen bij het bekijken van een map, tag of eigenschap.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Notities alleen in hun map vastmaken',
                desc: 'Vastgemaakte notities worden alleen als vastgemaakt weergegeven in hun eigen map. Handig voor mapnotities of als je veel vastgemaakte notities hebt. Heeft geen invloed op tag- of eigenschapweergaven.'
            },
            separateNoteCounts: {
                name: 'Huidige en afstammeling-notitietellingen apart tonen',
                desc: 'Notitietellingen weergeven in "huidig ▾ afstammelingen" formaat voor mappen, tags en eigenschappen.'
            },
            groupNotes: {
                name: 'Standaard groepering',
                desc: 'Aangepast toont koppen gedefinieerd in frontmatter. Datum groepeert notities op datum. Map groepeert notities op map. Tag- en eigenschapweergaven gebruiken datumgroepen wanneer een map is geselecteerd.',
                options: {
                    custom: 'Aangepast',
                    date: 'Datum',
                    folder: 'Map'
                }
            },
            showSelectedNavigationPills: {
                name: 'Tag- en eigenschapspillen altijd tonen',
                desc: 'Wanneer uitgeschakeld, worden pillen die overeenkomen met de huidige navigatieselectie verborgen (bijv. de "recepten"-tagpil wordt verborgen bij het bladeren door de "recepten"-tag). Inschakelen om alle pillen zichtbaar te houden.'
            },
            stickyGroupHeaders: {
                name: 'Plakkerige groepskoppen',
                desc: 'Houd de huidige datum-, map- of vastgepinde sectiekop zichtbaar tijdens het scrollen.'
            },
            showFolderGroupPaths: {
                name: 'Submappaden tonen',
                desc: 'Toont bij groeperen op map in het lijstpaneel submappaden in plaats van alleen mapnamen.'
            },
            showGroupHeaderItemCounts: {
                name: 'Aantallen items tonen',
                desc: 'Toont het aantal items in elke groepskop in het lijstpaneel.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'Mapgroepering: bestanden van huidige map onderaan',
                desc: 'Wanneer de standaardgroepering Map is, worden bestanden direct in de geselecteerde map onder submapgroepen geplaatst.'
            },
            defaultListMode: {
                name: 'Standaard lijstmodus',
                desc: 'Selecteer de standaard lijstindeling. Standaard toont titel, datum, beschrijving en voorbeeldtekst. Compact toont alleen de titel. Uiterlijk kan per map worden overschreven.',
                options: {
                    standard: 'Standaard',
                    compact: 'Compact'
                }
            },
            showFileIcons: {
                name: 'Bestandspictogrammen tonen',
                desc: 'Bestandspictogrammen tonen met links uitgelijnde ruimte. Uitschakelen verwijdert zowel pictogrammen als inspringing. Prioriteit: onvoltooide taken-pictogram > aangepast pictogram > mappictogram > bestandsnaam-pictogram > bestandstype-pictogram > standaardpictogram.'
            },
            useFolderIcon: {
                name: 'Mappictogram gebruiken',
                desc: 'Het pictogram van de bovenliggende map weergeven wanneer er geen aangepast bestandspictogram is ingesteld. De mapkleur wordt gebruikt wanneer er geen aangepaste bestandskleur is ingesteld.'
            },
            showFileIconUnfinishedTask: {
                name: 'Onvoltooide taken-pictogram',
                desc: 'Een taakpictogram weergeven wanneer een notitie onvoltooide taken bevat.'
            },
            showFileBackgroundUnfinishedTask: {
                name: 'Onvoltooide taken-achtergrond',
                desc: 'Een achtergrondkleur toepassen wanneer een notitie onvoltooide taken bevat.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'Achtergrondkleur voor onvoltooide taken',
                desc: 'De achtergrondkleur instellen die wordt gebruikt wanneer een notitie onvoltooide taken bevat.'
            },
            showFilenameMatchIcons: {
                name: 'Pictogrammen op bestandsnaam',
                desc: 'Pictogrammen toewijzen aan bestanden op basis van tekst in hun namen.'
            },
            fileNameIconMap: {
                name: 'Bestandsnaam-pictogram toewijzing',
                desc: 'Bestanden met de tekst krijgen het opgegeven pictogram. Eén toewijzing per regel: tekst=pictogram',
                placeholder: '# tekst=pictogram\nvergadering=ph-calendar\nfactuur=ph-receipt',
                editTooltip: 'Toewijzingen bewerken'
            },
            showCategoryIcons: {
                name: 'Pictogrammen op bestandstype',
                desc: 'Pictogrammen toewijzen aan bestanden op basis van hun extensie.'
            },
            fileTypeIconPreset: {
                name: 'Voorinstelling voor bestandspictogrammen',
                desc: 'Kies de ingebouwde pictogrammen of een voorinstelling voor pictogrampakketten. Aangepaste extensieregels overschrijven deze voorinstelling.',
                options: {
                    none: 'Ingebouwde pictogrammen'
                },
                notInstalledWarning: 'Dit pictogrampakket is niet geïnstalleerd. In plaats daarvan worden ingebouwde pictogrammen getoond.'
            },
            fileTypeIconMap: {
                name: 'Bestandstype-pictogram toewijzing',
                desc: 'Bestanden met de extensie krijgen het opgegeven pictogram. Eén toewijzing per regel: extensie=pictogram',
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'Toewijzingen bewerken'
            },
            compactItemHeight: {
                name: 'Compacte itemhoogte',
                desc: 'Stel de hoogte van compacte lijstitems in op desktop en mobiel (pixels).',
                resetTooltip: 'Herstellen naar standaard (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Tekst schalen met compacte itemhoogte',
                desc: 'Compacte lijsttekst schalen wanneer de itemhoogte wordt verminderd.'
            },
            showParentFolder: {
                name: 'Bovenliggende map tonen',
                desc: 'Het pad van de bovenliggende map weergeven voor notities in submappen, tags of eigenschappen.'
            },
            parentFolderClickRevealsFile: {
                name: 'Klik op bovenliggende map opent map',
                desc: 'Klik op het label van de bovenliggende map om de map te openen in het lijstpaneel.'
            },
            showParentFolderColor: {
                name: 'Bovenliggende mapkleur tonen',
                desc: 'Mapkleuren gebruiken voor labels van bovenliggende mappen.'
            },
            showParentFolderIcon: {
                name: 'Bovenliggende mapicoon tonen',
                desc: 'Mapiconen tonen naast labels van bovenliggende mappen.'
            },
            showQuickActions: {
                name: 'Snelle acties tonen',
                desc: 'Actieknoppen tonen bij zweven over bestanden. Knopbediening selecteert welke acties verschijnen.'
            },
            dualPane: {
                name: 'Dubbel paneellay-out',
                desc: 'Navigatiepaneel en lijstpaneel naast elkaar tonen op desktop.'
            },
            dualPaneOrientation: {
                name: 'Dubbel paneel oriëntatie',
                desc: 'Kies horizontale of verticale lay-out wanneer dubbel paneel actief is.',
                options: {
                    horizontal: 'Horizontale splitsing',
                    vertical: 'Verticale splitsing'
                }
            },
            narrowSidebarLayout: {
                name: 'Wanneer de zijbalk te smal is',
                desc: 'Kies wat er gebeurt wanneer het navigatiepaneel en lijstpaneel niet naast elkaar passen.',
                options: {
                    none: 'Niets doen',
                    singlePane: 'Overschakelen naar enkel paneel',
                    vertical: 'Overschakelen naar verticale splitsing'
                }
            },
            narrowSidebarTrigger: {
                name: 'Drempel voor smalle zijbalk',
                desc: 'Kies hoe de breedtedrempel van de zijbalk wordt berekend.',
                options: {
                    fitPanes: 'Panelen laten passen',
                    customWidth: 'Aangepaste breedte'
                }
            },
            narrowSidebarCustomWidth: {
                name: 'Breedtedrempel voor smalle zijbalk',
                desc: 'Schakel om wanneer de zijbalk smaller is dan deze breedte.',
                resetTooltip: 'Standaardbreedte herstellen'
            },
            appearanceBackground: {
                name: 'Achtergrondkleur',
                desc: 'Kies achtergrondkleuren voor navigatie- en lijstpanelen.',
                options: {
                    separate: 'Afzonderlijke achtergronden',
                    primary: 'Gebruik lijstachtergrond',
                    secondary: 'Gebruik navigatieachtergrond'
                }
            },
            appearanceScale: {
                name: 'Zoomniveau',
                desc: 'Regelt het algemene zoomniveau van Notebook Navigator (procent).'
            },
            useFloatingToolbars: {
                name: 'Zwevende werkbalken gebruiken op iOS/iPadOS',
                desc: 'Geldt alleen op iOS en iPadOS.'
            },
            startView: {
                name: 'Standaard opstartweergave',
                desc: 'Kies welk paneel actief is bij het openen van Notebook Navigator. De enkelpaneelweergave toont dit paneel eerst; de dubbelpaneelweergave geeft het de toetsenbordfocus.',
                options: {
                    navigation: 'Navigatiepaneel',
                    files: 'Lijstpaneel'
                }
            },
            toolbarButtons: {
                name: 'Werkbalkknoppen',
                desc: "Kies welke knoppen in de werkbalk worden weergegeven. Verborgen knoppen blijven toegankelijk via opdrachten en menu's.",
                navigationLabel: 'Navigatiewerkbalk',
                listLabel: 'Lijstwerkbalk'
            },
            createNewNotesInNewTab: {
                name: 'Nieuwe notities in nieuw tabblad openen',
                desc: 'Wanneer ingeschakeld opent de opdracht Nieuwe notitie maken notities in een nieuw tabblad. Wanneer uitgeschakeld vervangen notities het huidige tabblad.'
            },
            autoRevealActiveNote: {
                name: 'Actieve notitie automatisch tonen',
                desc: 'Notities automatisch tonen wanneer geopend vanuit Snelle Wisselaar, links of zoeken.'
            },
            autoRevealShortestPath: {
                name: 'Automatisch tonen: Kortste pad gebruiken',
                desc: 'Ingeschakeld: Automatisch tonen selecteert de dichtstbijzijnde zichtbare bovenliggende map of tag. Uitgeschakeld: Automatisch tonen selecteert de werkelijke map en exacte tag van het bestand.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Automatisch tonen: Gebeurtenissen van rechter zijbalk negeren',
                desc: 'Actieve notitie niet wijzigen bij klikken of wijzigen van notities in de rechter zijbalk.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'Automatisch tonen: Gebeurtenissen van andere vensters negeren',
                desc: 'Actieve notitie niet wijzigen bij het werken met notities in een ander venster.'
            },
            paneTransitionDuration: {
                name: 'Enkelvoudig paneel animatie',
                desc: 'Transitieduur bij het wisselen tussen panelen in enkelvoudig-paneel-modus (milliseconden).',
                resetTooltip: 'Herstellen naar standaard'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Eerste notitie automatisch selecteren',
                desc: 'Automatisch de eerste notitie openen bij het wisselen van mappen, tags of eigenschappen.'
            },
            skipAutoScroll: {
                name: 'Automatisch scrollen voor snelkoppelingen uitschakelen',
                desc: 'Het navigatiepaneel niet scrollen bij klikken op items in snelkoppelingen.'
            },
            autoExpandNavItems: {
                name: 'Uitvouwen bij selectie',
                desc: 'Mappen en tags uitvouwen bij selectie. In enkelvoudige paneelmodus: eerste selectie vouwt uit, tweede selectie toont bestanden.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'Een uitgevouwen tak',
                desc: 'Vouw andere takken in dezelfde boom samen bij het uitvouwen van een map, tag of eigenschap.'
            },
            springLoadedFolders: {
                name: 'Uitvouwen bij slepen',
                desc: 'Mappen en tags uitvouwen bij zweven tijdens slepen.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Uitvouwen bij slepen: Vertraging bij eerste uitvouw',
                desc: 'Vertraging voordat de eerste map of tag uitvouwt tijdens slepen (seconden).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Uitvouwen bij slepen: Vertraging bij volgende uitvouwen',
                desc: 'Vertraging voordat extra mappen of tags uitvouwen tijdens dezelfde sleepactie (seconden).'
            },
            navigationBanner: {
                name: 'Navigatiebanner (kluisprofiel)',
                desc: 'Een afbeelding weergeven boven het navigatiepaneel. Verandert met het geselecteerde kluisprofiel.',
                current: 'Huidige banner: {path}',
                chooseButton: 'Afbeelding kiezen'
            },
            pinNavigationBanner: {
                name: 'Banner vastpinnen',
                desc: 'Pin de navigatiebanner boven de navigatieboom.'
            },
            showShortcuts: {
                name: 'Snelkoppelingen tonen',
                desc: 'De sectie snelkoppelingen weergeven in het navigatiepaneel.'
            },
            shortcutBadgeDisplay: {
                name: 'Snelkoppeling badge',
                desc: "Wat naast snelkoppelingen weergeven. Gebruik de commando's 'Snelkoppeling 1-9 openen' om snelkoppelingen direct te openen.",
                options: {
                    index: 'Positie (1-9)',
                    count: 'Aantal items',
                    none: 'Geen'
                }
            },
            showRecentNotes: {
                name: 'Recente bestanden tonen',
                desc: 'De sectie recente bestanden weergeven in het navigatiepaneel.'
            },
            hideRecentNotes: {
                name: 'Bestandstypen uit recente bestanden verbergen',
                desc: 'Kies welke soorten bestanden verborgen worden in de sectie recente bestanden.',
                options: {
                    none: 'Geen',
                    folderNotes: 'Mapnotities'
                }
            },
            recentNotesCount: {
                name: 'Aantal recente bestanden',
                desc: 'Aantal weer te geven recente bestanden.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Recente bestanden met snelkoppelingen vastpinnen',
                desc: 'Recente bestanden opnemen wanneer snelkoppelingen zijn vastgepind.'
            },
            calendarEnabled: {
                name: 'Kalender inschakelen',
                desc: 'Kalenderfuncties van Notebook Navigator inschakelen.'
            },
            calendarPlacement: {
                name: 'Kalenderpositie',
                desc: 'Weergeven in de linker of rechter zijbalk.',
                options: {
                    leftSidebar: 'Linker zijbalk',
                    rightSidebar: 'Rechter zijbalk'
                }
            },
            calendarLeftPlacement: {
                name: 'Enkele paneel plaatsing',
                desc: 'Waar de kalender wordt weergegeven in enkele paneelmodus.',
                options: {
                    navigationPane: 'Navigatiepaneel',
                    below: 'Onder panelen'
                }
            },
            calendarLocale: {
                name: 'Taal',
                desc: 'Bepaalt datumopmaak van de kalender, weeknummering en eerste dag van de week.',
                weekPathMismatchWarning:
                    'De zichtbare kalender en de paden voor wekelijkse notities gebruiken verschillende weekbegindagen of weeknummering.',
                options: {
                    systemDefault: 'Standaard'
                }
            },
            calendarWeekendDays: {
                name: 'Weekenddagen',
                desc: 'Toon weekenddagen met een andere achtergrondkleur.',
                options: {
                    none: 'Geen',
                    satSun: 'Zaterdag en zondag',
                    friSat: 'Vrijdag en zaterdag',
                    thuFri: 'Donderdag en vrijdag'
                }
            },
            calendarMonthHeadingFormat: {
                name: 'Maandnaam-indeling',
                desc: 'Lange (januari) of korte (jan.) maandnaam.',
                options: {
                    full: 'januari (volledig)',
                    short: 'jan. (kort)'
                }
            },
            showInfoButtons: {
                name: 'Infoknoppen tonen',
                desc: 'Infoknoppen weergeven in de zoekbalk en de kalenderheader.'
            },
            calendarWeeksToShow: {
                name: 'Weken om te tonen in linker zijbalk',
                desc: 'De kalender in de rechter zijbalk toont altijd de volledige maand.',
                options: {
                    fullMonth: 'Volledige maand',
                    oneWeek: '1 week',
                    weeksCount: '{count} weken'
                }
            },
            calendarHighlightToday: {
                name: 'Datum van vandaag markeren',
                desc: 'Markeer de datum van vandaag met een achtergrondkleur en vetgedrukte tekst.'
            },
            calendarShowFeatureImage: {
                name: 'Uitgelichte afbeelding tonen',
                desc: 'Toon uitgelichte afbeeldingen voor notities in de kalender.'
            },
            calendarShowTasks: {
                name: 'Taken tonen',
                desc: 'Een indicator weergeven op dagen, weken en maanden met onvoltooide taken.'
            },
            calendarShowWeekNumber: {
                name: 'Weeknummer tonen',
                desc: 'Voeg een kolom toe met het weeknummer.'
            },
            calendarShowQuarter: {
                name: 'Kwartaal tonen',
                desc: 'Voeg een kwartaallabel toe in de kalender-header.'
            },
            calendarShowYearCalendar: {
                name: 'Jaarkalender tonen',
                desc: 'Jaarnavigatie en maandraster weergeven in de rechter zijbalk.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Bevestigen voor aanmaken',
                desc: 'Toon een bevestigingsdialoog bij het aanmaken van een nieuwe dagelijkse notitie.'
            },
            calendarIntegrationMode: {
                name: 'Dagelijkse notitie bron',
                desc: 'Bron voor kalendernotities.',
                options: {
                    dailyNotes: 'Dagelijkse notities (core plug-in)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'Map en datumformaat worden geconfigureerd in de Daily Notes core plugin.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'Taal voor periodieke notities',
                desc: 'Bepaalt gelokaliseerde maandnamen, dagnamen, weeknummers en weekbegindagen in de paden voor periodieke notities van Notebook Navigator.',
                options: {
                    calendar: 'Kalender',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'Hoofdmap',
                desc: 'Basismap voor periodieke notities. Datumpatronen kunnen submappen bevatten. Wijzigt met het geselecteerde kluisprofiel.',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'Sjabloonmaplocatie',
                desc: 'De sjabloonbestandskiezer toont notities uit deze map.',
                placeholder: 'Templates',
                usage: 'Gebruikt door kalendernotities en mapnotities. Configureer sjablonen in Kalender > Kalenderintegratie en Mappen & mapnotities > Mapnotitiebestanden.'
            },
            calendarCustomFilePattern: {
                name: 'Dagelijkse notities',
                desc: 'Pad formatteren met Moment-datumnotatie. Zet submapnamen tussen haakjes, bijv. [Work]/YYYY. Klik op het sjabloonpictogram om een sjabloon in te stellen. Stel de sjabloonmaplocatie in bij Bestandsbewerkingen > Sjablonen.',
                momentDescPrefix: 'Pad formatteren met ',
                momentLinkText: 'Moment-datumnotatie',
                momentDescSuffix:
                    '. Zet submapnamen tussen haakjes, bijv. [Work]/YYYY. Klik op het sjabloonpictogram om een sjabloon in te stellen. Stel de sjabloonmaplocatie in bij Bestandsbewerkingen > Sjablonen.',
                templaterSupportInstalled: '✅ De Templater-plug-in is geïnstalleerd met volledige sjabloonondersteuning.',
                templaterSupportMissing: '⚠️ Installeer de Templater-plug-in voor volledige sjabloonondersteuning.',
                placeholder: 'YYYY/YYYYMMDD',
                example: 'Huidige syntaxis: {path}',
                parsingError: 'Het patroon moet kunnen formatteren en terug-parsen naar een volledige datum (jaar, maand, dag).'
            },
            calendarCustomWeekPattern: {
                name: 'Wekelijkse notities',
                parsingError: 'Het patroon moet kunnen formatteren en terug-parsen naar een volledige week (weekjaar, weeknummer).',
                weekPathMismatchWarning:
                    'De paden voor wekelijkse notities gebruiken de taal voor periodieke notities. Gebruik overeenkomende talen, of gebruik "GGGG" met "WW" voor maandag-gebaseerde weken.',
                mixedWeekTokensWarning:
                    'Dit patroon combineert maandag-gebaseerde weektokens ("W" of "G") met taal-gebaseerde weektokens ("w" of "g"). Gebruik consistent één set: "GGGG" met "WW" voor maandag-gebaseerde weken, of "gggg" met "ww" als wekelijkse notities de geselecteerde taal moeten volgen.'
            },
            calendarCustomMonthPattern: {
                name: 'Maandelijkse notities',
                parsingError: 'Het patroon moet kunnen formatteren en terug-parsen naar een volledige maand (jaar, maand).'
            },
            calendarCustomQuarterPattern: {
                name: 'Kwartaalnotities',
                parsingError: 'Het patroon moet kunnen formatteren en terug-parsen naar een volledig kwartaal (jaar, kwartaal).'
            },
            calendarCustomYearPattern: {
                name: 'Jaarlijkse notities',
                parsingError: 'Het patroon moet kunnen formatteren en terug-parsen naar een volledig jaar (jaar).'
            },
            calendarTemplateFile: {
                current: 'Sjabloonbestand: {name}'
            },
            showTooltips: {
                name: 'Tooltips tonen',
                desc: 'Zweeftips met extra informatie weergeven voor notities en mappen.'
            },
            showTooltipPath: {
                name: 'Pad in tooltips tonen',
                desc: 'Het mappad onder notitienamen in tooltips weergeven.'
            },
            showTooltipWordCount: {
                name: 'Aantal woorden in tooltips tonen',
                desc: 'Het aantal woorden van notities in tooltips weergeven.'
            },
            resetPaneSeparator: {
                name: 'Paneelscheidingspositie resetten',
                desc: 'De versleepbare scheiding tussen navigatiepaneel en lijstpaneel resetten naar standaardpositie.',
                buttonText: 'Scheiding resetten',
                notice: 'Scheidingspositie gereset. Herstart Obsidian of heropen Notebook Navigator om toe te passen.'
            },
            settingsTransfer: {
                name: 'Instellingen importeren en exporteren',
                desc: 'Notebook Navigator-instellingen exporteren of importeren als JSON. Importeren vervangt alle instellingen.',
                importButtonText: 'Importeren',
                exportButtonText: 'Exporteren',
                import: {
                    modalTitle: 'Instellingen importeren',
                    fileButtonName: 'Importeren uit bestand',
                    fileButtonDesc: 'Een JSON-bestand laden vanaf schijf.',
                    fileButtonText: 'Importeren uit bestand',
                    editorName: 'JSON',
                    editorDesc: 'Plak of bewerk JSON hieronder. Niet-opgenomen instellingen worden teruggezet naar de standaardwaarden.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'Importeren',
                    confirmTitle: 'Instellingen importeren?',
                    confirmMessage: 'Bij importeren worden de huidige Notebook Navigator-instellingen vervangen.',
                    backupToggleName: 'Huidige instellingen vóór importeren opslaan in de kluisroot',
                    backupToggleDesc: 'Maakt een JSON-bestand met tijdstempel in de kluisroot.',
                    successWithBackupNotice: 'Instellingen geïmporteerd. Vorige instellingen opgeslagen in {path}.',
                    backupError: 'Kan huidige instellingen niet opslaan: {message}',
                    successNotice: 'Instellingen geïmporteerd.',
                    errorNotice: 'Importeren van instellingen mislukt: {message}',
                    fileReadError: 'Kan bestand niet lezen: {message}'
                },
                export: {
                    modalTitle: 'Instellingen exporteren',
                    editorName: 'JSON',
                    editorDesc: 'Alleen instellingen die afwijken van standaardwaarden zijn opgenomen.',
                    placeholder: '{}',
                    copyButtonText: 'Kopiëren naar klembord',
                    downloadButtonText: 'Downloaden',
                    copyNotice: 'Instellingen gekopieerd naar klembord.',
                    downloadNotice: 'Instellingen geëxporteerd.',
                    downloadError: 'Downloaden van instellingen mislukt: {message}'
                }
            },
            resetAllSettings: {
                name: 'Alle instellingen resetten',
                desc: 'Alle Notebook Navigator-instellingen resetten naar standaardwaarden.',
                buttonText: 'Alle instellingen resetten',
                confirmTitle: 'Alle instellingen resetten?',
                confirmMessage:
                    'Dit zal alle Notebook Navigator-instellingen resetten naar standaardwaarden. Dit kan niet ongedaan worden gemaakt.',
                confirmButtonText: 'Alle instellingen resetten',
                notice: 'Alle instellingen gereset. Herstart Obsidian of heropen Notebook Navigator om toe te passen.',
                error: 'Instellingen resetten mislukt.'
            },
            multiSelectModifier: {
                name: 'Meervoudige selectie modifier',
                desc: 'Kies welke modificatortoets meervoudige selectie in-/uitschakelt. Wanneer Option/Alt is geselecteerd, opent Cmd/Ctrl klik notities in een nieuw tabblad.',
                options: {
                    cmdCtrl: 'Cmd/Ctrl klik',
                    optionAlt: 'Option/Alt klik'
                }
            },
            enterToOpenFiles: {
                name: 'Druk op Enter om bestanden te openen',
                desc: 'Open bestanden alleen door op Enter te drukken tijdens toetsenbordnavigatie in de lijst. Op macOS voorkomt dit dat Enter bestanden hernoemt.'
            },
            shiftEnterOpenContext: {
                name: 'Shift+Enter',
                desc: 'Kies of Shift+Enter het geselecteerde bestand opent of hernoemt.'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Enter',
                desc: 'Kies of Cmd+Enter het geselecteerde bestand opent of hernoemt.'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Enter',
                desc: 'Kies of Ctrl+Enter het geselecteerde bestand opent of hernoemt.'
            },
            mouseBackForwardAction: {
                name: 'Muisknoppen terug/vooruit',
                desc: 'Actie voor de terug- en vooruitknoppen van de muis op desktop.',
                options: {
                    none: 'Systeemstandaard gebruiken',
                    singlePaneSwitch: 'Panelen wisselen (enkelvoudig paneel)',
                    history: 'Geschiedenis navigeren'
                }
            },
            fileVisibility: {
                name: 'Bestandstypes tonen (kluisprofiel)',
                desc: 'Filter welke bestandstypes worden weergegeven in de navigator. Bestandstypes die niet door Obsidian worden ondersteund, kunnen in externe applicaties worden geopend.',
                options: {
                    documents: 'Documenten (.md, .canvas, .base)',
                    supported: 'Ondersteund (opent in Obsidian)',
                    all: 'Alle (kan extern openen)'
                }
            },
            homepage: {
                name: 'Startpagina',
                desc: 'Kies wat Notebook Navigator automatisch opent bij het opstarten.',
                current: 'Huidig: {path}',
                chooseButton: 'Bestand kiezen',
                options: {
                    none: 'Geen',
                    file: 'Bestand',
                    dailyNote: 'Dagnotitie',
                    weeklyNote: 'Weeknotitie',
                    monthlyNote: 'Maandnotitie',
                    quarterlyNote: 'Kwartaalnotitie',
                    yearlyNote: 'Jaarnotitie'
                },
                file: {
                    name: 'Startpagina: Opstartbestand',
                    empty: 'Geen bestand geselecteerd'
                },
                createMissing: {
                    name: 'Startpagina: Notitie aanmaken als deze ontbreekt',
                    desc: 'Maakt de periodieke notitie aan bij opstarten of via opdracht als deze niet bestaat.'
                }
            },
            excludedNotes: {
                name: 'Notities verbergen met eigenschapsregels (kluisprofiel)',
                desc: 'Kommagescheiden lijst van frontmatter-regels. Gebruik `key` of `key=value` items (bijv. status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'Bestanden verbergen (kluisprofiel)',
                desc: 'Kommagescheiden lijst van bestandsnaampatronen om te verbergen. Ondersteunt * jokertekens en / paden (bijv. temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Kluis profiel',
                desc: 'Profielen bewaren bestandstypezichtbaarheid, verborgen bestanden, verborgen mappen, verborgen labels, eigenschapsregels voor verborgen notities, snelkoppelingen en navigatiebanner. Wissel van profiel via de koptekst van het navigatiepaneel.',
                defaultName: 'Standaard',
                addButton: 'Profiel toevoegen',
                editProfilesButton: 'Profielen bewerken',
                addProfileOption: 'Profiel toevoegen...',
                applyButton: 'Toepassen',
                deleteButton: 'Profiel verwijderen',
                addModalTitle: 'Profiel toevoegen',
                editProfilesModalTitle: 'Profielen bewerken',
                addModalPlaceholder: 'Profielnaam',
                deleteModalTitle: '{name} verwijderen',
                deleteModalMessage:
                    '{name} verwijderen? Verborgen bestands-, map-, label- en eigenschapsgebaseerde notitiefilters opgeslagen in dit profiel worden verwijderd.',
                moveUp: 'Omhoog verplaatsen',
                moveDown: 'Omlaag verplaatsen',
                errors: {
                    emptyName: 'Voer een profielnaam in',
                    duplicateName: 'Profielnaam bestaat al'
                }
            },
            vaultTitle: {
                name: 'Kluistitel plaatsing',
                desc: 'Kies waar de kluistitel wordt weergegeven.',
                options: {
                    header: 'Weergeven in header',
                    navigation: 'Weergeven in navigatiepaneel'
                }
            },
            excludedFolders: {
                name: 'Mappen verbergen (kluisprofiel)',
                desc: 'Kommagescheiden lijst van te verbergen mappen. Naampatronen: assets* (mappen beginnend met assets), *_temp (eindigend met _temp). Padpatronen: /archive (alleen root archive), /res* (root mappen beginnend met res), /*/temp (temp mappen één niveau diep), /projects/* (alle mappen binnen projects).',
                placeholder: 'templates, assets*, /archive, /res*'
            },
            descendantExcludedFolders: {
                name: 'Mappen uitsluiten van notities uit submappen (kluisprofiel)',
                desc: 'Kommagescheiden lijst met mappen die worden overgeslagen bij het verzamelen van notities uit submappen. Mappen blijven zichtbaar, en het selecteren van een map toont nog steeds de notities. Gebruikt dezelfde patronen als Mappen verbergen.',
                placeholder: 'dagelijks, bronnen, /archief'
            },
            showFileDate: {
                name: 'Datum tonen',
                desc: 'De datum onder notitienamen weergeven.'
            },
            alphabeticalDateMode: {
                name: 'Bij sorteren op naam',
                desc: 'Weer te geven datum wanneer notities alfabetisch zijn gesorteerd.',
                options: {
                    created: 'Aanmaakdatum',
                    modified: 'Wijzigingsdatum'
                }
            },
            showFileTags: {
                name: 'Bestandstags tonen',
                desc: 'Klikbare tags weergeven in bestandsitems.'
            },
            showFileTagAncestors: {
                name: 'Volledige tagpaden tonen',
                desc: "Volledige tag-hiërarchie paden weergeven. Ingeschakeld: 'ai/openai', 'werk/projecten/2024'. Uitgeschakeld: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Bestandstags kleuren',
                desc: 'Tagkleuren toepassen op tagbadges op bestandsitems.'
            },
            prioritizeColoredFileTags: {
                name: 'Gekleurde tags eerst tonen',
                desc: 'Sorteert gekleurde tags vóór andere tags in bestandsitems.'
            },
            showFileTagsInCompactMode: {
                name: 'Bestandstags tonen in compacte modus',
                desc: 'Tags weergeven wanneer datum, voorbeeld en afbeelding verborgen zijn.'
            },
            showFileProperties: {
                name: 'Bestandseigenschappen tonen',
                desc: 'Eigenschappen weergeven in bestandsitems. Gebruik het dialoogvenster "Zichtbaarheid van eigenschapssleutels" om te kiezen welke eigenschappen worden getoond.'
            },
            colorFileProperties: {
                name: 'Bestandseigenschappen kleuren',
                desc: 'Eigenschapkleuren toepassen op eigenschapbadges in bestandsitems.'
            },
            prioritizeColoredFileProperties: {
                name: 'Gekleurde eigenschappen eerst tonen',
                desc: 'Gekleurde eigenschappen sorteren vóór andere eigenschappen in bestandsitems.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Eigenschappen tonen in compacte modus',
                desc: 'Eigenschappen weergeven wanneer de compacte modus actief is.'
            },
            textCountDisplay: {
                name: 'Type telling',
                desc: 'Kies welke notitietellingen in bestandsitems verschijnen.',
                options: {
                    none: 'Geen',
                    words: 'Aantal woorden',
                    characters: 'Aantal tekens',
                    both: 'Aantal woorden en tekens'
                }
            },
            textCountPlacement: {
                name: 'Plaatsing',
                desc: 'Kies waar notitietellingen verschijnen.',
                options: {
                    title: 'In titel',
                    property: 'Als eigenschap'
                }
            },
            characterCountSpaces: {
                name: 'Aantal tekens',
                desc: 'Kies of spaties worden meegeteld in het aantal tekens.',
                options: {
                    include: 'Inclusief spaties',
                    exclude: 'Exclusief spaties'
                }
            },
            wordCountTargetProperty: {
                name: 'Doeleigenschap',
                desc: 'Frontmatter-eigenschapssleutel met het doelaantal woorden. Laat leeg om doelen te verbergen.'
            },
            showWordCountPercentage: {
                name: 'Doelpercentage tonen',
                desc: 'Toon alleen het voortgangspercentage wanneer een doelaantal woorden beschikbaar is.'
            },
            propertyFields: {
                name: 'Eigenschapssleutels (kluisprofiel)',
                desc: 'Frontmatter-eigenschapssleutels, met zichtbaarheid per sleutel voor navigatie en bestandslijst.',
                addButtonTooltip: 'Eigenschapssleutels configureren',
                noneConfigured: 'Geen eigenschappen geconfigureerd',
                singleConfigured: '1 eigenschap geconfigureerd: {properties}',
                multipleConfigured: '{count} eigenschappen geconfigureerd: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'Eigenschappen op afzonderlijke regels tonen',
                desc: 'Toon elke eigenschap op een eigen regel.'
            },
            enablePropertyInternalLinks: {
                name: 'Eigenschap-pills koppelen aan notities',
                desc: 'Klik op een eigenschap-pill om de gekoppelde notitie te openen.'
            },
            enablePropertyExternalLinks: {
                name: "Eigenschap-pills koppelen aan URL's",
                desc: 'Klik op een eigenschap-pill om de gekoppelde URL te openen.'
            },
            dateFormat: {
                name: 'Datumformaat',
                desc: 'Formaat voor het weergeven van datums (gebruikt Moment-formaat).',
                placeholder: 'D MMM YYYY',
                help: 'Veelvoorkomende formaten:\nD MMM YYYY = 25 mei 2022\nDD/MM/YYYY = 25/05/2022\nYYYY-MM-DD = 2022-05-25\n\nTokens:\nYYYY/YY = jaar\nMMMM/MMM/MM = maand\nDD/D = dag\ndddd/ddd = weekdag',
                helpTooltip: 'Formaat met Moment',
                momentLinkText: 'Moment-formaat'
            },
            timeFormat: {
                name: 'Tijdformaat',
                desc: 'Formaat voor het weergeven van tijden (gebruikt Moment-formaat).',
                placeholder: 'HH:mm',
                help: 'Veelvoorkomende formaten:\nHH:mm = 14:30 (24-uurs)\nh:mm a = 2:30 PM (12-uurs)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nTokens:\nHH/H = 24-uurs\nhh/h = 12-uurs\nmm = minuten\nss = seconden\na = AM/PM',
                helpTooltip: 'Formaat met Moment',
                momentLinkText: 'Moment-formaat'
            },
            showFilePreview: {
                name: 'Notitievoorbeeld tonen',
                desc: 'Voorbeeldtekst onder notitienamen weergeven.'
            },
            skipHeadingsInPreview: {
                name: 'Koppen overslaan in voorbeeld',
                desc: 'Kopregels overslaan bij het genereren van voorbeeldtekst.'
            },
            skipCodeBlocksInPreview: {
                name: 'Codeblokken overslaan in voorbeeld',
                desc: 'Codeblokken overslaan bij het genereren van voorbeeldtekst.'
            },
            stripHtmlInPreview: {
                name: 'HTML verwijderen in voorbeelden',
                desc: 'HTML-tags uit de voorbeeldtekst verwijderen. Kan de prestaties bij grote notities beïnvloeden.'
            },
            stripLatexInPreview: {
                name: 'LaTeX verwijderen in voorbeelden',
                desc: 'Inline- en blok-LaTeX-expressies uit de voorbeeldtekst verwijderen.'
            },
            previewProperties: {
                name: 'Voorbeeldeigenschappen',
                desc: 'Kommagescheiden lijst van frontmatter-eigenschappen om te controleren op voorbeeldtekst. De eerste eigenschap met tekst wordt gebruikt.',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'Terugvallen op notitie-inhoud',
                desc: 'Toon notitie-inhoud als voorbeeld wanneer geen van de opgegeven eigenschappen tekst bevat.'
            },
            previewRows: {
                name: 'Voorbeeldrijen',
                desc: 'Aantal weer te geven rijen voor voorbeeldtekst.',
                options: {
                    '1': '1 rij',
                    '2': '2 rijen',
                    '3': '3 rijen',
                    '4': '4 rijen',
                    '5': '5 rijen'
                }
            },
            fileNameRows: {
                name: 'Titelrijen',
                desc: 'Aantal weer te geven rijen voor notitietitels.',
                options: {
                    '1': '1 rij',
                    '2': '2 rijen',
                    '3': '3 rijen'
                }
            },
            useFolderColor: {
                name: 'Mapkleur gebruiken',
                desc: 'Notitietitels en bestandspictogrammen kleuren met de kleur van de bovenliggende map wanneer er geen aangepaste bestandskleur is ingesteld. Prioriteit: aangepaste bestandskleur > mapkleur > standaardkleur.'
            },
            showFeatureImage: {
                name: 'Uitgelichte afbeelding tonen',
                desc: 'Toont een miniatuur van de eerste afbeelding in de notitie.'
            },
            forceSquareFeatureImage: {
                name: 'Vierkante uitgelichte afbeelding afdwingen',
                desc: 'Uitgelichte afbeeldingen weergeven als vierkante miniaturen.'
            },
            featureImageProperties: {
                name: 'Afbeeldingseigenschappen',
                desc: 'Kommagescheiden lijst van frontmatter-eigenschappen om eerst te controleren. Valt terug op de eerste afbeelding in de markdown-inhoud.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'Notities met eigenschappen uitsluiten',
                desc: 'Kommagescheiden lijst van frontmatter-eigenschappen. Notities met een van deze eigenschappen slaan geen uitgelichte afbeeldingen op.',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: 'Weergavegrootte uitgelichte afbeelding',
                desc: 'Maximale weergavegrootte voor uitgelichte afbeeldingen in notitie-overzichten.',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'Pixelgrootte uitgelichte afbeelding',
                desc: 'Resolutie voor opgeslagen miniaturen van uitgelichte afbeeldingen. Verhoog deze waarde als grotere voorbeelden wazig lijken.',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'Externe afbeeldingen downloaden',
                desc: 'Download externe afbeeldingen en YouTube-miniaturen voor uitgelichte afbeeldingen.'
            },
            hideDrawingPreviewImages: {
                name: 'Geëxporteerde voorbeeldafbeeldingen verbergen',
                desc: 'Verberg geëxporteerde PNG-bestanden met tekeningvoorbeelden. Schakel "Verborgen items tonen" in om ze weer te geven.'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator toont door Excalidraw geëxporteerde PNG-bestanden als tekeningvoorbeelden.',
                items: [
                    'Open in de **Excalidraw-instellingen** **Embedding Excalidraw into your Notes and Exporting**, daarna **Export Settings**, daarna **Auto-export Settings**.',
                    'Schakel **Auto-export PNG** in. Schakel eventueel **Export both dark- and light-themed image** in.',
                    'Notebook Navigator zoekt naar **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** of **Drawing.excalidraw.light.png**.',
                    'Zolang **Geëxporteerde voorbeeldafbeeldingen verbergen** aanstaat, verschijnen de PNG-bestanden alleen als ook **Verborgen items tonen** aanstaat.'
                ]
            },
            showRootFolder: {
                name: 'Hoofdmap tonen',
                desc: 'De kluisnaam als hoofdmap in de structuur weergeven.'
            },
            showFolderIcons: {
                name: 'Mappictogrammen tonen',
                desc: 'Pictogrammen naast mappen in navigatiepaneel weergeven.'
            },
            inheritFolderColors: {
                name: 'Mapkleuren overerven',
                desc: 'Submappen erven kleur van bovenliggende mappen.'
            },
            folderSortOrder: {
                name: 'Map sorteervolgorde',
                desc: 'Klik met de rechtermuisknop op een map om een andere sorteervolgorde in te stellen voor de onderliggende items.',
                options: {
                    alphaAsc: 'A tot Z',
                    alphaDesc: 'Z tot A'
                }
            },
            showNoteCount: {
                name: 'Notitietelling tonen',
                desc: 'Notitietellingen naast mappen, tags en eigenschappen weergeven.'
            },
            showSectionIcons: {
                name: 'Pictogrammen tonen voor snelkoppelingen en recente items',
                desc: 'Pictogrammen naast items in de secties Snelkoppelingen en Recent weergeven.'
            },
            interfaceIcons: {
                name: 'Interface-iconen',
                desc: 'Bewerk werkbalk-, map-, tag-, eigenschap-, vastgezette, zoek- en sorteerichtogrammen.',
                buttonText: 'Iconen bewerken'
            },
            showIconsColorOnly: {
                name: 'Kleur alleen op pictogrammen toepassen',
                desc: 'Indien ingeschakeld, worden aangepaste kleuren alleen op pictogrammen toegepast. Indien uitgeschakeld, worden kleuren toegepast op zowel pictogrammen als tekstlabels.'
            },
            navRainbowMode: {
                name: 'Regenboogkleurmodus (kluis profiel)',
                desc: 'Regenboogkleuren toepassen in het navigatievenster.',
                options: {
                    none: 'Uit',
                    foreground: 'Tekstkleur',
                    background: 'Achtergrondkleur'
                }
            },
            navRainbowFirstColor: {
                name: 'Eerste kleur',
                desc: 'Eerste kleur in het regenboogverloop.'
            },
            navRainbowLastColor: {
                name: 'Laatste kleur',
                desc: 'Laatste kleur in het regenboogverloop.'
            },
            navRainbowTransitionStyle: {
                name: 'Overgangsstijl',
                desc: 'Interpolatie tussen de eerste en laatste kleur.',
                options: {
                    hue: 'Hue',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'Toepassen op snelkoppelingen',
                desc: 'Regenboogkleuren toepassen op snelkoppelingen.'
            },
            navRainbowApplyToRecent: {
                name: 'Toepassen op recente items',
                desc: 'Regenboogkleuren toepassen op recente items.'
            },
            navRainbowApplyToFolders: {
                name: 'Toepassen op mappen',
                desc: 'Regenboogkleuren toepassen op mappen.'
            },
            navRainbowFolderScope: {
                name: 'Mappenbereik',
                desc: 'Selecteer welke mapniveaus kleurtoewijzingen starten.',
                options: {
                    root: 'Hoofdniveau',
                    child: 'Subniveau',
                    all: 'Elk niveau'
                }
            },
            navRainbowApplyToTags: {
                name: 'Toepassen op tags',
                desc: 'Regenboogkleuren toepassen op tags.'
            },
            navRainbowTagScope: {
                name: 'Tagbereik',
                desc: 'Selecteer welke tagniveaus kleurtoewijzingen starten.',
                options: {
                    root: 'Hoofdniveau',
                    child: 'Subniveau',
                    all: 'Elk niveau'
                }
            },
            navRainbowApplyToProperties: {
                name: 'Toepassen op eigenschappen',
                desc: 'Regenboogkleuren toepassen op eigenschappen.'
            },
            navRainbowBalanceHueLuminance: {
                name: 'Consistente helderheid over kleurtonen', // (English: Consistent brightness across hues)
                desc: 'Interpoleert de helderheid tussen de begin- en eindkleuren tijdens kleurtoenovergangen.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'Aparte kleuren voor lichte en donkere modus', // (English: Separate light and dark mode colors)
                desc: 'Gebruik verschillende regenboogkleuren voor de lichte en donkere modus.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'Kleur van lichte modus naar donkere modus kopiëren', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'Eigenschappenbereik',
                desc: 'Selecteer welke eigenschapsniveaus kleurtoewijzingen starten.',
                options: {
                    root: 'Hoofdniveau',
                    child: 'Subniveau',
                    all: 'Elk niveau'
                }
            },
            collapseBehavior: {
                name: 'Items inklappen',
                desc: 'Kies wat de uitklappen/inklappen alle knop beïnvloedt.',
                options: {
                    all: 'Alles',
                    foldersOnly: 'Alleen mappen',
                    tagsOnly: 'Alleen tags',
                    propertiesOnly: 'Alleen eigenschappen'
                }
            },
            smartCollapse: {
                name: 'Geselecteerd item uitgeklapt houden',
                desc: 'Bij het inklappen het geselecteerde item en de bovenliggende items uitgeklapt houden.'
            },
            excludeVaultRootFromCollapse: {
                name: 'Kluisroot overslaan bij inklappen',
                desc: 'Bij het inklappen van alle items blijft de rootmap van de kluis in de huidige staat.'
            },
            navIndent: {
                name: 'Structuurinspringing',
                desc: 'De inspringbreedte aanpassen voor geneste mappen, tags en eigenschappen (pixels).'
            },
            navItemHeight: {
                name: 'Itemhoogte',
                desc: 'De hoogte van mappen, tags en eigenschappen in het navigatiepaneel aanpassen (pixels).'
            },
            navItemHeightScaleText: {
                name: 'Tekst schalen met itemhoogte',
                desc: 'Navigatietekstgrootte verminderen wanneer itemhoogte wordt verminderd.'
            },
            showIndentGuides: {
                name: 'Inspringlijnen tonen',
                desc: 'Inspringlijnen weergeven voor geneste mappen, tags en eigenschappen.'
            },
            navCountLeaderStyle: {
                name: 'Opvultekens tonen',
                desc: 'Punten, streepjes of een lijn weergeven tussen itemnamen en notitie-aantallen.',
                options: {
                    none: 'Geen',
                    dots: 'Punten (...)',
                    dashes: 'Streepjes (---)',
                    line: 'Lijn'
                }
            },
            navRootSpacing: {
                name: 'Hoofditem-afstand',
                desc: 'Afstand tussen mappen, tags en eigenschappen op hoofdniveau (pixels).'
            },
            showTags: {
                name: 'Tags tonen',
                desc: 'Tagsectie in de navigator weergeven.'
            },
            showTagIcons: {
                name: 'Tagpictogrammen tonen',
                desc: 'Pictogrammen naast tags in navigatiepaneel weergeven.'
            },
            inheritTagColors: {
                name: 'Tagkleuren overnemen',
                desc: 'Onderliggende tags nemen de kleur over van bovenliggende tags.'
            },
            tagSortOrder: {
                name: 'Tag sorteervolgorde',
                desc: 'Klik met de rechtermuisknop op een tag om een andere sorteervolgorde in te stellen voor de onderliggende items.',
                options: {
                    alphaAsc: 'A tot Z',
                    alphaDesc: 'Z tot A',
                    frequency: 'Frequentie',
                    lowToHigh: 'laag naar hoog',
                    highToLow: 'hoog naar laag'
                }
            },
            showAllTagsFolder: {
                name: 'Tags-map tonen',
                desc: '"Tags" weergeven als inklapbare map.'
            },
            showUntagged: {
                name: 'Notities zonder tags tonen',
                desc: '"Zonder tags" item weergeven voor notities zonder tags.'
            },
            scopeTagsToCurrentContext: {
                name: 'Tags filteren op selectie',
                desc: 'Alleen tags tonen die voorkomen in notities in de geselecteerde map of eigenschap.'
            },
            keepEmptyTagsProperty: {
                name: 'Tags-eigenschap behouden na verwijderen laatste tag',
                desc: 'De tags frontmatter-eigenschap behouden wanneer alle tags worden verwijderd. Indien uitgeschakeld, wordt de tags-eigenschap verwijderd uit frontmatter.'
            },
            showProperties: {
                name: 'Eigenschappen tonen',
                desc: 'Eigenschappensectie tonen in de navigator.',
                propertyKeysInfoPrefix: 'Configureer eigenschappen in ',
                propertyKeysInfoLinkText: 'Start > Eigenschapssleutels',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'Eigenschapspictogrammen tonen',
                desc: 'Pictogrammen naast eigenschappen in het navigatiepaneel tonen.'
            },
            inheritPropertyColors: {
                name: 'Eigenschapkleuren overnemen',
                desc: 'Eigenschapwaarden nemen de kleur en achtergrond over van hun eigenschapsleutel.'
            },
            propertySortOrder: {
                name: 'Sorteervolgorde eigenschappen',
                desc: 'Klik met de rechtermuisknop op een eigenschap om een andere sorteervolgorde voor de waarden in te stellen.',
                options: {
                    alphaAsc: 'A tot Z',
                    alphaDesc: 'Z tot A',
                    frequency: 'Frequentie',
                    lowToHigh: 'laag naar hoog',
                    highToLow: 'hoog naar laag'
                }
            },
            showAllPropertiesFolder: {
                name: 'Eigenschappenmap tonen',
                desc: '"Eigenschappen" als een inklapbare map tonen.'
            },
            scopePropertiesToCurrentContext: {
                name: 'Eigenschappen filteren op selectie',
                desc: 'Alleen eigenschappen tonen die voorkomen in notities in de geselecteerde map of tag.'
            },
            hiddenTags: {
                name: 'Tags verbergen (kluisprofiel)',
                desc: 'Kommagescheiden lijst van tagpatronen. Naampatronen: tag* (begint met), *tag (eindigt met). Padpatronen: archief (tag en afstammelingen), archief/* (alleen afstammelingen), projecten/*/concepten (wildcard in het midden).',
                placeholder: 'archief*, *concept, projecten/*/oud'
            },
            hiddenFileTags: {
                name: 'Notities met tags verbergen (kluisprofiel)',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'Mapnotities inschakelen',
                desc: 'Mappen met een overeenkomstig notitiebestand worden weergegeven als klikbare koppelingen.'
            },
            folderNoteType: {
                name: 'Standaard mapnotitie-type',
                desc: 'Mapnotitie-type aangemaakt vanuit het contextmenu.',
                options: {
                    ask: 'Vragen bij aanmaken',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'Mapnotitienaam',
                desc: 'Naam van de mapnotitie zonder extensie. Laat leeg om dezelfde naam als de map te gebruiken.',
                placeholder: 'index'
            },
            folderNoteNamePattern: {
                name: 'Naampatroon mapnotitie',
                desc: 'Naampatroon voor mapnotities zonder extensie. Gebruik {{folder}} om de mapnaam in te voegen. Indien ingesteld, is de mapnotitiesnaam niet van toepassing.'
            },
            folderNoteTemplate: {
                name: 'Mapnotitiesjabloon',
                desc: 'Sjabloonbestand dat wordt gebruikt bij het maken van mapnotities. Markdown-sjablonen kunnen Templater gebruiken. Canvas- en Base-sjablonen worden als bestandsinhoud gekopieerd. Stel de sjabloonmaplocatie in bij Bestandsbewerkingen > Sjablonen.',
                formatWarning: 'De sjabloonindeling moet overeenkomen met het geselecteerde type mapnotitie: .md, .canvas of .base.'
            },
            enableFolderNoteLinks: {
                name: 'Mapnamen openen mapnotities',
                desc: 'Klikken op een mapnaam opent de mapnotitie. Wanneer uitgeschakeld, leveren mapnotities alleen mapmetadata zoals naam, pictogram en kleur.'
            },
            hideFolderNoteInList: {
                name: 'Mapnotities in lijst verbergen',
                desc: 'Mapnotities verbergen in de bestandslijst.'
            },
            pinCreatedFolderNote: {
                name: 'Aangemaakte mapnotities vastpinnen',
                desc: 'Mapnotities vastmaken wanneer ze via het contextmenu worden aangemaakt.'
            },
            folderNoteOpenLocation: {
                name: 'Mapnotities openen in',
                desc: 'Kies waar mapnotities worden geopend bij het klikken op mapnotitiekoppelingen.',
                options: {
                    currentTab: 'Huidig tabblad',
                    newTab: 'Nieuw tabblad',
                    rightSidebar: 'Rechterzijbalk'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: 'Rechterzijbalk: Dichtstbijzijnde mapnotitie tonen',
                desc: 'Wanneer een map wordt geselecteerd, toont de rechterzijbalk automatisch de dichtstbijzijnde bovenliggende mapnotitie.'
            },
            confirmBeforeDelete: {
                name: 'Bevestigen voor verwijderen',
                desc: 'Bevestigingsdialoog tonen bij het verwijderen van notities of mappen'
            },
            deleteAttachments: {
                name: 'Bijlagen verwijderen bij het verwijderen van bestanden',
                desc: 'Automatisch gekoppelde bijlagen en gegenereerde tekeningvoorbeelden verwijderen als ze niet elders worden gebruikt',
                options: {
                    ask: 'Elke keer vragen',
                    always: 'Altijd',
                    never: 'Nooit'
                }
            },
            moveFileConflicts: {
                name: 'Verplaatsingsconflicten',
                desc: 'Bij het verplaatsen van een bestand naar een map waar al een bestand met dezelfde naam bestaat. Elke keer vragen (hernoemen, overschrijven, annuleren) of altijd hernoemen.',
                options: {
                    ask: 'Elke keer vragen',
                    rename: 'Altijd hernoemen'
                }
            },
            metadataCleanup: {
                name: 'Metadata opschonen',
                desc: 'Verwijdert verweesde metadata die achterblijft wanneer bestanden, mappen, tags of eigenschappen worden verwijderd, verplaatst of hernoemd buiten Obsidian. Dit beïnvloedt alleen het Notebook Navigator-instellingenbestand.',
                buttonText: 'Metadata opschonen',
                error: 'Opschonen van instellingen mislukt',
                loading: 'Metadata controleren...',
                statusClean: 'Geen metadata om op te schonen',
                statusCounts:
                    'Verweesde items: {folders} mappen, {tags} tags, {properties} eigenschappen, {files} bestanden, {pinned} pins, {separators} scheidingslijnen'
            },
            rebuildCache: {
                name: 'Cache opnieuw opbouwen',
                desc: 'Gebruik dit als u ontbrekende tags, onjuiste voorbeelden of ontbrekende uitgelichte afbeeldingen ervaart. Dit kan gebeuren na synchronisatieconflicten of onverwachte afsluitingen.',
                buttonText: 'Cache opnieuw opbouwen',
                error: 'Kan cache niet opnieuw opbouwen',
                indexingTitle: 'Kluis wordt geïndexeerd...',
                progress: 'Notebook Navigator-cache wordt bijgewerkt.'
            },
            externalIcons: {
                downloadButton: 'Downloaden',
                downloadingLabel: 'Downloaden...',
                removeButton: 'Verwijderen',
                statusInstalled: 'Gedownload (versie {version})',
                statusNotInstalled: 'Niet gedownload',
                versionUnknown: 'onbekend',
                downloadFailed: 'Kan {name} niet downloaden. Controleer uw verbinding en probeer opnieuw.',
                removeFailed: 'Kan {name} niet verwijderen.',
                infoNote:
                    'Gedownloade pictogrampakketten synchroniseren installatiestatus tussen apparaten. Pictogrampakketten blijven in de lokale database op elk apparaat; synchronisatie houdt alleen bij of ze moeten worden gedownload of verwijderd. Pictogrampakketten downloaden van de Notebook Navigator repository (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterDates: {
                name: 'Frontmatter metadata gebruiken',
                desc: 'Frontmatter gebruiken voor notitienaam, tijdstempels, pictogrammen en kleuren'
            },
            frontmatterIconField: {
                name: 'Pictogramveld',
                desc: 'Frontmatter-veld voor bestandspictogrammen. Laat leeg om pictogrammen te gebruiken die zijn opgeslagen in instellingen.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'Kleurveld',
                desc: 'Frontmatter-veld voor bestandskleuren. Laat leeg om kleuren te gebruiken die zijn opgeslagen in instellingen.',
                placeholder: 'color'
            },
            frontmatterBackgroundField: {
                name: 'Achtergrondveld',
                desc: 'Frontmatter-veld voor achtergrondkleuren. Laat leeg om achtergrondkleuren te gebruiken die zijn opgeslagen in instellingen.',
                placeholder: 'background'
            },
            frontmatterMigration: {
                name: 'Pictogrammen en kleuren migreren vanuit instellingen',
                desc: 'Opgeslagen in instellingen: {icons} pictogrammen, {colors} kleuren.',
                button: 'Migreren',
                buttonWorking: 'Migreren...',
                noticeNone: 'Geen bestandspictogrammen of kleuren opgeslagen in instellingen.',
                noticeDone: '{migratedIcons}/{icons} pictogrammen, {migratedColors}/{colors} kleuren gemigreerd.',
                noticeFailures: 'Mislukte vermeldingen: {failures}.',
                noticeError: 'Migratie mislukt. Controleer console voor details.'
            },
            frontmatterNameField: {
                name: 'Naamvelden',
                desc: 'Kommagescheiden lijst van frontmatter-velden. Eerste niet-lege waarde wordt gebruikt. Valt terug op bestandsnaam.',
                placeholder: 'title, name'
            },
            frontmatterCreatedField: {
                name: 'Aangemaakt tijdstempelveld',
                desc: 'Frontmatter-veldnaam voor de aangemaakt tijdstempel. Laat leeg om alleen bestandssysteemdatum te gebruiken.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'Gewijzigd tijdstempelveld',
                desc: 'Frontmatter-veldnaam voor de gewijzigd tijdstempel. Laat leeg om alleen bestandssysteemdatum te gebruiken.',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'Tijdstempelformaat',
                desc: 'Formaat gebruikt om tijdstempels in frontmatter te parseren. Laat leeg om ISO 8601 parsing te gebruiken.',
                helpTooltip: 'Formaat met Moment',
                momentLinkText: 'Moment-formaat',
                help: 'Veelvoorkomende formaten:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'Ontwikkeling ondersteunen',
                desc: 'Als u graag Notebook Navigator gebruikt, overweeg dan om de voortdurende ontwikkeling te ondersteunen.',
                buttonText: '❤️ Sponsor',
                coffeeButton: '☕️ Koop me een koffie'
            },
            updateCheckOnStart: {
                name: 'Controleren op nieuwe versie bij opstarten',
                desc: 'Controleert bij het opstarten op nieuwe plugin-releases en toont een melding wanneer een update beschikbaar is. Controles vinden hooguit één keer per dag plaats.',
                status: 'Nieuwe versie beschikbaar: {version}'
            },
            debugLogging: {
                name: 'Debuglogboek bij opstarten',
                desc: 'Schrijft opstartdiagnoses naar een Markdown-bestand met tijdstempel in de hoofdmap van de vault en stopt nadat het opstarten is gestabiliseerd. Het bestand kan worden gesynchroniseerd en bestandspaden bevatten.'
            },
            whatsNew: {
                name: 'Wat is er nieuw in Notebook Navigator {version}',
                desc: 'Bekijk recente updates en verbeteringen',
                buttonText: 'Bekijk recente updates'
            },
            masteringVideo: {
                name: 'Notebook Navigator beheersen (video)',
                desc: 'Deze video behandelt alles wat je nodig hebt om productief te zijn in Notebook Navigator, inclusief sneltoetsen, zoeken, tags en geavanceerde aanpassingen.'
            },
            cacheStatistics: {
                localCache: 'Lokale cache',
                items: 'items',
                withTags: 'met tags',
                withPreviewText: 'met voorbeeldtekst',
                withFeatureImage: 'met uitgelichte afbeelding',
                withMetadata: 'met metadata'
            },
            metadataInfo: {
                successfullyParsed: 'Succesvol geparsed',
                itemsWithName: 'items met naam',
                withCreatedDate: 'met aanmaakdatum',
                withModifiedDate: 'met wijzigingsdatum',
                withIcon: 'met pictogram',
                withColor: 'met kleur',
                failedToParse: 'Parseren mislukt',
                createdDates: 'aanmaakdatums',
                modifiedDates: 'wijzigingsdatums',
                checkTimestampFormat: 'Controleer uw tijdstempelformaat.',
                exportFailed: 'Exportfouten'
            }
        }
    },
    whatsNew: {
        title: 'Wat is er nieuw in Notebook Navigator',
        openBannerImage: 'Releasebannerafbeelding openen',
        supportMessage: 'Als u Notebook Navigator nuttig vindt, overweeg dan om de ontwikkeling te ondersteunen.',
        supportButton: 'Koop me een koffie',
        thanksButton: 'Bedankt!'
    }
};
