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

import type { App, ButtonComponent } from 'obsidian';
import { showNotice } from '../utils/noticeUtils';
import { strings } from '../i18n';
import { TIMEOUTS } from '../types/obsidian-extended';
import {
    calculateCacheStatistics,
    calculateMetadataParsingFailurePaths,
    calculateMetadataParsingStatistics,
    type CacheStatistics,
    type MetadataParsingStatistics
} from '../storage/statistics';
import type NotebookNavigatorPlugin from '../main';
import { runAsyncAction } from '../utils/async';
import { getDBInstanceOrNull } from '../storage/fileOperations';
import type { SettingsPaneId } from './SettingsPaneDefinitions';

interface SettingsDiagnosticsControllerDeps {
    app: App;
    plugin: NotebookNavigatorPlugin;
    registerInterval(intervalId: number): void;
    scheduleDebouncedUpdate(name: string, updater: () => Promise<void> | void): void;
}

interface MetadataInfoText {
    infoText: string;
    failedText: string | null;
    hasFailures: boolean;
    failurePercentage: number;
}

// Owns diagnostics UI state across settings page lifecycles.
export class SettingsDiagnosticsController {
    private activeTabId: SettingsPaneId | null = null;
    private statsTextEl: HTMLElement | null = null;
    private metadataInfoEl: HTMLElement | null = null;
    private metadataExportButton: ButtonComponent | null = null;
    private statsUpdateInterval: number | null = null;
    private metadataInfoChangeUnsubscribe: (() => void) | null = null;
    private pendingStatisticsRefresh: number | null = null;
    private pendingStatisticsRefreshRequested = false;
    private isUpdatingCacheStatistics = false;
    private isUpdatingMetadataInfo = false;
    private pendingMetadataInfoRefreshRequested = false;

    constructor(private readonly deps: SettingsDiagnosticsControllerDeps) {}

    registerStatsTextElement(element: HTMLElement): void {
        this.statsTextEl = element;
    }

    registerMetadataInfoElement(element: HTMLElement, exportButton: ButtonComponent): void {
        this.metadataInfoEl = element;
        this.metadataExportButton = exportButton;
        exportButton
            .setButtonText(strings.settings.items.metadataInfo.exportFailed)
            .onClick(() => runAsyncAction(() => this.exportFailedMetadataReport()));
        exportButton.buttonEl.addClass('nn-setting-hidden');

        if (this.isMetadataInfoTab(this.activeTabId)) {
            runAsyncAction(() => this.updateMetadataInfo());
        }
    }

    prepareForRender(): void {
        this.stopStatisticsInterval();
        this.stopMetadataInfoListener();
        this.statsTextEl = null;
        this.metadataInfoEl = null;
        this.metadataExportButton = null;
    }

    dispose(): void {
        this.prepareForRender();
        this.activeTabId = null;
        this.pendingStatisticsRefreshRequested = false;
        this.pendingMetadataInfoRefreshRequested = false;
    }

    handleTabActivation(tabId: SettingsPaneId): void {
        this.activeTabId = tabId;

        if (tabId === 'advanced') {
            this.ensureStatisticsInterval();
        } else {
            this.stopStatisticsInterval();
        }

        if (this.isMetadataInfoTab(tabId)) {
            this.ensureMetadataInfoListener();
            runAsyncAction(() => this.updateMetadataInfo());
        } else {
            this.stopMetadataInfoListener();
        }

        if (this.pendingStatisticsRefreshRequested && (tabId === 'advanced' || this.isMetadataInfoTab(tabId))) {
            this.pendingStatisticsRefreshRequested = false;
            runAsyncAction(() => this.updateActiveTabInfo());
            this.scheduleDeferredStatisticsRefresh();
        }
    }

    requestRefresh(): void {
        this.pendingStatisticsRefreshRequested = true;
        if (this.activeTabId !== 'advanced' && !this.isMetadataInfoTab(this.activeTabId)) {
            return;
        }

        this.pendingStatisticsRefreshRequested = false;
        runAsyncAction(() => this.updateActiveTabInfo());
        this.scheduleDeferredStatisticsRefresh();
    }

    ensureStatisticsInterval(): void {
        if (this.activeTabId !== 'advanced' || this.statsUpdateInterval !== null) {
            return;
        }

        runAsyncAction(() => this.updateCacheStatistics());
        this.statsUpdateInterval = window.setInterval(() => {
            runAsyncAction(() => this.updateCacheStatistics());
        }, TIMEOUTS.INTERVAL_STATISTICS);
        this.deps.registerInterval(this.statsUpdateInterval);
    }

    private isMetadataInfoTab(tabId: SettingsPaneId | null): boolean {
        return tabId === 'frontmatter';
    }

