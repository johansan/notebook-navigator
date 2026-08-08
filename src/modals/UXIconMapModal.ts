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

import { App, Modal, Platform, setIcon } from 'obsidian';
import { strings } from '../i18n';
import { getIconService } from '../services/icons';
import { runAsyncAction } from '../utils/async';
import { deserializeIconFromFrontmatter, normalizeCanonicalIconId, serializeIconForFrontmatter } from '../utils/iconizeFormat';
import { type UXIconCategory, type UXIconId, UX_ICON_DEFINITIONS } from '../utils/uxIcons';
import { addAsyncEventListener } from '../utils/domEventListeners';
import type { MetadataService } from '../services/MetadataService';
import { ItemType } from '../types';
import { isStringRecordValue, sanitizeRecord } from '../utils/recordUtils';
import { resolveFolderDisplayName } from '../utils/folderDisplayName';

interface UXIconMapModalOptions {
    metadataService: MetadataService;
    initialMap: Record<string, string>;
    onSave: (nextMap: Record<string, string>) => Promise<void> | void;
}

interface UXIconRow {
    id: UXIconId;
    category: UXIconCategory;
    label: string;
    defaultIconId: string;
    overrideIconId: string | null;
}

interface RowControls {
    iconSpan: HTMLSpanElement;
    resetButton: HTMLButtonElement;
}

export class UXIconMapModal extends Modal {
    private static readonly ROOT_FOLDER_PATH = '/';

    private iconService = getIconService();
    private rows: UXIconRow[];
    private initialMap: Record<string, string>;
    private initialRootFolderIconId: string | null;
    private listEl: HTMLDivElement | null = null;
    private rowDisposers: (() => void)[] = [];
    private footerDisposers: (() => void)[] = [];
    private rowControls = new Map<UXIconId, RowControls>();
    private applyButton: HTMLButtonElement | null = null;
    private readonly iconSize = Platform.isMobile ? 18 : 16;

    constructor(
        app: App,
        private options: UXIconMapModalOptions
    ) {
        super(app);
        this.initialMap = this.normalizeInterfaceIconMap(options.initialMap);
        this.initialRootFolderIconId = this.normalizeMetadataIconId(options.metadataService.getFolderIcon(UXIconMapModal.ROOT_FOLDER_PATH));
        this.rows = this.deserializeRows(this.initialMap);
    }

    private isRootFolderRow(id: UXIconId): boolean {
        return id === 'nav-folder-root';
    }

    private normalizeInterfaceIconMap(map: Record<string, string>): Record<string, string> {
        const normalizedMap = sanitizeRecord(map, isStringRecordValue);
        delete normalizedMap['nav-folder-root'];
        return normalizedMap;
    }

    private normalizeMetadataIconId(iconId: string | undefined): string | null {
        return iconId ? normalizeCanonicalIconId(iconId) : null;
    }

    onOpen(): void {
        this.modalEl.addClass('nn-ux-icon-map-modal');
        this.titleEl.setText(strings.modals.interfaceIcons.title);
        this.contentEl.empty();

        const scrollContainer = this.contentEl.createDiv({ cls: 'nn-ux-icon-map-scroll' });
        this.listEl = scrollContainer.createDiv({ cls: 'nn-ux-icon-map-list' });
        this.renderRows();
        this.renderFooter();
        this.updateApplyButtonState();
    }

    onClose(): void {
        this.disposeRowDisposers();
        this.disposeFooterDisposers();
        this.rowControls.clear();
        this.listEl = null;
        this.applyButton = null;
        this.modalEl.removeClass('nn-ux-icon-map-modal');
        this.contentEl.empty();
    }

    private resolveRowLabel(id: UXIconId): string {
        if (id === 'nav-folder-root') {
            const settings = this.options.metadataService.getSettingsProvider().settings;
            return resolveFolderDisplayName({
                app: this.app,
                metadataService: this.options.metadataService,
                settings,
                folderPath: UXIconMapModal.ROOT_FOLDER_PATH,
                fallbackName: this.app.vault.getRoot().name
            });
        }

        const label = strings.modals.interfaceIcons.items[id];
        return typeof label === 'string' ? label : '';
    }

    private resolveCategoryLabel(category: UXIconCategory): string {
        switch (category) {
            case 'navigationPane':
                return strings.settings.items.defaultStartupView.options.navigation;
            case 'folders':
                return strings.navigationPane.folders;
            case 'tags':
                return strings.navigationPane.tags;
            case 'properties':
                return strings.navigationPane.properties;
            case 'listPane':
                return strings.settings.items.defaultStartupView.options.listPane;
            case 'fileItems':
                return strings.modals.interfaceIcons.fileItemsSection;
            case 'calendar':
                return strings.navigationPane.calendar;
            default:
                return '';
        }
    }

