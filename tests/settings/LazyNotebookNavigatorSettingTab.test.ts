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

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { App, Plugin, type SettingDefinitionItem } from 'obsidian';
import type NotebookNavigatorPlugin from '../../src/main';
import { LazyNotebookNavigatorSettingTab } from '../../src/settings/LazyNotebookNavigatorSettingTab';
import type { NotebookNavigatorSettingTab } from '../../src/settings';

const language = vi.hoisted(() => ({ strings: {} }));
vi.mock('../../src/i18n', () => ({
    get strings() {
        return language.strings;
    }
}));

interface MockSettingTabDelegate {
    containerEl: HTMLElement;
    getSettingDefinitions: () => SettingDefinitionItem[];
    getControlValue: (key: string) => unknown;
    setControlValue: (key: string, value: unknown) => Promise<void>;
    display: () => void;
    hide: () => void;
}

function createPlugin(): NotebookNavigatorPlugin {
    const app = new App();
    return new Plugin(app, { id: 'notebook-navigator' }) as NotebookNavigatorPlugin;
}

function createContainer(isConnected: boolean): HTMLElement {
    return { isConnected } as HTMLElement;
}

function createDelegate(): MockSettingTabDelegate {
    return {
        containerEl: createContainer(false),
        getSettingDefinitions: vi.fn(() => [{ type: 'render', name: 'Mock setting' } as SettingDefinitionItem]),
        getControlValue: vi.fn((key: string) => `value:${key}`),
        setControlValue: vi.fn(async () => {}),
        display: vi.fn(),
        hide: vi.fn()
    };
}

class TestLazyNotebookNavigatorSettingTab extends LazyNotebookNavigatorSettingTab {
    constructor(
        app: App,
        plugin: NotebookNavigatorPlugin,
        private readonly delegateFactory: () => MockSettingTabDelegate
    ) {
        super(app, plugin);
    }

    protected createDelegate(): NotebookNavigatorSettingTab {
        return this.delegateFactory() as unknown as NotebookNavigatorSettingTab;
    }
}

describe('LazyNotebookNavigatorSettingTab', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('refreshes cached native definitions when the language changes while settings are closed', () => {
        const plugin = createPlugin();
        const delegate = createDelegate();
        const tab = new TestLazyNotebookNavigatorSettingTab(plugin.app, plugin, () => delegate);
        tab.containerEl = createContainer(false);
        const update = vi.fn(() => tab.getSettingDefinitions());
        Reflect.set(tab, 'update', update);
        language.strings = {};
        tab.refreshLanguage();
        expect(update).not.toHaveBeenCalled();
        tab.getSettingDefinitions();

        tab.refreshLanguage();
        expect(update).not.toHaveBeenCalled();
        language.strings = {};
        tab.refreshLanguage();
        expect(update).toHaveBeenCalledOnce();
        tab.refreshLanguage();
        expect(update).toHaveBeenCalledOnce();
    });

    it('preserves an open form and refreshes after Obsidian finishes closing the tab', () => {
        vi.useFakeTimers();
        const plugin = createPlugin();
        const isShuttingDown = vi.fn(() => false);
        Reflect.set(plugin, 'isShuttingDown', isShuttingDown);
        const delegate = createDelegate();
        const tab = new TestLazyNotebookNavigatorSettingTab(plugin.app, plugin, () => delegate);
        tab.containerEl = createContainer(true);
        const update = vi.fn(() => tab.getSettingDefinitions());
        Reflect.set(tab, 'update', update);
        tab.getSettingDefinitions();

        language.strings = {};
        tab.refreshLanguage();
        expect(update).not.toHaveBeenCalled();
        tab.hide();
        expect(delegate.hide).toHaveBeenCalledOnce();
        expect(update).not.toHaveBeenCalled();
        tab.containerEl = createContainer(false);
        vi.runAllTimers();
        expect(update).toHaveBeenCalledOnce();

        tab.containerEl = createContainer(true);
        language.strings = {};
        tab.refreshLanguage();
        tab.hide();
        isShuttingDown.mockReturnValue(true);
        vi.runAllTimers();
        expect(update).toHaveBeenCalledOnce();
    });

    it('loads settings definitions while the settings container is disconnected', () => {
        const plugin = createPlugin();
        const delegate = createDelegate();
        const tab = new TestLazyNotebookNavigatorSettingTab(plugin.app, plugin, () => delegate);
        const containerEl = createContainer(false);
        tab.containerEl = containerEl;

        const definitions = tab.getSettingDefinitions();

        expect(definitions).toEqual([{ type: 'render', name: 'Mock setting' }]);
        expect(delegate.containerEl).toBe(containerEl);
    });

    it('shares the registered tab container with the delegate before returning definitions', () => {
        const plugin = createPlugin();
        const tab = new LazyNotebookNavigatorSettingTab(plugin.app, plugin);
        const delegate = createDelegate();
        const containerEl = createContainer(true);
        tab.containerEl = containerEl;
        Reflect.set(tab, 'delegate', delegate);

        const definitions = tab.getSettingDefinitions();

        expect(definitions).toEqual([{ type: 'render', name: 'Mock setting' }]);
        expect(delegate.containerEl).toBe(containerEl);
    });

    it('renders the fallback settings UI through the registered tab container', () => {
        const plugin = createPlugin();
        const tab = new LazyNotebookNavigatorSettingTab(plugin.app, plugin);
        const delegate = createDelegate();
        const containerEl = createContainer(true);
        tab.containerEl = containerEl;
        Reflect.set(tab, 'delegate', delegate);

        const display = Reflect.get(tab, 'display');
        if (typeof display !== 'function') {
            throw new Error('Lazy settings tab display fallback is missing.');
        }
        Reflect.apply(display, tab, []);

        expect(delegate.containerEl).toBe(containerEl);
        expect(delegate.display).toHaveBeenCalledOnce();
    });
});
