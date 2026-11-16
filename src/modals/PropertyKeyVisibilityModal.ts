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
import type { VaultProfilePropertyKey } from '../settings/types';
import { runAsyncAction } from '../utils/async';
import { addAsyncEventListener } from '../utils/domEventListeners';
import { casefold } from '../utils/recordUtils';
import { naturalCompare } from '../utils/sortUtils';
import { collectVaultPropertyKeys } from '../utils/propertyUtils';
import { clonePropertyKeys } from '../utils/vaultProfiles';

interface PropertyKeyVisibilityModalOptions {
    initialKeys: VaultProfilePropertyKey[];
    onSave: (nextKeys: VaultProfilePropertyKey[]) => Promise<void> | void;
}

type RowState = {
    normalizedKey: string;
    displayKey: string;
    noteCount: number;
    showInNavigation: boolean;
    showInList: boolean;
    showInFileMenu: boolean;
};

type RowControls = {
    rowEl: HTMLDivElement;
    navigationButton: HTMLButtonElement;
    listButton: HTMLButtonElement;
    fileMenuButton: HTMLButtonElement;
};

type ToggleTarget = 'navigation' | 'list' | 'fileMenu';
type ColumnToggleState = 'none' | 'some' | 'all';

type SelectAllControls = {
    rowEl: HTMLDivElement;
    navigationButton: HTMLButtonElement;
    listButton: HTMLButtonElement;
    fileMenuButton: HTMLButtonElement;
};

const CHECKBOX_OFF_ICON = 'lucide-square';
const CHECKBOX_SOME_ICON = 'lucide-square-minus';
const CHECKBOX_ON_ICON = 'lucide-square-check-big';
const SEARCH_CLEAR_ICON = 'lucide-circle-x';
const NAVIGATION_PANE_TAB_ICON = 'panel-left';
const LIST_PANE_TAB_ICON = 'list';
const FILE_MENU_ICON = 'square-menu';

export class PropertyKeyVisibilityModal extends Modal {
    private options: PropertyKeyVisibilityModalOptions;
    private rows: RowState[] = [];
    private rowsByKey = new Map<string, RowState>();
    private rowControls = new Map<string, RowControls>();
    private selectAllControls: SelectAllControls | null = null;
    private headerDisposers: (() => void)[] = [];
    private rowDisposers: (() => void)[] = [];
    private footerDisposers: (() => void)[] = [];
    private applyButton: HTMLButtonElement | null = null;
    private listEl: HTMLDivElement | null = null;
    private filterInputEl: HTMLInputElement | null = null;
    private filterClearButtonEl: HTMLButtonElement | null = null;
    private filterQuery = '';
    private initialSnapshot = '';
    private isSaving = false;
    private initialOrder: string[] = [];

    constructor(app: App, options: PropertyKeyVisibilityModalOptions) {
        super(app);
        this.options = options;
        this.initializeRows();
    }

