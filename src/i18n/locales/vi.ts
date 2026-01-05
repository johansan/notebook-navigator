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
 * Vietnamese language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_VI = {
    // Common UI elements
    common: {
        cancel: 'Hủy', // Button text for canceling dialogs and operations (English: Cancel)
        delete: 'Xóa', // Button text for delete operations in dialogs (English: Delete)
        clear: 'Xóa', // Button text for clearing values (English: Clear)
        remove: 'Gỡ bỏ', // Button text for remove operations in dialogs (English: Remove)
        submit: 'Gửi', // Button text for submitting forms and dialogs (English: Submit)
        noSelection: 'Chưa chọn gì', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Không có thẻ', // Label for notes without any tags (English: Untagged)
        untitled: 'Chưa đặt tên', // Default name for notes without a title (English: Untitled)
        featureImageAlt: 'Ảnh nổi bật', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Lỗi không xác định', // Generic fallback when an error has no message (English: Unknown error)
        updateBannerTitle: 'Có bản cập nhật Notebook Navigator',
        updateBannerInstruction: 'Cập nhật trong Cài đặt -> Plugin cộng đồng',
        updateIndicatorLabel: 'Có phiên bản mới'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Chọn một thư mục hoặc thẻ để xem ghi chú', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Không có ghi chú', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Đã ghim', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Ghi chú', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Tệp', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (ẩn)' // Accessibility label applied to list items that are normally hidden
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Không có thẻ', // Label for the special item showing notes without tags (English: Untagged)
        hiddenTags: 'Thẻ ẩn', // Label for the hidden tags virtual folder (English: Hidden tags)
        tags: 'Thẻ' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Lối tắt', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentNotesHeader: 'Ghi chú gần đây', // Header label for recent notes section in navigation pane (English: Recent notes)
        recentFilesHeader: 'Tệp gần đây', // Header label when showing recent non-note files in navigation pane (English: Recent files)
        reorderRootFoldersTitle: 'Sắp xếp lại điều hướng',
        reorderRootFoldersHint: 'Dùng mũi tên hoặc kéo để sắp xếp lại',
        vaultRootLabel: 'Vault',
        resetRootToAlpha: 'Đặt lại theo thứ tự bảng chữ cái',
        resetRootToFrequency: 'Đặt lại theo tần suất',
        pinShortcuts: 'Ghim lối tắt',
        pinShortcutsAndRecentNotes: 'Ghim lối tắt và ghi chú gần đây',
        pinShortcutsAndRecentFiles: 'Ghim lối tắt và tệp gần đây',
        unpinShortcuts: 'Bỏ ghim lối tắt',
        unpinShortcutsAndRecentNotes: 'Bỏ ghim lối tắt và ghi chú gần đây',
        unpinShortcutsAndRecentFiles: 'Bỏ ghim lối tắt và tệp gần đây',
        profileMenuLabel: 'Hồ sơ',
        profileMenuAria: 'Đổi hồ sơ vault'
    },

    shortcuts: {
        folderExists: 'Thư mục đã có trong lối tắt',
        noteExists: 'Ghi chú đã có trong lối tắt',
        tagExists: 'Thẻ đã có trong lối tắt',
        searchExists: 'Lối tắt tìm kiếm đã tồn tại',
        emptySearchQuery: 'Nhập truy vấn tìm kiếm trước khi lưu',
        emptySearchName: 'Nhập tên trước khi lưu tìm kiếm',
        add: 'Thêm vào lối tắt',
        addNotesCount: 'Thêm {count} ghi chú vào lối tắt',
        addFilesCount: 'Thêm {count} tệp vào lối tắt',
        rename: 'Đổi tên lối tắt',
        remove: 'Gỡ khỏi lối tắt',
        removeAll: 'Xóa tất cả lối tắt',
        removeAllConfirm: 'Xóa tất cả lối tắt?',
        folderNotesPinned: 'Đã ghim {count} ghi chú thư mục'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'Thu gọn các mục', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'Mở rộng tất cả các mục', // Tooltip for button that expands all items (English: Expand all items)
        scrollToTop: 'Cuộn lên đầu',
        newFolder: 'Thư mục mới', // Tooltip for create new folder button (English: New folder)
        newNote: 'Ghi chú mới', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Quay lại điều hướng', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeSortOrder: 'Đổi thứ tự sắp xếp', // Tooltip for the sort order toggle button (English: Change sort order)
        defaultSort: 'Mặc định', // Label for default sorting mode (English: Default)
        customSort: 'Tùy chỉnh', // Label for custom sorting mode (English: Custom)
        showFolders: 'Hiện điều hướng', // Tooltip for button to show the navigation pane (English: Show navigation)
        hideFolders: 'Ẩn điều hướng', // Tooltip for button to hide the navigation pane (English: Hide navigation)
        reorderRootFolders: 'Sắp xếp lại điều hướng',
        finishRootFolderReorder: 'Hoàn tất',
        toggleDescendantNotes: 'Hiện ghi chú từ thư mục con / phần tử con', // Tooltip: include descendants for folders and tags
        autoExpandFoldersTags: 'Mở rộng khi chọn', // Tooltip for button to toggle auto-expanding folders and tags when selected (English: Expand on selection)
        showExcludedItems: 'Hiện thư mục, thẻ và ghi chú ẩn', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Ẩn thư mục, thẻ và ghi chú ẩn', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Hiện hai ngăn', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Hiện một ngăn', // Tooltip for button to show single-pane layout (English: Show single pane)
        changeAppearance: 'Đổi giao diện', // Tooltip for button to change folder appearance settings (English: Change appearance)
        search: 'Tìm kiếm' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Tìm kiếm...', // Placeholder text for search input (English: Search...)
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Xóa tìm kiếm', // Tooltip for clear search button (English: Clear search)
        saveSearchShortcut: 'Lưu lối tắt tìm kiếm',
        removeSearchShortcut: 'Gỡ lối tắt tìm kiếm',
        shortcutModalTitle: 'Lưu lối tắt tìm kiếm',
        shortcutNamePlaceholder: 'Nhập tên lối tắt'
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'Mở trong tab mới',
            openToRight: 'Mở bên phải',
            openInNewWindow: 'Mở trong cửa sổ mới',
            openMultipleInNewTabs: 'Mở {count} ghi chú trong tab mới',
            openMultipleFilesInNewTabs: 'Mở {count} tệp trong tab mới',
            openMultipleToRight: 'Mở {count} ghi chú bên phải',
            openMultipleFilesToRight: 'Mở {count} tệp bên phải',
            openMultipleInNewWindows: 'Mở {count} ghi chú trong cửa sổ mới',
            openMultipleFilesInNewWindows: 'Mở {count} tệp trong cửa sổ mới',
            pinNote: 'Ghim ghi chú',
            pinFile: 'Ghim tệp',
            unpinNote: 'Bỏ ghim ghi chú',
            unpinFile: 'Bỏ ghim tệp',
            pinMultipleNotes: 'Ghim {count} ghi chú',
            pinMultipleFiles: 'Ghim {count} tệp',
            unpinMultipleNotes: 'Bỏ ghim {count} ghi chú',
            unpinMultipleFiles: 'Bỏ ghim {count} tệp',
            duplicateNote: 'Nhân bản ghi chú',
            duplicateFile: 'Nhân bản tệp',
            duplicateMultipleNotes: 'Nhân bản {count} ghi chú',
            duplicateMultipleFiles: 'Nhân bản {count} tệp',
            openVersionHistory: 'Mở lịch sử phiên bản',
            revealInFolder: 'Hiện trong thư mục',
            revealInFinder: 'Hiện trong Finder',
            showInExplorer: 'Hiện trong trình quản lý tệp',
            copyDeepLink: 'Sao chép URL Obsidian',
            copyPath: 'Sao chép đường dẫn hệ thống',
            copyRelativePath: 'Sao chép đường dẫn vault',
            renameNote: 'Đổi tên ghi chú',
            renameFile: 'Đổi tên tệp',
            deleteNote: 'Xóa ghi chú',
            deleteFile: 'Xóa tệp',
            deleteMultipleNotes: 'Xóa {count} ghi chú',
            deleteMultipleFiles: 'Xóa {count} tệp',
            moveNoteToFolder: 'Di chuyển ghi chú...',
            moveFileToFolder: 'Di chuyển tệp...',
            moveMultipleNotesToFolder: 'Di chuyển {count} ghi chú...',
            moveMultipleFilesToFolder: 'Di chuyển {count} tệp...',
            addTag: 'Thêm thẻ',
            removeTag: 'Gỡ thẻ',
            removeAllTags: 'Gỡ tất cả thẻ',
            changeIcon: 'Đổi biểu tượng',
            changeColor: 'Đổi màu'
        },
        folder: {
            newNote: 'Ghi chú mới',
            newNoteFromTemplate: 'Ghi chú mới từ mẫu',
            newFolder: 'Thư mục mới',
            newCanvas: 'Canvas mới',
            newBase: 'Cơ sở dữ liệu mới',
            newDrawing: 'Bản vẽ mới',
            newExcalidrawDrawing: 'Bản vẽ Excalidraw mới',
            newTldrawDrawing: 'Bản vẽ Tldraw mới',
            duplicateFolder: 'Nhân bản thư mục',
            searchInFolder: 'Tìm trong thư mục',
            copyPath: 'Sao chép đường dẫn hệ thống',
            copyRelativePath: 'Sao chép đường dẫn vault',
            createFolderNote: 'Tạo ghi chú thư mục',
            detachFolderNote: 'Tách ghi chú thư mục',
            deleteFolderNote: 'Xóa ghi chú thư mục',
            changeIcon: 'Đổi biểu tượng',
            changeColor: 'Đổi màu',
            changeBackground: 'Đổi nền',
            excludeFolder: 'Ẩn thư mục',
            unhideFolder: 'Hiện thư mục',
            moveFolder: 'Di chuyển thư mục...',
            renameFolder: 'Đổi tên thư mục',
            deleteFolder: 'Xóa thư mục'
        },
        tag: {
            changeIcon: 'Đổi biểu tượng',
            changeColor: 'Đổi màu',
            changeBackground: 'Đổi nền',
            showTag: 'Hiện thẻ',
            hideTag: 'Ẩn thẻ'
        },
        navigation: {
            addSeparator: 'Thêm dấu phân cách',
            removeSeparator: 'Gỡ dấu phân cách'
        },
        style: {
            title: 'Kiểu',
            copy: 'Sao chép kiểu',
            paste: 'Dán kiểu',
            removeIcon: 'Xóa biểu tượng',
            removeColor: 'Xóa màu',
            removeBackground: 'Xóa nền',
            clear: 'Xóa kiểu'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        standardPreset: 'Chuẩn',
        compactPreset: 'Gọn',
        defaultSuffix: '(mặc định)',
        titleRows: 'Dòng tiêu đề',
        previewRows: 'Dòng xem trước',
        groupBy: 'Nhóm theo',
        defaultOption: (rows: number) => `Mặc định (${rows})`,
        defaultTitleOption: (rows: number) => `Dòng tiêu đề mặc định (${rows})`,
        defaultPreviewOption: (rows: number) => `Dòng xem trước mặc định (${rows})`,
        defaultGroupOption: (groupLabel: string) => `Nhóm mặc định (${groupLabel})`,
        titleRowOption: (rows: number) => `${rows} dòng tiêu đề`,
        previewRowOption: (rows: number) => `${rows} dòng xem trước`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'Tìm biểu tượng...',
            recentlyUsedHeader: 'Dùng gần đây',
            emptyStateSearch: 'Bắt đầu nhập để tìm biểu tượng',
            emptyStateNoResults: 'Không tìm thấy biểu tượng',
            showingResultsInfo: 'Hiển thị 50 trong {count} kết quả. Nhập thêm để thu hẹp.',
            emojiInstructions: 'Nhập hoặc dán bất kỳ emoji nào để dùng làm biểu tượng',
            removeIcon: 'Gỡ biểu tượng',
            allTabLabel: 'Tất cả'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Thêm quy tắc'
        },
        interfaceIcons: {
            title: 'Biểu tượng giao diện',
            items: {
                'nav-shortcuts': 'Phím tắt',
                'nav-recent-files': 'Tệp gần đây',
                'nav-expand-all': 'Mở rộng tất cả',
                'nav-collapse-all': 'Thu gọn tất cả',
                'nav-tree-expand': 'Mũi tên cây: mở rộng',
                'nav-tree-collapse': 'Mũi tên cây: thu gọn',
                'nav-hidden-items': 'Mục ẩn',
                'nav-root-reorder': 'Sắp xếp lại thư mục gốc',
                'nav-new-folder': 'Thư mục mới',
                'nav-show-single-pane': 'Hiện một ngăn',
                'nav-show-dual-pane': 'Hiện hai ngăn',
                'nav-profile-chevron': 'Mũi tên menu hồ sơ',
                'list-search': 'Tìm kiếm',
                'list-descendants': 'Ghi chú từ thư mục con',
                'list-sort-ascending': 'Thứ tự: tăng dần',
                'list-sort-descending': 'Thứ tự: giảm dần',
                'list-appearance': 'Thay đổi giao diện',
                'list-new-note': 'Ghi chú mới',
                'nav-folder-open': 'Thư mục mở',
                'nav-folder-closed': 'Thư mục đóng',
                'nav-tag': 'Thẻ',
                'list-pinned': 'Mục đã ghim'
            }
        },
        colorPicker: {
            currentColor: 'Hiện tại',
            newColor: 'Mới',
            presetColors: 'Màu có sẵn',
            userColors: 'Màu người dùng',
            paletteDefault: 'Mặc định',
            paletteCustom: 'Tùy chỉnh',
            copyColors: 'Sao chép màu',
            colorsCopied: 'Đã sao chép màu vào clipboard',
            copyClipboardError: 'Không thể ghi vào clipboard',
            pasteColors: 'Dán màu',
            pasteClipboardError: 'Không thể đọc clipboard',
            pasteInvalidJson: 'Clipboard không chứa văn bản hợp lệ',
            pasteInvalidFormat: 'Yêu cầu giá trị màu hex',
            colorsPasted: 'Đã dán màu thành công',
            resetUserColors: 'Xóa màu tùy chỉnh',
            clearCustomColorsConfirm: 'Xóa tất cả màu tùy chỉnh?',
            userColorSlot: 'Màu {slot}',
            recentColors: 'Màu gần đây',
            clearRecentColors: 'Xóa màu gần đây',
            removeRecentColor: 'Gỡ màu',
            removeColor: 'Gỡ màu',
            apply: 'Áp dụng',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'Đỏ',
                orange: 'Cam',
                amber: 'Hổ phách',
                yellow: 'Vàng',
                lime: 'Chanh',
                green: 'Xanh lá',
                emerald: 'Ngọc lục bảo',
                teal: 'Xanh mòng két',
                cyan: 'Xanh lơ',
                sky: 'Xanh trời',
                blue: 'Xanh dương',
                indigo: 'Chàm',
                violet: 'Tím',
                purple: 'Tía',
                fuchsia: 'Hồng sẫm',
                pink: 'Hồng',
                rose: 'Hồng đào',
                gray: 'Xám',
                slate: 'Xám đá',
                stone: 'Đá'
            }
        },
        selectVaultProfile: {
            title: 'Chọn hồ sơ vault',
            currentBadge: 'Đang dùng',
            emptyState: 'Không có hồ sơ vault.'
        },
        tagOperation: {
            renameTitle: 'Đổi tên thẻ {tag}',
            deleteTitle: 'Xóa thẻ {tag}',
            newTagPrompt: 'Tên thẻ mới',
            newTagPlaceholder: 'Nhập tên thẻ mới',
            renameWarning: 'Đổi tên thẻ {oldTag} sẽ sửa đổi {count} {files}.',
            deleteWarning: 'Xóa thẻ {tag} sẽ sửa đổi {count} {files}.',
            modificationWarning: 'Điều này sẽ cập nhật ngày sửa đổi tệp.',
            affectedFiles: 'Các tệp bị ảnh hưởng:',
            andMore: '...và {count} nữa',
            confirmRename: 'Đổi tên thẻ',
            renameUnchanged: '{tag} không đổi',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            invalidTagName: 'Nhập tên thẻ hợp lệ.',
            descendantRenameError: 'Không thể di chuyển thẻ vào chính nó hoặc phần tử con.',
            confirmDelete: 'Xóa thẻ',
            file: 'tệp',
            files: 'tệp'
        },
        fileSystem: {
            newFolderTitle: 'Thư mục mới',
            renameFolderTitle: 'Đổi tên thư mục',
            renameFileTitle: 'Đổi tên tệp',
            deleteFolderTitle: "Xóa '{name}'?",
            deleteFileTitle: "Xóa '{name}'?",
            folderNamePrompt: 'Nhập tên thư mục:',
            hideInOtherVaultProfiles: 'Ẩn trong các hồ sơ vault khác',
            renamePrompt: 'Nhập tên mới:',
            renameVaultTitle: 'Đổi tên hiển thị vault',
            renameVaultPrompt: 'Nhập tên hiển thị tùy chỉnh (để trống để dùng mặc định):',
            deleteFolderConfirm: 'Bạn có chắc muốn xóa thư mục này và tất cả nội dung?',
            deleteFileConfirm: 'Bạn có chắc muốn xóa tệp này?',
            removeAllTagsTitle: 'Gỡ tất cả thẻ',
            removeAllTagsFromNote: 'Bạn có chắc muốn gỡ tất cả thẻ khỏi ghi chú này?',
            removeAllTagsFromNotes: 'Bạn có chắc muốn gỡ tất cả thẻ khỏi {count} ghi chú?'
        },
        folderNoteType: {
            title: 'Chọn loại ghi chú thư mục',
            folderLabel: 'Thư mục: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `Di chuyển ${name} đến thư mục...`,
            multipleFilesLabel: (count: number) => `${count} tệp`,
            navigatePlaceholder: 'Chuyển đến thư mục...',
            instructions: {
                navigate: 'để điều hướng',
                move: 'để di chuyển',
                select: 'để chọn',
                dismiss: 'để đóng'
            }
        },
        homepage: {
            placeholder: 'Tìm tệp...',
            instructions: {
                navigate: 'để điều hướng',
                select: 'để đặt trang chủ',
                dismiss: 'để đóng'
            }
        },
        navigationBanner: {
            placeholder: 'Tìm ảnh...',
            instructions: {
                navigate: 'để điều hướng',
                select: 'để đặt banner',
                dismiss: 'để đóng'
            }
        },
        tagSuggest: {
            placeholder: 'Tìm thẻ...',
            navigatePlaceholder: 'Chuyển đến thẻ...',
            addPlaceholder: 'Tìm thẻ để thêm...',
            removePlaceholder: 'Chọn thẻ để gỡ...',
            createNewTag: 'Tạo thẻ mới: #{tag}',
            instructions: {
                navigate: 'để điều hướng',
                select: 'để chọn',
                dismiss: 'để đóng',
                add: 'để thêm thẻ',
                remove: 'để gỡ thẻ'
            }
        },
        welcome: {
            title: 'Chào mừng đến với {pluginName}',
            introText:
                'Xin chào! Trước khi bắt đầu, tôi khuyên bạn nên xem năm phút đầu tiên của video bên dưới để hiểu cách hoạt động của các bảng điều khiển và nút chuyển đổi "Hiển thị ghi chú từ thư mục con".',
            continueText:
                'Nếu bạn có thêm năm phút nữa, hãy tiếp tục xem video để hiểu các chế độ hiển thị thu gọn và cách thiết lập phím tắt và các phím nóng quan trọng một cách chính xác.',
            thanksText: 'Cảm ơn bạn rất nhiều vì đã tải xuống, chúc bạn sử dụng vui vẻ!',
            videoAlt: 'Cài đặt và làm chủ Notebook Navigator',
            openVideoButton: 'Phát video',
            closeButton: 'Để sau xem'
        }
    },
    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'Không thể tạo thư mục: {error}',
            createFile: 'Không thể tạo tệp: {error}',
            renameFolder: 'Không thể đổi tên thư mục: {error}',
            renameFolderNoteConflict: 'Không thể đổi tên: "{name}" đã tồn tại trong thư mục này',
            renameFile: 'Không thể đổi tên tệp: {error}',
            deleteFolder: 'Không thể xóa thư mục: {error}',
            deleteFile: 'Không thể xóa tệp: {error}',
            duplicateNote: 'Không thể nhân bản ghi chú: {error}',
            createCanvas: 'Không thể tạo canvas: {error}',
            createDatabase: 'Không thể tạo cơ sở dữ liệu: {error}',
            duplicateFolder: 'Không thể nhân bản thư mục: {error}',
            openVersionHistory: 'Không thể mở lịch sử phiên bản: {error}',
            versionHistoryNotFound: 'Không tìm thấy lệnh lịch sử phiên bản. Đảm bảo Obsidian Sync đã bật.',
            revealInExplorer: 'Không thể hiện tệp trong trình quản lý hệ thống: {error}',
            folderNoteAlreadyExists: 'Ghi chú thư mục đã tồn tại',
            folderAlreadyExists: 'Thư mục "{name}" đã tồn tại',
            folderNotesDisabled: 'Bật ghi chú thư mục trong cài đặt để chuyển đổi tệp',
            folderNoteAlreadyLinked: 'Tệp này đã hoạt động như ghi chú thư mục',
            folderNoteNotFound: 'Không có ghi chú thư mục trong thư mục đã chọn',
            folderNoteUnsupportedExtension: 'Phần mở rộng tệp không được hỗ trợ: {extension}',
            folderNoteMoveFailed: 'Không thể di chuyển tệp khi chuyển đổi: {error}',
            folderNoteRenameConflict: 'Tệp có tên "{name}" đã tồn tại trong thư mục',
            folderNoteConversionFailed: 'Không thể chuyển đổi tệp thành ghi chú thư mục',
            folderNoteConversionFailedWithReason: 'Không thể chuyển đổi tệp thành ghi chú thư mục: {error}',
            folderNoteOpenFailed: 'Đã chuyển đổi tệp nhưng không thể mở ghi chú thư mục: {error}',
            failedToDeleteFile: 'Không thể xóa {name}: {error}',
            failedToDeleteMultipleFiles: 'Không thể xóa {count} tệp',
            versionHistoryNotAvailable: 'Dịch vụ lịch sử phiên bản không khả dụng',
            drawingAlreadyExists: 'Bản vẽ với tên này đã tồn tại',
            failedToCreateDrawing: 'Không thể tạo bản vẽ',
            noFolderSelected: 'Chưa chọn thư mục trong Notebook Navigator',
            noFileSelected: 'Chưa chọn tệp'
        },
        warnings: {
            linkBreakingNameCharacters: 'Tên này chứa ký tự làm hỏng liên kết Obsidian: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'Tên không thể bắt đầu bằng dấu chấm hoặc chứa : hoặc /.',
            forbiddenNameCharactersWindows: 'Ký tự được Windows dành riêng không được phép: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'Đã ẩn thư mục: {name}',
            showFolder: 'Đã hiện thư mục: {name}'
        },
        notifications: {
            deletedMultipleFiles: 'Đã xóa {count} tệp',
            movedMultipleFiles: 'Đã di chuyển {count} tệp đến {folder}',
            folderNoteConversionSuccess: 'Đã chuyển đổi tệp thành ghi chú thư mục trong "{name}"',
            folderMoved: 'Đã di chuyển thư mục "{name}"',
            deepLinkCopied: 'Đã sao chép URL Obsidian vào clipboard',
            pathCopied: 'Đã sao chép đường dẫn vào clipboard',
            relativePathCopied: 'Đã sao chép đường dẫn tương đối vào clipboard',
            tagAddedToNote: 'Đã thêm thẻ vào 1 ghi chú',
            tagAddedToNotes: 'Đã thêm thẻ vào {count} ghi chú',
            tagRemovedFromNote: 'Đã gỡ thẻ khỏi 1 ghi chú',
            tagRemovedFromNotes: 'Đã gỡ thẻ khỏi {count} ghi chú',
            tagsClearedFromNote: 'Đã xóa tất cả thẻ khỏi 1 ghi chú',
            tagsClearedFromNotes: 'Đã xóa tất cả thẻ khỏi {count} ghi chú',
            noTagsToRemove: 'Không có thẻ để gỡ',
            noFilesSelected: 'Chưa chọn tệp',
            tagOperationsNotAvailable: 'Thao tác thẻ không khả dụng',
            tagsRequireMarkdown: 'Thẻ chỉ được hỗ trợ trên ghi chú Markdown',
            iconPackDownloaded: 'Đã tải {provider}',
            iconPackUpdated: 'Đã cập nhật {provider} ({version})',
            iconPackRemoved: 'Đã gỡ {provider}',
            iconPackLoadFailed: 'Không thể tải {provider}',
            hiddenFileReveal: 'Tệp bị ẩn. Bật "Hiện mục ẩn" để hiển thị'
        },
        confirmations: {
            deleteMultipleFiles: 'Bạn có chắc muốn xóa {count} tệp?',
            deleteConfirmation: 'Hành động này không thể hoàn tác.'
        },
        defaultNames: {
            untitled: 'Chưa đặt tên',
            untitledNumber: 'Chưa đặt tên {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Không thể di chuyển thư mục vào chính nó hoặc thư mục con.',
            itemAlreadyExists: 'Mục có tên "{name}" đã tồn tại ở vị trí này.',
            failedToMove: 'Không thể di chuyển: {error}',
            failedToAddTag: 'Không thể thêm thẻ "{tag}"',
            failedToClearTags: 'Không thể xóa thẻ',
            failedToMoveFolder: 'Không thể di chuyển thư mục "{name}"',
            failedToImportFiles: 'Không thể nhập: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} tệp đã tồn tại ở đích',
            addedTag: 'Đã thêm thẻ "{tag}" vào {count} tệp',
            filesAlreadyHaveTag: '{count} tệp đã có thẻ này hoặc thẻ cụ thể hơn',
            clearedTags: 'Đã xóa tất cả thẻ khỏi {count} tệp',
            noTagsToClear: 'Không có thẻ để xóa',
            fileImported: 'Đã nhập 1 tệp',
            filesImported: 'Đã nhập {count} tệp'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'Hôm nay',
        yesterday: 'Hôm qua',
        previous7Days: '7 ngày trước',
        previous30Days: '30 ngày trước'
    },

    // Weekdays
    weekdays: {
        sunday: 'Chủ nhật',
        monday: 'Thứ hai',
        tuesday: 'Thứ ba',
        wednesday: 'Thứ tư',
        thursday: 'Thứ năm',
        friday: 'Thứ sáu',
        saturday: 'Thứ bảy'
    },

    // Plugin commands
    commands: {
        open: 'Mở', // Command palette: Opens the Notebook Navigator view (English: Open)
        openHomepage: 'Mở trang chủ', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        revealFile: 'Hiện tệp', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Tìm kiếm', // Command palette: Toggle search in the file list (English: Search)
        toggleDualPane: 'Bật/tắt hai ngăn', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        selectVaultProfile: 'Chọn hồ sơ vault', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'Chọn hồ sơ vault 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Chọn hồ sơ vault 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Chọn hồ sơ vault 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Xóa tệp', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Tạo ghi chú mới', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Ghi chú mới từ mẫu', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Di chuyển tệp', // Command palette: Move selected files to another folder (English: Move files)
        selectNextFile: 'Chọn tệp tiếp theo', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Chọn tệp trước', // Command palette: Selects the previous file in the current view (English: Select previous file)
        convertToFolderNote: 'Chuyển thành ghi chú thư mục', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Đặt làm ghi chú thư mục', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Tách ghi chú thư mục', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Ghim tất cả ghi chú thư mục', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Chuyển đến thư mục', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Chuyển đến thẻ', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        addShortcut: 'Thêm vào lối tắt', // Command palette: Adds the current file, folder, or tag to shortcuts (English: Add to shortcuts)
        openShortcut: 'Mở lối tắt {number}',
        toggleDescendants: 'Bật/tắt phần tử con', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Bật/tắt thư mục, thẻ và ghi chú ẩn', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Bật/tắt sắp xếp thẻ', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        collapseExpand: 'Thu gọn / mở rộng tất cả', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        addTag: 'Thêm thẻ vào tệp đã chọn', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        removeTag: 'Gỡ thẻ khỏi tệp đã chọn', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Gỡ tất cả thẻ khỏi tệp đã chọn', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        rebuildCache: 'Xây dựng lại cache' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Hiện trong Notebook Navigator' // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Sửa đổi lần cuối',
        createdAt: 'Tạo lúc',
        file: 'tệp',
        files: 'tệp',
        folder: 'thư mục',
        folders: 'thư mục'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'Báo cáo metadata thất bại đã xuất đến: {filename}',
            exportFailed: 'Không thể xuất báo cáo metadata'
        },
        sections: {
            general: 'Chung',
            navigationPane: 'Ngăn điều hướng',
            icons: 'Gói biểu tượng',
            folders: 'Thư mục',
            foldersAndTags: 'Thư mục & thẻ',
            tags: 'Thẻ',
            search: 'Tìm kiếm',
            searchAndHotkeys: 'Tìm kiếm & phím tắt',
            listPane: 'Ngăn danh sách',
            notes: 'Ghi chú',
            hotkeys: 'Phím tắt',
            advanced: 'Nâng cao'
        },
        groups: {
            general: {
                filtering: 'Lọc',
                behavior: 'Hành vi',
                view: 'Giao diện',
                icons: 'Biểu tượng',
                desktopAppearance: 'Giao diện máy tính',
                formatting: 'Định dạng'
            },
            navigation: {
                appearance: 'Giao diện',
                shortcutsAndRecent: 'Phím tắt và mục gần đây'
            },
            list: {
                display: 'Giao diện',
                pinnedNotes: 'Ghi chú đã ghim',
                quickActions: 'Thao tác nhanh'
            },
            notes: {
                frontmatter: 'Frontmatter',
                icon: 'Biểu tượng',
                title: 'Tiêu đề',
                previewText: 'Văn bản xem trước',
                featureImage: 'Hình ảnh nổi bật',
                tags: 'Thẻ',
                date: 'Ngày',
                parentFolder: 'Thư mục cha'
            }
        },
        items: {
            searchProvider: {
                name: 'Nhà cung cấp tìm kiếm',
                desc: 'Chọn giữa tìm kiếm nhanh theo tên tệp hoặc tìm kiếm toàn văn với plugin Omnisearch. (không đồng bộ)',
                options: {
                    internal: 'Tìm kiếm lọc',
                    omnisearch: 'Omnisearch (toàn văn)'
                },
                info: {
                    filterSearch: {
                        title: 'Tìm kiếm lọc (mặc định):',
                        description:
                            'Lọc tệp theo tên và thẻ trong thư mục hiện tại và thư mục con. Chế độ lọc: văn bản và thẻ hỗn hợp khớp với tất cả các điều kiện (ví dụ: "dự án #công việc"). Chế độ thẻ: tìm kiếm chỉ với thẻ hỗ trợ toán tử AND/OR (ví dụ: "#công việc AND #khẩn cấp", "#dự án OR #cá nhân"). Cmd/Ctrl+Nhấp vào thẻ để thêm với AND, Cmd/Ctrl+Shift+Nhấp để thêm với OR. Hỗ trợ loại trừ với tiền tố ! (ví dụ: !nháp, !#lưu trữ) và tìm ghi chú không có thẻ với !#.'
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            'Tìm kiếm toàn văn trong toàn bộ vault, sau đó lọc kết quả để chỉ hiển thị tệp từ thư mục hiện tại, thư mục con hoặc thẻ đã chọn. Yêu cầu cài đặt plugin Omnisearch - nếu không có, tìm kiếm sẽ tự động chuyển về Tìm kiếm lọc.',
                        warningNotInstalled: 'Chưa cài plugin Omnisearch. Đang dùng Tìm kiếm lọc.',
                        limitations: {
                            title: 'Hạn chế đã biết:',
                            performance: 'Hiệu suất: Có thể chậm, đặc biệt khi tìm ít hơn 3 ký tự trong vault lớn',
                            pathBug:
                                'Lỗi đường dẫn: Không thể tìm trong đường dẫn có ký tự non-ASCII và không tìm đúng đường dẫn con, ảnh hưởng đến tệp xuất hiện trong kết quả',
                            limitedResults:
                                'Kết quả giới hạn: Vì Omnisearch tìm toàn bộ vault và trả về số kết quả giới hạn trước khi lọc, tệp liên quan từ thư mục hiện tại có thể không xuất hiện nếu có quá nhiều kết quả ở nơi khác',
                            previewText:
                                'Văn bản xem trước: Xem trước ghi chú được thay bằng trích đoạn kết quả Omnisearch, có thể không hiển thị đúng highlight nếu nó xuất hiện ở nơi khác trong tệp'
                        }
                    }
                }
            },
            listPaneTitle: {
                name: 'Tiêu đề ngăn danh sách (chỉ máy tính)',
                desc: 'Chọn nơi hiển thị tiêu đề ngăn danh sách.',
                options: {
                    header: 'Hiện ở header',
                    list: 'Hiện ở ngăn danh sách',
                    hidden: 'Không hiện'
                }
            },
            sortNotesBy: {
                name: 'Sắp xếp ghi chú theo',
                desc: 'Chọn cách sắp xếp ghi chú trong danh sách.',
                options: {
                    'modified-desc': 'Ngày sửa (mới nhất trên)',
                    'modified-asc': 'Ngày sửa (cũ nhất trên)',
                    'created-desc': 'Ngày tạo (mới nhất trên)',
                    'created-asc': 'Ngày tạo (cũ nhất trên)',
                    'title-asc': 'Tiêu đề (A trên)',
                    'title-desc': 'Tiêu đề (Z trên)'
                }
            },
            revealFileOnListChanges: {
                name: 'Cuộn đến tệp đã chọn khi danh sách thay đổi',
                desc: 'Cuộn đến tệp đã chọn khi ghim ghi chú, hiện ghi chú con, đổi giao diện thư mục hoặc thao tác tệp.'
            },
            includeDescendantNotes: {
                name: 'Hiện ghi chú từ thư mục con / phần tử con (không đồng bộ)',
                desc: 'Bao gồm ghi chú từ thư mục con lồng nhau và phần tử con của thẻ khi xem thư mục hoặc thẻ.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Giới hạn ghi chú đã ghim trong thư mục của chúng',
                desc: 'Ghi chú đã ghim chỉ xuất hiện khi xem thư mục hoặc thẻ nơi chúng được ghim.'
            },
            separateNoteCounts: {
                name: 'Hiện số lượng hiện tại và con riêng biệt',
                desc: 'Hiển thị số lượng ghi chú theo định dạng "hiện tại ▾ con" trong thư mục và thẻ.'
            },
            groupNotes: {
                name: 'Nhóm ghi chú',
                desc: 'Hiển thị header giữa các ghi chú được nhóm theo ngày hoặc thư mục. Chế độ xem thẻ dùng nhóm ngày khi bật nhóm thư mục.',
                options: {
                    none: 'Không nhóm',
                    date: 'Nhóm theo ngày',
                    folder: 'Nhóm theo thư mục'
                }
            },
            showPinnedGroupHeader: {
                name: 'Hiện header nhóm đã ghim',
                desc: 'Hiển thị header phần đã ghim phía trên ghi chú đã ghim.'
            },
            showPinnedIcon: {
                name: 'Hiện biểu tượng đã ghim',
                desc: 'Hiện biểu tượng bên cạnh header phần đã ghim.'
            },
            defaultListMode: {
                name: 'Chế độ danh sách mặc định',
                desc: 'Chọn bố cục danh sách mặc định. Chuẩn hiện tiêu đề, ngày, mô tả và văn bản xem trước. Gọn chỉ hiện tiêu đề. Ghi đè giao diện theo thư mục.',
                options: {
                    standard: 'Chuẩn',
                    compact: 'Gọn'
                }
            },
            showFileIcons: {
                name: 'Hiện biểu tượng tệp',
                desc: 'Hiển thị biểu tượng tệp với khoảng cách căn trái. Tắt sẽ gỡ cả biểu tượng và thụt lề. Ưu tiên: tùy chỉnh > tên tệp > loại tệp > mặc định.'
            },
            showFilenameMatchIcons: {
                name: 'Biểu tượng theo tên tệp',
                desc: 'Gán biểu tượng cho tệp dựa trên văn bản trong tên.'
            },
            fileNameIconMap: {
                name: 'Bản đồ biểu tượng tên tệp',
                desc: 'Tệp chứa văn bản sẽ nhận biểu tượng được chỉ định. Một ánh xạ mỗi dòng: văn bản=biểu tượng',
                placeholder: '# văn bản=biểu tượng\nhọp=LiCalendar\nhóa đơn=PhReceipt',
                editTooltip: 'Chỉnh sửa ánh xạ'
            },
            showCategoryIcons: {
                name: 'Biểu tượng theo loại tệp',
                desc: 'Gán biểu tượng cho tệp dựa trên phần mở rộng.'
            },
            fileTypeIconMap: {
                name: 'Bản đồ biểu tượng loại tệp',
                desc: 'Tệp có phần mở rộng sẽ nhận biểu tượng được chỉ định. Một ánh xạ mỗi dòng: phần mở rộng=biểu tượng',
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: 'Chỉnh sửa ánh xạ'
            },
            optimizeNoteHeight: {
                name: 'Chiều cao ghi chú thay đổi',
                desc: 'Sử dụng chiều cao gọn cho ghi chú đã ghim và ghi chú không có văn bản xem trước.'
            },
            compactItemHeight: {
                name: 'Chiều cao mục gọn',
                desc: 'Đặt chiều cao mục danh sách gọn trên máy tính và di động.',
                resetTooltip: 'Đặt lại mặc định (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Co chữ theo chiều cao mục gọn',
                desc: 'Co chữ danh sách gọn khi giảm chiều cao mục.'
            },
            showParentFolder: {
                name: 'Hiện thư mục cha',
                desc: 'Hiển thị tên thư mục cha cho ghi chú trong thư mục con hoặc thẻ.'
            },
            parentFolderClickRevealsFile: {
                name: 'Nhấn thư mục cha để mở thư mục',
                desc: 'Nhấn nhãn thư mục cha sẽ mở thư mục trong bảng danh sách.'
            },
            showParentFolderColor: {
                name: 'Hiện màu thư mục cha',
                desc: 'Dùng màu thư mục trên nhãn thư mục cha.'
            },
            showQuickActions: {
                name: 'Hiện thao tác nhanh (chỉ máy tính)',
                desc: 'Hiện nút thao tác khi di chuột qua tệp. Điều khiển nút chọn thao tác xuất hiện.'
            },
            dualPane: {
                name: 'Bố cục hai ngăn (không đồng bộ)',
                desc: 'Hiện ngăn điều hướng và ngăn danh sách cạnh nhau trên máy tính.'
            },
            dualPaneOrientation: {
                name: 'Hướng hai ngăn (không đồng bộ)',
                desc: 'Chọn bố cục ngang hoặc dọc khi bật hai ngăn.',
                options: {
                    horizontal: 'Chia ngang',
                    vertical: 'Chia dọc'
                }
            },
            appearanceBackground: {
                name: 'Màu nền',
                desc: 'Chọn màu nền cho ngăn điều hướng và danh sách.',
                options: {
                    separate: 'Nền riêng',
                    primary: 'Dùng nền danh sách',
                    secondary: 'Dùng nền điều hướng'
                }
            },
            appearanceScale: {
                name: 'Mức thu phóng (không đồng bộ)',
                desc: 'Điều khiển mức thu phóng tổng thể của Notebook Navigator.'
            },
            startView: {
                name: 'Chế độ xem khởi động mặc định',
                desc: 'Chọn ngăn hiển thị khi mở Notebook Navigator. Ngăn điều hướng hiện lối tắt, ghi chú gần đây và cây thư mục. Ngăn danh sách hiện danh sách ghi chú ngay.',
                options: {
                    navigation: 'Ngăn điều hướng',
                    files: 'Ngăn danh sách'
                }
            },
            toolbarButtons: {
                name: 'Nút thanh công cụ',
                desc: 'Chọn nút xuất hiện trên thanh công cụ. Nút ẩn vẫn truy cập được qua lệnh và menu.',
                navigationLabel: 'Thanh công cụ điều hướng',
                listLabel: 'Thanh công cụ danh sách'
            },
            autoRevealActiveNote: {
                name: 'Tự động hiện ghi chú đang hoạt động',
                desc: 'Tự động hiện ghi chú khi mở từ Quick Switcher, liên kết hoặc tìm kiếm.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Bỏ qua sự kiện từ thanh bên phải',
                desc: 'Không đổi ghi chú đang hoạt động khi nhấn hoặc đổi ghi chú ở thanh bên phải.'
            },
            paneTransitionDuration: {
                name: 'Hoạt ảnh ngăn đơn',
                desc: 'Thời lượng chuyển đổi khi chuyển giữa các ngăn trong chế độ ngăn đơn (mili giây).',
                resetTooltip: 'Đặt lại mặc định'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Tự động chọn ghi chú đầu tiên (chỉ máy tính)',
                desc: 'Tự động mở ghi chú đầu tiên khi chuyển thư mục hoặc thẻ.'
            },
            skipAutoScroll: {
                name: 'Tắt tự động cuộn cho lối tắt',
                desc: 'Không cuộn ngăn điều hướng khi nhấn mục trong lối tắt.'
            },
            autoExpandFoldersTags: {
                name: 'Mở rộng khi chọn',
                desc: 'Mở rộng thư mục và thẻ khi chọn. Ở chế độ một ngăn, chọn lần đầu mở rộng, chọn lần hai hiện tệp.'
            },
            springLoadedFolders: {
                name: 'Mở rộng khi kéo (chỉ máy tính)',
                desc: 'Mở rộng thư mục và thẻ khi di chuột qua trong lúc kéo.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Độ trễ mở rộng lần đầu',
                desc: 'Độ trễ trước khi thư mục hoặc thẻ đầu tiên được mở rộng trong lúc kéo (giây).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Độ trễ mở rộng tiếp theo',
                desc: 'Độ trễ trước khi mở rộng thêm thư mục hoặc thẻ trong cùng một lần kéo (giây).'
            },
            navigationBanner: {
                name: 'Banner điều hướng (hồ sơ vault)',
                desc: 'Hiển thị ảnh phía trên ngăn điều hướng. Thay đổi theo hồ sơ vault đã chọn.',
                current: 'Banner hiện tại: {path}',
                chooseButton: 'Chọn ảnh'
            },
            showShortcuts: {
                name: 'Hiện lối tắt',
                desc: 'Hiển thị phần lối tắt trong ngăn điều hướng.'
            },
            shortcutBadgeDisplay: {
                name: 'Huy hiệu lối tắt',
                desc: "Nội dung hiển thị bên cạnh lối tắt. Sử dụng lệnh 'Mở lối tắt 1-9' để mở lối tắt trực tiếp.",
                options: {
                    index: 'Vị trí (1-9)',
                    count: 'Số lượng mục',
                    none: 'Không có'
                }
            },
            showRecentNotes: {
                name: 'Hiện ghi chú gần đây',
                desc: 'Hiển thị phần ghi chú gần đây trong ngăn điều hướng.'
            },
            recentNotesCount: {
                name: 'Số lượng ghi chú gần đây',
                desc: 'Số ghi chú gần đây để hiển thị.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Ghim ghi chú gần đây cùng lối tắt',
                desc: 'Bao gồm ghi chú gần đây khi lối tắt được ghim.'
            },
            showTooltips: {
                name: 'Hiện chú thích',
                desc: 'Hiển thị chú thích khi di chuột với thông tin bổ sung cho ghi chú và thư mục.'
            },
            showTooltipPath: {
                name: 'Hiện đường dẫn',
                desc: 'Hiển thị đường dẫn thư mục bên dưới tên ghi chú trong chú thích.'
            },
            resetPaneSeparator: {
                name: 'Đặt lại vị trí thanh phân cách',
                desc: 'Đặt lại thanh phân cách kéo được giữa ngăn điều hướng và ngăn danh sách về vị trí mặc định.',
                buttonText: 'Đặt lại thanh phân cách',
                notice: 'Đã đặt lại vị trí thanh phân cách. Khởi động lại Obsidian hoặc mở lại Notebook Navigator để áp dụng.'
            },
            multiSelectModifier: {
                name: 'Phím bổ trợ chọn nhiều (chỉ máy tính)',
                desc: 'Chọn phím bổ trợ để bật/tắt chọn nhiều. Khi chọn Option/Alt, nhấn Cmd/Ctrl mở ghi chú trong tab mới.',
                options: {
                    cmdCtrl: 'Nhấn Cmd/Ctrl',
                    optionAlt: 'Nhấn Option/Alt'
                }
            },
            fileVisibility: {
                name: 'Hiện loại tệp (hồ sơ vault)',
                desc: 'Lọc loại tệp hiển thị trong trình điều hướng. Loại tệp không được Obsidian hỗ trợ có thể mở bằng ứng dụng ngoài.',
                options: {
                    documents: 'Tài liệu (.md, .canvas, .base)',
                    supported: 'Được hỗ trợ (mở trong Obsidian)',
                    all: 'Tất cả (có thể mở ngoài)'
                }
            },
            homepage: {
                name: 'Trang chủ',
                desc: 'Chọn tệp mà Notebook Navigator mở tự động, như bảng điều khiển.',
                current: 'Hiện tại: {path}',
                currentMobile: 'Di động: {path}',
                chooseButton: 'Chọn tệp',

                separateMobile: {
                    name: 'Trang chủ di động riêng',
                    desc: 'Dùng trang chủ khác cho thiết bị di động.'
                }
            },
            excludedNotes: {
                name: 'Ẩn ghi chú (hồ sơ vault)',
                desc: 'Danh sách thuộc tính frontmatter phân cách bằng dấu phẩy. Ghi chú chứa bất kỳ thuộc tính nào sẽ bị ẩn (ví dụ: nháp, riêng tư, lưu trữ).',
                placeholder: 'nháp, riêng tư'
            },
            excludedFileNamePatterns: {
                name: 'Ẩn tệp (hồ sơ vault)',
                desc: 'Danh sách mẫu tên tệp phân cách bằng dấu phẩy để ẩn. Hỗ trợ ký tự đại diện * và đường dẫn / (ví dụ: temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Hồ sơ vault',
                desc: 'Hồ sơ lưu trữ hiển thị loại tệp, tệp ẩn, thư mục ẩn, thẻ ẩn, ghi chú ẩn, lối tắt và banner điều hướng. Chuyển hồ sơ từ header ngăn điều hướng.',
                defaultName: 'Mặc định',
                addButton: 'Thêm hồ sơ',
                editProfilesButton: 'Sửa hồ sơ',
                addProfileOption: 'Thêm hồ sơ...',
                applyButton: 'Áp dụng',
                editButton: 'Sửa hồ sơ',
                deleteButton: 'Xóa hồ sơ',
                addModalTitle: 'Thêm hồ sơ',
                editProfilesModalTitle: 'Sửa hồ sơ',
                editModalTitle: 'Sửa hồ sơ',
                addModalPlaceholder: 'Tên hồ sơ',
                deleteModalTitle: 'Xóa {name}',
                deleteModalMessage: 'Gỡ {name}? Bộ lọc tệp, thư mục, thẻ và ghi chú ẩn được lưu trong hồ sơ này sẽ bị xóa.',
                moveUp: 'Di chuyển lên',
                moveDown: 'Di chuyển xuống',
                errors: {
                    emptyName: 'Nhập tên hồ sơ',
                    duplicateName: 'Tên hồ sơ đã tồn tại'
                }
            },
            vaultTitle: {
                name: 'Vị trí tiêu đề vault (chỉ máy tính)',
                desc: 'Chọn nơi tiêu đề vault được hiển thị.',
                options: {
                    header: 'Hiển thị ở tiêu đề',
                    navigation: 'Hiển thị trong bảng điều hướng'
                }
            },
            excludedFolders: {
                name: 'Ẩn thư mục (hồ sơ vault)',
                desc: 'Danh sách thư mục cần ẩn phân cách bằng dấu phẩy. Mẫu tên: assets* (thư mục bắt đầu bằng assets), *_temp (kết thúc bằng _temp). Mẫu đường dẫn: /archive (chỉ archive gốc), /res* (thư mục gốc bắt đầu bằng res), /*/temp (thư mục temp ở độ sâu một cấp), /projects/* (tất cả thư mục trong projects).',
                placeholder: 'mẫu, assets*, /lưu trữ, /res*'
            },
            showFileDate: {
                name: 'Hiện ngày',
                desc: 'Hiển thị ngày bên dưới tên ghi chú.'
            },
            alphabeticalDateMode: {
                name: 'Khi sắp xếp theo tên',
                desc: 'Ngày hiển thị khi ghi chú được sắp xếp theo bảng chữ cái.',
                options: {
                    created: 'Ngày tạo',
                    modified: 'Ngày sửa'
                }
            },
            showFileTags: {
                name: 'Hiện thẻ tệp',
                desc: 'Hiển thị thẻ có thể nhấn trong mục tệp.'
            },
            showFileTagAncestors: {
                name: 'Hiện đường dẫn thẻ đầy đủ',
                desc: "Hiển thị đường dẫn phân cấp thẻ đầy đủ. Khi bật: 'ai/openai', 'công việc/dự án/2024'. Khi tắt: 'openai', '2024'."
            },
            colorFileTags: {
                name: 'Tô màu thẻ tệp',
                desc: 'Áp dụng màu thẻ cho huy hiệu thẻ trên mục tệp.'
            },
            prioritizeColoredFileTags: {
                name: 'Hiện thẻ có màu trước',
                desc: 'Sắp xếp thẻ có màu trước các thẻ khác trên mục tệp.'
            },
            showFileTagsInCompactMode: {
                name: 'Hiện thẻ tệp ở chế độ gọn',
                desc: 'Hiển thị thẻ khi ngày, xem trước và ảnh bị ẩn.'
            },
            dateFormat: {
                name: 'Định dạng ngày',
                desc: 'Định dạng hiển thị ngày (dùng định dạng date-fns).',
                placeholder: 'd MMM yyyy',
                help: 'Định dạng phổ biến:\nd MMM yyyy = 25 Th5 2022\ndd/MM/yyyy = 25/05/2022\nyyyy-MM-dd = 2022-05-25\n\nToken:\nyyyy/yy = năm\nMMMM/MMM/MM = tháng\ndd/d = ngày\nEEEE/EEE = thứ',
                helpTooltip: 'Nhấn để xem tham chiếu định dạng'
            },
            timeFormat: {
                name: 'Định dạng giờ',
                desc: 'Định dạng hiển thị giờ (dùng định dạng date-fns).',
                placeholder: 'HH:mm',
                help: 'Định dạng phổ biến:\nh:mm a = 2:30 PM (12 giờ)\nHH:mm = 14:30 (24 giờ)\nh:mm:ss a = 2:30:45 PM\nHH:mm:ss = 14:30:45\n\nToken:\nHH/H = 24 giờ\nhh/h = 12 giờ\nmm = phút\nss = giây\na = SA/CH',
                helpTooltip: 'Nhấn để xem tham chiếu định dạng'
            },
            showFilePreview: {
                name: 'Hiện xem trước ghi chú',
                desc: 'Hiển thị văn bản xem trước bên dưới tên ghi chú.'
            },
            skipHeadingsInPreview: {
                name: 'Bỏ qua tiêu đề trong xem trước',
                desc: 'Bỏ qua dòng tiêu đề khi tạo văn bản xem trước.'
            },
            skipCodeBlocksInPreview: {
                name: 'Bỏ qua khối code trong xem trước',
                desc: 'Bỏ qua khối code khi tạo văn bản xem trước.'
            },
            stripHtmlInPreview: {
                name: 'Xóa HTML trong xem trước',
                desc: 'Xóa thẻ HTML khỏi văn bản xem trước. Có thể ảnh hưởng đến hiệu suất với ghi chú lớn.'
            },
            previewProperties: {
                name: 'Thuộc tính xem trước',
                desc: 'Danh sách thuộc tính frontmatter phân cách bằng dấu phẩy để kiểm tra văn bản xem trước. Thuộc tính đầu tiên có văn bản sẽ được dùng.',
                placeholder: 'tóm tắt, mô tả, abstract',
                info: 'Nếu không tìm thấy văn bản xem trước trong các thuộc tính đã chỉ định, xem trước sẽ được tạo từ nội dung ghi chú.'
            },
            previewRows: {
                name: 'Dòng xem trước',
                desc: 'Số dòng hiển thị cho văn bản xem trước.',
                options: {
                    '1': '1 dòng',
                    '2': '2 dòng',
                    '3': '3 dòng',
                    '4': '4 dòng',
                    '5': '5 dòng'
                }
            },
            fileNameRows: {
                name: 'Dòng tiêu đề',
                desc: 'Số dòng hiển thị cho tiêu đề ghi chú.',
                options: {
                    '1': '1 dòng',
                    '2': '2 dòng'
                }
            },
            showFeatureImage: {
                name: 'Hiện ảnh nổi bật',
                desc: 'Hiển thị hình thu nhỏ của hình ảnh đầu tiên trong ghi chú.'
            },
            forceSquareFeatureImage: {
                name: 'Buộc ảnh nổi bật vuông',
                desc: 'Hiển thị ảnh nổi bật dạng thu nhỏ vuông.'
            },
            featureImageProperties: {
                name: 'Thuộc tính ảnh',
                desc: 'Danh sách thuộc tính frontmatter phân cách bằng dấu phẩy để kiểm tra ảnh thu nhỏ.',
                placeholder: 'thumbnail, featureResized, feature'
            },

            downloadExternalFeatureImages: {
                name: 'Tải hình ảnh bên ngoài',
                desc: 'Tải hình ảnh từ xa và hình thu nhỏ YouTube cho hình ảnh nổi bật.'
            },
            showRootFolder: {
                name: 'Hiện thư mục gốc',
                desc: 'Hiển thị tên vault làm thư mục gốc trong cây.'
            },
            showFolderIcons: {
                name: 'Hiện biểu tượng thư mục',
                desc: 'Hiển thị biểu tượng bên cạnh thư mục trong ngăn điều hướng.'
            },
            inheritFolderColors: {
                name: 'Kế thừa màu thư mục',
                desc: 'Thư mục con kế thừa màu từ thư mục cha.'
            },
            showNoteCount: {
                name: 'Hiện số lượng ghi chú',
                desc: 'Hiển thị số lượng ghi chú bên cạnh mỗi thư mục và thẻ.'
            },
            showSectionIcons: {
                name: 'Hiện biểu tượng cho lối tắt và mục gần đây',
                desc: 'Hiển thị biểu tượng cho các phần điều hướng như Lối tắt và Tệp gần đây.'
            },
            interfaceIcons: {
                name: 'Biểu tượng giao diện',
                desc: 'Chỉnh sửa biểu tượng thanh công cụ, thư mục, thẻ, đã ghim, tìm kiếm và sắp xếp.',
                buttonText: 'Chỉnh sửa biểu tượng'
            },
            showIconsColorOnly: {
                name: 'Chỉ áp dụng màu cho biểu tượng',
                desc: 'Khi bật, màu tùy chỉnh chỉ áp dụng cho biểu tượng. Khi tắt, màu áp dụng cho cả biểu tượng và nhãn văn bản.'
            },
            collapseBehavior: {
                name: 'Thu gọn mục',
                desc: 'Chọn nút mở rộng/thu gọn tất cả ảnh hưởng đến gì.',
                options: {
                    all: 'Tất cả thư mục và thẻ',
                    foldersOnly: 'Chỉ thư mục',
                    tagsOnly: 'Chỉ thẻ'
                }
            },
            smartCollapse: {
                name: 'Giữ mục đã chọn mở rộng',
                desc: 'Khi thu gọn, giữ thư mục hoặc thẻ đang chọn và cha của nó mở rộng.'
            },
            navIndent: {
                name: 'Thụt lề cây',
                desc: 'Điều chỉnh độ rộng thụt lề cho thư mục và thẻ lồng nhau.'
            },
            navItemHeight: {
                name: 'Chiều cao mục',
                desc: 'Điều chỉnh chiều cao của thư mục và thẻ trong ngăn điều hướng.'
            },
            navItemHeightScaleText: {
                name: 'Co chữ theo chiều cao mục',
                desc: 'Giảm cỡ chữ điều hướng khi giảm chiều cao mục.'
            },
            navRootSpacing: {
                name: 'Khoảng cách mục gốc',
                desc: 'Khoảng cách giữa các thư mục và thẻ cấp gốc.'
            },
            showTags: {
                name: 'Hiện thẻ',
                desc: 'Hiển thị phần thẻ trong trình điều hướng.'
            },
            showTagIcons: {
                name: 'Hiện biểu tượng thẻ',
                desc: 'Hiển thị biểu tượng bên cạnh thẻ trong ngăn điều hướng.'
            },
            inheritTagColors: {
                name: 'Kế thừa màu thẻ',
                desc: 'Thẻ con kế thừa màu từ thẻ cha.'
            },
            tagSortOrder: {
                name: 'Thứ tự sắp xếp thẻ',
                desc: 'Chọn cách sắp xếp thẻ trong ngăn điều hướng. (không đồng bộ)',
                options: {
                    alphaAsc: 'A đến Z',
                    alphaDesc: 'Z đến A',
                    frequencyAsc: 'Tần suất (thấp đến cao)',
                    frequencyDesc: 'Tần suất (cao đến thấp)'
                }
            },
            showAllTagsFolder: {
                name: 'Hiện thư mục thẻ',
                desc: 'Hiển thị "Thẻ" như thư mục có thể thu gọn.'
            },
            showUntagged: {
                name: 'Hiện ghi chú không có thẻ',
                desc: 'Hiển thị mục "Không có thẻ" cho ghi chú không có thẻ nào.'
            },
            keepEmptyTagsProperty: {
                name: 'Giữ thuộc tính tags sau khi gỡ thẻ cuối',
                desc: 'Giữ thuộc tính tags frontmatter khi tất cả thẻ bị gỡ. Khi tắt, thuộc tính tags bị xóa khỏi frontmatter.'
            },
            hiddenTags: {
                name: 'Ẩn thẻ (hồ sơ vault)',
                desc: 'Danh sách mẫu thẻ phân cách bằng dấu phẩy. Mẫu tên: tag* (bắt đầu bằng), *tag (kết thúc bằng). Mẫu đường dẫn: archive (thẻ và con cháu), archive/* (chỉ con cháu), projects/*/drafts (ký tự đại diện ở giữa).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'Bật ghi chú thư mục',
                desc: 'Khi bật, thư mục có ghi chú liên kết được hiển thị như liên kết có thể nhấn.'
            },
            folderNoteType: {
                name: 'Loại ghi chú thư mục mặc định',
                desc: 'Loại ghi chú thư mục tạo từ menu ngữ cảnh.',
                options: {
                    ask: 'Hỏi khi tạo',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'Tên ghi chú thư mục',
                desc: 'Tên ghi chú thư mục không có phần mở rộng. Để trống để dùng cùng tên với thư mục.',
                placeholder: 'index'
            },
            folderNoteProperties: {
                name: 'Thuộc tính ghi chú thư mục',
                desc: 'YAML frontmatter thêm vào ghi chú thư mục mới. Dấu --- được thêm tự động.',
                placeholder: 'theme: dark\nfoldernote: true'
            },
            hideFolderNoteInList: {
                name: 'Ẩn ghi chú thư mục trong danh sách',
                desc: 'Ẩn ghi chú thư mục không xuất hiện trong danh sách ghi chú của thư mục.'
            },
            pinCreatedFolderNote: {
                name: 'Ghim ghi chú thư mục đã tạo',
                desc: 'Tự động ghim ghi chú thư mục khi tạo từ menu ngữ cảnh.'
            },
            confirmBeforeDelete: {
                name: 'Xác nhận trước khi xóa',
                desc: 'Hiện hộp thoại xác nhận khi xóa ghi chú hoặc thư mục'
            },
            interceptTagClicks: {
                name: 'Điều hướng đến thẻ khi nhấp',
                desc: 'Khi nhấp vào thẻ trong ghi chú, điều hướng đến thẻ đó trong Notebook Navigator thay vì kích hoạt tìm kiếm Obsidian.'
            },
            metadataCleanup: {
                name: 'Dọn dẹp metadata',
                desc: 'Gỡ metadata mồ côi còn sót lại khi tệp, thư mục hoặc thẻ bị xóa, di chuyển hoặc đổi tên bên ngoài Obsidian. Điều này chỉ ảnh hưởng đến tệp cài đặt Notebook Navigator.',
                buttonText: 'Dọn dẹp metadata',
                error: 'Dọn dẹp cài đặt thất bại',
                loading: 'Đang kiểm tra metadata...',
                statusClean: 'Không có metadata cần dọn',
                statusCounts: 'Mục mồ côi: {folders} thư mục, {tags} thẻ, {files} tệp, {pinned} ghim, {separators} dấu phân cách'
            },
            rebuildCache: {
                name: 'Xây dựng lại cache',
                desc: 'Dùng nếu bạn gặp thẻ bị thiếu, xem trước không đúng hoặc ảnh nổi bật bị thiếu. Điều này có thể xảy ra sau xung đột đồng bộ hoặc đóng bất thường.',
                buttonText: 'Xây dựng lại cache',
                success: 'Đã xây dựng lại cache',
                error: 'Không thể xây dựng lại cache',
                indexingTitle: 'Đang lập chỉ mục vault...',
                progress: 'Đang cập nhật cache Notebook Navigator.'
            },
            hotkeys: {
                intro: 'Sửa <plugin folder>/notebook-navigator/data.json để tùy chỉnh phím tắt Notebook Navigator. Mở tệp và tìm phần "keyboardShortcuts". Mỗi mục dùng cấu trúc này:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Shift',
                    '"Ctrl" = Control (ưu tiên "Mod" cho đa nền tảng)'
                ],
                guidance:
                    'Thêm nhiều mapping để hỗ trợ phím thay thế, như binding ArrowUp và K ở trên. Kết hợp modifier trong một mục bằng cách liệt kê từng giá trị, ví dụ "modifiers": ["Mod", "Shift"]. Chuỗi phím như "gg" hoặc "dd" không được hỗ trợ. Tải lại Obsidian sau khi sửa tệp.'
            },
            externalIcons: {
                downloadButton: 'Tải về',
                downloadingLabel: 'Đang tải...',
                removeButton: 'Gỡ bỏ',
                statusInstalled: 'Đã tải (phiên bản {version})',
                statusNotInstalled: 'Chưa tải',
                versionUnknown: 'không rõ',
                downloadFailed: 'Không thể tải {name}. Kiểm tra kết nối và thử lại.',
                removeFailed: 'Không thể gỡ {name}.',
                infoNote:
                    'Gói biểu tượng đã tải đồng bộ trạng thái cài đặt giữa các thiết bị. Gói biểu tượng ở trong cơ sở dữ liệu cục bộ trên mỗi thiết bị; đồng bộ chỉ theo dõi tải hay gỡ. Gói biểu tượng tải từ kho Notebook Navigator (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterDates: {
                name: 'Dùng metadata frontmatter',
                desc: 'Dùng frontmatter cho tên ghi chú, dấu thời gian, biểu tượng và màu'
            },
            frontmatterIconField: {
                name: 'Trường biểu tượng',
                desc: 'Trường frontmatter cho biểu tượng tệp. Để trống để dùng biểu tượng lưu trong cài đặt.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'Trường màu',
                desc: 'Trường frontmatter cho màu tệp. Để trống để dùng màu lưu trong cài đặt.',
                placeholder: 'color'
            },
            frontmatterSaveMetadata: {
                name: 'Lưu biểu tượng và màu vào frontmatter',
                desc: 'Tự động ghi biểu tượng và màu tệp vào frontmatter dùng các trường đã cấu hình ở trên.'
            },
            frontmatterMigration: {
                name: 'Di chuyển biểu tượng và màu từ cài đặt',
                desc: 'Lưu trong cài đặt: {icons} biểu tượng, {colors} màu.',
                button: 'Di chuyển',
                buttonWorking: 'Đang di chuyển...',
                noticeNone: 'Không có biểu tượng hoặc màu tệp lưu trong cài đặt.',
                noticeDone: 'Đã di chuyển {migratedIcons}/{icons} biểu tượng, {migratedColors}/{colors} màu.',
                noticeFailures: 'Mục thất bại: {failures}.',
                noticeError: 'Di chuyển thất bại. Kiểm tra console để biết chi tiết.'
            },
            frontmatterNameField: {
                name: 'Các trường tên',
                desc: 'Danh sách trường frontmatter phân cách bằng dấu phẩy. Sử dụng giá trị không trống đầu tiên. Quay lại tên tệp.',
                placeholder: 'tiêu đề, tên'
            },
            frontmatterCreatedField: {
                name: 'Trường dấu thời gian tạo',
                desc: 'Tên trường frontmatter cho dấu thời gian tạo. Để trống để chỉ dùng ngày hệ thống tệp.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'Trường dấu thời gian sửa',
                desc: 'Tên trường frontmatter cho dấu thời gian sửa. Để trống để chỉ dùng ngày hệ thống tệp.',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'Định dạng dấu thời gian',
                desc: 'Định dạng dùng để phân tích dấu thời gian trong frontmatter. Để trống để dùng định dạng ISO 8601',
                helpTooltip: 'Xem tài liệu định dạng date-fns',
                help: "Định dạng phổ biến:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'Hỗ trợ phát triển',
                desc: 'Nếu bạn thích dùng Notebook Navigator, hãy cân nhắc hỗ trợ việc phát triển liên tục.',
                buttonText: '❤️ Tài trợ',
                coffeeButton: '☕️ Mua cho tôi một ly cà phê'
            },
            updateCheckOnStart: {
                name: 'Kiểm tra phiên bản mới khi khởi động',
                desc: 'Kiểm tra bản phát hành plugin mới khi khởi động và hiện thông báo khi có bản cập nhật. Mỗi phiên bản chỉ được thông báo một lần, và kiểm tra xảy ra tối đa một lần mỗi ngày.',
                status: 'Có phiên bản mới: {version}'
            },
            whatsNew: {
                name: 'Có gì mới trong Notebook Navigator {version}',
                desc: 'Xem cập nhật và cải tiến gần đây',
                buttonText: 'Xem cập nhật gần đây'
            },
            masteringVideo: {
                name: 'Làm chủ Notebook Navigator (video)',
                desc: 'Video này bao gồm mọi thứ bạn cần để làm việc hiệu quả với Notebook Navigator, bao gồm phím tắt, tìm kiếm, thẻ và tùy chỉnh nâng cao.'
            },
            cacheStatistics: {
                localCache: 'Cache cục bộ',
                items: 'mục',
                withTags: 'có thẻ',
                withPreviewText: 'có văn bản xem trước',
                withFeatureImage: 'có ảnh nổi bật',
                withMetadata: 'có metadata'
            },
            metadataInfo: {
                successfullyParsed: 'Đã phân tích thành công',
                itemsWithName: 'mục có tên',
                withCreatedDate: 'có ngày tạo',
                withModifiedDate: 'có ngày sửa',
                withIcon: 'có biểu tượng',
                withColor: 'có màu',
                failedToParse: 'Không thể phân tích',
                createdDates: 'ngày tạo',
                modifiedDates: 'ngày sửa',
                checkTimestampFormat: 'Kiểm tra định dạng dấu thời gian.',
                exportFailed: 'Xuất lỗi'
            }
        }
    },
    whatsNew: {
        title: 'Có gì mới trong Notebook Navigator',
        supportMessage: 'Nếu bạn thấy Notebook Navigator hữu ích, hãy cân nhắc hỗ trợ việc phát triển.',
        supportButton: 'Mua cho tôi một ly cà phê',
        thanksButton: 'Cảm ơn!'
    }
};
