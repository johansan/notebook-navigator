# Notebook Navigator - Project Overview

## Project Summary
Notebook Navigator is an Obsidian plugin that replaces the default file explorer with a Notes-style interface. It provides a clean, two-pane layout with a folder tree on the left and a file list on the right, mimicking the UI/UX patterns found in Notes applications.

## Key Features
- **Notes-style interface**: Clean two-pane layout with folders and files
- **Smart file previews**: Shows file content preview with date and first lines of text
- **Feature images**: Optional thumbnail images for notes (via frontmatter)
- **Multiple sort options**: Sort by date modified, date created, or title
- **Keyboard navigation**: Full keyboard support with arrow keys and Tab
- **Drag and drop**: Move files and folders with drag and drop
- **Customizable appearance**: Adjustable selection colors, date formats, animation speeds
- **Dark mode support**: Fully integrated with Obsidian's theme system
- **Resizable panes**: Draggable divider between folder and file panes

## Technical Architecture

### Core Components
- **NotebookNavigatorPlugin**: Main plugin class handling initialization, settings, and lifecycle
- **NotebookNavigatorView**: Custom ItemView implementing the two-pane interface
- **NotebookNavigatorSettingTab**: Settings configuration interface

### Key Settings
- `replaceDefaultExplorer`: Automatically replace Obsidian's file explorer
- `showFilePreview`: Display preview text for files
- `skipNonTextInPreview`: Skip headings, images, embeds in previews
- `showFeatureImage`: Show thumbnail images from frontmatter
- `sortOption`: Sort by modified/created/title
- `selectionColor`: Customizable selection highlight color
- `dateFormat`: Flexible date formatting (supports various tokens)
- `ignoreFolders`: Comma-separated list of folders to hide

### UI/UX Patterns
- **Clean selection style**: Uses background color overlays without borders/outlines
- **Subtle animations**: Smooth folder expand/collapse transitions
- **Focused pane management**: Visual distinction between active folder/file panes
- **Separator lines**: Horizontal lines between file items for clarity
- **Responsive design**: Adapts to smaller screens with adjusted dimensions

### State Management
- Persists expanded folders and selected folder between sessions
- Maintains focus state for keyboard navigation
- Auto-selects first file when changing folders
- Preserves left pane width when resized

## File Structure
```
notebook-navigator/
├── src/
│   └── main.ts      # Core plugin logic and UI components
├── styles.css       # Notes-inspired styling
├── manifest.json    # Plugin metadata
├── package.json     # NPM dependencies
└── esbuild.config.mjs # Build configuration
```

## Development Notes

### Build Process
- Uses esbuild for TypeScript compilation
- Development mode: `npm run dev` (watch mode)
- Production build: `npm run build`
- Version bumping: `npm version patch/minor/major`

### Key Dependencies
- Obsidian API (latest)
- TypeScript 4.7.4
- ESLint for code quality

### Testing Approach
No explicit test framework detected. Testing likely done through manual verification in Obsidian.

### Styling Philosophy
- Minimal, clean aesthetic inspired by Notes applications
- Extensive use of CSS variables for theme integration
- No shadows or heavy borders for flat design
- Smooth transitions for interactive elements

## Recent Changes (from git log)
- "Improvements" - General enhancements
- "Fixed so focus works better" - Keyboard navigation improvements
- Multiple rounds of refinements to the UI and functionality

## Potential Areas for Enhancement
1. **Search functionality**: Add file/folder search within the navigator
2. **File actions**: Quick actions (rename, delete) without context menu
3. **Tags support**: Display and filter by Obsidian tags
4. **Preview customization**: More options for preview content
5. **Performance optimization**: Virtual scrolling for large vaults
6. **Accessibility**: ARIA labels and screen reader support

## Code Quality Observations
- Well-structured with clear separation of concerns
- Comprehensive keyboard navigation implementation
- Proper event cleanup on unmount
- Good use of TypeScript for type safety
- Consistent naming conventions
- Extensive CSS organization with clear comments