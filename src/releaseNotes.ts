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

import { compareVersions } from './utils/versionUtils';
export { compareVersions } from './utils/versionUtils';

/**
 * Formatting in release notes
 *
 * Supported inline formats in both info and list items:
 * - Bold text: **text**
 * - Critical emphasis (red + bold): ==text==
 * - Inline code: `code`
 * - Markdown link: [label](https://example.com)
 * - Auto-link: https://example.com
 *
 * Supported block formats in info:
 * - Line break: single \n or <br>
 * - Paragraph break: double \n\n or two consecutive <br> markers
 *
 * Not supported:
 * - Italics, headings, fenced code blocks, HTML except <br> line break markers
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
    /** When true, the banner opens the full image in a new tab */
    bannerClickable?: boolean;
    /** Optional autoplay video source. true uses version as video id, string uses explicit URL or video id */
    videoUrl?: boolean | string;
    /** When true, the video can be opened in a new tab */
    videoClickable?: boolean;
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
        version: '3.2.4',
        date: '2026-07-20',
        showOnUpdate: true,
        youtubeUrl: 'https://www.youtube.com/watch?v=m2maDNtho7Y',
        info: 'We finally have a new **Mastering Notebook Navigator 3** video! In this one-hour long masterclass I go through everything you need to know about Notebook Navigator in 14 separate chapters. It took some time to record this, and I hope you find value in it.',
        new: [
            'Filter search now checks frontmatter aliases and all supported frontmatter properties, including properties that are not shown in Notebook Navigator. For example, `kickoff` finds a note with the alias `Project kickoff`, `.stat` finds the `status` property, and `.status=act` finds the value `active`. Matches are highlighted in the note list, and hidden properties are shown next to the note name. Exclusions such as `-kickoff` also check aliases. This change requires a one-time cache rebuild after updating. Sorry about that!',
            'You can now show item counts in the list pane group headers using the new setting: List pane > Group headers > ==Show item counts==. Disabled by default.'
        ],
        improved: [
            'Settings are no longer reset to defaults when the settings file is temporarily missing or unreadable, which can happen with some third party sync services. Startup retries the settings load for a short window, then shows a notice and keeps the plugin inactive until Obsidian is restarted. The new command `Restore default settings` replaces a damaged settings file with verified defaults after saving a timestamped copy to the plugin folder.',
            'If you are using a hardware keyboard with a mobile device, you can now use Tab, Shift+Tab, and the Left and Right arrow keys to move between the navigation and list panes.',
            'Excalidraw drawings now show preview text from the frontmatter properties listed in `Preview properties`.'
        ],
        changed: [
            'In the list pane, the parent folder label with ==Show folder path== enabled now shows the path relative to the selected folder instead of the full path. For example with the folder `Projects` selected, a note in `Projects/Clients/Acme` now shows `Clients/Acme`.'
        ],
        fixed: [
            'Fixed freshly downloaded icon packs appearing as square placeholder symbols in the icon picker until Obsidian was restarted.',
            'Calendar notes now follow vault profile visibility, including hidden folders and `Show hidden items` in the right sidebar.',
            'Fixed Cmd/Ctrl-click not opening note shortcuts and recent files in a new tab when Option/Alt was selected as the multi-select modifier.',
            'Fixed an issue where deleting notes could leave their tags showing in the tag tree. This happened when deleting a folder while a custom root folder order was set.',
            'Fixed custom group headers not showing word counts when note word count display was disabled.'
        ]
    },
    {
        version: '3.2.3',
        date: '2026-07-09',
        showOnUpdate: true,
        bannerUrl: true,
        info: 'After making startup much faster in 3.2.0, I took the time to go through everything that runs when you actually use the plugin: scrolling, switching folders, typing in notes, editing tags, and moving folders.\n\nRendering while scrolling is now 15-25% more efficient, switching folders builds the list about 60% faster, warm starts load storage about 5 times faster, background processing while typing is cut in half, and moving a folder now batches its database writes instead of writing every file separately.\n\nYou should notice these improvements in your daily use, especially if you have a large vault. Thank you for using Notebook Navigator!',
        new: [
            '**Calendar.** New setting: Calendar > ==Show tasks==. You can now hide the indicator on days, weeks, and months with unfinished tasks. Enabled by default.',
            '**Display filters.** New setting: Display filters > ==Exclude folders from descendants==. You can now exclude folders from showing when "Show files from subfolders" is enabled. Use it to hide folder content like periodic notes from parent folder lists while keeping the folders visible and selectable. You can also exclude folders directly with the new menu command `Hide from parents`.',
            '**Feature images.** SVG images are back as feature images again. SVG sources are now rasterized into cached thumbnails during content generation instead of rendering live in the list. SVG files that embed bitmap images are skipped.',
            '**Navigation banner.** SVG files can now also be selected as the navigation banner image.'
        ],
        improved: [
            '**Search.** The command `Search in vault root` was renamed to ==Search whole vault==. It now always includes notes from subfolders without changing the `Show notes from subfolders` setting.',
            '**Settings.** Importing settings now shows a confirmation dialog with an option to save current settings to a timestamped file in the vault root. Exported settings files now use timestamped filenames and record the plugin version. Import rejects JSON that is not a Notebook Navigator export or recognizable legacy settings diff.',
            '**Calendar.** Middle-click on day cells, week numbers, month, quarter and year headers, and the year panel opens the calendar note in a new tab, creating it if needed.',
            '**Feature images.** Thumbnails with transparent backgrounds, such as SVG or PNG images, no longer show an outline over transparent areas.',
            '**Performance.** Reduced work across list and navigation rendering, calendar updates, warm startup storage loading, note-save content generation, tag and property rebuilds, frontmatter date reads, folder note counts, bulk file operations, and PDF/SVG thumbnail moves.'
        ],
        fixed: [
            '**Drag and drop.** Fixed drag and drop not working on some Windows PCs where the system did not expose drag data during the drag operation.',
            '**Display filters.** Fixed entries in Display filters > Hide folders losing path segments when a folder moved to a different folder depth. Hidden tag patterns had the same issue when a tag rename changed depth. Patterns containing `name*` segments are left unchanged when the moved folder or renamed tag does not match them.',
            '**Editor tabs.** Fixed notes pinned in the editor opening again when selected from Notebook Navigator instead of reusing the existing main editor tab.'
        ]
    },
    {
        version: '3.2.2',
        date: '2026-06-30',
        showOnUpdate: false,
        info: 'Quick fix to make drag and drop work again with external images.'
    },
    {
        version: '3.2.1',
        date: '2026-06-29',
        showOnUpdate: true,
        bannerUrl: true,
        info: 'You can now **rename files, tags and properties inline** using Enter (macOS) or F2 (Windows and Linux)! And we got more optimizations! This release significantly reduces **preview work while typing** and also improves **drag and drop performance**. Previously there were lots of processing happening in the background every time Obsidian updated the current file when typing, now all actions are heavily gated.',
        new: [
            '**Inline rename.** ==Rename files, folders, tags, and properties inline== with Enter on macOS or F2 on Windows/Linux. The keyboard command is customizable with the `pane:rename` action.',
            '**Manual sort.** Manual-sort movement now uses the custom hotkey actions `list:manual-sort-up` and `list:manual-sort-down`. Defaults remain `Mod+ArrowUp` and `Mod+ArrowDown`.',
            '**File icons.** New setting: ==File icon preset== in Notes > Icons by file type. You can now pick default file icons from one of the installed icon packs.',
            '**Navigation pane.** New setting ==Skip vault root when collapsing== in Navigation pane > Collapse items. When collapsing all items, the vault root folder keeps its current state.'
        ],
        improved: [
            '**Navigation pane.** Root item spacing now supports values up to `12px`.',
            '**Performance.** Significantly improved drag and drop performance! Drag previews now use browser-native drag images instead of a JavaScript element that follows the pointer.',
            '**Performance.** Significantly improved performance when typing in the current note.'
        ],
        changed: [
            '**Merge notes.** Source notes are no longer moved to trash by default. Select the option in the merge dialog to move them to trash.'
        ],
        fixed: [
            '**Manual sort.** Fixed a problem with manual sort when **Show notes from subfolders / descendants** was enabled. For example, a parent folder could have note `1`, a subfolder with notes `2.0` and `2.1`, and then note `3`. After manually sorting the subfolder notes, the parent folder could show `2.0`, `2.1`, `1`, `3` instead of `1`, `2.0`, `2.1`, `3`. The parent folder now keeps the correct order after sorting notes inside the subfolder.',
            '**Properties.** Fixed property value assignment writing the display label instead of the original frontmatter link value. Values such as `[[Mini-Tasks]]` now keep the `Mini-Tasks` label while assigning writes `[[Mini-Tasks]]`.',
            '**List pane.** Fixed Reveal file not scrolling to notes inside collapsed list groups or the collapsed pinned section.'
        ]
    },
    {
        version: '3.2.0',
        date: '2026-06-21',
        showOnUpdate: true,
        bannerUrl: true,
        info: '**This release makes Notebook Navigator start MUCH faster!** Most feature code now loads the first time you use a feature instead of while Obsidian starts up, and several background tasks no longer run during plugin load. Many users will see almost a tenfold improvement to startup time.',
        new: [
            '==New icon and color picker!== Redesigned and merged the icon and color pickers into a unified panel with preview, saturation/value rectangle and a new hue slider.',
            'Added a ==Reveal file== button in the list pane toolbar. Default disabled, enable it with Settings > Appearance & behavior > Toolbar buttons.'
        ],
        improved: [
            '**Startup speed.** The code that runs commands now loads the first time you run a command instead of during startup.',
            '**Startup speed.** The navigator and calendar views now load their code when Obsidian opens them instead of during startup.',
            '**Startup speed.** The settings screen now loads when you open settings instead of during startup.',
            '**Startup speed.** Detecting folder notes no longer loads the full folder note creation and opening code during startup.',
            '**Startup speed.** The emoji keyword database now loads when you search emoji or show emoji icon names instead of during startup.',
            '**Startup speed.** External icon packs now initialize only when you have enabled or are managing them instead of during startup.',
            '**Startup speed.** Preview text now fills in when it is first shown instead of running a background scan during startup.',
            '**Startup speed.** Non-English languages now load their translation directly instead of loading English first and then merging.',
            '**Startup speed.** The version check no longer loads the full release notes during startup.',
            'Navigate to folder, Navigate to tag, and Navigate to property now keep the current single-pane view after selection.'
        ],
        fixed: ['**Calendar.** Fixed stale task indicators in the right-sidebar calendar when the main Notebook Navigator view was closed.']
    },
    {
        version: '3.1.4',
        date: '2026-06-15',
        showOnUpdate: true,
        videoUrl: true,
        videoClickable: true,
        new: [
            'When resizing the sidebar, Notebook Navigator can now automatically switch between dual pane, vertical split, and single pane. Configure this with ==When sidebar is too narrow== in Settings > Appearance & behavior > Desktop appearance.',
            'New setting ==One expanded branch== in Settings > Navigation pane. Enable to automatically collapse other branches in the same tree when expanding a folder, tag, or property.'
        ],
        improved: ['**Folder notes.** You can now use Canvas and Base files as templates for folder notes.'],
        fixed: [
            '**Navigation pane.** Pinned shortcuts disappeared on iOS/iPadOS because of a WebKit paint bug.',
            '**List pane.** Notes embedded in Canvas files were opening in a separate notes tab while typing.',
            '**List pane.** When grouping by subfolders, folder groups incorrectly got truncated to "MyF... / SubF..." instead of "MyFolder / Su...".'
        ]
    },
    {
        version: '3.1.2',
        date: '2026-06-07',
        showOnUpdate: false,
        new: [
            '**Settings.** New setting ==Folder grouping: current folder files at bottom== in List pane > Organization. Enable to show files in current folder on bottom when grouping by folder.'
        ],
        fixed: [
            '**Calendar.** Fixed quarterly note indicator alignment with monthly and yearly note indicators.',
            '**Calendar.** Fixed periodic note template buttons and descriptions initially missing in Obsidian 1.13.',
            '**Folder notes.** Fixed Templater integration for folder note templates. The Folder notes settings now also show Templater plugin status.',
            '**Folder notes.** Fixed right-sidebar folder note cleanup closing unrelated right sidebar panels. Users could see Properties, Backlinks, or other right sidebar panels close after toggling the pinned notes header or changing folders.',
            '**Build.** Added workaround for Obsidian code scanner incorrectly flagging properly implemented Obsidian 1.13 support as error.'
        ]
    },
    {
        version: '3.1.0',
        date: '2026-06-07',
        showOnUpdate: true,
        bannerUrl: true,
        bannerClickable: true,
        info: 'This version adds two fantastic new features: ==Open folder notes in right sidebar== and ==Right sidebar: Show closest folder note==. When these settings are enabled, selecting a folder will now automatically open its folder note or the closest ancestor folder note in the right sidebar! Super useful for scratch pads related to different areas of your vault.\n\nThis release also includes dozens of ==list pane and navigation pane performance improvements==. Notebook Navigator now does less work when scrolling and moving through notes, folders, tags and properties. Give it a try and let me know if you notice any difference!',
        new: [
            '**Commands.** New command ==Collapse / expand selected item== to toggle the selected navigation item.',
            '**Settings.** New setting ==Open folder notes in right sidebar== to Settings > Folders & folder notes.',
            '**Settings.** New setting ==Right sidebar: Show closest folder note==. When a folder is selected, the right sidebar automatically shows the nearest ancestor folder note.',
            '**Settings.** New setting ==Pinned notes icon== to Settings > Appearance & behavior > Interface icons. This icon is displayed next to the Pinned items group header if set, default not set.',
            '**Settings.** New setting ==Show subfolder paths== in List pane > Group headers. Default enabled, disable to only show folder names when grouping by folder.',
            '**Settings.** New setting ==Show leaders== in Navigation pane > Appearance. Choose dots, dashes, or a line between item names and note counts. Makes navigation pane look like a Table of Contents.',
            '**Style settings.** Two new style settings; ==Indent guide color and Leader color== to customize the colors of indent guides and leaders.'
        ],
        improved: [
            '**Folder notes.** The vault root can now have a folder note. Default naming uses the vault name.',
            '**List pane.** Individual folder group path segments are now clickable when subfolder paths are shown.',
            '**List pane.** Lots of rendering performance improvements in the list pane.',
            '**Navigation pane.** Lots of rendering performance improvements in the navigation pane.',
            '**Icon packs.** Simple Icons was updated to 16.22, adding 9 brand icons.'
        ],
        changed: [
            '**Feature images.** Breaking change! ==SVG images are no longer supported as feature images==. Large SVG images with embedded bitmaps were causing performance and memory issues for some users so this was disabled until further notice. As a result the cache will be rebuilt on startup.',
            '**List pane.** Standard mode now keeps the standard row layout when date, preview, and feature image are hidden. Compact layout is only used when list mode is Compact.'
        ],
        fixed: [
            '**Calendar.** Fixed Templater integration for notes created from the calendar.',
            '**List pane.** Fixed quick actions not reappearing after switching from Notebook Navigator to another left sidebar tab and back.',
            '**Commands.** Fixed Cmd+W accidentally closing Notebook Navigator after focusing the sidebar with the Notebook Navigator: Open command.'
        ]
    },
    {
        version: '3.0.2',
        date: '2026-05-29',
        showOnUpdate: true,
        bannerUrl: true,
        info: 'Settings search, finally! Obsidian 1.13 introduced a completely new Settings window that stays open and supports text search. All settings in Notebook Navigator have been meticulously rewritten to fully support this new structure, while still providing support for older versions like 1.11 and 1.12. Give it a try and let me know how you like it.',
        new: [
            '**Settings.** Notebook Navigator now support the new ==Obsidian 1.13 settings API==, including the new Settings dialog and settings search.'
        ],
        improved: [
            '**List pane.** File tag and property pills now follow the navigation pane sort order. Colored items are still showing first if that setting is enabled.',
            "**List pane.** Folder grouping now uses each file's actual parent folder. Descendant headers show the full path relative to the selected folder."
        ],
        fixed: [
            '**List pane.** Fixed parent folder labels missing from notes in property views when **Show parent folder** was enabled.',
            '**List pane.** Fixed delete selecting the wrong next note when folder grouping and descendant notes were enabled.'
        ]
    },
    {
        version: '3.0.1',
        date: '2026-05-26',
        showOnUpdate: true,
        bannerUrl: true,
        info: 'Notebook Navigator should start quickly on all devices. If you feel Notebook Navigator starts slowly, then please enable the new setting "Startup debug logging", restart, review the generated markdown file, and upload it to https://github.com/johansan/notebook-navigator as a bug report and I will take a look at it.',
        new: [
            '**List pane.** You can now ==merge notes in the list pane==! Right click several files or a group header to create a new note from selected files. You can also use it through the command "Merge notes".',
            '**List pane.** ==Files can show character counts==, with or without spaces. Enable it in Settings > Notes > Word and character count.',
            '**Startup.** New setting ==Startup debug logging==. Enable this in Advanced settings if you experience slow startup times, then review and upload the debug file to our GitHub page.'
        ],
        changed: [
            '**Settings.** Settings structure was rewritten for easier navigation. You can now navigate to all sub pages from the first settings page.'
        ],
        improved: [
            '**Shortcuts.** Search shortcuts can now be renamed from the context menu.',
            '**List pane.** The **Edit sort order...** mode now fully supports keyboard navigation, including CMD+arrow up / down.'
        ],
        fixed: [
            '**Navigation pane.** Fixed duplicated folder rows showing after folders were copied into the vault while Obsidian was open.'
        ]
    },
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
