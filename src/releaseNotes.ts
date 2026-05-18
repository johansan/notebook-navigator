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

/**
 * Release Notes System
 *
 * This module manages the "What's new" feature that shows users what has changed
 * between plugin versions. The system works as follows:
 *
 * 1. On plugin load, it compares the current version with the last shown version
 * 2. If version increased, it shows all release notes between versions
 * 3. If downgraded or same version, it shows the latest 5 releases
 * 4. Individual releases can be marked with showOnUpdate: false to skip auto-display
 * 5. Users can always manually access release notes via plugin settings
 *
 * The lastShownVersion is stored in plugin settings to track what the user has seen.
 */

/**
 * Formatting in release notes
 *
 * Supported inline formats in both info and list items:
 * - Bold text: **text**
 * - Critical emphasis (red + bold): ==text==
 * - Markdown link: [label](https://example.com)
 * - Auto-link: https://example.com
 *
 * Supported block formats in info:
 * - Line break: single newline or <br>
 * - Paragraph break: blank line or two consecutive <br> markers
 *
 * Not supported:
 * - Italics, headings, inline code, HTML except <br> line break markers
 *
 * Writing rules:
 * - Use factual, concise statements
 * - Avoid benefit language and subjective adjectives
 * - Keep to the categories: new, improved, changed, fixed
 */

/**
 * Represents a single release note entry
 */
export interface ReleaseNote {
    version: string;
    date: string;
    /** If false, skip automatic modal display for this version during startup */
    showOnUpdate?: boolean;
    /** Optional banner image source. true uses version as banner id, string uses explicit URL or banner id */
    bannerUrl?: boolean | string;
    /** Optional YouTube video URL shown above the release notes for this version */
    youtubeUrl?: string;
    info?: string; // General information about the release, shown at top without bullets
    new?: string[];
    improved?: string[];
    changed?: string[];
    fixed?: string[];
}

/**
 * All release notes for the plugin, ordered from newest to oldest.
 *
 * When adding a new release:
 * 1. Add it at the beginning of the array (newest first)
 * 2. Categorize features into: new, improved, changed, or fixed arrays
 */
