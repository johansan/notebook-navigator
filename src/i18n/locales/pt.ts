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
 * Portuguese (European) language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_PT = {
    // Common UI elements
    common: {
        cancel: 'Cancelar', // Button text for canceling dialogs and operations (English: Cancel)
        delete: 'Eliminar', // Button text for delete operations in dialogs (English: Delete)
        clear: 'Limpar', // Button text for clearing values (English: Clear)
        remove: 'Remover', // Button text for remove operations in dialogs (English: Remove)
        submit: 'Submeter', // Button text for submitting forms and dialogs (English: Submit)
        noSelection: 'Sem seleção', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Sem etiquetas', // Label for notes without any tags (English: Untagged)
        untitled: 'Sem título', // Default name for notes without a title (English: Untitled)
        featureImageAlt: 'Imagem de destaque', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Erro desconhecido', // Generic fallback when an error has no message (English: Unknown error)
        updateBannerTitle: 'Atualização do Notebook Navigator disponível',
        updateBannerInstruction: 'Atualize em Definições -> Plugins da comunidade',
        updateIndicatorLabel: 'Nova versão disponível'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Selecione uma pasta ou etiqueta para ver notas', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Sem notas', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Fixadas', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Notas', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Ficheiros', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (oculto)' // Accessibility label applied to list items that are normally hidden
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Sem etiquetas', // Label for the special item showing notes without tags (English: Untagged)
        hiddenTags: 'Etiquetas ocultas', // Label for the hidden tags virtual folder (English: Hidden tags)
        tags: 'Etiquetas' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Atalhos', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentNotesHeader: 'Notas recentes', // Header label for recent notes section in navigation pane (English: Recent notes)
        recentFilesHeader: 'Ficheiros recentes', // Header label when showing recent non-note files in navigation pane (English: Recent files)
        reorderRootFoldersTitle: 'Reordenar navegação',
        reorderRootFoldersHint: 'Use setas ou arraste para reordenar',
        vaultRootLabel: 'Cofre',
        resetRootToAlpha: 'Repor ordem alfabética',
        resetRootToFrequency: 'Repor ordem por frequência',
        pinShortcuts: 'Fixar atalhos',
        pinShortcutsAndRecentNotes: 'Fixar atalhos e notas recentes',
        pinShortcutsAndRecentFiles: 'Fixar atalhos e ficheiros recentes',
        unpinShortcuts: 'Desafixar atalhos',
        unpinShortcutsAndRecentNotes: 'Desafixar atalhos e notas recentes',
        unpinShortcutsAndRecentFiles: 'Desafixar atalhos e ficheiros recentes',
        profileMenuLabel: 'Perfil',
        profileMenuAria: 'Alterar perfil do cofre'
    },

    shortcuts: {
        folderExists: 'Pasta já está nos atalhos',
        noteExists: 'Nota já está nos atalhos',
        tagExists: 'Etiqueta já está nos atalhos',
        searchExists: 'Atalho de pesquisa já existe',
        emptySearchQuery: 'Introduza uma consulta de pesquisa antes de guardar',
        emptySearchName: 'Introduza um nome antes de guardar a pesquisa',
        add: 'Adicionar aos atalhos',
        addNotesCount: 'Adicionar {count} notas aos atalhos',
        addFilesCount: 'Adicionar {count} ficheiros aos atalhos',
        rename: 'Renomear atalho',
        remove: 'Remover dos atalhos',
        removeAll: 'Remover todos os atalhos',
        removeAllConfirm: 'Remover todos os atalhos?',
        folderNotesPinned: '{count} notas de pasta fixadas'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Recolher itens', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'Expandir todos os itens', // Tooltip for button that expands all items (English: Expand all items)
        scrollToTop: 'Deslocar para o topo',
        newFolder: 'Nova pasta', // Tooltip for create new folder button (English: New folder)
        newNote: 'Nova nota', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Voltar à navegação', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeSortOrder: 'Alterar ordem de ordenação', // Tooltip for the sort order toggle button (English: Change sort order)
        defaultSort: 'Predefinido', // Label for default sorting mode (English: Default)
        customSort: 'Personalizado', // Label for custom sorting mode (English: Custom)
        showFolders: 'Mostrar navegação', // Tooltip for button to show the navigation pane (English: Show navigation)
        hideFolders: 'Ocultar navegação', // Tooltip for button to hide the navigation pane (English: Hide navigation)
        reorderRootFolders: 'Reordenar navegação',
        finishRootFolderReorder: 'Concluído',
        toggleDescendantNotes: 'Mostrar notas de subpastas / descendentes', // Tooltip: include descendants for folders and tags
        autoExpandFoldersTags: 'Expandir ao selecionar', // Tooltip for button to toggle auto-expanding folders and tags when selected (English: Expand on selection)
        showExcludedItems: 'Mostrar pastas, etiquetas e notas ocultas', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Ocultar pastas, etiquetas e notas ocultas', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Mostrar painéis duplos', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Mostrar painel único', // Tooltip for button to show single-pane layout (English: Show single pane)
        changeAppearance: 'Alterar aparência', // Tooltip for button to change folder appearance settings (English: Change appearance)
        search: 'Pesquisar' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Pesquisar...', // Placeholder text for search input (English: Search...)
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Limpar pesquisa', // Tooltip for clear search button (English: Clear search)
        saveSearchShortcut: 'Guardar atalho de pesquisa',
        removeSearchShortcut: 'Remover atalho de pesquisa',
        shortcutModalTitle: 'Guardar atalho de pesquisa',
        shortcutNamePlaceholder: 'Introduza o nome do atalho'
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'Abrir em novo separador',
            openToRight: 'Abrir à direita',
            openInNewWindow: 'Abrir em nova janela',
            openMultipleInNewTabs: 'Abrir {count} notas em novos separadores',
            openMultipleFilesInNewTabs: 'Abrir {count} ficheiros em novos separadores',
            openMultipleToRight: 'Abrir {count} notas à direita',
            openMultipleFilesToRight: 'Abrir {count} ficheiros à direita',
            openMultipleInNewWindows: 'Abrir {count} notas em novas janelas',
            openMultipleFilesInNewWindows: 'Abrir {count} ficheiros em novas janelas',
            pinNote: 'Fixar nota',
            pinFile: 'Fixar ficheiro',
            unpinNote: 'Desafixar nota',
            unpinFile: 'Desafixar ficheiro',
            pinMultipleNotes: 'Fixar {count} notas',
            pinMultipleFiles: 'Fixar {count} ficheiros',
            unpinMultipleNotes: 'Desafixar {count} notas',
            unpinMultipleFiles: 'Desafixar {count} ficheiros',
            duplicateNote: 'Duplicar nota',
            duplicateFile: 'Duplicar ficheiro',
            duplicateMultipleNotes: 'Duplicar {count} notas',
            duplicateMultipleFiles: 'Duplicar {count} ficheiros',
            openVersionHistory: 'Abrir histórico de versões',
            revealInFolder: 'Revelar na pasta',
            revealInFinder: 'Revelar no Finder',
            showInExplorer: 'Mostrar no explorador do sistema',
            copyDeepLink: 'Copiar URL do Obsidian',
            copyPath: 'Copiar caminho do sistema de ficheiros',
            copyRelativePath: 'Copiar caminho do cofre',
            renameNote: 'Renomear nota',
            renameFile: 'Renomear ficheiro',
            deleteNote: 'Eliminar nota',
            deleteFile: 'Eliminar ficheiro',
            deleteMultipleNotes: 'Eliminar {count} notas',
            deleteMultipleFiles: 'Eliminar {count} ficheiros',
            moveNoteToFolder: 'Mover nota para...',
            moveFileToFolder: 'Mover ficheiro para...',
            moveMultipleNotesToFolder: 'Mover {count} notas para...',
            moveMultipleFilesToFolder: 'Mover {count} ficheiros para...',
            addTag: 'Adicionar etiqueta',
            removeTag: 'Remover etiqueta',
            removeAllTags: 'Remover todas as etiquetas',
            changeIcon: 'Alterar ícone',
            changeColor: 'Alterar cor'
        },
        folder: {
            newNote: 'Nova nota',
            newNoteFromTemplate: 'Nova nota a partir de modelo',
            newFolder: 'Nova pasta',
            newCanvas: 'Nova tela',
            newBase: 'Nova base de dados',
            newDrawing: 'Novo desenho',
            newExcalidrawDrawing: 'Novo desenho Excalidraw',
            newTldrawDrawing: 'Novo desenho Tldraw',
            duplicateFolder: 'Duplicar pasta',
            searchInFolder: 'Pesquisar na pasta',
            copyPath: 'Copiar caminho do sistema de ficheiros',
            copyRelativePath: 'Copiar caminho do cofre',
            createFolderNote: 'Criar nota de pasta',
            detachFolderNote: 'Desvincular nota de pasta',
            deleteFolderNote: 'Eliminar nota de pasta',
            changeIcon: 'Alterar ícone',
            changeColor: 'Alterar cor',
            changeBackground: 'Alterar fundo',
            excludeFolder: 'Ocultar pasta',
            unhideFolder: 'Mostrar pasta',
            moveFolder: 'Mover pasta para...',
            renameFolder: 'Renomear pasta',
            deleteFolder: 'Eliminar pasta'
        },
        tag: {
            changeIcon: 'Alterar ícone',
            changeColor: 'Alterar cor',
            changeBackground: 'Alterar fundo',
            showTag: 'Mostrar etiqueta',
            hideTag: 'Ocultar etiqueta'
        },
        navigation: {
            addSeparator: 'Adicionar separador',
            removeSeparator: 'Remover separador'
        },
        style: {
            title: 'Estilo',
            copy: 'Copiar estilo',
            paste: 'Colar estilo',
            removeIcon: 'Remover ícone',
            removeColor: 'Remover cor',
            removeBackground: 'Remover fundo',
            clear: 'Limpar estilo'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        standardPreset: 'Padrão',
        compactPreset: 'Compacto',
        defaultSuffix: '(predefinido)',
        titleRows: 'Linhas de título',
        previewRows: 'Linhas de pré-visualização',
        groupBy: 'Agrupar por',
        defaultOption: (rows: number) => `Predefinido (${rows})`,
        defaultTitleOption: (rows: number) => `Linhas de título predefinidas (${rows})`,
        defaultPreviewOption: (rows: number) => `Linhas de pré-visualização predefinidas (${rows})`,
        defaultGroupOption: (groupLabel: string) => `Agrupamento predefinido (${groupLabel})`,
        titleRowOption: (rows: number) => `${rows} linha${rows === 1 ? '' : 's'} de título`,
        previewRowOption: (rows: number) => `${rows} linha${rows === 1 ? '' : 's'} de pré-visualização`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'Pesquisar ícones...',
            recentlyUsedHeader: 'Usados recentemente',
            emptyStateSearch: 'Comece a escrever para pesquisar ícones',
            emptyStateNoResults: 'Nenhum ícone encontrado',
            showingResultsInfo: 'A mostrar 50 de {count} resultados. Escreva mais para refinar.',
            emojiInstructions: 'Escreva ou cole qualquer emoji para usar como ícone',
            removeIcon: 'Remover ícone',
            allTabLabel: 'Todos'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Adicionar regra'
        },
        interfaceIcons: {
            title: 'Ícones de interface',
            items: {
                'nav-shortcuts': 'Atalhos',
                'nav-recent-files': 'Ficheiros recentes',
                'nav-expand-all': 'Expandir tudo',
                'nav-collapse-all': 'Recolher tudo',
                'nav-tree-expand': 'Seta da árvore: expandir',
                'nav-tree-collapse': 'Seta da árvore: recolher',
                'nav-hidden-items': 'Itens ocultos',
                'nav-root-reorder': 'Reordenar pastas raiz',
                'nav-new-folder': 'Nova pasta',
                'nav-show-single-pane': 'Mostrar painel único',
                'nav-show-dual-pane': 'Mostrar painéis duplos',
                'nav-profile-chevron': 'Seta do menu de perfil',
                'list-search': 'Pesquisar',
                'list-descendants': 'Notas de subpastas',
                'list-sort-ascending': 'Ordem: crescente',
                'list-sort-descending': 'Ordem: decrescente',
                'list-appearance': 'Alterar aparência',
                'list-new-note': 'Nova nota',
                'nav-folder-open': 'Pasta aberta',
                'nav-folder-closed': 'Pasta fechada',
                'nav-tag': 'Etiqueta',
                'list-pinned': 'Itens fixados'
            }
        },
        colorPicker: {
            currentColor: 'Atual',
            newColor: 'Nova',
            presetColors: 'Cores predefinidas',
            userColors: 'Cores do utilizador',
            paletteDefault: 'Predefinido',
            paletteCustom: 'Personalizado',
            copyColors: 'Copiar cor',
            colorsCopied: 'Cor copiada para a área de transferência',
            copyClipboardError: 'Não foi possível escrever na área de transferência',
            pasteColors: 'Colar cor',
            pasteClipboardError: 'Não foi possível ler a área de transferência',
            pasteInvalidJson: 'A área de transferência não contém texto válido',
            pasteInvalidFormat: 'Esperado um valor de cor hex',
            colorsPasted: 'Cor colada com sucesso',
            resetUserColors: 'Limpar cores personalizadas',
            clearCustomColorsConfirm: 'Remover todas as cores personalizadas?',
            userColorSlot: 'Cor {slot}',
            recentColors: 'Cores recentes',
            clearRecentColors: 'Limpar cores recentes',
            removeRecentColor: 'Remover cor',
            removeColor: 'Remover cor',
            apply: 'Aplicar',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'Vermelho',
                orange: 'Laranja',
                amber: 'Âmbar',
                yellow: 'Amarelo',
                lime: 'Lima',
                green: 'Verde',
                emerald: 'Esmeralda',
                teal: 'Azul-petróleo',
                cyan: 'Ciano',
                sky: 'Céu',
                blue: 'Azul',
                indigo: 'Índigo',
                violet: 'Violeta',
                purple: 'Roxo',
                fuchsia: 'Fúcsia',
                pink: 'Rosa',
                rose: 'Rosado',
                gray: 'Cinzento',
                slate: 'Ardósia',
                stone: 'Pedra'
            }
        },
        selectVaultProfile: {
            title: 'Selecionar perfil do cofre',
            currentBadge: 'Ativo',
            emptyState: 'Nenhum perfil de cofre disponível.'
        },
        tagOperation: {
            renameTitle: 'Renomear etiqueta {tag}',
            deleteTitle: 'Eliminar etiqueta {tag}',
            newTagPrompt: 'Novo nome da etiqueta',
            newTagPlaceholder: 'Introduza o novo nome da etiqueta',
            renameWarning: 'Renomear a etiqueta {oldTag} irá modificar {count} {files}.',
            deleteWarning: 'Eliminar a etiqueta {tag} irá modificar {count} {files}.',
            modificationWarning: 'Isto irá atualizar as datas de modificação dos ficheiros.',
            affectedFiles: 'Ficheiros afetados:',
            andMore: '...e mais {count}',
            confirmRename: 'Renomear etiqueta',
            renameUnchanged: '{tag} inalterado',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            invalidTagName: 'Introduza um nome de etiqueta válido.',
            descendantRenameError: 'Não é possível mover uma etiqueta para si mesma ou um descendente.',
            confirmDelete: 'Eliminar etiqueta',
            file: 'ficheiro',
            files: 'ficheiros'
        },
        fileSystem: {
            newFolderTitle: 'Nova pasta',
            renameFolderTitle: 'Renomear pasta',
            renameFileTitle: 'Renomear ficheiro',
            deleteFolderTitle: "Eliminar '{name}'?",
            deleteFileTitle: "Eliminar '{name}'?",
            folderNamePrompt: 'Introduza o nome da pasta:',
            hideInOtherVaultProfiles: 'Ocultar noutros perfis do cofre',
            renamePrompt: 'Introduza o novo nome:',
            renameVaultTitle: 'Alterar nome de exibição do cofre',
            renameVaultPrompt: 'Introduza um nome de exibição personalizado (deixe vazio para usar o predefinido):',
            deleteFolderConfirm: 'Tem a certeza de que deseja eliminar esta pasta e todo o seu conteúdo?',
            deleteFileConfirm: 'Tem a certeza de que deseja eliminar este ficheiro?',
            removeAllTagsTitle: 'Remover todas as etiquetas',
            removeAllTagsFromNote: 'Tem a certeza de que deseja remover todas as etiquetas desta nota?',
            removeAllTagsFromNotes: 'Tem a certeza de que deseja remover todas as etiquetas de {count} notas?'
        },
        folderNoteType: {
            title: 'Selecionar tipo de nota de pasta',
            folderLabel: 'Pasta: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `Mover ${name} para pasta...`,
            multipleFilesLabel: (count: number) => `${count} ficheiros`,
            navigatePlaceholder: 'Navegar para pasta...',
            instructions: {
                navigate: 'para navegar',
                move: 'para mover',
                select: 'para selecionar',
                dismiss: 'para fechar'
            }
        },
        homepage: {
            placeholder: 'Pesquisar ficheiros...',
            instructions: {
                navigate: 'para navegar',
                select: 'para definir página inicial',
                dismiss: 'para fechar'
            }
        },
        navigationBanner: {
            placeholder: 'Pesquisar imagens...',
            instructions: {
                navigate: 'para navegar',
                select: 'para definir banner',
                dismiss: 'para fechar'
            }
        },
        tagSuggest: {
            placeholder: 'Pesquisar etiquetas...',
            navigatePlaceholder: 'Navegar para etiqueta...',
            addPlaceholder: 'Pesquisar etiqueta para adicionar...',
            removePlaceholder: 'Selecionar etiqueta para remover...',
            createNewTag: 'Criar nova etiqueta: #{tag}',
            instructions: {
                navigate: 'para navegar',
                select: 'para selecionar',
                dismiss: 'para fechar',
                add: 'para adicionar etiqueta',
                remove: 'para remover etiqueta'
            }
        },
        welcome: {
            title: 'Bem-vindo ao {pluginName}',
            introText:
                'Olá! Antes de começar, recomendo vivamente que veja os primeiros cinco minutos do vídeo abaixo para compreender como funcionam os painéis e o botão "Mostrar notas das subpastas".',
            continueText:
                'Se tiver mais cinco minutos, continue a ver o vídeo para compreender os modos de visualização compacta e como configurar corretamente os atalhos e teclas de atalho importantes.',
            thanksText: 'Muito obrigado por descarregar e divirta-se!',
            videoAlt: 'Instalar e dominar o Notebook Navigator',
            openVideoButton: 'Reproduzir vídeo',
            closeButton: 'Vou ver mais tarde'
        }
    },
    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Falha ao criar pasta: {error}',
            createFile: 'Falha ao criar ficheiro: {error}',
            renameFolder: 'Falha ao renomear pasta: {error}',
            renameFolderNoteConflict: 'Não é possível renomear: "{name}" já existe nesta pasta',
            renameFile: 'Falha ao renomear ficheiro: {error}',
            deleteFolder: 'Falha ao eliminar pasta: {error}',
            deleteFile: 'Falha ao eliminar ficheiro: {error}',
            duplicateNote: 'Falha ao duplicar nota: {error}',
            createCanvas: 'Falha ao criar tela: {error}',
            createDatabase: 'Falha ao criar base de dados: {error}',
            duplicateFolder: 'Falha ao duplicar pasta: {error}',
            openVersionHistory: 'Falha ao abrir histórico de versões: {error}',
            versionHistoryNotFound: 'Comando de histórico de versões não encontrado. Certifique-se de que o Obsidian Sync está ativado.',
            revealInExplorer: 'Falha ao revelar ficheiro no explorador do sistema: {error}',
            folderNoteAlreadyExists: 'A nota de pasta já existe',
            folderAlreadyExists: 'A pasta "{name}" já existe',
            folderNotesDisabled: 'Ative as notas de pasta nas definições para converter ficheiros',
            folderNoteAlreadyLinked: 'Este ficheiro já funciona como nota de pasta',
            folderNoteNotFound: 'Nenhuma nota de pasta na pasta selecionada',
            folderNoteUnsupportedExtension: 'Extensão de ficheiro não suportada: {extension}',
            folderNoteMoveFailed: 'Falha ao mover ficheiro durante a conversão: {error}',
            folderNoteRenameConflict: 'Já existe um ficheiro com o nome "{name}" na pasta',
            folderNoteConversionFailed: 'Falha ao converter ficheiro em nota de pasta',
            folderNoteConversionFailedWithReason: 'Falha ao converter ficheiro em nota de pasta: {error}',
            folderNoteOpenFailed: 'Ficheiro convertido mas falha ao abrir nota de pasta: {error}',
            failedToDeleteFile: 'Falha ao eliminar {name}: {error}',
            failedToDeleteMultipleFiles: 'Falha ao eliminar {count} ficheiros',
            versionHistoryNotAvailable: 'Serviço de histórico de versões não disponível',
            drawingAlreadyExists: 'Já existe um desenho com este nome',
            failedToCreateDrawing: 'Falha ao criar desenho',
            noFolderSelected: 'Nenhuma pasta selecionada no Notebook Navigator',
            noFileSelected: 'Nenhum ficheiro selecionado'
        },
        warnings: {
            linkBreakingNameCharacters: 'Este nome inclui caracteres que quebram ligações do Obsidian: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'Os nomes não podem começar com um ponto nem incluir : ou /.',
            forbiddenNameCharactersWindows: 'Caracteres reservados do Windows não são permitidos: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'Pasta ocultada: {name}',
            showFolder: 'Pasta mostrada: {name}'
        },
        notifications: {
            deletedMultipleFiles: '{count} ficheiros eliminados',
            movedMultipleFiles: '{count} ficheiros movidos para {folder}',
            folderNoteConversionSuccess: 'Ficheiro convertido em nota de pasta em "{name}"',
            folderMoved: 'Pasta "{name}" movida',
            deepLinkCopied: 'URL do Obsidian copiado para a área de transferência',
            pathCopied: 'Caminho copiado para a área de transferência',
            relativePathCopied: 'Caminho relativo copiado para a área de transferência',
            tagAddedToNote: 'Etiqueta adicionada a 1 nota',
            tagAddedToNotes: 'Etiqueta adicionada a {count} notas',
            tagRemovedFromNote: 'Etiqueta removida de 1 nota',
            tagRemovedFromNotes: 'Etiqueta removida de {count} notas',
            tagsClearedFromNote: 'Todas as etiquetas removidas de 1 nota',
            tagsClearedFromNotes: 'Todas as etiquetas removidas de {count} notas',
            noTagsToRemove: 'Sem etiquetas para remover',
            noFilesSelected: 'Nenhum ficheiro selecionado',
            tagOperationsNotAvailable: 'Operações de etiqueta não disponíveis',
            tagsRequireMarkdown: 'As etiquetas são suportadas apenas em notas Markdown',
            iconPackDownloaded: '{provider} transferido',
            iconPackUpdated: '{provider} atualizado ({version})',
            iconPackRemoved: '{provider} removido',
            iconPackLoadFailed: 'Falha ao carregar {provider}',
            hiddenFileReveal: 'O ficheiro está oculto. Ative "Mostrar itens ocultos" para o exibir'
        },
        confirmations: {
            deleteMultipleFiles: 'Tem a certeza de que deseja eliminar {count} ficheiros?',
            deleteConfirmation: 'Esta ação não pode ser anulada.'
        },
        defaultNames: {
            untitled: 'Sem título',
            untitledNumber: 'Sem título {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Não é possível mover uma pasta para si mesma ou uma subpasta.',
            itemAlreadyExists: 'Já existe um item com o nome "{name}" nesta localização.',
            failedToMove: 'Falha ao mover: {error}',
            failedToAddTag: 'Falha ao adicionar etiqueta "{tag}"',
            failedToClearTags: 'Falha ao limpar etiquetas',
            failedToMoveFolder: 'Falha ao mover pasta "{name}"',
            failedToImportFiles: 'Falha ao importar: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} ficheiros já existem no destino',
            addedTag: 'Etiqueta "{tag}" adicionada a {count} ficheiros',
            filesAlreadyHaveTag: '{count} ficheiros já têm esta etiqueta ou uma mais específica',
            clearedTags: 'Todas as etiquetas removidas de {count} ficheiros',
            noTagsToClear: 'Sem etiquetas para limpar',
            fileImported: '1 ficheiro importado',
            filesImported: '{count} ficheiros importados'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'Hoje',
        yesterday: 'Ontem',
        previous7Days: 'Últimos 7 dias',
        previous30Days: 'Últimos 30 dias'
    },

    // Weekdays
    weekdays: {
        sunday: 'Domingo',
        monday: 'Segunda-feira',
        tuesday: 'Terça-feira',
        wednesday: 'Quarta-feira',
        thursday: 'Quinta-feira',
        friday: 'Sexta-feira',
        saturday: 'Sábado'
    },

    // Plugin commands
    commands: {
        open: 'Abrir', // Command palette: Opens the Notebook Navigator view (English: Open)
        openHomepage: 'Abrir página inicial', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        revealFile: 'Revelar ficheiro', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Pesquisar', // Command palette: Toggle search in the file list (English: Search)
        toggleDualPane: 'Alternar layout de painel duplo', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        selectVaultProfile: 'Selecionar perfil do cofre', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'Selecionar perfil do cofre 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Selecionar perfil do cofre 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Selecionar perfil do cofre 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Eliminar ficheiros', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Criar nova nota', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Nova nota a partir de modelo', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Mover ficheiros', // Command palette: Move selected files to another folder (English: Move files)
        selectNextFile: 'Selecionar ficheiro seguinte', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Selecionar ficheiro anterior', // Command palette: Selects the previous file in the current view (English: Select previous file)
        convertToFolderNote: 'Converter em nota de pasta', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Definir como nota de pasta', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Desvincular nota de pasta', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Fixar todas as notas de pasta', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Navegar para pasta', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Navegar para etiqueta', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        addShortcut: 'Adicionar aos atalhos', // Command palette: Adds the current file, folder, or tag to shortcuts (English: Add to shortcuts)
        openShortcut: 'Abrir atalho {number}',
        toggleDescendants: 'Alternar descendentes', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Alternar pastas, etiquetas e notas ocultas', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Alternar ordem de ordenação de etiquetas', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        collapseExpand: 'Recolher / expandir todos os itens', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        addTag: 'Adicionar etiqueta aos ficheiros selecionados', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        removeTag: 'Remover etiqueta dos ficheiros selecionados', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Remover todas as etiquetas dos ficheiros selecionados', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        rebuildCache: 'Reconstruir cache' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Revelar no Notebook Navigator' // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Última modificação em',
        createdAt: 'Criado em',
        file: 'ficheiro',
        files: 'ficheiros',
        folder: 'pasta',
        folders: 'pastas'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'Relatório de metadados falhados exportado para: {filename}',
            exportFailed: 'Falha ao exportar relatório de metadados'
        },
        sections: {
            general: 'Geral',
            navigationPane: 'Painel de navegação',
            icons: 'Pacotes de ícones',
            folders: 'Pastas',
            foldersAndTags: 'Pastas e etiquetas',
            tags: 'Etiquetas',
            search: 'Pesquisa',
            searchAndHotkeys: 'Pesquisa e atalhos',
            listPane: 'Painel de lista',
            notes: 'Notas',
            hotkeys: 'Atalhos de teclado',
            advanced: 'Avançado'
        },
        groups: {
            general: {
                filtering: 'Filtragem',
                behavior: 'Comportamento',
                view: 'Aparência',
                icons: 'Ícones',
                desktopAppearance: 'Aparência no computador',
                formatting: 'Formatação'
            },
            navigation: {
                appearance: 'Aparência',
                shortcutsAndRecent: 'Atalhos e itens recentes'
            },
            list: {
                display: 'Aparência',
                pinnedNotes: 'Notas fixadas',
                quickActions: 'Ações rápidas'
            },
            notes: {
                frontmatter: 'Frontmatter',
                icon: 'Ícone',
                title: 'Título',
                previewText: 'Texto de pré-visualização',
                featureImage: 'Imagem de destaque',
                tags: 'Etiquetas',
                date: 'Data',
                parentFolder: 'Pasta superior'
            }
        },
        items: {
            searchProvider: {
                name: 'Fornecedor de pesquisa',
                desc: 'Escolha entre pesquisa rápida por nome de ficheiro ou pesquisa de texto completo com o plugin Omnisearch. (não sincronizado)',
                options: {
                    internal: 'Pesquisa com filtro',
                    omnisearch: 'Omnisearch (texto completo)'
                },
                info: {
                    filterSearch: {
                        title: 'Pesquisa com filtro (predefinido):',
                        description:
                            'Filtra ficheiros por nome e etiquetas na pasta atual e subpastas. Modo filtro: texto e etiquetas misturados correspondem a todos os termos (ex: "projeto #trabalho"). Modo etiquetas: pesquisa apenas com etiquetas suporta operadores AND/OR (ex: "#trabalho AND #urgente", "#projeto OR #pessoal"). Cmd/Ctrl+Clique em etiquetas para adicionar com AND, Cmd/Ctrl+Shift+Clique para adicionar com OR. Suporta exclusão com prefixo ! (ex: !rascunho, !#arquivo) e encontrar notas sem etiquetas com !#.'
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            'Pesquisa de texto completo em todo o cofre, depois filtra os resultados para mostrar apenas ficheiros da pasta atual, subpastas ou etiquetas selecionadas. Requer o plugin Omnisearch instalado - se não disponível, a pesquisa volta automaticamente para Pesquisa com filtro.',
                        warningNotInstalled: 'Plugin Omnisearch não instalado. A usar Pesquisa com filtro.',
                        limitations: {
                            title: 'Limitações conhecidas:',
                            performance: 'Desempenho: Pode ser lento, especialmente ao pesquisar menos de 3 caracteres em cofres grandes',
                            pathBug:
                                'Erro de caminho: Não consegue pesquisar em caminhos com caracteres não-ASCII e não pesquisa subcaminhos corretamente, afetando quais ficheiros aparecem nos resultados',
                            limitedResults:
                                'Resultados limitados: Como o Omnisearch pesquisa todo o cofre e retorna um número limitado de resultados antes de filtrar, ficheiros relevantes da pasta atual podem não aparecer se existirem muitas correspondências noutros locais',
                            previewText:
                                'Texto de pré-visualização: As pré-visualizações de notas são substituídas por excertos de resultados do Omnisearch, que podem não mostrar o destaque real da correspondência se aparecer noutro local do ficheiro'
                        }
                    }
                }
            },
            listPaneTitle: {
                name: 'Título do painel de lista (apenas computador)',
                desc: 'Escolha onde mostrar o título do painel de lista.',
                options: {
                    header: 'Mostrar no cabeçalho',
                    list: 'Mostrar no painel de lista',
                    hidden: 'Não mostrar'
                }
            },
            sortNotesBy: {
                name: 'Ordenar notas por',
                desc: 'Escolha como as notas são ordenadas na lista.',
                options: {
                    'modified-desc': 'Data de edição (mais recente no topo)',
                    'modified-asc': 'Data de edição (mais antiga no topo)',
                    'created-desc': 'Data de criação (mais recente no topo)',
                    'created-asc': 'Data de criação (mais antiga no topo)',
                    'title-asc': 'Título (A no topo)',
                    'title-desc': 'Título (Z no topo)'
                }
            },
            revealFileOnListChanges: {
                name: 'Deslocar para ficheiro selecionado em alterações da lista',
                desc: 'Deslocar para o ficheiro selecionado ao fixar notas, mostrar notas descendentes, alterar aparência da pasta ou executar operações de ficheiros.'
            },
            includeDescendantNotes: {
                name: 'Mostrar notas de subpastas / descendentes (não sincronizado)',
                desc: 'Incluir notas de subpastas aninhadas e descendentes de etiquetas ao visualizar uma pasta ou etiqueta.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Limitar notas fixadas à sua pasta',
                desc: 'As notas fixadas aparecem apenas ao visualizar a pasta ou etiqueta onde foram fixadas.'
            },
            separateNoteCounts: {
                name: 'Mostrar contagens atuais e descendentes separadamente',
                desc: 'Exibir contagens de notas no formato "atuais ▾ descendentes" em pastas e etiquetas.'
            },
            groupNotes: {
                name: 'Agrupar notas',
                desc: 'Exibir cabeçalhos entre notas agrupadas por data ou pasta. As vistas de etiquetas usam grupos de data quando o agrupamento por pasta está ativado.',
                options: {
                    none: 'Não agrupar',
                    date: 'Agrupar por data',
                    folder: 'Agrupar por pasta'
                }
            },
            showPinnedGroupHeader: {
                name: 'Mostrar cabeçalho do grupo fixado',
                desc: 'Exibir o cabeçalho da secção fixada acima das notas fixadas.'
            },
            showPinnedIcon: {
                name: 'Mostrar ícone de fixado',
                desc: 'Mostrar o ícone junto ao cabeçalho da secção fixada.'
            },
            defaultListMode: {
                name: 'Modo de lista predefinido',
                desc: 'Selecione o layout de lista predefinido. Padrão mostra título, data, descrição e texto de pré-visualização. Compacto mostra apenas o título. Substitua a aparência por pasta.',
                options: {
                    standard: 'Padrão',
                    compact: 'Compacto'
                }
            },
            showFileIcons: {
                name: 'Mostrar ícones de ficheiros',
                desc: 'Exibir ícones de ficheiros com espaçamento alinhado à esquerda. Desativar remove ícones e indentação. Prioridade: personalizado > nome de ficheiro > tipo de ficheiro > predefinido.'
            },
            showFilenameMatchIcons: {
                name: 'Ícones por nome de ficheiro',
                desc: 'Atribuir ícones a ficheiros com base no texto nos seus nomes.'
            },
            fileNameIconMap: {
                name: 'Mapa de ícones por nome',
                desc: 'Os ficheiros contendo o texto recebem o ícone especificado. Um mapeamento por linha: texto=ícone',
                placeholder: '# texto=ícone\nreunião=LiCalendar\nfatura=PhReceipt',
                editTooltip: 'Editar mapeamentos'
            },
            showCategoryIcons: {
                name: 'Ícones por tipo de ficheiro',
                desc: 'Atribuir ícones a ficheiros com base na sua extensão.'
            },
            fileTypeIconMap: {
                name: 'Mapa de ícones por tipo',
                desc: 'Os ficheiros com a extensão recebem o ícone especificado. Um mapeamento por linha: extensão=ícone',
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: 'Editar mapeamentos'
            },
            optimizeNoteHeight: {
                name: 'Altura de nota variável',
                desc: 'Usar altura compacta para notas fixadas e notas sem texto de pré-visualização.'
            },
            compactItemHeight: {
                name: 'Altura do item compacto',
                desc: 'Definir a altura dos itens de lista compacta no computador e telemóvel.',
                resetTooltip: 'Restaurar para predefinido (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Escalar texto com altura do item compacto',
                desc: 'Escalar texto da lista compacta quando a altura do item é reduzida.'
            },
            showParentFolder: {
                name: 'Mostrar pasta pai',
                desc: 'Exibir o nome da pasta pai para notas em subpastas ou etiquetas.'
            },
            parentFolderClickRevealsFile: {
                name: 'Clicar na pasta pai abre pasta',
                desc: 'Clicar na etiqueta da pasta pai abre a pasta no painel de lista.'
            },
            showParentFolderColor: {
                name: 'Mostrar cor da pasta pai',
                desc: 'Usar cores de pasta nas etiquetas de pasta pai.'
            },
            showQuickActions: {
                name: 'Mostrar ações rápidas (apenas computador)',
                desc: 'Mostrar botões de ação ao passar sobre ficheiros. Os controlos dos botões selecionam quais ações aparecem.'
            },
            dualPane: {
                name: 'Layout de painel duplo (não sincronizado)',
                desc: 'Mostrar painel de navegação e painel de lista lado a lado no computador.'
            },
            dualPaneOrientation: {
                name: 'Orientação do painel duplo (não sincronizado)',
                desc: 'Escolha layout horizontal ou vertical quando o painel duplo está ativo.',
                options: {
                    horizontal: 'Divisão horizontal',
                    vertical: 'Divisão vertical'
                }
            },
            appearanceBackground: {
                name: 'Cor de fundo',
                desc: 'Escolha cores de fundo para os painéis de navegação e lista.',
                options: {
                    separate: 'Fundos separados',
                    primary: 'Usar fundo da lista',
                    secondary: 'Usar fundo da navegação'
                }
            },
            appearanceScale: {
                name: 'Nível de zoom (não sincronizado)',
                desc: 'Controla o nível de zoom geral do Notebook Navigator.'
            },
            startView: {
                name: 'Vista de arranque predefinida',
                desc: 'Escolha qual painel exibir ao abrir o Notebook Navigator. O painel de navegação mostra atalhos, notas recentes e árvore de pastas. O painel de lista mostra a lista de notas imediatamente.',
                options: {
                    navigation: 'Painel de navegação',
                    files: 'Painel de lista'
                }
            },
            toolbarButtons: {
                name: 'Botões da barra de ferramentas',
                desc: 'Escolha quais botões aparecem na barra de ferramentas. Os botões ocultos permanecem acessíveis através de comandos e menus.',
                navigationLabel: 'Barra de ferramentas de navegação',
                listLabel: 'Barra de ferramentas da lista'
            },
            autoRevealActiveNote: {
                name: 'Revelar nota ativa automaticamente',
                desc: 'Revelar notas automaticamente quando abertas pelo Alternador Rápido, links ou pesquisa.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Ignorar eventos da barra lateral direita',
                desc: 'Não alterar a nota ativa ao clicar ou alterar notas na barra lateral direita.'
            },
            paneTransitionDuration: {
                name: 'Animação de painel único',
                desc: 'Duração da transição ao alternar entre painéis no modo de painel único (milissegundos).',
                resetTooltip: 'Repor predefinição'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Selecionar primeira nota automaticamente (apenas computador)',
                desc: 'Abrir automaticamente a primeira nota ao mudar de pastas ou etiquetas.'
            },
            skipAutoScroll: {
                name: 'Desativar deslocamento automático para atalhos',
                desc: 'Não deslocar o painel de navegação ao clicar em itens nos atalhos.'
            },
            autoExpandFoldersTags: {
                name: 'Expandir ao selecionar',
                desc: 'Expandir pastas e etiquetas quando selecionadas. No modo de painel único, a primeira seleção expande, a segunda mostra ficheiros.'
            },
            springLoadedFolders: {
                name: 'Expandir ao arrastar (apenas computador)',
                desc: 'Expandir pastas e etiquetas ao passar sobre elas durante o arrasto.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Atraso da primeira expansão',
                desc: 'Atraso antes de expandir a primeira pasta ou etiqueta durante um arrasto (segundos).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Atraso das expansões seguintes',
                desc: 'Atraso antes de expandir pastas ou etiquetas adicionais durante o mesmo arrasto (segundos).'
            },
            navigationBanner: {
                name: 'Banner de navegação (perfil do cofre)',
                desc: 'Exibir uma imagem acima do painel de navegação. Muda com o perfil do cofre selecionado.',
                current: 'Banner atual: {path}',
                chooseButton: 'Escolher imagem'
            },
            showShortcuts: {
                name: 'Mostrar atalhos',
                desc: 'Exibir a secção de atalhos no painel de navegação.'
            },
            shortcutBadgeDisplay: {
                name: 'Distintivo de atalho',
                desc: "O que exibir ao lado dos atalhos. Use os comandos 'Abrir atalho 1-9' para abrir atalhos diretamente.",
                options: {
                    index: 'Posição (1-9)',
                    count: 'Contagem de itens',
                    none: 'Nenhum'
                }
            },
            showRecentNotes: {
                name: 'Mostrar notas recentes',
                desc: 'Exibir a secção de notas recentes no painel de navegação.'
            },
            recentNotesCount: {
                name: 'Número de notas recentes',
                desc: 'Número de notas recentes a exibir.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Fixar notas recentes com atalhos',
                desc: 'Incluir notas recentes quando os atalhos estão fixos.'
            },
            showTooltips: {
                name: 'Mostrar dicas',
                desc: 'Exibir dicas ao passar com informações adicionais para notas e pastas.'
            },
            showTooltipPath: {
                name: 'Mostrar caminho',
                desc: 'Exibir o caminho da pasta abaixo dos nomes das notas nas dicas.'
            },
            resetPaneSeparator: {
                name: 'Repor posição do separador de painéis',
                desc: 'Repor o separador arrastável entre o painel de navegação e o painel de lista para a posição predefinida.',
                buttonText: 'Repor separador',
                notice: 'Posição do separador reposta. Reinicie o Obsidian ou reabra o Notebook Navigator para aplicar.'
            },
            multiSelectModifier: {
                name: 'Modificador de seleção múltipla (apenas computador)',
                desc: 'Escolha qual tecla modificadora alterna a seleção múltipla. Quando Option/Alt é selecionado, Cmd/Ctrl abre notas num novo separador.',
                options: {
                    cmdCtrl: 'Clique Cmd/Ctrl',
                    optionAlt: 'Clique Option/Alt'
                }
            },
            fileVisibility: {
                name: 'Mostrar tipos de ficheiro (perfil do cofre)',
                desc: 'Filtrar quais tipos de ficheiro são mostrados no navegador. Tipos de ficheiro não suportados pelo Obsidian podem abrir em aplicações externas.',
                options: {
                    documents: 'Documentos (.md, .canvas, .base)',
                    supported: 'Suportados (abre no Obsidian)',
                    all: 'Todos (pode abrir externamente)'
                }
            },
            homepage: {
                name: 'Página inicial',
                desc: 'Escolha o ficheiro que o Notebook Navigator abre automaticamente, como um painel de controlo.',
                current: 'Atual: {path}',
                currentMobile: 'Telemóvel: {path}',
                chooseButton: 'Escolher ficheiro',

                separateMobile: {
                    name: 'Página inicial separada para telemóvel',
                    desc: 'Usar uma página inicial diferente para dispositivos móveis.'
                }
            },
            excludedNotes: {
                name: 'Ocultar notas (perfil do cofre)',
                desc: 'Lista de propriedades frontmatter separadas por vírgulas. Notas contendo qualquer destas propriedades serão ocultadas (ex: rascunho, privado, arquivo).',
                placeholder: 'rascunho, privado'
            },
            excludedFileNamePatterns: {
                name: 'Ocultar ficheiros (perfil do cofre)',
                desc: 'Lista de padrões de nomes de ficheiros separados por vírgulas para ocultar. Suporta curingas * e caminhos / (ex: temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Perfil do cofre',
                desc: 'Os perfis armazenam visibilidade de tipos de ficheiro, ficheiros ocultos, pastas ocultas, etiquetas ocultas, notas ocultas, atalhos e banner de navegação. Mude de perfis a partir do cabeçalho do painel de navegação.',
                defaultName: 'Predefinido',
                addButton: 'Adicionar perfil',
                editProfilesButton: 'Editar perfis',
                addProfileOption: 'Adicionar perfil...',
                applyButton: 'Aplicar',
                editButton: 'Editar perfil',
                deleteButton: 'Eliminar perfil',
                addModalTitle: 'Adicionar perfil',
                editProfilesModalTitle: 'Editar perfis',
                editModalTitle: 'Editar perfil',
                addModalPlaceholder: 'Nome do perfil',
                deleteModalTitle: 'Eliminar {name}',
                deleteModalMessage:
                    'Remover {name}? Os filtros de ficheiros, pastas, etiquetas e notas ocultas guardados neste perfil serão eliminados.',
                moveUp: 'Mover para cima',
                moveDown: 'Mover para baixo',
                errors: {
                    emptyName: 'Introduza um nome de perfil',
                    duplicateName: 'Nome de perfil já existe'
                }
            },
            vaultTitle: {
                name: 'Posição do título do cofre (apenas desktop)',
                desc: 'Escolha onde o título do cofre é mostrado.',
                options: {
                    header: 'Mostrar no cabeçalho',
                    navigation: 'Mostrar no painel de navegação'
                }
            },
            excludedFolders: {
                name: 'Ocultar pastas (perfil do cofre)',
                desc: 'Lista de pastas a ocultar separadas por vírgulas. Padrões de nome: assets* (pastas começando com assets), *_temp (terminando com _temp). Padrões de caminho: /arquivo (apenas arquivo raiz), /res* (pastas raiz começando com res), /*/temp (pastas temp um nível abaixo), /projetos/* (todas as pastas dentro de projetos).',
                placeholder: 'modelos, assets*, /arquivo, /res*'
            },
            showFileDate: {
                name: 'Mostrar data',
                desc: 'Exibir a data abaixo dos nomes das notas.'
            },
            alphabeticalDateMode: {
                name: 'Ao ordenar por nome',
                desc: 'Data a mostrar quando as notas são ordenadas alfabeticamente.',
                options: {
                    created: 'Data de criação',
                    modified: 'Data de modificação'
                }
            },
            showFileTags: {
                name: 'Mostrar etiquetas de ficheiros',
                desc: 'Exibir etiquetas clicáveis nos itens de ficheiros.'
            },
            showFileTagAncestors: {
                name: 'Mostrar caminhos completos de etiquetas',
                desc: "Exibir caminhos completos da hierarquia de etiquetas. Quando ativado: 'ai/openai', 'trabalho/projetos/2024'. Quando desativado: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Colorir etiquetas de ficheiros',
                desc: 'Aplicar cores de etiquetas às badges de etiquetas nos itens de ficheiros.'
            },
            prioritizeColoredFileTags: {
                name: 'Mostrar etiquetas coloridas primeiro',
                desc: 'Ordenar etiquetas coloridas antes de outras etiquetas nos itens de ficheiros.'
            },
            showFileTagsInCompactMode: {
                name: 'Mostrar etiquetas de ficheiros no modo compacto',
                desc: 'Exibir etiquetas quando data, pré-visualização e imagem estão ocultas.'
            },
            dateFormat: {
                name: 'Formato de data',
                desc: 'Formato para exibir datas (usa formato date-fns).',
                placeholder: 'd MMM yyyy',
                help: 'Formatos comuns:\nd MMM yyyy = 25 Mai 2022\ndd/MM/yyyy = 25/05/2022\nyyyy-MM-dd = 2022-05-25\n\nTokens:\nyyyy/yy = ano\nMMMM/MMM/MM = mês\ndd/d = dia\nEEEE/EEE = dia da semana',
                helpTooltip: 'Clique para referência de formato'
            },
            timeFormat: {
                name: 'Formato de hora',
                desc: 'Formato para exibir horas (usa formato date-fns).',
                placeholder: 'HH:mm',
                help: 'Formatos comuns:\nh:mm a = 2:30 PM (12 horas)\nHH:mm = 14:30 (24 horas)\nh:mm:ss a = 2:30:45 PM\nHH:mm:ss = 14:30:45\n\nTokens:\nHH/H = 24 horas\nhh/h = 12 horas\nmm = minutos\nss = segundos\na = AM/PM',
                helpTooltip: 'Clique para referência de formato'
            },
            showFilePreview: {
                name: 'Mostrar pré-visualização da nota',
                desc: 'Exibir texto de pré-visualização abaixo dos nomes das notas.'
            },
            skipHeadingsInPreview: {
                name: 'Saltar cabeçalhos na pré-visualização',
                desc: 'Saltar linhas de cabeçalho ao gerar texto de pré-visualização.'
            },
            skipCodeBlocksInPreview: {
                name: 'Saltar blocos de código na pré-visualização',
                desc: 'Saltar blocos de código ao gerar texto de pré-visualização.'
            },
            stripHtmlInPreview: {
                name: 'Remover HTML nas pré-visualizações',
                desc: 'Remover etiquetas HTML do texto de pré-visualização. Pode afetar o desempenho em notas grandes.'
            },
            previewProperties: {
                name: 'Propriedades de pré-visualização',
                desc: 'Lista de propriedades frontmatter separadas por vírgulas para verificar texto de pré-visualização. A primeira propriedade com texto será usada.',
                placeholder: 'resumo, descrição, abstract',
                info: 'Se nenhum texto de pré-visualização for encontrado nas propriedades especificadas, a pré-visualização será gerada a partir do conteúdo da nota.'
            },
            previewRows: {
                name: 'Linhas de pré-visualização',
                desc: 'Número de linhas a exibir para texto de pré-visualização.',
                options: {
                    '1': '1 linha',
                    '2': '2 linhas',
                    '3': '3 linhas',
                    '4': '4 linhas',
                    '5': '5 linhas'
                }
            },
            fileNameRows: {
                name: 'Linhas de título',
                desc: 'Número de linhas a exibir para títulos de notas.',
                options: {
                    '1': '1 linha',
                    '2': '2 linhas'
                }
            },
            showFeatureImage: {
                name: 'Mostrar imagem de destaque',
                desc: 'Exibe uma miniatura da primeira imagem encontrada na nota.'
            },
            forceSquareFeatureImage: {
                name: 'Forçar imagem de destaque quadrada',
                desc: 'Renderizar imagens de destaque como miniaturas quadradas.'
            },
            featureImageProperties: {
                name: 'Propriedades de imagem',
                desc: 'Lista de propriedades frontmatter separadas por vírgulas para verificar imagens em miniatura.',
                placeholder: 'thumbnail, featureResized, feature'
            },

            downloadExternalFeatureImages: {
                name: 'Transferir imagens externas',
                desc: 'Transferir imagens remotas e miniaturas do YouTube para imagens de destaque.'
            },
            showRootFolder: {
                name: 'Mostrar pasta raiz',
                desc: 'Exibir o nome do cofre como a pasta raiz na árvore.'
            },
            showFolderIcons: {
                name: 'Mostrar ícones de pastas',
                desc: 'Exibir ícones junto às pastas no painel de navegação.'
            },
            inheritFolderColors: {
                name: 'Herdar cores de pastas',
                desc: 'Pastas filhas herdam a cor das pastas pai.'
            },
            showNoteCount: {
                name: 'Mostrar contagem de notas',
                desc: 'Exibir o número de notas junto a cada pasta e etiqueta.'
            },
            showSectionIcons: {
                name: 'Mostrar ícones para atalhos e itens recentes',
                desc: 'Exibir ícones para secções de navegação como Atalhos e Ficheiros recentes.'
            },
            interfaceIcons: {
                name: 'Ícones de interface',
                desc: 'Editar ícones da barra de ferramentas, pastas, etiquetas, itens fixados, pesquisa e ordenação.',
                buttonText: 'Editar ícones'
            },
            showIconsColorOnly: {
                name: 'Aplicar cor apenas aos ícones',
                desc: 'Quando ativado, as cores personalizadas são aplicadas apenas aos ícones. Quando desativado, as cores são aplicadas aos ícones e às etiquetas de texto.'
            },
            collapseBehavior: {
                name: 'Recolher itens',
                desc: 'Escolha o que o botão expandir/recolher tudo afeta.',
                options: {
                    all: 'Todas as pastas e etiquetas',
                    foldersOnly: 'Apenas pastas',
                    tagsOnly: 'Apenas etiquetas'
                }
            },
            smartCollapse: {
                name: 'Manter item selecionado expandido',
                desc: 'Ao recolher, manter a pasta ou etiqueta selecionada e os seus pais expandidos.'
            },
            navIndent: {
                name: 'Indentação da árvore',
                desc: 'Ajustar a largura de indentação para pastas e etiquetas aninhadas.'
            },
            navItemHeight: {
                name: 'Altura do item',
                desc: 'Ajustar a altura das pastas e etiquetas no painel de navegação.'
            },
            navItemHeightScaleText: {
                name: 'Escalar texto com altura do item',
                desc: 'Reduzir o tamanho do texto de navegação quando a altura do item é diminuída.'
            },
            navRootSpacing: {
                name: 'Espaçamento de itens raiz',
                desc: 'Espaçamento entre pastas e etiquetas de nível raiz.'
            },
            showTags: {
                name: 'Mostrar etiquetas',
                desc: 'Exibir a secção de etiquetas no navegador.'
            },
            showTagIcons: {
                name: 'Mostrar ícones de etiquetas',
                desc: 'Exibir ícones junto às etiquetas no painel de navegação.'
            },
            inheritTagColors: {
                name: 'Herdar cores das etiquetas',
                desc: 'As etiquetas filhas herdam a cor das etiquetas pai.'
            },
            tagSortOrder: {
                name: 'Ordem de ordenação de etiquetas',
                desc: 'Escolha como as etiquetas são ordenadas no painel de navegação. (não sincronizado)',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A',
                    frequencyAsc: 'Frequência (baixa para alta)',
                    frequencyDesc: 'Frequência (alta para baixa)'
                }
            },
            showAllTagsFolder: {
                name: 'Mostrar pasta de etiquetas',
                desc: 'Exibir "Etiquetas" como uma pasta recolhível.'
            },
            showUntagged: {
                name: 'Mostrar notas sem etiquetas',
                desc: 'Exibir item "Sem etiquetas" para notas sem etiquetas.'
            },
            keepEmptyTagsProperty: {
                name: 'Manter propriedade tags após remover última etiqueta',
                desc: 'Manter a propriedade tags do frontmatter quando todas as etiquetas são removidas. Quando desativado, a propriedade tags é eliminada do frontmatter.'
            },
            hiddenTags: {
                name: 'Ocultar etiquetas (perfil do cofre)',
                desc: 'Lista de padrões de etiquetas separados por vírgulas. Padrões de nome: tag* (começa com), *tag (termina com). Padrões de caminho: arquivo (etiqueta e descendentes), arquivo/* (apenas descendentes), projetos/*/rascunhos (curinga intermédio).',
                placeholder: 'arquivo*, *rascunho, projetos/*/antigo'
            },
            enableFolderNotes: {
                name: 'Ativar notas de pasta',
                desc: 'Quando ativado, pastas com notas associadas são exibidas como links clicáveis.'
            },
            folderNoteType: {
                name: 'Tipo de nota de pasta predefinido',
                desc: 'Tipo de nota de pasta criada a partir do menu de contexto.',
                options: {
                    ask: 'Perguntar ao criar',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'Nome da nota de pasta',
                desc: 'Nome da nota de pasta sem extensão. Deixe vazio para usar o mesmo nome que a pasta.',
                placeholder: 'index'
            },
            folderNoteProperties: {
                name: 'Propriedades da nota de pasta',
                desc: 'Frontmatter YAML adicionado a novas notas de pasta. Os marcadores --- são adicionados automaticamente.',
                placeholder: 'theme: dark\nfoldernote: true'
            },
            hideFolderNoteInList: {
                name: 'Ocultar nota de pasta na lista',
                desc: 'Ocultar a nota de pasta de aparecer na lista de notas da pasta.'
            },
            pinCreatedFolderNote: {
                name: 'Fixar notas de pasta criadas',
                desc: 'Fixar automaticamente notas de pasta quando criadas a partir do menu de contexto.'
            },
            confirmBeforeDelete: {
                name: 'Confirmar antes de eliminar',
                desc: 'Mostrar diálogo de confirmação ao eliminar notas ou pastas'
            },
            interceptTagClicks: {
                name: 'Navegar para etiquetas ao clicar',
                desc: 'Ao clicar em etiquetas nas notas, navegar para essa etiqueta no Notebook Navigator em vez de ativar a pesquisa do Obsidian.'
            },
            metadataCleanup: {
                name: 'Limpar metadados',
                desc: 'Remove metadados órfãos deixados quando ficheiros, pastas ou etiquetas são eliminados, movidos ou renomeados fora do Obsidian. Isto afeta apenas o ficheiro de definições do Notebook Navigator.',
                buttonText: 'Limpar metadados',
                error: 'Falha na limpeza de definições',
                loading: 'A verificar metadados...',
                statusClean: 'Sem metadados para limpar',
                statusCounts:
                    'Itens órfãos: {folders} pastas, {tags} etiquetas, {files} ficheiros, {pinned} fixados, {separators} separadores'
            },
            rebuildCache: {
                name: 'Reconstruir cache',
                desc: 'Use isto se tiver etiquetas em falta, pré-visualizações incorretas ou imagens de destaque em falta. Isto pode acontecer após conflitos de sincronização ou encerramentos inesperados.',
                buttonText: 'Reconstruir cache',
                success: 'Cache reconstruída',
                error: 'Falha ao reconstruir cache',
                indexingTitle: 'A indexar o cofre...',
                progress: 'A atualizar a cache do Notebook Navigator.'
            },
            hotkeys: {
                intro: 'Edite <plugin folder>/notebook-navigator/data.json para personalizar os atalhos de teclado do Notebook Navigator. Abra o ficheiro e localize a secção "keyboardShortcuts". Cada entrada usa esta estrutura:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Shift',
                    '"Ctrl" = Control (prefira "Mod" para multiplataforma)'
                ],
                guidance:
                    'Adicione múltiplos mapeamentos para suportar teclas alternativas, como os bindings ArrowUp e K mostrados acima. Combine modificadores numa entrada listando cada valor, por exemplo "modifiers": ["Mod", "Shift"]. Sequências de teclado como "gg" ou "dd" não são suportadas. Recarregue o Obsidian após editar o ficheiro.'
            },
            externalIcons: {
                downloadButton: 'Transferir',
                downloadingLabel: 'A transferir...',
                removeButton: 'Remover',
                statusInstalled: 'Transferido (versão {version})',
                statusNotInstalled: 'Não transferido',
                versionUnknown: 'desconhecido',
                downloadFailed: 'Falha ao transferir {name}. Verifique a sua ligação e tente novamente.',
                removeFailed: 'Falha ao remover {name}.',
                infoNote:
                    'Os pacotes de ícones transferidos sincronizam o estado de instalação entre dispositivos. Os pacotes de ícones permanecem na base de dados local em cada dispositivo; a sincronização apenas rastreia se devem ser transferidos ou removidos. Os pacotes de ícones são transferidos do repositório Notebook Navigator (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterDates: {
                name: 'Usar metadados frontmatter',
                desc: 'Usar frontmatter para nome da nota, timestamps, ícones e cores'
            },
            frontmatterIconField: {
                name: 'Campo de ícone',
                desc: 'Campo frontmatter para ícones de ficheiros. Deixe vazio para usar ícones guardados nas definições.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'Campo de cor',
                desc: 'Campo frontmatter para cores de ficheiros. Deixe vazio para usar cores guardadas nas definições.',
                placeholder: 'color'
            },
            frontmatterSaveMetadata: {
                name: 'Guardar ícones e cores no frontmatter',
                desc: 'Escrever automaticamente ícones e cores de ficheiros no frontmatter usando os campos configurados acima.'
            },
            frontmatterMigration: {
                name: 'Migrar ícones e cores das definições',
                desc: 'Guardados nas definições: {icons} ícones, {colors} cores.',
                button: 'Migrar',
                buttonWorking: 'A migrar...',
                noticeNone: 'Nenhum ícone ou cor de ficheiro guardado nas definições.',
                noticeDone: 'Migrados {migratedIcons}/{icons} ícones, {migratedColors}/{colors} cores.',
                noticeFailures: 'Entradas falhadas: {failures}.',
                noticeError: 'Migração falhou. Verifique a consola para detalhes.'
            },
            frontmatterNameField: {
                name: 'Campos de nome',
                desc: 'Lista de campos frontmatter separados por vírgula. O primeiro valor não vazio é usado. Usa o nome do ficheiro como alternativa.',
                placeholder: 'título, nome'
            },
            frontmatterCreatedField: {
                name: 'Campo de timestamp de criação',
                desc: 'Nome do campo frontmatter para o timestamp de criação. Deixe vazio para usar apenas a data do sistema de ficheiros.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'Campo de timestamp de modificação',
                desc: 'Nome do campo frontmatter para o timestamp de modificação. Deixe vazio para usar apenas a data do sistema de ficheiros.',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'Formato de timestamp',
                desc: 'Formato usado para analisar timestamps no frontmatter. Deixe vazio para usar formato ISO 8601',
                helpTooltip: 'Ver documentação de formato date-fns',
                help: "Formatos comuns:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'Apoiar desenvolvimento',
                desc: 'Se gosta de usar o Notebook Navigator, por favor considere apoiar o seu desenvolvimento contínuo.',
                buttonText: '❤️ Patrocinar',
                coffeeButton: '☕️ Compre-me um café'
            },
            updateCheckOnStart: {
                name: 'Verificar nova versão ao iniciar',
                desc: 'Verifica novos lançamentos do plugin ao iniciar e mostra uma notificação quando uma atualização está disponível. Cada versão é anunciada apenas uma vez, e as verificações ocorrem no máximo uma vez por dia.',
                status: 'Nova versão disponível: {version}'
            },
            whatsNew: {
                name: 'Novidades no Notebook Navigator {version}',
                desc: 'Ver atualizações e melhorias recentes',
                buttonText: 'Ver atualizações recentes'
            },
            masteringVideo: {
                name: 'Dominar o Notebook Navigator (vídeo)',
                desc: 'Este vídeo abrange tudo o que precisa para ser produtivo no Notebook Navigator, incluindo teclas de atalho, pesquisa, etiquetas e personalização avançada.'
            },
            cacheStatistics: {
                localCache: 'Cache local',
                items: 'itens',
                withTags: 'com etiquetas',
                withPreviewText: 'com texto de pré-visualização',
                withFeatureImage: 'com imagem de destaque',
                withMetadata: 'com metadados'
            },
            metadataInfo: {
                successfullyParsed: 'Analisados com sucesso',
                itemsWithName: 'itens com nome',
                withCreatedDate: 'com data de criação',
                withModifiedDate: 'com data de modificação',
                withIcon: 'com ícone',
                withColor: 'com cor',
                failedToParse: 'Falha ao analisar',
                createdDates: 'datas de criação',
                modifiedDates: 'datas de modificação',
                checkTimestampFormat: 'Verifique o seu formato de timestamp.',
                exportFailed: 'Exportar erros'
            }
        }
    },
    whatsNew: {
        title: 'Novidades no Notebook Navigator',
        supportMessage: 'Se acha o Notebook Navigator útil, por favor considere apoiar o seu desenvolvimento.',
        supportButton: 'Compre-me um café',
        thanksButton: 'Obrigado!'
    }
};
