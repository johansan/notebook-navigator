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

import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FileView, TFile, normalizePath, type Workspace, type WorkspaceLeaf } from 'obsidian';
import { getCurrentLanguage, strings } from '../../i18n';
import { InfoModal } from '../../modals/InfoModal';
import { useServices } from '../../context/ServicesContext';
import { useSettingsState, useSettingsUpdate } from '../../context/SettingsContext';
import { useFileCacheOptional } from '../../context/StorageContext';
import { useUXPreferences } from '../../context/UXPreferencesContext';
import { getDBInstanceOrNull, isShutdownInProgress, waitForDatabaseInitialization } from '../../storage/fileOperations';
import { runAsyncAction } from '../../utils/async';
import { getCalendarCustomWeekAnchorUnit } from '../../utils/calendarCustomNotePatterns';
import { getDailyNoteFile, getDailyNotePath, getDailyNoteSettings as getCoreDailyNoteSettings } from '../../utils/dailyNotes';
import {
    getMomentApi,
    resolveCalendarLocales,
    resolveCalendarPeriodicNotesLocale,
    resolveDailyNoteLocale,
    type MomentApi,
    type MomentInstance
} from '../../utils/moment';
import { useFileOpener } from '../../hooks/useFileOpener';
import { useLocalDayKey } from '../../hooks/useLocalDayKey';
import { extractFrontmatterName } from '../../utils/metadataExtractor';
import { type CalendarNoteKind } from '../../utils/calendarNotes';
import { escapeMomentLiteralPath } from '../../utils/calendarCustomNotePatterns';
import { getActiveVaultProfile } from '../../utils/vaultProfiles';
import { createFileVisibilityChecker } from '../../utils/fileFilters';
import type { CalendarWeeksToShow } from '../../settings/types';
import { registerActiveFileWorkspaceListeners } from '../../utils/workspaceActiveFileEvents';
import { CalendarGrid } from './CalendarGrid';
import { CalendarHeader } from './CalendarHeader';
import { CalendarHoverTooltip } from './CalendarHoverTooltip';
import { CalendarYearPanel } from './CalendarYearPanel';
import {
    createCalendarNotePathResolverContext,
    parseCalendarNoteDateFromPath,
    resolveCalendarNotePath,
    resolveCalendarNoteTarget
} from './calendarNoteResolution';
import {
    buildDateFilterToken,
    clamp,
    formatIsoDate,
    isDateFilterModifierPressed,
    resolveCalendarWeekWindow,
    shouldAutoRevealCalendarNoteKind,
    setUnfinishedTaskCount
} from './calendarUtils';
import {
    clearCalendarFeatureImageRegenerationSlotsForPath,
    consumeCalendarFeatureImageRegenerationSlot,
    getCalendarFeatureImageRegenerationKey,
    useCalendarFeatureImages,
    type CalendarFeatureImageTarget
} from './useCalendarFeatureImages';
import { useCalendarHoverTooltip } from './useCalendarHoverTooltip';
import { useCalendarNoteActions } from './useCalendarNoteActions';
import type { CalendarDay, CalendarHeaderPeriodNoteTargets, CalendarNoteTarget, CalendarWeek, CalendarYearMonthEntry } from './types';
import { isStringRecordValue, sanitizeRecord } from '../../utils/recordUtils';

export interface CalendarProps {
    onWeekCountChange?: (count: number) => void;
    onNavigationAction?: () => void;
    weeksToShowOverride?: CalendarWeeksToShow;
    onAddDateFilter?: (dateToken: string) => void;
    onMissingFeatureImage?: (target: CalendarFeatureImageTarget) => void;
    onVisibleCalendarNoteFilesChange?: (files: TFile[]) => void;
    isRightSidebar?: boolean;
}

type HeaderPeriodKind = Extract<CalendarNoteKind, 'month' | 'quarter' | 'year'>;

interface CalendarYearMonthBaseEntry {
    date: MomentInstance;
    dayFiles: TFile[];
    existingDayFiles: TFile[];
    fullLabel: string;
    hasDailyNote: boolean;
    key: string;
    monthIndex: number;
    shortLabel: string;
}

interface ActiveEditorCalendarTarget {
    date: MomentInstance;
    shouldAutoReveal: boolean;
}

function resolveInitialCalendarCursorDate(momentApi: MomentApi | null, storedDateIso: string | null): MomentInstance | null {
    if (!momentApi) {
        return null;
    }

    if (storedDateIso) {
        const storedDate = momentApi(storedDateIso, 'YYYY-MM-DD', true);
        if (storedDate.isValid()) {
            return storedDate.startOf('day');
        }
    }

    return momentApi().startOf('day');
}

function getWorkspaceActiveFile(workspace: Workspace): TFile | null {
    const activeView = workspace.getActiveViewOfType(FileView);
    const activeFile = activeView?.file;
    return activeFile instanceof TFile ? activeFile : null;
}

function resolveActiveEditorFilePath(workspace: Workspace, candidateFile?: TFile | null): string | null {
    const activeViewFile = getWorkspaceActiveFile(workspace);
    const file = candidateFile instanceof TFile ? candidateFile : activeViewFile;

    if (file) {
        return file.path;
    }

    return null;
}

function isFileOpenInWorkspace(workspace: Workspace, filePath: string): boolean {
    if (typeof workspace.iterateAllLeaves !== 'function') {
        return false;
    }

    let isOpen = false;
    workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
        if (isOpen) {
            return;
        }

        const view = leaf.view;
        if (!(view instanceof FileView)) {
            return;
        }

        const file = view.file;
        if (file instanceof TFile && file.path === filePath) {
            isOpen = true;
        }
    });

    return isOpen;
}

function stripMarkdownExtension(path: string): string {
    return path.replace(/\.md$/iu, '');
}