const RELEASE_NOTES: ReleaseNote[] = [
    {
        version: '3.0.0',
        date: '2026-05-18',
        showOnUpdate: true,
        info: 'This update finally brings manual sort to the list pane! If you are a writer used to working with Ulysses or Scrivener, this should make your daily life much easier.',
        youtubeUrl: 'https://youtu.be/OCx4v5gJkXE',
        new: [
            '**Manual sort.** ==New manual sorting mode in list pane.== You can now arrange notes in any order you want. The position is saved as a numeric index value in a frontmatter property, and works in single folders as well as with **Show notes from descendants** enabled.',
            '**Manual sort.** You can reorder notes directly in the list pane. Select one or more notes and press Cmd/Ctrl + Arrow Up/Down. Or pick **Edit sort order...** from the sort menu to open a dedicated drag-and-drop view, which supports multi-select on desktop and touch on mobile.',
            '**Manual sort.** New setting: List > Manual sort > ==New note placement== controls where new notes are added when manual sort is active: Top, Bottom, Below selected note, or Unsorted. Default is below selected note.',
            '**List pane.** ==Custom group headers==. Set group mode to "Custom" then create or edit group headers by right clicking files in list pane.',
            '**List pane.** ==Word count targets==. Custom group headers can show total word count and progress against a target word count, similar to writing targets in Scrivener.',
            '**List pane.** ==Group headers can now be collapsed.== Click the chevron next to a group header to collapse or expand it.',
            '**Recent files.** You can now drag items from recent files into shortcuts, folders, tags and properties.',
            '**Calendar.** New setting Calendar > Calendar integration > ==Periodic notes locale== controls whether Notebook Navigator periodic note paths use the selected calendar locale or Obsidian locale.'
        ],
        improved: [
            '**List pane.** ==Word count display== now supports title placement, property placement, target word counts, and target percentage display. Change it in List > Notes > Word count.'
        ],
        changed: [
            '**Settings.** "Property to sort by" was renamed to ==Properties to sort by==. It now takes a comma-separated list of frontmatter properties, and each one shows up as its own option in the list pane sort menu.'
        ],
        fixed: [
            '**Commands.** When **Notebook Navigator: Delete files** was called and the navigation pane was last focused, it could delete the selected folder. It now only deletes selected files.',
            '**Shortcuts.** Folder and note shortcuts no longer break when synced between devices with different path case sensitivity, for example **appLab/SKILLS-WORKFLOWS** vs **applab/skills-workflows**.',
            '**List pane.** Fixed extra spacing in feature image rows when dates are hidden and tags or properties are visible.',
            '**List pane.** Removed tiny hairline gap above the sticky group header showing on some scaling modes.'
        ]
    },
    {
        version: '2.6.6',
        date: '2026-05-12',
        showOnUpdate: false,
        changed: [
            '**List pane.** ==Excalidraw drawing previews now use the PNG files exported by Excalidraw==. Enable **Auto-export PNG** in Excalidraw settings. The new **List > Drawing previews** settings group has the full setup instructions.'
        ],
        improved: [
            '**Community Plugin compliance.** Lots of time spent in this release to meet Obsidian community plugin compliance. Check our current rating at https://community.' +
                'obsidian.md/plugins/notebook-navigator.'
        ]
    },
    {
        version: '2.6.5',
        date: '2026-05-11',
        showOnUpdate: true,
        bannerUrl: true,
        new: [
            '**List pane.** ==Pinned notes can now be collapsed per folder, tag, or property==. Click the Pinned header to hide or show them for the current selection.',
            '**List pane.** New setting **Sticky group headers** in List > Organization. ==Group headers now stick to the top of list pane==. Default enabled.',
            '**List pane.** New setting **Use folder icon** in List > Notes > Icon. ==Shows parent folder icons on notes without custom file icons==.',
            '**List pane.** New setting **Use folder color** in List > Notes > Title. ==Shows parent folder colors on notes without custom file colors==.',
            '**List pane.** New setting **Show full path** in List > Notes > Parent folder. ==Shows the full parent folder path in list pane== instead of only the folder name.',
            '**Commands.** New command **Toggle pinned section** to collapse or expand the pinned notes section in the current context.'
        ],
        improved: [
            '**Settings.** Reorganized the List tab into Appearance, Organization, Pinned notes, and Behavior groups.',
            '**UI Polish**. Simplified list item rendering and feature images a bit, worked on the hover effect, and many other minor improvements.'
        ],
        changed: [
            '**Settings.** Removed List > Pinned notes > **Show pinned icon**. No longer relevant when pinned items can be collapsed.',
            '**Settings.** Removed List > Pinned notes > **Show pinned group header**. It added unnecessary internal complexity, most users want this enabled.'
        ],
        fixed: ['Fixed the drag-and-drop ghost image that disappeared in 2.6.3.']
    },
    {
        version: '2.6.4',
        date: '2026-05-06',
        showOnUpdate: true,
        info: [
            '**Important!** After spending over 100 hours trying to get decent performance with variable title rows, variable preview rows, and variable tags/property rows, I made the difficult decision to roll back and abandon the idea of variable item heights. As of 2.6.4 ==Notebook Navigator no longer supports variable item heights==.',
            'There are many reasons behind this. The main reason is that to support variable item heights in list pane we always have to measure the rendered height of each and every file in the list pane to make scrolling to current item and scroll bar work correctly. This slows down the performance significantly when opening folders/tags/properties, and it also works poorly with the asynchronous architecture of Notebook Navigator where metadata is loaded asynchronously to improve "snappiness". In practice it means that the list will have to re-measure and re-update every time an asynchronous data update happens.',
            'Performance will always be the main driving factor behind the software design of Notebook Navigator, and variable item heights was unfortunately the wrong decision. Thank you for your understanding.'
        ].join('\n\n'),
        changed: [
            '==IMPORTANT!== Due to several technical issues and performance decradations I have rolled back variable line heights for title and preview text.'
        ],
        improved: [
            '**Icon packs.** Updated Simple Icons to 16.18.0.',
            '**Internal.** Decreased the size of main.js by about 900 KB by changing packaging to UTF-8.'
        ]
    },
    {
        version: '2.6.3',
        date: '2026-05-01',
        showOnUpdate: true,
        bannerUrl: true,
        info: 'Notebook Navigator 2.6.3 adds CodeQL security scanning and OpenSSF Scorecard checks to all releases, with current security status visible in the official repo at https://github.com/johansan/notebook-navigator. Every build also runs ESLint with the official Obsidian ESLint plugin and fails on any warning, so code and Obsidian integration issues are caught before release. This gives you a clear signal that the plugin has been checked for security, code quality, and Obsidian compatibility.',
        new: [
            '**Settings.** General > ==Show tooltips > Show word count==. Shows word counts in tooltips.',
            '**Commands.** ==Toggle tags by selection== and ==Toggle properties by selection==.'
        ],
        improved: [
            '**Calendar.** Calendar now keeps the displayed date when switching between the left and right sidebar.',
            '**Search.** Property value filters now match substrings, so ".author=chomsky" matches values such as "Avram Noam Chomsky" and "Chomsky et al.".',
            '**List pane.** Sort and appearance menus in list pane now include options for "Change default settings" to open settings.',
            '**Internal.** Updated all third-party libraries used by the plugin to their latest versions.',
            '**Internal.** Improved robustness across services, modals, and content providers.'
        ],
        changed: [
            '**Calendar.** The setting "Calendar > Month name format" now applies to all views.',
            '**List pane.** ==The grouping options in list pane (group by date, folder or no group) are moved== from the **appearance menu** to the **sort menu**.',
            '**Settings.** ==Removed the setting List > Display > Variable note height==. It made no sense keeping it with the new variable line height feature.',
            '**API.** API metadata icon fields now return the same icon format as stored in frontmatter.',
            '**Internal.** Minimum supported Obsidian version is now **1.11.0**.'
        ],
        fixed: [
            '**Navigation pane.** Fixed rainbow colors on file tags not showing in list pane when tags used uppercase letters.',
            '**List pane.** Fixed incorrect row heights in list pane (virtualizer breaking) after changing calendar settings or navigating certain folders.',
            '**Settings.** The two settings List > Notes > "File name icon map" and "File type icon map" now work correctly again. They broke after the icon format was introduced in 2.6.2.'
        ]
    },
    {
        version: '2.6.2',
        date: '2026-04-25',
        showOnUpdate: false,
        changed: [
            'Due to the way Obsidian displays properties, icon names saved to frontmatter had to be changed to not use colons. For example, Phosphor Apple Logo is now saved as **ph-apple-logo**, Lucide Home is saved as **home**, and folder emoji is saved as **📁**.'
        ]
    },
    {
        version: '2.6.1',
        date: '2026-04-24',
        showOnUpdate: true,
        bannerUrl: true,
        new: [
            '==Variable line height for title and preview text in list pane!== If you choose 2 or more lines for title or preview with less lines of content, notes will now display without empty spacing.',
            'New style setting: Calendar > ==Active day outline thickness==.',
            'New Setting: General > Homepage > ==Create note if missing==. When enabled, the daily, weekly, monthly, quarterly, or yearly note will be automatically created on startup if missing.'
        ],
        improved: [
            'Navigation tree now shows AND/OR icons when multiselecting tags and properties (command or shift + command).',
            'You can now choose to display up to 3 title lines in the list pane.'
        ],
        changed: ['Settings: ==General > Homepage== now includes yearly notes as an option.'],
        fixed: [
            'Fixed getting stuck in list pane in single pane mode when multi-selecting tags or properties in navigation pane.',
            'Date filters now parse years before year 1000 correctly.',
            'Core Daily Notes lookup and creation now use the current Moment locale instead of Calendar > Locale.',
            'Metadata cleanup now preserves metadata for hidden tags and nested tag separators.',
            'Settings: General > Show tooltips now also works for shortcuts and recent files.'
        ]
    }
];

