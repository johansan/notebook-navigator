# Frequently asked questions

Answers to the most common questions from the [issue tracker](https://github.com/johansan/notebook-navigator/issues).
For known conflicts with other plugins, themes, and sync services, see
[Known issues](https://github.com/johansan/notebook-navigator/issues/363). For support and discussions,
[join our Discord](https://discord.gg/6eeSUvzEJr).

## Files and folders

### Why don't Excel, Word, or PowerPoint files show up?

By default the navigator shows documents only (`.md`, `.canvas`, `.base`). Change **Settings → Notebook Navigator →
Vault setup → Show file types**:

- **Documents** - Markdown, Canvas, and Base files
- **Supported** - Adds file types Obsidian can open, such as images, PDF, audio, and video
- **All** - Shows every file in the vault

File types Obsidian cannot open, such as `.xlsx` and `.docx`, open in the system default application.

### A file or folder is missing from the navigator

Check these settings in order:

1. **Show file types** (Vault setup) - See the previous question
2. **Hide files** and **Hide folders** (Display filters, vault profile) - Name and path patterns hidden by the active
   vault profile
3. **Hide notes with tags** and **Hide notes with property rules** (Display filters, vault profile) - Notes hidden by
   tag or property
4. Obsidian **Settings → Files and links → Excluded files** - Exclusions applied by Obsidian itself

Hidden items can be shown temporarily with the eye button in the navigation pane or the **Toggle hidden folders, tags,
and notes** command.

### How do I open notes in a new tab?

- Right-click a note and choose **Open in new tab**
- Set **Settings → Notebook Navigator → Appearance & behavior → Multi-select modifier** to **Option/Alt click**.
  Cmd/Ctrl click then opens notes in a new tab, matching the Obsidian file explorer
- Enable **Open new notes in new tab** so the Create new note command uses a new tab

### How do I stop Notebook Navigator from opening a note on startup?

Set **Settings → Notebook Navigator → Appearance & behavior → Homepage** to **None**.

## Calendar and daily notes

### How do I turn off the calendar?

Disable **Settings → Notebook Navigator → Calendar → Enable calendar**. The calendar can also be shown or hidden with
the calendar button in the navigation pane or the **Toggle calendar** command.

### How do I change the first day of the week?

Set **Settings → Notebook Navigator → Calendar → Locale**. The locale controls date formatting, week numbering, and the
first day of the week.

### The calendar does not use my Daily Notes plugin settings

Set **Settings → Notebook Navigator → Calendar → Daily note source** to **Daily notes (core plug-in)**. The folder and
date format are then read from the Daily Notes core plugin. When the source is set to **Notebook Navigator**, the
calendar uses its own folder and format settings instead.

### Do notes created from the calendar support Templater?

Yes. When the [Templater](https://github.com/SilentVoid13/Templater) plugin is installed, templates used by the calendar
and folder notes run with full Templater support. Without Templater, only built-in template variables are processed.

## Settings and sync

### What does the cloud icon next to some settings do?

It is a sync toggle that switches a setting between synced and local storage:

- **Sync enabled** (default) - The value is saved in `.obsidian/plugins/notebook-navigator/data.json` inside the vault.
  This file is synchronized across devices by Obsidian Sync or whichever sync service the vault uses, not by Notebook
  Navigator
- **Sync disabled** - The value is saved in Obsidian's local storage on the current device and removed from `data.json`,
  so each device keeps its own independent value

Without a sync service the toggle has no practical effect, since `data.json` stays on one device. See
[README section 6](https://github.com/johansan/notebook-navigator#6-synced-and-local-settings) for details.

### What does "(vault profile)" mean on a setting?

Settings marked **(vault profile)** are stored per profile. Each profile keeps its own file type filter and hide rules,
and switching profiles switches the visible content.

## Search

### Why does search not find text inside my notes?

The default filter search matches file names, aliases, tags, properties, dates, folders, extensions, and tasks.
Full-text search requires the [Omnisearch](https://github.com/scambier/obsidian-omnisearch) plugin; with Omnisearch
installed, switch the search mode in the search bar. See
[README section 7](https://github.com/johansan/notebook-navigator#7-search) for the full filter syntax.

### Can I search for multiple tags with AND or OR?

Yes. `#tag1 #tag2` matches both tags, `#tag1 OR #tag2` matches either. AND has higher precedence than OR. The full
syntax is in [README section 7.1](https://github.com/johansan/notebook-navigator#71-filter-search).

## Other plugins and themes

### Notebook Navigator stopped working after installing another plugin

Several plugins patch Obsidian internals in ways that conflict with Notebook Navigator, including Editing toolbar,
Simple banner, and Quiet outline. See [Known issues](https://github.com/johansan/notebook-navigator/issues/363) for the
current list and workarounds.

## Project

### How do I request a feature?

Check the [feature request wiki](https://github.com/johansan/notebook-navigator/wiki) first, then
[open an issue](https://github.com/johansan/notebook-navigator/issues/new/choose) with the feature request template.

### Do you accept pull requests?

No. Pull requests are closed automatically. Contribute ideas as feature requests instead. See
[CONTRIBUTING.md](https://github.com/johansan/notebook-navigator/blob/main/CONTRIBUTING.md).
