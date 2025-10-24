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
 * English language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_JA = {
    // Common UI elements
    common: {
        cancel: 'キャンセル', // Button text for canceling dialogs and operations (English: Cancel)
        delete: '削除', // Button text for delete operations in dialogs (English: Delete)
        remove: '削除', // Button text for remove operations in dialogs (English: Remove)
        submit: '送信', // Button text for submitting forms and dialogs (English: Submit)
        noSelection: '選択なし', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: 'タグなし', // Label for notes without any tags (English: Untagged)
        untitled: '無題', // Default name for notes without a title (English: Untitled)
        featureImageAlt: 'アイキャッチ画像', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: '不明なエラー', // Generic fallback when an error has no message (English: Unknown error)
        updateBannerTitle: 'Notebook Navigator の更新があります',
        updateBannerInstruction: '設定 -> コミュニティプラグイン で更新',
        updateIndicatorLabel: '新しいバージョンがあります'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'フォルダまたはタグを選択してノートを表示', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: 'ノートなし', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: '📌 ピン留め', // Header for the pinned notes section at the top of file list (English: 📌 Pinned)
        notesSection: 'ノート', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: 'ファイル' // Header shown between pinned and regular items when showing supported or all files (English: Files)
    },

    // Tag list
    tagList: {
        untaggedLabel: 'タグなし', // Label for the special item showing notes without tags (English: Untagged)
        hiddenTags: '非表示タグ', // Label for the hidden tags virtual folder (English: Hidden tags)
        tags: 'タグ' // Label for the tags virtual folder (English: Tags)
    },

    navigationPane: {
        shortcutsHeader: 'ショートカット',
        recentNotesHeader: '最近のノート',
        recentFilesHeader: '最近のファイル',
        reorderRootFoldersTitle: 'ナビゲーションセクションを並び替え',
        reorderRootFoldersHint: '見出しまたは項目をドラッグして順序を変更します',
        vaultRootLabel: 'ボールト',
        resetRootToAlpha: 'アルファベット順にリセット',
        resetRootToFrequency: '頻度順にリセット',
        dragHandleLabel: 'ドラッグして並び替え',
        pinShortcuts: 'ショートカットを固定',
        unpinShortcuts: 'ショートカットの固定を解除'
    },

    shortcuts: {
        folderExists: 'フォルダは既にショートカットにあります',
        noteExists: 'ノートは既にショートカットにあります',
        tagExists: 'タグは既にショートカットにあります',
        searchExists: '検索ショートカットは既に存在します',
        emptySearchQuery: '保存前に検索クエリを入力してください',
        emptySearchName: '検索を保存する前に名前を入力してください',
        add: 'ショートカットに追加',
        remove: 'ショートカットから削除',
        moveUp: '上に移動',
        moveDown: '下に移動',
        folderNotesPinned: 'フォルダノート {count} 件をピン留めしました'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'アイテムを折りたたむ', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: 'すべてのアイテムを展開', // Tooltip for button that expands all items (English: Expand all items)
        scrollToTop: 'トップにスクロール',
        newFolder: '新規フォルダ', // Tooltip for create new folder button (English: New folder)
        newNote: '新規ノート', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: 'ナビゲーションに戻る', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeSortOrder: '並び順を変更', // Tooltip for the sort order toggle button (English: Change sort order)
        defaultSort: 'デフォルト', // Label for default sorting mode (English: Default)
        customSort: 'カスタム', // Label for custom sorting mode (English: Custom)
        showFolders: 'ナビゲーションを表示', // Tooltip for button to show the navigation pane (English: Show navigation)
        hideFolders: 'ナビゲーションを非表示', // Tooltip for button to hide the navigation pane (English: Hide navigation)
        reorderRootFolders: 'ルートフォルダとタグを並び替え',
        finishRootFolderReorder: '並び替えを終了',
        toggleDescendantNotes: 'サブフォルダ / 子孫のノートを表示', // Tooltip for button to toggle showing notes from descendants (English: Show notes from subfolders / descendants)
        autoExpandFoldersTags: 'フォルダとタグを自動展開', // Tooltip for button to toggle auto-expanding folders and tags when selected (English: Auto-expand folders and tags)
        showExcludedItems: '非表示項目を表示', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: '非表示項目を隠す', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: 'デュアルペインを表示', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: 'シングルペインを表示', // Tooltip for button to show single-pane layout (English: Show single pane)
        changeAppearance: '外観を変更', // Tooltip for button to change folder appearance settings (English: Change appearance)
        search: '検索' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: '検索...', // Placeholder text for search input (English: Search...)
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: '検索をクリア', // Tooltip for clear search button (English: Clear search)
        saveSearchShortcut: '検索をショートカットに保存',
        removeSearchShortcut: 'ショートカットから検索を削除',
        shortcutModalTitle: '検索ショートカットを保存',
        shortcutNameLabel: 'ショートカット名',
        shortcutNamePlaceholder: 'ショートカット名を入力'
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
            copyDeepLink: 'Obsidian URL をコピー',
            copyPath: 'パスをコピー',
            copyRelativePath: '相対パスをコピー',
            renameNote: 'ノートの名前を変更',
            deleteNote: 'ノートを削除',
            deleteMultipleNotes: '{count}個のノートを削除',
            moveToFolder: '移動先...',
            moveMultipleToFolder: '{count}個のファイルを移動先...',
            addTag: 'タグを追加',
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
            deleteMultipleFiles: '{count}個のファイルを削除'
        },
        folder: {
            newNote: '新規ノート',
            newFolder: '新規フォルダ',
            newCanvas: '新規キャンバス',
            newBase: '新規データベース',
            newDrawing: '新規図面',
            duplicateFolder: 'フォルダを複製',
            searchInFolder: 'フォルダ内を検索',
            createFolderNote: 'フォルダノートを作成',
            deleteFolderNote: 'フォルダーノートを削除',
            changeIcon: 'アイコンを変更',
            changeColor: '色を変更',
            changeBackground: '背景色を変更',
            excludeFolder: 'フォルダを非表示',
            moveFolder: '移動先...',
            renameFolder: 'フォルダの名前を変更',
            deleteFolder: 'フォルダを削除'
        },
        tag: {
            changeIcon: 'アイコンを変更',
            changeColor: '色を変更',
            changeBackground: '背景色を変更',
            showTag: 'タグを表示',
            hideTag: 'タグを非表示'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        defaultPreset: 'デフォルトの外観',
        slimPreset: 'スリム（日付/プレビュー/画像なし）',
        titleRows: 'タイトル行数',
        previewRows: 'プレビュー行数',
        defaultOption: (rows: number) => `デフォルト (${rows})`,
        defaultTitleOption: (rows: number) => `デフォルトタイトル行数 (${rows})`,
        defaultPreviewOption: (rows: number) => `デフォルトプレビュー行数 (${rows})`,
        titleRowOption: (rows: number) => `タイトル${rows}行`,
        previewRowOption: (rows: number) => `プレビュー${rows}行`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'アイコンを検索...',
            recentlyUsedHeader: '最近使用したアイコン',
            emptyStateSearch: '入力してアイコンを検索',
            emptyStateNoResults: 'アイコンが見つかりません',
            showingResultsInfo: '{count}件中50件を表示中。絞り込むには続けて入力してください。',
            emojiInstructions: '絵文字を入力または貼り付けてアイコンとして使用',
            removeIcon: 'アイコンを削除'
        },
        colorPicker: {
            currentColor: '現在',
            newColor: '新規',
            presetColors: 'プリセット色',
            recentColors: '最近使用した色',
            clearRecentColors: '最近使用した色をクリア',
            removeRecentColor: '色を削除',
            removeColor: '色を削除',
            apply: '適用',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: '赤',
                orange: 'オレンジ',
                amber: '琥珀',
                yellow: '黄',
                lime: 'ライム',
                green: '緑',
                emerald: 'エメラルド',
                teal: 'ティール',
                cyan: 'シアン',
                sky: 'スカイ',
                blue: '青',
                indigo: '藍',
                violet: 'バイオレット',
                purple: '紫',
                fuchsia: 'フクシア',
                pink: 'ピンク',
                rose: 'ローズ',
                gray: 'グレー',
                slate: 'スレート',
                stone: 'ストーン'
            }
        },
        tagOperation: {
            renameTitle: 'タグの名前を変更',
            deleteTitle: 'タグを削除',
            newTagPrompt: '新しいタグ名を入力：',
            newTagPlaceholder: '新しい名前',
            renameWarning: 'これにより、影響を受けるすべてのノートでタグが名前変更されます。',
            deleteWarning: 'これにより、影響を受けるすべてのノートからタグが削除されます。',
            modificationWarning: 'タグの変更',
            affectedFiles: '{count}個のファイルが影響を受けます',
            andMore: 'さらに{count}個...',
            confirmRename: 'タグを名前変更',
            confirmDelete: 'タグを削除',
            file: 'ファイル',
            files: 'ファイル'
        },
        fileSystem: {
            newFolderTitle: '新規フォルダ',
            renameFolderTitle: 'フォルダの名前を変更',
            renameFileTitle: 'ファイルの名前を変更',
            deleteFolderTitle: "'{name}'を削除しますか？",
            deleteFileTitle: "'{name}'を削除しますか？",
            folderNamePrompt: 'フォルダ名を入力：',
            renamePrompt: '新しい名前を入力：',
            renameVaultTitle: 'ボールトの表示名を変更',
            renameVaultPrompt: 'カスタム表示名を入力（空にするとデフォルトを使用）：',
            deleteFolderConfirm: 'このフォルダとそのすべての内容を削除してもよろしいですか？',
            deleteFileConfirm: 'このファイルを削除してもよろしいですか？',
            removeAllTagsTitle: 'すべてのタグを削除',
            removeAllTagsFromNote: 'このノートからすべてのタグを削除してもよろしいですか？',
            removeAllTagsFromNotes: '{count}個のノートからすべてのタグを削除してもよろしいですか？'
        },
        folderSuggest: {
            placeholder: 'フォルダに移動...',
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
        navigationBanner: {
            placeholder: '画像を検索...',
            instructions: {
                navigate: 'でナビゲート',
                select: 'でバナーを設定',
                dismiss: 'でキャンセル'
            }
        },
        tagSuggest: {
            placeholder: 'タグを検索...',
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
        folderNoteType: {
            title: 'フォルダノートの種類を選択',
            markdown: 'Markdown',
            canvas: 'Canvas',
            base: 'Base'
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
            duplicateNote: 'ノートの複製に失敗しました：{error}',
            createCanvas: 'キャンバスの作成に失敗しました：{error}',
            createDatabase: 'データベースの作成に失敗しました：{error}',
            duplicateFolder: 'フォルダの複製に失敗しました：{error}',
            openVersionHistory: 'バージョン履歴を開くのに失敗しました：{error}',
            versionHistoryNotFound: 'バージョン履歴コマンドが見つかりません。Obsidian Syncが有効になっていることを確認してください。',
            revealInExplorer: 'システムエクスプローラーでファイルを表示できませんでした：{error}',
            folderNoteAlreadyExists: 'フォルダノートはすでに存在します',
            folderAlreadyExists: 'フォルダ「{name}」は既に存在します',
            folderNotesDisabled: 'ファイルを変換するには設定でフォルダノートを有効にしてください',
            folderNoteAlreadyLinked: 'このファイルは既にフォルダノートとして機能しています',
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
        notices: {
            excludedFolder: 'フォルダを除外: {name}'
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
            tagOperationsNotAvailable: 'タグ操作は利用できません',
            tagsRequireMarkdown: 'タグはMarkdownノートでのみサポートされています',
            iconPackDownloaded: '「{provider}」をダウンロードしました',
            iconPackUpdated: '「{provider}」を更新しました ({version})',
            iconPackRemoved: '「{provider}」を削除しました',
            iconPackLoadFailed: '「{provider}」を読み込めませんでした'
        },
        confirmations: {
            deleteMultipleFiles: '本当に{count}個のファイルを削除しますか？',
            deleteConfirmation: 'この操作は元に戻せません。'
        },
        defaultNames: {
            untitled: '無題',
            untitledNumber: '無題 {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'フォルダを自分自身またはそのサブフォルダに移動することはできません。',
            itemAlreadyExists: 'この場所に "{name}" という名前のアイテムがすでに存在します。',
            failedToMove: '移動に失敗しました：{error}',
            failedToAddTag: 'タグ "{tag}" の追加に失敗しました',
            failedToClearTags: 'タグのクリアに失敗しました',
            failedToMoveFolder: 'フォルダ「{name}」の移動に失敗しました',
            failedToImportFiles: 'Failed to import: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count}個のファイルが移動先に既に存在します',
            addedTag: '{count}個のファイルにタグ "{tag}" を追加しました',
            filesAlreadyHaveTag: '{count}個のファイルには既にこのタグまたはより具体的なタグがあります',
            clearedTags: '{count}個のファイルからすべてのタグをクリアしました',
            noTagsToClear: 'クリアするタグがありません',
            fileImported: 'Imported 1 file',
            filesImported: 'Imported {count} files'
        }
    },

    // Date grouping
    dateGroups: {
        today: '今日',
        yesterday: '昨日',
        previous7Days: '過去7日間',
        previous30Days: '過去30日間'
    },

    // Weekdays
    weekdays: {
        sunday: '日曜日',
        monday: '月曜日',
        tuesday: '火曜日',
        wednesday: '水曜日',
        thursday: '木曜日',
        friday: '金曜日',
        saturday: '土曜日'
    },

    // Plugin commands
    commands: {
        open: '開く', // Command palette: Opens the Notebook Navigator view (English: Open)
        openHomepage: 'ホームページを開く', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        revealFile: 'ファイルを表示', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: '検索', // Command palette: Toggle search in the file list (English: Search)
        toggleDualPane: 'デュアルペインレイアウトを切り替え', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        deleteFile: 'ファイルを削除', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: '新規ノートを作成', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        moveFiles: 'ファイルを移動', // Command palette: Move selected files to another folder (English: Move files)
        convertToFolderNote: 'フォルダノートに変換', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        pinAllFolderNotes: 'フォルダノートをすべてピン留め', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: 'フォルダにナビゲート', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: 'タグにナビゲート', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        addShortcut: 'ショートカットに追加', // Command palette: Adds the current file, folder, or tag to shortcuts (English: Add to shortcuts)
        toggleDescendants: '子孫切り替え', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: '非表示項目を切り替え', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        collapseExpand: 'すべての項目を折りたたむ/展開', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        addTag: '選択したファイルにタグを追加', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        removeTag: '選択したファイルからタグを削除', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: '選択したファイルからすべてのタグを削除', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        rebuildCache: 'キャッシュを再構築' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: 'ノートブックナビゲーター', // Name shown in the view header/tab (English: Notebook Navigator)
        ribbonTooltip: 'ノートブックナビゲーター', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'ノートブックナビゲーターで表示' // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: '最終更新',
        createdAt: '作成日時',
        file: 'ファイル',
        files: 'ファイル',
        folder: 'フォルダ',
        folders: 'フォルダ'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: '失敗したメタデータレポートをエクスポートしました: {filename}',
            exportFailed: 'メタデータレポートのエクスポートに失敗しました'
        },
        sections: {
            general: '一般設定',
            notes: 'ノート表示',
            navigationPane: 'フォルダ表示',
            icons: 'アイコンパック',
            tags: 'タグ表示',
            folders: 'フォルダノート',
            search: '検索',
            listPane: 'リストペイン',
            hotkeys: 'ホットキー',
            advanced: '詳細設定'
        },
        groups: {
            general: {
                view: '外観',
                behavior: '動作',
                filtering: 'フィルター',
                formatting: '書式'
            },
            navigation: {
                behavior: '動作',
                appearance: '外観'
            },
            list: {
                display: '外観',
                quickActions: 'クイック操作'
            },
            notes: {
                frontmatter: 'フロントマター',
                display: '外観'
            }
        },
        items: {
            searchProvider: {
                name: '検索プロバイダー',
                desc: 'クイックファイル名検索またはOmnisearchプラグインによる全文検索を選択してください。',
                options: {
                    internal: 'フィルター検索',
                    omnisearch: 'Omnisearch（全文）'
                },
                info: {
                    filterSearch: {
                        title: 'フィルター検索（デフォルト）：',
                        description:
                            '現在のフォルダとサブフォルダ内のファイルを名前とタグでフィルタリングする高速で軽量な検索。#プレフィックスによるタグフィルタリング（例：#プロジェクト）、!プレフィックスによる除外（例：!下書き、!#アーカイブ済み）、!#によるタグなしノートの検索をサポート。現在のコンテキスト内でのクイックナビゲーションに最適。'
                    },
                    omnisearch: {
                        title: 'Omnisearch：',
                        description:
                            'ボールト全体を検索し、現在のフォルダ、サブフォルダ、または選択したタグからのファイルのみを表示するように結果をフィルタリングする全文検索。Omnisearchプラグインのインストールが必要 - 利用できない場合、検索は自動的にフィルター検索にフォールバックします。',
                        warningNotInstalled: 'Omnisearchプラグインがインストールされていません。フィルター検索を使用します。',
                        limitations: {
                            title: '既知の制限事項：',
                            performance: 'パフォーマンス：大きなボールトで3文字未満を検索する場合、特に遅くなることがあります',
                            pathBug:
                                'パスのバグ：非ASCII文字を含むパスで検索できず、サブパスを正しく検索しません。検索結果に表示されるファイルに影響します',
                            limitedResults:
                                '制限された結果：Omnisearchはボールト全体を検索し、フィルタリング前に限られた数の結果を返すため、ボールトの他の場所に多くの一致が存在する場合、現在のフォルダからの関連ファイルが表示されない可能性があります',
                            previewText:
                                'プレビューテキスト：ノートのプレビューはOmnisearchの結果の抜粋に置き換えられ、検索一致のハイライトがファイルの他の場所に表示される場合、実際のハイライトが表示されない可能性があります'
                        }
                    }
                }
            },
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
                name: 'ノートの並び順',
                desc: 'ノートリストでのノートの並び順を選択します。',
                options: {
                    'modified-desc': '編集日時（新しいものが上）',
                    'modified-asc': '編集日時（古いものが上）',
                    'created-desc': '作成日時（新しいものが上）',
                    'created-asc': '作成日時（古いものが上）',
                    'title-asc': 'タイトル（昇順）',
                    'title-desc': 'タイトル（降順）'
                }
            },
            includeDescendantNotes: {
                name: 'サブフォルダ / 子孫のノートを表示',
                desc: 'フォルダまたはタグを表示するとき、入れ子のサブフォルダとタグの子孫にあるノートを含めます。'
            },
            separateNoteCounts: {
                name: '現在と子孫のカウントを個別に表示',
                desc: 'フォルダとタグのノート数を「現在 ▾ 子孫」形式で表示します。'
            },
            groupNotes: {
                name: 'ノートをグループ化',
                desc: '日付またはフォルダでグループ化されたノート間に見出しを表示します。フォルダでのグループ化が有効な場合、タグビューは日付グループを使用します。',
                options: {
                    none: 'グループ化しない',
                    date: '日付でグループ化',
                    folder: 'フォルダでグループ化'
                }
            },
            optimizeNoteHeight: {
                name: 'ノートの高さを最適化',
                desc: 'ピン留めされたノートとプレビューテキストのないノートの高さを削減。'
            },
            showParentFolderNames: {
                name: '親フォルダ名を表示',
                desc: 'サブフォルダまたはタグ内のノートに親フォルダ名を表示します。'
            },
            showQuickActions: {
                name: 'クイックアクションを表示 (デスクトップのみ)',
                desc: 'ファイルアイテムにホバーアクションを表示します。'
            },
            quickActionsRevealInFolder: {
                name: 'フォルダで表示',
                desc: 'クイックアクション：ノートを親フォルダで表示。サブフォルダまたはタグ内でノートを表示している場合のみ表示されます（ノートの実際のフォルダでは表示されません）。'
            },
            quickActionsPinNote: {
                name: 'ノートをピン留め',
                desc: 'クイックアクション：ノートをリストの上部にピン留めまたは解除。'
            },
            quickActionsOpenInNewTab: {
                name: '新しいタブで開く',
                desc: 'クイックアクション：ノートを新しいタブで開く。'
            },
            dualPane: {
                name: 'デュアルペインレイアウト（デスクトップのみ、同期されません）',
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
            dualPaneBackground: {
                name: '背景色（デスクトップのみ）',
                desc: 'デスクトップでナビゲーションペインとリストペインの背景色を選択します。',
                options: {
                    separate: '背景を分ける',
                    primary: 'リストの背景を使用',
                    secondary: 'ナビゲーションの背景を使用'
                }
            },
            startView: {
                name: 'デフォルト起動ビュー',
                desc: 'Notebook Navigator を開いたときに表示するペインを選択します。ナビゲーションペインはショートカット、最近のノート、フォルダ構造を表示します。リストペインはノート一覧を表示します。',
                options: {
                    navigation: 'ナビゲーションペイン',
                    files: 'リストペイン'
                }
            },
            autoRevealActiveNote: {
                name: 'アクティブなノートを自動表示',
                desc: 'クイックスイッチャー、リンク、検索から開いたときに自動的にノートを表示します。'
            },
            autoRevealIgnoreRightSidebar: {
                name: '右サイドバーのイベントを無視',
                desc: '右サイドバーでのクリックやノートの変更時にアクティブノートを変更しません。'
            },
            autoSelectFirstFileOnFocusChange: {
                name: '最初のノートを自動選択（デスクトップのみ）',
                desc: 'フォルダまたはタグを切り替えた際に自動的に最初のノートを開きます。'
            },
            autoExpandFoldersTags: {
                name: 'フォルダとタグを自動展開',
                desc: 'フォルダやタグを選択した際に自動的に展開します。'
            },
            navigationBanner: {
                name: 'ナビゲーションバナー',
                desc: 'ナビゲーションペイン上部に画像を表示します。',
                current: '現在のバナー: {path}',
                chooseButton: '画像を選択',
                clearButton: 'クリア'
            },
            showShortcuts: {
                name: 'ショートカットを表示',
                desc: 'ナビゲーションペインにショートカットセクションを表示します。'
            },
            showRecentNotes: {
                name: '最近のノートを表示',
                desc: 'ナビゲーションペインに最近のノートセクションを表示します。'
            },
            recentNotesCount: {
                name: '最近のノート数',
                desc: '表示する最近のノートの数。'
            },
            showTooltips: {
                name: 'ツールチップを表示（デスクトップのみ）',
                desc: 'ノートとフォルダの追加情報をホバー時にツールチップで表示します。'
            },
            showTooltipPath: {
                name: 'パスを表示',
                desc: 'ツールチップでノート名の下にフォルダパスを表示します。'
            },
            multiSelectModifier: {
                name: '複数選択モディファイア',
                desc: '複数選択を切り替えるモディファイアキーを選択します。Option/Altが選択されている場合、Cmd/Ctrlクリックでノートを新しいタブで開きます。',
                options: {
                    cmdCtrl: 'Cmd/Ctrl クリック',
                    optionAlt: 'Option/Alt クリック'
                }
            },
            excludedNotes: {
                name: 'ノートを非表示',
                desc: 'カンマ区切りのフロントマター属性のリスト。これらの属性を含むノートは非表示になります（例：draft, private, archived）。',
                placeholder: 'draft, private'
            },
            excludedFolders: {
                name: 'フォルダを非表示',
                desc: '非表示にするフォルダのカンマ区切りリスト。名前パターン: assets*（assetsで始まるフォルダ）、*_temp（_tempで終わる）。パスパターン: /archive（ルートのアーカイブのみ）、/res*（resで始まるルートフォルダ）、/*/temp（1階層下のtempフォルダ）、/projects/*（projects内のすべてのフォルダ）。',
                placeholder: 'templates, assets*, /archive, /res*',
                info: '自動クリーンアップ：右クリックで除外する際、重複するパターンが削除されます（例：/projectsを除外し、/projects/appが既にリストにある場合、削除されます）。'
            },
            fileVisibility: {
                name: 'ファイルタイプを表示',
                desc: 'ナビゲーターに表示されるファイルタイプをフィルタリングします。Obsidianでサポートされていないファイルタイプは、外部アプリケーションで開かれる場合があります。',
                options: {
                    documents: 'ドキュメント (.md, .canvas, .base)',
                    supported: 'サポート (Obsidianで開く)',
                    all: 'すべて (外部で開く場合あり)'
                }
            },
            homepage: {
                name: 'ホームページ',
                desc: '自動で開く、ダッシュボードなどのファイルを選びます。',
                current: '現在: {path}',
                currentMobile: 'モバイル: {path}',
                chooseButton: 'ファイルを選択',
                clearButton: 'クリア',
                separateMobile: {
                    name: '個別のモバイルホームページ',
                    desc: 'モバイルデバイス用に別のホームページを使用します。'
                }
            },
            showFileDate: {
                name: '日付を表示',
                desc: 'ノート名の下に日付を表示します。'
            },
            showFileTags: {
                name: 'ファイルタグを表示',
                desc: 'ファイルアイテムにクリック可能なタグを表示します。タグの色を使用して、異なるタグタイプを視覚的に区別できます。'
            },
            showFileTagAncestors: {
                name: '親タグを表示',
                desc: 'タグ名の前に親セグメントを表示します。'
            },
            colorFileTags: {
                name: 'ファイルタグに色を付ける',
                desc: 'ファイルアイテムのタグバッジにタグの色を適用します。'
            },
            showFileTagsInSlimMode: {
                name: 'スリムモードでファイルタグを表示',
                desc: '日付、プレビュー、画像が非表示のときにタグを表示します。'
            },
            dateFormat: {
                name: '日付形式',
                desc: '日付表示の形式（date-fns形式を使用）。',
                placeholder: 'yyyy年M月d日',
                help: '一般的な形式：\nyyyy年M月d日 = 2022年5月25日\nyyyy-MM-dd = 2022-05-25\nMM/dd/yyyy = 05/25/2022\n\nトークン：\nyyyy/yy = 年\nMMMM/MMM/MM/M = 月\ndd/d = 日\nEEEE/EEE = 曜日',
                helpTooltip: 'クリックして形式リファレンスを表示'
            },
            timeFormat: {
                name: '時刻形式',
                desc: '時刻を表示する形式（date-fns形式を使用）。',
                placeholder: 'HH:mm',
                help: '一般的な形式：\nHH:mm = 14:30（24時間制）\nh:mm a = 2:30 PM（12時間制）\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nトークン：\nHH/H = 24時間制\nhh/h = 12時間制\nmm = 分\nss = 秒\na = AM/PM',
                helpTooltip: 'クリックして形式リファレンスを表示'
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
            previewProperties: {
                name: 'プレビュープロパティ',
                desc: 'プレビューテキストを検索するフロントマタープロパティのカンマ区切りリスト。テキストがある最初のプロパティが使用されます。',
                placeholder: '要約, 説明, 概要',
                info: '指定されたプロパティにプレビューテキストが見つからない場合、プレビューはノートの内容から生成されます。'
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
                    '2': '2行'
                }
            },
            showFeatureImage: {
                name: 'アイキャッチ画像を表示',
                desc: 'フロントマターからサムネイル画像を表示します。ヒント：「Featured Image」プラグインを使用して、すべてのドキュメントに自動的にアイキャッチ画像を設定できます。'
            },
            forceSquareFeatureImage: {
                name: 'アイキャッチ画像を正方形に固定',
                desc: 'アイキャッチ画像を正方形のサムネイルとして表示します。'
            },
            featureImageProperties: {
                name: '画像プロパティ',
                desc: 'サムネイル画像用のフロントマタープロパティのカンマ区切りリスト。画像を持つ最初のプロパティが使用されます。空でフォールバック設定が有効な場合、最初の埋め込み画像が使用されます。',
                placeholder: 'thumbnail, featureResized, feature'
            },
            useEmbeddedImageFallback: {
                name: '埋め込み画像をフォールバックとして使用',
                desc: 'フロントマタープロパティにサムネイルが見つからない場合、ドキュメント内の最初の埋め込み画像をフォールバックとして使用します（Obsidian 1.9.4以降が必要）。サムネイルが正しく設定されていることを確認するには、これを無効にします。'
            },
            showRootFolder: {
                name: 'ルートフォルダを表示',
                desc: 'ツリーにルートフォルダ名を表示します。'
            },
            inheritFolderColors: {
                name: 'フォルダの色を継承',
                desc: 'サブフォルダが親フォルダから色を継承します。'
            },
            showNoteCount: {
                name: 'ノート数を表示',
                desc: '各フォルダとタグの横にノート数を表示します。'
            },
            showIcons: {
                name: 'アイコンを表示',
                desc: 'フォルダ、タグ、ノートのアイコンを表示します。'
            },
            showIconsColorOnly: {
                name: 'アイコンのみに色を適用',
                desc: '有効にすると、カスタムカラーはアイコンのみに適用されます。無効にすると、アイコンとテキストラベルの両方に色が適用されます。'
            },
            collapseBehavior: {
                name: '項目を折りたたむ',
                desc: '展開/折りたたみボタンが影響する項目を選択します。',
                options: {
                    all: 'すべてのフォルダとタグ',
                    foldersOnly: 'フォルダのみ',
                    tagsOnly: 'タグのみ'
                }
            },
            smartCollapse: {
                name: '選択中の項目を展開したままにする',
                desc: '折りたたむ時、現在選択されているフォルダまたはタグとその親を展開したままにします。'
            },
            navIndent: {
                name: 'ツリーインデント',
                desc: 'ネストされたフォルダとタグのインデント幅を調整します。'
            },
            navItemHeight: {
                name: '行高',
                desc: 'ナビゲーションペイン内のフォルダとタグの高さを調整します。'
            },
            navItemHeightScaleText: {
                name: '行高に合わせて文字サイズを調整',
                desc: '行高を下げたときにナビゲーションの文字サイズを小さくします。'
            },
            showTags: {
                name: 'タグを表示',
                desc: 'ナビゲーターのフォルダの下にタグセクションを表示します。'
            },
            tagSortOrder: {
                name: 'タグの並び順',
                desc: 'ナビゲーションペインでタグを並べ替える方法を設定します。',
                options: {
                    alphaAsc: 'A から Z',
                    alphaDesc: 'Z から A',
                    frequencyAsc: '頻度（低→高）',
                    frequencyDesc: '頻度（高→低）'
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
            hiddenTags: {
                name: '非表示タグ',
                desc: '非表示にするタグの接頭辞または名前ワイルドカードのカンマ区切りリスト。`tag*` や `*tag` でタグ名に一致します。タグを非表示にすると、すべてのサブタグも非表示になります（例："アーカイブ"で"アーカイブ/2024/docs"も非表示）。',
                placeholder: '内部, temp/下書き, アーカイブ/2024'
            },
            enableFolderNotes: {
                name: 'フォルダノートを有効化',
                desc: '有効にすると、関連するノートを持つフォルダがクリック可能なリンクとして表示されます。'
            },
            folderNoteType: {
                name: '既定のフォルダノート形式',
                desc: 'コンテキストメニューで作成されるフォルダノートの形式です。',
                options: {
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base',
                    ask: '作成時に確認'
                }
            },
            folderNoteName: {
                name: 'フォルダノート名',
                desc: 'フォルダノートの名前。空のままにするとフォルダと同じ名前を使用します。',
                placeholder: 'フォルダ名には空のまま'
            },
            folderNoteProperties: {
                name: 'フォルダノートプロパティ',
                desc: '新しく作成されたフォルダノートに追加するフロントマタープロパティ（カンマ区切り）。',
                placeholder: 'foldernote, darktheme'
            },
            hideFolderNoteInList: {
                name: 'リストでフォルダノートを非表示',
                desc: 'フォルダのノートリストにフォルダノートが表示されないようにします。'
            },
            pinCreatedFolderNote: {
                name: '作成したフォルダノートをピン留め',
                desc: 'コンテキストメニューから作成したフォルダノートを自動的にピン留めする。'
            },
            confirmBeforeDelete: {
                name: '削除前に確認',
                desc: 'ノートやフォルダを削除する際に確認ダイアログを表示'
            },
            metadataCleanup: {
                name: 'メタデータをクリーンアップ',
                desc: 'Obsidian外でファイル、フォルダ、タグが削除、移動、または名前変更された際に残された孤立したメタデータを削除します。これはNotebook Navigatorの設定ファイルのみに影響します。',
                buttonText: 'メタデータをクリーンアップ',
                error: '設定のクリーンアップに失敗しました',
                loading: 'メタデータを確認中...',
                statusClean: 'クリーンアップするメタデータはありません',
                statusCounts: '孤立した項目: {folders} フォルダ, {tags} タグ, {files} ファイル, {pinned} ピン'
            },
            rebuildCache: {
                name: 'キャッシュを再構築',
                desc: 'タグの欠落、不正確なプレビュー、画像の欠落がある場合に使用してください。同期の競合や予期しない終了後に発生することがあります。',
                buttonText: 'キャッシュを再構築',
                success: 'キャッシュを再構築しました',
                error: 'キャッシュの再構築に失敗しました'
            },
            hotkeys: {
                intro: 'Notebook Navigator のホットキーは <plugin folder>/notebook-navigator/data.json を編集してカスタマイズします。ファイルをテキストエディタで開き、"keyboardShortcuts" セクションを探してください。各エントリは次の構造です:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Shift',
                    '"Ctrl" = Control（クロスプラットフォームには "Mod" を推奨）'
                ],
                guidance:
                    'ArrowUp と K のような代替キーを追加する場合は、上の例と同じように同一コマンドへ複数のマッピングを登録してください。複数のモディファイアを使う場合は "modifiers": ["Mod", "Shift"] のように並べて記述します。「gg」や「dd」などのキーシーケンスには対応していません。編集後は Obsidian を再読み込みしてください。'
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
                    'ダウンロードしたアイコンパックはデバイス間でインストール状態を同期します。アイコンパックは各デバイスのローカルデータベースに保存されます。同期はダウンロードまたは削除の必要性のみを追跡します。アイコンパックはNotebook Navigatorリポジトリからダウンロードされます (https://github.com/johansan/notebook-navigator/tree/main/icon-assets)。',
                providers: {
                    bootstrapIconsDesc: 'https://icons.getbootstrap.com/',
                    fontAwesomeDesc: 'https://fontawesome.com/',
                    materialIconsDesc: 'https://fonts.google.com/icons',
                    phosphorDesc: 'https://phosphoricons.com/',
                    rpgAwesomeDesc: 'https://nagoshiashumari.github.io/Rpg-Awesome/',
                    simpleIconsDesc: 'https://simpleicons.org/'
                }
            },
            useFrontmatterDates: {
                name: 'フロントマターからメタデータを読み込む',
                desc: '利用可能な場合、フロントマターからノート名、タイムスタンプ、アイコン、色を読み取り、それ以外はファイルシステムの値または設定を使用'
            },
            frontmatterNameField: {
                name: '名前フィールド',
                desc: 'ノートの表示名として使用するフロントマターフィールド。空のままにするとファイル名を使用。',
                placeholder: 'タイトル'
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
            frontmatterSaveMetadata: {
                name: 'フロントマターにアイコンと色を保存',
                desc: '上記で設定したフィールドを使ってファイルのアイコンと色を自動的にフロントマターに書き込みます。'
            },
            frontmatterIconizeFormat: {
                name: 'Iconize形式で保存',
                desc: 'アイコンをプラグイン形式（例: home, fontawesome-solid:user, simple-icons:github）ではなく、Iconize形式（例: LiHome, FasUser, SiGithub）で保存します。'
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
                placeholder: '作成日'
            },
            frontmatterModifiedField: {
                name: '変更タイムスタンプフィールド',
                desc: '変更タイムスタンプのフロントマターフィールド名。空のままにするとファイルシステムの日付のみを使用。',
                placeholder: '更新日'
            },
            frontmatterDateFormat: {
                name: 'タイムスタンプ形式',
                desc: 'フロントマター内のタイムスタンプを解析するために使用される形式。空のままにするとISO 8601形式を使用',
                helpTooltip: 'date-fnsフォーマットのドキュメントを参照',
                help: "一般的な形式:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: '開発をサポート',
                desc: 'ノートブックナビゲーターを愛用していただいている場合は、継続的な開発をサポートすることをご検討ください。',
                buttonText: '❤️ スポンサーになる',
                coffeeButton: '☕️ コーヒーをおごる'
            },
            updateCheckOnStart: {
                name: '起動時に新しいバージョンを確認',
                desc: '起動時に新しいプラグインリリースを確認し、アップデートが利用可能な場合に通知を表示します。各バージョンは一度だけ通知され、確認は最大1日1回行われます。',
                status: 'New version available: {version}'
            },
            whatsNew: {
                name: '新着情報',
                desc: '最近の更新と改善を確認',
                buttonText: '最近の更新を表示'
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
        supportMessage: 'Notebook Navigatorが役立つと思われる場合は、開発のサポートをご検討ください。',
        supportButton: 'コーヒーをおごる',
        thanksButton: 'ありがとう！'
    }
};
