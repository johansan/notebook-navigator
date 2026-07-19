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
 * Traditional Chinese (zh-TW) language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_ZH_TW = {
    // Common UI elements
    common: {
        cancel: '取消',
        delete: '刪除',
        clear: '清除',
        remove: '移除',
        restoreDefault: '恢復預設', // Button text for restoring values to defaults (English: Restore default)
        submit: '提交',
        save: '儲存', // Button text for saving settings and dialogs (English: Save)
        configure: '設定', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: '淺色模式', // Label for light theme mode (English: Light mode)
        darkMode: '深色模式', // Label for dark theme mode (English: Dark mode)
        noSelection: '未選擇',
        untagged: '無標籤',
        featureImageAlt: '特色圖片',
        unknownError: '未知錯誤',
        clipboardWriteError: '無法寫入剪貼簿',
        updateBannerTitle: 'Notebook Navigator 有可用更新',
        updateBannerInstruction: '在設定 -> 社群外掛中更新',
        previous: '上一個', // Generic aria label for previous navigation (English: Previous)
        next: '下一個' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: '選擇資料夾或標籤以檢視筆記',
        emptyStateNoNotes: '無筆記',
        pinnedSection: '已釘選',
        notesSection: '筆記',
        filesSection: '檔案',
        hiddenItemAriaLabel: '{name} (已隱藏)',
        collapseGroup: '摺疊群組',
        expandGroup: '展開群組',
        manualSortTitle: '手動排序: {property}',
        manualSortHint: '拖曳以重新排序。順序會以數字索引值儲存在屬性「{property}」中。',
        manualSortNonMarkdownHint: '非 Markdown 檔案顯示於底部，無法重新排序。',
        unsortedSection: '未排序',
        manualSortDone: '完成',
        manualSortMultipleWriteFailure: '{count} 個檔案失敗；第一個: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: '無標籤',
        tags: '標籤'
    },

    navigationPane: {
        shortcutsHeader: '捷徑',
        recentFilesHeader: '最近檔案', // Header label for recent files section in navigation pane (English: Recent files)
        properties: '屬性',
        reorderRootFoldersTitle: '重新排列導覽',
        reorderRootFoldersHint: '使用方向鍵或拖曳來重新排列',
        vaultRootLabel: '保險庫',
        resetRootToAlpha: '重設為字母順序',
        resetRootToFrequency: '重設為頻率排序',
        pinShortcuts: '釘選捷徑',
        pinShortcutsAndRecentFiles: '釘選捷徑和最近檔案',
        unpinShortcuts: '取消釘選捷徑',
        unpinShortcutsAndRecentFiles: '取消釘選捷徑和最近檔案',
        profileMenuAria: '變更保險庫設定檔'
    },

    navigationCalendar: {
        ariaLabel: '導覽日曆',
        dailyNotesNotEnabled: '未啟用每日筆記。請在 Obsidian 設定 → 核心外掛中啟用每日筆記。',
        noteHiddenByProfile: '日曆筆記已被目前的倉庫設定檔隱藏。',
        createDailyNote: {
            title: '建立每日筆記',
            message: '每日筆記 {filename} 不存在。是否建立？',
            confirmButton: '建立'
        },
        helpModal: {
            title: '行事曆快捷鍵',
            items: [
                '點擊任意日期以開啟或建立每日筆記。週、月、季度和年份的操作方式相同。',
                '日期下方的實心圓點表示有筆記。空心圓點表示有未完成的任務。',
                '如果筆記有特色圖片，它會顯示為該日期的背景。'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+點擊日期，按該日期篩選檔案列表。',
            dateFilterOptionAlt: '`Option/Alt`+點擊日期，按該日期篩選檔案列表。'
        }
    },

    dailyNotes: {
        templateReadFailed: '讀取每日筆記範本失敗',
        createFailed: '建立每日筆記失敗'
    },

    shortcuts: {
        folderExists: '資料夾已在捷徑中',
        noteExists: '筆記已在捷徑中',
        tagExists: '標籤已在捷徑中',
        propertyExists: '屬性已在捷徑中',
        invalidProperty: '無效的屬性捷徑',
        searchExists: '搜尋捷徑已存在',
        emptySearchQuery: '儲存前請輸入搜尋查詢',
        emptySearchName: '儲存搜尋前請輸入名稱',
        add: '新增至捷徑',
        addNotesCount: '新增 {count} 個筆記至捷徑',
        addFilesCount: '新增 {count} 個檔案至捷徑',
        rename: '重新命名捷徑',
        remove: '從捷徑移除',
        removeAll: '移除所有捷徑',
        removeAllConfirm: '移除所有捷徑？',
        folderNotesPinned: '已釘選 {count} 個資料夾筆記'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: '摺疊項目',
        expandAllFolders: '展開所有項目',
        showCalendar: '顯示日曆',
        hideCalendar: '隱藏日曆',
        newFolder: '新建資料夾',
        newNote: '新筆記',
        mobileBackToNavigation: '返回導覽',
        changeChildSortOrder: '變更排序方式',
        changeSortAndGroup: '變更排序與分組',
        resetViewToDefaults: '將檢視重設為預設值',
        manualSort: '手動排序',
        editSortOrder: '編輯排序方式...',
        removeSortProperty: '移除排序屬性',
        descendants: '子項',
        subfolders: '子資料夾',
        subtags: '子標籤',
        childValues: '子值',
        applySortAndGroupToDescendants: (target: string) => `將排序與分組套用到${target}`,
        applyAppearanceToDescendants: (target: string) => `將外觀套用到${target}`,
        showFolders: '顯示導覽',
        reorderRootFolders: '重新排列導覽',
        finishRootFolderReorder: '完成重新排列',
        showExcludedItems: '顯示隱藏的資料夾、標籤和筆記',
        hideExcludedItems: '隱藏隱藏的資料夾、標籤和筆記',
        showDualPane: '顯示雙窗格',
        showSinglePane: '顯示單窗格',
        dualPaneAutoFallbackNotice:
            '側邊欄過窄時無法使用雙窗格。若要變更此行為，請在設定 > 外觀與行為中將「側邊欄過窄時」設為「不執行任何動作」。',
        changeAppearance: '變更外觀',
        showNotesFromSubfolders: '顯示子資料夾的筆記',
        showFilesFromSubfolders: '顯示子資料夾的檔案',
        showNotesFromDescendants: '顯示後代的筆記',
        showFilesFromDescendants: '顯示後代的檔案',
        search: '搜尋'
    },
    // Search input
    searchInput: {
        placeholder: '搜尋...',
        placeholderVault: '搜尋保險庫...',
        placeholderOmnisearch: 'Omnisearch...',
        clearSearch: '清除搜尋',
        switchToFilterSearch: '切換到篩選搜尋',
        switchToOmnisearch: '切換到 Omnisearch',
        saveSearchShortcut: '將搜尋儲存至捷徑',
        removeSearchShortcut: '從捷徑移除搜尋',
        shortcutModalTitle: '儲存搜尋捷徑',
        shortcutNamePlaceholder: '輸入捷徑名稱',
        shortcutStartIn: '始終從此處開始: {path}',
        searchHelp: '搜尋語法',
        searchHelpTitle: '搜尋語法',
        searchHelpModal: {
            intro: '在一個查詢中組合檔案名稱、屬性、標籤、日期和篩選器（例如：`meeting .status=active #work @thisweek`）。安裝 Omnisearch 外掛程式以使用全文搜尋。',
            introSwitching: '使用上/下箭頭鍵或點擊搜尋圖示在篩選搜尋和 Omnisearch 之間切換。',
            sections: {
                fileNames: {
                    title: '檔案名稱',
                    items: [
                        '`word` 尋找檔案名稱中含有 "word" 的筆記。',
                        '`word1 word2` 每個詞都必須符合檔案名稱。',
                        '`-word` 排除檔案名稱中含有 "word" 的筆記。'
                    ]
                },
                tags: {
                    title: '標籤',
                    items: [
                        '`#tag` 包含帶有標籤的筆記（也符合巢狀標籤如 `#tag/subtag`）。',
                        '`#` 僅包含有標籤的筆記。',
                        '`-#tag` 排除帶有標籤的筆記。',
                        '`-#` 僅包含無標籤的筆記。',
                        '`#tag1 #tag2` 符合兩個標籤（隱式 AND）。',
                        '`#tag1 AND #tag2` 符合兩個標籤（顯式 AND）。',
                        '`#tag1 OR #tag2` 符合任一標籤。',
                        '`#a OR #b AND #c` AND 優先順序較高：符合 `#a`，或同時符合 `#b` 和 `#c`。',
                        'Cmd/Ctrl+點擊標籤以 AND 方式新增。Cmd/Ctrl+Shift+點擊以 OR 方式新增。'
                    ]
                },
                properties: {
                    title: '屬性',
                    items: [
                        '`.key` 包含具有屬性鍵的筆記。',
                        '`.key=value` 包含屬性值含有 `value` 的筆記。',
                        '`."Reading Status"` 包含屬性鍵包含空格的筆記。',
                        '`."Reading Status"="In Progress"` 包含空格的鍵和值必須用雙引號括起來。',
                        '`-.key` 排除具有屬性鍵的筆記。',
                        '`-.key=value` 排除屬性值含有 `value` 的筆記。',
                        'Cmd/Ctrl+點擊屬性以 AND 方式新增。Cmd/Ctrl+Shift+點擊以 OR 方式新增。'
                    ]
                },
                tasks: {
                    title: '篩選器',
                    items: [
                        '`has:task` 包含有未完成任務的筆記。',
                        '`-has:task` 排除有未完成任務的筆記。',
                        '`folder:meetings` 包含資料夾名稱含有 `meetings` 的筆記。',
                        '`folder:/work/meetings` 僅包含 `work/meetings` 中的筆記（不含子資料夾）。',
                        '`folder:/` 僅包含保管庫根目錄中的筆記。',
                        '`-folder:archive` 排除資料夾名稱含有 `archive` 的筆記。',
                        '`-folder:/archive` 僅排除 `archive` 中的筆記（不含子資料夾）。',
                        '`ext:md` 包含副檔名為 `md` 的筆記（也支援 `ext:.md`）。',
                        '`-ext:pdf` 排除副檔名為 `pdf` 的筆記。',
                        '與標籤、名稱和日期組合使用（例如：`folder:/work/meetings ext:md @thisweek`）。'
                    ]
                },
                connectors: {
                    title: 'AND/OR 行為',
                    items: [
                        '`AND` 和 `OR` 僅在純標籤/屬性查詢中作為運算子。',
                        '純標籤/屬性查詢僅包含標籤和屬性篩選器: `#tag`、`-#tag`、`#`、`-#`、`.key`、`-.key`、`.key=value`、`-.key=value`。',
                        '如果查詢包含名稱、日期（`@...`）、任務篩選器（`has:task`）、資料夾篩選器（`folder:...`）或副檔名篩選器（`ext:...`），`AND` 和 `OR` 將作為詞語進行比對。',
                        '運算子查詢範例: `#work OR .status=started`。',
                        '混合查詢範例：`#work OR ext:md`（`OR` 在檔案名稱中進行比對）。'
                    ]
                },
                dates: {
                    title: '日期',
                    items: [
                        '`@today` 使用預設日期欄位尋找今天的筆記。',
                        '`@yesterday`、`@last7d`、`@last30d`、`@thisweek`、`@thismonth` 相對日期範圍。',
                        '`@2026-02-07` 尋找特定日期（也支援 `@20260207`）。',
                        '`@2026` 尋找日曆年。',
                        '`@2026-02` 或 `@202602` 尋找日曆月。',
                        '`@2026-W05` 或 `@2026W05` 尋找 ISO 週。',
                        '`@2026-Q2` 或 `@2026Q2` 尋找日曆季度。',
                        '`@13/02/2026` 帶分隔符的數字格式（`@07022026` 在歧義時遵循您的地區設定）。',
                        '`@2026-02-01..2026-02-07` 尋找包含性日期範圍（支援開放端點）。',
                        '`@c:...` 或 `@m:...` 指定建立或修改日期。',
                        '`-@...` 排除日期符合。'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        '對整個保管庫進行全文搜尋，按目前資料夾或選定標籤篩選。',
                        '在大型保管庫中輸入少於3個字元時可能會較慢。',
                        '無法搜尋包含非ASCII字元的路徑，也無法正確搜尋子路徑。',
                        '在資料夾篩選之前返回有限的結果，因此如果其他地方存在大量符合項，相關檔案可能不會顯示。',
                        '筆記預覽顯示 Omnisearch 摘錄，而不是預設預覽文字。'
                    ]
                }
            }
        }
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: '在新分頁中開啟',
            openToRight: '在右側開啟',
            openInNewWindow: '在新視窗中開啟',
            openMultipleInNewTabs: '在新分頁中開啟 {count} 個筆記',
            openMultipleToRight: '在右側開啟 {count} 個筆記',
            openMultipleInNewWindows: '在新視窗中開啟 {count} 個筆記',
            pinNote: '釘選筆記',
            unpinNote: '取消釘選筆記',
            pinMultipleNotes: '釘選 {count} 個筆記',
            unpinMultipleNotes: '取消釘選 {count} 個筆記',
            duplicateNote: '複製筆記',
            duplicateMultipleNotes: '複製 {count} 個筆記',
            openVersionHistory: '開啟版本歷史',
            revealInFolder: '在資料夾中定位',
            revealInFinder: '在 Finder 中顯示',
            showInExplorer: '在檔案總管中顯示',
            openInDefaultApp: '以預設應用程式開啟',
            renameNote: '重新命名筆記',
            deleteNote: '刪除筆記',
            deleteMultipleNotes: '刪除 {count} 個筆記',
            moveNoteToFolder: '移動筆記至...',
            moveFileToFolder: '移動檔案至...',
            moveMultipleNotesToFolder: '將 {count} 個筆記移動至...',
            moveMultipleFilesToFolder: '將 {count} 個檔案移動至...',
            mergeNotes: '合併 {count} 則筆記...',
            mergeNotesInGroup: '合併群組中的筆記...',
            setManualSortGroupHeader: '設定群組標題',
            changeManualSortGroupHeader: '變更群組標題',
            manualSortGroupHeader: {
                title: '群組標題',
                copyStyle: '複製標題樣式',
                pasteStyle: '貼上標題樣式',
                remove: '移除群組標題'
            },
            addTag: '新增標籤',
            addPropertyKey: '設定屬性',
            removeTag: '移除標籤',
            removeAllTags: '移除所有標籤',
            changeIcon: '變更圖示',
            changeColor: '變更顏色',
            // File-specific context menu items (non-markdown files)
            openMultipleFilesInNewTabs: '在新分頁中開啟 {count} 個檔案',
            openMultipleFilesToRight: '在右側開啟 {count} 個檔案',
            openMultipleFilesInNewWindows: '在新視窗中開啟 {count} 個檔案',
            pinFile: '釘選檔案',
            unpinFile: '取消釘選檔案',
            pinMultipleFiles: '釘選 {count} 個檔案',
            unpinMultipleFiles: '取消釘選 {count} 個檔案',
            duplicateFile: '複製檔案',
            duplicateMultipleFiles: '複製 {count} 個檔案',
            renameFile: '重新命名檔案',
            deleteFile: '刪除檔案',
            setCalendarHighlight: '設定醒目提示',
            removeCalendarHighlight: '移除醒目提示',
            deleteMultipleFiles: '刪除 {count} 個檔案'
        },
        folder: {
            newNote: '新筆記',
            newNoteFromTemplate: '從範本新建筆記',
            newFolder: '新建資料夾',
            newCanvas: '新建畫布',
            newBase: '新建資料庫',
            newDrawing: '新建繪圖',
            newExcalidrawDrawing: '新建 Excalidraw 繪圖',
            newTldrawDrawing: '新建 Tldraw 繪圖',
            duplicateFolder: '複製資料夾',
            searchInFolder: '在資料夾中搜尋',
            createFolderNote: '建立資料夾筆記',
            detachFolderNote: '解除資料夾筆記',
            deleteFolderNote: '刪除資料夾筆記',
            changeIcon: '變更圖示',
            changeColor: '變更顏色',
            changeBackground: '變更背景',
            excludeFolder: '隱藏資料夾',
            unhideFolder: '顯示資料夾',
            excludeFromDescendants: '在父資料夾中隱藏',
            includeInDescendants: '在父資料夾中顯示',
            hiddenFromParentsIndicator: '已從父資料夾列表中隱藏',
            moveFolder: '移動資料夾至...',
            renameFolder: '重新命名資料夾',
            deleteFolder: '刪除資料夾'
        },
        tag: {
            changeIcon: '變更圖示',
            changeColor: '變更顏色',
            changeBackground: '變更背景',
            showTag: '顯示標籤',
            hideTag: '隱藏標籤'
        },
        property: {
            addKey: '設定屬性鍵',
            renameKey: '重新命名屬性',
            deleteKey: '刪除屬性'
        },
        navigation: {
            addSeparator: '新增分隔線',
            removeSeparator: '移除分隔線'
        },
        copyPath: {
            title: '複製路徑',
            asObsidianUrl: '作為 Obsidian URL',
            fromVaultFolder: '從保險庫資料夾',
            fromSystemRoot: '從系統根目錄'
        },
        style: {
            title: '樣式',
            copy: '複製樣式',
            paste: '貼上樣式',
            removeIcon: '移除圖示',
            removeColor: '移除顏色',
            removeBackground: '移除背景',
            clear: '清除樣式'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        appearance: '外觀',
        sortBy: '排序方式',
        standardPreset: '標準',
        compactPreset: '精簡',
        defaultSuffix: '(預設)',
        defaultLabel: '預設',
        titleRows: '標題行數',
        previewRows: '預覽行數',
        groupBy: '分組依據',
        titleRowOption: (rows: number) => `標題${rows}行`,
        previewRowOption: (rows: number) => `預覽${rows}行`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: '套用',
            applySortAndGroupTitle: (target: string) => `將排序與分組套用到${target}？`,
            applyAppearanceTitle: (target: string) => `將外觀套用到${target}？`,
            affectedCountMessage: (count: number) => `將更改的現有覆寫：${count}。`
        },
        manualSortConfirm: {
            propertySortTitle: '使用手動排序？',
            propertySortMessage: (property: string, count: number) =>
                `這會將目前檢視切換為使用「${property}」的手動排序。編輯順序時會依需要將數字索引值寫入該屬性，影響 ${count} 則筆記。`,
            propertySortConfirmButton: '使用手動排序',
            removePropertyTitle: '移除排序屬性？',
            removePropertyMessage: (property: string, count: number) =>
                `這會從目前列表中的 ${count} 則筆記移除「${property}」。這些筆記的手動排序順序將被清除。`,
            removePropertyConfirmButton: '移除屬性',
            compactTitle: '壓縮索引值？',
            compactMessage: (count: number) => `此次重新排序需要更多數字空間。${count} 則筆記將獲得新的索引值。`,
            compactConfirmButton: '壓縮索引值'
        },
        manualSortGroupHeader: {
            title: '設定群組標題',
            titleLabel: '標題',
            placeholder: '群組標題',
            icon: '圖示',
            color: '顏色',
            wordCount: '顯示字數',
            wordCountTarget: '目標字數',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                '此欄位為空時，群組目標會使用「設定 > 筆記 > 字數與字元數」中設定的目標屬性。為此群組設定目標值即可覆寫。',
            description: '為此筆記自訂群組標題。將標題留空以移除標題。'
        },
        mergeNotes: {
            title: '合併筆記',
            summary: '從 {folder} 中的 {count} 則筆記建立一則筆記。',
            frontmatterRule: '保留第一則筆記的 frontmatter。移除其他筆記的 frontmatter。',
            crossFolderWarning: '來源筆記位於不同資料夾。相對連結和嵌入在合併後的筆記中可能會停止運作。',
            outputName: '輸出名稱',
            outputNameDesc: '合併後的筆記會建立在上方顯示的資料夾中。',
            outputNamePlaceholder: '合併的筆記',
            separator: '分隔符',
            separatorDesc: '插入到筆記之間。',
            separatorOptions: {
                none: '無',
                blankLine: '空白行',
                horizontalRule: '水平線',
                heading: '含筆記標題的標題'
            },
            moveSourcesToTrash: '合併後將來源筆記移至回收桶',
            mergeButton: '合併'
        },
        navRainbowSection: {
            title: (section: string) => `彩虹顏色: ${section}`
        },
        iconPicker: {
            searchPlaceholder: '搜尋圖示...',
            recentlyUsedHeader: '最近使用',
            emptyStateSearch: '開始輸入以搜尋圖示',
            emptyStateNoResults: '未找到圖示',
            showingResultsInfo: '顯示 {count} 個結果中的 50 個。輸入更多內容以縮小範圍。',
            emojiInstructions: '輸入或貼上任何表情符號作為圖示使用',
            removeIcon: '移除圖示',
            removeFromRecents: '從最近使用中移除',
            allTabLabel: '全部'
        },
        fileIconRuleEditor: {
            addRuleAria: '新增規則'
        },
        interfaceIcons: {
            title: '介面圖示',
            fileItemsSection: '檔案項目',
            items: {
                'nav-shortcuts': '捷徑',
                'nav-recent-files': '最近檔案',
                'nav-expand-all': '全部展開',
                'nav-collapse-all': '全部摺疊',
                'nav-calendar': '日曆',
                'nav-tree-expand': '樹狀箭頭: 展開',
                'nav-tree-collapse': '樹狀箭頭: 摺疊',
                'nav-hidden-items': '隱藏項目',
                'nav-root-reorder': '重新排列根資料夾',
                'nav-new-folder': '新建資料夾',
                'nav-show-single-pane': '顯示單窗格',
                'nav-show-dual-pane': '顯示雙窗格',
                'nav-profile-chevron': '設定檔選單箭頭',
                'list-search': '搜尋',
                'list-reveal-file': '定位檔案',
                'list-descendants': '子資料夾中的筆記',
                'list-sort-ascending': '排序: 升序',
                'list-sort-descending': '排序: 降序',
                'list-sort-modified': '依編輯日期排序',
                'list-sort-created': '依建立日期排序',
                'list-sort-title': '依標題排序',
                'list-sort-filename': '依檔案名稱排序',
                'list-sort-property': '依屬性排序',
                'list-appearance': '變更外觀',
                'list-new-note': '新建筆記',
                'list-pinned': '釘選筆記',
                'nav-folder-open': '資料夾開啟',
                'nav-folder-closed': '資料夾關閉',
                'nav-tags': '標籤',
                'nav-tag': '標籤',
                'nav-properties': '屬性',
                'nav-property': '屬性',
                'nav-property-value': '值',
                'file-unfinished-task': '未完成任務',
                'file-word-count': '字數統計',
                'file-character-count': '字元數'
            }
        },
        colorPicker: {
            currentColor: '目前',
            newColor: '新顏色',
            paletteDefault: '預設',
            paletteCustom: '自訂',
            copyColors: '複製顏色',
            colorsCopied: '顏色已複製到剪貼簿',
            pasteColors: '貼上顏色',
            pasteClipboardError: '無法讀取剪貼簿',
            pasteInvalidFormat: '需要十六進位顏色值',
            colorsPasted: '顏色貼上成功',
            resetUserColors: '清除自訂顏色',
            clearCustomColorsConfirm: '刪除所有自訂顏色？',
            userColorSlot: '顏色 {slot}',
            recentColors: '最近使用的顏色',
            clearRecentColors: '清除最近使用的顏色',
            removeRecentColor: '移除顏色',
            apply: '套用',
            pickerLabel: '選色器',
            hexLabel: 'HEX',
            hexInputLabel: '十六進位色彩值',
            saturationValueArea: '飽和度與亮度',
            hueSlider: '色相',
            alphaSlider: '透明度'
        },
        appearance: {
            tabIcon: '圖示',
            tabColor: '顏色',
            tabBackground: '背景',
            resetIcon: '移除圖示',
            resetColor: '移除顏色',
            resetBackground: '移除背景',
            clear: '清除樣式',
            apply: '套用'
        },
        selectVaultProfile: {
            title: '選擇保險庫設定檔',
            currentBadge: '使用中',
            emptyState: '沒有可用的保險庫設定檔。'
        },
        tagOperation: {
            renameTitle: '重新命名標籤 {tag}',
            deleteTitle: '刪除標籤 {tag}',
            newTagPrompt: '新標籤名稱',
            newTagPlaceholder: '輸入新標籤名稱',
            renameWarning: '重新命名標籤 {oldTag} 將修改 {count} 個{files}。',
            deleteWarning: '刪除標籤 {tag} 將修改 {count} 個{files}。',
            modificationWarning: '這將更新檔案修改日期。',
            affectedFiles: '受影響的檔案：',
            andMore: '以及 {count} 個更多...',
            confirmRename: '重新命名標籤',
            renameUnchanged: '{tag} 未變更',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            renameBatchNotFinalized: '已重新命名 {renamed}/{total}。未更新：{notUpdated}。中繼資料和捷徑未更新。',
            invalidTagName: '請輸入有效的標籤名稱。',
            descendantRenameError: '無法將標籤移動到自身或其子標籤中。',
            confirmDelete: '刪除標籤',
            deleteBatchNotFinalized: '已從 {removed}/{total} 中刪除。未更新：{notUpdated}。中繼資料和捷徑未更新。',
            checkConsoleForDetails: '查看主控台了解詳情。',
            file: '個檔案',
            files: '個檔案',
            inlineParsingWarning: {
                title: '內嵌標籤相容性',
                message: '{tag} 包含 Obsidian 無法在內嵌標籤中解析的字元。Frontmatter 標籤不受影響。',
                confirm: '仍然使用'
            }
        },
        propertyOperation: {
            renameTitle: '重新命名屬性 {property}',
            deleteTitle: '刪除屬性 {property}',
            newKeyPrompt: '新屬性名稱',
            newKeyPlaceholder: '輸入新屬性名稱',
            renameWarning: '重新命名屬性 {property} 將修改 {count} 個{files}。',
            renameConflictWarning: '屬性 {newKey} 已存在於 {count} 個{files}中。重新命名 {oldKey} 將取代現有的 {newKey} 值。',
            deleteWarning: '刪除屬性 {property} 將修改 {count} 個{files}。',
            confirmRename: '重新命名屬性',
            confirmDelete: '刪除屬性',
            renameNoChanges: '{oldKey} → {newKey}（無變更）',
            renameSettingsUpdateFailed: '已重新命名屬性 {oldKey} → {newKey}。更新設定失敗。',
            deleteSingleSuccess: '已從 1 篇筆記中刪除屬性 {property}',
            deleteMultipleSuccess: '已從 {count} 篇筆記中刪除屬性 {property}',
            deleteSettingsUpdateFailed: '已刪除屬性 {property}。更新設定失敗。',
            invalidKeyName: '請輸入有效的屬性名稱。'
        },
        fileSystem: {
            newFolderTitle: '新建資料夾',
            renameFolderTitle: '重新命名資料夾',
            renameFileTitle: '重新命名檔案',
            deleteFolderTitle: "刪除 '{name}'？",
            deleteFileTitle: "刪除 '{name}'？",
            deleteFileAttachmentsTitle: '刪除檔案附件？',
            moveFileConflictTitle: '移動衝突',
            folderNamePrompt: '輸入資料夾名稱：',
            hideInOtherVaultProfiles: '在其他保險庫設定檔中隱藏',
            renamePrompt: '輸入新名稱：',
            renameVaultTitle: '變更保險庫顯示名稱',
            renameVaultPrompt: '輸入自訂顯示名稱（留空使用預設值）：',
            deleteFolderConfirm: '您確定要刪除此資料夾及其所有內容嗎？',
            deleteFileConfirm: '您確定要刪除此檔案嗎？',
            deleteFileAttachmentsDescriptionSingle: '此附件不再被任何筆記使用。是否要刪除？',
            deleteFileAttachmentsDescriptionMultiple: '這些附件不再被任何筆記使用。是否要刪除？',
            deleteFileAttachmentsViewFileTreeAriaLabel: '檔案樹',
            deleteFileAttachmentsViewGalleryAriaLabel: '圖庫',
            moveFileConflictDescriptionSingle: '在「{folder}」中發現檔案衝突。',
            moveFileConflictDescriptionMultiple: '在「{folder}」中發現 {count} 個檔案衝突。',
            moveFileConflictAffectedFiles: '受影響的檔案',
            moveFileConflictItem: '「{name}」->「{suggested}」{renameOnly}',
            moveFileConflictRenameOnly: '（僅重新命名）',
            moveFileConflictRename: '重新命名',
            moveFileConflictOverwrite: '覆蓋',
            removeAllTagsTitle: '移除所有標籤',
            removeAllTagsFromNote: '您確定要從這個筆記中移除所有標籤嗎？',
            removeAllTagsFromNotes: '您確定要從 {count} 個筆記中移除所有標籤嗎？'
        },
        folderNoteType: {
            title: '選擇資料夾筆記類型',
            folderLabel: '資料夾：{name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `將 ${name} 移動至資料夾...`,
            multipleFilesLabel: (count: number) => `${count} 個檔案`,
            navigatePlaceholder: '導覽至資料夾...',
            instructions: {
                navigate: '導覽',
                move: '移動',
                select: '選擇',
                dismiss: '取消'
            }
        },
        homepage: {
            placeholder: '搜尋檔案...',
            instructions: {
                navigate: '導覽',
                select: '設為首頁',
                dismiss: '取消'
            }
        },
        calendarTemplate: {
            placeholder: '搜尋範本...',
            instructions: {
                navigate: '導覽',
                select: '選擇範本',
                dismiss: '取消'
            }
        },
        navigationBanner: {
            placeholder: '搜尋圖片...',
            svgMissingDimensions: '所選 SVG 檔案未定義寬度、高度或 viewBox。',
            instructions: {
                navigate: '導覽',
                select: '設為橫幅',
                dismiss: '取消'
            }
        },
        tagSuggest: {
            navigatePlaceholder: '導覽至標籤...',
            addPlaceholder: '搜尋要新增的標籤...',
            removePlaceholder: '選擇要移除的標籤...',
            createNewTag: '建立新標籤: #{tag}',
            instructions: {
                navigate: '導覽',
                select: '選擇',
                dismiss: '取消',
                add: '新增標籤',
                remove: '移除標籤'
            }
        },
        propertySuggest: {
            placeholder: '選擇屬性鍵...',
            navigatePlaceholder: '導航到屬性...',
            instructions: {
                navigate: '導覽',
                select: '新增屬性',
                dismiss: '取消'
            }
        },
        propertyKeyVisibility: {
            title: '屬性鍵可見性',
            description: '控制屬性值的顯示位置。各欄分別對應導航面板、列表面板和檔案上下文選單。使用底部列切換某欄中的所有列。',
            searchPlaceholder: '搜尋屬性鍵...',
            propertyColumnLabel: '屬性',
            showInNavigation: '在導覽中顯示',
            showInList: '在清單中顯示',
            showInFileMenu: '在檔案選單中顯示',
            toggleAllInNavigation: '切換導覽中的全部',
            toggleAllInList: '切換清單中的全部',
            toggleAllInFileMenu: '切換檔案選單中的全部',
            applyButton: '套用',
            emptyState: '未找到屬性鍵。'
        },
        welcome: {
            title: '歡迎使用 {pluginName}',
            introText: '您好！在開始之前，強烈建議您觀看下方影片的前五分鐘，以了解面板和「顯示子資料夾中的筆記」開關是如何運作的。',
            continueText: '如果您還有五分鐘時間，請繼續觀看影片以了解精簡顯示模式以及如何正確設定捷徑和重要的快速鍵。',
            thanksText: '非常感謝您的下載，祝您使用愉快！',
            videoAlt: '安裝與精通 Notebook Navigator',
            openVideoButton: '播放影片',
            closeButton: '以後再說'
        }
    },

    // File system operations
    fileSystem: {
        errors: {
            createFolder: '建立資料夾失敗：{error}',
            createFile: '建立檔案失敗：{error}',
            renameFolder: '重新命名資料夾失敗：{error}',
            renameFolderNoteConflict: '無法重新命名：「{name}」已在此資料夾中存在',
            renameFile: '重新命名檔案失敗：{error}',
            deleteFolder: '刪除資料夾失敗：{error}',
            deleteFile: '刪除檔案失敗：{error}',
            deleteAttachments: '刪除附件失敗: {error}',
            mergeNotes: '合併筆記失敗: {error}',
            mergeNotesOpenOutput: '合併後的筆記已建立為 {name}，但無法開啟: {error}。來源筆記未變更。',
            mergeNotesOpenSkipped: '另一個檔案開啟請求已優先執行。',
            mergeNotesTrashSources: '合併後的筆記已建立。無法將 {count} 則來源筆記移至回收桶。',
            duplicateNote: '複製筆記失敗：{error}',
            duplicateFolder: '複製資料夾失敗：{error}',
            openVersionHistory: '開啟版本歷史失敗：{error}',
            versionHistoryNotFound: '未找到版本歷史命令。請確保已啟用 Obsidian 同步。',
            revealInExplorer: '在系統檔案總管中定位檔案失敗：{error}',
            openInDefaultApp: '以預設應用程式開啟失敗：{error}',
            openInDefaultAppNotAvailable: '此平台不支援以預設應用程式開啟',
            folderNoteAlreadyExists: '資料夾筆記已存在',
            folderAlreadyExists: '資料夾「{name}」已存在',
            folderNotesDisabled: '請在設定中啟用資料夾筆記以轉換檔案',
            folderNoteAlreadyLinked: '此檔案已作為資料夾筆記',
            folderNoteNotFound: '所選資料夾中沒有資料夾筆記',
            folderNoteUnsupportedExtension: '不支援的檔案副檔名：{extension}',
            folderNoteMoveFailed: '轉換過程中移動檔案失敗：{error}',
            folderNoteRenameConflict: '資料夾中已存在名為「{name}」的檔案',
            folderNoteConversionFailed: '轉換為資料夾筆記失敗',
            folderNoteConversionFailedWithReason: '轉換為資料夾筆記失敗：{error}',
            folderNoteOpenFailed: '檔案已轉換但開啟資料夾筆記失敗：{error}',
            failedToDeleteFile: '刪除 {name} 失敗: {error}',
            failedToDeleteMultipleFiles: '刪除 {count} 個檔案失敗',
            versionHistoryNotAvailable: '版本歷史服務不可用',
            drawingAlreadyExists: '同名繪圖已存在',
            failedToCreateDrawing: '建立繪圖失敗',
            noFolderSelected: 'Notebook Navigator 中未選擇資料夾',
            noFileSelected: '未選擇檔案'
        },
        warnings: {
            linkBreakingNameCharacters: '該名稱包含會破壞 Obsidian 連結的字元：#, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: '名稱不能以 . 開頭，也不能包含 : 或 /。',
            forbiddenNameCharactersWindows: 'Windows 保留字元不允許使用：<, >, ", \\, |, ?, *。'
        },
        notices: {
            hideFolder: '已隱藏資料夾：{name}',
            showFolder: '已顯示資料夾：{name}',
            folderExcludedFromDescendants: '已從父資料夾列表中隱藏：{name}',
            folderIncludedInDescendants: '已在父資料夾列表中顯示：{name}',
            mergeNotes: '已將 {count} 則筆記合併到 {name}'
        },
        notifications: {
            deletedMultipleFiles: '已刪除 {count} 個檔案',
            movedMultipleFiles: '已將 {count} 個檔案移動至 {folder}',
            folderNoteConversionSuccess: '已在「{name}」中將檔案轉換為資料夾筆記',
            folderMoved: '已移動資料夾「{name}」',
            deepLinkCopied: 'Obsidian URL 已複製到剪貼簿',
            pathCopied: '路徑已複製到剪貼簿',
            relativePathCopied: '相對路徑已複製到剪貼簿',
            tagAddedToNote: '已將標籤新增到 1 個筆記',
            tagAddedToNotes: '已將標籤新增到 {count} 個筆記',
            tagRemovedFromNote: '已從 1 個筆記中移除標籤',
            tagRemovedFromNotes: '已從 {count} 個筆記中移除標籤',
            tagsClearedFromNote: '已從 1 個筆記中清除所有標籤',
            tagsClearedFromNotes: '已從 {count} 個筆記中清除所有標籤',
            noTagsToRemove: '沒有可移除的標籤',
            noFilesSelected: '未選擇檔案',
            mergeNotesRequireMultipleMarkdown: '請選擇至少兩則 Markdown 筆記進行合併',
            tagOperationsNotAvailable: '標籤操作不可用',
            propertyOperationsNotAvailable: '屬性操作不可用',
            tagsRequireMarkdown: '標籤僅支援 Markdown 筆記',
            propertiesRequireMarkdown: '屬性僅在 Markdown 筆記中受支援',
            propertySetOnNote: '已在 1 篇筆記中更新屬性',
            propertySetOnNotes: '已在 {count} 篇筆記中更新屬性',
            manualSortPropertyRemovedFromNote: '已從 1 則筆記移除排序屬性',
            manualSortPropertyRemovedFromNotes: '已從 {count} 則筆記移除排序屬性',
            iconPackDownloaded: '{provider} 已下載',
            iconPackUpdated: '{provider} 已更新 ({version})',
            iconPackRemoved: '{provider} 已移除',
            iconPackLoadFailed: '{provider} 載入失敗',
            hiddenFileReveal: '檔案已隱藏。啟用「顯示隱藏項目」以顯示它'
        },
        confirmations: {
            deleteMultipleFiles: '確定要刪除 {count} 個檔案嗎？',
            deleteConfirmation: '此操作無法復原。'
        },
        defaultNames: {
            untitled: '未命名'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: '無法將資料夾移動到自身或其子資料夾中。',
            itemAlreadyExists: '此位置已存在名為「{name}」的項目。',
            failedToMove: '移動失敗：{error}',
            failedToAddTag: '新增標籤「{tag}」失敗',
            failedToSetProperty: '更新屬性失敗: {error}',
            failedToClearTags: '清除標籤失敗',
            failedToMoveFolder: '移動資料夾「{name}」失敗',
            failedToImportFiles: '匯入失敗：{names}'
        },
        notifications: {
            filesAlreadyExist: '{count} 個檔案在目標位置已存在',
            filesAlreadyHaveTag: '{count} 個檔案已經有此標籤或更具體的標籤',
            filesAlreadyHaveProperty: '{count} 個檔案已擁有此屬性',
            noTagsToClear: '沒有要清除的標籤',
            fileImported: '已匯入 1 個檔案',
            filesImported: '已匯入 {count} 個檔案'
        }
    },

    // Date grouping
    dateGroups: {
        today: '今天',
        yesterday: '昨天',
        previous7Days: '過去 7 天',
        previous30Days: '過去 30 天'
    },

    // Plugin commands
    commands: {
        open: '開啟',
        toggleLeftSidebar: '切換左側邊欄',
        openHomepage: '開啟首頁',
        openDailyNote: '開啟每日筆記',
        openWeeklyNote: '開啟每週筆記',
        openMonthlyNote: '開啟每月筆記',
        openQuarterlyNote: '開啟季度筆記',
        openYearlyNote: '開啟每年筆記',
        revealFile: '定位檔案',
        search: '搜尋',
        searchVaultRoot: '搜尋整個保險庫',
        toggleDualPane: '切換雙窗格布局',
        toggleDualPaneOrientation: '切換雙窗格方向', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: '切換日曆',
        selectVaultProfile: '變更保險庫設定檔',
        selectVaultProfile1: '切換到保險庫設定檔 1',
        selectVaultProfile2: '切換到保險庫設定檔 2',
        selectVaultProfile3: '切換到保險庫設定檔 3',
        deleteFile: '刪除檔案',
        createNewNote: '建立新筆記',
        createNewNoteFromTemplate: '從範本新建筆記',
        moveFiles: '移動檔案',
        mergeNotes: '合併筆記', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: '選擇下一個檔案',
        selectPreviousFile: '選擇上一個檔案',
        navigateBack: '向後導覽',
        navigateForward: '向前導覽',
        convertToFolderNote: '轉換為資料夾筆記',
        setAsFolderNote: '設為資料夾筆記',
        detachFolderNote: '解除資料夾筆記',
        pinAllFolderNotes: '釘選所有資料夾筆記',
        navigateToFolder: '導覽至資料夾',
        navigateToTag: '導覽至標籤',
        navigateToProperty: '導航到屬性',
        addShortcut: '新增至捷徑',
        openShortcut: '開啟捷徑 {number}',
        toggleDescendants: '切換後代',
        toggleHidden: '切換隱藏的資料夾、標籤和筆記',
        toggleTagSort: '切換標籤排序',
        toggleTagsBySelection: '依選擇切換標籤',
        togglePropertiesBySelection: '依選擇切換屬性',
        toggleCompactMode: '切換精簡模式', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: '切換置頂區域',
        collapseExpand: '摺疊/展開所有項目',
        collapseExpandSelectedItem: '摺疊/展開所選項目',
        addTag: '為選定檔案新增標籤',
        setProperty: '為選定檔案設定屬性', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: '從選定檔案移除標籤',
        removeAllTags: '從選定檔案移除所有標籤',
        openAllFiles: '開啟所有檔案',
        rebuildCache: '重建快取',
        restoreDefaultSettings: '還原預設設定' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: '筆記本導覽器',
        calendarViewName: '日曆',
        folderNoteSidebarViewName: '資料夾筆記',
        ribbonTooltip: '筆記本導覽器',
        revealInNavigator: '在筆記本導覽器中定位',
        settingsUnavailableNotice:
            '筆記本導覽器無法讀取其設定,因此未啟動。如果儲存庫正在同步,請在同步完成後重新啟動 Obsidian。若要以預設設定重新開始,請執行命令「還原預設設定」。', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsRecovery: {
            confirmTitle: '還原預設設定', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                '此操作會將筆記本導覽器的設定檔替換為預設設定。如果儲存庫仍在同步,還原的預設設定可能會覆寫其他裝置上儲存的設定。可讀取的設定檔會先複製到外掛資料夾中帶有時間戳記的備份檔。', // Body of the confirmation dialog for the settings recovery command
            confirmButton: '還原預設', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: '無法完成設定還原。已保留本機偏好設定。', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: '已還原預設設定。請重新啟動 Obsidian 以完成。' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: '最後修改於',
        createdAt: '建立於',
        file: '個檔案',
        files: '個檔案',
        folder: '個資料夾',
        folders: '個資料夾',
        wordCount: '字數'
    },

    fileCounts: {
        words: '{count} 個詞',
        characters: '{count} 個字元',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: '變更預設設定',
        metadataReport: {
            exportSuccess: '失敗的中繼資料報告已匯出至：{filename}',
            exportFailed: '匯出中繼資料報告失敗'
        },
        sections: {
            general: '一般',
            vaultFilters: '顯示篩選器',
            appearanceBehavior: '外觀與行為',
            navigationPane: '導覽窗格',
            calendar: '導覽日曆',
            fileOperations: '檔案操作',
            icons: '圖示包',
            folders: '資料夾',
            folderNotes: '資料夾筆記',
            folderNoteFiles: '資料夾筆記檔案',
            foldersAndFolderNotes: '資料夾與資料夾筆記',
            tagsAndProperties: '標籤與屬性',
            tags: '標籤',
            listPane: '列表窗格',
            notes: '檔案顯示',
            shortcutsAndRecentFiles: '快捷方式與最近檔案',
            advanced: '進階'
        },
        pageGroups: {
            configuration: '設定',
            navigationAndContent: '導覽窗格',
            notesAndLists: '列表窗格',
            calendarAndTools: '日曆與工具'
        },
        pageDescriptions: {
            general: '發行說明、支援、保險庫設定檔、檔案類型與屬性鍵。',
            vaultFilters: '隱藏的資料夾、標籤、檔案、檔案標籤與屬性規則。',
            appearanceBehavior: '行為、鍵盤導覽、滑鼠按鈕、外觀與格式。',
            navigationPane: '版面配置、外觀、筆記數量、摺疊行為與彩虹顏色。',
            shortcuts: '快捷方式可見性、徽章、最近檔案與釘選項目。',
            calendar: '日曆顯示、日期筆記、範本、區域設定與側邊欄位置。',
            fileOperations: '範本、刪除確認、附件與檔案移動衝突行為。',
            foldersAndFolderNotes: '資料夾顯示、資料夾筆記、資料夾筆記範本與資料夾筆記行為。',
            tagsProperties: '標籤與屬性區段、圖示、排序、範圍與繼承。',
            listPane: '排序、群組、列表模式、釘選筆記與繪圖預覽。',
            frontmatter: '用於顯示名稱、時間戳記、圖示與顏色的前置中繼資料欄位。',
            notes: '標題、預覽文字、特色圖片、標籤、屬性、日期、字數與字元數。',
            iconPacks: '介面圖示、檔案圖示與圖示包管理。',
            advanced: '診斷、中繼資料清理、匯入/匯出與重設。'
        },
        groups: {
            general: {
                vaultConfiguration: '保險庫設定',
                templates: '範本',
                behavior: '行為',
                startup: '啟動',
                keyboardNavigation: '鍵盤導覽',
                mouseButtons: '滑鼠按鈕',
                view: '外觀',
                icons: '圖示',
                desktopAppearance: '桌面外觀',
                mobileAppearance: '行動裝置外觀',
                formatting: '格式'
            },
            advanced: {
                maintenance: '維護',
                resetSettings: '重設設定'
            },
            navigation: {
                appearance: '外觀',
                banner: '橫幅',
                collapseItems: '摺疊項目',
                dragAndDrop: '拖放',
                noteCounts: '筆記數',
                rainbowColors: '彩虹顏色',
                leftSidebar: '左側邊欄',
                calendarIntegration: '行事曆整合'
            },
            list: {
                display: '外觀',
                groupHeaders: '群組標題',
                propertySort: '屬性排序',
                manualSort: '手動排序',
                pinnedNotes: '釘選筆記',
                drawingPreviews: '繪圖預覽'
            },
            notes: {
                frontmatter: '前置中繼資料欄位',
                tasks: '任務',
                icon: '圖示',
                title: '標題',
                previewText: '預覽文字',
                featureImage: '特色圖片',
                tags: '標籤',
                properties: '屬性',
                date: '日期',
                parentFolder: '父資料夾',
                wordCount: '字數與字元數'
            }
        },
        syncMode: {
            notSynced: '（未同步）',
            switchToSynced: '啟用同步',
            switchToLocal: '停用同步'
        },
        items: {
            listPaneTitle: {
                name: '列表窗格標題',
                desc: '選擇列表窗格標題的顯示位置。',
                options: {
                    header: '顯示在標題列',
                    list: '顯示在列表窗格',
                    hidden: '不顯示'
                }
            },
            sortNotesBy: {
                name: '預設排序方式',
                desc: '選擇筆記的預設排序方式。',
                options: {
                    'modified-desc': '編輯日期（最新在頂部）',
                    'modified-asc': '編輯日期（最舊在頂部）',
                    'created-desc': '建立日期（最新在頂部）',
                    'created-asc': '建立日期（最舊在頂部）',
                    'title-asc': '標題（升序）',
                    'title-desc': '標題（降序）',
                    'filename-asc': '檔案名稱（升序）',
                    'filename-desc': '檔案名稱（降序）'
                },
                directions: {
                    asc: '升序',
                    desc: '降序'
                },
                fields: {
                    modified: '編輯日期',
                    created: '建立日期',
                    title: '標題',
                    filename: '檔案名稱',
                    property: '屬性'
                }
            },
            propertySortKey: {
                name: '用於排序的屬性',
                desc: '顯示為屬性排序選項的以逗號分隔的 frontmatter 屬性。陣列值會合併為單一字串。這些屬性不會被變更。',
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: '次要排序',
                desc: '與屬性排序配合使用，當筆記具有相同的屬性值或沒有屬性值時生效。',
                options: {
                    title: '標題',
                    filename: '檔案名稱',
                    created: '建立日期',
                    modified: '編輯日期'
                }
            },
            propertySortInstructions: {
                intro: '上面列出的每個屬性都會在列表面板的排序選單中顯示為排序選項。選擇其中一個會依其 frontmatter 值排序筆記。'
            },
            manualSortPropertyKey: {
                name: '手動排序屬性',
                desc: '用於儲存手動排序數字索引值的 frontmatter 屬性。'
            },
            manualSortGroupHeaderProperty: {
                name: '群組標題屬性',
                desc: '用於儲存自訂群組標題的 frontmatter 屬性。'
            },
            groupHeadersInstructions: {
                intro: '自訂群組標題會顯示在列表面板的筆記上方。',
                items: ['從列表面板的排序選單中，將分組設定為 **自訂**。', '右鍵點擊筆記並選擇 **設定群組標題** 以在其上方新增標題。']
            },
            manualSortNewNotePlacement: {
                name: '新筆記位置',
                desc: '選擇當目前列表使用手動排序時新筆記的放置位置。',
                options: {
                    top: '頂部',
                    bottom: '底部',
                    'below-selected-note': '在選定筆記下方',
                    unsorted: '未排序'
                }
            },
            confirmBeforeManualSort: {
                name: '手動排序前確認',
                desc: '在首次將手動排序屬性寫入筆記之前顯示警告。停用時，筆記將不顯示警告即接收該屬性。'
            },
            manualSortInstructions: {
                intro: '手動排序會將數字索引值寫入每則筆記的 frontmatter 屬性。沒有索引的筆記會顯示在「未排序」之下。',
                items: [
                    '從排序選單中選擇 **手動排序** 以啟用手動排序。之後有兩種方式可以重新排列筆記。',
                    '從排序選單中選擇 **編輯排序方式...** 以開啟重新排序檢視。使用滑鼠拖曳筆記，或在行動裝置上使用觸控。在桌面上，**Cmd/Ctrl** 或 **Shift** 點擊可選取多則筆記，拖曳其中任何一則即可移動整個群組。',
                    '在列表面板中，選取一則筆記或多選數則，然後按 **Cmd/Ctrl + Arrow Up/Down** 將所選項目上移或下移。'
                ]
            },
            revealFileOnListChanges: {
                name: '列表變更時捲動到選定檔案',
                desc: '在釘選筆記、顯示後代筆記、變更資料夾外觀或執行檔案操作時捲動到選定的檔案。'
            },
            includeDescendantNotes: {
                name: '顯示子資料夾/後代的筆記',
                desc: '在檢視資料夾、標籤或屬性時包含巢狀子資料夾以及標籤和屬性後代中的筆記。'
            },
            limitPinnedToCurrentFolder: {
                name: '僅在筆記所在資料夾中釘選',
                desc: '釘選筆記僅在其所在資料夾中顯示為已釘選。適用於資料夾筆記或釘選筆記較多的情況。不影響標籤或屬性檢視。'
            },
            separateNoteCounts: {
                name: '分別顯示目前和後代筆記計數',
                desc: '為資料夾、標籤和屬性以「目前 ▾ 後代」格式顯示筆記計數。'
            },
            groupNotes: {
                name: '預設分組',
                desc: '自訂顯示在 frontmatter 中定義的標題。日期按日期分組筆記。資料夾按資料夾分組筆記。選擇資料夾時，標籤和屬性檢視使用日期分組。',
                options: {
                    custom: '自訂',
                    date: '日期',
                    folder: '資料夾'
                }
            },
            showSelectedNavigationPills: {
                name: '始終顯示所有標籤和屬性標記',
                desc: '停用時，與目前導覽選擇相符的標記會被隱藏（例如，瀏覽「食譜」標籤時，「食譜」標籤標記會被隱藏）。啟用後所有標記始終可見。'
            },
            stickyGroupHeaders: {
                name: '固定群組標題',
                desc: '捲動時保持目前的日期、資料夾或釘選區段的標題可見。'
            },
            showFolderGroupPaths: {
                name: '顯示子資料夾路徑',
                desc: '在列表窗格中按資料夾分組時，顯示子資料夾路徑，而不是僅顯示資料夾名稱。'
            },
            showGroupHeaderItemCounts: {
                name: '顯示項目計數',
                desc: '在列表窗格的每個群組標題中顯示項目數量。'
            },
            showCurrentFolderFilesAtBottom: {
                name: '資料夾分組：目前資料夾檔案置底',
                desc: '當預設分組為資料夾時，將所選資料夾中的直屬檔案移到子資料夾分組下方。'
            },
            defaultListMode: {
                name: '預設列表模式',
                desc: '選擇預設列表布局。標準顯示標題、日期、描述和預覽文字。精簡只顯示標題。外觀可按資料夾覆寫。',
                options: {
                    standard: '標準',
                    compact: '精簡'
                }
            },
            showFileIcons: {
                name: '顯示檔案圖示',
                desc: '顯示檔案圖示並保留左對齊間距。停用後將移除圖示和縮排。優先順序：未完成任務圖示 > 自訂圖示 > 資料夾圖示 > 檔名圖示 > 檔案類型圖示 > 預設圖示。'
            },
            useFolderIcon: {
                name: '使用資料夾圖示',
                desc: '當未設定自訂檔案圖示時顯示父資料夾圖示。當未設定自訂檔案顏色時使用資料夾顏色。'
            },
            showFileIconUnfinishedTask: {
                name: '未完成任務圖示',
                desc: '當筆記包含未完成任務時顯示任務圖示。'
            },
            showFileBackgroundUnfinishedTask: {
                name: '未完成任務背景',
                desc: '當筆記包含未完成任務時套用背景顏色。'
            },
            unfinishedTaskBackgroundColor: {
                name: '未完成任務背景顏色',
                desc: '設定筆記包含未完成任務時使用的背景顏色。'
            },
            showFilenameMatchIcons: {
                name: '按檔名設定圖示',
                desc: '根據檔名中的文字指派圖示。'
            },
            fileNameIconMap: {
                name: '檔名圖示對應',
                desc: '包含指定文字的檔案將取得指定圖示。每行一個對應：文字=圖示',
                placeholder: '# 文字=圖示\n會議=ph-calendar\n發票=ph-receipt',
                editTooltip: '編輯對應'
            },
            showCategoryIcons: {
                name: '按檔案類型設定圖示',
                desc: '根據檔案副檔名指派圖示。'
            },
            fileTypeIconPreset: {
                name: '檔案圖示預設',
                desc: '選擇內建圖示或圖示包預設。自訂副檔名規則會覆寫此預設。',
                options: {
                    none: '內建圖示'
                },
                notInstalledWarning: '未安裝此圖示包。將改為顯示內建圖示。'
            },
            fileTypeIconMap: {
                name: '檔案類型圖示對應',
                desc: '具有指定副檔名的檔案將取得指定圖示。每行一個對應：副檔名=圖示',
                placeholder: '# 副檔名=圖示\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: '編輯對應'
            },
            compactItemHeight: {
                name: '精簡項目高度',
                desc: '設定桌面和行動裝置的精簡列表項目高度（像素）。',
                resetTooltip: '恢復預設值 (28px)'
            },
            compactItemHeightScaleText: {
                name: '隨精簡高度縮放文字',
                desc: '當減小精簡列表項目高度時同步縮放文字。'
            },
            showParentFolder: {
                name: '顯示父資料夾',
                desc: '為子資料夾、標籤或屬性中的筆記顯示父資料夾路徑。'
            },
            parentFolderClickRevealsFile: {
                name: '點按父資料夾開啟資料夾',
                desc: '點按父資料夾名稱時，在列表面板中開啟該資料夾。'
            },
            showParentFolderColor: {
                name: '顯示父資料夾顏色',
                desc: '在父資料夾標籤上使用資料夾顏色。'
            },
            showParentFolderIcon: {
                name: '顯示父資料夾圖示',
                desc: '在父資料夾標籤旁顯示資料夾圖示。'
            },
            showQuickActions: {
                name: '顯示快速操作',
                desc: '懸停在檔案上時顯示操作按鈕。按鈕控制項選擇顯示哪些操作。'
            },
            dualPane: {
                name: '雙窗格布局',
                desc: '在桌面端並排顯示導覽窗格和列表窗格。'
            },
            dualPaneOrientation: {
                name: '雙欄布局方向',
                desc: '雙欄啟用時選擇水平或垂直布局。',
                options: {
                    horizontal: '水平分割',
                    vertical: '垂直分割'
                }
            },
            narrowSidebarLayout: {
                name: '側邊欄過窄時',
                desc: '選擇導覽窗格和清單窗格無法並排顯示時的處理方式。',
                options: {
                    none: '不執行任何動作',
                    singlePane: '切換到單窗格',
                    vertical: '切換到垂直分割'
                }
            },
            narrowSidebarTrigger: {
                name: '窄側邊欄閾值',
                desc: '選擇側邊欄寬度閾值的計算方式。',
                options: {
                    fitPanes: '適配窗格',
                    customWidth: '自訂寬度'
                }
            },
            narrowSidebarCustomWidth: {
                name: '窄側邊欄閾值寬度',
                desc: '當側邊欄窄於此寬度時切換。',
                resetTooltip: '重設為預設寬度'
            },
            appearanceBackground: {
                name: '背景色',
                desc: '為導覽窗格和列表窗格選擇背景色。',
                options: {
                    separate: '分開背景',
                    primary: '使用列表背景',
                    secondary: '使用導覽背景'
                }
            },
            appearanceScale: {
                name: '縮放級別',
                desc: '控制 Notebook Navigator 的整體縮放級別（百分比）。'
            },
            useFloatingToolbars: {
                name: '在 iOS/iPadOS 上使用浮動工具列',
                desc: '僅適用於 iOS 和 iPadOS。'
            },
            startView: {
                name: '預設啟動檢視',
                desc: '選擇開啟 Notebook Navigator 時處於作用中的窗格。單窗格版面配置會優先顯示此窗格；雙窗格版面配置會將鍵盤焦點移至此窗格。',
                options: {
                    navigation: '導覽窗格',
                    files: '列表窗格'
                }
            },
            toolbarButtons: {
                name: '工具列按鈕',
                desc: '選擇在工具列中顯示哪些按鈕。隱藏的按鈕仍可透過命令和選單存取。',
                navigationLabel: '導覽工具列',
                listLabel: '列表工具列'
            },
            createNewNotesInNewTab: {
                name: '在新分頁中開啟新筆記',
                desc: '啟用後，「建立新筆記」命令會在新分頁中開啟筆記。停用後，筆記將取代目前的分頁。'
            },
            autoRevealActiveNote: {
                name: '自動定位使用中的筆記',
                desc: '從快速切換器、連結或搜尋開啟筆記時自動顯示。'
            },
            autoRevealShortestPath: {
                name: '自動顯示：使用最短路徑',
                desc: '啟用：自動顯示選擇最近的可見祖先資料夾或標籤。停用：自動顯示選擇檔案的實際資料夾和精確標籤。'
            },
            autoRevealIgnoreRightSidebar: {
                name: '自動顯示：忽略右側邊欄事件',
                desc: '在右側邊欄中點按或變更筆記時不變更使用中的筆記。'
            },
            autoRevealIgnoreOtherWindows: {
                name: '自動顯示：忽略其他視窗的事件',
                desc: '在其他視窗中操作筆記時不變更使用中的筆記。'
            },
            paneTransitionDuration: {
                name: '單窗格動畫',
                desc: '在單窗格模式下切換窗格時的過渡持續時間（毫秒）。',
                resetTooltip: '重設為預設值'
            },
            autoSelectFirstFileOnFocusChange: {
                name: '自動選擇第一個筆記',
                desc: '切換資料夾、標籤或屬性時自動開啟第一個筆記。'
            },
            skipAutoScroll: {
                name: '停用捷徑自動捲動',
                desc: '點按捷徑中的項目時不捲動導覽面板。'
            },
            autoExpandNavItems: {
                name: '選取時展開',
                desc: '選取時展開資料夾和標籤。在單窗格模式下，首次選取展開，再次選取顯示檔案。'
            },
            collapseOtherBranchesOnExpand: {
                name: '僅展開一個分支',
                desc: '展開資料夾、標籤或屬性時，摺疊同一樹狀結構中的其他分支。'
            },
            springLoadedFolders: {
                name: '拖曳時展開',
                desc: '拖曳操作中懸停時展開資料夾和標籤。'
            },
            springLoadedFoldersInitialDelay: {
                name: '拖曳時展開：首次展開延遲',
                desc: '拖曳時首次展開資料夾或標籤前的延遲（秒）。'
            },
            springLoadedFoldersSubsequentDelay: {
                name: '拖曳時展開：後續展開延遲',
                desc: '同一次拖曳中展開更多資料夾或標籤前的延遲（秒）。'
            },
            navigationBanner: {
                name: '導覽橫幅（保險庫設定檔）',
                desc: '在導覽窗格頂部顯示一張圖片。隨所選保險庫設定檔而變化。',
                current: '目前橫幅：{path}',
                chooseButton: '選擇圖片'
            },
            pinNavigationBanner: {
                name: '固定橫幅',
                desc: '將導航橫幅固定在導航樹上方。'
            },
            showShortcuts: {
                name: '顯示捷徑',
                desc: '在導覽窗格中顯示捷徑區段。'
            },
            shortcutBadgeDisplay: {
                name: '捷徑徽章',
                desc: '在捷徑旁邊顯示的內容。使用「開啟捷徑 1-9」命令可直接開啟捷徑。',
                options: {
                    index: '位置 (1-9)',
                    count: '項目計數',
                    none: '無'
                }
            },
            showRecentNotes: {
                name: '顯示最近檔案',
                desc: '在導覽窗格中顯示最近檔案區段。'
            },
            hideRecentNotes: {
                name: '從最近檔案中隱藏檔案類型',
                desc: '選擇在最近檔案區段中隱藏的檔案類型。',
                options: {
                    none: '無',
                    folderNotes: '資料夾筆記'
                }
            },
            recentNotesCount: {
                name: '最近檔案數量',
                desc: '要顯示的最近檔案數量。'
            },
            pinRecentNotesWithShortcuts: {
                name: '將最近檔案與捷徑一起釘選',
                desc: '釘選捷徑時包含最近檔案。'
            },
            calendarEnabled: {
                name: '啟用日曆',
                desc: '啟用 Notebook Navigator 的日曆功能。'
            },
            calendarPlacement: {
                name: '日曆位置',
                desc: '在左側邊欄或右側邊欄中顯示。',
                options: {
                    leftSidebar: '左側邊欄',
                    rightSidebar: '右側邊欄'
                }
            },
            calendarLeftPlacement: {
                name: '單窗格位置',
                desc: '單窗格模式下日曆顯示的位置。',
                options: {
                    navigationPane: '導航窗格',
                    below: '窗格下方'
                }
            },
            calendarLocale: {
                name: '日曆語言',
                desc: '控制日曆日期格式、週編號和每週的第一天。',
                weekPathMismatchWarning: '可見日曆和週記路徑使用了不同的每週起始日或週編號方式。',
                options: {
                    systemDefault: '系統預設'
                }
            },
            calendarWeekendDays: {
                name: '週末',
                desc: '以不同背景顏色顯示週末。',
                options: {
                    none: '無',
                    satSun: '週六和週日',
                    friSat: '週五和週六',
                    thuFri: '週四和週五'
                }
            },
            calendarMonthHeadingFormat: {
                name: '月份名稱格式',
                desc: '顯示完整（一月）或簡稱（1月）的月份名稱。',
                options: {
                    full: '一月 (完整)',
                    short: '1月 (簡稱)'
                }
            },
            showInfoButtons: {
                name: '顯示資訊按鈕',
                desc: '在搜尋列和日曆標題中顯示資訊按鈕。'
            },
            calendarWeeksToShow: {
                name: '左側邊欄顯示週數',
                desc: '右側邊欄的日曆始終顯示完整月份。',
                options: {
                    fullMonth: '完整月份',
                    oneWeek: '1 週',
                    weeksCount: '{count} 週'
                }
            },
            calendarHighlightToday: {
                name: '醒目顯示今天日期',
                desc: '使用背景顏色和粗體文字醒目顯示今天日期。'
            },
            calendarShowFeatureImage: {
                name: '顯示特色圖片',
                desc: '在日曆中顯示筆記的特色圖片。'
            },
            calendarShowTasks: {
                name: '顯示任務',
                desc: '在包含未完成任務的日、週和月上顯示指示器。'
            },
            calendarShowWeekNumber: {
                name: '顯示週號',
                desc: '在每行開頭顯示週號。'
            },
            calendarShowQuarter: {
                name: '顯示季度',
                desc: '在行事曆標題中新增季度標籤。'
            },
            calendarShowYearCalendar: {
                name: '顯示年曆',
                desc: '在右側邊欄中顯示年份導覽和月份網格。'
            },
            calendarConfirmBeforeCreate: {
                name: '建立前確認',
                desc: '點按沒有筆記的日期時顯示確認對話方塊。'
            },
            calendarIntegrationMode: {
                name: '日記來源',
                desc: '行事曆筆記的來源。',
                options: {
                    dailyNotes: '日記（核心外掛）',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: '資料夾和日期格式在日記核心外掛程式中設定。'
                }
            },
            calendarPeriodicNotesLocale: {
                name: '週期筆記語言',
                desc: '控制 Notebook Navigator 週期筆記路徑中本地化的月份名稱、星期名稱、週號和每週起始日。',
                options: {
                    calendar: '日曆',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: '根資料夾',
                desc: '週期筆記的基礎資料夾。日期模式可以包含子資料夾。隨所選儲存庫設定檔更改。',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: '範本資料夾位置',
                desc: '範本檔案選擇器顯示此資料夾中的筆記。',
                placeholder: 'Templates',
                usage: '用於行事曆筆記與資料夾筆記。在導覽日曆 > 行事曆整合和資料夾與資料夾筆記 > 資料夾筆記檔案中設定範本。'
            },
            calendarCustomFilePattern: {
                name: '日記',
                desc: '使用 Moment 日期格式設定路徑。將子資料夾名稱用方括號括起來，例如 [Work]/YYYY。點擊範本圖示設定範本。在檔案操作 > 範本中設定範本資料夾位置。',
                momentDescPrefix: '使用 ',
                momentLinkText: 'Moment 日期格式',
                momentDescSuffix:
                    ' 設定路徑。將子資料夾名稱用方括號括起來，例如 [Work]/YYYY。點擊範本圖示設定範本。在檔案操作 > 範本中設定範本資料夾位置。',
                templaterSupportInstalled: '✅ 已安裝 Templater 外掛，支援完整範本功能。',
                templaterSupportMissing: '⚠️ 安裝 Templater 外掛以支援完整範本功能。',
                placeholder: 'YYYY/YYYYMMDD',
                example: '目前語法：{path}',
                parsingError: '模式必須能格式化並重新解析為完整日期（年、月、日）。'
            },
            calendarCustomWeekPattern: {
                name: '週記',
                parsingError: '模式必須能格式化並重新解析為完整週（週年、週數）。',
                weekPathMismatchWarning: '週記路徑使用週期筆記語言。請使用相符的語言，或使用 "GGGG" 搭配 "WW" 以星期一為基準的週。',
                mixedWeekTokensWarning:
                    '此模式混用了以星期一為基準的週標記（"W" 或 "G"）和以語言為基準的週標記（"w" 或 "g"）。請始終使用同一組：以星期一為基準的週使用 "GGGG" 搭配 "WW"，若週記應遵循所選語言設定，則使用 "gggg" 搭配 "ww"。'
            },
            calendarCustomMonthPattern: {
                name: '月記',
                parsingError: '模式必須能格式化並重新解析為完整月份（年、月）。'
            },
            calendarCustomQuarterPattern: {
                name: '季度筆記',
                parsingError: '模式必須能格式化並重新解析為完整季度（年、季度）。'
            },
            calendarCustomYearPattern: {
                name: '年記',
                parsingError: '模式必須能格式化並重新解析為完整年份（年）。'
            },
            calendarTemplateFile: {
                current: '範本檔案：{name}'
            },
            showTooltips: {
                name: '顯示工具提示',
                desc: '懸停時顯示筆記和資料夾的額外資訊工具提示。'
            },
            showTooltipPath: {
                name: '在工具提示中顯示路徑',
                desc: '在工具提示中的筆記名稱下方顯示資料夾路徑。'
            },
            showTooltipWordCount: {
                name: '在工具提示中顯示字數',
                desc: '在工具提示中顯示筆記字數。'
            },
            resetPaneSeparator: {
                name: '重設面板分隔符位置',
                desc: '將導覽面板和列表面板之間的可拖曳分隔符重設為預設位置。',
                buttonText: '重設分隔符',
                notice: '分隔符位置已重設。重新啟動 Obsidian 或重新開啟 Notebook Navigator 以套用。'
            },
            settingsTransfer: {
                name: '匯入和匯出設定',
                desc: '將 Notebook Navigator 設定匯出或匯入為 JSON。匯入會取代所有設定。',
                importButtonText: '匯入',
                exportButtonText: '匯出',
                import: {
                    modalTitle: '匯入設定',
                    fileButtonName: '從檔案匯入',
                    fileButtonDesc: '從磁碟載入 JSON 檔案。',
                    fileButtonText: '從檔案匯入',
                    editorName: 'JSON',
                    editorDesc: '在下方貼上或編輯 JSON。未包含的設定將重設為預設值。',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: '匯入',
                    confirmTitle: '匯入設定？',
                    confirmMessage: '匯入會取代目前的 Notebook Navigator 設定。',
                    backupToggleName: '匯入前將目前設定儲存到保險庫根目錄',
                    backupToggleDesc: '在保險庫根目錄中建立含時間戳的 JSON 檔案。',
                    successWithBackupNotice: '設定已匯入。先前的設定已儲存到 {path}。',
                    backupError: '無法儲存目前設定: {message}',
                    successNotice: '設定已匯入。',
                    errorNotice: '匯入設定失敗: {message}',
                    fileReadError: '無法讀取檔案: {message}'
                },
                export: {
                    modalTitle: '匯出設定',
                    editorName: 'JSON',
                    editorDesc: '僅包含與預設值不同的設定。',
                    placeholder: '{}',
                    copyButtonText: '複製到剪貼簿',
                    downloadButtonText: '下載',
                    copyNotice: '設定已複製到剪貼簿。',
                    downloadNotice: '設定已匯出。',
                    downloadError: '下載設定失敗: {message}'
                }
            },
            resetAllSettings: {
                name: '重設所有設定',
                desc: '將 Notebook Navigator 的所有設定重設為預設值。',
                buttonText: '重設所有設定',
                confirmTitle: '重設所有設定？',
                confirmMessage: '這將把 Notebook Navigator 的所有設定重設為預設值。此操作無法復原。',
                confirmButtonText: '重設所有設定',
                notice: '所有設定已重設。重新啟動 Obsidian 或重新開啟 Notebook Navigator 以套用。',
                error: '重設設定失敗。'
            },
            multiSelectModifier: {
                name: '多選修飾鍵',
                desc: '選擇哪個修飾鍵切換多選模式。選擇 Option/Alt 時，Cmd/Ctrl 點按會在新分頁中開啟筆記。',
                options: {
                    cmdCtrl: 'Cmd/Ctrl 點按',
                    optionAlt: 'Option/Alt 點按'
                }
            },
            enterToOpenFiles: {
                name: '按 Enter 鍵開啟檔案',
                desc: '僅在清單鍵盤導覽時按 Enter 鍵開啟檔案。在 macOS 上，這會阻止 Enter 鍵重新命名檔案。'
            },
            shiftEnterOpenContext: {
                name: 'Shift+Enter',
                desc: '選擇 Shift+Enter 要開啟還是重新命名所選檔案。'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Enter',
                desc: '選擇 Cmd+Enter 要開啟還是重新命名所選檔案。'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Enter',
                desc: '選擇 Ctrl+Enter 要開啟還是重新命名所選檔案。'
            },
            mouseBackForwardAction: {
                name: '滑鼠上一頁/下一頁按鈕',
                desc: '桌面端滑鼠上一頁和下一頁按鈕的操作。',
                options: {
                    none: '使用系統預設',
                    singlePaneSwitch: '切換面板（單面板）',
                    history: '瀏覽歷史'
                }
            },
            excludedNotes: {
                name: '依屬性規則隱藏筆記（保險庫設定檔）',
                desc: '逗號分隔的前置中繼資料規則列表。使用 `key` 或 `key=value` 條目（例如：status=done, published=true, archived）。',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: '隱藏檔案（保險庫設定檔）',
                desc: '逗號分隔的檔名模式列表，用於隱藏檔案。支援 * 萬用字元和 / 路徑（例如：temp-*、*.png、/assets/*）。',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: '保險庫設定檔',
                desc: '設定檔儲存檔案類型可見性、隱藏檔案、隱藏資料夾、隱藏標籤、隱藏筆記的屬性規則、捷徑和導覽橫幅。從導覽窗格標題切換設定檔。',
                defaultName: '預設',
                addButton: '新增設定檔',
                editProfilesButton: '編輯設定檔',
                addProfileOption: '新增設定檔...',
                applyButton: '套用',
                deleteButton: '刪除設定檔',
                addModalTitle: '新增設定檔',
                editProfilesModalTitle: '編輯設定檔',
                addModalPlaceholder: '設定檔名稱',
                deleteModalTitle: '刪除 {name}',
                deleteModalMessage: '刪除 {name}？儲存在此設定檔中的隱藏檔案、資料夾、標籤和基於屬性的筆記篩選器將被刪除。',
                moveUp: '上移',
                moveDown: '下移',
                errors: {
                    emptyName: '請輸入設定檔名稱',
                    duplicateName: '設定檔名稱已存在'
                }
            },
            vaultTitle: {
                name: '保險庫標題位置',
                desc: '選擇保險庫標題顯示的位置。',
                options: {
                    header: '顯示在標題列',
                    navigation: '顯示在導覽窗格'
                }
            },
            excludedFolders: {
                name: '隱藏資料夾（保險庫設定檔）',
                desc: '逗號分隔的要隱藏的資料夾列表。名稱模式：assets*（以 assets 開頭的資料夾），*_temp（以 _temp 結尾）。路徑模式：/archive（僅根目錄 archive），/res*（以 res 開頭的根資料夾），/*/temp（一級目錄下的 temp 資料夾），/projects/*（projects 內的所有資料夾）。',
                placeholder: 'templates, assets*, /archive, /res*'
            },
            descendantExcludedFolders: {
                name: '從子資料夾筆記中排除資料夾（保險庫設定檔）',
                desc: '逗號分隔的資料夾列表，用於在收集子資料夾中的筆記時略過這些資料夾。資料夾仍會顯示，選取該資料夾時仍會顯示其中的筆記。使用與隱藏資料夾相同的模式。',
                placeholder: '日記, 資源, /archive'
            },
            fileVisibility: {
                name: '顯示檔案類型（保險庫設定檔）',
                desc: '篩選在導覽器中顯示的檔案類型。Obsidian 不支援的檔案類型可能會在外部應用程式中開啟。',
                options: {
                    documents: '文件 (.md, .canvas, .base)',
                    supported: '支援（在 Obsidian 中開啟）',
                    all: '全部（可能外部開啟）'
                }
            },
            homepage: {
                name: '首頁',
                desc: '選擇 Notebook Navigator 啟動時自動開啟的內容。',
                current: '目前：{path}',
                chooseButton: '選擇檔案',
                options: {
                    none: '無',
                    file: '檔案',
                    dailyNote: '日記',
                    weeklyNote: '週記',
                    monthlyNote: '月記',
                    quarterlyNote: '季度筆記',
                    yearlyNote: '年度筆記'
                },
                file: {
                    name: '首頁：啟動檔案',
                    empty: '未選擇檔案'
                },
                createMissing: {
                    name: '首頁：不存在時建立筆記',
                    desc: '啟動或執行命令時，如果定期筆記不存在則建立。'
                }
            },
            showFileDate: {
                name: '顯示日期',
                desc: '在筆記名稱下方顯示日期。'
            },
            alphabeticalDateMode: {
                name: '按名稱排序時',
                desc: '筆記按字母順序排序時顯示的日期。',
                options: {
                    created: '建立日期',
                    modified: '修改日期'
                }
            },
            showFileTags: {
                name: '顯示檔案標籤',
                desc: '在檔案項目中顯示可點按的標籤。'
            },
            showFileTagAncestors: {
                name: '顯示完整標籤路徑',
                desc: "顯示完整的標籤層級路徑。啟用：'ai/openai'，'工作/專案/2024'。停用：'openai'，'2024'。"
            },
            colorFileTags: {
                name: '為檔案標籤著色',
                desc: '將標籤顏色套用於檔案項目中的標籤徽章。'
            },
            prioritizeColoredFileTags: {
                name: '優先顯示彩色標籤',
                desc: '將彩色標籤排列在其他標籤之前。'
            },
            showFileTagsInCompactMode: {
                name: '在精簡模式中顯示檔案標籤',
                desc: '當日期、預覽和圖片被隱藏時顯示標籤。'
            },
            showFileProperties: {
                name: '顯示檔案屬性',
                desc: '在檔案項目中顯示屬性。使用「屬性鍵可見性」對話框選擇要顯示的屬性。'
            },
            colorFileProperties: {
                name: '為檔案屬性著色',
                desc: '將屬性顏色套用到檔案項目的屬性徽章上。'
            },
            prioritizeColoredFileProperties: {
                name: '優先顯示彩色屬性',
                desc: '在檔案項目中將彩色屬性排列在其他屬性之前。'
            },
            showFilePropertiesInCompactMode: {
                name: '在精簡模式中顯示屬性',
                desc: '精簡模式啟用時顯示屬性。'
            },
            textCountDisplay: {
                name: '計數類型',
                desc: '選擇檔案項目中要顯示哪些筆記計數。',
                options: {
                    none: '無',
                    words: '字數',
                    characters: '字元數',
                    both: '字數與字元數'
                }
            },
            textCountPlacement: {
                name: '位置',
                desc: '選擇筆記計數的顯示位置。',
                options: {
                    title: '在標題中',
                    property: '作為屬性'
                }
            },
            characterCountSpaces: {
                name: '字元數',
                desc: '選擇字元數是否包含空格。',
                options: {
                    include: '包含空格',
                    exclude: '不含空格'
                }
            },
            wordCountTargetProperty: {
                name: '目標屬性',
                desc: '包含目標字數的前置元資料屬性鍵。留空可隱藏目標。'
            },
            showWordCountPercentage: {
                name: '顯示目標百分比',
                desc: '有目標字數時，只顯示進度百分比。'
            },
            propertyFields: {
                name: '屬性鍵（保險庫設定檔）',
                desc: 'Frontmatter 屬性鍵，可按鍵設定導覽和檔案清單的可見性。',
                addButtonTooltip: '設定屬性鍵',
                noneConfigured: '未設定屬性',
                singleConfigured: '已設定 1 個屬性：{properties}',
                multipleConfigured: '已設定 {count} 個屬性：{properties}'
            },
            showPropertiesOnSeparateRows: {
                name: '在個別行中顯示屬性',
                desc: '將每個屬性顯示在個別行中。'
            },
            enablePropertyInternalLinks: {
                name: '將屬性標籤連結到筆記',
                desc: '點擊屬性標籤以開啟連結的筆記。'
            },
            enablePropertyExternalLinks: {
                name: '將屬性標籤連結到 URL',
                desc: '點擊屬性標籤以開啟連結的 URL。'
            },
            dateFormat: {
                name: '日期格式',
                desc: '用於顯示日期的格式（使用 Moment 格式）。',
                placeholder: 'YYYY年M月D日',
                help: '常用格式：\nYYYY年M月D日 = 2022年5月25日\nYYYY-MM-DD = 2022-05-25\nMM/DD/YYYY = 05/25/2022\n\n標記：\nYYYY/YY = 年\nMMMM/MMM/MM/M = 月\nDD/D = 日\ndddd/ddd = 星期',
                helpTooltip: '使用 Moment 格式',
                momentLinkText: 'Moment 格式'
            },
            timeFormat: {
                name: '時間格式',
                desc: '用於顯示時間的格式（使用 Moment 格式）。',
                placeholder: 'HH:mm',
                help: '常用格式：\nHH:mm = 14:30（24小時制）\nAh:mm = 下午2:30（12小時制）\nHH:mm:ss = 14:30:45\nAh:mm:ss = 下午2:30:45\n\n標記：\nHH/H = 24小時制\nhh/h = 12小時制\nmm = 分鐘\nss = 秒\nA = 上午/下午',
                helpTooltip: '使用 Moment 格式',
                momentLinkText: 'Moment 格式'
            },
            showFilePreview: {
                name: '顯示筆記預覽',
                desc: '在筆記名稱下方顯示預覽文字。'
            },
            skipHeadingsInPreview: {
                name: '預覽中跳過標題',
                desc: '產生預覽文字時跳過標題行。'
            },
            skipCodeBlocksInPreview: {
                name: '預覽中跳過程式碼區塊',
                desc: '產生預覽文字時跳過程式碼區塊。'
            },
            stripHtmlInPreview: {
                name: '移除預覽中的 HTML',
                desc: '從預覽文字中移除 HTML 標籤。可能會影響大型筆記的效能。'
            },
            stripLatexInPreview: {
                name: '移除預覽中的 LaTeX',
                desc: '從預覽文字中移除行內和區塊 LaTeX 運算式。'
            },
            previewProperties: {
                name: '預覽屬性',
                desc: '用於尋找預覽文字的前置屬性的逗號分隔列表。將使用第一個包含文字的屬性。',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: '回退到筆記內容',
                desc: '當指定的屬性都不包含文字時，顯示筆記內容作為預覽。'
            },
            previewRows: {
                name: '預覽行數',
                desc: '預覽文字顯示的行數。',
                options: {
                    '1': '1 行',
                    '2': '2 行',
                    '3': '3 行',
                    '4': '4 行',
                    '5': '5 行'
                }
            },
            fileNameRows: {
                name: '標題行數',
                desc: '筆記標題顯示的行數。',
                options: {
                    '1': '1 行',
                    '2': '2 行',
                    '3': '3 行'
                }
            },
            useFolderColor: {
                name: '使用資料夾顏色',
                desc: '當未設定自訂檔案顏色時，使用父資料夾的顏色為筆記標題和檔案圖示著色。優先順序：自訂檔案顏色 > 資料夾顏色 > 預設顏色。'
            },
            showFeatureImage: {
                name: '顯示特色圖片',
                desc: '顯示筆記中找到的第一張圖片的縮圖。'
            },
            forceSquareFeatureImage: {
                name: '強制正方形特色圖片',
                desc: '將特色圖片呈現為正方形縮圖。'
            },
            featureImageProperties: {
                name: '圖片屬性',
                desc: '首先檢查的前置中繼資料屬性的逗號分隔列表。如果未找到，則使用 markdown 內容中的第一張圖片。',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: '排除含有屬性的筆記',
                desc: '逗號分隔的前置中繼資料屬性列表。包含這些屬性的筆記不會儲存特色圖片。',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: '特色圖片顯示大小',
                desc: '筆記列表中特色圖片的最大渲染大小。',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: '特色圖片像素大小',
                desc: '產生儲存的特色圖片縮圖時使用的解析度。如果較大的預覽看起來模糊，請增大此值。',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: '下載外部圖片',
                desc: '下載遠端圖片和 YouTube 縮圖作為特色圖片。'
            },
            hideDrawingPreviewImages: {
                name: '隱藏匯出的預覽圖片',
                desc: '隱藏匯出的繪圖預覽 PNG 檔案。開啟「顯示隱藏項目」以顯示它們。'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator 將 Excalidraw 匯出的 PNG 檔案用作繪圖預覽。',
                items: [
                    '在 **Excalidraw 設定** 中，依次開啟 **Embedding Excalidraw into your Notes and Exporting**、**Export Settings**、**Auto-export Settings**。',
                    '啟用 **Auto-export PNG**。可選啟用 **Export both dark- and light-themed image**。',
                    'Notebook Navigator 會尋找 **Drawing.excalidraw.png**、**Drawing.excalidraw.dark.png** 或 **Drawing.excalidraw.light.png**。',
                    '當 **隱藏匯出的預覽圖片** 開啟時，僅當 **顯示隱藏項目** 也開啟時，PNG 檔案才會顯示。'
                ]
            },
            showRootFolder: {
                name: '顯示根資料夾',
                desc: '在樹狀結構中顯示根資料夾名稱。'
            },
            showFolderIcons: {
                name: '顯示資料夾圖示',
                desc: '在導覽窗格的資料夾旁顯示圖示。'
            },
            inheritFolderColors: {
                name: '繼承資料夾顏色',
                desc: '子資料夾從父資料夾繼承顏色。'
            },
            folderSortOrder: {
                name: '資料夾排序方式',
                desc: '右鍵點擊任意資料夾，可為其子項目設定不同的排序方式。',
                options: {
                    alphaAsc: 'A 到 Z',
                    alphaDesc: 'Z 到 A'
                }
            },
            showNoteCount: {
                name: '顯示筆記數',
                desc: '在資料夾、標籤和屬性旁顯示筆記數量。'
            },
            showSectionIcons: {
                name: '顯示捷徑和最近項目的圖示',
                desc: '在捷徑和最近檔案區段中的項目旁顯示圖示。'
            },
            interfaceIcons: {
                name: '介面圖示',
                desc: '編輯工具列、資料夾、標籤、屬性、釘選、搜尋和排序圖示。',
                buttonText: '編輯圖示'
            },
            showIconsColorOnly: {
                name: '僅對圖示套用顏色',
                desc: '啟用時，自訂顏色僅套用於圖示。停用時，顏色將同時套用於圖示和文字標籤。'
            },
            navRainbowMode: {
                name: '彩虹顏色模式（保險庫設定檔）',
                desc: '在導覽窗格中套用彩虹顏色。',
                options: {
                    none: '關閉',
                    foreground: '文字顏色',
                    background: '背景顏色'
                }
            },
            navRainbowFirstColor: {
                name: '第一個顏色',
                desc: '彩虹漸層中的第一個顏色。'
            },
            navRainbowLastColor: {
                name: '最後一個顏色',
                desc: '彩虹漸層中的最後一個顏色。'
            },
            navRainbowTransitionStyle: {
                name: '過渡樣式',
                desc: '第一個和最後一個顏色之間使用的插值。',
                options: {
                    hue: '色相',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: '套用到捷徑',
                desc: '將彩虹顏色套用到捷徑。'
            },
            navRainbowApplyToRecent: {
                name: '套用到最近項目',
                desc: '將彩虹顏色套用到最近項目。'
            },
            navRainbowApplyToFolders: {
                name: '套用到資料夾',
                desc: '將彩虹顏色套用到資料夾。'
            },
            navRainbowFolderScope: {
                name: '資料夾範圍',
                desc: '選擇哪些資料夾層級開始顏色指派。',
                options: {
                    root: '根層級',
                    child: '子層級',
                    all: '每個層級'
                }
            },
            navRainbowApplyToTags: {
                name: '套用到標籤',
                desc: '將彩虹顏色套用到標籤。'
            },
            navRainbowTagScope: {
                name: '標籤範圍',
                desc: '選擇哪些標籤層級開始顏色指派。',
                options: {
                    root: '根層級',
                    child: '子層級',
                    all: '每個層級'
                }
            },
            navRainbowApplyToProperties: {
                name: '套用到屬性',
                desc: '將彩虹顏色套用到屬性。'
            },
            navRainbowBalanceHueLuminance: {
                name: '色相間一致的亮度', // (English: Consistent brightness across hues)
                desc: '在色相過渡期間在起始顏色和結束顏色之間插值亮度。' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: '分別設定淺色和深色模式顏色', // (English: Separate light and dark mode colors)
                desc: '為淺色模式和深色模式使用不同的彩虹顏色。' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: '將淺色模式顏色複製到深色模式', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: '屬性範圍',
                desc: '選擇哪些屬性層級開始顏色指派。',
                options: {
                    root: '根層級',
                    child: '子層級',
                    all: '每個層級'
                }
            },
            collapseBehavior: {
                name: '摺疊項目',
                desc: '選擇展開/摺疊全部按鈕影響的內容。',
                options: {
                    all: '全部',
                    foldersOnly: '僅資料夾',
                    tagsOnly: '僅標籤',
                    propertiesOnly: '僅屬性'
                }
            },
            smartCollapse: {
                name: '保持選取項展開',
                desc: '摺疊時，保持選取項及其父級展開。'
            },
            excludeVaultRootFromCollapse: {
                name: '摺疊時略過保險庫根目錄',
                desc: '摺疊所有項目時，保持保險庫根資料夾的目前狀態。'
            },
            navIndent: {
                name: '樹狀縮排',
                desc: '調整巢狀資料夾、標籤和屬性的縮排寬度（像素）。'
            },
            navItemHeight: {
                name: '行高',
                desc: '調整導覽窗格中資料夾、標籤和屬性的高度（像素）。'
            },
            navItemHeightScaleText: {
                name: '隨行高調整文字大小',
                desc: '降低行高時減小導覽文字大小。'
            },
            showIndentGuides: {
                name: '顯示縮排參考線',
                desc: '顯示巢狀資料夾、標籤和屬性的縮排參考線。'
            },
            navCountLeaderStyle: {
                name: '顯示前導符號',
                desc: '在項目名稱和筆記數量之間顯示點、短劃線或直線。',
                options: {
                    none: '無',
                    dots: '點 (...)',
                    dashes: '短劃線 (---)',
                    line: '直線'
                }
            },
            navRootSpacing: {
                name: '根級項目間距',
                desc: '根級資料夾、標籤和屬性之間的間距（像素）。'
            },
            showTags: {
                name: '顯示標籤',
                desc: '在導覽器中顯示標籤區段。'
            },
            showTagIcons: {
                name: '顯示標籤圖示',
                desc: '在導覽窗格的標籤旁顯示圖示。'
            },
            inheritTagColors: {
                name: '繼承標籤顏色',
                desc: '子標籤從父標籤繼承顏色。'
            },
            tagSortOrder: {
                name: '標籤排序方式',
                desc: '右鍵點擊任意標籤，可為其子項目設定不同的排序方式。',
                options: {
                    alphaAsc: 'A 到 Z',
                    alphaDesc: 'Z 到 A',
                    frequency: '頻率',
                    lowToHigh: '從低到高',
                    highToLow: '從高到低'
                }
            },
            showAllTagsFolder: {
                name: '顯示標籤資料夾',
                desc: '將「標籤」顯示為可摺疊資料夾。'
            },
            showUntagged: {
                name: '顯示無標籤筆記',
                desc: '為沒有任何標籤的筆記顯示「無標籤」項目。'
            },
            scopeTagsToCurrentContext: {
                name: '依選擇篩選標籤',
                desc: '僅顯示所選資料夾或屬性中筆記包含的標籤。'
            },
            keepEmptyTagsProperty: {
                name: '刪除最後一個標籤後保留 tags 屬性',
                desc: '當所有標籤被刪除時保留 frontmatter 中的 tags 屬性。停用時，tags 屬性將從 frontmatter 中刪除。'
            },
            showProperties: {
                name: '顯示屬性',
                desc: '在導覽器中顯示屬性區段。',
                propertyKeysInfoPrefix: '在',
                propertyKeysInfoLinkText: '開始 > 屬性鍵',
                propertyKeysInfoSuffix: '中設定屬性'
            },
            showPropertyIcons: {
                name: '顯示屬性圖示',
                desc: '在導覽面板中屬性旁邊顯示圖示。'
            },
            inheritPropertyColors: {
                name: '繼承屬性顏色',
                desc: '屬性值繼承其屬性鍵的顏色和背景色。'
            },
            propertySortOrder: {
                name: '屬性排序方式',
                desc: '右鍵點擊任意屬性以設定其值的不同排序方式。',
                options: {
                    alphaAsc: 'A 到 Z',
                    alphaDesc: 'Z 到 A',
                    frequency: '頻率',
                    lowToHigh: '由低到高',
                    highToLow: '由高到低'
                }
            },
            showAllPropertiesFolder: {
                name: '顯示屬性資料夾',
                desc: '將「屬性」顯示為可摺疊資料夾。'
            },
            scopePropertiesToCurrentContext: {
                name: '依選擇篩選屬性',
                desc: '僅顯示所選資料夾或標籤中筆記包含的屬性。'
            },
            hiddenTags: {
                name: '隱藏標籤（保險庫設定檔）',
                desc: '逗號分隔的標籤模式列表。名稱模式：tag*（以...開頭）、*tag（以...結尾）。路徑模式：archive（標籤及其後代）、archive/*（僅後代）、projects/*/drafts（中間萬用字元）。',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            hiddenFileTags: {
                name: '隱藏帶有標籤的筆記（保險庫設定檔）',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: '啟用資料夾筆記',
                desc: '具有匹配筆記檔案的資料夾顯示為可點擊的連結。'
            },
            folderNoteType: {
                name: '預設資料夾筆記類型',
                desc: '從右鍵選單建立的資料夾筆記類型。',
                options: {
                    ask: '建立時詢問',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: '資料夾筆記名稱',
                desc: '資料夾筆記的名稱。留空以使用與資料夾相同的名稱。',
                placeholder: 'index'
            },
            folderNoteNamePattern: {
                name: '資料夾筆記名稱模式',
                desc: '不含副檔名的資料夾筆記名稱模式。使用 {{folder}} 插入資料夾名稱。設定後，資料夾筆記名稱不適用。'
            },
            folderNoteTemplate: {
                name: '資料夾筆記範本',
                desc: '建立資料夾筆記時使用的範本檔案。Markdown 範本可以使用 Templater。Canvas 和 Base 範本會作為檔案內容複製。在檔案操作 > 範本中設定範本資料夾位置。',
                formatWarning: '範本格式必須與所選資料夾筆記類型相符：.md、.canvas 或 .base。'
            },
            enableFolderNoteLinks: {
                name: '資料夾名稱開啟資料夾筆記',
                desc: '點擊資料夾名稱會開啟其資料夾筆記。關閉時，資料夾筆記僅提供資料夾中繼資料，例如名稱、圖示和顏色。'
            },
            hideFolderNoteInList: {
                name: '在列表中隱藏資料夾筆記',
                desc: '在檔案列表中隱藏資料夾筆記。'
            },
            pinCreatedFolderNote: {
                name: '釘選建立的資料夾筆記',
                desc: '從右鍵選單建立時釘選資料夾筆記。'
            },
            folderNoteOpenLocation: {
                name: '開啟資料夾筆記到',
                desc: '選擇點擊資料夾筆記連結時資料夾筆記的開啟位置。',
                options: {
                    currentTab: '目前分頁',
                    newTab: '新分頁',
                    rightSidebar: '右側邊欄'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: '右側邊欄：顯示最近的資料夾筆記',
                desc: '選取資料夾時，右側邊欄會自動顯示最近的上層資料夾筆記。'
            },
            confirmBeforeDelete: {
                name: '刪除前確認',
                desc: '刪除筆記或資料夾時顯示確認對話方塊'
            },
            deleteAttachments: {
                name: '刪除檔案時刪除附件',
                desc: '如果未在其他地方使用，則自動刪除關聯的附件和產生的繪圖預覽',
                options: {
                    ask: '每次詢問',
                    always: '始終',
                    never: '從不'
                }
            },
            moveFileConflicts: {
                name: '移動衝突',
                desc: '將檔案移動到已有同名檔案的資料夾時。每次詢問（重新命名、覆蓋、取消）或始終重新命名。',
                options: {
                    ask: '每次詢問',
                    rename: '始終重新命名'
                }
            },
            metadataCleanup: {
                name: '清理中繼資料',
                desc: '移除在 Obsidian 外部刪除、移動或重新命名檔案、資料夾、標籤或屬性時留下的孤立中繼資料。這僅影響 Notebook Navigator 設定檔案。',
                buttonText: '清理中繼資料',
                error: '設定清理失敗',
                loading: '正在檢查中繼資料...',
                statusClean: '沒有需要清理的中繼資料',
                statusCounts: '孤立項目：{folders} 資料夾，{tags} 標籤，{properties} 屬性，{files} 檔案，{pinned} 釘選，{separators} 分隔線'
            },
            rebuildCache: {
                name: '重建快取',
                desc: '如果出現標籤缺失、預覽不正確或圖片缺失，請使用此功能。這可能在同步衝突或意外關閉後發生。',
                buttonText: '重建快取',
                error: '重建快取失敗',
                indexingTitle: '正在索引保險庫...',
                progress: '正在更新 Notebook Navigator 快取.'
            },
            externalIcons: {
                downloadButton: '下載',
                downloadingLabel: '正在下載...',
                removeButton: '移除',
                statusInstalled: '已下載（版本 {version}）',
                statusNotInstalled: '未下載',
                versionUnknown: '未知',
                downloadFailed: '下載 {name} 失敗。請檢查您的連線並重試。',
                removeFailed: '移除 {name} 失敗。',
                infoNote:
                    '下載的圖示包會在裝置之間同步安裝狀態。圖示包儲存在每個裝置的本機資料庫中；同步僅追蹤它們是否應該被下載或移除。圖示包從 Notebook Navigator 儲存庫下載 (https://github.com/johansan/notebook-navigator/tree/main/icon-assets)。'
            },
            useFrontmatterDates: {
                name: '使用前置中繼資料',
                desc: '使用前置設定筆記名稱、時間戳記、圖示和顏色'
            },
            frontmatterNameField: {
                name: '名稱欄位（多個）',
                desc: '逗號分隔的前置欄位列表。使用第一個非空值。回退到檔名。',
                placeholder: 'title, name'
            },
            frontmatterIconField: {
                name: '圖示欄位',
                desc: '檔案圖示的前置欄位。留空使用儲存在設定中的圖示。',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: '顏色欄位',
                desc: '檔案顏色的前置欄位。留空使用儲存在設定中的顏色。',
                placeholder: 'color'
            },
            frontmatterBackgroundField: {
                name: '背景欄位',
                desc: '背景顏色的前置欄位。留空使用儲存在設定中的背景顏色。',
                placeholder: 'background'
            },
            frontmatterMigration: {
                name: '從設定遷移圖示和顏色',
                desc: '儲存在設定中：{icons} 個圖示，{colors} 種顏色。',
                button: '遷移',
                buttonWorking: '正在遷移...',
                noticeNone: '設定中未儲存任何檔案圖示或顏色。',
                noticeDone: '已遷移 {migratedIcons}/{icons} 個圖示，{migratedColors}/{colors} 種顏色。',
                noticeFailures: '失敗的條目：{failures}。',
                noticeError: '遷移失敗。請檢查主控台以取得詳細資訊。'
            },
            frontmatterCreatedField: {
                name: '建立時間戳記欄位',
                desc: '建立時間戳記的前置欄位名稱。留空僅使用檔案系統日期。',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: '修改時間戳記欄位',
                desc: '修改時間戳記的前置欄位名稱。留空僅使用檔案系統日期。',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: '時間戳記格式',
                desc: '用於解析前置中時間戳記的格式。留空使用 ISO 8601 解析。',
                helpTooltip: '使用 Moment 格式',
                momentLinkText: 'Moment 格式',
                help: '常用格式:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: '支持開發',
                desc: '如果您喜歡使用筆記本導覽器，請考慮支持其持續開發。',
                buttonText: '❤️ 贊助',
                coffeeButton: '☕️ 請我喝咖啡'
            },
            updateCheckOnStart: {
                name: '啟動時檢查新版本',
                desc: '啟動時檢查新的外掛版本，當有可用更新時顯示通知。檢查最多每天一次。',
                status: '有新版本可用：{version}'
            },
            debugLogging: {
                name: '啟動偵錯記錄',
                desc: '將啟動診斷寫入保存庫根目錄中含時間戳的 Markdown 檔案，並在啟動穩定後停止。該檔案可能會同步，且可能包含檔案路徑。'
            },
            whatsNew: {
                name: 'Notebook Navigator {version} 的最新動態',
                desc: '查看最近的更新和改進',
                buttonText: '查看最近更新'
            },
            masteringVideo: {
                name: '精通 Notebook Navigator（影片）',
                desc: '本影片涵蓋了在 Notebook Navigator 中高效工作所需的一切內容，包括快速鍵、搜尋、標籤和進階自訂。'
            },
            cacheStatistics: {
                localCache: '本機快取',
                items: '項',
                withTags: '包含標籤',
                withPreviewText: '包含預覽文字',
                withFeatureImage: '包含特色圖片',
                withMetadata: '包含中繼資料'
            },
            metadataInfo: {
                successfullyParsed: '成功解析',
                itemsWithName: '個帶名稱的項目',
                withCreatedDate: '個帶建立日期',
                withModifiedDate: '個帶修改日期',
                withIcon: '個帶圖示',
                withColor: '個帶顏色',
                failedToParse: '解析失敗',
                createdDates: '個建立日期',
                modifiedDates: '個修改日期',
                checkTimestampFormat: '請檢查您的時間戳記格式。',
                exportFailed: '匯出錯誤'
            }
        }
    },
    whatsNew: {
        title: 'Notebook Navigator 的新功能',
        openBannerImage: '開啟發布橫幅圖片',
        supportMessage: '如果您覺得 Notebook Navigator 有用，請考慮支持其開發。',
        supportButton: '請我喝咖啡',
        thanksButton: '謝謝！'
    }
};
