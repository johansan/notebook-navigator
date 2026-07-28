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

import { App, Platform } from 'obsidian';
import { STORAGE_KEYS } from '../../types';
import { localStorage } from '../../utils/localStorage';

const DEBUG_LOG_FILE_PREFIX = 'nn-debug-';
const DEBUG_LOG_FILE_SUFFIX = '.md';
const DEBUG_WRITE_DEBOUNCE_MS = 1000;
const STARTUP_SETTLE_DELAY_MS = 2000;
const STARTUP_REPORT_TIMEOUT_MS = 30000;
const HEARTBEAT_INTERVAL_MS = 100;
const HEARTBEAT_STALL_THRESHOLD_MS = 250;
const MAX_STALL_SAMPLES = 8;
const DEBUG_LOG_FILE_PATTERN = /^nn-debug-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.md$/;
const TIMELINE_TIME_WIDTH = 7;

type DebugLogPayload = Record<string, unknown>;

interface ContentProviderBatchSummary {
    provider: string;
    queued: number;
    active: number;
    contentUpdates: number;
    processedMtimeUpdates: number;
}

interface ContentProviderBatchAggregate {
    provider: string;
    batches: number;
    queued: number;
    active: number;
    contentUpdates: number;
    processedMtimeUpdates: number;
    maxQueued: number;
    maxActive: number;
}

interface DebugLoggingServiceOptions {
    pluginVersion: string;
}

interface StartupEvent {
    event: string;
    elapsedMs: number;
    details?: DebugLogPayload;
}

interface StartupSession {
    startMs: number;
    events: StartupEvent[];
    stallCount: number;
    maxStallMs: number;
    stallSamples: number[];
    storageReadyDetails: DebugLogPayload | null;
    userVisibleDetails: DebugLogPayload | null;
    finalized: boolean;
}

let currentDebugLoggingService: DebugLoggingService | null = null;

function nowMs(): number {
    return typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now();
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

export function getDebugLogPathForTimestamp(date: Date = new Date()): string {
    const timestamp = date.toISOString().replace(/[:.]/g, '-');
    return `${DEBUG_LOG_FILE_PREFIX}${timestamp}${DEBUG_LOG_FILE_SUFFIX}`;
}

export function isDebugLogPath(path: string): boolean {
    return !path.includes('/') && DEBUG_LOG_FILE_PATTERN.test(path);
}

function readDebugLoggingEnabled(): boolean {
    return localStorage.get<unknown>(STORAGE_KEYS.debugLoggingEnabledKey) === true;
}

export function setDebugLoggingService(service: DebugLoggingService | null): void {
    currentDebugLoggingService = service;
}

export function isDebugLoggingEnabled(): boolean {
    return currentDebugLoggingService?.isActive() ?? readDebugLoggingEnabled();
}

export function recordStartupDiagnostic(event: string, details?: DebugLogPayload): void {
    currentDebugLoggingService?.recordStartupEvent(event, details);
}

export function finishStartupDiagnostics(details: DebugLogPayload): void {
    currentDebugLoggingService?.recordStorageReady(details);
}

export function recordStartupUserVisible(details?: DebugLogPayload): void {
    currentDebugLoggingService?.recordUserVisible(details);
}

export function recordDebugReport(title: string, details: DebugLogPayload): void {
    currentDebugLoggingService?.logReport(title, details);
}

export function recordContentProviderBatch(summary: ContentProviderBatchSummary): void {
    currentDebugLoggingService?.recordContentProviderBatch(summary);
}

function toSerializableValue(value: unknown, seen: WeakSet<object> = new WeakSet()): unknown {
    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
            stack: value.stack
        };
    }

    if (Array.isArray(value)) {
        if (seen.has(value)) {
            return '[Circular]';
        }
        seen.add(value);
        const result = value.map(entry => toSerializableValue(entry, seen));
        seen.delete(value);
        return result;
    }

    if (isRecord(value)) {
        if (seen.has(value)) {
            return '[Circular]';
        }
        seen.add(value);
        const result: Record<string, unknown> = {};
        for (const [key, entry] of Object.entries(value)) {
            result[key] = toSerializableValue(entry, seen);
        }
        seen.delete(value);
        return result;
    }

    return value;
}

