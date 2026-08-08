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
 */

import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import * as ts from 'typescript';

const execFileAsync = promisify(execFile);
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const DEFAULT_PROJECT_ROOT = path.resolve(dirname, '..');
const LOCALES_RELATIVE_DIR = path.join('src', 'i18n', 'locales');
const PLACEHOLDER_REGEX = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
const NESTED_IDENTIFIER_FAMILIES = new Set(['options', 'directions', 'dateDirections', 'textDirections', 'fields', 'families']);
const OPERATION_KINDS = new Set(['move', 'split', 'fanOut', 'copy']);
const VALUE_KINDS = new Set(['leaf', 'array', 'function']);

function printUsage() {
    console.log(`Usage: node scripts/compare-locale-strings.mjs --manifest <path> [--base-ref <git-ref> | --base-dir <path>] [--project-root <path>]

Compares working-tree locale values with a baseline after applying an explicit
move, split, fan-out, copy, retain, and approved-addition manifest.

Options:
  --manifest <path>       Manifest path, relative to the project root by default.
  --base-ref <git-ref>    Read baseline locales from a Git ref. Overrides manifest baselineRef.
  --base-dir <path>       Read baseline locales from a directory. Intended for focused tests.
  --project-root <path>   Working-tree project root. Defaults to the repository root.
  -h, --help              Show this help message.`);
}

function parseArgs(argv) {
    const options = {
        projectRoot: DEFAULT_PROJECT_ROOT,
        manifestPath: null,
        baseRef: null,
        baseDir: null,
        help: false
    };

    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index];
        if (arg === '-h' || arg === '--help') {
            options.help = true;
            continue;
        }

        const [name, inlineValue] = arg.split('=', 2);
        if (name !== '--manifest' && name !== '--base-ref' && name !== '--base-dir' && name !== '--project-root') {
            throw new Error(`Unknown option: ${arg}`);
        }

        const value = inlineValue ?? argv[index + 1];
        if (!value) {
            throw new Error(`Missing value for ${name}.`);
        }
        if (inlineValue === undefined) {
            index++;
        }

        if (name === '--manifest') {
            options.manifestPath = value;
        } else if (name === '--base-ref') {
            options.baseRef = value;
        } else if (name === '--base-dir') {
            options.baseDir = path.resolve(value);
        } else {
            options.projectRoot = path.resolve(value);
        }
    }

    if (!options.help && !options.manifestPath) {
        throw new Error('Missing required --manifest path.');
    }
    if (options.baseRef && options.baseDir) {
        throw new Error('Use either --base-ref or --base-dir, not both.');
    }

    return options;
}

function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(value, label) {
    if (typeof value !== 'string' || value.length === 0) {
        throw new Error(`${label} must be a non-empty string.`);
    }
    return value;
}

function requireStringArray(value, label, minimumLength = 0) {
    if (!Array.isArray(value) || value.length < minimumLength || value.some(item => typeof item !== 'string' || item.length === 0)) {
        throw new Error(`${label} must be an array of at least ${minimumLength} non-empty string(s).`);
    }
    return value;
}

function normalizeManifestPath(value, label) {
    const normalized = requireString(value, label).replace(/^strings\./, '');
    if (normalized.startsWith('.') || normalized.endsWith('.') || normalized.includes('..')) {
        throw new Error(`${label} is not a valid localization path: ${value}`);
    }
    return normalized;
}

