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

interface NativeDragPreviewOptions {
    className?: string;
    hotspot?: { x: number; y: number };
}

/**
 * Sets a browser-native drag image from temporary DOM content.
 */
export function setNativeDragPreview(event: DragEvent, content: HTMLElement, options: NativeDragPreviewOptions = {}): boolean {
    const transfer = event.dataTransfer;
    if (!transfer) {
        return false;
    }

    const ownerDocument = content.ownerDocument;
    const wrapper = ownerDocument.createElement('div');
    wrapper.className = options.className ?? 'nn-drag-native-preview';
    wrapper.appendChild(content);
    ownerDocument.body.appendChild(wrapper);

    try {
        transfer.setDragImage(wrapper, options.hotspot?.x ?? 0, options.hotspot?.y ?? 0);
    } catch (error) {
        wrapper.remove();
        void error;
        return false;
    }

    window.setTimeout(() => wrapper.remove(), 0);
    return true;
}
