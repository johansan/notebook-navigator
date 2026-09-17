#!/usr/bin/env node

/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Release Script
 * ==============
 * This script automates the release process for Obsidian plugins by:
 * - Incrementing version numbers in manifest.json, package.json, package-lock.json, and versions.json
 * - Committing and pushing the version bump directly to main
 * - Waiting for main CI on the release commit, then publishing by creating and pushing a git tag
 * - Verifying the GitHub release assets, release workflow result, and artifact attestations
 *
 * Usage:
 *   node release.js                    # Publish an untagged version on main, or choose the next release
 *   node release.js patch              # Publish a patch release
 *   node release.js minor              # Publish a minor release
 *   node release.js major              # Publish a major release
 *   node release.js patch --dry-run    # Preview changes without executing
 *
 * Version numbering follows Semantic Versioning (semver):
 *   MAJOR.MINOR.PATCH (e.g., 1.2.3)
 *
 *   - PATCH (x.x.X): Bug fixes, small tweaks, documentation updates
 *     Example: 1.2.3 → 1.2.4
 *     Use when: You fixed a bug, updated docs, or made tiny improvements
 *
 *   - MINOR (x.X.x): New features, backwards-compatible changes
 *     Example: 1.2.3 → 1.3.0 (patch resets to 0)
 *     Use when: You added new commands, settings, or features that don't break existing functionality
 *
 *   - MAJOR (X.x.x): Breaking changes, major rewrites, incompatible API changes
 *     Example: 1.2.3 → 2.0.0 (minor and patch reset to 0)
 *     Use when: You changed how settings work, removed features, or made changes that require users to reconfigure
 *
 * Make sure you have committed all your changes before running this script.
 * Release version changes are pushed directly to main before publishing.
 */

const fs = require('fs');
const { execSync, execFileSync } = require('child_process');
const path = require('path');
const readline = require('readline');
const os = require('os');

// ============================================================================
// CONFIGURATION
// ============================================================================

const projectRoot = path.join(__dirname, '..');
const validReleaseTypes = ['patch', 'minor', 'major'];
const lockFilePath = path.join(projectRoot, '.release.lock');
const releaseAssetNames = ['main.js', 'manifest.json', 'styles.css', 'languages.json'];
const attestedReleaseAssetNames = releaseAssetNames;
const releaseWorkflowPath = '.github/workflows/release.yml';
const mainWorkflowPath = '.github/workflows/ci.yml';
const mainChecksTimeoutMs = 30 * 60 * 1000;
const releasePollIntervalMs = 15 * 1000;
const releaseVerificationTimeoutMs = 15 * 60 * 1000;

// ============================================================================
// GLOBAL STATE
// ============================================================================

let needsCleanup = false;
let isDryRun = false;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Helper function to safely parse JSON files
function parseJsonFile(filePath, filename) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        throw new Error(`Failed to parse ${filename}: ${error.message}`);
    }
}

// Helper function to write JSON files with consistent formatting
function writeJsonFile(filePath, data) {
    if (isDryRun) {
        console.log(`[DRY RUN] Would write to ${path.basename(filePath)}`);
        return;
    }
    // Write to temp file first for atomic operation
    const tempPath = filePath + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2) + '\n');
    fs.renameSync(tempPath, filePath);
}

function isDryRunGitMutation(args) {
    const command = args[0];
    // Fetch and merge also change local state, so dry runs must suppress them.
    if (['add', 'commit', 'push', 'checkout', 'fetch', 'merge', 'reset'].includes(command)) {
        return true;
    }
    if (command === 'tag') {
        return args.some(arg => ['-a', '--annotate', '-s', '--sign', '-d', '--delete', '-f', '--force'].includes(arg));
    }
    if (command === 'branch') {
        return args.some(arg => ['-d', '-D', '--delete', '-m', '-M', '--move', '-c', '-C', '--copy'].includes(arg));
    }
    return false;
}

function getDryRunGitResult(options) {
    return options.encoding ? '' : Buffer.from('');
}

function logDryRunCommand(command) {
    console.log(`[DRY RUN] Would run: ${command}`);
}

// Helper to execute git commands with array syntax (safe from injection)
function gitExecArray(args, options = {}) {
    if (isDryRun && isDryRunGitMutation(args)) {
        logDryRunCommand(`git ${args.join(' ')}`);
        return getDryRunGitResult(options);
    }
    const gitOptions = { cwd: projectRoot, ...options };
    if (isDryRun) {
        // Status refreshes cached file timestamps in the index unless optional writes are disabled.
        gitOptions.env = { ...(options.env ?? process.env), GIT_OPTIONAL_LOCKS: '0' };
    }
    return execFileSync('git', args, gitOptions);
}

// Helper to execute git commands that return strings
function gitExecString(args, options = {}) {
    const result = gitExecArray(args, { encoding: 'utf8', ...options }).trim();
    return result;
}

function commandAvailable(command) {
    try {
        execFileSync(command, ['--version'], { stdio: 'ignore' });
        return true;
    } catch (e) {
        return false;
    }
}

function stringifyCommandOutput(output) {
    if (!output) {
        return '';
    }

    return Buffer.isBuffer(output) ? output.toString('utf8').trim() : String(output).trim();
}

function getCommandErrorMessage(error) {
    return stringifyCommandOutput(error?.stderr) || stringifyCommandOutput(error?.stdout) || error?.message || 'Unknown command error';
}

