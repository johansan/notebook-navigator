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
 * Indonesian language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_ID = {
    // Common UI elements
    common: {
        cancel: 'Batal',
        delete: 'Hapus',
        clear: 'Bersihkan',
        remove: 'Buang',
        restoreDefault: 'Pulihkan default', // Button text for restoring values to defaults (English: Restore default)
        submit: 'Kirim',
        save: 'Simpan', // Button text for saving settings and dialogs (English: Save)
        configure: 'Konfigurasi', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'Mode terang', // Label for light theme mode (English: Light mode)
        darkMode: 'Mode gelap', // Label for dark theme mode (English: Dark mode)
        noSelection: 'Tidak ada pilihan',
        untagged: 'Tanpa tag',
        featureImageAlt: 'Gambar unggulan',
        unknownError: 'Kesalahan tidak diketahui',
        clipboardWriteError: 'Tidak dapat menulis ke clipboard',
        updateBannerTitle: 'Pembaruan Notebook Navigator tersedia',
        updateBannerInstruction: 'Perbarui di Pengaturan -> Plugin komunitas',
        previous: 'Sebelumnya', // Generic aria label for previous navigation (English: Previous)
        next: 'Berikutnya' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Pilih folder atau tag untuk melihat catatan',
        emptyStateNoNotes: 'Tidak ada catatan',
        pinnedSection: 'Disematkan',
        notesSection: 'Catatan',
        filesSection: 'File',
        hiddenItemAriaLabel: '{name} (tersembunyi)',
        collapseGroup: 'Ciutkan grup',
        expandGroup: 'Bentangkan grup',
        manualSortTitle: 'Urutan manual: {property}',
        manualSortHint: 'Seret untuk mengatur ulang. Urutan disimpan sebagai nilai indeks numerik di properti "{property}".',
        manualSortNonMarkdownHint: 'File non-Markdown ditampilkan di bawah dan tidak dapat diatur ulang.',
        unsortedSection: 'Belum diurutkan',
        manualSortDone: 'Selesai',
        manualSortMultipleWriteFailure: '{count} file gagal; pertama: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Tanpa tag',
        tags: 'Tag'
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Pintasan',
        recentFilesHeader: 'File terbaru', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Properti',
        reorderRootFoldersTitle: 'Atur ulang navigasi',
        reorderRootFoldersHint: 'Gunakan panah atau seret untuk mengatur ulang',
        vaultRootLabel: 'Vault',
        resetRootToAlpha: 'Atur ulang ke urutan abjad',
        resetRootToFrequency: 'Atur ulang ke urutan frekuensi',
        pinShortcuts: 'Sematkan pintasan',
        pinShortcutsAndRecentFiles: 'Sematkan pintasan dan file terbaru',
        unpinShortcuts: 'Lepas sematan pintasan',
        unpinShortcutsAndRecentFiles: 'Lepas sematan pintasan dan file terbaru',
        profileMenuAria: 'Ubah profil vault'
    },

    navigationCalendar: {
        ariaLabel: 'Kalender',
        dailyNotesNotEnabled: 'Plugin catatan harian tidak diaktifkan.',
        noteHiddenByProfile: 'Catatan kalender disembunyikan oleh profil vault saat ini.',
        createDailyNote: {
            title: 'Catatan harian baru',
            message: 'File {filename} tidak ada. Apakah Anda ingin membuatnya?',
            confirmButton: 'Buat'
        },
        helpModal: {
            title: 'Pintasan kalender',
            items: [
                'Klik hari mana pun untuk membuka atau membuat catatan harian. Minggu, bulan, kuartal, dan tahun berfungsi dengan cara yang sama.',
                'Titik terisi di bawah hari berarti memiliki catatan. Titik kosong berarti memiliki tugas yang belum selesai.',
                'Jika catatan memiliki gambar fitur, gambar tersebut muncul sebagai latar belakang hari.'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+klik pada tanggal untuk memfilter berdasarkan tanggal tersebut di daftar file.',
            dateFilterOptionAlt: '`Option/Alt`+klik pada tanggal untuk memfilter berdasarkan tanggal tersebut di daftar file.'
        }
    },

    dailyNotes: {
        templateReadFailed: 'Gagal membaca template catatan harian.',
        createFailed: 'Tidak dapat membuat catatan harian.'
    },

    shortcuts: {
        folderExists: 'Folder sudah ada di pintasan',
        noteExists: 'Catatan sudah ada di pintasan',
        tagExists: 'Tag sudah ada di pintasan',
        propertyExists: 'Properti sudah ada di pintasan',
        invalidProperty: 'Pintasan properti tidak valid',
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
        showCalendar: 'Tampilkan kalender',
        hideCalendar: 'Sembunyikan kalender',
        newFolder: 'Folder baru',
        newNote: 'Catatan baru',
        mobileBackToNavigation: 'Kembali ke navigasi',
        changeChildSortOrder: 'Ubah urutan',
        changeSortAndGroup: 'Ubah urutan dan grup',
        resetViewToDefaults: 'Atur ulang tampilan ke default',
        manualSort: 'Urutan manual',
        editSortOrder: 'Edit urutan...',
        removeSortProperty: 'Hapus properti urutan',
        descendants: 'turunan',
        subfolders: 'subfolder',
        subtags: 'subtag',
        childValues: 'nilai anak',
        applySortAndGroupToDescendants: (target: string) => `Terapkan urutan dan grup ke ${target}`,
        applyAppearanceToDescendants: (target: string) => `Terapkan tampilan ke ${target}`,
        showFolders: 'Tampilkan navigasi',
        reorderRootFolders: 'Atur ulang navigasi',
        finishRootFolderReorder: 'Selesai',
        showExcludedItems: 'Tampilkan folder, tag, dan catatan tersembunyi',
        hideExcludedItems: 'Sembunyikan folder, tag, dan catatan tersembunyi',
        showDualPane: 'Tampilkan panel ganda',
        showSinglePane: 'Tampilkan panel tunggal',
        dualPaneAutoFallbackNotice:
            'Panel ganda tidak tersedia saat bilah samping terlalu sempit. Untuk mengubahnya, atur "Saat bilah samping terlalu sempit" ke "Jangan lakukan apa pun" di Pengaturan > Tampilan & perilaku.',
        changeAppearance: 'Ubah tampilan',
        showNotesFromSubfolders: 'Tampilkan catatan dari subfolder',
        showFilesFromSubfolders: 'Tampilkan file dari subfolder',
        showNotesFromDescendants: 'Tampilkan catatan dari turunan',
        showFilesFromDescendants: 'Tampilkan file dari turunan',
        search: 'Cari'
    },
    // Search input
    searchInput: {
        placeholder: 'Cari...',
        placeholderVault: 'Cari vault...',
        placeholderOmnisearch: 'Omnisearch...',
        clearSearch: 'Bersihkan pencarian',
        switchToFilterSearch: 'Beralih ke pencarian filter',
        switchToOmnisearch: 'Beralih ke Omnisearch',
        saveSearchShortcut: 'Simpan pintasan pencarian',
        removeSearchShortcut: 'Hapus pintasan pencarian',
        shortcutModalTitle: 'Simpan pintasan pencarian',
        shortcutNamePlaceholder: 'Masukkan nama pintasan',
        shortcutStartIn: 'Selalu mulai di: {path}',
        searchHelp: 'Sintaks pencarian',
        searchHelpTitle: 'Sintaks pencarian',
        searchHelpModal: {
            intro: 'Gabungkan nama file, properti, tag, tanggal, dan filter dalam satu kueri (contoh: `meeting .status=active #work @thisweek`). Instal plugin Omnisearch untuk menggunakan pencarian teks lengkap.',
            introSwitching:
                'Beralih antara pencarian filter dan Omnisearch menggunakan tombol panah atas/bawah atau dengan mengklik ikon pencarian.',
            sections: {
                fileNames: {
                    title: 'Nama file',
                    items: [
                        '`word` Temukan catatan dengan "word" di nama file.',
                        '`word1 word2` Setiap kata harus cocok dengan nama file.',
                        '`-word` Kecualikan catatan dengan "word" di nama file.'
                    ]
                },
                tags: {
                    title: 'Tag',
                    items: [
                        '`#tag` Sertakan catatan dengan tag (juga cocok dengan tag bersarang seperti `#tag/subtag`).',
                        '`#` Sertakan hanya catatan dengan tag.',
                        '`-#tag` Kecualikan catatan dengan tag.',
                        '`-#` Sertakan hanya catatan tanpa tag.',
                        '`#tag1 #tag2` Cocokkan kedua tag (AND implisit).',
                        '`#tag1 AND #tag2` Cocokkan kedua tag (AND eksplisit).',
                        '`#tag1 OR #tag2` Cocokkan salah satu tag.',
                        '`#a OR #b AND #c` AND memiliki prioritas lebih tinggi: cocok dengan `#a`, atau keduanya `#b` dan `#c`.',
                        'Cmd/Ctrl+Klik tag untuk menambahkan dengan AND. Cmd/Ctrl+Shift+Klik untuk menambahkan dengan OR.'
                    ]
                },
                properties: {
                    title: 'Properti',
                    items: [
                        '`.key` Sertakan catatan dengan kunci properti.',
                        '`.key=value` Sertakan catatan yang nilai propertinya mengandung `value`.',
                        '`."Reading Status"` Sertakan catatan dengan kunci properti yang mengandung spasi.',
                        '`."Reading Status"="In Progress"` Kunci dan nilai yang mengandung spasi harus diapit tanda kutip ganda.',
                        '`-.key` Kecualikan catatan dengan kunci properti.',
                        '`-.key=value` Kecualikan catatan yang nilai propertinya mengandung `value`.',
                        'Cmd/Ctrl+Klik properti untuk menambahkan dengan AND. Cmd/Ctrl+Shift+Klik untuk menambahkan dengan OR.'
                    ]
                },
                tasks: {
                    title: 'Filter',
                    items: [
                        '`has:task` Sertakan catatan dengan tugas yang belum selesai.',
                        '`-has:task` Kecualikan catatan dengan tugas yang belum selesai.',
                        '`folder:meetings` Sertakan catatan di mana nama folder mengandung `meetings`.',
                        '`folder:/work/meetings` Sertakan catatan hanya di `work/meetings` (tidak termasuk subfolder).',
                        '`folder:/` Sertakan catatan hanya di root vault.',
                        '`-folder:archive` Kecualikan catatan di mana nama folder mengandung `archive`.',
                        '`-folder:/archive` Kecualikan catatan hanya di `archive` (tidak termasuk subfolder).',
                        '`ext:md` Sertakan catatan dengan ekstensi `md` (`ext:.md` juga didukung).',
                        '`-ext:pdf` Kecualikan catatan dengan ekstensi `pdf`.',
                        'Gabungkan dengan tag, nama, dan tanggal (contoh: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'Perilaku AND/OR',
                    items: [
                        '`AND` dan `OR` adalah operator hanya dalam kueri yang khusus berisi tag dan properti.',
                        'Kueri khusus tag dan properti hanya berisi filter tag dan properti: `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`.',
                        'Jika kueri menyertakan nama, tanggal (`@...`), filter tugas (`has:task`), filter folder (`folder:...`), atau filter ekstensi (`ext:...`), `AND` dan `OR` dicocokkan sebagai kata.',
                        'Contoh kueri operator: `#work OR .status=started`.',
                        'Contoh kueri campuran: `#work OR ext:md` (`OR` dicocokkan dalam nama file).'
                    ]
                },
                dates: {
                    title: 'Tanggal',
                    items: [
                        '`@today` Temukan catatan hari ini menggunakan field tanggal default.',
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` Rentang tanggal relatif.',
                        '`@2026-02-07` Temukan hari tertentu (juga mendukung `@20260207`).',
                        '`@2026` Temukan tahun kalender.',
                        '`@2026-02` atau `@202602` Temukan bulan kalender.',
                        '`@2026-W05` atau `@2026W05` Temukan minggu ISO.',
                        '`@2026-Q2` atau `@2026Q2` Temukan kuartal kalender.',
                        '`@13/02/2026` Format numerik dengan pemisah (`@07022026` mengikuti lokal Anda saat ambigu).',
                        '`@2026-02-01..2026-02-07` Temukan rentang hari inklusif (ujung terbuka didukung).',
                        '`@c:...` atau `@m:...` Targetkan tanggal pembuatan atau modifikasi.',
                        '`-@...` Kecualikan kecocokan tanggal.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'Pencarian teks lengkap di seluruh vault, difilter berdasarkan folder saat ini atau tag yang dipilih.',
                        'Bisa lambat dengan kurang dari 3 karakter di vault besar.',
                        'Tidak dapat mencari jalur dengan karakter non-ASCII atau mencari subjalur dengan benar.',
                        'Mengembalikan hasil terbatas sebelum filter folder, sehingga file yang relevan mungkin tidak muncul jika banyak kecocokan ada di tempat lain.',
                        'Pratinjau catatan menampilkan kutipan Omnisearch alih-alih teks pratinjau default.'
                    ]
                }
            }
        }
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
            openInDefaultApp: 'Buka di aplikasi bawaan',
            renameNote: 'Ubah nama catatan',
            renameFile: 'Ubah nama file',
            deleteNote: 'Hapus catatan',
            deleteFile: 'Hapus file',
            setCalendarHighlight: 'Atur sorotan',
            removeCalendarHighlight: 'Hapus sorotan',
            deleteMultipleNotes: 'Hapus {count} catatan',
            deleteMultipleFiles: 'Hapus {count} file',
            moveNoteToFolder: 'Pindahkan catatan ke...',
            moveFileToFolder: 'Pindahkan file ke...',
            moveMultipleNotesToFolder: 'Pindahkan {count} catatan ke...',
            moveMultipleFilesToFolder: 'Pindahkan {count} file ke...',
            mergeNotes: 'Gabungkan {count} catatan...',
            mergeNotesInGroup: 'Gabungkan catatan dalam grup...',
            setManualSortGroupHeader: 'Atur header grup',
            changeManualSortGroupHeader: 'Ubah header grup',
            manualSortGroupHeader: {
                title: 'Header grup',
                copyStyle: 'Salin gaya header',
                pasteStyle: 'Tempel gaya header',
                remove: 'Hapus header grup'
            },
            addTag: 'Tambah tag',
            addPropertyKey: 'Atur properti',
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
            createFolderNote: 'Buat catatan folder',
            detachFolderNote: 'Lepaskan catatan folder',
            deleteFolderNote: 'Hapus catatan folder',
            changeIcon: 'Ubah ikon',
            changeColor: 'Ubah warna',
            changeBackground: 'Ubah latar belakang',
            excludeFolder: 'Sembunyikan folder',
            unhideFolder: 'Tampilkan folder',
            excludeFromDescendants: 'Sembunyikan dari folder induk',
            includeInDescendants: 'Tampilkan di folder induk',
            hiddenFromParentsIndicator: 'Disembunyikan dari daftar folder induk',
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
        property: {
            addKey: 'Konfigurasi kunci properti',
            renameKey: 'Ubah nama properti',
            deleteKey: 'Hapus properti'
        },
        navigation: {
            addSeparator: 'Tambah pemisah',
            removeSeparator: 'Hapus pemisah'
        },
        copyPath: {
            title: 'Salin path',
            asObsidianUrl: 'sebagai URL Obsidian',
            fromVaultFolder: 'dari folder vault',
            fromSystemRoot: 'dari root sistem'
        },
        style: {
            title: 'Gaya',
            copy: 'Salin gaya',
            paste: 'Tempel gaya',
            removeIcon: 'Hapus ikon',
            removeColor: 'Hapus warna',
            removeBackground: 'Hapus latar belakang',
            clear: 'Bersihkan gaya'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        appearance: 'Tampilan',
        sortBy: 'Urutkan berdasarkan',
        standardPreset: 'Standar',
        compactPreset: 'Kompak',
        defaultSuffix: '(default)',
        defaultLabel: 'Bawaan',
        titleRows: 'Baris judul',
        previewRows: 'Baris pratinjau',
        groupBy: 'Kelompokkan berdasarkan',
        titleRowOption: (rows: number) => `${rows} baris judul`,
        previewRowOption: (rows: number) => `${rows} baris pratinjau`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Terapkan',
            applySortAndGroupTitle: (target: string) => `Terapkan urutan dan grup ke ${target}?`,
            applyAppearanceTitle: (target: string) => `Terapkan tampilan ke ${target}?`,
            affectedCountMessage: (count: number) => `Penimpaan yang ada dan akan berubah: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'Gunakan urutan manual?',
            propertySortMessage: (property: string, count: number) =>
                `Ini akan mengalihkan tampilan saat ini ke urutan manual menggunakan "${property}". Mengedit urutan akan menulis nilai indeks numerik ke properti tersebut di ${count} catatan sesuai kebutuhan.`,
            propertySortConfirmButton: 'Gunakan urutan manual',
            removePropertyTitle: 'Hapus properti urutan?',
            removePropertyMessage: (property: string, count: number) =>
                `Ini akan menghapus "${property}" dari ${count} catatan di daftar saat ini. Urutan manual akan dihapus untuk catatan tersebut.`,
            removePropertyConfirmButton: 'Hapus properti',
            compactTitle: 'Padatkan nilai indeks?',
            compactMessage: (count: number) =>
                `Pengaturan ulang ini memerlukan lebih banyak ruang numerik. ${count} catatan akan menerima nilai indeks baru.`,
            compactConfirmButton: 'Padatkan nilai indeks'
        },
        manualSortGroupHeader: {
            title: 'Atur header grup',
            titleLabel: 'Judul',
            placeholder: 'Header grup',
            icon: 'Ikon',
            color: 'Warna',
            wordCount: 'Tampilkan jumlah kata',
            wordCountTarget: 'Target jumlah kata',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'Saat bidang ini kosong, target grup menggunakan properti target yang diatur di Pengaturan > Catatan > Jumlah kata dan karakter. Timpa dengan menetapkan nilai target untuk grup ini.',
            description: 'Sesuaikan header grup untuk catatan ini. Biarkan judul kosong untuk menghapus header.'
        },
        mergeNotes: {
            title: 'Gabungkan catatan',
            summary: 'Buat satu catatan dari {count} catatan di {folder}.',
            frontmatterRule: 'Frontmatter dari catatan pertama dipertahankan. Frontmatter dari catatan lain dihapus.',
            crossFolderWarning:
                'Catatan sumber berada di folder yang berbeda. Tautan relatif dan embed mungkin berhenti berfungsi di catatan gabungan.',
            outputName: 'Nama output',
            outputNameDesc: 'Catatan gabungan dibuat di folder yang ditampilkan di atas.',
            outputNamePlaceholder: 'Catatan gabungan',
            separator: 'Pemisah',
            separatorDesc: 'Disisipkan di antara catatan.',
            separatorOptions: {
                none: 'Tidak ada',
                blankLine: 'Baris kosong',
                horizontalRule: 'Garis horizontal',
                heading: 'Judul dengan judul catatan'
            },
            moveSourcesToTrash: 'Pindahkan catatan sumber ke sampah setelah digabung',
            mergeButton: 'Gabungkan'
        },
        navRainbowSection: {
            title: (section: string) => `Warna pelangi: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'Cari ikon...',
            recentlyUsedHeader: 'Baru digunakan',
            emptyStateSearch: 'Mulai mengetik untuk mencari ikon',
            emptyStateNoResults: 'Ikon tidak ditemukan',
            showingResultsInfo: 'Menampilkan 50 dari {count} hasil. Ketik lebih lanjut untuk mempersempit.',
            emojiInstructions: 'Ketik atau tempel emoji untuk menggunakannya sebagai ikon',
            removeIcon: 'Hapus ikon',
            removeFromRecents: 'Hapus dari ikon terbaru',
            allTabLabel: 'Semua'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Tambah aturan'
        },
        interfaceIcons: {
            title: 'Ikon antarmuka',
            fileItemsSection: 'Item file',
            items: {
                'nav-shortcuts': 'Pintasan',
                'nav-recent-files': 'File terbaru',
                'nav-expand-all': 'Perluas semua',
                'nav-collapse-all': 'Tutup semua',
                'nav-calendar': 'Kalender',
                'nav-tree-expand': 'Panah pohon: perluas',
                'nav-tree-collapse': 'Panah pohon: tutup',
                'nav-hidden-items': 'Item tersembunyi',
                'nav-root-reorder': 'Atur ulang folder akar',
                'nav-new-folder': 'Folder baru',
                'nav-show-single-pane': 'Tampilkan panel tunggal',
                'nav-show-dual-pane': 'Tampilkan panel ganda',
                'nav-profile-chevron': 'Panah menu profil',
                'list-search': 'Cari',
                'list-reveal-file': 'Tampilkan file',
                'list-descendants': 'Catatan dari subfolder',
                'list-sort-ascending': 'Urutan: menaik',
                'list-sort-descending': 'Urutan: menurun',
                'list-sort-modified': 'Urutkan berdasarkan tanggal edit',
                'list-sort-created': 'Urutkan berdasarkan tanggal dibuat',
                'list-sort-title': 'Urutkan berdasarkan judul',
                'list-sort-filename': 'Urutkan berdasarkan nama file',
                'list-sort-property': 'Urutkan berdasarkan properti',
                'list-appearance': 'Ubah tampilan',
                'list-new-note': 'Catatan baru',
                'list-pinned': 'Catatan yang disematkan',
                'nav-folder-open': 'Folder terbuka',
                'nav-folder-closed': 'Folder tertutup',
                'nav-tags': 'Tag',
                'nav-tag': 'Tag',
                'nav-properties': 'Properti',
                'nav-property': 'Properti',
                'nav-property-value': 'Nilai',
                'file-unfinished-task': 'Tugas belum selesai',
                'file-word-count': 'Jumlah kata',
                'file-character-count': 'Jumlah karakter'
            }
        },
        colorPicker: {
            currentColor: 'Saat ini',
            newColor: 'Baru',
            paletteDefault: 'Bawaan',
            paletteCustom: 'Kustom',
            copyColors: 'Salin warna',
            colorsCopied: 'Warna disalin ke clipboard',
            pasteColors: 'Tempel warna',
            pasteClipboardError: 'Tidak dapat membaca clipboard',
            pasteInvalidFormat: 'Diharapkan nilai warna hex',
            colorsPasted: 'Warna berhasil ditempel',
            resetUserColors: 'Bersihkan warna kustom',
            clearCustomColorsConfirm: 'Bersihkan semua warna kustom?',
            userColorSlot: 'Warna {slot}',
            recentColors: 'Warna terbaru',
            clearRecentColors: 'Bersihkan warna terbaru',
            removeRecentColor: 'Hapus warna',
            apply: 'Terapkan',
            pickerLabel: 'Pemilih',
            hexLabel: 'HEX',
            hexInputLabel: 'Nilai warna heksadesimal',
            saturationValueArea: 'Saturasi dan kecerahan',
            hueSlider: 'Rona',
            alphaSlider: 'Transparansi'
        },
        appearance: {
            tabIcon: 'Ikon',
            tabColor: 'Warna',
            tabBackground: 'Latar belakang',
            resetIcon: 'Hapus ikon',
            resetColor: 'Hapus warna',
            resetBackground: 'Hapus latar belakang',
            clear: 'Bersihkan gaya',
            apply: 'Terapkan'
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
            renameBatchNotFinalized:
                'Diganti nama {renamed}/{total}. Tidak diperbarui: {notUpdated}. Metadata dan pintasan tidak diperbarui.',
            invalidTagName: 'Masukkan nama tag yang valid.',
            descendantRenameError: 'Tidak dapat memindahkan tag ke dirinya sendiri atau turunannya.',
            confirmDelete: 'Hapus tag',
            deleteBatchNotFinalized:
                'Dihapus dari {removed}/{total}. Tidak diperbarui: {notUpdated}. Metadata dan pintasan tidak diperbarui.',
            checkConsoleForDetails: 'Periksa konsol untuk detail.',
            file: 'file',
            files: 'file',
            inlineParsingWarning: {
                title: 'Kompatibilitas tag inline',
                message: '{tag} mengandung karakter yang tidak dapat diurai Obsidian dalam tag inline. Tag Frontmatter tidak terpengaruh.',
                confirm: 'Tetap gunakan'
            }
        },
        propertyOperation: {
            renameTitle: 'Ubah nama properti {property}',
            deleteTitle: 'Hapus properti {property}',
            newKeyPrompt: 'Nama properti baru',
            newKeyPlaceholder: 'Masukkan nama properti baru',
            renameWarning: 'Mengubah nama properti {property} akan memodifikasi {count} {files}.',
            renameConflictWarning:
                'Properti {newKey} sudah ada di {count} {files}. Mengubah nama {oldKey} akan menggantikan nilai {newKey} yang ada.',
            deleteWarning: 'Menghapus properti {property} akan memodifikasi {count} {files}.',
            confirmRename: 'Ubah nama properti',
            confirmDelete: 'Hapus properti',
            renameNoChanges: '{oldKey} → {newKey} (tidak ada perubahan)',
            renameSettingsUpdateFailed: 'Properti {oldKey} → {newKey} diubah namanya. Gagal memperbarui pengaturan.',
            deleteSingleSuccess: 'Properti {property} dihapus dari 1 catatan',
            deleteMultipleSuccess: 'Properti {property} dihapus dari {count} catatan',
            deleteSettingsUpdateFailed: 'Properti {property} dihapus. Gagal memperbarui pengaturan.',
            invalidKeyName: 'Masukkan nama properti yang valid.'
        },
        fileSystem: {
            newFolderTitle: 'Folder baru',
            renameFolderTitle: 'Ubah nama folder',
            renameFileTitle: 'Ubah nama file',
            deleteFolderTitle: "Hapus '{name}'?",
            deleteFileTitle: "Hapus '{name}'?",
            deleteFileAttachmentsTitle: 'Hapus lampiran file?',
            moveFileConflictTitle: 'Konflik pemindahan',
            folderNamePrompt: 'Masukkan nama folder:',
            hideInOtherVaultProfiles: 'Sembunyikan di profil vault lain',
            renamePrompt: 'Masukkan nama baru:',
            renameVaultTitle: 'Ubah nama tampilan vault',
            renameVaultPrompt: 'Masukkan nama tampilan kustom (kosongkan untuk menggunakan default):',
            deleteFolderConfirm: 'Anda yakin ingin menghapus folder ini dan semua isinya?',
            deleteFileConfirm: 'Anda yakin ingin menghapus file ini?',
            deleteFileAttachmentsDescriptionSingle: 'Lampiran ini tidak lagi digunakan di catatan manapun. Apakah Anda ingin menghapusnya?',
            deleteFileAttachmentsDescriptionMultiple:
                'Lampiran-lampiran ini tidak lagi digunakan di catatan manapun. Apakah Anda ingin menghapusnya?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Pohon file',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Galeri',
            moveFileConflictDescriptionSingle: 'Konflik file ditemukan di "{folder}".',
            moveFileConflictDescriptionMultiple: '{count} konflik file ditemukan di "{folder}".',
            moveFileConflictAffectedFiles: 'File yang terpengaruh',
            moveFileConflictItem: '"{name}" -> "{suggested}"{renameOnly}',
            moveFileConflictRenameOnly: '(ganti nama saja)',
            moveFileConflictRename: 'Ganti nama',
            moveFileConflictOverwrite: 'Timpa',
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
        calendarTemplate: {
            placeholder: 'Cari template...',
            instructions: {
                navigate: 'untuk navigasi',
                select: 'untuk memilih template',
                dismiss: 'untuk menutup'
            }
        },
        navigationBanner: {
            placeholder: 'Cari gambar...',
            svgMissingDimensions: 'Berkas SVG yang dipilih tidak menentukan lebar, tinggi, atau viewBox.',
            instructions: {
                navigate: 'untuk navigasi',
                select: 'untuk mengatur banner',
                dismiss: 'untuk menutup'
            }
        },
        tagSuggest: {
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
        propertySuggest: {
            placeholder: 'Pilih kunci properti...',
            navigatePlaceholder: 'Navigasi ke properti...',
            instructions: {
                navigate: 'untuk navigasi',
                select: 'untuk menambah properti',
                dismiss: 'untuk menutup'
            }
        },
        propertyKeyVisibility: {
            title: 'Visibilitas kunci properti',
            description:
                'Kontrol tempat nilai properti ditampilkan. Kolom-kolom sesuai dengan panel navigasi, panel daftar, dan menu konteks file. Gunakan baris bawah untuk mengalihkan semua baris dalam kolom.',
            searchPlaceholder: 'Cari kunci properti...',
            propertyColumnLabel: 'Properti',
            showInNavigation: 'Tampilkan di navigasi',
            showInList: 'Tampilkan di daftar',
            showInFileMenu: 'Tampilkan di menu file',
            toggleAllInNavigation: 'Alihkan semua di navigasi',
            toggleAllInList: 'Alihkan semua di daftar',
            toggleAllInFileMenu: 'Alihkan semua di menu file',
            applyButton: 'Terapkan',
            emptyState: 'Tidak ditemukan kunci properti.'
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
            closeButton: 'Mungkin nanti'
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
            deleteAttachments: 'Gagal menghapus lampiran: {error}',
            mergeNotes: 'Gagal menggabungkan catatan: {error}',
            mergeNotesOpenOutput:
                'Catatan gabungan dibuat sebagai {name}, tetapi tidak dapat dibuka: {error}. Catatan sumber tidak diubah.',
            mergeNotesOpenSkipped: 'Permintaan pembukaan file lain didahulukan.',
            mergeNotesTrashSources: 'Catatan gabungan dibuat. Gagal memindahkan {count} catatan sumber ke sampah.',
            duplicateNote: 'Gagal menduplikat catatan: {error}',
            duplicateFolder: 'Gagal menduplikat folder: {error}',
            openVersionHistory: 'Gagal membuka riwayat versi: {error}',
            versionHistoryNotFound: 'Perintah riwayat versi tidak ditemukan. Pastikan Obsidian Sync diaktifkan.',
            revealInExplorer: 'Gagal menampilkan file di explorer sistem: {error}',
            openInDefaultApp: 'Gagal membuka di aplikasi bawaan: {error}',
            openInDefaultAppNotAvailable: 'Buka di aplikasi bawaan tidak tersedia di platform ini',
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
            showFolder: 'Folder ditampilkan: {name}',
            folderExcludedFromDescendants: 'Disembunyikan dari daftar folder induk: {name}',
            folderIncludedInDescendants: 'Ditampilkan di daftar folder induk: {name}',
            mergeNotes: 'Menggabungkan {count} catatan menjadi {name}'
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
            mergeNotesRequireMultipleMarkdown: 'Pilih setidaknya dua catatan Markdown untuk digabungkan',
            tagOperationsNotAvailable: 'Operasi tag tidak tersedia',
            propertyOperationsNotAvailable: 'Operasi properti tidak tersedia',
            tagsRequireMarkdown: 'Tag hanya didukung pada catatan Markdown',
            propertiesRequireMarkdown: 'Properti hanya didukung pada catatan Markdown',
            propertySetOnNote: 'Properti diperbarui pada 1 catatan',
            propertySetOnNotes: 'Properti diperbarui pada {count} catatan',
            manualSortPropertyRemovedFromNote: 'Properti urutan dihapus dari 1 catatan',
            manualSortPropertyRemovedFromNotes: 'Properti urutan dihapus dari {count} catatan',
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
            untitled: 'Tanpa judul'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Tidak dapat memindahkan folder ke dirinya sendiri atau subfolder.',
            itemAlreadyExists: 'Item bernama "{name}" sudah ada di lokasi ini.',
            failedToMove: 'Gagal memindahkan: {error}',
            failedToAddTag: 'Gagal menambahkan tag "{tag}"',
            failedToSetProperty: 'Gagal memperbarui properti: {error}',
            failedToClearTags: 'Gagal menghapus tag',
            failedToMoveFolder: 'Gagal memindahkan folder "{name}"',
            failedToImportFiles: 'Gagal mengimpor: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} file sudah ada di tujuan',
            filesAlreadyHaveTag: '{count} file sudah memiliki tag ini atau yang lebih spesifik',
            filesAlreadyHaveProperty: '{count} file sudah memiliki properti ini',
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

    // Plugin commands
    commands: {
        open: 'Buka',
        toggleLeftSidebar: 'Alihkan bilah sisi kiri',
        openHomepage: 'Buka beranda',
        openDailyNote: 'Buka catatan harian',
        openWeeklyNote: 'Buka catatan mingguan',
        openMonthlyNote: 'Buka catatan bulanan',
        openQuarterlyNote: 'Buka catatan triwulanan',
        openYearlyNote: 'Buka catatan tahunan',
        revealFile: 'Tampilkan file',
        search: 'Cari',
        searchVaultRoot: 'Cari di seluruh vault',
        toggleDualPane: 'Alihkan tata letak panel ganda',
        toggleDualPaneOrientation: 'Alihkan orientasi panel ganda', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'Alihkan kalender',
        selectVaultProfile: 'Pilih profil vault',
        selectVaultProfile1: 'Pilih profil vault 1',
        selectVaultProfile2: 'Pilih profil vault 2',
        selectVaultProfile3: 'Pilih profil vault 3',
        deleteFile: 'Hapus file',
        createNewNote: 'Buat catatan baru',
        createNewNoteFromTemplate: 'Catatan baru dari template',
        moveFiles: 'Pindahkan file',
        mergeNotes: 'Gabungkan catatan', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'Pilih file berikutnya',
        selectPreviousFile: 'Pilih file sebelumnya',
        navigateBack: 'Navigasi mundur',
        navigateForward: 'Navigasi maju',
        convertToFolderNote: 'Konversi ke catatan folder',
        setAsFolderNote: 'Atur sebagai catatan folder',
        detachFolderNote: 'Lepaskan catatan folder',
        pinAllFolderNotes: 'Sematkan semua catatan folder',
        navigateToFolder: 'Navigasi ke folder',
        navigateToTag: 'Navigasi ke tag',
        navigateToProperty: 'Navigasi ke properti',
        addShortcut: 'Tambahkan ke pintasan',
        openShortcut: 'Buka pintasan {number}',
        toggleDescendants: 'Alihkan turunan',
        toggleHidden: 'Alihkan folder, tag, dan catatan tersembunyi',
        toggleTagSort: 'Alihkan urutan tag',
        toggleTagsBySelection: 'Alihkan tag berdasarkan pilihan',
        togglePropertiesBySelection: 'Alihkan properti berdasarkan pilihan',
        toggleCompactMode: 'Alihkan mode kompak', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Alihkan bagian yang disematkan',
        collapseExpand: 'Ciutkan / luaskan semua item',
        collapseExpandSelectedItem: 'Ciutkan / luaskan item yang dipilih',
        addTag: 'Tambah tag ke file yang dipilih',
        setProperty: 'Atur properti pada file yang dipilih', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'Hapus tag dari file yang dipilih',
        removeAllTags: 'Hapus semua tag dari file yang dipilih',
        openAllFiles: 'Buka semua file',
        rebuildCache: 'Bangun ulang cache',
        restoreDefaultSettings: 'Pulihkan pengaturan bawaan' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator',
        calendarViewName: 'Kalender',
        folderNoteSidebarViewName: 'Catatan folder',
        ribbonTooltip: 'Notebook Navigator',
        revealInNavigator: 'Tampilkan di Notebook Navigator',
        settingsUnavailableNotice:
            'Notebook Navigator tidak dapat membaca pengaturannya dan tidak dijalankan. Jika vault Anda sedang disinkronkan, mulai ulang Obsidian setelah sinkronisasi selesai. Untuk memulai ulang dengan pengaturan bawaan, jalankan perintah "Pulihkan pengaturan bawaan".', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsRecovery: {
            confirmTitle: 'Pulihkan pengaturan bawaan', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'Tindakan ini mengganti file pengaturan Notebook Navigator dengan pengaturan bawaan. Jika vault Anda masih disinkronkan, pengaturan bawaan yang dipulihkan dapat menimpa pengaturan yang tersimpan di perangkat Anda yang lain. File pengaturan yang dapat dibaca disalin terlebih dahulu ke cadangan bertanda waktu di folder plugin.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'Pulihkan bawaan', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: 'Pemulihan pengaturan tidak dapat diselesaikan. Preferensi lokal tetap dipertahankan.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'Pengaturan bawaan dipulihkan. Mulai ulang Obsidian untuk menyelesaikan.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Terakhir dimodifikasi pada',
        createdAt: 'Dibuat pada',
        file: 'file',
        files: 'file',
        folder: 'folder',
        folders: 'folder',
        wordCount: 'Jumlah kata'
    },

    fileCounts: {
        words: '{count} kata',
        characters: '{count} karakter',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'Ubah pengaturan default',
        metadataReport: {
            exportSuccess: 'Laporan metadata yang gagal diekspor ke: {filename}',
            exportFailed: 'Gagal mengekspor laporan metadata'
        },
        sections: {
            general: 'Umum',
            vaultFilters: 'Filter tampilan',
            appearanceBehavior: 'Tampilan & perilaku',
            navigationPane: 'Panel navigasi',
            calendar: 'Kalender',
            fileOperations: 'Operasi file',
            icons: 'Paket ikon',
            folders: 'Folder',
            folderNotes: 'Catatan folder',
            folderNoteFiles: 'File catatan folder',
            foldersAndFolderNotes: 'Folder & catatan folder',
            tagsAndProperties: 'Tag & properti',
            tags: 'Tag',
            listPane: 'Panel daftar',
            notes: 'Tampilan file',
            shortcutsAndRecentFiles: 'Pintasan & file terbaru',
            advanced: 'Lanjutan'
        },
        pageGroups: {
            configuration: 'Konfigurasi',
            navigationAndContent: 'Panel navigasi',
            notesAndLists: 'Panel daftar',
            calendarAndTools: 'Kalender dan alat'
        },
        pageDescriptions: {
            general: 'Catatan rilis, dukungan, profil vault, tipe file, dan kunci properti.',
            vaultFilters: 'Folder, tag, file, tag file, dan aturan properti tersembunyi.',
            appearanceBehavior: 'Perilaku, navigasi keyboard, tombol mouse, tampilan, dan pemformatan.',
            navigationPane: 'Tata letak, tampilan, jumlah catatan, perilaku menciutkan, dan warna pelangi.',
            shortcuts: 'Visibilitas pintasan, lencana, file terbaru, dan item yang disematkan.',
            calendar: 'Tampilan kalender, catatan tanggal, templat, lokal, dan penempatan bilah sisi.',
            fileOperations: 'Templat, konfirmasi hapus, lampiran, dan perilaku konflik saat memindahkan file.',
            foldersAndFolderNotes: 'Tampilan folder, catatan folder, templat catatan folder, dan perilaku catatan folder.',
            tagsProperties: 'Bagian tag dan properti, ikon, pengurutan, cakupan, dan pewarisan.',
            listPane: 'Pengurutan, pengelompokan, mode daftar, catatan yang disematkan, dan pratinjau gambar.',
            frontmatter: 'Bidang frontmatter untuk nama tampilan, stempel waktu, ikon, dan warna.',
            notes: 'Judul, teks pratinjau, gambar fitur, tag, properti, tanggal, jumlah kata, dan jumlah karakter.',
            iconPacks: 'Ikon antarmuka, ikon file, dan manajemen paket ikon.',
            advanced: 'Diagnostik, pembersihan metadata, impor/ekspor, dan reset.'
        },
        groups: {
            general: {
                vaultConfiguration: 'Penyiapan vault',
                templates: 'Templat',
                behavior: 'Perilaku',
                startup: 'Startup',
                keyboardNavigation: 'Navigasi keyboard',
                mouseButtons: 'Tombol mouse',
                view: 'Tampilan',
                icons: 'Ikon',
                desktopAppearance: 'Tampilan desktop',
                mobileAppearance: 'Tampilan seluler',
                formatting: 'Pemformatan'
            },
            advanced: {
                maintenance: 'Pemeliharaan',
                resetSettings: 'Atur ulang pengaturan'
            },
            navigation: {
                appearance: 'Tampilan',
                banner: 'Banner',
                collapseItems: 'Ciutkan item',
                dragAndDrop: 'Seret dan lepas',
                noteCounts: 'Jumlah catatan',
                rainbowColors: 'Warna pelangi',
                leftSidebar: 'Bilah sisi kiri',
                calendarIntegration: 'Integrasi kalender'
            },
            list: {
                display: 'Tampilan',
                groupHeaders: 'Header grup',
                propertySort: 'Urutan properti',
                manualSort: 'Urutan manual',
                pinnedNotes: 'Catatan yang disematkan',
                drawingPreviews: 'Pratinjau gambar'
            },
            notes: {
                frontmatter: 'Bidang frontmatter',
                tasks: 'Tugas',
                icon: 'Ikon',
                title: 'Judul',
                previewText: 'Teks pratinjau',
                featureImage: 'Gambar fitur',
                tags: 'Tag',
                properties: 'Properti',
                date: 'Tanggal',
                parentFolder: 'Folder induk',
                wordCount: 'Jumlah kata dan karakter'
            }
        },
        syncMode: {
            notSynced: '(tidak disinkronkan)',
            switchToSynced: 'Aktifkan sinkronisasi',
            switchToLocal: 'Nonaktifkan sinkronisasi'
        },
        items: {
            listPaneTitle: {
                name: 'Judul panel daftar',
                desc: 'Pilih di mana judul panel daftar ditampilkan.',
                options: {
                    header: 'Tampilkan di header',
                    list: 'Tampilkan di panel daftar',
                    hidden: 'Jangan tampilkan'
                }
            },
            sortNotesBy: {
                name: 'Urutan default',
                desc: 'Pilih urutan default untuk catatan.',
                options: {
                    'modified-desc': 'Tanggal diedit (terbaru di atas)',
                    'modified-asc': 'Tanggal diedit (terlama di atas)',
                    'created-desc': 'Tanggal dibuat (terbaru di atas)',
                    'created-asc': 'Tanggal dibuat (terlama di atas)',
                    'title-asc': 'Judul (A di atas)',
                    'title-desc': 'Judul (Z di atas)',
                    'filename-asc': 'Nama file (A di atas)',
                    'filename-desc': 'Nama file (Z di atas)'
                },
                directions: {
                    asc: 'Menaik',
                    desc: 'Menurun'
                },
                fields: {
                    modified: 'Tanggal diedit',
                    created: 'Tanggal dibuat',
                    title: 'Judul',
                    filename: 'Nama file',
                    property: 'Properti'
                }
            },
            propertySortKey: {
                name: 'Properti untuk diurutkan',
                desc: 'Properti frontmatter yang dipisahkan koma ditampilkan sebagai opsi urutan properti. Nilai array digabungkan menjadi satu string. Properti ini tidak diubah.',
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: 'Urutan sekunder',
                desc: 'Digunakan dengan urutan Properti ketika catatan memiliki nilai properti yang sama atau tidak memiliki nilai properti.',
                options: {
                    title: 'Judul',
                    filename: 'Nama file',
                    created: 'Tanggal dibuat',
                    modified: 'Tanggal diedit'
                }
            },
            propertySortInstructions: {
                intro: 'Setiap properti yang tercantum di atas muncul sebagai opsi urutan di menu urutan pada panel daftar. Memilih salah satu akan mengurutkan catatan berdasarkan nilai frontmatter-nya.'
            },
            manualSortPropertyKey: {
                name: 'Properti urutan manual',
                desc: 'Properti frontmatter yang digunakan untuk menyimpan nilai indeks numerik untuk urutan manual.'
            },
            manualSortGroupHeaderProperty: {
                name: 'Properti header grup',
                desc: 'Properti frontmatter yang digunakan untuk menyimpan header grup kustom.'
            },
            groupHeadersInstructions: {
                intro: 'Header grup kustom ditampilkan di atas catatan di panel daftar.',
                items: [
                    'Dari menu urutan di panel daftar, atur pengelompokan ke **Kustom**.',
                    'Klik kanan catatan dan pilih **Atur header grup** untuk menambahkan header di atasnya.'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'Penempatan catatan baru',
                desc: 'Pilih tempat catatan baru ditempatkan saat daftar saat ini menggunakan urutan manual.',
                options: {
                    top: 'Atas',
                    bottom: 'Bawah',
                    'below-selected-note': 'Di bawah catatan yang dipilih',
                    unsorted: 'Belum diurutkan'
                }
            },
            confirmBeforeManualSort: {
                name: 'Konfirmasi sebelum urutan manual',
                desc: 'Tampilkan peringatan sebelum menulis properti urutan manual ke catatan untuk pertama kalinya. Saat dinonaktifkan, catatan menerima properti tanpa peringatan.'
            },
            manualSortInstructions: {
                intro: 'Urutan manual menulis nilai indeks numerik ke properti frontmatter pada setiap catatan. Catatan tanpa indeks muncul di bawah Belum diurutkan.',
                items: [
                    'Aktifkan urutan manual dengan memilih **Urutan manual** dari menu urutan. Setelah itu, ada dua cara untuk mengatur ulang catatan.',
                    'Pilih **Edit urutan...** dari menu urutan untuk membuka tampilan pengaturan ulang. Seret catatan dengan mouse, atau dengan sentuhan di seluler. Di desktop, klik **Cmd/Ctrl** atau **Shift** memilih beberapa catatan, lalu menyeret salah satunya akan memindahkan seluruh grup.',
                    'Di panel daftar, pilih satu catatan atau pilih beberapa, lalu tekan **Cmd/Ctrl + Arrow Up/Down** untuk memindahkan pilihan ke atas atau ke bawah.'
                ]
            },
            revealFileOnListChanges: {
                name: 'Gulir ke file yang dipilih saat perubahan daftar',
                desc: 'Gulir ke file yang dipilih saat menyematkan catatan, menampilkan catatan turunan, mengubah tampilan folder, atau menjalankan operasi file.'
            },
            includeDescendantNotes: {
                name: 'Tampilkan catatan dari subfolder / turunan',
                desc: 'Sertakan catatan dari subfolder bersarang serta turunan tag dan properti saat melihat folder, tag, atau properti.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Sematkan catatan hanya di foldernya',
                desc: 'Catatan yang disematkan hanya tampil disematkan di folder miliknya sendiri. Berguna untuk catatan folder atau jika Anda memiliki banyak catatan yang disematkan. Tidak memengaruhi tampilan tag atau properti.'
            },
            separateNoteCounts: {
                name: 'Tampilkan jumlah catatan saat ini dan turunan secara terpisah',
                desc: 'Tampilkan jumlah catatan sebagai "saat ini ▾ turunan" untuk folder, tag, dan properti.'
            },
            groupNotes: {
                name: 'Pengelompokan default',
                desc: 'Kustom menampilkan header yang didefinisikan dalam frontmatter. Tanggal mengelompokkan catatan berdasarkan tanggal. Folder mengelompokkan catatan berdasarkan folder. Tampilan tag dan properti menggunakan grup tanggal saat folder dipilih.',
                options: {
                    custom: 'Kustom',
                    date: 'Tanggal',
                    folder: 'Folder'
                }
            },
            showSelectedNavigationPills: {
                name: 'Selalu tampilkan semua pil tag dan properti',
                desc: 'Saat dinonaktifkan, pil yang cocok dengan pilihan navigasi saat ini disembunyikan (misalnya, pil tag "resep" disembunyikan saat menelusuri tag "resep"). Aktifkan untuk menampilkan semua pil.'
            },
            stickyGroupHeaders: {
                name: 'Header grup tetap',
                desc: 'Jaga header bagian tanggal, folder, atau yang disematkan saat ini tetap terlihat saat menggulir.'
            },
            showFolderGroupPaths: {
                name: 'Tampilkan jalur subfolder',
                desc: 'Saat mengelompokkan berdasarkan folder di panel daftar, tampilkan jalur subfolder alih-alih hanya nama folder.'
            },
            showGroupHeaderItemCounts: {
                name: 'Tampilkan jumlah item',
                desc: 'Tampilkan jumlah item di setiap header grup panel daftar.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'Pengelompokan folder: file folder saat ini di bawah',
                desc: 'Saat pengelompokan default adalah Folder, pindahkan file yang langsung berada di folder yang dipilih ke bawah grup subfolder.'
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
                desc: 'Tampilkan ikon file dengan spasi rata kiri. Menonaktifkan menghapus ikon dan indentasi. Prioritas: ikon tugas belum selesai > ikon kustom > ikon folder > ikon nama file > ikon tipe file > ikon default.'
            },
            useFolderIcon: {
                name: 'Gunakan ikon folder',
                desc: 'Tampilkan ikon folder induk saat tidak ada ikon file kustom yang ditetapkan. Warna folder digunakan saat tidak ada warna file kustom yang ditetapkan.'
            },
            showFileIconUnfinishedTask: {
                name: 'Ikon tugas belum selesai',
                desc: 'Tampilkan ikon tugas saat catatan memiliki tugas yang belum selesai.'
            },
            showFileBackgroundUnfinishedTask: {
                name: 'Latar belakang tugas belum selesai',
                desc: 'Terapkan warna latar belakang saat catatan memiliki tugas yang belum selesai.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'Warna latar belakang tugas belum selesai',
                desc: 'Atur warna latar belakang yang digunakan saat catatan memiliki tugas yang belum selesai.'
            },
            showFilenameMatchIcons: {
                name: 'Ikon berdasarkan nama file',
                desc: 'Tetapkan ikon ke file berdasarkan teks dalam namanya.'
            },
            fileNameIconMap: {
                name: 'Peta ikon nama file',
                desc: 'File yang berisi teks mendapat ikon yang ditentukan. Satu pemetaan per baris: teks=ikon',
                placeholder: '# teks=ikon\nrapat=ph-calendar\nfaktur=ph-receipt',
                editTooltip: 'Edit pemetaan'
            },
            showCategoryIcons: {
                name: 'Ikon berdasarkan tipe file',
                desc: 'Tetapkan ikon ke file berdasarkan ekstensinya.'
            },
            fileTypeIconPreset: {
                name: 'Preset ikon file',
                desc: 'Pilih ikon bawaan atau preset paket ikon. Aturan ekstensi khusus menggantikan preset ini.',
                options: {
                    none: 'Ikon bawaan'
                },
                notInstalledWarning: 'Paket ikon ini belum terpasang. Ikon bawaan ditampilkan sebagai gantinya.'
            },
            fileTypeIconMap: {
                name: 'Peta ikon tipe file',
                desc: 'File dengan ekstensi mendapat ikon yang ditentukan. Satu pemetaan per baris: ekstensi=ikon',
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'Edit pemetaan'
            },
            compactItemHeight: {
                name: 'Tinggi item kompak',
                desc: 'Atur tinggi item daftar kompak di desktop dan mobile (piksel).',
                resetTooltip: 'Kembalikan ke default (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Skalakan teks dengan tinggi item kompak',
                desc: 'Skalakan teks daftar kompak saat tinggi item dikurangi.'
            },
            showParentFolder: {
                name: 'Tampilkan folder induk',
                desc: 'Tampilkan nama folder induk untuk catatan di subfolder, tag, atau properti.'
            },
            showParentFolderFullPath: {
                name: 'Tampilkan jalur folder',
                desc: 'Tampilkan jalur relatif terhadap folder yang dipilih alih-alih hanya nama folder. Tag dan properti menampilkan jalur lengkap.'
            },
            parentFolderClickRevealsFile: {
                name: 'Klik folder induk untuk membuka folder',
                desc: 'Mengklik label folder induk membuka folder di panel daftar.'
            },
            showParentFolderColor: {
                name: 'Tampilkan warna folder induk',
                desc: 'Gunakan warna folder pada label folder induk.'
            },
            showParentFolderIcon: {
                name: 'Tampilkan ikon folder induk',
                desc: 'Tampilkan ikon folder di samping label folder induk.'
            },
            showQuickActions: {
                name: 'Tampilkan aksi cepat',
                desc: 'Tampilkan tombol aksi saat mengarahkan kursor ke file. Kontrol tombol memilih aksi mana yang muncul.'
            },
            dualPane: {
                name: 'Tata letak panel ganda',
                desc: 'Tampilkan panel navigasi dan panel daftar berdampingan di desktop.'
            },
            dualPaneOrientation: {
                name: 'Orientasi panel ganda',
                desc: 'Pilih tata letak horizontal atau vertikal saat panel ganda aktif.',
                options: {
                    horizontal: 'Pembagian horizontal',
                    vertical: 'Pembagian vertikal'
                }
            },
            narrowSidebarLayout: {
                name: 'Saat bilah samping terlalu sempit',
                desc: 'Pilih apa yang terjadi saat panel navigasi dan panel daftar tidak muat berdampingan.',
                options: {
                    none: 'Jangan lakukan apa pun',
                    singlePane: 'Beralih ke panel tunggal',
                    vertical: 'Beralih ke pemisahan vertikal'
                }
            },
            narrowSidebarTrigger: {
                name: 'Ambang bilah samping sempit',
                desc: 'Pilih bagaimana ambang lebar bilah samping dihitung.',
                options: {
                    fitPanes: 'Muatkan panel',
                    customWidth: 'Lebar khusus'
                }
            },
            narrowSidebarCustomWidth: {
                name: 'Lebar ambang bilah samping sempit',
                desc: 'Beralih saat bilah samping lebih sempit dari lebar ini.',
                resetTooltip: 'Reset ke lebar bawaan'
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
                name: 'Tingkat zoom',
                desc: 'Mengontrol tingkat zoom keseluruhan Notebook Navigator (persentase).'
            },
            useFloatingToolbars: {
                name: 'Gunakan toolbar mengambang di iOS/iPadOS',
                desc: 'Hanya berlaku di iOS dan iPadOS.'
            },
            startView: {
                name: 'Tampilan startup default',
                desc: 'Pilih panel yang aktif saat Notebook Navigator dibuka. Tata letak panel tunggal menampilkan panel ini lebih dulu; tata letak panel ganda memberinya fokus keyboard.',
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
            createNewNotesInNewTab: {
                name: 'Buka catatan baru di tab baru',
                desc: 'Jika diaktifkan, perintah Buat catatan baru membuka catatan di tab baru. Jika dinonaktifkan, catatan menggantikan tab saat ini.'
            },
            autoRevealActiveNote: {
                name: 'Auto-tampilkan catatan aktif',
                desc: 'Secara otomatis menampilkan catatan saat dibuka dari Quick Switcher, tautan, atau pencarian.'
            },
            autoRevealShortestPath: {
                name: 'Auto-reveal: Gunakan jalur terpendek',
                desc: 'Diaktifkan: Auto-reveal memilih folder atau tag induk terdekat yang terlihat. Dinonaktifkan: Auto-reveal memilih folder asli dan tag persis dari file.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Auto-reveal: Abaikan peristiwa dari sidebar kanan',
                desc: 'Jangan ubah catatan aktif saat mengklik atau mengubah catatan di sidebar kanan.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'Auto-reveal: Abaikan peristiwa dari jendela lain',
                desc: 'Jangan ubah catatan aktif saat bekerja dengan catatan di jendela lain.'
            },
            paneTransitionDuration: {
                name: 'Animasi panel tunggal',
                desc: 'Durasi transisi saat beralih panel dalam mode panel tunggal (milidetik).',
                resetTooltip: 'Atur ulang ke default'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Auto-pilih catatan pertama',
                desc: 'Secara otomatis membuka catatan pertama saat beralih folder, tag, atau properti.'
            },
            skipAutoScroll: {
                name: 'Nonaktifkan auto-gulir untuk pintasan',
                desc: 'Jangan gulir panel navigasi saat mengklik item di pintasan.'
            },
            autoExpandNavItems: {
                name: 'Luaskan saat dipilih',
                desc: 'Luaskan folder dan tag saat dipilih. Dalam mode panel tunggal, pilihan pertama meluaskan, pilihan kedua menampilkan file.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'Satu cabang terbuka',
                desc: 'Ciutkan cabang lain di pohon yang sama saat membuka folder, tag, atau properti.'
            },
            springLoadedFolders: {
                name: 'Luaskan saat menyeret',
                desc: 'Luaskan folder dan tag saat mengarahkan kursor selama menyeret.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Luaskan saat menyeret: Tunda perluasan pertama',
                desc: 'Penundaan sebelum folder atau tag pertama diluaskan selama penyeretan (detik).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Luaskan saat menyeret: Tunda perluasan berikutnya',
                desc: 'Penundaan sebelum meluaskan folder atau tag tambahan selama penyeretan yang sama (detik).'
            },
            navigationBanner: {
                name: 'Banner navigasi (profil vault)',
                desc: 'Tampilkan gambar di atas panel navigasi. Berubah dengan profil vault yang dipilih.',
                current: 'Banner saat ini: {path}',
                chooseButton: 'Pilih gambar'
            },
            pinNavigationBanner: {
                name: 'Sematkan banner',
                desc: 'Sematkan banner navigasi di atas pohon navigasi.'
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
                name: 'Tampilkan file terbaru',
                desc: 'Tampilkan bagian file terbaru di panel navigasi.'
            },
            hideRecentNotes: {
                name: 'Sembunyikan jenis file dari file terbaru',
                desc: 'Pilih jenis file yang disembunyikan di bagian file terbaru.',
                options: {
                    none: 'Tidak ada',
                    folderNotes: 'Catatan folder'
                }
            },
            recentNotesCount: {
                name: 'Jumlah file terbaru',
                desc: 'Jumlah file terbaru yang ditampilkan.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Sematkan file terbaru bersama pintasan',
                desc: 'Sertakan file terbaru saat pintasan disematkan.'
            },
            calendarEnabled: {
                name: 'Aktifkan kalender',
                desc: 'Aktifkan fitur kalender Notebook Navigator.'
            },
            calendarPlacement: {
                name: 'Penempatan kalender',
                desc: 'Tampilkan di sidebar kiri atau kanan.',
                options: {
                    leftSidebar: 'Sidebar kiri',
                    rightSidebar: 'Sidebar kanan'
                }
            },
            calendarLeftPlacement: {
                name: 'Penempatan panel tunggal',
                desc: 'Tempat kalender ditampilkan dalam mode panel tunggal.',
                options: {
                    navigationPane: 'Panel navigasi',
                    below: 'Di bawah panel'
                }
            },
            calendarLocale: {
                name: 'Bahasa',
                desc: 'Mengontrol format tanggal kalender, penomoran minggu, dan hari pertama dalam seminggu.',
                weekPathMismatchWarning:
                    'Kalender yang terlihat dan jalur catatan mingguan menggunakan awal minggu atau penomoran minggu yang berbeda.',
                options: {
                    systemDefault: 'Default'
                }
            },
            calendarWeekendDays: {
                name: 'Hari akhir pekan',
                desc: 'Tampilkan hari akhir pekan dengan warna latar belakang berbeda.',
                options: {
                    none: 'Tidak ada',
                    satSun: 'Sabtu dan Minggu',
                    friSat: 'Jumat dan Sabtu',
                    thuFri: 'Kamis dan Jumat'
                }
            },
            calendarMonthHeadingFormat: {
                name: 'Format nama bulan',
                desc: 'Nama bulan lengkap (Januari) atau singkat (Jan).',
                options: {
                    full: 'Januari (lengkap)',
                    short: 'Jan (singkat)'
                }
            },
            showInfoButtons: {
                name: 'Tampilkan tombol info',
                desc: 'Tampilkan tombol info di bilah pencarian dan header kalender.'
            },
            calendarWeeksToShow: {
                name: 'Minggu yang ditampilkan di sidebar kiri',
                desc: 'Kalender di sidebar kanan selalu menampilkan bulan penuh.',
                options: {
                    fullMonth: 'Bulan penuh',
                    oneWeek: '1 minggu',
                    weeksCount: '{count} minggu'
                }
            },
            calendarHighlightToday: {
                name: 'Sorot tanggal hari ini',
                desc: 'Sorot tanggal hari ini dengan warna latar belakang dan teks tebal.'
            },
            calendarShowFeatureImage: {
                name: 'Tampilkan gambar fitur',
                desc: 'Tampilkan gambar fitur untuk catatan di kalender.'
            },
            calendarShowTasks: {
                name: 'Tampilkan tugas',
                desc: 'Tampilkan indikator pada hari, minggu, dan bulan dengan tugas yang belum selesai.'
            },
            calendarShowWeekNumber: {
                name: 'Tampilkan nomor minggu',
                desc: 'Tambahkan kolom dengan nomor minggu.'
            },
            calendarShowQuarter: {
                name: 'Tampilkan kuartal',
                desc: 'Tambahkan label kuartal di header kalender.'
            },
            calendarShowYearCalendar: {
                name: 'Tampilkan kalender tahunan',
                desc: 'Tampilkan navigasi tahun dan kisi bulan di bilah sisi kanan.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Konfirmasi sebelum membuat',
                desc: 'Tampilkan dialog konfirmasi saat membuat catatan harian baru.'
            },
            calendarIntegrationMode: {
                name: 'Sumber catatan harian',
                desc: 'Sumber untuk catatan kalender.',
                options: {
                    dailyNotes: 'Catatan harian (plugin inti)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'Folder dan format tanggal dikonfigurasi di plugin inti Daily Notes.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'Bahasa catatan berkala',
                desc: 'Mengontrol nama bulan, nama hari, nomor minggu, dan awal minggu yang dilokalkan di jalur catatan berkala Notebook Navigator.',
                options: {
                    calendar: 'Kalender',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'Folder root',
                desc: 'Folder dasar untuk catatan berkala. Pola tanggal dapat menyertakan subfolder. Berubah dengan profil vault yang dipilih.',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'Lokasi folder template',
                desc: 'Pemilih file template menampilkan catatan dari folder ini.',
                placeholder: 'Templates',
                usage: 'Digunakan oleh catatan kalender dan catatan folder. Konfigurasi template di Kalender > Integrasi kalender dan Folder & catatan folder > File catatan folder.'
            },
            calendarCustomFilePattern: {
                name: 'Catatan harian',
                desc: 'Format jalur menggunakan format tanggal Moment. Bungkus nama subfolder dalam tanda kurung, misal [Work]/YYYY. Klik ikon template untuk mengatur template. Atur lokasi folder templat di Operasi file > Templat.',
                momentDescPrefix: 'Format jalur menggunakan ',
                momentLinkText: 'format tanggal Moment',
                momentDescSuffix:
                    '. Bungkus nama subfolder dalam tanda kurung, misal [Work]/YYYY. Klik ikon template untuk mengatur template. Atur lokasi folder templat di Operasi file > Templat.',
                templaterSupportInstalled: '✅ Plugin Templater terpasang dengan dukungan template penuh.',
                templaterSupportMissing: '⚠️ Pasang plugin Templater untuk dukungan template penuh.',
                placeholder: 'YYYY/YYYYMMDD',
                example: 'Sintaks saat ini: {path}',
                parsingError: 'Pola harus dapat diformat dan diparse kembali sebagai tanggal lengkap (tahun, bulan, hari).'
            },
            calendarCustomWeekPattern: {
                name: 'Catatan mingguan',
                parsingError: 'Pola harus dapat diformat dan diparse kembali sebagai minggu lengkap (tahun minggu, nomor minggu).',
                weekPathMismatchWarning:
                    'Jalur catatan mingguan menggunakan bahasa catatan berkala. Gunakan bahasa yang cocok, atau gunakan "GGGG" dengan "WW" untuk minggu berbasis Senin.',
                mixedWeekTokensWarning:
                    'Pola ini menggabungkan token minggu berbasis Senin ("W" atau "G") dengan token minggu berbasis bahasa ("w" atau "g"). Gunakan satu set secara konsisten: "GGGG" dengan "WW" untuk minggu berbasis Senin, atau "gggg" dengan "ww" jika catatan mingguan harus mengikuti bahasa yang dipilih.'
            },
            calendarCustomMonthPattern: {
                name: 'Catatan bulanan',
                parsingError: 'Pola harus dapat diformat dan diparse kembali sebagai bulan lengkap (tahun, bulan).'
            },
            calendarCustomQuarterPattern: {
                name: 'Catatan kuartalan',
                parsingError: 'Pola harus dapat diformat dan diparse kembali sebagai kuartal lengkap (tahun, kuartal).'
            },
            calendarCustomYearPattern: {
                name: 'Catatan tahunan',
                parsingError: 'Pola harus dapat diformat dan diparse kembali sebagai tahun lengkap (tahun).'
            },
            calendarTemplateFile: {
                current: 'File template: {name}'
            },
            showTooltips: {
                name: 'Tampilkan tooltip',
                desc: 'Tampilkan tooltip hover dengan informasi tambahan untuk catatan dan folder.'
            },
            showTooltipPath: {
                name: 'Tampilkan path di tooltip',
                desc: 'Tampilkan path folder di bawah nama catatan di tooltip.'
            },
            showTooltipWordCount: {
                name: 'Tampilkan jumlah kata di tooltip',
                desc: 'Tampilkan jumlah kata catatan di tooltip.'
            },
            resetPaneSeparator: {
                name: 'Atur ulang posisi pemisah panel',
                desc: 'Atur ulang pemisah yang dapat diseret antara panel navigasi dan panel daftar ke posisi default.',
                buttonText: 'Atur ulang pemisah',
                notice: 'Posisi pemisah diatur ulang. Mulai ulang Obsidian atau buka kembali Notebook Navigator untuk menerapkan.'
            },
            settingsTransfer: {
                name: 'Impor dan ekspor pengaturan',
                desc: 'Ekspor atau impor pengaturan Notebook Navigator sebagai JSON. Impor menggantikan semua pengaturan.',
                importButtonText: 'Impor',
                exportButtonText: 'Ekspor',
                import: {
                    modalTitle: 'Impor pengaturan',
                    fileButtonName: 'Impor dari file',
                    fileButtonDesc: 'Muat file JSON dari disk.',
                    fileButtonText: 'Impor dari file',
                    editorName: 'JSON',
                    editorDesc: 'Tempel atau edit JSON di bawah. Pengaturan yang tidak disertakan akan diatur ulang ke default.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'Impor',
                    confirmTitle: 'Impor pengaturan?',
                    confirmMessage: 'Mengimpor akan mengganti pengaturan Notebook Navigator saat ini.',
                    backupToggleName: 'Simpan pengaturan saat ini di root vault sebelum mengimpor',
                    backupToggleDesc: 'Membuat file JSON bertimestamp di root vault.',
                    successWithBackupNotice: 'Pengaturan diimpor. Pengaturan sebelumnya disimpan ke {path}.',
                    backupError: 'Tidak dapat menyimpan pengaturan saat ini: {message}',
                    successNotice: 'Pengaturan diimpor.',
                    errorNotice: 'Gagal mengimpor pengaturan: {message}',
                    fileReadError: 'Tidak dapat membaca file: {message}'
                },
                export: {
                    modalTitle: 'Ekspor pengaturan',
                    editorName: 'JSON',
                    editorDesc: 'Hanya pengaturan yang diubah dari default yang disertakan.',
                    placeholder: '{}',
                    copyButtonText: 'Salin ke papan klip',
                    downloadButtonText: 'Unduh',
                    copyNotice: 'Pengaturan disalin ke papan klip.',
                    downloadNotice: 'Pengaturan diekspor.',
                    downloadError: 'Gagal mengekspor pengaturan: {message}'
                }
            },
            resetAllSettings: {
                name: 'Atur ulang semua pengaturan',
                desc: 'Atur ulang semua pengaturan Notebook Navigator ke nilai default.',
                buttonText: 'Atur ulang semua pengaturan',
                confirmTitle: 'Atur ulang semua pengaturan?',
                confirmMessage: 'Ini akan mengatur ulang semua pengaturan Notebook Navigator ke nilai default. Ini tidak dapat dibatalkan.',
                confirmButtonText: 'Atur ulang semua pengaturan',
                notice: 'Semua pengaturan diatur ulang. Mulai ulang Obsidian atau buka kembali Notebook Navigator untuk menerapkan.',
                error: 'Gagal mengatur ulang pengaturan.'
            },
            multiSelectModifier: {
                name: 'Modifier multi-pilih',
                desc: 'Pilih tombol modifier mana yang mengalihkan multi-pilih. Ketika Option/Alt dipilih, klik Cmd/Ctrl membuka catatan di tab baru.',
                options: {
                    cmdCtrl: 'Klik Cmd/Ctrl',
                    optionAlt: 'Klik Option/Alt'
                }
            },
            enterToOpenFiles: {
                name: 'Tekan Enter untuk membuka file',
                desc: 'Buka file hanya saat menekan Enter selama navigasi keyboard di daftar. Di macOS, ini mencegah Enter mengganti nama file.'
            },
            shiftEnterOpenContext: {
                name: 'Shift+Enter',
                desc: 'Pilih apakah Shift+Enter membuka atau mengganti nama file yang dipilih.'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Enter',
                desc: 'Pilih apakah Cmd+Enter membuka atau mengganti nama file yang dipilih.'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Enter',
                desc: 'Pilih apakah Ctrl+Enter membuka atau mengganti nama file yang dipilih.'
            },
            mouseBackForwardAction: {
                name: 'Tombol mundur/maju mouse',
                desc: 'Aksi untuk tombol mundur dan maju mouse di desktop.',
                options: {
                    none: 'Gunakan default sistem',
                    singlePaneSwitch: 'Pindah panel (panel tunggal)',
                    history: 'Navigasi riwayat'
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
                desc: 'Pilih apa yang Notebook Navigator buka secara otomatis saat memulai.',
                current: 'Saat ini: {path}',
                chooseButton: 'Pilih file',
                options: {
                    none: 'Tidak ada',
                    file: 'File',
                    dailyNote: 'Catatan harian',
                    weeklyNote: 'Catatan mingguan',
                    monthlyNote: 'Catatan bulanan',
                    quarterlyNote: 'Catatan kuartalan',
                    yearlyNote: 'Catatan tahunan'
                },
                file: {
                    name: 'Beranda: File awal',
                    empty: 'Tidak ada file dipilih'
                },
                createMissing: {
                    name: 'Beranda: Buat catatan jika tidak ada',
                    desc: 'Membuat catatan berkala saat startup atau perintah jika belum ada.'
                }
            },
            excludedNotes: {
                name: 'Sembunyikan catatan dengan aturan properti (profil vault)',
                desc: 'Daftar aturan frontmatter yang dipisahkan koma. Gunakan entri `key` atau `key=value` (misal, status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'Sembunyikan file (profil vault)',
                desc: 'Daftar pola nama file yang dipisahkan koma untuk disembunyikan. Mendukung wildcard * dan jalur / (misal, temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Profil vault',
                desc: 'Profil menyimpan visibilitas jenis file, file tersembunyi, folder tersembunyi, tag tersembunyi, aturan properti untuk catatan tersembunyi, pintasan, dan banner navigasi. Beralih profil dari header panel navigasi.',
                defaultName: 'Default',
                addButton: 'Tambah profil',
                editProfilesButton: 'Edit profil',
                addProfileOption: 'Tambah profil...',
                applyButton: 'Terapkan',
                deleteButton: 'Hapus profil',
                addModalTitle: 'Tambah profil',
                editProfilesModalTitle: 'Edit profil',
                addModalPlaceholder: 'Nama profil',
                deleteModalTitle: 'Hapus {name}',
                deleteModalMessage:
                    'Hapus {name}? Filter file, folder, tag, dan catatan berbasis properti yang disimpan di profil ini akan dihapus.',
                moveUp: 'Pindah ke atas',
                moveDown: 'Pindah ke bawah',
                errors: {
                    emptyName: 'Masukkan nama profil',
                    duplicateName: 'Nama profil sudah ada'
                }
            },
            vaultTitle: {
                name: 'Penempatan judul vault',
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
            descendantExcludedFolders: {
                name: 'Kecualikan folder dari catatan subfolder (profil vault)',
                desc: 'Daftar folder yang dipisahkan koma untuk dilewati saat mengumpulkan catatan dari subfolder. Folder tetap terlihat, dan memilih folder tetap menampilkan catatannya. Menggunakan pola yang sama seperti Sembunyikan folder.',
                placeholder: 'harian, sumber-daya, /arsip'
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
            showFileProperties: {
                name: 'Tampilkan properti file',
                desc: 'Tampilkan properti di item file. Gunakan dialog visibilitas kunci properti untuk memilih properti yang ditampilkan.'
            },
            colorFileProperties: {
                name: 'Warnai properti file',
                desc: 'Terapkan warna properti pada lencana properti di item file.'
            },
            prioritizeColoredFileProperties: {
                name: 'Tampilkan properti berwarna terlebih dahulu',
                desc: 'Urutkan properti berwarna sebelum properti lain di item file.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Tampilkan properti dalam mode kompak',
                desc: 'Tampilkan properti saat mode kompak aktif.'
            },
            textCountDisplay: {
                name: 'Jenis hitungan',
                desc: 'Pilih hitungan catatan yang muncul di item file.',
                options: {
                    none: 'Tidak ada',
                    words: 'Jumlah kata',
                    characters: 'Jumlah karakter',
                    both: 'Jumlah kata dan karakter'
                }
            },
            textCountPlacement: {
                name: 'Penempatan',
                desc: 'Pilih tempat hitungan catatan muncul.',
                options: {
                    title: 'Di judul',
                    property: 'Sebagai properti'
                }
            },
            characterCountSpaces: {
                name: 'Jumlah karakter',
                desc: 'Pilih apakah spasi disertakan dalam jumlah karakter.',
                options: {
                    include: 'Termasuk spasi',
                    exclude: 'Tanpa spasi'
                }
            },
            wordCountTargetProperty: {
                name: 'Properti target',
                desc: 'Kunci properti frontmatter yang berisi target jumlah kata. Biarkan kosong untuk menyembunyikan target.'
            },
            showWordCountPercentage: {
                name: 'Tampilkan persentase target',
                desc: 'Tampilkan hanya persentase kemajuan saat target jumlah kata tersedia.'
            },
            propertyFields: {
                name: 'Kunci properti (profil brankas)',
                desc: 'Kunci properti frontmatter, dengan visibilitas per kunci untuk navigasi dan daftar file.',
                addButtonTooltip: 'Konfigurasi kunci properti',
                noneConfigured: 'Tidak ada properti yang dikonfigurasi',
                singleConfigured: '1 properti dikonfigurasi: {properties}',
                multipleConfigured: '{count} properti dikonfigurasi: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'Tampilkan properti pada baris terpisah',
                desc: 'Tampilkan setiap properti pada barisnya sendiri.'
            },
            enablePropertyInternalLinks: {
                name: 'Tautkan pil properti ke catatan',
                desc: 'Klik pil properti untuk membuka catatan yang ditautkan.'
            },
            enablePropertyExternalLinks: {
                name: 'Tautkan pil properti ke URL',
                desc: 'Klik pil properti untuk membuka URL yang ditautkan.'
            },
            dateFormat: {
                name: 'Format tanggal',
                desc: 'Format untuk menampilkan tanggal (menggunakan format Moment).',
                placeholder: 'D MMM YYYY',
                help: 'Format umum:\nD MMM YYYY = 25 Mei 2022\nDD/MM/YYYY = 25/05/2022\nYYYY-MM-DD = 2022-05-25\n\nToken:\nYYYY/YY = tahun\nMMMM/MMM/MM = bulan\nDD/D = hari\ndddd/ddd = hari kerja',
                helpTooltip: 'Format menggunakan Moment',
                momentLinkText: 'format Moment'
            },
            timeFormat: {
                name: 'Format waktu',
                desc: 'Format untuk menampilkan waktu (menggunakan format Moment).',
                placeholder: 'HH:mm',
                help: 'Format umum:\nHH:mm = 14:30 (24 jam)\nh:mm a = 2:30 PM (12 jam)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nToken:\nHH/H = 24 jam\nhh/h = 12 jam\nmm = menit\nss = detik\na = AM/PM',
                helpTooltip: 'Format menggunakan Moment',
                momentLinkText: 'format Moment'
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
            stripLatexInPreview: {
                name: 'Hapus LaTeX di pratinjau',
                desc: 'Hapus ekspresi LaTeX inline dan blok dari teks pratinjau.'
            },
            previewProperties: {
                name: 'Properti pratinjau',
                desc: 'Daftar properti frontmatter yang dipisahkan koma untuk memeriksa teks pratinjau. Properti pertama dengan teks akan digunakan.',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'Kembali ke konten catatan',
                desc: 'Tampilkan konten catatan sebagai pratinjau saat tidak ada properti yang ditentukan berisi teks.'
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
                    '2': '2 baris',
                    '3': '3 baris'
                }
            },
            useFolderColor: {
                name: 'Gunakan warna folder',
                desc: 'Warnai judul catatan dan ikon file dengan warna folder induk saat tidak ada warna file kustom yang ditetapkan. Prioritas: warna file kustom > warna folder > warna default.'
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
                desc: 'Daftar properti frontmatter yang dipisahkan koma untuk diperiksa terlebih dahulu. Jika tidak ditemukan, menggunakan gambar pertama dalam konten markdown.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'Kecualikan catatan dengan properti',
                desc: 'Daftar properti frontmatter yang dipisahkan koma. Catatan yang mengandung properti ini tidak menyimpan gambar fitur.',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: 'Ukuran tampilan gambar fitur',
                desc: 'Ukuran render maksimum untuk gambar fitur dalam daftar catatan.',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'Ukuran piksel gambar fitur',
                desc: 'Resolusi yang digunakan saat membuat thumbnail gambar fitur yang disimpan. Tingkatkan ini jika pratinjau yang lebih besar terlihat buram.',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'Unduh gambar eksternal',
                desc: 'Unduh gambar jarak jauh dan thumbnail YouTube untuk gambar unggulan.'
            },
            hideDrawingPreviewImages: {
                name: 'Sembunyikan gambar pratinjau yang diekspor',
                desc: 'Sembunyikan berkas PNG pratinjau gambar yang diekspor. Aktifkan "Tampilkan item tersembunyi" untuk menampilkannya.'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator menampilkan berkas PNG yang diekspor oleh Excalidraw sebagai pratinjau gambar.',
                items: [
                    'Di **pengaturan Excalidraw**, buka **Embedding Excalidraw into your Notes and Exporting**, lalu **Export Settings**, lalu **Auto-export Settings**.',
                    'Aktifkan **Auto-export PNG**. Secara opsional aktifkan **Export both dark- and light-themed image**.',
                    'Notebook Navigator mencari **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png**, atau **Drawing.excalidraw.light.png**.',
                    'Saat **Sembunyikan gambar pratinjau yang diekspor** aktif, berkas PNG hanya muncul ketika **Tampilkan item tersembunyi** juga aktif.'
                ]
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
            folderSortOrder: {
                name: 'Urutan folder',
                desc: 'Klik kanan pada folder mana pun untuk mengatur urutan pengurutan berbeda untuk isinya.',
                options: {
                    alphaAsc: 'A ke Z',
                    alphaDesc: 'Z ke A'
                }
            },
            showNoteCount: {
                name: 'Tampilkan jumlah catatan',
                desc: 'Tampilkan jumlah catatan di sebelah folder, tag, dan properti.'
            },
            showSectionIcons: {
                name: 'Tampilkan ikon untuk pintasan dan item terbaru',
                desc: 'Tampilkan ikon di samping item pada bagian Pintasan dan Terbaru.'
            },
            interfaceIcons: {
                name: 'Ikon antarmuka',
                desc: 'Edit ikon toolbar, folder, tag, properti, item tersemat, pencarian, dan pengurutan.',
                buttonText: 'Edit ikon'
            },
            showIconsColorOnly: {
                name: 'Terapkan warna ke ikon saja',
                desc: 'Saat diaktifkan, warna kustom hanya diterapkan ke ikon. Saat dinonaktifkan, warna diterapkan ke ikon dan label teks.'
            },
            navRainbowMode: {
                name: 'Mode warna pelangi (profil vault)',
                desc: 'Terapkan warna pelangi di panel navigasi.',
                options: {
                    none: 'Mati',
                    foreground: 'Warna teks',
                    background: 'Warna latar'
                }
            },
            navRainbowFirstColor: {
                name: 'Warna pertama',
                desc: 'Warna pertama dalam gradien pelangi.'
            },
            navRainbowLastColor: {
                name: 'Warna terakhir',
                desc: 'Warna terakhir dalam gradien pelangi.'
            },
            navRainbowTransitionStyle: {
                name: 'Gaya transisi',
                desc: 'Interpolasi yang digunakan antara warna pertama dan terakhir.',
                options: {
                    hue: 'Hue',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'Terapkan ke pintasan',
                desc: 'Terapkan warna pelangi ke pintasan.'
            },
            navRainbowApplyToRecent: {
                name: 'Terapkan ke item terbaru',
                desc: 'Terapkan warna pelangi ke item terbaru.'
            },
            navRainbowApplyToFolders: {
                name: 'Terapkan ke folder',
                desc: 'Terapkan warna pelangi ke folder.'
            },
            navRainbowFolderScope: {
                name: 'Cakupan folder',
                desc: 'Pilih level folder mana yang memulai penetapan warna.',
                options: {
                    root: 'Level akar',
                    child: 'Level anak',
                    all: 'Setiap level'
                }
            },
            navRainbowApplyToTags: {
                name: 'Terapkan ke tag',
                desc: 'Terapkan warna pelangi ke tag.'
            },
            navRainbowTagScope: {
                name: 'Cakupan tag',
                desc: 'Pilih level tag mana yang memulai penetapan warna.',
                options: {
                    root: 'Level akar',
                    child: 'Level anak',
                    all: 'Setiap level'
                }
            },
            navRainbowApplyToProperties: {
                name: 'Terapkan ke properti',
                desc: 'Terapkan warna pelangi ke properti.'
            },
            navRainbowBalanceHueLuminance: {
                name: 'Kecerahan konsisten di seluruh warna', // (English: Consistent brightness across hues)
                desc: 'Menginterpolasi kecerahan antara warna awal dan akhir selama transisi warna.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'Pisahkan warna mode terang dan gelap', // (English: Separate light and dark mode colors)
                desc: 'Gunakan warna pelangi yang berbeda untuk mode terang dan mode gelap.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'Salin warna mode terang ke mode gelap', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'Cakupan properti',
                desc: 'Pilih level properti mana yang memulai penetapan warna.',
                options: {
                    root: 'Level akar',
                    child: 'Level anak',
                    all: 'Setiap level'
                }
            },
            collapseBehavior: {
                name: 'Ciutkan item',
                desc: 'Pilih apa yang dipengaruhi tombol luaskan/ciutkan semua.',
                options: {
                    all: 'Semua',
                    foldersOnly: 'Folder saja',
                    tagsOnly: 'Tag saja',
                    propertiesOnly: 'Properti saja'
                }
            },
            smartCollapse: {
                name: 'Pertahankan item yang dipilih tetap terbuka',
                desc: 'Saat menciutkan, pertahankan item yang dipilih dan induknya tetap terbuka.'
            },
            excludeVaultRootFromCollapse: {
                name: 'Lewati root vault saat menciutkan',
                desc: 'Saat menciutkan semua item, biarkan folder root vault tetap dalam keadaan saat ini.'
            },
            navIndent: {
                name: 'Indentasi pohon',
                desc: 'Sesuaikan lebar indentasi untuk folder, tag, dan properti bersarang (piksel).'
            },
            navItemHeight: {
                name: 'Tinggi item',
                desc: 'Sesuaikan tinggi folder, tag, dan properti di panel navigasi (piksel).'
            },
            navItemHeightScaleText: {
                name: 'Skalakan teks dengan tinggi item',
                desc: 'Kurangi ukuran teks navigasi saat tinggi item dikurangi.'
            },
            showIndentGuides: {
                name: 'Tampilkan panduan indentasi',
                desc: 'Tampilkan panduan indentasi untuk folder, tag, dan properti bersarang.'
            },
            navCountLeaderStyle: {
                name: 'Tampilkan tanda penghubung',
                desc: 'Tampilkan titik, tanda hubung, atau garis antara nama item dan jumlah catatan.',
                options: {
                    none: 'Tidak ada',
                    dots: 'Titik (...)',
                    dashes: 'Tanda hubung (---)',
                    line: 'Garis'
                }
            },
            navRootSpacing: {
                name: 'Spasi item root',
                desc: 'Spasi antara folder, tag, dan properti tingkat root (piksel).'
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
                desc: 'Klik kanan pada tag mana pun untuk mengatur urutan pengurutan berbeda untuk isinya.',
                options: {
                    alphaAsc: 'A ke Z',
                    alphaDesc: 'Z ke A',
                    frequency: 'Frekuensi',
                    lowToHigh: 'rendah ke tinggi',
                    highToLow: 'tinggi ke rendah'
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
            scopeTagsToCurrentContext: {
                name: 'Filter tag berdasarkan pilihan',
                desc: 'Hanya tampilkan tag yang muncul di catatan dalam folder atau properti yang dipilih.'
            },
            keepEmptyTagsProperty: {
                name: 'Pertahankan properti tag setelah menghapus tag terakhir',
                desc: 'Pertahankan properti tag frontmatter saat semua tag dihapus. Saat dinonaktifkan, properti tag dihapus dari frontmatter.'
            },
            showProperties: {
                name: 'Tampilkan properti',
                desc: 'Tampilkan bagian properti di navigator.',
                propertyKeysInfoPrefix: 'Konfigurasi properti di ',
                propertyKeysInfoLinkText: 'Mulai > Kunci properti',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'Tampilkan ikon properti',
                desc: 'Tampilkan ikon di samping properti di panel navigasi.'
            },
            inheritPropertyColors: {
                name: 'Warisi warna properti',
                desc: 'Nilai properti mewarisi warna dan latar belakang dari kunci propertinya.'
            },
            propertySortOrder: {
                name: 'Urutan sortir properti',
                desc: 'Klik kanan pada properti mana saja untuk mengatur urutan sortir yang berbeda untuk nilainya.',
                options: {
                    alphaAsc: 'A ke Z',
                    alphaDesc: 'Z ke A',
                    frequency: 'Frekuensi',
                    lowToHigh: 'rendah ke tinggi',
                    highToLow: 'tinggi ke rendah'
                }
            },
            showAllPropertiesFolder: {
                name: 'Tampilkan folder properti',
                desc: 'Tampilkan "Properti" sebagai folder yang dapat dilipat.'
            },
            scopePropertiesToCurrentContext: {
                name: 'Filter properti berdasarkan pilihan',
                desc: 'Hanya tampilkan properti yang muncul di catatan dalam folder atau tag yang dipilih.'
            },
            hiddenTags: {
                name: 'Sembunyikan tag (profil vault)',
                desc: 'Daftar pola tag yang dipisahkan koma. Pola nama: tag* (dimulai dengan), *tag (diakhiri dengan). Pola jalur: arsip (tag dan turunan), arsip/* (hanya turunan), proyek/*/draf (wildcard tengah).',
                placeholder: 'arsip*, *draf, proyek/*/lama'
            },
            hiddenFileTags: {
                name: 'Sembunyikan catatan dengan tag (profil vault)',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'Aktifkan catatan folder',
                desc: 'Folder dengan file catatan yang cocok ditampilkan sebagai tautan yang dapat diklik.'
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
            folderNoteNamePattern: {
                name: 'Pola nama catatan folder',
                desc: 'Pola nama untuk catatan folder tanpa ekstensi. Gunakan {{folder}} untuk menyisipkan nama folder. Jika diatur, nama catatan folder tidak berlaku.'
            },
            folderNoteTemplate: {
                name: 'Templat catatan folder',
                desc: 'File templat yang digunakan saat membuat catatan folder. Templat Markdown dapat menggunakan Templater. Templat Canvas dan Base disalin sebagai isi file. Atur lokasi folder templat di Operasi file > Templat.',
                formatWarning: 'Format templat harus cocok dengan jenis catatan folder yang dipilih: .md, .canvas, atau .base.'
            },
            enableFolderNoteLinks: {
                name: 'Nama folder membuka catatan folder',
                desc: 'Mengklik nama folder membuka catatan foldernya. Saat dinonaktifkan, catatan folder hanya menyediakan metadata folder seperti nama, ikon, dan warna.'
            },
            hideFolderNoteInList: {
                name: 'Sembunyikan catatan folder di daftar',
                desc: 'Sembunyikan catatan folder dari daftar file.'
            },
            pinCreatedFolderNote: {
                name: 'Sematkan catatan folder yang dibuat',
                desc: 'Sematkan catatan folder saat dibuat dari menu konteks.'
            },
            folderNoteOpenLocation: {
                name: 'Buka catatan folder di',
                desc: 'Pilih tempat catatan folder dibuka saat mengklik tautan catatan folder.',
                options: {
                    currentTab: 'Tab saat ini',
                    newTab: 'Tab baru',
                    rightSidebar: 'Bilah sisi kanan'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: 'Bilah sisi kanan: Tampilkan catatan folder terdekat',
                desc: 'Saat folder dipilih, bilah sisi kanan otomatis menampilkan catatan folder leluhur terdekat.'
            },
            confirmBeforeDelete: {
                name: 'Konfirmasi sebelum menghapus',
                desc: 'Tampilkan dialog konfirmasi saat menghapus catatan atau folder'
            },
            deleteAttachments: {
                name: 'Hapus lampiran saat menghapus file',
                desc: 'Otomatis menghapus lampiran tertaut dan pratinjau gambar yang dihasilkan jika tidak digunakan di tempat lain',
                options: {
                    ask: 'Tanya setiap kali',
                    always: 'Selalu',
                    never: 'Tidak pernah'
                }
            },
            moveFileConflicts: {
                name: 'Konflik pemindahan',
                desc: 'Saat memindahkan file ke folder yang sudah memiliki file dengan nama yang sama. Tanya setiap kali (ganti nama, timpa, batal) atau selalu ganti nama.',
                options: {
                    ask: 'Tanya setiap kali',
                    rename: 'Selalu ganti nama'
                }
            },
            metadataCleanup: {
                name: 'Bersihkan metadata',
                desc: 'Menghapus metadata yatim yang ditinggalkan saat file, folder, tag, atau properti dihapus, dipindahkan, atau diganti nama di luar Obsidian. Ini hanya mempengaruhi file pengaturan Notebook Navigator.',
                buttonText: 'Bersihkan metadata',
                error: 'Pembersihan pengaturan gagal',
                loading: 'Memeriksa metadata...',
                statusClean: 'Tidak ada metadata untuk dibersihkan',
                statusCounts:
                    'Item yatim: {folders} folder, {tags} tag, {properties} properti, {files} file, {pinned} pin, {separators} pemisah'
            },
            rebuildCache: {
                name: 'Bangun ulang cache',
                desc: 'Gunakan ini jika Anda mengalami tag yang hilang, pratinjau yang salah, atau gambar unggulan yang hilang. Ini dapat terjadi setelah konflik sinkronisasi atau penutupan yang tidak terduga.',
                buttonText: 'Bangun ulang cache',
                error: 'Gagal membangun ulang cache',
                indexingTitle: 'Mengindeks vault...',
                progress: 'Memperbarui cache Notebook Navigator.'
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
            frontmatterBackgroundField: {
                name: 'Field latar belakang',
                desc: 'Field frontmatter untuk warna latar belakang. Biarkan kosong untuk menggunakan warna latar belakang yang disimpan di pengaturan.',
                placeholder: 'background'
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
                placeholder: 'title, name'
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
                helpTooltip: 'Format menggunakan Moment',
                momentLinkText: 'format Moment',
                help: 'Format umum:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'Dukung pengembangan',
                desc: 'Jika Anda menyukai Notebook Navigator, silakan pertimbangkan untuk mendukung pengembangan berkelanjutannya.',
                buttonText: '❤️ Sponsor',
                coffeeButton: '☕️ Traktir saya kopi'
            },
            updateCheckOnStart: {
                name: 'Periksa versi baru saat mulai',
                desc: 'Memeriksa rilis plugin baru saat startup dan menampilkan notifikasi saat pembaruan tersedia. Pemeriksaan terjadi paling banyak sekali sehari.',
                status: 'Versi baru tersedia: {version}'
            },
            debugLogging: {
                name: 'Log debug saat startup',
                desc: 'Menulis diagnostik startup ke file Markdown bertanda waktu di root vault, lalu berhenti setelah startup stabil. File dapat disinkronkan dan dapat menyertakan jalur file.'
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
        openBannerImage: 'Buka gambar banner rilis',
        supportMessage: 'Jika Anda merasa Notebook Navigator membantu, silakan pertimbangkan untuk mendukung pengembangannya.',
        supportButton: 'Traktir saya kopi',
        thanksButton: 'Terima kasih!'
    }
};
