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

// Icon identifier used with Obsidian's addIcon()/setIcon() for MarkdownPoint presentation files
export const MARKDOWNPOINT_ICON_ID = 'notebook-navigator-markdownpoint';

/**
 * Inner SVG content passed to addIcon(), which wraps it in <svg viewBox="0 0 100 100">.
 * The MarkdownPoint mark (the M-shaped bird with its head) in one color: the app icon's bird geometry scaled
 * into the 100 unit box with the same 8.5 unit padding as the Notebook Navigator icon. It fills with
 * currentColor so it follows the row's icon color. Obsidian's icon CSS strokes shapes with currentColor, so the
 * path disables its stroke; otherwise the mark gets a thicker outline than other icons.
 */
export const MARKDOWNPOINT_ICON_SVG = `<path fill="currentColor" stroke="none" fill-rule="evenodd" d="M 23.48 19.78C 28.23 19.78 37.72 36.53 41.68 40.49A 11.76 11.76 0 0 0 58.32 40.49C 62.28 36.53 71.77 19.78 76.52 19.78Q 78.16 19.78 79.34 20.97A 41.5 41.5 0 0 1 78.78 80.22C 76.27 69.58 74.02 60.2 69.64 58.07C 64.26 55.19 58.13 68.33 51.25 75.09Q 50 76.34 48.75 75.09C 41.87 68.33 35.74 55.19 30.36 58.07C 25.98 60.2 23.73 69.58 21.22 80.22A 41.5 41.5 0 0 1 20.66 20.97Q 21.84 19.78 23.48 19.78ZM 42.74 32.17A 7.26 7.26 0 1 0 57.26 32.17A 7.26 7.26 0 1 0 42.74 32.17Z"/>`;
