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

import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterEach, describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, '../..');
const tempProjects: string[] = [];

interface ScriptResult {
    code: number;
    stdout: string;
    stderr: string;
}

interface ExecFileError extends Error {
    code?: number | string;
    stdout?: string | Buffer;
    stderr?: string | Buffer;
}

function isExecFileError(error: unknown): error is ExecFileError {
    return error instanceof Error;
}

async function runScript(projectRoot: string, args: string[]): Promise<ScriptResult> {
    try {
        const { stdout, stderr } = await execFileAsync(
            process.execPath,
            [path.join(repoRoot, 'scripts/compare-locale-strings.mjs'), '--project-root', projectRoot, ...args],
            { cwd: repoRoot, encoding: 'utf8' }
        );
        return { code: 0, stdout: String(stdout), stderr: String(stderr) };
    } catch (error) {
        if (!isExecFileError(error)) {
            throw error;
        }
        return {
            code: typeof error.code === 'number' ? error.code : 1,
            stdout: String(error.stdout ?? ''),
            stderr: String(error.stderr ?? '')
        };
    }
}

async function createTempProject(): Promise<string> {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'nn-locale-comparison-'));
    tempProjects.push(projectRoot);
    return projectRoot;
}

async function writeProjectFile(projectRoot: string, relativePath: string, contents: string): Promise<void> {
    const filePath = path.join(projectRoot, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, contents, 'utf8');
}

