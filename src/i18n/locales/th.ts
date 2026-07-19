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
 * Thai language strings for Notebook Navigator
 * Organized by feature/component for easy maintenance
 */
export const STRINGS_TH = {
    // Common UI elements
    common: {
        cancel: 'ยกเลิก',
        delete: 'ลบ',
        clear: 'ล้าง',
        remove: 'นำออก',
        restoreDefault: 'คืนค่าเริ่มต้น', // Button text for restoring values to defaults (English: Restore default)
        submit: 'ส่ง',
        save: 'บันทึก', // Button text for saving settings and dialogs (English: Save)
        configure: 'กำหนดค่า', // Generic button label used when opening a configuration dialog (English: Configure)
        lightMode: 'โหมดสว่าง', // Label for light theme mode (English: Light mode)
        darkMode: 'โหมดมืด', // Label for dark theme mode (English: Dark mode)
        noSelection: 'ไม่มีการเลือก',
        untagged: 'ไม่มีแท็ก',
        featureImageAlt: 'รูปภาพประกอบ',
        unknownError: 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        clipboardWriteError: 'ไม่สามารถเขียนลงคลิปบอร์ด',
        updateBannerTitle: 'มีการอัปเดต Notebook Navigator',
        updateBannerInstruction: 'อัปเดตใน การตั้งค่า -> ปลั๊กอินชุมชน',
        previous: 'ก่อนหน้า', // Generic aria label for previous navigation (English: Previous)
        next: 'ถัดไป' // Generic aria label for next navigation (English: Next)
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'เลือกโฟลเดอร์หรือแท็กเพื่อดูโน้ต',
        emptyStateNoNotes: 'ไม่มีโน้ต',
        pinnedSection: 'ปักหมุด',
        notesSection: 'โน้ต',
        filesSection: 'ไฟล์',
        hiddenItemAriaLabel: '{name} (ซ่อนอยู่)',
        collapseGroup: 'ยุบกลุ่ม',
        expandGroup: 'ขยายกลุ่ม',
        manualSortTitle: 'จัดเรียงด้วยตนเอง: {property}',
        manualSortHint: 'ลากเพื่อจัดเรียงใหม่ ลำดับจะถูกบันทึกเป็นค่าดัชนีตัวเลขในคุณสมบัติ "{property}"',
        manualSortNonMarkdownHint: 'ไฟล์ที่ไม่ใช่ Markdown จะแสดงด้านล่างและไม่สามารถจัดเรียงใหม่ได้',
        unsortedSection: 'ยังไม่จัดเรียง',
        manualSortDone: 'เสร็จ',
        manualSortMultipleWriteFailure: '{count} ไฟล์ล้มเหลว ไฟล์แรก: {path}: {message}'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'ไม่มีแท็ก',
        tags: 'แท็ก'
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'ทางลัด',
        recentFilesHeader: 'ไฟล์ล่าสุด', // Header label for recent files section in navigation pane (English: Recent files)
        properties: 'คุณสมบัติ',
        reorderRootFoldersTitle: 'จัดเรียงการนำทางใหม่',
        reorderRootFoldersHint: 'ใช้ลูกศรหรือลากเพื่อจัดเรียงใหม่',
        vaultRootLabel: 'ห้องนิรภัย',
        resetRootToAlpha: 'รีเซ็ตเป็นลำดับตัวอักษร',
        resetRootToFrequency: 'รีเซ็ตเป็นลำดับความถี่',
        pinShortcuts: 'ปักหมุดทางลัด',
        pinShortcutsAndRecentFiles: 'ปักหมุดทางลัดและไฟล์ล่าสุด',
        unpinShortcuts: 'เลิกปักหมุดทางลัด',
        unpinShortcutsAndRecentFiles: 'เลิกปักหมุดทางลัดและไฟล์ล่าสุด',
        profileMenuAria: 'เปลี่ยนโปรไฟล์ห้องนิรภัย'
    },

    navigationCalendar: {
        ariaLabel: 'ปฏิทิน',
        dailyNotesNotEnabled: 'ปลั๊กอินบันทึกรายวันไม่ได้เปิดใช้งาน',
        noteHiddenByProfile: 'โน้ตปฏิทินถูกซ่อนโดยโปรไฟล์คลังปัจจุบัน',
        createDailyNote: {
            title: 'บันทึกรายวันใหม่',
            message: 'ไฟล์ {filename} ไม่มีอยู่ คุณต้องการสร้างหรือไม่?',
            confirmButton: 'สร้าง'
        },
        helpModal: {
            title: 'ทางลัดปฏิทิน',
            items: [
                'คลิกวันใดก็ได้เพื่อเปิดหรือสร้างบันทึกประจำวัน สัปดาห์ เดือน ไตรมาส และปีทำงานในลักษณะเดียวกัน',
                'จุดทึบใต้วันหมายความว่ามีบันทึก จุดกลวงหมายความว่ามีงานที่ยังไม่เสร็จ',
                'หากบันทึกมีภาพเด่น จะแสดงเป็นพื้นหลังของวัน'
            ],
            dateFilterCmdCtrl: '`Cmd/Ctrl`+คลิกที่วันที่เพื่อกรองตามวันที่นั้นในรายการไฟล์',
            dateFilterOptionAlt: '`Option/Alt`+คลิกที่วันที่เพื่อกรองตามวันที่นั้นในรายการไฟล์'
        }
    },

    dailyNotes: {
        templateReadFailed: 'ไม่สามารถอ่านเทมเพลตบันทึกรายวัน',
        createFailed: 'ไม่สามารถสร้างบันทึกรายวัน'
    },

    shortcuts: {
        folderExists: 'โฟลเดอร์อยู่ในทางลัดแล้ว',
        noteExists: 'โน้ตอยู่ในทางลัดแล้ว',
        tagExists: 'แท็กอยู่ในทางลัดแล้ว',
        propertyExists: 'คุณสมบัติมีอยู่ในทางลัดแล้ว',
        invalidProperty: 'ทางลัดคุณสมบัติไม่ถูกต้อง',
        searchExists: 'ทางลัดการค้นหามีอยู่แล้ว',
        emptySearchQuery: 'กรอกคำค้นหาก่อนบันทึก',
        emptySearchName: 'กรอกชื่อก่อนบันทึกการค้นหา',
        add: 'เพิ่มในทางลัด',
        addNotesCount: 'เพิ่ม {count} โน้ตไปยังทางลัด',
        addFilesCount: 'เพิ่ม {count} ไฟล์ไปยังทางลัด',
        rename: 'เปลี่ยนชื่อทางลัด',
        remove: 'นำออกจากทางลัด',
        removeAll: 'ลบทางลัดทั้งหมด',
        removeAllConfirm: 'ลบทางลัดทั้งหมด?',
        folderNotesPinned: 'ปักหมุด {count} โน้ตโฟลเดอร์แล้ว'
    },

    // Pane header
    paneHeader: {
        collapseAllFolders: 'ยุบรายการ',
        expandAllFolders: 'ขยายรายการทั้งหมด',
        showCalendar: 'แสดงปฏิทิน',
        hideCalendar: 'ซ่อนปฏิทิน',
        newFolder: 'โฟลเดอร์ใหม่',
        newNote: 'โน้ตใหม่',
        mobileBackToNavigation: 'กลับไปการนำทาง',
        changeChildSortOrder: 'เปลี่ยนลำดับการเรียง',
        changeSortAndGroup: 'เปลี่ยนการเรียงและการจัดกลุ่ม',
        resetViewToDefaults: 'รีเซ็ตมุมมองเป็นค่าเริ่มต้น',
        manualSort: 'จัดเรียงด้วยตนเอง',
        editSortOrder: 'แก้ไขลำดับการจัดเรียง...',
        removeSortProperty: 'ลบคุณสมบัติการจัดเรียง',
        descendants: 'รายการย่อย',
        subfolders: 'โฟลเดอร์ย่อย',
        subtags: 'แท็กย่อย',
        childValues: 'ค่าย่อย',
        applySortAndGroupToDescendants: (target: string) => `ใช้การเรียงและการจัดกลุ่มกับ${target}`,
        applyAppearanceToDescendants: (target: string) => `ใช้รูปลักษณ์กับ${target}`,
        showFolders: 'แสดงการนำทาง',
        reorderRootFolders: 'จัดเรียงการนำทางใหม่',
        finishRootFolderReorder: 'เสร็จสิ้น',
        showExcludedItems: 'แสดงโฟลเดอร์ แท็ก และโน้ตที่ซ่อน',
        hideExcludedItems: 'ซ่อนโฟลเดอร์ แท็ก และโน้ตที่ซ่อน',
        showDualPane: 'แสดงแผงคู่',
        showSinglePane: 'แสดงแผงเดียว',
        dualPaneAutoFallbackNotice:
            'ไม่สามารถใช้สองแผงได้เมื่อแถบด้านข้างแคบเกินไป หากต้องการเปลี่ยน ให้ตั้ง "เมื่อแถบด้านข้างแคบเกินไป" เป็น "ไม่ต้องทำอะไร" ในการตั้งค่า > ลักษณะและพฤติกรรม',
        changeAppearance: 'เปลี่ยนลักษณะ',
        showNotesFromSubfolders: 'แสดงโน้ตจากโฟลเดอร์ย่อย',
        showFilesFromSubfolders: 'แสดงไฟล์จากโฟลเดอร์ย่อย',
        showNotesFromDescendants: 'แสดงโน้ตจากลูกหลาน',
        showFilesFromDescendants: 'แสดงไฟล์จากลูกหลาน',
        search: 'ค้นหา'
    },
    // Search input
    searchInput: {
        placeholder: 'ค้นหา...',
        placeholderVault: 'ค้นหาห้องนิรภัย...',
        placeholderOmnisearch: 'Omnisearch...',
        clearSearch: 'ล้างการค้นหา',
        switchToFilterSearch: 'สลับไปใช้การค้นหาแบบกรอง',
        switchToOmnisearch: 'สลับไปใช้ Omnisearch',
        saveSearchShortcut: 'บันทึกทางลัดการค้นหา',
        removeSearchShortcut: 'นำทางลัดการค้นหาออก',
        shortcutModalTitle: 'บันทึกทางลัดการค้นหา',
        shortcutNamePlaceholder: 'กรอกชื่อทางลัด',
        shortcutStartIn: 'เริ่มต้นใน: {path} เสมอ',
        searchHelp: 'ไวยากรณ์การค้นหา',
        searchHelpTitle: 'ไวยากรณ์การค้นหา',
        searchHelpModal: {
            intro: 'รวมชื่อไฟล์ คุณสมบัติ แท็ก วันที่ และตัวกรองในคำค้นหาเดียว (เช่น `meeting .status=active #work @thisweek`) ติดตั้งปลั๊กอิน Omnisearch เพื่อใช้การค้นหาข้อความเต็ม',
            introSwitching: 'สลับระหว่างการค้นหาแบบกรองและ Omnisearch โดยใช้ปุ่มลูกศรขึ้น/ลงหรือคลิกไอคอนค้นหา',
            sections: {
                fileNames: {
                    title: 'ชื่อไฟล์',
                    items: [
                        '`word` ค้นหาโน้ตที่มี "word" ในชื่อไฟล์',
                        '`word1 word2` ทุกคำต้องตรงกับชื่อไฟล์',
                        '`-word` ไม่รวมโน้ตที่มี "word" ในชื่อไฟล์'
                    ]
                },
                tags: {
                    title: 'แท็ก',
                    items: [
                        '`#tag` รวมโน้ตที่มีแท็ก (ตรงกับแท็กย่อยเช่น `#tag/subtag` ด้วย)',
                        '`#` รวมเฉพาะโน้ตที่มีแท็ก',
                        '`-#tag` ไม่รวมโน้ตที่มีแท็ก',
                        '`-#` รวมเฉพาะโน้ตที่ไม่มีแท็ก',
                        '`#tag1 #tag2` ค้นหาทั้งสองแท็ก (AND โดยนัย)',
                        '`#tag1 AND #tag2` ค้นหาทั้งสองแท็ก (AND ชัดเจน)',
                        '`#tag1 OR #tag2` ค้นหาแท็กใดแท็กหนึ่ง',
                        '`#a OR #b AND #c` AND มีความสำคัญสูงกว่า: ตรงกับ `#a` หรือทั้ง `#b` และ `#c`',
                        'Cmd/Ctrl+คลิกแท็กเพื่อเพิ่มด้วย AND Cmd/Ctrl+Shift+คลิกเพื่อเพิ่มด้วย OR'
                    ]
                },
                properties: {
                    title: 'คุณสมบัติ',
                    items: [
                        '`.key` รวมโน้ตที่มีคีย์คุณสมบัติ',
                        '`.key=value` รวมโน้ตที่ค่าคุณสมบัติมี `value` อยู่',
                        '`."Reading Status"` รวมโน้ตที่มีคีย์คุณสมบัติที่มีช่องว่าง',
                        '`."Reading Status"="In Progress"` คีย์และค่าที่มีช่องว่างต้องอยู่ในเครื่องหมายคำพูดคู่',
                        '`-.key` ไม่รวมโน้ตที่มีคีย์คุณสมบัติ',
                        '`-.key=value` ไม่รวมโน้ตที่ค่าคุณสมบัติมี `value` อยู่',
                        'Cmd/Ctrl+คลิกคุณสมบัติเพื่อเพิ่มด้วย AND Cmd/Ctrl+Shift+คลิกเพื่อเพิ่มด้วย OR'
                    ]
                },
                tasks: {
                    title: 'ตัวกรอง',
                    items: [
                        '`has:task` รวมบันทึกที่มีงานที่ยังไม่เสร็จ',
                        '`-has:task` ไม่รวมบันทึกที่มีงานที่ยังไม่เสร็จ',
                        '`folder:meetings` รวมบันทึกที่ชื่อโฟลเดอร์มี `meetings`',
                        '`folder:/work/meetings` รวมบันทึกเฉพาะใน `work/meetings` (ไม่รวมโฟลเดอร์ย่อย)',
                        '`folder:/` รวมบันทึกเฉพาะในรากของห้องนิรภัย',
                        '`-folder:archive` ไม่รวมบันทึกที่ชื่อโฟลเดอร์มี `archive`',
                        '`-folder:/archive` ไม่รวมบันทึกเฉพาะใน `archive` (ไม่รวมโฟลเดอร์ย่อย)',
                        '`ext:md` รวมบันทึกที่มีนามสกุล `md` (`ext:.md` รองรับเช่นกัน)',
                        '`-ext:pdf` ไม่รวมบันทึกที่มีนามสกุล `pdf`',
                        'รวมกับแท็ก ชื่อ และวันที่ (ตัวอย่าง: `folder:/work/meetings ext:md @thisweek`)'
                    ]
                },
                connectors: {
                    title: 'พฤติกรรม AND/OR',
                    items: [
                        '`AND` และ `OR` เป็นตัวดำเนินการเฉพาะในการค้นหาที่มีแท็กและคุณสมบัติเท่านั้น',
                        'การค้นหาเฉพาะแท็กและคุณสมบัติประกอบด้วยตัวกรองแท็กและคุณสมบัติเท่านั้น: `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, `-.key=value`',
                        'หากคิวรีรวมชื่อ วันที่ (`@...`) ตัวกรองงาน (`has:task`) ตัวกรองโฟลเดอร์ (`folder:...`) หรือตัวกรองนามสกุล (`ext:...`) `AND` และ `OR` จะถูกค้นหาเป็นคำ',
                        'ตัวอย่างการค้นหาด้วยตัวดำเนินการ: `#work OR .status=started`',
                        'ตัวอย่างคิวรีผสม: `#work OR ext:md` (`OR` ถูกค้นหาในชื่อไฟล์)'
                    ]
                },
                dates: {
                    title: 'วันที่',
                    items: [
                        '`@today` ค้นหาโน้ตวันนี้โดยใช้ฟิลด์วันที่เริ่มต้น',
                        '`@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` ช่วงวันที่สัมพัทธ์',
                        '`@2026-02-07` ค้นหาวันที่เฉพาะ (รองรับ `@20260207` ด้วย)',
                        '`@2026` ค้นหาปีปฏิทิน',
                        '`@2026-02` หรือ `@202602` ค้นหาเดือนปฏิทิน',
                        '`@2026-W05` หรือ `@2026W05` ค้นหาสัปดาห์ ISO',
                        '`@2026-Q2` หรือ `@2026Q2` ค้นหาไตรมาสปฏิทิน',
                        '`@13/02/2026` รูปแบบตัวเลขที่มีตัวคั่น (`@07022026` ตามการตั้งค่าท้องถิ่นเมื่อคลุมเครือ)',
                        '`@2026-02-01..2026-02-07` ค้นหาช่วงวันที่รวม (รองรับปลายเปิด)',
                        '`@c:...` หรือ `@m:...` กำหนดเป้าหมายวันที่สร้างหรือแก้ไข',
                        '`-@...` ไม่รวมการจับคู่วันที่'
                    ]
                },
                omnisearch: {
                    title: 'Omnisearch',
                    items: [
                        'ค้นหาข้อความเต็มทั่วทั้งห้องนิรภัย กรองตามโฟลเดอร์ปัจจุบันหรือแท็กที่เลือก',
                        'อาจช้าเมื่อป้อนน้อยกว่า 3 ตัวอักษรในห้องนิรภัยขนาดใหญ่',
                        'ไม่สามารถค้นหาเส้นทางที่มีอักขระที่ไม่ใช่ ASCII หรือค้นหาเส้นทางย่อยได้อย่างถูกต้อง',
                        'ส่งคืนผลลัพธ์จำกัดก่อนการกรองโฟลเดอร์ ดังนั้นไฟล์ที่เกี่ยวข้องอาจไม่แสดงหากมีรายการที่ตรงกันจำนวนมากในที่อื่น',
                        'ตัวอย่างโน้ตแสดงข้อความที่ตัดตอนจาก Omnisearch แทนข้อความตัวอย่างเริ่มต้น'
                    ]
                }
            }
        }
    },

    // Context menus
    contextMenu: {
        file: {
            openInNewTab: 'เปิดในแท็บใหม่',
            openToRight: 'เปิดทางขวา',
            openInNewWindow: 'เปิดในหน้าต่างใหม่',
            openMultipleInNewTabs: 'เปิด {count} โน้ตในแท็บใหม่',
            openMultipleFilesInNewTabs: 'เปิด {count} ไฟล์ในแท็บใหม่',
            openMultipleToRight: 'เปิด {count} โน้ตทางขวา',
            openMultipleFilesToRight: 'เปิด {count} ไฟล์ทางขวา',
            openMultipleInNewWindows: 'เปิด {count} โน้ตในหน้าต่างใหม่',
            openMultipleFilesInNewWindows: 'เปิด {count} ไฟล์ในหน้าต่างใหม่',
            pinNote: 'ปักหมุดโน้ต',
            pinFile: 'ปักหมุดไฟล์',
            unpinNote: 'เลิกปักหมุดโน้ต',
            unpinFile: 'เลิกปักหมุดไฟล์',
            pinMultipleNotes: 'ปักหมุด {count} โน้ต',
            pinMultipleFiles: 'ปักหมุด {count} ไฟล์',
            unpinMultipleNotes: 'เลิกปักหมุด {count} โน้ต',
            unpinMultipleFiles: 'เลิกปักหมุด {count} ไฟล์',
            duplicateNote: 'ทำซ้ำโน้ต',
            duplicateFile: 'ทำซ้ำไฟล์',
            duplicateMultipleNotes: 'ทำซ้ำ {count} โน้ต',
            duplicateMultipleFiles: 'ทำซ้ำ {count} ไฟล์',
            openVersionHistory: 'เปิดประวัติเวอร์ชัน',
            revealInFolder: 'แสดงในโฟลเดอร์',
            revealInFinder: 'แสดงใน Finder',
            showInExplorer: 'แสดงใน explorer ระบบ',
            openInDefaultApp: 'เปิดในแอปเริ่มต้น',
            renameNote: 'เปลี่ยนชื่อโน้ต',
            renameFile: 'เปลี่ยนชื่อไฟล์',
            deleteNote: 'ลบโน้ต',
            deleteFile: 'ลบไฟล์',
            setCalendarHighlight: 'ตั้งค่าไฮไลต์',
            removeCalendarHighlight: 'ลบไฮไลต์',
            deleteMultipleNotes: 'ลบ {count} โน้ต',
            deleteMultipleFiles: 'ลบ {count} ไฟล์',
            moveNoteToFolder: 'ย้ายโน้ตไปยัง...',
            moveFileToFolder: 'ย้ายไฟล์ไปยัง...',
            moveMultipleNotesToFolder: 'ย้าย {count} โน้ตไปยัง...',
            moveMultipleFilesToFolder: 'ย้าย {count} ไฟล์ไปยัง...',
            mergeNotes: 'รวม {count} โน้ต...',
            mergeNotesInGroup: 'รวมโน้ตในกลุ่ม...',
            setManualSortGroupHeader: 'ตั้งค่าส่วนหัวกลุ่ม',
            changeManualSortGroupHeader: 'เปลี่ยนส่วนหัวกลุ่ม',
            manualSortGroupHeader: {
                title: 'ส่วนหัวกลุ่ม',
                copyStyle: 'คัดลอกสไตล์ส่วนหัว',
                pasteStyle: 'วางสไตล์ส่วนหัว',
                remove: 'นำส่วนหัวกลุ่มออก'
            },
            addTag: 'เพิ่มแท็ก',
            addPropertyKey: 'ตั้งค่าคุณสมบัติ',
            removeTag: 'นำแท็กออก',
            removeAllTags: 'นำแท็กทั้งหมดออก',
            changeIcon: 'เปลี่ยนไอคอน',
            changeColor: 'เปลี่ยนสี'
        },
        folder: {
            newNote: 'โน้ตใหม่',
            newNoteFromTemplate: 'โน้ตใหม่จากเทมเพลต',
            newFolder: 'โฟลเดอร์ใหม่',
            newCanvas: 'Canvas ใหม่',
            newBase: 'Base ใหม่',
            newDrawing: 'ภาพวาดใหม่',
            newExcalidrawDrawing: 'ภาพวาด Excalidraw ใหม่',
            newTldrawDrawing: 'ภาพวาด Tldraw ใหม่',
            duplicateFolder: 'ทำซ้ำโฟลเดอร์',
            searchInFolder: 'ค้นหาในโฟลเดอร์',
            createFolderNote: 'สร้างโน้ตโฟลเดอร์',
            detachFolderNote: 'แยกโน้ตโฟลเดอร์',
            deleteFolderNote: 'ลบโน้ตโฟลเดอร์',
            changeIcon: 'เปลี่ยนไอคอน',
            changeColor: 'เปลี่ยนสี',
            changeBackground: 'เปลี่ยนพื้นหลัง',
            excludeFolder: 'ซ่อนโฟลเดอร์',
            unhideFolder: 'เลิกซ่อนโฟลเดอร์',
            excludeFromDescendants: 'ซ่อนจากโฟลเดอร์แม่',
            includeInDescendants: 'แสดงในโฟลเดอร์แม่',
            hiddenFromParentsIndicator: 'ซ่อนจากรายการโฟลเดอร์แม่',
            moveFolder: 'ย้ายโฟลเดอร์ไปยัง...',
            renameFolder: 'เปลี่ยนชื่อโฟลเดอร์',
            deleteFolder: 'ลบโฟลเดอร์'
        },
        tag: {
            changeIcon: 'เปลี่ยนไอคอน',
            changeColor: 'เปลี่ยนสี',
            changeBackground: 'เปลี่ยนพื้นหลัง',
            showTag: 'แสดงแท็ก',
            hideTag: 'ซ่อนแท็ก'
        },
        property: {
            addKey: 'กำหนดค่าคีย์คุณสมบัติ',
            renameKey: 'เปลี่ยนชื่อคุณสมบัติ',
            deleteKey: 'ลบคุณสมบัติ'
        },
        navigation: {
            addSeparator: 'เพิ่มตัวคั่น',
            removeSeparator: 'นำตัวคั่นออก'
        },
        copyPath: {
            title: 'คัดลอกเส้นทาง',
            asObsidianUrl: 'เป็น URL Obsidian',
            fromVaultFolder: 'จากโฟลเดอร์ห้องนิรภัย',
            fromSystemRoot: 'จากรากระบบ'
        },
        style: {
            title: 'สไตล์',
            copy: 'คัดลอกสไตล์',
            paste: 'วางสไตล์',
            removeIcon: 'ลบไอคอน',
            removeColor: 'ลบสี',
            removeBackground: 'ลบพื้นหลัง',
            clear: 'ล้างสไตล์'
        }
    },

    // Folder appearance menu
    folderAppearance: {
        appearance: 'ลักษณะ',
        sortBy: 'เรียงตาม',
        standardPreset: 'มาตรฐาน',
        compactPreset: 'กะทัดรัด',
        defaultSuffix: '(ค่าเริ่มต้น)',
        defaultLabel: 'ค่าเริ่มต้น',
        titleRows: 'แถวชื่อเรื่อง',
        previewRows: 'แถวตัวอย่าง',
        groupBy: 'จัดกลุ่มตาม',
        titleRowOption: (rows: number) => `${rows} แถวชื่อเรื่อง`,
        previewRowOption: (rows: number) => `${rows} แถวตัวอย่าง`
    },

    // Modal dialogs
    modals: {
        bulkApply: {
            applyButton: 'ใช้',
            applySortAndGroupTitle: (target: string) => `ใช้การเรียงและการจัดกลุ่มกับ${target}?`,
            applyAppearanceTitle: (target: string) => `ใช้รูปลักษณ์กับ${target}?`,
            affectedCountMessage: (count: number) => `การแทนที่ที่มีอยู่ซึ่งจะเปลี่ยนแปลง: ${count}`
        },
        manualSortConfirm: {
            propertySortTitle: 'ใช้การจัดเรียงด้วยตนเองหรือไม่?',
            propertySortMessage: (property: string, count: number) =>
                `จะสลับมุมมองปัจจุบันเป็นการจัดเรียงด้วยตนเองโดยใช้ "${property}" การแก้ไขลำดับจะเขียนค่าดัชนีตัวเลขลงในคุณสมบัตินั้นใน ${count} โน้ต ตามความจำเป็น`,
            propertySortConfirmButton: 'ใช้การจัดเรียงด้วยตนเอง',
            removePropertyTitle: 'ลบคุณสมบัติการจัดเรียงหรือไม่?',
            removePropertyMessage: (property: string, count: number) =>
                `จะลบ "${property}" ออกจาก ${count} โน้ตในรายการปัจจุบัน ลำดับการจัดเรียงด้วยตนเองของโน้ตเหล่านั้นจะถูกล้าง`,
            removePropertyConfirmButton: 'ลบคุณสมบัติ',
            compactTitle: 'บีบอัดค่าดัชนีหรือไม่?',
            compactMessage: (count: number) => `การจัดเรียงใหม่นี้ต้องการพื้นที่ตัวเลขเพิ่มเติม ${count} โน้ต จะได้รับค่าดัชนีใหม่`,
            compactConfirmButton: 'บีบอัดค่าดัชนี'
        },
        manualSortGroupHeader: {
            title: 'ตั้งค่าส่วนหัวกลุ่ม',
            titleLabel: 'ชื่อเรื่อง',
            placeholder: 'ส่วนหัวกลุ่ม',
            icon: 'ไอคอน',
            color: 'สี',
            wordCount: 'แสดงจำนวนคำ',
            wordCountTarget: 'จำนวนคำเป้าหมาย',
            wordCountTargetPlaceholder: '10,000',
            wordCountTargetDescription:
                'เมื่อฟิลด์นี้ว่าง เป้าหมายกลุ่มจะใช้คุณสมบัติเป้าหมายที่ตั้งไว้ใน การตั้งค่า > โน้ต > จำนวนคำและอักขระ แทนที่ได้โดยตั้งค่าเป้าหมายสำหรับกลุ่มนี้',
            description: 'ปรับแต่งส่วนหัวกลุ่มสำหรับโน้ตนี้ เว้นชื่อเรื่องว่างเพื่อนำส่วนหัวออก'
        },
        mergeNotes: {
            title: 'รวมโน้ต',
            summary: 'สร้างโน้ตหนึ่งรายการจาก {count} โน้ตใน {folder}',
            frontmatterRule: 'Frontmatter จากโน้ตแรกจะถูกเก็บไว้ Frontmatter จากโน้ตอื่นจะถูกลบออก',
            crossFolderWarning: 'โน้ตต้นทางอยู่ในโฟลเดอร์ต่างกัน ลิงก์สัมพัทธ์และการฝังอาจหยุดทำงานในโน้ตที่รวมแล้ว',
            outputName: 'ชื่อผลลัพธ์',
            outputNameDesc: 'โน้ตที่รวมแล้วจะถูกสร้างในโฟลเดอร์ที่แสดงด้านบน',
            outputNamePlaceholder: 'โน้ตที่รวมแล้ว',
            separator: 'ตัวคั่น',
            separatorDesc: 'แทรกระหว่างโน้ต',
            separatorOptions: {
                none: 'ไม่มี',
                blankLine: 'บรรทัดว่าง',
                horizontalRule: 'เส้นแนวนอน',
                heading: 'หัวเรื่องพร้อมชื่อโน้ต'
            },
            moveSourcesToTrash: 'ย้ายโน้ตต้นทางไปที่ถังขยะหลังจากรวม',
            mergeButton: 'รวม'
        },
        navRainbowSection: {
            title: (section: string) => `สีรุ้ง: ${section}`
        },
        iconPicker: {
            searchPlaceholder: 'ค้นหาไอคอน...',
            recentlyUsedHeader: 'ใช้ล่าสุด',
            emptyStateSearch: 'เริ่มพิมพ์เพื่อค้นหาไอคอน',
            emptyStateNoResults: 'ไม่พบไอคอน',
            showingResultsInfo: 'แสดง 50 จาก {count} ผลลัพธ์ พิมพ์เพิ่มเพื่อจำกัด',
            emojiInstructions: 'พิมพ์หรือวางอีโมจิเพื่อใช้เป็นไอคอน',
            removeIcon: 'นำไอคอนออก',
            removeFromRecents: 'นำออกจากรายการล่าสุด',
            allTabLabel: 'ทั้งหมด'
        },
        fileIconRuleEditor: {
            addRuleAria: 'เพิ่มกฎ'
        },
        interfaceIcons: {
            title: 'ไอคอนอินเทอร์เฟซ',
            fileItemsSection: 'รายการไฟล์',
            items: {
                'nav-shortcuts': 'ทางลัด',
                'nav-recent-files': 'ไฟล์ล่าสุด',
                'nav-expand-all': 'ขยายทั้งหมด',
                'nav-collapse-all': 'ยุบทั้งหมด',
                'nav-calendar': 'ปฏิทิน',
                'nav-tree-expand': 'ลูกศรต้นไม้: ขยาย',
                'nav-tree-collapse': 'ลูกศรต้นไม้: ยุบ',
                'nav-hidden-items': 'รายการที่ซ่อน',
                'nav-root-reorder': 'จัดเรียงโฟลเดอร์รากใหม่',
                'nav-new-folder': 'โฟลเดอร์ใหม่',
                'nav-show-single-pane': 'แสดงแผงเดียว',
                'nav-show-dual-pane': 'แสดงแผงคู่',
                'nav-profile-chevron': 'ลูกศรเมนูโปรไฟล์',
                'list-search': 'ค้นหา',
                'list-reveal-file': 'แสดงไฟล์',
                'list-descendants': 'โน้ตจากโฟลเดอร์ย่อย',
                'list-sort-ascending': 'ลำดับ: น้อยไปมาก',
                'list-sort-descending': 'ลำดับ: มากไปน้อย',
                'list-sort-modified': 'จัดเรียงตามวันที่แก้ไข',
                'list-sort-created': 'จัดเรียงตามวันที่สร้าง',
                'list-sort-title': 'จัดเรียงตามชื่อเรื่อง',
                'list-sort-filename': 'จัดเรียงตามชื่อไฟล์',
                'list-sort-property': 'จัดเรียงตามคุณสมบัติ',
                'list-appearance': 'เปลี่ยนรูปลักษณ์',
                'list-new-note': 'โน้ตใหม่',
                'list-pinned': 'โน้ตที่ปักหมุด',
                'nav-folder-open': 'โฟลเดอร์เปิด',
                'nav-folder-closed': 'โฟลเดอร์ปิด',
                'nav-tags': 'แท็ก',
                'nav-tag': 'แท็ก',
                'nav-properties': 'คุณสมบัติ',
                'nav-property': 'คุณสมบัติ',
                'nav-property-value': 'ค่า',
                'file-unfinished-task': 'งานที่ยังไม่เสร็จ',
                'file-word-count': 'จำนวนคำ',
                'file-character-count': 'จำนวนอักขระ'
            }
        },
        colorPicker: {
            currentColor: 'ปัจจุบัน',
            newColor: 'ใหม่',
            paletteDefault: 'ค่าเริ่มต้น',
            paletteCustom: 'กำหนดเอง',
            copyColors: 'คัดลอกสี',
            colorsCopied: 'คัดลอกสีไปคลิปบอร์ดแล้ว',
            pasteColors: 'วางสี',
            pasteClipboardError: 'ไม่สามารถอ่านคลิปบอร์ด',
            pasteInvalidFormat: 'ต้องการค่าสี hex',
            colorsPasted: 'วางสีสำเร็จ',
            resetUserColors: 'ล้างสีที่กำหนดเอง',
            clearCustomColorsConfirm: 'ลบสีที่กำหนดเองทั้งหมด?',
            userColorSlot: 'สี {slot}',
            recentColors: 'สีล่าสุด',
            clearRecentColors: 'ล้างสีล่าสุด',
            removeRecentColor: 'นำสีออก',
            apply: 'นำไปใช้',
            pickerLabel: 'ตัวเลือก',
            hexLabel: 'HEX',
            hexInputLabel: 'ค่าสี HEX',
            saturationValueArea: 'ความอิ่มตัวและความสว่าง',
            hueSlider: 'เฉดสี',
            alphaSlider: 'ความโปร่งใส'
        },
        appearance: {
            tabIcon: 'ไอคอน',
            tabColor: 'สี',
            tabBackground: 'พื้นหลัง',
            resetIcon: 'ลบไอคอน',
            resetColor: 'ลบสี',
            resetBackground: 'ลบพื้นหลัง',
            clear: 'ล้างสไตล์',
            apply: 'นำไปใช้'
        },
        selectVaultProfile: {
            title: 'เลือกโปรไฟล์ห้องนิรภัย',
            currentBadge: 'ใช้งานอยู่',
            emptyState: 'ไม่มีโปรไฟล์ห้องนิรภัย'
        },
        tagOperation: {
            renameTitle: 'เปลี่ยนชื่อแท็ก {tag}',
            deleteTitle: 'ลบแท็ก {tag}',
            newTagPrompt: 'ชื่อแท็กใหม่',
            newTagPlaceholder: 'กรอกชื่อแท็กใหม่',
            renameWarning: 'การเปลี่ยนชื่อแท็ก {oldTag} จะแก้ไข {count} {files}',
            deleteWarning: 'การลบแท็ก {tag} จะแก้ไข {count} {files}',
            modificationWarning: 'การดำเนินการนี้จะอัปเดตวันที่แก้ไขไฟล์',
            affectedFiles: 'ไฟล์ที่ได้รับผลกระทบ:',
            andMore: '...และอีก {count}',
            confirmRename: 'เปลี่ยนชื่อแท็ก',
            renameUnchanged: '{tag} ไม่เปลี่ยนแปลง',
            renameNoChanges: '{oldTag} → {newTag} ({countLabel})',
            renameBatchNotFinalized: 'เปลี่ยนชื่อแล้ว {renamed}/{total} ไม่ได้อัปเดต: {notUpdated} ข้อมูลเมตาและทางลัดไม่ได้รับการอัปเดต',
            invalidTagName: 'กรอกชื่อแท็กที่ถูกต้อง',
            descendantRenameError: 'ไม่สามารถย้ายแท็กไปยังตัวเองหรือลูกหลาน',
            confirmDelete: 'ลบแท็ก',
            deleteBatchNotFinalized: 'ลบออกจาก {removed}/{total} ไม่ได้อัปเดต: {notUpdated} ข้อมูลเมตาและทางลัดไม่ได้รับการอัปเดต',
            checkConsoleForDetails: 'ตรวจสอบคอนโซลเพื่อดูรายละเอียด',
            file: 'ไฟล์',
            files: 'ไฟล์',
            inlineParsingWarning: {
                title: 'ความเข้ากันได้ของแท็กแบบอินไลน์',
                message: '{tag} มีอักขระที่ Obsidian ไม่สามารถแยกวิเคราะห์ในแท็กแบบอินไลน์ได้ แท็ก Frontmatter ไม่ได้รับผลกระทบ',
                confirm: 'ใช้ต่อไป'
            }
        },
        propertyOperation: {
            renameTitle: 'เปลี่ยนชื่อคุณสมบัติ {property}',
            deleteTitle: 'ลบคุณสมบัติ {property}',
            newKeyPrompt: 'ชื่อคุณสมบัติใหม่',
            newKeyPlaceholder: 'ป้อนชื่อคุณสมบัติใหม่',
            renameWarning: 'การเปลี่ยนชื่อคุณสมบัติ {property} จะแก้ไข {count} {files}',
            renameConflictWarning:
                'คุณสมบัติ {newKey} มีอยู่แล้วใน {count} {files} การเปลี่ยนชื่อ {oldKey} จะแทนที่ค่าที่มีอยู่ของ {newKey}',
            deleteWarning: 'การลบคุณสมบัติ {property} จะแก้ไข {count} {files}',
            confirmRename: 'เปลี่ยนชื่อคุณสมบัติ',
            confirmDelete: 'ลบคุณสมบัติ',
            renameNoChanges: '{oldKey} → {newKey} (ไม่มีการเปลี่ยนแปลง)',
            renameSettingsUpdateFailed: 'เปลี่ยนชื่อคุณสมบัติ {oldKey} → {newKey} แล้ว ไม่สามารถอัปเดตการตั้งค่าได้',
            deleteSingleSuccess: 'ลบคุณสมบัติ {property} จาก 1 โน้ตแล้ว',
            deleteMultipleSuccess: 'ลบคุณสมบัติ {property} จาก {count} โน้ตแล้ว',
            deleteSettingsUpdateFailed: 'ลบคุณสมบัติ {property} แล้ว ไม่สามารถอัปเดตการตั้งค่าได้',
            invalidKeyName: 'กรุณาป้อนชื่อคุณสมบัติที่ถูกต้อง'
        },
        fileSystem: {
            newFolderTitle: 'โฟลเดอร์ใหม่',
            renameFolderTitle: 'เปลี่ยนชื่อโฟลเดอร์',
            renameFileTitle: 'เปลี่ยนชื่อไฟล์',
            deleteFolderTitle: "ลบ '{name}'?",
            deleteFileTitle: "ลบ '{name}'?",
            deleteFileAttachmentsTitle: 'ลบไฟล์แนบ?',
            moveFileConflictTitle: 'ข้อขัดแย้งการย้าย',
            folderNamePrompt: 'กรอกชื่อโฟลเดอร์:',
            hideInOtherVaultProfiles: 'ซ่อนในโปรไฟล์ห้องนิรภัยอื่น',
            renamePrompt: 'กรอกชื่อใหม่:',
            renameVaultTitle: 'เปลี่ยนชื่อแสดงห้องนิรภัย',
            renameVaultPrompt: 'กรอกชื่อแสดงที่กำหนดเอง (เว้นว่างเพื่อใช้ค่าเริ่มต้น):',
            deleteFolderConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบโฟลเดอร์นี้และเนื้อหาทั้งหมด?',
            deleteFileConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์นี้?',
            deleteFileAttachmentsDescriptionSingle: 'ไฟล์แนบนี้ไม่ได้ถูกใช้ในโน้ตใดแล้ว คุณต้องการลบหรือไม่?',
            deleteFileAttachmentsDescriptionMultiple: 'ไฟล์แนบเหล่านี้ไม่ได้ถูกใช้ในโน้ตใดแล้ว คุณต้องการลบหรือไม่?',
            deleteFileAttachmentsViewFileTreeAriaLabel: 'โครงสร้างไฟล์',
            deleteFileAttachmentsViewGalleryAriaLabel: 'แกลเลอรี',
            moveFileConflictDescriptionSingle: 'พบข้อขัดแย้งของไฟล์ใน "{folder}"',
            moveFileConflictDescriptionMultiple: 'พบข้อขัดแย้งของไฟล์ {count} รายการใน "{folder}"',
            moveFileConflictAffectedFiles: 'ไฟล์ที่ได้รับผลกระทบ',
            moveFileConflictItem: '"{name}" -> "{suggested}"{renameOnly}',
            moveFileConflictRenameOnly: '(เปลี่ยนชื่อเท่านั้น)',
            moveFileConflictRename: 'เปลี่ยนชื่อ',
            moveFileConflictOverwrite: 'เขียนทับ',
            removeAllTagsTitle: 'นำแท็กทั้งหมดออก',
            removeAllTagsFromNote: 'คุณแน่ใจหรือไม่ว่าต้องการนำแท็กทั้งหมดออกจากโน้ตนี้?',
            removeAllTagsFromNotes: 'คุณแน่ใจหรือไม่ว่าต้องการนำแท็กทั้งหมดออกจาก {count} โน้ต?'
        },
        folderNoteType: {
            title: 'เลือกประเภทโน้ตโฟลเดอร์',
            folderLabel: 'โฟลเดอร์: {name}'
        },
        folderSuggest: {
            placeholder: (name: string) => `ย้าย ${name} ไปยังโฟลเดอร์...`,
            multipleFilesLabel: (count: number) => `${count} ไฟล์`,
            navigatePlaceholder: 'นำทางไปยังโฟลเดอร์...',
            instructions: {
                navigate: 'เพื่อนำทาง',
                move: 'เพื่อย้าย',
                select: 'เพื่อเลือก',
                dismiss: 'เพื่อปิด'
            }
        },
        homepage: {
            placeholder: 'ค้นหาไฟล์...',
            instructions: {
                navigate: 'เพื่อนำทาง',
                select: 'เพื่อตั้งหน้าแรก',
                dismiss: 'เพื่อปิด'
            }
        },
        calendarTemplate: {
            placeholder: 'ค้นหาเทมเพลต...',
            instructions: {
                navigate: 'เพื่อนำทาง',
                select: 'เพื่อเลือกเทมเพลต',
                dismiss: 'เพื่อปิด'
            }
        },
        navigationBanner: {
            placeholder: 'ค้นหารูปภาพ...',
            svgMissingDimensions: 'ไฟล์ SVG ที่เลือกไม่ได้กำหนดความกว้าง ความสูง หรือ viewBox',
            instructions: {
                navigate: 'เพื่อนำทาง',
                select: 'เพื่อตั้งแบนเนอร์',
                dismiss: 'เพื่อปิด'
            }
        },
        tagSuggest: {
            navigatePlaceholder: 'นำทางไปยังแท็ก...',
            addPlaceholder: 'ค้นหาแท็กเพื่อเพิ่ม...',
            removePlaceholder: 'เลือกแท็กเพื่อนำออก...',
            createNewTag: 'สร้างแท็กใหม่: #{tag}',
            instructions: {
                navigate: 'เพื่อนำทาง',
                select: 'เพื่อเลือก',
                dismiss: 'เพื่อปิด',
                add: 'เพื่อเพิ่มแท็ก',
                remove: 'เพื่อนำแท็กออก'
            }
        },
        propertySuggest: {
            placeholder: 'เลือกคีย์คุณสมบัติ...',
            navigatePlaceholder: 'นำทางไปยังคุณสมบัติ...',
            instructions: {
                navigate: 'เพื่อนำทาง',
                select: 'เพื่อเพิ่มคุณสมบัติ',
                dismiss: 'เพื่อปิด'
            }
        },
        propertyKeyVisibility: {
            title: 'การแสดงผลคีย์คุณสมบัติ',
            description:
                'ควบคุมตำแหน่งที่แสดงค่าคุณสมบัติ คอลัมน์ตรงกับแผงนำทาง แผงรายการ และเมนูบริบทของไฟล์ ใช้แถวล่างสุดเพื่อสลับทุกแถวในคอลัมน์',
            searchPlaceholder: 'ค้นหาคีย์คุณสมบัติ...',
            propertyColumnLabel: 'คุณสมบัติ',
            showInNavigation: 'แสดงในการนำทาง',
            showInList: 'แสดงในรายการ',
            showInFileMenu: 'แสดงในเมนูไฟล์',
            toggleAllInNavigation: 'สลับทั้งหมดในการนำทาง',
            toggleAllInList: 'สลับทั้งหมดในรายการ',
            toggleAllInFileMenu: 'สลับทั้งหมดในเมนูไฟล์',
            applyButton: 'นำไปใช้',
            emptyState: 'ไม่พบคีย์คุณสมบัติ'
        },
        welcome: {
            title: 'ยินดีต้อนรับสู่ {pluginName}',
            introText:
                'สวัสดี! ก่อนเริ่มต้น ขอแนะนำอย่างยิ่งให้ดูวิดีโอด้านล่างห้านาทีแรกเพื่อทำความเข้าใจว่าแผงควบคุมและปุ่มสลับ "แสดงโน้ตจากโฟลเดอร์ย่อย" ทำงานอย่างไร',
            continueText:
                'หากคุณมีเวลาอีกห้านาที ให้ดูวิดีโอต่อเพื่อทำความเข้าใจโหมดแสดงผลแบบกะทัดรัดและวิธีตั้งค่าทางลัดและปุ่มลัดที่สำคัญอย่างถูกต้อง',
            thanksText: 'ขอบคุณมากที่ดาวน์โหลด สนุกกับการใช้งาน!',
            videoAlt: 'การติดตั้งและเชี่ยวชาญ Notebook Navigator',
            openVideoButton: 'เล่นวิดีโอ',
            closeButton: 'ไว้ทีหลัง'
        }
    },
    // File system operations
    fileSystem: {
        errors: {
            createFolder: 'สร้างโฟลเดอร์ล้มเหลว: {error}',
            createFile: 'สร้างไฟล์ล้มเหลว: {error}',
            renameFolder: 'เปลี่ยนชื่อโฟลเดอร์ล้มเหลว: {error}',
            renameFolderNoteConflict: 'ไม่สามารถเปลี่ยนชื่อ: "{name}" มีอยู่ในโฟลเดอร์นี้แล้ว',
            renameFile: 'เปลี่ยนชื่อไฟล์ล้มเหลว: {error}',
            deleteFolder: 'ลบโฟลเดอร์ล้มเหลว: {error}',
            deleteFile: 'ลบไฟล์ล้มเหลว: {error}',
            deleteAttachments: 'ไม่สามารถลบไฟล์แนบได้: {error}',
            mergeNotes: 'รวมโน้ตไม่สำเร็จ: {error}',
            mergeNotesOpenOutput: 'สร้างโน้ตที่รวมแล้วเป็น {name} แล้ว แต่ไม่สามารถเปิดได้: {error} โน้ตต้นทางไม่ได้ถูกเปลี่ยนแปลง',
            mergeNotesOpenSkipped: 'คำขอเปิดไฟล์อื่นมีความสำคัญกว่า',
            mergeNotesTrashSources: 'สร้างโน้ตที่รวมแล้วแล้ว ไม่สามารถย้ายโน้ตต้นทาง {count} รายการไปที่ถังขยะได้',
            duplicateNote: 'ทำซ้ำโน้ตล้มเหลว: {error}',
            duplicateFolder: 'ทำซ้ำโฟลเดอร์ล้มเหลว: {error}',
            openVersionHistory: 'เปิดประวัติเวอร์ชันล้มเหลว: {error}',
            versionHistoryNotFound: 'ไม่พบคำสั่งประวัติเวอร์ชัน ตรวจสอบว่า Obsidian Sync เปิดใช้งานอยู่',
            revealInExplorer: 'แสดงไฟล์ใน explorer ระบบล้มเหลว: {error}',
            openInDefaultApp: 'เปิดในแอปเริ่มต้นล้มเหลว: {error}',
            openInDefaultAppNotAvailable: 'เปิดในแอปเริ่มต้นไม่พร้อมใช้งานบนแพลตฟอร์มนี้',
            folderNoteAlreadyExists: 'โน้ตโฟลเดอร์มีอยู่แล้ว',
            folderAlreadyExists: 'โฟลเดอร์ "{name}" มีอยู่แล้ว',
            folderNotesDisabled: 'เปิดใช้งานโน้ตโฟลเดอร์ในการตั้งค่าเพื่อแปลงไฟล์',
            folderNoteAlreadyLinked: 'ไฟล์นี้ทำหน้าที่เป็นโน้ตโฟลเดอร์อยู่แล้ว',
            folderNoteNotFound: 'ไม่มีบันทึกโฟลเดอร์ในโฟลเดอร์ที่เลือก',
            folderNoteUnsupportedExtension: 'นามสกุลไฟล์ไม่รองรับ: {extension}',
            folderNoteMoveFailed: 'ย้ายไฟล์ระหว่างการแปลงล้มเหลว: {error}',
            folderNoteRenameConflict: 'ไฟล์ชื่อ "{name}" มีอยู่ในโฟลเดอร์แล้ว',
            folderNoteConversionFailed: 'แปลงไฟล์เป็นโน้ตโฟลเดอร์ล้มเหลว',
            folderNoteConversionFailedWithReason: 'แปลงไฟล์เป็นโน้ตโฟลเดอร์ล้มเหลว: {error}',
            folderNoteOpenFailed: 'แปลงไฟล์แล้วแต่เปิดโน้ตโฟลเดอร์ล้มเหลว: {error}',
            failedToDeleteFile: 'ลบ {name} ล้มเหลว: {error}',
            failedToDeleteMultipleFiles: 'ลบ {count} ไฟล์ล้มเหลว',
            versionHistoryNotAvailable: 'บริการประวัติเวอร์ชันไม่พร้อมใช้งาน',
            drawingAlreadyExists: 'มีภาพวาดชื่อนี้อยู่แล้ว',
            failedToCreateDrawing: 'สร้างภาพวาดล้มเหลว',
            noFolderSelected: 'ไม่ได้เลือกโฟลเดอร์ใน Notebook Navigator',
            noFileSelected: 'ไม่ได้เลือกไฟล์'
        },
        warnings: {
            linkBreakingNameCharacters: 'ชื่อนี้มีอักขระที่ทำให้ลิงก์ Obsidian เสียหาย: #, |, ^, %%, [[, ]].',
            forbiddenNameCharactersAllPlatforms: 'ชื่อไม่สามารถขึ้นต้นด้วยจุดหรือมี : หรือ / ได้',
            forbiddenNameCharactersWindows: 'อักขระที่ Windows สงวนไว้ไม่อนุญาต: <, >, ", \\, |, ?, *.'
        },
        notices: {
            hideFolder: 'ซ่อนโฟลเดอร์แล้ว: {name}',
            showFolder: 'แสดงโฟลเดอร์แล้ว: {name}',
            folderExcludedFromDescendants: 'ซ่อนจากรายการโฟลเดอร์แม่: {name}',
            folderIncludedInDescendants: 'แสดงในรายการโฟลเดอร์แม่: {name}',
            mergeNotes: 'รวม {count} โน้ตเป็น {name} แล้ว'
        },
        notifications: {
            deletedMultipleFiles: 'ลบ {count} ไฟล์แล้ว',
            movedMultipleFiles: 'ย้าย {count} ไฟล์ไปยัง {folder}',
            folderNoteConversionSuccess: 'แปลงไฟล์เป็นโน้ตโฟลเดอร์ใน "{name}"',
            folderMoved: 'ย้ายโฟลเดอร์ "{name}" แล้ว',
            deepLinkCopied: 'คัดลอก URL Obsidian ไปคลิปบอร์ดแล้ว',
            pathCopied: 'คัดลอกเส้นทางไปคลิปบอร์ดแล้ว',
            relativePathCopied: 'คัดลอกเส้นทางสัมพัทธ์ไปคลิปบอร์ดแล้ว',
            tagAddedToNote: 'เพิ่มแท็กใน 1 โน้ตแล้ว',
            tagAddedToNotes: 'เพิ่มแท็กใน {count} โน้ตแล้ว',
            tagRemovedFromNote: 'นำแท็กออกจาก 1 โน้ตแล้ว',
            tagRemovedFromNotes: 'นำแท็กออกจาก {count} โน้ตแล้ว',
            tagsClearedFromNote: 'ล้างแท็กทั้งหมดจาก 1 โน้ตแล้ว',
            tagsClearedFromNotes: 'ล้างแท็กทั้งหมดจาก {count} โน้ตแล้ว',
            noTagsToRemove: 'ไม่มีแท็กให้นำออก',
            noFilesSelected: 'ไม่ได้เลือกไฟล์',
            mergeNotesRequireMultipleMarkdown: 'เลือกโน้ต Markdown อย่างน้อยสองรายการเพื่อรวม',
            tagOperationsNotAvailable: 'การดำเนินการแท็กไม่พร้อมใช้งาน',
            propertyOperationsNotAvailable: 'การดำเนินการคุณสมบัติไม่พร้อมใช้งาน',
            tagsRequireMarkdown: 'แท็กรองรับเฉพาะโน้ต Markdown',
            propertiesRequireMarkdown: 'คุณสมบัติรองรับเฉพาะโน้ต Markdown เท่านั้น',
            propertySetOnNote: 'อัปเดตคุณสมบัติใน 1 โน้ต',
            propertySetOnNotes: 'อัปเดตคุณสมบัติใน {count} โน้ต',
            manualSortPropertyRemovedFromNote: 'ลบคุณสมบัติการจัดเรียงจาก 1 โน้ตแล้ว',
            manualSortPropertyRemovedFromNotes: 'ลบคุณสมบัติการจัดเรียงจาก {count} โน้ตแล้ว',
            iconPackDownloaded: 'ดาวน์โหลด {provider} แล้ว',
            iconPackUpdated: 'อัปเดต {provider} แล้ว ({version})',
            iconPackRemoved: 'นำ {provider} ออกแล้ว',
            iconPackLoadFailed: 'โหลด {provider} ล้มเหลว',
            hiddenFileReveal: 'ไฟล์ซ่อนอยู่ เปิดใช้งาน "แสดงรายการที่ซ่อน" เพื่อแสดง'
        },
        confirmations: {
            deleteMultipleFiles: 'คุณแน่ใจหรือไม่ว่าต้องการลบ {count} ไฟล์?',
            deleteConfirmation: 'การดำเนินการนี้ไม่สามารถยกเลิกได้'
        },
        defaultNames: {
            untitled: 'ไม่มีชื่อ'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'ไม่สามารถย้ายโฟลเดอร์ไปยังตัวเองหรือโฟลเดอร์ย่อย',
            itemAlreadyExists: 'รายการชื่อ "{name}" มีอยู่ในตำแหน่งนี้แล้ว',
            failedToMove: 'ย้ายล้มเหลว: {error}',
            failedToAddTag: 'เพิ่มแท็ก "{tag}" ล้มเหลว',
            failedToSetProperty: 'ไม่สามารถอัปเดตคุณสมบัติ: {error}',
            failedToClearTags: 'ล้างแท็กล้มเหลว',
            failedToMoveFolder: 'ย้ายโฟลเดอร์ "{name}" ล้มเหลว',
            failedToImportFiles: 'นำเข้าล้มเหลว: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} ไฟล์มีอยู่ในปลายทางแล้ว',
            filesAlreadyHaveTag: '{count} ไฟล์มีแท็กนี้หรือแท็กที่เฉพาะเจาะจงกว่าอยู่แล้ว',
            filesAlreadyHaveProperty: '{count} ไฟล์มีคุณสมบัตินี้อยู่แล้ว',
            noTagsToClear: 'ไม่มีแท็กให้ล้าง',
            fileImported: 'นำเข้า 1 ไฟล์แล้ว',
            filesImported: 'นำเข้า {count} ไฟล์แล้ว'
        }
    },

    // Date grouping
    dateGroups: {
        today: 'วันนี้',
        yesterday: 'เมื่อวาน',
        previous7Days: '7 วันที่ผ่านมา',
        previous30Days: '30 วันที่ผ่านมา'
    },

    // Plugin commands
    commands: {
        open: 'เปิด',
        toggleLeftSidebar: 'สลับแถบด้านซ้าย',
        openHomepage: 'เปิดหน้าแรก',
        openDailyNote: 'เปิดโน้ตรายวัน',
        openWeeklyNote: 'เปิดโน้ตรายสัปดาห์',
        openMonthlyNote: 'เปิดโน้ตรายเดือน',
        openQuarterlyNote: 'เปิดโน้ตรายไตรมาส',
        openYearlyNote: 'เปิดโน้ตรายปี',
        revealFile: 'แสดงไฟล์',
        search: 'ค้นหา',
        searchVaultRoot: 'ค้นหาทั้งห้องนิรภัย',
        toggleDualPane: 'สลับรูปแบบแผงคู่',
        toggleDualPaneOrientation: 'สลับทิศทางแผงคู่', // Command palette: Toggles dual-pane orientation between horizontal and vertical (English: Toggle dual pane orientation)
        toggleCalendar: 'สลับปฏิทิน',
        selectVaultProfile: 'เลือกโปรไฟล์ห้องนิรภัย',
        selectVaultProfile1: 'เลือกโปรไฟล์ห้องนิรภัย 1',
        selectVaultProfile2: 'เลือกโปรไฟล์ห้องนิรภัย 2',
        selectVaultProfile3: 'เลือกโปรไฟล์ห้องนิรภัย 3',
        deleteFile: 'ลบไฟล์',
        createNewNote: 'สร้างโน้ตใหม่',
        createNewNoteFromTemplate: 'โน้ตใหม่จากเทมเพลต',
        moveFiles: 'ย้ายไฟล์',
        mergeNotes: 'รวมโน้ต', // Command palette: Creates one note from selected Markdown notes (English: Merge notes)
        selectNextFile: 'เลือกไฟล์ถัดไป',
        selectPreviousFile: 'เลือกไฟล์ก่อนหน้า',
        navigateBack: 'นำทางย้อนกลับ',
        navigateForward: 'นำทางไปข้างหน้า',
        convertToFolderNote: 'แปลงเป็นโน้ตโฟลเดอร์',
        setAsFolderNote: 'ตั้งเป็นโน้ตโฟลเดอร์',
        detachFolderNote: 'แยกโน้ตโฟลเดอร์',
        pinAllFolderNotes: 'ปักหมุดโน้ตโฟลเดอร์ทั้งหมด',
        navigateToFolder: 'นำทางไปยังโฟลเดอร์',
        navigateToTag: 'นำทางไปยังแท็ก',
        navigateToProperty: 'นำทางไปยังคุณสมบัติ',
        addShortcut: 'เพิ่มในทางลัด',
        openShortcut: 'เปิดทางลัด {number}',
        toggleDescendants: 'สลับลูกหลาน',
        toggleHidden: 'สลับโฟลเดอร์ แท็ก และโน้ตที่ซ่อน',
        toggleTagSort: 'สลับลำดับการเรียงแท็ก',
        toggleTagsBySelection: 'สลับแท็กตามการเลือก',
        togglePropertiesBySelection: 'สลับคุณสมบัติตามการเลือก',
        toggleCompactMode: 'สลับโหมดกะทัดรัด', // Command palette: Toggles list mode between standard and compact (English: Toggle compact mode)
        togglePinnedSection: 'สลับส่วนที่ปักหมุด',
        collapseExpand: 'ยุบ / ขยายรายการทั้งหมด',
        collapseExpandSelectedItem: 'ยุบ / ขยายรายการที่เลือก',
        addTag: 'เพิ่มแท็กในไฟล์ที่เลือก',
        setProperty: 'ตั้งค่าคุณสมบัติในไฟล์ที่เลือก', // Command palette: Opens a fuzzy dialog to set a property on selected files (English: Set property on selected files)
        removeTag: 'นำแท็กออกจากไฟล์ที่เลือก',
        removeAllTags: 'นำแท็กทั้งหมดออกจากไฟล์ที่เลือก',
        openAllFiles: 'เปิดไฟล์ทั้งหมด',
        rebuildCache: 'สร้างแคชใหม่',
        restoreDefaultSettings: 'กู้คืนการตั้งค่าเริ่มต้น' // Command palette: Replaces the settings file with defaults after startup was aborted (English: Restore default settings)
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator',
        calendarViewName: 'ปฏิทิน',
        folderNoteSidebarViewName: 'โน้ตโฟลเดอร์',
        ribbonTooltip: 'Notebook Navigator',
        revealInNavigator: 'แสดงใน Notebook Navigator',
        settingsUnavailableNotice:
            'Notebook Navigator ไม่สามารถอ่านการตั้งค่าได้และไม่ได้เริ่มทำงาน หากคลังของคุณกำลังซิงค์อยู่ ให้รีสตาร์ท Obsidian หลังจากการซิงค์เสร็จสิ้น หากต้องการเริ่มใหม่ด้วยการตั้งค่าเริ่มต้น ให้เรียกใช้คำสั่ง "กู้คืนการตั้งค่าเริ่มต้น"', // Notice shown when startup is aborted because the settings file is missing or cannot be read (English: Notebook Navigator could not read its settings and did not start. If your vault is syncing, restart Obsidian after the sync completes. To start over with default settings, run the command "Restore default settings".)
        settingsRecovery: {
            confirmTitle: 'กู้คืนการตั้งค่าเริ่มต้น', // Title of the confirmation dialog for the settings recovery command (English: Restore default settings)
            confirmMessage:
                'การดำเนินการนี้จะแทนที่ไฟล์การตั้งค่าของ Notebook Navigator ด้วยการตั้งค่าเริ่มต้น หากคลังของคุณยังซิงค์อยู่ การตั้งค่าเริ่มต้นที่กู้คืนอาจเขียนทับการตั้งค่าที่บันทึกไว้ในอุปกรณ์อื่นของคุณ ไฟล์การตั้งค่าที่อ่านได้จะถูกคัดลอกไปยังข้อมูลสำรองที่มีการประทับเวลาในโฟลเดอร์ปลั๊กอินก่อน', // Body of the confirmation dialog for the settings recovery command
            confirmButton: 'กู้คืนค่าเริ่มต้น', // Confirm button label in the settings recovery dialog (English: Restore defaults)
            failedNotice: 'ไม่สามารถกู้คืนการตั้งค่าให้เสร็จสมบูรณ์ได้ การกำหนดลักษณะในเครื่องถูกเก็บไว้', // Notice shown when settings recovery cannot be completed (English: Could not complete settings recovery. Local preferences were kept.)
            completedNotice: 'กู้คืนการตั้งค่าเริ่มต้นแล้ว รีสตาร์ท Obsidian เพื่อเสร็จสิ้น' // Notice shown after the settings file was replaced with defaults (English: Default settings restored. Restart Obsidian to finish.)
        }
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'แก้ไขล่าสุดเมื่อ',
        createdAt: 'สร้างเมื่อ',
        file: 'ไฟล์',
        files: 'ไฟล์',
        folder: 'โฟลเดอร์',
        folders: 'โฟลเดอร์',
        wordCount: 'จำนวนคำ'
    },

    fileCounts: {
        words: '{count} คำ',
        characters: '{count} อักขระ',
        separator: ' · '
    },

    // Settings
    settings: {
        changeDefaultSettings: 'เปลี่ยนการตั้งค่าเริ่มต้น',
        metadataReport: {
            exportSuccess: 'ส่งออกรายงานเมตาดาต้าที่ล้มเหลวไปยัง: {filename}',
            exportFailed: 'ส่งออกรายงานเมตาดาต้าล้มเหลว'
        },
        sections: {
            general: 'ทั่วไป',
            vaultFilters: 'ตัวกรองการแสดงผล',
            appearanceBehavior: 'ลักษณะและพฤติกรรม',
            navigationPane: 'แผงนำทาง',
            calendar: 'ปฏิทิน',
            fileOperations: 'การดำเนินการกับไฟล์',
            icons: 'ชุดไอคอน',
            folders: 'โฟลเดอร์',
            folderNotes: 'โน้ตโฟลเดอร์',
            folderNoteFiles: 'ไฟล์โน้ตโฟลเดอร์',
            foldersAndFolderNotes: 'โฟลเดอร์และโน้ตโฟลเดอร์',
            tagsAndProperties: 'แท็กและคุณสมบัติ',
            tags: 'แท็ก',
            listPane: 'แผงรายการ',
            notes: 'การแสดงไฟล์',
            shortcutsAndRecentFiles: 'ทางลัดและไฟล์ล่าสุด',
            advanced: 'ขั้นสูง'
        },
        pageGroups: {
            configuration: 'การกำหนดค่า',
            navigationAndContent: 'แผงนำทาง',
            notesAndLists: 'แผงรายการ',
            calendarAndTools: 'ปฏิทินและเครื่องมือ'
        },
        pageDescriptions: {
            general: 'บันทึกการเผยแพร่ การสนับสนุน โปรไฟล์ห้องนิรภัย ประเภทไฟล์ และคีย์คุณสมบัติ',
            vaultFilters: 'โฟลเดอร์ที่ซ่อน แท็ก ไฟล์ แท็กไฟล์ และกฎคุณสมบัติ',
            appearanceBehavior: 'พฤติกรรม การนำทางด้วยแป้นพิมพ์ ปุ่มเมาส์ ลักษณะ และการจัดรูปแบบ',
            navigationPane: 'เค้าโครง ลักษณะ จำนวนโน้ต พฤติกรรมการยุบ และสีรุ้ง',
            shortcuts: 'การมองเห็นทางลัด เครื่องหมาย ไฟล์ล่าสุด และรายการที่ปักหมุด',
            calendar: 'การแสดงปฏิทิน โน้ตวันที่ เทมเพลต โลแคล และตำแหน่งแถบด้านข้าง',
            fileOperations: 'เทมเพลต การยืนยันการลบ ไฟล์แนบ และพฤติกรรมความขัดแย้งเมื่อย้ายไฟล์',
            foldersAndFolderNotes: 'การแสดงโฟลเดอร์ โน้ตโฟลเดอร์ เทมเพลตโน้ตโฟลเดอร์ และพฤติกรรมโน้ตโฟลเดอร์',
            tagsProperties: 'ส่วนแท็กและคุณสมบัติ ไอคอน การจัดเรียง ขอบเขต และการสืบทอด',
            listPane: 'การจัดเรียง การจัดกลุ่ม โหมดรายการ โน้ตที่ปักหมุด และตัวอย่างภาพวาด',
            frontmatter: 'ฟิลด์ frontmatter สำหรับชื่อที่แสดง การประทับเวลา ไอคอน และสี',
            notes: 'ชื่อเรื่อง ข้อความตัวอย่าง รูปภาพเด่น แท็ก คุณสมบัติ วันที่ จำนวนคำ และจำนวนอักขระ',
            iconPacks: 'ไอคอนอินเทอร์เฟซ ไอคอนไฟล์ และการจัดการชุดไอคอน',
            advanced: 'การวินิจฉัย การล้างข้อมูลเมตา การนำเข้า/ส่งออก และการรีเซ็ต'
        },
        groups: {
            general: {
                vaultConfiguration: 'การตั้งค่าห้องนิรภัย',
                templates: 'เทมเพลต',
                behavior: 'พฤติกรรม',
                startup: 'การเริ่มต้น',
                keyboardNavigation: 'การนำทางด้วยแป้นพิมพ์',
                mouseButtons: 'ปุ่มเมาส์',
                view: 'ลักษณะ',
                icons: 'ไอคอน',
                desktopAppearance: 'ลักษณะเดสก์ท็อป',
                mobileAppearance: 'รูปลักษณ์บนมือถือ',
                formatting: 'การจัดรูปแบบ'
            },
            advanced: {
                maintenance: 'การบำรุงรักษา',
                resetSettings: 'รีเซ็ตการตั้งค่า'
            },
            navigation: {
                appearance: 'ลักษณะ',
                banner: 'แบนเนอร์',
                collapseItems: 'ยุบรายการ',
                dragAndDrop: 'ลากและวาง',
                noteCounts: 'จำนวนโน้ต',
                rainbowColors: 'สีรุ้ง',
                leftSidebar: 'แถบด้านซ้าย',
                calendarIntegration: 'การรวมปฏิทิน'
            },
            list: {
                display: 'ลักษณะ',
                groupHeaders: 'ส่วนหัวกลุ่ม',
                propertySort: 'การจัดเรียงตามคุณสมบัติ',
                manualSort: 'การจัดเรียงด้วยตนเอง',
                pinnedNotes: 'โน้ตที่ปักหมุด',
                drawingPreviews: 'ตัวอย่างภาพวาด'
            },
            notes: {
                frontmatter: 'ฟิลด์ Frontmatter',
                tasks: 'งาน',
                icon: 'ไอคอน',
                title: 'ชื่อเรื่อง',
                previewText: 'ข้อความตัวอย่าง',
                featureImage: 'รูปภาพเด่น',
                tags: 'แท็ก',
                properties: 'คุณสมบัติ',
                date: 'วันที่',
                parentFolder: 'โฟลเดอร์หลัก',
                wordCount: 'จำนวนคำและอักขระ'
            }
        },
        syncMode: {
            notSynced: '(ไม่ซิงค์)',
            switchToSynced: 'เปิดใช้งานการซิงค์',
            switchToLocal: 'ปิดใช้งานการซิงค์'
        },
        items: {
            listPaneTitle: {
                name: 'ชื่อแผงรายการ',
                desc: 'เลือกตำแหน่งที่จะแสดงชื่อแผงรายการ',
                options: {
                    header: 'แสดงในส่วนหัว',
                    list: 'แสดงในแผงรายการ',
                    hidden: 'ไม่แสดง'
                }
            },
            sortNotesBy: {
                name: 'ลำดับการเรียงเริ่มต้น',
                desc: 'เลือกลำดับการเรียงเริ่มต้นสำหรับโน้ต',
                options: {
                    'modified-desc': 'วันที่แก้ไข (ใหม่สุดบน)',
                    'modified-asc': 'วันที่แก้ไข (เก่าสุดบน)',
                    'created-desc': 'วันที่สร้าง (ใหม่สุดบน)',
                    'created-asc': 'วันที่สร้าง (เก่าสุดบน)',
                    'title-asc': 'ชื่อเรื่อง (A บน)',
                    'title-desc': 'ชื่อเรื่อง (Z บน)',
                    'filename-asc': 'ชื่อไฟล์ (A บน)',
                    'filename-desc': 'ชื่อไฟล์ (Z บน)'
                },
                directions: {
                    asc: 'จากน้อยไปมาก',
                    desc: 'จากมากไปน้อย'
                },
                fields: {
                    modified: 'วันที่แก้ไข',
                    created: 'วันที่สร้าง',
                    title: 'ชื่อเรื่อง',
                    filename: 'ชื่อไฟล์',
                    property: 'คุณสมบัติ'
                }
            },
            propertySortKey: {
                name: 'คุณสมบัติสำหรับเรียงลำดับ',
                desc: 'คุณสมบัติ frontmatter ที่คั่นด้วยเครื่องหมายจุลภาคซึ่งแสดงเป็นตัวเลือกการจัดเรียงตามคุณสมบัติ ค่าอาร์เรย์จะรวมเป็นข้อความเดียว คุณสมบัติเหล่านี้จะไม่ถูกเปลี่ยนแปลง',
                placeholder: 'published, author'
            },
            propertySortSecondary: {
                name: 'การเรียงลำดับรอง',
                desc: 'ใช้กับการเรียงตามคุณสมบัติ เมื่อโน้ตมีค่าคุณสมบัติเดียวกันหรือไม่มีค่าคุณสมบัติ',
                options: {
                    title: 'ชื่อเรื่อง',
                    filename: 'ชื่อไฟล์',
                    created: 'วันที่สร้าง',
                    modified: 'วันที่แก้ไข'
                }
            },
            propertySortInstructions: {
                intro: 'คุณสมบัติแต่ละรายการที่ระบุไว้ด้านบนจะปรากฏเป็นตัวเลือกการจัดเรียงในเมนูจัดเรียงของแผงรายการ การเลือกตัวเลือกหนึ่งจะจัดเรียงโน้ตตามค่าใน frontmatter'
            },
            manualSortPropertyKey: {
                name: 'คุณสมบัติสำหรับการจัดเรียงด้วยตนเอง',
                desc: 'คุณสมบัติ frontmatter ที่ใช้เก็บค่าดัชนีตัวเลขสำหรับการจัดเรียงด้วยตนเอง'
            },
            manualSortGroupHeaderProperty: {
                name: 'คุณสมบัติส่วนหัวกลุ่ม',
                desc: 'คุณสมบัติ frontmatter ที่ใช้เก็บส่วนหัวกลุ่มกำหนดเอง'
            },
            groupHeadersInstructions: {
                intro: 'ส่วนหัวกลุ่มกำหนดเองจะแสดงเหนือโน้ตในแผงรายการ',
                items: [
                    'จากเมนูจัดเรียงในแผงรายการ ตั้งค่าการจัดกลุ่มเป็น **กำหนดเอง**',
                    'คลิกขวาที่โน้ตและเลือก **ตั้งค่าส่วนหัวกลุ่ม** เพื่อเพิ่มส่วนหัวเหนือโน้ตนั้น'
                ]
            },
            manualSortNewNotePlacement: {
                name: 'ตำแหน่งโน้ตใหม่',
                desc: 'เลือกตำแหน่งที่จะวางโน้ตใหม่เมื่อรายการปัจจุบันใช้การจัดเรียงด้วยตนเอง',
                options: {
                    top: 'ด้านบน',
                    bottom: 'ด้านล่าง',
                    'below-selected-note': 'ใต้โน้ตที่เลือก',
                    unsorted: 'ยังไม่จัดเรียง'
                }
            },
            confirmBeforeManualSort: {
                name: 'ยืนยันก่อนการจัดเรียงด้วยตนเอง',
                desc: 'แสดงคำเตือนก่อนเขียนคุณสมบัติการจัดเรียงด้วยตนเองลงในบันทึกเป็นครั้งแรก เมื่อปิดใช้งาน บันทึกจะได้รับคุณสมบัตินั้นโดยไม่มีคำเตือน'
            },
            manualSortInstructions: {
                intro: 'การจัดเรียงด้วยตนเองจะเขียนค่าดัชนีตัวเลขลงในคุณสมบัติ frontmatter ของแต่ละโน้ต โน้ตที่ไม่มีดัชนีจะปรากฏอยู่ใต้ยังไม่จัดเรียง',
                items: [
                    'เปิดใช้การจัดเรียงด้วยตนเองโดยเลือก **จัดเรียงด้วยตนเอง** จากเมนูจัดเรียง หลังจากนั้น มีสองวิธีในการจัดเรียงโน้ตใหม่',
                    'เลือก **แก้ไขลำดับการจัดเรียง...** จากเมนูจัดเรียงเพื่อเปิดมุมมองจัดเรียงใหม่ ลากโน้ตด้วยเมาส์หรือสัมผัสบนมือถือ บนเดสก์ท็อป **Cmd/Ctrl** หรือ **Shift** คลิกเพื่อเลือกหลายโน้ต จากนั้นลากโน้ตใดโน้ตหนึ่งเพื่อย้ายทั้งกลุ่ม',
                    'ในแผงรายการ เลือกโน้ตหนึ่งโน้ตหรือเลือกหลายโน้ต จากนั้นกด **Cmd/Ctrl + Arrow Up/Down** เพื่อเลื่อนการเลือกขึ้นหรือลง'
                ]
            },
            revealFileOnListChanges: {
                name: 'เลื่อนไปยังไฟล์ที่เลือกเมื่อรายการเปลี่ยนแปลง',
                desc: 'เลื่อนไปยังไฟล์ที่เลือกเมื่อปักหมุดโน้ต แสดงโน้ตลูกหลาน เปลี่ยนลักษณะโฟลเดอร์ หรือเรียกใช้การดำเนินการไฟล์'
            },
            includeDescendantNotes: {
                name: 'แสดงโน้ตจากโฟลเดอร์ย่อย / ลูกหลาน',
                desc: 'รวมโน้ตจากโฟลเดอร์ย่อยที่ซ้อนกันและลูกหลานแท็กและคุณสมบัติเมื่อดูโฟลเดอร์ แท็ก หรือคุณสมบัติ'
            },
            limitPinnedToCurrentFolder: {
                name: 'ปักหมุดโน้ตเฉพาะในโฟลเดอร์ของมัน',
                desc: 'โน้ตที่ปักหมุดจะแสดงว่าปักหมุดเฉพาะในโฟลเดอร์ของตัวเองเท่านั้น มีประโยชน์สำหรับโน้ตโฟลเดอร์หรือหากคุณมีโน้ตที่ปักหมุดจำนวนมาก ไม่มีผลต่อมุมมองแท็กหรือคุณสมบัติ'
            },
            separateNoteCounts: {
                name: 'แสดงจำนวนโน้ตปัจจุบันและลูกหลานแยกกัน',
                desc: 'แสดงจำนวนโน้ตเป็นรูปแบบ "ปัจจุบัน ▾ ลูกหลาน" สำหรับโฟลเดอร์ แท็ก และคุณสมบัติ'
            },
            groupNotes: {
                name: 'การจัดกลุ่มเริ่มต้น',
                desc: 'กำหนดเองจะแสดงส่วนหัวที่กำหนดไว้ใน frontmatter วันที่จัดกลุ่มโน้ตตามวันที่ โฟลเดอร์จัดกลุ่มโน้ตตามโฟลเดอร์ มุมมองแท็กและคุณสมบัติจะใช้กลุ่มวันที่เมื่อเลือกโฟลเดอร์',
                options: {
                    custom: 'กำหนดเอง',
                    date: 'วันที่',
                    folder: 'โฟลเดอร์'
                }
            },
            showSelectedNavigationPills: {
                name: 'แสดงป้ายแท็กและคุณสมบัติทั้งหมดเสมอ',
                desc: 'เมื่อปิดใช้งาน ป้ายที่ตรงกับการเลือกการนำทางปัจจุบันจะถูกซ่อน (เช่น ป้ายแท็ก "สูตรอาหาร" จะถูกซ่อนเมื่อเรียกดูแท็ก "สูตรอาหาร") เปิดใช้งานเพื่อให้ป้ายทั้งหมดแสดงอยู่เสมอ'
            },
            stickyGroupHeaders: {
                name: 'ส่วนหัวกลุ่มแบบติดด้านบน',
                desc: 'แสดงส่วนหัวของวันที่ โฟลเดอร์ หรือส่วนที่ปักหมุดในปัจจุบันให้เห็นอยู่เสมอขณะเลื่อน'
            },
            showFolderGroupPaths: {
                name: 'แสดงเส้นทางโฟลเดอร์ย่อย',
                desc: 'เมื่อจัดกลุ่มตามโฟลเดอร์ในแผงรายการ ให้แสดงเส้นทางโฟลเดอร์ย่อยแทนการแสดงเฉพาะชื่อโฟลเดอร์'
            },
            showGroupHeaderItemCounts: {
                name: 'แสดงจำนวนรายการ',
                desc: 'แสดงจำนวนรายการในส่วนหัวแต่ละกลุ่มของแผงรายการ'
            },
            showCurrentFolderFilesAtBottom: {
                name: 'การจัดกลุ่มตามโฟลเดอร์: ไฟล์ในโฟลเดอร์ปัจจุบันอยู่ด้านล่าง',
                desc: 'เมื่อการจัดกลุ่มเริ่มต้นเป็นโฟลเดอร์ ให้ย้ายไฟล์ที่อยู่ในโฟลเดอร์ที่เลือกโดยตรงไปไว้ใต้กลุ่มโฟลเดอร์ย่อย'
            },
            defaultListMode: {
                name: 'โหมดรายการเริ่มต้น',
                desc: 'เลือกรูปแบบรายการเริ่มต้น มาตรฐานแสดงชื่อเรื่อง วันที่ คำอธิบาย และข้อความตัวอย่าง กะทัดรัดแสดงชื่อเรื่องเท่านั้น แทนที่ลักษณะต่อโฟลเดอร์',
                options: {
                    standard: 'มาตรฐาน',
                    compact: 'กะทัดรัด'
                }
            },
            showFileIcons: {
                name: 'แสดงไอคอนไฟล์',
                desc: 'แสดงไอคอนไฟล์พร้อมระยะห่างชิดซ้าย การปิดใช้งานจะนำไอคอนและการเยื้องออก ลำดับความสำคัญ: ไอคอนงานที่ยังไม่เสร็จ > ไอคอนกำหนดเอง > ไอคอนโฟลเดอร์ > ไอคอนชื่อไฟล์ > ไอคอนประเภทไฟล์ > ไอคอนค่าเริ่มต้น'
            },
            useFolderIcon: {
                name: 'ใช้ไอคอนโฟลเดอร์',
                desc: 'แสดงไอคอนของโฟลเดอร์หลักเมื่อไม่มีการตั้งค่าไอคอนไฟล์กำหนดเอง สีโฟลเดอร์จะถูกใช้เมื่อไม่มีการตั้งค่าสีไฟล์กำหนดเอง'
            },
            showFileIconUnfinishedTask: {
                name: 'ไอคอนงานที่ยังไม่เสร็จ',
                desc: 'แสดงไอคอนงานเมื่อโน้ตมีงานที่ยังไม่เสร็จ'
            },
            showFileBackgroundUnfinishedTask: {
                name: 'พื้นหลังงานที่ยังไม่เสร็จ',
                desc: 'ใช้สีพื้นหลังเมื่อโน้ตมีงานที่ยังไม่เสร็จ'
            },
            unfinishedTaskBackgroundColor: {
                name: 'สีพื้นหลังงานที่ยังไม่เสร็จ',
                desc: 'ตั้งค่าสีพื้นหลังที่ใช้เมื่อโน้ตมีงานที่ยังไม่เสร็จ'
            },
            showFilenameMatchIcons: {
                name: 'ไอคอนตามชื่อไฟล์',
                desc: 'กำหนดไอคอนให้ไฟล์ตามข้อความในชื่อ'
            },
            fileNameIconMap: {
                name: 'แผนที่ไอคอนชื่อไฟล์',
                desc: 'ไฟล์ที่มีข้อความจะได้รับไอคอนที่กำหนด หนึ่งการแมปต่อบรรทัด: ข้อความ=ไอคอน',
                placeholder: '# ข้อความ=ไอคอน\nประชุม=ph-calendar\nใบแจ้งหนี้=ph-receipt',
                editTooltip: 'แก้ไขการแมป'
            },
            showCategoryIcons: {
                name: 'ไอคอนตามประเภทไฟล์',
                desc: 'กำหนดไอคอนให้ไฟล์ตามนามสกุล'
            },
            fileTypeIconPreset: {
                name: 'ค่าที่ตั้งไว้ล่วงหน้าสำหรับไอคอนไฟล์',
                desc: 'เลือกไอคอนในตัวหรือค่าที่ตั้งไว้ล่วงหน้าของชุดไอคอน กฎนามสกุลแบบกำหนดเองจะเขียนทับค่านี้',
                options: {
                    none: 'ไอคอนในตัว'
                },
                notInstalledWarning: 'ยังไม่ได้ติดตั้งชุดไอคอนนี้ จะแสดงไอคอนในตัวแทน'
            },
            fileTypeIconMap: {
                name: 'แผนที่ไอคอนประเภทไฟล์',
                desc: 'ไฟล์ที่มีนามสกุลจะได้รับไอคอนที่กำหนด หนึ่งการแมปต่อบรรทัด: นามสกุล=ไอคอน',
                placeholder: '# Extension=icon\ncpp=ph-file-code\npdf=ph-file-pdf',
                editTooltip: 'แก้ไขการแมป'
            },
            compactItemHeight: {
                name: 'ความสูงรายการกะทัดรัด',
                desc: 'กำหนดความสูงของรายการกะทัดรัดบนเดสก์ท็อปและมือถือ (พิกเซล)',
                resetTooltip: 'รีเซ็ตเป็นค่าเริ่มต้น (28px)'
            },
            compactItemHeightScaleText: {
                name: 'ปรับขนาดข้อความตามความสูงรายการกะทัดรัด',
                desc: 'ปรับขนาดข้อความรายการกะทัดรัดเมื่อความสูงรายการลดลง'
            },
            showParentFolder: {
                name: 'แสดงโฟลเดอร์หลัก',
                desc: 'แสดงชื่อโฟลเดอร์หลักสำหรับโน้ตในโฟลเดอร์ย่อย แท็ก หรือคุณสมบัติ'
            },
            showParentFolderFullPath: {
                name: 'แสดงเส้นทางโฟลเดอร์',
                desc: 'แสดงเส้นทางที่สัมพันธ์กับโฟลเดอร์ที่เลือกแทนการแสดงเฉพาะชื่อโฟลเดอร์ แท็กและคุณสมบัติจะแสดงเส้นทางแบบเต็ม'
            },
            parentFolderClickRevealsFile: {
                name: 'คลิกโฟลเดอร์หลักเพื่อเปิดโฟลเดอร์',
                desc: 'การคลิกป้ายโฟลเดอร์หลักจะเปิดโฟลเดอร์ในแผงรายการ'
            },
            showParentFolderColor: {
                name: 'แสดงสีโฟลเดอร์หลัก',
                desc: 'ใช้สีโฟลเดอร์บนป้ายโฟลเดอร์หลัก'
            },
            showParentFolderIcon: {
                name: 'แสดงไอคอนโฟลเดอร์หลัก',
                desc: 'แสดงไอคอนโฟลเดอร์ข้างป้ายโฟลเดอร์หลัก'
            },
            showQuickActions: {
                name: 'แสดงการกระทำด่วน',
                desc: 'แสดงปุ่มการกระทำเมื่อวางเมาส์บนไฟล์ ตัวควบคุมปุ่มเลือกการกระทำที่จะปรากฏ'
            },
            dualPane: {
                name: 'รูปแบบแผงคู่',
                desc: 'แสดงแผงนำทางและแผงรายการเคียงข้างกันบนเดสก์ท็อป'
            },
            dualPaneOrientation: {
                name: 'ทิศทางแผงคู่',
                desc: 'เลือกรูปแบบแนวนอนหรือแนวตั้งเมื่อใช้งานแผงคู่',
                options: {
                    horizontal: 'แบ่งแนวนอน',
                    vertical: 'แบ่งแนวตั้ง'
                }
            },
            narrowSidebarLayout: {
                name: 'เมื่อแถบด้านข้างแคบเกินไป',
                desc: 'เลือกสิ่งที่จะเกิดขึ้นเมื่อแผงนำทางและแผงรายการไม่พอดีแบบวางเคียงกัน',
                options: {
                    none: 'ไม่ต้องทำอะไร',
                    singlePane: 'สลับเป็นแผงเดียว',
                    vertical: 'สลับเป็นการแบ่งแนวตั้ง'
                }
            },
            narrowSidebarTrigger: {
                name: 'เกณฑ์แถบด้านข้างแคบ',
                desc: 'เลือกวิธีคำนวณเกณฑ์ความกว้างของแถบด้านข้าง',
                options: {
                    fitPanes: 'ปรับให้พอดีกับแผง',
                    customWidth: 'ความกว้างกำหนดเอง'
                }
            },
            narrowSidebarCustomWidth: {
                name: 'ความกว้างเกณฑ์แถบด้านข้างแคบ',
                desc: 'สลับเมื่อแถบด้านข้างแคบกว่าความกว้างนี้',
                resetTooltip: 'รีเซ็ตเป็นความกว้างเริ่มต้น'
            },
            appearanceBackground: {
                name: 'สีพื้นหลัง',
                desc: 'เลือกสีพื้นหลังสำหรับแผงนำทางและรายการ',
                options: {
                    separate: 'พื้นหลังแยก',
                    primary: 'ใช้พื้นหลังรายการ',
                    secondary: 'ใช้พื้นหลังนำทาง'
                }
            },
            appearanceScale: {
                name: 'ระดับการซูม',
                desc: 'ควบคุมระดับการซูมโดยรวมของ Notebook Navigator (เปอร์เซ็นต์)'
            },
            useFloatingToolbars: {
                name: 'ใช้แถบเครื่องมือลอยบน iOS/iPadOS',
                desc: 'ใช้ได้เฉพาะบน iOS และ iPadOS'
            },
            startView: {
                name: 'มุมมองเริ่มต้นเมื่อเริ่มงาน',
                desc: 'เลือกแผงที่ใช้งานเมื่อเปิด Notebook Navigator เลย์เอาต์แผงเดียวจะแสดงแผงนี้ก่อน ส่วนเลย์เอาต์สองแผงจะให้โฟกัสแป้นพิมพ์กับแผงนี้',
                options: {
                    navigation: 'แผงนำทาง',
                    files: 'แผงรายการ'
                }
            },
            toolbarButtons: {
                name: 'ปุ่มแถบเครื่องมือ',
                desc: 'เลือกปุ่มที่จะปรากฏในแถบเครื่องมือ ปุ่มที่ซ่อนยังคงเข้าถึงได้ผ่านคำสั่งและเมนู',
                navigationLabel: 'แถบเครื่องมือนำทาง',
                listLabel: 'แถบเครื่องมือรายการ'
            },
            createNewNotesInNewTab: {
                name: 'เปิดโน้ตใหม่ในแท็บใหม่',
                desc: 'เมื่อเปิดใช้งาน คำสั่งสร้างโน้ตใหม่จะเปิดโน้ตในแท็บใหม่ เมื่อปิดใช้งาน โน้ตจะแทนที่แท็บปัจจุบัน'
            },
            autoRevealActiveNote: {
                name: 'แสดงโน้ตที่ใช้งานอัตโนมัติ',
                desc: 'แสดงโน้ตอัตโนมัติเมื่อเปิดจาก Quick Switcher, ลิงก์, หรือการค้นหา'
            },
            autoRevealShortestPath: {
                name: 'เปิดเผยอัตโนมัติ: ใช้เส้นทางสั้นที่สุด',
                desc: 'เปิด: การเปิดเผยอัตโนมัติจะเลือกโฟลเดอร์หรือแท็กบรรพบุรุษที่ใกล้ที่สุดที่มองเห็นได้ ปิด: การเปิดเผยอัตโนมัติจะเลือกโฟลเดอร์จริงและแท็กที่ตรงกันของไฟล์'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'เปิดเผยอัตโนมัติ: ละเว้นเหตุการณ์จากแถบด้านขวา',
                desc: 'อย่าเปลี่ยนโน้ตที่ใช้งานเมื่อคลิกหรือเปลี่ยนโน้ตในแถบด้านขวา'
            },
            autoRevealIgnoreOtherWindows: {
                name: 'เปิดเผยอัตโนมัติ: ละเว้นเหตุการณ์จากหน้าต่างอื่น',
                desc: 'อย่าเปลี่ยนโน้ตที่ใช้งานเมื่อทำงานกับโน้ตในหน้าต่างอื่น'
            },
            paneTransitionDuration: {
                name: 'แอนิเมชันหน้าต่างเดี่ยว',
                desc: 'ระยะเวลาการเปลี่ยนหน้าต่างในโหมดหน้าต่างเดี่ยว (มิลลิวินาที)',
                resetTooltip: 'รีเซ็ตเป็นค่าเริ่มต้น'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'เลือกโน้ตแรกอัตโนมัติ',
                desc: 'เปิดโน้ตแรกอัตโนมัติเมื่อสลับโฟลเดอร์ แท็ก หรือคุณสมบัติ'
            },
            skipAutoScroll: {
                name: 'ปิดการเลื่อนอัตโนมัติสำหรับทางลัด',
                desc: 'อย่าเลื่อนแผงนำทางเมื่อคลิกรายการในทางลัด'
            },
            autoExpandNavItems: {
                name: 'ขยายเมื่อเลือก',
                desc: 'ขยายโฟลเดอร์และแท็กเมื่อเลือก ในโหมดแผงเดียว การเลือกครั้งแรกจะขยาย การเลือกครั้งที่สองจะแสดงไฟล์'
            },
            collapseOtherBranchesOnExpand: {
                name: 'ขยายเพียงสาขาเดียว',
                desc: 'ยุบสาขาอื่นในต้นไม้เดียวกันเมื่อขยายโฟลเดอร์ แท็ก หรือคุณสมบัติ'
            },
            springLoadedFolders: {
                name: 'ขยายระหว่างลาก',
                desc: 'ขยายโฟลเดอร์และแท็กเมื่อวางเมาส์ระหว่างการลาก'
            },
            springLoadedFoldersInitialDelay: {
                name: 'ขยายระหว่างลาก: หน่วงเวลาการขยายครั้งแรก',
                desc: 'หน่วงเวลาก่อนขยายโฟลเดอร์หรือแท็กครั้งแรกระหว่างการลาก (วินาที)'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'ขยายระหว่างลาก: หน่วงเวลาการขยายครั้งถัดไป',
                desc: 'หน่วงเวลาก่อนขยายโฟลเดอร์หรือแท็กเพิ่มเติมระหว่างการลากเดียวกัน (วินาที)'
            },
            navigationBanner: {
                name: 'แบนเนอร์นำทาง (โปรไฟล์ห้องนิรภัย)',
                desc: 'แสดงรูปภาพเหนือแผงนำทาง เปลี่ยนตามโปรไฟล์ห้องนิรภัยที่เลือก',
                current: 'แบนเนอร์ปัจจุบัน: {path}',
                chooseButton: 'เลือกรูปภาพ'
            },
            pinNavigationBanner: {
                name: 'ปักหมุดแบนเนอร์',
                desc: 'ปักหมุดแบนเนอร์การนำทางไว้เหนือแผนผังการนำทาง'
            },
            showShortcuts: {
                name: 'แสดงทางลัด',
                desc: 'แสดงส่วนทางลัดในแผงนำทาง'
            },
            shortcutBadgeDisplay: {
                name: 'ป้ายทางลัด',
                desc: "สิ่งที่จะแสดงถัดจากทางลัด ใช้คำสั่ง 'เปิดทางลัด 1-9' เพื่อเปิดทางลัดโดยตรง",
                options: {
                    index: 'ตำแหน่ง (1-9)',
                    count: 'จำนวนรายการ',
                    none: 'ไม่มี'
                }
            },
            showRecentNotes: {
                name: 'แสดงไฟล์ล่าสุด',
                desc: 'แสดงส่วนไฟล์ล่าสุดในแผงนำทาง'
            },
            hideRecentNotes: {
                name: 'ซ่อนประเภทไฟล์จากไฟล์ล่าสุด',
                desc: 'เลือกประเภทไฟล์ที่ต้องการซ่อนในส่วนไฟล์ล่าสุด',
                options: {
                    none: 'ไม่มี',
                    folderNotes: 'โน้ตโฟลเดอร์'
                }
            },
            recentNotesCount: {
                name: 'จำนวนไฟล์ล่าสุด',
                desc: 'จำนวนไฟล์ล่าสุดที่จะแสดง'
            },
            pinRecentNotesWithShortcuts: {
                name: 'ปักหมุดไฟล์ล่าสุดพร้อมทางลัด',
                desc: 'รวมไฟล์ล่าสุดเมื่อปักหมุดทางลัด'
            },
            calendarEnabled: {
                name: 'เปิดใช้งานปฏิทิน',
                desc: 'เปิดใช้งานฟีเจอร์ปฏิทินของ Notebook Navigator'
            },
            calendarPlacement: {
                name: 'ตำแหน่งปฏิทิน',
                desc: 'แสดงในแถบด้านซ้ายหรือขวา',
                options: {
                    leftSidebar: 'แถบด้านซ้าย',
                    rightSidebar: 'แถบด้านขวา'
                }
            },
            calendarLeftPlacement: {
                name: 'ตำแหน่งแผงเดี่ยว',
                desc: 'ตำแหน่งที่แสดงปฏิทินในโหมดแผงเดี่ยว',
                options: {
                    navigationPane: 'แผงนำทาง',
                    below: 'ใต้แผง'
                }
            },
            calendarLocale: {
                name: 'ภาษา',
                desc: 'ควบคุมการจัดรูปแบบวันที่ในปฏิทิน การนับสัปดาห์ และวันแรกของสัปดาห์',
                weekPathMismatchWarning:
                    'ปฏิทินที่มองเห็นได้และเส้นทางโน้ตรายสัปดาห์ใช้วันเริ่มต้นของสัปดาห์หรือการนับสัปดาห์ที่แตกต่างกัน',
                options: {
                    systemDefault: 'ค่าเริ่มต้น'
                }
            },
            calendarWeekendDays: {
                name: 'วันหยุดสุดสัปดาห์',
                desc: 'แสดงวันหยุดสุดสัปดาห์ด้วยสีพื้นหลังที่แตกต่างกัน',
                options: {
                    none: 'ไม่มี',
                    satSun: 'วันเสาร์และวันอาทิตย์',
                    friSat: 'วันศุกร์และวันเสาร์',
                    thuFri: 'วันพฤหัสบดีและวันศุกร์'
                }
            },
            calendarMonthHeadingFormat: {
                name: 'รูปแบบชื่อเดือน',
                desc: 'ชื่อเดือนแบบเต็ม (มกราคม) หรือแบบย่อ (ม.ค.)',
                options: {
                    full: 'มกราคม (เต็ม)',
                    short: 'ม.ค. (ย่อ)'
                }
            },
            showInfoButtons: {
                name: 'แสดงปุ่มข้อมูล',
                desc: 'แสดงปุ่มข้อมูลในแถบค้นหาและส่วนหัวปฏิทิน'
            },
            calendarWeeksToShow: {
                name: 'สัปดาห์ที่แสดงในแถบด้านซ้าย',
                desc: 'ปฏิทินในแถบด้านขวาจะแสดงเต็มเดือนเสมอ',
                options: {
                    fullMonth: 'เต็มเดือน',
                    oneWeek: '1 สัปดาห์',
                    weeksCount: '{count} สัปดาห์'
                }
            },
            calendarHighlightToday: {
                name: 'ไฮไลต์วันที่วันนี้',
                desc: 'ไฮไลต์วันที่วันนี้ด้วยสีพื้นหลังและข้อความตัวหนา'
            },
            calendarShowFeatureImage: {
                name: 'แสดงรูปภาพเด่น',
                desc: 'แสดงรูปภาพเด่นของบันทึกในปฏิทิน'
            },
            calendarShowTasks: {
                name: 'แสดงงาน',
                desc: 'แสดงตัวบ่งชี้ในวัน สัปดาห์ และเดือนที่มีงานที่ยังไม่เสร็จ'
            },
            calendarShowWeekNumber: {
                name: 'แสดงหมายเลขสัปดาห์',
                desc: 'เพิ่มคอลัมน์พร้อมหมายเลขสัปดาห์'
            },
            calendarShowQuarter: {
                name: 'แสดงไตรมาส',
                desc: 'เพิ่มป้ายไตรมาสในส่วนหัวปฏิทิน'
            },
            calendarShowYearCalendar: {
                name: 'แสดงปฏิทินรายปี',
                desc: 'แสดงการนำทางปีและตารางเดือนในแถบด้านข้างขวา'
            },
            calendarConfirmBeforeCreate: {
                name: 'ยืนยันก่อนสร้าง',
                desc: 'แสดงกล่องยืนยันเมื่อสร้างบันทึกรายวันใหม่'
            },
            calendarIntegrationMode: {
                name: 'แหล่งที่มาบันทึกรายวัน',
                desc: 'แหล่งที่มาสำหรับบันทึกปฏิทิน',
                options: {
                    dailyNotes: 'บันทึกรายวัน (ปลั๊กอินหลัก)',
                    notebookNavigator: 'Notebook Navigator'
                },
                info: {
                    dailyNotes: 'โฟลเดอร์และรูปแบบวันที่ถูกกำหนดค่าในปลั๊กอิน Daily Notes หลัก'
                }
            },
            calendarPeriodicNotesLocale: {
                name: 'ภาษาของโน้ตตามรอบ',
                desc: 'ควบคุมชื่อเดือน ชื่อวันของสัปดาห์ หมายเลขสัปดาห์ และวันเริ่มต้นของสัปดาห์ที่แปลแล้วในเส้นทางโน้ตตามรอบของ Notebook Navigator',
                options: {
                    calendar: 'ปฏิทิน',
                    obsidian: 'Obsidian'
                }
            },

            calendarCustomRootFolder: {
                name: 'โฟลเดอร์หลัก',
                desc: 'โฟลเดอร์ฐานสำหรับบันทึกตามรอบ รูปแบบวันที่สามารถรวมโฟลเดอร์ย่อยได้ เปลี่ยนแปลงตามโปรไฟล์ห้องนิรภัยที่เลือก',
                placeholder: 'Personal/Diary'
            },
            calendarTemplateFolder: {
                name: 'ตำแหน่งโฟลเดอร์เทมเพลต',
                desc: 'ตัวเลือกไฟล์เทมเพลตแสดงโน้ตจากโฟลเดอร์นี้',
                placeholder: 'Templates',
                usage: 'ใช้โดยโน้ตปฏิทินและโน้ตโฟลเดอร์ กำหนดค่าเทมเพลตใน ปฏิทิน > การรวมปฏิทิน และ โฟลเดอร์และโน้ตโฟลเดอร์ > ไฟล์โน้ตโฟลเดอร์'
            },
            calendarCustomFilePattern: {
                name: 'โน้ตรายวัน',
                desc: 'กำหนดเส้นทางโดยใช้รูปแบบวันที่ Moment ใส่ชื่อโฟลเดอร์ย่อยในวงเล็บเหลี่ยม เช่น [Work]/YYYY คลิกไอคอนเทมเพลตเพื่อตั้งค่าเทมเพลต ตั้งค่าตำแหน่งโฟลเดอร์เทมเพลตในการดำเนินการกับไฟล์ > เทมเพลต',
                momentDescPrefix: 'กำหนดเส้นทางโดยใช้ ',
                momentLinkText: 'รูปแบบวันที่ Moment',
                momentDescSuffix:
                    ' ใส่ชื่อโฟลเดอร์ย่อยในวงเล็บเหลี่ยม เช่น [Work]/YYYY คลิกไอคอนเทมเพลตเพื่อตั้งค่าเทมเพลต ตั้งค่าตำแหน่งโฟลเดอร์เทมเพลตในการดำเนินการกับไฟล์ > เทมเพลต',
                templaterSupportInstalled: '✅ ติดตั้งปลั๊กอิน Templater พร้อมการรองรับเทมเพลตเต็มรูปแบบแล้ว',
                templaterSupportMissing: '⚠️ ติดตั้งปลั๊กอิน Templater เพื่อใช้การรองรับเทมเพลตเต็มรูปแบบ',
                placeholder: 'YYYY/YYYYMMDD',
                example: 'รูปแบบปัจจุบัน: {path}',
                parsingError: 'แพทเทิร์นต้องสามารถฟอร์แมตและพาร์สกลับเป็นวันที่แบบเต็ม (ปี เดือน วัน) ได้'
            },
            calendarCustomWeekPattern: {
                name: 'โน้ตรายสัปดาห์',
                parsingError: 'แพทเทิร์นต้องสามารถฟอร์แมตและพาร์สกลับเป็นสัปดาห์แบบเต็ม (ปีของสัปดาห์ หมายเลขสัปดาห์) ได้',
                weekPathMismatchWarning:
                    'เส้นทางโน้ตรายสัปดาห์ใช้ภาษาของโน้ตตามรอบ ใช้ภาษาที่ตรงกัน หรือใช้ "GGGG" กับ "WW" สำหรับสัปดาห์ที่เริ่มจากวันจันทร์',
                mixedWeekTokensWarning:
                    'แพทเทิร์นนี้ผสมโทเค็นสัปดาห์ที่เริ่มจากวันจันทร์ ("W" หรือ "G") กับโทเค็นสัปดาห์ที่อิงตามภาษา ("w" หรือ "g") ใช้ชุดเดียวอย่างสม่ำเสมอ: "GGGG" กับ "WW" สำหรับสัปดาห์ที่เริ่มจากวันจันทร์ หรือ "gggg" กับ "ww" หากโน้ตรายสัปดาห์ควรเป็นไปตามภาษาที่เลือก'
            },
            calendarCustomMonthPattern: {
                name: 'โน้ตรายเดือน',
                parsingError: 'แพทเทิร์นต้องสามารถฟอร์แมตและพาร์สกลับเป็นเดือนแบบเต็ม (ปี เดือน) ได้'
            },
            calendarCustomQuarterPattern: {
                name: 'โน้ตรายไตรมาส',
                parsingError: 'แพทเทิร์นต้องสามารถฟอร์แมตและพาร์สกลับเป็นไตรมาสแบบเต็ม (ปี ไตรมาส) ได้'
            },
            calendarCustomYearPattern: {
                name: 'โน้ตรายปี',
                parsingError: 'แพทเทิร์นต้องสามารถฟอร์แมตและพาร์สกลับเป็นปีแบบเต็ม (ปี) ได้'
            },
            calendarTemplateFile: {
                current: 'ไฟล์เทมเพลต: {name}'
            },
            showTooltips: {
                name: 'แสดง tooltips',
                desc: 'แสดง tooltips เมื่อวางเมาส์พร้อมข้อมูลเพิ่มเติมสำหรับโน้ตและโฟลเดอร์'
            },
            showTooltipPath: {
                name: 'แสดงเส้นทางใน tooltips',
                desc: 'แสดงเส้นทางโฟลเดอร์ใต้ชื่อโน้ตใน tooltips'
            },
            showTooltipWordCount: {
                name: 'แสดงจำนวนคำใน tooltips',
                desc: 'แสดงจำนวนคำของโน้ตใน tooltips'
            },
            resetPaneSeparator: {
                name: 'รีเซ็ตตำแหน่งตัวคั่นแผง',
                desc: 'รีเซ็ตตัวคั่นที่ลากได้ระหว่างแผงนำทางและแผงรายการเป็นตำแหน่งเริ่มต้น',
                buttonText: 'รีเซ็ตตัวคั่น',
                notice: 'รีเซ็ตตำแหน่งตัวคั่นแล้ว รีสตาร์ท Obsidian หรือเปิด Notebook Navigator ใหม่เพื่อใช้งาน'
            },
            settingsTransfer: {
                name: 'นำเข้าและส่งออกการตั้งค่า',
                desc: 'ส่งออกหรือนำเข้าการตั้งค่า Notebook Navigator เป็น JSON การนำเข้าจะแทนที่การตั้งค่าทั้งหมด',
                importButtonText: 'นำเข้า',
                exportButtonText: 'ส่งออก',
                import: {
                    modalTitle: 'นำเข้าการตั้งค่า',
                    fileButtonName: 'นำเข้าจากไฟล์',
                    fileButtonDesc: 'โหลดไฟล์ JSON จากดิสก์',
                    fileButtonText: 'นำเข้าจากไฟล์',
                    editorName: 'JSON',
                    editorDesc: 'วางหรือแก้ไข JSON ด้านล่าง การตั้งค่าที่ไม่ได้รวมไว้จะถูกรีเซ็ตเป็นค่าเริ่มต้น',
                    placeholder: '{\n  "folderSortOrder": "alpha-desc"\n}',
                    confirmButtonText: 'นำเข้า',
                    confirmTitle: 'นำเข้าการตั้งค่าหรือไม่?',
                    confirmMessage: 'การนำเข้าจะแทนที่การตั้งค่า Notebook Navigator ปัจจุบัน',
                    backupToggleName: 'บันทึกการตั้งค่าปัจจุบันไว้ในรูทห้องนิรภัยก่อนนำเข้า',
                    backupToggleDesc: 'สร้างไฟล์ JSON ที่มีเวลาประทับในรูทห้องนิรภัย',
                    successWithBackupNotice: 'นำเข้าการตั้งค่าแล้ว บันทึกการตั้งค่าก่อนหน้าไว้ที่ {path}',
                    backupError: 'ไม่สามารถบันทึกการตั้งค่าปัจจุบันได้: {message}',
                    successNotice: 'นำเข้าการตั้งค่าแล้ว',
                    errorNotice: 'นำเข้าการตั้งค่าล้มเหลว: {message}',
                    fileReadError: 'ไม่สามารถอ่านไฟล์ได้: {message}'
                },
                export: {
                    modalTitle: 'ส่งออกการตั้งค่า',
                    editorName: 'JSON',
                    editorDesc: 'รวมเฉพาะการตั้งค่าที่เปลี่ยนแปลงจากค่าเริ่มต้น',
                    placeholder: '{}',
                    copyButtonText: 'คัดลอกไปยังคลิปบอร์ด',
                    downloadButtonText: 'ดาวน์โหลด',
                    copyNotice: 'คัดลอกการตั้งค่าไปยังคลิปบอร์ดแล้ว',
                    downloadNotice: 'ส่งออกการตั้งค่าแล้ว',
                    downloadError: 'ส่งออกการตั้งค่าล้มเหลว: {message}'
                }
            },
            resetAllSettings: {
                name: 'รีเซ็ตการตั้งค่าทั้งหมด',
                desc: 'รีเซ็ตการตั้งค่า Notebook Navigator ทั้งหมดเป็นค่าเริ่มต้น',
                buttonText: 'รีเซ็ตการตั้งค่าทั้งหมด',
                confirmTitle: 'รีเซ็ตการตั้งค่าทั้งหมด?',
                confirmMessage: 'การดำเนินการนี้จะรีเซ็ตการตั้งค่า Notebook Navigator ทั้งหมดเป็นค่าเริ่มต้น ไม่สามารถยกเลิกได้',
                confirmButtonText: 'รีเซ็ตการตั้งค่าทั้งหมด',
                notice: 'รีเซ็ตการตั้งค่าทั้งหมดแล้ว รีสตาร์ท Obsidian หรือเปิด Notebook Navigator ใหม่เพื่อใช้งาน',
                error: 'รีเซ็ตการตั้งค่าล้มเหลว'
            },
            multiSelectModifier: {
                name: 'ตัวปรับแต่งเลือกหลายรายการ',
                desc: 'เลือกปุ่มตัวปรับแต่งที่จะสลับการเลือกหลายรายการ เมื่อเลือก Option/Alt การคลิก Cmd/Ctrl จะเปิดโน้ตในแท็บใหม่',
                options: {
                    cmdCtrl: 'คลิก Cmd/Ctrl',
                    optionAlt: 'คลิก Option/Alt'
                }
            },
            enterToOpenFiles: {
                name: 'กด Enter เพื่อเปิดไฟล์',
                desc: 'เปิดไฟล์เฉพาะเมื่อกด Enter ระหว่างการนำทางด้วยแป้นพิมพ์ในรายการ บน macOS การตั้งค่านี้จะป้องกันไม่ให้ Enter เปลี่ยนชื่อไฟล์'
            },
            shiftEnterOpenContext: {
                name: 'Shift+Enter',
                desc: 'เลือกว่าจะให้ Shift+Enter เปิดหรือเปลี่ยนชื่อไฟล์ที่เลือก'
            },
            cmdEnterOpenContext: {
                name: 'Cmd+Enter',
                desc: 'เลือกว่าจะให้ Cmd+Enter เปิดหรือเปลี่ยนชื่อไฟล์ที่เลือก'
            },
            ctrlEnterOpenContext: {
                name: 'Ctrl+Enter',
                desc: 'เลือกว่าจะให้ Ctrl+Enter เปิดหรือเปลี่ยนชื่อไฟล์ที่เลือก'
            },
            mouseBackForwardAction: {
                name: 'ปุ่มย้อนกลับ/ไปข้างหน้าของเมาส์',
                desc: 'การทำงานของปุ่มย้อนกลับและไปข้างหน้าของเมาส์บนเดสก์ท็อป',
                options: {
                    none: 'ใช้ค่าเริ่มต้นของระบบ',
                    singlePaneSwitch: 'สลับแผง (แผงเดียว)',
                    history: 'นำทางประวัติ'
                }
            },
            fileVisibility: {
                name: 'แสดงประเภทไฟล์ (โปรไฟล์ห้องนิรภัย)',
                desc: 'กรองประเภทไฟล์ที่จะแสดงใน navigator ประเภทไฟล์ที่ Obsidian ไม่รองรับอาจเปิดในแอปภายนอก',
                options: {
                    documents: 'เอกสาร (.md, .canvas, .base)',
                    supported: 'รองรับ (เปิดใน Obsidian)',
                    all: 'ทั้งหมด (อาจเปิดภายนอก)'
                }
            },
            homepage: {
                name: 'หน้าแรก',
                desc: 'เลือกสิ่งที่ Notebook Navigator เปิดอัตโนมัติเมื่อเริ่มต้น',
                current: 'ปัจจุบัน: {path}',
                chooseButton: 'เลือกไฟล์',
                options: {
                    none: 'ไม่มี',
                    file: 'ไฟล์',
                    dailyNote: 'บันทึกรายวัน',
                    weeklyNote: 'บันทึกรายสัปดาห์',
                    monthlyNote: 'บันทึกรายเดือน',
                    quarterlyNote: 'บันทึกรายไตรมาส',
                    yearlyNote: 'บันทึกรายปี'
                },
                file: {
                    name: 'หน้าแรก: ไฟล์เริ่มต้น',
                    empty: 'ไม่ได้เลือกไฟล์'
                },
                createMissing: {
                    name: 'หน้าแรก: สร้างบันทึกหากไม่มี',
                    desc: 'สร้างบันทึกเป็นระยะเมื่อเริ่มต้นหรือเมื่อใช้คำสั่ง หากยังไม่มี'
                }
            },
            excludedNotes: {
                name: 'ซ่อนโน้ตตามกฎคุณสมบัติ (โปรไฟล์ห้องนิรภัย)',
                desc: 'รายการกฎ frontmatter คั่นด้วยเครื่องหมายจุลภาค ใช้รูปแบบ `key` หรือ `key=value` (เช่น status=done, published=true, archived)',
                placeholder: 'status=done, published=true, archived'
            },
            excludedFileNamePatterns: {
                name: 'ซ่อนไฟล์ (โปรไฟล์ห้องนิรภัย)',
                desc: 'รายการรูปแบบชื่อไฟล์คั่นด้วยเครื่องหมายจุลภาคที่จะซ่อน รองรับอักขระไวลด์การ์ด * และเส้นทาง / (เช่น temp-*, *.png, /assets/*)',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'โปรไฟล์ห้องนิรภัย',
                desc: 'โปรไฟล์เก็บการมองเห็นประเภทไฟล์ ไฟล์ที่ซ่อน โฟลเดอร์ที่ซ่อน แท็กที่ซ่อน กฎคุณสมบัติสำหรับโน้ตที่ซ่อน ทางลัด และแบนเนอร์นำทาง สลับโปรไฟล์จากส่วนหัวแผงนำทาง',
                defaultName: 'ค่าเริ่มต้น',
                addButton: 'เพิ่มโปรไฟล์',
                editProfilesButton: 'แก้ไขโปรไฟล์',
                addProfileOption: 'เพิ่มโปรไฟล์...',
                applyButton: 'นำไปใช้',
                deleteButton: 'ลบโปรไฟล์',
                addModalTitle: 'เพิ่มโปรไฟล์',
                editProfilesModalTitle: 'แก้ไขโปรไฟล์',
                addModalPlaceholder: 'ชื่อโปรไฟล์',
                deleteModalTitle: 'ลบ {name}',
                deleteModalMessage: 'ลบ {name}? ตัวกรองไฟล์ โฟลเดอร์ แท็ก และโน้ตตามคุณสมบัติที่บันทึกในโปรไฟล์นี้จะถูกลบ',
                moveUp: 'ย้ายขึ้น',
                moveDown: 'ย้ายลง',
                errors: {
                    emptyName: 'กรอกชื่อโปรไฟล์',
                    duplicateName: 'ชื่อโปรไฟล์มีอยู่แล้ว'
                }
            },
            vaultTitle: {
                name: 'ตำแหน่งชื่อห้องนิรภัย',
                desc: 'เลือกตำแหน่งที่จะแสดงชื่อห้องนิรภัย',
                options: {
                    header: 'แสดงในส่วนหัว',
                    navigation: 'แสดงในแผงนำทาง'
                }
            },
            excludedFolders: {
                name: 'ซ่อนโฟลเดอร์ (โปรไฟล์ห้องนิรภัย)',
                desc: 'รายการโฟลเดอร์คั่นด้วยเครื่องหมายจุลภาคที่จะซ่อน รูปแบบชื่อ: assets* (โฟลเดอร์ที่เริ่มด้วย assets), *_temp (ลงท้ายด้วย _temp) รูปแบบเส้นทาง: /archive (archive หลักเท่านั้น), /res* (โฟลเดอร์หลักที่เริ่มด้วย res), /*/temp (โฟลเดอร์ temp ลึกหนึ่งระดับ), /projects/* (โฟลเดอร์ทั้งหมดใน projects)',
                placeholder: 'templates, assets*, /archive, /res*'
            },
            descendantExcludedFolders: {
                name: 'ยกเว้นโฟลเดอร์จากโน้ตในโฟลเดอร์ย่อย (โปรไฟล์คลัง)',
                desc: 'รายการโฟลเดอร์คั่นด้วยเครื่องหมายจุลภาคที่จะละเว้นเมื่อรวบรวมโน้ตจากโฟลเดอร์ย่อย โฟลเดอร์ยังคงมองเห็นได้ และเมื่อเลือกโฟลเดอร์นั้นจะยังแสดงโน้ตของโฟลเดอร์นั้น ใช้รูปแบบเดียวกับซ่อนโฟลเดอร์',
                placeholder: 'รายวัน, ทรัพยากร, /archive'
            },
            showFileDate: {
                name: 'แสดงวันที่',
                desc: 'แสดงวันที่ใต้ชื่อโน้ต'
            },
            alphabeticalDateMode: {
                name: 'เมื่อเรียงตามชื่อ',
                desc: 'วันที่ที่จะแสดงเมื่อโน้ตเรียงตามตัวอักษร',
                options: {
                    created: 'วันที่สร้าง',
                    modified: 'วันที่แก้ไข'
                }
            },
            showFileTags: {
                name: 'แสดงแท็กไฟล์',
                desc: 'แสดงแท็กที่คลิกได้ในรายการไฟล์'
            },
            showFileTagAncestors: {
                name: 'แสดงเส้นทางแท็กเต็ม',
                desc: "แสดงเส้นทางลำดับชั้นแท็กเต็ม เมื่อเปิด: 'ai/openai', 'work/projects/2024' เมื่อปิด: 'openai', '2024'"
            },
            colorFileTags: {
                name: 'ลงสีแท็กไฟล์',
                desc: 'ใช้สีแท็กกับป้ายแท็กบนรายการไฟล์'
            },
            prioritizeColoredFileTags: {
                name: 'แสดงแท็กที่มีสีก่อน',
                desc: 'เรียงแท็กที่มีสีก่อนแท็กอื่นบนรายการไฟล์'
            },
            showFileTagsInCompactMode: {
                name: 'แสดงแท็กไฟล์ในโหมดกะทัดรัด',
                desc: 'แสดงแท็กเมื่อวันที่ ตัวอย่าง และรูปภาพถูกซ่อน'
            },
            showFileProperties: {
                name: 'แสดงคุณสมบัติไฟล์',
                desc: 'แสดงคุณสมบัติในรายการไฟล์ ใช้หน้าต่าง "การแสดงผลคีย์คุณสมบัติ" เพื่อเลือกคุณสมบัติที่แสดง'
            },
            colorFileProperties: {
                name: 'ระบายสีคุณสมบัติไฟล์',
                desc: 'ใช้สีคุณสมบัติกับป้ายคุณสมบัติบนรายการไฟล์'
            },
            prioritizeColoredFileProperties: {
                name: 'แสดงคุณสมบัติที่มีสีก่อน',
                desc: 'เรียงคุณสมบัติที่มีสีก่อนคุณสมบัติอื่นบนรายการไฟล์'
            },
            showFilePropertiesInCompactMode: {
                name: 'แสดงคุณสมบัติในโหมดกะทัดรัด',
                desc: 'แสดงคุณสมบัติเมื่อโหมดกะทัดรัดเปิดใช้งาน'
            },
            textCountDisplay: {
                name: 'ประเภทการนับ',
                desc: 'เลือกจำนวนของโน้ตที่จะแสดงในรายการไฟล์',
                options: {
                    none: 'ไม่มี',
                    words: 'จำนวนคำ',
                    characters: 'จำนวนอักขระ',
                    both: 'จำนวนคำและอักขระ'
                }
            },
            textCountPlacement: {
                name: 'ตำแหน่ง',
                desc: 'เลือกตำแหน่งที่จะแสดงจำนวนของโน้ต',
                options: {
                    title: 'ในชื่อเรื่อง',
                    property: 'เป็นคุณสมบัติ'
                }
            },
            characterCountSpaces: {
                name: 'จำนวนอักขระ',
                desc: 'เลือกว่าจะนับช่องว่างรวมในจำนวนอักขระหรือไม่',
                options: {
                    include: 'รวมช่องว่าง',
                    exclude: 'ไม่รวมช่องว่าง'
                }
            },
            wordCountTargetProperty: {
                name: 'คุณสมบัติเป้าหมาย',
                desc: 'คีย์คุณสมบัติ frontmatter ที่มีจำนวนคำเป้าหมาย เว้นว่างไว้เพื่อซ่อนเป้าหมาย'
            },
            showWordCountPercentage: {
                name: 'แสดงเปอร์เซ็นต์เป้าหมาย',
                desc: 'แสดงเฉพาะเปอร์เซ็นต์ความคืบหน้าเมื่อมีจำนวนคำเป้าหมาย'
            },
            propertyFields: {
                name: 'คีย์คุณสมบัติ (โปรไฟล์ห้องนิรภัย)',
                desc: 'คีย์คุณสมบัติ frontmatter พร้อมการตั้งค่าการแสดงผลแต่ละคีย์สำหรับการนำทางและรายการไฟล์',
                addButtonTooltip: 'กำหนดค่าคีย์คุณสมบัติ',
                noneConfigured: 'ไม่มีคุณสมบัติที่กำหนดค่า',
                singleConfigured: 'กำหนดค่าคุณสมบัติ 1 รายการ: {properties}',
                multipleConfigured: 'กำหนดค่าคุณสมบัติ {count} รายการ: {properties}'
            },
            showPropertiesOnSeparateRows: {
                name: 'แสดงคุณสมบัติแยกเป็นบรรทัด',
                desc: 'แสดงแต่ละคุณสมบัติในบรรทัดของตัวเอง'
            },
            enablePropertyInternalLinks: {
                name: 'เชื่อมโยงป้ายคุณสมบัติไปยังบันทึก',
                desc: 'คลิกป้ายคุณสมบัติเพื่อเปิดบันทึกที่เชื่อมโยง'
            },
            enablePropertyExternalLinks: {
                name: 'เชื่อมโยงป้ายคุณสมบัติไปยัง URL',
                desc: 'คลิกป้ายคุณสมบัติเพื่อเปิด URL ที่เชื่อมโยง'
            },
            dateFormat: {
                name: 'รูปแบบวันที่',
                desc: 'รูปแบบสำหรับแสดงวันที่ (ใช้รูปแบบ Moment)',
                placeholder: 'D MMM YYYY',
                help: 'รูปแบบทั่วไป:\nD MMM YYYY = 25 พ.ค. 2022\nDD/MM/YYYY = 25/05/2022\nYYYY-MM-DD = 2022-05-25\n\nโทเคน:\nYYYY/YY = ปี\nMMMM/MMM/MM = เดือน\nDD/D = วัน\ndddd/ddd = วันในสัปดาห์',
                helpTooltip: 'รูปแบบโดยใช้ Moment',
                momentLinkText: 'รูปแบบ Moment'
            },
            timeFormat: {
                name: 'รูปแบบเวลา',
                desc: 'รูปแบบสำหรับแสดงเวลา (ใช้รูปแบบ Moment)',
                placeholder: 'HH:mm',
                help: 'รูปแบบทั่วไป:\nHH:mm = 14:30 (24 ชั่วโมง)\nh:mm a = 2:30 PM (12 ชั่วโมง)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nโทเคน:\nHH/H = 24 ชั่วโมง\nhh/h = 12 ชั่วโมง\nmm = นาที\nss = วินาที\na = AM/PM',
                helpTooltip: 'รูปแบบโดยใช้ Moment',
                momentLinkText: 'รูปแบบ Moment'
            },
            showFilePreview: {
                name: 'แสดงตัวอย่างโน้ต',
                desc: 'แสดงข้อความตัวอย่างใต้ชื่อโน้ต'
            },
            skipHeadingsInPreview: {
                name: 'ข้ามหัวข้อในตัวอย่าง',
                desc: 'ข้ามบรรทัดหัวข้อเมื่อสร้างข้อความตัวอย่าง'
            },
            skipCodeBlocksInPreview: {
                name: 'ข้ามบล็อกโค้ดในตัวอย่าง',
                desc: 'ข้ามบล็อกโค้ดเมื่อสร้างข้อความตัวอย่าง'
            },
            stripHtmlInPreview: {
                name: 'ลบ HTML ในตัวอย่าง',
                desc: 'ลบแท็ก HTML ออกจากข้อความตัวอย่าง อาจส่งผลต่อประสิทธิภาพในโน้ตขนาดใหญ่'
            },
            stripLatexInPreview: {
                name: 'ลบ LaTeX ในตัวอย่าง',
                desc: 'ลบนิพจน์ LaTeX แบบอินไลน์และแบบบล็อกออกจากข้อความตัวอย่าง'
            },
            previewProperties: {
                name: 'คุณสมบัติตัวอย่าง',
                desc: 'รายการคุณสมบัติ frontmatter คั่นด้วยเครื่องหมายจุลภาคเพื่อตรวจสอบข้อความตัวอย่าง คุณสมบัติแรกที่มีข้อความจะถูกใช้',
                placeholder: 'summary, description, abstract'
            },
            previewPropertiesFallback: {
                name: 'ใช้เนื้อหาโน้ตแทน',
                desc: 'แสดงเนื้อหาโน้ตเป็นตัวอย่างเมื่อไม่มีคุณสมบัติที่ระบุมีข้อความ'
            },
            previewRows: {
                name: 'แถวตัวอย่าง',
                desc: 'จำนวนแถวที่จะแสดงสำหรับข้อความตัวอย่าง',
                options: {
                    '1': '1 แถว',
                    '2': '2 แถว',
                    '3': '3 แถว',
                    '4': '4 แถว',
                    '5': '5 แถว'
                }
            },
            fileNameRows: {
                name: 'แถวชื่อเรื่อง',
                desc: 'จำนวนแถวที่จะแสดงสำหรับชื่อโน้ต',
                options: {
                    '1': '1 แถว',
                    '2': '2 แถว',
                    '3': '3 แถว'
                }
            },
            useFolderColor: {
                name: 'ใช้สีโฟลเดอร์',
                desc: 'ใส่สีให้กับชื่อโน้ตและไอคอนไฟล์ตามสีของโฟลเดอร์หลักเมื่อไม่มีการตั้งค่าสีไฟล์กำหนดเอง ลำดับความสำคัญ: สีไฟล์กำหนดเอง > สีโฟลเดอร์ > สีค่าเริ่มต้น'
            },
            showFeatureImage: {
                name: 'แสดงรูปภาพประกอบ',
                desc: 'แสดงภาพย่อของรูปภาพแรกที่พบในโน้ต'
            },
            forceSquareFeatureImage: {
                name: 'บังคับรูปภาพประกอบสี่เหลี่ยม',
                desc: 'แสดงรูปภาพประกอบเป็นภาพย่อสี่เหลี่ยม'
            },
            featureImageProperties: {
                name: 'คุณสมบัติรูปภาพ',
                desc: 'รายการคุณสมบัติ frontmatter คั่นด้วยเครื่องหมายจุลภาคเพื่อตรวจสอบก่อน ถ้าไม่พบจะใช้รูปภาพแรกในเนื้อหา markdown',
                placeholder: 'thumbnail, featureResized, feature'
            },
            featureImageExcludeProperties: {
                name: 'ยกเว้นโน้ตที่มีคุณสมบัติ',
                desc: 'รายการคุณสมบัติ frontmatter คั่นด้วยเครื่องหมายจุลภาค โน้ตที่มีคุณสมบัติใดๆ เหล่านี้จะไม่เก็บภาพเด่น',
                placeholder: 'private, confidential'
            },
            featureImageSize: {
                name: 'ขนาดการแสดงภาพเด่น',
                desc: 'ขนาดสูงสุดในการแสดงผลภาพเด่นในรายการโน้ต',
                options: {
                    standard: '64 px',
                    large: '96 px',
                    extraLarge: '128 px'
                }
            },
            featureImagePixelSize: {
                name: 'ขนาดพิกเซลของภาพเด่น',
                desc: 'ความละเอียดที่ใช้ในการสร้างภาพขนาดย่อที่จัดเก็บของภาพเด่น เพิ่มค่านี้หากภาพตัวอย่างขนาดใหญ่ดูเบลอ',
                options: {
                    standard: '256 x 144 px',
                    large: '384 x 216 px',
                    extraLarge: '512 x 288 px'
                }
            },

            downloadExternalFeatureImages: {
                name: 'ดาวน์โหลดรูปภาพภายนอก',
                desc: 'ดาวน์โหลดรูปภาพระยะไกลและภาพขนาดย่อ YouTube สำหรับรูปภาพเด่น'
            },
            hideDrawingPreviewImages: {
                name: 'ซ่อนรูปภาพตัวอย่างที่ส่งออก',
                desc: 'ซ่อนไฟล์ PNG ตัวอย่างภาพวาดที่ส่งออก เปิด "แสดงรายการที่ซ่อน" เพื่อแสดงไฟล์เหล่านั้น'
            },
            drawingIntegrationInfo: {
                intro: 'Notebook Navigator แสดงไฟล์ PNG ที่ส่งออกโดย Excalidraw เป็นภาพตัวอย่างของภาพวาด',
                items: [
                    'ใน **การตั้งค่า Excalidraw** เปิด **Embedding Excalidraw into your Notes and Exporting** จากนั้น **Export Settings** จากนั้น **Auto-export Settings**',
                    'เปิดใช้งาน **Auto-export PNG** หากต้องการ ให้เปิดใช้งาน **Export both dark- and light-themed image** ด้วย',
                    'Notebook Navigator จะมองหา **Drawing.excalidraw.png**, **Drawing.excalidraw.dark.png** หรือ **Drawing.excalidraw.light.png**',
                    'ขณะที่ **ซ่อนรูปภาพตัวอย่างที่ส่งออก** เปิดอยู่ ไฟล์ PNG จะปรากฏเฉพาะเมื่อ **แสดงรายการที่ซ่อน** เปิดอยู่ด้วยเท่านั้น'
                ]
            },
            showRootFolder: {
                name: 'แสดงโฟลเดอร์หลัก',
                desc: 'แสดงชื่อห้องนิรภัยเป็นโฟลเดอร์หลักในต้นไม้'
            },
            showFolderIcons: {
                name: 'แสดงไอคอนโฟลเดอร์',
                desc: 'แสดงไอคอนข้างโฟลเดอร์ในแผงนำทาง'
            },
            inheritFolderColors: {
                name: 'สืบทอดสีโฟลเดอร์',
                desc: 'โฟลเดอร์ลูกสืบทอดสีจากโฟลเดอร์หลัก'
            },
            folderSortOrder: {
                name: 'ลำดับการเรียงโฟลเดอร์',
                desc: 'คลิกขวาที่โฟลเดอร์ใดก็ได้เพื่อตั้งค่าลำดับการเรียงที่แตกต่างสำหรับรายการย่อย',
                options: {
                    alphaAsc: 'ก ถึง ฮ',
                    alphaDesc: 'ฮ ถึง ก'
                }
            },
            showNoteCount: {
                name: 'แสดงจำนวนโน้ต',
                desc: 'แสดงจำนวนโน้ตข้างโฟลเดอร์ แท็ก และคุณสมบัติ'
            },
            showSectionIcons: {
                name: 'แสดงไอคอนสำหรับทางลัดและรายการล่าสุด',
                desc: 'แสดงไอคอนข้างรายการในส่วนทางลัดและล่าสุด'
            },
            interfaceIcons: {
                name: 'ไอคอนอินเทอร์เฟซ',
                desc: 'แก้ไขไอคอนแถบเครื่องมือ โฟลเดอร์ แท็ก คุณสมบัติ ปักหมุด ค้นหา และเรียงลำดับ',
                buttonText: 'แก้ไขไอคอน'
            },
            showIconsColorOnly: {
                name: 'ใช้สีกับไอคอนเท่านั้น',
                desc: 'เมื่อเปิดใช้งาน สีกำหนดเองจะใช้กับไอคอนเท่านั้น เมื่อปิดใช้งาน สีจะใช้กับทั้งไอคอนและป้ายข้อความ'
            },
            navRainbowMode: {
                name: 'โหมดสีรุ้ง (โปรไฟล์ห้องนิรภัย)',
                desc: 'ใช้สีรุ้งในแผงนำทาง',
                options: {
                    none: 'ปิด',
                    foreground: 'สีข้อความ',
                    background: 'สีพื้นหลัง'
                }
            },
            navRainbowFirstColor: {
                name: 'สีแรก',
                desc: 'สีแรกในไล่ระดับสีรุ้ง'
            },
            navRainbowLastColor: {
                name: 'สีสุดท้าย',
                desc: 'สีสุดท้ายในไล่ระดับสีรุ้ง'
            },
            navRainbowTransitionStyle: {
                name: 'รูปแบบการเปลี่ยน',
                desc: 'การประมาณค่าที่ใช้ระหว่างสีแรกและสีสุดท้าย',
                options: {
                    hue: 'เฉดสี',
                    rgb: 'RGB'
                }
            },
            navRainbowApplyToShortcuts: {
                name: 'ใช้กับทางลัด',
                desc: 'ใช้สีรุ้งกับทางลัด'
            },
            navRainbowApplyToRecent: {
                name: 'ใช้กับรายการล่าสุด',
                desc: 'ใช้สีรุ้งกับรายการล่าสุด'
            },
            navRainbowApplyToFolders: {
                name: 'ใช้กับโฟลเดอร์',
                desc: 'ใช้สีรุ้งกับโฟลเดอร์'
            },
            navRainbowFolderScope: {
                name: 'ขอบเขตโฟลเดอร์',
                desc: 'เลือกระดับโฟลเดอร์ที่เริ่มกำหนดสี',
                options: {
                    root: 'ระดับราก',
                    child: 'ระดับย่อย',
                    all: 'ทุกระดับ'
                }
            },
            navRainbowApplyToTags: {
                name: 'ใช้กับแท็ก',
                desc: 'ใช้สีรุ้งกับแท็ก'
            },
            navRainbowTagScope: {
                name: 'ขอบเขตแท็ก',
                desc: 'เลือกระดับแท็กที่เริ่มกำหนดสี',
                options: {
                    root: 'ระดับราก',
                    child: 'ระดับย่อย',
                    all: 'ทุกระดับ'
                }
            },
            navRainbowApplyToProperties: {
                name: 'ใช้กับคุณสมบัติ',
                desc: 'ใช้สีรุ้งกับคุณสมบัติ'
            },
            navRainbowBalanceHueLuminance: {
                name: 'ความสว่างสม่ำเสมอข้ามเฉดสี', // (English: Consistent brightness across hues)
                desc: 'ประมาณค่าความสว่างระหว่างสีเริ่มต้นและสีสุดท้ายระหว่างการเปลี่ยนเฉดสี' // (English: Interpolates brightness between the start and end colors during hue transitions.)
            },
            navRainbowSeparateThemeColors: {
                name: 'แยกสีโหมดสว่างและโหมดมืด', // (English: Separate light and dark mode colors)
                desc: 'ใช้สีรุ้งที่แตกต่างกันสำหรับโหมดสว่างและโหมดมืด' // (English: Use different rainbow colors for light mode and dark mode.)
            },
            navRainbowCopyLightToDark: 'คัดลอกสีโหมดสว่างไปยังโหมดมืด', // (English: Copy light mode color to dark mode)
            navRainbowPropertyScope: {
                name: 'ขอบเขตคุณสมบัติ',
                desc: 'เลือกระดับคุณสมบัติที่เริ่มกำหนดสี',
                options: {
                    root: 'ระดับราก',
                    child: 'ระดับย่อย',
                    all: 'ทุกระดับ'
                }
            },
            collapseBehavior: {
                name: 'ยุบรายการ',
                desc: 'เลือกว่าปุ่มขยาย/ยุบทั้งหมดจะมีผลกับอะไร',
                options: {
                    all: 'ทั้งหมด',
                    foldersOnly: 'โฟลเดอร์เท่านั้น',
                    tagsOnly: 'แท็กเท่านั้น',
                    propertiesOnly: 'คุณสมบัติเท่านั้น'
                }
            },
            smartCollapse: {
                name: 'เก็บรายการที่เลือกไว้ขยาย',
                desc: 'เมื่อยุบ เก็บรายการที่เลือกและหลักไว้ขยาย'
            },
            excludeVaultRootFromCollapse: {
                name: 'ข้ามรูทห้องนิรภัยเมื่อยุบ',
                desc: 'เมื่อยุบรายการทั้งหมด ให้คงโฟลเดอร์รูทของห้องนิรภัยไว้ในสถานะปัจจุบัน'
            },
            navIndent: {
                name: 'การเยื้องต้นไม้',
                desc: 'ปรับความกว้างการเยื้องสำหรับโฟลเดอร์ แท็ก และคุณสมบัติที่ซ้อนกัน (พิกเซล)'
            },
            navItemHeight: {
                name: 'ความสูงรายการ',
                desc: 'ปรับความสูงของโฟลเดอร์ แท็ก และคุณสมบัติในแผงนำทาง (พิกเซล)'
            },
            navItemHeightScaleText: {
                name: 'ปรับขนาดข้อความตามความสูงรายการ',
                desc: 'ลดขนาดข้อความนำทางเมื่อความสูงรายการลดลง'
            },
            showIndentGuides: {
                name: 'แสดงเส้นนำการเยื้อง',
                desc: 'แสดงเส้นนำการเยื้องสำหรับโฟลเดอร์ แท็ก และคุณสมบัติที่ซ้อนกัน'
            },
            navCountLeaderStyle: {
                name: 'แสดงตัวนำสายตา',
                desc: 'แสดงจุด ขีด หรือเส้นระหว่างชื่อรายการกับจำนวนโน้ต',
                options: {
                    none: 'ไม่มี',
                    dots: 'จุด (...)',
                    dashes: 'ขีด (---)',
                    line: 'เส้น'
                }
            },
            navRootSpacing: {
                name: 'ระยะห่างรายการหลัก',
                desc: 'ระยะห่างระหว่างโฟลเดอร์ แท็ก และคุณสมบัติระดับหลัก (พิกเซล)'
            },
            showTags: {
                name: 'แสดงแท็ก',
                desc: 'แสดงส่วนแท็กใน navigator'
            },
            showTagIcons: {
                name: 'แสดงไอคอนแท็ก',
                desc: 'แสดงไอคอนข้างแท็กในแผงนำทาง'
            },
            inheritTagColors: {
                name: 'สืบทอดสีแท็ก',
                desc: 'แท็กลูกสืบทอดสีจากแท็กแม่'
            },
            tagSortOrder: {
                name: 'ลำดับการเรียงแท็ก',
                desc: 'คลิกขวาที่แท็กใดก็ได้เพื่อตั้งค่าลำดับการเรียงที่แตกต่างสำหรับรายการย่อย',
                options: {
                    alphaAsc: 'ก ถึง ฮ',
                    alphaDesc: 'ฮ ถึง ก',
                    frequency: 'ความถี่',
                    lowToHigh: 'ต่ำไปสูง',
                    highToLow: 'สูงไปต่ำ'
                }
            },
            showAllTagsFolder: {
                name: 'แสดงโฟลเดอร์แท็ก',
                desc: 'แสดง "แท็ก" เป็นโฟลเดอร์ที่ยุบได้'
            },
            showUntagged: {
                name: 'แสดงโน้ตที่ไม่มีแท็ก',
                desc: 'แสดงรายการ "ไม่มีแท็ก" สำหรับโน้ตที่ไม่มีแท็ก'
            },
            scopeTagsToCurrentContext: {
                name: 'กรองแท็กตามการเลือก',
                desc: 'แสดงเฉพาะแท็กที่ปรากฏในโน้ตภายในโฟลเดอร์หรือคุณสมบัติที่เลือก'
            },
            keepEmptyTagsProperty: {
                name: 'เก็บคุณสมบัติแท็กหลังนำแท็กสุดท้ายออก',
                desc: 'เก็บคุณสมบัติแท็ก frontmatter เมื่อนำแท็กทั้งหมดออก เมื่อปิดใช้งาน คุณสมบัติแท็กจะถูกลบออกจาก frontmatter'
            },
            showProperties: {
                name: 'แสดงคุณสมบัติ',
                desc: 'แสดงส่วนคุณสมบัติในตัวนำทาง',
                propertyKeysInfoPrefix: 'กำหนดค่าคุณสมบัติใน ',
                propertyKeysInfoLinkText: 'เริ่มต้น > คีย์คุณสมบัติ',
                propertyKeysInfoSuffix: ''
            },
            showPropertyIcons: {
                name: 'แสดงไอคอนคุณสมบัติ',
                desc: 'แสดงไอคอนข้างคุณสมบัติในแผงนำทาง'
            },
            inheritPropertyColors: {
                name: 'สืบทอดสีคุณสมบัติ',
                desc: 'ค่าคุณสมบัติจะสืบทอดสีและพื้นหลังจากคีย์คุณสมบัติ'
            },
            propertySortOrder: {
                name: 'ลำดับการเรียงคุณสมบัติ',
                desc: 'คลิกขวาที่คุณสมบัติใดก็ได้เพื่อตั้งค่าลำดับการเรียงที่แตกต่างสำหรับค่าต่างๆ',
                options: {
                    alphaAsc: 'ก ถึง ฮ',
                    alphaDesc: 'ฮ ถึง ก',
                    frequency: 'ความถี่',
                    lowToHigh: 'ต่ำไปสูง',
                    highToLow: 'สูงไปต่ำ'
                }
            },
            showAllPropertiesFolder: {
                name: 'แสดงโฟลเดอร์คุณสมบัติ',
                desc: 'แสดง "คุณสมบัติ" เป็นโฟลเดอร์ที่พับได้'
            },
            scopePropertiesToCurrentContext: {
                name: 'กรองคุณสมบัติตามการเลือก',
                desc: 'แสดงเฉพาะคุณสมบัติที่ปรากฏในโน้ตภายในโฟลเดอร์หรือแท็กที่เลือก'
            },
            hiddenTags: {
                name: 'ซ่อนแท็ก (โปรไฟล์ห้องนิรภัย)',
                desc: 'รายการรูปแบบแท็กคั่นด้วยเครื่องหมายจุลภาค รูปแบบชื่อ: tag* (ขึ้นต้นด้วย), *tag (ลงท้ายด้วย) รูปแบบเส้นทาง: archive (แท็กและลูกหลาน), archive/* (ลูกหลานเท่านั้น), projects/*/drafts (wildcard ตรงกลาง)',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            hiddenFileTags: {
                name: 'ซ่อนโน้ตที่มีแท็ก (โปรไฟล์ห้องนิรภัย)',
                desc: 'Comma-separated list of tag patterns. Notes containing matching tags are hidden. Name patterns: tag* (starting with), *tag (ending with). Path patterns: archive (tag and descendants), archive/* (descendants only), projects/*/drafts (mid-segment wildcard).',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'เปิดใช้งานโน้ตโฟลเดอร์',
                desc: 'โฟลเดอร์ที่มีไฟล์โน้ตตรงกันจะแสดงเป็นลิงก์ที่คลิกได้'
            },
            folderNoteType: {
                name: 'ประเภทโน้ตโฟลเดอร์เริ่มต้น',
                desc: 'ประเภทโน้ตโฟลเดอร์ที่สร้างจากเมนูบริบท',
                options: {
                    ask: 'ถามเมื่อสร้าง',
                    markdown: 'Markdown',
                    canvas: 'Canvas',
                    base: 'Base'
                }
            },
            folderNoteName: {
                name: 'ชื่อโน้ตโฟลเดอร์',
                desc: 'ชื่อโน้ตโฟลเดอร์ไม่มีนามสกุล เว้นว่างเพื่อใช้ชื่อเดียวกับโฟลเดอร์',
                placeholder: 'index'
            },
            folderNoteNamePattern: {
                name: 'รูปแบบชื่อโน้ตโฟลเดอร์',
                desc: 'รูปแบบชื่อสำหรับโน้ตโฟลเดอร์โดยไม่มีนามสกุล ใช้ {{folder}} เพื่อแทรกชื่อโฟลเดอร์ เมื่อตั้งค่าแล้ว ชื่อโน้ตโฟลเดอร์จะไม่ถูกนำไปใช้'
            },
            folderNoteTemplate: {
                name: 'เทมเพลตโน้ตโฟลเดอร์',
                desc: 'ไฟล์เทมเพลตที่ใช้เมื่อสร้างโน้ตโฟลเดอร์ เทมเพลต Markdown สามารถใช้ Templater ได้ เทมเพลต Canvas และ Base จะถูกคัดลอกเป็นเนื้อหาไฟล์ ตั้งค่าตำแหน่งโฟลเดอร์เทมเพลตในการดำเนินการกับไฟล์ > เทมเพลต',
                formatWarning: 'รูปแบบเทมเพลตต้องตรงกับประเภทโน้ตโฟลเดอร์ที่เลือก: .md, .canvas หรือ .base'
            },
            enableFolderNoteLinks: {
                name: 'ชื่อโฟลเดอร์เปิดโน้ตโฟลเดอร์',
                desc: 'การคลิกชื่อโฟลเดอร์จะเปิดโน้ตโฟลเดอร์ของโฟลเดอร์นั้น เมื่อปิด โน้ตโฟลเดอร์จะให้เฉพาะข้อมูลเมตาของโฟลเดอร์ เช่น ชื่อ ไอคอน และสี'
            },
            hideFolderNoteInList: {
                name: 'ซ่อนโน้ตโฟลเดอร์ในรายการ',
                desc: 'ซ่อนโน้ตโฟลเดอร์จากรายการไฟล์'
            },
            pinCreatedFolderNote: {
                name: 'ปักหมุดโน้ตโฟลเดอร์ที่สร้าง',
                desc: 'ปักหมุดโน้ตโฟลเดอร์เมื่อสร้างจากเมนูบริบท'
            },
            folderNoteOpenLocation: {
                name: 'เปิดโน้ตโฟลเดอร์ใน',
                desc: 'เลือกตำแหน่งที่เปิดโน้ตโฟลเดอร์เมื่อคลิกลิงก์โน้ตโฟลเดอร์',
                options: {
                    currentTab: 'แท็บปัจจุบัน',
                    newTab: 'แท็บใหม่',
                    rightSidebar: 'แถบด้านขวา'
                }
            },
            showNearestFolderNoteInSidebar: {
                name: 'แถบด้านขวา: แสดงโน้ตโฟลเดอร์ที่ใกล้ที่สุด',
                desc: 'เมื่อเลือกโฟลเดอร์ แถบด้านขวาจะแสดงโน้ตโฟลเดอร์บรรพบุรุษที่ใกล้ที่สุดโดยอัตโนมัติ'
            },
            confirmBeforeDelete: {
                name: 'ยืนยันก่อนลบ',
                desc: 'แสดงกล่องยืนยันเมื่อลบโน้ตหรือโฟลเดอร์'
            },
            deleteAttachments: {
                name: 'ลบไฟล์แนบเมื่อลบไฟล์',
                desc: 'ลบไฟล์แนบที่เชื่อมโยงและตัวอย่างภาพวาดที่สร้างขึ้นโดยอัตโนมัติหากไม่ได้ใช้ในที่อื่น',
                options: {
                    ask: 'ถามทุกครั้ง',
                    always: 'เสมอ',
                    never: 'ไม่เลย'
                }
            },
            moveFileConflicts: {
                name: 'ข้อขัดแย้งการย้าย',
                desc: 'เมื่อย้ายไฟล์ไปยังโฟลเดอร์ที่มีไฟล์ชื่อเดียวกันอยู่แล้ว ถามทุกครั้ง (เปลี่ยนชื่อ, เขียนทับ, ยกเลิก) หรือเปลี่ยนชื่อเสมอ',
                options: {
                    ask: 'ถามทุกครั้ง',
                    rename: 'เปลี่ยนชื่อเสมอ'
                }
            },
            metadataCleanup: {
                name: 'ล้างเมตาดาต้า',
                desc: 'ลบเมตาดาต้ากำพร้าที่เหลืออยู่เมื่อไฟล์ โฟลเดอร์ แท็ก หรือคุณสมบัติถูกลบ ย้าย หรือเปลี่ยนชื่อนอก Obsidian มีผลเฉพาะไฟล์การตั้งค่า Notebook Navigator',
                buttonText: 'ล้างเมตาดาต้า',
                error: 'ล้างการตั้งค่าล้มเหลว',
                loading: 'กำลังตรวจสอบเมตาดาต้า...',
                statusClean: 'ไม่มีเมตาดาต้าให้ล้าง',
                statusCounts:
                    'รายการกำพร้า: {folders} โฟลเดอร์, {tags} แท็ก, {properties} คุณสมบัติ, {files} ไฟล์, {pinned} ปักหมุด, {separators} ตัวคั่น'
            },
            rebuildCache: {
                name: 'สร้างแคชใหม่',
                desc: 'ใช้เมื่อพบแท็กที่หายไป ตัวอย่างไม่ถูกต้อง หรือรูปภาพประกอบที่หายไป สิ่งนี้อาจเกิดขึ้นหลังจากความขัดแย้งการซิงค์หรือการปิดที่ไม่คาดคิด',
                buttonText: 'สร้างแคชใหม่',
                error: 'สร้างแคชใหม่ล้มเหลว',
                indexingTitle: 'กำลังสร้างดัชนีห้องนิรภัย...',
                progress: 'Notebook Navigator กำลังอัปเดตแคช.'
            },
            externalIcons: {
                downloadButton: 'ดาวน์โหลด',
                downloadingLabel: 'กำลังดาวน์โหลด...',
                removeButton: 'นำออก',
                statusInstalled: 'ดาวน์โหลดแล้ว (เวอร์ชัน {version})',
                statusNotInstalled: 'ยังไม่ดาวน์โหลด',
                versionUnknown: 'ไม่ทราบ',
                downloadFailed: 'ดาวน์โหลด {name} ล้มเหลว ตรวจสอบการเชื่อมต่อและลองอีกครั้ง',
                removeFailed: 'นำ {name} ออกล้มเหลว',
                infoNote:
                    'ชุดไอคอนที่ดาวน์โหลดจะซิงค์สถานะการติดตั้งระหว่างอุปกรณ์ ชุดไอคอนอยู่ในฐานข้อมูลท้องถิ่นของแต่ละอุปกรณ์; การซิงค์ติดตามเฉพาะว่าจะดาวน์โหลดหรือนำออก ชุดไอคอนดาวน์โหลดจากที่เก็บ Notebook Navigator (https://github.com/johansan/notebook-navigator/tree/main/icon-assets)'
            },
            useFrontmatterDates: {
                name: 'ใช้เมตาดาต้า frontmatter',
                desc: 'ใช้ frontmatter สำหรับชื่อโน้ต timestamps ไอคอน และสี'
            },
            frontmatterIconField: {
                name: 'ฟิลด์ไอคอน',
                desc: 'ฟิลด์ frontmatter สำหรับไอคอนไฟล์ เว้นว่างเพื่อใช้ไอคอนที่เก็บในการตั้งค่า',
                placeholder: 'icon'
            },
            frontmatterColorField: {
                name: 'ฟิลด์สี',
                desc: 'ฟิลด์ frontmatter สำหรับสีไฟล์ เว้นว่างเพื่อใช้สีที่เก็บในการตั้งค่า',
                placeholder: 'color'
            },
            frontmatterBackgroundField: {
                name: 'ฟิลด์พื้นหลัง',
                desc: 'ฟิลด์ frontmatter สำหรับสีพื้นหลัง เว้นว่างเพื่อใช้สีพื้นหลังที่เก็บในการตั้งค่า',
                placeholder: 'background'
            },
            frontmatterMigration: {
                name: 'ย้ายไอคอนและสีจากการตั้งค่า',
                desc: 'เก็บในการตั้งค่า: {icons} ไอคอน, {colors} สี',
                button: 'ย้าย',
                buttonWorking: 'กำลังย้าย...',
                noticeNone: 'ไม่มีไอคอนหรือสีไฟล์เก็บในการตั้งค่า',
                noticeDone: 'ย้าย {migratedIcons}/{icons} ไอคอน, {migratedColors}/{colors} สี',
                noticeFailures: 'รายการล้มเหลว: {failures}',
                noticeError: 'ย้ายล้มเหลว ตรวจสอบคอนโซลสำหรับรายละเอียด'
            },
            frontmatterNameField: {
                name: 'ฟิลด์ชื่อ (หลายรายการ)',
                desc: 'รายการฟิลด์ frontmatter คั่นด้วยเครื่องหมายจุลภาค ใช้ค่าแรกที่ไม่ว่าง กลับไปใช้ชื่อไฟล์',
                placeholder: 'title, name'
            },
            frontmatterCreatedField: {
                name: 'ฟิลด์ timestamp สร้าง',
                desc: 'ชื่อฟิลด์ frontmatter สำหรับ timestamp สร้าง เว้นว่างเพื่อใช้เฉพาะวันที่ระบบไฟล์',
                placeholder: 'created'
            },
            frontmatterModifiedField: {
                name: 'ฟิลด์ timestamp แก้ไข',
                desc: 'ชื่อฟิลด์ frontmatter สำหรับ timestamp แก้ไข เว้นว่างเพื่อใช้เฉพาะวันที่ระบบไฟล์',
                placeholder: 'modified'
            },
            frontmatterDateFormat: {
                name: 'รูปแบบ timestamp',
                desc: 'รูปแบบที่ใช้แยกวิเคราะห์ timestamp ใน frontmatter เว้นว่างเพื่อใช้รูปแบบ ISO 8601',
                helpTooltip: 'รูปแบบโดยใช้ Moment',
                momentLinkText: 'รูปแบบ Moment',
                help: 'รูปแบบทั่วไป:\nYYYY-MM-DD[T]HH:mm:ss → 2025-01-04T14:30:45\nYYYY-MM-DD[T]HH:mm:ssZ → 2025-08-07T16:53:39+02:00\nDD/MM/YYYY HH:mm:ss → 04/01/2025 14:30:45\nMM/DD/YYYY h:mm:ss a → 01/04/2025 2:30:45 PM'
            },
            supportDevelopment: {
                name: 'สนับสนุนการพัฒนา',
                desc: 'หากคุณชอบใช้ Notebook Navigator โปรดพิจารณาสนับสนุนการพัฒนาอย่างต่อเนื่อง',
                buttonText: '❤️ สปอนเซอร์',
                coffeeButton: '☕️ เลี้ยงกาแฟ'
            },
            updateCheckOnStart: {
                name: 'ตรวจสอบเวอร์ชันใหม่เมื่อเริ่ม',
                desc: 'ตรวจสอบรุ่นปลั๊กอินใหม่เมื่อเริ่มงานและแสดงการแจ้งเตือนเมื่อมีการอัปเดต การตรวจสอบจะเกิดขึ้นอย่างมากวันละครั้ง',
                status: 'มีเวอร์ชันใหม่: {version}'
            },
            debugLogging: {
                name: 'บันทึกดีบักตอนเริ่มต้น',
                desc: 'เขียนข้อมูลวินิจฉัยการเริ่มต้นลงในไฟล์ Markdown ที่มีเวลาประทับในรากของคลัง แล้วหยุดหลังจากการเริ่มต้นคงที่ ไฟล์อาจถูกซิงก์และอาจมีเส้นทางไฟล์'
            },
            whatsNew: {
                name: 'มีอะไรใหม่ใน Notebook Navigator {version}',
                desc: 'ดูการอัปเดตและการปรับปรุงล่าสุด',
                buttonText: 'ดูการอัปเดตล่าสุด'
            },
            masteringVideo: {
                name: 'เชี่ยวชาญ Notebook Navigator (วิดีโอ)',
                desc: 'วิดีโอนี้ครอบคลุมทุกสิ่งที่คุณต้องการเพื่อใช้งาน Notebook Navigator อย่างมีประสิทธิภาพ รวมถึงปุ่มลัด การค้นหา แท็ก และการปรับแต่งขั้นสูง'
            },
            cacheStatistics: {
                localCache: 'แคชท้องถิ่น',
                items: 'รายการ',
                withTags: 'มีแท็ก',
                withPreviewText: 'มีข้อความตัวอย่าง',
                withFeatureImage: 'มีรูปภาพประกอบ',
                withMetadata: 'มีเมตาดาต้า'
            },
            metadataInfo: {
                successfullyParsed: 'แยกวิเคราะห์สำเร็จ',
                itemsWithName: 'รายการมีชื่อ',
                withCreatedDate: 'มีวันที่สร้าง',
                withModifiedDate: 'มีวันที่แก้ไข',
                withIcon: 'มีไอคอน',
                withColor: 'มีสี',
                failedToParse: 'แยกวิเคราะห์ล้มเหลว',
                createdDates: 'วันที่สร้าง',
                modifiedDates: 'วันที่แก้ไข',
                checkTimestampFormat: 'ตรวจสอบรูปแบบ timestamp ของคุณ',
                exportFailed: 'ส่งออกข้อผิดพลาด'
            }
        }
    },
    whatsNew: {
        title: 'มีอะไรใหม่ใน Notebook Navigator',
        openBannerImage: 'เปิดภาพแบนเนอร์รุ่นเผยแพร่',
        supportMessage: 'หากคุณพบว่า Notebook Navigator มีประโยชน์ โปรดพิจารณาสนับสนุนการพัฒนา',
        supportButton: 'เลี้ยงกาแฟ',
        thanksButton: 'ขอบคุณ!'
    }
};