function stringifyDetails(details: DebugLogPayload): string {
    try {
        return JSON.stringify(toSerializableValue(details), null, 2);
    } catch {
        return JSON.stringify({ message: 'Failed to serialize diagnostic payload.' }, null, 2);
    }
}

function formatTimelineTime(ms: unknown): string {
    const value = typeof ms === 'number' && Number.isFinite(ms) ? Math.max(0, ms) : 0;
    return `${(value / 1000).toFixed(3)}s`.padStart(TIMELINE_TIME_WIDTH, ' ');
}

function formatDuration(ms: unknown): string {
    const value = typeof ms === 'number' && Number.isFinite(ms) ? Math.max(0, Math.round(ms)) : 0;
    return `${value} ms`;
}

function formatOptionalDuration(ms: number | null): string {
    return ms === null ? 'not recorded' : formatDuration(ms);
}

function asNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function getEventElapsedMs(details: DebugLogPayload, eventName: string): number | null {
    const events = Array.isArray(details['events']) ? details['events'] : [];
    for (const event of events) {
        if (!isRecord(event) || event['event'] !== eventName) {
            continue;
        }
        return asNumber(event['elapsedMs']);
    }
    return null;
}

function formatScalar(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (value === null) {
        return 'null';
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return '[]';
        }
        if (value.length <= 4 && value.every(entry => !isRecord(entry) && !Array.isArray(entry))) {
            return `[${value.map(entry => formatScalar(entry)).join(', ')}]`;
        }
        return `[${value.length} items]`;
    }
    if (isRecord(value)) {
        const entries = Object.entries(value);
        if (entries.length === 0) {
            return '{}';
        }
        return `{${entries
            .slice(0, 3)
            .map(([key, entry]) => `${key}: ${formatScalar(entry)}`)
            .join(', ')}${entries.length > 3 ? ', ...' : ''}}`;
    }
    if (value === undefined) {
        return 'undefined';
    }
    if (typeof value === 'bigint') {
        return value.toString();
    }
    if (typeof value === 'symbol') {
        return value.description ? `symbol(${value.description})` : 'symbol';
    }
    if (typeof value === 'function') {
        return 'function';
    }
    return 'unknown';
}

