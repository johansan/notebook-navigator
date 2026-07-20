Read in your language: [English](https://notebooknavigator.com/docs.html) • [العربية](https://notebooknavigator.com/ar/docs.html) • [Deutsch](https://notebooknavigator.com/de/docs.html) • [Español](https://notebooknavigator.com/es/docs.html) • [فارسی](https://notebooknavigator.com/fa/docs.html) • [Français](https://notebooknavigator.com/fr/docs.html) • [Bahasa Indonesia](https://notebooknavigator.com/id/docs.html) • [Italiano](https://notebooknavigator.com/it/docs.html) • [Nederlands](https://notebooknavigator.com/nl/docs.html) • [Polski](https://notebooknavigator.com/pl/docs.html) • [Português](https://notebooknavigator.com/pt/docs.html) • [Português (Brasil)](https://notebooknavigator.com/pt-br/docs.html) • [Русский](https://notebooknavigator.com/ru/docs.html) • [ไทย](https://notebooknavigator.com/th/docs.html) • [Türkçe](https://notebooknavigator.com/tr/docs.html) • [Українська](https://notebooknavigator.com/uk/docs.html) • [Tiếng Việt](https://notebooknavigator.com/vi/docs.html) • [日本語](https://notebooknavigator.com/ja/docs.html) • [한국어](https://notebooknavigator.com/ko/docs.html) • [中文简体](https://notebooknavigator.com/zh-cn/docs.html) • [中文繁體](https://notebooknavigator.com/zh-tw/docs.html)

![Notebook Navigator Screenshot](https://github.com/johansan/notebook-navigator/blob/main/images/notebook-navigator.png?raw=true)

Turn Obsidian into a fast, customizable notes browser with folders, tags, properties and shortcuts in one view.
Visual previews. Full keyboard navigation. Dual-pane layout. Mobile optimized. Works with 100,000+ notes.

If you love using Notebook Navigator, please consider [☕️ Buying me a coffee](https://buymeacoffee.com/johansan) or [Sponsor on GitHub ❤️](https://github.com/sponsors/johansan).

Coming from another app? Read the switching guides for [Evernote](https://notebooknavigator.com/evernote/), [Apple Notes](https://notebooknavigator.com/apple-notes/), [Bear](https://notebooknavigator.com/bear/), [OneNote](https://notebooknavigator.com/onenote/) and [Day One](https://notebooknavigator.com/day-one/).

<br/>

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=Downloads&query=%24%5B%22notebook-navigator%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json) ![Obsidian Compatibility](https://img.shields.io/badge/Obsidian-v1.11.0+-483699?logo=obsidian&style=flat-square) [![Discord](https://img.shields.io/discord/1405458145974943846?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.gg/6eeSUvzEJr)

[![Quality checks](https://github.com/johansan/notebook-navigator/actions/workflows/ci.yml/badge.svg)](https://github.com/johansan/notebook-navigator/actions/workflows/ci.yml) [![Security scan](https://github.com/johansan/notebook-navigator/actions/workflows/codeql.yml/badge.svg)](https://github.com/johansan/notebook-navigator/actions/workflows/codeql.yml) [![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/johansan/notebook-navigator/badge)](https://securityscorecards.dev/viewer/?uri=github.com/johansan/notebook-navigator) [![OpenSSF Baseline](https://www.bestpractices.dev/projects/12715/baseline)](https://www.bestpractices.dev/en/projects/12715/baseline-1)

<br/>

<!-- DOCUMENTATION_START -->

## 1 Installation

1. **Install Obsidian** - Download and install from [obsidian.md](https://obsidian.md/)
2. **Enable community plugins** - Go to Settings → Community plugins → Turn on community plugins
3. **Install Notebook Navigator** - Click "Browse" → Search for "Notebook Navigator" → Install
4. **Install Style Settings (optional)** - For customizing colors and appearance, install [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) plugin by searching for "Style Settings" in Community plugins

<br/>

## 2 Getting started

Here is the official tutorial for learning and mastering Notebook Navigator:

[![Mastering Notebook Navigator](https://raw.githubusercontent.com/johansan/notebook-navigator/main/images/youtube-thumbnail.jpg)](https://www.youtube.com/watch?v=m2maDNtho7Y)

The video has subtitles in 21 languages.

<br/>

## 3 Security and quality

Notebook Navigator is checked with [TypeScript](https://www.typescriptlang.org/), [ESLint](https://eslint.org/) with the official [Obsidian ESLint plugin](https://github.com/obsidianmd/eslint-plugin), [Prettier](https://prettier.io/), [Vitest](https://vitest.dev/) and a production build before changes are merged. The build must complete with zero errors and zero warnings.

Security checks run through [CodeQL](https://codeql.github.com/), with scan history in the [CodeQL workflow runs](https://github.com/johansan/notebook-navigator/actions/workflows/codeql.yml), and the [OpenSSF Scorecard](https://securityscorecards.dev/viewer/?uri=github.com/johansan/notebook-navigator). Current status is shown in the badges at the top of this page.

Notebook Navigator runs locally, but some features make documented HTTP requests for updates, downloads, and remote content. See [section 11 - Network and Diagnostics Disclosure](#11-network-and-diagnostics-disclosure) for the full list.

<br/>

## Table of contents

- [4 Documentation](#4-documentation)
- [5 Keyboard shortcuts](#5-keyboard-shortcuts)
- [6 Synced and local settings](#6-synced-and-local-settings)
- [7 Search](#7-search)
- [8 Custom hotkeys](#8-custom-hotkeys)
- [9 Commands](#9-commands)
- [10 Features](#10-features)
- [11 Network and Diagnostics Disclosure](#11-network-and-diagnostics-disclosure)
- [12 Star History](#12-star-history)
- [13 Contact](#13-contact)
- [14 Questions or issues?](#14-questions-or-issues)
- [15 License](#15-license)

<br/>

## 4 Documentation

- [**API Reference**](docs/api-reference.md) - Public API documentation. Covers metadata management, navigation control and event subscriptions for JavaScript/TypeScript developers.

- [**Theming Guide**](docs/theming-guide.md) - Guide for theme developers. Includes CSS class reference, custom
  properties, and theme examples for light and dark modes.

- [**Startup Process**](docs/startup-process.md) - Plugin initialization sequence. Cold boot vs warm boot flows,
  metadata cache resolution, deferred cleanup, and content generation pipeline. Includes Mermaid diagrams.

- [**Metadata Pipeline**](docs/metadata-pipeline.md) - Cache rebuild sequence, provider pipeline stages, and completion signals. Includes Mermaid diagrams.

- [**Storage Architecture**](docs/storage-architecture.md) - Guide to storage containers (IndexedDB, Local Storage,
  Memory Cache, Settings). Data flow patterns and usage guidelines.

- [**Rendering Architecture**](docs/rendering-architecture.md) - React component hierarchy, virtual scrolling with
  TanStack Virtual, performance optimizations, and data flow.

- [**Scroll Orchestration**](docs/scroll-orchestration.md) - How the plugin ensures accurate scrolling when tree structures change (tag visibility, settings, etc.)

- [**Service Architecture**](docs/service-architecture.md) - Business logic layer: MetadataService, FileSystemOperations, ContentProviderRegistry. Dependency injection patterns and service data flow.

<br/>

## 5 Keyboard shortcuts

| Key                                 | Action                                                                                                                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ↑/↓                                 | Navigate up/down in current pane                                                                                                                                                          |
| ←                                   | In navigation pane: collapse or go to parent<br>In list pane: switch to navigation pane                                                                                                   |
| →                                   | In navigation pane: expand or switch to list pane<br>In list pane: switch to editor                                                                                                       |
| Tab                                 | In navigation pane: switch to list pane<br>In list pane: switch to editor<br>In search field: switch to list pane                                                                         |
| Shift+Tab                           | In list pane: switch to navigation pane<br>In search field: switch to navigation pane                                                                                                     |
| Enter (macOS)<br>F2 (Windows/Linux) | Rename item inline in navigation pane or list pane                                                                                                                                        |
| Enter                               | In navigation pane: open folder note on Windows/Linux by default (when enabled)<br>In list pane: open selected file on all systems (when enabled)<br>In search field: switch to list pane |
| Escape                              | In search field: close search and focus list pane                                                                                                                                         |
| PageUp/PageDown                     | Scroll up/down in navigation pane and list pane                                                                                                                                           |
| Home/End                            | Jump to first/last item in current pane                                                                                                                                                   |
| Delete<br>Backspace                 | Delete selected item                                                                                                                                                                      |
| Cmd/Ctrl+A                          | Select all notes in current folder                                                                                                                                                        |
| Cmd/Ctrl+Click                      | Toggle notes selection                                                                                                                                                                    |
| Shift+Click                         | Select a range of notes                                                                                                                                                                   |
| Shift+Home/End                      | Select from current position to first/last item                                                                                                                                           |
| Shift+↑/↓                           | Extend selection up/down                                                                                                                                                                  |
| Cmd/Ctrl+↑/↓                        | Rearrange selected files up/down in manual sort mode                                                                                                                                      |

**Note:** All keyboard shortcuts can be customized. See [section 8 - Custom hotkeys](#8-custom-hotkeys) for details on adding VIM-style navigation (h,j,k,l), alternate keys, and modifier combinations.

<br/>

## 6 Synced and local settings

Many settings in Notebook Navigator display a sync toggle — a cloud icon that switches between "Enable sync" and "Disable sync". This controls where each setting is stored and whether it is shared across devices.

### 6.1 How sync works

Obsidian plugins store their configuration in `data.json`, located at `.obsidian/plugins/notebook-navigator/data.json` inside your vault folder. When you use a sync service — such as [Obsidian Sync](https://obsidian.md/sync), iCloud, GitHub, Dropbox, or Google Drive — this file is synchronized across all your devices along with the rest of your vault. Any setting saved to `data.json` will propagate to every device that syncs the vault.

<img width="606" height="48" alt="Screenshot 2026-02-18 at 22 58 05" src="https://github.com/user-attachments/assets/01d92458-1967-4008-acae-f722eee0d0a2" />

When sync is **enabled** (default) for a setting, the value is saved to `data.json` and synchronized to all devices through your sync service.

<img width="608" height="49" alt="Screenshot 2026-02-18 at 22 58 14" src="https://github.com/user-attachments/assets/f6f4c839-f8b8-42b5-be43-1cb6c78abdb3" />

<br/>

When sync is **disabled** for a setting, the value is saved to Obsidian's local storage instead. Local storage is device-specific and is not included in vault sync. The setting will have its own independent value on each device. When you disable sync for a setting, the current value is copied to local storage on the current device, and the value is removed from `data.json` to prevent it from overriding local values on other devices.

If you do not use a sync service, the sync toggle has no practical effect since `data.json` is only stored locally.

<br/>

## 7 Search

Notebook Navigator has two search modes: filter search and Omnisearch. Switch between them using the up/down arrow keys or by clicking the search icon. Combine file names, properties, tags, dates, and filters in one query (e.g., `meeting .status=active #work @thisweek`).

### 7.1 Filter search

Filters files by display name, alias, tags, properties, dates, folders, extensions, and tasks within the current folder and subfolders. Default search mode.

**File names and aliases**

- `word` - Match notes with "word" in the display name or an alias
- `word1 word2` - Require every word to match across the display name and aliases
- `-word` - Exclude notes with "word" in the display name or an alias

**Tags**

- `#tag` - Include notes with tag (also matches nested tags like `#tag/subtag`)
- `#` - Include only tagged notes
- `-#tag` - Exclude notes with tag
- `-#` - Include only untagged notes
- `#tag1 #tag2` - Match both tags (implicit AND)
- `#tag1 AND #tag2` - Match both tags (explicit AND)
- `#tag1 OR #tag2` - Match either tag
- `#a OR #b AND #c` - AND has higher precedence: matches `#a`, or both `#b` and `#c`
- Cmd/Ctrl+Click a tag to add with AND. Cmd/Ctrl+Shift+Click to add with OR

**Properties**

- `.key` - Include notes with property key
- `.key=value` - Include notes where the property value contains `value`
- `."Reading Status"` - Property key with whitespace (double-quoted)
- `."Reading Status"="In Progress"` - Keys and values with whitespace must be double-quoted
- `-.key` - Exclude notes with property key
- `-.key=value` - Exclude notes where the property value contains `value`
- Cmd/Ctrl+Click a property to add with AND. Cmd/Ctrl+Shift+Click to add with OR

**Filters**

- `has:task` - Include notes with unfinished tasks
- `-has:task` - Exclude notes with unfinished tasks
- `folder:meetings` - Include notes where a folder name contains `meetings`
- `folder:/work/meetings` - Include notes only in `work/meetings` (not subfolders)
- `folder:/` - Include notes only in the vault root
- `-folder:archive` - Exclude notes where a folder name contains `archive`
- `-folder:/archive` - Exclude notes only in `archive` (not subfolders)
- `ext:md` - Include notes with extension `md` (`ext:.md` is also supported)
- `-ext:pdf` - Exclude notes with extension `pdf`
- Combine with tags, names, and dates (e.g., `folder:/work/meetings ext:md @thisweek`)

**Dates**

- `@today` - Match notes from today using the default date field
- `@yesterday`, `@last7d`, `@last30d`, `@thisweek`, `@thismonth` - Relative date ranges
- `@2026-02-07` - Match a single day (also supports `@20260207`)
- `@2026` - Match a calendar year
- `@2026-02` or `@202602` - Match a calendar month
- `@2026-W05` or `@2026W05` - Match an ISO week
- `@2026-Q2` or `@2026Q2` - Match a calendar quarter
- `@13/02/2026` - Numeric formats with separators (`@07022026` follows your locale when ambiguous)
- `@2026-02-01..2026-02-07` - Match an inclusive day range (open ends supported)
- `@c:...` or `@m:...` - Target created or modified date
- `-@...` - Exclude a date match

The default date field follows the current sort order. When sorting by name, the date field is configured in Settings → Notes → Date → When sorting by name.

**AND/OR behavior**

`AND` and `OR` operators work in tag/property-only queries (queries that contain only `#tag`, `-#tag`, `#`, `-#`, `.key`, `-.key`, `.key=value`, or `-.key=value` filters). If the query also includes names, dates, task filters, folder filters, or extension filters, `AND` and `OR` are matched as file name words instead.

- Operator query: `#work OR .status=started`
- Mixed query: `#work OR ext:md` (`OR` is matched in file names)

### 7.2 Omnisearch

Full-text search across the vault, filtered to the current folder, subfolders, or selected tags. Requires the [Omnisearch](https://github.com/scambier/obsidian-omnisearch) plugin. If Omnisearch is not installed, search falls back to filter search.

Note previews show Omnisearch result excerpts instead of the default preview text.

**Known limitations**

- **Performance** - Can be slow when searching for fewer than 3 characters in large vaults
- **Path filters** - Folder scoping is sent to Omnisearch only for simple ASCII paths. Other paths are filtered after Omnisearch returns results
- **Limited results** - Omnisearch searches the entire vault and returns a limited number of results before filtering, so relevant files from the current folder may not appear if many matches exist elsewhere
- **Preview text** - Note previews are replaced with Omnisearch result excerpts, which may not show the actual search match highlight if it appears elsewhere in the file

<br/>

## 8 Custom hotkeys

Edit `.obsidian/plugins/notebook-navigator/data.json` to customize Notebook Navigator hotkeys. Open the file and locate the `keyboardShortcuts` section. Each entry maps an action to one or more key bindings:

```json
"pane:move-up": [ { "key": "ArrowUp", "modifiers": [] }, { "key": "K", "modifiers": [] } ]
```

Add multiple bindings per action to support alternate keys, like the `ArrowUp` and `K` example above. Combine modifiers in one entry by listing each value, for example `"modifiers": ["Mod", "Shift"]`. Keyboard sequences such as `gg` or `dd` are not supported. Reload Obsidian after editing the file.

### 8.1 Modifiers

| Modifier | Key                                       |
| -------- | ----------------------------------------- |
| `Mod`    | Cmd (macOS) / Ctrl (Win/Linux)            |
| `Alt`    | Alt / Option                              |
| `Shift`  | Shift                                     |
| `Ctrl`   | Control (prefer `Mod` for cross-platform) |

### 8.2 Available actions

| Action                            | Default key(s)                    |
| --------------------------------- | --------------------------------- |
| `pane:move-up`                    | ArrowUp                           |
| `pane:move-down`                  | ArrowDown                         |
| `pane:page-up`                    | PageUp                            |
| `pane:page-down`                  | PageDown                          |
| `pane:home`                       | Home                              |
| `pane:end`                        | End                               |
| `pane:rename`                     | Enter (macOS), F2 (Windows/Linux) |
| `pane:delete-selected`            | Delete, Backspace                 |
| `navigation:collapse-or-parent`   | ArrowLeft                         |
| `navigation:expand-or-focus-list` | ArrowRight                        |
| `navigation:focus-list`           | Tab                               |
| `list:focus-navigation`           | ArrowLeft, Shift+Tab              |
| `list:focus-editor`               | ArrowRight, Tab                   |
| `list:select-all`                 | Mod+A                             |
| `list:extend-selection-up`        | Shift+ArrowUp                     |
| `list:extend-selection-down`      | Shift+ArrowDown                   |
| `list:manual-sort-up`             | Mod+ArrowUp                       |
| `list:manual-sort-down`           | Mod+ArrowDown                     |
| `list:range-to-start`             | Shift+Home                        |
| `list:range-to-end`               | Shift+End                         |
| `search:focus-list`               | Tab, Enter                        |
| `search:focus-navigation`         | Shift+Tab                         |
| `search:close`                    | Escape                            |

<br/>

## 9 Commands

Set custom hotkeys for these commands in Obsidian's Hotkeys settings:

**View & navigation**

- `Notebook Navigator: Open` Opens Notebook Navigator in left sidebar. If already open, moves keyboard focus over to the list pane. **Suggestion:** Bind to a shortcut key like `Cmd/Ctrl+Shift+E` to move keyboard focus to the list pane - **this is essential for full keyboard navigation**
- `Notebook Navigator: Toggle left sidebar` Toggles the left sidebar. When opening, sets the left sidebar view to Notebook Navigator (unlike Obsidian's built-in "Toggle left sidebar" command which restores the previous left sidebar view)
- `Notebook Navigator: Open homepage` Opens the Notebook Navigator view and loads the homepage target configured in settings
- `Notebook Navigator: Select vault profile` Opens modal to switch between vault profiles
- `Notebook Navigator: Select vault profile 1-3` Activates a vault profile by its position. Opens the profile selection modal when no profile exists at that position
- `Notebook Navigator: Reveal file` Reveals current file in navigator. Expands parent folders and scrolls to file. This command is useful if you have the setting `Auto-reveal active note` switched off and want to reveal notes manually. **Suggestion:** Bind to a shortcut key like `Cmd/Ctrl+Shift+R` to quickly change the selected folder or tag to the current file
- `Notebook Navigator: Open all files` Opens all notes in the currently selected folder or tag. When opening 15 or more files, shows a confirmation dialog
- `Notebook Navigator: Navigate to folder` Search dialog to jump to any folder
- `Notebook Navigator: Navigate to tag` Search dialog to jump to any tag
- `Notebook Navigator: Navigate to property` Search dialog to jump to any property key or value
- `Notebook Navigator: Navigate back` Moves to the previous folder, tag, or property selection in navigator history
- `Notebook Navigator: Navigate forward` Moves to the next folder, tag, or property selection in navigator history
- `Notebook Navigator: Add to shortcuts` Adds or removes the current file, folder, tag, or property from shortcuts
- `Notebook Navigator: Open shortcut 1-9` Opens shortcut by its position in the shortcuts list
- `Notebook Navigator: Search` Opens quick search field or focuses it if already open. Search persists between sessions. **Suggestion:** Bind to a shortcut key like `Cmd/Ctrl+Shift+S` for quick file filtering
- `Notebook Navigator: Search whole vault` Selects the vault root folder and opens search with subfolders included (requires `Show root folder` enabled)

**Selection**

- `Notebook Navigator: Select next file` Moves selection to the next file in the current folder or tag view. Respects custom sort order. **Suggestion:** Bind to a shortcut key like `Option+Cmd+Right` to quickly go to the next file in list
- `Notebook Navigator: Select previous file` Moves selection to the previous file in the current folder or tag view. Respects custom sort order. **Suggestion:** Bind to a shortcut key like `Option+Cmd+Left` to quickly go to the previous file in list

**Layout & display**

- `Notebook Navigator: Toggle dual pane layout` Toggle single/dual-pane layout (desktop). **Suggestion:** Bind to a shortcut key like `Cmd/Ctrl+Shift+A` to quickly switch between single-pane and dual-pane layout
- `Notebook Navigator: Toggle dual pane orientation` Toggle dual-pane orientation between horizontal and vertical
- `Notebook Navigator: Toggle descendants` Toggle subfolders / descendants notes display for folders and tags. **Suggestion:** Bind to a shortcut key like `Cmd/Ctrl+Shift+D` to quickly toggle display of notes from subfolders / descendants
- `Notebook Navigator: Toggle hidden folders, tags, and notes` Show or hide hidden folders, tags, and notes
- `Notebook Navigator: Toggle tag sort order` Toggle between alphabetical and frequency-based tag sorting
- `Notebook Navigator: Toggle tags by selection` Toggle limiting tags to those found in notes within the selected folder or property
- `Notebook Navigator: Toggle properties by selection` Toggle limiting properties to those found in notes within the selected folder or tag
- `Notebook Navigator: Toggle compact mode` Toggle list mode between standard and compact
- `Notebook Navigator: Toggle pinned section` Show or hide pinned notes in the list pane
- `Notebook Navigator: Collapse / expand all items` Collapse or expand all items based on the current state. When `Keep selected item expanded` is enabled (default on), all folders except the current one will be collapsed. This is handy to keep the navigation tree tidy when searching for documents
- `Notebook Navigator: Collapse / expand selected item` Collapse or expand the selected navigation item

**Calendar**

- `Notebook Navigator: Toggle calendar` Toggles calendar on or off. **Suggestion:** Bind to a shortcut key like `Cmd/Ctrl+Shift+C` to quickly show the calendar
- `Notebook Navigator: Open daily note` Opens today's daily note based on calendar settings. Creates the note if it doesn't exist
- `Notebook Navigator: Open weekly note` Opens the current weekly note. Creates the note if it doesn't exist
- `Notebook Navigator: Open monthly note` Opens the current monthly note. Creates the note if it doesn't exist
- `Notebook Navigator: Open quarterly note` Opens the current quarterly note. Creates the note if it doesn't exist
- `Notebook Navigator: Open yearly note` Opens the current yearly note. Creates the note if it doesn't exist

**File operations**

**Important:** Obsidian has no context of "current folder or tag", so when creating notes in Obsidian by default they are created in the root folder, same folder as current file, or a specific folder. When working with Notebook Navigator you always want to create new notes in the currently selected folder or tag, so the first thing you should do is bind `Cmd/Ctrl+N` to `Notebook Navigator: Create new note` so new notes are always created in the currently selected folder or tag. The same also applies to moving and deleting files. This is why you should use these commands instead of the built-in Obsidian commands when using Notebook Navigator.

- `Notebook Navigator: Create new note` Create note in currently selected folder. **Suggestion:** Bind `Cmd/Ctrl+N` to this command (unbind from Obsidian's default "Create new note" first)
- `Notebook Navigator: Create new note from template` Create note from template in currently selected folder (requires Templater)
- `Notebook Navigator: Move files` Move selected files to another folder. Selects next file in current folder
- `Notebook Navigator: Merge notes` Create one note from selected Markdown notes in the current list order
- `Notebook Navigator: Convert to folder note` Create a folder matching the file name and move the file inside as the folder note
- `Notebook Navigator: Set as folder note` Rename the active file to its folder note name
- `Notebook Navigator: Detach folder note` Detach the folder note in the selected folder and rename it
- `Notebook Navigator: Pin all folder notes` Pin all folder notes in all folders. Command is only visible when folder notes are enabled
- `Notebook Navigator: Delete files` Delete selected files. Selects next file in current folder

**Tag operations**

- `Notebook Navigator: Add tag to selected files` Dialog to add tag to selected files. Supports creating new tags
- `Notebook Navigator: Set property on selected files` Dialog to set property on selected files
- `Notebook Navigator: Remove tag from selected files` Dialog to remove specific tag. Removes immediately if only one tag
- `Notebook Navigator: Remove all tags from selected files` Clear all tags from selected files with confirmation

**Maintenance**

- `Notebook Navigator: Rebuild cache` Rebuilds the local Notebook Navigator cache. Use this if you experience missing tags, incorrect previews or missing feature images
- `Notebook Navigator: Restore default settings` Replaces the settings file with verified defaults after saving a timestamped backup. This command is only available when Notebook Navigator cannot read its settings and stops during startup

### 9.1 Command IDs

| Command ID                                          | Command name                                               |
| --------------------------------------------------- | ---------------------------------------------------------- |
| `notebook-navigator:open`                           | Notebook Navigator: Open                                   |
| `notebook-navigator:toggle-left-sidebar`            | Notebook Navigator: Toggle left sidebar                    |
| `notebook-navigator:open-homepage`                  | Notebook Navigator: Open homepage                          |
| `notebook-navigator:select-profile`                 | Notebook Navigator: Select vault profile                   |
| `notebook-navigator:select-profile-1`               | Notebook Navigator: Select vault profile 1                 |
| `notebook-navigator:select-profile-2`               | Notebook Navigator: Select vault profile 2                 |
| `notebook-navigator:select-profile-3`               | Notebook Navigator: Select vault profile 3                 |
| `notebook-navigator:reveal-file`                    | Notebook Navigator: Reveal file                            |
| `notebook-navigator:open-all-files`                 | Notebook Navigator: Open all files                         |
| `notebook-navigator:navigate-to-folder`             | Notebook Navigator: Navigate to folder                     |
| `notebook-navigator:navigate-to-tag`                | Notebook Navigator: Navigate to tag                        |
| `notebook-navigator:navigate-to-property`           | Notebook Navigator: Navigate to property                   |
| `notebook-navigator:navigate-back`                  | Notebook Navigator: Navigate back                          |
| `notebook-navigator:navigate-forward`               | Notebook Navigator: Navigate forward                       |
| `notebook-navigator:add-shortcut`                   | Notebook Navigator: Add to shortcuts                       |
| `notebook-navigator:open-shortcut-1`                | Notebook Navigator: Open shortcut 1                        |
| `notebook-navigator:open-shortcut-2`                | Notebook Navigator: Open shortcut 2                        |
| `notebook-navigator:open-shortcut-3`                | Notebook Navigator: Open shortcut 3                        |
| `notebook-navigator:open-shortcut-4`                | Notebook Navigator: Open shortcut 4                        |
| `notebook-navigator:open-shortcut-5`                | Notebook Navigator: Open shortcut 5                        |
| `notebook-navigator:open-shortcut-6`                | Notebook Navigator: Open shortcut 6                        |
| `notebook-navigator:open-shortcut-7`                | Notebook Navigator: Open shortcut 7                        |
| `notebook-navigator:open-shortcut-8`                | Notebook Navigator: Open shortcut 8                        |
| `notebook-navigator:open-shortcut-9`                | Notebook Navigator: Open shortcut 9                        |
| `notebook-navigator:search`                         | Notebook Navigator: Search                                 |
| `notebook-navigator:search-vault`                   | Notebook Navigator: Search whole vault                     |
| `notebook-navigator:toggle-dual-pane`               | Notebook Navigator: Toggle dual pane layout                |
| `notebook-navigator:toggle-dual-pane-orientation`   | Notebook Navigator: Toggle dual pane orientation           |
| `notebook-navigator:toggle-calendar`                | Notebook Navigator: Toggle calendar                        |
| `notebook-navigator:open-daily-note`                | Notebook Navigator: Open daily note                        |
| `notebook-navigator:open-weekly-note`               | Notebook Navigator: Open weekly note                       |
| `notebook-navigator:open-monthly-note`              | Notebook Navigator: Open monthly note                      |
| `notebook-navigator:open-quarterly-note`            | Notebook Navigator: Open quarterly note                    |
| `notebook-navigator:open-yearly-note`               | Notebook Navigator: Open yearly note                       |
| `notebook-navigator:toggle-descendants`             | Notebook Navigator: Toggle descendants                     |
| `notebook-navigator:toggle-hidden`                  | Notebook Navigator: Toggle hidden folders, tags, and notes |
| `notebook-navigator:toggle-tag-sort`                | Notebook Navigator: Toggle tag sort order                  |
| `notebook-navigator:toggle-tags-by-selection`       | Notebook Navigator: Toggle tags by selection               |
| `notebook-navigator:toggle-properties-by-selection` | Notebook Navigator: Toggle properties by selection         |
| `notebook-navigator:toggle-compact-mode`            | Notebook Navigator: Toggle compact mode                    |
| `notebook-navigator:toggle-pinned-section`          | Notebook Navigator: Toggle pinned section                  |
| `notebook-navigator:collapse-expand`                | Notebook Navigator: Collapse / expand all items            |
| `notebook-navigator:collapse-expand-selected-item`  | Notebook Navigator: Collapse / expand selected item        |
| `notebook-navigator:new-note`                       | Notebook Navigator: Create new note                        |
| `notebook-navigator:new-note-from-template`         | Notebook Navigator: Create new note from template          |
| `notebook-navigator:move-files`                     | Notebook Navigator: Move files                             |
| `notebook-navigator:merge-notes`                    | Notebook Navigator: Merge notes                            |
| `notebook-navigator:select-next-file`               | Notebook Navigator: Select next file                       |
| `notebook-navigator:select-previous-file`           | Notebook Navigator: Select previous file                   |
| `notebook-navigator:convert-to-folder-note`         | Notebook Navigator: Convert to folder note                 |
| `notebook-navigator:set-as-folder-note`             | Notebook Navigator: Set as folder note                     |
| `notebook-navigator:detach-folder-note`             | Notebook Navigator: Detach folder note                     |
| `notebook-navigator:pin-all-folder-notes`           | Notebook Navigator: Pin all folder notes                   |
| `notebook-navigator:delete-files`                   | Notebook Navigator: Delete files                           |
| `notebook-navigator:add-tag`                        | Notebook Navigator: Add tag to selected files              |
| `notebook-navigator:set-property`                   | Notebook Navigator: Set property on selected files         |
| `notebook-navigator:remove-tag`                     | Notebook Navigator: Remove tag from selected files         |
| `notebook-navigator:remove-all-tags`                | Notebook Navigator: Remove all tags from selected files    |
| `notebook-navigator:rebuild-cache`                  | Notebook Navigator: Rebuild cache                          |
| `notebook-navigator:restore-default-settings`       | Notebook Navigator: Restore default settings               |

<br/>

## 10 Features

### 10.1 Interface

- **Dual-pane layout** - Navigation pane (folders/tags/properties) and list pane (files)
- **Single-pane mode** - Navigation and list views with animated transitions
- **Resizable panes** - Horizontal or vertical split orientation
- **Independent UI zoom** - Scale Notebook Navigator without changing Obsidian zoom
- **Startup view** - Navigation-first or list-first
- **Multi-language support** - 21 languages with RTL layout support
- **Interface icon set** - Customizable UI icons across the plugin

### 10.2 Navigation

- **Vault profiles** - Multiple filtered views with per-profile hidden folders/tags/notes, file visibility, banner, and shortcuts
- **Shortcuts** - Notes, folders, tags, properties, and saved searches with pinning and reordering
- **Recent notes/files** - Recent items section stored per vault profile, optionally pinned with shortcuts
- **Calendar** - Daily notes calendar with day selection, feature image previews, and vertical split support
- **Folder tree** - Expand/collapse navigation with manual root folder ordering
- **Tag tree** - Hierarchical tags with configurable root tag ordering
- **Property browser** - Browse file properties organized by key and value with file counts, custom colors, icons, and drag and drop
- **Auto-reveal active file** - Folder expansion and scroll-to-selection
- **Keyboard and commands** - Configurable hotkeys, selection history back/forward commands, next/previous file commands, open shortcut 1–9 commands

### 10.3 Organization

- **Pin notes** - Keep important notes at the top of folders and tags
- **Folder notes** - Set/detach folder notes, pin folder notes, open in new tab option
- **Tag operations** - Add/remove/clear tags, rename/delete tags, create note in tag, drag-and-drop tag hierarchy
- **Custom sort and grouping** - Override sort/group settings per folder or tag
- **Per-folder/tag appearances** - Title rows, preview rows, compact mode, descendants toggle
- **Hidden content** - Hidden folders/tags/notes/files with patterns, frontmatter properties, and tag-based filtering per vault profile
- **Exclude folders from descendants** - Omit folders when collecting notes from subfolders, per vault profile; excluded folders stay visible and show their notes when selected
- **Color and icon system** - Folder/tag/property/file colors, icon packs, emoji/Lucide icons, frontmatter read/write, icon mapping by file name and file type category
- **Name warnings** - Warn about forbidden filesystem characters and characters that break Obsidian links when naming files and folders

### 10.4 File display

- **Note previews** - 1–5 preview lines with optional HTML stripping
- **Thumbnails** - Featured images plus auto-generated thumbnails for PDF, SVG, and drawing files stored in the metadata cache
- **External images** - Optional downloads for external images and YouTube thumbnails
- **Date grouping** - Group notes by Today, Yesterday, Previous 7 days, Previous 30 days, months, and years when sorted by date
- **Frontmatter support** - Read note names and timestamps from frontmatter fields
- **Note metadata** - Show modification date and tags in the file list
- **Custom properties** - Display frontmatter properties or word count in file list with per-folder/tag overrides and custom colors
- **Parent folder display** - Optional parent folder name and icon in file list
- **Compact mode** - Compact display when preview, date, and images are disabled
- **Clickable tags** - Tags in file list navigate directly to that tag

### 10.5 Productivity

- **Search** - Filter by file name, aliases, tags, properties, dates, folders, extensions, and tasks with AND/OR/exclusions
- **Omnisearch integration** - Full-text search via [Omnisearch](https://github.com/scambier/obsidian-omnisearch)
- **Drag and drop** - File moves, tagging, shortcut assignment, tag tree reparenting, spring-loaded folders
- **Context menus** - Create notes/folders/canvases/bases/drawings and run file/tag actions
- **Drawings** - Create Excalidraw and Tldraw drawings from navigation and list pane menus
- **Templates** - New note from template commands with the Templater plugin
- **File operations** - Create, rename, duplicate, move, trash files and folders
- **Filtering** - Folder/tag/note/file exclusions with patterns and frontmatter properties

<br/>

## 11 Network and Diagnostics Disclosure

Notebook Navigator runs locally, but some features make HTTP requests from Obsidian. Startup debug logging can also write a local diagnostic file in your vault.

### 11.1 Release update checks (Optional)

- **Setting:** "Check for new version on start"
- **Request:** `https://api.github.com/repos/johansan/notebook-navigator/releases/latest`
- **Frequency:** At most once per 24 hours, on startup
- **Data:** Sends standard HTTP metadata; does not include vault content

### 11.2 Icon pack downloads (Optional)

- **Setting:** Enable an icon pack in the Icon Packs tab
- **Requests:** `https://raw.githubusercontent.com/johansan/notebook-navigator/main/icon-assets/...` (manifest, font, metadata)
- **Storage:** Stored locally in IndexedDB

### 11.3 External images, videos, and YouTube thumbnails

- **Feature images (Optional):** Controlled by the "Download external images" setting. Downloads remote images and YouTube thumbnails for feature images and stores them locally in IndexedDB.
- **Welcome modal (First launch):** Loads a static thumbnail from `https://raw.githubusercontent.com/johansan/notebook-navigator/main/images/youtube-thumbnail.jpg`.
- **What's new modal (On update / when opened):** Loads release banner images from `https://raw.githubusercontent.com/johansan/notebook-navigator/main/images/version-banners/<id>.jpg` for release notes that include a banner.
- **What's new modal (On update / when opened):** Loads release videos from `https://raw.githubusercontent.com/johansan/notebook-navigator/main/images/version-banners/<id>.mp4` for release notes that include a video.
- **What's new modal (When opening a release video):** Opens release videos from `https://cdn.jsdelivr.net/gh/johansan/notebook-navigator@main/images/version-banners/<id>.mp4` so browsers can play the video directly.
- **What's new modal (On update / when opened):** Loads YouTube thumbnails from `https://img.youtube.com/vi/<id>/...` for release notes that include a YouTube link.

### 11.4 Startup debug files (Optional)

- **Setting:** "Startup debug logging"
- **Storage:** Writes a timestamped `nn-debug-...md` file in the vault root, then stops after startup settles. The file may sync if the vault root is synced.
- **Data:** Includes startup timing, plugin version, minimum supported Obsidian version, platform, cache counts, queue counts, IndexedDB status, and diagnostic errors. It does not include note contents, tag names, frontmatter values, or a list of vault files.
- **Paths and identifiers:** Startup initialization, PDF diagnostics, and error cases can include the Obsidian app/vault identifier, vault-relative PDF paths, or error stack details. Review and redact the file before sharing it publicly.
- **Upload:** Notebook Navigator does not upload debug files. They are shared only if you upload, attach, or sync them outside the plugin.

### 11.5 Privacy and data handling

- Notebook Navigator does not send note content, file names, tags, or debug files to a Notebook Navigator server.
- Requests to GitHub, YouTube, and any external image host are made directly from your device and include standard HTTP metadata (IP address, user-agent, and similar).
- Downloaded icon packs and images are stored locally (IndexedDB). Recent notes/files and UI state are stored locally (Obsidian local storage).

<br/>

## 12 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=johansan/notebook-navigator&type=date&legend=top-left)](https://www.star-history.com/#johansan/notebook-navigator&type=date&legend=top-left)

<br/>

## 13 Contact

Notebook Navigator is built and maintained by [Johan Sanneblad](https://www.linkedin.com/in/johansan/). Johan has a PhD in Software Development and has worked with innovation development for companies such as Apple, Electronic Arts, Google, Microsoft, Lego, SKF, Volvo Cars, Volvo Group and Yamaha.

Feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/johansan/).

<br/>

## 14 Questions or issues?

**[Join our Discord](https://discord.gg/6eeSUvzEJr)** for support and discussions, or open an issue on the
[GitHub repository](https://github.com/johansan/notebook-navigator).

**Pull requests are not accepted.** With the emergence of agentic coding, outside code submissions cannot be quality-controlled to the standard the project maintains, so any pull request is closed automatically. Contribute ideas as feature requests instead — [open an issue](https://github.com/johansan/notebook-navigator/issues). See [CONTRIBUTING.md](https://github.com/johansan/notebook-navigator/blob/main/CONTRIBUTING.md) for details.

<br/>

## 15 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](https://github.com/johansan/notebook-navigator/blob/main/LICENSE) file for details.
