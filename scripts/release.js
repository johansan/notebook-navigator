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
 * - Incrementing version numbers in manifest.json, package.json, and versions.json
 * - Creating a release branch and pull request with the version bump
 * - Waiting for release pull request checks, merging the pull request, then publishing by creating and pushing a git tag
 * - Verifying the GitHub release assets and release workflow result
 *
 * Usage:
 *   node release.js                    # Publish an untagged merged version, or choose the next release
 *   node release.js patch              # Prepare a patch release PR
 *   node release.js minor              # Prepare a minor release PR
 *   node release.js major              # Prepare a major release PR
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
 * Release version changes must go through a pull request before publishing.
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
const releaseAssetNames = ['main.js', 'manifest.json', 'styles.css'];
const signedReleaseAssetSuffixes = ['.minisig', '.asc', '.sig', '.sign', '.sigstore', '.sigstore.json', '.intoto.jsonl'];
const pullRequestPollIntervalMs = 30 * 1000;
const pullRequestChecksTimeoutMs = 30 * 60 * 1000;
const releasePollIntervalMs = 15 * 1000;
const releaseVerificationTimeoutMs = 15 * 60 * 1000;
const releaseAutomationAllowedDirtyFiles = ['scripts/release.js'];
const successfulPullRequestCheckConclusions = new Set(['SUCCESS', 'SKIPPED', 'NEUTRAL']);
const failedPullRequestCheckConclusions = new Set(['FAILURE', 'CANCELLED', 'TIMED_OUT', 'ACTION_REQUIRED', 'STALE']);
const successfulPullRequestStatusStates = new Set(['SUCCESS']);
const failedPullRequestStatusStates = new Set(['FAILURE', 'ERROR']);
const pullRequestInfoFields = [
    'number',
    'url',
    'state',
    'mergedAt',
    'mergeCommit',
    'headRefName',
    'headRefOid',
    'baseRefName',
    'isDraft',
    'mergeStateStatus',
    'mergeable',
    'reviewDecision',
    'statusCheckRollup'
].join(',');

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
    if (['add', 'commit', 'push', 'checkout'].includes(command)) {
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
    return execFileSync('git', args, { cwd: projectRoot, ...options });
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

function compareVersions(leftVersion, rightVersion) {
    const leftParts = leftVersion.split('.').map(Number);
    const rightParts = rightVersion.split('.').map(Number);

    for (let index = 0; index < 3; index++) {
        const leftPart = leftParts[index] || 0;
        const rightPart = rightParts[index] || 0;
        if (leftPart !== rightPart) {
            return leftPart - rightPart;
        }
    }

    return 0;
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
        runGhJson(['repo', 'view', '--json', 'nameWithOwner']);
    } catch (error) {
        console.log('⚠️  GitHub CLI could not read this repository.');
        console.log(`   ${error.message}`);
        console.log('   Verify the release and workflow manually.');
        return false;
    }

    return true;
}

function requireGitHubCliForReleaseAutomation() {
    if (!commandAvailable('gh')) {
        console.error('❌ GitHub CLI is required for autonomous release pull requests.');
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
        runGhJson(['repo', 'view', '--json', 'nameWithOwner']);
    } catch (error) {
        console.error('❌ GitHub CLI could not read this repository.');
        console.error(`   ${error.message}`);
        process.exit(1);
    }

    console.log('✓ GitHub CLI can manage release pull requests');
}

function getGitStatusPath(statusLine) {
    const pathPart = statusLine.slice(3);
    const changedPath = pathPart.includes(' -> ') ? pathPart.split(' -> ').pop() : pathPart;
    return changedPath.replace(/\\/g, '/');
}

function getUnexpectedStatusLines(status, allowedDirtyFiles = []) {
    if (!status) {
        return [];
    }

    const allowedFileSet = new Set(allowedDirtyFiles.map(file => file.replace(/\\/g, '/')));
    return status.split('\n').filter(line => !allowedFileSet.has(getGitStatusPath(line)));
}

