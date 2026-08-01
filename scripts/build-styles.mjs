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

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const projectRoot = path.resolve(dirname, '..');
const entryPath = path.join(projectRoot, 'src', 'styles', 'index.css');
const outputPath = path.join(projectRoot, 'styles.css');
const coreVariablesPath = path.join(projectRoot, 'src', 'styles', 'sections', 'core-variables.css');
const styleSettingsPath = path.join(projectRoot, 'src', 'styles', 'sections', 'settings-style-settings.css');
const themingGuidePath = path.join(projectRoot, 'docs', 'theming-guide.md');

function assertUnique(values, label) {
    const seen = new Set();
    for (const value of values) {
        if (seen.has(value)) {
            throw new Error(`Theming consistency check failed: duplicate ${label} entry ${value}`);
        }
        seen.add(value);
    }
}

function assertOrderedMatch(actual, expected, label) {
    const mismatchIndex = Array.from({ length: Math.max(actual.length, expected.length) }, (_, index) => index).find(
        index => actual[index] !== expected[index]
    );
    if (mismatchIndex === undefined) {
        return;
    }

    const actualValue = actual[mismatchIndex] ?? '<missing>';
    const expectedValue = expected[mismatchIndex] ?? '<missing>';
    throw new Error(
        `Theming consistency check failed: ${label} differ at position ${mismatchIndex + 1} ` +
            `(expected ${expectedValue}, found ${actualValue})`
    );
}

