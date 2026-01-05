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
 * Ukrainian language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_UK = {
    // Common UI elements
    common: {
        cancel: 'Скасувати', // Button text for canceling dialogs and operations (English: Cancel)
        delete: 'Видалити', // Button text for delete operations in dialogs (English: Delete)
        clear: 'Очистити', // Button text for clearing values (English: Clear)
        remove: 'Вилучити', // Button text for remove operations in dialogs (English: Remove)
        submit: 'Надіслати', // Button text for submitting forms and dialogs (English: Submit)
        noSelection: 'Нічого не вибрано', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Без тегів', // Label for notes without any tags (English: Untagged)
        untitled: 'Без назви', // Default name for notes without a title (English: Untitled)
        featureImageAlt: 'Головне зображення', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Невідома помилка', // Generic fallback when an error has no message (English: Unknown error)
        updateBannerTitle: 'Доступне оновлення Notebook Navigator',
        updateBannerInstruction: 'Оновіть у Налаштування -> Плагіни спільноти',
        updateIndicatorLabel: 'Доступна нова версія'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Виберіть папку або тег для перегляду нотаток', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Немає нотаток', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Закріплені', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Нотатки', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Файли', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (приховано)' // Accessibility label applied to list items that are normally hidden
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Без тегів', // Label for the special item showing notes without tags (English: Untagged)
        hiddenTags: 'Приховані теги', // Label for the hidden tags virtual folder (English: Hidden tags)
        tags: 'Теги' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Ярлики', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentNotesHeader: 'Останні нотатки', // Header label for recent notes section in navigation pane (English: Recent notes)
        recentFilesHeader: 'Останні файли', // Header label when showing recent non-note files in navigation pane (English: Recent files)
        reorderRootFoldersTitle: 'Змінити порядок навігації',
        reorderRootFoldersHint: 'Використовуйте стрілки або перетягування',
        vaultRootLabel: 'Сховище',
        resetRootToAlpha: 'Скинути до алфавітного порядку',
        resetRootToFrequency: 'Скинути до порядку за частотою',
        pinShortcuts: 'Закріпити ярлики',
        pinShortcutsAndRecentNotes: 'Закріпити ярлики та останні нотатки',
        pinShortcutsAndRecentFiles: 'Закріпити ярлики та останні файли',
        unpinShortcuts: 'Відкріпити ярлики',
        unpinShortcutsAndRecentNotes: 'Відкріпити ярлики та останні нотатки',
        unpinShortcutsAndRecentFiles: 'Відкріпити ярлики та останні файли',
        profileMenuLabel: 'Профіль',
        profileMenuAria: 'Змінити профіль сховища'
    },

    shortcuts: {
        folderExists: 'Папка вже в ярликах',
        noteExists: 'Нотатка вже в ярликах',
        tagExists: 'Тег вже в ярликах',
        searchExists: 'Ярлик пошуку вже існує',
        emptySearchQuery: 'Введіть пошуковий запит перед збереженням',
        emptySearchName: 'Введіть назву перед збереженням пошуку',
        add: 'Додати до ярликів',
        addNotesCount: 'Додати {count} нотаток до ярликів',
        addFilesCount: 'Додати {count} файлів до ярликів',
        rename: 'Перейменувати ярлик',
        remove: 'Вилучити з ярликів',
        removeAll: 'Видалити всі ярлики',
        removeAllConfirm: 'Видалити всі ярлики?',
        folderNotesPinned: 'Закріплено {count} нотаток папок'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Згорнути елементи', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'Розгорнути всі елементи', // Tooltip for button that expands all items (English: Expand all items)
        scrollToTop: 'Прокрутити вгору',
        newFolder: 'Нова папка', // Tooltip for create new folder button (English: New folder)
        newNote: 'Нова нотатка', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Назад до навігації', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeSortOrder: 'Змінити порядок сортування', // Tooltip for the sort order toggle button (English: Change sort order)
        defaultSort: 'За замовчуванням', // Label for default sorting mode (English: Default)
        customSort: 'Власний', // Label for custom sorting mode (English: Custom)
        showFolders: 'Показати навігацію', // Tooltip for button to show the navigation pane (English: Show navigation)
        hideFolders: 'Сховати навігацію', // Tooltip for button to hide the navigation pane (English: Hide navigation)
        reorderRootFolders: 'Змінити порядок навігації',
        finishRootFolderReorder: 'Готово',
        toggleDescendantNotes: 'Показати нотатки з підпапок / нащадків', // Tooltip: include descendants for folders and tags
        autoExpandFoldersTags: 'Розгортати при виборі', // Tooltip for button to toggle auto-expanding folders and tags when selected (English: Expand on selection)
        showExcludedItems: 'Показати приховані папки, теги та нотатки', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Сховати приховані папки, теги та нотатки', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Показати подвійну панель', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Показати одну панель', // Tooltip for button to show single-pane layout (English: Show single pane)
        changeAppearance: 'Змінити вигляд', // Tooltip for button to change folder appearance settings (English: Change appearance)
        search: 'Пошук' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Пошук...', // Placeholder text for search input (English: Search...)
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Очистити пошук', // Tooltip for clear search button (English: Clear search)
        saveSearchShortcut: 'Зберегти ярлик пошуку',
        removeSearchShortcut: 'Вилучити ярлик пошуку',
        shortcutModalTitle: 'Зберегти ярлик пошуку',
        shortcutNamePlaceholder: 'Введіть назву ярлика'
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'Відкрити в новій вкладці',
            openToRight: 'Відкрити праворуч',
            openInNewWindow: 'Відкрити в новому вікні',
            openMultipleInNewTabs: 'Відкрити {count} нотаток у нових вкладках',
            openMultipleFilesInNewTabs: 'Відкрити {count} файлів у нових вкладках',
            openMultipleToRight: 'Відкрити {count} нотаток праворуч',
            openMultipleFilesToRight: 'Відкрити {count} файлів праворуч',
            openMultipleInNewWindows: 'Відкрити {count} нотаток у нових вікнах',
            openMultipleFilesInNewWindows: 'Відкрити {count} файлів у нових вікнах',
            pinNote: 'Закріпити нотатку',
            pinFile: 'Закріпити файл',
            unpinNote: 'Відкріпити нотатку',
            unpinFile: 'Відкріпити файл',
            pinMultipleNotes: 'Закріпити {count} нотаток',
            pinMultipleFiles: 'Закріпити {count} файлів',
            unpinMultipleNotes: 'Відкріпити {count} нотаток',
            unpinMultipleFiles: 'Відкріпити {count} файлів',
            duplicateNote: 'Дублювати нотатку',
            duplicateFile: 'Дублювати файл',
            duplicateMultipleNotes: 'Дублювати {count} нотаток',
            duplicateMultipleFiles: 'Дублювати {count} файлів',
            openVersionHistory: 'Відкрити історію версій',
            revealInFolder: 'Показати в папці',
            revealInFinder: 'Показати у Finder',
            showInExplorer: 'Показати в провіднику системи',
            copyDeepLink: 'Копіювати URL Obsidian',
            copyPath: 'Копіювати шлях файлової системи',
            copyRelativePath: 'Копіювати шлях сховища',
            renameNote: 'Перейменувати нотатку',
            renameFile: 'Перейменувати файл',
            deleteNote: 'Видалити нотатку',
            deleteFile: 'Видалити файл',
            deleteMultipleNotes: 'Видалити {count} нотаток',
            deleteMultipleFiles: 'Видалити {count} файлів',
            moveNoteToFolder: 'Перемістити нотатку...',
            moveFileToFolder: 'Перемістити файл...',
            moveMultipleNotesToFolder: 'Перемістити {count} нотаток...',
            moveMultipleFilesToFolder: 'Перемістити {count} файлів...',
            addTag: 'Додати тег',
            removeTag: 'Вилучити тег',
            removeAllTags: 'Вилучити всі теги',
            changeIcon: 'Змінити іконку',
            changeColor: 'Змінити колір'
        },
        folder: {
            newNote: 'Нова нотатка',
            newNoteFromTemplate: 'Нова нотатка з шаблону',
            newFolder: 'Нова папка',
            newCanvas: 'Нове полотно',
            newBase: 'Нова база даних',
            newDrawing: 'Новий малюнок',
            newExcalidrawDrawing: 'Новий малюнок Excalidraw',
            newTldrawDrawing: 'Новий малюнок Tldraw',
            duplicateFolder: 'Дублювати папку',
            searchInFolder: 'Шукати в папці',
            copyPath: 'Копіювати шлях файлової системи',
            copyRelativePath: 'Копіювати шлях сховища',
            createFolderNote: 'Створити нотатку папки',
            detachFolderNote: "Від'єднати нотатку папки",
            deleteFolderNote: 'Видалити нотатку папки',
            changeIcon: 'Змінити іконку',
            changeColor: 'Змінити колір',
            changeBackground: 'Змінити фон',
            excludeFolder: 'Сховати папку',
            unhideFolder: 'Показати папку',
            moveFolder: 'Перемістити папку...',
            renameFolder: 'Перейменувати папку',
            deleteFolder: 'Видалити папку'
        },
        tag: {
            changeIcon: 'Змінити іконку',
            changeColor: 'Змінити колір',
            changeBackground: 'Змінити фон',
            showTag: 'Показати тег',
            hideTag: 'Сховати тег'
        },
        navigation: {
            addSeparator: 'Додати роздільник',
            removeSeparator: 'Вилучити роздільник'
        },
        style: {
            title: 'Стиль',
            copy: 'Копіювати стиль',
            paste: 'Вставити стиль',
            removeIcon: 'Видалити іконку',
            removeColor: 'Видалити колір',
            removeBackground: 'Видалити фон',
            clear: 'Очистити стиль'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        standardPreset: 'Стандартний',
        compactPreset: 'Компактний',
        defaultSuffix: '(за замовчуванням)',
        titleRows: 'Рядки заголовка',
        previewRows: 'Рядки попереднього перегляду',
        groupBy: 'Групувати за',
        defaultOption: (rows: number) => `За замовчуванням (${rows})`,
        defaultTitleOption: (rows: number) => `Рядки заголовка за замовчуванням (${rows})`,
        defaultPreviewOption: (rows: number) => `Рядки попереднього перегляду за замовчуванням (${rows})`,
        defaultGroupOption: (groupLabel: string) => `Групування за замовчуванням (${groupLabel})`,
        titleRowOption: (rows: number) => `${rows} ${rows === 1 ? 'рядок' : rows < 5 ? 'рядки' : 'рядків'} заголовка`,
        previewRowOption: (rows: number) => `${rows} ${rows === 1 ? 'рядок' : rows < 5 ? 'рядки' : 'рядків'} попереднього перегляду`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'Пошук іконок...',
            recentlyUsedHeader: 'Нещодавно використані',
            emptyStateSearch: 'Почніть вводити для пошуку іконок',
            emptyStateNoResults: 'Іконок не знайдено',
            showingResultsInfo: 'Показано 50 з {count} результатів. Введіть більше для уточнення.',
            emojiInstructions: 'Введіть або вставте будь-який емодзі для використання як іконки',
            removeIcon: 'Вилучити іконку',
            allTabLabel: 'Всі'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Додати правило'
        },
        interfaceIcons: {
            title: 'Іконки інтерфейсу',
            items: {
                'nav-shortcuts': 'Ярлики',
                'nav-recent-files': 'Нещодавні файли',
                'nav-expand-all': 'Розгорнути все',
                'nav-collapse-all': 'Згорнути все',
                'nav-tree-expand': 'Стрілка дерева: розгорнути',
                'nav-tree-collapse': 'Стрілка дерева: згорнути',
                'nav-hidden-items': 'Приховані елементи',
                'nav-root-reorder': 'Змінити порядок кореневих папок',
                'nav-new-folder': 'Нова папка',
                'nav-show-single-pane': 'Показати одну панель',
                'nav-show-dual-pane': 'Показати подвійну панель',
                'nav-profile-chevron': 'Стрілка меню профілю',
                'list-search': 'Пошук',
                'list-descendants': 'Нотатки з підпапок',
                'list-sort-ascending': 'Порядок сортування: за зростанням',
                'list-sort-descending': 'Порядок сортування: за спаданням',
                'list-appearance': 'Змінити вигляд',
                'list-new-note': 'Нова нотатка',
                'nav-folder-open': 'Папка відкрита',
                'nav-folder-closed': 'Папка закрита',
                'nav-tag': 'Тег',
                'list-pinned': 'Закріплені елементи'
            }
        },
        colorPicker: {
            currentColor: 'Поточний',
            newColor: 'Новий',
            presetColors: 'Готові кольори',
            userColors: 'Користувацькі кольори',
            paletteDefault: 'За замовчуванням',
            paletteCustom: 'Власні',
            copyColors: 'Копіювати колір',
            colorsCopied: 'Колір скопійовано в буфер обміну',
            copyClipboardError: 'Не вдалося записати в буфер обміну',
            pasteColors: 'Вставити колір',
            pasteClipboardError: 'Не вдалося прочитати буфер обміну',
            pasteInvalidJson: 'Буфер обміну не містить дійсний текст',
            pasteInvalidFormat: 'Очікується hex-значення кольору',
            colorsPasted: 'Колір успішно вставлено',
            resetUserColors: 'Очистити власні кольори',
            clearCustomColorsConfirm: 'Видалити всі власні кольори?',
            userColorSlot: 'Колір {slot}',
            recentColors: 'Останні кольори',
            clearRecentColors: 'Очистити останні кольори',
            removeRecentColor: 'Вилучити колір',
            removeColor: 'Вилучити колір',
            apply: 'Застосувати',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'Червоний',
                orange: 'Помаранчевий',
                amber: 'Бурштиновий',
                yellow: 'Жовтий',
                lime: 'Лаймовий',
                green: 'Зелений',
                emerald: 'Смарагдовий',
                teal: 'Бірюзовий',
                cyan: 'Блакитний',
                sky: 'Небесний',
                blue: 'Синій',
                indigo: 'Індиго',
                violet: 'Фіолетовий',
                purple: 'Пурпуровий',
                fuchsia: 'Фуксія',
                pink: 'Рожевий',
                rose: 'Троянда',
                gray: 'Сірий',
                slate: 'Сланцевий',
                stone: "Кам'яний"
            }
        },
        selectVaultProfile: {
            title: 'Вибрати профіль сховища',
            currentBadge: 'Активний',
            emptyState: 'Немає доступних профілів сховища.'
        },
        tagOperation: {
            renameTitle: 'Перейменувати тег {tag}',
            deleteTitle: 'Видалити тег {tag}',
            newTagPrompt: 'Нова назва тегу',
            newTagPlaceholder: 'Введіть нову назву тегу',
            renameWarning: 'Перейменування тегу {oldTag} змінить {count} {files}.',
            deleteWarning: 'Видалення тегу {tag} змінить {count} {files}.',
            modificationWarning: 'Це оновить дати зміни файлів.',
            affectedFiles: 'Зачеплені файли:',
            andMore: '...та ще {count}',
            confirmRename: 'Перейменувати тег',
            renameUnchanged: '{tag} не змінено',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            invalidTagName: 'Введіть дійсну назву тегу.',
            descendantRenameError: 'Неможливо перемістити тег у себе або в нащадка.',
            confirmDelete: 'Видалити тег',
            file: 'файл',
            files: 'файлів'
        },
        fileSystem: {
            newFolderTitle: 'Нова папка',
            renameFolderTitle: 'Перейменувати папку',
            renameFileTitle: 'Перейменувати файл',
            deleteFolderTitle: "Видалити '{name}'?",
            deleteFileTitle: "Видалити '{name}'?",
            folderNamePrompt: 'Введіть назву папки:',
            hideInOtherVaultProfiles: 'Сховати в інших профілях сховища',
            renamePrompt: 'Введіть нову назву:',
            renameVaultTitle: 'Змінити відображувану назву сховища',
            renameVaultPrompt: 'Введіть власну відображувану назву (залиште порожнім для використання за замовчуванням):',
            deleteFolderConfirm: 'Ви впевнені, що хочете видалити цю папку та весь її вміст?',
            deleteFileConfirm: 'Ви впевнені, що хочете видалити цей файл?',
            removeAllTagsTitle: 'Вилучити всі теги',
            removeAllTagsFromNote: 'Ви впевнені, що хочете вилучити всі теги з цієї нотатки?',
            removeAllTagsFromNotes: 'Ви впевнені, що хочете вилучити всі теги з {count} нотаток?'
        },
        folderNoteType: {
            title: 'Виберіть тип нотатки папки',
            folderLabel: 'Папка: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `Перемістити ${name} до папки...`,
            multipleFilesLabel: (count: number) => `${count} файлів`,
            navigatePlaceholder: 'Перейти до папки...',
            instructions: {
                navigate: 'для навігації',
                move: 'для переміщення',
                select: 'для вибору',
                dismiss: 'для закриття'
            }
        },
        homepage: {
            placeholder: 'Пошук файлів...',
            instructions: {
                navigate: 'для навігації',
                select: 'для встановлення домашньої сторінки',
                dismiss: 'для закриття'
            }
        },
        navigationBanner: {
            placeholder: 'Пошук зображень...',
            instructions: {
                navigate: 'для навігації',
                select: 'для встановлення банера',
                dismiss: 'для закриття'
            }
        },
        tagSuggest: {
            placeholder: 'Пошук тегів...',
            navigatePlaceholder: 'Перейти до тегу...',
            addPlaceholder: 'Знайти тег для додавання...',
            removePlaceholder: 'Виберіть тег для вилучення...',
            createNewTag: 'Створити новий тег: #{tag}',
            instructions: {
                navigate: 'для навігації',
                select: 'для вибору',
                dismiss: 'для закриття',
                add: 'для додавання тегу',
                remove: 'для вилучення тегу'
            }
        },
        welcome: {
            title: 'Ласкаво просимо до {pluginName}',
            introText:
                "Привіт! Перш ніж почати, наполегливо рекомендую переглянути перші п'ять хвилин відео нижче, щоб зрозуміти, як працюють панелі та перемикач «Показувати нотатки з підпапок».",
            continueText:
                "Якщо у вас є ще п'ять хвилин, продовжуйте перегляд відео, щоб зрозуміти компактні режими відображення та як правильно налаштувати закладки та важливі гарячі клавіші.",
            thanksText: 'Дуже дякую за завантаження, насолоджуйтесь!',
            videoAlt: 'Встановлення та освоєння Notebook Navigator',
            openVideoButton: 'Відтворити відео',
            closeButton: 'Подивлюсь пізніше'
        }
    },
    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Не вдалося створити папку: {error}',
            createFile: 'Не вдалося створити файл: {error}',
            renameFolder: 'Не вдалося перейменувати папку: {error}',
            renameFolderNoteConflict: 'Неможливо перейменувати: "{name}" вже існує в цій папці',
            renameFile: 'Не вдалося перейменувати файл: {error}',
            deleteFolder: 'Не вдалося видалити папку: {error}',
            deleteFile: 'Не вдалося видалити файл: {error}',
            duplicateNote: 'Не вдалося дублювати нотатку: {error}',
            createCanvas: 'Не вдалося створити полотно: {error}',
            createDatabase: 'Не вдалося створити базу даних: {error}',
            duplicateFolder: 'Не вдалося дублювати папку: {error}',
            openVersionHistory: 'Не вдалося відкрити історію версій: {error}',
            versionHistoryNotFound: 'Команда історії версій не знайдена. Переконайтеся, що Obsidian Sync увімкнено.',
            revealInExplorer: 'Не вдалося показати файл у провіднику системи: {error}',
            folderNoteAlreadyExists: 'Нотатка папки вже існує',
            folderAlreadyExists: 'Папка "{name}" вже існує',
            folderNotesDisabled: 'Увімкніть нотатки папок у налаштуваннях для конвертації файлів',
            folderNoteAlreadyLinked: 'Цей файл вже працює як нотатка папки',
            folderNoteNotFound: 'У вибраній папці немає нотатки папки',
            folderNoteUnsupportedExtension: 'Непідтримуване розширення файлу: {extension}',
            folderNoteMoveFailed: 'Не вдалося перемістити файл під час конвертації: {error}',
            folderNoteRenameConflict: 'Файл з назвою "{name}" вже існує в папці',
            folderNoteConversionFailed: 'Не вдалося конвертувати файл у нотатку папки',
            folderNoteConversionFailedWithReason: 'Не вдалося конвертувати файл у нотатку папки: {error}',
            folderNoteOpenFailed: 'Файл конвертовано, але не вдалося відкрити нотатку папки: {error}',
            failedToDeleteFile: 'Не вдалося видалити {name}: {error}',
            failedToDeleteMultipleFiles: 'Не вдалося видалити {count} файлів',
            versionHistoryNotAvailable: 'Сервіс історії версій недоступний',
            drawingAlreadyExists: 'Малюнок з такою назвою вже існує',
            failedToCreateDrawing: 'Не вдалося створити малюнок',
            noFolderSelected: 'У Notebook Navigator не вибрано папку',
            noFileSelected: 'Файл не вибрано'
        },
        warnings: {
            linkBreakingNameCharacters: "Це ім'я містить символи, які ламають посилання Obsidian: #, |, ^, %%, [[, ]].",
            forbiddenNameCharactersAllPlatforms: 'Імена не можуть починатися з крапки або містити : чи /.',
            forbiddenNameCharactersWindows: 'Зарезервовані в Windows символи не дозволені: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'Папку сховано: {name}',
            showFolder: 'Папку показано: {name}'
        },
        notifications: {
            deletedMultipleFiles: 'Видалено {count} файлів',
            movedMultipleFiles: 'Переміщено {count} файлів до {folder}',
            folderNoteConversionSuccess: 'Файл конвертовано в нотатку папки в "{name}"',
            folderMoved: 'Переміщено папку "{name}"',
            deepLinkCopied: 'URL Obsidian скопійовано в буфер обміну',
            pathCopied: 'Шлях скопійовано в буфер обміну',
            relativePathCopied: 'Відносний шлях скопійовано в буфер обміну',
            tagAddedToNote: 'Тег додано до 1 нотатки',
            tagAddedToNotes: 'Тег додано до {count} нотаток',
            tagRemovedFromNote: 'Тег вилучено з 1 нотатки',
            tagRemovedFromNotes: 'Тег вилучено з {count} нотаток',
            tagsClearedFromNote: 'Очищено всі теги з 1 нотатки',
            tagsClearedFromNotes: 'Очищено всі теги з {count} нотаток',
            noTagsToRemove: 'Немає тегів для вилучення',
            noFilesSelected: 'Файли не вибрано',
            tagOperationsNotAvailable: 'Операції з тегами недоступні',
            tagsRequireMarkdown: 'Теги підтримуються лише для Markdown нотаток',
            iconPackDownloaded: '{provider} завантажено',
            iconPackUpdated: '{provider} оновлено ({version})',
            iconPackRemoved: '{provider} вилучено',
            iconPackLoadFailed: 'Не вдалося завантажити {provider}',
            hiddenFileReveal: 'Файл прихований. Увімкніть "Показати приховані елементи" для відображення'
        },
        confirmations: {
            deleteMultipleFiles: 'Ви впевнені, що хочете видалити {count} файлів?',
            deleteConfirmation: 'Цю дію неможливо скасувати.'
        },
        defaultNames: {
            untitled: 'Без назви',
            untitledNumber: 'Без назви {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Неможливо перемістити папку в себе або підпапку.',
            itemAlreadyExists: 'Елемент з назвою "{name}" вже існує в цьому місці.',
            failedToMove: 'Не вдалося перемістити: {error}',
            failedToAddTag: 'Не вдалося додати тег "{tag}"',
            failedToClearTags: 'Не вдалося очистити теги',
            failedToMoveFolder: 'Не вдалося перемістити папку "{name}"',
            failedToImportFiles: 'Не вдалося імпортувати: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} файлів вже існує в місці призначення',
            addedTag: 'Тег "{tag}" додано до {count} файлів',
            filesAlreadyHaveTag: '{count} файлів вже мають цей тег або більш специфічний',
            clearedTags: 'Очищено всі теги з {count} файлів',
            noTagsToClear: 'Немає тегів для очищення',
            fileImported: 'Імпортовано 1 файл',
            filesImported: 'Імпортовано {count} файлів'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'Сьогодні',
        yesterday: 'Вчора',
        previous7Days: 'Попередні 7 днів',
        previous30Days: 'Попередні 30 днів'
    },

    // Weekdays
    weekdays: {
        sunday: 'Неділя',
        monday: 'Понеділок',
        tuesday: 'Вівторок',
        wednesday: 'Середа',
        thursday: 'Четвер',
        friday: "П'ятниця",
        saturday: 'Субота'
    },

    // Plugin commands
    commands: {
        open: 'Відкрити', // Command palette: Opens the Notebook Navigator view (English: Open)
        openHomepage: 'Відкрити домашню сторінку', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        revealFile: 'Показати файл', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Пошук', // Command palette: Toggle search in the file list (English: Search)
        toggleDualPane: 'Перемкнути подвійну панель', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        selectVaultProfile: 'Вибрати профіль сховища', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'Вибрати профіль сховища 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Вибрати профіль сховища 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Вибрати профіль сховища 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Видалити файли', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Створити нову нотатку', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Нова нотатка з шаблону', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Перемістити файли', // Command palette: Move selected files to another folder (English: Move files)
        selectNextFile: 'Вибрати наступний файл', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Вибрати попередній файл', // Command palette: Selects the previous file in the current view (English: Select previous file)
        convertToFolderNote: 'Конвертувати в нотатку папки', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Встановити як нотатку папки', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: "Від'єднати нотатку папки", // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Закріпити всі нотатки папок', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Перейти до папки', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Перейти до тегу', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        addShortcut: 'Додати до ярликів', // Command palette: Adds the current file, folder, or tag to shortcuts (English: Add to shortcuts)
        openShortcut: 'Відкрити ярлик {number}',
        toggleDescendants: 'Перемкнути нащадків', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Перемкнути приховані папки, теги та нотатки', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Перемкнути порядок сортування тегів', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        collapseExpand: 'Згорнути / розгорнути всі елементи', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        addTag: 'Додати тег до вибраних файлів', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        removeTag: 'Вилучити тег з вибраних файлів', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Вилучити всі теги з вибраних файлів', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        rebuildCache: 'Перебудувати кеш' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Показати в Notebook Navigator' // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Останнє змінення',
        createdAt: 'Створено',
        file: 'файл',
        files: 'файлів',
        folder: 'папка',
        folders: 'папок'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'Звіт про невдалі метадані експортовано до: {filename}',
            exportFailed: 'Не вдалося експортувати звіт метаданих'
        },
        sections: {
            general: 'Загальне',
            navigationPane: 'Панель навігації',
            icons: 'Пакети іконок',
            folders: 'Папки',
            foldersAndTags: 'Папки та теги',
            tags: 'Теги',
            search: 'Пошук',
            searchAndHotkeys: 'Пошук та гарячі клавіші',
            listPane: 'Панель списку',
            notes: 'Нотатки',
            hotkeys: 'Гарячі клавіші',
            advanced: 'Розширені'
        },
        groups: {
            general: {
                filtering: 'Фільтрація',
                behavior: 'Поведінка',
                view: 'Вигляд',
                icons: 'Іконки',
                desktopAppearance: "Вигляд на комп'ютері",
                formatting: 'Форматування'
            },
            navigation: {
                appearance: 'Вигляд',
                shortcutsAndRecent: 'Ярлики та нещодавні елементи'
            },
            list: {
                display: 'Вигляд',
                pinnedNotes: 'Закріплені нотатки',
                quickActions: 'Швидкі дії'
            },
            notes: {
                frontmatter: 'Frontmatter',
                icon: 'Іконка',
                title: 'Заголовок',
                previewText: 'Текст попереднього перегляду',
                featureImage: 'Зображення запису',
                tags: 'Теги',
                date: 'Дата',
                parentFolder: 'Батьківська папка'
            }
        },
        items: {
            searchProvider: {
                name: 'Постачальник пошуку',
                desc: 'Оберіть між швидким пошуком за назвою файлу або повнотекстовим пошуком з плагіном Omnisearch. (не синхронізується)',
                options: {
                    internal: 'Пошук з фільтрацією',
                    omnisearch: 'Omnisearch (повнотекстовий)'
                },
                info: {
                    filterSearch: {
                        title: 'Пошук з фільтрацією (за замовчуванням):',
                        description:
                            'Фільтрує файли за назвою та тегами в поточній папці та підпапках. Режим фільтра: змішаний текст і теги відповідають усім умовам (наприклад, "проект #робота"). Режим тегів: пошук лише за тегами підтримує оператори AND/OR (наприклад, "#робота AND #терміново", "#проект OR #особисте"). Cmd/Ctrl+Клік по тегах для додавання з AND, Cmd/Ctrl+Shift+Клік для додавання з OR. Підтримує виключення з префіксом ! (наприклад, !чернетка, !#архів) та пошук нотаток без тегів з !#.'
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            'Повнотекстовий пошук по всьому сховищу, який потім фільтрує результати, щоб показати лише файли з поточної папки, підпапок або вибраних тегів. Потребує встановлення плагіна Omnisearch - якщо недоступний, пошук автоматично переключиться на Пошук з фільтрацією.',
                        warningNotInstalled: 'Плагін Omnisearch не встановлено. Використовується Пошук з фільтрацією.',
                        limitations: {
                            title: 'Відомі обмеження:',
                            performance: 'Продуктивність: Може бути повільним, особливо при пошуку менше 3 символів у великих сховищах',
                            pathBug:
                                "Помилка шляху: Не може шукати в шляхах з не-ASCII символами та неправильно шукає в підшляхах, що впливає на те, які файли з'являються в результатах пошуку",
                            limitedResults:
                                "Обмежені результати: Оскільки Omnisearch шукає по всьому сховищу та повертає обмежену кількість результатів перед фільтрацією, відповідні файли з вашої поточної папки можуть не з'явитися, якщо занадто багато збігів існує в інших місцях сховища",
                            previewText:
                                "Текст попереднього перегляду: Попередні перегляди нотаток замінюються на уривки результатів Omnisearch, які можуть не показувати фактичне підсвічування збігу пошуку, якщо воно з'являється в іншому місці файлу"
                        }
                    }
                }
            },
            listPaneTitle: {
                name: "Заголовок панелі списку (лише комп'ютер)",
                desc: 'Виберіть, де показувати заголовок панелі списку.',
                options: {
                    header: 'Показувати в заголовку',
                    list: 'Показувати в панелі списку',
                    hidden: 'Не показувати'
                }
            },
            sortNotesBy: {
                name: 'Сортувати нотатки за',
                desc: 'Виберіть спосіб сортування нотаток у списку.',
                options: {
                    'modified-desc': 'Дата редагування (найновіші зверху)',
                    'modified-asc': 'Дата редагування (найстаріші зверху)',
                    'created-desc': 'Дата створення (найновіші зверху)',
                    'created-asc': 'Дата створення (найстаріші зверху)',
                    'title-asc': 'Заголовок (А зверху)',
                    'title-desc': 'Заголовок (Я зверху)'
                }
            },
            revealFileOnListChanges: {
                name: 'Прокручувати до вибраного файлу при змінах списку',
                desc: 'Прокручувати до вибраного файлу при закріпленні нотаток, показі нотаток нащадків, зміні вигляду папки або виконанні файлових операцій.'
            },
            includeDescendantNotes: {
                name: 'Показувати нотатки з підпапок / нащадків (не синхронізується)',
                desc: 'Включати нотатки з вкладених підпапок та нащадків тегів при перегляді папки або тегу.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Обмежити закріплені нотатки їх папкою',
                desc: "Закріплені нотатки з'являються лише при перегляді папки або тегу, де вони були закріплені."
            },
            separateNoteCounts: {
                name: 'Показувати поточні та нащадкові підрахунки окремо',
                desc: 'Відображати кількість нотаток у форматі "поточні ▾ нащадки" в папках і тегах.'
            },
            groupNotes: {
                name: 'Групувати нотатки',
                desc: 'Відображати заголовки між нотатками, згрупованими за датою або папкою. Перегляди тегів використовують групи за датою, коли увімкнено групування за папками.',
                options: {
                    none: 'Не групувати',
                    date: 'Групувати за датою',
                    folder: 'Групувати за папкою'
                }
            },
            showPinnedGroupHeader: {
                name: 'Показувати заголовок закріплених',
                desc: 'Відображати заголовок розділу закріплених над закріпленими нотатками.'
            },
            showPinnedIcon: {
                name: 'Показувати іконку закріплених',
                desc: 'Показувати іконку поряд із заголовком розділу закріплених.'
            },
            defaultListMode: {
                name: 'Режим списку за замовчуванням',
                desc: 'Виберіть макет списку за замовчуванням. Стандартний показує заголовок, дату, опис та текст попереднього перегляду. Компактний показує лише заголовок. Перевизначте вигляд для кожної папки.',
                options: {
                    standard: 'Стандартний',
                    compact: 'Компактний'
                }
            },
            showFileIcons: {
                name: 'Показувати іконки файлів',
                desc: 'Відображати іконки файлів з вирівнюванням ліворуч. Вимкнення видаляє як іконки, так і відступ. Пріоритет: користувацькі > назва файлу > тип файлу > за замовчуванням.'
            },
            showFilenameMatchIcons: {
                name: 'Іконки за назвою файлу',
                desc: 'Призначити іконки файлам на основі тексту в їхніх назвах.'
            },
            fileNameIconMap: {
                name: 'Зіставлення назв та іконок',
                desc: 'Файли, що містять текст, отримують вказану іконку. Одне зіставлення на рядок: текст=іконка',
                placeholder: '# текст=іконка\nзустріч=LiCalendar\nрахунок=PhReceipt',
                editTooltip: 'Редагувати зіставлення'
            },
            showCategoryIcons: {
                name: 'Іконки за типом файлу',
                desc: 'Призначити іконки файлам на основі їхнього розширення.'
            },
            fileTypeIconMap: {
                name: 'Зіставлення типів та іконок',
                desc: 'Файли з розширенням отримують вказану іконку. Одне зіставлення на рядок: розширення=іконка',
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: 'Редагувати зіставлення'
            },
            optimizeNoteHeight: {
                name: 'Змінна висота нотаток',
                desc: 'Використовувати компактну висоту для закріплених нотаток та нотаток без тексту попереднього перегляду.'
            },
            compactItemHeight: {
                name: 'Висота компактних елементів',
                desc: "Встановіть висоту елементів компактного списку на комп'ютері та мобільному.",
                resetTooltip: 'Відновити за замовчуванням (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Масштабувати текст з висотою компактних елементів',
                desc: 'Масштабувати текст компактного списку при зменшенні висоти елементів.'
            },
            showParentFolder: {
                name: 'Показувати батьківську папку',
                desc: 'Відображати назву батьківської папки для нотаток у підпапках або тегах.'
            },
            parentFolderClickRevealsFile: {
                name: 'Натискання на батьківську папку відкриває папку',
                desc: 'Натискання на мітку батьківської папки відкриває папку в панелі списку.'
            },
            showParentFolderColor: {
                name: 'Показувати колір батьківської папки',
                desc: 'Використовувати кольори папок на мітках батьківських папок.'
            },
            showQuickActions: {
                name: "Показувати швидкі дії (лише комп'ютер)",
                desc: "Показувати кнопки дій при наведенні на файли. Елементи керування кнопками вибирають, які дії з'являються."
            },
            dualPane: {
                name: 'Макет подвійної панелі (не синхронізується)',
                desc: "Показувати панель навігації та панель списку поруч на комп'ютері."
            },
            dualPaneOrientation: {
                name: 'Орієнтація подвійної панелі (не синхронізується)',
                desc: 'Виберіть горизонтальний або вертикальний макет при активній подвійній панелі.',
                options: {
                    horizontal: 'Горизонтальний поділ',
                    vertical: 'Вертикальний поділ'
                }
            },
            appearanceBackground: {
                name: 'Колір фону',
                desc: 'Виберіть кольори фону для панелей навігації та списку.',
                options: {
                    separate: 'Окремі фони',
                    primary: 'Використовувати фон списку',
                    secondary: 'Використовувати фон навігації'
                }
            },
            appearanceScale: {
                name: 'Рівень масштабування (не синхронізується)',
                desc: 'Керує загальним рівнем масштабування Notebook Navigator.'
            },
            startView: {
                name: 'Вигляд при запуску за замовчуванням',
                desc: 'Виберіть, яку панель відображати при відкритті Notebook Navigator. Панель навігації показує ярлики, останні нотатки та дерево папок. Панель списку одразу показує список нотаток.',
                options: {
                    navigation: 'Панель навігації',
                    files: 'Панель списку'
                }
            },
            toolbarButtons: {
                name: 'Кнопки панелі інструментів',
                desc: "Виберіть, які кнопки з'являються на панелі інструментів. Приховані кнопки залишаються доступними через команди та меню.",
                navigationLabel: 'Панель інструментів навігації',
                listLabel: 'Панель інструментів списку'
            },
            autoRevealActiveNote: {
                name: 'Автоматично показувати активну нотатку',
                desc: 'Автоматично показувати нотатки при відкритті з Швидкого перемикача, посилань або пошуку.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Ігнорувати події з правої бічної панелі',
                desc: 'Не змінювати активну нотатку при натисканні або зміні нотаток у правій бічній панелі.'
            },
            paneTransitionDuration: {
                name: 'Анімація однієї панелі',
                desc: 'Тривалість переходу при перемиканні панелей у режимі однієї панелі (мілісекунди).',
                resetTooltip: 'Скинути до стандартних'
            },
            autoSelectFirstFileOnFocusChange: {
                name: "Автоматично вибирати першу нотатку (лише комп'ютер)",
                desc: 'Автоматично відкривати першу нотатку при перемиканні папок або тегів.'
            },
            skipAutoScroll: {
                name: 'Вимкнути автопрокручування для ярликів',
                desc: 'Не прокручувати панель навігації при натисканні на елементи в ярликах.'
            },
            autoExpandFoldersTags: {
                name: 'Розгортати при виборі',
                desc: 'Розгортати папки та теги при виборі. У режимі однієї панелі перший вибір розгортає, другий показує файли.'
            },
            springLoadedFolders: {
                name: "Розгортати під час перетягування (лише комп'ютер)",
                desc: 'Розгортати папки й теги при наведенні під час перетягування.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Затримка першого розгортання',
                desc: 'Затримка перед розгортанням першої папки або тегу під час перетягування (секунди).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Затримка наступних розгортань',
                desc: 'Затримка перед розгортанням додаткових папок або тегів під час того ж перетягування (секунди).'
            },
            navigationBanner: {
                name: 'Банер навігації (профіль сховища)',
                desc: 'Відображати зображення над панеллю навігації. Змінюється з вибраним профілем сховища.',
                current: 'Поточний банер: {path}',
                chooseButton: 'Вибрати зображення'
            },
            showShortcuts: {
                name: 'Показувати ярлики',
                desc: 'Відображати розділ ярликів у панелі навігації.'
            },
            shortcutBadgeDisplay: {
                name: 'Значок ярлика',
                desc: "Що відображати біля ярликів. Використовуйте команди 'Відкрити ярлик 1-9' для прямого відкриття ярликів.",
                options: {
                    index: 'Позиція (1-9)',
                    count: 'Кількість елементів',
                    none: 'Немає'
                }
            },
            showRecentNotes: {
                name: 'Показувати останні нотатки',
                desc: 'Відображати розділ останніх нотаток у панелі навігації.'
            },
            recentNotesCount: {
                name: 'Кількість останніх нотаток',
                desc: 'Кількість останніх нотаток для відображення.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Закріпити останні нотатки разом з ярликами',
                desc: 'Включати останні нотатки при закріпленні ярликів.'
            },
            showTooltips: {
                name: 'Показувати підказки',
                desc: 'Відображати підказки при наведенні з додатковою інформацією для нотаток і папок.'
            },
            showTooltipPath: {
                name: 'Показувати шлях',
                desc: 'Відображати шлях папки під назвами нотаток у підказках.'
            },
            resetPaneSeparator: {
                name: 'Скинути позицію роздільника панелей',
                desc: 'Скинути перетягуваний роздільник між панеллю навігації та панеллю списку до позиції за замовчуванням.',
                buttonText: 'Скинути роздільник',
                notice: 'Позицію роздільника скинуто. Перезапустіть Obsidian або відкрийте Notebook Navigator знову для застосування.'
            },
            multiSelectModifier: {
                name: "Модифікатор множинного вибору (лише комп'ютер)",
                desc: 'Виберіть, яка клавіша-модифікатор перемикає множинний вибір. При виборі Option/Alt натискання Cmd/Ctrl відкриває нотатки в новій вкладці.',
                options: {
                    cmdCtrl: 'Натискання Cmd/Ctrl',
                    optionAlt: 'Натискання Option/Alt'
                }
            },
            fileVisibility: {
                name: 'Показувати типи файлів (профіль сховища)',
                desc: 'Фільтрувати, які типи файлів показуються в навігаторі. Типи файлів, не підтримувані Obsidian, можуть відкриватися в зовнішніх програмах.',
                options: {
                    documents: 'Документи (.md, .canvas, .base)',
                    supported: 'Підтримувані (відкриваються в Obsidian)',
                    all: 'Всі (можуть відкриватися зовні)'
                }
            },
            homepage: {
                name: 'Домашня сторінка',
                desc: 'Виберіть файл, який Notebook Navigator відкриває автоматично, наприклад панель керування.',
                current: 'Поточний: {path}',
                currentMobile: 'Мобільний: {path}',
                chooseButton: 'Вибрати файл',

                separateMobile: {
                    name: 'Окрема мобільна домашня сторінка',
                    desc: 'Використовувати іншу домашню сторінку для мобільних пристроїв.'
                }
            },
            excludedNotes: {
                name: 'Приховати нотатки (профіль сховища)',
                desc: 'Список властивостей frontmatter, розділених комами. Нотатки, що містять будь-яку з цих властивостей, будуть приховані (наприклад, чернетка, приватний, архів).',
                placeholder: 'чернетка, приватний'
            },
            excludedFileNamePatterns: {
                name: 'Приховати файли (профіль сховища)',
                desc: 'Список шаблонів імен файлів через кому для приховування. Підтримує символи підстановки * та шляхи / (наприклад, temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Профіль сховища',
                desc: 'Профілі зберігають видимість типів файлів, приховані файли, приховані папки, приховані теги, приховані нотатки, ярлики та банер навігації. Перемикайте профілі із заголовка панелі навігації.',
                defaultName: 'За замовчуванням',
                addButton: 'Додати профіль',
                editProfilesButton: 'Редагувати профілі',
                addProfileOption: 'Додати профіль...',
                applyButton: 'Застосувати',
                editButton: 'Редагувати профіль',
                deleteButton: 'Видалити профіль',
                addModalTitle: 'Додати профіль',
                editProfilesModalTitle: 'Редагувати профілі',
                editModalTitle: 'Редагувати профіль',
                addModalPlaceholder: 'Назва профілю',
                deleteModalTitle: 'Видалити {name}',
                deleteModalMessage:
                    'Видалити {name}? Фільтри прихованих файлів, папок, тегів та нотаток, збережені в цьому профілі, будуть видалені.',
                moveUp: 'Перемістити вгору',
                moveDown: 'Перемістити вниз',
                errors: {
                    emptyName: 'Введіть назву профілю',
                    duplicateName: 'Назва профілю вже існує'
                }
            },
            vaultTitle: {
                name: "Розташування назви сховища (лише для комп'ютера)",
                desc: 'Виберіть, де відображається назва сховища.',
                options: {
                    header: 'Показати в заголовку',
                    navigation: 'Показати на панелі навігації'
                }
            },
            excludedFolders: {
                name: 'Приховати папки (профіль сховища)',
                desc: 'Список папок для приховування, розділених комами. Шаблони назв: assets* (папки, що починаються з assets), *_temp (закінчуються на _temp). Шаблони шляхів: /archive (лише кореневий архів), /res* (кореневі папки, що починаються з res), /*/temp (папки temp на один рівень вглиб), /projects/* (всі папки всередині projects).',
                placeholder: 'шаблони, assets*, /архів, /res*'
            },
            showFileDate: {
                name: 'Показувати дату',
                desc: 'Відображати дату під назвами нотаток.'
            },
            alphabeticalDateMode: {
                name: 'При сортуванні за назвою',
                desc: 'Дата для показу при алфавітному сортуванні нотаток.',
                options: {
                    created: 'Дата створення',
                    modified: 'Дата зміни'
                }
            },
            showFileTags: {
                name: 'Показувати теги файлів',
                desc: 'Відображати клікабельні теги в елементах файлів.'
            },
            showFileTagAncestors: {
                name: 'Показувати повні шляхи тегів',
                desc: "Відображати повні шляхи ієрархії тегів. При увімкненні: 'ai/openai', 'робота/проекти/2024'. При вимкненні: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Розфарбовувати теги файлів',
                desc: 'Застосовувати кольори тегів до значків тегів на елементах файлів.'
            },
            prioritizeColoredFileTags: {
                name: 'Показувати кольорові теги першими',
                desc: 'Сортувати кольорові теги перед іншими тегами на елементах файлів.'
            },
            showFileTagsInCompactMode: {
                name: 'Показувати теги файлів у компактному режимі',
                desc: 'Відображати теги, коли дата, попередній перегляд та зображення приховані.'
            },
            dateFormat: {
                name: 'Формат дати',
                desc: 'Формат для відображення дат (використовує формат date-fns).',
                placeholder: 'd MMM yyyy',
                help: 'Поширені формати:\nd MMM yyyy = 25 тра 2022\ndd/MM/yyyy = 25/05/2022\nyyyy-MM-dd = 2022-05-25\n\nТокени:\nyyyy/yy = рік\nMMMM/MMM/MM = місяць\ndd/d = день\nEEEE/EEE = день тижня',
                helpTooltip: 'Натисніть для довідки по форматах'
            },
            timeFormat: {
                name: 'Формат часу',
                desc: 'Формат для відображення часу (використовує формат date-fns).',
                placeholder: 'HH:mm',
                help: 'Поширені формати:\nh:mm a = 2:30 PM (12-годинний)\nHH:mm = 14:30 (24-годинний)\nh:mm:ss a = 2:30:45 PM\nHH:mm:ss = 14:30:45\n\nТокени:\nHH/H = 24-годинний\nhh/h = 12-годинний\nmm = хвилини\nss = секунди\na = AM/PM',
                helpTooltip: 'Натисніть для довідки по форматах'
            },
            showFilePreview: {
                name: 'Показувати попередній перегляд нотатки',
                desc: 'Відображати текст попереднього перегляду під назвами нотаток.'
            },
            skipHeadingsInPreview: {
                name: 'Пропускати заголовки в попередньому перегляді',
                desc: 'Пропускати рядки заголовків при генерації тексту попереднього перегляду.'
            },
            skipCodeBlocksInPreview: {
                name: 'Пропускати блоки коду в попередньому перегляді',
                desc: 'Пропускати блоки коду при генерації тексту попереднього перегляду.'
            },
            stripHtmlInPreview: {
                name: 'Видаляти HTML у попередньому перегляді',
                desc: 'Видаляти HTML-теги з тексту попереднього перегляду. Може впливати на продуктивність у великих нотатках.'
            },
            previewProperties: {
                name: 'Властивості попереднього перегляду',
                desc: 'Список властивостей frontmatter для перевірки на текст попереднього перегляду, розділених комами. Буде використано першу властивість з текстом.',
                placeholder: 'підсумок, опис, анотація',
                info: 'Якщо текст попереднього перегляду не знайдено у вказаних властивостях, попередній перегляд буде згенеровано з вмісту нотатки.'
            },
            previewRows: {
                name: 'Рядки попереднього перегляду',
                desc: 'Кількість рядків для відображення тексту попереднього перегляду.',
                options: {
                    '1': '1 рядок',
                    '2': '2 рядки',
                    '3': '3 рядки',
                    '4': '4 рядки',
                    '5': '5 рядків'
                }
            },
            fileNameRows: {
                name: 'Рядки заголовка',
                desc: 'Кількість рядків для відображення заголовків нотаток.',
                options: {
                    '1': '1 рядок',
                    '2': '2 рядки'
                }
            },
            showFeatureImage: {
                name: 'Показувати головне зображення',
                desc: 'Відображає мініатюру першого зображення у нотатці.'
            },
            forceSquareFeatureImage: {
                name: 'Примусово квадратне головне зображення',
                desc: 'Відображати головні зображення як квадратні мініатюри.'
            },
            featureImageProperties: {
                name: 'Властивості зображення',
                desc: 'Список властивостей frontmatter для перевірки на мініатюри, розділених комами.',
                placeholder: 'мініатюра, featureResized, feature'
            },

            downloadExternalFeatureImages: {
                name: 'Завантажувати зовнішні зображення',
                desc: 'Завантажувати віддалені зображення та мініатюри YouTube для обкладинок.'
            },
            showRootFolder: {
                name: 'Показувати кореневу папку',
                desc: 'Відображати назву сховища як кореневу папку в дереві.'
            },
            showFolderIcons: {
                name: 'Показувати іконки папок',
                desc: 'Відображати іконки поряд з папками в панелі навігації.'
            },
            inheritFolderColors: {
                name: 'Успадковувати кольори папок',
                desc: 'Дочірні папки успадковують колір від батьківських папок.'
            },
            showNoteCount: {
                name: 'Показувати кількість нотаток',
                desc: 'Відображати кількість нотаток поряд з кожною папкою та тегом.'
            },
            showSectionIcons: {
                name: 'Показувати іконки для ярликів та останніх елементів',
                desc: 'Відображати іконки для розділів навігації, таких як Ярлики та Останні файли.'
            },
            interfaceIcons: {
                name: 'Іконки інтерфейсу',
                desc: 'Редагувати іконки панелі інструментів, папок, тегів, закріплених, пошуку та сортування.',
                buttonText: 'Редагувати іконки'
            },
            showIconsColorOnly: {
                name: 'Застосовувати колір лише до іконок',
                desc: 'При увімкненні користувацькі кольори застосовуються лише до іконок. При вимкненні кольори застосовуються як до іконок, так і до текстових міток.'
            },
            collapseBehavior: {
                name: 'Згортати елементи',
                desc: 'Виберіть, на що впливає кнопка розгортання/згортання всього.',
                options: {
                    all: 'Всі папки та теги',
                    foldersOnly: 'Лише папки',
                    tagsOnly: 'Лише теги'
                }
            },
            smartCollapse: {
                name: 'Тримати вибраний елемент розгорнутим',
                desc: 'При згортанні тримати поточно вибрану папку або тег та їх батьків розгорнутими.'
            },
            navIndent: {
                name: 'Відступ дерева',
                desc: 'Налаштувати ширину відступу для вкладених папок і тегів.'
            },
            navItemHeight: {
                name: 'Висота елемента',
                desc: 'Налаштувати висоту папок і тегів у панелі навігації.'
            },
            navItemHeightScaleText: {
                name: 'Масштабувати текст з висотою елемента',
                desc: 'Зменшувати розмір тексту навігації при зменшенні висоти елемента.'
            },
            navRootSpacing: {
                name: 'Відступ кореневих елементів',
                desc: 'Відстань між папками та тегами кореневого рівня.'
            },
            showTags: {
                name: 'Показувати теги',
                desc: 'Відображати розділ тегів в навігаторі.'
            },
            showTagIcons: {
                name: 'Показувати іконки тегів',
                desc: 'Відображати іконки поряд з тегами в панелі навігації.'
            },
            inheritTagColors: {
                name: 'Успадковувати кольори тегів',
                desc: 'Дочірні теги успадковують колір від батьківських тегів.'
            },
            tagSortOrder: {
                name: 'Порядок сортування тегів',
                desc: 'Виберіть, як впорядковуються теги в панелі навігації. (не синхронізується)',
                options: {
                    alphaAsc: 'Від А до Я',
                    alphaDesc: 'Від Я до А',
                    frequencyAsc: 'За частотою (від низької до високої)',
                    frequencyDesc: 'За частотою (від високої до низької)'
                }
            },
            showAllTagsFolder: {
                name: 'Показувати папку тегів',
                desc: 'Відображати "Теги" як згортувану папку.'
            },
            showUntagged: {
                name: 'Показувати нотатки без тегів',
                desc: 'Відображати елемент "Без тегів" для нотаток без жодних тегів.'
            },
            keepEmptyTagsProperty: {
                name: 'Зберігати властивість tags після видалення останнього тегу',
                desc: 'Зберігати властивість tags у frontmatter, коли всі теги видалено. При вимкненні властивість tags видаляється з frontmatter.'
            },
            hiddenTags: {
                name: 'Приховати теги (профіль сховища)',
                desc: 'Список шаблонів тегів, розділених комами. Шаблони назв: тег* (починається з), *тег (закінчується на). Шаблони шляхів: архів (тег і нащадки), архів/* (лише нащадки), проекти/*/чернетки (символ підстановки посередині).',
                placeholder: 'архів*, *чернетка, проекти/*/старі'
            },
            enableFolderNotes: {
                name: 'Увімкнути нотатки папок',
                desc: "При увімкненні папки з пов'язаними нотатками відображаються як клікабельні посилання."
            },
            folderNoteType: {
                name: 'Тип нотатки папки за замовчуванням',
                desc: 'Тип нотатки папки, створеної з контекстного меню.',
                options: {
                    ask: 'Запитувати при створенні',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'Назва нотатки папки',
                desc: 'Назва нотатки папки без розширення. Залиште порожнім для використання тієї ж назви, що й у папки.',
                placeholder: 'index'
            },
            folderNoteProperties: {
                name: 'Властивості нотатки папки',
                desc: 'YAML frontmatter, що додається до нових нотаток папок. Маркери --- додаються автоматично.',
                placeholder: 'тема: темна\nnотатка_папки: true'
            },
            hideFolderNoteInList: {
                name: 'Приховувати нотатку папки в списку',
                desc: 'Приховувати нотатку папки від появи в списку нотаток папки.'
            },
            pinCreatedFolderNote: {
                name: 'Закріплювати створені нотатки папок',
                desc: 'Автоматично закріплювати нотатки папок при створенні з контекстного меню.'
            },
            confirmBeforeDelete: {
                name: 'Підтверджувати перед видаленням',
                desc: 'Показувати діалог підтвердження при видаленні нотаток або папок'
            },
            interceptTagClicks: {
                name: 'Переходити до тегів при кліку',
                desc: 'При кліку на теги в нотатках переходити до цього тегу в Notebook Navigator замість запуску пошуку Obsidian.'
            },
            metadataCleanup: {
                name: 'Очистити метадані',
                desc: 'Видаляє осиротілі метадані, залишені після видалення, переміщення або перейменування файлів, папок або тегів поза Obsidian. Це впливає лише на файл налаштувань Notebook Navigator.',
                buttonText: 'Очистити метадані',
                error: 'Очищення налаштувань не вдалося',
                loading: 'Перевірка метаданих...',
                statusClean: 'Немає метаданих для очищення',
                statusCounts:
                    'Осиротілі елементи: {folders} папок, {tags} тегів, {files} файлів, {pinned} закріплень, {separators} роздільників'
            },
            rebuildCache: {
                name: 'Перебудувати кеш',
                desc: 'Використовуйте, якщо у вас зникають теги, неправильні попередні перегляди або відсутні головні зображення. Це може статися після конфліктів синхронізації або неочікуваних закриттів.',
                buttonText: 'Перебудувати кеш',
                success: 'Кеш перебудовано',
                error: 'Не вдалося перебудувати кеш',
                indexingTitle: 'Індексація сховища...',
                progress: 'Оновлення кешу Notebook Navigator.'
            },
            hotkeys: {
                intro: 'Редагуйте <plugin folder>/notebook-navigator/data.json для налаштування гарячих клавіш Notebook Navigator. Відкрийте файл і знайдіть розділ "keyboardShortcuts". Кожен запис використовує таку структуру:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Shift',
                    '"Ctrl" = Control (віддавайте перевагу "Mod" для кросплатформенності)'
                ],
                guidance:
                    'Додайте кілька прив\'язок для підтримки альтернативних клавіш, як показано вище для ArrowUp та K. Комбінуйте модифікатори в одному записі, перераховуючи кожне значення, наприклад "modifiers": ["Mod", "Shift"]. Послідовності клавіатури, такі як "gg" або "dd", не підтримуються. Перезавантажте Obsidian після редагування файлу.'
            },
            externalIcons: {
                downloadButton: 'Завантажити',
                downloadingLabel: 'Завантаження...',
                removeButton: 'Вилучити',
                statusInstalled: 'Завантажено (версія {version})',
                statusNotInstalled: 'Не завантажено',
                versionUnknown: 'невідомо',
                downloadFailed: "Не вдалося завантажити {name}. Перевірте з'єднання та спробуйте знову.",
                removeFailed: 'Не вдалося вилучити {name}.',
                infoNote:
                    'Завантажені пакети іконок синхронізують стан встановлення між пристроями. Пакети іконок залишаються в локальній базі даних на кожному пристрої; синхронізація лише відстежує, чи завантажувати або вилучати їх. Пакети іконок завантажуються з репозиторію Notebook Navigator (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterDates: {
                name: 'Використовувати метадані frontmatter',
                desc: 'Використовувати frontmatter для назви нотатки, часових міток, іконок та кольорів'
            },
            frontmatterIconField: {
                name: 'Поле іконки',
                desc: 'Поле frontmatter для іконок файлів. Залиште порожнім для використання іконок, збережених у налаштуваннях.',
                placeholder: 'іконка'
            },
            frontmatterColorField: {
                name: 'Поле кольору',
                desc: 'Поле frontmatter для кольорів файлів. Залиште порожнім для використання кольорів, збережених у налаштуваннях.',
                placeholder: 'колір'
            },
            frontmatterSaveMetadata: {
                name: 'Зберігати іконки та кольори у frontmatter',
                desc: 'Автоматично записувати іконки та кольори файлів у frontmatter, використовуючи налаштовані вище поля.'
            },
            frontmatterMigration: {
                name: 'Перенести іконки та кольори з налаштувань',
                desc: 'Збережено в налаштуваннях: {icons} іконок, {colors} кольорів.',
                button: 'Перенести',
                buttonWorking: 'Перенесення...',
                noticeNone: 'Немає іконок або кольорів файлів, збережених у налаштуваннях.',
                noticeDone: 'Перенесено {migratedIcons}/{icons} іконок, {migratedColors}/{colors} кольорів.',
                noticeFailures: 'Невдалі записи: {failures}.',
                noticeError: 'Перенесення не вдалося. Перевірте консоль для деталей.'
            },
            frontmatterNameField: {
                name: 'Поля назви',
                desc: 'Список полів frontmatter через кому. Використовується перше непорожнє значення. Повертається до назви файлу.',
                placeholder: 'заголовок, назва'
            },
            frontmatterCreatedField: {
                name: 'Поле часової мітки створення',
                desc: 'Назва поля frontmatter для часової мітки створення. Залиште порожнім для використання лише дати файлової системи.',
                placeholder: 'створено'
            },
            frontmatterModifiedField: {
                name: 'Поле часової мітки зміни',
                desc: 'Назва поля frontmatter для часової мітки зміни. Залиште порожнім для використання лише дати файлової системи.',
                placeholder: 'змінено'
            },
            frontmatterDateFormat: {
                name: 'Формат часової мітки',
                desc: 'Формат для розбору часових міток у frontmatter. Залиште порожнім для використання формату ISO 8601',
                helpTooltip: 'Див. документацію формату date-fns',
                help: "Поширені формати:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'Підтримати розробку',
                desc: 'Якщо вам подобається використовувати Notebook Navigator, будь ласка, розгляньте можливість підтримки його подальшої розробки.',
                buttonText: '❤️ Спонсорувати',
                coffeeButton: '☕️ Купити мені каву'
            },
            updateCheckOnStart: {
                name: 'Перевіряти нову версію при запуску',
                desc: 'Перевіряє нові релізи плагіна при запуску та показує сповіщення, коли доступне оновлення. Кожна версія оголошується лише один раз, і перевірки відбуваються не частіше одного разу на день.',
                status: 'Доступна нова версія: {version}'
            },
            whatsNew: {
                name: 'Що нового в Notebook Navigator {version}',
                desc: 'Перегляньте останні оновлення та покращення',
                buttonText: 'Переглянути останні оновлення'
            },
            masteringVideo: {
                name: 'Опанування Notebook Navigator (відео)',
                desc: 'Це відео охоплює все, що потрібно для продуктивної роботи з Notebook Navigator, включаючи гарячі клавіші, пошук, теги та розширене налаштування.'
            },
            cacheStatistics: {
                localCache: 'Локальний кеш',
                items: 'елементів',
                withTags: 'з тегами',
                withPreviewText: 'з текстом попереднього перегляду',
                withFeatureImage: 'з головним зображенням',
                withMetadata: 'з метаданими'
            },
            metadataInfo: {
                successfullyParsed: 'Успішно розібрано',
                itemsWithName: 'елементів з назвою',
                withCreatedDate: 'з датою створення',
                withModifiedDate: 'з датою зміни',
                withIcon: 'з іконкою',
                withColor: 'з кольором',
                failedToParse: 'Не вдалося розібрати',
                createdDates: 'дат створення',
                modifiedDates: 'дат зміни',
                checkTimestampFormat: 'Перевірте формат часової мітки.',
                exportFailed: 'Експортувати помилки'
            }
        }
    },
    whatsNew: {
        title: 'Що нового в Notebook Navigator',
        supportMessage: 'Якщо Notebook Navigator корисний для вас, будь ласка, розгляньте можливість підтримки його розробки.',
        supportButton: 'Купити мені каву',
        thanksButton: 'Дякую!'
    }
};