    private generateStatisticsText(stats: CacheStatistics): string {
        const sizeText = `${stats.totalSizeMB.toFixed(1)} MB`;
        return `${strings.settings.items.cacheStatistics.localCache}: ${stats.totalItems} ${strings.settings.items.cacheStatistics.items}. ${stats.itemsWithTags} ${strings.settings.items.cacheStatistics.withTags}, ${stats.itemsWithPreview} ${strings.settings.items.cacheStatistics.withPreviewText}, ${stats.itemsWithFeature} ${strings.settings.items.cacheStatistics.withFeatureImage}, ${stats.itemsWithMetadata} ${strings.settings.items.cacheStatistics.withMetadata}. ${sizeText}`;
    }

    private generateMetadataInfoText(stats: MetadataParsingStatistics): MetadataInfoText {
        const nameCount = stats.itemsWithMetadataName || 0;
        const createdCount = stats.itemsWithMetadataCreated || 0;
        const modifiedCount = stats.itemsWithMetadataModified || 0;
        const iconCount = stats.itemsWithMetadataIcon || 0;
        const colorCount = stats.itemsWithMetadataColor || 0;
        const failedCreatedCount = stats.itemsWithFailedCreatedParse || 0;
        const failedModifiedCount = stats.itemsWithFailedModifiedParse || 0;
        const infoText = `${strings.settings.items.metadataInfo.successfullyParsed}: ${nameCount} ${strings.settings.items.metadataInfo.itemsWithName}, ${createdCount} ${strings.settings.items.metadataInfo.withCreatedDate}, ${modifiedCount} ${strings.settings.items.metadataInfo.withModifiedDate}, ${iconCount} ${strings.settings.items.metadataInfo.withIcon}, ${colorCount} ${strings.settings.items.metadataInfo.withColor}.`;

        const totalAttempts = createdCount + modifiedCount + failedCreatedCount + failedModifiedCount;
        const totalFailures = failedCreatedCount + failedModifiedCount;
        const failurePercentage = totalAttempts > 0 ? (totalFailures / totalAttempts) * 100 : 0;

        let failedText: string | null = null;
        if (failedCreatedCount > 0 || failedModifiedCount > 0) {
            failedText = `${strings.settings.items.metadataInfo.failedToParse}: ${failedCreatedCount} ${strings.settings.items.metadataInfo.createdDates}, ${failedModifiedCount} ${strings.settings.items.metadataInfo.modifiedDates}.`;
            if (failurePercentage > 70) {
                failedText += ` ${strings.settings.items.metadataInfo.checkTimestampFormat}`;
            }
        }

        return {
            infoText,
            failedText,
            hasFailures: failedCreatedCount > 0 || failedModifiedCount > 0,
            failurePercentage
        };
    }

    private async updateCacheStatistics(): Promise<void> {
        if (this.activeTabId !== 'advanced' || !this.statsTextEl || this.isUpdatingCacheStatistics) {
            return;
        }

        this.isUpdatingCacheStatistics = true;
        try {
            const stats = await calculateCacheStatistics(this.deps.plugin.settings, this.deps.plugin.getUXPreferences().showHiddenItems);
            if (stats && this.statsTextEl) {
                this.statsTextEl.setText(this.generateStatisticsText(stats));
            }
        } finally {
            this.isUpdatingCacheStatistics = false;
        }
    }

    private renderMetadataInfo(element: HTMLElement, metadataInfo: MetadataInfoText): void {
        element.empty();
        this.metadataExportButton?.buttonEl.toggleClass('nn-setting-hidden', !metadataInfo.hasFailures);

        element.createSpan({ text: metadataInfo.infoText });

        if (metadataInfo.failedText) {
            element.createEl('br');
            element.createSpan({
                text: metadataInfo.failedText,
                cls: metadataInfo.failurePercentage > 70 ? 'nn-metadata-error-text' : undefined
            });
        }
    }

    private async updateMetadataInfo(): Promise<void> {
        const metadataInfoEl = this.metadataInfoEl;
        if (!this.isMetadataInfoTab(this.activeTabId) || !metadataInfoEl) {
            return;
        }

        if (this.isUpdatingMetadataInfo) {
            this.pendingMetadataInfoRefreshRequested = true;
            return;
        }

        if (!this.deps.plugin.settings.useFrontmatterMetadata) {
            metadataInfoEl.empty();
            this.metadataExportButton?.buttonEl.addClass('nn-setting-hidden');
            return;
        }

        this.isUpdatingMetadataInfo = true;
        try {
            const stats = await calculateMetadataParsingStatistics(
                this.deps.plugin.settings,
                this.deps.plugin.getUXPreferences().showHiddenItems
            );
            if (!this.isMetadataInfoTab(this.activeTabId) || this.metadataInfoEl !== metadataInfoEl) {
                return;
            }
            if (!this.deps.plugin.settings.useFrontmatterMetadata) {
                metadataInfoEl.empty();
                this.metadataExportButton?.buttonEl.addClass('nn-setting-hidden');
                return;
            }
            if (!stats) {
                metadataInfoEl.empty();
                this.metadataExportButton?.buttonEl.addClass('nn-setting-hidden');
                return;
            }

            this.renderMetadataInfo(metadataInfoEl, this.generateMetadataInfoText(stats));
        } finally {
            this.isUpdatingMetadataInfo = false;
            if (this.pendingMetadataInfoRefreshRequested) {
                this.pendingMetadataInfoRefreshRequested = false;
                runAsyncAction(() => this.updateMetadataInfo());
            }
        }
    }

