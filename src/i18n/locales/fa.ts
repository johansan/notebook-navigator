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
        submit: 'ارسال',
        noSelection: 'بدون انتخاب',
        untagged: 'بدون برچسب',
        untitled: 'بدون عنوان',
        featureImageAlt: 'تصویر ویژه',
        unknownError: 'خطای ناشناخته',
        updateBannerTitle: 'به‌روزرسانی Notebook Navigator موجود است',
        updateBannerInstruction: 'در تنظیمات -> افزونه‌های انجمن به‌روزرسانی کنید',
        updateIndicatorLabel: 'نسخه جدید موجود است'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'پوشه یا برچسبی را برای مشاهده یادداشت‌ها انتخاب کنید',
        emptyStateNoNotes: 'یادداشتی نیست',
        pinnedSection: 'سنجاق‌شده',
        notesSection: 'یادداشت‌ها',
        filesSection: 'فایل‌ها',
        hiddenItemAriaLabel: '{name} (پنهان)'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'بدون برچسب',
        hiddenTags: 'برچسب‌های پنهان',
        tags: 'برچسب‌ها'
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'میانبرها',
        recentNotesHeader: 'یادداشت‌های اخیر',
        recentFilesHeader: 'فایل‌های اخیر',
        reorderRootFoldersTitle: 'مرتب‌سازی مجدد ناوبری',
        reorderRootFoldersHint: 'از فلش‌ها یا کشیدن برای مرتب‌سازی استفاده کنید',
        vaultRootLabel: 'خزانه',
        resetRootToAlpha: 'بازنشانی به ترتیب الفبایی',
        resetRootToFrequency: 'بازنشانی به ترتیب فراوانی',
        pinShortcuts: 'سنجاق کردن میانبرها',
        pinShortcutsAndRecentNotes: 'سنجاق کردن میانبرها و یادداشت‌های اخیر',
        pinShortcutsAndRecentFiles: 'سنجاق کردن میانبرها و فایل‌های اخیر',
        unpinShortcuts: 'برداشتن سنجاق میانبرها',
        unpinShortcutsAndRecentNotes: 'برداشتن سنجاق میانبرها و یادداشت‌های اخیر',
        unpinShortcutsAndRecentFiles: 'برداشتن سنجاق میانبرها و فایل‌های اخیر',
        profileMenuLabel: 'پروفایل',
        profileMenuAria: 'تغییر پروفایل خزانه'
    },

    shortcuts: {
        folderExists: 'پوشه در میانبرها وجود دارد',
        noteExists: 'یادداشت در میانبرها وجود دارد',
        tagExists: 'برچسب در میانبرها وجود دارد',
        searchExists: 'میانبر جستجو وجود دارد',
        emptySearchQuery: 'قبل از ذخیره، عبارت جستجو را وارد کنید',
        emptySearchName: 'قبل از ذخیره جستجو، نامی وارد کنید',
        add: 'افزودن به میانبرها',
        addNotesCount: 'افزودن {count} یادداشت‌ها به میانبرها',
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
        scrollToTop: 'رفتن به بالا',
        newFolder: 'پوشه جدید',
        newNote: 'یادداشت جدید',
        mobileBackToNavigation: 'بازگشت به ناوبری',
        changeSortOrder: 'تغییر ترتیب',
        defaultSort: 'پیش‌فرض',
        customSort: 'سفارشی',
        showFolders: 'نمایش ناوبری',
        hideFolders: 'مخفی کردن ناوبری',
        reorderRootFolders: 'مرتب‌سازی مجدد ناوبری',
        finishRootFolderReorder: 'تمام',
        toggleDescendantNotes: 'نمایش یادداشت‌ها از زیرپوشه‌ها / زیرمجموعه‌ها',
        autoExpandFoldersTags: 'باز کردن هنگام انتخاب',
        showExcludedItems: 'نمایش پوشه‌ها، برچسب‌ها و یادداشت‌های پنهان',
        hideExcludedItems: 'مخفی کردن پوشه‌ها، برچسب‌ها و یادداشت‌های پنهان',
        showDualPane: 'نمایش پنل‌های دوگانه',
        showSinglePane: 'نمایش پنل تکی',
        changeAppearance: 'تغییر ظاهر',
        search: 'جستجو'
    },
    // Search input
    searchInput: {
        placeholder: 'جستجو...',
        placeholderOmnisearch: 'Omnisearch...',
        clearSearch: 'پاک کردن جستجو',
        saveSearchShortcut: 'ذخیره میانبر جستجو',
        removeSearchShortcut: 'حذف میانبر جستجو',
        shortcutModalTitle: 'ذخیره میانبر جستجو',
        shortcutNamePlaceholder: 'نام میانبر را وارد کنید'
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
            copyDeepLink: 'کپی URL اوبسیدین',
            copyPath: 'کپی مسیر سیستم فایل',
            copyRelativePath: 'کپی مسیر خزانه',
            renameNote: 'تغییر نام یادداشت',
            renameFile: 'تغییر نام فایل',
            deleteNote: 'حذف یادداشت',
            deleteFile: 'حذف فایل',
            deleteMultipleNotes: 'حذف {count} یادداشت',
            deleteMultipleFiles: 'حذف {count} فایل',
            moveNoteToFolder: 'انتقال یادداشت به...',
            moveFileToFolder: 'انتقال فایل به...',
            moveMultipleNotesToFolder: 'انتقال {count} یادداشت به...',
            moveMultipleFilesToFolder: 'انتقال {count} فایل به...',
            addTag: 'افزودن برچسب',
            removeTag: 'حذف برچسب',
            removeAllTags: 'حذف همه برچسب‌ها',
            changeIcon: 'تغییر آیکون',
            changeColor: 'تغییر رنگ'
        },
        folder: {
            newNote: 'یادداشت جدید',
            newNoteFromTemplate: 'یادداشت جدید از قالب',
            newFolder: 'پوشه جدید',
            newCanvas: 'بوم جدید',
            newBase: 'پایگاه جدید',
            newDrawing: 'طراحی جدید',
            newExcalidrawDrawing: 'طراحی Excalidraw جدید',
            newTldrawDrawing: 'طراحی Tldraw جدید',
            duplicateFolder: 'کپی پوشه',
            searchInFolder: 'جستجو در پوشه',
            copyPath: 'کپی مسیر سیستم فایل',
            copyRelativePath: 'کپی مسیر خزانه',
            createFolderNote: 'ایجاد یادداشت پوشه',
            detachFolderNote: 'جدا کردن یادداشت پوشه',
            deleteFolderNote: 'حذف یادداشت پوشه',
            changeIcon: 'تغییر آیکون',
            changeColor: 'تغییر رنگ',
            changeBackground: 'تغییر پس‌زمینه',
            excludeFolder: 'مخفی کردن پوشه',
            unhideFolder: 'آشکار کردن پوشه',
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
        navigation: {
            addSeparator: 'افزودن جداکننده',
            removeSeparator: 'حذف جداکننده'
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
        standardPreset: 'استاندارد',
        compactPreset: 'فشرده',
        defaultSuffix: '(پیش‌فرض)',
        titleRows: 'ردیف‌های عنوان',
        previewRows: 'ردیف‌های پیش‌نمایش',
        groupBy: 'گروه‌بندی بر اساس',
        defaultOption: (rows: number) => `پیش‌فرض (${rows})`,
        defaultTitleOption: (rows: number) => `ردیف‌های عنوان پیش‌فرض (${rows})`,
        defaultPreviewOption: (rows: number) => `ردیف‌های پیش‌نمایش پیش‌فرض (${rows})`,
        defaultGroupOption: (groupLabel: string) => `گروه‌بندی پیش‌فرض (${groupLabel})`,
        titleRowOption: (rows: number) => `${rows} ردیف عنوان`,
        previewRowOption: (rows: number) => `${rows} ردیف پیش‌نمایش`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'جستجوی آیکون...',
            recentlyUsedHeader: 'اخیراً استفاده شده',
            emptyStateSearch: 'برای جستجوی آیکون شروع به تایپ کنید',
            emptyStateNoResults: 'آیکونی یافت نشد',
            showingResultsInfo: 'نمایش ۵۰ از {count} نتیجه. بیشتر تایپ کنید تا محدودتر شود.',
            emojiInstructions: 'ایموجی را تایپ یا پیست کنید تا به عنوان آیکون استفاده شود',
            removeIcon: 'حذف آیکون',
            allTabLabel: 'همه'
        },
        fileIconRuleEditor: {
            addRuleAria: 'افزودن قانون'
        },
        interfaceIcons: {
            title: 'آیکون‌های رابط کاربری',
            items: {
                'nav-shortcuts': 'میانبرها',
                'nav-recent-files': 'فایل‌های اخیر',
                'nav-expand-all': 'باز کردن همه',
                'nav-collapse-all': 'بستن همه',
                'nav-tree-expand': 'فلش درختی: باز کردن',
                'nav-tree-collapse': 'فلش درختی: بستن',
                'nav-hidden-items': 'آیتم‌های مخفی',
                'nav-root-reorder': 'مرتب‌سازی مجدد پوشه‌های ریشه',
                'nav-new-folder': 'پوشه جدید',
                'nav-show-single-pane': 'نمایش پنل تکی',
                'nav-show-dual-pane': 'نمایش پنل‌های دوگانه',
                'nav-profile-chevron': 'فلش منوی پروفایل',
                'list-search': 'جستجو',
                'list-descendants': 'یادداشت‌ها از زیرپوشه‌ها',
                'list-sort-ascending': 'ترتیب: صعودی',
                'list-sort-descending': 'ترتیب: نزولی',
                'list-appearance': 'تغییر ظاهر',
                'list-new-note': 'یادداشت جدید',
                'nav-folder-open': 'پوشه باز',
                'nav-folder-closed': 'پوشه بسته',
                'nav-tag': 'برچسب',
                'list-pinned': 'آیتم‌های سنجاق شده'
            }
        },
        colorPicker: {
            currentColor: 'فعلی',
            newColor: 'جدید',
            presetColors: 'رنگ‌های پیش‌تنظیم',
            userColors: 'رنگ‌های کاربر',
            paletteDefault: 'پیش‌فرض',
            paletteCustom: 'سفارشی',
            copyColors: 'کپی رنگ',
            colorsCopied: 'رنگ در کلیپ‌بورد کپی شد',
            copyClipboardError: 'نمی‌توان در کلیپ‌بورد نوشت',
            pasteColors: 'چسباندن رنگ',
            pasteClipboardError: 'نمی‌توان کلیپ‌بورد را خواند',
            pasteInvalidJson: 'کلیپ‌بورد حاوی متن معتبر نیست',
            pasteInvalidFormat: 'مقدار رنگ hex مورد انتظار است',
            colorsPasted: 'رنگ با موفقیت چسبانده شد',
            resetUserColors: 'پاک کردن رنگ‌های سفارشی',
            clearCustomColorsConfirm: 'همه رنگ‌های سفارشی حذف شوند؟',
            userColorSlot: 'رنگ {slot}',
            recentColors: 'رنگ‌های اخیر',
            clearRecentColors: 'پاک کردن رنگ‌های اخیر',
            removeRecentColor: 'حذف رنگ',
            removeColor: 'حذف رنگ',
            apply: 'اعمال',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'قرمز',
                orange: 'نارنجی',
                amber: 'کهربایی',
                yellow: 'زرد',
                lime: 'لیمویی',
                green: 'سبز',
                emerald: 'زمردی',
                teal: 'سبزآبی',
                cyan: 'فیروزه‌ای',
                sky: 'آسمانی',
                blue: 'آبی',
                indigo: 'نیلی',
                violet: 'بنفش',
                purple: 'ارغوانی',
                fuchsia: 'سرخابی',
                pink: 'صورتی',
                rose: 'گلی',
                gray: 'خاکستری',
                slate: 'تیره',
                stone: 'سنگی'
            }
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
            renameNoChanges: '{oldTag} ← {newTag} ({countLabel})',
            invalidTagName: 'نام برچسب معتبری وارد کنید.',
            descendantRenameError: 'نمی‌توان برچسب را به خود یا زیرمجموعه آن منتقل کرد.',
            confirmDelete: 'حذف برچسب',
            file: 'فایل',
            files: 'فایل'
        },
        fileSystem: {
            newFolderTitle: 'پوشه جدید',
            renameFolderTitle: 'تغییر نام پوشه',
            renameFileTitle: 'تغییر نام فایل',
            deleteFolderTitle: "حذف '{name}'؟",
            deleteFileTitle: "حذف '{name}'؟",
            folderNamePrompt: 'نام پوشه را وارد کنید:',
            hideInOtherVaultProfiles: 'مخفی کردن در پروفایل‌های خزانه دیگر',
            renamePrompt: 'نام جدید را وارد کنید:',
            renameVaultTitle: 'تغییر نام نمایشی خزانه',
            renameVaultPrompt: 'نام نمایشی سفارشی را وارد کنید (خالی برای پیش‌فرض):',
            deleteFolderConfirm: 'آیا مطمئن هستید می‌خواهید این پوشه و تمام محتوای آن را حذف کنید؟',
            deleteFileConfirm: 'آیا مطمئن هستید می‌خواهید این فایل را حذف کنید؟',
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
        navigationBanner: {
            placeholder: 'جستجوی تصویر...',
            instructions: {
                navigate: 'برای ناوبری',
                select: 'برای تنظیم بنر',
                dismiss: 'برای بستن'
            }
        },
        tagSuggest: {
            placeholder: 'جستجوی برچسب...',
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
        welcome: {
            title: 'به {pluginName} خوش آمدید',
            introText:
                'سلام! قبل از شروع، اکیداً توصیه می‌کنم پنج دقیقه اول ویدیوی زیر را تماشا کنید تا نحوه کار پنل‌ها و کلید «نمایش یادداشت‌ها از زیرپوشه‌ها» را درک کنید.',
            continueText:
                'اگر پنج دقیقه دیگر وقت دارید، به تماشای ویدیو ادامه دهید تا حالت‌های نمایش فشرده و نحوه تنظیم صحیح میانبرها و کلیدهای میانبر مهم را درک کنید.',
            thanksText: 'از دانلود شما بسیار سپاسگزارم، لذت ببرید!',
            videoAlt: 'نصب و تسلط بر Notebook Navigator',
            openVideoButton: 'پخش ویدیو',
            closeButton: 'بعداً تماشا می‌کنم'
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
            duplicateNote: 'کپی یادداشت ناموفق بود: {error}',
            createCanvas: 'ایجاد بوم ناموفق بود: {error}',
            createDatabase: 'ایجاد پایگاه داده ناموفق بود: {error}',
            duplicateFolder: 'کپی پوشه ناموفق بود: {error}',
            openVersionHistory: 'باز کردن تاریخچه نسخه ناموفق بود: {error}',
            versionHistoryNotFound: 'دستور تاریخچه نسخه یافت نشد. اطمینان حاصل کنید که Obsidian Sync فعال است.',
            revealInExplorer: 'نمایش فایل در مرورگر سیستم ناموفق بود: {error}',
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
            hideFolder: 'پوشه مخفی شد: {name}',
            showFolder: 'پوشه نمایش داده شد: {name}'
        },
        notifications: {
            deletedMultipleFiles: '{count} فایل حذف شد',
            movedMultipleFiles: '{count} فایل به {folder} منتقل شد',
            folderNoteConversionSuccess: 'فایل به یادداشت پوشه در "{name}" تبدیل شد',
            folderMoved: 'پوشه "{name}" منتقل شد',
            deepLinkCopied: 'URL اوبسیدین در کلیپ‌بورد کپی شد',
            pathCopied: 'مسیر در کلیپ‌بورد کپی شد',
            relativePathCopied: 'مسیر نسبی در کلیپ‌بورد کپی شد',
            tagAddedToNote: 'برچسب به ۱ یادداشت اضافه شد',
            tagAddedToNotes: 'برچسب به {count} یادداشت اضافه شد',
            tagRemovedFromNote: 'برچسب از ۱ یادداشت حذف شد',
            tagRemovedFromNotes: 'برچسب از {count} یادداشت حذف شد',
            tagsClearedFromNote: 'همه برچسب‌ها از ۱ یادداشت پاک شد',
            tagsClearedFromNotes: 'همه برچسب‌ها از {count} یادداشت پاک شد',
            noTagsToRemove: 'برچسبی برای حذف نیست',
            noFilesSelected: 'فایلی انتخاب نشده است',
            tagOperationsNotAvailable: 'عملیات برچسب در دسترس نیست',
            tagsRequireMarkdown: 'برچسب‌ها فقط روی یادداشت‌های Markdown پشتیبانی می‌شوند',
            iconPackDownloaded: '{provider} دانلود شد',
            iconPackUpdated: '{provider} به‌روزرسانی شد ({version})',
            iconPackRemoved: '{provider} حذف شد',
            iconPackLoadFailed: 'بارگذاری {provider} ناموفق بود',
            hiddenFileReveal: 'فایل مخفی است. "نمایش آیتم‌های مخفی" را فعال کنید'
        },
        confirmations: {
            deleteMultipleFiles: 'آیا مطمئن هستید می‌خواهید {count} فایل را حذف کنید؟',
            deleteConfirmation: 'این عمل قابل بازگشت نیست.'
        },
        defaultNames: {
            untitled: 'بدون عنوان',
            untitledNumber: 'بدون عنوان {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'نمی‌توان پوشه را به خود یا زیرپوشه آن منتقل کرد.',
            itemAlreadyExists: 'آیتمی با نام "{name}" در این مکان وجود دارد.',
            failedToMove: 'انتقال ناموفق بود: {error}',
            failedToAddTag: 'افزودن برچسب "{tag}" ناموفق بود',
            failedToClearTags: 'پاک کردن برچسب‌ها ناموفق بود',
            failedToMoveFolder: 'انتقال پوشه "{name}" ناموفق بود',
            failedToImportFiles: 'وارد کردن ناموفق بود: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} فایل در مقصد وجود دارد',
            addedTag: 'برچسب "{tag}" به {count} فایل اضافه شد',
            filesAlreadyHaveTag: '{count} فایل این برچسب یا برچسب دقیق‌تر را دارد',
            clearedTags: 'همه برچسب‌ها از {count} فایل پاک شد',
            noTagsToClear: 'برچسبی برای پاک کردن نیست',
            fileImported: '۱ فایل وارد شد',
            filesImported: '{count} فایل وارد شد'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'امروز',
        yesterday: 'دیروز',
        previous7Days: '۷ روز گذشته',
        previous30Days: '۳۰ روز گذشته'
    },

    // Weekdays
    weekdays: {
        sunday: 'یکشنبه',
        monday: 'دوشنبه',
        tuesday: 'سه‌شنبه',
        wednesday: 'چهارشنبه',
        thursday: 'پنجشنبه',
        friday: 'جمعه',
        saturday: 'شنبه'
    },

    // Plugin commands
    commands: {
        open: 'باز کردن',
        openHomepage: 'باز کردن صفحه اصلی',
        revealFile: 'نمایش فایل',
        search: 'جستجو',
        toggleDualPane: 'تغییر نمای پنل دوگانه',
        selectVaultProfile: 'انتخاب پروفایل خزانه',
        selectVaultProfile1: 'انتخاب پروفایل خزانه ۱',
        selectVaultProfile2: 'انتخاب پروفایل خزانه ۲',
        selectVaultProfile3: 'انتخاب پروفایل خزانه ۳',
        deleteFile: 'حذف فایل‌ها',
        createNewNote: 'ایجاد یادداشت جدید',
        createNewNoteFromTemplate: 'یادداشت جدید از قالب',
        moveFiles: 'انتقال فایل‌ها',
        selectNextFile: 'انتخاب فایل بعدی',
        selectPreviousFile: 'انتخاب فایل قبلی',
        convertToFolderNote: 'تبدیل به یادداشت پوشه',
        setAsFolderNote: 'تنظیم به عنوان یادداشت پوشه',
        detachFolderNote: 'جدا کردن یادداشت پوشه',
        pinAllFolderNotes: 'سنجاق کردن همه یادداشت‌های پوشه',
        navigateToFolder: 'رفتن به پوشه',
        navigateToTag: 'رفتن به برچسب',
        addShortcut: 'افزودن به میانبرها',
        openShortcut: 'باز کردن میانبر {number}',
        toggleDescendants: 'تغییر زیرمجموعه‌ها',
        toggleHidden: 'تغییر پوشه‌ها، برچسب‌ها و یادداشت‌های مخفی',
        toggleTagSort: 'تغییر ترتیب مرتب‌سازی برچسب',
        collapseExpand: 'جمع / باز کردن همه آیتم‌ها',
        addTag: 'افزودن برچسب به فایل‌های انتخابی',
        removeTag: 'حذف برچسب از فایل‌های انتخابی',
        removeAllTags: 'حذف همه برچسب‌ها از فایل‌های انتخابی',
        rebuildCache: 'بازسازی کش'
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator',
        ribbonTooltip: 'Notebook Navigator',
        revealInNavigator: 'نمایش در Notebook Navigator'
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'آخرین تغییر در',
        createdAt: 'ایجاد شده در',
        file: 'فایل',
        files: 'فایل',
        folder: 'پوشه',
        folders: 'پوشه'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'گزارش متادیتای ناموفق به {filename} صادر شد',
            exportFailed: 'صادر کردن گزارش متادیتا ناموفق بود'
        },
        sections: {
            general: 'عمومی',
            navigationPane: 'پنل ناوبری',
            icons: 'بسته‌های آیکون',
            folders: 'پوشه‌ها',
            foldersAndTags: 'پوشه‌ها و برچسب‌ها',
            tags: 'برچسب‌ها',
            search: 'جستجو',
            searchAndHotkeys: 'جستجو و کلیدهای میانبر',
            listPane: 'پنل لیست',
            notes: 'یادداشت‌ها',
            hotkeys: 'کلیدهای میانبر',
            advanced: 'پیشرفته'
        },
        groups: {
            general: {
                filtering: 'فیلتر کردن',
                behavior: 'رفتار',
                view: 'ظاهر',
                icons: 'آیکون‌ها',
                desktopAppearance: 'ظاهر دسکتاپ',
                formatting: 'قالب‌بندی'
            },
            navigation: {
                appearance: 'ظاهر',
                shortcutsAndRecent: 'میانبرها و موارد اخیر'
            },
            list: {
                display: 'ظاهر',
                pinnedNotes: 'یادداشت‌های سنجاق‌شده',
                quickActions: 'اقدامات سریع'
            },
            notes: {
                frontmatter: 'فرانت‌متر',
                icon: 'آیکون',
                title: 'عنوان',
                previewText: 'متن پیش‌نمایش',
                featureImage: 'تصویر ویژه',
                tags: 'برچسب‌ها',
                date: 'تاریخ',
                parentFolder: 'پوشه والد'
            }
        },
        items: {
            searchProvider: {
                name: 'ارائه‌دهنده جستجو',
                desc: 'بین جستجوی سریع نام فایل یا جستجوی متن کامل با افزونه Omnisearch انتخاب کنید. (همگام‌سازی نمی‌شود)',
                options: {
                    internal: 'جستجوی فیلتر',
                    omnisearch: 'Omnisearch (متن کامل)'
                },
                info: {
                    filterSearch: {
                        title: 'جستجوی فیلتر (پیش‌فرض):',
                        description:
                            'فایل‌ها را بر اساس نام و برچسب در پوشه و زیرپوشه‌های فعلی فیلتر می‌کند. حالت فیلتر: متن و برچسب‌های ترکیبی با تمام عبارات مطابقت دارند (مثل "پروژه #کار"). حالت برچسب: جستجو فقط با برچسب‌ها از عملگرهای AND/OR پشتیبانی می‌کند (مثل "#کار AND #فوری"، "#پروژه OR #شخصی"). Cmd/Ctrl+کلیک روی برچسب‌ها برای افزودن با AND، Cmd/Ctrl+Shift+کلیک برای افزودن با OR. پشتیبانی از حذف با پیشوند ! (مثل !پیش‌نویس، !#بایگانی) و یافتن یادداشت‌های بدون برچسب با !#.'
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            'جستجوی متن کامل که کل خزانه را جستجو می‌کند، سپس نتایج را فیلتر می‌کند تا فقط فایل‌های پوشه، زیرپوشه‌ها یا برچسب‌های انتخابی نمایش داده شود. نیاز به نصب افزونه Omnisearch دارد - اگر در دسترس نباشد، جستجو به طور خودکار به جستجوی فیلتر بازمی‌گردد.',
                        warningNotInstalled: 'افزونه Omnisearch نصب نشده است. از جستجوی فیلتر استفاده می‌شود.',
                        limitations: {
                            title: 'محدودیت‌های شناخته‌شده:',
                            performance: 'عملکرد: می‌تواند کند باشد، به‌خصوص هنگام جستجوی کمتر از ۳ کاراکتر در خزانه‌های بزرگ',
                            pathBug:
                                'باگ مسیر: نمی‌تواند در مسیرهای با کاراکترهای غیر ASCII جستجو کند و زیرمسیرها را به درستی جستجو نمی‌کند',
                            limitedResults:
                                'نتایج محدود: از آنجا که Omnisearch کل خزانه را جستجو می‌کند و تعداد محدودی نتیجه قبل از فیلتر برمی‌گرداند، فایل‌های مرتبط از پوشه فعلی ممکن است نمایش داده نشوند',
                            previewText:
                                'متن پیش‌نمایش: پیش‌نمایش یادداشت‌ها با نتایج Omnisearch جایگزین می‌شود که ممکن است هایلایت جستجوی واقعی را نشان ندهد'
                        }
                    }
                }
            },
            listPaneTitle: {
                name: 'عنوان پنل لیست (فقط دسکتاپ)',
                desc: 'محل نمایش عنوان پنل لیست را انتخاب کنید.',
                options: {
                    header: 'نمایش در هدر',
                    list: 'نمایش در پنل لیست',
                    hidden: 'نمایش نده'
                }
            },
            sortNotesBy: {
                name: 'مرتب‌سازی یادداشت‌ها بر اساس',
                desc: 'نحوه مرتب‌سازی یادداشت‌ها در لیست را انتخاب کنید.',
                options: {
                    'modified-desc': 'تاریخ ویرایش (جدیدترین بالا)',
                    'modified-asc': 'تاریخ ویرایش (قدیمی‌ترین بالا)',
                    'created-desc': 'تاریخ ایجاد (جدیدترین بالا)',
                    'created-asc': 'تاریخ ایجاد (قدیمی‌ترین بالا)',
                    'title-asc': 'عنوان (الف بالا)',
                    'title-desc': 'عنوان (ی بالا)'
                }
            },
            revealFileOnListChanges: {
                name: 'اسکرول به فایل انتخابی هنگام تغییر لیست',
                desc: 'هنگام سنجاق کردن یادداشت‌ها، نمایش یادداشت‌های زیرمجموعه، تغییر ظاهر پوشه، یا اجرای عملیات فایل به فایل انتخابی اسکرول کنید.'
            },
            includeDescendantNotes: {
                name: 'نمایش یادداشت‌ها از زیرپوشه‌ها / زیرمجموعه‌ها (همگام‌سازی نمی‌شود)',
                desc: 'یادداشت‌های زیرپوشه‌های تودرتو و زیرمجموعه‌های برچسب را هنگام مشاهده پوشه یا برچسب شامل کنید.'
            },
            limitPinnedToCurrentFolder: {
                name: 'محدود کردن یادداشت‌های سنجاق‌شده به پوشه آنها',
                desc: 'یادداشت‌های سنجاق‌شده فقط هنگام مشاهده پوشه یا برچسبی که در آن سنجاق شده‌اند نمایش داده می‌شوند.'
            },
            separateNoteCounts: {
                name: 'نمایش جداگانه تعداد فعلی و زیرمجموعه',
                desc: 'تعداد یادداشت‌ها را به صورت "فعلی ▾ زیرمجموعه" در پوشه‌ها و برچسب‌ها نمایش دهید.'
            },
            groupNotes: {
                name: 'گروه‌بندی یادداشت‌ها',
                desc: 'هدرها بین یادداشت‌های گروه‌بندی شده بر اساس تاریخ یا پوشه نمایش دهید. نماهای برچسب از گروه‌های تاریخ هنگام فعال بودن گروه‌بندی پوشه استفاده می‌کنند.',
                options: {
                    none: 'گروه‌بندی نکن',
                    date: 'گروه‌بندی بر اساس تاریخ',
                    folder: 'گروه‌بندی بر اساس پوشه'
                }
            },
            showPinnedGroupHeader: {
                name: 'نمایش هدر گروه سنجاق‌شده',
                desc: 'هدر بخش سنجاق‌شده را بالای یادداشت‌های سنجاق‌شده نمایش دهید.'
            },
            showPinnedIcon: {
                name: 'نمایش آیکون سنجاق‌شده',
                desc: 'آیکون را کنار هدر بخش سنجاق‌شده نمایش دهید.'
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
                desc: 'آیکون‌های فایل را با فاصله‌گذاری چپ‌چین نمایش دهید. غیرفعال کردن آیکون‌ها و تورفتگی را حذف می‌کند. اولویت: سفارشی > نام فایل > نوع فایل > پیش‌فرض.'
            },
            showFilenameMatchIcons: {
                name: 'آیکون بر اساس نام فایل',
                desc: 'تخصیص آیکون به فایل‌ها بر اساس متن در نام آن‌ها.'
            },
            fileNameIconMap: {
                name: 'نگاشت آیکون نام فایل',
                desc: 'فایل‌های حاوی متن آیکون مشخص‌شده را دریافت می‌کنند. یک نگاشت در هر خط: متن=آیکون',
                placeholder: '# متن=آیکون\nجلسه=LiCalendar\nفاکتور=PhReceipt',
                editTooltip: 'ویرایش نگاشت‌ها'
            },
            showCategoryIcons: {
                name: 'آیکون بر اساس نوع فایل',
                desc: 'تخصیص آیکون به فایل‌ها بر اساس پسوند آن‌ها.'
            },
            fileTypeIconMap: {
                name: 'نگاشت آیکون نوع فایل',
                desc: 'فایل‌های با پسوند مشخص آیکون مشخص‌شده را دریافت می‌کنند. یک نگاشت در هر خط: پسوند=آیکون',
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: 'ویرایش نگاشت‌ها'
            },
            optimizeNoteHeight: {
                name: 'ارتفاع متغیر یادداشت',
                desc: 'استفاده از ارتفاع فشرده برای یادداشت‌های سنجاق‌شده و یادداشت‌های بدون متن پیش‌نمایش.'
            },
            compactItemHeight: {
                name: 'ارتفاع آیتم فشرده',
                desc: 'ارتفاع آیتم‌های لیست فشرده را در دسکتاپ و موبایل تنظیم کنید.',
                resetTooltip: 'بازگشت به پیش‌فرض (۲۸ پیکسل)'
            },
            compactItemHeightScaleText: {
                name: 'مقیاس‌بندی متن با ارتفاع آیتم فشرده',
                desc: 'متن لیست فشرده را هنگام کاهش ارتفاع آیتم مقیاس‌بندی کنید.'
            },
            showParentFolder: {
                name: 'نمایش پوشه والد',
                desc: 'نام پوشه والد را برای یادداشت‌ها در زیرپوشه‌ها یا برچسب‌ها نمایش دهید.'
            },
            parentFolderClickRevealsFile: {
                name: 'کلیک روی پوشه والد پوشه را باز می‌کند',
                desc: 'کلیک روی برچسب پوشه والد پوشه را در پنل لیست باز می‌کند.'
            },
            showParentFolderColor: {
                name: 'نمایش رنگ پوشه والد',
                desc: 'از رنگ‌های پوشه روی برچسب‌های پوشه والد استفاده کنید.'
            },
            showQuickActions: {
                name: 'نمایش اقدامات سریع (فقط دسکتاپ)',
                desc: 'دکمه‌های اقدام را هنگام قرار گرفتن روی فایل‌ها نمایش دهید. کنترل دکمه اقداماتی که نمایش داده می‌شوند را انتخاب می‌کند.'
            },
            dualPane: {
                name: 'نمای پنل دوگانه (همگام‌سازی نمی‌شود)',
                desc: 'پنل ناوبری و پنل لیست را کنار هم در دسکتاپ نمایش دهید.'
            },
            dualPaneOrientation: {
                name: 'جهت پنل دوگانه (همگام‌سازی نمی‌شود)',
                desc: 'نمای افقی یا عمودی را هنگام فعال بودن پنل دوگانه انتخاب کنید.',
                options: {
                    horizontal: 'تقسیم افقی',
                    vertical: 'تقسیم عمودی'
                }
            },
            appearanceBackground: {
                name: 'رنگ پس‌زمینه',
                desc: 'رنگ‌های پس‌زمینه را برای پنل‌های ناوبری و لیست انتخاب کنید.',
                options: {
                    separate: 'پس‌زمینه‌های جداگانه',
                    primary: 'استفاده از پس‌زمینه لیست',
                    secondary: 'استفاده از پس‌زمینه ناوبری'
                }
            },
            appearanceScale: {
                name: 'سطح زوم (همگام‌سازی نمی‌شود)',
                desc: 'سطح زوم کلی Notebook Navigator را کنترل می‌کند.'
            },
            startView: {
                name: 'نمای پیش‌فرض شروع',
                desc: 'پنلی که هنگام باز کردن Notebook Navigator نمایش داده می‌شود را انتخاب کنید. پنل ناوبری میانبرها، یادداشت‌های اخیر و درخت پوشه را نمایش می‌دهد. پنل لیست فوراً لیست یادداشت‌ها را نمایش می‌دهد.',
                options: {
                    navigation: 'پنل ناوبری',
                    files: 'پنل لیست'
                }
            },
            toolbarButtons: {
                name: 'دکمه‌های نوار ابزار',
                desc: 'دکمه‌هایی که در نوار ابزار نمایش داده می‌شوند را انتخاب کنید. دکمه‌های مخفی از طریق دستورات و منوها قابل دسترسی هستند.',
                navigationLabel: 'نوار ابزار ناوبری',
                listLabel: 'نوار ابزار لیست'
            },
            autoRevealActiveNote: {
                name: 'نمایش خودکار یادداشت فعال',
                desc: 'یادداشت‌ها را هنگام باز شدن از Quick Switcher، لینک‌ها یا جستجو به طور خودکار نمایش دهید.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'نادیده گرفتن رویدادها از نوار کناری راست',
                desc: 'یادداشت فعال را هنگام کلیک یا تغییر یادداشت‌ها در نوار کناری راست تغییر ندهید.'
            },
            paneTransitionDuration: {
                name: 'انیمیشن پنل تکی',
                desc: 'مدت زمان انتقال هنگام جابجایی بین پنل‌ها در حالت پنل تکی (میلی‌ثانیه).',
                resetTooltip: 'بازنشانی به پیش‌فرض'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'انتخاب خودکار اولین یادداشت (فقط دسکتاپ)',
                desc: 'هنگام تعویض پوشه‌ها یا برچسب‌ها به طور خودکار اولین یادداشت را باز کنید.'
            },
            skipAutoScroll: {
                name: 'غیرفعال کردن اسکرول خودکار برای میانبرها',
                desc: 'هنگام کلیک روی آیتم‌ها در میانبرها پنل ناوبری را اسکرول نکنید.'
            },
            autoExpandFoldersTags: {
                name: 'باز کردن هنگام انتخاب',
                desc: 'پوشه‌ها و برچسب‌ها را هنگام انتخاب باز کنید. در حالت پنل تکی، اولین انتخاب باز می‌کند، دومین انتخاب فایل‌ها را نمایش می‌دهد.'
            },
            springLoadedFolders: {
                name: 'گسترش هنگام کشیدن (فقط دسکتاپ)',
                desc: 'پوشه‌ها و برچسب‌ها را هنگام قرار گرفتن روی آن‌ها در حین کشیدن گسترش دهید.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'تأخیر گسترش اول',
                desc: 'تأخیر قبل از گسترش اولین پوشه یا برچسب هنگام کشیدن (ثانیه).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'تأخیر گسترش‌های بعدی',
                desc: 'تأخیر قبل از گسترش پوشه‌ها یا برچسب‌های بیشتر در همان عملیات کشیدن (ثانیه).'
            },
            navigationBanner: {
                name: 'بنر ناوبری (پروفایل خزانه)',
                desc: 'تصویری را بالای پنل ناوبری نمایش دهید. با پروفایل خزانه انتخابی تغییر می‌کند.',
                current: 'بنر فعلی: {path}',
                chooseButton: 'انتخاب تصویر'
            },
            showShortcuts: {
                name: 'نمایش میانبرها',
                desc: 'بخش میانبرها را در پنل ناوبری نمایش دهید.'
            },
            shortcutBadgeDisplay: {
                name: 'نشان میانبر',
                desc: "چه چیزی در کنار میانبرها نمایش داده شود. از دستورات 'باز کردن میانبر 1-9' برای باز کردن مستقیم میانبرها استفاده کنید.",
                options: {
                    index: 'موقعیت (1-9)',
                    count: 'تعداد موارد',
                    none: 'هیچ'
                }
            },
            showRecentNotes: {
                name: 'نمایش یادداشت‌های اخیر',
                desc: 'بخش یادداشت‌های اخیر را در پنل ناوبری نمایش دهید.'
            },
            recentNotesCount: {
                name: 'تعداد یادداشت‌های اخیر',
                desc: 'تعداد یادداشت‌های اخیر که نمایش داده می‌شوند.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'سنجاق کردن یادداشت‌های اخیر با میانبرها',
                desc: 'هنگام سنجاق کردن میانبرها، یادداشت‌های اخیر را نیز شامل شود.'
            },
            showTooltips: {
                name: 'نمایش راهنماها',
                desc: 'راهنماهای hover را با اطلاعات اضافی برای یادداشت‌ها و پوشه‌ها نمایش دهید.'
            },
            showTooltipPath: {
                name: 'نمایش مسیر',
                desc: 'مسیر پوشه را زیر نام یادداشت در راهنماها نمایش دهید.'
            },
            resetPaneSeparator: {
                name: 'بازنشانی موقعیت جداکننده پنل',
                desc: 'جداکننده قابل کشیدن بین پنل ناوبری و پنل لیست را به موقعیت پیش‌فرض بازنشانی کنید.',
                buttonText: 'بازنشانی جداکننده',
                notice: 'موقعیت جداکننده بازنشانی شد. اوبسیدین را ری‌استارت کنید یا Notebook Navigator را دوباره باز کنید.'
            },
            multiSelectModifier: {
                name: 'کلید تغییردهنده انتخاب چندگانه (فقط دسکتاپ)',
                desc: 'کلید تغییردهنده‌ای که انتخاب چندگانه را فعال می‌کند را انتخاب کنید. وقتی Option/Alt انتخاب شود، کلیک Cmd/Ctrl یادداشت‌ها را در تب جدید باز می‌کند.',
                options: {
                    cmdCtrl: 'کلیک Cmd/Ctrl',
                    optionAlt: 'کلیک Option/Alt'
                }
            },
            fileVisibility: {
                name: 'نمایش انواع فایل (پروفایل خزانه)',
                desc: 'فیلتر کنید کدام انواع فایل در ناوبر نمایش داده شوند. انواع فایل پشتیبانی‌نشده توسط اوبسیدین ممکن است در برنامه‌های خارجی باز شوند.',
                options: {
                    documents: 'اسناد (.md, .canvas, .base)',
                    supported: 'پشتیبانی‌شده (در اوبسیدین باز می‌شود)',
                    all: 'همه (ممکن است خارجی باز شود)'
                }
            },
            homepage: {
                name: 'صفحه اصلی',
                desc: 'فایلی که Notebook Navigator به طور خودکار باز می‌کند، مانند داشبورد را انتخاب کنید.',
                current: 'فعلی: {path}',
                currentMobile: 'موبایل: {path}',
                chooseButton: 'انتخاب فایل',

                separateMobile: {
                    name: 'صفحه اصلی جداگانه موبایل',
                    desc: 'صفحه اصلی متفاوتی برای دستگاه‌های موبایل استفاده کنید.'
                }
            },
            excludedNotes: {
                name: 'مخفی کردن یادداشت‌ها (پروفایل خزانه)',
                desc: 'لیست ویژگی‌های فرانت‌متر جدا شده با کاما. یادداشت‌های حاوی هر یک از این ویژگی‌ها مخفی می‌شوند (مثل پیش‌نویس، خصوصی، بایگانی).',
                placeholder: 'پیش‌نویس، خصوصی'
            },
            excludedFileNamePatterns: {
                name: 'مخفی کردن فایل‌ها (پروفایل خزانه)',
                desc: 'لیست الگوهای نام فایل جدا شده با کاما برای مخفی کردن. از علامت‌های عام * و مسیرهای / پشتیبانی می‌کند (مثل temp-*، *.png، /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'پروفایل خزانه',
                desc: 'پروفایل‌ها نمایش انواع فایل، فایل‌های مخفی، پوشه‌های مخفی، برچسب‌های مخفی، یادداشت‌های مخفی، میانبرها و بنر ناوبری را ذخیره می‌کنند. پروفایل‌ها را از هدر پنل ناوبری تعویض کنید.',
                defaultName: 'پیش‌فرض',
                addButton: 'افزودن پروفایل',
                editProfilesButton: 'ویرایش پروفایل‌ها',
                addProfileOption: 'افزودن پروفایل...',
                applyButton: 'اعمال',
                editButton: 'ویرایش پروفایل',
                deleteButton: 'حذف پروفایل',
                addModalTitle: 'افزودن پروفایل',
                editProfilesModalTitle: 'ویرایش پروفایل‌ها',
                editModalTitle: 'ویرایش پروفایل',
                addModalPlaceholder: 'نام پروفایل',
                deleteModalTitle: 'حذف {name}',
                deleteModalMessage: '{name} حذف شود؟ فیلترهای فایل، پوشه، برچسب و یادداشت مخفی ذخیره‌شده در این پروفایل حذف می‌شوند.',
                moveUp: 'انتقال به بالا',
                moveDown: 'انتقال به پایین',
                errors: {
                    emptyName: 'نام پروفایل را وارد کنید',
                    duplicateName: 'نام پروفایل وجود دارد'
                }
            },
            vaultTitle: {
                name: 'محل عنوان خزانه (فقط دسکتاپ)',
                desc: 'انتخاب کنید عنوان خزانه کجا نمایش داده شود.',
                options: {
                    header: 'نمایش در سربرگ',
                    navigation: 'نمایش در پنل ناوبری'
                }
            },
            excludedFolders: {
                name: 'مخفی کردن پوشه‌ها (پروفایل خزانه)',
                desc: 'لیست پوشه‌های جدا شده با کاما برای مخفی کردن. الگوهای نام: assets* (پوشه‌های شروع‌شده با assets)، *_temp (پایان‌یافته با _temp). الگوهای مسیر: /archive (فقط archive اصلی)، /res* (پوشه‌های اصلی شروع‌شده با res)، /*/temp (پوشه‌های temp یک سطح عمیق)، /projects/* (همه پوشه‌های داخل projects).',
                placeholder: 'قالب‌ها، assets*، /archive، /res*'
            },
            showFileDate: {
                name: 'نمایش تاریخ',
                desc: 'تاریخ را زیر نام یادداشت نمایش دهید.'
            },
            alphabeticalDateMode: {
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
            showFileTagAncestors: {
                name: 'نمایش مسیرهای کامل برچسب',
                desc: 'مسیرهای کامل سلسله‌مراتب برچسب را نمایش دهید. وقتی فعال: «ai/openai»، «کار/پروژه‌ها/۲۰۲۴». وقتی غیرفعال: «openai»، «۲۰۲۴».'
            },
            colorFileTags: {
                name: 'رنگ‌آمیزی برچسب‌های فایل',
                desc: 'رنگ‌های برچسب را به نشان‌های برچسب روی آیتم‌های فایل اعمال کنید.'
            },
            prioritizeColoredFileTags: {
                name: 'نمایش اول برچسب‌های رنگی',
                desc: 'برچسب‌های رنگی را قبل از برچسب‌های دیگر روی آیتم‌های فایل مرتب کنید.'
            },
            showFileTagsInCompactMode: {
                name: 'نمایش برچسب‌های فایل در حالت فشرده',
                desc: 'برچسب‌ها را هنگامی که تاریخ، پیش‌نمایش و تصویر مخفی هستند نمایش دهید.'
            },
            dateFormat: {
                name: 'قالب تاریخ',
                desc: 'قالب نمایش تاریخ‌ها (از قالب date-fns استفاده می‌کند).',
                placeholder: 'yyyy/MM/dd',
                help: 'قالب‌های رایج:\nyyyy/MM/dd = ۱۴۰۱/۰۵/۲۵\ndd/MM/yyyy = ۲۵/۰۵/۲۰۲۲\nyyyy-MM-dd = 2022-05-25\n\nتوکن‌ها:\nyyyy/yy = سال\nMMMM/MMM/MM = ماه\ndd/d = روز\nEEEE/EEE = روز هفته',
                helpTooltip: 'برای مرجع قالب کلیک کنید'
            },
            timeFormat: {
                name: 'قالب زمان',
                desc: 'قالب نمایش زمان‌ها (از قالب date-fns استفاده می‌کند).',
                placeholder: 'HH:mm',
                help: 'قالب‌های رایج:\nHH:mm = ۱۴:۳۰ (۲۴ ساعته)\nh:mm a = 2:30 PM (۱۲ ساعته)\nHH:mm:ss = ۱۴:۳۰:۴۵\nh:mm:ss a = 2:30:45 PM\n\nتوکن‌ها:\nHH/H = ۲۴ ساعته\nhh/h = ۱۲ ساعته\nmm = دقیقه\nss = ثانیه\na = صبح/عصر',
                helpTooltip: 'برای مرجع قالب کلیک کنید'
            },
            showFilePreview: {
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
            stripHtmlInPreview: {
                name: 'حذف HTML از پیش‌نمایش‌ها',
                desc: 'حذف تگ‌های HTML از متن پیش‌نمایش. ممکن است بر عملکرد در یادداشت‌های بزرگ تأثیر بگذارد.'
            },
            previewProperties: {
                name: 'ویژگی‌های پیش‌نمایش',
                desc: 'لیست ویژگی‌های فرانت‌متر جدا شده با کاما برای بررسی متن پیش‌نمایش. اولین ویژگی با متن استفاده می‌شود.',
                placeholder: 'خلاصه، توضیحات، چکیده',
                info: 'اگر متن پیش‌نمایش در ویژگی‌های مشخص‌شده یافت نشود، پیش‌نمایش از محتوای یادداشت تولید می‌شود.'
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
            fileNameRows: {
                name: 'ردیف‌های عنوان',
                desc: 'تعداد ردیف‌ها برای نمایش عناوین یادداشت.',
                options: {
                    '1': '۱ ردیف',
                    '2': '۲ ردیف'
                }
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
                desc: 'لیست ویژگی‌های فرانت‌متر جدا شده با کاما برای بررسی تصاویر بندانگشتی.',
                placeholder: 'بندانگشتی، تصویر'
            },

            downloadExternalFeatureImages: {
                name: 'دانلود تصاویر خارجی',
                desc: 'دانلود تصاویر از راه دور و تصاویر کوچک YouTube برای تصاویر ویژه.'
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
            showNoteCount: {
                name: 'نمایش تعداد یادداشت',
                desc: 'تعداد یادداشت‌ها را کنار هر پوشه و برچسب نمایش دهید.'
            },
            showSectionIcons: {
                name: 'نمایش آیکون برای میانبرها و آیتم‌های اخیر',
                desc: 'آیکون‌ها را برای بخش‌های ناوبری مانند میانبرها و فایل‌های اخیر نمایش دهید.'
            },
            interfaceIcons: {
                name: 'آیکون‌های رابط کاربری',
                desc: 'ویرایش آیکون‌های نوار ابزار، پوشه، برچسب، سنجاق شده، جستجو و مرتب‌سازی.',
                buttonText: 'ویرایش آیکون‌ها'
            },
            showIconsColorOnly: {
                name: 'اعمال رنگ فقط به آیکون‌ها',
                desc: 'وقتی فعال، رنگ‌های سفارشی فقط به آیکون‌ها اعمال می‌شوند. وقتی غیرفعال، رنگ‌ها به آیکون‌ها و برچسب‌های متن اعمال می‌شوند.'
            },
            collapseBehavior: {
                name: 'جمع کردن آیتم‌ها',
                desc: 'انتخاب کنید دکمه باز/بسته کردن همه چه چیزی را تحت تأثیر قرار دهد.',
                options: {
                    all: 'همه پوشه‌ها و برچسب‌ها',
                    foldersOnly: 'فقط پوشه‌ها',
                    tagsOnly: 'فقط برچسب‌ها'
                }
            },
            smartCollapse: {
                name: 'باز نگه داشتن آیتم انتخابی',
                desc: 'هنگام جمع کردن، پوشه یا برچسب انتخابی فعلی و والدین آن را باز نگه دارید.'
            },
            navIndent: {
                name: 'تورفتگی درخت',
                desc: 'عرض تورفتگی را برای پوشه‌ها و برچسب‌های تودرتو تنظیم کنید.'
            },
            navItemHeight: {
                name: 'ارتفاع آیتم',
                desc: 'ارتفاع پوشه‌ها و برچسب‌ها را در پنل ناوبری تنظیم کنید.'
            },
            navItemHeightScaleText: {
                name: 'مقیاس‌بندی متن با ارتفاع آیتم',
                desc: 'اندازه متن ناوبری را هنگام کاهش ارتفاع آیتم کاهش دهید.'
            },
            navRootSpacing: {
                name: 'فاصله آیتم اصلی',
                desc: 'فاصله بین پوشه‌ها و برچسب‌های سطح اصلی.'
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
                desc: 'نحوه مرتب‌سازی برچسب‌ها در پنل ناوبری را انتخاب کنید. (همگام‌سازی نمی‌شود)',
                options: {
                    alphaAsc: 'الف تا ی',
                    alphaDesc: 'ی تا الف',
                    frequencyAsc: 'فراوانی (کم به زیاد)',
                    frequencyDesc: 'فراوانی (زیاد به کم)'
                }
            },
            showAllTagsFolder: {
                name: 'نمایش پوشه برچسب‌ها',
                desc: '"برچسب‌ها" را به عنوان پوشه قابل جمع‌شدن نمایش دهید.'
            },
            showUntagged: {
                name: 'نمایش یادداشت‌های بدون برچسب',
                desc: 'آیتم "بدون برچسب" را برای یادداشت‌های بدون برچسب نمایش دهید.'
            },
            keepEmptyTagsProperty: {
                name: 'حفظ ویژگی برچسب‌ها بعد از حذف آخرین برچسب',
                desc: 'ویژگی برچسب‌های فرانت‌متر را هنگام حذف همه برچسب‌ها حفظ کنید. وقتی غیرفعال، ویژگی برچسب‌ها از فرانت‌متر حذف می‌شود.'
            },
            hiddenTags: {
                name: 'مخفی کردن برچسب‌ها (پروفایل خزانه)',
                desc: 'لیست الگوهای برچسب جدا شده با کاما. الگوهای نام: tag* (شروع با)، *tag (پایان با). الگوهای مسیر: archive (برچسب و فرزندان)، archive/* (فقط فرزندان)، projects/*/drafts (wildcard میانی).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'فعال کردن یادداشت‌های پوشه',
                desc: 'وقتی فعال، پوشه‌های دارای یادداشت مرتبط به صورت لینک‌های قابل کلیک نمایش داده می‌شوند.'
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
                desc: 'نام یادداشت پوشه بدون پسوند. برای استفاده از نام پوشه خالی بگذارید.',
                placeholder: 'فهرست'
            },
            folderNoteProperties: {
                name: 'ویژگی‌های یادداشت پوشه',
                desc: 'فرانت‌متر YAML اضافه‌شده به یادداشت‌های پوشه جدید. نشانگرهای --- به طور خودکار اضافه می‌شوند.',
                placeholder: 'تم: تیره\nیادداشت‌پوشه: true'
            },
            hideFolderNoteInList: {
                name: 'مخفی کردن یادداشت پوشه در لیست',
                desc: 'یادداشت پوشه را از نمایش در لیست یادداشت‌های پوشه مخفی کنید.'
            },
            pinCreatedFolderNote: {
                name: 'سنجاق کردن یادداشت‌های پوشه ایجاد شده',
                desc: 'به طور خودکار یادداشت‌های پوشه را هنگام ایجاد از منوی راست‌کلیک سنجاق کنید.'
            },
            confirmBeforeDelete: {
                name: 'تأیید قبل از حذف',
                desc: 'هنگام حذف یادداشت‌ها یا پوشه‌ها گفتگوی تأیید نمایش دهید'
            },
            interceptTagClicks: {
                name: 'رفتن به برچسب‌ها با کلیک',
                desc: 'هنگام کلیک روی برچسب‌ها در یادداشت‌ها، به آن برچسب در Notebook Navigator بروید به جای فعال کردن جستجوی اوبسیدین.'
            },
            metadataCleanup: {
                name: 'پاکسازی متادیتا',
                desc: 'متادیتای یتیم را که هنگام حذف، انتقال یا تغییر نام فایل‌ها، پوشه‌ها یا برچسب‌ها خارج از اوبسیدین باقی مانده حذف می‌کند. این فقط فایل تنظیمات Notebook Navigator را تحت تأثیر قرار می‌دهد.',
                buttonText: 'پاکسازی متادیتا',
                error: 'پاکسازی تنظیمات ناموفق بود',
                loading: 'بررسی متادیتا...',
                statusClean: 'متادیتایی برای پاکسازی نیست',
                statusCounts: 'آیتم‌های یتیم: {folders} پوشه، {tags} برچسب، {files} فایل، {pinned} سنجاق، {separators} جداکننده'
            },
            rebuildCache: {
                name: 'بازسازی کش',
                desc: 'اگر برچسب‌های گمشده، پیش‌نمایش‌های نادرست یا تصاویر ویژه گمشده دارید از این استفاده کنید. این می‌تواند بعد از تداخل‌های همگام‌سازی یا بسته‌شدن‌های غیرمنتظره اتفاق بیفتد.',
                buttonText: 'بازسازی کش',
                success: 'کش بازسازی شد',
                error: 'بازسازی کش ناموفق بود',
                indexingTitle: 'در حال نمایه\u200cسازی خزانه...',
                progress: 'Notebook Navigator در حال به\u200cروزرسانی کش است.'
            },
            hotkeys: {
                intro: 'فایل <پوشه افزونه>/notebook-navigator/data.json را برای سفارشی‌سازی کلیدهای میانبر Notebook Navigator ویرایش کنید. فایل را باز کنید و بخش "keyboardShortcuts" را پیدا کنید. هر ورودی از این ساختار استفاده می‌کند:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (مک) / Ctrl (ویندوز/لینوکس)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Shift',
                    '"Ctrl" = Control (ترجیح "Mod" برای چندسکویی)'
                ],
                guidance:
                    'نگاشت‌های چندگانه برای پشتیبانی از کلیدهای جایگزین اضافه کنید، مانند اتصالات ArrowUp و K نشان‌داده‌شده بالا. تغییردهنده‌ها را در یک ورودی با لیست هر مقدار ترکیب کنید، مثلاً "modifiers": ["Mod", "Shift"]. دنباله‌های صفحه‌کلید مانند "gg" یا "dd" پشتیبانی نمی‌شوند. بعد از ویرایش فایل اوبسیدین را دوباره بارگذاری کنید.'
            },
            externalIcons: {
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
            useFrontmatterDates: {
                name: 'استفاده از متادیتای فرانت‌متر',
                desc: 'از فرانت‌متر برای نام یادداشت، زمان‌ها، آیکون‌ها و رنگ‌ها استفاده کنید'
            },
            frontmatterIconField: {
                name: 'فیلد آیکون',
                desc: 'فیلد فرانت‌متر برای آیکون‌های فایل. برای استفاده از آیکون‌های ذخیره‌شده در تنظیمات خالی بگذارید.',
                placeholder: 'آیکون'
            },
            frontmatterColorField: {
                name: 'فیلد رنگ',
                desc: 'فیلد فرانت‌متر برای رنگ‌های فایل. برای استفاده از رنگ‌های ذخیره‌شده در تنظیمات خالی بگذارید.',
                placeholder: 'رنگ'
            },
            frontmatterSaveMetadata: {
                name: 'ذخیره آیکون‌ها و رنگ‌ها در فرانت‌متر',
                desc: 'به طور خودکار آیکون‌ها و رنگ‌های فایل را با استفاده از فیلدهای پیکربندی‌شده بالا در فرانت‌متر بنویسید.'
            },
            frontmatterMigration: {
                name: 'مهاجرت آیکون‌ها و رنگ‌ها از تنظیمات',
                desc: 'ذخیره‌شده در تنظیمات: {icons} آیکون، {colors} رنگ.',
                button: 'مهاجرت',
                buttonWorking: 'در حال مهاجرت...',
                noticeNone: 'آیکون یا رنگ فایلی در تنظیمات ذخیره نشده است.',
                noticeDone: '{migratedIcons}/{icons} آیکون، {migratedColors}/{colors} رنگ مهاجرت شد.',
                noticeFailures: 'ورودی‌های ناموفق: {failures}.',
                noticeError: 'مهاجرت ناموفق بود. کنسول را برای جزئیات بررسی کنید.'
            },
            frontmatterNameField: {
                name: 'فیلدهای نام',
                desc: 'لیست فیلدهای فرانت‌متر جداشده با کاما. اولین مقدار غیرخالی استفاده می‌شود. به نام فایل برمی‌گردد.',
                placeholder: 'عنوان, نام'
            },
            frontmatterCreatedField: {
                name: 'فیلد زمان ایجاد',
                desc: 'نام فیلد فرانت‌متر برای زمان ایجاد. برای استفاده فقط از تاریخ سیستم فایل خالی بگذارید.',
                placeholder: 'ایجاد'
            },
            frontmatterModifiedField: {
                name: 'فیلد زمان تغییر',
                desc: 'نام فیلد فرانت‌متر برای زمان تغییر. برای استفاده فقط از تاریخ سیستم فایل خالی بگذارید.',
                placeholder: 'تغییر'
            },
            frontmatterDateFormat: {
                name: 'قالب زمان',
                desc: 'قالب استفاده‌شده برای تجزیه زمان‌ها در فرانت‌متر. برای استفاده از قالب ISO 8601 خالی بگذارید',
                helpTooltip: 'مستندات قالب date-fns را ببینید',
                help: "قالب‌های رایج:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'حمایت از توسعه',
                desc: 'اگر از استفاده از Notebook Navigator لذت می‌برید، لطفاً حمایت از توسعه مداوم آن را در نظر بگیرید.',
                buttonText: '❤️ حمایت مالی',
                coffeeButton: '☕️ یک قهوه مهمانم کن'
            },
            updateCheckOnStart: {
                name: 'بررسی نسخه جدید هنگام شروع',
                desc: 'هنگام شروع نسخه‌های جدید افزونه را بررسی می‌کند و هنگام در دسترس بودن به‌روزرسانی اعلان نمایش می‌دهد. هر نسخه فقط یک بار اعلام می‌شود و بررسی‌ها حداکثر روزی یک بار انجام می‌شوند.',
                status: 'نسخه جدید موجود: {version}'
            },
            whatsNew: {
                name: 'چه چیزی جدید است در Notebook Navigator {version}',
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
                checkTimestampFormat: 'قالب زمان خود را بررسی کنید.',
                exportFailed: 'صادر کردن خطاها'
            }
        }
    },
    whatsNew: {
        title: 'چه چیزی جدید است در Notebook Navigator',
        supportMessage: 'اگر Notebook Navigator را مفید می‌دانید، لطفاً حمایت از توسعه آن را در نظر بگیرید.',
        supportButton: 'یک قهوه مهمانم کن',
        thanksButton: 'ممنون!'
    }
};