export function Calendar({
    onWeekCountChange,
    onNavigationAction,
    weeksToShowOverride,
    onAddDateFilter,
    onMissingFeatureImage,
    onVisibleCalendarNoteFilesChange,
    isRightSidebar = false
}: CalendarProps) {
    const { app, commandQueue, fileSystemOps, isMobile, plugin } = useServices();
    const settings = useSettingsState();
    const updateSettings = useSettingsUpdate();
    const { showHiddenItems: showHiddenItemsPreference } = useUXPreferences();
    // calendarShowHiddenItems treats every calendar note as shown so vault profile filters (hidden
    // folders, file name patterns, tags, and properties) never hide calendar notes or block creating
    // them in hidden folders. The transient Show hidden items preference has the same effect.
    // Downstream visibility checks all read this derived flag.
    const showHiddenItems = settings.calendarShowHiddenItems || showHiddenItemsPreference;
    const activeProfile = getActiveVaultProfile(settings);
    const periodicNotesFolder = activeProfile.periodicNotesFolder;
    const hiddenFolders = activeProfile.hiddenFolders;
    const hasFrontmatterVisibilityRules = activeProfile.hiddenFileProperties.length > 0;
    const hasTagVisibilityRules = activeProfile.hiddenFileTags.length > 0;
    const customCalendarRootFolderSettings = useMemo(() => ({ calendarCustomRootFolder: periodicNotesFolder }), [periodicNotesFolder]);
    const weeksToShowSetting = weeksToShowOverride ?? settings.calendarWeeksToShow;
    const fileCache = useFileCacheOptional();
    const [dbFallback, setDbFallback] = useState(() => getDBInstanceOrNull());
    const db = fileCache?.getDB() ?? dbFallback;
    const regenerateFeatureImageForFile = fileCache?.regenerateFeatureImageForFile;
    const openFile = useFileOpener();
    const calendarLabelId = useId();

    const momentApi = getMomentApi();
    const [initialStoredCursorDateIso] = useState<string | null>(() => plugin.getCalendarCursorDateIso());
    const [initialCursorDate] = useState<MomentInstance | null>(() =>
        resolveInitialCalendarCursorDate(momentApi, initialStoredCursorDateIso)
    );
    const [cursorDate, setCursorDate] = useState<MomentInstance | null>(() => initialCursorDate);
    const [yearPanelYear, setYearPanelYear] = useState<number | null>(() => initialCursorDate?.year() ?? null);
    const todayIso = useLocalDayKey();
    const [activeEditorFilePath, setActiveEditorFilePath] = useState<string | null>(
        () => resolveActiveEditorFilePath(app.workspace) ?? null
    );

    const [vaultVersion, setVaultVersion] = useState(0);
    const [featureImageVersion, setFeatureImageVersion] = useState(0);
    const [taskIndicatorVersion, setTaskIndicatorVersion] = useState(0);
    const [hoverTooltipPreviewVersion, setHoverTooltipPreviewVersion] = useState(0);
    const [metadataVersion, setMetadataVersion] = useState(0);
    const [profileVisibilityVersion, setProfileVisibilityVersion] = useState(0);
    const isExistingFileVisible = useMemo(() => createFileVisibilityChecker(app, settings, { showHiddenItems: false }), [app, settings]);
    const resolveNoteTarget = useCallback(
        (targetPath: string | null, existingFile: TFile | null): CalendarNoteTarget => {
            // Recreate this callback after metadata/tag visibility changes so cached calendar targets are recalculated.
            void profileVisibilityVersion;
            return resolveCalendarNoteTarget({
                existingFile,
                targetPath,
                hiddenFolders,
                showHiddenItems,
                isExistingFileVisible
            });
        },
        [hiddenFolders, isExistingFileVisible, profileVisibilityVersion, showHiddenItems]
    );
    const visibleIndicatorNotePathsRef = useRef<Set<string>>(new Set());
    const visibleFeatureImageNotePathsRef = useRef<Set<string>>(new Set());
    const visibleFrontmatterNotePathsRef = useRef<Set<string>>(new Set());
    const frontmatterTitlesByPathRef = useRef<ReadonlyMap<string, string>>(new Map());
    const missingFeatureImageRegenerationRef = useRef<Set<string>>(new Set());
    const lastAppliedActiveEditorDateKeyRef = useRef<string | null>(null);
    const shouldSkipInitialActiveEditorRevealRef = useRef(initialStoredCursorDateIso !== null);
    const dayNoteTargetLookupCacheRef = useRef<{
        resolver: ((date: MomentInstance) => CalendarNoteTarget) | null;
        targets: Map<string, CalendarNoteTarget>;
    }>({ resolver: null, targets: new Map() });
    const profileVisibilityNotePathsRef = useRef<Set<string>>(new Set());
    const profileVisibilityFrameRef = useRef<number | null>(null);
    const scheduleProfileVisibilityUpdate = useCallback(() => {
        if (typeof window === 'undefined') {
            setProfileVisibilityVersion(version => version + 1);
            return;
        }

        if (profileVisibilityFrameRef.current !== null) {
            return;
        }

        // Metadata cache and storage events can report the same edit, so apply at most one visibility refresh per frame.
        profileVisibilityFrameRef.current = window.requestAnimationFrame(() => {
            profileVisibilityFrameRef.current = null;
            setProfileVisibilityVersion(version => version + 1);
        });
    }, []);
    const vaultVersionDebounceRef = useRef<number | null>(null);
    const scheduleVaultVersionUpdate = useCallback(() => {
        dayNoteTargetLookupCacheRef.current.targets.clear();

        if (typeof window === 'undefined') {
            setVaultVersion(v => v + 1);
            return;
        }

        if (vaultVersionDebounceRef.current !== null) {
            return;
        }

        vaultVersionDebounceRef.current = window.setTimeout(() => {
            vaultVersionDebounceRef.current = null;
            setVaultVersion(v => v + 1);
        }, 120);
    }, []);
    const syncActiveEditorFilePath = useCallback(
        (candidateFile?: TFile | null) => {
            const nextFilePath = resolveActiveEditorFilePath(app.workspace, candidateFile);
            setActiveEditorFilePath(previousFilePath => {
                if (previousFilePath === nextFilePath) {
                    return previousFilePath;
                }

                if (nextFilePath !== null) {
                    return nextFilePath;
                }

                if (previousFilePath && isFileOpenInWorkspace(app.workspace, previousFilePath)) {
                    return previousFilePath;
                }

                return null;
            });
        },
        [app.workspace]
    );
    const handleMissingCalendarFeatureImage = useCallback(
        (target: CalendarFeatureImageTarget) => {
            const shouldRegenerate = consumeCalendarFeatureImageRegenerationSlot({
                regenerationKeys: missingFeatureImageRegenerationRef.current,
                filePath: target.file.path,
                featureImageKey: target.key
            });
            if (!shouldRegenerate) {
                return;
            }

            if (regenerateFeatureImageForFile) {
                void regenerateFeatureImageForFile(target.file);
                return;
            }

            onMissingFeatureImage?.(target);
        },
        [onMissingFeatureImage, regenerateFeatureImageForFile]
    );
    const shouldTrackCalendarVaultChange = useCallback((file: unknown): boolean => {
        if (!(file instanceof TFile)) {
            return true;
        }
        return file.extension === 'md';
    }, []);
    const {
        hoverTooltip,
        hoverTooltipStyle,
        hoverTooltipRef,
        hoverTooltipStateRef,
        hoverTooltipPreviewText,
        shouldShowHoverTooltipPreview,
        hoverTooltipDateText,
        handleShowTooltip,
        handleHideTooltip,
        clearHoverTooltip
    } = useCalendarHoverTooltip({
        db,
        dateFormat: settings.dateFormat,
        isMobile,
        previewVersion: hoverTooltipPreviewVersion
    });

    useEffect(() => {
        if (fileCache) {
            return;
        }

        if (dbFallback) {
            return;
        }

        let isActive = true;
        runAsyncAction(async () => {
            while (isActive && !isShutdownInProgress()) {
                const instance = await waitForDatabaseInitialization();
                if (!isActive) {
                    return;
                }
                if (instance) {
                    setDbFallback(instance);
                    return;
                }

                await new Promise<void>(resolve => {
                    window.setTimeout(resolve, 250);
                });
            }
        });

        return () => {
            isActive = false;
        };
    }, [dbFallback, fileCache]);

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && profileVisibilityFrameRef.current !== null) {
                window.cancelAnimationFrame(profileVisibilityFrameRef.current);
                profileVisibilityFrameRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const cleanup = registerActiveFileWorkspaceListeners({
            workspace: app.workspace,
            commandQueue,
            onChange: ({ candidateFile }) => {
                syncActiveEditorFilePath(candidateFile);
            }
        });

        syncActiveEditorFilePath();

        return () => {
            cleanup();
        };
    }, [app.workspace, commandQueue, syncActiveEditorFilePath]);

    useEffect(() => {
        const onVaultUpdate = (file: unknown) => {
            if (!shouldTrackCalendarVaultChange(file)) {
                return;
            }
            scheduleVaultVersionUpdate();
        };
        const createRef = app.vault.on('create', onVaultUpdate);
        const deleteRef = app.vault.on('delete', onVaultUpdate);
        const renameRef = app.vault.on('rename', onVaultUpdate);

        return () => {
            app.vault.offref(createRef);
            app.vault.offref(deleteRef);
            app.vault.offref(renameRef);
            if (typeof window !== 'undefined' && vaultVersionDebounceRef.current !== null) {
                window.clearTimeout(vaultVersionDebounceRef.current);
                vaultVersionDebounceRef.current = null;
            }
        };
    }, [app.vault, scheduleVaultVersionUpdate, shouldTrackCalendarVaultChange]);

    useEffect(() => {
        if (!db) {
            return;
        }

        return db.onContentChange(changes => {
            const visibleIndicatorPaths = visibleIndicatorNotePathsRef.current;
            const visibleFeatureImagePaths = visibleFeatureImageNotePathsRef.current;
            const hoverTooltipState = hoverTooltipStateRef.current;
            const hoverPreviewPath =
                hoverTooltipState && hoverTooltipState.tooltipData.previewEnabled ? hoverTooltipState.tooltipData.previewPath : null;
            const shouldTrackFeatureImage = settings.calendarShowFeatureImage && visibleFeatureImagePaths.size > 0;
            const shouldTrackTaskIndicator = settings.calendarShowTasks && visibleIndicatorPaths.size > 0;
            const shouldTrackHoverPreview = Boolean(hoverPreviewPath);
            const shouldTrackProfileVisibility = !showHiddenItems && (hasFrontmatterVisibilityRules || hasTagVisibilityRules);

            let hasFeatureImageChange = !shouldTrackFeatureImage;
            let hasTaskIndicatorChange = !shouldTrackTaskIndicator;
            let hasHoverPreviewChange = !shouldTrackHoverPreview;
            let hasProfileVisibilityChange = !shouldTrackProfileVisibility;

            for (const change of changes) {
                const hasFeatureImageContentChange =
                    change.changes.featureImage !== undefined ||
                    change.changes.featureImageKey !== undefined ||
                    change.changes.featureImageStatus !== undefined;
                if (hasFeatureImageContentChange) {
                    clearCalendarFeatureImageRegenerationSlotsForPath(missingFeatureImageRegenerationRef.current, change.path);
                }

                if (
                    !hasHoverPreviewChange &&
                    hoverPreviewPath &&
                    change.path === hoverPreviewPath &&
                    change.changes.preview !== undefined
                ) {
                    hasHoverPreviewChange = true;
                }

                if (!hasTaskIndicatorChange && visibleIndicatorPaths.has(change.path) && change.changes.taskUnfinished !== undefined) {
                    hasTaskIndicatorChange = true;
                }

                if (!hasFeatureImageChange && visibleFeatureImagePaths.has(change.path) && hasFeatureImageContentChange) {
                    hasFeatureImageChange = true;
                }

                if (
                    !hasProfileVisibilityChange &&
                    profileVisibilityNotePathsRef.current.has(change.path) &&
                    ((hasFrontmatterVisibilityRules && change.metadataHiddenChanged === true) ||
                        (hasTagVisibilityRules && change.changes.tags !== undefined))
                ) {
                    hasProfileVisibilityChange = true;
                }

                if (hasFeatureImageChange && hasTaskIndicatorChange && hasHoverPreviewChange && hasProfileVisibilityChange) {
                    break;
                }
            }

            if (shouldTrackFeatureImage && hasFeatureImageChange) {
                setFeatureImageVersion(v => v + 1);
            }

            if (shouldTrackTaskIndicator && hasTaskIndicatorChange) {
                setTaskIndicatorVersion(v => v + 1);
            }

            if (shouldTrackHoverPreview && hasHoverPreviewChange) {
                setHoverTooltipPreviewVersion(v => v + 1);
            }

            if (shouldTrackProfileVisibility && hasProfileVisibilityChange) {
                scheduleProfileVisibilityUpdate();
            }
        });
    }, [
        db,
        hasFrontmatterVisibilityRules,
        hasTagVisibilityRules,
        hoverTooltipStateRef,
        settings.calendarShowFeatureImage,
        settings.calendarShowTasks,
        scheduleProfileVisibilityUpdate,
        showHiddenItems
    ]);

    useEffect(() => {
        if (showHiddenItems || (!hasFrontmatterVisibilityRules && !hasTagVisibilityRules)) {
            return;
        }

        const offref = app.metadataCache.on('changed', file => {
            // File visibility can flip without a vault create/delete/rename event.
            if (!(file instanceof TFile) || !profileVisibilityNotePathsRef.current.has(file.path)) {
                return;
            }
            scheduleProfileVisibilityUpdate();
        });
        return () => {
            app.metadataCache.offref(offref);
        };
    }, [app.metadataCache, hasFrontmatterVisibilityRules, hasTagVisibilityRules, scheduleProfileVisibilityUpdate, showHiddenItems]);

    useEffect(() => {
        const frontmatterNameField = settings.frontmatterNameField.trim();
        if (!settings.useFrontmatterMetadata || frontmatterNameField.length === 0) {
            return;
        }

        const offref = app.metadataCache.on('changed', file => {
            if (!(file instanceof TFile)) {
                return;
            }
            if (!visibleFrontmatterNotePathsRef.current.has(file.path)) {
                return;
            }
            const previousTitle = frontmatterTitlesByPathRef.current.get(file.path) ?? '';
            const nextTitle = extractFrontmatterName(app, file, frontmatterNameField).trim();
            if (previousTitle === nextTitle) {
                return;
            }
            setMetadataVersion(v => v + 1);
        });

        return () => {
            app.metadataCache.offref(offref);
        };
    }, [app, app.metadataCache, settings.frontmatterNameField, settings.useFrontmatterMetadata]);

    useEffect(() => {
        // Obsidian exposes `window.moment` after startup; in tests (or very early) it may be unavailable.
        if (!momentApi || cursorDate) {
            return;
        }
        const storedDateIso = plugin.getCalendarCursorDateIso();
        if (storedDateIso !== null) {
            shouldSkipInitialActiveEditorRevealRef.current = true;
        }
        setCursorDate(resolveInitialCalendarCursorDate(momentApi, storedDateIso));
    }, [cursorDate, momentApi, plugin]);

    useEffect(() => {
        if (!cursorDate) {
            return;
        }

        plugin.setCalendarCursorDateIso(formatIsoDate(cursorDate));
    }, [cursorDate, plugin]);

    useEffect(() => {
        if (!cursorDate) {
            return;
        }

        setYearPanelYear(previousYear => (previousYear === cursorDate.year() ? previousYear : cursorDate.year()));
    }, [cursorDate]);

    const currentLanguage = getCurrentLanguage();
    const { displayLocale, calendarRulesLocale } = useMemo(
        () => resolveCalendarLocales(settings.calendarLocale, momentApi, currentLanguage),
        [currentLanguage, momentApi, settings.calendarLocale]
    );
    const dailyNoteLocale = resolveDailyNoteLocale(momentApi);
    const periodicNotesLocale = resolveCalendarPeriodicNotesLocale(
        settings.calendarPeriodicNotesLocaleSource,
        calendarRulesLocale,
        momentApi
    );

    useEffect(() => {
        setCursorDate(previousCursorDate => previousCursorDate?.clone().locale(displayLocale) ?? previousCursorDate);
    }, [displayLocale]);

    const isCustomCalendar = settings.calendarIntegrationMode === 'notebook-navigator';
    const weekNotesEnabled = isCustomCalendar && settings.calendarCustomWeekPattern.trim() !== '';
    const monthNotesEnabled = isCustomCalendar && settings.calendarCustomMonthPattern.trim() !== '';
    const quarterNotesEnabled = isCustomCalendar && settings.calendarCustomQuarterPattern.trim() !== '';
    const yearNotesEnabled = isCustomCalendar && settings.calendarCustomYearPattern.trim() !== '';

    const effectiveWeekMode = useMemo<'iso' | 'locale'>(() => {
        if (!weekNotesEnabled) {
            return 'locale';
        }

        const anchorUnit = getCalendarCustomWeekAnchorUnit(settings.calendarCustomWeekPattern);
        return anchorUnit === 'isoWeek' ? 'iso' : 'locale';
    }, [settings.calendarCustomWeekPattern, weekNotesEnabled]);

    const weekStartsOn = useMemo(() => {
        if (effectiveWeekMode === 'iso') {
            return 1;
        }
        if (!momentApi) {
            return 1;
        }
        const localeData = momentApi().locale(calendarRulesLocale).localeData();
        const firstDay = localeData.firstDayOfWeek();
        return typeof firstDay === 'number' && Number.isInteger(firstDay) && firstDay >= 0 && firstDay <= 6 ? firstDay : 1;
    }, [calendarRulesLocale, effectiveWeekMode, momentApi]);

    const weekdays = useMemo(() => {
        if (!momentApi) {
            return [];
        }

        const firstDay = weekStartsOn;
        const localeData = momentApi().locale(displayLocale).localeData();
        const labels = localeData.weekdaysMin();
        if (!Array.isArray(labels) || labels.length !== 7) {
            return [];
        }
        const ordered = [...labels.slice(firstDay), ...labels.slice(0, firstDay)];
        return ordered.map(label => Array.from(label.trim())[0] ?? '');
    }, [displayLocale, momentApi, weekStartsOn]);

    const dailyNoteSettings = useMemo(() => {
        // Force refresh when vault contents change so `getDailyNoteFile()` reflects created/renamed/deleted daily notes.
        void vaultVersion;
        if (settings.calendarIntegrationMode !== 'daily-notes') {
            return null;
        }
        return getCoreDailyNoteSettings(app);
    }, [app, settings.calendarIntegrationMode, vaultVersion]);

    const dayNoteResolverContext = useMemo(() => createCalendarNotePathResolverContext('day', settings), [settings]);

    const canResolveCustomDayNotes = useMemo(() => {
        if (!momentApi) {
            return false;
        }

        return (
            settings.calendarIntegrationMode === 'notebook-navigator' &&
            dayNoteResolverContext.config.isPatternValid(dayNoteResolverContext.momentPattern, momentApi)
        );
    }, [dayNoteResolverContext, momentApi, settings.calendarIntegrationMode]);

    const getExistingCustomCalendarNoteTarget = useCallback(
        (kind: CalendarNoteKind, date: MomentInstance): CalendarNoteTarget => {
            const resolverContext = createCalendarNotePathResolverContext(kind, settings);
            const resolved = resolveCalendarNotePath({
                kind,
                date,
                resolverContext,
                calendarLocale: periodicNotesLocale,
                weekLocale: periodicNotesLocale,
                customCalendarRootFolderSettings,
                momentApi
            });
            if (!resolved) {
                return resolveNoteTarget(null, null);
            }

            const abstractFile = app.vault.getAbstractFileByPath(resolved.filePath);
            const existingFile = abstractFile instanceof TFile ? abstractFile : null;
            return resolveNoteTarget(resolved.filePath, existingFile);
        },
        [app.vault, customCalendarRootFolderSettings, momentApi, periodicNotesLocale, resolveNoteTarget, settings]
    );

    const resolveExistingDayNoteTarget = useCallback(
        (date: MomentInstance): CalendarNoteTarget => {
            let target: CalendarNoteTarget;
            if (canResolveCustomDayNotes) {
                target = getExistingCustomCalendarNoteTarget('day', date);
            } else if (settings.calendarIntegrationMode === 'daily-notes' && dailyNoteSettings) {
                const localizedDate = date.clone().locale(dailyNoteLocale);
                const targetPath = getDailyNotePath(localizedDate, dailyNoteSettings);
                const existingFile = getDailyNoteFile(app, localizedDate, dailyNoteSettings);
                target = resolveNoteTarget(targetPath, existingFile);
            } else {
                target = resolveNoteTarget(null, null);
            }

            return target;
        },
        [
            app,
            canResolveCustomDayNotes,
            dailyNoteSettings,
            dailyNoteLocale,
            getExistingCustomCalendarNoteTarget,
            resolveNoteTarget,
            settings.calendarIntegrationMode
        ]
    );

    const getExistingDayNoteTarget = useCallback(
        (date: MomentInstance): CalendarNoteTarget => {
            const cache = dayNoteTargetLookupCacheRef.current;
            if (cache.resolver !== resolveExistingDayNoteTarget) {
                // Profile and calendar settings can change during render; reset before reading so the next paint never uses old targets.
                cache.resolver = resolveExistingDayNoteTarget;
                cache.targets.clear();
            }

            const iso = formatIsoDate(date);
            const cached = cache.targets.get(iso);
            if (cached !== undefined) {
                return cached;
            }

            const target = resolveExistingDayNoteTarget(date);
            cache.targets.set(iso, target);
            return target;
        },
        [resolveExistingDayNoteTarget]
    );

    const resolveActiveEditorCalendarDayDate = useCallback(
        (filePath: string): MomentInstance | null => {
            if (!momentApi || !filePath.toLowerCase().endsWith('.md')) {
                return null;
            }

            const normalizedFilePath = normalizePath(filePath);
            const pathWithoutExtension = stripMarkdownExtension(normalizedFilePath);

            if (settings.calendarIntegrationMode === 'daily-notes') {
                if (!dailyNoteSettings) {
                    return null;
                }

                const folderPattern = escapeMomentLiteralPath(dailyNoteSettings.folder);
                const fullPattern = folderPattern ? `${folderPattern}/${dailyNoteSettings.format}` : dailyNoteSettings.format;
                const parsedDate = momentApi(pathWithoutExtension, fullPattern, dailyNoteLocale, true);
                if (!parsedDate.isValid()) {
                    return null;
                }

                const normalizedFolder = normalizePath(dailyNoteSettings.folder.trim()).replace(/^\/+/u, '').replace(/\/+$/u, '');
                const expectedPathWithoutExtension = normalizePath(
                    normalizedFolder
                        ? `${normalizedFolder}/${parsedDate.format(dailyNoteSettings.format)}`
                        : parsedDate.format(dailyNoteSettings.format)
                );
                if (`${expectedPathWithoutExtension}.md` !== normalizedFilePath) {
                    return null;
                }

                const normalizedDate = parsedDate.startOf('day');
                const note = getExistingDayNoteTarget(normalizedDate);
                return note.visibleFile?.path === normalizedFilePath ? normalizedDate : null;
            }

            if (!canResolveCustomDayNotes) {
                return null;
            }

            const rootFolderPattern = escapeMomentLiteralPath(customCalendarRootFolderSettings.calendarCustomRootFolder);
            const fullPattern = rootFolderPattern
                ? `${rootFolderPattern}/${dayNoteResolverContext.momentPattern}`
                : dayNoteResolverContext.momentPattern;
            const parsedDate = momentApi(pathWithoutExtension, fullPattern, periodicNotesLocale, true);
            if (!parsedDate.isValid()) {
                return null;
            }

            const normalizedDate = parsedDate.startOf('day');
            const note = getExistingDayNoteTarget(normalizedDate);
            if (note.visibleFile?.path !== normalizedFilePath) {
                return null;
            }

            return normalizedDate;
        },
        [
            canResolveCustomDayNotes,
            customCalendarRootFolderSettings.calendarCustomRootFolder,
            dailyNoteSettings,
            dailyNoteLocale,
            dayNoteResolverContext.momentPattern,
            getExistingDayNoteTarget,
            momentApi,
            periodicNotesLocale,
            settings.calendarIntegrationMode
        ]
    );

    const resolveActiveEditorCustomNoteTarget = useCallback(
        (filePath: string): ActiveEditorCalendarTarget | null => {
            if (!momentApi || settings.calendarIntegrationMode !== 'notebook-navigator') {
                return null;
            }

            const activePeriodKinds: {
                enabled: boolean;
                kind: Extract<CalendarNoteKind, 'week' | 'month' | 'quarter' | 'year'>;
                parseLocale: string;
            }[] = [
                { kind: 'week', enabled: weekNotesEnabled, parseLocale: periodicNotesLocale },
                { kind: 'month', enabled: monthNotesEnabled, parseLocale: periodicNotesLocale },
                { kind: 'quarter', enabled: quarterNotesEnabled, parseLocale: periodicNotesLocale },
                { kind: 'year', enabled: yearNotesEnabled, parseLocale: periodicNotesLocale }
            ];

            for (const { enabled, kind, parseLocale } of activePeriodKinds) {
                if (!enabled) {
                    continue;
                }

                const resolverContext = createCalendarNotePathResolverContext(kind, settings);
                const parsedDate = parseCalendarNoteDateFromPath({
                    filePath,
                    kind,
                    resolverContext,
                    calendarLocale: periodicNotesLocale,
                    weekLocale: periodicNotesLocale,
                    customCalendarRootFolderSettings,
                    momentApi,
                    parseLocale
                });
                if (!parsedDate) {
                    continue;
                }

                const note = getExistingCustomCalendarNoteTarget(kind, parsedDate);
                if (note.visibleFile?.path !== normalizePath(filePath)) {
                    continue;
                }

                switch (kind) {
                    case 'week':
                        return {
                            date: parsedDate
                                .clone()
                                .locale(periodicNotesLocale)
                                .startOf(getCalendarCustomWeekAnchorUnit(resolverContext.momentPattern)),
                            shouldAutoReveal: shouldAutoRevealCalendarNoteKind(kind)
                        };
                    case 'month':
                        return {
                            date: parsedDate.clone().locale(displayLocale).startOf('month'),
                            shouldAutoReveal: shouldAutoRevealCalendarNoteKind(kind)
                        };
                    case 'quarter':
                        return {
                            date: parsedDate.clone().locale(displayLocale).startOf('quarter'),
                            shouldAutoReveal: shouldAutoRevealCalendarNoteKind(kind)
                        };
                    case 'year':
                        return {
                            date: parsedDate.clone().locale(displayLocale).startOf('year'),
                            shouldAutoReveal: shouldAutoRevealCalendarNoteKind(kind)
                        };
                }
            }

            return null;
        },
        [
            displayLocale,
            getExistingCustomCalendarNoteTarget,
            momentApi,
            periodicNotesLocale,
            settings,
            weekNotesEnabled,
            monthNotesEnabled,
            quarterNotesEnabled,
            yearNotesEnabled,
            customCalendarRootFolderSettings
        ]
    );

    const weeks = useMemo<CalendarWeek[]>(() => {
        if (!momentApi || !cursorDate) {
            return [];
        }

        // Force refresh when vault contents change so custom calendar resolution reflects created/renamed/deleted notes.
        void vaultVersion;

        const weeksToShow = clamp(weeksToShowSetting, 1, 6);
        const cursor = cursorDate.clone().startOf('day');
        const targetMonth = cursor.month();
        const targetYear = cursor.year();
        const { windowStart, weekCount } = resolveCalendarWeekWindow({
            cursor,
            weekStartsOn,
            weeksToShow,
            alwaysRenderSixWeeks: isRightSidebar
        });

        const visibleWeeks: CalendarWeek[] = [];
        for (let weekOffset = 0; weekOffset < weekCount; weekOffset++) {
            const weekStart = windowStart.clone().add(weekOffset, 'week');
            const weekMoment = weekStart.clone().locale(calendarRulesLocale);
            const weekNumber = effectiveWeekMode === 'iso' ? weekMoment.isoWeek() : weekMoment.week();
            const weekYear = effectiveWeekMode === 'iso' ? weekMoment.isoWeekYear() : weekMoment.weekYear();

            const days: CalendarDay[] = [];
            for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
                const date = weekStart.clone().add(dayOffset, 'day').locale(displayLocale);
                const inMonth = date.month() === targetMonth && date.year() === targetYear;
                const iso = formatIsoDate(date);
                const note = getExistingDayNoteTarget(date);

                days.push({ date, iso, inMonth, note });
            }

            visibleWeeks.push({
                key: `week-${weekYear}-W${weekNumber}`,
                weekNumber,
                days
            });
        }

        return visibleWeeks;
    }, [
        calendarRulesLocale,
        cursorDate,
        displayLocale,
        effectiveWeekMode,
        getExistingDayNoteTarget,
        isRightSidebar,
        momentApi,
        vaultVersion,
        weeksToShowSetting,
        weekStartsOn
    ]);
    const activeEditorCalendarTarget = useMemo<ActiveEditorCalendarTarget | null>(() => {
        if (!activeEditorFilePath) {
            return null;
        }

        for (const week of weeks) {
            for (const day of week.days) {
                if (day.note.visibleFile?.path === activeEditorFilePath) {
                    return {
                        date: day.date.clone().startOf('day').locale(displayLocale),
                        shouldAutoReveal: true
                    };
                }
            }
        }

        const activeEditorDayDate = resolveActiveEditorCalendarDayDate(activeEditorFilePath);
        if (activeEditorDayDate) {
            return {
                date: activeEditorDayDate,
                shouldAutoReveal: true
            };
        }

        return resolveActiveEditorCustomNoteTarget(activeEditorFilePath);
    }, [activeEditorFilePath, displayLocale, resolveActiveEditorCalendarDayDate, resolveActiveEditorCustomNoteTarget, weeks]);
    const activeEditorDateKey =
        activeEditorFilePath && activeEditorCalendarTarget
            ? `${activeEditorFilePath}::${formatIsoDate(activeEditorCalendarTarget.date)}`
            : null;

    useLayoutEffect(() => {
        if (!activeEditorCalendarTarget || !activeEditorDateKey || !activeEditorCalendarTarget.shouldAutoReveal) {
            lastAppliedActiveEditorDateKeyRef.current = null;
            shouldSkipInitialActiveEditorRevealRef.current = false;
            return;
        }

        if (shouldSkipInitialActiveEditorRevealRef.current) {
            shouldSkipInitialActiveEditorRevealRef.current = false;
            lastAppliedActiveEditorDateKeyRef.current = activeEditorDateKey;
            return;
        }

        if (lastAppliedActiveEditorDateKeyRef.current === activeEditorDateKey) {
            return;
        }

        lastAppliedActiveEditorDateKeyRef.current = activeEditorDateKey;
        setCursorDate(previousCursorDate => {
            const nextCursorDate = activeEditorCalendarTarget.date.clone().startOf('day').locale(displayLocale);
            if (
                previousCursorDate &&
                previousCursorDate.year() === nextCursorDate.year() &&
                previousCursorDate.month() === nextCursorDate.month()
            ) {
                return previousCursorDate;
            }

            return nextCursorDate;
        });
    }, [activeEditorCalendarTarget, activeEditorDateKey, displayLocale]);

    const visibleDayNotePaths = useMemo(() => {
        const paths = new Set<string>();
        for (const week of weeks) {
            for (const day of week.days) {
                if (day.note.visibleFile) {
                    paths.add(day.note.visibleFile.path);
                }
            }
        }
        return paths;
    }, [weeks]);

    const featureImageKeysByIso = useMemo(() => {
        // Force refresh when calendar feature-image metadata changes so rendered day backgrounds stay in sync with content updates.
        void featureImageVersion;

        const featureKeys = new Map<string, string>();

        if (!db || !settings.calendarShowFeatureImage) {
            return featureKeys;
        }

        for (const week of weeks) {
            for (const day of week.days) {
                const file = day.note.visibleFile;
                if (!file) {
                    continue;
                }

                const record = db.getFile(file.path);
                const featureKey = record?.featureImageKey ?? null;
                const featureStatus = record?.featureImageStatus ?? null;
                if (featureStatus === 'has' && featureKey && featureKey !== '') {
                    featureKeys.set(day.iso, featureKey);
                }
            }
        }

        return featureKeys;
    }, [db, featureImageVersion, settings.calendarShowFeatureImage, weeks]);

    const dayFeatureImageTargets = useMemo<CalendarFeatureImageTarget[]>(() => {
        const targets: CalendarFeatureImageTarget[] = [];

        if (!settings.calendarShowFeatureImage) {
            return targets;
        }

        for (const week of weeks) {
            for (const day of week.days) {
                const file = day.note.visibleFile;
                if (!file) {
                    continue;
                }

                const featureKey = featureImageKeysByIso.get(day.iso);
                if (!featureKey) {
                    continue;
                }

                targets.push({
                    id: day.iso,
                    file,
                    key: featureKey
                });
            }
        }

        return targets;
    }, [featureImageKeysByIso, settings.calendarShowFeatureImage, weeks]);

    const unfinishedTaskCountByIso = useMemo(() => {
        // Force refresh when calendar task metadata changes so day task indicators stay in sync with content updates.
        void taskIndicatorVersion;

        const unfinishedTaskCounts = new Map<string, number>();

        if (!db || !settings.calendarShowTasks) {
            return unfinishedTaskCounts;
        }

        for (const week of weeks) {
            for (const day of week.days) {
                setUnfinishedTaskCount(unfinishedTaskCounts, day.iso, day.note.visibleFile, db);
            }
        }

        return unfinishedTaskCounts;
    }, [db, settings.calendarShowTasks, taskIndicatorVersion, weeks]);

    const showYearCalendar = isRightSidebar && settings.calendarShowYearCalendar;
    const renderedWeekRowCount = useMemo(() => {
        const weeksToShow = clamp(weeksToShowSetting, 1, 6);
        if (weeksToShow === 6 && showYearCalendar) {
            return 6;
        }
        return weeks.length;
    }, [showYearCalendar, weeks.length, weeksToShowSetting]);
    const trailingSpacerWeekCount = Math.max(0, renderedWeekRowCount - weeks.length);

    useLayoutEffect(() => {
        if (weeks.length === 0) {
            return;
        }
        onWeekCountChange?.(renderedWeekRowCount);
    }, [onWeekCountChange, renderedWeekRowCount, weeks.length]);

    const frontmatterTitlesByPath = useMemo(() => {
        void metadataVersion;
        if (!settings.useFrontmatterMetadata || settings.frontmatterNameField.trim().length === 0) {
            return new Map<string, string>();
        }

        const titles = new Map<string, string>();
        for (const week of weeks) {
            for (const day of week.days) {
                const file = day.note.visibleFile;
                if (!file) {
                    continue;
                }

                const title = extractFrontmatterName(app, file, settings.frontmatterNameField).trim();
                if (!title) {
                    continue;
                }

                titles.set(file.path, title);
            }
        }

        return titles;
    }, [app, metadataVersion, settings.frontmatterNameField, settings.useFrontmatterMetadata, weeks]);
    frontmatterTitlesByPathRef.current = frontmatterTitlesByPath;
    const featureImageUrls = useCalendarFeatureImages({
        db,
        showFeatureImages: settings.calendarShowFeatureImage,
        targets: dayFeatureImageTargets,
        maxConcurrentLoads: isMobile ? 4 : 6,
        onMissingFeatureImage: handleMissingCalendarFeatureImage
    });

    const handleNavigate = useCallback(
        (delta: number) => {
            if (!momentApi) {
                return;
            }
            clearHoverTooltip();
            const weeksToShow = clamp(weeksToShowSetting, 1, 6);
            const unit = weeksToShow === 6 ? 'month' : 'week';
            const step = weeksToShow === 6 ? delta : delta * weeksToShow;

            setCursorDate(prev => (prev ?? momentApi().startOf('day').locale(displayLocale)).clone().add(step, unit).locale(displayLocale));
            onNavigationAction?.();
        },
        [clearHoverTooltip, displayLocale, momentApi, onNavigationAction, weeksToShowSetting]
    );

    const handleNavigateYear = useCallback(
        (delta: number) => {
            clearHoverTooltip();
            setYearPanelYear(previousYear => {
                const baseYear = previousYear ?? cursorDate?.year() ?? momentApi?.().startOf('day').year() ?? new Date().getFullYear();
                return baseYear + delta;
            });
            onNavigationAction?.();
        },
        [clearHoverTooltip, cursorDate, momentApi, onNavigationAction]
    );

    const openCalendarHelp = useCallback(() => {
        const dateFilterItem =
            settings.multiSelectModifier === 'optionAlt'
                ? strings.navigationCalendar.helpModal.dateFilterOptionAlt
                : strings.navigationCalendar.helpModal.dateFilterCmdCtrl;

        new InfoModal(app, {
            title: strings.navigationCalendar.helpModal.title,
            items: [...strings.navigationCalendar.helpModal.items, dateFilterItem]
        }).open();
    }, [app, settings.multiSelectModifier]);

    const handleDateFilterModifiedClick = useCallback(
        (event: React.MouseEvent<HTMLElement>, kind: CalendarNoteKind, date: MomentInstance): boolean => {
            if (!onAddDateFilter) {
                return false;
            }

            if (!isDateFilterModifierPressed(event, settings.multiSelectModifier, isMobile)) {
                return false;
            }

            const dateToken = buildDateFilterToken(kind, date);
            if (!dateToken) {
                return false;
            }

            event.preventDefault();
            event.stopPropagation();
            clearHoverTooltip();
            onAddDateFilter(dateToken);
            return true;
        },
        [clearHoverTooltip, onAddDateFilter, settings.multiSelectModifier, isMobile]
    );

    const handleSelectYearMonth = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>, date: MomentInstance) => {
            if (handleDateFilterModifiedClick(event, 'month', date)) {
                return;
            }

            clearHoverTooltip();
            setCursorDate(date.clone().startOf('day').locale(displayLocale));
            setYearPanelYear(date.year());
            onNavigationAction?.();
        },
        [clearHoverTooltip, displayLocale, handleDateFilterModifiedClick, onNavigationAction]
    );

    const handleCalendarNoteMiddleMouseDown = useCallback(
        (event: React.MouseEvent<HTMLElement>): boolean => {
            if (event.button !== 1) {
                return false;
            }

            event.preventDefault();
            event.stopPropagation();
            clearHoverTooltip();
            return true;
        },
        [clearHoverTooltip]
    );

    const onVaultChange = useCallback(() => {
        scheduleVaultVersionUpdate();
    }, [scheduleVaultVersionUpdate]);

    const setCalendarMonthHighlight = useCallback(
        async (monthKey: string, dayIso: string) => {
            await updateSettings(targetSettings => {
                const nextHighlights = sanitizeRecord(targetSettings.calendarMonthHighlights, isStringRecordValue);
                nextHighlights[monthKey] = dayIso;
                targetSettings.calendarMonthHighlights = nextHighlights;
            });
        },
        [updateSettings]
    );

    const removeCalendarMonthHighlight = useCallback(
        async (monthKey: string) => {
            await updateSettings(targetSettings => {
                const nextHighlights = sanitizeRecord(targetSettings.calendarMonthHighlights, isStringRecordValue);
                delete nextHighlights[monthKey];
                targetSettings.calendarMonthHighlights = nextHighlights;
            });
        },
        [updateSettings]
    );
    const showMonthHighlightActions = settings.calendarShowFeatureImage && showYearCalendar;

    const { openOrCreateCustomCalendarNote, openOrCreateDailyNote, showCalendarNoteContextMenu } = useCalendarNoteActions({
        app,
        commandQueue,
        fileSystemOps,
        isMobile,
        settings,
        dailyNoteSettings,
        momentApi,
        dailyNoteLocale,
        calendarLocale: periodicNotesLocale,
        weekLocale: periodicNotesLocale,
        customCalendarRootFolderSettings,
        openFile,
        clearHoverTooltip,
        onVaultChange,
        showMonthHighlightActions,
        setCalendarMonthHighlight,
        removeCalendarMonthHighlight,
        resolveNoteTarget
    });

    const handleToday = useCallback(() => {
        if (!momentApi) {
            return;
        }

        const today = momentApi().startOf('day').locale(displayLocale);

        clearHoverTooltip();
        setCursorDate(today.clone());
        onNavigationAction?.();

        const note = getExistingDayNoteTarget(today);
        if (!note.existingFile) {
            return;
        }

        openOrCreateDailyNote(today);
    }, [clearHoverTooltip, displayLocale, getExistingDayNoteTarget, momentApi, onNavigationAction, openOrCreateDailyNote]);

    const showWeekNumbers = settings.calendarShowWeekNumber;
    const highlightToday = settings.calendarHighlightToday;
    const useRightSidebarYearHeaderInlineDetails = isRightSidebar && showYearCalendar;
    const showYearInHeader = !isRightSidebar || !showYearCalendar;
    const showHeaderHelpButton = settings.showInfoButtons && !isMobile && useRightSidebarYearHeaderInlineDetails;
    const showInlineMonthNavigation = false;
    const showCompactQuarterInMonthRow = useRightSidebarYearHeaderInlineDetails && settings.calendarShowQuarter;
    const showHeaderPeriodDetails = !useRightSidebarYearHeaderInlineDetails;
    const showHeaderNavRow = true;
    const showCompactHeaderInlineInfoButton = showHeaderHelpButton;
    const showInfoInNavRow = false;

    const displayedYear = yearPanelYear ?? cursorDate?.year() ?? null;

    const yearMonthBaseEntries = useMemo<CalendarYearMonthBaseEntry[]>(() => {
        if (!momentApi || displayedYear === null || !showYearCalendar) {
            return [];
        }

        // Force refresh when vault contents change so year month note coverage stays in sync.
        void vaultVersion;

        const entries: CalendarYearMonthBaseEntry[] = [];
        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
            const monthDate = momentApi(new Date(displayedYear, monthIndex, 1))
                .startOf('day')
                .locale(displayLocale);
            const daysInMonth = new Date(displayedYear, monthIndex + 1, 0).getDate();
            const dayFiles: TFile[] = [];
            const existingDayFiles: TFile[] = [];

            for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
                const dayDate = monthDate.clone().set({ date: dayNumber });
                const dayNoteTarget = getExistingDayNoteTarget(dayDate);
                const existingFile = dayNoteTarget.visibleFile;

                if (dayNoteTarget.existingFile) {
                    existingDayFiles.push(dayNoteTarget.existingFile);
                }

                if (existingFile) {
                    dayFiles.push(existingFile);
                }
            }

            entries.push({
                date: monthDate,
                dayFiles,
                existingDayFiles,
                fullLabel: monthDate.format('MMMM'),
                hasDailyNote: dayFiles.length > 0,
                key: monthDate.format('YYYY-MM'),
                monthIndex,
                shortLabel: monthDate.format('MMM')
            });
        }

        return entries;
    }, [displayLocale, displayedYear, getExistingDayNoteTarget, momentApi, showYearCalendar, vaultVersion]);

    const yearMonthEntries = useMemo<CalendarYearMonthEntry[]>(() => {
        // Force refresh when calendar task metadata changes so year month indicators stay in sync.
        void taskIndicatorVersion;

        return yearMonthBaseEntries.map(entry => ({
            date: entry.date,
            fullLabel: entry.fullLabel,
            hasDailyNote: entry.hasDailyNote,
            hasUnfinishedTasks:
                db && settings.calendarShowTasks ? entry.dayFiles.some(file => (db.getFile(file.path)?.taskUnfinished ?? 0) > 0) : false,
            key: entry.key,
            monthIndex: entry.monthIndex,
            shortLabel: entry.shortLabel
        }));
    }, [db, settings.calendarShowTasks, taskIndicatorVersion, yearMonthBaseEntries]);

    const highlightedMonthFilesByKey = useMemo(() => {
        const filesByKey = new Map<string, TFile>();

        if (!momentApi || !showYearCalendar) {
            return filesByKey;
        }

        void featureImageVersion;

        for (const entry of yearMonthBaseEntries) {
            const highlightedDayIso = settings.calendarMonthHighlights[entry.key] ?? null;
            if (highlightedDayIso) {
                const highlightedDay = momentApi(highlightedDayIso, 'YYYY-MM-DD', true);
                if (highlightedDay.isValid() && highlightedDay.format('YYYY-MM') === entry.key) {
                    const file = getExistingDayNoteTarget(highlightedDay.startOf('day')).visibleFile;
                    if (file) {
                        filesByKey.set(entry.key, file);
                    }
                }
                continue;
            }

            if (!entry.hasDailyNote) {
                continue;
            }

            if (!db) {
                continue;
            }

            for (const file of entry.dayFiles) {
                const record = db.getFile(file.path);
                const featureKey = record?.featureImageKey ?? null;
                const featureStatus = record?.featureImageStatus ?? null;
                if (featureStatus !== 'has' || !featureKey || featureKey === '') {
                    continue;
                }

                filesByKey.set(entry.key, file);
                break;
            }
        }

        return filesByKey;
    }, [
        db,
        featureImageVersion,
        getExistingDayNoteTarget,
        momentApi,
        settings.calendarMonthHighlights,
        showYearCalendar,
        yearMonthBaseEntries
    ]);

    const highlightedMonthFeatureImageTargets = useMemo<CalendarFeatureImageTarget[]>(() => {
        void featureImageVersion;

        const targets: CalendarFeatureImageTarget[] = [];

        if (!db || !settings.calendarShowFeatureImage) {
            return targets;
        }

        highlightedMonthFilesByKey.forEach((file, monthKey) => {
            const record = db.getFile(file.path);
            const featureKey = record?.featureImageKey ?? null;
            const featureStatus = record?.featureImageStatus ?? null;
            if (featureStatus !== 'has' || !featureKey || featureKey === '') {
                return;
            }

            targets.push({
                id: monthKey,
                file,
                key: featureKey
            });
        });

        return targets;
    }, [db, featureImageVersion, highlightedMonthFilesByKey, settings.calendarShowFeatureImage]);

    useEffect(() => {
        const activeKeys = new Set<string>();
        for (const target of [...dayFeatureImageTargets, ...highlightedMonthFeatureImageTargets]) {
            const regenerationKey = getCalendarFeatureImageRegenerationKey(target.file.path, target.key);
            if (regenerationKey) {
                activeKeys.add(regenerationKey);
            }
        }

        const pendingKeys = missingFeatureImageRegenerationRef.current;
        for (const key of pendingKeys) {
            if (!activeKeys.has(key)) {
                pendingKeys.delete(key);
            }
        }
    }, [dayFeatureImageTargets, highlightedMonthFeatureImageTargets]);

    const highlightedMonthFeatureImageKeys = useMemo(() => {
        const keys = new Set<string>();

        highlightedMonthFeatureImageTargets.forEach(target => {
            keys.add(target.id);
        });

        return keys;
    }, [highlightedMonthFeatureImageTargets]);

    const highlightedMonthWatchedNotePaths = useMemo(() => {
        const paths = new Set<string>();
        highlightedMonthFilesByKey.forEach(file => {
            paths.add(file.path);
        });
        return paths;
    }, [highlightedMonthFilesByKey]);

    const highlightedMonthImageUrls = useCalendarFeatureImages({
        db,
        showFeatureImages: settings.calendarShowFeatureImage && showYearCalendar,
        targets: highlightedMonthFeatureImageTargets,
        maxConcurrentLoads: isMobile ? 2 : 4,
        onMissingFeatureImage: handleMissingCalendarFeatureImage
    });

    const yearPanelDate = useMemo(() => {
        if (!momentApi || !cursorDate || displayedYear === null) {
            return null;
        }

        return cursorDate.clone().set({ year: displayedYear }).locale(displayLocale);
    }, [cursorDate, displayLocale, displayedYear, momentApi]);

    const headerPeriodNoteTargets = useMemo<CalendarHeaderPeriodNoteTargets>(() => {
        void vaultVersion;
        if (!momentApi || !cursorDate) {
            const emptyTarget = resolveNoteTarget(null, null);
            return { month: emptyTarget, quarter: emptyTarget, year: emptyTarget };
        }

        const date = cursorDate.clone().locale(displayLocale);

        const month = monthNotesEnabled ? getExistingCustomCalendarNoteTarget('month', date) : resolveNoteTarget(null, null);
        const year = yearNotesEnabled ? getExistingCustomCalendarNoteTarget('year', date) : resolveNoteTarget(null, null);
        const quarter =
            settings.calendarShowQuarter && quarterNotesEnabled
                ? getExistingCustomCalendarNoteTarget('quarter', date)
                : resolveNoteTarget(null, null);

        return { month, quarter, year };
    }, [
        cursorDate,
        displayLocale,
        getExistingCustomCalendarNoteTarget,
        momentApi,
        monthNotesEnabled,
        quarterNotesEnabled,
        settings.calendarShowQuarter,
        resolveNoteTarget,
        vaultVersion,
        yearNotesEnabled
    ]);

    const getHeaderPeriodState = useCallback(
        (kind: HeaderPeriodKind): { note: CalendarNoteTarget; canCreate: boolean } => {
            switch (kind) {
                case 'month':
                    return {
                        note: headerPeriodNoteTargets.month,
                        canCreate: monthNotesEnabled
                    };
                case 'quarter':
                    return {
                        note: headerPeriodNoteTargets.quarter,
                        canCreate: settings.calendarShowQuarter && quarterNotesEnabled
                    };
                case 'year':
                    return {
                        note: headerPeriodNoteTargets.year,
                        canCreate: yearNotesEnabled
                    };
            }
        },
        [
            headerPeriodNoteTargets.month,
            headerPeriodNoteTargets.quarter,
            headerPeriodNoteTargets.year,
            monthNotesEnabled,
            quarterNotesEnabled,
            settings.calendarShowQuarter,
            yearNotesEnabled
        ]
    );

    const handleHeaderPeriodClick = useCallback(
        (event: React.MouseEvent<HTMLElement>, kind: HeaderPeriodKind) => {
            if (event.button === 1) {
                return;
            }

            if (!cursorDate) {
                return;
            }

            const periodDate = cursorDate.clone().locale(displayLocale);
            if (handleDateFilterModifiedClick(event, kind, periodDate)) {
                return;
            }

            const { canCreate } = getHeaderPeriodState(kind);
            if (!canCreate) {
                return;
            }

            openOrCreateCustomCalendarNote(kind, periodDate);
        },
        [cursorDate, displayLocale, getHeaderPeriodState, handleDateFilterModifiedClick, openOrCreateCustomCalendarNote]
    );

    const handleHeaderPeriodMouseDown = useCallback(
        (event: React.MouseEvent<HTMLElement>, kind: HeaderPeriodKind) => {
            if (!handleCalendarNoteMiddleMouseDown(event) || !cursorDate) {
                return;
            }

            const periodDate = cursorDate.clone().locale(displayLocale);
            const { canCreate } = getHeaderPeriodState(kind);
            if (!canCreate) {
                return;
            }

            openOrCreateCustomCalendarNote(kind, periodDate, { context: 'tab' });
        },
        [cursorDate, displayLocale, getHeaderPeriodState, handleCalendarNoteMiddleMouseDown, openOrCreateCustomCalendarNote]
    );

    const handleHeaderPeriodContextMenu = useCallback(
        (event: React.MouseEvent<HTMLElement>, kind: HeaderPeriodKind) => {
            if (!cursorDate) {
                return;
            }

            const { note, canCreate } = getHeaderPeriodState(kind);
            showCalendarNoteContextMenu(event, {
                kind,
                date: cursorDate.clone().locale(displayLocale),
                note,
                canCreate
            });
        },
        [cursorDate, displayLocale, getHeaderPeriodState, showCalendarNoteContextMenu]
    );

    const yearPanelPeriodNoteTarget = useMemo(() => {
        void vaultVersion;
        if (!yearPanelDate || !yearNotesEnabled) {
            return resolveNoteTarget(null, null);
        }

        return getExistingCustomCalendarNoteTarget('year', yearPanelDate);
    }, [getExistingCustomCalendarNoteTarget, resolveNoteTarget, vaultVersion, yearNotesEnabled, yearPanelDate]);

    const handleYearPanelPeriodClick = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            if (event.button === 1) {
                return;
            }

            if (!yearPanelDate) {
                return;
            }

            if (handleDateFilterModifiedClick(event, 'year', yearPanelDate)) {
                return;
            }

            if (!yearNotesEnabled) {
                return;
            }

            openOrCreateCustomCalendarNote('year', yearPanelDate);
        },
        [handleDateFilterModifiedClick, openOrCreateCustomCalendarNote, yearNotesEnabled, yearPanelDate]
    );

    const handleYearPanelPeriodMouseDown = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            if (!handleCalendarNoteMiddleMouseDown(event) || !yearPanelDate) {
                return;
            }

            if (!yearNotesEnabled) {
                return;
            }

            openOrCreateCustomCalendarNote('year', yearPanelDate, { context: 'tab' });
        },
        [handleCalendarNoteMiddleMouseDown, openOrCreateCustomCalendarNote, yearNotesEnabled, yearPanelDate]
    );

    const handleYearPanelPeriodContextMenu = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            if (!yearPanelDate) {
                return;
            }

            showCalendarNoteContextMenu(event, {
                kind: 'year',
                date: yearPanelDate,
                note: yearPanelPeriodNoteTarget,
                canCreate: yearNotesEnabled
            });
        },
        [showCalendarNoteContextMenu, yearNotesEnabled, yearPanelDate, yearPanelPeriodNoteTarget]
    );

    const weekNoteTargetsByKey = useMemo(() => {
        void vaultVersion;
        if (!momentApi || !cursorDate) {
            return new Map<string, CalendarNoteTarget>();
        }

        if (!showWeekNumbers || !weekNotesEnabled) {
            return new Map<string, CalendarNoteTarget>();
        }

        const entries = new Map<string, CalendarNoteTarget>();
        for (const week of weeks) {
            const weekStart = week.days[0]?.date;
            if (!weekStart) {
                continue;
            }

            const weekDate = weekStart.clone().locale(displayLocale);
            const note = getExistingCustomCalendarNoteTarget('week', weekDate);

            entries.set(week.key, note);
        }

        return entries;
    }, [cursorDate, displayLocale, getExistingCustomCalendarNoteTarget, momentApi, showWeekNumbers, vaultVersion, weekNotesEnabled, weeks]);

    const weekUnfinishedTaskCountByKey = useMemo(() => {
        // Force refresh when calendar task metadata changes so week number task indicators reflect the latest metadata.
        void taskIndicatorVersion;

        if (!db || !settings.calendarShowTasks) {
            return new Map<string, number>();
        }

        const counts = new Map<string, number>();
        weekNoteTargetsByKey.forEach((note, weekKey) => {
            setUnfinishedTaskCount(counts, weekKey, note.visibleFile, db);
        });

        return counts;
    }, [db, settings.calendarShowTasks, taskIndicatorVersion, weekNoteTargetsByKey]);

    const visibleCalendarNoteFiles = useMemo(() => {
        const files = new Map<string, TFile>();

        for (const week of weeks) {
            for (const day of week.days) {
                const file = day.note.visibleFile;
                if (file) {
                    files.set(file.path, file);
                }
            }
        }

        weekNoteTargetsByKey.forEach(note => {
            const file = note.visibleFile;
            if (file) {
                files.set(file.path, file);
            }
        });

        for (const entry of yearMonthBaseEntries) {
            for (const file of entry.dayFiles) {
                files.set(file.path, file);
            }
        }

        return Array.from(files.values()).filter(file => file.extension === 'md');
    }, [weekNoteTargetsByKey, weeks, yearMonthBaseEntries]);

    const profileVisibilityNotePaths = useMemo(() => {
        const paths = new Set<string>();
        const addTarget = (target: CalendarNoteTarget) => {
            if (target.existingFile) {
                paths.add(target.existingFile.path);
            }
        };

        for (const week of weeks) {
            for (const day of week.days) {
                addTarget(day.note);
            }
        }

        for (const entry of yearMonthBaseEntries) {
            for (const file of entry.existingDayFiles) {
                paths.add(file.path);
            }
        }

        weekNoteTargetsByKey.forEach(addTarget);
        addTarget(headerPeriodNoteTargets.month);
        addTarget(headerPeriodNoteTargets.quarter);
        addTarget(headerPeriodNoteTargets.year);
        addTarget(yearPanelPeriodNoteTarget);

        // The active editor may resolve outside the currently rendered month or year panel.
        if (activeEditorFilePath) {
            paths.add(activeEditorFilePath);
        }

        return paths;
    }, [activeEditorFilePath, headerPeriodNoteTargets, weekNoteTargetsByKey, weeks, yearMonthBaseEntries, yearPanelPeriodNoteTarget]);
    profileVisibilityNotePathsRef.current = profileVisibilityNotePaths;

    useEffect(() => {
        onVisibleCalendarNoteFilesChange?.(visibleCalendarNoteFiles);
    }, [onVisibleCalendarNoteFilesChange, visibleCalendarNoteFiles]);

    const visibleIndicatorNotePaths = useMemo(() => {
        const paths = new Set<string>();
        visibleCalendarNoteFiles.forEach(file => {
            paths.add(file.path);
        });
        return paths;
    }, [visibleCalendarNoteFiles]);
    visibleIndicatorNotePathsRef.current = visibleIndicatorNotePaths;
    const visibleFeatureImageNotePaths = useMemo(() => {
        const paths = new Set<string>(visibleDayNotePaths);
        highlightedMonthWatchedNotePaths.forEach(path => {
            paths.add(path);
        });
        return paths;
    }, [highlightedMonthWatchedNotePaths, visibleDayNotePaths]);
    visibleFeatureImageNotePathsRef.current = visibleFeatureImageNotePaths;
    visibleFrontmatterNotePathsRef.current = visibleDayNotePaths;

    const handleWeekClick = useCallback(
        (event: React.MouseEvent<HTMLElement>, week: CalendarWeek) => {
            if (event.button === 1) {
                return;
            }

            const weekStart = week.days[0]?.date;
            if (!weekStart) {
                return;
            }

            const weekDate = weekStart.clone().locale(displayLocale);
            if (handleDateFilterModifiedClick(event, 'week', weekDate)) {
                return;
            }

            if (!weekNotesEnabled) {
                return;
            }

            openOrCreateCustomCalendarNote('week', weekDate);
        },
        [displayLocale, handleDateFilterModifiedClick, openOrCreateCustomCalendarNote, weekNotesEnabled]
    );

    const handleWeekMouseDown = useCallback(
        (event: React.MouseEvent<HTMLElement>, week: CalendarWeek) => {
            if (!handleCalendarNoteMiddleMouseDown(event)) {
                return;
            }

            const weekStart = week.days[0]?.date;
            if (!weekStart) {
                return;
            }

            if (!weekNotesEnabled) {
                return;
            }

            openOrCreateCustomCalendarNote('week', weekStart.clone().locale(displayLocale), { context: 'tab' });
        },
        [displayLocale, handleCalendarNoteMiddleMouseDown, openOrCreateCustomCalendarNote, weekNotesEnabled]
    );

    const handleWeekLabelClick = useCallback(
        (event: React.MouseEvent<HTMLElement>, week: CalendarWeek) => {
            const weekStart = week.days[0]?.date;
            if (!weekStart) {
                return;
            }

            handleDateFilterModifiedClick(event, 'week', weekStart.clone().locale(displayLocale));
        },
        [displayLocale, handleDateFilterModifiedClick]
    );

    const handleWeekContextMenu = useCallback(
        (event: React.MouseEvent<HTMLElement>, week: CalendarWeek, note: CalendarNoteTarget | null) => {
            const weekStart = week.days[0]?.date;
            if (!weekStart) {
                return;
            }

            showCalendarNoteContextMenu(event, {
                kind: 'week',
                date: weekStart.clone().locale(displayLocale),
                note: note ?? resolveNoteTarget(null, null),
                canCreate: weekNotesEnabled
            });
        },
        [displayLocale, resolveNoteTarget, showCalendarNoteContextMenu, weekNotesEnabled]
    );

    const handleDayClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>, day: CalendarWeek['days'][number]) => {
            if (event.button === 1) {
                return;
            }

            if (handleDateFilterModifiedClick(event, 'day', day.date)) {
                return;
            }

            openOrCreateDailyNote(day.date);
        },
        [handleDateFilterModifiedClick, openOrCreateDailyNote]
    );

    const handleDayMouseDown = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>, day: CalendarWeek['days'][number]) => {
            if (!handleCalendarNoteMiddleMouseDown(event)) {
                return;
            }

            openOrCreateDailyNote(day.date, { context: 'tab' });
        },
        [handleCalendarNoteMiddleMouseDown, openOrCreateDailyNote]
    );

    const handleDayContextMenu = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>, day: CalendarWeek['days'][number], canCreate: boolean, hasFeatureImage: boolean) => {
            const monthKey = day.date.format('YYYY-MM');
            showCalendarNoteContextMenu(event, {
                kind: 'day',
                date: day.date,
                note: day.note,
                canCreate,
                monthKey,
                dayIso: day.iso,
                hasFeatureImage,
                currentMonthHighlightDayIso: settings.calendarMonthHighlights[monthKey] ?? null
            });
        },
        [settings.calendarMonthHighlights, showCalendarNoteContextMenu]
    );

    if (!momentApi || !cursorDate) {
        return null;
    }

    const activeYearValue = cursorDate.year();
    const currentMonthKey = todayIso ? todayIso.slice(0, 7) : null;
    const monthYearHeaderDate = cursorDate.clone().locale(displayLocale);
    const monthHeadingFormat = settings.calendarMonthHeadingFormat === 'short' ? 'MMM' : 'MMMM';
    const monthLabel = monthYearHeaderDate.format(monthHeadingFormat);
    const yearLabel = monthYearHeaderDate.format('YYYY');
    const quarterLabel = monthYearHeaderDate.format('[Q]Q');
    const canCreateDayNotes = settings.calendarIntegrationMode !== 'daily-notes' || Boolean(dailyNoteSettings);
    const isMonthPeriodActive = Boolean(activeEditorFilePath && headerPeriodNoteTargets.month.visibleFile?.path === activeEditorFilePath);
    const isQuarterPeriodActive = Boolean(
        activeEditorFilePath && headerPeriodNoteTargets.quarter.visibleFile?.path === activeEditorFilePath
    );
    const isYearPeriodActive = Boolean(activeEditorFilePath && headerPeriodNoteTargets.year.visibleFile?.path === activeEditorFilePath);
    const isYearPanelPeriodActive = Boolean(activeEditorFilePath && yearPanelPeriodNoteTarget.visibleFile?.path === activeEditorFilePath);

    return (
        <>
            <CalendarHoverTooltip
                isMobile={isMobile}
                hoverTooltip={hoverTooltip}
                hoverTooltipStyle={hoverTooltipStyle}
                hoverTooltipRef={hoverTooltipRef}
                hoverTooltipPreviewText={hoverTooltipPreviewText}
                shouldShowHoverTooltipPreview={shouldShowHoverTooltipPreview}
                hoverTooltipDateText={hoverTooltipDateText}
            />
            <div
                className="nn-navigation-calendar"
                role="group"
                aria-labelledby={calendarLabelId}
                data-highlight-today={highlightToday ? 'true' : undefined}
                data-weeknumbers={showWeekNumbers ? 'true' : undefined}
                data-split-header="true"
            >
                <span id={calendarLabelId} className="nn-visually-hidden">
                    {strings.navigationCalendar.ariaLabel}
                </span>
                <CalendarHeader
                    monthLabel={monthLabel}
                    yearLabel={yearLabel}
                    quarterLabel={quarterLabel}
                    showYearInHeader={showYearInHeader}
                    showQuarter={settings.calendarShowQuarter}
                    hasMonthPeriodNote={Boolean(headerPeriodNoteTargets.month.visibleFile)}
                    hasQuarterPeriodNote={Boolean(headerPeriodNoteTargets.quarter.visibleFile)}
                    hasYearPeriodNote={Boolean(headerPeriodNoteTargets.year.visibleFile)}
                    isMonthPeriodActive={isMonthPeriodActive}
                    isQuarterPeriodActive={isQuarterPeriodActive}
                    isYearPeriodActive={isYearPeriodActive}
                    showInlineMonthNavigation={showInlineMonthNavigation}
                    showCompactQuarterInMonthRow={showCompactQuarterInMonthRow}
                    showHeaderPeriodDetails={showHeaderPeriodDetails}
                    showHeaderNavRow={showHeaderNavRow}
                    showCompactHeaderInlineInfoButton={showCompactHeaderInlineInfoButton}
                    showInfoInNavRow={showInfoInNavRow}
                    onNavigate={handleNavigate}
                    onToday={handleToday}
                    onOpenHelp={openCalendarHelp}
                    onPeriodClick={handleHeaderPeriodClick}
                    onPeriodMouseDown={handleHeaderPeriodMouseDown}
                    onPeriodContextMenu={handleHeaderPeriodContextMenu}
                />

                <CalendarGrid
                    activeEditorFilePath={activeEditorFilePath}
                    showWeekNumbers={showWeekNumbers}
                    weekdays={weekdays}
                    weekStartsOn={weekStartsOn}
                    trailingSpacerWeekCount={trailingSpacerWeekCount}
                    weeks={weeks}
                    weekNotesEnabled={weekNotesEnabled}
                    weekNoteTargetsByKey={weekNoteTargetsByKey}
                    weekUnfinishedTaskCountByKey={weekUnfinishedTaskCountByKey}
                    displayLocale={displayLocale}
                    calendarWeekendDays={settings.calendarWeekendDays}
                    todayIso={todayIso}
                    unfinishedTaskCountByIso={unfinishedTaskCountByIso}
                    featureImageUrls={featureImageUrls}
                    featureImageKeysByIso={featureImageKeysByIso}
                    frontmatterTitlesByPath={frontmatterTitlesByPath}
                    dateFormat={settings.dateFormat}
                    isMobile={isMobile}
                    canCreateDayNotes={canCreateDayNotes}
                    onShowTooltip={handleShowTooltip}
                    onHideTooltip={handleHideTooltip}
                    onDayClick={handleDayClick}
                    onDayMouseDown={handleDayMouseDown}
                    onDayContextMenu={handleDayContextMenu}
                    onWeekClick={handleWeekClick}
                    onWeekMouseDown={handleWeekMouseDown}
                    onWeekLabelClick={handleWeekLabelClick}
                    onWeekContextMenu={handleWeekContextMenu}
                />

                <CalendarYearPanel
                    showYearCalendar={showYearCalendar}
                    currentMonthKey={currentMonthKey}
                    displayedYearValue={displayedYear ?? activeYearValue}
                    activeYearValue={activeYearValue}
                    activeMonthIndex={cursorDate.month()}
                    hasYearPeriodNote={Boolean(yearPanelPeriodNoteTarget.visibleFile)}
                    isYearPeriodActive={isYearPanelPeriodActive}
                    yearMonthEntries={yearMonthEntries}
                    highlightedMonthFeatureImageKeys={highlightedMonthFeatureImageKeys}
                    highlightedMonthImageUrls={highlightedMonthImageUrls}
                    onNavigateYear={handleNavigateYear}
                    onYearPeriodClick={handleYearPanelPeriodClick}
                    onYearPeriodMouseDown={handleYearPanelPeriodMouseDown}
                    onYearPeriodContextMenu={handleYearPanelPeriodContextMenu}
                    onSelectYearMonth={handleSelectYearMonth}
                />
            </div>
        </>
    );
}
