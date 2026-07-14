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
        restoreDefault: 'Restaurar padrão', // Button text for restoring values to defaults (English: Restore default)
        submit: 'Submeter', // Button text for submitting forms and dialogs (English: Submit)
        save: 'Guardar', // Button text for saving settings and dialogs (English: Save)
        configure: 'Configurar', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'Modo claro', // Label for light theme mode (English: Light mode)
        darkMode: 'Modo escuro', // Label for dark theme mode (English: Dark mode)
        noSelection: 'Sem seleção', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Sem etiquetas', // Label for notes without any tags (English: Untagged)
        featureImageAlt: 'Imagem de destaque', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Erro desconhecido', // Generic fallback when an error has no message (English: Unknown error)
        clipboardWriteError: 'Não foi possível escrever na área de transferência',
        updateBannerTitle: 'Atualização do Notebook Navigator disponível',
        updateBannerInstruction: 'Atualize em Definições -> Plugins da comunidade',
        previous: 'Anterior', // Generic aria label for previous navigation (English: Previous)
        next: 'Seguinte' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Selecione uma pasta ou etiqueta para ver notas', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Sem notas', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Fixadas', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Notas', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Ficheiros', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (oculto)', // Accessibility label applied to list items that are normally hidden
        collapseGroup: 'Recolher grupo',
        expandGroup: 'Expandir grupo',
        manualSortTitle: 'Ordenação manual: {property}',
        manualSortHint: 'Arraste para reordenar. A ordem é guardada como valores de índice numéricos na propriedade "{property}".',
        manualSortNonMarkdownHint: 'Os ficheiros não Markdown são mostrados no fundo e não podem ser reordenados.',
        unsortedSection: 'Sem ordenação',
        manualSortDone: 'Concluído',
        manualSortMultipleWriteFailure: '{count} ficheiros falharam; primeiro: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Sem etiquetas', // Label for the special item showing notes without tags (English: Untagged)
        tags: 'Etiquetas' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Atalhos', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentFilesHeader: 'Ficheiros recentes', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Propriedades',
        reorderRootFoldersTitle: 'Reordenar navegação',
        reorderRootFoldersHint: 'Use setas ou arraste para reordenar',
        vaultRootLabel: 'Cofre',
        resetRootToAlpha: 'Repor ordem alfabética',
        resetRootToFrequency: 'Repor ordem por frequência',
        pinShortcuts: 'Fixar atalhos',
        pinShortcutsAndRecentFiles: 'Fixar atalhos e ficheiros recentes',
        unpinShortcuts: 'Desafixar atalhos',
        unpinShortcutsAndRecentFiles: 'Desafixar atalhos e ficheiros recentes',
        profileMenuAria: 'Alterar perfil do cofre'
    },

    navigationCalendar: {
        ariaLabel: 'Calendário',
        dailyNotesNotEnabled: 'O plugin de notas diárias não está ativado.',
        createDailyNote: {
            title: 'Nova nota diária',
            message: 'O ficheiro {filename} não existe. Deseja criá-lo?',
            confirmButton: 'Criar'
        },
        helpModal: {
            title: 'Atalhos do calendário',
            items: [
                'Clique em qualquer dia para abrir ou criar uma nota diária. Semanas, meses, trimestres e anos funcionam da mesma forma.',
                'Um ponto preenchido sob um dia significa que tem uma nota. Um ponto oco significa que tem tarefas inacabadas.',
                'Se uma nota tiver uma imagem de destaque, ela aparece como fundo do dia.'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+clique numa data para filtrar por essa data na lista de ficheiros.',
            dateFilterOptionAlt: '`Option/Alt`+clique numa data para filtrar por essa data na lista de ficheiros.'
        }
    },

    dailyNotes: {
        templateReadFailed: 'Falha ao ler o modelo de nota diária.',
        createFailed: 'Não foi possível criar a nota diária.'
    },

    shortcuts: {
        folderExists: 'Pasta já está nos atalhos',
        noteExists: 'Nota já está nos atalhos',
        tagExists: 'Etiqueta já está nos atalhos',
        propertyExists: 'Propriedade já está nos atalhos',
        invalidProperty: 'Atalho de propriedade inválido',
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
        showCalendar: 'Mostrar calendário',
        hideCalendar: 'Ocultar calendário',
        newFolder: 'Nova pasta', // Tooltip for create new folder button (English: New folder)
        newNote: 'Nova nota', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Voltar à navegação', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeChildSortOrder: 'Alterar ordem de ordenação',
        changeSortAndGroup: 'Alterar ordenação e agrupamento',
        resetViewToDefaults: 'Repor vista para predefinições',
        manualSort: 'Ordenação manual',
        editSortOrder: 'Editar ordenação...',
        removeSortProperty: 'Remover propriedade de ordenação',
        descendants: 'descendentes',
        subfolders: 'subpastas',
        subtags: 'subetiquetas',
        childValues: 'valores secundários',
        applySortAndGroupToDescendants: (target: string) => `Aplicar ordenação e agrupamento a ${target}`,
        applyAppearanceToDescendants: (target: string) => `Aplicar aparência a ${target}`,
        showFolders: 'Mostrar navegação', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: 'Reordenar navegação',
        finishRootFolderReorder: 'Concluído',
        showExcludedItems: 'Mostrar pastas, etiquetas e notas ocultas', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Ocultar pastas, etiquetas e notas ocultas', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Mostrar painéis duplos', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Mostrar painel único', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            'Os painéis duplos não estão disponíveis quando a barra lateral é demasiado estreita. Para alterar isto, defina "Quando a barra lateral é demasiado estreita" como "Não fazer nada" em Definições > Aparência e comportamento.',
        changeAppearance: 'Alterar aparência', // Tooltip for button to change folder appearance settings (English: Change appearance)
        showNotesFromSubfolders: 'Mostrar notas de subpastas',
        showFilesFromSubfolders: 'Mostrar ficheiros de subpastas',
        showNotesFromDescendants: 'Mostrar notas de descendentes',
        showFilesFromDescendants: 'Mostrar ficheiros de descendentes',
        search: 'Pesquisar' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Pesquisar...', // Placeholder text for search input (English: Search...)
        placeholderVault: 'Pesquisar no cofre...',
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Limpar pesquisa', // Tooltip for clear search button (English: Clear search)
        switchToFilterSearch: 'Mudar para pesquisa por filtro',
        switchToOmnisearch: 'Mudar para Omnisearch',
        saveSearchShortcut: 'Guardar atalho de pesquisa',
        removeSearchShortcut: 'Remover atalho de pesquisa',
        shortcutModalTitle: 'Guardar atalho de pesquisa',
        shortcutNamePlaceholder: 'Introduza o nome do atalho',
        shortcutStartIn: 'Iniciar sempre em: {path}',
        searchHelp: 'Sintaxe de pesquisa',
        searchHelpTitle: 'Sintaxe de pesquisa',
        searchHelpModal: {
            intro: 'Combine nomes de ficheiros, propriedades, etiquetas, datas e filtros numa consulta (ex. `meeting .status=active #work @thisweek`). Instale o plugin Omnisearch para usar pesquisa de texto completo.',
            introSwitching:
                'Alterne entre pesquisa por filtro e Omnisearch usando as teclas de seta para cima/baixo ou clicando no ícone de pesquisa.',
            sections: {
                fileNames: {
                    title: 'Nomes de ficheiros',
                    items: [
                        '`word` Encontrar notas com "word" no nome do ficheiro.',
                        '`word1 word2` Cada palavra deve corresponder ao nome do ficheiro.',
                        '`-word` Excluir notas com "word" no nome do ficheiro.'
                    ]
                },
                tags: {
                    title: 'Etiquetas',
                    items: [
                        '`#tag` Incluir notas com etiqueta (também corresponde a etiquetas aninhadas como `#tag/subtag`).',
                        '`#` Incluir apenas notas com etiquetas.',
                        '`-#tag` Excluir notas com etiqueta.',
                        '`-#` Incluir apenas notas sem etiquetas.',
                        '`#tag1 #tag2` Corresponder a ambas as etiquetas (AND implícito).',
                        '`#tag1 AND #tag2` Corresponder a ambas as etiquetas (AND explícito).',
                        '`#tag1 OR #tag2` Corresponder a qualquer uma das etiquetas.',
                        '`#a OR #b AND #c` AND tem precedência maior: corresponde a `#a`, ou ambos `#b` e `#c`.',
                        'Cmd/Ctrl+Clique numa etiqueta para adicionar com AND. Cmd/Ctrl+Shift+Clique para adicionar com OR.'
                    ]
                },
                properties: {
                    title: 'Propriedades',
                    items: [
                        '`.key` Incluir notas com chave de propriedade.',
                        '`.key=value` Incluir notas cujo valor de propriedade contenha `value`.',
                        '`."Reading Status"` Incluir notas com uma chave de propriedade que contém espaços.',
                        '`."Reading Status"="In Progress"` Chaves e valores com espaços devem estar entre aspas duplas.',
                        '`-.key` Excluir notas com chave de propriedade.',
                        '`-.key=value` Excluir notas cujo valor de propriedade contenha `value`.',
                        'Cmd/Ctrl+Clique numa propriedade para adicionar com AND. Cmd/Ctrl+Shift+Clique para adicionar com OR.'
                    ]
                },
                tasks: {
                    title: 'Filtros',
                    items: [
                        '`has:task` Incluir notas com tarefas por concluir.',
                        '`-has:task` Excluir notas com tarefas por concluir.',
                        '`folder:meetings` Incluir notas onde um nome de pasta contém `meetings`.',
                        '`folder:/work/meetings` Incluir notas apenas em `work/meetings` (não subpastas).',
                        '`folder:/` Incluir notas apenas na raiz do cofre.',
                        '`-folder:archive` Excluir notas onde um nome de pasta contém `archive`.',
                        '`-folder:/archive` Excluir notas apenas em `archive` (não subpastas).',
                        '`ext:md` Incluir notas com extensão `md` (`ext:.md` também é suportado).',
                        '`-ext:pdf` Excluir notas com extensão `pdf`.',
                        'Combinar com etiquetas, nomes e datas (por exemplo: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'Comportamento AND/OR',
                    items: [
                        '`AND` e `OR` são operadores apenas em consultas exclusivas de tags e propriedades.',
                        'As consultas exclusivas de tags e propriedades contêm apenas filtros de tags e propriedades: `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`.',
                        'Se uma consulta incluir nomes, datas (`@...`), filtros de tarefas (`has:task`), filtros de pasta (`folder:...`) ou filtros de extensão (`ext:...`), `AND` e `OR` são pesquisados como palavras.',
                        'Exemplo de consulta com operadores: `#work OR .status=started`.',
                        'Exemplo de consulta mista: `#work OR ext:md` (`OR` é pesquisado nos nomes dos ficheiros).'
                    ]
                },
                dates: {
                    title: 'Datas',
                    items: [
                        '`@today` Encontrar notas de hoje usando o campo de data predefinido.',
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` Intervalos de datas relativos.',
                        '`@2026-02-07` Encontrar um dia específico (também suporta `@20260207`).',
                        '`@2026` Encontrar um ano civil.',
                        '`@2026-02` ou `@202602` Encontrar um mês civil.',
                        '`@2026-W05` ou `@2026W05` Encontrar uma semana ISO.',
                        '`@2026-Q2` ou `@2026Q2` Encontrar um trimestre civil.',
                        '`@13/02/2026` Formatos numéricos com separadores (`@07022026` segue a sua localização quando ambíguo).',
                        '`@2026-02-01..2026-02-07` Encontrar um intervalo de dias inclusivo (extremos abertos suportados).',
                        '`@c:...` ou `@m:...` Visar data de criação ou modificação.',
                        '`-@...` Excluir uma correspondência de data.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'Pesquisa de texto completo em todo o cofre, filtrada pela pasta atual ou etiquetas selecionadas.',
                        'Pode ser lento com menos de 3 caracteres em cofres grandes.',
                        'Não consegue pesquisar caminhos com caracteres não-ASCII ou pesquisar subcaminhos corretamente.',
                        'Retorna resultados limitados antes da filtragem por pasta, pelo que ficheiros relevantes podem não aparecer se existirem muitas correspondências noutros locais.',
                        'As pré-visualizações das notas mostram excertos do Omnisearch em vez do texto de pré-visualização predefinido.'
                    ]
                }
            }
        }
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
            openInDefaultApp: 'Abrir na aplicação predefinida',
            renameNote: 'Renomear nota',
            renameFile: 'Renomear ficheiro',
            deleteNote: 'Eliminar nota',
            deleteFile: 'Eliminar ficheiro',
            setCalendarHighlight: 'Definir destaque',
            removeCalendarHighlight: 'Remover destaque',
            deleteMultipleNotes: 'Eliminar {count} notas',
            deleteMultipleFiles: 'Eliminar {count} ficheiros',
            moveNoteToFolder: 'Mover nota para...',
            moveFileToFolder: 'Mover ficheiro para...',
            moveMultipleNotesToFolder: 'Mover {count} notas para...',
            moveMultipleFilesToFolder: 'Mover {count} ficheiros para...',
            mergeNotes: 'Unir {count} notas...',
            mergeNotesInGroup: 'Unir notas no grupo...',
            setManualSortGroupHeader: 'Definir cabeçalho de grupo',
            changeManualSortGroupHeader: 'Alterar cabeçalho de grupo',
            manualSortGroupHeader: {
                title: 'Cabeçalho de grupo',
                copyStyle: 'Copiar estilo de cabeçalho',
                pasteStyle: 'Colar estilo de cabeçalho',
                remove: 'Remover cabeçalho de grupo'
            },
            addTag: 'Adicionar etiqueta',
            addPropertyKey: 'Definir propriedade',
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
            createFolderNote: 'Criar nota de pasta',
            detachFolderNote: 'Desvincular nota de pasta',
            deleteFolderNote: 'Eliminar nota de pasta',
            changeIcon: 'Alterar ícone',
            changeColor: 'Alterar cor',
            changeBackground: 'Alterar fundo',
            excludeFolder: 'Ocultar pasta',
            unhideFolder: 'Mostrar pasta',
            excludeFromDescendants: 'Ocultar nas pastas principais',
            includeInDescendants: 'Mostrar nas pastas principais',
            hiddenFromParentsIndicator: 'Oculta nas listas das pastas principais',
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
        property: {
            addKey: 'Configurar chaves de propriedade',
            renameKey: 'Renomear propriedade',
            deleteKey: 'Eliminar propriedade'
        },
        navigation: {
            addSeparator: 'Adicionar separador',
            removeSeparator: 'Remover separador'
        },
        copyPath: {
            title: 'Copiar caminho',
            asObsidianUrl: 'como URL do Obsidian',
            fromVaultFolder: 'a partir da pasta do cofre',
            fromSystemRoot: 'a partir da raiz do sistema'
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
        appearance: 'Aparência',
        sortBy: 'Ordenar por',
        standardPreset: 'Padrão',
        compactPreset: 'Compacto',
        defaultSuffix: '(predefinido)',
        defaultLabel: 'Predefinido',
        titleRows: 'Linhas de título',
        previewRows: 'Linhas de pré-visualização',
        groupBy: 'Agrupar por',
        titleRowOption: (rows: number) => `${rows} linha${rows === 1 ? '' : 's'} de título`,
        previewRowOption: (rows: number) => `${rows} linha${rows === 1 ? '' : 's'} de pré-visualização`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Aplicar',
            applySortAndGroupTitle: (target: string) => `Aplicar ordenação e agrupamento a ${target}?`,
            applyAppearanceTitle: (target: string) => `Aplicar aparência a ${target}?`,
            affectedCountMessage: (count: number) => `Substituições existentes que serão alteradas: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'Usar ordenação manual?',
            propertySortMessage: (property: string, count: number) =>
                `Isto muda a vista atual para ordenação manual usando "${property}". Editar a ordem escreve valores de índice numéricos nessa propriedade em ${count} ${count === 1 ? 'nota' : 'notas'} conforme necessário.`,
            propertySortConfirmButton: 'Usar ordenação manual',
            removePropertyTitle: 'Remover propriedade de ordenação?',
            removePropertyMessage: (property: string, count: number) =>
                `Isto remove "${property}" de ${count} ${count === 1 ? 'nota' : 'notas'} na lista atual. A ordem de ordenação manual será apagada para essas notas.`,
            removePropertyConfirmButton: 'Remover propriedade',
            compactTitle: 'Compactar valores de índice?',
            compactMessage: (count: number) =>
                `Esta reordenação precisa de mais espaço numérico. ${count} ${count === 1 ? 'nota receberá' : 'notas receberão'} novos valores de índice.`,
            compactConfirmButton: 'Compactar valores de índice'
        },
        manualSortGroupHeader: {
            title: 'Definir cabeçalho de grupo',
            titleLabel: 'Título',
            placeholder: 'Cabeçalho de grupo',
            icon: 'Ícone',
            color: 'Cor',
            wordCount: 'Mostrar contagem de palavras',
            wordCountTarget: 'Contagem de palavras objetivo',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'Quando este campo está vazio, o objetivo do grupo usa a propriedade de objetivo definida em Definições > Notas > Contagem de palavras e caracteres. Substitua-a definindo um valor de objetivo para este grupo.',
            description: 'Personalize o cabeçalho de grupo para esta nota. Deixe o título vazio para remover o cabeçalho.'
        },
        mergeNotes: {
            title: 'Unir notas',
            summary: 'Criar uma nota a partir de {count} notas em {folder}.',
            frontmatterRule: 'O frontmatter da primeira nota é mantido. O frontmatter das outras notas é removido.',
            crossFolderWarning:
                'As notas de origem estão em pastas diferentes. Links relativos e incorporações podem deixar de funcionar na nota unida.',
            outputName: 'Nome de saída',
            outputNameDesc: 'A nota unida é criada na pasta mostrada acima.',
            outputNamePlaceholder: 'Notas unidas',
            separator: 'Separador',
            separatorDesc: 'Inserido entre notas.',
            separatorOptions: {
                none: 'Nenhum',
                blankLine: 'Linha em branco',
                horizontalRule: 'Linha horizontal',
                heading: 'Cabeçalho com o título da nota'
            },
            moveSourcesToTrash: 'Mover notas de origem para o lixo após unir',
            mergeButton: 'Unir'
        },
        navRainbowSection: {
            title: (section: string) => `Cores arco-íris: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'Pesquisar ícones...',
            recentlyUsedHeader: 'Usados recentemente',
            emptyStateSearch: 'Comece a escrever para pesquisar ícones',
            emptyStateNoResults: 'Nenhum ícone encontrado',
            showingResultsInfo: 'A mostrar 50 de {count} resultados. Escreva mais para refinar.',
            emojiInstructions: 'Escreva ou cole qualquer emoji para usar como ícone',
            removeIcon: 'Remover ícone',
            removeFromRecents: 'Remover dos recentes',
            allTabLabel: 'Todos'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Adicionar regra'
        },
        interfaceIcons: {
            title: 'Ícones de interface',
            fileItemsSection: 'Itens de ficheiro',
            items: {
                'nav-shortcuts': 'Atalhos',
                'nav-recent-files': 'Ficheiros recentes',
                'nav-expand-all': 'Expandir tudo',
                'nav-collapse-all': 'Recolher tudo',
                'nav-calendar': 'Calendário',
                'nav-tree-expand': 'Seta da árvore: expandir',
                'nav-tree-collapse': 'Seta da árvore: recolher',
                'nav-hidden-items': 'Itens ocultos',
                'nav-root-reorder': 'Reordenar pastas raiz',
                'nav-new-folder': 'Nova pasta',
                'nav-show-single-pane': 'Mostrar painel único',
                'nav-show-dual-pane': 'Mostrar painéis duplos',
                'nav-profile-chevron': 'Seta do menu de perfil',
                'list-search': 'Pesquisar',
                'list-reveal-file': 'Revelar ficheiro',
                'list-descendants': 'Notas de subpastas',
                'list-sort-ascending': 'Ordem: crescente',
                'list-sort-descending': 'Ordem: decrescente',
                'list-sort-modified': 'Ordenar por data de edição',
                'list-sort-created': 'Ordenar por data de criação',
                'list-sort-title': 'Ordenar por título',
                'list-sort-filename': 'Ordenar por nome do ficheiro',
                'list-sort-property': 'Ordenar por propriedade',
                'list-appearance': 'Alterar aparência',
                'list-new-note': 'Nova nota',
                'list-pinned': 'Notas fixadas',
                'nav-folder-open': 'Pasta aberta',
                'nav-folder-closed': 'Pasta fechada',
                'nav-tags': 'Etiquetas',
                'nav-tag': 'Etiqueta',
                'nav-properties': 'Propriedades',
                'nav-property': 'Propriedade',
                'nav-property-value': 'Valor',
                'file-unfinished-task': 'Tarefas inacabadas',
                'file-word-count': 'Contagem de palavras',
                'file-character-count': 'Contagem de caracteres'
            }
        },
        colorPicker: {
            currentColor: 'Atual',
            newColor: 'Nova',
            paletteDefault: 'Predefinido',
            paletteCustom: 'Personalizado',
            copyColors: 'Copiar cor',
            colorsCopied: 'Cor copiada para a área de transferência',
            pasteColors: 'Colar cor',
            pasteClipboardError: 'Não foi possível ler a área de transferência',
            pasteInvalidFormat: 'Esperado um valor de cor hex',
            colorsPasted: 'Cor colada com sucesso',
            resetUserColors: 'Limpar cores personalizadas',
            clearCustomColorsConfirm: 'Remover todas as cores personalizadas?',
            userColorSlot: 'Cor {slot}',
            recentColors: 'Cores recentes',
            clearRecentColors: 'Limpar cores recentes',
            removeRecentColor: 'Remover cor',
            apply: 'Aplicar',
            pickerLabel: 'Seletor',
            hexLabel: 'HEX',
            hexInputLabel: 'Valor de cor hexadecimal',
            saturationValueArea: 'Saturação e brilho',
            hueSlider: 'Matiz',
            alphaSlider: 'Transparência'
        },
        appearance: {
            tabIcon: 'Ícone',
            tabColor: 'Cor',
            tabBackground: 'Fundo',
            resetIcon: 'Remover ícone',
            resetColor: 'Remover cor',
            resetBackground: 'Remover fundo',
            clear: 'Limpar estilo',
            apply: 'Aplicar'
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
            renameBatchNotFinalized:
                'Renomeados {renamed}/{total}. Não atualizados: {notUpdated}. Metadados e atalhos não foram atualizados.',
            invalidTagName: 'Introduza um nome de etiqueta válido.',
            descendantRenameError: 'Não é possível mover uma etiqueta para si mesma ou um descendente.',
            confirmDelete: 'Eliminar etiqueta',
            deleteBatchNotFinalized:
                'Removidos de {removed}/{total}. Não atualizados: {notUpdated}. Metadados e atalhos não foram atualizados.',
            checkConsoleForDetails: 'Consulte a consola para mais detalhes.',
            file: 'ficheiro',
            files: 'ficheiros',
            inlineParsingWarning: {
                title: 'Compatibilidade de etiquetas inline',
                message:
                    '{tag} contém caracteres que o Obsidian não consegue analisar em etiquetas inline. As etiquetas de Frontmatter não são afetadas.',
                confirm: 'Usar mesmo assim'
            }
        },
        propertyOperation: {
            renameTitle: 'Renomear propriedade {property}',
            deleteTitle: 'Eliminar propriedade {property}',
            newKeyPrompt: 'Novo nome da propriedade',
            newKeyPlaceholder: 'Introduza o novo nome da propriedade',
            renameWarning: 'Renomear a propriedade {property} irá modificar {count} {files}.',
            renameConflictWarning:
                'A propriedade {newKey} já existe em {count} {files}. Renomear {oldKey} substituirá os valores existentes de {newKey}.',
            deleteWarning: 'Eliminar a propriedade {property} irá modificar {count} {files}.',
            confirmRename: 'Renomear propriedade',
            confirmDelete: 'Eliminar propriedade',
            renameNoChanges: '{oldKey} → {newKey} (sem alterações)',
            renameSettingsUpdateFailed: 'Propriedade {oldKey} → {newKey} renomeada. Não foi possível atualizar as definições.',
            deleteSingleSuccess: 'Propriedade {property} eliminada de 1 nota',
            deleteMultipleSuccess: 'Propriedade {property} eliminada de {count} notas',
            deleteSettingsUpdateFailed: 'Propriedade {property} eliminada. Não foi possível atualizar as definições.',
            invalidKeyName: 'Introduza um nome de propriedade válido.'
        },
        fileSystem: {
            newFolderTitle: 'Nova pasta',
            renameFolderTitle: 'Renomear pasta',
            renameFileTitle: 'Renomear ficheiro',
            deleteFolderTitle: "Eliminar '{name}'?",
            deleteFileTitle: "Eliminar '{name}'?",
            deleteFileAttachmentsTitle: 'Eliminar anexos do ficheiro?',
            moveFileConflictTitle: 'Conflito de movimentação',
            folderNamePrompt: 'Introduza o nome da pasta:',
            hideInOtherVaultProfiles: 'Ocultar noutros perfis do cofre',
            renamePrompt: 'Introduza o novo nome:',
            renameVaultTitle: 'Alterar nome de exibição do cofre',
            renameVaultPrompt: 'Introduza um nome de exibição personalizado (deixe vazio para usar o predefinido):',
            deleteFolderConfirm: 'Tem a certeza de que deseja eliminar esta pasta e todo o seu conteúdo?',
            deleteFileConfirm: 'Tem a certeza de que deseja eliminar este ficheiro?',
            deleteFileAttachmentsDescriptionSingle: 'Este anexo já não é utilizado em nenhuma nota. Deseja eliminá-lo?',
            deleteFileAttachmentsDescriptionMultiple: 'Estes anexos já não são utilizados em nenhuma nota. Deseja eliminá-los?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Árvore de ficheiros',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Galeria',
            moveFileConflictDescriptionSingle: 'Um conflito de ficheiro foi encontrado em "{folder}".',
            moveFileConflictDescriptionMultiple: '{count} conflitos de ficheiros foram encontrados em "{folder}".',
            moveFileConflictAffectedFiles: 'Ficheiros afetados',
            moveFileConflictItem: '"{name}" -> "{suggested}"{renameOnly}',
            moveFileConflictRenameOnly: '(apenas renomear)',
            moveFileConflictRename: 'Renomear',
            moveFileConflictOverwrite: 'Substituir',
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
        calendarTemplate: {
            placeholder: 'Pesquisar modelos...',
            instructions: {
                navigate: 'para navegar',
                select: 'para selecionar o modelo',
                dismiss: 'para fechar'
            }
        },
        navigationBanner: {
            placeholder: 'Pesquisar imagens...',
            svgMissingDimensions: 'O ficheiro SVG selecionado não define largura, altura ou viewBox.',
            instructions: {
                navigate: 'para navegar',
                select: 'para definir banner',
                dismiss: 'para fechar'
            }
        },
        tagSuggest: {
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
        propertySuggest: {
            placeholder: 'Selecionar chave de propriedade...',
            navigatePlaceholder: 'Navegar para propriedade...',
            instructions: {
                navigate: 'para navegar',
                select: 'para adicionar propriedade',
                dismiss: 'para fechar'
            }
        },
        propertyKeyVisibility: {
            title: 'Visibilidade das chaves de propriedade',
            description:
                'Controle onde os valores de propriedade são apresentados. As colunas correspondem ao painel de navegação, painel de lista e menu de contexto do ficheiro. Use a linha inferior para alternar todas as linhas de uma coluna.',
            searchPlaceholder: 'Pesquisar chaves de propriedade...',
            propertyColumnLabel: 'Propriedade',
            showInNavigation: 'Mostrar na navegação',
            showInList: 'Mostrar na lista',
            showInFileMenu: 'Mostrar no menu do ficheiro',
            toggleAllInNavigation: 'Alternar todos na navegação',
            toggleAllInList: 'Alternar todos na lista',
            toggleAllInFileMenu: 'Alternar todos no menu do ficheiro',
            applyButton: 'Aplicar',
            emptyState: 'Nenhuma chave de propriedade encontrada.'
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
            closeButton: 'Talvez mais tarde'
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
            deleteAttachments: 'Falha ao eliminar os anexos: {error}',
            mergeNotes: 'Falha ao unir notas: {error}',
            mergeNotesOpenOutput:
                'A nota unida foi criada como {name}, mas não foi possível abri-la: {error}. As notas de origem não foram alteradas.',
            mergeNotesOpenSkipped: 'Outro pedido para abrir ficheiro teve prioridade.',
            mergeNotesTrashSources: 'Nota unida criada. Falha ao mover {count} notas de origem para o lixo.',
            duplicateNote: 'Falha ao duplicar nota: {error}',
            duplicateFolder: 'Falha ao duplicar pasta: {error}',
            openVersionHistory: 'Falha ao abrir histórico de versões: {error}',
            versionHistoryNotFound: 'Comando de histórico de versões não encontrado. Certifique-se de que o Obsidian Sync está ativado.',
            revealInExplorer: 'Falha ao revelar ficheiro no explorador do sistema: {error}',
            openInDefaultApp: 'Falha ao abrir na aplicação predefinida: {error}',
            openInDefaultAppNotAvailable: 'Abrir na aplicação predefinida não está disponível nesta plataforma',
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
            showFolder: 'Pasta mostrada: {name}',
            folderExcludedFromDescendants: 'Oculta nas listas das pastas principais: {name}',
            folderIncludedInDescendants: 'Mostrada nas listas das pastas principais: {name}',
            mergeNotes: 'Unidas {count} notas em {name}'
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
            mergeNotesRequireMultipleMarkdown: 'Selecione pelo menos duas notas Markdown para unir',
            tagOperationsNotAvailable: 'Operações de etiqueta não disponíveis',
            propertyOperationsNotAvailable: 'Operações de propriedades não disponíveis',
            tagsRequireMarkdown: 'As etiquetas são suportadas apenas em notas Markdown',
            propertiesRequireMarkdown: 'As propriedades só são suportadas em notas Markdown',
            propertySetOnNote: 'Propriedade atualizada em 1 nota',
            propertySetOnNotes: 'Propriedade atualizada em {count} notas',
            manualSortPropertyRemovedFromNote: 'Propriedade de ordenação removida de 1 nota',
            manualSortPropertyRemovedFromNotes: 'Propriedade de ordenação removida de {count} notas',
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
            untitled: 'Sem título'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Não é possível mover uma pasta para si mesma ou uma subpasta.',
            itemAlreadyExists: 'Já existe um item com o nome "{name}" nesta localização.',
            failedToMove: 'Falha ao mover: {error}',
            failedToAddTag: 'Falha ao adicionar etiqueta "{tag}"',
            failedToSetProperty: 'Falha ao atualizar propriedade: {error}',
            failedToClearTags: 'Falha ao limpar etiquetas',
            failedToMoveFolder: 'Falha ao mover pasta "{name}"',
            failedToImportFiles: 'Falha ao importar: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} ficheiros já existem no destino',
            filesAlreadyHaveTag: '{count} ficheiros já têm esta etiqueta ou uma mais específica',
            filesAlreadyHaveProperty: '{count} ficheiros já têm esta propriedade',
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

    // Plugin commands
    commands: {
        open: 'Abrir', // Command palette: Opens the Notebook Navigator view (English: Open)
        toggleLeftSidebar: 'Alternar barra lateral esquerda', // Command palette: Toggles left sidebar, opening Notebook Navigator when uncollapsing (English: Toggle left sidebar)
        openHomepage: 'Abrir página inicial', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        openDailyNote: 'Abrir nota diária',
        openWeeklyNote: 'Abrir nota semanal',
        openMonthlyNote: 'Abrir nota mensal',
        openQuarterlyNote: 'Abrir nota trimestral',
        openYearlyNote: 'Abrir nota anual',
        revealFile: 'Revelar ficheiro', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Pesquisar', // Command palette: Toggle search in the file list (English: Search)
        searchVaultRoot: 'Pesquisar em todo o cofre', // Command palette: Selects the vault root folder and focuses search with subfolders included (English: Search whole vault)
        toggleDualPane: 'Alternar layout de painel duplo', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        toggleDualPaneOrientation: 'Alternar orientação do painel duplo', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'Alternar calendário', // Command palette: Toggles showing the calendar overlay in the navigation pane (English: Toggle calendar)
        selectVaultProfile: 'Selecionar perfil do cofre', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'Selecionar perfil do cofre 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Selecionar perfil do cofre 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Selecionar perfil do cofre 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Eliminar ficheiros', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Criar nova nota', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Nova nota a partir de modelo', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Mover ficheiros', // Command palette: Move selected files to another folder (English: Move files)
        mergeNotes: 'Unir notas', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'Selecionar ficheiro seguinte', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Selecionar ficheiro anterior', // Command palette: Selects the previous file in the current view (English: Select previous file)
        navigateBack: 'Navegar para trás',
        navigateForward: 'Navegar para a frente',
        convertToFolderNote: 'Converter em nota de pasta', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Definir como nota de pasta', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Desvincular nota de pasta', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Fixar todas as notas de pasta', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Navegar para pasta', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Navegar para etiqueta', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        navigateToProperty: 'Navegar para propriedade', // Command palette: Navigate to a property key or value using fuzzy search (English: Navigate to property)
        addShortcut: 'Adicionar aos atalhos', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: 'Abrir atalho {number}',
        toggleDescendants: 'Alternar descendentes', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Alternar pastas, etiquetas e notas ocultas', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Alternar ordem de ordenação de etiquetas', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: 'Alternar etiquetas por seleção',
        togglePropertiesBySelection: 'Alternar propriedades por seleção',
        toggleCompactMode: 'Alternar modo compacto', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Alternar secção fixada',
        collapseExpand: 'Recolher / expandir todos os itens', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        collapseExpandSelectedItem: 'Recolher / expandir o item selecionado',
        addTag: 'Adicionar etiqueta aos ficheiros selecionados', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        setProperty: 'Definir propriedade nos ficheiros selecionados', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'Remover etiqueta dos ficheiros selecionados', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Remover todas as etiquetas dos ficheiros selecionados', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        openAllFiles: 'Abrir todos os ficheiros', // Command palette: Opens all files in the current folder or tag (English: Open all files)
        rebuildCache: 'Reconstruir cache', // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
        restoreDefaultSettings: 'Restaurar predefinições' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        calendarViewName: 'Calendário', // Name shown in the view header/tab (English: Calendar)
        folderNoteSidebarViewName: 'Nota de pasta', // Name shown in the folder note sidebar tab (English: Folder note)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Revelar no Notebook Navigator', // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
        settingsUnavailableNotice:
            'O Notebook Navigator não conseguiu ler as suas definições e não foi iniciado. Se o cofre estiver a sincronizar, reinicie o Obsidian após a sincronização terminar. Para recomeçar com as predefinições, execute o comando "Restaurar predefinições".', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsRecovery: {
            confirmTitle: 'Restaurar predefinições', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'Isto substitui o ficheiro de definições do Notebook Navigator pelas predefinições. Se o cofre ainda estiver a sincronizar, as predefinições restauradas podem substituir as definições guardadas nos seus outros dispositivos. Um ficheiro de definições legível é primeiro copiado para uma cópia de segurança com data e hora na pasta do plugin.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'Restaurar predefinições', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: 'Não foi possível concluir a recuperação das definições. As preferências locais foram mantidas.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'Predefinições restauradas. Reinicie o Obsidian para concluir.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Última modificação em',
        createdAt: 'Criado em',
        file: 'ficheiro',
        files: 'ficheiros',
        folder: 'pasta',
        folders: 'pastas',
        wordCount: 'Contagem de palavras'
    },

    fileCounts: {
        words: '{count} palavras',
        characters: '{count} caracteres',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'Alterar definições predefinidas',
        metadataReport: {
            exportSuccess: 'Relatório de metadados falhados exportado para: {filename}',
            exportFailed: 'Falha ao exportar relatório de metadados'
        },
        sections: {
            general: 'Geral',
            vaultFilters: 'Filtros de exibição',
            appearanceBehavior: 'Aparência e comportamento',
            navigationPane: 'Painel de navegação',
            calendar: 'Calendário',
            fileOperations: 'Operações de ficheiros',
            icons: 'Pacotes de ícones',
            folders: 'Pastas',
            folderNotes: 'Notas de pasta',
            folderNoteFiles: 'Ficheiros de notas de pasta',
            foldersAndFolderNotes: 'Pastas e notas de pasta',
            tagsAndProperties: 'Etiquetas e propriedades',
            tags: 'Etiquetas',
            listPane: 'Painel de lista',
            notes: 'Exibição de ficheiros',
            shortcutsAndRecentFiles: 'Atalhos e ficheiros recentes',
            advanced: 'Avançado'
        },
        pageGroups: {
            configuration: 'Configuração',
            navigationAndContent: 'Painel de navegação',
            notesAndLists: 'Painel de lista',
            calendarAndTools: 'Calendário e ferramentas'
        },
        pageDescriptions: {
            general: 'Notas de versão, suporte, perfil do cofre, tipos de ficheiro e chaves de propriedades.',
            vaultFilters: 'Pastas, etiquetas, ficheiros, etiquetas de ficheiro e regras de propriedades ocultas.',
            appearanceBehavior: 'Comportamento, navegação por teclado, botões do rato, aparência e formatação.',
            navigationPane: 'Esquema, aparência, contagem de notas, comportamento de recolha e cores arco-íris.',
            shortcuts: 'Visibilidade de atalhos, distintivos, ficheiros recentes e itens fixados.',
            calendar: 'Exibição do calendário, notas de data, modelos, localização e posicionamento da barra lateral.',
            fileOperations: 'Modelos, confirmações de eliminação, anexos e comportamento de conflitos ao mover ficheiros.',
            foldersAndFolderNotes: 'Exibição de pastas, notas de pasta, modelos de notas de pasta e comportamento das notas de pasta.',
            tagsProperties: 'Secções de etiquetas e propriedades, ícones, ordenação, âmbito e herança.',
            listPane: 'Ordenação, agrupamento, modos de lista, notas fixadas e pré-visualizações de desenhos.',
            frontmatter: 'Campos de frontmatter para nomes de exibição, carimbos de data/hora, ícones e cores.',
            notes: 'Títulos, texto de pré-visualização, imagens de destaque, etiquetas, propriedades, datas, contagem de palavras e contagem de caracteres.',
            iconPacks: 'Ícones de interface, ícones de ficheiros e gestão de pacotes de ícones.',
            advanced: 'Diagnósticos, limpeza de metadados, importação/exportação e reposição.'
        },
        groups: {
            general: {
                vaultConfiguration: 'Configuração do cofre',
                templates: 'Modelos',
                behavior: 'Comportamento',
                startup: 'Arranque',
                keyboardNavigation: 'Navegação por teclado',
                mouseButtons: 'Botões do rato',
                view: 'Aparência',
                icons: 'Ícones',
                desktopAppearance: 'Aparência no computador',
                mobileAppearance: 'Aparência móvel',
                formatting: 'Formatação'
            },
            advanced: {
                maintenance: 'Manutenção',
                resetSettings: 'Repor definições'
            },
            navigation: {
                appearance: 'Aparência',
                banner: 'Banner',
                collapseItems: 'Recolher itens',
                dragAndDrop: 'Arrastar e largar',
                noteCounts: 'Contagens de notas',
                rainbowColors: 'Cores arco-íris',
                leftSidebar: 'Barra lateral esquerda',
                calendarIntegration: 'Integração do calendário'
            },
            list: {
                display: 'Aparência',
                groupHeaders: 'Cabeçalhos de grupo',
                propertySort: 'Ordenação por propriedade',
                manualSort: 'Ordenação manual',
                pinnedNotes: 'Notas fixadas',
                drawingPreviews: 'Pré-visualizações de desenhos'
            },
            notes: {
                frontmatter: 'Campos de frontmatter',
                tasks: 'Tarefas',
                icon: 'Ícone',
                title: 'Título',
                previewText: 'Texto de pré-visualização',
                featureImage: 'Imagem de destaque',
                tags: 'Etiquetas',
                properties: 'Propriedades',
                date: 'Data',
                parentFolder: 'Pasta superior',
                wordCount: 'Contagem de palavras e caracteres'
            }
        },
        syncMode: {
            notSynced: '(não sincronizado)',
            switchToSynced: 'Ativar sincronização',
            switchToLocal: 'Desativar sincronização'
        },
        items: {
            listPaneTitle: {
                name: 'Título do painel de lista',
                desc: 'Escolha onde mostrar o título do painel de lista.',
                options: {
                    header: 'Mostrar no cabeçalho',
                    list: 'Mostrar no painel de lista',
                    hidden: 'Não mostrar'
                }
            },
            sortNotesBy: {
                name: 'Ordem de ordenação predefinida',
                desc: 'Escolha a ordem de ordenação predefinida para notas.',
                options: {
                    'modified-desc': 'Data de edição (mais recente no topo)',
                    'modified-asc': 'Data de edição (mais antiga no topo)',
                    'created-desc': 'Data de criação (mais recente no topo)',
                    'created-asc': 'Data de criação (mais antiga no topo)',
                    'title-asc': 'Título (A no topo)',
                    'title-desc': 'Título (Z no topo)',
                    'filename-asc': 'Nome do ficheiro (A no topo)',
                    'filename-desc': 'Nome do ficheiro (Z no topo)'
                },
                directions: {
                    asc: 'Ascendente',
                    desc: 'Descendente'
                },
                fields: {
                    modified: 'Data de edição',
                    created: 'Data de criação',
                    title: 'Título',
                    filename: 'Nome do ficheiro',
                    property: 'Propriedade'
                }
            },
            propertySortKey: {
                name: 'Propriedades para ordenar',
                desc: 'Propriedades frontmatter separadas por vírgulas mostradas como opções de ordenação por propriedade. Os valores de array são juntos numa única cadeia. Estas propriedades não são alteradas.',
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: 'Ordenação secundária',
                desc: 'Usada com a ordenação por propriedade quando as notas têm o mesmo valor de propriedade ou não têm valor.',
                options: {
                    title: 'Título',
                    filename: 'Nome do ficheiro',
                    created: 'Data de criação',
                    modified: 'Data de edição'
                }
            },
            propertySortInstructions: {
                intro: 'Cada propriedade listada acima aparece como uma opção de ordenação no menu de ordenação do painel de lista. Ao selecionar uma, as notas são ordenadas pelo seu valor frontmatter.'
            },
            manualSortPropertyKey: {
                name: 'Propriedade de ordenação manual',
                desc: 'Propriedade frontmatter usada para guardar valores de índice numéricos para ordenação manual.'
            },
            manualSortGroupHeaderProperty: {
                name: 'Propriedade de cabeçalho de grupo',
                desc: 'Propriedade frontmatter usada para guardar cabeçalhos de grupo personalizados.'
            },
            groupHeadersInstructions: {
                intro: 'Os cabeçalhos de grupo personalizados são exibidos acima das notas no painel de lista.',
                items: [
                    'No menu de ordenação do painel de lista, defina o agrupamento como **Personalizado**.',
                    'Clique com o botão direito numa nota e escolha **Definir cabeçalho de grupo** para adicionar um cabeçalho acima dela.'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'Colocação de novas notas',
                desc: 'Escolha onde as novas notas são colocadas quando a lista atual usa ordenação manual.',
                options: {
                    top: 'Topo',
                    bottom: 'Fundo',
                    'below-selected-note': 'Abaixo da nota selecionada',
                    unsorted: 'Sem ordenação'
                }
            },
            confirmBeforeManualSort: {
                name: 'Confirmar antes da ordenação manual',
                desc: 'Mostrar um aviso antes de escrever a propriedade de ordenação manual nas notas pela primeira vez. Quando desativado, as notas recebem a propriedade sem aviso.'
            },
            manualSortInstructions: {
                intro: 'A ordenação manual escreve um valor de índice numérico numa propriedade frontmatter em cada nota. As notas sem índice aparecem em Sem ordenação.',
                items: [
                    'Ative a ordenação manual escolhendo **Ordenação manual** no menu de ordenação. Depois, há duas formas de reorganizar as notas.',
                    'Selecione **Editar ordenação...** no menu de ordenação para abrir uma vista de reordenação. Arraste notas com o rato, ou com toque no telemóvel. No computador, **Cmd/Ctrl** ou **Shift** clique seleciona várias notas, e ao arrastar qualquer uma delas move o grupo inteiro.',
                    'No painel de lista, selecione uma nota ou várias notas, e prima **Cmd/Ctrl + Arrow Up/Down** para mover a seleção para cima ou para baixo.'
                ]
            },
            revealFileOnListChanges: {
                name: 'Deslocar para ficheiro selecionado em alterações da lista',
                desc: 'Deslocar para o ficheiro selecionado ao fixar notas, mostrar notas descendentes, alterar aparência da pasta ou executar operações de ficheiros.'
            },
            includeDescendantNotes: {
                name: 'Mostrar notas de subpastas / descendentes',
                desc: 'Incluir notas de subpastas aninhadas e descendentes de etiquetas e propriedades ao visualizar uma pasta, etiqueta ou propriedade.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Fixar notas apenas na sua pasta',
                desc: 'As notas fixadas aparecem fixadas apenas na sua própria pasta. Útil para notas de pasta ou se tiver muitas notas fixadas. Não afeta as vistas de etiquetas ou propriedades.'
            },
            separateNoteCounts: {
                name: 'Mostrar contagens de notas atuais e descendentes separadamente',
                desc: 'Exibir contagens de notas no formato "atuais ▾ descendentes" para pastas, etiquetas e propriedades.'
            },
            groupNotes: {
                name: 'Agrupamento predefinido',
                desc: 'Personalizado mostra cabeçalhos definidos no frontmatter. Data agrupa as notas por data. Pasta agrupa as notas por pasta. As vistas de etiqueta e propriedade usam grupos de data quando uma pasta está selecionada.',
                options: {
                    custom: 'Personalizado',
                    date: 'Data',
                    folder: 'Pasta'
                }
            },
            showSelectedNavigationPills: {
                name: 'Mostrar sempre todas as etiquetas e propriedades',
                desc: 'Quando desativado, as etiquetas que correspondem à seleção de navegação atual ficam ocultas (por exemplo, a etiqueta "receitas" fica oculta ao navegar na etiqueta "receitas"). Ative para manter todas as etiquetas visíveis.'
            },
            stickyGroupHeaders: {
                name: 'Cabeçalhos de grupo fixos',
                desc: 'Mantém o cabeçalho atual de data, pasta ou secção fixada visível ao deslocar.'
            },
            showFolderGroupPaths: {
                name: 'Mostrar caminhos das subpastas',
                desc: 'Ao agrupar por pasta no painel de lista, mostrar caminhos das subpastas em vez de apenas nomes de pastas.'
            },
            showGroupHeaderItemCounts: {
                name: 'Mostrar contagem de itens',
                desc: 'Mostra o número de itens em cada cabeçalho de grupo no painel de lista.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'Agrupamento por pasta: ficheiros da pasta atual no fundo',
                desc: 'Quando o agrupamento predefinido é Pasta, mover os ficheiros diretamente na pasta selecionada para baixo dos grupos de subpastas.'
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
                desc: 'Exibir ícones de ficheiros com espaçamento alinhado à esquerda. Desativar remove ícones e indentação. Prioridade: ícone de tarefas inacabadas > ícone personalizado > ícone de pasta > ícone de nome de ficheiro > ícone de tipo de ficheiro > ícone predefinido.'
            },
            useFolderIcon: {
                name: 'Usar ícone de pasta',
                desc: 'Exibir o ícone da pasta pai quando não está definido um ícone de ficheiro personalizado. A cor da pasta é usada quando não está definida uma cor de ficheiro personalizada.'
            },
            showFileIconUnfinishedTask: {
                name: 'Ícone de tarefas inacabadas',
                desc: 'Apresentar um ícone de tarefa quando uma nota tem tarefas inacabadas.'
            },
            showFileBackgroundUnfinishedTask: {
                name: 'Fundo de tarefas inacabadas',
                desc: 'Aplicar uma cor de fundo quando uma nota tem tarefas inacabadas.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'Cor de fundo de tarefas inacabadas',
                desc: 'Definir a cor de fundo usada quando uma nota tem tarefas inacabadas.'
            },
            showFilenameMatchIcons: {
                name: 'Ícones por nome de ficheiro',
                desc: 'Atribuir ícones a ficheiros com base no texto nos seus nomes.'
            },
            fileNameIconMap: {
                name: 'Mapa de ícones por nome',
                desc: 'Os ficheiros contendo o texto recebem o ícone especificado. Um mapeamento por linha: texto=ícone',
                placeholder: '# texto=ícone\nreunião=ph-calendar\nfatura=ph-receipt',
                editTooltip: 'Editar mapeamentos'
            },
            showCategoryIcons: {
                name: 'Ícones por tipo de ficheiro',
                desc: 'Atribuir ícones a ficheiros com base na sua extensão.'
            },
            fileTypeIconPreset: {
                name: 'Predefinição de ícones de ficheiro',
                desc: 'Escolher os ícones integrados ou uma predefinição de pacote de ícones. As regras de extensão personalizadas substituem esta predefinição.',
                options: {
                    none: 'Ícones integrados'
                },
                notInstalledWarning: 'Este pacote de ícones não está instalado. Em vez disso, são mostrados os ícones integrados.'
            },
            fileTypeIconMap: {
                name: 'Mapa de ícones por tipo',
                desc: 'Os ficheiros com a extensão recebem o ícone especificado. Um mapeamento por linha: extensão=ícone',
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'Editar mapeamentos'
            },
            compactItemHeight: {
                name: 'Altura do item compacto',
                desc: 'Definir a altura dos itens de lista compacta no computador e telemóvel (pixels).',
                resetTooltip: 'Restaurar para predefinido (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Escalar texto com altura do item compacto',
                desc: 'Escalar texto da lista compacta quando a altura do item é reduzida.'
            },
            showParentFolder: {
                name: 'Mostrar pasta pai',
                desc: 'Exibir o nome da pasta pai para notas em subpastas, etiquetas ou propriedades.'
            },
            showParentFolderFullPath: {
                name: 'Mostrar caminho completo',
                desc: 'Exibir o caminho completo da pasta pai em vez de apenas o nome da pasta.'
            },
            parentFolderClickRevealsFile: {
                name: 'Clicar na pasta pai abre pasta',
                desc: 'Clicar na etiqueta da pasta pai abre a pasta no painel de lista.'
            },
            showParentFolderColor: {
                name: 'Mostrar cor da pasta pai',
                desc: 'Usar cores de pasta nas etiquetas de pasta pai.'
            },
            showParentFolderIcon: {
                name: 'Mostrar ícone da pasta pai',
                desc: 'Mostrar ícones de pasta ao lado das etiquetas da pasta pai.'
            },
            showQuickActions: {
                name: 'Mostrar ações rápidas',
                desc: 'Mostrar botões de ação ao passar sobre ficheiros. Os controlos dos botões selecionam quais ações aparecem.'
            },
            dualPane: {
                name: 'Layout de painel duplo',
                desc: 'Mostrar painel de navegação e painel de lista lado a lado no computador.'
            },
            dualPaneOrientation: {
                name: 'Orientação do painel duplo',
                desc: 'Escolha layout horizontal ou vertical quando o painel duplo está ativo.',
                options: {
                    horizontal: 'Divisão horizontal',
                    vertical: 'Divisão vertical'
                }
            },
            narrowSidebarLayout: {
                name: 'Quando a barra lateral é demasiado estreita',
                desc: 'Escolha o que acontece quando o painel de navegação e o painel de lista não cabem lado a lado.',
                options: {
                    none: 'Não fazer nada',
                    singlePane: 'Mudar para painel único',
                    vertical: 'Mudar para divisão vertical'
                }
            },
            narrowSidebarTrigger: {
                name: 'Limite de barra lateral estreita',
                desc: 'Escolha como o limite de largura da barra lateral é calculado.',
                options: {
                    fitPanes: 'Ajustar painéis',
                    customWidth: 'Largura personalizada'
                }
            },
            narrowSidebarCustomWidth: {
                name: 'Largura do limite de barra lateral estreita',
                desc: 'Mudar quando a barra lateral for mais estreita do que esta largura.',
                resetTooltip: 'Repor para a largura predefinida'
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
                name: 'Nível de zoom',
                desc: 'Controla o nível de zoom geral do Notebook Navigator (percentagem).'
            },
            useFloatingToolbars: {
                name: 'Usar barras de ferramentas flutuantes no iOS/iPadOS',
                desc: 'Aplica-se apenas ao iOS e iPadOS.'
            },
            startView: {
                name: 'Vista de arranque predefinida',
                desc: 'Escolha qual painel fica ativo ao abrir o Notebook Navigator. O esquema de painel único mostra este painel primeiro; o esquema de painel duplo dá-lhe o foco do teclado.',
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
            createNewNotesInNewTab: {
                name: 'Abrir novas notas num novo separador',
                desc: 'Quando ativado, o comando Criar nova nota abre as notas num novo separador. Quando desativado, as notas substituem o separador atual.'
            },
            autoRevealActiveNote: {
                name: 'Revelar nota ativa automaticamente',
                desc: 'Revelar notas automaticamente quando abertas pelo Alternador Rápido, links ou pesquisa.'
            },
            autoRevealShortestPath: {
                name: 'Revelação automática: Usar caminho mais curto',
                desc: 'Ativado: A revelação automática seleciona a pasta ancestral ou etiqueta visível mais próxima. Desativado: A revelação automática seleciona a pasta real do ficheiro e a etiqueta exata.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Revelação automática: Ignorar eventos da barra lateral direita',
                desc: 'Não alterar a nota ativa ao clicar ou alterar notas na barra lateral direita.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'Revelação automática: Ignorar eventos de outras janelas',
                desc: 'Não alterar a nota ativa ao trabalhar com notas numa janela diferente.'
            },
            paneTransitionDuration: {
                name: 'Animação de painel único',
                desc: 'Duração da transição ao alternar entre painéis no modo de painel único (milissegundos).',
                resetTooltip: 'Repor predefinição'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Selecionar primeira nota automaticamente',
                desc: 'Abrir automaticamente a primeira nota ao mudar de pastas, etiquetas ou propriedades.'
            },
            skipAutoScroll: {
                name: 'Desativar deslocamento automático para atalhos',
                desc: 'Não deslocar o painel de navegação ao clicar em itens nos atalhos.'
            },
            autoExpandNavItems: {
                name: 'Expandir ao selecionar',
                desc: 'Expandir pastas e etiquetas quando selecionadas. No modo de painel único, a primeira seleção expande, a segunda mostra ficheiros.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'Um ramo expandido',
                desc: 'Recolher outros ramos na mesma árvore ao expandir uma pasta, etiqueta ou propriedade.'
            },
            springLoadedFolders: {
                name: 'Expandir ao arrastar',
                desc: 'Expandir pastas e etiquetas ao passar sobre elas durante o arrasto.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Expandir ao arrastar: Atraso da primeira expansão',
                desc: 'Atraso antes de expandir a primeira pasta ou etiqueta durante um arrasto (segundos).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Expandir ao arrastar: Atraso das expansões seguintes',
                desc: 'Atraso antes de expandir pastas ou etiquetas adicionais durante o mesmo arrasto (segundos).'
            },
            navigationBanner: {
                name: 'Banner de navegação (perfil do cofre)',
                desc: 'Exibir uma imagem acima do painel de navegação. Muda com o perfil do cofre selecionado.',
                current: 'Banner atual: {path}',
                chooseButton: 'Escolher imagem'
            },
            pinNavigationBanner: {
                name: 'Fixar banner',
                desc: 'Fixar o banner de navegação acima da árvore de navegação.'
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
                name: 'Mostrar ficheiros recentes',
                desc: 'Exibir a secção de ficheiros recentes no painel de navegação.'
            },
            hideRecentNotes: {
                name: 'Ocultar tipos de ficheiros dos ficheiros recentes',
                desc: 'Escolher os tipos de ficheiros a ocultar na secção de ficheiros recentes.',
                options: {
                    none: 'Nenhum',
                    folderNotes: 'Notas de pasta'
                }
            },
            recentNotesCount: {
                name: 'Número de ficheiros recentes',
                desc: 'Número de ficheiros recentes a exibir.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Fixar ficheiros recentes com atalhos',
                desc: 'Incluir ficheiros recentes quando os atalhos estão fixos.'
            },
            calendarEnabled: {
                name: 'Ativar calendário',
                desc: 'Ativar funcionalidades de calendário do Notebook Navigator.'
            },
            calendarPlacement: {
                name: 'Posição do calendário',
                desc: 'Exibir na barra lateral esquerda ou direita.',
                options: {
                    leftSidebar: 'Barra lateral esquerda',
                    rightSidebar: 'Barra lateral direita'
                }
            },
            calendarLeftPlacement: {
                name: 'Posicionamento em painel único',
                desc: 'Onde o calendário é exibido no modo de painel único.',
                options: {
                    navigationPane: 'Painel de navegação',
                    below: 'Abaixo dos painéis'
                }
            },
            calendarLocale: {
                name: 'Idioma',
                desc: 'Controla a formatação das datas do calendário, a numeração das semanas e o primeiro dia da semana.',
                weekPathMismatchWarning:
                    'O calendário visível e os caminhos das notas semanais usam inícios de semana ou numeração de semana diferentes.',
                options: {
                    systemDefault: 'Predefinido'
                }
            },
            calendarWeekendDays: {
                name: 'Dias de fim de semana',
                desc: 'Mostrar dias de fim de semana com uma cor de fundo diferente.',
                options: {
                    none: 'Nenhum',
                    satSun: 'Sábado e domingo',
                    friSat: 'Sexta-feira e sábado',
                    thuFri: 'Quinta-feira e sexta-feira'
                }
            },
            calendarMonthHeadingFormat: {
                name: 'Formato do nome do mês',
                desc: 'Nome do mês completo (janeiro) ou abreviado (jan).',
                options: {
                    full: 'janeiro (completo)',
                    short: 'jan (curto)'
                }
            },
            showInfoButtons: {
                name: 'Mostrar botões de informação',
                desc: 'Mostrar botões de informação na barra de pesquisa e no cabeçalho do calendário.'
            },
            calendarWeeksToShow: {
                name: 'Semanas a mostrar na barra lateral esquerda',
                desc: 'O calendário na barra lateral direita mostra sempre o mês completo.',
                options: {
                    fullMonth: 'Mês completo',
                    oneWeek: '1 semana',
                    weeksCount: '{count} semanas'
                }
            },
            calendarHighlightToday: {
                name: 'Realçar a data de hoje',
                desc: 'Realçar a data de hoje com uma cor de fundo e texto em negrito.'
            },
            calendarShowFeatureImage: {
                name: 'Mostrar imagem de destaque',
                desc: 'Mostrar imagens de destaque das notas no calendário.'
            },
            calendarShowTasks: {
                name: 'Mostrar tarefas',
                desc: 'Mostrar um indicador em dias, semanas e meses com tarefas inacabadas.'
            },
            calendarShowWeekNumber: {
                name: 'Mostrar número da semana',
                desc: 'Adicionar uma coluna com o número da semana.'
            },
            calendarShowQuarter: {
                name: 'Mostrar trimestre',
                desc: 'Adicionar uma etiqueta de trimestre no cabeçalho do calendário.'
            },
            calendarShowYearCalendar: {
                name: 'Mostrar calendário anual',
                desc: 'Apresentar navegação anual e grelha de meses na barra lateral direita.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Confirmar antes de criar',
                desc: 'Mostrar uma caixa de diálogo de confirmação ao criar uma nova nota diária.'
            },
            calendarIntegrationMode: {
                name: 'Fonte de notas diárias',
                desc: 'Fonte para notas do calendário.',
                options: {
                    dailyNotes: 'Notas diárias (plug-in principal)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'Pasta e formato de data são configurados no plugin Daily Notes.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'Idioma das notas periódicas',
                desc: 'Controla nomes de meses, nomes de dias da semana, números de semana e inícios de semana localizados nos caminhos das notas periódicas do Notebook Navigator.',
                options: {
                    calendar: 'Calendário',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'Pasta raiz',
                desc: 'Pasta base para notas periódicas. Padrões de data podem incluir subpastas. Muda com o perfil do cofre selecionado.',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'Localização da pasta de modelos',
                desc: 'O seletor de arquivos de modelo mostra notas desta pasta.',
                placeholder: 'Templates',
                usage: 'Usada por notas de calendário e notas de pasta. Configure os modelos em Calendário > Integração do calendário e Pastas e notas de pasta > Ficheiros de notas de pasta.'
            },
            calendarCustomFilePattern: {
                name: 'Notas diárias',
                desc: 'Formatar caminho usando formato de data Moment. Coloque nomes de subpastas entre colchetes, ex. [Work]/YYYY. Clique no ícone de modelo para definir um modelo. Definir localização da pasta de modelos em Operações de ficheiros > Modelos.',
                momentDescPrefix: 'Formatar caminho usando ',
                momentLinkText: 'formato de data Moment',
                momentDescSuffix:
                    '. Coloque nomes de subpastas entre colchetes, ex. [Work]/YYYY. Clique no ícone de modelo para definir um modelo. Definir localização da pasta de modelos em Operações de ficheiros > Modelos.',
                templaterSupportInstalled: '✅ O plug-in Templater está instalado com suporte completo de modelos.',
                templaterSupportMissing: '⚠️ Instale o plug-in Templater para suporte completo de modelos.',
                placeholder: 'YYYY/YYYYMMDD',
                example: 'Sintaxe atual: {path}',
                parsingError: 'O padrão deve ser formatado e analisado novamente como uma data completa (ano, mês, dia).'
            },
            calendarCustomWeekPattern: {
                name: 'Notas semanais',
                parsingError:
                    'O padrão deve ser formatado e analisado novamente como uma semana completa (ano da semana, número da semana).',
                weekPathMismatchWarning:
                    'Os caminhos das notas semanais usam o idioma das notas periódicas. Use idiomas correspondentes ou use "GGGG" com "WW" para semanas baseadas na segunda-feira.',
                mixedWeekTokensWarning:
                    'Este padrão mistura tokens de semana baseados na segunda-feira ("W" ou "G") com tokens de semana baseados no idioma ("w" ou "g"). Use um conjunto de forma consistente: "GGGG" com "WW" para semanas baseadas na segunda-feira, ou "gggg" com "ww" se as notas semanais devem seguir a língua selecionada.'
            },
            calendarCustomMonthPattern: {
                name: 'Notas mensais',
                parsingError: 'O padrão deve ser formatado e analisado novamente como um mês completo (ano, mês).'
            },
            calendarCustomQuarterPattern: {
                name: 'Notas trimestrais',
                parsingError: 'O padrão deve ser formatado e analisado novamente como um trimestre completo (ano, trimestre).'
            },
            calendarCustomYearPattern: {
                name: 'Notas anuais',
                parsingError: 'O padrão deve ser formatado e analisado novamente como um ano completo (ano).'
            },
            calendarTemplateFile: {
                current: 'Arquivo de modelo: {name}'
            },
            showTooltips: {
                name: 'Mostrar dicas',
                desc: 'Exibir dicas ao passar com informações adicionais para notas e pastas.'
            },
            showTooltipPath: {
                name: 'Mostrar caminho nas dicas',
                desc: 'Exibir o caminho da pasta abaixo dos nomes das notas nas dicas.'
            },
            showTooltipWordCount: {
                name: 'Mostrar contagem de palavras nas dicas',
                desc: 'Exibir a contagem de palavras das notas nas dicas.'
            },
            resetPaneSeparator: {
                name: 'Repor posição do separador de painéis',
                desc: 'Repor o separador arrastável entre o painel de navegação e o painel de lista para a posição predefinida.',
                buttonText: 'Repor separador',
                notice: 'Posição do separador reposta. Reinicie o Obsidian ou reabra o Notebook Navigator para aplicar.'
            },
            settingsTransfer: {
                name: 'Importar e exportar definições',
                desc: 'Exportar ou importar definições do Notebook Navigator como JSON. A importação substitui todas as definições.',
                importButtonText: 'Importar',
                exportButtonText: 'Exportar',
                import: {
                    modalTitle: 'Importar definições',
                    fileButtonName: 'Importar de ficheiro',
                    fileButtonDesc: 'Carregar um ficheiro JSON do disco.',
                    fileButtonText: 'Importar de ficheiro',
                    editorName: 'JSON',
                    editorDesc: 'Cole ou edite o JSON abaixo. As definições não incluídas são repostas nos valores predefinidos.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'Importar',
                    confirmTitle: 'Importar definições?',
                    confirmMessage: 'A importação substitui as definições atuais do Notebook Navigator.',
                    backupToggleName: 'Guardar as definições atuais na raiz do cofre antes de importar',
                    backupToggleDesc: 'Cria um ficheiro JSON com carimbo de data/hora na raiz do cofre.',
                    successWithBackupNotice: 'Definições importadas. As definições anteriores foram guardadas em {path}.',
                    backupError: 'Não foi possível guardar as definições atuais: {message}',
                    successNotice: 'Definições importadas.',
                    errorNotice: 'Falha ao importar definições: {message}',
                    fileReadError: 'Não foi possível ler o ficheiro: {message}'
                },
                export: {
                    modalTitle: 'Exportar definições',
                    editorName: 'JSON',
                    editorDesc: 'Apenas as definições alteradas em relação aos valores predefinidos são incluídas.',
                    placeholder: '{}',
                    copyButtonText: 'Copiar para a área de transferência',
                    downloadButtonText: 'Descarregar',
                    copyNotice: 'Definições copiadas para a área de transferência.',
                    downloadNotice: 'Definições exportadas.',
                    downloadError: 'Falha ao descarregar definições: {message}'
                }
            },
            resetAllSettings: {
                name: 'Repor todas as definições',
                desc: 'Repor todas as definições do Notebook Navigator para os valores predefinidos.',
                buttonText: 'Repor todas as definições',
                confirmTitle: 'Repor todas as definições?',
                confirmMessage:
                    'Isto irá repor todas as definições do Notebook Navigator para os valores predefinidos. Não pode ser desfeito.',
                confirmButtonText: 'Repor todas as definições',
                notice: 'Todas as definições repostas. Reinicie o Obsidian ou reabra o Notebook Navigator para aplicar.',
                error: 'Falha ao repor as definições.'
            },
            multiSelectModifier: {
                name: 'Modificador de seleção múltipla',
                desc: 'Escolha qual tecla modificadora alterna a seleção múltipla. Quando Option/Alt é selecionado, Cmd/Ctrl abre notas num novo separador.',
                options: {
                    cmdCtrl: 'Clique Cmd/Ctrl',
                    optionAlt: 'Clique Option/Alt'
                }
            },
            enterToOpenFiles: {
                name: 'Pressionar Enter para abrir ficheiros',
                desc: 'Abrir ficheiros apenas ao pressionar Enter durante a navegação por teclado na lista. No macOS, isto impede que Enter renomeie ficheiros.'
            },
            shiftEnterOpenContext: {
                name: 'Shift+Enter',
                desc: 'Escolher se Shift+Enter abre ou renomeia o ficheiro selecionado.'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Enter',
                desc: 'Escolher se Cmd+Enter abre ou renomeia o ficheiro selecionado.'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Enter',
                desc: 'Escolher se Ctrl+Enter abre ou renomeia o ficheiro selecionado.'
            },
            mouseBackForwardAction: {
                name: 'Botões voltar/avançar do rato',
                desc: 'Ação dos botões voltar e avançar do rato no ambiente de trabalho.',
                options: {
                    none: 'Usar predefinição do sistema',
                    singlePaneSwitch: 'Alternar painéis (painel único)',
                    history: 'Navegar no histórico'
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
                desc: 'Escolha o que o Notebook Navigator abre automaticamente ao iniciar.',
                current: 'Atual: {path}',
                chooseButton: 'Escolher ficheiro',
                options: {
                    none: 'Nenhum',
                    file: 'Ficheiro',
                    dailyNote: 'Nota diária',
                    weeklyNote: 'Nota semanal',
                    monthlyNote: 'Nota mensal',
                    quarterlyNote: 'Nota trimestral',
                    yearlyNote: 'Nota anual'
                },
                file: {
                    name: 'Página inicial: Ficheiro de arranque',
                    empty: 'Nenhum ficheiro selecionado'
                },
                createMissing: {
                    name: 'Página inicial: Criar nota se não existir',
                    desc: 'Cria a nota periódica ao iniciar ou através do comando se não existir.'
                }
            },
            excludedNotes: {
                name: 'Ocultar notas com regras de propriedades (perfil do cofre)',
                desc: 'Lista de regras de frontmatter separadas por vírgulas. Use entradas `key` ou `key=value` (ex: status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'Ocultar ficheiros (perfil do cofre)',
                desc: 'Lista de padrões de nomes de ficheiros separados por vírgulas para ocultar. Suporta curingas * e caminhos / (ex: temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Perfil do cofre',
                desc: 'Os perfis armazenam visibilidade de tipos de ficheiro, ficheiros ocultos, pastas ocultas, etiquetas ocultas, regras de propriedades para notas ocultas, atalhos e banner de navegação. Mude de perfis a partir do cabeçalho do painel de navegação.',
                defaultName: 'Predefinido',
                addButton: 'Adicionar perfil',
                editProfilesButton: 'Editar perfis',
                addProfileOption: 'Adicionar perfil...',
                applyButton: 'Aplicar',
                deleteButton: 'Eliminar perfil',
                addModalTitle: 'Adicionar perfil',
                editProfilesModalTitle: 'Editar perfis',
                addModalPlaceholder: 'Nome do perfil',
                deleteModalTitle: 'Eliminar {name}',
                deleteModalMessage:
                    'Remover {name}? Os filtros de ficheiros, pastas, etiquetas e notas baseados em propriedades guardados neste perfil serão eliminados.',
                moveUp: 'Mover para cima',
                moveDown: 'Mover para baixo',
                errors: {
                    emptyName: 'Introduza um nome de perfil',
                    duplicateName: 'Nome de perfil já existe'
                }
            },
            vaultTitle: {
                name: 'Posição do título do cofre',
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
            descendantExcludedFolders: {
                name: 'Excluir pastas das notas de subpastas (perfil do cofre)',
                desc: 'Lista de pastas separadas por vírgulas a omitir ao recolher notas de subpastas. As pastas permanecem visíveis, e selecionar uma continua a mostrar as suas notas. Usa os mesmos padrões de Ocultar pastas.',
                placeholder: 'diário, recursos, /arquivo'
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
            showFileProperties: {
                name: 'Mostrar propriedades de ficheiros',
                desc: 'Exibir propriedades nos itens de ficheiro. Usa o diálogo "Visibilidade das chaves de propriedade" para escolher que propriedades são mostradas.'
            },
            colorFileProperties: {
                name: 'Colorir propriedades de ficheiros',
                desc: 'Aplicar cores de propriedade aos emblemas de propriedade nos itens de ficheiro.'
            },
            prioritizeColoredFileProperties: {
                name: 'Mostrar propriedades coloridas primeiro',
                desc: 'Ordenar propriedades coloridas antes de outras propriedades nos itens de ficheiro.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Mostrar propriedades no modo compacto',
                desc: 'Exibir propriedades quando o modo compacto está ativo.'
            },
            textCountDisplay: {
                name: 'Tipo de contagem',
                desc: 'Escolha que contagens de notas aparecem nos itens de ficheiro.',
                options: {
                    none: 'Nenhuma',
                    words: 'Contagem de palavras',
                    characters: 'Contagem de caracteres',
                    both: 'Contagem de palavras e caracteres'
                }
            },
            textCountPlacement: {
                name: 'Posicionamento',
                desc: 'Escolha onde aparecem as contagens de notas.',
                options: {
                    title: 'No título',
                    property: 'Como propriedade'
                }
            },
            characterCountSpaces: {
                name: 'Contagem de caracteres',
                desc: 'Escolha se os espaços são incluídos na contagem de caracteres.',
                options: {
                    include: 'Incluindo espaços',
                    exclude: 'Excluindo espaços'
                }
            },
            wordCountTargetProperty: {
                name: 'Propriedade de destino',
                desc: 'Chave da propriedade frontmatter que contém a contagem de palavras de destino. Deixe em branco para ocultar destinos.'
            },
            showWordCountPercentage: {
                name: 'Mostrar percentagem de destino',
                desc: 'Mostrar apenas a percentagem de progresso quando houver uma contagem de palavras de destino disponível.'
            },
            propertyFields: {
                name: 'Chaves de propriedades (perfil do cofre)',
                desc: 'Chaves de propriedades de metadados, com visibilidade por chave para navegação e lista de ficheiros.',
                addButtonTooltip: 'Configurar chaves de propriedade',
                noneConfigured: 'Nenhuma propriedade configurada',
                singleConfigured: '1 propriedade configurada: {properties}',
                multipleConfigured: '{count} propriedades configuradas: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'Mostrar propriedades em linhas separadas',
                desc: 'Mostrar cada propriedade na sua própria linha.'
            },
            enablePropertyInternalLinks: {
                name: 'Ligar etiquetas de propriedade a notas',
                desc: 'Clique numa etiqueta de propriedade para abrir a nota ligada.'
            },
            enablePropertyExternalLinks: {
                name: 'Ligar etiquetas de propriedade a URLs',
                desc: 'Clique numa etiqueta de propriedade para abrir o URL ligado.'
            },
            dateFormat: {
                name: 'Formato de data',
                desc: 'Formato para exibir datas (usa formato Moment).',
                placeholder: 'D MMM YYYY',
                help: 'Formatos comuns:\nD MMM YYYY = 25 Mai 2022\nDD/MM/YYYY = 25/05/2022\nYYYY-MM-DD = 2022-05-25\n\nTokens:\nYYYY/YY = ano\nMMMM/MMM/MM = mês\nDD/D = dia\ndddd/ddd = dia da semana',
                helpTooltip: 'Formato usando Moment',
                momentLinkText: 'formato Moment'
            },
            timeFormat: {
                name: 'Formato de hora',
                desc: 'Formato para exibir horas (usa formato Moment).',
                placeholder: 'HH:mm',
                help: 'Formatos comuns:\nh:mm a = 2:30 PM (12 horas)\nHH:mm = 14:30 (24 horas)\nh:mm:ss a = 2:30:45 PM\nHH:mm:ss = 14:30:45\n\nTokens:\nHH/H = 24 horas\nhh/h = 12 horas\nmm = minutos\nss = segundos\na = AM/PM',
                helpTooltip: 'Formato usando Moment',
                momentLinkText: 'formato Moment'
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
            stripLatexInPreview: {
                name: 'Remover LaTeX nas pré-visualizações',
                desc: 'Remover expressões LaTeX inline e em bloco do texto de pré-visualização.'
            },
            previewProperties: {
                name: 'Propriedades de pré-visualização',
                desc: 'Lista de propriedades frontmatter separadas por vírgulas para verificar texto de pré-visualização. A primeira propriedade com texto será usada.',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'Recorrer ao conteúdo da nota',
                desc: 'Mostrar o conteúdo da nota como pré-visualização quando nenhuma das propriedades especificadas contém texto.'
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
                    '2': '2 linhas',
                    '3': '3 linhas'
                }
            },
            useFolderColor: {
                name: 'Usar cor da pasta',
                desc: 'Colorir títulos de notas e ícones de ficheiros com a cor da pasta pai quando não está definida uma cor de ficheiro personalizada. Prioridade: cor de ficheiro personalizada > cor da pasta > cor predefinida.'
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
                desc: 'Lista separada por vírgulas de propriedades frontmatter a verificar primeiro. Usa a primeira imagem no conteúdo markdown como alternativa.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'Excluir notas com propriedades',
                desc: 'Lista separada por vírgulas de propriedades frontmatter. Notas contendo qualquer uma destas propriedades não armazenam imagens de destaque.',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: 'Tamanho de exibição da imagem de destaque',
                desc: 'Tamanho máximo de renderização para imagens de destaque em listas de notas.',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'Tamanho em pixels da imagem de destaque',
                desc: 'Resolução utilizada ao gerar miniaturas armazenadas de imagens de destaque. Aumente este valor se as pré-visualizações maiores parecerem desfocadas.',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'Transferir imagens externas',
                desc: 'Transferir imagens remotas e miniaturas do YouTube para imagens de destaque.'
            },
            hideDrawingPreviewImages: {
                name: 'Ocultar imagens de pré-visualização exportadas',
                desc: 'Oculta ficheiros PNG de pré-visualização de desenhos exportados. Ative "Mostrar itens ocultos" para os apresentar.'
            },
            drawingIntegrationInfo: {
                intro: 'O Notebook Navigator apresenta ficheiros PNG exportados pelo Excalidraw como pré-visualizações de desenhos.',
                items: [
                    'Nas **definições do Excalidraw**, abra **Embedding Excalidraw into your Notes and Exporting**, depois **Export Settings**, depois **Auto-export Settings**.',
                    'Ative **Auto-export PNG**. Opcionalmente, ative **Export both dark- and light-themed image**.',
                    'O Notebook Navigator procura **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** ou **Drawing.excalidraw.light.png**.',
                    'Enquanto **Ocultar imagens de pré-visualização exportadas** estiver ativo, os ficheiros PNG aparecem apenas quando **Mostrar itens ocultos** também estiver ativo.'
                ]
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
            folderSortOrder: {
                name: 'Ordem de ordenação de pastas',
                desc: 'Clique com o botão direito em qualquer pasta para definir uma ordem de classificação diferente para os seus subitens.',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A'
                }
            },
            showNoteCount: {
                name: 'Mostrar contagem de notas',
                desc: 'Exibir contagens de notas junto a pastas, etiquetas e propriedades.'
            },
            showSectionIcons: {
                name: 'Mostrar ícones para atalhos e itens recentes',
                desc: 'Exibir ícones junto aos itens nas secções Atalhos e Recentes.'
            },
            interfaceIcons: {
                name: 'Ícones de interface',
                desc: 'Editar ícones da barra de ferramentas, pastas, etiquetas, propriedades, itens fixados, pesquisa e ordenação.',
                buttonText: 'Editar ícones'
            },
            showIconsColorOnly: {
                name: 'Aplicar cor apenas aos ícones',
                desc: 'Quando ativado, as cores personalizadas são aplicadas apenas aos ícones. Quando desativado, as cores são aplicadas aos ícones e às etiquetas de texto.'
            },
            navRainbowMode: {
                name: 'Modo de cores arco-íris (perfil do cofre)',
                desc: 'Aplicar cores arco-íris no painel de navegação.',
                options: {
                    none: 'Desativado',
                    foreground: 'Cor do texto',
                    background: 'Cor de fundo'
                }
            },
            navRainbowFirstColor: {
                name: 'Primeira cor',
                desc: 'Primeira cor no gradiente arco-íris.'
            },
            navRainbowLastColor: {
                name: 'Última cor',
                desc: 'Última cor no gradiente arco-íris.'
            },
            navRainbowTransitionStyle: {
                name: 'Estilo de transição',
                desc: 'Interpolação utilizada entre a primeira e a última cor.',
                options: {
                    hue: 'Matiz',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'Aplicar a atalhos',
                desc: 'Aplicar cores arco-íris aos atalhos.'
            },
            navRainbowApplyToRecent: {
                name: 'Aplicar a itens recentes',
                desc: 'Aplicar cores arco-íris aos itens recentes.'
            },
            navRainbowApplyToFolders: {
                name: 'Aplicar a pastas',
                desc: 'Aplicar cores arco-íris às pastas.'
            },
            navRainbowFolderScope: {
                name: 'Âmbito de pastas',
                desc: 'Selecionar quais níveis de pasta iniciam atribuições de cor.',
                options: {
                    root: 'Nível raiz',
                    child: 'Nível secundário',
                    all: 'Todos os níveis'
                }
            },
            navRainbowApplyToTags: {
                name: 'Aplicar a etiquetas',
                desc: 'Aplicar cores arco-íris às etiquetas.'
            },
            navRainbowTagScope: {
                name: 'Âmbito de etiquetas',
                desc: 'Selecionar quais níveis de etiqueta iniciam atribuições de cor.',
                options: {
                    root: 'Nível raiz',
                    child: 'Nível secundário',
                    all: 'Todos os níveis'
                }
            },
            navRainbowApplyToProperties: {
                name: 'Aplicar a propriedades',
                desc: 'Aplicar cores arco-íris às propriedades.'
            },
            navRainbowBalanceHueLuminance: {
                name: 'Brilho consistente entre matizes', // (English: Consistent brightness across hues)
                desc: 'Interpola o brilho entre as cores inicial e final durante as transições de matiz.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'Cores separadas para modo claro e escuro', // (English: Separate light and dark mode colors)
                desc: 'Usar cores de arco-íris diferentes para o modo claro e o modo escuro.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'Copiar cor do modo claro para o modo escuro', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'Âmbito de propriedades',
                desc: 'Selecionar quais níveis de propriedade iniciam atribuições de cor.',
                options: {
                    root: 'Nível raiz',
                    child: 'Nível secundário',
                    all: 'Todos os níveis'
                }
            },
            collapseBehavior: {
                name: 'Recolher itens',
                desc: 'Escolha o que o botão expandir/recolher tudo afeta.',
                options: {
                    all: 'Tudo',
                    foldersOnly: 'Apenas pastas',
                    tagsOnly: 'Apenas etiquetas',
                    propertiesOnly: 'Apenas propriedades'
                }
            },
            smartCollapse: {
                name: 'Manter item selecionado expandido',
                desc: 'Ao recolher, manter o item selecionado e os seus pais expandidos.'
            },
            excludeVaultRootFromCollapse: {
                name: 'Ignorar raiz do cofre ao recolher',
                desc: 'Ao recolher todos os itens, deixe a pasta raiz do cofre no estado atual.'
            },
            navIndent: {
                name: 'Indentação da árvore',
                desc: 'Ajustar a largura de indentação para pastas, etiquetas e propriedades aninhadas (pixels).'
            },
            navItemHeight: {
                name: 'Altura do item',
                desc: 'Ajustar a altura das pastas, etiquetas e propriedades no painel de navegação (pixels).'
            },
            navItemHeightScaleText: {
                name: 'Escalar texto com altura do item',
                desc: 'Reduzir o tamanho do texto de navegação quando a altura do item é diminuída.'
            },
            showIndentGuides: {
                name: 'Mostrar guias de indentação',
                desc: 'Apresentar guias de indentação para pastas, etiquetas e propriedades aninhadas.'
            },
            navCountLeaderStyle: {
                name: 'Mostrar carateres de preenchimento',
                desc: 'Apresentar pontos, traços ou uma linha entre os nomes dos itens e o número de notas.',
                options: {
                    none: 'Nenhum',
                    dots: 'Pontos (...)',
                    dashes: 'Traços (---)',
                    line: 'Linha'
                }
            },
            navRootSpacing: {
                name: 'Espaçamento de itens raiz',
                desc: 'Espaçamento entre pastas, etiquetas e propriedades de nível raiz (pixels).'
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
                desc: 'Clique com o botão direito em qualquer etiqueta para definir uma ordem de classificação diferente para os seus subitens.',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A',
                    frequency: 'Frequência',
                    lowToHigh: 'baixa para alta',
                    highToLow: 'alta para baixa'
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
            scopeTagsToCurrentContext: {
                name: 'Filtrar etiquetas por seleção',
                desc: 'Mostrar apenas etiquetas que aparecem em notas na pasta ou propriedade selecionada.'
            },
            keepEmptyTagsProperty: {
                name: 'Manter propriedade tags após remover última etiqueta',
                desc: 'Manter a propriedade tags do frontmatter quando todas as etiquetas são removidas. Quando desativado, a propriedade tags é eliminada do frontmatter.'
            },
            showProperties: {
                name: 'Mostrar propriedades',
                desc: 'Exibir a secção de propriedades no navegador.',
                propertyKeysInfoPrefix: 'Configurar propriedades em ',
                propertyKeysInfoLinkText: 'Início > Chaves de propriedades',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'Mostrar ícones de propriedades',
                desc: 'Exibir ícones ao lado das propriedades no painel de navegação.'
            },
            inheritPropertyColors: {
                name: 'Herdar cores de propriedade',
                desc: 'Os valores de propriedade herdam a cor e o fundo da sua chave de propriedade.'
            },
            propertySortOrder: {
                name: 'Ordem de classificação de propriedades',
                desc: 'Clique com o botão direito em qualquer propriedade para definir uma ordem de classificação diferente para os seus valores.',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A',
                    frequency: 'Frequência',
                    lowToHigh: 'baixo a alto',
                    highToLow: 'alto a baixo'
                }
            },
            showAllPropertiesFolder: {
                name: 'Mostrar pasta de propriedades',
                desc: 'Exibir "Propriedades" como uma pasta recolhível.'
            },
            scopePropertiesToCurrentContext: {
                name: 'Filtrar propriedades por seleção',
                desc: 'Mostrar apenas propriedades que aparecem em notas na pasta ou etiqueta selecionada.'
            },
            hiddenTags: {
                name: 'Ocultar etiquetas (perfil do cofre)',
                desc: 'Lista de padrões de etiquetas separados por vírgulas. Padrões de nome: tag* (começa com), *tag (termina com). Padrões de caminho: arquivo (etiqueta e descendentes), arquivo/* (apenas descendentes), projetos/*/rascunhos (curinga intermédio).',
                placeholder: 'arquivo*, *rascunho, projetos/*/antigo'
            },
            hiddenFileTags: {
                name: 'Ocultar notas com tags (perfil do cofre)',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'Ativar notas de pasta',
                desc: 'As pastas com um ficheiro de nota correspondente são apresentadas como ligações clicáveis.'
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
            folderNoteNamePattern: {
                name: 'Padrão de nome da nota de pasta',
                desc: 'Padrão de nome para notas de pasta sem extensão. Use {{folder}} para inserir o nome da pasta. Quando definido, o nome da nota de pasta não se aplica.'
            },
            folderNoteTemplate: {
                name: 'Modelo de nota de pasta',
                desc: 'Ficheiro de modelo usado ao criar notas de pasta. Os modelos Markdown podem usar Templater. Os modelos Canvas e Base são copiados como conteúdo do ficheiro. Definir localização da pasta de modelos em Operações de ficheiros > Modelos.',
                formatWarning: 'O formato do modelo deve corresponder ao tipo de nota de pasta selecionado: .md, .canvas ou .base.'
            },
            enableFolderNoteLinks: {
                name: 'Nomes de pastas abrem notas de pasta',
                desc: 'Clicar no nome de uma pasta abre a respetiva nota de pasta. Quando desativado, as notas de pasta fornecem apenas metadados da pasta, como nome, ícone e cor.'
            },
            hideFolderNoteInList: {
                name: 'Ocultar nota de pasta na lista',
                desc: 'Ocultar notas de pasta da lista de ficheiros.'
            },
            pinCreatedFolderNote: {
                name: 'Fixar notas de pasta criadas',
                desc: 'Fixar notas de pasta ao criá-las a partir do menu de contexto.'
            },
            folderNoteOpenLocation: {
                name: 'Abrir notas de pasta em',
                desc: 'Escolha onde as notas de pasta abrem ao clicar em ligações de notas de pasta.',
                options: {
                    currentTab: 'Separador atual',
                    newTab: 'Novo separador',
                    rightSidebar: 'Barra lateral direita'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: 'Barra lateral direita: Mostrar nota de pasta mais próxima',
                desc: 'Quando uma pasta é selecionada, a barra lateral direita mostra automaticamente a nota de pasta ancestral mais próxima.'
            },
            confirmBeforeDelete: {
                name: 'Confirmar antes de eliminar',
                desc: 'Mostrar diálogo de confirmação ao eliminar notas ou pastas'
            },
            deleteAttachments: {
                name: 'Eliminar anexos ao eliminar ficheiros',
                desc: 'Remover automaticamente os anexos associados e as pré-visualizações de desenhos geradas se não forem utilizados noutro local',
                options: {
                    ask: 'Perguntar sempre',
                    always: 'Sempre',
                    never: 'Nunca'
                }
            },
            moveFileConflicts: {
                name: 'Conflitos de movimentação',
                desc: 'Ao mover um ficheiro para uma pasta onde já existe um ficheiro com o mesmo nome. Perguntar sempre (renomear, substituir, cancelar) ou renomear sempre.',
                options: {
                    ask: 'Perguntar sempre',
                    rename: 'Renomear sempre'
                }
            },
            metadataCleanup: {
                name: 'Limpar metadados',
                desc: 'Remove metadados órfãos deixados quando ficheiros, pastas, etiquetas ou propriedades são eliminados, movidos ou renomeados fora do Obsidian. Isto afeta apenas o ficheiro de definições do Notebook Navigator.',
                buttonText: 'Limpar metadados',
                error: 'Falha na limpeza de definições',
                loading: 'A verificar metadados...',
                statusClean: 'Sem metadados para limpar',
                statusCounts:
                    'Itens órfãos: {folders} pastas, {tags} etiquetas, {properties} propriedades, {files} ficheiros, {pinned} fixados, {separators} separadores'
            },
            rebuildCache: {
                name: 'Reconstruir cache',
                desc: 'Use isto se tiver etiquetas em falta, pré-visualizações incorretas ou imagens de destaque em falta. Isto pode acontecer após conflitos de sincronização ou encerramentos inesperados.',
                buttonText: 'Reconstruir cache',
                error: 'Falha ao reconstruir cache',
                indexingTitle: 'A indexar o cofre...',
                progress: 'A atualizar a cache do Notebook Navigator.'
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
            frontmatterBackgroundField: {
                name: 'Campo de fundo',
                desc: 'Campo frontmatter para cores de fundo. Deixe vazio para usar cores de fundo guardadas nas definições.',
                placeholder: 'background'
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
                placeholder: 'title, name'
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
                desc: 'Formato usado para analisar timestamps no frontmatter. Deixe vazio para usar parsing ISO 8601.',
                helpTooltip: 'Formato usando Moment',
                momentLinkText: 'formato Moment',
                help: 'Formatos comuns:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'Apoiar desenvolvimento',
                desc: 'Se gosta de usar o Notebook Navigator, por favor considere apoiar o seu desenvolvimento contínuo.',
                buttonText: '❤️ Patrocinar',
                coffeeButton: '☕️ Compre-me um café'
            },
            updateCheckOnStart: {
                name: 'Verificar nova versão ao iniciar',
                desc: 'Verifica novos lançamentos do plugin ao iniciar e mostra uma notificação quando uma atualização está disponível. As verificações ocorrem no máximo uma vez por dia.',
                status: 'Nova versão disponível: {version}'
            },
            debugLogging: {
                name: 'Registo de depuração no arranque',
                desc: 'Escreve diagnósticos de arranque num ficheiro Markdown com carimbo de data/hora na raiz do cofre e para depois de o arranque estabilizar. O ficheiro pode ser sincronizado e pode incluir caminhos de ficheiros.'
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
        openBannerImage: 'Abrir imagem do banner da versão',
        supportMessage: 'Se acha o Notebook Navigator útil, por favor considere apoiar o seu desenvolvimento.',
        supportButton: 'Compre-me um café',
        thanksButton: 'Obrigado!'
    }
};
