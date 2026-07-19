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

import React from 'react';
import { Root, createRoot } from 'react-dom/client';
import { ItemView, Platform, WorkspaceLeaf } from 'obsidian';
import { SettingsProvider } from '../context/SettingsContext';
import { UXPreferencesProvider } from '../context/UXPreferencesContext';
import { ServicesProvider } from '../context/ServicesContext';
import { CalendarRightSidebar } from '../components/CalendarRightSidebar';
import { NOTEBOOK_NAVIGATOR_ICON_ID } from '../constants/notebookNavigatorIcon';
import { strings } from '../i18n';
import type NotebookNavigatorPlugin from '../main';
import { NOTEBOOK_NAVIGATOR_CALENDAR_VIEW } from '../types';
import {
    IOS_FLOATING_TOOLBARS_CLASS,
    setupNotebookNavigatorViewContainer,
    teardownNotebookNavigatorViewContainer
} from './NotebookNavigatorView';

let calendarViewInstanceCounter = 0;

export class NotebookNavigatorCalendarView extends ItemView {
    private readonly plugin: NotebookNavigatorPlugin;
    private root: Root | null = null;
    private readonly settingsUpdateListenerId: string;
    private viewContainer: HTMLElement | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: NotebookNavigatorPlugin) {
        super(leaf);
        this.plugin = plugin;
        calendarViewInstanceCounter += 1;
        this.settingsUpdateListenerId = `notebook-navigator-calendar-view-${calendarViewInstanceCounter}`;
    }

    private updatePlatformClasses(): void {
        const container = this.viewContainer;
        if (!container) {
            return;
        }

        const shouldUseFloatingToolbars = Platform.isIosApp && this.plugin.settings.useFloatingToolbars;
        container.classList.toggle(IOS_FLOATING_TOOLBARS_CLASS, shouldUseFloatingToolbars);
    }

    getViewType() {
        return NOTEBOOK_NAVIGATOR_CALENDAR_VIEW;
    }

    getDisplayText() {
        return strings.plugin.calendarViewName;
    }

    getIcon() {
        return NOTEBOOK_NAVIGATOR_ICON_ID;
    }

    async onOpen() {
        if (!this.plugin.settings.calendarEnabled) {
            this.leaf.detach();
            return;
        }

        const container = this.containerEl.children[1];
        if (!container.instanceOf(HTMLElement)) {
            return;
        }

        this.viewContainer = container;
        setupNotebookNavigatorViewContainer(container, { useFloatingToolbars: this.plugin.settings.useFloatingToolbars });
        this.plugin.registerSettingsUpdateListener(this.settingsUpdateListenerId, () => {
            this.updatePlatformClasses();
        });
        this.updatePlatformClasses();

        this.root = createRoot(container);
        this.root.render(
            <React.StrictMode>
                <SettingsProvider plugin={this.plugin}>
                    <UXPreferencesProvider plugin={this.plugin}>
                        <ServicesProvider plugin={this.plugin}>
                            <CalendarRightSidebar />
                        </ServicesProvider>
                    </UXPreferencesProvider>
                </SettingsProvider>
            </React.StrictMode>
        );
    }

    async onClose() {
        this.plugin.unregisterSettingsUpdateListener(this.settingsUpdateListenerId);
        this.viewContainer = null;

        const container = this.containerEl.children[1];
        if (!container.instanceOf(HTMLElement)) {
            return;
        }

        this.root?.unmount();
        teardownNotebookNavigatorViewContainer(container);
        this.root = null;
    }

    stopContentProcessing() {
        this.root?.unmount();
        this.root = null;
    }
}
