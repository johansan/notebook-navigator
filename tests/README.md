# Notebook Navigator Tests

This directory contains automated Vitest tests and a manual Obsidian console API suite.

## Automated Tests

Vitest runs every `tests/**/*.test.ts` file in a Node environment. `vitest.config.mts` maps `obsidian`
imports to `tests/stubs/obsidian.ts` and loads `tests/setup.ts` before each run.

### Commands

```bash
npm run test
npm run test:watch
npm run test -- tests/api
npm run test -- tests/api/NotebookNavigatorAPI.test.ts
npx vitest run --coverage
```

After generating icon constants, `./scripts/build.sh` runs linting, style checks, TypeScript checks,
unused-import and Knip dead-code checks, Prettier, and automated tests before the production build.

### Suite Layout

- `tests/api` checks public API behavior and exported type definition consistency.
- `tests/services` checks plugin services such as metadata, content providers, commands, workspace
  coordination, release checks, and file operations.
- `tests/storage`, `tests/context`, and `tests/hooks` check cached data, provider state, derived
  navigation/list data, and scroll behavior.
- `tests/components`, `tests/modals`, `tests/settings`, `tests/contextMenu`, `tests/constants`, and
  `tests/styles` check UI helper behavior and configuration invariants.
- `tests/utils` contains focused tests for shared utility functions.
- `tests/scripts` checks maintenance script assumptions.
- Root-level `.test.ts` files cover cross-cutting filter search and property tree builder behavior.

### Maintenance

- Keep new automated tests in `.test.ts` files under the matching domain directory.
- Use `tests/stubs/obsidian.ts` and helpers such as `tests/utils/createTestTFile.ts` and
  `tests/utils/pathMetadata.ts` when tests need Obsidian objects or path-derived file metadata.
- Mock browser, vault, Electron, and Capacitor behavior explicitly; Vitest does not run inside Obsidian.
- Update `tests/api/PublicApiDefinitionConsistency.test.ts` and `tests/api-test-suite.js` when the
  public API surface changes.

## Manual API Console Suite

The `api-test-suite.js` file runs against an installed and enabled Notebook Navigator plugin inside
Obsidian.

### Usage

1. Open the Obsidian developer console (Ctrl/Cmd + Shift + I).
2. Copy the entire contents of `tests/api-test-suite.js`.
3. Paste it into the console and press Enter.

The script runs once immediately after paste. The global `runTests` function remains available for reruns.

### Test Options

```javascript
runTests(); // Run all tests with auto-cleanup
runTests({ verbose: true }); // Show detailed output
runTests({ only: 'metadata' }); // Run one suite
runTests({ only: ['metadata', 'navigation'] }); // Run multiple suites
runTests({ cleanup: false }); // Keep test files after running
```

### Test Categories

- **Core API** - API version, constants, and feature detection
- **Navigation** - Folder, tag, property, and file reveal behavior
- **Metadata** - Folder, tag, and file metadata methods
- **Selection** - Current navigation and file selection state
- **Events** - Event subscription and cleanup behavior

### Safety

The console suite creates temporary files and folders with a `test-` prefix at the root of the vault and
cleans them up after completion. It writes metadata and pin state for test-prefixed items, then clears
those values during normal execution.
