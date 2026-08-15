# Frequently asked questions

Answers to the most common questions from the [issue tracker](https://github.com/johansan/notebook-navigator/issues).
Reported conflicts with other plugins, themes, and sync services are tracked in
[Known issues](https://github.com/johansan/notebook-navigator/issues/363). For support and discussions,
[join our Discord](https://discord.gg/6eeSUvzEJr).

## Files, folders, and display

### How do I show and open Excel, Word, PowerPoint, or other files?

By default the navigator shows file types supported by Obsidian. Change **Settings → Notebook Navigator → General →
Vault setup → Show file types (vault profile)**:

- **Documents (.md, .canvas, .base)** - Markdown, Canvas, and Base files
- **Supported (opens in Obsidian)** (default) - File types Obsidian can open, such as images, PDF, audio, and video
- **All (may open externally)** - Adds all other file extensions, including files that may open externally

Notebook Navigator passes normal file opens to Obsidian. On desktop, right-click a file and choose **Open in default
app** to open it with the operating system's default application. This action does not use Custom File Viewer rules, and
Notebook Navigator has no setting for alternative applications or per-extension routing.

### A file or folder is missing from the navigator

Check these settings in order:

1. **Show file types** (Vault setup) - See the previous question
2. **Hide files (vault profile)** and **Hide folders (vault profile)** (Display filters) - Name and path patterns hidden
   by the active vault profile
3. **Hide notes with tags (vault profile)** and **Hide notes with property rules (vault profile)** (Display filters) -
   Notes hidden by tag or property
4. **Hide folder notes in list** (Folders & folder notes, Folder note files) - Recognized folder-note files hidden from
   the file list
5. **Hide exported preview images** (List pane, Drawing previews) - Exported PNG previews hidden for drawing files

If a note appears in its own folder but not while browsing an ancestor, also check **Exclude folders from descendants
(vault profile)** and **Show notes from subfolders / descendants**. The eye button or **Toggle hidden folders, tags, and
notes** command temporarily reveals items hidden by **Hide files**, **Hide folders**, tag and property hide rules, and
exported-preview filtering. It does not override **Show file types**, folder-note hiding, or subfolder/descendant
collection and exclusion settings.

### How do I open notes in a new tab?

- Right-click a note and choose **Open in new tab**
- On desktop and tablets, set **Settings → Notebook Navigator → Appearance & behavior → Multi-select modifier** to
  **Option/Alt click**. Cmd/Ctrl click then opens notes in a new tab, matching the Obsidian file explorer
- Enable **Open new notes in new tab** so the Create new note command uses a new tab

### How do I stop Notebook Navigator from opening a note on startup?

Set **Settings → Notebook Navigator → Appearance & behavior → Homepage** to **None**.

### How do I keep short filenames while showing descriptive names?

Enable **Settings → Notebook Navigator → Frontmatter fields → Use frontmatter metadata**, then add a dedicated field
such as `title` to **Name fields**. For example, the file `2026-08-05.md` can be displayed as `Trip to Milan`:

```yaml
---
title: Trip to Milan
---
```

Do not use `aliases` as a name field. Obsidian uses aliases as alternative link targets, so an alias such as
`Projects/Europe/Trip to Milan` would also become the displayed name. Leave **Name fields** empty to always display the
filename.

### Can I name folder notes something other than the folder name?

Yes. Under **Settings → Notebook Navigator → Folders & folder notes → Folder note files**:

- Set **Folder note name** to a fixed name such as `index`. A Markdown folder note for `Learning` then uses
  `Learning/index.md`.
- Set **Folder note name pattern** to a pattern such as `{{folder}} MOC`. A Markdown folder note for the same folder
  then uses `Learning/Learning MOC.md`.

When **Folder note name pattern** is set, **Folder note name** does not apply. Notebook Navigator uses one naming rule
throughout the vault; multiple possible basenames, fallback rules, and regular expressions are not supported.

### How do I style note rows using frontmatter?

Enable **Settings → Notebook Navigator → Frontmatter fields → Use frontmatter metadata** and configure the **Icon
field**, **Color field**, and **Background field**. With the default field names, a note can contain:

```yaml
---
icon: '📦'
color: '#666666'
background: '#F2F2F2'
---
```

Obsidian's `cssclasses` property styles the note view. It is not applied to rows in Notebook Navigator's virtualized
file list.

### Which remote links can be used as feature images?

Notebook Navigator can use direct HTTPS images and YouTube thumbnails when **Settings → Notebook Navigator → File
display → Feature image → Download external images** is enabled. The URL must be in a configured feature-image
frontmatter property or a Markdown image embed. For direct images, the server must accept a HEAD request and report a
supported image type and content length within Notebook Navigator's size limits. For example:

```markdown
![Cover](https://cdn.jsdelivr.net/gh/johansan/notebook-navigator@main/images/banner.png)
```

For a YouTube thumbnail:

```markdown
![](https://youtu.be/m2maDNtho7Y)
```

Plain HTTP images are rejected because downloading them would use an unencrypted connection. A webpage URL is not an
image URL, and Notebook Navigator does not extract OpenGraph images or images generated internally by rich-link preview
plugins.

## Tags, properties, and search

### How do I change the order or layout of tag and property pills?

Select the `Reorder navigation` button in the navigation pane toolbar and arrange the root tags and properties. Tag
pills and property-key groups whose keys are shown in navigation follow the same order; list-only property groups appear
after them. For example, move `status` above `project` to display the status group first. Values within one property are
sorted alphabetically.

By default, **Show colored tags first** and **Show colored properties first** can place pills with configured custom
colors before other pills. Rainbow colors alone do not affect the order. Disable those settings when tag pills and
property groups should follow the navigation order without color priority.

Enable **Settings → Notebook Navigator → File display → Properties → Show properties on separate rows** to place each
property key and its values on a separate horizontally scrollable row.

### How do I group notes by a property or tags?

Add the property names under **Settings → Notebook Navigator → List pane → Sort & group → Grouping properties**, then
choose the property from the `Group by` menu in the list pane. For example, add `status, genre` to group notes under
headings such as `Draft`, `Published`, or `Reference`.

Add `tags` as a grouping property to group by the frontmatter `tags` property. Inline tags in the note body are not a
grouping property. A list value is treated as one combined group: a note with `topics: [Books, History]` appears under
`Books, History`, not once under each topic. Use separate properties such as `note_type` and `context_type` when notes
need independent grouping choices.

### How do I return to my previous folder after clicking a tag or property?

Use the `Notebook Navigator: Navigate back` command and assign it an Obsidian hotkey. On desktop, **Settings → Notebook
Navigator → Appearance & behavior → Mouse back/forward buttons** can also be set to **Navigate history**.

For example, if you click `#recipes` while browsing the `Projects` folder, navigating back restores the previous folder
selection. Disable **Show file tags** or **Show file properties** if those clickable pills are not needed.

### Why does search not find text inside my notes?

The default filter search matches display names, aliases, tags, properties, dates, folders, extensions, and whether a
note has unfinished tasks. Full-text search requires the [Omnisearch](https://github.com/scambier/obsidian-omnisearch)
plugin; with Omnisearch installed and enabled, switch the search mode in the search bar. See
[README section 7](https://github.com/johansan/notebook-navigator#7-search) for the full filter syntax.

### How do I progressively narrow notes by tags or properties?

Use filter search and combine tag and property filters in the search field. For example:

- `#project/active .status=started` matches notes with that tag and a `status` value containing `started`
- `#project/active OR #project/backlog` matches either tag
- `#project -#project/archive` includes project notes but excludes archived ones

On desktop and tablets, with **Multi-select modifier** set to **Cmd/Ctrl click**, Cmd/Ctrl-click a tag or property in
the navigation pane, a tag pill, or a clickable property pill whose key is shown in navigation, to toggle it in the
search. Newly added filters use AND; Cmd/Ctrl+Shift-click requests OR. When **Multi-select modifier** is **Option/Alt
click**, use Option/Alt and Option/Alt+Shift instead. Clicking the same positive filter again removes it. A negated
filter entered manually, such as `-#project`, is not removed by clicking the corresponding tag or property. **Filter
tags by selection** limits tags to notes under the selected folder or property. **Filter properties by selection**
limits properties to notes under the selected folder or tag.

AND and OR clicks apply to searches containing only tag and property filters. If a query also contains a display name,
date, task, folder, or extension filter, newly added clicked filters use implicit AND.

### How do I save reusable searches such as Today or Untagged?

Enter a filter search and click the star icon, `Save search shortcut`. The saved search appears in Shortcuts. Examples:

- `@c:today` - Files created today
- `@c:thisweek` - Files created this week
- `-#` - Files without indexed tags, including visible non-Markdown files
- `folder:/` - Files in the vault root
- `has:task` - Notes with unfinished tasks

When a folder is selected, the save dialog offers **Always start in: _folder_**. Saved searches can likewise start from
the currently selected tag or property.

## Calendar and date notes

### How do I turn off the calendar?

Disable **Settings → Notebook Navigator → Calendar → Enable calendar** to turn it off. When **Calendar placement** is
**Left sidebar**, the calendar overlay can also be shown or hidden with its navigation-pane button or the **Toggle
calendar** command.

### How do I change the first day of the week?

Set **Settings → Notebook Navigator → Calendar → Locale**. It controls week numbering and the first day of the week;
visible date names follow Obsidian's language. An enabled weekly-note pattern using ISO `W` or `G` tokens uses ISO week
numbering and a Monday week start instead.

### The calendar does not use my Daily Notes plugin settings

Enable the Daily Notes core plugin, then set **Settings → Notebook Navigator → Calendar → Daily note source** to **Daily
notes (core plug-in)**. The folder and date format are then read from the Daily Notes core plugin. When the source is
set to **Notebook Navigator**, the calendar uses its own folder and format settings instead.

### How does the calendar decide which note belongs to a date?

For each enabled calendar-note period, the calendar resolves one exact file path. The **Daily notes (core plug-in)**
source supplies the daily-note path only; the **Notebook Navigator** source supplies paths for each configured day,
week, month, quarter, or year pattern. At the configured daily-note location, a pattern of `YYYY-MM-DD` resolves to a
file named `2026-08-05.md`. It does not treat `2026-08-05 Trip to Milan.md` or `2026-08-05 21.45.25.md` as the same
daily note.

The configured pattern can contain exact literal text, such as `[Daily] YYYY-MM-DD`, but the calendar does not scan for
files by prefix, wildcard, regular expression, arbitrary time suffix, or metadata. It also does not associate multiple
notes with the same period. Keep the exact date filename and use a frontmatter `title` when a descriptive displayed name
is needed by enabling **Use frontmatter metadata** and adding `title` to **Name fields**. Other date-stamped files, such
as health exports, can be stored separately and embedded in the daily note; only the exact configured path creates the
calendar marker.

### Do notes created from the calendar support Templater?

Templater syntax requires the [Templater](https://github.com/SilentVoid13/Templater) plugin. With Templater installed
and enabled, Markdown templates used by Notebook Navigator calendar notes and folder notes are created through
Templater. Without Templater, the Markdown template content is copied and Templater syntax is left as text.

For calendar notes, this applies when **Daily note source** is **Notebook Navigator**. The **Daily notes (core
plug-in)** source uses the core Daily Notes template and processes the supported `{{...}}` tokens described below
instead.

### Why are `{{date}}` and `{{title}}` left as text in my calendar notes?

Those `{{...}}` tokens are processed by Obsidian's core **Templates** and **Daily notes** plugins. They are not expanded
automatically when another plugin creates a note.

They are used in one case: **Settings → Notebook Navigator → Calendar → Daily note source** set to **Daily notes (core
plug-in)**. Notebook Navigator then reads the folder, date format, and template from the Daily Notes core plugin and
applies `{{date}}`, `{{time}}`, `{{title}}`, `{{yesterday}}`, `{{tomorrow}}`, and calculated formats such as
`{{date+1d:YYYY-MM-DD}}` when it creates the daily note.

With **Daily note source** set to **Notebook Navigator**, use Templater syntax in calendar templates:

```
<% tp.date.now("YYYY-MM-DD") %>
<% tp.file.title %>
```

## Plugins and integrations

### Why doesn't Notebook Navigator use Obsidian's standard context menu?

Notebook Navigator uses its own context menus for its multi-file selection and navigator-specific actions. Commands
added by another plugin only to Obsidian's standard file menu remain there and are not automatically added to Notebook
Navigator.

Other plugin authors can add items to Notebook Navigator's file, folder, tag, and property menus through the
[Menus API](docs/api-reference.md#menus-api).

### Notebook Navigator stopped working after installing another plugin

Reported plugin, theme, and sync-service conflicts and their workarounds are tracked in
[Known issues](https://github.com/johansan/notebook-navigator/issues/363).

## Settings and sync

### What does the cloud icon next to some settings do?

It is a sync toggle that switches a setting between synced and local storage:

- **Sync enabled** (default) - The value is saved in `.obsidian/plugins/notebook-navigator/data.json` inside the vault.
  A vault sync service can synchronize this file when configured to include plugin settings; Notebook Navigator does not
  synchronize it
- **Sync disabled** - The value is saved in Obsidian's local storage on the current device and removed from `data.json`,
  so each device keeps its own independent value

Without a sync service the toggle has no practical effect, since `data.json` stays on one device. See
[README section 6](https://github.com/johansan/notebook-navigator#6-synced-and-local-settings) for details.

### What does "(vault profile)" mean on a setting?

Settings marked **(vault profile)** are stored per profile. Each profile keeps its own file type filter and hide rules,
and switching profiles switches the visible content.

## Project

### How do I request a feature?

Check the [feature request wiki](https://github.com/johansan/notebook-navigator/wiki) first, then
[open an issue](https://github.com/johansan/notebook-navigator/issues/new/choose) with the feature request template.

### Do you accept pull requests?

No. Pull requests are closed automatically. Contribute ideas as feature requests instead. See
[CONTRIBUTING.md](https://github.com/johansan/notebook-navigator/blob/main/CONTRIBUTING.md).