    onOpen(): void {
        this.modalEl.addClass('nn-property-keys-modal');
        this.titleEl.setText(strings.modals.propertyKeyVisibility.title);
        this.contentEl.empty();

        const searchContainer = this.contentEl.createDiv({ cls: 'nn-property-keys-search-container' });
        const filterInput = searchContainer.createEl('input', {
            cls: ['nn-input', 'nn-property-keys-search'],
            attr: {
                type: 'text',
                placeholder: strings.modals.propertyKeyVisibility.searchPlaceholder
            }
        });

        const clearButton = searchContainer.createEl('button', {
            cls: 'nn-property-keys-search-clear',
            attr: {
                type: 'button',
                'aria-label': strings.searchInput.clearSearch
            }
        });
        setIcon(clearButton, SEARCH_CLEAR_ICON);

        this.filterInputEl = filterInput;
        this.filterClearButtonEl = clearButton;
        this.updateSearchControls();

        this.headerDisposers.push(
            addAsyncEventListener(filterInput, 'input', () => {
                this.filterQuery = filterInput.value;
                this.updateSearchControls();
                this.renderRows();
            })
        );
        this.headerDisposers.push(
            addAsyncEventListener(filterInput, 'keydown', event => {
                if (!Platform.isMobile || event.key !== 'Enter') {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                filterInput.blur();
            })
        );
        this.headerDisposers.push(
            addAsyncEventListener(clearButton, 'click', () => {
                this.filterQuery = '';
                filterInput.value = '';
                this.updateSearchControls();
                this.renderRows();
                filterInput.focus();
            })
        );

        const scrollContainer = this.contentEl.createDiv({ cls: 'nn-property-keys-scroll' });
        this.renderColumnHeader(scrollContainer);
        this.listEl = scrollContainer.createDiv({ cls: 'nn-property-keys-list' });
        this.renderRows();

        this.renderDescription();
        this.renderFooter();
        this.updateApplyButtonState();

        if (!Platform.isMobile) {
            filterInput.focus();
        }
    }

    onClose(): void {
        this.disposeHeaderDisposers();
        this.disposeRowDisposers();
        this.disposeFooterDisposers();
        this.rowControls.clear();
        this.selectAllControls = null;
        this.rows = [];
        this.rowsByKey.clear();
        this.listEl = null;
        this.applyButton = null;
        this.filterInputEl = null;
        this.filterClearButtonEl = null;
        this.modalEl.removeClass('nn-property-keys-modal');
        this.contentEl.empty();
    }

    private initializeRows(): void {
        const initialKeys = clonePropertyKeys(this.options.initialKeys);
        this.initialOrder = initialKeys.map(entry => casefold(entry.key)).filter(Boolean);

        const configuredByKey = new Map<string, VaultProfilePropertyKey>();
        initialKeys.forEach(entry => {
            const normalizedKey = casefold(entry.key);
            if (!normalizedKey || configuredByKey.has(normalizedKey)) {
                return;
            }
            configuredByKey.set(normalizedKey, entry);
        });

        const available = collectVaultPropertyKeys(this.app);
        const mergedByKey = new Map<string, RowState>();

        configuredByKey.forEach((entry, normalizedKey) => {
            mergedByKey.set(normalizedKey, {
                normalizedKey,
                displayKey: entry.key.trim(),
                noteCount: 0,
                showInNavigation: entry.showInNavigation,
                showInList: entry.showInList,
                showInFileMenu: entry.showInFileMenu
            });
        });

        available.forEach(suggestion => {
            const normalizedKey = casefold(suggestion.key);
            const displayKey = suggestion.key.trim();
            if (!normalizedKey || !displayKey) {
                return;
            }

            const existing = mergedByKey.get(normalizedKey);
            if (existing) {
                existing.noteCount = suggestion.noteCount;
                return;
            }

            mergedByKey.set(normalizedKey, {
                normalizedKey,
                displayKey,
                noteCount: suggestion.noteCount,
                showInNavigation: false,
                showInList: false,
                showInFileMenu: false
            });
        });

        const rows = Array.from(mergedByKey.values());
        rows.sort((left, right) => {
            const compare = naturalCompare(left.displayKey, right.displayKey);
            if (compare !== 0) {
                return compare;
            }
            return left.displayKey.localeCompare(right.displayKey);
        });

        this.rows = rows;
        this.rowsByKey = new Map(rows.map(row => [row.normalizedKey, row]));
        this.initialSnapshot = this.serializeSelection();
    }

    private serializeSelection(): string {
        const keys = this.buildNextPropertyKeys();
        const stable = keys
            .map(entry => ({
                key: entry.key,
                showInNavigation: entry.showInNavigation,
                showInList: entry.showInList,
                showInFileMenu: entry.showInFileMenu
            }))
            .sort((left, right) => {
                const leftKey = casefold(left.key);
                const rightKey = casefold(right.key);
                if (leftKey < rightKey) {
                    return -1;
                }
                if (leftKey > rightKey) {
                    return 1;
                }
                return 0;
            });
        return JSON.stringify(stable);
    }

    private buildNextPropertyKeys(): VaultProfilePropertyKey[] {
        const initialOrder = this.initialOrder;
        const inInitialOrder = new Set<string>();
        initialOrder.forEach(key => {
            if (key) {
                inInitialOrder.add(key);
            }
        });

        const included: VaultProfilePropertyKey[] = [];

        const includeRow = (row: RowState) => {
            const key = row.displayKey.trim();
            if (!key) {
                return;
            }
            included.push({
                key,
                showInNavigation: row.showInNavigation,
                showInList: row.showInList,
                showInFileMenu: row.showInFileMenu
            });
        };

        initialOrder.forEach(normalizedKey => {
            const row = this.rowsByKey.get(normalizedKey);
            if (!row) {
                return;
            }
            if (!row.showInNavigation && !row.showInList && !row.showInFileMenu) {
                return;
            }
            includeRow(row);
        });

        const appended = this.rows.filter(row => {
            if (!row.showInNavigation && !row.showInList && !row.showInFileMenu) {
                return false;
            }
            return !inInitialOrder.has(row.normalizedKey);
        });

        appended.sort((left, right) => {
            const compare = naturalCompare(left.displayKey, right.displayKey);
            if (compare !== 0) {
                return compare;
            }
            return left.displayKey.localeCompare(right.displayKey);
        });

        appended.forEach(row => includeRow(row));

        return included;
    }

    private getFilteredRows(): RowState[] {
        const query = this.filterQuery.trim();
        if (!query) {
            return this.rows;
        }

        const normalizedQuery = casefold(query);
        if (!normalizedQuery) {
            return this.rows;
        }

        return this.rows.filter(row => row.normalizedKey.includes(normalizedQuery));
    }

    private renderRows(): void {
        if (!this.listEl) {
            return;
        }

        this.disposeRowDisposers();
        this.rowControls.clear();
        this.selectAllControls = null;
        this.listEl.empty();

        const rows = this.getFilteredRows();
        if (rows.length === 0) {
            this.listEl.createDiv({ cls: 'nn-property-keys-empty', text: strings.modals.propertyKeyVisibility.emptyState });
            return;
        }

        rows.forEach(row => {
            const rowEl = this.listEl?.createDiv({ cls: 'nn-property-keys-row' });
            if (!rowEl) {
                return;
            }

            const labelEl = rowEl.createDiv({ cls: 'nn-property-keys-label' });
            labelEl.createSpan({ text: row.displayKey });
            if (row.noteCount > 0) {
                labelEl.createSpan({
                    cls: 'nn-property-keys-count',
                    text: ` (${row.noteCount.toLocaleString()})`
                });
            }

            const actionsEl = rowEl.createDiv({ cls: 'nn-property-keys-actions' });

            const navigationButton = this.createToggleButton(actionsEl, strings.modals.propertyKeyVisibility.showInNavigation);
            const listButton = this.createToggleButton(actionsEl, strings.modals.propertyKeyVisibility.showInList);
            const fileMenuButton = this.createToggleButton(actionsEl, strings.modals.propertyKeyVisibility.showInFileMenu);

            const controls = { rowEl, navigationButton, listButton, fileMenuButton };
            this.rowControls.set(row.normalizedKey, controls);
            this.updateRowControls(row, controls);
            this.rowDisposers.push(
                addAsyncEventListener(rowEl, 'click', event => {
                    if (event.targetNode?.instanceOf(Element) && event.targetNode.closest('button')) {
                        return;
                    }
                    this.toggleEntireRow(row.normalizedKey);
                })
            );
            this.registerToggleButtonHandler(navigationButton, () => {
                this.toggleRow(row.normalizedKey, 'navigation');
            });
            this.registerToggleButtonHandler(listButton, () => {
                this.toggleRow(row.normalizedKey, 'list');
            });
            this.registerToggleButtonHandler(fileMenuButton, () => {
                this.toggleRow(row.normalizedKey, 'fileMenu');
            });
        });

        this.renderSelectAllRow();
    }

    private updateSearchControls(): void {
        const filterInput = this.filterInputEl;
        const clearButton = this.filterClearButtonEl;
        if (!filterInput || !clearButton) {
            return;
        }

        const hasQuery = this.filterQuery.trim().length > 0;
        filterInput.toggleClass('is-active', hasQuery);
        clearButton.toggleClass('is-visible', hasQuery);
    }

    private renderColumnHeader(containerEl: HTMLElement): void {
        const rowEl = containerEl.createDiv({ cls: ['nn-property-keys-row', 'nn-property-keys-header-row', 'is-enabled'] });
        rowEl.createDiv({
            cls: 'nn-property-keys-label',
            text: strings.modals.propertyKeyVisibility.propertyColumnLabel
        });

        const actionsEl = rowEl.createDiv({ cls: 'nn-property-keys-actions' });

        const navigationIconEl = actionsEl.createDiv({ cls: ['nn-property-keys-toggle', 'nn-property-keys-header-icon', 'is-enabled'] });
        navigationIconEl.setAttribute('aria-hidden', 'true');
        setIcon(navigationIconEl, NAVIGATION_PANE_TAB_ICON);

        const listIconEl = actionsEl.createDiv({ cls: ['nn-property-keys-toggle', 'nn-property-keys-header-icon', 'is-enabled'] });
        listIconEl.setAttribute('aria-hidden', 'true');
        setIcon(listIconEl, LIST_PANE_TAB_ICON);

        const fileMenuIconEl = actionsEl.createDiv({ cls: ['nn-property-keys-toggle', 'nn-property-keys-header-icon', 'is-enabled'] });
        fileMenuIconEl.setAttribute('aria-hidden', 'true');
        setIcon(fileMenuIconEl, FILE_MENU_ICON);
    }

    /**
     * Creates a toggle button used in row and select-all action columns.
     */
    private createToggleButton(actionsEl: HTMLElement, ariaLabel: string): HTMLButtonElement {
        return actionsEl.createEl('button', {
            cls: ['nn-action-btn', 'nn-property-keys-toggle'],
            attr: {
                type: 'button',
                'aria-label': ariaLabel
            }
        });
    }

    /**
     * Registers a click handler and tracks its disposer for modal teardown.
     */
    private registerToggleButtonHandler(button: HTMLButtonElement, handler: () => void): void {
        this.rowDisposers.push(addAsyncEventListener(button, 'click', handler));
    }

    private toggleRow(normalizedKey: string, toggle: ToggleTarget): void {
        const row = this.rowsByKey.get(normalizedKey);
        if (!row) {
            return;
        }

        if (toggle === 'navigation') {
            row.showInNavigation = !row.showInNavigation;
        } else if (toggle === 'list') {
            row.showInList = !row.showInList;
        } else {
            row.showInFileMenu = !row.showInFileMenu;
        }

        const controls = this.rowControls.get(normalizedKey);
        if (controls) {
            this.updateRowControls(row, controls);
        }

        this.updateSelectAllControls();
        this.updateApplyButtonState();
    }

    private toggleEntireRow(normalizedKey: string): void {
        const row = this.rowsByKey.get(normalizedKey);
        if (!row) {
            return;
        }

        const selectedCount = Number(row.showInNavigation) + Number(row.showInList) + Number(row.showInFileMenu);
        const nextChecked = selectedCount < 3;

        row.showInNavigation = nextChecked;
        row.showInList = nextChecked;
        row.showInFileMenu = nextChecked;

        const controls = this.rowControls.get(normalizedKey);
        if (controls) {
            this.updateRowControls(row, controls);
        }

        this.updateSelectAllControls();
        this.updateApplyButtonState();
    }

    private updateRowControls(row: RowState, controls: RowControls): void {
        const enabled = row.showInNavigation || row.showInList || row.showInFileMenu;
        controls.rowEl.toggleClass('is-enabled', enabled);

        controls.navigationButton.toggleClass('is-enabled', row.showInNavigation);
        setIcon(controls.navigationButton, row.showInNavigation ? CHECKBOX_ON_ICON : CHECKBOX_OFF_ICON);

        controls.listButton.toggleClass('is-enabled', row.showInList);
        setIcon(controls.listButton, row.showInList ? CHECKBOX_ON_ICON : CHECKBOX_OFF_ICON);

        controls.fileMenuButton.toggleClass('is-enabled', row.showInFileMenu);
        setIcon(controls.fileMenuButton, row.showInFileMenu ? CHECKBOX_ON_ICON : CHECKBOX_OFF_ICON);
    }

    private renderSelectAllRow(): void {
        if (!this.listEl) {
            return;
        }

        const rowEl = this.listEl.createDiv({ cls: ['nn-property-keys-row', 'nn-property-keys-select-all-row'] });
        rowEl.createDiv({ cls: 'nn-property-keys-label' });

        const actionsEl = rowEl.createDiv({ cls: 'nn-property-keys-actions' });

        const navigationButton = this.createToggleButton(actionsEl, strings.modals.propertyKeyVisibility.toggleAllInNavigation);
        const listButton = this.createToggleButton(actionsEl, strings.modals.propertyKeyVisibility.toggleAllInList);
        const fileMenuButton = this.createToggleButton(actionsEl, strings.modals.propertyKeyVisibility.toggleAllInFileMenu);

        this.selectAllControls = { rowEl, navigationButton, listButton, fileMenuButton };
        this.updateSelectAllControls();

        this.registerToggleButtonHandler(navigationButton, () => {
            this.toggleAllRows('navigation');
        });
        this.registerToggleButtonHandler(listButton, () => {
            this.toggleAllRows('list');
        });
        this.registerToggleButtonHandler(fileMenuButton, () => {
            this.toggleAllRows('fileMenu');
        });
    }

    private getColumnToggleState(toggle: ToggleTarget, rows: readonly RowState[]): ColumnToggleState {
        const total = rows.length;
        if (total === 0) {
            return 'none';
        }

        let selected = 0;
        rows.forEach(row => {
            if (toggle === 'navigation') {
                if (row.showInNavigation) {
                    selected += 1;
                }
                return;
            }

            if (toggle === 'list' && row.showInList) {
                selected += 1;
                return;
            }

            if (toggle === 'fileMenu' && row.showInFileMenu) {
                selected += 1;
            }
        });

        if (selected === 0) {
            return 'none';
        }

        if (selected === total) {
            return 'all';
        }

        return 'some';
    }

    private getIconForColumnState(state: ColumnToggleState): string {
        if (state === 'all') {
            return CHECKBOX_ON_ICON;
        }

        if (state === 'some') {
            return CHECKBOX_SOME_ICON;
        }

        return CHECKBOX_OFF_ICON;
    }

    private updateSelectAllControls(): void {
        const controls = this.selectAllControls;
        if (!controls) {
            return;
        }

        const filteredRows = this.getFilteredRows();
        const navigationState = this.getColumnToggleState('navigation', filteredRows);
        const listState = this.getColumnToggleState('list', filteredRows);
        const fileMenuState = this.getColumnToggleState('fileMenu', filteredRows);

        controls.navigationButton.toggleClass('is-enabled', navigationState !== 'none');
        setIcon(controls.navigationButton, this.getIconForColumnState(navigationState));

        controls.listButton.toggleClass('is-enabled', listState !== 'none');
        setIcon(controls.listButton, this.getIconForColumnState(listState));

        controls.fileMenuButton.toggleClass('is-enabled', fileMenuState !== 'none');
        setIcon(controls.fileMenuButton, this.getIconForColumnState(fileMenuState));

        controls.rowEl.toggleClass('is-enabled', navigationState !== 'none' || listState !== 'none' || fileMenuState !== 'none');
    }

    private toggleAllRows(toggle: ToggleTarget): void {
        const filteredRows = this.getFilteredRows();
        const currentState = this.getColumnToggleState(toggle, filteredRows);
        const nextChecked = currentState !== 'all';

        filteredRows.forEach(row => {
            if (toggle === 'navigation') {
                row.showInNavigation = nextChecked;
            } else if (toggle === 'list') {
                row.showInList = nextChecked;
            } else {
                row.showInFileMenu = nextChecked;
            }
        });

        this.rowControls.forEach((controls, normalizedKey) => {
            const row = this.rowsByKey.get(normalizedKey);
            if (!row) {
                return;
            }
            this.updateRowControls(row, controls);
        });

        this.updateSelectAllControls();
        this.updateApplyButtonState();
    }

    /**
     * Renders helper text below the property key list.
     */
    private renderDescription(): void {
        this.contentEl.createEl('p', {
            cls: 'nn-property-keys-description',
            text: strings.modals.propertyKeyVisibility.description
        });
    }

    private renderFooter(): void {
        const footer = this.contentEl.createDiv({ cls: ['nn-button-container', 'nn-property-keys-footer'] });

        const cancelButton = footer.createEl('button', {
            text: strings.common.cancel,
            attr: { type: 'button' }
        });
        this.footerDisposers.push(
            addAsyncEventListener(cancelButton, 'click', () => {
                this.close();
            })
        );

        this.applyButton = footer.createEl('button', {
            cls: 'mod-cta',
            text: strings.modals.propertyKeyVisibility.applyButton,
            attr: { type: 'button' }
        });
        this.footerDisposers.push(
            addAsyncEventListener(this.applyButton, 'click', () => {
                this.applyChanges();
            })
        );
    }

    private updateApplyButtonState(): void {
        if (!this.applyButton) {
            return;
        }

        if (this.isSaving) {
            this.applyButton.disabled = true;
            return;
        }

        const snapshot = this.serializeSelection();
        this.applyButton.disabled = snapshot === this.initialSnapshot;
    }

    private applyChanges(): void {
        if (this.isSaving) {
            return;
        }

        const nextKeys = this.buildNextPropertyKeys();
        const snapshot = this.serializeSelection();
        if (snapshot === this.initialSnapshot) {
            this.close();
            return;
        }

        this.isSaving = true;
        this.updateApplyButtonState();

        runAsyncAction(async () => {
            try {
                await this.options.onSave(nextKeys);
                this.close();
            } finally {
                this.isSaving = false;
                this.updateApplyButtonState();
            }
        });
    }

    private disposeRowDisposers(): void {
        const disposers = this.rowDisposers;
        this.rowDisposers = [];
        disposers.forEach(dispose => {
            try {
                dispose();
            } catch {
                // ignore
            }
        });
    }

    private disposeHeaderDisposers(): void {
        const disposers = this.headerDisposers;
        this.headerDisposers = [];
        disposers.forEach(dispose => {
            try {
                dispose();
            } catch {
                // ignore
            }
        });
    }

    private disposeFooterDisposers(): void {
        const disposers = this.footerDisposers;
        this.footerDisposers = [];
        disposers.forEach(dispose => {
            try {
                dispose();
            } catch {
                // ignore
            }
        });
    }
}
