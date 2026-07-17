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
 * English language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_JA = {
    // Common UI elements
    common: {
        cancel: 'キャンセル', // Button text for canceling dialogs and operations (English: Cancel)
        delete: '削除', // Button text for delete operations in dialogs (English: Delete)
        clear: 'クリア', // Button text for clearing values (English: Clear)
        remove: '削除', // Button text for remove operations in dialogs (English: Remove)
        restoreDefault: 'デフォルトに戻す', // Button text for restoring values to defaults (English: Restore default)
        submit: '送信', // Button text for submitting forms and dialogs (English: Submit)
        save: '保存', // Button text for saving settings and dialogs (English: Save)
        configure: '設定', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'ライトモード', // Label for light theme mode (English: Light mode)
        darkMode: 'ダークモード', // Label for dark theme mode (English: Dark mode)
        noSelection: '選択なし', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'タグなし', // Label for notes without any tags (English: Untagged)
        featureImageAlt: 'アイキャッチ画像', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: '不明なエラー', // Generic fallback when an error has no message (English: Unknown error)
        clipboardWriteError: 'クリップボードに書き込めませんでした',
        updateBannerTitle: 'Notebook Navigator の更新があります',
        updateBannerInstruction: '設定 -> コミュニティプラグイン で更新',
        previous: '前へ', // Generic aria label for previous navigation (English: Previous)
        next: '次へ' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'フォルダまたはタグを選択してノートを表示', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'ノートなし', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: 'ピン留め', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: 'ノート', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'ファイル', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (非表示)', // Accessibility label applied to list items that are normally hidden
        collapseGroup: 'グループを折りたたむ',
        expandGroup: 'グループを展開',
        manualSortTitle: '手動並べ替え: {property}',
        manualSortHint: 'ドラッグして並べ替えます。並び順は数値インデックス値としてプロパティ「{property}」に保存されます。',
        manualSortNonMarkdownHint: 'Markdown 以外のファイルは下部に表示され、並べ替えできません。',
        unsortedSection: '未ソート',
        manualSortDone: '完了',
        manualSortMultipleWriteFailure: '{count} 件のファイルが失敗しました。最初: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'タグなし', // Label for the special item showing notes without tags (English: Untagged)
        tags: 'タグ' // Label for the tags virtual folder (English: Tags)
    },

    navigationPane: {
        shortcutsHeader: 'ショートカット',
        recentFilesHeader: '最近のファイル', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'プロパティ',
        reorderRootFoldersTitle: 'ナビゲーションを並び替え',
        reorderRootFoldersHint: '矢印またはドラッグで並び替え',
        vaultRootLabel: 'ボールト',
        resetRootToAlpha: 'アルファベット順にリセット',
        resetRootToFrequency: '頻度順にリセット',
        pinShortcuts: 'ショートカットを固定',
        pinShortcutsAndRecentFiles: 'ショートカットと最近のファイルを固定',
        unpinShortcuts: 'ショートカットの固定を解除',
        unpinShortcutsAndRecentFiles: 'ショートカットと最近のファイルの固定を解除',
        profileMenuAria: '保管庫のプロファイルを変更'
    },

    navigationCalendar: {
        ariaLabel: 'カレンダー',
        dailyNotesNotEnabled: 'デイリーノートプラグインが有効になっていません。',
        createDailyNote: {
            title: '新規デイリーノート',
            message: 'ファイル {filename} は存在しません。作成しますか？',
            confirmButton: '作成'
        },
        helpModal: {
            title: 'カレンダーのショートカット',
            items: [
                '任意の日をクリックしてデイリーノートを開くか作成します。週、月、四半期、年も同様に機能します。',
                '日付の下の塗りつぶされたドットはノートがあることを意味します。中空のドットは未完了のタスクがあることを意味します。',
                'ノートにフィーチャー画像がある場合、その日の背景として表示されます。'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+クリックで日付をファイルリストのフィルターに追加します。',
            dateFilterOptionAlt: '`Option/Alt`+クリックで日付をファイルリストのフィルターに追加します。'
        }
    },

    dailyNotes: {
        templateReadFailed: 'デイリーノートのテンプレートを読み込めませんでした。',
        createFailed: 'デイリーノートを作成できませんでした。'
    },

    shortcuts: {
        folderExists: 'フォルダは既にショートカットにあります',
        noteExists: 'ノートは既にショートカットにあります',
        tagExists: 'タグは既にショートカットにあります',
        propertyExists: 'プロパティはすでにショートカットに追加されています',
        invalidProperty: '無効なプロパティショートカット',
        searchExists: '検索ショートカットは既に存在します',
        emptySearchQuery: '保存前に検索クエリを入力してください',
        emptySearchName: '検索を保存する前に名前を入力してください',
        add: 'ショートカットに追加',
        addNotesCount: 'ショートカットに{count}件のノートを追加',
        addFilesCount: 'ショートカットに{count}件のファイルを追加',
        rename: 'ショートカット名を変更',
        remove: 'ショートカットから削除',
        removeAll: 'すべてのショートカットを削除',
        removeAllConfirm: 'すべてのショートカットを削除しますか？',
        folderNotesPinned: 'フォルダノート {count} 件をピン留めしました'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'アイテムを折りたたむ', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'すべてのアイテムを展開', // Tooltip for button that expands all items (English: Expand all items)
        showCalendar: 'カレンダーを表示',
        hideCalendar: 'カレンダーを非表示',
        newFolder: '新規フォルダ', // Tooltip for create new folder button (English: New folder)
        newNote: '新規ノート', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'ナビゲーションに戻る', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeChildSortOrder: '並び順を変更',
        changeSortAndGroup: '並び順とグループを変更',
        resetViewToDefaults: 'ビューをデフォルトに戻す',
        manualSort: '手動並べ替え',
        editSortOrder: '並べ替え順を編集...',
        removeSortProperty: '並べ替えプロパティを削除',
        descendants: '子孫',
        subfolders: 'サブフォルダー',
        subtags: 'サブタグ',
        childValues: '子の値',
        applySortAndGroupToDescendants: (target: string) => `${target}に並び替えとグループ化を適用`,
        applyAppearanceToDescendants: (target: string) => `${target}に外観を適用`,
        showFolders: 'ナビゲーションを表示', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: 'ナビゲーションを並び替え',
        finishRootFolderReorder: '完了',
        showExcludedItems: '非表示のフォルダ・タグ・ノートを表示', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: '非表示のフォルダ・タグ・ノートを非表示', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'デュアルペインを表示', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'シングルペインを表示', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            'サイドバーが狭すぎる場合、デュアルペインは使用できません。変更するには、設定 > 外観と動作で「サイドバーが狭すぎる場合」を「何もしない」に設定してください。',
        changeAppearance: '外観を変更', // Tooltip for button to change folder appearance settings (English: Change appearance)
        showNotesFromSubfolders: 'サブフォルダのノートを表示',
        showFilesFromSubfolders: 'サブフォルダのファイルを表示',
        showNotesFromDescendants: '子孫のノートを表示',
        showFilesFromDescendants: '子孫のファイルを表示',
        search: '検索' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: '検索...', // Placeholder text for search input (English: Search...)
        placeholderVault: '保管庫を検索...',
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: '検索をクリア', // Tooltip for clear search button (English: Clear search)
        switchToFilterSearch: 'フィルター検索に切り替え',
        switchToOmnisearch: 'Omnisearchに切り替え',
        saveSearchShortcut: '検索をショートカットに保存',
        removeSearchShortcut: 'ショートカットから検索を削除',
        shortcutModalTitle: '検索ショートカットを保存',
        shortcutNamePlaceholder: 'ショートカット名を入力',
        shortcutStartIn: '常にここから開始: {path}',
        searchHelp: '検索構文',
        searchHelpTitle: '検索構文',
        searchHelpModal: {
            intro: 'ファイル名、プロパティ、タグ、日付、フィルターを1つのクエリで組み合わせ可能（例：`meeting .status=active #work @thisweek`）。Omnisearch プラグインをインストールすると全文検索が使用できます。',
            introSwitching: '上下矢印キーまたは検索アイコンのクリックで、フィルター検索と Omnisearch を切り替えられます。',
            sections: {
                fileNames: {
                    title: 'ファイル名',
                    items: [
                        '`word` ファイル名に「word」を含むノートを検索。',
                        '`word1 word2` すべての単語がファイル名に一致する必要があります。',
                        '`-word` ファイル名に「word」を含むノートを除外。'
                    ]
                },
                tags: {
                    title: 'タグ',
                    items: [
                        '`#tag` タグを持つノートを含める（`#tag/subtag` のようなネストしたタグも一致）。',
                        '`#` タグ付きノートのみを含める。',
                        '`-#tag` タグを持つノートを除外。',
                        '`-#` タグなしノートのみを含める。',
                        '`#tag1 #tag2` 両方のタグに一致（暗黙のAND）。',
                        '`#tag1 AND #tag2` 両方のタグに一致（明示的なAND）。',
                        '`#tag1 OR #tag2` いずれかのタグに一致。',
                        '`#a OR #b AND #c` ANDは優先度が高い：`#a`、または`#b`と`#c`の両方に一致。',
                        'Cmd/Ctrl+クリックでタグを AND として追加。Cmd/Ctrl+Shift+クリックで OR として追加。'
                    ]
                },
                properties: {
                    title: 'プロパティ',
                    items: [
                        '`.key` プロパティキーを持つノートを含める。',
                        '`.key=value` プロパティ値に `value` を含むノートを含める。',
                        '`."Reading Status"` 空白を含むプロパティキーを持つノートを含める。',
                        '`."Reading Status"="In Progress"` 空白を含むキーと値はダブルクォートで囲む必要があります。',
                        '`-.key` プロパティキーを持つノートを除外する。',
                        '`-.key=value` プロパティ値に `value` を含むノートを除外する。',
                        'Cmd/Ctrl+クリックでプロパティをANDで追加。Cmd/Ctrl+Shift+クリックでORで追加。'
                    ]
                },
                tasks: {
                    title: 'フィルター',
                    items: [
                        '`has:task` 未完了のタスクを含むノートを表示。',
                        '`-has:task` 未完了のタスクを含むノートを除外。',
                        '`folder:meetings` フォルダ名に `meetings` を含むノートを表示。',
                        '`folder:/work/meetings` `work/meetings` 内のノートのみを表示（サブフォルダを除く）。',
                        '`folder:/` ボールトルート内のノートのみを表示。',
                        '`-folder:archive` フォルダ名に `archive` を含むノートを除外。',
                        '`-folder:/archive` `archive` 内のノートのみを除外（サブフォルダを除く）。',
                        '`ext:md` 拡張子が `md` のノートを表示（`ext:.md` もサポート）。',
                        '`-ext:pdf` 拡張子が `pdf` のノートを除外。',
                        'タグ、名前、日付と組み合わせて使用（例：`folder:/work/meetings ext:md @thisweek`）。'
                    ]
                },
                connectors: {
                    title: 'AND/ORの動作',
                    items: [
                        '`AND`と`OR`はタグ/プロパティのみのクエリでのみ演算子として機能します。',
                        'タグ/プロパティのみのクエリにはタグとプロパティのフィルターのみが含まれます: `#tag`、`-#tag`、`#`、`-#`、`.key`、`-.key`、`.key=value`、`-.key=value`。',
                        'クエリに名前、日付（`@...`）、タスクフィルター（`has:task`）、フォルダフィルター（`folder:...`）、または拡張子フィルター（`ext:...`）が含まれる場合、`AND`と`OR`は単語として検索されます。',
                        '演算子クエリの例: `#work OR .status=started`。',
                        '混合クエリの例: `#work OR ext:md`（`OR`はファイル名で検索されます）。'
                    ]
                },
                dates: {
                    title: '日付',
                    items: [
                        '`@today` デフォルトの日付フィールドを使用して今日のノートを検索。',
                        '`@yesterday`、`@last7d`、`@last30d`、`@thisweek`、`@thismonth` 相対的な日付範囲。',
                        '`@2026-02-07` 特定の日を検索（`@20260207` もサポート）。',
                        '`@2026` 暦年を検索。',
                        '`@2026-02` または `@202602` 暦月を検索。',
                        '`@2026-W05` または `@2026W05` ISO週を検索。',
                        '`@2026-Q2` または `@2026Q2` 暦四半期を検索。',
                        '`@13/02/2026` 区切り文字付きの数値形式（`@07022026` は曖昧な場合にロケールに従います）。',
                        '`@2026-02-01..2026-02-07` 包括的な日付範囲を検索（開放端サポート）。',
                        '`@c:...` または `@m:...` 作成日または更新日を指定。',
                        '`-@...` 日付の一致を除外。'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'ボールト全体の全文検索。現在のフォルダまたは選択されたタグでフィルタリングされます。',
                        '大規模なボールトでは3文字未満の場合、動作が遅くなることがあります。',
                        '非ASCIIパスの検索やサブパスの正確な検索はできません。',
                        'フォルダフィルタリング前に返される結果数に制限があるため、他に多くの一致がある場合、関連ファイルが表示されないことがあります。',
                        'ノートプレビューはデフォルトのプレビューテキストの代わりに Omnisearch の抜粋を表示します。'
                    ]
                }
            }
        }
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: '新しいタブで開く',
            openToRight: '右側で開く',
            openInNewWindow: '新しいウィンドウで開く',
            openMultipleInNewTabs: '{count}個のノートを新しいタブで開く',
            openMultipleToRight: '{count}個のノートを右側で開く',
            openMultipleInNewWindows: '{count}個のノートを新しいウィンドウで開く',
            pinNote: 'ノートをピン留め',
            unpinNote: 'ピン留めを解除',
            pinMultipleNotes: '{count}個のノートをピン留め',
            unpinMultipleNotes: '{count}個のノートのピン留めを解除',
            duplicateNote: 'ノートを複製',
            duplicateMultipleNotes: '{count}個のノートを複製',
            openVersionHistory: 'バージョン履歴を開く',
            revealInFolder: 'フォルダで表示',
            revealInFinder: 'Finderで表示',
            showInExplorer: 'システムエクスプローラーで表示',
            openInDefaultApp: 'デフォルトアプリで開く',
            renameNote: 'ノートの名前を変更',
            deleteNote: 'ノートを削除',
            deleteMultipleNotes: '{count}個のノートを削除',
            moveNoteToFolder: 'ノートを移動先...',
            moveFileToFolder: 'ファイルを移動先...',
            moveMultipleNotesToFolder: '{count}個のノートを移動先...',
            moveMultipleFilesToFolder: '{count}個のファイルを移動先...',
            mergeNotes: '{count}個のノートを結合...',
            mergeNotesInGroup: 'グループ内のノートを結合...',
            setManualSortGroupHeader: 'グループヘッダーを設定',
            changeManualSortGroupHeader: 'グループヘッダーを変更',
            manualSortGroupHeader: {
                title: 'グループヘッダー',
                copyStyle: 'ヘッダースタイルをコピー',
                pasteStyle: 'ヘッダースタイルを貼り付け',
                remove: 'グループヘッダーを削除'
            },
            addTag: 'タグを追加',
            addPropertyKey: 'プロパティを設定',
            removeTag: 'タグを削除',
            removeAllTags: 'すべてのタグを削除',
            changeIcon: 'アイコンを変更',
            changeColor: '色を変更',
            // File-specific context menu items (non-markdown files)
            openMultipleFilesInNewTabs: '{count}個のファイルを新しいタブで開く',
            openMultipleFilesToRight: '{count}個のファイルを右側で開く',
            openMultipleFilesInNewWindows: '{count}個のファイルを新しいウィンドウで開く',
            pinFile: 'ファイルをピン留め',
            unpinFile: 'ピン留めを解除',
            pinMultipleFiles: '{count}個のファイルをピン留め',
            unpinMultipleFiles: '{count}個のファイルのピン留めを解除',
            duplicateFile: 'ファイルを複製',
            duplicateMultipleFiles: '{count}個のファイルを複製',
            renameFile: 'ファイルの名前を変更',
            deleteFile: 'ファイルを削除',
            setCalendarHighlight: 'ハイライトを設定',
            removeCalendarHighlight: 'ハイライトを解除',
            deleteMultipleFiles: '{count}個のファイルを削除'
        },
        folder: {
            newNote: '新規ノート',
            newNoteFromTemplate: 'テンプレートから新規ノート',
            newFolder: '新規フォルダ',
            newCanvas: '新規キャンバス',
            newBase: '新規データベース',
            newDrawing: '新規図面',
            newExcalidrawDrawing: '新規 Excalidraw 図面',
            newTldrawDrawing: '新規 Tldraw 図面',
            duplicateFolder: 'フォルダを複製',
            searchInFolder: 'フォルダ内を検索',
            createFolderNote: 'フォルダノートを作成',
            detachFolderNote: 'フォルダノートを解除',
            deleteFolderNote: 'フォルダーノートを削除',
            changeIcon: 'アイコンを変更',
            changeColor: '色を変更',
            changeBackground: '背景色を変更',
            excludeFolder: 'フォルダを非表示',
            unhideFolder: 'フォルダを表示',
            excludeFromDescendants: '親フォルダで非表示',
            includeInDescendants: '親フォルダで表示',
            hiddenFromParentsIndicator: '親フォルダのリストから非表示',
            moveFolder: 'フォルダを移動先...',
            renameFolder: 'フォルダの名前を変更',
            deleteFolder: 'フォルダを削除'
        },
        tag: {
            changeIcon: 'アイコンを変更',
            changeColor: '色を変更',
            changeBackground: '背景色を変更',
            showTag: 'タグを表示',
            hideTag: 'タグを非表示'
        },
        property: {
            addKey: 'プロパティキーを設定',
            renameKey: 'プロパティの名前を変更',
            deleteKey: 'プロパティを削除'
        },
        navigation: {
            addSeparator: '区切り線を追加',
            removeSeparator: '区切り線を削除'
        },
        copyPath: {
            title: 'パスをコピー',
            asObsidianUrl: 'Obsidian URL として',
            fromVaultFolder: 'Vault フォルダから',
            fromSystemRoot: 'システムルートから'
        },
        style: {
            title: 'スタイル',
            copy: 'スタイルをコピー',
            paste: 'スタイルを貼り付け',
            removeIcon: 'アイコンを削除',
            removeColor: '色を削除',
            removeBackground: '背景を削除',
            clear: 'スタイルをクリア'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        appearance: '外観',
        sortBy: '並び替え',
        standardPreset: '標準',
        compactPreset: 'コンパクト',
        defaultSuffix: '(デフォルト)',
        defaultLabel: 'デフォルト',
        titleRows: 'タイトル行数',
        previewRows: 'プレビュー行数',
        groupBy: 'グループ分け',
        titleRowOption: (rows: number) => `タイトル${rows}行`,
        previewRowOption: (rows: number) => `プレビュー${rows}行`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: '適用',
            applySortAndGroupTitle: (target: string) => `${target}に並び替えとグループ化を適用しますか？`,
            applyAppearanceTitle: (target: string) => `${target}に外観を適用しますか？`,
            affectedCountMessage: (count: number) => `変更される既存のオーバーライド: ${count}。`
        },
        manualSortConfirm: {
            propertySortTitle: '手動並べ替えを使用しますか？',
            propertySortMessage: (property: string, count: number) =>
                `現在のビューを「${property}」を使った手動並べ替えに切り替えます。並び順を編集すると、必要に応じて ${count} 件のノートのそのプロパティに数値インデックス値が書き込まれます。`,
            propertySortConfirmButton: '手動並べ替えを使用',
            removePropertyTitle: '並べ替えプロパティを削除しますか？',
            removePropertyMessage: (property: string, count: number) =>
                `現在のリストの ${count} 件のノートから「${property}」を削除します。それらのノートの手動並べ替え順はクリアされます。`,
            removePropertyConfirmButton: 'プロパティを削除',
            compactTitle: 'インデックス値を圧縮しますか？',
            compactMessage: (count: number) =>
                `この並べ替えにはより多くの数値領域が必要です。${count} 件のノートに新しいインデックス値が割り当てられます。`,
            compactConfirmButton: 'インデックス値を圧縮'
        },
        manualSortGroupHeader: {
            title: 'グループヘッダーを設定',
            titleLabel: 'タイトル',
            placeholder: 'グループヘッダー',
            icon: 'アイコン',
            color: '色',
            wordCount: 'ワード数を表示',
            wordCountTarget: '目標ワード数',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'このフィールドが空の場合、グループ目標は 設定 > ノート > 単語数と文字数 で設定された目標プロパティを使用します。このグループに目標値を設定すると上書きできます。',
            description: 'このノートのグループヘッダーをカスタマイズします。ヘッダーを削除するには、タイトルを空のままにします。'
        },
        mergeNotes: {
            title: 'ノートを結合',
            summary: '{folder} の {count} 個のノートから1つのノートを作成します。',
            frontmatterRule: '最初のノートのフロントマターは保持されます。他のノートのフロントマターは削除されます。',
            crossFolderWarning:
                '元のノートが異なるフォルダにあります。結合されたノートでは相対リンクと埋め込みが機能しなくなる可能性があります。',
            outputName: '出力名',
            outputNameDesc: '結合されたノートは上に表示されたフォルダに作成されます。',
            outputNamePlaceholder: '結合されたノート',
            separator: '区切り',
            separatorDesc: 'ノート間に挿入されます。',
            separatorOptions: {
                none: 'なし',
                blankLine: '空行',
                horizontalRule: '水平線',
                heading: 'ノートタイトル付き見出し'
            },
            moveSourcesToTrash: '結合後に元のノートをゴミ箱に移動',
            mergeButton: '結合'
        },
        navRainbowSection: {
            title: (section: string) => `レインボーカラー: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'アイコンを検索...',
            recentlyUsedHeader: '最近使用したアイコン',
            emptyStateSearch: '入力してアイコンを検索',
            emptyStateNoResults: 'アイコンが見つかりません',
            showingResultsInfo: '{count}件中50件を表示中。絞り込むには続けて入力してください。',
            emojiInstructions: '絵文字を入力または貼り付けてアイコンとして使用',
            removeIcon: 'アイコンを削除',
            removeFromRecents: '最近使用したアイコンから削除',
            allTabLabel: 'すべて'
        },
        fileIconRuleEditor: {
            addRuleAria: 'ルールを追加'
        },
        interfaceIcons: {
            title: 'インターフェースアイコン',
            fileItemsSection: 'ファイル項目',
            items: {
                'nav-shortcuts': 'ショートカット',
                'nav-recent-files': '最近のファイル',
                'nav-expand-all': 'すべて展開',
                'nav-collapse-all': 'すべて折りたたむ',
                'nav-calendar': 'カレンダー',
                'nav-tree-expand': 'ツリー矢印: 展開',
                'nav-tree-collapse': 'ツリー矢印: 折りたたみ',
                'nav-hidden-items': '非表示項目',
                'nav-root-reorder': 'ルートフォルダの並べ替え',
                'nav-new-folder': '新規フォルダ',
                'nav-show-single-pane': 'シングルペインを表示',
                'nav-show-dual-pane': 'デュアルペインを表示',
                'nav-profile-chevron': 'プロファイルメニュー矢印',
                'list-search': '検索',
                'list-reveal-file': 'ファイルを表示',
                'list-descendants': 'サブフォルダからのノート',
                'list-sort-ascending': '並べ替え: 昇順',
                'list-sort-descending': '並べ替え: 降順',
                'list-sort-modified': '更新日時で並べ替え',
                'list-sort-created': '作成日時で並べ替え',
                'list-sort-title': 'タイトルで並べ替え',
                'list-sort-filename': 'ファイル名で並べ替え',
                'list-sort-property': 'プロパティで並べ替え',
                'list-appearance': '外観を変更',
                'list-new-note': '新規ノート',
                'list-pinned': 'ピン留めされたノート',
                'nav-folder-open': 'フォルダ（開）',
                'nav-folder-closed': 'フォルダ（閉）',
                'nav-tags': 'タグ',
                'nav-tag': 'タグ',
                'nav-properties': 'プロパティ',
                'nav-property': 'プロパティ',
                'nav-property-value': '値',
                'file-unfinished-task': '未完了タスク',
                'file-word-count': '単語数',
                'file-character-count': '文字数'
            }
        },
        colorPicker: {
            currentColor: '現在',
            newColor: '新規',
            paletteDefault: 'デフォルト',
            paletteCustom: 'カスタム',
            copyColors: '色をコピー',
            colorsCopied: 'クリップボードにコピーしました',
            pasteColors: '色を貼り付け',
            pasteClipboardError: 'クリップボードを読み取れませんでした',
            pasteInvalidFormat: '16進数の色の値が必要です',
            colorsPasted: '色を貼り付けました',
            resetUserColors: 'カスタム色をクリア',
            clearCustomColorsConfirm: 'すべてのカスタム色を削除しますか？',
            userColorSlot: 'カラー {slot}',
            recentColors: '最近使用した色',
            clearRecentColors: '最近使用した色をクリア',
            removeRecentColor: '色を削除',
            apply: '適用',
            pickerLabel: 'ピッカー',
            hexLabel: 'HEX',
            hexInputLabel: 'HEXカラー値',
            saturationValueArea: '彩度と明度',
            hueSlider: '色相',
            alphaSlider: '透明度'
        },
        appearance: {
            tabIcon: 'アイコン',
            tabColor: '色',
            tabBackground: '背景',
            resetIcon: 'アイコンを削除',
            resetColor: '色を削除',
            resetBackground: '背景を削除',
            clear: 'スタイルをクリア',
            apply: '適用'
        },
        selectVaultProfile: {
            title: '保管庫のプロファイルを変更',
            currentBadge: 'アクティブ',
            emptyState: '利用できる保管庫プロファイルがありません。'
        },
        tagOperation: {
            renameTitle: 'タグ {tag} の名前を変更',
            deleteTitle: 'タグ {tag} を削除',
            newTagPrompt: '新しいタグ名を入力：',
            newTagPlaceholder: '新しい名前',
            renameWarning: 'タグ {oldTag} の名前変更により {count} 個の{files}が変更されます。',
            deleteWarning: 'タグ {tag} の削除により {count} 個の{files}が変更されます。',
            modificationWarning: 'これによりファイルの変更日が更新されます。',
            affectedFiles: '影響を受けるファイル:',
            andMore: 'さらに{count}個...',
            confirmRename: 'タグを名前変更',
            renameUnchanged: '{tag} は変更されませんでした',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            renameBatchNotFinalized:
                '{renamed}/{total} を名前変更しました。未更新: {notUpdated}。メタデータとショートカットは更新されませんでした。',
            invalidTagName: '有効なタグ名を入力してください。',
            descendantRenameError: 'タグを自身または子孫に移動することはできません。',
            confirmDelete: 'タグを削除',
            deleteBatchNotFinalized:
                '{removed}/{total} から削除しました。未更新: {notUpdated}。メタデータとショートカットは更新されませんでした。',
            checkConsoleForDetails: '詳細はコンソールを確認してください。',
            file: 'ファイル',
            files: 'ファイル',
            inlineParsingWarning: {
                title: 'インラインタグの互換性',
                message: '{tag} には Obsidian がインラインタグで解析できない文字が含まれています。Frontmatter タグには影響しません。',
                confirm: 'そのまま使用'
            }
        },
        propertyOperation: {
            renameTitle: 'プロパティ {property} の名前を変更',
            deleteTitle: 'プロパティ {property} を削除',
            newKeyPrompt: '新しいプロパティ名',
            newKeyPlaceholder: '新しいプロパティ名を入力',
            renameWarning: 'プロパティ {property} の名前変更は {count} {files}に影響します。',
            renameConflictWarning:
                'プロパティ {newKey} は既に {count} {files}に存在します。{oldKey} の名前変更は既存の {newKey} の値を置き換えます。',
            deleteWarning: 'プロパティ {property} の削除は {count} {files}に影響します。',
            confirmRename: 'プロパティの名前を変更',
            confirmDelete: 'プロパティを削除',
            renameNoChanges: '{oldKey} → {newKey}（変更なし）',
            renameSettingsUpdateFailed: 'プロパティ {oldKey} → {newKey} の名前を変更しました。設定の更新に失敗しました。',
            deleteSingleSuccess: 'プロパティ {property} を1件のノートから削除しました',
            deleteMultipleSuccess: 'プロパティ {property} を {count} 件のノートから削除しました',
            deleteSettingsUpdateFailed: 'プロパティ {property} を削除しました。設定の更新に失敗しました。',
            invalidKeyName: '有効なプロパティ名を入力してください。'
        },
        fileSystem: {
            newFolderTitle: '新規フォルダ',
            renameFolderTitle: 'フォルダの名前を変更',
            renameFileTitle: 'ファイルの名前を変更',
            deleteFolderTitle: "'{name}'を削除しますか？",
            deleteFileTitle: "'{name}'を削除しますか？",
            deleteFileAttachmentsTitle: 'ファイルの添付ファイルを削除しますか？',
            moveFileConflictTitle: '移動の競合',
            folderNamePrompt: 'フォルダ名を入力：',
            hideInOtherVaultProfiles: '他の保管庫プロファイルで非表示にする',
            renamePrompt: '新しい名前を入力：',
            renameVaultTitle: 'ボールトの表示名を変更',
            renameVaultPrompt: 'カスタム表示名を入力（空にするとデフォルトを使用）：',
            deleteFolderConfirm: 'このフォルダとそのすべての内容を削除してもよろしいですか？',
            deleteFileConfirm: 'このファイルを削除してもよろしいですか？',
            deleteFileAttachmentsDescriptionSingle: 'この添付ファイルはどのノートでも使用されていません。削除しますか？',
            deleteFileAttachmentsDescriptionMultiple: 'これらの添付ファイルはどのノートでも使用されていません。削除しますか？',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'ファイルツリー',
            deleteFileAttachmentsViewGalleryAriaLabel: 'ギャラリー',
            moveFileConflictDescriptionSingle: '「{folder}」でファイルの競合が見つかりました。',
            moveFileConflictDescriptionMultiple: '「{folder}」で{count}件のファイルの競合が見つかりました。',
            moveFileConflictAffectedFiles: '影響を受けるファイル',
            moveFileConflictItem: '「{name}」→「{suggested}」{renameOnly}',
            moveFileConflictRenameOnly: '（名前変更のみ）',
            moveFileConflictRename: '名前を変更',
            moveFileConflictOverwrite: '上書き',
            removeAllTagsTitle: 'すべてのタグを削除',
            removeAllTagsFromNote: 'このノートからすべてのタグを削除してもよろしいですか？',
            removeAllTagsFromNotes: '{count}個のノートからすべてのタグを削除してもよろしいですか？'
        },
        folderNoteType: {
            title: 'フォルダノートの形式を選択',
            folderLabel: 'フォルダ: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `${name} をフォルダに移動...`,
            multipleFilesLabel: (count: number) => `${count} 個のファイル`,
            navigatePlaceholder: 'フォルダにナビゲート...',
            instructions: {
                navigate: 'でナビゲート',
                move: 'で移動',
                select: 'で選択',
                dismiss: 'でキャンセル'
            }
        },
        homepage: {
            placeholder: 'ファイルを検索...',
            instructions: {
                navigate: 'でナビゲート',
                select: 'でホームページを設定',
                dismiss: 'でキャンセル'
            }
        },
        calendarTemplate: {
            placeholder: 'テンプレートを検索...',
            instructions: {
                navigate: 'でナビゲート',
                select: 'でテンプレートを選択',
                dismiss: 'でキャンセル'
            }
        },
        navigationBanner: {
            placeholder: '画像を検索...',
            svgMissingDimensions: '選択したSVGファイルには幅、高さ、またはviewBoxが定義されていません。',
            instructions: {
                navigate: 'でナビゲート',
                select: 'でバナーを設定',
                dismiss: 'でキャンセル'
            }
        },
        tagSuggest: {
            navigatePlaceholder: 'タグにナビゲート...',
            addPlaceholder: '追加するタグを検索...',
            removePlaceholder: '削除するタグを選択...',
            createNewTag: '新しいタグを作成: #{tag}',
            instructions: {
                navigate: 'でナビゲート',
                select: 'で選択',
                dismiss: 'でキャンセル',
                add: 'タグを追加',
                remove: 'タグを削除'
            }
        },
        propertySuggest: {
            placeholder: 'プロパティキーを選択...',
            navigatePlaceholder: 'プロパティに移動...',
            instructions: {
                navigate: 'でナビゲート',
                select: 'プロパティを追加',
                dismiss: 'でキャンセル'
            }
        },
        propertyKeyVisibility: {
            title: 'プロパティキーの表示設定',
            description:
                'プロパティ値の表示場所を制御します。列はナビゲーションペイン、リストペイン、ファイルコンテキストメニューに対応しています。下の行を使って列内のすべての行を切り替えます。',
            searchPlaceholder: 'プロパティキーを検索...',
            propertyColumnLabel: 'プロパティ',
            showInNavigation: 'ナビゲーションに表示',
            showInList: 'リストに表示',
            showInFileMenu: 'ファイルメニューに表示',
            toggleAllInNavigation: 'ナビゲーションの全てを切り替え',
            toggleAllInList: 'リストの全てを切り替え',
            toggleAllInFileMenu: 'ファイルメニューの全てを切り替え',
            applyButton: '適用',
            emptyState: 'プロパティキーが見つかりません。'
        },
        welcome: {
            title: '{pluginName}へようこそ',
            introText:
                'こんにちは！始める前に、下のビデオの最初の5分間を見て、ペインとトグル「サブフォルダからノートを表示」の仕組みを理解することを強くお勧めします。',
            continueText:
                'さらに5分あれば、ビデオを続けて見て、コンパクト表示モードとショートカットや重要なホットキーの適切な設定方法を理解してください。',
            thanksText: 'ダウンロードいただきありがとうございます。お楽しみください！',
            videoAlt: 'Notebook Navigatorのインストールとマスター',
            openVideoButton: 'ビデオを再生',
            closeButton: 'また今度'
        }
    },

    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'フォルダの作成に失敗しました：{error}',
            createFile: 'ファイルの作成に失敗しました：{error}',
            renameFolder: 'フォルダの名前変更に失敗しました：{error}',
            renameFolderNoteConflict: '名前を変更できません："{name}"はこのフォルダに既に存在します',
            renameFile: 'ファイルの名前変更に失敗しました：{error}',
            deleteFolder: 'フォルダの削除に失敗しました：{error}',
            deleteFile: 'ファイルの削除に失敗しました：{error}',
            deleteAttachments: '添付ファイルの削除に失敗しました: {error}',
            mergeNotes: 'ノートの結合に失敗しました: {error}',
            mergeNotesOpenOutput:
                '結合されたノートは {name} として作成されましたが、開けませんでした: {error}。元のノートは変更されませんでした。',
            mergeNotesOpenSkipped: '別のファイルを開くリクエストが優先されました。',
            mergeNotesTrashSources: '結合されたノートを作成しました。{count} 個の元ノートをゴミ箱に移動できませんでした。',
            duplicateNote: 'ノートの複製に失敗しました：{error}',
            duplicateFolder: 'フォルダの複製に失敗しました：{error}',
            openVersionHistory: 'バージョン履歴を開くのに失敗しました：{error}',
            versionHistoryNotFound: 'バージョン履歴コマンドが見つかりません。Obsidian Syncが有効になっていることを確認してください。',
            revealInExplorer: 'システムエクスプローラーでファイルを表示できませんでした：{error}',
            openInDefaultApp: 'デフォルトアプリで開けませんでした：{error}',
            openInDefaultAppNotAvailable: 'このプラットフォームではデフォルトアプリで開く機能は利用できません',
            folderNoteAlreadyExists: 'フォルダノートはすでに存在します',
            folderAlreadyExists: 'フォルダ「{name}」は既に存在します',
            folderNotesDisabled: 'ファイルを変換するには設定でフォルダノートを有効にしてください',
            folderNoteAlreadyLinked: 'このファイルは既にフォルダノートとして機能しています',
            folderNoteNotFound: '選択したフォルダにフォルダノートがありません',
            folderNoteUnsupportedExtension: 'サポートされていないファイル拡張子：{extension}',
            folderNoteMoveFailed: '変換中のファイル移動に失敗しました：{error}',
            folderNoteRenameConflict: '「{name}」という名前のファイルが既にフォルダ内に存在します',
            folderNoteConversionFailed: 'フォルダノートへの変換に失敗しました',
            folderNoteConversionFailedWithReason: 'フォルダノートへの変換に失敗しました：{error}',
            folderNoteOpenFailed: 'ファイルは変換されましたが、フォルダノートを開くのに失敗しました：{error}',
            failedToDeleteFile: '{name}の削除に失敗しました: {error}',
            failedToDeleteMultipleFiles: '{count}個のファイルの削除に失敗しました',
            versionHistoryNotAvailable: 'バージョン履歴サービスが利用できません',
            drawingAlreadyExists: 'この名前の図面が既に存在します',
            failedToCreateDrawing: '図面の作成に失敗しました',
            noFolderSelected: 'Notebook Navigatorでフォルダが選択されていません',
            noFileSelected: 'ファイルが選択されていません'
        },
        warnings: {
            linkBreakingNameCharacters: 'この名前には Obsidian のリンクを壊す文字が含まれています: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: '名前は . で始められず、: または / を含められません。',
            forbiddenNameCharactersWindows: 'Windows で予約されている文字は使用できません: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'フォルダを非表示: {name}',
            showFolder: 'フォルダを表示: {name}',
            folderExcludedFromDescendants: '親フォルダのリストから非表示: {name}',
            folderIncludedInDescendants: '親フォルダのリストに表示: {name}',
            mergeNotes: '{count} 個のノートを {name} に結合しました'
        },
        notifications: {
            deletedMultipleFiles: '{count}個のファイルを削除しました',
            movedMultipleFiles: '{count}個のファイルを{folder}に移動しました',
            folderNoteConversionSuccess: '「{name}」内のフォルダノートにファイルを変換しました',
            folderMoved: 'フォルダ「{name}」を移動しました',
            deepLinkCopied: 'Obsidian URL をクリップボードにコピーしました',
            pathCopied: 'パスをクリップボードにコピーしました',
            relativePathCopied: '相対パスをクリップボードにコピーしました',
            tagAddedToNote: '1個のノートにタグを追加しました',
            tagAddedToNotes: '{count}個のノートにタグを追加しました',
            tagRemovedFromNote: '1個のノートからタグを削除しました',
            tagRemovedFromNotes: '{count}個のノートからタグを削除しました',
            tagsClearedFromNote: '1個のノートからすべてのタグをクリアしました',
            tagsClearedFromNotes: '{count}個のノートからすべてのタグをクリアしました',
            noTagsToRemove: '削除するタグがありません',
            noFilesSelected: 'ファイルが選択されていません',
            mergeNotesRequireMultipleMarkdown: '結合するには少なくとも2つのMarkdownノートを選択してください',
            tagOperationsNotAvailable: 'タグ操作は利用できません',
            propertyOperationsNotAvailable: 'プロパティ操作は利用できません',
            tagsRequireMarkdown: 'タグはMarkdownノートでのみサポートされています',
            propertiesRequireMarkdown: 'プロパティはMarkdownノートでのみサポートされています',
            propertySetOnNote: '1件のノートでプロパティを更新しました',
            propertySetOnNotes: '{count}件のノートでプロパティを更新しました',
            manualSortPropertyRemovedFromNote: '1件のノートから並べ替えプロパティを削除しました',
            manualSortPropertyRemovedFromNotes: '{count}件のノートから並べ替えプロパティを削除しました',
            iconPackDownloaded: '「{provider}」をダウンロードしました',
            iconPackUpdated: '「{provider}」を更新しました ({version})',
            iconPackRemoved: '「{provider}」を削除しました',
            iconPackLoadFailed: '「{provider}」を読み込めませんでした',
            hiddenFileReveal: 'ファイルは非表示です。表示するには「非表示項目を表示」を有効にしてください'
        },
        confirmations: {
            deleteMultipleFiles: '本当に{count}個のファイルを削除しますか？',
            deleteConfirmation: 'この操作は元に戻せません。'
        },
        defaultNames: {
            untitled: '無題'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'フォルダを自分自身またはそのサブフォルダに移動することはできません。',
            itemAlreadyExists: 'この場所に "{name}" という名前のアイテムがすでに存在します。',
            failedToMove: '移動に失敗しました：{error}',
            failedToAddTag: 'タグ "{tag}" の追加に失敗しました',
            failedToSetProperty: 'プロパティの更新に失敗しました: {error}',
            failedToClearTags: 'タグのクリアに失敗しました',
            failedToMoveFolder: 'フォルダ「{name}」の移動に失敗しました',
            failedToImportFiles: 'インポートに失敗しました: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count}個のファイルが移動先に既に存在します',
            filesAlreadyHaveTag: '{count}個のファイルには既にこのタグまたはより具体的なタグがあります',
            filesAlreadyHaveProperty: '{count}個のファイルにはすでにこのプロパティがあります',
            noTagsToClear: 'クリアするタグがありません',
            fileImported: '1個のファイルをインポートしました',
            filesImported: '{count}個のファイルをインポートしました'
        }
    },

    // Date grouping
    dateGroups: {
        today: '今日',
        yesterday: '昨日',
        previous7Days: '過去7日間',
        previous30Days: '過去30日間'
    },

    // Plugin commands
    commands: {
        open: '開く', // Command palette: Opens the Notebook Navigator view (English: Open)
        toggleLeftSidebar: '左サイドバーの切り替え', // Command palette: Toggles left sidebar, opening Notebook Navigator when uncollapsing (English: Toggle left sidebar)
        openHomepage: 'ホームページを開く', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        openDailyNote: 'デイリーノートを開く',
        openWeeklyNote: 'ウィークリーノートを開く',
        openMonthlyNote: 'マンスリーノートを開く',
        openQuarterlyNote: '四半期ノートを開く',
        openYearlyNote: '年間ノートを開く',
        revealFile: 'ファイルを表示', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: '検索', // Command palette: Toggle search in the file list (English: Search)
        searchVaultRoot: '保管庫全体を検索', // Command palette: Selects the vault root folder and focuses search with subfolders included (English: Search whole vault)
        toggleDualPane: 'デュアルペインレイアウトを切り替え', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        toggleDualPaneOrientation: 'デュアルペインの向きを切り替え', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'カレンダーの切り替え', // Command palette: Toggles showing the calendar overlay in the navigation pane (English: Toggle calendar)
        selectVaultProfile: '保管庫のプロファイルを変更', // Command palette: Opens a modal to choose a different vault profile (English: Switch vault profile)
        selectVaultProfile1: '保管庫プロファイル1を選択', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: '保管庫プロファイル2を選択', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: '保管庫プロファイル3を選択', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: 'ファイルを削除', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: '新規ノートを作成', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: 'テンプレートから新規ノート', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: 'ファイルを移動', // Command palette: Move selected files to another folder (English: Move files)
        mergeNotes: 'ノートを結合', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: '次のファイルを選択', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: '前のファイルを選択', // Command palette: Selects the previous file in the current view (English: Select previous file)
        navigateBack: '前に戻る',
        navigateForward: '次に進む',
        convertToFolderNote: 'フォルダノートに変換', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: 'フォルダノートとして設定', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: 'フォルダノートを解除', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: 'フォルダノートをすべてピン留め', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'フォルダにナビゲート', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'タグにナビゲート', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        navigateToProperty: 'プロパティに移動', // Command palette: Navigate to a property key or value using fuzzy search (English: Navigate to property)
        addShortcut: 'ショートカットに追加', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: 'ショートカット {number} を開く',
        toggleDescendants: '子孫切り替え', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: '非表示のフォルダ・タグ・ノートを切り替え', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: 'タグの並び順を切り替え', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: '選択範囲でタグを切り替え',
        togglePropertiesBySelection: '選択範囲でプロパティを切り替え',
        toggleCompactMode: 'コンパクトモードの切り替え', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'ピン留めセクションの切り替え',
        collapseExpand: 'すべての項目を折りたたむ/展開', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        collapseExpandSelectedItem: '選択した項目を折りたたむ/展開',
        addTag: '選択したファイルにタグを追加', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        setProperty: '選択したファイルにプロパティを設定', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: '選択したファイルからタグを削除', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: '選択したファイルからすべてのタグを削除', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        openAllFiles: 'すべてのファイルを開く', // Command palette: Opens all files in the current folder or tag (English: Open all files)
        rebuildCache: 'キャッシュを再構築', // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
        restoreDefaultSettings: 'デフォルト設定を復元' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'ノートブックナビゲーター', // Name shown in the view header/tab (English: Notebook Navigator)
        calendarViewName: 'カレンダー', // Name shown in the view header/tab (English: Calendar)
        folderNoteSidebarViewName: 'フォルダノート', // Name shown in the folder note sidebar tab (English: Folder note)
        ribbonTooltip: 'ノートブックナビゲーター', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'ノートブックナビゲーターで表示', // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
        settingsUnavailableNotice:
            'ノートブックナビゲーターは設定を読み込めなかったため起動しませんでした。保管庫が同期中の場合は、同期完了後に Obsidian を再起動してください。デフォルト設定でやり直すには、コマンド「デフォルト設定を復元」を実行してください。', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsRecovery: {
            confirmTitle: 'デフォルト設定を復元', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'ノートブックナビゲーターの設定ファイルをデフォルト設定で置き換えます。保管庫がまだ同期中の場合、復元されたデフォルト設定が他のデバイスに保存されている設定を上書きすることがあります。読み取り可能な設定ファイルは、置き換える前にプラグインフォルダー内の日時付きバックアップにコピーされます。', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'デフォルトを復元', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: '設定の復元を完了できませんでした。ローカル設定は保持されています。', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'デフォルト設定を復元しました。完了するには Obsidian を再起動してください。' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: '最終更新',
        createdAt: '作成日時',
        file: 'ファイル',
        files: 'ファイル',
        folder: 'フォルダ',
        folders: 'フォルダ',
        wordCount: '単語数'
    },

    fileCounts: {
        words: '{count} 語',
        characters: '{count} 文字',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'デフォルト設定を変更',
        metadataReport: {
            exportSuccess: '失敗したメタデータレポートをエクスポートしました: {filename}',
            exportFailed: 'メタデータレポートのエクスポートに失敗しました'
        },
        sections: {
            general: '一般設定',
            vaultFilters: '表示フィルター',
            appearanceBehavior: '外観と動作',
            navigationPane: 'ナビゲーションペイン',
            calendar: 'カレンダー',
            fileOperations: 'ファイル操作',
            icons: 'アイコンパック',
            folders: 'フォルダノート',
            folderNotes: 'フォルダノート',
            folderNoteFiles: 'フォルダノートファイル',
            foldersAndFolderNotes: 'フォルダとフォルダノート',
            tagsAndProperties: 'タグとプロパティ',
            tags: 'タグ表示',
            listPane: 'リストペイン',
            notes: 'ファイル表示',
            shortcutsAndRecentFiles: 'ショートカットと最近のファイル',
            advanced: '詳細設定'
        },
        pageGroups: {
            configuration: '設定',
            navigationAndContent: 'ナビゲーションペイン',
            notesAndLists: 'リストペイン',
            calendarAndTools: 'カレンダーとツール'
        },
        pageDescriptions: {
            general: 'リリースノート、サポート、保管庫プロファイル、ファイルタイプ、プロパティキー。',
            vaultFilters: '非表示のフォルダ、タグ、ファイル、ファイルタグ、プロパティルール。',
            appearanceBehavior: '動作、キーボード操作、マウスボタン、外観、書式。',
            navigationPane: 'レイアウト、外観、ノート数、折りたたみ動作、レインボーカラー。',
            shortcuts: 'ショートカットの表示、バッジ、最近のファイル、ピン留めされた項目。',
            calendar: 'カレンダー表示、日付ノート、テンプレート、ロケール、サイドバーの配置。',
            fileOperations: 'テンプレート、削除確認、添付ファイル、ファイル移動時の競合動作。',
            foldersAndFolderNotes: 'フォルダ表示、フォルダノート、フォルダノートのテンプレート、フォルダノートの動作。',
            tagsProperties: 'タグとプロパティのセクション、アイコン、並べ替え、スコープ、継承。',
            listPane: '並べ替え、グループ化、リストモード、ピン留めされたノート、描画プレビュー。',
            frontmatter: '表示名、タイムスタンプ、アイコン、色のフロントマターフィールド。',
            notes: 'タイトル、プレビューテキスト、アイキャッチ画像、タグ、プロパティ、日付、単語数、文字数。',
            iconPacks: 'インターフェースアイコン、ファイルアイコン、アイコンパック管理。',
            advanced: '診断、メタデータのクリーンアップ、インポート/エクスポート、リセット。'
        },
        groups: {
            general: {
                vaultConfiguration: '保管庫のセットアップ',
                templates: 'テンプレート',
                behavior: '動作',
                startup: '起動',
                keyboardNavigation: 'キーボード操作',
                mouseButtons: 'マウスボタン',
                view: '外観',
                icons: 'アイコン',
                desktopAppearance: 'デスクトップの外観',
                mobileAppearance: 'モバイルの外観',
                formatting: '書式'
            },
            advanced: {
                maintenance: 'メンテナンス',
                resetSettings: '設定をリセット'
            },
            navigation: {
                appearance: '外観',
                banner: 'バナー',
                collapseItems: '項目を折りたたむ',
                dragAndDrop: 'ドラッグ＆ドロップ',
                noteCounts: 'ノート数',
                rainbowColors: 'レインボーカラー',
                leftSidebar: '左サイドバー',
                calendarIntegration: 'カレンダー連携'
            },
            list: {
                display: '外観',
                groupHeaders: 'グループヘッダー',
                propertySort: 'プロパティで並べ替え',
                manualSort: '手動並べ替え',
                pinnedNotes: 'ピン留めされたノート',
                drawingPreviews: '描画プレビュー'
            },
            notes: {
                frontmatter: 'フロントマターフィールド',
                tasks: 'タスク',
                icon: 'アイコン',
                title: 'タイトル',
                previewText: 'プレビューテキスト',
                featureImage: 'アイキャッチ画像',
                tags: 'タグ',
                properties: 'プロパティ',
                date: '日付',
                parentFolder: '親フォルダ',
                wordCount: '単語数と文字数'
            }
        },
        syncMode: {
            notSynced: '（未同期）',
            switchToSynced: '同期を有効化',
            switchToLocal: '同期を無効化'
        },
        items: {
            listPaneTitle: {
                name: 'リストペインのタイトル',
                desc: 'リストペインのタイトルを表示する場所を選択します。',
                options: {
                    header: 'ヘッダーに表示',
                    list: 'リストペインに表示',
                    hidden: '表示しない'
                }
            },
            sortNotesBy: {
                name: 'デフォルトの並び順',
                desc: 'ノートのデフォルトの並び順を選択します。',
                options: {
                    'modified-desc': '編集日時（新しいものが上）',
                    'modified-asc': '編集日時（古いものが上）',
                    'created-desc': '作成日時（新しいものが上）',
                    'created-asc': '作成日時（古いものが上）',
                    'title-asc': 'タイトル（昇順）',
                    'title-desc': 'タイトル（降順）',
                    'filename-asc': 'ファイル名（昇順）',
                    'filename-desc': 'ファイル名（降順）'
                },
                directions: {
                    asc: '昇順',
                    desc: '降順'
                },
                fields: {
                    modified: '更新日時',
                    created: '作成日時',
                    title: 'タイトル',
                    filename: 'ファイル名',
                    property: 'プロパティ'
                }
            },
            propertySortKey: {
                name: 'ソートに使うプロパティ',
                desc: 'プロパティソートオプションとして表示されるカンマ区切りのfrontmatterプロパティ。配列値は1つの文字列に結合されます。これらのプロパティは変更されません。',
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: '二次ソート',
                desc: 'プロパティソート使用時、同じプロパティ値またはプロパティ値がないノートに適用されます。',
                options: {
                    title: 'タイトル',
                    filename: 'ファイル名',
                    created: '作成日',
                    modified: '編集日'
                }
            },
            propertySortInstructions: {
                intro: '上記の各プロパティは、リストペインの並べ替えメニューに並べ替えオプションとして表示されます。選択すると、そのフロントマターの値でノートが並べ替えられます。'
            },
            manualSortPropertyKey: {
                name: '手動並べ替え用プロパティ',
                desc: '手動並べ替えの数値インデックス値を保存するために使用される frontmatter プロパティ。'
            },
            manualSortGroupHeaderProperty: {
                name: 'グループヘッダープロパティ',
                desc: 'カスタムグループヘッダーを保存するために使用される frontmatter プロパティ。'
            },
            groupHeadersInstructions: {
                intro: 'カスタムグループヘッダーは、リストペインでノートの上に表示されます。',
                items: [
                    'リストペインの並べ替えメニューから、グループ化を **カスタム** に設定します。',
                    'ノートを右クリックして **グループヘッダーを設定** を選ぶと、その上にヘッダーを追加できます。'
                ]
            },
            manualSortNewNotePlacement: {
                name: '新規ノートの配置',
                desc: '現在のリストが手動並べ替えを使用しているときに、新規ノートを配置する場所を選択します。',
                options: {
                    top: '先頭',
                    bottom: '末尾',
                    'below-selected-note': '選択ノートの下',
                    unsorted: '未ソート'
                }
            },
            confirmBeforeManualSort: {
                name: '手動並べ替えの前に確認',
                desc: '手動並べ替えプロパティを初めてノートに書き込む前に警告を表示します。無効にすると、ノートは警告なしでプロパティを受け取ります。'
            },
            manualSortInstructions: {
                intro: '手動並べ替えは、各ノートの frontmatter プロパティに数値インデックス値を書き込みます。インデックスのないノートは「未ソート」の下に表示されます。',
                items: [
                    'ソートメニューから **手動並べ替え** を選択して手動並べ替えを有効にします。その後、ノートを並べ替える方法は 2 つあります。',
                    'ソートメニューから **並べ替え順を編集...** を選んで並べ替えビューを開きます。マウスでドラッグするか、モバイルではタッチでドラッグします。デスクトップでは、**Cmd/Ctrl** または **Shift** クリックで複数のノートを選択し、いずれかをドラッグするとグループ全体が移動します。',
                    'リストペインで 1 つのノートを選択するか複数選択し、**Cmd/Ctrl + Arrow Up/Down** を押すと選択範囲を上下に移動できます。'
                ]
            },
            revealFileOnListChanges: {
                name: 'リスト変更時に選択ファイルへスクロール',
                desc: 'ノートのピン留め、子孫ノートの表示、フォルダ外観の変更、ファイル操作の実行時に選択したファイルへスクロールします。'
            },
            includeDescendantNotes: {
                name: 'サブフォルダ / 子孫のノートを表示',
                desc: 'フォルダ、タグ、またはプロパティを表示するとき、入れ子のサブフォルダとタグおよびプロパティの子孫にあるノートを含めます。'
            },
            limitPinnedToCurrentFolder: {
                name: 'ノートを自身のフォルダーでのみ固定',
                desc: '固定したノートは自身のフォルダーでのみ固定済みとして表示されます。フォルダーノートや固定ノートが多い場合に便利です。タグやプロパティビューには影響しません。'
            },
            separateNoteCounts: {
                name: '現在と子孫のノート数を個別に表示',
                desc: 'フォルダ、タグ、プロパティのノート数を「現在 ▾ 子孫」形式で表示します。'
            },
            groupNotes: {
                name: 'デフォルトのグループ化',
                desc: 'カスタムは frontmatter で定義されたヘッダーを表示します。日付はノートを日付でグループ化します。フォルダはノートをフォルダでグループ化します。タグとプロパティビューでは、フォルダが選択されている場合は日付グループが使用されます。',
                options: {
                    custom: 'カスタム',
                    date: '日付',
                    folder: 'フォルダ'
                }
            },
            showSelectedNavigationPills: {
                name: 'タグとプロパティのピルを常に表示',
                desc: '無効の場合、現在のナビゲーション選択に一致するピルは非表示になります（例：「レシピ」タグを閲覧中は「レシピ」タグのピルが非表示になります）。有効にすると、すべてのピルが常に表示されます。'
            },
            stickyGroupHeaders: {
                name: 'グループヘッダーを固定',
                desc: 'スクロール中も現在の日付・フォルダ・ピン留めセクションのヘッダーを表示し続けます。'
            },
            showFolderGroupPaths: {
                name: 'サブフォルダーのパスを表示',
                desc: 'リストペインでフォルダー別にグループ化する場合、フォルダー名だけでなくサブフォルダーのパスを表示します。'
            },
            showGroupHeaderItemCounts: {
                name: '項目数を表示',
                desc: 'リストペインの各グループヘッダーに項目数を表示します。'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'フォルダーグループ化: 現在のフォルダーのファイルを下部に表示',
                desc: 'デフォルトのグループ化がフォルダーの場合、選択したフォルダー直下のファイルをサブフォルダーグループの下に移動します。'
            },
            defaultListMode: {
                name: 'リストのデフォルトモード',
                desc: '既定のリストレイアウトを選択します。標準はタイトル、日付、説明、プレビューテキストを表示します。コンパクトはタイトルのみを表示します。外観はフォルダごとに上書きできます。',
                options: {
                    standard: '標準',
                    compact: 'コンパクト'
                }
            },
            showFileIcons: {
                name: 'ファイルアイコンを表示',
                desc: 'ファイルアイコンを左寄せ間隔で表示。無効化するとアイコンとインデントの両方が削除されます。優先順位: 未完了タスクアイコン > カスタムアイコン > フォルダアイコン > ファイル名アイコン > ファイルタイプアイコン > デフォルトアイコン。'
            },
            useFolderIcon: {
                name: 'フォルダアイコンを使用',
                desc: 'カスタムファイルアイコンが設定されていない場合に親フォルダのアイコンを表示します。カスタムファイル色が設定されていない場合はフォルダの色が使用されます。'
            },
            showFileIconUnfinishedTask: {
                name: '未完了タスクアイコン',
                desc: 'ノートに未完了のタスクがある場合にタスクアイコンを表示します。'
            },
            showFileBackgroundUnfinishedTask: {
                name: '未完了タスク背景',
                desc: 'ノートに未完了のタスクがある場合に背景色を適用します。'
            },
            unfinishedTaskBackgroundColor: {
                name: '未完了タスクの背景色',
                desc: 'ノートに未完了のタスクがある場合に使用する背景色を設定します。'
            },
            showFilenameMatchIcons: {
                name: 'ファイル名でアイコン設定',
                desc: 'ファイル名のテキストに基づいてアイコンを割り当てます。'
            },
            fileNameIconMap: {
                name: 'ファイル名アイコンマップ',
                desc: 'テキストを含むファイルに指定したアイコンが適用されます。1行に1つのマッピング: テキスト=アイコン',
                placeholder: '# テキスト=アイコン\n会議=ph-calendar\n請求書=ph-receipt',
                editTooltip: 'マッピングを編集'
            },
            showCategoryIcons: {
                name: 'ファイルタイプでアイコン設定',
                desc: 'ファイルの拡張子に基づいてアイコンを割り当てます。'
            },
            fileTypeIconPreset: {
                name: 'ファイルアイコンプリセット',
                desc: '内蔵アイコンまたはアイコンパックのプリセットを選択します。カスタム拡張子ルールはこのプリセットを上書きします。',
                options: {
                    none: '内蔵アイコン'
                },
                notInstalledWarning: 'このアイコンパックはインストールされていません。代わりに内蔵アイコンが表示されます。'
            },
            fileTypeIconMap: {
                name: 'ファイルタイプアイコンマップ',
                desc: '拡張子を持つファイルに指定したアイコンが適用されます。1行に1つのマッピング: 拡張子=アイコン',
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'マッピングを編集'
            },
            compactItemHeight: {
                name: 'スリム表示の項目高さ',
                desc: 'デスクトップとモバイルのスリム表示項目の高さを設定します（ピクセル）。',
                resetTooltip: 'デフォルトに戻す (28px)'
            },
            compactItemHeightScaleText: {
                name: 'スリム表示の文字サイズを高さに合わせる',
                desc: '項目の高さを下げたときにスリム表示の文字サイズを調整します。'
            },
            showParentFolder: {
                name: '親フォルダを表示',
                desc: 'サブフォルダ、タグ、またはプロパティ内のノートに親フォルダのパスを表示します。'
            },
            parentFolderClickRevealsFile: {
                name: '親フォルダクリックでフォルダを開く',
                desc: '親フォルダラベルをクリックするとリストペインでフォルダを開きます。'
            },
            showParentFolderColor: {
                name: '親フォルダの色を表示',
                desc: '親フォルダラベルにフォルダの色を使用します。'
            },
            showParentFolderIcon: {
                name: '親フォルダのアイコンを表示',
                desc: '親フォルダラベルの横にフォルダアイコンを表示します。'
            },
            showQuickActions: {
                name: 'クイックアクションを表示',
                desc: 'ファイルにホバーしたときにアクションボタンを表示します。ボタンコントロールで表示するアクションを選択します。'
            },
            dualPane: {
                name: 'デュアルペインレイアウト',
                desc: 'デスクトップでナビゲーションペインとリストペインを並べて表示します。'
            },
            dualPaneOrientation: {
                name: 'デュアルペインの向き',
                desc: 'デュアルペイン使用時の水平または垂直レイアウトを選択します。',
                options: {
                    horizontal: '水平分割',
                    vertical: '垂直分割'
                }
            },
            narrowSidebarLayout: {
                name: 'サイドバーが狭すぎる場合',
                desc: 'ナビゲーションペインとリストペインを横に並べられない場合の動作を選択します。',
                options: {
                    none: '何もしない',
                    singlePane: 'シングルペインに切り替え',
                    vertical: '縦分割に切り替え'
                }
            },
            narrowSidebarTrigger: {
                name: '狭いサイドバーのしきい値',
                desc: 'サイドバー幅のしきい値の計算方法を選択します。',
                options: {
                    fitPanes: 'ペインに合わせる',
                    customWidth: 'カスタム幅'
                }
            },
            narrowSidebarCustomWidth: {
                name: '狭いサイドバーのしきい値幅',
                desc: 'サイドバーがこの幅より狭い場合に切り替えます。',
                resetTooltip: '既定の幅に戻す'
            },
            appearanceBackground: {
                name: '背景色',
                desc: 'ナビゲーションペインとリストペインの背景色を選択します。',
                options: {
                    separate: '背景を分ける',
                    primary: 'リストの背景を使用',
                    secondary: 'ナビゲーションの背景を使用'
                }
            },
            appearanceScale: {
                name: 'ズームレベル',
                desc: 'Notebook Navigator 全体のズームレベルを制御します（パーセント）。'
            },
            useFloatingToolbars: {
                name: 'iOS/iPadOSでフローティングツールバーを使用',
                desc: 'iOSおよびiPadOSでのみ適用されます。'
            },
            startView: {
                name: 'デフォルト起動ビュー',
                desc: 'Notebook Navigator を開いたときにアクティブになるペインを選択します。シングルペインレイアウトではこのペインが最初に表示され、デュアルペインレイアウトではこのペインにキーボードフォーカスが移ります。',
                options: {
                    navigation: 'ナビゲーションペイン',
                    files: 'リストペイン'
                }
            },
            toolbarButtons: {
                name: 'ツールバーボタン',
                desc: 'ツールバーに表示するボタンを選択します。非表示のボタンはコマンドとメニューから引き続き利用できます。',
                navigationLabel: 'ナビゲーションツールバー',
                listLabel: 'リストツールバー'
            },
            createNewNotesInNewTab: {
                name: '新しいノートを新しいタブで開く',
                desc: '有効にすると、「新しいノートを作成」コマンドでノートが新しいタブに開きます。無効にすると、ノートは現在のタブに置き換わります。'
            },
            autoRevealActiveNote: {
                name: 'アクティブなノートを自動表示',
                desc: 'クイックスイッチャー、リンク、検索から開いたときに自動的にノートを表示します。'
            },
            autoRevealShortestPath: {
                name: '自動表示: 最短パスを使用',
                desc: '有効: 自動表示は最も近い表示中の親フォルダまたはタグを選択します。無効: 自動表示はファイルの実際のフォルダと正確なタグを選択します。'
            },
            autoRevealIgnoreRightSidebar: {
                name: '自動表示: 右サイドバーのイベントを無視',
                desc: '右サイドバーでのクリックやノートの変更時にアクティブノートを変更しません。'
            },
            autoRevealIgnoreOtherWindows: {
                name: '自動表示: 他のウィンドウのイベントを無視',
                desc: '別のウィンドウでノートを操作しているときにアクティブノートを変更しません。'
            },
            paneTransitionDuration: {
                name: 'シングルペインアニメーション',
                desc: 'シングルペインモードでペイン切り替え時のトランジション時間（ミリ秒）。',
                resetTooltip: 'デフォルトにリセット'
            },
            autoSelectFirstFileOnFocusChange: {
                name: '最初のノートを自動選択',
                desc: 'フォルダ、タグ、またはプロパティを切り替えた際に自動的に最初のノートを開きます。'
            },
            skipAutoScroll: {
                name: 'ショートカットの自動スクロールを無効化',
                desc: 'ショートカット内のアイテムをクリックしてもナビゲーションパネルをスクロールしない。'
            },
            autoExpandNavItems: {
                name: '選択時に展開',
                desc: '選択時にフォルダとタグを展開します。シングルペインモードでは、最初の選択で展開、2回目の選択でファイルを表示します。'
            },
            collapseOtherBranchesOnExpand: {
                name: '展開するブランチを1つにする',
                desc: 'フォルダ、タグ、またはプロパティを展開するとき、同じツリー内の他のブランチを折りたたみます。'
            },
            springLoadedFolders: {
                name: 'ドラッグ時に展開',
                desc: 'ドラッグ操作中にホバーするとフォルダとタグを展開します。'
            },
            springLoadedFoldersInitialDelay: {
                name: 'ドラッグ時に展開: 最初の展開遅延',
                desc: 'ドラッグ操作中に最初のフォルダまたはタグを展開するまでの遅延（秒）。'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'ドラッグ時に展開: 次の展開遅延',
                desc: '同じドラッグ操作中に追加のフォルダまたはタグを展開するまでの遅延（秒）。'
            },
            navigationBanner: {
                name: 'ナビゲーションバナー（保管庫プロファイル）',
                desc: 'ナビゲーションペイン上部に画像を表示します。選択された保管庫プロファイルに応じて変更されます。',
                current: '現在のバナー: {path}',
                chooseButton: '画像を選択'
            },
            pinNavigationBanner: {
                name: 'バナーを固定',
                desc: 'ナビゲーションバナーをナビゲーションツリーの上に固定します。'
            },
            showShortcuts: {
                name: 'ショートカットを表示',
                desc: 'ナビゲーションペインにショートカットセクションを表示します。'
            },
            shortcutBadgeDisplay: {
                name: 'ショートカットバッジ',
                desc: 'ショートカットの横に表示する内容。「ショートカット1-9を開く」コマンドでショートカットを直接開けます。',
                options: {
                    index: '位置 (1-9)',
                    count: 'アイテム数',
                    none: 'なし'
                }
            },
            showRecentNotes: {
                name: '最近のファイルを表示',
                desc: 'ナビゲーションペインに最近のファイルセクションを表示します。'
            },
            hideRecentNotes: {
                name: '最近のファイルからファイルの種類を非表示',
                desc: '最近のファイルセクションで非表示にするファイルの種類を選択します。',
                options: {
                    none: 'なし',
                    folderNotes: 'フォルダノート'
                }
            },
            recentNotesCount: {
                name: '最近のファイル数',
                desc: '表示する最近のファイルの数。'
            },
            pinRecentNotesWithShortcuts: {
                name: '最近のファイルをショートカットと一緒に固定',
                desc: 'ショートカットを固定するときに最近のファイルを含める。'
            },
            calendarEnabled: {
                name: 'カレンダーを有効化',
                desc: 'Notebook Navigatorのカレンダー機能を有効にします。'
            },
            calendarPlacement: {
                name: 'カレンダーの配置',
                desc: '左または右サイドバーに表示します。',
                options: {
                    leftSidebar: '左サイドバー',
                    rightSidebar: '右サイドバー'
                }
            },
            calendarLeftPlacement: {
                name: 'シングルペイン配置',
                desc: 'シングルペインモードでのカレンダー表示位置。',
                options: {
                    navigationPane: 'ナビゲーションペイン',
                    below: 'ペインの下'
                }
            },
            calendarLocale: {
                name: 'ロケール',
                desc: 'カレンダーの日付形式、週番号、週の開始曜日を制御します。',
                weekPathMismatchWarning: '表示されるカレンダーとウィークリーノートのパスで、週の開始曜日または週番号が異なります。',
                options: {
                    systemDefault: 'デフォルト'
                }
            },
            calendarWeekendDays: {
                name: '週末',
                desc: '週末を異なる背景色で表示します。',
                options: {
                    none: 'なし',
                    satSun: '土曜日と日曜日',
                    friSat: '金曜日と土曜日',
                    thuFri: '木曜日と金曜日'
                }
            },
            calendarMonthHeadingFormat: {
                name: '月名の形式',
                desc: '月名を長い形式 (1月) または短い形式 (1月) で表示します。',
                options: {
                    full: '1月 (完全)',
                    short: '1月 (短縮)'
                }
            },
            showInfoButtons: {
                name: '情報ボタンを表示',
                desc: '検索バーとカレンダーヘッダーに情報ボタンを表示します。'
            },
            calendarWeeksToShow: {
                name: '左サイドバーの表示週数',
                desc: '右サイドバーのカレンダーは常に月全体を表示します。',
                options: {
                    fullMonth: '月全体',
                    oneWeek: '1週間',
                    weeksCount: '{count}週間'
                }
            },
            calendarHighlightToday: {
                name: '今日の日付を強調表示',
                desc: '今日の日付を背景色と太字で強調表示します。'
            },
            calendarShowFeatureImage: {
                name: 'アイキャッチ画像を表示',
                desc: 'カレンダーでノートのアイキャッチ画像を表示します。'
            },
            calendarShowTasks: {
                name: 'タスクを表示',
                desc: '未完了のタスクがある日、週、月にインジケーターを表示します。'
            },
            calendarShowWeekNumber: {
                name: '週番号を表示',
                desc: '週番号の列を追加します。'
            },
            calendarShowQuarter: {
                name: '四半期を表示',
                desc: 'カレンダーヘッダーに四半期ラベルを追加します。'
            },
            calendarShowYearCalendar: {
                name: '年間カレンダーを表示',
                desc: '右サイドバーに年ナビゲーションと月グリッドを表示します。'
            },
            calendarConfirmBeforeCreate: {
                name: '作成前に確認',
                desc: '新しいデイリーノートを作成する際に確認ダイアログを表示します。'
            },
            calendarIntegrationMode: {
                name: 'デイリーノートのソース',
                desc: 'カレンダーノートのソース。',
                options: {
                    dailyNotes: 'デイリーノート（コアプラグイン）',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'フォルダと日付形式はデイリーノートコアプラグインで設定されています。'
                }
            },
            calendarPeriodicNotesLocale: {
                name: '定期ノートのロケール',
                desc: 'Notebook Navigator の定期ノートのパスでローカライズされた月名、曜日名、週番号、週の開始曜日を制御します。',
                options: {
                    calendar: 'カレンダー',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'ルートフォルダ',
                desc: '定期ノートの基本フォルダ。日付パターンにはサブフォルダを含めることができます。選択されたボールトプロファイルで変更されます。',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'テンプレートフォルダの場所',
                desc: 'テンプレートファイルピッカーはこのフォルダからノートを表示します。',
                placeholder: 'Templates',
                usage: 'カレンダーノートとフォルダノートで使用されます。テンプレートは カレンダー > カレンダー連携 と フォルダとフォルダノート > フォルダノートファイル で設定します。'
            },
            calendarCustomFilePattern: {
                name: 'デイリーノート',
                desc: 'Moment 日付フォーマットを使用してパスを指定。サブフォルダ名は角括弧で囲みます（例：[Work]/YYYY）。テンプレートアイコンをクリックしてテンプレートを設定。 テンプレートフォルダの場所はファイル操作 > テンプレートで設定してください。',
                momentDescPrefix: '',
                momentLinkText: 'Moment 日付フォーマット',
                momentDescSuffix:
                    'を使用してパスを指定。サブフォルダ名は角括弧で囲みます（例：[Work]/YYYY）。テンプレートアイコンをクリックしてテンプレートを設定。 テンプレートフォルダの場所はファイル操作 > テンプレートで設定してください。',
                templaterSupportInstalled: '✅ Templater プラグインがインストールされており、テンプレートの完全サポートが利用できます。',
                templaterSupportMissing: '⚠️ テンプレートの完全サポートを利用するには、Templater プラグインをインストールしてください。',
                placeholder: 'YYYY/YYYYMMDD',
                example: '現在の構文: {path}',
                parsingError: 'パターンは完全な日付（年、月、日）としてフォーマットされ、再度パースできる必要があります。'
            },
            calendarCustomWeekPattern: {
                name: 'ウィークリーノート',
                parsingError: 'パターンは完全な週（週年、週番号）としてフォーマットされ、再度パースできる必要があります。',
                weekPathMismatchWarning:
                    'ウィークリーノートのパスは定期ノートのロケールを使用します。一致するロケールを使用するか、月曜日から始まる週には "GGGG" と "WW" を使用してください。',
                mixedWeekTokensWarning:
                    'このパターンは月曜日基準の週トークン（"W" または "G"）とロケール基準の週トークン（"w" または "g"）を混在させています。一貫して 1 つのセットを使用してください。月曜日から始まる週には "GGGG" と "WW"、ウィークリーノートが選択したロケールに従う場合は "gggg" と "ww" を使用してください。'
            },
            calendarCustomMonthPattern: {
                name: 'マンスリーノート',
                parsingError: 'パターンは完全な月（年、月）としてフォーマットされ、再度パースできる必要があります。'
            },
            calendarCustomQuarterPattern: {
                name: '四半期ノート',
                parsingError: 'パターンは完全な四半期（年、四半期）としてフォーマットされ、再度パースできる必要があります。'
            },
            calendarCustomYearPattern: {
                name: '年次ノート',
                parsingError: 'パターンは完全な年（年）としてフォーマットされ、再度パースできる必要があります。'
            },
            calendarTemplateFile: {
                current: 'テンプレートファイル: {name}'
            },
            showTooltips: {
                name: 'ツールチップを表示',
                desc: 'ノートとフォルダの追加情報をホバー時にツールチップで表示します。'
            },
            showTooltipPath: {
                name: 'ツールチップにパスを表示',
                desc: 'ツールチップでノート名の下にフォルダパスを表示します。'
            },
            showTooltipWordCount: {
                name: 'ツールチップに単語数を表示',
                desc: 'ツールチップにノートの単語数を表示します。'
            },
            resetPaneSeparator: {
                name: 'ペインセパレーターの位置をリセット',
                desc: 'ナビゲーションペインとリストペーンの間のドラッグ可能なセパレーターをデフォルトの位置にリセットします。',
                buttonText: 'セパレーターをリセット',
                notice: 'セパレーターの位置がリセットされました。Obsidianを再起動するか、Notebook Navigatorを開き直して適用してください。'
            },
            settingsTransfer: {
                name: '設定のインポートとエクスポート',
                desc: 'Notebook Navigatorの設定をJSONとしてエクスポートまたはインポートします。インポートするとすべての設定が置き換えられます。',
                importButtonText: 'インポート',
                exportButtonText: 'エクスポート',
                import: {
                    modalTitle: '設定をインポート',
                    fileButtonName: 'ファイルからインポート',
                    fileButtonDesc: 'ディスクからJSONファイルを読み込みます。',
                    fileButtonText: 'ファイルからインポート',
                    editorName: 'JSON',
                    editorDesc: '下にJSONを貼り付けまたは編集してください。含まれていない設定はデフォルトにリセットされます。',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'インポート',
                    confirmTitle: '設定をインポートしますか？',
                    confirmMessage: 'インポートすると、現在の Notebook Navigator 設定が置き換えられます。',
                    backupToggleName: 'インポート前に現在の設定をボールトのルートに保存',
                    backupToggleDesc: 'ボールトのルートにタイムスタンプ付きの JSON ファイルを作成します。',
                    successWithBackupNotice: '設定がインポートされました。以前の設定は {path} に保存されました。',
                    backupError: '現在の設定を保存できませんでした: {message}',
                    successNotice: '設定がインポートされました。',
                    errorNotice: '設定のインポートに失敗しました: {message}',
                    fileReadError: 'ファイルを読み込めませんでした: {message}'
                },
                export: {
                    modalTitle: '設定をエクスポート',
                    editorName: 'JSON',
                    editorDesc: 'デフォルトから変更された設定のみが含まれます。',
                    placeholder: '{}',
                    copyButtonText: 'クリップボードにコピー',
                    downloadButtonText: 'ダウンロード',
                    copyNotice: '設定がクリップボードにコピーされました。',
                    downloadNotice: '設定がエクスポートされました。',
                    downloadError: '設定のダウンロードに失敗しました: {message}'
                }
            },
            resetAllSettings: {
                name: 'すべての設定をリセット',
                desc: 'Notebook Navigatorのすべての設定をデフォルト値にリセットします。',
                buttonText: 'すべての設定をリセット',
                confirmTitle: 'すべての設定をリセットしますか？',
                confirmMessage: 'Notebook Navigatorのすべての設定がデフォルト値にリセットされます。元に戻せません。',
                confirmButtonText: 'すべての設定をリセット',
                notice: 'すべての設定がリセットされました。Obsidianを再起動するか、Notebook Navigatorを開き直して適用してください。',
                error: '設定のリセットに失敗しました。'
            },
            multiSelectModifier: {
                name: '複数選択モディファイア',
                desc: '複数選択を切り替えるモディファイアキーを選択します。Option/Altが選択されている場合、Cmd/Ctrlクリックでノートを新しいタブで開きます。',
                options: {
                    cmdCtrl: 'Cmd/Ctrl クリック',
                    optionAlt: 'Option/Alt クリック'
                }
            },
            enterToOpenFiles: {
                name: 'Enterキーでファイルを開く',
                desc: 'リストのキーボード操作中にEnterキーを押したときのみファイルを開きます。macOSでは、Enterキーでファイル名が変更されないようにします。'
            },
            shiftEnterOpenContext: {
                name: 'Shift+Enter',
                desc: 'Shift+Enterで選択したファイルを開くか名前を変更するかを選択します。'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Enter',
                desc: 'Cmd+Enterで選択したファイルを開くか名前を変更するかを選択します。'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Enter',
                desc: 'Ctrl+Enterで選択したファイルを開くか名前を変更するかを選択します。'
            },
            mouseBackForwardAction: {
                name: 'マウスの戻る/進むボタン',
                desc: 'デスクトップでのマウスの戻る/進むボタンの動作。',
                options: {
                    none: 'システムのデフォルトを使用',
                    singlePaneSwitch: 'ペイン切り替え（シングルペイン）',
                    history: '履歴をナビゲート'
                }
            },
            excludedNotes: {
                name: 'プロパティルールでノートを非表示 (ボルトプロファイル)',
                desc: 'カンマ区切りのフロントマタールールのリスト。`key` または `key=value` エントリを使用します（例：status=done, published=true, archived）。',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'ファイルを非表示 (ボルトプロファイル)',
                desc: '非表示にするファイル名パターンのカンマ区切りリスト。* ワイルドカードと / パスをサポート（例：temp-*、*.png、/assets/*）。',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: '保管庫プロファイル',
                desc: 'プロファイルは、ファイルタイプの表示、非表示ファイル、非表示フォルダ、非表示タグ、非表示ノート用のプロパティルール、ショートカット、ナビゲーションバナーを保存します。ナビゲーションペインのヘッダーからプロファイルを切り替えます。',
                defaultName: 'デフォルト',
                addButton: 'プロファイルを追加',
                editProfilesButton: 'プロファイルを編集',
                addProfileOption: 'プロファイルを追加...',
                applyButton: '適用',
                deleteButton: 'プロファイルを削除',
                addModalTitle: 'プロファイルを追加',
                editProfilesModalTitle: 'プロファイルを編集',
                addModalPlaceholder: 'プロファイル名',
                deleteModalTitle: '{name}を削除',
                deleteModalMessage:
                    '{name}を削除しますか？このプロファイルに保存されている非表示ファイル、フォルダ、タグ、プロパティベースのノートフィルタが削除されます。',
                moveUp: '上に移動',
                moveDown: '下に移動',
                errors: {
                    emptyName: 'プロファイル名を入力してください',
                    duplicateName: 'プロファイル名は既に存在します'
                }
            },
            vaultTitle: {
                name: 'ボルトタイトルの配置',
                desc: 'ボルトタイトルの表示場所を選択します。',
                options: {
                    header: 'ヘッダーに表示',
                    navigation: 'ナビゲーションペインに表示'
                }
            },
            excludedFolders: {
                name: 'フォルダを非表示 (ボルトプロファイル)',
                desc: '非表示にするフォルダのカンマ区切りリスト。名前パターン: assets*（assetsで始まるフォルダ）、*_temp（_tempで終わる）。パスパターン: /archive（ルートのアーカイブのみ）、/res*（resで始まるルートフォルダ）、/*/temp（1階層下のtempフォルダ）、/projects/*（projects内のすべてのフォルダ）。',
                placeholder: 'templates, assets*, /archive, /res*'
            },
            descendantExcludedFolders: {
                name: 'サブフォルダのノートからフォルダを除外（保管庫プロファイル）',
                desc: 'サブフォルダからノートを収集するときに除外するフォルダのカンマ区切りリスト。フォルダは表示されたままで、選択するとそのノートは引き続き表示されます。「フォルダを非表示」と同じパターンを使用します。',
                placeholder: '日記, リソース, /archive'
            },
            fileVisibility: {
                name: 'ファイルタイプを表示 (ボルトプロファイル)',
                desc: 'ナビゲーターに表示されるファイルタイプをフィルタリングします。Obsidianでサポートされていないファイルタイプは、外部アプリケーションで開かれる場合があります。',
                options: {
                    documents: 'ドキュメント (.md, .canvas, .base)',
                    supported: 'サポート (Obsidianで開く)',
                    all: 'すべて (外部で開く場合あり)'
                }
            },
            homepage: {
                name: 'ホームページ',
                desc: '起動時に自動で開く対象を選択します。',
                current: '現在: {path}',
                chooseButton: 'ファイルを選択',
                options: {
                    none: 'なし',
                    file: 'ファイル',
                    dailyNote: 'デイリーノート',
                    weeklyNote: 'ウィークリーノート',
                    monthlyNote: 'マンスリーノート',
                    quarterlyNote: 'クォータリーノート',
                    yearlyNote: 'イヤリーノート'
                },
                file: {
                    name: 'ホームページ: 起動ファイル',
                    empty: 'ファイルが選択されていません'
                },
                createMissing: {
                    name: 'ホームページ: ノートが存在しない場合に作成',
                    desc: '起動時またはコマンド実行時に、定期ノートが存在しなければ作成します。'
                }
            },
            showFileDate: {
                name: '日付を表示',
                desc: 'ノート名の下に日付を表示します。'
            },
            alphabeticalDateMode: {
                name: '名前でソート時',
                desc: 'ノートが名前でソートされている場合に表示する日付。',
                options: {
                    created: '作成日',
                    modified: '更新日'
                }
            },
            showFileTags: {
                name: 'ファイルタグを表示',
                desc: 'ファイルアイテムにクリック可能なタグを表示します。'
            },
            showFileTagAncestors: {
                name: '完全なタグパスを表示',
                desc: "タグの完全な階層パスを表示します。有効時: 'ai/openai', 'work/projects/2024'。無効時: 'openai', '2024'。"
            },
            colorFileTags: {
                name: 'ファイルタグに色を付ける',
                desc: 'ファイルアイテムのタグバッジにタグの色を適用します。'
            },
            prioritizeColoredFileTags: {
                name: '色付きタグを先頭に配置',
                desc: '色付きタグを他のタグより前に並べ替えます。'
            },
            showFileTagsInCompactMode: {
                name: 'スリムモードでファイルタグを表示',
                desc: '日付、プレビュー、画像が非表示のときにタグを表示します。'
            },
            showFileProperties: {
                name: 'ファイルプロパティを表示',
                desc: 'ファイル項目にプロパティを表示します。「プロパティキーの表示設定」ダイアログで表示するプロパティを選択してください。'
            },
            colorFileProperties: {
                name: 'ファイルプロパティに色を付ける',
                desc: 'ファイル項目のプロパティバッジにプロパティの色を適用します。'
            },
            prioritizeColoredFileProperties: {
                name: '色付きプロパティを先に表示',
                desc: 'ファイル項目で色付きプロパティを他のプロパティより前に並べ替えます。'
            },
            showFilePropertiesInCompactMode: {
                name: 'コンパクトモードでプロパティを表示',
                desc: 'コンパクトモードが有効な時にプロパティを表示します。'
            },
            textCountDisplay: {
                name: 'カウントの種類',
                desc: 'ファイル項目に表示するノートのカウントを選択します。',
                options: {
                    none: 'なし',
                    words: '単語数',
                    characters: '文字数',
                    both: '単語数と文字数'
                }
            },
            textCountPlacement: {
                name: '配置',
                desc: 'ノートのカウントを表示する場所を選択します。',
                options: {
                    title: 'タイトル内',
                    property: 'プロパティとして'
                }
            },
            characterCountSpaces: {
                name: '文字数',
                desc: '文字数にスペースを含めるかを選択します。',
                options: {
                    include: 'スペースを含む',
                    exclude: 'スペースを除く'
                }
            },
            wordCountTargetProperty: {
                name: '目標プロパティ',
                desc: '目標単語数を含むフロントマターのプロパティキー。目標を非表示にするには空にします。'
            },
            showWordCountPercentage: {
                name: '目標パーセントを表示',
                desc: '目標単語数がある場合、進捗パーセントのみを表示します。'
            },
            propertyFields: {
                name: 'プロパティキー（保管庫プロファイル）',
                desc: 'フロントマターのプロパティキー。キーごとにナビゲーションとファイルリストの表示を設定できます。',
                addButtonTooltip: 'プロパティキーを設定',
                noneConfigured: 'プロパティが設定されていません',
                singleConfigured: '1件のプロパティが設定済み: {properties}',
                multipleConfigured: '{count}件のプロパティが設定済み: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'プロパティを別の行に表示',
                desc: '各プロパティを個別の行に表示します。'
            },
            enablePropertyInternalLinks: {
                name: 'プロパティピルをノートにリンク',
                desc: 'プロパティピルをクリックしてリンク先のノートを開きます。'
            },
            enablePropertyExternalLinks: {
                name: 'プロパティピルをURLにリンク',
                desc: 'プロパティピルをクリックしてリンク先のURLを開きます。'
            },
            dateFormat: {
                name: '日付形式',
                desc: '日付表示の形式（Moment形式を使用）。',
                placeholder: 'YYYY年M月D日',
                help: '一般的な形式：\nYYYY年M月D日 = 2022年5月25日\nYYYY-MM-DD = 2022-05-25\nMM/DD/YYYY = 05/25/2022\n\nトークン：\nYYYY/YY = 年\nMMMM/MMM/MM/M = 月\nDD/D = 日\ndddd/ddd = 曜日',
                helpTooltip: 'Moment形式',
                momentLinkText: 'Moment フォーマット'
            },
            timeFormat: {
                name: '時刻形式',
                desc: '時刻を表示する形式（Moment形式を使用）。',
                placeholder: 'HH:mm',
                help: '一般的な形式：\nHH:mm = 14:30（24時間制）\nh:mm a = 2:30 PM（12時間制）\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nトークン：\nHH/H = 24時間制\nhh/h = 12時間制\nmm = 分\nss = 秒\na = AM/PM',
                helpTooltip: 'Moment形式',
                momentLinkText: 'Moment フォーマット'
            },
            showFilePreview: {
                name: 'ノートプレビューを表示',
                desc: 'ノート名の下にプレビューテキストを表示します。'
            },
            skipHeadingsInPreview: {
                name: 'プレビューで見出しをスキップ',
                desc: 'プレビューテキスト生成時に見出し行をスキップします。'
            },
            skipCodeBlocksInPreview: {
                name: 'プレビューでコードブロックをスキップ',
                desc: 'プレビューテキスト生成時にコードブロックをスキップします。'
            },
            stripHtmlInPreview: {
                name: 'プレビューのHTMLを削除',
                desc: 'プレビューテキストからHTMLタグを削除します。大きなノートではパフォーマンスに影響する場合があります。'
            },
            stripLatexInPreview: {
                name: 'プレビューのLaTeXを削除',
                desc: 'プレビューテキストからインラインおよびブロックLaTeX式を削除します。'
            },
            previewProperties: {
                name: 'プレビュープロパティ',
                desc: 'プレビューテキストを検索するフロントマタープロパティのカンマ区切りリスト。テキストがある最初のプロパティが使用されます。',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'ノート内容にフォールバック',
                desc: '指定されたプロパティにテキストが含まれていない場合、ノート内容をプレビューとして表示します。'
            },
            previewRows: {
                name: 'プレビュー行数',
                desc: 'プレビューテキストの表示行数。',
                options: {
                    '1': '1行',
                    '2': '2行',
                    '3': '3行',
                    '4': '4行',
                    '5': '5行'
                }
            },
            fileNameRows: {
                name: 'タイトル行数',
                desc: 'ノートタイトルの表示行数。',
                options: {
                    '1': '1行',
                    '2': '2行',
                    '3': '3行'
                }
            },
            useFolderColor: {
                name: 'フォルダの色を使用',
                desc: 'カスタムファイル色が設定されていない場合に、ノートタイトルとファイルアイコンを親フォルダの色で表示します。優先順位: カスタムファイル色 > フォルダの色 > デフォルト色。'
            },
            showFeatureImage: {
                name: 'アイキャッチ画像を表示',
                desc: 'ノートで最初に見つかった画像のサムネイルを表示します。'
            },
            forceSquareFeatureImage: {
                name: 'アイキャッチ画像を正方形に固定',
                desc: 'アイキャッチ画像を正方形のサムネイルとして表示します。'
            },
            featureImageProperties: {
                name: '画像プロパティ',
                desc: '最初にチェックするフロントマタープロパティのカンマ区切りリスト。見つからない場合はmarkdownコンテンツの最初の画像を使用します。',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'プロパティを持つノートを除外',
                desc: 'フロントマタープロパティのカンマ区切りリスト。これらのプロパティを含むノートはフィーチャー画像を保存しません。',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: 'フィーチャー画像の表示サイズ',
                desc: 'ノートリストでのフィーチャー画像の最大レンダリングサイズ。',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'フィーチャー画像のピクセルサイズ',
                desc: '保存されるフィーチャー画像サムネイルの生成時に使用される解像度。大きなプレビューがぼやける場合はこの値を上げてください。',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: '外部画像をダウンロード',
                desc: 'リモート画像とYouTubeサムネイルをフィーチャー画像としてダウンロードします。'
            },
            hideDrawingPreviewImages: {
                name: 'エクスポートされたプレビュー画像を非表示',
                desc: 'エクスポートされた描画プレビューの PNG ファイルを非表示にします。表示するには「非表示の項目を表示」をオンにしてください。'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator は Excalidraw からエクスポートされた PNG ファイルを図のプレビューとして表示します。',
                items: [
                    '**Excalidraw 設定** で **Embedding Excalidraw into your Notes and Exporting** を開き、続いて **Export Settings**、次に **Auto-export Settings** を開きます。',
                    '**Auto-export PNG** を有効にします。必要に応じて **Export both dark- and light-themed image** も有効にできます。',
                    'Notebook Navigator は **Drawing.excalidraw.png**、**Drawing.excalidraw.dark.png**、**Drawing.excalidraw.light.png** のいずれかを探します。',
                    '**エクスポートされたプレビュー画像を非表示** が有効な間、PNG ファイルは **非表示の項目を表示** も有効な場合にのみ表示されます。'
                ]
            },
            showRootFolder: {
                name: 'ルートフォルダを表示',
                desc: 'ツリーにルートフォルダ名を表示します。'
            },
            showFolderIcons: {
                name: 'フォルダアイコンを表示',
                desc: 'ナビゲーションペインのフォルダの横にアイコンを表示します。'
            },
            inheritFolderColors: {
                name: 'フォルダの色を継承',
                desc: 'サブフォルダが親フォルダから色を継承します。'
            },
            folderSortOrder: {
                name: 'フォルダの並び順',
                desc: 'フォルダを右クリックして、その子要素の並び順を個別に設定できます。',
                options: {
                    alphaAsc: 'A から Z',
                    alphaDesc: 'Z から A'
                }
            },
            showNoteCount: {
                name: 'ノート数を表示',
                desc: 'フォルダ、タグ、プロパティの横にノート数を表示します。'
            },
            showSectionIcons: {
                name: 'ショートカットと最近の項目のアイコンを表示',
                desc: 'ショートカットと最近使用したファイルセクション内の項目の横にアイコンを表示します。'
            },
            interfaceIcons: {
                name: 'インターフェースアイコン',
                desc: 'ツールバー、フォルダ、タグ、プロパティ、ピン留め、検索、並べ替えのアイコンを編集します。',
                buttonText: 'アイコンを編集'
            },
            showIconsColorOnly: {
                name: 'アイコンのみに色を適用',
                desc: '有効にすると、カスタムカラーはアイコンのみに適用されます。無効にすると、アイコンとテキストラベルの両方に色が適用されます。'
            },
            navRainbowMode: {
                name: 'レインボーカラーモード（保管庫プロファイル）',
                desc: 'ナビゲーションペインにレインボーカラーを適用します。',
                options: {
                    none: 'オフ',
                    foreground: 'テキストカラー',
                    background: '背景色'
                }
            },
            navRainbowFirstColor: {
                name: '最初の色',
                desc: 'レインボーグラデーションの最初の色。'
            },
            navRainbowLastColor: {
                name: '最後の色',
                desc: 'レインボーグラデーションの最後の色。'
            },
            navRainbowTransitionStyle: {
                name: 'トランジションスタイル',
                desc: '最初の色と最後の色の間で使用される補間。',
                options: {
                    hue: '色相',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'ショートカットに適用',
                desc: 'レインボーカラーをショートカットに適用します。'
            },
            navRainbowApplyToRecent: {
                name: '最近の項目に適用',
                desc: 'レインボーカラーを最近の項目に適用します。'
            },
            navRainbowApplyToFolders: {
                name: 'フォルダーに適用',
                desc: 'レインボーカラーをフォルダーに適用します。'
            },
            navRainbowFolderScope: {
                name: 'フォルダー範囲',
                desc: 'カラー割り当てを開始するフォルダーレベルを選択します。',
                options: {
                    root: 'ルートレベル',
                    child: '子レベル',
                    all: 'すべてのレベル'
                }
            },
            navRainbowApplyToTags: {
                name: 'タグに適用',
                desc: 'レインボーカラーをタグに適用します。'
            },
            navRainbowTagScope: {
                name: 'タグ範囲',
                desc: 'カラー割り当てを開始するタグレベルを選択します。',
                options: {
                    root: 'ルートレベル',
                    child: '子レベル',
                    all: 'すべてのレベル'
                }
            },
            navRainbowApplyToProperties: {
                name: 'プロパティに適用',
                desc: 'レインボーカラーをプロパティに適用します。'
            },
            navRainbowBalanceHueLuminance: {
                name: '色相間で一貫した明るさ', // (English: Consistent brightness across hues)
                desc: '色相の遷移中に開始色と終了色の間で明るさを補間します。' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'ライトモードとダークモードの色を分離', // (English: Separate light and dark mode colors)
                desc: 'ライトモードとダークモードで異なるレインボーカラーを使用します。' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'ライトモードの色をダークモードにコピー', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'プロパティ範囲',
                desc: 'カラー割り当てを開始するプロパティレベルを選択します。',
                options: {
                    root: 'ルートレベル',
                    child: '子レベル',
                    all: 'すべてのレベル'
                }
            },
            collapseBehavior: {
                name: '項目を折りたたむ',
                desc: '展開/折りたたみボタンが影響する項目を選択します。',
                options: {
                    all: 'すべて',
                    foldersOnly: 'フォルダのみ',
                    tagsOnly: 'タグのみ',
                    propertiesOnly: 'プロパティのみ'
                }
            },
            smartCollapse: {
                name: '選択中の項目を展開したままにする',
                desc: '折りたたむ時、選択中の項目とその親を展開したままにします。'
            },
            excludeVaultRootFromCollapse: {
                name: '折りたたみ時にボールトのルートをスキップ',
                desc: 'すべての項目を折りたたむ時、ボールトのルートフォルダを現在の状態のままにします。'
            },
            navIndent: {
                name: 'ツリーインデント',
                desc: 'ネストされたフォルダ、タグ、プロパティのインデント幅を調整します（ピクセル）。'
            },
            navItemHeight: {
                name: '行高',
                desc: 'ナビゲーションペイン内のフォルダ、タグ、プロパティの高さを調整します（ピクセル）。'
            },
            navItemHeightScaleText: {
                name: '行高に合わせて文字サイズを調整',
                desc: '行高を下げたときにナビゲーションの文字サイズを小さくします。'
            },
            showIndentGuides: {
                name: 'インデントガイドを表示',
                desc: 'ネストされたフォルダー、タグ、プロパティのインデントガイドを表示します。'
            },
            navCountLeaderStyle: {
                name: 'リーダーを表示',
                desc: '項目名とノート数の間に点、ダッシュ、または線を表示します。',
                options: {
                    none: 'なし',
                    dots: '点 (...)',
                    dashes: 'ダッシュ (---)',
                    line: '線'
                }
            },
            navRootSpacing: {
                name: 'ルート要素の間隔',
                desc: '最上位のフォルダ、タグ、プロパティの間隔（ピクセル）。'
            },
            showTags: {
                name: 'タグを表示',
                desc: 'ナビゲーターにタグセクションを表示します。'
            },
            showTagIcons: {
                name: 'タグアイコンを表示',
                desc: 'ナビゲーションペインのタグの横にアイコンを表示します。'
            },
            inheritTagColors: {
                name: 'タグの色を継承',
                desc: '子タグが親タグの色を継承します。'
            },
            tagSortOrder: {
                name: 'タグの並び順',
                desc: 'タグを右クリックして、その子要素の並び順を個別に設定できます。',
                options: {
                    alphaAsc: 'A から Z',
                    alphaDesc: 'Z から A',
                    frequency: '頻度',
                    lowToHigh: '低→高',
                    highToLow: '高→低'
                }
            },
            showAllTagsFolder: {
                name: 'タグフォルダを表示',
                desc: '「タグ」を折りたたみ可能なフォルダとして表示します。'
            },
            showUntagged: {
                name: 'タグなしノートを表示',
                desc: 'タグのないノート用に「タグなし」項目を表示します。'
            },
            scopeTagsToCurrentContext: {
                name: '選択内容でタグを絞り込む',
                desc: '選択したフォルダーまたはプロパティ内のノートに含まれるタグのみ表示します。'
            },
            keepEmptyTagsProperty: {
                name: '最後のタグを削除した後も tags プロパティを保持',
                desc: 'すべてのタグが削除されても frontmatter の tags プロパティを保持します。無効にすると、tags プロパティは frontmatter から削除されます。'
            },
            showProperties: {
                name: 'プロパティを表示',
                desc: 'ナビゲーターにプロパティセクションを表示します。',
                propertyKeysInfoPrefix: '',
                propertyKeysInfoLinkText: 'スタート > プロパティキー',
                propertyKeysInfoSuffix: 'でプロパティを設定'
            },
            showPropertyIcons: {
                name: 'プロパティアイコンを表示',
                desc: 'ナビゲーションペインのプロパティの横にアイコンを表示します。'
            },
            inheritPropertyColors: {
                name: 'プロパティの色を継承',
                desc: 'プロパティ値がプロパティキーの色と背景色を継承します。'
            },
            propertySortOrder: {
                name: 'プロパティの並べ替え順',
                desc: '任意のプロパティを右クリックして、その値に別の並べ替え順を設定します。',
                options: {
                    alphaAsc: 'A から Z',
                    alphaDesc: 'Z から A',
                    frequency: '頻度',
                    lowToHigh: '低い順',
                    highToLow: '高い順'
                }
            },
            showAllPropertiesFolder: {
                name: 'プロパティフォルダを表示',
                desc: '「プロパティ」を折りたたみ可能なフォルダとして表示します。'
            },
            scopePropertiesToCurrentContext: {
                name: '選択内容でプロパティを絞り込む',
                desc: '選択したフォルダーまたはタグ内のノートに含まれるプロパティのみ表示します。'
            },
            hiddenTags: {
                name: 'タグを非表示 (ボルトプロファイル)',
                desc: 'カンマ区切りのタグパターンリスト。名前パターン: tag*（で始まる）、*tag（で終わる）。パスパターン: archive（タグと子孫）、archive/*（子孫のみ）、projects/*/drafts（中間ワイルドカード）。',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            hiddenFileTags: {
                name: 'タグ付きノートを非表示 (ボルトプロファイル)',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'フォルダノートを有効化',
                desc: '一致するノートファイルを持つフォルダーがクリック可能なリンクとして表示されます。'
            },
            folderNoteType: {
                name: '既定のフォルダノート形式',
                desc: 'コンテキストメニューで作成されるフォルダノートの形式です。',
                options: {
                    ask: '作成時に確認',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'フォルダノート名',
                desc: 'フォルダノートの名前。空のままにするとフォルダと同じ名前を使用します。',
                placeholder: 'index'
            },
            folderNoteNamePattern: {
                name: 'フォルダノート名パターン',
                desc: '拡張子なしのフォルダノートの名前パターン。{{folder}} でフォルダ名を挿入します。設定すると、フォルダノート名は適用されません。'
            },
            folderNoteTemplate: {
                name: 'フォルダノートテンプレート',
                desc: 'フォルダノート作成時に使用するテンプレートファイル。MarkdownテンプレートではTemplaterを使用できます。CanvasとBaseテンプレートはファイル内容としてコピーされます。テンプレートフォルダの場所はファイル操作 > テンプレートで設定してください。',
                formatWarning: 'テンプレート形式は選択したフォルダノートの種類と一致している必要があります: .md、.canvas、.base。'
            },
            enableFolderNoteLinks: {
                name: 'フォルダ名でフォルダノートを開く',
                desc: 'フォルダ名をクリックすると、そのフォルダノートを開きます。オフの場合、フォルダノートは名前、アイコン、色などのフォルダメタデータのみを提供します。'
            },
            hideFolderNoteInList: {
                name: 'リストでフォルダノートを非表示',
                desc: 'ファイルリストからフォルダーノートを非表示にする。'
            },
            pinCreatedFolderNote: {
                name: '作成したフォルダノートをピン留め',
                desc: 'コンテキストメニューから作成時にフォルダーノートをピン留めする。'
            },
            folderNoteOpenLocation: {
                name: 'フォルダノートを開く場所',
                desc: 'フォルダノートリンクをクリックしたときにフォルダノートを開く場所を選択します。',
                options: {
                    currentTab: '現在のタブ',
                    newTab: '新しいタブ',
                    rightSidebar: '右サイドバー'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: '右サイドバー: 最も近いフォルダノートを表示',
                desc: 'フォルダを選択すると、右サイドバーに最も近い上位フォルダノートが自動的に表示されます。'
            },
            confirmBeforeDelete: {
                name: '削除前に確認',
                desc: 'ノートやフォルダを削除する際に確認ダイアログを表示'
            },
            deleteAttachments: {
                name: 'ファイル削除時に添付ファイルを削除',
                desc: 'リンクされた添付ファイルと生成された描画プレビューが他で使用されていない場合、自動的に削除する',
                options: {
                    ask: '毎回確認',
                    always: '常に',
                    never: 'しない'
                }
            },
            moveFileConflicts: {
                name: '移動の競合',
                desc: '同名のファイルが既に存在するフォルダーにファイルを移動する場合。毎回確認（名前変更、上書き、キャンセル）するか、常に名前を変更します。',
                options: {
                    ask: '毎回確認',
                    rename: '常に名前を変更'
                }
            },
            metadataCleanup: {
                name: 'メタデータをクリーンアップ',
                desc: 'Obsidian外でファイル、フォルダ、タグ、またはプロパティが削除、移動、または名前変更された際に残された孤立したメタデータを削除します。これはNotebook Navigatorの設定ファイルのみに影響します。',
                buttonText: 'メタデータをクリーンアップ',
                error: '設定のクリーンアップに失敗しました',
                loading: 'メタデータを確認中...',
                statusClean: 'クリーンアップするメタデータはありません',
                statusCounts:
                    '孤立した項目: {folders} フォルダ, {tags} タグ, {properties} プロパティ, {files} ファイル, {pinned} ピン, {separators} セパレーター'
            },
            rebuildCache: {
                name: 'キャッシュを再構築',
                desc: 'タグの欠落、不正確なプレビュー、画像の欠落がある場合に使用してください。同期の競合や予期しない終了後に発生することがあります。',
                buttonText: 'キャッシュを再構築',
                error: 'キャッシュの再構築に失敗しました',
                indexingTitle: 'ボールトをインデックス中...',
                progress: 'Notebook Navigator のキャッシュを更新しています.'
            },
            externalIcons: {
                downloadButton: 'ダウンロード',
                downloadingLabel: 'ダウンロード中...',
                removeButton: '削除',
                statusInstalled: 'ダウンロード済み (バージョン {version})',
                statusNotInstalled: '未ダウンロード',
                versionUnknown: '不明',
                downloadFailed: '{name}のダウンロードに失敗しました。接続を確認してもう一度お試しください。',
                removeFailed: '{name}の削除に失敗しました。',
                infoNote:
                    'ダウンロードしたアイコンパックはデバイス間でインストール状態を同期します。アイコンパックは各デバイスのローカルデータベースに保存されます。同期はダウンロードまたは削除の必要性のみを追跡します。アイコンパックはNotebook Navigatorリポジトリからダウンロードされます (https://github.com/johansan/notebook-navigator/tree/main/icon-assets)。'
            },
            useFrontmatterDates: {
                name: 'フロントマターメタデータを使用',
                desc: 'ノート名、タイムスタンプ、アイコン、色にフロントマターを使用'
            },
            frontmatterNameField: {
                name: '名前フィールド（複数可）',
                desc: 'フロントマターフィールドのカンマ区切りリスト。最初の空でない値を使用。ファイル名にフォールバック。',
                placeholder: 'title, name'
            },
            frontmatterIconField: {
                name: 'アイコンフィールド',
                desc: 'ファイルアイコン用のフロントマターフィールド。空のままにすると設定に保存されたアイコンを使用。',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'カラーフィールド',
                desc: 'ファイルカラー用のフロントマターフィールド。空のままにすると設定に保存された色を使用。',
                placeholder: 'color'
            },
            frontmatterBackgroundField: {
                name: '背景フィールド',
                desc: '背景色用のフロントマターフィールド。空のままにすると設定に保存された背景色を使用。',
                placeholder: 'background'
            },
            frontmatterMigration: {
                name: '設定からアイコンと色を移行',
                desc: '設定に保存: アイコン {icons} 個、色 {colors} 個。',
                button: '移行',
                buttonWorking: '移行中...',
                noticeNone: '設定に保存されたファイルアイコンまたは色がありません。',
                noticeDone: 'アイコン {migratedIcons}/{icons}、色 {migratedColors}/{colors} を移行しました。',
                noticeFailures: '失敗したエントリ: {failures}。',
                noticeError: '移行に失敗しました。詳細はコンソールを確認してください。'
            },
            frontmatterCreatedField: {
                name: '作成タイムスタンプフィールド',
                desc: '作成タイムスタンプのフロントマターフィールド名。空のままにするとファイルシステムの日付のみを使用。',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: '変更タイムスタンプフィールド',
                desc: '変更タイムスタンプのフロントマターフィールド名。空のままにするとファイルシステムの日付のみを使用。',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'タイムスタンプ形式',
                desc: 'フロントマター内のタイムスタンプを解析するために使用される形式。空のままにするとISO 8601解析を使用。',
                helpTooltip: 'Moment形式',
                momentLinkText: 'Moment フォーマット',
                help: '一般的な形式:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: '開発をサポート',
                desc: 'ノートブックナビゲーターを愛用していただいている場合は、継続的な開発をサポートすることをご検討ください。',
                buttonText: '❤️ スポンサーになる',
                coffeeButton: '☕️ コーヒーをおごる'
            },
            updateCheckOnStart: {
                name: '起動時に新しいバージョンを確認',
                desc: '起動時に新しいプラグインリリースを確認し、アップデートが利用可能な場合に通知を表示します。確認は最大1日1回行われます。',
                status: '新しいバージョンが利用可能: {version}'
            },
            debugLogging: {
                name: '起動デバッグログ',
                desc: '起動診断を保管庫のルートにタイムスタンプ付きの Markdown ファイルとして書き込み、起動が落ち着いた後に停止します。このファイルは同期される場合があり、ファイルパスを含むことがあります。'
            },
            whatsNew: {
                name: 'Notebook Navigator {version} の新着情報',
                desc: '最近の更新と改善を確認',
                buttonText: '最近の更新を表示'
            },
            masteringVideo: {
                name: 'Notebook Navigator をマスターする（動画）',
                desc: 'この動画では、Notebook Navigator で生産性を高めるために必要なすべてを解説しています。ホットキー、検索、タグ、高度なカスタマイズなどが含まれます。'
            },
            cacheStatistics: {
                localCache: 'ローカルキャッシュ',
                items: '項目',
                withTags: 'タグ付き',
                withPreviewText: 'プレビューテキスト付き',
                withFeatureImage: 'フィーチャー画像付き',
                withMetadata: 'メタデータ付き'
            },
            metadataInfo: {
                successfullyParsed: '正常に解析済み',
                itemsWithName: '名前付き項目',
                withCreatedDate: '作成日付き',
                withModifiedDate: '変更日付き',
                withIcon: 'アイコン付き',
                withColor: 'カラー付き',
                failedToParse: '解析に失敗',
                createdDates: '作成日',
                modifiedDates: '変更日',
                checkTimestampFormat: 'タイムスタンプ形式を確認してください。',
                exportFailed: 'エラーをエクスポート'
            }
        }
    },
    whatsNew: {
        title: 'Notebook Navigatorの新機能',
        openBannerImage: 'リリースバナー画像を開く',
        supportMessage: 'Notebook Navigatorが役立つと思われる場合は、開発のサポートをご検討ください。',
        supportButton: 'コーヒーをおごる',
        thanksButton: 'ありがとう！'
    }
};
