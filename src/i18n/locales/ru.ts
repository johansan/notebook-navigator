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
 * Russian language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_RU = {
    // Common UI elements
    common: {
        cancel: 'Отмена', // Button text for canceling dialogs and operations (English: Cancel)
        delete: 'Удалить', // Button text for delete operations in dialogs (English: Delete)
        clear: 'Очистить', // Button text for clearing values (English: Clear)
        remove: 'Убрать', // Button text for remove operations in dialogs (English: Remove)
        submit: 'Отправить', // Button text for submitting forms and dialogs (English: Submit)
        noSelection: 'Ничего не выбрано', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Без тегов', // Label for notes without any tags (English: Untagged)
        untitled: 'Без названия', // Default name for notes without a title (English: Untitled)
        featureImageAlt: 'Изображение', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Неизвестная ошибка', // Generic fallback when an error has no message (English: Unknown error)
        updateBannerTitle: 'Доступно обновление Notebook Navigator',
        updateBannerInstruction: 'Обновите в Настройки -> Сторонние плагины',
        updateIndicatorLabel: 'Доступна новая версия'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Выберите папку или тег для просмотра заметок', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Нет заметок', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Закреплённые', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Заметки', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Файлы', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (скрыто)' // Accessibility label applied to list items that are normally hidden
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Без тегов', // Label for the special item showing notes without tags (English: Untagged)
        hiddenTags: 'Скрытые теги', // Label for the hidden tags virtual folder (English: Hidden tags)
        tags: 'Теги' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Ярлыки', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentNotesHeader: 'Недавние заметки', // Header label for recent notes section in navigation pane (English: Recent notes)
        recentFilesHeader: 'Недавние файлы', // Header label when showing recent non-note files in navigation pane (English: Recent files)
        reorderRootFoldersTitle: 'Изменить порядок навигации',
        reorderRootFoldersHint: 'Используйте стрелки или перетаскивание',
        vaultRootLabel: 'Хранилище',
        resetRootToAlpha: 'Сбросить в алфавитный порядок',
        resetRootToFrequency: 'Сбросить по частоте',
        pinShortcuts: 'Закрепить ярлыки',
        pinShortcutsAndRecentNotes: 'Закрепить ярлыки и недавние заметки',
        pinShortcutsAndRecentFiles: 'Закрепить ярлыки и недавние файлы',
        unpinShortcuts: 'Открепить ярлыки',
        unpinShortcutsAndRecentNotes: 'Открепить ярлыки и недавние заметки',
        unpinShortcutsAndRecentFiles: 'Открепить ярлыки и недавние файлы',
        profileMenuLabel: 'Профиль',
        profileMenuAria: 'Сменить профиль хранилища'
    },

    shortcuts: {
        folderExists: 'Папка уже в ярлыках',
        noteExists: 'Заметка уже в ярлыках',
        tagExists: 'Тег уже в ярлыках',
        searchExists: 'Ярлык поиска уже существует',
        emptySearchQuery: 'Введите поисковый запрос перед сохранением',
        emptySearchName: 'Введите название перед сохранением поиска',
        add: 'Добавить в ярлыки',
        addNotesCount: 'Добавить {count} заметок в ярлыки',
        addFilesCount: 'Добавить {count} файлов в ярлыки',
        rename: 'Переименовать ярлык',
        remove: 'Убрать из ярлыков',
        removeAll: 'Удалить все ярлыки',
        removeAllConfirm: 'Удалить все ярлыки?',
        folderNotesPinned: 'Закреплено заметок папок: {count}'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Свернуть элементы', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'Развернуть все элементы', // Tooltip for button that expands all items (English: Expand all items)
        scrollToTop: 'Прокрутить вверх',
        newFolder: 'Новая папка', // Tooltip for create new folder button (English: New folder)
        newNote: 'Новая заметка', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Назад к навигации', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeSortOrder: 'Изменить сортировку', // Tooltip for the sort order toggle button (English: Change sort order)
        defaultSort: 'По умолчанию', // Label for default sorting mode (English: Default)
        customSort: 'Пользовательская', // Label for custom sorting mode (English: Custom)
        showFolders: 'Показать навигацию', // Tooltip for button to show the navigation pane (English: Show navigation)
        hideFolders: 'Скрыть навигацию', // Tooltip for button to hide the navigation pane (English: Hide navigation)
        reorderRootFolders: 'Изменить порядок навигации',
        finishRootFolderReorder: 'Готово',
        toggleDescendantNotes: 'Показать заметки из подпапок / потомков', // Tooltip: include descendants for folders and tags
        autoExpandFoldersTags: 'Разворачивать при выборе', // Tooltip for button to toggle auto-expanding folders and tags when selected (English: Expand on selection)
        showExcludedItems: 'Показать скрытые папки, теги и заметки', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Скрыть скрытые папки, теги и заметки', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Показать двойную панель', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Показать одну панель', // Tooltip for button to show single-pane layout (English: Show single pane)
        changeAppearance: 'Изменить внешний вид', // Tooltip for button to change folder appearance settings (English: Change appearance)
        search: 'Поиск' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Поиск...', // Placeholder text for search input (English: Search...)
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Очистить поиск', // Tooltip for clear search button (English: Clear search)
        saveSearchShortcut: 'Сохранить ярлык поиска',
        removeSearchShortcut: 'Удалить ярлык поиска',
        shortcutModalTitle: 'Сохранить ярлык поиска',
        shortcutNamePlaceholder: 'Введите название ярлыка'
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'Открыть в новой вкладке',
            openToRight: 'Открыть справа',
            openInNewWindow: 'Открыть в новом окне',
            openMultipleInNewTabs: 'Открыть {count} заметок в новых вкладках',
            openMultipleFilesInNewTabs: 'Открыть {count} файлов в новых вкладках',
            openMultipleToRight: 'Открыть {count} заметок справа',
            openMultipleFilesToRight: 'Открыть {count} файлов справа',
            openMultipleInNewWindows: 'Открыть {count} заметок в новых окнах',
            openMultipleFilesInNewWindows: 'Открыть {count} файлов в новых окнах',
            pinNote: 'Закрепить заметку',
            pinFile: 'Закрепить файл',
            unpinNote: 'Открепить заметку',
            unpinFile: 'Открепить файл',
            pinMultipleNotes: 'Закрепить {count} заметок',
            pinMultipleFiles: 'Закрепить {count} файлов',
            unpinMultipleNotes: 'Открепить {count} заметок',
            unpinMultipleFiles: 'Открепить {count} файлов',
            duplicateNote: 'Дублировать заметку',
            duplicateFile: 'Дублировать файл',
            duplicateMultipleNotes: 'Дублировать {count} заметок',
            duplicateMultipleFiles: 'Дублировать {count} файлов',
            openVersionHistory: 'Открыть историю версий',
            revealInFolder: 'Показать в папке',
            revealInFinder: 'Показать в Finder',
            showInExplorer: 'Показать в проводнике',
            copyDeepLink: 'Копировать URL Obsidian',
            copyPath: 'Копировать путь в файловой системе',
            copyRelativePath: 'Копировать путь в хранилище',
            renameNote: 'Переименовать заметку',
            renameFile: 'Переименовать файл',
            deleteNote: 'Удалить заметку',
            deleteFile: 'Удалить файл',
            deleteMultipleNotes: 'Удалить {count} заметок',
            deleteMultipleFiles: 'Удалить {count} файлов',
            moveNoteToFolder: 'Переместить заметку в...',
            moveFileToFolder: 'Переместить файл в...',
            moveMultipleNotesToFolder: 'Переместить {count} заметок в...',
            moveMultipleFilesToFolder: 'Переместить {count} файлов в...',
            addTag: 'Добавить тег',
            removeTag: 'Удалить тег',
            removeAllTags: 'Удалить все теги',
            changeIcon: 'Изменить иконку',
            changeColor: 'Изменить цвет'
        },
        folder: {
            newNote: 'Новая заметка',
            newNoteFromTemplate: 'Новая заметка из шаблона',
            newFolder: 'Новая папка',
            newCanvas: 'Новый холст',
            newBase: 'Новая база',
            newDrawing: 'Новый рисунок',
            newExcalidrawDrawing: 'Новый рисунок Excalidraw',
            newTldrawDrawing: 'Новый рисунок Tldraw',
            duplicateFolder: 'Дублировать папку',
            searchInFolder: 'Искать в папке',
            copyPath: 'Копировать путь в файловой системе',
            copyRelativePath: 'Копировать путь в хранилище',
            createFolderNote: 'Создать заметку папки',
            detachFolderNote: 'Отвязать заметку папки',
            deleteFolderNote: 'Удалить заметку папки',
            changeIcon: 'Изменить иконку',
            changeColor: 'Изменить цвет',
            changeBackground: 'Изменить фон',
            excludeFolder: 'Скрыть папку',
            unhideFolder: 'Показать папку',
            moveFolder: 'Переместить папку в...',
            renameFolder: 'Переименовать папку',
            deleteFolder: 'Удалить папку'
        },
        tag: {
            changeIcon: 'Изменить иконку',
            changeColor: 'Изменить цвет',
            changeBackground: 'Изменить фон',
            showTag: 'Показать тег',
            hideTag: 'Скрыть тег'
        },
        navigation: {
            addSeparator: 'Добавить разделитель',
            removeSeparator: 'Удалить разделитель'
        },
        style: {
            title: 'Стиль',
            copy: 'Копировать стиль',
            paste: 'Вставить стиль',
            removeIcon: 'Удалить значок',
            removeColor: 'Удалить цвет',
            removeBackground: 'Удалить фон',
            clear: 'Очистить стиль'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        standardPreset: 'Стандартный',
        compactPreset: 'Компактный',
        defaultSuffix: '(по умолчанию)',
        titleRows: 'Строки заголовка',
        previewRows: 'Строки превью',
        groupBy: 'Группировать по',
        defaultOption: (rows: number) => `По умолчанию (${rows})`,
        defaultTitleOption: (rows: number) => `Строк заголовка по умолчанию (${rows})`,
        defaultPreviewOption: (rows: number) => `Строк превью по умолчанию (${rows})`,
        defaultGroupOption: (groupLabel: string) => `Группировка по умолчанию (${groupLabel})`,
        titleRowOption: (rows: number) => `${rows} ${rows === 1 ? 'строка' : rows < 5 ? 'строки' : 'строк'} заголовка`,
        previewRowOption: (rows: number) => `${rows} ${rows === 1 ? 'строка' : rows < 5 ? 'строки' : 'строк'} превью`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'Поиск иконок...',
            recentlyUsedHeader: 'Недавно использованные',
            emptyStateSearch: 'Начните вводить для поиска иконок',
            emptyStateNoResults: 'Иконки не найдены',
            showingResultsInfo: 'Показано 50 из {count} результатов. Введите больше для уточнения.',
            emojiInstructions: 'Введите или вставьте любой эмодзи, чтобы использовать его как иконку',
            removeIcon: 'Удалить иконку',
            allTabLabel: 'Все'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Добавить правило'
        },
        interfaceIcons: {
            title: 'Иконки интерфейса',
            items: {
                'nav-shortcuts': 'Ярлыки',
                'nav-recent-files': 'Недавние файлы',
                'nav-expand-all': 'Развернуть все',
                'nav-collapse-all': 'Свернуть все',
                'nav-tree-expand': 'Стрелка дерева: развернуть',
                'nav-tree-collapse': 'Стрелка дерева: свернуть',
                'nav-hidden-items': 'Скрытые элементы',
                'nav-root-reorder': 'Изменить порядок корневых папок',
                'nav-new-folder': 'Новая папка',
                'nav-show-single-pane': 'Показать одну панель',
                'nav-show-dual-pane': 'Показать двойную панель',
                'nav-profile-chevron': 'Стрелка меню профиля',
                'list-search': 'Поиск',
                'list-descendants': 'Заметки из подпапок',
                'list-sort-ascending': 'Порядок сортировки: по возрастанию',
                'list-sort-descending': 'Порядок сортировки: по убыванию',
                'list-appearance': 'Изменить вид',
                'list-new-note': 'Новая заметка',
                'nav-folder-open': 'Папка открыта',
                'nav-folder-closed': 'Папка закрыта',
                'nav-tag': 'Тег',
                'list-pinned': 'Закреплённые элементы'
            }
        },
        colorPicker: {
            currentColor: 'Текущий',
            newColor: 'Новый',
            presetColors: 'Предустановленные цвета',
            userColors: 'Пользовательские цвета',
            paletteDefault: 'По умолчанию',
            paletteCustom: 'Пользовательские',
            copyColors: 'Копировать цвет',
            colorsCopied: 'Цвет скопирован в буфер обмена',
            copyClipboardError: 'Не удалось записать в буфер обмена',
            pasteColors: 'Вставить цвет',
            pasteClipboardError: 'Не удалось прочитать буфер обмена',
            pasteInvalidJson: 'Буфер обмена не содержит корректный текст',
            pasteInvalidFormat: 'Ожидалось hex-значение цвета',
            colorsPasted: 'Цвет успешно вставлен',
            resetUserColors: 'Очистить пользовательские цвета',
            clearCustomColorsConfirm: 'Удалить все пользовательские цвета?',
            userColorSlot: 'Цвет {slot}',
            recentColors: 'Недавние цвета',
            clearRecentColors: 'Очистить недавние цвета',
            removeRecentColor: 'Удалить цвет',
            removeColor: 'Удалить цвет',
            apply: 'Применить',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'Красный',
                orange: 'Оранжевый',
                amber: 'Янтарный',
                yellow: 'Жёлтый',
                lime: 'Лаймовый',
                green: 'Зелёный',
                emerald: 'Изумрудный',
                teal: 'Бирюзовый',
                cyan: 'Голубой',
                sky: 'Небесный',
                blue: 'Синий',
                indigo: 'Индиго',
                violet: 'Фиолетовый',
                purple: 'Пурпурный',
                fuchsia: 'Фуксия',
                pink: 'Розовый',
                rose: 'Алый',
                gray: 'Серый',
                slate: 'Сланцевый',
                stone: 'Каменный'
            }
        },
        selectVaultProfile: {
            title: 'Выбор профиля хранилища',
            currentBadge: 'Активный',
            emptyState: 'Нет доступных профилей хранилища.'
        },
        tagOperation: {
            renameTitle: 'Переименовать тег {tag}',
            deleteTitle: 'Удалить тег {tag}',
            newTagPrompt: 'Новое название тега',
            newTagPlaceholder: 'Введите новое название тега',
            renameWarning: 'Переименование тега {oldTag} изменит {count} {files}.',
            deleteWarning: 'Удаление тега {tag} изменит {count} {files}.',
            modificationWarning: 'Это обновит даты изменения файлов.',
            affectedFiles: 'Затронутые файлы:',
            andMore: '...и ещё {count}',
            confirmRename: 'Переименовать тег',
            renameUnchanged: '{tag} не изменён',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            invalidTagName: 'Введите корректное название тега.',
            descendantRenameError: 'Нельзя переместить тег в себя или в потомка.',
            confirmDelete: 'Удалить тег',
            file: 'файл',
            files: 'файлов'
        },
        fileSystem: {
            newFolderTitle: 'Новая папка',
            renameFolderTitle: 'Переименовать папку',
            renameFileTitle: 'Переименовать файл',
            deleteFolderTitle: "Удалить '{name}'?",
            deleteFileTitle: "Удалить '{name}'?",
            folderNamePrompt: 'Введите название папки:',
            hideInOtherVaultProfiles: 'Скрыть в других профилях хранилища',
            renamePrompt: 'Введите новое название:',
            renameVaultTitle: 'Изменить отображаемое имя хранилища',
            renameVaultPrompt: 'Введите пользовательское имя (оставьте пустым для использования по умолчанию):',
            deleteFolderConfirm: 'Вы уверены, что хотите удалить эту папку и всё её содержимое?',
            deleteFileConfirm: 'Вы уверены, что хотите удалить этот файл?',
            removeAllTagsTitle: 'Удалить все теги',
            removeAllTagsFromNote: 'Вы уверены, что хотите удалить все теги из этой заметки?',
            removeAllTagsFromNotes: 'Вы уверены, что хотите удалить все теги из {count} заметок?'
        },
        folderNoteType: {
            title: 'Выберите тип заметки папки',
            folderLabel: 'Папка: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `Переместить ${name} в папку...`,
            multipleFilesLabel: (count: number) => `${count} файлов`,
            navigatePlaceholder: 'Перейти к папке...',
            instructions: {
                navigate: 'для навигации',
                move: 'для перемещения',
                select: 'для выбора',
                dismiss: 'для закрытия'
            }
        },
        homepage: {
            placeholder: 'Поиск файлов...',
            instructions: {
                navigate: 'для навигации',
                select: 'для установки домашней страницы',
                dismiss: 'для закрытия'
            }
        },
        navigationBanner: {
            placeholder: 'Поиск изображений...',
            instructions: {
                navigate: 'для навигации',
                select: 'для установки баннера',
                dismiss: 'для закрытия'
            }
        },
        tagSuggest: {
            placeholder: 'Поиск тегов...',
            navigatePlaceholder: 'Перейти к тегу...',
            addPlaceholder: 'Найти тег для добавления...',
            removePlaceholder: 'Выберите тег для удаления...',
            createNewTag: 'Создать новый тег: #{tag}',
            instructions: {
                navigate: 'для навигации',
                select: 'для выбора',
                dismiss: 'для закрытия',
                add: 'для добавления тега',
                remove: 'для удаления тега'
            }
        },
        welcome: {
            title: 'Добро пожаловать в {pluginName}',
            introText:
                'Привет! Перед началом работы настоятельно рекомендую посмотреть первые пять минут видео ниже, чтобы понять, как работают панели и переключатель «Показывать заметки из подпапок».',
            continueText:
                'Если у вас есть ещё пять минут, продолжите просмотр видео, чтобы понять компактные режимы отображения и как правильно настроить закладки и важные горячие клавиши.',
            thanksText: 'Большое спасибо за загрузку, приятного использования!',
            videoAlt: 'Установка и освоение Notebook Navigator',
            openVideoButton: 'Воспроизвести видео',
            closeButton: 'Посмотрю позже'
        }
    },
    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Не удалось создать папку: {error}',
            createFile: 'Не удалось создать файл: {error}',
            renameFolder: 'Не удалось переименовать папку: {error}',
            renameFolderNoteConflict: 'Невозможно переименовать: "{name}" уже существует в этой папке',
            renameFile: 'Не удалось переименовать файл: {error}',
            deleteFolder: 'Не удалось удалить папку: {error}',
            deleteFile: 'Не удалось удалить файл: {error}',
            duplicateNote: 'Не удалось дублировать заметку: {error}',
            createCanvas: 'Не удалось создать холст: {error}',
            createDatabase: 'Не удалось создать базу данных: {error}',
            duplicateFolder: 'Не удалось дублировать папку: {error}',
            openVersionHistory: 'Не удалось открыть историю версий: {error}',
            versionHistoryNotFound: 'Команда истории версий не найдена. Убедитесь, что Obsidian Sync включён.',
            revealInExplorer: 'Не удалось показать файл в проводнике: {error}',
            folderNoteAlreadyExists: 'Заметка папки уже существует',
            folderAlreadyExists: 'Папка "{name}" уже существует',
            folderNotesDisabled: 'Включите заметки папок в настройках для конвертации файлов',
            folderNoteAlreadyLinked: 'Этот файл уже является заметкой папки',
            folderNoteNotFound: 'В выбранной папке нет заметки папки',
            folderNoteUnsupportedExtension: 'Неподдерживаемое расширение файла: {extension}',
            folderNoteMoveFailed: 'Не удалось переместить файл при конвертации: {error}',
            folderNoteRenameConflict: 'Файл с именем "{name}" уже существует в папке',
            folderNoteConversionFailed: 'Не удалось конвертировать файл в заметку папки',
            folderNoteConversionFailedWithReason: 'Не удалось конвертировать файл в заметку папки: {error}',
            folderNoteOpenFailed: 'Файл конвертирован, но не удалось открыть заметку папки: {error}',
            failedToDeleteFile: 'Не удалось удалить {name}: {error}',
            failedToDeleteMultipleFiles: 'Не удалось удалить {count} файлов',
            versionHistoryNotAvailable: 'Служба истории версий недоступна',
            drawingAlreadyExists: 'Рисунок с таким именем уже существует',
            failedToCreateDrawing: 'Не удалось создать рисунок',
            noFolderSelected: 'В Notebook Navigator не выбрана папка',
            noFileSelected: 'Файл не выбран'
        },
        warnings: {
            linkBreakingNameCharacters: 'Это имя содержит символы, которые ломают ссылки Obsidian: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'Имена не могут начинаться с точки или содержать : или /.',
            forbiddenNameCharactersWindows: 'Зарезервированные в Windows символы не разрешены: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'Папка скрыта: {name}',
            showFolder: 'Папка показана: {name}'
        },
        notifications: {
            deletedMultipleFiles: 'Удалено файлов: {count}',
            movedMultipleFiles: 'Перемещено {count} файлов в {folder}',
            folderNoteConversionSuccess: 'Файл конвертирован в заметку папки в "{name}"',
            folderMoved: 'Папка "{name}" перемещена',
            deepLinkCopied: 'URL Obsidian скопирован в буфер обмена',
            pathCopied: 'Путь скопирован в буфер обмена',
            relativePathCopied: 'Относительный путь скопирован в буфер обмена',
            tagAddedToNote: 'Тег добавлен к 1 заметке',
            tagAddedToNotes: 'Тег добавлен к {count} заметкам',
            tagRemovedFromNote: 'Тег удалён из 1 заметки',
            tagRemovedFromNotes: 'Тег удалён из {count} заметок',
            tagsClearedFromNote: 'Все теги удалены из 1 заметки',
            tagsClearedFromNotes: 'Все теги удалены из {count} заметок',
            noTagsToRemove: 'Нет тегов для удаления',
            noFilesSelected: 'Файлы не выбраны',
            tagOperationsNotAvailable: 'Операции с тегами недоступны',
            tagsRequireMarkdown: 'Теги поддерживаются только для Markdown-заметок',
            iconPackDownloaded: '{provider} загружен',
            iconPackUpdated: '{provider} обновлён ({version})',
            iconPackRemoved: '{provider} удалён',
            iconPackLoadFailed: 'Не удалось загрузить {provider}',
            hiddenFileReveal: 'Файл скрыт. Включите "Показать скрытые элементы" для отображения'
        },
        confirmations: {
            deleteMultipleFiles: 'Вы уверены, что хотите удалить {count} файлов?',
            deleteConfirmation: 'Это действие нельзя отменить.'
        },
        defaultNames: {
            untitled: 'Без названия',
            untitledNumber: 'Без названия {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Нельзя переместить папку в себя или в подпапку.',
            itemAlreadyExists: 'Элемент с именем "{name}" уже существует в этом месте.',
            failedToMove: 'Не удалось переместить: {error}',
            failedToAddTag: 'Не удалось добавить тег "{tag}"',
            failedToClearTags: 'Не удалось очистить теги',
            failedToMoveFolder: 'Не удалось переместить папку "{name}"',
            failedToImportFiles: 'Не удалось импортировать: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} файлов уже существуют в месте назначения',
            addedTag: 'Добавлен тег "{tag}" к {count} файлам',
            filesAlreadyHaveTag: '{count} файлов уже имеют этот тег или более специфичный',
            clearedTags: 'Все теги удалены из {count} файлов',
            noTagsToClear: 'Нет тегов для очистки',
            fileImported: 'Импортирован 1 файл',
            filesImported: 'Импортировано файлов: {count}'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'Сегодня',
        yesterday: 'Вчера',
        previous7Days: 'Последние 7 дней',
        previous30Days: 'Последние 30 дней'
    },

    // Weekdays
    weekdays: {
        sunday: 'Воскресенье',
        monday: 'Понедельник',
        tuesday: 'Вторник',
        wednesday: 'Среда',
        thursday: 'Четверг',
        friday: 'Пятница',
        saturday: 'Суббота'
    },

    // Plugin commands
    commands: {
        open: 'Открыть', // Command palette: Opens the Notebook Navigator view (English: Open)
        openHomepage: 'Открыть домашнюю страницу', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        revealFile: 'Показать файл', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Поиск', // Command palette: Toggle search in the file list (English: Search)
        toggleDualPane: 'Переключить двухпанельный режим', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        selectVaultProfile: 'Выбрать профиль хранилища', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'Выбрать профиль хранилища 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Выбрать профиль хранилища 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Выбрать профиль хранилища 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Удалить файлы', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Создать новую заметку', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Новая заметка из шаблона', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Переместить файлы', // Command palette: Move selected files to another folder (English: Move files)
        selectNextFile: 'Выбрать следующий файл', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Выбрать предыдущий файл', // Command palette: Selects the previous file in the current view (English: Select previous file)
        convertToFolderNote: 'Конвертировать в заметку папки', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Назначить заметкой папки', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Отвязать заметку папки', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Закрепить все заметки папок', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Перейти к папке', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Перейти к тегу', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        addShortcut: 'Добавить в ярлыки', // Command palette: Adds the current file, folder, or tag to shortcuts (English: Add to shortcuts)
        openShortcut: 'Открыть ярлык {number}',
        toggleDescendants: 'Переключить потомков', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Переключить скрытые папки, теги и заметки', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Переключить сортировку тегов', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        collapseExpand: 'Свернуть / развернуть все элементы', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        addTag: 'Добавить тег к выбранным файлам', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        removeTag: 'Удалить тег из выбранных файлов', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Удалить все теги из выбранных файлов', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        rebuildCache: 'Пересобрать кэш' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Показать в Notebook Navigator' // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Последнее изменение',
        createdAt: 'Создано',
        file: 'файл',
        files: 'файлов',
        folder: 'папка',
        folders: 'папок'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'Отчёт о неудачных метаданных экспортирован в: {filename}',
            exportFailed: 'Не удалось экспортировать отчёт о метаданных'
        },
        sections: {
            general: 'Общие',
            navigationPane: 'Панель навигации',
            icons: 'Наборы иконок',
            folders: 'Папки',
            foldersAndTags: 'Папки и теги',
            tags: 'Теги',
            search: 'Поиск',
            searchAndHotkeys: 'Поиск и горячие клавиши',
            listPane: 'Панель списка',
            notes: 'Заметки',
            hotkeys: 'Горячие клавиши',
            advanced: 'Расширенные'
        },
        groups: {
            general: {
                filtering: 'Фильтрация',
                behavior: 'Поведение',
                view: 'Внешний вид',
                icons: 'Иконки',
                desktopAppearance: 'Внешний вид на компьютере',
                formatting: 'Форматирование'
            },
            navigation: {
                appearance: 'Внешний вид',
                shortcutsAndRecent: 'Ярлыки и недавние элементы'
            },
            list: {
                display: 'Внешний вид',
                pinnedNotes: 'Закреплённые заметки',
                quickActions: 'Быстрые действия'
            },
            notes: {
                frontmatter: 'Frontmatter',
                icon: 'Иконка',
                title: 'Заголовок',
                previewText: 'Текст превью',
                featureImage: 'Изображение записи',
                tags: 'Теги',
                date: 'Дата',
                parentFolder: 'Родительская папка'
            }
        },
        items: {
            searchProvider: {
                name: 'Поставщик поиска',
                desc: 'Выберите между быстрым поиском по имени файла или полнотекстовым поиском с плагином Omnisearch. (не синхронизируется)',
                options: {
                    internal: 'Фильтр-поиск',
                    omnisearch: 'Omnisearch (полнотекстовый)'
                },
                info: {
                    filterSearch: {
                        title: 'Фильтр-поиск (по умолчанию):',
                        description:
                            'Фильтрует файлы по имени и тегам в текущей папке и подпапках. Режим фильтра: смешанный текст и теги соответствуют всем условиям (например, "проект #работа"). Режим тегов: поиск только по тегам поддерживает операторы AND/OR (например, "#работа AND #срочно", "#проект OR #личное"). Cmd/Ctrl+Клик по тегам для добавления с AND, Cmd/Ctrl+Shift+Клик для добавления с OR. Поддерживает исключение с префиксом ! (например, !черновик, !#архив) и поиск заметок без тегов с !#.'
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            'Полнотекстовый поиск по всему хранилищу с последующей фильтрацией результатов для показа только файлов из текущей папки, подпапок или выбранных тегов. Требуется установленный плагин Omnisearch — если недоступен, поиск автоматически переключится на фильтр-поиск.',
                        warningNotInstalled: 'Плагин Omnisearch не установлен. Используется фильтр-поиск.',
                        limitations: {
                            title: 'Известные ограничения:',
                            performance:
                                'Производительность: Может быть медленным, особенно при поиске менее 3 символов в больших хранилищах',
                            pathBug:
                                'Ошибка путей: Не может искать в путях с не-ASCII символами и некорректно ищет в подпутях, что влияет на отображаемые файлы в результатах',
                            limitedResults:
                                'Ограниченные результаты: Поскольку Omnisearch ищет по всему хранилищу и возвращает ограниченное количество результатов до фильтрации, релевантные файлы из текущей папки могут не отображаться, если слишком много совпадений найдено в других местах',
                            previewText:
                                'Текст превью: Превью заметок заменяются на отрывки результатов Omnisearch, которые могут не показывать фактическое совпадение, если оно находится в другом месте файла'
                        }
                    }
                }
            },
            listPaneTitle: {
                name: 'Заголовок панели списка (только компьютер)',
                desc: 'Выберите, где отображается заголовок панели списка.',
                options: {
                    header: 'Показывать в заголовке',
                    list: 'Показывать в панели списка',
                    hidden: 'Не показывать'
                }
            },
            sortNotesBy: {
                name: 'Сортировка заметок',
                desc: 'Выберите способ сортировки заметок в списке.',
                options: {
                    'modified-desc': 'По дате изменения (новые сверху)',
                    'modified-asc': 'По дате изменения (старые сверху)',
                    'created-desc': 'По дате создания (новые сверху)',
                    'created-asc': 'По дате создания (старые сверху)',
                    'title-asc': 'По названию (А сверху)',
                    'title-desc': 'По названию (Я сверху)'
                }
            },
            revealFileOnListChanges: {
                name: 'Прокрутка к выбранному файлу при изменениях списка',
                desc: 'Прокручивать к выбранному файлу при закреплении заметок, показе потомков, изменении внешнего вида папки или выполнении файловых операций.'
            },
            includeDescendantNotes: {
                name: 'Показывать заметки из подпапок / потомков (не синхронизируется)',
                desc: 'Включать заметки из вложенных подпапок и потомков тегов при просмотре папки или тега.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Ограничить закреплённые заметки их папкой',
                desc: 'Закреплённые заметки отображаются только при просмотре папки или тега, где они были закреплены.'
            },
            separateNoteCounts: {
                name: 'Показывать текущие и потомков отдельно',
                desc: 'Отображать количество заметок в формате "текущие ▾ потомки" в папках и тегах.'
            },
            groupNotes: {
                name: 'Группировка заметок',
                desc: 'Показывать заголовки между заметками, сгруппированными по дате или папке. При просмотре тегов используются группы по дате, если включена группировка по папкам.',
                options: {
                    none: 'Не группировать',
                    date: 'Группировать по дате',
                    folder: 'Группировать по папке'
                }
            },
            showPinnedGroupHeader: {
                name: 'Показывать заголовок закреплённых',
                desc: 'Отображать заголовок раздела закреплённых над закреплёнными заметками.'
            },
            showPinnedIcon: {
                name: 'Показывать иконку закреплённых',
                desc: 'Показывать иконку рядом с заголовком раздела закреплённых.'
            },
            defaultListMode: {
                name: 'Режим списка по умолчанию',
                desc: 'Выберите стандартную разметку списка. Стандартный показывает название, дату, описание и превью. Компактный показывает только название. Можно переопределить внешний вид для каждой папки.',
                options: {
                    standard: 'Стандартный',
                    compact: 'Компактный'
                }
            },
            showFileIcons: {
                name: 'Показывать иконки файлов',
                desc: 'Отображать иконки файлов с выравниванием по левому краю. Отключение убирает и иконки, и отступы. Приоритет: пользовательские > имя файла > тип файла > по умолчанию.'
            },
            showFilenameMatchIcons: {
                name: 'Иконки по имени файла',
                desc: 'Назначить иконки файлам на основе текста в их именах.'
            },
            fileNameIconMap: {
                name: 'Сопоставление имён и иконок',
                desc: 'Файлы, содержащие текст, получают указанную иконку. Одно сопоставление на строку: текст=иконка',
                placeholder: '# текст=иконка\nвстреча=LiCalendar\nсчёт=PhReceipt',
                editTooltip: 'Редактировать сопоставления'
            },
            showCategoryIcons: {
                name: 'Иконки по типу файла',
                desc: 'Назначить иконки файлам на основе их расширения.'
            },
            fileTypeIconMap: {
                name: 'Сопоставление типов и иконок',
                desc: 'Файлы с расширением получают указанную иконку. Одно сопоставление на строку: расширение=иконка',
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: 'Редактировать сопоставления'
            },
            optimizeNoteHeight: {
                name: 'Переменная высота заметок',
                desc: 'Использовать компактную высоту для закреплённых заметок и заметок без превью.'
            },
            compactItemHeight: {
                name: 'Высота компактных элементов',
                desc: 'Установите высоту компактных элементов списка на компьютере и мобильном.',
                resetTooltip: 'Восстановить по умолчанию (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Масштабировать текст с высотой компактных элементов',
                desc: 'Масштабировать текст компактного списка при уменьшении высоты элементов.'
            },
            showParentFolder: {
                name: 'Показывать родительскую папку',
                desc: 'Отображать название родительской папки для заметок в подпапках или тегах.'
            },
            parentFolderClickRevealsFile: {
                name: 'Клик по родительской папке открывает папку',
                desc: 'Клик по метке родительской папки открывает папку в панели списка.'
            },
            showParentFolderColor: {
                name: 'Показывать цвет родительской папки',
                desc: 'Использовать цвета папок на метках родительских папок.'
            },
            showQuickActions: {
                name: 'Показывать быстрые действия (только компьютер)',
                desc: 'Показывать кнопки действий при наведении на файлы. Элементы управления выбирают, какие действия отображаются.'
            },
            dualPane: {
                name: 'Двухпанельный режим (не синхронизируется)',
                desc: 'Показывать панель навигации и панель списка рядом на компьютере.'
            },
            dualPaneOrientation: {
                name: 'Ориентация двухпанельного режима (не синхронизируется)',
                desc: 'Выберите горизонтальную или вертикальную разметку при активном двухпанельном режиме.',
                options: {
                    horizontal: 'Горизонтальное разделение',
                    vertical: 'Вертикальное разделение'
                }
            },
            appearanceBackground: {
                name: 'Цвет фона',
                desc: 'Выберите цвета фона для панелей навигации и списка.',
                options: {
                    separate: 'Раздельные фоны',
                    primary: 'Использовать фон списка',
                    secondary: 'Использовать фон навигации'
                }
            },
            appearanceScale: {
                name: 'Уровень масштабирования (не синхронизируется)',
                desc: 'Управляет общим масштабом Notebook Navigator.'
            },
            startView: {
                name: 'Начальный вид по умолчанию',
                desc: 'Выберите, какая панель отображается при открытии Notebook Navigator. Панель навигации показывает ярлыки, недавние заметки и дерево папок. Панель списка сразу показывает список заметок.',
                options: {
                    navigation: 'Панель навигации',
                    files: 'Панель списка'
                }
            },
            toolbarButtons: {
                name: 'Кнопки панели инструментов',
                desc: 'Выберите, какие кнопки отображаются на панели инструментов. Скрытые кнопки остаются доступными через команды и меню.',
                navigationLabel: 'Панель навигации',
                listLabel: 'Панель списка'
            },
            autoRevealActiveNote: {
                name: 'Автопоказ активной заметки',
                desc: 'Автоматически показывать заметки, открытые из быстрого переключателя, ссылок или поиска.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Игнорировать события из правой боковой панели',
                desc: 'Не менять активную заметку при клике или изменении заметок в правой боковой панели.'
            },
            paneTransitionDuration: {
                name: 'Анимация одиночной панели',
                desc: 'Длительность перехода при переключении панелей в режиме одиночной панели (миллисекунды).',
                resetTooltip: 'Сбросить по умолчанию'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Автовыбор первой заметки (только компьютер)',
                desc: 'Автоматически открывать первую заметку при смене папок или тегов.'
            },
            skipAutoScroll: {
                name: 'Отключить автопрокрутку для ярлыков',
                desc: 'Не прокручивать панель навигации при клике по элементам в ярлыках.'
            },
            autoExpandFoldersTags: {
                name: 'Разворачивать при выборе',
                desc: 'Разворачивать папки и теги при выборе. В однопанельном режиме первый выбор разворачивает, второй показывает файлы.'
            },
            springLoadedFolders: {
                name: 'Разворачивать при перетаскивании (только компьютер)',
                desc: 'Разворачивать папки и теги при наведении во время перетаскивания.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Задержка первого разворачивания',
                desc: 'Задержка перед разворачиванием первой папки или тега во время перетаскивания (секунды).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Задержка последующих разворачиваний',
                desc: 'Задержка перед разворачиванием дополнительных папок или тегов во время того же перетаскивания (секунды).'
            },
            navigationBanner: {
                name: 'Баннер навигации (профиль хранилища)',
                desc: 'Показывать изображение над панелью навигации. Меняется с выбранным профилем хранилища.',
                current: 'Текущий баннер: {path}',
                chooseButton: 'Выбрать изображение'
            },
            showShortcuts: {
                name: 'Показывать ярлыки',
                desc: 'Отображать раздел ярлыков в панели навигации.'
            },
            shortcutBadgeDisplay: {
                name: 'Значок ярлыка',
                desc: "Что отображать рядом с ярлыками. Используйте команды 'Открыть ярлык 1-9' для прямого открытия ярлыков.",
                options: {
                    index: 'Позиция (1-9)',
                    count: 'Количество элементов',
                    none: 'Нет'
                }
            },
            showRecentNotes: {
                name: 'Показывать недавние заметки',
                desc: 'Отображать раздел недавних заметок в панели навигации.'
            },
            recentNotesCount: {
                name: 'Количество недавних заметок',
                desc: 'Количество отображаемых недавних заметок.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Закрепить недавние заметки вместе с ярлыками',
                desc: 'Включать недавние заметки при закреплении ярлыков.'
            },
            showTooltips: {
                name: 'Показывать подсказки',
                desc: 'Отображать всплывающие подсказки с дополнительной информацией для заметок и папок.'
            },
            showTooltipPath: {
                name: 'Показывать путь',
                desc: 'Отображать путь к папке под названиями заметок в подсказках.'
            },
            resetPaneSeparator: {
                name: 'Сбросить положение разделителя панелей',
                desc: 'Сбросить перетаскиваемый разделитель между панелью навигации и панелью списка в положение по умолчанию.',
                buttonText: 'Сбросить разделитель',
                notice: 'Положение разделителя сброшено. Перезапустите Obsidian или переоткройте Notebook Navigator для применения.'
            },
            multiSelectModifier: {
                name: 'Модификатор множественного выбора (только компьютер)',
                desc: 'Выберите, какая клавиша-модификатор переключает множественный выбор. При выборе Option/Alt, клик с Cmd/Ctrl открывает заметки в новой вкладке.',
                options: {
                    cmdCtrl: 'Клик с Cmd/Ctrl',
                    optionAlt: 'Клик с Option/Alt'
                }
            },
            fileVisibility: {
                name: 'Показывать типы файлов (профиль хранилища)',
                desc: 'Фильтруйте, какие типы файлов отображаются в навигаторе. Типы файлов, не поддерживаемые Obsidian, могут открываться во внешних приложениях.',
                options: {
                    documents: 'Документы (.md, .canvas, .base)',
                    supported: 'Поддерживаемые (открываются в Obsidian)',
                    all: 'Все (могут открываться внешне)'
                }
            },
            homepage: {
                name: 'Домашняя страница',
                desc: 'Выберите файл, который Notebook Navigator открывает автоматически, например панель управления.',
                current: 'Текущая: {path}',
                currentMobile: 'Мобильная: {path}',
                chooseButton: 'Выбрать файл',

                separateMobile: {
                    name: 'Отдельная мобильная домашняя страница',
                    desc: 'Использовать другую домашнюю страницу для мобильных устройств.'
                }
            },
            excludedNotes: {
                name: 'Скрыть заметки (профиль хранилища)',
                desc: 'Список свойств frontmatter через запятую. Заметки, содержащие любое из этих свойств, будут скрыты (например, draft, private, archived).',
                placeholder: 'draft, private'
            },
            excludedFileNamePatterns: {
                name: 'Скрыть файлы (профиль хранилища)',
                desc: 'Список шаблонов имён файлов через запятую для скрытия. Поддерживает подстановочные знаки * и пути / (например, temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Профиль хранилища',
                desc: 'Профили хранят видимость типов файлов, скрытые файлы, скрытые папки, скрытые теги, скрытые заметки, ярлыки и баннер навигации. Переключайте профили из заголовка панели навигации.',
                defaultName: 'По умолчанию',
                addButton: 'Добавить профиль',
                editProfilesButton: 'Редактировать профили',
                addProfileOption: 'Добавить профиль...',
                applyButton: 'Применить',
                editButton: 'Редактировать профиль',
                deleteButton: 'Удалить профиль',
                addModalTitle: 'Добавить профиль',
                editProfilesModalTitle: 'Редактировать профили',
                editModalTitle: 'Редактировать профиль',
                addModalPlaceholder: 'Название профиля',
                deleteModalTitle: 'Удалить {name}',
                deleteModalMessage:
                    'Удалить {name}? Фильтры скрытых файлов, папок, тегов и заметок, сохранённые в этом профиле, будут удалены.',
                moveUp: 'Переместить вверх',
                moveDown: 'Переместить вниз',
                errors: {
                    emptyName: 'Введите название профиля',
                    duplicateName: 'Профиль с таким названием уже существует'
                }
            },
            vaultTitle: {
                name: 'Расположение названия хранилища (только для компьютера)',
                desc: 'Выберите, где отображается название хранилища.',
                options: {
                    header: 'Показать в заголовке',
                    navigation: 'Показать в панели навигации'
                }
            },
            excludedFolders: {
                name: 'Скрыть папки (профиль хранилища)',
                desc: 'Список папок через запятую для скрытия. Шаблоны имён: assets* (папки, начинающиеся с assets), *_temp (заканчивающиеся на _temp). Шаблоны путей: /archive (только корневой archive), /res* (корневые папки, начинающиеся с res), /*/temp (папки temp на один уровень вглубь), /projects/* (все папки внутри projects).',
                placeholder: 'templates, assets*, /archive, /res*'
            },
            showFileDate: {
                name: 'Показывать дату',
                desc: 'Отображать дату под названиями заметок.'
            },
            alphabeticalDateMode: {
                name: 'При сортировке по имени',
                desc: 'Какую дату показывать при алфавитной сортировке заметок.',
                options: {
                    created: 'Дата создания',
                    modified: 'Дата изменения'
                }
            },
            showFileTags: {
                name: 'Показывать теги файлов',
                desc: 'Отображать кликабельные теги в элементах файлов.'
            },
            showFileTagAncestors: {
                name: 'Показывать полные пути тегов',
                desc: "Отображать полные пути иерархии тегов. При включении: 'ai/openai', 'work/projects/2024'. При отключении: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Цветные теги файлов',
                desc: 'Применять цвета тегов к значкам тегов на элементах файлов.'
            },
            prioritizeColoredFileTags: {
                name: 'Показывать цветные теги первыми',
                desc: 'Сортировать цветные теги перед другими тегами на элементах файлов.'
            },
            showFileTagsInCompactMode: {
                name: 'Показывать теги файлов в компактном режиме',
                desc: 'Отображать теги, когда дата, превью и изображение скрыты.'
            },
            dateFormat: {
                name: 'Формат даты',
                desc: 'Формат отображения дат (использует формат date-fns).',
                placeholder: 'd MMMM yyyy',
                help: 'Распространённые форматы:\nd MMMM yyyy = 25 мая 2022\ndd.MM.yyyy = 25.05.2022\nyyyy-MM-dd = 2022-05-25\n\nТокены:\nyyyy/yy = год\nMMMM/MMM/MM = месяц\ndd/d = день\nEEEE/EEE = день недели',
                helpTooltip: 'Нажмите для справки по формату'
            },
            timeFormat: {
                name: 'Формат времени',
                desc: 'Формат отображения времени (использует формат date-fns).',
                placeholder: 'HH:mm',
                help: 'Распространённые форматы:\nHH:mm = 14:30 (24-часовой)\nh:mm a = 2:30 PM (12-часовой)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nТокены:\nHH/H = 24-часовой\nhh/h = 12-часовой\nmm = минуты\nss = секунды\na = AM/PM',
                helpTooltip: 'Нажмите для справки по формату'
            },
            showFilePreview: {
                name: 'Показывать превью заметки',
                desc: 'Отображать текст превью под названиями заметок.'
            },
            skipHeadingsInPreview: {
                name: 'Пропускать заголовки в превью',
                desc: 'Пропускать строки заголовков при генерации текста превью.'
            },
            skipCodeBlocksInPreview: {
                name: 'Пропускать блоки кода в превью',
                desc: 'Пропускать блоки кода при генерации текста превью.'
            },
            stripHtmlInPreview: {
                name: 'Удалять HTML в превью',
                desc: 'Удалять HTML-теги из текста предпросмотра. Может влиять на производительность при больших заметках.'
            },
            previewProperties: {
                name: 'Свойства превью',
                desc: 'Список свойств frontmatter через запятую для проверки текста превью. Используется первое свойство с текстом.',
                placeholder: 'summary, description, abstract',
                info: 'Если текст превью не найден в указанных свойствах, превью будет сгенерировано из содержимого заметки.'
            },
            previewRows: {
                name: 'Строки превью',
                desc: 'Количество строк для отображения текста превью.',
                options: {
                    '1': '1 строка',
                    '2': '2 строки',
                    '3': '3 строки',
                    '4': '4 строки',
                    '5': '5 строк'
                }
            },
            fileNameRows: {
                name: 'Строки заголовка',
                desc: 'Количество строк для отображения названий заметок.',
                options: {
                    '1': '1 строка',
                    '2': '2 строки'
                }
            },
            showFeatureImage: {
                name: 'Показывать изображение',
                desc: 'Отображает миниатюру первого изображения в заметке.'
            },
            forceSquareFeatureImage: {
                name: 'Квадратные изображения',
                desc: 'Отображать изображения как квадратные миниатюры.'
            },
            featureImageProperties: {
                name: 'Свойства изображения',
                desc: 'Список свойств frontmatter через запятую для проверки миниатюр.',
                placeholder: 'thumbnail, featureResized, feature'
            },

            downloadExternalFeatureImages: {
                name: 'Загружать внешние изображения',
                desc: 'Загружать удалённые изображения и миниатюры YouTube для обложек.'
            },
            showRootFolder: {
                name: 'Показывать корневую папку',
                desc: 'Отображать название хранилища как корневую папку в дереве.'
            },
            showFolderIcons: {
                name: 'Показывать иконки папок',
                desc: 'Отображать иконки рядом с папками в панели навигации.'
            },
            inheritFolderColors: {
                name: 'Наследовать цвета папок',
                desc: 'Дочерние папки наследуют цвет от родительских папок.'
            },
            showNoteCount: {
                name: 'Показывать количество заметок',
                desc: 'Отображать количество заметок рядом с каждой папкой и тегом.'
            },
            showSectionIcons: {
                name: 'Показывать иконки для ярлыков и недавних',
                desc: 'Отображать иконки для разделов навигации, таких как Ярлыки и Недавние файлы.'
            },
            interfaceIcons: {
                name: 'Иконки интерфейса',
                desc: 'Редактировать иконки панели инструментов, папок, тегов, закреплённых, поиска и сортировки.',
                buttonText: 'Редактировать иконки'
            },
            showIconsColorOnly: {
                name: 'Применять цвет только к иконкам',
                desc: 'При включении пользовательские цвета применяются только к иконкам. При отключении цвета применяются и к иконкам, и к текстовым меткам.'
            },
            collapseBehavior: {
                name: 'Сворачивание элементов',
                desc: 'Выберите, на что влияет кнопка развернуть/свернуть всё.',
                options: {
                    all: 'Все папки и теги',
                    foldersOnly: 'Только папки',
                    tagsOnly: 'Только теги'
                }
            },
            smartCollapse: {
                name: 'Сохранять выбранный элемент развёрнутым',
                desc: 'При сворачивании сохранять текущую выбранную папку или тег и их родителей развёрнутыми.'
            },
            navIndent: {
                name: 'Отступ дерева',
                desc: 'Настройте ширину отступа для вложенных папок и тегов.'
            },
            navItemHeight: {
                name: 'Высота элемента',
                desc: 'Настройте высоту папок и тегов в панели навигации.'
            },
            navItemHeightScaleText: {
                name: 'Масштабировать текст с высотой элемента',
                desc: 'Уменьшать размер текста навигации при уменьшении высоты элемента.'
            },
            navRootSpacing: {
                name: 'Отступ корневых элементов',
                desc: 'Отступ между корневыми папками и тегами.'
            },
            showTags: {
                name: 'Показывать теги',
                desc: 'Отображать раздел тегов в навигаторе.'
            },
            showTagIcons: {
                name: 'Показывать иконки тегов',
                desc: 'Отображать иконки рядом с тегами в панели навигации.'
            },
            inheritTagColors: {
                name: 'Наследовать цвета тегов',
                desc: 'Дочерние теги наследуют цвет от родительских тегов.'
            },
            tagSortOrder: {
                name: 'Сортировка тегов',
                desc: 'Выберите порядок отображения тегов в панели навигации. (не синхронизируется)',
                options: {
                    alphaAsc: 'От А до Я',
                    alphaDesc: 'От Я до А',
                    frequencyAsc: 'По частоте (от низкой к высокой)',
                    frequencyDesc: 'По частоте (от высокой к низкой)'
                }
            },
            showAllTagsFolder: {
                name: 'Показывать папку тегов',
                desc: 'Отображать "Теги" как сворачиваемую папку.'
            },
            showUntagged: {
                name: 'Показывать заметки без тегов',
                desc: 'Отображать элемент "Без тегов" для заметок без тегов.'
            },
            keepEmptyTagsProperty: {
                name: 'Сохранять свойство tags после удаления последнего тега',
                desc: 'Сохранять свойство tags в frontmatter, когда все теги удалены. При отключении свойство tags удаляется из frontmatter.'
            },
            hiddenTags: {
                name: 'Скрыть теги (профиль хранилища)',
                desc: 'Список шаблонов тегов через запятую. Шаблоны имён: тег* (начинается с), *тег (заканчивается на). Шаблоны путей: архив (тег и потомки), архив/* (только потомки), проекты/*/черновики (подстановочный знак в середине).',
                placeholder: 'архив*, *черновик, проекты/*/старые'
            },
            enableFolderNotes: {
                name: 'Включить заметки папок',
                desc: 'При включении папки с связанными заметками отображаются как кликабельные ссылки.'
            },
            folderNoteType: {
                name: 'Тип заметки папки по умолчанию',
                desc: 'Тип заметки папки, создаваемой из контекстного меню.',
                options: {
                    ask: 'Спрашивать при создании',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'Название заметки папки',
                desc: 'Название заметки папки без расширения. Оставьте пустым для использования того же имени, что и у папки.',
                placeholder: 'index'
            },
            folderNoteProperties: {
                name: 'Свойства заметки папки',
                desc: 'YAML frontmatter, добавляемый к новым заметкам папок. Маркеры --- добавляются автоматически.',
                placeholder: 'theme: dark\nfoldernote: true'
            },
            hideFolderNoteInList: {
                name: 'Скрывать заметку папки в списке',
                desc: 'Скрывать заметку папки в списке заметок папки.'
            },
            pinCreatedFolderNote: {
                name: 'Закреплять созданные заметки папок',
                desc: 'Автоматически закреплять заметки папок при создании из контекстного меню.'
            },
            confirmBeforeDelete: {
                name: 'Подтверждать перед удалением',
                desc: 'Показывать диалог подтверждения при удалении заметок или папок'
            },
            interceptTagClicks: {
                name: 'Переход к тегам по клику',
                desc: 'При клике на теги в заметках переходить к этому тегу в Notebook Navigator вместо запуска поиска Obsidian.'
            },
            metadataCleanup: {
                name: 'Очистка метаданных',
                desc: 'Удаляет осиротевшие метаданные, оставшиеся после удаления, перемещения или переименования файлов, папок или тегов вне Obsidian. Это влияет только на файл настроек Notebook Navigator.',
                buttonText: 'Очистить метаданные',
                error: 'Ошибка очистки настроек',
                loading: 'Проверка метаданных...',
                statusClean: 'Нет метаданных для очистки',
                statusCounts:
                    'Осиротевшие элементы: {folders} папок, {tags} тегов, {files} файлов, {pinned} закреплённых, {separators} разделителей'
            },
            rebuildCache: {
                name: 'Пересобрать кэш',
                desc: 'Используйте, если вы испытываете проблемы с отсутствующими тегами, некорректными превью или отсутствующими изображениями. Это может произойти после конфликтов синхронизации или неожиданных закрытий.',
                buttonText: 'Пересобрать кэш',
                success: 'Кэш пересобран',
                error: 'Не удалось пересобрать кэш',
                indexingTitle: 'Индексирование хранилища...',
                progress: 'Обновление кэша Notebook Navigator.'
            },
            hotkeys: {
                intro: 'Отредактируйте <папка плагина>/notebook-navigator/data.json для настройки горячих клавиш Notebook Navigator. Откройте файл и найдите раздел "keyboardShortcuts". Каждая запись использует такую структуру:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Shift',
                    '"Ctrl" = Control (предпочтительно "Mod" для кроссплатформенности)'
                ],
                guidance:
                    'Добавьте несколько привязок для поддержки альтернативных клавиш, как показано выше для ArrowUp и K. Комбинируйте модификаторы в одной записи, перечисляя каждое значение, например "modifiers": ["Mod", "Shift"]. Последовательности клавиш, такие как "gg" или "dd", не поддерживаются. Перезагрузите Obsidian после редактирования файла.'
            },
            externalIcons: {
                downloadButton: 'Скачать',
                downloadingLabel: 'Загрузка...',
                removeButton: 'Удалить',
                statusInstalled: 'Загружено (версия {version})',
                statusNotInstalled: 'Не загружено',
                versionUnknown: 'неизвестно',
                downloadFailed: 'Не удалось скачать {name}. Проверьте подключение и попробуйте снова.',
                removeFailed: 'Не удалось удалить {name}.',
                infoNote:
                    'Загруженные наборы иконок синхронизируют состояние установки между устройствами. Наборы иконок остаются в локальной базе данных на каждом устройстве; синхронизация отслеживает только необходимость загрузки или удаления. Наборы иконок загружаются из репозитория Notebook Navigator (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterDates: {
                name: 'Использовать метаданные frontmatter',
                desc: 'Использовать frontmatter для названия заметки, временных меток, иконок и цветов'
            },
            frontmatterIconField: {
                name: 'Поле иконки',
                desc: 'Поле frontmatter для иконок файлов. Оставьте пустым для использования иконок из настроек.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'Поле цвета',
                desc: 'Поле frontmatter для цветов файлов. Оставьте пустым для использования цветов из настроек.',
                placeholder: 'color'
            },
            frontmatterSaveMetadata: {
                name: 'Сохранять иконки и цвета во frontmatter',
                desc: 'Автоматически записывать иконки и цвета файлов во frontmatter, используя настроенные выше поля.'
            },
            frontmatterMigration: {
                name: 'Миграция иконок и цветов из настроек',
                desc: 'Сохранено в настройках: {icons} иконок, {colors} цветов.',
                button: 'Мигрировать',
                buttonWorking: 'Миграция...',
                noticeNone: 'Нет иконок или цветов файлов в настройках.',
                noticeDone: 'Мигрировано {migratedIcons}/{icons} иконок, {migratedColors}/{colors} цветов.',
                noticeFailures: 'Неудачные записи: {failures}.',
                noticeError: 'Миграция не удалась. Проверьте консоль для деталей.'
            },
            frontmatterNameField: {
                name: 'Поля названия',
                desc: 'Список полей frontmatter через запятую. Используется первое непустое значение. Возвращается к имени файла.',
                placeholder: 'заголовок, название'
            },
            frontmatterCreatedField: {
                name: 'Поле даты создания',
                desc: 'Имя поля frontmatter для временной метки создания. Оставьте пустым для использования только даты файловой системы.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'Поле даты изменения',
                desc: 'Имя поля frontmatter для временной метки изменения. Оставьте пустым для использования только даты файловой системы.',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'Формат временной метки',
                desc: 'Формат для разбора временных меток во frontmatter. Оставьте пустым для использования формата ISO 8601',
                helpTooltip: 'См. документацию формата date-fns',
                help: "Распространённые форматы:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'Поддержать разработку',
                desc: 'Если вам нравится использовать Notebook Navigator, пожалуйста, рассмотрите возможность поддержки его дальнейшей разработки.',
                buttonText: '❤️ Спонсор',
                coffeeButton: '☕️ Купить кофе'
            },
            updateCheckOnStart: {
                name: 'Проверять новую версию при запуске',
                desc: 'Проверяет наличие новых релизов плагина при запуске и показывает уведомление, когда доступно обновление. Каждая версия объявляется только один раз, и проверки происходят не чаще одного раза в день.',
                status: 'Доступна новая версия: {version}'
            },
            whatsNew: {
                name: 'Что нового в Notebook Navigator {version}',
                desc: 'Посмотреть последние обновления и улучшения',
                buttonText: 'Посмотреть обновления'
            },
            masteringVideo: {
                name: 'Освоение Notebook Navigator (видео)',
                desc: 'Это видео охватывает всё, что нужно для продуктивной работы с Notebook Navigator, включая горячие клавиши, поиск, теги и расширенную настройку.'
            },
            cacheStatistics: {
                localCache: 'Локальный кэш',
                items: 'элементов',
                withTags: 'с тегами',
                withPreviewText: 'с текстом превью',
                withFeatureImage: 'с изображением',
                withMetadata: 'с метаданными'
            },
            metadataInfo: {
                successfullyParsed: 'Успешно разобрано',
                itemsWithName: 'элементов с названием',
                withCreatedDate: 'с датой создания',
                withModifiedDate: 'с датой изменения',
                withIcon: 'с иконкой',
                withColor: 'с цветом',
                failedToParse: 'Не удалось разобрать',
                createdDates: 'дат создания',
                modifiedDates: 'дат изменения',
                checkTimestampFormat: 'Проверьте формат временной метки.',
                exportFailed: 'Экспортировать ошибки'
            }
        }
    },
    whatsNew: {
        title: 'Что нового в Notebook Navigator',
        supportMessage: 'Если вы находите Notebook Navigator полезным, пожалуйста, рассмотрите возможность поддержки его разработки.',
        supportButton: 'Купить кофе',
        thanksButton: 'Спасибо!'
    }
};
