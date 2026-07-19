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
 * Turkish language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_TR = {
    // Common UI elements
    common: {
        cancel: 'İptal', // Button text for canceling dialogs and operations (English: Cancel)
        delete: 'Sil', // Button text for delete operations in dialogs (English: Delete)
        clear: 'Temizle', // Button text for clearing values (English: Clear)
        remove: 'Kaldır', // Button text for remove operations in dialogs (English: Remove)
        restoreDefault: 'Varsayılana geri yükle', // Button text for restoring values to defaults (English: Restore default)
        submit: 'Gönder', // Button text for submitting forms and dialogs (English: Submit)
        save: 'Kaydet', // Button text for saving settings and dialogs (English: Save)
        configure: 'Yapılandır', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'Açık mod', // Label for light theme mode (English: Light mode)
        darkMode: 'Koyu mod', // Label for dark theme mode (English: Dark mode)
        noSelection: 'Seçim yok', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Etiketsiz', // Label for notes without any tags (English: Untagged)
        featureImageAlt: 'Öne çıkan görsel', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Bilinmeyen hata', // Generic fallback when an error has no message (English: Unknown error)
        clipboardWriteError: 'Panoya yazılamadı',
        updateBannerTitle: 'Notebook Navigator güncellemesi mevcut',
        updateBannerInstruction: 'Ayarlar -> Topluluk eklentileri bölümünden güncelleyin',
        previous: 'Önceki', // Generic aria label for previous navigation (English: Previous)
        next: 'Sonraki' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Notları görüntülemek için bir klasör veya etiket seçin', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Not yok', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Sabitlenmiş', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Notlar', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Dosyalar', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (gizli)', // Accessibility label applied to list items that are normally hidden
        collapseGroup: 'Grubu daralt',
        expandGroup: 'Grubu genişlet',
        manualSortTitle: 'Manuel sıralama: {property}',
        manualSortHint: 'Yeniden sıralamak için sürükleyin. Sıra, "{property}" özelliğinde sayısal indeks değerleri olarak kaydedilir.',
        manualSortNonMarkdownHint: 'Markdown olmayan dosyalar altta gösterilir ve yeniden sıralanamaz.',
        unsortedSection: 'Sıralanmamış',
        manualSortDone: 'Tamam',
        manualSortMultipleWriteFailure: '{count} dosya başarısız oldu; ilki: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Etiketsiz', // Label for the special item showing notes without tags (English: Untagged)
        tags: 'Etiketler' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Kısayollar', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentFilesHeader: 'Son dosyalar', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Özellikler',
        reorderRootFoldersTitle: 'Gezinmeyi yeniden sırala',
        reorderRootFoldersHint: 'Yeniden sıralamak için okları veya sürüklemeyi kullanın',
        vaultRootLabel: 'Kasa',
        resetRootToAlpha: 'Alfabetik sıraya sıfırla',
        resetRootToFrequency: 'Sıklık sırasına sıfırla',
        pinShortcuts: 'Kısayolları sabitle',
        pinShortcutsAndRecentFiles: 'Kısayolları ve son dosyaları sabitle',
        unpinShortcuts: 'Kısayolları sabitlemeden çıkar',
        unpinShortcutsAndRecentFiles: 'Kısayolları ve son dosyaları sabitlemeden çıkar',
        profileMenuAria: 'Kasa profilini değiştir'
    },

    navigationCalendar: {
        ariaLabel: 'Takvim',
        dailyNotesNotEnabled: 'Günlük notlar eklentisi etkin değil.',
        noteHiddenByProfile: 'Takvim notu geçerli kasa profili tarafından gizleniyor.',
        createDailyNote: {
            title: 'Yeni günlük not',
            message: '{filename} dosyası mevcut değil. Oluşturmak ister misiniz?',
            confirmButton: 'Oluştur'
        },
        helpModal: {
            title: 'Takvim kısayolları',
            items: [
                'Günlük not açmak veya oluşturmak için herhangi bir güne tıklayın. Haftalar, aylar, çeyrekler ve yıllar aynı şekilde çalışır.',
                'Bir günün altındaki dolu nokta, notu olduğu anlamına gelir. Boş nokta, tamamlanmamış görevleri olduğu anlamına gelir.',
                'Bir notun öne çıkan görseli varsa, günün arka planı olarak görünür.'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+tıklayarak dosya listesinde o tarihe göre filtreleyin.',
            dateFilterOptionAlt: '`Option/Alt`+tıklayarak dosya listesinde o tarihe göre filtreleyin.'
        }
    },

    dailyNotes: {
        templateReadFailed: 'Günlük not şablonu okunamadı.',
        createFailed: 'Günlük not oluşturulamadı.'
    },

    shortcuts: {
        folderExists: 'Klasör zaten kısayollarda',
        noteExists: 'Not zaten kısayollarda',
        tagExists: 'Etiket zaten kısayollarda',
        propertyExists: 'Özellik zaten kısayollarda mevcut',
        invalidProperty: 'Geçersiz özellik kısayolu',
        searchExists: 'Arama kısayolu zaten mevcut',
        emptySearchQuery: 'Kaydetmeden önce bir arama sorgusu girin',
        emptySearchName: 'Aramayı kaydetmeden önce bir ad girin',
        add: 'Kısayollara ekle',
        addNotesCount: 'Kısayollara {count} not ekle',
        addFilesCount: 'Kısayollara {count} dosya ekle',
        rename: 'Kısayolu yeniden adlandır',
        remove: 'Kısayollardan kaldır',
        removeAll: 'Tüm kısayolları kaldır',
        removeAllConfirm: 'Tüm kısayolları kaldır?',
        folderNotesPinned: '{count} klasör notu sabitlendi'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Öğeleri daralt', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'Tüm öğeleri genişlet', // Tooltip for button that expands all items (English: Expand all items)
        showCalendar: 'Takvimi göster',
        hideCalendar: 'Takvimi gizle',
        newFolder: 'Yeni klasör', // Tooltip for create new folder button (English: New folder)
        newNote: 'Yeni not', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Gezinmeye dön', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeChildSortOrder: 'Sıralama düzenini değiştir',
        changeSortAndGroup: 'Sıralama ve gruplandırmayı değiştir',
        resetViewToDefaults: 'Görünümü varsayılanlara sıfırla',
        manualSort: 'Manuel sıralama',
        editSortOrder: 'Sıralama düzenini düzenle...',
        removeSortProperty: 'Sıralama özelliğini kaldır',
        descendants: 'alt öğeler',
        subfolders: 'alt klasörler',
        subtags: 'alt etiketler',
        childValues: 'alt değerler',
        applySortAndGroupToDescendants: (target: string) => `Sıralama ve gruplandırmayı ${target} için uygula`,
        applyAppearanceToDescendants: (target: string) => `Görünümü ${target} için uygula`,
        showFolders: 'Gezinmeyi göster', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: 'Gezinmeyi yeniden sırala',
        finishRootFolderReorder: 'Tamamlandı',
        showExcludedItems: 'Gizli klasörleri, etiketleri ve notları göster', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Gizli klasörleri, etiketleri ve notları gizle', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Çift bölme göster', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Tek bölme göster', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            'Kenar çubuğu çok dar olduğunda çift bölmeler kullanılamaz. Bunu değiştirmek için Ayarlar > Görünüm ve davranış altında "Kenar çubuğu çok dar olduğunda" ayarını "Hiçbir şey yapma" olarak ayarlayın.',
        changeAppearance: 'Görünümü değiştir', // Tooltip for button to change folder appearance settings (English: Change appearance)
        showNotesFromSubfolders: 'Alt klasörlerden notları göster',
        showFilesFromSubfolders: 'Alt klasörlerden dosyaları göster',
        showNotesFromDescendants: 'Alt öğelerden notları göster',
        showFilesFromDescendants: 'Alt öğelerden dosyaları göster',
        search: 'Ara' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Ara...', // Placeholder text for search input (English: Search...)
        placeholderVault: 'Kasada ara...',
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Aramayı temizle', // Tooltip for clear search button (English: Clear search)
        switchToFilterSearch: 'Filtre aramasına geç',
        switchToOmnisearch: 'Omnisearch aramasına geç',
        saveSearchShortcut: 'Arama kısayolunu kaydet',
        removeSearchShortcut: 'Arama kısayolunu kaldır',
        shortcutModalTitle: 'Arama kısayolunu kaydet',
        shortcutNamePlaceholder: 'Kısayol adını girin',
        shortcutStartIn: 'Her zaman şurada başla: {path}',
        searchHelp: 'Arama sözdizimi',
        searchHelpTitle: 'Arama sözdizimi',
        searchHelpModal: {
            intro: 'Dosya adlarını, özellikleri, etiketleri, tarihleri ve filtreleri tek bir sorguda birleştirin (örn. `meeting .status=active #work @thisweek`). Tam metin araması kullanmak için Omnisearch eklentisini yükleyin.',
            introSwitching:
                'Yukarı/aşağı ok tuşlarını kullanarak veya arama simgesine tıklayarak filtre araması ve Omnisearch arasında geçiş yapın.',
            sections: {
                fileNames: {
                    title: 'Dosya adları',
                    items: [
                        '`word` Dosya adında "word" olan notları bul.',
                        '`word1 word2` Her kelime dosya adıyla eşleşmeli.',
                        '`-word` Dosya adında "word" olan notları hariç tut.'
                    ]
                },
                tags: {
                    title: 'Etiketler',
                    items: [
                        '`#tag` Etiketli notları dahil et (`#tag/subtag` gibi iç içe etiketleri de bulur).',
                        '`#` Yalnızca etiketli notları dahil et.',
                        '`-#tag` Etiketli notları hariç tut.',
                        '`-#` Yalnızca etiketsiz notları dahil et.',
                        '`#tag1 #tag2` Her iki etiketi bul (örtük AND).',
                        '`#tag1 AND #tag2` Her iki etiketi bul (açık AND).',
                        '`#tag1 OR #tag2` Etiketlerden herhangi birini bul.',
                        '`#a OR #b AND #c` AND daha yüksek önceliğe sahip: `#a` veya hem `#b` hem `#c` ile eşleşir.',
                        'Cmd/Ctrl+Tıklama ile etiketi AND olarak ekleyin. Cmd/Ctrl+Shift+Tıklama ile OR olarak ekleyin.'
                    ]
                },
                properties: {
                    title: 'Özellikler',
                    items: [
                        '`.key` Özellik anahtarına sahip notları dahil et.',
                        '`.key=value` Özellik değeri `value` içeren notları dahil et.',
                        '`."Reading Status"` Boşluk içeren özellik anahtarına sahip notları dahil et.',
                        '`."Reading Status"="In Progress"` Boşluk içeren anahtarlar ve değerler çift tırnak içine alınmalıdır.',
                        '`-.key` Özellik anahtarına sahip notları hariç tut.',
                        '`-.key=value` Özellik değeri `value` içeren notları hariç tut.',
                        'Cmd/Ctrl+Tıklayarak özelliği AND ile ekleyin. Cmd/Ctrl+Shift+Tıklayarak OR ile ekleyin.'
                    ]
                },
                tasks: {
                    title: 'Filtreler',
                    items: [
                        '`has:task` Tamamlanmamış görevleri olan notları dahil et.',
                        '`-has:task` Tamamlanmamış görevleri olan notları hariç tut.',
                        '`folder:meetings` Klasör adı `meetings` içeren notları dahil et.',
                        '`folder:/work/meetings` Yalnızca `work/meetings` içindeki notları dahil et (alt klasörler hariç).',
                        '`folder:/` Yalnızca kasa kök dizinindeki notları dahil et.',
                        '`-folder:archive` Klasör adı `archive` içeren notları hariç tut.',
                        '`-folder:/archive` Yalnızca `archive` içindeki notları hariç tut (alt klasörler hariç).',
                        '`ext:md` Uzantısı `md` olan notları dahil et (`ext:.md` de desteklenir).',
                        '`-ext:pdf` Uzantısı `pdf` olan notları hariç tut.',
                        'Etiketler, isimler ve tarihlerle birleştirin (örneğin: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'AND/OR davranışı',
                    items: [
                        '`AND` ve `OR` yalnızca etiket ve özellik sorgularında operatör olarak çalışır.',
                        'Etiket ve özellik sorguları yalnızca etiket ve özellik filtrelerini içerir: `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`.',
                        'Bir sorgu adlar, tarihler (`@...`), görev filtreleri (`has:task`), klasör filtreleri (`folder:...`) veya uzantı filtreleri (`ext:...`) içeriyorsa, `AND` ve `OR` kelime olarak aranır.',
                        'Örnek operatör sorgusu: `#work OR .status=started`.',
                        'Karma sorgu örneği: `#work OR ext:md` (`OR` dosya adlarında aranır).'
                    ]
                },
                dates: {
                    title: 'Tarihler',
                    items: [
                        '`@today` Varsayılan tarih alanını kullanarak bugünkü notları bul.',
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` Göreli tarih aralıkları.',
                        '`@2026-02-07` Belirli bir günü bul (`@20260207` de desteklenir).',
                        '`@2026` Bir takvim yılını bul.',
                        '`@2026-02` veya `@202602` Bir takvim ayını bul.',
                        '`@2026-W05` veya `@2026W05` Bir ISO haftasını bul.',
                        '`@2026-Q2` veya `@2026Q2` Bir takvim çeyreğini bul.',
                        '`@13/02/2026` Ayırıcılı sayısal formatlar (`@07022026` belirsizlikte yerel ayarınızı takip eder).',
                        '`@2026-02-01..2026-02-07` Kapsayıcı bir gün aralığı bul (açık uçlar desteklenir).',
                        '`@c:...` veya `@m:...` Oluşturma veya değiştirme tarihini hedefle.',
                        '`-@...` Bir tarih eşleşmesini hariç tut.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'Kasadaki tam metin araması, geçerli klasör veya seçili etiketlere göre filtrelenir.',
                        'Büyük kasalarda 3 karakterden az ile yavaş olabilir.',
                        'ASCII olmayan karakterler içeren yolları veya alt yolları doğru şekilde arayamaz.',
                        'Klasör filtrelemesinden önce sınırlı sonuç döndürür, bu nedenle başka yerlerde çok sayıda eşleşme varsa ilgili dosyalar görünmeyebilir.',
                        'Not önizlemeleri varsayılan önizleme metni yerine Omnisearch alıntılarını gösterir.'
                    ]
                }
            }
        }
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'Yeni sekmede aç',
            openToRight: 'Sağda aç',
            openInNewWindow: 'Yeni pencerede aç',
            openMultipleInNewTabs: '{count} notu yeni sekmelerde aç',
            openMultipleFilesInNewTabs: '{count} dosyayı yeni sekmelerde aç',
            openMultipleToRight: '{count} notu sağda aç',
            openMultipleFilesToRight: '{count} dosyayı sağda aç',
            openMultipleInNewWindows: '{count} notu yeni pencerelerde aç',
            openMultipleFilesInNewWindows: '{count} dosyayı yeni pencerelerde aç',
            pinNote: 'Notu sabitle',
            pinFile: 'Dosyayı sabitle',
            unpinNote: 'Not sabitlemesini kaldır',
            unpinFile: 'Dosya sabitlemesini kaldır',
            pinMultipleNotes: '{count} notu sabitle',
            pinMultipleFiles: '{count} dosyayı sabitle',
            unpinMultipleNotes: '{count} notun sabitlemesini kaldır',
            unpinMultipleFiles: '{count} dosyanın sabitlemesini kaldır',
            duplicateNote: 'Notu çoğalt',
            duplicateFile: 'Dosyayı çoğalt',
            duplicateMultipleNotes: '{count} notu çoğalt',
            duplicateMultipleFiles: '{count} dosyayı çoğalt',
            openVersionHistory: 'Sürüm geçmişini aç',
            revealInFolder: 'Klasörde göster',
            revealInFinder: "Finder'da göster",
            showInExplorer: 'Sistem gezgininde göster',
            openInDefaultApp: 'Varsayılan uygulamada aç',
            renameNote: 'Notu yeniden adlandır',
            renameFile: 'Dosyayı yeniden adlandır',
            deleteNote: 'Notu sil',
            deleteFile: 'Dosyayı sil',
            setCalendarHighlight: 'Vurgulamayı ayarla',
            removeCalendarHighlight: 'Vurgulamayı kaldır',
            deleteMultipleNotes: '{count} notu sil',
            deleteMultipleFiles: '{count} dosyayı sil',
            moveNoteToFolder: 'Notu taşı...',
            moveFileToFolder: 'Dosyayı taşı...',
            moveMultipleNotesToFolder: '{count} notu taşı...',
            moveMultipleFilesToFolder: '{count} dosyayı taşı...',
            mergeNotes: '{count} notu birleştir...',
            mergeNotesInGroup: 'Gruptaki notları birleştir...',
            setManualSortGroupHeader: 'Grup başlığını ayarla',
            changeManualSortGroupHeader: 'Grup başlığını değiştir',
            manualSortGroupHeader: {
                title: 'Grup başlığı',
                copyStyle: 'Başlık stilini kopyala',
                pasteStyle: 'Başlık stilini yapıştır',
                remove: 'Grup başlığını kaldır'
            },
            addTag: 'Etiket ekle',
            addPropertyKey: 'Özellik ayarla',
            removeTag: 'Etiketi kaldır',
            removeAllTags: 'Tüm etiketleri kaldır',
            changeIcon: 'Simgeyi değiştir',
            changeColor: 'Rengi değiştir'
        },
        folder: {
            newNote: 'Yeni not',
            newNoteFromTemplate: 'Şablondan yeni not',
            newFolder: 'Yeni klasör',
            newCanvas: 'Yeni tuval',
            newBase: 'Yeni veritabanı',
            newDrawing: 'Yeni çizim',
            newExcalidrawDrawing: 'Yeni Excalidraw çizimi',
            newTldrawDrawing: 'Yeni Tldraw çizimi',
            duplicateFolder: 'Klasörü çoğalt',
            searchInFolder: 'Klasörde ara',
            createFolderNote: 'Klasör notu oluştur',
            detachFolderNote: 'Klasör notunu ayır',
            deleteFolderNote: 'Klasör notunu sil',
            changeIcon: 'Simgeyi değiştir',
            changeColor: 'Rengi değiştir',
            changeBackground: 'Arka planı değiştir',
            excludeFolder: 'Klasörü gizle',
            unhideFolder: 'Klasörü göster',
            excludeFromDescendants: 'Üst klasörlerde gizle',
            includeInDescendants: 'Üst klasörlerde göster',
            hiddenFromParentsIndicator: 'Üst klasör listelerinde gizli',
            moveFolder: 'Klasörü taşı...',
            renameFolder: 'Klasörü yeniden adlandır',
            deleteFolder: 'Klasörü sil'
        },
        tag: {
            changeIcon: 'Simgeyi değiştir',
            changeColor: 'Rengi değiştir',
            changeBackground: 'Arka planı değiştir',
            showTag: 'Etiketi göster',
            hideTag: 'Etiketi gizle'
        },
        property: {
            addKey: 'Özellik anahtarlarını yapılandır',
            renameKey: 'Özelliği yeniden adlandır',
            deleteKey: 'Özelliği sil'
        },
        navigation: {
            addSeparator: 'Ayırıcı ekle',
            removeSeparator: 'Ayırıcıyı kaldır'
        },
        copyPath: {
            title: 'Yolu kopyala',
            asObsidianUrl: 'Obsidian URL olarak',
            fromVaultFolder: 'kasa klasöründen',
            fromSystemRoot: 'sistem kökünden'
        },
        style: {
            title: 'Stil',
            copy: 'Stili kopyala',
            paste: 'Stili yapıştır',
            removeIcon: 'Simgeyi kaldır',
            removeColor: 'Rengi kaldır',
            removeBackground: 'Arka planı kaldır',
            clear: 'Stili temizle'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        appearance: 'Görünüm',
        sortBy: 'Sıralama ölçütü',
        standardPreset: 'Standart',
        compactPreset: 'Kompakt',
        defaultSuffix: '(varsayılan)',
        defaultLabel: 'Varsayılan',
        titleRows: 'Başlık satırları',
        previewRows: 'Önizleme satırları',
        groupBy: 'Grupla',
        titleRowOption: (rows: number) => `${rows} başlık satırı`,
        previewRowOption: (rows: number) => `${rows} önizleme satırı`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Uygula',
            applySortAndGroupTitle: (target: string) => `Sıralama ve gruplandırma ${target} için uygulansın mı?`,
            applyAppearanceTitle: (target: string) => `Görünüm ${target} için uygulansın mı?`,
            affectedCountMessage: (count: number) => `Değişecek mevcut geçersiz kılmalar: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'Manuel sıralama kullanılsın mı?',
            propertySortMessage: (property: string, count: number) =>
                `Bu, geçerli görünümü "${property}" kullanarak manuel sıralamaya geçirir. Sıralamayı düzenlemek, gerektiğinde ${count} ${count === 1 ? 'nottaki' : 'nottaki'} bu özelliğe sayısal indeks değerleri yazar.`,
            propertySortConfirmButton: 'Manuel sıralamayı kullan',
            removePropertyTitle: 'Sıralama özelliği kaldırılsın mı?',
            removePropertyMessage: (property: string, count: number) =>
                `Bu işlem, geçerli listedeki ${count} ${count === 1 ? 'nottan' : 'nottan'} "${property}" özelliğini kaldırır. Bu notlar için manuel sıralama düzeni temizlenecek.`,
            removePropertyConfirmButton: 'Özelliği kaldır',
            compactTitle: 'İndeks değerleri sıkıştırılsın mı?',
            compactMessage: (count: number) =>
                `Bu yeniden sıralama daha fazla sayısal alana ihtiyaç duyar. ${count} ${count === 1 ? 'not' : 'not'} yeni indeks değerleri alacak.`,
            compactConfirmButton: 'İndeks değerlerini sıkıştır'
        },
        manualSortGroupHeader: {
            title: 'Grup başlığını ayarla',
            titleLabel: 'Başlık',
            placeholder: 'Grup başlığı',
            icon: 'Simge',
            color: 'Renk',
            wordCount: 'Kelime sayısını göster',
            wordCountTarget: 'Hedef kelime sayısı',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'Bu alan boş olduğunda grup hedefi, Ayarlar > Notlar > Kelime ve karakter sayısı içinde ayarlanan hedef özelliğini kullanır. Bu grup için bir hedef değeri ayarlayarak geçersiz kılın.',
            description: 'Bu not için grup başlığını özelleştirin. Başlığı kaldırmak için başlığı boş bırakın.'
        },
        mergeNotes: {
            title: 'Notları birleştir',
            summary: '{folder} içindeki {count} nottan tek bir not oluştur.',
            frontmatterRule: 'İlk notun frontmatter bölümü korunur. Diğer notların frontmatter bölümü kaldırılır.',
            crossFolderWarning: 'Kaynak notlar farklı klasörlerde. Birleştirilen notta göreli bağlantılar ve gömmeler çalışmayabilir.',
            outputName: 'Çıktı adı',
            outputNameDesc: 'Birleştirilen not yukarıda gösterilen klasörde oluşturulur.',
            outputNamePlaceholder: 'Birleştirilmiş notlar',
            separator: 'Ayırıcı',
            separatorDesc: 'Notların arasına eklenir.',
            separatorOptions: {
                none: 'Yok',
                blankLine: 'Boş satır',
                horizontalRule: 'Yatay çizgi',
                heading: 'Not başlığıyla başlık'
            },
            moveSourcesToTrash: 'Birleştirdikten sonra kaynak notları çöp kutusuna taşı',
            mergeButton: 'Birleştir'
        },
        navRainbowSection: {
            title: (section: string) => `Gökkuşağı renkleri: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'Simge ara...',
            recentlyUsedHeader: 'Son kullanılanlar',
            emptyStateSearch: 'Simgeleri aramak için yazmaya başlayın',
            emptyStateNoResults: 'Simge bulunamadı',
            showingResultsInfo: '{count} sonuçtan 50 tanesi gösteriliyor. Daraltmak için daha fazla yazın.',
            emojiInstructions: 'Simge olarak kullanmak için herhangi bir emoji yazın veya yapıştırın',
            removeIcon: 'Simgeyi kaldır',
            removeFromRecents: 'Son kullanılanlardan kaldır',
            allTabLabel: 'Tümü'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Kural ekle'
        },
        interfaceIcons: {
            title: 'Arayüz simgeleri',
            fileItemsSection: 'Dosya öğeleri',
            items: {
                'nav-shortcuts': 'Kısayollar',
                'nav-recent-files': 'Son dosyalar',
                'nav-expand-all': 'Tümünü genişlet',
                'nav-collapse-all': 'Tümünü daralt',
                'nav-calendar': 'Takvim',
                'nav-tree-expand': 'Ağaç oku: genişlet',
                'nav-tree-collapse': 'Ağaç oku: daralt',
                'nav-hidden-items': 'Gizli öğeler',
                'nav-root-reorder': 'Kök klasörleri yeniden sırala',
                'nav-new-folder': 'Yeni klasör',
                'nav-show-single-pane': 'Tek bölme göster',
                'nav-show-dual-pane': 'Çift bölme göster',
                'nav-profile-chevron': 'Profil menüsü oku',
                'list-search': 'Ara',
                'list-reveal-file': 'Dosyayı göster',
                'list-descendants': 'Alt klasörlerden notlar',
                'list-sort-ascending': 'Sıralama: artan',
                'list-sort-descending': 'Sıralama: azalan',
                'list-sort-modified': 'Düzenlenme tarihine göre sırala',
                'list-sort-created': 'Oluşturulma tarihine göre sırala',
                'list-sort-title': 'Başlığa göre sırala',
                'list-sort-filename': 'Dosya adına göre sırala',
                'list-sort-property': 'Özelliğe göre sırala',
                'list-appearance': 'Görünümü değiştir',
                'list-new-note': 'Yeni not',
                'list-pinned': 'Sabitlenmiş notlar',
                'nav-folder-open': 'Klasör açık',
                'nav-folder-closed': 'Klasör kapalı',
                'nav-tags': 'Etiketler',
                'nav-tag': 'Etiket',
                'nav-properties': 'Özellikler',
                'nav-property': 'Özellik',
                'nav-property-value': 'Değer',
                'file-unfinished-task': 'Tamamlanmamış görevler',
                'file-word-count': 'Kelime sayısı',
                'file-character-count': 'Karakter sayısı'
            }
        },
        colorPicker: {
            currentColor: 'Mevcut',
            newColor: 'Yeni',
            paletteDefault: 'Varsayılan',
            paletteCustom: 'Özel',
            copyColors: 'Rengi kopyala',
            colorsCopied: 'Renk panoya kopyalandı',
            pasteColors: 'Rengi yapıştır',
            pasteClipboardError: 'Pano okunamadı',
            pasteInvalidFormat: 'Hex renk değeri bekleniyor',
            colorsPasted: 'Renk başarıyla yapıştırıldı',
            resetUserColors: 'Özel renkleri temizle',
            clearCustomColorsConfirm: 'Tüm özel renkler kaldırılsın mı?',
            userColorSlot: 'Renk {slot}',
            recentColors: 'Son renkler',
            clearRecentColors: 'Son renkleri temizle',
            removeRecentColor: 'Rengi kaldır',
            apply: 'Uygula',
            pickerLabel: 'Seçici',
            hexLabel: 'HEX',
            hexInputLabel: 'HEX renk değeri',
            saturationValueArea: 'Doygunluk ve parlaklık',
            hueSlider: 'Ton',
            alphaSlider: 'Saydamlık'
        },
        appearance: {
            tabIcon: 'Simge',
            tabColor: 'Renk',
            tabBackground: 'Arka plan',
            resetIcon: 'Simgeyi kaldır',
            resetColor: 'Rengi kaldır',
            resetBackground: 'Arka planı kaldır',
            clear: 'Stili temizle',
            apply: 'Uygula'
        },
        selectVaultProfile: {
            title: 'Kasa profili seç',
            currentBadge: 'Aktif',
            emptyState: 'Kullanılabilir kasa profili yok.'
        },
        tagOperation: {
            renameTitle: '{tag} etiketini yeniden adlandır',
            deleteTitle: '{tag} etiketini sil',
            newTagPrompt: 'Yeni etiket adı',
            newTagPlaceholder: 'Yeni etiket adını girin',
            renameWarning: '{oldTag} etiketini yeniden adlandırmak {count} {files} değiştirecek.',
            deleteWarning: '{tag} etiketini silmek {count} {files} değiştirecek.',
            modificationWarning: 'Bu işlem dosya değişiklik tarihlerini güncelleyecek.',
            affectedFiles: 'Etkilenen dosyalar:',
            andMore: '...ve {count} tane daha',
            confirmRename: 'Etiketi yeniden adlandır',
            renameUnchanged: '{tag} değiştirilmedi',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            renameBatchNotFinalized:
                '{renamed}/{total} yeniden adlandırıldı. Güncellenmeyen: {notUpdated}. Meta veriler ve kısayollar güncellenmedi.',
            invalidTagName: 'Geçerli bir etiket adı girin.',
            descendantRenameError: 'Bir etiket kendisine veya alt öğesine taşınamaz.',
            confirmDelete: 'Etiketi sil',
            deleteBatchNotFinalized:
                '{removed}/{total} öğeden kaldırıldı. Güncellenmeyen: {notUpdated}. Meta veriler ve kısayollar güncellenmedi.',
            checkConsoleForDetails: 'Ayrıntılar için konsolu kontrol edin.',
            file: 'dosya',
            files: 'dosya',
            inlineParsingWarning: {
                title: 'Satır içi etiket uyumluluğu',
                message:
                    "{tag}, Obsidian'ın satır içi etiketlerde ayrıştıramadığı karakterler içeriyor. Frontmatter etiketleri etkilenmez.",
                confirm: 'Yine de kullan'
            }
        },
        propertyOperation: {
            renameTitle: '{property} özelliğini yeniden adlandır',
            deleteTitle: '{property} özelliğini sil',
            newKeyPrompt: 'Yeni özellik adı',
            newKeyPlaceholder: 'Yeni özellik adını girin',
            renameWarning: '{property} özelliğinin yeniden adlandırılması {count} {files} değiştirecek.',
            renameConflictWarning:
                '{newKey} özelliği zaten {count} {files} içinde mevcut. {oldKey} yeniden adlandırıldığında mevcut {newKey} değerleri değiştirilecek.',
            deleteWarning: '{property} özelliğinin silinmesi {count} {files} değiştirecek.',
            confirmRename: 'Özelliği yeniden adlandır',
            confirmDelete: 'Özelliği sil',
            renameNoChanges: '{oldKey} → {newKey} (değişiklik yok)',
            renameSettingsUpdateFailed: '{oldKey} → {newKey} özelliği yeniden adlandırıldı. Ayarlar güncellenemedi.',
            deleteSingleSuccess: '{property} özelliği 1 nottan silindi',
            deleteMultipleSuccess: '{property} özelliği {count} nottan silindi',
            deleteSettingsUpdateFailed: '{property} özelliği silindi. Ayarlar güncellenemedi.',
            invalidKeyName: 'Geçerli bir özellik adı girin.'
        },
        fileSystem: {
            newFolderTitle: 'Yeni klasör',
            renameFolderTitle: 'Klasörü yeniden adlandır',
            renameFileTitle: 'Dosyayı yeniden adlandır',
            deleteFolderTitle: "'{name}' silinsin mi?",
            deleteFileTitle: "'{name}' silinsin mi?",
            deleteFileAttachmentsTitle: 'Dosya ekleri silinsin mi?',
            moveFileConflictTitle: 'Taşıma çakışması',
            folderNamePrompt: 'Klasör adını girin:',
            hideInOtherVaultProfiles: 'Diğer kasa profillerinde gizle',
            renamePrompt: 'Yeni adı girin:',
            renameVaultTitle: 'Kasa görünen adını değiştir',
            renameVaultPrompt: 'Özel görünen ad girin (varsayılanı kullanmak için boş bırakın):',
            deleteFolderConfirm: 'Bu klasörü ve tüm içeriğini silmek istediğinizden emin misiniz?',
            deleteFileConfirm: 'Bu dosyayı silmek istediğinizden emin misiniz?',
            deleteFileAttachmentsDescriptionSingle: 'Bu ek artık hiçbir notta kullanılmıyor. Silmek ister misiniz?',
            deleteFileAttachmentsDescriptionMultiple: 'Bu ekler artık hiçbir notta kullanılmıyor. Silmek ister misiniz?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Dosya ağacı',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Galeri',
            moveFileConflictDescriptionSingle: '"{folder}" içinde bir dosya çakışması bulundu.',
            moveFileConflictDescriptionMultiple: '"{folder}" içinde {count} dosya çakışması bulundu.',
            moveFileConflictAffectedFiles: 'Etkilenen dosyalar',
            moveFileConflictItem: '"{name}" -> "{suggested}"{renameOnly}',
            moveFileConflictRenameOnly: '(yalnızca yeniden adlandır)',
            moveFileConflictRename: 'Yeniden adlandır',
            moveFileConflictOverwrite: 'Üzerine yaz',
            removeAllTagsTitle: 'Tüm etiketleri kaldır',
            removeAllTagsFromNote: 'Bu nottan tüm etiketleri kaldırmak istediğinizden emin misiniz?',
            removeAllTagsFromNotes: '{count} nottan tüm etiketleri kaldırmak istediğinizden emin misiniz?'
        },
        folderNoteType: {
            title: 'Klasör notu türünü seçin',
            folderLabel: 'Klasör: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `${name} klasörüne taşı...`,
            multipleFilesLabel: (count: number) => `${count} dosya`,
            navigatePlaceholder: 'Klasöre git...',
            instructions: {
                navigate: 'gezinmek için',
                move: 'taşımak için',
                select: 'seçmek için',
                dismiss: 'kapatmak için'
            }
        },
        homepage: {
            placeholder: 'Dosya ara...',
            instructions: {
                navigate: 'gezinmek için',
                select: 'ana sayfa olarak ayarlamak için',
                dismiss: 'kapatmak için'
            }
        },
        calendarTemplate: {
            placeholder: 'Şablon ara...',
            instructions: {
                navigate: 'gezinmek için',
                select: 'şablon seçmek için',
                dismiss: 'kapatmak için'
            }
        },
        navigationBanner: {
            placeholder: 'Görsel ara...',
            svgMissingDimensions: 'Seçilen SVG dosyası genişlik, yükseklik veya viewBox tanımlamıyor.',
            instructions: {
                navigate: 'gezinmek için',
                select: 'afiş olarak ayarlamak için',
                dismiss: 'kapatmak için'
            }
        },
        tagSuggest: {
            navigatePlaceholder: 'Etikete git...',
            addPlaceholder: 'Eklenecek etiketi ara...',
            removePlaceholder: 'Kaldırılacak etiketi seç...',
            createNewTag: 'Yeni etiket oluştur: #{tag}',
            instructions: {
                navigate: 'gezinmek için',
                select: 'seçmek için',
                dismiss: 'kapatmak için',
                add: 'etiket eklemek için',
                remove: 'etiketi kaldırmak için'
            }
        },
        propertySuggest: {
            placeholder: 'Özellik anahtarı seç...',
            navigatePlaceholder: 'Özelliğe git...',
            instructions: {
                navigate: 'gezinmek için',
                select: 'özellik eklemek için',
                dismiss: 'kapatmak için'
            }
        },
        propertyKeyVisibility: {
            title: 'Özellik anahtarı görünürlüğü',
            description:
                'Özellik değerlerinin nerede gösterileceğini kontrol edin. Sütunlar gezinme paneli, liste paneli ve dosya bağlam menüsüne karşılık gelir. Alt satırı kullanarak bir sütundaki tüm satırları değiştirin.',
            searchPlaceholder: 'Özellik anahtarlarını ara...',
            propertyColumnLabel: 'Özellik',
            showInNavigation: 'Gezinmede göster',
            showInList: 'Listede göster',
            showInFileMenu: 'Dosya menüsünde göster',
            toggleAllInNavigation: 'Gezinmede tümünü değiştir',
            toggleAllInList: 'Listede tümünü değiştir',
            toggleAllInFileMenu: 'Dosya menüsünde tümünü değiştir',
            applyButton: 'Uygula',
            emptyState: 'Özellik anahtarı bulunamadı.'
        },
        welcome: {
            title: '{pluginName} uygulamasına hoş geldiniz',
            introText:
                'Merhaba! Başlamadan önce, panellerin ve "Alt klasörlerden notları göster" düğmesinin nasıl çalıştığını anlamak için aşağıdaki videonun ilk beş dakikasını izlemenizi şiddetle tavsiye ederim.',
            continueText:
                'Beş dakikanız daha varsa, kompakt görüntüleme modlarını ve kısayolları ile önemli kısayol tuşlarını doğru şekilde nasıl ayarlayacağınızı anlamak için videoyu izlemeye devam edin.',
            thanksText: 'İndirdiğiniz için çok teşekkürler, keyifli kullanımlar!',
            videoAlt: 'Notebook Navigator kurulumu ve ustalaşma',
            openVideoButton: 'Videoyu oynat',
            closeButton: 'Belki sonra'
        }
    },
    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Klasör oluşturulamadı: {error}',
            createFile: 'Dosya oluşturulamadı: {error}',
            renameFolder: 'Klasör yeniden adlandırılamadı: {error}',
            renameFolderNoteConflict: 'Yeniden adlandırılamıyor: "{name}" bu klasörde zaten var',
            renameFile: 'Dosya yeniden adlandırılamadı: {error}',
            deleteFolder: 'Klasör silinemedi: {error}',
            deleteFile: 'Dosya silinemedi: {error}',
            deleteAttachments: 'Ekler silinemedi: {error}',
            mergeNotes: 'Notlar birleştirilemedi: {error}',
            mergeNotesOpenOutput: 'Birleştirilmiş not {name} olarak oluşturuldu, ancak açılamadı: {error}. Kaynak notlar değiştirilmedi.',
            mergeNotesOpenSkipped: 'Başka bir dosya açma isteği öncelik kazandı.',
            mergeNotesTrashSources: 'Birleştirilmiş not oluşturuldu. {count} kaynak not çöp kutusuna taşınamadı.',
            duplicateNote: 'Not çoğaltılamadı: {error}',
            duplicateFolder: 'Klasör çoğaltılamadı: {error}',
            openVersionHistory: 'Sürüm geçmişi açılamadı: {error}',
            versionHistoryNotFound: 'Sürüm geçmişi komutu bulunamadı. Obsidian Sync etkin olduğundan emin olun.',
            revealInExplorer: 'Dosya sistem gezgininde gösterilemedi: {error}',
            openInDefaultApp: 'Varsayılan uygulamada açılamadı: {error}',
            openInDefaultAppNotAvailable: 'Varsayılan uygulamada açma bu platformda kullanılamaz',
            folderNoteAlreadyExists: 'Klasör notu zaten var',
            folderAlreadyExists: '"{name}" klasörü zaten var',
            folderNotesDisabled: 'Dosyaları dönüştürmek için ayarlarda klasör notlarını etkinleştirin',
            folderNoteAlreadyLinked: 'Bu dosya zaten klasör notu olarak işlev görüyor',
            folderNoteNotFound: 'Seçili klasörde klasör notu yok',
            folderNoteUnsupportedExtension: 'Desteklenmeyen dosya uzantısı: {extension}',
            folderNoteMoveFailed: 'Dönüştürme sırasında dosya taşınamadı: {error}',
            folderNoteRenameConflict: 'Klasörde "{name}" adlı bir dosya zaten var',
            folderNoteConversionFailed: 'Dosya klasör notuna dönüştürülemedi',
            folderNoteConversionFailedWithReason: 'Dosya klasör notuna dönüştürülemedi: {error}',
            folderNoteOpenFailed: 'Dosya dönüştürüldü ancak klasör notu açılamadı: {error}',
            failedToDeleteFile: '{name} silinemedi: {error}',
            failedToDeleteMultipleFiles: '{count} dosya silinemedi',
            versionHistoryNotAvailable: 'Sürüm geçmişi hizmeti kullanılamıyor',
            drawingAlreadyExists: 'Bu isimde bir çizim zaten var',
            failedToCreateDrawing: 'Çizim oluşturulamadı',
            noFolderSelected: "Notebook Navigator'da klasör seçili değil",
            noFileSelected: 'Dosya seçili değil'
        },
        warnings: {
            linkBreakingNameCharacters: 'Bu ad, Obsidian bağlantılarını bozan karakterler içeriyor: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'Adlar nokta ile başlayamaz ve : veya / içeremez.',
            forbiddenNameCharactersWindows: 'Windows için ayrılmış karakterlere izin verilmez: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'Klasör gizlendi: {name}',
            showFolder: 'Klasör gösterildi: {name}',
            folderExcludedFromDescendants: 'Üst klasör listelerinde gizli: {name}',
            folderIncludedInDescendants: 'Üst klasör listelerinde gösteriliyor: {name}',
            mergeNotes: '{count} not {name} içine birleştirildi'
        },
        notifications: {
            deletedMultipleFiles: '{count} dosya silindi',
            movedMultipleFiles: '{count} dosya {folder} klasörüne taşındı',
            folderNoteConversionSuccess: 'Dosya "{name}" içinde klasör notuna dönüştürüldü',
            folderMoved: '"{name}" klasörü taşındı',
            deepLinkCopied: 'Obsidian URL panoya kopyalandı',
            pathCopied: 'Yol panoya kopyalandı',
            relativePathCopied: 'Göreli yol panoya kopyalandı',
            tagAddedToNote: '1 nota etiket eklendi',
            tagAddedToNotes: '{count} nota etiket eklendi',
            tagRemovedFromNote: '1 nottan etiket kaldırıldı',
            tagRemovedFromNotes: '{count} nottan etiket kaldırıldı',
            tagsClearedFromNote: '1 nottan tüm etiketler temizlendi',
            tagsClearedFromNotes: '{count} nottan tüm etiketler temizlendi',
            noTagsToRemove: 'Kaldırılacak etiket yok',
            noFilesSelected: 'Dosya seçili değil',
            mergeNotesRequireMultipleMarkdown: 'Birleştirmek için en az iki Markdown notu seçin',
            tagOperationsNotAvailable: 'Etiket işlemleri kullanılamıyor',
            propertyOperationsNotAvailable: 'Özellik işlemleri kullanılamıyor',
            tagsRequireMarkdown: 'Etiketler yalnızca Markdown notlarında desteklenir',
            propertiesRequireMarkdown: 'Özellikler yalnızca Markdown notlarında desteklenir',
            propertySetOnNote: '1 notta özellik güncellendi',
            propertySetOnNotes: '{count} notta özellik güncellendi',
            manualSortPropertyRemovedFromNote: '1 nottan sıralama özelliği kaldırıldı',
            manualSortPropertyRemovedFromNotes: '{count} nottan sıralama özelliği kaldırıldı',
            iconPackDownloaded: '{provider} indirildi',
            iconPackUpdated: '{provider} güncellendi ({version})',
            iconPackRemoved: '{provider} kaldırıldı',
            iconPackLoadFailed: '{provider} yüklenemedi',
            hiddenFileReveal: 'Dosya gizli. Görüntülemek için "Gizli öğeleri göster" seçeneğini etkinleştirin'
        },
        confirmations: {
            deleteMultipleFiles: '{count} dosyayı silmek istediğinizden emin misiniz?',
            deleteConfirmation: 'Bu işlem geri alınamaz.'
        },
        defaultNames: {
            untitled: 'Başlıksız'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Klasör kendisine veya alt klasörüne taşınamaz.',
            itemAlreadyExists: 'Bu konumda "{name}" adlı bir öğe zaten var.',
            failedToMove: 'Taşınamadı: {error}',
            failedToAddTag: '"{tag}" etiketi eklenemedi',
            failedToSetProperty: 'Özellik güncellenemedi: {error}',
            failedToClearTags: 'Etiketler temizlenemedi',
            failedToMoveFolder: '"{name}" klasörü taşınamadı',
            failedToImportFiles: 'İçe aktarılamadı: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} dosya hedefte zaten var',
            filesAlreadyHaveTag: '{count} dosyada bu etiket veya daha özel bir etiket zaten var',
            filesAlreadyHaveProperty: '{count} dosya zaten bu özelliğe sahip',
            noTagsToClear: 'Temizlenecek etiket yok',
            fileImported: '1 dosya içe aktarıldı',
            filesImported: '{count} dosya içe aktarıldı'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'Bugün',
        yesterday: 'Dün',
        previous7Days: 'Son 7 gün',
        previous30Days: 'Son 30 gün'
    },

    // Plugin commands
    commands: {
        open: 'Aç', // Command palette: Opens the Notebook Navigator view (English: Open)
        toggleLeftSidebar: 'Sol kenar çubuğunu aç/kapat', // Command palette: Toggles left sidebar, opening Notebook Navigator when uncollapsing (English: Toggle left sidebar)
        openHomepage: 'Ana sayfayı aç', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        openDailyNote: 'Günlük notu aç',
        openWeeklyNote: 'Haftalık notu aç',
        openMonthlyNote: 'Aylık notu aç',
        openQuarterlyNote: 'Çeyreklik notu aç',
        openYearlyNote: 'Yıllık notu aç',
        revealFile: 'Dosyayı göster', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Ara', // Command palette: Toggle search in the file list (English: Search)
        searchVaultRoot: 'Tüm kasada ara', // Command palette: Selects the vault root folder and focuses search with subfolders included (English: Search whole vault)
        toggleDualPane: 'Çift bölme düzenini aç/kapat', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        toggleDualPaneOrientation: 'Çift bölme yönünü değiştir', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'Takvimi aç/kapat', // Command palette: Toggles showing the calendar overlay in the navigation pane (English: Toggle calendar)
        selectVaultProfile: 'Kasa profili seç', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'Kasa profili 1 seç', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Kasa profili 2 seç', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Kasa profili 3 seç', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Dosyaları sil', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Yeni not oluştur', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Şablondan yeni not', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Dosyaları taşı', // Command palette: Move selected files to another folder (English: Move files)
        mergeNotes: 'Notları birleştir', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'Sonraki dosyayı seç', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Önceki dosyayı seç', // Command palette: Selects the previous file in the current view (English: Select previous file)
        navigateBack: 'Geri git',
        navigateForward: 'İleri git',
        convertToFolderNote: 'Klasör notuna dönüştür', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Klasör notu olarak ayarla', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Klasör notunu ayır', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Tüm klasör notlarını sabitle', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Klasöre git', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Etikete git', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        navigateToProperty: 'Özelliğe git', // Command palette: Navigate to a property key or value using fuzzy search (English: Navigate to property)
        addShortcut: 'Kısayollara ekle', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: 'Kısayol {number} aç',
        toggleDescendants: 'Alt öğeleri aç/kapat', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Gizli klasörleri, etiketleri ve notları aç/kapat', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Etiket sıralama düzenini aç/kapat', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: 'Etiketleri seçime göre aç/kapat',
        togglePropertiesBySelection: 'Özellikleri seçime göre aç/kapat',
        toggleCompactMode: 'Kompakt modu aç/kapat', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Sabitlenmiş bölümü aç/kapat',
        collapseExpand: 'Tüm öğeleri daralt / genişlet', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        collapseExpandSelectedItem: 'Seçili öğeyi daralt / genişlet',
        addTag: 'Seçili dosyalara etiket ekle', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        setProperty: 'Seçili dosyalarda özellik ayarla', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'Seçili dosyalardan etiket kaldır', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Seçili dosyalardan tüm etiketleri kaldır', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        openAllFiles: 'Tüm dosyaları aç', // Command palette: Opens all files in the current folder or tag (English: Open all files)
        rebuildCache: 'Önbelleği yeniden oluştur', // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
        restoreDefaultSettings: 'Varsayılan ayarları geri yükle' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        calendarViewName: 'Takvim', // Name shown in the view header/tab (English: Calendar)
        folderNoteSidebarViewName: 'Klasör notu', // Name shown in the folder note sidebar tab (English: Folder note)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: "Notebook Navigator'da göster", // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
        settingsUnavailableNotice:
            'Notebook Navigator ayarlarını okuyamadı ve başlatılmadı. Kasanız eşitleniyorsa, eşitleme tamamlandıktan sonra Obsidian uygulamasını yeniden başlatın. Varsayılan ayarlarla yeniden başlamak için "Varsayılan ayarları geri yükle" komutunu çalıştırın.', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsRecovery: {
            confirmTitle: 'Varsayılan ayarları geri yükle', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'Bu işlem Notebook Navigator ayar dosyasını varsayılan ayarlarla değiştirir. Kasanız hâlâ eşitleniyorsa, geri yüklenen varsayılanlar diğer cihazlarınızda kayıtlı ayarların üzerine yazabilir. Okunabilir bir ayar dosyası önce eklenti klasöründeki zaman damgalı bir yedeğe kopyalanır.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'Varsayılanları geri yükle', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: 'Ayar kurtarma tamamlanamadı. Yerel tercihler korundu.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'Varsayılan ayarlar geri yüklendi. Bitirmek için Obsidian uygulamasını yeniden başlatın.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Son değiştirilme',
        createdAt: 'Oluşturulma',
        file: 'dosya',
        files: 'dosya',
        folder: 'klasör',
        folders: 'klasör',
        wordCount: 'Kelime sayısı'
    },

    fileCounts: {
        words: '{count} kelime',
        characters: '{count} karakter',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'Varsayılan ayarları değiştir',
        metadataReport: {
            exportSuccess: 'Başarısız meta veri raporu dışa aktarıldı: {filename}',
            exportFailed: 'Meta veri raporu dışa aktarılamadı'
        },
        sections: {
            general: 'Genel',
            vaultFilters: 'Görüntüleme filtreleri',
            appearanceBehavior: 'Görünüm ve davranış',
            navigationPane: 'Gezinme paneli',
            calendar: 'Takvim',
            fileOperations: 'Dosya işlemleri',
            icons: 'Simge paketleri',
            folders: 'Klasörler',
            folderNotes: 'Klasör notları',
            folderNoteFiles: 'Klasör notu dosyaları',
            foldersAndFolderNotes: 'Klasörler ve klasör notları',
            tagsAndProperties: 'Etiketler ve özellikler',
            tags: 'Etiketler',
            listPane: 'Liste paneli',
            notes: 'Dosya görünümü',
            shortcutsAndRecentFiles: 'Kısayollar ve son dosyalar',
            advanced: 'Gelişmiş'
        },
        pageGroups: {
            configuration: 'Yapılandırma',
            navigationAndContent: 'Gezinme paneli',
            notesAndLists: 'Liste paneli',
            calendarAndTools: 'Takvim ve araçlar'
        },
        pageDescriptions: {
            general: 'Sürüm notları, destek, kasa profili, dosya türleri ve özellik anahtarları.',
            vaultFilters: 'Gizli klasörler, etiketler, dosyalar, dosya etiketleri ve özellik kuralları.',
            appearanceBehavior: 'Davranış, klavye ile gezinme, fare düğmeleri, görünüm ve biçimlendirme.',
            navigationPane: 'Yerleşim, görünüm, not sayıları, daraltma davranışı ve gökkuşağı renkleri.',
            shortcuts: 'Kısayol görünürlüğü, rozetler, son dosyalar ve sabitlenmiş öğeler.',
            calendar: 'Takvim görünümü, tarih notları, şablonlar, yerel ayar ve kenar çubuğu konumu.',
            fileOperations: 'Şablonlar, silme onayları, ekler ve dosya taşıma çakışma davranışı.',
            foldersAndFolderNotes: 'Klasör görünümü, klasör notları, klasör notu şablonları ve klasör notu davranışı.',
            tagsProperties: 'Etiket ve özellik bölümleri, simgeler, sıralama, kapsam ve kalıtım.',
            listPane: 'Sıralama, gruplama, liste modları, sabitlenmiş notlar ve çizim önizlemeleri.',
            frontmatter: 'Görüntülenen adlar, zaman damgaları, simgeler ve renkler için frontmatter alanları.',
            notes: 'Başlıklar, önizleme metni, öne çıkan görseller, etiketler, özellikler, tarihler, kelime sayıları ve karakter sayıları.',
            iconPacks: 'Arayüz simgeleri, dosya simgeleri ve simge paketi yönetimi.',
            advanced: 'Tanılama, meta veri temizliği, içe/dışa aktarma ve sıfırlama.'
        },
        groups: {
            general: {
                vaultConfiguration: 'Kasa kurulumu',
                templates: 'Şablonlar',
                behavior: 'Davranış',
                startup: 'Başlangıç',
                keyboardNavigation: 'Klavye ile gezinme',
                mouseButtons: 'Fare düğmeleri',
                view: 'Görünüm',
                icons: 'Simgeler',
                desktopAppearance: 'Masaüstü görünümü',
                mobileAppearance: 'Mobil görünüm',
                formatting: 'Biçimlendirme'
            },
            advanced: {
                maintenance: 'Bakım',
                resetSettings: 'Ayarları sıfırla'
            },
            navigation: {
                appearance: 'Görünüm',
                banner: 'Afiş',
                collapseItems: 'Öğeleri daralt',
                dragAndDrop: 'Sürükle ve bırak',
                noteCounts: 'Not sayıları',
                rainbowColors: 'Gökkuşağı renkleri',
                leftSidebar: 'Sol kenar çubuğu',
                calendarIntegration: 'Takvim entegrasyonu'
            },
            list: {
                display: 'Görünüm',
                groupHeaders: 'Grup başlıkları',
                propertySort: 'Özelliğe göre sıralama',
                manualSort: 'Manuel sıralama',
                pinnedNotes: 'Sabitlenmiş notlar',
                drawingPreviews: 'Çizim önizlemeleri'
            },
            notes: {
                frontmatter: 'Frontmatter alanları',
                tasks: 'Görevler',
                icon: 'Simge',
                title: 'Başlık',
                previewText: 'Önizleme metni',
                featureImage: 'Öne çıkan görsel',
                tags: 'Etiketler',
                properties: 'Özellikler',
                date: 'Tarih',
                parentFolder: 'Üst klasör',
                wordCount: 'Kelime ve karakter sayısı'
            }
        },
        syncMode: {
            notSynced: '(senkronize edilmedi)',
            switchToSynced: 'Senkronizasyonu etkinleştir',
            switchToLocal: 'Senkronizasyonu devre dışı bırak'
        },
        items: {
            listPaneTitle: {
                name: 'Liste bölmesi başlığı',
                desc: 'Liste bölmesi başlığının nerede gösterileceğini seçin.',
                options: {
                    header: 'Başlıkta göster',
                    list: 'Liste bölmesinde göster',
                    hidden: 'Gösterme'
                }
            },
            sortNotesBy: {
                name: 'Varsayılan sıralama düzeni',
                desc: 'Notlar için varsayılan sıralama düzenini seçin.',
                options: {
                    'modified-desc': 'Düzenleme tarihi (en yeni üstte)',
                    'modified-asc': 'Düzenleme tarihi (en eski üstte)',
                    'created-desc': 'Oluşturma tarihi (en yeni üstte)',
                    'created-asc': 'Oluşturma tarihi (en eski üstte)',
                    'title-asc': 'Başlık (A üstte)',
                    'title-desc': 'Başlık (Z üstte)',
                    'filename-asc': 'Dosya adı (A üstte)',
                    'filename-desc': 'Dosya adı (Z üstte)'
                },
                directions: {
                    asc: 'Artan',
                    desc: 'Azalan'
                },
                fields: {
                    modified: 'Düzenleme tarihi',
                    created: 'Oluşturma tarihi',
                    title: 'Başlık',
                    filename: 'Dosya adı',
                    property: 'Özellik'
                }
            },
            propertySortKey: {
                name: 'Sıralama özellikleri',
                desc: 'Özelliğe göre sıralama seçenekleri olarak gösterilen virgülle ayrılmış frontmatter özellikleri. Dizi değerleri tek bir dizede birleştirilir. Bu özellikler değiştirilmez.',
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: 'İkincil sıralama',
                desc: 'Özellik sıralamasında notlar aynı özellik değerine sahip olduğunda veya özellik değeri olmadığında kullanılır.',
                options: {
                    title: 'Başlık',
                    filename: 'Dosya adı',
                    created: 'Oluşturma tarihi',
                    modified: 'Düzenleme tarihi'
                }
            },
            propertySortInstructions: {
                intro: 'Yukarıda listelenen her özellik, liste bölmesindeki sıralama menüsünde bir sıralama seçeneği olarak görünür. Birini seçmek, notları frontmatter değerine göre sıralar.'
            },
            manualSortPropertyKey: {
                name: 'Manuel sıralama özelliği',
                desc: 'Manuel sıralama için sayısal indeks değerlerini saklamak üzere kullanılan frontmatter özelliği.'
            },
            manualSortGroupHeaderProperty: {
                name: 'Grup başlığı özelliği',
                desc: 'Özel grup başlıklarını saklamak üzere kullanılan frontmatter özelliği.'
            },
            groupHeadersInstructions: {
                intro: 'Özel grup başlıkları, liste bölmesinde notların üstünde görüntülenir.',
                items: [
                    'Liste bölmesindeki sıralama menüsünden gruplamayı **Özel** olarak ayarlayın.',
                    'Bir nota sağ tıklayın ve üstüne bir başlık eklemek için **Grup başlığını ayarla** seçeneğini seçin.'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'Yeni not yerleşimi',
                desc: 'Geçerli liste manuel sıralama kullandığında yeni notların nereye yerleştirileceğini seçin.',
                options: {
                    top: 'Üst',
                    bottom: 'Alt',
                    'below-selected-note': 'Seçili notun altında',
                    unsorted: 'Sıralanmamış'
                }
            },
            confirmBeforeManualSort: {
                name: 'Manuel sıralamadan önce onayla',
                desc: 'Manuel sıralama özelliği notlara ilk kez yazılmadan önce bir uyarı göster. Devre dışı bırakıldığında notlar uyarı olmadan özelliği alır.'
            },
            manualSortInstructions: {
                intro: 'Manuel sıralama, her notun frontmatter özelliğine sayısal bir indeks değeri yazar. İndeksi olmayan notlar Sıralanmamış altında görünür.',
                items: [
                    'Sıralama menüsünden **Manuel sıralama** seçeneğini seçerek manuel sıralamayı etkinleştirin. Bundan sonra, notları yeniden düzenlemenin iki yolu vardır.',
                    'Yeniden sıralama görünümünü açmak için sıralama menüsünden **Sıralama düzenini düzenle...** seçeneğini seçin. Notları fareyle veya mobilde dokunarak sürükleyin. Masaüstünde, **Cmd/Ctrl** veya **Shift** ile tıklayarak birden fazla not seçin, ardından herhangi birini sürüklediğinizde tüm grup taşınır.',
                    'Liste bölmesinde, bir notu seçin veya birden fazlasını çoklu seçin, ardından seçimi yukarı veya aşağı taşımak için **Cmd/Ctrl + Arrow Up/Down** tuşlarına basın.'
                ]
            },
            revealFileOnListChanges: {
                name: 'Liste değişikliklerinde seçili dosyaya kaydır',
                desc: 'Notları sabitleme, alt notları gösterme, klasör görünümünü değiştirme veya dosya işlemleri çalıştırma sırasında seçili dosyaya kaydır.'
            },
            includeDescendantNotes: {
                name: 'Alt klasörlerden / alt öğelerden notları göster',
                desc: 'Klasör, etiket veya özellik görüntülerken iç içe alt klasörlerden ve etiket ile özellik alt öğelerinden notları dahil et.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Notları yalnızca kendi klasörlerinde sabitle',
                desc: 'Sabitlenen notlar yalnızca kendi klasörlerinde sabitlenmiş olarak görünür. Klasör notları veya çok sayıda sabitlenmiş notunuz varsa kullanışlıdır. Etiket veya özellik görünümlerini etkilemez.'
            },
            separateNoteCounts: {
                name: 'Mevcut ve alt not sayılarını ayrı göster',
                desc: 'Klasörler, etiketler ve özellikler için not sayılarını "mevcut ▾ alt öğeler" biçiminde göster.'
            },
            groupNotes: {
                name: 'Varsayılan gruplama',
                desc: "Özel, frontmatter'da tanımlanan başlıkları gösterir. Tarih, notları tarihe göre gruplar. Klasör, notları klasöre göre gruplar. Etiket ve özellik görünümleri, klasör seçildiğinde tarih gruplarını kullanır.",
                options: {
                    custom: 'Özel',
                    date: 'Tarih',
                    folder: 'Klasör'
                }
            },
            showSelectedNavigationPills: {
                name: 'Tüm etiket ve özellik rozetlerini her zaman göster',
                desc: 'Devre dışı bırakıldığında, geçerli gezinme seçimiyle eşleşen rozetler gizlenir (ör. "tarifler" etiketine göz atarken "tarifler" etiketi rozeti gizlenir). Tüm rozetlerin görünür kalması için etkinleştirin.'
            },
            stickyGroupHeaders: {
                name: 'Yapışkan grup başlıkları',
                desc: 'Geçerli tarih, klasör veya sabitlenmiş bölüm başlığını kaydırırken görünür tut.'
            },
            showFolderGroupPaths: {
                name: 'Alt klasör yollarını göster',
                desc: 'Liste bölmesinde klasöre göre gruplarken, yalnızca klasör adları yerine alt klasör yollarını göster.'
            },
            showGroupHeaderItemCounts: {
                name: 'Öğe sayılarını göster',
                desc: 'Liste bölmesindeki her grup başlığında öğe sayısını göster.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'Klasör gruplama: geçerli klasör dosyaları altta',
                desc: 'Varsayılan gruplama Klasör olduğunda, seçili klasörde doğrudan bulunan dosyaları alt klasör gruplarının altına taşı.'
            },
            defaultListMode: {
                name: 'Varsayılan liste modu',
                desc: 'Varsayılan liste düzenini seçin. Standart başlık, tarih, açıklama ve önizleme metni gösterir. Kompakt yalnızca başlık gösterir. Klasör başına görünümü geçersiz kıl.',
                options: {
                    standard: 'Standart',
                    compact: 'Kompakt'
                }
            },
            showFileIcons: {
                name: 'Dosya simgelerini göster',
                desc: 'Dosya simgelerini sol hizalı boşlukla göster. Devre dışı bırakma hem simgeleri hem de girintiyi kaldırır. Öncelik: tamamlanmamış görev simgesi > özel simge > klasör simgesi > dosya adı simgesi > dosya türü simgesi > varsayılan simge.'
            },
            useFolderIcon: {
                name: 'Klasör simgesini kullan',
                desc: 'Özel dosya simgesi ayarlanmadığında üst klasörün simgesini görüntüler. Özel dosya rengi ayarlanmadığında klasör rengi kullanılır.'
            },
            showFileIconUnfinishedTask: {
                name: 'Tamamlanmamış görev simgesi',
                desc: 'Bir notta tamamlanmamış görevler olduğunda görev simgesi gösterir.'
            },
            showFileBackgroundUnfinishedTask: {
                name: 'Tamamlanmamış görev arka planı',
                desc: 'Bir notta tamamlanmamış görevler olduğunda arka plan rengi uygular.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'Tamamlanmamış görev arka plan rengi',
                desc: 'Bir notta tamamlanmamış görevler olduğunda kullanılacak arka plan rengini ayarlar.'
            },
            showFilenameMatchIcons: {
                name: 'Dosya adına göre simgeler',
                desc: 'Dosyalara adlarındaki metne göre simge ata.'
            },
            fileNameIconMap: {
                name: 'Dosya adı simge eşlemesi',
                desc: 'Metni içeren dosyalar belirtilen simgeyi alır. Satır başına bir eşleme: metin=simge',
                placeholder: '# metin=simge\ntoplantı=ph-calendar\nfatura=ph-receipt',
                editTooltip: 'Eşlemeleri düzenle'
            },
            showCategoryIcons: {
                name: 'Dosya türüne göre simgeler',
                desc: 'Dosyalara uzantılarına göre simge ata.'
            },
            fileTypeIconPreset: {
                name: 'Dosya simgesi ön ayarı',
                desc: 'Yerleşik simgeleri veya bir simge paketi ön ayarını seçin. Özel uzantı kuralları bu ön ayarı geçersiz kılar.',
                options: {
                    none: 'Yerleşik simgeler'
                },
                notInstalledWarning: 'Bu simge paketi yüklü değil. Bunun yerine yerleşik simgeler gösterilir.'
            },
            fileTypeIconMap: {
                name: 'Dosya türü simge eşlemesi',
                desc: 'Uzantıya sahip dosyalar belirtilen simgeyi alır. Satır başına bir eşleme: uzantı=simge',
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'Eşlemeleri düzenle'
            },
            compactItemHeight: {
                name: 'Kompakt öğe yüksekliği',
                desc: 'Masaüstü ve mobilde kompakt liste öğelerinin yüksekliğini ayarlayın (piksel).',
                resetTooltip: 'Varsayılana sıfırla (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Metni kompakt öğe yüksekliğiyle ölçekle',
                desc: 'Öğe yüksekliği azaltıldığında kompakt liste metnini ölçekle.'
            },
            showParentFolder: {
                name: 'Üst klasörü göster',
                desc: 'Alt klasörlerdeki, etiketlerdeki veya özelliklerdeki notlar için üst klasör adını görüntüle.'
            },
            showParentFolderFullPath: {
                name: 'Klasör yolunu göster',
                desc: 'Yalnızca klasör adı yerine seçili klasöre göre yolu görüntüle. Etiketler ve özellikler tam yolu gösterir.'
            },
            parentFolderClickRevealsFile: {
                name: 'Üst klasöre tıklayarak klasörü aç',
                desc: 'Üst klasör etiketine tıklamak liste panelinde klasörü açar.'
            },
            showParentFolderColor: {
                name: 'Üst klasör rengini göster',
                desc: 'Üst klasör etiketlerinde klasör renklerini kullan.'
            },
            showParentFolderIcon: {
                name: 'Üst klasör simgesini göster',
                desc: 'Üst klasör etiketlerinin yanında klasör simgelerini göster.'
            },
            showQuickActions: {
                name: 'Hızlı eylemleri göster',
                desc: 'Dosyaların üzerine gelirken eylem düğmelerini göster. Düğme kontrolleri hangi eylemlerin görüneceğini seçer.'
            },
            dualPane: {
                name: 'Çift bölme düzeni',
                desc: 'Masaüstünde gezinme bölmesini ve liste bölmesini yan yana göster.'
            },
            dualPaneOrientation: {
                name: 'Çift bölme yönü',
                desc: 'Çift bölme etkinken yatay veya dikey düzen seçin.',
                options: {
                    horizontal: 'Yatay bölme',
                    vertical: 'Dikey bölme'
                }
            },
            narrowSidebarLayout: {
                name: 'Kenar çubuğu çok dar olduğunda',
                desc: 'Gezinme bölmesi ve liste bölmesi yan yana sığmadığında ne olacağını seçin.',
                options: {
                    none: 'Hiçbir şey yapma',
                    singlePane: 'Tek bölmeye geç',
                    vertical: 'Dikey bölmeye geç'
                }
            },
            narrowSidebarTrigger: {
                name: 'Dar kenar çubuğu eşiği',
                desc: 'Kenar çubuğu genişlik eşiğinin nasıl hesaplanacağını seçin.',
                options: {
                    fitPanes: 'Bölmeleri sığdır',
                    customWidth: 'Özel genişlik'
                }
            },
            narrowSidebarCustomWidth: {
                name: 'Dar kenar çubuğu eşik genişliği',
                desc: 'Kenar çubuğu bu genişlikten daha darsa geçiş yap.',
                resetTooltip: 'Varsayılan genişliğe sıfırla'
            },
            appearanceBackground: {
                name: 'Arka plan rengi',
                desc: 'Gezinme ve liste bölmeleri için arka plan renklerini seçin.',
                options: {
                    separate: 'Ayrı arka planlar',
                    primary: 'Liste arka planını kullan',
                    secondary: 'Gezinme arka planını kullan'
                }
            },
            appearanceScale: {
                name: 'Yakınlaştırma seviyesi',
                desc: "Notebook Navigator'ın genel yakınlaştırma seviyesini kontrol eder (yüzde)."
            },
            useFloatingToolbars: {
                name: "iOS/iPadOS'ta kayan araç çubuklarını kullan",
                desc: 'Yalnızca iOS ve iPadOS için geçerlidir.'
            },
            startView: {
                name: 'Varsayılan başlangıç görünümü',
                desc: 'Notebook Navigator açıldığında hangi bölmenin etkin olacağını seçin. Tek bölmeli düzen önce bu bölmeyi gösterir; çift bölmeli düzen klavye odağını bu bölmeye verir.',
                options: {
                    navigation: 'Gezinme bölmesi',
                    files: 'Liste bölmesi'
                }
            },
            toolbarButtons: {
                name: 'Araç çubuğu düğmeleri',
                desc: 'Araç çubuğunda hangi düğmelerin görüneceğini seçin. Gizli düğmelere komutlar ve menüler aracılığıyla erişilebilir.',
                navigationLabel: 'Gezinme araç çubuğu',
                listLabel: 'Liste araç çubuğu'
            },
            createNewNotesInNewTab: {
                name: 'Yeni notları yeni sekmede aç',
                desc: 'Etkinleştirildiğinde, Yeni not oluştur komutu notları yeni bir sekmede açar. Devre dışı bırakıldığında, notlar mevcut sekmenin yerini alır.'
            },
            autoRevealActiveNote: {
                name: 'Aktif notu otomatik göster',
                desc: 'Hızlı Geçiş, bağlantılar veya aramadan açıldığında notları otomatik olarak göster.'
            },
            autoRevealShortestPath: {
                name: 'Otomatik gösterim: En kısa yolu kullan',
                desc: 'Etkin: Otomatik gösterim en yakın görünür üst klasörü veya etiketi seçer. Devre dışı: Otomatik gösterim dosyanın gerçek klasörünü ve tam etiketini seçer.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Otomatik gösterim: Sağ kenar çubuğundaki olayları yoksay',
                desc: 'Sağ kenar çubuğunda notlara tıklarken veya değiştirirken aktif notu değiştirme.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'Otomatik gösterim: Diğer pencerelerden gelen olayları yoksay',
                desc: 'Başka bir pencerede notlarla çalışırken aktif notu değiştirme.'
            },
            paneTransitionDuration: {
                name: 'Tek panel animasyonu',
                desc: 'Tek panel modunda paneller arasında geçiş süresi (milisaniye).',
                resetTooltip: 'Varsayılana sıfırla'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'İlk notu otomatik seç',
                desc: 'Klasör, etiket veya özellik değiştirirken ilk notu otomatik olarak aç.'
            },
            skipAutoScroll: {
                name: 'Kısayollar için otomatik kaydırmayı devre dışı bırak',
                desc: 'Kısayollardaki öğelere tıklarken gezinme bölmesini kaydırma.'
            },
            autoExpandNavItems: {
                name: 'Seçimde genişlet',
                desc: 'Seçildiğinde klasörleri ve etiketleri genişlet. Tek bölme modunda ilk seçim genişletir, ikinci seçim dosyaları gösterir.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'Tek genişletilmiş dal',
                desc: 'Bir klasör, etiket veya özellik genişletildiğinde aynı ağaçtaki diğer dalları daralt.'
            },
            springLoadedFolders: {
                name: 'Sürüklerken genişlet',
                desc: 'Sürükleme sırasında üzerine gelirken klasörleri ve etiketleri genişlet.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Sürüklerken genişlet: İlk genişletme gecikmesi',
                desc: 'Sürükleme sırasında ilk klasör veya etiket genişlemeden önceki gecikme (saniye).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Sürüklerken genişlet: Sonraki genişletme gecikmesi',
                desc: 'Aynı sürükleme sırasında ek klasörler veya etiketler genişlemeden önceki gecikme (saniye).'
            },
            navigationBanner: {
                name: 'Gezinme afişi (kasa profili)',
                desc: 'Gezinme bölmesinin üzerinde bir görsel görüntüle. Seçili kasa profiliyle değişir.',
                current: 'Mevcut afiş: {path}',
                chooseButton: 'Görsel seç'
            },
            pinNavigationBanner: {
                name: 'Afişi sabitle',
                desc: 'Gezinme afişini gezinme ağacının üstüne sabitle.'
            },
            showShortcuts: {
                name: 'Kısayolları göster',
                desc: 'Gezinme bölmesinde kısayollar bölümünü görüntüle.'
            },
            shortcutBadgeDisplay: {
                name: 'Kısayol rozeti',
                desc: "Kısayolların yanında ne görüntüleneceği. Kısayolları doğrudan açmak için 'Kısayol 1-9 aç' komutlarını kullanın.",
                options: {
                    index: 'Konum (1-9)',
                    count: 'Öğe sayısı',
                    none: 'Yok'
                }
            },
            showRecentNotes: {
                name: 'Son dosyaları göster',
                desc: 'Gezinme bölmesinde son dosyalar bölümünü görüntüle.'
            },
            hideRecentNotes: {
                name: 'Son dosyalardan dosya türlerini gizle',
                desc: 'Son dosyalar bölümünde gizlenecek dosya türlerini seç.',
                options: {
                    none: 'Hiçbiri',
                    folderNotes: 'Klasör notları'
                }
            },
            recentNotesCount: {
                name: 'Son dosya sayısı',
                desc: 'Görüntülenecek son dosya sayısı.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Son dosyaları kısayollarla birlikte sabitle',
                desc: 'Kısayollar sabitlendiğinde son dosyaları dahil et.'
            },
            calendarEnabled: {
                name: 'Takvimi etkinleştir',
                desc: 'Notebook Navigator takvim özelliklerini etkinleştir.'
            },
            calendarPlacement: {
                name: 'Takvim konumu',
                desc: 'Sol veya sağ kenar çubuğunda görüntüle.',
                options: {
                    leftSidebar: 'Sol kenar çubuğu',
                    rightSidebar: 'Sağ kenar çubuğu'
                }
            },
            calendarLeftPlacement: {
                name: 'Tek panel yerleşimi',
                desc: 'Takvimin tek panel modunda gösterildiği yer.',
                options: {
                    navigationPane: 'Gezinme paneli',
                    below: 'Panellerin altında'
                }
            },
            calendarLocale: {
                name: 'Dil',
                desc: 'Takvim tarih biçimlendirmesini, hafta numaralandırmasını ve haftanın ilk gününü kontrol eder.',
                weekPathMismatchWarning:
                    'Görünen takvim ve haftalık not yolları farklı hafta başlangıçları veya hafta numaralandırması kullanıyor.',
                options: {
                    systemDefault: 'Varsayılan'
                }
            },
            calendarWeekendDays: {
                name: 'Hafta sonu günleri',
                desc: 'Hafta sonu günlerini farklı bir arka plan rengiyle göster.',
                options: {
                    none: 'Hiçbiri',
                    satSun: 'Cumartesi ve pazar',
                    friSat: 'Cuma ve cumartesi',
                    thuFri: 'Perşembe ve cuma'
                }
            },
            calendarMonthHeadingFormat: {
                name: 'Ay adı biçimi',
                desc: 'Uzun (Ocak) veya kısa (Oca) ay adı.',
                options: {
                    full: 'Ocak (tam)',
                    short: 'Oca (kısa)'
                }
            },
            showInfoButtons: {
                name: 'Bilgi düğmelerini göster',
                desc: 'Arama çubuğunda ve takvim başlığında bilgi düğmelerini göster.'
            },
            calendarWeeksToShow: {
                name: 'Sol kenar çubuğunda gösterilecek haftalar',
                desc: 'Sağ kenar çubuğundaki takvim her zaman tam ayı gösterir.',
                options: {
                    fullMonth: 'Tam ay',
                    oneWeek: '1 hafta',
                    weeksCount: '{count} hafta'
                }
            },
            calendarHighlightToday: {
                name: 'Bugünün tarihini vurgula',
                desc: 'Bugünün tarihini arka plan rengi ve kalın metinle vurgula.'
            },
            calendarShowFeatureImage: {
                name: 'Öne çıkan görseli göster',
                desc: 'Takvimdeki notların öne çıkan görsellerini göster.'
            },
            calendarShowTasks: {
                name: 'Görevleri göster',
                desc: 'Tamamlanmamış görevleri olan gün, hafta ve aylarda bir gösterge gösterir.'
            },
            calendarShowWeekNumber: {
                name: 'Hafta numarasını göster',
                desc: 'Hafta numarasıyla bir sütun ekle.'
            },
            calendarShowQuarter: {
                name: 'Çeyreği göster',
                desc: 'Takvim başlığına çeyrek etiketi ekle.'
            },
            calendarShowYearCalendar: {
                name: 'Yıllık takvimi göster',
                desc: 'Sağ kenar çubuğunda yıl gezintisi ve ay ızgarası göster.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Oluşturmadan önce onayla',
                desc: 'Yeni bir günlük not oluştururken onay iletişim kutusu göster.'
            },
            calendarIntegrationMode: {
                name: 'Günlük not kaynağı',
                desc: 'Takvim notları için kaynak.',
                options: {
                    dailyNotes: 'Günlük notlar (çekirdek eklenti)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'Klasör ve tarih formatı Daily Notes çekirdek eklentisinde yapılandırılır.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'Periyodik not dili',
                desc: 'Notebook Navigator periyodik not yollarındaki yerelleştirilmiş ay adlarını, gün adlarını, hafta numaralarını ve hafta başlangıçlarını kontrol eder.',
                options: {
                    calendar: 'Takvim',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'Kök klasör',
                desc: 'Periyodik notlar için temel klasör. Tarih desenleri alt klasörleri içerebilir. Seçili kasa profiliyle değişir.',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'Şablon klasörü konumu',
                desc: 'Şablon dosya seçici bu klasördeki notları gösterir.',
                placeholder: 'Templates',
                usage: 'Takvim notları ve klasör notları tarafından kullanılır. Şablonları Takvim > Takvim entegrasyonu ve Klasörler ve klasör notları > Klasör notu dosyaları bölümünde yapılandırın.'
            },
            calendarCustomFilePattern: {
                name: 'Günlük notlar',
                desc: 'Moment tarih biçimini kullanarak yolu biçimlendir. Alt klasör adlarını köşeli parantez içine alın, örn. [Work]/YYYY. Şablon ayarlamak için şablon simgesine tıklayın. Şablon klasörü konumunu Dosya işlemleri > Şablonlar bölümünden ayarlayın.',
                momentDescPrefix: '',
                momentLinkText: 'Moment tarih biçimi',
                momentDescSuffix:
                    ' kullanarak yolu biçimlendir. Alt klasör adlarını köşeli parantez içine alın, örn. [Work]/YYYY. Şablon ayarlamak için şablon simgesine tıklayın. Şablon klasörü konumunu Dosya işlemleri > Şablonlar bölümünden ayarlayın.',
                templaterSupportInstalled: '✅ Templater eklentisi tam şablon desteğiyle yüklü.',
                templaterSupportMissing: '⚠️ Tam şablon desteği için Templater eklentisini yükleyin.',
                placeholder: 'YYYY/YYYYMMDD',
                example: 'Geçerli sözdizimi: {path}',
                parsingError: 'Desen, tam bir tarih (yıl, ay, gün) olarak biçimlendirilmeli ve tekrar ayrıştırılabilmelidir.'
            },
            calendarCustomWeekPattern: {
                name: 'Haftalık notlar',
                parsingError: 'Desen, tam bir hafta (hafta yılı, hafta numarası) olarak biçimlendirilmeli ve tekrar ayrıştırılabilmelidir.',
                weekPathMismatchWarning:
                    'Haftalık not yolları periyodik not dilini kullanır. Eşleşen diller kullanın veya Pazartesi tabanlı haftalar için "GGGG" ile "WW" kullanın.',
                mixedWeekTokensWarning:
                    'Bu desen Pazartesi tabanlı hafta belirteçleri ("W" veya "G") ile dil tabanlı hafta belirteçlerini ("w" veya "g") karıştırıyor. Tutarlı olarak tek bir set kullanın: Pazartesi tabanlı haftalar için "GGGG" ile "WW" veya haftalık notların seçilen dili izlemesi gerekiyorsa "gggg" ile "ww" kullanın.'
            },
            calendarCustomMonthPattern: {
                name: 'Aylık notlar',
                parsingError: 'Desen, tam bir ay (yıl, ay) olarak biçimlendirilmeli ve tekrar ayrıştırılabilmelidir.'
            },
            calendarCustomQuarterPattern: {
                name: 'Çeyreklik notlar',
                parsingError: 'Desen, tam bir çeyrek (yıl, çeyrek) olarak biçimlendirilmeli ve tekrar ayrıştırılabilmelidir.'
            },
            calendarCustomYearPattern: {
                name: 'Yıllık notlar',
                parsingError: 'Desen, tam bir yıl (yıl) olarak biçimlendirilmeli ve tekrar ayrıştırılabilmelidir.'
            },
            calendarTemplateFile: {
                current: 'Şablon dosyası: {name}'
            },
            showTooltips: {
                name: 'İpuçlarını göster',
                desc: 'Notlar ve klasörler için ek bilgi içeren fareyle üzerine gelme ipuçlarını görüntüle.'
            },
            showTooltipPath: {
                name: 'İpuçlarında yolu göster',
                desc: 'İpuçlarında not adlarının altında klasör yolunu görüntüle.'
            },
            showTooltipWordCount: {
                name: 'İpuçlarında kelime sayısını göster',
                desc: 'İpuçlarında not kelime sayılarını görüntüle.'
            },
            resetPaneSeparator: {
                name: 'Bölme ayırıcı konumunu sıfırla',
                desc: 'Gezinme bölmesi ve liste bölmesi arasındaki sürüklenebilir ayırıcıyı varsayılan konuma sıfırla.',
                buttonText: 'Ayırıcıyı sıfırla',
                notice: "Ayırıcı konumu sıfırlandı. Uygulamak için Obsidian'ı yeniden başlatın veya Notebook Navigator'ı yeniden açın."
            },
            settingsTransfer: {
                name: 'Ayarları içe ve dışa aktar',
                desc: 'Notebook Navigator ayarlarını JSON olarak dışa veya içe aktar. İçe aktarma tüm ayarları değiştirir.',
                importButtonText: 'İçe aktar',
                exportButtonText: 'Dışa aktar',
                import: {
                    modalTitle: 'Ayarları içe aktar',
                    fileButtonName: 'Dosyadan içe aktar',
                    fileButtonDesc: 'Diskten bir JSON dosyası yükle.',
                    fileButtonText: 'Dosyadan içe aktar',
                    editorName: 'JSON',
                    editorDesc: 'Aşağıya JSON yapıştırın veya düzenleyin. Dahil edilmeyen ayarlar varsayılan değerlere sıfırlanır.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'İçe aktar',
                    confirmTitle: 'Ayarlar içe aktarılsın mı?',
                    confirmMessage: 'İçe aktarma, mevcut Notebook Navigator ayarlarını değiştirir.',
                    backupToggleName: 'İçe aktarmadan önce mevcut ayarları kasa köküne kaydet',
                    backupToggleDesc: 'Kasa kökünde zaman damgalı bir JSON dosyası oluşturur.',
                    successWithBackupNotice: 'Ayarlar içe aktarıldı. Önceki ayarlar {path} konumuna kaydedildi.',
                    backupError: 'Mevcut ayarlar kaydedilemedi: {message}',
                    successNotice: 'Ayarlar içe aktarıldı.',
                    errorNotice: 'Ayarlar içe aktarılamadı: {message}',
                    fileReadError: 'Dosya okunamadı: {message}'
                },
                export: {
                    modalTitle: 'Ayarları dışa aktar',
                    editorName: 'JSON',
                    editorDesc: 'Yalnızca varsayılandan farklı olan ayarlar dahil edilir.',
                    placeholder: '{}',
                    copyButtonText: 'Panoya kopyala',
                    downloadButtonText: 'İndir',
                    copyNotice: 'Ayarlar panoya kopyalandı.',
                    downloadNotice: 'Ayarlar dışa aktarıldı.',
                    downloadError: 'Ayarlar indirilemedi: {message}'
                }
            },
            resetAllSettings: {
                name: 'Tüm ayarları sıfırla',
                desc: "Notebook Navigator'ın tüm ayarlarını varsayılan değerlere sıfırla.",
                buttonText: 'Tüm ayarları sıfırla',
                confirmTitle: 'Tüm ayarlar sıfırlansın mı?',
                confirmMessage: "Bu, Notebook Navigator'ın tüm ayarlarını varsayılan değerlere sıfırlar. Geri alınamaz.",
                confirmButtonText: 'Tüm ayarları sıfırla',
                notice: "Tüm ayarlar sıfırlandı. Uygulamak için Obsidian'ı yeniden başlatın veya Notebook Navigator'ı yeniden açın.",
                error: 'Ayarları sıfırlama başarısız.'
            },
            multiSelectModifier: {
                name: 'Çoklu seçim değiştirici',
                desc: 'Hangi değiştirici tuşun çoklu seçimi değiştireceğini seçin. Option/Alt seçildiğinde, Cmd/Ctrl tıklaması notları yeni sekmede açar.',
                options: {
                    cmdCtrl: 'Cmd/Ctrl tıkla',
                    optionAlt: 'Option/Alt tıkla'
                }
            },
            enterToOpenFiles: {
                name: "Dosyaları açmak için Enter'a basın",
                desc: "Dosyaları yalnızca listede klavye ile gezinirken Enter'a basarak açın. macOS'ta bu, Enter'ın dosyaları yeniden adlandırmasını engeller."
            },
            shiftEnterOpenContext: {
                name: 'Shift+Enter',
                desc: 'Shift+Enter ile seçili dosyanın açılmasını veya yeniden adlandırılmasını seçin.'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Enter',
                desc: 'Cmd+Enter ile seçili dosyanın açılmasını veya yeniden adlandırılmasını seçin.'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Enter',
                desc: 'Ctrl+Enter ile seçili dosyanın açılmasını veya yeniden adlandırılmasını seçin.'
            },
            mouseBackForwardAction: {
                name: 'Fare geri/ileri düğmeleri',
                desc: 'Masaüstünde fare geri ve ileri düğmelerinin işlevi.',
                options: {
                    none: 'Sistem varsayılanını kullan',
                    singlePaneSwitch: 'Panel değiştir (tek panel)',
                    history: 'Geçmişte gezin'
                }
            },
            fileVisibility: {
                name: 'Dosya türlerini göster (kasa profili)',
                desc: 'Gezginde hangi dosya türlerinin gösterileceğini filtrele. Obsidian tarafından desteklenmeyen dosya türleri harici uygulamalarda açılabilir.',
                options: {
                    documents: 'Belgeler (.md, .canvas, .base)',
                    supported: "Desteklenen (Obsidian'da açılır)",
                    all: 'Tümü (harici olarak açılabilir)'
                }
            },
            homepage: {
                name: 'Ana sayfa',
                desc: "Notebook Navigator'ın başlangıçta otomatik olarak ne açacağını seçin.",
                current: 'Mevcut: {path}',
                chooseButton: 'Dosya seç',
                options: {
                    none: 'Yok',
                    file: 'Dosya',
                    dailyNote: 'Günlük not',
                    weeklyNote: 'Haftalık not',
                    monthlyNote: 'Aylık not',
                    quarterlyNote: 'Çeyreklik not',
                    yearlyNote: 'Yıllık not'
                },
                file: {
                    name: 'Ana sayfa: Başlangıç dosyası',
                    empty: 'Dosya seçilmedi'
                },
                createMissing: {
                    name: 'Ana sayfa: Not yoksa oluştur',
                    desc: 'Başlangıçta veya komutla, periyodik not yoksa oluşturur.'
                }
            },
            excludedNotes: {
                name: 'Özellik kurallarıyla notları gizle (kasa profili)',
                desc: 'Virgülle ayrılmış frontmatter kuralları listesi. `key` veya `key=value` girdileri kullanın (örn. status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'Dosyaları gizle (kasa profili)',
                desc: 'Gizlenecek dosya adı kalıplarının virgülle ayrılmış listesi. * joker karakterlerini ve / yollarını destekler (örn. temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Kasa profili',
                desc: 'Profiller dosya türü görünürlüğünü, gizli dosyaları, gizli klasörleri, gizli etiketleri, gizli notlar için özellik kurallarını, kısayolları ve gezinme afişini saklar. Gezinme bölmesi başlığından profilleri değiştir.',
                defaultName: 'Varsayılan',
                addButton: 'Profil ekle',
                editProfilesButton: 'Profilleri düzenle',
                addProfileOption: 'Profil ekle...',
                applyButton: 'Uygula',
                deleteButton: 'Profili sil',
                addModalTitle: 'Profil ekle',
                editProfilesModalTitle: 'Profilleri düzenle',
                addModalPlaceholder: 'Profil adı',
                deleteModalTitle: '{name} silinsin mi',
                deleteModalMessage:
                    '{name} kaldırılsın mı? Bu profilde kayıtlı gizli dosya, klasör, etiket ve özellik tabanlı not filtreleri silinecek.',
                moveUp: 'Yukarı taşı',
                moveDown: 'Aşağı taşı',
                errors: {
                    emptyName: 'Bir profil adı girin',
                    duplicateName: 'Profil adı zaten var'
                }
            },
            vaultTitle: {
                name: 'Kasa başlığı konumu',
                desc: 'Kasa başlığının gösterileceği yeri seçin.',
                options: {
                    header: 'Başlıkta göster',
                    navigation: 'Gezinme panelinde göster'
                }
            },
            excludedFolders: {
                name: 'Klasörleri gizle (kasa profili)',
                desc: 'Virgülle ayrılmış gizlenecek klasörler listesi. Ad desenleri: assets* (assets ile başlayan klasörler), *_temp (_temp ile biten). Yol desenleri: /archive (yalnızca kök arşiv), /res* (res ile başlayan kök klasörler), /*/temp (bir seviye derinlikte temp klasörleri), /projects/* (projects içindeki tüm klasörler).',
                placeholder: 'şablonlar, assets*, /arşiv, /res*'
            },
            descendantExcludedFolders: {
                name: 'Klasörleri alt klasör notlarından hariç tut (kasa profili)',
                desc: 'Alt klasörlerden notlar toplanırken atlanacak klasörlerin virgülle ayrılmış listesi. Klasörler görünür kalır ve birini seçmek yine notlarını gösterir. Klasörleri gizle ile aynı desenleri kullanır.',
                placeholder: 'günlük, kaynaklar, /arşiv'
            },
            showFileDate: {
                name: 'Tarihi göster',
                desc: 'Not adlarının altında tarihi görüntüle.'
            },
            alphabeticalDateMode: {
                name: 'Ada göre sıralarken',
                desc: 'Notlar alfabetik olarak sıralandığında gösterilecek tarih.',
                options: {
                    created: 'Oluşturma tarihi',
                    modified: 'Değiştirme tarihi'
                }
            },
            showFileTags: {
                name: 'Dosya etiketlerini göster',
                desc: 'Dosya öğelerinde tıklanabilir etiketleri görüntüle.'
            },
            showFileTagAncestors: {
                name: 'Tam etiket yollarını göster',
                desc: "Tam etiket hiyerarşi yollarını görüntüle. Etkinken: 'ai/openai', 'iş/projeler/2024'. Devre dışıyken: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Dosya etiketlerini renklendir',
                desc: 'Dosya öğelerindeki etiket rozetlerine etiket renklerini uygula.'
            },
            prioritizeColoredFileTags: {
                name: 'Renkli etiketleri önce göster',
                desc: 'Dosya öğelerinde renkli etiketleri diğer etiketlerden önce sırala.'
            },
            showFileTagsInCompactMode: {
                name: 'Kompakt modda dosya etiketlerini göster',
                desc: 'Tarih, önizleme ve görsel gizlendiğinde etiketleri görüntüle.'
            },
            showFileProperties: {
                name: 'Dosya özelliklerini göster',
                desc: 'Dosya öğelerinde özellikleri görüntüle. Gösterilecek özellikleri seçmek için "Özellik anahtarı görünürlüğü" iletişim kutusunu kullanın.'
            },
            colorFileProperties: {
                name: 'Dosya özelliklerini renklendir',
                desc: 'Dosya öğelerindeki özellik rozetlerine özellik renklerini uygula.'
            },
            prioritizeColoredFileProperties: {
                name: 'Renkli özellikleri önce göster',
                desc: 'Dosya öğelerinde renkli özellikleri diğer özelliklerden önce sırala.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Kompakt modda özellikleri göster',
                desc: 'Kompakt mod etkinken özellikleri görüntüle.'
            },
            textCountDisplay: {
                name: 'Sayım türü',
                desc: 'Dosya öğelerinde hangi not sayımlarının görüneceğini seçin.',
                options: {
                    none: 'Yok',
                    words: 'Kelime sayısı',
                    characters: 'Karakter sayısı',
                    both: 'Kelime ve karakter sayısı'
                }
            },
            textCountPlacement: {
                name: 'Yerleşim',
                desc: 'Not sayımlarının nerede görüneceğini seçin.',
                options: {
                    title: 'Başlıkta',
                    property: 'Özellik olarak'
                }
            },
            characterCountSpaces: {
                name: 'Karakter sayısı',
                desc: 'Karakter sayısına boşlukların dahil edilip edilmeyeceğini seçin.',
                options: {
                    include: 'Boşluklar dahil',
                    exclude: 'Boşluklar hariç'
                }
            },
            wordCountTargetProperty: {
                name: 'Hedef özelliği',
                desc: 'Hedef kelime sayısını içeren frontmatter özellik anahtarı. Hedefleri gizlemek için boş bırakın.'
            },
            showWordCountPercentage: {
                name: 'Hedef yüzdesini göster',
                desc: 'Hedef kelime sayısı varsa yalnızca ilerleme yüzdesini göster.'
            },
            propertyFields: {
                name: 'Özellik anahtarları (kasa profili)',
                desc: 'Gezinme ve dosya listesi için anahtar bazında görünürlük ayarlı ön bilgi özellik anahtarları.',
                addButtonTooltip: 'Özellik anahtarlarını yapılandır',
                noneConfigured: 'Yapılandırılmış özellik yok',
                singleConfigured: '1 özellik yapılandırıldı: {properties}',
                multipleConfigured: '{count} özellik yapılandırıldı: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'Özellikleri ayrı satırlarda göster',
                desc: 'Her özelliği kendi satırında göster.'
            },
            enablePropertyInternalLinks: {
                name: 'Özellik etiketlerini notlara bağla',
                desc: 'Bağlantılı notu açmak için bir özellik etiketine tıklayın.'
            },
            enablePropertyExternalLinks: {
                name: "Özellik etiketlerini URL'lere bağla",
                desc: "Bağlantılı URL'yi açmak için bir özellik etiketine tıklayın."
            },
            dateFormat: {
                name: 'Tarih formatı',
                desc: 'Tarihleri görüntüleme formatı (Moment formatı kullanır).',
                placeholder: 'D MMM YYYY',
                help: 'Yaygın formatlar:\nD MMM YYYY = 25 May 2022\nDD/MM/YYYY = 25/05/2022\nYYYY-MM-DD = 2022-05-25\n\nSimgeler:\nYYYY/YY = yıl\nMMMM/MMM/MM = ay\nDD/D = gün\ndddd/ddd = haftanın günü',
                helpTooltip: 'Moment formatı',
                momentLinkText: 'Moment formatı'
            },
            timeFormat: {
                name: 'Saat formatı',
                desc: 'Saatleri görüntüleme formatı (Moment formatı kullanır).',
                placeholder: 'HH:mm',
                help: 'Yaygın formatlar:\nh:mm a = 2:30 PM (12 saat)\nHH:mm = 14:30 (24 saat)\nh:mm:ss a = 2:30:45 PM\nHH:mm:ss = 14:30:45\n\nSimgeler:\nHH/H = 24 saat\nhh/h = 12 saat\nmm = dakika\nss = saniye\na = ÖÖ/ÖS',
                helpTooltip: 'Moment formatı',
                momentLinkText: 'Moment formatı'
            },
            showFilePreview: {
                name: 'Not önizlemesini göster',
                desc: 'Not adlarının altında önizleme metni görüntüle.'
            },
            skipHeadingsInPreview: {
                name: 'Önizlemede başlıkları atla',
                desc: 'Önizleme metni oluştururken başlık satırlarını atla.'
            },
            skipCodeBlocksInPreview: {
                name: 'Önizlemede kod bloklarını atla',
                desc: 'Önizleme metni oluştururken kod bloklarını atla.'
            },
            stripHtmlInPreview: {
                name: 'Önizlemelerde HTML kaldır',
                desc: 'Önizleme metninden HTML etiketlerini kaldırır. Büyük notlarda performansı etkileyebilir.'
            },
            stripLatexInPreview: {
                name: 'Önizlemelerde LaTeX kaldır',
                desc: 'Önizleme metninden satır içi ve blok LaTeX ifadelerini kaldırır.'
            },
            previewProperties: {
                name: 'Önizleme özellikleri',
                desc: 'Önizleme metni için kontrol edilecek virgülle ayrılmış frontmatter özellikleri listesi. Metni olan ilk özellik kullanılacak.',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'Not içeriğine geri dön',
                desc: 'Belirtilen özelliklerin hiçbiri metin içermediğinde not içeriğini önizleme olarak göster.'
            },
            previewRows: {
                name: 'Önizleme satırları',
                desc: 'Önizleme metni için görüntülenecek satır sayısı.',
                options: {
                    '1': '1 satır',
                    '2': '2 satır',
                    '3': '3 satır',
                    '4': '4 satır',
                    '5': '5 satır'
                }
            },
            fileNameRows: {
                name: 'Başlık satırları',
                desc: 'Not başlıkları için görüntülenecek satır sayısı.',
                options: {
                    '1': '1 satır',
                    '2': '2 satır',
                    '3': '3 satır'
                }
            },
            useFolderColor: {
                name: 'Klasör rengini kullan',
                desc: 'Özel dosya rengi ayarlanmadığında not başlıklarını ve dosya simgelerini üst klasörün rengiyle renklendir. Öncelik: özel dosya rengi > klasör rengi > varsayılan renk.'
            },
            showFeatureImage: {
                name: 'Öne çıkan görseli göster',
                desc: 'Notta bulunan ilk görselin küçük resmini görüntüler.'
            },
            forceSquareFeatureImage: {
                name: 'Kare öne çıkan görsel zorla',
                desc: 'Öne çıkan görselleri kare küçük resim olarak oluştur.'
            },
            featureImageProperties: {
                name: 'Görsel özellikleri',
                desc: 'Önce kontrol edilecek virgülle ayrılmış frontmatter özellikleri listesi. Bulunamazsa markdown içeriğindeki ilk görsel kullanılır.',
                placeholder: 'küçükresim, öneÇıkanYeniden, öneÇıkan'
            },
            featureImageExcludeProperties: {
                name: 'Özellikli notları hariç tut',
                desc: 'Virgülle ayrılmış frontmatter özellikleri listesi. Bu özelliklerden herhangi birini içeren notlar öne çıkan görsel saklamaz.',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: 'Öne çıkan görsel görüntüleme boyutu',
                desc: 'Not listelerinde öne çıkan görsellerin maksimum işleme boyutu.',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'Öne çıkan görsel piksel boyutu',
                desc: 'Depolanan öne çıkan görsel küçük resimleri oluşturulurken kullanılan çözünürlük. Büyük önizlemeler bulanık görünüyorsa bu değeri artırın.',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'Harici görselleri indir',
                desc: 'Öne çıkan görseller için uzak görselleri ve YouTube küçük resimlerini indir.'
            },
            hideDrawingPreviewImages: {
                name: 'Dışa aktarılmış önizleme görsellerini gizle',
                desc: 'Dışa aktarılan çizim önizleme PNG dosyalarını gizler. Görüntülemek için "Gizli ögeleri göster" seçeneğini açın.'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator, Excalidraw tarafından dışa aktarılan PNG dosyalarını çizim önizlemeleri olarak gösterir.',
                items: [
                    '**Excalidraw ayarları** içinde **Embedding Excalidraw into your Notes and Exporting** öğesini açın, ardından **Export Settings**, ardından **Auto-export Settings** öğesini açın.',
                    '**Auto-export PNG** seçeneğini etkinleştirin. İsteğe bağlı olarak **Export both dark- and light-themed image** seçeneğini de etkinleştirebilirsiniz.',
                    'Notebook Navigator **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** veya **Drawing.excalidraw.light.png** dosyalarını arar.',
                    '**Dışa aktarılmış önizleme görsellerini gizle** açıkken PNG dosyaları yalnızca **Gizli ögeleri göster** de açıksa görünür.'
                ]
            },
            showRootFolder: {
                name: 'Kök klasörü göster',
                desc: 'Ağaçta kasa adını kök klasör olarak görüntüle.'
            },
            showFolderIcons: {
                name: 'Klasör simgelerini göster',
                desc: 'Gezinme bölmesinde klasörlerin yanında simgeleri görüntüle.'
            },
            inheritFolderColors: {
                name: 'Klasör renklerini devral',
                desc: 'Alt klasörler üst klasörlerden renk devralır.'
            },
            folderSortOrder: {
                name: 'Klasör sıralama düzeni',
                desc: 'Alt öğeleri için farklı bir sıralama düzeni ayarlamak üzere herhangi bir klasöre sağ tıklayın.',
                options: {
                    alphaAsc: "A'dan Z'ye",
                    alphaDesc: "Z'den A'ya"
                }
            },
            showNoteCount: {
                name: 'Not sayısını göster',
                desc: 'Klasörler, etiketler ve özelliklerin yanında not sayısını görüntüle.'
            },
            showSectionIcons: {
                name: 'Kısayollar ve son öğeler için simgeleri göster',
                desc: 'Kısayollar ve Son kullanılanlar bölümlerindeki öğelerin yanında simgeleri görüntüle.'
            },
            interfaceIcons: {
                name: 'Arayüz simgeleri',
                desc: 'Araç çubuğu, klasör, etiket, özellik, sabitlenmiş, arama ve sıralama simgelerini düzenleyin.',
                buttonText: 'Simgeleri düzenle'
            },
            showIconsColorOnly: {
                name: 'Rengi yalnızca simgelere uygula',
                desc: 'Etkinleştirildiğinde, özel renkler yalnızca simgelere uygulanır. Devre dışı bırakıldığında, renkler hem simgelere hem de metin etiketlerine uygulanır.'
            },
            navRainbowMode: {
                name: 'Gökkuşağı renk modu (kasa profili)',
                desc: 'Gezinme panelinde gökkuşağı renkleri uygula.',
                options: {
                    none: 'Kapalı',
                    foreground: 'Metin rengi',
                    background: 'Arka plan rengi'
                }
            },
            navRainbowFirstColor: {
                name: 'İlk renk',
                desc: 'Gökkuşağı gradyanındaki ilk renk.'
            },
            navRainbowLastColor: {
                name: 'Son renk',
                desc: 'Gökkuşağı gradyanındaki son renk.'
            },
            navRainbowTransitionStyle: {
                name: 'Geçiş stili',
                desc: 'İlk ve son renkler arasında kullanılan enterpolasyon.',
                options: {
                    hue: 'Ton',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'Kısayollara uygula',
                desc: 'Gökkuşağı renklerini kısayollara uygula.'
            },
            navRainbowApplyToRecent: {
                name: 'Son öğelere uygula',
                desc: 'Gökkuşağı renklerini son öğelere uygula.'
            },
            navRainbowApplyToFolders: {
                name: 'Klasörlere uygula',
                desc: 'Gökkuşağı renklerini klasörlere uygula.'
            },
            navRainbowFolderScope: {
                name: 'Klasör kapsamı',
                desc: 'Renk atamalarını hangi klasör düzeylerinin başlatacağını seçin.',
                options: {
                    root: 'Kök düzey',
                    child: 'Alt düzey',
                    all: 'Her düzey'
                }
            },
            navRainbowApplyToTags: {
                name: 'Etiketlere uygula',
                desc: 'Gökkuşağı renklerini etiketlere uygula.'
            },
            navRainbowTagScope: {
                name: 'Etiket kapsamı',
                desc: 'Renk atamalarını hangi etiket düzeylerinin başlatacağını seçin.',
                options: {
                    root: 'Kök düzey',
                    child: 'Alt düzey',
                    all: 'Her düzey'
                }
            },
            navRainbowApplyToProperties: {
                name: 'Özelliklere uygula',
                desc: 'Gökkuşağı renklerini özelliklere uygula.'
            },
            navRainbowBalanceHueLuminance: {
                name: 'Tonlar arasında tutarlı parlaklık', // (English: Consistent brightness across hues)
                desc: 'Ton geçişleri sırasında başlangıç ve bitiş renkleri arasındaki parlaklığı enterpolasyon yapar.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'Açık ve koyu mod için ayrı renkler', // (English: Separate light and dark mode colors)
                desc: 'Açık mod ve koyu mod için farklı gökkuşağı renkleri kullanın.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'Açık mod rengini koyu moda kopyala', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'Özellik kapsamı',
                desc: 'Renk atamalarını hangi özellik düzeylerinin başlatacağını seçin.',
                options: {
                    root: 'Kök düzey',
                    child: 'Alt düzey',
                    all: 'Her düzey'
                }
            },
            collapseBehavior: {
                name: 'Öğeleri daralt',
                desc: 'Tümünü genişlet/daralt düğmesinin neyi etkilediğini seçin.',
                options: {
                    all: 'Tümü',
                    foldersOnly: 'Yalnızca klasörler',
                    tagsOnly: 'Yalnızca etiketler',
                    propertiesOnly: 'Yalnızca özellikler'
                }
            },
            smartCollapse: {
                name: 'Seçili öğeyi genişletilmiş tut',
                desc: 'Daraltırken seçili öğeyi ve üst öğelerini genişletilmiş tut.'
            },
            excludeVaultRootFromCollapse: {
                name: 'Daraltırken kasa kökünü atla',
                desc: 'Tüm öğeleri daraltırken kasa kök klasörünü geçerli durumunda bırak.'
            },
            navIndent: {
                name: 'Ağaç girintisi',
                desc: 'İç içe klasörler, etiketler ve özellikler için girinti genişliğini ayarlayın (piksel).'
            },
            navItemHeight: {
                name: 'Öğe yüksekliği',
                desc: 'Gezinme bölmesindeki klasör, etiket ve özelliklerin yüksekliğini ayarlayın (piksel).'
            },
            navItemHeightScaleText: {
                name: 'Metni öğe yüksekliğiyle ölçekle',
                desc: 'Öğe yüksekliği azaltıldığında gezinme metni boyutunu küçült.'
            },
            showIndentGuides: {
                name: 'Girinti kılavuzlarını göster',
                desc: 'İç içe klasörler, etiketler ve özellikler için girinti kılavuzlarını göster.'
            },
            navCountLeaderStyle: {
                name: 'Doldurma işaretlerini göster',
                desc: 'Öğe adları ile not sayıları arasında nokta, tire veya çizgi göster.',
                options: {
                    none: 'Yok',
                    dots: 'Noktalar (...)',
                    dashes: 'Tireler (---)',
                    line: 'Çizgi'
                }
            },
            navRootSpacing: {
                name: 'Kök öğe aralığı',
                desc: 'Kök seviyesi klasörler, etiketler ve özellikler arasındaki boşluk (piksel).'
            },
            showTags: {
                name: 'Etiketleri göster',
                desc: 'Gezginde etiketler bölümünü görüntüle.'
            },
            showTagIcons: {
                name: 'Etiket simgelerini göster',
                desc: 'Gezinme bölmesinde etiketlerin yanında simgeleri görüntüle.'
            },
            inheritTagColors: {
                name: 'Etiket renklerini devral',
                desc: 'Alt etiketler üst etiketlerden renk devralır.'
            },
            tagSortOrder: {
                name: 'Etiket sıralama düzeni',
                desc: 'Alt öğeleri için farklı bir sıralama düzeni ayarlamak üzere herhangi bir etikete sağ tıklayın.',
                options: {
                    alphaAsc: "A'dan Z'ye",
                    alphaDesc: "Z'den A'ya",
                    frequency: 'Sıklık',
                    lowToHigh: 'düşükten yükseğe',
                    highToLow: 'yüksekten düşüğe'
                }
            },
            showAllTagsFolder: {
                name: 'Etiketler klasörünü göster',
                desc: '"Etiketler"i daraltılabilir klasör olarak görüntüle.'
            },
            showUntagged: {
                name: 'Etiketsiz notları göster',
                desc: 'Etiketi olmayan notlar için "Etiketsiz" öğesini görüntüle.'
            },
            scopeTagsToCurrentContext: {
                name: 'Etiketleri seçime göre filtrele',
                desc: 'Yalnızca seçili klasör veya özellikteki notlarda bulunan etiketleri göster.'
            },
            keepEmptyTagsProperty: {
                name: 'Son etiket kaldırıldıktan sonra tags özelliğini koru',
                desc: "Tüm etiketler kaldırıldığında tags frontmatter özelliğini koru. Devre dışı bırakıldığında, tags özelliği frontmatter'dan silinir."
            },
            showProperties: {
                name: 'Özellikleri göster',
                desc: 'Gezginde özellikler bölümünü görüntüle.',
                propertyKeysInfoPrefix: 'Özellikleri şurada yapılandır: ',
                propertyKeysInfoLinkText: 'Başlangıç > Özellik anahtarları',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'Özellik simgelerini göster',
                desc: 'Gezinme panelinde özelliklerin yanında simgeleri görüntüle.'
            },
            inheritPropertyColors: {
                name: 'Özellik renklerini devral',
                desc: 'Özellik değerleri, özellik anahtarından renk ve arka planı devralır.'
            },
            propertySortOrder: {
                name: 'Özellik sıralama düzeni',
                desc: 'Değerler için farklı bir sıralama düzeni ayarlamak üzere herhangi bir özelliğe sağ tıklayın.',
                options: {
                    alphaAsc: "A'dan Z'ye",
                    alphaDesc: "Z'den A'ya",
                    frequency: 'Sıklık',
                    lowToHigh: 'düşükten yükseğe',
                    highToLow: 'yüksekten düşüğe'
                }
            },
            showAllPropertiesFolder: {
                name: 'Özellikler klasörünü göster',
                desc: '"Özellikler"i daraltılabilir klasör olarak görüntüle.'
            },
            scopePropertiesToCurrentContext: {
                name: 'Özellikleri seçime göre filtrele',
                desc: 'Yalnızca seçili klasör veya etiketteki notlarda bulunan özellikleri göster.'
            },
            hiddenTags: {
                name: 'Etiketleri gizle (kasa profili)',
                desc: 'Virgülle ayrılmış etiket kalıpları listesi. Ad kalıpları: etiket* (ile başlayan), *etiket (ile biten). Yol kalıpları: arşiv (etiket ve alt öğeler), arşiv/* (yalnızca alt öğeler), projeler/*/taslaklar (ortada joker).',
                placeholder: 'arşiv*, *taslak, projeler/*/eski'
            },
            hiddenFileTags: {
                name: 'Etiketli notları gizle (kasa profili)',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'Klasör notlarını etkinleştir',
                desc: 'Eşleşen bir not dosyası olan klasörler tıklanabilir bağlantılar olarak görüntülenir.'
            },
            folderNoteType: {
                name: 'Varsayılan klasör notu türü',
                desc: 'Bağlam menüsünden oluşturulan klasör notu türü.',
                options: {
                    ask: 'Oluştururken sor',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'Klasör notu adı',
                desc: 'Uzantısız klasör notu adı. Klasörle aynı adı kullanmak için boş bırakın.',
                placeholder: 'index'
            },
            folderNoteNamePattern: {
                name: 'Klasör notu ad deseni',
                desc: 'Uzantısız klasör notu ad deseni. Klasör adını eklemek için {{folder}} kullanın. Ayarlandığında, klasör notu adı geçerli olmaz.'
            },
            folderNoteTemplate: {
                name: 'Klasör notu şablonu',
                desc: 'Klasör notları oluşturulurken kullanılan şablon dosyası. Markdown şablonları Templater kullanabilir. Canvas ve Base şablonları dosya içeriği olarak kopyalanır. Şablon klasörü konumunu Dosya işlemleri > Şablonlar bölümünden ayarlayın.',
                formatWarning: 'Şablon biçimi seçilen klasör notu türüyle eşleşmelidir: .md, .canvas veya .base.'
            },
            enableFolderNoteLinks: {
                name: 'Klasör adları klasör notlarını açar',
                desc: 'Bir klasör adına tıklamak klasör notunu açar. Kapalı olduğunda, klasör notları yalnızca ad, simge ve renk gibi klasör meta verilerini sağlar.'
            },
            hideFolderNoteInList: {
                name: 'Listede klasör notunu gizle',
                desc: 'Klasör notlarını dosya listesinden gizle.'
            },
            pinCreatedFolderNote: {
                name: 'Oluşturulan klasör notlarını sabitle',
                desc: 'Bağlam menüsünden oluşturulduğunda klasör notlarını sabitle.'
            },
            folderNoteOpenLocation: {
                name: 'Klasör notlarını şurada aç',
                desc: 'Klasör notu bağlantılarına tıklandığında klasör notlarının nerede açılacağını seçin.',
                options: {
                    currentTab: 'Geçerli sekme',
                    newTab: 'Yeni sekme',
                    rightSidebar: 'Sağ kenar çubuğu'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: 'Sağ kenar çubuğu: En yakın klasör notunu göster',
                desc: 'Bir klasör seçildiğinde, sağ kenar çubuğu en yakın üst klasör notunu otomatik olarak gösterir.'
            },
            confirmBeforeDelete: {
                name: 'Silmeden önce onayla',
                desc: 'Not veya klasör silerken onay iletişim kutusunu göster'
            },
            deleteAttachments: {
                name: 'Dosyaları silerken ekleri sil',
                desc: 'Bağlı ekleri ve oluşturulan çizim önizlemelerini başka bir yerde kullanılmıyorsa otomatik olarak kaldır',
                options: {
                    ask: 'Her seferinde sor',
                    always: 'Her zaman',
                    never: 'Asla'
                }
            },
            moveFileConflicts: {
                name: 'Taşıma çakışmaları',
                desc: 'Aynı ada sahip bir dosyanın zaten bulunduğu klasöre dosya taşınırken. Her seferinde sor (yeniden adlandır, üzerine yaz, iptal) veya her zaman yeniden adlandır.',
                options: {
                    ask: 'Her seferinde sor',
                    rename: 'Her zaman yeniden adlandır'
                }
            },
            metadataCleanup: {
                name: 'Meta verileri temizle',
                desc: 'Dosyalar, klasörler, etiketler veya özellikler Obsidian dışında silindiğinde, taşındığında veya yeniden adlandırıldığında geride kalan yetim meta verileri kaldırır. Bu yalnızca Notebook Navigator ayarlar dosyasını etkiler.',
                buttonText: 'Meta verileri temizle',
                error: 'Ayarlar temizliği başarısız',
                loading: 'Meta veriler kontrol ediliyor...',
                statusClean: 'Temizlenecek meta veri yok',
                statusCounts:
                    'Yetim öğeler: {folders} klasör, {tags} etiket, {properties} özellik, {files} dosya, {pinned} sabitleme, {separators} ayırıcı'
            },
            rebuildCache: {
                name: 'Önbelleği yeniden oluştur',
                desc: 'Eksik etiketler, yanlış önizlemeler veya eksik öne çıkan görseller yaşıyorsanız bunu kullanın. Bu, senkronizasyon çakışmalarından veya beklenmeyen kapanmalardan sonra olabilir.',
                buttonText: 'Önbelleği yeniden oluştur',
                error: 'Önbellek yeniden oluşturulamadı',
                indexingTitle: 'Kasa dizinleniyor...',
                progress: 'Notebook Navigator önbelleği güncelleniyor.'
            },
            externalIcons: {
                downloadButton: 'İndir',
                downloadingLabel: 'İndiriliyor...',
                removeButton: 'Kaldır',
                statusInstalled: 'İndirildi (sürüm {version})',
                statusNotInstalled: 'İndirilmedi',
                versionUnknown: 'bilinmiyor',
                downloadFailed: '{name} indirilemedi. Bağlantınızı kontrol edin ve tekrar deneyin.',
                removeFailed: '{name} kaldırılamadı.',
                infoNote:
                    'İndirilen simge paketleri kurulum durumunu cihazlar arasında senkronize eder. Simge paketleri her cihazda yerel veritabanında kalır; senkronizasyon yalnızca indirme veya kaldırma durumunu izler. Simge paketleri Notebook Navigator deposundan indirilir (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterDates: {
                name: 'Frontmatter meta verilerini kullan',
                desc: 'Not adı, zaman damgaları, simgeler ve renkler için frontmatter kullan'
            },
            frontmatterIconField: {
                name: 'Simge alanı',
                desc: 'Dosya simgeleri için frontmatter alanı. Ayarlarda saklanan simgeleri kullanmak için boş bırakın.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'Renk alanı',
                desc: 'Dosya renkleri için frontmatter alanı. Ayarlarda saklanan renkleri kullanmak için boş bırakın.',
                placeholder: 'color'
            },
            frontmatterBackgroundField: {
                name: 'Arka plan alanı',
                desc: 'Arka plan renkleri için frontmatter alanı. Ayarlarda saklanan arka plan renklerini kullanmak için boş bırakın.',
                placeholder: 'background'
            },
            frontmatterMigration: {
                name: 'Simgeleri ve renkleri ayarlardan taşı',
                desc: 'Ayarlarda saklanan: {icons} simge, {colors} renk.',
                button: 'Taşı',
                buttonWorking: 'Taşınıyor...',
                noticeNone: 'Ayarlarda dosya simgesi veya rengi saklanmamış.',
                noticeDone: '{migratedIcons}/{icons} simge, {migratedColors}/{colors} renk taşındı.',
                noticeFailures: 'Başarısız girişler: {failures}.',
                noticeError: 'Taşıma başarısız. Ayrıntılar için konsolu kontrol edin.'
            },
            frontmatterNameField: {
                name: 'Ad alanları',
                desc: 'Virgülle ayrılmış frontmatter alanları listesi. İlk boş olmayan değer kullanılır. Dosya adına geri döner.',
                placeholder: 'title, name'
            },
            frontmatterCreatedField: {
                name: 'Oluşturma zaman damgası alanı',
                desc: 'Oluşturma zaman damgası için frontmatter alan adı. Yalnızca dosya sistemi tarihini kullanmak için boş bırakın.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'Değiştirme zaman damgası alanı',
                desc: 'Değiştirme zaman damgası için frontmatter alan adı. Yalnızca dosya sistemi tarihini kullanmak için boş bırakın.',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'Zaman damgası formatı',
                desc: "Frontmatter'daki zaman damgalarını ayrıştırmak için kullanılan format. ISO 8601 ayrıştırmasını kullanmak için boş bırakın.",
                helpTooltip: 'Moment formatı',
                momentLinkText: 'Moment formatı',
                help: 'Yaygın formatlar:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'Geliştirmeyi destekleyin',
                desc: 'Notebook Navigator kullanmayı seviyorsanız, lütfen sürekli gelişimini desteklemeyi düşünün.',
                buttonText: '❤️ Sponsor ol',
                coffeeButton: '☕️ Bana bir kahve ısmarla'
            },
            updateCheckOnStart: {
                name: 'Başlangıçta yeni sürüm kontrolü',
                desc: 'Başlangıçta yeni eklenti sürümlerini kontrol eder ve güncelleme mevcut olduğunda bildirim gösterir. Kontroller günde en fazla bir kez yapılır.',
                status: 'Yeni sürüm mevcut: {version}'
            },
            debugLogging: {
                name: 'Başlangıç hata ayıklama günlüğü',
                desc: 'Başlangıç tanılarını kasanın kökünde zaman damgalı bir Markdown dosyasına yazar ve başlangıç kararlı hale geldikten sonra durur. Dosya eşitlenebilir ve dosya yolları içerebilir.'
            },
            whatsNew: {
                name: 'Notebook Navigator {version} yenilikleri',
                desc: 'Son güncellemeleri ve iyileştirmeleri görün',
                buttonText: 'Son güncellemeleri görüntüle'
            },
            masteringVideo: {
                name: "Notebook Navigator'da Uzmanlaşma (video)",
                desc: "Bu video, Notebook Navigator'da verimli olmak için ihtiyacınız olan her şeyi kapsar; kısayol tuşları, arama, etiketler ve gelişmiş özelleştirme dahil."
            },
            cacheStatistics: {
                localCache: 'Yerel önbellek',
                items: 'öğe',
                withTags: 'etiketli',
                withPreviewText: 'önizleme metinli',
                withFeatureImage: 'öne çıkan görselli',
                withMetadata: 'meta verili'
            },
            metadataInfo: {
                successfullyParsed: 'Başarıyla ayrıştırıldı',
                itemsWithName: 'adlı öğe',
                withCreatedDate: 'oluşturma tarihli',
                withModifiedDate: 'değiştirme tarihli',
                withIcon: 'simgeli',
                withColor: 'renkli',
                failedToParse: 'Ayrıştırılamadı',
                createdDates: 'oluşturma tarihi',
                modifiedDates: 'değiştirme tarihi',
                checkTimestampFormat: 'Zaman damgası formatınızı kontrol edin.',
                exportFailed: 'Hataları dışa aktar'
            }
        }
    },
    whatsNew: {
        title: 'Notebook Navigator Yenilikleri',
        openBannerImage: 'Sürüm banner görselini aç',
        supportMessage: "Notebook Navigator'ı yararlı buluyorsanız, lütfen gelişimini desteklemeyi düşünün.",
        supportButton: 'Bana bir kahve ısmarla',
        thanksButton: 'Teşekkürler!'
    }
};
