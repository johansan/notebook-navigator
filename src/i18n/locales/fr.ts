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
export const STRINGS_FR = {
    // Common UI elements
    common: {
        cancel: 'Annuler', // Button text for canceling dialogs and operations (English: Cancel)
        delete: 'Supprimer', // Button text for delete operations in dialogs (English: Delete)
        remove: 'Supprimer', // Button text for remove operations in dialogs (English: Remove)
        submit: 'Soumettre', // Button text for submitting forms and dialogs (English: Submit)
        noSelection: 'Aucune sélection', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Sans étiquette', // Label for notes without any tags (English: Untagged)
        untitled: 'Sans titre', // Default name for notes without a title (English: Untitled)
        featureImageAlt: 'Image vedette', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Erreur inconnue', // Generic fallback when an error has no message (English: Unknown error)
        updateBannerTitle: 'Mise à jour Notebook Navigator disponible',
        updateBannerInstruction: 'Mettre à jour dans Paramètres -> Extensions communautaires',
        updateIndicatorLabel: 'Nouvelle version disponible'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Sélectionnez un dossier ou une étiquette pour afficher les notes', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Aucune note', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: '📌 Épinglées', // Header for the pinned notes section at the top of file list (English: 📌 Pinned)
        notesSection: 'Notes', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Fichiers' // Header shown between pinned and regular items when showing supported or all files (English: Files)
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Sans étiquette', // Label for the special item showing notes without tags (English: Untagged)
        hiddenTags: 'Étiquettes cachées', // Label for the hidden tags virtual folder (English: Hidden tags)
        tags: 'Étiquettes' // Label for the tags virtual folder (English: Tags)
    },

    navigationPane: {
        shortcutsHeader: 'Raccourcis',
        recentNotesHeader: 'Notes récentes',
        recentFilesHeader: 'Fichiers récents',
        reorderRootFoldersTitle: 'Réorganiser les sections de navigation',
        reorderRootFoldersHint: "Faites glisser les en-têtes ou les éléments pour changer l'ordre",
        vaultRootLabel: 'Coffre',
        resetRootToAlpha: "Réinitialiser l'ordre alphabétique",
        resetRootToFrequency: 'Réinitialiser selon la fréquence',
        dragHandleLabel: 'Faire glisser pour réorganiser',
        pinShortcuts: 'Épingler les raccourcis',
        unpinShortcuts: 'Détacher les raccourcis'
    },

    shortcuts: {
        folderExists: 'Le dossier est déjà dans les raccourcis',
        noteExists: 'La note est déjà dans les raccourcis',
        tagExists: "L'étiquette est déjà dans les raccourcis",
        searchExists: 'Le raccourci de recherche existe déjà',
        emptySearchQuery: "Entrez une requête de recherche avant de l'enregistrer",
        emptySearchName: "Entrez un nom avant d'enregistrer la recherche",
        add: 'Ajouter aux raccourcis',
        remove: 'Retirer des raccourcis',
        moveUp: 'Déplacer vers le haut',
        moveDown: 'Déplacer vers le bas',
        folderNotesPinned: '{count} notes de dossier épinglées'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Replier les éléments', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'Déplier tous les éléments', // Tooltip for button that expands all items (English: Expand all items)
        scrollToTop: 'Défiler vers le haut',
        newFolder: 'Nouveau dossier', // Tooltip for create new folder button (English: New folder)
        newNote: 'Nouvelle note', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Retour à la navigation', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeSortOrder: "Changer l'ordre de tri", // Tooltip for the sort order toggle button (English: Change sort order)
        defaultSort: 'Par défaut', // Label for default sorting mode (English: Default)
        customSort: 'Personnalisé', // Label for custom sorting mode (English: Custom)
        showFolders: 'Afficher la navigation', // Tooltip for button to show the navigation pane (English: Show navigation)
        hideFolders: 'Masquer la navigation', // Tooltip for button to hide the navigation pane (English: Hide navigation)
        reorderRootFolders: 'Réorganiser les dossiers racine et les étiquettes',
        finishRootFolderReorder: 'Terminer la réorganisation',
        toggleDescendantNotes: 'Afficher les notes des sous-dossiers / descendants', // Tooltip for button to toggle showing notes from descendants (English: Show notes from subfolders / descendants)
        autoExpandFoldersTags: 'Développer automatiquement les dossiers et les étiquettes', // Tooltip for button to toggle auto-expanding folders and tags when selected (English: Auto-expand folders and tags)
        showExcludedItems: 'Afficher les éléments masqués', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Masquer les éléments masqués', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Afficher les panneaux doubles', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Afficher panneau unique', // Tooltip for button to show single-pane layout (English: Show single pane)
        changeAppearance: "Changer l'apparence", // Tooltip for button to change folder appearance settings (English: Change appearance)
        search: 'Rechercher' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Rechercher...', // Placeholder text for search input (English: Search...)
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Effacer la recherche', // Tooltip for clear search button (English: Clear search)
        saveSearchShortcut: 'Ajouter la recherche aux raccourcis',
        removeSearchShortcut: 'Retirer la recherche des raccourcis',
        shortcutModalTitle: 'Enregistrer la recherche',
        shortcutNameLabel: 'Nom du raccourci',
        shortcutNamePlaceholder: 'Saisir le nom du raccourci'
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'Ouvrir dans un nouvel onglet',
            openToRight: 'Ouvrir à droite',
            openInNewWindow: 'Ouvrir dans une nouvelle fenêtre',
            openMultipleInNewTabs: 'Ouvrir {count} notes dans de nouveaux onglets',
            openMultipleToRight: 'Ouvrir {count} notes à droite',
            openMultipleInNewWindows: 'Ouvrir {count} notes dans de nouvelles fenêtres',
            pinNote: 'Épingler la note',
            unpinNote: 'Désépingler la note',
            pinMultipleNotes: 'Épingler {count} notes',
            unpinMultipleNotes: 'Désépingler {count} notes',
            duplicateNote: 'Dupliquer la note',
            duplicateMultipleNotes: 'Dupliquer {count} notes',
            openVersionHistory: "Ouvrir l'historique des versions",
            revealInFolder: 'Afficher dans le dossier',
            revealInFinder: 'Afficher dans le Finder',
            showInExplorer: "Afficher dans l'explorateur système",
            copyDeepLink: "Copier l'URL Obsidian",
            copyPath: 'Copier le chemin',
            copyRelativePath: 'Copier le chemin relatif',
            renameNote: 'Renommer la note',
            deleteNote: 'Supprimer la note',
            deleteMultipleNotes: 'Supprimer {count} notes',
            moveToFolder: 'Déplacer vers...',
            moveMultipleToFolder: 'Déplacer {count} fichiers vers...',
            addTag: 'Ajouter une étiquette',
            removeTag: 'Supprimer l’étiquette',
            removeAllTags: 'Supprimer toutes les étiquettes',
            changeIcon: "Changer l'icône",
            changeColor: 'Changer la couleur',
            // File-specific context menu items (non-markdown files)
            openMultipleFilesInNewTabs: 'Ouvrir {count} fichiers dans de nouveaux onglets',
            openMultipleFilesToRight: 'Ouvrir {count} fichiers à droite',
            openMultipleFilesInNewWindows: 'Ouvrir {count} fichiers dans de nouvelles fenêtres',
            pinFile: 'Épingler le fichier',
            unpinFile: 'Désépingler le fichier',
            pinMultipleFiles: 'Épingler {count} fichiers',
            unpinMultipleFiles: 'Désépingler {count} fichiers',
            duplicateFile: 'Dupliquer le fichier',
            duplicateMultipleFiles: 'Dupliquer {count} fichiers',
            renameFile: 'Renommer le fichier',
            deleteFile: 'Supprimer le fichier',
            deleteMultipleFiles: 'Supprimer {count} fichiers'
        },
        folder: {
            newNote: 'Nouvelle note',
            newFolder: 'Nouveau dossier',
            newCanvas: 'Nouveau canevas',
            newBase: 'Nouvelle base de données',
            newDrawing: 'Nouveau dessin',
            duplicateFolder: 'Dupliquer le dossier',
            searchInFolder: 'Rechercher dans le dossier',
            createFolderNote: 'Créer une note de dossier',
            deleteFolderNote: 'Supprimer la note de dossier',
            changeIcon: "Changer l'icône",
            changeColor: 'Changer la couleur',
            changeBackground: 'Changer l’arrière-plan',
            excludeFolder: 'Masquer le dossier',
            moveFolder: 'Déplacer vers...',
            renameFolder: 'Renommer le dossier',
            deleteFolder: 'Supprimer le dossier'
        },
        tag: {
            changeIcon: "Changer l'icône",
            changeColor: 'Changer la couleur',
            changeBackground: 'Changer l’arrière-plan',
            showTag: 'Afficher l’étiquette',
            hideTag: 'Masquer l’étiquette'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        defaultPreset: 'Apparence par défaut',
        slimPreset: 'Compact (sans date/aperçu/image)',
        titleRows: 'Lignes de titre',
        previewRows: "Lignes d'aperçu",
        defaultOption: (rows: number) => `Défaut (${rows})`,
        defaultTitleOption: (rows: number) => `Lignes de titre par défaut (${rows})`,
        defaultPreviewOption: (rows: number) => `Lignes d'aperçu par défaut (${rows})`,
        titleRowOption: (rows: number) => `${rows} ligne${rows === 1 ? '' : 's'} de titre`,
        previewRowOption: (rows: number) => `${rows} ligne${rows === 1 ? '' : 's'} d'aperçu`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'Rechercher des icônes...',
            recentlyUsedHeader: 'Récemment utilisées',
            emptyStateSearch: 'Commencez à taper pour rechercher des icônes',
            emptyStateNoResults: 'Aucune icône trouvée',
            showingResultsInfo: 'Affichage de 50 résultats sur {count}. Tapez plus pour affiner.',
            emojiInstructions: "Tapez ou collez n'importe quel emoji pour l'utiliser comme icône",
            removeIcon: "Supprimer l'icône"
        },
        colorPicker: {
            currentColor: 'Actuelle',
            newColor: 'Nouvelle',
            presetColors: 'Couleurs prédéfinies',
            recentColors: 'Couleurs récentes',
            clearRecentColors: 'Effacer les couleurs récentes',
            removeRecentColor: 'Supprimer la couleur',
            removeColor: 'Supprimer la couleur',
            apply: 'Appliquer',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'Rouge',
                orange: 'Orange',
                amber: 'Ambre',
                yellow: 'Jaune',
                lime: 'Citron vert',
                green: 'Vert',
                emerald: 'Émeraude',
                teal: 'Sarcelle',
                cyan: 'Cyan',
                sky: 'Ciel',
                blue: 'Bleu',
                indigo: 'Indigo',
                violet: 'Violet',
                purple: 'Pourpre',
                fuchsia: 'Fuchsia',
                pink: 'Rose',
                rose: 'Rose pâle',
                gray: 'Gris',
                slate: 'Ardoise',
                stone: 'Pierre'
            }
        },
        tagOperation: {
            renameTitle: "Renommer l'étiquette",
            deleteTitle: "Supprimer l'étiquette",
            newTagPrompt: "Entrez le nouveau nom de l'étiquette :",
            newTagPlaceholder: 'nouveau-nom',
            renameWarning: "Cela renommera l'étiquette dans toutes les notes affectées.",
            deleteWarning: "Cela supprimera l'étiquette de toutes les notes affectées.",
            modificationWarning: "Modification de l'étiquette",
            affectedFiles: '{count} fichier(s) affecté(s)',
            andMore: 'et {count} de plus...',
            confirmRename: "Renommer l'étiquette",
            confirmDelete: "Supprimer l'étiquette",
            file: 'fichier',
            files: 'fichiers'
        },
        fileSystem: {
            newFolderTitle: 'Nouveau dossier',
            renameFolderTitle: 'Renommer le dossier',
            renameFileTitle: 'Renommer le fichier',
            deleteFolderTitle: "Supprimer '{name}' ?",
            deleteFileTitle: "Supprimer '{name}' ?",
            folderNamePrompt: 'Entrez le nom du dossier :',
            renamePrompt: 'Entrez le nouveau nom :',
            renameVaultTitle: "Changer le nom d'affichage du coffre",
            renameVaultPrompt: "Entrez un nom d'affichage personnalisé (laissez vide pour utiliser le nom par défaut) :",
            deleteFolderConfirm: 'Êtes-vous sûr de vouloir supprimer ce dossier et tout son contenu ?',
            deleteFileConfirm: 'Êtes-vous sûr de vouloir supprimer ce fichier ?',
            removeAllTagsTitle: 'Supprimer toutes les étiquettes',
            removeAllTagsFromNote: 'Êtes-vous sûr de vouloir supprimer toutes les étiquettes de cette note ?',
            removeAllTagsFromNotes: 'Êtes-vous sûr de vouloir supprimer toutes les étiquettes de {count} notes ?'
        },
        folderSuggest: {
            placeholder: 'Déplacer vers le dossier...',
            navigatePlaceholder: 'Naviguer vers le dossier...',
            instructions: {
                navigate: 'pour naviguer',
                move: 'pour déplacer',
                select: 'pour sélectionner',
                dismiss: 'pour annuler'
            }
        },
        homepage: {
            placeholder: 'Rechercher des fichiers...',
            instructions: {
                navigate: 'pour naviguer',
                select: 'pour définir la page d’accueil',
                dismiss: 'pour annuler'
            }
        },
        navigationBanner: {
            placeholder: 'Rechercher des images...',
            instructions: {
                navigate: 'pour naviguer',
                select: 'pour définir la bannière',
                dismiss: 'pour annuler'
            }
        },
        tagSuggest: {
            placeholder: 'Rechercher des étiquettes...',
            navigatePlaceholder: "Naviguer vers l'étiquette...",
            addPlaceholder: 'Rechercher une étiquette à ajouter...',
            removePlaceholder: "Sélectionner l'étiquette à supprimer...",
            createNewTag: 'Créer une nouvelle étiquette : #{tag}',
            instructions: {
                navigate: 'pour naviguer',
                select: 'pour sélectionner',
                dismiss: 'pour annuler',
                add: "pour ajouter l'étiquette",
                remove: "pour supprimer l'étiquette"
            }
        },
        folderNoteType: {
            title: 'Choisir le type de note de dossier',
            markdown: 'Markdown',
            canvas: 'Canvas',
            base: 'Base'
        }
    },

    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Échec de la création du dossier : {error}',
            createFile: 'Échec de la création du fichier : {error}',
            renameFolder: 'Échec du renommage du dossier : {error}',
            renameFolderNoteConflict: 'Impossible de renommer : "{name}" existe déjà dans ce dossier',
            renameFile: 'Échec du renommage du fichier : {error}',
            deleteFolder: 'Échec de la suppression du dossier : {error}',
            deleteFile: 'Échec de la suppression du fichier : {error}',
            duplicateNote: 'Échec de la duplication de la note : {error}',
            createCanvas: 'Échec de la création du canevas : {error}',
            createDatabase: 'Échec de la création de la base de données : {error}',
            duplicateFolder: 'Échec de la duplication du dossier : {error}',
            openVersionHistory: "Échec de l'ouverture de l'historique des versions : {error}",
            versionHistoryNotFound: "Commande d'historique des versions introuvable. Assurez-vous qu'Obsidian Sync est activé.",
            revealInExplorer: "Échec de l'affichage du fichier dans l'explorateur système : {error}",
            folderNoteAlreadyExists: 'La note de dossier existe déjà',
            folderAlreadyExists: 'Le dossier "{name}" existe déjà',
            folderNotesDisabled: 'Activez les notes de dossier dans les paramètres pour convertir des fichiers',
            folderNoteAlreadyLinked: 'Ce fichier agit déjà comme une note de dossier',
            folderNoteUnsupportedExtension: 'Extension de fichier non prise en charge : {extension}',
            folderNoteMoveFailed: 'Échec du déplacement du fichier pendant la conversion : {error}',
            folderNoteRenameConflict: 'Un fichier nommé "{name}" existe déjà dans le dossier',
            folderNoteConversionFailed: 'Échec de la conversion du fichier en note de dossier',
            folderNoteConversionFailedWithReason: 'Échec de la conversion du fichier en note de dossier : {error}',
            folderNoteOpenFailed: "Fichier converti mais échec de l'ouverture de la note de dossier : {error}",
            failedToDeleteFile: 'Échec de la suppression de {name} : {error}',
            failedToDeleteMultipleFiles: 'Échec de la suppression de {count} fichiers',
            versionHistoryNotAvailable: "Service d'historique des versions non disponible",
            drawingAlreadyExists: 'Un dessin avec ce nom existe déjà',
            failedToCreateDrawing: 'Échec de la création du dessin',
            noFolderSelected: 'Aucun dossier sélectionné dans Notebook Navigator',
            noFileSelected: 'Aucun fichier sélectionné'
        },
        notices: {
            excludedFolder: 'Dossier exclu : {name}'
        },
        notifications: {
            deletedMultipleFiles: '{count} fichiers supprimés',
            movedMultipleFiles: '{count} fichiers déplacés vers {folder}',
            folderNoteConversionSuccess: 'Fichier converti en note de dossier dans "{name}"',
            folderMoved: 'Dossier "{name}" déplacé',
            deepLinkCopied: 'URL Obsidian copiée dans le presse-papiers',
            pathCopied: 'Chemin copié dans le presse-papiers',
            relativePathCopied: 'Chemin relatif copié dans le presse-papiers',
            tagAddedToNote: 'Étiquette ajoutée à 1 note',
            tagAddedToNotes: 'Étiquette ajoutée à {count} notes',
            tagRemovedFromNote: 'Étiquette supprimée de 1 note',
            tagRemovedFromNotes: 'Étiquette supprimée de {count} notes',
            tagsClearedFromNote: 'Toutes les étiquettes supprimées de 1 note',
            tagsClearedFromNotes: 'Toutes les étiquettes supprimées de {count} notes',
            noTagsToRemove: 'Aucune étiquette à supprimer',
            noFilesSelected: 'Aucun fichier sélectionné',
            tagOperationsNotAvailable: "Opérations d'étiquettes non disponibles",
            tagsRequireMarkdown: 'Les étiquettes ne sont prises en charge que sur les notes Markdown',
            iconPackDownloaded: '{provider} téléchargé',
            iconPackUpdated: '{provider} mis à jour ({version})',
            iconPackRemoved: '{provider} supprimé',
            iconPackLoadFailed: 'Échec du chargement de {provider}'
        },
        confirmations: {
            deleteMultipleFiles: 'Voulez-vous vraiment supprimer {count} fichiers ?',
            deleteConfirmation: 'Cette action ne peut pas être annulée.'
        },
        defaultNames: {
            untitled: 'Sans titre',
            untitledNumber: 'Sans titre {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Impossible de déplacer un dossier dans lui-même ou un sous-dossier.',
            itemAlreadyExists: 'Un élément nommé "{name}" existe déjà à cet emplacement.',
            failedToMove: 'Échec du déplacement : {error}',
            failedToAddTag: 'Échec de l\'ajout de l\'étiquette "{tag}"',
            failedToClearTags: 'Échec de la suppression des étiquettes',
            failedToMoveFolder: 'Échec du déplacement du dossier "{name}"',
            failedToImportFiles: 'Failed to import: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} fichiers existent déjà dans la destination',
            addedTag: 'Étiquette "{tag}" ajoutée à {count} fichiers',
            filesAlreadyHaveTag: '{count} fichiers ont déjà cette étiquette ou une plus spécifique',
            clearedTags: 'Toutes les étiquettes supprimées de {count} fichiers',
            noTagsToClear: 'Aucune étiquette à supprimer',
            fileImported: 'Imported 1 file',
            filesImported: 'Imported {count} files'
        }
    },

    // Date grouping
    dateGroups: {
        today: "Aujourd'hui",
        yesterday: 'Hier',
        previous7Days: '7 derniers jours',
        previous30Days: '30 derniers jours'
    },

    // Weekdays
    weekdays: {
        sunday: 'Dimanche',
        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi'
    },

    // Plugin commands
    commands: {
        open: 'Ouvrir', // Command palette: Opens the Notebook Navigator view (English: Open)
        openHomepage: 'Ouvrir la page d’accueil', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        revealFile: 'Révéler le fichier', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Rechercher', // Command palette: Toggle search in the file list (English: Search)
        toggleDualPane: 'Basculer la disposition à double panneau', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        deleteFile: 'Supprimer les fichiers', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Créer une nouvelle note', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        moveFiles: 'Déplacer les fichiers', // Command palette: Move selected files to another folder (English: Move files)
        convertToFolderNote: 'Convertir en note de dossier', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        pinAllFolderNotes: 'Épingler toutes les notes de dossier', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Naviguer vers le dossier', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: "Naviguer vers l'étiquette", // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        addShortcut: 'Ajouter aux raccourcis', // Command palette: Adds the current file, folder, or tag to shortcuts (English: Add to shortcuts)
        toggleDescendants: 'Basculer descendants', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Basculer les éléments masqués', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        collapseExpand: 'Replier / déplier tous les éléments', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        addTag: 'Ajouter une étiquette aux fichiers sélectionnés', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        removeTag: 'Supprimer une étiquette des fichiers sélectionnés', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Supprimer toutes les étiquettes des fichiers sélectionnés', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        rebuildCache: 'Reconstruire le cache' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: 'Navigateur de Carnets', // Name shown in the view header/tab (English: Notebook Navigator)
        ribbonTooltip: 'Navigateur de Carnets', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Révéler dans le Navigateur de Carnets' // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Dernière modification le',
        createdAt: 'Créé le',
        file: 'fichier',
        files: 'fichiers',
        folder: 'dossier',
        folders: 'dossiers'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'Rapport de métadonnées échouées exporté vers : {filename}',
            exportFailed: "Échec de l'exportation du rapport de métadonnées"
        },
        sections: {
            general: 'Général',
            notes: 'Affichage des notes',
            navigationPane: 'Affichage des dossiers',
            icons: "Packs d'icônes",
            tags: 'Affichage des étiquettes',
            folders: 'Notes de dossier',
            search: 'Rechercher',
            listPane: 'Panneau de liste',
            hotkeys: 'Raccourcis clavier',
            advanced: 'Avancé'
        },
        groups: {
            general: {
                view: 'Apparence',
                behavior: 'Comportement',
                filtering: 'Filtrage',
                formatting: 'Formatage'
            },
            navigation: {
                behavior: 'Comportement',
                appearance: 'Apparence'
            },
            list: {
                display: 'Apparence',
                quickActions: 'Actions rapides'
            },
            notes: {
                frontmatter: 'Frontmatter',
                display: 'Apparence'
            }
        },
        items: {
            searchProvider: {
                name: 'Fournisseur de recherche',
                desc: 'Choisissez entre la recherche rapide par nom de fichier ou la recherche plein texte avec le plugin Omnisearch.',
                options: {
                    internal: 'Recherche par filtre',
                    omnisearch: 'Omnisearch (plein texte)'
                },
                info: {
                    filterSearch: {
                        title: 'Recherche par filtre (par défaut):',
                        description:
                            "Recherche rapide et légère qui filtre les fichiers par nom et étiquettes dans le dossier actuel et les sous-dossiers. Prend en charge le filtrage par étiquettes avec le préfixe # (ex. #projet), l'exclusion avec le préfixe ! (ex. !brouillon, !#archivé), et la recherche de notes sans étiquettes avec !#. Idéal pour la navigation rapide dans votre contexte actuel."
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            "Recherche plein texte qui parcourt l'ensemble de votre coffre, puis filtre les résultats pour n'afficher que les fichiers du dossier actuel, des sous-dossiers ou des étiquettes sélectionnées. Nécessite l'installation du plugin Omnisearch - s'il n'est pas disponible, la recherche reviendra automatiquement à la recherche par filtre.",
                        warningNotInstalled: 'Le plugin Omnisearch n’est pas installé. La recherche par filtre est utilisée.',
                        limitations: {
                            title: 'Limitations connues:',
                            performance:
                                'Performance: Peut être lent, surtout lors de la recherche de moins de 3 caractères dans de grandes coffres',
                            pathBug:
                                'Bug de chemin: Ne peut pas rechercher dans les chemins avec des caractères non-ASCII et ne recherche pas correctement dans les sous-chemins, affectant les fichiers qui apparaissent dans les résultats de recherche',
                            limitedResults:
                                "Résultats limités: Comme Omnisearch recherche dans tout le coffre et renvoie un nombre limité de résultats avant le filtrage, les fichiers pertinents de votre dossier actuel peuvent ne pas apparaître s'il existe trop de correspondances ailleurs dans le coffre",
                            previewText:
                                "Texte d'aperçu: Les aperçus de notes sont remplacés par des extraits de résultats Omnisearch, qui peuvent ne pas afficher la mise en surbrillance réelle de la correspondance de recherche si elle apparaît ailleurs dans le fichier"
                        }
                    }
                }
            },
            listPaneTitle: {
                name: 'Titre du panneau de liste',
                desc: 'Choisissez où afficher le titre du panneau de liste.',
                options: {
                    header: 'Afficher dans l’en-tête',
                    list: 'Afficher dans le panneau de liste',
                    hidden: 'Ne pas afficher'
                }
            },
            sortNotesBy: {
                name: 'Trier les notes par',
                desc: 'Choisissez comment les notes sont triées dans la liste des notes.',
                options: {
                    'modified-desc': 'Date de modification (plus récente en haut)',
                    'modified-asc': 'Date de modification (plus ancienne en haut)',
                    'created-desc': 'Date de création (plus récente en haut)',
                    'created-asc': 'Date de création (plus ancienne en haut)',
                    'title-asc': 'Titre (A en haut)',
                    'title-desc': 'Titre (Z en haut)'
                }
            },
            includeDescendantNotes: {
                name: 'Afficher les notes des sous-dossiers / descendants',
                desc: "Inclure les notes des sous-dossiers imbriqués et des descendants d'étiquettes lors de l'affichage d'un dossier ou d'une étiquette."
            },
            separateNoteCounts: {
                name: 'Afficher les comptes actuels et descendants séparément',
                desc: 'Affiche le nombre de notes au format "actuel ▾ descendants" dans les dossiers et étiquettes.'
            },
            groupNotes: {
                name: 'Grouper les notes',
                desc: 'Affiche des en-têtes entre les notes groupées par date ou par dossier. Les vues de tags utilisent des groupes de dates lorsque le regroupement par dossier est activé.',
                options: {
                    none: 'Ne pas grouper',
                    date: 'Grouper par date',
                    folder: 'Grouper par dossier'
                }
            },
            optimizeNoteHeight: {
                name: 'Optimiser la hauteur des notes',
                desc: "Réduire la hauteur pour les notes épinglées et les notes sans texte d'aperçu."
            },
            showParentFolderNames: {
                name: 'Afficher les noms des dossiers parents',
                desc: 'Afficher le nom du dossier parent pour les notes dans les sous-dossiers ou étiquettes.'
            },
            showQuickActions: {
                name: 'Afficher les actions rapides (bureau uniquement)',
                desc: 'Afficher les actions au survol sur les éléments de fichier.'
            },
            quickActionsRevealInFolder: {
                name: 'Révéler dans le dossier',
                desc: "Action rapide : Révéler la note dans son dossier parent. Visible uniquement lors de l'affichage de notes depuis des sous-dossiers ou dans des étiquettes (non affiché dans le dossier réel de la note)."
            },
            quickActionsPinNote: {
                name: 'Épingler la note',
                desc: 'Action rapide : Épingler ou désépingler la note en haut de la liste.'
            },
            quickActionsOpenInNewTab: {
                name: 'Ouvrir dans un nouvel onglet',
                desc: 'Action rapide : Ouvrir la note dans un nouvel onglet.'
            },
            dualPane: {
                name: 'Disposition à double panneau (ordinateur uniquement, non synchronisé)',
                desc: 'Afficher le panneau de navigation et le panneau de liste côte à côte sur ordinateur.'
            },
            dualPaneOrientation: {
                name: 'Orientation du double panneau',
                desc: 'Choisir une disposition horizontale ou verticale lorsque le double panneau est actif.',
                options: {
                    horizontal: 'Séparation horizontale',
                    vertical: 'Séparation verticale'
                }
            },
            dualPaneBackground: {
                name: 'Couleur de fond (bureau uniquement)',
                desc: 'Choisissez les couleurs de fond pour les volets de navigation et de liste sur bureau.',
                options: {
                    separate: 'Arrière-plans séparés',
                    primary: 'Utiliser le fond de la liste',
                    secondary: 'Utiliser le fond de navigation'
                }
            },
            startView: {
                name: 'Vue de démarrage par défaut',
                desc: "Choisissez le panneau affiché lors de l'ouverture de Notebook Navigator. Le panneau de navigation montre les raccourcis, les notes récentes et la structure des dossiers. Le panneau de liste affiche immédiatement la liste des notes.",
                options: {
                    navigation: 'Panneau de navigation',
                    files: 'Panneau de liste'
                }
            },
            autoRevealActiveNote: {
                name: 'Révéler automatiquement la note active',
                desc: "Révéler automatiquement les notes lorsqu'elles sont ouvertes depuis le Commutateur rapide, les liens ou la recherche."
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Ignorer les événements du panneau de droite',
                desc: "Ne pas changer la note active lors d'un clic ou du changement de notes dans le panneau de droite."
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Sélectionner automatiquement la première note (ordinateur uniquement)',
                desc: "Ouvrir automatiquement la première note lors du changement de dossier ou d'étiquette."
            },
            autoExpandFoldersTags: {
                name: 'Développer automatiquement les dossiers et les étiquettes',
                desc: "Développer automatiquement les dossiers et les étiquettes lorsqu'ils sont sélectionnés."
            },
            navigationBanner: {
                name: 'Bannière de navigation',
                desc: 'Afficher une image au-dessus du panneau de navigation.',
                current: 'Bannière actuelle : {path}',
                chooseButton: 'Choisir une image',
                clearButton: 'Effacer'
            },
            showShortcuts: {
                name: 'Afficher les raccourcis',
                desc: 'Afficher la section des raccourcis dans le panneau de navigation.'
            },
            showRecentNotes: {
                name: 'Afficher les notes récentes',
                desc: 'Afficher la section des notes récentes dans le panneau de navigation.'
            },
            recentNotesCount: {
                name: 'Nombre de notes récentes',
                desc: 'Nombre de notes récentes à afficher.'
            },
            showTooltips: {
                name: 'Afficher les infobulles (ordinateur uniquement)',
                desc: 'Affiche des infobulles avec des informations supplémentaires pour les notes et dossiers au survol.'
            },
            showTooltipPath: {
                name: 'Afficher le chemin',
                desc: 'Affiche le chemin du dossier sous le nom des notes dans les infobulles.'
            },
            multiSelectModifier: {
                name: 'Modificateur de sélection multiple',
                desc: 'Choisissez quelle touche modificatrice active la sélection multiple. Quand Option/Alt est sélectionné, Cmd/Ctrl clic ouvre les notes dans un nouvel onglet.',
                options: {
                    cmdCtrl: 'Cmd/Ctrl clic',
                    optionAlt: 'Option/Alt clic'
                }
            },
            excludedNotes: {
                name: 'Masquer les notes',
                desc: "Liste de propriétés de métadonnées séparées par des virgules. Les notes contenant l'une de ces propriétés seront masquées (ex. : draft, private, archived).",
                placeholder: 'draft, private'
            },
            excludedFolders: {
                name: 'Masquer les dossiers',
                desc: 'Liste de dossiers à masquer séparés par des virgules. Modèles de nom : assets* (dossiers commençant par assets), *_temp (finissant par _temp). Modèles de chemin : /archive (archive racine uniquement), /res* (dossiers racine commençant par res), /*/temp (dossiers temp un niveau plus bas), /projects/* (tous les dossiers dans projects).',
                placeholder: 'templates, assets*, /archive, /res*',
                info: "Nettoyage automatique : Lors de l'exclusion par clic droit, les modèles redondants sont supprimés (par exemple, si vous excluez /projects et que /projects/app existe déjà dans la liste, il sera supprimé)."
            },
            fileVisibility: {
                name: 'Afficher les types de fichiers',
                desc: "Filtrez quels types de fichiers sont affichés dans le navigateur. Les types de fichiers non pris en charge par Obsidian peuvent s'ouvrir dans des applications externes.",
                options: {
                    documents: 'Documents (.md, .canvas, .base)',
                    supported: 'Pris en charge (ouvre dans Obsidian)',
                    all: 'Tous (peut ouvrir en externe)'
                }
            },
            homepage: {
                name: 'Page d’accueil',
                desc: 'Sélectionnez le fichier que Notebook Navigator ouvre automatiquement, par exemple un tableau de bord.',
                current: 'Actuel : {path}',
                currentMobile: 'Mobile : {path}',
                chooseButton: 'Choisir un fichier',
                clearButton: 'Effacer',
                separateMobile: {
                    name: "Page d'accueil mobile séparée",
                    desc: "Utiliser une page d'accueil différente pour les appareils mobiles."
                }
            },
            showFileDate: {
                name: 'Afficher la date',
                desc: 'Afficher la date sous les noms des notes.'
            },
            showFileTags: {
                name: 'Afficher les tags de fichier',
                desc: 'Affiche les tags cliquables dans les éléments de fichier. Utilisez les couleurs de tags pour distinguer visuellement les différents types de tags.'
            },
            showFileTagAncestors: {
                name: 'Afficher les tags parents',
                desc: 'Afficher les segments parents avant le nom du tag.'
            },
            colorFileTags: {
                name: 'Colorer les tags de fichier',
                desc: 'Appliquer les couleurs de tags aux badges de tags sur les éléments de fichier.'
            },
            showFileTagsInSlimMode: {
                name: 'Afficher les tags de fichier en mode compact',
                desc: "Afficher les tags lorsque la date, l'aperçu et l'image sont masqués."
            },
            dateFormat: {
                name: 'Format de date',
                desc: 'Format pour afficher les dates (utilise le format date-fns).',
                placeholder: 'd MMMM yyyy',
                help: 'Formats courants :\nd MMMM yyyy = 25 mai 2022\ndd/MM/yyyy = 25/05/2022\nyyyy-MM-dd = 2022-05-25\n\nJetons :\nyyyy/yy = année\nMMMM/MMM/MM = mois\ndd/d = jour\nEEEE/EEE = jour de la semaine',
                helpTooltip: 'Cliquez pour la référence du format'
            },
            timeFormat: {
                name: "Format d'heure",
                desc: 'Format pour afficher les heures (utilise le format date-fns).',
                placeholder: 'HH:mm',
                help: 'Formats courants :\nHH:mm = 14:30 (24 heures)\nh:mm a = 2:30 PM (12 heures)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nJetons :\nHH/H = 24 heures\nhh/h = 12 heures\nmm = minutes\nss = secondes\na = AM/PM',
                helpTooltip: 'Cliquez pour la référence du format'
            },
            showFilePreview: {
                name: "Afficher l'aperçu de la note",
                desc: "Afficher le texte d'aperçu sous les noms des notes."
            },
            skipHeadingsInPreview: {
                name: "Ignorer les en-têtes dans l'aperçu",
                desc: "Ignorer les lignes d'en-tête lors de la génération du texte d'aperçu."
            },
            skipCodeBlocksInPreview: {
                name: "Ignorer les blocs de code dans l'aperçu",
                desc: "Ignorer les blocs de code lors de la génération du texte d'aperçu."
            },
            previewProperties: {
                name: "Propriétés d'aperçu",
                desc: "Liste séparée par des virgules de propriétés frontmatter pour le texte d'aperçu. La première propriété avec du texte sera utilisée.",
                placeholder: 'résumé, description, abstrait',
                info: "Si aucun texte d'aperçu n'est trouvé dans les propriétés spécifiées, l'aperçu sera généré à partir du contenu de la note."
            },
            previewRows: {
                name: "Lignes d'aperçu",
                desc: "Nombre de lignes à afficher pour le texte d'aperçu.",
                options: {
                    '1': '1 ligne',
                    '2': '2 lignes',
                    '3': '3 lignes',
                    '4': '4 lignes',
                    '5': '5 lignes'
                }
            },
            fileNameRows: {
                name: 'Lignes de titre',
                desc: 'Nombre de lignes à afficher pour les titres des notes.',
                options: {
                    '1': '1 ligne',
                    '2': '2 lignes'
                }
            },
            showFeatureImage: {
                name: "Afficher l'image vedette",
                desc: 'Afficher les images miniatures depuis les métadonnées. Conseil : Utilisez le plugin "Featured Image" pour définir automatiquement des images vedettes pour tous vos documents.'
            },
            forceSquareFeatureImage: {
                name: "Forcer l'image vedette carrée",
                desc: 'Afficher les images vedettes sous forme de miniatures carrées.'
            },
            featureImageProperties: {
                name: "Propriétés d'image",
                desc: 'Liste de propriétés de métadonnées séparées par des virgules pour les images miniatures. La première propriété avec une image sera utilisée. Si vide et que le paramètre de repli est activé, la première image intégrée sera utilisée.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            useEmbeddedImageFallback: {
                name: "Utiliser l'image intégrée comme solution de repli",
                desc: "Utilise la première image intégrée dans le document comme solution de repli lorsqu'aucune miniature n'est trouvée dans les propriétés du frontmatter (nécessite Obsidian 1.9.4+). Désactivez cette option pour vérifier que les miniatures sont correctement configurées."
            },
            showRootFolder: {
                name: 'Afficher le dossier racine',
                desc: "Afficher le nom du dossier racine dans l'arborescence."
            },
            inheritFolderColors: {
                name: 'Hériter des couleurs de dossier',
                desc: 'Les sous-dossiers héritent de la couleur des dossiers parents.'
            },
            showNoteCount: {
                name: 'Afficher le nombre de notes',
                desc: 'Afficher le nombre de notes à côté de chaque dossier et étiquette.'
            },
            showIcons: {
                name: 'Afficher les icônes',
                desc: 'Afficher les icônes pour les dossiers, étiquettes et notes.'
            },
            showIconsColorOnly: {
                name: 'Appliquer la couleur uniquement aux icônes',
                desc: "Lorsqu'activé, les couleurs personnalisées sont appliquées uniquement aux icônes. Lorsque désactivé, les couleurs sont appliquées aux icônes et aux étiquettes de texte."
            },
            collapseBehavior: {
                name: 'Replier les éléments',
                desc: 'Choisissez ce que le bouton déplier/replier tout affecte.',
                options: {
                    all: 'Tous les dossiers et étiquettes',
                    foldersOnly: 'Dossiers uniquement',
                    tagsOnly: 'Étiquettes uniquement'
                }
            },
            smartCollapse: {
                name: 'Garder lélément sélectionné déplié',
                desc: 'Lors du repliement, garde le dossier ou létiquette actuellement sélectionné et ses parents dépliés.'
            },
            navIndent: {
                name: "Indentation de l'arbre",
                desc: "Ajuster la largeur d'indentation pour les dossiers et étiquettes imbriqués."
            },
            navItemHeight: {
                name: 'Hauteur de ligne',
                desc: 'Ajuster la hauteur des dossiers et étiquettes dans le panneau de navigation.'
            },
            navItemHeightScaleText: {
                name: 'Adapter le texte à la hauteur de ligne',
                desc: 'Réduit le texte de navigation lorsque la hauteur de ligne est diminuée.'
            },
            showTags: {
                name: 'Afficher les étiquettes',
                desc: 'Afficher la section des étiquettes sous les dossiers dans le navigateur.'
            },
            tagSortOrder: {
                name: 'Ordre de tri des étiquettes',
                desc: 'Définir comment les étiquettes sont triées dans le panneau de navigation.',
                options: {
                    alphaAsc: 'A à Z',
                    alphaDesc: 'Z à A',
                    frequencyAsc: 'Fréquence (faible vers élevée)',
                    frequencyDesc: 'Fréquence (élevée vers faible)'
                }
            },
            showAllTagsFolder: {
                name: 'Afficher le dossier des étiquettes',
                desc: 'Afficher "Étiquettes" comme un dossier repliable.'
            },
            showUntagged: {
                name: 'Afficher les notes sans étiquette',
                desc: 'Afficher l\'élément "Sans étiquette" pour les notes sans aucune étiquette.'
            },
            hiddenTags: {
                name: 'Étiquettes cachées',
                desc: 'Liste séparée par des virgules de préfixes ou de jokers de nom d\'étiquettes à masquer. Utilisez `tag*` ou `*tag` pour faire correspondre les noms d\'étiquette. Masquer une étiquette masque aussi toutes ses sous-étiquettes (par ex. "archive" masque "archive/2024/docs").',
                placeholder: 'interne, temp/brouillons, archive/2024'
            },
            enableFolderNotes: {
                name: 'Activer les notes de dossier',
                desc: "Lorsqu'activé, les dossiers avec des notes associées sont affichés comme des liens cliquables."
            },
            folderNoteType: {
                name: 'Type de note de dossier par défaut',
                desc: 'Type de note de dossier créé depuis le menu contextuel.',
                options: {
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base',
                    ask: 'Demander lors de la création'
                }
            },
            folderNoteName: {
                name: 'Nom de la note de dossier',
                desc: 'Nom de la note de dossier. Laisser vide pour utiliser le même nom que le dossier.',
                placeholder: 'Laisser vide pour le nom du dossier'
            },
            folderNoteProperties: {
                name: 'Propriétés de note de dossier',
                desc: 'Propriétés frontmatter à ajouter aux notes de dossier nouvellement créées (séparées par des virgules).',
                placeholder: 'foldernote, darktheme'
            },
            hideFolderNoteInList: {
                name: 'Masquer les notes de dossier dans la liste',
                desc: "Masquer la note de dossier pour qu'elle n'apparaisse pas dans la liste des notes du dossier."
            },
            pinCreatedFolderNote: {
                name: 'Épingler les notes de dossier créées',
                desc: 'Épingler automatiquement les notes de dossier lors de leur création depuis le menu contextuel.'
            },
            confirmBeforeDelete: {
                name: 'Confirmer avant de supprimer',
                desc: 'Afficher une boîte de dialogue de confirmation lors de la suppression de notes ou de dossiers'
            },
            metadataCleanup: {
                name: 'Nettoyer les métadonnées',
                desc: "Supprime les métadonnées orphelines laissées lorsque des fichiers, dossiers ou étiquettes sont supprimés, déplacés ou renommés en dehors d'Obsidian. Cela n'affecte que le fichier de configuration de Notebook Navigator.",
                buttonText: 'Nettoyer les métadonnées',
                error: 'Échec du nettoyage des paramètres',
                loading: 'Vérification des métadonnées...',
                statusClean: 'Aucune métadonnée à nettoyer',
                statusCounts: 'Éléments orphelins: {folders} dossiers, {tags} étiquettes, {files} fichiers, {pinned} épingles'
            },
            rebuildCache: {
                name: 'Reconstruire le cache',
                desc: 'Utilisez ceci si des étiquettes manquent, les aperçus sont incorrects ou des images manquent. Cela peut arriver après des conflits de synchronisation ou des fermetures inattendues.',
                buttonText: 'Reconstruire le cache',
                success: 'Cache reconstruit',
                error: 'Échec de la reconstruction du cache'
            },
            hotkeys: {
                intro: 'Modifiez <plugin folder>/notebook-navigator/data.json pour personnaliser les raccourcis de Notebook Navigator. Ouvrez le fichier et repérez la section "keyboardShortcuts". Chaque entrée suit cette structure :',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Maj',
                    '"Ctrl" = Contrôle (privilégiez "Mod" pour le multiplateforme)'
                ],
                guidance:
                    'Ajoutez plusieurs associations pour proposer des touches alternatives comme FlècheHaut et K montrées ci-dessus. Combinez des modificateurs dans une même entrée en listant chaque valeur, par exemple "modifiers": ["Mod", "Shift"]. Les séquences clavier telles que "gg" ou "dd" ne sont pas prises en charge. Après modification, rechargez Obsidian.'
            },
            externalIcons: {
                downloadButton: 'Télécharger',
                downloadingLabel: 'Téléchargement...',
                removeButton: 'Supprimer',
                statusInstalled: 'Téléchargé (version {version})',
                statusNotInstalled: 'Non téléchargé',
                versionUnknown: 'inconnue',
                downloadFailed: 'Échec du téléchargement de {name}. Vérifiez votre connexion et réessayez.',
                removeFailed: 'Échec de la suppression de {name}.',
                infoNote:
                    "Les packs d'icônes téléchargés synchronisent l'état d'installation entre les appareils. Les packs d'icônes restent dans la base de données locale sur chaque appareil ; la synchronisation ne fait que suivre s'ils doivent être téléchargés ou supprimés. Les packs d'icônes sont téléchargés depuis le dépôt Notebook Navigator (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).",
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
                name: 'Lire les métadonnées du frontmatter',
                desc: "Lire les noms de notes, horodatages, icônes et couleurs du frontmatter lorsqu'ils sont disponibles, sinon utiliser les valeurs du système ou les paramètres"
            },
            frontmatterNameField: {
                name: 'Champ de nom',
                desc: "Champ frontmatter à utiliser comme nom d'affichage de la note. Laisser vide pour utiliser le nom du fichier.",
                placeholder: 'titre'
            },
            frontmatterIconField: {
                name: "Champ d'icône",
                desc: 'Champ frontmatter pour les icônes de fichier. Laisser vide pour utiliser les icônes enregistrées dans les paramètres.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'Champ de couleur',
                desc: 'Champ frontmatter pour les couleurs de fichier. Laisser vide pour utiliser les couleurs enregistrées dans les paramètres.',
                placeholder: 'color'
            },
            frontmatterSaveMetadata: {
                name: 'Enregistrer les icônes et couleurs dans le frontmatter',
                desc: 'Écrit automatiquement les icônes et couleurs de fichier dans le frontmatter via les champs configurés ci-dessus.'
            },
            frontmatterIconizeFormat: {
                name: 'Enregistrer au format Iconize',
                desc: 'Enregistre les icônes au format Iconize (ex. LiHome, FasUser, SiGithub) au lieu du format du plugin (ex. home, fontawesome-solid:user, simple-icons:github).'
            },
            frontmatterMigration: {
                name: 'Migrer les icônes et couleurs depuis les paramètres',
                desc: 'Stocké dans les paramètres : {icons} icônes, {colors} couleurs.',
                button: 'Migrer',
                buttonWorking: 'Migration...',
                noticeNone: 'Aucune icône ou couleur de fichier stockée dans les paramètres.',
                noticeDone: 'Migrées {migratedIcons}/{icons} icônes, {migratedColors}/{colors} couleurs.',
                noticeFailures: 'Entrées en échec : {failures}.',
                noticeError: 'Échec de la migration. Consultez la console pour plus de détails.'
            },
            frontmatterCreatedField: {
                name: "Champ d'horodatage de création",
                desc: "Nom du champ frontmatter pour l'horodatage de création. Laisser vide pour utiliser uniquement la date du système.",
                placeholder: 'créé'
            },
            frontmatterModifiedField: {
                name: "Champ d'horodatage de modification",
                desc: "Nom du champ frontmatter pour l'horodatage de modification. Laisser vide pour utiliser uniquement la date du système.",
                placeholder: 'modifié'
            },
            frontmatterDateFormat: {
                name: "Format d'horodatage",
                desc: 'Format utilisé pour analyser les horodatages dans le frontmatter. Laisser vide pour utiliser le format ISO 8601',
                helpTooltip: 'Voir la documentation du format date-fns',
                help: "Formats courants :\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'Soutenir le développement',
                desc: 'Si vous aimez utiliser le Navigateur de Carnets, veuillez envisager de soutenir son développement continu.',
                buttonText: '❤️ Sponsoriser',
                coffeeButton: '☕️ Offrez-moi un café'
            },
            updateCheckOnStart: {
                name: 'Vérifier les nouvelles versions au démarrage',
                desc: "Vérifie les nouvelles versions du plugin au démarrage et affiche une notification lorsqu'une mise à jour est disponible. Chaque version n'est annoncée qu'une seule fois, et les vérifications ont lieu au maximum une fois par jour.",
                status: 'New version available: {version}'
            },
            whatsNew: {
                name: 'Nouveautés',
                desc: 'Voir les mises à jour et améliorations récentes',
                buttonText: 'Voir les mises à jour récentes'
            },
            cacheStatistics: {
                localCache: 'Cache local',
                items: 'éléments',
                withTags: 'avec étiquettes',
                withPreviewText: 'avec texte de prévisualisation',
                withFeatureImage: 'avec image de couverture',
                withMetadata: 'avec métadonnées'
            },
            metadataInfo: {
                successfullyParsed: 'Analysés avec succès',
                itemsWithName: 'éléments avec nom',
                withCreatedDate: 'avec date de création',
                withModifiedDate: 'avec date de modification',
                withIcon: 'avec icône',
                withColor: 'avec couleur',
                failedToParse: "Échec de l'analyse",
                createdDates: 'dates de création',
                modifiedDates: 'dates de modification',
                checkTimestampFormat: "Vérifiez le format d'horodatage.",
                exportFailed: 'Exporter les erreurs'
            }
        }
    },
    whatsNew: {
        title: 'Nouveautés dans Notebook Navigator',
        supportMessage: 'Si vous trouvez Notebook Navigator utile, veuillez envisager de soutenir son développement.',
        supportButton: 'Offrir un café',
        thanksButton: 'Merci !'
    }
};
