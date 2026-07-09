# Notebook Navigator Theming Guide

Updated: July 9, 2026

## Table of Contents

- [Introduction](#introduction)
- [CSS Variables Reference](#css-variables-reference)
  - [Theme foreground](#theme-foreground)
  - [Calendar](#calendar)
  - [Navigation pane](#navigation-pane)
  - [Borders](#borders)
  - [Pane divider](#pane-divider-desktop-only)
  - [List pane (files)](#list-pane-files)
  - [Headers (desktop only)](#headers-desktop-only)
  - [Mobile styles](#mobile-styles)
- [Complete Theme Example](#complete-theme-example)
- [Advanced Techniques](#advanced-techniques)
  - [Supporting Light and Dark Modes](#supporting-light-and-dark-modes)
  - [User Custom Colors Override](#user-custom-colors-override)
- [Style Settings Support](#style-settings-support)

## Introduction

Notebook Navigator is themed with CSS variables (custom properties). Themes and snippets override these variables to
match the rest of the theme.

The Style Settings plugin exposes most `--nn-theme-*` variables under “Notebook Navigator”.

Authored CSS lives in `src/styles/index.css` and `src/styles/sections/*`. `styles.css` is generated output. Regenerate
styles with `npm run build:styles` or `./scripts/build.sh`. `src/constants/notebookNavigatorIcon.ts` is generated from
`icon.svg` via `npm run build:icons`.

## CSS Variables Reference

The theming variables use the `--nn-theme-` prefix. Notebook Navigator defines defaults on `body` for Style Settings
compatibility.

Themes can override variables on `body`, `.theme-light`, or `.theme-dark`.

On desktop, the background mode setting can map pane backgrounds:

- Separate (default): navigation uses `--nn-theme-nav-bg` and list uses `--nn-theme-list-bg`.
- Primary: navigation uses `--nn-theme-list-bg`.
- Secondary: list uses `--nn-theme-nav-bg`.

On mobile, both panes use `--nn-theme-mobile-bg`.

Most variables are colors and should resolve to a computed color (some are used with `color-mix()`).
`--nn-theme-nav-separator-background` is used as a `background` value.

### Theme foreground

| Variable                      | Default                                                             | Description              |
| ----------------------------- | ------------------------------------------------------------------- | ------------------------ |
| `--nn-theme-foreground`       | `var(--text-normal)`                                                | Base foreground color    |
| `--nn-theme-foreground-muted` | `color-mix(in srgb, var(--nn-theme-foreground) 70%, transparent)`   | Muted foreground color   |
| `--nn-theme-foreground-faded` | `color-mix(in srgb, var(--nn-theme-foreground) 50%, transparent)`   | Faded foreground color   |
| `--nn-theme-foreground-faint` | `color-mix(in srgb, var(--nn-theme-foreground) 10%, transparent)`   | Faint foreground color   |

### Calendar

| Variable                                      | Default                                | Description                                     |
| --------------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| `--nn-theme-calendar-header-color`            | `var(--nn-theme-foreground)`           | Text color for month/year and header buttons    |
| `--nn-theme-calendar-weekday-color`           | `var(--nn-theme-foreground-muted)`     | Text color for weekday labels (Mon, Tue, Wed...) |
| `--nn-theme-calendar-week-color`              | `var(--nn-theme-foreground-muted)`     | Text color for week numbers                     |
| `--nn-theme-calendar-day-in-month-color`      | `var(--nn-theme-foreground)`           | Text color for days within the current month    |
| `--nn-theme-calendar-day-outside-month-color` | `var(--nn-theme-foreground-faded)`     | Text color for days outside the current month   |
| `--nn-theme-calendar-weekend-bg`              | `color-mix(in srgb, var(--nn-theme-foreground) 10%, transparent)` | Background color for weekend day cells |
| `--nn-theme-calendar-hover-bg`                | `var(--background-modifier-hover)`     | Hover background for calendar buttons and days  |
| `--nn-theme-calendar-note-indicator-color`   | `var(--nn-theme-foreground-faded)`     | Dot color for dates with a daily note           |
| `--nn-theme-calendar-unfinished-task-indicator-color` | `var(--nn-theme-calendar-note-indicator-color)` | Color for the hollow indicator shown on dates with unfinished tasks |
| `--nn-theme-calendar-feature-image-text-color` | `white`                             | Text color for dates with feature images        |
| `--nn-theme-calendar-feature-image-overlay-color` | `rgb(0 0 0 / 0.05)` in light mode, `rgb(0 0 0 / 0.3)` in dark mode | Overlay color for calendar feature images |
| `--nn-theme-calendar-day-today-color`         | `var(--nn-theme-calendar-day-in-month-color)` | Text color for today's date                |
| `--nn-theme-calendar-day-today-bg`            | `var(--text-selection)`                | Background color for today's date highlight     |
| `--nn-theme-calendar-day-active-border-color` | `var(--interactive-accent)` | Border color for active calendar outlines |
| `--nn-theme-calendar-day-active-border-width` | `3px` | Border width for active calendar outlines |

### Navigation pane

| Variable                              | Default                                                                                                                                      | Description                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `--nn-theme-nav-bg`                   | `var(--background-secondary)`                                                                                                                | Navigation pane background (desktop only, see mobile styles)                        |
| `--nn-theme-nav-separator-color`      | `var(--nn-theme-foreground)`                                                                                                                 | Separator line color inside navigation spacers                                      |
| `--nn-theme-nav-separator-background` | `linear-gradient(90deg, transparent 0%, var(--nn-theme-nav-separator-color) 15%, var(--nn-theme-nav-separator-color) 85%, transparent 100%)` | Fill for navigation separators; override to supply your own gradient or solid color |
| `--nn-theme-nav-separator-height`     | `1px`                                                                                                                                        | Thickness for navigation separators                                                 |
| `--nn-theme-nav-separator-opacity`    | `0.3`                                                                                                                                        | Opacity for navigation separators                                                   |
| `--nn-theme-nav-indent-guide-color`   | `var(--nn-theme-foreground-faded)`                                                                                                           | Line color for navigation indent guides                                             |
| `--nn-theme-nav-leader-color`         | `var(--nn-theme-foreground-faded)`                                                                                                           | Color for leaders between item names and trailing values                            |

#### Pinned shortcuts

| Variable                                  | Default               | Description                                                                              |
| ----------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| `--nn-theme-pinned-shortcut-shadow-color` | `rgba(0, 0, 0, 0.03)` | Gradient overlay rendered beneath pinned shortcuts (defaults to `rgba(0, 0, 0, 0.18)` in `.theme-dark`) |

#### Navigation items

| Variable                                             | Default                                          | Description                                                         |
| ---------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| `--nn-theme-navitem-chevron-color`                   | `var(--nn-theme-foreground-muted)`               | Color for expand/collapse arrows                                    |
| `--nn-theme-navitem-icon-color`                      | `var(--nn-theme-foreground-muted)`               | Icon color for folders, tags, and properties                        |
| `--nn-theme-navitem-name-color`                      | `var(--nn-theme-foreground)`                     | Text color for folder, tag, and property names                      |
| `--nn-theme-navitem-file-name-color`                 | `var(--nn-theme-navitem-name-color)`             | Text color for note shortcuts and recent files                      |
| `--nn-theme-navitem-count-color`                     | `var(--nn-theme-foreground-muted)`               | Text color for file count badges                                    |
| `--nn-theme-navitem-count-bg`                        | `transparent`                                    | Background color for file count badges                              |
| `--nn-theme-navitem-count-border-radius`             | `8px`                                            | Corner radius for file count badges (0-8px)                         |
| `--nn-theme-navitem-border-radius`                   | `4px`                                            | Corner radius for navigation items (0-14px)                         |
| `--nn-theme-navitem-hover-bg`                        | `var(--background-modifier-hover)`               | Item hover background color (desktop only)                          |
| `--nn-theme-navitem-selected-bg`                     | `var(--text-selection)`                          | Selected item background color                                      |
| `--nn-theme-navitem-selected-chevron-color`          | `var(--nn-theme-navitem-chevron-color)`          | Expand/collapse arrow color when item is selected                   |
| `--nn-theme-navitem-selected-icon-color`             | `var(--nn-theme-navitem-icon-color)`             | Icon color when item is selected                                    |
| `--nn-theme-navitem-selected-name-color`             | `var(--nn-theme-navitem-name-color)`             | Navigation item name color when selected                             |
| `--nn-theme-navitem-selected-count-color`            | `var(--nn-theme-navitem-count-color)`            | File count text color when item is selected                         |
| `--nn-theme-navitem-selected-count-bg`               | `var(--nn-theme-navitem-count-bg)`               | File count background color when selected                           |
| `--nn-theme-navitem-selected-inactive-bg`            | `var(--background-modifier-hover)`               | Selected item background when pane is inactive (desktop only)       |
| `--nn-theme-navitem-selected-inactive-name-color`    | `var(--nn-theme-navitem-name-color)`             | Navigation item name color when selected and pane is inactive       |
| `--nn-theme-navitem-selected-inactive-chevron-color` | `var(--nn-theme-navitem-selected-chevron-color)` | Expand/collapse arrow color when selected and pane is inactive      |
| `--nn-theme-navitem-selected-inactive-icon-color`    | `var(--nn-theme-navitem-selected-icon-color)`    | Icon color when selected and pane is inactive                       |
| `--nn-theme-navitem-selected-inactive-count-color`   | `var(--nn-theme-navitem-selected-count-color)`   | File count text color when selected and pane is inactive            |
| `--nn-theme-navitem-selected-inactive-count-bg`      | `var(--nn-theme-navitem-selected-count-bg)`      | File count background color when selected and pane is inactive      |
| `--nn-theme-tag-positive-bg`                         | `#00800033`                                      | Background for positive tag highlights and tag drop targets         |
| `--nn-theme-tag-negative-bg`                         | `#ff000033`                                      | Background for negative tag highlights and the untagged drop target |

#### Text styling

These variables control the font weight and decoration of folder/tag/property names and file names in shortcuts and recent files.
Priority order for font weight: custom color styles override folder note styles, which override the default style.
Folder note decoration still applies when custom colors are present.

| Variable                                                | Default     | Description                                                                   |
| ------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------- |
| `--nn-theme-navitem-name-font-weight`                   | `400`       | Default font weight for all folder/tag/property names (400 = regular, 600 = bold) |
| `--nn-theme-navitem-file-name-font-weight`              | `400`       | Default font weight for file names in shortcuts and recent files              |
| `--nn-theme-navitem-count-font-weight`                  | `400`       | Font weight for file count badges                                             |
| `--nn-theme-navitem-custom-color-name-font-weight`      | `600`       | Font weight for folders/tags/properties with custom colors (overrides default) |
| `--nn-theme-navitem-custom-color-file-name-font-weight` | `600`       | Font weight for file names with custom colors (overrides default file weight) |
| `--nn-theme-navitem-folder-note-name-font-weight`       | `400`       | Font weight for folders with notes when no custom color weight applies        |
| `--nn-theme-navitem-folder-note-name-decoration`        | `underline` | Text decoration for folders with notes (none, underline, underline dotted)    |
| `--nn-theme-navitem-folder-note-name-hover-decoration`  | `underline` | Text decoration when hovering folders with notes                              |

### Borders

Border variables apply to navigation rows, file rows, count badges, and file pills.

#### Navigation borders

| Variable                                            | Default                                         | Description                                                      |
| --------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| `--nn-theme-navitem-border-width`                   | `0px`                                           | Border width for navigation custom backgrounds, hover, and selection |
| `--nn-theme-navitem-custom-border-color`            | `transparent`                                   | Border color for rows with custom backgrounds                    |
| `--nn-theme-navitem-hover-border-color`             | `transparent`                                   | Border color for hovered navigation rows                         |
| `--nn-theme-navitem-selected-border-color`          | `transparent`                                   | Border color for selected navigation rows                        |
| `--nn-theme-navitem-selected-inactive-border-color` | `var(--nn-theme-navitem-selected-border-color)` | Border color for selected navigation rows when pane is inactive  |
| `--nn-theme-navitem-count-border-width`             | `0px`                                           | Border width for navigation file count badges                    |
| `--nn-theme-navitem-count-border-color`             | `transparent`                                   | Border color for navigation file count badges                    |
| `--nn-theme-navitem-selected-count-border-color`    | `var(--nn-theme-navitem-count-border-color)`    | Border color for selected navigation file count badges           |
| `--nn-theme-navitem-selected-inactive-count-border-color` | `var(--nn-theme-navitem-selected-count-border-color)` | Border color for selected navigation file count badges when pane is inactive |

#### File item borders

| Variable                                     | Default                                      | Description                                                |
| -------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------- |
| `--nn-theme-file-border-width`               | `0px`                                        | Border width for selected file rows                        |
| `--nn-theme-file-selected-border-color`      | `transparent`                                | Border color for selected file rows                        |
| `--nn-theme-file-selected-inactive-border-color` | `var(--nn-theme-file-selected-border-color)` | Border color for selected file rows when pane is inactive  |

#### Pill borders

| Variable                                     | Default                                                             | Description                                       |
| -------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| `--nn-theme-file-pill-border-width`          | `1px`                                                               | Border width for tag and property pills           |
| `--nn-theme-file-tag-border-color`           | `color-mix(in srgb, var(--nn-theme-foreground) 30%, transparent)`   | Border color for tag pills                        |
| `--nn-theme-file-property-border-color`      | `var(--nn-theme-file-tag-border-color)`                             | Border color for property pills                   |
| `--nn-theme-file-selected-tag-border-color`  | `var(--nn-theme-file-tag-border-color)`                             | Border color for tag pills in selected file rows  |
| `--nn-theme-file-selected-property-border-color` | `var(--nn-theme-file-property-border-color)`                     | Border color for property pills in selected file rows |

### Pane divider (desktop only)

| Variable                                    | Default                             | Description                                               |
| ------------------------------------------- | ----------------------------------- | --------------------------------------------------------- |
| `--nn-theme-divider-border-color`           | `var(--divider-color)`              | Color of the vertical border between panes                |
| `--nn-theme-divider-resize-handle-hover-bg` | `var(--interactive-accent)`         | Background color when hovering the pane divider to resize |

### List pane (files)

| Variable                                  | Default                             | Description                                                                        |
| ----------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| `--nn-theme-list-bg`                      | `var(--background-primary)`         | Background color of the list pane (desktop only, see mobile styles)                |
| `--nn-theme-list-header-icon-color`       | `var(--nn-theme-foreground-muted)`  | Folder/tag/property icon color shown beside the breadcrumb in the desktop header   |
| `--nn-theme-list-header-breadcrumb-color` | `var(--nn-theme-foreground-muted)`  | Text color for the breadcrumb path in the desktop header                           |
| `--nn-theme-list-search-active-bg`        | `var(--text-highlight-bg)`          | Background color for the search field and match highlights when a search query is active |
| `--nn-theme-list-search-border-color`     | `var(--background-modifier-border)` | Border and focus ring color for the search field                                   |
| `--nn-theme-list-heading-color`           | `var(--nn-theme-foreground-muted)`  | Text color for the list pane title area and vault title                            |
| `--nn-theme-list-group-header-color`      | `var(--nn-theme-foreground-muted)`  | Text color for date groups and pinned section                                      |
| `--nn-theme-list-separator-color`         | `var(--background-modifier-border)` | Divider line color between files                                                   |

#### File items

| Variable                                          | Default                                       | Description                                                     |
| ------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------- |
| `--nn-theme-file-name-color`                      | `var(--nn-theme-foreground)`                  | Text color for file names                                       |
| `--nn-theme-file-preview-color`                   | `var(--nn-theme-foreground-muted)`            | Text color for content preview                                  |
| `--nn-theme-file-task-icon-color`                 | `var(--nn-theme-navitem-icon-color)`          | Icon color for notes with unfinished tasks                      |
| `--nn-theme-file-feature-border-radius`           | `4px`                                         | Corner radius for feature images (0-32px)                       |
| `--nn-theme-file-date-color`                      | `var(--nn-theme-foreground-faded)`            | Text color for creation or modification dates                   |
| `--nn-theme-file-word-count-color`                | `var(--nn-theme-foreground-faded)`            | Text color for word count suffixes                             |
| `--nn-theme-file-parent-color`                    | `var(--nn-theme-foreground-faded)`            | Text color for parent folder path (when showing subfolders)     |
| `--nn-theme-file-tag-color`                       | `var(--nn-theme-foreground-faded)`            | Text color for tag pills without custom colors                  |
| `--nn-theme-file-tag-custom-color-text-color`     | `var(--nn-theme-navitem-name-color)`          | Text color for tags with custom backgrounds but no custom color |
| `--nn-theme-file-tag-bg`                          | `transparent`                                 | Background color for tag pills without custom backgrounds       |
| `--nn-theme-file-property-color`                  | `var(--nn-theme-foreground-faded)`            | Text color for property pills                                   |
| `--nn-theme-file-property-bg`                     | `transparent`                                 | Background color for property pills                              |
| `--nn-theme-file-tag-border-radius`               | `10px`                                        | Corner radius for tag pills (0-10px)                            |
| `--nn-theme-file-property-border-radius`          | `10px`                                        | Corner radius for property pills (0-10px)                       |
| `--nn-theme-file-border-radius`                   | `8px`                                         | Corner radius for file items (0-16px)                           |
| `--nn-theme-file-selected-bg`                     | `var(--text-selection)`                       | Selected file background color                                  |
| `--nn-theme-file-selected-name-color`             | `var(--nn-theme-file-name-color)`             | Text color for file names when selected                         |
| `--nn-theme-file-selected-preview-color`          | `var(--nn-theme-file-preview-color)`          | Text color for content preview when selected                    |
| `--nn-theme-file-selected-date-color`             | `var(--nn-theme-foreground-muted)`            | Text color for file dates when selected                         |
| `--nn-theme-file-selected-word-count-color`       | `var(--nn-theme-foreground-muted)`            | Text color for word count suffixes when selected                |
| `--nn-theme-file-selected-parent-color`           | `var(--nn-theme-foreground-muted)`            | Text color for parent folder path when selected                 |
| `--nn-theme-file-selected-tag-color`              | `var(--nn-theme-foreground-muted)`            | Text color for tag pills when selected                          |
| `--nn-theme-file-selected-tag-bg`                 | `var(--nn-theme-file-tag-bg)`                 | Background color for tag pills when selected                    |
| `--nn-theme-file-selected-property-color`         | `var(--nn-theme-foreground-muted)`            | Text color for property pills when selected                     |
| `--nn-theme-file-selected-property-bg`            | `var(--nn-theme-file-property-bg)`            | Background color for property pills when selected               |
| `--nn-theme-file-selected-inactive-bg`            | `var(--background-modifier-hover)`            | Selected file background when pane is inactive (desktop only)   |
| `--nn-theme-file-selected-inactive-name-color`    | `var(--nn-theme-file-selected-name-color)`    | File name color when selected and pane is inactive              |
| `--nn-theme-file-selected-inactive-preview-color` | `var(--nn-theme-file-selected-preview-color)` | Content preview color when selected and pane is inactive        |
| `--nn-theme-file-selected-inactive-date-color`    | `var(--nn-theme-file-selected-date-color)`    | File date color when selected and pane is inactive              |
| `--nn-theme-file-selected-inactive-word-count-color` | `var(--nn-theme-file-selected-word-count-color)` | Word count suffix color when selected and pane is inactive      |
| `--nn-theme-file-selected-inactive-parent-color`  | `var(--nn-theme-file-selected-parent-color)`  | Parent folder color when selected and pane is inactive          |
| `--nn-theme-file-selected-inactive-tag-color`     | `var(--nn-theme-file-selected-tag-color)`     | Tag text color when selected and pane is inactive               |
| `--nn-theme-file-selected-inactive-tag-bg`        | `var(--nn-theme-file-tag-bg)`                 | Tag background color when selected and pane is inactive         |
| `--nn-theme-file-selected-inactive-property-color` | `var(--nn-theme-file-selected-property-color)` | Property pill text color when selected and pane is inactive     |
| `--nn-theme-file-selected-inactive-property-bg`    | `var(--nn-theme-file-property-bg)`            | Property pill background color when selected and pane is inactive |

Tag pills that only set a custom text color use the list pane background. Tag pills that set a custom background use the
navigation pane background. In `primary` and `secondary` background modes, both panes share the same background.

#### Text styling

| Variable                                        | Default | Description                                          |
| ----------------------------------------------- | ------- | ---------------------------------------------------- |
| `--nn-theme-list-header-breadcrumb-font-weight` | `600`   | Font weight for the breadcrumb in the desktop header |
| `--nn-theme-list-heading-font-weight`           | `600`   | Font weight for the list pane title area and vault title |
| `--nn-theme-list-group-header-font-weight`      | `600`   | Font weight for date groups and pinned section       |
| `--nn-theme-file-name-font-weight`              | `600`   | Font weight for file names                           |
| `--nn-theme-file-compact-name-font-weight`      | `400`   | Font weight for file names in compact mode           |
| `--nn-theme-file-preview-font-weight`           | `400`   | Font weight for file preview text                    |
| `--nn-theme-file-date-font-weight`              | `400`   | Font weight for file dates                           |
| `--nn-theme-file-word-count-font-weight`        | `400`   | Font weight for word count suffixes                  |
| `--nn-theme-file-parent-font-weight`            | `400`   | Font weight for parent folder path                   |
| `--nn-theme-file-tag-font-weight`               | `400`   | Font weight for tag and property pills               |

#### Quick actions (desktop only)

| Variable                                    | Default                                                          | Description                                                       |
| ------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| `--nn-theme-quick-actions-bg`               | `color-mix(in srgb, var(--background-primary) 95%, transparent)` | Background color of quick actions toolbar (supports transparency) |
| `--nn-theme-quick-actions-border`           | `var(--background-modifier-border)`                              | Border color of quick actions toolbar                             |
| `--nn-theme-quick-actions-border-radius`    | `4px`                                                            | Corner radius for quick actions panel (0-12px)                    |
| `--nn-theme-quick-actions-icon-color`       | `var(--nn-theme-foreground-muted)`                               | Icon color for quick action buttons                               |
| `--nn-theme-quick-actions-icon-hover-color` | `var(--nn-theme-foreground)`                                     | Icon color when hovering quick action buttons                     |
| `--nn-theme-quick-actions-separator-color`  | `var(--background-modifier-border)`                              | Divider color between quick action buttons                        |

### Headers (desktop only)

| Variable                                       | Default                            | Description                                        |
| ---------------------------------------------- | ---------------------------------- | -------------------------------------------------- |
| `--nn-theme-header-button-icon-color`          | `var(--icon-color)`                | Default icon color for header buttons              |
| `--nn-theme-header-button-hover-bg`            | `var(--background-modifier-hover)` | Background color when hovering header buttons      |
| `--nn-theme-header-button-active-bg`           | `var(--background-modifier-hover)` | Background color for active/toggled header buttons |
| `--nn-theme-header-button-active-icon-color`   | `var(--text-normal)`               | Icon color for active/toggled header buttons       |
| `--nn-theme-header-button-disabled-icon-color` | `var(--icon-color)`                | Icon color for disabled header buttons             |

### Mobile styles

| Variable                                               | Default                                                          | Description                                                                                                      |
| ------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--nn-theme-mobile-bg`                                 | `var(--mobile-sidebar-background)`                               | Navigation and list pane background on mobile                                                                    |
| `--nn-theme-mobile-list-header-link-color`             | `var(--link-color)`                                              | Color for back button and clickable breadcrumb segments on mobile                                                |
| `--nn-theme-mobile-list-header-breadcrumb-color`       | `var(--nn-theme-foreground)`                                     | Color for current folder and separators in breadcrumb on mobile                                                  |
| `--nn-theme-mobile-list-header-breadcrumb-font-weight` | `600`                                                            | Font weight for mobile breadcrumb                                                                                |
| `--nn-theme-mobile-toolbar-bg`                         | `var(--background-secondary)`                                    | Defined token exposed in Style Settings; current shipped toolbar styles use `--nn-theme-list-bg` or `--nn-theme-mobile-toolbar-glass-bg` instead |
| `--nn-theme-mobile-toolbar-button-icon-color`          | `var(--link-color)`                                              | Icon color for toolbar buttons                                                                                   |
| `--nn-theme-mobile-toolbar-button-active-bg`           | `var(--background-modifier-hover)`                               | Background color for active toolbar button                                                                       |
| `--nn-theme-mobile-toolbar-button-active-icon-color`   | `var(--link-color)`                                              | Icon color for active toolbar button                                                                             |
| `--nn-theme-mobile-toolbar-glass-bg`                   | `var(--background-primary)`                                      | Base color of the iOS glass toolbar (mixed with transparency)                                                    |

Mobile navigation and list pane backgrounds follow `--nn-theme-mobile-bg`.

On iOS with floating toolbars enabled, `.notebook-navigator-ios.notebook-navigator-ios-floating-toolbars` overrides:

- `--nn-theme-mobile-toolbar-button-icon-color`: `var(--nn-theme-foreground)`
- `--nn-theme-mobile-toolbar-button-active-bg`: `transparent`

## Complete Theme Example

Example theme snippet using a JetBrains Darcula-inspired palette. It sets all `--nn-theme-*` variables defined in CSS:

```css
body {
  /* Theme foreground */
  --nn-theme-foreground: #a9b7c6;
  --nn-theme-foreground-muted: #7f8b91;
  --nn-theme-foreground-faded: #6e6e6e;
  --nn-theme-foreground-faint: #4f565a;

  /* Navigation pane */
  --nn-theme-nav-bg: #3c3f41;
  --nn-theme-nav-separator-color: #6e6e6e;
  --nn-theme-nav-separator-background: var(--nn-theme-nav-separator-color);
  --nn-theme-nav-separator-height: 1px;
  --nn-theme-nav-separator-opacity: 0.35;
  --nn-theme-nav-indent-guide-color: rgba(127, 139, 145, 0.65);
  --nn-theme-nav-leader-color: rgba(127, 139, 145, 0.65);

  /* Navigation calendar */
  --nn-theme-calendar-header-color: var(--nn-theme-foreground);
  --nn-theme-calendar-weekday-color: var(--nn-theme-foreground-muted);
  --nn-theme-calendar-week-color: var(--nn-theme-foreground-muted);
  --nn-theme-calendar-day-in-month-color: var(--nn-theme-foreground);
  --nn-theme-calendar-day-outside-month-color: var(--nn-theme-foreground-faded);
  --nn-theme-calendar-weekend-bg: rgba(169, 183, 198, 0.1);
  --nn-theme-calendar-hover-bg: #4b5059;
  --nn-theme-calendar-note-indicator-color: #4a78c8;
  --nn-theme-calendar-unfinished-task-indicator-color: #4a78c8;
  --nn-theme-calendar-feature-image-text-color: #ffffff;
  --nn-theme-calendar-feature-image-overlay-color: rgb(0 0 0 / 0.05);
  --nn-theme-calendar-day-today-color: #ffffff;
  --nn-theme-calendar-day-today-bg: #4a78c8;
  --nn-theme-calendar-day-active-border-color: rgba(169, 183, 198, 0.5);
  --nn-theme-calendar-day-active-border-width: 2px;

  /* Navigation items */
  --nn-theme-navitem-chevron-color: #6e6e6e;
  --nn-theme-navitem-icon-color: #afb1b3;
  --nn-theme-navitem-name-color: #a9b7c6;
  --nn-theme-navitem-file-name-color: #a9b7c6;
  --nn-theme-navitem-count-color: #7f8b91;
  --nn-theme-navitem-count-bg: transparent;
  --nn-theme-navitem-count-border-radius: 3px;
  --nn-theme-navitem-border-radius: 3px;
  --nn-theme-navitem-hover-bg: #4b5059;
  --nn-theme-navitem-selected-bg: #4a78c8;
  --nn-theme-navitem-selected-chevron-color: #c5c5c5;
  --nn-theme-navitem-selected-icon-color: #e6e6e6;
  --nn-theme-navitem-selected-name-color: #ffffff;
  --nn-theme-navitem-selected-count-color: #e6e6e6;
  --nn-theme-navitem-selected-count-bg: rgba(0, 0, 0, 0.2);
  --nn-theme-navitem-selected-inactive-bg: #464c55;
  --nn-theme-navitem-selected-inactive-name-color: #cfd3da;
  --nn-theme-navitem-selected-inactive-chevron-color: #9da2ab;
  --nn-theme-navitem-selected-inactive-icon-color: #b9bec6;
  --nn-theme-navitem-selected-inactive-count-color: #b9bec6;
  --nn-theme-navitem-selected-inactive-count-bg: rgba(0, 0, 0, 0.25);
  --nn-theme-navitem-border-width: 1px;
  --nn-theme-navitem-count-border-width: 1px;
  --nn-theme-navitem-custom-border-color: rgba(0, 0, 0, 0.18);
  --nn-theme-navitem-hover-border-color: rgba(255, 255, 255, 0.18);
  --nn-theme-navitem-selected-border-color: rgba(255, 255, 255, 0.25);
  --nn-theme-navitem-selected-inactive-border-color: rgba(255, 255, 255, 0.14);
  --nn-theme-navitem-count-border-color: rgba(255, 255, 255, 0.2);
  --nn-theme-navitem-selected-count-border-color: rgba(255, 255, 255, 0.3);
  --nn-theme-navitem-selected-inactive-count-border-color: rgba(255, 255, 255, 0.2);

  /* Tag highlights and drop targets */
  --nn-theme-tag-positive-bg: rgba(106, 135, 89, 0.2);
  --nn-theme-tag-negative-bg: rgba(219, 80, 80, 0.2);

  /* Pinned shortcuts */
  --nn-theme-pinned-shortcut-shadow-color: rgba(0, 0, 0, 0.2);

  /* Navigation text styling */
  --nn-theme-navitem-name-font-weight: 400;
  --nn-theme-navitem-file-name-font-weight: 400;
  --nn-theme-navitem-custom-color-name-font-weight: 600;
  --nn-theme-navitem-custom-color-file-name-font-weight: 600;
  --nn-theme-navitem-folder-note-name-font-weight: 600;
  --nn-theme-navitem-folder-note-name-decoration: underline;
  --nn-theme-navitem-folder-note-name-hover-decoration: underline;
  --nn-theme-navitem-count-font-weight: 400;

  /* Pane divider */
  --nn-theme-divider-border-color: #323232;
  --nn-theme-divider-resize-handle-hover-bg: #4a78c8;

  /* List pane */
  --nn-theme-list-bg: #2b2b2b;
  --nn-theme-list-header-icon-color: #7f8b91;
  --nn-theme-list-header-breadcrumb-color: #7f8b91;
  --nn-theme-list-header-breadcrumb-font-weight: 600;
  --nn-theme-list-search-active-bg: #515336;
  --nn-theme-list-search-border-color: #3c3c3c;
  --nn-theme-list-heading-color: #d0d2d6;
  --nn-theme-list-group-header-color: #7f8b91;
  --nn-theme-list-separator-color: #3c3c3c;

  /* File items */
  --nn-theme-file-name-color: #a9b7c6;
  --nn-theme-file-preview-color: #7f8b91;
  --nn-theme-file-task-icon-color: #afb1b3;
  --nn-theme-file-feature-border-radius: 3px;
  --nn-theme-file-date-color: #6a8759;
  --nn-theme-file-word-count-color: #6a8759;
  --nn-theme-file-parent-color: #cc7832;
  --nn-theme-file-tag-color: #9876aa;
  --nn-theme-file-tag-custom-color-text-color: #ffffff;
  --nn-theme-file-tag-bg: #383a3e;
  --nn-theme-file-property-color: #cc7832;
  --nn-theme-file-property-bg: #383a3e;
  --nn-theme-file-tag-border-radius: 3px;
  --nn-theme-file-property-border-radius: 3px;
  --nn-theme-file-border-radius: 4px;
  --nn-theme-file-selected-bg: #4a78c8;
  --nn-theme-file-selected-name-color: #ffffff;
  --nn-theme-file-selected-preview-color: #c5c5c5;
  --nn-theme-file-selected-date-color: #a5dc86;
  --nn-theme-file-selected-word-count-color: #a5dc86;
  --nn-theme-file-selected-parent-color: #ffd580;
  --nn-theme-file-selected-tag-color: #ffffff;
  --nn-theme-file-selected-tag-bg: #5a5f66;
  --nn-theme-file-selected-property-color: #ffffff;
  --nn-theme-file-selected-property-bg: #5a5f66;
  --nn-theme-file-selected-inactive-bg: #383c45;
  --nn-theme-file-selected-inactive-name-color: #dfe3e8;
  --nn-theme-file-selected-inactive-preview-color: #b9bec6;
  --nn-theme-file-selected-inactive-date-color: #8fb275;
  --nn-theme-file-selected-inactive-word-count-color: #8fb275;
  --nn-theme-file-selected-inactive-parent-color: #e3b173;
  --nn-theme-file-selected-inactive-tag-color: #dfe3e8;
  --nn-theme-file-selected-inactive-tag-bg: #4c5058;
  --nn-theme-file-selected-inactive-property-color: #dfe3e8;
  --nn-theme-file-selected-inactive-property-bg: #4c5058;
  --nn-theme-file-border-width: 1px;
  --nn-theme-file-pill-border-width: 1px;
  --nn-theme-file-selected-border-color: rgba(255, 255, 255, 0.24);
  --nn-theme-file-selected-inactive-border-color: rgba(255, 255, 255, 0.14);
  --nn-theme-file-tag-border-color: rgba(255, 255, 255, 0.2);
  --nn-theme-file-property-border-color: rgba(255, 255, 255, 0.2);
  --nn-theme-file-selected-tag-border-color: rgba(255, 255, 255, 0.3);
  --nn-theme-file-selected-property-border-color: rgba(255, 255, 255, 0.3);

  /* File text styling */
  --nn-theme-list-heading-font-weight: 600;
  --nn-theme-list-group-header-font-weight: 600;
  --nn-theme-file-name-font-weight: 600;
  --nn-theme-file-compact-name-font-weight: 400;
  --nn-theme-file-preview-font-weight: 400;
  --nn-theme-file-date-font-weight: 400;
  --nn-theme-file-word-count-font-weight: 400;
  --nn-theme-file-parent-font-weight: 400;
  --nn-theme-file-tag-font-weight: 400;

  /* Quick actions */
  --nn-theme-quick-actions-bg: rgba(43, 43, 43, 0.95);
  --nn-theme-quick-actions-border: #555555;
  --nn-theme-quick-actions-border-radius: 4px;
  --nn-theme-quick-actions-icon-color: #7f8b91;
  --nn-theme-quick-actions-icon-hover-color: #a9b7c6;
  --nn-theme-quick-actions-separator-color: #3c3c3c;

  /* Headers */
  --nn-theme-header-button-icon-color: #7f8b91;
  --nn-theme-header-button-hover-bg: #4b5059;
  --nn-theme-header-button-active-bg: #4a78c8;
  --nn-theme-header-button-active-icon-color: #ffffff;
  --nn-theme-header-button-disabled-icon-color: #5c5c5c;

  /* Mobile */
  --nn-theme-mobile-bg: #2b2b2b;
  --nn-theme-mobile-list-header-link-color: #589df6;
  --nn-theme-mobile-list-header-breadcrumb-color: #a9b7c6;
  --nn-theme-mobile-list-header-breadcrumb-font-weight: 600;
  --nn-theme-mobile-toolbar-bg: #3c3f41;
  --nn-theme-mobile-toolbar-button-icon-color: #a9b7c6;
  --nn-theme-mobile-toolbar-button-active-bg: #4a78c8;
  --nn-theme-mobile-toolbar-button-active-icon-color: #ffffff;
  --nn-theme-mobile-toolbar-glass-bg: #2b2b2b;
}
```

## Advanced Techniques

### Supporting Light and Dark Modes

To support both light and dark modes, define your variables under `.theme-light` and `.theme-dark` classes:

#### Example: Mode-Aware Theme

```css
/* Light mode - pastel colors */
.theme-light {
  /* Navigation pane */
  --nn-theme-nav-bg: #ffeeff; /* Light pink */
  --nn-theme-calendar-feature-image-overlay-color: rgb(0 0 0 / 0.05);
  --nn-theme-nav-separator-color: #ff99cc; /* Pink separator lines */
  --nn-theme-navitem-name-color: #ff66cc; /* Pink text */
  --nn-theme-navitem-hover-bg: #ffddff; /* Very light pink */
  --nn-theme-navitem-selected-bg: #ffccff; /* Pastel purple */
  --nn-theme-navitem-selected-chevron-color: #990099; /* Deep purple chevron when selected */
  --nn-theme-navitem-selected-icon-color: #990099; /* Deep purple icon when selected */
  --nn-theme-navitem-selected-name-color: #990099; /* Deep purple text when selected */
  --nn-theme-navitem-selected-count-color: #ffffff; /* White count text when selected */
  --nn-theme-navitem-selected-count-bg: #ff66cc; /* Pink count background when selected */

  /* File list */
  --nn-theme-list-bg: #fff0ff; /* Very light purple */
  --nn-theme-file-name-color: #cc33ff; /* Purple text */
  --nn-theme-file-selected-bg: #ffccff; /* Pastel purple */
  --nn-theme-file-preview-color: #ff99cc; /* Light pink */
  --nn-theme-file-tag-custom-color-text-color: #000000; /* Black text for custom tags in light mode */
}

/* Dark mode - pastel colors on dark */
.theme-dark {
  /* Navigation pane */
  --nn-theme-nav-bg: #330033; /* Dark purple */
  --nn-theme-calendar-feature-image-overlay-color: rgb(0 0 0 / 0.3);
  --nn-theme-nav-separator-color: #ff66ff; /* Bright separator lines */
  --nn-theme-navitem-name-color: #ffaaff; /* Light pink text */
  --nn-theme-navitem-hover-bg: #442244; /* Dark purple hover */
  --nn-theme-navitem-selected-bg: #663366; /* Muted purple */
  --nn-theme-navitem-selected-chevron-color: #ffccff; /* Light purple chevron when selected */
  --nn-theme-navitem-selected-icon-color: #ffccff; /* Light purple icon when selected */
  --nn-theme-navitem-selected-name-color: #ffccff; /* Light purple text when selected */
  --nn-theme-navitem-selected-count-color: #330033; /* Dark purple count text when selected */
  --nn-theme-navitem-selected-count-bg: #ffaaff; /* Light pink count background when selected */

  /* File list */
  --nn-theme-list-bg: #2a002a; /* Very dark purple */
  --nn-theme-file-name-color: #ff99ff; /* Light purple text */
  --nn-theme-file-selected-bg: #663366; /* Muted purple */
  --nn-theme-file-preview-color: #cc99cc; /* Muted pink */
  --nn-theme-file-tag-custom-color-text-color: #ffffff; /* White text for custom tags in dark mode */
}
```

### User Custom Colors Override

When users set custom colors or backgrounds (right-click → "Change icon", "Change color", or "Change background"),
their choices automatically override your theme through inline styles and row-level CSS custom properties.

## Style Settings Support

Notebook Navigator includes a Style Settings `@settings` block for most theming variables.

Border variables are available in the Style Settings **Borders** section.

Not currently exposed in the Style Settings UI:

- `--nn-theme-nav-separator-background`
- `--nn-theme-nav-separator-height`
- `--nn-theme-nav-separator-opacity`