function getMarkdownSection(markdown, heading, level) {
    const lines = markdown.split('\n');
    const marker = `${'#'.repeat(level)} ${heading}`;
    const startIndex = lines.findIndex(line => line === marker);
    if (startIndex === -1) {
        throw new Error(`Theming consistency check failed: missing Markdown heading ${marker}`);
    }

    let endIndex = lines.length;
    for (let index = startIndex + 1; index < lines.length; index++) {
        const match = /^(#{1,6}) /.exec(lines[index]);
        if (match && match[1].length <= level) {
            endIndex = index;
            break;
        }
    }
    return lines.slice(startIndex, endIndex).join('\n');
}

function parseThemeReference(markdown) {
    const section = getMarkdownSection(markdown, 'CSS Variables Reference', 2);
    const headings = Array.from(section.matchAll(/^(#{3,6}) (.+)$/gm), match => ({
        level: match[1].length - 2,
        title: match[2]
    }));
    const rows = [];

    for (const line of section.split('\n')) {
        const match = /^\| `(--nn-theme-[\w-]+)` \| (.*?) \| (.*?) \|$/.exec(line);
        if (!match) {
            continue;
        }
        rows.push({
            variable: match[1],
            defaultValue: match[2],
            description: match[3]
        });
    }

    if (rows.length === 0) {
        throw new Error('Theming consistency check failed: the CSS variable reference has no variable rows');
    }
    assertUnique(
        rows.map(row => row.variable),
        'CSS variable reference'
    );
    return { headings, rows };
}

function readMetadataField(record, field) {
    const match = new RegExp(`^ {8}${field}: (.+)$`, 'm').exec(record);
    return match?.[1];
}

function parseStyleSettings(css) {
    const blockMatch = /\/\* @settings\n([\s\S]*?)\n\*\//.exec(css);
    if (!blockMatch) {
        throw new Error('Theming consistency check failed: Style Settings metadata block is missing');
    }

    const records = blockMatch[1]
        .split(/\n {4}-\n/)
        .slice(1)
        .map(record => ({
            id: readMetadataField(record, 'id'),
            title: readMetadataField(record, 'title'),
            type: readMetadataField(record, 'type'),
            level: readMetadataField(record, 'level'),
            defaultValue: readMetadataField(record, 'default'),
            format: readMetadataField(record, 'format')
        }));

    if (records.some(record => !record.id || !record.title || !record.type)) {
        throw new Error('Theming consistency check failed: Style Settings entry is missing id, title, or type');
    }
    assertUnique(
        records.map(record => record.id),
        'Style Settings id'
    );
    return records;
}

function parseThemeDeclarations(css) {
    const declarations = [];
    for (const match of css.matchAll(/^[ \t]+(--nn-theme-[\w-]+):[ \t]*([\s\S]*?);/gm)) {
        declarations.push({ variable: match[1], value: match[2] });
    }
    assertUnique(
        declarations.map(declaration => declaration.variable),
        'theme declaration'
    );
    return declarations;
}

function normalizeCssValue(value) {
    return value.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
}

function firstCodeValue(value) {
    return /^`([^`]+)`/.exec(value)?.[1];
}

function validateThemingSources(sourceCss, coreVariablesCss, styleSettingsCss, themingGuide) {
    // These files intentionally duplicate the public variable contract, so the style build rejects drift in names,
    // grouping, order, defaults, exclusions, or the copyable complete example before regenerating styles.css.
    const reference = parseThemeReference(themingGuide);
    const referenceVariables = reference.rows.map(row => row.variable);
    const referenceRows = new Map(reference.rows.map(row => [row.variable, row]));
    const settings = parseStyleSettings(styleSettingsCss);
    const settingsVariables = settings
        .filter(entry => entry.type !== 'heading' && entry.id.startsWith('nn-theme-'))
        .map(entry => `--${entry.id}`);
    const settingsHeadings = settings
        .filter(entry => entry.type === 'heading')
        .map(entry => ({ level: Number(entry.level), title: entry.title }));

    const sourceWithoutComments = sourceCss.replace(/\/\*[\s\S]*?\*\//g, ' ');
    const sourceVariables = Array.from(new Set(sourceWithoutComments.match(/--nn-theme-[\w-]+/g) ?? [])).sort();
    assertOrderedMatch(sourceVariables, [...referenceVariables].sort(), 'source CSS and reference variables');

    const commonReferenceOrder = referenceVariables.filter(variable => settingsVariables.includes(variable));
    assertOrderedMatch(settingsVariables, commonReferenceOrder, 'Style Settings and reference variable order');
    assertOrderedMatch(
        settingsHeadings.map(heading => `${heading.level}:${heading.title}`),
        reference.headings.map(heading => `${heading.level}:${heading.title}`),
        'Style Settings and reference headings'
    );

    const styleSettingsSection = getMarkdownSection(themingGuide, 'Style Settings', 3);
    const documentedExclusions = Array.from(styleSettingsSection.matchAll(/^- `(--nn-theme-[\w-]+)`$/gm), match => match[1]);
    const actualExclusions = referenceVariables.filter(variable => !settingsVariables.includes(variable));
    assertOrderedMatch(documentedExclusions, actualExclusions, 'Style Settings exclusions and reference-only variables');

    const completeExample = getMarkdownSection(themingGuide, 'Complete Theme Example', 2);
    const exampleVariables = Array.from(completeExample.matchAll(/^  (--nn-theme-[\w-]+):/gm), match => match[1]);
    assertUnique(exampleVariables, 'complete theme example');
    assertOrderedMatch(exampleVariables, referenceVariables, 'complete theme example and reference variables');

    const themeBlockStart = coreVariablesCss.indexOf('Notebook Navigator Theme Variables');
    const themeBlockEnd = coreVariablesCss.indexOf('/* -- File Separator -- */');
    if (themeBlockStart === -1 || themeBlockEnd === -1 || themeBlockEnd <= themeBlockStart) {
        throw new Error('Theming consistency check failed: core theme variable block is missing');
    }
    const coreDeclarations = parseThemeDeclarations(coreVariablesCss.slice(themeBlockStart, themeBlockEnd));
    const coreVariables = coreDeclarations.map(declaration => declaration.variable);
    assertOrderedMatch(
        coreVariables,
        referenceVariables.filter(variable => coreVariables.includes(variable)),
        'core declarations and reference variable order'
    );

    const coreDefaults = new Map(coreDeclarations.map(declaration => [declaration.variable, normalizeCssValue(declaration.value)]));
    for (const [variable, defaultValue] of coreDefaults) {
        const documentedDefault = firstCodeValue(referenceRows.get(variable)?.defaultValue ?? '');
        if (!documentedDefault || normalizeCssValue(documentedDefault) !== defaultValue) {
            throw new Error(
                `Theming consistency check failed: ${variable} default is ${defaultValue}, ` +
                    `but the reference documents ${documentedDefault ?? '<no code value>'}`
            );
        }
    }

    const unsetReferenceVariables = reference.rows
        .filter(row => row.defaultValue.startsWith('unset, falls back to '))
        .map(row => row.variable);
    const undeclaredReferenceVariables = referenceVariables.filter(variable => !coreDefaults.has(variable));
    assertOrderedMatch(
        unsetReferenceVariables,
        undeclaredReferenceVariables,
        'unset reference variables and intentionally undeclared core variables'
    );

    const darkBlock = /\.theme-dark\s*\{([\s\S]*?)\}/.exec(coreVariablesCss)?.[1];
    if (!darkBlock) {
        throw new Error('Theming consistency check failed: .theme-dark variable overrides are missing');
    }
    for (const declaration of parseThemeDeclarations(darkBlock)) {
        const row = referenceRows.get(declaration.variable);
        const documentedValues = Array.from(`${row?.defaultValue ?? ''} ${row?.description ?? ''}`.matchAll(/`([^`]+)`/g), match =>
            normalizeCssValue(match[1])
        );
        const darkValue = normalizeCssValue(declaration.value);
        if (!documentedValues.includes(darkValue)) {
            throw new Error(`Theming consistency check failed: ${declaration.variable} dark-mode default ${darkValue} is undocumented`);
        }
    }

    for (const entry of settings) {
        if (!['variable-number-slider', 'variable-select'].includes(entry.type)) {
            continue;
        }
        const variable = `--${entry.id}`;
        const documentedDefault = firstCodeValue(referenceRows.get(variable)?.defaultValue ?? '');
        const settingsDefault = `${entry.defaultValue ?? ''}${entry.format ?? ''}`;
        if (documentedDefault !== settingsDefault) {
            throw new Error(
                `Theming consistency check failed: ${variable} Style Settings default is ${settingsDefault}, ` +
                    `but the reference documents ${documentedDefault ?? '<no code value>'}`
            );
        }
    }
}

