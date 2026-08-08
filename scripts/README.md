# Scripts

Utility scripts for building, releasing, and maintaining the Notebook Navigator plugin.

## build.sh / build.ps1

The main build script that ensures code quality before deployment.

**Usage:**

```bash
./scripts/build.sh
```

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build.ps1
```

**Features:**

- Generates icon constants from `icon.svg`
- Runs ESLint to check for code quality issues
- Runs Stylelint and regenerates `styles.css`
- Checks for unused localization keys and locale schema mismatches
- Validates TypeScript types
- Checks for unused imports and dead code
- Formats code with Prettier
- Runs unit tests
- Builds the plugin using esbuild
- **Aborts before bundling or deployment if ANY errors or warnings are found**
- Calls an optional local deployment script after a successful build (`build.sh` runs `build-local.sh`; `build.ps1` prefers `build-local.ps1` and falls back to `build-local.sh` when Bash is available)

**Requirements:**

- The build MUST complete with zero errors and zero warnings
- The build summary must show "✅ No warnings"
- Any lint, localization, type-check, test, or warning failure will abort the deployment
- Node.js `>=24.0.0` is required by `package.json`

## build-icons.mjs

Generates `src/constants/notebookNavigatorIcon.ts` from `icon.svg`.

**Usage:**

```bash
npm run build:icons
```

**Features:**

- Extracts the inner SVG content expected by Obsidian `addIcon()`
- Adds current-color stroke handling
- Writes the generated TypeScript icon constants file only when content changes

## build-styles.mjs

Generates `styles.css` from the source CSS entry point and section files.

**Usage:**

```bash
npm run build:styles
```

**Features:**

- Reads import order from `src/styles/index.css`
- Concatenates files from `src/styles/sections/*`
- Validates theming variables, defaults, grouping, ordering, Style Settings exclusions, and the complete example against
  `docs/theming-guide.md`
- Writes the generated `styles.css` file only when content changes
- Used by `npm run build`, `npm run lint:styles`, and `./scripts/build.sh`

## release.js

Automates the release process for the Obsidian plugin.

**Usage:**

```bash
node scripts/release.js                    # Publish an untagged merged version, or choose the next release
node scripts/release.js patch              # Prepare a patch release PR
node scripts/release.js minor              # Prepare a minor release PR
node scripts/release.js major              # Prepare a major release PR
node scripts/release.js patch --dry-run    # Preview release PR preparation
```

**Features:**

- Increments version numbers in `manifest.json`, `package.json`, `package-lock.json`, and `versions.json`
- Validates git repository state (clean, on main branch, synced with remote)
- Runs build verification before release
- Creates a release branch and pull request with the version bump
- With GitHub CLI, waits for release pull request checks, merges the pull request, then publishes by creating and pushing a git tag
- Pushes the tag to trigger the GitHub Actions release workflow
- Verifies the remote tag, GitHub release assets, release workflow result, and artifact attestations after publishing

**Version Types:**

- **PATCH** (x.x.X): Bug fixes, small tweaks, documentation updates
- **MINOR** (x.X.x): New features, backwards-compatible changes
- **MAJOR** (X.x.x): Breaking changes, major rewrites

**Important:**

- Never manually modify version numbers in files
- Always commit all changes before running
- Must be on main branch and synced with remote
- An authenticated GitHub CLI is required for release pull request automation
- If the script creates a pull request, leave it running while CI completes; it merges the pull request when checks pass and GitHub allows the merge
- If you stop the script after merging the release pull request, run `node scripts/release.js` again to publish

## gitdump.sh

Generates git diff snapshots for code review and backup purposes.

**Usage:**

```bash
./scripts/gitdump.sh
```

**Options:**

1. **Uncommitted changes** - Shows staged and unstaged changes
2. **Current branch vs main** - Shows all changes from main branch
3. **Current state vs before specific commit** - Shows changes since a specific commit

**Output:**

- Creates timestamped diff files in the parent directory
- File format: `{folder_name}_{type}_{timestamp}.txt`
- Useful for quick code reviews or sharing changes

## mdReleaseNotes.js

Converts release notes from TypeScript format to Markdown for GitHub releases.

**Usage:**

```bash
node scripts/mdReleaseNotes.js            # Print latest release notes
node scripts/mdReleaseNotes.js 3.2.2      # Print release notes for a specific version
```

**Features:**

- Reads release notes from `src/releaseNotes.ts`
- Defaults to the latest release notes entry
- Accepts a version argument, with or without a leading `v`
- Converts TypeScript object format to clean Markdown
- Outputs formatted release notes ready for GitHub release descriptions
- Automatically used by the release process

## build-local.sh / build-local.ps1 (Optional)

Custom local deployment script (ignored by git and not committed to the repository).

**Purpose:**

- Deploy built plugin to your local Obsidian vault
- Automatically called after a successful `build.sh` or `build.ps1` run if present
- `build-local.sh` is used by `build.sh` on macOS/Linux and as the `build.ps1` fallback when Bash is available
- `build-local.ps1` is preferred by `build.ps1` on Windows
- Already ignored by `.gitignore` to keep vault paths private

**Example:**

```bash
#!/bin/bash
# Copy built files to Obsidian vault
cp main.js manifest.json styles.css ~/Documents/ObsidianVault/.obsidian/plugins/notebook-navigator/
```

## check-unused-strings.mjs

Finds unused i18n keys in `src/i18n/locales/en.ts` by scanning for `strings.<keyPath>` usage across `src` (excluding `src/i18n/locales`). Also validates that every locale file matches the English locale shape.

```bash
npm run check:strings
node scripts/check-unused-strings.mjs          # Report and prompt before removing unused keys
node scripts/check-unused-strings.mjs --check  # Exit non-zero if unused keys or locale shape issues exist
node scripts/check-unused-strings.mjs --fix    # Remove unused keys without prompting
node scripts/check-unused-strings.mjs --project-root /path/to/project-root
```

`npm run build` runs `npm run check:strings` before TypeScript validation and bundling. This also covers the main build scripts and release workflow.

To keep an intentionally dynamic key, add an allowlist comment:

```ts
// unused-strings keep settings.items.example
```

## check-unused-css.mjs

Builds the expected generated CSS from `src/styles/index.css` in memory, checks whether `styles.css` is stale, and scans `src` for unused plugin CSS classes and variables.

```bash
node scripts/check-unused-css.mjs          # Report unused CSS and stale generated CSS
node scripts/check-unused-css.mjs --check  # Exit non-zero if stale CSS or unused CSS exists
node scripts/check-unused-css.mjs --fix    # Regenerate stale styles.css, then check unused CSS
node scripts/check-unused-css.mjs --project-root /path/to/project-root
```

To keep intentional dynamic CSS usage, add an allowlist comment:

```css
/* unused-css keep nn-dynamic-class --nn-dynamic-variable */
```

## update-icon-packs.sh

Runs the icon pack updater from `icon-assets/scripts/update-icon-packs.ts`.

**Usage:**

```bash
./scripts/update-icon-packs.sh                     # Update all packs
./scripts/update-icon-packs.sh --check-only        # Check for updates without applying them
./scripts/update-icon-packs.sh --force             # Force updates
./scripts/update-icon-packs.sh --generate-only     # Regenerate bundled manifest files from local icon-assets
./scripts/update-icon-packs.sh phosphor --force    # Update a specific pack
```

**Features:**

- Uses `npx tsx` to run the TypeScript updater
- Supports updating all packs or selected pack IDs
- Supports check-only, forced update, and local manifest regeneration modes
