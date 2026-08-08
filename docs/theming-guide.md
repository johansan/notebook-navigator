# Notebook Navigator Theming Guide

Updated: August 1, 2026

## Table of Contents

- [Introduction](#introduction)
- [Theming behavior](#theming-behavior)
  - [Variable scope](#variable-scope)
  - [Pane backgrounds](#pane-backgrounds)
  - [Supporting light and dark modes](#supporting-light-and-dark-modes)
  - [User custom colors](#user-custom-colors)
  - [Style Settings](#style-settings)
- [CSS Variables Reference](#css-variables-reference)
  - [Foreground colors](#foreground-colors)
  - [Navigation pane](#navigation-pane)
    - [Navigation items](#navigation-items)
    - [Navigation selection](#navigation-selection)
    - [File counts](#file-counts)
  - [List pane](#list-pane)
    - [Group headers](#group-headers)
    - [File items](#file-items)
    - [File selection](#file-selection)
    - [Tag and property pills](#tag-and-property-pills)
    - [Quick actions](#quick-actions)
  - [Pane headers and titles](#pane-headers-and-titles)
    - [Pane titles](#pane-titles)
    - [Pane headers](#pane-headers)
    - [Header buttons](#header-buttons)
  - [Calendar](#calendar)
    - [Calendar labels](#calendar-labels)
    - [Day states](#day-states)
    - [Indicators and feature images](#indicators-and-feature-images)
  - [Pane divider](#pane-divider)
  - [Mobile](#mobile)
- [Complete Theme Example](#complete-theme-example)

## Introduction

Notebook Navigator is themed with CSS variables (custom properties). Themes and snippets override these variables to
match the rest of the theme.

The Style Settings plugin exposes most `--nn-theme-*` variables under “Notebook Navigator”.

## Theming behavior

### Variable scope

The theming variables use the `--nn-theme-` prefix. Define overrides under `.theme-light` and `.theme-dark`. Use `body`
when one value should apply to both modes and the variable does not have a mode-specific default.

Most variables are colors and should resolve to a computed color because some are used with `color-mix()`.
`--nn-theme-nav-separator-background` is used as a `background` value.

### Pane backgrounds

On desktop, the background mode setting can map pane backgrounds:

- Separate (default): navigation uses `--nn-theme-nav-bg` and list uses `--nn-theme-list-bg`.
- Primary: navigation uses `--nn-theme-list-bg`.
- Secondary: list uses `--nn-theme-nav-bg`.

On mobile, both panes use `--nn-theme-mobile-bg`.

### Supporting light and dark modes

Define variables under `.theme-light` and `.theme-dark` when modes need different values.

#### Mode-aware example

```css
/* Light mode */
.theme-light {
  /* Navigation pane */
  --nn-theme-nav-bg: #ffeeff;
  --nn-theme-nav-separator-color: #ff99cc;
  --nn-theme-navitem-name-color: #ff66cc;
  --nn-theme-navitem-hover-bg: #ffddff;
  --nn-theme-navitem-selected-bg: #ffccff;
  --nn-theme-navitem-selected-chevron-color: #990099;
  --nn-theme-navitem-selected-icon-color: #990099;
  --nn-theme-navitem-selected-name-color: #990099;
  --nn-theme-navitem-selected-count-color: #ffffff;
  --nn-theme-navitem-selected-count-bg: #ff66cc;

  /* List pane */
  --nn-theme-list-bg: #fff0ff;
  --nn-theme-file-name-color: #cc33ff;
  --nn-theme-file-selected-bg: #ffccff;
  --nn-theme-file-preview-color: #ff99cc;
  --nn-theme-file-tag-custom-color-text-color: #000000;

  /* Calendar */
  --nn-theme-calendar-feature-image-overlay-color: rgb(0 0 0 / 0.05);
}

/* Dark mode */
.theme-dark {
  /* Navigation pane */
  --nn-theme-nav-bg: #330033;
  --nn-theme-nav-separator-color: #ff66ff;
  --nn-theme-navitem-name-color: #ffaaff;
  --nn-theme-navitem-hover-bg: #442244;
  --nn-theme-navitem-selected-bg: #663366;
  --nn-theme-navitem-selected-chevron-color: #ffccff;
  --nn-theme-navitem-selected-icon-color: #ffccff;
  --nn-theme-navitem-selected-name-color: #ffccff;
  --nn-theme-navitem-selected-count-color: #330033;
  --nn-theme-navitem-selected-count-bg: #ffaaff;

  /* List pane */
  --nn-theme-list-bg: #2a002a;
  --nn-theme-file-name-color: #ff99ff;
  --nn-theme-file-selected-bg: #663366;
  --nn-theme-file-preview-color: #cc99cc;
  --nn-theme-file-tag-custom-color-text-color: #ffffff;

  /* Calendar */
  --nn-theme-calendar-feature-image-overlay-color: rgb(0 0 0 / 0.3);
}
```

### User custom colors

Custom colors and backgrounds selected through `Change icon`, `Change color`, or `Change background` take precedence over
theme variables.

### Style Settings

When Style Settings is installed, most theme variables appear under “Notebook Navigator”. The Style Settings panel and
this reference use the same order and element groups. State, border, color, and weight settings remain with the elements
they style.

Not currently exposed in the Style Settings UI:

- `--nn-theme-nav-separator-background`
- `--nn-theme-nav-separator-height`
- `--nn-theme-nav-separator-opacity`

## CSS Variables Reference

### Foreground colors

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-foreground` | `var(--text-normal)` | Base foreground color |
| `--nn-theme-foreground-muted` | `color-mix(in srgb, var(--nn-theme-foreground) 70%, transparent)` | Muted foreground color |
| `--nn-theme-foreground-faded` | `color-mix(in srgb, var(--nn-theme-foreground) 50%, transparent)` | Faded foreground color |
| `--nn-theme-foreground-faint` | `color-mix(in srgb, var(--nn-theme-foreground) 10%, transparent)` | Faint foreground color |

### Navigation pane

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-nav-bg` | `var(--background-secondary)` | Navigation pane background (desktop only, see mobile) |
| `--nn-theme-nav-separator-color` | `var(--nn-theme-foreground)` | Separator line color inside navigation spacers |
| `--nn-theme-nav-separator-background` | `linear-gradient(90deg, transparent 0%, var(--nn-theme-nav-separator-color) 15%, var(--nn-theme-nav-separator-color) 85%, transparent 100%)` | Fill for navigation separators; override to supply a gradient or solid color |
| `--nn-theme-nav-separator-height` | `1px` | Thickness for navigation separators |
| `--nn-theme-nav-separator-opacity` | `0.3` | Opacity for navigation separators |
| `--nn-theme-nav-indent-guide-color` | `var(--nn-theme-foreground-faded)` | Line color for navigation indent guides |
| `--nn-theme-nav-leader-color` | `var(--nn-theme-foreground-faded)` | Color for leaders between item names and trailing values |
| `--nn-theme-pinned-shortcut-shadow-color` | `rgba(0, 0, 0, 0.03)` | Gradient overlay below pinned shortcuts; defaults to `rgba(0, 0, 0, 0.18)` in dark mode |

#### Navigation items

Custom-color weight also applies to list pane group headers, parent folder paths, and tag or property pills. Folder-note
decoration also applies to list pane titles, breadcrumbs, and folder group headers.

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-navitem-chevron-color` | `var(--nn-theme-foreground-muted)` | Item expand/collapse arrow color |
| `--nn-theme-navitem-icon-color` | `var(--nn-theme-foreground-muted)` | Item icon color |
| `--nn-theme-navitem-name-color` | `var(--nn-theme-foreground)` | Item name color |
| `--nn-theme-navitem-file-name-color` | `var(--nn-theme-navitem-name-color)` | File shortcut and recent file name color |
| `--nn-theme-navitem-name-font-weight` | `400` | Item name font weight |
| `--nn-theme-navitem-custom-color-name-font-weight` | `600` | Font weight for custom or rainbow-colored text |
| `--nn-theme-navitem-folder-note-name-decoration` | `underline` | Text decoration for folder note names |
| `--nn-theme-navitem-folder-note-name-hover-decoration` | `underline` | Text decoration when hovering folder note names |
| `--nn-theme-navitem-border-radius` | `4px` | Item corner radius (0-14px) |
| `--nn-theme-navitem-border-width` | `0px` | Item border width for custom backgrounds, hover, and selection |
| `--nn-theme-navitem-custom-border-color` | `transparent` | Item border color with a custom background |
| `--nn-theme-navitem-hover-bg` | `var(--background-modifier-hover)` | Item background when hovered (desktop only) |
| `--nn-theme-navitem-hover-border-color` | `transparent` | Item border color when hovered |
| `--nn-theme-tag-positive-bg` | `#00800033` | Included tag highlight and tag drop target background |
| `--nn-theme-tag-negative-bg` | `#ff000033` | Excluded tag highlight and untagged drop target background |

#### Navigation selection

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-navitem-selected-bg` | `var(--text-selection)` | Selected item background |
| `--nn-theme-navitem-selected-border-color` | `transparent` | Selected item border color |
| `--nn-theme-navitem-selected-chevron-color` | `var(--nn-theme-navitem-chevron-color)` | Selected item expand/collapse arrow color |
| `--nn-theme-navitem-selected-icon-color` | `var(--nn-theme-navitem-icon-color)` | Selected item icon color |
| `--nn-theme-navitem-selected-name-color` | `var(--nn-theme-navitem-name-color)` | Selected item name color |
| `--nn-theme-navitem-selected-inactive-bg` | `var(--background-modifier-hover)` | Selected item background when the pane is inactive |
| `--nn-theme-navitem-selected-inactive-border-color` | `var(--nn-theme-navitem-selected-border-color)` | Selected item border color when the pane is inactive |
| `--nn-theme-navitem-selected-inactive-chevron-color` | `var(--nn-theme-navitem-selected-chevron-color)` | Selected item expand/collapse arrow color when the pane is inactive |
| `--nn-theme-navitem-selected-inactive-icon-color` | `var(--nn-theme-navitem-selected-icon-color)` | Selected item icon color when the pane is inactive |
| `--nn-theme-navitem-selected-inactive-name-color` | `var(--nn-theme-navitem-name-color)` | Selected item name color when the pane is inactive |

#### File counts

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-navitem-count-color` | `var(--nn-theme-foreground-muted)` | File count text color |
| `--nn-theme-navitem-count-font-weight` | `400` | File count font weight |
| `--nn-theme-navitem-count-bg` | `transparent` | File count background |
| `--nn-theme-navitem-count-border-radius` | `8px` | File count corner radius (0-8px) |
| `--nn-theme-navitem-count-border-width` | `0px` | File count border width |
| `--nn-theme-navitem-count-border-color` | `transparent` | File count border color |
| `--nn-theme-navitem-selected-count-color` | `var(--nn-theme-navitem-count-color)` | Selected file count text color |
| `--nn-theme-navitem-selected-count-bg` | `var(--nn-theme-navitem-count-bg)` | Selected file count background |
| `--nn-theme-navitem-selected-count-border-color` | `var(--nn-theme-navitem-count-border-color)` | Selected file count border color |
| `--nn-theme-navitem-selected-inactive-count-color` | `var(--nn-theme-navitem-selected-count-color)` | Selected file count text color when the pane is inactive |
| `--nn-theme-navitem-selected-inactive-count-bg` | `var(--nn-theme-navitem-selected-count-bg)` | Selected file count background when the pane is inactive |
| `--nn-theme-navitem-selected-inactive-count-border-color` | `var(--nn-theme-navitem-selected-count-border-color)` | Selected file count border color when the pane is inactive |

### List pane

Search icon and supporting text use the shared variables under [Pane headers and titles](#pane-headers-and-titles).

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-list-bg` | `var(--background-primary)` | List pane background (desktop only, see mobile) |
| `--nn-theme-list-search-active-bg` | `var(--text-highlight-bg)` | Search field and match highlight background when a query is active |
| `--nn-theme-list-search-border-color` | `var(--background-modifier-border)` | Search field border and focus ring color |
| `--nn-theme-list-separator-color` | `var(--background-modifier-border)` | Separator color between files |

#### Group headers

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-list-group-header-color` | `var(--nn-theme-foreground-muted)` | Group header text color |
| `--nn-theme-list-group-header-font-weight` | `600` | Group header text font weight |

#### File items

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-file-name-color` | `var(--nn-theme-foreground)` | File name color |
| `--nn-theme-file-name-font-weight` | `600` | File name font weight |
| `--nn-theme-file-compact-name-font-weight` | `400` | File name font weight in compact mode |
| `--nn-theme-file-preview-color` | `var(--nn-theme-foreground-muted)` | File preview color |
| `--nn-theme-file-preview-font-weight` | `400` | File preview font weight |
| `--nn-theme-file-task-color` | unset, falls back to location-specific icon or date colors | Task display and unfinished-task replacement file icon color; set values also apply on selected rows |
| `--nn-theme-file-task-font-weight` | `400` | File task count and icon weight |
| `--nn-theme-file-task-complete-color` | unset, falls back to `--nn-theme-file-task-color` | File task color when all tasks are complete; set values also apply on selected rows |
| `--nn-theme-file-task-complete-font-weight` | `400` | File task count and icon weight when all tasks are complete |
| `--nn-theme-file-date-color` | `var(--nn-theme-foreground-faded)` | File date color |
| `--nn-theme-file-date-font-weight` | `400` | File date font weight |
| `--nn-theme-file-word-count-color` | `var(--nn-theme-foreground-faded)` | File word count color |
| `--nn-theme-file-word-count-font-weight` | `400` | File word count font weight |
| `--nn-theme-file-parent-color` | `var(--nn-theme-foreground-faded)` | File parent folder color |
| `--nn-theme-file-parent-font-weight` | `400` | File parent folder font weight |
| `--nn-theme-file-feature-border-radius` | `4px` | Feature image corner radius (0-32px) |
| `--nn-theme-file-border-radius` | `8px` | File item corner radius (0-16px) |

#### File selection

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-file-selected-bg` | `var(--text-selection)` | Selected file background |
| `--nn-theme-file-border-width` | `0px` | Selected file border width |
| `--nn-theme-file-selected-border-color` | `transparent` | Selected file border color |
| `--nn-theme-file-selected-name-color` | `var(--nn-theme-file-name-color)` | Selected file name color |
| `--nn-theme-file-selected-preview-color` | `var(--nn-theme-file-preview-color)` | Selected file preview color |
| `--nn-theme-file-selected-date-color` | `var(--nn-theme-foreground-muted)` | Selected file date color |
| `--nn-theme-file-selected-word-count-color` | `var(--nn-theme-foreground-muted)` | Selected file word count color |
| `--nn-theme-file-selected-parent-color` | `var(--nn-theme-foreground-muted)` | Selected file parent folder color |
| `--nn-theme-file-selected-inactive-bg` | `var(--background-modifier-hover)` | Selected file background when the pane is inactive |
| `--nn-theme-file-selected-inactive-border-color` | `var(--nn-theme-file-selected-border-color)` | Selected file border color when the pane is inactive |
| `--nn-theme-file-selected-inactive-name-color` | `var(--nn-theme-file-selected-name-color)` | Selected file name color when the pane is inactive |
| `--nn-theme-file-selected-inactive-preview-color` | `var(--nn-theme-file-selected-preview-color)` | Selected file preview color when the pane is inactive |
| `--nn-theme-file-selected-inactive-date-color` | `var(--nn-theme-file-selected-date-color)` | Selected file date color when the pane is inactive |
| `--nn-theme-file-selected-inactive-word-count-color` | `var(--nn-theme-file-selected-word-count-color)` | Selected file word count color when the pane is inactive |
| `--nn-theme-file-selected-inactive-parent-color` | `var(--nn-theme-file-selected-parent-color)` | Selected file parent folder color when the pane is inactive |

#### Tag and property pills

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-file-tag-color` | `var(--nn-theme-foreground-faded)` | Default tag pill text color |
| `--nn-theme-file-tag-custom-color-text-color` | `var(--nn-theme-navitem-name-color)` | Tag pill text color with a custom background but no custom text color |
| `--nn-theme-file-property-color` | `var(--nn-theme-foreground-faded)` | Default property pill text color |
| `--nn-theme-file-tag-font-weight` | `400` | Tag and property pill text font weight without custom text colors |
| `--nn-theme-file-tag-bg` | `transparent` | Default tag pill background |
| `--nn-theme-file-tag-border-radius` | `10px` | Tag pill corner radius (0-10px) |
| `--nn-theme-file-property-bg` | `transparent` | Default property pill background |
| `--nn-theme-file-property-border-radius` | `10px` | Property pill corner radius (0-10px) |
| `--nn-theme-file-pill-border-width` | `1px` | Tag and property pill border width |
| `--nn-theme-file-tag-border-color` | `color-mix(in srgb, var(--nn-theme-foreground) 30%, transparent)` | Tag pill border color without custom colors |
| `--nn-theme-file-property-border-color` | `var(--nn-theme-file-tag-border-color)` | Property pill border color without custom colors |
| `--nn-theme-file-selected-tag-color` | `var(--nn-theme-foreground-muted)` | Selected tag pill text color |
| `--nn-theme-file-selected-tag-bg` | `var(--nn-theme-file-tag-bg)` | Selected tag pill background |
| `--nn-theme-file-selected-tag-border-color` | `var(--nn-theme-file-tag-border-color)` | Selected tag pill border color |
| `--nn-theme-file-selected-property-color` | `var(--nn-theme-foreground-muted)` | Selected property pill text color |
| `--nn-theme-file-selected-property-bg` | `var(--nn-theme-file-property-bg)` | Selected property pill background |
| `--nn-theme-file-selected-property-border-color` | `var(--nn-theme-file-property-border-color)` | Selected property pill border color |
| `--nn-theme-file-selected-inactive-tag-color` | `var(--nn-theme-file-selected-tag-color)` | Selected tag pill text color when the pane is inactive |
| `--nn-theme-file-selected-inactive-tag-bg` | `var(--nn-theme-file-tag-bg)` | Selected tag pill background when the pane is inactive |
| `--nn-theme-file-selected-inactive-property-color` | `var(--nn-theme-file-selected-property-color)` | Selected property pill text color when the pane is inactive |
| `--nn-theme-file-selected-inactive-property-bg` | `var(--nn-theme-file-property-bg)` | Selected property pill background when the pane is inactive |

Tag pills with only a custom text color use the list pane background. Tag pills with a custom background use the
navigation pane background. In `primary` and `secondary` background modes, both panes share the same background.

#### Quick actions

Quick actions are shown on desktop.

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-quick-actions-bg` | `color-mix(in srgb, var(--background-primary) 95%, transparent)` | Quick actions toolbar background |
| `--nn-theme-quick-actions-border` | `var(--background-modifier-border)` | Quick actions toolbar border color |
| `--nn-theme-quick-actions-border-radius` | `4px` | Quick actions toolbar corner radius (0-12px) |
| `--nn-theme-quick-actions-icon-color` | `var(--nn-theme-foreground-muted)` | Quick actions toolbar icon color |
| `--nn-theme-quick-actions-icon-hover-color` | `var(--nn-theme-foreground)` | Quick actions toolbar icon color when hovered |
| `--nn-theme-quick-actions-separator-color` | `var(--background-modifier-border)` | Quick actions toolbar separator color |

### Pane headers and titles

These variables are shared by the navigation and list panes.

#### Pane titles

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-list-heading-color` | `var(--nn-theme-foreground-muted)` | List pane title and navigation pane vault title text color |
| `--nn-theme-list-heading-font-weight` | `600` | List pane title and navigation pane vault title font weight |

#### Pane headers

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-list-header-icon-color` | `var(--nn-theme-foreground-muted)` | Folder, tag, and property icon color in pane headers and search |
| `--nn-theme-list-header-breadcrumb-color` | `var(--nn-theme-foreground-muted)` | Pane header title, breadcrumb, and search supporting text color |
| `--nn-theme-list-header-breadcrumb-font-weight` | `600` | Pane header title and breadcrumb font weight |

#### Header buttons

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-header-button-icon-color` | `var(--icon-color)` | Header button icon color |
| `--nn-theme-header-button-hover-bg` | `var(--background-modifier-hover)` | Header button background when hovered |
| `--nn-theme-header-button-active-bg` | `var(--background-modifier-hover)` | Active header button background |
| `--nn-theme-header-button-active-icon-color` | `var(--text-normal)` | Active header button icon color |
| `--nn-theme-header-button-disabled-icon-color` | `var(--icon-color)` | Disabled header button icon color |

### Calendar

#### Calendar labels

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-calendar-header-color` | `var(--nn-theme-foreground)` | Month, year, and header button text color |
| `--nn-theme-calendar-weekday-color` | `var(--nn-theme-foreground-muted)` | Weekday label text color |
| `--nn-theme-calendar-week-color` | `var(--nn-theme-foreground-muted)` | Week number text color |
| `--nn-theme-calendar-day-in-month-color` | `var(--nn-theme-foreground)` | Current-month day text color |
| `--nn-theme-calendar-day-outside-month-color` | `var(--nn-theme-foreground-faded)` | Outside-month day text color |

#### Day states

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-calendar-weekend-bg` | `color-mix(in srgb, var(--nn-theme-foreground) 10%, transparent)` | Weekend day background |
| `--nn-theme-calendar-hover-bg` | `var(--background-modifier-hover)` | Calendar button and day background when hovered |
| `--nn-theme-calendar-day-today-color` | `var(--nn-theme-calendar-day-in-month-color)` | Today text color |
| `--nn-theme-calendar-day-today-bg` | `var(--text-selection)` | Today highlight background |
| `--nn-theme-calendar-day-active-border-color` | `var(--interactive-accent)` | Selection outline color |
| `--nn-theme-calendar-day-active-border-width` | `3px` | Selection outline thickness |

#### Indicators and feature images

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-calendar-note-indicator-color` | `var(--nn-theme-foreground-faded)` | Daily note indicator color |
| `--nn-theme-calendar-unfinished-task-indicator-color` | `var(--nn-theme-calendar-note-indicator-color)` | Unfinished task indicator color |
| `--nn-theme-calendar-feature-image-text-color` | `white` | Feature image day text color |
| `--nn-theme-calendar-feature-image-overlay-color` | `rgb(0 0 0 / 0.05)` in light mode, `rgb(0 0 0 / 0.3)` in dark mode | Feature image overlay color |

### Pane divider

These variables apply in desktop and tablet dual-pane layouts.

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-divider-border-color` | `var(--divider-color)` | Border color between panes in horizontal and vertical split layouts |
| `--nn-theme-divider-resize-handle-hover-bg` | `var(--interactive-accent)` | Pane divider resize handle background when hovered |

### Mobile

| Variable | Default | Description |
| --- | --- | --- |
| `--nn-theme-mobile-bg` | `var(--mobile-sidebar-background)` | Navigation and list pane background |
| `--nn-theme-mobile-list-header-link-color` | `var(--link-color)` | Header back button and clickable breadcrumb segment color |
| `--nn-theme-mobile-list-header-breadcrumb-color` | `var(--nn-theme-foreground)` | Header breadcrumb current folder and separator color |
| `--nn-theme-mobile-list-header-breadcrumb-font-weight` | `600` | Header breadcrumb font weight |
| `--nn-theme-mobile-toolbar-glass-bg` | `var(--background-primary)` | iOS glass toolbar base color |
| `--nn-theme-mobile-toolbar-button-icon-color` | `var(--link-color)` | Toolbar button icon color |
| `--nn-theme-mobile-toolbar-button-active-bg` | `var(--background-modifier-hover)` | Active toolbar button background |
| `--nn-theme-mobile-toolbar-button-active-icon-color` | `var(--link-color)` | Active toolbar button icon color |

On iOS with floating toolbars enabled, `.notebook-navigator-ios.notebook-navigator-ios-floating-toolbars` overrides:

- `--nn-theme-mobile-toolbar-button-icon-color`: `var(--nn-theme-foreground)`
- `--nn-theme-mobile-toolbar-button-active-bg`: `transparent`

## Complete Theme Example

Example dark-mode theme snippet using a JetBrains Darcula-inspired palette. It sets all `--nn-theme-*` variables
supported by Notebook Navigator:

```css
.theme-dark {
  /* Foreground colors */
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
  --nn-theme-pinned-shortcut-shadow-color: rgba(0, 0, 0, 0.2);

  /* Navigation items */
  --nn-theme-navitem-chevron-color: #6e6e6e;
  --nn-theme-navitem-icon-color: #afb1b3;
  --nn-theme-navitem-name-color: #a9b7c6;
  --nn-theme-navitem-file-name-color: #a9b7c6;
  --nn-theme-navitem-name-font-weight: 400;
  --nn-theme-navitem-custom-color-name-font-weight: 600;
  --nn-theme-navitem-folder-note-name-decoration: underline;
  --nn-theme-navitem-folder-note-name-hover-decoration: underline;
  --nn-theme-navitem-border-radius: 3px;
  --nn-theme-navitem-border-width: 1px;
  --nn-theme-navitem-custom-border-color: rgba(0, 0, 0, 0.18);
  --nn-theme-navitem-hover-bg: #4b5059;
  --nn-theme-navitem-hover-border-color: rgba(255, 255, 255, 0.18);
  --nn-theme-tag-positive-bg: rgba(106, 135, 89, 0.2);
  --nn-theme-tag-negative-bg: rgba(219, 80, 80, 0.2);

  /* Navigation selection */
  --nn-theme-navitem-selected-bg: #4a78c8;
  --nn-theme-navitem-selected-border-color: rgba(255, 255, 255, 0.25);
  --nn-theme-navitem-selected-chevron-color: #c5c5c5;
  --nn-theme-navitem-selected-icon-color: #e6e6e6;
  --nn-theme-navitem-selected-name-color: #ffffff;
  --nn-theme-navitem-selected-inactive-bg: #464c55;
  --nn-theme-navitem-selected-inactive-border-color: rgba(255, 255, 255, 0.14);
  --nn-theme-navitem-selected-inactive-chevron-color: #9da2ab;
  --nn-theme-navitem-selected-inactive-icon-color: #b9bec6;
  --nn-theme-navitem-selected-inactive-name-color: #cfd3da;

  /* File counts */
  --nn-theme-navitem-count-color: #7f8b91;
  --nn-theme-navitem-count-font-weight: 400;
  --nn-theme-navitem-count-bg: transparent;
  --nn-theme-navitem-count-border-radius: 3px;
  --nn-theme-navitem-count-border-width: 1px;
  --nn-theme-navitem-count-border-color: rgba(255, 255, 255, 0.2);
  --nn-theme-navitem-selected-count-color: #e6e6e6;
  --nn-theme-navitem-selected-count-bg: rgba(0, 0, 0, 0.2);
  --nn-theme-navitem-selected-count-border-color: rgba(255, 255, 255, 0.3);
  --nn-theme-navitem-selected-inactive-count-color: #b9bec6;
  --nn-theme-navitem-selected-inactive-count-bg: rgba(0, 0, 0, 0.25);
  --nn-theme-navitem-selected-inactive-count-border-color: rgba(255, 255, 255, 0.2);

  /* List pane */
  --nn-theme-list-bg: #2b2b2b;
  --nn-theme-list-search-active-bg: #515336;
  --nn-theme-list-search-border-color: #3c3c3c;
  --nn-theme-list-separator-color: #3c3c3c;

  /* Group headers */
  --nn-theme-list-group-header-color: #7f8b91;
  --nn-theme-list-group-header-font-weight: 600;

  /* File items */
  --nn-theme-file-name-color: #a9b7c6;
  --nn-theme-file-name-font-weight: 600;
  --nn-theme-file-compact-name-font-weight: 400;
  --nn-theme-file-preview-color: #7f8b91;
  --nn-theme-file-preview-font-weight: 400;
  --nn-theme-file-task-color: #afb1b3;
  --nn-theme-file-task-font-weight: 400;
  --nn-theme-file-task-complete-color: #6a8759;
  --nn-theme-file-task-complete-font-weight: 400;
  --nn-theme-file-date-color: #6a8759;
  --nn-theme-file-date-font-weight: 400;
  --nn-theme-file-word-count-color: #6a8759;
  --nn-theme-file-word-count-font-weight: 400;
  --nn-theme-file-parent-color: #cc7832;
  --nn-theme-file-parent-font-weight: 400;
  --nn-theme-file-feature-border-radius: 3px;
  --nn-theme-file-border-radius: 4px;

  /* File selection */
  --nn-theme-file-selected-bg: #4a78c8;
  --nn-theme-file-border-width: 1px;
  --nn-theme-file-selected-border-color: rgba(255, 255, 255, 0.24);
  --nn-theme-file-selected-name-color: #ffffff;
  --nn-theme-file-selected-preview-color: #c5c5c5;
  --nn-theme-file-selected-date-color: #a5dc86;
  --nn-theme-file-selected-word-count-color: #a5dc86;
  --nn-theme-file-selected-parent-color: #ffd580;
  --nn-theme-file-selected-inactive-bg: #383c45;
  --nn-theme-file-selected-inactive-border-color: rgba(255, 255, 255, 0.14);
  --nn-theme-file-selected-inactive-name-color: #dfe3e8;
  --nn-theme-file-selected-inactive-preview-color: #b9bec6;
  --nn-theme-file-selected-inactive-date-color: #8fb275;
  --nn-theme-file-selected-inactive-word-count-color: #8fb275;
  --nn-theme-file-selected-inactive-parent-color: #e3b173;

  /* Tag and property pills */
  --nn-theme-file-tag-color: #9876aa;
  --nn-theme-file-tag-custom-color-text-color: #ffffff;
  --nn-theme-file-property-color: #cc7832;
  --nn-theme-file-tag-font-weight: 400;
  --nn-theme-file-tag-bg: #383a3e;
  --nn-theme-file-tag-border-radius: 3px;
  --nn-theme-file-property-bg: #383a3e;
  --nn-theme-file-property-border-radius: 3px;
  --nn-theme-file-pill-border-width: 1px;
  --nn-theme-file-tag-border-color: rgba(255, 255, 255, 0.2);
  --nn-theme-file-property-border-color: rgba(255, 255, 255, 0.2);
  --nn-theme-file-selected-tag-color: #ffffff;
  --nn-theme-file-selected-tag-bg: #5a5f66;
  --nn-theme-file-selected-tag-border-color: rgba(255, 255, 255, 0.3);
  --nn-theme-file-selected-property-color: #ffffff;
  --nn-theme-file-selected-property-bg: #5a5f66;
  --nn-theme-file-selected-property-border-color: rgba(255, 255, 255, 0.3);
  --nn-theme-file-selected-inactive-tag-color: #dfe3e8;
  --nn-theme-file-selected-inactive-tag-bg: #4c5058;
  --nn-theme-file-selected-inactive-property-color: #dfe3e8;
  --nn-theme-file-selected-inactive-property-bg: #4c5058;

  /* Quick actions */
  --nn-theme-quick-actions-bg: rgba(43, 43, 43, 0.95);
  --nn-theme-quick-actions-border: #555555;
  --nn-theme-quick-actions-border-radius: 4px;
  --nn-theme-quick-actions-icon-color: #7f8b91;
  --nn-theme-quick-actions-icon-hover-color: #a9b7c6;
  --nn-theme-quick-actions-separator-color: #3c3c3c;

  /* Pane titles */
  --nn-theme-list-heading-color: #d0d2d6;
  --nn-theme-list-heading-font-weight: 600;

  /* Pane headers */
  --nn-theme-list-header-icon-color: #7f8b91;
  --nn-theme-list-header-breadcrumb-color: #7f8b91;
  --nn-theme-list-header-breadcrumb-font-weight: 600;

  /* Header buttons */
  --nn-theme-header-button-icon-color: #7f8b91;
  --nn-theme-header-button-hover-bg: #4b5059;
  --nn-theme-header-button-active-bg: #4a78c8;
  --nn-theme-header-button-active-icon-color: #ffffff;
  --nn-theme-header-button-disabled-icon-color: #5c5c5c;

  /* Calendar labels */
  --nn-theme-calendar-header-color: var(--nn-theme-foreground);
  --nn-theme-calendar-weekday-color: var(--nn-theme-foreground-muted);
  --nn-theme-calendar-week-color: var(--nn-theme-foreground-muted);
  --nn-theme-calendar-day-in-month-color: var(--nn-theme-foreground);
  --nn-theme-calendar-day-outside-month-color: var(--nn-theme-foreground-faded);

  /* Calendar day states */
  --nn-theme-calendar-weekend-bg: rgba(169, 183, 198, 0.1);
  --nn-theme-calendar-hover-bg: #4b5059;
  --nn-theme-calendar-day-today-color: #ffffff;
  --nn-theme-calendar-day-today-bg: #4a78c8;
  --nn-theme-calendar-day-active-border-color: rgba(169, 183, 198, 0.5);
  --nn-theme-calendar-day-active-border-width: 2px;

  /* Calendar indicators and feature images */
  --nn-theme-calendar-note-indicator-color: #4a78c8;
  --nn-theme-calendar-unfinished-task-indicator-color: #4a78c8;
  --nn-theme-calendar-feature-image-text-color: #ffffff;
  --nn-theme-calendar-feature-image-overlay-color: rgb(0 0 0 / 0.05);

  /* Pane divider */
  --nn-theme-divider-border-color: #323232;
  --nn-theme-divider-resize-handle-hover-bg: #4a78c8;

  /* Mobile */
  --nn-theme-mobile-bg: #2b2b2b;
  --nn-theme-mobile-list-header-link-color: #589df6;
  --nn-theme-mobile-list-header-breadcrumb-color: #a9b7c6;
  --nn-theme-mobile-list-header-breadcrumb-font-weight: 600;
  --nn-theme-mobile-toolbar-glass-bg: #2b2b2b;
  --nn-theme-mobile-toolbar-button-icon-color: #a9b7c6;
  --nn-theme-mobile-toolbar-button-active-bg: #4a78c8;
  --nn-theme-mobile-toolbar-button-active-icon-color: #ffffff;
}
```