    private scheduleDeferredStatisticsRefresh(): void {
        if (this.pendingStatisticsRefresh !== null) {
            window.clearTimeout(this.pendingStatisticsRefresh);
        }

        this.pendingStatisticsRefresh = window.setTimeout(() => {
            this.pendingStatisticsRefresh = null;
            runAsyncAction(() => this.updateActiveTabInfo());
        }, TIMEOUTS.INTERVAL_STATISTICS * 2);
    }

    private updateActiveTabInfo(): Promise<void> {
        if (this.activeTabId === 'advanced') {
            return this.updateCacheStatistics();
        }
        if (this.isMetadataInfoTab(this.activeTabId)) {
            return this.updateMetadataInfo();
        }
        return Promise.resolve();
    }

    private stopStatisticsInterval(): void {
        if (this.statsUpdateInterval !== null) {
            window.clearInterval(this.statsUpdateInterval);
            this.statsUpdateInterval = null;
        }

        if (this.pendingStatisticsRefresh !== null) {
            window.clearTimeout(this.pendingStatisticsRefresh);
            this.pendingStatisticsRefresh = null;
        }
    }

    private ensureMetadataInfoListener(): void {
        if (this.metadataInfoChangeUnsubscribe) {
            return;
        }

        const db = getDBInstanceOrNull();
        if (!db) {
            return;
        }

        this.metadataInfoChangeUnsubscribe = db.onContentChange(changes => {
            if (!this.isMetadataInfoTab(this.activeTabId) || !this.metadataInfoEl || !this.deps.plugin.settings.useFrontmatterMetadata) {
                return;
            }

            const hasMetadataChanges = changes.some(change => change.changes.metadata !== undefined);
            if (!hasMetadataChanges) {
                return;
            }

            this.deps.scheduleDebouncedUpdate('metadata-info-refresh', () => this.updateMetadataInfo());
        });
    }

    private stopMetadataInfoListener(): void {
        if (this.metadataInfoChangeUnsubscribe) {
            this.metadataInfoChangeUnsubscribe();
            this.metadataInfoChangeUnsubscribe = null;
        }
    }

    private async exportFailedMetadataReport(): Promise<void> {
        if (!this.deps.plugin.settings.useFrontmatterMetadata) {
            return;
        }

        const failurePaths = await calculateMetadataParsingFailurePaths(
            this.deps.plugin.settings,
            this.deps.plugin.getUXPreferences().showHiddenItems
        );
        if (!failurePaths) {
            showNotice(strings.settings.metadataReport.exportFailed, { variant: 'warning' });
            return;
        }

        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const readableDate = now.toLocaleString();
        const filename = `metadata-parsing-failures-${timestamp}.md`;
        const failedCreatedFiles = [...failurePaths.failedCreatedFiles].sort();
        const failedModifiedFiles = [...failurePaths.failedModifiedFiles].sort();

        const lines: string[] = [];
        lines.push('# Metadata Parsing Failures', '', `Generated on: ${readableDate}`, '');
        lines.push('## Failed Created Date Parsing', `Total files: ${failedCreatedFiles.length}`, '');
        if (failedCreatedFiles.length > 0) {
            failedCreatedFiles.forEach(path => {
                lines.push(`- [[${path}]]`);
            });
        } else {
            lines.push('*No failures*');
        }

        lines.push('', '## Failed Modified Date Parsing', `Total files: ${failedModifiedFiles.length}`, '');
        if (failedModifiedFiles.length > 0) {
            failedModifiedFiles.forEach(path => {
                lines.push(`- [[${path}]]`);
            });
        } else {
            lines.push('*No failures*');
        }

        try {
            await this.deps.app.vault.create(filename, `${lines.join('\n')}\n`);
            showNotice(strings.settings.metadataReport.exportSuccess.replace('{filename}', filename), { variant: 'success' });
        } catch (error) {
            console.error('Failed to export metadata report:', error);
            showNotice(strings.settings.metadataReport.exportFailed, { variant: 'warning' });
        }
    }
}
