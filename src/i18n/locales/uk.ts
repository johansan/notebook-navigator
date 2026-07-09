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
        restoreDefault: 'Відновити за замовчуванням', // Button text for restoring values to defaults (English: Restore default)
        submit: 'Надіслати', // Button text for submitting forms and dialogs (English: Submit)
        save: 'Зберегти', // Button text for saving settings and dialogs (English: Save)
        configure: 'Налаштувати', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'Світлий режим', // Label for light theme mode (English: Light mode)
        darkMode: 'Темний режим', // Label for dark theme mode (English: Dark mode)
        noSelection: 'Нічого не вибрано', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Без тегів', // Label for notes without any tags (English: Untagged)
        featureImageAlt: 'Головне зображення', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Невідома помилка', // Generic fallback when an error has no message (English: Unknown error)
        clipboardWriteError: 'Не вдалося записати в буфер обміну',
        updateBannerTitle: 'Доступне оновлення Notebook Navigator',
        updateBannerInstruction: 'Оновіть у Налаштування -> Плагіни спільноти',
        previous: 'Назад', // Generic aria label for previous navigation (English: Previous)
        next: 'Вперед' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Виберіть папку або тег для перегляду нотаток', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Немає нотаток', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Закріплені', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Нотатки', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Файли', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (приховано)', // Accessibility label applied to list items that are normally hidden
        collapseGroup: 'Згорнути групу',
        expandGroup: 'Розгорнути групу',
        manualSortTitle: 'Ручне сортування: {property}',
        manualSortHint:
            'Перетягуйте для зміни порядку. Порядок зберігається у вигляді числових значень індексу у властивості «{property}».',
        manualSortNonMarkdownHint: 'Файли, відмінні від Markdown, показуються внизу, і їхній порядок не можна змінити.',
        unsortedSection: 'Без сортування',
        manualSortDone: 'Готово',
        manualSortMultipleWriteFailure: '{count} файлів не вдалося обробити; перший: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Без тегів', // Label for the special item showing notes without tags (English: Untagged)
        tags: 'Теги' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Ярлики', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentFilesHeader: 'Останні файли', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Властивості',
        reorderRootFoldersTitle: 'Змінити порядок навігації',
        reorderRootFoldersHint: 'Використовуйте стрілки або перетягування',
        vaultRootLabel: 'Сховище',
        resetRootToAlpha: 'Скинути до алфавітного порядку',
        resetRootToFrequency: 'Скинути до порядку за частотою',
        pinShortcuts: 'Закріпити ярлики',
        pinShortcutsAndRecentFiles: 'Закріпити ярлики та останні файли',
        unpinShortcuts: 'Відкріпити ярлики',
        unpinShortcutsAndRecentFiles: 'Відкріпити ярлики та останні файли',
        profileMenuAria: 'Змінити профіль сховища'
    },

    navigationCalendar: {
        ariaLabel: 'Календар',
        dailyNotesNotEnabled: 'Плагін щоденних нотаток не увімкнено.',
        createDailyNote: {
            title: 'Нова щоденна нотатка',
            message: 'Файл {filename} не існує. Бажаєте створити його?',
            confirmButton: 'Створити'
        },
        helpModal: {
            title: 'Гарячі клавіші календаря',
            items: [
                'Натисніть на будь-який день, щоб відкрити або створити щоденну нотатку. Тижні, місяці, квартали та роки працюють так само.',
                'Зафарбована крапка під днем означає наявність нотатки. Порожня крапка означає наявність незавершених завдань.',
                'Якщо нотатка має головне зображення, воно відображається як фон дня.'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+клік на даті для фільтрації за цією датою у списку файлів.',
            dateFilterOptionAlt: '`Option/Alt`+клік на даті для фільтрації за цією датою у списку файлів.'
        }
    },

    dailyNotes: {
        templateReadFailed: 'Не вдалося прочитати шаблон щоденної нотатки.',
        createFailed: 'Неможливо створити щоденну нотатку.'
    },

    shortcuts: {
        folderExists: 'Папка вже в ярликах',
        noteExists: 'Нотатка вже в ярликах',
        tagExists: 'Тег вже в ярликах',
        propertyExists: 'Властивість вже є в закладках',
        invalidProperty: 'Недійсне закладка властивості',
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
        showCalendar: 'Показати календар',
        hideCalendar: 'Сховати календар',
        newFolder: 'Нова папка', // Tooltip for create new folder button (English: New folder)
        newNote: 'Нова нотатка', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Назад до навігації', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeChildSortOrder: 'Змінити порядок сортування',
        changeSortAndGroup: 'Змінити сортування та групування',
        resetViewToDefaults: 'Скинути вигляд до стандартних налаштувань',
        manualSort: 'Ручне сортування',
        editSortOrder: 'Редагувати порядок сортування...',
        removeSortProperty: 'Вилучити властивість сортування',
        descendants: 'нащадків',
        subfolders: 'підпапок',
        subtags: 'підтегів',
        childValues: 'дочірніх значень',
        applySortAndGroupToDescendants: (target: string) => `Застосувати сортування та групування для ${target}`,
        applyAppearanceToDescendants: (target: string) => `Застосувати оформлення для ${target}`,
        showFolders: 'Показати навігацію', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: 'Змінити порядок навігації',
        finishRootFolderReorder: 'Готово',
        showExcludedItems: 'Показати приховані папки, теги та нотатки', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Сховати приховані папки, теги та нотатки', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Показати подвійну панель', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Показати одну панель', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            'Дві панелі недоступні, коли бічна панель занадто вузька. Щоб змінити це, установіть «Коли бічна панель занадто вузька» на «Нічого не робити» в Налаштування > Вигляд і поведінка.',
        changeAppearance: 'Змінити вигляд', // Tooltip for button to change folder appearance settings (English: Change appearance)
        showNotesFromSubfolders: 'Показати нотатки з підпапок',
        showFilesFromSubfolders: 'Показати файли з підпапок',
        showNotesFromDescendants: 'Показати нотатки з нащадків',
        showFilesFromDescendants: 'Показати файли з нащадків',
        search: 'Пошук' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Пошук...', // Placeholder text for search input (English: Search...)
        placeholderVault: 'Пошук у сховищі...',
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Очистити пошук', // Tooltip for clear search button (English: Clear search)
        switchToFilterSearch: 'Перемкнути на пошук з фільтром',
        switchToOmnisearch: 'Перемкнути на Omnisearch',
        saveSearchShortcut: 'Зберегти ярлик пошуку',
        removeSearchShortcut: 'Вилучити ярлик пошуку',
        shortcutModalTitle: 'Зберегти ярлик пошуку',
        shortcutNamePlaceholder: 'Введіть назву ярлика',
        shortcutStartIn: 'Завжди починати в: {path}',
        searchHelp: 'Синтаксис пошуку',
        searchHelpTitle: 'Синтаксис пошуку',
        searchHelpModal: {
            intro: 'Комбінуйте імена файлів, властивості, теги, дати та фільтри в одному запиті (напр. `meeting .status=active #work @thisweek`). Встановіть плагін Omnisearch для повнотекстового пошуку.',
            introSwitching:
                'Перемикайтеся між пошуком за фільтром та Omnisearch за допомогою клавіш стрілок вгору/вниз або натиснувши на значок пошуку.',
            sections: {
                fileNames: {
                    title: 'Імена файлів',
                    items: [
                        '`word` Знайти нотатки зі словом "word" в імені файлу.',
                        '`word1 word2` Кожне слово має відповідати імені файлу.',
                        '`-word` Виключити нотатки зі словом "word" в імені файлу.'
                    ]
                },
                tags: {
                    title: 'Теги',
                    items: [
                        '`#tag` Включити нотатки з тегом (також знаходить вкладені теги як `#tag/subtag`).',
                        '`#` Включити лише нотатки з тегами.',
                        '`-#tag` Виключити нотатки з тегом.',
                        '`-#` Включити лише нотатки без тегів.',
                        '`#tag1 #tag2` Знайти обидва теги (неявне AND).',
                        '`#tag1 AND #tag2` Знайти обидва теги (явне AND).',
                        '`#tag1 OR #tag2` Знайти будь-який з тегів.',
                        '`#a OR #b AND #c` AND має більший пріоритет: знаходить `#a`, або обидва `#b` і `#c`.',
                        'Cmd/Ctrl+Клік по тегу для додавання з AND. Cmd/Ctrl+Shift+Клік для додавання з OR.'
                    ]
                },
                properties: {
                    title: 'Властивості',
                    items: [
                        '`.key` Включити нотатки з ключем властивості.',
                        '`.key=value` Включити нотатки, у яких значення властивості містить `value`.',
                        '`."Reading Status"` Включити нотатки з ключем властивості, що містить пробіли.',
                        '`."Reading Status"="In Progress"` Ключі та значення з пробілами повинні бути в подвійних лапках.',
                        '`-.key` Виключити нотатки з ключем властивості.',
                        '`-.key=value` Виключити нотатки, у яких значення властивості містить `value`.',
                        'Cmd/Ctrl+Клік на властивість для додавання з AND. Cmd/Ctrl+Shift+Клік для додавання з OR.'
                    ]
                },
                tasks: {
                    title: 'Фільтри',
                    items: [
                        '`has:task` Включити нотатки з незавершеними завданнями.',
                        '`-has:task` Виключити нотатки з незавершеними завданнями.',
                        '`folder:meetings` Включити нотатки, де назва папки містить `meetings`.',
                        '`folder:/work/meetings` Включити нотатки лише в `work/meetings` (не підпапки).',
                        '`folder:/` Включити нотатки лише в корені сховища.',
                        '`-folder:archive` Виключити нотатки, де назва папки містить `archive`.',
                        '`-folder:/archive` Виключити нотатки лише в `archive` (не підпапки).',
                        '`ext:md` Включити нотатки з розширенням `md` (`ext:.md` також підтримується).',
                        '`-ext:pdf` Виключити нотатки з розширенням `pdf`.',
                        'Поєднуйте з тегами, назвами та датами (наприклад: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'Поведінка AND/OR',
                    items: [
                        '`AND` та `OR` є операторами лише в запитах, що складаються виключно з тегів та властивостей.',
                        'Запити виключно з тегів та властивостей містять лише фільтри тегів та властивостей: `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`.',
                        'Якщо запит включає імена, дати (`@...`), фільтри завдань (`has:task`), фільтри папок (`folder:...`) або фільтри розширень (`ext:...`), `AND` та `OR` шукаються як слова.',
                        'Приклад запиту з операторами: `#work OR .status=started`.',
                        'Приклад змішаного запиту: `#work OR ext:md` (`OR` шукається в іменах файлів).'
                    ]
                },
                dates: {
                    title: 'Дати',
                    items: [
                        '`@today` Знайти нотатки за сьогодні, використовуючи поле дати за замовчуванням.',
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` Відносні діапазони дат.',
                        '`@2026-02-07` Знайти конкретний день (також підтримує `@20260207`).',
                        '`@2026` Знайти календарний рік.',
                        '`@2026-02` або `@202602` Знайти календарний місяць.',
                        '`@2026-W05` або `@2026W05` Знайти ISO-тиждень.',
                        '`@2026-Q2` або `@2026Q2` Знайти календарний квартал.',
                        '`@13/02/2026` Числові формати з роздільниками (`@07022026` слідує вашій локалі при неоднозначності).',
                        '`@2026-02-01..2026-02-07` Знайти включний діапазон днів (відкриті кінці підтримуються).',
                        '`@c:...` або `@m:...` Вказати дату створення або зміни.',
                        '`-@...` Виключити збіг дати.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'Повнотекстовий пошук по всьому сховищу з фільтрацією за поточною папкою або вибраними тегами.',
                        'Може бути повільним при менш ніж 3 символах у великих сховищах.',
                        'Не може шукати шляхи з не-ASCII символами або коректно шукати підшляхи.',
                        "Повертає обмежені результати до фільтрації за папками, тому релевантні файли можуть не з'явитися, якщо багато збігів в інших місцях.",
                        'Попередній перегляд нотаток показує фрагменти Omnisearch замість тексту попереднього перегляду за замовчуванням.'
                    ]
                }
            }
        }
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
            openInDefaultApp: 'Відкрити у стандартному додатку',
            renameNote: 'Перейменувати нотатку',
            renameFile: 'Перейменувати файл',
            deleteNote: 'Видалити нотатку',
            deleteFile: 'Видалити файл',
            setCalendarHighlight: 'Встановити виділення',
            removeCalendarHighlight: 'Прибрати виділення',
            deleteMultipleNotes: 'Видалити {count} нотаток',
            deleteMultipleFiles: 'Видалити {count} файлів',
            moveNoteToFolder: 'Перемістити нотатку до...',
            moveFileToFolder: 'Перемістити файл до...',
            moveMultipleNotesToFolder: 'Перемістити {count} нотаток до...',
            moveMultipleFilesToFolder: 'Перемістити {count} файлів до...',
            mergeNotes: 'Об’єднати {count} нотаток...',
            mergeNotesInGroup: 'Об’єднати нотатки в групі...',
            setManualSortGroupHeader: 'Встановити заголовок групи',
            changeManualSortGroupHeader: 'Змінити заголовок групи',
            manualSortGroupHeader: {
                title: 'Заголовок групи',
                copyStyle: 'Копіювати стиль заголовка',
                pasteStyle: 'Вставити стиль заголовка',
                remove: 'Вилучити заголовок групи'
            },
            addTag: 'Додати тег',
            addPropertyKey: 'Встановити властивість',
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
            createFolderNote: 'Створити нотатку папки',
            detachFolderNote: "Від'єднати нотатку папки",
            deleteFolderNote: 'Видалити нотатку папки',
            changeIcon: 'Змінити іконку',
            changeColor: 'Змінити колір',
            changeBackground: 'Змінити фон',
            excludeFolder: 'Сховати папку',
            unhideFolder: 'Показати папку',
            excludeFromDescendants: 'Сховати в батьківських папках',
            includeInDescendants: 'Показати в батьківських папках',
            hiddenFromParentsIndicator: 'Сховано зі списків батьківських папок',
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
        property: {
            addKey: 'Налаштувати ключі властивостей',
            renameKey: 'Перейменувати властивість',
            deleteKey: 'Видалити властивість'
        },
        navigation: {
            addSeparator: 'Додати роздільник',
            removeSeparator: 'Вилучити роздільник'
        },
        copyPath: {
            title: 'Копіювати шлях',
            asObsidianUrl: 'як URL Obsidian',
            fromVaultFolder: 'з папки сховища',
            fromSystemRoot: 'з кореня системи'
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
        appearance: 'Вигляд',
        sortBy: 'Сортувати за',
        standardPreset: 'Стандартний',
        compactPreset: 'Компактний',
        defaultSuffix: '(за замовчуванням)',
        defaultLabel: 'За замовчуванням',
        titleRows: 'Рядки заголовка',
        previewRows: 'Рядки попереднього перегляду',
        groupBy: 'Групувати за',
        titleRowOption: (rows: number) => `${rows} ${rows === 1 ? 'рядок' : rows < 5 ? 'рядки' : 'рядків'} заголовка`,
        previewRowOption: (rows: number) => `${rows} ${rows === 1 ? 'рядок' : rows < 5 ? 'рядки' : 'рядків'} попереднього перегляду`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Застосувати',
            applySortAndGroupTitle: (target: string) => `Застосувати сортування та групування для ${target}?`,
            applyAppearanceTitle: (target: string) => `Застосувати оформлення для ${target}?`,
            affectedCountMessage: (count: number) => `Наявних перевизначень, які зміняться: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'Використати ручне сортування?',
            propertySortMessage: (property: string, count: number) =>
                `Перемикає поточний вигляд на ручне сортування з використанням «${property}». Редагування порядку записує числові значення індексу в цю властивість у ${count} ${count === 1 ? 'нотатці' : 'нотатках'} за потреби.`,
            propertySortConfirmButton: 'Використати ручне сортування',
            removePropertyTitle: 'Вилучити властивість сортування?',
            removePropertyMessage: (property: string, count: number) =>
                `Це вилучить «${property}» з ${count} ${count === 1 ? 'нотатки' : count < 5 ? 'нотаток' : 'нотаток'} у поточному списку. Порядок ручного сортування буде очищено для цих нотаток.`,
            removePropertyConfirmButton: 'Вилучити властивість',
            compactTitle: 'Стиснути значення індексу?',
            compactMessage: (count: number) =>
                `Це перевпорядкування потребує більше числового простору. ${count} ${count === 1 ? 'нотатка отримає' : 'нотаток отримають'} нові значення індексу.`,
            compactConfirmButton: 'Стиснути значення індексу'
        },
        manualSortGroupHeader: {
            title: 'Встановити заголовок групи',
            titleLabel: 'Заголовок',
            placeholder: 'Заголовок групи',
            icon: 'Значок',
            color: 'Колір',
            wordCount: 'Показувати кількість слів',
            wordCountTarget: 'Цільова кількість слів',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'Коли це поле порожнє, ціль групи використовує цільову властивість, задану в Налаштування > Нотатки > Кількість слів і символів. Перевизначте її, задавши цільове значення для цієї групи.',
            description: 'Налаштуйте заголовок групи для цієї нотатки. Залиште заголовок порожнім, щоб видалити його.'
        },
        mergeNotes: {
            title: 'Об’єднати нотатки',
            summary: 'Створити одну нотатку з {count} нотаток у {folder}.',
            frontmatterRule: 'Frontmatter першої нотатки зберігається. Frontmatter інших нотаток видаляється.',
            crossFolderWarning:
                'Вихідні нотатки розташовані в різних папках. Відносні посилання та вбудування можуть перестати працювати в об’єднаній нотатці.',
            outputName: 'Назва результату',
            outputNameDesc: 'Об’єднана нотатка буде створена в папці, показаній вище.',
            outputNamePlaceholder: 'Об’єднані нотатки',
            separator: 'Розділювач',
            separatorDesc: 'Вставляється між нотатками.',
            separatorOptions: {
                none: 'Немає',
                blankLine: 'Порожній рядок',
                horizontalRule: 'Горизонтальна лінія',
                heading: 'Заголовок із назвою нотатки'
            },
            moveSourcesToTrash: 'Перемістити вихідні нотатки до кошика після об’єднання',
            mergeButton: 'Об’єднати'
        },
        navRainbowSection: {
            title: (section: string) => `Кольори веселки: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'Пошук іконок...',
            recentlyUsedHeader: 'Нещодавно використані',
            emptyStateSearch: 'Почніть вводити для пошуку іконок',
            emptyStateNoResults: 'Іконок не знайдено',
            showingResultsInfo: 'Показано 50 з {count} результатів. Введіть більше для уточнення.',
            emojiInstructions: 'Введіть або вставте будь-який емодзі для використання як іконки',
            removeIcon: 'Вилучити іконку',
            removeFromRecents: 'Видалити з нещодавніх',
            allTabLabel: 'Всі'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Додати правило'
        },
        interfaceIcons: {
            title: 'Іконки інтерфейсу',
            fileItemsSection: 'Елементи файлу',
            items: {
                'nav-shortcuts': 'Ярлики',
                'nav-recent-files': 'Нещодавні файли',
                'nav-expand-all': 'Розгорнути все',
                'nav-collapse-all': 'Згорнути все',
                'nav-calendar': 'Календар',
                'nav-tree-expand': 'Стрілка дерева: розгорнути',
                'nav-tree-collapse': 'Стрілка дерева: згорнути',
                'nav-hidden-items': 'Приховані елементи',
                'nav-root-reorder': 'Змінити порядок кореневих папок',
                'nav-new-folder': 'Нова папка',
                'nav-show-single-pane': 'Показати одну панель',
                'nav-show-dual-pane': 'Показати подвійну панель',
                'nav-profile-chevron': 'Стрілка меню профілю',
                'list-search': 'Пошук',
                'list-reveal-file': 'Показати файл',
                'list-descendants': 'Нотатки з підпапок',
                'list-sort-ascending': 'Порядок сортування: за зростанням',
                'list-sort-descending': 'Порядок сортування: за спаданням',
                'list-sort-modified': 'Сортувати за датою зміни',
                'list-sort-created': 'Сортувати за датою створення',
                'list-sort-title': 'Сортувати за заголовком',
                'list-sort-filename': 'Сортувати за іменем файлу',
                'list-sort-property': 'Сортувати за властивістю',
                'list-appearance': 'Змінити вигляд',
                'list-new-note': 'Нова нотатка',
                'list-pinned': 'Закріплені нотатки',
                'nav-folder-open': 'Папка відкрита',
                'nav-folder-closed': 'Папка закрита',
                'nav-tags': 'Теги',
                'nav-tag': 'Тег',
                'nav-properties': 'Властивості',
                'nav-property': 'Властивість',
                'nav-property-value': 'Значення',
                'file-unfinished-task': 'Незавершені завдання',
                'file-word-count': 'Кількість слів',
                'file-character-count': 'Кількість символів'
            }
        },
        colorPicker: {
            currentColor: 'Поточний',
            newColor: 'Новий',
            paletteDefault: 'За замовчуванням',
            paletteCustom: 'Власні',
            copyColors: 'Копіювати колір',
            colorsCopied: 'Колір скопійовано в буфер обміну',
            pasteColors: 'Вставити колір',
            pasteClipboardError: 'Не вдалося прочитати буфер обміну',
            pasteInvalidFormat: 'Очікується hex-значення кольору',
            colorsPasted: 'Колір успішно вставлено',
            resetUserColors: 'Очистити власні кольори',
            clearCustomColorsConfirm: 'Видалити всі власні кольори?',
            userColorSlot: 'Колір {slot}',
            recentColors: 'Останні кольори',
            clearRecentColors: 'Очистити останні кольори',
            removeRecentColor: 'Вилучити колір',
            apply: 'Застосувати',
            pickerLabel: 'Вибір',
            hexLabel: 'HEX',
            hexInputLabel: 'HEX-значення кольору',
            saturationValueArea: 'Насиченість і яскравість',
            hueSlider: 'Відтінок',
            alphaSlider: 'Прозорість'
        },
        appearance: {
            tabIcon: 'Значок',
            tabColor: 'Колір',
            tabBackground: 'Фон',
            resetIcon: 'Видалити іконку',
            resetColor: 'Видалити колір',
            resetBackground: 'Видалити фон',
            clear: 'Очистити стиль',
            apply: 'Застосувати'
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
            renameBatchNotFinalized: 'Перейменовано {renamed}/{total}. Не оновлено: {notUpdated}. Метадані та ярлики не були оновлені.',
            invalidTagName: 'Введіть дійсну назву тегу.',
            descendantRenameError: 'Неможливо перемістити тег у себе або в нащадка.',
            confirmDelete: 'Видалити тег',
            deleteBatchNotFinalized: 'Видалено з {removed}/{total}. Не оновлено: {notUpdated}. Метадані та ярлики не були оновлені.',
            checkConsoleForDetails: 'Деталі в консолі.',
            file: 'файл',
            files: 'файлів',
            inlineParsingWarning: {
                title: 'Сумісність вбудованих тегів',
                message: '{tag} містить символи, які Obsidian не може обробити у вбудованих тегах. Теги Frontmatter не зачеплені.',
                confirm: 'Використати все одно'
            }
        },
        propertyOperation: {
            renameTitle: 'Перейменувати властивість {property}',
            deleteTitle: 'Видалити властивість {property}',
            newKeyPrompt: 'Нова назва властивості',
            newKeyPlaceholder: 'Введіть нову назву властивості',
            renameWarning: 'Перейменування властивості {property} змінить {count} {files}.',
            renameConflictWarning:
                'Властивість {newKey} вже існує в {count} {files}. Перейменування {oldKey} замінить наявні значення {newKey}.',
            deleteWarning: 'Видалення властивості {property} змінить {count} {files}.',
            confirmRename: 'Перейменувати властивість',
            confirmDelete: 'Видалити властивість',
            renameNoChanges: '{oldKey} → {newKey} (без змін)',
            renameSettingsUpdateFailed: 'Властивість {oldKey} → {newKey} перейменовано. Не вдалося оновити налаштування.',
            deleteSingleSuccess: 'Властивість {property} видалено з 1 нотатки',
            deleteMultipleSuccess: 'Властивість {property} видалено з {count} нотаток',
            deleteSettingsUpdateFailed: 'Властивість {property} видалено. Не вдалося оновити налаштування.',
            invalidKeyName: 'Введіть допустиму назву властивості.'
        },
        fileSystem: {
            newFolderTitle: 'Нова папка',
            renameFolderTitle: 'Перейменувати папку',
            renameFileTitle: 'Перейменувати файл',
            deleteFolderTitle: "Видалити '{name}'?",
            deleteFileTitle: "Видалити '{name}'?",
            deleteFileAttachmentsTitle: 'Видалити вкладення файлу?',
            moveFileConflictTitle: 'Конфлікт переміщення',
            folderNamePrompt: 'Введіть назву папки:',
            hideInOtherVaultProfiles: 'Сховати в інших профілях сховища',
            renamePrompt: 'Введіть нову назву:',
            renameVaultTitle: 'Змінити відображувану назву сховища',
            renameVaultPrompt: 'Введіть власну відображувану назву (залиште порожнім для використання за замовчуванням):',
            deleteFolderConfirm: 'Ви впевнені, що хочете видалити цю папку та весь її вміст?',
            deleteFileConfirm: 'Ви впевнені, що хочете видалити цей файл?',
            deleteFileAttachmentsDescriptionSingle: 'Це вкладення більше не використовується в жодній нотатці. Бажаєте його видалити?',
            deleteFileAttachmentsDescriptionMultiple: 'Ці вкладення більше не використовуються в жодній нотатці. Бажаєте їх видалити?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Дерево файлів',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Галерея',
            moveFileConflictDescriptionSingle: 'Виявлено конфлікт файлу в «{folder}».',
            moveFileConflictDescriptionMultiple: 'Виявлено {count} конфліктів файлів у «{folder}».',
            moveFileConflictAffectedFiles: 'Зачеплені файли',
            moveFileConflictItem: '«{name}» -> «{suggested}»{renameOnly}',
            moveFileConflictRenameOnly: '(лише перейменування)',
            moveFileConflictRename: 'Перейменувати',
            moveFileConflictOverwrite: 'Перезаписати',
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
        calendarTemplate: {
            placeholder: 'Пошук шаблонів...',
            instructions: {
                navigate: 'для навігації',
                select: 'для вибору шаблону',
                dismiss: 'для закриття'
            }
        },
        navigationBanner: {
            placeholder: 'Пошук зображень...',
            svgMissingDimensions: 'Вибраний SVG-файл не задає ширину, висоту або viewBox.',
            instructions: {
                navigate: 'для навігації',
                select: 'для встановлення банера',
                dismiss: 'для закриття'
            }
        },
        tagSuggest: {
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
        propertySuggest: {
            placeholder: 'Виберіть ключ властивості...',
            navigatePlaceholder: 'Перейти до властивості...',
            instructions: {
                navigate: 'для навігації',
                select: 'для додавання властивості',
                dismiss: 'для закриття'
            }
        },
        propertyKeyVisibility: {
            title: 'Видимість ключів властивостей',
            description:
                'Керування місцем відображення значень властивостей. Стовпці відповідають панелі навігації, панелі списку та контекстному меню файлу. Використовуйте нижній рядок для перемикання всіх рядків у стовпці.',
            searchPlaceholder: 'Пошук ключів властивостей...',
            propertyColumnLabel: 'Властивість',
            showInNavigation: 'Показати в навігації',
            showInList: 'Показати у списку',
            showInFileMenu: 'Показати в меню файлу',
            toggleAllInNavigation: 'Перемкнути все в навігації',
            toggleAllInList: 'Перемкнути все у списку',
            toggleAllInFileMenu: 'Перемкнути все в меню файлу',
            applyButton: 'Застосувати',
            emptyState: 'Ключі властивостей не знайдено.'
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
            closeButton: 'Можливо, пізніше'
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
            deleteAttachments: 'Не вдалося видалити вкладення: {error}',
            mergeNotes: 'Не вдалося об’єднати нотатки: {error}',
            mergeNotesOpenOutput: 'Об’єднану нотатку створено як {name}, але її не вдалося відкрити: {error}. Вихідні нотатки не змінено.',
            mergeNotesOpenSkipped: 'Інший запит на відкриття файлу отримав пріоритет.',
            mergeNotesTrashSources: 'Об’єднану нотатку створено. Не вдалося перемістити {count} вихідних нотаток до кошика.',
            duplicateNote: 'Не вдалося дублювати нотатку: {error}',
            duplicateFolder: 'Не вдалося дублювати папку: {error}',
            openVersionHistory: 'Не вдалося відкрити історію версій: {error}',
            versionHistoryNotFound: 'Команда історії версій не знайдена. Переконайтеся, що Obsidian Sync увімкнено.',
            revealInExplorer: 'Не вдалося показати файл у провіднику системи: {error}',
            openInDefaultApp: 'Не вдалося відкрити у стандартному додатку: {error}',
            openInDefaultAppNotAvailable: 'Відкриття у стандартному додатку недоступне на цій платформі',
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
            showFolder: 'Папку показано: {name}',
            folderExcludedFromDescendants: 'Сховано зі списків батьківських папок: {name}',
            folderIncludedInDescendants: 'Показано у списках батьківських папок: {name}',
            mergeNotes: 'Об’єднано {count} нотаток у {name}'
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
            mergeNotesRequireMultipleMarkdown: 'Виберіть щонайменше дві Markdown-нотатки для об’єднання',
            tagOperationsNotAvailable: 'Операції з тегами недоступні',
            propertyOperationsNotAvailable: 'Операції з властивостями недоступні',
            tagsRequireMarkdown: 'Теги підтримуються лише для Markdown нотаток',
            propertiesRequireMarkdown: 'Властивості підтримуються лише в нотатках Markdown',
            propertySetOnNote: 'Властивість оновлено в 1 нотатці',
            propertySetOnNotes: 'Властивість оновлено в {count} нотатках',
            manualSortPropertyRemovedFromNote: 'Вилучено властивість сортування з 1 нотатки',
            manualSortPropertyRemovedFromNotes: 'Вилучено властивість сортування з {count} нотаток',
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
            untitled: 'Без назви'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Неможливо перемістити папку в себе або підпапку.',
            itemAlreadyExists: 'Елемент з назвою "{name}" вже існує в цьому місці.',
            failedToMove: 'Не вдалося перемістити: {error}',
            failedToAddTag: 'Не вдалося додати тег "{tag}"',
            failedToSetProperty: 'Не вдалося оновити властивість: {error}',
            failedToClearTags: 'Не вдалося очистити теги',
            failedToMoveFolder: 'Не вдалося перемістити папку "{name}"',
            failedToImportFiles: 'Не вдалося імпортувати: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} файлів вже існує в місці призначення',
            filesAlreadyHaveTag: '{count} файлів вже мають цей тег або більш специфічний',
            filesAlreadyHaveProperty: '{count} файлів вже мають цю властивість',
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

    // Plugin commands
    commands: {
        open: 'Відкрити', // Command palette: Opens the Notebook Navigator view (English: Open)
        toggleLeftSidebar: 'Перемкнути ліву бічну панель', // Command palette: Toggles left sidebar, opening Notebook Navigator when uncollapsing (English: Toggle left sidebar)
        openHomepage: 'Відкрити домашню сторінку', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        openDailyNote: 'Відкрити щоденну нотатку',
        openWeeklyNote: 'Відкрити щотижневу нотатку',
        openMonthlyNote: 'Відкрити щомісячну нотатку',
        openQuarterlyNote: 'Відкрити квартальну нотатку',
        openYearlyNote: 'Відкрити щорічну нотатку',
        revealFile: 'Показати файл', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Пошук', // Command palette: Toggle search in the file list (English: Search)
        searchVaultRoot: 'Пошук у всьому сховищі', // Command palette: Selects the vault root folder and focuses search with subfolders included (English: Search whole vault)
        toggleDualPane: 'Перемкнути подвійну панель', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        toggleDualPaneOrientation: 'Перемкнути орієнтацію подвійної панелі', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'Перемкнути календар', // Command palette: Toggles showing the calendar overlay in the navigation pane (English: Toggle calendar)
        selectVaultProfile: 'Вибрати профіль сховища', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'Вибрати профіль сховища 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Вибрати профіль сховища 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Вибрати профіль сховища 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Видалити файли', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Створити нову нотатку', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Нова нотатка з шаблону', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Перемістити файли', // Command palette: Move selected files to another folder (English: Move files)
        mergeNotes: 'Об’єднати нотатки', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'Вибрати наступний файл', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Вибрати попередній файл', // Command palette: Selects the previous file in the current view (English: Select previous file)
        navigateBack: 'Назад',
        navigateForward: 'Вперед',
        convertToFolderNote: 'Конвертувати в нотатку папки', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Встановити як нотатку папки', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: "Від'єднати нотатку папки", // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Закріпити всі нотатки папок', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Перейти до папки', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Перейти до тегу', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        navigateToProperty: 'Перейти до властивості', // Command palette: Navigate to a property key or value using fuzzy search (English: Navigate to property)
        addShortcut: 'Додати до ярликів', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: 'Відкрити ярлик {number}',
        toggleDescendants: 'Перемкнути нащадків', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Перемкнути приховані папки, теги та нотатки', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Перемкнути порядок сортування тегів', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: 'Перемкнути теги за вибором',
        togglePropertiesBySelection: 'Перемкнути властивості за вибором',
        toggleCompactMode: 'Перемкнути компактний режим', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Перемкнути закріплений розділ',
        collapseExpand: 'Згорнути / розгорнути всі елементи', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        collapseExpandSelectedItem: 'Згорнути / розгорнути вибраний елемент',
        addTag: 'Додати тег до вибраних файлів', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        setProperty: 'Встановити властивість для вибраних файлів', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'Вилучити тег з вибраних файлів', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Вилучити всі теги з вибраних файлів', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        openAllFiles: 'Відкрити всі файли', // Command palette: Opens all files in the current folder or tag (English: Open all files)
        rebuildCache: 'Перебудувати кеш' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        calendarViewName: 'Календар', // Name shown in the view header/tab (English: Calendar)
        folderNoteSidebarViewName: 'Нотатка папки', // Name shown in the folder note sidebar tab (English: Folder note)
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
        folders: 'папок',
        wordCount: 'Кількість слів'
    },

    fileCounts: {
        words: '{count} слів',
        characters: '{count} символів',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'Змінити стандартні налаштування',
        metadataReport: {
            exportSuccess: 'Звіт про невдалі метадані експортовано до: {filename}',
            exportFailed: 'Не вдалося експортувати звіт метаданих'
        },
        sections: {
            general: 'Загальне',
            vaultFilters: 'Фільтри відображення',
            appearanceBehavior: 'Вигляд і поведінка',
            navigationPane: 'Панель навігації',
            calendar: 'Календар',
            fileOperations: 'Операції з файлами',
            icons: 'Пакети іконок',
            folders: 'Папки',
            folderNotes: 'Нотатки папок',
            folderNoteFiles: 'Файли нотаток папок',
            foldersAndFolderNotes: 'Папки та нотатки папок',
            tagsAndProperties: 'Теги та властивості',
            tags: 'Теги',
            listPane: 'Панель списку',
            notes: 'Відображення файлів',
            shortcutsAndRecentFiles: 'Ярлики та останні файли',
            advanced: 'Розширені'
        },
        pageGroups: {
            configuration: 'Конфігурація',
            navigationAndContent: 'Панель навігації',
            notesAndLists: 'Панель списку',
            calendarAndTools: 'Календар і інструменти'
        },
        pageDescriptions: {
            general: 'Примітки до випуску, підтримка, профіль сховища, типи файлів і ключі властивостей.',
            vaultFilters: 'Приховані папки, теги, файли, теги файлів і правила властивостей.',
            appearanceBehavior: 'Поведінка, навігація з клавіатури, кнопки миші, вигляд і форматування.',
            navigationPane: 'Розмітка, вигляд, кількість нотаток, поведінка згортання та кольори веселки.',
            shortcuts: 'Видимість ярликів, значки, останні файли та закріплені елементи.',
            calendar: 'Відображення календаря, нотатки дат, шаблони, локаль і розташування бічної панелі.',
            fileOperations: 'Шаблони, підтвердження видалення, вкладення та поведінка при конфлікті переміщення файлів.',
            foldersAndFolderNotes: 'Відображення папок, нотатки папок, шаблони нотаток папок і поведінка нотаток папок.',
            tagsProperties: 'Розділи тегів і властивостей, іконки, сортування, область дії та успадкування.',
            listPane: 'Сортування, групування, режими списку, закріплені нотатки та перегляд малюнків.',
            frontmatter: 'Поля frontmatter для відображуваних імен, часових позначок, іконок і кольорів.',
            notes: 'Заголовки, текст попереднього перегляду, зображення записів, теги, властивості, дати, кількість слів і кількість символів.',
            iconPacks: 'Іконки інтерфейсу, іконки файлів і керування пакетами іконок.',
            advanced: 'Діагностика, очищення метаданих, імпорт/експорт і скидання.'
        },
        groups: {
            general: {
                vaultConfiguration: 'Налаштування сховища',
                templates: 'Шаблони',
                behavior: 'Поведінка',
                startup: 'Запуск',
                keyboardNavigation: 'Навігація з клавіатури',
                mouseButtons: 'Кнопки миші',
                view: 'Вигляд',
                icons: 'Іконки',
                desktopAppearance: "Вигляд на комп'ютері",
                mobileAppearance: 'Мобільний вигляд',
                formatting: 'Форматування'
            },
            advanced: {
                maintenance: 'Обслуговування',
                resetSettings: 'Скидання налаштувань'
            },
            navigation: {
                appearance: 'Вигляд',
                banner: 'Банер',
                collapseItems: 'Згортати елементи',
                dragAndDrop: 'Перетягування',
                noteCounts: 'Кількість нотаток',
                rainbowColors: 'Кольори веселки',
                leftSidebar: 'Ліва бічна панель',
                calendarIntegration: 'Інтеграція з календарем'
            },
            list: {
                display: 'Вигляд',
                groupHeaders: 'Заголовки груп',
                propertySort: 'Сортування за властивістю',
                manualSort: 'Ручне сортування',
                pinnedNotes: 'Закріплені нотатки',
                drawingPreviews: 'Перегляд малюнків'
            },
            notes: {
                frontmatter: 'Поля frontmatter',
                tasks: 'Завдання',
                icon: 'Іконка',
                title: 'Заголовок',
                previewText: 'Текст попереднього перегляду',
                featureImage: 'Зображення запису',
                tags: 'Теги',
                properties: 'Властивості',
                date: 'Дата',
                parentFolder: 'Батьківська папка',
                wordCount: 'Кількість слів і символів'
            }
        },
        syncMode: {
            notSynced: '(не синхронізовано)',
            switchToSynced: 'Увімкнути синхронізацію',
            switchToLocal: 'Вимкнути синхронізацію'
        },
        items: {
            listPaneTitle: {
                name: 'Заголовок панелі списку',
                desc: 'Виберіть, де показувати заголовок панелі списку.',
                options: {
                    header: 'Показувати в заголовку',
                    list: 'Показувати в панелі списку',
                    hidden: 'Не показувати'
                }
            },
            sortNotesBy: {
                name: 'Порядок сортування за замовчуванням',
                desc: 'Виберіть порядок сортування нотаток за замовчуванням.',
                options: {
                    'modified-desc': 'Дата редагування (найновіші зверху)',
                    'modified-asc': 'Дата редагування (найстаріші зверху)',
                    'created-desc': 'Дата створення (найновіші зверху)',
                    'created-asc': 'Дата створення (найстаріші зверху)',
                    'title-asc': 'Заголовок (А зверху)',
                    'title-desc': 'Заголовок (Я зверху)',
                    'filename-asc': "Ім'я файлу (А зверху)",
                    'filename-desc': "Ім'я файлу (Я зверху)"
                },
                directions: {
                    asc: 'За зростанням',
                    desc: 'За спаданням'
                },
                fields: {
                    modified: 'Дата редагування',
                    created: 'Дата створення',
                    title: 'Заголовок',
                    filename: "Ім'я файлу",
                    property: 'Властивість'
                }
            },
            propertySortKey: {
                name: 'Властивості для сортування',
                desc: "Розділені комами властивості frontmatter, що відображаються як опції сортування за властивістю. Значення масивів об'єднуються в один рядок. Ці властивості не змінюються.",
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: 'Вторинне сортування',
                desc: 'Використовується при сортуванні за властивістю, коли нотатки мають однакове значення властивості або не мають значення.',
                options: {
                    title: 'Заголовок',
                    filename: 'Назва файлу',
                    created: 'Дата створення',
                    modified: 'Дата редагування'
                }
            },
            propertySortInstructions: {
                intro: 'Кожна властивість, перелічена вище, відображається як опція сортування в меню сортування на панелі списку. Вибір однієї з них сортує нотатки за її значенням у frontmatter.'
            },
            manualSortPropertyKey: {
                name: 'Властивість ручного сортування',
                desc: 'Властивість frontmatter, що використовується для зберігання числових значень індексу для ручного сортування.'
            },
            manualSortGroupHeaderProperty: {
                name: 'Властивість заголовка групи',
                desc: 'Властивість frontmatter, що використовується для зберігання користувацьких заголовків груп.'
            },
            groupHeadersInstructions: {
                intro: 'Користувацькі заголовки груп відображаються над нотатками на панелі списку.',
                items: [
                    'У меню сортування на панелі списку встановіть групування на **Користувацьке**.',
                    'Клацніть правою кнопкою миші на нотатці та виберіть **Встановити заголовок групи**, щоб додати заголовок над нею.'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'Розміщення нової нотатки',
                desc: 'Виберіть, де розміщуються нові нотатки, коли поточний список використовує ручне сортування.',
                options: {
                    top: 'Зверху',
                    bottom: 'Знизу',
                    'below-selected-note': 'Під вибраною нотаткою',
                    unsorted: 'Без сортування'
                }
            },
            confirmBeforeManualSort: {
                name: 'Підтверджувати перед ручним сортуванням',
                desc: 'Показувати попередження перед першим записом властивості ручного сортування до нотаток. Коли вимкнено, нотатки отримують властивість без попередження.'
            },
            manualSortInstructions: {
                intro: 'Ручне сортування записує числове значення індексу у властивість frontmatter кожної нотатки. Нотатки без індексу відображаються в розділі «Без сортування».',
                items: [
                    'Увімкніть ручне сортування, вибравши **Ручне сортування** в меню сортування. Після цього є два способи переставити нотатки.',
                    "Виберіть **Редагувати порядок сортування...** в меню сортування, щоб відкрити перегляд для зміни порядку. Перетягуйте нотатки мишею або дотиком на мобільному пристрої. На комп'ютері клік з **Cmd/Ctrl** або **Shift** вибирає кілька нотаток, після чого перетягування будь-якої з них переміщує всю групу.",
                    'У панелі списку виберіть одну нотатку або кілька з мульти-вибором, потім натисніть **Cmd/Ctrl + Arrow Up/Down**, щоб перемістити вибране вгору або вниз.'
                ]
            },
            revealFileOnListChanges: {
                name: 'Прокручувати до вибраного файлу при змінах списку',
                desc: 'Прокручувати до вибраного файлу при закріпленні нотаток, показі нотаток нащадків, зміні вигляду папки або виконанні файлових операцій.'
            },
            includeDescendantNotes: {
                name: 'Показувати нотатки з підпапок / нащадків',
                desc: 'Включати нотатки з вкладених підпапок та нащадків тегів і властивостей при перегляді папки, тегу або властивості.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Закріплювати нотатки лише в їхній папці',
                desc: 'Закріплені нотатки відображаються як закріплені лише у своїй власній папці. Корисно для нотаток-папок або якщо у вас багато закріплених нотаток. Не впливає на подання тегів або властивостей.'
            },
            separateNoteCounts: {
                name: 'Показувати поточні та нащадкові кількості нотаток окремо',
                desc: 'Відображати кількість нотаток у форматі "поточні ▾ нащадки" для папок, тегів і властивостей.'
            },
            groupNotes: {
                name: 'Групування за замовчуванням',
                desc: 'Користувацьке показує заголовки, визначені у frontmatter. Дата групує нотатки за датою. Папка групує нотатки за папкою. Перегляди тегів і властивостей використовують групи за датою, коли вибрано папку.',
                options: {
                    custom: 'Користувацьке',
                    date: 'Дата',
                    folder: 'Папка'
                }
            },
            showSelectedNavigationPills: {
                name: 'Завжди показувати всі мітки тегів та властивостей',
                desc: 'Коли вимкнено, мітки, що відповідають поточному вибору навігації, приховуються (наприклад, мітка тегу «рецепти» приховується під час перегляду тегу «рецепти»). Увімкніть, щоб усі мітки залишалися видимими.'
            },
            stickyGroupHeaders: {
                name: 'Закріплені заголовки груп',
                desc: 'Тримати заголовок поточної дати, теки або закріпленого розділу видимим під час прокручування.'
            },
            showFolderGroupPaths: {
                name: 'Показувати шляхи підпапок',
                desc: 'Під час групування за папкою на панелі списку показувати шляхи підпапок замість лише назв папок.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'Групування за папками: файли поточної папки внизу',
                desc: 'Коли для групування за замовчуванням вибрано «Папка», файли безпосередньо у вибраній папці буде показано нижче груп підпапок.'
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
                desc: 'Відображати іконки файлів з вирівнюванням ліворуч. Вимкнення видаляє як іконки, так і відступ. Пріоритет: значок незавершених завдань > користувацький значок > значок папки > значок назви файлу > значок типу файлу > значок за замовчуванням.'
            },
            useFolderIcon: {
                name: 'Використовувати значок папки',
                desc: 'Відображати значок батьківської папки, коли не задано користувацький значок файлу. Колір папки використовується, коли не задано користувацький колір файлу.'
            },
            showFileIconUnfinishedTask: {
                name: 'Значок незавершених завдань',
                desc: 'Показувати іконку завдання, коли нотатка містить незавершені завдання.'
            },
            showFileBackgroundUnfinishedTask: {
                name: 'Фон незавершених завдань',
                desc: 'Застосовувати колір фону, коли нотатка містить незавершені завдання.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'Колір фону незавершених завдань',
                desc: 'Встановити колір фону, що використовується коли нотатка містить незавершені завдання.'
            },
            showFilenameMatchIcons: {
                name: 'Іконки за назвою файлу',
                desc: 'Призначити іконки файлам на основі тексту в їхніх назвах.'
            },
            fileNameIconMap: {
                name: 'Зіставлення назв та іконок',
                desc: 'Файли, що містять текст, отримують вказану іконку. Одне зіставлення на рядок: текст=іконка',
                placeholder: '# текст=іконка\nзустріч=ph-calendar\nрахунок=ph-receipt',
                editTooltip: 'Редагувати зіставлення'
            },
            showCategoryIcons: {
                name: 'Іконки за типом файлу',
                desc: 'Призначити іконки файлам на основі їхнього розширення.'
            },
            fileTypeIconPreset: {
                name: 'Попередній набір іконок файлів',
                desc: 'Виберіть вбудовані іконки або попередній набір пакета іконок. Користувацькі правила розширень замінюють цей попередній набір.',
                options: {
                    none: 'Вбудовані іконки'
                },
                notInstalledWarning: 'Цей пакет іконок не встановлено. Натомість відображаються вбудовані іконки.'
            },
            fileTypeIconMap: {
                name: 'Зіставлення типів та іконок',
                desc: 'Файли з розширенням отримують вказану іконку. Одне зіставлення на рядок: розширення=іконка',
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'Редагувати зіставлення'
            },
            compactItemHeight: {
                name: 'Висота компактних елементів',
                desc: "Встановіть висоту елементів компактного списку на комп'ютері та мобільному (у пікселях).",
                resetTooltip: 'Відновити за замовчуванням (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Масштабувати текст з висотою компактних елементів',
                desc: 'Масштабувати текст компактного списку при зменшенні висоти елементів.'
            },
            showParentFolder: {
                name: 'Показувати батьківську папку',
                desc: 'Відображати назву батьківської папки для нотаток у підпапках, тегах або властивостях.'
            },
            showParentFolderFullPath: {
                name: 'Показувати повний шлях',
                desc: 'Відображати повний шлях батьківської папки замість лише назви папки.'
            },
            parentFolderClickRevealsFile: {
                name: 'Натискання на батьківську папку відкриває папку',
                desc: 'Натискання на мітку батьківської папки відкриває папку в панелі списку.'
            },
            showParentFolderColor: {
                name: 'Показувати колір батьківської папки',
                desc: 'Використовувати кольори папок на мітках батьківських папок.'
            },
            showParentFolderIcon: {
                name: 'Показувати значок батьківської папки',
                desc: 'Показувати значки папок поруч із мітками батьківських папок.'
            },
            showQuickActions: {
                name: 'Показувати швидкі дії',
                desc: "Показувати кнопки дій при наведенні на файли. Елементи керування кнопками вибирають, які дії з'являються."
            },
            dualPane: {
                name: 'Макет подвійної панелі',
                desc: "Показувати панель навігації та панель списку поруч на комп'ютері."
            },
            dualPaneOrientation: {
                name: 'Орієнтація подвійної панелі',
                desc: 'Виберіть горизонтальний або вертикальний макет при активній подвійній панелі.',
                options: {
                    horizontal: 'Горизонтальний поділ',
                    vertical: 'Вертикальний поділ'
                }
            },
            narrowSidebarLayout: {
                name: 'Коли бічна панель занадто вузька',
                desc: 'Виберіть, що відбувається, коли панель навігації та панель списку не вміщуються поруч.',
                options: {
                    none: 'Нічого не робити',
                    singlePane: 'Перемкнутися на одну панель',
                    vertical: 'Перемкнутися на вертикальний поділ'
                }
            },
            narrowSidebarTrigger: {
                name: 'Поріг вузької бічної панелі',
                desc: 'Виберіть, як обчислюється поріг ширини бічної панелі.',
                options: {
                    fitPanes: 'Умістити панелі',
                    customWidth: 'Користувацька ширина'
                }
            },
            narrowSidebarCustomWidth: {
                name: 'Ширина порога вузької бічної панелі',
                desc: 'Перемикатися, коли бічна панель вужча за цю ширину.',
                resetTooltip: 'Скинути до ширини за замовчуванням'
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
                name: 'Рівень масштабування',
                desc: 'Керує загальним рівнем масштабування Notebook Navigator (у відсотках).'
            },
            useFloatingToolbars: {
                name: 'Використовувати плаваючі панелі інструментів на iOS/iPadOS',
                desc: 'Застосовується лише на iOS та iPadOS.'
            },
            startView: {
                name: 'Вигляд при запуску за замовчуванням',
                desc: 'Виберіть, яка панель активна при відкритті Notebook Navigator. В однопанельному режимі ця панель показується першою; у двопанельному режимі вона отримує фокус клавіатури.',
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
            createNewNotesInNewTab: {
                name: 'Відкривати нові нотатки в новій вкладці',
                desc: 'Якщо увімкнено, команда «Створити нову нотатку» відкриває нотатки в новій вкладці. Якщо вимкнено, нотатки замінюють поточну вкладку.'
            },
            autoRevealActiveNote: {
                name: 'Автоматично показувати активну нотатку',
                desc: 'Автоматично показувати нотатки при відкритті з Швидкого перемикача, посилань або пошуку.'
            },
            autoRevealShortestPath: {
                name: 'Автопоказ: Використовувати найкоротший шлях',
                desc: 'Увімкнено: Автопоказ обирає найближчу видиму батьківську теку або тег. Вимкнено: Автопоказ обирає фактичну теку файлу та точний тег.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Автопоказ: Ігнорувати події з правої бічної панелі',
                desc: 'Не змінювати активну нотатку при натисканні або зміні нотаток у правій бічній панелі.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'Автопоказ: Ігнорувати події з інших вікон',
                desc: 'Не змінювати активну нотатку при роботі з нотатками в іншому вікні.'
            },
            paneTransitionDuration: {
                name: 'Анімація однієї панелі',
                desc: 'Тривалість переходу при перемиканні панелей у режимі однієї панелі (мілісекунди).',
                resetTooltip: 'Скинути до стандартних'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Автоматично вибирати першу нотатку',
                desc: 'Автоматично відкривати першу нотатку при перемиканні папок, тегів або властивостей.'
            },
            skipAutoScroll: {
                name: 'Вимкнути автопрокручування для ярликів',
                desc: 'Не прокручувати панель навігації при натисканні на елементи в ярликах.'
            },
            autoExpandNavItems: {
                name: 'Розгортати при виборі',
                desc: 'Розгортати папки та теги при виборі. У режимі однієї панелі перший вибір розгортає, другий показує файли.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'Одна розгорнута гілка',
                desc: 'Згортати інші гілки в тому самому дереві під час розгортання папки, тегу або властивості.'
            },
            springLoadedFolders: {
                name: 'Розгортати під час перетягування',
                desc: 'Розгортати папки й теги при наведенні під час перетягування.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Розгортати під час перетягування: Затримка першого розгортання',
                desc: 'Затримка перед розгортанням першої папки або тегу під час перетягування (секунди).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Розгортати під час перетягування: Затримка наступних розгортань',
                desc: 'Затримка перед розгортанням додаткових папок або тегів під час того ж перетягування (секунди).'
            },
            navigationBanner: {
                name: 'Банер навігації (профіль сховища)',
                desc: 'Відображати зображення над панеллю навігації. Змінюється з вибраним профілем сховища.',
                current: 'Поточний банер: {path}',
                chooseButton: 'Вибрати зображення'
            },
            pinNavigationBanner: {
                name: 'Закріпити банер',
                desc: 'Закріпити банер навігації над деревом навігації.'
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
                name: 'Показувати останні файли',
                desc: 'Відображати розділ останніх файлів у панелі навігації.'
            },
            hideRecentNotes: {
                name: 'Приховати типи файлів з останніх файлів',
                desc: 'Оберіть типи файлів для приховування в розділі останніх файлів.',
                options: {
                    none: 'Жодного',
                    folderNotes: 'Нотатки папок'
                }
            },
            recentNotesCount: {
                name: 'Кількість останніх файлів',
                desc: 'Кількість останніх файлів для відображення.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Закріпити останні файли разом з ярликами',
                desc: 'Включати останні файли при закріпленні ярликів.'
            },
            calendarEnabled: {
                name: 'Увімкнути календар',
                desc: 'Увімкнути функції календаря в Notebook Navigator.'
            },
            calendarPlacement: {
                name: 'Розташування календаря',
                desc: 'Відображати на лівій або правій бічній панелі.',
                options: {
                    leftSidebar: 'Ліва бічна панель',
                    rightSidebar: 'Права бічна панель'
                }
            },
            calendarLeftPlacement: {
                name: 'Розташування в режимі однієї панелі',
                desc: 'Де відображається календар у режимі однієї панелі.',
                options: {
                    navigationPane: 'Панель навігації',
                    below: 'Під панелями'
                }
            },
            calendarLocale: {
                name: 'Мова',
                desc: 'Керує форматуванням дат у календарі, нумерацією тижнів та першим днем тижня.',
                weekPathMismatchWarning:
                    'Видимий календар і шляхи щотижневих нотаток використовують різні початки тижня або різну нумерацію тижнів.',
                options: {
                    systemDefault: 'За замовчуванням'
                }
            },
            calendarWeekendDays: {
                name: 'Вихідні дні',
                desc: 'Показувати вихідні дні з іншим кольором фону.',
                options: {
                    none: 'Немає',
                    satSun: 'Субота та неділя',
                    friSat: "П'ятниця та субота",
                    thuFri: "Четвер та п'ятниця"
                }
            },
            calendarMonthHeadingFormat: {
                name: 'Формат назви місяця',
                desc: 'Повна (січень) або скорочена (січ) назва місяця.',
                options: {
                    full: 'січень (повна)',
                    short: 'січ (коротка)'
                }
            },
            showInfoButtons: {
                name: 'Показати кнопки інформації',
                desc: 'Відображати кнопки інформації в рядку пошуку та заголовку календаря.'
            },
            calendarWeeksToShow: {
                name: 'Тижнів для показу на лівій бічній панелі',
                desc: 'Календар на правій бічній панелі завжди відображає повний місяць.',
                options: {
                    fullMonth: 'Повний місяць',
                    oneWeek: '1 тиждень',
                    weeksCount: '{count} тижнів'
                }
            },
            calendarHighlightToday: {
                name: 'Виділяти сьогоднішню дату',
                desc: 'Виділяти сьогоднішню дату кольором фону та жирним текстом.'
            },
            calendarShowFeatureImage: {
                name: 'Показати обкладинку',
                desc: 'Відображати зображення-обкладинки нотаток у календарі.'
            },
            calendarShowTasks: {
                name: 'Показувати завдання',
                desc: 'Показувати індикатор на днях, тижнях і місяцях із незавершеними завданнями.'
            },
            calendarShowWeekNumber: {
                name: 'Показати номер тижня',
                desc: 'Додати колонку з номером тижня.'
            },
            calendarShowQuarter: {
                name: 'Показати квартал',
                desc: 'Додати мітку кварталу в заголовок календаря.'
            },
            calendarShowYearCalendar: {
                name: 'Показати річний календар',
                desc: 'Відображати навігацію по роках і сітку місяців у правій бічній панелі.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Підтвердити перед створенням',
                desc: 'Показати діалог підтвердження при створенні нової щоденної нотатки.'
            },
            calendarIntegrationMode: {
                name: 'Джерело щоденних нотаток',
                desc: 'Джерело для нотаток календаря.',
                options: {
                    dailyNotes: 'Щоденні нотатки (основний плагін)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'Папка та формат дати налаштовуються в плагіні Daily Notes.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'Мова періодичних нотаток',
                desc: 'Керує локалізованими назвами місяців, назвами днів тижня, номерами тижнів і початками тижнів у шляхах періодичних нотаток Notebook Navigator.',
                options: {
                    calendar: 'Календар',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'Коренева папка',
                desc: 'Базова папка для періодичних нотаток. Шаблони дат можуть включати підпапки. Змінюється з вибраним профілем сховища.',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'Розташування папки шаблонів',
                desc: 'Вибір файлу шаблону показує нотатки з цієї папки.',
                placeholder: 'Templates',
                usage: 'Використовується нотатками календаря та нотатками папок. Налаштуйте шаблони в Календар > Інтеграція з календарем і Папки та нотатки папок > Файли нотаток папок.'
            },
            calendarCustomFilePattern: {
                name: 'Щоденні нотатки',
                desc: 'Формат шляху з використанням формату дати Moment. Беріть назви підпапок у квадратні дужки, напр. [Work]/YYYY. Натисніть на іконку шаблону, щоб задати шаблон. Вкажіть розташування теки шаблонів у Операції з файлами > Шаблони.',
                momentDescPrefix: 'Формат шляху з використанням ',
                momentLinkText: 'формату дати Moment',
                momentDescSuffix:
                    '. Беріть назви підпапок у квадратні дужки, напр. [Work]/YYYY. Натисніть на іконку шаблону, щоб задати шаблон. Вкажіть розташування теки шаблонів у Операції з файлами > Шаблони.',
                templaterSupportInstalled: '✅ Плагін Templater встановлено з повною підтримкою шаблонів.',
                templaterSupportMissing: '⚠️ Установіть плагін Templater для повної підтримки шаблонів.',
                placeholder: 'YYYY/YYYYMMDD',
                example: 'Поточний синтаксис: {path}',
                parsingError: 'Шаблон має форматуватися і знову розбиратися як повна дата (рік, місяць, день).'
            },
            calendarCustomWeekPattern: {
                name: 'Щотижневі нотатки',
                parsingError: 'Шаблон має форматуватися і знову розбиратися як повний тиждень (рік тижня, номер тижня).',
                weekPathMismatchWarning:
                    'Шляхи щотижневих нотаток використовують мову періодичних нотаток. Використовуйте відповідні мови або використовуйте "GGGG" з "WW" для тижнів, що починаються з понеділка.',
                mixedWeekTokensWarning:
                    'Цей шаблон змішує токени тижня, що починається з понеділка ("W" або "G"), з токенами тижня на основі мови ("w" або "g"). Використовуйте один набір послідовно: "GGGG" з "WW" для тижнів, що починаються з понеділка, або "gggg" з "ww", якщо щотижневі нотатки мають відповідати обраній мові.'
            },
            calendarCustomMonthPattern: {
                name: 'Щомісячні нотатки',
                parsingError: 'Шаблон має форматуватися і знову розбиратися як повний місяць (рік, місяць).'
            },
            calendarCustomQuarterPattern: {
                name: 'Квартальні нотатки',
                parsingError: 'Шаблон має форматуватися і знову розбиратися як повний квартал (рік, квартал).'
            },
            calendarCustomYearPattern: {
                name: 'Річні нотатки',
                parsingError: 'Шаблон має форматуватися і знову розбиратися як повний рік (рік).'
            },
            calendarTemplateFile: {
                current: 'Файл шаблону: {name}'
            },
            showTooltips: {
                name: 'Показувати підказки',
                desc: 'Відображати підказки при наведенні з додатковою інформацією для нотаток і папок.'
            },
            showTooltipPath: {
                name: 'Показувати шлях у підказках',
                desc: 'Відображати шлях папки під назвами нотаток у підказках.'
            },
            showTooltipWordCount: {
                name: 'Показувати кількість слів у підказках',
                desc: 'Відображати кількість слів у нотатках у підказках.'
            },
            resetPaneSeparator: {
                name: 'Скинути позицію роздільника панелей',
                desc: 'Скинути перетягуваний роздільник між панеллю навігації та панеллю списку до позиції за замовчуванням.',
                buttonText: 'Скинути роздільник',
                notice: 'Позицію роздільника скинуто. Перезапустіть Obsidian або відкрийте Notebook Navigator знову для застосування.'
            },
            settingsTransfer: {
                name: 'Імпорт та експорт налаштувань',
                desc: 'Експорт або імпорт налаштувань Notebook Navigator у форматі JSON. Імпорт замінює всі налаштування.',
                importButtonText: 'Імпорт',
                exportButtonText: 'Експорт',
                import: {
                    modalTitle: 'Імпорт налаштувань',
                    fileButtonName: 'Імпорт з файлу',
                    fileButtonDesc: 'Завантажити JSON-файл з диска.',
                    fileButtonText: 'Імпорт з файлу',
                    editorName: 'JSON',
                    editorDesc: 'Вставте або відредагуйте JSON нижче. Не включені налаштування скидаються до значень за замовчуванням.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'Імпортувати',
                    confirmTitle: 'Імпортувати налаштування?',
                    confirmMessage: 'Імпорт замінить поточні налаштування Notebook Navigator.',
                    backupToggleName: 'Зберегти поточні налаштування в корені сховища перед імпортом',
                    backupToggleDesc: 'Створює JSON-файл із часовою позначкою в корені сховища.',
                    successWithBackupNotice: 'Налаштування імпортовано. Попередні налаштування збережено в {path}.',
                    backupError: 'Не вдалося зберегти поточні налаштування: {message}',
                    successNotice: 'Налаштування імпортовано.',
                    errorNotice: 'Не вдалося імпортувати налаштування: {message}',
                    fileReadError: 'Не вдалося прочитати файл: {message}'
                },
                export: {
                    modalTitle: 'Експорт налаштувань',
                    editorName: 'JSON',
                    editorDesc: 'Включено лише налаштування, що відрізняються від значень за замовчуванням.',
                    placeholder: '{}',
                    copyButtonText: 'Копіювати до буфера обміну',
                    downloadButtonText: 'Завантажити',
                    copyNotice: 'Налаштування скопійовано до буфера обміну.',
                    downloadNotice: 'Налаштування експортовано.',
                    downloadError: 'Не вдалося завантажити налаштування: {message}'
                }
            },
            resetAllSettings: {
                name: 'Скинути всі налаштування',
                desc: 'Скинути всі налаштування Notebook Navigator до значень за замовчуванням.',
                buttonText: 'Скинути всі налаштування',
                confirmTitle: 'Скинути всі налаштування?',
                confirmMessage: 'Це скине всі налаштування Notebook Navigator до значень за замовчуванням. Це не можна скасувати.',
                confirmButtonText: 'Скинути всі налаштування',
                notice: 'Усі налаштування скинуто. Перезапустіть Obsidian або відкрийте Notebook Navigator знову для застосування.',
                error: 'Не вдалося скинути налаштування.'
            },
            multiSelectModifier: {
                name: 'Модифікатор множинного вибору',
                desc: 'Виберіть, яка клавіша-модифікатор перемикає множинний вибір. При виборі Option/Alt натискання Cmd/Ctrl відкриває нотатки в новій вкладці.',
                options: {
                    cmdCtrl: 'Натискання Cmd/Ctrl',
                    optionAlt: 'Натискання Option/Alt'
                }
            },
            enterToOpenFiles: {
                name: 'Натисніть Enter для відкриття файлів',
                desc: 'Відкривати файли лише при натисканні Enter під час навігації клавіатурою у списку. У macOS це не дозволяє Enter перейменовувати файли.'
            },
            shiftEnterOpenContext: {
                name: 'Shift+Enter',
                desc: 'Виберіть, чи Shift+Enter відкриває або перейменовує вибраний файл.'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Enter',
                desc: 'Виберіть, чи Cmd+Enter відкриває або перейменовує вибраний файл.'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Enter',
                desc: 'Виберіть, чи Ctrl+Enter відкриває або перейменовує вибраний файл.'
            },
            mouseBackForwardAction: {
                name: 'Кнопки «Назад»/«Вперед» миші',
                desc: 'Дія кнопок «Назад» і «Вперед» миші на десктопі.',
                options: {
                    none: 'Використовувати системне значення',
                    singlePaneSwitch: 'Перемикання панелей (одна панель)',
                    history: 'Навігація по історії'
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
                desc: 'Виберіть, що Notebook Navigator відкриває автоматично під час запуску.',
                current: 'Поточний: {path}',
                chooseButton: 'Вибрати файл',
                options: {
                    none: 'Немає',
                    file: 'Файл',
                    dailyNote: 'Щоденна нотатка',
                    weeklyNote: 'Щотижнева нотатка',
                    monthlyNote: 'Щомісячна нотатка',
                    quarterlyNote: 'Щоквартальна нотатка',
                    yearlyNote: 'Щорічна нотатка'
                },
                file: {
                    name: 'Домашня сторінка: Файл запуску',
                    empty: 'Файл не вибрано'
                },
                createMissing: {
                    name: 'Домашня сторінка: Створити нотатку, якщо її немає',
                    desc: 'Створює періодичну нотатку під час запуску або за командою, якщо її не існує.'
                }
            },
            excludedNotes: {
                name: 'Приховати нотатки за правилами властивостей (профіль сховища)',
                desc: 'Список правил frontmatter, розділених комами. Використовуйте записи `key` або `key=value` (наприклад, status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'Приховати файли (профіль сховища)',
                desc: 'Список шаблонів імен файлів через кому для приховування. Підтримує символи підстановки * та шляхи / (наприклад, temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Профіль сховища',
                desc: 'Профілі зберігають видимість типів файлів, приховані файли, приховані папки, приховані теги, правила властивостей для прихованих нотаток, ярлики та банер навігації. Перемикайте профілі із заголовка панелі навігації.',
                defaultName: 'За замовчуванням',
                addButton: 'Додати профіль',
                editProfilesButton: 'Редагувати профілі',
                addProfileOption: 'Додати профіль...',
                applyButton: 'Застосувати',
                deleteButton: 'Видалити профіль',
                addModalTitle: 'Додати профіль',
                editProfilesModalTitle: 'Редагувати профілі',
                addModalPlaceholder: 'Назва профілю',
                deleteModalTitle: 'Видалити {name}',
                deleteModalMessage:
                    'Видалити {name}? Фільтри прихованих файлів, папок, тегів та нотаток на основі властивостей, збережені в цьому профілі, будуть видалені.',
                moveUp: 'Перемістити вгору',
                moveDown: 'Перемістити вниз',
                errors: {
                    emptyName: 'Введіть назву профілю',
                    duplicateName: 'Назва профілю вже існує'
                }
            },
            vaultTitle: {
                name: 'Розташування назви сховища',
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
            descendantExcludedFolders: {
                name: 'Виключати папки з нотаток підпапок (профіль сховища)',
                desc: 'Список папок, розділених комами, які пропускаються під час збирання нотаток із підпапок. Папки залишаються видимими, і вибір папки й надалі показує її нотатки. Використовує ті самі шаблони, що й Сховати папки.',
                placeholder: 'щоденні, ресурси, /archive'
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
            showFileProperties: {
                name: 'Показувати властивості файлів',
                desc: 'Відображати властивості в елементах файлів. Використовуйте вікно «Видимість ключів властивостей», щоб вибрати, які властивості відображаються.'
            },
            colorFileProperties: {
                name: 'Забарвлювати властивості файлів',
                desc: 'Застосовувати кольори властивостей до значків властивостей на елементах файлів.'
            },
            prioritizeColoredFileProperties: {
                name: 'Показувати кольорові властивості першими',
                desc: 'Сортувати кольорові властивості перед іншими властивостями на елементах файлів.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Показувати властивості в компактному режимі',
                desc: 'Відображати властивості при активному компактному режимі.'
            },
            textCountDisplay: {
                name: 'Тип лічильника',
                desc: 'Виберіть, які лічильники нотаток відображаються в елементах файлів.',
                options: {
                    none: 'Немає',
                    words: 'Кількість слів',
                    characters: 'Кількість символів',
                    both: 'Кількість слів і символів'
                }
            },
            textCountPlacement: {
                name: 'Розміщення',
                desc: 'Виберіть, де відображаються лічильники нотаток.',
                options: {
                    title: 'У заголовку',
                    property: 'Як властивість'
                }
            },
            characterCountSpaces: {
                name: 'Кількість символів',
                desc: 'Виберіть, чи враховувати пробіли в кількості символів.',
                options: {
                    include: 'З пробілами',
                    exclude: 'Без пробілів'
                }
            },
            wordCountTargetProperty: {
                name: 'Цільова властивість',
                desc: 'Ключ властивості frontmatter із цільовою кількістю слів. Залиште порожнім, щоб приховати цілі.'
            },
            showWordCountPercentage: {
                name: 'Показувати відсоток цілі',
                desc: 'Показувати лише відсоток прогресу, коли доступна цільова кількість слів.'
            },
            propertyFields: {
                name: 'Ключі властивостей (профіль сховища)',
                desc: 'Ключі властивостей метаданих з налаштуванням видимості для кожного ключа в навігації та списку файлів.',
                addButtonTooltip: 'Налаштувати ключі властивостей',
                noneConfigured: 'Властивості не налаштовані',
                singleConfigured: '1 властивість налаштована: {properties}',
                multipleConfigured: '{count} властивостей налаштовано: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'Показувати властивості в окремих рядках',
                desc: 'Показувати кожну властивість у власному рядку.'
            },
            enablePropertyInternalLinks: {
                name: "Пов'язати мітки властивостей із нотатками",
                desc: "Натисніть на мітку властивості, щоб відкрити пов'язану нотатку."
            },
            enablePropertyExternalLinks: {
                name: "Пов'язати мітки властивостей із URL-адресами",
                desc: "Натисніть на мітку властивості, щоб відкрити пов'язану URL-адресу."
            },
            dateFormat: {
                name: 'Формат дати',
                desc: 'Формат для відображення дат (використовує формат Moment).',
                placeholder: 'D MMM YYYY',
                help: 'Поширені формати:\nD MMM YYYY = 25 тра 2022\nDD/MM/YYYY = 25/05/2022\nYYYY-MM-DD = 2022-05-25\n\nТокени:\nYYYY/YY = рік\nMMMM/MMM/MM = місяць\nDD/D = день\ndddd/ddd = день тижня',
                helpTooltip: 'Формат Moment',
                momentLinkText: 'формат Moment'
            },
            timeFormat: {
                name: 'Формат часу',
                desc: 'Формат для відображення часу (використовує формат Moment).',
                placeholder: 'HH:mm',
                help: 'Поширені формати:\nh:mm a = 2:30 PM (12-годинний)\nHH:mm = 14:30 (24-годинний)\nh:mm:ss a = 2:30:45 PM\nHH:mm:ss = 14:30:45\n\nТокени:\nHH/H = 24-годинний\nhh/h = 12-годинний\nmm = хвилини\nss = секунди\na = AM/PM',
                helpTooltip: 'Формат Moment',
                momentLinkText: 'формат Moment'
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
            stripLatexInPreview: {
                name: 'Видаляти LaTeX у попередньому перегляді',
                desc: 'Видаляти вбудовані та блокові вирази LaTeX з тексту попереднього перегляду.'
            },
            previewProperties: {
                name: 'Властивості попереднього перегляду',
                desc: 'Список властивостей frontmatter для перевірки на текст попереднього перегляду, розділених комами. Буде використано першу властивість з текстом.',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'Повернутися до вмісту нотатки',
                desc: 'Показувати вміст нотатки як попередній перегляд, коли жодна із зазначених властивостей не містить тексту.'
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
                    '2': '2 рядки',
                    '3': '3 рядки'
                }
            },
            useFolderColor: {
                name: 'Використовувати колір папки',
                desc: 'Забарвлювати заголовки нотаток та значки файлів кольором батьківської папки, коли не задано користувацький колір файлу. Пріоритет: користувацький колір файлу > колір папки > колір за замовчуванням.'
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
                desc: 'Список властивостей frontmatter, розділених комами, для перевірки в першу чергу. При відсутності використовується перше зображення з вмісту markdown.',
                placeholder: 'мініатюра, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'Виключити нотатки з властивостями',
                desc: 'Список властивостей frontmatter, розділених комами. Нотатки, що містять будь-яку з цих властивостей, не зберігають головні зображення.',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: 'Розмір відображення зображення-обкладинки',
                desc: 'Максимальний розмір відображення зображень-обкладинок у списках нотаток.',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'Піксельний розмір зображення-обкладинки',
                desc: 'Роздільна здатність, що використовується при створенні збережених мініатюр зображень-обкладинок. Збільшіть це значення, якщо великі попередні перегляди виглядають розмитими.',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'Завантажувати зовнішні зображення',
                desc: 'Завантажувати віддалені зображення та мініатюри YouTube для обкладинок.'
            },
            hideDrawingPreviewImages: {
                name: 'Сховати експортовані зображення попереднього перегляду',
                desc: 'Приховує експортовані PNG-файли попереднього перегляду малюнків. Увімкніть «Показати приховані елементи», щоб відобразити їх.'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator показує PNG-файли, експортовані Excalidraw, як попередній перегляд малюнків.',
                items: [
                    'У **налаштуваннях Excalidraw** відкрийте **Embedding Excalidraw into your Notes and Exporting**, потім **Export Settings**, потім **Auto-export Settings**.',
                    'Увімкніть **Auto-export PNG**. За бажанням увімкніть **Export both dark- and light-themed image**.',
                    'Notebook Navigator шукає **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** або **Drawing.excalidraw.light.png**.',
                    'Поки увімкнено **Сховати експортовані зображення попереднього перегляду**, PNG-файли видно лише тоді, коли також увімкнено **Показати приховані елементи**.'
                ]
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
            folderSortOrder: {
                name: 'Порядок сортування папок',
                desc: 'Клацніть правою кнопкою миші на папці, щоб задати інший порядок сортування для її дочірніх елементів.',
                options: {
                    alphaAsc: 'Від А до Я',
                    alphaDesc: 'Від Я до А'
                }
            },
            showNoteCount: {
                name: 'Показувати кількість нотаток',
                desc: 'Відображати кількість нотаток поряд з папками, тегами та властивостями.'
            },
            showSectionIcons: {
                name: 'Показувати іконки для ярликів та останніх елементів',
                desc: 'Відображати іконки поруч з елементами в розділах Ярлики та Останні.'
            },
            interfaceIcons: {
                name: 'Іконки інтерфейсу',
                desc: 'Редагувати іконки панелі інструментів, папок, тегів, властивостей, закріплених, пошуку та сортування.',
                buttonText: 'Редагувати іконки'
            },
            showIconsColorOnly: {
                name: 'Застосовувати колір лише до іконок',
                desc: 'При увімкненні користувацькі кольори застосовуються лише до іконок. При вимкненні кольори застосовуються як до іконок, так і до текстових міток.'
            },
            navRainbowMode: {
                name: 'Режим кольорів веселки (профіль сховища)',
                desc: 'Застосувати кольори веселки в панелі навігації.',
                options: {
                    none: 'Вимк.',
                    foreground: 'Колір тексту',
                    background: 'Колір фону'
                }
            },
            navRainbowFirstColor: {
                name: 'Перший колір',
                desc: 'Перший колір у градієнті веселки.'
            },
            navRainbowLastColor: {
                name: 'Останній колір',
                desc: 'Останній колір у градієнті веселки.'
            },
            navRainbowTransitionStyle: {
                name: 'Стиль переходу',
                desc: 'Інтерполяція між першим і останнім кольором.',
                options: {
                    hue: 'Тон',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'Застосувати до ярликів',
                desc: 'Застосувати кольори веселки до ярликів.'
            },
            navRainbowApplyToRecent: {
                name: 'Застосувати до нещодавніх елементів',
                desc: 'Застосувати кольори веселки до нещодавніх елементів.'
            },
            navRainbowApplyToFolders: {
                name: 'Застосувати до папок',
                desc: 'Застосувати кольори веселки до папок.'
            },
            navRainbowFolderScope: {
                name: 'Область папок',
                desc: 'Вибрати рівні папок для початку призначення кольорів.',
                options: {
                    root: 'Кореневий рівень',
                    child: 'Дочірній рівень',
                    all: 'Кожний рівень'
                }
            },
            navRainbowApplyToTags: {
                name: 'Застосувати до тегів',
                desc: 'Застосувати кольори веселки до тегів.'
            },
            navRainbowTagScope: {
                name: 'Область тегів',
                desc: 'Вибрати рівні тегів для початку призначення кольорів.',
                options: {
                    root: 'Кореневий рівень',
                    child: 'Дочірній рівень',
                    all: 'Кожний рівень'
                }
            },
            navRainbowApplyToProperties: {
                name: 'Застосувати до властивостей',
                desc: 'Застосувати кольори веселки до властивостей.'
            },
            navRainbowBalanceHueLuminance: {
                name: 'Рівномірна яскравість між відтінками', // (English: Consistent brightness across hues)
                desc: 'Інтерполює яскравість між початковим і кінцевим кольорами під час переходів відтінків.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'Окремі кольори для світлого і темного режимів', // (English: Separate light and dark mode colors)
                desc: 'Використовувати різні кольори веселки для світлого і темного режимів.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'Копіювати колір світлого режиму в темний режим', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'Область властивостей',
                desc: 'Вибрати рівні властивостей для початку призначення кольорів.',
                options: {
                    root: 'Кореневий рівень',
                    child: 'Дочірній рівень',
                    all: 'Кожний рівень'
                }
            },
            collapseBehavior: {
                name: 'Згортати елементи',
                desc: 'Виберіть, на що впливає кнопка розгортання/згортання всього.',
                options: {
                    all: 'Все',
                    foldersOnly: 'Лише папки',
                    tagsOnly: 'Лише теги',
                    propertiesOnly: 'Лише властивості'
                }
            },
            smartCollapse: {
                name: 'Тримати вибраний елемент розгорнутим',
                desc: 'При згортанні тримати вибраний елемент та його батьків розгорнутими.'
            },
            excludeVaultRootFromCollapse: {
                name: 'Пропускати корінь сховища під час згортання',
                desc: 'Під час згортання всіх елементів залишати кореневу папку сховища в поточному стані.'
            },
            navIndent: {
                name: 'Відступ дерева',
                desc: 'Налаштувати ширину відступу для вкладених папок, тегів і властивостей (у пікселях).'
            },
            navItemHeight: {
                name: 'Висота елемента',
                desc: 'Налаштувати висоту папок, тегів і властивостей у панелі навігації (у пікселях).'
            },
            navItemHeightScaleText: {
                name: 'Масштабувати текст з висотою елемента',
                desc: 'Зменшувати розмір тексту навігації при зменшенні висоти елемента.'
            },
            showIndentGuides: {
                name: 'Показати напрямні відступів',
                desc: 'Відображати напрямні відступів для вкладених папок, тегів і властивостей.'
            },
            navCountLeaderStyle: {
                name: 'Показати заповнювачі',
                desc: 'Відображати крапки, тире або лінію між назвами елементів і кількістю нотаток.',
                options: {
                    none: 'Немає',
                    dots: 'Крапки (...)',
                    dashes: 'Тире (---)',
                    line: 'Лінія'
                }
            },
            navRootSpacing: {
                name: 'Відступ кореневих елементів',
                desc: 'Відстань між папками, тегами та властивостями кореневого рівня (у пікселях).'
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
                desc: 'Клацніть правою кнопкою миші на тезі, щоб задати інший порядок сортування для її дочірніх елементів.',
                options: {
                    alphaAsc: 'Від А до Я',
                    alphaDesc: 'Від Я до А',
                    frequency: 'За частотою',
                    lowToHigh: 'від низької до високої',
                    highToLow: 'від високої до низької'
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
            scopeTagsToCurrentContext: {
                name: 'Фільтрувати теги за вибором',
                desc: 'Показувати лише теги, що зустрічаються в нотатках у вибраній папці або властивості.'
            },
            keepEmptyTagsProperty: {
                name: 'Зберігати властивість tags після видалення останнього тегу',
                desc: 'Зберігати властивість tags у frontmatter, коли всі теги видалено. При вимкненні властивість tags видаляється з frontmatter.'
            },
            showProperties: {
                name: 'Показати властивості',
                desc: 'Відображати розділ властивостей у навігаторі.',
                propertyKeysInfoPrefix: 'Налаштувати властивості в ',
                propertyKeysInfoLinkText: 'Початок > Ключі властивостей',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'Показати значки властивостей',
                desc: 'Відображати значки поряд із властивостями на панелі навігації.'
            },
            inheritPropertyColors: {
                name: 'Успадковувати кольори властивостей',
                desc: 'Значення властивостей успадковують колір та фон від ключа властивості.'
            },
            propertySortOrder: {
                name: 'Порядок сортування властивостей',
                desc: 'Клацніть правою кнопкою миші на властивість, щоб задати інший порядок сортування її значень.',
                options: {
                    alphaAsc: 'А до Я',
                    alphaDesc: 'Я до А',
                    frequency: 'Частота',
                    lowToHigh: 'за зростанням',
                    highToLow: 'за спаданням'
                }
            },
            showAllPropertiesFolder: {
                name: 'Показати папку властивостей',
                desc: 'Відображати «Властивості» як згортувану папку.'
            },
            scopePropertiesToCurrentContext: {
                name: 'Фільтрувати властивості за вибором',
                desc: 'Показувати лише властивості, що зустрічаються в нотатках у вибраній папці або тезі.'
            },
            hiddenTags: {
                name: 'Приховати теги (профіль сховища)',
                desc: 'Список шаблонів тегів, розділених комами. Шаблони назв: тег* (починається з), *тег (закінчується на). Шаблони шляхів: архів (тег і нащадки), архів/* (лише нащадки), проекти/*/чернетки (символ підстановки посередині).',
                placeholder: 'архів*, *чернетка, проекти/*/старі'
            },
            hiddenFileTags: {
                name: 'Приховати нотатки з тегами (профіль сховища)',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'Увімкнути нотатки папок',
                desc: 'Теки з відповідним файлом нотатки відображаються як клікабельні посилання.'
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
            folderNoteNamePattern: {
                name: 'Шаблон назви нотатки теки',
                desc: "Шаблон імені нотаток теки без розширення. Використовуйте {{folder}} для вставки імені теки. Якщо задано, ім'я нотатки теки не застосовується."
            },
            folderNoteTemplate: {
                name: 'Шаблон нотатки теки',
                desc: 'Файл шаблону, який використовується під час створення нотаток тек. Шаблони Markdown можуть використовувати Templater. Шаблони Canvas і Base копіюються як вміст файлу. Вкажіть розташування теки шаблонів у Операції з файлами > Шаблони.',
                formatWarning: 'Формат шаблону має відповідати вибраному типу нотатки теки: .md, .canvas або .base.'
            },
            enableFolderNoteLinks: {
                name: 'Назви папок відкривають нотатки папок',
                desc: 'Натискання назви папки відкриває її нотатку папки. Коли вимкнено, нотатки папок надають лише метадані папки, як-от назву, значок і колір.'
            },
            hideFolderNoteInList: {
                name: 'Приховувати нотатку папки в списку',
                desc: 'Приховати нотатки тек зі списку файлів.'
            },
            pinCreatedFolderNote: {
                name: 'Закріплювати створені нотатки папок',
                desc: 'Закріплювати нотатки тек при створенні з контекстного меню.'
            },
            folderNoteOpenLocation: {
                name: 'Відкривати нотатки папок у',
                desc: 'Виберіть, де відкривати нотатки папок під час натискання посилань нотаток папок.',
                options: {
                    currentTab: 'Поточна вкладка',
                    newTab: 'Нова вкладка',
                    rightSidebar: 'Права бічна панель'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: 'Права бічна панель: показувати найближчу нотатку папки',
                desc: 'Коли вибрано папку, права бічна панель автоматично показує найближчу батьківську нотатку папки.'
            },
            confirmBeforeDelete: {
                name: 'Підтверджувати перед видаленням',
                desc: 'Показувати діалог підтвердження при видаленні нотаток або папок'
            },
            deleteAttachments: {
                name: 'Видаляти вкладення при видаленні файлів',
                desc: "Автоматично видаляти пов'язані вкладення та згенеровані попередні перегляди малюнків, якщо вони не використовуються в іншому місці",
                options: {
                    ask: 'Запитувати щоразу',
                    always: 'Завжди',
                    never: 'Ніколи'
                }
            },
            moveFileConflicts: {
                name: 'Конфлікти переміщення',
                desc: 'При переміщенні файлу до теки, де вже існує файл з такою ж назвою. Запитувати щоразу (перейменувати, перезаписати, скасувати) або завжди перейменовувати.',
                options: {
                    ask: 'Запитувати щоразу',
                    rename: 'Завжди перейменовувати'
                }
            },
            metadataCleanup: {
                name: 'Очистити метадані',
                desc: 'Видаляє осиротілі метадані, залишені після видалення, переміщення або перейменування файлів, папок, тегів або властивостей поза Obsidian. Це впливає лише на файл налаштувань Notebook Navigator.',
                buttonText: 'Очистити метадані',
                error: 'Очищення налаштувань не вдалося',
                loading: 'Перевірка метаданих...',
                statusClean: 'Немає метаданих для очищення',
                statusCounts:
                    'Осиротілі елементи: {folders} папок, {tags} тегів, {properties} властивостей, {files} файлів, {pinned} закріплень, {separators} роздільників'
            },
            rebuildCache: {
                name: 'Перебудувати кеш',
                desc: 'Використовуйте, якщо у вас зникають теги, неправильні попередні перегляди або відсутні головні зображення. Це може статися після конфліктів синхронізації або неочікуваних закриттів.',
                buttonText: 'Перебудувати кеш',
                error: 'Не вдалося перебудувати кеш',
                indexingTitle: 'Індексація сховища...',
                progress: 'Оновлення кешу Notebook Navigator.'
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
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'Поле кольору',
                desc: 'Поле frontmatter для кольорів файлів. Залиште порожнім для використання кольорів, збережених у налаштуваннях.',
                placeholder: 'color'
            },
            frontmatterBackgroundField: {
                name: 'Поле фону',
                desc: 'Поле frontmatter для кольорів фону. Залиште порожнім для використання кольорів фону, збережених у налаштуваннях.',
                placeholder: 'background'
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
                placeholder: 'title, name'
            },
            frontmatterCreatedField: {
                name: 'Поле часової мітки створення',
                desc: 'Назва поля frontmatter для часової мітки створення. Залиште порожнім для використання лише дати файлової системи.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'Поле часової мітки зміни',
                desc: 'Назва поля frontmatter для часової мітки зміни. Залиште порожнім для використання лише дати файлової системи.',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'Формат часової мітки',
                desc: 'Формат для розбору часових міток у frontmatter. Залиште порожнім для використання парсингу ISO 8601.',
                helpTooltip: 'Формат Moment',
                momentLinkText: 'формат Moment',
                help: 'Поширені формати:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'Підтримати розробку',
                desc: 'Якщо вам подобається використовувати Notebook Navigator, будь ласка, розгляньте можливість підтримки його подальшої розробки.',
                buttonText: '❤️ Спонсорувати',
                coffeeButton: '☕️ Купити мені каву'
            },
            updateCheckOnStart: {
                name: 'Перевіряти нову версію при запуску',
                desc: 'Перевіряє нові релізи плагіна при запуску та показує сповіщення, коли доступне оновлення. Перевірки відбуваються не частіше одного разу на день.',
                status: 'Доступна нова версія: {version}'
            },
            debugLogging: {
                name: 'Журнал налагодження запуску',
                desc: 'Записує діагностику запуску у Markdown-файл із часовою міткою в корені сховища, а потім зупиняється після стабілізації запуску. Файл може синхронізуватися та містити шляхи до файлів.'
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
        openBannerImage: 'Відкрити зображення банера релізу',
        supportMessage: 'Якщо Notebook Navigator корисний для вас, будь ласка, розгляньте можливість підтримки його розробки.',
        supportButton: 'Купити мені каву',
        thanksButton: 'Дякую!'
    }
};
