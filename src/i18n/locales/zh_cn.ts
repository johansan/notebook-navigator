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
export const STRINGS_ZH_CN = {
    // Common UI elements
    common: {
        cancel: '取消', // Button text for canceling dialogs and operations (English: Cancel)
        delete: '删除', // Button text for delete operations in dialogs (English: Delete)
        clear: '清除', // Button text for clearing values (English: Clear)
        remove: '移除', // Button text for remove operations in dialogs (English: Remove)
        submit: '提交', // Button text for submitting forms and dialogs (English: Submit)
        noSelection: '未选择', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: '无标签', // Label for notes without any tags (English: Untagged)
        untitled: '未命名', // Default name for notes without a title (English: Untitled)
        featureImageAlt: '特色图片', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: '未知错误', // Generic fallback when an error has no message (English: Unknown error)
        updateBannerTitle: 'Notebook Navigator 有可用更新',
        updateBannerInstruction: '在设置 -> 社区插件中更新',
        updateIndicatorLabel: '有新版本可用'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: '选择文件夹或标签以查看笔记', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: '无笔记', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: '已固定', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: '笔记', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: '文件', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (已隐藏)' // Accessibility label applied to list items that are normally hidden
    },

    // Tag list
    tagList: {
        untaggedLabel: '无标签', // Label for the special item showing notes without tags (English: Untagged)
        hiddenTags: '隐藏标签', // Label for the hidden tags virtual folder (English: Hidden tags)
        tags: '标签' // Label for the tags virtual folder (English: Tags)
    },

    navigationPane: {
        shortcutsHeader: '快捷方式',
        recentNotesHeader: '最近笔记',
        recentFilesHeader: '最近文件',
        reorderRootFoldersTitle: '重新排列导航',
        reorderRootFoldersHint: '使用箭头或拖动来重新排列',
        vaultRootLabel: '仓库',
        resetRootToAlpha: '重置为字母顺序',
        resetRootToFrequency: '重置为频率排序',
        pinShortcuts: '固定快捷方式',
        pinShortcutsAndRecentNotes: '固定快捷方式和最近笔记',
        pinShortcutsAndRecentFiles: '固定快捷方式和最近文件',
        unpinShortcuts: '取消固定快捷方式',
        unpinShortcutsAndRecentNotes: '取消固定快捷方式和最近笔记',
        unpinShortcutsAndRecentFiles: '取消固定快捷方式和最近文件',
        profileMenuLabel: '配置文件',
        profileMenuAria: '更改仓库配置文件'
    },

    shortcuts: {
        folderExists: '文件夹已在快捷方式中',
        noteExists: '笔记已在快捷方式中',
        tagExists: '标签已在快捷方式中',
        searchExists: '搜索快捷方式已存在',
        emptySearchQuery: '保存前请输入搜索查询',
        emptySearchName: '保存搜索前请输入名称',
        add: '添加到快捷方式',
        addNotesCount: '添加 {count} 个笔记到快捷方式',
        addFilesCount: '添加 {count} 个文件到快捷方式',
        rename: '重命名快捷方式',
        remove: '从快捷方式移除',
        removeAll: '移除所有快捷方式',
        removeAllConfirm: '移除所有快捷方式？',
        folderNotesPinned: '已固定 {count} 个文件夹笔记'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: '折叠项目', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: '展开所有项目', // Tooltip for button that expands all items (English: Expand all items)
        scrollToTop: '滚动到顶部',
        newFolder: '新建文件夹', // Tooltip for create new folder button (English: New folder)
        newNote: '新笔记', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: '返回导航', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeSortOrder: '更改排序方式', // Tooltip for the sort order toggle button (English: Change sort order)
        defaultSort: '默认', // Label for default sorting mode (English: Default)
        customSort: '自定义', // Label for custom sorting mode (English: Custom)
        showFolders: '显示导航', // Tooltip for button to show the navigation pane (English: Show navigation)
        hideFolders: '隐藏导航', // Tooltip for button to hide the navigation pane (English: Hide navigation)
        reorderRootFolders: '重新排列导航',
        finishRootFolderReorder: '完成',
        toggleDescendantNotes: '显示子文件夹/后代的笔记', // Tooltip for button to toggle showing notes from descendants (English: Show notes from subfolders / descendants)
        autoExpandFoldersTags: '自动展开文件夹和标签', // Tooltip for button to toggle auto-expanding folders and tags when selected (English: Auto-expand folders and tags)
        showExcludedItems: '显示隐藏的文件夹、标签和笔记', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: '隐藏隐藏的文件夹、标签和笔记', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: '显示双窗格', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: '显示单窗格', // Tooltip for button to show single-pane layout (English: Show single pane)
        changeAppearance: '更改外观', // Tooltip for button to change folder appearance settings (English: Change appearance)
        search: '搜索' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: '搜索...', // Placeholder text for search input (English: Search...)
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: '清除搜索', // Tooltip for clear search button (English: Clear search)
        saveSearchShortcut: '将搜索保存到快捷方式',
        removeSearchShortcut: '从快捷方式移除搜索',
        shortcutModalTitle: '保存搜索快捷方式',
        shortcutNamePlaceholder: '输入快捷方式名称'
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: '在新标签页中打开',
            openToRight: '在右侧打开',
            openInNewWindow: '在新窗口中打开',
            openMultipleInNewTabs: '在新标签页中打开 {count} 个笔记',
            openMultipleToRight: '在右侧打开 {count} 个笔记',
            openMultipleInNewWindows: '在新窗口中打开 {count} 个笔记',
            pinNote: '固定笔记',
            unpinNote: '取消固定笔记',
            pinMultipleNotes: '固定 {count} 个笔记',
            unpinMultipleNotes: '取消固定 {count} 个笔记',
            duplicateNote: '复制笔记',
            duplicateMultipleNotes: '复制 {count} 个笔记',
            openVersionHistory: '打开版本历史',
            revealInFolder: '在文件夹中定位',
            revealInFinder: '在访达中显示',
            showInExplorer: '在资源管理器中显示',
            copyDeepLink: '复制 Obsidian URL',
            copyPath: '复制文件系统路径',
            copyRelativePath: '复制仓库路径',
            renameNote: '重命名笔记',
            deleteNote: '删除笔记',
            deleteMultipleNotes: '删除 {count} 个笔记',
            moveNoteToFolder: '移动笔记到...',
            moveFileToFolder: '移动文件到...',
            moveMultipleNotesToFolder: '将 {count} 个笔记移动到...',
            moveMultipleFilesToFolder: '将 {count} 个文件移动到...',
            addTag: '添加标签',
            removeTag: '移除标签',
            removeAllTags: '移除所有标签',
            changeIcon: '更改图标',
            changeColor: '更改颜色',
            // File-specific context menu items (non-markdown files)
            openMultipleFilesInNewTabs: '在新标签页中打开 {count} 个文件',
            openMultipleFilesToRight: '在右侧打开 {count} 个文件',
            openMultipleFilesInNewWindows: '在新窗口中打开 {count} 个文件',
            pinFile: '固定文件',
            unpinFile: '取消固定文件',
            pinMultipleFiles: '固定 {count} 个文件',
            unpinMultipleFiles: '取消固定 {count} 个文件',
            duplicateFile: '复制文件',
            duplicateMultipleFiles: '复制 {count} 个文件',
            renameFile: '重命名文件',
            deleteFile: '删除文件',
            deleteMultipleFiles: '删除 {count} 个文件'
        },
        folder: {
            newNote: '新笔记',
            newNoteFromTemplate: '从模板新建笔记',
            newFolder: '新建文件夹',
            newCanvas: '新建画布',
            newBase: '新建数据库',
            newDrawing: '新建绘图',
            newExcalidrawDrawing: '新建 Excalidraw 绘图',
            newTldrawDrawing: '新建 Tldraw 绘图',
            duplicateFolder: '复制文件夹',
            searchInFolder: '在文件夹中搜索',
            copyPath: '复制文件系统路径',
            copyRelativePath: '复制仓库路径',
            createFolderNote: '创建文件夹笔记',
            detachFolderNote: '解除文件夹笔记',
            deleteFolderNote: '删除文件夹笔记',
            changeIcon: '更改图标',
            changeColor: '更改颜色',
            changeBackground: '更改背景',
            excludeFolder: '隐藏文件夹',
            unhideFolder: '显示文件夹',
            moveFolder: '移动文件夹到...',
            renameFolder: '重命名文件夹',
            deleteFolder: '删除文件夹'
        },
        tag: {
            changeIcon: '更改图标',
            changeColor: '更改颜色',
            changeBackground: '更改背景',
            showTag: '显示标签',
            hideTag: '隐藏标签'
        },
        navigation: {
            addSeparator: '添加分隔符',
            removeSeparator: '移除分隔符'
        },
        style: {
            title: '样式',
            copy: '复制样式',
            paste: '粘贴样式',
            removeIcon: '移除图标',
            removeColor: '移除颜色',
            removeBackground: '移除背景',
            clear: '清除样式'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        standardPreset: '标准',
        compactPreset: '紧凑',
        defaultSuffix: '(默认)',
        titleRows: '标题行数',
        previewRows: '预览行数',
        groupBy: '分组依据',
        defaultOption: (rows: number) => `默认 (${rows})`,
        defaultTitleOption: (rows: number) => `默认标题行数 (${rows})`,
        defaultPreviewOption: (rows: number) => `默认预览行数 (${rows})`,
        defaultGroupOption: (groupLabel: string) => `默认分组 (${groupLabel})`,
        titleRowOption: (rows: number) => `标题${rows}行`,
        previewRowOption: (rows: number) => `预览${rows}行`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: '搜索图标...',
            recentlyUsedHeader: '最近使用',
            emptyStateSearch: '开始输入以搜索图标',
            emptyStateNoResults: '未找到图标',
            showingResultsInfo: '显示 {count} 个结果中的 50 个。输入更多内容以缩小范围。',
            emojiInstructions: '输入或粘贴任何表情符号作为图标使用',
            removeIcon: '移除图标',
            allTabLabel: '全部'
        },
        fileIconRuleEditor: {
            addRuleAria: '添加规则'
        },
        interfaceIcons: {
            title: '界面图标',
            items: {
                'nav-shortcuts': '快捷方式',
                'nav-recent-files': '最近文件',
                'nav-expand-all': '全部展开',
                'nav-collapse-all': '全部折叠',
                'nav-tree-expand': '树形箭头: 展开',
                'nav-tree-collapse': '树形箭头: 折叠',
                'nav-hidden-items': '隐藏项目',
                'nav-root-reorder': '重新排列根文件夹',
                'nav-new-folder': '新建文件夹',
                'nav-show-single-pane': '显示单窗格',
                'nav-show-dual-pane': '显示双窗格',
                'nav-profile-chevron': '配置菜单箭头',
                'list-search': '搜索',
                'list-descendants': '子文件夹中的笔记',
                'list-sort-ascending': '排序: 升序',
                'list-sort-descending': '排序: 降序',
                'list-appearance': '更改外观',
                'list-new-note': '新建笔记',
                'nav-folder-open': '文件夹打开',
                'nav-folder-closed': '文件夹关闭',
                'nav-tag': '标签',
                'list-pinned': '固定项目'
            }
        },
        colorPicker: {
            currentColor: '当前',
            newColor: '新颜色',
            presetColors: '预设颜色',
            userColors: '自定义颜色',
            paletteDefault: '默认',
            paletteCustom: '自定义',
            copyColors: '复制颜色',
            colorsCopied: '颜色已复制到剪贴板',
            copyClipboardError: '无法写入剪贴板',
            pasteColors: '粘贴颜色',
            pasteClipboardError: '无法读取剪贴板',
            pasteInvalidJson: '剪贴板不包含有效的文本',
            pasteInvalidFormat: '需要十六进制颜色值',
            colorsPasted: '颜色粘贴成功',
            resetUserColors: '清除自定义颜色',
            clearCustomColorsConfirm: '删除所有自定义颜色？',
            userColorSlot: '颜色 {slot}',
            recentColors: '最近使用的颜色',
            clearRecentColors: '清除最近使用的颜色',
            removeRecentColor: '移除颜色',
            removeColor: '移除颜色',
            apply: '应用',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: '红色',
                orange: '橙色',
                amber: '琥珀色',
                yellow: '黄色',
                lime: '青柠色',
                green: '绿色',
                emerald: '翡翠色',
                teal: '青绿色',
                cyan: '青色',
                sky: '天蓝色',
                blue: '蓝色',
                indigo: '靛蓝色',
                violet: '紫罗兰色',
                purple: '紫色',
                fuchsia: '品红色',
                pink: '粉色',
                rose: '玫瑰色',
                gray: '灰色',
                slate: '石板色',
                stone: '石灰色'
            }
        },
        selectVaultProfile: {
            title: '更改仓库配置文件',
            currentBadge: '活动',
            emptyState: '没有可用的仓库配置文件。'
        },
        tagOperation: {
            renameTitle: '重命名标签',
            deleteTitle: '删除标签',
            newTagPrompt: '输入新的标签名称：',
            newTagPlaceholder: '新名称',
            renameWarning: '这将重命名所有受影响笔记中的标签。',
            deleteWarning: '这将从所有受影响笔记中删除标签。',
            modificationWarning: '标签修改',
            affectedFiles: '{count} 个文件受影响',
            andMore: '以及 {count} 个更多...',
            confirmRename: '重命名标签',
            renameUnchanged: '{tag} 未更改',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            invalidTagName: '请输入有效的标签名称。',
            descendantRenameError: '无法将标签移动到自身或其子标签中。',
            confirmDelete: '删除标签',
            file: '个文件',
            files: '个文件'
        },
        fileSystem: {
            newFolderTitle: '新建文件夹',
            renameFolderTitle: '重命名文件夹',
            renameFileTitle: '重命名文件',
            deleteFolderTitle: "删除 '{name}'？",
            deleteFileTitle: "删除 '{name}'？",
            folderNamePrompt: '输入文件夹名称：',
            hideInOtherVaultProfiles: '在其他仓库配置中隐藏',
            renamePrompt: '输入新名称：',
            renameVaultTitle: '更改仓库显示名称',
            renameVaultPrompt: '输入自定义显示名称（留空使用默认值）：',
            deleteFolderConfirm: '您确定要删除此文件夹及其所有内容吗？',
            deleteFileConfirm: '您确定要删除此文件吗？',
            removeAllTagsTitle: '移除所有标签',
            removeAllTagsFromNote: '您确定要从这个笔记中移除所有标签吗？',
            removeAllTagsFromNotes: '您确定要从 {count} 个笔记中移除所有标签吗？'
        },
        folderNoteType: {
            title: '选择文件夹笔记类型',
            folderLabel: '文件夹：{name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `将 ${name} 移动到文件夹...`,
            multipleFilesLabel: (count: number) => `${count} 个文件`,
            navigatePlaceholder: '导航到文件夹...',
            instructions: {
                navigate: '导航',
                move: '移动',
                select: '选择',
                dismiss: '取消'
            }
        },
        homepage: {
            placeholder: '搜索文件...',
            instructions: {
                navigate: '导航',
                select: '设为主页',
                dismiss: '取消'
            }
        },
        navigationBanner: {
            placeholder: '搜索图片...',
            instructions: {
                navigate: '导航',
                select: '设为横幅',
                dismiss: '取消'
            }
        },
        tagSuggest: {
            placeholder: '搜索标签...',
            navigatePlaceholder: '导航到标签...',
            addPlaceholder: '搜索要添加的标签...',
            removePlaceholder: '选择要移除的标签...',
            createNewTag: '创建新标签: #{tag}',
            instructions: {
                navigate: '导航',
                select: '选择',
                dismiss: '取消',
                add: '添加标签',
                remove: '移除标签'
            }
        },
        welcome: {
            title: '欢迎使用 {pluginName}',
            introText: '您好！在开始之前，强烈建议您观看下面视频的前五分钟，以了解面板和开关"显示子文件夹中的笔记"是如何工作的。',
            continueText: '如果您还有五分钟时间，请继续观看视频以了解紧凑显示模式以及如何正确设置快捷方式和重要的快捷键。',
            thanksText: '非常感谢您的下载，祝您使用愉快！',
            videoAlt: '安装和掌握 Notebook Navigator',
            openVideoButton: '播放视频',
            closeButton: '稍后观看'
        }
    },

    // File system operations
    fileSystem: {
        errors: {
            createFolder: '创建文件夹失败：{error}',
            createFile: '创建文件失败：{error}',
            renameFolder: '重命名文件夹失败：{error}',
            renameFolderNoteConflict: '无法重命名："{name}"已在此文件夹中存在',
            renameFile: '重命名文件失败：{error}',
            deleteFolder: '删除文件夹失败：{error}',
            deleteFile: '删除文件失败：{error}',
            duplicateNote: '复制笔记失败：{error}',
            createCanvas: '创建画布失败：{error}',
            createDatabase: '创建数据库失败：{error}',
            duplicateFolder: '复制文件夹失败：{error}',
            openVersionHistory: '打开版本历史失败：{error}',
            versionHistoryNotFound: '未找到版本历史命令。请确保已启用 Obsidian 同步。',
            revealInExplorer: '在系统资源管理器中定位文件失败：{error}',
            folderNoteAlreadyExists: '文件夹笔记已存在',
            folderAlreadyExists: '文件夹"{name}"已存在',
            folderNotesDisabled: '请在设置中启用文件夹笔记以转换文件',
            folderNoteAlreadyLinked: '此文件已作为文件夹笔记',
            folderNoteNotFound: '所选文件夹中没有文件夹笔记',
            folderNoteUnsupportedExtension: '不支持的文件扩展名：{extension}',
            folderNoteMoveFailed: '转换过程中移动文件失败：{error}',
            folderNoteRenameConflict: '文件夹中已存在名为"{name}"的文件',
            folderNoteConversionFailed: '转换为文件夹笔记失败',
            folderNoteConversionFailedWithReason: '转换为文件夹笔记失败：{error}',
            folderNoteOpenFailed: '文件已转换但打开文件夹笔记失败：{error}',
            failedToDeleteFile: '删除 {name} 失败: {error}',
            failedToDeleteMultipleFiles: '删除{count}个文件失败',
            versionHistoryNotAvailable: '版本历史服务不可用',
            drawingAlreadyExists: '同名绘图已存在',
            failedToCreateDrawing: '创建绘图失败',
            noFolderSelected: 'Notebook Navigator 中未选择文件夹',
            noFileSelected: '未选择文件'
        },
        warnings: {
            linkBreakingNameCharacters: '该名称包含会破坏 Obsidian 链接的字符：#, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: '名称不能以 . 开头，也不能包含 : 或 /。',
            forbiddenNameCharactersWindows: 'Windows 保留字符不允许使用：<, >, ", \\, |, ?, *。'
        },
        notices: {
            hideFolder: '已隐藏文件夹：{name}',
            showFolder: '已显示文件夹：{name}'
        },
        notifications: {
            deletedMultipleFiles: '已删除 {count} 个文件',
            movedMultipleFiles: '已将{count}个文件移动到{folder}',
            folderNoteConversionSuccess: '已在"{name}"中将文件转换为文件夹笔记',
            folderMoved: '已移动文件夹"{name}"',
            deepLinkCopied: 'Obsidian URL 已复制到剪贴板',
            pathCopied: '路径已复制到剪贴板',
            relativePathCopied: '相对路径已复制到剪贴板',
            tagAddedToNote: '已将标签添加到 1 个笔记',
            tagAddedToNotes: '已将标签添加到 {count} 个笔记',
            tagRemovedFromNote: '已从 1 个笔记中移除标签',
            tagRemovedFromNotes: '已从 {count} 个笔记中移除标签',
            tagsClearedFromNote: '已从 1 个笔记中清除所有标签',
            tagsClearedFromNotes: '已从 {count} 个笔记中清除所有标签',
            noTagsToRemove: '没有可移除的标签',
            noFilesSelected: '未选择文件',
            tagOperationsNotAvailable: '标签操作不可用',
            tagsRequireMarkdown: '标签仅支持Markdown笔记',
            iconPackDownloaded: '{provider} 已下载',
            iconPackUpdated: '{provider} 已更新 ({version})',
            iconPackRemoved: '{provider} 已移除',
            iconPackLoadFailed: '{provider} 加载失败',
            hiddenFileReveal: '文件已隐藏。启用「显示隐藏项目」以显示它'
        },
        confirmations: {
            deleteMultipleFiles: '确定要删除 {count} 个文件吗？',
            deleteConfirmation: '此操作无法撤销。'
        },
        defaultNames: {
            untitled: '未命名',
            untitledNumber: '未命名 {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: '无法将文件夹移动到自身或其子文件夹中。',
            itemAlreadyExists: '此位置已存在名为 "{name}" 的项目。',
            failedToMove: '移动失败：{error}',
            failedToAddTag: '添加标签 "{tag}" 失败',
            failedToClearTags: '清除标签失败',
            failedToMoveFolder: '移动文件夹"{name}"失败',
            failedToImportFiles: 'Failed to import: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} 个文件在目标位置已存在',
            addedTag: '已将标签 "{tag}" 添加到 {count} 个文件',
            filesAlreadyHaveTag: '{count} 个文件已经有此标签或更具体的标签',
            clearedTags: '已从 {count} 个文件中清除所有标签',
            noTagsToClear: '没有要清除的标签',
            fileImported: 'Imported 1 file',
            filesImported: 'Imported {count} files'
        }
    },

    // Date grouping
    dateGroups: {
        today: '今天',
        yesterday: '昨天',
        previous7Days: '过去 7 天',
        previous30Days: '过去 30 天'
    },

    // Weekdays
    weekdays: {
        sunday: '星期日',
        monday: '星期一',
        tuesday: '星期二',
        wednesday: '星期三',
        thursday: '星期四',
        friday: '星期五',
        saturday: '星期六'
    },

    // Plugin commands
    commands: {
        open: '打开', // Command palette: Opens the Notebook Navigator view (English: Open)
        openHomepage: '打开主页', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        revealFile: '定位文件', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: '搜索', // Command palette: Toggle search in the file list (English: Search)
        toggleDualPane: '切换双窗格布局', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        selectVaultProfile: '更改仓库配置文件', // Command palette: Opens a modal to choose a different vault profile (English: Switch vault profile)
        selectVaultProfile1: '切换到仓库配置文件 1', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: '切换到仓库配置文件 2', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: '切换到仓库配置文件 3', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: '删除文件', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: '创建新笔记', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: '从模板新建笔记', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: '移动文件', // Command palette: Move selected files to another folder (English: Move files)
        selectNextFile: '选择下一个文件', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: '选择上一个文件', // Command palette: Selects the previous file in the current view (English: Select previous file)
        convertToFolderNote: '转换为文件夹笔记', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: '设为文件夹笔记', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: '解除文件夹笔记', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: '固定所有文件夹笔记', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: '导航到文件夹', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: '导航到标签', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        addShortcut: '添加到快捷方式', // Command palette: Adds the current file, folder, or tag to shortcuts (English: Add to shortcuts)
        openShortcut: '打开快捷方式 {number}',
        toggleDescendants: '切换后代', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: '切换隐藏的文件夹、标签和笔记', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: '切换标签排序', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        collapseExpand: '折叠/展开所有项目', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all items)
        addTag: '为选定文件添加标签', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        removeTag: '从选定文件移除标签', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: '从选定文件移除所有标签', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        rebuildCache: '重建缓存' // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
    },

    // Plugin UI
    plugin: {
        viewName: '笔记本导航器', // Name shown in the view header/tab (English: Notebook Navigator)
        ribbonTooltip: '笔记本导航器', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: '在笔记本导航器中定位' // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: '最后修改于',
        createdAt: '创建于',
        file: '个文件',
        files: '个文件',
        folder: '个文件夹',
        folders: '个文件夹'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: '失败的元数据报告已导出至：{filename}',
            exportFailed: '导出元数据报告失败'
        },
        sections: {
            general: '通用',
            notes: '笔记显示',
            navigationPane: '文件夹显示',
            icons: '图标包',
            tags: '标签显示',
            folders: '文件夹笔记',
            foldersAndTags: '文件夹与标签',
            search: '搜索',
            searchAndHotkeys: '搜索与快捷键',
            listPane: '列表窗格',
            hotkeys: '快捷键',
            advanced: '高级'
        },
        groups: {
            general: {
                filtering: '过滤',
                behavior: '行为',
                view: '外观',
                icons: '图标',
                desktopAppearance: '桌面外观',
                formatting: '格式'
            },
            navigation: {
                appearance: '外观',
                shortcutsAndRecent: '快捷方式和最近项目'
            },
            list: {
                display: '外观',
                pinnedNotes: '固定笔记',
                quickActions: '快捷操作'
            },
            notes: {
                frontmatter: '前置元数据',
                icon: '图标',
                title: '标题',
                previewText: '预览文本',
                featureImage: '特色图片',
                tags: '标签',
                date: '日期',
                parentFolder: '父文件夹'
            }
        },
        items: {
            searchProvider: {
                name: '搜索提供器',
                desc: '在快速文件名搜索或使用Omnisearch插件的全文搜索之间选择。（不同步）',
                options: {
                    internal: '过滤搜索',
                    omnisearch: 'Omnisearch（全文）'
                },
                info: {
                    filterSearch: {
                        title: '过滤搜索（默认）：',
                        description:
                            '按名称和标签过滤当前文件夹和子文件夹中的文件。过滤模式：混合文本和标签匹配所有条件（例如"项目 #工作"）。标签模式：仅使用标签搜索支持 AND/OR 运算符（例如"#工作 AND #紧急"、"#项目 OR #个人"）。Cmd/Ctrl+点击标签以 AND 方式添加，Cmd/Ctrl+Shift+点击以 OR 方式添加。支持使用 ! 前缀进行排除（例如 !草稿，!#已归档）以及使用 !# 查找无标签笔记。'
                    },
                    omnisearch: {
                        title: 'Omnisearch：',
                        description:
                            '全文搜索，搜索整个仓库，然后过滤结果以仅显示来自当前文件夹、子文件夹或选定标签的文件。需要安装Omnisearch插件 - 如果不可用，搜索将自动回退到过滤搜索。',
                        warningNotInstalled: '未安装 Omnisearch 插件。使用过滤搜索。',
                        limitations: {
                            title: '已知限制：',
                            performance: '性能：可能较慢，特别是在大型仓库中搜索少于3个字符时',
                            pathBug: '路径错误：无法在包含非ASCII字符的路径中搜索，且不能正确搜索子路径，影响搜索结果中显示的文件',
                            limitedResults:
                                '结果有限：由于Omnisearch搜索整个仓库并在过滤前返回有限数量的结果，如果仓库其他地方存在太多匹配项，当前文件夹中的相关文件可能不会出现',
                            previewText:
                                '预览文本：笔记预览被Omnisearch结果摘录替换，如果搜索匹配高亮出现在文件的其他位置，可能不会显示实际的高亮'
                        }
                    }
                }
            },
            listPaneTitle: {
                name: '列表窗格标题（仅限桌面版）',
                desc: '选择列表窗格标题的显示位置。',
                options: {
                    header: '显示在标题栏',
                    list: '显示在列表窗格',
                    hidden: '不显示'
                }
            },
            sortNotesBy: {
                name: '笔记排序方式',
                desc: '选择笔记列表中的笔记排序方式。',
                options: {
                    'modified-desc': '编辑日期（最新在顶部）',
                    'modified-asc': '编辑日期（最旧在顶部）',
                    'created-desc': '创建日期（最新在顶部）',
                    'created-asc': '创建日期（最旧在顶部）',
                    'title-asc': '标题（升序）',
                    'title-desc': '标题（降序）'
                }
            },
            revealFileOnListChanges: {
                name: '列表变更时滚动到选定文件',
                desc: '在固定笔记、显示后代笔记、更改文件夹外观或执行文件操作时滚动到选定的文件。'
            },
            includeDescendantNotes: {
                name: '显示子文件夹/后代的笔记（不同步）',
                desc: '在查看文件夹或标签时包含嵌套子文件夹和标签后代中的笔记。'
            },
            limitPinnedToCurrentFolder: {
                name: '将固定笔记限制在其文件夹',
                desc: '固定笔记仅在查看其固定的文件夹或标签时显示。'
            },
            separateNoteCounts: {
                name: '分别显示当前和后代计数',
                desc: '在文件夹和标签中以"当前 ▾ 后代"格式显示笔记计数。'
            },
            groupNotes: {
                name: '分组笔记',
                desc: '在按日期或文件夹分组的笔记之间显示标题。启用文件夹分组时，标签视图使用日期分组。',
                options: {
                    none: '不分组',
                    date: '按日期分组',
                    folder: '按文件夹分组'
                }
            },
            showPinnedGroupHeader: {
                name: '显示固定组标题',
                desc: '在固定笔记上方显示分组标题。'
            },
            showPinnedIcon: {
                name: '显示固定图标',
                desc: '在固定部分标题旁显示图标。'
            },
            defaultListMode: {
                name: '默认列表模式',
                desc: '选择默认列表布局。标准显示标题、日期、描述和预览文本。紧凑只显示标题。外观可按文件夹覆盖。',
                options: {
                    standard: '标准',
                    compact: '紧凑'
                }
            },
            showFileIcons: {
                name: '显示文件图标',
                desc: '显示文件图标并保留左对齐间距。禁用后将移除图标和缩进。优先级：自定义 > 文件名 > 文件类型 > 默认。'
            },
            showFilenameMatchIcons: {
                name: '按文件名设置图标',
                desc: '根据文件名中的文本分配图标。'
            },
            fileNameIconMap: {
                name: '文件名图标映射',
                desc: '包含指定文本的文件将获得指定图标。每行一个映射：文本=图标',
                placeholder: '# 文本=图标\n会议=LiCalendar\n发票=PhReceipt',
                editTooltip: '编辑映射'
            },
            showCategoryIcons: {
                name: '按文件类型设置图标',
                desc: '根据文件扩展名分配图标。'
            },
            fileTypeIconMap: {
                name: '文件类型图标映射',
                desc: '具有指定扩展名的文件将获得指定图标。每行一个映射：扩展名=图标',
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: '编辑映射'
            },
            optimizeNoteHeight: {
                name: '可变笔记高度',
                desc: '为固定笔记和无预览文本的笔记使用紧凑高度。'
            },
            compactItemHeight: {
                name: '精简项目高度',
                desc: '设置桌面和移动端的紧凑列表项高度。',
                resetTooltip: '恢复默认值 (28px)'
            },
            compactItemHeightScaleText: {
                name: '随精简高度缩放文本',
                desc: '当减小紧凑列表项高度时同步缩放文本。'
            },
            showParentFolder: {
                name: '显示父文件夹',
                desc: '为子文件夹或标签中的笔记显示父文件夹名称。'
            },
            parentFolderClickRevealsFile: {
                name: '点击父文件夹打开文件夹',
                desc: '点击父文件夹名称时，在列表面板中打开该文件夹。'
            },
            showParentFolderColor: {
                name: '显示父文件夹颜色',
                desc: '在父文件夹标签上使用文件夹颜色。'
            },
            showQuickActions: {
                name: '显示快速操作（仅桌面版）',
                desc: '悬停在文件上时显示操作按钮。按钮控件选择显示哪些操作。'
            },
            dualPane: {
                name: '双窗格布局（不同步）',
                desc: '在桌面端并排显示导航窗格和列表窗格。'
            },
            dualPaneOrientation: {
                name: '双栏布局方向（不同步）',
                desc: '双栏启用时选择水平或垂直布局。',
                options: {
                    horizontal: '水平分割',
                    vertical: '垂直分割'
                }
            },
            appearanceBackground: {
                name: '背景色',
                desc: '为导航窗格和列表窗格选择背景色。',
                options: {
                    separate: '分开背景',
                    primary: '使用列表背景',
                    secondary: '使用导航背景'
                }
            },
            appearanceScale: {
                name: '缩放级别（不同步）',
                desc: '控制 Notebook Navigator 的整体缩放级别。'
            },
            startView: {
                name: '默认启动视图',
                desc: '选择打开 Notebook Navigator 时显示的窗格。导航窗格显示快捷方式、最近笔记和文件夹结构。列表窗格显示笔记列表。',
                options: {
                    navigation: '导航窗格',
                    files: '列表窗格'
                }
            },
            toolbarButtons: {
                name: '工具栏按钮',
                desc: '选择在工具栏中显示哪些按钮。隐藏的按钮仍可通过命令和菜单访问。',
                navigationLabel: '导航工具栏',
                listLabel: '列表工具栏'
            },
            autoRevealActiveNote: {
                name: '自动定位活动笔记',
                desc: '从快速切换器、链接或搜索打开笔记时自动显示。'
            },
            autoRevealIgnoreRightSidebar: {
                name: '忽略右侧边栏事件',
                desc: '在右侧边栏中点击或更改笔记时不更改活动笔记。'
            },
            paneTransitionDuration: {
                name: '单窗格动画',
                desc: '在单窗格模式下切换窗格时的过渡持续时间（毫秒）。',
                resetTooltip: '重置为默认值'
            },
            autoSelectFirstFileOnFocusChange: {
                name: '自动选择第一个笔记（仅桌面端）',
                desc: '切换文件夹或标签时自动打开第一个笔记。'
            },
            skipAutoScroll: {
                name: '禁用快捷方式自动滚动',
                desc: '点击快捷方式中的项目时不滚动导航面板。'
            },
            autoExpandFoldersTags: {
                name: '选中时展开',
                desc: '选中时展开文件夹和标签。在单窗格模式下，首次选中展开，再次选中显示文件。'
            },
            springLoadedFolders: {
                name: '拖动时展开（仅桌面端）',
                desc: '拖动操作中悬停时展开文件夹和标签。'
            },
            springLoadedFoldersInitialDelay: {
                name: '首次展开延迟',
                desc: '拖动时首次展开文件夹或标签前的延迟（秒）。'
            },
            springLoadedFoldersSubsequentDelay: {
                name: '后续展开延迟',
                desc: '同一次拖动中展开更多文件夹或标签前的延迟（秒）。'
            },
            navigationBanner: {
                name: '导航横幅（仓库配置文件）',
                desc: '在导航窗格顶部显示一张图片。随所选仓库配置文件而变化。',
                current: '当前横幅：{path}',
                chooseButton: '选择图片'
            },
            showShortcuts: {
                name: '显示快捷方式',
                desc: '在导航窗格中显示快捷方式部分。'
            },
            shortcutBadgeDisplay: {
                name: '快捷方式徽章',
                desc: '在快捷方式旁边显示的内容。使用"打开快捷方式1-9"命令可直接打开快捷方式。',
                options: {
                    index: '位置 (1-9)',
                    count: '项目计数',
                    none: '无'
                }
            },
            showRecentNotes: {
                name: '显示最近笔记',
                desc: '在导航窗格中显示最近笔记部分。'
            },
            recentNotesCount: {
                name: '最近笔记数量',
                desc: '要显示的最近笔记数量。'
            },
            pinRecentNotesWithShortcuts: {
                name: '将最近笔记与快捷方式一起固定',
                desc: '固定快捷方式时包含最近笔记。'
            },
            showTooltips: {
                name: '显示工具提示',
                desc: '悬停时显示笔记和文件夹的额外信息工具提示。'
            },
            showTooltipPath: {
                name: '显示路径',
                desc: '在工具提示中的笔记名称下方显示文件夹路径。'
            },
            resetPaneSeparator: {
                name: '重置面板分隔符位置',
                desc: '将导航面板和列表面板之间的可拖动分隔符重置为默认位置。',
                buttonText: '重置分隔符',
                notice: '分隔符位置已重置。重启 Obsidian 或重新打开 Notebook Navigator 以应用。'
            },
            multiSelectModifier: {
                name: '多选修饰键（仅桌面端）',
                desc: '选择哪个修饰键切换多选模式。选择 Option/Alt 时，Cmd/Ctrl 点击会在新标签页中打开笔记。',
                options: {
                    cmdCtrl: 'Cmd/Ctrl 点击',
                    optionAlt: 'Option/Alt 点击'
                }
            },
            excludedNotes: {
                name: '隐藏笔记 (库配置)',
                desc: '逗号分隔的前置元数据属性列表。包含任何这些属性的笔记将被隐藏（例如：draft, private, archived）。',
                placeholder: 'draft, private'
            },
            excludedFileNamePatterns: {
                name: '隐藏文件 (库配置)',
                desc: '逗号分隔的文件名模式列表，用于隐藏文件。支持 * 通配符和 / 路径（例如：temp-*、*.png、/assets/*）。',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: '仓库配置文件',
                desc: '配置文件存储文件类型可见性、隐藏文件、隐藏文件夹、隐藏标签、隐藏笔记、快捷方式和导航横幅。从导航窗格标题切换配置文件。',
                defaultName: '默认',
                addButton: '添加配置文件',
                editProfilesButton: '编辑配置文件',
                addProfileOption: '添加配置文件...',
                applyButton: '应用',
                editButton: '编辑配置文件',
                deleteButton: '删除配置文件',
                addModalTitle: '添加配置文件',
                editProfilesModalTitle: '编辑配置文件',
                editModalTitle: '编辑配置文件',
                addModalPlaceholder: '配置文件名称',
                deleteModalTitle: '删除 {name}',
                deleteModalMessage: '删除 {name}？保存在此配置文件中的隐藏文件、文件夹、标签和笔记过滤器将被删除。',
                moveUp: '上移',
                moveDown: '下移',
                errors: {
                    emptyName: '请输入配置文件名称',
                    duplicateName: '配置文件名称已存在'
                }
            },
            vaultTitle: {
                name: '库标题位置（仅桌面端）',
                desc: '选择库标题显示的位置。',
                options: {
                    header: '显示在标题栏',
                    navigation: '显示在导航窗格'
                }
            },
            excludedFolders: {
                name: '隐藏文件夹 (库配置)',
                desc: '逗号分隔的要隐藏的文件夹列表。名称模式：assets*（以assets开头的文件夹），*_temp（以_temp结尾）。路径模式：/archive（仅根目录archive），/res*（以res开头的根文件夹），/*/temp（一级目录下的temp文件夹），/projects/*（projects内的所有文件夹）。',
                placeholder: 'templates, assets*, /archive, /res*',
                info: '自动清理：通过右键排除时，冗余的模式会被移除（例如，如果您排除/projects且/projects/app已在列表中，它将被移除）。'
            },
            fileVisibility: {
                name: '显示文件类型 (库配置)',
                desc: '过滤在导航器中显示的文件类型。Obsidian不支持的文件类型可能会在外部应用程序中打开。',
                options: {
                    documents: '文档 (.md, .canvas, .base)',
                    supported: '支持 (在Obsidian中打开)',
                    all: '全部 (可能外部打开)'
                }
            },
            homepage: {
                name: '主页',
                desc: '选择自动打开的文件，例如仪表板。',
                current: '当前：{path}',
                currentMobile: '移动端：{path}',
                chooseButton: '选择文件',

                separateMobile: {
                    name: '单独的移动端主页',
                    desc: '为移动设备使用不同的主页。'
                }
            },
            showFileDate: {
                name: '显示日期',
                desc: '在笔记名称下方显示日期。'
            },
            alphabeticalDateMode: {
                name: '按名称排序时',
                desc: '笔记按字母顺序排序时显示的日期。',
                options: {
                    created: '创建日期',
                    modified: '修改日期'
                }
            },
            showFileTags: {
                name: '显示文件标签',
                desc: '在文件项中显示可点击的标签。使用标签颜色来直观区分不同的标签类型。'
            },
            showFileTagAncestors: {
                name: '显示完整标签路径',
                desc: "显示完整的标签层级路径。启用：'ai/openai'，'工作/项目/2024'。禁用：'openai'，'2024'。"
            },
            colorFileTags: {
                name: '为文件标签着色',
                desc: '将标签颜色应用于文件项中的标签徽章。'
            },
            prioritizeColoredFileTags: {
                name: '优先显示彩色标签',
                desc: '将彩色标签排列在其他标签之前。'
            },
            showFileTagsInCompactMode: {
                name: '在精简模式中显示文件标签',
                desc: '当日期、预览和图像被隐藏时显示标签。'
            },
            dateFormat: {
                name: '日期格式',
                desc: '用于显示日期的格式（使用 date-fns 格式）。',
                placeholder: 'yyyy年M月d日',
                help: '常用格式：\nyyyy年M月d日 = 2022年5月25日\nyyyy-MM-dd = 2022-05-25\nMM/dd/yyyy = 05/25/2022\n\n标记：\nyyyy/yy = 年\nMMMM/MMM/MM/M = 月\ndd/d = 日\nEEEE/EEE = 星期',
                helpTooltip: '点击查看格式参考'
            },
            timeFormat: {
                name: '时间格式',
                desc: '用于显示时间的格式（使用 date-fns 格式）。',
                placeholder: 'HH:mm',
                help: '常用格式：\nHH:mm = 14:30（24小时制）\nh:mm a = 2:30 PM（12小时制）\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\n标记：\nHH/H = 24小时制\nhh/h = 12小时制\nmm = 分钟\nss = 秒\na = 上午/下午',
                helpTooltip: '点击查看格式参考'
            },
            showFilePreview: {
                name: '显示笔记预览',
                desc: '在笔记名称下方显示预览文本。'
            },
            skipHeadingsInPreview: {
                name: '预览中跳过标题',
                desc: '生成预览文本时跳过标题行。'
            },
            skipCodeBlocksInPreview: {
                name: '预览中跳过代码块',
                desc: '生成预览文本时跳过代码块。'
            },
            stripHtmlInPreview: {
                name: '移除预览中的 HTML',
                desc: '从预览文本中移除 HTML 标签。可能会影响大型笔记的性能。'
            },
            previewProperties: {
                name: '预览属性',
                desc: '用于查找预览文本的前置属性的逗号分隔列表。将使用第一个包含文本的属性。',
                placeholder: '摘要, 描述, 概要',
                info: '如果在指定的属性中找不到预览文本，预览将从笔记内容中生成。'
            },
            previewRows: {
                name: '预览行数',
                desc: '预览文本显示的行数。',
                options: {
                    '1': '1 行',
                    '2': '2 行',
                    '3': '3 行',
                    '4': '4 行',
                    '5': '5 行'
                }
            },
            fileNameRows: {
                name: '标题行数',
                desc: '笔记标题显示的行数。',
                options: {
                    '1': '1 行',
                    '2': '2 行'
                }
            },
            showFeatureImage: {
                name: '显示特色图片',
                desc: '显示笔记中找到的第一张图片的缩略图。'
            },
            forceSquareFeatureImage: {
                name: '强制正方形特色图片',
                desc: '将特色图片渲染为正方形缩略图。'
            },
            featureImageProperties: {
                name: '图片属性',
                desc: '用于缩略图的前置元数据属性的逗号分隔列表。',
                placeholder: 'thumbnail, featureResized, feature'
            },

            downloadExternalFeatureImages: {
                name: '下载外部图片',
                desc: '下载远程图片和 YouTube 缩略图作为特色图片。'
            },
            showRootFolder: {
                name: '显示根文件夹',
                desc: '在树中显示根文件夹名称。'
            },
            showFolderIcons: {
                name: '显示文件夹图标',
                desc: '在导航窗格的文件夹旁显示图标。'
            },
            inheritFolderColors: {
                name: '继承文件夹颜色',
                desc: '子文件夹从父文件夹继承颜色。'
            },
            showNoteCount: {
                name: '显示笔记数',
                desc: '在每个文件夹和标签旁显示笔记数量。'
            },
            showSectionIcons: {
                name: '显示快捷方式和最近项目的图标',
                desc: '显示导航分区（如快捷方式和最近文件）的图标。'
            },
            interfaceIcons: {
                name: '界面图标',
                desc: '编辑工具栏、文件夹、标签、固定、搜索和排序图标。',
                buttonText: '编辑图标'
            },
            showIconsColorOnly: {
                name: '仅对图标应用颜色',
                desc: '启用时，自定义颜色仅应用于图标。禁用时，颜色将同时应用于图标和文本标签。'
            },
            collapseBehavior: {
                name: '折叠项目',
                desc: '选择展开/折叠全部按钮影响的内容。',
                options: {
                    all: '所有文件夹和标签',
                    foldersOnly: '仅文件夹',
                    tagsOnly: '仅标签'
                }
            },
            smartCollapse: {
                name: '保持选中项展开',
                desc: '折叠时，保持当前选中的文件夹或标签及其父级展开。'
            },
            navIndent: {
                name: '树形缩进',
                desc: '调整嵌套文件夹和标签的缩进宽度。'
            },
            navItemHeight: {
                name: '行高',
                desc: '调整导航窗格中文件夹和标签的高度。'
            },
            navItemHeightScaleText: {
                name: '随行高调整文字大小',
                desc: '降低行高时减小导航文字大小。'
            },
            navRootSpacing: {
                name: '根级项目间距',
                desc: '根级文件夹和标签之间的间距。'
            },
            showTags: {
                name: '显示标签',
                desc: '在导航器中显示标签部分。'
            },
            showTagIcons: {
                name: '显示标签图标',
                desc: '在导航窗格的标签旁显示图标。'
            },
            inheritTagColors: {
                name: '继承标签颜色',
                desc: '子标签从父标签继承颜色。'
            },
            tagSortOrder: {
                name: '标签排序方式',
                desc: '选择导航窗格中的标签排序顺序。（不同步）',
                options: {
                    alphaAsc: 'A 到 Z',
                    alphaDesc: 'Z 到 A',
                    frequencyAsc: '频率（从低到高）',
                    frequencyDesc: '频率（从高到低）'
                }
            },
            showAllTagsFolder: {
                name: '显示标签文件夹',
                desc: '将"标签"显示为可折叠文件夹。'
            },
            showUntagged: {
                name: '显示无标签笔记',
                desc: '为没有任何标签的笔记显示"无标签"项目。'
            },
            keepEmptyTagsProperty: {
                name: '删除最后一个标签后保留 tags 属性',
                desc: '当所有标签被删除时保留 frontmatter 中的 tags 属性。禁用时,tags 属性将从 frontmatter 中删除。'
            },
            hiddenTags: {
                name: '隐藏标签 (库配置)',
                desc: '逗号分隔的标签模式列表。名称模式：tag*（以...开头）、*tag（以...结尾）。路径模式：archive（标签及其后代）、archive/*（仅后代）、projects/*/drafts（中间通配符）。',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: '启用文件夹笔记',
                desc: '启用后，具有关联笔记的文件夹将显示为可点击的链接。'
            },
            folderNoteType: {
                name: '默认文件夹笔记类型',
                desc: '从上下文菜单创建的文件夹笔记类型。',
                options: {
                    ask: '创建时询问',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: '文件夹笔记名称',
                desc: '文件夹笔记的名称。留空以使用与文件夹相同的名称。',
                placeholder: '留空以使用文件夹名称'
            },
            folderNoteProperties: {
                name: '文件夹笔记属性',
                desc: '添加到新文件夹笔记的YAML前置内容。--- 标记会自动添加。',
                placeholder: 'theme: dark\nfoldernote: true'
            },
            hideFolderNoteInList: {
                name: '在列表中隐藏文件夹笔记',
                desc: '隐藏文件夹笔记，使其不出现在文件夹的笔记列表中。'
            },
            pinCreatedFolderNote: {
                name: '固定创建的文件夹笔记',
                desc: '从上下文菜单创建文件夹笔记时自动固定。'
            },
            confirmBeforeDelete: {
                name: '删除前确认',
                desc: '删除笔记或文件夹时显示确认对话框'
            },
            interceptTagClicks: {
                name: '点击时导航到标签',
                desc: '点击笔记中的标签时，导航到 Notebook Navigator 中的该标签，而不是触发 Obsidian 搜索。'
            },
            metadataCleanup: {
                name: '清理元数据',
                desc: '移除在 Obsidian 外部删除、移动或重命名文件、文件夹或标签时留下的孤立元数据。这仅影响 Notebook Navigator 设置文件。',
                buttonText: '清理元数据',
                error: '设置清理失败',
                loading: '正在检查元数据...',
                statusClean: '没有需要清理的元数据',
                statusCounts: '孤立项目：{folders} 文件夹，{tags} 标签，{files} 文件，{pinned} 置顶，{separators} 分隔符'
            },
            rebuildCache: {
                name: '重建缓存',
                desc: '如果出现标签缺失、预览不正确或图片缺失，请使用此功能。这可能在同步冲突或意外关闭后发生。',
                buttonText: '重建缓存',
                success: '缓存已重建',
                error: '重建缓存失败',
                indexingTitle: '正在索引仓库...',
                progress: '正在更新 Notebook Navigator 缓存.'
            },
            hotkeys: {
                intro: '通过编辑 <plugin folder>/notebook-navigator/data.json 来自定义 Notebook Navigator 快捷键。用文本编辑器打开文件并找到 "keyboardShortcuts" 部分。每个条目都使用以下结构：',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Shift',
                    '"Ctrl" = Control（跨平台推荐使用 "Mod"）'
                ],
                guidance:
                    '如上方示例所示，需要额外按键时可为同一命令添加多条映射。若需组合多个修饰键，请在同一条目中列出所有值，例如 "modifiers": ["Mod", "Shift" ]。不支持 "gg" 或 "dd" 这类按键序列。编辑完成后，请重新加载 Obsidian。'
            },
            externalIcons: {
                downloadButton: '下载',
                downloadingLabel: '正在下载...',
                removeButton: '移除',
                statusInstalled: '已下载 (版本 {version})',
                statusNotInstalled: '未下载',
                versionUnknown: '未知',
                downloadFailed: '下载{name}失败。请检查您的连接并重试。',
                removeFailed: '移除{name}失败。',
                infoNote:
                    '下载的图标包会在设备之间同步安装状态。图标包保存在每个设备的本地数据库中；同步仅跟踪它们是否应该被下载或移除。图标包从Notebook Navigator仓库下载 (https://github.com/johansan/notebook-navigator/tree/main/icon-assets)。'
            },
            useFrontmatterDates: {
                name: '使用前言元数据',
                desc: '使用前言设置笔记名称、时间戳、图标和颜色'
            },
            frontmatterNameField: {
                name: '名称字段（多个）',
                desc: '逗号分隔的前言字段列表。使用第一个非空值。回退到文件名。',
                placeholder: '标题, 名称'
            },
            frontmatterIconField: {
                name: '图标字段',
                desc: '文件图标的前言字段。留空使用存储在设置中的图标。',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: '颜色字段',
                desc: '文件颜色的前言字段。留空使用存储在设置中的颜色。',
                placeholder: 'color'
            },
            frontmatterSaveMetadata: {
                name: '将图标和颜色保存到前言',
                desc: '使用上面配置的字段自动将文件图标和颜色写入前言。'
            },
            frontmatterMigration: {
                name: '从设置迁移图标和颜色',
                desc: '存储在设置中：{icons} 个图标，{colors} 种颜色。',
                button: '迁移',
                buttonWorking: '正在迁移...',
                noticeNone: '设置中未保存任何文件图标或颜色。',
                noticeDone: '已迁移 {migratedIcons}/{icons} 个图标，{migratedColors}/{colors} 种颜色。',
                noticeFailures: '失败的条目：{failures}。',
                noticeError: '迁移失败。请检查控制台以获取详细信息。'
            },
            frontmatterCreatedField: {
                name: '创建时间戳字段',
                desc: '创建时间戳的前言字段名称。留空仅使用文件系统日期。',
                placeholder: '创建时间'
            },
            frontmatterModifiedField: {
                name: '修改时间戳字段',
                desc: '修改时间戳的前言字段名称。留空仅使用文件系统日期。',
                placeholder: '修改时间'
            },
            frontmatterDateFormat: {
                name: '时间戳格式',
                desc: '用于解析前言中时间戳的格式。留空使用 ISO 8601 格式',
                helpTooltip: '查看 date-fns 格式文档',
                help: "常用格式:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: '支持开发',
                desc: '如果您喜欢使用笔记本导航器，请考虑支持其持续开发。',
                buttonText: '❤️ 赞助',
                coffeeButton: '☕️ 请我喝咖啡'
            },
            updateCheckOnStart: {
                name: '启动时检查新版本',
                desc: '启动时检查新的插件版本，当有可用更新时显示通知。每个版本仅通知一次，检查最多每天一次。',
                status: '有新版本可用：{version}'
            },
            whatsNew: {
                name: 'Notebook Navigator {version} 的最新动态',
                desc: '查看最近的更新和改进',
                buttonText: '查看最近更新'
            },
            masteringVideo: {
                name: '精通 Notebook Navigator（视频）',
                desc: '本视频涵盖了在 Notebook Navigator 中高效工作所需的一切内容，包括快捷键、搜索、标签和高级自定义。'
            },
            cacheStatistics: {
                localCache: '本地缓存',
                items: '项',
                withTags: '包含标签',
                withPreviewText: '包含预览文本',
                withFeatureImage: '包含特色图片',
                withMetadata: '包含元数据'
            },
            metadataInfo: {
                successfullyParsed: '成功解析',
                itemsWithName: '个带名称的项目',
                withCreatedDate: '个带创建日期',
                withModifiedDate: '个带修改日期',
                withIcon: '个带图标',
                withColor: '个带颜色',
                failedToParse: '解析失败',
                createdDates: '个创建日期',
                modifiedDates: '个修改日期',
                checkTimestampFormat: '请检查您的时间戳格式。',
                exportFailed: '导出错误'
            }
        }
    },
    whatsNew: {
        title: 'Notebook Navigator 的新功能',
        supportMessage: '如果您觉得 Notebook Navigator 有用，请考虑支持其开发。',
        supportButton: '请我喝咖啡',
        thanksButton: '谢谢！'
    }
};
