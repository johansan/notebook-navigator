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
        submit: 'Gönder', // Button text for submitting forms and dialogs (English: Submit)
        noSelection: 'Seçim yok', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Etiketsiz', // Label for notes without any tags (English: Untagged)
        untitled: 'Başlıksız', // Default name for notes without a title (English: Untitled)
        featureImageAlt: 'Öne çıkan görsel', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Bilinmeyen hata', // Generic fallback when an error has no message (English: Unknown error)
        updateBannerTitle: 'Notebook Navigator güncellemesi mevcut',
        updateBannerInstruction: 'Ayarlar -> Topluluk eklentileri bölümünden güncelleyin',
        updateIndicatorLabel: 'Yeni sürüm mevcut'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Notları görüntülemek için bir klasör veya etiket seçin', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Not yok', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Sabitlenmiş', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Notlar', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Dosyalar', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (gizli)' // Accessibility label applied to list items that are normally hidden
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Etiketsiz', // Label for the special item showing notes without tags (English: Untagged)
        hiddenTags: 'Gizli etiketler', // Label for the hidden tags virtual folder (English: Hidden tags)
        tags: 'Etiketler' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Kısayollar', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentNotesHeader: 'Son notlar', // Header label for recent notes section in navigation pane (English: Recent notes)
        recentFilesHeader: 'Son dosyalar', // Header label when showing recent non-note files in navigation pane (English: Recent files)
        reorderRootFoldersTitle: 'Gezinmeyi yeniden sırala',
        reorderRootFoldersHint: 'Yeniden sıralamak için okları veya sürüklemeyi kullanın',
        vaultRootLabel: 'Kasa',
        resetRootToAlpha: 'Alfabetik sıraya sıfırla',
        resetRootToFrequency: 'Sıklık sırasına sıfırla',
        pinShortcuts: 'Kısayolları sabitle',
        pinShortcutsAndRecentNotes: 'Kısayolları ve son notları sabitle',
        pinShortcutsAndRecentFiles: 'Kısayolları ve son dosyaları sabitle',
        unpinShortcuts: 'Kısayolları sabitlemeden çıkar',
        unpinShortcutsAndRecentNotes: 'Kısayolları ve son notları sabitlemeden çıkar',
        unpinShortcutsAndRecentFiles: 'Kısayolları ve son dosyaları sabitlemeden çıkar',
        profileMenuLabel: 'Profil',
        profileMenuAria: 'Kasa profilini değiştir'
    },

    shortcuts: {
        folderExists: 'Klasör zaten kısayollarda',
        noteExists: 'Not zaten kısayollarda',
        tagExists: 'Etiket zaten kısayollarda',
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
        scrollToTop: 'En üste kaydır',
        newFolder: 'Yeni klasör', // Tooltip for create new folder button (English: New folder)
        newNote: 'Yeni not', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Gezinmeye dön', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeSortOrder: 'Sıralama düzenini değiştir', // Tooltip for the sort order toggle button (English: Change sort order)
        defaultSort: 'Varsayılan', // Label for default sorting mode (English: Default)
        customSort: 'Özel', // Label for custom sorting mode (English: Custom)
        showFolders: 'Gezinmeyi göster', // Tooltip for button to show the navigation pane (English: Show navigation)
        hideFolders: 'Gezinmeyi gizle', // Tooltip for button to hide the navigation pane (English: Hide navigation)
        reorderRootFolders: 'Gezinmeyi yeniden sırala',
        finishRootFolderReorder: 'Tamamlandı',
        toggleDescendantNotes: 'Alt klasörlerden / alt öğelerden notları göster', // Tooltip: include descendants for folders and tags
        autoExpandFoldersTags: 'Seçimde genişlet', // Tooltip for button to toggle auto-expanding folders and tags when selected (English: Expand on selection)
        showExcludedItems: 'Gizli klasörleri, etiketleri ve notları göster', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Gizli klasörleri, etiketleri ve notları gizle', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Çift bölme göster', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Tek bölme göster', // Tooltip for button to show single-pane layout (English: Show single pane)
        changeAppearance: 'Görünümü değiştir', // Tooltip for button to change folder appearance settings (English: Change appearance)
        search: 'Ara' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Ara...', // Placeholder text for search input (English: Search...)
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Aramayı temizle', // Tooltip for clear search button (English: Clear search)
        saveSearchShortcut: 'Arama kısayolunu kaydet',
        removeSearchShortcut: 'Arama kısayolunu kaldır',
        shortcutModalTitle: 'Arama kısayolunu kaydet',
        shortcutNamePlaceholder: 'Kısayol adını girin'
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
            copyDeepLink: 'Obsidian URL kopyala',
            copyPath: 'Dosya sistemi yolunu kopyala',
            copyRelativePath: 'Kasa yolunu kopyala',
            renameNote: 'Notu yeniden adlandır',
            renameFile: 'Dosyayı yeniden adlandır',
            deleteNote: 'Notu sil',
            deleteFile: 'Dosyayı sil',
            deleteMultipleNotes: '{count} notu sil',
            deleteMultipleFiles: '{count} dosyayı sil',
            moveNoteToFolder: 'Notu taşı...',
            moveFileToFolder: 'Dosyayı taşı...',
            moveMultipleNotesToFolder: '{count} notu taşı...',
            moveMultipleFilesToFolder: '{count} dosyayı taşı...',
            addTag: 'Etiket ekle',
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
            copyPath: 'Dosya sistemi yolunu kopyala',
            copyRelativePath: 'Kasa yolunu kopyala',
            createFolderNote: 'Klasör notu oluştur',
            detachFolderNote: 'Klasör notunu ayır',
            deleteFolderNote: 'Klasör notunu sil',
            changeIcon: 'Simgeyi değiştir',
            changeColor: 'Rengi değiştir',
            changeBackground: 'Arka planı değiştir',
            excludeFolder: 'Klasörü gizle',
            unhideFolder: 'Klasörü göster',
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
        navigation: {
            addSeparator: 'Ayırıcı ekle',
            removeSeparator: 'Ayırıcıyı kaldır'
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
        standardPreset: 'Standart',
        compactPreset: 'Kompakt',
        defaultSuffix: '(varsayılan)',
        titleRows: 'Başlık satırları',
        previewRows: 'Önizleme satırları',
        groupBy: 'Grupla',
        defaultOption: (rows: number) => `Varsayılan (${rows})`,
        defaultTitleOption: (rows: number) => `Varsayılan başlık satırları (${rows})`,
        defaultPreviewOption: (rows: number) => `Varsayılan önizleme satırları (${rows})`,
        defaultGroupOption: (groupLabel: string) => `Varsayılan gruplama (${groupLabel})`,
        titleRowOption: (rows: number) => `${rows} başlık satırı`,
        previewRowOption: (rows: number) => `${rows} önizleme satırı`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'Simge ara...',
            recentlyUsedHeader: 'Son kullanılanlar',
            emptyStateSearch: 'Simgeleri aramak için yazmaya başlayın',
            emptyStateNoResults: 'Simge bulunamadı',
            showingResultsInfo: '{count} sonuçtan 50 tanesi gösteriliyor. Daraltmak için daha fazla yazın.',
            emojiInstructions: 'Simge olarak kullanmak için herhangi bir emoji yazın veya yapıştırın',
            removeIcon: 'Simgeyi kaldır',
            allTabLabel: 'Tümü'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Kural ekle'
        },
        interfaceIcons: {
            title: 'Arayüz simgeleri',
            items: {
                'nav-shortcuts': 'Kısayollar',
                'nav-recent-files': 'Son dosyalar',
                'nav-expand-all': 'Tümünü genişlet',
                'nav-collapse-all': 'Tümünü daralt',
                'nav-tree-expand': 'Ağaç oku: genişlet',
                'nav-tree-collapse': 'Ağaç oku: daralt',
                'nav-hidden-items': 'Gizli öğeler',
                'nav-root-reorder': 'Kök klasörleri yeniden sırala',
                'nav-new-folder': 'Yeni klasör',
                'nav-show-single-pane': 'Tek bölme göster',
                'nav-show-dual-pane': 'Çift bölme göster',
                'nav-profile-chevron': 'Profil menüsü oku',
                'list-search': 'Ara',
                'list-descendants': 'Alt klasörlerden notlar',
                'list-sort-ascending': 'Sıralama: artan',
                'list-sort-descending': 'Sıralama: azalan',
                'list-appearance': 'Görünümü değiştir',
                'list-new-note': 'Yeni not',
                'nav-folder-open': 'Klasör açık',
                'nav-folder-closed': 'Klasör kapalı',
                'nav-tag': 'Etiket',
                'list-pinned': 'Sabitlenmiş öğeler'
            }
        },
        colorPicker: {
            currentColor: 'Mevcut',
            newColor: 'Yeni',
            presetColors: 'Hazır renkler',
            userColors: 'Kullanıcı renkleri',
            paletteDefault: 'Varsayılan',
            paletteCustom: 'Özel',
            copyColors: 'Rengi kopyala',
            colorsCopied: 'Renk panoya kopyalandı',
            copyClipboardError: 'Panoya yazılamadı',
            pasteColors: 'Rengi yapıştır',
            pasteClipboardError: 'Pano okunamadı',
            pasteInvalidJson: 'Pano geçerli metin içermiyor',
            pasteInvalidFormat: 'Hex renk değeri bekleniyor',
            colorsPasted: 'Renk başarıyla yapıştırıldı',
            resetUserColors: 'Özel renkleri temizle',
            clearCustomColorsConfirm: 'Tüm özel renkler kaldırılsın mı?',
            userColorSlot: 'Renk {slot}',
            recentColors: 'Son renkler',
            clearRecentColors: 'Son renkleri temizle',
            removeRecentColor: 'Rengi kaldır',
            removeColor: 'Rengi kaldır',
            apply: 'Uygula',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'Kırmızı',
                orange: 'Turuncu',
                amber: 'Kehribar',
                yellow: 'Sarı',
                lime: 'Limon yeşili',
                green: 'Yeşil',
                emerald: 'Zümrüt',
                teal: 'Deniz mavisi',
                cyan: 'Camgöbeği',
                sky: 'Gök mavisi',
                blue: 'Mavi',
                indigo: 'Çivit',
                violet: 'Menekşe',
                purple: 'Mor',
                fuchsia: 'Fuşya',
                pink: 'Pembe',
                rose: 'Gül',
                gray: 'Gri',
                slate: 'Arduvaz',
                stone: 'Taş'
            }
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
            invalidTagName: 'Geçerli bir etiket adı girin.',
            descendantRenameError: 'Bir etiket kendisine veya alt öğesine taşınamaz.',
            confirmDelete: 'Etiketi sil',
            file: 'dosya',
            files: 'dosya'
        },
        fileSystem: {
            newFolderTitle: 'Yeni klasör',
            renameFolderTitle: 'Klasörü yeniden adlandır',
            renameFileTitle: 'Dosyayı yeniden adlandır',
            deleteFolderTitle: "'{name}' silinsin mi?",
            deleteFileTitle: "'{name}' silinsin mi?",
            folderNamePrompt: 'Klasör adını girin:',
            hideInOtherVaultProfiles: 'Diğer kasa profillerinde gizle',
            renamePrompt: 'Yeni adı girin:',
            renameVaultTitle: 'Kasa görünen adını değiştir',
            renameVaultPrompt: 'Özel görünen ad girin (varsayılanı kullanmak için boş bırakın):',
            deleteFolderConfirm: 'Bu klasörü ve tüm içeriğini silmek istediğinizden emin misiniz?',
            deleteFileConfirm: 'Bu dosyayı silmek istediğinizden emin misiniz?',
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
        navigationBanner: {
            placeholder: 'Görsel ara...',
            instructions: {
                navigate: 'gezinmek için',
                select: 'afiş olarak ayarlamak için',
                dismiss: 'kapatmak için'
            }
        },
        tagSuggest: {
            placeholder: 'Etiket ara...',
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
        welcome: {
            title: '{pluginName} uygulamasına hoş geldiniz',
            introText:
                'Merhaba! Başlamadan önce, panellerin ve "Alt klasörlerden notları göster" düğmesinin nasıl çalıştığını anlamak için aşağıdaki videonun ilk beş dakikasını izlemenizi şiddetle tavsiye ederim.',
            continueText:
                'Beş dakikanız daha varsa, kompakt görüntüleme modlarını ve kısayolları ile önemli kısayol tuşlarını doğru şekilde nasıl ayarlayacağınızı anlamak için videoyu izlemeye devam edin.',
            thanksText: 'İndirdiğiniz için çok teşekkürler, keyifli kullanımlar!',
            videoAlt: 'Notebook Navigator kurulumu ve ustalaşma',
            openVideoButton: 'Videoyu oynat',
            closeButton: 'Daha sonra izleyeceğim'
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
            duplicateNote: 'Not çoğaltılamadı: {error}',
            createCanvas: 'Tuval oluşturulamadı: {error}',
            createDatabase: 'Veritabanı oluşturulamadı: {error}',
            duplicateFolder: 'Klasör çoğaltılamadı: {error}',
            openVersionHistory: 'Sürüm geçmişi açılamadı: {error}',
            versionHistoryNotFound: 'Sürüm geçmişi komutu bulunamadı. Obsidian Sync etkin olduğundan emin olun.',
            revealInExplorer: 'Dosya sistem gezgininde gösterilemedi: {error}',
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
            showFolder: 'Klasör gösterildi: {name}'
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
            tagOperationsNotAvailable: 'Etiket işlemleri kullanılamıyor',
            tagsRequireMarkdown: 'Etiketler yalnızca Markdown notlarında desteklenir',
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
            untitled: 'Başlıksız',
            untitledNumber: 'Başlıksız {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Klasör kendisine veya alt klasörüne taşınamaz.',
            itemAlreadyExists: 'Bu konumda "{name}" adlı bir öğe zaten var.',
            failedToMove: 'Taşınamadı: {error}',
            failedToAddTag: '"{tag}" etiketi eklenemedi',
            failedToClearTags: 'Etiketler temizlenemedi',
            failedToMoveFolder: '"{name}" klasörü taşınamadı',
            failedToImportFiles: 'İçe aktarılamadı: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} dosya hedefte zaten var',
            addedTag: '"{tag}" etiketi {count} dosyaya eklendi',
            filesAlreadyHaveTag: '{count} dosyada bu etiket veya daha özel bir etiket zaten var',
            clearedTags: '{count} dosyadan tüm etiketler temizlendi',
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

    // Weekdays
    weekdays: {
        sunday: 'Pazar',
        monday: 'Pazartesi',
        tuesday: 'Salı',
        wednesday: 'Çarşamba',
        thursday: 'Perşembe',
        friday: 'Cuma',
        saturday: 'Cumartesi'
    },

    // Plugin commands
    commands: {
        open: 'Aç', // Command palette: Opens the Notebook Navigator view (English: Open)
        openHomepage: 'Ana sayfayı aç', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        revealFile: 'Dosyayı göster', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Ara', // Command palette: Toggle search in the file list (English: Search)
        toggleDualPane: 'Çift bölme düzenini aç/kapat', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        selectVaultProfile: 'Kasa profili seç', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'Kasa profili 1 seç', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Kasa profili 2 seç', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Kasa profili 3 seç', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Dosyaları sil', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Yeni not oluştur', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Şablondan yeni not', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Dosyaları taşı', // Command palette: Move selected files to another folder (English: Move files)
        selectNextFile: 'Sonraki dosyayı seç', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Önceki dosyayı seç', // Command palette: Selects the previous file in the current view (English: Select previous file)
        convertToFolderNote: 'Klasör notuna dönüştür', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Klasör notu olarak ayarla', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Klasör notunu ayır', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Tüm klasör notlarını sabitle', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Klasöre git', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Etikete git', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        addShortcut: 'Kısayollara ekle', // Command palette: Adds the current file, folder, or tag to shortcuts (English: Add to shortcuts)
        openShortcut: 'Kısayol {number} aç',
        toggleDescendants: 'Alt öğeleri aç/kapat', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Gizli klasörleri, etiketleri ve notları aç/kapat', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Etiket sıralama düzenini aç/kapat', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        collapseExpand: 'Tüm öğeleri daralt / genişlet', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        addTag: 'Seçili dosyalara etiket ekle', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        removeTag: 'Seçili dosyalardan etiket kaldır', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Seçili dosyalardan tüm etiketleri kaldır', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        rebuildCache: 'Önbelleği yeniden oluştur' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: "Notebook Navigator'da göster" // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Son değiştirilme',
        createdAt: 'Oluşturulma',
        file: 'dosya',
        files: 'dosya',
        folder: 'klasör',
        folders: 'klasör'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'Başarısız meta veri raporu dışa aktarıldı: {filename}',
            exportFailed: 'Meta veri raporu dışa aktarılamadı'
        },
        sections: {
            general: 'Genel',
            navigationPane: 'Gezinme bölmesi',
            icons: 'Simge paketleri',
            folders: 'Klasörler',
            foldersAndTags: 'Klasörler ve etiketler',
            tags: 'Etiketler',
            search: 'Arama',
            searchAndHotkeys: 'Arama ve kısayol tuşları',
            listPane: 'Liste bölmesi',
            notes: 'Notlar',
            hotkeys: 'Kısayol tuşları',
            advanced: 'Gelişmiş'
        },
        groups: {
            general: {
                filtering: 'Filtreleme',
                behavior: 'Davranış',
                view: 'Görünüm',
                icons: 'Simgeler',
                desktopAppearance: 'Masaüstü görünümü',
                formatting: 'Biçimlendirme'
            },
            navigation: {
                appearance: 'Görünüm',
                shortcutsAndRecent: 'Kısayollar ve son öğeler'
            },
            list: {
                display: 'Görünüm',
                pinnedNotes: 'Sabitlenmiş notlar',
                quickActions: 'Hızlı eylemler'
            },
            notes: {
                frontmatter: 'Frontmatter',
                icon: 'Simge',
                title: 'Başlık',
                previewText: 'Önizleme metni',
                featureImage: 'Öne çıkan görsel',
                tags: 'Etiketler',
                date: 'Tarih',
                parentFolder: 'Üst klasör'
            }
        },
        items: {
            searchProvider: {
                name: 'Arama sağlayıcı',
                desc: 'Hızlı dosya adı araması veya Omnisearch eklentisi ile tam metin araması arasında seçim yapın. (senkronize edilmez)',
                options: {
                    internal: 'Filtre araması',
                    omnisearch: 'Omnisearch (tam metin)'
                },
                info: {
                    filterSearch: {
                        title: 'Filtre araması (varsayılan):',
                        description:
                            'Mevcut klasör ve alt klasörler içinde dosyaları ada ve etiketlere göre filtreler. Filtre modu: karışık metin ve etiketler tüm terimleri eşleştirir (örn. "proje #iş"). Etiket modu: yalnızca etiketlerle arama AND/OR operatörlerini destekler (örn. "#iş AND #acil", "#proje OR #kişisel"). Cmd/Ctrl+Tıklama ile AND olarak ekle, Cmd/Ctrl+Shift+Tıklama ile OR olarak ekle. ! ön ekiyle hariç tutma (örn. !taslak, !#arşiv) ve !# ile etiketsiz notları bulmayı destekler.'
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            'Tüm kasanızda arama yapan, ardından sonuçları yalnızca mevcut klasör, alt klasörler veya seçili etiketlerdeki dosyaları gösterecek şekilde filtreleyen tam metin araması. Omnisearch eklentisinin yüklenmesini gerektirir - mevcut değilse, arama otomatik olarak Filtre aramasına döner.',
                        warningNotInstalled: 'Omnisearch eklentisi yüklü değil. Filtre araması kullanılıyor.',
                        limitations: {
                            title: 'Bilinen sınırlamalar:',
                            performance: 'Performans: Özellikle büyük kasalarda 3 karakterden az arama yaparken yavaş olabilir',
                            pathBug:
                                'Yol hatası: ASCII olmayan karakterler içeren yollarda arama yapamaz ve alt yolları doğru şekilde aramaz, bu da arama sonuçlarında hangi dosyaların görüneceğini etkiler',
                            limitedResults:
                                'Sınırlı sonuçlar: Omnisearch tüm kasada arama yaptığından ve filtrelemeden önce sınırlı sayıda sonuç döndürdüğünden, kasanın başka yerlerinde çok fazla eşleşme varsa mevcut klasörünüzdeki ilgili dosyalar görünmeyebilir',
                            previewText:
                                'Önizleme metni: Not önizlemeleri Omnisearch sonuç alıntılarıyla değiştirilir, bu da eşleşme dosyanın başka bir yerinde görünüyorsa gerçek arama eşleşmesi vurgusunu göstermeyebilir'
                        }
                    }
                }
            },
            listPaneTitle: {
                name: 'Liste bölmesi başlığı (yalnızca masaüstü)',
                desc: 'Liste bölmesi başlığının nerede gösterileceğini seçin.',
                options: {
                    header: 'Başlıkta göster',
                    list: 'Liste bölmesinde göster',
                    hidden: 'Gösterme'
                }
            },
            sortNotesBy: {
                name: 'Notları sırala',
                desc: 'Not listesinde notların nasıl sıralanacağını seçin.',
                options: {
                    'modified-desc': 'Düzenleme tarihi (en yeni üstte)',
                    'modified-asc': 'Düzenleme tarihi (en eski üstte)',
                    'created-desc': 'Oluşturma tarihi (en yeni üstte)',
                    'created-asc': 'Oluşturma tarihi (en eski üstte)',
                    'title-asc': 'Başlık (A üstte)',
                    'title-desc': 'Başlık (Z üstte)'
                }
            },
            revealFileOnListChanges: {
                name: 'Liste değişikliklerinde seçili dosyaya kaydır',
                desc: 'Notları sabitleme, alt notları gösterme, klasör görünümünü değiştirme veya dosya işlemleri çalıştırma sırasında seçili dosyaya kaydır.'
            },
            includeDescendantNotes: {
                name: 'Alt klasörlerden / alt öğelerden notları göster (senkronize edilmez)',
                desc: 'Klasör veya etiket görüntülerken iç içe alt klasörlerden ve etiket alt öğelerinden notları dahil et.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Sabitlenmiş notları klasörleriyle sınırla',
                desc: 'Sabitlenmiş notlar yalnızca sabitlendikleri klasör veya etiket görüntülenirken görünür.'
            },
            separateNoteCounts: {
                name: 'Mevcut ve alt öğe sayılarını ayrı göster',
                desc: 'Klasör ve etiketlerde not sayılarını "mevcut ▾ alt öğeler" biçiminde göster.'
            },
            groupNotes: {
                name: 'Notları grupla',
                desc: 'Tarihe veya klasöre göre gruplandırılmış notlar arasında başlıklar görüntüle. Etiket görünümleri klasör gruplandırması etkinken tarih gruplarını kullanır.',
                options: {
                    none: 'Gruplandırma',
                    date: 'Tarihe göre grupla',
                    folder: 'Klasöre göre grupla'
                }
            },
            showPinnedGroupHeader: {
                name: 'Sabitlenmiş grup başlığını göster',
                desc: 'Sabitlenmiş notların üzerinde sabitlenmiş bölüm başlığını görüntüle.'
            },
            showPinnedIcon: {
                name: 'Sabitlenmiş simgesini göster',
                desc: 'Sabitlenmiş bölüm başlığının yanında simgeyi göster.'
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
                desc: 'Dosya simgelerini sol hizalı boşlukla göster. Devre dışı bırakma hem simgeleri hem de girintiyi kaldırır. Öncelik: özel > dosya adı > dosya türü > varsayılan.'
            },
            showFilenameMatchIcons: {
                name: 'Dosya adına göre simgeler',
                desc: 'Dosyalara adlarındaki metne göre simge ata.'
            },
            fileNameIconMap: {
                name: 'Dosya adı simge eşlemesi',
                desc: 'Metni içeren dosyalar belirtilen simgeyi alır. Satır başına bir eşleme: metin=simge',
                placeholder: '# metin=simge\ntoplantı=LiCalendar\nfatura=PhReceipt',
                editTooltip: 'Eşlemeleri düzenle'
            },
            showCategoryIcons: {
                name: 'Dosya türüne göre simgeler',
                desc: 'Dosyalara uzantılarına göre simge ata.'
            },
            fileTypeIconMap: {
                name: 'Dosya türü simge eşlemesi',
                desc: 'Uzantıya sahip dosyalar belirtilen simgeyi alır. Satır başına bir eşleme: uzantı=simge',
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: 'Eşlemeleri düzenle'
            },
            optimizeNoteHeight: {
                name: 'Değişken not yüksekliği',
                desc: 'Sabitlenmiş notlar ve önizleme metni olmayan notlar için kompakt yükseklik kullan.'
            },
            compactItemHeight: {
                name: 'Kompakt öğe yüksekliği',
                desc: 'Masaüstü ve mobilde kompakt liste öğelerinin yüksekliğini ayarlayın.',
                resetTooltip: 'Varsayılana sıfırla (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Metni kompakt öğe yüksekliğiyle ölçekle',
                desc: 'Öğe yüksekliği azaltıldığında kompakt liste metnini ölçekle.'
            },
            showParentFolder: {
                name: 'Üst klasörü göster',
                desc: 'Alt klasörlerdeki veya etiketlerdeki notlar için üst klasör adını görüntüle.'
            },
            parentFolderClickRevealsFile: {
                name: 'Üst klasöre tıklayarak klasörü aç',
                desc: 'Üst klasör etiketine tıklamak liste panelinde klasörü açar.'
            },
            showParentFolderColor: {
                name: 'Üst klasör rengini göster',
                desc: 'Üst klasör etiketlerinde klasör renklerini kullan.'
            },
            showQuickActions: {
                name: 'Hızlı eylemleri göster (yalnızca masaüstü)',
                desc: 'Dosyaların üzerine gelirken eylem düğmelerini göster. Düğme kontrolleri hangi eylemlerin görüneceğini seçer.'
            },
            dualPane: {
                name: 'Çift bölme düzeni (senkronize edilmez)',
                desc: 'Masaüstünde gezinme bölmesini ve liste bölmesini yan yana göster.'
            },
            dualPaneOrientation: {
                name: 'Çift bölme yönü (senkronize edilmez)',
                desc: 'Çift bölme etkinken yatay veya dikey düzen seçin.',
                options: {
                    horizontal: 'Yatay bölme',
                    vertical: 'Dikey bölme'
                }
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
                name: 'Yakınlaştırma seviyesi (senkronize edilmez)',
                desc: "Notebook Navigator'ın genel yakınlaştırma seviyesini kontrol eder."
            },
            startView: {
                name: 'Varsayılan başlangıç görünümü',
                desc: "Notebook Navigator'ı açarken hangi bölmenin görüntüleneceğini seçin. Gezinme bölmesi kısayolları, son notları ve klasör ağacını gösterir. Liste bölmesi not listesini hemen gösterir.",
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
            autoRevealActiveNote: {
                name: 'Aktif notu otomatik göster',
                desc: 'Hızlı Geçiş, bağlantılar veya aramadan açıldığında notları otomatik olarak göster.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Sağ kenar çubuğundaki olayları yoksay',
                desc: 'Sağ kenar çubuğunda notlara tıklarken veya değiştirirken aktif notu değiştirme.'
            },
            paneTransitionDuration: {
                name: 'Tek panel animasyonu',
                desc: 'Tek panel modunda paneller arasında geçiş süresi (milisaniye).',
                resetTooltip: 'Varsayılana sıfırla'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'İlk notu otomatik seç (yalnızca masaüstü)',
                desc: 'Klasör veya etiket değiştirirken ilk notu otomatik olarak aç.'
            },
            skipAutoScroll: {
                name: 'Kısayollar için otomatik kaydırmayı devre dışı bırak',
                desc: 'Kısayollardaki öğelere tıklarken gezinme bölmesini kaydırma.'
            },
            autoExpandFoldersTags: {
                name: 'Seçimde genişlet',
                desc: 'Seçildiğinde klasörleri ve etiketleri genişlet. Tek bölme modunda ilk seçim genişletir, ikinci seçim dosyaları gösterir.'
            },
            springLoadedFolders: {
                name: 'Sürüklerken genişlet (yalnızca masaüstü)',
                desc: 'Sürükleme sırasında üzerine gelirken klasörleri ve etiketleri genişlet.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'İlk genişletme gecikmesi',
                desc: 'Sürükleme sırasında ilk klasör veya etiket genişlemeden önceki gecikme (saniye).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Sonraki genişletme gecikmesi',
                desc: 'Aynı sürükleme sırasında ek klasörler veya etiketler genişlemeden önceki gecikme (saniye).'
            },
            navigationBanner: {
                name: 'Gezinme afişi (kasa profili)',
                desc: 'Gezinme bölmesinin üzerinde bir görsel görüntüle. Seçili kasa profiliyle değişir.',
                current: 'Mevcut afiş: {path}',
                chooseButton: 'Görsel seç'
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
                name: 'Son notları göster',
                desc: 'Gezinme bölmesinde son notlar bölümünü görüntüle.'
            },
            recentNotesCount: {
                name: 'Son not sayısı',
                desc: 'Görüntülenecek son not sayısı.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Son notları kısayollarla birlikte sabitle',
                desc: 'Kısayollar sabitlendiğinde son notları dahil et.'
            },
            showTooltips: {
                name: 'İpuçlarını göster',
                desc: 'Notlar ve klasörler için ek bilgi içeren fareyle üzerine gelme ipuçlarını görüntüle.'
            },
            showTooltipPath: {
                name: 'Yolu göster',
                desc: 'İpuçlarında not adlarının altında klasör yolunu görüntüle.'
            },
            resetPaneSeparator: {
                name: 'Bölme ayırıcı konumunu sıfırla',
                desc: 'Gezinme bölmesi ve liste bölmesi arasındaki sürüklenebilir ayırıcıyı varsayılan konuma sıfırla.',
                buttonText: 'Ayırıcıyı sıfırla',
                notice: "Ayırıcı konumu sıfırlandı. Uygulamak için Obsidian'ı yeniden başlatın veya Notebook Navigator'ı yeniden açın."
            },
            multiSelectModifier: {
                name: 'Çoklu seçim değiştirici (yalnızca masaüstü)',
                desc: 'Hangi değiştirici tuşun çoklu seçimi değiştireceğini seçin. Option/Alt seçildiğinde, Cmd/Ctrl tıklaması notları yeni sekmede açar.',
                options: {
                    cmdCtrl: 'Cmd/Ctrl tıkla',
                    optionAlt: 'Option/Alt tıkla'
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
                desc: "Notebook Navigator'ın otomatik olarak açtığı dosyayı seçin, örneğin bir kontrol paneli.",
                current: 'Mevcut: {path}',
                currentMobile: 'Mobil: {path}',
                chooseButton: 'Dosya seç',

                separateMobile: {
                    name: 'Ayrı mobil ana sayfası',
                    desc: 'Mobil cihazlar için farklı bir ana sayfa kullan.'
                }
            },
            excludedNotes: {
                name: 'Notları gizle (kasa profili)',
                desc: 'Virgülle ayrılmış frontmatter özellikleri listesi. Bu özelliklerden herhangi birini içeren notlar gizlenecektir (örn. taslak, özel, arşiv).',
                placeholder: 'taslak, özel'
            },
            excludedFileNamePatterns: {
                name: 'Dosyaları gizle (kasa profili)',
                desc: 'Gizlenecek dosya adı kalıplarının virgülle ayrılmış listesi. * joker karakterlerini ve / yollarını destekler (örn. temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Kasa profili',
                desc: 'Profiller dosya türü görünürlüğünü, gizli dosyaları, gizli klasörleri, gizli etiketleri, gizli notları, kısayolları ve gezinme afişini saklar. Gezinme bölmesi başlığından profilleri değiştir.',
                defaultName: 'Varsayılan',
                addButton: 'Profil ekle',
                editProfilesButton: 'Profilleri düzenle',
                addProfileOption: 'Profil ekle...',
                applyButton: 'Uygula',
                editButton: 'Profili düzenle',
                deleteButton: 'Profili sil',
                addModalTitle: 'Profil ekle',
                editProfilesModalTitle: 'Profilleri düzenle',
                editModalTitle: 'Profili düzenle',
                addModalPlaceholder: 'Profil adı',
                deleteModalTitle: '{name} silinsin mi',
                deleteModalMessage: '{name} kaldırılsın mı? Bu profilde kayıtlı gizli dosya, klasör, etiket ve not filtreleri silinecek.',
                moveUp: 'Yukarı taşı',
                moveDown: 'Aşağı taşı',
                errors: {
                    emptyName: 'Bir profil adı girin',
                    duplicateName: 'Profil adı zaten var'
                }
            },
            vaultTitle: {
                name: 'Kasa başlığı konumu (yalnızca masaüstü)',
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
            dateFormat: {
                name: 'Tarih formatı',
                desc: 'Tarihleri görüntüleme formatı (date-fns formatı kullanır).',
                placeholder: 'd MMM yyyy',
                help: 'Yaygın formatlar:\nd MMM yyyy = 25 May 2022\ndd/MM/yyyy = 25/05/2022\nyyyy-MM-dd = 2022-05-25\n\nSimgeler:\nyyyy/yy = yıl\nMMMM/MMM/MM = ay\ndd/d = gün\nEEEE/EEE = haftanın günü',
                helpTooltip: 'Format referansı için tıklayın'
            },
            timeFormat: {
                name: 'Saat formatı',
                desc: 'Saatleri görüntüleme formatı (date-fns formatı kullanır).',
                placeholder: 'HH:mm',
                help: 'Yaygın formatlar:\nh:mm a = 2:30 PM (12 saat)\nHH:mm = 14:30 (24 saat)\nh:mm:ss a = 2:30:45 PM\nHH:mm:ss = 14:30:45\n\nSimgeler:\nHH/H = 24 saat\nhh/h = 12 saat\nmm = dakika\nss = saniye\na = ÖÖ/ÖS',
                helpTooltip: 'Format referansı için tıklayın'
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
            previewProperties: {
                name: 'Önizleme özellikleri',
                desc: 'Önizleme metni için kontrol edilecek virgülle ayrılmış frontmatter özellikleri listesi. Metni olan ilk özellik kullanılacak.',
                placeholder: 'özet, açıklama, abstract',
                info: 'Belirtilen özelliklerde önizleme metni bulunamazsa, önizleme not içeriğinden oluşturulacak.'
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
                    '2': '2 satır'
                }
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
                desc: 'Küçük resim görüntüleri için kontrol edilecek virgülle ayrılmış frontmatter özellikleri listesi.',
                placeholder: 'küçükresim, öneÇıkanYeniden, öneÇıkan'
            },

            downloadExternalFeatureImages: {
                name: 'Harici görselleri indir',
                desc: 'Öne çıkan görseller için uzak görselleri ve YouTube küçük resimlerini indir.'
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
            showNoteCount: {
                name: 'Not sayısını göster',
                desc: 'Her klasör ve etiketin yanında not sayısını görüntüle.'
            },
            showSectionIcons: {
                name: 'Kısayollar ve son öğeler için simgeleri göster',
                desc: 'Kısayollar ve Son dosyalar gibi gezinme bölümleri için simgeleri görüntüle.'
            },
            interfaceIcons: {
                name: 'Arayüz simgeleri',
                desc: 'Araç çubuğu, klasör, etiket, sabitlenmiş, arama ve sıralama simgelerini düzenleyin.',
                buttonText: 'Simgeleri düzenle'
            },
            showIconsColorOnly: {
                name: 'Rengi yalnızca simgelere uygula',
                desc: 'Etkinleştirildiğinde, özel renkler yalnızca simgelere uygulanır. Devre dışı bırakıldığında, renkler hem simgelere hem de metin etiketlerine uygulanır.'
            },
            collapseBehavior: {
                name: 'Öğeleri daralt',
                desc: 'Tümünü genişlet/daralt düğmesinin neyi etkilediğini seçin.',
                options: {
                    all: 'Tüm klasörler ve etiketler',
                    foldersOnly: 'Yalnızca klasörler',
                    tagsOnly: 'Yalnızca etiketler'
                }
            },
            smartCollapse: {
                name: 'Seçili öğeyi genişletilmiş tut',
                desc: 'Daraltırken seçili klasör veya etiketi ve üst öğelerini genişletilmiş tut.'
            },
            navIndent: {
                name: 'Ağaç girintisi',
                desc: 'İç içe klasörler ve etiketler için girinti genişliğini ayarlayın.'
            },
            navItemHeight: {
                name: 'Öğe yüksekliği',
                desc: 'Gezinme bölmesindeki klasör ve etiketlerin yüksekliğini ayarlayın.'
            },
            navItemHeightScaleText: {
                name: 'Metni öğe yüksekliğiyle ölçekle',
                desc: 'Öğe yüksekliği azaltıldığında gezinme metni boyutunu küçült.'
            },
            navRootSpacing: {
                name: 'Kök öğe aralığı',
                desc: 'Kök seviyesi klasörler ve etiketler arasındaki boşluk.'
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
                desc: 'Etiketlerin gezinme bölmesinde nasıl sıralanacağını seçin. (senkronize edilmez)',
                options: {
                    alphaAsc: "A'dan Z'ye",
                    alphaDesc: "Z'den A'ya",
                    frequencyAsc: 'Sıklık (düşükten yükseğe)',
                    frequencyDesc: 'Sıklık (yüksekten düşüğe)'
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
            keepEmptyTagsProperty: {
                name: 'Son etiket kaldırıldıktan sonra tags özelliğini koru',
                desc: "Tüm etiketler kaldırıldığında tags frontmatter özelliğini koru. Devre dışı bırakıldığında, tags özelliği frontmatter'dan silinir."
            },
            hiddenTags: {
                name: 'Etiketleri gizle (kasa profili)',
                desc: 'Virgülle ayrılmış etiket kalıpları listesi. Ad kalıpları: etiket* (ile başlayan), *etiket (ile biten). Yol kalıpları: arşiv (etiket ve alt öğeler), arşiv/* (yalnızca alt öğeler), projeler/*/taslaklar (ortada joker).',
                placeholder: 'arşiv*, *taslak, projeler/*/eski'
            },
            enableFolderNotes: {
                name: 'Klasör notlarını etkinleştir',
                desc: 'Etkinleştirildiğinde, ilişkili notları olan klasörler tıklanabilir bağlantılar olarak görüntülenir.'
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
            folderNoteProperties: {
                name: 'Klasör notu özellikleri',
                desc: 'Yeni klasör notlarına eklenen YAML frontmatter. --- işaretleri otomatik olarak eklenir.',
                placeholder: 'tema: koyu\nklasörnotu: true'
            },
            hideFolderNoteInList: {
                name: 'Listede klasör notunu gizle',
                desc: 'Klasör notunun klasörün not listesinde görünmesini engelle.'
            },
            pinCreatedFolderNote: {
                name: 'Oluşturulan klasör notlarını sabitle',
                desc: 'Bağlam menüsünden oluşturulduğunda klasör notlarını otomatik olarak sabitle.'
            },
            confirmBeforeDelete: {
                name: 'Silmeden önce onayla',
                desc: 'Not veya klasör silerken onay iletişim kutusunu göster'
            },
            interceptTagClicks: {
                name: 'Tıklamada etiketlere git',
                desc: 'Notlardaki etiketlere tıklandığında, Obsidian aramasını tetiklemek yerine Notebook Navigator\'da o etikete git.'
            },
            metadataCleanup: {
                name: 'Meta verileri temizle',
                desc: 'Dosyalar, klasörler veya etiketler Obsidian dışında silindiğinde, taşındığında veya yeniden adlandırıldığında geride kalan yetim meta verileri kaldırır. Bu yalnızca Notebook Navigator ayarlar dosyasını etkiler.',
                buttonText: 'Meta verileri temizle',
                error: 'Ayarlar temizliği başarısız',
                loading: 'Meta veriler kontrol ediliyor...',
                statusClean: 'Temizlenecek meta veri yok',
                statusCounts: 'Yetim öğeler: {folders} klasör, {tags} etiket, {files} dosya, {pinned} sabitleme, {separators} ayırıcı'
            },
            rebuildCache: {
                name: 'Önbelleği yeniden oluştur',
                desc: 'Eksik etiketler, yanlış önizlemeler veya eksik öne çıkan görseller yaşıyorsanız bunu kullanın. Bu, senkronizasyon çakışmalarından veya beklenmeyen kapanmalardan sonra olabilir.',
                buttonText: 'Önbelleği yeniden oluştur',
                success: 'Önbellek yeniden oluşturuldu',
                error: 'Önbellek yeniden oluşturulamadı',
                indexingTitle: 'Kasa dizinleniyor...',
                progress: 'Notebook Navigator önbelleği güncelleniyor.'
            },
            hotkeys: {
                intro: 'Notebook Navigator kısayol tuşlarını özelleştirmek için <plugin folder>/notebook-navigator/data.json dosyasını düzenleyin. Dosyayı açın ve "keyboardShortcuts" bölümünü bulun. Her giriş bu yapıyı kullanır:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Shift',
                    '"Ctrl" = Control (çapraz platform için "Mod" tercih edin)'
                ],
                guidance:
                    'Alternatif tuşları desteklemek için yukarıda gösterilen ArrowUp ve K bağlamaları gibi birden fazla eşleme ekleyin. Değiştiricileri tek bir girişte her değeri listeleyerek birleştirin, örneğin "modifiers": ["Mod", "Shift"]. "gg" veya "dd" gibi klavye dizileri desteklenmez. Dosyayı düzenledikten sonra Obsidian\'ı yeniden yükleyin.'
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
                placeholder: 'simge'
            },
            frontmatterColorField: {
                name: 'Renk alanı',
                desc: 'Dosya renkleri için frontmatter alanı. Ayarlarda saklanan renkleri kullanmak için boş bırakın.',
                placeholder: 'renk'
            },
            frontmatterSaveMetadata: {
                name: "Simgeleri ve renkleri frontmatter'a kaydet",
                desc: "Yukarıda yapılandırılan alanları kullanarak dosya simgelerini ve renklerini otomatik olarak frontmatter'a yaz."
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
                placeholder: 'başlık, ad'
            },
            frontmatterCreatedField: {
                name: 'Oluşturma zaman damgası alanı',
                desc: 'Oluşturma zaman damgası için frontmatter alan adı. Yalnızca dosya sistemi tarihini kullanmak için boş bırakın.',
                placeholder: 'oluşturuldu'
            },
            frontmatterModifiedField: {
                name: 'Değiştirme zaman damgası alanı',
                desc: 'Değiştirme zaman damgası için frontmatter alan adı. Yalnızca dosya sistemi tarihini kullanmak için boş bırakın.',
                placeholder: 'değiştirildi'
            },
            frontmatterDateFormat: {
                name: 'Zaman damgası formatı',
                desc: "Frontmatter'daki zaman damgalarını ayrıştırmak için kullanılan format. ISO 8601 formatını kullanmak için boş bırakın",
                helpTooltip: 'date-fns format belgelerine bakın',
                help: "Yaygın formatlar:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'Geliştirmeyi destekleyin',
                desc: 'Notebook Navigator kullanmayı seviyorsanız, lütfen sürekli gelişimini desteklemeyi düşünün.',
                buttonText: '❤️ Sponsor ol',
                coffeeButton: '☕️ Bana bir kahve ısmarla'
            },
            updateCheckOnStart: {
                name: 'Başlangıçta yeni sürüm kontrolü',
                desc: 'Başlangıçta yeni eklenti sürümlerini kontrol eder ve güncelleme mevcut olduğunda bildirim gösterir. Her sürüm yalnızca bir kez duyurulur ve kontroller günde en fazla bir kez yapılır.',
                status: 'Yeni sürüm mevcut: {version}'
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
        supportMessage: "Notebook Navigator'ı yararlı buluyorsanız, lütfen gelişimini desteklemeyi düşünün.",
        supportButton: 'Bana bir kahve ısmarla',
        thanksButton: 'Teşekkürler!'
    }
};
