# Notebook Navigator - AI Assistant Guide

## Project Summary
Notebook Navigator is an Obsidian plugin that replaces the default file explorer with a Notes-style interface. It provides a clean, two-pane layout with a folder tree on the left and a file list on the right, mimicking the UI/UX patterns found in modern note-taking applications.

## Quick Start for AI Assistants
- **Main entry point**: `src/main.ts` - Contains both the plugin class and the view implementation
- **Build command**: `npm run dev` for development with watch mode
- **Key patterns**: Event-driven architecture, TypeScript strict mode, Obsidian API integration
- **Testing**: Manual testing in Obsidian vault (no automated tests)

## Architecture Overview

### Core Files Structure
```
notebook-navigator/
├── src/
│   ├── main.ts                    # Main plugin & view logic (2100+ lines)
│   ├── settings.ts                # Settings interface and tab
│   ├── types.ts                   # Shared type definitions
│   ├── handlers/
│   │   └── KeyboardHandler.ts     # Keyboard navigation logic
│   ├── operations/
│   │   └── FileSystemOperations.ts # File/folder CRUD operations
│   ├── modals/
│   │   ├── ConfirmModal.ts        # Delete confirmation dialog
│   │   └── InputModal.ts          # Text input dialog
│   └── utils/
│       ├── DateUtils.ts           # Date formatting and grouping
│       └── PreviewTextUtils.ts    # File preview text extraction
├── styles.css                     # Notes-inspired styling
├── manifest.json                  # Plugin metadata
├── package.json                   # Dependencies
├── esbuild.config.mjs            # Build configuration
└── CLAUDE.md                     # This file
```

### Key Classes and Their Responsibilities

#### NotebookNavigatorPlugin (main.ts)
- Plugin lifecycle management
- Settings persistence
- View registration
- Commands and ribbon icon
- State cleanup

#### NotebookNavigatorView (main.ts)
- Two-pane UI rendering
- Folder tree management
- File list display
- Event handling (clicks, drag-drop, keyboard)
- State persistence (localStorage)
- File operations coordination

#### KeyboardHandler
- Centralized keyboard navigation
- Arrow keys, Tab, Delete handling
- Focus management between panes
- Platform-specific key mappings

#### FileSystemOperations
- Folder/file creation with modals
- Rename operations
- Delete with optional confirmation
- Drag-drop validation

### Important Implementation Details

#### State Persistence
The plugin uses localStorage for immediate persistence of:
- Expanded folders (`notebook-navigator-expanded-folders`)
- Selected folder (`notebook-navigator-selected-folder`)
- Selected file (`notebook-navigator-selected-file`)
- Left pane width (`notebook-navigator-left-pane-width`)

#### File Filtering
- Supported file types: `.md`, `.canvas`, `.base`
- Images and other file types are excluded
- Implemented in `isDisplayableFile()` method
- Uses `collectFilesRecursively()` and direct folder child filtering

#### Keyboard Navigation Context
The `KeyboardHandler` receives a context object with getters/setters to avoid circular dependencies while maintaining access to view state.

#### Event Delegation Architecture (IMPORTANT: Major Memory Optimization)
The plugin uses event delegation for all interactive elements to prevent memory leaks:
- **Single setup**: `setupEventDelegation()` called once in `onOpen()`
- **7 total listeners**: All events handled at container level
- **Zero memory leaks**: No cleanup needed when elements are re-rendered
- **Data attributes**: Elements identified by `data-*` attributes instead of direct listeners

Supported events:
- Drag operations: `dragstart`, `dragend`, `dragover`, `dragleave`, `drop`
- User interactions: `click`, `dblclick`, `contextmenu`

Key data attributes:
- `data-draggable="true"` - Marks draggable elements
- `data-drag-type="file|folder"` - Type of item
- `data-drop-zone="folder"` - Valid drop targets
- `data-clickable="file|folder"` - Clickable elements

#### Drag and Drop Implementation
- **Event delegation**: No individual listeners on elements
- **Validation**: Prevents folder being moved into its own descendant
- **Visual feedback**: CSS classes `nn-dragging` and `nn-drag-over`
- **Drag handles**: Folders use content area, files use entire element

### Settings System

#### Key Settings
```typescript
interface NotebookNavigatorSettings {
    showFilePreview: boolean;          // Show preview text under filenames
    skipNonTextInPreview: boolean;     // Skip headings/images in preview
    showFeatureImage: boolean;         // Show thumbnail from frontmatter
    featureImageProperty: string;      // Frontmatter property name
    selectionColor: string;           // Hex color for selection
    dateFormat: string;               // date-fns format string
    sortOption: 'modified'|'created'|'title';
    ignoreFolders: string;            // Comma-separated folder names
    showFolderFileCount: boolean;     // Show count next to folder names
    groupByDate: boolean;             // Group files by date
    pinnedNotes: Record<string, string[]>; // Pinned files per folder
    showNotesFromSubfolders: boolean; // Recursive file display
    autoRevealActiveFile: boolean;    // Auto-reveal on file open
    confirmBeforeDelete: boolean;     // Show delete confirmation
    folderIcons: Record<string, string>; // Custom folder icons
}
```

