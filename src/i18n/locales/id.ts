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
 * Indonesian language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_ID = {
    // Common UI elements
    common: {
        cancel: 'Batal',
        delete: 'Hapus',
        clear: 'Hapus',
        remove: 'Buang',
        submit: 'Kirim',
        noSelection: 'Tidak ada pilihan',
        untagged: 'Tanpa tag',
        untitled: 'Tanpa judul',
        featureImageAlt: 'Gambar unggulan',
        unknownError: 'Kesalahan tidak diketahui',
        updateBannerTitle: 'Pembaruan Notebook Navigator tersedia',
        updateBannerInstruction: 'Perbarui di Pengaturan -> Plugin komunitas',
        updateIndicatorLabel: 'Versi baru tersedia'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Pilih folder atau tag untuk melihat catatan',
        emptyStateNoNotes: 'Tidak ada catatan',
        pinnedSection: 'Disematkan',
        notesSection: 'Catatan',
        filesSection: 'File',
        hiddenItemAriaLabel: '{name} (tersembunyi)'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Tanpa tag',
        hiddenTags: 'Tag tersembunyi',
        tags: 'Tag'
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Pintasan',
        recentNotesHeader: 'Catatan terbaru',
        recentFilesHeader: 'File terbaru',
        reorderRootFoldersTitle: 'Atur ulang navigasi',
        reorderRootFoldersHint: 'Gunakan panah atau seret untuk mengatur ulang',
        vaultRootLabel: 'Vault',
        resetRootToAlpha: 'Atur ulang ke urutan abjad',
        resetRootToFrequency: 'Atur ulang ke urutan frekuensi',
        pinShortcuts: 'Sematkan pintasan',
        pinShortcutsAndRecentNotes: 'Sematkan pintasan dan catatan terbaru',
        pinShortcutsAndRecentFiles: 'Sematkan pintasan dan file terbaru',
        unpinShortcuts: 'Lepas sematan pintasan',
        unpinShortcutsAndRecentNotes: 'Lepas sematan pintasan dan catatan terbaru',
        unpinShortcutsAndRecentFiles: 'Lepas sematan pintasan dan file terbaru',
        profileMenuLabel: 'Profil',
        profileMenuAria: 'Ubah profil vault'
    },

    shortcuts: {
        folderExists: 'Folder sudah ada di pintasan',
        noteExists: 'Catatan sudah ada di pintasan',
        tagExists: 'Tag sudah ada di pintasan',
        searchExists: 'Pintasan pencarian sudah ada',
        emptySearchQuery: 'Masukkan kueri pencarian sebelum menyimpan',
        emptySearchName: 'Masukkan nama sebelum menyimpan pencarian',
        add: 'Tambahkan ke pintasan',
        addNotesCount: 'Tambahkan {count} catatan ke pintasan',
        addFilesCount: 'Tambahkan {count} file ke pintasan',
        rename: 'Ubah nama pintasan',
        remove: 'Hapus dari pintasan',
        removeAll: 'Hapus semua pintasan',
        removeAllConfirm: 'Hapus semua pintasan?',
        folderNotesPinned: 'Menyematkan {count} catatan folder'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Ciutkan item',
        expandAllFolders: 'Luaskan semua item',
        scrollToTop: 'Gulir ke atas',
        newFolder: 'Folder baru',
        newNote: 'Catatan baru',
        mobileBackToNavigation: 'Kembali ke navigasi',
        changeSortOrder: 'Ubah urutan',
        defaultSort: 'Default',
        customSort: 'Kustom',
        showFolders: 'Tampilkan navigasi',
        hideFolders: 'Sembunyikan navigasi',
        reorderRootFolders: 'Atur ulang navigasi',
        finishRootFolderReorder: 'Selesai',
        toggleDescendantNotes: 'Tampilkan catatan dari subfolder / turunan',
        autoExpandFoldersTags: 'Luaskan saat dipilih',
        showExcludedItems: 'Tampilkan folder, tag, dan catatan tersembunyi',
        hideExcludedItems: 'Sembunyikan folder, tag, dan catatan tersembunyi',
        showDualPane: 'Tampilkan panel ganda',
        showSinglePane: 'Tampilkan panel tunggal',
        changeAppearance: 'Ubah tampilan',
        search: 'Cari'
    },
    // Search input
    searchInput: {
        placeholder: 'Cari...',
        placeholderOmnisearch: 'Omnisearch...',
        clearSearch: 'Hapus pencarian',
        saveSearchShortcut: 'Simpan pintasan pencarian',
        removeSearchShortcut: 'Hapus pintasan pencarian',
        shortcutModalTitle: 'Simpan pintasan pencarian',
        shortcutNamePlaceholder: 'Masukkan nama pintasan'
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'Buka di tab baru',
            openToRight: 'Buka di sebelah kanan',
            openInNewWindow: 'Buka di jendela baru',
            openMultipleInNewTabs: 'Buka {count} catatan di tab baru',
            openMultipleFilesInNewTabs: 'Buka {count} file di tab baru',
            openMultipleToRight: 'Buka {count} catatan di sebelah kanan',
            openMultipleFilesToRight: 'Buka {count} file di sebelah kanan',
            openMultipleInNewWindows: 'Buka {count} catatan di jendela baru',
            openMultipleFilesInNewWindows: 'Buka {count} file di jendela baru',
            pinNote: 'Sematkan catatan',
            pinFile: 'Sematkan file',
            unpinNote: 'Lepas sematan catatan',
            unpinFile: 'Lepas sematan file',
            pinMultipleNotes: 'Sematkan {count} catatan',
            pinMultipleFiles: 'Sematkan {count} file',
            unpinMultipleNotes: 'Lepas sematan {count} catatan',
            unpinMultipleFiles: 'Lepas sematan {count} file',
            duplicateNote: 'Duplikat catatan',
            duplicateFile: 'Duplikat file',
            duplicateMultipleNotes: 'Duplikat {count} catatan',
            duplicateMultipleFiles: 'Duplikat {count} file',
            openVersionHistory: 'Buka riwayat versi',
            revealInFolder: 'Tampilkan di folder',
            revealInFinder: 'Tampilkan di Finder',
            showInExplorer: 'Tampilkan di explorer sistem',
            copyDeepLink: 'Salin URL Obsidian',
            copyPath: 'Salin path sistem file',
            copyRelativePath: 'Salin path vault',
            renameNote: 'Ubah nama catatan',
            renameFile: 'Ubah nama file',
            deleteNote: 'Hapus catatan',
            deleteFile: 'Hapus file',
            deleteMultipleNotes: 'Hapus {count} catatan',
            deleteMultipleFiles: 'Hapus {count} file',
            moveNoteToFolder: 'Pindahkan catatan ke...',
            moveFileToFolder: 'Pindahkan file ke...',
            moveMultipleNotesToFolder: 'Pindahkan {count} catatan ke...',
            moveMultipleFilesToFolder: 'Pindahkan {count} file ke...',
            addTag: 'Tambah tag',
            removeTag: 'Hapus tag',
            removeAllTags: 'Hapus semua tag',
            changeIcon: 'Ubah ikon',
            changeColor: 'Ubah warna'
        },
        folder: {
            newNote: 'Catatan baru',
            newNoteFromTemplate: 'Catatan baru dari template',
            newFolder: 'Folder baru',
            newCanvas: 'Canvas baru',
            newBase: 'Base baru',
            newDrawing: 'Gambar baru',
            newExcalidrawDrawing: 'Gambar Excalidraw baru',
            newTldrawDrawing: 'Gambar Tldraw baru',
            duplicateFolder: 'Duplikat folder',
            searchInFolder: 'Cari di folder',
            copyPath: 'Salin path sistem file',
            copyRelativePath: 'Salin path vault',
            createFolderNote: 'Buat catatan folder',
            detachFolderNote: 'Lepaskan catatan folder',
            deleteFolderNote: 'Hapus catatan folder',
            changeIcon: 'Ubah ikon',
            changeColor: 'Ubah warna',
            changeBackground: 'Ubah latar belakang',
            excludeFolder: 'Sembunyikan folder',
            unhideFolder: 'Tampilkan folder',
            moveFolder: 'Pindahkan folder ke...',
            renameFolder: 'Ubah nama folder',
            deleteFolder: 'Hapus folder'
        },
        tag: {
            changeIcon: 'Ubah ikon',
            changeColor: 'Ubah warna',
            changeBackground: 'Ubah latar belakang',
            showTag: 'Tampilkan tag',
            hideTag: 'Sembunyikan tag'
        },
        navigation: {
            addSeparator: 'Tambah pemisah',
            removeSeparator: 'Hapus pemisah'
        },
        style: {
            title: 'Gaya',
            copy: 'Salin gaya',
            paste: 'Tempel gaya',
            removeIcon: 'Hapus ikon',
            removeColor: 'Hapus warna',
            removeBackground: 'Hapus latar belakang',
            clear: 'Hapus gaya'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        standardPreset: 'Standar',
        compactPreset: 'Kompak',
        defaultSuffix: '(default)',
        titleRows: 'Baris judul',
        previewRows: 'Baris pratinjau',
        groupBy: 'Kelompokkan berdasarkan',
        defaultOption: (rows: number) => `Default (${rows})`,
        defaultTitleOption: (rows: number) => `Baris judul default (${rows})`,
        defaultPreviewOption: (rows: number) => `Baris pratinjau default (${rows})`,
        defaultGroupOption: (groupLabel: string) => `Pengelompokan default (${groupLabel})`,
        titleRowOption: (rows: number) => `${rows} baris judul`,
        previewRowOption: (rows: number) => `${rows} baris pratinjau`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'Cari ikon...',
            recentlyUsedHeader: 'Baru digunakan',
            emptyStateSearch: 'Mulai mengetik untuk mencari ikon',
            emptyStateNoResults: 'Ikon tidak ditemukan',
            showingResultsInfo: 'Menampilkan 50 dari {count} hasil. Ketik lebih lanjut untuk mempersempit.',
            emojiInstructions: 'Ketik atau tempel emoji untuk menggunakannya sebagai ikon',
            removeIcon: 'Hapus ikon',
            allTabLabel: 'Semua'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Tambah aturan'
        },
        interfaceIcons: {
            title: 'Ikon antarmuka',
            items: {
                'nav-shortcuts': 'Pintasan',
                'nav-recent-files': 'File terbaru',
                'nav-expand-all': 'Perluas semua',
                'nav-collapse-all': 'Tutup semua',
                'nav-tree-expand': 'Panah pohon: perluas',
                'nav-tree-collapse': 'Panah pohon: tutup',
                'nav-hidden-items': 'Item tersembunyi',
                'nav-root-reorder': 'Atur ulang folder akar',
                'nav-new-folder': 'Folder baru',
                'nav-show-single-pane': 'Tampilkan panel tunggal',
                'nav-show-dual-pane': 'Tampilkan panel ganda',
                'nav-profile-chevron': 'Panah menu profil',
                'list-search': 'Cari',
                'list-descendants': 'Catatan dari subfolder',
                'list-sort-ascending': 'Urutan: menaik',
                'list-sort-descending': 'Urutan: menurun',
                'list-appearance': 'Ubah tampilan',
                'list-new-note': 'Catatan baru',
                'nav-folder-open': 'Folder terbuka',
                'nav-folder-closed': 'Folder tertutup',
                'nav-tag': 'Tag',
                'list-pinned': 'Item tersemat'
            }
        },
        colorPicker: {
            currentColor: 'Saat ini',
            newColor: 'Baru',
            presetColors: 'Warna preset',
            userColors: 'Warna pengguna',
            paletteDefault: 'Bawaan',
            paletteCustom: 'Kustom',
            copyColors: 'Salin warna',
            colorsCopied: 'Warna disalin ke clipboard',
            copyClipboardError: 'Tidak dapat menulis ke clipboard',
            pasteColors: 'Tempel warna',
            pasteClipboardError: 'Tidak dapat membaca clipboard',
            pasteInvalidJson: 'Clipboard tidak berisi teks yang valid',
            pasteInvalidFormat: 'Diharapkan nilai warna hex',
            colorsPasted: 'Warna berhasil ditempel',
            resetUserColors: 'Hapus warna kustom',
            clearCustomColorsConfirm: 'Hapus semua warna kustom?',
            userColorSlot: 'Warna {slot}',
            recentColors: 'Warna terbaru',
            clearRecentColors: 'Hapus warna terbaru',
            removeRecentColor: 'Hapus warna',
            removeColor: 'Hapus warna',
            apply: 'Terapkan',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'Merah',
                orange: 'Oranye',
                amber: 'Amber',
                yellow: 'Kuning',
                lime: 'Limau',
                green: 'Hijau',
                emerald: 'Zamrud',
                teal: 'Teal',
                cyan: 'Sian',
                sky: 'Langit',
                blue: 'Biru',
                indigo: 'Nila',
                violet: 'Ungu',
                purple: 'Ungu tua',
                fuchsia: 'Fuchsia',
                pink: 'Merah muda',
                rose: 'Mawar',
                gray: 'Abu-abu',
                slate: 'Batu tulis',
                stone: 'Batu'
            }
        },
        selectVaultProfile: {
            title: 'Pilih profil vault',
            currentBadge: 'Aktif',
            emptyState: 'Tidak ada profil vault tersedia.'
        },
        tagOperation: {
            renameTitle: 'Ubah nama tag {tag}',
            deleteTitle: 'Hapus tag {tag}',
            newTagPrompt: 'Nama tag baru',
            newTagPlaceholder: 'Masukkan nama tag baru',
            renameWarning: 'Mengubah nama tag {oldTag} akan memodifikasi {count} {files}.',
            deleteWarning: 'Menghapus tag {tag} akan memodifikasi {count} {files}.',
            modificationWarning: 'Ini akan memperbarui tanggal modifikasi file.',
            affectedFiles: 'File yang terpengaruh:',
            andMore: '...dan {count} lagi',
            confirmRename: 'Ubah nama tag',
            renameUnchanged: '{tag} tidak berubah',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            invalidTagName: 'Masukkan nama tag yang valid.',
            descendantRenameError: 'Tidak dapat memindahkan tag ke dirinya sendiri atau turunannya.',
            confirmDelete: 'Hapus tag',
            file: 'file',
            files: 'file'
        },
        fileSystem: {
            newFolderTitle: 'Folder baru',
            renameFolderTitle: 'Ubah nama folder',
            renameFileTitle: 'Ubah nama file',
            deleteFolderTitle: "Hapus '{name}'?",
            deleteFileTitle: "Hapus '{name}'?",
            folderNamePrompt: 'Masukkan nama folder:',
            hideInOtherVaultProfiles: 'Sembunyikan di profil vault lain',
            renamePrompt: 'Masukkan nama baru:',
            renameVaultTitle: 'Ubah nama tampilan vault',
            renameVaultPrompt: 'Masukkan nama tampilan kustom (kosongkan untuk menggunakan default):',
            deleteFolderConfirm: 'Anda yakin ingin menghapus folder ini dan semua isinya?',
            deleteFileConfirm: 'Anda yakin ingin menghapus file ini?',
            removeAllTagsTitle: 'Hapus semua tag',
            removeAllTagsFromNote: 'Anda yakin ingin menghapus semua tag dari catatan ini?',
            removeAllTagsFromNotes: 'Anda yakin ingin menghapus semua tag dari {count} catatan?'
        },
        folderNoteType: {
            title: 'Pilih jenis catatan folder',
            folderLabel: 'Folder: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `Pindahkan ${name} ke folder...`,
            multipleFilesLabel: (count: number) => `${count} file`,
            navigatePlaceholder: 'Navigasi ke folder...',
            instructions: {
                navigate: 'untuk navigasi',
                move: 'untuk memindahkan',
                select: 'untuk memilih',
                dismiss: 'untuk menutup'
            }
        },
        homepage: {
            placeholder: 'Cari file...',
            instructions: {
                navigate: 'untuk navigasi',
                select: 'untuk mengatur beranda',
                dismiss: 'untuk menutup'
            }
        },
        navigationBanner: {
            placeholder: 'Cari gambar...',
            instructions: {
                navigate: 'untuk navigasi',
                select: 'untuk mengatur banner',
                dismiss: 'untuk menutup'
            }
        },
        tagSuggest: {
            placeholder: 'Cari tag...',
            navigatePlaceholder: 'Navigasi ke tag...',
            addPlaceholder: 'Cari tag untuk ditambahkan...',
            removePlaceholder: 'Pilih tag untuk dihapus...',
            createNewTag: 'Buat tag baru: #{tag}',
            instructions: {
                navigate: 'untuk navigasi',
                select: 'untuk memilih',
                dismiss: 'untuk menutup',
                add: 'untuk menambah tag',
                remove: 'untuk menghapus tag'
            }
        },
        welcome: {
            title: 'Selamat datang di {pluginName}',
            introText:
                'Halo! Sebelum memulai, saya sangat menyarankan Anda menonton lima menit pertama video di bawah ini untuk memahami cara kerja panel dan tombol "Tampilkan catatan dari subfolder".',
            continueText:
                'Jika Anda memiliki waktu lima menit lagi, lanjutkan menonton video untuk memahami mode tampilan ringkas dan cara mengatur pintasan dan tombol pintasan penting dengan benar.',
            thanksText: 'Terima kasih banyak telah mengunduh, selamat menggunakan!',
            videoAlt: 'Menginstal dan menguasai Notebook Navigator',
            openVideoButton: 'Putar video',
            closeButton: 'Nanti saja'
        }
    },
    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Gagal membuat folder: {error}',
            createFile: 'Gagal membuat file: {error}',
            renameFolder: 'Gagal mengubah nama folder: {error}',
            renameFolderNoteConflict: 'Tidak dapat mengubah nama: "{name}" sudah ada di folder ini',
            renameFile: 'Gagal mengubah nama file: {error}',
            deleteFolder: 'Gagal menghapus folder: {error}',
            deleteFile: 'Gagal menghapus file: {error}',
            duplicateNote: 'Gagal menduplikat catatan: {error}',
            createCanvas: 'Gagal membuat canvas: {error}',
            createDatabase: 'Gagal membuat database: {error}',
            duplicateFolder: 'Gagal menduplikat folder: {error}',
            openVersionHistory: 'Gagal membuka riwayat versi: {error}',
            versionHistoryNotFound: 'Perintah riwayat versi tidak ditemukan. Pastikan Obsidian Sync diaktifkan.',
            revealInExplorer: 'Gagal menampilkan file di explorer sistem: {error}',
            folderNoteAlreadyExists: 'Catatan folder sudah ada',
            folderAlreadyExists: 'Folder "{name}" sudah ada',
            folderNotesDisabled: 'Aktifkan catatan folder di pengaturan untuk mengkonversi file',
            folderNoteAlreadyLinked: 'File ini sudah berfungsi sebagai catatan folder',
            folderNoteNotFound: 'Tidak ada catatan folder di folder yang dipilih',
            folderNoteUnsupportedExtension: 'Ekstensi file tidak didukung: {extension}',
            folderNoteMoveFailed: 'Gagal memindahkan file saat konversi: {error}',
            folderNoteRenameConflict: 'File bernama "{name}" sudah ada di folder',
            folderNoteConversionFailed: 'Gagal mengkonversi file ke catatan folder',
            folderNoteConversionFailedWithReason: 'Gagal mengkonversi file ke catatan folder: {error}',
            folderNoteOpenFailed: 'File dikonversi tetapi gagal membuka catatan folder: {error}',
            failedToDeleteFile: 'Gagal menghapus {name}: {error}',
            failedToDeleteMultipleFiles: 'Gagal menghapus {count} file',
            versionHistoryNotAvailable: 'Layanan riwayat versi tidak tersedia',
            drawingAlreadyExists: 'Gambar dengan nama ini sudah ada',
            failedToCreateDrawing: 'Gagal membuat gambar',
            noFolderSelected: 'Tidak ada folder yang dipilih di Notebook Navigator',
            noFileSelected: 'Tidak ada file yang dipilih'
        },
        warnings: {
            linkBreakingNameCharacters: 'Nama ini berisi karakter yang merusak tautan Obsidian: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'Nama tidak boleh diawali dengan titik atau berisi : atau /.',
            forbiddenNameCharactersWindows: 'Karakter yang dipesan di Windows tidak diizinkan: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'Folder disembunyikan: {name}',
            showFolder: 'Folder ditampilkan: {name}'
        },
        notifications: {
            deletedMultipleFiles: 'Menghapus {count} file',
            movedMultipleFiles: 'Memindahkan {count} file ke {folder}',
            folderNoteConversionSuccess: 'Mengkonversi file ke catatan folder di "{name}"',
            folderMoved: 'Memindahkan folder "{name}"',
            deepLinkCopied: 'URL Obsidian disalin ke clipboard',
            pathCopied: 'Path disalin ke clipboard',
            relativePathCopied: 'Path relatif disalin ke clipboard',
            tagAddedToNote: 'Menambahkan tag ke 1 catatan',
            tagAddedToNotes: 'Menambahkan tag ke {count} catatan',
            tagRemovedFromNote: 'Menghapus tag dari 1 catatan',
            tagRemovedFromNotes: 'Menghapus tag dari {count} catatan',
            tagsClearedFromNote: 'Menghapus semua tag dari 1 catatan',
            tagsClearedFromNotes: 'Menghapus semua tag dari {count} catatan',
            noTagsToRemove: 'Tidak ada tag untuk dihapus',
            noFilesSelected: 'Tidak ada file yang dipilih',
            tagOperationsNotAvailable: 'Operasi tag tidak tersedia',
            tagsRequireMarkdown: 'Tag hanya didukung pada catatan Markdown',
            iconPackDownloaded: '{provider} diunduh',
            iconPackUpdated: '{provider} diperbarui ({version})',
            iconPackRemoved: '{provider} dihapus',
            iconPackLoadFailed: 'Gagal memuat {provider}',
            hiddenFileReveal: 'File tersembunyi. Aktifkan "Tampilkan item tersembunyi" untuk menampilkannya'
        },
        confirmations: {
            deleteMultipleFiles: 'Anda yakin ingin menghapus {count} file?',
            deleteConfirmation: 'Tindakan ini tidak dapat dibatalkan.'
        },
        defaultNames: {
            untitled: 'Tanpa judul',
            untitledNumber: 'Tanpa judul {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Tidak dapat memindahkan folder ke dirinya sendiri atau subfolder.',
            itemAlreadyExists: 'Item bernama "{name}" sudah ada di lokasi ini.',
            failedToMove: 'Gagal memindahkan: {error}',
            failedToAddTag: 'Gagal menambahkan tag "{tag}"',
            failedToClearTags: 'Gagal menghapus tag',
            failedToMoveFolder: 'Gagal memindahkan folder "{name}"',
            failedToImportFiles: 'Gagal mengimpor: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} file sudah ada di tujuan',
            addedTag: 'Menambahkan tag "{tag}" ke {count} file',
            filesAlreadyHaveTag: '{count} file sudah memiliki tag ini atau yang lebih spesifik',
            clearedTags: 'Menghapus semua tag dari {count} file',
            noTagsToClear: 'Tidak ada tag untuk dihapus',
            fileImported: 'Mengimpor 1 file',
            filesImported: 'Mengimpor {count} file'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'Hari ini',
        yesterday: 'Kemarin',
        previous7Days: '7 hari terakhir',
        previous30Days: '30 hari terakhir'
    },

    // Weekdays
    weekdays: {
        sunday: 'Minggu',
        monday: 'Senin',
        tuesday: 'Selasa',
        wednesday: 'Rabu',
        thursday: 'Kamis',
        friday: 'Jumat',
        saturday: 'Sabtu'
    },

    // Plugin commands
    commands: {
        open: 'Buka',
        openHomepage: 'Buka beranda',
        revealFile: 'Tampilkan file',
        search: 'Cari',
        toggleDualPane: 'Alihkan tata letak panel ganda',
        selectVaultProfile: 'Pilih profil vault',
        selectVaultProfile1: 'Pilih profil vault 1',
        selectVaultProfile2: 'Pilih profil vault 2',
        selectVaultProfile3: 'Pilih profil vault 3',
        deleteFile: 'Hapus file',
        createNewNote: 'Buat catatan baru',
        createNewNoteFromTemplate: 'Catatan baru dari template',
        moveFiles: 'Pindahkan file',
        selectNextFile: 'Pilih file berikutnya',
        selectPreviousFile: 'Pilih file sebelumnya',
        convertToFolderNote: 'Konversi ke catatan folder',
        setAsFolderNote: 'Atur sebagai catatan folder',
        detachFolderNote: 'Lepaskan catatan folder',
        pinAllFolderNotes: 'Sematkan semua catatan folder',
        navigateToFolder: 'Navigasi ke folder',
        navigateToTag: 'Navigasi ke tag',
        addShortcut: 'Tambahkan ke pintasan',
        openShortcut: 'Buka pintasan {number}',
        toggleDescendants: 'Alihkan turunan',
        toggleHidden: 'Alihkan folder, tag, dan catatan tersembunyi',
        toggleTagSort: 'Alihkan urutan tag',
        collapseExpand: 'Ciutkan / luaskan semua item',
        addTag: 'Tambah tag ke file yang dipilih',
        removeTag: 'Hapus tag dari file yang dipilih',
        removeAllTags: 'Hapus semua tag dari file yang dipilih',
        rebuildCache: 'Bangun ulang cache'
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator',
        ribbonTooltip: 'Notebook Navigator',
        revealInNavigator: 'Tampilkan di Notebook Navigator'
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Terakhir dimodifikasi pada',
        createdAt: 'Dibuat pada',
        file: 'file',
        files: 'file',
        folder: 'folder',
        folders: 'folder'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'Laporan metadata gagal diekspor ke: {filename}',
            exportFailed: 'Gagal mengekspor laporan metadata'
        },
        sections: {
            general: 'Umum',
            navigationPane: 'Panel navigasi',
            icons: 'Paket ikon',
            folders: 'Folder',
            foldersAndTags: 'Folder & tag',
            tags: 'Tag',
            search: 'Pencarian',
            searchAndHotkeys: 'Pencarian & pintasan',
            listPane: 'Panel daftar',
            notes: 'Catatan',
            hotkeys: 'Pintasan',
            advanced: 'Lanjutan'
        },
        groups: {
            general: {
                filtering: 'Penyaringan',
                behavior: 'Perilaku',
                view: 'Tampilan',
                icons: 'Ikon',
                desktopAppearance: 'Tampilan desktop',
                formatting: 'Pemformatan'
            },
            navigation: {
                appearance: 'Tampilan',
                shortcutsAndRecent: 'Pintasan & item terbaru'
            },
            list: {
                display: 'Tampilan',
                pinnedNotes: 'Catatan yang disematkan',
                quickActions: 'Aksi cepat'
            },
            notes: {
                frontmatter: 'Frontmatter',
                icon: 'Ikon',
                title: 'Judul',
                previewText: 'Teks pratinjau',
                featureImage: 'Gambar fitur',
                tags: 'Tag',
                date: 'Tanggal',
                parentFolder: 'Folder induk'
            }
        },
        items: {
            searchProvider: {
                name: 'Penyedia pencarian',
                desc: 'Pilih antara pencarian nama file cepat atau pencarian teks lengkap dengan plugin Omnisearch. (tidak disinkronkan)',
                options: {
                    internal: 'Pencarian filter',
                    omnisearch: 'Omnisearch (teks lengkap)'
                },
                info: {
                    filterSearch: {
                        title: 'Pencarian filter (default):',
                        description:
                            'Memfilter file berdasarkan nama dan tag dalam folder dan subfolder saat ini. Mode filter: teks dan tag campuran cocok dengan semua istilah (misal, "proyek #kerja"). Mode tag: pencarian hanya dengan tag mendukung operator AND/OR (misal, "#kerja AND #mendesak", "#proyek OR #pribadi"). Cmd/Ctrl+Klik tag untuk menambah dengan AND, Cmd/Ctrl+Shift+Klik untuk menambah dengan OR. Mendukung pengecualian dengan awalan ! (misal, !draf, !#arsip) dan menemukan catatan tanpa tag dengan !#.'
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            'Pencarian teks lengkap yang mencari seluruh vault, kemudian memfilter hasil untuk menampilkan hanya file dari folder, subfolder, atau tag yang dipilih. Memerlukan plugin Omnisearch terinstal - jika tidak tersedia, pencarian akan otomatis kembali ke pencarian Filter.',
                        warningNotInstalled: 'Plugin Omnisearch tidak terinstal. Pencarian filter digunakan.',
                        limitations: {
                            title: 'Keterbatasan yang diketahui:',
                            performance: 'Kinerja: Bisa lambat, terutama saat mencari kurang dari 3 karakter di vault besar',
                            pathBug:
                                'Bug path: Tidak dapat mencari di path dengan karakter non-ASCII dan tidak mencari subpath dengan benar, mempengaruhi file mana yang muncul di hasil pencarian',
                            limitedResults:
                                'Hasil terbatas: Karena Omnisearch mencari seluruh vault dan mengembalikan jumlah hasil terbatas sebelum pemfilteran, file yang relevan dari folder saat ini mungkin tidak muncul jika terlalu banyak kecocokan di tempat lain di vault',
                            previewText:
                                'Teks pratinjau: Pratinjau catatan diganti dengan kutipan hasil Omnisearch, yang mungkin tidak menampilkan sorotan kecocokan pencarian sebenarnya jika muncul di tempat lain di file'
                        }
                    }
                }
            },
            listPaneTitle: {
                name: 'Judul panel daftar (desktop saja)',
                desc: 'Pilih di mana judul panel daftar ditampilkan.',
                options: {
                    header: 'Tampilkan di header',
                    list: 'Tampilkan di panel daftar',
                    hidden: 'Jangan tampilkan'
                }
            },
            sortNotesBy: {
                name: 'Urutkan catatan berdasarkan',
                desc: 'Pilih cara catatan diurutkan dalam daftar catatan.',
                options: {
                    'modified-desc': 'Tanggal diedit (terbaru di atas)',
                    'modified-asc': 'Tanggal diedit (terlama di atas)',
                    'created-desc': 'Tanggal dibuat (terbaru di atas)',
                    'created-asc': 'Tanggal dibuat (terlama di atas)',
                    'title-asc': 'Judul (A di atas)',
                    'title-desc': 'Judul (Z di atas)'
                }
            },
            revealFileOnListChanges: {
                name: 'Gulir ke file yang dipilih saat perubahan daftar',
                desc: 'Gulir ke file yang dipilih saat menyematkan catatan, menampilkan catatan turunan, mengubah tampilan folder, atau menjalankan operasi file.'
            },
            includeDescendantNotes: {
                name: 'Tampilkan catatan dari subfolder / turunan (tidak disinkronkan)',
                desc: 'Sertakan catatan dari subfolder bersarang dan turunan tag saat melihat folder atau tag.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Batasi catatan yang disematkan ke foldernya',
                desc: 'Catatan yang disematkan hanya muncul saat melihat folder atau tag tempat mereka disematkan.'
            },
            separateNoteCounts: {
                name: 'Tampilkan jumlah saat ini dan turunan secara terpisah',
                desc: 'Tampilkan jumlah catatan sebagai format "saat ini ▾ turunan" di folder dan tag.'
            },
            groupNotes: {
                name: 'Kelompokkan catatan',
                desc: 'Tampilkan header antara catatan yang dikelompokkan berdasarkan tanggal atau folder. Tampilan tag menggunakan grup tanggal saat pengelompokan folder diaktifkan.',
                options: {
                    none: 'Jangan kelompokkan',
                    date: 'Kelompokkan berdasarkan tanggal',
                    folder: 'Kelompokkan berdasarkan folder'
                }
            },
            showPinnedGroupHeader: {
                name: 'Tampilkan header grup yang disematkan',
                desc: 'Tampilkan header bagian yang disematkan di atas catatan yang disematkan.'
            },
            showPinnedIcon: {
                name: 'Tampilkan ikon yang disematkan',
                desc: 'Tampilkan ikon di sebelah header bagian yang disematkan.'
            },
            defaultListMode: {
                name: 'Mode daftar default',
                desc: 'Pilih tata letak daftar default. Standar menampilkan judul, tanggal, deskripsi, dan teks pratinjau. Kompak menampilkan judul saja. Ganti tampilan per folder.',
                options: {
                    standard: 'Standar',
                    compact: 'Kompak'
                }
            },
            showFileIcons: {
                name: 'Tampilkan ikon file',
                desc: 'Tampilkan ikon file dengan spasi rata kiri. Menonaktifkan menghapus ikon dan indentasi. Prioritas: kustom > nama file > tipe file > default.'
            },
            showFilenameMatchIcons: {
                name: 'Ikon berdasarkan nama file',
                desc: 'Tetapkan ikon ke file berdasarkan teks dalam namanya.'
            },
            fileNameIconMap: {
                name: 'Peta ikon nama file',
                desc: 'File yang berisi teks mendapat ikon yang ditentukan. Satu pemetaan per baris: teks=ikon',
                placeholder: '# teks=ikon\nrapat=LiCalendar\nfaktur=PhReceipt',
                editTooltip: 'Edit pemetaan'
            },
            showCategoryIcons: {
                name: 'Ikon berdasarkan tipe file',
                desc: 'Tetapkan ikon ke file berdasarkan ekstensinya.'
            },
            fileTypeIconMap: {
                name: 'Peta ikon tipe file',
                desc: 'File dengan ekstensi mendapat ikon yang ditentukan. Satu pemetaan per baris: ekstensi=ikon',
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: 'Edit pemetaan'
            },
            optimizeNoteHeight: {
                name: 'Tinggi catatan variabel',
                desc: 'Gunakan tinggi ringkas untuk catatan yang disematkan dan catatan tanpa teks pratinjau.'
            },
            compactItemHeight: {
                name: 'Tinggi item kompak',
                desc: 'Atur tinggi item daftar kompak di desktop dan mobile.',
                resetTooltip: 'Kembalikan ke default (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Skalakan teks dengan tinggi item kompak',
                desc: 'Skalakan teks daftar kompak saat tinggi item dikurangi.'
            },
            showParentFolder: {
                name: 'Tampilkan folder induk',
                desc: 'Tampilkan nama folder induk untuk catatan di subfolder atau tag.'
            },
            parentFolderClickRevealsFile: {
                name: 'Klik folder induk untuk membuka folder',
                desc: 'Mengklik label folder induk membuka folder di panel daftar.'
            },
            showParentFolderColor: {
                name: 'Tampilkan warna folder induk',
                desc: 'Gunakan warna folder pada label folder induk.'
            },
            showQuickActions: {
                name: 'Tampilkan aksi cepat (desktop saja)',
                desc: 'Tampilkan tombol aksi saat mengarahkan kursor ke file. Kontrol tombol memilih aksi mana yang muncul.'
            },
            dualPane: {
                name: 'Tata letak panel ganda (tidak disinkronkan)',
                desc: 'Tampilkan panel navigasi dan panel daftar berdampingan di desktop.'
            },
            dualPaneOrientation: {
                name: 'Orientasi panel ganda (tidak disinkronkan)',
                desc: 'Pilih tata letak horizontal atau vertikal saat panel ganda aktif.',
                options: {
                    horizontal: 'Pembagian horizontal',
                    vertical: 'Pembagian vertikal'
                }
            },
            appearanceBackground: {
                name: 'Warna latar belakang',
                desc: 'Pilih warna latar belakang untuk panel navigasi dan daftar.',
                options: {
                    separate: 'Latar belakang terpisah',
                    primary: 'Gunakan latar belakang daftar',
                    secondary: 'Gunakan latar belakang navigasi'
                }
            },
            appearanceScale: {
                name: 'Tingkat zoom (tidak disinkronkan)',
                desc: 'Mengontrol tingkat zoom keseluruhan Notebook Navigator.'
            },
            startView: {
                name: 'Tampilan startup default',
                desc: 'Pilih panel mana yang ditampilkan saat membuka Notebook Navigator. Panel navigasi menampilkan pintasan, catatan terbaru, dan pohon folder. Panel daftar menampilkan daftar catatan segera.',
                options: {
                    navigation: 'Panel navigasi',
                    files: 'Panel daftar'
                }
            },
            toolbarButtons: {
                name: 'Tombol toolbar',
                desc: 'Pilih tombol mana yang muncul di toolbar. Tombol tersembunyi tetap dapat diakses melalui perintah dan menu.',
                navigationLabel: 'Toolbar navigasi',
                listLabel: 'Toolbar daftar'
            },
            autoRevealActiveNote: {
                name: 'Auto-tampilkan catatan aktif',
                desc: 'Secara otomatis menampilkan catatan saat dibuka dari Quick Switcher, tautan, atau pencarian.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Abaikan peristiwa dari sidebar kanan',
                desc: 'Jangan ubah catatan aktif saat mengklik atau mengubah catatan di sidebar kanan.'
            },
            paneTransitionDuration: {
                name: 'Animasi panel tunggal',
                desc: 'Durasi transisi saat beralih panel dalam mode panel tunggal (milidetik).',
                resetTooltip: 'Atur ulang ke default'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Auto-pilih catatan pertama (desktop saja)',
                desc: 'Secara otomatis membuka catatan pertama saat beralih folder atau tag.'
            },
            skipAutoScroll: {
                name: 'Nonaktifkan auto-gulir untuk pintasan',
                desc: 'Jangan gulir panel navigasi saat mengklik item di pintasan.'
            },
            autoExpandFoldersTags: {
                name: 'Luaskan saat dipilih',
                desc: 'Luaskan folder dan tag saat dipilih. Dalam mode panel tunggal, pilihan pertama meluaskan, pilihan kedua menampilkan file.'
            },
            springLoadedFolders: {
                name: 'Luaskan saat menyeret (desktop saja)',
                desc: 'Luaskan folder dan tag saat mengarahkan kursor selama menyeret.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Tunda perluasan pertama',
                desc: 'Penundaan sebelum folder atau tag pertama diluaskan selama penyeretan (detik).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Tunda perluasan berikutnya',
                desc: 'Penundaan sebelum meluaskan folder atau tag tambahan selama penyeretan yang sama (detik).'
            },
            navigationBanner: {
                name: 'Banner navigasi (profil vault)',
                desc: 'Tampilkan gambar di atas panel navigasi. Berubah dengan profil vault yang dipilih.',
                current: 'Banner saat ini: {path}',
                chooseButton: 'Pilih gambar'
            },
            showShortcuts: {
                name: 'Tampilkan pintasan',
                desc: 'Tampilkan bagian pintasan di panel navigasi.'
            },
            shortcutBadgeDisplay: {
                name: 'Lencana pintasan',
                desc: "Apa yang ditampilkan di samping pintasan. Gunakan perintah 'Buka pintasan 1-9' untuk membuka pintasan secara langsung.",
                options: {
                    index: 'Posisi (1-9)',
                    count: 'Jumlah item',
                    none: 'Tidak ada'
                }
            },
            showRecentNotes: {
                name: 'Tampilkan catatan terbaru',
                desc: 'Tampilkan bagian catatan terbaru di panel navigasi.'
            },
            recentNotesCount: {
                name: 'Jumlah catatan terbaru',
                desc: 'Jumlah catatan terbaru yang ditampilkan.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Sematkan catatan terbaru bersama pintasan',
                desc: 'Sertakan catatan terbaru saat pintasan disematkan.'
            },
            showTooltips: {
                name: 'Tampilkan tooltip',
                desc: 'Tampilkan tooltip hover dengan informasi tambahan untuk catatan dan folder.'
            },
            showTooltipPath: {
                name: 'Tampilkan path',
                desc: 'Tampilkan path folder di bawah nama catatan di tooltip.'
            },
            resetPaneSeparator: {
                name: 'Atur ulang posisi pemisah panel',
                desc: 'Atur ulang pemisah yang dapat diseret antara panel navigasi dan panel daftar ke posisi default.',
                buttonText: 'Atur ulang pemisah',
                notice: 'Posisi pemisah diatur ulang. Mulai ulang Obsidian atau buka kembali Notebook Navigator untuk menerapkan.'
            },
            multiSelectModifier: {
                name: 'Modifier multi-pilih (desktop saja)',
                desc: 'Pilih tombol modifier mana yang mengalihkan multi-pilih. Ketika Option/Alt dipilih, klik Cmd/Ctrl membuka catatan di tab baru.',
                options: {
                    cmdCtrl: 'Klik Cmd/Ctrl',
                    optionAlt: 'Klik Option/Alt'
                }
            },
            fileVisibility: {
                name: 'Tampilkan jenis file (profil vault)',
                desc: 'Filter jenis file mana yang ditampilkan di navigator. Jenis file yang tidak didukung oleh Obsidian mungkin terbuka di aplikasi eksternal.',
                options: {
                    documents: 'Dokumen (.md, .canvas, .base)',
                    supported: 'Didukung (terbuka di Obsidian)',
                    all: 'Semua (mungkin terbuka secara eksternal)'
                }
            },
            homepage: {
                name: 'Beranda',
                desc: 'Pilih file yang Notebook Navigator buka secara otomatis, seperti dasbor.',
                current: 'Saat ini: {path}',
                currentMobile: 'Mobile: {path}',
                chooseButton: 'Pilih file',

                separateMobile: {
                    name: 'Beranda mobile terpisah',
                    desc: 'Gunakan beranda berbeda untuk perangkat mobile.'
                }
            },
            excludedNotes: {
                name: 'Sembunyikan catatan (profil vault)',
                desc: 'Daftar properti frontmatter yang dipisahkan koma. Catatan yang berisi properti ini akan disembunyikan (misal, draf, pribadi, arsip).',
                placeholder: 'draf, pribadi'
            },
            excludedFileNamePatterns: {
                name: 'Sembunyikan file (profil vault)',
                desc: 'Daftar pola nama file yang dipisahkan koma untuk disembunyikan. Mendukung wildcard * dan jalur / (misal, temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Profil vault',
                desc: 'Profil menyimpan visibilitas jenis file, file tersembunyi, folder tersembunyi, tag tersembunyi, catatan tersembunyi, pintasan, dan banner navigasi. Beralih profil dari header panel navigasi.',
                defaultName: 'Default',
                addButton: 'Tambah profil',
                editProfilesButton: 'Edit profil',
                addProfileOption: 'Tambah profil...',
                applyButton: 'Terapkan',
                editButton: 'Edit profil',
                deleteButton: 'Hapus profil',
                addModalTitle: 'Tambah profil',
                editProfilesModalTitle: 'Edit profil',
                editModalTitle: 'Edit profil',
                addModalPlaceholder: 'Nama profil',
                deleteModalTitle: 'Hapus {name}',
                deleteModalMessage:
                    'Hapus {name}? Filter file, folder, tag, dan catatan tersembunyi yang disimpan di profil ini akan dihapus.',
                moveUp: 'Pindah ke atas',
                moveDown: 'Pindah ke bawah',
                errors: {
                    emptyName: 'Masukkan nama profil',
                    duplicateName: 'Nama profil sudah ada'
                }
            },
            vaultTitle: {
                name: 'Penempatan judul vault (khusus desktop)',
                desc: 'Pilih di mana judul vault ditampilkan.',
                options: {
                    header: 'Tampilkan di header',
                    navigation: 'Tampilkan di panel navigasi'
                }
            },
            excludedFolders: {
                name: 'Sembunyikan folder (profil vault)',
                desc: 'Daftar folder yang dipisahkan koma untuk disembunyikan. Pola nama: assets* (folder yang dimulai dengan assets), *_temp (diakhiri dengan _temp). Pola path: /arsip (arsip root saja), /res* (folder root yang dimulai dengan res), /*/temp (folder temp satu level ke dalam), /proyek/* (semua folder di dalam proyek).',
                placeholder: 'template, assets*, /arsip, /res*'
            },
            showFileDate: {
                name: 'Tampilkan tanggal',
                desc: 'Tampilkan tanggal di bawah nama catatan.'
            },
            alphabeticalDateMode: {
                name: 'Saat mengurutkan berdasarkan nama',
                desc: 'Tanggal yang ditampilkan saat catatan diurutkan secara alfabetis.',
                options: {
                    created: 'Tanggal dibuat',
                    modified: 'Tanggal dimodifikasi'
                }
            },
            showFileTags: {
                name: 'Tampilkan tag file',
                desc: 'Tampilkan tag yang dapat diklik di item file.'
            },
            showFileTagAncestors: {
                name: 'Tampilkan path tag lengkap',
                desc: "Tampilkan path hierarki tag lengkap. Saat diaktifkan: 'ai/openai', 'kerja/proyek/2024'. Saat dinonaktifkan: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Warnai tag file',
                desc: 'Terapkan warna tag ke badge tag di item file.'
            },
            prioritizeColoredFileTags: {
                name: 'Tampilkan tag berwarna terlebih dahulu',
                desc: 'Urutkan tag berwarna sebelum tag lain di item file.'
            },
            showFileTagsInCompactMode: {
                name: 'Tampilkan tag file dalam mode kompak',
                desc: 'Tampilkan tag saat tanggal, pratinjau, dan gambar disembunyikan.'
            },
            dateFormat: {
                name: 'Format tanggal',
                desc: 'Format untuk menampilkan tanggal (menggunakan format date-fns).',
                placeholder: 'd MMM yyyy',
                help: 'Format umum:\nd MMM yyyy = 25 Mei 2022\ndd/MM/yyyy = 25/05/2022\nyyyy-MM-dd = 2022-05-25\n\nToken:\nyyyy/yy = tahun\nMMMM/MMM/MM = bulan\ndd/d = hari\nEEEE/EEE = hari kerja',
                helpTooltip: 'Klik untuk referensi format'
            },
            timeFormat: {
                name: 'Format waktu',
                desc: 'Format untuk menampilkan waktu (menggunakan format date-fns).',
                placeholder: 'HH:mm',
                help: 'Format umum:\nHH:mm = 14:30 (24 jam)\nh:mm a = 2:30 PM (12 jam)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nToken:\nHH/H = 24 jam\nhh/h = 12 jam\nmm = menit\nss = detik\na = AM/PM',
                helpTooltip: 'Klik untuk referensi format'
            },
            showFilePreview: {
                name: 'Tampilkan pratinjau catatan',
                desc: 'Tampilkan teks pratinjau di bawah nama catatan.'
            },
            skipHeadingsInPreview: {
                name: 'Lewati judul dalam pratinjau',
                desc: 'Lewati baris judul saat menghasilkan teks pratinjau.'
            },
            skipCodeBlocksInPreview: {
                name: 'Lewati blok kode dalam pratinjau',
                desc: 'Lewati blok kode saat menghasilkan teks pratinjau.'
            },
            stripHtmlInPreview: {
                name: 'Hapus HTML di pratinjau',
                desc: 'Hapus tag HTML dari teks pratinjau. Dapat memengaruhi kinerja pada catatan besar.'
            },
            previewProperties: {
                name: 'Properti pratinjau',
                desc: 'Daftar properti frontmatter yang dipisahkan koma untuk memeriksa teks pratinjau. Properti pertama dengan teks akan digunakan.',
                placeholder: 'ringkasan, deskripsi, abstrak',
                info: 'Jika tidak ada teks pratinjau yang ditemukan di properti yang ditentukan, pratinjau akan dihasilkan dari konten catatan.'
            },
            previewRows: {
                name: 'Baris pratinjau',
                desc: 'Jumlah baris yang ditampilkan untuk teks pratinjau.',
                options: {
                    '1': '1 baris',
                    '2': '2 baris',
                    '3': '3 baris',
                    '4': '4 baris',
                    '5': '5 baris'
                }
            },
            fileNameRows: {
                name: 'Baris judul',
                desc: 'Jumlah baris yang ditampilkan untuk judul catatan.',
                options: {
                    '1': '1 baris',
                    '2': '2 baris'
                }
            },
            showFeatureImage: {
                name: 'Tampilkan gambar unggulan',
                desc: 'Menampilkan thumbnail gambar pertama yang ditemukan di catatan.'
            },
            forceSquareFeatureImage: {
                name: 'Paksa gambar unggulan persegi',
                desc: 'Render gambar unggulan sebagai thumbnail persegi.'
            },
            featureImageProperties: {
                name: 'Properti gambar',
                desc: 'Daftar properti frontmatter yang dipisahkan koma untuk memeriksa gambar thumbnail.',
                placeholder: 'thumbnail, featureResized, feature'
            },

            downloadExternalFeatureImages: {
                name: 'Unduh gambar eksternal',
                desc: 'Unduh gambar jarak jauh dan thumbnail YouTube untuk gambar unggulan.'
            },
            showRootFolder: {
                name: 'Tampilkan folder root',
                desc: 'Tampilkan nama vault sebagai folder root di pohon.'
            },
            showFolderIcons: {
                name: 'Tampilkan ikon folder',
                desc: 'Tampilkan ikon di sebelah folder di panel navigasi.'
            },
            inheritFolderColors: {
                name: 'Warisi warna folder',
                desc: 'Folder anak mewarisi warna dari folder induk.'
            },
            showNoteCount: {
                name: 'Tampilkan jumlah catatan',
                desc: 'Tampilkan jumlah catatan di sebelah setiap folder dan tag.'
            },
            showSectionIcons: {
                name: 'Tampilkan ikon untuk pintasan dan item terbaru',
                desc: 'Tampilkan ikon untuk bagian navigasi seperti Pintasan dan File terbaru.'
            },
            interfaceIcons: {
                name: 'Ikon antarmuka',
                desc: 'Edit ikon toolbar, folder, tag, item tersemat, pencarian, dan pengurutan.',
                buttonText: 'Edit ikon'
            },
            showIconsColorOnly: {
                name: 'Terapkan warna ke ikon saja',
                desc: 'Saat diaktifkan, warna kustom hanya diterapkan ke ikon. Saat dinonaktifkan, warna diterapkan ke ikon dan label teks.'
            },
            collapseBehavior: {
                name: 'Ciutkan item',
                desc: 'Pilih apa yang dipengaruhi tombol luaskan/ciutkan semua.',
                options: {
                    all: 'Semua folder dan tag',
                    foldersOnly: 'Folder saja',
                    tagsOnly: 'Tag saja'
                }
            },
            smartCollapse: {
                name: 'Pertahankan item yang dipilih tetap terbuka',
                desc: 'Saat menciutkan, pertahankan folder atau tag yang dipilih saat ini dan induknya tetap terbuka.'
            },
            navIndent: {
                name: 'Indentasi pohon',
                desc: 'Sesuaikan lebar indentasi untuk folder dan tag bersarang.'
            },
            navItemHeight: {
                name: 'Tinggi item',
                desc: 'Sesuaikan tinggi folder dan tag di panel navigasi.'
            },
            navItemHeightScaleText: {
                name: 'Skalakan teks dengan tinggi item',
                desc: 'Kurangi ukuran teks navigasi saat tinggi item dikurangi.'
            },
            navRootSpacing: {
                name: 'Spasi item root',
                desc: 'Spasi antara folder dan tag tingkat root.'
            },
            showTags: {
                name: 'Tampilkan tag',
                desc: 'Tampilkan bagian tag di navigator.'
            },
            showTagIcons: {
                name: 'Tampilkan ikon tag',
                desc: 'Tampilkan ikon di sebelah tag di panel navigasi.'
            },
            inheritTagColors: {
                name: 'Warisi warna tag',
                desc: 'Tag anak mewarisi warna dari tag induk.'
            },
            tagSortOrder: {
                name: 'Urutan tag',
                desc: 'Pilih cara tag diurutkan di panel navigasi. (tidak disinkronkan)',
                options: {
                    alphaAsc: 'A ke Z',
                    alphaDesc: 'Z ke A',
                    frequencyAsc: 'Frekuensi (rendah ke tinggi)',
                    frequencyDesc: 'Frekuensi (tinggi ke rendah)'
                }
            },
            showAllTagsFolder: {
                name: 'Tampilkan folder tag',
                desc: 'Tampilkan "Tag" sebagai folder yang dapat diciutkan.'
            },
            showUntagged: {
                name: 'Tampilkan catatan tanpa tag',
                desc: 'Tampilkan item "Tanpa tag" untuk catatan tanpa tag.'
            },
            keepEmptyTagsProperty: {
                name: 'Pertahankan properti tag setelah menghapus tag terakhir',
                desc: 'Pertahankan properti tag frontmatter saat semua tag dihapus. Saat dinonaktifkan, properti tag dihapus dari frontmatter.'
            },
            hiddenTags: {
                name: 'Sembunyikan tag (profil vault)',
                desc: 'Daftar pola tag yang dipisahkan koma. Pola nama: tag* (dimulai dengan), *tag (diakhiri dengan). Pola jalur: arsip (tag dan turunan), arsip/* (hanya turunan), proyek/*/draf (wildcard tengah).',
                placeholder: 'arsip*, *draf, proyek/*/lama'
            },
            enableFolderNotes: {
                name: 'Aktifkan catatan folder',
                desc: 'Saat diaktifkan, folder dengan catatan terkait ditampilkan sebagai tautan yang dapat diklik.'
            },
            folderNoteType: {
                name: 'Jenis catatan folder default',
                desc: 'Jenis catatan folder yang dibuat dari menu konteks.',
                options: {
                    ask: 'Tanyakan saat membuat',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'Nama catatan folder',
                desc: 'Nama catatan folder tanpa ekstensi. Biarkan kosong untuk menggunakan nama yang sama dengan folder.',
                placeholder: 'index'
            },
            folderNoteProperties: {
                name: 'Properti catatan folder',
                desc: 'Frontmatter YAML ditambahkan ke catatan folder baru. Penanda --- ditambahkan secara otomatis.',
                placeholder: 'theme: dark\nfoldernote: true'
            },
            hideFolderNoteInList: {
                name: 'Sembunyikan catatan folder di daftar',
                desc: 'Sembunyikan catatan folder dari muncul di daftar catatan folder.'
            },
            pinCreatedFolderNote: {
                name: 'Sematkan catatan folder yang dibuat',
                desc: 'Secara otomatis sematkan catatan folder saat dibuat dari menu konteks.'
            },
            confirmBeforeDelete: {
                name: 'Konfirmasi sebelum menghapus',
                desc: 'Tampilkan dialog konfirmasi saat menghapus catatan atau folder'
            },
            interceptTagClicks: {
                name: 'Navigasi ke tag saat diklik',
                desc: 'Saat mengklik tag di catatan, navigasi ke tag tersebut di Notebook Navigator alih-alih memicu pencarian Obsidian.'
            },
            metadataCleanup: {
                name: 'Bersihkan metadata',
                desc: 'Menghapus metadata yatim yang ditinggalkan saat file, folder, atau tag dihapus, dipindahkan, atau diganti nama di luar Obsidian. Ini hanya mempengaruhi file pengaturan Notebook Navigator.',
                buttonText: 'Bersihkan metadata',
                error: 'Pembersihan pengaturan gagal',
                loading: 'Memeriksa metadata...',
                statusClean: 'Tidak ada metadata untuk dibersihkan',
                statusCounts: 'Item yatim: {folders} folder, {tags} tag, {files} file, {pinned} pin, {separators} pemisah'
            },
            rebuildCache: {
                name: 'Bangun ulang cache',
                desc: 'Gunakan ini jika Anda mengalami tag yang hilang, pratinjau yang salah, atau gambar unggulan yang hilang. Ini dapat terjadi setelah konflik sinkronisasi atau penutupan yang tidak terduga.',
                buttonText: 'Bangun ulang cache',
                success: 'Cache dibangun ulang',
                error: 'Gagal membangun ulang cache',
                indexingTitle: 'Mengindeks vault...',
                progress: 'Memperbarui cache Notebook Navigator.'
            },
            hotkeys: {
                intro: 'Edit <folder plugin>/notebook-navigator/data.json untuk menyesuaikan pintasan keyboard Notebook Navigator. Buka file dan temukan bagian "keyboardShortcuts". Setiap entri menggunakan struktur ini:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Shift',
                    '"Ctrl" = Control (lebih baik "Mod" untuk lintas platform)'
                ],
                guidance:
                    'Tambahkan beberapa pemetaan untuk mendukung tombol alternatif, seperti binding ArrowUp dan K yang ditunjukkan di atas. Kombinasikan modifier dalam satu entri dengan mencantumkan setiap nilai, misalnya "modifiers": ["Mod", "Shift"]. Urutan keyboard seperti "gg" atau "dd" tidak didukung. Muat ulang Obsidian setelah mengedit file.'
            },
            externalIcons: {
                downloadButton: 'Unduh',
                downloadingLabel: 'Mengunduh...',
                removeButton: 'Hapus',
                statusInstalled: 'Diunduh (versi {version})',
                statusNotInstalled: 'Belum diunduh',
                versionUnknown: 'tidak diketahui',
                downloadFailed: 'Gagal mengunduh {name}. Periksa koneksi Anda dan coba lagi.',
                removeFailed: 'Gagal menghapus {name}.',
                infoNote:
                    'Paket ikon yang diunduh menyinkronkan status instalasi di seluruh perangkat. Paket ikon tetap di database lokal di setiap perangkat; sinkronisasi hanya melacak apakah akan mengunduh atau menghapusnya. Paket ikon diunduh dari repositori Notebook Navigator (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterDates: {
                name: 'Gunakan metadata frontmatter',
                desc: 'Gunakan frontmatter untuk nama catatan, timestamp, ikon, dan warna'
            },
            frontmatterIconField: {
                name: 'Field ikon',
                desc: 'Field frontmatter untuk ikon file. Biarkan kosong untuk menggunakan ikon yang disimpan di pengaturan.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'Field warna',
                desc: 'Field frontmatter untuk warna file. Biarkan kosong untuk menggunakan warna yang disimpan di pengaturan.',
                placeholder: 'color'
            },
            frontmatterSaveMetadata: {
                name: 'Simpan ikon dan warna ke frontmatter',
                desc: 'Secara otomatis tulis ikon dan warna file ke frontmatter menggunakan field yang dikonfigurasi di atas.'
            },
            frontmatterMigration: {
                name: 'Migrasi ikon dan warna dari pengaturan',
                desc: 'Disimpan di pengaturan: {icons} ikon, {colors} warna.',
                button: 'Migrasi',
                buttonWorking: 'Memigrasi...',
                noticeNone: 'Tidak ada ikon atau warna file yang disimpan di pengaturan.',
                noticeDone: 'Memigrasi {migratedIcons}/{icons} ikon, {migratedColors}/{colors} warna.',
                noticeFailures: 'Entri gagal: {failures}.',
                noticeError: 'Migrasi gagal. Periksa konsol untuk detail.'
            },
            frontmatterNameField: {
                name: 'Field-field nama',
                desc: 'Daftar field frontmatter dipisahkan koma. Nilai tidak kosong pertama digunakan. Kembali ke nama file.',
                placeholder: 'judul, nama'
            },
            frontmatterCreatedField: {
                name: 'Field timestamp dibuat',
                desc: 'Nama field frontmatter untuk timestamp dibuat. Biarkan kosong untuk hanya menggunakan tanggal sistem file.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'Field timestamp dimodifikasi',
                desc: 'Nama field frontmatter untuk timestamp dimodifikasi. Biarkan kosong untuk hanya menggunakan tanggal sistem file.',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'Format timestamp',
                desc: 'Format yang digunakan untuk mengurai timestamp di frontmatter. Biarkan kosong untuk menggunakan format ISO 8601',
                helpTooltip: 'Lihat dokumentasi format date-fns',
                help: "Format umum:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'Dukung pengembangan',
                desc: 'Jika Anda menyukai Notebook Navigator, silakan pertimbangkan untuk mendukung pengembangan berkelanjutannya.',
                buttonText: '❤️ Sponsor',
                coffeeButton: '☕️ Traktir saya kopi'
            },
            updateCheckOnStart: {
                name: 'Periksa versi baru saat mulai',
                desc: 'Memeriksa rilis plugin baru saat startup dan menampilkan notifikasi saat pembaruan tersedia. Setiap versi diumumkan hanya sekali, dan pemeriksaan terjadi paling banyak sekali sehari.',
                status: 'Versi baru tersedia: {version}'
            },
            whatsNew: {
                name: 'Apa yang baru di Notebook Navigator {version}',
                desc: 'Lihat pembaruan dan peningkatan terbaru',
                buttonText: 'Lihat pembaruan terbaru'
            },
            masteringVideo: {
                name: 'Menguasai Notebook Navigator (video)',
                desc: 'Video ini membahas semua yang Anda butuhkan untuk produktif di Notebook Navigator, termasuk pintasan keyboard, pencarian, tag, dan kustomisasi lanjutan.'
            },
            cacheStatistics: {
                localCache: 'Cache lokal',
                items: 'item',
                withTags: 'dengan tag',
                withPreviewText: 'dengan teks pratinjau',
                withFeatureImage: 'dengan gambar unggulan',
                withMetadata: 'dengan metadata'
            },
            metadataInfo: {
                successfullyParsed: 'Berhasil diurai',
                itemsWithName: 'item dengan nama',
                withCreatedDate: 'dengan tanggal dibuat',
                withModifiedDate: 'dengan tanggal dimodifikasi',
                withIcon: 'dengan ikon',
                withColor: 'dengan warna',
                failedToParse: 'Gagal mengurai',
                createdDates: 'tanggal dibuat',
                modifiedDates: 'tanggal dimodifikasi',
                checkTimestampFormat: 'Periksa format timestamp Anda.',
                exportFailed: 'Ekspor kesalahan'
            }
        }
    },
    whatsNew: {
        title: 'Apa yang baru di Notebook Navigator',
        supportMessage: 'Jika Anda merasa Notebook Navigator membantu, silakan pertimbangkan untuk mendukung pengembangannya.',
        supportButton: 'Traktir saya kopi',
        thanksButton: 'Terima kasih!'
    }
};