/**
 * Gets all release notes between two versions (inclusive).
 * Used when upgrading to show what's changed since the last version.
 *
 * @param fromVersion - The starting version (usually the previously shown version)
 * @param toVersion - The ending version (usually the current version)
 * @returns Array of release notes between the versions, or latest notes if versions not found
 */
export function getReleaseNotesBetweenVersions(fromVersion: string, toVersion: string): ReleaseNote[] {
    const fromIndex = RELEASE_NOTES.findIndex(note => note.version === fromVersion);
    const toIndex = RELEASE_NOTES.findIndex(note => note.version === toVersion);

    // If either version is not found, fall back to showing latest releases
    if (fromIndex === -1 || toIndex === -1) {
        return getLatestReleaseNotes();
    }

    const startIndex = Math.min(fromIndex, toIndex);
    const endIndex = Math.max(fromIndex, toIndex);

    return RELEASE_NOTES.slice(startIndex, endIndex + 1);
}

/**
 * Gets the most recent release notes.
 * Used for manual "What's new" access and as fallback.
 *
 * @param count - Number of latest releases to return (defaults to 5)
 * @returns Array of the most recent release notes
 */
export function getLatestReleaseNotes(count: number = 5): ReleaseNote[] {
    return RELEASE_NOTES.slice(0, count);
}

