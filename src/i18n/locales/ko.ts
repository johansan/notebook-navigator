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
 * Korean language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_KO = {
    // Common UI elements
    common: {
        cancel: '취소', // Button text for canceling dialogs and operations (English: Cancel)
        delete: '삭제', // Button text for delete operations in dialogs (English: Delete)
        clear: '지우기', // Button text for clearing values (English: Clear)
        remove: '제거', // Button text for remove operations in dialogs (English: Remove)
        restoreDefault: '기본값 복원', // Button text for restoring values to defaults (English: Restore default)
        submit: '제출', // Button text for submitting forms and dialogs (English: Submit)
        save: '저장', // Button text for saving settings and dialogs (English: Save)
        configure: '구성', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: '라이트 모드', // Label for light theme mode (English: Light mode)
        darkMode: '다크 모드', // Label for dark theme mode (English: Dark mode)
        noSelection: '선택 없음', // Placeholder text when no folder or tag is selected (English: No selection)
        untagged: '태그 없음', // Label for notes without any tags (English: Untagged)
        featureImageAlt: '대표 이미지', // Alt text for thumbnail/preview images (English: Feature image)
        unknownError: '알 수 없는 오류', // Generic fallback when an error has no message (English: Unknown error)
        clipboardWriteError: '클립보드에 쓸 수 없습니다',
        updateBannerTitle: 'Notebook Navigator 업데이트 사용 가능',
        updateBannerInstruction: '설정 -> 커뮤니티 플러그인에서 업데이트',
        previous: '이전', // Generic aria label for previous navigation (English: Previous)
        next: '다음' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: '노트를 보려면 폴더나 태그를 선택하세요', // Message shown when no folder or tag is selected (English: Select a folder or tag to view notes)
        emptyStateNoNotes: '노트 없음', // Message shown when a folder/tag has no notes (English: No notes)
        pinnedSection: '고정됨', // Header for the pinned notes section at the top of file list (English: Pinned)
        notesSection: '노트', // Header shown between pinned and regular items when showing documents only (English: Notes)
        filesSection: '파일', // Header shown between pinned and regular items when showing supported or all files (English: Files)
        hiddenItemAriaLabel: '{name} (숨김)', // Accessibility label applied to list items that are normally hidden
        collapseGroup: '그룹 접기',
        expandGroup: '그룹 펼치기',
        manualSortTitle: '수동 정렬: {property}',
        manualSortHint: '드래그하여 순서를 변경하세요. 순서는 숫자 인덱스 값으로 속성 "{property}"에 저장됩니다.',
        manualSortNonMarkdownHint: '마크다운이 아닌 파일은 하단에 표시되며 순서를 변경할 수 없습니다.',
        unsortedSection: '정렬되지 않음',
        propertyGroupNoValue: '없음',
        manualSortDone: '완료',
        manualSortMultipleWriteFailure: '{count}개 파일 실패; 첫 번째: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: '태그 없음', // Label for the special item showing notes without tags (English: Untagged)
        tags: '태그' // Label for the tags virtual folder (English: Tags)
    },

    navigationPane: {
        shortcutsHeader: '바로가기',
        recentFilesHeader: '최근 파일', // Header label for recent files section in navigation pane (English: Recent files)
        properties: '속성',
        folders: '폴더',
        tags: '태그',
        calendar: '달력',
        reorderRootFoldersTitle: '탐색 재정렬',
        reorderRootFoldersHint: '화살표 또는 드래그로 재정렬',
        vaultRootLabel: '보관함',
        resetRootToAlpha: '알파벳 순서로 재설정',
        resetRootToFrequency: '빈도 순으로 재설정',
        pinShortcuts: '바로가기를 고정',
        pinShortcutsAndRecentFiles: '바로가기와 최근 파일을 고정',
        unpinShortcuts: '바로가기 고정을 해제',
        unpinShortcutsAndRecentFiles: '바로가기와 최근 파일 고정을 해제',
        profileMenuAria: '보관함 프로필 변경'
    },

    navigationCalendar: {
        ariaLabel: '달력',
        dailyNotesNotEnabled: '일일 노트 코어 플러그인이 활성화되어 있지 않습니다.',
        noteHiddenByProfile: '캘린더 노트가 현재 보관함 프로필에서 숨겨져 있습니다.',
        createDailyNote: {
            title: '새 일일 노트',
            message: '파일 {filename}이(가) 존재하지 않습니다. 생성하시겠습니까?',
            confirmButton: '생성'
        },
        helpModal: {
            title: '캘린더 단축키',
            items: [
                '아무 날이나 클릭하여 일일 노트를 열거나 만듭니다. 주, 월, 분기, 연도도 같은 방식으로 작동합니다.',
                '날짜 아래 채워진 점은 노트가 있음을 의미합니다. 빈 점은 미완료 작업이 있음을 의미합니다.',
                '노트에 대표 이미지가 있으면 해당 날짜의 배경으로 표시됩니다.'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+클릭으로 해당 날짜로 파일 목록을 필터링합니다.',
            dateFilterOptionAlt: '`Option/Alt`+클릭으로 해당 날짜로 파일 목록을 필터링합니다.'
        }
    },

    dailyNotes: {
        templateReadFailed: '일일 노트 템플릿을 읽을 수 없습니다.',
        createFailed: '일일 노트를 생성할 수 없습니다.'
    },

    shortcuts: {
        folderExists: '폴더가 이미 바로가기에 있습니다',
        noteExists: '노트가 이미 바로가기에 있습니다',
        tagExists: '태그가 이미 바로가기에 있습니다',
        propertyExists: '속성이 이미 바로가기에 있습니다',
        invalidProperty: '잘못된 속성 바로가기',
        searchExists: '검색 바로가기가 이미 존재합니다',
        emptySearchQuery: '저장하기 전에 검색 쿼리를 입력하세요',
        emptySearchName: '검색을 저장하기 전에 이름을 입력하세요',
        add: '바로가기에 추가',
        addNotesCount: '바로가기에 노트 {count}개 추가',
        addFilesCount: '바로가기에 파일 {count}개 추가',
        rename: '바로가기 이름 변경',
        remove: '바로가기에서 제거',
        removeAll: '모든 바로가기 제거',
        removeAllConfirm: '모든 바로가기를 제거하시겠습니까?',
        folderNotesPinned: '폴더 노트 {count}개를 고정했습니다'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: '항목 접기', // Tooltip for button that collapses expanded items (English: Collapse items)
        expandAllFolders: '모든 항목 펼치기', // Tooltip for button that expands all items (English: Expand all items)
        collapseAllListGroups: '모든 목록 그룹 접기',
        expandAllListGroups: '모든 목록 그룹 펼치기',
        showCalendar: '달력 표시',
        hideCalendar: '달력 숨기기',
        newFolder: '새 폴더', // Tooltip for create new folder button (English: New folder)
        newNote: '새 노트', // Tooltip for create new note button (English: New note)
        mobileBackToNavigation: '탐색으로 돌아가기', // Mobile-only back button text to return to navigation pane (English: Back to navigation)
        changeChildSortOrder: '정렬 순서 변경',
        changeSortAndGroup: '정렬 및 그룹 변경',
        resetViewToDefaults: '보기를 기본값으로 재설정',
        manualSort: '수동 정렬',
        editSortOrder: '정렬 순서 편집...',
        removeSortProperty: '정렬 속성 제거',
        descendants: '하위 항목',
        subfolders: '하위 폴더',
        subtags: '하위 태그',
        childValues: '하위 값',
        applySortAndGroupToDescendants: (target: string) => `${target}에 정렬 및 그룹 적용`,
        applyAppearanceToDescendants: (target: string) => `${target}에 모양 적용`,
        resetAppearanceInDescendants: (target: string) => `${target}의 모양 재설정`,
        showFolders: '탐색 표시', // Tooltip for button to show the navigation pane (English: Show navigation)
        reorderRootFolders: '탐색 재정렬',
        finishRootFolderReorder: '완료',
        showExcludedItems: '숨긴 폴더, 태그, 노트 표시', // Tooltip for button to show hidden items (English: Show hidden items)
        hideExcludedItems: '숨긴 폴더, 태그, 노트 숨기기', // Tooltip for button to hide hidden items (English: Hide hidden items)
        showDualPane: '이중 창 표시', // Tooltip for button to show dual-pane layout (English: Show dual panes)
        showSinglePane: '단일 창 표시', // Tooltip for button to show single-pane layout (English: Show single pane)
        dualPaneAutoFallbackNotice:
            '사이드바가 너무 좁으면 이중 창을 사용할 수 없습니다. 이를 변경하려면 설정 > 모양 및 동작에서 "사이드바가 너무 좁을 때"를 "아무것도 하지 않음"으로 설정하세요.',
        changeAppearance: '모양 변경', // Tooltip for button to change folder appearance settings (English: Change appearance)
        changeAppearanceCustomized: '모양 변경, 사용자 지정됨',
        showNotesFromSubfolders: '하위 폴더 노트 표시',
        showFilesFromSubfolders: '하위 폴더 파일 표시',
        showNotesFromDescendants: '하위 항목 노트 표시',
        showFilesFromDescendants: '하위 항목 파일 표시',
        search: '검색' // Tooltip for search button (English: Search)
    },
    // Search input
    searchInput: {
        placeholder: '검색...', // Placeholder text for search input (English: Search...)
        placeholderVault: '보관함 검색...',
        placeholderOmnisearch: 'Omnisearch...', // Placeholder text when Omnisearch provider is active (English: Omnisearch...)
        clearSearch: '검색 지우기', // Tooltip for clear search button (English: Clear search)
        switchToFilterSearch: '필터 검색으로 전환',
        switchToOmnisearch: 'Omnisearch로 전환',
        saveSearchShortcut: '검색을 바로가기에 저장',
        removeSearchShortcut: '바로가기에서 검색 제거',
        shortcutModalTitle: '검색 바로가기 저장',
        shortcutNamePlaceholder: '바로가기 이름을 입력하세요',
        shortcutStartIn: '항상 다음에서 시작: {path}',
        searchHelp: '검색 구문',
        searchHelpTitle: '검색 구문',
        searchHelpModal: {
            intro: '필터 검색은 표시 이름, 별칭, 속성, 태그, 날짜, 필터를 하나의 쿼리로 결합하여 노트를 찾습니다 (예: `meeting .status=active #work @thisweek`). 별 아이콘을 클릭하면 검색을 바로가기에 저장할 수 있습니다.',
            introInstallOmnisearch: '노트 내용의 전체 텍스트 검색에는 Omnisearch 플러그인이 필요합니다.',
            introSwitching: '위/아래 화살표 키 또는 검색 아이콘 클릭으로 필터 검색과 Omnisearch 간에 전환할 수 있습니다.',
            activeFilterSearch: '필터 검색이 활성화되어 있습니다.',
            activeOmnisearch: 'Omnisearch가 활성화되어 있습니다.',
            omnisearchIntro:
                'Omnisearch는 보관함 전체의 노트 내용에서 전체 텍스트 검색을 수행합니다. Notebook Navigator는 현재 폴더, 태그 또는 선택 항목에 속하는 일치 항목을 표시합니다.',
            sections: {
                fileNames: {
                    title: '파일 이름과 별칭',
                    items: [
                        '`word` 표시 이름 또는 별칭에 "word"가 포함된 노트 찾기.',
                        '`word1 word2` 모든 단어가 표시 이름 또는 별칭 중 하나와 일치해야 합니다.',
                        '`-word` 표시 이름 또는 별칭에 "word"가 포함된 노트 제외.',
                        '`"text"` 텍스트를 그대로 검색. 큰따옴표로 시작하는 검색어는 태그, 속성, 날짜, 필터로 해석되지 않습니다 (예: `".F"`).',
                        '`-"text"` 표시 이름 또는 별칭에 해당 텍스트가 포함된 노트 제외.'
                    ]
                },
                tags: {
                    title: '태그',
                    items: [
                        '`#tag` 태그가 있는 노트 포함 (`#tag/subtag`와 같은 중첩 태그도 일치).',
                        '`#` 태그가 있는 노트만 포함.',
                        '`-#tag` 태그가 있는 노트 제외.',
                        '`-#` 태그가 없는 노트만 포함.',
                        '`#tag1 #tag2` 두 태그 모두 일치 (암시적 AND).',
                        '`#tag1 AND #tag2` 두 태그 모두 일치 (명시적 AND).',
                        '`#tag1 OR #tag2` 태그 중 하나와 일치.',
                        '`#a OR #b AND #c` AND가 우선순위가 높음: `#a` 또는 `#b`와 `#c` 모두 일치.',
                        'Cmd/Ctrl+클릭으로 AND로 태그 추가. Cmd/Ctrl+Shift+클릭으로 OR로 추가.'
                    ]
                },
                properties: {
                    title: '속성',
                    items: [
                        '`.key` `key`로 시작하는 속성 키가 있는 노트를 포함합니다.',
                        '`.key=value` 속성 값에 `value`가 포함된 노트를 포함합니다.',
                        '`."Reading Status"` 공백이 포함된 속성 키가 있는 노트를 포함합니다.',
                        '`."Reading Status"="In Progress"` 공백이 포함된 키와 값은 큰따옴표로 묶어야 합니다.',
                        '`-.key` `key`로 시작하는 속성 키가 있는 노트를 제외합니다.',
                        '`-.key=value` 속성 값에 `value`가 포함된 노트를 제외합니다.',
                        'Cmd/Ctrl+클릭으로 속성을 AND로 추가. Cmd/Ctrl+Shift+클릭으로 OR로 추가.'
                    ]
                },
                tasks: {
                    title: '필터',
                    items: [
                        '`has:task` 미완료 작업이 있는 노트를 포함.',
                        '`-has:task` 미완료 작업이 있는 노트를 제외.',
                        '`folder:meetings` 폴더 이름에 `meetings`를 포함하는 노트를 포함.',
                        '`folder:/work/meetings` `work/meetings` 내의 노트만 포함 (하위 폴더 제외).',
                        '`folder:/` 보관함 루트에 있는 노트만 포함.',
                        '`-folder:archive` 폴더 이름에 `archive`를 포함하는 노트를 제외.',
                        '`-folder:/archive` `archive` 내의 노트만 제외 (하위 폴더 제외).',
                        '`ext:md` 확장자가 `md`인 노트를 포함 (`ext:.md`도 지원).',
                        '`-ext:pdf` 확장자가 `pdf`인 노트를 제외.',
                        '태그, 이름, 날짜와 결합하여 사용 (예: `folder:/work/meetings ext:md @thisweek`).'
                    ]
                },
                connectors: {
                    title: 'AND/OR 동작',
                    items: [
                        '`AND`와 `OR`는 태그/속성 전용 쿼리에서만 연산자로 작동합니다.',
                        '태그/속성 전용 쿼리에는 태그 및 속성 필터만 포함됩니다: `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`.',
                        '쿼리에 이름, 날짜(`@...`), 작업 필터(`has:task`), 폴더 필터(`folder:...`), 또는 확장자 필터(`ext:...`)가 포함되면 `AND`와 `OR`는 단어로 검색됩니다.',
                        '연산자 쿼리 예시: `#work OR .status=started`.',
                        '혼합 쿼리 예시: `#work OR ext:md` (`OR`가 파일 이름에서 검색됩니다).'
                    ]
                },
                dates: {
                    title: '날짜',
                    items: [
                        '`@today` 기본 날짜 필드를 사용하여 오늘의 노트 찾기.',
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` 상대적 날짜 범위.',
                        '`@2026-02-07` 특정 날짜 찾기 (`@20260207`도 지원).',
                        '`@2026` 달력 연도 찾기.',
                        '`@2026-02` 또는 `@202602` 달력 월 찾기.',
                        '`@2026-W05` 또는 `@2026W05` ISO 주 찾기.',
                        '`@2026-Q2` 또는 `@2026Q2` 달력 분기 찾기.',
                        '`@13/02/2026` 구분자가 있는 숫자 형식 (`@07022026`은 모호할 때 로케일을 따름).',
                        '`@2026-02-01..2026-02-07` 포함 날짜 범위 찾기 (열린 끝 지원).',
                        '`@c:...` 또는 `@m:...` 생성 또는 수정 날짜 지정.',
                        '`-@...` 날짜 일치 제외.'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        '쿼리는 Omnisearch 플러그인으로 전송되며 Omnisearch 쿼리 구문을 따릅니다. `#tag`, `.property`, `@date`와 같은 필터 검색 토큰은 특별한 의미가 없습니다.',
                        '폴더를 선택하면 Omnisearch가 해당 폴더와 하위 폴더 내에서 일치하도록 쿼리에 `path:"<folder>/"`가 추가됩니다. 이미 `path:`가 포함된 쿼리는 그대로 전송됩니다.',
                        'Omnisearch는 관련성 순으로 최대 50개의 결과를 반환합니다. 일치 항목이 그보다 많은 검색에서는 순위가 낮은 노트가 표시되지 않습니다.',
                        '비ASCII 문자가 포함된 폴더 경로를 범위로 지정하려면 Omnisearch 1.30.0 이상이 필요합니다. 이전 버전에서는 보관함 전체를 검색한 후 결과가 폴더로 필터링됩니다.',
                        '대규모 보관함에서는 3자 미만의 쿼리가 느릴 수 있습니다.',
                        '노트 미리보기에 기본 미리보기 텍스트 대신 Omnisearch 발췌문이 표시됩니다.'
                    ]
                }
            }
        }
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: '새 탭에서 열기',
            openToRight: '오른쪽에 열기',
            openInNewWindow: '새 창에서 열기',
            openMultipleInNewTabs: '{count}개의 노트를 새 탭에서 열기',
            openMultipleFilesInNewTabs: '{count}개의 파일을 새 탭에서 열기',
            openMultipleToRight: '{count}개의 노트를 오른쪽에 열기',
            openMultipleFilesToRight: '{count}개의 파일을 오른쪽에 열기',
            openMultipleInNewWindows: '{count}개의 노트를 새 창에서 열기',
            openMultipleFilesInNewWindows: '{count}개의 파일을 새 창에서 열기',
            pinNote: '노트 고정',
            pinFile: '파일 고정',
            unpinNote: '노트 고정 해제',
            unpinFile: '파일 고정 해제',
            pinMultipleNotes: '{count}개의 노트 고정',
            pinMultipleFiles: '{count}개의 파일 고정',
            unpinMultipleNotes: '{count}개의 노트 고정 해제',
            unpinMultipleFiles: '{count}개의 파일 고정 해제',
            duplicateNote: '노트 복제',
            duplicateFile: '파일 복제',
            duplicateMultipleNotes: '{count}개의 노트 복제',
            duplicateMultipleFiles: '{count}개의 파일 복제',
            openVersionHistory: '버전 기록 열기',
            revealInFolder: '폴더에서 표시',
            revealInFinder: 'Finder에서 표시',
            showInExplorer: '시스템 탐색기에서 표시',
            openInDefaultApp: '기본 앱에서 열기',
            renameNote: '노트 이름 변경',
            renameFile: '파일 이름 변경',
            deleteNote: '노트 삭제',
            deleteFile: '파일 삭제',
            setCalendarHighlight: '하이라이트 설정',
            removeCalendarHighlight: '하이라이트 제거',
            deleteMultipleNotes: '{count}개의 노트 삭제',
            deleteMultipleFiles: '{count}개의 파일 삭제',
            moveNoteToFolder: '노트 이동...',
            moveFileToFolder: '파일 이동...',
            moveMultipleNotesToFolder: '{count}개의 노트 이동...',
            moveMultipleFilesToFolder: '{count}개의 파일 이동...',
            mergeNotes: '{count}개의 노트 병합...',
            mergeNotesInGroup: '그룹의 노트 병합...',
            setManualSortGroupHeader: '그룹 머리글 설정',
            changeManualSortGroupHeader: '그룹 머리글 변경',
            manualSortGroupHeader: {
                title: '그룹 머리글',
                copyStyle: '머리글 스타일 복사',
                pasteStyle: '머리글 스타일 붙여넣기',
                remove: '그룹 머리글 제거'
            },
            addTag: '태그 추가',
            addPropertyKey: '속성 설정',
            removeTag: '태그 제거',
            removeAllTags: '모든 태그 제거',
            changeIcon: '아이콘 변경',
            changeColor: '색상 변경'
        },
        folder: {
            newNote: '새 노트',
            newNoteFromTemplate: '템플릿으로 새 노트',
            newFolder: '새 폴더',
            newCanvas: '새 캔버스',
            newBase: '새 베이스',
            newDrawing: '새 드로잉',
            newExcalidrawDrawing: '새 Excalidraw 드로잉',
            newTldrawDrawing: '새 Tldraw 드로잉',
            duplicateFolder: '폴더 복제',
            searchInFolder: '폴더에서 검색',
            createFolderNote: '폴더 노트 만들기',
            detachFolderNote: '폴더 노트 해제',
            deleteFolderNote: '폴더 노트 삭제',
            changeIcon: '아이콘 변경',
            changeColor: '색상 변경',
            changeBackground: '배경색 변경',
            excludeFolder: '폴더 숨기기',
            unhideFolder: '폴더 표시',
            hideRootFolder: '루트 폴더 숨기기',
            showRootFolder: '루트 폴더 표시',
            excludeFromDescendants: '상위 폴더에서 숨기기',
            includeInDescendants: '상위 폴더에서 표시',
            hiddenFromParentsIndicator: '상위 폴더 목록에서 숨김',
            moveFolder: '폴더 이동...',
            renameFolder: '폴더 이름 변경',
            deleteFolder: '폴더 삭제'
        },
        tag: {
            changeIcon: '아이콘 변경',
            changeColor: '색상 변경',
            changeBackground: '배경색 변경',
            showTag: '태그 표시',
            hideTag: '태그 숨기기'
        },
        property: {
            addKey: '속성 키 구성',
            renameKey: '속성 이름 변경',
            deleteKey: '속성 삭제'
        },
        navigation: {
            addSeparator: '구분선 추가',
            removeSeparator: '구분선 제거'
        },
        copy: {
            title: '복사',
            noteLink: '노트 링크',
            fileLink: '파일 링크',
            noteLinkAsFootnote: '각주로 노트 링크',
            fileLinkAsFootnote: '각주로 파일 링크',
            noteEmbed: '노트 임베드',
            fileEmbed: '파일 임베드',
            obsidianUrl: 'Obsidian URL',
            pathFromVaultFolder: '보관함 폴더 기준 경로',
            pathFromSystemRoot: '시스템 루트 기준 경로'
        },
        style: {
            title: '스타일',
            copy: '스타일 복사',
            paste: '스타일 붙여넣기',
            removeIcon: '아이콘 제거',
            removeColor: '색상 제거',
            removeBackground: '배경 제거',
            clear: '스타일 지우기'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        appearance: '모양',
        sortBy: '정렬 기준',
        standardPreset: '표준',
        compactPreset: '컴팩트',
        defaultSuffix: '(기본값)',
        defaultLabel: '기본',
        titleRows: {
            label: '제목 행',
            option: (rows: number) => `${rows}개 제목 행`
        },
        previewRows: {
            label: '미리보기 행',
            none: '없음',
            option: (rows: number) => `${rows}개 미리보기 행`
        },
        groupBy: '그룹화 기준',
        tags: '태그',
        properties: '속성',
        tasks: '작업',
        textCount: {
            label: '텍스트 수',
            options: {
                none: '없음',
                words: '단어',
                characters: '문자',
                both: '단어 및 문자'
            }
        },
        resetAppearance: '모양 재설정',
        openPluginSettings: '플러그인 설정 열기…'
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: '적용',
            applySortAndGroupTitle: (target: string) => `${target}에 정렬 및 그룹을 적용하시겠습니까?`,
            applyAppearanceTitle: (target: string) => `${target}에 모양을 적용하시겠습니까?`,
            resetAppearanceTitle: (target: string) => `${target}의 모양을 재설정하시겠습니까?`,
            applyAppearanceMessage: (count: number, replacedCount: number) =>
                `${count}개 항목의 모양이 변경됩니다. 교체되는 기존 사용자 지정 모양: ${replacedCount}개. 저장된 모양 설정이 한 번 복사되며 정렬과 그룹화는 유지됩니다. 이후 변경 사항과 새 하위 항목은 연결되지 않습니다.`,
            resetAppearanceMessage: (count: number) =>
                `${count}개 항목의 모양이 재설정됩니다. 정렬과 그룹화는 유지됩니다. 일회성 변경이며 이후 변경 사항과 새 하위 항목은 연결되지 않습니다.`,
            affectedCountMessage: (count: number) => `변경될 기존 재정의: ${count}.`
        },
        manualSortConfirm: {
            propertySortTitle: '수동 정렬을 사용하시겠습니까?',
            propertySortMessage: (property: string, count: number) =>
                `현재 보기를 "${property}"을(를) 사용한 수동 정렬로 전환합니다. 순서를 편집하면 필요에 따라 ${count}개 노트의 해당 속성에 숫자 인덱스 값이 기록됩니다.`,
            propertySortConfirmButton: '수동 정렬 사용',
            removePropertyTitle: '정렬 속성을 제거하시겠습니까?',
            removePropertyMessage: (property: string, count: number) =>
                `현재 목록의 ${count}개 노트에서 "${property}"을(를) 제거합니다. 해당 노트의 수동 정렬 순서가 초기화됩니다.`,
            removePropertyConfirmButton: '속성 제거',
            compactTitle: '인덱스 값을 압축하시겠습니까?',
            compactMessage: (count: number) =>
                `이 재정렬에는 더 많은 숫자 공간이 필요합니다. ${count}개 노트에 새로운 인덱스 값이 할당됩니다.`,
            compactConfirmButton: '인덱스 값 압축'
        },
        manualSortGroupHeader: {
            title: '그룹 머리글 설정',
            titleLabel: '제목',
            placeholder: '그룹 머리글',
            icon: '아이콘',
            color: '색상',
            wordCount: '단어 수 표시',
            wordCountTarget: '목표 단어 수',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                '이 필드가 비어 있으면 그룹 목표는 설정 > 파일 표시 > 단어 및 문자 수에 설정된 목표 속성을 사용합니다. 이 그룹의 목표 값을 설정하여 재정의하세요.',
            description: '이 노트의 그룹 머리글을 사용자 지정합니다. 머리글을 제거하려면 제목을 비워 두세요.'
        },
        mergeNotes: {
            title: '노트 병합',
            summary: '{folder}의 {count}개 노트에서 하나의 노트를 만듭니다.',
            frontmatterRule: '첫 번째 노트의 frontmatter는 유지됩니다. 다른 노트의 frontmatter는 제거됩니다.',
            crossFolderWarning: '원본 노트가 서로 다른 폴더에 있습니다. 병합된 노트에서 상대 링크와 임베드가 작동하지 않을 수 있습니다.',
            outputName: '출력 이름',
            outputNameDesc: '병합된 노트는 위에 표시된 폴더에 생성됩니다.',
            outputNamePlaceholder: '병합된 노트',
            separator: '구분자',
            separatorDesc: '노트 사이에 삽입됩니다.',
            separatorOptions: {
                none: '없음',
                blankLine: '빈 줄',
                horizontalRule: '수평선',
                heading: '노트 제목이 있는 헤딩'
            },
            moveSourcesToTrash: '병합 후 원본 노트를 휴지통으로 이동',
            mergeButton: '병합'
        },
        navRainbowSection: {
            title: (section: string) => `무지개 색상: ${section}`
        },
        iconPicker: {
            searchPlaceholder: '아이콘 검색...',
            recentlyUsedHeader: '최근 사용',
            emptyStateSearch: '아이콘을 검색하려면 입력하세요',
            emptyStateNoResults: '아이콘을 찾을 수 없음',
            showingResultsInfo: '{count}개 중 50개 결과 표시. 더 좁혀서 검색하세요.',
            emojiInstructions: '이모지를 입력하거나 붙여넣어 아이콘으로 사용하세요',
            removeIcon: '아이콘 제거',
            removeFromRecents: '최근 아이콘에서 제거',
            allTabLabel: '모두'
        },
        fileIconRuleEditor: {
            addRuleAria: '규칙 추가'
        },
        interfaceIcons: {
            title: '인터페이스 아이콘',
            fileItemsSection: '파일 항목',
            items: {
                'nav-shortcuts': '바로가기',
                'nav-recent-files': '최근 파일',
                'nav-expand-all': '모두 펼치기',
                'nav-collapse-all': '모두 접기',
                'nav-calendar': '달력',
                'nav-tree-expand': '트리 화살표: 펼치기',
                'nav-tree-collapse': '트리 화살표: 접기',
                'nav-hidden-items': '숨겨진 항목',
                'nav-root-reorder': '루트 폴더 재정렬',
                'nav-new-folder': '새 폴더',
                'nav-show-single-pane': '단일 창 표시',
                'nav-show-dual-pane': '이중 창 표시',
                'nav-profile-chevron': '프로필 메뉴 화살표',
                'list-search': '검색',
                'list-reveal-file': '파일 표시',
                'list-descendants': '하위 폴더의 노트',
                'list-expand-all': '모든 그룹 펼치기',
                'list-collapse-all': '모든 그룹 접기',
                'list-sort-ascending': '정렬 순서: 오름차순',
                'list-sort-descending': '정렬 순서: 내림차순',
                'list-sort-modified': '수정 날짜로 정렬',
                'list-sort-created': '생성 날짜로 정렬',
                'list-sort-title': '제목으로 정렬',
                'list-sort-filename': '파일 이름으로 정렬',
                'list-sort-property': '속성으로 정렬',
                'list-appearance': '모양 변경',
                'list-new-note': '새 노트',
                'list-pinned': '고정된 노트',
                'nav-folder-open': '열린 폴더',
                'nav-folder-closed': '닫힌 폴더',
                'nav-tags': '태그',
                'nav-tag': '태그',
                'nav-properties': '속성',
                'nav-property': '속성',
                'nav-property-value': '값',
                'file-unfinished-task': '작업',
                'file-word-count': '단어 수',
                'file-character-count': '문자 수'
            }
        },
        colorPicker: {
            currentColor: '현재',
            newColor: '새 색상',
            paletteDefault: '기본',
            paletteCustom: '사용자 지정',
            copyColors: '색상 복사',
            colorsCopied: '클립보드에 복사됨',
            pasteColors: '색상 붙여넣기',
            pasteClipboardError: '클립보드를 읽을 수 없습니다',
            pasteInvalidFormat: '16진수 색상 값이 필요합니다',
            colorsPasted: '색상을 붙여넣었습니다',
            resetUserColors: '사용자 지정 색상 지우기',
            clearCustomColorsConfirm: '모든 사용자 지정 색상을 제거하시겠습니까?',
            userColorSlot: '색상 {slot}',
            recentColors: '최근 색상',
            clearRecentColors: '최근 색상 지우기',
            removeRecentColor: '색상 제거',
            apply: '적용',
            pickerLabel: '선택기',
            hexLabel: 'HEX',
            hexInputLabel: 'HEX 색상 값',
            saturationValueArea: '채도 및 밝기',
            hueSlider: '색조',
            alphaSlider: '투명도'
        },
        appearance: {
            tabIcon: '아이콘',
            tabColor: '색상',
            tabBackground: '배경',
            resetIcon: '아이콘 제거',
            resetColor: '색상 제거',
            resetBackground: '배경 제거',
            clear: '스타일 지우기',
            apply: '적용'
        },
        selectVaultProfile: {
            title: '보관함 프로필 선택',
            currentBadge: '활성',
            emptyState: '사용 가능한 보관함 프로필이 없습니다.'
        },
        tagOperation: {
            renameTitle: '태그 {tag} 이름 변경',
            deleteTitle: '태그 {tag} 삭제',
            newTagPrompt: '새 태그 이름',
            newTagPlaceholder: '새 태그 이름 입력',
            renameWarning: '태그 {oldTag}의 이름을 변경하면 {count}개의 {files}이(가) 수정됩니다.',
            deleteWarning: '태그 {tag}을(를) 삭제하면 {count}개의 {files}이(가) 수정됩니다.',
            modificationWarning: '파일 수정 날짜가 업데이트됩니다.',
            affectedFiles: '영향받는 파일:',
            andMore: '...그리고 {count}개 더',
            confirmRename: '태그 이름 변경',
            renameUnchanged: '{tag} 변경 없음',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            renameBatchNotFinalized:
                '{renamed}/{total} 이름 변경됨. 업데이트되지 않음: {notUpdated}. 메타데이터와 바로가기가 업데이트되지 않았습니다.',
            invalidTagName: '유효한 태그 이름을 입력하세요.',
            descendantRenameError: '태그를 자신 또는 하위 태그로 이동할 수 없습니다.',
            confirmDelete: '태그 삭제',
            deleteBatchNotFinalized:
                '{removed}/{total}에서 제거됨. 업데이트되지 않음: {notUpdated}. 메타데이터와 바로가기가 업데이트되지 않았습니다.',
            checkConsoleForDetails: '자세한 내용은 콘솔을 확인하세요.',
            file: '파일',
            files: '파일',
            inlineParsingWarning: {
                title: '인라인 태그 호환성',
                message:
                    '{tag}에 Obsidian이 인라인 태그에서 구문 분석할 수 없는 문자가 포함되어 있습니다. Frontmatter 태그는 영향을 받지 않습니다.',
                confirm: '그래도 사용'
            }
        },
        propertyOperation: {
            renameTitle: '속성 {property} 이름 변경',
            deleteTitle: '속성 {property} 삭제',
            newKeyPrompt: '새 속성 이름',
            newKeyPlaceholder: '새 속성 이름 입력',
            renameWarning: '속성 {property}의 이름을 변경하면 {count}개의 {files}이(가) 수정됩니다.',
            renameConflictWarning:
                '속성 {newKey}이(가) 이미 {count}개의 {files}에 존재합니다. {oldKey}의 이름을 변경하면 기존 {newKey} 값이 대체됩니다.',
            deleteWarning: '속성 {property}을(를) 삭제하면 {count}개의 {files}이(가) 수정됩니다.',
            confirmRename: '속성 이름 변경',
            confirmDelete: '속성 삭제',
            renameNoChanges: '{oldKey} → {newKey} (변경 없음)',
            renameSettingsUpdateFailed: '속성 {oldKey} → {newKey} 이름 변경됨. 설정 업데이트에 실패했습니다.',
            deleteSingleSuccess: '1개의 노트에서 속성 {property} 삭제됨',
            deleteMultipleSuccess: '{count}개의 노트에서 속성 {property} 삭제됨',
            deleteSettingsUpdateFailed: '속성 {property} 삭제됨. 설정 업데이트에 실패했습니다.',
            invalidKeyName: '유효한 속성 이름을 입력하세요.'
        },
        fileSystem: {
            newFolderTitle: '새 폴더',
            renameFolderTitle: '폴더 이름 변경',
            renameFileTitle: '파일 이름 변경',
            deleteFolderTitle: "'{name}'을(를) 삭제하시겠습니까?",
            deleteFileTitle: "'{name}'을(를) 삭제하시겠습니까?",
            deleteFileAttachmentsTitle: '파일 첨부 파일을 삭제하시겠습니까?',
            moveFileConflictTitle: '이동 충돌',
            folderNamePrompt: '폴더 이름 입력:',
            hideInOtherVaultProfiles: '다른 보관함 프로필에서 숨기기',
            renamePrompt: '새 이름 입력:',
            renameVaultTitle: '보관함 표시 이름 변경',
            renameVaultPrompt: '사용자 지정 표시 이름 입력 (기본값을 사용하려면 비워두세요):',
            deleteFolderConfirm: '이 폴더와 모든 내용을 삭제하시겠습니까?',
            deleteFileConfirm: '이 파일을 삭제하시겠습니까?',
            deleteFileAttachmentsDescriptionSingle: '이 첨부 파일은 더 이상 어떤 노트에서도 사용되지 않습니다. 삭제하시겠습니까?',
            deleteFileAttachmentsDescriptionMultiple: '이 첨부 파일들은 더 이상 어떤 노트에서도 사용되지 않습니다. 삭제하시겠습니까?',
            deleteFileAttachmentsViewFileTreeAriaLabel: '파일 트리',
            deleteFileAttachmentsViewGalleryAriaLabel: '갤러리',
            moveFileConflictDescriptionSingle: '"{folder}"에서 파일 충돌이 발견되었습니다.',
            moveFileConflictDescriptionMultiple: '"{folder}"에서 {count}개의 파일 충돌이 발견되었습니다.',
            moveFileConflictAffectedFiles: '영향받는 파일',
            moveFileConflictItem: '"{name}" -> "{suggested}"{renameOnly}',
            moveFileConflictRenameOnly: '(이름 변경만)',
            moveFileConflictRename: '이름 변경',
            moveFileConflictOverwrite: '덮어쓰기',
            removeAllTagsTitle: '모든 태그 제거',
            removeAllTagsFromNote: '이 노트에서 모든 태그를 제거하시겠습니까?',
            removeAllTagsFromNotes: '{count}개의 노트에서 모든 태그를 제거하시겠습니까?'
        },
        folderNoteType: {
            title: '폴더 노트 형식 선택',
            folderLabel: '폴더: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `${name}을(를) 폴더로 이동...`,
            multipleFilesLabel: (count: number) => `${count}개의 파일`,
            navigatePlaceholder: '폴더로 이동...',
            instructions: {
                navigate: '이동',
                move: '이동',
                select: '선택',
                dismiss: '닫기'
            }
        },
        homepage: {
            placeholder: '파일 검색...',
            instructions: {
                navigate: '이동',
                select: '홈페이지 설정',
                dismiss: '닫기'
            }
        },
        calendarTemplate: {
            placeholder: '템플릿 검색...',
            instructions: {
                navigate: '이동',
                select: '템플릿 선택',
                dismiss: '닫기'
            }
        },
        navigationBanner: {
            placeholder: '이미지 검색...',
            svgMissingDimensions: '선택한 SVG 파일에 너비, 높이 또는 viewBox가 정의되어 있지 않습니다.',
            instructions: {
                navigate: '이동',
                select: '배너 설정',
                dismiss: '닫기'
            }
        },
        tagSuggest: {
            navigatePlaceholder: '태그로 이동...',
            addPlaceholder: '추가할 태그 검색...',
            removePlaceholder: '제거할 태그 선택...',
            createNewTag: '새 태그 생성: #{tag}',
            instructions: {
                navigate: '이동',
                select: '선택',
                dismiss: '닫기',
                add: '태그 추가',
                remove: '태그 제거'
            }
        },
        propertySuggest: {
            placeholder: '속성 키 선택...',
            navigatePlaceholder: '속성으로 이동...',
            instructions: {
                navigate: '이동',
                select: '속성 추가',
                dismiss: '닫기'
            }
        },
        propertyKeyVisibility: {
            title: '속성 키 표시 설정',
            description:
                '속성 값이 표시되는 위치를 제어합니다. 열은 탐색 창, 목록 창, 파일 컨텍스트 메뉴에 해당합니다. 하단 행을 사용하여 열의 모든 행을 전환합니다.',
            searchPlaceholder: '속성 키 검색...',
            propertyColumnLabel: '속성',
            showInNavigation: '탐색에 표시',
            showInList: '목록에 표시',
            showInFileMenu: '파일 메뉴에 표시',
            toggleAllInNavigation: '탐색에서 모두 전환',
            toggleAllInList: '목록에서 모두 전환',
            toggleAllInFileMenu: '파일 메뉴에서 모두 전환',
            applyButton: '적용',
            emptyState: '속성 키를 찾을 수 없습니다.'
        },
        welcome: {
            title: '{pluginName}에 오신 것을 환영합니다',
            introText:
                '안녕하세요. Obsidian을 위한 더 나은 파일 브라우저이자 캘린더인 Notebook Navigator에 오신 것을 환영합니다. 시작하기 전에 아래의 Mastering Notebook Navigator 영상에서 적어도 처음 세 챕터는 꼭 시청해 보시길 권합니다. 두 창이 어떻게 작동하는지 소개하고 빠르게 사용을 시작할 수 있도록 안내합니다.',
            continueText:
                '10분 정도 더 여유가 있다면 초기 설정과 일상 사용 흐름 챕터도 이어서 시청하세요. 시작에 필요한 내용을 모두 익힌 뒤, 나중에 돌아와 자세한 내용을 더 볼 수 있습니다. 영상 링크는 Notebook Navigator 설정 상단에서도 찾을 수 있습니다.',
            thanksText: 'Notebook Navigator를 즐겁게 사용하세요!',
            videoAlt: 'Notebook Navigator 3 마스터하기',
            openVideoButton: '비디오 재생',
            closeButton: '나중에'
        }
    },

    // File system operations
    fileSystem: {
        errors: {
            createFolder: '폴더 생성 실패: {error}',
            createFile: '파일 생성 실패: {error}',
            renameFolder: '폴더 이름 변경 실패: {error}',
            renameFolderNoteConflict: '이름 변경 불가: 이 폴더에 "{name}"이(가) 이미 존재합니다',
            renameFile: '파일 이름 변경 실패: {error}',
            deleteFolder: '폴더 삭제 실패: {error}',
            deleteFile: '파일 삭제 실패: {error}',
            deleteAttachments: '첨부 파일 삭제 실패: {error}',
            mergeNotes: '노트 병합 실패: {error}',
            mergeNotesOpenOutput: '병합된 노트가 {name}(으)로 생성되었지만 열 수 없습니다: {error}. 원본 노트는 변경되지 않았습니다.',
            mergeNotesOpenSkipped: '다른 파일 열기 요청이 우선되었습니다.',
            mergeNotesTrashSources: '병합된 노트가 생성되었습니다. 원본 노트 {count}개를 휴지통으로 이동하지 못했습니다.',
            duplicateNote: '노트 복제 실패: {error}',
            duplicateFolder: '폴더 복제 실패: {error}',
            openVersionHistory: '버전 기록 열기 실패: {error}',
            versionHistoryNotFound: '버전 기록 명령을 찾을 수 없습니다. Obsidian Sync가 활성화되어 있는지 확인하세요.',
            revealInExplorer: '시스템 탐색기에서 파일 표시 실패: {error}',
            openInDefaultApp: '기본 앱에서 열기 실패: {error}',
            openInDefaultAppNotAvailable: '이 플랫폼에서는 기본 앱에서 열기를 사용할 수 없습니다',
            folderNoteAlreadyExists: '폴더 노트가 이미 존재합니다',
            folderAlreadyExists: '폴더 "{name}"이(가) 이미 존재합니다',
            folderNotesDisabled: '파일을 변환하려면 설정에서 폴더 노트를 활성화하세요',
            folderNoteAlreadyLinked: '이 파일은 이미 폴더 노트로 작동하고 있습니다',
            folderNoteNotFound: '선택한 폴더에 폴더 노트가 없습니다',
            folderNoteUnsupportedExtension: '지원되지 않는 파일 확장자: {extension}',
            folderNoteMoveFailed: '변환 중 파일 이동 실패: {error}',
            folderNoteRenameConflict: '폴더에 "{name}" 파일이 이미 존재합니다',
            folderNoteConversionFailed: '폴더 노트로 변환 실패',
            folderNoteConversionFailedWithReason: '폴더 노트로 변환 실패: {error}',
            folderNoteOpenFailed: '파일은 변환되었지만 폴더 노트 열기 실패: {error}',
            failedToDeleteFile: '{name} 삭제 실패: {error}',
            failedToDeleteMultipleFiles: '{count}개의 파일 삭제 실패',
            versionHistoryNotAvailable: '버전 기록 서비스를 사용할 수 없습니다',
            drawingAlreadyExists: '이 이름의 드로잉이 이미 존재합니다',
            failedToCreateDrawing: '드로잉 생성 실패',
            noFolderSelected: 'Notebook Navigator에서 선택된 폴더가 없습니다',
            noFileSelected: '선택된 파일이 없습니다'
        },
        warnings: {
            linkBreakingNameCharacters: '이 이름에는 Obsidian 링크를 깨뜨리는 문자가 포함되어 있습니다: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: '이름은 . 로 시작할 수 없고 : 또는 / 를 포함할 수 없습니다.',
            forbiddenNameCharactersWindows: 'Windows에서 예약된 문자는 허용되지 않습니다: <, >, ", \\, |, ?, *.'
        },
        notices: {
            folderExcludedFromDescendants: '상위 폴더 목록에서 숨김: {name}',
            folderIncludedInDescendants: '상위 폴더 목록에 표시됨: {name}',
            mergeNotes: '{count}개 노트를 {name}에 병합했습니다'
        },
        notifications: {
            deletedMultipleFiles: '{count}개의 파일이 삭제됨',
            movedMultipleFiles: '{count}개의 파일이 {folder}(으)로 이동됨',
            folderNoteConversionSuccess: '"{name}"에서 파일을 폴더 노트로 변환함',
            folderMoved: '폴더 "{name}"이(가) 이동됨',
            deepLinkCopied: 'Obsidian URL이 클립보드에 복사됨',
            pathCopied: '경로가 클립보드에 복사됨',
            relativePathCopied: '상대 경로가 클립보드에 복사됨',
            linkCopied: '링크가 클립보드에 복사됨',
            footnoteLinkCopied: '각주 링크가 클립보드에 복사됨',
            embedLinkCopied: '임베드 링크가 클립보드에 복사됨',
            tagAddedToNote: '1개의 노트에 태그 추가됨',
            tagAddedToNotes: '{count}개의 노트에 태그 추가됨',
            tagRemovedFromNote: '1개의 노트에서 태그 제거됨',
            tagRemovedFromNotes: '{count}개의 노트에서 태그 제거됨',
            tagsClearedFromNote: '1개의 노트에서 모든 태그 제거됨',
            tagsClearedFromNotes: '{count}개의 노트에서 모든 태그 제거됨',
            noTagsToRemove: '제거할 태그 없음',
            noFilesSelected: '선택된 파일 없음',
            mergeNotesRequireMultipleMarkdown: '병합할 Markdown 노트를 두 개 이상 선택하세요',
            tagOperationsNotAvailable: '태그 작업을 사용할 수 없음',
            propertyOperationsNotAvailable: '속성 작업을 사용할 수 없습니다',
            tagsRequireMarkdown: '태그는 마크다운 노트에서만 지원됩니다',
            propertiesRequireMarkdown: '속성은 Markdown 노트에서만 지원됩니다',
            propertySetOnNote: '1개 노트의 속성을 업데이트했습니다',
            propertySetOnNotes: '{count}개 노트의 속성을 업데이트했습니다',
            manualSortPropertyRemovedFromNote: '1개 노트에서 정렬 속성을 제거했습니다',
            manualSortPropertyRemovedFromNotes: '{count}개 노트에서 정렬 속성을 제거했습니다',
            iconPackDownloaded: '{provider} 다운로드됨',
            iconPackUpdated: '{provider} 업데이트됨 ({version})',
            iconPackRemoved: '{provider} 제거됨',
            iconPackLoadFailed: '{provider} 로드에 실패했습니다',
            hiddenFileReveal: '파일이 숨겨져 있습니다. 표시하려면 "숨겨진 항목 표시"를 활성화하세요'
        },
        confirmations: {
            deleteMultipleFiles: '{count}개의 파일을 삭제하시겠습니까?',
            deleteConfirmation: '이 작업은 취소할 수 없습니다.'
        },
        defaultNames: {
            untitled: '무제'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: '폴더를 자기 자신이나 하위 폴더로 이동할 수 없습니다.',
            itemAlreadyExists: '이 위치에 "{name}"이(가) 이미 존재합니다.',
            failedToMove: '이동 실패: {error}',
            failedToAddTag: '태그 "{tag}" 추가 실패',
            failedToSetProperty: '속성 업데이트 실패: {error}',
            failedToClearTags: '태그 지우기 실패',
            failedToMoveFolder: '폴더 "{name}" 이동 실패',
            failedToImportFiles: '가져오기 실패: {names}'
        },
        notifications: {
            filesAlreadyExist: '대상에 {count}개의 파일이 이미 존재합니다',
            filesAlreadyHaveTag: '{count}개의 파일이 이미 이 태그나 더 구체적인 태그를 가지고 있습니다',
            filesAlreadyHaveProperty: '{count}개 파일에 이미 이 속성이 있습니다',
            noTagsToClear: '지울 태그 없음',
            fileImported: '1개의 파일 가져옴',
            filesImported: '{count}개의 파일 가져옴'
        }
    },

    // Date grouping
    dateGroups: {
        future: '미래',
        today: '오늘',
        yesterday: '어제',
        previous7Days: '지난 7일',
        previous30Days: '지난 30일'
    },

    // Plugin commands
    commands: {
        open: '열기', // Command palette: Opens the Notebook Navigator view (English: Open)
        toggleLeftSidebar: '왼쪽 사이드바 전환', // Command palette: Toggles left sidebar, opening Notebook Navigator when uncollapsing (English: Toggle left sidebar)
        openHomepage: '홈페이지 열기', // Command palette: Opens the Notebook Navigator view and loads the homepage file (English: Open homepage)
        openDailyNote: '일일 노트 열기',
        openWeeklyNote: '주간 노트 열기',
        openMonthlyNote: '월간 노트 열기',
        openQuarterlyNote: '분기 노트 열기',
        openYearlyNote: '연간 노트 열기',
        revealFile: '파일 표시', // Command palette: Reveals and selects the currently active file in the navigator (English: Reveal file)
        search: '검색', // Command palette: Toggle search in the file list (English: Search)
        searchVaultRoot: '보관함 전체 검색', // Command palette: Selects the vault root folder and focuses search with subfolders included (English: Search whole vault)
        toggleDualPane: '이중 창 레이아웃 전환', // Command palette: Toggles between single-pane and dual-pane layout (English: Toggle dual pane layout)
        toggleDualPaneOrientation: '이중 창 방향 전환', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: '캘린더 전환', // Command palette: Toggles showing the calendar overlay in the navigation pane (English: Toggle calendar)
        selectVaultProfile: '보관함 프로필 선택', // Command palette: Opens a modal to choose a different vault profile (English: Switch vault profile)
        selectVaultProfile1: '보관함 프로필 1 선택', // Command palette: Activates the first vault profile without opening the modal (English: Select vault profile 1)
        selectVaultProfile2: '보관함 프로필 2 선택', // Command palette: Activates the second vault profile without opening the modal (English: Select vault profile 2)
        selectVaultProfile3: '보관함 프로필 3 선택', // Command palette: Activates the third vault profile without opening the modal (English: Select vault profile 3)
        deleteFile: '파일 삭제', // Command palette: Deletes the currently active file (English: Delete file)
        createNewNote: '새 노트 만들기', // Command palette: Creates a new note in the currently selected folder (English: Create new note)
        createNewNoteFromTemplate: '템플릿으로 새 노트 만들기', // Command palette: Creates a new note from a template in the currently selected folder (English: Create new note from template)
        moveFiles: '파일 이동', // Command palette: Move selected files to another folder (English: Move files)
        mergeNotes: '노트 병합', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: '다음 파일 선택', // Command palette: Selects the next file in the current view (English: Select next file)
        selectPreviousFile: '이전 파일 선택', // Command palette: Selects the previous file in the current view (English: Select previous file)
        navigateBack: '뒤로 이동',
        navigateForward: '앞으로 이동',
        convertToFolderNote: '폴더 노트로 변환', // Command palette: Converts the active file into a folder note with a new folder (English: Convert to folder note)
        setAsFolderNote: '폴더 노트로 설정', // Command palette: Renames the active file to its folder note name (English: Set as folder note)
        detachFolderNote: '폴더 노트 해제', // Command palette: Renames the active folder note to a new name (English: Detach folder note)
        pinAllFolderNotes: '폴더 노트를 모두 고정', // Command palette: Pins all folder notes to shortcuts (English: Pin all folder notes)
        navigateToFolder: '폴더로 이동', // Command palette: Navigate to a folder using fuzzy search (English: Navigate to folder)
        navigateToTag: '태그로 이동', // Command palette: Navigate to a tag using fuzzy search (English: Navigate to tag)
        navigateToProperty: '속성으로 이동', // Command palette: Navigate to a property key or value using fuzzy search (English: Navigate to property)
        addShortcut: '바로가기에 추가', // Command palette: Adds or removes the current file, folder, tag, or property from shortcuts (English: Add to shortcuts)
        openShortcut: '바로가기 {number} 열기',
        toggleDescendants: '하위 항목 전환', // Command palette: Toggles showing notes from descendants (English: Toggle descendants)
        toggleHidden: '숨긴 폴더, 태그, 노트 전환', // Command palette: Toggles showing hidden items (English: Toggle hidden items)
        toggleTagSort: '태그 정렬 전환', // Command palette: Toggles between alphabetical and frequency tag sorting (English: Toggle tag sort order)
        toggleTagsBySelection: '선택에 따라 태그 전환',
        togglePropertiesBySelection: '선택에 따라 속성 전환',
        toggleCompactMode: '컴팩트 모드 전환', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: '고정 섹션 전환',
        collapseExpand: '모든 탐색 항목 접기 / 펼치기', // Command palette: Collapse or expand all folders and tags (English: Collapse / expand all navigation items)
        collapseExpandListGroups: '모든 목록 그룹 접기 / 펼치기',
        collapseExpandSelectedItem: '선택한 항목 접기 / 펼치기',
        addTag: '선택한 파일에 태그 추가', // Command palette: Opens a dialog to add a tag to selected files (English: Add tag to selected files)
        setProperty: '선택한 파일에 속성 설정', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: '선택한 파일에서 태그 제거', // Command palette: Opens a dialog to remove a tag from selected files (English: Remove tag from selected files)
        removeAllTags: '선택한 파일에서 모든 태그 제거', // Command palette: Removes all tags from selected files (English: Remove all tags from selected files)
        openAllFiles: '모든 파일 열기', // Command palette: Opens all files in the current folder or tag (English: Open all files)
        rebuildCache: '캐시 다시 빌드', // Command palette: Rebuilds the local Notebook Navigator cache (English: Rebuild cache)
        restoreDefaultSettings: '기본 설정 복원' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator', // Name shown in the view header/tab (English: Notebook Navigator)
        calendarViewName: '캘린더', // Name shown in the view header/tab (English: Calendar)
        folderNoteSidebarViewName: '폴더 노트', // Name shown in the folder note sidebar tab (English: Folder note)
        ribbonTooltip: 'Notebook Navigator', // Tooltip for the ribbon icon in the left sidebar (English: Notebook Navigator)
        revealInNavigator: 'Notebook Navigator에서 표시', // Context menu item to reveal a file in the navigator (English: Reveal in Notebook Navigator)
        settingsUnavailableNotice:
            'Notebook Navigator가 설정을 읽을 수 없어 시작되지 않았습니다. 보관함이 동기화 중이라면 동기화가 끝난 후 Obsidian을 다시 시작하세요. 기본 설정으로 새로 시작하려면 "기본 설정 복원" 명령을 실행하세요.', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsMissingConfirm: {
            title: '기본 설정으로 시작하시겠습니까?', // Title of the dialog shown when the plugin is enabled while its settings file is missing (English: Start with default settings?)
            messageRecentInstall:
                'Notebook Navigator가 방금 설치되었고 설정 파일이 없습니다. 새로 설치했거나 다시 설치한 경우 기본 설정으로 계속하세요. 설정이 동기화 서비스에서 오는 경우 취소하고 동기화가 끝날 때까지 기다린 후 Obsidian을 다시 시작하세요.', // Dialog message when the plugin folder was written recently (English: Notebook Navigator was just installed and has no settings file. If this is a new install or a reinstall, continue with default settings. If your settings come from a sync service, cancel, wait for the sync to complete, and restart Obsidian.)
            messageExistingInstall:
                'Notebook Navigator가 이 기기에 설치된 지 시간이 지났지만 설정 파일이 없습니다. 보관함이 아직 동기화 중이라면 취소하고 동기화가 끝난 후 Obsidian을 다시 시작하면 기존 설정을 유지할 수 있습니다. 기본 설정으로 새로 시작하려는 경우에만 계속하세요.', // Dialog message when the plugin folder has existed for a while (English: Notebook Navigator has been installed on this device for a while, but its settings file is missing. If your vault is still syncing, cancel, wait for the sync to complete, and restart Obsidian to keep your existing settings. Continue only to start over with default settings.)
            confirmButton: '기본 설정 사용' // Confirm button label in the missing-settings dialog (English: Use default settings)
        },
        settingsRecovery: {
            confirmTitle: '기본 설정 복원', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'Notebook Navigator 설정 파일을 기본 설정으로 교체합니다. 보관함이 아직 동기화 중이라면 복원된 기본 설정이 다른 기기에 저장된 설정을 덮어쓸 수 있습니다. 읽을 수 있는 설정 파일은 교체 전에 플러그인 폴더의 타임스탬프가 포함된 백업으로 복사됩니다.', // Body of the confirmation dialog for the settings recovery command
            confirmButton: '기본값 복원', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: '설정 복원을 완료할 수 없습니다. 로컬 환경설정은 유지되었습니다.', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: '기본 설정이 복원되었습니다. 완료하려면 Obsidian을 다시 시작하세요.' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: '마지막 수정',
        createdAt: '생성됨',
        file: '파일',
        files: '파일',
        folder: '폴더',
        folders: '폴더',
        wordCount: '단어 수',
        unfinishedTasks: '미완료 작업'
    },

    fileCounts: {
        words: '{count}개 단어',
        characters: '{count}자',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: '기본 설정 변경',
        metadataReport: {
            exportSuccess: '메타데이터 오류 보고서를 내보냈습니다: {filename}',
            exportFailed: '메타데이터 보고서 내보내기 실패'
        },
        index: {
            label: '일반',
            description: '릴리스 노트, 지원, 보관함 프로필, 파일 유형, 속성 키.',
            groups: {
                about: '정보'
            }
        },
        pageGroups: {
            configuration: '구성',
            navigationPane: '탐색 창',
            listPane: '목록 창',
            calendarAndTools: '달력 및 도구'
        },
        pages: {
            displayFilters: {
                label: '표시 필터',
                description: '숨겨진 폴더, 태그, 파일, 파일 태그 및 속성 규칙.'
            },
            appearanceAndBehavior: {
                label: '모양 및 동작',
                description: '동작, 키보드 탐색, 마우스 버튼, 모양 및 서식.',
                groups: {
                    startup: '시작',
                    keyboardNavigation: '키보드 탐색',
                    mouseButtons: '마우스 버튼',
                    desktopAppearance: '데스크톱 모양',
                    mobileAppearance: '모바일 모양',
                    appearance: '모양',
                    icons: '아이콘',
                    formatting: '서식'
                }
            },
            navigationPane: {
                label: '탐색 창',
                description: '레이아웃, 모양, 파일 수, 접기 동작 및 무지개 색상.',
                groups: {
                    appearance: '모양',
                    banner: '배너',
                    collapseItems: '항목 접기',
                    dragAndDrop: '끌어서 놓기',
                    fileCounts: '파일 수',
                    rainbowColors: '무지개 색상'
                }
            },
            shortcutsAndRecentFiles: {
                label: '바로가기 및 최근 파일',
                description: '바로가기 표시, 배지, 최근 파일 및 고정된 항목.',
                groups: {
                    shortcuts: '바로가기',
                    recentFiles: '최근 파일'
                }
            },
            foldersAndFolderNotes: {
                label: '폴더 및 폴더 노트',
                description: '폴더 표시, 폴더 노트, 폴더 노트 템플릿 및 폴더 노트 동작.',
                groups: {
                    folders: '폴더',
                    folderNotes: '폴더 노트',
                    folderNoteFiles: '폴더 노트 파일'
                }
            },
            tagsAndProperties: {
                label: '태그 및 속성',
                description: '태그 및 속성 섹션, 아이콘, 정렬, 범위 및 상속.',
                groups: {
                    tags: '태그',
                    properties: '속성'
                }
            },
            listPane: {
                label: '목록 창',
                description: '정렬, 그룹화, 목록 모드, 고정된 노트 및 그림 미리보기.',
                groups: {
                    appearance: '모양',
                    sortAndGroup: '정렬 및 그룹화',
                    groupHeaders: '그룹 머리글',
                    manualSort: '수동 정렬',
                    pinnedNotes: '고정된 노트',
                    behavior: '동작',
                    drawingPreviews: '그림 미리보기'
                }
            },
            fileOperations: {
                label: '파일 작업',
                description: '템플릿, 삭제 확인, 첨부 파일 및 파일 이동 충돌 동작.',
                groups: {
                    templates: '템플릿'
                }
            },
            frontmatterFields: {
                label: 'frontmatter 필드',
                description: '표시 이름, 타임스탬프, 아이콘, 색상에 대한 frontmatter 필드.'
            },
            fileDisplay: {
                label: '파일 표시',
                description: '제목, 미리보기 텍스트, 대표 이미지, 태그, 속성, 날짜, 단어 수 및 문자 수.',
                groups: {
                    icon: '아이콘',
                    title: '제목',
                    previewText: '미리보기 텍스트',
                    featureImage: '대표 이미지',
                    tags: '태그',
                    properties: '속성',
                    tasks: '작업',
                    date: '날짜',
                    parentFolder: '상위 폴더',
                    wordAndCharacterCount: '단어 및 문자 수'
                }
            },
            calendar: {
                label: '달력',
                description: '달력 표시, 날짜 노트, 템플릿, 로케일 및 사이드바 위치.',
                groups: {
                    appearance: '모양',
                    leftSidebar: '왼쪽 사이드바',
                    calendarIntegration: '캘린더 연동',
                    rightSidebar: '오른쪽 사이드바'
                }
            },
            iconPacks: {
                label: '아이콘 팩',
                description: '인터페이스 아이콘, 파일 아이콘 및 아이콘 팩 관리.'
            },
            advanced: {
                label: '고급',
                description: '진단, 메타데이터 정리, 가져오기/내보내기 및 초기화.',
                groups: {
                    maintenance: '유지 관리',
                    resetSettings: '설정 초기화'
                }
            }
        },
        syncMode: {
            notSynced: '(동기화되지 않음)',
            enableSync: '동기화 활성화',
            disableSync: '동기화 비활성화'
        },
        items: {
            listPaneTitle: {
                name: '목록 창 제목',
                desc: '목록 창 제목을 표시할 위치를 선택하세요.',
                options: {
                    header: '헤더에 표시',
                    listPane: '목록 창에 표시',
                    hidden: '표시하지 않음'
                }
            },
            defaultSortOrder: {
                name: '기본 정렬 순서',
                desc: '노트의 기본 정렬 순서를 선택하세요. 정렬에 사용할 속성의 속성이 추가 정렬 옵션으로 표시됩니다.',
                directions: {
                    asc: '오름차순',
                    desc: '내림차순'
                },
                dateDirections: {
                    newestOnTop: '최신 상위',
                    oldestOnTop: '오래된 상위'
                },
                textDirections: {
                    aOnTop: '가나다 상위',
                    zOnTop: '역순 상위'
                },
                fields: {
                    dateEdited: '수정 날짜',
                    dateCreated: '생성 날짜',
                    title: '제목',
                    fileName: '파일 이름',
                    property: '속성'
                }
            },
            defaultSortDirection: {
                name: '정렬 방향'
            },
            defaultGroupingDirection: {
                name: '그룹화 방향',
                options: {
                    follow: '정렬 순서 따르기'
                }
            },
            sortingProperties: {
                name: '정렬에 사용할 속성',
                desc: '쉼표로 구분된 frontmatter 속성입니다. 각 속성은 기본 정렬 순서 설정과 목록 창의 정렬 메뉴에 정렬 옵션으로 표시됩니다. 이 속성들은 변경되지 않습니다.',
                placeholder: 'published, author',
                defaultsResetNotices: {
                    sort: '속성을 더 이상 사용할 수 없어 기본 정렬 순서가 초기화되었습니다.',
                    grouping: '속성을 더 이상 사용할 수 없어 기본 그룹화가 초기화되었습니다.',
                    both: '속성을 더 이상 사용할 수 없어 기본 정렬 순서와 기본 그룹화가 초기화되었습니다.'
                }
            },
            propertySecondarySort: {
                name: '보조 정렬',
                desc: '속성 정렬 사용 시 노트의 속성 값이 같거나 속성 값이 없을 때 적용됩니다.',
                options: {
                    title: '제목',
                    fileName: '파일 이름',
                    dateCreated: '생성 날짜',
                    dateEdited: '편집 날짜'
                }
            },
            propertySortInstructions: {
                intro: '속성을 기준으로 정렬하고 그룹화하는 방식:',
                items: [
                    '**정렬:** 우선순위와 같은 속성을 선택하면 각 노트의 우선순위 값에 따라 정렬됩니다.',
                    '**그룹화:** 상태와 같은 속성을 선택하면 상태 값마다 머리글이 만들어집니다. 상태가 같은 노트는 같은 머리글 아래에 표시됩니다.',
                    '**여러 값:** 속성에 목록이 포함된 경우 Notebook Navigator는 전체 목록을 사용합니다. 예를 들어 주제에 책과 역사가 포함되어 있으면 각 주제를 따로 처리하지 않고 “책, 역사”를 사용하여 노트를 정렬하거나 그룹화합니다.',
                    '**누락된 값:** 그룹화할 때 속성이 없는 노트는 마지막의 **없음** 아래에 표시됩니다.',
                    '**태그 및 속성 보기:** **폴더** 그룹화를 선택하면 날짜 머리글이 대신 표시됩니다.'
                ]
            },
            groupingProperties: {
                name: '그룹화에 사용할 속성',
                desc: '쉼표로 구분된 frontmatter 속성입니다. 각 속성은 기본 그룹화 설정과 목록 창의 정렬 메뉴에 그룹화 옵션으로 표시됩니다. 이 속성들은 변경되지 않습니다.',
                placeholder: 'status, genre'
            },
            manualSortProperty: {
                name: '수동 정렬 속성',
                desc: '수동 정렬에서 숫자 인덱스 값을 저장하는 데 사용되는 frontmatter 속성입니다.'
            },
            groupHeaderProperty: {
                name: '그룹 머리글 속성',
                desc: '사용자 지정 그룹 머리글을 저장하는 데 사용되는 frontmatter 속성입니다.'
            },
            groupHeadersInstructions: {
                intro: '사용자 지정 그룹 머리글은 목록 창에서 노트 위에 표시됩니다.',
                items: [
                    '목록 창의 정렬 메뉴에서 그룹화를 **사용자 지정**으로 설정합니다.',
                    '노트를 마우스 오른쪽 버튼으로 클릭하고 **그룹 머리글 설정**을 선택하여 노트 위에 머리글을 추가합니다.'
                ]
            },
            manualSortNewNotePlacement: {
                name: '새 노트 배치',
                desc: '현재 목록이 수동 정렬을 사용할 때 새 노트가 배치될 위치를 선택하세요.',
                options: {
                    top: '상단',
                    bottom: '하단',
                    belowSelectedNote: '선택한 노트 아래',
                    unsorted: '정렬되지 않음'
                }
            },
            confirmBeforeManualSort: {
                name: '수동 정렬 전 확인',
                desc: '수동 정렬 속성을 처음으로 노트에 기록하기 전에 경고를 표시합니다. 비활성화하면 노트는 경고 없이 속성을 받습니다.'
            },
            manualSortInstructions: {
                intro: '수동 정렬은 각 노트의 frontmatter 속성에 숫자 인덱스 값을 기록합니다. 인덱스가 없는 노트는 정렬되지 않음 아래에 표시됩니다.',
                items: [
                    '정렬 메뉴에서 **수동 정렬**을 선택하여 수동 정렬을 활성화합니다. 그 후 노트를 재정렬하는 두 가지 방법이 있습니다.',
                    '정렬 메뉴에서 **정렬 순서 편집...**을 선택하여 재정렬 보기를 엽니다. 마우스로, 또는 모바일에서는 터치로 노트를 드래그합니다. 데스크톱에서는 **Cmd/Ctrl** 또는 **Shift** 클릭으로 여러 노트를 선택한 다음, 그 중 하나를 드래그하여 전체 그룹을 이동합니다.',
                    '목록 창에서 한 노트를 선택하거나 여러 노트를 다중 선택한 다음, **Cmd/Ctrl + Arrow Up/Down**을 눌러 선택 항목을 위아래로 이동합니다.'
                ]
            },
            scrollToSelectedFileOnListChanges: {
                name: '목록 변경 시 선택된 파일로 스크롤',
                desc: '노트 고정, 하위 노트 표시, 폴더 모양 변경 또는 파일 작업 실행 시 선택된 파일로 스크롤합니다.'
            },
            includeDescendantNotes: {
                name: '하위 폴더 / 하위 항목 노트 표시',
                desc: '폴더, 태그 또는 속성을 볼 때 중첩된 하위 폴더와 태그 및 속성 하위 항목의 노트를 포함합니다.'
            },
            filterPinnedNotesByFolder: {
                name: '노트를 해당 폴더에서만 고정',
                desc: '고정된 노트는 자신의 폴더에서만 고정된 것으로 표시됩니다. 폴더 노트이거나 고정된 노트가 많을 때 유용합니다. 태그 또는 속성 보기에는 영향을 주지 않습니다.'
            },
            separateFileCounts: {
                name: '현재와 하위 파일 수를 별도로 표시',
                desc: '폴더, 태그, 속성의 파일 수를 "현재 ▾ 하위" 형식으로 표시합니다.'
            },
            defaultGrouping: {
                name: '기본 그룹화',
                desc: '**머리글**은 순서를 바꾸지 않고 정렬된 목록에 표시를 더합니다. 사용자 지정은 frontmatter에 정의된 머리글을 표시하고, 날짜는 날짜 머리글을 삽입합니다. **그룹**은 목록을 다시 정렬합니다. 폴더와 속성 그룹은 자체적으로 정렬되며 각 그룹 내의 노트는 정렬 순서를 따릅니다.',
                families: {
                    headers: '머리글',
                    groups: '그룹'
                },
                options: {
                    custom: '사용자 지정',
                    date: '날짜',
                    folder: '폴더'
                }
            },
            alwaysShowAllTagAndPropertyPills: {
                name: '태그 및 속성 배지를 항상 표시',
                desc: '비활성화하면 현재 탐색 선택과 일치하는 배지가 숨겨집니다(예: "레시피" 태그를 탐색할 때 "레시피" 태그 배지가 숨겨짐). 활성화하면 모든 배지가 항상 표시됩니다.'
            },
            stickyGroupHeaders: {
                name: '그룹 머리글 고정',
                desc: '스크롤하는 동안 현재 날짜, 폴더, 속성 또는 고정된 섹션 헤더를 계속 표시합니다.'
            },
            showSubfolderPaths: {
                name: '하위 폴더 경로 표시',
                desc: '목록 창에서 폴더별로 그룹화할 때 폴더 이름만 표시하는 대신 하위 폴더 경로를 표시합니다.'
            },
            showGroupHeaderItemCounts: {
                name: '항목 수 표시',
                desc: '목록 창의 각 그룹 머리글에 항목 수를 표시합니다.'
            },
            showCurrentFolderFilesAtBottom: {
                name: '폴더 그룹화: 현재 폴더 파일을 하단에 표시',
                desc: '기본 그룹화가 폴더인 경우 선택한 폴더 바로 아래의 파일을 하위 폴더 그룹 아래로 이동합니다.'
            },
            defaultListMode: {
                name: '기본 목록 모드',
                desc: '기본 목록 레이아웃을 선택합니다. 표준은 제목, 날짜, 설명, 미리보기 텍스트를 표시합니다. 컴팩트는 제목만 표시합니다. 모양은 폴더별로 덮어쓸 수 있습니다.',
                options: {
                    standard: '표준',
                    compact: '컴팩트'
                }
            },
            showFileIcons: {
                name: '파일 아이콘 표시',
                desc: '파일 아이콘을 왼쪽 정렬 간격과 함께 표시. 비활성화하면 아이콘과 들여쓰기가 모두 제거됩니다. 우선순위: 미완료 작업 아이콘 > 사용자 지정 아이콘 > 폴더 아이콘 > 파일 이름 아이콘 > 파일 유형 아이콘 > 기본값 아이콘.'
            },
            unfinishedTaskIcon: {
                name: '미완료 작업 아이콘',
                desc: '노트에 미완료 작업이 있을 때 파일 아이콘을 바꿉니다.',
                options: {
                    disabled: '비활성화',
                    compact: '컴팩트 모드',
                    standardAndCompact: '표준 및 컴팩트'
                }
            },
            useFolderIcon: {
                name: '폴더 아이콘 사용',
                desc: '사용자 지정 파일 아이콘이 설정되지 않은 경우 상위 폴더 아이콘을 표시합니다. 사용자 지정 파일 색상이 설정되지 않은 경우 폴더 색상이 사용됩니다.'
            },
            showFileTaskProgress: {
                name: '작업 진행률',
                desc: '작업 상태를 표시하며 진행률 표시줄과 작업 수는 선택적으로 표시합니다. 미완료 작업과 완료된 작업의 색상은 Style Settings 플러그인에서 개별적으로 설정할 수 있습니다.'
            },
            showFileTaskProgressBar: {
                name: '작업 진행률: 진행률 표시줄',
                desc: '작업 아이콘 옆에 진행률 표시줄을 표시합니다.'
            },
            showFileTaskProgressCount: {
                name: '작업 진행률: 작업 수',
                desc: '완료된 작업 수와 전체 작업 수를 표시합니다(예: 3/7).'
            },
            hideFileTaskProgressWhenComplete: {
                name: '작업 진행률: 완료 시 숨기기',
                desc: '노트의 모든 작업이 완료되면 작업 진행률을 숨깁니다.'
            },
            unfinishedTaskBackground: {
                name: '미완료 작업 배경',
                desc: '노트에 미완료 작업이 있을 때 배경색을 적용합니다.'
            },
            unfinishedTaskBackgroundColor: {
                name: '미완료 작업 배경색',
                desc: '노트에 미완료 작업이 있을 때 사용할 배경색을 설정합니다.'
            },
            showFileNameIcons: {
                name: '파일 이름으로 아이콘 설정',
                desc: '파일 이름의 텍스트를 기반으로 아이콘을 지정합니다.'
            },
            fileNameIconMap: {
                name: '파일 이름 아이콘 맵',
                desc: '텍스트를 포함하는 파일에 지정된 아이콘이 적용됩니다. 줄당 하나의 매핑: 텍스트=아이콘',
                placeholder: '# 텍스트=아이콘\n회의=ph-calendar\n청구서=ph-receipt',
                editTooltip: '매핑 편집'
            },
            showFileTypeIcons: {
                name: '파일 유형으로 아이콘 설정',
                desc: '파일 확장자를 기반으로 아이콘을 지정합니다.'
            },
            fileTypeIconPreset: {
                name: '파일 아이콘 프리셋',
                desc: '기본 제공 아이콘 또는 아이콘 팩 프리셋을 선택합니다. 사용자 지정 확장자 규칙은 이 프리셋보다 우선합니다.',
                options: {
                    builtIn: '기본 제공 아이콘'
                },
                notInstalledWarning: '이 아이콘 팩이 설치되어 있지 않습니다. 대신 기본 제공 아이콘이 표시됩니다.'
            },
            fileTypeIconMap: {
                name: '파일 유형 아이콘 맵',
                desc: '확장자가 있는 파일에 지정된 아이콘이 적용됩니다. 줄당 하나의 매핑: 확장자=아이콘',
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: '매핑 편집'
            },
            compactItemHeight: {
                name: '컴팩트 항목 높이',
                desc: '데스크톱과 모바일에서 컴팩트 목록 항목 높이를 설정합니다(픽셀).',
                resetTooltip: '기본값으로 복원 (28px)'
            },
            compactItemHeightScaleText: {
                name: '컴팩트 항목 높이에 맞춰 텍스트 크기 조정',
                desc: '항목 높이를 줄이면 컴팩트 목록 텍스트 크기를 조정합니다.'
            },
            showParentFolder: {
                name: '상위 폴더 표시',
                desc: '하위 폴더, 태그 또는 속성의 노트에 상위 폴더 이름을 표시합니다.'
            },
            showFolderPath: {
                name: '폴더 경로 표시',
                desc: '폴더 이름만 표시하는 대신 선택한 폴더를 기준으로 한 상대 경로를 표시합니다. 태그와 속성에서는 전체 경로를 표시합니다.'
            },
            parentFolderClickOpensFolder: {
                name: '상위 폴더 클릭 시 폴더 열기',
                desc: '상위 폴더 레이블을 클릭하면 목록 창에서 폴더를 엽니다.'
            },
            showParentFolderColor: {
                name: '상위 폴더 색상 표시',
                desc: '상위 폴더 레이블에 폴더 색상을 사용합니다.'
            },
            showParentFolderIcon: {
                name: '상위 폴더 아이콘 표시',
                desc: '상위 폴더 레이블 옆에 폴더 아이콘을 표시합니다.'
            },
            showQuickActions: {
                name: '빠른 작업 표시',
                desc: '파일 위에 마우스를 올리면 작업 버튼을 표시합니다. 버튼 컨트롤로 표시할 작업을 선택합니다.'
            },
            dualPane: {
                name: '이중 창 레이아웃',
                desc: '탐색 창과 목록 창을 나란히 표시합니다.'
            },
            dualPaneOrientation: {
                name: '이중 창 방향',
                desc: '이중 창이 활성화된 경우 가로 또는 세로 레이아웃을 선택합니다.',
                options: {
                    horizontal: '가로 분할',
                    vertical: '세로 분할'
                }
            },
            narrowSidebarBehavior: {
                name: '사이드바가 너무 좁을 때',
                desc: '탐색 창과 목록 창이 나란히 맞지 않을 때의 동작을 선택합니다.',
                options: {
                    none: '아무것도 하지 않음',
                    singlePane: '단일 창으로 전환',
                    vertical: '세로 분할로 전환'
                }
            },
            narrowSidebarThresholdMode: {
                name: '좁은 사이드바 임계값',
                desc: '사이드바 너비 임계값 계산 방법을 선택합니다.',
                options: {
                    fitPanes: '창에 맞춤',
                    customWidth: '사용자 지정 너비'
                }
            },
            narrowSidebarThresholdWidth: {
                name: '좁은 사이드바 임계값 너비',
                desc: '사이드바가 이 너비보다 좁으면 전환합니다.',
                resetTooltip: '기본 너비로 재설정'
            },
            paneBackgroundColor: {
                name: '배경색',
                desc: '탐색 및 목록 창의 배경색을 선택합니다.',
                options: {
                    separate: '분리된 배경',
                    listBackground: '목록 배경 사용',
                    navigationBackground: '탐색 배경 사용'
                }
            },
            zoomLevel: {
                name: '배율',
                desc: 'Notebook Navigator의 전체 배율을 제어합니다(백분율).'
            },
            useFloatingToolbarsOnIOS: {
                name: 'iOS에서 플로팅 툴바 사용',
                desc: 'iOS에서만 적용됩니다.'
            },
            defaultStartupView: {
                name: '기본 시작 보기',
                desc: 'Notebook Navigator를 열 때 활성화되는 창을 선택하세요. 단일 창 레이아웃에서는 이 창이 먼저 표시되고, 이중 창 레이아웃에서는 이 창에 키보드 포커스가 이동합니다.',
                options: {
                    navigation: '탐색 창',
                    listPane: '목록 창'
                }
            },
            toolbarButtons: {
                name: '도구 모음 버튼',
                desc: '도구 모음에 표시할 버튼을 선택하세요. 숨겨진 버튼은 명령과 메뉴를 통해 계속 사용할 수 있습니다.'
            },
            openNewNotesInNewTab: {
                name: '새 노트를 새 탭에서 열기',
                desc: '활성화하면 새 노트 만들기 명령이 새 탭에서 노트를 엽니다. 비활성화하면 노트가 현재 탭을 대체합니다.'
            },
            autoRevealActiveNote: {
                name: '활성 노트 자동 표시',
                desc: '빠른 전환기, 링크 또는 검색에서 열 때 노트를 자동으로 표시합니다.'
            },
            autoRevealShortestPath: {
                name: '자동 표시: 최단 경로 사용',
                desc: '활성화: 자동 표시가 가장 가까운 보이는 상위 폴더 또는 태그를 선택합니다. 비활성화: 자동 표시가 파일의 실제 폴더와 정확한 태그를 선택합니다.'
            },
            autoRevealIgnoreRightSidebar: {
                name: '자동 표시: 오른쪽 사이드바의 이벤트 무시',
                desc: '오른쪽 사이드바에서 클릭하거나 노트를 변경할 때 활성 노트를 변경하지 않습니다.'
            },
            autoRevealIgnoreOtherWindows: {
                name: '자동 표시: 다른 창의 이벤트 무시',
                desc: '다른 창에서 노트를 작업할 때 활성 노트를 변경하지 않습니다.'
            },
            singlePaneAnimation: {
                name: '단일 창 애니메이션',
                desc: '단일 창 모드에서 창 전환 시 트랜지션 시간 (밀리초).',
                resetTooltip: '기본값으로 재설정'
            },
            autoSelectFirstNote: {
                name: '첫 번째 노트 자동 선택',
                desc: '폴더, 태그 또는 속성을 전환할 때 첫 번째 노트를 자동으로 엽니다.'
            },
            disableShortcutAutoScroll: {
                name: '바로가기 자동 스크롤 비활성화',
                desc: '바로가기 내 항목을 클릭할 때 탐색 창을 스크롤하지 않습니다.'
            },
            expandOnSelection: {
                name: '선택 시 확장',
                desc: '선택 시 폴더, 태그, 속성을 확장합니다. 단일 창 모드에서는 첫 번째 선택이 확장하고 두 번째 선택이 파일을 표시합니다.'
            },
            collapseOtherBranchesOnExpand: {
                name: '하나의 펼친 분기',
                desc: '폴더, 태그 또는 속성을 펼칠 때 같은 트리의 다른 분기를 접습니다.'
            },
            springLoadedFolders: {
                name: '드래그 중 확장',
                desc: '드래그 작업 중에 마우스를 올리면 폴더와 태그를 확장합니다.'
            },
            springLoadedFoldersInitialDelay: {
                name: '드래그 중 확장: 첫 확장 지연',
                desc: '드래그 작업 중 첫 번째 폴더 또는 태그가 확장되기 전 지연(초).'
            },
            springLoadedFoldersSubsequentDelay: {
                name: '드래그 중 확장: 후속 확장 지연',
                desc: '같은 드래그 작업 중 추가 폴더 또는 태그가 확장되기 전 지연(초).'
            },
            navigationBanner: {
                name: '탐색 배너 (보관함 프로필)',
                desc: '탐색 창 상단에 이미지를 표시합니다. 선택한 보관함 프로필에 따라 변경됩니다.',
                current: '현재 배너: {path}',
                chooseButton: '이미지 선택'
            },
            pinNavigationBanner: {
                name: '배너 고정',
                desc: '탐색 배너를 탐색 트리 위에 고정합니다.'
            },
            showShortcuts: {
                name: '바로가기 표시',
                desc: '탐색 창에 바로가기 섹션을 표시합니다.'
            },
            shortcutBadgeDisplay: {
                name: '바로가기 배지',
                desc: "바로가기 옆에 표시할 내용. '바로가기 1-9 열기' 명령으로 바로가기를 직접 열 수 있습니다.",
                options: {
                    position: '위치 (1-9)',
                    count: '항목 수',
                    none: '없음'
                }
            },
            showRecentFiles: {
                name: '최근 파일 표시',
                desc: '탐색 창에 최근 파일 섹션을 표시합니다.'
            },
            hideFileTypesFromRecentFiles: {
                name: '최근 파일에서 파일 유형 숨기기',
                desc: '최근 파일 섹션에서 숨길 파일 유형을 선택합니다.',
                options: {
                    none: '없음',
                    folderNotes: '폴더 노트'
                }
            },
            recentFilesCount: {
                name: '최근 파일 수',
                desc: '표시할 최근 파일의 수입니다.'
            },
            pinRecentFilesWithShortcuts: {
                name: '바로가기와 함께 최근 파일 고정',
                desc: '바로가기를 고정할 때 최근 파일을 포함합니다.'
            },
            enableCalendar: {
                name: '캘린더 활성화',
                desc: 'Notebook Navigator의 캘린더 기능을 활성화합니다.'
            },
            calendarPlacement: {
                name: '캘린더 위치',
                desc: '왼쪽 또는 오른쪽 사이드바에 표시합니다.',
                options: {
                    leftSidebar: '왼쪽 사이드바',
                    rightSidebar: '오른쪽 사이드바'
                }
            },
            calendarSinglePanePlacement: {
                name: '단일 창 배치',
                desc: '단일 창 모드에서 캘린더가 표시되는 위치입니다.',
                options: {
                    navigationPane: '탐색 창',
                    belowPanes: '창 아래'
                }
            },
            calendarLocale: {
                name: '지역',
                desc: '달력 날짜 형식, 주 번호, 그리고 한 주의 첫 번째 요일을 제어합니다.',
                weekPathMismatchWarning: '표시되는 캘린더와 주간 노트 경로가 주의 시작 요일 또는 주 번호 매김이 서로 다릅니다.',
                options: {
                    systemDefault: '기본값'
                }
            },
            calendarWeekendDays: {
                name: '주말',
                desc: '주말을 다른 배경색으로 표시합니다.',
                options: {
                    none: '없음',
                    satSun: '토요일과 일요일',
                    friSat: '금요일과 토요일',
                    thuFri: '목요일과 금요일'
                }
            },
            calendarMonthNameFormat: {
                name: '월 이름 형식',
                desc: '월 이름을 긴 형식(1월) 또는 짧은 형식(1월)으로 표시합니다.',
                options: {
                    full: '1월 (전체)',
                    short: '1월 (축약)'
                }
            },
            showInfoButtons: {
                name: '정보 버튼 표시',
                desc: '검색 바와 캘린더 헤더에 정보 버튼을 표시합니다.'
            },
            calendarLeftSidebarWeeksToShow: {
                name: '왼쪽 사이드바에 표시할 주',
                desc: '오른쪽 사이드바의 캘린더는 항상 전체 월을 표시합니다.',
                options: {
                    fullMonth: '전체 월',
                    oneWeek: '1주',
                    weeksCount: '{count}주'
                }
            },
            calendarHighlightToday: {
                name: '오늘 날짜 강조 표시',
                desc: '오늘 날짜를 배경색과 굵은 텍스트로 강조 표시합니다.'
            },
            calendarShowFeatureImage: {
                name: '대표 이미지 표시',
                desc: '캘린더에서 노트의 대표 이미지를 표시합니다.'
            },
            calendarShowTasks: {
                name: '작업 표시',
                desc: '미완료 작업이 있는 일, 주, 월에 표시기를 표시합니다.'
            },
            calendarShowWeekNumber: {
                name: '주 번호 표시',
                desc: '주 번호 열을 추가합니다.'
            },
            calendarShowQuarter: {
                name: '분기 표시',
                desc: '캘린더 헤더에 분기 레이블을 추가합니다.'
            },
            calendarShowOutsideMonthDays: {
                name: '다른 달의 날짜 표시',
                desc: '캘린더가 한 달 전체를 표시할 때 이전 달과 다음 달의 날짜를 표시합니다.'
            },
            calendarShowYearCalendar: {
                name: '연간 캘린더 표시',
                desc: '오른쪽 사이드바에 연도 탐색 및 월 그리드를 표시합니다.'
            },
            calendarConfirmBeforeCreate: {
                name: '생성 전 확인',
                desc: '새 일일 노트를 생성할 때 확인 대화 상자를 표시합니다.'
            },
            calendarShowHiddenItems: {
                name: '숨겨진 항목 표시',
                desc: '활성화하면 캘린더에 항상 모든 캘린더 노트가 표시되며, 보관함 프로필 필터로 숨겨진 노트도 포함됩니다.'
            },
            dailyNoteSource: {
                name: '일일 노트 소스',
                desc: '캘린더 노트 소스.',
                options: {
                    dailyNotes: '일일 노트(코어 플러그인)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: '폴더 및 날짜 형식은 일일 노트 코어 플러그인에서 설정됩니다.'
                }
            },
            calendarPeriodicNotesLocale: {
                name: '정기 노트 지역',
                desc: 'Notebook Navigator의 정기 노트 경로에서 지역화된 월 이름, 요일 이름, 주 번호, 주의 시작 요일을 제어합니다.',
                options: {
                    calendar: '캘린더',
                    obsidian: 'Obsidian'
                }
            },

            periodicNotesRootFolder: {
                name: '루트 폴더 (보관함 프로필)',
                desc: '정기 노트의 기본 폴더. 날짜 패턴에 하위 폴더를 포함할 수 있습니다. 선택한 보관함 프로필에 따라 변경됩니다.',
                placeholder: '개인/일기'
            },
            templateFolderLocation: {
                name: '템플릿 폴더 위치',
                desc: '템플릿 파일 선택기가 이 폴더의 노트를 표시합니다.',
                placeholder: '템플릿',
                usage: '캘린더 노트와 폴더 노트에서 사용됩니다. 템플릿은 달력 > 캘린더 연동 및 폴더 및 폴더 노트 > 폴더 노트 파일에서 설정하세요.'
            },
            calendarDailyNotePattern: {
                name: '일일 노트',
                desc: 'Moment 날짜 형식을 사용하여 경로 지정. 하위 폴더 이름은 대괄호로 감싸세요, 예: [Work]/YYYY. 템플릿 아이콘을 클릭하여 템플릿을 설정하세요. 템플릿 폴더 위치는 파일 작업 > 템플릿에서 설정하세요.',
                placeholder: 'YYYY/YYYYMMDD',
                parsingError: '패턴은 전체 날짜(연, 월, 일)로 포맷되고 다시 파싱될 수 있어야 합니다.'
            },
            calendarPeriodicNotePatterns: {
                momentDescPrefix: '',
                momentLinkText: 'Moment 날짜 형식',
                momentDescSuffix:
                    '을 사용하여 경로 지정. 하위 폴더 이름은 대괄호로 감싸세요, 예: [Work]/YYYY. 템플릿 아이콘을 클릭하여 템플릿을 설정하세요. 템플릿 폴더 위치는 파일 작업 > 템플릿에서 설정하세요.',
                templateTokenNoticeLabel: '중요!',
                templateTokenNotice:
                    '템플릿 지원에는 Templater 플러그인이 필요합니다. {{date}}, {{title}} 같은 기본 형식은 {source}이(가) {option}으로 설정된 경우에만 사용할 수 있습니다.',
                example: '현재 구문: {path}'
            },
            templaterSupport: {
                installed: '✅ Templater 플러그인이 설치되어 전체 템플릿 지원을 사용할 수 있습니다.',
                missing: '⚠️ 템플릿 지원을 사용하려면 Templater 플러그인을 설치하세요.'
            },
            calendarWeeklyNotePattern: {
                name: '주간 노트',
                parsingError: '패턴은 전체 주(주 연도, 주 번호)로 포맷되고 다시 파싱될 수 있어야 합니다.',
                weekPathMismatchWarning:
                    '주간 노트 경로는 정기 노트 지역을 사용합니다. 일치하는 지역을 사용하거나 월요일 기준 주에는 "GGGG"와 "WW"를 사용하세요.',
                mixedWeekTokensWarning:
                    '이 패턴은 월요일 기준 주 토큰("W" 또는 "G")과 지역 기준 주 토큰("w" 또는 "g")을 혼합하여 사용합니다. 일관되게 한 가지 세트를 사용하세요. 월요일 기준 주에는 "GGGG"와 "WW", 주간 노트가 선택한 지역 설정을 따라야 하는 경우 "gggg"와 "ww"를 사용하세요.'
            },
            calendarMonthlyNotePattern: {
                name: '월간 노트',
                parsingError: '패턴은 전체 월(연도, 월)로 포맷되고 다시 파싱될 수 있어야 합니다.'
            },
            calendarQuarterlyNotePattern: {
                name: '분기별 노트',
                parsingError: '패턴은 전체 분기(연도, 분기)로 포맷되고 다시 파싱될 수 있어야 합니다.'
            },
            calendarYearlyNotePattern: {
                name: '연간 노트',
                parsingError: '패턴은 전체 연도(연도)로 포맷되고 다시 파싱될 수 있어야 합니다.'
            },
            periodicNoteTemplateFile: {
                current: '템플릿 파일: {name}'
            },
            showTooltips: {
                name: '도구 설명 표시',
                desc: '노트와 폴더에 대한 추가 정보가 있는 호버 도구 설명을 표시합니다.'
            },
            showTooltipPath: {
                name: '도구 설명에 경로 표시',
                desc: '도구 설명에서 노트 이름 아래에 폴더 경로를 표시합니다.'
            },
            showTooltipWordCount: {
                name: '도구 설명에 단어 수 표시',
                desc: '도구 설명에 노트의 단어 수를 표시합니다.'
            },
            resetPaneSeparator: {
                name: '창 구분선 위치 초기화',
                desc: '탐색 창과 목록 창 사이의 드래그 가능한 구분선을 기본 위치로 초기화합니다.',
                buttonText: '구분선 초기화',
                notice: '구분선 위치가 초기화되었습니다. Obsidian을 재시작하거나 Notebook Navigator를 다시 열어 적용하세요.'
            },
            importAndExportSettings: {
                name: '설정 가져오기 및 내보내기',
                desc: 'Notebook Navigator 설정을 JSON으로 내보내거나 가져옵니다. 가져오기는 모든 설정을 대체합니다.',
                importButtonText: '가져오기',
                exportButtonText: '내보내기',
                import: {
                    modalTitle: '설정 가져오기',
                    fileButtonName: '파일에서 가져오기',
                    fileButtonDesc: '디스크에서 JSON 파일을 불러옵니다.',
                    fileButtonText: '파일에서 가져오기',
                    editorName: 'JSON',
                    editorDesc: '아래에 JSON을 붙여넣거나 편집하세요. 포함되지 않은 설정은 기본값으로 초기화됩니다.',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: '가져오기',
                    confirmTitle: '설정을 가져오시겠습니까?',
                    confirmMessage: '가져오면 현재 Notebook Navigator 설정이 대체됩니다.',
                    backupToggleName: '가져오기 전에 현재 설정을 보관함 루트에 저장',
                    backupToggleDesc: '보관함 루트에 타임스탬프가 있는 JSON 파일을 만듭니다.',
                    successWithBackupNotice: '설정을 가져왔습니다. 이전 설정은 {path}에 저장되었습니다.',
                    backupError: '현재 설정을 저장할 수 없습니다: {message}',
                    successNotice: '설정을 가져왔습니다.',
                    errorNotice: '설정 가져오기에 실패했습니다: {message}',
                    fileReadError: '파일을 읽을 수 없습니다: {message}'
                },
                export: {
                    modalTitle: '설정 내보내기',
                    editorName: 'JSON',
                    editorDesc: '기본값에서 변경된 설정만 포함됩니다.',
                    placeholder: '{}',
                    copyButtonText: '클립보드에 복사',
                    downloadButtonText: '다운로드',
                    copyNotice: '설정이 클립보드에 복사되었습니다.',
                    downloadNotice: '설정이 내보내졌습니다.',
                    downloadError: '설정 다운로드에 실패했습니다: {message}'
                }
            },
            resetAllSettings: {
                name: '모든 설정 초기화',
                desc: 'Notebook Navigator의 모든 설정을 기본값으로 초기화합니다.',
                buttonText: '모든 설정 초기화',
                confirmTitle: '모든 설정을 초기화하시겠습니까?',
                confirmMessage: 'Notebook Navigator의 모든 설정이 기본값으로 초기화됩니다. 되돌릴 수 없습니다.',
                confirmButtonText: '모든 설정 초기화',
                notice: '모든 설정이 초기화되었습니다. Obsidian을 재시작하거나 Notebook Navigator를 다시 열어 적용하세요.',
                error: '설정 초기화에 실패했습니다.'
            },
            multiSelectModifier: {
                name: '다중 선택 수정자',
                desc: '다중 선택을 전환하는 수정자 키를 선택하세요. Option/Alt를 선택하면 Cmd/Ctrl 클릭이 새 탭에서 노트를 엽니다.',
                options: {
                    cmdCtrl: 'Cmd/Ctrl 클릭',
                    optionAlt: 'Option/Alt 클릭'
                }
            },
            enterToOpenFiles: {
                name: 'Enter 키로 파일 열기',
                desc: '목록 키보드 탐색 중 Enter 키를 누를 때만 파일을 엽니다. macOS에서는 Enter 키가 파일 이름을 변경하지 않도록 합니다.'
            },
            shiftEnterAction: {
                name: 'Shift+Enter',
                desc: 'Shift+Enter를 누를 때 선택한 파일을 열지 이름을 변경할지 선택합니다.'
            },
            cmdEnterAction: {
                name: 'Cmd+Enter',
                desc: 'Cmd+Enter를 누를 때 선택한 파일을 열지 이름을 변경할지 선택합니다.'
            },
            ctrlEnterAction: {
                name: 'Ctrl+Enter',
                desc: 'Ctrl+Enter를 누를 때 선택한 파일을 열지 이름을 변경할지 선택합니다.'
            },
            mouseBackForwardAction: {
                name: '마우스 뒤로/앞으로 버튼',
                desc: '데스크톱에서 마우스 뒤로/앞으로 버튼의 동작.',
                options: {
                    systemDefault: '시스템 기본값 사용',
                    singlePaneSwitch: '창 전환 (단일 창)',
                    history: '기록 탐색'
                }
            },
            showFileTypes: {
                name: '파일 유형 표시 (보관함 프로필)',
                desc: '네비게이터에 표시할 파일 유형을 필터링합니다. Obsidian에서 지원하지 않는 파일 유형은 외부 응용 프로그램에서 열릴 수 있습니다.',
                options: {
                    documents: '문서 (.md, .canvas, .base)',
                    supported: '지원됨 (Obsidian에서 열림)',
                    all: '모두 (외부에서 열릴 수 있음)'
                }
            },
            homepage: {
                name: '홈페이지',
                desc: '시작 시 자동으로 열 대상을 선택합니다.',
                current: '현재: {path}',
                chooseButton: '파일 선택',
                options: {
                    none: '없음',
                    file: '파일',
                    dailyNote: '일일 노트',
                    weeklyNote: '주간 노트',
                    monthlyNote: '월간 노트',
                    quarterlyNote: '분기 노트',
                    yearlyNote: '연간 노트'
                },
                file: {
                    name: '홈페이지: 시작 파일',
                    empty: '선택된 파일 없음'
                },
                createMissing: {
                    name: '홈페이지: 없으면 노트 생성',
                    desc: '시작 시 또는 명령 실행 시 정기 노트가 없으면 생성합니다.'
                }
            },
            hideNotesWithPropertyRules: {
                name: '속성 규칙으로 노트 숨기기 (보관함 프로필)',
                desc: '쉼표로 구분된 frontmatter 규칙 목록입니다. `key` 또는 `key=value` 항목을 사용합니다 (예: status=done, published=true, archived).',
                placeholder: 'status=done, published=true, archived'
            },
            hideFiles: {
                name: '파일 숨기기 (보관함 프로필)',
                desc: '숨길 파일 이름 패턴의 쉼표로 구분된 목록입니다. * 와일드카드와 / 경로를 지원합니다 (예: temp-*, *.png, /assets/*).',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: '보관함 프로필',
                desc: '프로필은 파일 유형 가시성, 숨겨진 파일, 숨겨진 폴더, 숨겨진 태그, 숨겨진 노트용 속성 규칙, 바로가기, 탐색 배너를 저장합니다. 탐색 창 헤더에서 프로필을 전환합니다.',
                defaultName: '기본',
                addButton: '프로필 추가',
                editProfilesButton: '프로필 편집',
                addProfileOption: '프로필 추가...',
                applyButton: '적용',
                deleteButton: '프로필 삭제',
                addModalTitle: '프로필 추가',
                editProfilesModalTitle: '프로필 편집',
                addModalPlaceholder: '프로필 이름',
                deleteModalTitle: '{name} 삭제',
                deleteModalMessage:
                    '{name}을(를) 제거하시겠습니까? 이 프로필에 저장된 숨겨진 파일, 폴더, 태그 및 속성 기반 노트 필터가 삭제됩니다.',
                moveUp: '위로 이동',
                moveDown: '아래로 이동',
                errors: {
                    emptyName: '프로필 이름을 입력하세요',
                    duplicateName: '프로필 이름이 이미 존재합니다'
                }
            },
            vaultTitlePlacement: {
                name: '보관함 제목 위치',
                desc: '보관함 제목이 표시되는 위치를 선택합니다.',
                options: {
                    header: '헤더에 표시',
                    navigation: '탐색 창에 표시'
                }
            },
            hideFolders: {
                name: '폴더 숨기기 (보관함 프로필)',
                desc: '숨길 폴더의 쉼표로 구분된 목록입니다. 이름 패턴: assets* (assets로 시작하는 폴더), *_temp (_temp로 끝나는). 경로 패턴: /아카이브 (루트 아카이브만), /res* (res로 시작하는 루트 폴더), /*/temp (한 레벨 깊이의 temp 폴더), /프로젝트/* (프로젝트 내부의 모든 폴더).',
                placeholder: '템플릿, assets*, /아카이브, /res*'
            },
            descendantExcludedFolders: {
                name: '하위 폴더 노트에서 폴더 제외 (보관함 프로필)',
                desc: '하위 폴더에서 노트를 모을 때 제외할 폴더의 쉼표로 구분된 목록입니다. 폴더는 계속 표시되며, 선택하면 해당 노트가 계속 표시됩니다. 폴더 숨기기와 같은 패턴을 사용합니다.',
                placeholder: '일지, 자료, /아카이브'
            },
            showFileDate: {
                name: '날짜 표시',
                desc: '노트 이름 아래에 날짜를 표시합니다.'
            },
            dateWhenSortingByName: {
                name: '이름 정렬 시',
                desc: '노트가 이름순으로 정렬될 때 표시할 날짜.',
                options: {
                    created: '생성일',
                    modified: '수정일'
                }
            },
            showFileTags: {
                name: '파일 태그 표시',
                desc: '파일 항목에 클릭 가능한 태그를 표시합니다.'
            },
            showFullTagPaths: {
                name: '전체 태그 경로 표시',
                desc: "태그의 전체 계층 경로를 표시합니다. 활성화: 'ai/openai', 'work/projects/2024'. 비활성화: 'openai', '2024'."
            },
            colorFileTags: {
                name: '파일 태그 색상 지정',
                desc: '파일 항목의 태그 배지에 태그 색상을 적용합니다.'
            },
            showColoredTagsFirst: {
                name: '색상 태그 우선 표시',
                desc: '색상 태그를 다른 태그보다 먼저 정렬합니다.'
            },
            showFileTagsInCompactMode: {
                name: '컴팩트 모드에서 파일 태그 표시',
                desc: '날짜, 미리보기, 이미지가 숨겨져 있을 때 태그를 표시합니다.'
            },
            showFileProperties: {
                name: '파일 속성 표시',
                desc: '파일 항목에 속성을 표시합니다. "속성 키 표시 설정" 대화상자에서 표시할 속성을 선택하세요.'
            },
            colorFileProperties: {
                name: '파일 속성에 색상 적용',
                desc: '파일 항목의 속성 배지에 속성 색상을 적용합니다.'
            },
            showColoredPropertiesFirst: {
                name: '색상 속성을 먼저 표시',
                desc: '파일 항목에서 색상 속성을 다른 속성보다 먼저 정렬합니다.'
            },
            showFilePropertiesInCompactMode: {
                name: '컴팩트 모드에서 속성 표시',
                desc: '컴팩트 모드가 활성화되면 속성을 표시합니다.'
            },
            textCountType: {
                name: '카운트 유형',
                desc: '파일 항목에 표시할 텍스트 카운트를 선택합니다.',
                options: {
                    none: '없음',
                    words: '단어 수',
                    characters: '문자 수',
                    both: '단어 및 문자 수'
                }
            },
            textCountPlacement: {
                name: '배치',
                desc: '텍스트 카운트가 표시될 위치를 선택합니다.',
                options: {
                    title: '제목 안',
                    property: '속성으로'
                }
            },
            characterCountSpaces: {
                name: '문자 수',
                desc: '문자 수에 공백을 포함할지 선택합니다.',
                options: {
                    include: '공백 포함',
                    exclude: '공백 제외'
                }
            },
            wordCountTargetProperty: {
                name: '목표 속성',
                desc: '목표 단어 수가 들어 있는 frontmatter 속성 키입니다. 목표를 숨기려면 비워 두세요.'
            },
            showTargetPercentage: {
                name: '목표 백분율 표시',
                desc: '목표 단어 수가 있을 때 진행률 백분율만 표시합니다.'
            },
            propertyKeys: {
                name: '속성 키 (보관함 프로필)',
                desc: 'frontmatter 속성 키. 키별로 탐색 창 및 파일 목록의 표시 여부를 설정할 수 있습니다.',
                addButtonTooltip: '속성 키 구성',
                noneConfigured: '구성된 속성 없음',
                singleConfigured: '1개 속성 구성됨: {properties}',
                multipleConfigured: '{count}개 속성 구성됨: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: '속성을 별도 행에 표시',
                desc: '각 속성을 개별 행에 표시합니다.'
            },
            linkPropertyPillsToNotes: {
                name: '속성 배지를 노트에 연결',
                desc: '속성 배지를 클릭하여 연결된 노트를 엽니다.'
            },
            linkPropertyPillsToUrls: {
                name: '속성 배지를 URL에 연결',
                desc: '속성 배지를 클릭하여 연결된 URL을 엽니다.'
            },
            dateFormat: {
                name: '날짜 형식',
                desc: '날짜 표시 형식 (Moment 형식 사용).',
                placeholder: 'YYYY년 M월 D일',
                help: '일반적인 형식:\nYYYY년 M월 D일 = 2022년 5월 25일\nDD/MM/YYYY = 25/05/2022\nYYYY-MM-DD = 2022-05-25\n\n토큰:\nYYYY/YY = 년도\nMMMM/MMM/MM = 월\nDD/D = 일\ndddd/ddd = 요일',
                helpTooltip: 'Moment 형식',
                momentLinkText: 'Moment 형식'
            },
            timeFormat: {
                name: '시간 형식',
                desc: '시간 표시 형식 (Moment 형식 사용).',
                placeholder: 'a h:mm',
                help: '일반적인 형식:\na h:mm = 오후 2:30 (12시간)\nHH:mm = 14:30 (24시간)\na h:mm:ss = 오후 2:30:45\nHH:mm:ss = 14:30:45\n\n토큰:\nHH/H = 24시간\nhh/h = 12시간\nmm = 분\nss = 초\na = 오전/오후',
                helpTooltip: 'Moment 형식',
                momentLinkText: 'Moment 형식'
            },
            showNotePreview: {
                name: '노트 미리보기 표시',
                desc: '노트 이름 아래에 미리보기 텍스트를 표시합니다.'
            },
            skipHeadingsInPreview: {
                name: '미리보기에서 제목 건너뛰기',
                desc: '미리보기 텍스트를 생성할 때 제목 줄을 건너뜁니다.'
            },
            skipCodeBlocksInPreview: {
                name: '미리보기에서 코드 블록 건너뛰기',
                desc: '미리보기 텍스트를 생성할 때 코드 블록을 건너뜁니다.'
            },
            skipCalloutsInPreview: {
                name: '미리보기에서 콜아웃 건너뛰기',
                desc: '미리보기 텍스트를 생성할 때 콜아웃 블록을 건너뜁니다.'
            },
            stripHtmlInPreview: {
                name: '미리보기에서 HTML 제거',
                desc: '미리보기 텍스트에서 HTML 태그를 제거합니다. 큰 노트에서는 성능에 영향을 줄 수 있습니다.'
            },
            stripLatexInPreview: {
                name: '미리보기에서 LaTeX 제거',
                desc: '미리보기 텍스트에서 인라인 및 블록 LaTeX 수식을 제거합니다.'
            },
            previewProperties: {
                name: '미리보기 속성',
                desc: '미리보기 텍스트를 확인할 frontmatter 속성의 쉼표로 구분된 목록입니다. 텍스트가 있는 첫 번째 속성이 사용됩니다.',
                placeholder: 'summary, description, abstract'
            },
            fallbackToNoteContent: {
                name: '노트 내용으로 대체',
                desc: '지정된 속성에 텍스트가 없을 때 노트 내용을 미리보기로 표시합니다.'
            },
            previewRows: {
                name: '미리보기 행',
                desc: '미리보기 텍스트에 표시할 행 수입니다.',
                options: {
                    '1': '1행',
                    '2': '2행',
                    '3': '3행',
                    '4': '4행',
                    '5': '5행'
                }
            },
            titleRows: {
                name: '제목 행',
                desc: '노트 제목에 표시할 행 수입니다.',
                options: {
                    '1': '1행',
                    '2': '2행',
                    '3': '3행'
                }
            },
            useFolderColor: {
                name: '폴더 색상 사용',
                desc: '사용자 지정 파일 색상이 설정되지 않은 경우 노트 제목과 파일 아이콘에 상위 폴더 색상을 적용합니다. 우선순위: 사용자 지정 파일 색상 > 폴더 색상 > 기본 색상.'
            },
            showFeatureImage: {
                name: '대표 이미지 표시',
                desc: '노트에서 발견된 첫 번째 이미지의 썸네일을 표시합니다.'
            },
            forceSquareFeatureImage: {
                name: '대표 이미지를 정사각형으로 고정',
                desc: '대표 이미지를 정사각형 썸네일로 렌더링합니다.'
            },
            featureImageProperties: {
                name: '이미지 속성',
                desc: '먼저 확인할 frontmatter 속성의 쉼표로 구분된 목록입니다. 없으면 마크다운 콘텐츠의 첫 번째 이미지를 사용합니다.',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: '속성이 있는 노트 제외',
                desc: '쉼표로 구분된 frontmatter 속성 목록입니다. 이러한 속성 중 하나라도 포함된 노트는 대표 이미지를 저장하지 않습니다.',
                placeholder: 'private, confidential'
            },
            featureImageDisplaySize: {
                name: '대표 이미지 표시 크기',
                desc: '노트 목록에서 대표 이미지의 최대 렌더링 크기.',
                options: {
                    '64': '64 px',
                    '96': '96 px',
                    '128': '128 px'
                }
            },
            featureImagePixelSize: {
                name: '대표 이미지 픽셀 크기',
                desc: '저장된 대표 이미지 썸네일을 생성할 때 사용되는 해상도. 큰 미리보기가 흐릿하게 보이면 이 값을 높이세요.',
                options: {
                    '256x144': '256 x 144 px',
                    '384x216': '384 x 216 px',
                    '512x288': '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: '외부 이미지 다운로드',
                desc: '대표 이미지로 원격 이미지 및 YouTube 썸네일을 다운로드합니다.'
            },
            hideExportedPreviewImages: {
                name: '내보낸 미리보기 이미지 숨기기',
                desc: '내보낸 그림 미리보기 PNG 파일을 숨깁니다. 표시하려면 "숨겨진 항목 표시"를 켜세요.'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator는 Excalidraw가 내보낸 PNG 파일을 그림 미리보기로 표시합니다.',
                items: [
                    '**Excalidraw 설정**에서 **Embedding Excalidraw into your Notes and Exporting**, 그다음 **Export Settings**, 그다음 **Auto-export Settings**를 엽니다.',
                    '**Auto-export PNG**를 활성화합니다. 선택적으로 **Export both dark- and light-themed image**를 활성화하세요.',
                    'Notebook Navigator는 **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** 또는 **Drawing.excalidraw.light.png**를 찾습니다.',
                    '**내보낸 미리보기 이미지 숨기기**가 켜져 있는 동안에는 **숨겨진 항목 표시**도 켜져 있을 때만 PNG 파일이 나타납니다.'
                ]
            },
            showRootFolder: {
                name: '루트 폴더 표시',
                desc: '트리에서 보관함 이름을 루트 폴더로 표시합니다.'
            },
            showFolderIcons: {
                name: '폴더 아이콘 표시',
                desc: '탐색 창의 폴더 옆에 아이콘을 표시합니다.'
            },
            inheritFolderColors: {
                name: '폴더 색상 상속',
                desc: '하위 폴더가 상위 폴더에서 색상을 상속합니다.'
            },
            folderSortOrder: {
                name: '폴더 정렬 순서',
                desc: '폴더를 마우스 오른쪽 버튼으로 클릭하여 하위 항목의 정렬 순서를 개별적으로 설정할 수 있습니다.',
                options: {
                    alphaAsc: 'A부터 Z까지',
                    alphaDesc: 'Z부터 A까지'
                }
            },
            showFileCount: {
                name: '파일 수 표시',
                desc: '폴더, 태그, 속성 옆에 파일 수를 표시합니다.'
            },
            showShortcutAndRecentItemIcons: {
                name: '바로가기 및 최근 항목 아이콘 표시',
                desc: '바로가기 및 최근 섹션의 항목 옆에 아이콘을 표시합니다.'
            },
            interfaceIcons: {
                name: '인터페이스 아이콘',
                desc: '도구 모음, 폴더, 태그, 속성, 고정 항목, 검색, 정렬 아이콘을 편집합니다.',
                buttonText: '아이콘 편집'
            },
            applyColorToIconsOnly: {
                name: '아이콘에만 색상 적용',
                desc: '활성화하면 사용자 지정 색상이 아이콘에만 적용됩니다. 비활성화하면 아이콘과 텍스트 레이블 모두에 색상이 적용됩니다.'
            },
            navRainbowMode: {
                name: '무지개 색상 모드 (보관함 프로필)',
                desc: '탐색 창에 무지개 색상을 적용합니다.',
                options: {
                    off: '끄기',
                    textColor: '텍스트 색상',
                    backgroundColor: '배경 색상'
                }
            },
            navRainbowFirstColor: {
                name: '첫 번째 색상',
                desc: '무지개 그라데이션의 첫 번째 색상.'
            },
            navRainbowLastColor: {
                name: '마지막 색상',
                desc: '무지개 그라데이션의 마지막 색상.'
            },
            navRainbowTransitionStyle: {
                name: '전환 스타일',
                desc: '첫 번째와 마지막 색상 사이에 사용되는 보간.',
                options: {
                    hue: '색조',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: '바로가기에 적용',
                desc: '무지개 색상을 바로가기에 적용합니다.'
            },
            navRainbowApplyToRecentItems: {
                name: '최근 항목에 적용',
                desc: '무지개 색상을 최근 항목에 적용합니다.'
            },
            navRainbowApplyToFolders: {
                name: '폴더에 적용',
                desc: '무지개 색상을 폴더에 적용합니다.'
            },
            navRainbowFolderScope: {
                name: '폴더 범위',
                desc: '색상 할당을 시작할 폴더 수준을 선택합니다.',
                options: {
                    root: '루트 수준',
                    child: '하위 수준',
                    all: '모든 수준'
                }
            },
            navRainbowApplyToTags: {
                name: '태그에 적용',
                desc: '무지개 색상을 태그에 적용합니다.'
            },
            navRainbowTagScope: {
                name: '태그 범위',
                desc: '색상 할당을 시작할 태그 수준을 선택합니다.',
                options: {
                    root: '루트 수준',
                    child: '하위 수준',
                    all: '모든 수준'
                }
            },
            navRainbowApplyToProperties: {
                name: '속성에 적용',
                desc: '무지개 색상을 속성에 적용합니다.'
            },
            navRainbowConsistentBrightness: {
                name: '색상 간 일관된 밝기', // (English: Consistent brightness across hues)
                desc: '색상 전환 중 시작 색상과 끝 색상 사이의 밝기를 보간합니다.' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: '라이트 및 다크 모드 색상 분리', // (English: Separate light and dark mode colors)
                desc: '라이트 모드와 다크 모드에서 서로 다른 레인보우 색상을 사용합니다.' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: '라이트 모드 색상을 다크 모드로 복사', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: '속성 범위',
                desc: '색상 할당을 시작할 속성 수준을 선택합니다.',
                options: {
                    root: '루트 수준',
                    child: '하위 수준',
                    all: '모든 수준'
                }
            },
            collapseItems: {
                name: '항목 접기',
                desc: '모두 펼치기/접기 버튼이 영향을 미치는 항목을 선택하세요.',
                options: {
                    all: '모두',
                    foldersOnly: '폴더만',
                    tagsOnly: '태그만',
                    propertiesOnly: '속성만'
                }
            },
            keepSelectedItemExpanded: {
                name: '선택한 항목 펼친 상태 유지',
                desc: '접을 때 선택한 항목과 상위 항목을 펼친 상태로 유지합니다.'
            },
            excludeVaultRootFromCollapse: {
                name: '접을 때 보관함 루트 건너뛰기',
                desc: '모든 항목을 접을 때 보관함 루트 폴더를 현재 상태로 둡니다.'
            },
            treeIndentation: {
                name: '트리 들여쓰기',
                desc: '중첩된 폴더, 태그, 속성의 들여쓰기 너비를 조정합니다(픽셀).'
            },
            navItemHeight: {
                name: '항목 높이',
                desc: '탐색 창에서 폴더, 태그, 속성의 높이를 조정합니다(픽셀).'
            },
            navItemHeightScaleText: {
                name: '항목 높이에 따라 글자 크기 조정',
                desc: '항목 높이를 줄이면 탐색 글자 크기를 작게 합니다.'
            },
            showIndentGuides: {
                name: '들여쓰기 안내선 표시',
                desc: '중첩된 폴더, 태그, 속성의 들여쓰기 안내선을 표시합니다.'
            },
            navCountLeaderStyle: {
                name: '리더 표시',
                desc: '항목 이름과 파일 수 사이에 점, 대시 또는 선을 표시합니다.',
                options: {
                    none: '없음',
                    dots: '점 (...)',
                    dashes: '대시 (---)',
                    line: '선'
                }
            },
            rootItemSpacing: {
                name: '루트 항목 간격',
                desc: '최상위 폴더, 태그, 속성 사이의 간격(픽셀).'
            },
            showTags: {
                name: '태그 표시',
                desc: '네비게이터에서 태그 섹션을 표시합니다.'
            },
            showTagIcons: {
                name: '태그 아이콘 표시',
                desc: '탐색 창의 태그 옆에 아이콘을 표시합니다.'
            },
            inheritTagColors: {
                name: '태그 색상 상속',
                desc: '하위 태그가 상위 태그의 색상을 상속합니다.'
            },
            tagSortOrder: {
                name: '태그 정렬 순서',
                desc: '태그를 마우스 오른쪽 버튼으로 클릭하여 하위 항목의 정렬 순서를 개별적으로 설정할 수 있습니다.',
                options: {
                    alphaAsc: 'A부터 Z까지',
                    alphaDesc: 'Z부터 A까지',
                    frequency: '빈도',
                    lowToHigh: '낮음 → 높음',
                    highToLow: '높음 → 낮음'
                }
            },
            showTagsFolder: {
                name: '태그 폴더 표시',
                desc: '"태그"를 접을 수 있는 폴더로 표시합니다.'
            },
            showUntaggedNotes: {
                name: '태그 없는 노트 표시',
                desc: '태그가 없는 노트에 대해 "태그 없음" 항목을 표시합니다.'
            },
            filterTagsBySelection: {
                name: '선택 항목으로 태그 필터링',
                desc: '선택한 폴더 또는 속성 내 노트에 있는 태그만 표시합니다.'
            },
            keepEmptyTagsProperty: {
                name: '마지막 태그 제거 후 tags 속성 유지',
                desc: '모든 태그가 제거될 때 frontmatter의 tags 속성을 유지합니다. 비활성화하면 tags 속성이 frontmatter에서 삭제됩니다.'
            },
            showProperties: {
                name: '속성 표시',
                desc: '네비게이터에 속성 섹션을 표시합니다.',
                propertyKeysInfoPrefix: '',
                propertyKeysInfoLinkText: '일반 > 속성 키',
                propertyKeysInfoSuffix: '에서 속성 구성'
            },
            showPropertyIcons: {
                name: '속성 아이콘 표시',
                desc: '탐색 창에서 속성 옆에 아이콘을 표시합니다.'
            },
            inheritPropertyColors: {
                name: '속성 색상 상속',
                desc: '속성 값이 속성 키의 색상과 배경색을 상속합니다.'
            },
            propertySortOrder: {
                name: '속성 정렬 순서',
                desc: '속성을 마우스 오른쪽 버튼으로 클릭하여 값의 정렬 순서를 변경합니다.',
                options: {
                    alphaAsc: '가나다순',
                    alphaDesc: '역가나다순',
                    frequency: '빈도',
                    lowToHigh: '낮은 순',
                    highToLow: '높은 순'
                }
            },
            showPropertiesFolder: {
                name: '속성 폴더 표시',
                desc: '"속성"을 접을 수 있는 폴더로 표시합니다.'
            },
            filterPropertiesBySelection: {
                name: '선택 항목으로 속성 필터링',
                desc: '선택한 폴더 또는 태그 내 노트에 있는 속성만 표시합니다.'
            },
            hideTags: {
                name: '태그 숨기기 (보관함 프로필)',
                desc: '쉼표로 구분된 태그 패턴 목록입니다. 이름 패턴: tag* (시작), *tag (끝). 경로 패턴: 아카이브 (태그와 하위), 아카이브/* (하위만), 프로젝트/*/초안 (중간 와일드카드).',
                placeholder: '아카이브*, *초안, 프로젝트/*/과거'
            },
            hideNotesWithTags: {
                name: '태그가 있는 노트 숨기기 (보관함 프로필)',
                desc: '쉼표로 구분된 태그 패턴 목록입니다. 일치하는 태그가 포함된 노트는 숨겨집니다. 이름 패턴: tag* (시작), *tag (끝). 경로 패턴: 아카이브 (태그와 하위), 아카이브/* (하위만), 프로젝트/*/초안 (중간 와일드카드).',
                placeholder: '아카이브*, *초안, 프로젝트/*/과거'
            },
            enableFolderNotes: {
                name: '폴더 노트 활성화',
                desc: '일치하는 노트 파일이 있는 폴더가 클릭 가능한 링크로 표시됩니다.'
            },
            folderNoteType: {
                name: '기본 폴더 노트 형식',
                desc: '컨텍스트 메뉴에서 생성되는 폴더 노트 형식입니다.',
                options: {
                    ask: '생성 시 선택',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: '폴더 노트 이름',
                desc: '확장자 없는 폴더 노트 이름입니다. {{folder}}를 사용하여 폴더 이름을 삽입하거나 index와 같은 고정 이름을 입력하세요.'
            },
            folderNoteTemplate: {
                name: '폴더 노트 템플릿',
                desc: '폴더 노트를 만들 때 사용하는 템플릿 파일입니다. Markdown 템플릿은 Templater를 사용할 수 있습니다. Canvas 및 Base 템플릿은 파일 내용으로 복사됩니다. 템플릿 폴더 위치는 파일 작업 > 템플릿에서 설정하세요.',
                formatWarning: '템플릿 형식은 선택한 폴더 노트 유형과 일치해야 합니다: .md, .canvas 또는 .base.'
            },
            folderNamesOpenFolderNotes: {
                name: '폴더 이름으로 폴더 노트 열기',
                desc: '폴더 이름을 클릭하면 해당 폴더 노트를 엽니다. 끄면 폴더 노트는 이름, 아이콘, 색상 같은 폴더 메타데이터만 제공합니다.'
            },
            hideFolderNoteInList: {
                name: '목록에서 폴더 노트 숨기기',
                desc: '파일 목록에서 폴더 노트를 숨깁니다.'
            },
            pinCreatedFolderNote: {
                name: '생성된 폴더 노트 고정',
                desc: '컨텍스트 메뉴에서 생성 시 폴더 노트를 고정합니다.'
            },
            folderNoteOpenLocation: {
                name: '폴더 노트 열 위치',
                desc: '폴더 노트 링크를 클릭할 때 폴더 노트를 열 위치를 선택합니다.',
                options: {
                    currentTab: '현재 탭',
                    newTab: '새 탭',
                    rightSidebar: '오른쪽 사이드바'
                }
            },
            showClosestFolderNoteInRightSidebar: {
                name: '오른쪽 사이드바: 가장 가까운 폴더 노트 표시',
                desc: '폴더를 선택하면 오른쪽 사이드바에 가장 가까운 상위 폴더 노트가 자동으로 표시됩니다.'
            },
            confirmBeforeDelete: {
                name: '삭제 전 확인',
                desc: '노트나 폴더를 삭제할 때 확인 대화 상자 표시'
            },
            deleteAttachments: {
                name: '파일 삭제 시 첨부 파일 삭제',
                desc: '연결된 첨부 파일과 생성된 그림 미리보기가 다른 곳에서 사용되지 않는 경우 자동으로 제거',
                options: {
                    ask: '매번 확인',
                    always: '항상',
                    never: '안 함'
                }
            },
            moveFileConflicts: {
                name: '이동 충돌',
                desc: '같은 이름의 파일이 이미 존재하는 폴더로 파일을 이동할 때. 매번 확인(이름 변경, 덮어쓰기, 취소)하거나 항상 이름을 변경합니다.',
                options: {
                    ask: '매번 확인',
                    rename: '항상 이름 변경'
                }
            },
            metadataCleanup: {
                name: '메타데이터 정리',
                desc: 'Obsidian 외부에서 파일, 폴더, 태그 또는 속성이 삭제, 이동 또는 이름이 변경될 때 남겨진 고아 메타데이터를 제거합니다. 이는 Notebook Navigator 설정 파일에만 영향을 줍니다.',
                buttonText: '메타데이터 정리',
                error: '설정 정리에 실패했습니다',
                loading: '메타데이터 확인 중...',
                statusClean: '정리할 메타데이터가 없습니다',
                statusCounts: '고아 항목: {folders} 폴더, {tags} 태그, {properties} 속성, {files} 파일, {pinned} 고정, {separators} 구분선'
            },
            rebuildCache: {
                name: '캐시 다시 빌드',
                desc: '태그 누락, 잘못된 미리보기 또는 누락된 이미지가 있을 때 사용하세요. 동기화 충돌이나 예기치 않은 종료 후에 발생할 수 있습니다.',
                buttonText: '캐시 다시 빌드',
                error: '캐시 다시 빌드 실패',
                indexingTitle: '보관함을 인덱싱하는 중...',
                progress: 'Notebook Navigator 캐시를 업데이트하는 중.'
            },
            iconPackManagement: {
                downloadButton: '다운로드',
                downloadingLabel: '다운로드 중...',
                removeButton: '제거',
                statusInstalled: '다운로드됨 (버전 {version})',
                statusNotInstalled: '다운로드되지 않음',
                versionUnknown: '알 수 없음',
                downloadFailed: '{name} 다운로드에 실패했습니다. 연결을 확인하고 다시 시도해주세요.',
                removeFailed: '{name} 제거에 실패했습니다.',
                infoNote:
                    '다운로드된 아이콘 팩은 기기 간 설치 상태를 동기화합니다. 아이콘 팩은 각 기기의 로컬 데이터베이스에 남아 있습니다. 동기화는 다운로드 또는 제거 여부만 추적합니다. 아이콘 팩은 Notebook Navigator 저장소에서 다운로드됩니다 (https://github.com/johansan/notebook-navigator/tree/main/icon-assets).'
            },
            useFrontmatterMetadata: {
                name: 'frontmatter 메타데이터 사용',
                desc: '노트 이름, 타임스탬프, 아이콘, 색상에 frontmatter 사용'
            },
            frontmatterNameFields: {
                name: '이름 필드',
                desc: '쉼표로 구분된 frontmatter 필드 목록. 첫 번째 비어 있지 않은 값을 사용. 파일 이름으로 대체.',
                placeholder: 'title, name'
            },
            frontmatterIconField: {
                name: '아이콘 필드',
                desc: '파일 아이콘용 frontmatter 필드입니다. 설정에 저장된 아이콘을 사용하려면 비워 두세요.',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: '색상 필드',
                desc: '파일 색상용 frontmatter 필드입니다. 설정에 저장된 색상을 사용하려면 비워 두세요.',
                placeholder: 'color'
            },
            frontmatterBackgroundField: {
                name: '배경 필드',
                desc: '배경색용 frontmatter 필드입니다. 설정에 저장된 배경색을 사용하려면 비워 두세요.',
                placeholder: 'background'
            },
            migrateIconsAndColorsFromSettings: {
                name: '설정에서 아이콘과 색상 이동',
                desc: '설정에 저장됨: 아이콘 {icons}개, 색상 {colors}개.',
                button: '이동',
                buttonWorking: '이동 중...',
                noticeNone: '설정에 저장된 파일 아이콘 또는 색상이 없습니다.',
                noticeDone: '아이콘 {migratedIcons}/{icons}개, 색상 {migratedColors}/{colors}개를 이동했습니다.',
                noticeFailures: '실패한 항목: {failures}.',
                noticeError: '이동에 실패했습니다. 자세한 내용은 콘솔을 확인하세요.'
            },
            frontmatterCreatedField: {
                name: '생성 타임스탬프 필드',
                desc: '생성된 타임스탬프의 frontmatter 필드 이름입니다. 파일 시스템 날짜만 사용하려면 비워 두세요.',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: '수정 타임스탬프 필드',
                desc: '수정된 타임스탬프의 frontmatter 필드 이름입니다. 파일 시스템 날짜만 사용하려면 비워 두세요.',
                placeholder: 'modified'
            },
            frontmatterTimestampFormat: {
                name: '타임스탬프 형식',
                desc: 'frontmatter에서 타임스탬프를 구문 분석하는 데 사용되는 형식입니다. ISO 8601 파싱을 사용하려면 비워 두세요.',
                helpTooltip: 'Moment 형식',
                momentLinkText: 'Moment 형식',
                help: '일반적인 형식:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: '개발 지원',
                desc: 'Notebook Navigator를 사용하는 것을 좋아하신다면 지속적인 개발을 지원해 주시기 바랍니다.',
                buttonText: '❤️ 후원하기',
                coffeeButton: '☕️ 커피 한 잔 사주기'
            },
            otherPlugins: {
                name: '제가 만든 다른 플러그인 보기',
                betterPaste: '붙여넣은 텍스트, 링크, 이미지를 정리',
                pixelPerfectImage: '정확한 이미지 크기 조정 등'
            },
            checkForNewVersionOnStart: {
                name: '시작 시 새 버전 확인',
                desc: '시작 시 새로운 플러그인 릴리스를 확인하고 업데이트가 있으면 알림을 표시합니다. 확인은 하루에 최대 한 번 수행됩니다.',
                status: '새 버전 사용 가능: {version}'
            },
            startupDebugLogging: {
                name: '시작 디버그 로그',
                desc: '시작 진단 정보를 보관함 루트의 타임스탬프가 있는 Markdown 파일에 기록한 뒤 시작이 안정되면 중지합니다. 이 파일은 동기화될 수 있으며 파일 경로를 포함할 수 있습니다.'
            },
            whatsNew: {
                name: 'Notebook Navigator {version}의 새로운 기능',
                desc: '최근 업데이트와 개선 사항 보기',
                buttonText: '최근 업데이트 보기'
            },
            masteringVideo: {
                name: 'Notebook Navigator 마스터하기 (동영상)',
                desc: '이 동영상에서는 Notebook Navigator를 효율적으로 사용하는 데 필요한 모든 것을 다룹니다. 단축키, 검색, 태그 및 고급 사용자 지정이 포함됩니다.'
            },
            cacheStatistics: {
                localCache: '로컬 캐시',
                items: '항목',
                withTags: '태그 포함',
                withPreviewText: '미리보기 텍스트 포함',
                withFeatureImage: '대표 이미지 포함',
                withMetadata: '메타데이터 포함'
            },
            metadataInfo: {
                successfullyParsed: '성공적으로 구문 분석됨',
                itemsWithName: '이름이 있는 항목',
                withCreatedDate: '생성 날짜 포함',
                withModifiedDate: '수정 날짜 포함',
                withIcon: '아이콘 포함',
                withColor: '색상 포함',
                failedToParse: '구문 분석 실패',
                createdDates: '생성 날짜',
                modifiedDates: '수정 날짜',
                checkTimestampFormat: '타임스탬프 형식을 확인하세요.',
                exportFailed: '오류 내보내기'
            }
        }
    },
    whatsNew: {
        title: 'Notebook Navigator의 새로운 기능',
        openBannerImage: '릴리스 배너 이미지 열기',
        supportMessage: 'Notebook Navigator가 도움이 되신다면 개발을 지원해 주시기 바랍니다.',
        supportButton: '커피 사주기',
        thanksButton: '감사합니다!'
    }
};
