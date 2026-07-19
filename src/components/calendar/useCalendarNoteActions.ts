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

import React, { useCallback, useRef } from 'react';
import { App, Menu, TFile, type PaneType } from 'obsidian';
import { strings } from '../../i18n';
import { ConfirmModal } from '../../modals/ConfirmModal';
import type { CommandQueueService } from '../../services/CommandQueueService';
import type { FileSystemOperations } from '../../services/FileSystemService';
import type { NotebookNavigatorSettings } from '../../settings/types';
import { runAsyncAction } from '../../utils/async';
import { createDailyNote, getDailyNoteFilename, getDailyNotePath, type DailyNoteSettings } from '../../utils/dailyNotes';
import { setAsyncOnClick } from '../../utils/contextMenu/menuAsyncHelpers';
import { showNotice } from '../../utils/noticeUtils';
import { openFileInContext } from '../../utils/openFileInContext';
import { createCalendarMarkdownFile, getCalendarTemplatePath } from '../../utils/calendarNotes';
import type { MomentApi, MomentInstance } from '../../utils/moment';
import { resolveUXIconForMenu } from '../../utils/uxIcons';
import type { CalendarNoteContextMenuTarget, CalendarNoteTarget, CustomCalendarNoteKind } from './types';
import {
    createCalendarNotePathResolverContext,
    resolveCalendarNotePath,
    type CalendarNoteRootFolderSettings
} from './calendarNoteResolution';

interface UseCalendarNoteActionsOptions {
    app: App;
    commandQueue: CommandQueueService | null;
    fileSystemOps: FileSystemOperations;
    isMobile: boolean;
    settings: NotebookNavigatorSettings;
    dailyNoteSettings: DailyNoteSettings | null;
    momentApi: MomentApi | null;
    dailyNoteLocale: string;
    calendarLocale: string;
    weekLocale: string;
    customCalendarRootFolderSettings: CalendarNoteRootFolderSettings;
    openFile: (file: TFile | null, options?: { active?: boolean }) => void;
    clearHoverTooltip: () => void;
    onVaultChange: () => void;
    showMonthHighlightActions: boolean;
    setCalendarMonthHighlight: (monthKey: string, dayIso: string) => Promise<void>;
    removeCalendarMonthHighlight: (monthKey: string) => Promise<void>;
    resolveNoteTarget: (targetPath: string | null, existingFile: TFile | null) => CalendarNoteTarget;
}

interface CalendarNoteOpenOptions {
    context?: PaneType;
}

interface UseCalendarNoteActionsResult {
    openOrCreateCustomCalendarNote: (kind: CustomCalendarNoteKind, date: MomentInstance, options?: CalendarNoteOpenOptions) => void;
    openOrCreateDailyNote: (date: MomentInstance, options?: CalendarNoteOpenOptions) => void;
    showCalendarNoteContextMenu: (event: React.MouseEvent<HTMLElement>, target: CalendarNoteContextMenuTarget) => void;
}

