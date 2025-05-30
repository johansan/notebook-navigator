# Notebook Navigator for Obsidian

A plugin for [Obsidian](https://obsidian.md) that replaces the default file explorer with a clean, Notes-style interface featuring a two-pane layout with folders on the left and files on the right.

## Features

- 📁 **Two-pane interface:** Clean layout with folder tree on the left, file list on the right
- 🔍 **Smart file previews:** Shows content preview with date and first lines of text
- 🖼️ **Feature images:** Display thumbnail images from frontmatter properties
- 📌 **Pin important notes:** Keep frequently accessed notes at the top of any folder
- ⌨️ **Full keyboard navigation:** Navigate entirely with arrow keys and Tab
- 🔄 **Multiple sort options:** Sort by date modified, date created, or title
- 📅 **Date grouping:** Automatically group files by Today, Yesterday, Previous 7 Days, etc.
- 🎯 **Drag and drop:** Move files and folders with intuitive drag and drop
- 🎨 **Customizable appearance:** Adjust colors, date formats, and animation speeds
- 🌓 **Dark mode support:** Fully integrated with Obsidian's theme system
- ↔️ **Resizable panes:** Drag the divider to adjust folder/file pane widths
- 📂 **Subfolder support:** View all notes from subfolders in one list
- 🚀 **Auto-reveal:** Automatically reveal files when opened from search or links

## Screenshot

![Notebook Navigator Interface](https://github.com/johansan/notebook-navigator/blob/main/images/screenshot1.png?raw=true)

## How to Use

1. Install the plugin from Obsidian's Community Plugins
2. The navigator will replace your default file explorer
3. Navigate using:
   - **Click** to select folders and files
   - **Double-click** folders to expand/collapse
   - **Arrow keys** for navigation
   - **Tab** to switch between folder and file panes
   - **Delete/Backspace** to delete (with optional confirmation)
4. Right-click for context menus:
   - Create new files and folders
   - Rename items
   - Delete items
   - Pin/unpin files
5. Drag and drop files between folders to organize

**Tip:** You can use the ribbon icon (folder tree icon) in the left sidebar to activate Notebook Navigator in case you close it by mistake.

## Keyboard Shortcuts

| Key | Action |
|-----|---------|
| ↑/↓ | Navigate up/down in current pane |
| ← | In folders: collapse or go to parent<br>In files: switch to folder pane |
| → | In folders: expand or switch to file pane<br>In files: open selected file |
| Tab | Switch between folder and file panes<br>When in files: open selected file |
| Shift+Tab | Switch from files to folders pane |
| Delete (Windows/Linux)<br>Backspace (macOS) | Delete selected item |

## Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings
2. Navigate to Community Plugins
3. Search for "Notebook Navigator"
4. Click Install
5. Enable the plugin

### Manual Installation

1. Download the latest release from [GitHub](https://github.com/johansan/notebook-navigator/releases)
2. Extract the files to your vault's `.obsidian/plugins/notebook-navigator/` folder
3. Reload Obsidian
4. Enable the plugin in Settings

## Settings

![Settings Screenshot](https://github.com/johansan/notebook-navigator/blob/main/images/screenshot2.png?raw=true)

### File Organization

- **Sort files by:** Choose between Date Edited, Date Created, or Title
- **Group notes by date:** When sorted by date, group files under headers like "Today", "Yesterday", etc.
- **Show notes from subfolders:** Display all notes from subfolders in the current folder view
- **Auto-reveal active file:** Automatically show and select files when opened from search or links
- **Excluded folders:** Comma-separated list of folders to hide (e.g., `resources, templates`)

### File Display

- **Show file preview:** Display preview text beneath file names
- **Skip non-text in preview:** Exclude headings, images, and embeds from preview text
- **Show feature image:** Display thumbnail images from frontmatter properties
- **Feature image property:** The frontmatter property name for thumbnails (default: `feature`)
  - **Tip:** Use the [Featured Image plugin](https://github.com/johansan/obsidian-featured-image) (also available in Community Plugins) to automatically set feature images for all your notes based on the first image in each document!

### Folder Display

- **Show root folder:** Display "Vault" as the root folder in the tree
- **Show folder file count:** Display the number of markdown files in each folder

### Appearance

- **Selection color:** Background color for selected items (hex format)
- **Date format:** Format for displaying dates (uses date-fns format)
  - Common formats:
    - `MMM d, yyyy` = Jan 5, 2024
    - `dd/MM/yyyy` = 05/01/2024
    - `yyyy-MM-dd` = 2024-01-05
- **Animation speed:** UI animation duration in milliseconds

### Advanced

- **Confirm before deleting files:** Show confirmation dialog when deleting files or folders
- **Clear saved state:** Reset expanded folders, selections, and pane width to defaults

## Tips and Tricks

### Creating Beautiful Note Lists

Combine Notebook Navigator with the [Featured Image plugin](https://github.com/johansan/obsidian-featured-image) to display thumbnail previews in your file list:

1. Install the Featured Image plugin
2. Enable "Show feature image" in Notebook Navigator settings
3. Your notes will automatically display thumbnails from the first image

### Organizing with Pins

Pin frequently accessed notes to keep them at the top:
1. Right-click any file
2. Select "Pin Note"
3. Pinned notes appear at the top with a 📌 icon

### Quick Navigation Patterns

- **Quick file access:** Press Tab from folders to jump to files
- **Parent folder navigation:** Press Left arrow to go up the folder tree
- **Rapid browsing:** Hold arrow keys for continuous navigation
- **Focus management:** The focused pane has a subtle border highlight

## Compatibility

- Works with all Obsidian themes
- Compatible with other file management plugins
- **Desktop only** - This plugin is only available for desktop versions of Obsidian
- Respects Obsidian's safe mode

## Known Limitations

- Only displays markdown (.md) files in the file list
- No built-in search functionality (use Obsidian's global search)
- No bulk file operations
- Limited to Obsidian's file system capabilities

## Support

If you have any questions, suggestions, or issues, please open an issue on the [GitHub repository](https://github.com/johansan/notebook-navigator).

## Development

This plugin is open source. Contributions are welcome!

### Building from Source

```bash
# Clone the repository
git clone https://github.com/johansan/notebook-navigator.git
cd notebook-navigator

# Install dependencies
npm install

# Build for development (with watch mode)
npm run dev

# Build for production
npm run build
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:
- Maintains the existing code style
- Includes comprehensive function documentation
- Preserves keyboard navigation functionality
- Has been thoroughly tested on desktop

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by modern note-taking applications
- Built with the amazing [Obsidian API](https://docs.obsidian.md/)
- Thanks to all contributors and users for their feedback

---

Enjoy using Notebook Navigator!