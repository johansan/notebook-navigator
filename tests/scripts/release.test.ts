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
 */

import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { afterEach, describe, expect, it } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const source = fs.readFileSync(path.join(repoRoot, 'scripts/release.js'), 'utf8');
const metadataFiles = ['manifest.json', 'package.json', 'package-lock.json', 'versions.json'];
const tempDirectories: string[] = [];

interface Fixture {
    root: string;
    remote: string;
}

interface RunOptions {
    mainConclusion?: string;
    wrongCiCommit?: boolean;
    pendingCi?: boolean;
    rejectMainPush?: boolean;
    rejectTagPush?: boolean;
    failBuild?: boolean;
    changeGeneratedFile?: boolean;
    changeMainDuringCi?: boolean;
}

class ScriptExit extends Error {
    constructor(readonly code: number) {
        super(`Script exited ${code}`);
    }
}

function git(root: string, args: string[]): string {
    return execFileSync(
        'git',
        [
            '-c',
            'commit.gpgsign=false',
            '-c',
            'tag.gpgsign=false',
            '-c',
            'core.hooksPath=/dev/null',
            '-c',
            'user.name=Release Tests',
            '-c',
            'user.email=release@example.com',
            ...args
        ],
        { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    ).trimEnd();
}

function writeJson(root: string, file: string, data: unknown): void {
    fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + '\n');
}

function createFixture(version = '1.0.0', tagged = true): Fixture {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'nn-release-tests-'));
    tempDirectories.push(directory);
    const root = path.join(directory, 'work');
    const remote = path.join(directory, 'origin.git');
    fs.mkdirSync(root);
    fs.mkdirSync(remote);
    fs.mkdirSync(path.join(root, 'scripts'));
    fs.mkdirSync(path.join(root, 'src'));
    fs.mkdirSync(path.join(root, '.github/workflows'), { recursive: true });
    fs.writeFileSync(path.join(root, '.github/workflows/release.yml'), 'name: Release Obsidian plugin\n');
    fs.writeFileSync(path.join(root, '.github/workflows/ci.yml'), 'name: Quality checks\n');
    fs.writeFileSync(path.join(root, 'scripts/release.js'), source);
    fs.copyFileSync(path.join(repoRoot, 'scripts/mdReleaseNotes.js'), path.join(root, 'scripts/mdReleaseNotes.js'));
    fs.writeFileSync(path.join(root, 'scripts/build.sh'), '#!/bin/sh\nexit 0\n');
    fs.writeFileSync(
        path.join(root, 'src/releaseNotes.ts'),
        "export const RELEASE_NOTES = [{ version: '1.0.0' }, { version: '1.1.0' }];\n"
    );
    fs.writeFileSync(path.join(root, 'styles.css'), '/* fixture styles */\n');
    fs.writeFileSync(path.join(root, '.gitignore'), '.release.lock\nmain.js\nlanguages.json\n');
    writeJson(root, 'manifest.json', { id: 'test', name: 'Test', version, minAppVersion: '1.11.0', description: 'Test', author: 'Test' });
    writeJson(root, 'package.json', { version, scripts: { build: 'test', 'lint:styles': 'test' } });
    writeJson(root, 'package-lock.json', { version, packages: { '': { version } } });
    writeJson(root, 'versions.json', { [version]: '1.11.0' });
    git(remote, ['init', '--bare', '--initial-branch=main']);
    git(root, ['init', '--initial-branch=main']);
    git(root, ['remote', 'add', 'origin', remote]);
    git(root, ['add', '.']);
    git(root, ['commit', '-m', 'Initial state']);
    git(root, ['push', '-u', 'origin', 'main']);
    if (tagged) {
        git(root, ['tag', '-a', version, '-m', version]);
        git(root, ['push', 'origin', `refs/tags/${version}`]);
    }
    return { root, remote };
}

function snapshot(fixture: Fixture) {
    return {
        files: metadataFiles.map(file => fs.readFileSync(path.join(fixture.root, file), 'utf8')),
        localRefs: git(fixture.root, ['show-ref']),
        remoteRefs: git(fixture.remote, ['show-ref']),
        status: git(fixture.root, ['status', '--porcelain'])
    };
}

