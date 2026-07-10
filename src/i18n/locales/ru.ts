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
        restoreDefault: 'Восстановить по умолчанию', // Button text for restoring values to defaults (English: Restore default)
        submit: 'Отправить', // Button text for submitting forms and dialogs (English: Submit)
        save: 'Сохранить', // Button text for saving settings and dialogs (English: Save)
        configure: 'Настроить', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'Светлый режим', // Label for light theme mode (English: Light mode)
        darkMode: 'Тёмный режим', // Label for dark theme mode (English: Dark mode)
        noSelection: 'Ничего не выбрано', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Без тегов', // Label for notes without any tags (English: Untagged)
        featureImageAlt: 'Изображение', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Неизвестная ошибка', // Generic fallback when an error has no message (English: Unknown error)
        clipboardWriteError: 'Не удалось записать в буфер обмена',
        updateBannerTitle: 'Доступно обновление Notebook Navigator',
        updateBannerInstruction: 'Обновите в Настройки -> Сторонние плагины',
        previous: 'Назад', // Generic aria label for previous navigation (English: Previous)
        next: 'Вперёд' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Выберите папку или тег для просмотра заметок', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Нет заметок', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Закреплённые', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Заметки', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Файлы', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (скрыто)', // Accessibility label applied to list items that are normally hidden
        collapseGroup: 'Свернуть группу',
        expandGroup: 'Развернуть группу',
        manualSortTitle: 'Ручная сортировка: {property}',
        manualSortHint: 'Перетащите для изменения порядка. Порядок сохраняется как числовые значения индекса в свойстве «{property}».',
        manualSortNonMarkdownHint: 'Файлы, отличные от Markdown, показаны внизу и их порядок изменить нельзя.',
        unsortedSection: 'Без сортировки',
        manualSortDone: 'Готово',
        manualSortMultipleWriteFailure: '{count} файлов не удалось обработать; первый: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Без тегов', // Label for the special item showing notes without tags (English: Untagged)
        tags: 'Теги' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Ярлыки', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentFilesHeader: 'Недавние файлы', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Свойства',
        reorderRootFoldersTitle: 'Изменить порядок навигации',
        reorderRootFoldersHint: 'Используйте стрелки или перетаскивание',
        vaultRootLabel: 'Хранилище',
        resetRootToAlpha: 'Сбросить в алфавитный порядок',
        resetRootToFrequency: 'Сбросить по частоте',
        pinShortcuts: 'Закрепить ярлыки',
        pinShortcutsAndRecentFiles: 'Закрепить ярлыки и недавние файлы',
        unpinShortcuts: 'Открепить ярлыки',
        unpinShortcutsAndRecentFiles: 'Открепить ярлыки и недавние файлы',
        profileMenuAria: 'Сменить профиль хранилища'
    },

    navigationCalendar: {
        ariaLabel: 'Календарь',
        dailyNotesNotEnabled: 'Плагин ежедневных заметок не включён.',
        createDailyNote: {
            title: 'Новая ежедневная заметка',
            message: 'Файл {filename} не существует. Хотите создать его?',
            confirmButton: 'Создать'
        },
        helpModal: {
            title: 'Горячие клавиши календаря',
            items: [
                'Нажмите на любой день, чтобы открыть или создать ежедневную заметку. Недели, месяцы, кварталы и годы работают таким же образом.',
                'Закрашенная точка под днём означает наличие заметки. Пустая точка означает наличие незавершённых задач.',
                'Если у заметки есть изображение-обложка, оно отображается как фон дня.'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+клик по дате для фильтрации по этой дате в списке файлов.',
            dateFilterOptionAlt: '`Option/Alt`+клик по дате для фильтрации по этой дате в списке файлов.'
        }
    },

    dailyNotes: {
        templateReadFailed: 'Не удалось прочитать шаблон ежедневной заметки.',
        createFailed: 'Невозможно создать ежедневную заметку.'
    },

    shortcuts: {
        folderExists: 'Папка уже в ярлыках',
        noteExists: 'Заметка уже в ярлыках',
        tagExists: 'Тег уже в ярлыках',
        propertyExists: 'Свойство уже в закладках',
        invalidProperty: 'Недопустимая закладка свойства',
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
        showCalendar: 'Показать календарь',
        hideCalendar: 'Скрыть календарь',
        newFolder: 'Новая папка', // Tooltip for create new folder button (English: New folder)
        newNote: 'Новая заметка', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Назад к навигации', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeChildSortOrder: 'Изменить сортировку',
        changeSortAndGroup: 'Изменить сортировку и группировку',
        resetViewToDefaults: 'Сбросить вид к настройкам по умолчанию',
        manualSort: 'Ручная сортировка',
        editSortOrder: 'Изменить порядок сортировки...',
        removeSortProperty: 'Удалить свойство сортировки',
        descendants: 'потомков',
        subfolders: 'подпапок',
        subtags: 'подтегов',
        childValues: 'дочерних значений',
        applySortAndGroupToDescendants: (target: string) => `Применить сортировку и группировку для ${target}`,
        applyAppearanceToDescendants: (target: string) => `Применить оформление для ${target}`,
        showFolders: 'Показать навигацию', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: 'Изменить порядок навигации',
        finishRootFolderReorder: 'Готово',
        showExcludedItems: 'Показать скрытые папки, теги и заметки', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Скрыть скрытые папки, теги и заметки', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Показать двойную панель', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Показать одну панель', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            'Две панели недоступны, когда боковая панель слишком узкая. Чтобы изменить это, установите «Когда боковая панель слишком узкая» в значение «Ничего не делать» в Настройки > Внешний вид и поведение.',
        changeAppearance: 'Изменить внешний вид', // Tooltip for button to change folder appearance settings (English: Change appearance)
        showNotesFromSubfolders: 'Показать заметки из подпапок',
        showFilesFromSubfolders: 'Показать файлы из подпапок',
        showNotesFromDescendants: 'Показать заметки из потомков',
        showFilesFromDescendants: 'Показать файлы из потомков',
        search: 'Поиск' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Поиск...', // Placeholder text for search input (English: Search...)
        placeholderVault: 'Поиск в хранилище...',
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Очистить поиск', // Tooltip for clear search button (English: Clear search)
        switchToFilterSearch: 'Переключить на поиск с фильтром',
        switchToOmnisearch: 'Переключить на Omnisearch',
        saveSearchShortcut: 'Сохранить ярлык поиска',
        removeSearchShortcut: 'Удалить ярлык поиска',
        shortcutModalTitle: 'Сохранить ярлык поиска',
        shortcutNamePlaceholder: 'Введите название ярлыка',
        shortcutStartIn: 'Всегда начинать в: {path}',
        searchHelp: 'Синтаксис поиска',
        searchHelpTitle: 'Синтаксис поиска',
        searchHelpModal: {
            intro: 'Комбинируйте имена файлов, свойства, теги, даты и фильтры в одном запросе (напр. `meeting .status=active #work @thisweek`). Установите плагин Omnisearch для полнотекстового поиска.',
            introSwitching:
                'Переключайтесь между поиском по фильтру и Omnisearch с помощью клавиш стрелок вверх/вниз или нажав на значок поиска.',
            sections: {
                fileNames: {
                    title: 'Имена файлов',
                    items: [
                        '`word` Найти заметки со словом "word" в имени файла.',
                        '`word1 word2` Каждое слово должно соответствовать имени файла.',
                        '`-word` Исключить заметки со словом "word" в имени файла.'
                    ]
                },
                tags: {
                    title: 'Теги',
                    items: [
                        '`#tag` Включить заметки с тегом (также находит вложенные теги как `#tag/subtag`).',
                        '`#` Включить только заметки с тегами.',
                        '`-#tag` Исключить заметки с тегом.',
                        '`-#` Включить только заметки без тегов.',
                        '`#tag1 #tag2` Найти оба тега (неявное AND).',
                        '`#tag1 AND #tag2` Найти оба тега (явное AND).',
                        '`#tag1 OR #tag2` Найти любой из тегов.',
                        '`#a OR #b AND #c` AND имеет больший приоритет: находит `#a`, или оба `#b` и `#c`.',
                        'Cmd/Ctrl+Клик по тегу для добавления с AND. Cmd/Ctrl+Shift+Клик для добавления с OR.'
                    ]
                },
                properties: {
                    title: 'Свойства',
                    items: [
                        '`.key` Включить заметки с ключом свойства.',
                        '`.key=value` Включить заметки, у которых значение свойства содержит `value`.',
                        '`."Reading Status"` Включить заметки с ключом свойства, содержащим пробелы.',
                        '`."Reading Status"="In Progress"` Ключи и значения с пробелами должны быть заключены в двойные кавычки.',
                        '`-.key` Исключить заметки с ключом свойства.',
                        '`-.key=value` Исключить заметки, у которых значение свойства содержит `value`.',
                        'Cmd/Ctrl+Клик по свойству для добавления с AND. Cmd/Ctrl+Shift+Клик для добавления с OR.'
                    ]
                },
                tasks: {
                    title: 'Фильтры',
                    items: [
                        '`has:task` Включить заметки с незавершёнными задачами.',
                        '`-has:task` Исключить заметки с незавершёнными задачами.',
                        '`folder:meetings` Включить заметки, где имя папки содержит `meetings`.',
                        '`folder:/work/meetings` Включить заметки только в `work/meetings` (не подпапки).',
                        '`folder:/` Включить заметки только в корне хранилища.',
                        '`-folder:archive` Исключить заметки, где имя папки содержит `archive`.',
                        '`-folder:/archive` Исключить заметки только в `archive` (не подпапки).',
                        '`ext:md` Включить заметки с расширением `md` (`ext:.md` также поддерживается).',
                        '`-ext:pdf` Исключить заметки с расширением `pdf`.',
                        'Комбинируйте с тегами, именами и датами (например: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'Поведение AND/OR',
                    items: [
                        '`AND` и `OR` являются операторами только в запросах, состоящих исключительно из тегов и свойств.',
                        'Запросы только с тегами и свойствами содержат только фильтры тегов и свойств: `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`.',
                        'Если запрос включает имена, даты (`@...`), фильтры задач (`has:task`), фильтры папок (`folder:...`) или фильтры расширений (`ext:...`), `AND` и `OR` ищутся как слова.',
                        'Пример запроса с операторами: `#work OR .status=started`.',
                        'Пример смешанного запроса: `#work OR ext:md` (`OR` ищется в именах файлов).'
                    ]
                },
                dates: {
                    title: 'Даты',
                    items: [
                        '`@today` Найти заметки за сегодня, используя поле даты по умолчанию.',
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` Относительные диапазоны дат.',
                        '`@2026-02-07` Найти конкретный день (также поддерживает `@20260207`).',
                        '`@2026` Найти календарный год.',
                        '`@2026-02` или `@202602` Найти календарный месяц.',
                        '`@2026-W05` или `@2026W05` Найти ISO-неделю.',
                        '`@2026-Q2` или `@2026Q2` Найти календарный квартал.',
                        '`@13/02/2026` Числовые форматы с разделителями (`@07022026` следует вашей локали при неоднозначности).',
                        '`@2026-02-01..2026-02-07` Найти включительный диапазон дней (открытые концы поддерживаются).',
                        '`@c:...` или `@m:...` Указать дату создания или изменения.',
                        '`-@...` Исключить совпадение даты.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'Полнотекстовый поиск по всему хранилищу с фильтрацией по текущей папке или выбранным тегам.',
                        'Может быть медленным при менее чем 3 символах в больших хранилищах.',
                        'Не может искать пути с не-ASCII символами или корректно искать подпути.',
                        'Возвращает ограниченные результаты до фильтрации по папкам, поэтому релевантные файлы могут не отобразиться, если много совпадений в других местах.',
                        'Превью заметок показывают фрагменты Omnisearch вместо текста превью по умолчанию.'
                    ]
                }
            }
        }
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
            openInDefaultApp: 'Открыть в приложении по умолчанию',
            renameNote: 'Переименовать заметку',
            renameFile: 'Переименовать файл',
            deleteNote: 'Удалить заметку',
            deleteFile: 'Удалить файл',
            setCalendarHighlight: 'Установить выделение',
            removeCalendarHighlight: 'Убрать выделение',
            deleteMultipleNotes: 'Удалить {count} заметок',
            deleteMultipleFiles: 'Удалить {count} файлов',
            moveNoteToFolder: 'Переместить заметку в...',
            moveFileToFolder: 'Переместить файл в...',
            moveMultipleNotesToFolder: 'Переместить {count} заметок в...',
            moveMultipleFilesToFolder: 'Переместить {count} файлов в...',
            mergeNotes: 'Объединить {count} заметок...',
            mergeNotesInGroup: 'Объединить заметки в группе...',
            setManualSortGroupHeader: 'Задать заголовок группы',
            changeManualSortGroupHeader: 'Изменить заголовок группы',
            manualSortGroupHeader: {
                title: 'Заголовок группы',
                copyStyle: 'Копировать стиль заголовка',
                pasteStyle: 'Вставить стиль заголовка',
                remove: 'Удалить заголовок группы'
            },
            addTag: 'Добавить тег',
            addPropertyKey: 'Задать свойство',
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
            createFolderNote: 'Создать заметку папки',
            detachFolderNote: 'Отвязать заметку папки',
            deleteFolderNote: 'Удалить заметку папки',
            changeIcon: 'Изменить иконку',
            changeColor: 'Изменить цвет',
            changeBackground: 'Изменить фон',
            excludeFolder: 'Скрыть папку',
            unhideFolder: 'Показать папку',
            excludeFromDescendants: 'Скрыть в родительских папках',
            includeInDescendants: 'Показать в родительских папках',
            hiddenFromParentsIndicator: 'Скрыто из списков родительских папок',
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
        property: {
            addKey: 'Настроить ключи свойств',
            renameKey: 'Переименовать свойство',
            deleteKey: 'Удалить свойство'
        },
        navigation: {
            addSeparator: 'Добавить разделитель',
            removeSeparator: 'Удалить разделитель'
        },
        copyPath: {
            title: 'Копировать путь',
            asObsidianUrl: 'как URL Obsidian',
            fromVaultFolder: 'из папки хранилища',
            fromSystemRoot: 'из корня системы'
        },
        style: {
            title: 'Стиль',
            copy: 'Копировать стиль',
            paste: 'Вставить стиль',
            removeIcon: 'Удалить иконку',
            removeColor: 'Удалить цвет',
            removeBackground: 'Удалить фон',
            clear: 'Очистить стиль'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        appearance: 'Внешний вид',
        sortBy: 'Сортировать по',
        standardPreset: 'Стандартный',
        compactPreset: 'Компактный',
        defaultSuffix: '(по умолчанию)',
        defaultLabel: 'По умолчанию',
        titleRows: 'Строки заголовка',
        previewRows: 'Строки превью',
        groupBy: 'Группировать по',
        titleRowOption: (rows: number) => `${rows} ${rows === 1 ? 'строка' : rows < 5 ? 'строки' : 'строк'} заголовка`,
        previewRowOption: (rows: number) => `${rows} ${rows === 1 ? 'строка' : rows < 5 ? 'строки' : 'строк'} превью`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Применить',
            applySortAndGroupTitle: (target: string) => `Применить сортировку и группировку для ${target}?`,
            applyAppearanceTitle: (target: string) => `Применить оформление для ${target}?`,
            affectedCountMessage: (count: number) => `Существующих переопределений, которые изменятся: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'Использовать ручную сортировку?',
            propertySortMessage: (property: string, count: number) =>
                `Переключает текущий вид на ручную сортировку с использованием «${property}». При изменении порядка числовые значения индекса записываются в это свойство в ${count} ${count === 1 ? 'заметке' : 'заметках'} по мере необходимости.`,
            propertySortConfirmButton: 'Использовать ручную сортировку',
            removePropertyTitle: 'Удалить свойство сортировки?',
            removePropertyMessage: (property: string, count: number) =>
                `Это удалит «${property}» из ${count} ${count === 1 ? 'заметки' : 'заметок'} в текущем списке. Порядок ручной сортировки будет сброшен для этих заметок.`,
            removePropertyConfirmButton: 'Удалить свойство',
            compactTitle: 'Сжать значения индекса?',
            compactMessage: (count: number) =>
                `Эта перестановка требует больше числового пространства. ${count} ${count === 1 ? 'заметка получит' : 'заметок получат'} новые значения индекса.`,
            compactConfirmButton: 'Сжать значения индекса'
        },
        manualSortGroupHeader: {
            title: 'Задать заголовок группы',
            titleLabel: 'Заголовок',
            placeholder: 'Заголовок группы',
            icon: 'Значок',
            color: 'Цвет',
            wordCount: 'Показывать количество слов',
            wordCountTarget: 'Целевое количество слов',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'Если это поле пустое, цель группы использует целевое свойство, заданное в Настройки > Заметки > Количество слов и символов. Переопределите его, задав целевое значение для этой группы.',
            description: 'Настройте заголовок группы для этой заметки. Оставьте заголовок пустым, чтобы удалить его.'
        },
        mergeNotes: {
            title: 'Объединить заметки',
            summary: 'Создать одну заметку из {count} заметок в {folder}.',
            frontmatterRule: 'Frontmatter из первой заметки сохраняется. Frontmatter из остальных заметок удаляется.',
            crossFolderWarning:
                'Исходные заметки находятся в разных папках. Относительные ссылки и встраивания могут перестать работать в объединенной заметке.',
            outputName: 'Имя результата',
            outputNameDesc: 'Объединенная заметка будет создана в папке, показанной выше.',
            outputNamePlaceholder: 'Объединенные заметки',
            separator: 'Разделитель',
            separatorDesc: 'Вставляется между заметками.',
            separatorOptions: {
                none: 'Нет',
                blankLine: 'Пустая строка',
                horizontalRule: 'Горизонтальная линия',
                heading: 'Заголовок с названием заметки'
            },
            moveSourcesToTrash: 'Переместить исходные заметки в корзину после объединения',
            mergeButton: 'Объединить'
        },
        navRainbowSection: {
            title: (section: string) => `Цвета радуги: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'Поиск иконок...',
            recentlyUsedHeader: 'Недавно использованные',
            emptyStateSearch: 'Начните вводить для поиска иконок',
            emptyStateNoResults: 'Иконки не найдены',
            showingResultsInfo: 'Показано 50 из {count} результатов. Введите больше для уточнения.',
            emojiInstructions: 'Введите или вставьте любой эмодзи, чтобы использовать его как иконку',
            removeIcon: 'Удалить иконку',
            removeFromRecents: 'Удалить из недавних',
            allTabLabel: 'Все'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Добавить правило'
        },
        interfaceIcons: {
            title: 'Иконки интерфейса',
            fileItemsSection: 'Элементы файла',
            items: {
                'nav-shortcuts': 'Ярлыки',
                'nav-recent-files': 'Недавние файлы',
                'nav-expand-all': 'Развернуть все',
                'nav-collapse-all': 'Свернуть все',
                'nav-calendar': 'Календарь',
                'nav-tree-expand': 'Стрелка дерева: развернуть',
                'nav-tree-collapse': 'Стрелка дерева: свернуть',
                'nav-hidden-items': 'Скрытые элементы',
                'nav-root-reorder': 'Изменить порядок корневых папок',
                'nav-new-folder': 'Новая папка',
                'nav-show-single-pane': 'Показать одну панель',
                'nav-show-dual-pane': 'Показать двойную панель',
                'nav-profile-chevron': 'Стрелка меню профиля',
                'list-search': 'Поиск',
                'list-reveal-file': 'Показать файл',
                'list-descendants': 'Заметки из подпапок',
                'list-sort-ascending': 'Порядок сортировки: по возрастанию',
                'list-sort-descending': 'Порядок сортировки: по убыванию',
                'list-sort-modified': 'Сортировать по дате изменения',
                'list-sort-created': 'Сортировать по дате создания',
                'list-sort-title': 'Сортировать по заголовку',
                'list-sort-filename': 'Сортировать по имени файла',
                'list-sort-property': 'Сортировать по свойству',
                'list-appearance': 'Изменить вид',
                'list-new-note': 'Новая заметка',
                'list-pinned': 'Закреплённые заметки',
                'nav-folder-open': 'Папка открыта',
                'nav-folder-closed': 'Папка закрыта',
                'nav-tags': 'Теги',
                'nav-tag': 'Тег',
                'nav-properties': 'Свойства',
                'nav-property': 'Свойство',
                'nav-property-value': 'Значение',
                'file-unfinished-task': 'Незавершённые задачи',
                'file-word-count': 'Количество слов',
                'file-character-count': 'Количество символов'
            }
        },
        colorPicker: {
            currentColor: 'Текущий',
            newColor: 'Новый',
            paletteDefault: 'По умолчанию',
            paletteCustom: 'Пользовательские',
            copyColors: 'Копировать цвет',
            colorsCopied: 'Цвет скопирован в буфер обмена',
            pasteColors: 'Вставить цвет',
            pasteClipboardError: 'Не удалось прочитать буфер обмена',
            pasteInvalidFormat: 'Ожидалось hex-значение цвета',
            colorsPasted: 'Цвет успешно вставлен',
            resetUserColors: 'Очистить пользовательские цвета',
            clearCustomColorsConfirm: 'Удалить все пользовательские цвета?',
            userColorSlot: 'Цвет {slot}',
            recentColors: 'Недавние цвета',
            clearRecentColors: 'Очистить недавние цвета',
            removeRecentColor: 'Удалить цвет',
            apply: 'Применить',
            pickerLabel: 'Выбор',
            hexLabel: 'HEX',
            hexInputLabel: 'HEX-значение цвета',
            saturationValueArea: 'Насыщенность и яркость',
            hueSlider: 'Оттенок',
            alphaSlider: 'Прозрачность'
        },
        appearance: {
            tabIcon: 'Значок',
            tabColor: 'Цвет',
            tabBackground: 'Фон',
            resetIcon: 'Удалить иконку',
            resetColor: 'Удалить цвет',
            resetBackground: 'Удалить фон',
            clear: 'Очистить стиль',
            apply: 'Применить'
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
            renameBatchNotFinalized: 'Переименовано {renamed}/{total}. Не обновлено: {notUpdated}. Метаданные и ярлыки не были обновлены.',
            invalidTagName: 'Введите корректное название тега.',
            descendantRenameError: 'Нельзя переместить тег в себя или в потомка.',
            confirmDelete: 'Удалить тег',
            deleteBatchNotFinalized: 'Удалено из {removed}/{total}. Не обновлено: {notUpdated}. Метаданные и ярлыки не были обновлены.',
            checkConsoleForDetails: 'Подробности в консоли.',
            file: 'файл',
            files: 'файлов',
            inlineParsingWarning: {
                title: 'Совместимость встроенных тегов',
                message: '{tag} содержит символы, которые Obsidian не может обработать во встроенных тегах. Теги Frontmatter не затронуты.',
                confirm: 'Всё равно использовать'
            }
        },
        propertyOperation: {
            renameTitle: 'Переименовать свойство {property}',
            deleteTitle: 'Удалить свойство {property}',
            newKeyPrompt: 'Новое имя свойства',
            newKeyPlaceholder: 'Введите новое имя свойства',
            renameWarning: 'Переименование свойства {property} изменит {count} {files}.',
            renameConflictWarning:
                'Свойство {newKey} уже существует в {count} {files}. Переименование {oldKey} заменит существующие значения {newKey}.',
            deleteWarning: 'Удаление свойства {property} изменит {count} {files}.',
            confirmRename: 'Переименовать свойство',
            confirmDelete: 'Удалить свойство',
            renameNoChanges: '{oldKey} → {newKey} (без изменений)',
            renameSettingsUpdateFailed: 'Свойство {oldKey} → {newKey} переименовано. Не удалось обновить настройки.',
            deleteSingleSuccess: 'Свойство {property} удалено из 1 заметки',
            deleteMultipleSuccess: 'Свойство {property} удалено из {count} заметок',
            deleteSettingsUpdateFailed: 'Свойство {property} удалено. Не удалось обновить настройки.',
            invalidKeyName: 'Введите допустимое имя свойства.'
        },
        fileSystem: {
            newFolderTitle: 'Новая папка',
            renameFolderTitle: 'Переименовать папку',
            renameFileTitle: 'Переименовать файл',
            deleteFolderTitle: "Удалить '{name}'?",
            deleteFileTitle: "Удалить '{name}'?",
            deleteFileAttachmentsTitle: 'Удалить вложения файла?',
            moveFileConflictTitle: 'Конфликт перемещения',
            folderNamePrompt: 'Введите название папки:',
            hideInOtherVaultProfiles: 'Скрыть в других профилях хранилища',
            renamePrompt: 'Введите новое название:',
            renameVaultTitle: 'Изменить отображаемое имя хранилища',
            renameVaultPrompt: 'Введите пользовательское имя (оставьте пустым для использования по умолчанию):',
            deleteFolderConfirm: 'Вы уверены, что хотите удалить эту папку и всё её содержимое?',
            deleteFileConfirm: 'Вы уверены, что хотите удалить этот файл?',
            deleteFileAttachmentsDescriptionSingle: 'Это вложение больше не используется ни в одной заметке. Хотите его удалить?',
            deleteFileAttachmentsDescriptionMultiple: 'Эти вложения больше не используются ни в одной заметке. Хотите их удалить?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Дерево файлов',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Галерея',
            moveFileConflictDescriptionSingle: 'Обнаружен конфликт файла в «{folder}».',
            moveFileConflictDescriptionMultiple: 'Обнаружено {count} конфликтов файлов в «{folder}».',
            moveFileConflictAffectedFiles: 'Затронутые файлы',
            moveFileConflictItem: '«{name}» -> «{suggested}»{renameOnly}',
            moveFileConflictRenameOnly: '(только переименование)',
            moveFileConflictRename: 'Переименовать',
            moveFileConflictOverwrite: 'Перезаписать',
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
        calendarTemplate: {
            placeholder: 'Поиск шаблонов...',
            instructions: {
                navigate: 'для навигации',
                select: 'для выбора шаблона',
                dismiss: 'для закрытия'
            }
        },
        navigationBanner: {
            placeholder: 'Поиск изображений...',
            svgMissingDimensions: 'Выбранный SVG-файл не задаёт ширину, высоту или viewBox.',
            instructions: {
                navigate: 'для навигации',
                select: 'для установки баннера',
                dismiss: 'для закрытия'
            }
        },
        tagSuggest: {
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
        propertySuggest: {
            placeholder: 'Выберите ключ свойства...',
            navigatePlaceholder: 'Перейти к свойству...',
            instructions: {
                navigate: 'для навигации',
                select: 'для добавления свойства',
                dismiss: 'для закрытия'
            }
        },
        propertyKeyVisibility: {
            title: 'Видимость ключей свойств',
            description:
                'Управление отображением значений свойств. Столбцы соответствуют панели навигации, панели списка и контекстному меню файла. Используйте нижнюю строку для переключения всех строк в столбце.',
            searchPlaceholder: 'Поиск ключей свойств...',
            propertyColumnLabel: 'Свойство',
            showInNavigation: 'Показать в навигации',
            showInList: 'Показать в списке',
            showInFileMenu: 'Показать в меню файла',
            toggleAllInNavigation: 'Переключить все в навигации',
            toggleAllInList: 'Переключить все в списке',
            toggleAllInFileMenu: 'Переключить все в меню файла',
            applyButton: 'Применить',
            emptyState: 'Ключи свойств не найдены.'
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
            closeButton: 'Может, позже'
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
            deleteAttachments: 'Не удалось удалить вложения: {error}',
            mergeNotes: 'Не удалось объединить заметки: {error}',
            mergeNotesOpenOutput:
                'Объединенная заметка создана как {name}, но ее не удалось открыть: {error}. Исходные заметки не изменены.',
            mergeNotesOpenSkipped: 'Другой запрос на открытие файла получил приоритет.',
            mergeNotesTrashSources: 'Объединенная заметка создана. Не удалось переместить {count} исходных заметок в корзину.',
            duplicateNote: 'Не удалось дублировать заметку: {error}',
            duplicateFolder: 'Не удалось дублировать папку: {error}',
            openVersionHistory: 'Не удалось открыть историю версий: {error}',
            versionHistoryNotFound: 'Команда истории версий не найдена. Убедитесь, что Obsidian Sync включён.',
            revealInExplorer: 'Не удалось показать файл в проводнике: {error}',
            openInDefaultApp: 'Не удалось открыть в приложении по умолчанию: {error}',
            openInDefaultAppNotAvailable: 'Открытие в приложении по умолчанию недоступно на этой платформе',
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
            showFolder: 'Папка показана: {name}',
            folderExcludedFromDescendants: 'Скрыто из списков родительских папок: {name}',
            folderIncludedInDescendants: 'Показано в списках родительских папок: {name}',
            mergeNotes: 'Объединено {count} заметок в {name}'
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
            mergeNotesRequireMultipleMarkdown: 'Выберите не менее двух Markdown-заметок для объединения',
            tagOperationsNotAvailable: 'Операции с тегами недоступны',
            propertyOperationsNotAvailable: 'Операции со свойствами недоступны',
            tagsRequireMarkdown: 'Теги поддерживаются только для Markdown-заметок',
            propertiesRequireMarkdown: 'Свойства поддерживаются только в заметках Markdown',
            propertySetOnNote: 'Свойство обновлено в 1 заметке',
            propertySetOnNotes: 'Свойство обновлено в {count} заметках',
            manualSortPropertyRemovedFromNote: 'Свойство сортировки удалено из 1 заметки',
            manualSortPropertyRemovedFromNotes: 'Свойство сортировки удалено из {count} заметок',
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
            untitled: 'Без названия'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Нельзя переместить папку в себя или в подпапку.',
            itemAlreadyExists: 'Элемент с именем "{name}" уже существует в этом месте.',
            failedToMove: 'Не удалось переместить: {error}',
            failedToAddTag: 'Не удалось добавить тег "{tag}"',
            failedToSetProperty: 'Не удалось обновить свойство: {error}',
            failedToClearTags: 'Не удалось очистить теги',
            failedToMoveFolder: 'Не удалось переместить папку "{name}"',
            failedToImportFiles: 'Не удалось импортировать: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} файлов уже существуют в месте назначения',
            filesAlreadyHaveTag: '{count} файлов уже имеют этот тег или более специфичный',
            filesAlreadyHaveProperty: '{count} файлов уже имеют это свойство',
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

    // Plugin commands
    commands: {
        open: 'Открыть', // Command palette: Opens the Notebook Navigator view (English: Open)
        toggleLeftSidebar: 'Переключить левую боковую панель', // Command palette: Toggles left sidebar, opening Notebook Navigator when uncollapsing (English: Toggle left sidebar)
        openHomepage: 'Открыть домашнюю страницу', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        openDailyNote: 'Открыть ежедневную заметку',
        openWeeklyNote: 'Открыть еженедельную заметку',
        openMonthlyNote: 'Открыть ежемесячную заметку',
        openQuarterlyNote: 'Открыть квартальную заметку',
        openYearlyNote: 'Открыть годовую заметку',
        revealFile: 'Показать файл', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Поиск', // Command palette: Toggle search in the file list (English: Search)
        searchVaultRoot: 'Поиск по всему хранилищу', // Command palette: Selects the vault root folder and focuses search with subfolders included (English: Search whole vault)
        toggleDualPane: 'Переключить двухпанельный режим', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        toggleDualPaneOrientation: 'Переключить ориентацию двухпанельного режима', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'Переключить календарь', // Command palette: Toggles showing the calendar overlay in the navigation pane (English: Toggle calendar)
        selectVaultProfile: 'Выбрать профиль хранилища', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'Выбрать профиль хранилища 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Выбрать профиль хранилища 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Выбрать профиль хранилища 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Удалить файлы', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Создать новую заметку', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Новая заметка из шаблона', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Переместить файлы', // Command palette: Move selected files to another folder (English: Move files)
        mergeNotes: 'Объединить заметки', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'Выбрать следующий файл', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Выбрать предыдущий файл', // Command palette: Selects the previous file in the current view (English: Select previous file)
        navigateBack: 'Назад',
        navigateForward: 'Вперёд',
        convertToFolderNote: 'Конвертировать в заметку папки', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Назначить заметкой папки', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Отвязать заметку папки', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Закрепить все заметки папок', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Перейти к папке', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Перейти к тегу', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        navigateToProperty: 'Перейти к свойству', // Command palette: Navigate to a property key or value using fuzzy search (English: Navigate to property)
        addShortcut: 'Добавить в ярлыки', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: 'Открыть ярлык {number}',
        toggleDescendants: 'Переключить потомков', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Переключить скрытые папки, теги и заметки', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Переключить сортировку тегов', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: 'Переключить теги по выбору',
        togglePropertiesBySelection: 'Переключить свойства по выбору',
        toggleCompactMode: 'Переключить компактный режим', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Переключить закреплённый раздел',
        collapseExpand: 'Свернуть / развернуть все элементы', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        collapseExpandSelectedItem: 'Свернуть / развернуть выбранный элемент',
        addTag: 'Добавить тег к выбранным файлам', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        setProperty: 'Задать свойство для выбранных файлов', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'Удалить тег из выбранных файлов', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Удалить все теги из выбранных файлов', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        openAllFiles: 'Открыть все файлы', // Command palette: Opens all files in the current folder or tag (English: Open all files)
        rebuildCache: 'Пересобрать кэш' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        calendarViewName: 'Календарь', // Name shown in the view header/tab (English: Calendar)
        folderNoteSidebarViewName: 'Заметка папки', // Name shown in the folder note sidebar tab (English: Folder note)
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
        folders: 'папок',
        wordCount: 'Количество слов'
    },

    fileCounts: {
        words: '{count} слов',
        characters: '{count} символов',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'Изменить настройки по умолчанию',
        metadataReport: {
            exportSuccess: 'Отчёт о неудачных метаданных экспортирован в: {filename}',
            exportFailed: 'Не удалось экспортировать отчёт о метаданных'
        },
        sections: {
            general: 'Общие',
            vaultFilters: 'Фильтры отображения',
            appearanceBehavior: 'Внешний вид и поведение',
            navigationPane: 'Панель навигации',
            calendar: 'Календарь',
            fileOperations: 'Операции с файлами',
            icons: 'Наборы иконок',
            folders: 'Папки',
            folderNotes: 'Заметки папок',
            folderNoteFiles: 'Файлы заметок папок',
            foldersAndFolderNotes: 'Папки и заметки папок',
            tagsAndProperties: 'Теги и свойства',
            tags: 'Теги',
            listPane: 'Панель списка',
            notes: 'Отображение файлов',
            shortcutsAndRecentFiles: 'Ярлыки и недавние файлы',
            advanced: 'Расширенные'
        },
        pageGroups: {
            configuration: 'Конфигурация',
            navigationAndContent: 'Панель навигации',
            notesAndLists: 'Панель списка',
            calendarAndTools: 'Календарь и инструменты'
        },
        pageDescriptions: {
            general: 'Заметки о выпуске, поддержка, профиль хранилища, типы файлов и ключи свойств.',
            vaultFilters: 'Скрытые папки, теги, файлы, теги файлов и правила свойств.',
            appearanceBehavior: 'Поведение, навигация с клавиатуры, кнопки мыши, внешний вид и форматирование.',
            navigationPane: 'Компоновка, внешний вид, количество заметок, поведение сворачивания и цвета радуги.',
            shortcuts: 'Видимость ярлыков, значки, недавние файлы и закреплённые элементы.',
            calendar: 'Отображение календаря, заметки дат, шаблоны, локаль и размещение боковой панели.',
            fileOperations: 'Шаблоны, подтверждения удаления, вложения и поведение при конфликтах перемещения файлов.',
            foldersAndFolderNotes: 'Отображение папок, заметки папок, шаблоны заметок папок и поведение заметок папок.',
            tagsProperties: 'Разделы тегов и свойств, иконки, сортировка, область действия и наследование.',
            listPane: 'Сортировка, группировка, режимы списка, закреплённые заметки и предпросмотр рисунков.',
            frontmatter: 'Поля frontmatter для отображаемых имён, временных меток, иконок и цветов.',
            notes: 'Заголовки, текст превью, изображения записей, теги, свойства, даты, количество слов и количество символов.',
            iconPacks: 'Иконки интерфейса, иконки файлов и управление наборами иконок.',
            advanced: 'Диагностика, очистка метаданных, импорт/экспорт и сброс.'
        },
        groups: {
            general: {
                vaultConfiguration: 'Настройка хранилища',
                templates: 'Шаблоны',
                behavior: 'Поведение',
                startup: 'Запуск',
                keyboardNavigation: 'Навигация с клавиатуры',
                mouseButtons: 'Кнопки мыши',
                view: 'Внешний вид',
                icons: 'Иконки',
                desktopAppearance: 'Внешний вид на компьютере',
                mobileAppearance: 'Мобильный вид',
                formatting: 'Форматирование'
            },
            advanced: {
                maintenance: 'Обслуживание',
                resetSettings: 'Сброс настроек'
            },
            navigation: {
                appearance: 'Внешний вид',
                banner: 'Баннер',
                collapseItems: 'Сворачивание элементов',
                dragAndDrop: 'Перетаскивание',
                noteCounts: 'Количество заметок',
                rainbowColors: 'Цвета радуги',
                leftSidebar: 'Левая боковая панель',
                calendarIntegration: 'Интеграция с календарём'
            },
            list: {
                display: 'Внешний вид',
                groupHeaders: 'Заголовки групп',
                propertySort: 'Сортировка по свойству',
                manualSort: 'Ручная сортировка',
                pinnedNotes: 'Закреплённые заметки',
                drawingPreviews: 'Предпросмотр рисунков'
            },
            notes: {
                frontmatter: 'Поля frontmatter',
                tasks: 'Задачи',
                icon: 'Иконка',
                title: 'Заголовок',
                previewText: 'Текст превью',
                featureImage: 'Изображение записи',
                tags: 'Теги',
                properties: 'Свойства',
                date: 'Дата',
                parentFolder: 'Родительская папка',
                wordCount: 'Количество слов и символов'
            }
        },
        syncMode: {
            notSynced: '(не синхронизировано)',
            switchToSynced: 'Включить синхронизацию',
            switchToLocal: 'Отключить синхронизацию'
        },
        items: {
            listPaneTitle: {
                name: 'Заголовок панели списка',
                desc: 'Выберите, где отображается заголовок панели списка.',
                options: {
                    header: 'Показывать в заголовке',
                    list: 'Показывать в панели списка',
                    hidden: 'Не показывать'
                }
            },
            sortNotesBy: {
                name: 'Сортировка по умолчанию',
                desc: 'Выберите порядок сортировки заметок по умолчанию.',
                options: {
                    'modified-desc': 'По дате изменения (новые сверху)',
                    'modified-asc': 'По дате изменения (старые сверху)',
                    'created-desc': 'По дате создания (новые сверху)',
                    'created-asc': 'По дате создания (старые сверху)',
                    'title-asc': 'По названию (А сверху)',
                    'title-desc': 'По названию (Я сверху)',
                    'filename-asc': 'Имя файла (А сверху)',
                    'filename-desc': 'Имя файла (Я сверху)'
                },
                directions: {
                    asc: 'По возрастанию',
                    desc: 'По убыванию'
                },
                fields: {
                    modified: 'Дата изменения',
                    created: 'Дата создания',
                    title: 'Название',
                    filename: 'Имя файла',
                    property: 'Свойство'
                }
            },
            propertySortKey: {
                name: 'Свойства для сортировки',
                desc: 'Разделённые запятыми свойства frontmatter, отображаемые как варианты сортировки по свойству. Массивы объединяются в одну строку. Эти свойства не изменяются.',
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: 'Вторичная сортировка',
                desc: 'Используется при сортировке по свойству, когда у заметок одинаковое значение свойства или значение отсутствует.',
                options: {
                    title: 'Заголовок',
                    filename: 'Имя файла',
                    created: 'Дата создания',
                    modified: 'Дата редактирования'
                }
            },
            propertySortInstructions: {
                intro: 'Каждое свойство, перечисленное выше, отображается как вариант сортировки в меню сортировки на панели списка. Выбор одного из них сортирует заметки по значению свойства frontmatter.'
            },
            manualSortPropertyKey: {
                name: 'Свойство ручной сортировки',
                desc: 'Свойство frontmatter, используемое для хранения числовых значений индекса для ручной сортировки.'
            },
            manualSortGroupHeaderProperty: {
                name: 'Свойство заголовка группы',
                desc: 'Свойство frontmatter, используемое для хранения произвольных заголовков групп.'
            },
            groupHeadersInstructions: {
                intro: 'Произвольные заголовки групп отображаются над заметками на панели списка.',
                items: [
                    'В меню сортировки на панели списка установите группировку **Произвольная**.',
                    'Щёлкните правой кнопкой мыши по заметке и выберите **Задать заголовок группы**, чтобы добавить заголовок над ней.'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'Размещение новых заметок',
                desc: 'Выберите, где размещаются новые заметки, когда текущий список использует ручную сортировку.',
                options: {
                    top: 'Сверху',
                    bottom: 'Снизу',
                    'below-selected-note': 'Под выбранной заметкой',
                    unsorted: 'Без сортировки'
                }
            },
            confirmBeforeManualSort: {
                name: 'Подтверждать перед ручной сортировкой',
                desc: 'Показывать предупреждение перед первой записью свойства ручной сортировки в заметки. Когда отключено, заметки получают свойство без предупреждения.'
            },
            manualSortInstructions: {
                intro: 'Ручная сортировка записывает числовое значение индекса в свойство frontmatter каждой заметки. Заметки без индекса отображаются в разделе «Без сортировки».',
                items: [
                    'Включите ручную сортировку, выбрав **Ручная сортировка** в меню сортировки. После этого есть два способа изменить порядок заметок.',
                    'Выберите **Изменить порядок сортировки...** в меню сортировки, чтобы открыть представление для изменения порядка. Перетаскивайте заметки мышью или касанием на мобильных устройствах. На компьютере **Cmd/Ctrl** или **Shift** клик выбирает несколько заметок, после чего перетаскивание любой из них перемещает всю группу.',
                    'В панели списка выберите одну заметку или несколько, затем нажмите **Cmd/Ctrl + Arrow Up/Down**, чтобы переместить выделение вверх или вниз.'
                ]
            },
            revealFileOnListChanges: {
                name: 'Прокрутка к выбранному файлу при изменениях списка',
                desc: 'Прокручивать к выбранному файлу при закреплении заметок, показе потомков, изменении внешнего вида папки или выполнении файловых операций.'
            },
            includeDescendantNotes: {
                name: 'Показывать заметки из подпапок / потомков',
                desc: 'Включать заметки из вложенных подпапок и потомков тегов и свойств при просмотре папки, тега или свойства.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Закреплять заметки только в их папке',
                desc: 'Закреплённые заметки отображаются закреплёнными только в своей собственной папке. Полезно для заметок-папок или если у вас много закреплённых заметок. Не влияет на представления тегов или свойств.'
            },
            separateNoteCounts: {
                name: 'Показывать текущие заметки и заметки потомков отдельно',
                desc: 'Отображать количество заметок в формате "текущие ▾ потомки" для папок, тегов и свойств.'
            },
            groupNotes: {
                name: 'Группировка по умолчанию',
                desc: 'Произвольная отображает заголовки, заданные в frontmatter. По дате группирует заметки по дате. По папке группирует заметки по папке. В представлениях тегов и свойств используются группы по дате, когда выбрана группировка по папке.',
                options: {
                    custom: 'Произвольная',
                    date: 'По дате',
                    folder: 'По папке'
                }
            },
            showSelectedNavigationPills: {
                name: 'Всегда показывать все метки тегов и свойств',
                desc: 'При отключении метки, совпадающие с текущим выбором навигации, скрываются (например, метка тега «рецепты» скрывается при просмотре тега «рецепты»). Включите, чтобы все метки оставались видимыми.'
            },
            stickyGroupHeaders: {
                name: 'Закреплённые заголовки групп',
                desc: 'Сохранять видимым заголовок текущей даты, папки или раздела закреплённых при прокрутке.'
            },
            showFolderGroupPaths: {
                name: 'Показывать пути подпапок',
                desc: 'При группировке по папке в панели списка показывать пути подпапок вместо только названий папок.'
            },
            showGroupHeaderItemCounts: {
                name: 'Показывать количество элементов',
                desc: 'Отображает количество элементов в каждом заголовке группы на панели списка.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'Группировка по папкам: файлы текущей папки внизу',
                desc: 'Если для группировки по умолчанию выбран вариант «Папка», файлы непосредственно в выбранной папке будут показаны ниже групп вложенных папок.'
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
                desc: 'Отображать иконки файлов с выравниванием по левому краю. Отключение убирает и иконки, и отступы. Приоритет: значок незавершённых задач > пользовательский значок > значок папки > значок имени файла > значок типа файла > значок по умолчанию.'
            },
            useFolderIcon: {
                name: 'Использовать значок папки',
                desc: 'Отображать значок родительской папки, когда не задан пользовательский значок файла. Цвет папки используется, когда не задан пользовательский цвет файла.'
            },
            showFileIconUnfinishedTask: {
                name: 'Значок незавершённых задач',
                desc: 'Отображать значок задачи, когда заметка содержит незавершённые задачи.'
            },
            showFileBackgroundUnfinishedTask: {
                name: 'Фон незавершённых задач',
                desc: 'Применять цвет фона, когда заметка содержит незавершённые задачи.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'Цвет фона незавершённых задач',
                desc: 'Задать цвет фона, используемый когда заметка содержит незавершённые задачи.'
            },
            showFilenameMatchIcons: {
                name: 'Иконки по имени файла',
                desc: 'Назначить иконки файлам на основе текста в их именах.'
            },
            fileNameIconMap: {
                name: 'Сопоставление имён и иконок',
                desc: 'Файлы, содержащие текст, получают указанную иконку. Одно сопоставление на строку: текст=иконка',
                placeholder: '# текст=иконка\nвстреча=ph-calendar\nсчёт=ph-receipt',
                editTooltip: 'Редактировать сопоставления'
            },
            showCategoryIcons: {
                name: 'Иконки по типу файла',
                desc: 'Назначить иконки файлам на основе их расширения.'
            },
            fileTypeIconPreset: {
                name: 'Предустановка иконок файлов',
                desc: 'Выберите встроенные иконки или предустановку пакета иконок. Пользовательские правила расширений переопределяют эту предустановку.',
                options: {
                    none: 'Встроенные иконки'
                },
                notInstalledWarning: 'Этот пакет иконок не установлен. Вместо него отображаются встроенные иконки.'
            },
            fileTypeIconMap: {
                name: 'Сопоставление типов и иконок',
                desc: 'Файлы с расширением получают указанную иконку. Одно сопоставление на строку: расширение=иконка',
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'Редактировать сопоставления'
            },
            compactItemHeight: {
                name: 'Высота компактных элементов',
                desc: 'Установите высоту компактных элементов списка на компьютере и мобильном (в пикселях).',
                resetTooltip: 'Восстановить по умолчанию (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Масштабировать текст с высотой компактных элементов',
                desc: 'Масштабировать текст компактного списка при уменьшении высоты элементов.'
            },
            showParentFolder: {
                name: 'Показывать родительскую папку',
                desc: 'Отображать название родительской папки для заметок в подпапках, тегах или свойствах.'
            },
            showParentFolderFullPath: {
                name: 'Показывать полный путь',
                desc: 'Отображать полный путь к родительской папке вместо только названия папки.'
            },
            parentFolderClickRevealsFile: {
                name: 'Клик по родительской папке открывает папку',
                desc: 'Клик по метке родительской папки открывает папку в панели списка.'
            },
            showParentFolderColor: {
                name: 'Показывать цвет родительской папки',
                desc: 'Использовать цвета папок на метках родительских папок.'
            },
            showParentFolderIcon: {
                name: 'Показывать иконку родительской папки',
                desc: 'Показывать иконки папок рядом с метками родительских папок.'
            },
            showQuickActions: {
                name: 'Показывать быстрые действия',
                desc: 'Показывать кнопки действий при наведении на файлы. Элементы управления выбирают, какие действия отображаются.'
            },
            dualPane: {
                name: 'Двухпанельный режим',
                desc: 'Показывать панель навигации и панель списка рядом на компьютере.'
            },
            dualPaneOrientation: {
                name: 'Ориентация двухпанельного режима',
                desc: 'Выберите горизонтальную или вертикальную разметку при активном двухпанельном режиме.',
                options: {
                    horizontal: 'Горизонтальное разделение',
                    vertical: 'Вертикальное разделение'
                }
            },
            narrowSidebarLayout: {
                name: 'Когда боковая панель слишком узкая',
                desc: 'Выберите, что происходит, когда панель навигации и панель списка не помещаются рядом.',
                options: {
                    none: 'Ничего не делать',
                    singlePane: 'Переключиться на одну панель',
                    vertical: 'Переключиться на вертикальное разделение'
                }
            },
            narrowSidebarTrigger: {
                name: 'Порог узкой боковой панели',
                desc: 'Выберите, как рассчитывается порог ширины боковой панели.',
                options: {
                    fitPanes: 'Уместить панели',
                    customWidth: 'Пользовательская ширина'
                }
            },
            narrowSidebarCustomWidth: {
                name: 'Ширина порога узкой боковой панели',
                desc: 'Переключаться, когда боковая панель уже этой ширины.',
                resetTooltip: 'Сбросить до ширины по умолчанию'
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
                name: 'Уровень масштабирования',
                desc: 'Управляет общим масштабом Notebook Navigator (в процентах).'
            },
            useFloatingToolbars: {
                name: 'Использовать плавающие панели инструментов на iOS/iPadOS',
                desc: 'Применяется только на iOS и iPadOS.'
            },
            startView: {
                name: 'Начальный вид по умолчанию',
                desc: 'Выберите, какая панель активна при открытии Notebook Navigator. В однопанельном режиме эта панель показывается первой; в двухпанельном режиме она получает фокус клавиатуры.',
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
            createNewNotesInNewTab: {
                name: 'Открывать новые заметки в новой вкладке',
                desc: 'Если включено, команда «Создать новую заметку» открывает заметки в новой вкладке. Если выключено, заметки заменяют текущую вкладку.'
            },
            autoRevealActiveNote: {
                name: 'Автопоказ активной заметки',
                desc: 'Автоматически показывать заметки, открытые из быстрого переключателя, ссылок или поиска.'
            },
            autoRevealShortestPath: {
                name: 'Автопоказ: Использовать кратчайший путь',
                desc: 'Включено: Автопоказ выбирает ближайшую видимую родительскую папку или тег. Выключено: Автопоказ выбирает фактическую папку файла и точный тег.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Автопоказ: Игнорировать события из правой боковой панели',
                desc: 'Не менять активную заметку при клике или изменении заметок в правой боковой панели.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'Автопоказ: Игнорировать события из других окон',
                desc: 'Не менять активную заметку при работе с заметками в другом окне.'
            },
            paneTransitionDuration: {
                name: 'Анимация одиночной панели',
                desc: 'Длительность перехода при переключении панелей в режиме одиночной панели (миллисекунды).',
                resetTooltip: 'Сбросить по умолчанию'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Автовыбор первой заметки',
                desc: 'Автоматически открывать первую заметку при смене папок, тегов или свойств.'
            },
            skipAutoScroll: {
                name: 'Отключить автопрокрутку для ярлыков',
                desc: 'Не прокручивать панель навигации при клике по элементам в ярлыках.'
            },
            autoExpandNavItems: {
                name: 'Разворачивать при выборе',
                desc: 'Разворачивать папки и теги при выборе. В однопанельном режиме первый выбор разворачивает, второй показывает файлы.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'Одна развернутая ветка',
                desc: 'Сворачивать другие ветки в том же дереве при разворачивании папки, тега или свойства.'
            },
            springLoadedFolders: {
                name: 'Разворачивать при перетаскивании',
                desc: 'Разворачивать папки и теги при наведении во время перетаскивания.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Разворачивать при перетаскивании: Задержка первого разворачивания',
                desc: 'Задержка перед разворачиванием первой папки или тега во время перетаскивания (секунды).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Разворачивать при перетаскивании: Задержка последующих разворачиваний',
                desc: 'Задержка перед разворачиванием дополнительных папок или тегов во время того же перетаскивания (секунды).'
            },
            navigationBanner: {
                name: 'Баннер навигации (профиль хранилища)',
                desc: 'Показывать изображение над панелью навигации. Меняется с выбранным профилем хранилища.',
                current: 'Текущий баннер: {path}',
                chooseButton: 'Выбрать изображение'
            },
            pinNavigationBanner: {
                name: 'Закрепить баннер',
                desc: 'Закрепить баннер навигации над деревом навигации.'
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
                name: 'Показывать недавние файлы',
                desc: 'Отображать раздел недавних файлов в панели навигации.'
            },
            hideRecentNotes: {
                name: 'Скрыть типы файлов из недавних файлов',
                desc: 'Выберите типы файлов для скрытия в разделе недавних файлов.',
                options: {
                    none: 'Нет',
                    folderNotes: 'Заметки папок'
                }
            },
            recentNotesCount: {
                name: 'Количество недавних файлов',
                desc: 'Количество отображаемых недавних файлов.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Закрепить недавние файлы вместе с ярлыками',
                desc: 'Включать недавние файлы при закреплении ярлыков.'
            },
            calendarEnabled: {
                name: 'Включить календарь',
                desc: 'Включить функции календаря в Notebook Navigator.'
            },
            calendarPlacement: {
                name: 'Расположение календаря',
                desc: 'Отображать на левой или правой боковой панели.',
                options: {
                    leftSidebar: 'Левая боковая панель',
                    rightSidebar: 'Правая боковая панель'
                }
            },
            calendarLeftPlacement: {
                name: 'Расположение в режиме одной панели',
                desc: 'Где отображается календарь в режиме одной панели.',
                options: {
                    navigationPane: 'Панель навигации',
                    below: 'Под панелями'
                }
            },
            calendarLocale: {
                name: 'Язык',
                desc: 'Управляет форматированием дат календаря, нумерацией недель и первым днём недели.',
                weekPathMismatchWarning:
                    'Видимый календарь и пути еженедельных заметок используют разные начала недели или разную нумерацию недель.',
                options: {
                    systemDefault: 'По умолчанию'
                }
            },
            calendarWeekendDays: {
                name: 'Выходные дни',
                desc: 'Отображать выходные дни с другим цветом фона.',
                options: {
                    none: 'Нет',
                    satSun: 'Суббота и воскресенье',
                    friSat: 'Пятница и суббота',
                    thuFri: 'Четверг и пятница'
                }
            },
            calendarMonthHeadingFormat: {
                name: 'Формат названия месяца',
                desc: 'Полное (январь) или сокращённое (янв.) название месяца.',
                options: {
                    full: 'январь (полный)',
                    short: 'янв. (короткий)'
                }
            },
            showInfoButtons: {
                name: 'Показать кнопки информации',
                desc: 'Отображать кнопки информации в строке поиска и заголовке календаря.'
            },
            calendarWeeksToShow: {
                name: 'Недель для отображения на левой боковой панели',
                desc: 'Календарь на правой боковой панели всегда отображает полный месяц.',
                options: {
                    fullMonth: 'Полный месяц',
                    oneWeek: '1 неделя',
                    weeksCount: '{count} недель'
                }
            },
            calendarHighlightToday: {
                name: 'Выделять сегодняшнюю дату',
                desc: 'Выделять сегодняшнюю дату цветом фона и жирным текстом.'
            },
            calendarShowFeatureImage: {
                name: 'Показать изображение-обложку',
                desc: 'Отображать изображения-обложки заметок в календаре.'
            },
            calendarShowTasks: {
                name: 'Показывать задачи',
                desc: 'Отображать индикатор на днях, неделях и месяцах с незавершёнными задачами.'
            },
            calendarShowWeekNumber: {
                name: 'Показать номер недели',
                desc: 'Добавить колонку с номером недели.'
            },
            calendarShowQuarter: {
                name: 'Показать квартал',
                desc: 'Добавить метку квартала в заголовок календаря.'
            },
            calendarShowYearCalendar: {
                name: 'Показать годовой календарь',
                desc: 'Отображать навигацию по годам и сетку месяцев в правой боковой панели.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Подтвердить перед созданием',
                desc: 'Показать диалог подтверждения при создании новой ежедневной заметки.'
            },
            calendarIntegrationMode: {
                name: 'Источник ежедневных заметок',
                desc: 'Источник для заметок календаря.',
                options: {
                    dailyNotes: 'Ежедневные заметки (основной плагин)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'Папка и формат даты настраиваются в плагине Daily Notes.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'Язык периодических заметок',
                desc: 'Управляет локализованными названиями месяцев, названиями дней недели, номерами недель и началом недели в путях периодических заметок Notebook Navigator.',
                options: {
                    calendar: 'Календарь',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'Корневая папка',
                desc: 'Базовая папка для периодических заметок. Шаблоны дат могут включать подпапки. Изменяется с выбранным профилем хранилища.',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'Расположение папки шаблонов',
                desc: 'Выбор файла шаблона показывает заметки из этой папки.',
                placeholder: 'Templates',
                usage: 'Используется заметками календаря и заметками папок. Настройте шаблоны в Календарь > Интеграция с календарём и Папки и заметки папок > Файлы заметок папок.'
            },
            calendarCustomFilePattern: {
                name: 'Ежедневные заметки',
                desc: 'Формат пути с использованием формата даты Moment. Заключайте названия подпапок в скобки, напр. [Work]/YYYY. Нажмите на значок шаблона, чтобы задать шаблон. Укажите расположение папки шаблонов в Операции с файлами > Шаблоны.',
                momentDescPrefix: 'Формат пути с использованием ',
                momentLinkText: 'формата даты Moment',
                momentDescSuffix:
                    '. Заключайте названия подпапок в скобки, напр. [Work]/YYYY. Нажмите на значок шаблона, чтобы задать шаблон. Укажите расположение папки шаблонов в Операции с файлами > Шаблоны.',
                templaterSupportInstalled: '✅ Плагин Templater установлен с полной поддержкой шаблонов.',
                templaterSupportMissing: '⚠️ Установите плагин Templater для полной поддержки шаблонов.',
                placeholder: 'YYYY/YYYYMMDD',
                example: 'Текущий синтаксис: {path}',
                parsingError: 'Шаблон должен форматироваться и разбираться обратно как полная дата (год, месяц, день).'
            },
            calendarCustomWeekPattern: {
                name: 'Еженедельные заметки',
                parsingError: 'Шаблон должен форматироваться и разбираться обратно как полная неделя (год недели, номер недели).',
                weekPathMismatchWarning:
                    'Пути еженедельных заметок используют язык периодических заметок. Используйте совпадающие языки или используйте "GGGG" с "WW" для недель, начинающихся с понедельника.',
                mixedWeekTokensWarning:
                    'Этот шаблон смешивает токены недели, начинающейся с понедельника ("W" или "G"), с токенами недели на основе локали ("w" или "g"). Используйте один набор последовательно: "GGGG" с "WW" для недель, начинающихся с понедельника, или "gggg" с "ww", если еженедельные заметки должны соответствовать выбранной локали.'
            },
            calendarCustomMonthPattern: {
                name: 'Ежемесячные заметки',
                parsingError: 'Шаблон должен форматироваться и разбираться обратно как полный месяц (год, месяц).'
            },
            calendarCustomQuarterPattern: {
                name: 'Квартальные заметки',
                parsingError: 'Шаблон должен форматироваться и разбираться обратно как полный квартал (год, квартал).'
            },
            calendarCustomYearPattern: {
                name: 'Годовые заметки',
                parsingError: 'Шаблон должен форматироваться и разбираться обратно как полный год (год).'
            },
            calendarTemplateFile: {
                current: 'Файл шаблона: {name}'
            },
            showTooltips: {
                name: 'Показывать подсказки',
                desc: 'Отображать всплывающие подсказки с дополнительной информацией для заметок и папок.'
            },
            showTooltipPath: {
                name: 'Показывать путь в подсказках',
                desc: 'Отображать путь к папке под названиями заметок в подсказках.'
            },
            showTooltipWordCount: {
                name: 'Показывать количество слов в подсказках',
                desc: 'Отображать количество слов в заметках в подсказках.'
            },
            resetPaneSeparator: {
                name: 'Сбросить положение разделителя панелей',
                desc: 'Сбросить перетаскиваемый разделитель между панелью навигации и панелью списка в положение по умолчанию.',
                buttonText: 'Сбросить разделитель',
                notice: 'Положение разделителя сброшено. Перезапустите Obsidian или переоткройте Notebook Navigator для применения.'
            },
            settingsTransfer: {
                name: 'Импорт и экспорт настроек',
                desc: 'Экспорт или импорт настроек Notebook Navigator в формате JSON. Импорт заменяет все настройки.',
                importButtonText: 'Импорт',
                exportButtonText: 'Экспорт',
                import: {
                    modalTitle: 'Импорт настроек',
                    fileButtonName: 'Импорт из файла',
                    fileButtonDesc: 'Загрузить JSON-файл с диска.',
                    fileButtonText: 'Импорт из файла',
                    editorName: 'JSON',
                    editorDesc: 'Вставьте или отредактируйте JSON ниже. Не включённые настройки сбрасываются к значениям по умолчанию.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'Импортировать',
                    confirmTitle: 'Импортировать настройки?',
                    confirmMessage: 'Импорт заменит текущие настройки Notebook Navigator.',
                    backupToggleName: 'Сохранить текущие настройки в корне хранилища перед импортом',
                    backupToggleDesc: 'Создаёт JSON-файл с временной меткой в корне хранилища.',
                    successWithBackupNotice: 'Настройки импортированы. Предыдущие настройки сохранены в {path}.',
                    backupError: 'Не удалось сохранить текущие настройки: {message}',
                    successNotice: 'Настройки импортированы.',
                    errorNotice: 'Не удалось импортировать настройки: {message}',
                    fileReadError: 'Не удалось прочитать файл: {message}'
                },
                export: {
                    modalTitle: 'Экспорт настроек',
                    editorName: 'JSON',
                    editorDesc: 'Включены только настройки, отличающиеся от значений по умолчанию.',
                    placeholder: '{}',
                    copyButtonText: 'Копировать в буфер обмена',
                    downloadButtonText: 'Скачать',
                    copyNotice: 'Настройки скопированы в буфер обмена.',
                    downloadNotice: 'Настройки экспортированы.',
                    downloadError: 'Не удалось скачать настройки: {message}'
                }
            },
            resetAllSettings: {
                name: 'Сбросить все настройки',
                desc: 'Сбросить все настройки Notebook Navigator к значениям по умолчанию.',
                buttonText: 'Сбросить все настройки',
                confirmTitle: 'Сбросить все настройки?',
                confirmMessage: 'Это сбросит все настройки Notebook Navigator к значениям по умолчанию. Это нельзя отменить.',
                confirmButtonText: 'Сбросить все настройки',
                notice: 'Все настройки сброшены. Перезапустите Obsidian или переоткройте Notebook Navigator для применения.',
                error: 'Не удалось сбросить настройки.'
            },
            multiSelectModifier: {
                name: 'Модификатор множественного выбора',
                desc: 'Выберите, какая клавиша-модификатор переключает множественный выбор. При выборе Option/Alt, клик с Cmd/Ctrl открывает заметки в новой вкладке.',
                options: {
                    cmdCtrl: 'Клик с Cmd/Ctrl',
                    optionAlt: 'Клик с Option/Alt'
                }
            },
            enterToOpenFiles: {
                name: 'Нажать Enter для открытия файлов',
                desc: 'Открывать файлы только при нажатии Enter во время навигации по списку с клавиатуры. В macOS это не позволяет Enter переименовывать файлы.'
            },
            shiftEnterOpenContext: {
                name: 'Shift+Enter',
                desc: 'Выберите, будет ли Shift+Enter открывать или переименовывать выбранный файл.'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Enter',
                desc: 'Выберите, будет ли Cmd+Enter открывать или переименовывать выбранный файл.'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Enter',
                desc: 'Выберите, будет ли Ctrl+Enter открывать или переименовывать выбранный файл.'
            },
            mouseBackForwardAction: {
                name: 'Кнопки «Назад»/«Вперёд» мыши',
                desc: 'Действие кнопок «Назад» и «Вперёд» мыши на десктопе.',
                options: {
                    none: 'Использовать системное значение',
                    singlePaneSwitch: 'Переключение панелей (одна панель)',
                    history: 'Навигация по истории'
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
                desc: 'Выберите, что Notebook Navigator открывает автоматически при запуске.',
                current: 'Текущая: {path}',
                chooseButton: 'Выбрать файл',
                options: {
                    none: 'Нет',
                    file: 'Файл',
                    dailyNote: 'Ежедневная заметка',
                    weeklyNote: 'Еженедельная заметка',
                    monthlyNote: 'Ежемесячная заметка',
                    quarterlyNote: 'Ежеквартальная заметка',
                    yearlyNote: 'Ежегодная заметка'
                },
                file: {
                    name: 'Домашняя страница: Файл запуска',
                    empty: 'Файл не выбран'
                },
                createMissing: {
                    name: 'Домашняя страница: Создавать заметку, если отсутствует',
                    desc: 'Создаёт периодическую заметку при запуске или по команде, если её не существует.'
                }
            },
            excludedNotes: {
                name: 'Скрыть заметки по правилам свойств (профиль хранилища)',
                desc: 'Список правил frontmatter через запятую. Используйте записи `key` или `key=value` (например, status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'Скрыть файлы (профиль хранилища)',
                desc: 'Список шаблонов имён файлов через запятую для скрытия. Поддерживает подстановочные знаки * и пути / (например, temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Профиль хранилища',
                desc: 'Профили хранят видимость типов файлов, скрытые файлы, скрытые папки, скрытые теги, правила свойств для скрытых заметок, ярлыки и баннер навигации. Переключайте профили из заголовка панели навигации.',
                defaultName: 'По умолчанию',
                addButton: 'Добавить профиль',
                editProfilesButton: 'Редактировать профили',
                addProfileOption: 'Добавить профиль...',
                applyButton: 'Применить',
                deleteButton: 'Удалить профиль',
                addModalTitle: 'Добавить профиль',
                editProfilesModalTitle: 'Редактировать профили',
                addModalPlaceholder: 'Название профиля',
                deleteModalTitle: 'Удалить {name}',
                deleteModalMessage:
                    'Удалить {name}? Фильтры скрытых файлов, папок, тегов и заметок на основе свойств, сохранённые в этом профиле, будут удалены.',
                moveUp: 'Переместить вверх',
                moveDown: 'Переместить вниз',
                errors: {
                    emptyName: 'Введите название профиля',
                    duplicateName: 'Профиль с таким названием уже существует'
                }
            },
            vaultTitle: {
                name: 'Расположение названия хранилища',
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
            descendantExcludedFolders: {
                name: 'Исключать папки из заметок подпапок (профиль хранилища)',
                desc: 'Список папок через запятую, которые пропускаются при сборе заметок из подпапок. Папки остаются видимыми, и при выборе папки её заметки по-прежнему отображаются. Использует те же шаблоны, что и Скрыть папки.',
                placeholder: 'ежедневные, ресурсы, /archive'
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
            showFileProperties: {
                name: 'Показывать свойства файлов',
                desc: 'Отображать свойства в элементах файлов. Выберите отображаемые свойства в окне «Видимость ключей свойств».'
            },
            colorFileProperties: {
                name: 'Окрашивать свойства файлов',
                desc: 'Применять цвета свойств к значкам свойств на элементах файлов.'
            },
            prioritizeColoredFileProperties: {
                name: 'Показывать цветные свойства первыми',
                desc: 'Сортировать цветные свойства перед другими свойствами на элементах файлов.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Показывать свойства в компактном режиме',
                desc: 'Отображать свойства при активном компактном режиме.'
            },
            textCountDisplay: {
                name: 'Тип счётчика',
                desc: 'Выберите, какие счётчики заметок отображаются в элементах файлов.',
                options: {
                    none: 'Нет',
                    words: 'Количество слов',
                    characters: 'Количество символов',
                    both: 'Количество слов и символов'
                }
            },
            textCountPlacement: {
                name: 'Размещение',
                desc: 'Выберите, где отображаются счётчики заметок.',
                options: {
                    title: 'В заголовке',
                    property: 'Как свойство'
                }
            },
            characterCountSpaces: {
                name: 'Количество символов',
                desc: 'Выберите, учитывать ли пробелы в количестве символов.',
                options: {
                    include: 'С пробелами',
                    exclude: 'Без пробелов'
                }
            },
            wordCountTargetProperty: {
                name: 'Целевое свойство',
                desc: 'Ключ свойства frontmatter с целевым количеством слов. Оставьте пустым, чтобы скрыть цели.'
            },
            showWordCountPercentage: {
                name: 'Показывать процент цели',
                desc: 'Показывать только процент выполнения, когда доступно целевое количество слов.'
            },
            propertyFields: {
                name: 'Ключи свойств (профиль хранилища)',
                desc: 'Ключи свойств метаданных с настройкой видимости для каждого ключа в навигации и списке файлов.',
                addButtonTooltip: 'Настроить ключи свойств',
                noneConfigured: 'Свойства не настроены',
                singleConfigured: '1 свойство настроено: {properties}',
                multipleConfigured: '{count} свойств настроено: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'Показывать свойства в отдельных строках',
                desc: 'Показывать каждое свойство в собственной строке.'
            },
            enablePropertyInternalLinks: {
                name: 'Связать метки свойств с заметками',
                desc: 'Нажмите на метку свойства, чтобы открыть связанную заметку.'
            },
            enablePropertyExternalLinks: {
                name: 'Связать метки свойств с URL-адресами',
                desc: 'Нажмите на метку свойства, чтобы открыть связанный URL-адрес.'
            },
            dateFormat: {
                name: 'Формат даты',
                desc: 'Формат отображения дат (использует формат Moment).',
                placeholder: 'D MMMM YYYY',
                help: 'Распространённые форматы:\nD MMMM YYYY = 25 мая 2022\nDD.MM.YYYY = 25.05.2022\nYYYY-MM-DD = 2022-05-25\n\nТокены:\nYYYY/YY = год\nMMMM/MMM/MM = месяц\nDD/D = день\ndddd/ddd = день недели',
                helpTooltip: 'Формат Moment',
                momentLinkText: 'формат Moment'
            },
            timeFormat: {
                name: 'Формат времени',
                desc: 'Формат отображения времени (использует формат Moment).',
                placeholder: 'HH:mm',
                help: 'Распространённые форматы:\nHH:mm = 14:30 (24-часовой)\nh:mm a = 2:30 PM (12-часовой)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nТокены:\nHH/H = 24-часовой\nhh/h = 12-часовой\nmm = минуты\nss = секунды\na = AM/PM',
                helpTooltip: 'Формат Moment',
                momentLinkText: 'формат Moment'
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
            stripLatexInPreview: {
                name: 'Удалять LaTeX в превью',
                desc: 'Удалять встроенные и блочные выражения LaTeX из текста предпросмотра.'
            },
            previewProperties: {
                name: 'Свойства превью',
                desc: 'Список свойств frontmatter через запятую для проверки текста превью. Используется первое свойство с текстом.',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'Использовать содержимое заметки',
                desc: 'Показывать содержимое заметки как превью, когда ни одно из указанных свойств не содержит текста.'
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
                    '2': '2 строки',
                    '3': '3 строки'
                }
            },
            useFolderColor: {
                name: 'Использовать цвет папки',
                desc: 'Окрашивать заголовки заметок и значки файлов цветом родительской папки, когда не задан пользовательский цвет файла. Приоритет: пользовательский цвет файла > цвет папки > цвет по умолчанию.'
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
                desc: 'Список свойств frontmatter через запятую для проверки в первую очередь. При отсутствии используется первое изображение из содержимого markdown.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'Исключить заметки со свойствами',
                desc: 'Список свойств frontmatter через запятую. Заметки, содержащие любое из этих свойств, не сохраняют главные изображения.',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: 'Размер отображения изображения-обложки',
                desc: 'Максимальный размер отображения изображений-обложек в списках заметок.',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'Пиксельный размер изображения-обложки',
                desc: 'Разрешение, используемое при создании сохранённых миниатюр изображений-обложек. Увеличьте это значение, если крупные превью выглядят размытыми.',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'Загружать внешние изображения',
                desc: 'Загружать удалённые изображения и миниатюры YouTube для обложек.'
            },
            hideDrawingPreviewImages: {
                name: 'Скрыть экспортированные изображения предпросмотра',
                desc: 'Скрывает экспортированные PNG-файлы предпросмотра рисунков. Включите «Показать скрытые элементы», чтобы отобразить их.'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator показывает PNG-файлы, экспортированные Excalidraw, как предпросмотры рисунков.',
                items: [
                    'В **настройках Excalidraw** откройте **Embedding Excalidraw into your Notes and Exporting**, затем **Export Settings**, затем **Auto-export Settings**.',
                    'Включите **Auto-export PNG**. По желанию включите **Export both dark- and light-themed image**.',
                    'Notebook Navigator ищет **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** или **Drawing.excalidraw.light.png**.',
                    'Пока включён параметр **Скрыть экспортированные изображения предпросмотра**, PNG-файлы отображаются только при включённом **Показать скрытые элементы**.'
                ]
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
            folderSortOrder: {
                name: 'Сортировка папок',
                desc: 'Щёлкните правой кнопкой мыши по папке, чтобы задать другой порядок сортировки для её дочерних элементов.',
                options: {
                    alphaAsc: 'От А до Я',
                    alphaDesc: 'От Я до А'
                }
            },
            showNoteCount: {
                name: 'Показывать количество заметок',
                desc: 'Отображать количество заметок рядом с папками, тегами и свойствами.'
            },
            showSectionIcons: {
                name: 'Показывать иконки для ярлыков и недавних',
                desc: 'Отображать иконки рядом с элементами в разделах Ярлыки и Недавние.'
            },
            interfaceIcons: {
                name: 'Иконки интерфейса',
                desc: 'Редактировать иконки панели инструментов, папок, тегов, свойств, закреплённых, поиска и сортировки.',
                buttonText: 'Редактировать иконки'
            },
            showIconsColorOnly: {
                name: 'Применять цвет только к иконкам',
                desc: 'При включении пользовательские цвета применяются только к иконкам. При отключении цвета применяются и к иконкам, и к текстовым меткам.'
            },
            navRainbowMode: {
                name: 'Режим цветов радуги (профиль хранилища)',
                desc: 'Применить цвета радуги в панели навигации.',
                options: {
                    none: 'Выкл.',
                    foreground: 'Цвет текста',
                    background: 'Цвет фона'
                }
            },
            navRainbowFirstColor: {
                name: 'Первый цвет',
                desc: 'Первый цвет в радужном градиенте.'
            },
            navRainbowLastColor: {
                name: 'Последний цвет',
                desc: 'Последний цвет в радужном градиенте.'
            },
            navRainbowTransitionStyle: {
                name: 'Стиль перехода',
                desc: 'Интерполяция между первым и последним цветом.',
                options: {
                    hue: 'Тон',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'Применить к ярлыкам',
                desc: 'Применить цвета радуги к ярлыкам.'
            },
            navRainbowApplyToRecent: {
                name: 'Применить к недавним элементам',
                desc: 'Применить цвета радуги к недавним элементам.'
            },
            navRainbowApplyToFolders: {
                name: 'Применить к папкам',
                desc: 'Применить цвета радуги к папкам.'
            },
            navRainbowFolderScope: {
                name: 'Область папок',
                desc: 'Выбрать уровни папок для начала назначения цветов.',
                options: {
                    root: 'Корневой уровень',
                    child: 'Дочерний уровень',
                    all: 'Каждый уровень'
                }
            },
            navRainbowApplyToTags: {
                name: 'Применить к тегам',
                desc: 'Применить цвета радуги к тегам.'
            },
            navRainbowTagScope: {
                name: 'Область тегов',
                desc: 'Выбрать уровни тегов для начала назначения цветов.',
                options: {
                    root: 'Корневой уровень',
                    child: 'Дочерний уровень',
                    all: 'Каждый уровень'
                }
            },
            navRainbowApplyToProperties: {
                name: 'Применить к свойствам',
                desc: 'Применить цвета радуги к свойствам.'
            },
            navRainbowBalanceHueLuminance: {
                name: 'Равномерная яркость между оттенками', // (English: Consistent brightness across hues)
                desc: 'Интерполирует яркость между начальным и конечным цветами при переходах оттенков.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'Раздельные цвета для светлого и тёмного режимов', // (English: Separate light and dark mode colors)
                desc: 'Использовать разные цвета радуги для светлого и тёмного режимов.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'Копировать цвет светлого режима в тёмный режим', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'Область свойств',
                desc: 'Выбрать уровни свойств для начала назначения цветов.',
                options: {
                    root: 'Корневой уровень',
                    child: 'Дочерний уровень',
                    all: 'Каждый уровень'
                }
            },
            collapseBehavior: {
                name: 'Сворачивание элементов',
                desc: 'Выберите, на что влияет кнопка развернуть/свернуть всё.',
                options: {
                    all: 'Все',
                    foldersOnly: 'Только папки',
                    tagsOnly: 'Только теги',
                    propertiesOnly: 'Только свойства'
                }
            },
            smartCollapse: {
                name: 'Сохранять выбранный элемент развёрнутым',
                desc: 'При сворачивании сохранять выбранный элемент и его родителей развёрнутыми.'
            },
            excludeVaultRootFromCollapse: {
                name: 'Пропускать корень хранилища при сворачивании',
                desc: 'При сворачивании всех элементов оставлять корневую папку хранилища в текущем состоянии.'
            },
            navIndent: {
                name: 'Отступ дерева',
                desc: 'Настройте ширину отступа для вложенных папок, тегов и свойств (в пикселях).'
            },
            navItemHeight: {
                name: 'Высота элемента',
                desc: 'Настройте высоту папок, тегов и свойств в панели навигации (в пикселях).'
            },
            navItemHeightScaleText: {
                name: 'Масштабировать текст с высотой элемента',
                desc: 'Уменьшать размер текста навигации при уменьшении высоты элемента.'
            },
            showIndentGuides: {
                name: 'Показать направляющие отступов',
                desc: 'Отображать направляющие отступов для вложенных папок, тегов и свойств.'
            },
            navCountLeaderStyle: {
                name: 'Показать заполнители',
                desc: 'Отображать точки, тире или линию между названиями элементов и количеством заметок.',
                options: {
                    none: 'Нет',
                    dots: 'Точки (...)',
                    dashes: 'Тире (---)',
                    line: 'Линия'
                }
            },
            navRootSpacing: {
                name: 'Отступ корневых элементов',
                desc: 'Отступ между корневыми папками, тегами и свойствами (в пикселях).'
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
                desc: 'Щёлкните правой кнопкой мыши по тегу, чтобы задать другой порядок сортировки для его дочерних элементов.',
                options: {
                    alphaAsc: 'От А до Я',
                    alphaDesc: 'От Я до А',
                    frequency: 'По частоте',
                    lowToHigh: 'от низкой к высокой',
                    highToLow: 'от высокой к низкой'
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
            scopeTagsToCurrentContext: {
                name: 'Фильтровать теги по выбору',
                desc: 'Показывать только теги, встречающиеся в заметках в выбранной папке или свойстве.'
            },
            keepEmptyTagsProperty: {
                name: 'Сохранять свойство tags после удаления последнего тега',
                desc: 'Сохранять свойство tags в frontmatter, когда все теги удалены. При отключении свойство tags удаляется из frontmatter.'
            },
            showProperties: {
                name: 'Показать свойства',
                desc: 'Отображать раздел свойств в навигаторе.',
                propertyKeysInfoPrefix: 'Настроить свойства в ',
                propertyKeysInfoLinkText: 'Начало > Ключи свойств',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'Показать значки свойств',
                desc: 'Отображать значки рядом со свойствами в панели навигации.'
            },
            inheritPropertyColors: {
                name: 'Наследовать цвета свойств',
                desc: 'Значения свойств наследуют цвет и фон от ключа свойства.'
            },
            propertySortOrder: {
                name: 'Порядок сортировки свойств',
                desc: 'Щёлкните правой кнопкой мыши по свойству, чтобы задать другой порядок сортировки его значений.',
                options: {
                    alphaAsc: 'А до Я',
                    alphaDesc: 'Я до А',
                    frequency: 'Частота',
                    lowToHigh: 'по возрастанию',
                    highToLow: 'по убыванию'
                }
            },
            showAllPropertiesFolder: {
                name: 'Показать папку свойств',
                desc: 'Отображать «Свойства» как сворачиваемую папку.'
            },
            scopePropertiesToCurrentContext: {
                name: 'Фильтровать свойства по выбору',
                desc: 'Показывать только свойства, встречающиеся в заметках в выбранной папке или теге.'
            },
            hiddenTags: {
                name: 'Скрыть теги (профиль хранилища)',
                desc: 'Список шаблонов тегов через запятую. Шаблоны имён: тег* (начинается с), *тег (заканчивается на). Шаблоны путей: архив (тег и потомки), архив/* (только потомки), проекты/*/черновики (подстановочный знак в середине).',
                placeholder: 'архив*, *черновик, проекты/*/старые'
            },
            hiddenFileTags: {
                name: 'Скрыть заметки с тегами (профиль хранилища)',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'Включить заметки папок',
                desc: 'Папки с соответствующим файлом заметки отображаются как кликабельные ссылки.'
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
            folderNoteNamePattern: {
                name: 'Шаблон названия заметки папки',
                desc: 'Шаблон имени заметок папок без расширения. Используйте {{folder}} для вставки имени папки. Если задан, имя заметки папки не применяется.'
            },
            folderNoteTemplate: {
                name: 'Шаблон заметки папки',
                desc: 'Файл шаблона, используемый при создании заметок папок. Шаблоны Markdown могут использовать Templater. Шаблоны Canvas и Base копируются как содержимое файла. Укажите расположение папки шаблонов в Операции с файлами > Шаблоны.',
                formatWarning: 'Формат шаблона должен соответствовать выбранному типу заметки папки: .md, .canvas или .base.'
            },
            enableFolderNoteLinks: {
                name: 'Названия папок открывают заметки папок',
                desc: 'Нажатие на название папки открывает её заметку папки. Если выключено, заметки папок предоставляют только метаданные папки, такие как название, значок и цвет.'
            },
            hideFolderNoteInList: {
                name: 'Скрывать заметку папки в списке',
                desc: 'Скрыть заметки папок из списка файлов.'
            },
            pinCreatedFolderNote: {
                name: 'Закреплять созданные заметки папок',
                desc: 'Закреплять заметки папок при создании из контекстного меню.'
            },
            folderNoteOpenLocation: {
                name: 'Открывать заметки папок в',
                desc: 'Выберите, где открываются заметки папок при нажатии на ссылки заметок папок.',
                options: {
                    currentTab: 'Текущая вкладка',
                    newTab: 'Новая вкладка',
                    rightSidebar: 'Правая боковая панель'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: 'Правая боковая панель: показывать ближайшую заметку папки',
                desc: 'Когда выбрана папка, правая боковая панель автоматически показывает ближайшую родительскую заметку папки.'
            },
            confirmBeforeDelete: {
                name: 'Подтверждать перед удалением',
                desc: 'Показывать диалог подтверждения при удалении заметок или папок'
            },
            deleteAttachments: {
                name: 'Удалять вложения при удалении файлов',
                desc: 'Автоматически удалять связанные вложения и сгенерированные предпросмотры рисунков, если они не используются в другом месте',
                options: {
                    ask: 'Спрашивать каждый раз',
                    always: 'Всегда',
                    never: 'Никогда'
                }
            },
            moveFileConflicts: {
                name: 'Конфликты перемещения',
                desc: 'При перемещении файла в папку, где уже существует файл с таким же именем. Спрашивать каждый раз (переименовать, перезаписать, отменить) или всегда переименовывать.',
                options: {
                    ask: 'Спрашивать каждый раз',
                    rename: 'Всегда переименовывать'
                }
            },
            metadataCleanup: {
                name: 'Очистка метаданных',
                desc: 'Удаляет осиротевшие метаданные, оставшиеся после удаления, перемещения или переименования файлов, папок, тегов или свойств вне Obsidian. Это влияет только на файл настроек Notebook Navigator.',
                buttonText: 'Очистить метаданные',
                error: 'Ошибка очистки настроек',
                loading: 'Проверка метаданных...',
                statusClean: 'Нет метаданных для очистки',
                statusCounts:
                    'Осиротевшие элементы: {folders} папок, {tags} тегов, {properties} свойств, {files} файлов, {pinned} закреплённых, {separators} разделителей'
            },
            rebuildCache: {
                name: 'Пересобрать кэш',
                desc: 'Используйте, если вы испытываете проблемы с отсутствующими тегами, некорректными превью или отсутствующими изображениями. Это может произойти после конфликтов синхронизации или неожиданных закрытий.',
                buttonText: 'Пересобрать кэш',
                error: 'Не удалось пересобрать кэш',
                indexingTitle: 'Индексирование хранилища...',
                progress: 'Обновление кэша Notebook Navigator.'
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
            frontmatterBackgroundField: {
                name: 'Поле фона',
                desc: 'Поле frontmatter для цветов фона. Оставьте пустым для использования цветов фона из настроек.',
                placeholder: 'background'
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
                placeholder: 'title, name'
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
                desc: 'Формат для разбора временных меток во frontmatter. Оставьте пустым для использования парсинга ISO 8601.',
                helpTooltip: 'Формат Moment',
                momentLinkText: 'формат Moment',
                help: 'Распространённые форматы:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'Поддержать разработку',
                desc: 'Если вам нравится использовать Notebook Navigator, пожалуйста, рассмотрите возможность поддержки его дальнейшей разработки.',
                buttonText: '❤️ Спонсор',
                coffeeButton: '☕️ Купить кофе'
            },
            updateCheckOnStart: {
                name: 'Проверять новую версию при запуске',
                desc: 'Проверяет наличие новых релизов плагина при запуске и показывает уведомление, когда доступно обновление. Проверки происходят не чаще одного раза в день.',
                status: 'Доступна новая версия: {version}'
            },
            debugLogging: {
                name: 'Журнал отладки запуска',
                desc: 'Записывает диагностику запуска в Markdown-файл с временной меткой в корне хранилища, затем останавливается после стабилизации запуска. Файл может синхронизироваться и содержать пути к файлам.'
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
        openBannerImage: 'Открыть изображение баннера релиза',
        supportMessage: 'Если вы находите Notebook Navigator полезным, пожалуйста, рассмотрите возможность поддержки его разработки.',
        supportButton: 'Купить кофе',
        thanksButton: 'Спасибо!'
    }
};