function sleep(ms) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function runGhJson(args) {
    let output;

    try {
        output = execFileSync('gh', args, {
            cwd: projectRoot,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe']
        });
    } catch (error) {
        throw new Error(getCommandErrorMessage(error));
    }

    try {
        return JSON.parse(output);
    } catch (error) {
        throw new Error(`Failed to parse GitHub CLI output: ${error.message}`);
    }
}

function tryRunGhJson(args) {
    try {
        return runGhJson(args);
    } catch (error) {
        return null;
    }
}

function runGh(args) {
    try {
        return execFileSync('gh', args, {
            cwd: projectRoot,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe']
        }).trim();
    } catch (error) {
        throw new Error(getCommandErrorMessage(error));
    }
}

function getRepositoryNameWithOwner() {
    const repository = runGhJson(['repo', 'view', '--json', 'nameWithOwner']);
    if (!repository?.nameWithOwner) {
        throw new Error('GitHub CLI did not return the repository name');
    }
    return repository.nameWithOwner;
}

function canUseGitHubCliForVerification() {
    if (!commandAvailable('gh')) {
        console.log('⚠️  GitHub CLI not found; verify the release and workflow manually.');
        return false;
    }

    try {
        execFileSync('gh', ['auth', 'status'], {
            cwd: projectRoot,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe']
        });
    } catch (error) {
        console.log('⚠️  GitHub CLI is installed but not authenticated or cannot access GitHub.');
        console.log(`   ${getCommandErrorMessage(error)}`);
        console.log('   Verify the release and workflow manually.');
        return false;
    }

    try {
        getRepositoryNameWithOwner();
    } catch (error) {
        console.log('⚠️  GitHub CLI could not read this repository.');
        console.log(`   ${error.message}`);
        console.log('   Verify the release and workflow manually.');
        return false;
    }

    return true;
}

function requireGitHubCliForRelease() {
    if (!commandAvailable('gh')) {
        console.error('❌ GitHub CLI is required to verify main CI and the published release.');
        console.error('   Install and authenticate gh, then run: node scripts/release.js');
        process.exit(1);
    }

    try {
        execFileSync('gh', ['auth', 'status'], {
            cwd: projectRoot,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe']
        });
    } catch (error) {
        console.error('❌ GitHub CLI is not authenticated or cannot access GitHub.');
        console.error(`   ${getCommandErrorMessage(error)}`);
        process.exit(1);
    }

    try {
        getRepositoryNameWithOwner();
    } catch (error) {
        console.error('❌ GitHub CLI could not read this repository.');
        console.error(`   ${error.message}`);
        process.exit(1);
    }

    console.log('✓ GitHub CLI can verify main CI and releases');
}

function getGitStatusPath(statusLine) {
    const pathPart = statusLine.slice(3);
    const changedPath = pathPart.includes(' -> ') ? pathPart.split(' -> ').pop() : pathPart;
    return changedPath.replace(/\\/g, '/');
}

function assertOnlyExpectedChanges(expectedFiles, options = {}) {
    const {
        message = 'Build changed files outside the release metadata:',
        guidance = 'Commit or fix these generated changes before preparing the release.'
    } = options;
    const expectedFileSet = new Set(expectedFiles);
    const status = gitExecArray(['status', '--porcelain'], { encoding: 'utf8' }).trimEnd();

    if (!status) {
        return;
    }

    const unexpectedChanges = status.split('\n').filter(line => {
        const changedPath = getGitStatusPath(line);
        return !expectedFileSet.has(changedPath);
    });

    if (unexpectedChanges.length === 0) {
        return;
    }

    throw new Error([message, ...unexpectedChanges.map(line => `   ${line}`), '', guidance].join('\n'));
}

function updatePackageLockVersion(packageLock, newVersion) {
    if (!packageLock || typeof packageLock !== 'object') {
        throw new Error('package-lock.json is not a valid object');
    }

    if ('version' in packageLock) {
        packageLock.version = newVersion;
    }

    const rootPackage = packageLock.packages?.[''];
    if (rootPackage && typeof rootPackage === 'object') {
        rootPackage.version = newVersion;
    }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function checkGitAvailable() {
    try {
        if (os.platform() === 'win32') {
            execSync('git --version', { stdio: 'ignore', shell: true });
        } else {
            execSync('git --version', { stdio: 'ignore' });
        }
    } catch (e) {
        console.error('❌ git is not installed or not in PATH');
        console.error('   Please install git first');
        process.exit(1);
    }
}

function checkNpmAvailable() {
    try {
        if (os.platform() === 'win32') {
            execSync('npm --version', { stdio: 'ignore', shell: true });
        } else {
            execSync('npm --version', { stdio: 'ignore' });
        }
    } catch (e) {
        console.error('❌ npm is not installed or not in PATH');
        console.error('   Please install Node.js and npm first');
        process.exit(1);
    }
}

function validateManifest(manifest) {
    if (!manifest || typeof manifest !== 'object') {
        console.error('❌ manifest.json is not a valid object');
        process.exit(1);
    }

    if (!manifest.version) {
        console.error('❌ manifest.json is missing required field: version');
        process.exit(1);
    }

    if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
        console.error(`❌ Invalid version format in manifest.json: ${manifest.version}`);
        console.error('   Version must be in format: MAJOR.MINOR.PATCH (e.g., 1.2.3)');
        process.exit(1);
    }

    if (!manifest.minAppVersion || !/^\d+\.\d+\.\d+$/.test(manifest.minAppVersion)) {
        console.error('❌ manifest.json has invalid or missing minAppVersion');
        console.error('   minAppVersion must be in format: MAJOR.MINOR.PATCH (e.g., 0.15.0)');
        process.exit(1);
    }
}