/**
 * Compares two semantic version strings.
 *
 * @param v1 - First version string (e.g., "1.2.3")
 * @param v2 - Second version string (e.g., "1.2.4")
 * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;

        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }

    return 0;
}

/**
 * Determines whether release notes for the given version should appear automatically on update.
 */
export function isReleaseAutoDisplayEnabled(version: string): boolean {
    const note = RELEASE_NOTES.find(entry => entry.version === version);
    if (!note) {
        return true;
    }
    return note.showOnUpdate !== false;
}

/**
 * Determines whether release notes should appear automatically when upgrading between two versions.
 *
 * Upgrade decision rule:
 * - Evaluate release notes in the semantic range (fromVersion, toVersion]
 * - Return true when at least one note in that range has showOnUpdate not explicitly set to false
 *
 * Range resolution:
 * - If both versions exist in RELEASE_NOTES, use their index range in the ordered list
 * - If either version is missing, resolve the range by semantic version comparisons
 *
 * Non-upgrade transitions (same version or downgrade) use the target version setting.
 */
export function shouldAutoDisplayReleaseNotesForUpdate(fromVersion: string, toVersion: string): boolean {
    if (compareVersions(toVersion, fromVersion) <= 0) {
        return isReleaseAutoDisplayEnabled(toVersion);
    }

    const fromIndex = RELEASE_NOTES.findIndex(note => note.version === fromVersion);
    const toIndex = RELEASE_NOTES.findIndex(note => note.version === toVersion);

    const releaseNotesInUpgradePath =
        fromIndex === -1 || toIndex === -1
            ? RELEASE_NOTES.filter(note => compareVersions(note.version, fromVersion) > 0 && compareVersions(note.version, toVersion) <= 0)
            : RELEASE_NOTES.slice(Math.min(fromIndex, toIndex), Math.max(fromIndex, toIndex));

    if (releaseNotesInUpgradePath.length === 0) {
        return isReleaseAutoDisplayEnabled(toVersion);
    }

    return releaseNotesInUpgradePath.some(note => note.showOnUpdate !== false);
}
