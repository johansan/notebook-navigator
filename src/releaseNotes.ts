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
 * 3. Same or downgraded versions never auto-display
 * 4. Individual releases can be marked with showOnUpdate: false to skip auto-display
 * 5. Users can always manually access release notes via plugin settings
 *
 * The lastShownVersion is stored in synced settings and device-local storage. The greater value is
 * used so synced devices normally share one display while stale settings cannot repeat it locally.
 */

export { compareVersions } from './utils/versionUtils';

/**
 * Formatting in release notes
 *
 * Supported inline formats in both info and list items:
 * - Bold text: **text**
 * - Critical emphasis (red + bold): ==text==
 * - Inline code: `code`
 * - Markdown link: [label](https://example.com) or [label](obsidian://action)
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
 * - Do not start list items with a bold area prefix such as `**Calendar.**` (used in 3.2.3 and earlier)
 */

/**
 * Positions the play button over a YouTube thumbnail.
 */
export interface YoutubePlayButtonOptions {
    /** Horizontal center as a percentage of the thumbnail width */
    x: number;
    /** Vertical center as a percentage of the thumbnail height */
    y: number;
    /** Multiplier applied to the default play button size; defaults to 1 */
    scale?: number;
}

/**
 * Represents a single release note entry
 */
export interface ReleaseNote {
    version: string;
    date: string;
    /** If false, skip automatic modal display for this version during startup */
    showOnUpdate?: boolean;
    /** File name inside images/version-banners, extension included, such as '3.3.4.gif'. */
    banner?: string;
    /** When true, the banner opens the full image in a new tab */
    bannerClickable?: boolean;
    /** Optional autoplay video source. true uses version as video id, string uses explicit URL or video id */
    videoUrl?: boolean | string;
    /** When true, the video can be opened in a new tab */
    videoClickable?: boolean;
    /** Optional YouTube video URL shown above the release notes for this version */
    youtubeUrl?: string;
    /** Optional play button placement; thumbnails otherwise use a centered button at its default size */
    youtubePlayButton?: YoutubePlayButtonOptions;
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
        version: '3.3.6',
        date: '2026-09-01',
        showOnUpdate: true,
        new: [
            'New setting in Appearance & behavior > Desktop appearance: ==Show tags in tooltips==: displays the tags of a note as colored pills in the hover tooltip. Default disabled.',
            'If you do not want to see custom group headers in a specific view like tags or properties, you can now pick the new sort option `None` under `Group by`. This can also be the default group option.'
        ],
        improved: [
            'Rebuilt the **hover tooltips** with the same look and feel as the built-in Obsidian tooltips but with less flickering and support for tag pills and text hierarchy.',
            'Added a notice under File display > **Word and character count** that lists the file appearances and group headers that keep word or character counting active, which can have a negative impact on performance.'
        ],
        changed: [
            'Changed ==Show word count in tooltips== to show word counts only when word counts are enabled, so the tooltip setting no longer keeps word counting enabled just for the tooltip.'
        ],
        fixed: [
            'When dragging multiple selected files to a folder, all files are now moved instead of only the first (issue was introduced in 3.2.1) [#1466](https://github.com/johansan/notebook-navigator/issues/1466).',
            'Word counting for files now stays disabled for custom sort orders unless a list contains a custom group header that shows a word count.'
        ]
    },
    {
        version: '3.3.5',
        date: '2026-08-23',
        showOnUpdate: false,
        improved: ["You can now turn off the `What's new` dialog on startup with the new setting ==Show release notes after updating==."],
        fixed: [
            'When the navigator starts in a sidebar too narrow for dual panes, it now properly respects ==Single-pane startup view== instead of always showing the list pane (issue was introduced in 3.1.4 with the automatic switch between single and dual panes).'
        ]
    },
    {
        version: '3.3.4',
        date: '2026-08-17',
        showOnUpdate: true,
        banner: '3.3.4.gif',
        info: 'I just launched a new plugin: [Better Paste](obsidian://show-plugin?id=better-paste)!\n\nYou can now finally paste images from Safari to Obsidian, it cleans up tracking data from URLs, it cleans up AI-generated text, it let\'s you choose if you want commas inside ("x," ) or outside ("x", ) quotes, it fetches page titles for URLs like the plugin **Auto Link Title** which hasn\'t been updated in years, it cleans up text copied from terminal, and much more.\n\n**Better Paste** is already saving me lots of time every day, so feel free to give it a try and let me know if you like it!',
        new: [
            'New appearance menu options: You can now show or hide `Date` and `Parent folder` per folder, tag, and property, for example turning them off globally and enabling them only for the root folder.'
        ],
        improved: [
            'Changed settings sliders to match Obsidian 1.13 style with reset buttons to the left.',
            'Improved all 20 language translations. They now better match built-in Obsidian strings and usage context.'
        ],
        changed: [
            'Merged the two folder note name settings into one: ==Folder note name== that supports both fixed names and patterns.',
            'Moved release notes, the mastering video, support links, and other plugin links into the new ==About== section at the bottom of settings.'
        ],
        fixed: [
            '`New canvas` is now hidden if the Canvas core plugin is disabled.',
            'Clicking a folder note in navpane with folder notes showing in list pane now properly selects it.',
            'Submenus now close properly after selecting an option on mobile devices.'
        ]
    },
    {
        version: '3.3.3',
        date: '2026-08-09',
        showOnUpdate: true,
        banner: '3.3.3.jpg',
        new: [
            "You can now **change the display of tags, properties, tasks, and word counts for each location!** Maybe you want word counts only for a specific folder, or you don't want to show tasks in another folder. This is now possible! Just click the new ==Appearance== menu in the list pane (see screenshot above).",
            "When I added the new task display in 3.3.1 I removed the unfinished task icon. Unfortunately this meant no way of showing unfinished tasks in compact mode. So I put it back, and made it better. You can now choose if you want the unfinished task icon to appear in only compact or in both display modes. You'll find it at File display > Icon > ==Unfinished task icon==. Default set to compact mode.",
            'New setting: Calendar > ==Show days from other months==. You can now leave the days before and after the current month empty, so only the days of the month are shown. Only applies when calendar is showing a full month. Enabled by default.'
        ],
        fixed: [
            'Fixed selecting the default sort direction or property group order resetting the selected sort field or grouping property (issue was introduced with the new group and sort settings in 3.3.1).',
            "Fixed an issue where the `What's new` dialog repeatedly reappeared on some sync providers.",
            'Fixed renamed notes disappearing from the list when viewing a tag until you switched to another tag and back.',
            'Fixed the bottom of month labels such as `Aug` being cut off in the year calendar on Windows.',
            'Fixed `New note` setting a property to `true` when you created the note from a property name, such as `Categories`, instead of from one of its values. The new property is now empty.'
        ]
    },
    {
        version: '3.3.2',
        date: '2026-08-02',
        showOnUpdate: false,
        info: 'Quick fix for the new task display so it also works with pinned items.'
    },
    {
        version: '3.3.1',
        date: '2026-08-02',
        showOnUpdate: true,
        banner: '3.3.1.jpg',
        info: "Lots of nice new things in this release! First up is a new **task display** in the list pane (see screenshot above). As usual you can customize everything and disable it if you don't want it.\n\nFor you power users out there you can finally set **sort by property** and **group by property** as default across the entire vault.\n\nAnd I know many of you have wanted this for a while now - if you hide the root folder **you can now temporarily show the root folder with Show hidden items**.\n\nHave a great day and thank you for using Notebook Navigator!",
        new: [
            'Much better task display in the list pane! Notes containing tasks now show a task icon, progress bar, and completed count, such as `5/7`, on the same line as the date and parent folder! Everything is optional of course, but this is now enabled by default. You will find all related settings in File display > ==Show tasks==. If you want a green color for completed tasks you can change this with the Style Settings plugin.',
            '==Default sorting and grouping== was rebuilt from the ground up, and you can now finally use frontmatter properties for default sorting and grouping. You will find all the new related settings in List pane > Sort & group. There are many small QoL improvements too, like changing from a date / descending sort order to file name now also changes sort order to ascending, which is what most users expect.',
            'In search, you can now use ==double quotes== to match it literally against note names and aliases instead of being read as a filter: `"#work"` finds notes with `#work` in the name instead of filtering on the tag. Use `-"term"` to exclude matches.',
            'You can quickly ==show the root folder if it is hidden==: the `Show hidden items` toolbar button now reveals the root folder dimmed at the top of the tree, and the `Search whole vault` command works while it is shown. You can also right click the root vault folder to quickly hide and show it with the new context menu options.',
            'New copy options in the file menu: `Copy note link` (`[[link]]`), `Copy note link as footnote` (`^[[[link]]]`), and `Copy note embed` (`![[link]]`) - just makes working with note links easier.'
        ],
        changed: [
            'I finally took the time to clean up the entire ==Style Settings== panel. Settings are now grouped by pane and element, and border settings sit next to the elements they style. Give it a go and let me know what you think!',
            'The ==Recent files count== setting now goes up to **50 files**, up from 10.',
            'The ==Unfinished task icon== setting was removed and replaced by the new task progress display.'
        ],
        fixed: [
            'When a note had a creation date in the future (for example from a frontmatter `created` property), the `Previous 7 days` group header appeared twice in the list pane, and stray headers then showed up in other folders until Obsidian was restarted. Notes dated in the future now group under a new `Future` group.',
            'Fixed note backgrounds in list pane with transparency keeping their dark-mode color after switching to light mode.'
        ]
    },
    {
        version: '3.3.0',
        date: '2026-07-29',
        showOnUpdate: true,
        videoUrl: true,
        videoClickable: true,
        info: 'Finally **dual pane support for iPads**! And much better **search results with Omnisearch**! You can now also quickly **collapse or expand all list pane groups** with a new command or toolbar button, and much more!\n\nThank you for using Notebook Navigator!',
        new: [
            'New on tablets: ==Dual pane layout==! Obsidian 1.13 introduced resizable sidebars - so Notebook Navigator now brings the full desktop experience to your iPad. Dual pane layout, desktop toolbars, multi-select, and keyboard navigation: everything available on desktop now works on tablets. Find the settings under Settings > Appearance & behavior.',
            'New grouping option: ==Group by property==, matching `Group by` in Obsidian Bases. The list pane can now group notes by a frontmatter property value: notes sharing the same value are collected under one header, and notes without the property go into a trailing `None` group. Each property listed under Settings > List pane > ==Property sort and grouping== appears as a grouping option in the sort menu, next to the existing date and folder grouping.',
            'New command: ==Collapse / expand all list groups==. When no groups are expanded, it expands all groups; otherwise, it collapses all groups, including the pinned section.',
            'New toolbar button: ==Collapse / expand all list groups==, added under Settings > List pane > Toolbar buttons. Disabled when the current list has no collapsible groups.',
            'New setting: Notes > ==Skip callouts in preview==. When enabled, callout blocks are skipped when generating preview text. Disabled by default.',
            'New setting: Calendar > ==Show hidden items==. When enabled, the calendar always shows all calendar notes, including notes hidden by vault profile filters. Disabled by default.'
        ],
        improved: [
            'Searching with Omnisearch inside a folder now reliably shows the matching notes from that folder. Omnisearch returns only its 50 best matches for the whole vault, so Notebook Navigator narrows the search to the selected folder. Previously this only worked for folders with plain names - in folders with special characters or non-English letters, such as `Möten`, the search still covered the whole vault, and the result list could be incomplete or empty, especially in large vaults. Update Omnisearch to 1.30.0 or later to get this in every folder.',
            'During list pane search, group header item counts now show matching and total items, such as `12/20`.',
            'You can now click anywhere on group headers in the list pane to collapse or expand them, not just the chevron.'
        ],
        changed: [
            'The calendar in the right sidebar now uses a calendar icon in the tab header. You can change this to a custom icon under Settings > Appearance & behavior > ==Interface icons== > Calendar.',
            'The collapsed state of the pinned section is now stored per device and no longer syncs across devices, matching the collapsed state of list groups.',
            'The ==Toolbar buttons== setting to enable / disable toolbar buttons moved from Appearance & behavior to the top of the Navigation pane and List pane tabs.'
        ],
        fixed: [
            'Fixed reinstalling the plugin on the same device showing the `Notebook Navigator could not read its settings and did not start` notice. Enabling the plugin without a settings file now shows a confirmation dialog and starts with default settings after confirmation.',
            'Fixed the preview in the `Change icon` and `Change color` dialog coloring both the icon and the name when ==Apply color to icons only== was enabled. The preview now colors only the icon, and items without a custom icon show their default icon so you can see the color.',
            'Fixed clicking the name of a folder with a folder note opening the note without expanding the folder, even when ==Expand on selection== was enabled.',
            'Fixed new notes not being selected when they got the same name as a note you had just renamed. For example, after renaming a note called `Untitled`, creating a new note kept the renamed note selected instead of the new `Untitled` note.',
            "Fixed the Navigator jumping to the destination folder when moving a note with Obsidian's `Move current file to another folder` command, even though ==Auto-reveal active note== was disabled.",
            'External files dropped into folders now preserve their original bytes instead of being rewritten as UTF-8.'
        ]
    },
    {
        version: '3.2.4',
        date: '2026-07-20',
        showOnUpdate: true,
        youtubeUrl: 'https://www.youtube.com/watch?v=m2maDNtho7Y',
        youtubePlayButton: { x: 80, y: 49, scale: 1.8 },
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
        banner: '3.2.3.jpg',
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
        banner: '3.2.1.jpg',
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
        banner: '3.2.0.jpg',
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
        banner: '3.1.0.jpg',
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
        banner: '3.0.2.jpg',
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
        banner: '3.0.1.jpg',
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