function parseManifest(rawManifest) {
    if (!isRecord(rawManifest)) {
        throw new Error('Manifest root must be an object.');
    }
    if (rawManifest.schemaVersion !== 1) {
        throw new Error('Manifest schemaVersion must be 1.');
    }

    const scopePrefixes = requireStringArray(rawManifest.scopePrefixes, 'manifest.scopePrefixes', 1).map((value, index) =>
        normalizeManifestPath(value, `manifest.scopePrefixes[${index}]`)
    );
    const operationsValue = rawManifest.operations ?? [];
    if (!Array.isArray(operationsValue)) {
        throw new Error('manifest.operations must be an array.');
    }

    const operationSources = new Set();
    const operations = operationsValue.map((value, index) => {
        if (!isRecord(value)) {
            throw new Error(`manifest.operations[${index}] must be an object.`);
        }
        const kind = requireString(value.kind, `manifest.operations[${index}].kind`);
        if (!OPERATION_KINDS.has(kind)) {
            throw new Error(`manifest.operations[${index}].kind must be move, split, fanOut, or copy.`);
        }
        const source = normalizeManifestPath(value.source, `manifest.operations[${index}].source`);
        const minimumTargets = kind === 'fanOut' ? 2 : 1;
        const targets = requireStringArray(value.targets, `manifest.operations[${index}].targets`, minimumTargets).map(
            (target, targetIndex) => normalizeManifestPath(target, `manifest.operations[${index}].targets[${targetIndex}]`)
        );
        if ((kind === 'move' || kind === 'split') && targets.length !== 1) {
            throw new Error(`manifest.operations[${index}] ${kind} operation must have exactly one target.`);
        }
        if (new Set(targets).size !== targets.length) {
            throw new Error(`manifest.operations[${index}] contains duplicate targets.`);
        }
        if (operationSources.has(source)) {
            throw new Error(`Manifest contains duplicate operation source: ${source}`);
        }
        operationSources.add(source);
        return { kind, source, targets };
    });

    const retainsValue = rawManifest.retains ?? [];
    const retains = requireStringArray(retainsValue, 'manifest.retains').map((value, index) =>
        normalizeManifestPath(value, `manifest.retains[${index}]`)
    );
    if (new Set(retains).size !== retains.length) {
        throw new Error('manifest.retains contains duplicate paths.');
    }
    for (const retainedPath of retains) {
        if (operationSources.has(retainedPath)) {
            throw new Error(`Manifest path is both an operation source and a retain: ${retainedPath}`);
        }
    }

    const additionsValue = rawManifest.approvedAdditions ?? [];
    if (!Array.isArray(additionsValue)) {
        throw new Error('manifest.approvedAdditions must be an array.');
    }
    const additionPaths = new Set();
    const approvedAdditions = additionsValue.map((value, index) => {
        if (!isRecord(value)) {
            throw new Error(`manifest.approvedAdditions[${index}] must be an object.`);
        }
        const additionPath = normalizeManifestPath(value.path, `manifest.approvedAdditions[${index}].path`);
        if (additionPaths.has(additionPath)) {
            throw new Error(`manifest.approvedAdditions contains duplicate path: ${additionPath}`);
        }
        additionPaths.add(additionPath);

        let kind = null;
        if (value.kind !== undefined) {
            kind = requireString(value.kind, `manifest.approvedAdditions[${index}].kind`);
            if (!VALUE_KINDS.has(kind)) {
                throw new Error(`manifest.approvedAdditions[${index}].kind must be leaf, array, or function.`);
            }
        }
        const placeholders =
            value.placeholders === undefined
                ? null
                : requireStringArray(value.placeholders, `manifest.approvedAdditions[${index}].placeholders`).slice().sort();
        return { path: additionPath, kind, placeholders };
    });

    const baselineRef = rawManifest.baselineRef === undefined ? null : requireString(rawManifest.baselineRef, 'manifest.baselineRef');
    const semanticReview =
        rawManifest.semanticReview === undefined ? null : requireString(rawManifest.semanticReview, 'manifest.semanticReview');

    return { baselineRef, scopePrefixes, operations, retains, approvedAdditions, semanticReview };
}

function getPropertyName(name) {
    if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
        return name.text;
    }
    return null;
}

function findExportedStringsObject(sourceFile) {
    for (const statement of sourceFile.statements) {
        if (!ts.isVariableStatement(statement)) {
            continue;
        }
        const isExported = statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword);
        if (!isExported) {
            continue;
        }
        for (const declaration of statement.declarationList.declarations) {
            if (
                ts.isIdentifier(declaration.name) &&
                declaration.name.text.startsWith('STRINGS_') &&
                declaration.initializer &&
                ts.isObjectLiteralExpression(declaration.initializer)
            ) {
                return declaration.initializer;
            }
        }
    }
    throw new Error(`No exported STRINGS_* object literal found in ${sourceFile.fileName}`);
}

function collectPlaceholders(node) {
    const placeholders = [];

    function collectFromText(text) {
        let match = PLACEHOLDER_REGEX.exec(text);
        while (match) {
            placeholders.push(match[1]);
            match = PLACEHOLDER_REGEX.exec(text);
        }
        PLACEHOLDER_REGEX.lastIndex = 0;
    }

    function visit(current) {
        if (
            ts.isStringLiteral(current) ||
            ts.isNoSubstitutionTemplateLiteral(current) ||
            current.kind === ts.SyntaxKind.TemplateHead ||
            current.kind === ts.SyntaxKind.TemplateMiddle ||
            current.kind === ts.SyntaxKind.TemplateTail
        ) {
            collectFromText(current.text);
        }
        ts.forEachChild(current, visit);
    }

    visit(node);
    return placeholders.sort();
}

