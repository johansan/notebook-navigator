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
 * English language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_FR = {
    // Common UI elements
    common: {
        cancel: 'Annuler', // Button text for canceling dialogs and operations (English: Cancel)
        delete: 'Supprimer', // Button text for delete operations in dialogs (English: Delete)
        clear: 'Effacer', // Button text for clearing values (English: Clear)
        remove: 'Supprimer', // Button text for remove operations in dialogs (English: Remove)
        restoreDefault: 'Restaurer la valeur par défaut', // Button text for restoring values to defaults (English: Restore default)
        submit: 'Soumettre', // Button text for submitting forms and dialogs (English: Submit)
        save: 'Enregistrer', // Button text for saving settings and dialogs (English: Save)
        configure: 'Configurer', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'Mode clair', // Label for light theme mode (English: Light mode)
        darkMode: 'Mode sombre', // Label for dark theme mode (English: Dark mode)
        noSelection: 'Aucune sélection', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Sans étiquette', // Label for notes without any tags (English: Untagged)
        featureImageAlt: 'Image vedette', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Erreur inconnue', // Generic fallback when an error has no message (English: Unknown error)
        clipboardWriteError: "Impossible d'écrire dans le presse-papiers",
        updateBannerTitle: 'Mise à jour Notebook Navigator disponible',
        updateBannerInstruction: 'Mettre à jour dans Paramètres -> Extensions communautaires',
        previous: 'Précédent', // Generic aria label for previous navigation (English: Previous)
        next: 'Suivant' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Sélectionnez un dossier ou une étiquette pour afficher les notes', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Aucune note', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Épinglées', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Notes', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Fichiers', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (masqué)', // Accessibility label applied to list items that are normally hidden
        collapseGroup: 'Réduire le groupe',
        expandGroup: 'Développer le groupe',
        manualSortTitle: 'Tri manuel : {property}',
        manualSortHint:
            "Glissez pour réorganiser. L'ordre est enregistré sous forme de valeurs numériques dans la propriété « {property} ».",
        manualSortNonMarkdownHint: 'Les fichiers non Markdown sont affichés en bas et ne peuvent pas être réorganisés.',
        unsortedSection: 'Non trié',
        manualSortDone: 'Terminé',
        manualSortMultipleWriteFailure: '{count} fichiers ont échoué ; premier : {path} : {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Sans étiquette', // Label for the special item showing notes without tags (English: Untagged)
        tags: 'Étiquettes' // Label for the tags virtual folder (English: Tags)
    },

    navigationPane: {
        shortcutsHeader: 'Raccourcis',
        recentFilesHeader: 'Fichiers récents', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Propriétés',
        reorderRootFoldersTitle: 'Réorganiser la navigation',
        reorderRootFoldersHint: 'Utilisez les flèches ou glissez pour réorganiser',
        vaultRootLabel: 'Coffre',
        resetRootToAlpha: "Réinitialiser l'ordre alphabétique",
        resetRootToFrequency: 'Réinitialiser selon la fréquence',
        pinShortcuts: 'Épingler les raccourcis',
        pinShortcutsAndRecentFiles: 'Épingler les raccourcis et fichiers récents',
        unpinShortcuts: 'Détacher les raccourcis',
        unpinShortcutsAndRecentFiles: 'Détacher les raccourcis et fichiers récents',
        profileMenuAria: 'Changer le profil du coffre'
    },

    navigationCalendar: {
        ariaLabel: 'Calendrier',
        dailyNotesNotEnabled: "Le plugin de notes quotidiennes n'est pas activé.",
        createDailyNote: {
            title: 'Nouvelle note quotidienne',
            message: "Le fichier {filename} n'existe pas. Voulez-vous le créer ?",
            confirmButton: 'Créer'
        },
        helpModal: {
            title: 'Raccourcis du calendrier',
            items: [
                'Cliquez sur un jour pour ouvrir ou créer une note quotidienne. Les semaines, mois, trimestres et années fonctionnent de la même manière.',
                "Un point plein sous un jour signifie qu'il a une note. Un point creux signifie qu'il a des tâches inachevées.",
                'Si une note a une image mise en avant, elle apparaît en arrière-plan du jour.'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+clic sur une date pour filtrer par cette date dans la liste des fichiers.',
            dateFilterOptionAlt: '`Option/Alt`+clic sur une date pour filtrer par cette date dans la liste des fichiers.'
        }
    },

    dailyNotes: {
        templateReadFailed: 'Échec de la lecture du modèle de note quotidienne.',
        createFailed: 'Impossible de créer la note quotidienne.'
    },

    shortcuts: {
        folderExists: 'Le dossier est déjà dans les raccourcis',
        noteExists: 'La note est déjà dans les raccourcis',
        tagExists: "L'étiquette est déjà dans les raccourcis",
        propertyExists: 'Propriété déjà dans les raccourcis',
        invalidProperty: 'Raccourci de propriété invalide',
        searchExists: 'Le raccourci de recherche existe déjà',
        emptySearchQuery: "Entrez une requête de recherche avant de l'enregistrer",
        emptySearchName: "Entrez un nom avant d'enregistrer la recherche",
        add: 'Ajouter aux raccourcis',
        addNotesCount: 'Ajouter {count} notes aux raccourcis',
        addFilesCount: 'Ajouter {count} fichiers aux raccourcis',
        rename: 'Renommer le raccourci',
        remove: 'Retirer des raccourcis',
        removeAll: 'Supprimer tous les raccourcis',
        removeAllConfirm: 'Supprimer tous les raccourcis ?',
        folderNotesPinned: '{count} notes de dossier épinglées'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Replier les éléments', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'Déplier tous les éléments', // Tooltip for button that expands all items (English: Expand all items)
        showCalendar: 'Afficher le calendrier',
        hideCalendar: 'Masquer le calendrier',
        newFolder: 'Nouveau dossier', // Tooltip for create new folder button (English: New folder)
        newNote: 'Nouvelle note', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Retour à la navigation', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeChildSortOrder: "Changer l'ordre de tri",
        changeSortAndGroup: 'Changer le tri et le regroupement',
        resetViewToDefaults: 'Réinitialiser la vue aux valeurs par défaut',
        manualSort: 'Tri manuel',
        editSortOrder: "Modifier l'ordre de tri...",
        removeSortProperty: 'Supprimer la propriété de tri',
        descendants: 'descendants',
        subfolders: 'sous-dossiers',
        subtags: 'sous-étiquettes',
        childValues: 'valeurs enfants',
        applySortAndGroupToDescendants: (target: string) => `Appliquer le tri et le regroupement aux ${target}`,
        applyAppearanceToDescendants: (target: string) => `Appliquer l'apparence aux ${target}`,
        showFolders: 'Afficher la navigation', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: 'Réorganiser la navigation',
        finishRootFolderReorder: 'Terminé',
        showExcludedItems: 'Afficher les dossiers, étiquettes et notes masqués', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Masquer les dossiers, étiquettes et notes masqués', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Afficher les panneaux doubles', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Afficher panneau unique', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            'Les deux panneaux ne sont pas disponibles lorsque la barre latérale est trop étroite. Pour modifier cela, réglez « Lorsque la barre latérale est trop étroite » sur « Ne rien faire » dans Paramètres > Apparence et comportement.',
        changeAppearance: "Changer l'apparence", // Tooltip for button to change folder appearance settings (English: Change appearance)
        showNotesFromSubfolders: 'Afficher les notes des sous-dossiers',
        showFilesFromSubfolders: 'Afficher les fichiers des sous-dossiers',
        showNotesFromDescendants: 'Afficher les notes des descendants',
        showFilesFromDescendants: 'Afficher les fichiers des descendants',
        search: 'Rechercher' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Rechercher...', // Placeholder text for search input (English: Search...)
        placeholderVault: 'Rechercher dans le coffre...',
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Effacer la recherche', // Tooltip for clear search button (English: Clear search)
        switchToFilterSearch: 'Passer à la recherche par filtre',
        switchToOmnisearch: 'Passer à Omnisearch',
        saveSearchShortcut: 'Ajouter la recherche aux raccourcis',
        removeSearchShortcut: 'Retirer la recherche des raccourcis',
        shortcutModalTitle: 'Enregistrer la recherche',
        shortcutNamePlaceholder: 'Saisir le nom du raccourci',
        shortcutStartIn: 'Toujours démarrer dans : {path}',
        searchHelp: 'Syntaxe de recherche',
        searchHelpTitle: 'Syntaxe de recherche',
        searchHelpModal: {
            intro: 'Combinez noms de fichiers, propriétés, étiquettes, dates et filtres dans une requête (ex. `meeting .status=active #work @thisweek`). Installez le plugin Omnisearch pour utiliser la recherche plein texte.',
            introSwitching:
                "Basculez entre la recherche par filtre et Omnisearch avec les touches fléchées haut/bas ou en cliquant sur l'icône de recherche.",
            sections: {
                fileNames: {
                    title: 'Noms de fichiers',
                    items: [
                        '`word` Trouver les notes avec "word" dans le nom de fichier.',
                        '`word1 word2` Chaque mot doit correspondre au nom de fichier.',
                        '`-word` Exclure les notes avec "word" dans le nom de fichier.'
                    ]
                },
                tags: {
                    title: 'Étiquettes',
                    items: [
                        "`#tag` Inclure les notes avec l'étiquette (correspond aussi aux étiquettes imbriquées comme `#tag/subtag`).",
                        '`#` Inclure uniquement les notes étiquetées.',
                        "`-#tag` Exclure les notes avec l'étiquette.",
                        '`-#` Inclure uniquement les notes sans étiquettes.',
                        '`#tag1 #tag2` Correspondre aux deux étiquettes (AND implicite).',
                        '`#tag1 AND #tag2` Correspondre aux deux étiquettes (AND explicite).',
                        "`#tag1 OR #tag2` Correspondre à l'une des étiquettes.",
                        '`#a OR #b AND #c` AND a une priorité plus élevée : correspond à `#a`, ou aux deux `#b` et `#c`.',
                        'Cmd/Ctrl+Clic sur une étiquette pour ajouter avec AND. Cmd/Ctrl+Shift+Clic pour ajouter avec OR.'
                    ]
                },
                properties: {
                    title: 'Propriétés',
                    items: [
                        '`.key` Inclure les notes avec une clé de propriété.',
                        '`.key=value` Inclure les notes dont la valeur de propriété contient `value`.',
                        '`."Reading Status"` Inclure les notes avec une clé de propriété contenant des espaces.',
                        '`."Reading Status"="In Progress"` Les clés et valeurs contenant des espaces doivent être entre guillemets doubles.',
                        '`-.key` Exclure les notes avec une clé de propriété.',
                        '`-.key=value` Exclure les notes dont la valeur de propriété contient `value`.',
                        'Cmd/Ctrl+Clic sur une propriété pour ajouter avec AND. Cmd/Ctrl+Shift+Clic pour ajouter avec OR.'
                    ]
                },
                tasks: {
                    title: 'Filtres',
                    items: [
                        '`has:task` Inclure les notes avec des tâches inachevées.',
                        '`-has:task` Exclure les notes avec des tâches inachevées.',
                        '`folder:meetings` Inclure les notes dont un nom de dossier contient `meetings`.',
                        '`folder:/work/meetings` Inclure les notes uniquement dans `work/meetings` (pas les sous-dossiers).',
                        '`folder:/` Inclure les notes uniquement à la racine du coffre.',
                        '`-folder:archive` Exclure les notes dont un nom de dossier contient `archive`.',
                        '`-folder:/archive` Exclure les notes uniquement dans `archive` (pas les sous-dossiers).',
                        "`ext:md` Inclure les notes avec l'extension `md` (`ext:.md` est aussi supporté).",
                        "`-ext:pdf` Exclure les notes avec l'extension `pdf`.",
                        'Combiner avec des tags, des noms et des dates (par exemple : `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'Comportement AND/OR',
                    items: [
                        '`AND` et `OR` sont des opérateurs uniquement dans les requêtes composées exclusivement de tags et propriétés.',
                        'Les requêtes exclusives de tags et propriétés ne contiennent que des filtres de tags et propriétés : `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`.',
                        "Si une requête inclut des noms, des dates (`@...`), des filtres de tâches (`has:task`), des filtres de dossiers (`folder:...`) ou des filtres d'extension (`ext:...`), `AND` et `OR` sont recherchés comme des mots.",
                        'Exemple de requête avec opérateurs : `#work OR .status=started`.',
                        'Exemple de requête mixte : `#work OR ext:md` (`OR` est recherché dans les noms de fichiers).'
                    ]
                },
                dates: {
                    title: 'Dates',
                    items: [
                        "`@today` Trouver les notes d'aujourd'hui en utilisant le champ de date par défaut.",
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` Plages de dates relatives.',
                        '`@2026-02-07` Trouver un jour spécifique (supporte aussi `@20260207`).',
                        '`@2026` Trouver une année civile.',
                        '`@2026-02` ou `@202602` Trouver un mois civil.',
                        '`@2026-W05` ou `@2026W05` Trouver une semaine ISO.',
                        '`@2026-Q2` ou `@2026Q2` Trouver un trimestre civil.',
                        "`@13/02/2026` Formats numériques avec séparateurs (`@07022026` suit votre locale en cas d'ambiguïté).",
                        '`@2026-02-01..2026-02-07` Trouver une plage de jours inclusive (fins ouvertes supportées).',
                        '`@c:...` ou `@m:...` Cibler la date de création ou de modification.',
                        '`-@...` Exclure une correspondance de date.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'Recherche plein texte dans tout le coffre, filtrée par le dossier actuel ou les étiquettes sélectionnées.',
                        'Peut être lent avec moins de 3 caractères dans les grands coffres.',
                        'Ne peut pas rechercher les chemins avec des caractères non-ASCII ou rechercher correctement les sous-chemins.',
                        'Retourne des résultats limités avant le filtrage par dossier, donc les fichiers pertinents peuvent ne pas apparaître si de nombreuses correspondances existent ailleurs.',
                        "Les aperçus de notes affichent les extraits Omnisearch au lieu du texte d'aperçu par défaut."
                    ]
                }
            }
        }
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
            openInDefaultApp: "Ouvrir dans l'application par défaut",
            renameNote: 'Renommer la note',
            deleteNote: 'Supprimer la note',
            deleteMultipleNotes: 'Supprimer {count} notes',
            moveNoteToFolder: 'Déplacer la note vers...',
            moveFileToFolder: 'Déplacer le fichier vers...',
            moveMultipleNotesToFolder: 'Déplacer {count} notes vers...',
            moveMultipleFilesToFolder: 'Déplacer {count} fichiers vers...',
            mergeNotes: 'Fusionner {count} notes...',
            mergeNotesInGroup: 'Fusionner les notes du groupe...',
            setManualSortGroupHeader: "Définir l'en-tête de groupe",
            changeManualSortGroupHeader: "Modifier l'en-tête de groupe",
            manualSortGroupHeader: {
                title: 'En-tête de groupe',
                copyStyle: "Copier le style d'en-tête",
                pasteStyle: "Coller le style d'en-tête",
                remove: "Supprimer l'en-tête de groupe"
            },
            addTag: 'Ajouter une étiquette',
            addPropertyKey: 'Définir la propriété',
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
            setCalendarHighlight: 'Définir le surlignage',
            removeCalendarHighlight: 'Supprimer le surlignage',
            deleteMultipleFiles: 'Supprimer {count} fichiers'
        },
        folder: {
            newNote: 'Nouvelle note',
            newNoteFromTemplate: 'Nouvelle note depuis un modèle',
            newFolder: 'Nouveau dossier',
            newCanvas: 'Nouveau canevas',
            newBase: 'Nouvelle base de données',
            newDrawing: 'Nouveau dessin',
            newExcalidrawDrawing: 'Nouveau dessin Excalidraw',
            newTldrawDrawing: 'Nouveau dessin Tldraw',
            duplicateFolder: 'Dupliquer le dossier',
            searchInFolder: 'Rechercher dans le dossier',
            createFolderNote: 'Créer une note de dossier',
            detachFolderNote: 'Détacher la note de dossier',
            deleteFolderNote: 'Supprimer la note de dossier',
            changeIcon: "Changer l'icône",
            changeColor: 'Changer la couleur',
            changeBackground: 'Changer l’arrière-plan',
            excludeFolder: 'Masquer le dossier',
            unhideFolder: 'Afficher le dossier',
            excludeFromDescendants: 'Masquer dans les dossiers parents',
            includeInDescendants: 'Afficher dans les dossiers parents',
            hiddenFromParentsIndicator: 'Masqué dans les listes des dossiers parents',
            moveFolder: 'Déplacer le dossier vers...',
            renameFolder: 'Renommer le dossier',
            deleteFolder: 'Supprimer le dossier'
        },
        tag: {
            changeIcon: "Changer l'icône",
            changeColor: 'Changer la couleur',
            changeBackground: 'Changer l’arrière-plan',
            showTag: 'Afficher l’étiquette',
            hideTag: 'Masquer l’étiquette'
        },
        property: {
            addKey: 'Configurer les clés de propriété',
            renameKey: 'Renommer la propriété',
            deleteKey: 'Supprimer la propriété'
        },
        navigation: {
            addSeparator: 'Ajouter un séparateur',
            removeSeparator: 'Supprimer le séparateur'
        },
        copyPath: {
            title: 'Copier le chemin',
            asObsidianUrl: 'en URL Obsidian',
            fromVaultFolder: 'depuis le dossier du coffre',
            fromSystemRoot: 'depuis la racine du système'
        },
        style: {
            title: 'Style',
            copy: 'Copier le style',
            paste: 'Coller le style',
            removeIcon: "Supprimer l'icône",
            removeColor: 'Supprimer la couleur',
            removeBackground: "Supprimer l'arrière-plan",
            clear: 'Effacer le style'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        appearance: 'Apparence',
        sortBy: 'Trier par',
        standardPreset: 'Standard',
        compactPreset: 'Compact',
        defaultSuffix: '(par défaut)',
        defaultLabel: 'Par défaut',
        titleRows: 'Lignes de titre',
        previewRows: "Lignes d'aperçu",
        groupBy: 'Grouper par',
        titleRowOption: (rows: number) => `${rows} ligne${rows === 1 ? '' : 's'} de titre`,
        previewRowOption: (rows: number) => `${rows} ligne${rows === 1 ? '' : 's'} d'aperçu`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Appliquer',
            applySortAndGroupTitle: (target: string) => `Appliquer le tri et le regroupement aux ${target}\u202f?`,
            applyAppearanceTitle: (target: string) => `Appliquer l'apparence aux ${target}\u202f?`,
            affectedCountMessage: (count: number) => `Remplacements existants qui seront modifiés\u202f: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'Utiliser le tri manuel ?',
            propertySortMessage: (property: string, count: number) =>
                `Ceci bascule la vue actuelle sur le tri manuel en utilisant « ${property} ». La modification de l'ordre écrit des valeurs numériques dans cette propriété sur ${count} ${count === 1 ? 'note' : 'notes'} au besoin.`,
            propertySortConfirmButton: 'Utiliser le tri manuel',
            removePropertyTitle: 'Supprimer la propriété de tri ?',
            removePropertyMessage: (property: string, count: number) =>
                `Ceci supprime « ${property} » de ${count} ${count === 1 ? 'note' : 'notes'} dans la liste actuelle. L'ordre de tri manuel sera effacé pour ces notes.`,
            removePropertyConfirmButton: 'Supprimer la propriété',
            compactTitle: 'Compacter les valeurs numériques ?',
            compactMessage: (count: number) =>
                `Cette réorganisation nécessite plus d'espace numérique. ${count} ${count === 1 ? 'note recevra' : 'notes recevront'} de nouvelles valeurs numériques.`,
            compactConfirmButton: 'Compacter les valeurs numériques'
        },
        manualSortGroupHeader: {
            title: "Définir l'en-tête de groupe",
            titleLabel: 'Titre',
            placeholder: 'En-tête de groupe',
            icon: 'Icône',
            color: 'Couleur',
            wordCount: 'Afficher le nombre de mots',
            wordCountTarget: 'Nombre de mots cible',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'Lorsque ce champ est vide, l’objectif du groupe utilise la propriété cible définie dans Réglages > Notes > Nombre de mots et de caractères. Remplacez-la en définissant une valeur cible pour ce groupe.',
            description: "Personnalisez l'en-tête de groupe pour cette note. Laissez le titre vide pour supprimer l'en-tête."
        },
        mergeNotes: {
            title: 'Fusionner les notes',
            summary: 'Créer une note à partir de {count} notes dans {folder}.',
            frontmatterRule: 'Le frontmatter de la première note est conservé. Le frontmatter des autres notes est supprimé.',
            crossFolderWarning:
                'Les notes sources se trouvent dans des dossiers différents. Les liens relatifs et les intégrations peuvent ne plus fonctionner dans la note fusionnée.',
            outputName: 'Nom de sortie',
            outputNameDesc: 'La note fusionnée est créée dans le dossier affiché ci-dessus.',
            outputNamePlaceholder: 'Notes fusionnées',
            separator: 'Séparateur',
            separatorDesc: 'Inséré entre les notes.',
            separatorOptions: {
                none: 'Aucun',
                blankLine: 'Ligne vide',
                horizontalRule: 'Ligne horizontale',
                heading: 'Titre avec le titre de la note'
            },
            moveSourcesToTrash: 'Déplacer les notes sources vers la corbeille après la fusion',
            mergeButton: 'Fusionner'
        },
        navRainbowSection: {
            title: (section: string) => `Couleurs arc-en-ciel: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'Rechercher des icônes...',
            recentlyUsedHeader: 'Récemment utilisées',
            emptyStateSearch: 'Commencez à taper pour rechercher des icônes',
            emptyStateNoResults: 'Aucune icône trouvée',
            showingResultsInfo: 'Affichage de 50 résultats sur {count}. Tapez plus pour affiner.',
            emojiInstructions: "Tapez ou collez n'importe quel emoji pour l'utiliser comme icône",
            removeIcon: "Supprimer l'icône",
            removeFromRecents: 'Supprimer des récents',
            allTabLabel: 'Tous'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Ajouter une règle'
        },
        interfaceIcons: {
            title: "Icônes de l'interface",
            fileItemsSection: 'Éléments de fichier',
            items: {
                'nav-shortcuts': 'Raccourcis',
                'nav-recent-files': 'Fichiers récents',
                'nav-expand-all': 'Tout déplier',
                'nav-collapse-all': 'Tout replier',
                'nav-calendar': 'Calendrier',
                'nav-tree-expand': "Chevron d'arbre : déplier",
                'nav-tree-collapse': "Chevron d'arbre : replier",
                'nav-hidden-items': 'Éléments cachés',
                'nav-root-reorder': 'Réorganiser les dossiers racine',
                'nav-new-folder': 'Nouveau dossier',
                'nav-show-single-pane': 'Afficher panneau unique',
                'nav-show-dual-pane': 'Afficher les panneaux doubles',
                'nav-profile-chevron': 'Chevron du menu profil',
                'list-search': 'Recherche',
                'list-reveal-file': 'Révéler le fichier',
                'list-descendants': 'Notes des sous-dossiers',
                'list-sort-ascending': 'Ordre de tri : croissant',
                'list-sort-descending': 'Ordre de tri : décroissant',
                'list-sort-modified': 'Trier par date de modification',
                'list-sort-created': 'Trier par date de création',
                'list-sort-title': 'Trier par titre',
                'list-sort-filename': 'Trier par nom de fichier',
                'list-sort-property': 'Trier par propriété',
                'list-appearance': "Modifier l'apparence",
                'list-new-note': 'Nouvelle note',
                'list-pinned': 'Notes épinglées',
                'nav-folder-open': 'Dossier ouvert',
                'nav-folder-closed': 'Dossier fermé',
                'nav-tags': 'Étiquettes',
                'nav-tag': 'Étiquette',
                'nav-properties': 'Propriétés',
                'nav-property': 'Propriété',
                'nav-property-value': 'Valeur',
                'file-unfinished-task': 'Tâches inachevées',
                'file-word-count': 'Nombre de mots',
                'file-character-count': 'Nombre de caractères'
            }
        },
        colorPicker: {
            currentColor: 'Actuelle',
            newColor: 'Nouvelle',
            paletteDefault: 'Par défaut',
            paletteCustom: 'Personnalisé',
            copyColors: 'Copier la couleur',
            colorsCopied: 'Couleur copiée dans le presse-papiers',
            pasteColors: 'Coller la couleur',
            pasteClipboardError: 'Impossible de lire le presse-papiers',
            pasteInvalidFormat: 'Une valeur de couleur hex attendue',
            colorsPasted: 'Couleur collée avec succès',
            resetUserColors: 'Effacer les couleurs personnalisées',
            clearCustomColorsConfirm: 'Supprimer toutes les couleurs personnalisées ?',
            userColorSlot: 'Couleur {slot}',
            recentColors: 'Couleurs récentes',
            clearRecentColors: 'Effacer les couleurs récentes',
            removeRecentColor: 'Supprimer la couleur',
            apply: 'Appliquer',
            pickerLabel: 'Sélecteur',
            hexLabel: 'HEX',
            hexInputLabel: 'Valeur de couleur hexadécimale',
            saturationValueArea: 'Saturation et luminosité',
            hueSlider: 'Teinte',
            alphaSlider: 'Transparence'
        },
        appearance: {
            tabIcon: 'Icône',
            tabColor: 'Couleur',
            tabBackground: 'Arrière-plan',
            resetIcon: "Supprimer l'icône",
            resetColor: 'Supprimer la couleur',
            resetBackground: "Supprimer l'arrière-plan",
            clear: 'Effacer le style',
            apply: 'Appliquer'
        },
        selectVaultProfile: {
            title: 'Changer le profil du coffre',
            currentBadge: 'Actif',
            emptyState: 'Aucun profil de coffre disponible.'
        },
        tagOperation: {
            renameTitle: "Renommer l'étiquette {tag}",
            deleteTitle: "Supprimer l'étiquette {tag}",
            newTagPrompt: "Entrez le nouveau nom de l'étiquette :",
            newTagPlaceholder: 'nouveau-nom',
            renameWarning: "Renommer l'étiquette {oldTag} modifiera {count} {files}.",
            deleteWarning: "Supprimer l'étiquette {tag} modifiera {count} {files}.",
            modificationWarning: 'Cela mettra à jour les dates de modification des fichiers.',
            affectedFiles: 'Fichiers affectés :',
            andMore: 'et {count} de plus...',
            confirmRename: "Renommer l'étiquette",
            renameUnchanged: '{tag} inchangé',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            renameBatchNotFinalized:
                "Renommés {renamed}/{total}. Non mis à jour : {notUpdated}. Les métadonnées et raccourcis n'ont pas été mis à jour.",
            invalidTagName: "Entrez un nom d'étiquette valide.",
            descendantRenameError: 'Impossible de déplacer une étiquette dans elle-même ou un descendant.',
            confirmDelete: "Supprimer l'étiquette",
            deleteBatchNotFinalized:
                "Supprimés de {removed}/{total}. Non mis à jour : {notUpdated}. Les métadonnées et raccourcis n'ont pas été mis à jour.",
            checkConsoleForDetails: 'Consultez la console pour plus de détails.',
            file: 'fichier',
            files: 'fichiers',
            inlineParsingWarning: {
                title: 'Compatibilité des étiquettes en ligne',
                message:
                    "{tag} contient des caractères qu'Obsidian ne peut pas analyser dans les étiquettes en ligne. Les étiquettes Frontmatter ne sont pas affectées.",
                confirm: 'Utiliser quand même'
            }
        },
        propertyOperation: {
            renameTitle: 'Renommer la propriété {property}',
            deleteTitle: 'Supprimer la propriété {property}',
            newKeyPrompt: 'Nouveau nom de propriété',
            newKeyPlaceholder: 'Saisir le nouveau nom de propriété',
            renameWarning: 'Renommer la propriété {property} modifiera {count} {files}.',
            renameConflictWarning:
                'La propriété {newKey} existe déjà dans {count} {files}. Renommer {oldKey} remplacera les valeurs existantes de {newKey}.',
            deleteWarning: 'Supprimer la propriété {property} modifiera {count} {files}.',
            confirmRename: 'Renommer la propriété',
            confirmDelete: 'Supprimer la propriété',
            renameNoChanges: '{oldKey} → {newKey} (aucun changement)',
            renameSettingsUpdateFailed: 'Propriété {oldKey} → {newKey} renommée. Échec de la mise à jour des paramètres.',
            deleteSingleSuccess: 'Propriété {property} supprimée de 1 note',
            deleteMultipleSuccess: 'Propriété {property} supprimée de {count} notes',
            deleteSettingsUpdateFailed: 'Propriété {property} supprimée. Échec de la mise à jour des paramètres.',
            invalidKeyName: 'Saisissez un nom de propriété valide.'
        },
        fileSystem: {
            newFolderTitle: 'Nouveau dossier',
            renameFolderTitle: 'Renommer le dossier',
            renameFileTitle: 'Renommer le fichier',
            deleteFolderTitle: "Supprimer '{name}' ?",
            deleteFileTitle: "Supprimer '{name}' ?",
            deleteFileAttachmentsTitle: 'Supprimer les pièces jointes ?',
            moveFileConflictTitle: 'Conflit de déplacement',
            folderNamePrompt: 'Entrez le nom du dossier :',
            hideInOtherVaultProfiles: 'Masquer dans les autres profils du coffre',
            renamePrompt: 'Entrez le nouveau nom :',
            renameVaultTitle: "Changer le nom d'affichage du coffre",
            renameVaultPrompt: "Entrez un nom d'affichage personnalisé (laissez vide pour utiliser le nom par défaut) :",
            deleteFolderConfirm: 'Êtes-vous sûr de vouloir supprimer ce dossier et tout son contenu ?',
            deleteFileConfirm: 'Êtes-vous sûr de vouloir supprimer ce fichier ?',
            deleteFileAttachmentsDescriptionSingle: "Cette pièce jointe n'est plus utilisée dans aucune note. Voulez-vous la supprimer ?",
            deleteFileAttachmentsDescriptionMultiple:
                'Ces pièces jointes ne sont plus utilisées dans aucune note. Voulez-vous les supprimer ?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Arborescence',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Galerie',
            moveFileConflictDescriptionSingle: 'Un conflit de fichier a été trouvé dans « {folder} ».',
            moveFileConflictDescriptionMultiple: '{count} conflits de fichiers ont été trouvés dans « {folder} ».',
            moveFileConflictAffectedFiles: 'Fichiers concernés',
            moveFileConflictItem: '« {name} » -> « {suggested} »{renameOnly}',
            moveFileConflictRenameOnly: '(renommer uniquement)',
            moveFileConflictRename: 'Renommer',
            moveFileConflictOverwrite: 'Écraser',
            removeAllTagsTitle: 'Supprimer toutes les étiquettes',
            removeAllTagsFromNote: 'Êtes-vous sûr de vouloir supprimer toutes les étiquettes de cette note ?',
            removeAllTagsFromNotes: 'Êtes-vous sûr de vouloir supprimer toutes les étiquettes de {count} notes ?'
        },
        folderNoteType: {
            title: 'Sélectionner le type de note de dossier',
            folderLabel: 'Dossier : {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `Déplacer ${name} vers le dossier...`,
            multipleFilesLabel: (count: number) => `${count} fichiers`,
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
        calendarTemplate: {
            placeholder: 'Rechercher des modèles...',
            instructions: {
                navigate: 'pour naviguer',
                select: 'pour sélectionner le modèle',
                dismiss: 'pour annuler'
            }
        },
        navigationBanner: {
            placeholder: 'Rechercher des images...',
            svgMissingDimensions: 'Le fichier SVG sélectionné ne définit ni largeur, ni hauteur, ni viewBox.',
            instructions: {
                navigate: 'pour naviguer',
                select: 'pour définir la bannière',
                dismiss: 'pour annuler'
            }
        },
        tagSuggest: {
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
        propertySuggest: {
            placeholder: 'Sélectionner une clé de propriété...',
            navigatePlaceholder: 'Naviguer vers la propriété...',
            instructions: {
                navigate: 'pour naviguer',
                select: 'pour ajouter la propriété',
                dismiss: 'pour annuler'
            }
        },
        propertyKeyVisibility: {
            title: 'Visibilité des clés de propriété',
            description:
                "Contrôlez où les valeurs de propriété sont affichées. Les colonnes correspondent au panneau de navigation, au panneau de liste et au menu contextuel du fichier. Utilisez la rangée du bas pour basculer toutes les rangées d'une colonne.",
            searchPlaceholder: 'Rechercher des clés de propriété...',
            propertyColumnLabel: 'Propriété',
            showInNavigation: 'Afficher dans la navigation',
            showInList: 'Afficher dans la liste',
            showInFileMenu: 'Afficher dans le menu du fichier',
            toggleAllInNavigation: 'Tout basculer dans la navigation',
            toggleAllInList: 'Tout basculer dans la liste',
            toggleAllInFileMenu: 'Tout basculer dans le menu du fichier',
            applyButton: 'Appliquer',
            emptyState: 'Aucune clé de propriété trouvée.'
        },
        welcome: {
            title: 'Bienvenue dans {pluginName}',
            introText:
                'Bonjour ! Avant de commencer, je vous recommande vivement de regarder les cinq premières minutes de la vidéo ci-dessous pour comprendre comment fonctionnent les panneaux et le bouton « Afficher les notes des sous-dossiers ».',
            continueText:
                "Si vous avez encore cinq minutes, continuez à regarder la vidéo pour comprendre les modes d'affichage compacts et comment configurer correctement les raccourcis et les touches de raccourci importantes.",
            thanksText: 'Merci beaucoup pour le téléchargement et profitez-en !',
            videoAlt: 'Installer et maîtriser Notebook Navigator',
            openVideoButton: 'Lire la vidéo',
            closeButton: 'Peut-être plus tard'
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
            deleteAttachments: 'Échec de la suppression des pièces jointes : {error}',
            mergeNotes: 'Échec de la fusion des notes : {error}',
            mergeNotesOpenOutput:
                'La note fusionnée a été créée sous le nom {name}, mais elle n’a pas pu être ouverte : {error}. Les notes sources n’ont pas été modifiées.',
            mergeNotesOpenSkipped: 'Une autre demande d’ouverture de fichier a pris la priorité.',
            mergeNotesTrashSources: 'Note fusionnée créée. Échec du déplacement de {count} notes sources vers la corbeille.',
            duplicateNote: 'Échec de la duplication de la note : {error}',
            duplicateFolder: 'Échec de la duplication du dossier : {error}',
            openVersionHistory: "Échec de l'ouverture de l'historique des versions : {error}",
            versionHistoryNotFound: "Commande d'historique des versions introuvable. Assurez-vous qu'Obsidian Sync est activé.",
            revealInExplorer: "Échec de l'affichage du fichier dans l'explorateur système : {error}",
            openInDefaultApp: "Échec de l'ouverture dans l'application par défaut : {error}",
            openInDefaultAppNotAvailable: "L'ouverture dans l'application par défaut n'est pas disponible sur cette plateforme",
            folderNoteAlreadyExists: 'La note de dossier existe déjà',
            folderAlreadyExists: 'Le dossier "{name}" existe déjà',
            folderNotesDisabled: 'Activez les notes de dossier dans les paramètres pour convertir des fichiers',
            folderNoteAlreadyLinked: 'Ce fichier agit déjà comme une note de dossier',
            folderNoteNotFound: 'Aucune note de dossier dans le dossier sélectionné',
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
        warnings: {
            linkBreakingNameCharacters: 'Ce nom contient des caractères qui cassent les liens Obsidian : #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'Les noms ne peuvent pas commencer par un point ni contenir : ou /.',
            forbiddenNameCharactersWindows: 'Les caractères réservés à Windows ne sont pas autorisés : <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'Dossier masqué : {name}',
            showFolder: 'Dossier affiché : {name}',
            folderExcludedFromDescendants: 'Masqué dans les listes des dossiers parents : {name}',
            folderIncludedInDescendants: 'Affiché dans les listes des dossiers parents : {name}',
            mergeNotes: '{count} notes fusionnées dans {name}'
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
            mergeNotesRequireMultipleMarkdown: 'Sélectionnez au moins deux notes Markdown à fusionner',
            tagOperationsNotAvailable: "Opérations d'étiquettes non disponibles",
            propertyOperationsNotAvailable: 'Opérations de propriétés non disponibles',
            tagsRequireMarkdown: 'Les étiquettes ne sont prises en charge que sur les notes Markdown',
            propertiesRequireMarkdown: 'Les propriétés ne sont prises en charge que sur les notes Markdown',
            propertySetOnNote: 'Propriété mise à jour sur 1 note',
            propertySetOnNotes: 'Propriété mise à jour sur {count} notes',
            manualSortPropertyRemovedFromNote: 'Propriété de tri supprimée de 1 note',
            manualSortPropertyRemovedFromNotes: 'Propriété de tri supprimée de {count} notes',
            iconPackDownloaded: '{provider} téléchargé',
            iconPackUpdated: '{provider} mis à jour ({version})',
            iconPackRemoved: '{provider} supprimé',
            iconPackLoadFailed: 'Échec du chargement de {provider}',
            hiddenFileReveal: "Le fichier est masqué. Activer « Afficher les éléments masqués » pour l'afficher"
        },
        confirmations: {
            deleteMultipleFiles: 'Voulez-vous vraiment supprimer {count} fichiers ?',
            deleteConfirmation: 'Cette action ne peut pas être annulée.'
        },
        defaultNames: {
            untitled: 'Sans titre'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Impossible de déplacer un dossier dans lui-même ou un sous-dossier.',
            itemAlreadyExists: 'Un élément nommé "{name}" existe déjà à cet emplacement.',
            failedToMove: 'Échec du déplacement : {error}',
            failedToAddTag: 'Échec de l\'ajout de l\'étiquette "{tag}"',
            failedToSetProperty: 'Échec de la mise à jour de la propriété : {error}',
            failedToClearTags: 'Échec de la suppression des étiquettes',
            failedToMoveFolder: 'Échec du déplacement du dossier "{name}"',
            failedToImportFiles: "Échec de l'importation : {names}"
        },
        notifications: {
            filesAlreadyExist: '{count} fichiers existent déjà dans la destination',
            filesAlreadyHaveTag: '{count} fichiers ont déjà cette étiquette ou une plus spécifique',
            filesAlreadyHaveProperty: '{count} fichiers possèdent déjà cette propriété',
            noTagsToClear: 'Aucune étiquette à supprimer',
            fileImported: '1 fichier importé',
            filesImported: '{count} fichiers importés'
        }
    },

    // Date grouping
    dateGroups: {
        today: "Aujourd'hui",
        yesterday: 'Hier',
        previous7Days: '7 derniers jours',
        previous30Days: '30 derniers jours'
    },

    // Plugin commands
    commands: {
        open: 'Ouvrir', // Command palette: Opens the Notebook Navigator view (English: Open)
        toggleLeftSidebar: 'Basculer le panneau latéral gauche', // Command palette: Toggles left sidebar, opening Notebook Navigator when uncollapsing (English: Toggle left sidebar)
        openHomepage: "Ouvrir la page d'accueil", // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        openDailyNote: 'Ouvrir la note quotidienne',
        openWeeklyNote: 'Ouvrir la note hebdomadaire',
        openMonthlyNote: 'Ouvrir la note mensuelle',
        openQuarterlyNote: 'Ouvrir la note trimestrielle',
        openYearlyNote: 'Ouvrir la note annuelle',
        revealFile: 'Révéler le fichier', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Rechercher', // Command palette: Toggle search in the file list (English: Search)
        searchVaultRoot: 'Rechercher dans tout le coffre', // Command palette: Selects the vault root folder and focuses search with subfolders included (English: Search whole vault)
        toggleDualPane: 'Basculer la disposition à double panneau', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        toggleDualPaneOrientation: "Basculer l'orientation du double panneau", // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'Afficher/masquer le calendrier', // Command palette: Toggles showing the calendar overlay in the navigation pane (English: Toggle calendar)
        selectVaultProfile: 'Changer le profil du coffre', // Command palette: Opens a modal to choose a different vault profile (English: Switch vault profile)
        selectVaultProfile1: 'Changer vers le profil du coffre 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Changer vers le profil du coffre 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Changer vers le profil du coffre 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Supprimer les fichiers', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Créer une nouvelle note', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Nouvelle note depuis un modèle', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Déplacer les fichiers', // Command palette: Move selected files to another folder (English: Move files)
        mergeNotes: 'Fusionner les notes', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'Sélectionner le fichier suivant', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Sélectionner le fichier précédent', // Command palette: Selects the previous file in the current view (English: Select previous file)
        navigateBack: 'Naviguer en arrière',
        navigateForward: 'Naviguer en avant',
        convertToFolderNote: 'Convertir en note de dossier', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Définir comme note de dossier', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Détacher la note de dossier', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Épingler toutes les notes de dossier', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Naviguer vers le dossier', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: "Naviguer vers l'étiquette", // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        navigateToProperty: 'Naviguer vers la propriété', // Command palette: Navigate to a property key or value using fuzzy search (English: Navigate to property)
        addShortcut: 'Ajouter aux raccourcis', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: 'Ouvrir le raccourci {number}',
        toggleDescendants: 'Basculer descendants', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Basculer les dossiers, étiquettes et notes masqués', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Basculer le tri des étiquettes', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: 'Basculer les étiquettes par sélection',
        togglePropertiesBySelection: 'Basculer les propriétés par sélection',
        toggleCompactMode: 'Basculer le mode compact', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Basculer la section épinglée',
        collapseExpand: 'Replier / déplier tous les éléments', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        collapseExpandSelectedItem: "Replier / déplier l'élément sélectionné",
        addTag: 'Ajouter une étiquette aux fichiers sélectionnés', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        setProperty: 'Définir une propriété sur les fichiers sélectionnés', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'Supprimer une étiquette des fichiers sélectionnés', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Supprimer toutes les étiquettes des fichiers sélectionnés', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        openAllFiles: 'Ouvrir tous les fichiers', // Command palette: Opens all files in the current folder or tag (English: Open all files)
        rebuildCache: 'Reconstruire le cache', // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
        restoreDefaultSettings: 'Restaurer les paramètres par défaut' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Navigateur de Carnets', // Name shown in the view header/tab (English: Notebook Navigator)
        calendarViewName: 'Calendrier', // Name shown in the view header/tab (English: Calendar)
        folderNoteSidebarViewName: 'Note de dossier', // Name shown in the folder note sidebar tab (English: Folder note)
        ribbonTooltip: 'Navigateur de Carnets', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Révéler dans le Navigateur de Carnets', // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
        settingsUnavailableNotice:
            "Le Navigateur de Carnets n'a pas pu lire ses paramètres et ne s'est pas lancé. Si votre coffre est en cours de synchronisation, redémarrez Obsidian une fois la synchronisation terminée. Pour repartir avec les paramètres par défaut, exécutez la commande « Restaurer les paramètres par défaut ».", // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsRecovery: {
            confirmTitle: 'Restaurer les paramètres par défaut', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                "Ceci remplace le fichier de paramètres du Navigateur de Carnets par les paramètres par défaut. Si votre coffre est encore en cours de synchronisation, les valeurs par défaut restaurées peuvent remplacer les paramètres enregistrés sur vos autres appareils. Un fichier de paramètres lisible est d'abord copié vers une sauvegarde horodatée dans le dossier du plugin.", // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'Restaurer les valeurs par défaut', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: 'Impossible de terminer la récupération des paramètres. Les préférences locales ont été conservées.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'Paramètres par défaut restaurés. Redémarrez Obsidian pour terminer.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Dernière modification le',
        createdAt: 'Créé le',
        file: 'fichier',
        files: 'fichiers',
        folder: 'dossier',
        folders: 'dossiers',
        wordCount: 'Nombre de mots'
    },

    fileCounts: {
        words: '{count} mots',
        characters: '{count} caractères',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'Modifier les paramètres par défaut',
        metadataReport: {
            exportSuccess: 'Rapport de métadonnées échouées exporté vers : {filename}',
            exportFailed: "Échec de l'exportation du rapport de métadonnées"
        },
        sections: {
            general: 'Général',
            vaultFilters: "Filtres d'affichage",
            appearanceBehavior: 'Apparence et comportement',
            navigationPane: 'Panneau de navigation',
            calendar: 'Calendrier',
            fileOperations: 'Opérations sur les fichiers',
            icons: "Packs d'icônes",
            folders: 'Dossiers',
            folderNotes: 'Notes de dossier',
            folderNoteFiles: 'Fichiers de notes de dossier',
            foldersAndFolderNotes: 'Dossiers et notes de dossier',
            tagsAndProperties: 'Tags et propriétés',
            tags: 'Étiquettes',
            listPane: 'Panneau de liste',
            notes: 'Affichage des fichiers',
            shortcutsAndRecentFiles: 'Raccourcis et fichiers récents',
            advanced: 'Avancé'
        },
        pageGroups: {
            configuration: 'Configuration',
            navigationAndContent: 'Panneau de navigation',
            notesAndLists: 'Panneau de liste',
            calendarAndTools: 'Calendrier et outils'
        },
        pageDescriptions: {
            general: 'Notes de version, support, profil du coffre, types de fichiers et clés de propriétés.',
            vaultFilters: 'Dossiers, étiquettes, fichiers, étiquettes de fichiers et règles de propriétés masqués.',
            appearanceBehavior: 'Comportement, navigation au clavier, boutons de souris, apparence et formatage.',
            navigationPane: 'Disposition, apparence, comptage des notes, comportement de repli et couleurs arc-en-ciel.',
            shortcuts: 'Visibilité des raccourcis, badges, fichiers récents et éléments épinglés.',
            calendar: 'Affichage du calendrier, notes de date, modèles, paramètres régionaux et emplacement de la barre latérale.',
            fileOperations:
                'Modèles, confirmations de suppression, pièces jointes et comportement en cas de conflit de déplacement de fichiers.',
            foldersAndFolderNotes: 'Affichage des dossiers, notes de dossier, modèles et comportement des notes de dossier.',
            tagsProperties: 'Sections de tags et propriétés, icônes, tri, portée et héritage.',
            listPane: 'Tri, regroupement, modes de liste, notes épinglées et aperçus de dessins.',
            frontmatter: "Champs frontmatter pour noms d'affichage, horodatages, icônes et couleurs.",
            notes: 'Titres, texte d’aperçu, images mises en avant, tags, propriétés, dates, nombres de mots et nombres de caractères.',
            iconPacks: "Icônes d'interface, icônes de fichiers et gestion des packs d'icônes.",
            advanced: 'Diagnostics, nettoyage des métadonnées, import/export et réinitialisation.'
        },
        groups: {
            general: {
                vaultConfiguration: 'Configuration du coffre',
                templates: 'Modèles',
                behavior: 'Comportement',
                startup: 'Démarrage',
                keyboardNavigation: 'Navigation au clavier',
                mouseButtons: 'Boutons de souris',
                view: 'Apparence',
                icons: 'Icônes',
                desktopAppearance: 'Apparence sur ordinateur',
                mobileAppearance: 'Apparence mobile',
                formatting: 'Formatage'
            },
            advanced: {
                maintenance: 'Maintenance',
                resetSettings: 'Réinitialiser les paramètres'
            },
            navigation: {
                appearance: 'Apparence',
                banner: 'Bannière',
                collapseItems: 'Replier les éléments',
                dragAndDrop: 'Glisser-déposer',
                noteCounts: 'Nombre de notes',
                rainbowColors: 'Couleurs arc-en-ciel',
                leftSidebar: 'Barre latérale gauche',
                calendarIntegration: 'Intégration du calendrier'
            },
            list: {
                display: 'Apparence',
                groupHeaders: 'En-têtes de groupe',
                propertySort: 'Tri par propriété',
                manualSort: 'Tri manuel',
                pinnedNotes: 'Notes épinglées',
                drawingPreviews: 'Aperçus des dessins'
            },
            notes: {
                frontmatter: 'Champs frontmatter',
                tasks: 'Tâches',
                icon: 'Icône',
                title: 'Titre',
                previewText: "Texte d'aperçu",
                featureImage: 'Image vedette',
                tags: 'Étiquettes',
                properties: 'Propriétés',
                date: 'Date',
                parentFolder: 'Dossier parent',
                wordCount: 'Nombre de mots et de caractères'
            }
        },
        syncMode: {
            notSynced: '(non synchronisé)',
            switchToSynced: 'Activer la synchronisation',
            switchToLocal: 'Désactiver la synchronisation'
        },
        items: {
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
                name: 'Ordre de tri par défaut',
                desc: "Choisissez l'ordre de tri par défaut des notes.",
                options: {
                    'modified-desc': 'Date de modification (plus récente en haut)',
                    'modified-asc': 'Date de modification (plus ancienne en haut)',
                    'created-desc': 'Date de création (plus récente en haut)',
                    'created-asc': 'Date de création (plus ancienne en haut)',
                    'title-asc': 'Titre (A en haut)',
                    'title-desc': 'Titre (Z en haut)',
                    'filename-asc': 'Nom de fichier (A en haut)',
                    'filename-desc': 'Nom de fichier (Z en haut)'
                },
                directions: {
                    asc: 'Croissant',
                    desc: 'Décroissant'
                },
                fields: {
                    modified: 'Date de modification',
                    created: 'Date de création',
                    title: 'Titre',
                    filename: 'Nom de fichier',
                    property: 'Propriété'
                }
            },
            propertySortKey: {
                name: 'Propriétés de tri',
                desc: 'Propriétés frontmatter séparées par des virgules affichées comme options de tri par propriété. Les valeurs de tableau sont jointes en une seule chaîne. Ces propriétés ne sont pas modifiées.',
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: 'Tri secondaire',
                desc: 'Utilisé avec le tri par propriété lorsque les notes ont la même valeur de propriété ou aucune valeur.',
                options: {
                    title: 'Titre',
                    filename: 'Nom de fichier',
                    created: 'Date de création',
                    modified: 'Date de modification'
                }
            },
            propertySortInstructions: {
                intro: 'Chaque propriété listée ci-dessus apparaît comme option de tri dans le menu de tri du panneau de liste. En sélectionner une trie les notes selon sa valeur frontmatter.'
            },
            manualSortPropertyKey: {
                name: 'Propriété de tri manuel',
                desc: 'Propriété frontmatter utilisée pour enregistrer les valeurs numériques du tri manuel.'
            },
            manualSortGroupHeaderProperty: {
                name: "Propriété d'en-tête de groupe",
                desc: 'Propriété frontmatter utilisée pour enregistrer les en-têtes de groupe personnalisés.'
            },
            groupHeadersInstructions: {
                intro: 'Les en-têtes de groupe personnalisés sont affichés au-dessus des notes dans le panneau de liste.',
                items: [
                    'Depuis le menu de tri du panneau de liste, définissez le regroupement sur **Personnalisé**.',
                    "Cliquez avec le bouton droit sur une note et choisissez **Définir l'en-tête de groupe** pour ajouter un en-tête au-dessus."
                ]
            },
            manualSortNewNotePlacement: {
                name: 'Emplacement des nouvelles notes',
                desc: 'Choisissez où sont placées les nouvelles notes lorsque la liste actuelle utilise le tri manuel.',
                options: {
                    top: 'En haut',
                    bottom: 'En bas',
                    'below-selected-note': 'Sous la note sélectionnée',
                    unsorted: 'Non trié'
                }
            },
            confirmBeforeManualSort: {
                name: 'Confirmer avant le tri manuel',
                desc: 'Afficher un avertissement avant d’écrire la propriété de tri manuel dans les notes pour la première fois. Lorsque désactivé, les notes reçoivent la propriété sans avertissement.'
            },
            manualSortInstructions: {
                intro: 'Le tri manuel écrit une valeur numérique dans une propriété frontmatter sur chaque note. Les notes sans valeur apparaissent sous Non trié.',
                items: [
                    'Activez le tri manuel en choisissant **Tri manuel** dans le menu de tri. Ensuite, il existe deux façons de réorganiser les notes.',
                    "Choisissez **Modifier l'ordre de tri...** dans le menu de tri pour ouvrir une vue de réorganisation. Glissez les notes avec la souris, ou par toucher sur mobile. Sur ordinateur, **Cmd/Ctrl** ou **Shift** clic sélectionne plusieurs notes, puis glisser l'une d'elles déplace tout le groupe.",
                    'Dans le panneau de liste, sélectionnez une note ou plusieurs notes, puis appuyez sur **Cmd/Ctrl + Arrow Up/Down** pour déplacer la sélection vers le haut ou le bas.'
                ]
            },
            revealFileOnListChanges: {
                name: 'Défiler vers le fichier sélectionné lors des changements de liste',
                desc: "Défiler vers le fichier sélectionné lors de l'épinglage de notes, l'affichage de notes descendantes, le changement d'apparence de dossier ou l'exécution d'opérations sur les fichiers."
            },
            includeDescendantNotes: {
                name: 'Afficher les notes des sous-dossiers / descendants',
                desc: "Inclure les notes des sous-dossiers imbriqués et des descendants d'étiquettes et de propriétés lors de l'affichage d'un dossier, d'une étiquette ou d'une propriété."
            },
            limitPinnedToCurrentFolder: {
                name: 'Épingler les notes uniquement dans leur dossier',
                desc: 'Les notes épinglées n’apparaissent épinglées que dans leur propre dossier. Utile pour les notes de dossier ou si vous avez beaucoup de notes épinglées. N’affecte pas les vues par étiquette ou propriété.'
            },
            separateNoteCounts: {
                name: 'Afficher les nombres de notes actuelles et descendantes séparément',
                desc: 'Affiche le nombre de notes au format "actuel ▾ descendants" pour les dossiers, étiquettes et propriétés.'
            },
            groupNotes: {
                name: 'Regroupement par défaut',
                desc: 'Personnalisé affiche les en-têtes définis dans le frontmatter. Date regroupe les notes par date. Dossier regroupe les notes par dossier. Les vues par étiquette et par propriété utilisent des groupes de dates lorsque dossier est sélectionné.',
                options: {
                    custom: 'Personnalisé',
                    date: 'Date',
                    folder: 'Dossier'
                }
            },
            showSelectedNavigationPills: {
                name: 'Toujours afficher toutes les pastilles de tags et propriétés',
                desc: 'Lorsque désactivé, les pastilles correspondant à la sélection de navigation actuelle sont masquées (par ex. la pastille du tag « recettes » est masquée lors de la navigation dans le tag « recettes »). Activer pour garder toutes les pastilles visibles.'
            },
            stickyGroupHeaders: {
                name: 'En-têtes de groupe épinglés',
                desc: "Garder visible l'en-tête de section actuel (date, dossier ou épinglé) lors du défilement."
            },
            showFolderGroupPaths: {
                name: 'Afficher les chemins des sous-dossiers',
                desc: 'Lors du regroupement par dossier dans le panneau de liste, afficher les chemins des sous-dossiers au lieu des seuls noms de dossier.'
            },
            showGroupHeaderItemCounts: {
                name: 'Afficher le nombre d’éléments',
                desc: 'Affiche le nombre d’éléments dans chaque en-tête de groupe du panneau de liste.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'Regroupement par dossier : fichiers du dossier actuel en bas',
                desc: 'Lorsque le regroupement par défaut est Dossier, déplacer les fichiers directement dans le dossier sélectionné sous les groupes de sous-dossiers.'
            },
            defaultListMode: {
                name: 'Mode de liste par défaut',
                desc: "Sélectionner la mise en page de liste par défaut. Standard affiche le titre, la date, la description et le texte d'aperçu. Compact affiche uniquement le titre. L'apparence peut être remplacée par dossier.",
                options: {
                    standard: 'Standard',
                    compact: 'Compact'
                }
            },
            showFileIcons: {
                name: 'Afficher les icônes de fichier',
                desc: "Afficher les icônes de fichier avec espacement aligné à gauche. La désactivation supprime les icônes et l'indentation. Priorité : icône de tâches inachevées > icône personnalisée > icône de dossier > icône de nom de fichier > icône de type de fichier > icône par défaut."
            },
            useFolderIcon: {
                name: "Utiliser l'icône du dossier",
                desc: "Afficher l'icône du dossier parent lorsqu'aucune icône de fichier personnalisée n'est définie. La couleur du dossier est utilisée lorsqu'aucune couleur de fichier personnalisée n'est définie."
            },
            showFileIconUnfinishedTask: {
                name: 'Icône de tâches inachevées',
                desc: "Afficher une icône de tâche lorsqu'une note contient des tâches inachevées."
            },
            showFileBackgroundUnfinishedTask: {
                name: 'Fond de tâches inachevées',
                desc: "Appliquer une couleur de fond lorsqu'une note contient des tâches inachevées."
            },
            unfinishedTaskBackgroundColor: {
                name: 'Couleur de fond des tâches inachevées',
                desc: "Définir la couleur de fond utilisée lorsqu'une note contient des tâches inachevées."
            },
            showFilenameMatchIcons: {
                name: 'Icônes par nom de fichier',
                desc: 'Attribuer des icônes aux fichiers selon le texte dans leurs noms.'
            },
            fileNameIconMap: {
                name: 'Correspondance nom-icône',
                desc: "Les fichiers contenant le texte obtiennent l'icône spécifiée. Une correspondance par ligne : texte=icône",
                placeholder: '# texte=icône\nréunion=ph-calendar\nfacture=ph-receipt',
                editTooltip: 'Modifier les correspondances'
            },
            showCategoryIcons: {
                name: 'Icônes par type de fichier',
                desc: 'Attribuer des icônes aux fichiers selon leur extension.'
            },
            fileTypeIconPreset: {
                name: "Préréglage d'icônes de fichiers",
                desc: "Choisissez les icônes intégrées ou un préréglage de pack d'icônes. Les règles d'extension personnalisées remplacent ce préréglage.",
                options: {
                    none: 'Icônes intégrées'
                },
                notInstalledWarning: "Ce pack d'icônes n'est pas installé. Les icônes intégrées sont affichées à la place."
            },
            fileTypeIconMap: {
                name: 'Correspondance type-icône',
                desc: "Les fichiers avec l'extension obtiennent l'icône spécifiée. Une correspondance par ligne : extension=icône",
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'Modifier les correspondances'
            },
            compactItemHeight: {
                name: 'Hauteur des éléments compacts',
                desc: 'Définit la hauteur des éléments compacts sur ordinateur et mobile (pixels).',
                resetTooltip: 'Restaurer la valeur par défaut (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Adapter le texte à la hauteur compacte',
                desc: 'Adapte le texte des éléments compacts lorsque la hauteur est réduite.'
            },
            showParentFolder: {
                name: 'Afficher le dossier parent',
                desc: 'Afficher le chemin du dossier parent pour les notes dans les sous-dossiers, étiquettes ou propriétés.'
            },
            parentFolderClickRevealsFile: {
                name: 'Clic sur dossier parent ouvre le dossier',
                desc: "Cliquer sur l'étiquette du dossier parent ouvre le dossier dans le panneau de liste."
            },
            showParentFolderColor: {
                name: 'Afficher la couleur du dossier parent',
                desc: 'Utiliser les couleurs des dossiers sur les étiquettes des dossiers parents.'
            },
            showParentFolderIcon: {
                name: "Afficher l'icône du dossier parent",
                desc: 'Afficher les icônes de dossier à côté des étiquettes des dossiers parents.'
            },
            showQuickActions: {
                name: 'Afficher les actions rapides',
                desc: "Afficher les boutons d'action au survol des fichiers. Les contrôles des boutons sélectionnent les actions qui apparaissent."
            },
            dualPane: {
                name: 'Disposition à double panneau',
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
            narrowSidebarLayout: {
                name: 'Lorsque la barre latérale est trop étroite',
                desc: 'Choisissez ce qui se passe lorsque le panneau de navigation et le panneau de liste ne tiennent pas côte à côte.',
                options: {
                    none: 'Ne rien faire',
                    singlePane: 'Passer au panneau unique',
                    vertical: 'Passer à la séparation verticale'
                }
            },
            narrowSidebarTrigger: {
                name: 'Seuil de barre latérale étroite',
                desc: 'Choisissez comment le seuil de largeur de la barre latérale est calculé.',
                options: {
                    fitPanes: 'Adapter les panneaux',
                    customWidth: 'Largeur personnalisée'
                }
            },
            narrowSidebarCustomWidth: {
                name: 'Largeur du seuil de barre latérale étroite',
                desc: 'Basculer lorsque la barre latérale est plus étroite que cette largeur.',
                resetTooltip: 'Réinitialiser à la largeur par défaut'
            },
            appearanceBackground: {
                name: 'Couleur de fond',
                desc: 'Choisissez les couleurs de fond pour les volets de navigation et de liste.',
                options: {
                    separate: 'Arrière-plans séparés',
                    primary: 'Utiliser le fond de la liste',
                    secondary: 'Utiliser le fond de navigation'
                }
            },
            appearanceScale: {
                name: 'Niveau de zoom',
                desc: 'Contrôle le niveau de zoom global de Notebook Navigator (pourcentage).'
            },
            useFloatingToolbars: {
                name: "Utiliser les barres d'outils flottantes sur iOS/iPadOS",
                desc: "S'applique uniquement à iOS et iPadOS."
            },
            startView: {
                name: 'Vue de démarrage par défaut',
                desc: "Choisissez le panneau actif à l'ouverture de Notebook Navigator. La disposition à panneau unique affiche ce panneau en premier ; la disposition à double panneau lui donne le focus clavier.",
                options: {
                    navigation: 'Panneau de navigation',
                    files: 'Panneau de liste'
                }
            },
            toolbarButtons: {
                name: "Boutons de la barre d'outils",
                desc: "Choisissez quels boutons apparaissent dans la barre d'outils. Les boutons masqués restent accessibles via les commandes et les menus.",
                navigationLabel: 'Barre de navigation',
                listLabel: 'Barre de liste'
            },
            createNewNotesInNewTab: {
                name: 'Ouvrir les nouvelles notes dans un nouvel onglet',
                desc: "Lorsque activé, la commande Créer une nouvelle note ouvre les notes dans un nouvel onglet. Lorsque désactivé, les notes remplacent l'onglet actuel."
            },
            autoRevealActiveNote: {
                name: 'Révéler automatiquement la note active',
                desc: "Révéler automatiquement les notes lorsqu'elles sont ouvertes depuis le Commutateur rapide, les liens ou la recherche."
            },
            autoRevealShortestPath: {
                name: 'Révélation automatique : Utiliser le chemin le plus court',
                desc: 'Activé : La révélation automatique sélectionne le dossier parent ou le tag visible le plus proche. Désactivé : La révélation automatique sélectionne le dossier réel du fichier et le tag exact.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Révélation automatique : Ignorer les événements du panneau de droite',
                desc: "Ne pas changer la note active lors d'un clic ou du changement de notes dans le panneau de droite."
            },
            autoRevealIgnoreOtherWindows: {
                name: "Révélation automatique : Ignorer les événements d'autres fenêtres",
                desc: 'Ne pas changer la note active lorsque vous travaillez avec des notes dans une autre fenêtre.'
            },
            paneTransitionDuration: {
                name: 'Animation panneau unique',
                desc: 'Durée de transition lors du changement de panneau en mode panneau unique (millisecondes).',
                resetTooltip: 'Réinitialiser par défaut'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Sélectionner automatiquement la première note',
                desc: "Ouvrir automatiquement la première note lors du changement de dossier, d'étiquette ou de propriété."
            },
            skipAutoScroll: {
                name: 'Désactiver le défilement automatique pour les raccourcis',
                desc: 'Ne pas faire défiler le panneau de navigation lors du clic sur les éléments de raccourcis.'
            },
            autoExpandNavItems: {
                name: 'Développer à la sélection',
                desc: 'Développer les dossiers et étiquettes lors de la sélection. En mode panneau unique, la première sélection développe, la seconde affiche les fichiers.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'Une branche développée',
                desc: "Replier les autres branches du même arbre lors du développement d'un dossier, d'une étiquette ou d'une propriété."
            },
            springLoadedFolders: {
                name: 'Développer au survol',
                desc: 'Développer les dossiers et les étiquettes au survol pendant le glisser-déposer.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Développer au survol : Délai de première expansion',
                desc: 'Délai avant que le premier dossier ou étiquette se développe pendant un glisser-déposer (secondes).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: "Développer au survol : Délai d'expansion suivante",
                desc: "Délai avant de développer d'autres dossiers ou étiquettes pendant le même glisser-déposer (secondes)."
            },
            navigationBanner: {
                name: 'Bannière de navigation (profil de coffre)',
                desc: 'Afficher une image au-dessus du panneau de navigation. Change avec le profil de coffre sélectionné.',
                current: 'Bannière actuelle : {path}',
                chooseButton: 'Choisir une image'
            },
            pinNavigationBanner: {
                name: 'Épingler la bannière',
                desc: "Épingler la bannière de navigation au-dessus de l'arborescence de navigation."
            },
            showShortcuts: {
                name: 'Afficher les raccourcis',
                desc: 'Afficher la section des raccourcis dans le panneau de navigation.'
            },
            shortcutBadgeDisplay: {
                name: 'Badge de raccourci',
                desc: "Contenu affiché à côté des raccourcis. Utilisez les commandes 'Ouvrir le raccourci 1-9' pour ouvrir les raccourcis directement.",
                options: {
                    index: 'Position (1-9)',
                    count: "Nombre d'éléments",
                    none: 'Aucun'
                }
            },
            showRecentNotes: {
                name: 'Afficher les fichiers récents',
                desc: 'Afficher la section des fichiers récents dans le panneau de navigation.'
            },
            hideRecentNotes: {
                name: 'Masquer les types de fichiers des fichiers récents',
                desc: 'Choisir les types de fichiers à masquer dans la section des fichiers récents.',
                options: {
                    none: 'Aucun',
                    folderNotes: 'Notes de dossier'
                }
            },
            recentNotesCount: {
                name: 'Nombre de fichiers récents',
                desc: 'Nombre de fichiers récents à afficher.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Épingler les fichiers récents avec les raccourcis',
                desc: "Inclure les fichiers récents lors de l'épinglage des raccourcis."
            },
            calendarEnabled: {
                name: 'Activer le calendrier',
                desc: 'Activer les fonctionnalités de calendrier de Notebook Navigator.'
            },
            calendarPlacement: {
                name: 'Emplacement du calendrier',
                desc: 'Afficher dans la barre latérale gauche ou droite.',
                options: {
                    leftSidebar: 'Barre latérale gauche',
                    rightSidebar: 'Barre latérale droite'
                }
            },
            calendarLeftPlacement: {
                name: 'Emplacement en mode panneau unique',
                desc: 'Où le calendrier est affiché en mode panneau unique.',
                options: {
                    navigationPane: 'Panneau de navigation',
                    below: 'Sous les panneaux'
                }
            },
            calendarLocale: {
                name: 'Langue',
                desc: 'Contrôle le formatage des dates du calendrier, la numérotation des semaines et le premier jour de la semaine.',
                weekPathMismatchWarning:
                    'Le calendrier visible et les chemins des notes hebdomadaires utilisent des débuts de semaine ou une numérotation des semaines différents.',
                options: {
                    systemDefault: 'Par défaut'
                }
            },
            calendarWeekendDays: {
                name: 'Jours de week-end',
                desc: 'Afficher les jours de week-end avec une couleur de fond différente.',
                options: {
                    none: 'Aucun',
                    satSun: 'Samedi et dimanche',
                    friSat: 'Vendredi et samedi',
                    thuFri: 'Jeudi et vendredi'
                }
            },
            calendarMonthHeadingFormat: {
                name: 'Format du nom du mois',
                desc: 'Nom du mois complet (janvier) ou abrégé (janv.).',
                options: {
                    full: 'janvier (complet)',
                    short: 'janv. (court)'
                }
            },
            showInfoButtons: {
                name: "Afficher les boutons d'information",
                desc: "Afficher les boutons d'information dans la barre de recherche et l'en-tête du calendrier."
            },
            calendarWeeksToShow: {
                name: 'Semaines à afficher dans la barre latérale gauche',
                desc: 'Le calendrier dans la barre latérale droite affiche toujours le mois complet.',
                options: {
                    fullMonth: 'Mois complet',
                    oneWeek: '1 semaine',
                    weeksCount: '{count} semaines'
                }
            },
            calendarHighlightToday: {
                name: "Mettre en évidence la date d'aujourd'hui",
                desc: "Mettre en évidence la date d'aujourd'hui avec une couleur de fond et du texte en gras."
            },
            calendarShowFeatureImage: {
                name: "Afficher l'image mise en avant",
                desc: 'Afficher les images mises en avant des notes dans le calendrier.'
            },
            calendarShowTasks: {
                name: 'Afficher les tâches',
                desc: 'Afficher un indicateur sur les jours, semaines et mois avec des tâches inachevées.'
            },
            calendarShowWeekNumber: {
                name: 'Afficher le numéro de semaine',
                desc: 'Ajouter une colonne avec le numéro de semaine.'
            },
            calendarShowQuarter: {
                name: 'Afficher le trimestre',
                desc: "Ajouter une étiquette de trimestre dans l'en-tête du calendrier."
            },
            calendarShowYearCalendar: {
                name: 'Afficher le calendrier annuel',
                desc: 'Afficher la navigation annuelle et la grille des mois dans la barre latérale droite.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Confirmer avant de créer',
                desc: "Afficher une boîte de dialogue de confirmation lors de la création d'une nouvelle note quotidienne."
            },
            calendarIntegrationMode: {
                name: 'Source des notes quotidiennes',
                desc: 'Source pour les notes du calendrier.',
                options: {
                    dailyNotes: 'Notes quotidiennes (plugin principal)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'Le dossier et le format de date sont configurés dans le plugin Notes quotidiennes.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'Langue des notes périodiques',
                desc: 'Contrôle les noms de mois localisés, les noms de jours de la semaine, les numéros de semaine et les débuts de semaine dans les chemins de notes périodiques de Notebook Navigator.',
                options: {
                    calendar: 'Calendrier',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'Dossier racine',
                desc: 'Dossier de base pour les notes périodiques. Les modèles de date peuvent inclure des sous-dossiers. Change avec le profil de coffre sélectionné.',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'Emplacement du dossier de modèles',
                desc: 'Le sélecteur de fichiers de modèles affiche les notes de ce dossier.',
                placeholder: 'Templates',
                usage: 'Utilisé par les notes de calendrier et les notes de dossier. Configurez les modèles dans Calendrier > Intégration du calendrier et Dossiers et notes de dossier > Fichiers de notes de dossier.'
            },
            calendarCustomFilePattern: {
                name: 'Notes quotidiennes',
                desc: "Formater le chemin en utilisant le format de date Moment. Entourez les noms de sous-dossiers de crochets, par ex. [Work]/YYYY. Cliquez sur l'icône de modèle pour définir un modèle. Définir l'emplacement du dossier de modèles dans Opérations sur les fichiers > Modèles.",
                momentDescPrefix: 'Formater le chemin en utilisant le ',
                momentLinkText: 'format de date Moment',
                momentDescSuffix:
                    ". Entourez les noms de sous-dossiers de crochets, par ex. [Work]/YYYY. Cliquez sur l'icône de modèle pour définir un modèle. Définir l'emplacement du dossier de modèles dans Opérations sur les fichiers > Modèles.",
                templaterSupportInstalled: '✅ Le plugin Templater est installé avec la prise en charge complète des modèles.',
                templaterSupportMissing: '⚠️ Installez le plugin Templater pour la prise en charge complète des modèles.',
                placeholder: 'YYYY/YYYYMMDD',
                example: 'Syntaxe actuelle : {path}',
                parsingError: 'Le modèle doit pouvoir être formaté et ré-analysé comme une date complète (année, mois, jour).'
            },
            calendarCustomWeekPattern: {
                name: 'Notes hebdomadaires',
                parsingError:
                    'Le modèle doit pouvoir être formaté et ré-analysé comme une semaine complète (année de semaine, numéro de semaine).',
                weekPathMismatchWarning:
                    'Les chemins des notes hebdomadaires utilisent la langue des notes périodiques. Utilisez des langues correspondantes, ou utilisez "GGGG" avec "WW" pour des semaines basées sur le lundi.',
                mixedWeekTokensWarning:
                    'Ce modèle mélange des jetons de semaine basés sur le lundi ("W" ou "G") avec des jetons de semaine basés sur la langue ("w" ou "g"). Utilisez un seul ensemble de manière cohérente : "GGGG" avec "WW" pour des semaines basées sur le lundi, ou "gggg" avec "ww" si les notes hebdomadaires doivent suivre la langue sélectionnée.'
            },
            calendarCustomMonthPattern: {
                name: 'Notes mensuelles',
                parsingError: 'Le modèle doit pouvoir être formaté et ré-analysé comme un mois complet (année, mois).'
            },
            calendarCustomQuarterPattern: {
                name: 'Notes trimestrielles',
                parsingError: 'Le modèle doit pouvoir être formaté et ré-analysé comme un trimestre complet (année, trimestre).'
            },
            calendarCustomYearPattern: {
                name: 'Notes annuelles',
                parsingError: 'Le modèle doit pouvoir être formaté et ré-analysé comme une année complète (année).'
            },
            calendarTemplateFile: {
                current: 'Fichier modèle : {name}'
            },
            showTooltips: {
                name: 'Afficher les infobulles',
                desc: 'Affiche des infobulles avec des informations supplémentaires pour les notes et dossiers au survol.'
            },
            showTooltipPath: {
                name: 'Afficher le chemin dans les infobulles',
                desc: 'Affiche le chemin du dossier sous le nom des notes dans les infobulles.'
            },
            showTooltipWordCount: {
                name: 'Afficher le nombre de mots dans les infobulles',
                desc: 'Affiche le nombre de mots des notes dans les infobulles.'
            },
            resetPaneSeparator: {
                name: 'Réinitialiser la position du séparateur de panneaux',
                desc: 'Réinitialise le séparateur déplaçable entre le panneau de navigation et le panneau de liste à la position par défaut.',
                buttonText: 'Réinitialiser le séparateur',
                notice: 'Position du séparateur réinitialisée. Redémarrez Obsidian ou rouvrez Notebook Navigator pour appliquer.'
            },
            settingsTransfer: {
                name: 'Importer et exporter les paramètres',
                desc: 'Exporter ou importer les paramètres de Notebook Navigator au format JSON. L\u2019importation remplace tous les paramètres.',
                importButtonText: 'Importer',
                exportButtonText: 'Exporter',
                import: {
                    modalTitle: 'Importer les paramètres',
                    fileButtonName: 'Importer depuis un fichier',
                    fileButtonDesc: 'Charger un fichier JSON depuis le disque.',
                    fileButtonText: 'Importer depuis un fichier',
                    editorName: 'JSON',
                    editorDesc:
                        'Collez ou modifiez le JSON ci-dessous. Les paramètres non inclus sont réinitialisés aux valeurs par défaut.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'Importer',
                    confirmTitle: 'Importer les paramètres ?',
                    confirmMessage: 'L’importation remplace les paramètres actuels de Notebook Navigator.',
                    backupToggleName: 'Enregistrer les paramètres actuels à la racine du coffre avant l’importation',
                    backupToggleDesc: 'Crée un fichier JSON horodaté à la racine du coffre.',
                    successWithBackupNotice: 'Paramètres importés. Paramètres précédents enregistrés dans {path}.',
                    backupError: 'Impossible d’enregistrer les paramètres actuels : {message}',
                    successNotice: 'Paramètres importés.',
                    errorNotice: "Échec de l'importation des paramètres : {message}",
                    fileReadError: 'Impossible de lire le fichier : {message}'
                },
                export: {
                    modalTitle: 'Exporter les paramètres',
                    editorName: 'JSON',
                    editorDesc: 'Seuls les paramètres modifiés par rapport aux valeurs par défaut sont inclus.',
                    placeholder: '{}',
                    copyButtonText: 'Copier dans le presse-papiers',
                    downloadButtonText: 'Télécharger',
                    copyNotice: 'Paramètres copiés dans le presse-papiers.',
                    downloadNotice: 'Paramètres exportés.',
                    downloadError: 'Échec du téléchargement des paramètres : {message}'
                }
            },
            resetAllSettings: {
                name: 'Réinitialiser tous les paramètres',
                desc: 'Réinitialise tous les paramètres de Notebook Navigator aux valeurs par défaut.',
                buttonText: 'Réinitialiser tous les paramètres',
                confirmTitle: 'Réinitialiser tous les paramètres ?',
                confirmMessage:
                    'Cela réinitialisera tous les paramètres de Notebook Navigator aux valeurs par défaut. Cette action est irréversible.',
                confirmButtonText: 'Réinitialiser tous les paramètres',
                notice: 'Tous les paramètres réinitialisés. Redémarrez Obsidian ou rouvrez Notebook Navigator pour appliquer.',
                error: 'Échec de la réinitialisation des paramètres.'
            },
            multiSelectModifier: {
                name: 'Modificateur de sélection multiple',
                desc: 'Choisissez quelle touche modificatrice active la sélection multiple. Quand Option/Alt est sélectionné, Cmd/Ctrl clic ouvre les notes dans un nouvel onglet.',
                options: {
                    cmdCtrl: 'Cmd/Ctrl clic',
                    optionAlt: 'Option/Alt clic'
                }
            },
            enterToOpenFiles: {
                name: 'Appuyer sur Entrée pour ouvrir',
                desc: 'Ouvrir les fichiers uniquement en appuyant sur Entrée lors de la navigation au clavier dans la liste. Sur macOS, cela empêche Entrée de renommer les fichiers.'
            },
            shiftEnterOpenContext: {
                name: 'Shift+Entrée',
                desc: 'Choisir si Shift+Entrée ouvre ou renomme le fichier sélectionné.'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Entrée',
                desc: 'Choisir si Cmd+Entrée ouvre ou renomme le fichier sélectionné.'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Entrée',
                desc: 'Choisir si Ctrl+Entrée ouvre ou renomme le fichier sélectionné.'
            },
            mouseBackForwardAction: {
                name: 'Boutons précédent/suivant de la souris',
                desc: 'Action des boutons précédent et suivant de la souris sur ordinateur.',
                options: {
                    none: 'Utiliser la valeur système par défaut',
                    singlePaneSwitch: 'Changer de volet (volet unique)',
                    history: "Naviguer dans l'historique"
                }
            },
            excludedNotes: {
                name: 'Masquer les notes avec des règles de propriétés (profil du coffre)',
                desc: 'Liste de règles de métadonnées séparées par des virgules. Utilisez des entrées `key` ou `key=value` (ex. : status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'Masquer les fichiers (profil du coffre)',
                desc: 'Liste de motifs de noms de fichiers séparés par des virgules à masquer. Prend en charge les caractères génériques * et les chemins / (ex. : temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Profil du coffre',
                desc: "Les profils stockent la visibilité des types de fichiers, les fichiers cachés, les dossiers cachés, les étiquettes cachées, les règles de propriétés pour les notes cachées, les raccourcis et la bannière de navigation. Changez de profil depuis l'en-tête du panneau de navigation.",
                defaultName: 'Par défaut',
                addButton: 'Ajouter un profil',
                editProfilesButton: 'Modifier les profils',
                addProfileOption: 'Ajouter un profil...',
                applyButton: 'Appliquer',
                deleteButton: 'Supprimer le profil',
                addModalTitle: 'Ajouter un profil',
                editProfilesModalTitle: 'Modifier les profils',
                addModalPlaceholder: 'Nom du profil',
                deleteModalTitle: 'Supprimer {name}',
                deleteModalMessage:
                    'Supprimer {name} ? Les filtres de fichiers, dossiers, étiquettes et notes basés sur les propriétés enregistrés dans ce profil seront supprimés.',
                moveUp: 'Déplacer vers le haut',
                moveDown: 'Déplacer vers le bas',
                errors: {
                    emptyName: 'Entrez un nom de profil',
                    duplicateName: 'Le nom du profil existe déjà'
                }
            },
            vaultTitle: {
                name: 'Placement du titre du coffre',
                desc: 'Choisissez où le titre du coffre est affiché.',
                options: {
                    header: "Afficher dans l'en-tête",
                    navigation: 'Afficher dans le panneau de navigation'
                }
            },
            excludedFolders: {
                name: 'Masquer les dossiers (profil du coffre)',
                desc: 'Liste de dossiers à masquer séparés par des virgules. Modèles de nom : assets* (dossiers commençant par assets), *_temp (finissant par _temp). Modèles de chemin : /archive (archive racine uniquement), /res* (dossiers racine commençant par res), /*/temp (dossiers temp un niveau plus bas), /projects/* (tous les dossiers dans projects).',
                placeholder: 'templates, assets*, /archive, /res*'
            },
            descendantExcludedFolders: {
                name: 'Exclure des dossiers des notes de sous-dossiers (profil du coffre)',
                desc: 'Liste de dossiers séparés par des virgules à ignorer lors de la collecte des notes des sous-dossiers. Les dossiers restent visibles, et leur sélection affiche toujours leurs notes. Utilise les mêmes modèles que Masquer les dossiers.',
                placeholder: 'quotidien, ressources, /archive'
            },
            fileVisibility: {
                name: 'Afficher les types de fichiers (profil du coffre)',
                desc: "Filtrez quels types de fichiers sont affichés dans le navigateur. Les types de fichiers non pris en charge par Obsidian peuvent s'ouvrir dans des applications externes.",
                options: {
                    documents: 'Documents (.md, .canvas, .base)',
                    supported: 'Pris en charge (ouvre dans Obsidian)',
                    all: 'Tous (peut ouvrir en externe)'
                }
            },
            homepage: {
                name: 'Page d’accueil',
                desc: 'Choisissez ce que Notebook Navigator ouvre automatiquement au démarrage.',
                current: 'Actuel : {path}',
                chooseButton: 'Choisir un fichier',
                options: {
                    none: 'Aucun',
                    file: 'Fichier',
                    dailyNote: 'Note quotidienne',
                    weeklyNote: 'Note hebdomadaire',
                    monthlyNote: 'Note mensuelle',
                    quarterlyNote: 'Note trimestrielle',
                    yearlyNote: 'Note annuelle'
                },
                file: {
                    name: 'Page d’accueil : Fichier de démarrage',
                    empty: 'Aucun fichier sélectionné'
                },
                createMissing: {
                    name: 'Page d’accueil : Créer la note si absente',
                    desc: "Crée la note périodique au démarrage ou via la commande si elle n'existe pas."
                }
            },
            showFileDate: {
                name: 'Afficher la date',
                desc: 'Afficher la date sous les noms des notes.'
            },
            alphabeticalDateMode: {
                name: 'Lors du tri par nom',
                desc: 'Date affichée lorsque les notes sont triées alphabétiquement.',
                options: {
                    created: 'Date de création',
                    modified: 'Date de modification'
                }
            },
            showFileTags: {
                name: 'Afficher les tags de fichier',
                desc: 'Affiche les tags cliquables dans les éléments de fichier.'
            },
            showFileTagAncestors: {
                name: 'Afficher les chemins complets des tags',
                desc: "Afficher les chemins complets de la hiérarchie des tags. Activé : 'ai/openai', 'travail/projets/2024'. Désactivé : 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Colorer les tags de fichier',
                desc: 'Appliquer les couleurs de tags aux badges de tags sur les éléments de fichier.'
            },
            prioritizeColoredFileTags: {
                name: 'Afficher les tags colorés en premier',
                desc: 'Trie les tags colorés avant les autres tags dans les éléments de fichier.'
            },
            showFileTagsInCompactMode: {
                name: 'Afficher les tags de fichier en mode compact',
                desc: "Afficher les tags lorsque la date, l'aperçu et l'image sont masqués."
            },
            showFileProperties: {
                name: 'Afficher les propriétés de fichier',
                desc: 'Afficher les propriétés dans les éléments de fichier. Utilisez la fenêtre « Visibilité des clés de propriété » pour choisir les propriétés affichées.'
            },
            colorFileProperties: {
                name: 'Colorer les propriétés de fichier',
                desc: 'Appliquer les couleurs de propriété aux badges de propriété dans les éléments de fichier.'
            },
            prioritizeColoredFileProperties: {
                name: 'Afficher les propriétés colorées en premier',
                desc: 'Trier les propriétés colorées avant les autres propriétés dans les éléments de fichier.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Afficher les propriétés en mode compact',
                desc: 'Afficher les propriétés lorsque le mode compact est actif.'
            },
            textCountDisplay: {
                name: 'Type de compteur',
                desc: 'Choisissez les compteurs de note affichés dans les éléments de fichier.',
                options: {
                    none: 'Aucun',
                    words: 'Nombre de mots',
                    characters: 'Nombre de caractères',
                    both: 'Nombre de mots et de caractères'
                }
            },
            textCountPlacement: {
                name: 'Emplacement',
                desc: 'Choisissez où les compteurs de note apparaissent.',
                options: {
                    title: 'Dans le titre',
                    property: 'Comme propriété'
                }
            },
            characterCountSpaces: {
                name: 'Nombre de caractères',
                desc: 'Choisissez si les espaces sont inclus dans le nombre de caractères.',
                options: {
                    include: 'Espaces inclus',
                    exclude: 'Espaces exclus'
                }
            },
            wordCountTargetProperty: {
                name: 'Propriété cible',
                desc: 'Clé de propriété frontmatter contenant l’objectif de nombre de mots. Laissez vide pour masquer les objectifs.'
            },
            showWordCountPercentage: {
                name: 'Afficher le pourcentage cible',
                desc: 'Afficher uniquement le pourcentage de progression lorsqu’un objectif de nombre de mots est disponible.'
            },
            propertyFields: {
                name: 'Clés de propriétés (profil de coffre)',
                desc: 'Clés de propriétés de métadonnées, avec visibilité par clé pour la navigation et la liste de fichiers.',
                addButtonTooltip: 'Configurer les clés de propriété',
                noneConfigured: 'Aucune propriété configurée',
                singleConfigured: '1 propriété configurée : {properties}',
                multipleConfigured: '{count} propriétés configurées : {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'Afficher les propriétés sur des lignes séparées',
                desc: 'Afficher chaque propriété sur sa propre ligne.'
            },
            enablePropertyInternalLinks: {
                name: 'Lier les pastilles de propriété aux notes',
                desc: 'Cliquer sur une pastille de propriété pour ouvrir la note liée.'
            },
            enablePropertyExternalLinks: {
                name: 'Lier les pastilles de propriété aux URLs',
                desc: "Cliquer sur une pastille de propriété pour ouvrir l'URL liée."
            },
            dateFormat: {
                name: 'Format de date',
                desc: 'Format pour afficher les dates (utilise le format Moment).',
                placeholder: 'D MMMM YYYY',
                help: 'Formats courants :\nD MMMM YYYY = 25 mai 2022\nDD/MM/YYYY = 25/05/2022\nYYYY-MM-DD = 2022-05-25\n\nJetons :\nYYYY/YY = année\nMMMM/MMM/MM = mois\nDD/D = jour\ndddd/ddd = jour de la semaine',
                helpTooltip: 'Format avec Moment',
                momentLinkText: 'format Moment'
            },
            timeFormat: {
                name: "Format d'heure",
                desc: 'Format pour afficher les heures (utilise le format Moment).',
                placeholder: 'HH:mm',
                help: 'Formats courants :\nHH:mm = 14:30 (24 heures)\nh:mm a = 2:30 PM (12 heures)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nJetons :\nHH/H = 24 heures\nhh/h = 12 heures\nmm = minutes\nss = secondes\na = AM/PM',
                helpTooltip: 'Format avec Moment',
                momentLinkText: 'format Moment'
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
            stripHtmlInPreview: {
                name: 'Supprimer le HTML dans les aperçus',
                desc: "Supprimer les balises HTML du texte d'aperçu. Peut affecter les performances sur les longues notes."
            },
            stripLatexInPreview: {
                name: 'Supprimer le LaTeX dans les aperçus',
                desc: "Supprimer les expressions LaTeX en ligne et en bloc du texte d'aperçu."
            },
            previewProperties: {
                name: "Propriétés d'aperçu",
                desc: "Liste séparée par des virgules de propriétés frontmatter pour le texte d'aperçu. La première propriété avec du texte sera utilisée.",
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'Revenir au contenu de la note',
                desc: "Afficher le contenu de la note en aperçu lorsqu'aucune des propriétés spécifiées ne contient de texte."
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
                    '2': '2 lignes',
                    '3': '3 lignes'
                }
            },
            useFolderColor: {
                name: 'Utiliser la couleur du dossier',
                desc: "Colorer les titres de notes et les icônes de fichier avec la couleur du dossier parent lorsqu'aucune couleur de fichier personnalisée n'est définie. Priorité : couleur de fichier personnalisée > couleur du dossier > couleur par défaut."
            },
            showFeatureImage: {
                name: "Afficher l'image vedette",
                desc: 'Affiche une miniature de la première image trouvée dans la note.'
            },
            forceSquareFeatureImage: {
                name: "Forcer l'image vedette carrée",
                desc: 'Afficher les images vedettes sous forme de miniatures carrées.'
            },
            featureImageProperties: {
                name: "Propriétés d'image",
                desc: 'Liste de propriétés frontmatter séparées par des virgules à vérifier en premier. Se rabat sur la première image dans le contenu markdown.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'Exclure les notes avec propriétés',
                desc: "Liste de propriétés frontmatter séparées par des virgules. Les notes contenant l'une de ces propriétés ne stockent pas d'images principales.",
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: "Taille d'affichage de l'image à la une",
                desc: 'Taille maximale de rendu pour les images à la une dans les listes de notes.',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: "Taille en pixels de l'image à la une",
                desc: 'Résolution utilisée lors de la génération des vignettes stockées des images à la une. Augmentez cette valeur si les aperçus plus grands semblent flous.',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'Télécharger les images externes',
                desc: 'Télécharger les images distantes et les miniatures YouTube pour les images à la une.'
            },
            hideDrawingPreviewImages: {
                name: 'Masquer les images de prévisualisation exportées',
                desc: 'Masquer les fichiers PNG de prévisualisation de dessin exportés. Activez « Afficher les éléments masqués » pour les afficher.'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator affiche les fichiers PNG exportés par Excalidraw comme prévisualisations de dessin.',
                items: [
                    "Dans les **paramètres d'Excalidraw**, ouvrez **Embedding Excalidraw into your Notes and Exporting**, puis **Export Settings**, puis **Auto-export Settings**.",
                    'Activez **Auto-export PNG**. Activez éventuellement **Export both dark- and light-themed image**.',
                    'Notebook Navigator recherche **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** ou **Drawing.excalidraw.light.png**.',
                    "Tant que **Masquer les images de prévisualisation exportées** est activé, les fichiers PNG n'apparaissent que si **Afficher les éléments masqués** est également activé."
                ]
            },
            showRootFolder: {
                name: 'Afficher le dossier racine',
                desc: "Afficher le nom du dossier racine dans l'arborescence."
            },
            showFolderIcons: {
                name: 'Afficher les icônes de dossier',
                desc: 'Afficher les icônes à côté des dossiers dans le panneau de navigation.'
            },
            inheritFolderColors: {
                name: 'Hériter des couleurs de dossier',
                desc: 'Les sous-dossiers héritent de la couleur des dossiers parents.'
            },
            folderSortOrder: {
                name: 'Ordre de tri des dossiers',
                desc: 'Faites un clic droit sur un dossier pour définir un ordre de tri différent pour ses éléments enfants.',
                options: {
                    alphaAsc: 'A à Z',
                    alphaDesc: 'Z à A'
                }
            },
            showNoteCount: {
                name: 'Afficher le nombre de notes',
                desc: 'Afficher le nombre de notes à côté des dossiers, étiquettes et propriétés.'
            },
            showSectionIcons: {
                name: 'Afficher les icônes pour les raccourcis et les éléments récents',
                desc: 'Afficher les icônes à côté des éléments dans les sections Raccourcis et Récents.'
            },
            interfaceIcons: {
                name: "Icônes de l'interface",
                desc: "Modifier les icônes de barre d'outils, dossiers, étiquettes, propriétés, éléments épinglés, recherche et tri.",
                buttonText: 'Modifier les icônes'
            },
            showIconsColorOnly: {
                name: 'Appliquer la couleur uniquement aux icônes',
                desc: "Lorsqu'activé, les couleurs personnalisées sont appliquées uniquement aux icônes. Lorsque désactivé, les couleurs sont appliquées aux icônes et aux étiquettes de texte."
            },
            navRainbowMode: {
                name: 'Mode couleurs arc-en-ciel (profil du coffre)',
                desc: 'Appliquer les couleurs arc-en-ciel dans le volet de navigation.',
                options: {
                    none: 'Désactivé',
                    foreground: 'Couleur du texte',
                    background: 'Couleur de fond'
                }
            },
            navRainbowFirstColor: {
                name: 'Première couleur',
                desc: 'Première couleur du dégradé arc-en-ciel.'
            },
            navRainbowLastColor: {
                name: 'Dernière couleur',
                desc: 'Dernière couleur du dégradé arc-en-ciel.'
            },
            navRainbowTransitionStyle: {
                name: 'Style de transition',
                desc: 'Interpolation utilisée entre la première et la dernière couleur.',
                options: {
                    hue: 'Teinte',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'Appliquer aux raccourcis',
                desc: 'Appliquer les couleurs arc-en-ciel aux raccourcis.'
            },
            navRainbowApplyToRecent: {
                name: 'Appliquer aux éléments récents',
                desc: 'Appliquer les couleurs arc-en-ciel aux éléments récents.'
            },
            navRainbowApplyToFolders: {
                name: 'Appliquer aux dossiers',
                desc: 'Appliquer les couleurs arc-en-ciel aux dossiers.'
            },
            navRainbowFolderScope: {
                name: 'Portée des dossiers',
                desc: 'Sélectionner les niveaux de dossier qui démarrent les attributions de couleur.',
                options: {
                    root: 'Niveau racine',
                    child: 'Niveau enfant',
                    all: 'Tous les niveaux'
                }
            },
            navRainbowApplyToTags: {
                name: 'Appliquer aux tags',
                desc: 'Appliquer les couleurs arc-en-ciel aux tags.'
            },
            navRainbowTagScope: {
                name: 'Portée des tags',
                desc: 'Sélectionner les niveaux de tag qui démarrent les attributions de couleur.',
                options: {
                    root: 'Niveau racine',
                    child: 'Niveau enfant',
                    all: 'Tous les niveaux'
                }
            },
            navRainbowApplyToProperties: {
                name: 'Appliquer aux propriétés',
                desc: 'Appliquer les couleurs arc-en-ciel aux propriétés.'
            },
            navRainbowBalanceHueLuminance: {
                name: 'Luminosité uniforme entre les teintes', // (English: Consistent brightness across hues)
                desc: 'Interpole la luminosité entre les couleurs de début et de fin lors des transitions de teinte.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'Couleurs séparées pour les modes clair et sombre', // (English: Separate light and dark mode colors)
                desc: 'Utiliser des couleurs arc-en-ciel différentes pour le mode clair et le mode sombre.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'Copier la couleur du mode clair vers le mode sombre', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'Portée des propriétés',
                desc: 'Sélectionner les niveaux de propriété qui démarrent les attributions de couleur.',
                options: {
                    root: 'Niveau racine',
                    child: 'Niveau enfant',
                    all: 'Tous les niveaux'
                }
            },
            collapseBehavior: {
                name: 'Replier les éléments',
                desc: 'Choisissez ce que le bouton déplier/replier tout affecte.',
                options: {
                    all: 'Tout',
                    foldersOnly: 'Dossiers uniquement',
                    tagsOnly: 'Étiquettes uniquement',
                    propertiesOnly: 'Propriétés uniquement'
                }
            },
            smartCollapse: {
                name: "Garder l'élément sélectionné déplié",
                desc: "Lors du repliement, garde l'élément sélectionné et ses parents dépliés."
            },
            excludeVaultRootFromCollapse: {
                name: 'Ignorer la racine du coffre lors du repliement',
                desc: 'Lors du repliement de tous les éléments, garde le dossier racine du coffre dans son état actuel.'
            },
            navIndent: {
                name: "Indentation de l'arbre",
                desc: "Ajuster la largeur d'indentation pour les dossiers, étiquettes et propriétés imbriqués (pixels)."
            },
            navItemHeight: {
                name: 'Hauteur de ligne',
                desc: 'Ajuster la hauteur des dossiers, étiquettes et propriétés dans le panneau de navigation (pixels).'
            },
            navItemHeightScaleText: {
                name: 'Adapter le texte à la hauteur de ligne',
                desc: 'Réduit le texte de navigation lorsque la hauteur de ligne est diminuée.'
            },
            showIndentGuides: {
                name: "Afficher les guides d'indentation",
                desc: "Afficher les guides d'indentation pour les dossiers, étiquettes et propriétés imbriqués."
            },
            navCountLeaderStyle: {
                name: 'Afficher les points de conduite',
                desc: 'Afficher des points, des tirets ou une ligne entre les noms des éléments et le nombre de notes.',
                options: {
                    none: 'Aucun',
                    dots: 'Points (...)',
                    dashes: 'Tirets (---)',
                    line: 'Ligne'
                }
            },
            navRootSpacing: {
                name: 'Espacement des éléments racine',
                desc: 'Espacement entre les dossiers, étiquettes et propriétés de niveau racine (pixels).'
            },
            showTags: {
                name: 'Afficher les étiquettes',
                desc: 'Afficher la section des étiquettes dans le navigateur.'
            },
            showTagIcons: {
                name: "Afficher les icônes d'étiquettes",
                desc: 'Afficher les icônes à côté des étiquettes dans le panneau de navigation.'
            },
            inheritTagColors: {
                name: "Hériter les couleurs d'étiquettes",
                desc: 'Les étiquettes enfants héritent de la couleur des étiquettes parentes.'
            },
            tagSortOrder: {
                name: 'Ordre de tri des étiquettes',
                desc: 'Faites un clic droit sur une étiquette pour définir un ordre de tri différent pour ses éléments enfants.',
                options: {
                    alphaAsc: 'A à Z',
                    alphaDesc: 'Z à A',
                    frequency: 'Fréquence',
                    lowToHigh: 'faible vers élevée',
                    highToLow: 'élevée vers faible'
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
            scopeTagsToCurrentContext: {
                name: 'Filtrer les étiquettes par sélection',
                desc: 'Afficher uniquement les étiquettes présentes dans les notes du dossier ou de la propriété sélectionnée.'
            },
            keepEmptyTagsProperty: {
                name: 'Conserver la propriété tags après suppression de la dernière étiquette',
                desc: 'Conserve la propriété tags dans le frontmatter lorsque toutes les étiquettes sont supprimées. Si désactivé, la propriété tags est supprimée du frontmatter.'
            },
            showProperties: {
                name: 'Afficher les propriétés',
                desc: 'Afficher la section des propriétés dans le navigateur.',
                propertyKeysInfoPrefix: 'Configurer les propriétés dans ',
                propertyKeysInfoLinkText: 'Démarrage > Clés de propriétés',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'Afficher les icônes de propriétés',
                desc: 'Afficher les icônes à côté des propriétés dans le panneau de navigation.'
            },
            inheritPropertyColors: {
                name: 'Hériter des couleurs de propriété',
                desc: 'Les valeurs de propriété héritent de la couleur et du fond de leur clé de propriété.'
            },
            propertySortOrder: {
                name: 'Ordre de tri des propriétés',
                desc: 'Cliquez droit sur une propriété pour définir un ordre de tri différent pour ses valeurs.',
                options: {
                    alphaAsc: 'A à Z',
                    alphaDesc: 'Z à A',
                    frequency: 'Fréquence',
                    lowToHigh: 'croissant',
                    highToLow: 'décroissant'
                }
            },
            showAllPropertiesFolder: {
                name: 'Afficher le dossier des propriétés',
                desc: 'Afficher "Propriétés" comme un dossier repliable.'
            },
            scopePropertiesToCurrentContext: {
                name: 'Filtrer les propriétés par sélection',
                desc: "Afficher uniquement les propriétés présentes dans les notes du dossier ou de l'étiquette sélectionnée."
            },
            hiddenTags: {
                name: 'Masquer les étiquettes (profil du coffre)',
                desc: "Liste séparée par des virgules de motifs d'étiquettes. Motifs de nom : tag* (commence par), *tag (termine par). Motifs de chemin : archive (étiquette et descendants), archive/* (descendants uniquement), projets/*/brouillons (joker intermédiaire).",
                placeholder: 'archive*, *brouillon, projets/*/ancien'
            },
            hiddenFileTags: {
                name: 'Masquer les notes avec tags (profil du coffre)',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'Activer les notes de dossier',
                desc: 'Les dossiers ayant un fichier de note correspondant sont affichés comme des liens cliquables.'
            },
            folderNoteType: {
                name: 'Type de note de dossier par défaut',
                desc: 'Type de note de dossier créé depuis le menu contextuel.',
                options: {
                    ask: 'Demander lors de la création',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'Nom de la note de dossier',
                desc: 'Nom de la note de dossier. Laisser vide pour utiliser le même nom que le dossier.',
                placeholder: 'index'
            },
            folderNoteNamePattern: {
                name: 'Modèle de nom de note de dossier',
                desc: "Modèle de nom pour les notes de dossier sans extension. Utilisez {{folder}} pour insérer le nom du dossier. Lorsque défini, le nom de note de dossier ne s'applique pas."
            },
            folderNoteTemplate: {
                name: 'Modèle de note de dossier',
                desc: "Fichier modèle utilisé lors de la création de notes de dossier. Les modèles Markdown peuvent utiliser Templater. Les modèles Canvas et Base sont copiés comme contenu de fichier. Définir l'emplacement du dossier de modèles dans Opérations sur les fichiers > Modèles.",
                formatWarning: 'Le format du modèle doit correspondre au type de note de dossier sélectionné : .md, .canvas ou .base.'
            },
            enableFolderNoteLinks: {
                name: 'Les noms de dossier ouvrent les notes de dossier',
                desc: "Cliquer sur un nom de dossier ouvre sa note de dossier. Lorsque cette option est désactivée, les notes de dossier fournissent uniquement des métadonnées de dossier comme le nom, l'icône et la couleur."
            },
            hideFolderNoteInList: {
                name: 'Masquer les notes de dossier dans la liste',
                desc: 'Masquer les notes de dossier dans la liste des fichiers.'
            },
            pinCreatedFolderNote: {
                name: 'Épingler les notes de dossier créées',
                desc: 'Épingler les notes de dossier lors de leur création depuis le menu contextuel.'
            },
            folderNoteOpenLocation: {
                name: 'Ouvrir les notes de dossier dans',
                desc: "Choisir où les notes de dossier s'ouvrent lors du clic sur les liens de notes de dossier.",
                options: {
                    currentTab: 'Onglet actuel',
                    newTab: 'Nouvel onglet',
                    rightSidebar: 'Barre latérale droite'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: 'Barre latérale droite : Afficher la note de dossier la plus proche',
                desc: "Lorsqu'un dossier est sélectionné, la barre latérale droite affiche automatiquement la note de dossier ancêtre la plus proche."
            },
            confirmBeforeDelete: {
                name: 'Confirmer avant de supprimer',
                desc: 'Afficher une boîte de dialogue de confirmation lors de la suppression de notes ou de dossiers'
            },
            deleteAttachments: {
                name: 'Supprimer les pièces jointes lors de la suppression de fichiers',
                desc: "Supprimer automatiquement les pièces jointes liées et les aperçus de dessins générés s'ils ne sont pas utilisés ailleurs",
                options: {
                    ask: 'Demander à chaque fois',
                    always: 'Toujours',
                    never: 'Jamais'
                }
            },
            moveFileConflicts: {
                name: 'Conflits de déplacement',
                desc: "Lors du déplacement d'un fichier dans un dossier où un fichier du même nom existe déjà. Demander à chaque fois (renommer, écraser, annuler) ou toujours renommer.",
                options: {
                    ask: 'Demander à chaque fois',
                    rename: 'Toujours renommer'
                }
            },
            metadataCleanup: {
                name: 'Nettoyer les métadonnées',
                desc: "Supprime les métadonnées orphelines laissées lorsque des fichiers, dossiers, étiquettes ou propriétés sont supprimés, déplacés ou renommés en dehors d'Obsidian. Cela n'affecte que le fichier de configuration de Notebook Navigator.",
                buttonText: 'Nettoyer les métadonnées',
                error: 'Échec du nettoyage des paramètres',
                loading: 'Vérification des métadonnées...',
                statusClean: 'Aucune métadonnée à nettoyer',
                statusCounts:
                    'Éléments orphelins: {folders} dossiers, {tags} étiquettes, {properties} propriétés, {files} fichiers, {pinned} épingles, {separators} séparateurs'
            },
            rebuildCache: {
                name: 'Reconstruire le cache',
                desc: 'Utilisez ceci si des étiquettes manquent, les aperçus sont incorrects ou des images manquent. Cela peut arriver après des conflits de synchronisation ou des fermetures inattendues.',
                buttonText: 'Reconstruire le cache',
                error: 'Échec de la reconstruction du cache',
                indexingTitle: 'Indexation du coffre...',
                progress: 'Mise à jour du cache de Notebook Navigator.'
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
                    "Les packs d'icônes téléchargés synchronisent l'état d'installation entre les appareils. Les packs d'icônes restent dans la base de données locale sur chaque appareil ; la synchronisation ne fait que suivre s'ils doivent être téléchargés ou supprimés. Les packs d'icônes sont téléchargés depuis le dépôt Notebook Navigator (https://github.com/johansan/notebook-navigator/tree/main/icon-assets)."
            },
            useFrontmatterDates: {
                name: 'Utiliser les métadonnées du frontmatter',
                desc: 'Utiliser le frontmatter pour le nom de note, horodatages, icônes et couleurs'
            },
            frontmatterNameField: {
                name: 'Champs de nom',
                desc: 'Liste de champs frontmatter séparés par des virgules. La première valeur non vide est utilisée. Retombe sur le nom du fichier.',
                placeholder: 'title, name'
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
            frontmatterBackgroundField: {
                name: "Champ d'arrière-plan",
                desc: "Champ frontmatter pour les couleurs d'arrière-plan. Laisser vide pour utiliser les couleurs d'arrière-plan enregistrées dans les paramètres.",
                placeholder: 'background'
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
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: "Champ d'horodatage de modification",
                desc: "Nom du champ frontmatter pour l'horodatage de modification. Laisser vide pour utiliser uniquement la date du système.",
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: "Format d'horodatage",
                desc: 'Format utilisé pour analyser les horodatages dans le frontmatter. Laisser vide pour utiliser le parsing ISO 8601.',
                helpTooltip: 'Format avec Moment',
                momentLinkText: 'format Moment',
                help: 'Formats courants :\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'Soutenir le développement',
                desc: 'Si vous aimez utiliser le Navigateur de Carnets, veuillez envisager de soutenir son développement continu.',
                buttonText: '❤️ Sponsoriser',
                coffeeButton: '☕️ Offrez-moi un café'
            },
            updateCheckOnStart: {
                name: 'Vérifier les nouvelles versions au démarrage',
                desc: "Vérifie les nouvelles versions du plugin au démarrage et affiche une notification lorsqu'une mise à jour est disponible. Les vérifications ont lieu au maximum une fois par jour.",
                status: 'Nouvelle version disponible : {version}'
            },
            debugLogging: {
                name: 'Journal de débogage du démarrage',
                desc: 'Écrit les diagnostics de démarrage dans un fichier Markdown horodaté à la racine du coffre, puis s’arrête une fois le démarrage stabilisé. Le fichier peut être synchronisé et contenir des chemins de fichiers.'
            },
            whatsNew: {
                name: 'Nouveautés dans Notebook Navigator {version}',
                desc: 'Voir les mises à jour et améliorations récentes',
                buttonText: 'Voir les mises à jour récentes'
            },
            masteringVideo: {
                name: 'Maîtriser Notebook Navigator (vidéo)',
                desc: 'Cette vidéo couvre tout ce dont vous avez besoin pour être productif avec Notebook Navigator, y compris les raccourcis clavier, la recherche, les étiquettes et la personnalisation avancée.'
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
        openBannerImage: 'Ouvrir l’image de bannière de la version',
        supportMessage: 'Si vous trouvez Notebook Navigator utile, veuillez envisager de soutenir son développement.',
        supportButton: 'Offrir un café',
        thanksButton: 'Merci !'
    }
};