function runRelease(fixture: Fixture, args: string[], options: RunOptions = {}) {
    const calls: string[][] = [];
    const output: string[] = [];
    let now = 0;
    let polls = 0;
    let code = 0;
    let exitHandler = () => {};

    function runCommand(command: string, commandArgs: string[] = [], commandOptions: { encoding?: string } = {}): string | Buffer {
        calls.push([command, ...commandArgs]);
        let result = '';
        if (command === 'git') {
            if (commandArgs.join(' ') === 'push origin main' && options.rejectMainPush) throw new Error('Push rejected');
            if (commandArgs.join(' ') === 'push origin refs/tags/1.1.0' && options.rejectTagPush) throw new Error('Tag push rejected');
            // All Git operations use isolated repositories and a local bare remote, including pushes and tags.
            result = git(fixture.root, commandArgs);
        } else if (command === process.execPath) {
            result = execFileSync(command, commandArgs, { cwd: fixture.root, encoding: 'utf8' });
        } else if (command === path.join(fixture.root, 'scripts/build.sh')) {
            if (options.failBuild) throw new Error('Build failed');
            fs.writeFileSync(path.join(fixture.root, 'main.js'), '// built fixture\n');
            fs.writeFileSync(path.join(fixture.root, 'languages.json'), '{}');
            if (options.changeGeneratedFile) fs.appendFileSync(path.join(fixture.root, 'styles.css'), '/* changed */\n');
        } else if (command === 'gh') {
            const operation = commandArgs.slice(0, 2).join(' ');
            if (commandArgs[0] === '--version' || operation === 'auth status') {
                result = 'ok';
            } else if (operation === 'repo view') {
                result = JSON.stringify({ nameWithOwner: 'test/release' });
            } else if (operation === 'run list') {
                const workflow = commandArgs[commandArgs.indexOf('--workflow') + 1];
                if (workflow === '.github/workflows/ci.yml') {
                    polls++;
                    const commit = commandArgs[commandArgs.indexOf('--commit') + 1];
                    result = JSON.stringify([
                        {
                            databaseId: 1,
                            headSha: options.wrongCiCommit ? '0'.repeat(40) : commit,
                            headBranch: 'main',
                            status: options.pendingCi && polls === 1 ? 'in_progress' : 'completed',
                            conclusion: options.mainConclusion ?? 'success',
                            url: 'https://example.test/main-ci'
                        }
                    ]);
                    if (options.changeMainDuringCi && polls === 1) {
                        git(fixture.root, ['commit', '--allow-empty', '-m', 'Concurrent change']);
                        git(fixture.root, ['push', 'origin', 'main']);
                    }
                } else if (workflow === 'Release Obsidian plugin') {
                    result = JSON.stringify([{ databaseId: 2, headBranch: '1.1.0', headSha: git(fixture.root, ['rev-parse', 'HEAD']) }]);
                } else {
                    throw new Error(`Unexpected workflow: ${workflow}`);
                }
            } else if (operation === 'run view') {
                result = JSON.stringify({
                    databaseId: 2,
                    status: 'completed',
                    conclusion: 'success',
                    url: 'https://example.test/release-ci'
                });
            } else if (operation === 'release view') {
                result = JSON.stringify({
                    url: 'https://example.test/release',
                    assets: ['main.js', 'manifest.json', 'styles.css', 'languages.json'].map(name => ({ name }))
                });
            } else if (operation === 'release download') {
                const directory = commandArgs[commandArgs.indexOf('--dir') + 1];
                for (const name of ['main.js', 'manifest.json', 'styles.css', 'languages.json'])
                    fs.writeFileSync(path.join(directory, name), name);
            } else if (operation === 'attestation verify') {
                result = 'verified';
            } else if (operation === 'pr list') {
                // An old release PR must have no effect on any new release or dry-run path.
                result = JSON.stringify([{ number: 123, headRefName: 'release/1.1.0', baseRefName: 'main' }]);
            } else {
                throw new Error(`Unexpected GitHub operation: ${commandArgs.join(' ')}`);
            }
        } else {
            throw new Error(`Unexpected command: ${command}`);
        }
        return commandOptions.encoding ? result : Buffer.from(result);
    }

    const sandbox = {
        __dirname: path.join(fixture.root, 'scripts'),
        require(name: string): unknown {
            if (name === 'child_process')
                return {
                    execFileSync: runCommand,
                    execSync(command: string) {
                        calls.push([command]);
                        if (command !== 'git --version' && command !== 'npm --version')
                            throw new Error(`Unexpected shell command: ${command}`);
                        return Buffer.from('available');
                    }
                };
            if (name === 'readline')
                return {
                    createInterface: () => ({
                        close: () => {},
                        question: (_prompt: string, callback: (answer: string) => void) => callback('2')
                    })
                };
            if (name === 'os') return { ...os, platform: () => 'darwin' };
            if (name === 'fs')
                return new Proxy(fs, {
                    get(target, key: keyof typeof fs) {
                        const value = target[key];
                        if (typeof value === 'function' && /^(write|rename|unlink|rm|mkdir|open|close)/.test(key)) {
                            return (...parameters: unknown[]) => {
                                calls.push([`fs.${key}`]);
                                const result: unknown = Reflect.apply(value, target, parameters);
                                return result;
                            };
                        }
                        return value;
                    }
                });
            return require(name);
        },
        process: {
            argv: ['node', path.join(fixture.root, 'scripts/release.js'), ...args],
            execPath: process.execPath,
            pid: process.pid,
            stdin: {},
            stdout: {},
            cwd: () => fixture.root,
            on(event: string, handler: () => void) {
                if (event === 'exit') exitHandler = handler;
            },
            exit(exitCode: number): never {
                throw new ScriptExit(exitCode);
            }
        },
        console: {
            log: (...values: unknown[]) => output.push(values.join(' ')),
            error: (...values: unknown[]) => output.push(values.join(' '))
        },
        Date: class extends Date {
            static now() {
                return now;
            }
        },
        Atomics: {
            wait: (_array: unknown, _index: number, _value: number, timeout: number) => {
                now += timeout;
            }
        },
        Buffer,
        SharedArrayBuffer,
        Int32Array
    };
    try {
        runInNewContext(source, sandbox, { timeout: 15000 });
    } catch (error) {
        if (!(error instanceof ScriptExit)) throw error;
        code = error.code;
    } finally {
        exitHandler();
    }
    return { code, calls, output: output.join('\n') };
}