// Syntax-tree serialization ignores formatting and quote style while retaining operators,
// function signatures, template expressions, and translated literal values.
function serializeSyntaxNode(node, sourceFile) {
    if (
        ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        node.kind === ts.SyntaxKind.TemplateHead ||
        node.kind === ts.SyntaxKind.TemplateMiddle ||
        node.kind === ts.SyntaxKind.TemplateTail
    ) {
        return [node.kind, node.text];
    }
    if (ts.isIdentifier(node) || ts.isNumericLiteral(node)) {
        return [node.kind, node.text];
    }

    const children = node.getChildren(sourceFile);
    if (children.length === 0) {
        return [node.kind, node.getText(sourceFile)];
    }
    return [node.kind, children.map(child => serializeSyntaxNode(child, sourceFile))];
}

function canonicalizeExpression(expression, sourceFile) {
    return JSON.stringify(serializeSyntaxNode(expression, sourceFile));
}

function getValueKind(expression) {
    if (ts.isArrayLiteralExpression(expression)) {
        return 'array';
    }
    if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)) {
        return 'function';
    }
    return 'leaf';
}

function parseLocaleSource(source, localeLabel) {
    const sourceFile = ts.createSourceFile(localeLabel, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const stringsObject = findExportedStringsObject(sourceFile);
    const leaves = new Map();
    const nodes = new Set();

    function visitObject(objectLiteral, prefix) {
        for (const property of objectLiteral.properties) {
            if (!ts.isPropertyAssignment(property)) {
                throw new Error(`${localeLabel} contains an unsupported non-property assignment under ${prefix || '<root>'}.`);
            }
            const key = getPropertyName(property.name);
            if (!key) {
                throw new Error(`${localeLabel} contains an unsupported computed localization key under ${prefix || '<root>'}.`);
            }
            const keyPath = prefix ? `${prefix}.${key}` : key;
            if (nodes.has(keyPath)) {
                throw new Error(`${localeLabel} contains duplicate localization path: ${keyPath}`);
            }
            nodes.add(keyPath);

            if (ts.isObjectLiteralExpression(property.initializer)) {
                visitObject(property.initializer, keyPath);
                continue;
            }

            leaves.set(keyPath, {
                kind: getValueKind(property.initializer),
                value: canonicalizeExpression(property.initializer, sourceFile),
                placeholders: collectPlaceholders(property.initializer)
            });
        }
    }

    visitObject(stringsObject, '');
    return { leaves, nodes };
}

function isAtOrBelow(candidate, prefix) {
    return candidate === prefix || candidate.startsWith(`${prefix}.`);
}

function isInScope(candidate, scopePrefixes) {
    return scopePrefixes.some(prefix => isAtOrBelow(candidate, prefix));
}

function mapTargetPath(sourcePrefix, targetPrefix, baselinePath) {
    return `${targetPrefix}${baselinePath.slice(sourcePrefix.length)}`;
}

function createRules(manifest) {
    const rules = [
        ...manifest.operations.map(operation => ({ type: 'operation', source: operation.source, operation })),
        ...manifest.retains.map(source => ({ type: 'retain', source }))
    ];
    return rules.sort((left, right) => right.source.length - left.source.length || left.source.localeCompare(right.source));
}

function findRuleForPath(candidate, rules) {
    // A nested alias move must override its enclosing item move, while all other leaves continue
    // to inherit the enclosing rule. Exact duplicate sources are rejected while parsing the manifest.
    const matches = rules.filter(rule => isAtOrBelow(candidate, rule.source));
    if (matches.length === 0) {
        return null;
    }
    const mostSpecificLength = matches[0].source.length;
    const mostSpecific = matches.filter(rule => rule.source.length === mostSpecificLength);
    if (mostSpecific.length !== 1) {
        throw new Error(
            `Manifest has ambiguous equally specific rules for ${candidate}: ${mostSpecific.map(rule => rule.source).join(', ')}`
        );
    }
    return mostSpecific[0];
}

function getExpectedTargets(baselinePath, rule) {
    if (!rule || rule.type === 'retain') {
        return [baselinePath];
    }
    const operationTargets = rule.operation.targets.map(target => mapTargetPath(rule.source, target, baselinePath));
    // Copies produce the new target without removing the source path.
    return rule.operation.kind === 'copy' ? [baselinePath, ...operationTargets] : operationTargets;
}

function buildExpectedLeaves(localeLabel, baselineLocale, manifest, rules) {
    const expected = new Map();
    const matchedRules = new Set();
    const errors = [];

    for (const [baselinePath, value] of baselineLocale.leaves) {
        const rule = findRuleForPath(baselinePath, rules);
        if (rule) {
            matchedRules.add(rule.source);
        } else if (isInScope(baselinePath, manifest.scopePrefixes)) {
            errors.push(`${localeLabel}: baseline path is not mapped or retained: ${baselinePath}`);
            continue;
        }

        // Paths outside the declared refactor scope are implicit identity mappings. Within scope,
        // every leaf must be covered explicitly so a missed settings key cannot pass silently.

        for (const targetPath of getExpectedTargets(baselinePath, rule)) {
            const existing = expected.get(targetPath);
            if (existing) {
                errors.push(`${localeLabel}: target collision at ${targetPath} from ${existing.sourcePath} and ${baselinePath}`);
                continue;
            }
            expected.set(targetPath, { sourcePath: baselinePath, value });
        }
    }

    return { expected, matchedRules, errors };
}

function valuesEqual(left, right) {
    return left === right;
}

function arraysEqual(left, right) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
}

