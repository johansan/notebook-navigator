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

- Runs ESLint to check for code quality issues
- Validates TypeScript types
- Checks for unused imports and dead code
- Verifies code formatting with Prettier
- Builds the plugin using esbuild
- **Stops immediately if ANY errors or warnings are found**
- Calls `build-local.sh` or `build-local.ps1` if available (for local deployment to Obsidian vault)

**Requirements:**

- The build MUST complete with zero errors and zero warnings
- The build summary must show "✅ No warnings"
- Any ESLint errors, TypeScript errors, or warnings will abort the deployment

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

- Increments version numbers in `manifest.json`, `package.json`, and `versions.json`
- Validates git repository state (clean, on main branch, synced with remote)
- Runs build verification before release
- Creates a release branch and pull request with the version bump
- With GitHub CLI, waits for the release pull request to merge, then publishes by creating and pushing a git tag
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
- If the script creates a pull request with GitHub CLI, leave it running while you merge the pull request
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
node scripts/mdReleaseNotes.js
```

**Features:**

- Reads the latest release notes from `src/releaseNotes.ts`
- Converts TypeScript object format to clean Markdown
- Outputs formatted release notes ready for GitHub release descriptions
- Automatically used by the release process

## build-local.sh / build-local.ps1 (Optional)

Custom local deployment script (not included in repository).

**Purpose:**

- Deploy built plugin to your local Obsidian vault
- Automatically called by `build.sh` or `build.ps1` if present
- `build-local.sh` is used on macOS/Linux
- `build-local.ps1` is used on Windows
- Add to `.gitignore` to keep vault paths private

**Example:**

```bash
#!/bin/bash
# Copy built files to Obsidian vault
cp main.js manifest.json styles.css ~/Documents/ObsidianVault/.obsidian/plugins/notebook-navigator/
```

## check-unused-strings.mjs

Finds unused i18n keys in `src/i18n/locales/en.ts` by scanning for `strings.<keyPath>` usage across `src` (excluding `src/i18n/locales`). Also validates that every locale file matches the English locale shape.

```bash
node scripts/check-unused-strings.mjs          # Report and prompt before removing unused keys
node scripts/check-unused-strings.mjs --check  # Exit non-zero if unused keys or locale shape issues exist
node scripts/check-unused-strings.mjs --fix    # Remove unused keys without prompting
```

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
```

To keep intentional dynamic CSS usage, add an allowlist comment:

```css
/* unused-css keep nn-dynamic-class --nn-dynamic-variable */
```