function validateVersionNumbers(versionParts) {
    if (versionParts.some(isNaN) || versionParts.some(n => n < 0 || n > 9999)) {
        console.error('❌ Invalid version numbers (must be 0-9999)');
        process.exit(1);
    }
}

function checkVersionOverflow(major, minor, patch, releaseType) {
    if (releaseType === 'patch' && patch >= 9999) {
        console.error('❌ Patch version would overflow (max 9999)');
        console.error('   Consider a minor or major release instead');
        process.exit(1);
    }
    if (releaseType === 'minor' && minor >= 9999) {
        console.error('❌ Minor version would overflow (max 9999)');
        console.error('   Consider a major release instead');
        process.exit(1);
    }
    if (releaseType === 'major' && major >= 9999) {
        console.error('❌ Major version would overflow (max 9999)');
        console.error('   This project has reached maximum version!');
        process.exit(1);
    }
}

// ============================================================================
// GIT OPERATIONS
// ============================================================================

function preReleaseChecks() {
    try {
        // Check if we're in a git repository
        try {
            gitExecArray(['rev-parse', '--git-dir'], { stdio: 'pipe' });
        } catch (e) {
            console.error('❌ Not in a git repository');
            console.error('   Initialize a git repository first with: git init');
            process.exit(1);
        }

        // Check for uncommitted changes FIRST
        const status = gitExecArray(['status', '--porcelain'], { encoding: 'utf8' }).trimEnd();
        if (status) {
            console.error('❌ You have uncommitted changes:');
            console.error(
                status
                    .split('\n')
                    .map(line => '   ' + line)
                    .join('\n')
            );
            console.error('\n   Please commit or stash all changes before releasing.');
            console.error('   Run: git status');
            process.exit(1);
        }

        // Check current branch
        const currentBranch = gitExecString(['rev-parse', '--abbrev-ref', 'HEAD']);
        if (currentBranch !== 'main') {
            console.error(`❌ You must be on the 'main' branch to create a release.`);
            console.error(`   Current branch: ${currentBranch}`);
            console.error(`   Run: git checkout main`);
            process.exit(1);
        }

        // Check if remote exists
        try {
            gitExecArray(['remote', 'get-url', 'origin'], { stdio: 'pipe' });
        } catch (e) {
            console.error('❌ No remote named "origin" found');
            console.error('   Add a remote with: git remote add origin <url>');
            process.exit(1);
        }

        // Check if branch is up to date with remote
        try {
            gitExecArray(['fetch', 'origin', 'main'], { stdio: 'pipe' });
        } catch (e) {
            console.error('❌ Failed to fetch from remote:', e.message);
            process.exit(1);
        }

        const localCommit = gitExecString(['rev-parse', 'HEAD']);
        let remoteCommit;
        try {
            remoteCommit = gitExecString(['rev-parse', 'origin/main']);
        } catch (e) {
            console.error('❌ Cannot find remote branch origin/main');
            console.error('   Make sure you have pushed the main branch at least once');
            process.exit(1);
        }

        if (localCommit !== remoteCommit) {
            console.error('❌ Your local branch is not in sync with origin/main');
            console.error('   Run: git pull origin main');
            process.exit(1);
        }

        console.log('✓ Git repository is clean and ready');
        console.log('✓ On main branch and in sync with remote');
    } catch (error) {
        console.error('❌ Pre-release checks failed:', error.message);
        process.exit(1);
    }
}

function syncMainForDefaultFlow(selectedReleaseType, dryRun) {
    if (selectedReleaseType || dryRun) {
        return;
    }

    let currentBranch;
    try {
        currentBranch = gitExecString(['rev-parse', '--abbrev-ref', 'HEAD']);
    } catch (e) {
        return;
    }

    if (currentBranch !== 'main') {
        return;
    }

    try {
        fastForwardMainFromOrigin();
    } catch (error) {
        console.error('❌ Failed to update local main:', error.message);
        process.exit(1);
    }
}

function fastForwardMainFromOrigin() {
    gitExecArray(['fetch', 'origin', 'main'], { stdio: 'pipe' });

    const localCommit = gitExecString(['rev-parse', 'main']);
    const remoteCommit = gitExecString(['rev-parse', 'origin/main']);
    if (localCommit === remoteCommit) {
        return false;
    }

    const status = gitExecArray(['status', '--porcelain'], { encoding: 'utf8' }).trimEnd();
    if (status) {
        console.error('❌ Local main is behind origin/main, but the worktree has uncommitted changes.');
        console.error('   Commit or stash the changes, then run: node scripts/release.js');
        process.exit(1);
    }

    const mergeBase = gitExecString(['merge-base', 'main', 'origin/main']);
    if (mergeBase !== localCommit) {
        console.error('❌ Local main cannot be fast-forwarded from origin/main.');
        console.error('   Resolve the branch state manually, then run: node scripts/release.js');
        process.exit(1);
    }

    gitExecArray(['merge', '--ff-only', 'origin/main'], { stdio: 'inherit' });
    console.log('✓ Updated local main from origin/main');
    return true;
}