function assertOnlyExpectedChanges(expectedFiles) {
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

    throw new Error(
        [
            'Build changed files outside the release metadata:',
            ...unexpectedChanges.map(line => `   ${line}`),
            '',
            'Commit or fix these generated changes before preparing the release.'
        ].join('\n')
    );
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

function preReleaseChecks(options = {}) {
    const { allowedDirtyFiles = [] } = options;

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
        const unexpectedStatusLines = getUnexpectedStatusLines(status, allowedDirtyFiles);
        if (unexpectedStatusLines.length > 0) {
            console.error('❌ You have uncommitted changes:');
            console.error(unexpectedStatusLines.map(line => '   ' + line).join('\n'));
            console.error('\n   Please commit or stash all changes before releasing.');
            console.error('   Run: git status');
            process.exit(1);
        }
        if (status) {
            console.log(`✓ Worktree changes are limited to ${allowedDirtyFiles.join(', ')}`);
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
            if (isDryRun) {
                logDryRunCommand('git fetch');
            } else {
                gitExecArray(['fetch'], { stdio: 'pipe' });
            }
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
        fastForwardMainFromOrigin({
            dirtyMessage: '❌ Local main is behind origin/main, but the worktree has uncommitted changes.',
            dirtyGuidance: '   Commit or stash the changes, then run: node scripts/release.js'
        });
    } catch (error) {
        console.error('❌ Failed to update local main:', error.message);
        process.exit(1);
    }
}

function requireCleanWorktree(message, guidance, options = {}) {
    const { allowedDirtyFiles = [] } = options;
    const status = gitExecArray(['status', '--porcelain'], { encoding: 'utf8' }).trimEnd();
    const unexpectedStatusLines = getUnexpectedStatusLines(status, allowedDirtyFiles);
    if (unexpectedStatusLines.length === 0) {
        return;
    }

    console.error(message);
    console.error(unexpectedStatusLines.map(line => '   ' + line).join('\n'));
    if (guidance) {
        console.error(guidance);
    }
    process.exit(1);
}

function fastForwardMainFromOrigin(options = {}) {
    const {
        dirtyMessage = '❌ Local main is behind origin/main, but the worktree has uncommitted changes.',
        dirtyGuidance = '   Commit or stash the changes, then run: node scripts/release.js',
        allowedDirtyFiles = []
    } = options;

    gitExecArray(['fetch', 'origin', 'main'], { stdio: 'pipe' });

    const localCommit = gitExecString(['rev-parse', 'main']);
    const remoteCommit = gitExecString(['rev-parse', 'origin/main']);
    if (localCommit === remoteCommit) {
        return false;
    }

    requireCleanWorktree(dirtyMessage, dirtyGuidance, { allowedDirtyFiles });

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
        if (isDryRun) {
            logDryRunCommand('git fetch --tags');
        } else {
            gitExecArray(['fetch', '--tags'], { stdio: 'pipe' });
        }
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

function checkReleaseBranchAvailable(version) {
    const branchName = `release/${version}`;

    try {
        gitExecArray(['rev-parse', '--verify', branchName], { stdio: 'pipe' });
        console.error(`❌ Local branch ${branchName} already exists`);
        console.error(`   Delete it or choose a different version before retrying.`);
        process.exit(1);
    } catch (e) {
        // Missing local branch is expected.
    }

    try {
        const remoteBranch = gitExecString(['ls-remote', '--heads', 'origin', branchName]);
        if (remoteBranch) {
            console.error(`❌ Remote branch ${branchName} already exists`);
            console.error(`   Close or remove the existing release branch before retrying.`);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Failed to check existing release branches:', error.message);
        process.exit(1);
    }

    console.log(`✓ Release branch ${branchName} is available`);
    return branchName;
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

        // Check if package build script exists because scripts/build.sh calls it
        const packageJson = parseJsonFile(packageJsonPath, 'package.json');
        if (!packageJson.scripts || !packageJson.scripts.build) {
            console.error('❌ No build script found in package.json');
            console.error('   Add a "build" script to package.json');
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
        const expectedFiles = ['main.js', 'manifest.json', 'styles.css'];
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
            stdio: 'ignore'
        });
    } catch (e) {
        console.error(`❌ Release notes missing for version ${version}`);
        console.error('   Add an entry to src/releaseNotes.ts before publishing');
        process.exit(1);
    }

    console.log(`✓ Release notes found for ${version}`);
}

function getPullRequestInfo(selector) {
    return runGhJson(['pr', 'view', String(selector), '--json', pullRequestInfoFields]);
}

function tryGetPullRequestInfo(selector) {
    return tryRunGhJson(['pr', 'view', String(selector), '--json', pullRequestInfoFields]);
}

function parseReleaseVersionFromBranch(branchName) {
    const match = /^release\/(\d+\.\d+\.\d+)$/.exec(branchName || '');
    return match ? match[1] : null;
}

function getPullRequestCheckName(check) {
    return check.name || check.context || check.workflowName || 'Unnamed check';
}

function normalizePullRequestCheckValue(value) {
    return value ? String(value).toUpperCase() : '';
}

function getPullRequestCheckResult(check) {
    const state = normalizePullRequestCheckValue(check.state);
    if (state) {
        if (successfulPullRequestStatusStates.has(state)) {
            return { result: 'successful', detail: state };
        }
        if (failedPullRequestStatusStates.has(state)) {
            return { result: 'failed', detail: state };
        }
        return { result: 'pending', detail: state };
    }

    const status = normalizePullRequestCheckValue(check.status);
    const conclusion = normalizePullRequestCheckValue(check.conclusion);
    if (status === 'COMPLETED' || conclusion) {
        if (successfulPullRequestCheckConclusions.has(conclusion)) {
            return { result: 'successful', detail: conclusion };
        }
        if (failedPullRequestCheckConclusions.has(conclusion) || status === 'COMPLETED') {
            return { result: 'failed', detail: conclusion || status };
        }
    }

    return { result: 'pending', detail: status || 'PENDING' };
}

function summarizePullRequestChecks(checks) {
    const summary = {
        total: checks.length,
        successful: [],
        pending: [],
        failed: []
    };

    checks.forEach(check => {
        const checkResult = getPullRequestCheckResult(check);
        const describedCheck = {
            name: getPullRequestCheckName(check),
            detail: checkResult.detail
        };
        summary[checkResult.result].push(describedCheck);
    });

    return summary;
}

function logPendingPullRequestChecks(prInfo, summary) {
    if (summary.total === 0) {
        console.log(`Waiting for pull request #${prInfo.number} checks to start...`);
        return;
    }

    console.log(`Waiting for pull request #${prInfo.number} checks (${summary.successful.length}/${summary.total} passed)...`);
    summary.pending.slice(0, 5).forEach(check => {
        console.log(`   - ${check.name}: ${check.detail}`);
    });
    if (summary.pending.length > 5) {
        console.log(`   - ${summary.pending.length - 5} more pending checks`);
    }
}

function failForClosedPullRequest(prInfo) {
    if (prInfo.state === 'CLOSED') {
        console.error(`❌ Pull request #${prInfo.number} was closed without merging.`);
        console.error('   Run the release script again after preparing a new release pull request.');
        process.exit(1);
    }
}

function failForUnmergeablePullRequest(prInfo) {
    if (prInfo.isDraft) {
        console.error(`❌ Pull request #${prInfo.number} is a draft and cannot be merged automatically.`);
        process.exit(1);
    }

    if (prInfo.reviewDecision === 'REVIEW_REQUIRED') {
        console.error(`❌ Pull request #${prInfo.number} requires review before it can be merged.`);
        process.exit(1);
    }

    if (prInfo.reviewDecision === 'CHANGES_REQUESTED') {
        console.error(`❌ Pull request #${prInfo.number} has requested changes.`);
        process.exit(1);
    }

    if (prInfo.mergeStateStatus === 'DIRTY') {
        console.error(`❌ Pull request #${prInfo.number} has merge conflicts.`);
        process.exit(1);
    }
}

function waitForPullRequestChecks(prInfo) {
    console.log('\nRelease pull request is ready:');
    console.log(`   ${prInfo.url}`);
    console.log('\nWaiting for CI to pass before merging automatically.\n');

    const deadline = Date.now() + pullRequestChecksTimeoutMs;

    while (Date.now() < deadline) {
        let latestPrInfo;
        try {
            latestPrInfo = getPullRequestInfo(prInfo.number);
        } catch (error) {
            console.log(`⚠️  Could not read pull request status: ${error.message}`);
            sleep(pullRequestPollIntervalMs);
            continue;
        }

        if (latestPrInfo.mergedAt || latestPrInfo.state === 'MERGED') {
            console.log(`✓ Pull request #${latestPrInfo.number} merged`);
            return latestPrInfo;
        }

        failForClosedPullRequest(latestPrInfo);
        failForUnmergeablePullRequest(latestPrInfo);

        const checks = Array.isArray(latestPrInfo.statusCheckRollup) ? latestPrInfo.statusCheckRollup : [];
        const summary = summarizePullRequestChecks(checks);

        if (summary.failed.length > 0) {
            console.error(`❌ Pull request #${latestPrInfo.number} checks failed:`);
            summary.failed.forEach(check => console.error(`   - ${check.name}: ${check.detail}`));
            process.exit(1);
        }

        if (summary.total > 0 && summary.pending.length === 0) {
            console.log(`✓ Pull request #${latestPrInfo.number} checks passed`);
            return latestPrInfo;
        }

        logPendingPullRequestChecks(latestPrInfo, summary);
        sleep(pullRequestPollIntervalMs);
    }

    console.error(`❌ Pull request checks did not complete within ${pullRequestChecksTimeoutMs / 60000} minutes.`);
    console.error(`   Check status: ${prInfo.url}`);
    process.exit(1);
}

function waitForPullRequestMerge(prInfo) {
    console.log(`Waiting for pull request #${prInfo.number} to merge...`);

    while (true) {
        let latestPrInfo;
        try {
            latestPrInfo = getPullRequestInfo(prInfo.number);
        } catch (error) {
            console.log(`⚠️  Could not read pull request status: ${error.message}`);
            sleep(pullRequestPollIntervalMs);
            continue;
        }

        if (latestPrInfo.mergedAt || latestPrInfo.state === 'MERGED') {
            console.log(`✓ Pull request #${latestPrInfo.number} merged`);
            return latestPrInfo;
        }

        failForClosedPullRequest(latestPrInfo);

        console.log(`Waiting for pull request #${latestPrInfo.number} to merge...`);
        sleep(pullRequestPollIntervalMs);
    }
}

function mergePullRequest(prInfo) {
    const latestPrInfo = getPullRequestInfo(prInfo.number);
    if (latestPrInfo.mergedAt || latestPrInfo.state === 'MERGED') {
        console.log(`✓ Pull request #${latestPrInfo.number} merged`);
        return latestPrInfo;
    }

    failForClosedPullRequest(latestPrInfo);
    failForUnmergeablePullRequest(latestPrInfo);

    console.log(`\nMerging pull request #${latestPrInfo.number}...`);
    const args = ['pr', 'merge', String(latestPrInfo.number), '--merge', '--delete-branch'];
    if (latestPrInfo.headRefOid) {
        args.push('--match-head-commit', latestPrInfo.headRefOid);
    }

    try {
        const output = runGh(args);
        if (output) {
            console.log(output);
        }
    } catch (error) {
        console.error(`❌ Could not merge pull request #${latestPrInfo.number}.`);
        console.error(`   ${error.message}`);
        process.exit(1);
    }

    return waitForPullRequestMerge(latestPrInfo);
}

function completeReleasePullRequest(prInfo) {
    const checkedPrInfo = waitForPullRequestChecks(prInfo);
    if (checkedPrInfo.mergedAt || checkedPrInfo.state === 'MERGED') {
        return checkedPrInfo;
    }

    return mergePullRequest(checkedPrInfo);
}

function findOpenReleasePullRequest(currentVersion) {
    if (!commandAvailable('gh')) {
        return null;
    }

    const pullRequests = tryRunGhJson([
        'pr',
        'list',
        '--state',
        'open',
        '--base',
        'main',
        '--limit',
        '50',
        '--json',
        'number,url,title,headRefName,baseRefName,createdAt'
    ]);

    if (!Array.isArray(pullRequests)) {
        return null;
    }

    const releasePullRequests = pullRequests
        .map(prInfo => ({
            ...prInfo,
            releaseVersion: parseReleaseVersionFromBranch(prInfo.headRefName)
        }))
        .filter(prInfo => prInfo.releaseVersion && compareVersions(prInfo.releaseVersion, currentVersion) > 0);

    if (releasePullRequests.length === 0) {
        return null;
    }

    if (releasePullRequests.length > 1) {
        console.error('❌ Multiple open release pull requests found:');
        releasePullRequests.forEach(prInfo => {
            console.error(`   - #${prInfo.number}: ${prInfo.url}`);
        });
        console.error('   Close the stale release pull requests, then run: node scripts/release.js');
        process.exit(1);
    }

    return releasePullRequests[0];
}

function syncMergedReleaseToMain(expectedVersion, options = {}) {
    const { allowedDirtyFiles = [] } = options;

    try {
        requireCleanWorktree(
            '❌ Worktree has uncommitted changes before syncing merged release:',
            '   Commit or stash the changes, then run: node scripts/release.js',
            { allowedDirtyFiles }
        );

        const currentBranch = gitExecString(['rev-parse', '--abbrev-ref', 'HEAD']);
        if (currentBranch !== 'main') {
            gitExecArray(['checkout', 'main'], { stdio: 'inherit' });
        }

        fastForwardMainFromOrigin({ allowedDirtyFiles });

        const mergedManifest = parseJsonFile(path.join(projectRoot, 'manifest.json'), 'manifest.json');
        validateManifest(mergedManifest);

        if (mergedManifest.version !== expectedVersion) {
            console.error('❌ Merged main does not contain the expected release version.');
            console.error(`   Expected: ${expectedVersion}`);
            console.error(`   Found:    ${mergedManifest.version}`);
            process.exit(1);
        }

        console.log(`✓ main contains merged version ${expectedVersion}`);
        return mergedManifest;
    } catch (error) {
        console.error('❌ Failed to sync merged release:', error.message);
        process.exit(1);
    }
}

function getGitHubRelease(version) {
    return runGhJson(['release', 'view', version, '--json', 'tagName,url,assets,isDraft,isPrerelease,publishedAt']);
}

function hasRequiredReleaseAssets(release) {
    const assetNames = new Set((release.assets || []).map(asset => asset.name));
    return releaseAssetNames.every(assetName => assetNames.has(assetName));
}

function isSignedReleaseAssetName(assetName) {
    if (!assetName) {
        return false;
    }

    const normalizedName = assetName.toLowerCase();
    return signedReleaseAssetSuffixes.some(suffix => normalizedName.endsWith(suffix));
}

function hasSignedReleaseAsset(release) {
    return (release.assets || []).some(asset => isSignedReleaseAssetName(asset.name));
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

function waitForSignedReleaseAsset(version) {
    const deadline = Date.now() + releaseVerificationTimeoutMs;

    while (Date.now() < deadline) {
        try {
            const release = getGitHubRelease(version);
            if (hasSignedReleaseAsset(release)) {
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

        console.log(`Waiting for signed release asset for ${version}...`);
        sleep(releasePollIntervalMs);
    }

    console.error(`❌ Timed out waiting for signed release asset for ${version}.`);
    console.error(`   Expected one of: ${signedReleaseAssetSuffixes.join(', ')}`);
    process.exit(1);
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

    const signedRelease = waitForSignedReleaseAsset(version);
    const signedAsset = signedRelease.assets.find(asset => isSignedReleaseAssetName(asset.name));
    console.log(`✓ GitHub release has signed asset: ${signedAsset.name}`);
}

// ============================================================================
// RELEASE OPERATIONS
// ============================================================================

function prepareRelease(releaseType, manifest, currentVersion, newVersion) {
    // Run all validations first
    validateReleaseReadiness(manifest, currentVersion);
    validateReleaseNotes(newVersion);
    checkVersionOverflow(...currentVersion.split('.').map(Number), releaseType);
    preReleaseChecks();
    if (!isDryRun) {
        requireGitHubCliForReleaseAutomation();
    }
    checkExistingTag(newVersion);
    const releaseBranch = checkReleaseBranchAvailable(newVersion);

    // Create backups of files we're about to modify
    const filesToBackup = ['manifest.json', 'package.json', 'package-lock.json', 'versions.json'];
    const backups = {};
    let currentCommit = null;
    let releaseBranchCreated = false;

    try {
        // Get current commit for potential rollback
        currentCommit = gitExecString(['rev-parse', 'HEAD']);
    } catch (e) {
        console.error('❌ Failed to get current commit:', e.message);
        process.exit(1);
    }

    for (const file of filesToBackup) {
        const filePath = path.join(projectRoot, file);
        if (fs.existsSync(filePath)) {
            try {
                backups[file] = fs.readFileSync(filePath, 'utf8');
            } catch (error) {
                console.error(`⚠️  Warning: Could not backup ${file}: ${error.message}`);
            }
        }
    }

    // Function to restore files in case of error
    const rollback = message => {
        console.error('\n🔄 Rolling back changes...');

        // Restore files
        Object.entries(backups).forEach(([file, content]) => {
            const filePath = path.join(projectRoot, file);
            try {
                fs.writeFileSync(filePath, content);
                console.error(`   ✓ Restored ${file}`);
            } catch (e) {
                console.error(`   ⚠️  Failed to restore ${file}: ${e.message}`);
            }
        });

        // Try to reset git if we made commits
        if (currentCommit) {
            try {
                const headCommit = gitExecString(['rev-parse', 'HEAD']);
                if (headCommit !== currentCommit) {
                    console.error('   Resetting git to previous commit...');
                    gitExecArray(['reset', '--hard', currentCommit]);
                    console.error('   ✓ Git reset complete');
                }
            } catch (e) {
                console.error('   ⚠️  Could not reset git:', e.message);
                console.error('   Run: git reset --hard ' + currentCommit);
            }
        }

        if (releaseBranchCreated) {
            try {
                gitExecArray(['checkout', 'main'], { stdio: 'ignore' });
                gitExecArray(['branch', '-D', releaseBranch], { stdio: 'ignore' });
                console.error(`   ✓ Removed local branch ${releaseBranch}`);
            } catch (e) {
                console.error(`   ⚠️  Could not remove local branch ${releaseBranch}:`, e.message);
            }
        }

        if (message) console.error(`\n❌ ${message}`);
        process.exit(1);
    };

    console.log(`\nPreparing release branch ${releaseBranch}`);
    console.log(`Bumping version from ${currentVersion} to ${newVersion}\n`);
    needsCleanup = true;

    try {
        gitExecArray(['checkout', '-b', releaseBranch], { stdio: 'inherit' });
        releaseBranchCreated = true;

        // Update manifest.json
        const manifestPath = path.join(projectRoot, 'manifest.json');
        const updatedManifest = { ...manifest, version: newVersion };
        writeJsonFile(manifestPath, updatedManifest);
        console.log('✓ Updated manifest.json');

        // Update package.json if it exists
        const packagePath = path.join(projectRoot, 'package.json');
        if (fs.existsSync(packagePath)) {
            let packageJson;
            try {
                packageJson = parseJsonFile(packagePath, 'package.json');
            } catch (e) {
                rollback(e.message);
            }
            if (!packageJson || typeof packageJson !== 'object') {
                rollback('package.json is not a valid object');
            }
            packageJson.version = newVersion;
            writeJsonFile(packagePath, packageJson);
            console.log('✓ Updated package.json');
        }

        // Update package-lock.json if it exists
        const packageLockPath = path.join(projectRoot, 'package-lock.json');
        if (fs.existsSync(packageLockPath)) {
            let packageLock;
            try {
                packageLock = parseJsonFile(packageLockPath, 'package-lock.json');
                updatePackageLockVersion(packageLock, newVersion);
            } catch (e) {
                rollback(e.message);
            }
            writeJsonFile(packageLockPath, packageLock);
            console.log('✓ Updated package-lock.json');
        }

        // Update versions.json
        const versionsPath = path.join(projectRoot, 'versions.json');
        let versionsJson = {};
        if (fs.existsSync(versionsPath)) {
            try {
                versionsJson = parseJsonFile(versionsPath, 'versions.json');
            } catch (e) {
                rollback(e.message);
            }
        }
        // Add new version with minimum required Obsidian version from original manifest
        versionsJson[newVersion] = manifest.minAppVersion;
        writeJsonFile(versionsPath, versionsJson);
        console.log('✓ Updated versions.json');
    } catch (error) {
        rollback(`Failed to update version files: ${error.message}`);
    }

    verifyBuild();

    let prInfo = null;

    // Git operations
    try {
        // Add only files that exist
        const filesToAdd = ['manifest.json', 'package.json', 'package-lock.json', 'versions.json'].filter(file =>
            fs.existsSync(path.join(projectRoot, file))
        );
        assertOnlyExpectedChanges(filesToAdd);

        // Use array syntax to avoid shell injection
        gitExecArray(['add', ...filesToAdd], { stdio: 'inherit' });

        // Commit changes
        gitExecArray(['commit', '-m', `Bump version to ${newVersion}`], { stdio: 'inherit' });
        console.log('✓ Committed version changes');

        gitExecArray(['push', '-u', 'origin', releaseBranch], { stdio: 'inherit' });
        console.log(`✓ Pushed ${releaseBranch} to remote`);

        needsCleanup = false;

        if (isDryRun) {
            console.log(`\n🔍 DRY RUN COMPLETE - Release branch ${releaseBranch} would be prepared`);
        } else {
            prInfo = createReleasePullRequest(releaseBranch, newVersion);
            gitExecArray(['checkout', 'main'], { stdio: 'inherit' });
            console.log(`\n✓ Release PR prepared for version ${newVersion}`);
        }
    } catch (error) {
        // If git operations fail, rollback file changes
        console.error('\n⚠️  Note: Git operations may have partially completed.');
        console.error('   Check git status and tags before retrying.');
        rollback(`Git operations failed: ${error.message}`);
    }

    if (isDryRun) {
        return;
    }

    if (prInfo) {
        completeReleasePullRequest(prInfo);
        const mergedManifest = syncMergedReleaseToMain(newVersion);
        publishRelease(mergedManifest, newVersion);
        return;
    }

    console.error('❌ Release pull request could not be created.');
    process.exit(1);
}

function createReleasePullRequest(releaseBranch, newVersion) {
    if (!commandAvailable('gh')) {
        throw new Error('GitHub CLI not found');
    }

    try {
        const output = execFileSync(
            'gh',
            [
                'pr',
                'create',
                '--base',
                'main',
                '--head',
                releaseBranch,
                '--title',
                `Release ${newVersion}`,
                '--body',
                `Bumps release metadata to ${newVersion}.`
            ],
            { cwd: projectRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }
        );

        if (output.trim()) {
            console.log(output.trim());
        }

        const prInfo = tryGetPullRequestInfo(releaseBranch);
        if (prInfo) {
            console.log(`✓ Created release pull request #${prInfo.number}`);
            return prInfo;
        }

        console.log('✓ Created release pull request');
        throw new Error('Could not read release pull request details');
    } catch (error) {
        const existingPrInfo = tryGetPullRequestInfo(releaseBranch);
        if (existingPrInfo) {
            console.log(`⚠️  Release pull request already exists: ${existingPrInfo.url}`);
            return existingPrInfo;
        }

        throw new Error(`Could not create release pull request from ${releaseBranch}: ${getCommandErrorMessage(error)}`);
    }
}

function publishRelease(manifest, currentVersion, options = {}) {
    const { allowedDirtyFiles = [] } = options;

    validateReleaseReadiness(manifest, currentVersion);
    validateReleaseNotes(currentVersion);
    preReleaseChecks({ allowedDirtyFiles });
    checkExistingTag(currentVersion);
    verifyBuild();

    try {
        gitExecArray(['tag', '-a', currentVersion, '-m', `Release ${currentVersion}`], { stdio: 'inherit' });
        console.log(`✓ Created tag ${currentVersion}`);

        gitExecArray(['push', 'origin', `refs/tags/${currentVersion}`], { stdio: 'inherit' });
        console.log(`✓ Pushed tag ${currentVersion}`);

        if (isDryRun) {
            console.log(`\n🔍 DRY RUN COMPLETE - Version ${currentVersion} would be published`);
        } else {
            console.log('\nGitHub Actions will now build and publish the GitHub release.');
            verifyPublishedRelease(currentVersion);
            console.log(`\n🎉 Successfully published version ${currentVersion}`);
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
        console.log(`\nCurrent version ${currentVersion} is not tagged. Publishing merged release.`);
        publishRelease(manifest, currentVersion, { allowedDirtyFiles: releaseAutomationAllowedDirtyFiles });
    } else {
        const openReleasePullRequest = findOpenReleasePullRequest(currentVersion);
        if (openReleasePullRequest) {
            console.log(
                `\nFound open release pull request #${openReleasePullRequest.number} for version ${openReleasePullRequest.releaseVersion}.`
            );
            requireGitHubCliForReleaseAutomation();
            requireCleanWorktree(
                '❌ Worktree has uncommitted changes before completing the release pull request:',
                '   Commit or stash the changes, then run: node scripts/release.js',
                { allowedDirtyFiles: releaseAutomationAllowedDirtyFiles }
            );
            completeReleasePullRequest(openReleasePullRequest);
            const mergedManifest = syncMergedReleaseToMain(openReleasePullRequest.releaseVersion, {
                allowedDirtyFiles: releaseAutomationAllowedDirtyFiles
            });
            publishRelease(mergedManifest, openReleasePullRequest.releaseVersion, {
                allowedDirtyFiles: releaseAutomationAllowedDirtyFiles
            });
        } else {
            showInteractivePrompt(currentVersion, versions);
        }
    }
}