afterEach(() => {
    for (const directory of tempDirectories) fs.rmSync(directory, { recursive: true, force: true });
    tempDirectories.length = 0;
});

describe('release.js', () => {
    it('pushes the version commit to main, waits for that commit CI, and publishes its attested release', () => {
        const fixture = createFixture();
        const result = runRelease(fixture, ['minor'], { pendingCi: true });
        expect(result.code, result.output).toBe(0);
        const commit = git(fixture.root, ['rev-parse', 'HEAD']);
        expect(git(fixture.remote, ['rev-parse', 'main'])).toBe(commit);
        expect(git(fixture.remote, ['rev-parse', '1.1.0^{}'])).toBe(commit);
        expect(git(fixture.root, ['branch', '--format=%(refname:short)'])).toBe('main');
        expect(git(fixture.root, ['status', '--porcelain'])).toBe('');
        expect(JSON.parse(fs.readFileSync(path.join(fixture.root, 'manifest.json'), 'utf8'))).toMatchObject({ version: '1.1.0' });
        expect(JSON.parse(fs.readFileSync(path.join(fixture.root, 'package.json'), 'utf8'))).toMatchObject({ version: '1.1.0' });
        expect(JSON.parse(fs.readFileSync(path.join(fixture.root, 'package-lock.json'), 'utf8'))).toMatchObject({
            version: '1.1.0',
            packages: { '': { version: '1.1.0' } }
        });
        expect(JSON.parse(fs.readFileSync(path.join(fixture.root, 'versions.json'), 'utf8'))).toEqual({
            '1.0.0': '1.11.0',
            '1.1.0': '1.11.0'
        });
        const push = result.calls.findIndex(call => call.join(' ') === 'git push origin main');
        const ci = result.calls.findIndex(call => call.includes('--commit'));
        const tag = result.calls.findIndex(call => call[0] === 'git' && call[1] === 'tag' && call.includes('-a'));
        expect(push).toBeGreaterThan(-1);
        expect(ci).toBeGreaterThan(push);
        expect(result.calls[ci]).toContain(commit);
        expect(tag).toBeGreaterThan(ci);
        expect(result.calls.filter(call => call[0] === 'gh' && call[1] === 'attestation')).toHaveLength(4);
        expect(result.calls.some(call => call[0] === 'gh' && call[1] === 'pr')).toBe(false);
    });

    it.each([['minor', '--dry-run'], ['--dry-run']])('keeps files, refs and GitHub untouched with arguments %j', (...args) => {
        const fixture = createFixture();
        const before = snapshot(fixture);
        const result = runRelease(fixture, args);
        expect(result.code, result.output).toBe(0);
        expect(snapshot(fixture)).toEqual(before);
        expect(result.calls.some(call => call[0].startsWith('fs.'))).toBe(false);
        expect(result.calls.some(call => call[0] === 'gh')).toBe(false);
        expect(
            result.calls.some(
                call => call[0] === 'git' && ['add', 'commit', 'push', 'fetch', 'merge', 'checkout', 'reset'].includes(call[1])
            )
        ).toBe(false);
        expect(result.output).toContain('Would run: git push origin main');
        expect(result.output).toContain('Would run: git tag -a 1.1.0 <release-commit>');
        expect(result.output).toContain('Version 1.1.0 would be published');

        // Also exercise argument parsing and readline in a real process against the local fixture remote.
        const cliOutput = execFileSync(process.execPath, [path.join(fixture.root, 'scripts/release.js'), ...args], {
            cwd: fixture.root,
            encoding: 'utf8',
            input: '2\n'
        });
        expect(cliOutput).toContain('Version 1.1.0 would be published');
        expect(snapshot(fixture)).toEqual(before);
    });

    it('previews an untagged version without building, writing or contacting GitHub', () => {
        const fixture = createFixture('1.1.0', false);
        const before = snapshot(fixture);
        const result = runRelease(fixture, ['--dry-run']);
        expect(result.code, result.output).toBe(0);
        expect(snapshot(fixture)).toEqual(before);
        expect(result.calls.some(call => call[0] === 'gh' || call[0].startsWith('fs.'))).toBe(false);
        expect(result.output).toContain('Version 1.1.0 would be published');
    });

    it.each(['failure', 'cancelled', 'skipped'])('leaves main committed and untagged when CI concludes %s', mainConclusion => {
        const fixture = createFixture();
        const result = runRelease(fixture, ['minor'], { mainConclusion });
        expect(result.code).toBe(1);
        expect(result.output).toContain(`Main CI ${mainConclusion}`);
        expect(git(fixture.root, ['tag', '-l', '1.1.0'])).toBe('');
        expect(git(fixture.root, ['rev-parse', 'HEAD'])).toBe(git(fixture.remote, ['rev-parse', 'main']));
        expect(git(fixture.root, ['status', '--porcelain'])).toBe('');
        const resumed = runRelease(fixture, []);
        expect(resumed.code, resumed.output).toBe(0);
        expect(git(fixture.remote, ['rev-parse', '1.1.0^{}'])).toBe(git(fixture.root, ['rev-parse', 'HEAD']));
        expect(resumed.calls.some(call => call[0] === 'git' && call[1] === 'commit')).toBe(false);
    });

    it('refuses to tag when only another commit has successful CI', () => {
        const fixture = createFixture();
        const result = runRelease(fixture, ['minor'], { wrongCiCommit: true });
        expect(result.code).toBe(1);
        expect(result.output).toContain('Main CI did not pass');
        expect(git(fixture.root, ['tag', '-l', '1.1.0'])).toBe('');
    });

    it('retains the version commit after a rejected push and resumes after the push succeeds', () => {
        const fixture = createFixture();
        const before = git(fixture.remote, ['rev-parse', 'main']);
        const result = runRelease(fixture, ['minor'], { rejectMainPush: true });
        expect(result.code).toBe(1);
        expect(result.output).toContain('The version commit was retained');
        expect(git(fixture.remote, ['rev-parse', 'main'])).toBe(before);
        expect(git(fixture.root, ['rev-parse', 'HEAD'])).not.toBe(before);
        expect(git(fixture.root, ['status', '--porcelain'])).toBe('');
        expect(git(fixture.root, ['tag', '-l', '1.1.0'])).toBe('');
        expect(result.calls.some(call => call.includes('--commit') || call[1] === 'reset')).toBe(false);
        git(fixture.root, ['push', 'origin', 'main']);
        const resumed = runRelease(fixture, []);
        expect(resumed.code, resumed.output).toBe(0);
    });

    it.each([{ failBuild: true }, { changeGeneratedFile: true }])('stops before committing when build verification fails: %j', options => {
        const fixture = createFixture();
        const before = git(fixture.root, ['rev-parse', 'HEAD']);
        const result = runRelease(fixture, ['minor'], options);
        expect(result.code).toBe(1);
        expect(git(fixture.root, ['rev-parse', 'HEAD'])).toBe(before);
        expect(git(fixture.remote, ['rev-parse', 'main'])).toBe(before);
        expect(git(fixture.root, ['tag', '-l', '1.1.0'])).toBe('');
    });

    it('refuses to tag when main changes during the CI wait', () => {
        const fixture = createFixture();
        const result = runRelease(fixture, ['minor'], { changeMainDuringCi: true });
        expect(result.code).toBe(1);
        expect(result.output).toContain('Main changed while preparing the release');
        expect(git(fixture.root, ['tag', '-l', '1.1.0'])).toBe('');
    });

    it('reports a local tag after a failed tag push instead of incrementing the version again', () => {
        const fixture = createFixture();
        const result = runRelease(fixture, ['minor'], { rejectTagPush: true });
        expect(result.code).toBe(1);
        const before = snapshot(fixture);
        const resumed = runRelease(fixture, []);
        expect(resumed.code).toBe(1);
        expect(resumed.output).toContain('exists locally but has not been pushed');
        expect(snapshot(fixture)).toEqual(before);
    });
});
