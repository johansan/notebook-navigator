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

import { MarkdownView, TFolder, normalizePath, type App, type TFile, type View } from 'obsidian';
import type NotebookNavigatorPlugin from '../../main';
import { strings } from '../../i18n';
import { DEFAULT_TEMPLATE_COMMAND_ICON, type NotebookNavigatorSettings, type TemplateCommand } from '../../settings/types';
import { getIconService } from '../icons';
import { STORAGE_KEYS } from '../../types';
import { runAsyncAction } from '../../utils/async';
import {
    createMarkdownFileFromTemplate,
    getFolderTemplateFile,
    getMarkdownTemplateFile,
    prepareMarkdownTemplate,
    sanitizeNoteBaseName
} from '../../utils/fileCreationUtils';
import { localStorage } from '../../utils/localStorage';
import { getMomentApi } from '../../utils/moment';
import { showNotice } from '../../utils/noticeUtils';
import { renderNoteTemplate } from '../../utils/templateRenderer';

const COMMAND_ID_PREFIX = 'template-command-';

/** Names registered per plugin instance and command id, so unchanged commands are left alone on every settings update. */
const registeredCommandNames = new WeakMap<NotebookNavigatorPlugin, Map<string, string>>();

/** Creates an empty command with a stable id. The id is part of the Obsidian command id, so hotkeys survive renames. */
export function createTemplateCommand(): TemplateCommand {
    return {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        name: '',
        template: '',
        fileNameFormat: '',
        location: 'current',
        folder: '',
        icon: DEFAULT_TEMPLATE_COMMAND_ICON,
        placement: 'none'
    };
}

/** A ribbon or tab bar button created for a command, with the icon and label it was created with. */
interface PlacedButton {
    element: HTMLElement;
    icon: string;
    name: string;
}

interface RibbonButton extends PlacedButton {
    /** Registration identity is independent of the label, so duplicate names and renames keep separate ribbon actions. */
    actionId: string;
}

const ribbonButtons = new WeakMap<NotebookNavigatorPlugin, Map<string, RibbonButton>>();
const viewButtons = new WeakMap<NotebookNavigatorPlugin, WeakMap<View, Map<string, PlacedButton>>>();

function getCommandLabel(command: TemplateCommand): string {
    return command.name.trim() || strings.settings.items.templateCommands.unnamed;
}

function removeRibbonButton(plugin: NotebookNavigatorPlugin, button: RibbonButton): void {
    button.element.remove();
    // Removing the element alone leaves its action registered, so a later ribbon refresh would restore it.
    const ribbon: unknown = plugin.app.workspace.leftRibbon;
    if (typeof ribbon === 'object' && ribbon !== null) {
        const removeAction: unknown = Reflect.get(ribbon, 'removeRibbonAction');
        if (typeof removeAction === 'function') {
            Reflect.apply(removeAction, ribbon, [button.actionId]);
        }
    }
}

/** Keeps one ribbon icon per command placed on the ribbon. Buttons whose icon or label changed are created again. */
function syncRibbonButtons(plugin: NotebookNavigatorPlugin): void {
    const buttons = ribbonButtons.get(plugin) ?? new Map<string, RibbonButton>();
    ribbonButtons.set(plugin, buttons);
    const wanted = new Map(
        plugin.settings.templateCommands.filter(command => command.placement === 'ribbon').map(command => [command.id, command])
    );

    buttons.forEach((button, id) => {
        const command = wanted.get(id);
        if (!command || command.icon !== button.icon || getCommandLabel(command) !== button.name) {
            removeRibbonButton(plugin, button);
            buttons.delete(id);
        }
    });
    wanted.forEach((command, id) => {
        if (buttons.has(id)) {
            return;
        }
        const name = getCommandLabel(command);
        const ribbon = plugin.app.workspace.leftRibbon;
        const addButton: unknown = Reflect.get(ribbon, 'addRibbonItemButton');
        if (typeof addButton !== 'function') {
            return;
        }
        // addRibbonIcon uses the label as its identity, which merges commands with the same name and can replace
        // the navigator's own button. The ribbon API accepts a separate id; disposeTemplateCommandButtons owns cleanup.
        const actionId = `${plugin.manifest.id}:${COMMAND_ID_PREFIX}${id}`;
        const element: unknown = Reflect.apply(addButton, ribbon, [
            actionId,
            DEFAULT_TEMPLATE_COMMAND_ICON,
            name,
            () => runAsyncAction(() => runTemplateCommand(plugin, id))
        ]);
        if (!(element instanceof HTMLElement)) {
            return;
        }
        // Rendering through the icon service supports icon pack icons that Obsidian's own icon lookup does not know.
        getIconService().renderIcon(element, command.icon);
        buttons.set(id, { element, icon: command.icon, name, actionId });
    });
}