function findApprovedAddition(candidate, approvedAdditions) {
    const matches = approvedAdditions.filter(addition => isAtOrBelow(candidate, addition.path));
    if (matches.length === 0) {
        return null;
    }
    matches.sort((left, right) => right.path.length - left.path.length);
    return matches[0];
}

function compareLocale(localeLabel, baselineLocale, workingLocale, manifest, rules) {
    const { expected, matchedRules, errors } = buildExpectedLeaves(localeLabel, baselineLocale, manifest, rules);
    const matchedAdditions = new Set();

    for (const [targetPath, expectation] of expected) {
        const actual = workingLocale.leaves.get(targetPath);
        if (!actual) {
            errors.push(`${localeLabel}: missing target ${targetPath} mapped from ${expectation.sourcePath}`);
            continue;
        }
        if (actual.kind !== expectation.value.kind) {
            errors.push(
                `${localeLabel}: value kind changed at ${targetPath} (${actual.kind} != ${expectation.value.kind}, source ${expectation.sourcePath})`
            );
            continue;
        }
        if (!valuesEqual(actual.value, expectation.value.value)) {
            errors.push(`${localeLabel}: translated value changed at ${targetPath} (source ${expectation.sourcePath})`);
        }
        if (!arraysEqual(actual.placeholders, expectation.value.placeholders)) {
            errors.push(
                `${localeLabel}: placeholders changed at ${targetPath} (${actual.placeholders.join(', ')} != ${expectation.value.placeholders.join(', ')})`
            );
        }
    }

    for (const [workingPath, value] of workingLocale.leaves) {
        if (expected.has(workingPath)) {
            continue;
        }
        const addition = findApprovedAddition(workingPath, manifest.approvedAdditions);
        if (!addition) {
            errors.push(`${localeLabel}: unapproved new path: ${workingPath}`);
            continue;
        }
        matchedAdditions.add(addition.path);
        if (addition.kind && addition.kind !== value.kind) {
            errors.push(`${localeLabel}: approved addition ${workingPath} has kind ${value.kind}, expected ${addition.kind}`);
        }
        if (addition.placeholders && !arraysEqual(addition.placeholders, value.placeholders)) {
            errors.push(
                `${localeLabel}: approved addition ${workingPath} has placeholders ${value.placeholders.join(', ')}, expected ${addition.placeholders.join(', ')}`
            );
        }
    }

    return { expectedCount: expected.size, matchedRules, matchedAdditions, errors };
}