function getTagStatus(version) {
    const localTags = gitExecString(['tag', '-l', version]);
    const localTagExists = Boolean(localTags);

    try {
        gitExecArray(['fetch', '--tags'], { stdio: 'pipe' });
    } catch (e) {
        console.error('⚠️  Warning: Could not fetch tags:', e.message);
    }

    const remoteTags = gitExecString(['ls-remote', '--tags', 'origin']);
    const remoteTagExists = remoteTags.split('\n').some(line => {
        const ref = line.trim().split(/\s+/)[1];
        return ref === `refs/tags/${version}` || ref === `refs/tags/${version}^{}`;
    });

    return { localTagExists, remoteTagExists };
}

function checkExistingTag(version) {
    try {
        const { localTagExists, remoteTagExists } = getTagStatus(version);

        if (localTagExists) {
            console.error(`❌ Tag ${version} already exists locally`);
            process.exit(1);
        }

        if (remoteTagExists) {
            console.error(`❌ Tag ${version} already exists on remote`);
            console.error('   This version has already been released');
            process.exit(1);
        }

        console.log(`✓ Tag ${version} is available`);
    } catch (error) {
        console.error('❌ Failed to check existing tags:', error.message);
        process.exit(1);
    }
}

// ============================================================================
// BUILD OPERATIONS
// ============================================================================

function verifyBuild() {
    console.log('\n🔨 Running full build verification...');

    try {
        // Check if package.json exists
        const packageJsonPath = path.join(projectRoot, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            console.error('❌ No package.json found');
            console.error('   Cannot run build without package.json');
            process.exit(1);
        }

        const buildScriptPath = path.join(projectRoot, 'scripts', 'build.sh');
        if (!fs.existsSync(buildScriptPath)) {
            console.error('❌ Build script not found');
            console.error('   Expected: scripts/build.sh');
            process.exit(1);
        }

        // Check package scripts used by scripts/build.sh.
        const packageJson = parseJsonFile(packageJsonPath, 'package.json');
        const requiredScripts = ['build', 'lint:styles'];
        const missingScripts = requiredScripts.filter(scriptName => !packageJson.scripts?.[scriptName]);
        if (missingScripts.length > 0) {
            console.error('❌ Missing required package script(s):');
            missingScripts.forEach(scriptName => console.error(`   - ${scriptName}`));
            console.error('   scripts/build.sh depends on these scripts during release verification');
            process.exit(1);
        }

        // Check if npm is available
        checkNpmAvailable();

        if (isDryRun) {
            logDryRunCommand(os.platform() === 'win32' ? 'bash scripts/build.sh' : './scripts/build.sh');
            console.log('✓ Full build command is available\n');
            return;
        }

        // Run the full build gate used by CI.
        if (os.platform() === 'win32') {
            if (!commandAvailable('bash')) {
                console.error('❌ bash is required to run scripts/build.sh on Windows');
                console.error('   Install Git Bash or run release verification from a Unix-like shell');
                process.exit(1);
            }
            execFileSync('bash', [buildScriptPath], { stdio: 'inherit', cwd: projectRoot });
        } else {
            execFileSync(buildScriptPath, [], { stdio: 'inherit', cwd: projectRoot });
        }

        // Verify build output exists
        const expectedFiles = ['main.js', 'manifest.json', 'styles.css', 'languages.json'];
        const missingFiles = expectedFiles.filter(file => !fs.existsSync(path.join(projectRoot, file)));

        if (missingFiles.length > 0) {
            console.error('❌ Build failed - missing expected files:', missingFiles.join(', '));
            process.exit(1);
        }

        console.log('✓ Full build completed successfully\n');
    } catch (error) {
        console.error('❌ Full build failed:', error.message);
        console.error('   Fix build errors before releasing');
        process.exit(1);
    }
}

// ============================================================================
// PRE-FLIGHT VALIDATIONS
// ============================================================================

function validateReleaseReadiness(manifest, currentVersion) {
    console.log('🔍 Validating release readiness...\n');

    // Check package.json version matches manifest.json
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = parseJsonFile(packageJsonPath, 'package.json');
        if (packageJson.version !== currentVersion) {
            console.error('❌ Version mismatch between manifest.json and package.json');
            console.error(`   manifest.json: ${currentVersion}`);
            console.error(`   package.json:  ${packageJson.version}`);
            console.error('   Align versions before releasing');
            process.exit(1);
        }
        console.log('✓ package.json version matches manifest.json');
    }

    // Check package-lock.json version matches manifest.json
    const packageLockPath = path.join(projectRoot, 'package-lock.json');
    if (fs.existsSync(packageLockPath)) {
        const packageLock = parseJsonFile(packageLockPath, 'package-lock.json');
        const rootPackageVersion = packageLock.packages?.['']?.version;
        if (packageLock.version !== currentVersion || rootPackageVersion !== currentVersion) {
            console.error('❌ Version mismatch between manifest.json and package-lock.json');
            console.error(`   manifest.json:            ${currentVersion}`);
            console.error(`   package-lock.json:        ${packageLock.version}`);
            console.error(`   package-lock root package: ${rootPackageVersion}`);
            console.error('   Align versions before releasing');
            process.exit(1);
        }
        console.log('✓ package-lock.json version matches manifest.json');
    }

    // Check required source-controlled files exist. Build artifacts are checked after verifyBuild().
    const requiredFiles = ['manifest.json', 'styles.css'];
    const missingRequiredFiles = requiredFiles.filter(file => !fs.existsSync(path.join(projectRoot, file)));

    if (missingRequiredFiles.length > 0) {
        console.error('❌ Required files missing:');
        missingRequiredFiles.forEach(file => console.error(`   - ${file}`));
        console.error('   Run build before releasing');
        process.exit(1);
    }
    console.log('✓ All required files exist');

    // Check GitHub Actions workflow exists
    const workflowPath = path.join(projectRoot, '.github', 'workflows', 'release.yml');
    if (!fs.existsSync(workflowPath)) {
        console.error('⚠️  Warning: GitHub Actions release workflow not found');
        console.error('   Expected: .github/workflows/release.yml');
        console.error('   Releases may need to be created manually');
    } else {
        console.log('✓ GitHub Actions workflow found');
    }

    // Validate manifest has required Obsidian fields
    const requiredManifestFields = ['id', 'name', 'version', 'minAppVersion', 'description', 'author'];
    const missingFields = requiredManifestFields.filter(field => !manifest[field]);

    if (missingFields.length > 0) {
        console.error('❌ manifest.json missing required fields:');
        missingFields.forEach(field => console.error(`   - ${field}`));
        process.exit(1);
    }
    console.log('✓ manifest.json has all required fields');

    console.log('\n✓ All pre-flight checks passed\n');
}

