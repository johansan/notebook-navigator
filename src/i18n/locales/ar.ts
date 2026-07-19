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
        restoreDefault: 'استعادة الافتراضي', // Button text for restoring values to defaults (English: Restore default)
        submit: 'إرسال', // Button text for submitting forms and dialogs (English: Submit)
        save: 'حفظ', // Button text for saving settings and dialogs (English: Save)
        configure: 'تكوين', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'الوضع الفاتح', // Label for light theme mode (English: Light mode)
        darkMode: 'الوضع الداكن', // Label for dark theme mode (English: Dark mode)
        noSelection: 'لا يوجد تحديد', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'بدون وسم', // Label for notes without any tags (English: Untagged)
        featureImageAlt: 'صورة مميزة', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'خطأ غير معروف', // Generic fallback when an error has no message (English: Unknown error)
        clipboardWriteError: 'تعذرت الكتابة إلى الحافظة',
        updateBannerTitle: 'تحديث متصفح الدفتر متاح',
        updateBannerInstruction: 'قم بالتحديث في الإعدادات -> إضافات المجتمع',
        previous: 'السابق', // Generic aria label for previous navigation (English: Previous)
        next: 'التالي' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'اختر مجلدًا أو وسمًا لعرض الملاحظات', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'لا توجد ملاحظات', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'مثبت', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'ملاحظات', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'ملفات', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (مخفي)', // Accessibility label applied to list items that are normally hidden
        collapseGroup: 'طي المجموعة',
        expandGroup: 'توسيع المجموعة',
        manualSortTitle: 'فرز يدوي: {property}',
        manualSortHint: 'اسحب لإعادة الترتيب. يتم حفظ الترتيب كقيم رقمية للفهرس في الخاصية "{property}".',
        manualSortNonMarkdownHint: 'الملفات غير Markdown تظهر في الأسفل ولا يمكن إعادة ترتيبها.',
        unsortedSection: 'غير مرتبة',
        manualSortDone: 'تم',
        manualSortMultipleWriteFailure: 'فشل {count} من الملفات؛ الأول: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'بدون وسم', // Label for the special item showing notes without tags (English: Untagged)
        tags: 'وسوم' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'اختصارات', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentFilesHeader: 'ملفات حديثة', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'الخصائص',
        reorderRootFoldersTitle: 'إعادة ترتيب التنقل',
        reorderRootFoldersHint: 'استخدم الأسهم أو اسحب لإعادة الترتيب',
        vaultRootLabel: 'الخزنة',
        resetRootToAlpha: 'إعادة الترتيب الأبجدي',
        resetRootToFrequency: 'إعادة الترتيب حسب التكرار',
        pinShortcuts: 'تثبيت الاختصارات',
        pinShortcutsAndRecentFiles: 'تثبيت الاختصارات والملفات الحديثة',
        unpinShortcuts: 'إلغاء تثبيت الاختصارات',
        unpinShortcutsAndRecentFiles: 'إلغاء تثبيت الاختصارات والملفات الحديثة',
        profileMenuAria: 'تغيير ملف الخزنة'
    },

    navigationCalendar: {
        ariaLabel: 'التقويم',
        dailyNotesNotEnabled: 'إضافة الملاحظات اليومية غير مفعلة.',
        noteHiddenByProfile: 'ملاحظة التقويم مخفية بواسطة ملف تعريف الخزنة الحالي.',
        createDailyNote: {
            title: 'ملاحظة يومية جديدة',
            message: 'الملف {filename} غير موجود. هل تريد إنشاءه؟',
            confirmButton: 'إنشاء'
        },
        helpModal: {
            title: 'اختصارات التقويم',
            items: [
                'انقر على أي يوم لفتح أو إنشاء ملاحظة يومية. الأسابيع والأشهر والأرباع والسنوات تعمل بنفس الطريقة.',
                'نقطة ممتلئة أسفل اليوم تعني أنه يحتوي على ملاحظة. نقطة مفرغة تعني أنه يحتوي على مهام غير مكتملة.',
                'إذا كانت الملاحظة تحتوي على صورة مميزة، فإنها تظهر كخلفية لليوم.'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+انقر على تاريخ للتصفية حسب ذلك التاريخ في قائمة الملفات.',
            dateFilterOptionAlt: '`Option/Alt`+انقر على تاريخ للتصفية حسب ذلك التاريخ في قائمة الملفات.'
        }
    },

    dailyNotes: {
        templateReadFailed: 'فشل في قراءة قالب الملاحظة اليومية.',
        createFailed: 'تعذر إنشاء الملاحظة اليومية.'
    },

    shortcuts: {
        folderExists: 'المجلد موجود بالفعل في الاختصارات',
        noteExists: 'الملاحظة موجودة بالفعل في الاختصارات',
        tagExists: 'الوسم موجود بالفعل في الاختصارات',
        propertyExists: 'الخاصية موجودة بالفعل في الاختصارات',
        invalidProperty: 'اختصار خاصية غير صالح',
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
        showCalendar: 'عرض التقويم',
        hideCalendar: 'إخفاء التقويم',
        newFolder: 'مجلد جديد', // Tooltip for create new folder button (English: New folder)
        newNote: 'ملاحظة جديدة', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'العودة للتنقل', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeChildSortOrder: 'تغيير ترتيب الفرز',
        changeSortAndGroup: 'تغيير الفرز والتجميع',
        resetViewToDefaults: 'إعادة تعيين العرض إلى الإعدادات الافتراضية',
        manualSort: 'فرز يدوي',
        editSortOrder: 'تحرير ترتيب الفرز...',
        removeSortProperty: 'إزالة خاصية الفرز',
        descendants: 'العناصر الفرعية',
        subfolders: 'المجلدات الفرعية',
        subtags: 'الوسوم الفرعية',
        childValues: 'القيم الفرعية',
        applySortAndGroupToDescendants: (target: string) => `تطبيق الفرز والتجميع على ${target}`,
        applyAppearanceToDescendants: (target: string) => `تطبيق المظهر على ${target}`,
        showFolders: 'إظهار التنقل', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: 'إعادة ترتيب التنقل',
        finishRootFolderReorder: 'تم',
        showExcludedItems: 'إظهار المجلدات والوسوم والملاحظات المخفية', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'إخفاء المجلدات والوسوم والملاحظات المخفية', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'إظهار لوحتين', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'إظهار لوحة واحدة', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            'لا تتوفر اللوحتان عندما يكون الشريط الجانبي ضيقًا جدًا. لتغيير ذلك، اضبط "عندما يكون الشريط الجانبي ضيقًا جدًا" على "عدم فعل شيء" في الإعدادات > المظهر والسلوك.',
        changeAppearance: 'تغيير المظهر', // Tooltip for button to change folder appearance settings (English: Change appearance)
        showNotesFromSubfolders: 'إظهار الملاحظات من المجلدات الفرعية',
        showFilesFromSubfolders: 'إظهار الملفات من المجلدات الفرعية',
        showNotesFromDescendants: 'إظهار الملاحظات من الفروع',
        showFilesFromDescendants: 'إظهار الملفات من الفروع',
        search: 'بحث' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'بحث...', // Placeholder text for search input (English: Search...)
        placeholderVault: 'البحث في الخزنة...',
        placeholderOmnisearch: 'بحث شامل...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'مسح البحث', // Tooltip for clear search button (English: Clear search)
        switchToFilterSearch: 'التبديل إلى البحث بالتصفية',
        switchToOmnisearch: 'التبديل إلى Omnisearch',
        saveSearchShortcut: 'حفظ اختصار البحث',
        removeSearchShortcut: 'إزالة اختصار البحث',
        shortcutModalTitle: 'حفظ اختصار البحث',
        shortcutNamePlaceholder: 'أدخل اسم الاختصار',
        shortcutStartIn: 'البدء دائمًا في: {path}',
        searchHelp: 'صيغة البحث',
        searchHelpTitle: 'صيغة البحث',
        searchHelpModal: {
            intro: 'ادمج أسماء الملفات والخصائص والوسوم والتواريخ والمرشحات في استعلام واحد (مثال: `meeting .status=active #work @thisweek`). قم بتثبيت إضافة Omnisearch لاستخدام البحث في النص الكامل.',
            introSwitching: 'التبديل بين البحث بالتصفية و Omnisearch باستخدام مفاتيح الأسهم لأعلى/لأسفل أو بالنقر على أيقونة البحث.',
            sections: {
                fileNames: {
                    title: 'أسماء الملفات',
                    items: [
                        '`word` البحث عن ملاحظات تحتوي على "word" في اسم الملف.',
                        '`word1 word2` يجب أن تتطابق كل كلمة مع اسم الملف.',
                        '`-word` استبعاد الملاحظات التي تحتوي على "word" في اسم الملف.'
                    ]
                },
                tags: {
                    title: 'الوسوم',
                    items: [
                        '`#tag` تضمين الملاحظات ذات الوسم (يشمل أيضًا الوسوم الفرعية مثل `#tag/subtag`).',
                        '`#` تضمين الملاحظات ذات الوسوم فقط.',
                        '`-#tag` استبعاد الملاحظات ذات الوسم.',
                        '`-#` تضمين الملاحظات بدون وسوم فقط.',
                        '`#tag1 #tag2` مطابقة كلا الوسمين (AND ضمني).',
                        '`#tag1 AND #tag2` مطابقة كلا الوسمين (AND صريح).',
                        '`#tag1 OR #tag2` مطابقة أي من الوسمين.',
                        '`#a OR #b AND #c` AND له أولوية أعلى: يطابق `#a`، أو كلاً من `#b` و `#c`.',
                        'Cmd/Ctrl+النقر على وسم لإضافته مع AND. Cmd/Ctrl+Shift+النقر لإضافته مع OR.'
                    ]
                },
                properties: {
                    title: 'الخصائص',
                    items: [
                        '`.key` تضمين الملاحظات التي تحتوي على مفتاح خاصية.',
                        '`.key=value` تضمين الملاحظات التي تحتوي قيمة الخاصية فيها على `value`.',
                        '`."Reading Status"` تضمين الملاحظات التي تحتوي على مفتاح خاصية يتضمن مسافات.',
                        '`."Reading Status"="In Progress"` المفاتيح والقيم التي تحتوي على مسافات يجب وضعها بين علامات اقتباس مزدوجة.',
                        '`-.key` استبعاد الملاحظات التي تحتوي على مفتاح خاصية.',
                        '`-.key=value` استبعاد الملاحظات التي تحتوي قيمة الخاصية فيها على `value`.',
                        'Cmd/Ctrl+انقر على خاصية للإضافة بـ AND. Cmd/Ctrl+Shift+انقر للإضافة بـ OR.'
                    ]
                },
                tasks: {
                    title: 'المرشحات',
                    items: [
                        '`has:task` تضمين الملاحظات التي تحتوي على مهام غير مكتملة.',
                        '`-has:task` استبعاد الملاحظات التي تحتوي على مهام غير مكتملة.',
                        '`folder:meetings` تضمين الملاحظات حيث يحتوي اسم مجلد على `meetings`.',
                        '`folder:/work/meetings` تضمين الملاحظات فقط في `work/meetings` (بدون المجلدات الفرعية).',
                        '`folder:/` تضمين الملاحظات فقط في جذر الخزنة.',
                        '`-folder:archive` استبعاد الملاحظات حيث يحتوي اسم مجلد على `archive`.',
                        '`-folder:/archive` استبعاد الملاحظات فقط في `archive` (بدون المجلدات الفرعية).',
                        '`ext:md` تضمين الملاحظات ذات الامتداد `md` (`ext:.md` مدعوم أيضًا).',
                        '`-ext:pdf` استبعاد الملاحظات ذات الامتداد `pdf`.',
                        'دمج مع الوسوم والأسماء والتواريخ (على سبيل المثال: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'سلوك AND/OR',
                    items: [
                        '`AND` و `OR` هما عوامل تشغيل فقط في استعلامات الوسوم/الخصائص الحصرية.',
                        'استعلامات الوسوم/الخصائص الحصرية تحتوي فقط على مرشحات الوسوم والخصائص: `#tag`، `-#tag`، `#`، `-#`، `.key`، `-.key`، `.key=value`، `-.key=value`.',
                        'إذا تضمن الاستعلام أسماء أو تواريخ (`@...`) أو مرشحات مهام (`has:task`) أو مرشحات مجلدات (`folder:...`) أو مرشحات امتدادات (`ext:...`)، يتم مطابقة `AND` و `OR` ككلمات.',
                        'مثال على استعلام بعوامل تشغيل: `#work OR .status=started`.',
                        'مثال على استعلام مختلط: `#work OR ext:md` (يتم مطابقة `OR` في أسماء الملفات).'
                    ]
                },
                dates: {
                    title: 'التواريخ',
                    items: [
                        '`@today` البحث عن ملاحظات اليوم باستخدام حقل التاريخ الافتراضي.',
                        '`@yesterday`، `@last7d`، `@last30d`، `@thisweek`، `@thismonth` نطاقات تاريخ نسبية.',
                        '`@2026-02-07` البحث عن يوم محدد (يدعم أيضًا `@20260207`).',
                        '`@2026` البحث عن سنة تقويمية.',
                        '`@2026-02` أو `@202602` البحث عن شهر تقويمي.',
                        '`@2026-W05` أو `@2026W05` البحث عن أسبوع ISO.',
                        '`@2026-Q2` أو `@2026Q2` البحث عن ربع تقويمي.',
                        '`@13/02/2026` صيغ رقمية مع فواصل (`@07022026` يتبع إعدادات منطقتك عند الغموض).',
                        '`@2026-02-01..2026-02-07` البحث عن نطاق أيام شامل (النهايات المفتوحة مدعومة).',
                        '`@c:...` أو `@m:...` استهداف تاريخ الإنشاء أو التعديل.',
                        '`-@...` استبعاد مطابقة التاريخ.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'البحث في النص الكامل عبر الخزنة، مع التصفية حسب المجلد الحالي أو الوسوم المحددة.',
                        'قد يكون بطيئًا مع أقل من 3 أحرف في الخزن الكبيرة.',
                        'لا يمكنه البحث في المسارات التي تحتوي على أحرف غير ASCII أو البحث في المسارات الفرعية بشكل صحيح.',
                        'يعيد نتائج محدودة قبل تصفية المجلدات، لذا قد لا تظهر الملفات ذات الصلة إذا وُجدت مطابقات كثيرة في أماكن أخرى.',
                        'تعرض معاينات الملاحظات مقتطفات Omnisearch بدلاً من نص المعاينة الافتراضي.'
                    ]
                }
            }
        }
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
            openInDefaultApp: 'فتح في التطبيق الافتراضي',
            renameNote: 'إعادة تسمية الملاحظة',
            renameFile: 'إعادة تسمية الملف',
            deleteNote: 'حذف الملاحظة',
            deleteFile: 'حذف الملف',
            setCalendarHighlight: 'تعيين التمييز',
            removeCalendarHighlight: 'إزالة التمييز',
            deleteMultipleNotes: 'حذف {count} ملاحظة',
            deleteMultipleFiles: 'حذف {count} ملف',
            moveNoteToFolder: 'نقل الملاحظة إلى...',
            moveFileToFolder: 'نقل الملف إلى...',
            moveMultipleNotesToFolder: 'نقل {count} ملاحظة إلى...',
            moveMultipleFilesToFolder: 'نقل {count} ملف إلى...',
            mergeNotes: 'دمج {count} ملاحظة...',
            mergeNotesInGroup: 'دمج الملاحظات في المجموعة...',
            setManualSortGroupHeader: 'تعيين عنوان المجموعة',
            changeManualSortGroupHeader: 'تغيير عنوان المجموعة',
            manualSortGroupHeader: {
                title: 'عنوان المجموعة',
                copyStyle: 'نسخ نمط العنوان',
                pasteStyle: 'لصق نمط العنوان',
                remove: 'إزالة عنوان المجموعة'
            },
            addTag: 'إضافة وسم',
            addPropertyKey: 'تعيين خاصية',
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
            createFolderNote: 'إنشاء ملاحظة مجلد',
            detachFolderNote: 'فصل ملاحظة المجلد',
            deleteFolderNote: 'حذف ملاحظة المجلد',
            changeIcon: 'تغيير الأيقونة',
            changeColor: 'تغيير اللون',
            changeBackground: 'تغيير الخلفية',
            excludeFolder: 'إخفاء المجلد',
            unhideFolder: 'إظهار المجلد',
            excludeFromDescendants: 'إخفاء من المجلدات الأصلية',
            includeInDescendants: 'إظهار في المجلدات الأصلية',
            hiddenFromParentsIndicator: 'مخفى من قوائم المجلدات الأصلية',
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
        property: {
            addKey: 'تكوين مفاتيح الخصائص',
            renameKey: 'إعادة تسمية الخاصية',
            deleteKey: 'حذف الخاصية'
        },
        navigation: {
            addSeparator: 'إضافة فاصل',
            removeSeparator: 'إزالة الفاصل'
        },
        copyPath: {
            title: 'نسخ المسار',
            asObsidianUrl: 'كرابط Obsidian',
            fromVaultFolder: 'من مجلد الخزنة',
            fromSystemRoot: 'من جذر النظام'
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
        appearance: 'المظهر',
        sortBy: 'فرز حسب',
        standardPreset: 'قياسي',
        compactPreset: 'مضغوط',
        defaultSuffix: '(افتراضي)',
        defaultLabel: 'افتراضي',
        titleRows: 'صفوف العنوان',
        previewRows: 'صفوف المعاينة',
        groupBy: 'تجميع حسب',
        titleRowOption: (rows: number) => `${rows} صف عنوان`,
        previewRowOption: (rows: number) => `${rows} صف معاينة`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'تطبيق',
            applySortAndGroupTitle: (target: string) => `تطبيق الفرز والتجميع على ${target}؟`,
            applyAppearanceTitle: (target: string) => `تطبيق المظهر على ${target}؟`,
            affectedCountMessage: (count: number) => `التجاوزات الحالية التي ستتغير: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'استخدام الفرز اليدوي؟',
            propertySortMessage: (property: string, count: number) =>
                `يبدّل العرض الحالي إلى الفرز اليدوي باستخدام "${property}". تحرير الترتيب يكتب قيم فهرس رقمية إلى تلك الخاصية في ${count} ملاحظة حسب الحاجة.`,
            propertySortConfirmButton: 'استخدام الفرز اليدوي',
            removePropertyTitle: 'إزالة خاصية الفرز؟',
            removePropertyMessage: (property: string, count: number) =>
                `يؤدي هذا إلى إزالة "${property}" من ${count} ${count === 1 ? 'ملاحظة' : 'ملاحظة'} في القائمة الحالية. سيتم مسح ترتيب الفرز اليدوي لتلك الملاحظات.`,
            removePropertyConfirmButton: 'إزالة الخاصية',
            compactTitle: 'ضغط قيم الفهرس؟',
            compactMessage: (count: number) => `إعادة الترتيب هذه تحتاج إلى مساحة رقمية أكبر. ${count} ملاحظة ستحصل على قيم فهرس جديدة.`,
            compactConfirmButton: 'ضغط قيم الفهرس'
        },
        manualSortGroupHeader: {
            title: 'تعيين عنوان المجموعة',
            titleLabel: 'العنوان',
            placeholder: 'عنوان المجموعة',
            icon: 'الأيقونة',
            color: 'اللون',
            wordCount: 'إظهار عدد الكلمات',
            wordCountTarget: 'عدد الكلمات المستهدف',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'عندما يكون هذا الحقل فارغًا، يستخدم هدف المجموعة خاصية الهدف المحددة في الإعدادات > الملاحظات > عدد الكلمات والأحرف. يمكنك تجاوزه بتعيين قيمة هدف لهذه المجموعة.',
            description: 'خصص عنوان المجموعة لهذه الملاحظة. اترك العنوان فارغًا لإزالة العنوان.'
        },
        mergeNotes: {
            title: 'دمج الملاحظات',
            summary: 'إنشاء ملاحظة واحدة من {count} ملاحظة في {folder}.',
            frontmatterRule: 'يتم الاحتفاظ بالبيانات الأمامية من الملاحظة الأولى. تتم إزالة البيانات الأمامية من الملاحظات الأخرى.',
            crossFolderWarning: 'الملاحظات المصدر في مجلدات مختلفة. قد تتوقف الروابط والتضمينات النسبية عن العمل في الملاحظة المدمجة.',
            outputName: 'اسم الناتج',
            outputNameDesc: 'يتم إنشاء الملاحظة المدمجة في المجلد الموضح أعلاه.',
            outputNamePlaceholder: 'ملاحظات مدمجة',
            separator: 'فاصل',
            separatorDesc: 'يتم إدراجه بين الملاحظات.',
            separatorOptions: {
                none: 'لا شيء',
                blankLine: 'سطر فارغ',
                horizontalRule: 'خط أفقي',
                heading: 'عنوان باسم الملاحظة'
            },
            moveSourcesToTrash: 'نقل الملاحظات المصدر إلى سلة المهملات بعد الدمج',
            mergeButton: 'دمج'
        },
        navRainbowSection: {
            title: (section: string) => `ألوان قوس قزح: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'البحث عن أيقونات...',
            recentlyUsedHeader: 'المستخدمة مؤخرًا',
            emptyStateSearch: 'ابدأ الكتابة للبحث عن أيقونات',
            emptyStateNoResults: 'لم يتم العثور على أيقونات',
            showingResultsInfo: 'عرض 50 من {count} نتيجة. اكتب المزيد للتضييق.',
            emojiInstructions: 'اكتب أو الصق أي رمز تعبيري لاستخدامه كأيقونة',
            removeIcon: 'إزالة الأيقونة',
            removeFromRecents: 'إزالة من الأيقونات الأخيرة',
            allTabLabel: 'الكل'
        },
        fileIconRuleEditor: {
            addRuleAria: 'إضافة قاعدة'
        },
        interfaceIcons: {
            title: 'أيقونات الواجهة',
            fileItemsSection: 'عناصر الملفات',
            items: {
                'nav-shortcuts': 'الاختصارات',
                'nav-recent-files': 'الملفات الأخيرة',
                'nav-expand-all': 'توسيع الكل',
                'nav-collapse-all': 'طي الكل',
                'nav-calendar': 'التقويم',
                'nav-tree-expand': 'سهم الشجرة: توسيع',
                'nav-tree-collapse': 'سهم الشجرة: طي',
                'nav-hidden-items': 'العناصر المخفية',
                'nav-root-reorder': 'إعادة ترتيب المجلدات الجذرية',
                'nav-new-folder': 'مجلد جديد',
                'nav-show-single-pane': 'إظهار لوحة واحدة',
                'nav-show-dual-pane': 'إظهار لوحتين',
                'nav-profile-chevron': 'سهم قائمة الملف الشخصي',
                'list-search': 'بحث',
                'list-reveal-file': 'الكشف عن الملف',
                'list-descendants': 'ملاحظات من المجلدات الفرعية',
                'list-sort-ascending': 'ترتيب الفرز: تصاعدي',
                'list-sort-descending': 'ترتيب الفرز: تنازلي',
                'list-sort-modified': 'الفرز حسب تاريخ التعديل',
                'list-sort-created': 'الفرز حسب تاريخ الإنشاء',
                'list-sort-title': 'الفرز حسب العنوان',
                'list-sort-filename': 'الفرز حسب اسم الملف',
                'list-sort-property': 'الفرز حسب الخاصية',
                'list-appearance': 'تغيير المظهر',
                'list-new-note': 'ملاحظة جديدة',
                'list-pinned': 'الملاحظات المثبتة',
                'nav-folder-open': 'مجلد مفتوح',
                'nav-folder-closed': 'مجلد مغلق',
                'nav-tags': 'علامات',
                'nav-tag': 'وسم',
                'nav-properties': 'الخصائص',
                'nav-property': 'خاصية',
                'nav-property-value': 'قيمة',
                'file-unfinished-task': 'مهام غير مكتملة',
                'file-word-count': 'عدد الكلمات',
                'file-character-count': 'عدد الأحرف'
            }
        },
        colorPicker: {
            currentColor: 'الحالي',
            newColor: 'جديد',
            paletteDefault: 'افتراضي',
            paletteCustom: 'مخصص',
            copyColors: 'نسخ اللون',
            colorsCopied: 'تم نسخ اللون إلى الحافظة',
            pasteColors: 'لصق اللون',
            pasteClipboardError: 'تعذرت قراءة الحافظة',
            pasteInvalidFormat: 'متوقع قيمة لون hex',
            colorsPasted: 'تم لصق اللون بنجاح',
            resetUserColors: 'مسح الألوان المخصصة',
            clearCustomColorsConfirm: 'إزالة جميع الألوان المخصصة؟',
            userColorSlot: 'اللون {slot}',
            recentColors: 'ألوان حديثة',
            clearRecentColors: 'مسح الألوان الحديثة',
            removeRecentColor: 'إزالة اللون',
            apply: 'تطبيق',
            pickerLabel: 'المنتقي',
            hexLabel: 'HEX',
            hexInputLabel: 'قيمة اللون السداسية',
            saturationValueArea: 'التشبع والسطوع',
            hueSlider: 'تدرج اللون',
            alphaSlider: 'الشفافية'
        },
        appearance: {
            tabIcon: 'الأيقونة',
            tabColor: 'اللون',
            tabBackground: 'الخلفية',
            resetIcon: 'إزالة الأيقونة',
            resetColor: 'إزالة اللون',
            resetBackground: 'إزالة الخلفية',
            clear: 'مسح النمط',
            apply: 'تطبيق'
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
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            renameBatchNotFinalized:
                'تمت إعادة تسمية {renamed}/{total}. لم يتم التحديث: {notUpdated}. لم يتم تحديث البيانات الوصفية والاختصارات.',
            invalidTagName: 'أدخل اسم وسم صالح.',
            descendantRenameError: 'لا يمكن نقل الوسم إلى نفسه أو إلى فرع منه.',
            confirmDelete: 'حذف الوسم',
            deleteBatchNotFinalized:
                'تمت الإزالة من {removed}/{total}. لم يتم التحديث: {notUpdated}. لم يتم تحديث البيانات الوصفية والاختصارات.',
            checkConsoleForDetails: 'تحقق من وحدة التحكم للحصول على التفاصيل.',
            file: 'ملف',
            files: 'ملفات',
            inlineParsingWarning: {
                title: 'توافق الوسوم المضمّنة',
                message: 'يحتوي {tag} على أحرف لا يستطيع Obsidian تحليلها في الوسوم المضمّنة. لا تتأثر وسوم Frontmatter.',
                confirm: 'استخدام على أي حال'
            }
        },
        propertyOperation: {
            renameTitle: 'إعادة تسمية الخاصية {property}',
            deleteTitle: 'حذف الخاصية {property}',
            newKeyPrompt: 'اسم الخاصية الجديد',
            newKeyPlaceholder: 'أدخل اسم الخاصية الجديد',
            renameWarning: 'إعادة تسمية الخاصية {property} ستعدّل {count} {files}.',
            renameConflictWarning:
                'الخاصية {newKey} موجودة بالفعل في {count} {files}. إعادة تسمية {oldKey} ستستبدل القيم الحالية لـ {newKey}.',
            deleteWarning: 'حذف الخاصية {property} سيعدّل {count} {files}.',
            confirmRename: 'إعادة تسمية الخاصية',
            confirmDelete: 'حذف الخاصية',
            renameNoChanges: '{oldKey} → {newKey} (بدون تغييرات)',
            renameSettingsUpdateFailed: 'تمت إعادة تسمية الخاصية {oldKey} → {newKey}. فشل تحديث الإعدادات.',
            deleteSingleSuccess: 'تم حذف الخاصية {property} من ملاحظة واحدة',
            deleteMultipleSuccess: 'تم حذف الخاصية {property} من {count} ملاحظات',
            deleteSettingsUpdateFailed: 'تم حذف الخاصية {property}. فشل تحديث الإعدادات.',
            invalidKeyName: 'أدخل اسم خاصية صالح.'
        },
        fileSystem: {
            newFolderTitle: 'مجلد جديد',
            renameFolderTitle: 'إعادة تسمية المجلد',
            renameFileTitle: 'إعادة تسمية الملف',
            deleteFolderTitle: "حذف '{name}'؟",
            deleteFileTitle: "حذف '{name}'؟",
            deleteFileAttachmentsTitle: 'حذف مرفقات الملف؟',
            moveFileConflictTitle: 'تعارض النقل',
            folderNamePrompt: 'أدخل اسم المجلد:',
            hideInOtherVaultProfiles: 'إخفاء في ملفات الخزنة الأخرى',
            renamePrompt: 'أدخل الاسم الجديد:',
            renameVaultTitle: 'تغيير اسم عرض الخزنة',
            renameVaultPrompt: 'أدخل اسم العرض المخصص (اتركه فارغًا لاستخدام الافتراضي):',
            deleteFolderConfirm: 'هل أنت متأكد من حذف هذا المجلد وكل محتوياته؟',
            deleteFileConfirm: 'هل أنت متأكد من حذف هذا الملف؟',
            deleteFileAttachmentsDescriptionSingle: 'هذا المرفق لم يعد مستخدمًا في أي ملاحظات. هل تريد حذفه؟',
            deleteFileAttachmentsDescriptionMultiple: 'هذه المرفقات لم تعد مستخدمة في أي ملاحظات. هل تريد حذفها؟',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'شجرة الملفات',
            deleteFileAttachmentsViewGalleryAriaLabel: 'المعرض',
            moveFileConflictDescriptionSingle: 'تم العثور على تعارض ملف في "{folder}".',
            moveFileConflictDescriptionMultiple: 'تم العثور على {count} تعارضات ملفات في "{folder}".',
            moveFileConflictAffectedFiles: 'الملفات المتأثرة',
            moveFileConflictItem: '"{name}" -> "{suggested}"{renameOnly}',
            moveFileConflictRenameOnly: '(إعادة تسمية فقط)',
            moveFileConflictRename: 'إعادة التسمية',
            moveFileConflictOverwrite: 'الكتابة فوق',
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
        calendarTemplate: {
            placeholder: 'البحث عن القوالب...',
            instructions: {
                navigate: 'للتنقل',
                select: 'لتحديد القالب',
                dismiss: 'للإغلاق'
            }
        },
        navigationBanner: {
            placeholder: 'البحث عن صور...',
            svgMissingDimensions: 'ملف SVG المحدد لا يحدد عرضًا أو ارتفاعًا أو viewBox.',
            instructions: {
                navigate: 'للتنقل',
                select: 'لتعيين الشعار',
                dismiss: 'للإغلاق'
            }
        },
        tagSuggest: {
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
        propertySuggest: {
            placeholder: 'اختر مفتاح خاصية...',
            navigatePlaceholder: 'انتقل إلى خاصية...',
            instructions: {
                navigate: 'للتنقل',
                select: 'لإضافة خاصية',
                dismiss: 'للإغلاق'
            }
        },
        propertyKeyVisibility: {
            title: 'رؤية مفاتيح الخصائص',
            description:
                'التحكم في مكان عرض قيم الخصائص. تتوافق الأعمدة مع لوحة التنقل ولوحة القائمة وقائمة سياق الملف. استخدم الصف السفلي لتبديل جميع الصفوف في عمود.',
            searchPlaceholder: 'بحث في مفاتيح الخصائص...',
            propertyColumnLabel: 'خاصية',
            showInNavigation: 'إظهار في التنقل',
            showInList: 'إظهار في القائمة',
            showInFileMenu: 'إظهار في قائمة الملف',
            toggleAllInNavigation: 'تبديل الكل في التنقل',
            toggleAllInList: 'تبديل الكل في القائمة',
            toggleAllInFileMenu: 'تبديل الكل في قائمة الملف',
            applyButton: 'تطبيق',
            emptyState: 'لم يتم العثور على مفاتيح خصائص.'
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
            closeButton: 'ربما لاحقاً'
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
            deleteAttachments: 'فشل في حذف المرفقات: {error}',
            mergeNotes: 'فشل في دمج الملاحظات: {error}',
            mergeNotesOpenOutput: 'تم إنشاء الملاحظة المدمجة باسم {name}، لكن تعذر فتحها: {error}. لم يتم تغيير الملاحظات المصدر.',
            mergeNotesOpenSkipped: 'أخذ طلب آخر لفتح ملف الأولوية.',
            mergeNotesTrashSources: 'تم إنشاء الملاحظة المدمجة. فشل نقل {count} ملاحظة مصدر إلى سلة المهملات.',
            duplicateNote: 'فشل تكرار الملاحظة: {error}',
            duplicateFolder: 'فشل تكرار المجلد: {error}',
            openVersionHistory: 'فشل فتح سجل الإصدارات: {error}',
            versionHistoryNotFound: 'لم يتم العثور على أمر سجل الإصدارات. تأكد من تمكين Obsidian Sync.',
            revealInExplorer: 'فشل الكشف عن الملف في مستكشف النظام: {error}',
            openInDefaultApp: 'فشل الفتح في التطبيق الافتراضي: {error}',
            openInDefaultAppNotAvailable: 'الفتح في التطبيق الافتراضي غير متاح على هذه المنصة',
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
            showFolder: 'تم إظهار المجلد: {name}',
            folderExcludedFromDescendants: 'مخفى من قوائم المجلدات الأصلية: {name}',
            folderIncludedInDescendants: 'ظاهر في قوائم المجلدات الأصلية: {name}',
            mergeNotes: 'تم دمج {count} ملاحظة في {name}'
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
            mergeNotesRequireMultipleMarkdown: 'حدد ملاحظتي Markdown على الأقل للدمج',
            tagOperationsNotAvailable: 'عمليات الوسوم غير متاحة',
            propertyOperationsNotAvailable: 'عمليات الخصائص غير متاحة',
            tagsRequireMarkdown: 'الوسوم مدعومة فقط على ملاحظات Markdown',
            propertiesRequireMarkdown: 'الخصائص مدعومة فقط في ملاحظات Markdown',
            propertySetOnNote: 'تم تحديث الخاصية في ملاحظة واحدة',
            propertySetOnNotes: 'تم تحديث الخاصية في {count} ملاحظات',
            manualSortPropertyRemovedFromNote: 'تمت إزالة خاصية الفرز من ملاحظة واحدة',
            manualSortPropertyRemovedFromNotes: 'تمت إزالة خاصية الفرز من {count} ملاحظات',
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
            untitled: 'بدون عنوان'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'لا يمكن نقل مجلد إلى نفسه أو إلى مجلد فرعي.',
            itemAlreadyExists: 'عنصر باسم "{name}" موجود بالفعل في هذا الموقع.',
            failedToMove: 'فشل النقل: {error}',
            failedToAddTag: 'فشل إضافة الوسم "{tag}"',
            failedToSetProperty: 'فشل في تحديث الخاصية: {error}',
            failedToClearTags: 'فشل مسح الوسوم',
            failedToMoveFolder: 'فشل نقل المجلد "{name}"',
            failedToImportFiles: 'فشل الاستيراد: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} ملفات موجودة بالفعل في الوجهة',
            filesAlreadyHaveTag: '{count} ملفات تحتوي بالفعل على هذا الوسم أو وسم أكثر تحديدًا',
            filesAlreadyHaveProperty: '{count} ملفات تحتوي بالفعل على هذه الخاصية',
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

    // Plugin commands
    commands: {
        open: 'فتح', // Command palette: Opens the Notebook Navigator view (English: Open)
        toggleLeftSidebar: 'تبديل الشريط الجانبي الأيسر', // Command palette: Toggles left sidebar, opening Notebook Navigator when uncollapsing (English: Toggle left sidebar)
        openHomepage: 'فتح الصفحة الرئيسية', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        openDailyNote: 'فتح الملاحظة اليومية',
        openWeeklyNote: 'فتح الملاحظة الأسبوعية',
        openMonthlyNote: 'فتح الملاحظة الشهرية',
        openQuarterlyNote: 'فتح الملاحظة الفصلية',
        openYearlyNote: 'فتح الملاحظة السنوية',
        revealFile: 'الكشف عن الملف', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'بحث', // Command palette: Toggle search in the file list (English: Search)
        searchVaultRoot: 'البحث في الخزنة بالكامل', // Command palette: Selects the vault root folder and focuses search with subfolders included (English: Search whole vault)
        toggleDualPane: 'تبديل تخطيط اللوحتين', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        toggleDualPaneOrientation: 'تبديل اتجاه اللوحتين', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'تبديل التقويم', // Command palette: Toggles showing the calendar overlay in the navigation pane (English: Toggle calendar)
        selectVaultProfile: 'اختيار ملف الخزنة', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'اختيار ملف الخزنة 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'اختيار ملف الخزنة 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'اختيار ملف الخزنة 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'حذف الملفات', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'إنشاء ملاحظة جديدة', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'ملاحظة جديدة من قالب', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'نقل الملفات', // Command palette: Move selected files to another folder (English: Move files)
        mergeNotes: 'دمج الملاحظات', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'تحديد الملف التالي', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'تحديد الملف السابق', // Command palette: Selects the previous file in the current view (English: Select previous file)
        navigateBack: 'الانتقال للخلف',
        navigateForward: 'الانتقال للأمام',
        convertToFolderNote: 'تحويل إلى ملاحظة مجلد', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'تعيين كملاحظة مجلد', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'فصل ملاحظة المجلد', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'تثبيت جميع ملاحظات المجلدات', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'الانتقال إلى مجلد', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'الانتقال إلى وسم', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        navigateToProperty: 'الانتقال إلى خاصية', // Command palette: Navigate to a property key or value using fuzzy search (English: Navigate to property)
        addShortcut: 'إضافة إلى الاختصارات', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: 'فتح الاختصار {number}',
        toggleDescendants: 'تبديل الفروع', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'تبديل المجلدات والوسوم والملاحظات المخفية', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'تبديل ترتيب فرز الوسوم', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: 'تبديل الوسوم حسب التحديد',
        togglePropertiesBySelection: 'تبديل الخصائص حسب التحديد',
        toggleCompactMode: 'تبديل الوضع المضغوط', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'تبديل قسم المثبتة',
        collapseExpand: 'طي / توسيع جميع العناصر', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        collapseExpandSelectedItem: 'طي / توسيع العنصر المحدد',
        addTag: 'إضافة وسم للملفات المحددة', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        setProperty: 'تعيين خاصية على الملفات المحددة', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'إزالة وسم من الملفات المحددة', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'إزالة جميع الوسوم من الملفات المحددة', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        openAllFiles: 'فتح جميع الملفات', // Command palette: Opens all files in the current folder or tag (English: Open all files)
        rebuildCache: 'إعادة بناء الذاكرة المؤقتة', // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
        restoreDefaultSettings: 'استعادة الإعدادات الافتراضية' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'متصفح الدفتر', // Name shown in the view header/tab (English: Notebook Navigator)
        calendarViewName: 'تقويم', // Name shown in the view header/tab (English: Calendar)
        folderNoteSidebarViewName: 'ملاحظة المجلد', // Name shown in the folder note sidebar tab (English: Folder note)
        ribbonTooltip: 'متصفح الدفتر', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'الكشف في متصفح الدفتر', // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
        settingsUnavailableNotice:
            'تعذر على متصفح الدفتر قراءة إعداداته ولم يبدأ التشغيل. إذا كان القبو قيد المزامنة، أعد تشغيل Obsidian بعد اكتمال المزامنة. للبدء من جديد بالإعدادات الافتراضية، شغّل الأمر "استعادة الإعدادات الافتراضية".', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsRecovery: {
            confirmTitle: 'استعادة الإعدادات الافتراضية', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'يستبدل هذا ملف إعدادات متصفح الدفتر بالإعدادات الافتراضية. إذا كان القبو لا يزال قيد المزامنة، فقد تحل الإعدادات الافتراضية المستعادة محل الإعدادات المخزنة على أجهزتك الأخرى. يتم أولاً نسخ ملف الإعدادات القابل للقراءة إلى نسخة احتياطية مؤرخة في مجلد الإضافة.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'استعادة الافتراضية', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: 'تعذر إكمال استعادة الإعدادات. تم الاحتفاظ بالتفضيلات المحلية.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'تمت استعادة الإعدادات الافتراضية. أعد تشغيل Obsidian للإنهاء.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'آخر تعديل في',
        createdAt: 'تاريخ الإنشاء',
        file: 'ملف',
        files: 'ملفات',
        folder: 'مجلد',
        folders: 'مجلدات',
        wordCount: 'عدد الكلمات'
    },

    fileCounts: {
        words: '{count} كلمة',
        characters: '{count} حرفاً',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'تغيير الإعدادات الافتراضية',
        metadataReport: {
            exportSuccess: 'تم تصدير تقرير البيانات الوصفية الفاشلة إلى: {filename}',
            exportFailed: 'فشل تصدير تقرير البيانات الوصفية'
        },
        sections: {
            general: 'عام',
            vaultFilters: 'مرشحات العرض',
            appearanceBehavior: 'المظهر والسلوك',
            navigationPane: 'لوحة التنقل',
            calendar: 'التقويم',
            fileOperations: 'عمليات الملفات',
            icons: 'حزم الأيقونات',
            folders: 'مجلدات',
            folderNotes: 'ملاحظات المجلد',
            folderNoteFiles: 'ملفات ملاحظات المجلد',
            foldersAndFolderNotes: 'المجلدات وملاحظات المجلد',
            tagsAndProperties: 'الوسوم والخصائص',
            tags: 'وسوم',
            listPane: 'لوحة القائمة',
            notes: 'عرض الملفات',
            shortcutsAndRecentFiles: 'الاختصارات والملفات الأخيرة',
            advanced: 'متقدم'
        },
        pageGroups: {
            configuration: 'التكوين',
            navigationAndContent: 'لوحة التنقل',
            notesAndLists: 'لوحة القائمة',
            calendarAndTools: 'التقويم والأدوات'
        },
        pageDescriptions: {
            general: 'ملاحظات الإصدار والدعم وملف الخزنة وأنواع الملفات ومفاتيح الخصائص.',
            vaultFilters: 'المجلدات والوسوم والملفات ووسوم الملفات وقواعد الخصائص المخفية.',
            appearanceBehavior: 'السلوك والتنقل بلوحة المفاتيح وأزرار الفأرة والمظهر والتنسيق.',
            navigationPane: 'التخطيط والمظهر وعدد الملاحظات وسلوك الطي وألوان قوس قزح.',
            shortcuts: 'رؤية الاختصارات والشارات والملفات الأخيرة والعناصر المثبتة.',
            calendar: 'عرض التقويم وملاحظات التاريخ والقوالب والإعدادات المحلية وموضع الشريط الجانبي.',
            fileOperations: 'قوالب، تأكيدات الحذف والمرفقات وسلوك تعارض نقل الملفات.',
            foldersAndFolderNotes: 'عرض المجلدات وملاحظات المجلد وقوالب ملاحظات المجلد وسلوك ملاحظات المجلد.',
            tagsProperties: 'أقسام الوسوم والخصائص والأيقونات والفرز والنطاق والوراثة.',
            listPane: 'الفرز والتجميع وأوضاع القائمة والملاحظات المثبتة ومعاينات الرسومات.',
            frontmatter: 'حقول البيانات الأمامية لأسماء العرض والطوابع الزمنية والأيقونات والألوان.',
            notes: 'العناوين ونص المعاينة والصور المميزة والوسوم والخصائص والتواريخ وعدد الكلمات وعدد الأحرف.',
            iconPacks: 'أيقونات الواجهة وأيقونات الملفات وإدارة حزم الأيقونات.',
            advanced: 'التشخيص وتنظيف البيانات الوصفية والاستيراد/التصدير وإعادة التعيين.'
        },
        groups: {
            general: {
                vaultConfiguration: 'إعداد الخزنة',
                templates: 'قوالب',
                behavior: 'السلوك',
                startup: 'بدء التشغيل',
                keyboardNavigation: 'التنقل بلوحة المفاتيح',
                mouseButtons: 'أزرار الفأرة',
                view: 'المظهر',
                icons: 'الأيقونات',
                desktopAppearance: 'مظهر سطح المكتب',
                mobileAppearance: 'مظهر الهاتف المحمول',
                formatting: 'التنسيق'
            },
            advanced: {
                maintenance: 'الصيانة',
                resetSettings: 'إعادة ضبط الإعدادات'
            },
            navigation: {
                appearance: 'المظهر',
                banner: 'اللافتة',
                collapseItems: 'طي العناصر',
                dragAndDrop: 'السحب والإفلات',
                noteCounts: 'عدد الملاحظات',
                rainbowColors: 'ألوان قوس قزح',
                leftSidebar: 'الشريط الجانبي الأيسر',
                calendarIntegration: 'تكامل التقويم'
            },
            list: {
                display: 'المظهر',
                groupHeaders: 'رؤوس المجموعات',
                propertySort: 'الفرز حسب الخاصية',
                manualSort: 'الفرز اليدوي',
                pinnedNotes: 'الملاحظات المثبتة',
                drawingPreviews: 'معاينات الرسومات'
            },
            notes: {
                frontmatter: 'حقول البيانات الأمامية',
                tasks: 'المهام',
                icon: 'الأيقونة',
                title: 'العنوان',
                previewText: 'نص المعاينة',
                featureImage: 'الصورة المميزة',
                tags: 'الوسوم',
                properties: 'الخصائص',
                date: 'التاريخ',
                parentFolder: 'المجلد الأصلي',
                wordCount: 'عدد الكلمات والأحرف'
            }
        },
        syncMode: {
            notSynced: '(غير متزامن)',
            switchToSynced: 'تفعيل المزامنة',
            switchToLocal: 'تعطيل المزامنة'
        },
        items: {
            listPaneTitle: {
                name: 'عنوان لوحة القائمة',
                desc: 'اختر مكان عرض عنوان لوحة القائمة.',
                options: {
                    header: 'إظهار في الرأس',
                    list: 'إظهار في لوحة القائمة',
                    hidden: 'عدم الإظهار'
                }
            },
            sortNotesBy: {
                name: 'ترتيب الفرز الافتراضي',
                desc: 'اختر ترتيب الفرز الافتراضي للملاحظات.',
                options: {
                    'modified-desc': 'تاريخ التعديل (الأحدث في الأعلى)',
                    'modified-asc': 'تاريخ التعديل (الأقدم في الأعلى)',
                    'created-desc': 'تاريخ الإنشاء (الأحدث في الأعلى)',
                    'created-asc': 'تاريخ الإنشاء (الأقدم في الأعلى)',
                    'title-asc': 'العنوان (أ في الأعلى)',
                    'title-desc': 'العنوان (ي في الأعلى)',
                    'filename-asc': 'اسم الملف (أ في الأعلى)',
                    'filename-desc': 'اسم الملف (ي في الأعلى)'
                },
                directions: {
                    asc: 'تصاعدي',
                    desc: 'تنازلي'
                },
                fields: {
                    modified: 'تاريخ التعديل',
                    created: 'تاريخ الإنشاء',
                    title: 'العنوان',
                    filename: 'اسم الملف',
                    property: 'الخاصية'
                }
            },
            propertySortKey: {
                name: 'الخصائص للترتيب حسبها',
                desc: 'خصائص الواجهة الأمامية مفصولة بفواصل تُعرض كخيارات للفرز حسب الخاصية. يتم دمج قيم المصفوفات في سلسلة واحدة. هذه الخصائص لا يتم تغييرها.',
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: 'الترتيب الثانوي',
                desc: 'يُستخدم مع ترتيب الخاصية عندما تكون للملاحظات نفس قيمة الخاصية أو بدون قيمة خاصية.',
                options: {
                    title: 'العنوان',
                    filename: 'اسم الملف',
                    created: 'تاريخ الإنشاء',
                    modified: 'تاريخ التعديل'
                }
            },
            propertySortInstructions: {
                intro: 'تظهر كل خاصية مدرجة أعلاه كخيار فرز في قائمة الفرز في لوحة القائمة. اختيار إحداها يفرز الملاحظات حسب قيمتها في الواجهة الأمامية.'
            },
            manualSortPropertyKey: {
                name: 'خاصية الفرز اليدوي',
                desc: 'خاصية الواجهة الأمامية المستخدمة لتخزين قيم الفهرس الرقمية للفرز اليدوي.'
            },
            manualSortGroupHeaderProperty: {
                name: 'خاصية عنوان المجموعة',
                desc: 'خاصية الواجهة الأمامية المستخدمة لتخزين رؤوس المجموعات المخصصة.'
            },
            groupHeadersInstructions: {
                intro: 'تظهر رؤوس المجموعات المخصصة أعلى الملاحظات في لوحة القائمة.',
                items: [
                    'من قائمة الفرز في لوحة القائمة، اضبط التجميع على **مخصص**.',
                    'انقر بزر الفأرة الأيمن على ملاحظة واختر **تعيين عنوان المجموعة** لإضافة عنوان فوقها.'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'موضع الملاحظة الجديدة',
                desc: 'اختر مكان وضع الملاحظات الجديدة عندما تستخدم القائمة الحالية الفرز اليدوي.',
                options: {
                    top: 'الأعلى',
                    bottom: 'الأسفل',
                    'below-selected-note': 'أسفل الملاحظة المحددة',
                    unsorted: 'غير مرتبة'
                }
            },
            confirmBeforeManualSort: {
                name: 'تأكيد قبل الفرز اليدوي',
                desc: 'إظهار تحذير قبل كتابة خاصية الفرز اليدوي في الملاحظات للمرة الأولى. عند التعطيل، تتلقى الملاحظات الخاصية دون تحذير.'
            },
            manualSortInstructions: {
                intro: 'يكتب الفرز اليدوي قيمة فهرس رقمية إلى خاصية الواجهة الأمامية على كل ملاحظة. تظهر الملاحظات بدون فهرس ضمن "غير مرتبة".',
                items: [
                    'فعّل الفرز اليدوي باختيار **فرز يدوي** من قائمة الفرز. بعد ذلك، توجد طريقتان لإعادة ترتيب الملاحظات.',
                    'اختر **تحرير ترتيب الفرز...** من قائمة الفرز لفتح عرض إعادة الترتيب. اسحب الملاحظات بالفأرة، أو باللمس على الجوال. على سطح المكتب، النقر مع **Cmd/Ctrl** أو **Shift** يحدد عدة ملاحظات، ثم سحب أي منها ينقل المجموعة بأكملها.',
                    'في لوحة القائمة، حدد ملاحظة واحدة أو حدد عدة ملاحظات، ثم اضغط **Cmd/Ctrl + Arrow Up/Down** لنقل التحديد لأعلى أو لأسفل.'
                ]
            },
            revealFileOnListChanges: {
                name: 'التمرير إلى الملف المحدد عند تغيير القائمة',
                desc: 'التمرير إلى الملف المحدد عند تثبيت الملاحظات، أو إظهار ملاحظات الفروع، أو تغيير مظهر المجلد، أو تنفيذ عمليات الملفات.'
            },
            includeDescendantNotes: {
                name: 'إظهار ملاحظات المجلدات الفرعية / الفروع',
                desc: 'تضمين الملاحظات من المجلدات الفرعية المتداخلة وفروع الوسوم والخصائص عند عرض مجلد أو وسم أو خاصية.'
            },
            limitPinnedToCurrentFolder: {
                name: 'تثبيت الملاحظات في مجلدها فقط',
                desc: 'تظهر الملاحظات المثبتة كمثبتة فقط في مجلدها الخاص. مفيد لملاحظات المجلدات أو إذا كان لديك العديد من الملاحظات المثبتة. لا يؤثر على عروض الوسوم أو الخصائص.'
            },
            separateNoteCounts: {
                name: 'إظهار عدد الملاحظات الحالية والفرعية بشكل منفصل',
                desc: 'عرض عدد الملاحظات بتنسيق "الحالي ▾ الفروع" في المجلدات والوسوم والخصائص.'
            },
            groupNotes: {
                name: 'التجميع الافتراضي',
                desc: 'يعرض "مخصص" الرؤوس المعرفة في الواجهة الأمامية. يجمع "التاريخ" الملاحظات حسب التاريخ. يجمع "المجلد" الملاحظات حسب المجلد. تستخدم عروض الوسوم والخصائص تجميع التاريخ عند تحديد المجلد.',
                options: {
                    custom: 'مخصص',
                    date: 'التاريخ',
                    folder: 'المجلد'
                }
            },
            showSelectedNavigationPills: {
                name: 'إظهار جميع شارات الوسوم والخصائص دائمًا',
                desc: 'عند التعطيل، يتم إخفاء الشارات التي تتطابق مع اختيار التنقل الحالي (مثلاً، يتم إخفاء شارة وسم "وصفات" عند تصفح وسم "وصفات"). قم بالتفعيل لإبقاء جميع الشارات مرئية.'
            },
            stickyGroupHeaders: {
                name: 'تثبيت رؤوس المجموعات',
                desc: 'إبقاء رأس قسم التاريخ أو المجلد أو القسم المثبت الحالي مرئيًا أثناء التمرير.'
            },
            showFolderGroupPaths: {
                name: 'إظهار مسارات المجلدات الفرعية',
                desc: 'عند التجميع حسب المجلد في لوحة القائمة، اعرض مسارات المجلدات الفرعية بدلاً من أسماء المجلدات فقط.'
            },
            showGroupHeaderItemCounts: {
                name: 'إظهار عدد العناصر',
                desc: 'عرض عدد العناصر في كل رأس مجموعة في لوحة القائمة.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'تجميع المجلدات: ملفات المجلد الحالي في الأسفل',
                desc: 'عندما يكون التجميع الافتراضي هو المجلد، انقل الملفات الموجودة مباشرة في المجلد المحدد أسفل مجموعات المجلدات الفرعية.'
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
                desc: 'عرض أيقونات الملفات مع مسافة محاذاة لليسار. التعطيل يزيل الأيقونات والمسافة البادئة. الأولوية: أيقونة المهام غير المكتملة > أيقونة مخصصة > أيقونة المجلد > أيقونة اسم الملف > أيقونة نوع الملف > أيقونة افتراضية.'
            },
            useFolderIcon: {
                name: 'استخدام أيقونة المجلد',
                desc: 'عرض أيقونة المجلد الأصلي عند عدم تعيين أيقونة ملف مخصصة. يُستخدم لون المجلد عند عدم تعيين لون ملف مخصص.'
            },
            showFileIconUnfinishedTask: {
                name: 'أيقونة المهام غير المكتملة',
                desc: 'عرض أيقونة مهمة عندما تحتوي الملاحظة على مهام غير مكتملة.'
            },
            showFileBackgroundUnfinishedTask: {
                name: 'خلفية المهام غير المكتملة',
                desc: 'تطبيق لون خلفية عندما تحتوي الملاحظة على مهام غير مكتملة.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'لون خلفية المهام غير المكتملة',
                desc: 'تعيين لون الخلفية المستخدم عندما تحتوي الملاحظة على مهام غير مكتملة.'
            },
            showFilenameMatchIcons: {
                name: 'أيقونات حسب اسم الملف',
                desc: 'تعيين أيقونات للملفات بناءً على النص في أسمائها.'
            },
            fileNameIconMap: {
                name: 'خريطة أيقونات اسم الملف',
                desc: 'الملفات التي تحتوي على النص تحصل على الأيقونة المحددة. تعيين واحد لكل سطر: نص=أيقونة',
                placeholder: '# نص=أيقونة\nاجتماع=ph-calendar\nفاتورة=ph-receipt',
                editTooltip: 'تعديل التعيينات'
            },
            showCategoryIcons: {
                name: 'أيقونات حسب نوع الملف',
                desc: 'تعيين أيقونات للملفات بناءً على امتدادها.'
            },
            fileTypeIconPreset: {
                name: 'إعداد أيقونات الملفات المسبق',
                desc: 'اختر الأيقونات المدمجة أو إعدادًا مسبقًا لحزمة أيقونات. تتجاوز قواعد الامتدادات المخصصة هذا الإعداد المسبق.',
                options: {
                    none: 'الأيقونات المدمجة'
                },
                notInstalledWarning: 'حزمة الأيقونات هذه غير مثبتة. تُعرض الأيقونات المدمجة بدلاً منها.'
            },
            fileTypeIconMap: {
                name: 'خريطة أيقونات نوع الملف',
                desc: 'الملفات ذات الامتداد تحصل على الأيقونة المحددة. تعيين واحد لكل سطر: امتداد=أيقونة',
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'تعديل التعيينات'
            },
            compactItemHeight: {
                name: 'ارتفاع العنصر المضغوط',
                desc: 'تعيين ارتفاع عناصر القائمة المضغوطة على سطح المكتب والجوال (بالبكسل).',
                resetTooltip: 'استعادة إلى الافتراضي (28 بكسل)'
            },
            compactItemHeightScaleText: {
                name: 'تحجيم النص مع ارتفاع العنصر المضغوط',
                desc: 'تحجيم نص القائمة المضغوطة عند تقليل ارتفاع العنصر.'
            },
            showParentFolder: {
                name: 'إظهار المجلد الأصلي',
                desc: 'عرض مسار المجلد الأصلي للملاحظات في المجلدات الفرعية أو الوسوم أو الخصائص.'
            },
            parentFolderClickRevealsFile: {
                name: 'النقر على المجلد الأصلي يفتح المجلد',
                desc: 'النقر على تسمية المجلد الأصلي يفتح المجلد في لوحة القائمة.'
            },
            showParentFolderColor: {
                name: 'إظهار لون المجلد الأصلي',
                desc: 'استخدام ألوان المجلدات على تسميات المجلد الأصلي.'
            },
            showParentFolderIcon: {
                name: 'إظهار أيقونة المجلد الأصلي',
                desc: 'إظهار أيقونات المجلدات بجانب تسميات المجلد الأصلي.'
            },
            showQuickActions: {
                name: 'إظهار الإجراءات السريعة',
                desc: 'إظهار أزرار الإجراءات عند التمرير فوق الملفات. أدوات التحكم في الأزرار تحدد الإجراءات التي تظهر.'
            },
            dualPane: {
                name: 'تخطيط اللوحتين',
                desc: 'إظهار لوحة التنقل ولوحة القائمة جنبًا إلى جنب على سطح المكتب.'
            },
            dualPaneOrientation: {
                name: 'اتجاه اللوحتين',
                desc: 'اختر التخطيط الأفقي أو الرأسي عند تنشيط اللوحتين.',
                options: {
                    horizontal: 'تقسيم أفقي',
                    vertical: 'تقسيم رأسي'
                }
            },
            narrowSidebarLayout: {
                name: 'عندما يكون الشريط الجانبي ضيقًا جدًا',
                desc: 'اختر ما يحدث عندما لا تتسع لوحة التنقل ولوحة القائمة جنبًا إلى جنب.',
                options: {
                    none: 'عدم فعل شيء',
                    singlePane: 'التبديل إلى لوحة واحدة',
                    vertical: 'التبديل إلى تقسيم عمودي'
                }
            },
            narrowSidebarTrigger: {
                name: 'حد الشريط الجانبي الضيق',
                desc: 'اختر كيفية حساب حد عرض الشريط الجانبي.',
                options: {
                    fitPanes: 'ملاءمة اللوحات',
                    customWidth: 'عرض مخصص'
                }
            },
            narrowSidebarCustomWidth: {
                name: 'عرض حد الشريط الجانبي الضيق',
                desc: 'يتم التبديل عندما يكون الشريط الجانبي أضيق من هذا العرض.',
                resetTooltip: 'إعادة التعيين إلى العرض الافتراضي'
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
                name: 'مستوى التكبير',
                desc: 'التحكم في مستوى التكبير العام لمتصفح الدفتر (بالنسبة المئوية).'
            },
            useFloatingToolbars: {
                name: 'استخدام أشرطة الأدوات العائمة على iOS/iPadOS',
                desc: 'ينطبق فقط على iOS وiPadOS.'
            },
            startView: {
                name: 'عرض البدء الافتراضي',
                desc: 'اختر اللوحة النشطة عند فتح متصفح الدفتر. في تخطيط اللوحة الواحدة تظهر هذه اللوحة أولًا، وفي تخطيط اللوحتين تحصل على تركيز لوحة المفاتيح.',
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
            createNewNotesInNewTab: {
                name: 'فتح الملاحظات الجديدة في علامة تبويب جديدة',
                desc: 'عند التفعيل، يفتح أمر إنشاء ملاحظة جديدة الملاحظات في علامة تبويب جديدة. عند التعطيل، تحل الملاحظات محل علامة التبويب الحالية.'
            },
            autoRevealActiveNote: {
                name: 'الكشف التلقائي عن الملاحظة النشطة',
                desc: 'الكشف تلقائيًا عن الملاحظات عند فتحها من المبدل السريع أو الروابط أو البحث.'
            },
            autoRevealShortestPath: {
                name: 'الكشف التلقائي: استخدام أقصر مسار',
                desc: 'مفعّل: يختار الكشف التلقائي أقرب مجلد أصل أو وسم مرئي. معطّل: يختار الكشف التلقائي المجلد الفعلي للملف والوسم الدقيق.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'الكشف التلقائي: تجاهل الأحداث من الشريط الجانبي الأيمن',
                desc: 'عدم تغيير الملاحظة النشطة عند النقر أو تغيير الملاحظات في الشريط الجانبي الأيمن.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'الكشف التلقائي: تجاهل الأحداث من النوافذ الأخرى',
                desc: 'عدم تغيير الملاحظة النشطة عند العمل مع الملاحظات في نافذة أخرى.'
            },
            paneTransitionDuration: {
                name: 'تحريك اللوحة المفردة',
                desc: 'مدة الانتقال عند التبديل بين اللوحات في وضع اللوحة المفردة (ملي ثانية).',
                resetTooltip: 'إعادة تعيين إلى الافتراضي'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'التحديد التلقائي لأول ملاحظة',
                desc: 'فتح أول ملاحظة تلقائيًا عند تبديل المجلدات أو الوسوم أو الخصائص.'
            },
            skipAutoScroll: {
                name: 'تعطيل التمرير التلقائي للاختصارات',
                desc: 'عدم تمرير لوحة التنقل عند النقر على عناصر في الاختصارات.'
            },
            autoExpandNavItems: {
                name: 'التوسيع عند التحديد',
                desc: 'توسيع المجلدات والوسوم عند تحديدها. في وضع اللوحة الواحدة، التحديد الأول يوسع، والتحديد الثاني يعرض الملفات.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'فرع واحد موسّع',
                desc: 'طي الفروع الأخرى في نفس الشجرة عند توسيع مجلد أو وسم أو خاصية.'
            },
            springLoadedFolders: {
                name: 'التوسيع أثناء السحب',
                desc: 'توسيع المجلدات والوسوم عند التمرير فوقها أثناء السحب.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'التوسيع أثناء السحب: تأخير التوسيع الأول',
                desc: 'التأخير قبل توسيع أول مجلد أو وسم أثناء السحب (بالثواني).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'التوسيع أثناء السحب: تأخير التوسيع اللاحق',
                desc: 'التأخير قبل توسيع مجلدات أو وسوم إضافية أثناء نفس عملية السحب (بالثواني).'
            },
            navigationBanner: {
                name: 'شعار التنقل (ملف الخزنة)',
                desc: 'عرض صورة فوق لوحة التنقل. يتغير مع ملف الخزنة المحدد.',
                current: 'الشعار الحالي: {path}',
                chooseButton: 'اختيار صورة'
            },
            pinNavigationBanner: {
                name: 'تثبيت البانر',
                desc: 'تثبيت لافتة التنقل فوق شجرة التنقل.'
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
                name: 'إظهار الملفات الحديثة',
                desc: 'عرض قسم الملفات الحديثة في لوحة التنقل.'
            },
            hideRecentNotes: {
                name: 'إخفاء أنواع الملفات من الملفات الحديثة',
                desc: 'اختر أنواع الملفات المراد إخفاؤها في قسم الملفات الحديثة.',
                options: {
                    none: 'لا شيء',
                    folderNotes: 'ملاحظات المجلدات'
                }
            },
            recentNotesCount: {
                name: 'عدد الملفات الحديثة',
                desc: 'عدد الملفات الحديثة المعروضة.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'تثبيت الملفات الحديثة مع الاختصارات',
                desc: 'تضمين الملفات الحديثة عند تثبيت الاختصارات.'
            },
            calendarEnabled: {
                name: 'تفعيل التقويم',
                desc: 'تفعيل ميزات التقويم في Notebook Navigator.'
            },
            calendarPlacement: {
                name: 'موضع التقويم',
                desc: 'العرض في الشريط الجانبي الأيمن أو الأيسر.', // RTL: right↔left flipped to match visual layout
                options: {
                    leftSidebar: 'الشريط الجانبي الأيمن', // RTL: "Left sidebar" → "Right sidebar" (appears on right in RTL)
                    rightSidebar: 'الشريط الجانبي الأيسر' // RTL: "Right sidebar" → "Left sidebar" (appears on left in RTL)
                }
            },
            calendarLeftPlacement: {
                name: 'موضع الجزء الفردي',
                desc: 'مكان عرض التقويم في وضع الجزء الفردي.',
                options: {
                    navigationPane: 'جزء التنقل',
                    below: 'أسفل الأجزاء'
                }
            },
            calendarLocale: {
                name: 'اللغة',
                desc: 'التحكم في تنسيق تواريخ التقويم وترقيم الأسابيع واليوم الأول من الأسبوع.',
                weekPathMismatchWarning: 'التقويم المرئي ومسارات الملاحظات الأسبوعية تستخدم بدايات أسابيع أو ترقيم أسابيع مختلفة.',
                options: {
                    systemDefault: 'افتراضي'
                }
            },
            calendarWeekendDays: {
                name: 'أيام عطلة نهاية الأسبوع',
                desc: 'عرض أيام عطلة نهاية الأسبوع بلون خلفية مختلف.',
                options: {
                    none: 'لا شيء',
                    satSun: 'السبت والأحد',
                    friSat: 'الجمعة والسبت',
                    thuFri: 'الخميس والجمعة'
                }
            },
            calendarMonthHeadingFormat: {
                name: 'تنسيق اسم الشهر',
                desc: 'اسم الشهر الكامل (يناير) أو المختصر (يناير).',
                options: {
                    full: 'يناير (كامل)',
                    short: 'يناير (مختصر)'
                }
            },
            showInfoButtons: {
                name: 'إظهار أزرار المعلومات',
                desc: 'عرض أزرار المعلومات في شريط البحث ورأس التقويم.'
            },
            calendarWeeksToShow: {
                name: 'الأسابيع المعروضة في الشريط الجانبي الأيمن', // RTL: "left sidebar" → "right sidebar"
                desc: 'التقويم في الشريط الجانبي الأيسر يعرض الشهر كاملاً دائماً.', // RTL: "right sidebar" → "left sidebar"
                options: {
                    fullMonth: 'شهر كامل',
                    oneWeek: 'أسبوع واحد',
                    weeksCount: '{count} أسابيع'
                }
            },
            calendarHighlightToday: {
                name: 'تمييز تاريخ اليوم',
                desc: 'تمييز تاريخ اليوم بلون خلفية ونص غامق.'
            },
            calendarShowFeatureImage: {
                name: 'عرض صورة الميزة',
                desc: 'عرض صور الميزات للملاحظات في التقويم.'
            },
            calendarShowTasks: {
                name: 'إظهار المهام',
                desc: 'عرض مؤشر على الأيام والأسابيع والأشهر التي تحتوي على مهام غير مكتملة.'
            },
            calendarShowWeekNumber: {
                name: 'عرض رقم الأسبوع',
                desc: 'إضافة عمود برقم الأسبوع.'
            },
            calendarShowQuarter: {
                name: 'عرض الربع',
                desc: 'إضافة تسمية الربع في رأس التقويم.'
            },
            calendarShowYearCalendar: {
                name: 'عرض تقويم السنة',
                desc: 'عرض التنقل بين السنوات وشبكة الأشهر في الشريط الجانبي الأيمن.'
            },
            calendarConfirmBeforeCreate: {
                name: 'تأكيد قبل الإنشاء',
                desc: 'عرض مربع حوار تأكيد عند إنشاء ملاحظة يومية جديدة.'
            },
            calendarIntegrationMode: {
                name: 'مصدر الملاحظات اليومية',
                desc: 'مصدر ملاحظات التقويم.',
                options: {
                    dailyNotes: 'الملاحظات اليومية (المكوّن الإضافي الأساسي)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'يتم تكوين المجلد وتنسيق التاريخ في إضافة الملاحظات اليومية الأساسية.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'لغة الملاحظات الدورية',
                desc: 'يتحكم في أسماء الأشهر والأيام المحلية وأرقام الأسابيع وبدايات الأسابيع في مسارات الملاحظات الدورية في Notebook Navigator.',
                options: {
                    calendar: 'التقويم',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'المجلد الجذر',
                desc: 'المجلد الأساسي للملاحظات الدورية. يمكن أن تتضمن أنماط التاريخ مجلدات فرعية. يتغير مع ملف تعريف الخزنة المحدد.',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'موقع مجلد القوالب',
                desc: 'يعرض منتقي ملفات القوالب الملاحظات من هذا المجلد.',
                placeholder: 'Templates',
                usage: 'تُستخدم بواسطة ملاحظات التقويم وملاحظات المجلد. اضبط القوالب في التقويم > تكامل التقويم والمجلدات وملاحظات المجلد > ملفات ملاحظات المجلد.'
            },
            calendarCustomFilePattern: {
                name: 'الملاحظات اليومية',
                desc: 'تنسيق المسار باستخدام تنسيق تاريخ Moment. ضع أسماء المجلدات الفرعية بين أقواس معقوفة، مثال [Work]/YYYY. انقر على أيقونة القالب لتعيين قالب. حدد موقع مجلد القوالب في عمليات الملفات > قوالب.',
                momentDescPrefix: 'تنسيق المسار باستخدام ',
                momentLinkText: 'تنسيق تاريخ Moment',
                momentDescSuffix:
                    '. ضع أسماء المجلدات الفرعية بين أقواس معقوفة، مثال [Work]/YYYY. انقر على أيقونة القالب لتعيين قالب. حدد موقع مجلد القوالب في عمليات الملفات > قوالب.',
                templaterSupportInstalled: '✅ تم تثبيت إضافة Templater مع دعم كامل للقوالب.',
                templaterSupportMissing: '⚠️ ثبّت إضافة Templater للحصول على دعم كامل للقوالب.',
                placeholder: 'YYYY/YYYYMMDD',
                example: 'الصيغة الحالية: {path}',
                parsingError: 'يجب أن يقوم النمط بتنسيق التاريخ ثم تحليله مرة أخرى كتاريخ كامل (السنة، الشهر، اليوم).'
            },
            calendarCustomWeekPattern: {
                name: 'الملاحظات الأسبوعية',
                parsingError: 'يجب أن يقوم النمط بتنسيق الأسبوع ثم تحليله مرة أخرى كأسبوع كامل (سنة الأسبوع، رقم الأسبوع).',
                weekPathMismatchWarning:
                    'تستخدم مسارات الملاحظات الأسبوعية لغة الملاحظات الدورية. استخدم لغات متطابقة، أو استخدم "GGGG" مع "WW" للأسابيع المستندة إلى الإثنين.',
                mixedWeekTokensWarning:
                    'هذا النمط يخلط رموز الأسبوع المستندة إلى الإثنين ("W" أو "G") مع رموز الأسبوع المستندة إلى اللغة ("w" أو "g"). استخدم مجموعة واحدة باستمرار: "GGGG" مع "WW" للأسابيع المستندة إلى الإثنين، أو "gggg" مع "ww" إذا كانت الملاحظات الأسبوعية يجب أن تتبع اللغة المحددة.'
            },
            calendarCustomMonthPattern: {
                name: 'الملاحظات الشهرية',
                parsingError: 'يجب أن يقوم النمط بتنسيق الشهر ثم تحليله مرة أخرى كشهر كامل (السنة، الشهر).'
            },
            calendarCustomQuarterPattern: {
                name: 'الملاحظات الفصلية',
                parsingError: 'يجب أن يقوم النمط بتنسيق الفصل ثم تحليله مرة أخرى كفصل كامل (السنة، الفصل).'
            },
            calendarCustomYearPattern: {
                name: 'الملاحظات السنوية',
                parsingError: 'يجب أن يقوم النمط بتنسيق السنة ثم تحليلها مرة أخرى كسنة كاملة (السنة).'
            },
            calendarTemplateFile: {
                current: 'ملف القالب: {name}'
            },
            showTooltips: {
                name: 'إظهار التلميحات',
                desc: 'عرض تلميحات التمرير مع معلومات إضافية للملاحظات والمجلدات.'
            },
            showTooltipPath: {
                name: 'إظهار المسار في التلميحات',
                desc: 'عرض مسار المجلد أسفل أسماء الملاحظات في التلميحات.'
            },
            showTooltipWordCount: {
                name: 'إظهار عدد الكلمات في التلميحات',
                desc: 'عرض عدد كلمات الملاحظات في التلميحات.'
            },
            resetPaneSeparator: {
                name: 'إعادة تعيين موضع فاصل اللوحة',
                desc: 'إعادة تعيين الفاصل القابل للسحب بين لوحة التنقل ولوحة القائمة إلى الموضع الافتراضي.',
                buttonText: 'إعادة تعيين الفاصل',
                notice: 'تم إعادة تعيين موضع الفاصل. أعد تشغيل Obsidian أو أعد فتح متصفح الدفتر للتطبيق.'
            },
            settingsTransfer: {
                name: 'استيراد وتصدير الإعدادات',
                desc: 'تصدير أو استيراد إعدادات متصفح الدفتر بصيغة JSON. يؤدي الاستيراد إلى استبدال جميع الإعدادات.',
                importButtonText: 'استيراد',
                exportButtonText: 'تصدير',
                import: {
                    modalTitle: 'استيراد الإعدادات',
                    fileButtonName: 'استيراد من ملف',
                    fileButtonDesc: 'تحميل ملف JSON من القرص.',
                    fileButtonText: 'استيراد من ملف',
                    editorName: 'JSON',
                    editorDesc: 'الصق أو عدّل JSON أدناه. الإعدادات غير المضمنة تُعاد إلى القيم الافتراضية.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'استيراد',
                    confirmTitle: 'استيراد الإعدادات؟',
                    confirmMessage: 'سيؤدي الاستيراد إلى استبدال إعدادات Notebook Navigator الحالية.',
                    backupToggleName: 'حفظ الإعدادات الحالية في جذر الخزنة قبل الاستيراد',
                    backupToggleDesc: 'ينشئ ملف JSON مختومًا بالوقت في جذر الخزنة.',
                    successWithBackupNotice: 'تم استيراد الإعدادات. حُفظت الإعدادات السابقة في {path}.',
                    backupError: 'تعذّر حفظ الإعدادات الحالية: {message}',
                    successNotice: 'تم استيراد الإعدادات.',
                    errorNotice: 'فشل استيراد الإعدادات: {message}',
                    fileReadError: 'تعذّر قراءة الملف: {message}'
                },
                export: {
                    modalTitle: 'تصدير الإعدادات',
                    editorName: 'JSON',
                    editorDesc: 'يتم تضمين الإعدادات المختلفة عن القيم الافتراضية فقط.',
                    placeholder: '{}',
                    copyButtonText: 'نسخ إلى الحافظة',
                    downloadButtonText: 'تنزيل',
                    copyNotice: 'تم نسخ الإعدادات إلى الحافظة.',
                    downloadNotice: 'تم تصدير الإعدادات.',
                    downloadError: 'فشل تنزيل الإعدادات: {message}'
                }
            },
            resetAllSettings: {
                name: 'إعادة تعيين جميع الإعدادات',
                desc: 'إعادة تعيين جميع إعدادات متصفح الدفتر إلى القيم الافتراضية.',
                buttonText: 'إعادة تعيين جميع الإعدادات',
                confirmTitle: 'إعادة تعيين جميع الإعدادات؟',
                confirmMessage: 'سيؤدي هذا إلى إعادة تعيين جميع إعدادات متصفح الدفتر إلى القيم الافتراضية. لا يمكن التراجع عن ذلك.',
                confirmButtonText: 'إعادة تعيين جميع الإعدادات',
                notice: 'تمت إعادة تعيين جميع الإعدادات. أعد تشغيل Obsidian أو أعد فتح متصفح الدفتر للتطبيق.',
                error: 'فشل إعادة تعيين الإعدادات.'
            },
            multiSelectModifier: {
                name: 'معدل التحديد المتعدد',
                desc: 'اختر مفتاح التعديل الذي يبدل التحديد المتعدد. عند اختيار Option/Alt، النقر مع Cmd/Ctrl يفتح الملاحظات في علامة تبويب جديدة.',
                options: {
                    cmdCtrl: 'النقر مع Cmd/Ctrl',
                    optionAlt: 'النقر مع Option/Alt'
                }
            },
            enterToOpenFiles: {
                name: 'اضغط Enter لفتح الملفات',
                desc: 'فتح الملفات فقط عند الضغط على Enter أثناء التنقل بلوحة المفاتيح في القائمة. على macOS، يمنع ذلك Enter من إعادة تسمية الملفات.'
            },
            shiftEnterOpenContext: {
                name: 'Shift+Enter',
                desc: 'اختر ما إذا كان Shift+Enter يفتح الملف المحدد أو يعيد تسميته.'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Enter',
                desc: 'اختر ما إذا كان Cmd+Enter يفتح الملف المحدد أو يعيد تسميته.'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Enter',
                desc: 'اختر ما إذا كان Ctrl+Enter يفتح الملف المحدد أو يعيد تسميته.'
            },
            mouseBackForwardAction: {
                name: 'أزرار الرجوع/التقدم في الفأرة',
                desc: 'الإجراء لأزرار الرجوع والتقدم في الفأرة على سطح المكتب.',
                options: {
                    none: 'استخدام الإعداد الافتراضي للنظام',
                    singlePaneSwitch: 'تبديل الألواح (لوح واحد)',
                    history: 'التنقل في السجل'
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
                desc: 'اختر ما يفتحه Notebook Navigator تلقائيًا عند بدء التشغيل.',
                current: 'الحالي: {path}',
                chooseButton: 'اختيار ملف',
                options: {
                    none: 'لا شيء',
                    file: 'ملف',
                    dailyNote: 'ملاحظة يومية',
                    weeklyNote: 'ملاحظة أسبوعية',
                    monthlyNote: 'ملاحظة شهرية',
                    quarterlyNote: 'ملاحظة ربع سنوية',
                    yearlyNote: 'ملاحظة سنوية'
                },
                file: {
                    name: 'الصفحة الرئيسية: ملف بدء التشغيل',
                    empty: 'لم يتم اختيار ملف'
                },
                createMissing: {
                    name: 'الصفحة الرئيسية: إنشاء ملاحظة إذا كانت مفقودة',
                    desc: 'إنشاء الملاحظة الدورية عند بدء التشغيل أو عبر الأمر إذا لم تكن موجودة.'
                }
            },
            excludedNotes: {
                name: 'إخفاء الملاحظات بقواعد الخصائص (ملف الخزنة)',
                desc: 'قائمة مفصولة بفاصلة من قواعد البيانات الأمامية. استخدم إدخالات `key` أو `key=value` (مثل status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'إخفاء الملفات (ملف الخزنة)',
                desc: 'قائمة أنماط أسماء الملفات مفصولة بفاصلة للإخفاء. يدعم أحرف البدل * والمسارات / (مثل temp-*، *.png، /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'ملف الخزنة',
                desc: 'تخزن الملفات رؤية أنواع الملفات والملفات المخفية والمجلدات المخفية والوسوم المخفية وقواعد الخصائص للملاحظات المخفية والاختصارات وشعار التنقل. بدل الملفات من رأس لوحة التنقل.',
                defaultName: 'افتراضي',
                addButton: 'إضافة ملف',
                editProfilesButton: 'تحرير الملفات',
                addProfileOption: 'إضافة ملف...',
                applyButton: 'تطبيق',
                deleteButton: 'حذف الملف',
                addModalTitle: 'إضافة ملف',
                editProfilesModalTitle: 'تحرير الملفات',
                addModalPlaceholder: 'اسم الملف',
                deleteModalTitle: 'حذف {name}',
                deleteModalMessage:
                    'إزالة {name}؟ سيتم حذف مرشحات الملفات والمجلدات والوسوم والملاحظات المستندة إلى الخصائص المحفوظة في هذا الملف.',
                moveUp: 'تحريك لأعلى',
                moveDown: 'تحريك لأسفل',
                errors: {
                    emptyName: 'أدخل اسم الملف',
                    duplicateName: 'اسم الملف موجود بالفعل'
                }
            },
            vaultTitle: {
                name: 'موضع عنوان الخزنة',
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
            descendantExcludedFolders: {
                name: 'استبعاد المجلدات من ملاحظات المجلدات الفرعية (ملف تعريف الخزنة)',
                desc: 'قائمة مفصولة بفواصل للمجلدات التي يتم تجاهلها عند جمع الملاحظات من المجلدات الفرعية. تبقى المجلدات مرئية، ويظل تحديدها يعرض ملاحظاتها. تستخدم نفس أنماط إخفاء المجلدات.',
                placeholder: 'يومي، موارد، /archive'
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
            showFileProperties: {
                name: 'إظهار خصائص الملفات',
                desc: 'عرض الخصائص في عناصر الملفات. استخدم نافذة رؤية مفاتيح الخصائص لاختيار الخصائص المعروضة.'
            },
            colorFileProperties: {
                name: 'تلوين خصائص الملفات',
                desc: 'تطبيق ألوان الخصائص على شارات الخصائص في عناصر الملفات.'
            },
            prioritizeColoredFileProperties: {
                name: 'إظهار الخصائص الملونة أولاً',
                desc: 'ترتيب الخصائص الملونة قبل الخصائص الأخرى في عناصر الملفات.'
            },
            showFilePropertiesInCompactMode: {
                name: 'إظهار الخصائص في الوضع المضغوط',
                desc: 'عرض الخصائص عند تفعيل الوضع المضغوط.'
            },
            textCountDisplay: {
                name: 'نوع العدد',
                desc: 'اختر أي أعداد ملاحظات تظهر في عناصر الملفات.',
                options: {
                    none: 'لا شيء',
                    words: 'عدد الكلمات',
                    characters: 'عدد الأحرف',
                    both: 'عدد الكلمات والأحرف'
                }
            },
            textCountPlacement: {
                name: 'الموضع',
                desc: 'اختر مكان ظهور أعداد الملاحظات.',
                options: {
                    title: 'في العنوان',
                    property: 'كخاصية'
                }
            },
            characterCountSpaces: {
                name: 'عدد الأحرف',
                desc: 'اختر ما إذا كانت المسافات تُحتسب ضمن عدد الأحرف.',
                options: {
                    include: 'مع المسافات',
                    exclude: 'بدون المسافات'
                }
            },
            wordCountTargetProperty: {
                name: 'خاصية الهدف',
                desc: 'مفتاح خاصية الواجهة الأمامية الذي يحتوي على عدد الكلمات المستهدف. اتركه فارغاً لإخفاء الأهداف.'
            },
            showWordCountPercentage: {
                name: 'إظهار نسبة الهدف',
                desc: 'عرض نسبة التقدم فقط عند توفر عدد كلمات مستهدف.'
            },
            propertyFields: {
                name: 'مفاتيح الخصائص (ملف القبو)',
                desc: 'مفاتيح خصائص الواجهة الأمامية، مع إمكانية التحكم في رؤية كل مفتاح للتنقل وقائمة الملفات.',
                addButtonTooltip: 'تكوين مفاتيح الخصائص',
                noneConfigured: 'لم يتم تكوين أي خصائص',
                singleConfigured: 'خاصية واحدة مكوّنة: {properties}',
                multipleConfigured: '{count} خصائص مكوّنة: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'إظهار الخصائص في صفوف منفصلة',
                desc: 'عرض كل خاصية في صف منفصل.'
            },
            enablePropertyInternalLinks: {
                name: 'ربط شارات الخصائص بالملاحظات',
                desc: 'انقر على شارة خاصية لفتح الملاحظة المرتبطة.'
            },
            enablePropertyExternalLinks: {
                name: 'ربط شارات الخصائص بالروابط',
                desc: 'انقر على شارة خاصية لفتح الرابط المرتبط.'
            },
            dateFormat: {
                name: 'تنسيق التاريخ',
                desc: 'تنسيق عرض التواريخ (يستخدم تنسيق Moment).',
                placeholder: 'D MMM YYYY',
                help: 'التنسيقات الشائعة:\nD MMM YYYY = 25 مايو 2022\nDD/MM/YYYY = 25/05/2022\nYYYY-MM-DD = 2022-05-25\n\nالرموز:\nYYYY/YY = السنة\nMMMM/MMM/MM = الشهر\nDD/D = اليوم\ndddd/ddd = يوم الأسبوع',
                helpTooltip: 'تنسيق باستخدام Moment',
                momentLinkText: 'تنسيق Moment'
            },
            timeFormat: {
                name: 'تنسيق الوقت',
                desc: 'تنسيق عرض الأوقات (يستخدم تنسيق Moment).',
                placeholder: 'h:mm a',
                help: 'التنسيقات الشائعة:\nh:mm a = 2:30 م (12 ساعة)\nHH:mm = 14:30 (24 ساعة)\nh:mm:ss a = 2:30:45 م\nHH:mm:ss = 14:30:45\n\nالرموز:\nHH/H = 24 ساعة\nhh/h = 12 ساعة\nmm = الدقائق\nss = الثواني\na = ص/م',
                helpTooltip: 'تنسيق باستخدام Moment',
                momentLinkText: 'تنسيق Moment'
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
            stripLatexInPreview: {
                name: 'إزالة LaTeX من المعاينات',
                desc: 'إزالة تعبيرات LaTeX المضمنة والكتلية من نص المعاينة.'
            },
            previewProperties: {
                name: 'خصائص المعاينة',
                desc: 'قائمة مفصولة بفاصلة من خصائص البيانات الأمامية للتحقق من نص المعاينة. سيتم استخدام أول خاصية تحتوي على نص.',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'الرجوع إلى محتوى الملاحظة',
                desc: 'عرض محتوى الملاحظة كمعاينة عندما لا تحتوي أي من الخصائص المحددة على نص.'
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
                    '2': 'صفان',
                    '3': '3 صفوف'
                }
            },
            useFolderColor: {
                name: 'استخدام لون المجلد',
                desc: 'تلوين عناوين الملاحظات وأيقونات الملفات بلون المجلد الأصلي عند عدم تعيين لون ملف مخصص. الأولوية: لون الملف المخصص > لون المجلد > اللون الافتراضي.'
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
                desc: 'قائمة مفصولة بفاصلة من خصائص البيانات الأمامية للتحقق منها أولاً. يستخدم أول صورة في محتوى markdown كبديل.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'استبعاد الملاحظات ذات الخصائص',
                desc: 'قائمة مفصولة بفاصلة من خصائص البيانات الأمامية. الملاحظات التي تحتوي على أي من هذه الخصائص لا تخزن صور العرض.',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: 'حجم عرض صورة الميزة',
                desc: 'الحجم الأقصى المعروض لصور الميزة في قوائم الملاحظات.',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'دقة بكسل صورة الميزة',
                desc: 'الدقة المستخدمة عند إنشاء صور مصغرة محفوظة لصور الميزة. قم بزيادتها إذا بدت المعاينات الأكبر ضبابية.',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'تنزيل الصور الخارجية',
                desc: 'تنزيل الصور عن بُعد والصور المصغرة من YouTube للصور المميزة.'
            },
            hideDrawingPreviewImages: {
                name: 'إخفاء صور المعاينة المُصدَّرة',
                desc: 'إخفاء ملفات PNG لمعاينة الرسومات المُصدَّرة. فعِّل "إظهار العناصر المخفية" لعرضها.'
            },
            drawingIntegrationInfo: {
                intro: 'يعرض Notebook Navigator ملفات PNG المُصدَّرة من Excalidraw كمعاينات للرسومات.',
                items: [
                    'في **إعدادات Excalidraw**، افتح **Embedding Excalidraw into your Notes and Exporting**، ثم **Export Settings**، ثم **Auto-export Settings**.',
                    'فعِّل **Auto-export PNG**. اختياريًا فعِّل **Export both dark- and light-themed image**.',
                    'يبحث Notebook Navigator عن **Drawing.excalidraw.png** أو **Drawing.excalidraw.dark.png** أو **Drawing.excalidraw.light.png**.',
                    'عند تفعيل **إخفاء صور المعاينة المُصدَّرة**، تظهر ملفات PNG فقط عند تفعيل **إظهار العناصر المخفية** أيضًا.'
                ]
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
            folderSortOrder: {
                name: 'ترتيب فرز المجلدات',
                desc: 'انقر بزر الماوس الأيمن على أي مجلد لتعيين ترتيب فرز مختلف لمحتوياته.',
                options: {
                    alphaAsc: 'من أ إلى ي',
                    alphaDesc: 'من ي إلى أ'
                }
            },
            showNoteCount: {
                name: 'إظهار عدد الملاحظات',
                desc: 'عرض عدد الملاحظات بجانب المجلدات والوسوم والخصائص.'
            },
            showSectionIcons: {
                name: 'إظهار أيقونات للاختصارات والعناصر الحديثة',
                desc: 'عرض أيقونات بجانب العناصر في قسمَي الاختصارات والحديثة.'
            },
            interfaceIcons: {
                name: 'أيقونات الواجهة',
                desc: 'تحرير أيقونات شريط الأدوات والمجلدات والوسوم والخصائص والعناصر المثبتة والبحث والفرز.',
                buttonText: 'تحرير الأيقونات'
            },
            showIconsColorOnly: {
                name: 'تطبيق اللون على الأيقونات فقط',
                desc: 'عند التمكين، تطبق الألوان المخصصة على الأيقونات فقط. عند التعطيل، تطبق الألوان على الأيقونات وتسميات النص.'
            },
            navRainbowMode: {
                name: 'وضع ألوان قوس قزح (ملف الخزنة)',
                desc: 'تطبيق ألوان قوس قزح في لوحة التنقل.',
                options: {
                    none: 'إيقاف',
                    foreground: 'لون النص',
                    background: 'لون الخلفية'
                }
            },
            navRainbowFirstColor: {
                name: 'اللون الأول',
                desc: 'اللون الأول في تدرج قوس قزح.'
            },
            navRainbowLastColor: {
                name: 'اللون الأخير',
                desc: 'اللون الأخير في تدرج قوس قزح.'
            },
            navRainbowTransitionStyle: {
                name: 'نمط الانتقال',
                desc: 'الاستيفاء المستخدم بين اللون الأول والأخير.',
                options: {
                    hue: 'درجة اللون',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'تطبيق على الاختصارات',
                desc: 'تطبيق ألوان قوس قزح على الاختصارات.'
            },
            navRainbowApplyToRecent: {
                name: 'تطبيق على العناصر الأخيرة',
                desc: 'تطبيق ألوان قوس قزح على العناصر الأخيرة.'
            },
            navRainbowApplyToFolders: {
                name: 'تطبيق على المجلدات',
                desc: 'تطبيق ألوان قوس قزح على المجلدات.'
            },
            navRainbowFolderScope: {
                name: 'نطاق المجلدات',
                desc: 'تحديد مستويات المجلدات التي تبدأ تعيينات الألوان.',
                options: {
                    root: 'المستوى الجذر',
                    child: 'المستوى الفرعي',
                    all: 'كل مستوى'
                }
            },
            navRainbowApplyToTags: {
                name: 'تطبيق على الوسوم',
                desc: 'تطبيق ألوان قوس قزح على الوسوم.'
            },
            navRainbowTagScope: {
                name: 'نطاق الوسوم',
                desc: 'تحديد مستويات الوسوم التي تبدأ تعيينات الألوان.',
                options: {
                    root: 'المستوى الجذر',
                    child: 'المستوى الفرعي',
                    all: 'كل مستوى'
                }
            },
            navRainbowApplyToProperties: {
                name: 'تطبيق على الخصائص',
                desc: 'تطبيق ألوان قوس قزح على الخصائص.'
            },
            navRainbowBalanceHueLuminance: {
                name: 'سطوع متسق عبر الألوان', // (English: Consistent brightness across hues)
                desc: 'يُقحم السطوع بين ألوان البداية والنهاية أثناء انتقالات الألوان.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'فصل ألوان الوضع الفاتح والداكن', // (English: Separate light and dark mode colors)
                desc: 'استخدام ألوان قوس قزح مختلفة للوضع الفاتح والوضع الداكن.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'نسخ لون الوضع الفاتح إلى الوضع الداكن', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'نطاق الخصائص',
                desc: 'تحديد مستويات الخصائص التي تبدأ تعيينات الألوان.',
                options: {
                    root: 'المستوى الجذر',
                    child: 'المستوى الفرعي',
                    all: 'كل مستوى'
                }
            },
            collapseBehavior: {
                name: 'طي العناصر',
                desc: 'اختر ما يؤثر عليه زر توسيع/طي الكل.',
                options: {
                    all: 'الكل',
                    foldersOnly: 'المجلدات فقط',
                    tagsOnly: 'الوسوم فقط',
                    propertiesOnly: 'الخصائص فقط'
                }
            },
            smartCollapse: {
                name: 'إبقاء العنصر المحدد موسعًا',
                desc: 'عند الطي، إبقاء العنصر المحدد وآبائه موسعين.'
            },
            excludeVaultRootFromCollapse: {
                name: 'تخطي جذر الخزنة عند الطي',
                desc: 'عند طي كل العناصر، اترك مجلد جذر الخزنة في حالته الحالية.'
            },
            navIndent: {
                name: 'مسافة بادئة الشجرة',
                desc: 'ضبط عرض المسافة البادئة للمجلدات والوسوم والخصائص المتداخلة (بالبكسل).'
            },
            navItemHeight: {
                name: 'ارتفاع العنصر',
                desc: 'ضبط ارتفاع المجلدات والوسوم والخصائص في لوحة التنقل (بالبكسل).'
            },
            navItemHeightScaleText: {
                name: 'تحجيم النص مع ارتفاع العنصر',
                desc: 'تقليل حجم نص التنقل عند تقليل ارتفاع العنصر.'
            },
            showIndentGuides: {
                name: 'إظهار خطوط المسافة البادئة',
                desc: 'عرض خطوط المسافة البادئة للمجلدات والوسوم والخصائص المتداخلة.'
            },
            navCountLeaderStyle: {
                name: 'إظهار علامات التوصيل',
                desc: 'عرض نقاط أو شرطات أو خط بين أسماء العناصر وعدد الملاحظات.',
                options: {
                    none: 'بدون',
                    dots: 'نقاط (...)',
                    dashes: 'شرطات (---)',
                    line: 'خط'
                }
            },
            navRootSpacing: {
                name: 'تباعد العناصر الجذرية',
                desc: 'التباعد بين المجلدات والوسوم والخصائص على مستوى الجذر (بالبكسل).'
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
                desc: 'انقر بزر الماوس الأيمن على أي وسم لتعيين ترتيب فرز مختلف لمحتوياته.',
                options: {
                    alphaAsc: 'من أ إلى ي',
                    alphaDesc: 'من ي إلى أ',
                    frequency: 'التكرار',
                    lowToHigh: 'من الأقل إلى الأعلى',
                    highToLow: 'من الأعلى إلى الأقل'
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
            scopeTagsToCurrentContext: {
                name: 'تصفية الوسوم حسب التحديد',
                desc: 'إظهار الوسوم التي تظهر في الملاحظات ضمن المجلد أو الخاصية المحددة فقط.'
            },
            keepEmptyTagsProperty: {
                name: 'الاحتفاظ بخاصية الوسوم بعد إزالة آخر وسم',
                desc: 'الاحتفاظ بخاصية الوسوم في البيانات الأمامية عند إزالة جميع الوسوم. عند التعطيل، يتم حذف خاصية الوسوم من البيانات الأمامية.'
            },
            showProperties: {
                name: 'إظهار الخصائص',
                desc: 'عرض قسم الخصائص في المتصفح.',
                propertyKeysInfoPrefix: 'تكوين الخصائص في ',
                propertyKeysInfoLinkText: 'البداية > مفاتيح الخصائص',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'إظهار أيقونات الخصائص',
                desc: 'عرض الأيقونات بجانب الخصائص في لوحة التنقل.'
            },
            inheritPropertyColors: {
                name: 'وراثة ألوان الخصائص',
                desc: 'قيم الخصائص ترث اللون والخلفية من مفتاح الخاصية.'
            },
            propertySortOrder: {
                name: 'ترتيب فرز الخصائص',
                desc: 'انقر بزر الماوس الأيمن على أي خاصية لتعيين ترتيب فرز مختلف لقيمها.',
                options: {
                    alphaAsc: 'أ إلى ي',
                    alphaDesc: 'ي إلى أ',
                    frequency: 'التكرار',
                    lowToHigh: 'من الأقل إلى الأعلى',
                    highToLow: 'من الأعلى إلى الأقل'
                }
            },
            showAllPropertiesFolder: {
                name: 'إظهار مجلد الخصائص',
                desc: 'عرض "الخصائص" كمجلد قابل للطي.'
            },
            scopePropertiesToCurrentContext: {
                name: 'تصفية الخصائص حسب التحديد',
                desc: 'إظهار الخصائص التي تظهر في الملاحظات ضمن المجلد أو الوسم المحدد فقط.'
            },
            hiddenTags: {
                name: 'إخفاء الوسوم (ملف الخزنة)',
                desc: 'قائمة مفصولة بفاصلة من أنماط الوسوم. أنماط الأسماء: tag* (تبدأ بـ)، *tag (تنتهي بـ). أنماط المسارات: archive (الوسم وفروعه)، archive/* (الفروع فقط)، projects/*/drafts (حرف بدل وسطي).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            hiddenFileTags: {
                name: 'إخفاء الملاحظات ذات الوسوم (ملف الخزنة)',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'تمكين ملاحظات المجلدات',
                desc: 'المجلدات التي تحتوي على ملف ملاحظات مطابق تُعرض كروابط قابلة للنقر.'
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
            folderNoteNamePattern: {
                name: 'نمط اسم ملاحظة المجلد',
                desc: 'نمط اسم ملاحظات المجلد بدون الامتداد. استخدم {{folder}} لإدراج اسم المجلد. عند التعيين، لا يُطبَّق اسم ملاحظة المجلد.'
            },
            folderNoteTemplate: {
                name: 'قالب ملاحظة المجلد',
                desc: 'ملف قالب يُستخدم عند إنشاء ملاحظات المجلد. يمكن لقوالب Markdown استخدام Templater. تُنسخ قوالب Canvas وBase كمحتوى للملف. حدد موقع مجلد القوالب في عمليات الملفات > قوالب.',
                formatWarning: 'يجب أن يتطابق تنسيق القالب مع نوع ملاحظة المجلد المحدد: .md أو .canvas أو .base.'
            },
            enableFolderNoteLinks: {
                name: 'أسماء المجلدات تفتح ملاحظات المجلد',
                desc: 'يؤدي النقر على اسم مجلد إلى فتح ملاحظة المجلد الخاصة به. عند الإيقاف، توفر ملاحظات المجلد بيانات وصفية للمجلد فقط مثل الاسم والأيقونة واللون.'
            },
            hideFolderNoteInList: {
                name: 'إخفاء ملاحظات المجلدات في القائمة',
                desc: 'إخفاء ملاحظات المجلدات من الظهور في قائمة الملفات.'
            },
            pinCreatedFolderNote: {
                name: 'تثبيت ملاحظات المجلدات المنشأة',
                desc: 'تثبيت ملاحظات المجلدات عند إنشائها من قائمة السياق.'
            },
            folderNoteOpenLocation: {
                name: 'فتح ملاحظات المجلد في',
                desc: 'اختر مكان فتح ملاحظات المجلد عند النقر على روابط ملاحظات المجلد.',
                options: {
                    currentTab: 'علامة التبويب الحالية',
                    newTab: 'علامة تبويب جديدة',
                    rightSidebar: 'الشريط الجانبي الأيمن'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: 'الشريط الجانبي الأيمن: عرض أقرب ملاحظة مجلد',
                desc: 'عند تحديد مجلد، يعرض الشريط الجانبي الأيمن تلقائيًا أقرب ملاحظة مجلد أصلية.'
            },
            confirmBeforeDelete: {
                name: 'التأكيد قبل الحذف',
                desc: 'إظهار مربع حوار تأكيد عند حذف الملاحظات أو المجلدات'
            },
            deleteAttachments: {
                name: 'حذف المرفقات عند حذف الملفات',
                desc: 'إزالة المرفقات المرتبطة ومعاينات الرسومات المُنشأة تلقائيًا إذا لم تكن مستخدمة في مكان آخر',
                options: {
                    ask: 'السؤال في كل مرة',
                    always: 'دائمًا',
                    never: 'أبدًا'
                }
            },
            moveFileConflicts: {
                name: 'تعارضات النقل',
                desc: 'عند نقل ملف إلى مجلد يحتوي بالفعل على ملف بنفس الاسم. اسأل في كل مرة (إعادة تسمية، الكتابة فوق، إلغاء) أو أعد التسمية دائمًا.',
                options: {
                    ask: 'اسأل في كل مرة',
                    rename: 'إعادة التسمية دائمًا'
                }
            },
            metadataCleanup: {
                name: 'تنظيف البيانات الوصفية',
                desc: 'إزالة البيانات الوصفية اليتيمة المتبقية عند حذف الملفات أو المجلدات أو الوسوم أو الخصائص أو نقلها أو إعادة تسميتها خارج Obsidian. يؤثر هذا فقط على ملف إعدادات متصفح الدفتر.',
                buttonText: 'تنظيف البيانات الوصفية',
                error: 'فشل تنظيف الإعدادات',
                loading: 'جارٍ فحص البيانات الوصفية...',
                statusClean: 'لا توجد بيانات وصفية لتنظيفها',
                statusCounts:
                    'عناصر يتيمة: {folders} مجلدات، {tags} وسوم، {properties} خصائص، {files} ملفات، {pinned} تثبيتات، {separators} فواصل'
            },
            rebuildCache: {
                name: 'إعادة بناء الذاكرة المؤقتة',
                desc: 'استخدم هذا إذا واجهت وسومًا مفقودة أو معاينات غير صحيحة أو صورًا مميزة مفقودة. يمكن أن يحدث هذا بعد تعارضات المزامنة أو الإغلاق غير المتوقع.',
                buttonText: 'إعادة بناء الذاكرة المؤقتة',
                error: 'فشل إعادة بناء الذاكرة المؤقتة',
                indexingTitle: 'جارٍ فهرسة الخزنة...',
                progress: 'جارٍ تحديث ذاكرة التخزين المؤقت لـ Notebook Navigator.'
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
            frontmatterBackgroundField: {
                name: 'حقل الخلفية',
                desc: 'حقل البيانات الأمامية لألوان الخلفية. اتركه فارغًا لاستخدام ألوان الخلفية المخزنة في الإعدادات.',
                placeholder: 'background'
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
                placeholder: 'title, name'
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
                desc: 'التنسيق المستخدم لتحليل الطوابع الزمنية في البيانات الأمامية. اتركه فارغًا لاستخدام تحليل ISO 8601.',
                helpTooltip: 'تنسيق باستخدام Moment',
                momentLinkText: 'تنسيق Moment',
                help: 'التنسيقات الشائعة:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'دعم التطوير',
                desc: 'إذا أحببت استخدام متصفح الدفتر، يرجى التفكير في دعم تطويره المستمر.',
                buttonText: '❤️ رعاية',
                coffeeButton: '☕️ اشترِ لي قهوة'
            },
            updateCheckOnStart: {
                name: 'التحقق من إصدار جديد عند البدء',
                desc: 'التحقق من إصدارات الإضافة الجديدة عند البدء وإظهار إشعار عند توفر تحديث. التحقق يحدث مرة واحدة يوميًا على الأكثر.',
                status: 'إصدار جديد متاح: {version}'
            },
            debugLogging: {
                name: 'تسجيل تصحيح أخطاء بدء التشغيل',
                desc: 'يكتب تشخيصات بدء التشغيل في ملف Markdown يحمل طابعًا زمنيًا في جذر الخزنة، ثم يتوقف بعد استقرار بدء التشغيل. قد تتم مزامنة الملف وقد يتضمن مسارات ملفات.'
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
        openBannerImage: 'فتح صورة لافتة الإصدار',
        supportMessage: 'إذا وجدت متصفح الدفتر مفيدًا، يرجى التفكير في دعم تطويره.',
        supportButton: 'اشترِ لي قهوة',
        thanksButton: 'شكرًا!'
    }
};
