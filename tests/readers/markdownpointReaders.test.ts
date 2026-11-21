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
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { THIRD_PARTY_PACKAGES } from '../../src/constants/thirdPartyLicenses';
import { READERS_COMMIT } from '../../src/services/PresentationService';

const readersFile = (name: string) => readFileSync(new URL(`../../src/readers/${name}`, import.meta.url), 'utf8');

describe("MarkdownPoint's readers", () => {
    it('are the bundle the app made at one commit, unedited: each file is what its header digest names', () => {
        const commits = new Set<string>();
        for (const name of ['markdownpoint-readers.js', 'markdownpoint-readers.d.ts']) {
            const text = readersFile(name);
            const commit = /^\/\/ app ([0-9a-f]{40})$/m.exec(text)?.[1];
            const stamp = /^\/\/ sha256 ([0-9a-f]{64})\n/m.exec(text);
            expect(commit && stamp, `${name} has the bundle header`).toBeTruthy();
            commits.add(commit!);
            const body = text.slice(stamp!.index + stamp![0].length);
            expect(createHash('sha256').update(body).digest('hex'), `${name} is as the app made it`).toBe(stamp![1]);
        }
        expect([...commits]).toEqual([READERS_COMMIT]);
    });

    it('carry only packages whose license notices Navigator shows', () => {
        const packages = /^\/\/ Packages: (.*)\. Do not edit/m.exec(readersFile('markdownpoint-readers.js'))?.[1] ?? '';
        const names = packages.split(', ').map(entry => entry.slice(0, entry.lastIndexOf('@')));
        expect(names.length).toBeGreaterThan(0);
        expect(names.filter(name => !THIRD_PARTY_PACKAGES.includes(name))).toEqual([]);
    });

    it('hold each rule they export: no Navigator source declares one of their names again', () => {
        const declarations = readersFile('markdownpoint-readers.d.ts');
        const shared = new Set(
            [...declarations.matchAll(/^export declare (?:function|const) ([A-Za-z_$][\w$]*)/gm)].map(match => match[1])
        );
        expect(shared.has('findPresentationPair') && shared.has('readPresentationTheme')).toBe(true);
        const root = fileURLToPath(new URL('../../src/', import.meta.url));
        const copies: string[] = [];
        for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
            const file = path.join(entry.parentPath, entry.name);
            const relative = path.relative(root, file).split(path.sep).join('/');
            if (!entry.isFile() || !/\.tsx?$/.test(relative) || relative.startsWith('readers/')) {
                continue;
            }
            const source = ts.createSourceFile(relative, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest);
            for (const statement of source.statements) {
                const names =
                    ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)
                        ? [statement.name?.text]
                        : ts.isVariableStatement(statement)
                          ? statement.declarationList.declarations.map(declaration =>
                                ts.isIdentifier(declaration.name) ? declaration.name.text : undefined
                            )
                          : [];
                for (const name of names) {
                    if (name && shared.has(name)) {
                        copies.push(`${relative}: ${name}`);
                    }
                }
            }
        }
        expect(copies).toEqual([]);
    });
});