export function useCalendarNoteActions({
    app,
    commandQueue,
    fileSystemOps,
    isMobile,
    settings,
    dailyNoteSettings,
    momentApi,
    dailyNoteLocale,
    calendarLocale,
    weekLocale,
    customCalendarRootFolderSettings,
    openFile,
    clearHoverTooltip,
    onVaultChange,
    showMonthHighlightActions,
    setCalendarMonthHighlight,
    removeCalendarMonthHighlight,
    resolveNoteTarget
}: UseCalendarNoteActionsOptions): UseCalendarNoteActionsResult {
    // Confirmation callbacks can outlive the render that opened the modal, so they must read the current profile resolver.
    const resolveNoteTargetRef = useRef(resolveNoteTarget);
    resolveNoteTargetRef.current = resolveNoteTarget;

    const collapseNavigationIfMobile = useCallback(() => {
        if (!isMobile || !app.workspace.leftSplit) {
            return;
        }

        // On mobile, opening a daily note should feel like navigating away from the sidebar.
        app.workspace.leftSplit.collapse();
    }, [app, isMobile]);

    const getCustomCalendarResolverContext = useCallback(
        (kind: CustomCalendarNoteKind) => createCalendarNotePathResolverContext(kind, settings),
        [settings]
    );

    const openCalendarNoteFile = useCallback(
        async (file: TFile, options?: CalendarNoteOpenOptions) => {
            if (options?.context) {
                await openFileInContext({ app, commandQueue, file, context: options.context });
                return;
            }

            openFile(file, { active: true });
        },
        [app, commandQueue, openFile]
    );

    const resolveLatestNoteTarget = useCallback(
        (targetPath: string): CalendarNoteTarget => {
            const existing = app.vault.getAbstractFileByPath(targetPath);
            return resolveNoteTargetRef.current(targetPath, existing instanceof TFile ? existing : null);
        },
        [app.vault]
    );

    const openOrCreateCustomCalendarNote = useCallback(
        (kind: CustomCalendarNoteKind, date: MomentInstance, options?: CalendarNoteOpenOptions) => {
            const resolverContext = getCustomCalendarResolverContext(kind);
            const resolvedPath = resolveCalendarNotePath({
                kind,
                date,
                resolverContext,
                calendarLocale,
                weekLocale,
                customCalendarRootFolderSettings,
                momentApi
            });
            if (!resolvedPath) {
                showNotice(resolverContext.config.parsingErrorText);
                return;
            }

            clearHoverTooltip();

            const target = resolveLatestNoteTarget(resolvedPath.filePath);
            if (target.isHidden) {
                showNotice(strings.navigationCalendar.noteHiddenByProfile);
                return;
            }
            const visibleFile = target.visibleFile;
            if (visibleFile) {
                runAsyncAction(() => openCalendarNoteFile(visibleFile, options));
                collapseNavigationIfMobile();
                return;
            }

            const createCustomNote = async () => {
                const latestTarget = resolveLatestNoteTarget(resolvedPath.filePath);
                if (latestTarget.isHidden) {
                    showNotice(strings.navigationCalendar.noteHiddenByProfile);
                    return;
                }
                if (latestTarget.visibleFile) {
                    await openCalendarNoteFile(latestTarget.visibleFile, options);
                    collapseNavigationIfMobile();
                    return;
                }

                let created: TFile;
                try {
                    const templatePath = getCalendarTemplatePath(kind, settings);
                    created = await createCalendarMarkdownFile(app, resolvedPath.folderPath, resolvedPath.fileName, templatePath);
                } catch (error) {
                    console.error('Failed to create calendar note', error);
                    showNotice(strings.common.unknownError);
                    return;
                }

                onVaultChange();
                await openCalendarNoteFile(created, options);
                collapseNavigationIfMobile();
            };

            const createFile = () => runAsyncAction(() => createCustomNote());

            if (settings.calendarConfirmBeforeCreate) {
                new ConfirmModal(
                    app,
                    strings.paneHeader.newNote,
                    strings.navigationCalendar.createDailyNote.message.replace('{filename}', resolvedPath.filePath),
                    createFile,
                    strings.navigationCalendar.createDailyNote.confirmButton,
                    { confirmButtonClass: 'mod-cta' }
                ).open();
                return;
            }

            createFile();
        },
        [
            app,
            clearHoverTooltip,
            collapseNavigationIfMobile,
            customCalendarRootFolderSettings,
            calendarLocale,
            getCustomCalendarResolverContext,
            momentApi,
            onVaultChange,
            openCalendarNoteFile,
            resolveLatestNoteTarget,
            settings,
            weekLocale
        ]
    );

    const openOrCreateDailyNote = useCallback(
        (date: MomentInstance, options?: CalendarNoteOpenOptions) => {
            if (settings.calendarIntegrationMode === 'daily-notes') {
                const resolvedDailySettings = dailyNoteSettings;
                if (!resolvedDailySettings) {
                    showNotice(strings.navigationCalendar.dailyNotesNotEnabled);
                    return;
                }

                const localizedDate = date.clone().locale(dailyNoteLocale);
                const filename = getDailyNoteFilename(localizedDate, resolvedDailySettings);
                const targetPath = getDailyNotePath(localizedDate, resolvedDailySettings);
                const target = resolveLatestNoteTarget(targetPath);
                if (target.isHidden) {
                    showNotice(strings.navigationCalendar.noteHiddenByProfile);
                    return;
                }
                const visibleFile = target.visibleFile;
                if (visibleFile) {
                    runAsyncAction(() => openCalendarNoteFile(visibleFile, options));
                    collapseNavigationIfMobile();
                    return;
                }

                const createFile = async () => {
                    const latestTarget = resolveLatestNoteTarget(targetPath);
                    if (latestTarget.isHidden) {
                        showNotice(strings.navigationCalendar.noteHiddenByProfile);
                        return;
                    }
                    if (latestTarget.visibleFile) {
                        await openCalendarNoteFile(latestTarget.visibleFile, options);
                        collapseNavigationIfMobile();
                        return;
                    }

                    const created = await createDailyNote(app, localizedDate, resolvedDailySettings);
                    if (!created) {
                        return;
                    }

                    onVaultChange();
                    await openCalendarNoteFile(created, options);
                    collapseNavigationIfMobile();
                };

                if (settings.calendarConfirmBeforeCreate) {
                    new ConfirmModal(
                        app,
                        strings.navigationCalendar.createDailyNote.title,
                        strings.navigationCalendar.createDailyNote.message.replace('{filename}', filename),
                        () => {
                            runAsyncAction(createFile);
                        },
                        strings.navigationCalendar.createDailyNote.confirmButton,
                        { confirmButtonClass: 'mod-cta' }
                    ).open();
                    return;
                }

                runAsyncAction(() => createFile());
                return;
            }

            openOrCreateCustomCalendarNote('day', date, options);
        },
        [
            app,
            collapseNavigationIfMobile,
            dailyNoteLocale,
            dailyNoteSettings,
            onVaultChange,
            openCalendarNoteFile,
            openOrCreateCustomCalendarNote,
            resolveLatestNoteTarget,
            settings
        ]
    );

    const addCalendarNoteOpenOptions = useCallback(
        (menu: Menu, file: TFile) => {
            menu.addItem(item => {
                setAsyncOnClick(item.setTitle(strings.contextMenu.file.openInNewTab).setIcon('lucide-file-plus'), async () => {
                    await openFileInContext({ app, commandQueue, file, context: 'tab' });
                });
            });

            menu.addItem(item => {
                setAsyncOnClick(item.setTitle(strings.contextMenu.file.openToRight).setIcon('lucide-separator-vertical'), async () => {
                    await openFileInContext({ app, commandQueue, file, context: 'split' });
                });
            });

            if (!isMobile) {
                menu.addItem(item => {
                    setAsyncOnClick(item.setTitle(strings.contextMenu.file.openInNewWindow).setIcon('lucide-external-link'), async () => {
                        await openFileInContext({ app, commandQueue, file, context: 'window' });
                    });
                });
            }
        },
        [app, commandQueue, isMobile]
    );

    const showCalendarNoteContextMenu = useCallback(
        (event: React.MouseEvent<HTMLElement>, target: CalendarNoteContextMenuTarget) => {
            event.preventDefault();
            event.stopPropagation();

            clearHoverTooltip();

            if (target.note.isHidden) {
                showNotice(strings.navigationCalendar.noteHiddenByProfile);
                return;
            }

            const menu = new Menu();
            const isCurrentMonthHighlight = target.currentMonthHighlightDayIso === target.dayIso;
            const existingFile = target.note.visibleFile;

            if (existingFile) {
                addCalendarNoteOpenOptions(menu, existingFile);
                menu.addSeparator();
            }

            let hasHighlightMenuItem = false;

            if (showMonthHighlightActions && target.kind === 'day' && target.hasFeatureImage && target.monthKey && target.dayIso) {
                const { monthKey, dayIso } = target;
                if (!isCurrentMonthHighlight) {
                    hasHighlightMenuItem = true;
                    menu.addItem(item => {
                        item.setTitle(strings.contextMenu.file.setCalendarHighlight)
                            .setIcon('lucide-image')
                            .onClick(() => {
                                runAsyncAction(() => setCalendarMonthHighlight(monthKey, dayIso));
                            });
                    });
                }

                if (isCurrentMonthHighlight) {
                    hasHighlightMenuItem = true;
                    menu.addItem(item => {
                        item.setTitle(strings.contextMenu.file.removeCalendarHighlight)
                            .setIcon('lucide-image-off')
                            .onClick(() => {
                                runAsyncAction(() => removeCalendarMonthHighlight(monthKey));
                            });
                    });
                }
            }

            if (existingFile) {
                if (hasHighlightMenuItem) {
                    menu.addSeparator();
                }
                menu.addItem(item => {
                    item.setTitle(strings.contextMenu.file.deleteNote)
                        .setIcon('lucide-trash')
                        .setWarning(true)
                        .onClick(() => {
                            runAsyncAction(() =>
                                fileSystemOps.deleteFile(existingFile, settings.confirmBeforeDelete, () => {
                                    onVaultChange();
                                    collapseNavigationIfMobile();
                                })
                            );
                        });
                });
            } else {
                menu.addItem(item => {
                    item.setTitle(strings.contextMenu.folder.newNote)
                        .setIcon(resolveUXIconForMenu(settings.interfaceIcons, 'list-new-note', 'lucide-pen-box'))
                        .setDisabled(!target.canCreate)
                        .onClick(() => {
                            if (!target.canCreate) {
                                return;
                            }

                            if (target.kind === 'day') {
                                runAsyncAction(() => openOrCreateDailyNote(target.date));
                                return;
                            }

                            runAsyncAction(() => openOrCreateCustomCalendarNote(target.kind, target.date));
                        });
                });
            }

            menu.showAtMouseEvent(event.nativeEvent);
        },
        [
            addCalendarNoteOpenOptions,
            clearHoverTooltip,
            collapseNavigationIfMobile,
            fileSystemOps,
            onVaultChange,
            openOrCreateCustomCalendarNote,
            openOrCreateDailyNote,
            removeCalendarMonthHighlight,
            setCalendarMonthHighlight,
            showMonthHighlightActions,
            settings.confirmBeforeDelete,
            settings.interfaceIcons
        ]
    );

    return {
        openOrCreateCustomCalendarNote,
        openOrCreateDailyNote,
        showCalendarNoteContextMenu
    };
}