function validateReleaseNotes(version) {
    try {
        execFileSync(process.execPath, [path.join(projectRoot, 'scripts', 'mdReleaseNotes.js'), version], {
            cwd: projectRoot,
            stdio: ['ignore', 'pipe', 'pipe']
        });
    } catch (e) {
        console.error(`❌ Could not generate release notes for version ${version}`);
        console.error(`   ${getCommandErrorMessage(e)}`);
        console.error('   Check src/releaseNotes.ts and its referenced banner file before publishing');
        process.exit(1);
    }

    console.log(`✓ Release notes found for ${version}`);
}

function waitForMainChecks(targetCommit) {
    if (isDryRun) {
        console.log('[DRY RUN] Would wait for main CI on the release commit before tagging');
        return;
    }

    console.log(`\nWaiting for main CI on ${targetCommit} before tagging...`);
    const deadline = Date.now() + mainChecksTimeoutMs;

    while (Date.now() < deadline) {
        const runs = tryRunGhJson([
            'run',
            'list',
            '--workflow',
            mainWorkflowPath,
            '--branch',
            'main',
            '--commit',
            targetCommit,
            '--event',
            'push',
            '--limit',
            '10',
            '--json',
            'databaseId,headSha,headBranch,status,conclusion,url'
        ]);
        // Only the main push workflow for this commit can authorize its release tag.
        // PR checks or a successful run for an earlier commit do not cover this build.
        const run = Array.isArray(runs) ? runs.find(run => run.headSha === targetCommit && run.headBranch === 'main') : null;
        if (run?.status === 'completed') {
            if (run.conclusion !== 'success') {
                console.error(`❌ Main CI ${run.conclusion}: ${run.url}`);
                console.error('   Resolve the CI failure, then run: node scripts/release.js');
                process.exit(1);
            }
            console.log(`✓ Main CI passed: ${run.url}`);
            return;
        }

        console.log(run ? `Waiting for main CI: ${run.url}` : 'Waiting for main CI to start...');
        sleep(releasePollIntervalMs);
    }

    console.error(`❌ Main CI did not pass within ${mainChecksTimeoutMs / 60000} minutes.`);
    console.error('   Check GitHub Actions, then run: node scripts/release.js');
    process.exit(1);
}

function getGitHubRelease(version) {
    return runGhJson(['release', 'view', version, '--json', 'tagName,url,assets,isDraft,isPrerelease,publishedAt']);
}

function hasRequiredReleaseAssets(release) {
    const assetNames = new Set((release.assets || []).map(asset => asset.name));
    return releaseAssetNames.every(assetName => assetNames.has(assetName));
}

function getUnsupportedReleaseAssetNames(release) {
    const supportedAssetNames = new Set(releaseAssetNames);
    return (release.assets || []).map(asset => asset.name).filter(assetName => !supportedAssetNames.has(assetName));
}

function validateSupportedReleaseAssets(release, version) {
    const unsupportedAssetNames = getUnsupportedReleaseAssetNames(release);
    if (unsupportedAssetNames.length === 0) {
        return;
    }

    console.error(`❌ GitHub release ${version} has unsupported assets.`);
    console.error(`   Supported assets: ${releaseAssetNames.join(', ')}`);
    unsupportedAssetNames.forEach(assetName => console.error(`   - ${assetName}`));
    process.exit(1);
}

function isReleaseNotFoundError(error) {
    return error.message.toLowerCase().includes('release not found');
}

function waitForGitHubRelease(version) {
    const deadline = Date.now() + releaseVerificationTimeoutMs;

    while (Date.now() < deadline) {
        try {
            const release = getGitHubRelease(version);
            if (hasRequiredReleaseAssets(release)) {
                validateSupportedReleaseAssets(release, version);
                return release;
            }
        } catch (error) {
            if (!isReleaseNotFoundError(error)) {
                console.error(`❌ Could not read GitHub release ${version}.`);
                console.error(`   ${error.message}`);
                console.error('   Verify the release and workflow manually.');
                process.exit(1);
            }
        }

        console.log(`Waiting for GitHub release ${version} assets...`);
        sleep(releasePollIntervalMs);
    }

    console.error(`❌ Timed out waiting for GitHub release ${version} assets.`);
    console.error(`   Required assets: ${releaseAssetNames.join(', ')}`);
    process.exit(1);
}

