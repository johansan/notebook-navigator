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

import { describe, expect, it } from 'vitest';
import { buildPropertySearchEvidence, resolvePropertyDisplayText } from '../../src/utils/propertyUtils';

describe('propertyUtils', () => {
    it('uses wiki link labels as property display text', () => {
        expect(resolvePropertyDisplayText('[[Projects/Alpha|Project Alpha]]')).toBe('Project Alpha');
    });

    it('uses markdown link labels as property display text', () => {
        expect(resolvePropertyDisplayText('[Project Alpha](https://example.com/projects/alpha)')).toBe('Project Alpha');
    });

    it('trims plain property display text', () => {
        expect(resolvePropertyDisplayText('  Waiting for review  ')).toBe('Waiting for review');
    });

    it('groups property search evidence and caps displayed values', () => {
        const matches = ['Alpha', 'Beta', 'Gamma', 'Delta'].map(displayValue => ({
            clause: { key: 'status', value: displayValue.toLowerCase() },
            propertyKey: 'Status',
            rawValue: displayValue,
            valueKind: 'string' as const,
            displayValue
        }));

        expect(buildPropertySearchEvidence(matches)).toEqual({
            groups: [
                {
                    propertyKey: 'Status',
                    foldedKeyTerms: [],
                    values: [
                        { displayValue: 'Alpha', foldedTerms: ['alpha'] },
                        { displayValue: 'Beta', foldedTerms: ['beta'] },
                        { displayValue: 'Gamma', foldedTerms: ['gamma'] }
                    ],
                    hiddenValueCount: 1
                }
            ],
            hiddenGroupCount: 0
        });
    });

    it('keeps key-only property evidence without fabricating a value highlight', () => {
        expect(
            buildPropertySearchEvidence([
                {
                    clause: { key: 'archived', value: null },
                    propertyKey: 'Archived',
                    rawValue: '',
                    displayValue: ''
                }
            ])
        ).toEqual({
            groups: [{ propertyKey: 'Archived', foldedKeyTerms: ['archived'], values: [], hiddenValueCount: 0 }],
            hiddenGroupCount: 0
        });
    });

    it('caps property groups retained for file-row evidence', () => {
        const matches = ['Alpha', 'Beta', 'Gamma', 'Delta'].map(propertyKey => ({
            clause: { key: propertyKey.toLowerCase(), value: null },
            propertyKey,
            rawValue: 'value',
            displayValue: 'value'
        }));

        expect(buildPropertySearchEvidence(matches)).toMatchObject({
            groups: [{ propertyKey: 'Alpha' }, { propertyKey: 'Beta' }, { propertyKey: 'Gamma' }],
            hiddenGroupCount: 1
        });
    });
});
