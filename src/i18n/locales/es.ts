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
export const STRINGS_ES = {
    // Common UI elements
    common: {
        cancel: 'Cancelar', // Button text for canceling dialogs and operations (English: Cancel)
        delete: 'Eliminar', // Button text for delete operations in dialogs (English: Delete)
        clear: 'Limpiar', // Button text for clearing values (English: Clear)
        remove: 'Eliminar', // Button text for remove operations in dialogs (English: Remove)
        restoreDefault: 'Restaurar predeterminado', // Button text for restoring values to defaults (English: Restore default)
        submit: 'Enviar', // Button text for submitting forms and dialogs (English: Submit)
        save: 'Guardar', // Button text for saving settings and dialogs (English: Save)
        configure: 'Configurar', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'Modo claro', // Label for light theme mode (English: Light mode)
        darkMode: 'Modo oscuro', // Label for dark theme mode (English: Dark mode)
        noSelection: 'Sin selección', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Sin etiquetas', // Label for notes without any tags (English: Untagged)
        featureImageAlt: 'Imagen destacada', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Error desconocido', // Generic fallback when an error has no message (English: Unknown error)
        clipboardWriteError: 'No se pudo escribir en el portapapeles',
        updateBannerTitle: 'Actualización de Notebook Navigator disponible',
        updateBannerInstruction: 'Actualiza en Ajustes -> Complementos de la comunidad',
        previous: 'Anterior', // Generic aria label for previous navigation (English: Previous)
        next: 'Siguiente' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Selecciona una carpeta o etiqueta para ver las notas', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Sin notas', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Fijadas', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Notas', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Archivos', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (oculto)', // Accessibility label applied to list items that are normally hidden
        collapseGroup: 'Contraer grupo',
        expandGroup: 'Expandir grupo',
        manualSortTitle: 'Orden manual: {property}',
        manualSortHint: 'Arrastra para reordenar. El orden se guarda como valores numéricos de índice en la propiedad "{property}".',
        manualSortNonMarkdownHint: 'Los archivos no Markdown se muestran al final y no se pueden reordenar.',
        unsortedSection: 'Sin ordenar',
        manualSortDone: 'Hecho',
        manualSortMultipleWriteFailure: '{count} archivos fallaron; primero: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Sin etiquetas', // Label for the special item showing notes without tags (English: Untagged)
        tags: 'Etiquetas' // Label for the tags virtual folder (English: Tags)
    },

    navigationPane: {
        shortcutsHeader: 'Accesos directos',
        recentFilesHeader: 'Archivos recientes', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Propiedades',
        reorderRootFoldersTitle: 'Reordenar navegación',
        reorderRootFoldersHint: 'Usa flechas o arrastra para reordenar',
        vaultRootLabel: 'Bóveda',
        resetRootToAlpha: 'Restablecer orden alfabético',
        resetRootToFrequency: 'Restablecer al orden por frecuencia',
        pinShortcuts: 'Fijar accesos directos',
        pinShortcutsAndRecentFiles: 'Fijar accesos directos y archivos recientes',
        unpinShortcuts: 'Desfijar accesos directos',
        unpinShortcutsAndRecentFiles: 'Desfijar accesos directos y archivos recientes',
        profileMenuAria: 'Cambiar perfil de bóveda'
    },

    navigationCalendar: {
        ariaLabel: 'Calendario',
        dailyNotesNotEnabled: 'El complemento principal de notas diarias no está habilitado.',
        noteHiddenByProfile: 'La nota del calendario está oculta por el perfil de bóveda actual.',
        createDailyNote: {
            title: 'Nueva nota diaria',
            message: 'El archivo {filename} no existe. ¿Deseas crearlo?',
            confirmButton: 'Crear'
        },
        helpModal: {
            title: 'Atajos del calendario',
            items: [
                'Haz clic en cualquier día para abrir o crear una nota diaria. Las semanas, meses, trimestres y años funcionan de la misma manera.',
                'Un punto relleno debajo de un día significa que tiene una nota. Un punto hueco significa que tiene tareas pendientes.',
                'Si una nota tiene una imagen destacada, aparece como fondo del día.'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+clic en una fecha para filtrar por esa fecha en la lista de archivos.',
            dateFilterOptionAlt: '`Option/Alt`+clic en una fecha para filtrar por esa fecha en la lista de archivos.'
        }
    },

    dailyNotes: {
        templateReadFailed: 'No se pudo leer la plantilla de notas diarias.',
        createFailed: 'No se pudo crear la nota diaria.'
    },

    shortcuts: {
        folderExists: 'La carpeta ya está en los atajos',
        noteExists: 'La nota ya está en los atajos',
        tagExists: 'La etiqueta ya está en los atajos',
        propertyExists: 'La propiedad ya está en los atajos',
        invalidProperty: 'Atajo de propiedad no válido',
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
        showCalendar: 'Mostrar calendario',
        hideCalendar: 'Ocultar calendario',
        newFolder: 'Nueva carpeta', // Tooltip for create new folder button (English: New folder)
        newNote: 'Nueva nota', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Volver a navegación', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeChildSortOrder: 'Cambiar orden de clasificación',
        changeSortAndGroup: 'Cambiar orden y agrupación',
        resetViewToDefaults: 'Restablecer vista a valores predeterminados',
        manualSort: 'Orden manual',
        editSortOrder: 'Editar orden de clasificación...',
        removeSortProperty: 'Eliminar propiedad de orden',
        descendants: 'descendientes',
        subfolders: 'subcarpetas',
        subtags: 'subetiquetas',
        childValues: 'valores secundarios',
        applySortAndGroupToDescendants: (target: string) => `Aplicar orden y agrupación a ${target}`,
        applyAppearanceToDescendants: (target: string) => `Aplicar apariencia a ${target}`,
        showFolders: 'Mostrar navegación', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: 'Reordenar navegación',
        finishRootFolderReorder: 'Listo',
        showExcludedItems: 'Mostrar carpetas, etiquetas y notas ocultas', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Ocultar carpetas, etiquetas y notas ocultas', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Mostrar paneles dobles', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Mostrar panel único', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            'Los paneles dobles no están disponibles cuando la barra lateral es demasiado estrecha. Para cambiarlo, establece "Cuando la barra lateral es demasiado estrecha" en "No hacer nada" en Ajustes > Apariencia y comportamiento.',
        changeAppearance: 'Cambiar apariencia', // Tooltip for button to change folder appearance settings (English: Change appearance)
        showNotesFromSubfolders: 'Mostrar notas de subcarpetas',
        showFilesFromSubfolders: 'Mostrar archivos de subcarpetas',
        showNotesFromDescendants: 'Mostrar notas de descendientes',
        showFilesFromDescendants: 'Mostrar archivos de descendientes',
        search: 'Buscar' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Buscar...', // Placeholder text for search input (English: Search...)
        placeholderVault: 'Buscar en la bóveda...',
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Borrar búsqueda', // Tooltip for clear search button (English: Clear search)
        switchToFilterSearch: 'Cambiar a búsqueda por filtro',
        switchToOmnisearch: 'Cambiar a Omnisearch',
        saveSearchShortcut: 'Guardar búsqueda en accesos directos',
        removeSearchShortcut: 'Eliminar búsqueda de accesos directos',
        shortcutModalTitle: 'Guardar búsqueda',
        shortcutNamePlaceholder: 'Introduce el nombre',
        shortcutStartIn: 'Iniciar siempre en: {path}',
        searchHelp: 'Sintaxis de búsqueda',
        searchHelpTitle: 'Sintaxis de búsqueda',
        searchHelpModal: {
            intro: 'Combina nombres de archivo, propiedades, etiquetas, fechas y filtros en una consulta (ej. `meeting .status=active #work @thisweek`). Instala el plugin Omnisearch para usar búsqueda de texto completo.',
            introSwitching:
                'Cambia entre búsqueda por filtro y Omnisearch usando las teclas de flecha arriba/abajo o haciendo clic en el icono de búsqueda.',
            sections: {
                fileNames: {
                    title: 'Nombres de archivo',
                    items: [
                        '`word` Encontrar notas con "word" en el nombre del archivo.',
                        '`word1 word2` Cada palabra debe coincidir con el nombre del archivo.',
                        '`-word` Excluir notas con "word" en el nombre del archivo.'
                    ]
                },
                tags: {
                    title: 'Etiquetas',
                    items: [
                        '`#tag` Incluir notas con etiqueta (también coincide con etiquetas anidadas como `#tag/subtag`).',
                        '`#` Incluir solo notas con etiquetas.',
                        '`-#tag` Excluir notas con etiqueta.',
                        '`-#` Incluir solo notas sin etiquetas.',
                        '`#tag1 #tag2` Coincidir con ambas etiquetas (AND implícito).',
                        '`#tag1 AND #tag2` Coincidir con ambas etiquetas (AND explícito).',
                        '`#tag1 OR #tag2` Coincidir con cualquiera de las etiquetas.',
                        '`#a OR #b AND #c` AND tiene mayor precedencia: coincide con `#a`, o ambos `#b` y `#c`.',
                        'Cmd/Ctrl+Clic en una etiqueta para añadir con AND. Cmd/Ctrl+Shift+Clic para añadir con OR.'
                    ]
                },
                properties: {
                    title: 'Propiedades',
                    items: [
                        '`.key` Incluir notas con clave de propiedad.',
                        '`.key=value` Incluir notas cuyo valor de propiedad contenga `value`.',
                        '`."Reading Status"` Incluir notas con una clave de propiedad que contiene espacios.',
                        '`."Reading Status"="In Progress"` Las claves y valores con espacios deben estar entre comillas dobles.',
                        '`-.key` Excluir notas con clave de propiedad.',
                        '`-.key=value` Excluir notas cuyo valor de propiedad contenga `value`.',
                        'Cmd/Ctrl+Clic en una propiedad para añadir con AND. Cmd/Ctrl+Shift+Clic para añadir con OR.'
                    ]
                },
                tasks: {
                    title: 'Filtros',
                    items: [
                        '`has:task` Incluir notas con tareas pendientes.',
                        '`-has:task` Excluir notas con tareas pendientes.',
                        '`folder:meetings` Incluir notas donde un nombre de carpeta contiene `meetings`.',
                        '`folder:/work/meetings` Incluir notas solo en `work/meetings` (no subcarpetas).',
                        '`folder:/` Incluir notas solo en la raíz del vault.',
                        '`-folder:archive` Excluir notas donde un nombre de carpeta contiene `archive`.',
                        '`-folder:/archive` Excluir notas solo en `archive` (no subcarpetas).',
                        '`ext:md` Incluir notas con extensión `md` (`ext:.md` también es compatible).',
                        '`-ext:pdf` Excluir notas con extensión `pdf`.',
                        'Combinar con etiquetas, nombres y fechas (por ejemplo: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'Comportamiento de AND/OR',
                    items: [
                        '`AND` y `OR` son operadores solo en consultas exclusivas de etiquetas/propiedades.',
                        'Las consultas exclusivas de etiquetas/propiedades contienen solo filtros de etiquetas y propiedades: `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`.',
                        'Si una consulta incluye nombres, fechas (`@...`), filtros de tareas (`has:task`), filtros de carpetas (`folder:...`) o filtros de extensión (`ext:...`), `AND` y `OR` se buscan como palabras.',
                        'Ejemplo de consulta con operadores: `#work OR .status=started`.',
                        'Ejemplo de consulta mixta: `#work OR ext:md` (`OR` se busca en los nombres de archivos).'
                    ]
                },
                dates: {
                    title: 'Fechas',
                    items: [
                        '`@today` Encontrar notas de hoy usando el campo de fecha predeterminado.',
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` Rangos de fechas relativos.',
                        '`@2026-02-07` Encontrar un día específico (también admite `@20260207`).',
                        '`@2026` Encontrar un año calendario.',
                        '`@2026-02` o `@202602` Encontrar un mes calendario.',
                        '`@2026-W05` o `@2026W05` Encontrar una semana ISO.',
                        '`@2026-Q2` o `@2026Q2` Encontrar un trimestre calendario.',
                        '`@13/02/2026` Formatos numéricos con separadores (`@07022026` sigue tu configuración regional cuando es ambiguo).',
                        '`@2026-02-01..2026-02-07` Encontrar un rango de días inclusivo (extremos abiertos soportados).',
                        '`@c:...` o `@m:...` Apuntar a fecha de creación o modificación.',
                        '`-@...` Excluir una coincidencia de fecha.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'Búsqueda de texto completo en todo el vault, filtrada por la carpeta actual o etiquetas seleccionadas.',
                        'Puede ser lento con menos de 3 caracteres en vaults grandes.',
                        'No puede buscar rutas con caracteres no ASCII ni buscar subrutas correctamente.',
                        'Devuelve resultados limitados antes del filtrado por carpeta, por lo que archivos relevantes pueden no aparecer si existen muchas coincidencias en otros lugares.',
                        'Las vistas previas de notas muestran extractos de Omnisearch en lugar del texto de vista previa predeterminado.'
                    ]
                }
            }
        }
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
            openInDefaultApp: 'Abrir en aplicación predeterminada',
            renameNote: 'Renombrar nota',
            deleteNote: 'Eliminar nota',
            deleteMultipleNotes: 'Eliminar {count} notas',
            moveNoteToFolder: 'Mover nota a...',
            moveFileToFolder: 'Mover archivo a...',
            moveMultipleNotesToFolder: 'Mover {count} notas a...',
            moveMultipleFilesToFolder: 'Mover {count} archivos a...',
            mergeNotes: 'Combinar {count} notas...',
            mergeNotesInGroup: 'Combinar notas del grupo...',
            setManualSortGroupHeader: 'Establecer encabezado de grupo',
            changeManualSortGroupHeader: 'Cambiar encabezado de grupo',
            manualSortGroupHeader: {
                title: 'Encabezado de grupo',
                copyStyle: 'Copiar estilo de encabezado',
                pasteStyle: 'Pegar estilo de encabezado',
                remove: 'Eliminar encabezado de grupo'
            },
            addTag: 'Añadir etiqueta',
            addPropertyKey: 'Establecer propiedad',
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
            setCalendarHighlight: 'Establecer resaltado',
            removeCalendarHighlight: 'Eliminar resaltado',
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
            createFolderNote: 'Crear nota de carpeta',
            detachFolderNote: 'Desvincular nota de carpeta',
            deleteFolderNote: 'Eliminar nota de carpeta',
            changeIcon: 'Cambiar icono',
            changeColor: 'Cambiar color',
            changeBackground: 'Cambiar fondo',
            excludeFolder: 'Ocultar carpeta',
            unhideFolder: 'Mostrar carpeta',
            excludeFromDescendants: 'Ocultar en carpetas superiores',
            includeInDescendants: 'Mostrar en carpetas superiores',
            hiddenFromParentsIndicator: 'Oculta en listas de carpetas superiores',
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
        property: {
            addKey: 'Configurar claves de propiedad',
            renameKey: 'Renombrar propiedad',
            deleteKey: 'Eliminar propiedad'
        },
        navigation: {
            addSeparator: 'Agregar separador',
            removeSeparator: 'Eliminar separador'
        },
        copyPath: {
            title: 'Copiar ruta',
            asObsidianUrl: 'como URL de Obsidian',
            fromVaultFolder: 'desde la carpeta del vault',
            fromSystemRoot: 'desde la raíz del sistema'
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
        appearance: 'Apariencia',
        sortBy: 'Ordenar por',
        standardPreset: 'Estándar',
        compactPreset: 'Compacto',
        defaultSuffix: '(predeterminado)',
        defaultLabel: 'Predeterminado',
        titleRows: 'Filas de título',
        previewRows: 'Filas de vista previa',
        groupBy: 'Agrupar por',
        titleRowOption: (rows: number) => `${rows} fila${rows === 1 ? '' : 's'} de título`,
        previewRowOption: (rows: number) => `${rows} fila${rows === 1 ? '' : 's'} de vista previa`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Aplicar',
            applySortAndGroupTitle: (target: string) => `¿Aplicar orden y agrupación a ${target}?`,
            applyAppearanceTitle: (target: string) => `¿Aplicar apariencia a ${target}?`,
            affectedCountMessage: (count: number) => `Anulaciones existentes que cambiarán: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: '¿Usar orden manual?',
            propertySortMessage: (property: string, count: number) =>
                `Esto cambia la vista actual al orden manual usando "${property}". Editar el orden escribe valores numéricos de índice en esa propiedad en ${count} ${count === 1 ? 'nota' : 'notas'} según sea necesario.`,
            propertySortConfirmButton: 'Usar orden manual',
            removePropertyTitle: '¿Eliminar propiedad de orden?',
            removePropertyMessage: (property: string, count: number) =>
                `Esto elimina "${property}" de ${count} ${count === 1 ? 'nota' : 'notas'} en la lista actual. Se borrará el orden manual de esas notas.`,
            removePropertyConfirmButton: 'Eliminar propiedad',
            compactTitle: '¿Compactar valores de índice?',
            compactMessage: (count: number) =>
                `Esta reordenación necesita más espacio numérico. ${count} ${count === 1 ? 'nota recibirá' : 'notas recibirán'} nuevos valores de índice.`,
            compactConfirmButton: 'Compactar valores de índice'
        },
        manualSortGroupHeader: {
            title: 'Establecer encabezado de grupo',
            titleLabel: 'Título',
            placeholder: 'Encabezado de grupo',
            icon: 'Icono',
            color: 'Color',
            wordCount: 'Mostrar el recuento de palabras',
            wordCountTarget: 'Recuento de palabras objetivo',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'Cuando este campo está vacío, el objetivo del grupo usa la propiedad de objetivo configurada en Ajustes > Notas > Recuento de palabras y caracteres. Sobrescríbelo definiendo un valor objetivo para este grupo.',
            description: 'Personaliza el encabezado de grupo para esta nota. Deja el título vacío para eliminar el encabezado.'
        },
        mergeNotes: {
            title: 'Combinar notas',
            summary: 'Crear una nota a partir de {count} notas en {folder}.',
            frontmatterRule: 'Se conserva el frontmatter de la primera nota. Se elimina el frontmatter de las demás notas.',
            crossFolderWarning:
                'Las notas de origen están en carpetas diferentes. Los enlaces relativos y las incrustaciones pueden dejar de funcionar en la nota combinada.',
            outputName: 'Nombre de salida',
            outputNameDesc: 'La nota combinada se crea en la carpeta mostrada arriba.',
            outputNamePlaceholder: 'Notas combinadas',
            separator: 'Separador',
            separatorDesc: 'Se inserta entre notas.',
            separatorOptions: {
                none: 'Ninguno',
                blankLine: 'Línea en blanco',
                horizontalRule: 'Línea horizontal',
                heading: 'Encabezado con el título de la nota'
            },
            moveSourcesToTrash: 'Mover las notas de origen a la papelera después de combinarlas',
            mergeButton: 'Combinar'
        },
        navRainbowSection: {
            title: (section: string) => `Colores arcoíris: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'Buscar iconos...',
            recentlyUsedHeader: 'Usados recientemente',
            emptyStateSearch: 'Empieza a escribir para buscar iconos',
            emptyStateNoResults: 'No se encontraron iconos',
            showingResultsInfo: 'Mostrando 50 de {count} resultados. Escribe más para filtrar.',
            emojiInstructions: 'Escribe o pega cualquier emoji para usarlo como icono',
            removeIcon: 'Quitar icono',
            removeFromRecents: 'Quitar de recientes',
            allTabLabel: 'Todos'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Añadir regla'
        },
        interfaceIcons: {
            title: 'Iconos de interfaz',
            fileItemsSection: 'Elementos de archivo',
            items: {
                'nav-shortcuts': 'Atajos',
                'nav-recent-files': 'Archivos recientes',
                'nav-expand-all': 'Expandir todo',
                'nav-collapse-all': 'Contraer todo',
                'nav-calendar': 'Calendario',
                'nav-tree-expand': 'Flecha de árbol: expandir',
                'nav-tree-collapse': 'Flecha de árbol: contraer',
                'nav-hidden-items': 'Elementos ocultos',
                'nav-root-reorder': 'Reordenar carpetas raíz',
                'nav-new-folder': 'Nueva carpeta',
                'nav-show-single-pane': 'Mostrar panel único',
                'nav-show-dual-pane': 'Mostrar paneles dobles',
                'nav-profile-chevron': 'Flecha del menú de perfil',
                'list-search': 'Buscar',
                'list-reveal-file': 'Revelar archivo',
                'list-descendants': 'Notas de subcarpetas',
                'list-sort-ascending': 'Orden: ascendente',
                'list-sort-descending': 'Orden: descendente',
                'list-sort-modified': 'Ordenar por fecha de edición',
                'list-sort-created': 'Ordenar por fecha de creación',
                'list-sort-title': 'Ordenar por título',
                'list-sort-filename': 'Ordenar por nombre de archivo',
                'list-sort-property': 'Ordenar por propiedad',
                'list-appearance': 'Cambiar apariencia',
                'list-new-note': 'Nueva nota',
                'list-pinned': 'Notas fijadas',
                'nav-folder-open': 'Carpeta abierta',
                'nav-folder-closed': 'Carpeta cerrada',
                'nav-tags': 'Etiquetas',
                'nav-tag': 'Etiqueta',
                'nav-properties': 'Propiedades',
                'nav-property': 'Propiedad',
                'nav-property-value': 'Valor',
                'file-unfinished-task': 'Tareas pendientes',
                'file-word-count': 'Conteo de palabras',
                'file-character-count': 'Recuento de caracteres'
            }
        },
        colorPicker: {
            currentColor: 'Actual',
            newColor: 'Nuevo',
            paletteDefault: 'Predeterminado',
            paletteCustom: 'Personalizado',
            copyColors: 'Copiar color',
            colorsCopied: 'Color copiado al portapapeles',
            pasteColors: 'Pegar color',
            pasteClipboardError: 'No se pudo leer el portapapeles',
            pasteInvalidFormat: 'Se esperaba un valor de color hex',
            colorsPasted: 'Color pegado correctamente',
            resetUserColors: 'Borrar colores personalizados',
            clearCustomColorsConfirm: '¿Eliminar todos los colores personalizados?',
            userColorSlot: 'Color {slot}',
            recentColors: 'Colores recientes',
            clearRecentColors: 'Limpiar colores recientes',
            removeRecentColor: 'Eliminar color',
            apply: 'Aplicar',
            pickerLabel: 'Selector',
            hexLabel: 'HEX',
            hexInputLabel: 'Valor de color hexadecimal',
            saturationValueArea: 'Saturación y brillo',
            hueSlider: 'Tono',
            alphaSlider: 'Transparencia'
        },
        appearance: {
            tabIcon: 'Icono',
            tabColor: 'Color',
            tabBackground: 'Fondo',
            resetIcon: 'Quitar icono',
            resetColor: 'Quitar color',
            resetBackground: 'Quitar fondo',
            clear: 'Limpiar estilo',
            apply: 'Aplicar'
        },
        selectVaultProfile: {
            title: 'Cambiar perfil de bóveda',
            currentBadge: 'Activo',
            emptyState: 'No hay perfiles de bóveda disponibles.'
        },
        tagOperation: {
            renameTitle: 'Renombrar etiqueta {tag}',
            deleteTitle: 'Eliminar etiqueta {tag}',
            newTagPrompt: 'Nuevo nombre de etiqueta',
            newTagPlaceholder: 'Introduce el nuevo nombre de etiqueta',
            renameWarning: 'Renombrar la etiqueta {oldTag} modificará {count} {files}.',
            deleteWarning: 'Eliminar la etiqueta {tag} modificará {count} {files}.',
            modificationWarning: 'Esto actualizará las fechas de modificación de los archivos.',
            affectedFiles: 'Archivos afectados:',
            andMore: 'y {count} más...',
            confirmRename: 'Renombrar etiqueta',
            renameUnchanged: '{tag} sin cambios',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            renameBatchNotFinalized:
                'Renombrados {renamed}/{total}. No actualizados: {notUpdated}. Los metadatos y accesos directos no se actualizaron.',
            invalidTagName: 'Introduce un nombre de etiqueta válido.',
            descendantRenameError: 'No se puede mover una etiqueta dentro de sí misma o un descendiente.',
            confirmDelete: 'Eliminar etiqueta',
            deleteBatchNotFinalized:
                'Eliminados de {removed}/{total}. No actualizados: {notUpdated}. Los metadatos y accesos directos no se actualizaron.',
            checkConsoleForDetails: 'Consulta la consola para más detalles.',
            file: 'archivo',
            files: 'archivos',
            inlineParsingWarning: {
                title: 'Compatibilidad de etiquetas en línea',
                message:
                    '{tag} contiene caracteres que Obsidian no puede analizar en etiquetas en línea. Las etiquetas de Frontmatter no se ven afectadas.',
                confirm: 'Usar de todos modos'
            }
        },
        propertyOperation: {
            renameTitle: 'Renombrar propiedad {property}',
            deleteTitle: 'Eliminar propiedad {property}',
            newKeyPrompt: 'Nuevo nombre de propiedad',
            newKeyPlaceholder: 'Ingrese el nuevo nombre de propiedad',
            renameWarning: 'Renombrar la propiedad {property} modificará {count} {files}.',
            renameConflictWarning:
                'La propiedad {newKey} ya existe en {count} {files}. Renombrar {oldKey} reemplazará los valores existentes de {newKey}.',
            deleteWarning: 'Eliminar la propiedad {property} modificará {count} {files}.',
            confirmRename: 'Renombrar propiedad',
            confirmDelete: 'Eliminar propiedad',
            renameNoChanges: '{oldKey} → {newKey} (sin cambios)',
            renameSettingsUpdateFailed: 'Propiedad {oldKey} → {newKey} renombrada. No se pudieron actualizar los ajustes.',
            deleteSingleSuccess: 'Propiedad {property} eliminada de 1 nota',
            deleteMultipleSuccess: 'Propiedad {property} eliminada de {count} notas',
            deleteSettingsUpdateFailed: 'Propiedad {property} eliminada. No se pudieron actualizar los ajustes.',
            invalidKeyName: 'Ingrese un nombre de propiedad válido.'
        },
        fileSystem: {
            newFolderTitle: 'Nueva carpeta',
            renameFolderTitle: 'Renombrar carpeta',
            renameFileTitle: 'Renombrar archivo',
            deleteFolderTitle: "¿Eliminar '{name}'?",
            deleteFileTitle: "¿Eliminar '{name}'?",
            deleteFileAttachmentsTitle: '¿Eliminar archivos adjuntos?',
            moveFileConflictTitle: 'Conflicto de movimiento',
            folderNamePrompt: 'Introduce el nombre de la carpeta:',
            hideInOtherVaultProfiles: 'Ocultar en otros perfiles de bóveda',
            renamePrompt: 'Introduce el nuevo nombre:',
            renameVaultTitle: 'Cambiar nombre de visualización del vault',
            renameVaultPrompt: 'Introduce un nombre de visualización personalizado (deja vacío para usar el predeterminado):',
            deleteFolderConfirm: '¿Estás seguro de que quieres eliminar esta carpeta y todo su contenido?',
            deleteFileConfirm: '¿Estás seguro de que quieres eliminar este archivo?',
            deleteFileAttachmentsDescriptionSingle: 'Este adjunto ya no se usa en ninguna nota. ¿Desea eliminarlo?',
            deleteFileAttachmentsDescriptionMultiple: 'Estos adjuntos ya no se usan en ninguna nota. ¿Desea eliminarlos?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Árbol de archivos',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Galería',
            moveFileConflictDescriptionSingle: 'Se encontró un conflicto de archivo en "{folder}".',
            moveFileConflictDescriptionMultiple: 'Se encontraron {count} conflictos de archivos en "{folder}".',
            moveFileConflictAffectedFiles: 'Archivos afectados',
            moveFileConflictItem: '"{name}" -> "{suggested}"{renameOnly}',
            moveFileConflictRenameOnly: '(solo renombrar)',
            moveFileConflictRename: 'Renombrar',
            moveFileConflictOverwrite: 'Sobrescribir',
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
        calendarTemplate: {
            placeholder: 'Buscar plantillas...',
            instructions: {
                navigate: 'para navegar',
                select: 'para seleccionar la plantilla',
                dismiss: 'para cancelar'
            }
        },
        navigationBanner: {
            placeholder: 'Buscar imágenes...',
            svgMissingDimensions: 'El archivo SVG seleccionado no define ancho, alto ni viewBox.',
            instructions: {
                navigate: 'para navegar',
                select: 'para establecer banner',
                dismiss: 'para cancelar'
            }
        },
        tagSuggest: {
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
        propertySuggest: {
            placeholder: 'Seleccionar clave de propiedad...',
            navigatePlaceholder: 'Navegar a propiedad...',
            instructions: {
                navigate: 'para navegar',
                select: 'para añadir propiedad',
                dismiss: 'para cancelar'
            }
        },
        propertyKeyVisibility: {
            title: 'Visibilidad de claves de propiedad',
            description:
                'Controla dónde se muestran los valores de propiedad. Las columnas corresponden al panel de navegación, panel de lista y menú contextual del archivo. Usa la fila inferior para alternar todas las filas de una columna.',
            searchPlaceholder: 'Buscar claves de propiedad...',
            propertyColumnLabel: 'Propiedad',
            showInNavigation: 'Mostrar en navegación',
            showInList: 'Mostrar en lista',
            showInFileMenu: 'Mostrar en menú de archivo',
            toggleAllInNavigation: 'Alternar todos en navegación',
            toggleAllInList: 'Alternar todos en lista',
            toggleAllInFileMenu: 'Alternar todos en menú de archivo',
            applyButton: 'Aplicar',
            emptyState: 'No se encontraron claves de propiedad.'
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
            closeButton: 'Quizás más tarde'
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
            deleteAttachments: 'Error al eliminar los adjuntos: {error}',
            mergeNotes: 'Error al combinar notas: {error}',
            mergeNotesOpenOutput:
                'La nota combinada se creó como {name}, pero no se pudo abrir: {error}. Las notas de origen no se modificaron.',
            mergeNotesOpenSkipped: 'Otra solicitud de apertura de archivo tuvo prioridad.',
            mergeNotesTrashSources: 'Nota combinada creada. Error al mover {count} notas de origen a la papelera.',
            duplicateNote: 'Error al duplicar la nota: {error}',
            duplicateFolder: 'Error al duplicar la carpeta: {error}',
            openVersionHistory: 'Error al abrir el historial de versiones: {error}',
            versionHistoryNotFound: 'Comando de historial de versiones no encontrado. Asegúrate de que Obsidian Sync esté habilitado.',
            revealInExplorer: 'Error al mostrar el archivo en el explorador del sistema: {error}',
            openInDefaultApp: 'Error al abrir en la aplicación predeterminada: {error}',
            openInDefaultAppNotAvailable: 'Abrir en aplicación predeterminada no está disponible en esta plataforma',
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
            showFolder: 'Carpeta mostrada: {name}',
            folderExcludedFromDescendants: 'Oculta en listas de carpetas superiores: {name}',
            folderIncludedInDescendants: 'Visible en listas de carpetas superiores: {name}',
            mergeNotes: 'Se combinaron {count} notas en {name}'
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
            mergeNotesRequireMultipleMarkdown: 'Selecciona al menos dos notas Markdown para combinarlas',
            tagOperationsNotAvailable: 'Operaciones de etiquetas no disponibles',
            propertyOperationsNotAvailable: 'Operaciones de propiedades no disponibles',
            tagsRequireMarkdown: 'Las etiquetas solo son compatibles con notas Markdown',
            propertiesRequireMarkdown: 'Las propiedades solo son compatibles con notas Markdown',
            propertySetOnNote: 'Propiedad actualizada en 1 nota',
            propertySetOnNotes: 'Propiedad actualizada en {count} notas',
            manualSortPropertyRemovedFromNote: 'Propiedad de orden eliminada de 1 nota',
            manualSortPropertyRemovedFromNotes: 'Propiedad de orden eliminada de {count} notas',
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
            untitled: 'Sin título'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'No se puede mover una carpeta dentro de sí misma o una subcarpeta.',
            itemAlreadyExists: 'Ya existe un elemento llamado "{name}" en esta ubicación.',
            failedToMove: 'Error al mover: {error}',
            failedToAddTag: 'Error al agregar la etiqueta "{tag}"',
            failedToSetProperty: 'Error al actualizar la propiedad: {error}',
            failedToClearTags: 'Error al eliminar las etiquetas',
            failedToMoveFolder: 'Error al mover la carpeta "{name}"',
            failedToImportFiles: 'Error al importar: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} archivos ya existen en el destino',
            filesAlreadyHaveTag: '{count} archivos ya tienen esta etiqueta o una más específica',
            filesAlreadyHaveProperty: '{count} archivos ya tienen esta propiedad',
            noTagsToClear: 'No hay etiquetas para eliminar',
            fileImported: '1 archivo importado',
            filesImported: '{count} archivos importados'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'Hoy',
        yesterday: 'Ayer',
        previous7Days: 'Últimos 7 días',
        previous30Days: 'Últimos 30 días'
    },

    // Plugin commands
    commands: {
        open: 'Abrir', // Command palette: Opens the Notebook Navigator view (English: Open)
        toggleLeftSidebar: 'Alternar barra lateral izquierda', // Command palette: Toggles left sidebar, opening Notebook Navigator when uncollapsing (English: Toggle left sidebar)
        openHomepage: 'Abrir página de inicio', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        openDailyNote: 'Abrir nota diaria',
        openWeeklyNote: 'Abrir nota semanal',
        openMonthlyNote: 'Abrir nota mensual',
        openQuarterlyNote: 'Abrir nota trimestral',
        openYearlyNote: 'Abrir nota anual',
        revealFile: 'Revelar archivo', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Buscar', // Command palette: Toggle search in the file list (English: Search)
        searchVaultRoot: 'Buscar en toda la bóveda', // Command palette: Selects the vault root folder and focuses search with subfolders included (English: Search whole vault)
        toggleDualPane: 'Alternar diseño de doble panel', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        toggleDualPaneOrientation: 'Alternar orientación del doble panel', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'Alternar calendario', // Command palette: Toggles showing the calendar overlay in the navigation pane (English: Toggle calendar)
        selectVaultProfile: 'Cambiar perfil de bóveda', // Command palette: Opens a modal to choose a different vault profile (English: Switch vault profile)
        selectVaultProfile1: 'Cambiar al perfil de bóveda 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Cambiar al perfil de bóveda 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Cambiar al perfil de bóveda 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Eliminar archivos', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Crear nueva nota', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Nueva nota desde plantilla', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Mover archivos', // Command palette: Move selected files to another folder (English: Move files)
        mergeNotes: 'Combinar notas', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'Seleccionar siguiente archivo', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Seleccionar archivo anterior', // Command palette: Selects the previous file in the current view (English: Select previous file)
        navigateBack: 'Navegar atrás',
        navigateForward: 'Navegar adelante',
        convertToFolderNote: 'Convertir en nota de carpeta', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Establecer como nota de carpeta', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Desvincular nota de carpeta', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Fijar todas las notas de carpeta', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Navegar a carpeta', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Navegar a etiqueta', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        navigateToProperty: 'Navegar a propiedad', // Command palette: Navigate to a property key or value using fuzzy search (English: Navigate to property)
        addShortcut: 'Agregar a accesos directos', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: 'Abrir acceso directo {number}',
        toggleDescendants: 'Alternar descendientes', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Alternar carpetas, etiquetas y notas ocultas', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Alternar orden de etiquetas', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: 'Alternar etiquetas por selección',
        togglePropertiesBySelection: 'Alternar propiedades por selección',
        toggleCompactMode: 'Alternar modo compacto', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Alternar sección anclada',
        collapseExpand: 'Contraer / expandir todos los elementos', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        collapseExpandSelectedItem: 'Contraer / expandir el elemento seleccionado',
        addTag: 'Añadir etiqueta a archivos seleccionados', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        setProperty: 'Establecer propiedad en archivos seleccionados', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'Eliminar etiqueta de archivos seleccionados', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Eliminar todas las etiquetas de archivos seleccionados', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        openAllFiles: 'Abrir todos los archivos', // Command palette: Opens all files in the current folder or tag (English: Open all files)
        rebuildCache: 'Reconstruir caché', // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
        restoreDefaultSettings: 'Restaurar configuración predeterminada' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Navegador de Cuadernos', // Name shown in the view header/tab (English: Notebook Navigator)
        calendarViewName: 'Calendario', // Name shown in the view header/tab (English: Calendar)
        folderNoteSidebarViewName: 'Nota de carpeta', // Name shown in the folder note sidebar tab (English: Folder note)
        ribbonTooltip: 'Navegador de Cuadernos', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Mostrar en el Navegador de Cuadernos', // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
        settingsUnavailableNotice:
            'El Navegador de Cuadernos no pudo leer su configuración y no se inició. Si tu bóveda se está sincronizando, reinicia Obsidian cuando termine la sincronización. Para empezar de nuevo con la configuración predeterminada, ejecuta el comando "Restaurar configuración predeterminada".', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsRecovery: {
            confirmTitle: 'Restaurar configuración predeterminada', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'Esto reemplaza el archivo de configuración del Navegador de Cuadernos por la configuración predeterminada. Si tu bóveda aún se está sincronizando, los valores predeterminados restaurados pueden sobrescribir la configuración guardada en tus otros dispositivos. Antes de reemplazarlo, un archivo de configuración legible se copia a una copia de seguridad con marca de tiempo en la carpeta del plugin.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'Restaurar predeterminados', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: 'No se pudo completar la recuperación de la configuración. Se conservaron las preferencias locales.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'Configuración predeterminada restaurada. Reinicia Obsidian para terminar.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Última modificación',
        createdAt: 'Creado el',
        file: 'archivo',
        files: 'archivos',
        folder: 'carpeta',
        folders: 'carpetas',
        wordCount: 'Recuento de palabras'
    },

    fileCounts: {
        words: '{count} palabras',
        characters: '{count} caracteres',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'Cambiar ajustes predeterminados',
        metadataReport: {
            exportSuccess: 'Informe de metadatos fallidos exportado a: {filename}',
            exportFailed: 'Error al exportar el informe de metadatos'
        },
        sections: {
            general: 'General',
            vaultFilters: 'Filtros de visualización',
            appearanceBehavior: 'Apariencia y comportamiento',
            navigationPane: 'Panel de navegación',
            calendar: 'Calendario',
            fileOperations: 'Operaciones de archivos',
            icons: 'Paquetes de iconos',
            folders: 'Carpetas',
            folderNotes: 'Notas de carpeta',
            folderNoteFiles: 'Archivos de notas de carpeta',
            foldersAndFolderNotes: 'Carpetas y notas de carpeta',
            tagsAndProperties: 'Etiquetas y propiedades',
            tags: 'Etiquetas',
            listPane: 'Panel de lista',
            notes: 'Visualización de archivos',
            shortcutsAndRecentFiles: 'Accesos directos y archivos recientes',
            advanced: 'Avanzado'
        },
        pageGroups: {
            configuration: 'Configuración',
            navigationAndContent: 'Panel de navegación',
            notesAndLists: 'Panel de lista',
            calendarAndTools: 'Calendario y herramientas'
        },
        pageDescriptions: {
            general: 'Notas de versión, soporte, perfil de bóveda, tipos de archivo y claves de propiedades.',
            vaultFilters: 'Carpetas, etiquetas, archivos, etiquetas de archivo y reglas de propiedades ocultos.',
            appearanceBehavior: 'Comportamiento, navegación con teclado, botones del ratón, apariencia y formato.',
            navigationPane: 'Diseño, apariencia, recuento de notas, comportamiento de colapso y colores arcoíris.',
            shortcuts: 'Visibilidad de accesos directos, insignias, archivos recientes y elementos fijados.',
            calendar: 'Visualización del calendario, notas de fecha, plantillas, configuración regional y ubicación de la barra lateral.',
            fileOperations: 'Plantillas, confirmaciones de eliminación, adjuntos y comportamiento ante conflictos al mover archivos.',
            foldersAndFolderNotes: 'Visualización de carpetas, notas de carpeta, plantillas y comportamiento de notas de carpeta.',
            tagsProperties: 'Secciones de etiquetas y propiedades, iconos, ordenación, alcance y herencia.',
            listPane: 'Ordenación, agrupación, modos de lista, notas fijadas y vistas previas de dibujos.',
            frontmatter: 'Campos de frontmatter para nombres mostrados, marcas de tiempo, iconos y colores.',
            notes: 'Títulos, texto de vista previa, imágenes destacadas, etiquetas, propiedades, fechas, recuento de palabras y recuento de caracteres.',
            iconPacks: 'Iconos de interfaz, iconos de archivos y gestión de paquetes de iconos.',
            advanced: 'Diagnósticos, limpieza de metadatos, importación/exportación y restablecimiento.'
        },
        groups: {
            general: {
                vaultConfiguration: 'Configuración de la bóveda',
                templates: 'Plantillas',
                behavior: 'Comportamiento',
                startup: 'Inicio',
                keyboardNavigation: 'Navegación con teclado',
                mouseButtons: 'Botones del ratón',
                view: 'Apariencia',
                icons: 'Iconos',
                desktopAppearance: 'Apariencia de escritorio',
                mobileAppearance: 'Apariencia móvil',
                formatting: 'Formato'
            },
            advanced: {
                maintenance: 'Mantenimiento',
                resetSettings: 'Restablecer ajustes'
            },
            navigation: {
                appearance: 'Apariencia',
                banner: 'Banner',
                collapseItems: 'Contraer elementos',
                dragAndDrop: 'Arrastrar y soltar',
                noteCounts: 'Conteos de notas',
                rainbowColors: 'Colores arcoíris',
                leftSidebar: 'Barra lateral izquierda',
                calendarIntegration: 'Integración de calendario'
            },
            list: {
                display: 'Apariencia',
                groupHeaders: 'Encabezados de grupo',
                propertySort: 'Orden por propiedad',
                manualSort: 'Orden manual',
                pinnedNotes: 'Notas fijadas',
                drawingPreviews: 'Vistas previas de dibujos'
            },
            notes: {
                frontmatter: 'Campos de frontmatter',
                tasks: 'Tareas',
                icon: 'Icono',
                title: 'Título',
                previewText: 'Texto de vista previa',
                featureImage: 'Imagen destacada',
                tags: 'Etiquetas',
                properties: 'Propiedades',
                date: 'Fecha',
                parentFolder: 'Carpeta superior',
                wordCount: 'Recuento de palabras y caracteres'
            }
        },
        syncMode: {
            notSynced: '(no sincronizado)',
            switchToSynced: 'Activar sincronización',
            switchToLocal: 'Desactivar sincronización'
        },
        items: {
            listPaneTitle: {
                name: 'Título del panel de lista',
                desc: 'Elige dónde se muestra el título del panel de lista.',
                options: {
                    header: 'Mostrar en el encabezado',
                    list: 'Mostrar en el panel de lista',
                    hidden: 'No mostrar'
                }
            },
            sortNotesBy: {
                name: 'Orden predeterminado',
                desc: 'Elige el orden predeterminado para las notas.',
                options: {
                    'modified-desc': 'Fecha de edición (más reciente arriba)',
                    'modified-asc': 'Fecha de edición (más antigua arriba)',
                    'created-desc': 'Fecha de creación (más reciente arriba)',
                    'created-asc': 'Fecha de creación (más antigua arriba)',
                    'title-asc': 'Título (A arriba)',
                    'title-desc': 'Título (Z arriba)',
                    'filename-asc': 'Nombre de archivo (A arriba)',
                    'filename-desc': 'Nombre de archivo (Z arriba)'
                },
                directions: {
                    asc: 'Ascendente',
                    desc: 'Descendente'
                },
                fields: {
                    modified: 'Fecha de edición',
                    created: 'Fecha de creación',
                    title: 'Título',
                    filename: 'Nombre de archivo',
                    property: 'Propiedad'
                }
            },
            propertySortKey: {
                name: 'Propiedades para ordenar',
                desc: 'Propiedades del frontmatter separadas por comas que se muestran como opciones de orden por propiedad. Los valores de tipo array se combinan en una sola cadena. Estas propiedades no se modifican.',
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: 'Orden secundario',
                desc: 'Se usa con el orden por propiedad cuando las notas tienen el mismo valor de propiedad o no tienen valor.',
                options: {
                    title: 'Título',
                    filename: 'Nombre de archivo',
                    created: 'Fecha de creación',
                    modified: 'Fecha de edición'
                }
            },
            propertySortInstructions: {
                intro: 'Cada propiedad listada arriba aparece como una opción de orden en el menú de ordenación del panel de lista. Al seleccionar una se ordenan las notas por su valor del frontmatter.'
            },
            manualSortPropertyKey: {
                name: 'Propiedad de orden manual',
                desc: 'Propiedad del frontmatter usada para almacenar los valores numéricos de índice del orden manual.'
            },
            manualSortGroupHeaderProperty: {
                name: 'Propiedad de encabezado de grupo',
                desc: 'Propiedad del frontmatter usada para almacenar los encabezados de grupo personalizados.'
            },
            groupHeadersInstructions: {
                intro: 'Los encabezados de grupo personalizados se muestran encima de las notas en el panel de lista.',
                items: [
                    'En el menú de ordenación del panel de lista, establece la agrupación en **Personalizada**.',
                    'Haz clic derecho en una nota y elige **Establecer encabezado de grupo** para añadir un encabezado encima.'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'Ubicación de notas nuevas',
                desc: 'Elige dónde se colocan las notas nuevas cuando la lista actual usa orden manual.',
                options: {
                    top: 'Arriba',
                    bottom: 'Abajo',
                    'below-selected-note': 'Debajo de la nota seleccionada',
                    unsorted: 'Sin ordenar'
                }
            },
            confirmBeforeManualSort: {
                name: 'Confirmar antes del orden manual',
                desc: 'Mostrar una advertencia antes de escribir la propiedad de orden manual en las notas por primera vez. Cuando está desactivado, las notas reciben la propiedad sin advertencia.'
            },
            manualSortInstructions: {
                intro: 'El orden manual escribe un valor numérico de índice en una propiedad del frontmatter de cada nota. Las notas sin índice aparecen en Sin ordenar.',
                items: [
                    'Activa el orden manual eligiendo **Orden manual** en el menú de ordenación. Después hay dos formas de reorganizar las notas.',
                    'Selecciona **Editar orden de clasificación...** en el menú de ordenación para abrir una vista de reordenación. Arrastra las notas con el ratón o con el dedo en móvil. En escritorio, **Cmd/Ctrl** o **Shift** clic selecciona varias notas, y al arrastrar cualquiera de ellas se mueve todo el grupo.',
                    'En el panel de lista, selecciona una nota o varias, y luego pulsa **Cmd/Ctrl + Arrow Up/Down** para mover la selección hacia arriba o hacia abajo.'
                ]
            },
            revealFileOnListChanges: {
                name: 'Desplazar al archivo seleccionado cuando cambia la lista',
                desc: 'Desplazar al archivo seleccionado al anclar notas, mostrar notas descendientes, cambiar la apariencia de carpetas o ejecutar operaciones de archivos.'
            },
            includeDescendantNotes: {
                name: 'Mostrar notas de subcarpetas / descendientes',
                desc: 'Incluir notas de subcarpetas y descendientes de etiquetas y propiedades al ver una carpeta, etiqueta o propiedad.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Fijar notas solo en su carpeta',
                desc: 'Las notas fijadas aparecen fijadas solo en su propia carpeta. Útil para notas de carpeta o si tiene muchas notas fijadas. No afecta las vistas de etiquetas o propiedades.'
            },
            separateNoteCounts: {
                name: 'Mostrar recuentos de notas actuales y descendientes por separado',
                desc: 'Muestra el conteo de notas como "actual ▾ descendientes" para carpetas, etiquetas y propiedades.'
            },
            groupNotes: {
                name: 'Agrupación predeterminada',
                desc: 'Personalizada muestra los encabezados definidos en el frontmatter. Fecha agrupa las notas por fecha. Carpeta agrupa las notas por carpeta. Las vistas de etiquetas y propiedades usan grupos por fecha cuando se selecciona carpeta.',
                options: {
                    custom: 'Personalizada',
                    date: 'Fecha',
                    folder: 'Carpeta'
                }
            },
            showSelectedNavigationPills: {
                name: 'Mostrar siempre todas las etiquetas y propiedades',
                desc: 'Cuando está desactivado, las etiquetas que coinciden con la selección de navegación actual se ocultan (p. ej., la etiqueta "recetas" se oculta al navegar por la etiqueta "recetas"). Activar para mantener todas las etiquetas visibles.'
            },
            stickyGroupHeaders: {
                name: 'Encabezados de grupo fijos',
                desc: 'Mantén visible el encabezado actual de fecha, carpeta o sección anclada al desplazarte.'
            },
            showFolderGroupPaths: {
                name: 'Mostrar rutas de subcarpetas',
                desc: 'Al agrupar por carpeta en el panel de lista, muestra rutas de subcarpetas en lugar de solo nombres de carpeta.'
            },
            showGroupHeaderItemCounts: {
                name: 'Mostrar el número de elementos',
                desc: 'Muestra el número de elementos en cada encabezado de grupo del panel de lista.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'Agrupación por carpeta: archivos de la carpeta actual al final',
                desc: 'Cuando la agrupación predeterminada sea Carpeta, mueve los archivos directamente en la carpeta seleccionada debajo de los grupos de subcarpetas.'
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
                desc: 'Mostrar iconos de archivo con espaciado alineado a la izquierda. Desactivar elimina tanto iconos como sangría. Prioridad: icono de tareas pendientes > icono personalizado > icono de carpeta > icono de nombre de archivo > icono de tipo de archivo > icono predeterminado.'
            },
            useFolderIcon: {
                name: 'Usar icono de carpeta',
                desc: 'Mostrar el icono de la carpeta principal cuando no hay un icono de archivo personalizado. El color de la carpeta se usa cuando no hay un color de archivo personalizado.'
            },
            showFileIconUnfinishedTask: {
                name: 'Icono de tareas pendientes',
                desc: 'Mostrar un icono de tarea cuando una nota tiene tareas pendientes.'
            },
            showFileBackgroundUnfinishedTask: {
                name: 'Fondo de tareas pendientes',
                desc: 'Aplicar un color de fondo cuando una nota tiene tareas pendientes.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'Color de fondo de tareas pendientes',
                desc: 'Establecer el color de fondo usado cuando una nota tiene tareas pendientes.'
            },
            showFilenameMatchIcons: {
                name: 'Iconos por nombre de archivo',
                desc: 'Asignar iconos a archivos según el texto en sus nombres.'
            },
            fileNameIconMap: {
                name: 'Mapa de iconos por nombre',
                desc: 'Los archivos que contienen el texto obtienen el icono especificado. Una asignación por línea: texto=icono',
                placeholder: '# texto=icono\nreunión=ph-calendar\nfactura=ph-receipt',
                editTooltip: 'Editar asignaciones'
            },
            showCategoryIcons: {
                name: 'Iconos por tipo de archivo',
                desc: 'Asignar iconos a archivos según su extensión.'
            },
            fileTypeIconPreset: {
                name: 'Preajuste de iconos de archivo',
                desc: 'Elegir los iconos integrados o un preajuste de paquete de iconos. Las reglas de extensión personalizadas anulan este preajuste.',
                options: {
                    none: 'Iconos integrados'
                },
                notInstalledWarning: 'Este paquete de iconos no está instalado. En su lugar se muestran los iconos integrados.'
            },
            fileTypeIconMap: {
                name: 'Mapa de iconos por tipo',
                desc: 'Los archivos con la extensión obtienen el icono especificado. Una asignación por línea: extensión=icono',
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'Editar asignaciones'
            },
            compactItemHeight: {
                name: 'Altura de elementos compactos',
                desc: 'Define la altura de los elementos compactos en escritorio y móvil (píxeles).',
                resetTooltip: 'Restablecer al valor predeterminado (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Escalar texto con altura compacta',
                desc: 'Escala el texto de los elementos compactos cuando se reduce la altura.'
            },
            showParentFolder: {
                name: 'Mostrar carpeta principal',
                desc: 'Muestra la ruta de la carpeta principal para las notas en subcarpetas, etiquetas o propiedades.'
            },
            parentFolderClickRevealsFile: {
                name: 'Clic en carpeta principal abre carpeta',
                desc: 'Al hacer clic en la etiqueta de la carpeta principal se abre la carpeta en el panel de lista.'
            },
            showParentFolderColor: {
                name: 'Mostrar color de carpeta principal',
                desc: 'Usar colores de carpeta en etiquetas de carpetas principales.'
            },
            showParentFolderIcon: {
                name: 'Mostrar icono de carpeta principal',
                desc: 'Mostrar iconos de carpeta junto a las etiquetas de carpetas principales.'
            },
            showQuickActions: {
                name: 'Mostrar acciones rápidas',
                desc: 'Mostrar botones de acción al pasar sobre archivos. Los controles de botones seleccionan qué acciones aparecen.'
            },
            dualPane: {
                name: 'Diseño de doble panel',
                desc: 'Mostrar panel de navegación y panel de lista lado a lado en escritorio.'
            },
            dualPaneOrientation: {
                name: 'Orientación del panel dual',
                desc: 'Selecciona una distribución horizontal o vertical cuando el panel dual está activo.',
                options: {
                    horizontal: 'División horizontal',
                    vertical: 'División vertical'
                }
            },
            narrowSidebarLayout: {
                name: 'Cuando la barra lateral es demasiado estrecha',
                desc: 'Elige qué ocurre cuando el panel de navegación y el panel de lista no caben lado a lado.',
                options: {
                    none: 'No hacer nada',
                    singlePane: 'Cambiar a panel único',
                    vertical: 'Cambiar a división vertical'
                }
            },
            narrowSidebarTrigger: {
                name: 'Umbral de barra lateral estrecha',
                desc: 'Elige cómo se calcula el umbral de ancho de la barra lateral.',
                options: {
                    fitPanes: 'Ajustar paneles',
                    customWidth: 'Ancho personalizado'
                }
            },
            narrowSidebarCustomWidth: {
                name: 'Ancho del umbral de barra lateral estrecha',
                desc: 'Cambia cuando la barra lateral es más estrecha que este ancho.',
                resetTooltip: 'Restablecer al ancho predeterminado'
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
                name: 'Nivel de zoom',
                desc: 'Controla el nivel de zoom general de Notebook Navigator (porcentaje).'
            },
            useFloatingToolbars: {
                name: 'Usar barras de herramientas flotantes en iOS/iPadOS',
                desc: 'Solo se aplica en iOS y iPadOS.'
            },
            startView: {
                name: 'Vista de inicio predeterminada',
                desc: 'Elige qué panel está activo al abrir Notebook Navigator. El diseño de panel único muestra este panel primero; el diseño de doble panel le da el foco del teclado.',
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
            createNewNotesInNewTab: {
                name: 'Abrir notas nuevas en pestaña nueva',
                desc: 'Cuando está activado, el comando Crear nueva nota abre las notas en una pestaña nueva. Cuando está desactivado, las notas reemplazan la pestaña actual.'
            },
            autoRevealActiveNote: {
                name: 'Mostrar automáticamente la nota activa',
                desc: 'Muestra automáticamente las notas cuando se abren desde el Conmutador rápido, enlaces o búsqueda.'
            },
            autoRevealShortestPath: {
                name: 'Revelación automática: Usar la ruta más corta',
                desc: 'Activado: La revelación automática selecciona la carpeta ancestral o etiqueta visible más cercana. Desactivado: La revelación automática selecciona la carpeta real del archivo y la etiqueta exacta.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Revelación automática: Ignorar eventos de la barra lateral derecha',
                desc: 'No cambiar la nota activa al hacer clic o cambiar notas en la barra lateral derecha.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'Revelación automática: Ignorar eventos de otras ventanas',
                desc: 'No cambiar la nota activa al trabajar con notas en otra ventana.'
            },
            paneTransitionDuration: {
                name: 'Animación de panel único',
                desc: 'Duración de la transición al cambiar entre paneles en modo panel único (milisegundos).',
                resetTooltip: 'Restablecer a predeterminado'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Seleccionar automáticamente la primera nota',
                desc: 'Abre automáticamente la primera nota al cambiar de carpeta, etiqueta o propiedad.'
            },
            skipAutoScroll: {
                name: 'Desactivar desplazamiento automático para accesos directos',
                desc: 'No desplazar el panel de navegación al hacer clic en elementos de accesos directos.'
            },
            autoExpandNavItems: {
                name: 'Expandir al seleccionar',
                desc: 'Expandir carpetas y etiquetas al seleccionar. En modo de panel único, la primera selección expande, la segunda muestra archivos.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'Una rama expandida',
                desc: 'Contraer otras ramas del mismo árbol al expandir una carpeta, etiqueta o propiedad.'
            },
            springLoadedFolders: {
                name: 'Expandir al arrastrar',
                desc: 'Expandir carpetas y etiquetas al pasar sobre ellas durante el arrastre.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Expandir al arrastrar: Retraso de primera expansión',
                desc: 'Retraso antes de que se expanda la primera carpeta o etiqueta durante un arrastre (segundos).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Expandir al arrastrar: Retraso de expansión posterior',
                desc: 'Retraso antes de expandir carpetas o etiquetas adicionales durante el mismo arrastre (segundos).'
            },
            navigationBanner: {
                name: 'Banner de navegación (perfil de bóveda)',
                desc: 'Mostrar una imagen encima del panel de navegación. Cambia con el perfil de bóveda seleccionado.',
                current: 'Banner actual: {path}',
                chooseButton: 'Elegir imagen'
            },
            pinNavigationBanner: {
                name: 'Fijar banner',
                desc: 'Fijar el banner de navegación sobre el árbol de navegación.'
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
                name: 'Mostrar archivos recientes',
                desc: 'Mostrar la sección de archivos recientes en el panel de navegación.'
            },
            hideRecentNotes: {
                name: 'Ocultar tipos de archivos de archivos recientes',
                desc: 'Elige qué tipos de archivos ocultar en la sección de archivos recientes.',
                options: {
                    none: 'Ninguno',
                    folderNotes: 'Notas de carpeta'
                }
            },
            recentNotesCount: {
                name: 'Cantidad de archivos recientes',
                desc: 'Número de archivos recientes a mostrar.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Fijar archivos recientes con accesos directos',
                desc: 'Incluir archivos recientes cuando se fijan los accesos directos.'
            },
            calendarEnabled: {
                name: 'Activar calendario',
                desc: 'Activar las funciones de calendario de Notebook Navigator.'
            },
            calendarPlacement: {
                name: 'Ubicación del calendario',
                desc: 'Mostrar en la barra lateral izquierda o derecha.',
                options: {
                    leftSidebar: 'Barra lateral izquierda',
                    rightSidebar: 'Barra lateral derecha'
                }
            },
            calendarLeftPlacement: {
                name: 'Ubicación en panel único',
                desc: 'Dónde se muestra el calendario en modo de panel único.',
                options: {
                    navigationPane: 'Panel de navegación',
                    below: 'Debajo de los paneles'
                }
            },
            calendarLocale: {
                name: 'Configuración regional',
                desc: 'Controla el formato de fechas del calendario, la numeración de semanas y el primer día de la semana.',
                weekPathMismatchWarning:
                    'El calendario visible y las rutas de notas semanales utilizan diferentes inicios de semana o numeración de semanas.',
                options: {
                    systemDefault: 'Predeterminado'
                }
            },
            calendarWeekendDays: {
                name: 'Días de fin de semana',
                desc: 'Mostrar días de fin de semana con un color de fondo diferente.',
                options: {
                    none: 'Ninguno',
                    satSun: 'Sábado y domingo',
                    friSat: 'Viernes y sábado',
                    thuFri: 'Jueves y viernes'
                }
            },
            calendarMonthHeadingFormat: {
                name: 'Formato del nombre del mes',
                desc: 'Nombre del mes largo (enero) o abreviado (ene.).',
                options: {
                    full: 'enero (completo)',
                    short: 'ene. (corto)'
                }
            },
            showInfoButtons: {
                name: 'Mostrar botones de información',
                desc: 'Mostrar botones de información en la barra de búsqueda y el encabezado del calendario.'
            },
            calendarWeeksToShow: {
                name: 'Semanas a mostrar en barra lateral izquierda',
                desc: 'El calendario en la barra lateral derecha siempre muestra el mes completo.',
                options: {
                    fullMonth: 'Mes completo',
                    oneWeek: '1 semana',
                    weeksCount: '{count} semanas'
                }
            },
            calendarHighlightToday: {
                name: 'Resaltar la fecha de hoy',
                desc: 'Resaltar la fecha de hoy con un color de fondo y texto en negrita.'
            },
            calendarShowFeatureImage: {
                name: 'Mostrar imagen destacada',
                desc: 'Mostrar imágenes destacadas de las notas en el calendario.'
            },
            calendarShowTasks: {
                name: 'Mostrar tareas',
                desc: 'Mostrar un indicador en días, semanas y meses con tareas pendientes.'
            },
            calendarShowWeekNumber: {
                name: 'Mostrar número de semana',
                desc: 'Agregar una columna con el número de semana.'
            },
            calendarShowQuarter: {
                name: 'Mostrar trimestre',
                desc: 'Agregar una etiqueta de trimestre en el encabezado del calendario.'
            },
            calendarShowYearCalendar: {
                name: 'Mostrar calendario anual',
                desc: 'Mostrar navegación anual y cuadrícula de meses en la barra lateral derecha.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Confirmar antes de crear nueva nota',
                desc: 'Mostrar un diálogo de confirmación al crear una nueva nota diaria.'
            },
            calendarIntegrationMode: {
                name: 'Fuente de notas diarias',
                desc: 'Fuente para notas del calendario.',
                options: {
                    dailyNotes: 'Notas diarias (plugin principal)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'La carpeta y el formato de fecha se configuran en el plugin de notas diarias.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'Configuración regional de notas periódicas',
                desc: 'Controla los nombres localizados de meses, días de la semana, números de semana e inicios de semana en las rutas de notas periódicas de Notebook Navigator.',
                options: {
                    calendar: 'Calendario',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'Carpeta raíz',
                desc: 'Carpeta base para notas periódicas. Los patrones de fecha pueden incluir subcarpetas. Cambia con el perfil de bóveda seleccionado.',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'Ubicación de carpeta de plantillas',
                desc: 'El selector de archivos de plantilla muestra notas de esta carpeta.',
                placeholder: 'Templates',
                usage: 'Se usa en notas de calendario y notas de carpeta. Configura las plantillas en Calendario > Integración de calendario y Carpetas y notas de carpeta > Archivos de notas de carpeta.'
            },
            calendarCustomFilePattern: {
                name: 'Notas diarias',
                desc: 'Formatear ruta usando formato de fecha de Moment. Envuelve los nombres de subcarpetas entre corchetes, ej. [Work]/YYYY. Haz clic en el icono de plantilla para establecer una plantilla. Establecer ubicación de carpeta de plantillas en Operaciones de archivos > Plantillas.',
                momentDescPrefix: 'Formatear ruta usando ',
                momentLinkText: 'formato de fecha Moment',
                momentDescSuffix:
                    '. Envuelve los nombres de subcarpetas entre corchetes, ej. [Work]/YYYY. Haz clic en el icono de plantilla para establecer una plantilla. Establecer ubicación de carpeta de plantillas en Operaciones de archivos > Plantillas.',
                templaterSupportInstalled: '✅ El plugin Templater está instalado con soporte completo de plantillas.',
                templaterSupportMissing: '⚠️ Instala el plugin Templater para obtener soporte completo de plantillas.',
                placeholder: 'YYYY/YYYYMMDD',
                example: 'Sintaxis actual: {path}',
                parsingError: 'El patrón debe formatear y volver a analizarse como una fecha completa (año, mes, día).'
            },
            calendarCustomWeekPattern: {
                name: 'Notas semanales',
                parsingError: 'El patrón debe formatear y volver a analizarse como una semana completa (año de semana, número de semana).',
                weekPathMismatchWarning:
                    'Las rutas de notas semanales utilizan la configuración regional de notas periódicas. Use configuraciones regionales coincidentes, o use "GGGG" con "WW" para semanas basadas en lunes.',
                mixedWeekTokensWarning:
                    'Este patrón mezcla tokens de semana basados en lunes ("W" o "G") con tokens de semana basados en la configuración regional ("w" o "g"). Use un conjunto de forma coherente: "GGGG" con "WW" para semanas basadas en lunes, o "gggg" con "ww" si las notas semanales deben seguir la configuración regional seleccionada.'
            },
            calendarCustomMonthPattern: {
                name: 'Notas mensuales',
                parsingError: 'El patrón debe formatear y volver a analizarse como un mes completo (año, mes).'
            },
            calendarCustomQuarterPattern: {
                name: 'Notas trimestrales',
                parsingError: 'El patrón debe formatear y volver a analizarse como un trimestre completo (año, trimestre).'
            },
            calendarCustomYearPattern: {
                name: 'Notas anuales',
                parsingError: 'El patrón debe formatear y volver a analizarse como un año completo (año).'
            },
            calendarTemplateFile: {
                current: 'Archivo de plantilla: {name}'
            },
            showTooltips: {
                name: 'Mostrar tooltips',
                desc: 'Muestra tooltips con información adicional para notas y carpetas al pasar el cursor.'
            },
            showTooltipPath: {
                name: 'Mostrar ruta en tooltips',
                desc: 'Muestra la ruta de la carpeta debajo del nombre de las notas en los tooltips.'
            },
            showTooltipWordCount: {
                name: 'Mostrar recuento de palabras en tooltips',
                desc: 'Muestra el recuento de palabras de las notas en los tooltips.'
            },
            resetPaneSeparator: {
                name: 'Restablecer posición del separador de paneles',
                desc: 'Restablece el separador arrastrable entre el panel de navegación y el panel de lista a la posición predeterminada.',
                buttonText: 'Restablecer separador',
                notice: 'Posición del separador restablecida. Reinicia Obsidian o vuelve a abrir Notebook Navigator para aplicar.'
            },
            settingsTransfer: {
                name: 'Importar y exportar ajustes',
                desc: 'Exporta o importa los ajustes de Notebook Navigator como JSON. La importación reemplaza todos los ajustes.',
                importButtonText: 'Importar',
                exportButtonText: 'Exportar',
                import: {
                    modalTitle: 'Importar ajustes',
                    fileButtonName: 'Importar desde archivo',
                    fileButtonDesc: 'Carga un archivo JSON desde el disco.',
                    fileButtonText: 'Importar desde archivo',
                    editorName: 'JSON',
                    editorDesc:
                        'Pega o edita el JSON a continuación. Los ajustes no incluidos se restablecen a los valores predeterminados.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'Importar',
                    confirmTitle: '¿Importar ajustes?',
                    confirmMessage: 'La importación reemplaza los ajustes actuales de Notebook Navigator.',
                    backupToggleName: 'Guardar los ajustes actuales en la raíz de la bóveda antes de importar',
                    backupToggleDesc: 'Crea un archivo JSON con marca de tiempo en la raíz de la bóveda.',
                    successWithBackupNotice: 'Ajustes importados. Los ajustes anteriores se guardaron en {path}.',
                    backupError: 'No se pudieron guardar los ajustes actuales: {message}',
                    successNotice: 'Ajustes importados.',
                    errorNotice: 'Error al importar los ajustes: {message}',
                    fileReadError: 'No se pudo leer el archivo: {message}'
                },
                export: {
                    modalTitle: 'Exportar ajustes',
                    editorName: 'JSON',
                    editorDesc: 'Solo se incluyen los ajustes modificados respecto a los valores predeterminados.',
                    placeholder: '{}',
                    copyButtonText: 'Copiar al portapapeles',
                    downloadButtonText: 'Descargar',
                    copyNotice: 'Ajustes copiados al portapapeles.',
                    downloadNotice: 'Ajustes exportados.',
                    downloadError: 'Error al descargar los ajustes: {message}'
                }
            },
            resetAllSettings: {
                name: 'Restablecer todos los ajustes',
                desc: 'Restablece todos los ajustes de Notebook Navigator a los valores predeterminados.',
                buttonText: 'Restablecer todos los ajustes',
                confirmTitle: '¿Restablecer todos los ajustes?',
                confirmMessage:
                    'Esto restablecerá todos los ajustes de Notebook Navigator a sus valores predeterminados. No se puede deshacer.',
                confirmButtonText: 'Restablecer todos los ajustes',
                notice: 'Ajustes restablecidos. Reinicia Obsidian o vuelve a abrir Notebook Navigator para aplicar.',
                error: 'Error al restablecer los ajustes.'
            },
            multiSelectModifier: {
                name: 'Modificador de selección múltiple',
                desc: 'Elige qué tecla modificadora activa la selección múltiple. Cuando se selecciona Option/Alt, Cmd/Ctrl clic abre notas en una nueva pestaña.',
                options: {
                    cmdCtrl: 'Cmd/Ctrl clic',
                    optionAlt: 'Option/Alt clic'
                }
            },
            enterToOpenFiles: {
                name: 'Pulsar Enter para abrir archivos',
                desc: 'Abrir archivos solo al pulsar Enter durante la navegación con teclado en la lista. En macOS, esto impide que Enter cambie el nombre de los archivos.'
            },
            shiftEnterOpenContext: {
                name: 'Shift+Enter',
                desc: 'Elegir si Shift+Enter abre o cambia el nombre del archivo seleccionado.'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Enter',
                desc: 'Elegir si Cmd+Enter abre o cambia el nombre del archivo seleccionado.'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Enter',
                desc: 'Elegir si Ctrl+Enter abre o cambia el nombre del archivo seleccionado.'
            },
            mouseBackForwardAction: {
                name: 'Botones atrás/adelante del ratón',
                desc: 'Acción de los botones atrás y adelante del ratón en escritorio.',
                options: {
                    none: 'Usar predeterminado del sistema',
                    singlePaneSwitch: 'Cambiar paneles (panel único)',
                    history: 'Navegar en el historial'
                }
            },
            excludedNotes: {
                name: 'Ocultar notas con reglas de propiedades (perfil de bóveda)',
                desc: 'Lista de reglas de frontmatter separadas por comas. Use entradas `key` o `key=value` (ej.: status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'Ocultar archivos (perfil de bóveda)',
                desc: 'Lista de patrones de nombre de archivo separados por comas para ocultar. Soporta comodines * y rutas / (ej.: temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Perfil de bóveda',
                desc: 'Los perfiles almacenan visibilidad de tipos de archivo, archivos ocultos, carpetas ocultas, etiquetas ocultas, reglas de propiedades para notas ocultas, atajos y banner de navegación. Cambia de perfil desde el encabezado del panel de navegación.',
                defaultName: 'Predeterminado',
                addButton: 'Añadir perfil',
                editProfilesButton: 'Editar perfiles',
                addProfileOption: 'Añadir perfil...',
                applyButton: 'Aplicar',
                deleteButton: 'Eliminar perfil',
                addModalTitle: 'Añadir perfil',
                editProfilesModalTitle: 'Editar perfiles',
                addModalPlaceholder: 'Nombre del perfil',
                deleteModalTitle: 'Eliminar {name}',
                deleteModalMessage:
                    '¿Eliminar {name}? Se eliminarán los filtros de archivos, carpetas, etiquetas y notas basados en propiedades guardados en este perfil.',
                moveUp: 'Subir',
                moveDown: 'Bajar',
                errors: {
                    emptyName: 'Introduce un nombre de perfil',
                    duplicateName: 'El nombre del perfil ya existe'
                }
            },
            vaultTitle: {
                name: 'Ubicación del título de bóveda',
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
            descendantExcludedFolders: {
                name: 'Excluir carpetas de notas de subcarpetas (perfil de bóveda)',
                desc: 'Lista de carpetas separadas por comas que se omiten al recopilar notas de subcarpetas. Las carpetas permanecen visibles, y al seleccionar una se siguen mostrando sus notas. Usa los mismos patrones que Ocultar carpetas.',
                placeholder: 'diario, recursos, /archivo'
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
                desc: 'Elige qué abre Notebook Navigator automáticamente al iniciar.',
                current: 'Actual: {path}',
                chooseButton: 'Elegir archivo',
                options: {
                    none: 'Ninguno',
                    file: 'Archivo',
                    dailyNote: 'Nota diaria',
                    weeklyNote: 'Nota semanal',
                    monthlyNote: 'Nota mensual',
                    quarterlyNote: 'Nota trimestral',
                    yearlyNote: 'Nota anual'
                },
                file: {
                    name: 'Página de inicio: Archivo de inicio',
                    empty: 'Ningún archivo seleccionado'
                },
                createMissing: {
                    name: 'Página de inicio: Crear nota si no existe',
                    desc: 'Crea la nota periódica al iniciar o mediante el comando si no existe.'
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
                desc: 'Muestra etiquetas clicables en los elementos de archivo.'
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
            showFileProperties: {
                name: 'Mostrar propiedades de archivo',
                desc: 'Mostrar propiedades en los elementos de archivo. Usa el diálogo "Visibilidad de claves de propiedad" para elegir qué propiedades se muestran.'
            },
            colorFileProperties: {
                name: 'Colorear propiedades de archivo',
                desc: 'Aplicar colores de propiedad a las insignias de propiedad en los elementos de archivo.'
            },
            prioritizeColoredFileProperties: {
                name: 'Mostrar primero las propiedades coloreadas',
                desc: 'Ordenar las propiedades coloreadas antes que otras propiedades en los elementos de archivo.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Mostrar propiedades en modo compacto',
                desc: 'Mostrar propiedades cuando el modo compacto está activo.'
            },
            textCountDisplay: {
                name: 'Tipo de recuento',
                desc: 'Elige qué recuentos de notas aparecen en los elementos de archivo.',
                options: {
                    none: 'Ninguno',
                    words: 'Recuento de palabras',
                    characters: 'Recuento de caracteres',
                    both: 'Recuento de palabras y caracteres'
                }
            },
            textCountPlacement: {
                name: 'Ubicación',
                desc: 'Elige dónde aparecen los recuentos de notas.',
                options: {
                    title: 'En el título',
                    property: 'Como propiedad'
                }
            },
            characterCountSpaces: {
                name: 'Recuento de caracteres',
                desc: 'Elige si los espacios se incluyen en el recuento de caracteres.',
                options: {
                    include: 'Incluyendo espacios',
                    exclude: 'Excluyendo espacios'
                }
            },
            wordCountTargetProperty: {
                name: 'Propiedad objetivo',
                desc: 'Clave de propiedad del frontmatter que contiene el recuento de palabras objetivo. Déjela vacía para ocultar objetivos.'
            },
            showWordCountPercentage: {
                name: 'Mostrar porcentaje objetivo',
                desc: 'Mostrar solo el porcentaje de progreso cuando haya un recuento de palabras objetivo disponible.'
            },
            propertyFields: {
                name: 'Claves de propiedades (perfil de bóveda)',
                desc: 'Claves de propiedades de metadatos, con visibilidad por clave para la navegación y la lista de archivos.',
                addButtonTooltip: 'Configurar claves de propiedad',
                noneConfigured: 'No hay propiedades configuradas',
                singleConfigured: '1 propiedad configurada: {properties}',
                multipleConfigured: '{count} propiedades configuradas: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'Mostrar propiedades en filas separadas',
                desc: 'Mostrar cada propiedad en su propia fila.'
            },
            enablePropertyInternalLinks: {
                name: 'Vincular etiquetas de propiedad a notas',
                desc: 'Haz clic en una etiqueta de propiedad para abrir la nota vinculada.'
            },
            enablePropertyExternalLinks: {
                name: 'Vincular etiquetas de propiedad a URLs',
                desc: 'Haz clic en una etiqueta de propiedad para abrir la URL vinculada.'
            },
            dateFormat: {
                name: 'Formato de fecha',
                desc: 'Formato para mostrar fechas (usa formato Moment).',
                placeholder: 'D [de] MMMM [de] YYYY',
                help: 'Formatos comunes:\nD [de] MMMM [de] YYYY = 25 de mayo de 2022\nDD/MM/YYYY = 25/05/2022\nYYYY-MM-DD = 2022-05-25\n\nTokens:\nYYYY/YY = año\nMMMM/MMM/MM = mes\nDD/D = día\ndddd/ddd = día de la semana',
                helpTooltip: 'Formato usando Moment',
                momentLinkText: 'formato Moment'
            },
            timeFormat: {
                name: 'Formato de hora',
                desc: 'Formato para mostrar horas (usa formato Moment).',
                placeholder: 'HH:mm',
                help: 'Formatos comunes:\nHH:mm = 14:30 (24 horas)\nh:mm a = 2:30 PM (12 horas)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nTokens:\nHH/H = 24 horas\nhh/h = 12 horas\nmm = minutos\nss = segundos\na = AM/PM',
                helpTooltip: 'Formato usando Moment',
                momentLinkText: 'formato Moment'
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
            stripLatexInPreview: {
                name: 'Eliminar LaTeX en vistas previas',
                desc: 'Eliminar expresiones LaTeX en línea y en bloque del texto de vista previa.'
            },
            previewProperties: {
                name: 'Propiedades de vista previa',
                desc: 'Lista separada por comas de propiedades de frontmatter para buscar texto de vista previa. Se usará la primera propiedad con texto.',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'Recurrir al contenido de la nota',
                desc: 'Mostrar el contenido de la nota como vista previa cuando ninguna de las propiedades especificadas contiene texto.'
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
                    '2': '2 filas',
                    '3': '3 filas'
                }
            },
            useFolderColor: {
                name: 'Usar color de carpeta',
                desc: 'Colorear los títulos de notas y los iconos de archivo con el color de la carpeta principal cuando no hay un color de archivo personalizado. Prioridad: color de archivo personalizado > color de carpeta > color predeterminado.'
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
                desc: 'Lista separada por comas de propiedades del frontmatter a comprobar primero. Si no se encuentra, usa la primera imagen del contenido markdown.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'Excluir notas con propiedades',
                desc: 'Lista separada por comas de propiedades del frontmatter. Las notas que contengan cualquiera de estas propiedades no almacenan imágenes destacadas.',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: 'Tamaño de visualización de imagen destacada',
                desc: 'Tamaño máximo de renderizado para imágenes destacadas en listas de notas.',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'Tamaño en píxeles de imagen destacada',
                desc: 'Resolución utilizada al generar miniaturas almacenadas de imágenes destacadas. Aumente este valor si las previsualizaciones grandes se ven borrosas.',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'Descargar imágenes externas',
                desc: 'Descargar imágenes remotas y miniaturas de YouTube para imágenes destacadas.'
            },
            hideDrawingPreviewImages: {
                name: 'Ocultar imágenes de previsualización exportadas',
                desc: 'Oculta los archivos PNG de previsualización de dibujo exportados. Activa "Mostrar elementos ocultos" para verlos.'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator muestra los archivos PNG exportados por Excalidraw como previsualizaciones de los dibujos.',
                items: [
                    'En los **ajustes de Excalidraw**, abre **Embedding Excalidraw into your Notes and Exporting**, luego **Export Settings**, luego **Auto-export Settings**.',
                    'Activa **Auto-export PNG**. Opcionalmente activa **Export both dark- and light-themed image**.',
                    'Notebook Navigator busca **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** o **Drawing.excalidraw.light.png**.',
                    'Mientras **Ocultar imágenes de previsualización exportadas** esté activado, los archivos PNG solo aparecen cuando **Mostrar elementos ocultos** también lo está.'
                ]
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
            folderSortOrder: {
                name: 'Orden de carpetas',
                desc: 'Haz clic derecho en cualquier carpeta para establecer un orden diferente para sus elementos secundarios.',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A'
                }
            },
            showNoteCount: {
                name: 'Mostrar conteo de notas',
                desc: 'Muestra el conteo de notas junto a carpetas, etiquetas y propiedades.'
            },
            showSectionIcons: {
                name: 'Mostrar iconos para atajos y elementos recientes',
                desc: 'Muestra iconos junto a los elementos en las secciones Atajos y Recientes.'
            },
            interfaceIcons: {
                name: 'Iconos de interfaz',
                desc: 'Editar iconos de barra de herramientas, carpetas, etiquetas, propiedades, elementos fijados, búsqueda y ordenación.',
                buttonText: 'Editar iconos'
            },
            showIconsColorOnly: {
                name: 'Aplicar color solo a los iconos',
                desc: 'Cuando está habilitado, los colores personalizados se aplican solo a los iconos. Cuando está deshabilitado, los colores se aplican tanto a los iconos como a las etiquetas de texto.'
            },
            navRainbowMode: {
                name: 'Modo de colores arcoíris (perfil de bóveda)',
                desc: 'Aplicar colores arcoíris en el panel de navegación.',
                options: {
                    none: 'Desactivado',
                    foreground: 'Color de texto',
                    background: 'Color de fondo'
                }
            },
            navRainbowFirstColor: {
                name: 'Primer color',
                desc: 'Primer color en el degradado arcoíris.'
            },
            navRainbowLastColor: {
                name: 'Último color',
                desc: 'Último color en el degradado arcoíris.'
            },
            navRainbowTransitionStyle: {
                name: 'Estilo de transición',
                desc: 'Interpolación utilizada entre el primer y el último color.',
                options: {
                    hue: 'Tono',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'Aplicar a accesos directos',
                desc: 'Aplicar colores arcoíris a los accesos directos.'
            },
            navRainbowApplyToRecent: {
                name: 'Aplicar a elementos recientes',
                desc: 'Aplicar colores arcoíris a los elementos recientes.'
            },
            navRainbowApplyToFolders: {
                name: 'Aplicar a carpetas',
                desc: 'Aplicar colores arcoíris a las carpetas.'
            },
            navRainbowFolderScope: {
                name: 'Alcance de carpetas',
                desc: 'Seleccionar qué niveles de carpeta inician asignaciones de color.',
                options: {
                    root: 'Nivel raíz',
                    child: 'Nivel secundario',
                    all: 'Todos los niveles'
                }
            },
            navRainbowApplyToTags: {
                name: 'Aplicar a etiquetas',
                desc: 'Aplicar colores arcoíris a las etiquetas.'
            },
            navRainbowTagScope: {
                name: 'Alcance de etiquetas',
                desc: 'Seleccionar qué niveles de etiqueta inician asignaciones de color.',
                options: {
                    root: 'Nivel raíz',
                    child: 'Nivel secundario',
                    all: 'Todos los niveles'
                }
            },
            navRainbowApplyToProperties: {
                name: 'Aplicar a propiedades',
                desc: 'Aplicar colores arcoíris a las propiedades.'
            },
            navRainbowBalanceHueLuminance: {
                name: 'Brillo uniforme entre tonos', // (English: Consistent brightness across hues)
                desc: 'Interpola el brillo entre los colores de inicio y fin durante las transiciones de tono.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'Colores separados para modo claro y oscuro', // (English: Separate light and dark mode colors)
                desc: 'Usar colores de arcoíris diferentes para el modo claro y el modo oscuro.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'Copiar color del modo claro al modo oscuro', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'Alcance de propiedades',
                desc: 'Seleccionar qué niveles de propiedad inician asignaciones de color.',
                options: {
                    root: 'Nivel raíz',
                    child: 'Nivel secundario',
                    all: 'Todos los niveles'
                }
            },
            collapseBehavior: {
                name: 'Contraer elementos',
                desc: 'Elige qué afecta el botón de expandir/contraer todo.',
                options: {
                    all: 'Todo',
                    foldersOnly: 'Solo carpetas',
                    tagsOnly: 'Solo etiquetas',
                    propertiesOnly: 'Solo propiedades'
                }
            },
            smartCollapse: {
                name: 'Mantener elemento seleccionado expandido',
                desc: 'Al contraer, mantiene el elemento seleccionado y sus elementos principales expandidos.'
            },
            excludeVaultRootFromCollapse: {
                name: 'Omitir raíz de la bóveda al contraer',
                desc: 'Al contraer todos los elementos, deja la carpeta raíz de la bóveda en su estado actual.'
            },
            navIndent: {
                name: 'Sangría del árbol',
                desc: 'Ajustar el ancho de sangría para carpetas, etiquetas y propiedades anidadas (píxeles).'
            },
            navItemHeight: {
                name: 'Altura de línea',
                desc: 'Ajustar la altura de carpetas, etiquetas y propiedades en el panel de navegación (píxeles).'
            },
            navItemHeightScaleText: {
                name: 'Escalar texto con la altura de línea',
                desc: 'Reduce el texto de navegación cuando la altura de línea se disminuye.'
            },
            showIndentGuides: {
                name: 'Mostrar guías de sangría',
                desc: 'Mostrar guías de sangría para carpetas, etiquetas y propiedades anidadas.'
            },
            navCountLeaderStyle: {
                name: 'Mostrar guías de relleno',
                desc: 'Mostrar puntos, guiones o una línea entre los nombres de los elementos y el número de notas.',
                options: {
                    none: 'Ninguno',
                    dots: 'Puntos (...)',
                    dashes: 'Guiones (---)',
                    line: 'Línea'
                }
            },
            navRootSpacing: {
                name: 'Espaciado de elementos raíz',
                desc: 'Espaciado entre carpetas, etiquetas y propiedades de nivel superior (píxeles).'
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
                desc: 'Haz clic derecho en cualquier etiqueta para establecer un orden diferente para sus elementos secundarios.',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A',
                    frequency: 'Frecuencia',
                    lowToHigh: 'baja a alta',
                    highToLow: 'alta a baja'
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
            scopeTagsToCurrentContext: {
                name: 'Filtrar etiquetas por selección',
                desc: 'Mostrar solo etiquetas que aparecen en notas dentro de la carpeta o propiedad seleccionada.'
            },
            keepEmptyTagsProperty: {
                name: 'Conservar propiedad tags después de eliminar la última etiqueta',
                desc: 'Mantiene la propiedad tags en frontmatter cuando se eliminan todas las etiquetas. Cuando está desactivado, la propiedad tags se elimina del frontmatter.'
            },
            showProperties: {
                name: 'Mostrar propiedades',
                desc: 'Mostrar la sección de propiedades en el navegador.',
                propertyKeysInfoPrefix: 'Configurar propiedades en ',
                propertyKeysInfoLinkText: 'Inicio > Claves de propiedades',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'Mostrar iconos de propiedades',
                desc: 'Mostrar iconos junto a las propiedades en el panel de navegación.'
            },
            inheritPropertyColors: {
                name: 'Heredar colores de propiedad',
                desc: 'Los valores de propiedad heredan el color y el fondo de su clave de propiedad.'
            },
            propertySortOrder: {
                name: 'Orden de clasificación de propiedades',
                desc: 'Haga clic derecho en cualquier propiedad para establecer un orden de clasificación diferente para sus valores.',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A',
                    frequency: 'Frecuencia',
                    lowToHigh: 'de menor a mayor',
                    highToLow: 'de mayor a menor'
                }
            },
            showAllPropertiesFolder: {
                name: 'Mostrar carpeta de propiedades',
                desc: 'Mostrar "Propiedades" como una carpeta desplegable.'
            },
            scopePropertiesToCurrentContext: {
                name: 'Filtrar propiedades por selección',
                desc: 'Mostrar solo propiedades que aparecen en notas dentro de la carpeta o etiqueta seleccionada.'
            },
            hiddenTags: {
                name: 'Ocultar etiquetas (perfil de bóveda)',
                desc: 'Lista separada por comas de patrones de etiquetas. Patrones de nombre: tag* (empieza con), *tag (termina con). Patrones de ruta: archivo (etiqueta y descendientes), archivo/* (solo descendientes), proyectos/*/borradores (comodín intermedio).',
                placeholder: 'archivo*, *borrador, proyectos/*/antiguo'
            },
            hiddenFileTags: {
                name: 'Ocultar notas con etiquetas (perfil de bóveda)',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'Habilitar notas de carpeta',
                desc: 'Las carpetas con un archivo de nota correspondiente se muestran como enlaces clicables.'
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
                placeholder: 'index'
            },
            folderNoteNamePattern: {
                name: 'Patrón de nombre de nota de carpeta',
                desc: 'Patrón de nombre para notas de carpeta sin extensión. Usa {{folder}} para insertar el nombre de la carpeta. Cuando se establece, el nombre de nota de carpeta no se aplica.'
            },
            folderNoteTemplate: {
                name: 'Plantilla de nota de carpeta',
                desc: 'Archivo de plantilla usado al crear notas de carpeta. Las plantillas Markdown pueden usar Templater. Las plantillas Canvas y Base se copian como contenido del archivo. Establece la ubicación de la carpeta de plantillas en Operaciones de archivos > Plantillas.',
                formatWarning:
                    'El formato de la plantilla debe coincidir con el tipo de nota de carpeta seleccionado: .md, .canvas o .base.'
            },
            enableFolderNoteLinks: {
                name: 'Los nombres de carpeta abren notas de carpeta',
                desc: 'Al hacer clic en el nombre de una carpeta, se abre su nota de carpeta. Cuando está desactivado, las notas de carpeta solo proporcionan metadatos de carpeta como nombre, icono y color.'
            },
            hideFolderNoteInList: {
                name: 'Ocultar notas de carpeta en la lista',
                desc: 'Ocultar las notas de carpeta en la lista de archivos.'
            },
            pinCreatedFolderNote: {
                name: 'Anclar notas de carpeta creadas',
                desc: 'Fijar las notas de carpeta al crearlas desde el menú contextual.'
            },
            folderNoteOpenLocation: {
                name: 'Abrir notas de carpeta en',
                desc: 'Elige dónde se abren las notas de carpeta al hacer clic en enlaces de notas de carpeta.',
                options: {
                    currentTab: 'Pestaña actual',
                    newTab: 'Nueva pestaña',
                    rightSidebar: 'Barra lateral derecha'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: 'Barra lateral derecha: Mostrar nota de carpeta más cercana',
                desc: 'Cuando se selecciona una carpeta, la barra lateral derecha muestra automáticamente la nota de carpeta ancestro más cercana.'
            },
            confirmBeforeDelete: {
                name: 'Confirmar antes de eliminar',
                desc: 'Muestra un diálogo de confirmación al eliminar notas o carpetas'
            },
            deleteAttachments: {
                name: 'Eliminar adjuntos al eliminar archivos',
                desc: 'Eliminar automáticamente los adjuntos vinculados y las vistas previas de dibujos generadas si no se usan en otro lugar',
                options: {
                    ask: 'Preguntar cada vez',
                    always: 'Siempre',
                    never: 'Nunca'
                }
            },
            moveFileConflicts: {
                name: 'Conflictos de movimiento',
                desc: 'Al mover un archivo a una carpeta donde ya existe un archivo con el mismo nombre. Preguntar cada vez (renombrar, sobrescribir, cancelar) o siempre renombrar.',
                options: {
                    ask: 'Preguntar cada vez',
                    rename: 'Siempre renombrar'
                }
            },
            metadataCleanup: {
                name: 'Limpiar metadatos',
                desc: 'Elimina metadatos huérfanos dejados cuando archivos, carpetas, etiquetas o propiedades son eliminados, movidos o renombrados fuera de Obsidian. Esto solo afecta el archivo de configuración de Notebook Navigator.',
                buttonText: 'Limpiar metadatos',
                error: 'Falló la limpieza de configuración',
                loading: 'Verificando metadatos...',
                statusClean: 'No hay metadatos para limpiar',
                statusCounts:
                    'Elementos huérfanos: {folders} carpetas, {tags} etiquetas, {properties} propiedades, {files} archivos, {pinned} fijados, {separators} separadores'
            },
            rebuildCache: {
                name: 'Reconstruir caché',
                desc: 'Úselo si faltan etiquetas, las vistas previas son incorrectas o faltan imágenes. Esto puede ocurrir después de conflictos de sincronización o cierres inesperados.',
                buttonText: 'Reconstruir caché',
                error: 'Error al reconstruir caché',
                indexingTitle: 'Indexando la bóveda...',
                progress: 'Actualizando la caché de Notebook Navigator.'
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
                placeholder: 'title, name'
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
            frontmatterBackgroundField: {
                name: 'Campo de fondo',
                desc: 'Campo del frontmatter para colores de fondo. Dejar vacío para usar colores de fondo guardados en los ajustes.',
                placeholder: 'background'
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
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'Campo de marca de tiempo de modificación',
                desc: 'Nombre del campo del frontmatter para la marca de tiempo de modificación. Dejar vacío para usar solo la fecha del sistema.',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'Formato de marca de tiempo',
                desc: 'Formato utilizado para analizar marcas de tiempo en el frontmatter. Dejar vacío para usar parsing ISO 8601.',
                helpTooltip: 'Formato usando Moment',
                momentLinkText: 'formato Moment',
                help: 'Formatos comunes:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'Apoyar el desarrollo',
                desc: 'Si te encanta usar el Navegador de Cuadernos, considera apoyar su desarrollo continuo.',
                buttonText: '❤️ Patrocinar',
                coffeeButton: '☕️ Invítame un café'
            },
            updateCheckOnStart: {
                name: 'Buscar nueva versión al iniciar',
                desc: 'Busca nuevas versiones del complemento al iniciar y muestra una notificación cuando hay una actualización disponible. Las comprobaciones se realizan como máximo una vez al día.',
                status: 'Nueva versión disponible: {version}'
            },
            debugLogging: {
                name: 'Registro de depuración de inicio',
                desc: 'Escribe diagnósticos de inicio en un archivo Markdown con marca de tiempo en la raíz de la bóveda y se detiene cuando el inicio se estabiliza. El archivo puede sincronizarse y puede incluir rutas de archivos.'
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
        openBannerImage: 'Abrir imagen del banner de la versión',
        supportMessage: 'Si encuentras útil Notebook Navigator, considera apoyar su desarrollo.',
        supportButton: 'Invítame a un café',
        thanksButton: '¡Gracias!'
    }
};
