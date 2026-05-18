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

import { App, Menu, MenuItem, TFile } from 'obsidian';
import { strings } from '../../i18n';
import type { MetadataService } from '../../services/MetadataService';
import {
    getCachedManualSortGroupHeader,
    writeManualSortGroupHeader,
    type ManualSortGroupHeaderData,
    type ManualSortGroupHeaderWriteValue
} from '../manualSort';
import { setAsyncOnClick, tryCreateSubmenu } from './menuAsyncHelpers';

interface AddManualSortGroupHeaderMenuItemsParams {
    menu: Menu;
    app: App;
    file: TFile;
    propertyKey: string;
    metadataService: MetadataService;
}

type ManualSortGroupHeaderStyleClipboard = Pick<ManualSortGroupHeaderData, 'showWordCount' | 'targetWordCount' | 'iconId' | 'color'>;

let manualSortGroupHeaderStyleClipboard: ManualSortGroupHeaderStyleClipboard | null = null;

function copyManualSortGroupHeaderStyle(header: ManualSortGroupHeaderData): void {
    manualSortGroupHeaderStyleClipboard = {
        showWordCount: header.showWordCount,
        targetWordCount: header.showWordCount ? header.targetWordCount : null,
        iconId: header.iconId,
        color: header.color
    };
}

function getManualSortGroupHeaderStyleClipboard(): ManualSortGroupHeaderStyleClipboard | null {
    return manualSortGroupHeaderStyleClipboard;
}

function createHeaderValueWithStyle(title: string, style: ManualSortGroupHeaderStyleClipboard): ManualSortGroupHeaderWriteValue {
    return {
        title,
        showWordCount: style.showWordCount,
        targetWordCount: style.showWordCount ? style.targetWordCount : null,
        iconId: style.iconId,
        color: style.color
    };
}

function addGroupHeaderEditorItem(
    menu: Menu,
    app: App,
    file: TFile,
    propertyKey: string,
    metadataService: MetadataService,
    title: string,
    currentValue: ManualSortGroupHeaderData | null
): void {
    menu.addItem((item: MenuItem) => {
        setAsyncOnClick(item.setTitle(title).setIcon('lucide-pencil'), async () => {
            const { ManualSortGroupHeaderModal } = await import('../../modals/ManualSortGroupHeaderModal');
            const modal = new ManualSortGroupHeaderModal(
                app,
                currentValue,
                async header => {
                    await writeManualSortGroupHeader(app, file, propertyKey, header);
                },
                {
                    metadataService
                }
            );
            modal.open();
        });
    });
}

async function openPasteHeaderStyleModal(
    app: App,
    file: TFile,
    propertyKey: string,
    metadataService: MetadataService,
    style: ManualSortGroupHeaderStyleClipboard
): Promise<void> {
    const { ManualSortGroupHeaderModal } = await import('../../modals/ManualSortGroupHeaderModal');
    const modal = new ManualSortGroupHeaderModal(
        app,
        {
            title: '',
            showWordCount: style.showWordCount,
            targetWordCount: style.showWordCount ? style.targetWordCount : null,
            iconId: style.iconId,
            color: style.color
        },
        async header => {
            await writeManualSortGroupHeader(app, file, propertyKey, header);
        },
        {
            metadataService
        }
    );
    modal.open();
}

async function pasteManualSortGroupHeaderStyle(
    app: App,
    file: TFile,
    propertyKey: string,
    metadataService: MetadataService,
    currentValue: ManualSortGroupHeaderData | null,
    style: ManualSortGroupHeaderStyleClipboard
): Promise<void> {
    if (!currentValue) {
        await openPasteHeaderStyleModal(app, file, propertyKey, metadataService, style);
        return;
    }

    await writeManualSortGroupHeader(app, file, propertyKey, createHeaderValueWithStyle(currentValue.title, style));
}

function addGroupHeaderSubmenu(
    menu: Menu,
    app: App,
    file: TFile,
    propertyKey: string,
    metadataService: MetadataService,
    currentValue: ManualSortGroupHeaderData | null
): boolean {
    const copiedStyle = getManualSortGroupHeaderStyleClipboard();
    if (!currentValue && !copiedStyle) {
        return false;
    }

    let addedSubmenu = false;

    menu.addItem((item: MenuItem) => {
        const submenu = tryCreateSubmenu(item);
        if (!submenu) {
            item.setTitle(strings.contextMenu.file.manualSortGroupHeader.title).setIcon('lucide-heading').setDisabled(true);
            return;
        }

        item.setTitle(strings.contextMenu.file.manualSortGroupHeader.title).setIcon('lucide-heading');
        addedSubmenu = true;

        if (currentValue) {
            submenu.addItem(subItem => {
                subItem
                    .setTitle(strings.contextMenu.file.manualSortGroupHeader.copyStyle)
                    .setIcon('lucide-copy')
                    .onClick(() => {
                        copyManualSortGroupHeaderStyle(currentValue);
                    });
            });
        }

        if (copiedStyle) {
            submenu.addItem(subItem => {
                setAsyncOnClick(
                    subItem.setTitle(strings.contextMenu.file.manualSortGroupHeader.pasteStyle).setIcon('lucide-clipboard-check'),
                    async () => {
                        const style = getManualSortGroupHeaderStyleClipboard();
                        if (!style) {
                            return;
                        }

                        await pasteManualSortGroupHeaderStyle(app, file, propertyKey, metadataService, currentValue, style);
                    }
                );
            });
        }

        if (currentValue) {
            submenu.addItem((subItem: MenuItem) => {
                setAsyncOnClick(
                    subItem.setTitle(strings.contextMenu.file.manualSortGroupHeader.remove).setIcon('lucide-eraser'),
                    async () => {
                        await writeManualSortGroupHeader(app, file, propertyKey, '');
                    }
                );
            });
        }
    });

    return addedSubmenu;
}

export function addManualSortGroupHeaderMenuItems({
    menu,
    app,
    file,
    propertyKey,
    metadataService
}: AddManualSortGroupHeaderMenuItemsParams): boolean {
    if (file.extension !== 'md') {
        return false;
    }

    const currentValue = getCachedManualSortGroupHeader(app, file, propertyKey);
    if (!currentValue) {
        addGroupHeaderEditorItem(
            menu,
            app,
            file,
            propertyKey,
            metadataService,
            strings.contextMenu.file.setManualSortGroupHeader,
            currentValue
        );
        addGroupHeaderSubmenu(menu, app, file, propertyKey, metadataService, currentValue);
        return true;
    }

    addGroupHeaderEditorItem(
        menu,
        app,
        file,
        propertyKey,
        metadataService,
        strings.contextMenu.file.changeManualSortGroupHeader,
        currentValue
    );
    addGroupHeaderSubmenu(menu, app, file, propertyKey, metadataService, currentValue);
    return true;
}
