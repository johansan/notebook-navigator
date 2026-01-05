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
 * Arabic language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_AR = {
    // Common UI elements
    common: {
        cancel: 'إلغاء', // Button text for canceling dialogs and operations (English: Cancel)
        delete: 'حذف', // Button text for delete operations in dialogs (English: Delete)
        clear: 'مسح', // Button text for clearing values (English: Clear)
        remove: 'إزالة', // Button text for remove operations in dialogs (English: Remove)
        submit: 'إرسال', // Button text for submitting forms and dialogs (English: Submit)
        noSelection: 'لا يوجد تحديد', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'بدون وسم', // Label for notes without any tags (English: Untagged)
        untitled: 'بدون عنوان', // Default name for notes without a title (English: Untitled)
        featureImageAlt: 'صورة مميزة', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'خطأ غير معروف', // Generic fallback when an error has no message (English: Unknown error)
        updateBannerTitle: 'تحديث متصفح الدفتر متاح',
        updateBannerInstruction: 'قم بالتحديث في الإعدادات -> إضافات المجتمع',
        updateIndicatorLabel: 'إصدار جديد متاح'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'اختر مجلدًا أو وسمًا لعرض الملاحظات', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'لا توجد ملاحظات', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'مثبت', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'ملاحظات', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'ملفات', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (مخفي)' // Accessibility label applied to list items that are normally hidden
    },

    // Tag list
    tagList: {
        untaggedLabel: 'بدون وسم', // Label for the special item showing notes without tags (English: Untagged)
        hiddenTags: 'وسوم مخفية', // Label for the hidden tags virtual folder (English: Hidden tags)
        tags: 'وسوم' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'اختصارات', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentNotesHeader: 'ملاحظات حديثة', // Header label for recent notes section in navigation pane (English: Recent notes)
        recentFilesHeader: 'ملفات حديثة', // Header label when showing recent non-note files in navigation pane (English: Recent files)
        reorderRootFoldersTitle: 'إعادة ترتيب التنقل',
        reorderRootFoldersHint: 'استخدم الأسهم أو اسحب لإعادة الترتيب',
        vaultRootLabel: 'الخزنة',
        resetRootToAlpha: 'إعادة الترتيب الأبجدي',
        resetRootToFrequency: 'إعادة الترتيب حسب التكرار',
        pinShortcuts: 'تثبيت الاختصارات',
        pinShortcutsAndRecentNotes: 'تثبيت الاختصارات والملاحظات الحديثة',
        pinShortcutsAndRecentFiles: 'تثبيت الاختصارات والملفات الحديثة',
        unpinShortcuts: 'إلغاء تثبيت الاختصارات',
        unpinShortcutsAndRecentNotes: 'إلغاء تثبيت الاختصارات والملاحظات الحديثة',
        unpinShortcutsAndRecentFiles: 'إلغاء تثبيت الاختصارات والملفات الحديثة',
        profileMenuLabel: 'الملف الشخصي',
        profileMenuAria: 'تغيير ملف الخزنة'
    },

    shortcuts: {
        folderExists: 'المجلد موجود بالفعل في الاختصارات',
        noteExists: 'الملاحظة موجودة بالفعل في الاختصارات',
        tagExists: 'الوسم موجود بالفعل في الاختصارات',
        searchExists: 'اختصار البحث موجود بالفعل',
        emptySearchQuery: 'أدخل استعلام بحث قبل حفظه',
        emptySearchName: 'أدخل اسمًا قبل حفظ البحث',
        add: 'إضافة إلى الاختصارات',
        addNotesCount: 'إضافة {count} ملاحظات إلى الاختصارات',
        addFilesCount: 'إضافة {count} ملفات إلى الاختصارات',
        rename: 'إعادة تسمية الاختصار',
        remove: 'إزالة من الاختصارات',
        removeAll: 'إزالة جميع الاختصارات',
        removeAllConfirm: 'إزالة جميع الاختصارات؟',
        folderNotesPinned: 'تم تثبيت {count} ملاحظة مجلد'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'طي العناصر', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'توسيع جميع العناصر', // Tooltip for button that expands all items (English: Expand all items)
        scrollToTop: 'التمرير للأعلى',
        newFolder: 'مجلد جديد', // Tooltip for create new folder button (English: New folder)
        newNote: 'ملاحظة جديدة', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'العودة للتنقل', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeSortOrder: 'تغيير ترتيب الفرز', // Tooltip for the sort order toggle button (English: Change sort order)
        defaultSort: 'افتراضي', // Label for default sorting mode (English: Default)
        customSort: 'مخصص', // Label for custom sorting mode (English: Custom)
        showFolders: 'إظهار التنقل', // Tooltip for button to show the navigation pane (English: Show navigation)
        hideFolders: 'إخفاء التنقل', // Tooltip for button to hide the navigation pane (English: Hide navigation)
        reorderRootFolders: 'إعادة ترتيب التنقل',
        finishRootFolderReorder: 'تم',
        toggleDescendantNotes: 'إظهار ملاحظات المجلدات الفرعية / الفروع', // Tooltip: include descendants for folders and tags
        autoExpandFoldersTags: 'توسيع عند التحديد', // Tooltip for button to toggle auto-expanding folders and tags when selected (English: Expand on selection)
        showExcludedItems: 'إظهار المجلدات والوسوم والملاحظات المخفية', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'إخفاء المجلدات والوسوم والملاحظات المخفية', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'إظهار لوحتين', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'إظهار لوحة واحدة', // Tooltip for button to show single-pane layout (English: Show single pane)
        changeAppearance: 'تغيير المظهر', // Tooltip for button to change folder appearance settings (English: Change appearance)
        search: 'بحث' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'بحث...', // Placeholder text for search input (English: Search...)
        placeholderOmnisearch: 'بحث شامل...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'مسح البحث', // Tooltip for clear search button (English: Clear search)
        saveSearchShortcut: 'حفظ اختصار البحث',
        removeSearchShortcut: 'إزالة اختصار البحث',
        shortcutModalTitle: 'حفظ اختصار البحث',
        shortcutNamePlaceholder: 'أدخل اسم الاختصار'
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'فتح في علامة تبويب جديدة',
            openToRight: 'فتح على اليمين',
            openInNewWindow: 'فتح في نافذة جديدة',
            openMultipleInNewTabs: 'فتح {count} ملاحظة في علامات تبويب جديدة',
            openMultipleFilesInNewTabs: 'فتح {count} ملف في علامات تبويب جديدة',
            openMultipleToRight: 'فتح {count} ملاحظة على اليمين',
            openMultipleFilesToRight: 'فتح {count} ملف على اليمين',
            openMultipleInNewWindows: 'فتح {count} ملاحظة في نوافذ جديدة',
            openMultipleFilesInNewWindows: 'فتح {count} ملف في نوافذ جديدة',
            pinNote: 'تثبيت الملاحظة',
            pinFile: 'تثبيت الملف',
            unpinNote: 'إلغاء تثبيت الملاحظة',
            unpinFile: 'إلغاء تثبيت الملف',
            pinMultipleNotes: 'تثبيت {count} ملاحظة',
            pinMultipleFiles: 'تثبيت {count} ملف',
            unpinMultipleNotes: 'إلغاء تثبيت {count} ملاحظة',
            unpinMultipleFiles: 'إلغاء تثبيت {count} ملف',
            duplicateNote: 'تكرار الملاحظة',
            duplicateFile: 'تكرار الملف',
            duplicateMultipleNotes: 'تكرار {count} ملاحظة',
            duplicateMultipleFiles: 'تكرار {count} ملف',
            openVersionHistory: 'فتح سجل الإصدارات',
            revealInFolder: 'الكشف في المجلد',
            revealInFinder: 'الكشف في Finder',
            showInExplorer: 'إظهار في مستكشف النظام',
            copyDeepLink: 'نسخ رابط Obsidian',
            copyPath: 'نسخ مسار نظام الملفات',
            copyRelativePath: 'نسخ مسار الخزنة',
            renameNote: 'إعادة تسمية الملاحظة',
            renameFile: 'إعادة تسمية الملف',
            deleteNote: 'حذف الملاحظة',
            deleteFile: 'حذف الملف',
            deleteMultipleNotes: 'حذف {count} ملاحظة',
            deleteMultipleFiles: 'حذف {count} ملف',
            moveNoteToFolder: 'نقل الملاحظة إلى...',
            moveFileToFolder: 'نقل الملف إلى...',
            moveMultipleNotesToFolder: 'نقل {count} ملاحظة إلى...',
            moveMultipleFilesToFolder: 'نقل {count} ملف إلى...',
            addTag: 'إضافة وسم',
            removeTag: 'إزالة وسم',
            removeAllTags: 'إزالة جميع الوسوم',
            changeIcon: 'تغيير الأيقونة',
            changeColor: 'تغيير اللون'
        },
        folder: {
            newNote: 'ملاحظة جديدة',
            newNoteFromTemplate: 'ملاحظة جديدة من قالب',
            newFolder: 'مجلد جديد',
            newCanvas: 'لوحة جديدة',
            newBase: 'قاعدة جديدة',
            newDrawing: 'رسم جديد',
            newExcalidrawDrawing: 'رسم Excalidraw جديد',
            newTldrawDrawing: 'رسم Tldraw جديد',
            duplicateFolder: 'تكرار المجلد',
            searchInFolder: 'البحث في المجلد',
            copyPath: 'نسخ مسار نظام الملفات',
            copyRelativePath: 'نسخ مسار الخزنة',
            createFolderNote: 'إنشاء ملاحظة مجلد',
            detachFolderNote: 'فصل ملاحظة المجلد',
            deleteFolderNote: 'حذف ملاحظة المجلد',
            changeIcon: 'تغيير الأيقونة',
            changeColor: 'تغيير اللون',
            changeBackground: 'تغيير الخلفية',
            excludeFolder: 'إخفاء المجلد',
            unhideFolder: 'إظهار المجلد',
            moveFolder: 'نقل المجلد إلى...',
            renameFolder: 'إعادة تسمية المجلد',
            deleteFolder: 'حذف المجلد'
        },
        tag: {
            changeIcon: 'تغيير الأيقونة',
            changeColor: 'تغيير اللون',
            changeBackground: 'تغيير الخلفية',
            showTag: 'إظهار الوسم',
            hideTag: 'إخفاء الوسم'
        },
        navigation: {
            addSeparator: 'إضافة فاصل',
            removeSeparator: 'إزالة الفاصل'
        },
        style: {
            title: 'النمط',
            copy: 'نسخ النمط',
            paste: 'لصق النمط',
            removeIcon: 'إزالة الأيقونة',
            removeColor: 'إزالة اللون',
            removeBackground: 'إزالة الخلفية',
            clear: 'مسح النمط'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        standardPreset: 'قياسي',
        compactPreset: 'مضغوط',
        defaultSuffix: '(افتراضي)',
        titleRows: 'صفوف العنوان',
        previewRows: 'صفوف المعاينة',
        groupBy: 'تجميع حسب',
        defaultOption: (rows: number) => `افتراضي (${rows})`,
        defaultTitleOption: (rows: number) => `صفوف العنوان الافتراضية (${rows})`,
        defaultPreviewOption: (rows: number) => `صفوف المعاينة الافتراضية (${rows})`,
        defaultGroupOption: (groupLabel: string) => `التجميع الافتراضي (${groupLabel})`,
        titleRowOption: (rows: number) => `${rows} صف عنوان`,
        previewRowOption: (rows: number) => `${rows} صف معاينة`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'البحث عن أيقونات...',
            recentlyUsedHeader: 'المستخدمة مؤخرًا',
            emptyStateSearch: 'ابدأ الكتابة للبحث عن أيقونات',
            emptyStateNoResults: 'لم يتم العثور على أيقونات',
            showingResultsInfo: 'عرض 50 من {count} نتيجة. اكتب المزيد للتضييق.',
            emojiInstructions: 'اكتب أو الصق أي رمز تعبيري لاستخدامه كأيقونة',
            removeIcon: 'إزالة الأيقونة',
            allTabLabel: 'الكل'
        },
        fileIconRuleEditor: {
            addRuleAria: 'إضافة قاعدة'
        },
        interfaceIcons: {
            title: 'أيقونات الواجهة',
            items: {
                'nav-shortcuts': 'الاختصارات',
                'nav-recent-files': 'الملفات الأخيرة',
                'nav-expand-all': 'توسيع الكل',
                'nav-collapse-all': 'طي الكل',
                'nav-tree-expand': 'سهم الشجرة: توسيع',
                'nav-tree-collapse': 'سهم الشجرة: طي',
                'nav-hidden-items': 'العناصر المخفية',
                'nav-root-reorder': 'إعادة ترتيب المجلدات الجذرية',
                'nav-new-folder': 'مجلد جديد',
                'nav-show-single-pane': 'إظهار لوحة واحدة',
                'nav-show-dual-pane': 'إظهار لوحتين',
                'nav-profile-chevron': 'سهم قائمة الملف الشخصي',
                'list-search': 'بحث',
                'list-descendants': 'ملاحظات من المجلدات الفرعية',
                'list-sort-ascending': 'ترتيب الفرز: تصاعدي',
                'list-sort-descending': 'ترتيب الفرز: تنازلي',
                'list-appearance': 'تغيير المظهر',
                'list-new-note': 'ملاحظة جديدة',
                'nav-folder-open': 'مجلد مفتوح',
                'nav-folder-closed': 'مجلد مغلق',
                'nav-tag': 'وسم',
                'list-pinned': 'العناصر المثبتة'
            }
        },
        colorPicker: {
            currentColor: 'الحالي',
            newColor: 'جديد',
            presetColors: 'ألوان مسبقة',
            userColors: 'ألوان المستخدم',
            paletteDefault: 'افتراضي',
            paletteCustom: 'مخصص',
            copyColors: 'نسخ اللون',
            colorsCopied: 'تم نسخ اللون إلى الحافظة',
            copyClipboardError: 'تعذرت الكتابة إلى الحافظة',
            pasteColors: 'لصق اللون',
            pasteClipboardError: 'تعذرت قراءة الحافظة',
            pasteInvalidJson: 'الحافظة لا تحتوي على نص صالح',
            pasteInvalidFormat: 'متوقع قيمة لون hex',
            colorsPasted: 'تم لصق اللون بنجاح',
            resetUserColors: 'مسح الألوان المخصصة',
            clearCustomColorsConfirm: 'إزالة جميع الألوان المخصصة؟',
            userColorSlot: 'اللون {slot}',
            recentColors: 'ألوان حديثة',
            clearRecentColors: 'مسح الألوان الحديثة',
            removeRecentColor: 'إزالة اللون',
            removeColor: 'إزالة اللون',
            apply: 'تطبيق',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'أحمر',
                orange: 'برتقالي',
                amber: 'كهرماني',
                yellow: 'أصفر',
                lime: 'ليموني',
                green: 'أخضر',
                emerald: 'زمردي',
                teal: 'أزرق مخضر',
                cyan: 'سماوي',
                sky: 'سماء',
                blue: 'أزرق',
                indigo: 'نيلي',
                violet: 'بنفسجي',
                purple: 'أرجواني',
                fuchsia: 'فوشيا',
                pink: 'وردي',
                rose: 'وردي فاتح',
                gray: 'رمادي',
                slate: 'رمادي داكن',
                stone: 'حجري'
            }
        },
        selectVaultProfile: {
            title: 'اختر ملف الخزنة',
            currentBadge: 'نشط',
            emptyState: 'لا تتوفر ملفات خزنة.'
        },
        tagOperation: {
            renameTitle: 'إعادة تسمية الوسم {tag}',
            deleteTitle: 'حذف الوسم {tag}',
            newTagPrompt: 'اسم الوسم الجديد',
            newTagPlaceholder: 'أدخل اسم الوسم الجديد',
            renameWarning: 'إعادة تسمية الوسم {oldTag} ستعدل {count} {files}.',
            deleteWarning: 'حذف الوسم {tag} سيعدل {count} {files}.',
            modificationWarning: 'سيؤدي هذا إلى تحديث تواريخ تعديل الملفات.',
            affectedFiles: 'الملفات المتأثرة:',
            andMore: '...و {count} أخرى',
            confirmRename: 'إعادة تسمية الوسم',
            renameUnchanged: '{tag} لم يتغير',
            renameNoChanges: '{oldTag} ← {newTag} ({countLabel})',
            invalidTagName: 'أدخل اسم وسم صالح.',
            descendantRenameError: 'لا يمكن نقل الوسم إلى نفسه أو إلى فرع منه.',
            confirmDelete: 'حذف الوسم',
            file: 'ملف',
            files: 'ملفات'
        },
        fileSystem: {
            newFolderTitle: 'مجلد جديد',
            renameFolderTitle: 'إعادة تسمية المجلد',
            renameFileTitle: 'إعادة تسمية الملف',
            deleteFolderTitle: "حذف '{name}'؟",
            deleteFileTitle: "حذف '{name}'؟",
            folderNamePrompt: 'أدخل اسم المجلد:',
            hideInOtherVaultProfiles: 'إخفاء في ملفات الخزنة الأخرى',
            renamePrompt: 'أدخل الاسم الجديد:',
            renameVaultTitle: 'تغيير اسم عرض الخزنة',
            renameVaultPrompt: 'أدخل اسم العرض المخصص (اتركه فارغًا لاستخدام الافتراضي):',
            deleteFolderConfirm: 'هل أنت متأكد من حذف هذا المجلد وكل محتوياته؟',
            deleteFileConfirm: 'هل أنت متأكد من حذف هذا الملف؟',
            removeAllTagsTitle: 'إزالة جميع الوسوم',
            removeAllTagsFromNote: 'هل أنت متأكد من إزالة جميع الوسوم من هذه الملاحظة؟',
            removeAllTagsFromNotes: 'هل أنت متأكد من إزالة جميع الوسوم من {count} ملاحظة؟'
        },
        folderNoteType: {
            title: 'اختر نوع ملاحظة المجلد',
            folderLabel: 'المجلد: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `نقل ${name} إلى مجلد...`,
            multipleFilesLabel: (count: number) => `${count} ملفات`,
            navigatePlaceholder: 'الانتقال إلى مجلد...',
            instructions: {
                navigate: 'للتنقل',
                move: 'للنقل',
                select: 'للتحديد',
                dismiss: 'للإغلاق'
            }
        },
        homepage: {
            placeholder: 'البحث عن ملفات...',
            instructions: {
                navigate: 'للتنقل',
                select: 'لتعيين الصفحة الرئيسية',
                dismiss: 'للإغلاق'
            }
        },
        navigationBanner: {
            placeholder: 'البحث عن صور...',
            instructions: {
                navigate: 'للتنقل',
                select: 'لتعيين الشعار',
                dismiss: 'للإغلاق'
            }
        },
        tagSuggest: {
            placeholder: 'البحث عن وسوم...',
            navigatePlaceholder: 'الانتقال إلى وسم...',
            addPlaceholder: 'البحث عن وسم لإضافته...',
            removePlaceholder: 'اختر وسمًا لإزالته...',
            createNewTag: 'إنشاء وسم جديد: #{tag}',
            instructions: {
                navigate: 'للتنقل',
                select: 'للتحديد',
                dismiss: 'للإغلاق',
                add: 'لإضافة وسم',
                remove: 'لإزالة وسم'
            }
        },
        welcome: {
            title: 'مرحباً بك في {pluginName}',
            introText:
                'مرحباً! قبل البدء، أوصي بشدة بمشاهدة الدقائق الخمس الأولى من الفيديو أدناه لفهم كيفية عمل اللوحات ومفتاح التبديل "عرض الملاحظات من المجلدات الفرعية".',
            continueText:
                'إذا كان لديك خمس دقائق إضافية، تابع مشاهدة الفيديو لفهم أوضاع العرض المضغوط وكيفية إعداد الاختصارات ومفاتيح الاختصار المهمة بشكل صحيح.',
            thanksText: 'شكراً جزيلاً على التحميل، واستمتع!',
            videoAlt: 'تثبيت وإتقان Notebook Navigator',
            openVideoButton: 'تشغيل الفيديو',
            closeButton: 'سأشاهده لاحقاً'
        }
    },
    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'فشل إنشاء المجلد: {error}',
            createFile: 'فشل إنشاء الملف: {error}',
            renameFolder: 'فشل إعادة تسمية المجلد: {error}',
            renameFolderNoteConflict: 'لا يمكن إعادة التسمية: "{name}" موجود بالفعل في هذا المجلد',
            renameFile: 'فشل إعادة تسمية الملف: {error}',
            deleteFolder: 'فشل حذف المجلد: {error}',
            deleteFile: 'فشل حذف الملف: {error}',
            duplicateNote: 'فشل تكرار الملاحظة: {error}',
            createCanvas: 'فشل إنشاء اللوحة: {error}',
            createDatabase: 'فشل إنشاء قاعدة البيانات: {error}',
            duplicateFolder: 'فشل تكرار المجلد: {error}',
            openVersionHistory: 'فشل فتح سجل الإصدارات: {error}',
            versionHistoryNotFound: 'لم يتم العثور على أمر سجل الإصدارات. تأكد من تمكين Obsidian Sync.',
            revealInExplorer: 'فشل الكشف عن الملف في مستكشف النظام: {error}',
            folderNoteAlreadyExists: 'ملاحظة المجلد موجودة بالفعل',
            folderAlreadyExists: 'المجلد "{name}" موجود بالفعل',
            folderNotesDisabled: 'قم بتمكين ملاحظات المجلد في الإعدادات لتحويل الملفات',
            folderNoteAlreadyLinked: 'هذا الملف يعمل بالفعل كملاحظة مجلد',
            folderNoteNotFound: 'لا توجد ملاحظة مجلد في المجلد المحدد',
            folderNoteUnsupportedExtension: 'امتداد ملف غير مدعوم: {extension}',
            folderNoteMoveFailed: 'فشل نقل الملف أثناء التحويل: {error}',
            folderNoteRenameConflict: 'ملف باسم "{name}" موجود بالفعل في المجلد',
            folderNoteConversionFailed: 'فشل تحويل الملف إلى ملاحظة مجلد',
            folderNoteConversionFailedWithReason: 'فشل تحويل الملف إلى ملاحظة مجلد: {error}',
            folderNoteOpenFailed: 'تم تحويل الملف لكن فشل فتح ملاحظة المجلد: {error}',
            failedToDeleteFile: 'فشل حذف {name}: {error}',
            failedToDeleteMultipleFiles: 'فشل حذف {count} ملفات',
            versionHistoryNotAvailable: 'خدمة سجل الإصدارات غير متاحة',
            drawingAlreadyExists: 'رسم بهذا الاسم موجود بالفعل',
            failedToCreateDrawing: 'فشل إنشاء الرسم',
            noFolderSelected: 'لم يتم تحديد مجلد في متصفح الدفتر',
            noFileSelected: 'لم يتم تحديد ملف'
        },
        warnings: {
            linkBreakingNameCharacters: 'يحتوي هذا الاسم على أحرف تكسر روابط Obsidian: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'لا يمكن أن تبدأ الأسماء بنقطة أو تحتوي على : أو /.',
            forbiddenNameCharactersWindows: 'أحرف Windows المحجوزة غير مسموح بها: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'تم إخفاء المجلد: {name}',
            showFolder: 'تم إظهار المجلد: {name}'
        },
        notifications: {
            deletedMultipleFiles: 'تم حذف {count} ملفات',
            movedMultipleFiles: 'تم نقل {count} ملفات إلى {folder}',
            folderNoteConversionSuccess: 'تم تحويل الملف إلى ملاحظة مجلد في "{name}"',
            folderMoved: 'تم نقل المجلد "{name}"',
            deepLinkCopied: 'تم نسخ رابط Obsidian إلى الحافظة',
            pathCopied: 'تم نسخ المسار إلى الحافظة',
            relativePathCopied: 'تم نسخ المسار النسبي إلى الحافظة',
            tagAddedToNote: 'تمت إضافة الوسم إلى ملاحظة واحدة',
            tagAddedToNotes: 'تمت إضافة الوسم إلى {count} ملاحظات',
            tagRemovedFromNote: 'تمت إزالة الوسم من ملاحظة واحدة',
            tagRemovedFromNotes: 'تمت إزالة الوسم من {count} ملاحظات',
            tagsClearedFromNote: 'تم مسح جميع الوسوم من ملاحظة واحدة',
            tagsClearedFromNotes: 'تم مسح جميع الوسوم من {count} ملاحظات',
            noTagsToRemove: 'لا توجد وسوم لإزالتها',
            noFilesSelected: 'لم يتم تحديد ملفات',
            tagOperationsNotAvailable: 'عمليات الوسوم غير متاحة',
            tagsRequireMarkdown: 'الوسوم مدعومة فقط على ملاحظات Markdown',
            iconPackDownloaded: 'تم تنزيل {provider}',
            iconPackUpdated: 'تم تحديث {provider} ({version})',
            iconPackRemoved: 'تمت إزالة {provider}',
            iconPackLoadFailed: 'فشل تحميل {provider}',
            hiddenFileReveal: 'الملف مخفي. قم بتمكين "إظهار العناصر المخفية" لعرضه'
        },
        confirmations: {
            deleteMultipleFiles: 'هل أنت متأكد من حذف {count} ملفات؟',
            deleteConfirmation: 'لا يمكن التراجع عن هذا الإجراء.'
        },
        defaultNames: {
            untitled: 'بدون عنوان',
            untitledNumber: 'بدون عنوان {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'لا يمكن نقل مجلد إلى نفسه أو إلى مجلد فرعي.',
            itemAlreadyExists: 'عنصر باسم "{name}" موجود بالفعل في هذا الموقع.',
            failedToMove: 'فشل النقل: {error}',
            failedToAddTag: 'فشل إضافة الوسم "{tag}"',
            failedToClearTags: 'فشل مسح الوسوم',
            failedToMoveFolder: 'فشل نقل المجلد "{name}"',
            failedToImportFiles: 'فشل الاستيراد: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} ملفات موجودة بالفعل في الوجهة',
            addedTag: 'تمت إضافة الوسم "{tag}" إلى {count} ملفات',
            filesAlreadyHaveTag: '{count} ملفات تحتوي بالفعل على هذا الوسم أو وسم أكثر تحديدًا',
            clearedTags: 'تم مسح جميع الوسوم من {count} ملفات',
            noTagsToClear: 'لا توجد وسوم لمسحها',
            fileImported: 'تم استيراد ملف واحد',
            filesImported: 'تم استيراد {count} ملفات'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'اليوم',
        yesterday: 'أمس',
        previous7Days: 'آخر 7 أيام',
        previous30Days: 'آخر 30 يومًا'
    },

    // Weekdays
    weekdays: {
        sunday: 'الأحد',
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت'
    },

    // Plugin commands
    commands: {
        open: 'فتح', // Command palette: Opens the Notebook Navigator view (English: Open)
        openHomepage: 'فتح الصفحة الرئيسية', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        revealFile: 'الكشف عن الملف', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'بحث', // Command palette: Toggle search in the file list (English: Search)
        toggleDualPane: 'تبديل تخطيط اللوحتين', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        selectVaultProfile: 'اختيار ملف الخزنة', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'اختيار ملف الخزنة 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'اختيار ملف الخزنة 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'اختيار ملف الخزنة 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'حذف الملفات', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'إنشاء ملاحظة جديدة', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'ملاحظة جديدة من قالب', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'نقل الملفات', // Command palette: Move selected files to another folder (English: Move files)
        selectNextFile: 'تحديد الملف التالي', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'تحديد الملف السابق', // Command palette: Selects the previous file in the current view (English: Select previous file)
        convertToFolderNote: 'تحويل إلى ملاحظة مجلد', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'تعيين كملاحظة مجلد', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'فصل ملاحظة المجلد', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'تثبيت جميع ملاحظات المجلدات', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'الانتقال إلى مجلد', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'الانتقال إلى وسم', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        addShortcut: 'إضافة إلى الاختصارات', // Command palette: Adds the current file, folder, or tag to shortcuts (English: Add to shortcuts)
        openShortcut: 'فتح الاختصار {number}',
        toggleDescendants: 'تبديل الفروع', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'تبديل المجلدات والوسوم والملاحظات المخفية', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'تبديل ترتيب فرز الوسوم', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        collapseExpand: 'طي / توسيع جميع العناصر', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        addTag: 'إضافة وسم للملفات المحددة', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        removeTag: 'إزالة وسم من الملفات المحددة', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'إزالة جميع الوسوم من الملفات المحددة', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        rebuildCache: 'إعادة بناء الذاكرة المؤقتة' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: 'متصفح الدفتر', // Name shown in the view header/tab (English: Notebook Navigator)
        ribbonTooltip: 'متصفح الدفتر', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'الكشف في متصفح الدفتر' // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'آخر تعديل في',
        createdAt: 'تاريخ الإنشاء',
        file: 'ملف',
        files: 'ملفات',
        folder: 'مجلد',
        folders: 'مجلدات'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'تم تصدير تقرير البيانات الوصفية الفاشلة إلى: {filename}',
            exportFailed: 'فشل تصدير تقرير البيانات الوصفية'
        },
        sections: {
            general: 'عام',
            navigationPane: 'لوحة التنقل',
            icons: 'حزم الأيقونات',
            folders: 'مجلدات',
            foldersAndTags: 'مجلدات ووسوم',
            tags: 'وسوم',
            search: 'بحث',
            searchAndHotkeys: 'البحث والاختصارات',
            listPane: 'لوحة القائمة',
            notes: 'ملاحظات',
            hotkeys: 'اختصارات المفاتيح',
            advanced: 'متقدم'
        },
        groups: {
            general: {
                filtering: 'التصفية',
                behavior: 'السلوك',
                view: 'المظهر',
                icons: 'الأيقونات',
                desktopAppearance: 'مظهر سطح المكتب',
                formatting: 'التنسيق'
            },
            navigation: {
                appearance: 'المظهر',
                shortcutsAndRecent: 'الاختصارات والعناصر الأخيرة'
            },
            list: {
                display: 'المظهر',
                pinnedNotes: 'الملاحظات المثبتة',
                quickActions: 'الإجراءات السريعة'
            },
            notes: {
                frontmatter: 'البيانات الأمامية',
                icon: 'الأيقونة',
                title: 'العنوان',
                previewText: 'نص المعاينة',
                featureImage: 'الصورة المميزة',
                tags: 'الوسوم',
                date: 'التاريخ',
                parentFolder: 'المجلد الأصلي'
            }
        },
        items: {
            searchProvider: {
                name: 'مزود البحث',
                desc: 'اختر بين البحث السريع بأسماء الملفات أو البحث النصي الكامل مع إضافة Omnisearch. (غير متزامن)',
                options: {
                    internal: 'بحث التصفية',
                    omnisearch: 'Omnisearch (نص كامل)'
                },
                info: {
                    filterSearch: {
                        title: 'بحث التصفية (افتراضي):',
                        description:
                            'يصفي الملفات حسب الاسم والوسوم ضمن المجلد الحالي والمجلدات الفرعية. وضع الفلتر: النص والوسوم المختلطة تطابق جميع المصطلحات (مثل "مشروع #عمل"). وضع الوسوم: البحث بالوسوم فقط يدعم عوامل AND/OR (مثل "#عمل AND #عاجل"، "#مشروع OR #شخصي"). Cmd/Ctrl+انقر على الوسوم للإضافة مع AND، Cmd/Ctrl+Shift+انقر للإضافة مع OR. يدعم الاستبعاد بالبادئة ! (مثل !مسودة، !#أرشيف) وإيجاد الملاحظات بدون وسوم باستخدام !#.'
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            'بحث نصي كامل يبحث في الخزنة بأكملها، ثم يصفي النتائج لإظهار الملفات فقط من المجلد الحالي أو المجلدات الفرعية أو الوسوم المحددة. يتطلب تثبيت إضافة Omnisearch - إذا لم تكن متوفرة، سيعود البحث تلقائيًا إلى بحث التصفية.',
                        warningNotInstalled: 'إضافة Omnisearch غير مثبتة. يتم استخدام بحث التصفية.',
                        limitations: {
                            title: 'قيود معروفة:',
                            performance: 'الأداء: قد يكون بطيئًا، خاصة عند البحث بأقل من 3 أحرف في الخزائن الكبيرة',
                            pathBug:
                                'خطأ المسار: لا يمكن البحث في المسارات ذات الأحرف غير ASCII ولا يبحث في المسارات الفرعية بشكل صحيح، مما يؤثر على الملفات التي تظهر في نتائج البحث',
                            limitedResults:
                                'نتائج محدودة: نظرًا لأن Omnisearch يبحث في الخزنة بأكملها ويعيد عددًا محدودًا من النتائج قبل التصفية، قد لا تظهر الملفات ذات الصلة من مجلدك الحالي إذا كانت هناك تطابقات كثيرة في أماكن أخرى',
                            previewText:
                                'نص المعاينة: يتم استبدال معاينات الملاحظات بمقتطفات نتائج Omnisearch، والتي قد لا تظهر تمييز المطابقة الفعلي إذا ظهر في مكان آخر في الملف'
                        }
                    }
                }
            },
            listPaneTitle: {
                name: 'عنوان لوحة القائمة (سطح المكتب فقط)',
                desc: 'اختر مكان عرض عنوان لوحة القائمة.',
                options: {
                    header: 'إظهار في الرأس',
                    list: 'إظهار في لوحة القائمة',
                    hidden: 'عدم الإظهار'
                }
            },
            sortNotesBy: {
                name: 'ترتيب الملاحظات حسب',
                desc: 'اختر كيفية ترتيب الملاحظات في قائمة الملاحظات.',
                options: {
                    'modified-desc': 'تاريخ التعديل (الأحدث في الأعلى)',
                    'modified-asc': 'تاريخ التعديل (الأقدم في الأعلى)',
                    'created-desc': 'تاريخ الإنشاء (الأحدث في الأعلى)',
                    'created-asc': 'تاريخ الإنشاء (الأقدم في الأعلى)',
                    'title-asc': 'العنوان (أ في الأعلى)',
                    'title-desc': 'العنوان (ي في الأعلى)'
                }
            },
            revealFileOnListChanges: {
                name: 'التمرير إلى الملف المحدد عند تغيير القائمة',
                desc: 'التمرير إلى الملف المحدد عند تثبيت الملاحظات، أو إظهار ملاحظات الفروع، أو تغيير مظهر المجلد، أو تنفيذ عمليات الملفات.'
            },
            includeDescendantNotes: {
                name: 'إظهار ملاحظات المجلدات الفرعية / الفروع (غير متزامن)',
                desc: 'تضمين الملاحظات من المجلدات الفرعية المتداخلة وفروع الوسوم عند عرض مجلد أو وسم.'
            },
            limitPinnedToCurrentFolder: {
                name: 'قصر الملاحظات المثبتة على مجلدها',
                desc: 'تظهر الملاحظات المثبتة فقط عند عرض المجلد أو الوسم الذي تم تثبيتها فيه.'
            },
            separateNoteCounts: {
                name: 'إظهار عدد الملاحظات الحالية والفرعية بشكل منفصل',
                desc: 'عرض عدد الملاحظات بتنسيق "الحالي ▾ الفروع" في المجلدات والوسوم.'
            },
            groupNotes: {
                name: 'تجميع الملاحظات',
                desc: 'عرض رؤوس بين الملاحظات مجمعة حسب التاريخ أو المجلد. تستخدم طرق عرض الوسوم تجميع التاريخ عند تمكين تجميع المجلدات.',
                options: {
                    none: 'بدون تجميع',
                    date: 'تجميع حسب التاريخ',
                    folder: 'تجميع حسب المجلد'
                }
            },
            showPinnedGroupHeader: {
                name: 'إظهار رأس المجموعة المثبتة',
                desc: 'عرض رأس القسم المثبت فوق الملاحظات المثبتة.'
            },
            showPinnedIcon: {
                name: 'إظهار أيقونة التثبيت',
                desc: 'إظهار الأيقونة بجانب رأس القسم المثبت.'
            },
            defaultListMode: {
                name: 'وضع القائمة الافتراضي',
                desc: 'اختر تخطيط القائمة الافتراضي. القياسي يعرض العنوان والتاريخ والوصف ونص المعاينة. المضغوط يعرض العنوان فقط. تجاوز المظهر لكل مجلد.',
                options: {
                    standard: 'قياسي',
                    compact: 'مضغوط'
                }
            },
            showFileIcons: {
                name: 'إظهار أيقونات الملفات',
                desc: 'عرض أيقونات الملفات مع مسافة محاذاة لليسار. التعطيل يزيل الأيقونات والمسافة البادئة. الأولوية: مخصص > اسم الملف > نوع الملف > افتراضي.'
            },
            showFilenameMatchIcons: {
                name: 'أيقونات حسب اسم الملف',
                desc: 'تعيين أيقونات للملفات بناءً على النص في أسمائها.'
            },
            fileNameIconMap: {
                name: 'خريطة أيقونات اسم الملف',
                desc: 'الملفات التي تحتوي على النص تحصل على الأيقونة المحددة. تعيين واحد لكل سطر: نص=أيقونة',
                placeholder: '# نص=أيقونة\nاجتماع=LiCalendar\nفاتورة=PhReceipt',
                editTooltip: 'تعديل التعيينات'
            },
            showCategoryIcons: {
                name: 'أيقونات حسب نوع الملف',
                desc: 'تعيين أيقونات للملفات بناءً على امتدادها.'
            },
            fileTypeIconMap: {
                name: 'خريطة أيقونات نوع الملف',
                desc: 'الملفات ذات الامتداد تحصل على الأيقونة المحددة. تعيين واحد لكل سطر: امتداد=أيقونة',
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: 'تعديل التعيينات'
            },
            optimizeNoteHeight: {
                name: 'ارتفاع متغير للملاحظة',
                desc: 'استخدام ارتفاع مضغوط للملاحظات المثبتة والملاحظات بدون نص معاينة.'
            },
            compactItemHeight: {
                name: 'ارتفاع العنصر المضغوط',
                desc: 'تعيين ارتفاع عناصر القائمة المضغوطة على سطح المكتب والجوال.',
                resetTooltip: 'استعادة إلى الافتراضي (28 بكسل)'
            },
            compactItemHeightScaleText: {
                name: 'تحجيم النص مع ارتفاع العنصر المضغوط',
                desc: 'تحجيم نص القائمة المضغوطة عند تقليل ارتفاع العنصر.'
            },
            showParentFolder: {
                name: 'إظهار المجلد الأصلي',
                desc: 'عرض اسم المجلد الأصلي للملاحظات في المجلدات الفرعية أو الوسوم.'
            },
            parentFolderClickRevealsFile: {
                name: 'النقر على المجلد الأصلي يفتح المجلد',
                desc: 'النقر على تسمية المجلد الأصلي يفتح المجلد في لوحة القائمة.'
            },
            showParentFolderColor: {
                name: 'إظهار لون المجلد الأصلي',
                desc: 'استخدام ألوان المجلدات على تسميات المجلد الأصلي.'
            },
            showQuickActions: {
                name: 'إظهار الإجراءات السريعة (سطح المكتب فقط)',
                desc: 'إظهار أزرار الإجراءات عند التمرير فوق الملفات. أدوات التحكم في الأزرار تحدد الإجراءات التي تظهر.'
            },
            dualPane: {
                name: 'تخطيط اللوحتين (غير متزامن)',
                desc: 'إظهار لوحة التنقل ولوحة القائمة جنبًا إلى جنب على سطح المكتب.'
            },
            dualPaneOrientation: {
                name: 'اتجاه اللوحتين (غير متزامن)',
                desc: 'اختر التخطيط الأفقي أو الرأسي عند تنشيط اللوحتين.',
                options: {
                    horizontal: 'تقسيم أفقي',
                    vertical: 'تقسيم رأسي'
                }
            },
            appearanceBackground: {
                name: 'لون الخلفية',
                desc: 'اختر ألوان الخلفية للوحة التنقل ولوحة القائمة.',
                options: {
                    separate: 'خلفيات منفصلة',
                    primary: 'استخدام خلفية القائمة',
                    secondary: 'استخدام خلفية التنقل'
                }
            },
            appearanceScale: {
                name: 'مستوى التكبير (غير متزامن)',
                desc: 'التحكم في مستوى التكبير العام لمتصفح الدفتر.'
            },
            startView: {
                name: 'عرض البدء الافتراضي',
                desc: 'اختر اللوحة التي تعرض عند فتح متصفح الدفتر. لوحة التنقل تعرض الاختصارات والملاحظات الحديثة وشجرة المجلدات. لوحة القائمة تعرض قائمة الملاحظات فورًا.',
                options: {
                    navigation: 'لوحة التنقل',
                    files: 'لوحة القائمة'
                }
            },
            toolbarButtons: {
                name: 'أزرار شريط الأدوات',
                desc: 'اختر الأزرار التي تظهر في شريط الأدوات. الأزرار المخفية تبقى قابلة للوصول عبر الأوامر والقوائم.',
                navigationLabel: 'شريط أدوات التنقل',
                listLabel: 'شريط أدوات القائمة'
            },
            autoRevealActiveNote: {
                name: 'الكشف التلقائي عن الملاحظة النشطة',
                desc: 'الكشف تلقائيًا عن الملاحظات عند فتحها من المبدل السريع أو الروابط أو البحث.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'تجاهل الأحداث من الشريط الجانبي الأيمن',
                desc: 'عدم تغيير الملاحظة النشطة عند النقر أو تغيير الملاحظات في الشريط الجانبي الأيمن.'
            },
            paneTransitionDuration: {
                name: 'تحريك اللوحة المفردة',
                desc: 'مدة الانتقال عند التبديل بين اللوحات في وضع اللوحة المفردة (ملي ثانية).',
                resetTooltip: 'إعادة تعيين إلى الافتراضي'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'التحديد التلقائي لأول ملاحظة (سطح المكتب فقط)',
                desc: 'فتح أول ملاحظة تلقائيًا عند تبديل المجلدات أو الوسوم.'
            },
            skipAutoScroll: {
                name: 'تعطيل التمرير التلقائي للاختصارات',
                desc: 'عدم تمرير لوحة التنقل عند النقر على عناصر في الاختصارات.'
            },
            autoExpandFoldersTags: {
                name: 'التوسيع عند التحديد',
                desc: 'توسيع المجلدات والوسوم عند تحديدها. في وضع اللوحة الواحدة، التحديد الأول يوسع، والتحديد الثاني يعرض الملفات.'
            },
            springLoadedFolders: {
                name: 'التوسيع أثناء السحب (سطح المكتب فقط)',
                desc: 'توسيع المجلدات والوسوم عند التمرير فوقها أثناء السحب.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'تأخير التوسيع الأول',
                desc: 'التأخير قبل توسيع أول مجلد أو وسم أثناء السحب (بالثواني).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'تأخير التوسيع اللاحق',
                desc: 'التأخير قبل توسيع مجلدات أو وسوم إضافية أثناء نفس عملية السحب (بالثواني).'
            },
            navigationBanner: {
                name: 'شعار التنقل (ملف الخزنة)',
                desc: 'عرض صورة فوق لوحة التنقل. يتغير مع ملف الخزنة المحدد.',
                current: 'الشعار الحالي: {path}',
                chooseButton: 'اختيار صورة'
            },
            showShortcuts: {
                name: 'إظهار الاختصارات',
                desc: 'عرض قسم الاختصارات في لوحة التنقل.'
            },
            shortcutBadgeDisplay: {
                name: 'شارة الاختصار',
                desc: "ما يتم عرضه بجانب الاختصارات. استخدم أوامر 'فتح الاختصار 1-9' لفتح الاختصارات مباشرة.",
                options: {
                    index: 'الموضع (1-9)',
                    count: 'عدد العناصر',
                    none: 'لا شيء'
                }
            },
            showRecentNotes: {
                name: 'إظهار الملاحظات الحديثة',
                desc: 'عرض قسم الملاحظات الحديثة في لوحة التنقل.'
            },
            recentNotesCount: {
                name: 'عدد الملاحظات الحديثة',
                desc: 'عدد الملاحظات الحديثة المعروضة.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'تثبيت الملاحظات الحديثة مع الاختصارات',
                desc: 'تضمين الملاحظات الحديثة عند تثبيت الاختصارات.'
            },
            showTooltips: {
                name: 'إظهار التلميحات',
                desc: 'عرض تلميحات التمرير مع معلومات إضافية للملاحظات والمجلدات.'
            },
            showTooltipPath: {
                name: 'إظهار المسار',
                desc: 'عرض مسار المجلد أسفل أسماء الملاحظات في التلميحات.'
            },
            resetPaneSeparator: {
                name: 'إعادة تعيين موضع فاصل اللوحة',
                desc: 'إعادة تعيين الفاصل القابل للسحب بين لوحة التنقل ولوحة القائمة إلى الموضع الافتراضي.',
                buttonText: 'إعادة تعيين الفاصل',
                notice: 'تم إعادة تعيين موضع الفاصل. أعد تشغيل Obsidian أو أعد فتح متصفح الدفتر للتطبيق.'
            },
            multiSelectModifier: {
                name: 'معدل التحديد المتعدد (سطح المكتب فقط)',
                desc: 'اختر مفتاح التعديل الذي يبدل التحديد المتعدد. عند اختيار Option/Alt، النقر مع Cmd/Ctrl يفتح الملاحظات في علامة تبويب جديدة.',
                options: {
                    cmdCtrl: 'النقر مع Cmd/Ctrl',
                    optionAlt: 'النقر مع Option/Alt'
                }
            },
            fileVisibility: {
                name: 'إظهار أنواع الملفات (ملف الخزنة)',
                desc: 'تصفية أنواع الملفات المعروضة في المتصفح. أنواع الملفات غير المدعومة من Obsidian قد تفتح في تطبيقات خارجية.',
                options: {
                    documents: 'مستندات (.md, .canvas, .base)',
                    supported: 'مدعومة (تفتح في Obsidian)',
                    all: 'الكل (قد تفتح خارجيًا)'
                }
            },
            homepage: {
                name: 'الصفحة الرئيسية',
                desc: 'اختر الملف الذي يفتحه متصفح الدفتر تلقائيًا، مثل لوحة المعلومات.',
                current: 'الحالي: {path}',
                currentMobile: 'الجوال: {path}',
                chooseButton: 'اختيار ملف',

                separateMobile: {
                    name: 'صفحة رئيسية منفصلة للجوال',
                    desc: 'استخدام صفحة رئيسية مختلفة للأجهزة المحمولة.'
                }
            },
            excludedNotes: {
                name: 'إخفاء الملاحظات (ملف الخزنة)',
                desc: 'قائمة مفصولة بفاصلة من خصائص البيانات الأمامية. الملاحظات التي تحتوي على أي من هذه الخصائص ستكون مخفية (مثل draft، private، archived).',
                placeholder: 'draft, private'
            },
            excludedFileNamePatterns: {
                name: 'إخفاء الملفات (ملف الخزنة)',
                desc: 'قائمة أنماط أسماء الملفات مفصولة بفاصلة للإخفاء. يدعم أحرف البدل * والمسارات / (مثل temp-*، *.png، /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'ملف الخزنة',
                desc: 'تخزن الملفات رؤية أنواع الملفات والملفات المخفية والمجلدات المخفية والوسوم المخفية والملاحظات المخفية والاختصارات وشعار التنقل. بدل الملفات من رأس لوحة التنقل.',
                defaultName: 'افتراضي',
                addButton: 'إضافة ملف',
                editProfilesButton: 'تحرير الملفات',
                addProfileOption: 'إضافة ملف...',
                applyButton: 'تطبيق',
                editButton: 'تحرير الملف',
                deleteButton: 'حذف الملف',
                addModalTitle: 'إضافة ملف',
                editProfilesModalTitle: 'تحرير الملفات',
                editModalTitle: 'تحرير الملف',
                addModalPlaceholder: 'اسم الملف',
                deleteModalTitle: 'حذف {name}',
                deleteModalMessage: 'إزالة {name}؟ سيتم حذف مرشحات الملفات والمجلدات والوسوم والملاحظات المخفية المحفوظة في هذا الملف.',
                moveUp: 'تحريك لأعلى',
                moveDown: 'تحريك لأسفل',
                errors: {
                    emptyName: 'أدخل اسم الملف',
                    duplicateName: 'اسم الملف موجود بالفعل'
                }
            },
            vaultTitle: {
                name: 'موضع عنوان الخزنة (سطح المكتب فقط)',
                desc: 'اختر مكان عرض عنوان الخزنة.',
                options: {
                    header: 'عرض في الرأس',
                    navigation: 'عرض في لوحة التنقل'
                }
            },
            excludedFolders: {
                name: 'إخفاء المجلدات (ملف الخزنة)',
                desc: 'قائمة مفصولة بفاصلة من المجلدات لإخفائها. أنماط الاسم: assets* (المجلدات التي تبدأ بـ assets)، *_temp (التي تنتهي بـ _temp). أنماط المسار: /archive (الأرشيف الجذري فقط)، /res* (المجلدات الجذرية التي تبدأ بـ res)، /*/temp (مجلدات temp بمستوى واحد)، /projects/* (جميع المجلدات داخل projects).',
                placeholder: 'templates, assets*, /archive, /res*'
            },
            showFileDate: {
                name: 'إظهار التاريخ',
                desc: 'عرض التاريخ أسفل أسماء الملاحظات.'
            },
            alphabeticalDateMode: {
                name: 'عند الترتيب حسب الاسم',
                desc: 'التاريخ المعروض عند ترتيب الملاحظات أبجديًا.',
                options: {
                    created: 'تاريخ الإنشاء',
                    modified: 'تاريخ التعديل'
                }
            },
            showFileTags: {
                name: 'إظهار وسوم الملفات',
                desc: 'عرض وسوم قابلة للنقر في عناصر الملفات.'
            },
            showFileTagAncestors: {
                name: 'إظهار مسارات الوسوم الكاملة',
                desc: "عرض مسارات تسلسل الوسوم الكاملة. عند التمكين: 'ai/openai'، 'work/projects/2024'. عند التعطيل: 'openai'، '2024'."
            },
            colorFileTags: {
                name: 'تلوين وسوم الملفات',
                desc: 'تطبيق ألوان الوسوم على شارات الوسوم في عناصر الملفات.'
            },
            prioritizeColoredFileTags: {
                name: 'إظهار الوسوم الملونة أولاً',
                desc: 'ترتيب الوسوم الملونة قبل الوسوم الأخرى في عناصر الملفات.'
            },
            showFileTagsInCompactMode: {
                name: 'إظهار وسوم الملفات في الوضع المضغوط',
                desc: 'عرض الوسوم عند إخفاء التاريخ والمعاينة والصورة.'
            },
            dateFormat: {
                name: 'تنسيق التاريخ',
                desc: 'تنسيق عرض التواريخ (يستخدم تنسيق date-fns).',
                placeholder: 'd MMM yyyy',
                help: 'التنسيقات الشائعة:\nMMM d, yyyy = 25 مايو 2022\ndd/MM/yyyy = 25/05/2022\nyyyy-MM-dd = 2022-05-25\n\nالرموز:\nyyyy/yy = السنة\nMMMM/MMM/MM = الشهر\ndd/d = اليوم\nEEEE/EEE = يوم الأسبوع',
                helpTooltip: 'انقر لمرجع التنسيق'
            },
            timeFormat: {
                name: 'تنسيق الوقت',
                desc: 'تنسيق عرض الأوقات (يستخدم تنسيق date-fns).',
                placeholder: 'h:mm a',
                help: 'التنسيقات الشائعة:\nh:mm a = 2:30 م (12 ساعة)\nHH:mm = 14:30 (24 ساعة)\nh:mm:ss a = 2:30:45 م\nHH:mm:ss = 14:30:45\n\nالرموز:\nHH/H = 24 ساعة\nhh/h = 12 ساعة\nmm = الدقائق\nss = الثواني\na = ص/م',
                helpTooltip: 'انقر لمرجع التنسيق'
            },
            showFilePreview: {
                name: 'إظهار معاينة الملاحظة',
                desc: 'عرض نص المعاينة أسفل أسماء الملاحظات.'
            },
            skipHeadingsInPreview: {
                name: 'تخطي العناوين في المعاينة',
                desc: 'تخطي سطور العناوين عند إنشاء نص المعاينة.'
            },
            skipCodeBlocksInPreview: {
                name: 'تخطي كتل الكود في المعاينة',
                desc: 'تخطي كتل الكود عند إنشاء نص المعاينة.'
            },
            stripHtmlInPreview: {
                name: 'إزالة HTML من المعاينات',
                desc: 'إزالة علامات HTML من نص المعاينة. قد يؤثر على الأداء في الملاحظات الكبيرة.'
            },
            previewProperties: {
                name: 'خصائص المعاينة',
                desc: 'قائمة مفصولة بفاصلة من خصائص البيانات الأمامية للتحقق من نص المعاينة. سيتم استخدام أول خاصية تحتوي على نص.',
                placeholder: 'summary, description, abstract',
                info: 'إذا لم يتم العثور على نص معاينة في الخصائص المحددة، سيتم إنشاء المعاينة من محتوى الملاحظة.'
            },
            previewRows: {
                name: 'صفوف المعاينة',
                desc: 'عدد الصفوف المعروضة لنص المعاينة.',
                options: {
                    '1': 'صف واحد',
                    '2': 'صفان',
                    '3': '3 صفوف',
                    '4': '4 صفوف',
                    '5': '5 صفوف'
                }
            },
            fileNameRows: {
                name: 'صفوف العنوان',
                desc: 'عدد الصفوف المعروضة لعناوين الملاحظات.',
                options: {
                    '1': 'صف واحد',
                    '2': 'صفان'
                }
            },
            showFeatureImage: {
                name: 'إظهار الصورة المميزة',
                desc: 'عرض صورة مصغرة لأول صورة موجودة في الملاحظة.'
            },
            forceSquareFeatureImage: {
                name: 'فرض صورة مميزة مربعة',
                desc: 'عرض الصور المميزة كصور مصغرة مربعة.'
            },
            featureImageProperties: {
                name: 'خصائص الصورة',
                desc: 'قائمة مفصولة بفاصلة من خصائص البيانات الأمامية للتحقق من الصور المصغرة.',
                placeholder: 'thumbnail, featureResized, feature'
            },

            downloadExternalFeatureImages: {
                name: 'تنزيل الصور الخارجية',
                desc: 'تنزيل الصور عن بُعد والصور المصغرة من YouTube للصور المميزة.'
            },
            showRootFolder: {
                name: 'إظهار المجلد الجذري',
                desc: 'عرض اسم الخزنة كمجلد جذري في الشجرة.'
            },
            showFolderIcons: {
                name: 'إظهار أيقونات المجلدات',
                desc: 'عرض الأيقونات بجانب المجلدات في لوحة التنقل.'
            },
            inheritFolderColors: {
                name: 'توريث ألوان المجلدات',
                desc: 'المجلدات الفرعية ترث الألوان من المجلدات الأصلية.'
            },
            showNoteCount: {
                name: 'إظهار عدد الملاحظات',
                desc: 'عرض عدد الملاحظات بجانب كل مجلد ووسم.'
            },
            showSectionIcons: {
                name: 'إظهار أيقونات للاختصارات والعناصر الحديثة',
                desc: 'عرض أيقونات لأقسام التنقل مثل الاختصارات والملفات الحديثة.'
            },
            interfaceIcons: {
                name: 'أيقونات الواجهة',
                desc: 'تحرير أيقونات شريط الأدوات والمجلدات والوسوم والعناصر المثبتة والبحث والفرز.',
                buttonText: 'تحرير الأيقونات'
            },
            showIconsColorOnly: {
                name: 'تطبيق اللون على الأيقونات فقط',
                desc: 'عند التمكين، تطبق الألوان المخصصة على الأيقونات فقط. عند التعطيل، تطبق الألوان على الأيقونات وتسميات النص.'
            },
            collapseBehavior: {
                name: 'طي العناصر',
                desc: 'اختر ما يؤثر عليه زر توسيع/طي الكل.',
                options: {
                    all: 'جميع المجلدات والوسوم',
                    foldersOnly: 'المجلدات فقط',
                    tagsOnly: 'الوسوم فقط'
                }
            },
            smartCollapse: {
                name: 'إبقاء العنصر المحدد موسعًا',
                desc: 'عند الطي، إبقاء المجلد أو الوسم المحدد حاليًا وآبائه موسعين.'
            },
            navIndent: {
                name: 'مسافة بادئة الشجرة',
                desc: 'ضبط عرض المسافة البادئة للمجلدات والوسوم المتداخلة.'
            },
            navItemHeight: {
                name: 'ارتفاع العنصر',
                desc: 'ضبط ارتفاع المجلدات والوسوم في لوحة التنقل.'
            },
            navItemHeightScaleText: {
                name: 'تحجيم النص مع ارتفاع العنصر',
                desc: 'تقليل حجم نص التنقل عند تقليل ارتفاع العنصر.'
            },
            navRootSpacing: {
                name: 'تباعد العناصر الجذرية',
                desc: 'التباعد بين المجلدات والوسوم على مستوى الجذر.'
            },
            showTags: {
                name: 'إظهار الوسوم',
                desc: 'عرض قسم الوسوم في المتصفح.'
            },
            showTagIcons: {
                name: 'إظهار أيقونات الوسوم',
                desc: 'عرض الأيقونات بجانب الوسوم في لوحة التنقل.'
            },
            inheritTagColors: {
                name: 'وراثة ألوان الوسوم',
                desc: 'تَرِث الوسوم الفرعية اللون من الوسوم الأصلية.'
            },
            tagSortOrder: {
                name: 'ترتيب فرز الوسوم',
                desc: 'اختر كيفية ترتيب الوسوم في لوحة التنقل. (غير متزامن)',
                options: {
                    alphaAsc: 'من أ إلى ي',
                    alphaDesc: 'من ي إلى أ',
                    frequencyAsc: 'التكرار (من الأقل إلى الأعلى)',
                    frequencyDesc: 'التكرار (من الأعلى إلى الأقل)'
                }
            },
            showAllTagsFolder: {
                name: 'إظهار مجلد الوسوم',
                desc: 'عرض "الوسوم" كمجلد قابل للطي.'
            },
            showUntagged: {
                name: 'إظهار الملاحظات بدون وسوم',
                desc: 'عرض عنصر "بدون وسم" للملاحظات التي ليس لها أي وسوم.'
            },
            keepEmptyTagsProperty: {
                name: 'الاحتفاظ بخاصية الوسوم بعد إزالة آخر وسم',
                desc: 'الاحتفاظ بخاصية الوسوم في البيانات الأمامية عند إزالة جميع الوسوم. عند التعطيل، يتم حذف خاصية الوسوم من البيانات الأمامية.'
            },
            hiddenTags: {
                name: 'إخفاء الوسوم (ملف الخزنة)',
                desc: 'قائمة مفصولة بفاصلة من أنماط الوسوم. أنماط الأسماء: tag* (تبدأ بـ)، *tag (تنتهي بـ). أنماط المسارات: archive (الوسم وفروعه)، archive/* (الفروع فقط)، projects/*/drafts (حرف بدل وسطي).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'تمكين ملاحظات المجلدات',
                desc: 'عند التمكين، تعرض المجلدات ذات الملاحظات المرتبطة كروابط قابلة للنقر.'
            },
            folderNoteType: {
                name: 'نوع ملاحظة المجلد الافتراضي',
                desc: 'نوع ملاحظة المجلد المنشأة من قائمة السياق.',
                options: {
                    ask: 'السؤال عند الإنشاء',
                    markdown: 'Markdown',
                    canvas: 'لوحة',
                    base: 'قاعدة'
                }
            },
            folderNoteName: {
                name: 'اسم ملاحظة المجلد',
                desc: 'اسم ملاحظة المجلد بدون امتداد. اتركه فارغًا لاستخدام نفس اسم المجلد.',
                placeholder: 'index'
            },
            folderNoteProperties: {
                name: 'خصائص ملاحظة المجلد',
                desc: 'بيانات YAML الأمامية المضافة إلى ملاحظات المجلد الجديدة. تضاف علامات --- تلقائيًا.',
                placeholder: 'theme: dark\nfoldernote: true'
            },
            hideFolderNoteInList: {
                name: 'إخفاء ملاحظات المجلدات في القائمة',
                desc: 'إخفاء ملاحظة المجلد من الظهور في قائمة ملاحظات المجلد.'
            },
            pinCreatedFolderNote: {
                name: 'تثبيت ملاحظات المجلدات المنشأة',
                desc: 'تثبيت ملاحظات المجلدات تلقائيًا عند إنشائها من قائمة السياق.'
            },
            confirmBeforeDelete: {
                name: 'التأكيد قبل الحذف',
                desc: 'إظهار مربع حوار تأكيد عند حذف الملاحظات أو المجلدات'
            },
            interceptTagClicks: {
                name: 'الانتقال إلى الوسوم عند النقر',
                desc: 'عند النقر على الوسوم في الملاحظات، الانتقال إلى ذلك الوسم في متصفح الدفتر بدلاً من تشغيل بحث Obsidian.'
            },
            metadataCleanup: {
                name: 'تنظيف البيانات الوصفية',
                desc: 'إزالة البيانات الوصفية اليتيمة المتبقية عند حذف الملفات أو المجلدات أو الوسوم أو نقلها أو إعادة تسميتها خارج Obsidian. يؤثر هذا فقط على ملف إعدادات متصفح الدفتر.',
                buttonText: 'تنظيف البيانات الوصفية',
                error: 'فشل تنظيف الإعدادات',
                loading: 'جارٍ فحص البيانات الوصفية...',
                statusClean: 'لا توجد بيانات وصفية لتنظيفها',
                statusCounts: 'عناصر يتيمة: {folders} مجلدات، {tags} وسوم، {files} ملفات، {pinned} تثبيتات، {separators} فواصل'
            },
            rebuildCache: {
                name: 'إعادة بناء الذاكرة المؤقتة',
                desc: 'استخدم هذا إذا واجهت وسومًا مفقودة أو معاينات غير صحيحة أو صورًا مميزة مفقودة. يمكن أن يحدث هذا بعد تعارضات المزامنة أو الإغلاق غير المتوقع.',
                buttonText: 'إعادة بناء الذاكرة المؤقتة',
                success: 'تم إعادة بناء الذاكرة المؤقتة',
                error: 'فشل إعادة بناء الذاكرة المؤقتة',
                indexingTitle: 'جارٍ فهرسة الخزنة...',
                progress: 'جارٍ تحديث ذاكرة التخزين المؤقت لـ Notebook Navigator.'
            },
            hotkeys: {
                intro: 'حرر <plugin folder>/notebook-navigator/data.json لتخصيص اختصارات مفاتيح متصفح الدفتر. افتح الملف وحدد موقع قسم "keyboardShortcuts". يستخدم كل إدخال هذا الهيكل:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Shift',
                    '"Ctrl" = Control (يفضل "Mod" للتوافق عبر الأنظمة)'
                ],
                guidance:
                    'أضف تعيينات متعددة لدعم مفاتيح بديلة، مثل ربط ArrowUp و K الموضح أعلاه. ادمج المعدلات في إدخال واحد بسرد كل قيمة، مثل "modifiers": ["Mod", "Shift"]. تسلسلات لوحة المفاتيح مثل "gg" أو "dd" غير مدعومة. أعد تحميل Obsidian بعد تحرير الملف.'
            },
            externalIcons: {
                downloadButton: 'تنزيل',
                downloadingLabel: 'جارٍ التنزيل...',
                removeButton: 'إزالة',
                statusInstalled: 'تم التنزيل (الإصدار {version})',
                statusNotInstalled: 'غير منزل',
                versionUnknown: 'غير معروف',
                downloadFailed: 'فشل تنزيل {name}. تحقق من الاتصال وحاول مرة أخرى.',
                removeFailed: 'فشل إزالة {name}.',
                infoNote:
                    'حزم الأيقونات المنزلة تزامن حالة التثبيت عبر الأجهزة. تبقى حزم الأيقونات في قاعدة البيانات المحلية على كل جهاز؛ المزامنة تتبع فقط ما إذا كان يجب تنزيلها أو إزالتها. حزم الأيقونات تنزل من مستودع متصفح الدفتر (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterDates: {
                name: 'استخدام البيانات الأمامية',
                desc: 'استخدام البيانات الأمامية لاسم الملاحظة والطوابع الزمنية والأيقونات والألوان'
            },
            frontmatterIconField: {
                name: 'حقل الأيقونة',
                desc: 'حقل البيانات الأمامية لأيقونات الملفات. اتركه فارغًا لاستخدام الأيقونات المخزنة في الإعدادات.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'حقل اللون',
                desc: 'حقل البيانات الأمامية لألوان الملفات. اتركه فارغًا لاستخدام الألوان المخزنة في الإعدادات.',
                placeholder: 'color'
            },
            frontmatterSaveMetadata: {
                name: 'حفظ الأيقونات والألوان في البيانات الأمامية',
                desc: 'كتابة أيقونات وألوان الملفات تلقائيًا إلى البيانات الأمامية باستخدام الحقول المكونة أعلاه.'
            },
            frontmatterMigration: {
                name: 'ترحيل الأيقونات والألوان من الإعدادات',
                desc: 'مخزنة في الإعدادات: {icons} أيقونات، {colors} ألوان.',
                button: 'ترحيل',
                buttonWorking: 'جارٍ الترحيل...',
                noticeNone: 'لا توجد أيقونات أو ألوان ملفات مخزنة في الإعدادات.',
                noticeDone: 'تم ترحيل {migratedIcons}/{icons} أيقونات، {migratedColors}/{colors} ألوان.',
                noticeFailures: 'إدخالات فاشلة: {failures}.',
                noticeError: 'فشل الترحيل. تحقق من وحدة التحكم للتفاصيل.'
            },
            frontmatterNameField: {
                name: 'حقول الاسم',
                desc: 'قائمة حقول البيانات الأمامية مفصولة بفواصل. يُستخدم أول قيمة غير فارغة. يعود لاسم الملف.',
                placeholder: 'عنوان, اسم'
            },
            frontmatterCreatedField: {
                name: 'حقل طابع وقت الإنشاء',
                desc: 'اسم حقل البيانات الأمامية لطابع وقت الإنشاء. اتركه فارغًا لاستخدام تاريخ نظام الملفات فقط.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'حقل طابع وقت التعديل',
                desc: 'اسم حقل البيانات الأمامية لطابع وقت التعديل. اتركه فارغًا لاستخدام تاريخ نظام الملفات فقط.',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'تنسيق الطابع الزمني',
                desc: 'التنسيق المستخدم لتحليل الطوابع الزمنية في البيانات الأمامية. اتركه فارغًا لاستخدام تنسيق ISO 8601',
                helpTooltip: 'راجع وثائق تنسيق date-fns',
                help: "التنسيقات الشائعة:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'دعم التطوير',
                desc: 'إذا أحببت استخدام متصفح الدفتر، يرجى التفكير في دعم تطويره المستمر.',
                buttonText: '❤️ رعاية',
                coffeeButton: '☕️ اشترِ لي قهوة'
            },
            updateCheckOnStart: {
                name: 'التحقق من إصدار جديد عند البدء',
                desc: 'التحقق من إصدارات الإضافة الجديدة عند البدء وإظهار إشعار عند توفر تحديث. يتم الإعلان عن كل إصدار مرة واحدة فقط، والتحقق يحدث مرة واحدة يوميًا على الأكثر.',
                status: 'إصدار جديد متاح: {version}'
            },
            whatsNew: {
                name: 'الجديد في متصفح الدفتر {version}',
                desc: 'شاهد التحديثات والتحسينات الأخيرة',
                buttonText: 'عرض التحديثات الأخيرة'
            },
            masteringVideo: {
                name: 'إتقان Notebook Navigator (فيديو)',
                desc: 'يغطي هذا الفيديو كل ما تحتاجه لتكون منتجاً في Notebook Navigator، بما في ذلك اختصارات لوحة المفاتيح والبحث والوسوم والتخصيص المتقدم.'
            },
            cacheStatistics: {
                localCache: 'الذاكرة المؤقتة المحلية',
                items: 'عناصر',
                withTags: 'مع وسوم',
                withPreviewText: 'مع نص معاينة',
                withFeatureImage: 'مع صورة مميزة',
                withMetadata: 'مع بيانات وصفية'
            },
            metadataInfo: {
                successfullyParsed: 'تم التحليل بنجاح',
                itemsWithName: 'عناصر مع اسم',
                withCreatedDate: 'مع تاريخ الإنشاء',
                withModifiedDate: 'مع تاريخ التعديل',
                withIcon: 'مع أيقونة',
                withColor: 'مع لون',
                failedToParse: 'فشل التحليل',
                createdDates: 'تواريخ الإنشاء',
                modifiedDates: 'تواريخ التعديل',
                checkTimestampFormat: 'تحقق من تنسيق الطابع الزمني.',
                exportFailed: 'تصدير الأخطاء'
            }
        }
    },
    whatsNew: {
        title: 'الجديد في متصفح الدفتر',
        supportMessage: 'إذا وجدت متصفح الدفتر مفيدًا، يرجى التفكير في دعم تطويره.',
        supportButton: 'اشترِ لي قهوة',
        thanksButton: 'شكرًا!'
    }
};