const entry = await fs.readFile(entryPath, 'utf8');

const importRegex = /@import\s+(?:url\()?['"]([^'"]+)['"]\)?\s*;/g;
const importPaths = Array.from(entry.matchAll(importRegex), match => match[1]);

if (importPaths.length === 0) {
    throw new Error(`No @import statements found in ${path.relative(projectRoot, entryPath)}`);
}

const resolvedImports = importPaths.map(importPath => {
    if (!importPath.startsWith('.')) {
        throw new Error(`Only relative @import paths are supported (got: ${importPath})`);
    }

    const absolutePath = path.resolve(path.dirname(entryPath), importPath);
    const relativePath = path.relative(projectRoot, absolutePath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        throw new Error(`@import path must stay within project root (got: ${importPath})`);
    }

    return {
        absolutePath,
        relativePath: relativePath.split(path.sep).join(path.posix.sep)
    };
});

const sourceIndexPath = path.relative(projectRoot, entryPath).split(path.sep).join(path.posix.sep);

const header = [
    '/*',
    'Notebook Navigator - Plugin for Obsidian',
    'Copyright (c) 2025-2026 Johan Sanneblad',
    '',
    'This program is free software: you can redistribute it and/or modify',
    'it under the terms of the GNU General Public License as published by',
    'the Free Software Foundation, either version 3 of the License, or',
    '(at your option) any later version.',
    '',
    'This program is distributed in the hope that it will be useful,',
    'but WITHOUT ANY WARRANTY; without even the implied warranty of',
    'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the',
    'GNU General Public License for more details.',
    '',
    'You should have received a copy of the GNU General Public License',
    'along with this program.  If not, see <https://www.gnu.org/licenses/>.',
    '',
    '=========================================================================',
    'GENERATED FILE - DO NOT EDIT styles.css',
    '=========================================================================',
    '',
    'Edit the CSS sources instead:',
    `- ${sourceIndexPath} (import order + per-file descriptions)`,
    '- src/styles/sections/*',
    '',
    'Generated by: scripts/build-styles.mjs',
    '*/',
    ''
].join('\n');

let output = header;
let sourceCss = '';

for (const entry of resolvedImports) {
    const source = await fs.readFile(entry.absolutePath, 'utf8');
    sourceCss += source;
    output += source;
}

const [coreVariablesCss, styleSettingsCss, themingGuide] = await Promise.all([
    fs.readFile(coreVariablesPath, 'utf8'),
    fs.readFile(styleSettingsPath, 'utf8'),
    fs.readFile(themingGuidePath, 'utf8')
]);
validateThemingSources(sourceCss, coreVariablesCss, styleSettingsCss, themingGuide);

let existing = null;
try {
    existing = await fs.readFile(outputPath, 'utf8');
} catch {
    // styles.css may not exist yet
}

if (existing !== output) {
    await fs.writeFile(outputPath, output, 'utf8');
}

console.log(`Built styles.css from ${importPaths.length} files`);
console.log('Validated theming guide against CSS and Style Settings');
