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
 * Persian (Farsi) language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_FA = {
    // Common UI elements
    common: {
        cancel: 'لغو',
        delete: 'حذف',
        clear: 'پاک کردن',
        remove: 'حذف',
        restoreDefault: 'بازگردانی پیش‌فرض', // Button text for restoring values to defaults (English: Restore default)
        submit: 'ارسال',
        save: 'ذخیره', // Button text for saving settings and dialogs (English: Save)
        configure: 'پیکربندی', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'حالت روشن', // Label for light theme mode (English: Light mode)
        darkMode: 'حالت تاریک', // Label for dark theme mode (English: Dark mode)
        noSelection: 'بدون انتخاب',
        untagged: 'بدون برچسب',
        featureImageAlt: 'تصویر ویژه',
        unknownError: 'خطای ناشناخته',
        clipboardWriteError: 'نمی‌توان در کلیپ‌بورد نوشت',
        updateBannerTitle: 'به‌روزرسانی Notebook Navigator موجود است',
        updateBannerInstruction: 'در تنظیمات -> افزونه‌های انجمن به‌روزرسانی کنید',
        previous: 'قبلی', // Generic aria label for previous navigation (English: Previous)
        next: 'بعدی' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'پوشه یا برچسبی را برای مشاهده یادداشت‌ها انتخاب کنید',
        emptyStateNoNotes: 'یادداشتی نیست',
        pinnedSection: 'سنجاق‌شده',
        notesSection: 'یادداشت‌ها',
        filesSection: 'فایل‌ها',
        hiddenItemAriaLabel: '{name} (پنهان)',
        collapseGroup: 'بستن گروه',
        expandGroup: 'باز کردن گروه',
        manualSortTitle: 'مرتب‌سازی دستی: {property}',
        manualSortHint: 'برای تغییر ترتیب بکشید. ترتیب به صورت مقادیر شاخص عددی در ویژگی «{property}» ذخیره می‌شود.',
        manualSortNonMarkdownHint: 'فایل‌های غیر مارک‌داون در پایین نمایش داده می‌شوند و قابل مرتب‌سازی مجدد نیستند.',
        unsortedSection: 'مرتب‌نشده',
        propertyGroupNoValue: 'هیچ‌کدام',
        manualSortDone: 'انجام شد',
        manualSortMultipleWriteFailure: '{count} فایل ناموفق بود؛ اولین: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'بدون برچسب',
        tags: 'برچسب‌ها'
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'میانبرها',
        recentFilesHeader: 'فایل‌های اخیر', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'ویژگی‌ها',
        folders: 'پوشه‌ها',
        tags: 'برچسب‌ها',
        calendar: 'تقویم',
        reorderRootFoldersTitle: 'مرتب‌سازی مجدد ناوبری',
        reorderRootFoldersHint: 'از فلش‌ها یا کشیدن برای مرتب‌سازی استفاده کنید',
        vaultRootLabel: 'خزانه',
        resetRootToAlpha: 'بازنشانی به ترتیب الفبایی',
        resetRootToFrequency: 'بازنشانی به ترتیب فراوانی',
        pinShortcuts: 'سنجاق کردن میانبرها',
        pinShortcutsAndRecentFiles: 'سنجاق کردن میانبرها و فایل‌های اخیر',
        unpinShortcuts: 'برداشتن سنجاق میانبرها',
        unpinShortcutsAndRecentFiles: 'برداشتن سنجاق میانبرها و فایل‌های اخیر',
        profileMenuAria: 'تغییر پروفایل خزانه'
    },

    navigationCalendar: {
        ariaLabel: 'تقویم',
        dailyNotesNotEnabled: 'افزونه یادداشت روزانه فعال نیست.',
        noteHiddenByProfile: 'یادداشت تقویم توسط پروفایل فعلی خزانه پنهان شده است.',
        createDailyNote: {
            title: 'یادداشت روزانه جدید',
            message: 'فایل {filename} وجود ندارد. آیا می‌خواهید آن را ایجاد کنید؟',
            confirmButton: 'ایجاد'
        },
        helpModal: {
            title: 'میانبرهای تقویم',
            items: [
                'روی هر روز کلیک کنید تا یادداشت روزانه باز یا ایجاد شود. هفته‌ها، ماه‌ها، فصل‌ها و سال‌ها به همین شکل کار می‌کنند.',
                'نقطه پر زیر یک روز به معنای وجود یادداشت است. نقطه توخالی به معنای وجود وظایف ناتمام است.',
                'اگر یادداشتی تصویر شاخص داشته باشد، به عنوان پس‌زمینه روز نمایش داده می‌شود.'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+کلیک روی تاریخ برای فیلتر کردن بر اساس آن تاریخ در لیست فایل‌ها.',
            dateFilterOptionAlt: '`Option/Alt`+کلیک روی تاریخ برای فیلتر کردن بر اساس آن تاریخ در لیست فایل‌ها.'
        }
    },

    dailyNotes: {
        templateReadFailed: 'خواندن الگوی یادداشت روزانه ناموفق بود.',
        createFailed: 'ایجاد یادداشت روزانه ممکن نیست.'
    },

    shortcuts: {
        folderExists: 'پوشه در میانبرها وجود دارد',
        noteExists: 'یادداشت در میانبرها وجود دارد',
        tagExists: 'برچسب در میانبرها وجود دارد',
        propertyExists: 'ویژگی از قبل در میانبرها وجود دارد',
        invalidProperty: 'میانبر ویژگی نامعتبر',
        searchExists: 'میانبر جستجو وجود دارد',
        emptySearchQuery: 'قبل از ذخیره، عبارت جستجو را وارد کنید',
        emptySearchName: 'قبل از ذخیره جستجو، نامی وارد کنید',
        add: 'افزودن به میانبرها',
        addNotesCount: 'افزودن {count} یادداشت به میانبرها',
        addFilesCount: 'افزودن {count} فایل به میانبرها',
        rename: 'تغییر نام میانبر',
        remove: 'حذف از میانبرها',
        removeAll: 'حذف همه میانبرها',
        removeAllConfirm: 'حذف همه میانبرها؟',
        folderNotesPinned: '{count} یادداشت پوشه سنجاق شد'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'جمع کردن آیتم‌ها',
        expandAllFolders: 'باز کردن همه آیتم‌ها',
        collapseAllListGroups: 'جمع کردن همه گروه‌های فهرست',
        expandAllListGroups: 'باز کردن همه گروه‌های فهرست',
        showCalendar: 'نمایش تقویم',
        hideCalendar: 'پنهان کردن تقویم',
        newFolder: 'پوشه جدید',
        newNote: 'یادداشت جدید',
        mobileBackToNavigation: 'بازگشت به ناوبری',
        changeChildSortOrder: 'تغییر ترتیب',
        changeSortAndGroup: 'تغییر ترتیب و گروه‌بندی',
        resetViewToDefaults: 'بازنشانی نما به پیش‌فرض‌ها',
        manualSort: 'مرتب‌سازی دستی',
        editSortOrder: 'ویرایش ترتیب مرتب‌سازی...',
        removeSortProperty: 'حذف ویژگی مرتب‌سازی',
        descendants: 'زیرمجموعه‌ها',
        subfolders: 'زیرپوشه‌ها',
        subtags: 'زیربرچسب‌ها',
        childValues: 'مقادیر فرزند',
        applySortAndGroupToDescendants: (target: string) => `اعمال مرتب‌سازی و گروه‌بندی به ${target}`,
        applyAppearanceToDescendants: (target: string) => `اعمال ظاهر به ${target}`,
        resetAppearanceInDescendants: (target: string) => `بازنشانی ظاهر در ${target}`,
        showFolders: 'نمایش ناوبری',
        reorderRootFolders: 'مرتب‌سازی مجدد ناوبری',
        finishRootFolderReorder: 'تمام',
        showExcludedItems: 'نمایش پوشه‌ها، برچسب‌ها و یادداشت‌های پنهان',
        hideExcludedItems: 'مخفی کردن پوشه‌ها، برچسب‌ها و یادداشت‌های پنهان',
        showDualPane: 'نمایش پنل‌های دوگانه',
        showSinglePane: 'نمایش پنل تکی',
        dualPaneAutoFallbackNotice:
            'وقتی نوار کناری خیلی باریک است، پنل‌های دوگانه در دسترس نیستند. برای تغییر این حالت، در تنظیمات > ظاهر و رفتار، گزینهٔ «وقتی نوار کناری خیلی باریک است» را روی «هیچ کاری نکن» بگذارید.',
        changeAppearance: 'تغییر ظاهر',
        changeAppearanceCustomized: 'تغییر ظاهر، سفارشی‌شده',
        showNotesFromSubfolders: 'نمایش یادداشت‌ها از زیرپوشه‌ها',
        showFilesFromSubfolders: 'نمایش فایل‌ها از زیرپوشه‌ها',
        showNotesFromDescendants: 'نمایش یادداشت‌ها از زیرمجموعه‌ها',
        showFilesFromDescendants: 'نمایش فایل‌ها از زیرمجموعه‌ها',
        search: 'جستجو'
    },
    // Search input
    searchInput: {
        placeholder: 'جستجو...',
        placeholderVault: 'جستجو در خزانه...',
        placeholderOmnisearch: 'Omnisearch...',
        clearSearch: 'پاک کردن جستجو',
        switchToFilterSearch: 'تغییر به جستجوی فیلتری',
        switchToOmnisearch: 'تغییر به Omnisearch',
        saveSearchShortcut: 'ذخیره میانبر جستجو',
        removeSearchShortcut: 'حذف میانبر جستجو',
        shortcutModalTitle: 'ذخیره میانبر جستجو',
        shortcutNamePlaceholder: 'نام میانبر را وارد کنید',
        shortcutStartIn: 'همیشه شروع در: {path}',
        searchHelp: 'نحو جستجو',
        searchHelpTitle: 'نحو جستجو',
        searchHelpModal: {
            intro: 'جستجوی فیلتری یادداشت‌ها را بر اساس نام‌های نمایشی، نام‌های مستعار، ویژگی‌ها، برچسب‌ها، تاریخ‌ها و فیلترها پیدا می‌کند که در یک جستجو ترکیب می‌شوند (مثال: `meeting .status=active #work @thisweek`). برای ذخیره جستجو به عنوان میانبر، روی آیکون ستاره کلیک کنید.',
            introInstallOmnisearch: 'جستجوی متن کامل در محتوای یادداشت‌ها به افزونه Omnisearch نیاز دارد.',
            introSwitching: 'با استفاده از کلیدهای بالا/پایین یا کلیک روی آیکون جستجو بین جستجوی فیلتر و Omnisearch جابه‌جا شوید.',
            activeFilterSearch: 'جستجوی فیلتری فعال است.',
            activeOmnisearch: 'Omnisearch فعال است.',
            omnisearchIntro:
                'Omnisearch جستجوی متن کامل را در محتوای یادداشت‌های سراسر خزانه انجام می‌دهد. Notebook Navigator تطابق‌هایی را نشان می‌دهد که به پوشه، برچسب یا انتخاب فعلی تعلق دارند.',
            sections: {
                fileNames: {
                    title: 'نام‌های فایل و نام‌های مستعار',
                    items: [
                        '`word` یادداشت‌هایی با "word" در نام نمایشی یا یکی از نام‌های مستعار پیدا کنید.',
                        '`word1 word2` هر کلمه باید در نام نمایشی یا نام‌های مستعار وجود داشته باشد.',
                        '`-word` یادداشت‌هایی با "word" در نام نمایشی یا یکی از نام‌های مستعار را حذف کنید.',
                        '`"text"` تطبیق متن به صورت تحت‌اللفظی؛ عبارتی که با علامت نقل قول دوتایی شروع شود هرگز به عنوان برچسب، ویژگی، تاریخ یا فیلتر تفسیر نمی‌شود (برای مثال: `".F"`).',
                        '`-"text"` یادداشت‌هایی با متن تحت‌اللفظی در نام نمایشی یا یکی از نام‌های مستعار را حذف کنید.'
                    ]
                },
                tags: {
                    title: 'برچسب‌ها',
                    items: [
                        '`#tag` یادداشت‌های دارای برچسب را شامل کنید (همچنین برچسب‌های تودرتو مثل `#tag/subtag` را پیدا می‌کند).',
                        '`#` فقط یادداشت‌های دارای برچسب را شامل کنید.',
                        '`-#tag` یادداشت‌های دارای برچسب را حذف کنید.',
                        '`-#` فقط یادداشت‌های بدون برچسب را شامل کنید.',
                        '`#tag1 #tag2` هر دو برچسب را پیدا کنید (AND ضمنی).',
                        '`#tag1 AND #tag2` هر دو برچسب را پیدا کنید (AND صریح).',
                        '`#tag1 OR #tag2` هر یک از برچسب‌ها را پیدا کنید.',
                        '`#a OR #b AND #c` AND اولویت بالاتری دارد: `#a` یا هر دو `#b` و `#c` را پیدا می‌کند.',
                        'Cmd/Ctrl+کلیک روی برچسب برای افزودن با AND. Cmd/Ctrl+Shift+کلیک برای افزودن با OR.'
                    ]
                },
                properties: {
                    title: 'ویژگی‌ها',
                    items: [
                        '`.key` شامل کردن یادداشت‌هایی که کلید ویژگی آن‌ها با `key` شروع می‌شود.',
                        '`.key=value` شامل کردن یادداشت‌هایی که مقدار ویژگی آن‌ها شامل `value` است.',
                        '`."Reading Status"` شامل کردن یادداشت‌هایی با کلید ویژگی حاوی فاصله.',
                        '`."Reading Status"="In Progress"` کلیدها و مقادیر حاوی فاصله باید در گیومه دوتایی قرار گیرند.',
                        '`-.key` حذف یادداشت‌هایی که کلید ویژگی آن‌ها با `key` شروع می‌شود.',
                        '`-.key=value` حذف یادداشت‌هایی که مقدار ویژگی آن‌ها شامل `value` است.',
                        'Cmd/Ctrl+کلیک روی ویژگی برای افزودن با AND. Cmd/Ctrl+Shift+کلیک برای افزودن با OR.'
                    ]
                },
                tasks: {
                    title: 'فیلترها',
                    items: [
                        '`has:task` شامل یادداشت‌هایی با وظایف ناتمام.',
                        '`-has:task` حذف یادداشت‌هایی با وظایف ناتمام.',
                        '`folder:meetings` شامل یادداشت‌ها در جایی که نام پوشه شامل `meetings` باشد.',
                        '`folder:/work/meetings` شامل یادداشت‌ها فقط در `work/meetings` (بدون زیرپوشه‌ها).',
                        '`folder:/` شامل یادداشت‌ها فقط در ریشه خزانه.',
                        '`-folder:archive` حذف یادداشت‌ها در جایی که نام پوشه شامل `archive` باشد.',
                        '`-folder:/archive` حذف یادداشت‌ها فقط در `archive` (بدون زیرپوشه‌ها).',
                        '`ext:md` شامل یادداشت‌ها با پسوند `md` (`ext:.md` نیز پشتیبانی می‌شود).',
                        '`-ext:pdf` حذف یادداشت‌ها با پسوند `pdf`.',
                        'ترکیب با برچسب‌ها، نام‌ها و تاریخ‌ها (به عنوان مثال: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'رفتار AND/OR',
                    items: [
                        '`AND` و `OR` فقط در جستجوهای انحصاری برچسب/ویژگی عملگر هستند.',
                        'جستجوهای انحصاری برچسب/ویژگی فقط شامل فیلترهای برچسب و ویژگی هستند: `#tag`، `-#tag`، `#`، `-#`، `.key`، `-.key`، `.key=value`، `-.key=value`.',
                        'اگر جستجو شامل نام‌ها، تاریخ‌ها (`@...`)، فیلترهای وظیفه (`has:task`)، فیلترهای پوشه (`folder:...`) یا فیلترهای پسوند (`ext:...`) باشد، `AND` و `OR` به عنوان کلمه جستجو می‌شوند.',
                        'نمونه جستجو با عملگر: `#work OR .status=started`.',
                        'مثال جستجوی ترکیبی: `#work OR ext:md` (`OR` در نام فایل‌ها جستجو می‌شود).'
                    ]
                },
                dates: {
                    title: 'تاریخ‌ها',
                    items: [
                        '`@today` یادداشت‌های امروز را با استفاده از فیلد تاریخ پیش‌فرض پیدا کنید.',
                        '`@yesterday`، `@last7d`، `@last30d`، `@thisweek`، `@thismonth` بازه‌های تاریخ نسبی.',
                        '`@2026-02-07` یک روز خاص پیدا کنید (همچنین `@20260207` پشتیبانی می‌شود).',
                        '`@2026` یک سال تقویمی پیدا کنید.',
                        '`@2026-02` یا `@202602` یک ماه تقویمی پیدا کنید.',
                        '`@2026-W05` یا `@2026W05` یک هفته ISO پیدا کنید.',
                        '`@2026-Q2` یا `@2026Q2` یک فصل تقویمی پیدا کنید.',
                        '`@13/02/2026` فرمت‌های عددی با جداکننده (`@07022026` در صورت ابهام از تنظیمات محلی شما پیروی می‌کند).',
                        '`@2026-02-01..2026-02-07` یک بازه روز شامل پیدا کنید (انتهای باز پشتیبانی می‌شود).',
                        '`@c:...` یا `@m:...` تاریخ ایجاد یا ویرایش را هدف قرار دهید.',
                        '`-@...` یک تطابق تاریخ را حذف کنید.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'جستجو به افزونه Omnisearch ارسال می‌شود و از نحو جستجوی Omnisearch پیروی می‌کند. توکن‌های جستجوی فیلتری مانند `#tag`، `.property` و `@date` معنای خاصی ندارند.',
                        'وقتی پوشه‌ای انتخاب شده باشد، `path:"<folder>/"` به جستجو افزوده می‌شود تا Omnisearch داخل آن پوشه و زیرپوشه‌های آن را جستجو کند. جستجوهایی که از قبل شامل `path:` هستند بدون تغییر ارسال می‌شوند.',
                        'Omnisearch حداکثر ۵۰ نتیجه مرتب شده بر اساس ارتباط برمی‌گرداند. در جستجوهایی که تطابق‌های بیشتری دارند، یادداشت‌های با رتبه پایین‌تر نمایش داده نمی‌شوند.',
                        'محدود کردن دامنه به مسیرهای پوشه با کاراکترهای غیر ASCII به Omnisearch 1.30.0 یا جدیدتر نیاز دارد. نسخه‌های قدیمی‌تر در کل خزانه جستجو می‌کنند و سپس نتایج بر اساس پوشه فیلتر می‌شوند.',
                        'جستجوهای کمتر از ۳ کاراکتر ممکن است در خزانه‌های بزرگ کند باشند.',
                        'پیش‌نمایش یادداشت‌ها گزیده‌های Omnisearch را به جای متن پیش‌نمایش پیش‌فرض نشان می‌دهد.'
                    ]
                }
            }
        }
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'باز کردن در تب جدید',
            openToRight: 'باز کردن در سمت راست',
            openInNewWindow: 'باز کردن در پنجره جدید',
            openMultipleInNewTabs: 'باز کردن {count} یادداشت در تب‌های جدید',
            openMultipleFilesInNewTabs: 'باز کردن {count} فایل در تب‌های جدید',
            openMultipleToRight: 'باز کردن {count} یادداشت در سمت راست',
            openMultipleFilesToRight: 'باز کردن {count} فایل در سمت راست',
            openMultipleInNewWindows: 'باز کردن {count} یادداشت در پنجره‌های جدید',
            openMultipleFilesInNewWindows: 'باز کردن {count} فایل در پنجره‌های جدید',
            pinNote: 'سنجاق کردن یادداشت',
            pinFile: 'سنجاق کردن فایل',
            unpinNote: 'برداشتن سنجاق یادداشت',
            unpinFile: 'برداشتن سنجاق فایل',
            pinMultipleNotes: 'سنجاق کردن {count} یادداشت',
            pinMultipleFiles: 'سنجاق کردن {count} فایل',
            unpinMultipleNotes: 'برداشتن سنجاق {count} یادداشت',
            unpinMultipleFiles: 'برداشتن سنجاق {count} فایل',
            duplicateNote: 'کپی یادداشت',
            duplicateFile: 'کپی فایل',
            duplicateMultipleNotes: 'کپی {count} یادداشت',
            duplicateMultipleFiles: 'کپی {count} فایل',
            openVersionHistory: 'باز کردن تاریخچه نسخه',
            revealInFolder: 'نمایش در پوشه',
            revealInFinder: 'نمایش در Finder',
            showInExplorer: 'نمایش در مرورگر سیستم',
            openInDefaultApp: 'باز کردن در برنامه پیش‌فرض',
            renameNote: 'تغییر نام یادداشت',
            renameFile: 'تغییر نام فایل',
            deleteNote: 'حذف یادداشت',
            deleteFile: 'حذف فایل',
            setCalendarHighlight: 'تنظیم برجسته‌سازی',
            removeCalendarHighlight: 'حذف برجسته‌سازی',
            deleteMultipleNotes: 'حذف {count} یادداشت',
            deleteMultipleFiles: 'حذف {count} فایل',
            moveNoteToFolder: 'انتقال یادداشت به...',
            moveFileToFolder: 'انتقال فایل به...',
            moveMultipleNotesToFolder: 'انتقال {count} یادداشت به...',
            moveMultipleFilesToFolder: 'انتقال {count} فایل به...',
            mergeNotes: 'ادغام {count} یادداشت...',
            mergeNotesInGroup: 'ادغام یادداشت‌های گروه...',
            setManualSortGroupHeader: 'تنظیم هدر گروه',
            changeManualSortGroupHeader: 'تغییر هدر گروه',
            manualSortGroupHeader: {
                title: 'هدر گروه',
                copyStyle: 'کپی سبک هدر',
                pasteStyle: 'چسباندن سبک هدر',
                remove: 'حذف هدر گروه'
            },
            addTag: 'افزودن برچسب',
            addPropertyKey: 'تنظیم ویژگی',
            removeTag: 'حذف برچسب',
            removeAllTags: 'حذف همه برچسب‌ها',
            changeIcon: 'تغییر آیکون',
            changeColor: 'تغییر رنگ'
        },
        folder: {
            newNote: 'یادداشت جدید',
            newNoteFromTemplate: 'یادداشت جدید از الگو',
            newFolder: 'پوشه جدید',
            newCanvas: 'بوم جدید',
            newBase: 'پایگاه جدید',
            newDrawing: 'طراحی جدید',
            newExcalidrawDrawing: 'طراحی Excalidraw جدید',
            newTldrawDrawing: 'طراحی Tldraw جدید',
            duplicateFolder: 'کپی پوشه',
            searchInFolder: 'جستجو در پوشه',
            createFolderNote: 'ایجاد یادداشت پوشه',
            detachFolderNote: 'جدا کردن یادداشت پوشه',
            deleteFolderNote: 'حذف یادداشت پوشه',
            changeIcon: 'تغییر آیکون',
            changeColor: 'تغییر رنگ',
            changeBackground: 'تغییر پس‌زمینه',
            excludeFolder: 'مخفی کردن پوشه',
            unhideFolder: 'آشکار کردن پوشه',
            hideRootFolder: 'مخفی کردن پوشه اصلی',
            showRootFolder: 'نمایش پوشه اصلی',
            excludeFromDescendants: 'مخفی کردن از پوشه‌های والد',
            includeInDescendants: 'نمایش در پوشه‌های والد',
            hiddenFromParentsIndicator: 'از فهرست‌های پوشه‌های والد مخفی شده است',
            moveFolder: 'انتقال پوشه به...',
            renameFolder: 'تغییر نام پوشه',
            deleteFolder: 'حذف پوشه'
        },
        tag: {
            changeIcon: 'تغییر آیکون',
            changeColor: 'تغییر رنگ',
            changeBackground: 'تغییر پس‌زمینه',
            showTag: 'نمایش برچسب',
            hideTag: 'مخفی کردن برچسب'
        },
        property: {
            addKey: 'پیکربندی کلیدهای ویژگی',
            renameKey: 'تغییر نام ویژگی',
            deleteKey: 'حذف ویژگی'
        },
        navigation: {
            addSeparator: 'افزودن جداکننده',
            removeSeparator: 'حذف جداکننده'
        },
        copy: {
            title: 'کپی',
            noteLink: 'پیوند یادداشت',
            fileLink: 'پیوند فایل',
            noteLinkAsFootnote: 'پیوند یادداشت به‌صورت پاورقی',
            fileLinkAsFootnote: 'پیوند فایل به‌صورت پاورقی',
            noteEmbed: 'جاسازی یادداشت',
            fileEmbed: 'جاسازی فایل',
            obsidianUrl: 'URL Obsidian',
            pathFromVaultFolder: 'مسیر از پوشه خزانه',
            pathFromSystemRoot: 'مسیر از ریشه سیستم'
        },
        style: {
            title: 'سبک',
            copy: 'کپی سبک',
            paste: 'چسباندن سبک',
            removeIcon: 'حذف آیکون',
            removeColor: 'حذف رنگ',
            removeBackground: 'حذف پس‌زمینه',
            clear: 'پاک کردن سبک'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        appearance: 'ظاهر',
        sortBy: 'مرتب‌سازی بر اساس',
        standardPreset: 'استاندارد',
        compactPreset: 'فشرده',
        defaultSuffix: '(پیش‌فرض)',
        defaultLabel: 'پیش‌فرض',
        titleRows: {
            label: 'ردیف‌های عنوان',
            option: (rows: number) => `${rows} ردیف عنوان`
        },
        previewRows: {
            label: 'ردیف‌های پیش‌نمایش',
            none: 'هیچ‌کدام',
            option: (rows: number) => `${rows} ردیف پیش‌نمایش`
        },
        groupBy: 'گروه‌بندی بر اساس',
        tags: 'برچسب‌ها',
        properties: 'ویژگی‌ها',
        tasks: 'وظایف',
        textCount: {
            label: 'شمارش متن',
            options: {
                none: 'هیچ‌کدام',
                words: 'کلمات',
                characters: 'نویسه‌ها',
                both: 'کلمات و نویسه‌ها'
            }
        },
        resetAppearance: 'بازنشانی ظاهر',
        openPluginSettings: 'باز کردن تنظیمات افزونه…'
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'اعمال',
            applySortAndGroupTitle: (target: string) => `مرتب‌سازی و گروه‌بندی به ${target} اعمال شود؟`,
            applyAppearanceTitle: (target: string) => `ظاهر به ${target} اعمال شود؟`,
            resetAppearanceTitle: (target: string) => `ظاهر در ${target} بازنشانی شود؟`,
            applyAppearanceMessage: (count: number, replacedCount: number) =>
                `ظاهر ${count} مورد تغییر می‌کند. ظاهرهای سفارشی موجود که جایگزین می‌شوند: ${replacedCount}. ترجیحات ذخیره‌شدهٔ ظاهر یک‌بار کپی می‌شوند؛ مرتب‌سازی و گروه‌بندی حفظ می‌شوند. تغییرات آینده و موارد فرزند جدید پیوند داده نمی‌شوند.`,
            resetAppearanceMessage: (count: number) =>
                `ظاهر ${count} مورد بازنشانی می‌شود. مرتب‌سازی و گروه‌بندی حفظ می‌شوند. این تغییر یک‌باره است؛ تغییرات آینده و موارد فرزند جدید پیوند داده نمی‌شوند.`,
            affectedCountMessage: (count: number) => `بازنویسی‌های موجود که تغییر خواهند کرد: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'استفاده از مرتب‌سازی دستی؟',
            propertySortMessage: (property: string, count: number) =>
                `این کار نمای فعلی را به مرتب‌سازی دستی با استفاده از «${property}» تغییر می‌دهد. ویرایش ترتیب، مقادیر شاخص عددی را در صورت نیاز در این ویژگی برای ${count} یادداشت می‌نویسد.`,
            propertySortConfirmButton: 'استفاده از مرتب‌سازی دستی',
            removePropertyTitle: 'حذف ویژگی مرتب‌سازی؟',
            removePropertyMessage: (property: string, count: number) =>
                `این کار «${property}» را از ${count} ${count === 1 ? 'یادداشت' : 'یادداشت'} در فهرست فعلی حذف می‌کند. ترتیب مرتب‌سازی دستی برای آن یادداشت‌ها پاک خواهد شد.`,
            removePropertyConfirmButton: 'حذف ویژگی',
            compactTitle: 'فشرده‌سازی مقادیر شاخص؟',
            compactMessage: (count: number) =>
                `این بازآرایی به فضای عددی بیشتری نیاز دارد. ${count} یادداشت مقادیر شاخص جدید دریافت می‌کند.`,
            compactConfirmButton: 'فشرده‌سازی مقادیر شاخص'
        },
        manualSortGroupHeader: {
            title: 'تنظیم هدر گروه',
            titleLabel: 'عنوان',
            placeholder: 'هدر گروه',
            icon: 'آیکون',
            color: 'رنگ',
            wordCount: 'نمایش تعداد کلمات',
            wordCountTarget: 'تعداد کلمات هدف',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'وقتی این فیلد خالی است، هدف گروه از ویژگی هدف تنظیم‌شده در تنظیمات > نمایش فایل > تعداد کلمات و نویسه‌ها استفاده می‌کند. با تنظیم مقدار هدف برای این گروه آن را بازنویسی کنید.',
            description: 'هدر گروه را برای این یادداشت سفارشی کنید. عنوان را خالی بگذارید تا هدر حذف شود.'
        },
        mergeNotes: {
            title: 'ادغام یادداشت‌ها',
            summary: 'ایجاد یک یادداشت از {count} یادداشت در {folder}.',
            frontmatterRule: 'فرانت‌متر یادداشت اول حفظ می‌شود. فرانت‌متر یادداشت‌های دیگر حذف می‌شود.',
            crossFolderWarning:
                'یادداشت‌های مبدأ در پوشه‌های مختلف هستند. پیوندها و جاسازی‌های نسبی ممکن است در یادداشت ادغام‌شده از کار بیفتند.',
            outputName: 'نام خروجی',
            outputNameDesc: 'یادداشت ادغام‌شده در پوشه نشان‌داده‌شده در بالا ایجاد می‌شود.',
            outputNamePlaceholder: 'یادداشت‌های ادغام‌شده',
            separator: 'جداکننده',
            separatorDesc: 'بین یادداشت‌ها درج می‌شود.',
            separatorOptions: {
                none: 'هیچ‌کدام',
                blankLine: 'خط خالی',
                horizontalRule: 'خط افقی',
                heading: 'عنوان با نام یادداشت'
            },
            moveSourcesToTrash: 'انتقال یادداشت‌های مبدأ به زباله‌دان پس از ادغام',
            mergeButton: 'ادغام'
        },
        navRainbowSection: {
            title: (section: string) => `رنگ‌های رنگین‌کمان: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'جستجوی آیکون...',
            recentlyUsedHeader: 'اخیراً استفاده شده',
            emptyStateSearch: 'برای جستجوی آیکون شروع به تایپ کنید',
            emptyStateNoResults: 'آیکونی یافت نشد',
            showingResultsInfo: 'نمایش ۵۰ از {count} نتیجه. بیشتر تایپ کنید تا محدودتر شود.',
            emojiInstructions: 'ایموجی را تایپ یا پیست کنید تا به عنوان آیکون استفاده شود',
            removeIcon: 'حذف آیکون',
            removeFromRecents: 'حذف از آیکون‌های اخیر',
            allTabLabel: 'همه'
        },
        fileIconRuleEditor: {
            addRuleAria: 'افزودن قانون'
        },
        interfaceIcons: {
            title: 'آیکون‌های رابط کاربری',
            fileItemsSection: 'آیتم‌های فایل',
            items: {
                'nav-shortcuts': 'میانبرها',
                'nav-recent-files': 'فایل‌های اخیر',
                'nav-expand-all': 'باز کردن همه',
                'nav-collapse-all': 'بستن همه',
                'nav-calendar': 'تقویم',
                'nav-tree-expand': 'فلش درختی: باز کردن',
                'nav-tree-collapse': 'فلش درختی: بستن',
                'nav-hidden-items': 'آیتم‌های مخفی',
                'nav-root-reorder': 'مرتب‌سازی مجدد پوشه‌های ریشه',
                'nav-new-folder': 'پوشه جدید',
                'nav-show-single-pane': 'نمایش پنل تکی',
                'nav-show-dual-pane': 'نمایش پنل‌های دوگانه',
                'nav-profile-chevron': 'فلش منوی پروفایل',
                'list-search': 'جستجو',
                'list-reveal-file': 'نمایش فایل',
                'list-descendants': 'یادداشت‌ها از زیرپوشه‌ها',
                'list-expand-all': 'باز کردن همه گروه‌ها',
                'list-collapse-all': 'جمع کردن همه گروه‌ها',
                'list-sort-ascending': 'ترتیب: صعودی',
                'list-sort-descending': 'ترتیب: نزولی',
                'list-sort-modified': 'مرتب‌سازی بر اساس تاریخ ویرایش',
                'list-sort-created': 'مرتب‌سازی بر اساس تاریخ ایجاد',
                'list-sort-title': 'مرتب‌سازی بر اساس عنوان',
                'list-sort-filename': 'مرتب‌سازی بر اساس نام فایل',
                'list-sort-property': 'مرتب‌سازی بر اساس ویژگی',
                'list-appearance': 'تغییر ظاهر',
                'list-new-note': 'یادداشت جدید',
                'list-pinned': 'یادداشت‌های سنجاق‌شده',
                'nav-folder-open': 'پوشه باز',
                'nav-folder-closed': 'پوشه بسته',
                'nav-tags': 'برچسب‌ها',
                'nav-tag': 'برچسب',
                'nav-properties': 'ویژگی‌ها',
                'nav-property': 'ویژگی',
                'nav-property-value': 'مقدار',
                'file-unfinished-task': 'وظایف',
                'file-word-count': 'تعداد کلمات',
                'file-character-count': 'تعداد نویسه‌ها'
            }
        },
        colorPicker: {
            currentColor: 'فعلی',
            newColor: 'جدید',
            paletteDefault: 'پیش‌فرض',
            paletteCustom: 'سفارشی',
            copyColors: 'کپی رنگ',
            colorsCopied: 'رنگ در کلیپ‌بورد کپی شد',
            pasteColors: 'چسباندن رنگ',
            pasteClipboardError: 'نمی‌توان کلیپ‌بورد را خواند',
            pasteInvalidFormat: 'مقدار رنگ hex مورد انتظار است',
            colorsPasted: 'رنگ با موفقیت چسبانده شد',
            resetUserColors: 'پاک کردن رنگ‌های سفارشی',
            clearCustomColorsConfirm: 'همه رنگ‌های سفارشی حذف شوند؟',
            userColorSlot: 'رنگ {slot}',
            recentColors: 'رنگ‌های اخیر',
            clearRecentColors: 'پاک کردن رنگ‌های اخیر',
            removeRecentColor: 'حذف رنگ',
            apply: 'اعمال',
            pickerLabel: 'انتخابگر',
            hexLabel: 'HEX',
            hexInputLabel: 'مقدار رنگ هگز',
            saturationValueArea: 'اشباع و روشنایی',
            hueSlider: 'فام',
            alphaSlider: 'شفافیت'
        },
        appearance: {
            tabIcon: 'آیکون',
            tabColor: 'رنگ',
            tabBackground: 'پس‌زمینه',
            resetIcon: 'حذف آیکون',
            resetColor: 'حذف رنگ',
            resetBackground: 'حذف پس‌زمینه',
            clear: 'پاک کردن سبک',
            apply: 'اعمال'
        },
        selectVaultProfile: {
            title: 'انتخاب پروفایل خزانه',
            currentBadge: 'فعال',
            emptyState: 'پروفایل خزانه‌ای موجود نیست.'
        },
        tagOperation: {
            renameTitle: 'تغییر نام برچسب {tag}',
            deleteTitle: 'حذف برچسب {tag}',
            newTagPrompt: 'نام برچسب جدید',
            newTagPlaceholder: 'نام برچسب جدید را وارد کنید',
            renameWarning: 'تغییر نام برچسب {oldTag} باعث تغییر {count} {files} می‌شود.',
            deleteWarning: 'حذف برچسب {tag} باعث تغییر {count} {files} می‌شود.',
            modificationWarning: 'این کار تاریخ تغییر فایل‌ها را به‌روزرسانی می‌کند.',
            affectedFiles: 'فایل‌های تحت تأثیر:',
            andMore: '...و {count} مورد دیگر',
            confirmRename: 'تغییر نام برچسب',
            renameUnchanged: '{tag} بدون تغییر',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            renameBatchNotFinalized:
                '{renamed}/{total} تغییر نام یافت. به‌روزرسانی نشده: {notUpdated}. فراداده‌ها و میانبرها به‌روزرسانی نشدند.',
            invalidTagName: 'نام برچسب معتبری وارد کنید.',
            descendantRenameError: 'نمی‌توان برچسب را به خود یا زیرمجموعه آن منتقل کرد.',
            confirmDelete: 'حذف برچسب',
            deleteBatchNotFinalized:
                'از {removed}/{total} حذف شد. به‌روزرسانی نشده: {notUpdated}. فراداده‌ها و میانبرها به‌روزرسانی نشدند.',
            checkConsoleForDetails: 'برای جزئیات بیشتر کنسول را بررسی کنید.',
            file: 'فایل',
            files: 'فایل',
            inlineParsingWarning: {
                title: 'سازگاری برچسب‌های درون‌خطی',
                message:
                    '{tag} شامل نویسه‌هایی است که Obsidian نمی‌تواند در برچسب‌های درون‌خطی تجزیه کند. برچسب‌های فرانت‌متر تحت تأثیر قرار نمی‌گیرند.',
                confirm: 'استفاده در هر صورت'
            }
        },
        propertyOperation: {
            renameTitle: 'تغییر نام ویژگی {property}',
            deleteTitle: 'حذف ویژگی {property}',
            newKeyPrompt: 'نام جدید ویژگی',
            newKeyPlaceholder: 'نام جدید ویژگی را وارد کنید',
            renameWarning: 'تغییر نام ویژگی {property} باعث تغییر {count} {files} خواهد شد.',
            renameConflictWarning:
                'ویژگی {newKey} از قبل در {count} {files} وجود دارد. تغییر نام {oldKey} مقادیر موجود {newKey} را جایگزین خواهد کرد.',
            deleteWarning: 'حذف ویژگی {property} باعث تغییر {count} {files} خواهد شد.',
            confirmRename: 'تغییر نام ویژگی',
            confirmDelete: 'حذف ویژگی',
            renameNoChanges: '{oldKey} → {newKey} (بدون تغییر)',
            renameSettingsUpdateFailed: 'ویژگی {oldKey} → {newKey} تغییر نام یافت. به‌روزرسانی تنظیمات ناموفق بود.',
            deleteSingleSuccess: 'ویژگی {property} از ۱ یادداشت حذف شد',
            deleteMultipleSuccess: 'ویژگی {property} از {count} یادداشت حذف شد',
            deleteSettingsUpdateFailed: 'ویژگی {property} حذف شد. به‌روزرسانی تنظیمات ناموفق بود.',
            invalidKeyName: 'یک نام ویژگی معتبر وارد کنید.'
        },
        fileSystem: {
            newFolderTitle: 'پوشه جدید',
            renameFolderTitle: 'تغییر نام پوشه',
            renameFileTitle: 'تغییر نام فایل',
            deleteFolderTitle: "حذف '{name}'؟",
            deleteFileTitle: "حذف '{name}'؟",
            deleteFileAttachmentsTitle: 'حذف پیوست‌های فایل؟',
            moveFileConflictTitle: 'تعارض انتقال',
            folderNamePrompt: 'نام پوشه را وارد کنید:',
            hideInOtherVaultProfiles: 'مخفی کردن در پروفایل‌های خزانه دیگر',
            renamePrompt: 'نام جدید را وارد کنید:',
            renameVaultTitle: 'تغییر نام نمایشی خزانه',
            renameVaultPrompt: 'نام نمایشی سفارشی را وارد کنید (خالی برای پیش‌فرض):',
            deleteFolderConfirm: 'آیا مطمئن هستید می‌خواهید این پوشه و تمام محتوای آن را حذف کنید؟',
            deleteFileConfirm: 'آیا مطمئن هستید می‌خواهید این فایل را حذف کنید؟',
            deleteFileAttachmentsDescriptionSingle: 'این پیوست دیگر در هیچ یادداشتی استفاده نمی‌شود. آیا می‌خواهید آن را حذف کنید؟',
            deleteFileAttachmentsDescriptionMultiple:
                'این پیوست‌ها دیگر در هیچ یادداشتی استفاده نمی‌شوند. آیا می‌خواهید آن‌ها را حذف کنید؟',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'درخت فایل',
            deleteFileAttachmentsViewGalleryAriaLabel: 'گالری',
            moveFileConflictDescriptionSingle: 'یک تعارض فایل در "{folder}" یافت شد.',
            moveFileConflictDescriptionMultiple: '{count} تعارض فایل در "{folder}" یافت شد.',
            moveFileConflictAffectedFiles: 'فایل‌های تحت تأثیر',
            moveFileConflictItem: '"{name}" -> "{suggested}"{renameOnly}',
            moveFileConflictRenameOnly: '(فقط تغییر نام)',
            moveFileConflictRename: 'تغییر نام',
            moveFileConflictOverwrite: 'بازنویسی',
            removeAllTagsTitle: 'حذف همه برچسب‌ها',
            removeAllTagsFromNote: 'آیا مطمئن هستید می‌خواهید همه برچسب‌ها را از این یادداشت حذف کنید؟',
            removeAllTagsFromNotes: 'آیا مطمئن هستید می‌خواهید همه برچسب‌ها را از {count} یادداشت حذف کنید؟'
        },
        folderNoteType: {
            title: 'انتخاب نوع یادداشت پوشه',
            folderLabel: 'پوشه: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `انتقال ${name} به پوشه...`,
            multipleFilesLabel: (count: number) => `${count} فایل`,
            navigatePlaceholder: 'رفتن به پوشه...',
            instructions: {
                navigate: 'برای ناوبری',
                move: 'برای انتقال',
                select: 'برای انتخاب',
                dismiss: 'برای بستن'
            }
        },
        homepage: {
            placeholder: 'جستجوی فایل...',
            instructions: {
                navigate: 'برای ناوبری',
                select: 'برای تنظیم صفحه اصلی',
                dismiss: 'برای بستن'
            }
        },
        calendarTemplate: {
            placeholder: 'جستجوی الگوها...',
            instructions: {
                navigate: 'برای ناوبری',
                select: 'برای انتخاب الگو',
                dismiss: 'برای بستن'
            }
        },
        navigationBanner: {
            placeholder: 'جستجوی تصویر...',
            svgMissingDimensions: 'فایل SVG انتخاب‌شده عرض، ارتفاع یا viewBox تعریف نمی‌کند.',
            instructions: {
                navigate: 'برای ناوبری',
                select: 'برای تنظیم بنر',
                dismiss: 'برای بستن'
            }
        },
        tagSuggest: {
            navigatePlaceholder: 'رفتن به برچسب...',
            addPlaceholder: 'جستجوی برچسب برای افزودن...',
            removePlaceholder: 'انتخاب برچسب برای حذف...',
            createNewTag: 'ایجاد برچسب جدید: #{tag}',
            instructions: {
                navigate: 'برای ناوبری',
                select: 'برای انتخاب',
                dismiss: 'برای بستن',
                add: 'برای افزودن برچسب',
                remove: 'برای حذف برچسب'
            }
        },
        propertySuggest: {
            placeholder: 'انتخاب کلید ویژگی...',
            navigatePlaceholder: 'رفتن به ویژگی...',
            instructions: {
                navigate: 'برای ناوبری',
                select: 'برای افزودن ویژگی',
                dismiss: 'برای بستن'
            }
        },
        propertyKeyVisibility: {
            title: 'نمایش کلیدهای ویژگی',
            description:
                'کنترل محل نمایش مقادیر ویژگی. ستون‌ها مربوط به پنل ناوبری، پنل فهرست و منوی زمینه فایل هستند. از ردیف پایین برای تغییر وضعیت همه ردیف‌های یک ستون استفاده کنید.',
            searchPlaceholder: 'جستجوی کلیدهای ویژگی...',
            propertyColumnLabel: 'ویژگی',
            showInNavigation: 'نمایش در ناوبری',
            showInList: 'نمایش در فهرست',
            showInFileMenu: 'نمایش در منوی فایل',
            toggleAllInNavigation: 'تغییر وضعیت همه در ناوبری',
            toggleAllInList: 'تغییر وضعیت همه در فهرست',
            toggleAllInFileMenu: 'تغییر وضعیت همه در منوی فایل',
            applyButton: 'اعمال',
            emptyState: 'کلید ویژگی‌ای یافت نشد.'
        },
        welcome: {
            title: 'به {pluginName} خوش آمدید',
            introText:
                'سلام و به Notebook Navigator، مرورگر فایل و تقویمی بهتر برای Obsidian، خوش آمدید. پیش از شروع، واقعاً پیشنهاد می‌کنم دست‌کم سه فصل اول ویدیوی زیر، Mastering Notebook Navigator، را تماشا کنید. این فصل‌ها با نحوه کار دو پنل آشنایتان می‌کنند تا بتوانید سریع شروع کنید.',
            continueText:
                'سپس اگر ده دقیقه دیگر وقت دارید، فصل‌های راه‌اندازی اولیه و روال استفاده روزمره را هم تماشا کنید. با این بخش‌ها هرچه برای شروع لازم دارید در اختیار خواهید داشت و بعداً می‌توانید برای دیدن جزئیات بیشتر برگردید. پیوند ویدیو را در بالای تنظیمات Notebook Navigator پیدا می‌کنید.',
            thanksText: 'از کار با Notebook Navigator لذت ببرید!',
            videoAlt: 'تسلط بر Notebook Navigator 3',
            openVideoButton: 'پخش ویدیو',
            closeButton: 'شاید بعداً'
        }
    },
    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'ایجاد پوشه ناموفق بود: {error}',
            createFile: 'ایجاد فایل ناموفق بود: {error}',
            renameFolder: 'تغییر نام پوشه ناموفق بود: {error}',
            renameFolderNoteConflict: 'تغییر نام ممکن نیست: "{name}" در این پوشه وجود دارد',
            renameFile: 'تغییر نام فایل ناموفق بود: {error}',
            deleteFolder: 'حذف پوشه ناموفق بود: {error}',
            deleteFile: 'حذف فایل ناموفق بود: {error}',
            deleteAttachments: 'حذف پیوست‌ها ناموفق بود: {error}',
            mergeNotes: 'ادغام یادداشت‌ها ناموفق بود: {error}',
            mergeNotesOpenOutput:
                'یادداشت ادغام‌شده با نام {name} ایجاد شد، اما باز نشد: {error}. یادداشت‌های مبدأ بدون تغییر باقی ماندند.',
            mergeNotesOpenSkipped: 'درخواست دیگری برای باز کردن فایل اولویت پیدا کرد.',
            mergeNotesTrashSources: 'یادداشت ادغام‌شده ایجاد شد. انتقال {count} یادداشت مبدأ به زباله‌دان ناموفق بود.',
            duplicateNote: 'کپی یادداشت ناموفق بود: {error}',
            duplicateFolder: 'کپی پوشه ناموفق بود: {error}',
            openVersionHistory: 'باز کردن تاریخچه نسخه ناموفق بود: {error}',
            versionHistoryNotFound: 'دستور تاریخچه نسخه یافت نشد. اطمینان حاصل کنید که Obsidian Sync فعال است.',
            revealInExplorer: 'نمایش فایل در مرورگر سیستم ناموفق بود: {error}',
            openInDefaultApp: 'باز کردن در برنامه پیش‌فرض ناموفق بود: {error}',
            openInDefaultAppNotAvailable: 'باز کردن در برنامه پیش‌فرض در این پلتفرم در دسترس نیست',
            folderNoteAlreadyExists: 'یادداشت پوشه وجود دارد',
            folderAlreadyExists: 'پوشه "{name}" وجود دارد',
            folderNotesDisabled: 'یادداشت‌های پوشه را در تنظیمات فعال کنید تا فایل‌ها را تبدیل کنید',
            folderNoteAlreadyLinked: 'این فایل در حال حاضر به عنوان یادداشت پوشه عمل می‌کند',
            folderNoteNotFound: 'هیچ یادداشت پوشه‌ای در پوشه انتخاب‌شده وجود ندارد',
            folderNoteUnsupportedExtension: 'پسوند فایل پشتیبانی نمی‌شود: {extension}',
            folderNoteMoveFailed: 'انتقال فایل در حین تبدیل ناموفق بود: {error}',
            folderNoteRenameConflict: 'فایلی با نام "{name}" در پوشه وجود دارد',
            folderNoteConversionFailed: 'تبدیل فایل به یادداشت پوشه ناموفق بود',
            folderNoteConversionFailedWithReason: 'تبدیل فایل به یادداشت پوشه ناموفق بود: {error}',
            folderNoteOpenFailed: 'فایل تبدیل شد اما باز کردن یادداشت پوشه ناموفق بود: {error}',
            failedToDeleteFile: 'حذف {name} ناموفق بود: {error}',
            failedToDeleteMultipleFiles: 'حذف {count} فایل ناموفق بود',
            versionHistoryNotAvailable: 'سرویس تاریخچه نسخه در دسترس نیست',
            drawingAlreadyExists: 'طراحی با این نام وجود دارد',
            failedToCreateDrawing: 'ایجاد طراحی ناموفق بود',
            noFolderSelected: 'پوشه‌ای در Notebook Navigator انتخاب نشده است',
            noFileSelected: 'فایلی انتخاب نشده است'
        },
        warnings: {
            linkBreakingNameCharacters: 'این نام شامل کاراکترهایی است که لینک‌های Obsidian را خراب می‌کند: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'نام‌ها نمی‌توانند با نقطه شروع شوند یا شامل : یا / باشند.',
            forbiddenNameCharactersWindows: 'کاراکترهای رزرو شده در Windows مجاز نیستند: <, >, ", \\, |, ?, *.'
        },
        notices: {
            folderExcludedFromDescendants: 'از فهرست‌های پوشه‌های والد مخفی شد: {name}',
            folderIncludedInDescendants: 'در فهرست‌های پوشه‌های والد نمایش داده شد: {name}',
            mergeNotes: '{count} یادداشت در {name} ادغام شد'
        },
        notifications: {
            deletedMultipleFiles: '{count} فایل حذف شد',
            movedMultipleFiles: '{count} فایل به {folder} منتقل شد',
            folderNoteConversionSuccess: 'فایل به یادداشت پوشه در "{name}" تبدیل شد',
            folderMoved: 'پوشه "{name}" منتقل شد',
            deepLinkCopied: 'URL Obsidian در کلیپ‌بورد کپی شد',
            pathCopied: 'مسیر در کلیپ‌بورد کپی شد',
            relativePathCopied: 'مسیر نسبی در کلیپ‌بورد کپی شد',
            linkCopied: 'پیوند در کلیپ‌بورد کپی شد',
            footnoteLinkCopied: 'پیوند پاورقی در کلیپ‌بورد کپی شد',
            embedLinkCopied: 'پیوند جاسازی در کلیپ‌بورد کپی شد',
            tagAddedToNote: 'برچسب به ۱ یادداشت اضافه شد',
            tagAddedToNotes: 'برچسب به {count} یادداشت اضافه شد',
            tagRemovedFromNote: 'برچسب از ۱ یادداشت حذف شد',
            tagRemovedFromNotes: 'برچسب از {count} یادداشت حذف شد',
            tagsClearedFromNote: 'همه برچسب‌ها از ۱ یادداشت پاک شد',
            tagsClearedFromNotes: 'همه برچسب‌ها از {count} یادداشت پاک شد',
            noTagsToRemove: 'برچسبی برای حذف نیست',
            noFilesSelected: 'فایلی انتخاب نشده است',
            mergeNotesRequireMultipleMarkdown: 'حداقل دو یادداشت Markdown برای ادغام انتخاب کنید',
            tagOperationsNotAvailable: 'عملیات برچسب در دسترس نیست',
            propertyOperationsNotAvailable: 'عملیات ویژگی‌ها در دسترس نیست',
            tagsRequireMarkdown: 'برچسب‌ها فقط روی یادداشت‌های Markdown پشتیبانی می‌شوند',
            propertiesRequireMarkdown: 'ویژگی‌ها فقط در یادداشت‌های Markdown پشتیبانی می‌شوند',
            propertySetOnNote: 'ویژگی در ۱ یادداشت به‌روزرسانی شد',
            propertySetOnNotes: 'ویژگی در {count} یادداشت به‌روزرسانی شد',
            manualSortPropertyRemovedFromNote: 'ویژگی مرتب‌سازی از ۱ یادداشت حذف شد',
            manualSortPropertyRemovedFromNotes: 'ویژگی مرتب‌سازی از {count} یادداشت حذف شد',
            iconPackDownloaded: '{provider} دانلود شد',
            iconPackUpdated: '{provider} به‌روزرسانی شد ({version})',
            iconPackRemoved: '{provider} حذف شد',
            iconPackLoadFailed: 'بارگذاری {provider} ناموفق بود',
            hiddenFileReveal: 'فایل مخفی است. «نمایش آیتم‌های مخفی» را فعال کنید'
        },
        confirmations: {
            deleteMultipleFiles: 'آیا مطمئن هستید می‌خواهید {count} فایل را حذف کنید؟',
            deleteConfirmation: 'این عمل قابل بازگشت نیست.'
        },
        defaultNames: {
            untitled: 'بدون عنوان'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'نمی‌توان پوشه را به خود یا زیرپوشه آن منتقل کرد.',
            itemAlreadyExists: 'آیتمی با نام "{name}" در این مکان وجود دارد.',
            failedToMove: 'انتقال ناموفق بود: {error}',
            failedToAddTag: 'افزودن برچسب "{tag}" ناموفق بود',
            failedToSetProperty: 'خطا در به‌روزرسانی ویژگی: {error}',
            failedToClearTags: 'پاک کردن برچسب‌ها ناموفق بود',
            failedToMoveFolder: 'انتقال پوشه "{name}" ناموفق بود',
            failedToImportFiles: 'وارد کردن ناموفق بود: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} فایل در مقصد وجود دارد',
            filesAlreadyHaveTag: '{count} فایل این برچسب یا برچسب دقیق‌تر را دارد',
            filesAlreadyHaveProperty: '{count} فایل از قبل این ویژگی را دارد',
            noTagsToClear: 'برچسبی برای پاک کردن نیست',
            fileImported: '۱ فایل وارد شد',
            filesImported: '{count} فایل وارد شد'
        }
    },

    // Date grouping
    dateGroups: {
        future: 'آینده',
        today: 'امروز',
        yesterday: 'دیروز',
        previous7Days: '۷ روز گذشته',
        previous30Days: '۳۰ روز گذشته'
    },

    // Plugin commands
    commands: {
        open: 'باز کردن',
        toggleLeftSidebar: 'تغییر نوار کناری چپ',
        openHomepage: 'باز کردن صفحه اصلی',
        openDailyNote: 'باز کردن یادداشت روزانه',
        openWeeklyNote: 'باز کردن یادداشت هفتگی',
        openMonthlyNote: 'باز کردن یادداشت ماهانه',
        openQuarterlyNote: 'باز کردن یادداشت فصلی',
        openYearlyNote: 'باز کردن یادداشت سالانه',
        revealFile: 'نمایش فایل',
        search: 'جستجو',
        searchVaultRoot: 'جستجو در کل خزانه',
        toggleDualPane: 'تغییر نمای پنل دوگانه',
        toggleDualPaneOrientation: 'تغییر جهت پنل دوگانه', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'تغییر تقویم',
        selectVaultProfile: 'انتخاب پروفایل خزانه',
        selectVaultProfile1: 'انتخاب پروفایل خزانه ۱',
        selectVaultProfile2: 'انتخاب پروفایل خزانه ۲',
        selectVaultProfile3: 'انتخاب پروفایل خزانه ۳',
        deleteFile: 'حذف فایل‌ها',
        createNewNote: 'ایجاد یادداشت جدید',
        createNewNoteFromTemplate: 'ایجاد یادداشت جدید از الگو',
        moveFiles: 'انتقال فایل‌ها',
        mergeNotes: 'ادغام یادداشت‌ها', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'انتخاب فایل بعدی',
        selectPreviousFile: 'انتخاب فایل قبلی',
        navigateBack: 'بازگشت',
        navigateForward: 'جلو رفتن',
        convertToFolderNote: 'تبدیل به یادداشت پوشه',
        setAsFolderNote: 'تنظیم به عنوان یادداشت پوشه',
        detachFolderNote: 'جدا کردن یادداشت پوشه',
        pinAllFolderNotes: 'سنجاق کردن همه یادداشت‌های پوشه',
        navigateToFolder: 'رفتن به پوشه',
        navigateToTag: 'رفتن به برچسب',
        navigateToProperty: 'رفتن به ویژگی',
        addShortcut: 'افزودن به میانبرها',
        openShortcut: 'باز کردن میانبر {number}',
        toggleDescendants: 'تغییر زیرمجموعه‌ها',
        toggleHidden: 'تغییر پوشه‌ها، برچسب‌ها و یادداشت‌های مخفی',
        toggleTagSort: 'تغییر ترتیب مرتب‌سازی برچسب',
        toggleTagsBySelection: 'تغییر برچسب‌ها بر اساس انتخاب',
        togglePropertiesBySelection: 'تغییر ویژگی‌ها بر اساس انتخاب',
        toggleCompactMode: 'تغییر حالت فشرده', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'تغییر بخش سنجاق‌شده',
        collapseExpand: 'جمع / باز کردن همه آیتم‌های ناوبری',
        collapseExpandListGroups: 'جمع / باز کردن همه گروه‌های فهرست',
        collapseExpandSelectedItem: 'جمع / باز کردن آیتم انتخاب‌شده',
        addTag: 'افزودن برچسب به فایل‌های انتخابی',
        setProperty: 'تنظیم ویژگی روی فایل‌های انتخابی', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'حذف برچسب از فایل‌های انتخابی',
        removeAllTags: 'حذف همه برچسب‌ها از فایل‌های انتخابی',
        openAllFiles: 'باز کردن همه فایل‌ها',
        rebuildCache: 'بازسازی کش',
        restoreDefaultSettings: 'بازیابی تنظیمات پیش‌فرض' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator',
        calendarViewName: 'تقویم',
        folderNoteSidebarViewName: 'یادداشت پوشه',
        ribbonTooltip: 'Notebook Navigator',
        revealInNavigator: 'نمایش در Notebook Navigator',
        settingsUnavailableNotice:
            'Notebook Navigator نتوانست تنظیمات خود را بخواند و راه‌اندازی نشد. اگر خزانه شما در حال همگام‌سازی است، پس از پایان همگام‌سازی Obsidian را دوباره راه‌اندازی کنید. برای شروع دوباره با تنظیمات پیش‌فرض، فرمان «بازیابی تنظیمات پیش‌فرض» را اجرا کنید.', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsMissingConfirm: {
            title: 'شروع با تنظیمات پیش‌فرض؟', // Title of the dialog shown when the plugin is enabled while its settings file is missing (English: Start with default settings?)
            messageRecentInstall:
                'Notebook Navigator همین حالا نصب شده و فایل تنظیمات ندارد. اگر این یک نصب جدید یا نصب مجدد است، با تنظیمات پیش‌فرض ادامه دهید. اگر تنظیمات شما از یک سرویس همگام‌سازی می‌آید، لغو کنید، تا پایان همگام‌سازی صبر کنید و سپس Obsidian را دوباره راه‌اندازی کنید.', // Dialog message when the plugin folder was written recently (English: Notebook Navigator was just installed and has no settings file. If this is a new install or a reinstall, continue with default settings. If your settings come from a sync service, cancel, wait for the sync to complete, and restart Obsidian.)
            messageExistingInstall:
                'Notebook Navigator مدتی است روی این دستگاه نصب شده است، اما فایل تنظیمات آن موجود نیست. اگر خزانه شما هنوز در حال همگام‌سازی است، لغو کنید، تا پایان همگام‌سازی صبر کنید و سپس Obsidian را دوباره راه‌اندازی کنید تا تنظیمات فعلی شما حفظ شود. فقط در صورتی ادامه دهید که می‌خواهید با تنظیمات پیش‌فرض از نو شروع کنید.', // Dialog message when the plugin folder has existed for a while (English: Notebook Navigator has been installed on this device for a while, but its settings file is missing. If your vault is still syncing, cancel, wait for the sync to complete, and restart Obsidian to keep your existing settings. Continue only to start over with default settings.)
            confirmButton: 'استفاده از تنظیمات پیش‌فرض' // Confirm button label in the missing-settings dialog (English: Use default settings)
        },
        settingsRecovery: {
            confirmTitle: 'بازیابی تنظیمات پیش‌فرض', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'این کار فایل تنظیمات Notebook Navigator را با تنظیمات پیش‌فرض جایگزین می‌کند. اگر خزانه شما هنوز در حال همگام‌سازی است، تنظیمات پیش‌فرض بازیابی‌شده ممکن است جایگزین تنظیمات ذخیره‌شده در دستگاه‌های دیگر شما شود. فایل تنظیمات قابل خواندن ابتدا در یک نسخه پشتیبان دارای برچسب زمانی در پوشه افزونه کپی می‌شود.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'بازیابی پیش‌فرض‌ها', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: 'بازیابی تنظیمات کامل نشد. ترجیحات محلی حفظ شدند.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'تنظیمات پیش‌فرض بازیابی شد. برای پایان کار Obsidian را دوباره راه‌اندازی کنید.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'آخرین تغییر در',
        createdAt: 'ایجاد شده در',
        file: 'فایل',
        files: 'فایل',
        folder: 'پوشه',
        folders: 'پوشه',
        wordCount: 'تعداد کلمات',
        unfinishedTasks: 'وظایف ناتمام'
    },

    fileCounts: {
        words: '{count} کلمه',
        characters: '{count} نویسه',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'تغییر تنظیمات پیش‌فرض',
        metadataReport: {
            exportSuccess: 'گزارش متادیتای ناموفق به {filename} صادر شد',
            exportFailed: 'صادر کردن گزارش متادیتا ناموفق بود'
        },
        index: {
            label: 'عمومی',
            description: 'یادداشت‌های انتشار، پشتیبانی، پروفایل خزانه، انواع فایل و کلیدهای ویژگی.',
            groups: {
                about: 'درباره'
            }
        },
        pageGroups: {
            configuration: 'پیکربندی',
            navigationPane: 'پنل ناوبری',
            listPane: 'پنل لیست',
            calendarAndTools: 'تقویم و ابزارها'
        },
        pages: {
            displayFilters: {
                label: 'فیلترهای نمایش',
                description: 'پوشه‌ها، برچسب‌ها، فایل‌ها، برچسب‌های فایل و قوانین ویژگی پنهان.'
            },
            appearanceAndBehavior: {
                label: 'ظاهر و رفتار',
                description: 'رفتار، پیمایش با صفحه‌کلید، دکمه‌های ماوس، ظاهر و قالب‌بندی.',
                groups: {
                    startup: 'راه‌اندازی',
                    keyboardNavigation: 'پیمایش با صفحه‌کلید',
                    mouseButtons: 'دکمه‌های ماوس',
                    desktopAppearance: 'ظاهر دسکتاپ',
                    mobileAppearance: 'ظاهر موبایل',
                    appearance: 'ظاهر',
                    icons: 'آیکون‌ها',
                    formatting: 'قالب‌بندی'
                }
            },
            navigationPane: {
                label: 'پنل ناوبری',
                description: 'چیدمان، ظاهر، تعداد فایل‌ها، رفتار جمع‌شدن و رنگ‌های رنگین‌کمان.',
                groups: {
                    appearance: 'ظاهر',
                    banner: 'بنر',
                    collapseItems: 'جمع کردن آیتم‌ها',
                    dragAndDrop: 'کشیدن و رها کردن',
                    fileCounts: 'تعداد فایل‌ها',
                    rainbowColors: 'رنگ‌های رنگین‌کمان'
                }
            },
            shortcutsAndRecentFiles: {
                label: 'میانبرها و فایل‌های اخیر',
                description: 'قابلیت دید میانبرها، نشان‌ها، فایل‌های اخیر و موارد سنجاق‌شده.',
                groups: {
                    shortcuts: 'میانبرها',
                    recentFiles: 'فایل‌های اخیر'
                }
            },
            foldersAndFolderNotes: {
                label: 'پوشه‌ها و یادداشت‌های پوشه',
                description: 'نمایش پوشه‌ها، یادداشت‌های پوشه، الگوهای یادداشت پوشه و رفتار یادداشت پوشه.',
                groups: {
                    folders: 'پوشه‌ها',
                    folderNotes: 'یادداشت‌های پوشه',
                    folderNoteFiles: 'فایل‌های یادداشت پوشه'
                }
            },
            tagsAndProperties: {
                label: 'برچسب‌ها و ویژگی‌ها',
                description: 'بخش‌های برچسب و ویژگی، آیکون‌ها، مرتب‌سازی، محدوده و وراثت.',
                groups: {
                    tags: 'برچسب‌ها',
                    properties: 'ویژگی‌ها'
                }
            },
            listPane: {
                label: 'پنل لیست',
                description: 'مرتب‌سازی، گروه‌بندی، حالت‌های لیست، یادداشت‌های سنجاق‌شده و پیش‌نمایش‌های طراحی.',
                groups: {
                    appearance: 'ظاهر',
                    sortAndGroup: 'مرتب‌سازی و گروه‌بندی',
                    groupHeaders: 'هدرهای گروه',
                    manualSort: 'مرتب‌سازی دستی',
                    pinnedNotes: 'یادداشت‌های سنجاق‌شده',
                    behavior: 'رفتار',
                    drawingPreviews: 'پیش‌نمایش‌های طراحی'
                }
            },
            fileOperations: {
                label: 'عملیات فایل',
                description: 'الگوها، تأییدیه‌های حذف، پیوست‌ها و رفتار تعارض در جابجایی فایل.',
                groups: {
                    templates: 'الگوها'
                }
            },
            frontmatterFields: {
                label: 'فیلدهای فرانت‌متر',
                description: 'فیلدهای فرانت‌متر برای نام‌های نمایشی، نشانه‌های زمانی، آیکون‌ها و رنگ‌ها.'
            },
            fileDisplay: {
                label: 'نمایش فایل',
                description: 'عناوین، متن پیش‌نمایش، تصاویر ویژه، برچسب‌ها، ویژگی‌ها، تاریخ‌ها، تعداد کلمات و تعداد نویسه‌ها.',
                groups: {
                    icon: 'آیکون',
                    title: 'عنوان',
                    previewText: 'متن پیش‌نمایش',
                    featureImage: 'تصویر ویژه',
                    tags: 'برچسب‌ها',
                    properties: 'ویژگی‌ها',
                    tasks: 'وظایف',
                    date: 'تاریخ',
                    parentFolder: 'پوشه والد',
                    wordAndCharacterCount: 'تعداد کلمات و نویسه‌ها'
                }
            },
            calendar: {
                label: 'تقویم',
                description: 'نمایش تقویم، یادداشت‌های تاریخ، الگوها، تنظیمات محلی و مکان نوار کناری.',
                groups: {
                    appearance: 'ظاهر',
                    leftSidebar: 'نوار کناری چپ',
                    calendarIntegration: 'یکپارچه‌سازی تقویم',
                    rightSidebar: 'نوار کناری راست'
                }
            },
            iconPacks: {
                label: 'بسته‌های آیکون',
                description: 'آیکون‌های رابط کاربری، آیکون‌های فایل و مدیریت بسته‌های آیکون.'
            },
            advanced: {
                label: 'پیشرفته',
                description: 'تشخیص، پاکسازی متادیتا، واردکردن/صادرکردن و بازنشانی.',
                groups: {
                    maintenance: 'نگهداری',
                    resetSettings: 'بازنشانی تنظیمات'
                }
            }
        },
        syncMode: {
            notSynced: '(همگام نشده)',
            enableSync: 'فعال‌سازی همگام‌سازی',
            disableSync: 'غیرفعال‌سازی همگام‌سازی'
        },
        items: {
            listPaneTitle: {
                name: 'عنوان پنل لیست',
                desc: 'محل نمایش عنوان پنل لیست را انتخاب کنید.',
                options: {
                    header: 'نمایش در هدر',
                    listPane: 'نمایش در پنل لیست',
                    hidden: 'نمایش نده'
                }
            },
            defaultSortOrder: {
                name: 'ترتیب پیش‌فرض مرتب‌سازی',
                desc: 'ترتیب پیش‌فرض مرتب‌سازی یادداشت‌ها را انتخاب کنید. ویژگی‌های «ویژگی‌های مرتب‌سازی» به‌عنوان گزینه‌های مرتب‌سازی اضافی نمایش داده می‌شوند.',
                directions: {
                    asc: 'صعودی',
                    desc: 'نزولی'
                },
                dateDirections: {
                    newestOnTop: 'جدیدترین بالا',
                    oldestOnTop: 'قدیمی‌ترین بالا'
                },
                textDirections: {
                    aOnTop: 'الف بالا',
                    zOnTop: 'ی بالا'
                },
                fields: {
                    dateEdited: 'تاریخ ویرایش',
                    dateCreated: 'تاریخ ایجاد',
                    title: 'عنوان',
                    fileName: 'نام فایل',
                    property: 'ویژگی'
                }
            },
            defaultSortDirection: {
                name: 'جهت مرتب‌سازی'
            },
            defaultGroupingDirection: {
                name: 'جهت گروه‌بندی',
                options: {
                    follow: 'پیروی از ترتیب مرتب‌سازی'
                }
            },
            sortingProperties: {
                name: 'ویژگی‌های مرتب‌سازی',
                desc: 'ویژگی‌های فرانت‌متر جدا شده با کاما. هر ویژگی به‌عنوان یک گزینه مرتب‌سازی در تنظیم ترتیب پیش‌فرض مرتب‌سازی و در منوی مرتب‌سازی پنل لیست نمایش داده می‌شود. این ویژگی‌ها تغییر نمی‌کنند.',
                placeholder: 'published, author',
                defaultsResetNotices: {
                    sort: 'ترتیب پیش‌فرض مرتب‌سازی بازنشانی شد زیرا ویژگی آن دیگر در دسترس نیست.',
                    grouping: 'گروه‌بندی پیش‌فرض بازنشانی شد زیرا ویژگی آن دیگر در دسترس نیست.',
                    both: 'ترتیب پیش‌فرض مرتب‌سازی و گروه‌بندی پیش‌فرض بازنشانی شدند زیرا ویژگی‌های آن‌ها دیگر در دسترس نیستند.'
                }
            },
            propertySecondarySort: {
                name: 'مرتب‌سازی ثانویه',
                desc: 'با مرتب‌سازی بر اساس ویژگی استفاده می‌شود، زمانی که یادداشت‌ها مقدار ویژگی یکسان یا بدون مقدار ویژگی باشند.',
                options: {
                    title: 'عنوان',
                    fileName: 'نام فایل',
                    dateCreated: 'تاریخ ایجاد',
                    dateEdited: 'تاریخ ویرایش'
                }
            },
            propertySortInstructions: {
                intro: 'نحوهٔ کار مرتب‌سازی و گروه‌بندی بر اساس یک ویژگی:',
                items: [
                    '**مرتب‌سازی:** انتخاب ویژگی‌ای مانند اولویت، یادداشت‌ها را بر اساس مقادیر اولویت آن‌ها مرتب می‌کند.',
                    '**گروه‌بندی:** انتخاب ویژگی‌ای مانند وضعیت، برای هر مقدار وضعیت یک سرصفحه ایجاد می‌کند. یادداشت‌های دارای وضعیت یکسان زیر یک سرصفحه نمایش داده می‌شوند.',
                    '**چند مقدار:** اگر ویژگی شامل یک فهرست باشد، Notebook Navigator از کل فهرست استفاده می‌کند. برای مثال، اگر موضوعات شامل کتاب‌ها و تاریخ باشد، یادداشت با استفاده از «کتاب‌ها، تاریخ» مرتب یا گروه‌بندی می‌شود، نه هر موضوع به‌صورت جداگانه.',
                    '**مقادیر ناموجود:** هنگام گروه‌بندی، یادداشت‌های بدون این ویژگی در انتها زیر **هیچ‌کدام** نمایش داده می‌شوند.',
                    '**نماهای برچسب و ویژگی:** با انتخاب گروه‌بندی **پوشه**، سرصفحه‌های تاریخ نمایش داده می‌شوند.'
                ]
            },
            groupingProperties: {
                name: 'ویژگی‌های گروه‌بندی',
                desc: 'ویژگی‌های فرانت‌متر جدا شده با کاما. هر ویژگی به‌عنوان یک گزینه گروه‌بندی در تنظیم گروه‌بندی پیش‌فرض و در منوی مرتب‌سازی پنل لیست نمایش داده می‌شود. این ویژگی‌ها تغییر نمی‌کنند.',
                placeholder: 'status, genre'
            },
            manualSortProperty: {
                name: 'ویژگی مرتب‌سازی دستی',
                desc: 'ویژگی فرانت‌متر که برای ذخیره مقادیر شاخص عددی در مرتب‌سازی دستی استفاده می‌شود.'
            },
            groupHeaderProperty: {
                name: 'ویژگی هدر گروه',
                desc: 'ویژگی فرانت‌متر که برای ذخیره هدرهای سفارشی گروه استفاده می‌شود.'
            },
            groupHeadersInstructions: {
                intro: 'هدرهای سفارشی گروه بالای یادداشت‌ها در پنل لیست نمایش داده می‌شوند.',
                items: [
                    'از منوی مرتب‌سازی در پنل لیست، گروه‌بندی را روی **سفارشی** تنظیم کنید.',
                    'روی یک یادداشت کلیک راست کنید و **تنظیم هدر گروه** را انتخاب کنید تا یک هدر بالای آن قرار گیرد.'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'محل قرارگیری یادداشت جدید',
                desc: 'محل قرارگیری یادداشت‌های جدید را زمانی که فهرست فعلی از مرتب‌سازی دستی استفاده می‌کند، انتخاب کنید.',
                options: {
                    top: 'بالا',
                    bottom: 'پایین',
                    belowSelectedNote: 'زیر یادداشت انتخاب‌شده',
                    unsorted: 'مرتب‌نشده'
                }
            },
            confirmBeforeManualSort: {
                name: 'تأیید پیش از مرتب‌سازی دستی',
                desc: 'پیش از نوشتن ویژگی مرتب‌سازی دستی در یادداشت‌ها برای نخستین بار، یک هشدار نمایش داده شود. هنگامی که غیرفعال باشد، یادداشت‌ها بدون هشدار این ویژگی را دریافت می‌کنند.'
            },
            manualSortInstructions: {
                intro: 'مرتب‌سازی دستی یک مقدار شاخص عددی را در یک ویژگی فرانت‌متر بر روی هر یادداشت می‌نویسد. یادداشت‌های بدون شاخص در زیر بخش مرتب‌نشده ظاهر می‌شوند.',
                items: [
                    'مرتب‌سازی دستی را با انتخاب **مرتب‌سازی دستی** از منوی مرتب‌سازی فعال کنید. پس از آن، دو روش برای بازآرایی یادداشت‌ها وجود دارد.',
                    '**ویرایش ترتیب مرتب‌سازی...** را از منوی مرتب‌سازی انتخاب کنید تا نمای بازآرایی باز شود. یادداشت‌ها را با ماوس بکشید یا روی موبایل با لمس. در دسکتاپ، کلیک **Cmd/Ctrl** یا **Shift** چندین یادداشت را انتخاب می‌کند، سپس کشیدن هر یک از آن‌ها کل گروه را جابه‌جا می‌کند.',
                    'در پنل لیست، یک یادداشت را انتخاب کنید یا چندین یادداشت را به صورت چندانتخابی انتخاب کنید، سپس **Cmd/Ctrl + Arrow Up/Down** را فشار دهید تا انتخاب به بالا یا پایین جابه‌جا شود.'
                ]
            },
            scrollToSelectedFileOnListChanges: {
                name: 'اسکرول به فایل انتخابی هنگام تغییر لیست',
                desc: 'هنگام سنجاق کردن یادداشت‌ها، نمایش یادداشت‌های زیرمجموعه، تغییر ظاهر پوشه، یا اجرای عملیات فایل به فایل انتخابی اسکرول کنید.'
            },
            includeDescendantNotes: {
                name: 'نمایش یادداشت‌ها از زیرپوشه‌ها / زیرمجموعه‌ها',
                desc: 'یادداشت‌های زیرپوشه‌های تودرتو و زیرمجموعه‌های برچسب و ویژگی را هنگام مشاهده پوشه، برچسب یا ویژگی شامل کنید.'
            },
            filterPinnedNotesByFolder: {
                name: 'سنجاق کردن یادداشت‌ها فقط در پوشه خودشان',
                desc: 'یادداشت‌های سنجاق‌شده فقط در پوشه خودشان سنجاق‌شده نشان داده می‌شوند. مفید برای یادداشت‌های پوشه یا اگر تعداد زیادی یادداشت سنجاق‌شده دارید. بر نماهای برچسب یا ویژگی تأثیر نمی‌گذارد.'
            },
            separateFileCounts: {
                name: 'نمایش جداگانه تعداد فایل‌های فعلی و زیرمجموعه',
                desc: 'تعداد فایل‌ها را به صورت "فعلی ▾ زیرمجموعه" برای پوشه‌ها، برچسب‌ها و ویژگی‌ها نمایش دهید.'
            },
            defaultGrouping: {
                name: 'گروه‌بندی پیش‌فرض',
                desc: '**سرصفحه‌ها** فهرست مرتب‌شده را بدون تغییر ترتیب آن نشانه‌گذاری می‌کنند: «سفارشی» سرصفحه‌های تعریف‌شده در فرانت‌متر را نمایش می‌دهد و «تاریخ» سرصفحه‌های تاریخ را درج می‌کند. **گروه‌ها** فهرست را دوباره مرتب می‌کنند: گروه‌های پوشه و ویژگی به‌طور مستقل مرتب می‌شوند و یادداشت‌های درون هر گروه از ترتیب مرتب‌سازی پیروی می‌کنند.',
                families: {
                    headers: 'سرصفحه‌ها',
                    groups: 'گروه‌ها'
                },
                options: {
                    custom: 'سفارشی',
                    date: 'تاریخ',
                    folder: 'پوشه'
                }
            },
            alwaysShowAllTagAndPropertyPills: {
                name: 'نمایش همیشگی تمام نشان‌های برچسب و ویژگی',
                desc: 'در صورت غیرفعال بودن، نشان‌هایی که با انتخاب ناوبری فعلی مطابقت دارند پنهان می‌شوند (مثلاً نشان برچسب «دستور پخت» هنگام مرور برچسب «دستور پخت» پنهان می‌شود). فعال کنید تا همه نشان‌ها همیشه نمایش داده شوند.'
            },
            stickyGroupHeaders: {
                name: 'هدرهای گروه چسبان',
                desc: 'هدر بخش تاریخ، پوشه، ویژگی یا قسمت سنجاق‌شده فعلی را هنگام پیمایش نمایان نگه می‌دارد.'
            },
            showSubfolderPaths: {
                name: 'نمایش مسیرهای زیرپوشه',
                desc: 'هنگام گروه‌بندی بر اساس پوشه در پنل لیست، مسیرهای زیرپوشه را به جای فقط نام پوشه‌ها نمایش دهید.'
            },
            showGroupHeaderItemCounts: {
                name: 'نمایش تعداد موارد',
                desc: 'تعداد موارد را در هر سربرگ گروه در پنل لیست نمایش دهید.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'گروه‌بندی پوشه: فایل‌های پوشه فعلی در پایین',
                desc: 'وقتی گروه‌بندی پیش‌فرض روی پوشه است، فایل‌هایی که مستقیماً در پوشه انتخاب‌شده هستند به زیر گروه‌های زیرپوشه منتقل می‌شوند.'
            },
            defaultListMode: {
                name: 'حالت لیست پیش‌فرض',
                desc: 'نمای لیست پیش‌فرض را انتخاب کنید. استاندارد عنوان، تاریخ، توضیحات و متن پیش‌نمایش را نمایش می‌دهد. فشرده فقط عنوان را نمایش می‌دهد. ظاهر را برای هر پوشه جداگانه تنظیم کنید.',
                options: {
                    standard: 'استاندارد',
                    compact: 'فشرده'
                }
            },
            showFileIcons: {
                name: 'نمایش آیکون‌های فایل',
                desc: 'آیکون‌های فایل را با فاصله‌گذاری چپ‌چین نمایش دهید. غیرفعال کردن آیکون‌ها و تورفتگی را حذف می‌کند. اولویت: آیکون وظایف ناتمام > آیکون سفارشی > آیکون پوشه > آیکون نام فایل > آیکون نوع فایل > آیکون پیش‌فرض.'
            },
            unfinishedTaskIcon: {
                name: 'آیکون وظایف ناتمام',
                desc: 'هنگامی که یادداشت وظایف ناتمام دارد، آیکون فایل را جایگزین کنید.',
                options: {
                    disabled: 'غیرفعال',
                    compact: 'حالت فشرده',
                    standardAndCompact: 'استاندارد و فشرده'
                }
            },
            useFolderIcon: {
                name: 'استفاده از آیکون پوشه',
                desc: 'هنگامی که آیکون فایل سفارشی تنظیم نشده باشد، آیکون پوشه والد را نمایش دهید. هنگامی که رنگ فایل سفارشی تنظیم نشده باشد، از رنگ پوشه استفاده می‌شود.'
            },
            showFileTaskProgress: {
                name: 'پیشرفت وظایف',
                desc: 'نمایش وضعیت وظایف همراه با نوار پیشرفت و تعداد وظایف اختیاری. رنگ وظایف ناتمام و وظایف تکمیل‌شده را می‌توان جداگانه با افزونه Style Settings تنظیم کرد.'
            },
            showFileTaskProgressBar: {
                name: 'پیشرفت وظایف: نوار پیشرفت',
                desc: 'نمایش نوار پیشرفت در کنار آیکون وظیفه.'
            },
            showFileTaskProgressCount: {
                name: 'پیشرفت وظایف: تعداد وظایف',
                desc: 'نمایش تعداد وظایف انجام‌شده و تعداد کل وظایف، برای مثال 3/7.'
            },
            hideFileTaskProgressWhenComplete: {
                name: 'پیشرفت وظایف: پنهان کردن پس از تکمیل',
                desc: 'پنهان کردن پیشرفت وظایف زمانی که همه وظایف یادداشت تکمیل شده‌اند.'
            },
            unfinishedTaskBackground: {
                name: 'پس‌زمینه وظایف ناتمام',
                desc: 'اعمال رنگ پس‌زمینه زمانی که یادداشت وظایف ناتمام دارد.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'رنگ پس‌زمینه وظایف ناتمام',
                desc: 'تنظیم رنگ پس‌زمینه مورد استفاده زمانی که یادداشت وظایف ناتمام دارد.'
            },
            showFileNameIcons: {
                name: 'آیکون بر اساس نام فایل',
                desc: 'تخصیص آیکون به فایل‌ها بر اساس متن در نام آن‌ها.'
            },
            fileNameIconMap: {
                name: 'نگاشت آیکون نام فایل',
                desc: 'فایل‌های حاوی متن آیکون مشخص‌شده را دریافت می‌کنند. یک نگاشت در هر خط: متن=آیکون',
                placeholder: '# متن=آیکون\nجلسه=ph-calendar\nفاکتور=ph-receipt',
                editTooltip: 'ویرایش نگاشت‌ها'
            },
            showFileTypeIcons: {
                name: 'آیکون بر اساس نوع فایل',
                desc: 'تخصیص آیکون به فایل‌ها بر اساس پسوند آن‌ها.'
            },
            fileTypeIconPreset: {
                name: 'پیش‌تنظیم آیکون فایل',
                desc: 'آیکون‌های داخلی یا یک پیش‌تنظیم بسته آیکون را انتخاب کنید. قوانین سفارشی پسوند این پیش‌تنظیم را بازنویسی می‌کنند.',
                options: {
                    builtIn: 'آیکون‌های داخلی'
                },
                notInstalledWarning: 'این بسته آیکون نصب نشده است. به‌جای آن آیکون‌های داخلی نمایش داده می‌شوند.'
            },
            fileTypeIconMap: {
                name: 'نگاشت آیکون نوع فایل',
                desc: 'فایل‌های با پسوند مشخص آیکون مشخص‌شده را دریافت می‌کنند. یک نگاشت در هر خط: پسوند=آیکون',
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'ویرایش نگاشت‌ها'
            },
            compactItemHeight: {
                name: 'ارتفاع آیتم فشرده',
                desc: 'ارتفاع آیتم‌های لیست فشرده را در دسکتاپ و موبایل تنظیم کنید (پیکسل).',
                resetTooltip: 'بازگشت به پیش‌فرض (۲۸ پیکسل)'
            },
            compactItemHeightScaleText: {
                name: 'مقیاس‌بندی متن با ارتفاع آیتم فشرده',
                desc: 'متن لیست فشرده را هنگام کاهش ارتفاع آیتم مقیاس‌بندی کنید.'
            },
            showParentFolder: {
                name: 'نمایش پوشه والد',
                desc: 'نام پوشه والد را برای یادداشت‌ها در زیرپوشه‌ها، برچسب‌ها یا ویژگی‌ها نمایش دهید.'
            },
            showFolderPath: {
                name: 'نمایش مسیر پوشه',
                desc: 'مسیر را نسبت به پوشه انتخاب‌شده به جای فقط نام پوشه نمایش دهید. برچسب‌ها و ویژگی‌ها مسیر کامل را نشان می‌دهند.'
            },
            parentFolderClickOpensFolder: {
                name: 'کلیک روی پوشه والد پوشه را باز می‌کند',
                desc: 'کلیک روی برچسب پوشه والد پوشه را در پنل لیست باز می‌کند.'
            },
            showParentFolderColor: {
                name: 'نمایش رنگ پوشه والد',
                desc: 'از رنگ‌های پوشه روی برچسب‌های پوشه والد استفاده کنید.'
            },
            showParentFolderIcon: {
                name: 'نمایش آیکون پوشه والد',
                desc: 'آیکون‌های پوشه را کنار برچسب‌های پوشه والد نمایش دهید.'
            },
            showQuickActions: {
                name: 'نمایش اقدامات سریع',
                desc: 'دکمه‌های اقدام را هنگام قرار گرفتن روی فایل‌ها نمایش دهید. کنترل دکمه اقداماتی که نمایش داده می‌شوند را انتخاب می‌کند.'
            },
            dualPane: {
                name: 'نمای پنل دوگانه',
                desc: 'پنل ناوبری و پنل لیست را کنار هم نمایش دهید.'
            },
            dualPaneOrientation: {
                name: 'جهت پنل دوگانه',
                desc: 'نمای افقی یا عمودی را هنگام فعال بودن پنل دوگانه انتخاب کنید.',
                options: {
                    horizontal: 'تقسیم افقی',
                    vertical: 'تقسیم عمودی'
                }
            },
            narrowSidebarBehavior: {
                name: 'وقتی نوار کناری خیلی باریک است',
                desc: 'انتخاب کنید وقتی پنل ناوبری و پنل فهرست کنار هم جا نمی‌شوند چه اتفاقی بیفتد.',
                options: {
                    none: 'هیچ کاری نکن',
                    singlePane: 'تغییر به پنل تکی',
                    vertical: 'تغییر به تقسیم عمودی'
                }
            },
            narrowSidebarThresholdMode: {
                name: 'آستانهٔ نوار کناری باریک',
                desc: 'انتخاب کنید آستانهٔ عرض نوار کناری چگونه محاسبه شود.',
                options: {
                    fitPanes: 'جا دادن پنل‌ها',
                    customWidth: 'عرض سفارشی'
                }
            },
            narrowSidebarThresholdWidth: {
                name: 'عرض آستانهٔ نوار کناری باریک',
                desc: 'وقتی نوار کناری از این عرض باریک‌تر است تغییر کند.',
                resetTooltip: 'بازنشانی به عرض پیش‌فرض'
            },
            paneBackgroundColor: {
                name: 'رنگ پس‌زمینه',
                desc: 'رنگ‌های پس‌زمینه را برای پنل‌های ناوبری و لیست انتخاب کنید.',
                options: {
                    separate: 'پس‌زمینه‌های جداگانه',
                    listBackground: 'استفاده از پس‌زمینه لیست',
                    navigationBackground: 'استفاده از پس‌زمینه ناوبری'
                }
            },
            zoomLevel: {
                name: 'سطح زوم',
                desc: 'سطح زوم کلی Notebook Navigator را کنترل می‌کند (درصد).'
            },
            useFloatingToolbarsOnIOS: {
                name: 'استفاده از نوار ابزار شناور در iOS',
                desc: 'فقط برای iOS اعمال می‌شود.'
            },
            defaultStartupView: {
                name: 'نمای پیش‌فرض شروع',
                desc: 'پنل فعال هنگام باز شدن Notebook Navigator را انتخاب کنید. در چیدمان تک‌پنلی این پنل ابتدا نمایش داده می‌شود؛ در چیدمان دوپنلی فوکوس صفحه‌کلید به آن داده می‌شود.',
                options: {
                    navigation: 'پنل ناوبری',
                    listPane: 'پنل لیست'
                }
            },
            toolbarButtons: {
                name: 'دکمه‌های نوار ابزار',
                desc: 'دکمه‌هایی که در نوار ابزار نمایش داده می‌شوند را انتخاب کنید. دکمه‌های مخفی از طریق دستورات و منوها قابل دسترسی هستند.'
            },
            openNewNotesInNewTab: {
                name: 'باز کردن یادداشت‌های جدید در زبانه جدید',
                desc: 'وقتی فعال باشد، فرمان ایجاد یادداشت جدید یادداشت‌ها را در زبانه جدید باز می‌کند. وقتی غیرفعال باشد، یادداشت‌ها جایگزین زبانه فعلی می‌شوند.'
            },
            autoRevealActiveNote: {
                name: 'نمایش خودکار یادداشت فعال',
                desc: 'یادداشت‌ها را هنگام باز شدن از پرش سریع، لینک‌ها یا جستجو به طور خودکار نمایش دهید.'
            },
            autoRevealShortestPath: {
                name: 'نمایش خودکار: استفاده از کوتاه‌ترین مسیر',
                desc: 'فعال: نمایش خودکار نزدیک‌ترین پوشه یا برچسب قابل مشاهده را انتخاب می‌کند. غیرفعال: نمایش خودکار پوشه واقعی فایل و برچسب دقیق را انتخاب می‌کند.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'نمایش خودکار: نادیده گرفتن رویدادها از نوار کناری راست',
                desc: 'یادداشت فعال را هنگام کلیک یا تغییر یادداشت‌ها در نوار کناری راست تغییر ندهید.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'نمایش خودکار: نادیده گرفتن رویدادها از پنجره‌های دیگر',
                desc: 'یادداشت فعال را هنگام کار با یادداشت‌ها در پنجره دیگر تغییر ندهید.'
            },
            singlePaneAnimation: {
                name: 'انیمیشن پنل تکی',
                desc: 'مدت زمان انتقال هنگام جابجایی بین پنل‌ها در حالت پنل تکی (میلی‌ثانیه).',
                resetTooltip: 'بازنشانی به پیش‌فرض'
            },
            autoSelectFirstNote: {
                name: 'انتخاب خودکار اولین یادداشت',
                desc: 'هنگام تعویض پوشه‌ها، برچسب‌ها یا ویژگی‌ها به طور خودکار اولین یادداشت را باز کنید.'
            },
            disableShortcutAutoScroll: {
                name: 'غیرفعال کردن اسکرول خودکار برای میانبرها',
                desc: 'هنگام کلیک روی آیتم‌ها در میانبرها پنل ناوبری را اسکرول نکنید.'
            },
            expandOnSelection: {
                name: 'باز کردن هنگام انتخاب',
                desc: 'پوشه‌ها، برچسب‌ها و ویژگی‌ها را هنگام انتخاب باز کنید. در حالت پنل تکی، اولین انتخاب باز می‌کند، دومین انتخاب فایل‌ها را نمایش می‌دهد.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'یک شاخه باز',
                desc: 'هنگام باز کردن یک پوشه، برچسب یا ویژگی، شاخه‌های دیگر همان درخت را جمع کنید.'
            },
            springLoadedFolders: {
                name: 'گسترش هنگام کشیدن',
                desc: 'پوشه‌ها و برچسب‌ها را هنگام قرار گرفتن روی آن‌ها در حین کشیدن گسترش دهید.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'گسترش هنگام کشیدن: تأخیر گسترش اول',
                desc: 'تأخیر قبل از گسترش اولین پوشه یا برچسب هنگام کشیدن (ثانیه).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'گسترش هنگام کشیدن: تأخیر گسترش‌های بعدی',
                desc: 'تأخیر قبل از گسترش پوشه‌ها یا برچسب‌های بیشتر در همان عملیات کشیدن (ثانیه).'
            },
            navigationBanner: {
                name: 'بنر ناوبری (پروفایل خزانه)',
                desc: 'تصویری را بالای پنل ناوبری نمایش دهید. با پروفایل خزانه انتخابی تغییر می‌کند.',
                current: 'بنر فعلی: {path}',
                chooseButton: 'انتخاب تصویر'
            },
            pinNavigationBanner: {
                name: 'سنجاق کردن بنر',
                desc: 'سنجاق کردن بنر ناوبری بالای درخت ناوبری.'
            },
            showShortcuts: {
                name: 'نمایش میانبرها',
                desc: 'بخش میانبرها را در پنل ناوبری نمایش دهید.'
            },
            shortcutBadgeDisplay: {
                name: 'نشان میانبر',
                desc: "چه چیزی در کنار میانبرها نمایش داده شود. از دستورات 'باز کردن میانبر 1-9' برای باز کردن مستقیم میانبرها استفاده کنید.",
                options: {
                    position: 'موقعیت (1-9)',
                    count: 'تعداد موارد',
                    none: 'هیچ'
                }
            },
            showRecentFiles: {
                name: 'نمایش فایل‌های اخیر',
                desc: 'بخش فایل‌های اخیر را در پنل ناوبری نمایش دهید.'
            },
            hideFileTypesFromRecentFiles: {
                name: 'پنهان کردن انواع فایل از فایل‌های اخیر',
                desc: 'انتخاب کنید کدام انواع فایل در بخش فایل‌های اخیر پنهان شوند.',
                options: {
                    none: 'هیچ‌کدام',
                    folderNotes: 'یادداشت‌های پوشه'
                }
            },
            recentFilesCount: {
                name: 'تعداد فایل‌های اخیر',
                desc: 'تعداد فایل‌های اخیر که نمایش داده می‌شوند.'
            },
            pinRecentFilesWithShortcuts: {
                name: 'سنجاق کردن فایل‌های اخیر با میانبرها',
                desc: 'هنگام سنجاق کردن میانبرها، فایل‌های اخیر را نیز شامل شود.'
            },
            enableCalendar: {
                name: 'فعال‌سازی تقویم',
                desc: 'فعال‌سازی ویژگی‌های تقویم در Notebook Navigator.'
            },
            calendarPlacement: {
                name: 'محل قرارگیری تقویم',
                desc: 'نمایش در نوار کناری چپ یا راست.',
                options: {
                    leftSidebar: 'نوار کناری چپ',
                    rightSidebar: 'نوار کناری راست'
                }
            },
            calendarSinglePanePlacement: {
                name: 'جایگاه پنل تکی',
                desc: 'محل نمایش تقویم در حالت پنل تکی.',
                options: {
                    navigationPane: 'پنل ناوبری',
                    belowPanes: 'زیر پنل‌ها'
                }
            },
            calendarLocale: {
                name: 'زبان',
                desc: 'قالب‌بندی تاریخ تقویم، شماره‌گذاری هفته و اولین روز هفته را کنترل می‌کند.',
                weekPathMismatchWarning:
                    'تقویم قابل مشاهده و مسیرهای یادداشت‌های هفتگی از شروع‌های هفته یا شماره‌گذاری هفته متفاوتی استفاده می‌کنند.',
                options: {
                    systemDefault: 'پیش‌فرض'
                }
            },
            calendarWeekendDays: {
                name: 'روزهای آخر هفته',
                desc: 'نمایش روزهای آخر هفته با رنگ پس‌زمینه متفاوت.',
                options: {
                    none: 'هیچ',
                    satSun: 'شنبه و یکشنبه',
                    friSat: 'جمعه و شنبه',
                    thuFri: 'پنجشنبه و جمعه'
                }
            },
            calendarMonthNameFormat: {
                name: 'قالب نام ماه',
                desc: 'نام ماه کامل (January) یا کوتاه (Jan).',
                options: {
                    full: 'January (کامل)',
                    short: 'Jan (کوتاه)'
                }
            },
            showInfoButtons: {
                name: 'نمایش دکمه‌های اطلاعات',
                desc: 'نمایش دکمه‌های اطلاعات در نوار جستجو و سربرگ تقویم.'
            },
            calendarLeftSidebarWeeksToShow: {
                name: 'هفته‌های نمایش در نوار کناری چپ',
                desc: 'تقویم در نوار کناری راست همیشه ماه کامل را نمایش می‌دهد.',
                options: {
                    fullMonth: 'ماه کامل',
                    oneWeek: '۱ هفته',
                    weeksCount: '{count} هفته'
                }
            },
            calendarHighlightToday: {
                name: 'برجسته کردن تاریخ امروز',
                desc: 'برجسته کردن تاریخ امروز با رنگ پس‌زمینه و متن پررنگ.'
            },
            calendarShowFeatureImage: {
                name: 'نمایش تصویر شاخص',
                desc: 'نمایش تصاویر شاخص یادداشت‌ها در تقویم.'
            },
            calendarShowTasks: {
                name: 'نمایش وظایف',
                desc: 'نمایش نشانگر روی روزها، هفته‌ها و ماه‌های دارای وظایف ناتمام.'
            },
            calendarShowWeekNumber: {
                name: 'نمایش شماره هفته',
                desc: 'افزودن ستون شماره هفته.'
            },
            calendarShowQuarter: {
                name: 'نمایش فصل',
                desc: 'افزودن برچسب فصل در سربرگ تقویم.'
            },
            calendarShowOutsideMonthDays: {
                name: 'نمایش روزهای ماه‌های دیگر',
                desc: 'نمایش روزهای ماه قبل و ماه بعد هنگامی که تقویم یک ماه کامل را نشان می‌دهد.'
            },
            calendarShowYearCalendar: {
                name: 'نمایش تقویم سالانه',
                desc: 'نمایش ناوبری سال و شبکه ماه‌ها در نوار کناری سمت راست.'
            },
            calendarConfirmBeforeCreate: {
                name: 'تأیید قبل از ایجاد یادداشت جدید',
                desc: 'نمایش پنجره تأیید هنگام ایجاد یادداشت روزانه جدید.'
            },
            calendarShowHiddenItems: {
                name: 'نمایش آیتم‌های مخفی',
                desc: 'وقتی فعال، تقویم همیشه همه یادداشت‌های تقویم را نشان می‌دهد، از جمله یادداشت‌های پنهان‌شده توسط فیلترهای پروفایل خزانه.'
            },
            dailyNoteSource: {
                name: 'منبع یادداشت روزانه',
                desc: 'منبع یادداشت‌های تقویم.',
                options: {
                    dailyNotes: 'یادداشت‌های روزانه (افزونه اصلی)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'پوشه و قالب تاریخ در افزونه هسته یادداشت‌های روزانه پیکربندی شده‌اند.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'زبان یادداشت‌های دوره‌ای',
                desc: 'نام‌های ماه، روزهای هفته، شماره‌های هفته و شروع هفته به صورت محلی‌شده در مسیرهای یادداشت‌های دوره‌ای Notebook Navigator را کنترل می‌کند.',
                options: {
                    calendar: 'تقویم',
                    obsidian: 'Obsidian'
                }
            },

            periodicNotesRootFolder: {
                name: 'پوشه ریشه (پروفایل خزانه)',
                desc: 'پوشه پایه برای یادداشت‌های دوره‌ای. الگوهای تاریخ می‌توانند شامل زیرپوشه‌ها باشند. با پروفایل خزانه انتخاب‌شده تغییر می‌کند.',
                placeholder: 'شخصی/خاطرات'
            },
            templateFolderLocation: {
                name: 'محل پوشه الگوها',
                desc: 'انتخابگر فایل الگو یادداشت‌های این پوشه را نمایش می‌دهد.',
                placeholder: 'الگوها',
                usage: 'برای یادداشت‌های تقویم و یادداشت‌های پوشه استفاده می‌شود. الگوها را در تقویم > یکپارچه‌سازی تقویم و پوشه‌ها و یادداشت‌های پوشه > فایل‌های یادداشت پوشه پیکربندی کنید.'
            },
            calendarDailyNotePattern: {
                name: 'یادداشت‌های روزانه',
                desc: 'قالب‌بندی مسیر با استفاده از قالب تاریخ Moment. نام زیرپوشه‌ها را در کروشه قرار دهید، مثال [Work]/YYYY. روی آیکون الگو کلیک کنید تا الگو تنظیم شود. محل پوشه الگوها را در عملیات فایل > الگوها تنظیم کنید.',
                placeholder: 'YYYY/YYYYMMDD',
                parsingError: 'الگو باید بتواند به یک تاریخ کامل (سال، ماه، روز) قالب‌بندی شود و دوباره به همان تاریخ تجزیه شود.'
            },
            calendarPeriodicNotePatterns: {
                momentDescPrefix: 'قالب‌بندی مسیر با استفاده از ',
                momentLinkText: 'فرمت تاریخ Moment',
                momentDescSuffix:
                    '. نام زیرپوشه‌ها را در کروشه قرار دهید، مثال [Work]/YYYY. روی آیکون الگو کلیک کنید تا الگو تنظیم شود. محل پوشه الگوها را در عملیات فایل > الگوها تنظیم کنید.',
                templateTokenNoticeLabel: 'مهم!',
                templateTokenNotice:
                    'پشتیبانی از الگوها به افزونه Templater نیاز دارد. قالب‌های داخلی مانند {{date}} و {{title}} فقط زمانی کار می‌کنند که {source} روی {option} تنظیم شده باشد.',
                example: 'نحوه نگارش فعلی: {path}'
            },
            templaterSupport: {
                installed: '✅ افزونه Templater با پشتیبانی کامل از الگوها نصب شده است.',
                missing: '⚠️ برای پشتیبانی از الگوها، افزونه Templater را نصب کنید.'
            },
            calendarWeeklyNotePattern: {
                name: 'یادداشت‌های هفتگی',
                parsingError: 'الگو باید بتواند به یک هفته کامل (سال هفته، شماره هفته) قالب‌بندی شود و دوباره تجزیه شود.',
                weekPathMismatchWarning:
                    'مسیرهای یادداشت‌های هفتگی از زبان یادداشت‌های دوره‌ای استفاده می‌کنند. از زبان‌های مطابق استفاده کنید، یا از "GGGG" با "WW" برای هفته‌های مبتنی بر دوشنبه استفاده کنید.',
                mixedWeekTokensWarning:
                    'این الگو توکن‌های هفته مبتنی بر دوشنبه ("W" یا "G") را با توکن‌های هفته مبتنی بر زبان ("w" یا "g") ترکیب می‌کند. به طور مداوم از یک مجموعه استفاده کنید: "GGGG" با "WW" برای هفته‌های مبتنی بر دوشنبه، یا "gggg" با "ww" اگر یادداشت‌های هفتگی باید از زبان انتخاب‌شده پیروی کنند.'
            },
            calendarMonthlyNotePattern: {
                name: 'یادداشت‌های ماهانه',
                parsingError: 'الگو باید بتواند به یک ماه کامل (سال، ماه) قالب‌بندی شود و دوباره تجزیه شود.'
            },
            calendarQuarterlyNotePattern: {
                name: 'یادداشت‌های فصلی',
                parsingError: 'الگو باید بتواند به یک فصل کامل (سال، فصل) قالب‌بندی شود و دوباره تجزیه شود.'
            },
            calendarYearlyNotePattern: {
                name: 'یادداشت‌های سالانه',
                parsingError: 'الگو باید بتواند به یک سال کامل (سال) قالب‌بندی شود و دوباره تجزیه شود.'
            },
            periodicNoteTemplateFile: {
                current: 'فایل الگو: {name}'
            },
            showTooltips: {
                name: 'نمایش راهنماها',
                desc: 'هنگام قرار گرفتن روی یادداشت‌ها و پوشه‌ها، راهنماهایی با اطلاعات اضافی نمایش دهید.'
            },
            showTooltipPath: {
                name: 'نمایش مسیر در راهنماها',
                desc: 'مسیر پوشه را زیر نام یادداشت در راهنماها نمایش دهید.'
            },
            showTooltipWordCount: {
                name: 'نمایش تعداد کلمات در راهنماها',
                desc: 'تعداد کلمات یادداشت‌ها را در راهنماها نمایش دهید.'
            },
            resetPaneSeparator: {
                name: 'بازنشانی موقعیت جداکننده پنل',
                desc: 'جداکننده قابل کشیدن بین پنل ناوبری و پنل لیست را به موقعیت پیش‌فرض بازنشانی کنید.',
                buttonText: 'بازنشانی جداکننده',
                notice: 'موقعیت جداکننده بازنشانی شد. Obsidian را دوباره راه‌اندازی کنید یا Notebook Navigator را دوباره باز کنید.'
            },
            importAndExportSettings: {
                name: 'وارد و صادر کردن تنظیمات',
                desc: 'تنظیمات Notebook Navigator را به صورت JSON صادر یا وارد کنید. وارد کردن، همه تنظیمات را جایگزین می‌کند.',
                importButtonText: 'وارد کردن',
                exportButtonText: 'صادر کردن',
                import: {
                    modalTitle: 'وارد کردن تنظیمات',
                    fileButtonName: 'وارد کردن از فایل',
                    fileButtonDesc: 'یک فایل JSON را از دیسک بارگذاری کنید.',
                    fileButtonText: 'وارد کردن از فایل',
                    editorName: 'JSON',
                    editorDesc: 'JSON را در زیر جای‌گذاری یا ویرایش کنید. تنظیمات شامل‌نشده به مقدار پیش‌فرض بازنشانی می‌شوند.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'وارد کردن',
                    confirmTitle: 'تنظیمات وارد شوند؟',
                    confirmMessage: 'وارد کردن، تنظیمات فعلی Notebook Navigator را جایگزین می‌کند.',
                    backupToggleName: 'ذخیره تنظیمات فعلی در ریشه خزانه قبل از وارد کردن',
                    backupToggleDesc: 'یک فایل JSON زمان‌دار در ریشه خزانه ایجاد می‌کند.',
                    successWithBackupNotice: 'تنظیمات وارد شد. تنظیمات قبلی در {path} ذخیره شد.',
                    backupError: 'ذخیره تنظیمات فعلی ممکن نبود: {message}',
                    successNotice: 'تنظیمات وارد شد.',
                    errorNotice: 'وارد کردن تنظیمات ناموفق بود: {message}',
                    fileReadError: 'خواندن فایل ممکن نبود: {message}'
                },
                export: {
                    modalTitle: 'صادر کردن تنظیمات',
                    editorName: 'JSON',
                    editorDesc: 'فقط تنظیماتی که از پیش‌فرض تغییر کرده‌اند شامل می‌شوند.',
                    placeholder: '{}',
                    copyButtonText: 'کپی به کلیپ‌بورد',
                    downloadButtonText: 'دانلود',
                    copyNotice: 'تنظیمات به کلیپ‌بورد کپی شد.',
                    downloadNotice: 'تنظیمات صادر شد.',
                    downloadError: 'صادر کردن تنظیمات ناموفق بود: {message}'
                }
            },
            resetAllSettings: {
                name: 'بازنشانی همه تنظیمات',
                desc: 'همه تنظیمات Notebook Navigator را به مقادیر پیش‌فرض بازنشانی کنید.',
                buttonText: 'بازنشانی همه تنظیمات',
                confirmTitle: 'بازنشانی همه تنظیمات؟',
                confirmMessage: 'این کار همه تنظیمات Notebook Navigator را به مقادیر پیش‌فرض بازنشانی می‌کند. قابل برگشت نیست.',
                confirmButtonText: 'بازنشانی همه تنظیمات',
                notice: 'همه تنظیمات بازنشانی شد. Obsidian را دوباره راه‌اندازی کنید یا Notebook Navigator را دوباره باز کنید.',
                error: 'بازنشانی تنظیمات ناموفق بود.'
            },
            multiSelectModifier: {
                name: 'کلید تغییردهنده انتخاب چندگانه',
                desc: 'کلید تغییردهنده‌ای که انتخاب چندگانه را فعال می‌کند را انتخاب کنید. وقتی Option/Alt انتخاب شود، کلیک Cmd/Ctrl یادداشت‌ها را در تب جدید باز می‌کند.',
                options: {
                    cmdCtrl: 'کلیک Cmd/Ctrl',
                    optionAlt: 'کلیک Option/Alt'
                }
            },
            enterToOpenFiles: {
                name: 'فشار Enter برای باز کردن فایل‌ها',
                desc: 'فایل‌ها فقط با فشار دادن Enter در هنگام پیمایش با صفحه‌کلید در لیست باز شوند. در macOS، این کار از تغییر نام فایل‌ها با Enter جلوگیری می‌کند.'
            },
            shiftEnterAction: {
                name: 'Shift+Enter',
                desc: 'انتخاب کنید که Shift+Enter فایل انتخاب‌شده را باز کند یا نام آن را تغییر دهد.'
            },
            cmdEnterAction: {
                name: 'Cmd+Enter',
                desc: 'انتخاب کنید که Cmd+Enter فایل انتخاب‌شده را باز کند یا نام آن را تغییر دهد.'
            },
            ctrlEnterAction: {
                name: 'Ctrl+Enter',
                desc: 'انتخاب کنید که Ctrl+Enter فایل انتخاب‌شده را باز کند یا نام آن را تغییر دهد.'
            },
            mouseBackForwardAction: {
                name: 'دکمه‌های عقب/جلو ماوس',
                desc: 'عملکرد دکمه‌های عقب و جلو ماوس در دسکتاپ.',
                options: {
                    systemDefault: 'استفاده از پیش‌فرض سیستم',
                    singlePaneSwitch: 'تغییر پنل (تک‌پنل)',
                    history: 'پیمایش تاریخچه'
                }
            },
            showFileTypes: {
                name: 'نمایش انواع فایل (پروفایل خزانه)',
                desc: 'فیلتر کنید کدام انواع فایل در ناوبر نمایش داده شوند. انواع فایل پشتیبانی‌نشده توسط Obsidian ممکن است در برنامه‌های خارجی باز شوند.',
                options: {
                    documents: 'اسناد (.md, .canvas, .base)',
                    supported: 'پشتیبانی‌شده (در Obsidian باز می‌شود)',
                    all: 'همه (ممکن است خارجی باز شود)'
                }
            },
            homepage: {
                name: 'صفحه اصلی',
                desc: 'انتخاب کنید Notebook Navigator هنگام راه‌اندازی چه چیزی را به طور خودکار باز کند.',
                current: 'فعلی: {path}',
                chooseButton: 'انتخاب فایل',
                options: {
                    none: 'هیچ',
                    file: 'فایل',
                    dailyNote: 'یادداشت روزانه',
                    weeklyNote: 'یادداشت هفتگی',
                    monthlyNote: 'یادداشت ماهانه',
                    quarterlyNote: 'یادداشت فصلی',
                    yearlyNote: 'یادداشت سالانه'
                },
                file: {
                    name: 'صفحه اصلی: فایل راه‌اندازی',
                    empty: 'فایلی انتخاب نشده'
                },
                createMissing: {
                    name: 'صفحه اصلی: ایجاد یادداشت در صورت عدم وجود',
                    desc: 'در صورت عدم وجود، یادداشت دوره‌ای را هنگام راه‌اندازی یا با فرمان ایجاد می‌کند.'
                }
            },
            hideNotesWithPropertyRules: {
                name: 'مخفی کردن یادداشت‌ها با قوانین ویژگی (پروفایل خزانه)',
                desc: 'لیست قوانین فرانت‌متر جدا شده با کاما. از ورودی‌های `key` یا `key=value` استفاده کنید (مثل status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            hideFiles: {
                name: 'مخفی کردن فایل‌ها (پروفایل خزانه)',
                desc: 'لیست الگوهای نام فایل جدا شده با کاما برای مخفی کردن. از علامت‌های عام * و مسیرهای / پشتیبانی می‌کند (مثل temp-*, *.png, /assets/*).',
                placeholder: 'موقت-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'پروفایل خزانه',
                desc: 'پروفایل‌ها نمایش انواع فایل، فایل‌های مخفی، پوشه‌های مخفی، برچسب‌های مخفی، قوانین ویژگی برای یادداشت‌های مخفی، میانبرها و بنر ناوبری را ذخیره می‌کنند. پروفایل‌ها را از هدر پنل ناوبری تعویض کنید.',
                defaultName: 'پیش‌فرض',
                addButton: 'افزودن پروفایل',
                editProfilesButton: 'ویرایش پروفایل‌ها',
                addProfileOption: 'افزودن پروفایل...',
                applyButton: 'اعمال',
                deleteButton: 'حذف پروفایل',
                addModalTitle: 'افزودن پروفایل',
                editProfilesModalTitle: 'ویرایش پروفایل‌ها',
                addModalPlaceholder: 'نام پروفایل',
                deleteModalTitle: 'حذف {name}',
                deleteModalMessage:
                    '{name} حذف شود؟ فیلترهای فایل، پوشه، برچسب و یادداشت مبتنی بر ویژگی ذخیره‌شده در این پروفایل حذف می‌شوند.',
                moveUp: 'انتقال به بالا',
                moveDown: 'انتقال به پایین',
                errors: {
                    emptyName: 'نام پروفایل را وارد کنید',
                    duplicateName: 'نام پروفایل وجود دارد'
                }
            },
            vaultTitlePlacement: {
                name: 'محل عنوان خزانه',
                desc: 'انتخاب کنید عنوان خزانه کجا نمایش داده شود.',
                options: {
                    header: 'نمایش در سربرگ',
                    navigation: 'نمایش در پنل ناوبری'
                }
            },
            hideFolders: {
                name: 'مخفی کردن پوشه‌ها (پروفایل خزانه)',
                desc: 'لیست پوشه‌های جدا شده با کاما برای مخفی کردن. الگوهای نام: assets* (پوشه‌های شروع‌شده با assets)، *_temp (پایان‌یافته با _temp). الگوهای مسیر: /archive (فقط archive اصلی)، /res* (پوشه‌های اصلی شروع‌شده با res)، /*/temp (پوشه‌های temp یک سطح عمیق)، /projects/* (همه پوشه‌های داخل projects).',
                placeholder: 'الگوها, assets*, /archive, /res*'
            },
            descendantExcludedFolders: {
                name: 'مستثنی کردن پوشه‌ها از یادداشت‌های زیرپوشه‌ها (پروفایل خزانه)',
                desc: 'فهرست پوشه‌های جداشده با کاما که هنگام جمع‌آوری یادداشت‌ها از زیرپوشه‌ها نادیده گرفته می‌شوند. پوشه‌ها همچنان قابل مشاهده می‌مانند و با انتخاب آن‌ها یادداشت‌هایشان نمایش داده می‌شود. از همان الگوهای مخفی کردن پوشه‌ها استفاده می‌کند.',
                placeholder: 'روزانه, منابع, /archive'
            },
            showFileDate: {
                name: 'نمایش تاریخ',
                desc: 'تاریخ را زیر نام یادداشت نمایش دهید.'
            },
            dateWhenSortingByName: {
                name: 'هنگام مرتب‌سازی بر اساس نام',
                desc: 'تاریخی که هنگام مرتب‌سازی الفبایی یادداشت‌ها نمایش داده می‌شود.',
                options: {
                    created: 'تاریخ ایجاد',
                    modified: 'تاریخ تغییر'
                }
            },
            showFileTags: {
                name: 'نمایش برچسب‌های فایل',
                desc: 'برچسب‌های قابل کلیک را در آیتم‌های فایل نمایش دهید.'
            },
            showFullTagPaths: {
                name: 'نمایش مسیرهای کامل برچسب',
                desc: 'مسیرهای کامل سلسله‌مراتب برچسب را نمایش دهید. وقتی فعال: «ai/openai»، «کار/پروژه‌ها/۲۰۲۴». وقتی غیرفعال: «openai»، «۲۰۲۴».'
            },
            colorFileTags: {
                name: 'رنگ‌آمیزی برچسب‌های فایل',
                desc: 'رنگ‌های برچسب را به نشان‌های برچسب روی آیتم‌های فایل اعمال کنید.'
            },
            showColoredTagsFirst: {
                name: 'نمایش اول برچسب‌های رنگی',
                desc: 'برچسب‌های رنگی را قبل از برچسب‌های دیگر روی آیتم‌های فایل مرتب کنید.'
            },
            showFileTagsInCompactMode: {
                name: 'نمایش برچسب‌های فایل در حالت فشرده',
                desc: 'برچسب‌ها را هنگامی که تاریخ، پیش‌نمایش و تصویر مخفی هستند نمایش دهید.'
            },
            showFileProperties: {
                name: 'نمایش ویژگی‌های فایل',
                desc: 'نمایش ویژگی‌ها در آیتم‌های فایل. از پنجره نمایش کلیدهای ویژگی برای انتخاب ویژگی‌های قابل نمایش استفاده کنید.'
            },
            colorFileProperties: {
                name: 'رنگ‌آمیزی ویژگی‌های فایل',
                desc: 'رنگ‌های ویژگی را روی نشان‌های ویژگی در آیتم‌های فایل اعمال کنید.'
            },
            showColoredPropertiesFirst: {
                name: 'نمایش ویژگی‌های رنگی در اولویت',
                desc: 'ویژگی‌های رنگی را قبل از ویژگی‌های دیگر روی آیتم‌های فایل مرتب کنید.'
            },
            showFilePropertiesInCompactMode: {
                name: 'نمایش ویژگی‌ها در حالت فشرده',
                desc: 'نمایش ویژگی‌ها هنگام فعال بودن حالت فشرده.'
            },
            textCountType: {
                name: 'نوع شمارش',
                desc: 'انتخاب کنید کدام شمارش‌های متن در موارد فایل نمایش داده شوند.',
                options: {
                    none: 'هیچ‌کدام',
                    words: 'تعداد کلمات',
                    characters: 'تعداد نویسه‌ها',
                    both: 'تعداد کلمات و نویسه‌ها'
                }
            },
            textCountPlacement: {
                name: 'جایگاه',
                desc: 'انتخاب کنید شمارش‌های متن کجا نمایش داده شوند.',
                options: {
                    title: 'در عنوان',
                    property: 'به‌عنوان ویژگی'
                }
            },
            characterCountSpaces: {
                name: 'تعداد نویسه‌ها',
                desc: 'انتخاب کنید فاصله‌ها در شمارش نویسه‌ها لحاظ شوند یا نه.',
                options: {
                    include: 'با فاصله‌ها',
                    exclude: 'بدون فاصله‌ها'
                }
            },
            wordCountTargetProperty: {
                name: 'ویژگی هدف',
                desc: 'کلید ویژگی فرانت‌متر که تعداد کلمات هدف را نگه می‌دارد. برای پنهان کردن هدف‌ها خالی بگذارید.'
            },
            showTargetPercentage: {
                name: 'نمایش درصد هدف',
                desc: 'وقتی تعداد کلمات هدف موجود است، فقط درصد پیشرفت را نمایش دهید.'
            },
            propertyKeys: {
                name: 'کلیدهای ویژگی (پروفایل خزانه)',
                desc: 'کلیدهای ویژگی فرانت‌متر، با قابلیت تنظیم نمایش هر کلید برای ناوبری و فهرست فایل.',
                addButtonTooltip: 'پیکربندی کلیدهای ویژگی',
                noneConfigured: 'هیچ ویژگی‌ای پیکربندی نشده',
                singleConfigured: '۱ ویژگی پیکربندی شده: {properties}',
                multipleConfigured: '{count} ویژگی پیکربندی شده: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'نمایش ویژگی‌ها در ردیف‌های جداگانه',
                desc: 'هر ویژگی را در ردیف جداگانه نمایش می‌دهد.'
            },
            linkPropertyPillsToNotes: {
                name: 'پیوند نشان‌های ویژگی به یادداشت‌ها',
                desc: 'روی نشان ویژگی کلیک کنید تا یادداشت مرتبط باز شود.'
            },
            linkPropertyPillsToUrls: {
                name: 'پیوند نشان‌های ویژگی به نشانی‌ها',
                desc: 'روی نشان ویژگی کلیک کنید تا نشانی مرتبط باز شود.'
            },
            dateFormat: {
                name: 'قالب تاریخ',
                desc: 'قالب نمایش تاریخ‌ها (از قالب Moment استفاده می‌کند).',
                placeholder: 'YYYY/MM/DD',
                help: 'قالب‌های رایج:\nYYYY/MM/DD = ۲۰۲۲/۰۵/۲۵\nDD/MM/YYYY = ۲۵/۰۵/۲۰۲۲\nYYYY-MM-DD = ۲۰۲۲-۰۵-۲۵\n\nتوکن‌ها:\nYYYY/YY = سال\nMMMM/MMM/MM = ماه\nDD/D = روز\ndddd/ddd = روز هفته',
                helpTooltip: 'قالب با استفاده از Moment',
                momentLinkText: 'قالب Moment'
            },
            timeFormat: {
                name: 'قالب زمان',
                desc: 'قالب نمایش زمان‌ها (از قالب Moment استفاده می‌کند).',
                placeholder: 'HH:mm',
                help: 'قالب‌های رایج:\nHH:mm = ۱۴:۳۰ (۲۴ ساعته)\nh:mm a = 2:30 PM (۱۲ ساعته)\nHH:mm:ss = ۱۴:۳۰:۴۵\nh:mm:ss a = 2:30:45 PM\n\nتوکن‌ها:\nHH/H = ۲۴ ساعته\nhh/h = ۱۲ ساعته\nmm = دقیقه\nss = ثانیه\na = صبح/عصر',
                helpTooltip: 'قالب با استفاده از Moment',
                momentLinkText: 'قالب Moment'
            },
            showNotePreview: {
                name: 'نمایش پیش‌نمایش یادداشت',
                desc: 'متن پیش‌نمایش را زیر نام یادداشت نمایش دهید.'
            },
            skipHeadingsInPreview: {
                name: 'رد شدن از سرتیترها در پیش‌نمایش',
                desc: 'هنگام تولید متن پیش‌نمایش از خطوط سرتیتر رد شوید.'
            },
            skipCodeBlocksInPreview: {
                name: 'رد شدن از بلوک‌های کد در پیش‌نمایش',
                desc: 'هنگام تولید متن پیش‌نمایش از بلوک‌های کد رد شوید.'
            },
            skipCalloutsInPreview: {
                name: 'رد شدن از بلوک‌های callout در پیش‌نمایش',
                desc: 'هنگام تولید متن پیش‌نمایش از بلوک‌های callout رد شوید.'
            },
            stripHtmlInPreview: {
                name: 'حذف HTML از پیش‌نمایش‌ها',
                desc: 'حذف تگ‌های HTML از متن پیش‌نمایش. ممکن است بر عملکرد در یادداشت‌های بزرگ تأثیر بگذارد.'
            },
            stripLatexInPreview: {
                name: 'حذف LaTeX از پیش‌نمایش‌ها',
                desc: 'حذف عبارت‌های LaTeX درون‌خطی و بلوکی از متن پیش‌نمایش.'
            },
            previewProperties: {
                name: 'ویژگی‌های پیش‌نمایش',
                desc: 'لیست ویژگی‌های فرانت‌متر جدا شده با کاما برای بررسی متن پیش‌نمایش. اولین ویژگی با متن استفاده می‌شود.',
                placeholder: 'summary, description, abstract'
            },
            fallbackToNoteContent: {
                name: 'بازگشت به محتوای یادداشت',
                desc: 'نمایش محتوای یادداشت به عنوان پیش‌نمایش وقتی هیچ‌کدام از ویژگی‌های مشخص‌شده حاوی متن نیستند.'
            },
            previewRows: {
                name: 'ردیف‌های پیش‌نمایش',
                desc: 'تعداد ردیف‌ها برای نمایش متن پیش‌نمایش.',
                options: {
                    '1': '۱ ردیف',
                    '2': '۲ ردیف',
                    '3': '۳ ردیف',
                    '4': '۴ ردیف',
                    '5': '۵ ردیف'
                }
            },
            titleRows: {
                name: 'ردیف‌های عنوان',
                desc: 'تعداد ردیف‌ها برای نمایش عناوین یادداشت.',
                options: {
                    '1': '۱ ردیف',
                    '2': '۲ ردیف',
                    '3': '۳ ردیف'
                }
            },
            useFolderColor: {
                name: 'استفاده از رنگ پوشه',
                desc: 'رنگ‌آمیزی عناوین یادداشت و آیکون‌های فایل با رنگ پوشه والد هنگامی که رنگ فایل سفارشی تنظیم نشده است. اولویت: رنگ فایل سفارشی > رنگ پوشه > رنگ پیش‌فرض.'
            },
            showFeatureImage: {
                name: 'نمایش تصویر ویژه',
                desc: 'نمایش تصویر بندانگشتی از اولین تصویر موجود در یادداشت.'
            },
            forceSquareFeatureImage: {
                name: 'اجبار تصویر ویژه مربع',
                desc: 'تصاویر ویژه را به صورت بندانگشتی مربع نمایش دهید.'
            },
            featureImageProperties: {
                name: 'ویژگی‌های تصویر',
                desc: 'لیست ویژگی‌های فرانت‌متر جدا شده با کاما برای بررسی در ابتدا. در صورت عدم یافتن، از اولین تصویر در محتوای markdown استفاده می‌شود.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'استثنای یادداشت‌ها با ویژگی‌ها',
                desc: 'لیست ویژگی‌های فرانت‌متر جدا شده با کاما. یادداشت‌هایی که هر یک از این ویژگی‌ها را دارند، تصاویر ویژه را ذخیره نمی‌کنند.',
                placeholder: 'private, confidential'
            },
            featureImageDisplaySize: {
                name: 'اندازه نمایش تصویر شاخص',
                desc: 'حداکثر اندازه رندر شده برای تصاویر شاخص در لیست یادداشت‌ها.',
                options: {
                    '64': '64 px',
                    '96': '96 px',
                    '128': '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'اندازه پیکسل تصویر شاخص',
                desc: 'وضوح تصویر هنگام تولید تصاویر بندانگشتی ذخیره‌شده تصویر شاخص. اگر پیش‌نمایش‌های بزرگ‌تر تار به نظر می‌رسند، این مقدار را افزایش دهید.',
                options: {
                    '256x144': '256 x 144 px',
                    '384x216': '384 x 216 px',
                    '512x288': '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'دانلود تصاویر خارجی',
                desc: 'دانلود تصاویر از راه دور و تصاویر کوچک YouTube برای تصاویر ویژه.'
            },
            hideExportedPreviewImages: {
                name: 'پنهان کردن تصاویر پیش‌نمایش صادر شده',
                desc: 'پنهان کردن فایل‌های PNG پیش‌نمایش طراحی صادر شده. برای نمایش آن‌ها، «نمایش آیتم‌های مخفی» را روشن کنید.'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator فایل‌های PNG صادر شده توسط Excalidraw را به‌عنوان پیش‌نمایش طراحی نمایش می‌دهد.',
                items: [
                    'در **تنظیمات Excalidraw**، **Embedding Excalidraw into your Notes and Exporting** را باز کنید، سپس **Export Settings**، سپس **Auto-export Settings**.',
                    '**Auto-export PNG** را فعال کنید. به‌صورت اختیاری **Export both dark- and light-themed image** را فعال کنید.',
                    'Notebook Navigator به دنبال **Drawing.excalidraw.png**، **Drawing.excalidraw.dark.png** یا **Drawing.excalidraw.light.png** می‌گردد.',
                    'هنگامی که **پنهان کردن تصاویر پیش‌نمایش صادر شده** روشن است، فایل‌های PNG فقط زمانی نمایش داده می‌شوند که **نمایش آیتم‌های مخفی** نیز روشن باشد.'
                ]
            },
            showRootFolder: {
                name: 'نمایش پوشه اصلی',
                desc: 'نام خزانه را به عنوان پوشه اصلی در درخت نمایش دهید.'
            },
            showFolderIcons: {
                name: 'نمایش آیکون‌های پوشه',
                desc: 'آیکون‌ها را کنار پوشه‌ها در پنل ناوبری نمایش دهید.'
            },
            inheritFolderColors: {
                name: 'ارث‌بری رنگ‌های پوشه',
                desc: 'پوشه‌های فرزند رنگ را از پوشه‌های والد به ارث می‌برند.'
            },
            folderSortOrder: {
                name: 'ترتیب مرتب‌سازی پوشه',
                desc: 'روی هر پوشه‌ای کلیک راست کنید تا ترتیب مرتب‌سازی متفاوتی برای زیرمجموعه‌هایش تنظیم کنید.',
                options: {
                    alphaAsc: 'الف تا ی',
                    alphaDesc: 'ی تا الف'
                }
            },
            showFileCount: {
                name: 'نمایش تعداد فایل',
                desc: 'تعداد فایل‌ها را کنار پوشه‌ها، برچسب‌ها و ویژگی‌ها نمایش دهید.'
            },
            showShortcutAndRecentItemIcons: {
                name: 'نمایش آیکون برای میانبرها و آیتم‌های اخیر',
                desc: 'آیکون‌ها را در کنار آیتم‌ها در بخش‌های میانبرها و اخیر نمایش دهید.'
            },
            interfaceIcons: {
                name: 'آیکون‌های رابط کاربری',
                desc: 'ویرایش آیکون‌های نوار ابزار، پوشه، برچسب، ویژگی، سنجاق شده، جستجو و مرتب‌سازی.',
                buttonText: 'ویرایش آیکون‌ها'
            },
            applyColorToIconsOnly: {
                name: 'اعمال رنگ فقط به آیکون‌ها',
                desc: 'وقتی فعال، رنگ‌های سفارشی فقط به آیکون‌ها اعمال می‌شوند. وقتی غیرفعال، رنگ‌ها به آیکون‌ها و برچسب‌های متن اعمال می‌شوند.'
            },
            navRainbowMode: {
                name: 'حالت رنگ‌های رنگین‌کمان (پروفایل خزانه)',
                desc: 'اعمال رنگ‌های رنگین‌کمان در پنل ناوبری.',
                options: {
                    off: 'خاموش',
                    textColor: 'رنگ متن',
                    backgroundColor: 'رنگ پس‌زمینه'
                }
            },
            navRainbowFirstColor: {
                name: 'رنگ اول',
                desc: 'رنگ اول در گرادیان رنگین‌کمان.'
            },
            navRainbowLastColor: {
                name: 'رنگ آخر',
                desc: 'رنگ آخر در گرادیان رنگین‌کمان.'
            },
            navRainbowTransitionStyle: {
                name: 'سبک انتقال',
                desc: 'درون‌یابی استفاده‌شده بین رنگ اول و آخر.',
                options: {
                    hue: 'فام',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'اعمال بر میانبرها',
                desc: 'اعمال رنگ‌های رنگین‌کمان بر میانبرها.'
            },
            navRainbowApplyToRecentItems: {
                name: 'اعمال بر موارد اخیر',
                desc: 'اعمال رنگ‌های رنگین‌کمان بر موارد اخیر.'
            },
            navRainbowApplyToFolders: {
                name: 'اعمال بر پوشه‌ها',
                desc: 'اعمال رنگ‌های رنگین‌کمان بر پوشه‌ها.'
            },
            navRainbowFolderScope: {
                name: 'محدوده پوشه‌ها',
                desc: 'انتخاب سطوح پوشه‌ای که تخصیص رنگ از آن‌ها شروع می‌شود.',
                options: {
                    root: 'سطح ریشه',
                    child: 'سطح فرزند',
                    all: 'هر سطح'
                }
            },
            navRainbowApplyToTags: {
                name: 'اعمال بر برچسب‌ها',
                desc: 'اعمال رنگ‌های رنگین‌کمان بر برچسب‌ها.'
            },
            navRainbowTagScope: {
                name: 'محدوده برچسب‌ها',
                desc: 'انتخاب سطوح برچسبی که تخصیص رنگ از آن‌ها شروع می‌شود.',
                options: {
                    root: 'سطح ریشه',
                    child: 'سطح فرزند',
                    all: 'هر سطح'
                }
            },
            navRainbowApplyToProperties: {
                name: 'اعمال بر ویژگی‌ها',
                desc: 'اعمال رنگ‌های رنگین‌کمان بر ویژگی‌ها.'
            },
            navRainbowConsistentBrightness: {
                name: 'روشنایی یکنواخت در بین رنگ‌ها', // (English: Consistent brightness across hues)
                desc: 'روشنایی را بین رنگ‌های شروع و پایان در طول انتقال‌های رنگی درون‌یابی می‌کند.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'جداسازی رنگ‌های حالت روشن و تاریک', // (English: Separate light and dark mode colors)
                desc: 'استفاده از رنگ‌های رنگین‌کمان متفاوت برای حالت روشن و حالت تاریک.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'کپی رنگ حالت روشن به حالت تاریک', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'محدوده ویژگی‌ها',
                desc: 'انتخاب سطوح ویژگی که تخصیص رنگ از آن‌ها شروع می‌شود.',
                options: {
                    root: 'سطح ریشه',
                    child: 'سطح فرزند',
                    all: 'هر سطح'
                }
            },
            collapseItems: {
                name: 'جمع کردن آیتم‌ها',
                desc: 'انتخاب کنید دکمه باز/بسته کردن همه چه چیزی را تحت تأثیر قرار دهد.',
                options: {
                    all: 'همه',
                    foldersOnly: 'فقط پوشه‌ها',
                    tagsOnly: 'فقط برچسب‌ها',
                    propertiesOnly: 'فقط ویژگی‌ها'
                }
            },
            keepSelectedItemExpanded: {
                name: 'باز نگه داشتن آیتم انتخابی',
                desc: 'هنگام جمع کردن، آیتم انتخابی و والدین آن را باز نگه دارید.'
            },
            excludeVaultRootFromCollapse: {
                name: 'نادیده گرفتن ریشه خزانه هنگام جمع کردن',
                desc: 'هنگام جمع کردن همه آیتم‌ها، پوشه ریشه خزانه را در وضعیت فعلی نگه دارید.'
            },
            treeIndentation: {
                name: 'تورفتگی درخت',
                desc: 'عرض تورفتگی را برای پوشه‌ها، برچسب‌ها و ویژگی‌های تودرتو تنظیم کنید (پیکسل).'
            },
            navItemHeight: {
                name: 'ارتفاع آیتم',
                desc: 'ارتفاع پوشه‌ها، برچسب‌ها و ویژگی‌ها را در پنل ناوبری تنظیم کنید (پیکسل).'
            },
            navItemHeightScaleText: {
                name: 'مقیاس‌بندی متن با ارتفاع آیتم',
                desc: 'اندازه متن ناوبری را هنگام کاهش ارتفاع آیتم کاهش دهید.'
            },
            showIndentGuides: {
                name: 'نمایش خطوط راهنمای تورفتگی',
                desc: 'نمایش خطوط راهنمای تورفتگی برای پوشه‌ها، برچسب‌ها و ویژگی‌های تودرتو.'
            },
            navCountLeaderStyle: {
                name: 'نمایش نشانه‌های اتصال',
                desc: 'نمایش نقطه، خط تیره یا یک خط بین نام موارد و تعداد فایل‌ها.',
                options: {
                    none: 'هیچ',
                    dots: 'نقطه (...)',
                    dashes: 'خط تیره (---)',
                    line: 'خط'
                }
            },
            rootItemSpacing: {
                name: 'فاصله آیتم اصلی',
                desc: 'فاصله بین پوشه‌ها، برچسب‌ها و ویژگی‌های سطح اصلی (پیکسل).'
            },
            showTags: {
                name: 'نمایش برچسب‌ها',
                desc: 'بخش برچسب‌ها را در ناوبر نمایش دهید.'
            },
            showTagIcons: {
                name: 'نمایش آیکون‌های برچسب',
                desc: 'آیکون‌ها را کنار برچسب‌ها در پنل ناوبری نمایش دهید.'
            },
            inheritTagColors: {
                name: 'ارث‌بری رنگ برچسب‌ها',
                desc: 'برچسب‌های فرزند رنگ را از برچسب‌های والد به ارث می‌برند.'
            },
            tagSortOrder: {
                name: 'ترتیب مرتب‌سازی برچسب',
                desc: 'روی هر برچسبی کلیک راست کنید تا ترتیب مرتب‌سازی متفاوتی برای زیرمجموعه‌هایش تنظیم کنید.',
                options: {
                    alphaAsc: 'الف تا ی',
                    alphaDesc: 'ی تا الف',
                    frequency: 'فراوانی',
                    lowToHigh: 'کم به زیاد',
                    highToLow: 'زیاد به کم'
                }
            },
            showTagsFolder: {
                name: 'نمایش پوشه برچسب‌ها',
                desc: '«برچسب‌ها» را به عنوان پوشه قابل جمع‌شدن نمایش دهید.'
            },
            showUntaggedNotes: {
                name: 'نمایش یادداشت‌های بدون برچسب',
                desc: 'آیتم «بدون برچسب» را برای یادداشت‌های بدون برچسب نمایش دهید.'
            },
            filterTagsBySelection: {
                name: 'فیلتر برچسب‌ها بر اساس انتخاب',
                desc: 'فقط برچسب‌هایی را نشان دهید که در یادداشت‌های پوشه یا ویژگی انتخاب‌شده وجود دارند.'
            },
            keepEmptyTagsProperty: {
                name: 'حفظ ویژگی برچسب‌ها بعد از حذف آخرین برچسب',
                desc: 'ویژگی برچسب‌های فرانت‌متر را هنگام حذف همه برچسب‌ها حفظ کنید. وقتی غیرفعال، ویژگی برچسب‌ها از فرانت‌متر حذف می‌شود.'
            },
            showProperties: {
                name: 'نمایش ویژگی‌ها',
                desc: 'نمایش بخش ویژگی‌ها در ناوبر.',
                propertyKeysInfoPrefix: 'پیکربندی ویژگی‌ها در ',
                propertyKeysInfoLinkText: 'عمومی > کلیدهای ویژگی',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'نمایش آیکون‌های ویژگی',
                desc: 'نمایش آیکون‌ها در کنار ویژگی‌ها در پنل ناوبری.'
            },
            inheritPropertyColors: {
                name: 'ارث‌بری رنگ‌های ویژگی',
                desc: 'مقادیر ویژگی رنگ و پس‌زمینه را از کلید ویژگی به ارث می‌برند.'
            },
            propertySortOrder: {
                name: 'ترتیب مرتب‌سازی ویژگی‌ها',
                desc: 'برای تنظیم ترتیب مرتب‌سازی متفاوت برای مقادیر هر ویژگی، روی آن راست‌کلیک کنید.',
                options: {
                    alphaAsc: 'الف تا ی',
                    alphaDesc: 'ی تا الف',
                    frequency: 'فراوانی',
                    lowToHigh: 'کم به زیاد',
                    highToLow: 'زیاد به کم'
                }
            },
            showPropertiesFolder: {
                name: 'نمایش پوشه ویژگی‌ها',
                desc: 'نمایش «ویژگی‌ها» به عنوان پوشه جمع‌شدنی.'
            },
            filterPropertiesBySelection: {
                name: 'فیلتر ویژگی‌ها بر اساس انتخاب',
                desc: 'فقط ویژگی‌هایی را نشان دهید که در یادداشت‌های پوشه یا برچسب انتخاب‌شده وجود دارند.'
            },
            hideTags: {
                name: 'مخفی کردن برچسب‌ها (پروفایل خزانه)',
                desc: 'لیست الگوهای برچسب جدا شده با کاما. الگوهای نام: برچسب* (شروع با)، *برچسب (پایان با). الگوهای مسیر: آرشیو (برچسب و فرزندان)، آرشیو/* (فقط فرزندان)، پروژه/*/پیشنویس (wildcard میانی).',
                placeholder: 'آرشیو*, *پیشنویس, پروژه/*/قدیمی'
            },
            hideNotesWithTags: {
                name: 'مخفی کردن یادداشت‌ها با برچسب‌ها (پروفایل خزانه)',
                desc: 'لیست الگوهای برچسب جدا شده با کاما. یادداشت‌های دارای برچسب‌های منطبق مخفی می‌شوند. الگوهای نام: برچسب* (شروع با)، *برچسب (پایان با). الگوهای مسیر: آرشیو (برچسب و فرزندان)، آرشیو/* (فقط فرزندان)، پروژه/*/پیشنویس (wildcard میانی).',
                placeholder: 'آرشیو*, *پیشنویس, پروژه/*/قدیمی'
            },
            enableFolderNotes: {
                name: 'فعال کردن یادداشت‌های پوشه',
                desc: 'پوشه‌هایی که فایل یادداشت منطبق دارند به صورت پیوندهای قابل کلیک نمایش داده می‌شوند.'
            },
            folderNoteType: {
                name: 'نوع پیش‌فرض یادداشت پوشه',
                desc: 'نوع یادداشت پوشه ایجاد شده از منوی راست‌کلیک.',
                options: {
                    ask: 'سؤال هنگام ایجاد',
                    markdown: 'مارک‌داون',
                    canvas: 'بوم',
                    base: 'پایگاه'
                }
            },
            folderNoteName: {
                name: 'نام یادداشت پوشه',
                desc: 'نام یادداشت پوشه بدون پسوند. از {{folder}} برای درج نام پوشه استفاده کنید، یا یک نام ثابت مانند index وارد کنید.'
            },
            folderNoteTemplate: {
                name: 'الگوی یادداشت پوشه',
                desc: 'فایل الگویی که هنگام ایجاد یادداشت‌های پوشه استفاده می‌شود. الگوهای Markdown می‌توانند از Templater استفاده کنند. الگوهای Canvas و Base به‌عنوان محتوای فایل کپی می‌شوند. محل پوشه الگوها را در عملیات فایل > الگوها تنظیم کنید.',
                formatWarning: 'قالب الگو باید با نوع یادداشت پوشه انتخاب‌شده مطابقت داشته باشد: .md، .canvas یا .base.'
            },
            folderNamesOpenFolderNotes: {
                name: 'نام پوشه‌ها یادداشت‌های پوشه را باز می‌کند',
                desc: 'کلیک روی نام پوشه، یادداشت پوشه آن را باز می‌کند. در صورت غیرفعال بودن، یادداشت‌های پوشه فقط فراداده پوشه مانند نام، آیکون و رنگ را ارائه می‌دهند.'
            },
            hideFolderNoteInList: {
                name: 'مخفی کردن یادداشت پوشه در لیست',
                desc: 'مخفی کردن یادداشت‌های پوشه از نمایش در لیست فایل‌ها.'
            },
            pinCreatedFolderNote: {
                name: 'سنجاق کردن یادداشت‌های پوشه ایجاد شده',
                desc: 'سنجاق کردن یادداشت‌های پوشه هنگام ایجاد از منوی زمینه.'
            },
            folderNoteOpenLocation: {
                name: 'باز کردن یادداشت‌های پوشه در',
                desc: 'انتخاب کنید یادداشت‌های پوشه هنگام کلیک روی پیوندهای یادداشت پوشه کجا باز شوند.',
                options: {
                    currentTab: 'تب فعلی',
                    newTab: 'تب جدید',
                    rightSidebar: 'نوار کناری راست'
                }
            },
            showClosestFolderNoteInRightSidebar: {
                name: 'نوار کناری راست: نمایش نزدیک‌ترین یادداشت پوشه',
                desc: 'وقتی پوشه‌ای انتخاب می‌شود، نوار کناری راست به‌طور خودکار نزدیک‌ترین یادداشت پوشه والد را نشان می‌دهد.'
            },
            confirmBeforeDelete: {
                name: 'تأیید قبل از حذف',
                desc: 'هنگام حذف یادداشت‌ها یا پوشه‌ها گفتگوی تأیید نمایش دهید'
            },
            deleteAttachments: {
                name: 'حذف پیوست‌ها هنگام حذف فایل‌ها',
                desc: 'حذف خودکار پیوست‌های مرتبط و پیش‌نمایش‌های طراحی تولیدشده در صورتی که در جای دیگری استفاده نمی‌شوند',
                options: {
                    ask: 'هر بار بپرس',
                    always: 'همیشه',
                    never: 'هرگز'
                }
            },
            moveFileConflicts: {
                name: 'تعارضات انتقال',
                desc: 'هنگام انتقال فایل به پوشه‌ای که فایلی با همان نام وجود دارد. هر بار بپرسید (تغییر نام، بازنویسی، لغو) یا همیشه تغییر نام دهید.',
                options: {
                    ask: 'هر بار بپرس',
                    rename: 'همیشه تغییر نام'
                }
            },
            metadataCleanup: {
                name: 'پاکسازی متادیتا',
                desc: 'متادیتای یتیم را که هنگام حذف، انتقال یا تغییر نام فایل‌ها، پوشه‌ها، برچسب‌ها یا ویژگی‌ها خارج از Obsidian باقی مانده حذف می‌کند. این فقط فایل تنظیمات Notebook Navigator را تحت تأثیر قرار می‌دهد.',
                buttonText: 'پاکسازی متادیتا',
                error: 'پاکسازی تنظیمات ناموفق بود',
                loading: 'بررسی متادیتا...',
                statusClean: 'متادیتایی برای پاکسازی نیست',
                statusCounts:
                    'آیتم‌های یتیم: {folders} پوشه، {tags} برچسب، {properties} ویژگی، {files} فایل، {pinned} سنجاق، {separators} جداکننده'
            },
            rebuildCache: {
                name: 'بازسازی کش',
                desc: 'اگر برچسب‌های گمشده، پیش‌نمایش‌های نادرست یا تصاویر ویژه گمشده دارید از این استفاده کنید. این می‌تواند بعد از تداخل‌های همگام‌سازی یا بسته‌شدن‌های غیرمنتظره اتفاق بیفتد.',
                buttonText: 'بازسازی کش',
                error: 'بازسازی کش ناموفق بود',
                indexingTitle: 'در حال نمایه\u200cسازی خزانه...',
                progress: 'Notebook Navigator در حال به\u200cروزرسانی کش است.'
            },
            iconPackManagement: {
                downloadButton: 'دانلود',
                downloadingLabel: 'در حال دانلود...',
                removeButton: 'حذف',
                statusInstalled: 'دانلود شده (نسخه {version})',
                statusNotInstalled: 'دانلود نشده',
                versionUnknown: 'ناشناخته',
                downloadFailed: 'دانلود {name} ناموفق بود. اتصال خود را بررسی کنید و دوباره تلاش کنید.',
                removeFailed: 'حذف {name} ناموفق بود.',
                infoNote:
                    'بسته‌های آیکون دانلود شده وضعیت نصب را بین دستگاه‌ها همگام می‌کنند. بسته‌های آیکون در پایگاه داده محلی هر دستگاه می‌مانند؛ همگام‌سازی فقط پیگیری می‌کند آیا دانلود یا حذف شوند. بسته‌های آیکون از مخزن Notebook Navigator دانلود می‌شوند (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterMetadata: {
                name: 'استفاده از متادیتای فرانت‌متر',
                desc: 'از فرانت‌متر برای نام یادداشت، زمان‌ها، آیکون‌ها و رنگ‌ها استفاده کنید'
            },
            frontmatterIconField: {
                name: 'فیلد آیکون',
                desc: 'فیلد فرانت‌متر برای آیکون‌های فایل. برای استفاده از آیکون‌های ذخیره‌شده در تنظیمات خالی بگذارید.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'فیلد رنگ',
                desc: 'فیلد فرانت‌متر برای رنگ‌های فایل. برای استفاده از رنگ‌های ذخیره‌شده در تنظیمات خالی بگذارید.',
                placeholder: 'color'
            },
            frontmatterBackgroundField: {
                name: 'فیلد پس‌زمینه',
                desc: 'فیلد فرانت‌متر برای رنگ‌های پس‌زمینه. برای استفاده از رنگ‌های پس‌زمینه ذخیره‌شده در تنظیمات خالی بگذارید.',
                placeholder: 'background'
            },
            migrateIconsAndColorsFromSettings: {
                name: 'مهاجرت آیکون‌ها و رنگ‌ها از تنظیمات',
                desc: 'ذخیره‌شده در تنظیمات: {icons} آیکون، {colors} رنگ.',
                button: 'مهاجرت',
                buttonWorking: 'در حال مهاجرت...',
                noticeNone: 'آیکون یا رنگ فایلی در تنظیمات ذخیره نشده است.',
                noticeDone: '{migratedIcons}/{icons} آیکون، {migratedColors}/{colors} رنگ مهاجرت شد.',
                noticeFailures: 'ورودی‌های ناموفق: {failures}.',
                noticeError: 'مهاجرت ناموفق بود. کنسول را برای جزئیات بررسی کنید.'
            },
            frontmatterNameFields: {
                name: 'فیلدهای نام',
                desc: 'لیست فیلدهای فرانت‌متر جداشده با کاما. اولین مقدار غیرخالی استفاده می‌شود. به نام فایل برمی‌گردد.',
                placeholder: 'title, name'
            },
            frontmatterCreatedField: {
                name: 'فیلد زمان ایجاد',
                desc: 'نام فیلد فرانت‌متر برای زمان ایجاد. برای استفاده فقط از تاریخ سیستم فایل خالی بگذارید.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'فیلد زمان تغییر',
                desc: 'نام فیلد فرانت‌متر برای زمان تغییر. برای استفاده فقط از تاریخ سیستم فایل خالی بگذارید.',
                placeholder: 'modified'
            },
            frontmatterTimestampFormat: {
                name: 'قالب نشانه زمانی',
                desc: 'قالب استفاده‌شده برای تجزیه زمان‌ها در فرانت‌متر. برای استفاده از تجزیه ISO 8601 خالی بگذارید.',
                helpTooltip: 'قالب با استفاده از Moment',
                momentLinkText: 'قالب Moment',
                help: 'قالب‌های رایج:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'حمایت از توسعه',
                desc: 'اگر از استفاده از Notebook Navigator لذت می‌برید، لطفاً حمایت از توسعه مداوم آن را در نظر بگیرید.',
                buttonText: '❤️ حمایت مالی',
                coffeeButton: '☕️ یک قهوه مهمانم کن'
            },
            otherPlugins: {
                name: 'افزونه‌های دیگرم را ببینید',
                betterPaste: 'پاکسازی متن، پیوندها و تصاویر چسبانده‌شده',
                pixelPerfectImage: 'تغییر اندازه دقیق تصویر و بیشتر'
            },
            checkForNewVersionOnStart: {
                name: 'بررسی نسخه جدید هنگام شروع',
                desc: 'هنگام شروع نسخه‌های جدید افزونه را بررسی می‌کند و هنگام در دسترس بودن به‌روزرسانی اعلان نمایش می‌دهد. بررسی‌ها حداکثر روزی یک بار انجام می‌شوند.',
                status: 'نسخه جدید موجود: {version}'
            },
            startupDebugLogging: {
                name: 'ثبت اشکال‌زدایی راه‌اندازی',
                desc: 'تشخیص‌های راه‌اندازی را در یک فایل Markdown زمان‌دار در ریشه خزانه می‌نویسد و پس از پایدار شدن راه‌اندازی متوقف می‌شود. فایل ممکن است همگام‌سازی شود و می‌تواند مسیرهای فایل را شامل شود.'
            },
            whatsNew: {
                name: 'چه چیزی در Notebook Navigator {version} جدید است',
                desc: 'به‌روزرسانی‌ها و بهبودهای اخیر را ببینید',
                buttonText: 'مشاهده به‌روزرسانی‌های اخیر'
            },
            masteringVideo: {
                name: 'تسلط بر Notebook Navigator (ویدیو)',
                desc: 'این ویدیو تمام آنچه برای کار بهره‌ور با Notebook Navigator نیاز دارید را پوشش می‌دهد، از جمله میانبرهای صفحه‌کلید، جستجو، برچسب‌ها و سفارشی‌سازی پیشرفته.'
            },
            cacheStatistics: {
                localCache: 'کش محلی',
                items: 'آیتم',
                withTags: 'با برچسب',
                withPreviewText: 'با متن پیش‌نمایش',
                withFeatureImage: 'با تصویر ویژه',
                withMetadata: 'با متادیتا'
            },
            metadataInfo: {
                successfullyParsed: 'با موفقیت تجزیه شد',
                itemsWithName: 'آیتم با نام',
                withCreatedDate: 'با تاریخ ایجاد',
                withModifiedDate: 'با تاریخ تغییر',
                withIcon: 'با آیکون',
                withColor: 'با رنگ',
                failedToParse: 'تجزیه ناموفق بود',
                createdDates: 'تاریخ‌های ایجاد',
                modifiedDates: 'تاریخ‌های تغییر',
                checkTimestampFormat: 'قالب نشانه زمانی خود را بررسی کنید.',
                exportFailed: 'صادر کردن خطاها'
            }
        }
    },
    whatsNew: {
        title: 'چه چیزی در Notebook Navigator جدید است',
        openBannerImage: 'باز کردن تصویر بنر انتشار',
        supportMessage: 'اگر Notebook Navigator را مفید می‌دانید، لطفاً حمایت از توسعه آن را در نظر بگیرید.',
        supportButton: 'یک قهوه مهمانم کن',
        thanksButton: 'ممنون!'
    }
};
