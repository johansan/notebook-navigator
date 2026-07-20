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
        restoreDefault: 'Khôi phục mặc định', // Button text for restoring values to defaults (English: Restore default)
        submit: 'Gửi', // Button text for submitting forms and dialogs (English: Submit)
        save: 'Lưu', // Button text for saving settings and dialogs (English: Save)
        configure: 'Cấu hình', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'Chế độ sáng', // Label for light theme mode (English: Light mode)
        darkMode: 'Chế độ tối', // Label for dark theme mode (English: Dark mode)
        noSelection: 'Chưa chọn gì', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'Không có thẻ', // Label for notes without any tags (English: Untagged)
        featureImageAlt: 'Ảnh nổi bật', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: 'Lỗi không xác định', // Generic fallback when an error has no message (English: Unknown error)
        clipboardWriteError: 'Không thể ghi vào clipboard',
        updateBannerTitle: 'Có bản cập nhật Notebook Navigator',
        updateBannerInstruction: 'Cập nhật trong Cài đặt -> Plugin cộng đồng',
        previous: 'Trước', // Generic aria label for previous navigation (English: Previous)
        next: 'Sau' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'Chọn một thư mục hoặc thẻ để xem ghi chú', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'Không có ghi chú', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'Đã ghim', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'Ghi chú', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'Tệp', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (ẩn)', // Accessibility label applied to list items that are normally hidden
        collapseGroup: 'Thu gọn nhóm',
        expandGroup: 'Mở rộng nhóm',
        manualSortTitle: 'Sắp xếp thủ công: {property}',
        manualSortHint: 'Kéo để sắp xếp lại. Thứ tự được lưu dưới dạng giá trị chỉ số trong thuộc tính "{property}".',
        manualSortNonMarkdownHint: 'Các tệp không phải Markdown được hiển thị ở dưới cùng và không thể sắp xếp lại.',
        unsortedSection: 'Chưa sắp xếp',
        manualSortDone: 'Xong',
        manualSortMultipleWriteFailure: '{count} tệp thất bại; đầu tiên: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'Không có thẻ', // Label for the special item showing notes without tags (English: Untagged)
        tags: 'Thẻ' // Label for the tags virtual folder (English: Tags)
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'Lối tắt', // Header label for shortcuts section in navigation pane (English: Shortcuts)
        recentFilesHeader: 'Tệp gần đây', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'Thuộc tính',
        reorderRootFoldersTitle: 'Sắp xếp lại điều hướng',
        reorderRootFoldersHint: 'Dùng mũi tên hoặc kéo để sắp xếp lại',
        vaultRootLabel: 'Vault',
        resetRootToAlpha: 'Đặt lại theo thứ tự bảng chữ cái',
        resetRootToFrequency: 'Đặt lại theo tần suất',
        pinShortcuts: 'Ghim lối tắt',
        pinShortcutsAndRecentFiles: 'Ghim lối tắt và tệp gần đây',
        unpinShortcuts: 'Bỏ ghim lối tắt',
        unpinShortcutsAndRecentFiles: 'Bỏ ghim lối tắt và tệp gần đây',
        profileMenuAria: 'Đổi hồ sơ vault'
    },

    navigationCalendar: {
        ariaLabel: 'Lịch',
        dailyNotesNotEnabled: 'Plugin ghi chú hàng ngày chưa được bật.',
        noteHiddenByProfile: 'Ghi chú lịch bị ẩn bởi hồ sơ kho hiện tại.',
        createDailyNote: {
            title: 'Ghi chú hàng ngày mới',
            message: 'Tệp {filename} không tồn tại. Bạn có muốn tạo không?',
            confirmButton: 'Tạo'
        },
        helpModal: {
            title: 'Phím tắt lịch',
            items: [
                'Nhấp vào bất kỳ ngày nào để mở hoặc tạo ghi chú hàng ngày. Tuần, tháng, quý và năm hoạt động tương tự.',
                'Chấm đặc dưới một ngày nghĩa là có ghi chú. Chấm rỗng nghĩa là có nhiệm vụ chưa hoàn thành.',
                'Nếu ghi chú có ảnh nổi bật, nó sẽ hiển thị làm nền của ngày.'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+nhấp vào ngày để lọc theo ngày đó trong danh sách tệp.',
            dateFilterOptionAlt: '`Option/Alt`+nhấp vào ngày để lọc theo ngày đó trong danh sách tệp.'
        }
    },

    dailyNotes: {
        templateReadFailed: 'Không thể đọc mẫu ghi chú hàng ngày.',
        createFailed: 'Không thể tạo ghi chú hàng ngày.'
    },

    shortcuts: {
        folderExists: 'Thư mục đã có trong lối tắt',
        noteExists: 'Ghi chú đã có trong lối tắt',
        tagExists: 'Thẻ đã có trong lối tắt',
        propertyExists: 'Thuộc tính đã có trong phím tắt',
        invalidProperty: 'Phím tắt thuộc tính không hợp lệ',
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
        showCalendar: 'Hiển thị lịch',
        hideCalendar: 'Ẩn lịch',
        newFolder: 'Thư mục mới', // Tooltip for create new folder button (English: New folder)
        newNote: 'Ghi chú mới', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'Quay lại điều hướng', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeChildSortOrder: 'Đổi thứ tự sắp xếp',
        changeSortAndGroup: 'Đổi sắp xếp và nhóm',
        resetViewToDefaults: 'Đặt lại chế độ xem về mặc định',
        manualSort: 'Sắp xếp thủ công',
        editSortOrder: 'Chỉnh sửa thứ tự sắp xếp...',
        removeSortProperty: 'Xóa thuộc tính sắp xếp',
        descendants: 'phần tử con',
        subfolders: 'thư mục con',
        subtags: 'thẻ con',
        childValues: 'giá trị con',
        applySortAndGroupToDescendants: (target: string) => `Áp dụng sắp xếp và nhóm cho ${target}`,
        applyAppearanceToDescendants: (target: string) => `Áp dụng giao diện cho ${target}`,
        showFolders: 'Hiện điều hướng', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: 'Sắp xếp lại điều hướng',
        finishRootFolderReorder: 'Hoàn tất',
        showExcludedItems: 'Hiện thư mục, thẻ và ghi chú ẩn', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: 'Ẩn thư mục, thẻ và ghi chú ẩn', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'Hiện hai ngăn', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'Hiện một ngăn', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            'Không dùng được hai ngăn khi thanh bên quá hẹp. Để thay đổi, đặt "Khi thanh bên quá hẹp" thành "Không làm gì" trong Cài đặt > Giao diện & hành vi.',
        changeAppearance: 'Đổi giao diện', // Tooltip for button to change folder appearance settings (English: Change appearance)
        showNotesFromSubfolders: 'Hiện ghi chú từ thư mục con',
        showFilesFromSubfolders: 'Hiện tập tin từ thư mục con',
        showNotesFromDescendants: 'Hiện ghi chú từ phần tử con',
        showFilesFromDescendants: 'Hiện tập tin từ phần tử con',
        search: 'Tìm kiếm' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: 'Tìm kiếm...', // Placeholder text for search input (English: Search...)
        placeholderVault: 'Tìm kiếm vault...',
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: 'Xóa tìm kiếm', // Tooltip for clear search button (English: Clear search)
        switchToFilterSearch: 'Chuyển sang tìm kiếm bộ lọc',
        switchToOmnisearch: 'Chuyển sang Omnisearch',
        saveSearchShortcut: 'Lưu lối tắt tìm kiếm',
        removeSearchShortcut: 'Gỡ lối tắt tìm kiếm',
        shortcutModalTitle: 'Lưu lối tắt tìm kiếm',
        shortcutNamePlaceholder: 'Nhập tên lối tắt',
        shortcutStartIn: 'Luôn bắt đầu trong: {path}',
        searchHelp: 'Cú pháp tìm kiếm',
        searchHelpTitle: 'Cú pháp tìm kiếm',
        searchHelpModal: {
            intro: 'Kết hợp tên hiển thị, bí danh, thuộc tính, thẻ, ngày và bộ lọc trong một truy vấn (ví dụ: `meeting .status=active #work @thisweek`). Cài đặt plugin Omnisearch để sử dụng tìm kiếm toàn văn.',
            introSwitching: 'Chuyển đổi giữa tìm kiếm bộ lọc và Omnisearch bằng phím mũi tên lên/xuống hoặc nhấp vào biểu tượng tìm kiếm.',
            sections: {
                fileNames: {
                    title: 'Tên tệp và bí danh',
                    items: [
                        '`word` Tìm ghi chú có "word" trong tên hiển thị hoặc bí danh.',
                        '`word1 word2` Mỗi từ phải khớp với tên hiển thị hoặc một trong các bí danh.',
                        '`-word` Loại trừ ghi chú có "word" trong tên hiển thị hoặc bí danh.'
                    ]
                },
                tags: {
                    title: 'Thẻ',
                    items: [
                        '`#tag` Bao gồm ghi chú có thẻ (cũng khớp với thẻ lồng nhau như `#tag/subtag`).',
                        '`#` Chỉ bao gồm ghi chú có thẻ.',
                        '`-#tag` Loại trừ ghi chú có thẻ.',
                        '`-#` Chỉ bao gồm ghi chú không có thẻ.',
                        '`#tag1 #tag2` Khớp cả hai thẻ (AND ngầm định).',
                        '`#tag1 AND #tag2` Khớp cả hai thẻ (AND rõ ràng).',
                        '`#tag1 OR #tag2` Tìm một trong các thẻ.',
                        '`#a OR #b AND #c` AND có độ ưu tiên cao hơn: khớp `#a`, hoặc cả `#b` và `#c`.',
                        'Cmd/Ctrl+Nhấp vào thẻ để thêm với AND. Cmd/Ctrl+Shift+Nhấp để thêm với OR.'
                    ]
                },
                properties: {
                    title: 'Thuộc tính',
                    items: [
                        '`.key` Bao gồm ghi chú có khóa thuộc tính bắt đầu bằng `key`.',
                        '`.key=value` Bao gồm ghi chú có giá trị thuộc tính chứa `value`.',
                        '`."Reading Status"` Bao gồm ghi chú có khóa thuộc tính chứa khoảng trắng.',
                        '`."Reading Status"="In Progress"` Khóa và giá trị có khoảng trắng phải được đặt trong dấu ngoặc kép.',
                        '`-.key` Loại trừ ghi chú có khóa thuộc tính bắt đầu bằng `key`.',
                        '`-.key=value` Loại trừ ghi chú có giá trị thuộc tính chứa `value`.',
                        'Cmd/Ctrl+Nhấp vào thuộc tính để thêm với AND. Cmd/Ctrl+Shift+Nhấp để thêm với OR.'
                    ]
                },
                tasks: {
                    title: 'Bộ lọc',
                    items: [
                        '`has:task` Bao gồm ghi chú có nhiệm vụ chưa hoàn thành.',
                        '`-has:task` Loại trừ ghi chú có nhiệm vụ chưa hoàn thành.',
                        '`folder:meetings` Bao gồm ghi chú có tên thư mục chứa `meetings`.',
                        '`folder:/work/meetings` Bao gồm ghi chú chỉ trong `work/meetings` (không bao gồm thư mục con).',
                        '`folder:/` Bao gồm ghi chú chỉ trong thư mục gốc của kho.',
                        '`-folder:archive` Loại trừ ghi chú có tên thư mục chứa `archive`.',
                        '`-folder:/archive` Loại trừ ghi chú chỉ trong `archive` (không bao gồm thư mục con).',
                        '`ext:md` Bao gồm ghi chú có phần mở rộng `md` (`ext:.md` cũng được hỗ trợ).',
                        '`-ext:pdf` Loại trừ ghi chú có phần mở rộng `pdf`.',
                        'Kết hợp với thẻ, tên và ngày tháng (ví dụ: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'Hành vi AND/OR',
                    items: [
                        '`AND` và `OR` là toán tử chỉ trong các truy vấn chỉ chứa thẻ và thuộc tính.',
                        'Truy vấn chỉ chứa thẻ và thuộc tính chỉ bao gồm bộ lọc thẻ và thuộc tính: `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`.',
                        'Nếu truy vấn bao gồm tên, ngày (`@...`), bộ lọc nhiệm vụ (`has:task`), bộ lọc thư mục (`folder:...`) hoặc bộ lọc phần mở rộng (`ext:...`), `AND` và `OR` được tìm kiếm như từ.',
                        'Ví dụ truy vấn toán tử: `#work OR .status=started`.',
                        'Ví dụ truy vấn hỗn hợp: `#work OR ext:md` (`OR` được tìm kiếm trong tên tệp).'
                    ]
                },
                dates: {
                    title: 'Ngày',
                    items: [
                        '`@today` Tìm ghi chú hôm nay sử dụng trường ngày mặc định.',
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` Phạm vi ngày tương đối.',
                        '`@2026-02-07` Tìm một ngày cụ thể (cũng hỗ trợ `@20260207`).',
                        '`@2026` Tìm một năm dương lịch.',
                        '`@2026-02` hoặc `@202602` Tìm một tháng dương lịch.',
                        '`@2026-W05` hoặc `@2026W05` Tìm một tuần ISO.',
                        '`@2026-Q2` hoặc `@2026Q2` Tìm một quý dương lịch.',
                        '`@13/02/2026` Định dạng số có dấu phân cách (`@07022026` theo địa phương của bạn khi mơ hồ).',
                        '`@2026-02-01..2026-02-07` Tìm phạm vi ngày bao gồm (hỗ trợ đầu mở).',
                        '`@c:...` hoặc `@m:...` Nhắm mục tiêu ngày tạo hoặc sửa đổi.',
                        '`-@...` Loại trừ một kết quả khớp ngày.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'Tìm kiếm toàn văn trong toàn bộ kho, được lọc theo thư mục hiện tại hoặc thẻ đã chọn.',
                        'Có thể chậm với ít hơn 3 ký tự trong kho lớn.',
                        'Không thể tìm kiếm đường dẫn có ký tự không phải ASCII hoặc tìm kiếm đường dẫn con chính xác.',
                        'Trả về kết quả giới hạn trước khi lọc thư mục, nên các tệp liên quan có thể không xuất hiện nếu có nhiều kết quả khớp ở nơi khác.',
                        'Bản xem trước ghi chú hiển thị trích đoạn Omnisearch thay vì văn bản xem trước mặc định.'
                    ]
                }
            }
        }
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
            openInDefaultApp: 'Mở bằng ứng dụng mặc định',
            renameNote: 'Đổi tên ghi chú',
            renameFile: 'Đổi tên tệp',
            deleteNote: 'Xóa ghi chú',
            deleteFile: 'Xóa tệp',
            setCalendarHighlight: 'Đặt đánh dấu',
            removeCalendarHighlight: 'Xóa đánh dấu',
            deleteMultipleNotes: 'Xóa {count} ghi chú',
            deleteMultipleFiles: 'Xóa {count} tệp',
            moveNoteToFolder: 'Di chuyển ghi chú...',
            moveFileToFolder: 'Di chuyển tệp...',
            moveMultipleNotesToFolder: 'Di chuyển {count} ghi chú...',
            moveMultipleFilesToFolder: 'Di chuyển {count} tệp...',
            mergeNotes: 'Hợp nhất {count} ghi chú...',
            mergeNotesInGroup: 'Hợp nhất ghi chú trong nhóm...',
            setManualSortGroupHeader: 'Đặt header nhóm',
            changeManualSortGroupHeader: 'Đổi header nhóm',
            manualSortGroupHeader: {
                title: 'Header nhóm',
                copyStyle: 'Sao chép kiểu header',
                pasteStyle: 'Dán kiểu header',
                remove: 'Xóa header nhóm'
            },
            addTag: 'Thêm thẻ',
            addPropertyKey: 'Đặt thuộc tính',
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
            createFolderNote: 'Tạo ghi chú thư mục',
            detachFolderNote: 'Tách ghi chú thư mục',
            deleteFolderNote: 'Xóa ghi chú thư mục',
            changeIcon: 'Đổi biểu tượng',
            changeColor: 'Đổi màu',
            changeBackground: 'Đổi nền',
            excludeFolder: 'Ẩn thư mục',
            unhideFolder: 'Hiện thư mục',
            excludeFromDescendants: 'Ẩn khỏi thư mục cha',
            includeInDescendants: 'Hiện trong thư mục cha',
            hiddenFromParentsIndicator: 'Đã ẩn khỏi danh sách thư mục cha',
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
        property: {
            addKey: 'Cấu hình khóa thuộc tính',
            renameKey: 'Đổi tên thuộc tính',
            deleteKey: 'Xóa thuộc tính'
        },
        navigation: {
            addSeparator: 'Thêm dấu phân cách',
            removeSeparator: 'Gỡ dấu phân cách'
        },
        copyPath: {
            title: 'Sao chép đường dẫn',
            asObsidianUrl: 'dưới dạng URL Obsidian',
            fromVaultFolder: 'từ thư mục vault',
            fromSystemRoot: 'từ gốc hệ thống'
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
        appearance: 'Giao diện',
        sortBy: 'Sắp xếp theo',
        standardPreset: 'Chuẩn',
        compactPreset: 'Gọn',
        defaultSuffix: '(mặc định)',
        defaultLabel: 'Mặc định',
        titleRows: 'Dòng tiêu đề',
        previewRows: 'Dòng xem trước',
        groupBy: 'Nhóm theo',
        titleRowOption: (rows: number) => `${rows} dòng tiêu đề`,
        previewRowOption: (rows: number) => `${rows} dòng xem trước`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'Áp dụng',
            applySortAndGroupTitle: (target: string) => `Áp dụng sắp xếp và nhóm cho ${target}?`,
            applyAppearanceTitle: (target: string) => `Áp dụng giao diện cho ${target}?`,
            affectedCountMessage: (count: number) => `Ghi đè hiện có sẽ thay đổi: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: 'Sử dụng sắp xếp thủ công?',
            propertySortMessage: (property: string, count: number) =>
                `Việc này chuyển chế độ xem hiện tại sang sắp xếp thủ công bằng "${property}". Việc chỉnh sửa thứ tự sẽ ghi giá trị chỉ số vào thuộc tính đó trong ${count} ghi chú khi cần.`,
            propertySortConfirmButton: 'Sử dụng sắp xếp thủ công',
            removePropertyTitle: 'Xóa thuộc tính sắp xếp?',
            removePropertyMessage: (property: string, count: number) =>
                `Việc này xóa "${property}" khỏi ${count} ghi chú trong danh sách hiện tại. Thứ tự sắp xếp thủ công sẽ bị xóa cho các ghi chú đó.`,
            removePropertyConfirmButton: 'Xóa thuộc tính',
            compactTitle: 'Nén giá trị chỉ số?',
            compactMessage: (count: number) =>
                `Việc sắp xếp lại này cần thêm khoảng trống số. ${count} ghi chú sẽ nhận giá trị chỉ số mới.`,
            compactConfirmButton: 'Nén giá trị chỉ số'
        },
        manualSortGroupHeader: {
            title: 'Đặt header nhóm',
            titleLabel: 'Tiêu đề',
            placeholder: 'Header nhóm',
            icon: 'Biểu tượng',
            color: 'Màu sắc',
            wordCount: 'Hiển thị số từ',
            wordCountTarget: 'Số từ mục tiêu',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'Khi trường này trống, mục tiêu nhóm dùng thuộc tính mục tiêu được đặt trong Cài đặt > Ghi chú > Số từ và ký tự. Ghi đè bằng cách đặt giá trị mục tiêu cho nhóm này.',
            description: 'Tùy chỉnh header nhóm cho ghi chú này. Để trống tiêu đề để xóa header.'
        },
        mergeNotes: {
            title: 'Hợp nhất ghi chú',
            summary: 'Tạo một ghi chú từ {count} ghi chú trong {folder}.',
            frontmatterRule: 'Frontmatter từ ghi chú đầu tiên được giữ lại. Frontmatter từ các ghi chú khác bị xóa.',
            crossFolderWarning:
                'Ghi chú nguồn nằm trong các thư mục khác nhau. Liên kết tương đối và nhúng có thể ngừng hoạt động trong ghi chú đã hợp nhất.',
            outputName: 'Tên đầu ra',
            outputNameDesc: 'Ghi chú đã hợp nhất được tạo trong thư mục hiển thị ở trên.',
            outputNamePlaceholder: 'Ghi chú đã hợp nhất',
            separator: 'Dấu phân cách',
            separatorDesc: 'Được chèn giữa các ghi chú.',
            separatorOptions: {
                none: 'Không có',
                blankLine: 'Dòng trống',
                horizontalRule: 'Đường ngang',
                heading: 'Tiêu đề với tên ghi chú'
            },
            moveSourcesToTrash: 'Di chuyển ghi chú nguồn vào thùng rác sau khi hợp nhất',
            mergeButton: 'Hợp nhất'
        },
        navRainbowSection: {
            title: (section: string) => `Màu cầu vồng: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'Tìm biểu tượng...',
            recentlyUsedHeader: 'Dùng gần đây',
            emptyStateSearch: 'Bắt đầu nhập để tìm biểu tượng',
            emptyStateNoResults: 'Không tìm thấy biểu tượng',
            showingResultsInfo: 'Hiển thị 50 trong {count} kết quả. Nhập thêm để thu hẹp.',
            emojiInstructions: 'Nhập hoặc dán bất kỳ emoji nào để dùng làm biểu tượng',
            removeIcon: 'Gỡ biểu tượng',
            removeFromRecents: 'Xóa khỏi biểu tượng gần đây',
            allTabLabel: 'Tất cả'
        },
        fileIconRuleEditor: {
            addRuleAria: 'Thêm quy tắc'
        },
        interfaceIcons: {
            title: 'Biểu tượng giao diện',
            fileItemsSection: 'Mục tệp',
            items: {
                'nav-shortcuts': 'Lối tắt',
                'nav-recent-files': 'Tệp gần đây',
                'nav-expand-all': 'Mở rộng tất cả',
                'nav-collapse-all': 'Thu gọn tất cả',
                'nav-calendar': 'Lịch',
                'nav-tree-expand': 'Mũi tên cây: mở rộng',
                'nav-tree-collapse': 'Mũi tên cây: thu gọn',
                'nav-hidden-items': 'Mục ẩn',
                'nav-root-reorder': 'Sắp xếp lại thư mục gốc',
                'nav-new-folder': 'Thư mục mới',
                'nav-show-single-pane': 'Hiện một ngăn',
                'nav-show-dual-pane': 'Hiện hai ngăn',
                'nav-profile-chevron': 'Mũi tên menu hồ sơ',
                'list-search': 'Tìm kiếm',
                'list-reveal-file': 'Hiện tệp',
                'list-descendants': 'Ghi chú từ thư mục con',
                'list-sort-ascending': 'Thứ tự: tăng dần',
                'list-sort-descending': 'Thứ tự: giảm dần',
                'list-sort-modified': 'Sắp xếp theo ngày chỉnh sửa',
                'list-sort-created': 'Sắp xếp theo ngày tạo',
                'list-sort-title': 'Sắp xếp theo tiêu đề',
                'list-sort-filename': 'Sắp xếp theo tên tệp',
                'list-sort-property': 'Sắp xếp theo thuộc tính',
                'list-appearance': 'Thay đổi giao diện',
                'list-new-note': 'Ghi chú mới',
                'list-pinned': 'Ghi chú đã ghim',
                'nav-folder-open': 'Thư mục mở',
                'nav-folder-closed': 'Thư mục đóng',
                'nav-tags': 'Thẻ',
                'nav-tag': 'Thẻ',
                'nav-properties': 'Thuộc tính',
                'nav-property': 'Thuộc tính',
                'nav-property-value': 'Giá trị',
                'file-unfinished-task': 'Nhiệm vụ chưa hoàn thành',
                'file-word-count': 'Số từ',
                'file-character-count': 'Số ký tự'
            }
        },
        colorPicker: {
            currentColor: 'Hiện tại',
            newColor: 'Mới',
            paletteDefault: 'Mặc định',
            paletteCustom: 'Tùy chỉnh',
            copyColors: 'Sao chép màu',
            colorsCopied: 'Đã sao chép màu vào clipboard',
            pasteColors: 'Dán màu',
            pasteClipboardError: 'Không thể đọc clipboard',
            pasteInvalidFormat: 'Yêu cầu giá trị màu hex',
            colorsPasted: 'Đã dán màu thành công',
            resetUserColors: 'Xóa màu tùy chỉnh',
            clearCustomColorsConfirm: 'Xóa tất cả màu tùy chỉnh?',
            userColorSlot: 'Màu {slot}',
            recentColors: 'Màu gần đây',
            clearRecentColors: 'Xóa màu gần đây',
            removeRecentColor: 'Gỡ màu',
            apply: 'Áp dụng',
            pickerLabel: 'Bộ chọn',
            hexLabel: 'HEX',
            hexInputLabel: 'Giá trị màu hex',
            saturationValueArea: 'Độ bão hòa và độ sáng',
            hueSlider: 'Sắc độ',
            alphaSlider: 'Độ trong suốt'
        },
        appearance: {
            tabIcon: 'Biểu tượng',
            tabColor: 'Màu sắc',
            tabBackground: 'Nền',
            resetIcon: 'Xóa biểu tượng',
            resetColor: 'Xóa màu',
            resetBackground: 'Xóa nền',
            clear: 'Xóa kiểu',
            apply: 'Áp dụng'
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
            renameBatchNotFinalized:
                'Đã đổi tên {renamed}/{total}. Chưa cập nhật: {notUpdated}. Siêu dữ liệu và phím tắt chưa được cập nhật.',
            invalidTagName: 'Nhập tên thẻ hợp lệ.',
            descendantRenameError: 'Không thể di chuyển thẻ vào chính nó hoặc phần tử con.',
            confirmDelete: 'Xóa thẻ',
            deleteBatchNotFinalized:
                'Đã xóa khỏi {removed}/{total}. Chưa cập nhật: {notUpdated}. Siêu dữ liệu và phím tắt chưa được cập nhật.',
            checkConsoleForDetails: 'Kiểm tra bảng điều khiển để biết chi tiết.',
            file: 'tệp',
            files: 'tệp',
            inlineParsingWarning: {
                title: 'Tương thích thẻ nội tuyến',
                message:
                    '{tag} chứa các ký tự mà Obsidian không thể phân tích trong thẻ nội tuyến. Các thẻ Frontmatter không bị ảnh hưởng.',
                confirm: 'Vẫn sử dụng'
            }
        },
        propertyOperation: {
            renameTitle: 'Đổi tên thuộc tính {property}',
            deleteTitle: 'Xóa thuộc tính {property}',
            newKeyPrompt: 'Tên thuộc tính mới',
            newKeyPlaceholder: 'Nhập tên thuộc tính mới',
            renameWarning: 'Đổi tên thuộc tính {property} sẽ sửa đổi {count} {files}.',
            renameConflictWarning:
                'Thuộc tính {newKey} đã tồn tại trong {count} {files}. Đổi tên {oldKey} sẽ thay thế các giá trị hiện có của {newKey}.',
            deleteWarning: 'Xóa thuộc tính {property} sẽ sửa đổi {count} {files}.',
            confirmRename: 'Đổi tên thuộc tính',
            confirmDelete: 'Xóa thuộc tính',
            renameNoChanges: '{oldKey} → {newKey} (không thay đổi)',
            renameSettingsUpdateFailed: 'Đã đổi tên thuộc tính {oldKey} → {newKey}. Không thể cập nhật cài đặt.',
            deleteSingleSuccess: 'Đã xóa thuộc tính {property} khỏi 1 ghi chú',
            deleteMultipleSuccess: 'Đã xóa thuộc tính {property} khỏi {count} ghi chú',
            deleteSettingsUpdateFailed: 'Đã xóa thuộc tính {property}. Không thể cập nhật cài đặt.',
            invalidKeyName: 'Nhập tên thuộc tính hợp lệ.'
        },
        fileSystem: {
            newFolderTitle: 'Thư mục mới',
            renameFolderTitle: 'Đổi tên thư mục',
            renameFileTitle: 'Đổi tên tệp',
            deleteFolderTitle: "Xóa '{name}'?",
            deleteFileTitle: "Xóa '{name}'?",
            deleteFileAttachmentsTitle: 'Xóa tệp đính kèm?',
            moveFileConflictTitle: 'Xung đột di chuyển',
            folderNamePrompt: 'Nhập tên thư mục:',
            hideInOtherVaultProfiles: 'Ẩn trong các hồ sơ vault khác',
            renamePrompt: 'Nhập tên mới:',
            renameVaultTitle: 'Đổi tên hiển thị vault',
            renameVaultPrompt: 'Nhập tên hiển thị tùy chỉnh (để trống để dùng mặc định):',
            deleteFolderConfirm: 'Bạn có chắc muốn xóa thư mục này và tất cả nội dung?',
            deleteFileConfirm: 'Bạn có chắc muốn xóa tệp này?',
            deleteFileAttachmentsDescriptionSingle:
                'Tệp đính kèm này không còn được sử dụng trong bất kỳ ghi chú nào. Bạn có muốn xóa không?',
            deleteFileAttachmentsDescriptionMultiple:
                'Các tệp đính kèm này không còn được sử dụng trong bất kỳ ghi chú nào. Bạn có muốn xóa không?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'Cây tệp',
            deleteFileAttachmentsViewGalleryAriaLabel: 'Thư viện ảnh',
            moveFileConflictDescriptionSingle: 'Đã tìm thấy xung đột tệp trong "{folder}".',
            moveFileConflictDescriptionMultiple: 'Đã tìm thấy {count} xung đột tệp trong "{folder}".',
            moveFileConflictAffectedFiles: 'Các tệp bị ảnh hưởng',
            moveFileConflictItem: '"{name}" -> "{suggested}"{renameOnly}',
            moveFileConflictRenameOnly: '(chỉ đổi tên)',
            moveFileConflictRename: 'Đổi tên',
            moveFileConflictOverwrite: 'Ghi đè',
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
        calendarTemplate: {
            placeholder: 'Tìm mẫu...',
            instructions: {
                navigate: 'để điều hướng',
                select: 'để chọn mẫu',
                dismiss: 'để đóng'
            }
        },
        navigationBanner: {
            placeholder: 'Tìm ảnh...',
            svgMissingDimensions: 'Tệp SVG đã chọn không xác định chiều rộng, chiều cao hoặc viewBox.',
            instructions: {
                navigate: 'để điều hướng',
                select: 'để đặt banner',
                dismiss: 'để đóng'
            }
        },
        tagSuggest: {
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
        propertySuggest: {
            placeholder: 'Chọn khóa thuộc tính...',
            navigatePlaceholder: 'Điều hướng đến thuộc tính...',
            instructions: {
                navigate: 'để điều hướng',
                select: 'để thêm thuộc tính',
                dismiss: 'để đóng'
            }
        },
        propertyKeyVisibility: {
            title: 'Hiển thị khóa thuộc tính',
            description:
                'Kiểm soát nơi hiển thị giá trị thuộc tính. Các cột tương ứng với bảng điều hướng, bảng danh sách và menu ngữ cảnh tệp. Sử dụng hàng dưới cùng để chuyển đổi tất cả các hàng trong một cột.',
            searchPlaceholder: 'Tìm khóa thuộc tính...',
            propertyColumnLabel: 'Thuộc tính',
            showInNavigation: 'Hiển thị trong điều hướng',
            showInList: 'Hiển thị trong danh sách',
            showInFileMenu: 'Hiển thị trong menu tệp',
            toggleAllInNavigation: 'Chuyển đổi tất cả trong điều hướng',
            toggleAllInList: 'Chuyển đổi tất cả trong danh sách',
            toggleAllInFileMenu: 'Chuyển đổi tất cả trong menu tệp',
            applyButton: 'Áp dụng',
            emptyState: 'Không tìm thấy khóa thuộc tính.'
        },
        welcome: {
            title: 'Chào mừng đến với {pluginName}',
            introText:
                'Xin chào! Video bên dưới là một khóa học hoàn chỉnh dài một giờ gồm 14 chương. Trước khi bắt đầu, tôi khuyên bạn nên xem ba chương đầu tiên để hiểu mô hình bảng điều khiển — ý tưởng nền tảng của toàn bộ plugin.',
            continueText:
                'Nếu bạn có thêm mười phút, hãy tiếp tục với các chương về thiết lập ban đầu và quy trình làm việc hằng ngày để thiết lập các cài đặt được khuyến nghị và hai phím tắt quan trọng nhất.',
            thanksText: 'Cảm ơn bạn rất nhiều vì đã tải xuống, chúc bạn sử dụng vui vẻ!',
            videoAlt: 'Làm chủ Notebook Navigator 3',
            openVideoButton: 'Phát video',
            closeButton: 'Có lẽ sau'
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
            deleteAttachments: 'Không thể xóa tệp đính kèm: {error}',
            mergeNotes: 'Không thể hợp nhất ghi chú: {error}',
            mergeNotesOpenOutput:
                'Ghi chú đã hợp nhất được tạo dưới tên {name}, nhưng không thể mở: {error}. Ghi chú nguồn không bị thay đổi.',
            mergeNotesOpenSkipped: 'Một yêu cầu mở tệp khác được ưu tiên.',
            mergeNotesTrashSources: 'Ghi chú đã hợp nhất đã được tạo. Không thể di chuyển {count} ghi chú nguồn vào thùng rác.',
            duplicateNote: 'Không thể nhân bản ghi chú: {error}',
            duplicateFolder: 'Không thể nhân bản thư mục: {error}',
            openVersionHistory: 'Không thể mở lịch sử phiên bản: {error}',
            versionHistoryNotFound: 'Không tìm thấy lệnh lịch sử phiên bản. Đảm bảo Obsidian Sync đã bật.',
            revealInExplorer: 'Không thể hiện tệp trong trình quản lý hệ thống: {error}',
            openInDefaultApp: 'Không thể mở bằng ứng dụng mặc định: {error}',
            openInDefaultAppNotAvailable: 'Mở bằng ứng dụng mặc định không khả dụng trên nền tảng này',
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
            showFolder: 'Đã hiện thư mục: {name}',
            folderExcludedFromDescendants: 'Đã ẩn khỏi danh sách thư mục cha: {name}',
            folderIncludedInDescendants: 'Đã hiện trong danh sách thư mục cha: {name}',
            mergeNotes: 'Đã hợp nhất {count} ghi chú vào {name}'
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
            mergeNotesRequireMultipleMarkdown: 'Chọn ít nhất hai ghi chú Markdown để hợp nhất',
            tagOperationsNotAvailable: 'Thao tác thẻ không khả dụng',
            propertyOperationsNotAvailable: 'Thao tác thuộc tính không khả dụng',
            tagsRequireMarkdown: 'Thẻ chỉ được hỗ trợ trên ghi chú Markdown',
            propertiesRequireMarkdown: 'Thuộc tính chỉ được hỗ trợ trên ghi chú Markdown',
            propertySetOnNote: 'Đã cập nhật thuộc tính trên 1 ghi chú',
            propertySetOnNotes: 'Đã cập nhật thuộc tính trên {count} ghi chú',
            manualSortPropertyRemovedFromNote: 'Đã xóa thuộc tính sắp xếp khỏi 1 ghi chú',
            manualSortPropertyRemovedFromNotes: 'Đã xóa thuộc tính sắp xếp khỏi {count} ghi chú',
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
            untitled: 'Chưa đặt tên'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'Không thể di chuyển thư mục vào chính nó hoặc thư mục con.',
            itemAlreadyExists: 'Mục có tên "{name}" đã tồn tại ở vị trí này.',
            failedToMove: 'Không thể di chuyển: {error}',
            failedToAddTag: 'Không thể thêm thẻ "{tag}"',
            failedToSetProperty: 'Không thể cập nhật thuộc tính: {error}',
            failedToClearTags: 'Không thể xóa thẻ',
            failedToMoveFolder: 'Không thể di chuyển thư mục "{name}"',
            failedToImportFiles: 'Không thể nhập: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} tệp đã tồn tại ở đích',
            filesAlreadyHaveTag: '{count} tệp đã có thẻ này hoặc thẻ cụ thể hơn',
            filesAlreadyHaveProperty: '{count} tệp đã có thuộc tính này',
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

    // Plugin commands
    commands: {
        open: 'Mở', // Command palette: Opens the Notebook Navigator view (English: Open)
        toggleLeftSidebar: 'Bật/tắt thanh bên trái', // Command palette: Toggles left sidebar, opening Notebook Navigator when uncollapsing (English: Toggle left sidebar)
        openHomepage: 'Mở trang chủ', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        openDailyNote: 'Mở ghi chú hằng ngày',
        openWeeklyNote: 'Mở ghi chú hằng tuần',
        openMonthlyNote: 'Mở ghi chú hằng tháng',
        openQuarterlyNote: 'Mở ghi chú hằng quý',
        openYearlyNote: 'Mở ghi chú hằng năm',
        revealFile: 'Hiện tệp', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: 'Tìm kiếm', // Command palette: Toggle search in the file list (English: Search)
        searchVaultRoot: 'Tìm kiếm toàn bộ vault', // Command palette: Selects the vault root folder and focuses search with subfolders included (English: Search whole vault)
        toggleDualPane: 'Bật/tắt hai ngăn', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        toggleDualPaneOrientation: 'Chuyển đổi hướng hai ngăn', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'Bật/tắt lịch', // Command palette: Toggles showing the calendar overlay in the navigation pane (English: Toggle calendar)
        selectVaultProfile: 'Chọn hồ sơ vault', // Command palette: Opens a modal to choose a different vault profile (English: Select vault profile)
        selectVaultProfile1: 'Chọn hồ sơ vault 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: 'Chọn hồ sơ vault 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: 'Chọn hồ sơ vault 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'Xóa tệp', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: 'Tạo ghi chú mới', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'Ghi chú mới từ mẫu', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'Di chuyển tệp', // Command palette: Move selected files to another folder (English: Move files)
        mergeNotes: 'Hợp nhất ghi chú', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'Chọn tệp tiếp theo', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: 'Chọn tệp trước', // Command palette: Selects the previous file in the current view (English: Select previous file)
        navigateBack: 'Điều hướng lùi',
        navigateForward: 'Điều hướng tới',
        convertToFolderNote: 'Chuyển thành ghi chú thư mục', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'Đặt làm ghi chú thư mục', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'Tách ghi chú thư mục', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'Ghim tất cả ghi chú thư mục', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'Chuyển đến thư mục', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'Chuyển đến thẻ', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        navigateToProperty: 'Điều hướng đến thuộc tính', // Command palette: Navigate to a property key or value using fuzzy search (English: Navigate to property)
        addShortcut: 'Thêm vào lối tắt', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: 'Mở lối tắt {number}',
        toggleDescendants: 'Bật/tắt phần tử con', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: 'Bật/tắt thư mục, thẻ và ghi chú ẩn', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'Bật/tắt sắp xếp thẻ', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: 'Bật/tắt thẻ theo lựa chọn',
        togglePropertiesBySelection: 'Bật/tắt thuộc tính theo lựa chọn',
        toggleCompactMode: 'Bật/tắt chế độ gọn', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'Bật/tắt phần đã ghim',
        collapseExpand: 'Thu gọn / mở rộng tất cả', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        collapseExpandSelectedItem: 'Thu gọn / mở rộng mục đã chọn',
        addTag: 'Thêm thẻ vào tệp đã chọn', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        setProperty: 'Đặt thuộc tính cho tệp đã chọn', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'Gỡ thẻ khỏi tệp đã chọn', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: 'Gỡ tất cả thẻ khỏi tệp đã chọn', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        openAllFiles: 'Mở tất cả tệp', // Command palette: Opens all files in the current folder or tag (English: Open all files)
        rebuildCache: 'Xây dựng lại cache', // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
        restoreDefaultSettings: 'Khôi phục cài đặt mặc định' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        calendarViewName: 'Lịch', // Name shown in the view header/tab (English: Calendar)
        folderNoteSidebarViewName: 'Ghi chú thư mục', // Name shown in the folder note sidebar tab (English: Folder note)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Hiện trong Notebook Navigator', // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
        settingsUnavailableNotice:
            'Notebook Navigator không thể đọc cài đặt và đã không khởi động. Nếu kho của bạn đang đồng bộ, hãy khởi động lại Obsidian sau khi đồng bộ hoàn tất. Để bắt đầu lại với cài đặt mặc định, hãy chạy lệnh "Khôi phục cài đặt mặc định".', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsRecovery: {
            confirmTitle: 'Khôi phục cài đặt mặc định', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'Thao tác này thay thế tệp cài đặt của Notebook Navigator bằng cài đặt mặc định. Nếu kho của bạn vẫn đang đồng bộ, cài đặt mặc định được khôi phục có thể ghi đè cài đặt lưu trên các thiết bị khác của bạn. Tệp cài đặt đọc được sẽ được sao chép vào bản sao lưu có dấu thời gian trong thư mục plugin trước.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'Khôi phục mặc định', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: 'Không thể hoàn tất việc khôi phục cài đặt. Các tùy chọn cục bộ được giữ nguyên.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'Đã khôi phục cài đặt mặc định. Khởi động lại Obsidian để hoàn tất.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'Sửa đổi lần cuối',
        createdAt: 'Tạo lúc',
        file: 'tệp',
        files: 'tệp',
        folder: 'thư mục',
        folders: 'thư mục',
        wordCount: 'Số từ'
    },

    fileCounts: {
        words: '{count} từ',
        characters: '{count} ký tự',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'Thay đổi cài đặt mặc định',
        metadataReport: {
            exportSuccess: 'Báo cáo metadata thất bại đã xuất đến: {filename}',
            exportFailed: 'Không thể xuất báo cáo metadata'
        },
        sections: {
            general: 'Chung',
            vaultFilters: 'Bộ lọc hiển thị',
            appearanceBehavior: 'Giao diện và hành vi',
            navigationPane: 'Bảng điều hướng',
            calendar: 'Lịch',
            fileOperations: 'Thao tác tệp',
            icons: 'Gói biểu tượng',
            folders: 'Thư mục',
            folderNotes: 'Ghi chú thư mục',
            folderNoteFiles: 'Tệp ghi chú thư mục',
            foldersAndFolderNotes: 'Thư mục và ghi chú thư mục',
            tagsAndProperties: 'Thẻ và thuộc tính',
            tags: 'Thẻ',
            listPane: 'Bảng danh sách',
            notes: 'Hiển thị tệp',
            shortcutsAndRecentFiles: 'Lối tắt và tệp gần đây',
            advanced: 'Nâng cao'
        },
        pageGroups: {
            configuration: 'Cấu hình',
            navigationAndContent: 'Bảng điều hướng',
            notesAndLists: 'Bảng danh sách',
            calendarAndTools: 'Lịch và công cụ'
        },
        pageDescriptions: {
            general: 'Ghi chú phát hành, hỗ trợ, hồ sơ vault, loại tệp và khóa thuộc tính.',
            vaultFilters: 'Thư mục, thẻ, tệp, thẻ tệp và quy tắc thuộc tính bị ẩn.',
            appearanceBehavior: 'Hành vi, điều hướng bằng bàn phím, nút chuột, giao diện và định dạng.',
            navigationPane: 'Bố cục, giao diện, số lượng ghi chú, hành vi thu gọn và màu cầu vồng.',
            shortcuts: 'Khả năng hiển thị lối tắt, huy hiệu, tệp gần đây và mục đã ghim.',
            calendar: 'Hiển thị lịch, ghi chú ngày, mẫu, ngôn ngữ và vị trí thanh bên.',
            fileOperations: 'Mẫu, xác nhận xóa, tệp đính kèm và hành vi xung đột khi di chuyển tệp.',
            foldersAndFolderNotes: 'Hiển thị thư mục, ghi chú thư mục, mẫu ghi chú thư mục và hành vi ghi chú thư mục.',
            tagsProperties: 'Phần thẻ và thuộc tính, biểu tượng, sắp xếp, phạm vi và kế thừa.',
            listPane: 'Sắp xếp, nhóm, chế độ danh sách, ghi chú đã ghim và xem trước bản vẽ.',
            frontmatter: 'Trường frontmatter cho tên hiển thị, dấu thời gian, biểu tượng và màu sắc.',
            notes: 'Tiêu đề, văn bản xem trước, hình ảnh nổi bật, thẻ, thuộc tính, ngày, số từ và số ký tự.',
            iconPacks: 'Biểu tượng giao diện, biểu tượng tệp và quản lý gói biểu tượng.',
            advanced: 'Chẩn đoán, dọn dẹp metadata, nhập/xuất và đặt lại.'
        },
        groups: {
            general: {
                vaultConfiguration: 'Thiết lập vault',
                templates: 'Mẫu',
                behavior: 'Hành vi',
                startup: 'Khởi động',
                keyboardNavigation: 'Điều hướng bằng bàn phím',
                mouseButtons: 'Nút chuột',
                view: 'Giao diện',
                icons: 'Biểu tượng',
                desktopAppearance: 'Giao diện máy tính',
                mobileAppearance: 'Giao diện di động',
                formatting: 'Định dạng'
            },
            advanced: {
                maintenance: 'Bảo trì',
                resetSettings: 'Đặt lại cài đặt'
            },
            navigation: {
                appearance: 'Giao diện',
                banner: 'Banner',
                collapseItems: 'Thu gọn mục',
                dragAndDrop: 'Kéo và thả',
                noteCounts: 'Số lượng ghi chú',
                rainbowColors: 'Màu cầu vồng',
                leftSidebar: 'Thanh bên trái',
                calendarIntegration: 'Tích hợp lịch'
            },
            list: {
                display: 'Giao diện',
                groupHeaders: 'Header nhóm',
                propertySort: 'Sắp xếp theo thuộc tính',
                manualSort: 'Sắp xếp thủ công',
                pinnedNotes: 'Ghi chú đã ghim',
                drawingPreviews: 'Xem trước bản vẽ'
            },
            notes: {
                frontmatter: 'Trường frontmatter',
                tasks: 'Nhiệm vụ',
                icon: 'Biểu tượng',
                title: 'Tiêu đề',
                previewText: 'Văn bản xem trước',
                featureImage: 'Hình ảnh nổi bật',
                tags: 'Thẻ',
                properties: 'Thuộc tính',
                date: 'Ngày',
                parentFolder: 'Thư mục cha',
                wordCount: 'Số từ và ký tự'
            }
        },
        syncMode: {
            notSynced: '(chưa đồng bộ)',
            switchToSynced: 'Bật đồng bộ',
            switchToLocal: 'Tắt đồng bộ'
        },
        items: {
            listPaneTitle: {
                name: 'Tiêu đề ngăn danh sách',
                desc: 'Chọn nơi hiển thị tiêu đề ngăn danh sách.',
                options: {
                    header: 'Hiện ở header',
                    list: 'Hiện ở ngăn danh sách',
                    hidden: 'Không hiện'
                }
            },
            sortNotesBy: {
                name: 'Thứ tự sắp xếp mặc định',
                desc: 'Chọn thứ tự sắp xếp mặc định cho ghi chú.',
                options: {
                    'modified-desc': 'Ngày sửa (mới nhất trên)',
                    'modified-asc': 'Ngày sửa (cũ nhất trên)',
                    'created-desc': 'Ngày tạo (mới nhất trên)',
                    'created-asc': 'Ngày tạo (cũ nhất trên)',
                    'title-asc': 'Tiêu đề (A trên)',
                    'title-desc': 'Tiêu đề (Z trên)',
                    'filename-asc': 'Tên tệp (A trên)',
                    'filename-desc': 'Tên tệp (Z trên)'
                },
                directions: {
                    asc: 'Tăng dần',
                    desc: 'Giảm dần'
                },
                fields: {
                    modified: 'Ngày sửa',
                    created: 'Ngày tạo',
                    title: 'Tiêu đề',
                    filename: 'Tên tệp',
                    property: 'Thuộc tính'
                }
            },
            propertySortKey: {
                name: 'Thuộc tính để sắp xếp',
                desc: 'Các thuộc tính frontmatter phân cách bằng dấu phẩy hiển thị làm tùy chọn sắp xếp theo thuộc tính. Mảng được kết hợp thành một chuỗi. Các thuộc tính này không bị thay đổi.',
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: 'Sắp xếp phụ',
                desc: 'Dùng với sắp xếp theo thuộc tính khi các ghi chú có cùng giá trị thuộc tính hoặc không có giá trị thuộc tính.',
                options: {
                    title: 'Tiêu đề',
                    filename: 'Tên tệp',
                    created: 'Ngày tạo',
                    modified: 'Ngày chỉnh sửa'
                }
            },
            propertySortInstructions: {
                intro: 'Mỗi thuộc tính được liệt kê ở trên xuất hiện làm tùy chọn sắp xếp trong menu sắp xếp ở ngăn danh sách. Chọn một sẽ sắp xếp ghi chú theo giá trị frontmatter của nó.'
            },
            manualSortPropertyKey: {
                name: 'Thuộc tính sắp xếp thủ công',
                desc: 'Thuộc tính frontmatter dùng để lưu giá trị chỉ số cho sắp xếp thủ công.'
            },
            manualSortGroupHeaderProperty: {
                name: 'Thuộc tính header nhóm',
                desc: 'Thuộc tính frontmatter dùng để lưu header nhóm tùy chỉnh.'
            },
            groupHeadersInstructions: {
                intro: 'Header nhóm tùy chỉnh hiển thị phía trên ghi chú trong ngăn danh sách.',
                items: [
                    'Từ menu sắp xếp trong ngăn danh sách, đặt nhóm thành **Tùy chỉnh**.',
                    'Nhấp chuột phải vào ghi chú và chọn **Đặt header nhóm** để thêm header phía trên nó.'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'Vị trí ghi chú mới',
                desc: 'Chọn nơi đặt ghi chú mới khi danh sách hiện tại dùng sắp xếp thủ công.',
                options: {
                    top: 'Đầu',
                    bottom: 'Cuối',
                    'below-selected-note': 'Dưới ghi chú đã chọn',
                    unsorted: 'Chưa sắp xếp'
                }
            },
            confirmBeforeManualSort: {
                name: 'Xác nhận trước khi sắp xếp thủ công',
                desc: 'Hiển thị cảnh báo trước khi ghi thuộc tính sắp xếp thủ công vào ghi chú lần đầu tiên. Khi bị tắt, ghi chú nhận thuộc tính mà không có cảnh báo.'
            },
            manualSortInstructions: {
                intro: 'Sắp xếp thủ công ghi giá trị chỉ số vào thuộc tính frontmatter trên mỗi ghi chú. Ghi chú không có chỉ số sẽ xuất hiện trong mục Chưa sắp xếp.',
                items: [
                    'Bật sắp xếp thủ công bằng cách chọn **Sắp xếp thủ công** từ menu sắp xếp. Sau đó, có hai cách để sắp xếp lại ghi chú.',
                    'Chọn **Chỉnh sửa thứ tự sắp xếp...** từ menu sắp xếp để mở chế độ xem sắp xếp lại. Kéo ghi chú bằng chuột, hoặc bằng cảm ứng trên di động. Trên máy tính, **Cmd/Ctrl** hoặc **Shift** kèm nhấp chọn nhiều ghi chú, sau đó kéo bất kỳ ghi chú nào sẽ di chuyển cả nhóm.',
                    'Trong ngăn danh sách, chọn một ghi chú hoặc chọn nhiều, sau đó nhấn **Cmd/Ctrl + Arrow Up/Down** để di chuyển lựa chọn lên hoặc xuống.'
                ]
            },
            revealFileOnListChanges: {
                name: 'Cuộn đến tệp đã chọn khi danh sách thay đổi',
                desc: 'Cuộn đến tệp đã chọn khi ghim ghi chú, hiện ghi chú con, đổi giao diện thư mục hoặc thao tác tệp.'
            },
            includeDescendantNotes: {
                name: 'Hiện ghi chú từ thư mục con / phần tử con',
                desc: 'Bao gồm ghi chú từ thư mục con lồng nhau và phần tử con của thẻ và thuộc tính khi xem thư mục, thẻ hoặc thuộc tính.'
            },
            limitPinnedToCurrentFolder: {
                name: 'Chỉ ghim ghi chú trong thư mục của nó',
                desc: 'Ghi chú đã ghim chỉ hiển thị là đã ghim trong thư mục riêng của nó. Hữu ích cho ghi chú thư mục hoặc nếu bạn có nhiều ghi chú đã ghim. Không ảnh hưởng đến chế độ xem thẻ hoặc thuộc tính.'
            },
            separateNoteCounts: {
                name: 'Hiện số lượng ghi chú hiện tại và con riêng biệt',
                desc: 'Hiển thị số lượng ghi chú theo định dạng "hiện tại ▾ con" cho thư mục, thẻ và thuộc tính.'
            },
            groupNotes: {
                name: 'Nhóm mặc định',
                desc: 'Tùy chỉnh hiển thị header được định nghĩa trong frontmatter. Ngày nhóm ghi chú theo ngày. Thư mục nhóm ghi chú theo thư mục. Chế độ xem thẻ và thuộc tính dùng nhóm ngày khi thư mục được chọn.',
                options: {
                    custom: 'Tùy chỉnh',
                    date: 'Ngày',
                    folder: 'Thư mục'
                }
            },
            showSelectedNavigationPills: {
                name: 'Luôn hiển thị tất cả nhãn thẻ và thuộc tính',
                desc: 'Khi tắt, các nhãn khớp với lựa chọn điều hướng hiện tại sẽ bị ẩn (ví dụ: nhãn thẻ "công thức" bị ẩn khi duyệt thẻ "công thức"). Bật để giữ tất cả các nhãn luôn hiển thị.'
            },
            stickyGroupHeaders: {
                name: 'Header nhóm cố định',
                desc: 'Giữ header phần ngày, thư mục hoặc đã ghim hiện tại hiển thị khi cuộn.'
            },
            showFolderGroupPaths: {
                name: 'Hiện đường dẫn thư mục con',
                desc: 'Khi nhóm theo thư mục trong ngăn danh sách, hiển thị đường dẫn thư mục con thay vì chỉ tên thư mục.'
            },
            showGroupHeaderItemCounts: {
                name: 'Hiện số lượng mục',
                desc: 'Hiển thị số lượng mục trong mỗi tiêu đề nhóm ở ngăn danh sách.'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'Nhóm theo thư mục: tệp trong thư mục hiện tại ở dưới cùng',
                desc: 'Khi kiểu nhóm mặc định là Thư mục, chuyển các tệp nằm trực tiếp trong thư mục đã chọn xuống dưới các nhóm thư mục con.'
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
                desc: 'Hiển thị biểu tượng tệp với khoảng cách căn trái. Tắt sẽ gỡ cả biểu tượng và thụt lề. Ưu tiên: biểu tượng tác vụ chưa hoàn thành > biểu tượng tùy chỉnh > biểu tượng thư mục > biểu tượng tên tệp > biểu tượng loại tệp > biểu tượng mặc định.'
            },
            useFolderIcon: {
                name: 'Dùng biểu tượng thư mục',
                desc: 'Hiển thị biểu tượng của thư mục cha khi không có biểu tượng tệp tùy chỉnh được đặt. Màu thư mục được dùng khi không có màu tệp tùy chỉnh được đặt.'
            },
            showFileIconUnfinishedTask: {
                name: 'Biểu tượng nhiệm vụ chưa hoàn thành',
                desc: 'Hiển thị biểu tượng nhiệm vụ khi ghi chú có nhiệm vụ chưa hoàn thành.'
            },
            showFileBackgroundUnfinishedTask: {
                name: 'Nền nhiệm vụ chưa hoàn thành',
                desc: 'Áp dụng màu nền khi ghi chú có nhiệm vụ chưa hoàn thành.'
            },
            unfinishedTaskBackgroundColor: {
                name: 'Màu nền nhiệm vụ chưa hoàn thành',
                desc: 'Đặt màu nền được sử dụng khi ghi chú có nhiệm vụ chưa hoàn thành.'
            },
            showFilenameMatchIcons: {
                name: 'Biểu tượng theo tên tệp',
                desc: 'Gán biểu tượng cho tệp dựa trên văn bản trong tên.'
            },
            fileNameIconMap: {
                name: 'Bản đồ biểu tượng tên tệp',
                desc: 'Tệp chứa văn bản sẽ nhận biểu tượng được chỉ định. Một ánh xạ mỗi dòng: văn bản=biểu tượng',
                placeholder: '# văn bản=biểu tượng\nhọp=ph-calendar\nhóa đơn=ph-receipt',
                editTooltip: 'Chỉnh sửa ánh xạ'
            },
            showCategoryIcons: {
                name: 'Biểu tượng theo loại tệp',
                desc: 'Gán biểu tượng cho tệp dựa trên phần mở rộng.'
            },
            fileTypeIconPreset: {
                name: 'Cài đặt sẵn biểu tượng tệp',
                desc: 'Chọn biểu tượng tích hợp hoặc cài đặt sẵn của gói biểu tượng. Quy tắc phần mở rộng tùy chỉnh ghi đè cài đặt sẵn này.',
                options: {
                    none: 'Biểu tượng tích hợp'
                },
                notInstalledWarning: 'Gói biểu tượng này chưa được cài đặt. Biểu tượng tích hợp sẽ được hiển thị thay thế.'
            },
            fileTypeIconMap: {
                name: 'Bản đồ biểu tượng loại tệp',
                desc: 'Tệp có phần mở rộng sẽ nhận biểu tượng được chỉ định. Một ánh xạ mỗi dòng: phần mở rộng=biểu tượng',
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'Chỉnh sửa ánh xạ'
            },
            compactItemHeight: {
                name: 'Chiều cao mục gọn',
                desc: 'Đặt chiều cao mục danh sách gọn trên máy tính và di động (pixel).',
                resetTooltip: 'Đặt lại mặc định (28px)'
            },
            compactItemHeightScaleText: {
                name: 'Co chữ theo chiều cao mục gọn',
                desc: 'Co chữ danh sách gọn khi giảm chiều cao mục.'
            },
            showParentFolder: {
                name: 'Hiện thư mục cha',
                desc: 'Hiển thị tên thư mục cha cho ghi chú trong thư mục con, thẻ hoặc thuộc tính.'
            },
            showParentFolderFullPath: {
                name: 'Hiện đường dẫn thư mục',
                desc: 'Hiển thị đường dẫn tương đối với thư mục đã chọn thay vì chỉ tên thư mục. Thẻ và thuộc tính hiển thị đường dẫn đầy đủ.'
            },
            parentFolderClickRevealsFile: {
                name: 'Nhấn thư mục cha để mở thư mục',
                desc: 'Nhấn nhãn thư mục cha sẽ mở thư mục trong bảng danh sách.'
            },
            showParentFolderColor: {
                name: 'Hiện màu thư mục cha',
                desc: 'Dùng màu thư mục trên nhãn thư mục cha.'
            },
            showParentFolderIcon: {
                name: 'Hiện biểu tượng thư mục cha',
                desc: 'Hiện biểu tượng thư mục bên cạnh nhãn thư mục cha.'
            },
            showQuickActions: {
                name: 'Hiện thao tác nhanh',
                desc: 'Hiện nút thao tác khi di chuột qua tệp. Điều khiển nút chọn thao tác xuất hiện.'
            },
            dualPane: {
                name: 'Bố cục hai ngăn',
                desc: 'Hiện ngăn điều hướng và ngăn danh sách cạnh nhau trên máy tính.'
            },
            dualPaneOrientation: {
                name: 'Hướng hai ngăn',
                desc: 'Chọn bố cục ngang hoặc dọc khi bật hai ngăn.',
                options: {
                    horizontal: 'Chia ngang',
                    vertical: 'Chia dọc'
                }
            },
            narrowSidebarLayout: {
                name: 'Khi thanh bên quá hẹp',
                desc: 'Chọn điều xảy ra khi ngăn điều hướng và ngăn danh sách không vừa khi đặt cạnh nhau.',
                options: {
                    none: 'Không làm gì',
                    singlePane: 'Chuyển sang một ngăn',
                    vertical: 'Chuyển sang chia dọc'
                }
            },
            narrowSidebarTrigger: {
                name: 'Ngưỡng thanh bên hẹp',
                desc: 'Chọn cách tính ngưỡng chiều rộng của thanh bên.',
                options: {
                    fitPanes: 'Vừa các ngăn',
                    customWidth: 'Chiều rộng tùy chỉnh'
                }
            },
            narrowSidebarCustomWidth: {
                name: 'Chiều rộng ngưỡng thanh bên hẹp',
                desc: 'Chuyển khi thanh bên hẹp hơn chiều rộng này.',
                resetTooltip: 'Đặt lại về chiều rộng mặc định'
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
                name: 'Mức thu phóng',
                desc: 'Điều khiển mức thu phóng tổng thể của Notebook Navigator (phần trăm).'
            },
            useFloatingToolbars: {
                name: 'Sử dụng thanh công cụ nổi trên iOS/iPadOS',
                desc: 'Chỉ áp dụng trên iOS và iPadOS.'
            },
            startView: {
                name: 'Chế độ xem khởi động mặc định',
                desc: 'Chọn ngăn hoạt động khi mở Notebook Navigator. Bố cục một ngăn hiển thị ngăn này trước; bố cục hai ngăn chuyển tiêu điểm bàn phím vào ngăn này.',
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
            createNewNotesInNewTab: {
                name: 'Mở ghi chú mới trong tab mới',
                desc: 'Khi bật, lệnh Tạo ghi chú mới sẽ mở ghi chú trong tab mới. Khi tắt, ghi chú sẽ thay thế tab hiện tại.'
            },
            autoRevealActiveNote: {
                name: 'Tự động hiện ghi chú đang hoạt động',
                desc: 'Tự động hiện ghi chú khi mở từ Quick Switcher, liên kết hoặc tìm kiếm.'
            },
            autoRevealShortestPath: {
                name: 'Tự động hiển thị: Sử dụng đường dẫn ngắn nhất',
                desc: 'Bật: Tự động hiển thị chọn thư mục cha hoặc thẻ gần nhất có thể nhìn thấy. Tắt: Tự động hiển thị chọn thư mục thực tế và thẻ chính xác của tệp.'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'Tự động hiển thị: Bỏ qua sự kiện từ thanh bên phải',
                desc: 'Không đổi ghi chú đang hoạt động khi nhấn hoặc đổi ghi chú ở thanh bên phải.'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'Tự động hiển thị: Bỏ qua sự kiện từ cửa sổ khác',
                desc: 'Không đổi ghi chú đang hoạt động khi làm việc với ghi chú ở cửa sổ khác.'
            },
            paneTransitionDuration: {
                name: 'Hoạt ảnh ngăn đơn',
                desc: 'Thời lượng chuyển đổi khi chuyển giữa các ngăn trong chế độ ngăn đơn (mili giây).',
                resetTooltip: 'Đặt lại mặc định'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'Tự động chọn ghi chú đầu tiên',
                desc: 'Tự động mở ghi chú đầu tiên khi chuyển thư mục, thẻ hoặc thuộc tính.'
            },
            skipAutoScroll: {
                name: 'Tắt tự động cuộn cho lối tắt',
                desc: 'Không cuộn ngăn điều hướng khi nhấn mục trong lối tắt.'
            },
            autoExpandNavItems: {
                name: 'Mở rộng khi chọn',
                desc: 'Mở rộng thư mục và thẻ khi chọn. Ở chế độ một ngăn, chọn lần đầu mở rộng, chọn lần hai hiện tệp.'
            },
            collapseOtherBranchesOnExpand: {
                name: 'Một nhánh được mở rộng',
                desc: 'Thu gọn các nhánh khác trong cùng một cây khi mở rộng thư mục, thẻ hoặc thuộc tính.'
            },
            springLoadedFolders: {
                name: 'Mở rộng khi kéo',
                desc: 'Mở rộng thư mục và thẻ khi di chuột qua trong lúc kéo.'
            },
            springLoadedFoldersInitialDelay: {
                name: 'Mở rộng khi kéo: Độ trễ mở rộng lần đầu',
                desc: 'Độ trễ trước khi thư mục hoặc thẻ đầu tiên được mở rộng trong lúc kéo (giây).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'Mở rộng khi kéo: Độ trễ mở rộng tiếp theo',
                desc: 'Độ trễ trước khi mở rộng thêm thư mục hoặc thẻ trong cùng một lần kéo (giây).'
            },
            navigationBanner: {
                name: 'Banner điều hướng (hồ sơ vault)',
                desc: 'Hiển thị ảnh phía trên ngăn điều hướng. Thay đổi theo hồ sơ vault đã chọn.',
                current: 'Banner hiện tại: {path}',
                chooseButton: 'Chọn ảnh'
            },
            pinNavigationBanner: {
                name: 'Ghim biểu ngữ',
                desc: 'Ghim biểu ngữ điều hướng phía trên cây điều hướng.'
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
                name: 'Hiện tệp gần đây',
                desc: 'Hiển thị phần tệp gần đây trong ngăn điều hướng.'
            },
            hideRecentNotes: {
                name: 'Ẩn loại tệp khỏi tệp gần đây',
                desc: 'Chọn loại tệp cần ẩn trong phần tệp gần đây.',
                options: {
                    none: 'Không',
                    folderNotes: 'Ghi chú thư mục'
                }
            },
            recentNotesCount: {
                name: 'Số lượng tệp gần đây',
                desc: 'Số tệp gần đây để hiển thị.'
            },
            pinRecentNotesWithShortcuts: {
                name: 'Ghim tệp gần đây cùng lối tắt',
                desc: 'Bao gồm tệp gần đây khi lối tắt được ghim.'
            },
            calendarEnabled: {
                name: 'Bật lịch',
                desc: 'Bật các tính năng lịch của Notebook Navigator.'
            },
            calendarPlacement: {
                name: 'Vị trí lịch',
                desc: 'Hiển thị trong thanh bên trái hoặc phải.',
                options: {
                    leftSidebar: 'Thanh bên trái',
                    rightSidebar: 'Thanh bên phải'
                }
            },
            calendarLeftPlacement: {
                name: 'Vị trí chế độ bảng đơn',
                desc: 'Nơi hiển thị lịch trong chế độ bảng đơn.',
                options: {
                    navigationPane: 'Bảng điều hướng',
                    below: 'Bên dưới các bảng'
                }
            },
            calendarLocale: {
                name: 'Ngôn ngữ',
                desc: 'Điều khiển định dạng ngày trong lịch, đánh số tuần và ngày đầu tuần.',
                weekPathMismatchWarning:
                    'Lịch hiển thị và đường dẫn ghi chú hàng tuần sử dụng các ngày bắt đầu tuần hoặc cách đánh số tuần khác nhau.',
                options: {
                    systemDefault: 'Mặc định'
                }
            },
            calendarWeekendDays: {
                name: 'Ngày cuối tuần',
                desc: 'Hiển thị ngày cuối tuần với màu nền khác.',
                options: {
                    none: 'Không',
                    satSun: 'Thứ bảy và chủ nhật',
                    friSat: 'Thứ sáu và thứ bảy',
                    thuFri: 'Thứ năm và thứ sáu'
                }
            },
            calendarMonthHeadingFormat: {
                name: 'Định dạng tên tháng',
                desc: 'Tên tháng đầy đủ (tháng 1) hoặc viết tắt (Thg 01).',
                options: {
                    full: 'tháng 1 (đầy đủ)',
                    short: 'Thg 01 (ngắn)'
                }
            },
            showInfoButtons: {
                name: 'Hiển thị nút thông tin',
                desc: 'Hiển thị nút thông tin trên thanh tìm kiếm và tiêu đề lịch.'
            },
            calendarWeeksToShow: {
                name: 'Số tuần hiển thị trong thanh bên trái',
                desc: 'Lịch trong thanh bên phải luôn hiển thị cả tháng.',
                options: {
                    fullMonth: 'Cả tháng',
                    oneWeek: '1 tuần',
                    weeksCount: '{count} tuần'
                }
            },
            calendarHighlightToday: {
                name: 'Làm nổi bật ngày hôm nay',
                desc: 'Làm nổi bật ngày hôm nay bằng màu nền và chữ in đậm.'
            },
            calendarShowFeatureImage: {
                name: 'Hiển thị hình ảnh nổi bật',
                desc: 'Hiển thị hình ảnh nổi bật của ghi chú trong lịch.'
            },
            calendarShowTasks: {
                name: 'Hiển thị nhiệm vụ',
                desc: 'Hiển thị chỉ báo trên ngày, tuần và tháng có nhiệm vụ chưa hoàn thành.'
            },
            calendarShowWeekNumber: {
                name: 'Hiển thị số tuần',
                desc: 'Thêm cột với số tuần.'
            },
            calendarShowQuarter: {
                name: 'Hiển thị quý',
                desc: 'Thêm nhãn quý vào tiêu đề lịch.'
            },
            calendarShowYearCalendar: {
                name: 'Hiển thị lịch năm',
                desc: 'Hiển thị điều hướng năm và lưới tháng trong thanh bên phải.'
            },
            calendarConfirmBeforeCreate: {
                name: 'Xác nhận trước khi tạo',
                desc: 'Hiển thị hộp thoại xác nhận khi tạo ghi chú hàng ngày mới.'
            },
            calendarIntegrationMode: {
                name: 'Nguồn ghi chú hàng ngày',
                desc: 'Nguồn cho ghi chú lịch.',
                options: {
                    dailyNotes: 'Ghi chú hàng ngày (plugin lõi)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'Thư mục và định dạng ngày được cấu hình trong plugin Daily Notes cốt lõi.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'Ngôn ngữ ghi chú định kỳ',
                desc: 'Điều khiển tên tháng, tên ngày trong tuần, số tuần và ngày bắt đầu tuần được bản địa hóa trong đường dẫn ghi chú định kỳ của Notebook Navigator.',
                options: {
                    calendar: 'Lịch',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'Thư mục gốc',
                desc: 'Thư mục cơ sở cho ghi chú định kỳ. Mẫu ngày có thể bao gồm thư mục con. Thay đổi theo hồ sơ vault đã chọn.',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'Vị trí thư mục mẫu',
                desc: 'Trình chọn tệp mẫu hiển thị ghi chú từ thư mục này.',
                placeholder: 'Templates',
                usage: 'Được dùng bởi ghi chú lịch và ghi chú thư mục. Cấu hình mẫu trong Lịch > Tích hợp lịch và Thư mục và ghi chú thư mục > Tệp ghi chú thư mục.'
            },
            calendarCustomFilePattern: {
                name: 'Ghi chú hàng ngày',
                desc: 'Định dạng đường dẫn sử dụng định dạng ngày Moment. Đặt tên thư mục con trong dấu ngoặc vuông, vd: [Work]/YYYY. Nhấp vào biểu tượng mẫu để đặt mẫu. Đặt vị trí thư mục mẫu trong Thao tác tệp > Mẫu.',
                momentDescPrefix: 'Định dạng đường dẫn sử dụng ',
                momentLinkText: 'định dạng ngày Moment',
                momentDescSuffix:
                    '. Đặt tên thư mục con trong dấu ngoặc vuông, vd: [Work]/YYYY. Nhấp vào biểu tượng mẫu để đặt mẫu. Đặt vị trí thư mục mẫu trong Thao tác tệp > Mẫu.',
                templaterSupportInstalled: '✅ Plugin Templater đã được cài đặt với hỗ trợ mẫu đầy đủ.',
                templaterSupportMissing: '⚠️ Cài đặt plugin Templater để hỗ trợ mẫu đầy đủ.',
                placeholder: 'YYYY/YYYYMMDD',
                example: 'Cú pháp hiện tại: {path}',
                parsingError: 'Mẫu phải có thể định dạng và phân tích lại thành một ngày đầy đủ (năm, tháng, ngày).'
            },
            calendarCustomWeekPattern: {
                name: 'Ghi chú hàng tuần',
                parsingError: 'Mẫu phải có thể định dạng và phân tích lại thành một tuần đầy đủ (năm tuần, số tuần).',
                weekPathMismatchWarning:
                    'Đường dẫn ghi chú hàng tuần sử dụng ngôn ngữ ghi chú định kỳ. Sử dụng ngôn ngữ phù hợp, hoặc sử dụng "GGGG" với "WW" cho tuần bắt đầu từ thứ Hai.',
                mixedWeekTokensWarning:
                    'Mẫu này trộn lẫn token tuần bắt đầu từ thứ Hai ("W" hoặc "G") với token tuần dựa trên ngôn ngữ ("w" hoặc "g"). Sử dụng một bộ một cách nhất quán: "GGGG" với "WW" cho tuần bắt đầu từ thứ Hai, hoặc "gggg" với "ww" nếu ghi chú hàng tuần cần tuân theo ngôn ngữ đã chọn.'
            },
            calendarCustomMonthPattern: {
                name: 'Ghi chú hàng tháng',
                parsingError: 'Mẫu phải có thể định dạng và phân tích lại thành một tháng đầy đủ (năm, tháng).'
            },
            calendarCustomQuarterPattern: {
                name: 'Ghi chú hàng quý',
                parsingError: 'Mẫu phải có thể định dạng và phân tích lại thành một quý đầy đủ (năm, quý).'
            },
            calendarCustomYearPattern: {
                name: 'Ghi chú hàng năm',
                parsingError: 'Mẫu phải có thể định dạng và phân tích lại thành một năm đầy đủ (năm).'
            },
            calendarTemplateFile: {
                current: 'Tệp mẫu: {name}'
            },
            showTooltips: {
                name: 'Hiện chú thích',
                desc: 'Hiển thị chú thích khi di chuột với thông tin bổ sung cho ghi chú và thư mục.'
            },
            showTooltipPath: {
                name: 'Hiện đường dẫn trong chú thích',
                desc: 'Hiển thị đường dẫn thư mục bên dưới tên ghi chú trong chú thích.'
            },
            showTooltipWordCount: {
                name: 'Hiện số từ trong chú thích',
                desc: 'Hiển thị số từ của ghi chú trong chú thích.'
            },
            resetPaneSeparator: {
                name: 'Đặt lại vị trí thanh phân cách',
                desc: 'Đặt lại thanh phân cách kéo được giữa ngăn điều hướng và ngăn danh sách về vị trí mặc định.',
                buttonText: 'Đặt lại thanh phân cách',
                notice: 'Đã đặt lại vị trí thanh phân cách. Khởi động lại Obsidian hoặc mở lại Notebook Navigator để áp dụng.'
            },
            settingsTransfer: {
                name: 'Nhập và xuất cài đặt',
                desc: 'Xuất hoặc nhập cài đặt Notebook Navigator dưới dạng JSON. Việc nhập sẽ thay thế tất cả cài đặt.',
                importButtonText: 'Nhập',
                exportButtonText: 'Xuất',
                import: {
                    modalTitle: 'Nhập cài đặt',
                    fileButtonName: 'Nhập từ tệp',
                    fileButtonDesc: 'Tải tệp JSON từ ổ đĩa.',
                    fileButtonText: 'Nhập từ tệp',
                    editorName: 'JSON',
                    editorDesc: 'Dán hoặc chỉnh sửa JSON bên dưới. Các cài đặt không được bao gồm sẽ được đặt lại về mặc định.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'Nhập',
                    confirmTitle: 'Nhập cài đặt?',
                    confirmMessage: 'Việc nhập sẽ thay thế cài đặt Notebook Navigator hiện tại.',
                    backupToggleName: 'Lưu cài đặt hiện tại vào thư mục gốc của kho trước khi nhập',
                    backupToggleDesc: 'Tạo tệp JSON có dấu thời gian trong thư mục gốc của kho.',
                    successWithBackupNotice: 'Đã nhập cài đặt. Cài đặt trước đó đã được lưu vào {path}.',
                    backupError: 'Không thể lưu cài đặt hiện tại: {message}',
                    successNotice: 'Đã nhập cài đặt.',
                    errorNotice: 'Nhập cài đặt thất bại: {message}',
                    fileReadError: 'Không thể đọc tệp: {message}'
                },
                export: {
                    modalTitle: 'Xuất cài đặt',
                    editorName: 'JSON',
                    editorDesc: 'Chỉ bao gồm các cài đặt đã thay đổi so với mặc định.',
                    placeholder: '{}',
                    copyButtonText: 'Sao chép vào bộ nhớ tạm',
                    downloadButtonText: 'Tải xuống',
                    copyNotice: 'Đã sao chép cài đặt vào bộ nhớ tạm.',
                    downloadNotice: 'Đã xuất cài đặt.',
                    downloadError: 'Xuất cài đặt thất bại: {message}'
                }
            },
            resetAllSettings: {
                name: 'Đặt lại tất cả cài đặt',
                desc: 'Đặt lại tất cả cài đặt Notebook Navigator về giá trị mặc định.',
                buttonText: 'Đặt lại tất cả cài đặt',
                confirmTitle: 'Đặt lại tất cả cài đặt?',
                confirmMessage: 'Thao tác này sẽ đặt lại tất cả cài đặt Notebook Navigator về giá trị mặc định. Không thể hoàn tác.',
                confirmButtonText: 'Đặt lại tất cả cài đặt',
                notice: 'Đã đặt lại tất cả cài đặt. Khởi động lại Obsidian hoặc mở lại Notebook Navigator để áp dụng.',
                error: 'Đặt lại cài đặt thất bại'
            },
            multiSelectModifier: {
                name: 'Phím bổ trợ chọn nhiều',
                desc: 'Chọn phím bổ trợ để bật/tắt chọn nhiều. Khi chọn Option/Alt, nhấn Cmd/Ctrl mở ghi chú trong tab mới.',
                options: {
                    cmdCtrl: 'Nhấn Cmd/Ctrl',
                    optionAlt: 'Nhấn Option/Alt'
                }
            },
            enterToOpenFiles: {
                name: 'Nhấn Enter để mở tệp',
                desc: 'Chỉ mở tệp khi nhấn Enter trong quá trình điều hướng bằng bàn phím trong danh sách. Trên macOS, thao tác này ngăn Enter đổi tên tệp.'
            },
            shiftEnterOpenContext: {
                name: 'Shift+Enter',
                desc: 'Chọn Shift+Enter mở hay đổi tên tệp đã chọn.'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Enter',
                desc: 'Chọn Cmd+Enter mở hay đổi tên tệp đã chọn.'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Enter',
                desc: 'Chọn Ctrl+Enter mở hay đổi tên tệp đã chọn.'
            },
            mouseBackForwardAction: {
                name: 'Nút quay lại/tiến lên của chuột',
                desc: 'Hành động cho nút quay lại và tiến lên của chuột trên máy tính.',
                options: {
                    none: 'Sử dụng mặc định hệ thống',
                    singlePaneSwitch: 'Chuyển ngăn (một ngăn)',
                    history: 'Điều hướng lịch sử'
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
                desc: 'Chọn nội dung Notebook Navigator mở tự động khi khởi động.',
                current: 'Hiện tại: {path}',
                chooseButton: 'Chọn tệp',
                options: {
                    none: 'Không',
                    file: 'Tệp',
                    dailyNote: 'Ghi chú hàng ngày',
                    weeklyNote: 'Ghi chú hàng tuần',
                    monthlyNote: 'Ghi chú hàng tháng',
                    quarterlyNote: 'Ghi chú hàng quý',
                    yearlyNote: 'Ghi chú hàng năm'
                },
                file: {
                    name: 'Trang chủ: Tệp khởi động',
                    empty: 'Chưa chọn tệp'
                },
                createMissing: {
                    name: 'Trang chủ: Tạo ghi chú nếu thiếu',
                    desc: 'Tạo ghi chú định kỳ khi khởi động hoặc qua lệnh nếu chưa tồn tại.'
                }
            },
            excludedNotes: {
                name: 'Ẩn ghi chú theo quy tắc thuộc tính (hồ sơ vault)',
                desc: 'Danh sách quy tắc frontmatter phân cách bằng dấu phẩy. Sử dụng mục `key` hoặc `key=value` (ví dụ: status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'Ẩn tệp (hồ sơ vault)',
                desc: 'Danh sách mẫu tên tệp phân cách bằng dấu phẩy để ẩn. Hỗ trợ ký tự đại diện * và đường dẫn / (ví dụ: temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'Hồ sơ vault',
                desc: 'Hồ sơ lưu trữ hiển thị loại tệp, tệp ẩn, thư mục ẩn, thẻ ẩn, quy tắc thuộc tính cho ghi chú ẩn, lối tắt và banner điều hướng. Chuyển hồ sơ từ header ngăn điều hướng.',
                defaultName: 'Mặc định',
                addButton: 'Thêm hồ sơ',
                editProfilesButton: 'Sửa hồ sơ',
                addProfileOption: 'Thêm hồ sơ...',
                applyButton: 'Áp dụng',
                deleteButton: 'Xóa hồ sơ',
                addModalTitle: 'Thêm hồ sơ',
                editProfilesModalTitle: 'Sửa hồ sơ',
                addModalPlaceholder: 'Tên hồ sơ',
                deleteModalTitle: 'Xóa {name}',
                deleteModalMessage:
                    'Gỡ {name}? Bộ lọc tệp, thư mục, thẻ và ghi chú dựa trên thuộc tính được lưu trong hồ sơ này sẽ bị xóa.',
                moveUp: 'Di chuyển lên',
                moveDown: 'Di chuyển xuống',
                errors: {
                    emptyName: 'Nhập tên hồ sơ',
                    duplicateName: 'Tên hồ sơ đã tồn tại'
                }
            },
            vaultTitle: {
                name: 'Vị trí tiêu đề vault',
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
            descendantExcludedFolders: {
                name: 'Loại trừ thư mục khỏi ghi chú thư mục con (hồ sơ kho)',
                desc: 'Danh sách thư mục phân cách bằng dấu phẩy sẽ được bỏ qua khi thu thập ghi chú từ thư mục con. Các thư mục vẫn hiển thị, và khi chọn một thư mục thì ghi chú của thư mục đó vẫn được hiển thị. Dùng cùng mẫu với Ẩn thư mục.',
                placeholder: 'hằng ngày, tài nguyên, /lưu trữ'
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
            showFileProperties: {
                name: 'Hiện thuộc tính tệp',
                desc: 'Hiển thị các thuộc tính trong mục tệp. Dùng hộp thoại "Hiển thị khóa thuộc tính" để chọn thuộc tính nào được hiển thị.'
            },
            colorFileProperties: {
                name: 'Tô màu thuộc tính tệp',
                desc: 'Áp dụng màu thuộc tính cho huy hiệu thuộc tính trên mục tệp.'
            },
            prioritizeColoredFileProperties: {
                name: 'Hiện thuộc tính có màu trước',
                desc: 'Sắp xếp thuộc tính có màu trước các thuộc tính khác trên mục tệp.'
            },
            showFilePropertiesInCompactMode: {
                name: 'Hiện thuộc tính ở chế độ gọn',
                desc: 'Hiển thị thuộc tính khi chế độ gọn đang hoạt động.'
            },
            textCountDisplay: {
                name: 'Loại bộ đếm',
                desc: 'Chọn số liệu ghi chú xuất hiện trong mục tệp.',
                options: {
                    none: 'Không',
                    words: 'Số từ',
                    characters: 'Số ký tự',
                    both: 'Số từ và ký tự'
                }
            },
            textCountPlacement: {
                name: 'Vị trí',
                desc: 'Chọn nơi hiển thị số liệu ghi chú.',
                options: {
                    title: 'Trong tiêu đề',
                    property: 'Dưới dạng thuộc tính'
                }
            },
            characterCountSpaces: {
                name: 'Số ký tự',
                desc: 'Chọn có tính khoảng trắng trong số ký tự hay không.',
                options: {
                    include: 'Bao gồm khoảng trắng',
                    exclude: 'Không bao gồm khoảng trắng'
                }
            },
            wordCountTargetProperty: {
                name: 'Thuộc tính mục tiêu',
                desc: 'Khóa thuộc tính frontmatter chứa số từ mục tiêu. Để trống để ẩn mục tiêu.'
            },
            showWordCountPercentage: {
                name: 'Hiển thị phần trăm mục tiêu',
                desc: 'Chỉ hiển thị phần trăm tiến độ khi có số từ mục tiêu.'
            },
            propertyFields: {
                name: 'Khóa thuộc tính (hồ sơ kho)',
                desc: 'Các khóa thuộc tính frontmatter, với khả năng thiết lập hiển thị từng khóa cho điều hướng và danh sách tệp.',
                addButtonTooltip: 'Cấu hình khóa thuộc tính',
                noneConfigured: 'Chưa cấu hình thuộc tính nào',
                singleConfigured: '1 thuộc tính đã cấu hình: {properties}',
                multipleConfigured: '{count} thuộc tính đã cấu hình: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'Hiển thị thuộc tính trên các dòng riêng',
                desc: 'Hiển thị mỗi thuộc tính trên một dòng riêng.'
            },
            enablePropertyInternalLinks: {
                name: 'Liên kết nhãn thuộc tính với ghi chú',
                desc: 'Nhấp vào nhãn thuộc tính để mở ghi chú được liên kết.'
            },
            enablePropertyExternalLinks: {
                name: 'Liên kết nhãn thuộc tính với URL',
                desc: 'Nhấp vào nhãn thuộc tính để mở URL được liên kết.'
            },
            dateFormat: {
                name: 'Định dạng ngày',
                desc: 'Định dạng hiển thị ngày (dùng định dạng Moment).',
                placeholder: 'D MMM YYYY',
                help: 'Định dạng phổ biến:\nD MMM YYYY = 25 Th5 2022\nDD/MM/YYYY = 25/05/2022\nYYYY-MM-DD = 2022-05-25\n\nToken:\nYYYY/YY = năm\nMMMM/MMM/MM = tháng\nDD/D = ngày\ndddd/ddd = thứ',
                helpTooltip: 'Định dạng với Moment',
                momentLinkText: 'định dạng Moment'
            },
            timeFormat: {
                name: 'Định dạng giờ',
                desc: 'Định dạng hiển thị giờ (dùng định dạng Moment).',
                placeholder: 'HH:mm',
                help: 'Định dạng phổ biến:\nh:mm a = 2:30 PM (12 giờ)\nHH:mm = 14:30 (24 giờ)\nh:mm:ss a = 2:30:45 PM\nHH:mm:ss = 14:30:45\n\nToken:\nHH/H = 24 giờ\nhh/h = 12 giờ\nmm = phút\nss = giây\na = SA/CH',
                helpTooltip: 'Định dạng với Moment',
                momentLinkText: 'định dạng Moment'
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
            stripLatexInPreview: {
                name: 'Xóa LaTeX trong xem trước',
                desc: 'Xóa biểu thức LaTeX nội tuyến và khối khỏi văn bản xem trước.'
            },
            previewProperties: {
                name: 'Thuộc tính xem trước',
                desc: 'Danh sách thuộc tính frontmatter phân cách bằng dấu phẩy để kiểm tra văn bản xem trước. Thuộc tính đầu tiên có văn bản sẽ được dùng.',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'Quay lại nội dung ghi chú',
                desc: 'Hiển thị nội dung ghi chú làm xem trước khi không có thuộc tính nào được chỉ định chứa văn bản.'
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
                    '2': '2 dòng',
                    '3': '3 dòng'
                }
            },
            useFolderColor: {
                name: 'Dùng màu thư mục',
                desc: 'Tô màu tiêu đề ghi chú và biểu tượng tệp bằng màu của thư mục cha khi không có màu tệp tùy chỉnh được đặt. Ưu tiên: màu tệp tùy chỉnh > màu thư mục > màu mặc định.'
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
                desc: 'Danh sách thuộc tính frontmatter phân cách bằng dấu phẩy để kiểm tra trước. Nếu không tìm thấy, sử dụng ảnh đầu tiên trong nội dung markdown.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'Loại trừ ghi chú có thuộc tính',
                desc: 'Danh sách thuộc tính frontmatter phân cách bằng dấu phẩy. Ghi chú chứa bất kỳ thuộc tính nào trong số này không lưu trữ ảnh nổi bật.',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: 'Kích thước hiển thị ảnh nổi bật',
                desc: 'Kích thước hiển thị tối đa cho ảnh nổi bật trong danh sách ghi chú.',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'Kích thước pixel ảnh nổi bật',
                desc: 'Độ phân giải được sử dụng khi tạo hình thu nhỏ ảnh nổi bật đã lưu. Tăng giá trị này nếu bản xem trước lớn hơn bị mờ.',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'Tải hình ảnh bên ngoài',
                desc: 'Tải hình ảnh từ xa và hình thu nhỏ YouTube cho hình ảnh nổi bật.'
            },
            hideDrawingPreviewImages: {
                name: 'Ẩn ảnh xem trước đã xuất',
                desc: 'Ẩn các tệp PNG xem trước bản vẽ đã xuất. Bật "Hiện mục ẩn" để hiển thị chúng.'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator hiển thị các tệp PNG được xuất từ Excalidraw làm bản xem trước của hình vẽ.',
                items: [
                    'Trong **cài đặt Excalidraw**, mở **Embedding Excalidraw into your Notes and Exporting**, rồi **Export Settings**, rồi **Auto-export Settings**.',
                    'Bật **Auto-export PNG**. Tuỳ chọn bật thêm **Export both dark- and light-themed image**.',
                    'Notebook Navigator tìm **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** hoặc **Drawing.excalidraw.light.png**.',
                    'Khi **Ẩn ảnh xem trước đã xuất** đang bật, các tệp PNG chỉ xuất hiện khi **Hiện mục ẩn** cũng được bật.'
                ]
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
            folderSortOrder: {
                name: 'Thứ tự sắp xếp thư mục',
                desc: 'Nhấp chuột phải vào thư mục bất kỳ để thiết lập thứ tự sắp xếp khác cho các mục con.',
                options: {
                    alphaAsc: 'A đến Z',
                    alphaDesc: 'Z đến A'
                }
            },
            showNoteCount: {
                name: 'Hiện số lượng ghi chú',
                desc: 'Hiển thị số lượng ghi chú bên cạnh thư mục, thẻ và thuộc tính.'
            },
            showSectionIcons: {
                name: 'Hiện biểu tượng cho lối tắt và mục gần đây',
                desc: 'Hiển thị biểu tượng bên cạnh các mục trong phần Lối tắt và Gần đây.'
            },
            interfaceIcons: {
                name: 'Biểu tượng giao diện',
                desc: 'Chỉnh sửa biểu tượng thanh công cụ, thư mục, thẻ, thuộc tính, đã ghim, tìm kiếm và sắp xếp.',
                buttonText: 'Chỉnh sửa biểu tượng'
            },
            showIconsColorOnly: {
                name: 'Chỉ áp dụng màu cho biểu tượng',
                desc: 'Khi bật, màu tùy chỉnh chỉ áp dụng cho biểu tượng. Khi tắt, màu áp dụng cho cả biểu tượng và nhãn văn bản.'
            },
            navRainbowMode: {
                name: 'Chế độ màu cầu vồng (hồ sơ vault)',
                desc: 'Áp dụng màu cầu vồng trong bảng điều hướng.',
                options: {
                    none: 'Tắt',
                    foreground: 'Màu chữ',
                    background: 'Màu nền'
                }
            },
            navRainbowFirstColor: {
                name: 'Màu đầu tiên',
                desc: 'Màu đầu tiên trong dải chuyển màu cầu vồng.'
            },
            navRainbowLastColor: {
                name: 'Màu cuối cùng',
                desc: 'Màu cuối cùng trong dải chuyển màu cầu vồng.'
            },
            navRainbowTransitionStyle: {
                name: 'Kiểu chuyển tiếp',
                desc: 'Nội suy được sử dụng giữa màu đầu tiên và màu cuối cùng.',
                options: {
                    hue: 'Sắc độ',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'Áp dụng cho lối tắt',
                desc: 'Áp dụng màu cầu vồng cho lối tắt.'
            },
            navRainbowApplyToRecent: {
                name: 'Áp dụng cho mục gần đây',
                desc: 'Áp dụng màu cầu vồng cho mục gần đây.'
            },
            navRainbowApplyToFolders: {
                name: 'Áp dụng cho thư mục',
                desc: 'Áp dụng màu cầu vồng cho thư mục.'
            },
            navRainbowFolderScope: {
                name: 'Phạm vi thư mục',
                desc: 'Chọn cấp thư mục bắt đầu gán màu.',
                options: {
                    root: 'Cấp gốc',
                    child: 'Cấp con',
                    all: 'Mọi cấp'
                }
            },
            navRainbowApplyToTags: {
                name: 'Áp dụng cho thẻ',
                desc: 'Áp dụng màu cầu vồng cho thẻ.'
            },
            navRainbowTagScope: {
                name: 'Phạm vi thẻ',
                desc: 'Chọn cấp thẻ bắt đầu gán màu.',
                options: {
                    root: 'Cấp gốc',
                    child: 'Cấp con',
                    all: 'Mọi cấp'
                }
            },
            navRainbowApplyToProperties: {
                name: 'Áp dụng cho thuộc tính',
                desc: 'Áp dụng màu cầu vồng cho thuộc tính.'
            },
            navRainbowBalanceHueLuminance: {
                name: 'Độ sáng đồng nhất giữa các sắc độ', // (English: Consistent brightness across hues)
                desc: 'Nội suy độ sáng giữa màu bắt đầu và màu kết thúc trong quá trình chuyển đổi sắc độ.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'Tách riêng màu chế độ sáng và tối', // (English: Separate light and dark mode colors)
                desc: 'Sử dụng màu cầu vồng khác nhau cho chế độ sáng và chế độ tối.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'Sao chép màu chế độ sáng sang chế độ tối', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'Phạm vi thuộc tính',
                desc: 'Chọn cấp thuộc tính bắt đầu gán màu.',
                options: {
                    root: 'Cấp gốc',
                    child: 'Cấp con',
                    all: 'Mọi cấp'
                }
            },
            collapseBehavior: {
                name: 'Thu gọn mục',
                desc: 'Chọn nút mở rộng/thu gọn tất cả ảnh hưởng đến gì.',
                options: {
                    all: 'Tất cả',
                    foldersOnly: 'Chỉ thư mục',
                    tagsOnly: 'Chỉ thẻ',
                    propertiesOnly: 'Chỉ thuộc tính'
                }
            },
            smartCollapse: {
                name: 'Giữ mục đã chọn mở rộng',
                desc: 'Khi thu gọn, giữ mục đã chọn và cha của nó mở rộng.'
            },
            excludeVaultRootFromCollapse: {
                name: 'Bỏ qua thư mục gốc vault khi thu gọn',
                desc: 'Khi thu gọn tất cả mục, giữ thư mục gốc vault ở trạng thái hiện tại.'
            },
            navIndent: {
                name: 'Thụt lề cây',
                desc: 'Điều chỉnh độ rộng thụt lề cho thư mục, thẻ và thuộc tính lồng nhau (pixel).'
            },
            navItemHeight: {
                name: 'Chiều cao mục',
                desc: 'Điều chỉnh chiều cao của thư mục, thẻ và thuộc tính trong ngăn điều hướng (pixel).'
            },
            navItemHeightScaleText: {
                name: 'Co chữ theo chiều cao mục',
                desc: 'Giảm cỡ chữ điều hướng khi giảm chiều cao mục.'
            },
            showIndentGuides: {
                name: 'Hiển thị đường dẫn thụt lề',
                desc: 'Hiển thị đường dẫn thụt lề cho các thư mục, thẻ và thuộc tính lồng nhau.'
            },
            navCountLeaderStyle: {
                name: 'Hiển thị ký tự dẫn',
                desc: 'Hiển thị dấu chấm, dấu gạch hoặc một đường kẻ giữa tên mục và số lượng ghi chú.',
                options: {
                    none: 'Không',
                    dots: 'Dấu chấm (...)',
                    dashes: 'Dấu gạch (---)',
                    line: 'Đường kẻ'
                }
            },
            navRootSpacing: {
                name: 'Khoảng cách mục gốc',
                desc: 'Khoảng cách giữa các thư mục, thẻ và thuộc tính cấp gốc (pixel).'
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
                desc: 'Nhấp chuột phải vào thẻ bất kỳ để thiết lập thứ tự sắp xếp khác cho các mục con.',
                options: {
                    alphaAsc: 'A đến Z',
                    alphaDesc: 'Z đến A',
                    frequency: 'Tần suất',
                    lowToHigh: 'thấp đến cao',
                    highToLow: 'cao đến thấp'
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
            scopeTagsToCurrentContext: {
                name: 'Lọc thẻ theo lựa chọn',
                desc: 'Chỉ hiển thị thẻ xuất hiện trong ghi chú thuộc thư mục hoặc thuộc tính đã chọn.'
            },
            keepEmptyTagsProperty: {
                name: 'Giữ thuộc tính tags sau khi gỡ thẻ cuối',
                desc: 'Giữ thuộc tính tags frontmatter khi tất cả thẻ bị gỡ. Khi tắt, thuộc tính tags bị xóa khỏi frontmatter.'
            },
            showProperties: {
                name: 'Hiển thị thuộc tính',
                desc: 'Hiển thị phần thuộc tính trong trình điều hướng.',
                propertyKeysInfoPrefix: 'Cấu hình thuộc tính trong ',
                propertyKeysInfoLinkText: 'Bắt đầu > Khóa thuộc tính',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'Hiển thị biểu tượng thuộc tính',
                desc: 'Hiển thị biểu tượng bên cạnh thuộc tính trong bảng điều hướng.'
            },
            inheritPropertyColors: {
                name: 'Kế thừa màu thuộc tính',
                desc: 'Giá trị thuộc tính kế thừa màu sắc và nền từ khóa thuộc tính.'
            },
            propertySortOrder: {
                name: 'Thứ tự sắp xếp thuộc tính',
                desc: 'Nhấp chuột phải vào bất kỳ thuộc tính nào để đặt thứ tự sắp xếp khác cho các giá trị của nó.',
                options: {
                    alphaAsc: 'A đến Z',
                    alphaDesc: 'Z đến A',
                    frequency: 'Tần suất',
                    lowToHigh: 'thấp đến cao',
                    highToLow: 'cao đến thấp'
                }
            },
            showAllPropertiesFolder: {
                name: 'Hiển thị thư mục thuộc tính',
                desc: 'Hiển thị "Thuộc tính" dưới dạng thư mục có thể thu gọn.'
            },
            scopePropertiesToCurrentContext: {
                name: 'Lọc thuộc tính theo lựa chọn',
                desc: 'Chỉ hiển thị thuộc tính xuất hiện trong ghi chú thuộc thư mục hoặc thẻ đã chọn.'
            },
            hiddenTags: {
                name: 'Ẩn thẻ (hồ sơ vault)',
                desc: 'Danh sách mẫu thẻ phân cách bằng dấu phẩy. Mẫu tên: tag* (bắt đầu bằng), *tag (kết thúc bằng). Mẫu đường dẫn: archive (thẻ và con cháu), archive/* (chỉ con cháu), projects/*/drafts (ký tự đại diện ở giữa).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            hiddenFileTags: {
                name: 'Ẩn ghi chú có thẻ (hồ sơ vault)',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'Bật ghi chú thư mục',
                desc: 'Thư mục có tệp ghi chú trùng khớp được hiển thị dưới dạng liên kết có thể nhấp.'
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
            folderNoteNamePattern: {
                name: 'Mẫu tên ghi chú thư mục',
                desc: 'Mẫu tên cho ghi chú thư mục không có phần mở rộng. Dùng {{folder}} để chèn tên thư mục. Khi được đặt, tên ghi chú thư mục không được áp dụng.'
            },
            folderNoteTemplate: {
                name: 'Mẫu ghi chú thư mục',
                desc: 'Tệp mẫu được dùng khi tạo ghi chú thư mục. Mẫu Markdown có thể dùng Templater. Mẫu Canvas và Base được sao chép dưới dạng nội dung tệp. Đặt vị trí thư mục mẫu trong Thao tác tệp > Mẫu.',
                formatWarning: 'Định dạng mẫu phải khớp với loại ghi chú thư mục đã chọn: .md, .canvas hoặc .base.'
            },
            enableFolderNoteLinks: {
                name: 'Tên thư mục mở ghi chú thư mục',
                desc: 'Nhấp vào tên thư mục sẽ mở ghi chú thư mục của thư mục đó. Khi tắt, ghi chú thư mục chỉ cung cấp metadata thư mục như tên, biểu tượng và màu.'
            },
            hideFolderNoteInList: {
                name: 'Ẩn ghi chú thư mục trong danh sách',
                desc: 'Ẩn ghi chú thư mục khỏi danh sách tệp.'
            },
            pinCreatedFolderNote: {
                name: 'Ghim ghi chú thư mục đã tạo',
                desc: 'Ghim ghi chú thư mục khi tạo từ menu ngữ cảnh.'
            },
            folderNoteOpenLocation: {
                name: 'Mở ghi chú thư mục trong',
                desc: 'Chọn nơi mở ghi chú thư mục khi nhấp vào liên kết ghi chú thư mục.',
                options: {
                    currentTab: 'Tab hiện tại',
                    newTab: 'Tab mới',
                    rightSidebar: 'Thanh bên phải'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: 'Thanh bên phải: Hiển thị ghi chú thư mục gần nhất',
                desc: 'Khi một thư mục được chọn, thanh bên phải tự động hiển thị ghi chú thư mục tổ tiên gần nhất.'
            },
            confirmBeforeDelete: {
                name: 'Xác nhận trước khi xóa',
                desc: 'Hiện hộp thoại xác nhận khi xóa ghi chú hoặc thư mục'
            },
            deleteAttachments: {
                name: 'Xóa tệp đính kèm khi xóa tệp',
                desc: 'Tự động xóa tệp đính kèm được liên kết và bản xem trước bản vẽ được tạo nếu chúng không được sử dụng ở nơi khác',
                options: {
                    ask: 'Hỏi mỗi lần',
                    always: 'Luôn luôn',
                    never: 'Không bao giờ'
                }
            },
            moveFileConflicts: {
                name: 'Xung đột di chuyển',
                desc: 'Khi di chuyển tệp vào thư mục đã có tệp cùng tên. Hỏi mỗi lần (đổi tên, ghi đè, hủy) hoặc luôn đổi tên.',
                options: {
                    ask: 'Hỏi mỗi lần',
                    rename: 'Luôn đổi tên'
                }
            },
            metadataCleanup: {
                name: 'Dọn dẹp metadata',
                desc: 'Gỡ metadata mồ côi còn sót lại khi tệp, thư mục, thẻ hoặc thuộc tính bị xóa, di chuyển hoặc đổi tên bên ngoài Obsidian. Điều này chỉ ảnh hưởng đến tệp cài đặt Notebook Navigator.',
                buttonText: 'Dọn dẹp metadata',
                error: 'Dọn dẹp cài đặt thất bại',
                loading: 'Đang kiểm tra metadata...',
                statusClean: 'Không có metadata cần dọn',
                statusCounts:
                    'Mục mồ côi: {folders} thư mục, {tags} thẻ, {properties} thuộc tính, {files} tệp, {pinned} ghim, {separators} dấu phân cách'
            },
            rebuildCache: {
                name: 'Xây dựng lại cache',
                desc: 'Dùng nếu bạn gặp thẻ bị thiếu, xem trước không đúng hoặc ảnh nổi bật bị thiếu. Điều này có thể xảy ra sau xung đột đồng bộ hoặc đóng bất thường.',
                buttonText: 'Xây dựng lại cache',
                error: 'Không thể xây dựng lại cache',
                indexingTitle: 'Đang lập chỉ mục vault...',
                progress: 'Đang cập nhật cache Notebook Navigator.'
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
            frontmatterBackgroundField: {
                name: 'Trường nền',
                desc: 'Trường frontmatter cho màu nền. Để trống để dùng màu nền lưu trong cài đặt.',
                placeholder: 'background'
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
                placeholder: 'title, name'
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
                helpTooltip: 'Định dạng với Moment',
                momentLinkText: 'định dạng Moment',
                help: 'Định dạng phổ biến:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'Hỗ trợ phát triển',
                desc: 'Nếu bạn thích dùng Notebook Navigator, hãy cân nhắc hỗ trợ việc phát triển liên tục.',
                buttonText: '❤️ Tài trợ',
                coffeeButton: '☕️ Mua cho tôi một ly cà phê'
            },
            updateCheckOnStart: {
                name: 'Kiểm tra phiên bản mới khi khởi động',
                desc: 'Kiểm tra bản phát hành plugin mới khi khởi động và hiện thông báo khi có bản cập nhật. Kiểm tra xảy ra tối đa một lần mỗi ngày.',
                status: 'Có phiên bản mới: {version}'
            },
            debugLogging: {
                name: 'Ghi log gỡ lỗi khi khởi động',
                desc: 'Ghi chẩn đoán khởi động vào một tệp Markdown có dấu thời gian ở thư mục gốc của kho, rồi dừng sau khi khởi động ổn định. Tệp có thể được đồng bộ hóa và có thể bao gồm đường dẫn tệp.'
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
        openBannerImage: 'Mở hình ảnh biểu ngữ phát hành',
        supportMessage: 'Nếu bạn thấy Notebook Navigator hữu ích, hãy cân nhắc hỗ trợ việc phát triển.',
        supportButton: 'Mua cho tôi một ly cà phê',
        thanksButton: 'Cảm ơn!'
    }
};