function downloadReleaseAssets(version, assetNames, downloadDir) {
    const args = ['release', 'download', version, '--dir', downloadDir, '--clobber'];
    assetNames.forEach(assetName => {
        args.push('--pattern', assetName);
    });
    runGh(args);
}

function getAttestationVerificationErrors(assets, repositoryName, signerWorkflow, sourceRef) {
    const verificationErrors = [];

    assets.forEach(asset => {
        try {
            runGh([
                'attestation',
                'verify',
                asset.path,
                '--repo',
                repositoryName,
                '--signer-workflow',
                signerWorkflow,
                '--source-ref',
                sourceRef
            ]);
        } catch (error) {
            verificationErrors.push(`${asset.name}: ${error.message}`);
        }
    });

    return verificationErrors;
}

function waitForReleaseAssetAttestations(version) {
    const repositoryName = getRepositoryNameWithOwner();
    const signerWorkflow = `${repositoryName}/${releaseWorkflowPath}`;
    const sourceRef = `refs/tags/${version}`;
    const downloadDir = fs.mkdtempSync(path.join(os.tmpdir(), `notebook-navigator-release-${version}-`));
    const deadline = Date.now() + releaseVerificationTimeoutMs;
    let verificationErrors = [];

    try {
        downloadReleaseAssets(version, attestedReleaseAssetNames, downloadDir);
    } catch (error) {
        fs.rmSync(downloadDir, { recursive: true, force: true });
        console.error(`❌ Could not download release assets for ${version}.`);
        console.error(`   ${error.message}`);
        process.exit(1);
    }

    const assets = attestedReleaseAssetNames.map(assetName => ({
        name: assetName,
        path: path.join(downloadDir, assetName)
    }));

    try {
        while (Date.now() < deadline) {
            verificationErrors = getAttestationVerificationErrors(assets, repositoryName, signerWorkflow, sourceRef);
            if (verificationErrors.length === 0) {
                return attestedReleaseAssetNames;
            }

            console.log(`Waiting for GitHub artifact attestations for ${version}...`);
            sleep(releasePollIntervalMs);
        }

        console.error(`❌ Timed out waiting for GitHub artifact attestations for ${version}.`);
        console.error(`   Expected assets: ${attestedReleaseAssetNames.join(', ')}`);
        verificationErrors.forEach(message => console.error(`   - ${message}`));
        process.exit(1);
    } finally {
        fs.rmSync(downloadDir, { recursive: true, force: true });
    }
}

function findReleaseWorkflowRun(version, targetCommit) {
    const runs = tryRunGhJson([
        'run',
        'list',
        '--workflow',
        'Release Obsidian plugin',
        '--limit',
        '30',
        '--json',
        'databaseId,status,conclusion,url,headBranch,headSha,createdAt,displayTitle'
    ]);

    if (!Array.isArray(runs)) {
        return null;
    }

    return runs.find(run => run.headBranch === version && run.headSha === targetCommit) || runs.find(run => run.headBranch === version);
}

function getWorkflowRun(runId) {
    return runGhJson(['run', 'view', String(runId), '--json', 'databaseId,status,conclusion,url,jobs']);
}

function waitForReleaseWorkflow(version) {
    const targetCommit = gitExecString(['rev-list', '-n', '1', version]);
    const deadline = Date.now() + releaseVerificationTimeoutMs;
    let run = null;

    while (Date.now() < deadline) {
        const listedRun = findReleaseWorkflowRun(version, targetCommit);
        if (!listedRun) {
            console.log(`Waiting for release workflow run for ${version}...`);
            sleep(releasePollIntervalMs);
            continue;
        }

        try {
            run = getWorkflowRun(listedRun.databaseId);
        } catch (error) {
            console.log(`⚠️  Could not read release workflow status: ${error.message}`);
            sleep(releasePollIntervalMs);
            continue;
        }

        if (run.status === 'completed') {
            return run;
        }

        console.log(`Waiting for release workflow to complete: ${run.url}`);
        sleep(releasePollIntervalMs);
    }

    console.error(`❌ Release workflow did not complete within ${releaseVerificationTimeoutMs / 60000} minutes.`);
    if (run?.url) {
        console.error(`   Check status: ${run.url}`);
    }
    process.exit(1);
}

function verifyReleaseWorkflowResult(run) {
    if (!run) {
        console.error('❌ Could not verify release workflow result.');
        process.exit(1);
    }

    if (run.conclusion === 'success') {
        console.log(`✓ Release workflow completed successfully: ${run.url}`);
        return;
    }

    const jobs = Array.isArray(run.jobs) ? run.jobs : [];
    const failedJobs = jobs.filter(job => job.conclusion && !['success', 'skipped'].includes(job.conclusion));

    console.error('❌ Release workflow failed.');
    console.error(`   Workflow: ${run.url}`);
    failedJobs.forEach(job => console.error(`   - ${job.name}: ${job.conclusion}`));
    process.exit(1);
}

function verifyPublishedRelease(version) {
    console.log('\n🔎 Verifying published release...');

    const { remoteTagExists } = getTagStatus(version);
    if (!remoteTagExists) {
        console.error(`❌ Remote tag ${version} was not found after push.`);
        process.exit(1);
    }
    console.log(`✓ Remote tag ${version} exists`);

    if (!canUseGitHubCliForVerification()) {
        return;
    }

    const release = waitForGitHubRelease(version);
    console.log(`✓ GitHub release has required assets: ${release.url}`);

    const workflowRun = waitForReleaseWorkflow(version);
    verifyReleaseWorkflowResult(workflowRun);
    validateSupportedReleaseAssets(getGitHubRelease(version), version);

    const attestedAssets = waitForReleaseAssetAttestations(version);
    console.log(`✓ GitHub release assets have artifact attestations: ${attestedAssets.join(', ')}`);
}

