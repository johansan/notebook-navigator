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
        submit: 'Verzenden',
        noSelection: 'Geen selectie',
        untagged: 'Zonder tags',
        untitled: 'Zonder titel',
        featureImageAlt: 'Uitgelichte afbeelding',
        unknownError: 'Onbekende fout',
        updateBannerTitle: 'Notebook Navigator update beschikbaar',
        updateBannerInstruction: 'Werk bij in Instellingen -> Community plugins',
        updateIndicatorLabel: 'Nieuwe versie beschikbaar'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Selecteer een map of tag om notities te bekijken',
        emptyStateNoNotes: 'Geen notities',
        pinnedSection: 'Vastgepind',
        notesSection: 'Notities',
        filesSection: 'Bestanden',
        hiddenItemAriaLabel: '{name} (verborgen)'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Zonder tags',
        hiddenTags: 'Verborgen tags',
        tags: 'Tags'
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Snelkoppelingen',
        recentNotesHeader: 'Recente notities',
        recentFilesHeader: 'Recente bestanden',
        reorderRootFoldersTitle: 'Navigatie herschikken',
        reorderRootFoldersHint: 'Gebruik pijlen of sleep om te herschikken',
        vaultRootLabel: 'Kluis',
        resetRootToAlpha: 'Terugzetten naar alfabetische volgorde',
        resetRootToFrequency: 'Terugzetten naar frequentievolgorde',
        pinShortcuts: 'Snelkoppelingen vastpinnen',
        pinShortcutsAndRecentNotes: 'Snelkoppelingen en recente notities vastpinnen',
        pinShortcutsAndRecentFiles: 'Snelkoppelingen en recente bestanden vastpinnen',
        unpinShortcuts: 'Snelkoppelingen losmaken',
        unpinShortcutsAndRecentNotes: 'Snelkoppelingen en recente notities losmaken',
        unpinShortcutsAndRecentFiles: 'Snelkoppelingen en recente bestanden losmaken',
        profileMenuLabel: 'Profiel',
        profileMenuAria: 'Kluis profiel wijzigen'
    },

    shortcuts: {
        folderExists: 'Map staat al in snelkoppelingen',
        noteExists: 'Notitie staat al in snelkoppelingen',
        tagExists: 'Tag staat al in snelkoppelingen',
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
        scrollToTop: 'Naar boven scrollen',
        newFolder: 'Nieuwe map',
        newNote: 'Nieuwe notitie',
        mobileBackToNavigation: 'Terug naar navigatie',
        changeSortOrder: 'Sorteervolgorde wijzigen',
        defaultSort: 'Standaard',
        customSort: 'Aangepast',
        showFolders: 'Navigatie tonen',
        hideFolders: 'Navigatie verbergen',
        reorderRootFolders: 'Navigatie herschikken',
        finishRootFolderReorder: 'Klaar',
        toggleDescendantNotes: 'Notities uit submappen / afstammelingen tonen',
        autoExpandFoldersTags: 'Mappen en tags automatisch uitklappen',
        showExcludedItems: 'Verborgen mappen, tags en notities tonen',
        hideExcludedItems: 'Verborgen mappen, tags en notities verbergen',
        showDualPane: 'Dubbel paneel tonen',
        showSinglePane: 'Enkel paneel tonen',
        changeAppearance: 'Uiterlijk wijzigen',
        search: 'Zoeken'
    },

    // Search input
    searchInput: {
        placeholder: 'Zoeken...',
        placeholderOmnisearch: 'Omnisearch...',
        clearSearch: 'Zoekopdracht wissen',
        saveSearchShortcut: 'Zoeksnelkoppeling opslaan',
        removeSearchShortcut: 'Zoeksnelkoppeling verwijderen',
        shortcutModalTitle: 'Zoeksnelkoppeling opslaan',
        shortcutNamePlaceholder: 'Voer naam snelkoppeling in'
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
            copyDeepLink: 'Obsidian URL kopiëren',
            copyPath: 'Bestandssysteempad kopiëren',
            copyRelativePath: 'Vault-pad kopiëren',
            renameNote: 'Notitie hernoemen',
            renameFile: 'Bestand hernoemen',
            deleteNote: 'Notitie verwijderen',
            deleteFile: 'Bestand verwijderen',
            deleteMultipleNotes: '{count} notities verwijderen',
            deleteMultipleFiles: '{count} bestanden verwijderen',
            moveNoteToFolder: 'Notitie verplaatsen naar...',
            moveFileToFolder: 'Bestand verplaatsen naar...',
            moveMultipleNotesToFolder: '{count} notities verplaatsen naar...',
            moveMultipleFilesToFolder: '{count} bestanden verplaatsen naar...',
            addTag: 'Tag toevoegen',
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
            copyPath: 'Bestandssysteempad kopiëren',
            copyRelativePath: 'Vault-pad kopiëren',
            createFolderNote: 'Mapnotitie maken',
            detachFolderNote: 'Mapnotitie loskoppelen',
            deleteFolderNote: 'Mapnotitie verwijderen',
            changeIcon: 'Pictogram wijzigen',
            changeColor: 'Kleur wijzigen',
            changeBackground: 'Achtergrond wijzigen',
            excludeFolder: 'Map verbergen',
            unhideFolder: 'Map zichtbaar maken',
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
        navigation: {
            addSeparator: 'Scheidingslijn toevoegen',
            removeSeparator: 'Scheidingslijn verwijderen'
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
        standardPreset: 'Standaard',
        compactPreset: 'Compact',
        defaultSuffix: '(standaard)',
        titleRows: 'Titelrijen',
        previewRows: 'Voorbeeldrijen',
        groupBy: 'Groeperen op',
        defaultOption: (rows: number) => `Standaard (${rows})`,
        defaultTitleOption: (rows: number) => `Standaard titelrijen (${rows})`,
        defaultPreviewOption: (rows: number) => `Standaard voorbeeldrijen (${rows})`,
        defaultGroupOption: (groupLabel: string) => `Standaardgroepering (${groupLabel})`,
        titleRowOption: (rows: number) => `${rows} titelrij${rows === 1 ? '' : 'en'}`,
        previewRowOption: (rows: number) => `${rows} voorbeeldrij${rows === 1 ? '' : 'en'}`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'Pictogrammen zoeken...',
            recentlyUsedHeader: 'Recent gebruikt',
            emptyStateSearch: 'Begin met typen om pictogrammen te zoeken',
            emptyStateNoResults: 'Geen pictogrammen gevonden',
            showingResultsInfo: '50 van {count} resultaten weergegeven. Typ meer om te verfijnen.',
            emojiInstructions: 'Typ of plak een emoji om deze als pictogram te gebruiken',
            removeIcon: 'Pictogram verwijderen',
            allTabLabel: 'Alle'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Regel toevoegen'
        },
        interfaceIcons: {
            title: 'Interface-iconen',
            items: {
                'nav-shortcuts': 'Snelkoppelingen',
                'nav-recent-files': 'Recente bestanden',
                'nav-expand-all': 'Alles uitvouwen',
                'nav-collapse-all': 'Alles invouwen',
                'nav-tree-expand': 'Boompijl: uitvouwen',
                'nav-tree-collapse': 'Boompijl: invouwen',
                'nav-hidden-items': 'Verborgen items',
                'nav-root-reorder': 'Hoofdmappen herschikken',
                'nav-new-folder': 'Nieuwe map',
                'nav-show-single-pane': 'Enkel paneel tonen',
                'nav-show-dual-pane': 'Dubbel paneel tonen',
                'nav-profile-chevron': 'Profielmenu-pijl',
                'list-search': 'Zoeken',
                'list-descendants': 'Notities uit submappen',
                'list-sort-ascending': 'Sorteervolgorde: oplopend',
                'list-sort-descending': 'Sorteervolgorde: aflopend',
                'list-appearance': 'Uiterlijk wijzigen',
                'list-new-note': 'Nieuwe notitie',
                'nav-folder-open': 'Map open',
                'nav-folder-closed': 'Map gesloten',
                'nav-tag': 'Tag',
                'list-pinned': 'Vastgezette items'
            }
        },
        colorPicker: {
            currentColor: 'Huidig',
            newColor: 'Nieuw',
            presetColors: 'Vooraf ingestelde kleuren',
            userColors: 'Gebruikerskleuren',
            paletteDefault: 'Standaard',
            paletteCustom: 'Aangepast',
            copyColors: 'Kleur kopiëren',
            colorsCopied: 'Kleur gekopieerd naar klembord',
            copyClipboardError: 'Kon niet naar klembord schrijven',
            pasteColors: 'Kleur plakken',
            pasteClipboardError: 'Kan klembord niet lezen',
            pasteInvalidJson: 'Klembord bevat geen geldige tekst',
            pasteInvalidFormat: 'Een hex kleurwaarde verwacht',
            colorsPasted: 'Kleur succesvol geplakt',
            resetUserColors: 'Aangepaste kleuren wissen',
            clearCustomColorsConfirm: 'Alle aangepaste kleuren verwijderen?',
            userColorSlot: 'Kleur {slot}',
            recentColors: 'Recente kleuren',
            clearRecentColors: 'Recente kleuren wissen',
            removeRecentColor: 'Kleur verwijderen',
            removeColor: 'Kleur verwijderen',
            apply: 'Toepassen',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'Rood',
                orange: 'Oranje',
                amber: 'Amber',
                yellow: 'Geel',
                lime: 'Limoen',
                green: 'Groen',
                emerald: 'Smaragd',
                teal: 'Blauwgroen',
                cyan: 'Cyaan',
                sky: 'Hemelsblauw',
                blue: 'Blauw',
                indigo: 'Indigo',
                violet: 'Violet',
                purple: 'Paars',
                fuchsia: 'Fuchsia',
                pink: 'Roze',
                rose: 'Rozé',
                gray: 'Grijs',
                slate: 'Leisteen',
                stone: 'Steen'
            }
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
            invalidTagName: 'Voer een geldige tagnaam in.',
            descendantRenameError: 'Een tag kan niet in zichzelf of een afstammeling worden verplaatst.',
            confirmDelete: 'Tag verwijderen',
            file: 'bestand',
            files: 'bestanden'
        },
        fileSystem: {
            newFolderTitle: 'Nieuwe map',
            renameFolderTitle: 'Map hernoemen',
            renameFileTitle: 'Bestand hernoemen',
            deleteFolderTitle: "'{name}' verwijderen?",
            deleteFileTitle: "'{name}' verwijderen?",
            folderNamePrompt: 'Voer mapnaam in:',
            hideInOtherVaultProfiles: 'Verbergen in andere kluisprofielen',
            renamePrompt: 'Voer nieuwe naam in:',
            renameVaultTitle: 'Weergavenaam kluis wijzigen',
            renameVaultPrompt: 'Voer aangepaste weergavenaam in (laat leeg voor standaard):',
            deleteFolderConfirm: 'Weet u zeker dat u deze map en alle inhoud wilt verwijderen?',
            deleteFileConfirm: 'Weet u zeker dat u dit bestand wilt verwijderen?',
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
        navigationBanner: {
            placeholder: 'Afbeeldingen zoeken...',
            instructions: {
                navigate: 'om te navigeren',
                select: 'om banner in te stellen',
                dismiss: 'om te sluiten'
            }
        },
        tagSuggest: {
            placeholder: 'Tags zoeken...',
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
        welcome: {
            title: 'Welkom bij {pluginName}',
            introText:
                'Hallo! Voordat je begint, raad ik je sterk aan om de eerste vijf minuten van de onderstaande video te bekijken om te begrijpen hoe de panelen en de schakelaar "Notities uit submappen weergeven" werken.',
            continueText:
                'Als je nog vijf minuten hebt, bekijk dan de rest van de video om de compacte weergavemodi te begrijpen en hoe je snelkoppelingen en belangrijke sneltoetsen correct instelt.',
            thanksText: 'Heel erg bedankt voor het downloaden en veel plezier!',
            videoAlt: 'Notebook Navigator installeren en beheersen',
            openVideoButton: 'Video afspelen',
            closeButton: 'Ik bekijk het later'
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
            duplicateNote: 'Kan notitie niet dupliceren: {error}',
            createCanvas: 'Kan canvas niet maken: {error}',
            createDatabase: 'Kan database niet maken: {error}',
            duplicateFolder: 'Kan map niet dupliceren: {error}',
            openVersionHistory: 'Kan versiegeschiedenis niet openen: {error}',
            versionHistoryNotFound: 'Versiegeschiedenis commando niet gevonden. Zorg dat Obsidian Sync is ingeschakeld.',
            revealInExplorer: 'Kan bestand niet tonen in systeemverkenner: {error}',
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
            showFolder: 'Map zichtbaar: {name}'
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
            tagOperationsNotAvailable: 'Tagbewerkingen niet beschikbaar',
            tagsRequireMarkdown: 'Tags worden alleen ondersteund op Markdown-notities',
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
            untitled: 'Zonder titel',
            untitledNumber: 'Zonder titel {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Kan een map niet in zichzelf of een submap verplaatsen.',
            itemAlreadyExists: 'Een item met de naam "{name}" bestaat al op deze locatie.',
            failedToMove: 'Verplaatsen mislukt: {error}',
            failedToAddTag: 'Kan tag "{tag}" niet toevoegen',
            failedToClearTags: 'Kan tags niet wissen',
            failedToMoveFolder: 'Kan map "{name}" niet verplaatsen',
            failedToImportFiles: 'Importeren mislukt: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} bestanden bestaan al op de bestemming',
            addedTag: 'Tag "{tag}" toegevoegd aan {count} bestanden',
            filesAlreadyHaveTag: '{count} bestanden hebben deze tag of een specifiekere al',
            clearedTags: 'Alle tags verwijderd van {count} bestanden',
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

    // Weekdays
    weekdays: {
        sunday: 'Zondag',
        monday: 'Maandag',
        tuesday: 'Dinsdag',
        wednesday: 'Woensdag',
        thursday: 'Donderdag',
        friday: 'Vrijdag',
        saturday: 'Zaterdag'
    },

    // Plugin commands
    commands: {
        open: 'Openen',
        openHomepage: 'Startpagina openen',
        revealFile: 'Bestand tonen',
        search: 'Zoeken',
        toggleDualPane: 'Dubbel paneel in-/uitschakelen',
        selectVaultProfile: 'Kluisprofiel wijzigen',
        selectVaultProfile1: 'Kluisprofiel 1 selecteren',
        selectVaultProfile2: 'Kluisprofiel 2 selecteren',
        selectVaultProfile3: 'Kluisprofiel 3 selecteren',
        deleteFile: 'Bestanden verwijderen',
        createNewNote: 'Nieuwe notitie maken',
        createNewNoteFromTemplate: 'Nieuwe notitie uit sjabloon',
        moveFiles: 'Bestanden verplaatsen',
        selectNextFile: 'Volgend bestand selecteren',
        selectPreviousFile: 'Vorig bestand selecteren',
        convertToFolderNote: 'Converteren naar mapnotitie',
        setAsFolderNote: 'Als mapnotitie instellen',
        detachFolderNote: 'Mapnotitie loskoppelen',
        pinAllFolderNotes: 'Alle mapnotities vastpinnen',
        navigateToFolder: 'Navigeren naar map',
        navigateToTag: 'Navigeren naar tag',
        addShortcut: 'Toevoegen aan snelkoppelingen',
        openShortcut: 'Snelkoppeling {number} openen',
        toggleDescendants: 'Afstammelingen in-/uitschakelen',
        toggleHidden: 'Verborgen mappen, tags en notities in-/uitschakelen',
        toggleTagSort: 'Tag sorteervolgorde in-/uitschakelen',
        collapseExpand: 'Alle items in-/uitklappen',
        addTag: 'Tag toevoegen aan geselecteerde bestanden',
        removeTag: 'Tag verwijderen van geselecteerde bestanden',
        removeAllTags: 'Alle tags verwijderen van geselecteerde bestanden',
        rebuildCache: 'Cache opnieuw opbouwen'
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator',
        ribbonTooltip: 'Notebook Navigator',
        revealInNavigator: 'Tonen in Notebook Navigator'
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Laatst gewijzigd op',
        createdAt: 'Gemaakt op',
        file: 'bestand',
        files: 'bestanden',
        folder: 'map',
        folders: 'mappen'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'Metadatarapport met fouten geëxporteerd naar: {filename}',
            exportFailed: 'Kan metadatarapport niet exporteren'
        },
        sections: {
            general: 'Algemeen',
            navigationPane: 'Navigatiepaneel',
            icons: 'Pictogrampakketten',
            folders: 'Mappen',
            foldersAndTags: 'Mappen & tags',
            tags: 'Tags',
            search: 'Zoeken',
            searchAndHotkeys: 'Zoeken & sneltoetsen',
            listPane: 'Lijstpaneel',
            notes: 'Notities',
            hotkeys: 'Sneltoetsen',
            advanced: 'Geavanceerd'
        },
        groups: {
            general: {
                filtering: 'Filteren',
                behavior: 'Gedrag',
                view: 'Uiterlijk',
                icons: 'Iconen',
                desktopAppearance: 'Desktop-uiterlijk',
                formatting: 'Opmaak'
            },
            navigation: {
                appearance: 'Uiterlijk',
                shortcutsAndRecent: 'Snelkoppelingen en recente items'
            },
            list: {
                display: 'Uiterlijk',
                pinnedNotes: 'Vastgezette notities',
                quickActions: 'Snelle acties'
            },
            notes: {
                frontmatter: 'Frontmatter',
                icon: 'Icoon',
                title: 'Titel',
                previewText: 'Voorbeeldtekst',
                featureImage: 'Uitgelichte afbeelding',
                tags: 'Tags',
                date: 'Datum',
                parentFolder: 'Bovenliggende map'
            }
        },
        items: {
            searchProvider: {
                name: 'Zoekprovider',
                desc: 'Kies tussen snelle bestandsnaamzoekfunctie of volledige tekstzoekfunctie met Omnisearch plugin. (niet gesynchroniseerd)',
                options: {
                    internal: 'Filter zoeken',
                    omnisearch: 'Omnisearch (volledige tekst)'
                },
                info: {
                    filterSearch: {
                        title: 'Filter zoeken (standaard):',
                        description:
                            'Filtert bestanden op naam en tags binnen de huidige map en submappen. Filtermodus: gemengde tekst en tags komen overeen met alle termen (bijv. "project #werk"). Tagmodus: zoeken met alleen tags ondersteunt AND/OR-operatoren (bijv. "#werk AND #urgent", "#project OR #persoonlijk"). Cmd/Ctrl+Klik op tags om toe te voegen met AND, Cmd/Ctrl+Shift+Klik om toe te voegen met OR. Ondersteunt uitsluiting met ! prefix (bijv. !draft, !#archived) en het vinden van notities zonder tags met !#.'
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            'Volledige tekstzoekfunctie die uw hele kluis doorzoekt en vervolgens de resultaten filtert om alleen bestanden uit de huidige map, submappen of geselecteerde tags te tonen. Vereist dat de Omnisearch plugin is geïnstalleerd - indien niet beschikbaar, valt de zoekopdracht automatisch terug naar Filter zoeken.',
                        warningNotInstalled: 'Omnisearch plugin niet geïnstalleerd. Filter zoeken wordt gebruikt.',
                        limitations: {
                            title: 'Bekende beperkingen:',
                            performance: 'Prestaties: Kan traag zijn, vooral bij zoeken naar minder dan 3 tekens in grote kluizen',
                            pathBug:
                                'Padfout: Kan niet zoeken in paden met niet-ASCII-tekens en doorzoekt subpaden niet correct, wat invloed heeft op welke bestanden in zoekresultaten verschijnen',
                            limitedResults:
                                'Beperkte resultaten: Omdat Omnisearch de hele kluis doorzoekt en een beperkt aantal resultaten retourneert voordat er wordt gefilterd, kunnen relevante bestanden uit uw huidige map mogelijk niet verschijnen als er te veel overeenkomsten elders in de kluis bestaan',
                            previewText:
                                'Voorbeeldtekst: Notitievoorbeelden worden vervangen door Omnisearch-resultaatfragmenten, die mogelijk niet de daadwerkelijke zoekresultaatmarkering tonen als deze elders in het bestand verschijnt'
                        }
                    }
                }
            },
            listPaneTitle: {
                name: 'Titel lijstpaneel (alleen desktop)',
                desc: 'Kies waar de titel van het lijstpaneel wordt weergegeven.',
                options: {
                    header: 'Tonen in koptekst',
                    list: 'Tonen in lijstpaneel',
                    hidden: 'Niet tonen'
                }
            },
            sortNotesBy: {
                name: 'Notities sorteren op',
                desc: 'Kies hoe notities worden gesorteerd in de notitielijst.',
                options: {
                    'modified-desc': 'Datum bewerkt (nieuwste bovenaan)',
                    'modified-asc': 'Datum bewerkt (oudste bovenaan)',
                    'created-desc': 'Datum gemaakt (nieuwste bovenaan)',
                    'created-asc': 'Datum gemaakt (oudste bovenaan)',
                    'title-asc': 'Titel (A bovenaan)',
                    'title-desc': 'Titel (Z bovenaan)'
                }
            },
            revealFileOnListChanges: {
                name: 'Scroll naar geselecteerd bestand bij lijstwijzigingen',
                desc: 'Scroll naar het geselecteerde bestand bij het vastpinnen van notities, tonen van afstammelingen-notities, wijzigen van mapweergave of uitvoeren van bestandsoperaties.'
            },
            includeDescendantNotes: {
                name: 'Notities uit submappen / afstammelingen tonen (niet gesynchroniseerd)',
                desc: 'Notities uit geneste submappen en tag-afstammelingen opnemen bij het bekijken van een map of tag.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Vastgepinde notities beperken tot hun map',
                desc: 'Vastgepinde notities verschijnen alleen bij het bekijken van de map of tag waar ze zijn vastgepind.'
            },
            separateNoteCounts: {
                name: 'Huidige en afstammeling-tellingen apart tonen',
                desc: 'Notitietelingen weergeven in "huidig ▾ afstammelingen" formaat in mappen en tags.'
            },
            groupNotes: {
                name: 'Notities groeperen',
                desc: 'Koppen tussen notities weergeven gegroepeerd op datum of map. Tagweergaven gebruiken datumgroepen wanneer mapgroepering is ingeschakeld.',
                options: {
                    none: 'Niet groeperen',
                    date: 'Groeperen op datum',
                    folder: 'Groeperen op map'
                }
            },
            showPinnedGroupHeader: {
                name: 'Vastgepinde groepskop tonen',
                desc: 'De vastgepinde sectiekop boven vastgepinde notities weergeven.'
            },
            showPinnedIcon: {
                name: 'Vastgepind pictogram tonen',
                desc: 'Pictogram naast vastgepinde sectiekop weergeven.'
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
                desc: 'Bestandspictogrammen tonen met links uitgelijnde ruimte. Uitschakelen verwijdert zowel pictogrammen als inspringing. Prioriteit: aangepast > bestandsnaam > bestandstype > standaard.'
            },
            showFilenameMatchIcons: {
                name: 'Pictogrammen op bestandsnaam',
                desc: 'Pictogrammen toewijzen aan bestanden op basis van tekst in hun namen.'
            },
            fileNameIconMap: {
                name: 'Bestandsnaam-pictogram toewijzing',
                desc: 'Bestanden met de tekst krijgen het opgegeven pictogram. Eén toewijzing per regel: tekst=pictogram',
                placeholder: '# tekst=pictogram\nvergadering=LiCalendar\nfactuur=PhReceipt',
                editTooltip: 'Toewijzingen bewerken'
            },
            showCategoryIcons: {
                name: 'Pictogrammen op bestandstype',
                desc: 'Pictogrammen toewijzen aan bestanden op basis van hun extensie.'
            },
            fileTypeIconMap: {
                name: 'Bestandstype-pictogram toewijzing',
                desc: 'Bestanden met de extensie krijgen het opgegeven pictogram. Eén toewijzing per regel: extensie=pictogram',
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: 'Toewijzingen bewerken'
            },
            optimizeNoteHeight: {
                name: 'Variabele notitiehoogte',
                desc: 'Compacte hoogte gebruiken voor vastgepinde notities en notities zonder voorbeeldtekst.'
            },
            compactItemHeight: {
                name: 'Compacte itemhoogte',
                desc: 'Stel de hoogte van compacte lijstitems in op desktop en mobiel.',
                resetTooltip: 'Herstellen naar standaard (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Tekst schalen met compacte itemhoogte',
                desc: 'Compacte lijsttekst schalen wanneer de itemhoogte wordt verminderd.'
            },
            showParentFolder: {
                name: 'Bovenliggende map tonen',
                desc: 'De naam van de bovenliggende map weergeven voor notities in submappen of tags.'
            },
            parentFolderClickRevealsFile: {
                name: 'Klik op bovenliggende map opent map',
                desc: 'Klik op het label van de bovenliggende map om de map te openen in het lijstpaneel.'
            },
            showParentFolderColor: {
                name: 'Bovenliggende mapkleur tonen',
                desc: 'Mapkleuren gebruiken voor labels van bovenliggende mappen.'
            },
            showQuickActions: {
                name: 'Snelle acties tonen (alleen desktop)',
                desc: 'Actieknoppen tonen bij zweven over bestanden. Knopbediening selecteert welke acties verschijnen.'
            },
            dualPane: {
                name: 'Dubbel paneellay-out (niet gesynchroniseerd)',
                desc: 'Navigatiepaneel en lijstpaneel naast elkaar tonen op desktop.'
            },
            dualPaneOrientation: {
                name: 'Dubbel paneel oriëntatie (niet gesynchroniseerd)',
                desc: 'Kies horizontale of verticale lay-out wanneer dubbel paneel actief is.',
                options: {
                    horizontal: 'Horizontale splitsing',
                    vertical: 'Verticale splitsing'
                }
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
                name: 'Zoomniveau (niet gesynchroniseerd)',
                desc: 'Regelt het algemene zoomniveau van Notebook Navigator.'
            },
            startView: {
                name: 'Standaard opstartweergave',
                desc: 'Kies welk paneel wordt weergegeven bij het openen van Notebook Navigator. Navigatiepaneel toont snelkoppelingen, recente notities en mappenstructuur. Lijstpaneel toont direct de notitielijst.',
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
            autoRevealActiveNote: {
                name: 'Actieve notitie automatisch tonen',
                desc: 'Notities automatisch tonen wanneer geopend vanuit Snelle Wisselaar, links of zoeken.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Gebeurtenissen van rechter zijbalk negeren',
                desc: 'Actieve notitie niet wijzigen bij klikken of wijzigen van notities in de rechter zijbalk.'
            },
            paneTransitionDuration: {
                name: 'Enkelvoudig paneel animatie',
                desc: 'Transitieduur bij het wisselen tussen panelen in enkelvoudig-paneel-modus (milliseconden).',
                resetTooltip: 'Herstellen naar standaard'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Eerste notitie automatisch selecteren (alleen desktop)',
                desc: 'Automatisch de eerste notitie openen bij het wisselen van mappen of tags.'
            },
            skipAutoScroll: {
                name: 'Automatisch scrollen voor snelkoppelingen uitschakelen',
                desc: 'Het navigatiepaneel niet scrollen bij klikken op items in snelkoppelingen.'
            },
            autoExpandFoldersTags: {
                name: 'Uitvouwen bij selectie',
                desc: 'Mappen en tags uitvouwen bij selectie. In enkelvoudige paneelmodus: eerste selectie vouwt uit, tweede selectie toont bestanden.'
            },
            springLoadedFolders: {
                name: 'Uitvouwen bij slepen (alleen desktop)',
                desc: 'Mappen en tags uitvouwen bij zweven tijdens slepen.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Vertraging bij eerste uitvouw',
                desc: 'Vertraging voordat de eerste map of tag uitvouwt tijdens slepen (seconden).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Vertraging bij volgende uitvouwen',
                desc: 'Vertraging voordat extra mappen of tags uitvouwen tijdens dezelfde sleepactie (seconden).'
            },
            navigationBanner: {
                name: 'Navigatiebanner (kluisprofiel)',
                desc: 'Een afbeelding weergeven boven het navigatiepaneel. Verandert met het geselecteerde kluisprofiel.',
                current: 'Huidige banner: {path}',
                chooseButton: 'Afbeelding kiezen'
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
                name: 'Recente notities tonen',
                desc: 'De sectie recente notities weergeven in het navigatiepaneel.'
            },
            recentNotesCount: {
                name: 'Aantal recente notities',
                desc: 'Aantal weer te geven recente notities.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Recente notities met snelkoppelingen vastpinnen',
                desc: 'Recente notities opnemen wanneer snelkoppelingen zijn vastgepind.'
            },
            showTooltips: {
                name: 'Tooltips tonen',
                desc: 'Zweeftips met extra informatie weergeven voor notities en mappen.'
            },
            showTooltipPath: {
                name: 'Pad tonen',
                desc: 'Het mappad onder notitienamen in tooltips weergeven.'
            },
            resetPaneSeparator: {
                name: 'Paneelscheidingspositie resetten',
                desc: 'De versleepbare scheiding tussen navigatiepaneel en lijstpaneel resetten naar standaardpositie.',
                buttonText: 'Scheiding resetten',
                notice: 'Scheidingspositie gereset. Herstart Obsidian of heropen Notebook Navigator om toe te passen.'
            },
            multiSelectModifier: {
                name: 'Meervoudige selectie modifier (alleen desktop)',
                desc: 'Kies welke modificatortoets meervoudige selectie in-/uitschakelt. Wanneer Option/Alt is geselecteerd, opent Cmd/Ctrl klik notities in een nieuw tabblad.',
                options: {
                    cmdCtrl: 'Cmd/Ctrl klik',
                    optionAlt: 'Option/Alt klik'
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
                desc: 'Kies het bestand dat Notebook Navigator automatisch opent, zoals een dashboard.',
                current: 'Huidig: {path}',
                currentMobile: 'Mobiel: {path}',
                chooseButton: 'Bestand kiezen',

                separateMobile: {
                    name: 'Aparte mobiele startpagina',
                    desc: 'Een andere startpagina gebruiken voor mobiele apparaten.'
                }
            },
            excludedNotes: {
                name: 'Notities verbergen (kluisprofiel)',
                desc: 'Kommagescheiden lijst van frontmatter-eigenschappen. Notities met een van deze eigenschappen worden verborgen (bijv. draft, private, archived).',
                placeholder: 'draft, private'
            },
            excludedFileNamePatterns: {
                name: 'Bestanden verbergen (kluisprofiel)',
                desc: 'Kommagescheiden lijst van bestandsnaampatronen om te verbergen. Ondersteunt * jokertekens en / paden (bijv. temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Kluis profiel',
                desc: 'Profielen bewaren bestandstypezichtbaarheid, verborgen bestanden, verborgen mappen, verborgen labels, verborgen notities, snelkoppelingen en navigatiebanner. Wissel van profiel via de koptekst van het navigatiepaneel.',
                defaultName: 'Standaard',
                addButton: 'Profiel toevoegen',
                editProfilesButton: 'Profielen bewerken',
                addProfileOption: 'Profiel toevoegen...',
                applyButton: 'Toepassen',
                editButton: 'Profiel bewerken',
                deleteButton: 'Profiel verwijderen',
                addModalTitle: 'Profiel toevoegen',
                editProfilesModalTitle: 'Profielen bewerken',
                editModalTitle: 'Profiel bewerken',
                addModalPlaceholder: 'Profielnaam',
                deleteModalTitle: '{name} verwijderen',
                deleteModalMessage:
                    '{name} verwijderen? Verborgen bestands-, map-, label- en notitiefilters opgeslagen in dit profiel worden verwijderd.',
                moveUp: 'Omhoog verplaatsen',
                moveDown: 'Omlaag verplaatsen',
                errors: {
                    emptyName: 'Voer een profielnaam in',
                    duplicateName: 'Profielnaam bestaat al'
                }
            },
            vaultTitle: {
                name: 'Kluistitel plaatsing (alleen desktop)',
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
            dateFormat: {
                name: 'Datumformaat',
                desc: 'Formaat voor het weergeven van datums (gebruikt date-fns formaat).',
                placeholder: 'd MMM yyyy',
                help: 'Veelvoorkomende formaten:\nd MMM yyyy = 25 mei 2022\ndd/MM/yyyy = 25/05/2022\nyyyy-MM-dd = 2022-05-25\n\nTokens:\nyyyy/yy = jaar\nMMMM/MMM/MM = maand\ndd/d = dag\nEEEE/EEE = weekdag',
                helpTooltip: 'Klik voor formaatverwijzing'
            },
            timeFormat: {
                name: 'Tijdformaat',
                desc: 'Formaat voor het weergeven van tijden (gebruikt date-fns formaat).',
                placeholder: 'HH:mm',
                help: 'Veelvoorkomende formaten:\nHH:mm = 14:30 (24-uurs)\nh:mm a = 2:30 PM (12-uurs)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nTokens:\nHH/H = 24-uurs\nhh/h = 12-uurs\nmm = minuten\nss = seconden\na = AM/PM',
                helpTooltip: 'Klik voor formaatverwijzing'
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
            previewProperties: {
                name: 'Voorbeeldeigenschappen',
                desc: 'Kommagescheiden lijst van frontmatter-eigenschappen om te controleren op voorbeeldtekst. De eerste eigenschap met tekst wordt gebruikt.',
                placeholder: 'summary, description, abstract',
                info: 'Als er geen voorbeeldtekst wordt gevonden in de opgegeven eigenschappen, wordt het voorbeeld gegenereerd uit de notitie-inhoud.'
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
                    '2': '2 rijen'
                }
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
                desc: 'Kommagescheiden lijst van frontmatter-eigenschappen om te controleren op miniatuurafbeeldingen.',
                placeholder: 'thumbnail, featureResized, feature'
            },

            downloadExternalFeatureImages: {
                name: 'Externe afbeeldingen downloaden',
                desc: 'Download externe afbeeldingen en YouTube-miniaturen voor uitgelichte afbeeldingen.'
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
            showNoteCount: {
                name: 'Notitietelling tonen',
                desc: 'Het aantal notities naast elke map en tag weergeven.'
            },
            showSectionIcons: {
                name: 'Pictogrammen tonen voor snelkoppelingen en recente items',
                desc: 'Pictogrammen voor navigatiesecties zoals Snelkoppelingen en Recente bestanden weergeven.'
            },
            interfaceIcons: {
                name: 'Interface-iconen',
                desc: 'Bewerk werkbalk-, map-, tag-, vastgezette, zoek- en sorteerichtogrammen.',
                buttonText: 'Iconen bewerken'
            },
            showIconsColorOnly: {
                name: 'Kleur alleen op pictogrammen toepassen',
                desc: 'Indien ingeschakeld, worden aangepaste kleuren alleen op pictogrammen toegepast. Indien uitgeschakeld, worden kleuren toegepast op zowel pictogrammen als tekstlabels.'
            },
            collapseBehavior: {
                name: 'Items inklappen',
                desc: 'Kies wat de uitklappen/inklappen alle knop beïnvloedt.',
                options: {
                    all: 'Alle mappen en tags',
                    foldersOnly: 'Alleen mappen',
                    tagsOnly: 'Alleen tags'
                }
            },
            smartCollapse: {
                name: 'Geselecteerd item uitgeklapt houden',
                desc: 'Bij het inklappen de momenteel geselecteerde map of tag en de bovenliggende items uitgeklapt houden.'
            },
            navIndent: {
                name: 'Structuurinspringing',
                desc: 'De inspringbreedte aanpassen voor geneste mappen en tags.'
            },
            navItemHeight: {
                name: 'Itemhoogte',
                desc: 'De hoogte van mappen en tags in het navigatiepaneel aanpassen.'
            },
            navItemHeightScaleText: {
                name: 'Tekst schalen met itemhoogte',
                desc: 'Navigatietekstgrootte verminderen wanneer itemhoogte wordt verminderd.'
            },
            navRootSpacing: {
                name: 'Hoofditem-afstand',
                desc: 'Afstand tussen mappen en tags op hoofdniveau.'
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
                desc: 'Kies hoe tags worden geordend in het navigatiepaneel. (niet gesynchroniseerd)',
                options: {
                    alphaAsc: 'A tot Z',
                    alphaDesc: 'Z tot A',
                    frequencyAsc: 'Frequentie (laag naar hoog)',
                    frequencyDesc: 'Frequentie (hoog naar laag)'
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
            keepEmptyTagsProperty: {
                name: 'Tags-eigenschap behouden na verwijderen laatste tag',
                desc: 'De tags frontmatter-eigenschap behouden wanneer alle tags worden verwijderd. Indien uitgeschakeld, wordt de tags-eigenschap verwijderd uit frontmatter.'
            },
            hiddenTags: {
                name: 'Tags verbergen (kluisprofiel)',
                desc: 'Kommagescheiden lijst van tagpatronen. Naampatronen: tag* (begint met), *tag (eindigt met). Padpatronen: archief (tag en afstammelingen), archief/* (alleen afstammelingen), projecten/*/concepten (wildcard in het midden).',
                placeholder: 'archief*, *concept, projecten/*/oud'
            },
            enableFolderNotes: {
                name: 'Mapnotities inschakelen',
                desc: 'Indien ingeschakeld, worden mappen met gekoppelde notities weergegeven als klikbare links.'
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
            folderNoteProperties: {
                name: 'Mapnotitie-eigenschappen',
                desc: 'YAML frontmatter toegevoegd aan nieuwe mapnotities. --- markers worden automatisch toegevoegd.',
                placeholder: 'theme: dark\nfoldernote: true'
            },
            hideFolderNoteInList: {
                name: 'Mapnotities in lijst verbergen',
                desc: 'De mapnotitie verbergen in de notitielijst van de map.'
            },
            pinCreatedFolderNote: {
                name: 'Aangemaakte mapnotities vastpinnen',
                desc: 'Mapnotities automatisch vastpinnen wanneer aangemaakt vanuit het contextmenu.'
            },
            confirmBeforeDelete: {
                name: 'Bevestigen voor verwijderen',
                desc: 'Bevestigingsdialoog tonen bij het verwijderen van notities of mappen'
            },
            interceptTagClicks: {
                name: 'Navigeer naar tags bij klikken',
                desc: 'Bij het klikken op tags in notities, navigeer naar die tag in Notebook Navigator in plaats van de Obsidian-zoekfunctie te activeren.'
            },
            metadataCleanup: {
                name: 'Metadata opschonen',
                desc: 'Verwijdert verweesde metadata die achterblijft wanneer bestanden, mappen of tags worden verwijderd, verplaatst of hernoemd buiten Obsidian. Dit beïnvloedt alleen het Notebook Navigator-instellingenbestand.',
                buttonText: 'Metadata opschonen',
                error: 'Opschonen van instellingen mislukt',
                loading: 'Metadata controleren...',
                statusClean: 'Geen metadata om op te schonen',
                statusCounts:
                    'Verweesde items: {folders} mappen, {tags} tags, {files} bestanden, {pinned} pins, {separators} scheidingslijnen'
            },
            rebuildCache: {
                name: 'Cache opnieuw opbouwen',
                desc: 'Gebruik dit als u ontbrekende tags, onjuiste voorbeelden of ontbrekende uitgelichte afbeeldingen ervaart. Dit kan gebeuren na synchronisatieconflicten of onverwachte afsluitingen.',
                buttonText: 'Cache opnieuw opbouwen',
                success: 'Cache opnieuw opgebouwd',
                error: 'Kan cache niet opnieuw opbouwen',
                indexingTitle: 'Kluis wordt geïndexeerd...',
                progress: 'Notebook Navigator-cache wordt bijgewerkt.'
            },
            hotkeys: {
                intro: 'Bewerk <plugin folder>/notebook-navigator/data.json om Notebook Navigator sneltoetsen aan te passen. Open het bestand en zoek de sectie "keyboardShortcuts". Elke invoer gebruikt deze structuur:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Shift',
                    '"Ctrl" = Control (gebruik bij voorkeur "Mod" voor cross-platform)'
                ],
                guidance:
                    'Voeg meerdere toewijzingen toe om alternatieve toetsen te ondersteunen, zoals de ArrowUp en K bindingen hierboven. Combineer modifiers in één invoer door elke waarde te vermelden, bijvoorbeeld "modifiers": ["Mod", "Shift"]. Toetsenbordreeksen zoals "gg" of "dd" worden niet ondersteund. Herlaad Obsidian na het bewerken van het bestand.'
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
            frontmatterSaveMetadata: {
                name: 'Pictogrammen en kleuren opslaan in frontmatter',
                desc: 'Bestandspictogrammen en -kleuren automatisch naar frontmatter schrijven met behulp van de hierboven geconfigureerde velden.'
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
                placeholder: 'titel, naam'
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
                desc: 'Formaat gebruikt om tijdstempels in frontmatter te parseren. Laat leeg om ISO 8601 formaat te gebruiken',
                helpTooltip: 'Zie date-fns formaatdocumentatie',
                help: "Veelvoorkomende formaten:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'Ontwikkeling ondersteunen',
                desc: 'Als u graag Notebook Navigator gebruikt, overweeg dan om de voortdurende ontwikkeling te ondersteunen.',
                buttonText: '❤️ Sponsor',
                coffeeButton: '☕️ Koop me een koffie'
            },
            updateCheckOnStart: {
                name: 'Controleren op nieuwe versie bij opstarten',
                desc: 'Controleert bij het opstarten op nieuwe plugin-releases en toont een melding wanneer een update beschikbaar is. Elke versie wordt slechts één keer aangekondigd en controles vinden hooguit één keer per dag plaats.',
                status: 'Nieuwe versie beschikbaar: {version}'
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
        supportMessage: 'Als u Notebook Navigator nuttig vindt, overweeg dan om de ontwikkeling te ondersteunen.',
        supportButton: 'Koop me een koffie',
        thanksButton: 'Bedankt!'
    }
};
