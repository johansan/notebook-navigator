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
export const STRINGS_ES = {
    // Common UI elements
    common: {
        cancel: 'Cancelar', // Button text for canceling dialogs and operations (English: Cancel)
        delete: 'Eliminar', // Button text for delete operations in dialogs (English: Delete)
        clear: 'Limpiar', // Button text for clearing values (English: Clear)
        remove: 'Eliminar', // Button text for remove operations in dialogs (English: Remove)
        submit: 'Enviar', // Button text for submitting forms and dialogs (English: Submit)
        noSelection: 'Sin selección', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Sin etiquetas', // Label for notes without any tags (English: Untagged)
        untitled: 'Sin título', // Default name for notes without a title (English: Untitled)
        featureImageAlt: 'Imagen destacada', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Error desconocido', // Generic fallback when an error has no message (English: Unknown error)
        updateBannerTitle: 'Actualización de Notebook Navigator disponible',
        updateBannerInstruction: 'Actualiza en Ajustes -> Complementos de la comunidad',
        updateIndicatorLabel: 'Nueva versión disponible'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Selecciona una carpeta o etiqueta para ver las notas', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Sin notas', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Fijadas', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Notas', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Archivos', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (oculto)' // Accessibility label applied to list items that are normally hidden
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Sin etiquetas', // Label for the special item showing notes without tags (English: Untagged)
        hiddenTags: 'Etiquetas ocultas', // Label for the hidden tags virtual folder (English: Hidden tags)
        tags: 'Etiquetas' // Label for the tags virtual folder (English: Tags)
    },

    navigationPane: {
        shortcutsHeader: 'Accesos directos',
        recentNotesHeader: 'Notas recientes',
        recentFilesHeader: 'Archivos recientes',
        reorderRootFoldersTitle: 'Reordenar navegación',
        reorderRootFoldersHint: 'Usa flechas o arrastra para reordenar',
        vaultRootLabel: 'Bóveda',
        resetRootToAlpha: 'Restablecer orden alfabético',
        resetRootToFrequency: 'Restablecer al orden por frecuencia',
        pinShortcuts: 'Fijar accesos directos',
        pinShortcutsAndRecentNotes: 'Fijar accesos directos y notas recientes',
        pinShortcutsAndRecentFiles: 'Fijar accesos directos y archivos recientes',
        unpinShortcuts: 'Desfijar accesos directos',
        unpinShortcutsAndRecentNotes: 'Desfijar accesos directos y notas recientes',
        unpinShortcutsAndRecentFiles: 'Desfijar accesos directos y archivos recientes',
        profileMenuLabel: 'Perfil',
        profileMenuAria: 'Cambiar perfil de bóveda'
    },

    shortcuts: {
        folderExists: 'La carpeta ya está en los atajos',
        noteExists: 'La nota ya está en los atajos',
        tagExists: 'La etiqueta ya está en los atajos',
        searchExists: 'El atajo de búsqueda ya existe',
        emptySearchQuery: 'Ingresa una consulta de búsqueda antes de guardarla',
        emptySearchName: 'Ingresa un nombre antes de guardar la búsqueda',
        add: 'Agregar a accesos directos',
        addNotesCount: 'Agregar {count} notas a accesos directos',
        addFilesCount: 'Agregar {count} archivos a accesos directos',
        rename: 'Renombrar acceso directo',
        remove: 'Quitar de accesos directos',
        removeAll: 'Eliminar todos los accesos directos',
        removeAllConfirm: '¿Eliminar todos los accesos directos?',
        folderNotesPinned: 'Fijadas {count} notas de carpeta'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Contraer elementos', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'Expandir todos los elementos', // Tooltip for button that expands all items (English: Expand all items)
        scrollToTop: 'Desplazarse arriba',
        newFolder: 'Nueva carpeta', // Tooltip for create new folder button (English: New folder)
        newNote: 'Nueva nota', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Volver a navegación', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeSortOrder: 'Cambiar orden de clasificación', // Tooltip for the sort order toggle button (English: Change sort order)
        defaultSort: 'Predeterminado', // Label for default sorting mode (English: Default)
        customSort: 'Personalizado', // Label for custom sorting mode (English: Custom)
        showFolders: 'Mostrar navegación', // Tooltip for button to show the navigation pane (English: Show navigation)
        hideFolders: 'Ocultar navegación', // Tooltip for button to hide the navigation pane (English: Hide navigation)
        reorderRootFolders: 'Reordenar navegación',
        finishRootFolderReorder: 'Listo',
        toggleDescendantNotes: 'Mostrar notas de subcarpetas / descendientes', // Tooltip for button to toggle showing notes from descendants (English: Show notes from subfolders / descendants)
        autoExpandFoldersTags: 'Expandir carpetas y etiquetas automáticamente', // Tooltip for button to toggle auto-expanding folders and tags when selected (English: Auto-expand folders and tags)
        showExcludedItems: 'Mostrar carpetas, etiquetas y notas ocultas', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Ocultar carpetas, etiquetas y notas ocultas', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Mostrar paneles dobles', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Mostrar panel único', // Tooltip for button to show single-pane layout (English: Show single pane)
        changeAppearance: 'Cambiar apariencia', // Tooltip for button to change folder appearance settings (English: Change appearance)
        search: 'Buscar' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Buscar...', // Placeholder text for search input (English: Search...)
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Borrar búsqueda', // Tooltip for clear search button (English: Clear search)
        saveSearchShortcut: 'Guardar búsqueda en accesos directos',
        removeSearchShortcut: 'Eliminar búsqueda de accesos directos',
        shortcutModalTitle: 'Guardar búsqueda',
        shortcutNamePlaceholder: 'Introduce el nombre'
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'Abrir en nueva pestaña',
            openToRight: 'Abrir a la derecha',
            openInNewWindow: 'Abrir en nueva ventana',
            openMultipleInNewTabs: 'Abrir {count} notas en nuevas pestañas',
            openMultipleToRight: 'Abrir {count} notas a la derecha',
            openMultipleInNewWindows: 'Abrir {count} notas en nuevas ventanas',
            pinNote: 'Fijar nota',
            unpinNote: 'Desfijar nota',
            pinMultipleNotes: 'Fijar {count} notas',
            unpinMultipleNotes: 'Desfijar {count} notas',
            duplicateNote: 'Duplicar nota',
            duplicateMultipleNotes: 'Duplicar {count} notas',
            openVersionHistory: 'Abrir historial de versiones',
            revealInFolder: 'Mostrar en carpeta',
            revealInFinder: 'Mostrar en Finder',
            showInExplorer: 'Mostrar en el explorador del sistema',
            copyDeepLink: 'Copiar URL de Obsidian',
            copyPath: 'Copiar ruta del sistema de archivos',
            copyRelativePath: 'Copiar ruta del vault',
            renameNote: 'Renombrar nota',
            deleteNote: 'Eliminar nota',
            deleteMultipleNotes: 'Eliminar {count} notas',
            moveNoteToFolder: 'Mover nota a...',
            moveFileToFolder: 'Mover archivo a...',
            moveMultipleNotesToFolder: 'Mover {count} notas a...',
            moveMultipleFilesToFolder: 'Mover {count} archivos a...',
            addTag: 'Añadir etiqueta',
            removeTag: 'Eliminar etiqueta',
            removeAllTags: 'Eliminar todas las etiquetas',
            changeIcon: 'Cambiar icono',
            changeColor: 'Cambiar color',
            // File-specific context menu items (non-markdown files)
            openMultipleFilesInNewTabs: 'Abrir {count} archivos en nuevas pestañas',
            openMultipleFilesToRight: 'Abrir {count} archivos a la derecha',
            openMultipleFilesInNewWindows: 'Abrir {count} archivos en nuevas ventanas',
            pinFile: 'Fijar archivo',
            unpinFile: 'Desfijar archivo',
            pinMultipleFiles: 'Fijar {count} archivos',
            unpinMultipleFiles: 'Desfijar {count} archivos',
            duplicateFile: 'Duplicar archivo',
            duplicateMultipleFiles: 'Duplicar {count} archivos',
            renameFile: 'Renombrar archivo',
            deleteFile: 'Eliminar archivo',
            deleteMultipleFiles: 'Eliminar {count} archivos'
        },
        folder: {
            newNote: 'Nueva nota',
            newNoteFromTemplate: 'Nueva nota desde plantilla',
            newFolder: 'Nueva carpeta',
            newCanvas: 'Nuevo lienzo',
            newBase: 'Nueva base de datos',
            newDrawing: 'Nuevo dibujo',
            newExcalidrawDrawing: 'Nuevo dibujo de Excalidraw',
            newTldrawDrawing: 'Nuevo dibujo de Tldraw',
            duplicateFolder: 'Duplicar carpeta',
            searchInFolder: 'Buscar en carpeta',
            copyPath: 'Copiar ruta del sistema de archivos',
            copyRelativePath: 'Copiar ruta del vault',
            createFolderNote: 'Crear nota de carpeta',
            detachFolderNote: 'Desvincular nota de carpeta',
            deleteFolderNote: 'Eliminar nota de carpeta',
            changeIcon: 'Cambiar icono',
            changeColor: 'Cambiar color',
            changeBackground: 'Cambiar fondo',
            excludeFolder: 'Ocultar carpeta',
            unhideFolder: 'Mostrar carpeta',
            moveFolder: 'Mover carpeta a...',
            renameFolder: 'Renombrar carpeta',
            deleteFolder: 'Eliminar carpeta'
        },
        tag: {
            changeIcon: 'Cambiar icono',
            changeColor: 'Cambiar color',
            changeBackground: 'Cambiar fondo',
            showTag: 'Mostrar etiqueta',
            hideTag: 'Ocultar etiqueta'
        },
        navigation: {
            addSeparator: 'Agregar separador',
            removeSeparator: 'Eliminar separador'
        },
        style: {
            title: 'Estilo',
            copy: 'Copiar estilo',
            paste: 'Pegar estilo',
            removeIcon: 'Quitar icono',
            removeColor: 'Quitar color',
            removeBackground: 'Quitar fondo',
            clear: 'Limpiar estilo'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        standardPreset: 'Estándar',
        compactPreset: 'Compacto',
        defaultSuffix: '(predeterminado)',
        titleRows: 'Filas de título',
        previewRows: 'Filas de vista previa',
        groupBy: 'Agrupar por',
        defaultOption: (rows: number) => `Predeterminado (${rows})`,
        defaultTitleOption: (rows: number) => `Filas de título predeterminadas (${rows})`,
        defaultPreviewOption: (rows: number) => `Filas de vista previa predeterminadas (${rows})`,
        defaultGroupOption: (groupLabel: string) => `Agrupación predeterminada (${groupLabel})`,
        titleRowOption: (rows: number) => `${rows} fila${rows === 1 ? '' : 's'} de título`,
        previewRowOption: (rows: number) => `${rows} fila${rows === 1 ? '' : 's'} de vista previa`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'Buscar iconos...',
            recentlyUsedHeader: 'Usados recientemente',
            emptyStateSearch: 'Empieza a escribir para buscar iconos',
            emptyStateNoResults: 'No se encontraron iconos',
            showingResultsInfo: 'Mostrando 50 de {count} resultados. Escribe más para filtrar.',
            emojiInstructions: 'Escribe o pega cualquier emoji para usarlo como icono',
            removeIcon: 'Quitar icono',
            allTabLabel: 'Todos'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Añadir regla'
        },
        interfaceIcons: {
            title: 'Iconos de interfaz',
            items: {
                'nav-shortcuts': 'Atajos',
                'nav-recent-files': 'Archivos recientes',
                'nav-expand-all': 'Expandir todo',
                'nav-collapse-all': 'Contraer todo',
                'nav-tree-expand': 'Flecha de árbol: expandir',
                'nav-tree-collapse': 'Flecha de árbol: contraer',
                'nav-hidden-items': 'Elementos ocultos',
                'nav-root-reorder': 'Reordenar carpetas raíz',
                'nav-new-folder': 'Nueva carpeta',
                'nav-show-single-pane': 'Mostrar panel único',
                'nav-show-dual-pane': 'Mostrar paneles dobles',
                'nav-profile-chevron': 'Flecha del menú de perfil',
                'list-search': 'Buscar',
                'list-descendants': 'Notas de subcarpetas',
                'list-sort-ascending': 'Orden: ascendente',
                'list-sort-descending': 'Orden: descendente',
                'list-appearance': 'Cambiar apariencia',
                'list-new-note': 'Nueva nota',
                'nav-folder-open': 'Carpeta abierta',
                'nav-folder-closed': 'Carpeta cerrada',
                'nav-tag': 'Etiqueta',
                'list-pinned': 'Elementos fijados'
            }
        },
        colorPicker: {
            currentColor: 'Actual',
            newColor: 'Nuevo',
            presetColors: 'Colores predefinidos',
            userColors: 'Colores de usuario',
            paletteDefault: 'Predeterminado',
            paletteCustom: 'Personalizado',
            copyColors: 'Copiar color',
            colorsCopied: 'Color copiado al portapapeles',
            copyClipboardError: 'No se pudo escribir en el portapapeles',
            pasteColors: 'Pegar color',
            pasteClipboardError: 'No se pudo leer el portapapeles',
            pasteInvalidJson: 'El portapapeles no contiene texto válido',
            pasteInvalidFormat: 'Se esperaba un valor de color hex',
            colorsPasted: 'Color pegado correctamente',
            resetUserColors: 'Borrar colores personalizados',
            clearCustomColorsConfirm: '¿Eliminar todos los colores personalizados?',
            userColorSlot: 'Color {slot}',
            recentColors: 'Colores recientes',
            clearRecentColors: 'Limpiar colores recientes',
            removeRecentColor: 'Eliminar color',
            removeColor: 'Quitar color',
            apply: 'Aplicar',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'Rojo',
                orange: 'Naranja',
                amber: 'Ámbar',
                yellow: 'Amarillo',
                lime: 'Lima',
                green: 'Verde',
                emerald: 'Esmeralda',
                teal: 'Verde azulado',
                cyan: 'Cian',
                sky: 'Cielo',
                blue: 'Azul',
                indigo: 'Índigo',
                violet: 'Violeta',
                purple: 'Púrpura',
                fuchsia: 'Fucsia',
                pink: 'Rosa',
                rose: 'Rosa claro',
                gray: 'Gris',
                slate: 'Pizarra',
                stone: 'Piedra'
            }
        },
        selectVaultProfile: {
            title: 'Cambiar perfil de bóveda',
            currentBadge: 'Activo',
            emptyState: 'No hay perfiles de bóveda disponibles.'
        },
        tagOperation: {
            renameTitle: 'Renombrar etiqueta',
            deleteTitle: 'Eliminar etiqueta',
            newTagPrompt: 'Introduce el nuevo nombre de la etiqueta:',
            newTagPlaceholder: 'nuevo-nombre',
            renameWarning: 'Esto renombrará la etiqueta en todas las notas afectadas.',
            deleteWarning: 'Esto eliminará la etiqueta de todas las notas afectadas.',
            modificationWarning: 'Modificación de etiqueta',
            affectedFiles: '{count} archivo(s) afectado(s)',
            andMore: 'y {count} más...',
            confirmRename: 'Renombrar etiqueta',
            renameUnchanged: '{tag} sin cambios',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            invalidTagName: 'Introduce un nombre de etiqueta válido.',
            descendantRenameError: 'No se puede mover una etiqueta dentro de sí misma o un descendiente.',
            confirmDelete: 'Eliminar etiqueta',
            file: 'archivo',
            files: 'archivos'
        },
        fileSystem: {
            newFolderTitle: 'Nueva carpeta',
            renameFolderTitle: 'Renombrar carpeta',
            renameFileTitle: 'Renombrar archivo',
            deleteFolderTitle: "¿Eliminar '{name}'?",
            deleteFileTitle: "¿Eliminar '{name}'?",
            folderNamePrompt: 'Introduce el nombre de la carpeta:',
            hideInOtherVaultProfiles: 'Ocultar en otros perfiles de bóveda',
            renamePrompt: 'Introduce el nuevo nombre:',
            renameVaultTitle: 'Cambiar nombre de visualización del vault',
            renameVaultPrompt: 'Introduce un nombre de visualización personalizado (deja vacío para usar el predeterminado):',
            deleteFolderConfirm: '¿Estás seguro de que quieres eliminar esta carpeta y todo su contenido?',
            deleteFileConfirm: '¿Estás seguro de que quieres eliminar este archivo?',
            removeAllTagsTitle: 'Eliminar todas las etiquetas',
            removeAllTagsFromNote: '¿Estás seguro de que quieres eliminar todas las etiquetas de esta nota?',
            removeAllTagsFromNotes: '¿Estás seguro de que quieres eliminar todas las etiquetas de {count} notas?'
        },
        folderNoteType: {
            title: 'Selecciona el tipo de nota de carpeta',
            folderLabel: 'Carpeta: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `Mover ${name} a carpeta...`,
            multipleFilesLabel: (count: number) => `${count} archivos`,
            navigatePlaceholder: 'Navegar a carpeta...',
            instructions: {
                navigate: 'para navegar',
                move: 'para mover',
                select: 'para seleccionar',
                dismiss: 'para cancelar'
            }
        },
        homepage: {
            placeholder: 'Buscar archivos...',
            instructions: {
                navigate: 'para navegar',
                select: 'para definir página de inicio',
                dismiss: 'para cancelar'
            }
        },
        navigationBanner: {
            placeholder: 'Buscar imágenes...',
            instructions: {
                navigate: 'para navegar',
                select: 'para establecer banner',
                dismiss: 'para cancelar'
            }
        },
        tagSuggest: {
            placeholder: 'Buscar etiquetas...',
            navigatePlaceholder: 'Navegar a etiqueta...',
            addPlaceholder: 'Buscar etiqueta para añadir...',
            removePlaceholder: 'Seleccionar etiqueta para eliminar...',
            createNewTag: 'Crear nueva etiqueta: #{tag}',
            instructions: {
                navigate: 'para navegar',
                select: 'para seleccionar',
                dismiss: 'para cancelar',
                add: 'para añadir etiqueta',
                remove: 'para eliminar etiqueta'
            }
        },
        welcome: {
            title: 'Bienvenido a {pluginName}',
            introText:
                '¡Hola! Antes de comenzar, te recomiendo que veas los primeros cinco minutos del video a continuación para entender cómo funcionan los paneles y el interruptor "Mostrar notas de subcarpetas".',
            continueText:
                'Si tienes cinco minutos más, continúa viendo el video para entender los modos de visualización compacta y cómo configurar correctamente los accesos directos y las teclas de acceso rápido importantes.',
            thanksText: '¡Muchas gracias por descargar y disfruta!',
            videoAlt: 'Instalando y dominando Notebook Navigator',
            openVideoButton: 'Reproducir video',
            closeButton: 'Lo veré más tarde'
        }
    },

    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Error al crear la carpeta: {error}',
            createFile: 'Error al crear el archivo: {error}',
            renameFolder: 'Error al renombrar la carpeta: {error}',
            renameFolderNoteConflict: 'No se puede renombrar: "{name}" ya existe en esta carpeta',
            renameFile: 'Error al renombrar el archivo: {error}',
            deleteFolder: 'Error al eliminar la carpeta: {error}',
            deleteFile: 'Error al eliminar el archivo: {error}',
            duplicateNote: 'Error al duplicar la nota: {error}',
            createCanvas: 'Error al crear el lienzo: {error}',
            createDatabase: 'Error al crear la base de datos: {error}',
            duplicateFolder: 'Error al duplicar la carpeta: {error}',
            openVersionHistory: 'Error al abrir el historial de versiones: {error}',
            versionHistoryNotFound: 'Comando de historial de versiones no encontrado. Asegúrate de que Obsidian Sync esté habilitado.',
            revealInExplorer: 'Error al mostrar el archivo en el explorador del sistema: {error}',
            folderNoteAlreadyExists: 'La nota de carpeta ya existe',
            folderAlreadyExists: 'La carpeta "{name}" ya existe',
            folderNotesDisabled: 'Habilite las notas de carpeta en la configuración para convertir archivos',
            folderNoteAlreadyLinked: 'Este archivo ya funciona como una nota de carpeta',
            folderNoteNotFound: 'No hay nota de carpeta en la carpeta seleccionada',
            folderNoteUnsupportedExtension: 'Extensión de archivo no compatible: {extension}',
            folderNoteMoveFailed: 'No se pudo mover el archivo durante la conversión: {error}',
            folderNoteRenameConflict: 'Ya existe un archivo llamado "{name}" en la carpeta',
            folderNoteConversionFailed: 'No se pudo convertir el archivo en nota de carpeta',
            folderNoteConversionFailedWithReason: 'No se pudo convertir el archivo en nota de carpeta: {error}',
            folderNoteOpenFailed: 'Archivo convertido pero no se pudo abrir la nota de carpeta: {error}',
            failedToDeleteFile: 'Error al eliminar {name}: {error}',
            failedToDeleteMultipleFiles: 'Error al eliminar {count} archivos',
            versionHistoryNotAvailable: 'Servicio de historial de versiones no disponible',
            drawingAlreadyExists: 'Ya existe un dibujo con este nombre',
            failedToCreateDrawing: 'Error al crear el dibujo',
            noFolderSelected: 'No hay ninguna carpeta seleccionada en Notebook Navigator',
            noFileSelected: 'No hay archivo seleccionado'
        },
        warnings: {
            linkBreakingNameCharacters: 'Este nombre incluye caracteres que rompen los enlaces de Obsidian: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'Los nombres no pueden comenzar con un punto ni incluir : o /.',
            forbiddenNameCharactersWindows: 'Los caracteres reservados de Windows no están permitidos: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'Carpeta oculta: {name}',
            showFolder: 'Carpeta mostrada: {name}'
        },
        notifications: {
            deletedMultipleFiles: '{count} archivos eliminados',
            movedMultipleFiles: '{count} archivos movidos a {folder}',
            folderNoteConversionSuccess: 'Archivo convertido en nota de carpeta en "{name}"',
            folderMoved: 'Carpeta "{name}" movida',
            deepLinkCopied: 'URL de Obsidian copiada al portapapeles',
            pathCopied: 'Ruta copiada al portapapeles',
            relativePathCopied: 'Ruta relativa copiada al portapapeles',
            tagAddedToNote: 'Etiqueta añadida a 1 nota',
            tagAddedToNotes: 'Etiqueta añadida a {count} notas',
            tagRemovedFromNote: 'Etiqueta eliminada de 1 nota',
            tagRemovedFromNotes: 'Etiqueta eliminada de {count} notas',
            tagsClearedFromNote: 'Todas las etiquetas eliminadas de 1 nota',
            tagsClearedFromNotes: 'Todas las etiquetas eliminadas de {count} notas',
            noTagsToRemove: 'No hay etiquetas para eliminar',
            noFilesSelected: 'No hay archivos seleccionados',
            tagOperationsNotAvailable: 'Operaciones de etiquetas no disponibles',
            tagsRequireMarkdown: 'Las etiquetas solo son compatibles con notas Markdown',
            iconPackDownloaded: '{provider} descargado',
            iconPackUpdated: '{provider} actualizado ({version})',
            iconPackRemoved: '{provider} eliminado',
            iconPackLoadFailed: 'No se pudo cargar {provider}',
            hiddenFileReveal: 'El archivo está oculto. Activa "Mostrar elementos ocultos" para mostrarlo'
        },
        confirmations: {
            deleteMultipleFiles: '¿Está seguro de que desea eliminar {count} archivos?',
            deleteConfirmation: 'Esta acción no se puede deshacer.'
        },
        defaultNames: {
            untitled: 'Sin título',
            untitledNumber: 'Sin título {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'No se puede mover una carpeta dentro de sí misma o una subcarpeta.',
            itemAlreadyExists: 'Ya existe un elemento llamado "{name}" en esta ubicación.',
            failedToMove: 'Error al mover: {error}',
            failedToAddTag: 'Error al agregar la etiqueta "{tag}"',
            failedToClearTags: 'Error al eliminar las etiquetas',
            failedToMoveFolder: 'Error al mover la carpeta "{name}"',
            failedToImportFiles: 'Failed to import: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} archivos ya existen en el destino',
            addedTag: 'Etiqueta "{tag}" agregada a {count} archivos',
            filesAlreadyHaveTag: '{count} archivos ya tienen esta etiqueta o una más específica',
            clearedTags: 'Se eliminaron todas las etiquetas de {count} archivos',
            noTagsToClear: 'No hay etiquetas para eliminar',
            fileImported: 'Imported 1 file',
            filesImported: 'Imported {count} files'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'Hoy',
        yesterday: 'Ayer',
        previous7Days: 'Últimos 7 días',
        previous30Days: 'Últimos 30 días'
    },

    // Weekdays
    weekdays: {
        sunday: 'Domingo',
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miércoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'Sábado'
    },

    // Plugin commands
    commands: {
        open: 'Abrir', // Command palette: Opens the Notebook Navigator view (English: Open)
        openHomepage: 'Abrir página de inicio', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        revealFile: 'Revelar archivo', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Buscar', // Command palette: Toggle search in the file list (English: Search)
        toggleDualPane: 'Alternar diseño de doble panel', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        selectVaultProfile: 'Cambiar perfil de bóveda', // Command palette: Opens a modal to choose a different vault profile (English: Switch vault profile)
        selectVaultProfile1: 'Cambiar al perfil de bóveda 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Cambiar al perfil de bóveda 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Cambiar al perfil de bóveda 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Eliminar archivos', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Crear nueva nota', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Nueva nota desde plantilla', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Mover archivos', // Command palette: Move selected files to another folder (English: Move files)
        selectNextFile: 'Seleccionar siguiente archivo', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Seleccionar archivo anterior', // Command palette: Selects the previous file in the current view (English: Select previous file)
        convertToFolderNote: 'Convertir en nota de carpeta', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Establecer como nota de carpeta', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Desvincular nota de carpeta', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Fijar todas las notas de carpeta', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Navegar a carpeta', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Navegar a etiqueta', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        addShortcut: 'Agregar a accesos directos', // Command palette: Adds the current file, folder, or tag to shortcuts (English: Add to shortcuts)
        openShortcut: 'Abrir acceso directo {number}',
        toggleDescendants: 'Alternar descendientes', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Alternar carpetas, etiquetas y notas ocultas', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Alternar orden de etiquetas', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        collapseExpand: 'Contraer / expandir todos los elementos', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        addTag: 'Añadir etiqueta a archivos seleccionados', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        removeTag: 'Eliminar etiqueta de archivos seleccionados', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Eliminar todas las etiquetas de archivos seleccionados', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        rebuildCache: 'Reconstruir caché' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: 'Navegador de Cuadernos', // Name shown in the view header/tab (English: Notebook Navigator)
        ribbonTooltip: 'Navegador de Cuadernos', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Mostrar en el Navegador de Cuadernos' // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Última modificación',
        createdAt: 'Creado el',
        file: 'archivo',
        files: 'archivos',
        folder: 'carpeta',
        folders: 'carpetas'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'Informe de metadatos fallidos exportado a: {filename}',
            exportFailed: 'Error al exportar el informe de metadatos'
        },
        sections: {
            general: 'General',
            notes: 'Visualización de notas',
            navigationPane: 'Visualización de carpetas',
            icons: 'Paquetes de iconos',
            tags: 'Visualización de etiquetas',
            folders: 'Notas de carpeta',
            foldersAndTags: 'Carpetas y etiquetas',
            search: 'Buscar',
            searchAndHotkeys: 'Búsqueda y atajos',
            listPane: 'Panel de lista',
            hotkeys: 'Atajos de teclado',
            advanced: 'Avanzado'
        },
        groups: {
            general: {
                filtering: 'Filtrado',
                behavior: 'Comportamiento',
                view: 'Apariencia',
                icons: 'Iconos',
                desktopAppearance: 'Apariencia de escritorio',
                formatting: 'Formato'
            },
            navigation: {
                appearance: 'Apariencia',
                shortcutsAndRecent: 'Atajos y elementos recientes'
            },
            list: {
                display: 'Apariencia',
                pinnedNotes: 'Notas fijadas',
                quickActions: 'Acciones rápidas'
            },
            notes: {
                frontmatter: 'Frontmatter',
                icon: 'Icono',
                title: 'Título',
                previewText: 'Texto de vista previa',
                featureImage: 'Imagen destacada',
                tags: 'Etiquetas',
                date: 'Fecha',
                parentFolder: 'Carpeta superior'
            }
        },
        items: {
            searchProvider: {
                name: 'Proveedor de búsqueda',
                desc: 'Elija entre búsqueda rápida de nombres de archivo o búsqueda de texto completo con el plugin Omnisearch. (no sincronizado)',
                options: {
                    internal: 'Búsqueda por filtro',
                    omnisearch: 'Omnisearch (texto completo)'
                },
                info: {
                    filterSearch: {
                        title: 'Búsqueda por filtro (predeterminado):',
                        description:
                            'Filtra archivos por nombre y etiquetas dentro de la carpeta actual y subcarpetas. Modo filtro: texto y etiquetas mezclados coinciden con todos los términos (ej. "proyecto #trabajo"). Modo etiquetas: búsqueda solo con etiquetas admite operadores AND/OR (ej. "#trabajo AND #urgente", "#proyecto OR #personal"). Cmd/Ctrl+Clic en etiquetas para añadir con AND, Cmd/Ctrl+Mayús+Clic para añadir con OR. Admite exclusión con prefijo ! (ej. !borrador, !#archivado) y búsqueda de notas sin etiquetas con !#.'
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            'Búsqueda de texto completo que busca en toda su bóveda, luego filtra los resultados para mostrar solo archivos de la carpeta actual, subcarpetas o etiquetas seleccionadas. Requiere que el plugin Omnisearch esté instalado - si no está disponible, la búsqueda volverá automáticamente a la búsqueda por filtro.',
                        warningNotInstalled: 'El plugin Omnisearch no está instalado. Se usa la búsqueda por filtro.',
                        limitations: {
                            title: 'Limitaciones conocidas:',
                            performance: 'Rendimiento: Puede ser lento, especialmente al buscar menos de 3 caracteres en bóvedas grandes',
                            pathBug:
                                'Error de ruta: No puede buscar en rutas con caracteres no ASCII y no busca correctamente en subrutas, afectando qué archivos aparecen en los resultados de búsqueda',
                            limitedResults:
                                'Resultados limitados: Como Omnisearch busca en toda la bóveda y devuelve un número limitado de resultados antes del filtrado, los archivos relevantes de su carpeta actual pueden no aparecer si existen demasiadas coincidencias en otro lugar de la bóveda',
                            previewText:
                                'Texto de vista previa: Las vistas previas de notas se reemplazan con extractos de resultados de Omnisearch, que pueden no mostrar el resaltado real de la coincidencia de búsqueda si aparece en otro lugar del archivo'
                        }
                    }
                }
            },
            listPaneTitle: {
                name: 'Título del panel de lista (solo escritorio)',
                desc: 'Elige dónde se muestra el título del panel de lista.',
                options: {
                    header: 'Mostrar en el encabezado',
                    list: 'Mostrar en el panel de lista',
                    hidden: 'No mostrar'
                }
            },
            sortNotesBy: {
                name: 'Ordenar notas por',
                desc: 'Elige cómo se ordenan las notas en la lista de notas.',
                options: {
                    'modified-desc': 'Fecha de edición (más reciente arriba)',
                    'modified-asc': 'Fecha de edición (más antigua arriba)',
                    'created-desc': 'Fecha de creación (más reciente arriba)',
                    'created-asc': 'Fecha de creación (más antigua arriba)',
                    'title-asc': 'Título (A arriba)',
                    'title-desc': 'Título (Z arriba)'
                }
            },
            revealFileOnListChanges: {
                name: 'Desplazar al archivo seleccionado cuando cambia la lista',
                desc: 'Desplazar al archivo seleccionado al anclar notas, mostrar notas descendientes, cambiar la apariencia de carpetas o ejecutar operaciones de archivos.'
            },
            includeDescendantNotes: {
                name: 'Mostrar notas de subcarpetas / descendientes (no sincronizado)',
                desc: 'Incluir notas de subcarpetas y descendientes de etiquetas al ver una carpeta o etiqueta.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Limitar notas fijadas a su carpeta',
                desc: 'Las notas fijadas aparecen solo al ver la carpeta o etiqueta donde fueron fijadas.'
            },
            separateNoteCounts: {
                name: 'Mostrar conteos actuales y descendientes por separado',
                desc: 'Muestra el conteo de notas como formato "actual ▾ descendientes" en carpetas y etiquetas.'
            },
            groupNotes: {
                name: 'Agrupar notas',
                desc: 'Muestra encabezados entre notas agrupadas por fecha o carpeta. Las vistas de etiquetas usan grupos por fecha cuando la agrupación por carpeta está activada.',
                options: {
                    none: 'No agrupar',
                    date: 'Agrupar por fecha',
                    folder: 'Agrupar por carpeta'
                }
            },
            showPinnedGroupHeader: {
                name: 'Mostrar encabezado del grupo anclado',
                desc: 'Muestra el encabezado de la sección de notas ancladas.'
            },
            showPinnedIcon: {
                name: 'Mostrar icono de anclados',
                desc: 'Muestra el icono junto al encabezado de la sección anclada.'
            },
            defaultListMode: {
                name: 'Modo de lista predeterminado',
                desc: 'Selecciona el diseño de lista predeterminado. Estándar muestra título, fecha, descripción y texto de vista previa. Compacto muestra solo el título. La apariencia se puede sobrescribir por carpeta.',
                options: {
                    standard: 'Estándar',
                    compact: 'Compacto'
                }
            },
            showFileIcons: {
                name: 'Mostrar iconos de archivo',
                desc: 'Mostrar iconos de archivo con espaciado alineado a la izquierda. Desactivar elimina tanto iconos como sangría. Prioridad: personalizado > nombre de archivo > tipo de archivo > predeterminado.'
            },
            showFilenameMatchIcons: {
                name: 'Iconos por nombre de archivo',
                desc: 'Asignar iconos a archivos según el texto en sus nombres.'
            },
            fileNameIconMap: {
                name: 'Mapa de iconos por nombre',
                desc: 'Los archivos que contienen el texto obtienen el icono especificado. Una asignación por línea: texto=icono',
                placeholder: '# texto=icono\nreunión=LiCalendar\nfactura=PhReceipt',
                editTooltip: 'Editar asignaciones'
            },
            showCategoryIcons: {
                name: 'Iconos por tipo de archivo',
                desc: 'Asignar iconos a archivos según su extensión.'
            },
            fileTypeIconMap: {
                name: 'Mapa de iconos por tipo',
                desc: 'Los archivos con la extensión obtienen el icono especificado. Una asignación por línea: extensión=icono',
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: 'Editar asignaciones'
            },
            optimizeNoteHeight: {
                name: 'Altura de nota variable',
                desc: 'Usar altura compacta para notas ancladas y notas sin texto de vista previa.'
            },
            compactItemHeight: {
                name: 'Altura de elementos compactos',
                desc: 'Define la altura de los elementos compactos en escritorio y móvil.',
                resetTooltip: 'Restablecer al valor predeterminado (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Escalar texto con altura compacta',
                desc: 'Escala el texto de los elementos compactos cuando se reduce la altura.'
            },
            showParentFolder: {
                name: 'Mostrar carpeta principal',
                desc: 'Muestra el nombre de la carpeta principal para las notas en subcarpetas o etiquetas.'
            },
            parentFolderClickRevealsFile: {
                name: 'Clic en carpeta principal abre carpeta',
                desc: 'Al hacer clic en la etiqueta de la carpeta principal se abre la carpeta en el panel de lista.'
            },
            showParentFolderColor: {
                name: 'Mostrar color de carpeta principal',
                desc: 'Usar colores de carpeta en etiquetas de carpetas principales.'
            },
            showQuickActions: {
                name: 'Mostrar acciones rápidas (solo escritorio)',
                desc: 'Mostrar botones de acción al pasar sobre archivos. Los controles de botones seleccionan qué acciones aparecen.'
            },
            dualPane: {
                name: 'Diseño de doble panel (no sincronizado)',
                desc: 'Mostrar panel de navegación y panel de lista lado a lado en escritorio.'
            },
            dualPaneOrientation: {
                name: 'Orientación del panel dual (no sincronizado)',
                desc: 'Selecciona una distribución horizontal o vertical cuando el panel dual está activo.',
                options: {
                    horizontal: 'División horizontal',
                    vertical: 'División vertical'
                }
            },
            appearanceBackground: {
                name: 'Color de fondo',
                desc: 'Elige colores de fondo para los paneles de navegación y lista.',
                options: {
                    separate: 'Fondos separados',
                    primary: 'Usar fondo de lista',
                    secondary: 'Usar fondo de navegación'
                }
            },
            appearanceScale: {
                name: 'Nivel de zoom (no sincronizado)',
                desc: 'Controla el nivel de zoom general de Notebook Navigator.'
            },
            startView: {
                name: 'Vista de inicio predeterminada',
                desc: 'Elige qué panel mostrar al abrir Notebook Navigator. El panel de navegación muestra los accesos directos, las notas recientes y la estructura de carpetas. El panel de lista muestra la lista de notas en pantalla.',
                options: {
                    navigation: 'Panel de navegación',
                    files: 'Panel de lista'
                }
            },
            toolbarButtons: {
                name: 'Botones de la barra de herramientas',
                desc: 'Elige qué botones aparecen en la barra de herramientas. Los botones ocultos siguen siendo accesibles mediante comandos y menús.',
                navigationLabel: 'Barra de navegación',
                listLabel: 'Barra de lista'
            },
            autoRevealActiveNote: {
                name: 'Mostrar automáticamente la nota activa',
                desc: 'Muestra automáticamente las notas cuando se abren desde el Conmutador rápido, enlaces o búsqueda.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Ignorar eventos de la barra lateral derecha',
                desc: 'No cambiar la nota activa al hacer clic o cambiar notas en la barra lateral derecha.'
            },
            paneTransitionDuration: {
                name: 'Animación de panel único',
                desc: 'Duración de la transición al cambiar entre paneles en modo panel único (milisegundos).',
                resetTooltip: 'Restablecer a predeterminado'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Seleccionar automáticamente la primera nota (solo escritorio)',
                desc: 'Abre automáticamente la primera nota al cambiar de carpeta o etiqueta.'
            },
            skipAutoScroll: {
                name: 'Desactivar desplazamiento automático para accesos directos',
                desc: 'No desplazar el panel de navegación al hacer clic en elementos de accesos directos.'
            },
            autoExpandFoldersTags: {
                name: 'Expandir al seleccionar',
                desc: 'Expandir carpetas y etiquetas al seleccionar. En modo de panel único, la primera selección expande, la segunda muestra archivos.'
            },
            springLoadedFolders: {
                name: 'Expandir al arrastrar (solo escritorio)',
                desc: 'Expandir carpetas y etiquetas al pasar sobre ellas durante el arrastre.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Retraso de primera expansión',
                desc: 'Retraso antes de que se expanda la primera carpeta o etiqueta durante un arrastre (segundos).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Retraso de expansión posterior',
                desc: 'Retraso antes de expandir carpetas o etiquetas adicionales durante el mismo arrastre (segundos).'
            },
            navigationBanner: {
                name: 'Banner de navegación (perfil de bóveda)',
                desc: 'Mostrar una imagen encima del panel de navegación. Cambia con el perfil de bóveda seleccionado.',
                current: 'Banner actual: {path}',
                chooseButton: 'Elegir imagen'
            },
            showShortcuts: {
                name: 'Mostrar accesos directos',
                desc: 'Mostrar la sección de accesos directos en el panel de navegación.'
            },
            shortcutBadgeDisplay: {
                name: 'Insignia de acceso directo',
                desc: "Qué mostrar junto a los accesos directos. Usa los comandos 'Abrir acceso directo 1-9' para abrir los accesos directos directamente.",
                options: {
                    index: 'Posición (1-9)',
                    count: 'Cantidad de elementos',
                    none: 'Ninguno'
                }
            },
            showRecentNotes: {
                name: 'Mostrar notas recientes',
                desc: 'Mostrar la sección de notas recientes en el panel de navegación.'
            },
            recentNotesCount: {
                name: 'Cantidad de notas recientes',
                desc: 'Número de notas recientes a mostrar.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Fijar notas recientes con accesos directos',
                desc: 'Incluir notas recientes cuando se fijan los accesos directos.'
            },
            showTooltips: {
                name: 'Mostrar tooltips',
                desc: 'Muestra tooltips con información adicional para notas y carpetas al pasar el cursor.'
            },
            showTooltipPath: {
                name: 'Mostrar ruta',
                desc: 'Muestra la ruta de la carpeta debajo del nombre de las notas en los tooltips.'
            },
            resetPaneSeparator: {
                name: 'Restablecer posición del separador de paneles',
                desc: 'Restablece el separador arrastrable entre el panel de navegación y el panel de lista a la posición predeterminada.',
                buttonText: 'Restablecer separador',
                notice: 'Posición del separador restablecida. Reinicia Obsidian o vuelve a abrir Notebook Navigator para aplicar.'
            },
            multiSelectModifier: {
                name: 'Modificador de selección múltiple (solo escritorio)',
                desc: 'Elige qué tecla modificadora activa la selección múltiple. Cuando se selecciona Option/Alt, Cmd/Ctrl clic abre notas en una nueva pestaña.',
                options: {
                    cmdCtrl: 'Cmd/Ctrl clic',
                    optionAlt: 'Option/Alt clic'
                }
            },
            excludedNotes: {
                name: 'Ocultar notas (perfil de bóveda)',
                desc: 'Lista de propiedades del frontmatter separadas por comas. Las notas que contengan cualquiera de estas propiedades se ocultarán (ej.: draft, private, archived).',
                placeholder: 'draft, private'
            },
            excludedFileNamePatterns: {
                name: 'Ocultar archivos (perfil de bóveda)',
                desc: 'Lista de patrones de nombre de archivo separados por comas para ocultar. Soporta comodines * y rutas / (ej.: temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Perfil de bóveda',
                desc: 'Los perfiles almacenan visibilidad de tipos de archivo, archivos ocultos, carpetas ocultas, etiquetas ocultas, notas ocultas, atajos y banner de navegación. Cambia de perfil desde el encabezado del panel de navegación.',
                defaultName: 'Predeterminado',
                addButton: 'Añadir perfil',
                editProfilesButton: 'Editar perfiles',
                addProfileOption: 'Añadir perfil...',
                applyButton: 'Aplicar',
                editButton: 'Editar perfil',
                deleteButton: 'Eliminar perfil',
                addModalTitle: 'Añadir perfil',
                editProfilesModalTitle: 'Editar perfiles',
                editModalTitle: 'Editar perfil',
                addModalPlaceholder: 'Nombre del perfil',
                deleteModalTitle: 'Eliminar {name}',
                deleteModalMessage:
                    '¿Eliminar {name}? Se eliminarán los filtros de archivos, carpetas, etiquetas y notas ocultas guardados en este perfil.',
                moveUp: 'Subir',
                moveDown: 'Bajar',
                errors: {
                    emptyName: 'Introduce un nombre de perfil',
                    duplicateName: 'El nombre del perfil ya existe'
                }
            },
            vaultTitle: {
                name: 'Ubicación del título de bóveda (solo escritorio)',
                desc: 'Elige dónde se muestra el título de la bóveda.',
                options: {
                    header: 'Mostrar en el encabezado',
                    navigation: 'Mostrar en el panel de navegación'
                }
            },
            excludedFolders: {
                name: 'Ocultar carpetas (perfil de bóveda)',
                desc: 'Lista de carpetas a ocultar separadas por comas. Patrones de nombre: assets* (carpetas que comienzan con assets), *_temp (terminan con _temp). Patrones de ruta: /archive (solo archivo raíz), /res* (carpetas raíz que comienzan con res), /*/temp (carpetas temp un nivel abajo), /projects/* (todas las carpetas dentro de projects).',
                placeholder: 'templates, assets*, /archive, /res*'
            },
            fileVisibility: {
                name: 'Mostrar tipos de archivo (perfil de bóveda)',
                desc: 'Filtre qué tipos de archivo se muestran en el navegador. Los tipos de archivo no soportados por Obsidian pueden abrirse en aplicaciones externas.',
                options: {
                    documents: 'Documentos (.md, .canvas, .base)',
                    supported: 'Soportados (abre en Obsidian)',
                    all: 'Todos (puede abrir externamente)'
                }
            },
            homepage: {
                name: 'Página de inicio',
                desc: 'Selecciona el archivo que Notebook Navigator abre automáticamente, como un panel.',
                current: 'Actual: {path}',
                currentMobile: 'Móvil: {path}',
                chooseButton: 'Elegir archivo',

                separateMobile: {
                    name: 'Página de inicio móvil separada',
                    desc: 'Usar una página de inicio diferente en dispositivos móviles.'
                }
            },
            showFileDate: {
                name: 'Mostrar fecha',
                desc: 'Muestra la fecha debajo de los nombres de las notas.'
            },
            alphabeticalDateMode: {
                name: 'Al ordenar por nombre',
                desc: 'Fecha que se muestra cuando las notas están ordenadas alfabéticamente.',
                options: {
                    created: 'Fecha de creación',
                    modified: 'Fecha de modificación'
                }
            },
            showFileTags: {
                name: 'Mostrar etiquetas de archivo',
                desc: 'Muestra etiquetas clicables en los elementos de archivo. Use colores de etiquetas para distinguir visualmente diferentes tipos de etiquetas.'
            },
            showFileTagAncestors: {
                name: 'Mostrar rutas completas de etiquetas',
                desc: "Mostrar rutas completas de jerarquía de etiquetas. Activado: 'ai/openai', 'trabajo/proyectos/2024'. Desactivado: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Colorear etiquetas de archivo',
                desc: 'Aplicar colores de etiquetas a las insignias de etiquetas en elementos de archivo.'
            },
            prioritizeColoredFileTags: {
                name: 'Mostrar primero las etiquetas coloreadas',
                desc: 'Ordena las etiquetas coloreadas antes que otras etiquetas en los elementos de archivo.'
            },
            showFileTagsInCompactMode: {
                name: 'Mostrar etiquetas de archivo en modo compacto',
                desc: 'Mostrar etiquetas cuando la fecha, vista previa e imagen están ocultas.'
            },
            dateFormat: {
                name: 'Formato de fecha',
                desc: 'Formato para mostrar fechas (usa formato date-fns).',
                placeholder: "d 'de' MMMM 'de' yyyy",
                help: "Formatos comunes:\nd 'de' MMMM 'de' yyyy = 25 de mayo de 2022\ndd/MM/yyyy = 25/05/2022\nyyyy-MM-dd = 2022-05-25\n\nTokens:\nyyyy/yy = año\nMMMM/MMM/MM = mes\ndd/d = día\nEEEE/EEE = día de la semana",
                helpTooltip: 'Clic para referencia de formato'
            },
            timeFormat: {
                name: 'Formato de hora',
                desc: 'Formato para mostrar horas (usa formato date-fns).',
                placeholder: 'HH:mm',
                help: 'Formatos comunes:\nHH:mm = 14:30 (24 horas)\nh:mm a = 2:30 PM (12 horas)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nTokens:\nHH/H = 24 horas\nhh/h = 12 horas\nmm = minutos\nss = segundos\na = AM/PM',
                helpTooltip: 'Clic para referencia de formato'
            },
            showFilePreview: {
                name: 'Mostrar vista previa de nota',
                desc: 'Muestra texto de vista previa debajo de los nombres de las notas.'
            },
            skipHeadingsInPreview: {
                name: 'Omitir encabezados en vista previa',
                desc: 'Omite las líneas de encabezado al generar el texto de vista previa.'
            },
            skipCodeBlocksInPreview: {
                name: 'Omitir bloques de código en vista previa',
                desc: 'Omite los bloques de código al generar el texto de vista previa.'
            },
            stripHtmlInPreview: {
                name: 'Eliminar HTML en vistas previas',
                desc: 'Eliminar etiquetas HTML del texto de vista previa. Puede afectar el rendimiento en notas grandes.'
            },
            previewProperties: {
                name: 'Propiedades de vista previa',
                desc: 'Lista separada por comas de propiedades de frontmatter para buscar texto de vista previa. Se usará la primera propiedad con texto.',
                placeholder: 'resumen, descripción, abstracto',
                info: 'Si no se encuentra texto de vista previa en las propiedades especificadas, la vista previa se generará a partir del contenido de la nota.'
            },
            previewRows: {
                name: 'Filas de vista previa',
                desc: 'Número de filas a mostrar para el texto de vista previa.',
                options: {
                    '1': '1 fila',
                    '2': '2 filas',
                    '3': '3 filas',
                    '4': '4 filas',
                    '5': '5 filas'
                }
            },
            fileNameRows: {
                name: 'Filas de título',
                desc: 'Número de filas a mostrar para los títulos de las notas.',
                options: {
                    '1': '1 fila',
                    '2': '2 filas'
                }
            },
            showFeatureImage: {
                name: 'Mostrar imagen destacada',
                desc: 'Muestra una miniatura de la primera imagen encontrada en la nota.'
            },
            forceSquareFeatureImage: {
                name: 'Forzar imagen destacada cuadrada',
                desc: 'Renderizar imágenes destacadas como miniaturas cuadradas.'
            },
            featureImageProperties: {
                name: 'Propiedades de imagen',
                desc: 'Lista separada por comas de propiedades del frontmatter para imágenes en miniatura.',
                placeholder: 'thumbnail, featureResized, feature'
            },

            downloadExternalFeatureImages: {
                name: 'Descargar imágenes externas',
                desc: 'Descargar imágenes remotas y miniaturas de YouTube para imágenes destacadas.'
            },
            showRootFolder: {
                name: 'Mostrar carpeta raíz',
                desc: 'Muestra el nombre de la carpeta raíz en el árbol.'
            },
            showFolderIcons: {
                name: 'Mostrar iconos de carpetas',
                desc: 'Muestra iconos junto a las carpetas en el panel de navegación.'
            },
            inheritFolderColors: {
                name: 'Heredar colores de carpeta',
                desc: 'Las subcarpetas heredan el color de las carpetas principales.'
            },
            showNoteCount: {
                name: 'Mostrar conteo de notas',
                desc: 'Muestra el número de notas junto a cada carpeta y etiqueta.'
            },
            showSectionIcons: {
                name: 'Mostrar iconos para atajos y elementos recientes',
                desc: 'Muestra iconos para secciones de navegación como Atajos y Archivos recientes.'
            },
            interfaceIcons: {
                name: 'Iconos de interfaz',
                desc: 'Editar iconos de barra de herramientas, carpetas, etiquetas, elementos fijados, búsqueda y ordenación.',
                buttonText: 'Editar iconos'
            },
            showIconsColorOnly: {
                name: 'Aplicar color solo a los iconos',
                desc: 'Cuando está habilitado, los colores personalizados se aplican solo a los iconos. Cuando está deshabilitado, los colores se aplican tanto a los iconos como a las etiquetas de texto.'
            },
            collapseBehavior: {
                name: 'Contraer elementos',
                desc: 'Elige qué afecta el botón de expandir/contraer todo.',
                options: {
                    all: 'Todas las carpetas y etiquetas',
                    foldersOnly: 'Solo carpetas',
                    tagsOnly: 'Solo etiquetas'
                }
            },
            smartCollapse: {
                name: 'Mantener elemento seleccionado expandido',
                desc: 'Al contraer, mantiene la carpeta o etiqueta seleccionada actualmente y sus elementos principales expandidos.'
            },
            navIndent: {
                name: 'Sangría del árbol',
                desc: 'Ajustar el ancho de sangría para carpetas y etiquetas anidadas.'
            },
            navItemHeight: {
                name: 'Altura de línea',
                desc: 'Ajustar la altura de las carpetas y etiquetas en el panel de navegación.'
            },
            navItemHeightScaleText: {
                name: 'Escalar texto con la altura de línea',
                desc: 'Reduce el texto de navegación cuando la altura de línea se disminuye.'
            },
            navRootSpacing: {
                name: 'Espaciado de elementos raíz',
                desc: 'Espaciado entre carpetas y etiquetas de nivel superior.'
            },
            showTags: {
                name: 'Mostrar etiquetas',
                desc: 'Muestra la sección de etiquetas en el navegador.'
            },
            showTagIcons: {
                name: 'Mostrar iconos de etiquetas',
                desc: 'Muestra iconos junto a las etiquetas en el panel de navegación.'
            },
            inheritTagColors: {
                name: 'Heredar colores de etiquetas',
                desc: 'Las etiquetas hijas heredan el color de las etiquetas padre.'
            },
            tagSortOrder: {
                name: 'Orden de etiquetas',
                desc: 'Elige cómo se ordenan las etiquetas en el panel de navegación. (no sincronizado)',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A',
                    frequencyAsc: 'Frecuencia (baja a alta)',
                    frequencyDesc: 'Frecuencia (alta a baja)'
                }
            },
            showAllTagsFolder: {
                name: 'Mostrar carpeta de etiquetas',
                desc: 'Muestra "Etiquetas" como una carpeta plegable.'
            },
            showUntagged: {
                name: 'Mostrar notas sin etiquetas',
                desc: 'Muestra el elemento "Sin etiquetas" para notas sin ninguna etiqueta.'
            },
            keepEmptyTagsProperty: {
                name: 'Conservar propiedad tags después de eliminar la última etiqueta',
                desc: 'Mantiene la propiedad tags en frontmatter cuando se eliminan todas las etiquetas. Cuando está desactivado, la propiedad tags se elimina del frontmatter.'
            },
            hiddenTags: {
                name: 'Ocultar etiquetas (perfil de bóveda)',
                desc: 'Lista separada por comas de patrones de etiquetas. Patrones de nombre: tag* (empieza con), *tag (termina con). Patrones de ruta: archivo (etiqueta y descendientes), archivo/* (solo descendientes), proyectos/*/borradores (comodín intermedio).',
                placeholder: 'archivo*, *borrador, proyectos/*/antiguo'
            },
            enableFolderNotes: {
                name: 'Habilitar notas de carpeta',
                desc: 'Cuando está habilitado, las carpetas con notas asociadas se muestran como enlaces clicables.'
            },
            folderNoteType: {
                name: 'Tipo predeterminado de nota de carpeta',
                desc: 'Tipo de nota de carpeta creado desde el menú contextual.',
                options: {
                    ask: 'Preguntar al crear',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'Nombre de la nota de carpeta',
                desc: 'Nombre de la nota de carpeta. Dejar vacío para usar el mismo nombre que la carpeta.',
                placeholder: 'Dejar vacío para el nombre de la carpeta'
            },
            folderNoteProperties: {
                name: 'Propiedades de nota de carpeta',
                desc: 'Frontmatter YAML agregado a las nuevas notas de carpeta. Los marcadores --- se agregan automáticamente.',
                placeholder: 'theme: dark\nfoldernote: true'
            },
            hideFolderNoteInList: {
                name: 'Ocultar notas de carpeta en la lista',
                desc: 'Ocultar la nota de carpeta para que no aparezca en la lista de notas de la carpeta.'
            },
            pinCreatedFolderNote: {
                name: 'Anclar notas de carpeta creadas',
                desc: 'Anclar automáticamente las notas de carpeta cuando se crean desde el menú contextual.'
            },
            confirmBeforeDelete: {
                name: 'Confirmar antes de eliminar',
                desc: 'Muestra un diálogo de confirmación al eliminar notas o carpetas'
            },
            interceptTagClicks: {
                name: 'Navegar a etiquetas al hacer clic',
                desc: 'Al hacer clic en etiquetas en notas, navegar a esa etiqueta en Notebook Navigator en lugar de activar la búsqueda de Obsidian.'
            },
            metadataCleanup: {
                name: 'Limpiar metadatos',
                desc: 'Elimina metadatos huérfanos dejados cuando archivos, carpetas o etiquetas son eliminados, movidos o renombrados fuera de Obsidian. Esto solo afecta el archivo de configuración de Notebook Navigator.',
                buttonText: 'Limpiar metadatos',
                error: 'Falló la limpieza de configuración',
                loading: 'Verificando metadatos...',
                statusClean: 'No hay metadatos para limpiar',
                statusCounts:
                    'Elementos huérfanos: {folders} carpetas, {tags} etiquetas, {files} archivos, {pinned} fijados, {separators} separadores'
            },
            rebuildCache: {
                name: 'Reconstruir caché',
                desc: 'Úselo si faltan etiquetas, las vistas previas son incorrectas o faltan imágenes. Esto puede ocurrir después de conflictos de sincronización o cierres inesperados.',
                buttonText: 'Reconstruir caché',
                success: 'Caché reconstruido',
                error: 'Error al reconstruir caché',
                indexingTitle: 'Indexando la bóveda...',
                progress: 'Actualizando la caché de Notebook Navigator.'
            },
            hotkeys: {
                intro: 'Edita <plugin folder>/notebook-navigator/data.json para personalizar los atajos de Notebook Navigator. Abre el archivo y busca la sección "keyboardShortcuts". Cada entrada usa esta estructura:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Opción',
                    '"Shift" = Mayús',
                    '"Ctrl" = Control (prefiere "Mod" para multiplataforma)'
                ],
                guidance:
                    'Añade varias asignaciones para admitir teclas alternativas como ArrowUp y K mostradas arriba. Combina modificadores en una misma entrada indicando cada valor, por ejemplo "modifiers": ["Mod", "Shift"]. Las secuencias de teclado como "gg" o "dd" no están disponibles. Recarga Obsidian después de editar el archivo.'
            },
            externalIcons: {
                downloadButton: 'Descargar',
                downloadingLabel: 'Descargando...',
                removeButton: 'Eliminar',
                statusInstalled: 'Descargado (versión {version})',
                statusNotInstalled: 'No descargado',
                versionUnknown: 'desconocida',
                downloadFailed: 'Error al descargar {name}. Verifica tu conexión e intenta nuevamente.',
                removeFailed: 'Error al eliminar {name}.',
                infoNote:
                    'Los paquetes de iconos descargados sincronizan el estado de instalación entre dispositivos. Los paquetes de iconos permanecen en la base de datos local en cada dispositivo; la sincronización solo rastrea si deben descargarse o eliminarse. Los paquetes de iconos se descargan del repositorio de Notebook Navigator (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterDates: {
                name: 'Usar metadatos del frontmatter',
                desc: 'Usar frontmatter para nombre de nota, marcas de tiempo, iconos y colores'
            },
            frontmatterNameField: {
                name: 'Campos de nombre',
                desc: 'Lista de campos frontmatter separados por comas. Se usa el primer valor no vacío. Usa el nombre de archivo como alternativa.',
                placeholder: 'título, nombre'
            },
            frontmatterIconField: {
                name: 'Campo de icono',
                desc: 'Campo del frontmatter para iconos de archivo. Dejar vacío para usar iconos guardados en los ajustes.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'Campo de color',
                desc: 'Campo del frontmatter para colores de archivo. Dejar vacío para usar colores guardados en los ajustes.',
                placeholder: 'color'
            },
            frontmatterSaveMetadata: {
                name: 'Guardar iconos y colores en el frontmatter',
                desc: 'Escribe automáticamente los iconos y colores de archivo en el frontmatter usando los campos configurados arriba.'
            },
            frontmatterMigration: {
                name: 'Migrar iconos y colores desde los ajustes',
                desc: 'Guardado en los ajustes: {icons} iconos, {colors} colores.',
                button: 'Migrar',
                buttonWorking: 'Migrando...',
                noticeNone: 'No hay iconos ni colores de archivo almacenados en los ajustes.',
                noticeDone: 'Migrados {migratedIcons}/{icons} iconos, {migratedColors}/{colors} colores.',
                noticeFailures: 'Entradas con errores: {failures}.',
                noticeError: 'Migración fallida. Revisa la consola para más detalles.'
            },
            frontmatterCreatedField: {
                name: 'Campo de marca de tiempo de creación',
                desc: 'Nombre del campo del frontmatter para la marca de tiempo de creación. Dejar vacío para usar solo la fecha del sistema.',
                placeholder: 'creado'
            },
            frontmatterModifiedField: {
                name: 'Campo de marca de tiempo de modificación',
                desc: 'Nombre del campo del frontmatter para la marca de tiempo de modificación. Dejar vacío para usar solo la fecha del sistema.',
                placeholder: 'modificado'
            },
            frontmatterDateFormat: {
                name: 'Formato de marca de tiempo',
                desc: 'Formato utilizado para analizar marcas de tiempo en el frontmatter. Dejar vacío para usar formato ISO 8601',
                helpTooltip: 'Ver documentación de formato date-fns',
                help: "Formatos comunes:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'Apoyar el desarrollo',
                desc: 'Si te encanta usar el Navegador de Cuadernos, considera apoyar su desarrollo continuo.',
                buttonText: '❤️ Patrocinar',
                coffeeButton: '☕️ Invítame un café'
            },
            updateCheckOnStart: {
                name: 'Buscar nueva versión al iniciar',
                desc: 'Busca nuevas versiones del complemento al iniciar y muestra una notificación cuando hay una actualización disponible. Cada versión se anuncia solo una vez, y las comprobaciones se realizan como máximo una vez al día.',
                status: 'Nueva versión disponible: {version}'
            },
            whatsNew: {
                name: 'Novedades en Notebook Navigator {version}',
                desc: 'Ver actualizaciones y mejoras recientes',
                buttonText: 'Ver actualizaciones recientes'
            },
            masteringVideo: {
                name: 'Dominar Notebook Navigator (vídeo)',
                desc: 'Este vídeo cubre todo lo que necesitas para ser productivo en Notebook Navigator, incluyendo atajos de teclado, búsqueda, etiquetas y personalización avanzada.'
            },
            cacheStatistics: {
                localCache: 'Caché local',
                items: 'elementos',
                withTags: 'con etiquetas',
                withPreviewText: 'con texto de vista previa',
                withFeatureImage: 'con imagen destacada',
                withMetadata: 'con metadatos'
            },
            metadataInfo: {
                successfullyParsed: 'Analizados correctamente',
                itemsWithName: 'elementos con nombre',
                withCreatedDate: 'con fecha de creación',
                withModifiedDate: 'con fecha de modificación',
                withIcon: 'con icono',
                withColor: 'con color',
                failedToParse: 'Error al analizar',
                createdDates: 'fechas de creación',
                modifiedDates: 'fechas de modificación',
                checkTimestampFormat: 'Verifica el formato de marca de tiempo.',
                exportFailed: 'Exportar errores'
            }
        }
    },
    whatsNew: {
        title: 'Novedades en Notebook Navigator',
        supportMessage: 'Si encuentras útil Notebook Navigator, considera apoyar su desarrollo.',
        supportButton: 'Invítame a un café',
        thanksButton: '¡Gracias!'
    }
};