// ============================================================================
// RELEASE OPERATIONS
// ============================================================================

function prepareRelease(releaseType, manifest, currentVersion, newVersion) {
    validateReleaseReadiness(manifest, currentVersion);
    validateReleaseNotes(newVersion);
    checkVersionOverflow(...currentVersion.split('.').map(Number), releaseType);
    preReleaseChecks();
    if (!isDryRun) {
        requireGitHubCliForRelease();
    }
    checkExistingTag(newVersion);

    console.log(`\nPreparing release ${newVersion} on main`);
    console.log(`Bumping version from ${currentVersion} to ${newVersion}\n`);
    needsCleanup = true;

    try {
        const filesToUpdate = ['manifest.json', 'package.json', 'package-lock.json', 'versions.json'].filter(
            file => file === 'versions.json' || fs.existsSync(path.join(projectRoot, file))
        );
        // Parse every metadata file before writing so invalid JSON cannot leave a partial version bump.
        const updatedFiles = filesToUpdate.map(file => {
            const filePath = path.join(projectRoot, file);
            const data = fs.existsSync(filePath) ? parseJsonFile(filePath, file) : {};
            if (file === 'versions.json') {
                data[newVersion] = manifest.minAppVersion;
            } else if (file === 'package-lock.json') {
                updatePackageLockVersion(data, newVersion);
            } else {
                data.version = newVersion;
            }
            return { filePath, data };
        });
        updatedFiles.forEach(({ filePath, data }) => {
            writeJsonFile(filePath, data);
            console.log(`✓ Updated ${path.basename(filePath)}`);
        });

        verifyBuild();
        assertOnlyExpectedChanges(filesToUpdate);
        gitExecArray(['add', ...filesToUpdate], { stdio: 'inherit' });
        gitExecArray(['commit', '-m', `Bump version to ${newVersion}`], { stdio: 'inherit' });
        console.log('✓ Committed version changes');
    } catch (error) {
        console.error(`\n❌ Release preparation failed: ${error.message}`);
        console.error('   Changes were retained. Check git status before retrying.');
        process.exit(1);
    }

    const targetCommit = isDryRun ? '<release-commit>' : gitExecString(['rev-parse', 'HEAD']);
    try {
        gitExecArray(['push', 'origin', 'main'], { stdio: 'inherit' });
        console.log('✓ Pushed version changes to main');
    } catch (error) {
        // A failed response can follow an accepted push, so never reset a potentially published main commit.
        console.error(`\n❌ Could not push main: ${error.message}`);
        console.error('   The version commit was retained. Resolve the push failure, then run:');
        console.error('   git push origin main');
        console.error('   node scripts/release.js');
        process.exit(1);
    }

    needsCleanup = false;
    publishTag(newVersion, targetCommit);
}

function publishRelease(manifest, currentVersion) {
    validateReleaseReadiness(manifest, currentVersion);
    validateReleaseNotes(currentVersion);
    preReleaseChecks();
    if (!isDryRun) {
        requireGitHubCliForRelease();
    }
    checkExistingTag(currentVersion);
    const targetCommit = gitExecString(['rev-parse', 'HEAD']);
    verifyBuild();
    assertOnlyExpectedChanges([], {
        message: 'Build verification left unexpected worktree changes:',
        guidance: 'Commit generated changes before publishing the release.'
    });
    publishTag(currentVersion, targetCommit);
}

function publishTag(version, targetCommit) {
    waitForMainChecks(targetCommit);

    if (!isDryRun) {
        // CI can take minutes. Recheck the worktree and both main refs before tagging the verified commit.
        preReleaseChecks();
        if (gitExecString(['rev-parse', 'HEAD']) !== targetCommit) {
            console.error('❌ Main changed while preparing the release.');
            console.error('   Run node scripts/release.js again to verify the current commit.');
            process.exit(1);
        }
    }

    try {
        gitExecArray(['tag', '-a', version, targetCommit, '-m', `Release ${version}`], { stdio: 'inherit' });
        console.log(`✓ Created tag ${version}`);

        gitExecArray(['push', 'origin', `refs/tags/${version}`], { stdio: 'inherit' });
        console.log(`✓ Pushed tag ${version}`);

        if (isDryRun) {
            console.log(`\n🔍 DRY RUN COMPLETE - Version ${version} would be published`);
        } else {
            console.log('\nGitHub Actions will now build and publish the GitHub release.');
            verifyPublishedRelease(version);
            console.log(`\n🎉 Successfully published version ${version}`);
        }
    } catch (error) {
        console.error('\n❌ Publish failed:', error.message);
        console.error('   Check local tags and GitHub Actions before retrying.');
        process.exit(1);
    }
}

// ============================================================================
// USER INTERFACE
// ============================================================================

