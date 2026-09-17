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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import prettier from 'prettier';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Extracts data without executing locale source; formatting functions remain local TypeScript. */
export function extractLanguage(source, filename) {
    const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const formatters = {};
    function read(node, keys) {
        if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
        if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
            formatters[keys.join('.')] = node.getText(file);
            return null;
        }
        if (ts.isArrayLiteralExpression(node)) return node.elements.map((child, index) => read(child, [...keys, String(index)]));
        if (ts.isObjectLiteralExpression(node)) {
            const result = Object.create(null);
            for (const property of node.properties) {
                if (
                    !ts.isPropertyAssignment(property) ||
                    !(ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) || ts.isNumericLiteral(property.name))
                ) {
                    throw new Error(`Unsupported locale property in ${filename}`);
                }
                const key = property.name.text;
                if (Object.hasOwn(result, key)) throw new Error(`Duplicate locale key: ${filename}:${[...keys, key].join('.')}`);
                result[key] = read(property.initializer, [...keys, key]);
            }
            return result;
        }
        throw new Error(`Unsupported locale value: ${filename}:${keys.join('.')}`);
    }
    for (const statement of file.statements) {
        if (!ts.isVariableStatement(statement)) continue;
        for (const declaration of statement.declarationList.declarations) {
            if (ts.isIdentifier(declaration.name) && declaration.name.text.startsWith('STRINGS_') && declaration.initializer) {
                return { data: read(declaration.initializer, []), formatters };
            }
        }
    }
    throw new Error(`Missing STRINGS export in ${filename}`);
}

function shape(value) {
    if (value === null || typeof value === 'string') return typeof value;
    if (Array.isArray(value)) return value.map(shape);
    return Object.fromEntries(
        Object.keys(value)
            .sort()
            .map(key => [key, shape(value[key])])
    );
}

async function writeChanged(filename, contents) {
    if ((await fs.readFile(filename, 'utf8').catch(() => null)) !== contents) await fs.writeFile(filename, contents);
}

/** Emits the release asset and the small formatter/bootstrap module consumed by the plugin. */
export async function buildLanguages(root = projectRoot) {
    const directory = path.join(root, 'src/i18n/locales');
    const files = (await fs.readdir(directory)).filter(file => file.endsWith('.ts')).sort();
    const languages = {};
    for (const file of files) languages[file.slice(0, -3)] = extractLanguage(await fs.readFile(path.join(directory, file), 'utf8'), file);
    const expectedShape = JSON.stringify(shape(languages.en.data));
    for (const [locale, language] of Object.entries(languages)) {
        if (JSON.stringify(shape(language.data)) !== expectedShape) throw new Error(`Locale shape mismatch: ${locale}`);
    }
    const locales = Object.fromEntries(Object.entries(languages).map(([locale, language]) => [locale, language.data]));
    const id = createHash('sha256').update(JSON.stringify(locales)).digest('hex');
    const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8'));
    const pack = { version: manifest.version, id, locales };
    const header = (await fs.readFile(path.join(directory, 'en.ts'), 'utf8')).split('*/')[0] + '*/\n';
    const metadata = Object.entries(languages)
        .map(
            ([locale, { data, formatters }]) =>
                `${JSON.stringify(locale)}: { dateFormat: ${JSON.stringify(data.settings.items.dateFormat.placeholder)},
        timeFormat: ${JSON.stringify(data.settings.items.timeFormat.placeholder)},
        defaultVaultProfileName: ${JSON.stringify(data.settings.items.vaultProfiles.defaultName)},
        bootstrap: ${JSON.stringify(data.language)},
        formatters: {${Object.entries(formatters)
            .map(([key, expression]) => `${JSON.stringify(key)}: ${expression}`)
            .join(',\n')}} }`
        )
        .join(',\n');
    const code = `${header}\n// Generated by scripts/build-languages.mjs. Do not edit.\n
        export const LANGUAGE_DATA_ID = ${JSON.stringify(id)};
        export const LANGUAGE_METADATA = {${metadata}};
        export type LanguageCode = keyof typeof LANGUAGE_METADATA;
    `;
    const formatted = await prettier.format(code, {
        ...(await prettier.resolveConfig(path.join(root, '.prettierrc.json'))),
        parser: 'typescript'
    });
    await writeChanged(path.join(root, 'src/i18n/localeMetadata.ts'), formatted);
    await writeChanged(path.join(root, 'languages.json'), JSON.stringify(pack));
    return files.map(file => path.join(directory, file));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    await buildLanguages();
    console.log('Generated language pack and bundled language formatters');
}
