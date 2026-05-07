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

import { setIcon } from 'obsidian';
import { ItemType } from '../types';
import { getIconService } from '../services/icons';

/**
 * Supported item types for drag ghost visualization
 */
export type DragGhostItemType = (typeof ItemType)[keyof typeof ItemType] | 'search';

/**
 * Configuration options for creating a drag ghost
 */
export interface DragGhostOptions {
    itemType: DragGhostItemType | null;
    path?: string;
    itemCount?: number;
    icon?: string;
    iconColor?: string;
    customElement?: HTMLElement;
    cursorOffset?: { x: number; y: number };
}

/**
 * Interface for managing drag ghost display during drag operations
 */
export interface DragGhostManager {
    showGhost: (event: DragEvent, options: DragGhostOptions) => void;
    hideGhost: () => void;
    hideNativePreview: (event: DragEvent) => void;
    hasGhost: () => boolean;
}

/**
 * Creates a drag ghost manager that displays custom drag previews.
 * Shows icons or badges depending on the dragged content.
 */
export function createDragGhostManager(): DragGhostManager {
    let dragGhostElement: HTMLElement | null = null;
    let dragGhostDocument: Document | null = null;
    let windowDragEndHandler: ((event: DragEvent) => void) | null = null;
    let windowDropHandler: ((event: DragEvent) => void) | null = null;
    let cursorOffset: { x: number; y: number } = { x: 10, y: 10 };

    /**
     * Updates ghost position using CSS custom properties for transform-based positioning
     */
    const setGhostPosition = (x: number, y: number) => {
        if (!dragGhostElement) {
            return;
        }
        dragGhostElement.style.setProperty('--nn-drag-ghost-x', `${x}px`);
        dragGhostElement.style.setProperty('--nn-drag-ghost-y', `${y}px`);
    };

    /**
     * Updates the ghost element position to follow the cursor
     */
    const updateDragGhostPosition = (event: MouseEvent | DragEvent) => {
        setGhostPosition(event.clientX + cursorOffset.x, event.clientY + cursorOffset.y);
    };
    // Options for mousemove event listener to mark as passive for better performance
    const mouseMoveListenerOptions: AddEventListenerOptions = { passive: true };
    // Capture phase flag for dragover event listener to intercept events early
    const dragOverListenerCapture = true;

    /**
     * Removes the ghost element and cleans up event listeners
     */
    const hideGhost = () => {
        if (dragGhostElement) {
            const ownerDocument = dragGhostDocument ?? activeDocument;
            ownerDocument.removeEventListener('mousemove', updateDragGhostPosition, mouseMoveListenerOptions);
            ownerDocument.removeEventListener('dragover', updateDragGhostPosition, dragOverListenerCapture);
            dragGhostElement.remove();
            dragGhostElement = null;
            dragGhostDocument = null;
        }
        if (windowDragEndHandler) {
            window.removeEventListener('dragend', windowDragEndHandler);
            windowDragEndHandler = null;
        }
        if (windowDropHandler) {
            window.removeEventListener('drop', windowDropHandler);
            windowDropHandler = null;
        }
    };

    /**
     * Determines the appropriate icon based on item type
     */
    const resolveIcon = (options: DragGhostOptions): string | null => {
        if (options.icon) {
            return options.icon;
        }
        if (options.itemType === ItemType.FOLDER) {
            return 'lucide-folder-closed';
        }
        if (options.itemType === ItemType.TAG) {
            return 'lucide-tags';
        }
        if (options.itemType === 'search') {
            return 'lucide-search';
        }
        if (options.itemType !== ItemType.FILE) {
            return null;
        }
        return 'lucide-file';
    };

    /**
     * Checks if an icon ID is an emoji and returns it
     */
    const asEmoji = (iconId: string): string | null => {
        if (iconId.startsWith('emoji:')) {
            return iconId.slice('emoji:'.length);
        }
        const emojiRegex = /\p{Extended_Pictographic}/u;
        return emojiRegex.test(iconId) ? iconId : null;
    };

    /**
     * Creates and displays a custom drag ghost element.
     * Shows either a badge for multiple items or an icon/image for single items.
     */
    const showGhost = (event: DragEvent, options: DragGhostOptions) => {
        hideGhost();

        cursorOffset = {
            x: options.cursorOffset?.x ?? 10,
            y: options.cursorOffset?.y ?? 10
        };

        const iconService = getIconService();
        /**
         * Attempts to render an icon using icon service, emoji, or Obsidian setIcon
         */
        const renderIcon = (iconId: string | null | undefined, target: HTMLElement): boolean => {
            if (!iconId) {
                return false;
            }
            target.innerHTML = '';
            try {
                iconService.renderIcon(target, iconId);
                if (target.childNodes.length > 0 || target.innerHTML.trim() !== '') {
                    return true;
                }
            } catch (error) {
                void error;
            }
            const emoji = asEmoji(iconId);
            if (emoji) {
                target.textContent = emoji;
                return true;
            }
            try {
                setIcon(target, iconId);
                return target.childNodes.length > 0;
            } catch (error) {
                void error;
            }
            return false;
        };
        const resolvedIcon = resolveIcon(options);
        const ownerDocument = options.customElement?.ownerDocument ?? activeDocument;

        const baseGhost = options.customElement ?? ownerDocument.createElement('div');
        if (!baseGhost.classList.contains('nn-drag-ghost')) {
            baseGhost.classList.add('nn-drag-ghost');
        }

        if (!options.customElement) {
            if (options.itemCount && options.itemCount > 1) {
                const info = ownerDocument.createElement('div');
                info.className = 'nn-drag-ghost-badge';
                info.textContent = `${options.itemCount}`;
                baseGhost.appendChild(info);
            } else {
                const iconWrapper = ownerDocument.createElement('div');
                iconWrapper.className = 'nn-drag-ghost-icon';
                const iconColor = options.iconColor ?? '#ffffff';
                iconWrapper.style.color = iconColor;
                iconWrapper.style.setProperty('--icon-color', iconColor);
                iconWrapper.style.fill = iconColor;
                iconWrapper.style.stroke = iconColor;

                if (!renderIcon(options.icon, iconWrapper) && !renderIcon(resolvedIcon, iconWrapper)) {
                    iconWrapper.innerHTML = '';
                }

                baseGhost.appendChild(iconWrapper);
            }
        }

        ownerDocument.body.appendChild(baseGhost);
        dragGhostElement = baseGhost;
        dragGhostDocument = ownerDocument;
        setGhostPosition(event.clientX + cursorOffset.x, event.clientY + cursorOffset.y);

        ownerDocument.addEventListener('mousemove', updateDragGhostPosition, mouseMoveListenerOptions);
        ownerDocument.addEventListener('dragover', updateDragGhostPosition, dragOverListenerCapture);

        const onGlobalEnd = () => hideGhost();
        windowDragEndHandler = onGlobalEnd;
        windowDropHandler = onGlobalEnd;
        window.addEventListener('dragend', onGlobalEnd, { once: true });
        window.addEventListener('drop', onGlobalEnd, { once: true });
    };

    /**
     * Hides the native browser drag preview by setting an empty element as the drag image.
     * This allows the custom ghost to be the only visible drag indicator.
     */
    const hideNativePreview = (event: DragEvent) => {
        const empty = createDiv();
        empty.className = 'nn-drag-empty-placeholder';
        activeDocument.body.appendChild(empty);
        try {
            event.dataTransfer?.setDragImage(empty, 0, 0);
        } catch (error) {
            void error;
        }
        activeWindow.setTimeout(() => empty.remove(), 0);
    };

    return {
        showGhost,
        hideGhost,
        hideNativePreview,
        hasGhost: () => dragGhostElement !== null
    };
}