### Context Menu Features

#### Folder Context Menu
- **New note** - Create markdown file
- **New folder** - Create subfolder
- **New canvas** - Create canvas file (.canvas)
- **New base** - Create database view (.base) - requires Obsidian 1.9+
- **Duplicate folder** - Copy folder with all contents
- **Search in folder** - Open search with path filter
- **Change/Remove icon** - Set custom folder icon
- **Rename folder** - Change folder name
- **Delete folder** - Remove folder with confirmation

#### File Context Menu
- **Open in new tab** - Open file in new tab
- **Open to the right** - Open in split pane
- **Open in new window** - Open in separate window
- **Pin/Unpin note** - Pin to top of folder
- **Duplicate note** - Create copy of file
- **Open version history** - View Sync history (requires Sync)
- **Rename note** - Change file name
- **Delete note** - Remove file with confirmation

#### Settings Tab Features
- Debounced text inputs (500ms delay)
- Conditional setting visibility
- Organized into sections
- State reset functionality

### CSS Architecture

#### Key CSS Classes
- `.notebook-navigator` - Main container
- `.nn-folder-tree` - Left pane folder hierarchy
- `.nn-file-list` - Right pane file listing
- `.nn-selected` - Selected item highlight
- `.nn-focused` - Keyboard focus indicator
- `.nn-dragging` - Active drag state
- `.nn-drag-over` - Drop target highlight

#### CSS Variables
- `--nn-selection-color` - Dynamic selection color from settings
- Extensive use of Obsidian's theme variables for integration

### Event Flow

1. **File Selection**:
   - Click/keyboard → `selectFile()` → Update selection → Preview file → Save state

2. **Folder Navigation**:
   - Click/keyboard → `selectFolder()` → Refresh file list → Save state

3. **File Changes**:
   - Vault event → Debounced refresh (100ms) → Update file list/counts

4. **Keyboard Navigation**:
   - Keydown → KeyboardHandler → Update focus → Scroll into view

### Common Development Tasks

#### Adding a New Setting
1. Add to `NotebookNavigatorSettings` interface
2. Add to `DEFAULT_SETTINGS`
3. Add UI in `NotebookNavigatorSettingTab.display()`
4. Handle in relevant view methods

#### Adding a New Keyboard Shortcut
1. Add case in `KeyboardHandler.handleKeyboardNavigation()`
2. Implement handler method
3. Update context interface if needed

#### Modifying File Display
1. Update `renderFileItem()` for individual file rendering
2. Update `refreshFileList()` for list logic
3. Update CSS for styling changes

### Performance Considerations
- File list refreshes are debounced (100ms)
- Folder counts update separately from tree rendering
- Preview text loaded asynchronously
- No virtual scrolling (potential enhancement for large vaults)
- **Event delegation eliminates memory leaks from orphaned event listeners**
- **Only 7 total event listeners regardless of vault size**

### Known Limitations
1. No search functionality within navigator
2. No bulk operations support
3. Limited accessibility features
4. No undo/redo for file operations
5. No custom sort orders beyond the three options

### Debugging Tips
- Check localStorage for persisted state issues
- Use `console.log` in event handlers for flow tracking
- Verify `this.isLoading` flag for initialization issues
- Check `expandedFolders` Set for tree state problems
- Monitor debounce timers for refresh issues

### Code Style Guidelines
- TypeScript strict mode
- Comprehensive JSDoc comments on all functions
- Descriptive variable names
- Early returns for validation
- Consistent error handling with Notice API
- Clean up event listeners and timers

## Testing Checklist
When making changes, test:
- [ ] Keyboard navigation (all arrow keys, Tab, Delete)
- [ ] Drag and drop (files and folders)
- [ ] File operations (create, rename, delete)
- [ ] Settings changes and persistence
- [ ] State restoration after reload
- [ ] Dark/light theme compatibility
- [ ] Large vault performance
- [ ] Edge cases (empty folders, special characters)

## Common Issues and Solutions

### State Not Persisting
- Check localStorage keys are being set
- Verify `saveState()` is called
- Ensure `isLoading` flag isn't blocking saves

### Keyboard Navigation Broken
- Verify focus is on container element
- Check `focusedPane` state
- Ensure event handlers are attached

### Files Not Showing
- Check file extension filter (`.md` only)
- Verify folder isn't in `ignoreFolders`
- Check `showNotesFromSubfolders` setting

### Drag and Drop Not Working
- Verify `data-draggable="true"` attribute is set
- Check `data-drag-path` and `data-drop-zone` attributes
- Ensure elements have proper data attributes for event delegation
- Check browser console for errors in `setupEventDelegation()`

## Contributing Guidelines
1. Maintain comprehensive function documentation
2. Test all changes manually in Obsidian
3. Preserve keyboard navigation functionality
4. Follow existing code patterns
5. Update CLAUDE.md for significant changes
6. Avoid copyright/trademark issues in naming