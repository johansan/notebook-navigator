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
 * Portuguese (Brazil) language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_PT_BR = {
    // Common UI elements
    common: {
        cancel: 'Cancelar',
        delete: 'Excluir',
        clear: 'Limpar',
        remove: 'Remover',
        restoreDefault: 'Restaurar padrão', // Button text for restoring values to defaults (English: Restore default)
        submit: 'Enviar',
        save: 'Salvar', // Button text for saving settings and dialogs (English: Save)
        configure: 'Configurar', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'Modo claro', // Label for light theme mode (English: Light mode)
        darkMode: 'Modo escuro', // Label for dark theme mode (English: Dark mode)
        noSelection: 'Nenhuma seleção',
        untagged: 'Sem etiquetas',
        featureImageAlt: 'Imagem de destaque',
        unknownError: 'Erro desconhecido',
        clipboardWriteError: 'Não foi possível gravar na área de transferência',
        updateBannerTitle: 'Atualização do Notebook Navigator disponível',
        updateBannerInstruction: 'Atualize em Configurações -> Plugins não oficiais',
        previous: 'Anterior', // Generic aria label for previous navigation (English: Previous)
        next: 'Próximo' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Selecione uma pasta ou etiqueta para ver notas',
        emptyStateNoNotes: 'Sem notas',
        pinnedSection: 'Fixadas',
        notesSection: 'Notas',
        filesSection: 'Arquivos',
        hiddenItemAriaLabel: '{name} (oculto)',
        collapseGroup: 'Recolher grupo',
        expandGroup: 'Expandir grupo',
        manualSortTitle: 'Classificação manual: {property}',
        manualSortHint: 'Arraste para reordenar. A ordem é salva como valores numéricos de índice na propriedade "{property}".',
        manualSortNonMarkdownHint: 'Arquivos não Markdown são exibidos no final e não podem ser reordenados.',
        unsortedSection: 'Não classificados',
        propertyGroupNoValue: 'Nenhum',
        manualSortDone: 'Concluído',
        manualSortMultipleWriteFailure: '{count} arquivos falharam; primeiro: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Sem etiquetas',
        tags: 'Etiquetas'
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Atalhos',
        recentFilesHeader: 'Arquivos recentes', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Propriedades',
        folders: 'Pastas',
        tags: 'Etiquetas',
        calendar: 'Calendário',
        reorderRootFoldersTitle: 'Reordenar navegação',
        reorderRootFoldersHint: 'Use setas ou arraste para reordenar',
        vaultRootLabel: 'Cofre',
        resetRootToAlpha: 'Redefinir para ordem alfabética',
        resetRootToFrequency: 'Redefinir para ordem de frequência',
        pinShortcuts: 'Fixar atalhos',
        pinShortcutsAndRecentFiles: 'Fixar atalhos e arquivos recentes',
        unpinShortcuts: 'Desafixar atalhos',
        unpinShortcutsAndRecentFiles: 'Desafixar atalhos e arquivos recentes',
        profileMenuAria: 'Alterar perfil do cofre'
    },

    navigationCalendar: {
        ariaLabel: 'Calendário',
        dailyNotesNotEnabled: 'O plugin nativo Notas Diárias não está ativado.',
        noteHiddenByProfile: 'A nota do calendário está oculta pelo perfil do cofre atual.',
        createDailyNote: {
            title: 'Nova nota diária',
            message: 'O arquivo {filename} não existe. Deseja criá-lo?',
            confirmButton: 'Criar'
        },
        helpModal: {
            title: 'Atalhos do calendário',
            items: [
                'Clique em qualquer dia para abrir ou criar uma nota diária. Semanas, meses, trimestres e anos funcionam da mesma forma.',
                'Um ponto preenchido abaixo de um dia significa que ele tem uma nota. Um ponto oco significa que ele tem tarefas pendentes.',
                'Se uma nota tiver uma imagem de destaque, ela aparece como plano de fundo do dia.'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+clique em uma data para filtrar por essa data na lista de arquivos.',
            dateFilterOptionAlt: '`Option/Alt`+clique em uma data para filtrar por essa data na lista de arquivos.'
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
        emptySearchQuery: 'Digite uma consulta antes de salvar',
        emptySearchName: 'Digite um nome antes de salvar a pesquisa',
        add: 'Adicionar aos atalhos',
        addNotesCount: 'Adicionar {count} notas aos atalhos',
        addFilesCount: 'Adicionar {count} arquivos aos atalhos',
        rename: 'Renomear atalho',
        remove: 'Remover dos atalhos',
        removeAll: 'Remover todos os atalhos',
        removeAllConfirm: 'Remover todos os atalhos?',
        folderNotesPinned: '{count} notas de pasta fixadas'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Recolher itens',
        expandAllFolders: 'Expandir todos os itens',
        collapseAllListGroups: 'Recolher todos os grupos da lista',
        expandAllListGroups: 'Expandir todos os grupos da lista',
        showCalendar: 'Mostrar calendário',
        hideCalendar: 'Ocultar calendário',
        newFolder: 'Nova pasta',
        newNote: 'Nova nota',
        mobileBackToNavigation: 'Voltar à navegação',
        changeChildSortOrder: 'Alterar ordem de classificação',
        changeSortAndGroup: 'Alterar classificação e agrupamento',
        resetViewToDefaults: 'Redefinir visualização para o padrão',
        manualSort: 'Classificação manual',
        editSortOrder: 'Editar ordem de classificação...',
        removeSortProperty: 'Remover propriedade de classificação',
        descendants: 'descendentes',
        subfolders: 'subpastas',
        subtags: 'subetiquetas',
        childValues: 'valores filhos',
        applySortAndGroupToDescendants: (target: string) => `Aplicar classificação e agrupamento a ${target}`,
        applyAppearanceToDescendants: (target: string) => `Aplicar aparência a ${target}`,
        resetAppearanceInDescendants: (target: string) => `Redefinir aparência em ${target}`,
        showFolders: 'Mostrar navegação',
        reorderRootFolders: 'Reordenar navegação',
        finishRootFolderReorder: 'Concluído',
        showExcludedItems: 'Mostrar pastas, etiquetas e notas ocultas',
        hideExcludedItems: 'Ocultar pastas, etiquetas e notas ocultas',
        showDualPane: 'Mostrar painéis duplos',
        showSinglePane: 'Mostrar painel único',
        dualPaneAutoFallbackNotice:
            'Os painéis duplos não estão disponíveis quando a barra lateral está estreita demais. Para mudar isso, defina "Quando a barra lateral está estreita demais" como "Não fazer nada" em Configurações > Aparência e comportamento.',
        changeAppearance: 'Alterar aparência',
        changeAppearanceCustomized: 'Alterar aparência, personalizada',
        showNotesFromSubfolders: 'Mostrar notas de subpastas',
        showFilesFromSubfolders: 'Mostrar arquivos de subpastas',
        showNotesFromDescendants: 'Mostrar notas de descendentes',
        showFilesFromDescendants: 'Mostrar arquivos de descendentes',
        search: 'Pesquisar'
    },

    // Search input
    searchInput: {
        placeholder: 'Pesquisar...',
        placeholderVault: 'Pesquisar no cofre...',
        placeholderOmnisearch: 'Omnisearch...',
        clearSearch: 'Limpar pesquisa',
        switchToFilterSearch: 'Mudar para pesquisa por filtro',
        switchToOmnisearch: 'Mudar para Omnisearch',
        saveSearchShortcut: 'Salvar atalho de pesquisa',
        removeSearchShortcut: 'Remover atalho de pesquisa',
        shortcutModalTitle: 'Salvar atalho de pesquisa',
        shortcutNamePlaceholder: 'Digite o nome do atalho',
        shortcutStartIn: 'Sempre iniciar em: {path}',
        searchHelp: 'Sintaxe de pesquisa',
        searchHelpTitle: 'Sintaxe de pesquisa',
        searchHelpModal: {
            intro: 'A pesquisa por filtro encontra notas por nomes de exibição, aliases, propriedades, etiquetas, datas e filtros, combinados em uma consulta (ex. `meeting .status=active #work @thisweek`). Clique no ícone de estrela para salvar uma pesquisa como atalho.',
            introInstallOmnisearch: 'A pesquisa de texto completo no conteúdo das notas requer o plugin Omnisearch.',
            introSwitching:
                'Alterne entre pesquisa por filtro e Omnisearch usando as teclas de seta para cima/baixo ou clicando no ícone de pesquisa.',
            activeFilterSearch: 'A pesquisa por filtro está ativa.',
            activeOmnisearch: 'O Omnisearch está ativo.',
            omnisearchIntro:
                'O Omnisearch realiza pesquisa de texto completo no conteúdo das notas de todo o cofre. O Notebook Navigator mostra as correspondências que pertencem à pasta, etiqueta ou seleção atual.',
            sections: {
                fileNames: {
                    title: 'Nomes de arquivos e aliases',
                    items: [
                        '`word` Encontrar notas com "word" no nome de exibição ou em um alias.',
                        '`word1 word2` Cada palavra deve corresponder ao nome de exibição ou a um dos aliases.',
                        '`-word` Excluir notas com "word" no nome de exibição ou em um alias.',
                        '`"text"` Corresponder ao texto literalmente; um termo que começa com aspas duplas nunca é interpretado como etiqueta, propriedade, data ou filtro (por exemplo: `".F"`).',
                        '`-"text"` Excluir notas com o texto literal no nome de exibição ou em um alias.'
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
                        'Cmd/Ctrl+Clique em uma etiqueta para adicionar com AND. Cmd/Ctrl+Shift+Clique para adicionar com OR.'
                    ]
                },
                properties: {
                    title: 'Propriedades',
                    items: [
                        '`.key` Incluir notas com uma chave de propriedade que começa com `key`.',
                        '`.key=value` Incluir notas cujo valor de propriedade contenha `value`.',
                        '`."Reading Status"` Incluir notas com uma chave de propriedade que contém espaços.',
                        '`."Reading Status"="In Progress"` Chaves e valores com espaços devem estar entre aspas duplas.',
                        '`-.key` Excluir notas com uma chave de propriedade que começa com `key`.',
                        '`-.key=value` Excluir notas cujo valor de propriedade contenha `value`.',
                        'Cmd/Ctrl+Clique em uma propriedade para adicionar com AND. Cmd/Ctrl+Shift+Clique para adicionar com OR.'
                    ]
                },
                tasks: {
                    title: 'Filtros',
                    items: [
                        '`has:task` Incluir notas com tarefas pendentes.',
                        '`-has:task` Excluir notas com tarefas pendentes.',
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
                        '`AND` e `OR` são operadores apenas em consultas exclusivas de etiquetas e propriedades.',
                        'As consultas exclusivas de etiquetas e propriedades contêm apenas filtros de etiquetas e propriedades: `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`.',
                        'Se uma consulta incluir nomes, datas (`@...`), filtros de tarefas (`has:task`), filtros de pasta (`folder:...`) ou filtros de extensão (`ext:...`), `AND` e `OR` são pesquisados como palavras.',
                        'Exemplo de consulta com operadores: `#work OR .status=started`.',
                        'Exemplo de consulta mista: `#work OR ext:md` (`OR` é pesquisado nos nomes dos arquivos).'
                    ]
                },
                dates: {
                    title: 'Datas',
                    items: [
                        '`@today` Encontrar notas de hoje usando o campo de data padrão.',
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` Intervalos de datas relativos.',
                        '`@2026-02-07` Encontrar um dia específico (também suporta `@20260207`).',
                        '`@2026` Encontrar um ano calendário.',
                        '`@2026-02` ou `@202602` Encontrar um mês calendário.',
                        '`@2026-W05` ou `@2026W05` Encontrar uma semana ISO.',
                        '`@2026-Q2` ou `@2026Q2` Encontrar um trimestre calendário.',
                        '`@13/02/2026` Formatos numéricos com separadores (`@07022026` segue seu idioma quando ambíguo).',
                        '`@2026-02-01..2026-02-07` Encontrar um intervalo de dias inclusivo (extremos abertos suportados).',
                        '`@c:...` ou `@m:...` Apontar para data de criação ou modificação.',
                        '`-@...` Excluir uma correspondência de data.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'A consulta é enviada ao plugin Omnisearch e segue a sintaxe de consulta do Omnisearch. Tokens da pesquisa por filtro como `#tag`, `.property` e `@date` não têm significado especial.',
                        'Quando uma pasta está selecionada, `path:"<folder>/"` é adicionado à consulta para que o Omnisearch encontre correspondências nessa pasta e em suas subpastas. Consultas que já contêm `path:` são enviadas sem alterações.',
                        'O Omnisearch retorna no máximo 50 resultados classificados por relevância. Pesquisas com mais correspondências omitem as notas com classificação mais baixa.',
                        'Limitar a pesquisa a caminhos de pasta com caracteres não-ASCII requer o Omnisearch 1.30.0 ou posterior. Versões mais antigas pesquisam em todo o cofre e os resultados são depois filtrados pela pasta.',
                        'Consultas com menos de 3 caracteres podem ser lentas em cofres grandes.',
                        'As visualizações das notas mostram trechos do Omnisearch em vez do texto de visualização padrão.'
                    ]
                }
            }
        }
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'Abrir em nova aba',
            openToRight: 'Abrir à direita',
            openInNewWindow: 'Abrir em nova janela',
            openMultipleInNewTabs: 'Abrir {count} notas em novas abas',
            openMultipleFilesInNewTabs: 'Abrir {count} arquivos em novas abas',
            openMultipleToRight: 'Abrir {count} notas à direita',
            openMultipleFilesToRight: 'Abrir {count} arquivos à direita',
            openMultipleInNewWindows: 'Abrir {count} notas em novas janelas',
            openMultipleFilesInNewWindows: 'Abrir {count} arquivos em novas janelas',
            pinNote: 'Fixar nota',
            pinFile: 'Fixar arquivo',
            unpinNote: 'Desafixar nota',
            unpinFile: 'Desafixar arquivo',
            pinMultipleNotes: 'Fixar {count} notas',
            pinMultipleFiles: 'Fixar {count} arquivos',
            unpinMultipleNotes: 'Desafixar {count} notas',
            unpinMultipleFiles: 'Desafixar {count} arquivos',
            duplicateNote: 'Duplicar nota',
            duplicateFile: 'Duplicar arquivo',
            duplicateMultipleNotes: 'Duplicar {count} notas',
            duplicateMultipleFiles: 'Duplicar {count} arquivos',
            openVersionHistory: 'Abrir histórico de versões',
            revealInFolder: 'Revelar na pasta',
            revealInFinder: 'Revelar no Finder',
            showInExplorer: 'Mostrar no explorador de arquivos',
            openInDefaultApp: 'Abrir no aplicativo padrão',
            renameNote: 'Renomear nota',
            renameFile: 'Renomear arquivo',
            deleteNote: 'Excluir nota',
            deleteFile: 'Excluir arquivo',
            setCalendarHighlight: 'Definir destaque',
            removeCalendarHighlight: 'Remover destaque',
            deleteMultipleNotes: 'Excluir {count} notas',
            deleteMultipleFiles: 'Excluir {count} arquivos',
            moveNoteToFolder: 'Mover nota para...',
            moveFileToFolder: 'Mover arquivo para...',
            moveMultipleNotesToFolder: 'Mover {count} notas para...',
            moveMultipleFilesToFolder: 'Mover {count} arquivos para...',
            mergeNotes: 'Mesclar {count} notas...',
            mergeNotesInGroup: 'Mesclar notas no grupo...',
            setManualSortGroupHeader: 'Definir cabeçalho de grupo',
            changeManualSortGroupHeader: 'Alterar cabeçalho de grupo',
            manualSortGroupHeader: {
                title: 'Cabeçalho de grupo',
                copyStyle: 'Copiar estilo do cabeçalho',
                pasteStyle: 'Colar estilo do cabeçalho',
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
            newCanvas: 'Novo canvas',
            newBase: 'Nova base',
            newDrawing: 'Novo desenho',
            newExcalidrawDrawing: 'Novo desenho Excalidraw',
            newTldrawDrawing: 'Novo desenho Tldraw',
            duplicateFolder: 'Duplicar pasta',
            searchInFolder: 'Pesquisar na pasta',
            createFolderNote: 'Criar nota de pasta',
            detachFolderNote: 'Desvincular nota de pasta',
            deleteFolderNote: 'Excluir nota de pasta',
            changeIcon: 'Alterar ícone',
            changeColor: 'Alterar cor',
            changeBackground: 'Alterar plano de fundo',
            excludeFolder: 'Ocultar pasta',
            unhideFolder: 'Reexibir pasta',
            hideRootFolder: 'Ocultar pasta raiz',
            showRootFolder: 'Mostrar pasta raiz',
            excludeFromDescendants: 'Ocultar nas pastas superiores',
            includeInDescendants: 'Mostrar nas pastas superiores',
            hiddenFromParentsIndicator: 'Oculta nas listas das pastas superiores',
            moveFolder: 'Mover pasta para...',
            renameFolder: 'Renomear pasta',
            deleteFolder: 'Excluir pasta'
        },
        tag: {
            changeIcon: 'Alterar ícone',
            changeColor: 'Alterar cor',
            changeBackground: 'Alterar plano de fundo',
            showTag: 'Mostrar etiqueta',
            hideTag: 'Ocultar etiqueta'
        },
        property: {
            addKey: 'Configurar chaves de propriedade',
            renameKey: 'Renomear propriedade',
            deleteKey: 'Excluir propriedade'
        },
        navigation: {
            addSeparator: 'Adicionar separador',
            removeSeparator: 'Remover separador'
        },
        copy: {
            title: 'Copiar',
            noteLink: 'link da nota',
            fileLink: 'link do arquivo',
            noteLinkAsFootnote: 'link da nota como nota de rodapé',
            fileLinkAsFootnote: 'link do arquivo como nota de rodapé',
            noteEmbed: 'incorporação da nota',
            fileEmbed: 'incorporação do arquivo',
            obsidianUrl: 'URL do Obsidian',
            pathFromVaultFolder: 'caminho a partir da pasta do cofre',
            pathFromSystemRoot: 'caminho a partir da raiz do sistema'
        },
        style: {
            title: 'Estilo',
            copy: 'Copiar estilo',
            paste: 'Colar estilo',
            removeIcon: 'Remover ícone',
            removeColor: 'Remover cor',
            removeBackground: 'Remover plano de fundo',
            clear: 'Limpar estilo'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        appearance: 'Aparência',
        sortBy: 'Classificar por',
        standardPreset: 'Padrão',
        compactPreset: 'Compacto',
        defaultSuffix: '(padrão)',
        defaultLabel: 'Padrão',
        titleRows: {
            label: 'Linhas do título',
            option: (rows: number) => `${rows} linha${rows === 1 ? '' : 's'} de título`
        },
        previewRows: {
            label: 'Linhas de visualização',
            none: 'Nenhuma',
            option: (rows: number) => `${rows} linha${rows === 1 ? '' : 's'} de visualização`
        },
        groupBy: 'Agrupar por',
        tags: 'Etiquetas',
        properties: 'Propriedades',
        tasks: 'Tarefas',
        date: 'Data',
        parentFolder: 'Pasta pai',
        textCount: {
            label: 'Contagem de texto',
            options: {
                none: 'Nenhuma',
                words: 'Palavras',
                characters: 'Caracteres',
                both: 'Palavras e caracteres'
            }
        },
        resetAppearance: 'Redefinir aparência',
        openPluginSettings: 'Abrir configurações do plugin…'
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Aplicar',
            applySortAndGroupTitle: (target: string) => `Aplicar classificação e agrupamento a ${target}?`,
            applyAppearanceTitle: (target: string) => `Aplicar aparência a ${target}?`,
            resetAppearanceTitle: (target: string) => `Redefinir aparência em ${target}?`,
            applyAppearanceMessage: (count: number, replacedCount: number) =>
                `A aparência mudará para ${count} ${count === 1 ? 'item' : 'itens'}. Aparências personalizadas existentes substituídas: ${replacedCount}. As preferências de aparência salvas são copiadas uma vez; a ordenação e o agrupamento são preservados. Alterações futuras e novos descendentes não ficam vinculados.`,
            resetAppearanceMessage: (count: number) =>
                `A aparência será redefinida para ${count} ${count === 1 ? 'item' : 'itens'}. A ordenação e o agrupamento são preservados. Esta é uma alteração única; alterações futuras e novos descendentes não ficam vinculados.`,
            affectedCountMessage: (count: number) => `Substituições existentes que serão alteradas: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'Usar classificação manual?',
            propertySortMessage: (property: string, count: number) =>
                `Isso muda a visualização atual para classificação manual usando "${property}". Editar a ordem grava valores numéricos de índice nessa propriedade em ${count} ${count === 1 ? 'nota' : 'notas'} conforme necessário.`,
            propertySortConfirmButton: 'Usar classificação manual',
            removePropertyTitle: 'Remover propriedade de classificação?',
            removePropertyMessage: (property: string, count: number) =>
                `Isso remove "${property}" de ${count} ${count === 1 ? 'nota' : 'notas'} na lista atual. A ordem de classificação manual será limpa para essas notas.`,
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
            wordCountTarget: 'Contagem de palavras alvo',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'Quando este campo está vazio, a meta do grupo usa a propriedade de meta definida em Configurações > Exibição de arquivos > Contagem de palavras e caracteres. Substitua definindo um valor de meta para este grupo.',
            description: 'Personalize o cabeçalho de grupo para esta nota. Deixe o título em branco para remover o cabeçalho.'
        },
        mergeNotes: {
            title: 'Mesclar notas',
            summary: 'Criar uma nota a partir de {count} notas em {folder}.',
            frontmatterRule: 'O frontmatter da primeira nota é mantido. O frontmatter das outras notas é removido.',
            crossFolderWarning:
                'As notas de origem estão em pastas diferentes. Links relativos e incorporações podem parar de funcionar na nota mesclada.',
            outputName: 'Nome de saída',
            outputNameDesc: 'A nota mesclada é criada na pasta mostrada acima.',
            outputNamePlaceholder: 'Notas mescladas',
            separator: 'Separador',
            separatorDesc: 'Inserido entre notas.',
            separatorOptions: {
                none: 'Nenhum',
                blankLine: 'Linha em branco',
                horizontalRule: 'Linha horizontal',
                heading: 'Cabeçalho com o título da nota'
            },
            moveSourcesToTrash: 'Mover notas de origem para a lixeira após mesclar',
            mergeButton: 'Mesclar'
        },
        navRainbowSection: {
            title: (section: string) => `Cores arco-íris: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'Pesquisar ícones...',
            recentlyUsedHeader: 'Usados recentemente',
            emptyStateSearch: 'Digite para pesquisar ícones',
            emptyStateNoResults: 'Nenhum ícone encontrado',
            showingResultsInfo: 'Mostrando 50 de {count} resultados. Digite mais para refinar.',
            emojiInstructions: 'Digite ou cole qualquer emoji para usá-lo como ícone',
            removeIcon: 'Remover ícone',
            removeFromRecents: 'Remover dos recentes',
            allTabLabel: 'Todos'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Adicionar regra'
        },
        interfaceIcons: {
            title: 'Ícones da interface',
            fileItemsSection: 'Itens de arquivo',
            items: {
                'nav-shortcuts': 'Atalhos',
                'nav-recent-files': 'Arquivos recentes',
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
                'list-reveal-file': 'Revelar arquivo',
                'list-descendants': 'Notas de subpastas',
                'list-expand-all': 'Expandir todos os grupos',
                'list-collapse-all': 'Recolher todos os grupos',
                'list-sort-ascending': 'Ordem: crescente',
                'list-sort-descending': 'Ordem: decrescente',
                'list-sort-modified': 'Classificar por data de edição',
                'list-sort-created': 'Classificar por data de criação',
                'list-sort-title': 'Classificar por título',
                'list-sort-filename': 'Classificar por nome do arquivo',
                'list-sort-property': 'Classificar por propriedade',
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
                'file-unfinished-task': 'Tarefas',
                'file-word-count': 'Contagem de palavras',
                'file-character-count': 'Contagem de caracteres'
            }
        },
        colorPicker: {
            currentColor: 'Atual',
            newColor: 'Nova',
            paletteDefault: 'Padrão',
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
            tabBackground: 'Plano de fundo',
            resetIcon: 'Remover ícone',
            resetColor: 'Remover cor',
            resetBackground: 'Remover plano de fundo',
            clear: 'Limpar estilo',
            apply: 'Aplicar'
        },
        selectVaultProfile: {
            title: 'Alterar perfil do cofre',
            currentBadge: 'Ativo',
            emptyState: 'Nenhum perfil de cofre disponível.'
        },
        tagOperation: {
            renameTitle: 'Renomear etiqueta {tag}',
            deleteTitle: 'Excluir etiqueta {tag}',
            newTagPrompt: 'Novo nome da etiqueta',
            newTagPlaceholder: 'Digite o novo nome da etiqueta',
            renameWarning: 'Renomear a etiqueta {oldTag} modificará {count} {files}.',
            deleteWarning: 'Excluir a etiqueta {tag} modificará {count} {files}.',
            modificationWarning: 'Isso atualizará as datas de modificação dos arquivos.',
            affectedFiles: 'Arquivos afetados:',
            andMore: '...e mais {count}',
            confirmRename: 'Renomear etiqueta',
            renameUnchanged: '{tag} sem alterações',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            renameBatchNotFinalized:
                'Renomeados {renamed}/{total}. Não atualizados: {notUpdated}. Metadados e atalhos não foram atualizados.',
            invalidTagName: 'Digite um nome de etiqueta válido.',
            descendantRenameError: 'Não é possível mover uma etiqueta para dentro de si mesma ou um descendente.',
            confirmDelete: 'Excluir etiqueta',
            deleteBatchNotFinalized:
                'Removidos de {removed}/{total}. Não atualizados: {notUpdated}. Metadados e atalhos não foram atualizados.',
            checkConsoleForDetails: 'Verifique o console para mais detalhes.',
            file: 'arquivo',
            files: 'arquivos',
            inlineParsingWarning: {
                title: 'Compatibilidade de etiquetas inline',
                message:
                    '{tag} contém caracteres que o Obsidian não consegue analisar em etiquetas inline. As etiquetas do frontmatter não são afetadas.',
                confirm: 'Usar mesmo assim'
            }
        },
        propertyOperation: {
            renameTitle: 'Renomear propriedade {property}',
            deleteTitle: 'Excluir propriedade {property}',
            newKeyPrompt: 'Novo nome da propriedade',
            newKeyPlaceholder: 'Digite o novo nome da propriedade',
            renameWarning: 'Renomear a propriedade {property} modificará {count} {files}.',
            renameConflictWarning:
                'A propriedade {newKey} já existe em {count} {files}. Renomear {oldKey} substituirá os valores existentes de {newKey}.',
            deleteWarning: 'Excluir a propriedade {property} modificará {count} {files}.',
            confirmRename: 'Renomear propriedade',
            confirmDelete: 'Excluir propriedade',
            renameNoChanges: '{oldKey} → {newKey} (sem alterações)',
            renameSettingsUpdateFailed: 'Propriedade {oldKey} → {newKey} renomeada. Não foi possível atualizar as configurações.',
            deleteSingleSuccess: 'Propriedade {property} excluída de 1 nota',
            deleteMultipleSuccess: 'Propriedade {property} excluída de {count} notas',
            deleteSettingsUpdateFailed: 'Propriedade {property} excluída. Não foi possível atualizar as configurações.',
            invalidKeyName: 'Digite um nome de propriedade válido.'
        },
        fileSystem: {
            newFolderTitle: 'Nova pasta',
            renameFolderTitle: 'Renomear pasta',
            renameFileTitle: 'Renomear arquivo',
            deleteFolderTitle: "Excluir '{name}'?",
            deleteFileTitle: "Excluir '{name}'?",
            deleteFileAttachmentsTitle: 'Excluir anexos do arquivo?',
            moveFileConflictTitle: 'Conflito de movimentação',
            folderNamePrompt: 'Digite o nome da pasta:',
            hideInOtherVaultProfiles: 'Ocultar em outros perfis do cofre',
            renamePrompt: 'Digite o novo nome:',
            renameVaultTitle: 'Alterar nome de exibição do cofre',
            renameVaultPrompt: 'Digite um nome de exibição personalizado (deixe em branco para usar o padrão):',
            deleteFolderConfirm: 'Tem certeza de que deseja excluir esta pasta e todo o seu conteúdo?',
            deleteFileConfirm: 'Tem certeza de que deseja excluir este arquivo?',
            deleteFileAttachmentsDescriptionSingle: 'Este anexo não é mais usado em nenhuma nota. Deseja excluí-lo?',
            deleteFileAttachmentsDescriptionMultiple: 'Estes anexos não são mais usados em nenhuma nota. Deseja excluí-los?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Árvore de arquivos',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Galeria',
            moveFileConflictDescriptionSingle: 'Um conflito de arquivo foi encontrado em "{folder}".',
            moveFileConflictDescriptionMultiple: '{count} conflitos de arquivos foram encontrados em "{folder}".',
            moveFileConflictAffectedFiles: 'Arquivos afetados',
            moveFileConflictItem: '"{name}" -> "{suggested}"{renameOnly}',
            moveFileConflictRenameOnly: '(apenas renomear)',
            moveFileConflictRename: 'Renomear',
            moveFileConflictOverwrite: 'Sobrescrever',
            removeAllTagsTitle: 'Remover todas as etiquetas',
            removeAllTagsFromNote: 'Tem certeza de que deseja remover todas as etiquetas desta nota?',
            removeAllTagsFromNotes: 'Tem certeza de que deseja remover todas as etiquetas de {count} notas?'
        },
        folderNoteType: {
            title: 'Selecione o tipo de nota de pasta',
            folderLabel: 'Pasta: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `Mover ${name} para pasta...`,
            multipleFilesLabel: (count: number) => `${count} arquivos`,
            navigatePlaceholder: 'Navegar para pasta...',
            instructions: {
                navigate: 'para navegar',
                move: 'para mover',
                select: 'para selecionar',
                dismiss: 'para descartar'
            }
        },
        homepage: {
            placeholder: 'Pesquisar arquivos...',
            instructions: {
                navigate: 'para navegar',
                select: 'para definir página inicial',
                dismiss: 'para descartar'
            }
        },
        calendarTemplate: {
            placeholder: 'Pesquisar modelos...',
            instructions: {
                navigate: 'para navegar',
                select: 'para selecionar o modelo',
                dismiss: 'para descartar'
            }
        },
        navigationBanner: {
            placeholder: 'Pesquisar imagens...',
            svgMissingDimensions: 'O arquivo SVG selecionado não define largura, altura ou viewBox.',
            instructions: {
                navigate: 'para navegar',
                select: 'para definir banner',
                dismiss: 'para descartar'
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
                dismiss: 'para descartar',
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
                dismiss: 'para descartar'
            }
        },
        propertyKeyVisibility: {
            title: 'Visibilidade das chaves de propriedade',
            description:
                'Controle onde os valores de propriedade são exibidos. As colunas correspondem ao painel de navegação, painel de lista e menu de contexto do arquivo. Use a linha inferior para alternar todas as linhas de uma coluna.',
            searchPlaceholder: 'Pesquisar chaves de propriedade...',
            propertyColumnLabel: 'Propriedade',
            showInNavigation: 'Mostrar na navegação',
            showInList: 'Mostrar na lista',
            showInFileMenu: 'Mostrar no menu do arquivo',
            toggleAllInNavigation: 'Alternar todos na navegação',
            toggleAllInList: 'Alternar todos na lista',
            toggleAllInFileMenu: 'Alternar todos no menu do arquivo',
            applyButton: 'Aplicar',
            emptyState: 'Nenhuma chave de propriedade encontrada.'
        },
        welcome: {
            title: 'Bem-vindo ao {pluginName}',
            introText:
                'Olá e seja bem-vindo ao Notebook Navigator, uma opção melhor de navegador de arquivos e calendário para o Obsidian. Antes de começar, recomendo mesmo que você assista pelo menos aos três primeiros capítulos do vídeo abaixo, Mastering Notebook Navigator. Eles apresentam como os dois painéis funcionam e ajudam você a começar rapidamente.',
            continueText:
                'Depois, se você tiver mais dez minutos, continue assistindo aos capítulos sobre a configuração inicial e a rotina de uso diário. Eles mostram tudo o que você precisa para começar, e você pode voltar mais tarde para ver mais detalhes. Você encontrará um link para o vídeo no topo das configurações do Notebook Navigator.',
            thanksText: 'Divirta-se usando o Notebook Navigator!',
            videoAlt: 'Dominando o Notebook Navigator 3',
            openVideoButton: 'Reproduzir vídeo',
            closeButton: 'Talvez depois'
        }
    },

    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Falha ao criar pasta: {error}',
            createFile: 'Falha ao criar arquivo: {error}',
            renameFolder: 'Falha ao renomear pasta: {error}',
            renameFolderNoteConflict: 'Não é possível renomear: "{name}" já existe nesta pasta',
            renameFile: 'Falha ao renomear arquivo: {error}',
            deleteFolder: 'Falha ao excluir pasta: {error}',
            deleteFile: 'Falha ao excluir arquivo: {error}',
            deleteAttachments: 'Falha ao excluir os anexos: {error}',
            mergeNotes: 'Falha ao mesclar notas: {error}',
            mergeNotesOpenOutput:
                'A nota mesclada foi criada como {name}, mas não pôde ser aberta: {error}. As notas de origem não foram alteradas.',
            mergeNotesOpenSkipped: 'Outra solicitação para abrir arquivo teve prioridade.',
            mergeNotesTrashSources: 'Nota mesclada criada. Falha ao mover {count} notas de origem para a lixeira.',
            duplicateNote: 'Falha ao duplicar nota: {error}',
            duplicateFolder: 'Falha ao duplicar pasta: {error}',
            openVersionHistory: 'Falha ao abrir histórico de versões: {error}',
            versionHistoryNotFound: 'Comando de histórico de versões não encontrado. Certifique-se de que o Obsidian Sync está ativado.',
            revealInExplorer: 'Falha ao revelar arquivo no explorador: {error}',
            openInDefaultApp: 'Falha ao abrir no aplicativo padrão: {error}',
            openInDefaultAppNotAvailable: 'Abrir no aplicativo padrão não está disponível nesta plataforma',
            folderNoteAlreadyExists: 'Nota de pasta já existe',
            folderAlreadyExists: 'A pasta "{name}" já existe',
            folderNotesDisabled: 'Ative as notas de pasta nas configurações para converter arquivos',
            folderNoteAlreadyLinked: 'Este arquivo já funciona como uma nota de pasta',
            folderNoteNotFound: 'Nenhuma nota de pasta na pasta selecionada',
            folderNoteUnsupportedExtension: 'Extensão de arquivo não suportada: {extension}',
            folderNoteMoveFailed: 'Falha ao mover arquivo durante conversão: {error}',
            folderNoteRenameConflict: 'Um arquivo chamado "{name}" já existe na pasta',
            folderNoteConversionFailed: 'Falha ao converter arquivo em nota de pasta',
            folderNoteConversionFailedWithReason: 'Falha ao converter arquivo em nota de pasta: {error}',
            folderNoteOpenFailed: 'Arquivo convertido, mas falha ao abrir nota de pasta: {error}',
            failedToDeleteFile: 'Falha ao excluir {name}: {error}',
            failedToDeleteMultipleFiles: 'Falha ao excluir {count} arquivos',
            versionHistoryNotAvailable: 'Serviço de histórico de versões não disponível',
            drawingAlreadyExists: 'Já existe um desenho com este nome',
            failedToCreateDrawing: 'Falha ao criar desenho',
            noFolderSelected: 'Nenhuma pasta está selecionada no Notebook Navigator',
            noFileSelected: 'Nenhum arquivo está selecionado'
        },
        warnings: {
            linkBreakingNameCharacters: 'Este nome inclui caracteres que quebram links do Obsidian: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'Os nomes não podem começar com um ponto nem incluir : ou /.',
            forbiddenNameCharactersWindows: 'Caracteres reservados do Windows não são permitidos: <, >, ", \\, |, ?, *.'
        },
        notices: {
            folderExcludedFromDescendants: 'Oculta nas listas das pastas superiores: {name}',
            folderIncludedInDescendants: 'Mostrada nas listas das pastas superiores: {name}',
            mergeNotes: '{count} notas mescladas em {name}'
        },
        notifications: {
            deletedMultipleFiles: '{count} arquivos excluídos',
            movedMultipleFiles: '{count} arquivos movidos para {folder}',
            folderNoteConversionSuccess: 'Arquivo convertido em nota de pasta em "{name}"',
            folderMoved: 'Pasta "{name}" movida',
            deepLinkCopied: 'URL do Obsidian copiada para a área de transferência',
            pathCopied: 'Caminho copiado para a área de transferência',
            relativePathCopied: 'Caminho relativo copiado para a área de transferência',
            linkCopied: 'Link copiado para a área de transferência',
            footnoteLinkCopied: 'Link de nota de rodapé copiado para a área de transferência',
            embedLinkCopied: 'Link de incorporação copiado para a área de transferência',
            tagAddedToNote: 'Etiqueta adicionada a 1 nota',
            tagAddedToNotes: 'Etiqueta adicionada a {count} notas',
            tagRemovedFromNote: 'Etiqueta removida de 1 nota',
            tagRemovedFromNotes: 'Etiqueta removida de {count} notas',
            tagsClearedFromNote: 'Todas as etiquetas removidas de 1 nota',
            tagsClearedFromNotes: 'Todas as etiquetas removidas de {count} notas',
            noTagsToRemove: 'Sem etiquetas para remover',
            noFilesSelected: 'Nenhum arquivo selecionado',
            mergeNotesRequireMultipleMarkdown: 'Selecione pelo menos duas notas Markdown para mesclar',
            tagOperationsNotAvailable: 'Operações de etiqueta não disponíveis',
            propertyOperationsNotAvailable: 'Operações de propriedades não disponíveis',
            tagsRequireMarkdown: 'Etiquetas só são suportadas em notas Markdown',
            propertiesRequireMarkdown: 'As propriedades só são suportadas em notas Markdown',
            propertySetOnNote: 'Propriedade atualizada em 1 nota',
            propertySetOnNotes: 'Propriedade atualizada em {count} notas',
            manualSortPropertyRemovedFromNote: 'Propriedade de classificação removida de 1 nota',
            manualSortPropertyRemovedFromNotes: 'Propriedade de classificação removida de {count} notas',
            iconPackDownloaded: '{provider} baixado',
            iconPackUpdated: '{provider} atualizado ({version})',
            iconPackRemoved: '{provider} removido',
            iconPackLoadFailed: 'Falha ao carregar {provider}',
            hiddenFileReveal: 'Arquivo está oculto. Ative "Mostrar itens ocultos" para exibi-lo'
        },
        confirmations: {
            deleteMultipleFiles: 'Tem certeza de que deseja excluir {count} arquivos?',
            deleteConfirmation: 'Esta ação não pode ser desfeita.'
        },
        defaultNames: {
            untitled: 'Sem título'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Não é possível mover uma pasta para dentro de si mesma ou de uma subpasta.',
            itemAlreadyExists: 'Um item chamado "{name}" já existe neste local.',
            failedToMove: 'Falha ao mover: {error}',
            failedToAddTag: 'Falha ao adicionar etiqueta "{tag}"',
            failedToSetProperty: 'Falha ao atualizar propriedade: {error}',
            failedToClearTags: 'Falha ao limpar etiquetas',
            failedToMoveFolder: 'Falha ao mover pasta "{name}"',
            failedToImportFiles: 'Falha ao importar: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} arquivos já existem no destino',
            filesAlreadyHaveTag: '{count} arquivos já têm esta etiqueta ou uma mais específica',
            filesAlreadyHaveProperty: '{count} arquivos já possuem esta propriedade',
            noTagsToClear: 'Sem etiquetas para remover',
            fileImported: '1 arquivo importado',
            filesImported: '{count} arquivos importados'
        }
    },

    // Date grouping
    dateGroups: {
        future: 'Futuro',
        today: 'Hoje',
        yesterday: 'Ontem',
        previous7Days: 'Últimos 7 dias',
        previous30Days: 'Últimos 30 dias'
    },

    // Plugin commands
    commands: {
        open: 'Abrir',
        toggleLeftSidebar: 'Alternar barra lateral esquerda',
        openHomepage: 'Abrir página inicial',
        openDailyNote: 'Abrir nota diária',
        openWeeklyNote: 'Abrir nota semanal',
        openMonthlyNote: 'Abrir nota mensal',
        openQuarterlyNote: 'Abrir nota trimestral',
        openYearlyNote: 'Abrir nota anual',
        revealFile: 'Revelar arquivo',
        search: 'Pesquisar',
        searchVaultRoot: 'Pesquisar em todo o cofre',
        toggleDualPane: 'Alternar layout de painel duplo',
        toggleDualPaneOrientation: 'Alternar orientação do painel duplo', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'Alternar calendário',
        selectVaultProfile: 'Alterar perfil do cofre',
        selectVaultProfile1: 'Alterar para o perfil do cofre 1',
        selectVaultProfile2: 'Alterar para o perfil do cofre 2',
        selectVaultProfile3: 'Alterar para o perfil do cofre 3',
        deleteFile: 'Excluir arquivos',
        createNewNote: 'Criar nova nota',
        createNewNoteFromTemplate: 'Criar nova nota a partir de modelo',
        moveFiles: 'Mover arquivos',
        mergeNotes: 'Mesclar notas', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'Selecionar próximo arquivo',
        selectPreviousFile: 'Selecionar arquivo anterior',
        navigateBack: 'Navegar para trás',
        navigateForward: 'Navegar para frente',
        convertToFolderNote: 'Converter em nota de pasta',
        setAsFolderNote: 'Definir como nota de pasta',
        detachFolderNote: 'Desvincular nota de pasta',
        pinAllFolderNotes: 'Fixar todas as notas de pasta',
        navigateToFolder: 'Navegar para pasta',
        navigateToTag: 'Navegar para etiqueta',
        navigateToProperty: 'Navegar para propriedade',
        addShortcut: 'Adicionar aos atalhos',
        openShortcut: 'Abrir atalho {number}',
        toggleDescendants: 'Alternar descendentes',
        toggleHidden: 'Alternar pastas, etiquetas e notas ocultas',
        toggleTagSort: 'Alternar ordem de classificação de etiquetas',
        toggleTagsBySelection: 'Alternar etiquetas por seleção',
        togglePropertiesBySelection: 'Alternar propriedades por seleção',
        toggleCompactMode: 'Alternar modo compacto', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Alternar seção fixada',
        collapseExpand: 'Recolher / expandir todos os itens de navegação',
        collapseExpandListGroups: 'Recolher / expandir todos os grupos da lista',
        collapseExpandSelectedItem: 'Recolher / expandir o item selecionado',
        addTag: 'Adicionar etiqueta aos arquivos selecionados',
        setProperty: 'Definir propriedade nos arquivos selecionados', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'Remover etiqueta dos arquivos selecionados',
        removeAllTags: 'Remover todas as etiquetas dos arquivos selecionados',
        openAllFiles: 'Abrir todos os arquivos',
        rebuildCache: 'Reconstruir cache',
        restoreDefaultSettings: 'Restaurar configurações padrão' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator',
        calendarViewName: 'Calendário',
        folderNoteSidebarViewName: 'Nota de pasta',
        ribbonTooltip: 'Notebook Navigator',
        revealInNavigator: 'Revelar no Notebook Navigator',
        settingsUnavailableNotice:
            'O Notebook Navigator não conseguiu ler suas configurações e não foi iniciado. Se o cofre estiver sincronizando, reinicie o Obsidian após a sincronização terminar. Para recomeçar com as configurações padrão, execute o comando "Restaurar configurações padrão".', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsMissingConfirm: {
            title: 'Iniciar com as configurações padrão?', // Title of the dialog shown when the plugin is enabled while its settings file is missing (English: Start with default settings?)
            messageRecentInstall:
                'O Notebook Navigator acabou de ser instalado e não tem arquivo de configurações. Se for uma instalação nova ou uma reinstalação, continue com as configurações padrão. Se suas configurações vierem de um serviço de sincronização, cancele, aguarde a sincronização terminar e reinicie o Obsidian.', // Dialog message when the plugin folder was written recently (English: Notebook Navigator was just installed and has no settings file. If this is a new install or a reinstall, continue with default settings. If your settings come from a sync service, cancel, wait for the sync to complete, and restart Obsidian.)
            messageExistingInstall:
                'O Notebook Navigator está instalado neste dispositivo há algum tempo, mas o arquivo de configurações está faltando. Se o cofre ainda estiver sincronizando, cancele, aguarde a sincronização terminar e reinicie o Obsidian para manter as configurações existentes. Continue apenas para recomeçar com as configurações padrão.', // Dialog message when the plugin folder has existed for a while (English: Notebook Navigator has been installed on this device for a while, but its settings file is missing. If your vault is still syncing, cancel, wait for the sync to complete, and restart Obsidian to keep your existing settings. Continue only to start over with default settings.)
            confirmButton: 'Usar configurações padrão' // Confirm button label in the missing-settings dialog (English: Use default settings)
        },
        settingsRecovery: {
            confirmTitle: 'Restaurar configurações padrão', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'Isto substitui o arquivo de configurações do Notebook Navigator pelas configurações padrão. Se o cofre ainda estiver sincronizando, as configurações padrão restauradas podem sobrescrever as configurações salvas nos seus outros dispositivos. Um arquivo de configurações legível é primeiro copiado para um backup com data e hora na pasta do plugin.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'Restaurar padrões', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: 'Não foi possível concluir a recuperação das configurações. As preferências locais foram mantidas.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'Configurações padrão restauradas. Reinicie o Obsidian para concluir.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Última modificação em',
        createdAt: 'Criado em',
        file: 'arquivo',
        files: 'arquivos',
        folder: 'pasta',
        folders: 'pastas',
        wordCount: 'Contagem de palavras',
        unfinishedTasks: 'Tarefas inacabadas'
    },

    fileCounts: {
        words: '{count} palavras',
        characters: '{count} caracteres',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'Alterar configurações padrão',
        metadataReport: {
            exportSuccess: 'Relatório de metadados com falhas exportado para: {filename}',
            exportFailed: 'Falha ao exportar relatório de metadados'
        },
        index: {
            label: 'Geral',
            description: 'Notas de versão, suporte, perfil do cofre, tipos de arquivo e chaves de propriedades.',
            groups: {
                about: 'Sobre'
            }
        },
        pageGroups: {
            configuration: 'Configuração',
            navigationPane: 'Painel de navegação',
            listPane: 'Painel de lista',
            calendarAndTools: 'Calendário e ferramentas'
        },
        pages: {
            displayFilters: {
                label: 'Filtros de exibição',
                description: 'Pastas, etiquetas, arquivos, etiquetas de arquivo e regras de propriedades ocultas.'
            },
            appearanceAndBehavior: {
                label: 'Aparência e comportamento',
                description: 'Comportamento, navegação por teclado, botões do mouse, aparência e formatação.',
                groups: {
                    startup: 'Inicialização',
                    keyboardNavigation: 'Navegação por teclado',
                    mouseButtons: 'Botões do mouse',
                    desktopAppearance: 'Aparência do desktop',
                    mobileAppearance: 'Aparência móvel',
                    appearance: 'Aparência',
                    icons: 'Ícones',
                    formatting: 'Formatação'
                }
            },
            navigationPane: {
                label: 'Painel de navegação',
                description: 'Layout, aparência, contagem de arquivos, comportamento de recolhimento e cores arco-íris.',
                groups: {
                    appearance: 'Aparência',
                    banner: 'Banner',
                    collapseItems: 'Recolher itens',
                    dragAndDrop: 'Arrastar e soltar',
                    fileCounts: 'Contagens de arquivos',
                    rainbowColors: 'Cores arco-íris'
                }
            },
            shortcutsAndRecentFiles: {
                label: 'Atalhos e arquivos recentes',
                description: 'Visibilidade de atalhos, distintivos, arquivos recentes e itens fixados.',
                groups: {
                    shortcuts: 'Atalhos',
                    recentFiles: 'Arquivos recentes'
                }
            },
            foldersAndFolderNotes: {
                label: 'Pastas e notas de pasta',
                description: 'Exibição de pastas, notas de pasta, modelos de notas de pasta e comportamento das notas de pasta.',
                groups: {
                    folders: 'Pastas',
                    folderNotes: 'Notas de pasta',
                    folderNoteFiles: 'Arquivos de notas de pasta'
                }
            },
            tagsAndProperties: {
                label: 'Etiquetas e propriedades',
                description: 'Seções de etiquetas e propriedades, ícones, classificação, escopo e herança.',
                groups: {
                    tags: 'Etiquetas',
                    properties: 'Propriedades'
                }
            },
            listPane: {
                label: 'Painel de lista',
                description: 'Classificação, agrupamento, modos de lista, notas fixadas e pré-visualizações de desenhos.',
                groups: {
                    appearance: 'Aparência',
                    sortAndGroup: 'Classificação e agrupamento',
                    groupHeaders: 'Cabeçalhos de grupo',
                    manualSort: 'Classificação manual',
                    pinnedNotes: 'Notas fixadas',
                    behavior: 'Comportamento',
                    drawingPreviews: 'Pré-visualizações de desenhos'
                }
            },
            fileOperations: {
                label: 'Operações de arquivo',
                description: 'Modelos, confirmações de exclusão, anexos e comportamento de conflito ao mover arquivos.',
                groups: {
                    templates: 'Modelos'
                }
            },
            frontmatterFields: {
                label: 'Campos de frontmatter',
                description: 'Campos de frontmatter para nomes de exibição, carimbos de data/hora, ícones e cores.'
            },
            fileDisplay: {
                label: 'Exibição de arquivos',
                description:
                    'Títulos, texto de visualização, imagens de destaque, etiquetas, propriedades, datas, contagem de palavras e contagem de caracteres.',
                groups: {
                    icon: 'Ícone',
                    title: 'Título',
                    previewText: 'Texto de visualização',
                    featureImage: 'Imagem de destaque',
                    tags: 'Etiquetas',
                    properties: 'Propriedades',
                    tasks: 'Tarefas',
                    date: 'Data',
                    parentFolder: 'Pasta pai',
                    wordAndCharacterCount: 'Contagem de palavras e caracteres'
                }
            },
            calendar: {
                label: 'Calendário',
                description: 'Exibição do calendário, notas de data, modelos, idioma e posicionamento da barra lateral.',
                groups: {
                    appearance: 'Aparência',
                    leftSidebar: 'Barra lateral esquerda',
                    calendarIntegration: 'Integração do calendário',
                    rightSidebar: 'Barra lateral direita'
                }
            },
            iconPacks: {
                label: 'Pacotes de ícones',
                description: 'Ícones de interface, ícones de arquivo e gerenciamento de pacotes de ícones.'
            },
            advanced: {
                label: 'Avançado',
                description: 'Diagnóstico, limpeza de metadados, importação/exportação e redefinição.',
                groups: {
                    maintenance: 'Manutenção',
                    resetSettings: 'Redefinir configurações'
                }
            }
        },
        syncMode: {
            notSynced: '(não sincronizado)',
            enableSync: 'Ativar sincronização',
            disableSync: 'Desativar sincronização'
        },
        items: {
            listPaneTitle: {
                name: 'Título do painel de lista',
                desc: 'Escolha onde o título do painel de lista é mostrado.',
                options: {
                    header: 'Mostrar no cabeçalho',
                    listPane: 'Mostrar no painel de lista',
                    hidden: 'Não mostrar'
                }
            },
            defaultSortOrder: {
                name: 'Ordem de classificação padrão',
                desc: 'Escolha a ordem de classificação padrão para as notas. As propriedades de Propriedades de classificação aparecem como opções de classificação adicionais.',
                directions: {
                    asc: 'Ascendente',
                    desc: 'Descendente'
                },
                dateDirections: {
                    newestOnTop: 'Mais recente no topo',
                    oldestOnTop: 'Mais antiga no topo'
                },
                textDirections: {
                    aOnTop: 'A no topo',
                    zOnTop: 'Z no topo'
                },
                fields: {
                    dateEdited: 'Data de edição',
                    dateCreated: 'Data de criação',
                    title: 'Título',
                    fileName: 'Nome do arquivo',
                    property: 'Propriedade'
                }
            },
            defaultSortDirection: {
                name: 'Direção de classificação'
            },
            defaultGroupingDirection: {
                name: 'Direção de agrupamento',
                options: {
                    follow: 'Seguir a classificação'
                }
            },
            sortingProperties: {
                name: 'Propriedades de classificação',
                desc: 'Propriedades do frontmatter separadas por vírgulas. Cada propriedade aparece como opção de classificação na configuração Ordem de classificação padrão e no menu de ordenação no painel de lista. Essas propriedades não são alteradas.',
                placeholder: 'published, author',
                defaultsResetNotices: {
                    sort: 'A ordem de classificação padrão foi redefinida porque sua propriedade não está mais disponível.',
                    grouping: 'O agrupamento padrão foi redefinido porque sua propriedade não está mais disponível.',
                    both: 'A ordem de classificação padrão e o agrupamento padrão foram redefinidos porque suas propriedades não estão mais disponíveis.'
                }
            },
            propertySecondarySort: {
                name: 'Ordenação secundária',
                desc: 'Usada com a ordenação por propriedade quando as notas têm o mesmo valor de propriedade ou não têm valor.',
                options: {
                    title: 'Título',
                    fileName: 'Nome do arquivo',
                    dateCreated: 'Data de criação',
                    dateEdited: 'Data de edição'
                }
            },
            propertySortInstructions: {
                intro: 'Como funcionam a classificação e o agrupamento por propriedade:',
                items: [
                    '**Classificação:** Escolher uma propriedade como Prioridade classifica as notas pelos valores de Prioridade.',
                    '**Agrupamento:** Escolher uma propriedade como Status cria um cabeçalho para cada valor de Status. As notas com o mesmo Status aparecem sob o mesmo cabeçalho.',
                    '**Vários valores:** Se uma propriedade contiver uma lista, o Notebook Navigator usa a lista inteira. Por exemplo, se Tópicos contiver Livros e História, a nota será classificada ou agrupada usando “Livros, História”, e não cada tópico separadamente.',
                    '**Valores ausentes:** Ao agrupar, as notas sem a propriedade aparecem em **Nenhum** no final.',
                    '**Visualizações de etiqueta e propriedade:** Quando o agrupamento **Pasta** é selecionado, cabeçalhos de data são exibidos em vez disso.'
                ]
            },
            groupingProperties: {
                name: 'Propriedades de agrupamento',
                desc: 'Propriedades do frontmatter separadas por vírgulas. Cada propriedade aparece como opção de agrupamento na configuração Agrupamento padrão e no menu de ordenação no painel de lista. Essas propriedades não são alteradas.',
                placeholder: 'status, genre'
            },
            manualSortProperty: {
                name: 'Propriedade da classificação manual',
                desc: 'Propriedade frontmatter usada para armazenar valores numéricos de índice para a classificação manual.'
            },
            groupHeaderProperty: {
                name: 'Propriedade do cabeçalho de grupo',
                desc: 'Propriedade frontmatter usada para armazenar cabeçalhos personalizados de grupo.'
            },
            groupHeadersInstructions: {
                intro: 'Cabeçalhos personalizados de grupo são exibidos acima das notas no painel de lista.',
                items: [
                    'No menu de ordenação no painel de lista, defina o agrupamento como **Personalizado**.',
                    'Clique com o botão direito em uma nota e escolha **Definir cabeçalho de grupo** para adicionar um cabeçalho acima dela.'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'Posicionamento de novas notas',
                desc: 'Escolha onde as novas notas são colocadas quando a lista atual usa classificação manual.',
                options: {
                    top: 'Topo',
                    bottom: 'Final',
                    belowSelectedNote: 'Abaixo da nota selecionada',
                    unsorted: 'Não classificados'
                }
            },
            confirmBeforeManualSort: {
                name: 'Confirmar antes da classificação manual',
                desc: 'Mostrar um aviso antes de gravar a propriedade de classificação manual nas notas pela primeira vez. Quando desativado, as notas recebem a propriedade sem aviso.'
            },
            manualSortInstructions: {
                intro: 'A classificação manual grava um valor numérico de índice em uma propriedade frontmatter de cada nota. Notas sem índice aparecem em Não classificados.',
                items: [
                    'Ative a classificação manual escolhendo **Classificação manual** no menu de ordenação. Depois disso, há duas formas de reorganizar as notas.',
                    'Escolha **Editar ordem de classificação...** no menu de ordenação para abrir uma visualização de reordenação. Arraste notas com o mouse ou com toque no celular. No desktop, **Cmd/Ctrl** ou **Shift** clique seleciona várias notas, e arrastar qualquer uma delas move o grupo inteiro.',
                    'No painel de lista, selecione uma nota ou várias com seleção múltipla e pressione **Cmd/Ctrl + Arrow Up/Down** para mover a seleção para cima ou para baixo.'
                ]
            },
            scrollToSelectedFileOnListChanges: {
                name: 'Rolar para o arquivo selecionado em mudanças da lista',
                desc: 'Rolar para o arquivo selecionado ao fixar notas, mostrar notas descendentes, mudar aparência de pastas ou executar operações de arquivo.'
            },
            includeDescendantNotes: {
                name: 'Mostrar notas de subpastas / descendentes',
                desc: 'Incluir notas de subpastas aninhadas e descendentes de etiquetas e propriedades ao visualizar uma pasta, etiqueta ou propriedade.'
            },
            filterPinnedNotesByFolder: {
                name: 'Fixar notas apenas na sua pasta',
                desc: 'Notas fixadas aparecem fixadas apenas na sua própria pasta. Útil para notas de pasta ou se você tem muitas notas fixadas. Não afeta as visualizações de etiquetas ou propriedades.'
            },
            separateFileCounts: {
                name: 'Mostrar contagens de arquivos atuais e descendentes separadamente',
                desc: 'Exibir contagens de arquivos no formato "atual ▾ descendentes" para pastas, etiquetas e propriedades.'
            },
            defaultGrouping: {
                name: 'Agrupamento padrão',
                desc: 'Os **cabeçalhos** anotam a lista ordenada sem alterar sua ordem: Personalizado mostra cabeçalhos definidos no frontmatter e Data insere cabeçalhos de data. Os **grupos** reordenam a lista: grupos de pastas e propriedades são ordenados por conta própria e as notas dentro de cada grupo seguem a ordem de classificação.',
                families: {
                    headers: 'Cabeçalhos',
                    groups: 'Grupos'
                },
                options: {
                    custom: 'Personalizado',
                    date: 'Data',
                    folder: 'Pasta'
                }
            },
            alwaysShowAllTagAndPropertyPills: {
                name: 'Sempre mostrar todos os emblemas de etiquetas e propriedades',
                desc: 'Quando desativado, os emblemas que correspondem à seleção de navegação atual ficam ocultos (por exemplo, o emblema da etiqueta "receitas" fica oculto ao navegar na etiqueta "receitas"). Ative para manter todos os emblemas visíveis.'
            },
            stickyGroupHeaders: {
                name: 'Cabeçalhos de grupo fixos',
                desc: 'Manter o cabeçalho atual de data, pasta, propriedade ou seção fixada visível ao rolar.'
            },
            showSubfolderPaths: {
                name: 'Mostrar caminhos das subpastas',
                desc: 'Ao agrupar por pasta no painel de lista, exibir caminhos das subpastas em vez de apenas nomes de pastas.'
            },
            showGroupHeaderItemCounts: {
                name: 'Mostrar contagem de itens',
                desc: 'Exibir o número de itens em cada cabeçalho de grupo no painel de lista.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'Agrupamento por pasta: arquivos da pasta atual embaixo',
                desc: 'Quando o agrupamento padrão for Pasta, mova os arquivos diretamente na pasta selecionada para baixo dos grupos de subpastas.'
            },
            defaultListMode: {
                name: 'Modo padrão da lista',
                desc: 'Selecione o layout padrão da lista. Padrão mostra título, data, descrição e texto de visualização. Compacto mostra apenas o título. A aparência pode ser substituída por pasta.',
                options: {
                    standard: 'Padrão',
                    compact: 'Compacto'
                }
            },
            showFileIcons: {
                name: 'Mostrar ícones de arquivo',
                desc: 'Exibir ícones de arquivo com espaçamento alinhado à esquerda. Desativar remove tanto ícones quanto recuo. Prioridade: ícone de tarefas inacabadas > ícone personalizado > ícone de pasta > ícone de nome de arquivo > ícone de tipo de arquivo > ícone padrão.'
            },
            unfinishedTaskIcon: {
                name: 'Ícone de tarefas inacabadas',
                desc: 'Substituir o ícone do arquivo quando uma nota possui tarefas inacabadas.',
                options: {
                    disabled: 'Desativado',
                    compact: 'Modo compacto',
                    standardAndCompact: 'Padrão e compacto'
                }
            },
            useFolderIcon: {
                name: 'Usar ícone de pasta',
                desc: 'Exibir o ícone da pasta pai quando não há um ícone de arquivo personalizado definido. A cor da pasta é usada quando não há uma cor de arquivo personalizada definida.'
            },
            showFileTaskProgress: {
                name: 'Progresso das tarefas',
                desc: 'Exibir o status das tarefas com barra de progresso e contagem de tarefas opcionais. As cores das tarefas inacabadas e concluídas podem ser definidas separadamente com o plugin Style Settings.'
            },
            showFileTaskProgressBar: {
                name: 'Progresso das tarefas: barra de progresso',
                desc: 'Exibir uma barra de progresso ao lado do ícone de tarefas.'
            },
            showFileTaskProgressCount: {
                name: 'Progresso das tarefas: contagem de tarefas',
                desc: 'Exibir o número de tarefas concluídas e o total de tarefas, por exemplo 3/7.'
            },
            hideFileTaskProgressWhenComplete: {
                name: 'Progresso das tarefas: ocultar quando concluídas',
                desc: 'Ocultar o progresso das tarefas quando todas as tarefas de uma nota estiverem concluídas.'
            },
            unfinishedTaskBackground: {
                name: 'Fundo de tarefas inacabadas',
                desc: 'Aplicar uma cor de fundo quando uma nota possui tarefas inacabadas.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'Cor de fundo de tarefas inacabadas',
                desc: 'Definir a cor de fundo usada quando uma nota possui tarefas inacabadas.'
            },
            showFileNameIcons: {
                name: 'Ícones por nome de arquivo',
                desc: 'Atribuir ícones a arquivos com base no texto em seus nomes.'
            },
            fileNameIconMap: {
                name: 'Mapa de ícones por nome',
                desc: 'Os arquivos contendo o texto recebem o ícone especificado. Um mapeamento por linha: texto=ícone',
                placeholder: '# texto=ícone\nreunião=ph-calendar\nfatura=ph-receipt',
                editTooltip: 'Editar mapeamentos'
            },
            showFileTypeIcons: {
                name: 'Ícones por tipo de arquivo',
                desc: 'Atribuir ícones a arquivos com base em sua extensão.'
            },
            fileTypeIconPreset: {
                name: 'Predefinição de ícones de arquivo',
                desc: 'Escolha os ícones integrados ou uma predefinição de pacote de ícones. Regras de extensão personalizadas substituem esta predefinição.',
                options: {
                    builtIn: 'Ícones integrados'
                },
                notInstalledWarning: 'Este pacote de ícones não está instalado. Em vez disso, os ícones integrados são exibidos.'
            },
            fileTypeIconMap: {
                name: 'Mapa de ícones por tipo',
                desc: 'Os arquivos com a extensão recebem o ícone especificado. Um mapeamento por linha: extensão=ícone',
                placeholder: '# extensão=ícone\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'Editar mapeamentos'
            },
            compactItemHeight: {
                name: 'Altura do item compacto',
                desc: 'Defina a altura dos itens de lista compactos no desktop e celular (pixels).',
                resetTooltip: 'Restaurar para padrão (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Dimensionar texto com altura do item compacto',
                desc: 'Dimensionar texto da lista compacta quando a altura do item é reduzida.'
            },
            showParentFolder: {
                name: 'Mostrar pasta pai',
                desc: 'Exibir o nome da pasta pai para notas em subpastas, etiquetas ou propriedades.'
            },
            showFolderPath: {
                name: 'Mostrar caminho da pasta',
                desc: 'Exibir o caminho relativo à pasta selecionada em vez de apenas o nome da pasta. Etiquetas e propriedades mostram o caminho completo.'
            },
            parentFolderClickOpensFolder: {
                name: 'Clique na pasta pai abre pasta',
                desc: 'Clicar no rótulo da pasta pai abre a pasta no painel de lista.'
            },
            showParentFolderColor: {
                name: 'Mostrar cor de pasta pai',
                desc: 'Usar cores de pasta em rótulos de pastas pai.'
            },
            showParentFolderIcon: {
                name: 'Mostrar ícone da pasta pai',
                desc: 'Mostrar ícones de pasta ao lado dos rótulos de pastas pai.'
            },
            showQuickActions: {
                name: 'Mostrar ações rápidas',
                desc: 'Mostrar botões de ação ao passar sobre arquivos. Controles de botão selecionam quais ações aparecem.'
            },
            dualPane: {
                name: 'Layout de painel duplo',
                desc: 'Mostrar painel de navegação e painel de lista lado a lado.'
            },
            dualPaneOrientation: {
                name: 'Orientação do painel duplo',
                desc: 'Escolha layout horizontal ou vertical quando o painel duplo estiver ativo.',
                options: {
                    horizontal: 'Divisão horizontal',
                    vertical: 'Divisão vertical'
                }
            },
            narrowSidebarBehavior: {
                name: 'Quando a barra lateral está estreita demais',
                desc: 'Escolha o que acontece quando o painel de navegação e o painel de lista não cabem lado a lado.',
                options: {
                    none: 'Não fazer nada',
                    singlePane: 'Mudar para painel único',
                    vertical: 'Mudar para divisão vertical'
                }
            },
            narrowSidebarThresholdMode: {
                name: 'Limite de barra lateral estreita',
                desc: 'Escolha como o limite de largura da barra lateral é calculado.',
                options: {
                    fitPanes: 'Ajustar painéis',
                    customWidth: 'Largura personalizada'
                }
            },
            narrowSidebarThresholdWidth: {
                name: 'Largura do limite de barra lateral estreita',
                desc: 'Mudar quando a barra lateral estiver mais estreita que esta largura.',
                resetTooltip: 'Redefinir para a largura padrão'
            },
            paneBackgroundColor: {
                name: 'Cor de fundo',
                desc: 'Escolha cores de fundo para painéis de navegação e lista.',
                options: {
                    separate: 'Fundos separados',
                    listBackground: 'Usar fundo da lista',
                    navigationBackground: 'Usar fundo da navegação'
                }
            },
            zoomLevel: {
                name: 'Nível de zoom',
                desc: 'Controla o nível de zoom geral do Notebook Navigator (porcentagem).'
            },
            useFloatingToolbarsOnIOS: {
                name: 'Usar barras de ferramentas flutuantes no iOS',
                desc: 'Aplica-se apenas ao iOS.'
            },
            defaultStartupView: {
                name: 'Visualização inicial padrão',
                desc: 'Escolha qual painel fica ativo ao abrir o Notebook Navigator. O layout de painel único mostra este painel primeiro; o layout de painel duplo dá a ele o foco do teclado.',
                options: {
                    navigation: 'Painel de navegação',
                    listPane: 'Painel de lista'
                }
            },
            toolbarButtons: {
                name: 'Botões da barra de ferramentas',
                desc: 'Escolha quais botões aparecem na barra de ferramentas. Botões ocultos permanecem acessíveis via comandos e menus.'
            },
            openNewNotesInNewTab: {
                name: 'Abrir novas notas em nova aba',
                desc: 'Quando ativado, o comando Criar nova nota abre as notas em uma nova aba. Quando desativado, as notas substituem a aba atual.'
            },
            autoRevealActiveNote: {
                name: 'Revelar automaticamente a nota ativa',
                desc: 'Revelar automaticamente notas quando abertas pela Navegação rápida, links ou pesquisa.'
            },
            autoRevealShortestPath: {
                name: 'Revelação automática: Usar caminho mais curto',
                desc: 'Ativado: A revelação automática seleciona a pasta ancestral ou etiqueta visível mais próxima. Desativado: A revelação automática seleciona a pasta real do arquivo e a etiqueta exata.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Revelação automática: Ignorar eventos da barra lateral direita',
                desc: 'Não alterar a nota ativa ao clicar ou alterar notas na barra lateral direita.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'Revelação automática: Ignorar eventos de outras janelas',
                desc: 'Não alterar a nota ativa ao clicar ou alterar notas em outra janela.'
            },
            singlePaneAnimation: {
                name: 'Animação de painel único',
                desc: 'Duração da transição ao alternar entre painéis no modo de painel único (milissegundos).',
                resetTooltip: 'Restaurar padrão'
            },
            autoSelectFirstNote: {
                name: 'Selecionar automaticamente a primeira nota',
                desc: 'Abrir automaticamente a primeira nota ao alternar pastas, etiquetas ou propriedades.'
            },
            disableShortcutAutoScroll: {
                name: 'Desativar rolagem automática para atalhos',
                desc: 'Não rolar o painel de navegação ao clicar em itens nos atalhos.'
            },
            expandOnSelection: {
                name: 'Expandir ao selecionar',
                desc: 'Expandir pastas, etiquetas e propriedades ao selecionar. No modo de painel único, a primeira seleção expande, a segunda mostra arquivos.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'Uma ramificação expandida',
                desc: 'Recolher outras ramificações na mesma árvore ao expandir uma pasta, etiqueta ou propriedade.'
            },
            springLoadedFolders: {
                name: 'Expandir ao arrastar',
                desc: 'Expandir pastas e etiquetas ao passar o mouse sobre elas durante o arraste.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Expandir ao arrastar: Atraso da primeira expansão',
                desc: 'Atraso antes de expandir a primeira pasta ou etiqueta durante um arraste (segundos).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Expandir ao arrastar: Atraso das expansões seguintes',
                desc: 'Atraso antes de expandir pastas ou etiquetas adicionais durante o mesmo arraste (segundos).'
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
                desc: 'Exibir a seção de atalhos no painel de navegação.'
            },
            shortcutBadgeDisplay: {
                name: 'Distintivo de atalho',
                desc: "O que exibir ao lado dos atalhos. Use os comandos 'Abrir atalho 1-9' para abrir atalhos diretamente.",
                options: {
                    position: 'Posição (1-9)',
                    count: 'Contagem de itens',
                    none: 'Nenhum'
                }
            },
            showRecentFiles: {
                name: 'Mostrar arquivos recentes',
                desc: 'Exibir a seção de arquivos recentes no painel de navegação.'
            },
            hideFileTypesFromRecentFiles: {
                name: 'Ocultar tipos de arquivos dos arquivos recentes',
                desc: 'Escolha os tipos de arquivos a ocultar na seção de arquivos recentes.',
                options: {
                    none: 'Nenhum',
                    folderNotes: 'Notas de pasta'
                }
            },
            recentFilesCount: {
                name: 'Contagem de arquivos recentes',
                desc: 'Número de arquivos recentes a exibir.'
            },
            pinRecentFilesWithShortcuts: {
                name: 'Fixar arquivos recentes com atalhos',
                desc: 'Incluir arquivos recentes quando os atalhos estiverem fixados.'
            },
            enableCalendar: {
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
            calendarSinglePanePlacement: {
                name: 'Posicionamento em painel único',
                desc: 'Onde o calendário é exibido no modo de painel único.',
                options: {
                    navigationPane: 'Painel de navegação',
                    belowPanes: 'Abaixo dos painéis'
                }
            },
            calendarLocale: {
                name: 'Idioma',
                desc: 'Controla a formatação das datas do calendário, a numeração das semanas e o primeiro dia da semana.',
                weekPathMismatchWarning:
                    'O calendário visível e os caminhos das notas semanais usam inícios de semana ou numeração de semana diferentes.',
                options: {
                    systemDefault: 'Padrão'
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
            calendarMonthNameFormat: {
                name: 'Formato do nome do mês',
                desc: 'Nome do mês completo (janeiro) ou abreviado (jan).',
                options: {
                    full: 'janeiro (completo)',
                    short: 'jan (curto)'
                }
            },
            showInfoButtons: {
                name: 'Mostrar botões de informação',
                desc: 'Exibir botões de informação na barra de pesquisa e no cabeçalho do calendário.'
            },
            calendarLeftSidebarWeeksToShow: {
                name: 'Semanas a exibir na barra lateral esquerda',
                desc: 'O calendário na barra lateral direita sempre exibe o mês completo.',
                options: {
                    fullMonth: 'Mês completo',
                    oneWeek: '1 semana',
                    weeksCount: '{count} semanas'
                }
            },
            calendarHighlightToday: {
                name: 'Destacar a data de hoje',
                desc: 'Destacar a data de hoje com uma cor de fundo e texto em negrito.'
            },
            calendarShowFeatureImage: {
                name: 'Mostrar imagem de destaque',
                desc: 'Mostrar imagens de destaque das notas no calendário.'
            },
            calendarShowTasks: {
                name: 'Mostrar tarefas',
                desc: 'Exibir um indicador em dias, semanas e meses com tarefas inacabadas.'
            },
            calendarShowWeekNumber: {
                name: 'Mostrar número da semana',
                desc: 'Adicionar uma coluna com o número da semana.'
            },
            calendarShowQuarter: {
                name: 'Mostrar trimestre',
                desc: 'Adicionar um rótulo de trimestre no cabeçalho do calendário.'
            },
            calendarShowOutsideMonthDays: {
                name: 'Mostrar dias de outros meses',
                desc: 'Mostrar os dias do mês anterior e do mês seguinte quando o calendário exibe um mês completo.'
            },
            calendarShowYearCalendar: {
                name: 'Mostrar calendário anual',
                desc: 'Exibir navegação anual e grade de meses na barra lateral direita.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Confirmar antes de criar',
                desc: 'Mostrar uma caixa de diálogo de confirmação ao criar uma nova nota diária.'
            },
            calendarShowHiddenItems: {
                name: 'Mostrar itens ocultos',
                desc: 'Quando ativado, o calendário sempre mostra todas as notas do calendário, incluindo notas ocultas pelos filtros do perfil do cofre.'
            },
            dailyNoteSource: {
                name: 'Fonte de notas diárias',
                desc: 'Fonte para notas do calendário.',
                options: {
                    dailyNotes: 'Notas diárias (plugin nativo)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'Pasta e formato de data são configurados no plugin nativo Notas Diárias.'
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

            periodicNotesRootFolder: {
                name: 'Pasta raiz (perfil do cofre)',
                desc: 'Pasta base para notas periódicas. Padrões de data podem incluir subpastas. Muda com o perfil do cofre selecionado.',
                placeholder: 'Pessoal/Diário'
            },
            templateFolderLocation: {
                name: 'Localização da pasta de modelos',
                desc: 'O seletor de arquivos de modelo mostra notas desta pasta.',
                placeholder: 'Modelos',
                usage: 'Usada por notas de calendário e notas de pasta. Configure os modelos em Calendário > Integração do calendário e Pastas e notas de pasta > Arquivos de notas de pasta.'
            },
            calendarDailyNotePattern: {
                name: 'Notas diárias',
                desc: 'Formatar caminho usando formato de data Moment. Coloque nomes de subpastas entre colchetes, ex. [Work]/YYYY. Clique no ícone de modelo para definir um modelo. Definir localização da pasta de modelos em Operações de arquivo > Modelos.',
                placeholder: 'YYYY/YYYYMMDD',
                parsingError: 'O padrão deve ser formatado e analisado novamente como uma data completa (ano, mês, dia).'
            },
            calendarPeriodicNotePatterns: {
                momentDescPrefix: 'Formatar caminho usando ',
                momentLinkText: 'formato de data Moment',
                momentDescSuffix:
                    '. Coloque nomes de subpastas entre colchetes, ex. [Work]/YYYY. Clique no ícone de modelo para definir um modelo. Definir localização da pasta de modelos em Operações de arquivo > Modelos.',
                templateTokenNoticeLabel: 'Importante!',
                templateTokenNotice:
                    'O suporte a modelos requer o plugin Templater. Formatos integrados como {{date}} e {{title}} só funcionam quando {source} está definido como {option}.',
                example: 'Sintaxe atual: {path}'
            },
            templaterSupport: {
                installed: '✅ O plugin Templater está instalado com suporte completo a modelos.',
                missing: '⚠️ Instale o plugin Templater para suporte a modelos.'
            },
            calendarWeeklyNotePattern: {
                name: 'Notas semanais',
                parsingError:
                    'O padrão deve ser formatado e analisado novamente como uma semana completa (ano da semana, número da semana).',
                weekPathMismatchWarning:
                    'Os caminhos das notas semanais usam o idioma das notas periódicas. Use idiomas correspondentes ou use "GGGG" com "WW" para semanas baseadas na segunda-feira.',
                mixedWeekTokensWarning:
                    'Este padrão mistura tokens de semana baseados na segunda-feira ("W" ou "G") com tokens de semana baseados no idioma ("w" ou "g"). Use um conjunto de forma consistente: "GGGG" com "WW" para semanas baseadas na segunda-feira, ou "gggg" com "ww" se as notas semanais devem seguir o idioma selecionado.'
            },
            calendarMonthlyNotePattern: {
                name: 'Notas mensais',
                parsingError: 'O padrão deve ser formatado e analisado novamente como um mês completo (ano, mês).'
            },
            calendarQuarterlyNotePattern: {
                name: 'Notas trimestrais',
                parsingError: 'O padrão deve ser formatado e analisado novamente como um trimestre completo (ano, trimestre).'
            },
            calendarYearlyNotePattern: {
                name: 'Notas anuais',
                parsingError: 'O padrão deve ser formatado e analisado novamente como um ano completo (ano).'
            },
            periodicNoteTemplateFile: {
                current: 'Arquivo de modelo: {name}'
            },
            showTooltips: {
                name: 'Mostrar dicas',
                desc: 'Exibir dicas de ferramentas ao passar o mouse com informações adicionais para notas e pastas.'
            },
            showTooltipPath: {
                name: 'Mostrar caminho nas dicas de ferramentas',
                desc: 'Exibir o caminho da pasta abaixo dos nomes de notas nas dicas de ferramentas.'
            },
            showTooltipWordCount: {
                name: 'Mostrar contagem de palavras nas dicas de ferramentas',
                desc: 'Exibir a contagem de palavras das notas nas dicas de ferramentas.'
            },
            resetPaneSeparator: {
                name: 'Redefinir posição do separador de painéis',
                desc: 'Redefinir o separador arrastável entre o painel de navegação e o painel de lista para a posição padrão.',
                buttonText: 'Redefinir separador',
                notice: 'Posição do separador redefinida. Reinicie o Obsidian ou reabra o Notebook Navigator para aplicar.'
            },
            importAndExportSettings: {
                name: 'Importar e exportar configurações',
                desc: 'Exportar ou importar configurações do Notebook Navigator como JSON. A importação substitui todas as configurações.',
                importButtonText: 'Importar',
                exportButtonText: 'Exportar',
                import: {
                    modalTitle: 'Importar configurações',
                    fileButtonName: 'Importar de arquivo',
                    fileButtonDesc: 'Carregar um arquivo JSON do disco.',
                    fileButtonText: 'Importar de arquivo',
                    editorName: 'JSON',
                    editorDesc: 'Cole ou edite o JSON abaixo. As configurações não incluídas são redefinidas para os valores padrão.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'Importar',
                    confirmTitle: 'Importar configurações?',
                    confirmMessage: 'A importação substitui as configurações atuais do Notebook Navigator.',
                    backupToggleName: 'Salvar as configurações atuais na raiz do cofre antes de importar',
                    backupToggleDesc: 'Cria um arquivo JSON com carimbo de data/hora na raiz do cofre.',
                    successWithBackupNotice: 'Configurações importadas. As configurações anteriores foram salvas em {path}.',
                    backupError: 'Não foi possível salvar as configurações atuais: {message}',
                    successNotice: 'Configurações importadas.',
                    errorNotice: 'Falha ao importar configurações: {message}',
                    fileReadError: 'Não foi possível ler o arquivo: {message}'
                },
                export: {
                    modalTitle: 'Exportar configurações',
                    editorName: 'JSON',
                    editorDesc: 'Apenas as configurações alteradas em relação aos valores padrão são incluídas.',
                    placeholder: '{}',
                    copyButtonText: 'Copiar para a área de transferência',
                    downloadButtonText: 'Baixar',
                    copyNotice: 'Configurações copiadas para a área de transferência.',
                    downloadNotice: 'Configurações exportadas.',
                    downloadError: 'Falha ao baixar configurações: {message}'
                }
            },
            resetAllSettings: {
                name: 'Redefinir todas as configurações',
                desc: 'Redefinir todas as configurações do Notebook Navigator para os valores padrão.',
                buttonText: 'Redefinir todas as configurações',
                confirmTitle: 'Redefinir todas as configurações?',
                confirmMessage:
                    'Isso redefinirá todas as configurações do Notebook Navigator para os valores padrão. Não pode ser desfeito.',
                confirmButtonText: 'Redefinir todas as configurações',
                notice: 'Configurações redefinidas. Reinicie o Obsidian ou reabra o Notebook Navigator para aplicar.',
                error: 'Falha ao redefinir as configurações.'
            },
            multiSelectModifier: {
                name: 'Modificador de seleção múltipla',
                desc: 'Escolha qual tecla modificadora alterna a seleção múltipla. Quando Option/Alt está selecionado, Cmd/Ctrl clique abre notas em uma nova aba.',
                options: {
                    cmdCtrl: 'Cmd/Ctrl clique',
                    optionAlt: 'Option/Alt clique'
                }
            },
            enterToOpenFiles: {
                name: 'Pressionar Enter para abrir arquivos',
                desc: 'Abrir arquivos apenas ao pressionar Enter durante a navegação por teclado na lista. No macOS, isso impede que Enter renomeie arquivos.'
            },
            shiftEnterAction: {
                name: 'Shift+Enter',
                desc: 'Escolha se Shift+Enter abre ou renomeia o arquivo selecionado.'
            },
            cmdEnterAction: {
                name: 'Cmd+Enter',
                desc: 'Escolha se Cmd+Enter abre ou renomeia o arquivo selecionado.'
            },
            ctrlEnterAction: {
                name: 'Ctrl+Enter',
                desc: 'Escolha se Ctrl+Enter abre ou renomeia o arquivo selecionado.'
            },
            mouseBackForwardAction: {
                name: 'Botões voltar/avançar do mouse',
                desc: 'Ação dos botões voltar e avançar do mouse no desktop.',
                options: {
                    systemDefault: 'Usar padrão do sistema',
                    singlePaneSwitch: 'Alternar painéis (painel único)',
                    history: 'Navegar no histórico'
                }
            },
            showFileTypes: {
                name: 'Mostrar tipos de arquivo (perfil do cofre)',
                desc: 'Filtrar quais tipos de arquivo são mostrados no navegador. Tipos de arquivo não suportados pelo Obsidian podem abrir em aplicativos externos.',
                options: {
                    documents: 'Documentos (.md, .canvas, .base)',
                    supported: 'Suportados (abrem no Obsidian)',
                    all: 'Todos (podem abrir externamente)'
                }
            },
            homepage: {
                name: 'Página inicial',
                desc: 'Escolha o que o Notebook Navigator abre automaticamente ao iniciar.',
                current: 'Atual: {path}',
                chooseButton: 'Escolher arquivo',
                options: {
                    none: 'Nenhum',
                    file: 'Arquivo',
                    dailyNote: 'Nota diária',
                    weeklyNote: 'Nota semanal',
                    monthlyNote: 'Nota mensal',
                    quarterlyNote: 'Nota trimestral',
                    yearlyNote: 'Nota anual'
                },
                file: {
                    name: 'Página inicial: Arquivo de inicialização',
                    empty: 'Nenhum arquivo selecionado'
                },
                createMissing: {
                    name: 'Página inicial: Criar nota se não existir',
                    desc: 'Criar a nota periódica ao iniciar ou via comando se não existir.'
                }
            },
            hideNotesWithPropertyRules: {
                name: 'Ocultar notas com regras de propriedade (perfil do cofre)',
                desc: 'Lista separada por vírgulas de regras de frontmatter. Use entradas `key` ou `key=value` (por exemplo, status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            hideFiles: {
                name: 'Ocultar arquivos (perfil do cofre)',
                desc: 'Lista separada por vírgulas de padrões de nomes de arquivos para ocultar. Suporta curingas * e caminhos / (por exemplo, temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Perfil do cofre',
                desc: 'Perfis armazenam visibilidade de tipos de arquivo, arquivos ocultos, pastas ocultas, etiquetas ocultas, regras de propriedades para notas ocultas, atalhos e banner de navegação. Alterne perfis pelo cabeçalho do painel de navegação.',
                defaultName: 'Padrão',
                addButton: 'Adicionar perfil',
                editProfilesButton: 'Editar perfis',
                addProfileOption: 'Adicionar perfil...',
                applyButton: 'Aplicar',
                deleteButton: 'Excluir perfil',
                addModalTitle: 'Adicionar perfil',
                editProfilesModalTitle: 'Editar perfis',
                addModalPlaceholder: 'Nome do perfil',
                deleteModalTitle: 'Excluir {name}',
                deleteModalMessage:
                    'Remover {name}? Os filtros de arquivos, pastas, etiquetas e notas baseados em propriedades salvos neste perfil serão excluídos.',
                moveUp: 'Mover para cima',
                moveDown: 'Mover para baixo',
                errors: {
                    emptyName: 'Digite um nome de perfil',
                    duplicateName: 'Nome do perfil já existe'
                }
            },
            vaultTitlePlacement: {
                name: 'Posição do título do cofre',
                desc: 'Escolha onde o título do cofre é mostrado.',
                options: {
                    header: 'Mostrar no cabeçalho',
                    navigation: 'Mostrar no painel de navegação'
                }
            },
            hideFolders: {
                name: 'Ocultar pastas (perfil do cofre)',
                desc: 'Lista separada por vírgulas de pastas a ocultar. Padrões de nome: assets* (pastas que começam com assets), *_temp (terminam com _temp). Padrões de caminho: /arquivo (apenas a pasta arquivo na raiz), /res* (pastas raiz que começam com res), /*/temp (pastas temp um nível abaixo), /projetos/* (todas as pastas dentro de projetos).',
                placeholder: 'modelos, assets*, /arquivo, /res*'
            },
            descendantExcludedFolders: {
                name: 'Excluir pastas das notas de subpastas (perfil do cofre)',
                desc: 'Lista separada por vírgulas de pastas a omitir ao coletar notas de subpastas. As pastas permanecem visíveis, e selecionar uma ainda mostra suas notas. Usa os mesmos padrões de Ocultar pastas.',
                placeholder: 'diário, recursos, /arquivo'
            },
            showFileDate: {
                name: 'Mostrar data',
                desc: 'Exibir a data abaixo dos nomes das notas.'
            },
            dateWhenSortingByName: {
                name: 'Ao ordenar por nome',
                desc: 'Data a mostrar quando as notas são ordenadas alfabeticamente.',
                options: {
                    created: 'Data de criação',
                    modified: 'Data de modificação'
                }
            },
            showFileTags: {
                name: 'Mostrar etiquetas de arquivo',
                desc: 'Exibir etiquetas clicáveis em itens de arquivo.'
            },
            showFullTagPaths: {
                name: 'Mostrar caminhos completos de etiquetas',
                desc: "Exibir caminhos completos da hierarquia de etiquetas. Ativado: 'ai/openai', 'trabalho/projetos/2024'. Desativado: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Colorir etiquetas de arquivo',
                desc: 'Aplicar cores de etiqueta aos emblemas de etiqueta em itens de arquivo.'
            },
            showColoredTagsFirst: {
                name: 'Mostrar etiquetas coloridas primeiro',
                desc: 'Ordenar as etiquetas coloridas antes das outras etiquetas nos itens de arquivo.'
            },
            showFileTagsInCompactMode: {
                name: 'Mostrar etiquetas de arquivo no modo compacto',
                desc: 'Exibir etiquetas quando data, visualização e imagem estão ocultas.'
            },
            showFileProperties: {
                name: 'Mostrar propriedades de arquivo',
                desc: 'Exibir propriedades nos itens de arquivo. Use o diálogo "Visibilidade das chaves de propriedade" para escolher quais propriedades são mostradas.'
            },
            colorFileProperties: {
                name: 'Colorir propriedades de arquivo',
                desc: 'Aplicar cores de propriedade aos emblemas de propriedade nos itens de arquivo.'
            },
            showColoredPropertiesFirst: {
                name: 'Mostrar propriedades coloridas primeiro',
                desc: 'Ordenar propriedades coloridas antes de outras propriedades nos itens de arquivo.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Mostrar propriedades no modo compacto',
                desc: 'Exibir propriedades quando o modo compacto está ativo.'
            },
            textCountType: {
                name: 'Tipo de contagem',
                desc: 'Escolha quais contagens de texto aparecem nos itens de arquivo.',
                options: {
                    none: 'Nenhuma',
                    words: 'Contagem de palavras',
                    characters: 'Contagem de caracteres',
                    both: 'Contagem de palavras e caracteres'
                }
            },
            textCountPlacement: {
                name: 'Posicionamento',
                desc: 'Escolha onde as contagens de texto aparecem.',
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
                name: 'Propriedade alvo',
                desc: 'Chave da propriedade frontmatter que contém a contagem de palavras alvo. Deixe em branco para ocultar alvos.'
            },
            showTargetPercentage: {
                name: 'Mostrar porcentagem da meta',
                desc: 'Mostrar apenas a porcentagem de progresso quando houver uma contagem de palavras alvo disponível.'
            },
            propertyKeys: {
                name: 'Chaves de propriedades (perfil do cofre)',
                desc: 'Chaves de propriedades de metadados, com visibilidade por chave para navegação e lista de arquivos.',
                addButtonTooltip: 'Configurar chaves de propriedade',
                noneConfigured: 'Nenhuma propriedade configurada',
                singleConfigured: '1 propriedade configurada: {properties}',
                multipleConfigured: '{count} propriedades configuradas: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'Mostrar propriedades em linhas separadas',
                desc: 'Mostrar cada propriedade na sua própria linha.'
            },
            linkPropertyPillsToNotes: {
                name: 'Vincular emblemas de propriedade a notas',
                desc: 'Clique em um emblema de propriedade para abrir a nota vinculada.'
            },
            linkPropertyPillsToUrls: {
                name: 'Vincular emblemas de propriedade a URLs',
                desc: 'Clique em um emblema de propriedade para abrir a URL vinculada.'
            },
            dateFormat: {
                name: 'Formato de data',
                desc: 'Formato para exibir datas (usa formato Moment).',
                placeholder: 'DD/MM/YYYY',
                help: 'Formatos comuns:\nDD/MM/YYYY = 25/05/2022\nD [de] MMMM [de] YYYY = 25 de maio de 2022\nYYYY-MM-DD = 2022-05-25\n\nTokens:\nYYYY/YY = ano\nMMMM/MMM/MM = mês\nDD/D = dia\ndddd/ddd = dia da semana',
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
            showNotePreview: {
                name: 'Mostrar visualização de nota',
                desc: 'Exibir texto de visualização abaixo dos nomes das notas.'
            },
            skipHeadingsInPreview: {
                name: 'Pular cabeçalhos na visualização',
                desc: 'Pular linhas de cabeçalho ao gerar texto de visualização.'
            },
            skipCodeBlocksInPreview: {
                name: 'Pular blocos de código na visualização',
                desc: 'Pular blocos de código ao gerar texto de visualização.'
            },
            skipCalloutsInPreview: {
                name: 'Pular callouts na visualização',
                desc: 'Pular blocos de callout ao gerar texto de visualização.'
            },
            stripHtmlInPreview: {
                name: 'Remover HTML nas visualizações',
                desc: 'Remover tags HTML do texto de visualização. Pode afetar o desempenho em notas grandes.'
            },
            stripLatexInPreview: {
                name: 'Remover LaTeX nas visualizações',
                desc: 'Remover expressões LaTeX inline e em bloco do texto de visualização.'
            },
            previewProperties: {
                name: 'Propriedades de visualização',
                desc: 'Lista separada por vírgulas de propriedades do frontmatter para verificar texto de visualização. A primeira propriedade com texto será usada.',
                placeholder: 'summary, description, abstract'
            },
            fallbackToNoteContent: {
                name: 'Recorrer ao conteúdo da nota',
                desc: 'Mostrar o conteúdo da nota como visualização quando nenhuma das propriedades especificadas contém texto.'
            },
            previewRows: {
                name: 'Linhas de visualização',
                desc: 'Número de linhas a exibir para texto de visualização.',
                options: {
                    '1': '1 linha',
                    '2': '2 linhas',
                    '3': '3 linhas',
                    '4': '4 linhas',
                    '5': '5 linhas'
                }
            },
            titleRows: {
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
                desc: 'Colorir títulos de notas e ícones de arquivos com a cor da pasta pai quando não há uma cor de arquivo personalizada definida. Prioridade: cor de arquivo personalizada > cor da pasta > cor padrão.'
            },
            showFeatureImage: {
                name: 'Mostrar imagem de destaque',
                desc: 'Exibir uma miniatura da primeira imagem encontrada na nota.'
            },
            forceSquareFeatureImage: {
                name: 'Forçar imagem de destaque quadrada',
                desc: 'Renderizar imagens de destaque como miniaturas quadradas.'
            },
            featureImageProperties: {
                name: 'Propriedades de imagem',
                desc: 'Lista separada por vírgulas de propriedades do frontmatter a verificar primeiro. Usa a primeira imagem no conteúdo markdown como alternativa.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'Excluir notas com propriedades',
                desc: 'Lista separada por vírgulas de propriedades do frontmatter. Notas contendo qualquer uma dessas propriedades não armazenam imagens de destaque.',
                placeholder: 'private, confidential'
            },
            featureImageDisplaySize: {
                name: 'Tamanho de exibição da imagem de destaque',
                desc: 'Tamanho máximo de renderização para imagens de destaque em listas de notas.',
                options: {
                    '64': '64 px',
                    '96': '96 px',
                    '128': '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'Tamanho em pixels da imagem de destaque',
                desc: 'Resolução usada ao gerar miniaturas armazenadas de imagens de destaque. Aumente esse valor se as visualizações maiores ficarem borradas.',
                options: {
                    '256x144': '256 x 144 px',
                    '384x216': '384 x 216 px',
                    '512x288': '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'Baixar imagens externas',
                desc: 'Baixar imagens remotas e miniaturas do YouTube para imagens de destaque.'
            },
            hideExportedPreviewImages: {
                name: 'Ocultar imagens de pré-visualização exportadas',
                desc: 'Ocultar arquivos PNG de pré-visualização de desenhos exportados. Ative "Mostrar itens ocultos" para exibi-los.'
            },
            drawingIntegrationInfo: {
                intro: 'O Notebook Navigator exibe arquivos PNG exportados pelo Excalidraw como pré-visualizações de desenhos.',
                items: [
                    'Nas **configurações do Excalidraw**, abra **Embedding Excalidraw into your Notes and Exporting**, depois **Export Settings**, depois **Auto-export Settings**.',
                    'Ative **Auto-export PNG**. Opcionalmente, ative **Export both dark- and light-themed image**.',
                    'O Notebook Navigator procura **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** ou **Drawing.excalidraw.light.png**.',
                    'Enquanto **Ocultar imagens de pré-visualização exportadas** estiver ativo, os arquivos PNG aparecem apenas quando **Mostrar itens ocultos** também estiver ativo.'
                ]
            },
            showRootFolder: {
                name: 'Mostrar pasta raiz',
                desc: 'Exibir o nome do cofre como a pasta raiz na árvore.'
            },
            showFolderIcons: {
                name: 'Mostrar ícones de pastas',
                desc: 'Exibir ícones ao lado das pastas no painel de navegação.'
            },
            inheritFolderColors: {
                name: 'Herdar cores de pastas',
                desc: 'Pastas filhas herdam cor das pastas pai.'
            },
            folderSortOrder: {
                name: 'Ordem de classificação de pastas',
                desc: 'Clique com o botão direito em qualquer pasta para definir uma ordem de classificação diferente para seus subitens.',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A'
                }
            },
            showFileCount: {
                name: 'Mostrar contagem de arquivos',
                desc: 'Exibir contagens de arquivos ao lado de pastas, etiquetas e propriedades.'
            },
            showShortcutAndRecentItemIcons: {
                name: 'Mostrar ícones para atalhos e itens recentes',
                desc: 'Exibir ícones ao lado dos itens nas seções Atalhos e Recentes.'
            },
            interfaceIcons: {
                name: 'Ícones da interface',
                desc: 'Editar ícones da barra de ferramentas, pastas, etiquetas, propriedades, itens fixados, pesquisa e ordenação.',
                buttonText: 'Editar ícones'
            },
            applyColorToIconsOnly: {
                name: 'Aplicar cor apenas aos ícones',
                desc: 'Quando ativado, cores personalizadas são aplicadas apenas aos ícones. Quando desativado, as cores são aplicadas aos ícones e aos rótulos de texto.'
            },
            navRainbowMode: {
                name: 'Modo de cores arco-íris (perfil do cofre)',
                desc: 'Aplicar cores arco-íris no painel de navegação.',
                options: {
                    off: 'Desativado',
                    textColor: 'Cor do texto',
                    backgroundColor: 'Cor de fundo'
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
                name: 'Aplicar aos atalhos',
                desc: 'Aplicar cores arco-íris aos atalhos.'
            },
            navRainbowApplyToRecentItems: {
                name: 'Aplicar aos itens recentes',
                desc: 'Aplicar cores arco-íris aos itens recentes.'
            },
            navRainbowApplyToFolders: {
                name: 'Aplicar às pastas',
                desc: 'Aplicar cores arco-íris às pastas.'
            },
            navRainbowFolderScope: {
                name: 'Escopo de pastas',
                desc: 'Selecionar quais níveis de pasta iniciam atribuições de cor.',
                options: {
                    root: 'Nível raiz',
                    child: 'Nível filho',
                    all: 'Todos os níveis'
                }
            },
            navRainbowApplyToTags: {
                name: 'Aplicar às etiquetas',
                desc: 'Aplicar cores arco-íris às etiquetas.'
            },
            navRainbowTagScope: {
                name: 'Escopo de etiquetas',
                desc: 'Selecionar quais níveis de etiqueta iniciam atribuições de cor.',
                options: {
                    root: 'Nível raiz',
                    child: 'Nível filho',
                    all: 'Todos os níveis'
                }
            },
            navRainbowApplyToProperties: {
                name: 'Aplicar às propriedades',
                desc: 'Aplicar cores arco-íris às propriedades.'
            },
            navRainbowConsistentBrightness: {
                name: 'Brilho consistente entre matizes', // (English: Consistent brightness across hues)
                desc: 'Interpola o brilho entre as cores inicial e final durante as transições de matiz.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'Cores separadas para modo claro e escuro', // (English: Separate light and dark mode colors)
                desc: 'Usar cores de arco-íris diferentes para o modo claro e o modo escuro.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'Copiar cor do modo claro para o modo escuro', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'Escopo de propriedades',
                desc: 'Selecionar quais níveis de propriedade iniciam atribuições de cor.',
                options: {
                    root: 'Nível raiz',
                    child: 'Nível filho',
                    all: 'Todos os níveis'
                }
            },
            collapseItems: {
                name: 'Recolher itens',
                desc: 'Escolha o que o botão expandir/recolher tudo afeta.',
                options: {
                    all: 'Tudo',
                    foldersOnly: 'Apenas pastas',
                    tagsOnly: 'Apenas etiquetas',
                    propertiesOnly: 'Apenas propriedades'
                }
            },
            keepSelectedItemExpanded: {
                name: 'Manter item selecionado expandido',
                desc: 'Ao recolher, manter o item selecionado e seus pais expandidos.'
            },
            excludeVaultRootFromCollapse: {
                name: 'Ignorar raiz do cofre ao recolher',
                desc: 'Ao recolher todos os itens, deixe a pasta raiz do cofre no estado atual.'
            },
            treeIndentation: {
                name: 'Indentação da árvore',
                desc: 'Ajustar a largura da indentação para pastas, etiquetas e propriedades aninhadas (pixels).'
            },
            navItemHeight: {
                name: 'Altura do item',
                desc: 'Ajustar a altura de pastas, etiquetas e propriedades no painel de navegação (pixels).'
            },
            navItemHeightScaleText: {
                name: 'Dimensionar texto com altura do item',
                desc: 'Reduzir o tamanho do texto de navegação quando a altura do item é diminuída.'
            },
            showIndentGuides: {
                name: 'Mostrar guias de recuo',
                desc: 'Exibir guias de recuo para pastas, etiquetas e propriedades aninhadas.'
            },
            navCountLeaderStyle: {
                name: 'Mostrar caracteres de preenchimento',
                desc: 'Exibir pontos, traços ou uma linha entre os nomes dos itens e a contagem de arquivos.',
                options: {
                    none: 'Nenhum',
                    dots: 'Pontos (...)',
                    dashes: 'Traços (---)',
                    line: 'Linha'
                }
            },
            rootItemSpacing: {
                name: 'Espaçamento de item raiz',
                desc: 'Espaçamento entre pastas, etiquetas e propriedades de nível raiz (pixels).'
            },
            showTags: {
                name: 'Mostrar etiquetas',
                desc: 'Exibir seção de etiquetas no navegador.'
            },
            showTagIcons: {
                name: 'Mostrar ícones de etiquetas',
                desc: 'Exibir ícones ao lado das etiquetas no painel de navegação.'
            },
            inheritTagColors: {
                name: 'Herdar cores das etiquetas',
                desc: 'As etiquetas filhas herdam a cor das etiquetas pai.'
            },
            tagSortOrder: {
                name: 'Ordem de classificação de etiquetas',
                desc: 'Clique com o botão direito em qualquer etiqueta para definir uma ordem de classificação diferente para seus subitens.',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A',
                    frequency: 'Frequência',
                    lowToHigh: 'baixa para alta',
                    highToLow: 'alta para baixa'
                }
            },
            showTagsFolder: {
                name: 'Mostrar pasta de etiquetas',
                desc: 'Exibir "Etiquetas" como uma pasta recolhível.'
            },
            showUntaggedNotes: {
                name: 'Mostrar notas sem etiquetas',
                desc: 'Exibir item "Sem etiquetas" para notas sem etiquetas.'
            },
            filterTagsBySelection: {
                name: 'Filtrar etiquetas por seleção',
                desc: 'Mostrar apenas etiquetas que aparecem em notas na pasta ou propriedade selecionada.'
            },
            keepEmptyTagsProperty: {
                name: 'Manter propriedade tags após remover última etiqueta',
                desc: 'Manter a propriedade tags do frontmatter quando todas as etiquetas forem removidas. Quando desativado, a propriedade tags é excluída do frontmatter.'
            },
            showProperties: {
                name: 'Mostrar propriedades',
                desc: 'Exibir a seção de propriedades no navegador.',
                propertyKeysInfoPrefix: 'Configurar propriedades em ',
                propertyKeysInfoLinkText: 'Geral > Chaves de propriedades',
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
                desc: 'Clique com o botão direito em qualquer propriedade para definir uma ordem de classificação diferente para seus valores.',
                options: {
                    alphaAsc: 'A a Z',
                    alphaDesc: 'Z a A',
                    frequency: 'Frequência',
                    lowToHigh: 'baixa para alta',
                    highToLow: 'alta para baixa'
                }
            },
            showPropertiesFolder: {
                name: 'Mostrar pasta de propriedades',
                desc: 'Exibir "Propriedades" como uma pasta recolhível.'
            },
            filterPropertiesBySelection: {
                name: 'Filtrar propriedades por seleção',
                desc: 'Mostrar apenas propriedades que aparecem em notas na pasta ou etiqueta selecionada.'
            },
            hideTags: {
                name: 'Ocultar etiquetas (perfil do cofre)',
                desc: 'Lista de padrões de etiquetas separados por vírgulas. Padrões de nome: tag* (começa com), *tag (termina com). Padrões de caminho: arquivo (etiqueta e descendentes), arquivo/* (apenas descendentes), projetos/*/rascunhos (curinga intermediário).',
                placeholder: 'arquivo*, *rascunho, projetos/*/antigo'
            },
            hideNotesWithTags: {
                name: 'Ocultar notas com etiquetas (perfil do cofre)',
                desc: 'Lista de padrões de etiquetas separados por vírgulas. Notas que contêm etiquetas correspondentes ficam ocultas. Padrões de nome: tag* (começa com), *tag (termina com). Padrões de caminho: arquivo (etiqueta e descendentes), arquivo/* (apenas descendentes), projetos/*/rascunhos (curinga intermediário).',
                placeholder: 'arquivo*, *rascunho, projetos/*/antigo'
            },
            enableFolderNotes: {
                name: 'Ativar notas de pasta',
                desc: 'As pastas com um arquivo de nota correspondente são exibidas como links clicáveis.'
            },
            folderNoteType: {
                name: 'Tipo de nota de pasta padrão',
                desc: 'Tipo de nota de pasta criado a partir do menu de contexto.',
                options: {
                    ask: 'Perguntar ao criar',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'Nome da nota de pasta',
                desc: 'Nome da nota de pasta sem extensão. Use {{folder}} para inserir o nome da pasta ou insira um nome fixo como index.'
            },
            folderNoteTemplate: {
                name: 'Modelo de nota de pasta',
                desc: 'Arquivo de modelo usado ao criar notas de pasta. Os modelos Markdown podem usar o Templater. Os modelos Canvas e Base são copiados como conteúdo do arquivo. Definir localização da pasta de modelos em Operações de arquivo > Modelos.',
                formatWarning: 'O formato do modelo deve corresponder ao tipo de nota de pasta selecionado: .md, .canvas ou .base.'
            },
            folderNamesOpenFolderNotes: {
                name: 'Nomes de pastas abrem notas de pasta',
                desc: 'Clicar no nome de uma pasta abre a nota de pasta correspondente. Quando desativado, as notas de pasta fornecem apenas metadados da pasta, como nome, ícone e cor.'
            },
            hideFolderNoteInList: {
                name: 'Ocultar notas de pasta na lista',
                desc: 'Ocultar notas de pasta da lista de arquivos.'
            },
            pinCreatedFolderNote: {
                name: 'Fixar notas de pasta criadas',
                desc: 'Fixar notas de pasta ao criá-las pelo menu de contexto.'
            },
            folderNoteOpenLocation: {
                name: 'Abrir notas de pasta em',
                desc: 'Escolha onde as notas de pasta são abertas ao clicar em links de notas de pasta.',
                options: {
                    currentTab: 'Aba atual',
                    newTab: 'Nova aba',
                    rightSidebar: 'Barra lateral direita'
                }
            },
            showClosestFolderNoteInRightSidebar: {
                name: 'Barra lateral direita: Mostrar nota de pasta mais próxima',
                desc: 'Quando uma pasta é selecionada, a barra lateral direita mostra automaticamente a nota de pasta ancestral mais próxima.'
            },
            confirmBeforeDelete: {
                name: 'Confirmar antes de excluir',
                desc: 'Mostrar diálogo de confirmação ao excluir notas ou pastas'
            },
            deleteAttachments: {
                name: 'Excluir anexos ao excluir arquivos',
                desc: 'Remover automaticamente os anexos vinculados e as pré-visualizações de desenhos geradas se não forem usados em outro lugar',
                options: {
                    ask: 'Perguntar sempre',
                    always: 'Sempre',
                    never: 'Nunca'
                }
            },
            moveFileConflicts: {
                name: 'Conflitos de movimentação',
                desc: 'Ao mover um arquivo para uma pasta onde já existe um arquivo com o mesmo nome. Perguntar sempre (renomear, sobrescrever, cancelar) ou sempre renomear.',
                options: {
                    ask: 'Perguntar sempre',
                    rename: 'Sempre renomear'
                }
            },
            metadataCleanup: {
                name: 'Limpar metadados',
                desc: 'Remove metadados órfãos deixados para trás quando arquivos, pastas, etiquetas ou propriedades são excluídos, movidos ou renomeados fora do Obsidian. Isso afeta apenas o arquivo de configurações do Notebook Navigator.',
                buttonText: 'Limpar metadados',
                error: 'Falha na limpeza de configurações',
                loading: 'Verificando metadados...',
                statusClean: 'Sem metadados para limpar',
                statusCounts:
                    'Itens órfãos: {folders} pastas, {tags} etiquetas, {properties} propriedades, {files} arquivos, {pinned} fixações, {separators} separadores'
            },
            rebuildCache: {
                name: 'Reconstruir cache',
                desc: 'Use isso se você tiver etiquetas ausentes, visualizações incorretas ou imagens de destaque ausentes. Isso pode acontecer após conflitos de sincronização ou fechamentos inesperados.',
                buttonText: 'Reconstruir cache',
                error: 'Falha ao reconstruir cache',
                indexingTitle: 'Indexando o cofre...',
                progress: 'Atualizando o cache do Notebook Navigator.'
            },
            iconPackManagement: {
                downloadButton: 'Baixar',
                downloadingLabel: 'Baixando...',
                removeButton: 'Remover',
                statusInstalled: 'Baixado (versão {version})',
                statusNotInstalled: 'Não baixado',
                versionUnknown: 'desconhecida',
                downloadFailed: 'Falha ao baixar {name}. Verifique sua conexão e tente novamente.',
                removeFailed: 'Falha ao remover {name}.',
                infoNote:
                    'Pacotes de ícones baixados sincronizam o estado de instalação entre dispositivos. Os pacotes de ícones permanecem no banco de dados local em cada dispositivo; a sincronização apenas rastreia se devem ser baixados ou removidos. Pacotes de ícones são baixados do repositório Notebook Navigator (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterMetadata: {
                name: 'Usar metadados do frontmatter',
                desc: 'Usar frontmatter para nome da nota, timestamps, ícones e cores'
            },
            frontmatterIconField: {
                name: 'Campo de ícone',
                desc: 'Campo do frontmatter para ícones de arquivo. Deixe em branco para usar ícones armazenados nas configurações.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'Campo de cor',
                desc: 'Campo do frontmatter para cores de arquivo. Deixe em branco para usar cores armazenadas nas configurações.',
                placeholder: 'color'
            },
            frontmatterBackgroundField: {
                name: 'Campo de fundo',
                desc: 'Campo do frontmatter para cores de fundo. Deixe em branco para usar cores de fundo armazenadas nas configurações.',
                placeholder: 'background'
            },
            migrateIconsAndColorsFromSettings: {
                name: 'Migrar ícones e cores das configurações',
                desc: 'Armazenado nas configurações: {icons} ícones, {colors} cores.',
                button: 'Migrar',
                buttonWorking: 'Migrando...',
                noticeNone: 'Sem ícones ou cores de arquivo armazenados nas configurações.',
                noticeDone: 'Migrados {migratedIcons}/{icons} ícones, {migratedColors}/{colors} cores.',
                noticeFailures: 'Entradas com falha: {failures}.',
                noticeError: 'Falha na migração. Verifique o console para detalhes.'
            },
            frontmatterNameFields: {
                name: 'Campos de nome',
                desc: 'Lista de campos frontmatter separados por vírgula. O primeiro valor não vazio é usado. Usa o nome do arquivo como alternativa.',
                placeholder: 'title, name'
            },
            frontmatterCreatedField: {
                name: 'Campo de timestamp de criação',
                desc: 'Nome do campo do frontmatter para o timestamp de criação. Deixe em branco para usar apenas a data do sistema de arquivos.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'Campo de timestamp de modificação',
                desc: 'Nome do campo do frontmatter para o timestamp de modificação. Deixe em branco para usar apenas a data do sistema de arquivos.',
                placeholder: 'modified'
            },
            frontmatterTimestampFormat: {
                name: 'Formato de timestamp',
                desc: 'Formato usado para analisar timestamps no frontmatter. Deixe em branco para usar parsing ISO 8601.',
                helpTooltip: 'Formato usando Moment',
                momentLinkText: 'formato Moment',
                help: 'Formatos comuns:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'Apoiar o desenvolvimento',
                desc: 'Se você adora usar o Notebook Navigator, considere apoiar seu desenvolvimento contínuo.',
                buttonText: '❤️ Patrocinar',
                coffeeButton: '☕️ Me pague um café'
            },
            otherPlugins: {
                name: 'Conheça meus outros plugins',
                betterPaste: 'Limpa texto, links e imagens colados',
                pixelPerfectImage: 'Redimensionamento exato de imagens e mais'
            },
            checkForNewVersionOnStart: {
                name: 'Verificar nova versão ao iniciar',
                desc: 'Verifica novas versões do plugin na inicialização e mostra uma notificação quando uma atualização está disponível. As verificações ocorrem no máximo uma vez por dia.',
                status: 'Nova versão disponível: {version}'
            },
            startupDebugLogging: {
                name: 'Registro de depuração na inicialização',
                desc: 'Gravar diagnósticos de inicialização em um arquivo Markdown com carimbo de data/hora na raiz do cofre e parar depois que a inicialização se estabiliza. O arquivo pode ser sincronizado e pode incluir caminhos de arquivos.'
            },
            whatsNew: {
                name: 'O que há de novo no Notebook Navigator {version}',
                desc: 'Veja atualizações e melhorias recentes',
                buttonText: 'Ver atualizações recentes'
            },
            masteringVideo: {
                name: 'Dominando o Notebook Navigator (vídeo)',
                desc: 'Este vídeo cobre tudo o que você precisa para ser produtivo no Notebook Navigator, incluindo atalhos de teclado, busca, etiquetas e personalização avançada.'
            },
            cacheStatistics: {
                localCache: 'Cache local',
                items: 'itens',
                withTags: 'com etiquetas',
                withPreviewText: 'com texto de visualização',
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
                checkTimestampFormat: 'Verifique seu formato de timestamp.',
                exportFailed: 'Exportar erros'
            }
        }
    },
    whatsNew: {
        title: 'O que há de novo no Notebook Navigator',
        openBannerImage: 'Abrir imagem do banner da versão',
        supportMessage: 'Se você acha o Notebook Navigator útil, considere apoiar seu desenvolvimento.',
        supportButton: 'Me pague um café',
        thanksButton: 'Obrigado!'
    }
};
