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
 * Not supported:
 * - Italics, headings, inline code, HTML
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
    },
    {
        version: '2.5.8',
        date: '2026-04-19',
        showOnUpdate: true,
        improved: ['Calendar in the right sidebar now always shows a Today button in top right corner.'],
        changed: [
            'Calendar auto-reveal no longer changes the current month for quarterly and yearly notes.',
            'Calendar > Locale now also controls daily note file name formatting to match other calendar plugins.'
        ],
        fixed: [
            'The calendar in right sidebar will now keep its position after plugin reloads or calendar is moved to left sidebar and back.'
        ]
    },
    {
        version: '2.5.7',
        date: '2026-04-09',
        showOnUpdate: true,
        new: ['Setting: General > Homepage now lets you open a daily, weekly, monthly, or quarterly note on startup.'],
        improved: [
            'Added informative text on hover for the unfinished task icon in list pane, showing the number of unfinished tasks. If note tooltips are enabled the unfinished note count is included in the note tooltip.',
            'Calendar now shows the active-note outline for weekly, monthly, quarterly, and yearly notes.'
        ],
        changed: [
            'Changed the format used for storing icon values in frontmatter to a deterministic format. For example, the Material icon crop_16_9 is now saved as **mi:crop_16_9** instead of **MiCrop169**. The previous format could not reliably round-trip icon names with numbers. Existing supported legacy values are still read automatically through legacy Iconize mappings.',
            'The homepage setting was redesigned. Previously, you could only choose a specific file as the homepage. Now you can choose between ==None==, ==File==, ==Daily note==, ==Weekly note==, ==Monthly note==, and ==Quarterly note==. The separate mobile homepage option was removed — use local setting overrides to configure a different homepage per device. Existing settings are migrated automatically.'
        ],
        fixed: [
            'Fixed icons with numbers in their name, such as **crop_16_9** and **badge-3d**, not displaying correctly after being saved to frontmatter.',
            'List pane: fixed hairline gaps between adjacent notes with the same custom background color and incorrect border radius in compact mode.'
        ]
    },
    {
        version: '2.5.6',
        date: '2026-04-03',
        showOnUpdate: false,
        new: [
            'New setting: List > Appearance > ==Always show all tag and property pills==. When enabled, tag and property pills remain visible even when they match the current navigation selection.'
        ],
        fixed: [
            'Fixed issue introduced in 2.5.5 where tag and property pills that matched the current navigation selection were hidden in the renderer but still counted by the virtualizer, causing incorrect item heights and scroll position drift in the list pane.'
        ]
    },
    {
        version: '2.5.5',
        date: '2026-04-02',
        new: [
            'New setting: Advanced > ==Import and export settings==. You can now export and import settings as a JSON file.',
            'New setting: General > Behavior > ==Ignore events from other windows==. When enabled, auto-reveal does not trigger when working with notes in a different window. Default enabled.',
            'New setting: General > Mouse buttons > ==Mouse back/forward buttons==. Configures the action for mouse back and forward buttons on desktop: use system default, switch panes in single-pane mode, or navigate history.'
        ],
        improved: [
            'Calendar context menu now includes options to open notes in a new tab, to the right, or in a new window.',
            'Tag and property value pills that match the current navigation selection are hidden in the list pane.',
            'Empty checkbox list items are no longer counted as tasks.'
        ],
        fixed: [
            'Auto-reveal is now saved to the navigation history.',
            'Startup file is now registered in navigation history.',
            'Reveal file now scrolls the selected note into view every time in the list pane, including repeated reveals of the same note.',
            'Reveal operations on hidden files no longer switch folder, tag, or property context while Show hidden items is off.'
        ]
    },
    {
        version: '2.5.4',
        date: '2026-03-30',
        showOnUpdate: true,
        new: [
            'New setting and menu option: ==Filter tags by selection==. Limits the tags section to tags that appear in notes within the selected folder or property.',
            'New setting and menu option: ==Filter properties by selection==. Limits the properties section to properties that appear in notes within the selected folder or tag.',
            '==Apply sort to descendants==, and ==Apply appearance to descendants== - two new menu options to apply the current sort or appearance setting to all subfolders, subtags, or property values.',
            'New commands: ==Navigate back== and ==Navigate forward==. Moves through recent folder, tag, and property selections in the navigator.'
        ],
        improved: [
            'Calendar now follows the active daily note and switches to the matching month automatically.',
            'Calendar settings now warn when the weekly notes pattern uses ISO week tokens that override the locale first day of week.',
            'Improved list pane scroll performance by reducing repeated work in visible note rows.',
            'Quick actions are now hidden while scrolling the list pane.'
        ],
        fixed: ['Tag and property pills in the list pane now show rainbow colors.']
    },
    {
        version: '2.5.3',
        date: '2026-03-22',
        showOnUpdate: false,
        improved: [
            'Calendar in the right pane now always shows 6 weeks.',
            'Property pills in list pane now support custom URI schemes like "zotero://..." and "file://...".'
        ],
        fixed: [
            'Boolean and number properties are now shown as property pills in the list pane.',
            'Metadata cleanup now removes stale property-key selections.'
        ]
    },
    {
        version: '2.5.2',
        date: '2026-03-20',
        showOnUpdate: true,
        new: [
            'New setting: Calendar > ==Month name format==. Choose between "full" (January) or "short" (Jan).',
            'New style setting: Calendar > ==Feature image overlay color==. Adds a color overlay to darken or tint feature images in calendar days and months. Set separate colors for light and dark mode.'
        ],
        improved: [
            '**Icons in frontmatter** now support wikilink-wrapped SVG paths like **[[icons/folder.svg]]**.',
            '**Yearly calendar months now longer show "(n)" suffix**, instead they show the same circles as daily notes (filled circle for notes, hollow circle for tasks).',
            '**Single-line file titles and preview text in list pane now truncate with ellipsis** instead of dropping the last word before the ellipsis.'
        ],
        fixed: [
            'The yearly calendar month outline now always follows the active month.',
            'Unicode NFC and NFD text now match as equivalent in frontmatter property lookup, tag rules, and filename icon matching.'
        ]
    },
    {
        version: '2.5.1',
        date: '2026-03-16',
        showOnUpdate: true,
        bannerUrl: true,
        new: [
            '==The monthly calendar view now shows feature images for each month==. By default it shows the image for the first note of the month, but you can change this by right-clicking a day and choose "Set highlight".',
            'New setting: Navigation > Rainbow colors > ==Consistent brightness across hues==. If enabled (default), hue transitions use the same brightness levels.',
            'New setting: Navigation > Rainbow colors > ==Separate light and dark mode colors==. Configure different colors for light and dark mode. Default disabled.',
            'New setting: ==Calendar > Enable calendar==. Simple switch to disable all calendar functionality in Notebook Navigator.',
            'New setting: List > Notes > ==Fall back to note content==. Enabled by default, disable if you only want text from properties to display in the preview.'
        ],
        changed: [
            'After many many hours of work I decided that the feature "Scope pinned notes to their location" used to show files pinned in their own folder will only work for folders. The complexities involved with branching in tags and properties makes this too complex to be useful. I also renamed it to "Only pin notes in their folder" to make it extra clear what it does. This feature is useful for folder notes or if you have many pinned notes, to avoid them stacking up when you show notes from subfolders.'
        ],
        improved: [
            'Property tree now shows the values for boolean `true` and `false`.',
            'Property tree now treats frontmatter `null` values as unassigned instead of converting them to `true`.',
            'Calendar now indicates the currently selected day with a border. You can customize this color in style settings or using the CSS variable --nn-theme-calendar-day-active-border-color.',
            'Expand / Collapse all now collapses down to root items (Vault, Tags, Properties), and the setting Navigation > "Collapse items" now also supports properties.',
            'Option+click chevrons now also works with tags and properties to expand or collaps all siblings in the tree. Previously it only worked for folders.'
        ],
        fixed: [
            'Fixed an issue with "Featured image pixel size" where it would not save the resolution if the setting was set to non-synced.',
            'Fixed so rainbow colors are shown in the list pane if List > Notes > "Show parent folder color" is enabled.',
            'Fixed so the "new version available" popup only shows at most once per day, not on every startup.'
        ]
    },
    {
        version: '2.5.0',
        date: '2026-03-09',
        showOnUpdate: true,
        bannerUrl: true,
        new: [
            'New feature: ==Rainbow colors==! You can now set individual rainbow colors for shortcuts, recent files, folders, tags or properties! Pick custom colors, choose between Hue (color wheel) and RGB (direct blend). There are lots of configuration settings, so just head over to **Settings > Navigation > Rainbow colors** to check it out!',
            'You can now set ==background colors for files== in the list pane. Great to make individual files stand out! Background colors can be set in menus or frontmatter.',
            'New setting: List > Notes > ==Unfinished task background==. This makes it super easy to find notes with unfinished tasks in the list pane.',
            'New setting: List > Notes > ==Feature image display size==. You can now increase the max vertical size of feature images from 64px to 128px in list pane.',
            'New setting: List > Notes > ==Feature image pixel size==. You can now set the max thumbnail width from 256 pixels (default) up to 512 pixels for higher-resolution thumbnails in calendar overlays and list pane.',
            'New setting: List > Notes > ==Link property pills to notes==. When enabled (default), properties that are file links can be clicked to open that file.',
            'New setting: List > Notes > ==Link property pills to URLs==. When enabled (default), properties that are URLs can be clicked to open the URL. Very handy if you keep web references in your notes.',
            'New command: ==Toggle dual pane orientation== to quickly change orientation between horizontal and vertical dual panes.',
            '==New API 2.0==: Added whenReady(), tag collection helpers, property node helpers, new tag and property context menu hooks and many other improvements.'
        ],
        improved: [
            'The ==properties tree now supports custom appearance and sort order== in list pane.',
            'The setting ==Only pin notes in their folder== (previously called "Limit pinned notes") only affects folder views.',
            'You can now click directly on property keys in the "Property key visibility modal" to quickly toggle visibility in all three places: navigation pane, list pane, and file menus.',
            'Shortcut rows no longer reserve trailing badge space when Shortcut badge is None.'
        ],
        changed: [
            'Updated fontawesome icons 7.1 to 7.2 and simple-icons 15.20 to 16.11. ==Important, this is a breaking change!==. Simple-icons removed 44 icons such as canva, openai and slack. If you used these icons you need to reassign them to new icons.'
        ],
        fixed: [
            'Fixed an issue where deleting the active note could trigger "file not found" errors in Linter when "Lint on Focused File Change" is enabled.',
            'Fixed an issue where disabling "Show icons for shortcuts and recent items" also disabled the icon for the Properties root virtual folder.',
            'Fixed an issue where the Properties folder was showing if there were no visible properties in Navigation pane and "Show properties folder" was disabled.'
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