async function writeJson(projectRoot: string, relativePath: string, value: unknown): Promise<void> {
    await writeProjectFile(projectRoot, relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function runGit(projectRoot: string, args: string[]): Promise<void> {
    await execFileAsync('git', args, { cwd: projectRoot, encoding: 'utf8' });
}

function baselineLocale(suffix: string): string {
    return `export const STRINGS_${suffix.toUpperCase()} = {
    common: {
        unchanged: '${suffix} common'
    },
    settings: {
        keep: {
            message: "${suffix} Keep {name}"
        },
        move: {
            label: '${suffix} Move'
        },
        fan: {
            label: '${suffix} Fan'
        },
        copy: {
            label: '${suffix} Copy'
        },
        split: {
            left: '${suffix} Left',
            right: '${suffix} Right'
        },
        kinds: {
            action: (name: string) => \`${suffix} Hello \${name}\`,
            list: ['${suffix} One {count}', '${suffix} Two']
        }
    }
};
`;
}

function workingLocale(suffix: string): string {
    return `export const STRINGS_${suffix.toUpperCase()} = {
    common: {
        unchanged: '${suffix} common'
    },
    settings: {
        keep: {
            message: '${suffix} Keep {name}'
        },
        moved: {
            label: '${suffix} Move'
        },
        firstFan: {
            label: '${suffix} Fan'
        },
        secondFan: {
            label: '${suffix} Fan'
        },
        copy: {
            label: '${suffix} Copy'
        },
        copyMirror: {
            label: '${suffix} Copy'
        },
        leftPart: '${suffix} Left',
        rightPart: '${suffix} Right',
        kinds: {
            action: (name: string) => \`${suffix} Hello \${name}\`,
            list: ['${suffix} One {count}', '${suffix} Two']
        },
        added: '${suffix} Added {thing}'
    }
};
`;
}

afterEach(async () => {
    await Promise.all(tempProjects.map(projectRoot => rm(projectRoot, { recursive: true, force: true })));
    tempProjects.length = 0;
});

describe('compare-locale-strings.mjs', () => {
    it('applies moves, splits, source-removing fan-outs, retained-source copies, retains, and approved additions', async () => {
        const projectRoot = await createTempProject();
        await writeProjectFile(projectRoot, 'src/i18n/locales/en.ts', baselineLocale('en'));
        await writeProjectFile(projectRoot, 'src/i18n/locales/fr.ts', baselineLocale('fr'));

        await runGit(projectRoot, ['init']);
        await runGit(projectRoot, ['config', 'user.name', 'Notebook Navigator Tests']);
        await runGit(projectRoot, ['config', 'user.email', 'tests@example.com']);
        await runGit(projectRoot, ['add', 'src/i18n/locales']);
        await runGit(projectRoot, ['commit', '-m', 'baseline']);

        await writeProjectFile(projectRoot, 'src/i18n/locales/en.ts', workingLocale('en'));
        await writeProjectFile(projectRoot, 'src/i18n/locales/fr.ts', workingLocale('fr'));
        await writeJson(projectRoot, 'manifest.json', {
            schemaVersion: 1,
            baselineRef: 'HEAD',
            scopePrefixes: ['settings'],
            operations: [
                { kind: 'move', source: 'settings.move', targets: ['settings.moved'] },
                { kind: 'fanOut', source: 'settings.fan', targets: ['settings.firstFan', 'settings.secondFan'] },
                { kind: 'copy', source: 'settings.copy', targets: ['settings.copyMirror'] },
                { kind: 'split', source: 'settings.split.left', targets: ['settings.leftPart'] },
                { kind: 'split', source: 'settings.split.right', targets: ['settings.rightPart'] }
            ],
            retains: ['settings.keep', 'settings.kinds'],
            approvedAdditions: [{ path: 'settings.added', kind: 'leaf', placeholders: ['thing'] }]
        });

        const result = await runScript(projectRoot, ['--manifest', 'manifest.json']);

        expect(result.code).toBe(0);
        expect(result.stdout).toContain('Locales: 2');
        expect(result.stdout).toContain('Operations: 5');
        expect(result.stdout).toContain('Locale values: OK');
    });

    it('reports translated value, kind, placeholder, and unapproved-path changes', async () => {
        const projectRoot = await createTempProject();
        const baselineRoot = path.join(projectRoot, 'baseline');
        await writeProjectFile(
            baselineRoot,
            'src/i18n/locales/en.ts',
            `export const STRINGS_EN = {
    settings: {
        keep: { message: 'Hello {name}' },
        kinds: {
            action: (name: string) => \`Hello \${name}\`,
            changedFunction: (name: string) => \`Hello \${name}\`,
            changedArray: ['One', 'Two']
        }
    }
};
`
        );
        await writeProjectFile(
            projectRoot,
            'src/i18n/locales/en.ts',
            `export const STRINGS_EN = {
    settings: {
        keep: { message: 'Hello {person}' },
        kinds: {
            action: ['Hello'],
            changedFunction: (name: string) => \`Hi \${name}\`,
            changedArray: ['One', 'Three']
        },
        extra: 'Extra'
    }
};
`
        );
        await writeJson(projectRoot, 'manifest.json', {
            schemaVersion: 1,
            scopePrefixes: ['settings'],
            operations: [],
            retains: ['settings.keep', 'settings.kinds'],
            approvedAdditions: []
        });

        const result = await runScript(projectRoot, ['--manifest', 'manifest.json', '--base-dir', baselineRoot]);

        expect(result.code).toBe(1);
        expect(result.stderr).toContain('translated value changed at settings.keep.message');
        expect(result.stderr).toContain('placeholders changed at settings.keep.message');
        expect(result.stderr).toContain('value kind changed at settings.kinds.action');
        expect(result.stderr).toContain('translated value changed at settings.kinds.changedFunction');
        expect(result.stderr).toContain('translated value changed at settings.kinds.changedArray');
        expect(result.stderr).toContain('unapproved new path: settings.extra');
    });

    it('reports uncovered baseline paths, unmatched rules, and unused approved additions', async () => {
        const projectRoot = await createTempProject();
        const baselineRoot = path.join(projectRoot, 'baseline');
        const locale = `export const STRINGS_EN = { settings: { covered: 'Covered', uncovered: 'Uncovered' } };\n`;
        await writeProjectFile(baselineRoot, 'src/i18n/locales/en.ts', locale);
        await writeProjectFile(projectRoot, 'src/i18n/locales/en.ts', locale);
        await writeJson(projectRoot, 'manifest.json', {
            schemaVersion: 1,
            scopePrefixes: ['settings'],
            operations: [{ kind: 'move', source: 'settings.missing', targets: ['settings.alsoMissing'] }],
            retains: ['settings.covered'],
            approvedAdditions: [{ path: 'settings.notAdded' }]
        });

        const result = await runScript(projectRoot, ['--manifest', 'manifest.json', '--base-dir', baselineRoot]);

        expect(result.code).toBe(1);
        expect(result.stderr).toContain('baseline path is not mapped or retained: settings.uncovered');
        expect(result.stderr).toContain('Manifest rule matches no baseline leaves: settings.missing');
        expect(result.stderr).toContain('Approved addition matches no working leaves: settings.notAdded');
    });

    it('validates complete semantic-review coverage and split targets against the operation manifest', async () => {
        const projectRoot = await createTempProject();
        const baselineRoot = path.join(projectRoot, 'baseline');
        await writeProjectFile(
            baselineRoot,
            'src/i18n/locales/en.ts',
            `export const STRINGS_EN = {
    settings: {
        items: {
            alpha: { name: 'Alpha', options: { old: 'Old' } },
            shared: { first: 'First', second: 'Second' },
            placement: { name: 'Placement', options: { right: 'Right' } }
        }
    }
};
`
        );
        await writeProjectFile(
            projectRoot,
            'src/i18n/locales/en.ts',
            `export const STRINGS_EN = {
    settings: {
        items: {
            beta: { name: 'Alpha', options: { current: 'Old' } },
            firstTarget: { first: 'First' },
            secondTarget: { second: 'Second' },
            placement: { name: 'Placement', options: { right: 'Right' } }
        },
        pages: {
            calendar: { groups: { right: 'Right' } }
        }
    }
};
`
        );
        await writeJson(projectRoot, 'semantic.json', {
            schemaVersion: 1,
            items: [
                { source: 'settings.items.alpha', target: 'settings.items.beta', decision: 'rename' },
                {
                    source: 'settings.items.shared',
                    targets: ['settings.items.firstTarget', 'settings.items.secondTarget'],
                    decision: 'rename'
                },
                { source: 'settings.items.placement', target: 'settings.items.placement', decision: 'retain' }
            ],
            nestedIdentifiers: [
                {
                    source: 'settings.items.alpha.options.old',
                    target: 'settings.items.beta.options.current',
                    decision: 'rename'
                },
                {
                    source: 'settings.items.placement.options.right',
                    target: 'settings.items.placement.options.right',
                    decision: 'retain'
                }
            ]
        });
        await writeJson(projectRoot, 'manifest.json', {
            schemaVersion: 1,
            scopePrefixes: ['settings'],
            semanticReview: 'semantic.json',
            operations: [
                { kind: 'move', source: 'settings.items.alpha', targets: ['settings.items.beta'] },
                {
                    kind: 'move',
                    source: 'settings.items.alpha.options.old',
                    targets: ['settings.items.beta.options.current']
                },
                {
                    kind: 'split',
                    source: 'settings.items.shared.first',
                    targets: ['settings.items.firstTarget.first']
                },
                {
                    kind: 'split',
                    source: 'settings.items.shared.second',
                    targets: ['settings.items.secondTarget.second']
                },
                {
                    kind: 'copy',
                    source: 'settings.items.placement.options.right',
                    targets: ['settings.pages.calendar.groups.right']
                }
            ],
            retains: ['settings.items.placement'],
            approvedAdditions: []
        });

        const result = await runScript(projectRoot, ['--manifest', 'manifest.json', '--base-dir', baselineRoot]);

        expect(result.code, result.stderr).toBe(0);
        expect(result.stdout).toContain('Semantic review decisions: 5');
        expect(result.stdout).toContain('Locale values: OK');
    });

    it('reports incomplete semantic-review coverage', async () => {
        const projectRoot = await createTempProject();
        const baselineRoot = path.join(projectRoot, 'baseline');
        const locale = `export const STRINGS_EN = {
    settings: { items: { alpha: { name: 'Alpha', options: { old: 'Old' } } } }
};
`;
        await writeProjectFile(baselineRoot, 'src/i18n/locales/en.ts', locale);
        await writeProjectFile(projectRoot, 'src/i18n/locales/en.ts', locale);
        await writeJson(projectRoot, 'semantic.json', {
            schemaVersion: 1,
            items: [{ source: 'settings.items.alpha', target: 'settings.items.alpha', decision: 'retain' }],
            nestedIdentifiers: []
        });
        await writeJson(projectRoot, 'manifest.json', {
            schemaVersion: 1,
            scopePrefixes: ['settings'],
            semanticReview: 'semantic.json',
            operations: [],
            retains: ['settings.items.alpha'],
            approvedAdditions: []
        });

        const result = await runScript(projectRoot, ['--manifest', 'manifest.json', '--base-dir', baselineRoot]);

        expect(result.code).toBe(1);
        expect(result.stderr).toContain('Semantic review nestedIdentifiers coverage mismatch');
        expect(result.stderr).toContain('settings.items.alpha.options.old');
    });
});