/** Keeps one view action per command placed on the tab bar in every open markdown view. */
function syncViewButtons(plugin: NotebookNavigatorPlugin): void {
    const perView = viewButtons.get(plugin) ?? new WeakMap<View, Map<string, PlacedButton>>();
    viewButtons.set(plugin, perView);
    const wanted = plugin.settings.templateCommands.filter(command => command.placement === 'tabBar');
    const wantedById = new Map(wanted.map(command => [command.id, command]));

    plugin.app.workspace.getLeavesOfType('markdown').forEach(leaf => {
        const view = leaf.view;
        if (!(view instanceof MarkdownView)) {
            return;
        }
        const buttons = perView.get(view) ?? new Map<string, PlacedButton>();
        perView.set(view, buttons);

        buttons.forEach((button, id) => {
            const command = wantedById.get(id);
            if (!command || command.icon !== button.icon || getCommandLabel(command) !== button.name) {
                button.element.remove();
                buttons.delete(id);
            }
        });
        wanted.forEach(command => {
            if (buttons.has(command.id)) {
                return;
            }
            const name = getCommandLabel(command);
            const element = view.addAction(DEFAULT_TEMPLATE_COMMAND_ICON, name, () =>
                runAsyncAction(() => runTemplateCommand(plugin, command.id))
            );
            getIconService().renderIcon(element, command.icon);
            buttons.set(command.id, { element, icon: command.icon, name });
        });
    });
}

/** Creates, updates and removes ribbon and tab bar buttons so they match the commands in settings. */
export function syncTemplateCommandButtons(plugin: NotebookNavigatorPlugin): void {
    syncRibbonButtons(plugin);
    syncViewButtons(plugin);
}

/** Registers the workspace events that add tab bar buttons to markdown views opened later, then places the buttons. */
export function startTemplateCommandButtons(plugin: NotebookNavigatorPlugin): void {
    plugin.registerEvent(plugin.app.workspace.on('layout-change', () => syncViewButtons(plugin)));
    plugin.registerEvent(plugin.app.workspace.on('active-leaf-change', () => syncViewButtons(plugin)));
    syncTemplateCommandButtons(plugin);
}

/** Removes every button the plugin placed. View actions are not removed by Obsidian on unload, so this runs from `onunload`. */
export function disposeTemplateCommandButtons(plugin: NotebookNavigatorPlugin): void {
    ribbonButtons.get(plugin)?.forEach(button => removeRibbonButton(plugin, button));
    ribbonButtons.delete(plugin);
    const perView = viewButtons.get(plugin);
    if (perView) {
        plugin.app.workspace.getLeavesOfType('markdown').forEach(leaf => {
            perView.get(leaf.view)?.forEach(button => button.element.remove());
        });
    }
    viewButtons.delete(plugin);
}

/**
 * Registers one Obsidian command per template command and removes commands that no longer exist in settings.
 * Called at startup and after every settings update. A command is only registered when it is new or renamed,
 * because every `addCommand` call also registers an unload callback. Renames re-register instead of editing the
 * registered command, whose name Obsidian has prefixed with the plugin name.
 */
export function syncTemplateCommands(plugin: NotebookNavigatorPlugin): void {
    const registered = registeredCommandNames.get(plugin) ?? new Map<string, string>();
    registeredCommandNames.set(plugin, registered);

    const wanted = new Set(plugin.settings.templateCommands.map(command => COMMAND_ID_PREFIX + command.id));
    registered.forEach((_name, id) => {
        if (!wanted.has(id)) {
            plugin.removeCommand(id);
            registered.delete(id);
        }
    });

    plugin.settings.templateCommands.forEach(command => {
        const id = COMMAND_ID_PREFIX + command.id;
        const name = command.name.trim() || strings.settings.items.templateCommands.unnamed;
        const registeredName = registered.get(id);
        if (registeredName === name) {
            return;
        }
        if (registeredName !== undefined) {
            plugin.removeCommand(id);
        }
        plugin.addCommand({
            id,
            name,
            // The command is looked up again when it runs so edits made after registration apply.
            callback: () => runAsyncAction(() => runTemplateCommand(plugin, command.id))
        });
        registered.set(id, name);
    });
}