function showInteractivePrompt(currentVersion, versions) {
    console.log(`\nCurrent version: ${currentVersion}\n`);
    console.log('Select release type:');
    console.log(`  1) Patch (${currentVersion} → ${versions.patch}) [default]`);
    console.log(`  2) Minor (${currentVersion} → ${versions.minor})`);
    console.log(`  3) Major (${currentVersion} → ${versions.major})`);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(`\nEnter choice [1]: `, answer => {
        rl.close();

        // Use default if no answer provided
        const choice = answer.trim() || '1';

        let releaseType;
        switch (choice) {
            case '1':
                releaseType = 'patch';
                break;
            case '2':
                releaseType = 'minor';
                break;
            case '3':
                releaseType = 'major';
                break;
            default:
                console.error('❌ Invalid choice');
                process.exit(1);
        }

        prepareRelease(releaseType, manifest, currentVersion, versions[releaseType]);
    });
}

// ============================================================================
// LOCK FILE MANAGEMENT
// ============================================================================

function acquireLock() {
    if (isDryRun) return;

    try {
        while (true) {
            try {
                const fd = fs.openSync(lockFilePath, 'wx');
                try {
                    fs.writeFileSync(fd, process.pid.toString());
                } finally {
                    fs.closeSync(fd);
                }
                return;
            } catch (error) {
                if (error.code !== 'EEXIST') {
                    throw error;
                }
            }

            const pid = fs.readFileSync(lockFilePath, 'utf8').trim();

            // Check if process is still running
            try {
                // This will throw if process doesn't exist
                // Note: On Windows, this might not work reliably for other users' processes
                process.kill(parseInt(pid), 0);
                console.error('❌ Another release process is already running (PID: ' + pid + ')');
                console.error('   If this is incorrect, delete ' + path.relative(process.cwd(), lockFilePath));
                process.exit(1);
            } catch (e) {
                // Process not running, remove stale lock
                console.log('⚠️  Removing stale lock file');
                fs.unlinkSync(lockFilePath);
            }
        }
    } catch (error) {
        console.error('❌ Failed to acquire lock:', error.message);
        process.exit(1);
    }
}

function releaseLock() {
    if (isDryRun) return;

    try {
        if (fs.existsSync(lockFilePath)) {
            const pid = fs.readFileSync(lockFilePath, 'utf8').trim();
            if (pid === process.pid.toString()) {
                fs.unlinkSync(lockFilePath);
            }
        }
    } catch (error) {
        console.error('⚠️  Failed to release lock:', error.message);
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

// Setup cleanup handler
process.on('SIGINT', () => {
    if (needsCleanup) {
        console.log('\n\n⚠️  Release interrupted!');
        console.log('   Check git status before retrying.');
    }
    releaseLock();
    process.exit(1);
});

process.on('exit', () => {
    releaseLock();
});

// Check prerequisites
checkGitAvailable();

// Parse command line arguments
const args = process.argv.slice(2);
let releaseTypeArg = null;

// Check for --dry-run flag
if (args.includes('--dry-run')) {
    isDryRun = true;
    console.log('🔍 Running in DRY RUN mode - no changes will be made\n');
    // Remove --dry-run from args
    const dryRunIndex = args.indexOf('--dry-run');
    args.splice(dryRunIndex, 1);
}

// Get release type from remaining args
if (args.length > 0) {
    releaseTypeArg = args[0];
}

const hasValidArg = releaseTypeArg && validReleaseTypes.includes(releaseTypeArg);

// Acquire lock before any operations (but never in --dry-run mode)
if (!isDryRun) {
    acquireLock();
}

syncMainForDefaultFlow(releaseTypeArg, isDryRun);

// Read and validate manifest
const manifestPath = path.join(projectRoot, 'manifest.json');
let manifest, currentVersion;

try {
    manifest = parseJsonFile(manifestPath, 'manifest.json');
    currentVersion = manifest.version;
} catch (error) {
    console.error('❌ Failed to read manifest.json');
    console.error(`   ${error.message}`);
    console.error('   Make sure you are running this script from the project directory');
    process.exit(1);
}

validateManifest(manifest);

// Parse and validate version numbers
const versionParts = currentVersion.split('.').map(Number);
validateVersionNumbers(versionParts);

const [major, minor, patch] = versionParts;

// Calculate new versions
const versions = {
    patch: `${major}.${minor}.${patch + 1}`,
    minor: `${major}.${minor + 1}.0`,
    major: `${major + 1}.0.0`
};

// Execute release
if (hasValidArg) {
    // Direct release preparation mode
    prepareRelease(releaseTypeArg, manifest, currentVersion, versions[releaseTypeArg]);
} else if (releaseTypeArg) {
    console.error(`❌ Invalid release type: ${releaseTypeArg}`);
    console.error('   Use one of: patch, minor, major');
    console.error('\n   Usage: node release.js [patch|minor|major] [--dry-run]');
    process.exit(1);
} else {
    let tagStatus;
    try {
        tagStatus = getTagStatus(currentVersion);
    } catch (error) {
        console.error('❌ Failed to check whether the current version is already published:', error.message);
        process.exit(1);
    }

    const { localTagExists, remoteTagExists } = tagStatus;

    if (!localTagExists && !remoteTagExists) {
        console.log(`\nCurrent version ${currentVersion} is not tagged. Publishing release from main.`);
        publishRelease(manifest, currentVersion);
    } else if (localTagExists && !remoteTagExists) {
        console.error(`❌ Tag ${currentVersion} exists locally but has not been pushed.`);
        console.error('   Check the tag and GitHub Actions before retrying the tag push.');
        process.exit(1);
    } else {
        showInteractivePrompt(currentVersion, versions);
    }
}
