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
        restoreDefault: 'Відновити значення за замовчуванням', // Button text for restoring values to defaults (English: Restore default)
        submit: 'Надіслати', // Button text for submitting forms and dialogs (English: Submit)
        save: 'Зберегти', // Button text for saving settings and dialogs (English: Save)
        configure: 'Налаштувати', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'Світлий режим', // Label for light theme mode (English: Light mode)
        darkMode: 'Темний режим', // Label for dark theme mode (English: Dark mode)
        noSelection: 'Нічого не вибрано', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Без міток', // Label for notes without any tags (English: Untagged)
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
        emptyStateNoSelection: 'Виберіть теку або мітку для перегляду нотаток', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
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
        propertyGroupNoValue: 'Немає',
        manualSortDone: 'Готово',
        manualSortMultipleWriteFailure: 'Не вдалося обробити файлів ({count}); перший: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Без міток', // Label for the special item showing notes without tags (English: Untagged)
        tags: 'Мітки' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Ярлики', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentFilesHeader: 'Останні файли', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Властивості',
        folders: 'Теки',
        tags: 'Мітки',
        calendar: 'Календар',
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
        noteHiddenByProfile: 'Нотатку календаря приховано поточним профілем сховища.',
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
        folderExists: 'Тека вже в ярликах',
        noteExists: 'Нотатка вже в ярликах',
        tagExists: 'Мітка вже в ярликах',
        propertyExists: 'Властивість вже в ярликах',
        invalidProperty: 'Недійсний ярлик властивості',
        searchExists: 'Ярлик пошуку вже існує',
        emptySearchQuery: 'Введіть пошуковий запит перед збереженням',
        emptySearchName: 'Введіть назву перед збереженням пошуку',
        add: 'Додати до ярликів',
        addNotesCount: 'Додати нотатки до ярликів: {count}',
        addFilesCount: 'Додати файли до ярликів: {count}',
        rename: 'Перейменувати ярлик',
        remove: 'Вилучити з ярликів',
        removeAll: 'Видалити всі ярлики',
        removeAllConfirm: 'Видалити всі ярлики?',
        folderNotesPinned: 'Закріплено нотаток тек: {count}'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Згорнути елементи', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'Розгорнути всі елементи', // Tooltip for button that expands all items (English: Expand all items)
        collapseAllListGroups: 'Згорнути всі групи списку',
        expandAllListGroups: 'Розгорнути всі групи списку',
        showCalendar: 'Показати календар',
        hideCalendar: 'Сховати календар',
        newFolder: 'Нова тека', // Tooltip for create new folder button (English: New folder)
        newNote: 'Нова нотатка', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Назад до навігації', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeChildSortOrder: 'Змінити порядок сортування',
        changeSortAndGroup: 'Змінити сортування та групування',
        resetViewToDefaults: 'Скинути вигляд до стандартних налаштувань',
        manualSort: 'Ручне сортування',
        editSortOrder: 'Редагувати порядок сортування...',
        removeSortProperty: 'Вилучити властивість сортування',
        descendants: 'нащадків',
        subfolders: 'підтек',
        subtags: 'підтегів',
        childValues: 'дочірніх значень',
        applySortAndGroupToDescendants: (target: string) => `Застосувати сортування та групування для ${target}`,
        applyAppearanceToDescendants: (target: string) => `Застосувати оформлення для ${target}`,
        resetAppearanceInDescendants: (target: string) => `Скинути оформлення для ${target}`,
        showFolders: 'Показати навігацію', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: 'Змінити порядок навігації',
        finishRootFolderReorder: 'Готово',
        showExcludedItems: 'Показати приховані теки, мітки та нотатки', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Сховати приховані теки, мітки та нотатки', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Показати подвійну панель', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Показати одну панель', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            'Дві панелі недоступні, коли бічна панель занадто вузька. Щоб змінити це, установіть «Коли бічна панель занадто вузька» на «Нічого не робити» в Налаштування > Вигляд і поведінка.',
        changeAppearance: 'Змінити вигляд', // Tooltip for button to change folder appearance settings (English: Change appearance)
        changeAppearanceCustomized: 'Змінити оформлення, налаштовано',
        showNotesFromSubfolders: 'Показати нотатки з підтек',
        showFilesFromSubfolders: 'Показати файли з підтек',
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
            intro: 'Пошук за фільтром знаходить нотатки за відображуваними іменами, псевдонімами, властивостями, мітками, датами та фільтрами, поєднаними в одному запиті (напр. `meeting .status=active #work @thisweek`). Натисніть на значок зірки, щоб зберегти пошук як ярлик.',
            introInstallOmnisearch: 'Для повнотекстового пошуку у вмісті нотаток потрібен плагін Omnisearch.',
            introSwitching:
                'Перемикайтеся між пошуком за фільтром та Omnisearch за допомогою клавіш стрілок вгору/вниз або натиснувши на значок пошуку.',
            activeFilterSearch: 'Пошук за фільтром активний.',
            activeOmnisearch: 'Omnisearch активний.',
            omnisearchIntro:
                'Omnisearch виконує повнотекстовий пошук у вмісті нотаток по всьому сховищу. Notebook Navigator показує збіги, що належать до поточної теки, мітки або вибраних елементів.',
            sections: {
                fileNames: {
                    title: 'Імена файлів і псевдоніми',
                    items: [
                        '`word` Знайти нотатки зі словом "word" у відображуваному імені або псевдонімі.',
                        '`word1 word2` Кожне слово має зустрічатися у відображуваному імені або псевдонімах.',
                        '`-word` Виключити нотатки зі словом "word" у відображуваному імені або псевдонімі.',
                        '`"text"` Шукати текст буквально; термін, що починається з подвійних лапок, ніколи не інтерпретується як мітка, властивість, дата або фільтр (наприклад: `".F"`).',
                        '`-"text"` Виключити нотатки з буквальним текстом у відображуваному імені або псевдонімі.'
                    ]
                },
                tags: {
                    title: 'Мітки',
                    items: [
                        '`#tag` Включити нотатки з міткою (також знаходить вкладені мітки як `#tag/subtag`).',
                        '`#` Включити лише нотатки з мітками.',
                        '`-#tag` Виключити нотатки з міткою.',
                        '`-#` Включити лише нотатки без міток.',
                        '`#tag1 #tag2` Знайти обидві мітки (неявне AND).',
                        '`#tag1 AND #tag2` Знайти обидві мітки (явне AND).',
                        '`#tag1 OR #tag2` Знайти будь-яку з міток.',
                        '`#a OR #b AND #c` AND має більший пріоритет: знаходить `#a`, або обидва `#b` і `#c`.',
                        'Cmd/Ctrl+Клік по мітці для додавання з AND. Cmd/Ctrl+Shift+Клік для додавання з OR.'
                    ]
                },
                properties: {
                    title: 'Властивості',
                    items: [
                        '`.key` Включити нотатки з ключем властивості, що починається з `key`.',
                        '`.key=value` Включити нотатки, у яких значення властивості містить `value`.',
                        '`."Reading Status"` Включити нотатки з ключем властивості, що містить пробіли.',
                        '`."Reading Status"="In Progress"` Ключі та значення з пробілами повинні бути в подвійних лапках.',
                        '`-.key` Виключити нотатки з ключем властивості, що починається з `key`.',
                        '`-.key=value` Виключити нотатки, у яких значення властивості містить `value`.',
                        'Cmd/Ctrl+Клік на властивість для додавання з AND. Cmd/Ctrl+Shift+Клік для додавання з OR.'
                    ]
                },
                tasks: {
                    title: 'Фільтри',
                    items: [
                        '`has:task` Включити нотатки з незавершеними завданнями.',
                        '`-has:task` Виключити нотатки з незавершеними завданнями.',
                        '`folder:meetings` Включити нотатки, де назва теки містить `meetings`.',
                        '`folder:/work/meetings` Включити нотатки лише в `work/meetings` (не підтеки).',
                        '`folder:/` Включити нотатки лише в корені сховища.',
                        '`-folder:archive` Виключити нотатки, де назва теки містить `archive`.',
                        '`-folder:/archive` Виключити нотатки лише в `archive` (не підтеки).',
                        '`ext:md` Включити нотатки з розширенням `md` (`ext:.md` також підтримується).',
                        '`-ext:pdf` Виключити нотатки з розширенням `pdf`.',
                        'Поєднуйте з мітками, назвами та датами (наприклад: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'Поведінка AND/OR',
                    items: [
                        '`AND` та `OR` є операторами лише в запитах, що складаються виключно з міток та властивостей.',
                        'Запити виключно з міток та властивостей містять лише фільтри міток та властивостей: `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`.',
                        'Якщо запит включає імена, дати (`@...`), фільтри завдань (`has:task`), фільтри тек (`folder:...`) або фільтри розширень (`ext:...`), `AND` та `OR` шукаються як слова.',
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
                        '`@13/02/2026` Числові формати з роздільниками (`@07022026` відповідає вашій локалі при неоднозначності).',
                        '`@2026-02-01..2026-02-07` Знайти включний діапазон днів (відкриті кінці підтримуються).',
                        '`@c:...` або `@m:...` Вказати дату створення або зміни.',
                        '`-@...` Виключити збіг дати.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'Запит надсилається плагіну Omnisearch і відповідає синтаксису запитів Omnisearch. Токени пошуку за фільтром, такі як `#tag`, `.property` та `@date`, не мають особливого значення.',
                        'Коли вибрано теку, до запиту додається `path:"<folder>/"`, щоб Omnisearch шукав збіги в цій теці та її підтеках. Запити, що вже містять `path:`, надсилаються без змін.',
                        'Omnisearch повертає не більше 50 результатів, відсортованих за релевантністю. За більшої кількості збігів нотатки з нижчим рейтингом не відображаються.',
                        'Для обмеження пошуку текою, шлях якої містить не-ASCII символи, потрібен Omnisearch 1.30.0 або новіший. Старіші версії шукають по всьому сховищу, після чого результати фільтруються за текою.',
                        'Запити коротші за 3 символи можуть працювати повільно у великих сховищах.',
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
            openMultipleInNewTabs: 'Відкрити нотатки у нових вкладках: {count}',
            openMultipleFilesInNewTabs: 'Відкрити файли у нових вкладках: {count}',
            openMultipleToRight: 'Відкрити нотатки праворуч: {count}',
            openMultipleFilesToRight: 'Відкрити файли праворуч: {count}',
            openMultipleInNewWindows: 'Відкрити нотатки у нових вікнах: {count}',
            openMultipleFilesInNewWindows: 'Відкрити файли у нових вікнах: {count}',
            pinNote: 'Закріпити нотатку',
            pinFile: 'Закріпити файл',
            unpinNote: 'Відкріпити нотатку',
            unpinFile: 'Відкріпити файл',
            pinMultipleNotes: 'Закріпити нотатки: {count}',
            pinMultipleFiles: 'Закріпити файли: {count}',
            unpinMultipleNotes: 'Відкріпити нотатки: {count}',
            unpinMultipleFiles: 'Відкріпити файли: {count}',
            duplicateNote: 'Дублювати нотатку',
            duplicateFile: 'Дублювати файл',
            duplicateMultipleNotes: 'Дублювати нотатки: {count}',
            duplicateMultipleFiles: 'Дублювати файли: {count}',
            openVersionHistory: 'Відкрити історію версій',
            revealInFolder: 'Показати в теці',
            revealInFinder: 'Показати у Finder',
            showInExplorer: 'Показати в провіднику системи',
            openInDefaultApp: 'Відкрити у стандартному застосунку',
            renameNote: 'Перейменувати нотатку',
            renameFile: 'Перейменувати файл',
            deleteNote: 'Видалити нотатку',
            deleteFile: 'Видалити файл',
            setCalendarHighlight: 'Встановити виділення',
            removeCalendarHighlight: 'Прибрати виділення',
            deleteMultipleNotes: 'Видалити нотатки: {count}',
            deleteMultipleFiles: 'Видалити файли: {count}',
            moveNoteToFolder: 'Перемістити нотатку до...',
            moveFileToFolder: 'Перемістити файл до...',
            moveMultipleNotesToFolder: 'Перемістити нотатки ({count}) до...',
            moveMultipleFilesToFolder: 'Перемістити файли ({count}) до...',
            mergeNotes: 'Об’єднати нотатки ({count})...',
            mergeNotesInGroup: 'Об’єднати нотатки в групі...',
            setManualSortGroupHeader: 'Встановити заголовок групи',
            changeManualSortGroupHeader: 'Змінити заголовок групи',
            manualSortGroupHeader: {
                title: 'Заголовок групи',
                copyStyle: 'Копіювати стиль заголовка',
                pasteStyle: 'Вставити стиль заголовка',
                remove: 'Вилучити заголовок групи'
            },
            addTag: 'Додати мітку',
            addPropertyKey: 'Встановити властивість',
            removeTag: 'Вилучити мітку',
            removeAllTags: 'Вилучити всі мітки',
            changeIcon: 'Змінити іконку',
            changeColor: 'Змінити колір'
        },
        folder: {
            newNote: 'Нова нотатка',
            newNoteFromTemplate: 'Нова нотатка з шаблону',
            newFolder: 'Нова тека',
            newCanvas: 'Нове полотно',
            newBase: 'Нова база',
            newDrawing: 'Новий малюнок',
            newExcalidrawDrawing: 'Новий малюнок Excalidraw',
            newTldrawDrawing: 'Новий малюнок Tldraw',
            duplicateFolder: 'Дублювати теку',
            searchInFolder: 'Шукати в теці',
            createFolderNote: 'Створити нотатку теки',
            detachFolderNote: "Від'єднати нотатку теки",
            deleteFolderNote: 'Видалити нотатку теки',
            changeIcon: 'Змінити іконку',
            changeColor: 'Змінити колір',
            changeBackground: 'Змінити фон',
            excludeFolder: 'Сховати теку',
            unhideFolder: 'Показати теку',
            hideRootFolder: 'Сховати кореневу теку',
            showRootFolder: 'Показати кореневу теку',
            excludeFromDescendants: 'Сховати в батьківських теках',
            includeInDescendants: 'Показати в батьківських теках',
            hiddenFromParentsIndicator: 'Сховано зі списків батьківських тек',
            moveFolder: 'Перемістити теку до...',
            renameFolder: 'Перейменувати теку',
            deleteFolder: 'Видалити теку'
        },
        tag: {
            changeIcon: 'Змінити іконку',
            changeColor: 'Змінити колір',
            changeBackground: 'Змінити фон',
            showTag: 'Показати мітку',
            hideTag: 'Сховати мітку'
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
        copy: {
            title: 'Копіювати',
            noteLink: 'посилання на нотатку',
            fileLink: 'посилання на файл',
            noteLinkAsFootnote: 'посилання на нотатку як виноску',
            fileLinkAsFootnote: 'посилання на файл як виноску',
            noteEmbed: 'вбудовування нотатки',
            fileEmbed: 'вбудовування файлу',
            obsidianUrl: 'URL Obsidian',
            pathFromVaultFolder: 'шлях з теки сховища',
            pathFromSystemRoot: 'шлях з кореня системи'
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
        titleRows: {
            label: 'Рядки заголовка',
            option: (rows: number) => `${rows} ${rows === 1 ? 'рядок' : rows < 5 ? 'рядки' : 'рядків'} заголовка`
        },
        previewRows: {
            label: 'Рядки попереднього перегляду',
            none: 'Немає',
            option: (rows: number) => `${rows} ${rows === 1 ? 'рядок' : rows < 5 ? 'рядки' : 'рядків'} попереднього перегляду`
        },
        groupBy: 'Групувати за',
        tags: 'Мітки',
        properties: 'Властивості',
        tasks: 'Завдання',
        date: 'Дата',
        parentFolder: 'Батьківська тека',
        textCount: {
            label: 'Підрахунок тексту',
            options: {
                none: 'Немає',
                words: 'Слова',
                characters: 'Символи',
                both: 'Слова і символи'
            }
        },
        resetAppearance: 'Скинути оформлення',
        openPluginSettings: 'Відкрити налаштування плагіна…'
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Застосувати',
            applySortAndGroupTitle: (target: string) => `Застосувати сортування та групування для ${target}?`,
            applyAppearanceTitle: (target: string) => `Застосувати оформлення для ${target}?`,
            resetAppearanceTitle: (target: string) => `Скинути оформлення для ${target}?`,
            applyAppearanceMessage: (count: number, replacedCount: number) =>
                `Оформлення зміниться для ${count} ${count % 10 === 1 && count % 100 !== 11 ? 'елемента' : 'елементів'}. Замінено наявних власних оформлень: ${replacedCount}. Збережені налаштування оформлення копіюються один раз; сортування й групування зберігаються. Майбутні зміни та нові дочірні елементи не пов’язуються.`,
            resetAppearanceMessage: (count: number) =>
                `Оформлення буде скинуто для ${count} ${count % 10 === 1 && count % 100 !== 11 ? 'елемента' : 'елементів'}. Сортування й групування зберігаються. Це одноразова зміна; майбутні зміни та нові дочірні елементи не пов’язуються.`,
            affectedCountMessage: (count: number) => `Наявних перевизначень, які зміняться: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'Використати ручне сортування?',
            propertySortMessage: (property: string, count: number) =>
                `Перемикає поточний вигляд на ручне сортування з використанням «${property}». Редагування порядку записує числові значення індексу в цю властивість у ${count} ${count % 10 === 1 && count % 100 !== 11 ? 'нотатці' : 'нотатках'} за потреби.`,
            propertySortConfirmButton: 'Використати ручне сортування',
            removePropertyTitle: 'Вилучити властивість сортування?',
            removePropertyMessage: (property: string, count: number) =>
                `Це вилучить «${property}» з ${count} ${count % 10 === 1 && count % 100 !== 11 ? 'нотатки' : 'нотаток'} у поточному списку. Порядок ручного сортування буде очищено для цих нотаток.`,
            removePropertyConfirmButton: 'Вилучити властивість',
            compactTitle: 'Стиснути значення індексу?',
            compactMessage: (count: number) =>
                `Це перевпорядкування потребує більше числового простору. ${count} ${count % 10 === 1 && count % 100 !== 11 ? 'нотатка отримає' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'нотатки отримають' : 'нотаток отримають'} нові значення індексу.`,
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
                'Коли це поле порожнє, ціль групи використовує цільову властивість, задану в Налаштування > Відображення файлів > Кількість слів і символів. Перевизначте її, задавши цільове значення для цієї групи.',
            description: 'Налаштуйте заголовок групи для цієї нотатки. Залиште заголовок порожнім, щоб видалити його.'
        },
        mergeNotes: {
            title: 'Об’єднати нотатки',
            summary: 'Створити одну нотатку з {count} нотаток у {folder}.',
            frontmatterRule: 'Frontmatter першої нотатки зберігається. Frontmatter інших нотаток видаляється.',
            crossFolderWarning:
                'Вихідні нотатки розташовані в різних теках. Відносні посилання та вбудування можуть перестати працювати в об’єднаній нотатці.',
            outputName: 'Назва результату',
            outputNameDesc: 'Об’єднана нотатка буде створена в теці, показаній вище.',
            outputNamePlaceholder: 'Об’єднані нотатки',
            separator: 'Роздільник',
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
                'nav-recent-files': 'Останні файли',
                'nav-expand-all': 'Розгорнути все',
                'nav-collapse-all': 'Згорнути все',
                'nav-calendar': 'Календар',
                'nav-tree-expand': 'Стрілка дерева: розгорнути',
                'nav-tree-collapse': 'Стрілка дерева: згорнути',
                'nav-hidden-items': 'Приховані елементи',
                'nav-root-reorder': 'Змінити порядок кореневих тек',
                'nav-new-folder': 'Нова тека',
                'nav-show-single-pane': 'Показати одну панель',
                'nav-show-dual-pane': 'Показати подвійну панель',
                'nav-profile-chevron': 'Стрілка меню профілю',
                'list-search': 'Пошук',
                'list-reveal-file': 'Показати файл',
                'list-descendants': 'Нотатки з підтек',
                'list-expand-all': 'Розгорнути всі групи',
                'list-collapse-all': 'Згорнути всі групи',
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
                'nav-folder-open': 'Тека відкрита',
                'nav-folder-closed': 'Тека закрита',
                'nav-tags': 'Мітки',
                'nav-tag': 'Мітка',
                'nav-properties': 'Властивості',
                'nav-property': 'Властивість',
                'nav-property-value': 'Значення',
                'file-unfinished-task': 'Завдання',
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
            renameTitle: 'Перейменувати мітку {tag}',
            deleteTitle: 'Видалити мітку {tag}',
            newTagPrompt: 'Нова назва мітки',
            newTagPlaceholder: 'Введіть нову назву мітки',
            renameWarning: 'Перейменування мітки {oldTag} змінить {files}: {count}.',
            deleteWarning: 'Видалення мітки {tag} змінить {files}: {count}.',
            modificationWarning: 'Це оновить дати зміни файлів.',
            affectedFiles: 'Файли, яких це стосується:',
            andMore: '...та ще {count}',
            confirmRename: 'Перейменувати мітку',
            renameUnchanged: '{tag} не змінено',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            renameBatchNotFinalized: 'Перейменовано {renamed}/{total}. Не оновлено: {notUpdated}. Метадані та ярлики не були оновлені.',
            invalidTagName: 'Введіть дійсну назву мітки.',
            descendantRenameError: 'Неможливо перемістити мітку у себе або в нащадка.',
            confirmDelete: 'Видалити мітку',
            deleteBatchNotFinalized: 'Видалено з {removed}/{total}. Не оновлено: {notUpdated}. Метадані та ярлики не були оновлені.',
            checkConsoleForDetails: 'Деталі в консолі.',
            file: 'файл',
            files: 'файли',
            inlineParsingWarning: {
                title: 'Сумісність вбудованих міток',
                message: '{tag} містить символи, які Obsidian не може обробити у вбудованих мітках. На мітки у frontmatter це не впливає.',
                confirm: 'Використати все одно'
            }
        },
        propertyOperation: {
            renameTitle: 'Перейменувати властивість {property}',
            deleteTitle: 'Видалити властивість {property}',
            newKeyPrompt: 'Нова назва властивості',
            newKeyPlaceholder: 'Введіть нову назву властивості',
            renameWarning: 'Перейменування властивості {property} змінить {files}: {count}.',
            renameConflictWarning:
                'Властивість {newKey} вже існує, знайдено {files}: {count}. Перейменування {oldKey} замінить наявні значення {newKey}.',
            deleteWarning: 'Видалення властивості {property} змінить {files}: {count}.',
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
            newFolderTitle: 'Нова тека',
            renameFolderTitle: 'Перейменувати теку',
            renameFileTitle: 'Перейменувати файл',
            deleteFolderTitle: 'Видалити «{name}»?',
            deleteFileTitle: 'Видалити «{name}»?',
            deleteFileAttachmentsTitle: 'Видалити вкладення файлу?',
            moveFileConflictTitle: 'Конфлікт переміщення',
            folderNamePrompt: 'Введіть назву теки:',
            hideInOtherVaultProfiles: 'Сховати в інших профілях сховища',
            renamePrompt: 'Введіть нову назву:',
            renameVaultTitle: 'Змінити відображувану назву сховища',
            renameVaultPrompt: 'Введіть власну відображувану назву (залиште порожнім для використання за замовчуванням):',
            deleteFolderConfirm: 'Ви впевнені, що хочете видалити цю теку та весь її вміст?',
            deleteFileConfirm: 'Ви впевнені, що хочете видалити цей файл?',
            deleteFileAttachmentsDescriptionSingle: 'Це вкладення більше не використовується в жодній нотатці. Бажаєте його видалити?',
            deleteFileAttachmentsDescriptionMultiple: 'Ці вкладення більше не використовуються в жодній нотатці. Бажаєте їх видалити?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Дерево файлів',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Галерея',
            moveFileConflictDescriptionSingle: 'Виявлено конфлікт файлу в «{folder}».',
            moveFileConflictDescriptionMultiple: 'Виявлено конфліктів файлів ({count}) у «{folder}».',
            moveFileConflictAffectedFiles: 'Файли, яких це стосується',
            moveFileConflictItem: '«{name}» -> «{suggested}»{renameOnly}',
            moveFileConflictRenameOnly: '(лише перейменування)',
            moveFileConflictRename: 'Перейменувати',
            moveFileConflictOverwrite: 'Перезаписати',
            removeAllTagsTitle: 'Вилучити всі мітки',
            removeAllTagsFromNote: 'Ви впевнені, що хочете вилучити всі мітки з цієї нотатки?',
            removeAllTagsFromNotes: 'Ви впевнені, що хочете вилучити всі мітки з {count} нотаток?'
        },
        folderNoteType: {
            title: 'Виберіть тип нотатки теки',
            folderLabel: 'Тека: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `Перемістити ${name} до теки...`,
            multipleFilesLabel: (count: number) =>
                `${count} ${count % 10 === 1 && count % 100 !== 11 ? 'файл' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'файли' : 'файлів'}`,
            navigatePlaceholder: 'Перейти до теки...',
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
            navigatePlaceholder: 'Перейти до мітки...',
            addPlaceholder: 'Знайти мітку для додавання...',
            removePlaceholder: 'Виберіть мітку для вилучення...',
            createNewTag: 'Створити нову мітку: #{tag}',
            instructions: {
                navigate: 'для навігації',
                select: 'для вибору',
                dismiss: 'для закриття',
                add: 'для додавання мітки',
                remove: 'для вилучення мітки'
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
                'Вітаю! Ласкаво просимо до Notebook Navigator, удосконаленого браузера файлів і календаря для Obsidian. Перед початком я дуже раджу переглянути принаймні перші три розділи відео нижче, Mastering Notebook Navigator. Вони познайомлять вас із роботою двох панелей і допоможуть швидко розпочати.',
            continueText:
                'Потім, якщо маєте ще десять хвилин, перегляньте розділи про початкове налаштування та щоденну роботу. У них є все необхідне для початку, а до подробиць можна повернутися пізніше. Посилання на відео розташоване у верхній частині налаштувань Notebook Navigator.',
            thanksText: 'Користуйтеся Notebook Navigator із задоволенням!',
            videoAlt: 'Опановуємо Notebook Navigator 3',
            openVideoButton: 'Відтворити відео',
            closeButton: 'Можливо, пізніше'
        }
    },
    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Не вдалося створити теку: {error}',
            createFile: 'Не вдалося створити файл: {error}',
            renameFolder: 'Не вдалося перейменувати теку: {error}',
            renameFolderNoteConflict: 'Неможливо перейменувати: «{name}» вже існує в цій теці',
            renameFile: 'Не вдалося перейменувати файл: {error}',
            deleteFolder: 'Не вдалося видалити теку: {error}',
            deleteFile: 'Не вдалося видалити файл: {error}',
            deleteAttachments: 'Не вдалося видалити вкладення: {error}',
            mergeNotes: 'Не вдалося об’єднати нотатки: {error}',
            mergeNotesOpenOutput: 'Об’єднану нотатку створено як {name}, але її не вдалося відкрити: {error}. Вихідні нотатки не змінено.',
            mergeNotesOpenSkipped: 'Інший запит на відкриття файлу отримав пріоритет.',
            mergeNotesTrashSources: 'Об’єднану нотатку створено. Не вдалося перемістити до кошика вихідних нотаток: {count}.',
            duplicateNote: 'Не вдалося дублювати нотатку: {error}',
            duplicateFolder: 'Не вдалося дублювати теку: {error}',
            openVersionHistory: 'Не вдалося відкрити історію версій: {error}',
            versionHistoryNotFound: 'Команда історії версій не знайдена. Переконайтеся, що Obsidian Sync увімкнено.',
            revealInExplorer: 'Не вдалося показати файл у провіднику системи: {error}',
            openInDefaultApp: 'Не вдалося відкрити у стандартному застосунку: {error}',
            openInDefaultAppNotAvailable: 'Відкриття у стандартному застосунку недоступне на цій платформі',
            folderNoteAlreadyExists: 'Нотатка теки вже існує',
            folderAlreadyExists: 'Тека «{name}» вже існує',
            folderNotesDisabled: 'Увімкніть нотатки тек у налаштуваннях для конвертації файлів',
            folderNoteAlreadyLinked: 'Цей файл вже працює як нотатка теки',
            folderNoteNotFound: 'У вибраній теці немає нотатки теки',
            folderNoteUnsupportedExtension: 'Непідтримуване розширення файлу: {extension}',
            folderNoteMoveFailed: 'Не вдалося перемістити файл під час конвертації: {error}',
            folderNoteRenameConflict: 'Файл з назвою «{name}» вже існує в теці',
            folderNoteConversionFailed: 'Не вдалося конвертувати файл у нотатку теки',
            folderNoteConversionFailedWithReason: 'Не вдалося конвертувати файл у нотатку теки: {error}',
            folderNoteOpenFailed: 'Файл конвертовано, але не вдалося відкрити нотатку теки: {error}',
            failedToDeleteFile: 'Не вдалося видалити {name}: {error}',
            failedToDeleteMultipleFiles: 'Не вдалося видалити файлів: {count}',
            versionHistoryNotAvailable: 'Сервіс історії версій недоступний',
            drawingAlreadyExists: 'Малюнок з такою назвою вже існує',
            failedToCreateDrawing: 'Не вдалося створити малюнок',
            noFolderSelected: 'У Notebook Navigator не вибрано теку',
            noFileSelected: 'Файл не вибрано'
        },
        warnings: {
            linkBreakingNameCharacters: "Це ім'я містить символи, які ламають посилання Obsidian: #, |, ^, %%, [[, ]].",
            forbiddenNameCharactersAllPlatforms: 'Імена не можуть починатися з крапки або містити : чи /.',
            forbiddenNameCharactersWindows: 'Зарезервовані в Windows символи не дозволені: <, >, ", \\, |, ?, *.'
        },
        notices: {
            folderExcludedFromDescendants: 'Сховано зі списків батьківських тек: {name}',
            folderIncludedInDescendants: 'Показано у списках батьківських тек: {name}',
            mergeNotes: 'Об’єднано нотаток ({count}) у {name}'
        },
        notifications: {
            deletedMultipleFiles: 'Видалено файлів: {count}',
            movedMultipleFiles: 'Переміщено файлів ({count}) до {folder}',
            folderNoteConversionSuccess: 'Файл конвертовано в нотатку теки в «{name}»',
            folderMoved: 'Переміщено теку «{name}»',
            deepLinkCopied: 'URL Obsidian скопійовано в буфер обміну',
            pathCopied: 'Шлях скопійовано в буфер обміну',
            relativePathCopied: 'Відносний шлях скопійовано в буфер обміну',
            linkCopied: 'Посилання скопійовано в буфер обміну',
            footnoteLinkCopied: 'Посилання-виноску скопійовано в буфер обміну',
            embedLinkCopied: 'Посилання вбудовування скопійовано в буфер обміну',
            tagAddedToNote: 'Мітку додано до 1 нотатки',
            tagAddedToNotes: 'Мітку додано до {count} нотаток',
            tagRemovedFromNote: 'Мітку вилучено з 1 нотатки',
            tagRemovedFromNotes: 'Мітку вилучено з {count} нотаток',
            tagsClearedFromNote: 'Очищено всі мітки з 1 нотатки',
            tagsClearedFromNotes: 'Очищено всі мітки з {count} нотаток',
            noTagsToRemove: 'Немає міток для вилучення',
            noFilesSelected: 'Файли не вибрано',
            mergeNotesRequireMultipleMarkdown: 'Виберіть щонайменше дві Markdown-нотатки для об’єднання',
            tagOperationsNotAvailable: 'Операції з мітками недоступні',
            propertyOperationsNotAvailable: 'Операції з властивостями недоступні',
            tagsRequireMarkdown: 'Мітки підтримуються лише для Markdown нотаток',
            propertiesRequireMarkdown: 'Властивості підтримуються лише в нотатках Markdown',
            propertySetOnNote: 'Властивість оновлено в 1 нотатці',
            propertySetOnNotes: 'Властивість оновлено в {count} нотатках',
            manualSortPropertyRemovedFromNote: 'Вилучено властивість сортування з 1 нотатки',
            manualSortPropertyRemovedFromNotes: 'Вилучено властивість сортування з {count} нотаток',
            iconPackDownloaded: '{provider} завантажено',
            iconPackUpdated: '{provider} оновлено ({version})',
            iconPackRemoved: '{provider} вилучено',
            iconPackLoadFailed: 'Не вдалося завантажити {provider}',
            hiddenFileReveal: 'Файл прихований. Увімкніть «Показати приховані елементи» для відображення'
        },
        confirmations: {
            deleteMultipleFiles: 'Ви впевнені, що хочете видалити файли ({count})?',
            deleteConfirmation: 'Цю дію неможливо скасувати.'
        },
        defaultNames: {
            untitled: 'Без назви'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Неможливо перемістити теку в себе або підтеку.',
            itemAlreadyExists: 'Елемент з назвою «{name}» вже існує в цьому місці.',
            failedToMove: 'Не вдалося перемістити: {error}',
            failedToAddTag: 'Не вдалося додати мітку «{tag}»',
            failedToSetProperty: 'Не вдалося оновити властивість: {error}',
            failedToClearTags: 'Не вдалося очистити мітки',
            failedToMoveFolder: 'Не вдалося перемістити теку «{name}»',
            failedToImportFiles: 'Не вдалося імпортувати: {names}'
        },
        notifications: {
            filesAlreadyExist: 'У місці призначення вже існують файли: {count}',
            filesAlreadyHaveTag: 'Файли вже мають цю мітку або конкретнішу: {count}',
            filesAlreadyHaveProperty: 'Файли вже мають цю властивість: {count}',
            noTagsToClear: 'Немає міток для очищення',
            fileImported: 'Імпортовано 1 файл',
            filesImported: 'Імпортовано файлів: {count}'
        }
    },

    // Date grouping
    dateGroups: {
        future: 'Майбутнє',
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
        createNewNoteFromTemplate: 'Створити нову нотатку з шаблону', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Перемістити файли', // Command palette: Move selected files to another folder (English: Move files)
        mergeNotes: 'Об’єднати нотатки', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'Вибрати наступний файл', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Вибрати попередній файл', // Command palette: Selects the previous file in the current view (English: Select previous file)
        navigateBack: 'Перейти назад',
        navigateForward: 'Перейти вперед',
        convertToFolderNote: 'Конвертувати в нотатку теки', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Встановити як нотатку теки', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: "Від'єднати нотатку теки", // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Закріпити всі нотатки тек', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Перейти до теки', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Перейти до мітки', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        navigateToProperty: 'Перейти до властивості', // Command palette: Navigate to a property key or value using fuzzy search (English: Navigate to property)
        addShortcut: 'Додати до ярликів', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: 'Відкрити ярлик {number}',
        toggleDescendants: 'Перемкнути нащадків', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Перемкнути приховані теки, мітки та нотатки', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Перемкнути порядок сортування міток', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: 'Перемкнути мітки за вибором',
        togglePropertiesBySelection: 'Перемкнути властивості за вибором',
        toggleCompactMode: 'Перемкнути компактний режим', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Перемкнути закріплений розділ',
        collapseExpand: 'Згорнути / розгорнути всі елементи навігації', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all navigation items)
        collapseExpandListGroups: 'Згорнути / розгорнути всі групи списку',
        collapseExpandSelectedItem: 'Згорнути / розгорнути вибраний елемент',
        addTag: 'Додати мітку до вибраних файлів', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        setProperty: 'Встановити властивість для вибраних файлів', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'Вилучити мітку з вибраних файлів', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Вилучити всі мітки з вибраних файлів', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        openAllFiles: 'Відкрити всі файли', // Command palette: Opens all files in the current folder or tag (English: Open all files)
        rebuildCache: 'Перебудувати кеш', // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
        restoreDefaultSettings: 'Відновити типові налаштування' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        calendarViewName: 'Календар', // Name shown in the view header/tab (English: Calendar)
        folderNoteSidebarViewName: 'Нотатка теки', // Name shown in the folder note sidebar tab (English: Folder note)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Показати в Notebook Navigator', // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
        settingsUnavailableNotice:
            'Notebook Navigator не зміг прочитати свої налаштування і не запустився. Якщо сховище синхронізується, перезапустіть Obsidian після завершення синхронізації. Щоб почати заново з типовими налаштуваннями, виконайте команду «Відновити типові налаштування».', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsMissingConfirm: {
            title: 'Почати з типовими налаштуваннями?', // Title of the dialog shown when the plugin is enabled while its settings file is missing (English: Start with default settings?)
            messageRecentInstall:
                'Notebook Navigator щойно встановлено, і файл налаштувань відсутній. Якщо це нове встановлення або перевстановлення, продовжте з типовими налаштуваннями. Якщо налаштування надходять зі служби синхронізації, скасуйте, дочекайтеся завершення синхронізації та перезапустіть Obsidian.', // Dialog message when the plugin folder was written recently (English: Notebook Navigator was just installed and has no settings file. If this is a new install or a reinstall, continue with default settings. If your settings come from a sync service, cancel, wait for the sync to complete, and restart Obsidian.)
            messageExistingInstall:
                'Notebook Navigator встановлено на цьому пристрої вже давно, але файл налаштувань відсутній. Якщо сховище ще синхронізується, скасуйте, дочекайтеся завершення синхронізації та перезапустіть Obsidian, щоб зберегти наявні налаштування. Продовжуйте, лише якщо хочете почати заново з типовими налаштуваннями.', // Dialog message when the plugin folder has existed for a while (English: Notebook Navigator has been installed on this device for a while, but its settings file is missing. If your vault is still syncing, cancel, wait for the sync to complete, and restart Obsidian to keep your existing settings. Continue only to start over with default settings.)
            confirmButton: 'Використати типові налаштування' // Confirm button label in the missing-settings dialog (English: Use default settings)
        },
        settingsRecovery: {
            confirmTitle: 'Відновити типові налаштування', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'Це замінить файл налаштувань Notebook Navigator типовими налаштуваннями. Якщо сховище все ще синхронізується, відновлені типові налаштування можуть перезаписати налаштування, збережені на інших ваших пристроях. Читабельний файл налаштувань спочатку копіюється до резервної копії з позначкою часу в теці плагіна.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'Відновити типові', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: 'Не вдалося завершити відновлення налаштувань. Локальні параметри збережено.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'Типові налаштування відновлено. Перезапустіть Obsidian, щоб завершити.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Останнє змінення',
        createdAt: 'Створено',
        file: 'файл',
        files: 'файлів',
        folder: 'тека',
        folders: 'тек',
        wordCount: 'Кількість слів',
        unfinishedTasks: 'Незавершені завдання'
    },

    fileCounts: {
        words: 'слів: {count}',
        characters: 'символів: {count}',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'Змінити стандартні налаштування',
        metadataReport: {
            exportSuccess: 'Звіт про помилки метаданих експортовано до: {filename}',
            exportFailed: 'Не вдалося експортувати звіт метаданих'
        },
        index: {
            label: 'Загальне',
            description: 'Примітки до випуску, підтримка, профіль сховища, типи файлів і ключі властивостей.',
            groups: {
                about: 'Про плагін'
            }
        },
        pageGroups: {
            configuration: 'Конфігурація',
            navigationPane: 'Панель навігації',
            listPane: 'Панель списку',
            calendarAndTools: 'Календар і інструменти'
        },
        pages: {
            displayFilters: {
                label: 'Фільтри відображення',
                description: 'Приховані теки, мітки, файли, мітки файлів і правила властивостей.'
            },
            appearanceAndBehavior: {
                label: 'Вигляд і поведінка',
                description: 'Поведінка, навігація з клавіатури, кнопки миші, вигляд і форматування.',
                groups: {
                    startup: 'Запуск',
                    keyboardNavigation: 'Навігація з клавіатури',
                    mouseButtons: 'Кнопки миші',
                    desktopAppearance: "Вигляд на комп'ютері",
                    mobileAppearance: 'Мобільний вигляд',
                    appearance: 'Вигляд',
                    icons: 'Іконки',
                    formatting: 'Форматування'
                }
            },
            navigationPane: {
                label: 'Панель навігації',
                description: 'Розмітка, вигляд, кількість файлів, поведінка згортання та кольори веселки.',
                groups: {
                    appearance: 'Вигляд',
                    banner: 'Банер',
                    collapseItems: 'Згортати елементи',
                    dragAndDrop: 'Перетягування',
                    fileCounts: 'Кількість файлів',
                    rainbowColors: 'Кольори веселки'
                }
            },
            shortcutsAndRecentFiles: {
                label: 'Ярлики та останні файли',
                description: 'Видимість ярликів, значки, останні файли та закріплені елементи.',
                groups: {
                    shortcuts: 'Ярлики',
                    recentFiles: 'Останні файли'
                }
            },
            foldersAndFolderNotes: {
                label: 'Теки та нотатки тек',
                description: 'Відображення тек, нотатки тек, шаблони нотаток тек і поведінка нотаток тек.',
                groups: {
                    folders: 'Теки',
                    folderNotes: 'Нотатки тек',
                    folderNoteFiles: 'Файли нотаток тек'
                }
            },
            tagsAndProperties: {
                label: 'Мітки та властивості',
                description: 'Розділи міток і властивостей, іконки, сортування, область дії та успадкування.',
                groups: {
                    tags: 'Мітки',
                    properties: 'Властивості'
                }
            },
            listPane: {
                label: 'Панель списку',
                description: 'Сортування, групування, режими списку, закріплені нотатки та перегляд малюнків.',
                groups: {
                    appearance: 'Вигляд',
                    sortAndGroup: 'Сортування та групування',
                    groupHeaders: 'Заголовки груп',
                    manualSort: 'Ручне сортування',
                    pinnedNotes: 'Закріплені нотатки',
                    behavior: 'Поведінка',
                    drawingPreviews: 'Перегляд малюнків'
                }
            },
            fileOperations: {
                label: 'Операції з файлами',
                description: 'Шаблони, підтвердження видалення, вкладення та поведінка при конфлікті переміщення файлів.',
                groups: {
                    templates: 'Шаблони'
                }
            },
            frontmatterFields: {
                label: 'Поля frontmatter',
                description: 'Поля frontmatter для відображуваних імен, часових позначок, іконок і кольорів.'
            },
            fileDisplay: {
                label: 'Відображення файлів',
                description:
                    'Заголовки, текст попереднього перегляду, головні зображення, мітки, властивості, дати, кількість слів і кількість символів.',
                groups: {
                    icon: 'Іконка',
                    title: 'Заголовок',
                    previewText: 'Текст попереднього перегляду',
                    featureImage: 'Головне зображення',
                    tags: 'Мітки',
                    properties: 'Властивості',
                    tasks: 'Завдання',
                    date: 'Дата',
                    parentFolder: 'Батьківська тека',
                    wordAndCharacterCount: 'Кількість слів і символів'
                }
            },
            calendar: {
                label: 'Календар',
                description: 'Відображення календаря, нотатки дат, шаблони, локаль і розташування бічної панелі.',
                groups: {
                    appearance: 'Вигляд',
                    leftSidebar: 'Ліва бічна панель',
                    calendarIntegration: 'Інтеграція з календарем',
                    rightSidebar: 'Права бічна панель'
                }
            },
            iconPacks: {
                label: 'Пакети іконок',
                description: 'Іконки інтерфейсу, іконки файлів і керування пакетами іконок.'
            },
            advanced: {
                label: 'Розширені',
                description: 'Діагностика, очищення метаданих, імпорт/експорт і скидання.',
                groups: {
                    maintenance: 'Обслуговування',
                    resetSettings: 'Скидання налаштувань'
                }
            }
        },
        syncMode: {
            notSynced: '(не синхронізовано)',
            enableSync: 'Увімкнути синхронізацію',
            disableSync: 'Вимкнути синхронізацію'
        },
        items: {
            listPaneTitle: {
                name: 'Заголовок панелі списку',
                desc: 'Виберіть, де показувати заголовок панелі списку.',
                options: {
                    header: 'Показувати в заголовку',
                    listPane: 'Показувати в панелі списку',
                    hidden: 'Не показувати'
                }
            },
            defaultSortOrder: {
                name: 'Порядок сортування за замовчуванням',
                desc: 'Виберіть порядок сортування нотаток за замовчуванням. Властивості з «Властивості сортування» відображаються як додаткові варіанти сортування.',
                directions: {
                    asc: 'За зростанням',
                    desc: 'За спаданням'
                },
                dateDirections: {
                    newestOnTop: 'Найновіші зверху',
                    oldestOnTop: 'Найстаріші зверху'
                },
                textDirections: {
                    aOnTop: 'А зверху',
                    zOnTop: 'Я зверху'
                },
                fields: {
                    dateEdited: 'Дата редагування',
                    dateCreated: 'Дата створення',
                    title: 'Заголовок',
                    fileName: 'Назва файлу',
                    property: 'Властивість'
                }
            },
            defaultSortDirection: {
                name: 'Напрям сортування'
            },
            defaultGroupingDirection: {
                name: 'Напрям групування',
                options: {
                    follow: 'Відповідно до сортування'
                }
            },
            sortingProperties: {
                name: 'Властивості сортування',
                desc: 'Властивості frontmatter, розділені комами. Кожна властивість відображається як варіант сортування в налаштуванні «Порядок сортування за замовчуванням» і в меню сортування на панелі списку. Ці властивості не змінюються.',
                placeholder: 'published, author',
                defaultsResetNotices: {
                    sort: 'Порядок сортування за замовчуванням скинуто, бо його властивість більше недоступна.',
                    grouping: 'Групування за замовчуванням скинуто, бо його властивість більше недоступна.',
                    both: 'Порядок сортування та групування за замовчуванням скинуто, бо їхні властивості більше недоступні.'
                }
            },
            propertySecondarySort: {
                name: 'Вторинне сортування',
                desc: 'Використовується при сортуванні за властивістю, коли нотатки мають однакове значення властивості або не мають значення.',
                options: {
                    title: 'Заголовок',
                    fileName: 'Назва файлу',
                    dateCreated: 'Дата створення',
                    dateEdited: 'Дата редагування'
                }
            },
            propertySortInstructions: {
                intro: 'Як працюють сортування та групування за властивістю:',
                items: [
                    '**Сортування:** Якщо вибрати властивість, наприклад «Пріоритет», нотатки сортуються за значеннями пріоритету.',
                    '**Групування:** Якщо вибрати властивість, наприклад «Статус», для кожного значення створюється заголовок. Нотатки з однаковим статусом відображаються під одним заголовком.',
                    '**Кілька значень:** Якщо властивість містить список, Notebook Navigator використовує весь список. Наприклад, якщо «Теми» містять «Книги» та «Історія», нотатка сортується або групується за повним значенням «Книги, Історія», а не за кожною темою окремо.',
                    '**Відсутні значення:** Під час групування нотатки без цієї властивості відображаються в кінці під **Немає**.',
                    '**Перегляди міток і властивостей:** Якщо вибрано групування **Тека**, натомість відображаються заголовки дат.'
                ]
            },
            groupingProperties: {
                name: 'Властивості групування',
                desc: 'Властивості frontmatter, розділені комами. Кожна властивість відображається як варіант групування в налаштуванні «Групування за замовчуванням» і в меню сортування на панелі списку. Ці властивості не змінюються.',
                placeholder: 'status, genre'
            },
            manualSortProperty: {
                name: 'Властивість ручного сортування',
                desc: 'Властивість frontmatter, що використовується для зберігання числових значень індексу для ручного сортування.'
            },
            groupHeaderProperty: {
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
                    belowSelectedNote: 'Під вибраною нотаткою',
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
            scrollToSelectedFileOnListChanges: {
                name: 'Прокручувати до вибраного файлу при змінах списку',
                desc: 'Прокручувати до вибраного файлу при закріпленні нотаток, показі нотаток нащадків, зміні вигляду теки або виконанні файлових операцій.'
            },
            includeDescendantNotes: {
                name: 'Показувати нотатки з підтек / нащадків',
                desc: 'Включати нотатки з вкладених підтек та нащадків міток і властивостей при перегляді теки, мітки або властивості.'
            },
            filterPinnedNotesByFolder: {
                name: 'Закріплювати нотатки лише в їхній теці',
                desc: 'Закріплені нотатки відображаються як закріплені лише у своїй власній теці. Корисно для нотаток-тек або якщо у вас багато закріплених нотаток. Не впливає на подання міток або властивостей.'
            },
            separateFileCounts: {
                name: 'Показувати поточні та нащадкові кількості файлів окремо',
                desc: 'Відображати кількість файлів у форматі «поточні ▾ нащадки» для тек, міток і властивостей.'
            },
            defaultGrouping: {
                name: 'Групування за замовчуванням',
                desc: '**Заголовки** позначають відсортований список, не змінюючи його порядок: «Користувацьке» показує заголовки, визначені у frontmatter, а «Дата» вставляє заголовки дат. **Групи** переупорядковують список: групи тек і властивостей упорядковуються окремо, а нотатки в кожній групі відповідають порядку сортування.',
                families: {
                    headers: 'Заголовки',
                    groups: 'Групи'
                },
                options: {
                    custom: 'Користувацьке',
                    date: 'Дата',
                    folder: 'Тека'
                }
            },
            alwaysShowAllTagAndPropertyPills: {
                name: 'Завжди показувати всі позначки міток та властивостей',
                desc: 'Коли вимкнено, позначки, що відповідають поточному вибору навігації, приховуються (наприклад, позначка мітки «рецепти» приховується під час перегляду мітки «рецепти»). Увімкніть, щоб усі позначки залишалися видимими.'
            },
            stickyGroupHeaders: {
                name: 'Закріплені заголовки груп',
                desc: 'Тримати заголовок поточної дати, теки, властивості або закріпленого розділу видимим під час прокручування.'
            },
            showSubfolderPaths: {
                name: 'Показувати шляхи підтек',
                desc: 'Під час групування за текою на панелі списку показувати шляхи підтек замість лише назв тек.'
            },
            showGroupHeaderItemCounts: {
                name: 'Показувати кількість елементів',
                desc: 'Відображає кількість елементів у кожному заголовку групи на панелі списку.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'Групування за теками: файли поточної теки внизу',
                desc: 'Коли для групування за замовчуванням вибрано «Тека», файли безпосередньо у вибраній теці буде показано нижче груп підтек.'
            },
            defaultListMode: {
                name: 'Режим списку за замовчуванням',
                desc: 'Виберіть макет списку за замовчуванням. Стандартний показує заголовок, дату, опис та текст попереднього перегляду. Компактний показує лише заголовок. Перевизначте вигляд для кожної теки.',
                options: {
                    standard: 'Стандартний',
                    compact: 'Компактний'
                }
            },
            showFileIcons: {
                name: 'Показувати іконки файлів',
                desc: 'Відображати іконки файлів з вирівнюванням ліворуч. Вимкнення видаляє як іконки, так і відступ. Пріоритет: значок незавершених завдань > користувацький значок > значок теки > значок назви файлу > значок типу файлу > значок за замовчуванням.'
            },
            unfinishedTaskIcon: {
                name: 'Значок незавершених завдань',
                desc: 'Замінювати значок файлу, коли нотатка містить незавершені завдання.',
                options: {
                    disabled: 'Вимкнено',
                    compact: 'Компактний режим',
                    standardAndCompact: 'Стандартний і компактний'
                }
            },
            useFolderIcon: {
                name: 'Використовувати значок теки',
                desc: 'Відображати значок батьківської теки, коли не задано користувацький значок файлу. Колір теки використовується, коли не задано користувацький колір файлу.'
            },
            showFileTaskProgress: {
                name: 'Перебіг виконання завдань',
                desc: 'Показувати статус завдань із необов’язковими смугою прогресу та кількістю завдань. Кольори незавершених і завершених завдань можна налаштувати окремо в плагіні Style Settings.'
            },
            showFileTaskProgressBar: {
                name: 'Перебіг виконання завдань: смуга прогресу',
                desc: 'Показувати смугу прогресу поруч зі значком завдань.'
            },
            showFileTaskProgressCount: {
                name: 'Перебіг виконання завдань: кількість завдань',
                desc: 'Показувати кількість завершених і загальну кількість завдань, наприклад 3/7.'
            },
            hideFileTaskProgressWhenComplete: {
                name: 'Перебіг виконання завдань: приховувати після завершення',
                desc: 'Приховувати прогрес завдань, коли всі завдання в нотатці завершені.'
            },
            unfinishedTaskBackground: {
                name: 'Фон незавершених завдань',
                desc: 'Застосовувати колір фону, коли нотатка містить незавершені завдання.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'Колір фону незавершених завдань',
                desc: 'Встановити колір фону, що використовується коли нотатка містить незавершені завдання.'
            },
            showFileNameIcons: {
                name: 'Іконки за назвою файлу',
                desc: 'Призначити іконки файлам на основі тексту в їхніх назвах.'
            },
            fileNameIconMap: {
                name: 'Зіставлення назв та іконок',
                desc: 'Файли, що містять текст, отримують вказану іконку. Одне зіставлення на рядок: текст=іконка',
                placeholder: '# текст=іконка\nзустріч=ph-calendar\nрахунок=ph-receipt',
                editTooltip: 'Редагувати зіставлення'
            },
            showFileTypeIcons: {
                name: 'Іконки за типом файлу',
                desc: 'Призначити іконки файлам на основі їхнього розширення.'
            },
            fileTypeIconPreset: {
                name: 'Попередній набір іконок файлів',
                desc: 'Виберіть вбудовані іконки або попередній набір пакета іконок. Користувацькі правила розширень замінюють цей попередній набір.',
                options: {
                    builtIn: 'Вбудовані іконки'
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
                resetTooltip: 'Відновити значення за замовчуванням (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Масштабувати текст з висотою компактних елементів',
                desc: 'Масштабувати текст компактного списку при зменшенні висоти елементів.'
            },
            showParentFolder: {
                name: 'Показувати батьківську теку',
                desc: 'Відображати назву батьківської теки для нотаток у підтеках, мітках або властивостях.'
            },
            showFolderPath: {
                name: 'Показувати шлях до теки',
                desc: 'Відображати шлях відносно вибраної теки, а не лише назву теки. Мітки та властивості показують повний шлях.'
            },
            parentFolderClickOpensFolder: {
                name: 'Натискання на батьківську теку відкриває теку',
                desc: 'Натискання на підпис батьківської теки відкриває теку в панелі списку.'
            },
            showParentFolderColor: {
                name: 'Показувати колір батьківської теки',
                desc: 'Використовувати кольори тек на підписах батьківських тек.'
            },
            showParentFolderIcon: {
                name: 'Показувати значок батьківської теки',
                desc: 'Показувати значки тек поруч із підписами батьківських тек.'
            },
            showQuickActions: {
                name: 'Показувати швидкі дії',
                desc: "Показувати кнопки дій при наведенні на файли. Елементи керування кнопками вибирають, які дії з'являються."
            },
            dualPane: {
                name: 'Макет подвійної панелі',
                desc: 'Показувати панель навігації та панель списку поруч.'
            },
            dualPaneOrientation: {
                name: 'Орієнтація подвійної панелі',
                desc: 'Виберіть горизонтальний або вертикальний макет при активній подвійній панелі.',
                options: {
                    horizontal: 'Горизонтальний поділ',
                    vertical: 'Вертикальний поділ'
                }
            },
            narrowSidebarBehavior: {
                name: 'Коли бічна панель занадто вузька',
                desc: 'Виберіть, що відбувається, коли панель навігації та панель списку не вміщуються поруч.',
                options: {
                    none: 'Нічого не робити',
                    singlePane: 'Перемкнутися на одну панель',
                    vertical: 'Перемкнутися на вертикальний поділ'
                }
            },
            narrowSidebarThresholdMode: {
                name: 'Поріг вузької бічної панелі',
                desc: 'Виберіть, як обчислюється поріг ширини бічної панелі.',
                options: {
                    fitPanes: 'Умістити панелі',
                    customWidth: 'Користувацька ширина'
                }
            },
            narrowSidebarThresholdWidth: {
                name: 'Ширина порога вузької бічної панелі',
                desc: 'Перемикатися, коли бічна панель вужча за цю ширину.',
                resetTooltip: 'Скинути до ширини за замовчуванням'
            },
            paneBackgroundColor: {
                name: 'Колір фону',
                desc: 'Виберіть кольори фону для панелей навігації та списку.',
                options: {
                    separate: 'Окремі фони',
                    listBackground: 'Використовувати фон списку',
                    navigationBackground: 'Використовувати фон навігації'
                }
            },
            zoomLevel: {
                name: 'Рівень масштабування',
                desc: 'Керує загальним рівнем масштабування Notebook Navigator (у відсотках).'
            },
            useFloatingToolbarsOnIOS: {
                name: 'Використовувати плаваючі панелі інструментів на iOS',
                desc: 'Застосовується лише на iOS.'
            },
            defaultStartupView: {
                name: 'Початковий вигляд в однопанельному режимі',
                desc: 'Виберіть панель, яка відображається при відкритті Notebook Navigator в однопанельному режимі.',
                options: {
                    navigation: 'Панель навігації',
                    listPane: 'Панель списку'
                }
            },
            toolbarButtons: {
                name: 'Кнопки панелі інструментів',
                desc: "Виберіть, які кнопки з'являються на панелі інструментів. Приховані кнопки залишаються доступними через команди та меню."
            },
            openNewNotesInNewTab: {
                name: 'Відкривати нові нотатки в новій вкладці',
                desc: 'Якщо увімкнено, команда «Створити нову нотатку» відкриває нотатки в новій вкладці. Якщо вимкнено, нотатки замінюють поточну вкладку.'
            },
            autoRevealActiveNote: {
                name: 'Автоматично показувати активну нотатку',
                desc: 'Автоматично показувати нотатки при відкритті з Швидкого перемикача, посилань або пошуку.'
            },
            autoRevealShortestPath: {
                name: 'Автопоказ: Використовувати найкоротший шлях',
                desc: 'Увімкнено: Автопоказ обирає найближчу видиму батьківську теку або мітку. Вимкнено: Автопоказ обирає фактичну теку файлу та точну мітку.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Автопоказ: Ігнорувати події з правої бічної панелі',
                desc: 'Не змінювати активну нотатку при натисканні або зміні нотаток у правій бічній панелі.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'Автопоказ: Ігнорувати події з інших вікон',
                desc: 'Не змінювати активну нотатку при роботі з нотатками в іншому вікні.'
            },
            singlePaneAnimation: {
                name: 'Анімація однієї панелі',
                desc: 'Тривалість переходу при перемиканні панелей у режимі однієї панелі (мілісекунди).',
                resetTooltip: 'Скинути до значення за замовчуванням'
            },
            autoSelectFirstNote: {
                name: 'Автоматично вибирати першу нотатку',
                desc: 'Автоматично відкривати першу нотатку при перемиканні тек, міток або властивостей.'
            },
            disableShortcutAutoScroll: {
                name: 'Вимкнути автопрокручування для ярликів',
                desc: 'Не прокручувати панель навігації при натисканні на елементи в ярликах.'
            },
            expandOnSelection: {
                name: 'Розгортати при виборі',
                desc: 'Розгортати теки, мітки та властивості при виборі. У режимі однієї панелі перший вибір розгортає, другий показує файли.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'Одна розгорнута гілка',
                desc: 'Згортати інші гілки в тому самому дереві під час розгортання теки, мітки або властивості.'
            },
            springLoadedFolders: {
                name: 'Розгортати під час перетягування',
                desc: 'Розгортати теки й мітки при наведенні під час перетягування.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Розгортати під час перетягування: Затримка першого розгортання',
                desc: 'Затримка перед розгортанням першої теки або мітки під час перетягування (секунди).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Розгортати під час перетягування: Затримка наступних розгортань',
                desc: 'Затримка перед розгортанням додаткових тек або міток під час того ж перетягування (секунди).'
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
                desc: 'Що відображати біля ярликів. Використовуйте команди «Відкрити ярлик 1-9» для прямого відкриття ярликів.',
                options: {
                    position: 'Позиція (1-9)',
                    count: 'Кількість елементів',
                    none: 'Немає'
                }
            },
            showRecentFiles: {
                name: 'Показувати останні файли',
                desc: 'Відображати розділ останніх файлів у панелі навігації.'
            },
            hideFileTypesFromRecentFiles: {
                name: 'Приховати типи файлів з останніх файлів',
                desc: 'Оберіть типи файлів для приховування в розділі останніх файлів.',
                options: {
                    none: 'Немає',
                    folderNotes: 'Нотатки тек'
                }
            },
            recentFilesCount: {
                name: 'Кількість останніх файлів',
                desc: 'Кількість останніх файлів для відображення.'
            },
            pinRecentFilesWithShortcuts: {
                name: 'Закріпити останні файли разом з ярликами',
                desc: 'Включати останні файли при закріпленні ярликів.'
            },
            enableCalendar: {
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
            calendarSinglePanePlacement: {
                name: 'Розташування в режимі однієї панелі',
                desc: 'Де відображається календар у режимі однієї панелі.',
                options: {
                    navigationPane: 'Панель навігації',
                    belowPanes: 'Під панелями'
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
            calendarMonthNameFormat: {
                name: 'Формат назви місяця',
                desc: 'Повна (січень) або скорочена (січ) назва місяця.',
                options: {
                    full: 'січень (повна)',
                    short: 'січ (коротка)'
                }
            },
            showInfoButtons: {
                name: 'Показувати кнопки інформації',
                desc: 'Відображати кнопки інформації в рядку пошуку та заголовку календаря.'
            },
            calendarLeftSidebarWeeksToShow: {
                name: 'Тижнів для показу на лівій бічній панелі',
                desc: 'Календар на правій бічній панелі завжди відображає повний місяць.',
                options: {
                    fullMonth: 'Повний місяць',
                    oneWeek: '1 тиждень',
                    weeksCount: 'Тижнів: {count}'
                }
            },
            calendarHighlightToday: {
                name: 'Виділяти сьогоднішню дату',
                desc: 'Виділяти сьогоднішню дату кольором фону та жирним текстом.'
            },
            calendarShowFeatureImage: {
                name: 'Показувати головне зображення',
                desc: 'Відображати головні зображення нотаток у календарі.'
            },
            calendarShowTasks: {
                name: 'Показувати завдання',
                desc: 'Показувати індикатор на днях, тижнях і місяцях із незавершеними завданнями.'
            },
            calendarShowWeekNumber: {
                name: 'Показувати номер тижня',
                desc: 'Додати колонку з номером тижня.'
            },
            calendarShowQuarter: {
                name: 'Показувати квартал',
                desc: 'Додати підпис кварталу в заголовок календаря.'
            },
            calendarShowOutsideMonthDays: {
                name: 'Показувати дні інших місяців',
                desc: 'Показувати дні попереднього та наступного місяця, коли календар відображає повний місяць.'
            },
            calendarShowYearCalendar: {
                name: 'Показувати річний календар',
                desc: 'Відображати навігацію по роках і сітку місяців у правій бічній панелі.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Підтверджувати перед створенням нотатки',
                desc: 'Показати діалог підтвердження при створенні нової щоденної нотатки.'
            },
            calendarShowHiddenItems: {
                name: 'Показати приховані елементи',
                desc: 'При увімкненні календар завжди показує всі нотатки календаря, включно з нотатками, прихованими фільтрами профілю сховища.'
            },
            dailyNoteSource: {
                name: 'Джерело щоденних нотаток',
                desc: 'Джерело для нотаток календаря.',
                options: {
                    dailyNotes: 'Щоденні нотатки (основний плагін)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'Тека та формат дати налаштовуються в плагіні Daily Notes.'
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

            periodicNotesRootFolder: {
                name: 'Коренева тека (профіль сховища)',
                desc: 'Базова тека для періодичних нотаток. Шаблони дат можуть включати підтеки. Змінюється з вибраним профілем сховища.',
                placeholder: 'Особисте/Щоденник'
            },
            templateFolderLocation: {
                name: 'Розташування теки шаблонів',
                desc: 'Вибір файлу шаблону показує нотатки з цієї теки.',
                placeholder: 'Шаблони',
                usage: 'Використовується нотатками календаря та нотатками тек. Налаштуйте шаблони в Календар > Інтеграція з календарем і Теки та нотатки тек > Файли нотаток тек.'
            },
            calendarDailyNotePattern: {
                name: 'Щоденні нотатки',
                desc: 'Формат шляху з використанням формату дати Moment. Беріть назви підтек у квадратні дужки, напр. [Work]/YYYY. Натисніть на іконку шаблону, щоб задати шаблон. Вкажіть розташування теки шаблонів у Операції з файлами > Шаблони.',
                placeholder: 'YYYY/YYYYMMDD',
                parsingError: 'Шаблон має форматуватися і знову розбиратися як повна дата (рік, місяць, день).'
            },
            calendarPeriodicNotePatterns: {
                momentDescPrefix: 'Формат шляху з використанням ',
                momentLinkText: 'формату дати Moment',
                momentDescSuffix:
                    '. Беріть назви підтек у квадратні дужки, напр. [Work]/YYYY. Натисніть на іконку шаблону, щоб задати шаблон. Вкажіть розташування теки шаблонів у Операції з файлами > Шаблони.',
                templateTokenNoticeLabel: 'Важливо!',
                templateTokenNotice:
                    'Підтримка шаблонів потребує плагіна Templater. Вбудовані формати, такі як {{date}} і {{title}}, працюють лише коли для параметра {source} вибрано значення {option}.',
                example: 'Поточний синтаксис: {path}'
            },
            templaterSupport: {
                installed: '✅ Плагін Templater встановлено з повною підтримкою шаблонів.',
                missing: '⚠️ Установіть плагін Templater для підтримки шаблонів.'
            },
            calendarWeeklyNotePattern: {
                name: 'Щотижневі нотатки',
                parsingError: 'Шаблон має форматуватися і знову розбиратися як повний тиждень (рік тижня, номер тижня).',
                weekPathMismatchWarning:
                    'Шляхи щотижневих нотаток використовують мову періодичних нотаток. Використовуйте відповідні мови або використовуйте "GGGG" з "WW" для тижнів, що починаються з понеділка.',
                mixedWeekTokensWarning:
                    'Цей шаблон змішує токени тижня, що починається з понеділка ("W" або "G"), з токенами тижня на основі мови ("w" або "g"). Використовуйте один набір послідовно: "GGGG" з "WW" для тижнів, що починаються з понеділка, або "gggg" з "ww", якщо щотижневі нотатки мають відповідати обраній мові.'
            },
            calendarMonthlyNotePattern: {
                name: 'Щомісячні нотатки',
                parsingError: 'Шаблон має форматуватися і знову розбиратися як повний місяць (рік, місяць).'
            },
            calendarQuarterlyNotePattern: {
                name: 'Квартальні нотатки',
                parsingError: 'Шаблон має форматуватися і знову розбиратися як повний квартал (рік, квартал).'
            },
            calendarYearlyNotePattern: {
                name: 'Річні нотатки',
                parsingError: 'Шаблон має форматуватися і знову розбиратися як повний рік (рік).'
            },
            periodicNoteTemplateFile: {
                current: 'Файл шаблону: {name}'
            },
            showTooltips: {
                name: 'Показувати підказки',
                desc: 'Відображати підказки при наведенні з додатковою інформацією для нотаток і тек.'
            },
            showTooltipPath: {
                name: 'Показувати шлях у підказках',
                desc: 'Відображати шлях теки під назвами нотаток у підказках.'
            },
            showTooltipTags: {
                name: 'Показувати мітки в підказках',
                desc: 'Відображати мітки нотаток у підказках, коли ввімкнено розділ міток.'
            },
            showTooltipWordCount: {
                name: 'Показувати кількість слів у підказках',
                desc: 'Відображати кількість слів у підказках, коли ввімкнено підрахунок слів.'
            },
            resetPaneSeparator: {
                name: 'Скинути позицію роздільника панелей',
                desc: 'Скинути перетягуваний роздільник між панеллю навігації та панеллю списку до позиції за замовчуванням.',
                buttonText: 'Скинути роздільник',
                notice: 'Позицію роздільника скинуто. Перезапустіть Obsidian або відкрийте Notebook Navigator знову для застосування.'
            },
            importAndExportSettings: {
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
            shiftEnterAction: {
                name: 'Shift+Enter',
                desc: 'Виберіть, чи Shift+Enter відкриває або перейменовує вибраний файл.'
            },
            cmdEnterAction: {
                name: 'Cmd+Enter',
                desc: 'Виберіть, чи Cmd+Enter відкриває або перейменовує вибраний файл.'
            },
            ctrlEnterAction: {
                name: 'Ctrl+Enter',
                desc: 'Виберіть, чи Ctrl+Enter відкриває або перейменовує вибраний файл.'
            },
            mouseBackForwardAction: {
                name: 'Кнопки «Назад»/«Вперед» миші',
                desc: 'Дія кнопок «Назад» і «Вперед» миші на десктопі.',
                options: {
                    systemDefault: 'Використовувати системне значення',
                    singlePaneSwitch: 'Перемикання панелей (одна панель)',
                    history: 'Навігація по історії'
                }
            },
            showFileTypes: {
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
            hideNotesWithPropertyRules: {
                name: 'Приховати нотатки за правилами властивостей (профіль сховища)',
                desc: 'Список правил frontmatter, розділених комами. Використовуйте записи `key` або `key=value` (наприклад, status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            hideFiles: {
                name: 'Приховати файли (профіль сховища)',
                desc: 'Список шаблонів імен файлів через кому для приховування. Підтримує символи підстановки * та шляхи / (наприклад, temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Профіль сховища',
                desc: 'Профілі зберігають видимість типів файлів, приховані файли, приховані теки, приховані мітки, правила властивостей для прихованих нотаток, ярлики та банер навігації. Перемикайте профілі із заголовка панелі навігації.',
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
                    'Видалити {name}? Фільтри прихованих файлів, тек, міток та нотаток на основі властивостей, збережені в цьому профілі, будуть видалені.',
                moveUp: 'Перемістити вгору',
                moveDown: 'Перемістити вниз',
                errors: {
                    emptyName: 'Введіть назву профілю',
                    duplicateName: 'Назва профілю вже існує'
                }
            },
            vaultTitlePlacement: {
                name: 'Розташування назви сховища',
                desc: 'Виберіть, де відображається назва сховища.',
                options: {
                    header: 'Показати в заголовку',
                    navigation: 'Показати на панелі навігації'
                }
            },
            hideFolders: {
                name: 'Приховати теки (профіль сховища)',
                desc: 'Список тек для приховування, розділених комами. Шаблони назв: assets* (теки, що починаються з assets), *_temp (закінчуються на _temp). Шаблони шляхів: /архів (лише кореневий архів), /res* (кореневі теки, що починаються з res), /*/temp (теки temp на один рівень вглиб), /проекти/* (всі теки всередині теки проекти).',
                placeholder: 'шаблони, assets*, /архів, /res*'
            },
            descendantExcludedFolders: {
                name: 'Виключати теки з нотаток підтек (профіль сховища)',
                desc: 'Список тек, розділених комами, які пропускаються під час збирання нотаток із підтек. Теки залишаються видимими, і вибір теки й надалі показує її нотатки. Використовує ті самі шаблони, що й Приховати теки.',
                placeholder: 'щоденні, ресурси, /архів'
            },
            showFileDate: {
                name: 'Показувати дату',
                desc: 'Відображати дату під назвами нотаток.'
            },
            dateWhenSortingByName: {
                name: 'При сортуванні за назвою',
                desc: 'Дата для показу при алфавітному сортуванні нотаток.',
                options: {
                    created: 'Дата створення',
                    modified: 'Дата зміни'
                }
            },
            showFileTags: {
                name: 'Показувати мітки файлів',
                desc: 'Відображати клікабельні мітки в елементах файлів.'
            },
            showFullTagPaths: {
                name: 'Показувати повні шляхи міток',
                desc: "Відображати повні шляхи ієрархії міток. При увімкненні: 'ai/openai', 'робота/проекти/2024'. При вимкненні: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Розфарбовувати мітки файлів',
                desc: 'Застосовувати кольори міток до позначок міток на елементах файлів.'
            },
            showColoredTagsFirst: {
                name: 'Показувати кольорові мітки першими',
                desc: 'Сортувати кольорові мітки перед іншими мітками на елементах файлів.'
            },
            showFileTagsInCompactMode: {
                name: 'Показувати мітки файлів у компактному режимі',
                desc: 'Відображати мітки, коли дата, попередній перегляд та зображення приховані.'
            },
            showFileProperties: {
                name: 'Показувати властивості файлів',
                desc: 'Відображати властивості в елементах файлів. Використовуйте вікно «Видимість ключів властивостей», щоб вибрати, які властивості відображаються.'
            },
            colorFileProperties: {
                name: 'Забарвлювати властивості файлів',
                desc: 'Застосовувати кольори властивостей до позначок властивостей на елементах файлів.'
            },
            showColoredPropertiesFirst: {
                name: 'Показувати кольорові властивості першими',
                desc: 'Сортувати кольорові властивості перед іншими властивостями на елементах файлів.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Показувати властивості в компактному режимі',
                desc: 'Відображати властивості при активному компактному режимі.'
            },
            textCountType: {
                name: 'Тип лічильника',
                desc: 'Виберіть, які лічильники тексту відображаються в елементах файлів.',
                options: {
                    none: 'Немає',
                    words: 'Кількість слів',
                    characters: 'Кількість символів',
                    both: 'Кількість слів і символів'
                }
            },
            textCountPlacement: {
                name: 'Розміщення',
                desc: 'Виберіть, де відображаються лічильники тексту.',
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
            showTargetPercentage: {
                name: 'Показувати відсоток цілі',
                desc: 'Показувати лише відсоток прогресу, коли доступна цільова кількість слів.'
            },
            textCountActiveNotice: {
                title: 'Підрахунок усе ще увімкнено',
                summary: 'Кількість слів або символів і далі підраховується для всіх нотаток, оскільки її використовують такі елементи:',
                more: 'і ще {count}',
                reasons: {
                    appearance: 'Вигляд файлів',
                    'group-header': 'Заголовок групи'
                },
                scopes: {
                    folder: 'Папка: {name}',
                    tag: 'Тег: #{name}',
                    property: 'Властивість: {name}'
                }
            },
            propertyKeys: {
                name: 'Ключі властивостей (профіль сховища)',
                desc: 'Ключі властивостей метаданих з налаштуванням видимості для кожного ключа в навігації та списку файлів.',
                addButtonTooltip: 'Налаштувати ключі властивостей',
                noneConfigured: 'Властивості не налаштовані',
                singleConfigured: '1 властивість налаштована: {properties}',
                multipleConfigured: 'Налаштовані властивості ({count}): {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'Показувати властивості в окремих рядках',
                desc: 'Показувати кожну властивість у власному рядку.'
            },
            linkPropertyPillsToNotes: {
                name: "Пов'язати позначки властивостей із нотатками",
                desc: "Натисніть на позначку властивості, щоб відкрити пов'язану нотатку."
            },
            linkPropertyPillsToUrls: {
                name: "Пов'язати позначки властивостей із URL-адресами",
                desc: "Натисніть на позначку властивості, щоб відкрити пов'язану URL-адресу."
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
            showNotePreview: {
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
            skipCalloutsInPreview: {
                name: 'Пропускати блоки callout у попередньому перегляді',
                desc: 'Пропускати блоки callout при генерації тексту попереднього перегляду.'
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
            fallbackToNoteContent: {
                name: 'Використовувати вміст нотатки як запасний варіант',
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
            titleRows: {
                name: 'Рядки заголовка',
                desc: 'Кількість рядків для відображення заголовків нотаток.',
                options: {
                    '1': '1 рядок',
                    '2': '2 рядки',
                    '3': '3 рядки'
                }
            },
            useFolderColor: {
                name: 'Використовувати колір теки',
                desc: 'Забарвлювати заголовки нотаток та значки файлів кольором батьківської теки, коли не задано користувацький колір файлу. Пріоритет: користувацький колір файлу > колір теки > колір за замовчуванням.'
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
                desc: 'Список властивостей frontmatter, розділених комами, для перевірки в першу чергу. Якщо їх немає, використовується перше зображення з вмісту markdown.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'Виключити нотатки з властивостями',
                desc: 'Список властивостей frontmatter, розділених комами. Нотатки, що містять будь-яку з цих властивостей, не зберігають головні зображення.',
                placeholder: 'private, confidential'
            },
            featureImageDisplaySize: {
                name: 'Розмір відображення головного зображення',
                desc: 'Максимальний розмір відображення головних зображень у списках нотаток.',
                options: {
                    '64': '64 px',
                    '96': '96 px',
                    '128': '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'Піксельний розмір головного зображення',
                desc: 'Роздільна здатність, що використовується при створенні збережених мініатюр головних зображень. Збільшіть це значення, якщо великі попередні перегляди виглядають розмитими.',
                options: {
                    '256x144': '256 x 144 px',
                    '384x216': '384 x 216 px',
                    '512x288': '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'Завантажувати зовнішні зображення',
                desc: 'Завантажувати віддалені зображення та мініатюри YouTube для головних зображень.'
            },
            hideExportedPreviewImages: {
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
                name: 'Показувати кореневу теку',
                desc: 'Відображати назву сховища як кореневу теку в дереві.'
            },
            showFolderIcons: {
                name: 'Показувати іконки тек',
                desc: 'Відображати іконки поряд з теками в панелі навігації.'
            },
            inheritFolderColors: {
                name: 'Успадковувати кольори тек',
                desc: 'Дочірні теки успадковують колір від батьківських тек.'
            },
            folderSortOrder: {
                name: 'Порядок сортування тек',
                desc: 'Клацніть правою кнопкою миші на теці, щоб задати інший порядок сортування для її дочірніх елементів.',
                options: {
                    alphaAsc: 'Від А до Я',
                    alphaDesc: 'Від Я до А'
                }
            },
            showFileCount: {
                name: 'Показувати кількість файлів',
                desc: 'Відображати кількість файлів поряд з теками, мітками та властивостями.'
            },
            showShortcutAndRecentItemIcons: {
                name: 'Показувати іконки для ярликів та останніх елементів',
                desc: 'Відображати іконки поруч з елементами в розділах Ярлики та Останні.'
            },
            interfaceIcons: {
                name: 'Іконки інтерфейсу',
                desc: 'Редагувати іконки панелі інструментів, тек, міток, властивостей, закріплених, пошуку та сортування.',
                buttonText: 'Редагувати іконки'
            },
            applyColorToIconsOnly: {
                name: 'Застосовувати колір лише до іконок',
                desc: 'При увімкненні користувацькі кольори застосовуються лише до іконок. При вимкненні кольори застосовуються як до іконок, так і до текстових міток.'
            },
            navRainbowMode: {
                name: 'Режим кольорів веселки (профіль сховища)',
                desc: 'Застосувати кольори веселки в панелі навігації.',
                options: {
                    off: 'Вимкнено',
                    textColor: 'Колір тексту',
                    backgroundColor: 'Колір фону'
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
            navRainbowApplyToRecentItems: {
                name: 'Застосувати до нещодавніх елементів',
                desc: 'Застосувати кольори веселки до нещодавніх елементів.'
            },
            navRainbowApplyToFolders: {
                name: 'Застосувати до тек',
                desc: 'Застосувати кольори веселки до тек.'
            },
            navRainbowFolderScope: {
                name: 'Область тек',
                desc: 'Вибрати рівні тек для початку призначення кольорів.',
                options: {
                    root: 'Кореневий рівень',
                    child: 'Дочірній рівень',
                    all: 'Кожний рівень'
                }
            },
            navRainbowApplyToTags: {
                name: 'Застосувати до міток',
                desc: 'Застосувати кольори веселки до міток.'
            },
            navRainbowTagScope: {
                name: 'Область міток',
                desc: 'Вибрати рівні міток для початку призначення кольорів.',
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
            navRainbowConsistentBrightness: {
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
            collapseItems: {
                name: 'Згортати елементи',
                desc: 'Виберіть, на що впливає кнопка розгортання/згортання всього.',
                options: {
                    all: 'Все',
                    foldersOnly: 'Лише теки',
                    tagsOnly: 'Лише мітки',
                    propertiesOnly: 'Лише властивості'
                }
            },
            keepSelectedItemExpanded: {
                name: 'Тримати вибраний елемент розгорнутим',
                desc: 'При згортанні тримати вибраний елемент та його батьків розгорнутими.'
            },
            excludeVaultRootFromCollapse: {
                name: 'Пропускати корінь сховища під час згортання',
                desc: 'Під час згортання всіх елементів залишати кореневу теку сховища в поточному стані.'
            },
            treeIndentation: {
                name: 'Відступ дерева',
                desc: 'Налаштувати ширину відступу для вкладених тек, міток і властивостей (у пікселях).'
            },
            navItemHeight: {
                name: 'Висота елемента',
                desc: 'Налаштувати висоту тек, міток і властивостей у панелі навігації (у пікселях).'
            },
            navItemHeightScaleText: {
                name: 'Масштабувати текст з висотою елемента',
                desc: 'Зменшувати розмір тексту навігації при зменшенні висоти елемента.'
            },
            showIndentGuides: {
                name: 'Показувати напрямні відступів',
                desc: 'Відображати напрямні відступів для вкладених тек, міток і властивостей.'
            },
            navCountLeaderStyle: {
                name: 'Показувати заповнювачі',
                desc: 'Відображати крапки, тире або лінію між назвами елементів і кількістю файлів.',
                options: {
                    none: 'Немає',
                    dots: 'Крапки (...)',
                    dashes: 'Тире (---)',
                    line: 'Лінія'
                }
            },
            rootItemSpacing: {
                name: 'Відступ кореневих елементів',
                desc: 'Відстань між теками, мітками та властивостями кореневого рівня (у пікселях).'
            },
            showTags: {
                name: 'Показувати мітки',
                desc: 'Відображати розділ міток в навігаторі.'
            },
            showTagIcons: {
                name: 'Показувати іконки міток',
                desc: 'Відображати іконки поряд з мітками в панелі навігації.'
            },
            inheritTagColors: {
                name: 'Успадковувати кольори міток',
                desc: 'Дочірні мітки успадковують колір від батьківських міток.'
            },
            tagSortOrder: {
                name: 'Порядок сортування міток',
                desc: 'Клацніть правою кнопкою миші на мітці, щоб задати інший порядок сортування для її дочірніх елементів.',
                options: {
                    alphaAsc: 'Від А до Я',
                    alphaDesc: 'Від Я до А',
                    frequency: 'За частотою',
                    lowToHigh: 'від низької до високої',
                    highToLow: 'від високої до низької'
                }
            },
            showTagsFolder: {
                name: 'Показувати теку міток',
                desc: 'Відображати «Мітки» як згортувану теку.'
            },
            showUntaggedNotes: {
                name: 'Показувати нотатки без міток',
                desc: 'Відображати елемент «Без міток» для нотаток без жодних міток.'
            },
            filterTagsBySelection: {
                name: 'Фільтрувати мітки за вибором',
                desc: 'Показувати лише мітки, що зустрічаються в нотатках у вибраній теці або властивості.'
            },
            keepEmptyTagsProperty: {
                name: 'Зберігати властивість tags після видалення останньої мітки',
                desc: 'Зберігати властивість tags у frontmatter, коли всі мітки видалено. При вимкненні властивість tags видаляється з frontmatter.'
            },
            showProperties: {
                name: 'Показувати властивості',
                desc: 'Відображати розділ властивостей у навігаторі.',
                propertyKeysInfoPrefix: 'Налаштувати властивості в ',
                propertyKeysInfoLinkText: 'Загальне > Ключі властивостей',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'Показувати іконки властивостей',
                desc: 'Відображати значки поряд із властивостями на панелі навігації.'
            },
            inheritPropertyColors: {
                name: 'Успадковувати кольори властивостей',
                desc: 'Значення властивостей успадковують колір та фон від ключа властивості.'
            },
            propertySortOrder: {
                name: 'Порядок сортування властивостей',
                desc: 'Клацніть правою кнопкою миші на властивості, щоб задати інший порядок сортування її значень.',
                options: {
                    alphaAsc: 'Від А до Я',
                    alphaDesc: 'Від Я до А',
                    frequency: 'Частота',
                    lowToHigh: 'за зростанням',
                    highToLow: 'за спаданням'
                }
            },
            showPropertiesFolder: {
                name: 'Показувати теку властивостей',
                desc: 'Відображати «Властивості» як згортувану теку.'
            },
            filterPropertiesBySelection: {
                name: 'Фільтрувати властивості за вибором',
                desc: 'Показувати лише властивості, що зустрічаються в нотатках у вибраній теці або мітці.'
            },
            hideTags: {
                name: 'Приховати мітки (профіль сховища)',
                desc: 'Список шаблонів міток, розділених комами. Шаблони назв: мітка* (починається з), *мітка (закінчується на). Шаблони шляхів: архів (мітка і нащадки), архів/* (лише нащадки), проекти/*/чернетки (символ підстановки посередині).',
                placeholder: 'архів*, *чернетка, проекти/*/старі'
            },
            hideNotesWithTags: {
                name: 'Приховати нотатки з мітками (профіль сховища)',
                desc: 'Список шаблонів міток, розділених комами. Нотатки з відповідними мітками приховуються. Шаблони назв: мітка* (починається з), *мітка (закінчується на). Шаблони шляхів: архів (мітка і нащадки), архів/* (лише нащадки), проекти/*/чернетки (символ підстановки посередині).',
                placeholder: 'архів*, *чернетка, проекти/*/старі'
            },
            enableFolderNotes: {
                name: 'Увімкнути нотатки тек',
                desc: 'Теки з відповідним файлом нотатки відображаються як клікабельні посилання.'
            },
            folderNoteType: {
                name: 'Тип нотатки теки за замовчуванням',
                desc: 'Тип нотатки теки, створеної з контекстного меню.',
                options: {
                    ask: 'Запитувати при створенні',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'Назва нотатки теки',
                desc: 'Назва нотатки теки без розширення. Використовуйте {{folder}}, щоб вставити назву теки, або введіть фіксовану назву, наприклад index.'
            },
            folderNoteTemplate: {
                name: 'Шаблон нотатки теки',
                desc: 'Файл шаблону, який використовується під час створення нотаток тек. Шаблони Markdown можуть використовувати Templater. Шаблони Canvas і Base копіюються як вміст файлу. Вкажіть розташування теки шаблонів у Операції з файлами > Шаблони.',
                formatWarning: 'Формат шаблону має відповідати вибраному типу нотатки теки: .md, .canvas або .base.'
            },
            folderNamesOpenFolderNotes: {
                name: 'Назви тек відкривають нотатки тек',
                desc: 'Натискання назви теки відкриває її нотатку теки. Коли вимкнено, нотатки тек надають лише метадані теки, як-от назву, значок і колір.'
            },
            hideFolderNoteInList: {
                name: 'Приховувати нотатку теки в списку',
                desc: 'Приховати нотатки тек зі списку файлів.'
            },
            pinCreatedFolderNote: {
                name: 'Закріплювати створені нотатки тек',
                desc: 'Закріплювати нотатки тек при створенні з контекстного меню.'
            },
            folderNoteOpenLocation: {
                name: 'Відкривати нотатки тек у',
                desc: 'Виберіть, де відкривати нотатки тек під час натискання посилань нотаток тек.',
                options: {
                    currentTab: 'Поточна вкладка',
                    newTab: 'Нова вкладка',
                    rightSidebar: 'Права бічна панель'
                }
            },
            showClosestFolderNoteInRightSidebar: {
                name: 'Права бічна панель: показувати найближчу нотатку теки',
                desc: 'Коли вибрано теку, права бічна панель автоматично показує найближчу батьківську нотатку теки.'
            },
            confirmBeforeDelete: {
                name: 'Підтверджувати перед видаленням',
                desc: 'Показувати діалог підтвердження при видаленні нотаток або тек'
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
                desc: 'Видаляє осиротілі метадані, залишені після видалення, переміщення або перейменування файлів, тек, міток або властивостей поза Obsidian. Це впливає лише на файл налаштувань Notebook Navigator.',
                buttonText: 'Очистити метадані',
                error: 'Очищення налаштувань не вдалося',
                loading: 'Перевірка метаданих...',
                statusClean: 'Немає метаданих для очищення',
                statusCounts:
                    'Осиротілі елементи — теки: {folders}, мітки: {tags}, властивості: {properties}, файли: {files}, закріплення: {pinned}, роздільники: {separators}'
            },
            rebuildCache: {
                name: 'Перебудувати кеш',
                desc: 'Використовуйте, якщо у вас зникають мітки, неправильні попередні перегляди або відсутні головні зображення. Це може статися після конфліктів синхронізації або неочікуваних закриттів.',
                buttonText: 'Перебудувати кеш',
                error: 'Не вдалося перебудувати кеш',
                indexingTitle: 'Індексація сховища...',
                progress: 'Оновлення кешу Notebook Navigator.'
            },
            iconPackManagement: {
                downloadButton: 'Завантажити',
                downloadingLabel: 'Завантаження...',
                removeButton: 'Вилучити',
                statusInstalled: 'Завантажено (версія {version})',
                statusNotInstalled: 'Не завантажено',
                versionUnknown: 'невідома',
                downloadFailed: "Не вдалося завантажити {name}. Перевірте з'єднання та спробуйте знову.",
                removeFailed: 'Не вдалося вилучити {name}.',
                infoNote:
                    'Завантажені пакети іконок синхронізують стан встановлення між пристроями. Пакети іконок залишаються в локальній базі даних на кожному пристрої; синхронізація лише відстежує, чи завантажувати або вилучати їх. Пакети іконок завантажуються з репозиторію Notebook Navigator (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterMetadata: {
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
            migrateIconsAndColorsFromSettings: {
                name: 'Перенести іконки та кольори з налаштувань',
                desc: 'Збережено в налаштуваннях: {icons} іконок, {colors} кольорів.',
                button: 'Перенести',
                buttonWorking: 'Перенесення...',
                noticeNone: 'Немає іконок або кольорів файлів, збережених у налаштуваннях.',
                noticeDone: 'Перенесено {migratedIcons}/{icons} іконок, {migratedColors}/{colors} кольорів.',
                noticeFailures: 'Невдалі записи: {failures}.',
                noticeError: 'Перенесення не вдалося. Перевірте консоль для деталей.'
            },
            frontmatterNameFields: {
                name: 'Поля назви',
                desc: 'Список полів frontmatter через кому. Використовується перше непорожнє значення. Якщо їх немає, використовується назва файлу.',
                placeholder: 'title, name'
            },
            frontmatterCreatedField: {
                name: 'Поле часової позначки створення',
                desc: 'Назва поля frontmatter для часової позначки створення. Залиште порожнім для використання лише дати файлової системи.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'Поле часової позначки зміни',
                desc: 'Назва поля frontmatter для часової позначки зміни. Залиште порожнім для використання лише дати файлової системи.',
                placeholder: 'modified'
            },
            frontmatterTimestampFormat: {
                name: 'Формат часової позначки',
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
            otherPlugins: {
                name: 'Подивіться мої інші плагіни',
                betterPaste: 'Очищає вставлений текст, посилання та зображення',
                pixelPerfectImage: 'Точна зміна розміру зображень та інше'
            },
            checkForNewVersionOnStart: {
                name: 'Перевіряти нову версію при запуску',
                desc: 'Перевіряє нові релізи плагіна при запуску та показує сповіщення, коли доступне оновлення. Перевірки відбуваються не частіше одного разу на день.',
                status: 'Доступна нова версія: {version}'
            },
            startupDebugLogging: {
                name: 'Журнал налагодження запуску',
                desc: 'Записує діагностику запуску у Markdown-файл із часовою позначкою в корені сховища, а потім зупиняється після стабілізації запуску. Файл може синхронізуватися та містити шляхи до файлів.'
            },
            whatsNew: {
                name: 'Що нового в Notebook Navigator {version}',
                desc: 'Перегляньте останні оновлення та покращення',
                buttonText: 'Переглянути останні оновлення'
            },
            showReleaseNotes: {
                name: 'Показувати вікно «Що нового» після оновлення',
                desc: 'Вимкніть, щоб вікно «Що нового» не відкривалося автоматично після оновлень.'
            },
            masteringVideo: {
                name: 'Опанування Notebook Navigator (відео)',
                desc: 'Це відео охоплює все, що потрібно для продуктивної роботи з Notebook Navigator, включаючи гарячі клавіші, пошук, мітки та розширене налаштування.'
            },
            cacheStatistics: {
                localCache: 'Локальний кеш',
                items: 'елементів',
                withTags: 'з мітками',
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
                checkTimestampFormat: 'Перевірте формат часової позначки.',
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