    private deserializeRows(map: Record<string, string>): UXIconRow[] {
        return UX_ICON_DEFINITIONS.map(definition => {
            const defaultIconId = normalizeCanonicalIconId(definition.defaultIconId);
            const overrideIconId = this.isRootFolderRow(definition.id)
                ? this.initialRootFolderIconId
                : (() => {
                      const stored = map[definition.id];
                      const overrideCandidate = stored ? deserializeIconFromFrontmatter(stored) : null;
                      return overrideCandidate ? normalizeCanonicalIconId(overrideCandidate) : null;
                  })();

            return {
                id: definition.id,
                category: definition.category,
                label: this.resolveRowLabel(definition.id),
                defaultIconId,
                overrideIconId
            };
        });
    }

    private getEffectiveIconId(row: UXIconRow): string {
        return row.overrideIconId ?? row.defaultIconId;
    }

    private serializeIconValue(iconId: string): string | null {
        const normalized = normalizeCanonicalIconId(iconId);
        if (!normalized) {
            return null;
        }

        return serializeIconForFrontmatter(normalized);
    }

    private renderRows(): void {
        if (!this.listEl) {
            return;
        }

        this.disposeRowDisposers();
        this.rowControls.clear();
        this.listEl.empty();

        const categories: UXIconCategory[] = ['navigationPane', 'folders', 'tags', 'properties', 'listPane', 'fileItems', 'calendar'];
        const rowsByCategory = new Map<UXIconCategory, UXIconRow[]>();
        this.rows.forEach(row => {
            const existing = rowsByCategory.get(row.category);
            if (existing) {
                existing.push(row);
            } else {
                rowsByCategory.set(row.category, [row]);
            }
        });

        const renderRow = (row: UXIconRow) => {
            const rowEl = this.listEl?.createDiv({ cls: 'nn-ux-icon-map-row' });
            if (!rowEl) {
                return;
            }

            rowEl.createDiv({ cls: 'nn-ux-icon-map-label', text: row.label });

            const iconButtonEl = rowEl.createEl('button', {
                cls: 'nn-action-btn',
                attr: { type: 'button', 'aria-label': strings.contextMenu.file.changeIcon }
            });
            const iconSpan = iconButtonEl.createSpan();
            this.iconService.renderIcon(iconSpan, this.getEffectiveIconId(row), this.iconSize);
            this.rowDisposers.push(
                addAsyncEventListener(iconButtonEl, 'click', () => {
                    this.openIconPicker(row.id);
                })
            );

            const resetBtn = rowEl.createEl('button', {
                cls: 'nn-action-btn',
                attr: { type: 'button', 'aria-label': strings.common.clear }
            });
            setIcon(resetBtn, 'lucide-rotate-ccw');
            resetBtn.disabled = row.overrideIconId === null;
            this.rowDisposers.push(
                addAsyncEventListener(resetBtn, 'click', () => {
                    this.resetRowIcon(row.id);
                })
            );

            this.rowControls.set(row.id, { iconSpan, resetButton: resetBtn });
        };

        let hasRenderedGroup = false;
        categories.forEach(category => {
            const groupRows = rowsByCategory.get(category);
            if (!groupRows || groupRows.length === 0) {
                return;
            }

            const categoryLabel = this.resolveCategoryLabel(category);
            if (!categoryLabel) {
                return;
            }

            const headingClassName = hasRenderedGroup
                ? 'nn-ux-icon-map-group-heading nn-ux-icon-map-group-heading--spaced'
                : 'nn-ux-icon-map-group-heading';
            this.listEl?.createEl('h3', { cls: headingClassName, text: categoryLabel });

            groupRows.forEach(row => {
                renderRow(row);
            });

            hasRenderedGroup = true;
        });
    }

    private openIconPicker(iconKey: UXIconId): void {
        const row = this.rows.find(candidate => candidate.id === iconKey);
        if (!row) {
            return;
        }

        runAsyncAction(async () => {
            const { IconPickerModal } = await import('./IconPickerModal');
            const picker = new IconPickerModal(
                this.app,
                this.options.metadataService,
                this.isRootFolderRow(iconKey) ? UXIconMapModal.ROOT_FOLDER_PATH : '',
                this.isRootFolderRow(iconKey) ? ItemType.FOLDER : ItemType.FILE,
                {
                    titleOverride: row.label,
                    currentIconId: this.getEffectiveIconId(row),
                    showRemoveButton: true,
                    disableMetadataUpdates: true
                }
            );

            picker.onChooseIcon = async iconId => {
                this.setRowIcon(iconKey, iconId);
                return { handled: true };
            };

            picker.open();
        });
    }