async function readJson(filePath, label) {
    let source;
    try {
        source = await fs.readFile(filePath, 'utf8');
    } catch (error) {
        throw new Error(`Could not read ${label} at ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
    try {
        return JSON.parse(source);
    } catch (error) {
        throw new Error(`Could not parse ${label} at ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

async function listLocaleFiles(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    return entries
        .filter(entry => entry.isFile() && entry.name.endsWith('.ts'))
        .map(entry => entry.name)
        .sort((left, right) => left.localeCompare(right));
}

async function loadWorkingLocales(projectRoot) {
    const localeDir = path.join(projectRoot, LOCALES_RELATIVE_DIR);
    const files = await listLocaleFiles(localeDir);
    const locales = new Map();
    for (const file of files) {
        const source = await fs.readFile(path.join(localeDir, file), 'utf8');
        locales.set(file, parseLocaleSource(source, file));
    }
    return locales;
}

async function loadBaselineLocalesFromDirectory(baseDir) {
    const candidateLocaleDir = path.join(baseDir, LOCALES_RELATIVE_DIR);
    let localeDir = candidateLocaleDir;
    try {
        await fs.access(candidateLocaleDir);
    } catch {
        // Fixture tests may point directly at a locale directory instead of a project root.
        localeDir = baseDir;
    }
    const files = await listLocaleFiles(localeDir);
    const locales = new Map();
    for (const file of files) {
        const source = await fs.readFile(path.join(localeDir, file), 'utf8');
        locales.set(file, parseLocaleSource(source, `baseline:${file}`));
    }
    return locales;
}

async function loadBaselineLocalesFromGit(projectRoot, baseRef) {
    const localePath = LOCALES_RELATIVE_DIR.split(path.sep).join('/');
    let stdout;
    try {
        ({ stdout } = await execFileAsync('git', ['ls-tree', '-r', '--name-only', baseRef, '--', localePath], {
            cwd: projectRoot,
            encoding: 'utf8',
            maxBuffer: 10 * 1024 * 1024
        }));
    } catch (error) {
        throw new Error(`Could not list baseline locales at ${baseRef}: ${error instanceof Error ? error.message : String(error)}`);
    }

    const files = String(stdout)
        .split(/\r?\n/)
        .filter(value => value.endsWith('.ts'))
        .map(value => path.posix.basename(value))
        .sort((left, right) => left.localeCompare(right));
    if (files.length === 0) {
        throw new Error(`No baseline locale files found at ${baseRef}:${localePath}`);
    }

    const locales = new Map();
    for (const file of files) {
        const gitPath = `${localePath}/${file}`;
        let source;
        try {
            ({ stdout: source } = await execFileAsync('git', ['show', `${baseRef}:${gitPath}`], {
                cwd: projectRoot,
                encoding: 'utf8',
                maxBuffer: 20 * 1024 * 1024
            }));
        } catch (error) {
            throw new Error(`Could not read baseline locale ${gitPath}: ${error instanceof Error ? error.message : String(error)}`);
        }
        locales.set(file, parseLocaleSource(String(source), `baseline:${file}`));
    }
    return locales;
}

function compareLocaleFileSets(baselineLocales, workingLocales) {
    const baselineFiles = Array.from(baselineLocales.keys());
    const workingFiles = new Set(workingLocales.keys());
    const missing = baselineFiles.filter(file => !workingFiles.has(file));
    const extra = Array.from(workingFiles).filter(file => !baselineLocales.has(file));
    const errors = [];
    if (missing.length > 0) {
        errors.push(`Missing working locale files: ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
        errors.push(`Unapproved working locale files: ${extra.join(', ')}`);
    }
    return errors;
}

function getSemanticReviewRows(rawReview) {
    if (!isRecord(rawReview) || rawReview.schemaVersion !== 1) {
        throw new Error('Semantic review schemaVersion must be 1.');
    }
    if (!Array.isArray(rawReview.items) || !Array.isArray(rawReview.nestedIdentifiers)) {
        throw new Error('Semantic review must contain items and nestedIdentifiers arrays.');
    }
    return { items: rawReview.items, nestedIdentifiers: rawReview.nestedIdentifiers };
}

function parseSemanticRow(value, label) {
    if (!isRecord(value)) {
        throw new Error(`${label} must be an object.`);
    }
    const source = normalizeManifestPath(value.source, `${label}.source`);
    const decision = requireString(value.decision, `${label}.decision`);
    if (decision !== 'rename' && decision !== 'retain') {
        throw new Error(`${label}.decision must be rename or retain.`);
    }

    let targets;
    if (value.target !== undefined && value.targets !== undefined) {
        throw new Error(`${label} must use either target or targets, not both.`);
    }
    if (value.targets !== undefined) {
        targets = requireStringArray(value.targets, `${label}.targets`, 1).map((target, index) =>
            normalizeManifestPath(target, `${label}.targets[${index}]`)
        );
    } else {
        targets = [normalizeManifestPath(value.target, `${label}.target`)];
    }
    if (new Set(targets).size !== targets.length) {
        throw new Error(`${label} contains duplicate targets.`);
    }
    return { source, targets, decision };
}

function getExpectedSemanticSources(englishLocale) {
    const itemSources = new Set();
    const nestedSources = new Set();
    for (const nodePath of englishLocale.nodes) {
        const segments = nodePath.split('.');
        if (segments[0] !== 'settings' || segments[1] !== 'items') {
            continue;
        }
        if (segments.length === 3) {
            itemSources.add(nodePath);
            continue;
        }
        if (segments.length === 5 && NESTED_IDENTIFIER_FAMILIES.has(segments[3])) {
            nestedSources.add(nodePath);
        }
    }
    return { itemSources, nestedSources };
}

function validateReviewCoverage(label, rows, expectedSources, seenSources, seenTargets) {
    const parsedRows = rows.map((row, index) => parseSemanticRow(row, `${label}[${index}]`));
    for (const row of parsedRows) {
        if (seenSources.has(row.source)) {
            throw new Error(`Semantic review contains duplicate source: ${row.source}`);
        }
        seenSources.add(row.source);
        for (const target of row.targets) {
            if (seenTargets.has(target)) {
                throw new Error(`Semantic review contains duplicate target: ${target}`);
            }
            seenTargets.add(target);
        }
    }

    const actualSources = new Set(parsedRows.map(row => row.source));
    const missing = Array.from(expectedSources).filter(source => !actualSources.has(source));
    const extra = Array.from(actualSources).filter(source => !expectedSources.has(source));
    if (missing.length > 0 || extra.length > 0) {
        const details = [];
        if (missing.length > 0) {
            details.push(`missing ${missing.join(', ')}`);
        }
        if (extra.length > 0) {
            details.push(`extra ${extra.join(', ')}`);
        }
        throw new Error(`Semantic review ${label} coverage mismatch: ${details.join('; ')}`);
    }
    return parsedRows;
}

function validateSemanticRowMapping(row, englishLocale, manifest, rules) {
    const sourceLeaves = Array.from(englishLocale.leaves.keys()).filter(leafPath => isAtOrBelow(leafPath, row.source));
    if (sourceLeaves.length === 0) {
        throw new Error(`Semantic review source has no baseline leaves: ${row.source}`);
    }

    const projections = sourceLeaves.map(sourceLeaf => {
        const rule = findRuleForPath(sourceLeaf, rules);
        return { sourceLeaf, targets: getExpectedTargets(sourceLeaf, rule) };
    });
    const producedTargets = projections.flatMap(projection => projection.targets);
    for (const projection of projections) {
        // Each source leaf must reach the reviewed target. Auxiliary outputs are permitted because
        // a retained parent can contain a descendant copied into a page-owned group.
        if (!projection.targets.some(producedTarget => row.targets.some(target => isAtOrBelow(producedTarget, target)))) {
            throw new Error(
                `Semantic review target mismatch for ${row.source}: ${projection.sourceLeaf} does not map under ${row.targets.join(', ')}`
            );
        }
    }
    for (const target of row.targets) {
        if (!producedTargets.some(producedTarget => isAtOrBelow(producedTarget, target))) {
            throw new Error(`Semantic review target ${target} receives no values from ${row.source}`);
        }
    }

    const sourceAlias = row.source.slice(row.source.lastIndexOf('.') + 1);
    const targetAliases = row.targets.map(target => target.slice(target.lastIndexOf('.') + 1));
    const expectedDecision = row.targets.length === 1 && targetAliases[0] === sourceAlias ? 'retain' : 'rename';
    if (row.decision !== expectedDecision) {
        throw new Error(
            `Semantic review decision mismatch for ${row.source}: ${row.decision} does not match target alias decision ${expectedDecision}`
        );
    }

    if (!isInScope(row.source, manifest.scopePrefixes)) {
        throw new Error(`Semantic review source is outside manifest scope: ${row.source}`);
    }
}

async function validateSemanticReview(projectRoot, reviewPathValue, englishLocale, manifest, rules) {
    if (!reviewPathValue) {
        return 0;
    }
    const reviewPath = path.isAbsolute(reviewPathValue) ? reviewPathValue : path.join(projectRoot, reviewPathValue);
    const rawReview = await readJson(reviewPath, 'semantic review');
    const review = getSemanticReviewRows(rawReview);
    const expectedSources = getExpectedSemanticSources(englishLocale);
    const seenSources = new Set();
    const seenTargets = new Set();
    const itemRows = validateReviewCoverage('items', review.items, expectedSources.itemSources, seenSources, seenTargets);
    const nestedRows = validateReviewCoverage(
        'nestedIdentifiers',
        review.nestedIdentifiers,
        expectedSources.nestedSources,
        seenSources,
        seenTargets
    );
    for (const row of [...itemRows, ...nestedRows]) {
        validateSemanticRowMapping(row, englishLocale, manifest, rules);
    }
    return itemRows.length + nestedRows.length;
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
        printUsage();
        return;
    }

    const manifestPath = path.isAbsolute(options.manifestPath)
        ? options.manifestPath
        : path.join(options.projectRoot, options.manifestPath);
    const manifest = parseManifest(await readJson(manifestPath, 'locale comparison manifest'));
    const baseRef = options.baseRef ?? manifest.baselineRef;
    if (!options.baseDir && !baseRef) {
        throw new Error('Provide --base-ref, --base-dir, or manifest.baselineRef.');
    }

    const [baselineLocales, workingLocales] = await Promise.all([
        options.baseDir ? loadBaselineLocalesFromDirectory(options.baseDir) : loadBaselineLocalesFromGit(options.projectRoot, baseRef),
        loadWorkingLocales(options.projectRoot)
    ]);
    const fileSetErrors = compareLocaleFileSets(baselineLocales, workingLocales);
    if (fileSetErrors.length > 0) {
        throw new Error(`Locale comparison failed:\n- ${fileSetErrors.join('\n- ')}`);
    }

    const rules = createRules(manifest);
    const allErrors = [];
    const globallyMatchedRules = new Set();
    const globallyMatchedAdditions = new Set();
    let expectedLeafCount = 0;

    for (const [localeFile, baselineLocale] of baselineLocales) {
        const workingLocale = workingLocales.get(localeFile);
        const result = compareLocale(localeFile, baselineLocale, workingLocale, manifest, rules);
        expectedLeafCount += result.expectedCount;
        result.matchedRules.forEach(value => globallyMatchedRules.add(value));
        result.matchedAdditions.forEach(value => globallyMatchedAdditions.add(value));
        allErrors.push(...result.errors);
    }

    for (const rule of rules) {
        if (!globallyMatchedRules.has(rule.source)) {
            allErrors.push(`Manifest rule matches no baseline leaves: ${rule.source}`);
        }
    }
    for (const addition of manifest.approvedAdditions) {
        if (!globallyMatchedAdditions.has(addition.path)) {
            allErrors.push(`Approved addition matches no working leaves: ${addition.path}`);
        }
    }

    const englishLocale = baselineLocales.get('en.ts');
    if (!englishLocale) {
        allErrors.push('Baseline locales do not contain en.ts.');
    }

    let semanticReviewCount = 0;
    if (englishLocale && manifest.semanticReview) {
        try {
            semanticReviewCount = await validateSemanticReview(
                options.projectRoot,
                manifest.semanticReview,
                englishLocale,
                manifest,
                rules
            );
        } catch (error) {
            allErrors.push(error instanceof Error ? error.message : String(error));
        }
    }

    if (allErrors.length > 0) {
        throw new Error(`Locale comparison failed:\n- ${allErrors.join('\n- ')}`);
    }

    const baselineLabel = options.baseDir ? options.baseDir : baseRef;
    console.log('Locale string baseline comparison');
    console.log('');
    console.log(`Baseline: ${baselineLabel}`);
    console.log(`Manifest: ${path.relative(options.projectRoot, manifestPath) || path.basename(manifestPath)}`);
    console.log(`Locales: ${baselineLocales.size}`);
    console.log(`Expected leaves: ${expectedLeafCount}`);
    console.log(`Operations: ${manifest.operations.length}`);
    console.log(`Retains: ${manifest.retains.length}`);
    console.log(`Approved additions: ${manifest.approvedAdditions.length}`);
    if (manifest.semanticReview) {
        console.log(`Semantic review decisions: ${semanticReviewCount}`);
    }
    console.log('');
    console.log('Locale values: OK');
}

main().catch(error => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