function escapeTableCell(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function formatEventDetails(details: unknown): string {
    if (!isRecord(details)) {
        return '';
    }

    return Object.entries(details)
        .map(([key, value]) => `${key}=${formatScalar(value)}`)
        .join(', ');
}

function formatStartupSummary(details: DebugLogPayload): string[] {
    const lines = ['### Summary', ''];
    const mainThreadStalls = isRecord(details['mainThreadStalls']) ? details['mainThreadStalls'] : {};
    const storage = isRecord(details['storage']) ? details['storage'] : {};
    const storageTimings = isRecord(storage['timingsMs']) ? storage['timingsMs'] : {};
    const storageDiff = isRecord(storage['diff']) ? storage['diff'] : {};
    const storageQueued = isRecord(storage['queued']) ? storage['queued'] : {};
    const contentProviderBatches = Array.isArray(details['contentProviderBatches']) ? details['contentProviderBatches'] : [];
    const userVisibleMs = getEventElapsedMs(details, 'userVisible');
    const storageReadyMs = getEventElapsedMs(details, 'storage.ready');
    const layoutReadyMs = getEventElapsedMs(details, 'layout.ready');
    const settleDelayMs = asNumber(details['settleDelayMs']);

    lines.push(`- Result: ${formatScalar(details['reason'] ?? 'unknown')}`);
    lines.push('- Scope: starts when Obsidian calls Notebook Navigator onload; timeline gaps can include Obsidian or other plugins.');
    if (userVisibleMs !== null) {
        lines.push(`- User visible: ${formatDuration(userVisibleMs)}`);
    }
    if (storageReadyMs !== null || layoutReadyMs !== null) {
        lines.push(`- Ready markers: storage ${formatOptionalDuration(storageReadyMs)}, layout ${formatOptionalDuration(layoutReadyMs)}`);
    }
    lines.push(
        `- Diagnostic window: ${formatDuration(details['elapsedMs'])}${
            settleDelayMs !== null ? `, including ${formatDuration(settleDelayMs)} settle delay` : ''
        }`
    );
    lines.push(`- Platform: ${formatScalar(details['platform'] ?? 'unknown')}`);
    lines.push(
        `- Main-thread stalls: ${formatScalar(mainThreadStalls['count'] ?? 0)}, max ${formatDuration(mainThreadStalls['maxGapMs'])}`
    );

    const indexableFileCount = asNumber(storage['indexableFileCount']);
    const cachedFileCount = asNumber(storage['cachedFileCount']);
    if (indexableFileCount !== null || cachedFileCount !== null) {
        lines.push(`- Files: ${indexableFileCount ?? '?'} indexed, ${cachedFileCount ?? '?'} cached`);
    }

    if (Object.keys(storageDiff).length > 0) {
        lines.push(
            `- Diff: add ${formatScalar(storageDiff['toAdd'] ?? 0)}, update ${formatScalar(storageDiff['toUpdate'] ?? 0)}, remove ${formatScalar(storageDiff['toRemove'] ?? 0)}`
        );
    }

    if (Object.keys(storageTimings).length > 0) {
        lines.push(
            `- Storage timings: initial load ${formatDuration(storageTimings['initialLoad'])}, diff ${formatDuration(storageTimings['diff'])}, tags ${formatDuration(storageTimings['tagTree'])}, properties ${formatDuration(storageTimings['propertyTree'])}`
        );
    }

    if (Object.keys(storageQueued).length > 0) {
        lines.push(
            `- Queued: ${formatScalar(storageQueued['markdownFiles'] ?? 0)} markdown, ${formatScalar(storageQueued['fileThumbnailFiles'] ?? 0)} file thumbnails`
        );
    }

    if (contentProviderBatches.length > 0) {
        lines.push(`- Content providers during startup: ${contentProviderBatches.length}`);
    }

    return lines;
}

function formatStartupTimeline(details: DebugLogPayload): string[] {
    const events = Array.isArray(details['events']) ? details['events'] : [];
    const lines = [
        '### Timeline',
        '',
        `| ${'Time'.padStart(TIMELINE_TIME_WIDTH, ' ')} | Event | Details |`,
        '| ------: | ----- | ------- |'
    ];

    for (const event of events) {
        if (!isRecord(event)) {
            continue;
        }
        const eventName = typeof event['event'] === 'string' ? event['event'] : 'unknown';
        const eventDetails = formatEventDetails(event['details']);
        lines.push(`| ${formatTimelineTime(event['elapsedMs'])} | ${escapeTableCell(eventName)} | ${escapeTableCell(eventDetails)} |`);
    }

    return lines;
}

function formatStartupReport(title: string, details: DebugLogPayload): string {
    const isoTimestamp = new Date().toISOString();
    return [
        `\n## ${isoTimestamp} ${title}`,
        '',
        ...formatStartupSummary(details),
        '',
        ...formatStartupTimeline(details),
        '',
        '### Raw data',
        '',
        '```json',
        stringifyDetails(details),
        '```',
        ''
    ].join('\n');
}

export class DebugLoggingService {
    private readonly app: App;
    private readonly pluginVersion: string;
    private settingEnabled = false;
    private logPath = getDebugLogPathForTimestamp();
    private pendingText = '';
    private pendingFlushTimerId: number | null = null;
    private flushPromise: Promise<void> | null = null;
    private startupSession: StartupSession | null = null;
    private startupTimeoutId: number | null = null;
    private heartbeatTimeoutId: number | null = null;
    private startupSettleTimeoutId: number | null = null;
    private contentProviderBatches = new Map<string, ContentProviderBatchAggregate>();
    private lastHeartbeatMs = 0;

    constructor(app: App, options: DebugLoggingServiceOptions) {
        this.app = app;
        this.pluginVersion = options.pluginVersion;
    }

    initialize(): void {
        this.logPath = getDebugLogPathForTimestamp();
        this.settingEnabled = readDebugLoggingEnabled();
        if (this.settingEnabled) {
            this.startStartupSession();
        }
    }

    isEnabled(): boolean {
        return this.settingEnabled;
    }

    isActive(): boolean {
        return this.settingEnabled && this.startupSession !== null && !this.startupSession.finalized;
    }

    getLogPath(): string {
        return this.logPath;
    }

    setEnabled(enabled: boolean): void {
        localStorage.set(STORAGE_KEYS.debugLoggingEnabledKey, enabled);
        if (enabled === this.settingEnabled) {
            return;
        }

        this.settingEnabled = enabled;
        if (!enabled) {
            this.stopImmediately();
        }
    }

    recordStartupEvent(event: string, details?: DebugLogPayload): void {
        if (!this.isActive() || !this.startupSession) {
            return;
        }

        this.startupSession.events.push({
            event,
            elapsedMs: Math.round(nowMs() - this.startupSession.startMs),
            ...(details ? { details } : {})
        });
    }

    recordStorageReady(details: DebugLogPayload): void {
        const session = this.startupSession;
        if (!this.isActive() || !session) {
            return;
        }

        session.storageReadyDetails = details;
        this.recordStartupEvent('storage.ready');
        this.scheduleStartupFinalizationIfReady();
    }

    recordUserVisible(details?: DebugLogPayload): void {
        const session = this.startupSession;
        if (!this.isActive() || !session) {
            return;
        }

        session.userVisibleDetails = details ?? {};
        this.recordStartupEvent('userVisible', details);
        this.scheduleStartupFinalizationIfReady();
    }

    finishStartupReport(reason: string, details: DebugLogPayload = {}): void {
        const session = this.startupSession;
        if (!this.settingEnabled || !session || session.finalized) {
            return;
        }

        session.finalized = true;
        this.clearStartupTimers();
        this.appendReport('Startup diagnostics', {
            ...this.getSessionHeader(),
            reason,
            elapsedMs: Math.round(nowMs() - session.startMs),
            mainThreadStalls: {
                thresholdMs: HEARTBEAT_STALL_THRESHOLD_MS,
                count: session.stallCount,
                maxGapMs: Math.round(session.maxStallMs),
                samplesMs: session.stallSamples.map(sample => Math.round(sample))
            },
            events: session.events,
            ...(session.storageReadyDetails ? { storage: session.storageReadyDetails } : {}),
            ...(session.userVisibleDetails ? { userVisible: session.userVisibleDetails } : {}),
            ...(this.contentProviderBatches.size > 0 ? { contentProviderBatches: this.getContentProviderSummaries() } : {}),
            ...details
        });
        this.contentProviderBatches.clear();
    }

    logReport(title: string, details: DebugLogPayload): void {
        if (!this.isActive()) {
            return;
        }

        this.appendReport(title, details);
    }

    recordContentProviderBatch(summary: ContentProviderBatchSummary): void {
        if (!this.isActive()) {
            return;
        }

        const existing = this.contentProviderBatches.get(summary.provider);
        if (existing) {
            existing.batches += 1;
            existing.queued += summary.queued;
            existing.active += summary.active;
            existing.contentUpdates += summary.contentUpdates;
            existing.processedMtimeUpdates += summary.processedMtimeUpdates;
            existing.maxQueued = Math.max(existing.maxQueued, summary.queued);
            existing.maxActive = Math.max(existing.maxActive, summary.active);
        } else {
            this.contentProviderBatches.set(summary.provider, {
                provider: summary.provider,
                batches: 1,
                queued: summary.queued,
                active: summary.active,
                contentUpdates: summary.contentUpdates,
                processedMtimeUpdates: summary.processedMtimeUpdates,
                maxQueued: summary.queued,
                maxActive: summary.active
            });
        }
    }

    async flush(): Promise<void> {
        if (!this.settingEnabled || this.pendingText.length === 0) {
            return;
        }

        if (this.pendingFlushTimerId !== null) {
            window.clearTimeout(this.pendingFlushTimerId);
            this.pendingFlushTimerId = null;
        }

        const text = this.pendingText;
        this.pendingText = '';

        const write = async () => {
            try {
                await this.app.vault.adapter.append(this.logPath, text);
            } catch (error) {
                console.warn('[Notebook Navigator debug] Failed to append debug log', error);
            }
        };

        this.flushPromise = this.flushPromise ? this.flushPromise.then(write, write) : write();
        await this.flushPromise;
    }

    dispose(): void {
        this.clearStartupTimers();
        if (this.settingEnabled) {
            this.finishStartupReport('dispose', { status: 'partial' });
            void this.flush();
        }
    }

    private startStartupSession(): void {
        this.clearStartupTimers();
        const startMs = nowMs();
        this.startupSession = {
            startMs,
            events: [],
            stallCount: 0,
            maxStallMs: 0,
            stallSamples: [],
            storageReadyDetails: null,
            userVisibleDetails: null,
            finalized: false
        };
        this.recordStartupEvent('debugLogging.initialized', this.getSessionHeader());
        this.startHeartbeat();
        this.startupTimeoutId = window.setTimeout(() => {
            this.finishStartupReport('timeout', { status: 'partial' });
        }, STARTUP_REPORT_TIMEOUT_MS);
    }

    private startHeartbeat(): void {
        this.lastHeartbeatMs = nowMs();

        const tick = () => {
            if (!this.isActive() || !this.startupSession) {
                this.heartbeatTimeoutId = null;
                return;
            }

            const currentMs = nowMs();
            const gapMs = currentMs - this.lastHeartbeatMs;
            this.lastHeartbeatMs = currentMs;
            if (gapMs > HEARTBEAT_STALL_THRESHOLD_MS) {
                this.startupSession.stallCount += 1;
                this.startupSession.maxStallMs = Math.max(this.startupSession.maxStallMs, gapMs);
                if (this.startupSession.stallSamples.length < MAX_STALL_SAMPLES) {
                    this.startupSession.stallSamples.push(gapMs);
                }
            }

            this.heartbeatTimeoutId = window.setTimeout(tick, HEARTBEAT_INTERVAL_MS);
        };

        this.heartbeatTimeoutId = window.setTimeout(tick, HEARTBEAT_INTERVAL_MS);
    }

    private stopImmediately(): void {
        this.pendingText = '';
        this.contentProviderBatches.clear();
        this.clearStartupTimers();
        this.startupSession = null;
        if (this.pendingFlushTimerId !== null) {
            window.clearTimeout(this.pendingFlushTimerId);
            this.pendingFlushTimerId = null;
        }
    }

    private scheduleStartupFinalizationIfReady(): void {
        const session = this.startupSession;
        if (!session || session.finalized || !session.storageReadyDetails || !session.userVisibleDetails) {
            return;
        }
        if (this.startupSettleTimeoutId !== null) {
            return;
        }

        this.startupSettleTimeoutId = window.setTimeout(() => {
            this.startupSettleTimeoutId = null;
            this.finishStartupReport('settled', { settleDelayMs: STARTUP_SETTLE_DELAY_MS });
        }, STARTUP_SETTLE_DELAY_MS);
    }

    private getContentProviderSummaries(): ContentProviderBatchAggregate[] {
        return Array.from(this.contentProviderBatches.values()).sort((a, b) => a.provider.localeCompare(b.provider));
    }

    private clearStartupTimers(): void {
        if (this.startupTimeoutId !== null) {
            window.clearTimeout(this.startupTimeoutId);
            this.startupTimeoutId = null;
        }
        if (this.heartbeatTimeoutId !== null) {
            window.clearTimeout(this.heartbeatTimeoutId);
            this.heartbeatTimeoutId = null;
        }
        if (this.startupSettleTimeoutId !== null) {
            window.clearTimeout(this.startupSettleTimeoutId);
            this.startupSettleTimeoutId = null;
        }
    }

    private scheduleFlush(): void {
        if (this.pendingFlushTimerId !== null) {
            return;
        }

        this.pendingFlushTimerId = window.setTimeout(() => {
            this.pendingFlushTimerId = null;
            void this.flush();
        }, DEBUG_WRITE_DEBOUNCE_MS);
    }

    private getSessionHeader(): DebugLogPayload {
        return {
            pluginVersion: this.pluginVersion,
            platform: Platform.isPhone ? 'phone' : Platform.isTablet ? 'tablet' : 'desktop',
            logPath: this.logPath
        };
    }

    private appendReport(title: string, details: DebugLogPayload): void {
        const payload = toSerializableValue(details) as DebugLogPayload;
        this.pendingText += this.formatReport(title, payload);
        this.scheduleFlush();
    }

    private formatReport(title: string, details: DebugLogPayload): string {
        if (title === 'Startup diagnostics') {
            return formatStartupReport(title, details);
        }

        const isoTimestamp = new Date().toISOString();
        return [`\n## ${isoTimestamp} ${title}`, '', '```json', stringifyDetails(details), '```', ''].join('\n');
    }
}