    private setRowIcon(iconKey: UXIconId, iconId: string | null): void {
        const row = this.rows.find(candidate => candidate.id === iconKey);
        if (!row) {
            return;
        }

        const nextOverride = iconId ? normalizeCanonicalIconId(iconId) : null;
        if (this.isRootFolderRow(iconKey)) {
            row.overrideIconId = nextOverride;
        } else {
            const defaultIcon = normalizeCanonicalIconId(row.defaultIconId);
            row.overrideIconId = nextOverride && nextOverride !== defaultIcon ? nextOverride : null;
        }

        const controls = this.rowControls.get(iconKey);
        if (controls) {
            this.iconService.renderIcon(controls.iconSpan, this.getEffectiveIconId(row), this.iconSize);
            controls.resetButton.disabled = row.overrideIconId === null;
        }

        this.updateApplyButtonState();
    }

    private resetRowIcon(iconKey: UXIconId): void {
        this.setRowIcon(iconKey, null);
    }

    private disposeRowDisposers(): void {
        const disposers = this.rowDisposers;
        this.rowDisposers = [];
        disposers.forEach(disposer => {
            try {
                disposer();
            } catch (error) {
                console.error('[UXIconMapModal] Failed to dispose row handler', error);
            }
        });
    }

    private disposeFooterDisposers(): void {
        const disposers = this.footerDisposers;
        this.footerDisposers = [];
        disposers.forEach(disposer => {
            try {
                disposer();
            } catch (error) {
                console.error('[UXIconMapModal] Failed to dispose footer handler', error);
            }
        });
    }

    private renderFooter(): void {
        this.disposeFooterDisposers();

        const footer = this.contentEl.createDiv({ cls: 'nn-ux-icon-map-footer nn-button-container' });

        const cancelButton = footer.createEl('button', { text: strings.common.cancel, attr: { type: 'button' } });
        this.footerDisposers.push(
            addAsyncEventListener(cancelButton, 'click', () => {
                this.close();
            })
        );

        this.applyButton = footer.createEl('button', {
            cls: 'mod-cta',
            text: strings.modals.colorPicker.apply,
            attr: { type: 'button' }
        });
        this.footerDisposers.push(
            addAsyncEventListener(this.applyButton, 'click', () => {
                this.applyChanges();
            })
        );
    }

    private buildOverrideMap(): Record<string, string> {
        const map = sanitizeRecord<string>(undefined);
        this.rows.forEach(row => {
            if (this.isRootFolderRow(row.id)) {
                return;
            }
            if (!row.overrideIconId) {
                return;
            }
            const serialized = this.serializeIconValue(row.overrideIconId);
            if (!serialized) {
                return;
            }
            map[row.id] = serialized;
        });
        return map;
    }

    private areMapsEqual(a: Record<string, string>, b: Record<string, string>): boolean {
        const aKeys = Object.keys(a).sort();
        const bKeys = Object.keys(b).sort();
        if (aKeys.length !== bKeys.length) {
            return false;
        }

        for (let i = 0; i < aKeys.length; i++) {
            const key = aKeys[i];
            if (key !== bKeys[i]) {
                return false;
            }
            if (a[key] !== b[key]) {
                return false;
            }
        }

        return true;
    }

    private hasRootFolderIconChanged(): boolean {
        const rootRow = this.rows.find(row => this.isRootFolderRow(row.id));
        if (!rootRow) {
            return false;
        }

        return rootRow.overrideIconId !== this.initialRootFolderIconId;
    }

    private updateApplyButtonState(): void {
        if (!this.applyButton) {
            return;
        }

        const nextMap = this.buildOverrideMap();
        this.applyButton.disabled = this.areMapsEqual(nextMap, this.initialMap) && !this.hasRootFolderIconChanged();
    }

    private applyChanges(): void {
        const nextMap = this.buildOverrideMap();
        const rootRow = this.rows.find(row => this.isRootFolderRow(row.id));
        runAsyncAction(async () => {
            if (rootRow) {
                if (rootRow.overrideIconId) {
                    await this.options.metadataService.setFolderIcon(UXIconMapModal.ROOT_FOLDER_PATH, rootRow.overrideIconId);
                } else {
                    await this.options.metadataService.removeFolderIcon(UXIconMapModal.ROOT_FOLDER_PATH);
                }
            }
            await this.options.onSave(nextMap);
            this.close();
        });
    }
}
