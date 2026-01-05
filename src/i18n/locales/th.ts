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
        submit: 'ส่ง',
        noSelection: 'ไม่มีการเลือก',
        untagged: 'ไม่มีแท็ก',
        untitled: 'ไม่มีชื่อ',
        featureImageAlt: 'รูปภาพประกอบ',
        unknownError: 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        updateBannerTitle: 'มีการอัปเดต Notebook Navigator',
        updateBannerInstruction: 'อัปเดตใน การตั้งค่า -> ปลั๊กอินชุมชน',
        updateIndicatorLabel: 'มีเวอร์ชันใหม่'
    },

    // List pane
    listPane: {
        emptyStateNoSelection: 'เลือกโฟลเดอร์หรือแท็กเพื่อดูโน้ต',
        emptyStateNoNotes: 'ไม่มีโน้ต',
        pinnedSection: 'ปักหมุด',
        notesSection: 'โน้ต',
        filesSection: 'ไฟล์',
        hiddenItemAriaLabel: '{name} (ซ่อนอยู่)'
    },

    // Tag list
    tagList: {
        untaggedLabel: 'ไม่มีแท็ก',
        hiddenTags: 'แท็กที่ซ่อน',
        tags: 'แท็ก'
    },

    // Navigation pane
    navigationPane: {
        shortcutsHeader: 'ทางลัด',
        recentNotesHeader: 'โน้ตล่าสุด',
        recentFilesHeader: 'ไฟล์ล่าสุด',
        reorderRootFoldersTitle: 'จัดเรียงการนำทางใหม่',
        reorderRootFoldersHint: 'ใช้ลูกศรหรือลากเพื่อจัดเรียงใหม่',
        vaultRootLabel: 'ห้องนิรภัย',
        resetRootToAlpha: 'รีเซ็ตเป็นลำดับตัวอักษร',
        resetRootToFrequency: 'รีเซ็ตเป็นลำดับความถี่',
        pinShortcuts: 'ปักหมุดทางลัด',
        pinShortcutsAndRecentNotes: 'ปักหมุดทางลัดและโน้ตล่าสุด',
        pinShortcutsAndRecentFiles: 'ปักหมุดทางลัดและไฟล์ล่าสุด',
        unpinShortcuts: 'เลิกปักหมุดทางลัด',
        unpinShortcutsAndRecentNotes: 'เลิกปักหมุดทางลัดและโน้ตล่าสุด',
        unpinShortcutsAndRecentFiles: 'เลิกปักหมุดทางลัดและไฟล์ล่าสุด',
        profileMenuLabel: 'โปรไฟล์',
        profileMenuAria: 'เปลี่ยนโปรไฟล์ห้องนิรภัย'
    },

    shortcuts: {
        folderExists: 'โฟลเดอร์อยู่ในทางลัดแล้ว',
        noteExists: 'โน้ตอยู่ในทางลัดแล้ว',
        tagExists: 'แท็กอยู่ในทางลัดแล้ว',
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
        scrollToTop: 'เลื่อนขึ้นบนสุด',
        newFolder: 'โฟลเดอร์ใหม่',
        newNote: 'โน้ตใหม่',
        mobileBackToNavigation: 'กลับไปการนำทาง',
        changeSortOrder: 'เปลี่ยนลำดับการเรียง',
        defaultSort: 'ค่าเริ่มต้น',
        customSort: 'กำหนดเอง',
        showFolders: 'แสดงการนำทาง',
        hideFolders: 'ซ่อนการนำทาง',
        reorderRootFolders: 'จัดเรียงการนำทางใหม่',
        finishRootFolderReorder: 'เสร็จสิ้น',
        toggleDescendantNotes: 'แสดงโน้ตจากโฟลเดอร์ย่อย / ลูกหลาน',
        autoExpandFoldersTags: 'ขยายเมื่อเลือก',
        showExcludedItems: 'แสดงโฟลเดอร์ แท็ก และโน้ตที่ซ่อน',
        hideExcludedItems: 'ซ่อนโฟลเดอร์ แท็ก และโน้ตที่ซ่อน',
        showDualPane: 'แสดงแผงคู่',
        showSinglePane: 'แสดงแผงเดียว',
        changeAppearance: 'เปลี่ยนลักษณะ',
        search: 'ค้นหา'
    },
    // Search input
    searchInput: {
        placeholder: 'ค้นหา...',
        placeholderOmnisearch: 'Omnisearch...',
        clearSearch: 'ล้างการค้นหา',
        saveSearchShortcut: 'บันทึกทางลัดการค้นหา',
        removeSearchShortcut: 'นำทางลัดการค้นหาออก',
        shortcutModalTitle: 'บันทึกทางลัดการค้นหา',
        shortcutNamePlaceholder: 'กรอกชื่อทางลัด'
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
            copyDeepLink: 'คัดลอก URL Obsidian',
            copyPath: 'คัดลอกเส้นทางระบบไฟล์',
            copyRelativePath: 'คัดลอกเส้นทางห้องนิรภัย',
            renameNote: 'เปลี่ยนชื่อโน้ต',
            renameFile: 'เปลี่ยนชื่อไฟล์',
            deleteNote: 'ลบโน้ต',
            deleteFile: 'ลบไฟล์',
            deleteMultipleNotes: 'ลบ {count} โน้ต',
            deleteMultipleFiles: 'ลบ {count} ไฟล์',
            moveNoteToFolder: 'ย้ายโน้ตไปยัง...',
            moveFileToFolder: 'ย้ายไฟล์ไปยัง...',
            moveMultipleNotesToFolder: 'ย้าย {count} โน้ตไปยัง...',
            moveMultipleFilesToFolder: 'ย้าย {count} ไฟล์ไปยัง...',
            addTag: 'เพิ่มแท็ก',
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
            copyPath: 'คัดลอกเส้นทางระบบไฟล์',
            copyRelativePath: 'คัดลอกเส้นทางห้องนิรภัย',
            createFolderNote: 'สร้างโน้ตโฟลเดอร์',
            detachFolderNote: 'แยกโน้ตโฟลเดอร์',
            deleteFolderNote: 'ลบโน้ตโฟลเดอร์',
            changeIcon: 'เปลี่ยนไอคอน',
            changeColor: 'เปลี่ยนสี',
            changeBackground: 'เปลี่ยนพื้นหลัง',
            excludeFolder: 'ซ่อนโฟลเดอร์',
            unhideFolder: 'เลิกซ่อนโฟลเดอร์',
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
        navigation: {
            addSeparator: 'เพิ่มตัวคั่น',
            removeSeparator: 'นำตัวคั่นออก'
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
        standardPreset: 'มาตรฐาน',
        compactPreset: 'กะทัดรัด',
        defaultSuffix: '(ค่าเริ่มต้น)',
        titleRows: 'แถวชื่อเรื่อง',
        previewRows: 'แถวตัวอย่าง',
        groupBy: 'จัดกลุ่มตาม',
        defaultOption: (rows: number) => `ค่าเริ่มต้น (${rows})`,
        defaultTitleOption: (rows: number) => `แถวชื่อเรื่องเริ่มต้น (${rows})`,
        defaultPreviewOption: (rows: number) => `แถวตัวอย่างเริ่มต้น (${rows})`,
        defaultGroupOption: (groupLabel: string) => `การจัดกลุ่มเริ่มต้น (${groupLabel})`,
        titleRowOption: (rows: number) => `${rows} แถวชื่อเรื่อง`,
        previewRowOption: (rows: number) => `${rows} แถวตัวอย่าง`
    },

    // Modal dialogs
    modals: {
        iconPicker: {
            searchPlaceholder: 'ค้นหาไอคอน...',
            recentlyUsedHeader: 'ใช้ล่าสุด',
            emptyStateSearch: 'เริ่มพิมพ์เพื่อค้นหาไอคอน',
            emptyStateNoResults: 'ไม่พบไอคอน',
            showingResultsInfo: 'แสดง 50 จาก {count} ผลลัพธ์ พิมพ์เพิ่มเพื่อจำกัด',
            emojiInstructions: 'พิมพ์หรือวางอีโมจิเพื่อใช้เป็นไอคอน',
            removeIcon: 'นำไอคอนออก',
            allTabLabel: 'ทั้งหมด'
        },
        fileIconRuleEditor: {
            addRuleAria: 'เพิ่มกฎ'
        },
        interfaceIcons: {
            title: 'ไอคอนอินเทอร์เฟซ',
            items: {
                'nav-shortcuts': 'ทางลัด',
                'nav-recent-files': 'ไฟล์ล่าสุด',
                'nav-expand-all': 'ขยายทั้งหมด',
                'nav-collapse-all': 'ยุบทั้งหมด',
                'nav-tree-expand': 'ลูกศรต้นไม้: ขยาย',
                'nav-tree-collapse': 'ลูกศรต้นไม้: ยุบ',
                'nav-hidden-items': 'รายการที่ซ่อน',
                'nav-root-reorder': 'จัดเรียงโฟลเดอร์รากใหม่',
                'nav-new-folder': 'โฟลเดอร์ใหม่',
                'nav-show-single-pane': 'แสดงแผงเดียว',
                'nav-show-dual-pane': 'แสดงแผงคู่',
                'nav-profile-chevron': 'ลูกศรเมนูโปรไฟล์',
                'list-search': 'ค้นหา',
                'list-descendants': 'โน้ตจากโฟลเดอร์ย่อย',
                'list-sort-ascending': 'ลำดับ: น้อยไปมาก',
                'list-sort-descending': 'ลำดับ: มากไปน้อย',
                'list-appearance': 'เปลี่ยนรูปลักษณ์',
                'list-new-note': 'โน้ตใหม่',
                'nav-folder-open': 'โฟลเดอร์เปิด',
                'nav-folder-closed': 'โฟลเดอร์ปิด',
                'nav-tag': 'แท็ก',
                'list-pinned': 'รายการที่ปักหมุด'
            }
        },
        colorPicker: {
            currentColor: 'ปัจจุบัน',
            newColor: 'ใหม่',
            presetColors: 'สีที่ตั้งไว้',
            userColors: 'สีผู้ใช้',
            paletteDefault: 'ค่าเริ่มต้น',
            paletteCustom: 'กำหนดเอง',
            copyColors: 'คัดลอกสี',
            colorsCopied: 'คัดลอกสีไปคลิปบอร์ดแล้ว',
            copyClipboardError: 'ไม่สามารถเขียนลงคลิปบอร์ด',
            pasteColors: 'วางสี',
            pasteClipboardError: 'ไม่สามารถอ่านคลิปบอร์ด',
            pasteInvalidJson: 'คลิปบอร์ดไม่มีข้อความที่ถูกต้อง',
            pasteInvalidFormat: 'ต้องการค่าสี hex',
            colorsPasted: 'วางสีสำเร็จ',
            resetUserColors: 'ล้างสีที่กำหนดเอง',
            clearCustomColorsConfirm: 'ลบสีที่กำหนดเองทั้งหมด?',
            userColorSlot: 'สี {slot}',
            recentColors: 'สีล่าสุด',
            clearRecentColors: 'ล้างสีล่าสุด',
            removeRecentColor: 'นำสีออก',
            removeColor: 'นำสีออก',
            apply: 'นำไปใช้',
            hexLabel: 'HEX',
            rgbLabel: 'RGBA',
            colors: {
                red: 'แดง',
                orange: 'ส้ม',
                amber: 'อำพัน',
                yellow: 'เหลือง',
                lime: 'มะนาว',
                green: 'เขียว',
                emerald: 'มรกต',
                teal: 'น้ำเงินเขียว',
                cyan: 'ฟ้า',
                sky: 'ท้องฟ้า',
                blue: 'น้ำเงิน',
                indigo: 'คราม',
                violet: 'ม่วง',
                purple: 'ม่วงเข้ม',
                fuchsia: 'ฟิวเชีย',
                pink: 'ชมพู',
                rose: 'กุหลาบ',
                gray: 'เทา',
                slate: 'หินชนวน',
                stone: 'หิน'
            }
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
            invalidTagName: 'กรอกชื่อแท็กที่ถูกต้อง',
            descendantRenameError: 'ไม่สามารถย้ายแท็กไปยังตัวเองหรือลูกหลาน',
            confirmDelete: 'ลบแท็ก',
            file: 'ไฟล์',
            files: 'ไฟล์'
        },
        fileSystem: {
            newFolderTitle: 'โฟลเดอร์ใหม่',
            renameFolderTitle: 'เปลี่ยนชื่อโฟลเดอร์',
            renameFileTitle: 'เปลี่ยนชื่อไฟล์',
            deleteFolderTitle: "ลบ '{name}'?",
            deleteFileTitle: "ลบ '{name}'?",
            folderNamePrompt: 'กรอกชื่อโฟลเดอร์:',
            hideInOtherVaultProfiles: 'ซ่อนในโปรไฟล์ห้องนิรภัยอื่น',
            renamePrompt: 'กรอกชื่อใหม่:',
            renameVaultTitle: 'เปลี่ยนชื่อแสดงห้องนิรภัย',
            renameVaultPrompt: 'กรอกชื่อแสดงที่กำหนดเอง (เว้นว่างเพื่อใช้ค่าเริ่มต้น):',
            deleteFolderConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบโฟลเดอร์นี้และเนื้อหาทั้งหมด?',
            deleteFileConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์นี้?',
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
        navigationBanner: {
            placeholder: 'ค้นหารูปภาพ...',
            instructions: {
                navigate: 'เพื่อนำทาง',
                select: 'เพื่อตั้งแบนเนอร์',
                dismiss: 'เพื่อปิด'
            }
        },
        tagSuggest: {
            placeholder: 'ค้นหาแท็ก...',
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
        welcome: {
            title: 'ยินดีต้อนรับสู่ {pluginName}',
            introText:
                'สวัสดี! ก่อนเริ่มต้น ขอแนะนำอย่างยิ่งให้ดูวิดีโอด้านล่างห้านาทีแรกเพื่อทำความเข้าใจว่าแผงควบคุมและปุ่มสลับ "แสดงโน้ตจากโฟลเดอร์ย่อย" ทำงานอย่างไร',
            continueText:
                'หากคุณมีเวลาอีกห้านาที ให้ดูวิดีโอต่อเพื่อทำความเข้าใจโหมดแสดงผลแบบกะทัดรัดและวิธีตั้งค่าทางลัดและปุ่มลัดที่สำคัญอย่างถูกต้อง',
            thanksText: 'ขอบคุณมากที่ดาวน์โหลด สนุกกับการใช้งาน!',
            videoAlt: 'การติดตั้งและเชี่ยวชาญ Notebook Navigator',
            openVideoButton: 'เล่นวิดีโอ',
            closeButton: 'ไว้ดูทีหลัง'
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
            duplicateNote: 'ทำซ้ำโน้ตล้มเหลว: {error}',
            createCanvas: 'สร้าง canvas ล้มเหลว: {error}',
            createDatabase: 'สร้างฐานข้อมูลล้มเหลว: {error}',
            duplicateFolder: 'ทำซ้ำโฟลเดอร์ล้มเหลว: {error}',
            openVersionHistory: 'เปิดประวัติเวอร์ชันล้มเหลว: {error}',
            versionHistoryNotFound: 'ไม่พบคำสั่งประวัติเวอร์ชัน ตรวจสอบว่า Obsidian Sync เปิดใช้งานอยู่',
            revealInExplorer: 'แสดงไฟล์ใน explorer ระบบล้มเหลว: {error}',
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
            showFolder: 'แสดงโฟลเดอร์แล้ว: {name}'
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
            tagOperationsNotAvailable: 'การดำเนินการแท็กไม่พร้อมใช้งาน',
            tagsRequireMarkdown: 'แท็กรองรับเฉพาะโน้ต Markdown',
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
            untitled: 'ไม่มีชื่อ',
            untitledNumber: 'ไม่มีชื่อ {number}'
        }
    },

    // Drag and drop operations
    dragDrop: {
        errors: {
            cannotMoveIntoSelf: 'ไม่สามารถย้ายโฟลเดอร์ไปยังตัวเองหรือโฟลเดอร์ย่อย',
            itemAlreadyExists: 'รายการชื่อ "{name}" มีอยู่ในตำแหน่งนี้แล้ว',
            failedToMove: 'ย้ายล้มเหลว: {error}',
            failedToAddTag: 'เพิ่มแท็ก "{tag}" ล้มเหลว',
            failedToClearTags: 'ล้างแท็กล้มเหลว',
            failedToMoveFolder: 'ย้ายโฟลเดอร์ "{name}" ล้มเหลว',
            failedToImportFiles: 'นำเข้าล้มเหลว: {names}'
        },
        notifications: {
            filesAlreadyExist: '{count} ไฟล์มีอยู่ในปลายทางแล้ว',
            addedTag: 'เพิ่มแท็ก "{tag}" ใน {count} ไฟล์แล้ว',
            filesAlreadyHaveTag: '{count} ไฟล์มีแท็กนี้หรือแท็กที่เฉพาะเจาะจงกว่าอยู่แล้ว',
            clearedTags: 'ล้างแท็กทั้งหมดจาก {count} ไฟล์แล้ว',
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

    // Weekdays
    weekdays: {
        sunday: 'วันอาทิตย์',
        monday: 'วันจันทร์',
        tuesday: 'วันอังคาร',
        wednesday: 'วันพุธ',
        thursday: 'วันพฤหัสบดี',
        friday: 'วันศุกร์',
        saturday: 'วันเสาร์'
    },

    // Plugin commands
    commands: {
        open: 'เปิด',
        openHomepage: 'เปิดหน้าแรก',
        revealFile: 'แสดงไฟล์',
        search: 'ค้นหา',
        toggleDualPane: 'สลับรูปแบบแผงคู่',
        selectVaultProfile: 'เลือกโปรไฟล์ห้องนิรภัย',
        selectVaultProfile1: 'เลือกโปรไฟล์ห้องนิรภัย 1',
        selectVaultProfile2: 'เลือกโปรไฟล์ห้องนิรภัย 2',
        selectVaultProfile3: 'เลือกโปรไฟล์ห้องนิรภัย 3',
        deleteFile: 'ลบไฟล์',
        createNewNote: 'สร้างโน้ตใหม่',
        createNewNoteFromTemplate: 'โน้ตใหม่จากเทมเพลต',
        moveFiles: 'ย้ายไฟล์',
        selectNextFile: 'เลือกไฟล์ถัดไป',
        selectPreviousFile: 'เลือกไฟล์ก่อนหน้า',
        convertToFolderNote: 'แปลงเป็นโน้ตโฟลเดอร์',
        setAsFolderNote: 'ตั้งเป็นโน้ตโฟลเดอร์',
        detachFolderNote: 'แยกโน้ตโฟลเดอร์',
        pinAllFolderNotes: 'ปักหมุดโน้ตโฟลเดอร์ทั้งหมด',
        navigateToFolder: 'นำทางไปยังโฟลเดอร์',
        navigateToTag: 'นำทางไปยังแท็ก',
        addShortcut: 'เพิ่มในทางลัด',
        openShortcut: 'เปิดทางลัด {number}',
        toggleDescendants: 'สลับลูกหลาน',
        toggleHidden: 'สลับโฟลเดอร์ แท็ก และโน้ตที่ซ่อน',
        toggleTagSort: 'สลับลำดับการเรียงแท็ก',
        collapseExpand: 'ยุบ / ขยายรายการทั้งหมด',
        addTag: 'เพิ่มแท็กในไฟล์ที่เลือก',
        removeTag: 'นำแท็กออกจากไฟล์ที่เลือก',
        removeAllTags: 'นำแท็กทั้งหมดออกจากไฟล์ที่เลือก',
        rebuildCache: 'สร้างแคชใหม่'
    },

    // Plugin UI
    plugin: {
        viewName: 'Notebook Navigator',
        ribbonTooltip: 'Notebook Navigator',
        revealInNavigator: 'แสดงใน Notebook Navigator'
    },

    // Tooltips
    tooltips: {
        lastModifiedAt: 'แก้ไขล่าสุดเมื่อ',
        createdAt: 'สร้างเมื่อ',
        file: 'ไฟล์',
        files: 'ไฟล์',
        folder: 'โฟลเดอร์',
        folders: 'โฟลเดอร์'
    },

    // Settings
    settings: {
        metadataReport: {
            exportSuccess: 'ส่งออกรายงานเมตาดาต้าที่ล้มเหลวไปยัง: {filename}',
            exportFailed: 'ส่งออกรายงานเมตาดาต้าล้มเหลว'
        },
        sections: {
            general: 'ทั่วไป',
            navigationPane: 'แผงนำทาง',
            icons: 'ชุดไอคอน',
            folders: 'โฟลเดอร์',
            foldersAndTags: 'โฟลเดอร์ & แท็ก',
            tags: 'แท็ก',
            search: 'ค้นหา',
            searchAndHotkeys: 'ค้นหา & ปุ่มลัด',
            listPane: 'แผงรายการ',
            notes: 'โน้ต',
            hotkeys: 'ปุ่มลัด',
            advanced: 'ขั้นสูง'
        },
        groups: {
            general: {
                filtering: 'การกรอง',
                behavior: 'พฤติกรรม',
                view: 'ลักษณะ',
                icons: 'ไอคอน',
                desktopAppearance: 'ลักษณะเดสก์ท็อป',
                formatting: 'การจัดรูปแบบ'
            },
            navigation: {
                appearance: 'ลักษณะ',
                shortcutsAndRecent: 'ทางลัดและรายการล่าสุด'
            },
            list: {
                display: 'ลักษณะ',
                pinnedNotes: 'โน้ตที่ปักหมุด',
                quickActions: 'การกระทำด่วน'
            },
            notes: {
                frontmatter: 'Frontmatter',
                icon: 'ไอคอน',
                title: 'ชื่อเรื่อง',
                previewText: 'ข้อความตัวอย่าง',
                featureImage: 'รูปภาพเด่น',
                tags: 'แท็ก',
                date: 'วันที่',
                parentFolder: 'โฟลเดอร์หลัก'
            }
        },
        items: {
            searchProvider: {
                name: 'ผู้ให้บริการค้นหา',
                desc: 'เลือกระหว่างการค้นหาชื่อไฟล์อย่างรวดเร็วหรือการค้นหาข้อความเต็มด้วยปลั๊กอิน Omnisearch (ไม่ซิงค์)',
                options: {
                    internal: 'การค้นหาตัวกรอง',
                    omnisearch: 'Omnisearch (ข้อความเต็ม)'
                },
                info: {
                    filterSearch: {
                        title: 'การค้นหาตัวกรอง (ค่าเริ่มต้น):',
                        description:
                            'กรองไฟล์ตามชื่อและแท็กภายในโฟลเดอร์และโฟลเดอร์ย่อยปัจจุบัน โหมดตัวกรอง: ข้อความและแท็กผสมจะจับคู่ทุกเงื่อนไข (เช่น "โปรเจค #งาน") โหมดแท็ก: การค้นหาด้วยแท็กเท่านั้นรองรับตัวดำเนินการ AND/OR (เช่น "#งาน AND #ด่วน", "#โปรเจค OR #ส่วนตัว") Cmd/Ctrl+คลิกที่แท็กเพื่อเพิ่มด้วย AND, Cmd/Ctrl+Shift+คลิกเพื่อเพิ่มด้วย OR รองรับการยกเว้นด้วยคำนำหน้า ! (เช่น !ฉบับร่าง, !#เก็บถาวร) และค้นหาโน้ตที่ไม่มีแท็กด้วย !#'
                    },
                    omnisearch: {
                        title: 'Omnisearch:',
                        description:
                            'การค้นหาข้อความเต็มที่ค้นหาทั้งห้องนิรภัย จากนั้นกรองผลลัพธ์เพื่อแสดงเฉพาะไฟล์จากโฟลเดอร์ โฟลเดอร์ย่อย หรือแท็กที่เลือก ต้องติดตั้งปลั๊กอิน Omnisearch - หากไม่พร้อมใช้งาน การค้นหาจะย้อนกลับไปใช้การค้นหาตัวกรองโดยอัตโนมัติ',
                        warningNotInstalled: 'ไม่ได้ติดตั้งปลั๊กอิน Omnisearch ใช้การค้นหาตัวกรอง',
                        limitations: {
                            title: 'ข้อจำกัดที่ทราบ:',
                            performance: 'ประสิทธิภาพ: อาจช้า โดยเฉพาะเมื่อค้นหาน้อยกว่า 3 ตัวอักษรในห้องนิรภัยขนาดใหญ่',
                            pathBug:
                                'ข้อบกพร่องเส้นทาง: ไม่สามารถค้นหาในเส้นทางที่มีอักขระ non-ASCII และไม่ค้นหาเส้นทางย่อยอย่างถูกต้อง ส่งผลต่อไฟล์ที่ปรากฏในผลการค้นหา',
                            limitedResults:
                                'ผลลัพธ์จำกัด: เนื่องจาก Omnisearch ค้นหาทั้งห้องนิรภัยและส่งคืนจำนวนผลลัพธ์ที่จำกัดก่อนการกรอง ไฟล์ที่เกี่ยวข้องจากโฟลเดอร์ปัจจุบันอาจไม่ปรากฏหากมีผลลัพธ์มากเกินไปในที่อื่นในห้องนิรภัย',
                            previewText:
                                'ข้อความตัวอย่าง: ตัวอย่างโน้ตถูกแทนที่ด้วยข้อความผลลัพธ์ Omnisearch ซึ่งอาจไม่แสดงการเน้นผลการค้นหาจริงหากปรากฏในที่อื่นในไฟล์'
                        }
                    }
                }
            },
            listPaneTitle: {
                name: 'ชื่อแผงรายการ (เดสก์ท็อปเท่านั้น)',
                desc: 'เลือกตำแหน่งที่จะแสดงชื่อแผงรายการ',
                options: {
                    header: 'แสดงในส่วนหัว',
                    list: 'แสดงในแผงรายการ',
                    hidden: 'ไม่แสดง'
                }
            },
            sortNotesBy: {
                name: 'เรียงโน้ตตาม',
                desc: 'เลือกวิธีเรียงโน้ตในรายการโน้ต',
                options: {
                    'modified-desc': 'วันที่แก้ไข (ใหม่สุดบน)',
                    'modified-asc': 'วันที่แก้ไข (เก่าสุดบน)',
                    'created-desc': 'วันที่สร้าง (ใหม่สุดบน)',
                    'created-asc': 'วันที่สร้าง (เก่าสุดบน)',
                    'title-asc': 'ชื่อเรื่อง (A บน)',
                    'title-desc': 'ชื่อเรื่อง (Z บน)'
                }
            },
            revealFileOnListChanges: {
                name: 'เลื่อนไปยังไฟล์ที่เลือกเมื่อรายการเปลี่ยนแปลง',
                desc: 'เลื่อนไปยังไฟล์ที่เลือกเมื่อปักหมุดโน้ต แสดงโน้ตลูกหลาน เปลี่ยนลักษณะโฟลเดอร์ หรือเรียกใช้การดำเนินการไฟล์'
            },
            includeDescendantNotes: {
                name: 'แสดงโน้ตจากโฟลเดอร์ย่อย / ลูกหลาน (ไม่ซิงค์)',
                desc: 'รวมโน้ตจากโฟลเดอร์ย่อยที่ซ้อนกันและลูกหลานแท็กเมื่อดูโฟลเดอร์หรือแท็ก'
            },
            limitPinnedToCurrentFolder: {
                name: 'จำกัดโน้ตที่ปักหมุดไว้ในโฟลเดอร์',
                desc: 'โน้ตที่ปักหมุดจะปรากฏเฉพาะเมื่อดูโฟลเดอร์หรือแท็กที่ปักหมุดไว้เท่านั้น'
            },
            separateNoteCounts: {
                name: 'แสดงจำนวนปัจจุบันและลูกหลานแยกกัน',
                desc: 'แสดงจำนวนโน้ตเป็นรูปแบบ "ปัจจุบัน ▾ ลูกหลาน" ในโฟลเดอร์และแท็ก'
            },
            groupNotes: {
                name: 'จัดกลุ่มโน้ต',
                desc: 'แสดงส่วนหัวระหว่างโน้ตที่จัดกลุ่มตามวันที่หรือโฟลเดอร์ มุมมองแท็กใช้กลุ่มวันที่เมื่อเปิดใช้งานการจัดกลุ่มโฟลเดอร์',
                options: {
                    none: 'ไม่จัดกลุ่ม',
                    date: 'จัดกลุ่มตามวันที่',
                    folder: 'จัดกลุ่มตามโฟลเดอร์'
                }
            },
            showPinnedGroupHeader: {
                name: 'แสดงส่วนหัวกลุ่มที่ปักหมุด',
                desc: 'แสดงส่วนหัวส่วนที่ปักหมุดเหนือโน้ตที่ปักหมุด'
            },
            showPinnedIcon: {
                name: 'แสดงไอคอนที่ปักหมุด',
                desc: 'แสดงไอคอนข้างส่วนหัวส่วนที่ปักหมุด'
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
                desc: 'แสดงไอคอนไฟล์พร้อมระยะห่างชิดซ้าย การปิดใช้งานจะนำไอคอนและการเยื้องออก ลำดับความสำคัญ: กำหนดเอง > ชื่อไฟล์ > ประเภทไฟล์ > ค่าเริ่มต้น'
            },
            showFilenameMatchIcons: {
                name: 'ไอคอนตามชื่อไฟล์',
                desc: 'กำหนดไอคอนให้ไฟล์ตามข้อความในชื่อ'
            },
            fileNameIconMap: {
                name: 'แผนที่ไอคอนชื่อไฟล์',
                desc: 'ไฟล์ที่มีข้อความจะได้รับไอคอนที่กำหนด หนึ่งการแมปต่อบรรทัด: ข้อความ=ไอคอน',
                placeholder: '# ข้อความ=ไอคอน\nประชุม=LiCalendar\nใบแจ้งหนี้=PhReceipt',
                editTooltip: 'แก้ไขการแมป'
            },
            showCategoryIcons: {
                name: 'ไอคอนตามประเภทไฟล์',
                desc: 'กำหนดไอคอนให้ไฟล์ตามนามสกุล'
            },
            fileTypeIconMap: {
                name: 'แผนที่ไอคอนประเภทไฟล์',
                desc: 'ไฟล์ที่มีนามสกุลจะได้รับไอคอนที่กำหนด หนึ่งการแมปต่อบรรทัด: นามสกุล=ไอคอน',
                placeholder: '# Extension=icon\ncpp=LiFileCode\npdf=RaBook',
                editTooltip: 'แก้ไขการแมป'
            },
            optimizeNoteHeight: {
                name: 'ความสูงโน้ตแบบปรับได้',
                desc: 'ใช้ความสูงแบบกะทัดรัดสำหรับโน้ตที่ปักหมุดและโน้ตที่ไม่มีข้อความตัวอย่าง'
            },
            compactItemHeight: {
                name: 'ความสูงรายการกะทัดรัด',
                desc: 'กำหนดความสูงของรายการกะทัดรัดบนเดสก์ท็อปและมือถือ',
                resetTooltip: 'รีเซ็ตเป็นค่าเริ่มต้น (28px)'
            },
            compactItemHeightScaleText: {
                name: 'ปรับขนาดข้อความตามความสูงรายการกะทัดรัด',
                desc: 'ปรับขนาดข้อความรายการกะทัดรัดเมื่อความสูงรายการลดลง'
            },
            showParentFolder: {
                name: 'แสดงโฟลเดอร์หลัก',
                desc: 'แสดงชื่อโฟลเดอร์หลักสำหรับโน้ตในโฟลเดอร์ย่อยหรือแท็ก'
            },
            parentFolderClickRevealsFile: {
                name: 'คลิกโฟลเดอร์หลักเพื่อเปิดโฟลเดอร์',
                desc: 'การคลิกป้ายโฟลเดอร์หลักจะเปิดโฟลเดอร์ในแผงรายการ'
            },
            showParentFolderColor: {
                name: 'แสดงสีโฟลเดอร์หลัก',
                desc: 'ใช้สีโฟลเดอร์บนป้ายโฟลเดอร์หลัก'
            },
            showQuickActions: {
                name: 'แสดงการกระทำด่วน (เดสก์ท็อปเท่านั้น)',
                desc: 'แสดงปุ่มการกระทำเมื่อวางเมาส์บนไฟล์ ตัวควบคุมปุ่มเลือกการกระทำที่จะปรากฏ'
            },
            dualPane: {
                name: 'รูปแบบแผงคู่ (ไม่ซิงค์)',
                desc: 'แสดงแผงนำทางและแผงรายการเคียงข้างกันบนเดสก์ท็อป'
            },
            dualPaneOrientation: {
                name: 'ทิศทางแผงคู่ (ไม่ซิงค์)',
                desc: 'เลือกรูปแบบแนวนอนหรือแนวตั้งเมื่อใช้งานแผงคู่',
                options: {
                    horizontal: 'แบ่งแนวนอน',
                    vertical: 'แบ่งแนวตั้ง'
                }
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
                name: 'ระดับการซูม (ไม่ซิงค์)',
                desc: 'ควบคุมระดับการซูมโดยรวมของ Notebook Navigator'
            },
            startView: {
                name: 'มุมมองเริ่มต้นเมื่อเริ่มงาน',
                desc: 'เลือกแผงที่จะแสดงเมื่อเปิด Notebook Navigator แผงนำทางแสดงทางลัด โน้ตล่าสุด และต้นไม้โฟลเดอร์ แผงรายการแสดงรายการโน้ตทันที',
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
            autoRevealActiveNote: {
                name: 'แสดงโน้ตที่ใช้งานอัตโนมัติ',
                desc: 'แสดงโน้ตอัตโนมัติเมื่อเปิดจาก Quick Switcher, ลิงก์, หรือการค้นหา'
            },
            autoRevealIgnoreRightSidebar: {
                name: 'ละเว้นเหตุการณ์จากแถบด้านขวา',
                desc: 'อย่าเปลี่ยนโน้ตที่ใช้งานเมื่อคลิกหรือเปลี่ยนโน้ตในแถบด้านขวา'
            },
            paneTransitionDuration: {
                name: 'แอนิเมชันหน้าต่างเดี่ยว',
                desc: 'ระยะเวลาการเปลี่ยนหน้าต่างในโหมดหน้าต่างเดี่ยว (มิลลิวินาที)',
                resetTooltip: 'รีเซ็ตเป็นค่าเริ่มต้น'
            },
            autoSelectFirstFileOnFocusChange: {
                name: 'เลือกโน้ตแรกอัตโนมัติ (เดสก์ท็อปเท่านั้น)',
                desc: 'เปิดโน้ตแรกอัตโนมัติเมื่อสลับโฟลเดอร์หรือแท็ก'
            },
            skipAutoScroll: {
                name: 'ปิดการเลื่อนอัตโนมัติสำหรับทางลัด',
                desc: 'อย่าเลื่อนแผงนำทางเมื่อคลิกรายการในทางลัด'
            },
            autoExpandFoldersTags: {
                name: 'ขยายเมื่อเลือก',
                desc: 'ขยายโฟลเดอร์และแท็กเมื่อเลือก ในโหมดแผงเดียว การเลือกครั้งแรกจะขยาย การเลือกครั้งที่สองจะแสดงไฟล์'
            },
            springLoadedFolders: {
                name: 'ขยายระหว่างลาก (เดสก์ท็อปเท่านั้น)',
                desc: 'ขยายโฟลเดอร์และแท็กเมื่อวางเมาส์ระหว่างการลาก'
            },
            springLoadedFoldersInitialDelay: {
                name: 'หน่วงเวลาการขยายครั้งแรก',
                desc: 'หน่วงเวลาก่อนขยายโฟลเดอร์หรือแท็กครั้งแรกระหว่างการลาก (วินาที)'
            },
            springLoadedFoldersSubsequentDelay: {
                name: 'หน่วงเวลาการขยายครั้งถัดไป',
                desc: 'หน่วงเวลาก่อนขยายโฟลเดอร์หรือแท็กเพิ่มเติมระหว่างการลากเดียวกัน (วินาที)'
            },
            navigationBanner: {
                name: 'แบนเนอร์นำทาง (โปรไฟล์ห้องนิรภัย)',
                desc: 'แสดงรูปภาพเหนือแผงนำทาง เปลี่ยนตามโปรไฟล์ห้องนิรภัยที่เลือก',
                current: 'แบนเนอร์ปัจจุบัน: {path}',
                chooseButton: 'เลือกรูปภาพ'
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
                name: 'แสดงโน้ตล่าสุด',
                desc: 'แสดงส่วนโน้ตล่าสุดในแผงนำทาง'
            },
            recentNotesCount: {
                name: 'จำนวนโน้ตล่าสุด',
                desc: 'จำนวนโน้ตล่าสุดที่จะแสดง'
            },
            pinRecentNotesWithShortcuts: {
                name: 'ปักหมุดโน้ตล่าสุดพร้อมทางลัด',
                desc: 'รวมโน้ตล่าสุดเมื่อปักหมุดทางลัด'
            },
            showTooltips: {
                name: 'แสดง tooltips',
                desc: 'แสดง tooltips เมื่อวางเมาส์พร้อมข้อมูลเพิ่มเติมสำหรับโน้ตและโฟลเดอร์'
            },
            showTooltipPath: {
                name: 'แสดงเส้นทาง',
                desc: 'แสดงเส้นทางโฟลเดอร์ใต้ชื่อโน้ตใน tooltips'
            },
            resetPaneSeparator: {
                name: 'รีเซ็ตตำแหน่งตัวคั่นแผง',
                desc: 'รีเซ็ตตัวคั่นที่ลากได้ระหว่างแผงนำทางและแผงรายการเป็นตำแหน่งเริ่มต้น',
                buttonText: 'รีเซ็ตตัวคั่น',
                notice: 'รีเซ็ตตำแหน่งตัวคั่นแล้ว รีสตาร์ท Obsidian หรือเปิด Notebook Navigator ใหม่เพื่อใช้งาน'
            },
            multiSelectModifier: {
                name: 'ตัวปรับแต่งเลือกหลายรายการ (เดสก์ท็อปเท่านั้น)',
                desc: 'เลือกปุ่มตัวปรับแต่งที่จะสลับการเลือกหลายรายการ เมื่อเลือก Option/Alt การคลิก Cmd/Ctrl จะเปิดโน้ตในแท็บใหม่',
                options: {
                    cmdCtrl: 'คลิก Cmd/Ctrl',
                    optionAlt: 'คลิก Option/Alt'
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
                desc: 'เลือกไฟล์ที่ Notebook Navigator เปิดอัตโนมัติ เช่น แดชบอร์ด',
                current: 'ปัจจุบัน: {path}',
                currentMobile: 'มือถือ: {path}',
                chooseButton: 'เลือกไฟล์',

                separateMobile: {
                    name: 'หน้าแรกมือถือแยก',
                    desc: 'ใช้หน้าแรกต่างกันสำหรับอุปกรณ์มือถือ'
                }
            },
            excludedNotes: {
                name: 'ซ่อนโน้ต (โปรไฟล์ห้องนิรภัย)',
                desc: 'รายการคุณสมบัติ frontmatter คั่นด้วยเครื่องหมายจุลภาค โน้ตที่มีคุณสมบัติเหล่านี้จะถูกซ่อน (เช่น ฉบับร่าง, ส่วนตัว, เก็บถาวร)',
                placeholder: 'ฉบับร่าง, ส่วนตัว'
            },
            excludedFileNamePatterns: {
                name: 'ซ่อนไฟล์ (โปรไฟล์ห้องนิรภัย)',
                desc: 'รายการรูปแบบชื่อไฟล์คั่นด้วยเครื่องหมายจุลภาคที่จะซ่อน รองรับอักขระไวลด์การ์ด * และเส้นทาง / (เช่น temp-*, *.png, /assets/*)',
                placeholder: 'temp-*, *.png, /assets/*'
            },
            vaultProfiles: {
                name: 'โปรไฟล์ห้องนิรภัย',
                desc: 'โปรไฟล์เก็บการมองเห็นประเภทไฟล์ ไฟล์ที่ซ่อน โฟลเดอร์ที่ซ่อน แท็กที่ซ่อน โน้ตที่ซ่อน ทางลัด และแบนเนอร์นำทาง สลับโปรไฟล์จากส่วนหัวแผงนำทาง',
                defaultName: 'ค่าเริ่มต้น',
                addButton: 'เพิ่มโปรไฟล์',
                editProfilesButton: 'แก้ไขโปรไฟล์',
                addProfileOption: 'เพิ่มโปรไฟล์...',
                applyButton: 'นำไปใช้',
                editButton: 'แก้ไขโปรไฟล์',
                deleteButton: 'ลบโปรไฟล์',
                addModalTitle: 'เพิ่มโปรไฟล์',
                editProfilesModalTitle: 'แก้ไขโปรไฟล์',
                editModalTitle: 'แก้ไขโปรไฟล์',
                addModalPlaceholder: 'ชื่อโปรไฟล์',
                deleteModalTitle: 'ลบ {name}',
                deleteModalMessage: 'ลบ {name}? ตัวกรองไฟล์ โฟลเดอร์ แท็ก และโน้ตที่ซ่อนที่บันทึกในโปรไฟล์นี้จะถูกลบ',
                moveUp: 'ย้ายขึ้น',
                moveDown: 'ย้ายลง',
                errors: {
                    emptyName: 'กรอกชื่อโปรไฟล์',
                    duplicateName: 'ชื่อโปรไฟล์มีอยู่แล้ว'
                }
            },
            vaultTitle: {
                name: 'ตำแหน่งชื่อห้องนิรภัย (เดสก์ท็อปเท่านั้น)',
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
            dateFormat: {
                name: 'รูปแบบวันที่',
                desc: 'รูปแบบสำหรับแสดงวันที่ (ใช้รูปแบบ date-fns)',
                placeholder: 'd MMM yyyy',
                help: 'รูปแบบทั่วไป:\nd MMM yyyy = 25 พ.ค. 2022\ndd/MM/yyyy = 25/05/2022\nyyyy-MM-dd = 2022-05-25\n\nโทเคน:\nyyyy/yy = ปี\nMMMM/MMM/MM = เดือน\ndd/d = วัน\nEEEE/EEE = วันในสัปดาห์',
                helpTooltip: 'คลิกเพื่อดูข้อมูลอ้างอิงรูปแบบ'
            },
            timeFormat: {
                name: 'รูปแบบเวลา',
                desc: 'รูปแบบสำหรับแสดงเวลา (ใช้รูปแบบ date-fns)',
                placeholder: 'HH:mm',
                help: 'รูปแบบทั่วไป:\nHH:mm = 14:30 (24 ชั่วโมง)\nh:mm a = 2:30 PM (12 ชั่วโมง)\nHH:mm:ss = 14:30:45\nh:mm:ss a = 2:30:45 PM\n\nโทเคน:\nHH/H = 24 ชั่วโมง\nhh/h = 12 ชั่วโมง\nmm = นาที\nss = วินาที\na = AM/PM',
                helpTooltip: 'คลิกเพื่อดูข้อมูลอ้างอิงรูปแบบ'
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
            previewProperties: {
                name: 'คุณสมบัติตัวอย่าง',
                desc: 'รายการคุณสมบัติ frontmatter คั่นด้วยเครื่องหมายจุลภาคเพื่อตรวจสอบข้อความตัวอย่าง คุณสมบัติแรกที่มีข้อความจะถูกใช้',
                placeholder: 'summary, description, abstract',
                info: 'หากไม่พบข้อความตัวอย่างในคุณสมบัติที่ระบุ ตัวอย่างจะถูกสร้างจากเนื้อหาโน้ต'
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
                    '2': '2 แถว'
                }
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
                desc: 'รายการคุณสมบัติ frontmatter คั่นด้วยเครื่องหมายจุลภาคเพื่อตรวจสอบภาพย่อ คุณสมบัติแรกที่มีรูปภาพจะถูกใช้ หากว่างและเปิดใช้งานการตั้งค่า fallback รูปภาพฝังตัวแรกจะถูกใช้',
                placeholder: 'thumbnail, featureResized, feature'
            },

            downloadExternalFeatureImages: {
                name: 'ดาวน์โหลดรูปภาพภายนอก',
                desc: 'ดาวน์โหลดรูปภาพระยะไกลและภาพขนาดย่อ YouTube สำหรับรูปภาพเด่น'
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
            showNoteCount: {
                name: 'แสดงจำนวนโน้ต',
                desc: 'แสดงจำนวนโน้ตข้างแต่ละโฟลเดอร์และแท็ก'
            },
            showSectionIcons: {
                name: 'แสดงไอคอนสำหรับทางลัดและรายการล่าสุด',
                desc: 'แสดงไอคอนสำหรับส่วนนำทางเช่น ทางลัดและไฟล์ล่าสุด'
            },
            interfaceIcons: {
                name: 'ไอคอนอินเทอร์เฟซ',
                desc: 'แก้ไขไอคอนแถบเครื่องมือ โฟลเดอร์ แท็ก ปักหมุด ค้นหา และเรียงลำดับ',
                buttonText: 'แก้ไขไอคอน'
            },
            showIconsColorOnly: {
                name: 'ใช้สีกับไอคอนเท่านั้น',
                desc: 'เมื่อเปิดใช้งาน สีกำหนดเองจะใช้กับไอคอนเท่านั้น เมื่อปิดใช้งาน สีจะใช้กับทั้งไอคอนและป้ายข้อความ'
            },
            collapseBehavior: {
                name: 'ยุบรายการ',
                desc: 'เลือกว่าปุ่มขยาย/ยุบทั้งหมดจะมีผลกับอะไร',
                options: {
                    all: 'โฟลเดอร์และแท็กทั้งหมด',
                    foldersOnly: 'โฟลเดอร์เท่านั้น',
                    tagsOnly: 'แท็กเท่านั้น'
                }
            },
            smartCollapse: {
                name: 'เก็บรายการที่เลือกไว้ขยาย',
                desc: 'เมื่อยุบ เก็บโฟลเดอร์หรือแท็กที่เลือกอยู่และหลักไว้ขยาย'
            },
            navIndent: {
                name: 'การเยื้องต้นไม้',
                desc: 'ปรับความกว้างการเยื้องสำหรับโฟลเดอร์และแท็กที่ซ้อนกัน'
            },
            navItemHeight: {
                name: 'ความสูงรายการ',
                desc: 'ปรับความสูงของโฟลเดอร์และแท็กในแผงนำทาง'
            },
            navItemHeightScaleText: {
                name: 'ปรับขนาดข้อความตามความสูงรายการ',
                desc: 'ลดขนาดข้อความนำทางเมื่อความสูงรายการลดลง'
            },
            navRootSpacing: {
                name: 'ระยะห่างรายการหลัก',
                desc: 'ระยะห่างระหว่างโฟลเดอร์และแท็กระดับหลัก'
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
                desc: 'เลือกวิธีเรียงแท็กในแผงนำทาง (ไม่ซิงค์)',
                options: {
                    alphaAsc: 'ก ถึง ฮ',
                    alphaDesc: 'ฮ ถึง ก',
                    frequencyAsc: 'ความถี่ (ต่ำไปสูง)',
                    frequencyDesc: 'ความถี่ (สูงไปต่ำ)'
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
            keepEmptyTagsProperty: {
                name: 'เก็บคุณสมบัติแท็กหลังนำแท็กสุดท้ายออก',
                desc: 'เก็บคุณสมบัติแท็ก frontmatter เมื่อนำแท็กทั้งหมดออก เมื่อปิดใช้งาน คุณสมบัติแท็กจะถูกลบออกจาก frontmatter'
            },
            hiddenTags: {
                name: 'ซ่อนแท็ก (โปรไฟล์ห้องนิรภัย)',
                desc: 'รายการรูปแบบแท็กคั่นด้วยเครื่องหมายจุลภาค รูปแบบชื่อ: tag* (ขึ้นต้นด้วย), *tag (ลงท้ายด้วย) รูปแบบเส้นทาง: archive (แท็กและลูกหลาน), archive/* (ลูกหลานเท่านั้น), projects/*/drafts (wildcard ตรงกลาง)',
                placeholder: 'archive*, *draft, projects/*/old'
            },
            enableFolderNotes: {
                name: 'เปิดใช้งานโน้ตโฟลเดอร์',
                desc: 'เมื่อเปิดใช้งาน โฟลเดอร์ที่มีโน้ตที่เกี่ยวข้องจะแสดงเป็นลิงก์ที่คลิกได้'
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
            folderNoteProperties: {
                name: 'คุณสมบัติโน้ตโฟลเดอร์',
                desc: 'YAML frontmatter ที่เพิ่มในโน้ตโฟลเดอร์ใหม่ เครื่องหมาย --- จะถูกเพิ่มโดยอัตโนมัติ',
                placeholder: 'theme: dark\nfoldernote: true'
            },
            hideFolderNoteInList: {
                name: 'ซ่อนโน้ตโฟลเดอร์ในรายการ',
                desc: 'ซ่อนโน้ตโฟลเดอร์ไม่ให้ปรากฏในรายการโน้ตของโฟลเดอร์'
            },
            pinCreatedFolderNote: {
                name: 'ปักหมุดโน้ตโฟลเดอร์ที่สร้าง',
                desc: 'ปักหมุดโน้ตโฟลเดอร์อัตโนมัติเมื่อสร้างจากเมนูบริบท'
            },
            confirmBeforeDelete: {
                name: 'ยืนยันก่อนลบ',
                desc: 'แสดงกล่องยืนยันเมื่อลบโน้ตหรือโฟลเดอร์'
            },
            interceptTagClicks: {
                name: 'นำทางไปยังแท็กเมื่อคลิก',
                desc: 'เมื่อคลิกแท็กในโน้ต นำทางไปยังแท็กนั้นใน Notebook Navigator แทนที่จะเรียกใช้การค้นหา Obsidian'
            },
            metadataCleanup: {
                name: 'ล้างเมตาดาต้า',
                desc: 'ลบเมตาดาต้ากำพร้าที่เหลืออยู่เมื่อไฟล์ โฟลเดอร์ หรือแท็กถูกลบ ย้าย หรือเปลี่ยนชื่อนอก Obsidian มีผลเฉพาะไฟล์การตั้งค่า Notebook Navigator',
                buttonText: 'ล้างเมตาดาต้า',
                error: 'ล้างการตั้งค่าล้มเหลว',
                loading: 'กำลังตรวจสอบเมตาดาต้า...',
                statusClean: 'ไม่มีเมตาดาต้าให้ล้าง',
                statusCounts: 'รายการกำพร้า: {folders} โฟลเดอร์, {tags} แท็ก, {files} ไฟล์, {pinned} ปักหมุด, {separators} ตัวคั่น'
            },
            rebuildCache: {
                name: 'สร้างแคชใหม่',
                desc: 'ใช้เมื่อพบแท็กที่หายไป ตัวอย่างไม่ถูกต้อง หรือรูปภาพประกอบที่หายไป สิ่งนี้อาจเกิดขึ้นหลังจากความขัดแย้งการซิงค์หรือการปิดที่ไม่คาดคิด',
                buttonText: 'สร้างแคชใหม่',
                success: 'สร้างแคชใหม่แล้ว',
                error: 'สร้างแคชใหม่ล้มเหลว',
                indexingTitle: 'กำลังสร้างดัชนีห้องนิรภัย...',
                progress: 'Notebook Navigator กำลังอัปเดตแคช.'
            },
            hotkeys: {
                intro: 'แก้ไข <โฟลเดอร์ปลั๊กอิน>/notebook-navigator/data.json เพื่อปรับแต่งปุ่มลัด Notebook Navigator เปิดไฟล์และค้นหาส่วน "keyboardShortcuts" แต่ละรายการใช้โครงสร้างนี้:',
                example: '"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]',
                modifierList: [
                    '"Mod" = Cmd (macOS) / Ctrl (Win/Linux)',
                    '"Alt" = Alt/Option',
                    '"Shift" = Shift',
                    '"Ctrl" = Control (แนะนำ "Mod" สำหรับข้ามแพลตฟอร์ม)'
                ],
                guidance:
                    'เพิ่มการจับคู่หลายรายการเพื่อรองรับปุ่มสำรอง เช่น binding ArrowUp และ K ที่แสดงด้านบน รวมตัวปรับแต่งในรายการเดียวโดยระบุแต่ละค่า เช่น "modifiers": ["Mod", "Shift"] ลำดับคีย์บอร์ดเช่น "gg" หรือ "dd" ไม่รองรับ โหลด Obsidian ใหม่หลังแก้ไขไฟล์'
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
            frontmatterSaveMetadata: {
                name: 'บันทึกไอคอนและสีไปยัง frontmatter',
                desc: 'เขียนไอคอนและสีไฟล์ไปยัง frontmatter อัตโนมัติโดยใช้ฟิลด์ที่กำหนดค่าด้านบน'
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
                placeholder: 'หัวข้อ, ชื่อ'
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
                helpTooltip: 'ดูเอกสารรูปแบบ date-fns',
                help: "รูปแบบทั่วไป:\nyyyy-MM-dd'T'HH:mm:ss → 2025-01-04T14:30:45\nyyyy-MM-dd'T'HH:mm:ssXXX → 2025-08-07T16:53:39+02:00\ndd/MM/yyyy HH:mm:ss → 04/01/2025 14:30:45\nMM/dd/yyyy h:mm:ss a → 01/04/2025 2:30:45 PM"
            },
            supportDevelopment: {
                name: 'สนับสนุนการพัฒนา',
                desc: 'หากคุณชอบใช้ Notebook Navigator โปรดพิจารณาสนับสนุนการพัฒนาอย่างต่อเนื่อง',
                buttonText: '❤️ สปอนเซอร์',
                coffeeButton: '☕️ เลี้ยงกาแฟ'
            },
            updateCheckOnStart: {
                name: 'ตรวจสอบเวอร์ชันใหม่เมื่อเริ่ม',
                desc: 'ตรวจสอบรุ่นปลั๊กอินใหม่เมื่อเริ่มงานและแสดงการแจ้งเตือนเมื่อมีการอัปเดต แต่ละเวอร์ชันจะถูกประกาศเพียงครั้งเดียว และการตรวจสอบจะเกิดขึ้นอย่างมากวันละครั้ง',
                status: 'มีเวอร์ชันใหม่: {version}'
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
        supportMessage: 'หากคุณพบว่า Notebook Navigator มีประโยชน์ โปรดพิจารณาสนับสนุนการพัฒนา',
        supportButton: 'เลี้ยงกาแฟ',
        thanksButton: 'ขอบคุณ!'
    }
};