/**
 * Resolves the folder a command creates its note in.
 * `folder` uses the configured path. `current` uses the folder selected in the navigator, then the folder of the
 * active file, then the vault root. Returns null after a notice when a configured folder does not exist.
 */
export function resolveTemplateCommandFolder(app: App, command: TemplateCommand): TFolder | null {
    if (command.location === 'folder') {
        const path = normalizePath(command.folder.trim());
        if (!path || path === '/') {
            return app.vault.getRoot();
        }
        const folder = app.vault.getFolderByPath(path);
        if (!folder) {
            showNotice(strings.templates.folderNotFound.replace('{name}', command.folder), { variant: 'warning' });
            return null;
        }
        return folder;
    }

    const selectedFolderPath = localStorage.get<string>(STORAGE_KEYS.selectedFolderKey);
    const selectedFolder = selectedFolderPath ? app.vault.getFolderByPath(selectedFolderPath) : null;
    if (selectedFolder) {
        return selectedFolder;
    }
    const activeParent = app.workspace.getActiveFile()?.parent;
    return activeParent instanceof TFolder ? activeParent : app.vault.getRoot();
}

/** Renders the file name format with the entered prompt values; note creation chooses and reserves an unused name. */
export function buildTemplateCommandFileName(
    settings: Pick<NotebookNavigatorSettings, 'dateFormat' | 'timeFormat'>,
    command: TemplateCommand,
    folder: TFolder,
    promptValues: Record<string, string>
): string {
    const rendered = renderNoteTemplate(command.fileNameFormat, {
        momentApi: getMomentApi(),
        title: '',
        folderName: folder.path === '/' ? '' : folder.name,
        path: '',
        date: null,
        dateFormat: settings.dateFormat,
        todayFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
        promptValues
    });
    return sanitizeNoteBaseName(rendered.content) || strings.fileSystem.defaultNames.untitled;
}

/** Runs a template command: prompts for values, creates the note with a generated name and opens it. */
export async function runTemplateCommand(plugin: NotebookNavigatorPlugin, commandId: string): Promise<void> {
    const command = plugin.settings.templateCommands.find(entry => entry.id === commandId);
    if (!command) {
        return;
    }
    const { app, settings } = plugin;

    const folder = resolveTemplateCommandFolder(app, command);
    if (!folder) {
        return;
    }
    // A command without a template still gets the folder template of the target folder, so a folder that already
    // has one only needs the command for its name and prompts.
    let templateFile: TFile | null;
    if (command.template.trim()) {
        templateFile = getMarkdownTemplateFile(app, command.template, 'template command');
        if (!templateFile) {
            showNotice(strings.templates.templateNotFound.replace('{name}', command.template), { variant: 'warning' });
            return;
        }
    } else {
        templateFile = getFolderTemplateFile(app, settings, folder.path);
    }

    let created: TFile | null;
    try {
        const preparedTemplate = await prepareMarkdownTemplate({
            app,
            templateFile,
            settings,
            fileNameFormat: command.fileNameFormat,
            templateErrorContext: 'template command'
        });
        if (!preparedTemplate) {
            return;
        }
        created = await createMarkdownFileFromTemplate({
            app,
            folder,
            baseName: buildTemplateCommandFileName(settings, command, folder, preparedTemplate.promptValues),
            preparedTemplate,
            settings,
            ensureUniqueName: true,
            templateErrorContext: 'template command'
        });
    } catch (error) {
        console.error('Failed to run template command', command.name, error);
        showNotice(strings.common.unknownError, { variant: 'warning' });
        return;
    }
    if (!created) {
        return;
    }

    const leaf = app.workspace.getLeaf(settings.createNewNotesInNewTab);
    await leaf.openFile(created, { state: { mode: 'source' }, active: true });
}
